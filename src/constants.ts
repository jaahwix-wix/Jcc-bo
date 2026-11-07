/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentClass, SSSStream } from './types';

export const CLASSES_LIST: StudentClass[] = [
  'Nursery 1', 'Nursery 2', 'Nursery 3',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3'
];

export type SchoolTier = 'Nursery' | 'Primary' | 'JSS' | 'SSS';

export interface ClassGroup {
  tier: SchoolTier;
  label: string;
  badgeColor: string;
  classes: StudentClass[];
}

export const CLASS_GROUPS: ClassGroup[] = [
  {
    tier: 'Nursery',
    label: 'Nursery (Nursery 1 - 3)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    classes: ['Nursery 1', 'Nursery 2', 'Nursery 3']
  },
  {
    tier: 'Primary',
    label: 'Primary School (Primary 1 - 6)',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6']
  },
  {
    tier: 'JSS',
    label: 'Junior Secondary (JSS 1 - 3)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    classes: ['JSS 1', 'JSS 2', 'JSS 3']
  },
  {
    tier: 'SSS',
    label: 'Senior Secondary (SSS 1 - 3)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    classes: ['SSS 1', 'SSS 2', 'SSS 3']
  }
];

export function getTierForClass(className: string): SchoolTier {
  if (className.startsWith('Nursery')) return 'Nursery';
  if (className.startsWith('Primary')) return 'Primary';
  if (className.startsWith('JSS')) return 'JSS';
  if (className.startsWith('SSS')) return 'SSS';
  return 'Primary';
}

export const SSS_STREAMS: SSSStream[] = ['Science', 'Arts', 'Commercial', 'General'];

// Subject lists specific to Sierra Leone educational levels (Nursery, Primary, JSS, SSS)
export const LEVEL_SUBJECTS = {
  PRE_SCHOOL: [
    'Early Numeracy',
    'Early Literacy',
    'Phonics & Letter Sounds',
    'Sensory & Practical Life',
    'Creative Arts & Rhymes',
    'Health & Good Habits'
  ],
  NURSERY: [
    'Nursery Numeracy & Shapes',
    'Language Development & Phonics',
    'Pre-Writing Skills',
    'Social & Emotional Habits',
    'Practical Life & Motor Skills',
    'Creative Arts & Storytelling',
    'Physical Play & Health'
  ],
  PRIMARY: [
    'English Language',
    'Mathematics',
    'General Science',
    'Social Studies',
    'Agricultural Science',
    'Home Economics',
    'Physical & Health Education',
    'Quantitative Aptitude',
    'Verbal Aptitude',
    'Creative & Practical Arts'
  ],
  JSS: [
    'Language Arts (English)',
    'Mathematics',
    'Integrated Science',
    'Social Studies',
    'Agricultural Science',
    'Home Economics',
    'Business Studies',
    'Religious & Moral Education (RME)',
    'Physical Health Education (PHE)',
    'French'
  ],
  SSS_SCIENCE: [
    'English Language',
    'Mathematics (Core)',
    'Biology',
    'Chemistry',
    'Physics',
    'Further Mathematics',
    'Geography',
    'Civic Education',
    'Agricultural Science'
  ],
  SSS_ARTS: [
    'English Language',
    'Mathematics (Core)',
    'Literature in English',
    'Government',
    'History',
    'Christian Religious Studies (CRS) / Islamic Studies (ISS)',
    'Krio / French',
    'Civic Education',
    'Economics'
  ],
  SSS_COMMERCIAL: [
    'English Language',
    'Mathematics (Core)',
    'Financial Accounting',
    'Commerce',
    'Economics',
    'Business Management',
    'Office Practice',
    'Civic Education',
    'Geography'
  ]
};

export function getSubjectsForClass(
  className: StudentClass, 
  stream?: SSSStream
): string[] {
  if (className.startsWith('Nursery')) {
    return LEVEL_SUBJECTS.NURSERY;
  }
  if (className.startsWith('Primary')) {
    return LEVEL_SUBJECTS.PRIMARY;
  }
  if (className.startsWith('JSS')) {
    return LEVEL_SUBJECTS.JSS;
  }
  // SSS classes (SSS 1 - 3)
  if (stream === 'Science') {
    return LEVEL_SUBJECTS.SSS_SCIENCE;
  }
  if (stream === 'Arts') {
    return LEVEL_SUBJECTS.SSS_ARTS;
  }
  if (stream === 'Commercial') {
    return LEVEL_SUBJECTS.SSS_COMMERCIAL;
  }
  return LEVEL_SUBJECTS.SSS_SCIENCE; // Default
}

// Sierra Leone Grading Standards (WAEC / West African Standard)
export interface GradeScale {
  minScore: number;
  grade: string;
  remark: string;
  isCredit: boolean;
  color: string;
}

export const SECONDARY_GRADING_SCALE: GradeScale[] = [
  { minScore: 91, grade: 'A', remark: 'Excellent', isCredit: true, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { minScore: 81, grade: 'B', remark: 'Very Good', isCredit: true, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { minScore: 75, grade: 'C', remark: 'Credit', isCredit: true, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { minScore: 0, grade: 'F', remark: 'Fail', isCredit: false, color: 'text-rose-600 bg-rose-50 border-rose-200' }
];

export const WAEC_GRADING_SCALE = SECONDARY_GRADING_SCALE;

export const PRIMARY_GRADING_SCALE: GradeScale[] = [
  { minScore: 91, grade: 'A', remark: 'Excellent', isCredit: true, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { minScore: 81, grade: 'B', remark: 'Very Good', isCredit: true, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { minScore: 65, grade: 'C', remark: 'Credit', isCredit: true, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { minScore: 0, grade: 'F', remark: 'Fail', isCredit: false, color: 'text-rose-600 bg-rose-50 border-rose-200' }
];

export function getGradingScale(className: StudentClass): GradeScale[] {
  if (className.startsWith('Nursery') || className.startsWith('Primary')) {
    return PRIMARY_GRADING_SCALE;
  }
  return SECONDARY_GRADING_SCALE;
}

export function calculateGrade(score: number, className: StudentClass): { grade: string; remark: string; color: string } {
  const scale = getGradingScale(className);
  const matched = scale.find(s => score >= s.minScore);
  if (matched) {
    return { grade: matched.grade, remark: matched.remark, color: matched.color };
  }
  return { grade: 'F', remark: 'Fail', color: 'text-rose-600 bg-rose-50 border-rose-200' };
}
