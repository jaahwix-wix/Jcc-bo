/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabaseClient, testSupabaseConnection } from '../supabase';

/**
 * Normalizes document IDs to ensure safety across query operations.
 */
export function cleanDocId(id: string): string {
  if (!id) return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return String(id).replace(/[\/\s#\?\[\]]+/g, '_');
}

/**
 * Compresses an image base64 data URL to keep payload sizes lean and performant.
 */
export async function compressImageBase64(
  dataUrl: string, 
  maxDim = 320, 
  quality = 0.75
): Promise<string> {
  if (typeof window === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }
  // If already under 120KB, no need to re-encode
  if (dataUrl.length < 120000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

/**
 * Sanitizes an object for Supabase insertion, converting undefined to null.
 */
export function sanitizeForSupabase<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForSupabase) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForSupabase(value);
      } else {
        clean[key] = null;
      }
    }
    return clean as T;
  }
  return obj;
}

/**
 * Map collection names to Supabase tables.
 */
const TABLE_MAP: Record<string, string> = {
  students: 'students',
  academic_records: 'academic_records',
  fee_ledgers: 'fee_ledgers',
  exam_preps: 'exam_preps',
  teachers: 'teachers',
  assignments: 'assignments',
  submissions: 'submissions',
  announcements: 'announcements',
  class_notices: 'class_notices',
  buses: 'buses',
  bus_assignments: 'bus_assignments',
  daily_attendance: 'daily_attendance',
  incidents: 'incidents',
  library_books: 'library_books',
  library_checkouts: 'library_checkouts',
  reference_snapshots: 'reference_snapshots',
};

/**
 * Synchronizes a Supabase collection in real-time with local state and localStorage cache.
 * Returns an unsubscribe function to cancel listeners.
 */
export function syncSupabaseCollection<T extends { id?: string; studentId?: string }>(
  collectionName: string,
  localStorageKey: string,
  onData: (items: T[]) => void,
  fallbackInitialData: T[] = []
): () => void {
  // 1. Immediately read from localStorage cache for instant zero-latency UI display
  let hasLoadedCache = false;
  try {
    const cached = localStorage.getItem(localStorageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onData(parsed);
        hasLoadedCache = true;
      }
    }
  } catch (err) {
    console.warn(`[SupabaseSync] Failed reading cache for ${collectionName}:`, err);
  }

  // If no cache, provide initial fallback
  if (!hasLoadedCache && fallbackInitialData.length > 0) {
    onData(fallbackInitialData);
  }

  const tableName = TABLE_MAP[collectionName] || collectionName;
  const client = getSupabaseClient();
  let isSubscribed = true;

  // 2. Fetch from Supabase Table
  async function fetchFromSupabase() {
    if (!client) return;
    try {
      const { data, error } = await client
        .from(tableName)
        .select('*');

      if (!isSubscribed) return;

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const items: T[] = data.map((row: any) => {
            // Support both direct column rows or nested payload
            if (row.payload && typeof row.payload === 'object') {
              return { ...row.payload, id: row.id || row.payload.id };
            }
            return row;
          });

          onData(items);
          try {
            localStorage.setItem(localStorageKey, JSON.stringify(items));
          } catch (e) {
            console.warn(`[SupabaseSync] Failed updating cache for ${collectionName}:`, e);
          }
        }
      } else if (error) {
        // Table may not yet be provisioned or schema mismatch
        console.info(`[SupabaseSync] Note for ${tableName}:`, error.message);
      }
    } catch (err) {
      console.warn(`[SupabaseSync] Error fetching from ${tableName}:`, err);
    }
  }

  fetchFromSupabase();

  // 3. Setup Supabase Realtime Subscription
  let channel: any = null;
  try {
    if (client) {
      channel = client
        .channel(`public:${tableName}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          () => {
            if (isSubscribed) {
              fetchFromSupabase();
            }
          }
        )
        .subscribe();
    }
  } catch (err) {
    console.warn(`[SupabaseSync] Realtime subscription not available for ${tableName}:`, err);
  }

  // 4. Return clean unsubscribe callback
  return () => {
    isSubscribed = false;
    if (channel && client) {
      try {
        client.removeChannel(channel);
      } catch (e) {
        // Safe tear down
      }
    }
  };
}

/**
 * Saves a single document to Supabase and updates local cache.
 */
export async function saveToSupabase<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<boolean> {
  const safeDocId = cleanDocId(docId);
  const tableName = TABLE_MAP[collectionName] || collectionName;
  const localStorageKey = `sma_${collectionName}`;

  try {
    const payload: Record<string, any> = { ...data };
    if (typeof payload.profileImage === 'string' && payload.profileImage.startsWith('data:image')) {
      payload.profileImage = await compressImageBase64(payload.profileImage, 320, 0.75);
    }

    if (!payload.id) {
      payload.id = safeDocId;
    }

    // Update local cache immediately
    try {
      const cached = localStorage.getItem(localStorageKey);
      let list: any[] = cached ? JSON.parse(cached) : [];
      const index = list.findIndex(item => (item.id === safeDocId) || (item.studentId === safeDocId));
      if (index >= 0) {
        list[index] = { ...list[index], ...payload };
      } else {
        list.unshift(payload);
      }
      localStorage.setItem(localStorageKey, JSON.stringify(list));
    } catch (e) {
      console.warn(`[SupabaseSync] Local cache write warning:`, e);
    }

    // Upsert to Supabase
    const client = getSupabaseClient();
    if (client) {
      const sanitized = sanitizeForSupabase(payload);
      const { error } = await client
        .from(tableName)
        .upsert(sanitized, { onConflict: 'id' });

      if (error) {
        console.warn(`[SupabaseSync] Supabase save note for ${tableName} (${safeDocId}):`, error.message);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sma_supabase_saved', { 
        detail: { collection: collectionName, id: safeDocId } 
      }));
    }

    return true;
  } catch (error) {
    console.error(`[SupabaseSync] Failed saving document ${safeDocId} to ${collectionName}:`, error);
    return false;
  }
}

/**
 * Deletes a single document from Supabase and local cache.
 */
export async function deleteFromSupabase(
  collectionName: string,
  docId: string
): Promise<boolean> {
  const safeDocId = cleanDocId(docId);
  const tableName = TABLE_MAP[collectionName] || collectionName;
  const localStorageKey = `sma_${collectionName}`;

  try {
    // 1. Remove from local cache
    try {
      const cached = localStorage.getItem(localStorageKey);
      if (cached) {
        let list: any[] = JSON.parse(cached);
        list = list.filter(item => item.id !== safeDocId && item.studentId !== safeDocId);
        localStorage.setItem(localStorageKey, JSON.stringify(list));
      }
    } catch (e) {
      console.warn(`[SupabaseSync] Local cache delete warning:`, e);
    }

    // 2. Delete from Supabase
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client
        .from(tableName)
        .delete()
        .eq('id', safeDocId);

      if (error) {
        // Also try studentId if column exists
        await client.from(tableName).delete().eq('studentId', safeDocId);
      }
    }

    return true;
  } catch (error) {
    console.warn(`[SupabaseSync] Delete warning for ${safeDocId} in ${collectionName}:`, error);
    return false;
  }
}

/**
 * Batch saves multiple documents to Supabase and updates local cache.
 */
export async function batchSaveToSupabase<T extends Record<string, any>>(
  collectionName: string,
  items: T[],
  idField: keyof T = 'id'
): Promise<boolean> {
  const tableName = TABLE_MAP[collectionName] || collectionName;
  const localStorageKey = `sma_${collectionName}`;

  try {
    // 1. Update local cache
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(items));
    } catch (e) {
      console.warn(`[SupabaseSync] Batch local cache warning:`, e);
    }

    // 2. Upsert to Supabase
    const client = getSupabaseClient();
    if (client && items.length > 0) {
      const sanitizedRows: any[] = [];
      for (const item of items) {
        const payload: Record<string, any> = { ...item };
        if (typeof payload.profileImage === 'string' && payload.profileImage.startsWith('data:image')) {
          payload.profileImage = await compressImageBase64(payload.profileImage, 320, 0.75);
        }
        if (!payload.id) {
          payload.id = (payload as any)[idField] || (payload as any).studentId || cleanDocId('');
        }
        sanitizedRows.push(sanitizeForSupabase(payload));
      }

      const { error } = await client
        .from(tableName)
        .upsert(sanitizedRows, { onConflict: 'id' });

      if (error) {
        console.warn(`[SupabaseSync] Batch save notice for ${tableName}:`, error.message);
      }
    }

    return true;
  } catch (error) {
    console.warn(`[SupabaseSync] Batch save failed for ${collectionName}:`, error);
    return false;
  }
}

/**
 * Purges all records from a Supabase collection and local cache.
 */
export async function clearSupabaseCollection(collectionName: string): Promise<boolean> {
  const tableName = TABLE_MAP[collectionName] || collectionName;
  const localStorageKey = `sma_${collectionName}`;

  try {
    localStorage.removeItem(localStorageKey);

    const client = getSupabaseClient();
    if (client) {
      await client.from(tableName).delete().neq('id', '___safe_purge_all___');
    }
    return true;
  } catch (error) {
    console.warn(`[SupabaseSync] Clear collection warning for ${collectionName}:`, error);
    return false;
  }
}

/**
 * Completely purges ALL school operational collections from Supabase & local cache.
 */
export async function clearAllSupabaseSchoolData(): Promise<void> {
  const collectionsToClear = [
    'students',
    'academic_records',
    'fee_ledgers',
    'exam_preps',
    'teachers',
    'assignments',
    'submissions',
    'announcements',
    'class_notices',
    'buses',
    'bus_assignments',
    'daily_attendance',
    'incidents',
    'library_books',
    'library_checkouts',
  ];

  await Promise.allSettled(
    collectionsToClear.map(col => clearSupabaseCollection(col))
  );
}

/**
 * Checks if Supabase backend is reachable and responsive.
 */
export async function checkSupabaseSyncStatus(): Promise<boolean> {
  const res = await testSupabaseConnection();
  return res.success;
}

export interface ReferenceSnapshot {
  id: string;
  title: string;
  notes?: string;
  savedAt: string;
  savedBy: string;
  metrics: {
    studentsCount: number;
    recordsCount: number;
    feesCount: number;
    examPrepsCount: number;
    teachersCount: number;
    libraryCount: number;
    totalDue?: number;
    totalCollected?: number;
    totalOutstanding?: number;
  };
  payload: {
    students: any[];
    records: any[];
    examPreps: any[];
    fees: any[];
    teachers?: any[];
    books?: any[];
    buses?: any[];
    notices?: any[];
  };
}

/**
 * Saves all current school records to Supabase across all core collections.
 */
export async function saveAllSchoolRecordsToSupabase(data: {
  students: any[];
  records: any[];
  examPreps: any[];
  fees: any[];
  teachers?: any[];
  books?: any[];
  buses?: any[];
  notices?: any[];
}): Promise<{
  success: boolean;
  counts: {
    students: number;
    records: number;
    fees: number;
    examPreps: number;
    teachers: number;
    books: number;
    buses: number;
    notices: number;
  };
}> {
  const counts = {
    students: 0,
    records: 0,
    fees: 0,
    examPreps: 0,
    teachers: 0,
    books: 0,
    buses: 0,
    notices: 0,
  };

  try {
    if (data.students && data.students.length > 0) {
      await batchSaveToSupabase('students', data.students, 'id');
      counts.students = data.students.length;
    }

    if (data.records && data.records.length > 0) {
      await batchSaveToSupabase('academic_records', data.records, 'studentId');
      counts.records = data.records.length;
    }

    if (data.fees && data.fees.length > 0) {
      await batchSaveToSupabase('fee_ledgers', data.fees, 'studentId');
      counts.fees = data.fees.length;
    }

    if (data.examPreps && data.examPreps.length > 0) {
      await batchSaveToSupabase('exam_preps', data.examPreps, 'id');
      counts.examPreps = data.examPreps.length;
    }

    if (data.teachers && data.teachers.length > 0) {
      await batchSaveToSupabase('teachers', data.teachers, 'id');
      counts.teachers = data.teachers.length;
    }

    if (data.books && data.books.length > 0) {
      await batchSaveToSupabase('library_books', data.books, 'id');
      counts.books = data.books.length;
    }

    if (data.buses && data.buses.length > 0) {
      await batchSaveToSupabase('buses', data.buses, 'id');
      counts.buses = data.buses.length;
    }

    if (data.notices && data.notices.length > 0) {
      await batchSaveToSupabase('class_notices', data.notices, 'id');
      counts.notices = data.notices.length;
    }

    return { success: true, counts };
  } catch (err) {
    console.error('[SupabaseSync] Failed saving all records to Supabase:', err);
    return { success: false, counts };
  }
}

/**
 * Creates and archives an immutable reference snapshot in Supabase & local storage.
 */
export async function createReferenceSnapshot(
  title: string,
  notes: string,
  savedBy: string,
  data: {
    students: any[];
    records: any[];
    examPreps: any[];
    fees: any[];
    teachers?: any[];
    books?: any[];
  }
): Promise<ReferenceSnapshot | null> {
  try {
    const snapshotId = `ref_${Date.now()}`;
    
    let totalDue = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    (data.fees || []).forEach(f => {
      [1, 2, 3].forEach(termNum => {
        const t = f?.terms?.[termNum];
        if (t) {
          totalDue += Number(t.totalDue) || 0;
          totalCollected += Number(t.paidAmount) || 0;
          totalOutstanding += Number(t.balance) || 0;
        }
      });
    });

    const snapshotDoc: ReferenceSnapshot = {
      id: snapshotId,
      title: title.trim() || `Reference Archive ${new Date().toLocaleDateString('en-GB')}`,
      notes: notes.trim() || 'Institutional database backup archived for historical reference uses in Supabase.',
      savedAt: new Date().toISOString(),
      savedBy: savedBy || 'Administrator (Jonathan Davis)',
      metrics: {
        studentsCount: data.students?.length || 0,
        recordsCount: data.records?.length || 0,
        feesCount: data.fees?.length || 0,
        examPrepsCount: data.examPreps?.length || 0,
        teachersCount: data.teachers?.length || 0,
        libraryCount: data.books?.length || 0,
        totalDue,
        totalCollected,
        totalOutstanding,
      },
      payload: {
        students: data.students || [],
        records: data.records || [],
        examPreps: data.examPreps || [],
        fees: data.fees || [],
        teachers: data.teachers || [],
        books: data.books || []
      }
    };

    // Save to local snapshots registry
    try {
      const cached = localStorage.getItem('sma_reference_snapshots');
      const list: ReferenceSnapshot[] = cached ? JSON.parse(cached) : [];
      list.unshift(snapshotDoc);
      localStorage.setItem('sma_reference_snapshots', JSON.stringify(list));
    } catch (e) {
      console.warn('Snapshot cache write note:', e);
    }

    // Save to Supabase table
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('reference_snapshots').upsert(sanitizeForSupabase(snapshotDoc));
      } catch (e) {
        console.warn('Supabase snapshot upsert note:', e);
      }
    }

    return snapshotDoc;
  } catch (err) {
    console.error('[SupabaseSync] Error creating reference snapshot:', err);
    return null;
  }
}

/**
 * Fetches all saved reference snapshots from Supabase and local storage.
 */
export async function fetchReferenceSnapshots(): Promise<ReferenceSnapshot[]> {
  const list: ReferenceSnapshot[] = [];

  // Read local snapshots first
  try {
    const cached = localStorage.getItem('sma_reference_snapshots');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        list.push(...parsed);
      }
    }
  } catch (err) {
    console.warn('[SupabaseSync] Local snapshots read error:', err);
  }

  // Also query Supabase if available
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('reference_snapshots')
        .select('*');

      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          if (!list.some(existing => existing.id === item.id)) {
            list.push(item);
          }
        });
      }
    } catch (err) {
      console.info('[SupabaseSync] Supabase snapshot fetch note:', err);
    }
  }

  // Sort latest first
  return list.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

/**
 * Deletes a reference snapshot document from Supabase and local storage.
 */
export async function deleteReferenceSnapshot(snapshotId: string): Promise<boolean> {
  try {
    // Delete from local cache
    try {
      const cached = localStorage.getItem('sma_reference_snapshots');
      if (cached) {
        let list: ReferenceSnapshot[] = JSON.parse(cached);
        list = list.filter(s => s.id !== snapshotId);
        localStorage.setItem('sma_reference_snapshots', JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Local snapshot delete error:', e);
    }

    // Delete from Supabase
    const client = getSupabaseClient();
    if (client) {
      await client.from('reference_snapshots').delete().eq('id', snapshotId);
    }
    return true;
  } catch (err) {
    console.warn('[SupabaseSync] Failed deleting reference snapshot:', err);
    return false;
  }
}
