/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Supabase bridge: re-exports all data management functions to connect purely to Supabase
export {
  cleanDocId,
  compressImageBase64,
  sanitizeForSupabase as sanitizeForFirestore,
  syncSupabaseCollection as syncFirestoreCollection,
  saveToSupabase as saveToFirestore,
  deleteFromSupabase as deleteFromFirestore,
  batchSaveToSupabase as batchSaveToFirestore,
  clearSupabaseCollection as clearFirestoreCollection,
  clearAllSupabaseSchoolData as clearAllFirestoreSchoolData,
  checkSupabaseSyncStatus as checkFirestoreSyncStatus,
  saveAllSchoolRecordsToSupabase as saveAllSchoolRecordsToFirestore,
  createReferenceSnapshot,
  fetchReferenceSnapshots,
  deleteReferenceSnapshot,
} from './supabaseSync';

export type { ReferenceSnapshot } from './supabaseSync';
