/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Student, 
  StudentAcademicRecord, 
  NationalExamPrep, 
  StudentFeeLedger, 
  Teacher, 
  Assignment, 
  Submission, 
  Lesson,
  SchoolAnnouncement 
} from './types';

import schoolLogo from './assets/logo.jpg';

export const SCHOOL_INFO = {
  name: "Jonathan's Child Care (JCC)",
  shortName: 'JCC',
  systemName: "Jonathan's Child Care (JCC) MIS",
  motto: 'Nurturing, Educating & Empowering Every Child',
  slogan: "Every Child Matters in God's Eyes",
  address: '20 Koker St, Simbaru, Bo, Sierra Leone',
  phone: '(076) 865166',
  email: 'info@jonathanschildcare.org',
  website: '',
  logo: schoolLogo,
  founded: 2000,
  principalName: 'Jonathan Davis',
  principalTitle: 'Director and Principal',
  coFounder: 'Jonathan Davis',
  principalSignature: 'Jonathan Davis',
  vicePrincipalName: 'Mrs. Fatmata Sesay',
};

/**
 * CLEAN REGISTRIES: All records are empty by default.
 * Teachers, students, parents, lessons, and assignments are registered by the administration.
 */
export const DEMO_SAMPLE_STUDENTS: Student[] = [];
export const INITIAL_STUDENTS: Student[] = [];

export const DEMO_SAMPLE_ACADEMIC_RECORDS: StudentAcademicRecord[] = [];
export const INITIAL_ACADEMIC_RECORDS: StudentAcademicRecord[] = [];

export const DEMO_SAMPLE_NATIONAL_EXAMS: NationalExamPrep[] = [];
export const INITIAL_NATIONAL_EXAMS: NationalExamPrep[] = [];

export const DEMO_SAMPLE_FEE_LEDGERS: StudentFeeLedger[] = [];
export const INITIAL_FEE_LEDGERS: StudentFeeLedger[] = [];

export const DEFAULT_SAMPLE_TEACHERS: Teacher[] = [];
export const DEMO_SAMPLE_TEACHERS: Teacher[] = [];

export const DEFAULT_SAMPLE_ASSIGNMENTS: Assignment[] = [];
export const DEMO_SAMPLE_ASSIGNMENTS: Assignment[] = [];

export const DEFAULT_SAMPLE_SUBMISSIONS: Submission[] = [];
export const DEMO_SAMPLE_SUBMISSIONS: Submission[] = [];

export const DEFAULT_SAMPLE_LESSONS: Lesson[] = [];
export const DEMO_SAMPLE_LESSONS: Lesson[] = [];

/**
 * FOUNDATIONAL SCHOOL ANNOUNCEMENTS & BULLETINS
 */
export const DEFAULT_SCHOOL_ANNOUNCEMENTS: SchoolAnnouncement[] = [];
export const DEMO_SAMPLE_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'WAEC Re-Accreditation & Commendation for Testing Center #00412',
    message: 'We are pleased to inform all students, faculty, and parents that WAEC and MBSSE have officially renewed our testing center accreditation with highest ratings for examination integrity.',
    date: '2026-10-01',
    priority: 'urgent',
    author: 'Jonathan Davis (Director and Principal)',
    category: 'academic'
  },
  {
    id: 'ann-002',
    title: 'Tuition Fee Payment Deadline for Terminal Assessments',
    message: 'Parents and guardians are kindly reminded to complete outstanding tuition balances before continuous assessment cutoff. Flexible installment plans available through Bursary.',
    date: '2026-10-02',
    priority: 'normal',
    author: 'Office of the Bursar',
    category: 'fee'
  }
];
