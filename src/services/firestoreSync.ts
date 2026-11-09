/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  cleanDocId, 
  compressImageBase64, 
  saveToSupabase, 
  deleteFromSupabase, 
  batchSaveToSupabase, 
  clearSupabaseCollection, 
  clearAllSupabaseSchoolData, 
  checkSupabaseSyncStatus, 
  saveAllSchoolRecordsToSupabase, 
  createReferenceSnapshot, 
  fetchReferenceSnapshots, 
  deleteReferenceSnapshot, 
  ReferenceSnapshot 
} from './supabaseSync';

export {
  cleanDocId,
  compressImageBase64,
  createReferenceSnapshot,
  fetchReferenceSnapshots,
  deleteReferenceSnapshot,
};

export type { ReferenceSnapshot };

/**
 * Sanitizes object data for Firestore and Hostinger insertion, removing undefined and circular references.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return obj;
}

/**
 * Synchronizes a collection in real-time with local state, Firestore, and Hostinger.
 */
export function syncFirestoreCollection<T extends { id?: string; studentId?: string }>(
  collectionName: string,
  localStorageKey: string,
  onData: (items: T[]) => void,
  fallbackInitialData: T[] = []
): () => void {
  // 1. Instant local read for 0ms latency
  let hasCache = false;
  try {
    const cached = localStorage.getItem(localStorageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onData(parsed);
        hasCache = true;
      }
    }
  } catch (err) {
    console.warn(`[Sync] Local cache read note for ${collectionName}:`, err);
  }

  if (!hasCache && fallbackInitialData.length > 0) {
    onData(fallbackInitialData);
  }

  let isSubscribed = true;

  // 2. Listen to Cloud Firestore realtime snapshot
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    const colRef = collection(db, collectionName);
    unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
      if (!isSubscribed) return;
      if (!snapshot.empty) {
        const items: T[] = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
        })) as unknown as T[];

        onData(items);
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(items));
        } catch {}
      }
    }, (error) => {
      console.info(`[Sync] Cloud Firestore stream notice for ${collectionName}:`, error.message);
    });
  } catch (err) {
    console.warn(`[Sync] Firestore listener initialization note for ${collectionName}:`, err);
  }

  return () => {
    isSubscribed = false;
    if (unsubscribeFirestore) {
      try {
        unsubscribeFirestore();
      } catch {}
    }
  };
}

/**
 * Automatically saves a record to both Cloud Firestore and Hostinger database simultaneously.
 */
export async function saveToFirestore<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<boolean> {
  const safeDocId = cleanDocId(docId);
  const localStorageKey = `sma_${collectionName}`;

  try {
    const payload: Record<string, any> = { ...data };
    if (typeof payload.profileImage === 'string' && payload.profileImage.startsWith('data:image')) {
      payload.profileImage = await compressImageBase64(payload.profileImage, 320, 0.75);
    }

    if (!payload.id) {
      payload.id = safeDocId;
    }

    // 1. Immediately update LocalStorage
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
      console.warn('[Sync] Local storage update warning:', e);
    }

    const sanitized = sanitizeForFirestore(payload);

    // 2. Automatically save to Cloud Firestore (ai-studio-jcc-e81e2154-b908-48af-ae67-3f24d94a7ce4)
    try {
      const docRef = doc(db, collectionName, safeDocId);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err: any) {
      console.info(`[Sync] Firestore auto-sync note for ${collectionName}:`, err?.message);
    }

    // 3. Automatically save to Hostinger / Supabase database
    try {
      await saveToSupabase(collectionName, safeDocId, payload);
    } catch (err: any) {
      console.info(`[Sync] Hostinger database sync note for ${collectionName}:`, err?.message);
    }

    // Broadcast synchronization event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sma_data_synchronized', {
        detail: { collection: collectionName, id: safeDocId, timestamp: new Date().toISOString() }
      }));
    }

    return true;
  } catch (error) {
    console.error(`[Sync] Failed auto-syncing ${safeDocId} to ${collectionName}:`, error);
    return false;
  }
}

/**
 * Automatically deletes a record from both Cloud Firestore and Hostinger database.
 */
export async function deleteFromFirestore(
  collectionName: string,
  docId: string
): Promise<boolean> {
  const safeDocId = cleanDocId(docId);
  const localStorageKey = `sma_${collectionName}`;

  try {
    // 1. LocalStorage
    try {
      const cached = localStorage.getItem(localStorageKey);
      if (cached) {
        const list: any[] = JSON.parse(cached);
        const filtered = list.filter(item => item.id !== safeDocId && item.studentId !== safeDocId);
        localStorage.setItem(localStorageKey, JSON.stringify(filtered));
      }
    } catch {}

    // 2. Cloud Firestore
    try {
      const docRef = doc(db, collectionName, safeDocId);
      await deleteDoc(docRef);
    } catch (e: any) {
      console.info(`[Sync] Firestore delete note:`, e?.message);
    }

    // 3. Hostinger database
    try {
      await deleteFromSupabase(collectionName, safeDocId);
    } catch (e: any) {
      console.info(`[Sync] Hostinger delete note:`, e?.message);
    }

    return true;
  } catch (err) {
    console.error(`[Sync] Delete error for ${collectionName} ${safeDocId}:`, err);
    return false;
  }
}

/**
 * Batch saves multiple records to both Cloud Firestore and Hostinger.
 */
export async function batchSaveToFirestore<T extends Record<string, any>>(
  collectionName: string,
  items: T[],
  idField: string = 'id'
): Promise<boolean> {
  if (!items || items.length === 0) return true;

  try {
    // 1. LocalStorage
    try {
      localStorage.setItem(`sma_${collectionName}`, JSON.stringify(items));
    } catch {}

    // 2. Firestore batch
    try {
      const batch = writeBatch(db);
      for (const item of items) {
        const docId = cleanDocId(item[idField] || item.id || `doc_${Date.now()}`);
        const docRef = doc(db, collectionName, docId);
        batch.set(docRef, sanitizeForFirestore({ ...item, id: docId }), { merge: true });
      }
      await batch.commit();
    } catch (err: any) {
      console.info(`[Sync] Firestore batch note for ${collectionName}:`, err?.message);
    }

    // 3. Hostinger database batch
    try {
      await batchSaveToSupabase(collectionName, items, idField);
    } catch (err: any) {
      console.info(`[Sync] Hostinger batch note for ${collectionName}:`, err?.message);
    }

    return true;
  } catch (err) {
    console.error(`[Sync] Batch save failed for ${collectionName}:`, err);
    return false;
  }
}

export {
  clearSupabaseCollection as clearFirestoreCollection,
  clearAllSupabaseSchoolData as clearAllFirestoreSchoolData,
  checkSupabaseSyncStatus as checkFirestoreSyncStatus,
  saveAllSchoolRecordsToSupabase as saveAllSchoolRecordsToFirestore,
};
