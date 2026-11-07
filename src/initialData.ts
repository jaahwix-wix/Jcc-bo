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
 * FOUNDATIONAL REFERENCE STUDENTS
 * Generated authentic records for Sierra Leone curriculum (NPSE, BECE, WASSCE, Tertiary)
 */
export const DEMO_SAMPLE_STUDENTS: Student[] = [
  {
    id: 'JCC-2024-001',
    admissionNumber: 'JCC-2024-001',
    name: 'Mohamed Santigie Kamara',
    dateOfBirth: '2008-04-12',
    gender: 'Male',
    currentClass: 'SSS 3',
    stream: 'Science',
    parentName: 'Alhaji Santigie Kamara',
    parentPhone: '+232 76 341829',
    address: 'Mission Road, Simbaru, Bo, Southern Province',
    enrollmentYear: 2021,
    status: 'Active',
    bloodType: 'O+',
    allergies: 'None',
    emergencyContactName: 'Pa Alimamy Kamara',
    emergencyContactPhone: '+232 77 912834',
    emergencyContactRelation: 'Uncle',
    parentAccessCode: 'PAR-8492',
    studentAccessCode: 'STU-1024',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T09:00:00Z',
  },
  {
    id: 'JCC-2024-002',
    admissionNumber: 'JCC-2024-002',
    name: 'Fatmata Binta Sesay',
    dateOfBirth: '2009-08-23',
    gender: 'Female',
    currentClass: 'SSS 2',
    stream: 'Commercial',
    parentName: 'Madam Isatu Sesay',
    parentPhone: '+232 78 456789',
    address: 'Koker St, Simbaru, Bo',
    enrollmentYear: 2022,
    status: 'Active',
    bloodType: 'A+',
    allergies: 'Penicillin',
    emergencyContactName: 'Isatu Sesay',
    emergencyContactPhone: '+232 78 456789',
    emergencyContactRelation: 'Mother',
    parentAccessCode: 'PAR-3195',
    studentAccessCode: 'STU-5821',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T09:10:00Z',
  },
  {
    id: 'JCC-2024-003',
    admissionNumber: 'JCC-2024-003',
    name: 'Ibrahim Sorie Bangura',
    dateOfBirth: '2010-11-05',
    gender: 'Male',
    currentClass: 'JSS 3',
    parentName: 'Rev. Daniel Bangura',
    parentPhone: '+232 79 123450',
    address: 'Hospital Junction, Bo Town',
    enrollmentYear: 2023,
    status: 'Active',
    bloodType: 'B+',
    allergies: 'None',
    emergencyContactName: 'Rev. Daniel Bangura',
    emergencyContactPhone: '+232 79 123450',
    emergencyContactRelation: 'Father',
    parentAccessCode: 'PAR-5521',
    studentAccessCode: 'STU-3392',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T09:20:00Z',
  },
  {
    id: 'JCC-2024-004',
    admissionNumber: 'JCC-2024-004',
    name: 'Mariama Kadiatu Mansaray',
    dateOfBirth: '2013-02-18',
    gender: 'Female',
    currentClass: 'Primary 6',
    parentName: 'Mr. Foday Mansaray',
    parentPhone: '+232 30 771234',
    address: 'Tikonko Road, Bo Town',
    enrollmentYear: 2020,
    status: 'Active',
    bloodType: 'O-',
    allergies: 'Dust',
    emergencyContactName: 'Foday Mansaray',
    emergencyContactPhone: '+232 30 771234',
    emergencyContactRelation: 'Father',
    parentAccessCode: 'PAR-7401',
    studentAccessCode: 'STU-9410',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T09:30:00Z',
  },
  {
    id: 'JCC-2024-005',
    admissionNumber: 'JCC-2024-005',
    name: 'Alpha Oumar Koroma',
    dateOfBirth: '2015-06-30',
    gender: 'Male',
    currentClass: 'Primary 4',
    parentName: 'Mrs. Hawa Koroma',
    parentPhone: '+232 74 882310',
    address: 'Bo-Kenema Highway Corridor, Bo',
    enrollmentYear: 2022,
    status: 'Active',
    bloodType: 'A-',
    allergies: 'None',
    emergencyContactName: 'Hawa Koroma',
    emergencyContactPhone: '+232 74 882310',
    emergencyContactRelation: 'Mother',
    parentAccessCode: 'PAR-9214',
    studentAccessCode: 'STU-7723',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T09:40:00Z',
  },
  {
    id: 'JCC-2024-006',
    admissionNumber: 'JCC-2024-006',
    name: 'Zainab Aminata Turay',
    dateOfBirth: '2019-09-14',
    gender: 'Female',
    currentClass: 'Nursery 2',
    parentName: 'Pastor Samuel Turay',
    parentPhone: '+232 76 991200',
    address: 'Mission Compound, Simbaru, Bo',
    enrollmentYear: 2024,
    status: 'Active',
    bloodType: 'O+',
    allergies: 'None',
    emergencyContactName: 'Samuel Turay',
    emergencyContactPhone: '+232 76 991200',
    emergencyContactRelation: 'Father',
    parentAccessCode: 'PAR-1092',
    studentAccessCode: 'STU-4419',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T09:50:00Z',
  },
  {
    id: 'JCC-2024-007',
    admissionNumber: 'JCC-2024-007',
    name: 'Abu Bakarr Conteh',
    dateOfBirth: '2008-03-20',
    gender: 'Male',
    currentClass: 'SSS 1',
    stream: 'Science',
    parentName: 'Pa Conteh',
    parentPhone: '+232 77 441092',
    address: '20 Koker St, Simbaru, Bo',
    enrollmentYear: 2023,
    status: 'Active',
    bloodType: 'B-',
    allergies: 'None',
    emergencyContactName: 'Pa Conteh',
    emergencyContactPhone: '+232 77 441092',
    emergencyContactRelation: 'Guardian',
    parentAccessCode: 'PAR-6821',
    studentAccessCode: 'STU-8812',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T10:00:00Z',
  },
  {
    id: 'JCC-2024-008',
    admissionNumber: 'JCC-2024-008',
    name: 'Melvina Josephine Kargbo',
    dateOfBirth: '2007-12-10',
    gender: 'Female',
    currentClass: 'SSS 3',
    stream: 'Arts',
    parentName: 'Hon. Joseph Kargbo',
    parentPhone: '+232 76 550012',
    address: 'Government Residential Area, Bo',
    enrollmentYear: 2021,
    status: 'Active',
    bloodType: 'A+',
    allergies: 'None',
    emergencyContactName: 'Joseph Kargbo',
    emergencyContactPhone: '+232 76 550012',
    emergencyContactRelation: 'Father',
    parentAccessCode: 'PAR-4431',
    studentAccessCode: 'STU-6601',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-15T10:10:00Z',
  }
];

export const INITIAL_STUDENTS: Student[] = [];

/**
 * FOUNDATIONAL ACADEMIC RECORDS (TERMINAL GRADES & CONTINUOUS ASSESSMENTS)
 */
export const DEMO_SAMPLE_ACADEMIC_RECORDS: StudentAcademicRecord[] = [
  {
    studentId: 'JCC-2024-001',
    academicYear: '2025/2026',
    terms: {
      1: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 28, examScore: 64, totalScore: 92, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'English Language', caScore: 26, examScore: 59, totalScore: 85, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Physics', caScore: 27, examScore: 61, totalScore: 88, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'Chemistry', caScore: 25, examScore: 58, totalScore: 83, grade: 'B2', remark: 'Very Good' },
          { id: 'sub-5', subject: 'Biology', caScore: 26, examScore: 60, totalScore: 86, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-6', subject: 'Computer Studies (ICT)', caScore: 30, examScore: 66, totalScore: 96, grade: 'A1', remark: 'Distinction' }
        ],
        teacherRemarks: 'Exceptional academic discipline. Demonstrates strong analytical aptitude in physics and calculations.',
        principalRemarks: 'An outstanding diplomat of Christ. Keep up the high standard in your upcoming WASSCE exams.',
        conduct: 'Excellent',
        attendance: { totalDays: 70, presentDays: 69 }
      },
      2: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 29, examScore: 65, totalScore: 94, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'English Language', caScore: 27, examScore: 60, totalScore: 87, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Physics', caScore: 28, examScore: 63, totalScore: 91, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'Chemistry', caScore: 27, examScore: 60, totalScore: 87, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-5', subject: 'Biology', caScore: 26, examScore: 61, totalScore: 87, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-6', subject: 'Computer Studies (ICT)', caScore: 30, examScore: 67, totalScore: 97, grade: 'A1', remark: 'Distinction' }
        ],
        teacherRemarks: 'Consistent top performer in the Science department.',
        principalRemarks: 'Commended by executive administration for peer tutoring support.',
        conduct: 'Excellent',
        attendance: { totalDays: 72, presentDays: 72 }
      },
      3: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 29, examScore: 66, totalScore: 95, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'English Language', caScore: 28, examScore: 61, totalScore: 89, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Physics', caScore: 29, examScore: 64, totalScore: 93, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'Chemistry', caScore: 28, examScore: 62, totalScore: 90, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-5', subject: 'Biology', caScore: 27, examScore: 62, totalScore: 89, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-6', subject: 'Computer Studies (ICT)', caScore: 30, examScore: 68, totalScore: 98, grade: 'A1', remark: 'Distinction' }
        ],
        teacherRemarks: 'Ready for distinction honors in WAEC examination.',
        principalRemarks: 'Promoted with highest commendation.',
        conduct: 'Excellent',
        attendance: { totalDays: 68, presentDays: 68 }
      }
    }
  },
  {
    studentId: 'JCC-2024-002',
    academicYear: '2025/2026',
    terms: {
      1: {
        grades: [
          { id: 'sub-1', subject: 'Financial Accounting', caScore: 27, examScore: 62, totalScore: 89, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'Commerce', caScore: 26, examScore: 60, totalScore: 86, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Economics', caScore: 25, examScore: 57, totalScore: 82, grade: 'B2', remark: 'Very Good' },
          { id: 'sub-4', subject: 'English Language', caScore: 26, examScore: 58, totalScore: 84, grade: 'B2', remark: 'Very Good' },
          { id: 'sub-5', subject: 'General Mathematics', caScore: 24, examScore: 54, totalScore: 78, grade: 'B3', remark: 'Good' }
        ],
        teacherRemarks: 'A very attentive and dedicated commercial scholar.',
        principalRemarks: 'Shows admirable leadership and responsibility.',
        conduct: 'Excellent',
        attendance: { totalDays: 70, presentDays: 68 }
      },
      2: {
        grades: [
          { id: 'sub-1', subject: 'Financial Accounting', caScore: 28, examScore: 63, totalScore: 91, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'Commerce', caScore: 27, examScore: 61, totalScore: 88, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Economics', caScore: 26, examScore: 58, totalScore: 84, grade: 'B2', remark: 'Very Good' },
          { id: 'sub-4', subject: 'English Language', caScore: 27, examScore: 59, totalScore: 86, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-5', subject: 'General Mathematics', caScore: 25, examScore: 56, totalScore: 81, grade: 'B2', remark: 'Very Good' }
        ],
        teacherRemarks: 'Solid improvement in accounting calculations.',
        principalRemarks: 'Keep working hard; the future is bright.',
        conduct: 'Excellent',
        attendance: { totalDays: 72, presentDays: 71 }
      },
      3: {
        grades: [
          { id: 'sub-1', subject: 'Financial Accounting', caScore: 28, examScore: 64, totalScore: 92, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'Commerce', caScore: 28, examScore: 62, totalScore: 90, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Economics', caScore: 27, examScore: 59, totalScore: 86, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'English Language', caScore: 28, examScore: 60, totalScore: 88, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-5', subject: 'General Mathematics', caScore: 26, examScore: 57, totalScore: 83, grade: 'B2', remark: 'Very Good' }
        ],
        teacherRemarks: 'Promoted to SSS 3 with honors.',
        principalRemarks: 'Approved for senior prefect candidacy.',
        conduct: 'Excellent',
        attendance: { totalDays: 68, presentDays: 68 }
      }
    }
  },
  {
    studentId: 'JCC-2024-003',
    academicYear: '2025/2026',
    terms: {
      1: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 26, examScore: 58, totalScore: 84, grade: 'B2', remark: 'Very Good' },
          { id: 'sub-2', subject: 'English Language', caScore: 27, examScore: 59, totalScore: 86, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Integrated Science', caScore: 25, examScore: 56, totalScore: 81, grade: 'B2', remark: 'Very Good' },
          { id: 'sub-4', subject: 'Social Studies', caScore: 28, examScore: 61, totalScore: 89, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-5', subject: 'French', caScore: 24, examScore: 52, totalScore: 76, grade: 'B3', remark: 'Good' }
        ],
        teacherRemarks: 'Very proactive in classroom discussions and devotions.',
        principalRemarks: 'Ready to represent G.W.D.A with distinction at BECE.',
        conduct: 'Excellent',
        attendance: { totalDays: 70, presentDays: 70 }
      },
      2: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 27, examScore: 60, totalScore: 87, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'English Language', caScore: 28, examScore: 60, totalScore: 88, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Integrated Science', caScore: 26, examScore: 58, totalScore: 84, grade: 'B2', remark: 'Very Good' },
          { id: 'sub-4', subject: 'Social Studies', caScore: 29, examScore: 62, totalScore: 91, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-5', subject: 'French', caScore: 25, examScore: 55, totalScore: 80, grade: 'B2', remark: 'Very Good' }
        ],
        teacherRemarks: 'Strong effort shown across all subjects.',
        principalRemarks: 'Keep up the momentum into final exam preparations.',
        conduct: 'Excellent',
        attendance: { totalDays: 72, presentDays: 71 }
      },
      3: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 28, examScore: 62, totalScore: 90, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'English Language', caScore: 29, examScore: 62, totalScore: 91, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'Integrated Science', caScore: 27, examScore: 60, totalScore: 87, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'Social Studies', caScore: 30, examScore: 63, totalScore: 93, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-5', subject: 'French', caScore: 26, examScore: 57, totalScore: 83, grade: 'B2', remark: 'Very Good' }
        ],
        teacherRemarks: 'Cleared for BECE candidate status.',
        principalRemarks: 'Graduated from JSS with highest distinction.',
        conduct: 'Excellent',
        attendance: { totalDays: 68, presentDays: 68 }
      }
    }
  },
  {
    studentId: 'JCC-2024-004',
    academicYear: '2025/2026',
    terms: {
      1: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 29, examScore: 63, totalScore: 92, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'Language Arts', caScore: 28, examScore: 62, totalScore: 90, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'General Science', caScore: 28, examScore: 60, totalScore: 88, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'Quantitative Aptitude', caScore: 30, examScore: 65, totalScore: 95, grade: 'A1', remark: 'Distinction' }
        ],
        teacherRemarks: 'Class head and role model for all primary pupils.',
        principalRemarks: 'Top NPSE candidate prospect in Bo District.',
        conduct: 'Excellent',
        attendance: { totalDays: 70, presentDays: 70 }
      },
      2: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 30, examScore: 64, totalScore: 94, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-2', subject: 'Language Arts', caScore: 29, examScore: 63, totalScore: 92, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'General Science', caScore: 29, examScore: 62, totalScore: 91, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'Quantitative Aptitude', caScore: 30, examScore: 66, totalScore: 96, grade: 'A1', remark: 'Distinction' }
        ],
        teacherRemarks: 'Brilliant performance in mock exams.',
        principalRemarks: 'The Lord bless and uphold this brilliant scholar.',
        conduct: 'Excellent',
        attendance: { totalDays: 72, presentDays: 72 }
      },
      3: {
        grades: [
          { id: 'sub-1', subject: 'Mathematics', caScore: 30, examScore: 66, totalScore: 96, grade: 'A1', remark: 'Distinction' },
          { id: 'sub-2', subject: 'Language Arts', caScore: 30, examScore: 64, totalScore: 94, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-3', subject: 'General Science', caScore: 30, examScore: 63, totalScore: 93, grade: 'A1', remark: 'Excellent' },
          { id: 'sub-4', subject: 'Quantitative Aptitude', caScore: 30, examScore: 67, totalScore: 97, grade: 'A1', remark: 'Distinction' }
        ],
        teacherRemarks: 'Scored 342 in NPSE national exam!',
        principalRemarks: 'Admitted directly to JSS 1 on executive scholarship.',
        conduct: 'Excellent',
        attendance: { totalDays: 68, presentDays: 68 }
      }
    }
  }
];

export const INITIAL_ACADEMIC_RECORDS: StudentAcademicRecord[] = [];

/**
 * FOUNDATIONAL NATIONAL EXAM PREPARATION (NPSE, BECE, WASSCE)
 */
export const DEMO_SAMPLE_NATIONAL_EXAMS: NationalExamPrep[] = [
  {
    studentId: 'JCC-2024-001',
    examType: 'WASSCE',
    registered: true,
    indexNumber: 'WAEC-2025-00412-001',
    subjectsScores: [
      { subject: 'Mathematics', mockScore: 92, grade: 'A1', status: 'Ready' },
      { subject: 'English Language', mockScore: 85, grade: 'A1', status: 'Ready' },
      { subject: 'Physics', mockScore: 88, grade: 'A1', status: 'Ready' },
      { subject: 'Chemistry', mockScore: 83, grade: 'B2', status: 'Ready' },
      { subject: 'Biology', mockScore: 86, grade: 'A1', status: 'Ready' },
      { subject: 'ICT', mockScore: 96, grade: 'A1', status: 'Ready' }
    ],
    totalScore: 6, // 6 Credits / Distinctions
    recommendation: 'Cleared for tertiary & higher education admissions in Engineering / Medicine with distinction.'
  },
  {
    studentId: 'JCC-2024-003',
    examType: 'BECE',
    registered: true,
    indexNumber: 'BECE-2025-00412-014',
    subjectsScores: [
      { subject: 'Mathematics', mockScore: 84, grade: '2', status: 'Ready' },
      { subject: 'English Language', mockScore: 86, grade: '1', status: 'Ready' },
      { subject: 'Integrated Science', mockScore: 81, grade: '2', status: 'Ready' },
      { subject: 'Social Studies', mockScore: 89, grade: '1', status: 'Ready' },
      { subject: 'French', mockScore: 76, grade: '3', status: 'Ready' }
    ],
    totalScore: 9, // Aggregate
    recommendation: 'Recommended for placement in SSS 1 Pure Science or Commercial stream.'
  },
  {
    studentId: 'JCC-2024-004',
    examType: 'NPSE',
    registered: true,
    indexNumber: 'NPSE-2025-00412-045',
    subjectsScores: [
      { subject: 'Mathematics', mockScore: 92, grade: 'A', status: 'Ready' },
      { subject: 'Language Arts', mockScore: 90, grade: 'A', status: 'Ready' },
      { subject: 'General Science', mockScore: 88, grade: 'A', status: 'Ready' },
      { subject: 'Quantitative Aptitude', mockScore: 95, grade: 'A', status: 'Ready' }
    ],
    totalScore: 365,
    recommendation: 'Distinction score placement; automatically admitted to JSS 1.'
  },
  {
    studentId: 'JCC-2024-008',
    examType: 'WASSCE',
    registered: true,
    indexNumber: 'WAEC-2025-00412-022',
    subjectsScores: [
      { subject: 'English Literature', mockScore: 90, grade: 'A1', status: 'Ready' },
      { subject: 'History', mockScore: 88, grade: 'A1', status: 'Ready' },
      { subject: 'Government', mockScore: 91, grade: 'A1', status: 'Ready' },
      { subject: 'General Mathematics', mockScore: 78, grade: 'B3', status: 'Ready' },
      { subject: 'Christian Religious Studies', mockScore: 94, grade: 'A1', status: 'Ready' }
    ],
    totalScore: 5,
    recommendation: 'Recommended for Law or International Relations at Fourah Bay College.'
  }
];

export const INITIAL_NATIONAL_EXAMS: NationalExamPrep[] = [];

/**
 * FOUNDATIONAL STUDENT TUITION LEDGERS & FINANCIAL TRANSACTIONS
 */
export const DEMO_SAMPLE_FEE_LEDGERS: StudentFeeLedger[] = [
  {
    studentId: 'JCC-2024-001',
    academicYear: '2025/2026',
    terms: {
      1: {
        totalDue: 4500,
        paidAmount: 4500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-001', date: '2025-09-12', amount: 4500, paymentMethod: 'Orange Money', receiptNumber: 'REC-2025-0104' }
        ]
      },
      2: {
        totalDue: 4500,
        paidAmount: 4500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-002', date: '2026-01-08', amount: 4500, paymentMethod: 'Bank Deposit', receiptNumber: 'REC-2026-0419' }
        ]
      },
      3: {
        totalDue: 4500,
        paidAmount: 2500,
        balance: 2000,
        status: 'Partial',
        transactions: [
          { id: 'tx-003', date: '2026-04-15', amount: 2500, paymentMethod: 'Africell Money', receiptNumber: 'REC-2026-0812' }
        ]
      }
    }
  },
  {
    studentId: 'JCC-2024-002',
    academicYear: '2025/2026',
    terms: {
      1: {
        totalDue: 4500,
        paidAmount: 4500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-004', date: '2025-09-15', amount: 4500, paymentMethod: 'Cash', receiptNumber: 'REC-2025-0155' }
        ]
      },
      2: {
        totalDue: 4500,
        paidAmount: 4500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-005', date: '2026-01-10', amount: 4500, paymentMethod: 'Orange Money', receiptNumber: 'REC-2026-0430' }
        ]
      },
      3: {
        totalDue: 4500,
        paidAmount: 4500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-006', date: '2026-04-12', amount: 4500, paymentMethod: 'Orange Money', receiptNumber: 'REC-2026-0798' }
        ]
      }
    }
  },
  {
    studentId: 'JCC-2024-003',
    academicYear: '2025/2026',
    terms: {
      1: {
        totalDue: 3500,
        paidAmount: 3500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-007', date: '2025-09-18', amount: 3500, paymentMethod: 'Bank Deposit', receiptNumber: 'REC-2025-0210' }
        ]
      },
      2: {
        totalDue: 3500,
        paidAmount: 3500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-008', date: '2026-01-14', amount: 3500, paymentMethod: 'Cash', receiptNumber: 'REC-2026-0490' }
        ]
      },
      3: {
        totalDue: 3500,
        paidAmount: 1500,
        balance: 2000,
        status: 'Partial',
        transactions: [
          { id: 'tx-009', date: '2026-04-18', amount: 1500, paymentMethod: 'Cash', receiptNumber: 'REC-2026-0850' }
        ]
      }
    }
  },
  {
    studentId: 'JCC-2024-004',
    academicYear: '2025/2026',
    terms: {
      1: {
        totalDue: 2500,
        paidAmount: 2500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-010', date: '2025-09-10', amount: 2500, paymentMethod: 'Orange Money', receiptNumber: 'REC-2025-0089' }
        ]
      },
      2: {
        totalDue: 2500,
        paidAmount: 2500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-011', date: '2026-01-07', amount: 2500, paymentMethod: 'Orange Money', receiptNumber: 'REC-2026-0401' }
        ]
      },
      3: {
        totalDue: 2500,
        paidAmount: 2500,
        balance: 0,
        status: 'Paid',
        transactions: [
          { id: 'tx-012', date: '2026-04-10', amount: 2500, paymentMethod: 'Bank Deposit', receiptNumber: 'REC-2026-0775' }
        ]
      }
    }
  }
];

export const INITIAL_FEE_LEDGERS: StudentFeeLedger[] = [];

/**
 * FOUNDATIONAL FACULTY & TEACHERS REGISTRY
 */
export const DEFAULT_SAMPLE_TEACHERS: Teacher[] = [];
export const DEMO_SAMPLE_TEACHERS: Teacher[] = [
  {
    id: 'tch-001',
    staffId: 'STAFF-JCC-001',
    name: 'Jonathan Davis',
    email: 'jonathan.davis@jonathanschildcare.org',
    phone: '(076) 865166',
    roleTitle: 'Director and Principal',
    department: 'Administration & Leadership',
    staffCategory: 'Teaching',
    qualification: 'M.Ed. Educational Leadership, B.Sc. Education (Njala)',
    bloodType: 'O+',
    subjects: ['Christian Religious Studies', 'Moral Leadership'],
    classes: ['SSS 2', 'SSS 3'],
    assignedClassTeacherOf: 'SSS 3',
    salary: 8500,
    hireDate: '2000-09-01',
    payrollStatus: 'Paid',
    accessCode: 'TCH-1001',
    verified: true,
    verifiedBy: 'Board of Governors',
    verifiedAt: '2000-09-01T08:00:00Z'
  },
  {
    id: 'tch-002',
    staffId: 'STAFF-JCC-002',
    name: 'Mrs. Fatmata Sesay',
    email: 'fatmata.sesay@jonathanschildcare.org',
    phone: '+232 76 987654',
    roleTitle: 'Vice Principal & Head of Languages',
    department: 'Languages & Humanities',
    staffCategory: 'Teaching',
    qualification: 'B.A. (Hons) English Education (FBC)',
    bloodType: 'A+',
    subjects: ['English Language', 'Literature in English'],
    classes: ['SSS 1', 'SSS 2', 'SSS 3'],
    assignedClassTeacherOf: 'SSS 2',
    salary: 6200,
    hireDate: '2005-01-15',
    payrollStatus: 'Paid',
    accessCode: 'TCH-2002',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-003',
    staffId: 'STAFF-JCC-003',
    name: 'Mr. Abu Bakarr Kamara',
    email: 'abu.kamara@jonathanschildcare.org',
    phone: '+232 78 334455',
    roleTitle: 'Head of Sciences',
    department: 'Pure & Applied Sciences',
    staffCategory: 'Teaching',
    qualification: 'B.Sc. Chemistry & Physics Education (Njala)',
    bloodType: 'B+',
    subjects: ['Physics', 'Chemistry', 'Integrated Science'],
    classes: ['JSS 3', 'SSS 2', 'SSS 3'],
    assignedClassTeacherOf: 'SSS 1',
    salary: 5800,
    hireDate: '2012-09-10',
    payrollStatus: 'Paid',
    accessCode: 'TCH-3003',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-004',
    staffId: 'STAFF-JCC-004',
    name: 'Mr. Santigie Bangura',
    email: 'santigie.bangura@jonathanschildcare.org',
    phone: '+232 77 112233',
    roleTitle: 'ICT & Mathematics Coordinator',
    department: 'Technology & Mathematics',
    staffCategory: 'Teaching',
    qualification: 'B.Sc. Computer Science & Mathematics (MMTU)',
    bloodType: 'O+',
    subjects: ['Mathematics', 'Computer Studies (ICT)'],
    classes: ['JSS 1', 'JSS 2', 'SSS 1', 'SSS 2', 'SSS 3'],
    assignedClassTeacherOf: 'JSS 3',
    salary: 5600,
    hireDate: '2016-03-01',
    payrollStatus: 'Paid',
    accessCode: 'TCH-4004',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-005',
    staffId: 'STAFF-JCC-005',
    name: 'Madam Isatu Koroma',
    email: 'isatu.koroma@jonathanschildcare.org',
    phone: '+232 79 443322',
    roleTitle: 'Head of Early Childhood (Nursery)',
    department: 'Early Childhood Education',
    staffCategory: 'Teaching',
    qualification: 'Higher Teachers Certificate (HTC Primary, Bo Teachers College)',
    bloodType: 'A+',
    subjects: ['Early Literacy', 'Numeracy Play', 'Rhymes & Art'],
    classes: ['Nursery 1', 'Nursery 2', 'Nursery 3'],
    assignedClassTeacherOf: 'Nursery 3',
    salary: 4900,
    hireDate: '2015-08-20',
    payrollStatus: 'Paid',
    accessCode: 'TCH-5005',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-006',
    staffId: 'STAFF-JCC-006',
    name: 'Mr. David Mansaray',
    email: 'david.mansaray@jonathanschildcare.org',
    phone: '+232 76 654321',
    roleTitle: 'Primary Section Head & Class 6 Teacher',
    department: 'Primary Education',
    staffCategory: 'Teaching',
    qualification: 'B.Ed. Primary Education (Njala)',
    bloodType: 'O-',
    subjects: ['Verbal Aptitude', 'Quantitative Aptitude', 'General Science'],
    classes: ['Primary 5', 'Primary 6'],
    assignedClassTeacherOf: 'Primary 6',
    salary: 5200,
    hireDate: '2014-09-01',
    payrollStatus: 'Paid',
    accessCode: 'TCH-6006',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-007',
    staffId: 'STAFF-JCC-007',
    name: 'Mr. Emmanuel Bio',
    email: 'bursary@jonathanschildcare.org',
    phone: '+232 78 901234',
    roleTitle: 'School Bursar & Financial Controller',
    department: 'Finance & Accounts',
    staffCategory: 'Non-Teaching',
    qualification: 'B.Sc. Accounting & Finance (FBC), ACCA Part II',
    bloodType: 'B+',
    subjects: [],
    classes: [],
    salary: 6000,
    hireDate: '2018-02-15',
    payrollStatus: 'Paid',
    accessCode: 'STF-7007',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-008',
    staffId: 'STAFF-JCC-008',
    name: 'Nurse Aminata Conteh',
    email: 'clinic@jonathanschildcare.org',
    phone: '+232 77 889900',
    roleTitle: 'School Matron & Health Officer',
    department: 'Health & Student Wellness',
    staffCategory: 'Non-Teaching',
    qualification: 'State Registered Nurse (SRN, Bo School of Nursing)',
    bloodType: 'O+',
    subjects: [],
    classes: [],
    salary: 4500,
    hireDate: '2019-10-01',
    payrollStatus: 'Paid',
    accessCode: 'STF-8008',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-009',
    staffId: 'STAFF-JCC-009',
    name: 'Mr. Mohamed Fofanah',
    email: 'registry@jonathanschildcare.org',
    phone: '+232 76 114477',
    roleTitle: 'Senior Administrative Secretary & IT Registrar',
    department: 'Registry & Secretarial Affairs',
    staffCategory: 'Non-Teaching',
    qualification: 'Diploma in Information Systems & Secretarial Studies',
    bloodType: 'A+',
    subjects: [],
    classes: [],
    salary: 4300,
    hireDate: '2020-01-10',
    payrollStatus: 'Paid',
    accessCode: 'STF-9009',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  },
  {
    id: 'tch-010',
    staffId: 'STAFF-JCC-010',
    name: 'Mr. Samuel Tarawally',
    email: 'facilities@jonathanschildcare.org',
    phone: '+232 79 336699',
    roleTitle: 'Head of Facilities & Logistics',
    department: 'Campus Security & Facilities',
    staffCategory: 'Non-Teaching',
    qualification: 'Certificate in Facilities Management & Occupational Safety',
    bloodType: 'AB+',
    subjects: [],
    classes: [],
    salary: 3800,
    hireDate: '2017-06-01',
    payrollStatus: 'Paid',
    accessCode: 'STF-1010',
    verified: true,
    verifiedBy: 'Jonathan Davis',
    verifiedAt: '2024-09-01T08:00:00Z'
  }
];

/**
 * FOUNDATIONAL ASSIGNMENTS & HOMEWORK
 */
export const DEFAULT_SAMPLE_ASSIGNMENTS: Assignment[] = [];
export const DEMO_SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-001',
    teacherId: 'tch-003',
    teacherName: 'Mr. Abu Bakarr Kamara',
    title: 'Kinematics & Newton\'s Laws of Motion Problem Set',
    description: 'Solve questions 1 through 10 on page 48 of the WAEC Science standard textbook. Show all derivation steps.',
    subject: 'Physics',
    className: 'SSS 3',
    dueDate: '2026-10-15',
    maxPoints: 30,
    createdAt: '2026-10-01'
  },
  {
    id: 'asg-002',
    teacherId: 'tch-002',
    teacherName: 'Mrs. Fatmata Sesay',
    title: 'Essay: The Socio-Economic Impact of Youth Digital Literacy in Bo District',
    description: 'Compose a well-structured argumentative essay (450–600 words) with clear paragraphs, topic sentences, and citations.',
    subject: 'English Language',
    className: 'SSS 2',
    dueDate: '2026-10-20',
    maxPoints: 30,
    createdAt: '2026-10-02'
  }
];

export const DEFAULT_SAMPLE_SUBMISSIONS: Submission[] = [];
export const DEMO_SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-001',
    assignmentId: 'asg-001',
    studentId: 'JCC-2024-001',
    studentName: 'Mohamed Santigie Kamara',
    className: 'SSS 3',
    submittedAt: '2026-10-02T10:30:00Z',
    textResponse: 'Completed all 10 problem derivations including friction coefficients on inclined planes.',
    fileName: 'mohamed_kamara_physics_asg1.pdf',
    fileSize: '420 KB',
    status: 'Graded',
    score: 29,
    feedback: 'Excellent rigor and neat working. Full marks on questions 1-9.'
  }
];

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
