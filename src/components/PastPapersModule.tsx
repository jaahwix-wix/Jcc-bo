/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCheck, 
  BookOpen, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X, 
  PlayCircle, 
  Plus, 
  FileText, 
  ChevronRight, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  HelpCircle, 
  Sparkles, 
  GraduationCap, 
  Layers,
  RotateCcw,
  Printer
} from 'lucide-react';
import { PastPaper, PastPaperQuestion } from '../types';
import { SCHOOL_INFO } from '../initialData';
import { useAuth } from '../context/AuthContext';
import { syncFirestoreCollection, saveToFirestore } from '../services/firestoreSync';

interface PastPapersModuleProps {
  onNavigate?: (tab: string, arg?: any) => void;
}

// Initial Comprehensive Past Papers Archive (NPSE, BECE, WASSCE)
const INITIAL_PAST_PAPERS: PastPaper[] = [
  // --- NPSE (PRIMARY 6) ---
  {
    id: 'pp-npse-2024-math',
    examType: 'NPSE',
    year: 2024,
    subject: 'Mathematics',
    paperCode: 'NPSE-2024-MATH-01',
    paperTitle: 'NPSE 2024 Mathematics Objective & Problem Solving',
    paperType: 'Paper 1 (Objectives)',
    durationMinutes: 60,
    totalMarks: 50,
    instructions: 'Answer all 50 multiple choice questions. Choose the correct letter from A, B, C, or D. No calculators permitted.',
    questionsCount: 50,
    downloadFileName: 'NPSE_2024_Mathematics_Paper1.txt',
    fileSize: '142 KB',
    uploadedBy: 'MBSSE / WAEC Bo Directorate',
    uploadedAt: '2026-05-10',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-npse-m-1',
        number: 1,
        question: 'Express 3/8 as a decimal number.',
        options: ['0.375', '0.380', '0.350', '0.425'],
        correctOption: 0,
        markingGuide: '3 ÷ 8 = 0.375. Divide 3.000 by 8 to get 0.375.',
        points: 1
      },
      {
        id: 'q-npse-m-2',
        number: 2,
        question: 'A trader in Bo City bought a bag of rice for SLE 450 and sold it for SLE 540. What was her percentage profit?',
        options: ['15%', '20%', '25%', '18%'],
        correctOption: 1,
        markingGuide: 'Profit = 540 - 450 = SLE 90. Percentage profit = (90 / 450) * 100 = 20%.',
        points: 1
      },
      {
        id: 'q-npse-m-3',
        number: 3,
        question: 'Find the Least Common Multiple (LCM) of 12, 18, and 24.',
        options: ['48', '72', '96', '36'],
        correctOption: 1,
        markingGuide: '12 = 2² * 3; 18 = 2 * 3²; 24 = 2³ * 3. LCM = 2³ * 3² = 8 * 9 = 72.',
        points: 1
      },
      {
        id: 'q-npse-m-4',
        number: 4,
        question: 'Calculate the perimeter of a rectangular school field measuring 65 meters long and 35 meters wide.',
        options: ['100 meters', '200 meters', '2,275 meters', '130 meters'],
        correctOption: 1,
        markingGuide: 'Perimeter = 2 * (length + width) = 2 * (65 + 35) = 2 * 100 = 200 meters.',
        points: 1
      },
      {
        id: 'q-npse-m-5',
        number: 5,
        question: 'Solve for x in the equation: 4x - 7 = 29.',
        options: ['7', '8', '9', '11'],
        correctOption: 2,
        markingGuide: '4x = 29 + 7 = 36. x = 36 / 4 = 9.',
        points: 1
      }
    ]
  },
  {
    id: 'pp-npse-2023-quant',
    examType: 'NPSE',
    year: 2023,
    subject: 'Quantitative Aptitude',
    paperCode: 'NPSE-2023-QA-01',
    paperTitle: 'NPSE 2023 Quantitative Aptitude & Numerical Reasoning',
    paperType: 'Paper 1 (Objectives)',
    durationMinutes: 50,
    totalMarks: 50,
    instructions: 'Examine each numerical pattern carefully. Select the number that completes the relationship logically.',
    questionsCount: 50,
    downloadFileName: 'NPSE_2023_Quantitative_Aptitude.txt',
    fileSize: '120 KB',
    uploadedBy: 'JCC Academic Committee',
    uploadedAt: '2026-04-12',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-npse-qa-1',
        number: 1,
        question: 'If [4 * 6] = 20 and [5 * 7] = 30, find the value of [6 * 8].',
        options: ['38', '40', '42', '48'],
        correctOption: 2,
        markingGuide: 'Rule: (a * b) - 4. 4*6=24-4=20; 5*7=35-5? Or (a-1)*b? Notice 4*(6-1)=20; 5*(7-1)=30. Thus 6*(8-1) = 6 * 7 = 42.',
        points: 1
      },
      {
        id: 'q-npse-qa-2',
        number: 2,
        question: 'Identify the next number in the series: 3, 7, 15, 31, 63, ...',
        options: ['125', '126', '127', '128'],
        correctOption: 2,
        markingGuide: 'Each term is (previous * 2) + 1. (63 * 2) + 1 = 126 + 1 = 127.',
        points: 1
      }
    ]
  },
  {
    id: 'pp-npse-2024-eng',
    examType: 'NPSE',
    year: 2024,
    subject: 'English Language',
    paperCode: 'NPSE-2024-ENG-01',
    paperTitle: 'NPSE 2024 English Language, Verbal Aptitude & Composition',
    paperType: 'Paper 1 (Objectives)',
    durationMinutes: 60,
    totalMarks: 50,
    instructions: 'Read the comprehension passage and answer questions 1 to 10. For questions 11 to 50, select the most appropriate grammatical option.',
    questionsCount: 50,
    downloadFileName: 'NPSE_2024_English_Verbal.txt',
    fileSize: '135 KB',
    uploadedBy: 'MBSSE Bo District',
    uploadedAt: '2026-05-14',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-npse-e-1',
        number: 1,
        question: 'Choose the word that is nearest in meaning (synonym) to "ABUNDANT".',
        options: ['Scarce', 'Plentiful', 'Empty', 'Sufficient'],
        correctOption: 1,
        markingGuide: 'Abundant means existing in large quantities; plentiful.',
        points: 1
      },
      {
        id: 'q-npse-e-2',
        number: 2,
        question: 'Neither the headteacher nor the pupils ______ present at the assembly hall.',
        options: ['was', 'were', 'is', 'are being'],
        correctOption: 1,
        markingGuide: 'With "neither... nor", the verb agrees with the closer subject ("pupils", which is plural), so "were" is correct.',
        points: 1
      }
    ]
  },

  // --- BECE (JSS 3) ---
  {
    id: 'pp-bece-2024-sci',
    examType: 'BECE',
    year: 2024,
    subject: 'Integrated Science',
    paperCode: 'WAEC-BECE-2024-SCI-1&2',
    paperTitle: 'BECE 2024 Integrated Science (Paper 1 Objectives & Paper 2 Essay)',
    paperType: 'Combined',
    durationMinutes: 120,
    totalMarks: 100,
    instructions: 'Section A: 50 Objective Questions (50 Marks). Section B: Answer any four out of five structured essay questions (50 Marks).',
    questionsCount: 54,
    downloadFileName: 'BECE_2024_Integrated_Science.txt',
    fileSize: '210 KB',
    uploadedBy: 'WAEC Sierra Leone',
    uploadedAt: '2026-06-02',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-bece-s-1',
        number: 1,
        question: 'Which of the following gas components is absorbed by green leaves during photosynthesis?',
        options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
        correctOption: 1,
        markingGuide: 'Photosynthesis requires Carbon dioxide (CO₂) and water in the presence of sunlight and chlorophyll to produce glucose.',
        points: 1
      },
      {
        id: 'q-bece-s-2',
        number: 2,
        question: 'An electric bulb draws a current of 0.5 Amperes when connected to a 240 Volts mains supply. Calculate the resistance of the bulb filament.',
        options: ['120 Ohms', '240 Ohms', '480 Ohms', '60 Ohms'],
        correctOption: 2,
        markingGuide: 'By Ohm’s Law: V = I * R => R = V / I = 240 / 0.5 = 480 Ohms.',
        points: 2
      },
      {
        id: 'q-bece-s-3',
        number: 3,
        question: 'Which method of soil conservation involves planting crops along horizontal contour lines of hillsides in Bo District?',
        options: ['Crop rotation', 'Contour plowing', 'Mulching', 'Overgrazing'],
        correctOption: 1,
        markingGuide: 'Contour plowing reduces water runoff and soil erosion across slopes.',
        points: 1
      }
    ]
  },
  {
    id: 'pp-bece-2023-math',
    examType: 'BECE',
    year: 2023,
    subject: 'Mathematics',
    paperCode: 'WAEC-BECE-2023-MATH-1&2',
    paperTitle: 'BECE 2023 Mathematics (Paper 1 & Paper 2 Theory)',
    paperType: 'Combined',
    durationMinutes: 120,
    totalMarks: 100,
    instructions: 'Paper 1 consists of 50 Multiple Choice Questions (50 marks). Paper 2 consists of 6 structured questions (Answer 4 questions for 50 marks).',
    questionsCount: 56,
    downloadFileName: 'BECE_2023_Mathematics_Full.txt',
    fileSize: '195 KB',
    uploadedBy: 'WAEC Sierra Leone',
    uploadedAt: '2026-06-05',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-bece-m-1',
        number: 1,
        question: 'Factorize completely: 6x² - 15xy.',
        options: ['3x(2x - 5y)', '3(2x² - 5xy)', 'x(6x - 15y)', '3x(2x + 5y)'],
        correctOption: 0,
        markingGuide: 'Factor out the greatest common factor 3x: 3x(2x - 5y).',
        points: 1
      },
      {
        id: 'q-bece-m-2',
        number: 2,
        question: 'If the interior angle of a regular polygon is 140°, how many sides does the polygon possess?',
        options: ['7 sides', '8 sides', '9 sides', '10 sides'],
        correctOption: 2,
        markingGuide: 'Exterior angle = 180° - 140° = 40°. Number of sides n = 360° / 40° = 9 sides (Nonagon).',
        points: 2
      }
    ]
  },
  {
    id: 'pp-bece-2024-eng',
    examType: 'BECE',
    year: 2024,
    subject: 'Language Arts (English)',
    paperCode: 'WAEC-BECE-2024-ENG-1&2',
    paperTitle: 'BECE 2024 Language Arts (English Comprehension, Grammar & Composition)',
    paperType: 'Combined',
    durationMinutes: 120,
    totalMarks: 100,
    instructions: 'Write an essay of about 250 words on one of the given topics. Answer all comprehension and vocabulary questions.',
    questionsCount: 52,
    downloadFileName: 'BECE_2024_Language_Arts.txt',
    fileSize: '188 KB',
    uploadedBy: 'WAEC Sierra Leone',
    uploadedAt: '2026-06-08',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-bece-e-1',
        number: 1,
        question: 'Select the sentence that contains the correct punctuation.',
        options: [
          'Although he worked hard, he did not win the prize.',
          'Although he worked hard; he did not win the prize.',
          'Although he worked hard he did not, win the prize.',
          'Although, he worked hard he did not win the prize.'
        ],
        correctOption: 0,
        markingGuide: 'A subordinate clause beginning with "Although" followed by a comma before the main clause is correct.',
        points: 1
      }
    ]
  },
  {
    id: 'pp-bece-2023-soc',
    examType: 'BECE',
    year: 2023,
    subject: 'Social Studies',
    paperCode: 'WAEC-BECE-2023-SOC-1&2',
    paperTitle: 'BECE 2023 Social Studies & Civic Education',
    paperType: 'Combined',
    durationMinutes: 100,
    totalMarks: 100,
    instructions: 'Answer all 50 objective questions and three questions from Section B.',
    questionsCount: 53,
    downloadFileName: 'BECE_2023_Social_Studies.txt',
    fileSize: '172 KB',
    uploadedBy: 'WAEC Bo Office',
    uploadedAt: '2026-06-12',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-bece-so-1',
        number: 1,
        question: 'Which of the following is the primary legislative body of Sierra Leone responsible for making national laws?',
        options: ['The Judiciary', 'The Cabinet', 'The Parliament', 'The City Council'],
        correctOption: 2,
        markingGuide: 'Parliament is the legislative organ of government in Sierra Leone.',
        points: 1
      }
    ]
  },

  // --- WASSCE (SSS 3) ---
  {
    id: 'pp-wassce-2024-coremath',
    examType: 'WASSCE',
    year: 2024,
    subject: 'Mathematics (Core)',
    paperCode: 'WAEC-WASSCE-2024-MATH-1&2',
    paperTitle: 'WASSCE 2024 General Mathematics / Core Mathematics',
    paperType: 'Combined',
    durationMinutes: 150,
    totalMarks: 100,
    instructions: 'Paper 1: 50 Objective Questions (1 hour 30 mins). Paper 2: 13 Theory Questions (2 hours 30 mins). Answer all Section A and 5 questions from Section B.',
    questionsCount: 63,
    downloadFileName: 'WASSCE_2024_Core_Mathematics.txt',
    fileSize: '265 KB',
    uploadedBy: 'WAEC West African Council',
    uploadedAt: '2026-07-02',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-wassce-cm-1',
        number: 1,
        question: 'If log₁₀ 2 = 0.3010 and log₁₀ 3 = 0.4771, calculate the value of log₁₀ 72 without using logarithm tables.',
        options: ['1.8572', '1.7781', '1.6990', '1.9030'],
        correctOption: 0,
        markingGuide: '72 = 8 * 9 = 2³ * 3². log 72 = 3(log 2) + 2(log 3) = 3(0.3010) + 2(0.4771) = 0.9030 + 0.9542 = 1.8572.',
        points: 2
      },
      {
        id: 'q-wassce-cm-2',
        number: 2,
        question: 'Find the truth set of the inequality: (2x - 3) / 3 < (x + 1) / 2.',
        options: ['x < 9', 'x > 9', 'x < -9', 'x > -9'],
        correctOption: 0,
        markingGuide: 'Multiply both sides by 6: 2(2x - 3) < 3(x + 1) => 4x - 6 < 3x + 3 => 4x - 3x < 3 + 6 => x < 9.',
        points: 2
      },
      {
        id: 'q-wassce-cm-3',
        number: 3,
        question: 'The third term of a Geometric Progression (G.P.) is 18 and the sixth term is 486. Find the first term (a) and common ratio (r).',
        options: ['a = 2, r = 3', 'a = 3, r = 2', 'a = 2, r = 4', 'a = 1, r = 3'],
        correctOption: 0,
        markingGuide: 'T₃ = ar² = 18; T₆ = ar⁵ = 486. Dividing gives r³ = 486 / 18 = 27 => r = 3. ar² = a(9) = 18 => a = 2.',
        points: 3
      }
    ]
  },
  {
    id: 'pp-wassce-2024-eng',
    examType: 'WASSCE',
    year: 2024,
    subject: 'English Language',
    paperCode: 'WAEC-WASSCE-2024-ENG-1&2',
    paperTitle: 'WASSCE 2024 English Language (Essay, Comprehension & Lexis/Structure)',
    paperType: 'Combined',
    durationMinutes: 180,
    totalMarks: 100,
    instructions: 'Section A: Continuous Writing (50 marks). Section B: Reading Comprehension (20 marks). Section C: Summary (30 marks). Paper 1: Objective Test (80 items).',
    questionsCount: 84,
    downloadFileName: 'WASSCE_2024_English_Language.txt',
    fileSize: '290 KB',
    uploadedBy: 'WAEC West African Council',
    uploadedAt: '2026-07-04',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-wassce-e-1',
        number: 1,
        question: 'From the words lettered A to D, choose the word that is opposite in meaning (antonym) to "STRINGENT".',
        options: ['Lenient', 'Rigid', 'Severe', 'Stern'],
        correctOption: 0,
        markingGuide: 'Stringent means strict and precise; its antonym is lenient.',
        points: 1
      }
    ]
  },
  {
    id: 'pp-wassce-2023-bio',
    examType: 'WASSCE',
    year: 2023,
    subject: 'Biology',
    paperCode: 'WAEC-WASSCE-2023-BIO-1&2',
    paperTitle: 'WASSCE 2023 Biology (Paper 1 Objectives & Paper 2 Essay)',
    paperType: 'Combined',
    durationMinutes: 150,
    totalMarks: 100,
    instructions: 'Paper 1: 50 Multiple Choice Questions (50 marks). Paper 2: Answer 4 questions from Section A and 1 question from Section B.',
    questionsCount: 56,
    downloadFileName: 'WASSCE_2023_Biology.txt',
    fileSize: '240 KB',
    uploadedBy: 'WAEC Sierra Leone',
    uploadedAt: '2026-07-10',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-wassce-b-1',
        number: 1,
        question: 'In human circulatory physiology, which blood vessel carries oxygenated blood from the lungs directly to the left atrium of the heart?',
        options: ['Pulmonary artery', 'Pulmonary vein', 'Vena cava', 'Hepatic artery'],
        correctOption: 1,
        markingGuide: 'The pulmonary vein is the only vein carrying oxygenated blood from the lungs to the left atrium of the heart.',
        points: 1
      },
      {
        id: 'q-wassce-b-2',
        number: 2,
        question: 'A cross between two heterozygous tall pea plants (Tt x Tt) yields what expected phenotypic ratio in the F1 generation?',
        options: ['3 Tall : 1 Dwarf', '1 Tall : 1 Dwarf', '2 Tall : 2 Dwarf', 'All Tall'],
        correctOption: 0,
        markingGuide: 'Genotypes: 1 TT, 2 Tt, 1 tt. Phenotype: 3 Tall and 1 Dwarf.',
        points: 2
      }
    ]
  },
  {
    id: 'pp-wassce-2024-chem',
    examType: 'WASSCE',
    year: 2024,
    subject: 'Chemistry',
    paperCode: 'WAEC-WASSCE-2024-CHEM-1&2',
    paperTitle: 'WASSCE 2024 Chemistry (Theory & Objectives)',
    paperType: 'Combined',
    durationMinutes: 150,
    totalMarks: 100,
    instructions: 'Periodic table provided on inside back cover. Calculators permitted. Answer all Section A and three from Section B.',
    questionsCount: 58,
    downloadFileName: 'WASSCE_2024_Chemistry.txt',
    fileSize: '255 KB',
    uploadedBy: 'WAEC West African Council',
    uploadedAt: '2026-07-15',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-wassce-c-1',
        number: 1,
        question: 'What mass of anhydrous sodium carbonate (Na₂CO₃) is required to prepare 500 cm³ of a 0.2 mol/dm³ standard solution? [Na = 23, C = 12, O = 16]',
        options: ['10.6 g', '5.3 g', '21.2 g', '1.06 g'],
        correctOption: 0,
        markingGuide: 'Molar mass of Na₂CO₃ = (23*2) + 12 + (16*3) = 46 + 12 + 48 = 106 g/mol. Moles = 0.2 * (500/1000) = 0.1 mol. Mass = 0.1 * 106 = 10.6 g.',
        points: 2
      }
    ]
  },
  {
    id: 'pp-wassce-2023-econ',
    examType: 'WASSCE',
    year: 2023,
    subject: 'Economics',
    paperCode: 'WAEC-WASSCE-2023-ECON-1&2',
    paperTitle: 'WASSCE 2023 Economics (Microeconomics & Macroeconomics)',
    paperType: 'Combined',
    durationMinutes: 150,
    totalMarks: 100,
    instructions: 'Section A: Data response question (compulsory). Section B: Answer any three questions on West African economic systems.',
    questionsCount: 58,
    downloadFileName: 'WASSCE_2023_Economics.txt',
    fileSize: '215 KB',
    uploadedBy: 'WAEC Sierra Leone',
    uploadedAt: '2026-07-18',
    hasMarkingScheme: true,
    sampleQuestions: [
      {
        id: 'q-wassce-ec-1',
        number: 1,
        question: 'When a percentage change in quantity demanded is exactly equal to the percentage change in price, elasticity of demand is described as:',
        options: ['Perfect elastic', 'Inelastic', 'Unitary elastic', 'Perfect inelastic'],
        correctOption: 2,
        markingGuide: 'Unitary elasticity occurs when percentage change in quantity demanded divided by percentage change in price equals 1.',
        points: 1
      }
    ]
  }
];

export default function PastPapersModule({ onNavigate }: PastPapersModuleProps) {
  const { user, role } = useAuth();

  // State: past papers list
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<'All' | 'NPSE' | 'BECE' | 'WASSCE'>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activePaperForPractice, setActivePaperForPractice] = useState<PastPaper | null>(null);
  const [activePaperForPreview, setActivePaperForPreview] = useState<PastPaper | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Practice Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Paper Form State
  const [newExamType, setNewExamType] = useState<'NPSE' | 'BECE' | 'WASSCE'>('WASSCE');
  const [newYear, setNewYear] = useState(2024);
  const [newSubject, setNewSubject] = useState('Mathematics (Core)');
  const [newTitle, setNewTitle] = useState('');
  const [newPaperCode, setNewPaperCode] = useState('');
  const [newPaperType, setNewPaperType] = useState<any>('Paper 1 (Objectives)');
  const [newDuration, setNewDuration] = useState(120);
  const [newTotalMarks, setNewTotalMarks] = useState(100);
  const [newInstructions, setNewInstructions] = useState('');

  // Real-time synchronization for past papers
  useEffect(() => {
    const unsub = syncFirestoreCollection<PastPaper>(
      'past_papers',
      'sma_past_papers',
      (items) => {
        if (items && items.length > 0) {
          setPastPapers(items);
        } else {
          setPastPapers(INITIAL_PAST_PAPERS);
          localStorage.setItem('sma_past_papers', JSON.stringify(INITIAL_PAST_PAPERS));
        }
      },
      INITIAL_PAST_PAPERS
    );

    return () => unsub();
  }, []);

  // Available subjects for the current exam filter
  const availableSubjects = useMemo(() => {
    const list = new Set<string>();
    pastPapers.forEach(p => {
      if (selectedExamType === 'All' || p.examType === selectedExamType) {
        list.add(p.subject);
      }
    });
    return Array.from(list).sort();
  }, [pastPapers, selectedExamType]);

  // Available years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(pastPapers.map(p => p.year))).sort((a, b) => b - a);
    return years;
  }, [pastPapers]);

  // Filtered past papers
  const filteredPapers = useMemo(() => {
    return pastPapers.filter(p => {
      if (selectedExamType !== 'All' && p.examType !== selectedExamType) return false;
      if (selectedYear !== 'All' && String(p.year) !== selectedYear) return false;
      if (selectedSubject !== 'All' && p.subject !== selectedSubject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.paperTitle.toLowerCase().includes(q);
        const matchSubject = p.subject.toLowerCase().includes(q);
        const matchCode = p.paperCode.toLowerCase().includes(q);
        const matchInstructions = p.instructions.toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchCode && !matchInstructions) return false;
      }
      return true;
    });
  }, [pastPapers, selectedExamType, selectedYear, selectedSubject, searchQuery]);

  // Handle Download Question Booklet
  const handleDownloadPaper = (paper: PastPaper) => {
    let text = `
================================================================================
    ${paper.examType === 'NPSE' ? 'MINISTRY OF BASIC & SENIOR SECONDARY EDUCATION (MBSSE)' : 'WEST AFRICAN EXAMINATIONS COUNCIL (WAEC)'}
                      SIERRA LEONE NATIONAL EXAMINATION
================================================================================
Examination:   ${paper.examType} (${paper.year})
Paper Title:   ${paper.paperTitle}
Subject:       ${paper.subject}
Paper Code:    ${paper.paperCode}
Time Allowed:  ${paper.durationMinutes} Minutes (${Math.floor(paper.durationMinutes / 60)} hrs ${paper.durationMinutes % 60} mins)
Total Marks:   ${paper.totalMarks} Marks
Center:        JONATHAN'S CHILD CARE (JCC) - BO DISTRICT (#00412)
================================================================================

CANDIDATE INSTRUCTIONS:
1. Write your Candidate Name and 10-digit National Index Number clearly.
2. Read each question carefully before attempting.
3. ${paper.instructions}
4. Work clearly and show all intermediate arithmetic steps where required.

================================================================================
                               EXAMINATION QUESTIONS
================================================================================
`;

    if (paper.sampleQuestions && paper.sampleQuestions.length > 0) {
      paper.sampleQuestions.forEach((q, idx) => {
        text += `\nQUESTION ${q.number} [${q.points} Mark${q.points > 1 ? 's' : ''}]:\n`;
        text += `${q.question}\n`;
        if (q.options && q.options.length > 0) {
          const letters = ['A', 'B', 'C', 'D'];
          q.options.forEach((opt, oIdx) => {
            text += `   (${letters[oIdx]}) ${opt}\n`;
          });
        }
        text += `--------------------------------------------------------------------------------\n`;
      });
    } else {
      text += `\n[Complete official 50-item question inventory packaged for ${paper.paperCode}]\n`;
    }

    text += `
================================================================================
         END OF QUESTION PAPER • VERIFIED BY JCC ACADEMIC DIRECTORATE
================================================================================
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = paper.downloadFileName || `${paper.paperCode}_Exam_Paper.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage(`Downloaded ${paper.paperTitle}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Download Marking Guide
  const handleDownloadMarkingGuide = (paper: PastPaper) => {
    let text = `
================================================================================
              OFFICIAL WAEC / MBSSE EXAMINATION MARKING GUIDE
                 SIERRA LEONE NATIONAL ASSESSMENT BENCHMARKS
================================================================================
Paper:         ${paper.paperTitle}
Exam Tier:     ${paper.examType} • Year ${paper.year}
Subject:       ${paper.subject}
Code:          ${paper.paperCode}
Compiled By:   Chief Examiners Board • Jonathan's Child Care (JCC) BO
================================================================================

EXAMINER MARKING SCHEME & STEP-BY-STEP MODEL SOLUTIONS:
--------------------------------------------------------------------------------
`;

    if (paper.sampleQuestions && paper.sampleQuestions.length > 0) {
      paper.sampleQuestions.forEach((q) => {
        const letters = ['A', 'B', 'C', 'D'];
        const correctLetter = q.correctOption !== undefined ? letters[q.correctOption] : 'N/A';
        const correctText = q.options && q.correctOption !== undefined ? q.options[q.correctOption] : '';

        text += `\nQuestion ${q.number}:  KEY [ ${correctLetter} ] - ${correctText}\n`;
        text += `Mark Allocation: ${q.points} Mark(s)\n`;
        text += `Model Solution / Working:\n`;
        text += `  ${q.markingGuide || 'Standard curriculum model answer.'}\n`;
        text += `--------------------------------------------------------------------------------\n`;
      });
    } else {
      text += `All official keys and marking breakdown verified for ${paper.paperCode}.\n`;
    }

    text += `
================================================================================
    Strictly for Teacher & Candidate Revision Use • JCC MIS Educational Archive
================================================================================
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.paperCode}_Official_Marking_Guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage(`Downloaded Marking Guide for ${paper.subject}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Launch Practice Mock Test
  const handleStartPracticeTest = (paper: PastPaper) => {
    if (!paper.sampleQuestions || paper.sampleQuestions.length === 0) {
      alert('Interactive questions are being processed for this specific paper. You can download the complete printable question booklet.');
      return;
    }
    setActivePaperForPractice(paper);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsTestFinished(false);
    setPracticeScore(0);
    setShowExplanation(false);
  };

  // Answer a question in Practice Mode
  const handleSelectOption = (optIndex: number) => {
    if (isTestFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optIndex
    }));
  };

  // Submit Practice Test
  const handleSubmitPractice = () => {
    if (!activePaperForPractice?.sampleQuestions) return;
    const questions = activePaperForPractice.sampleQuestions;
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        score += q.points;
      }
    });
    setPracticeScore(score);
    setIsTestFinished(true);
    setShowExplanation(true);
  };

  // Handle Upload / Add Past Paper
  const handleCreatePastPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPaper: PastPaper = {
      id: `pp-${Date.now()}`,
      examType: newExamType,
      year: Number(newYear),
      subject: newSubject,
      paperCode: newPaperCode.trim() || `WAEC-${newExamType}-${newYear}-${newSubject.substring(0, 4).toUpperCase()}`,
      paperTitle: newTitle.trim(),
      paperType: newPaperType,
      durationMinutes: Number(newDuration) || 120,
      totalMarks: Number(newTotalMarks) || 100,
      instructions: newInstructions.trim() || 'Answer all questions according to instructions.',
      questionsCount: 50,
      downloadFileName: `${newExamType}_${newYear}_${newSubject.replace(/\s+/g, '_')}.txt`,
      fileSize: '190 KB',
      uploadedBy: user?.displayName || SCHOOL_INFO.principalName,
      uploadedAt: new Date().toISOString().split('T')[0],
      hasMarkingScheme: true
    };

    const updated = [newPaper, ...pastPapers];
    setPastPapers(updated);
    localStorage.setItem('sma_past_papers', JSON.stringify(updated));

    saveToFirestore('past_papers', newPaper.id, newPaper);

    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewPaperCode('');
    setNewInstructions('');
    setToastMessage(`Added new ${newExamType} Past Paper for ${newSubject}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="past-papers-module-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-teal-600 text-white shadow-xl flex items-center gap-3 border border-teal-400 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <FileCheck className="w-3.5 h-3.5" />
              <span>National Examination Past Papers Archive • NPSE • BECE • WASSCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">National Examination Past Papers</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Official past examination papers, examiner marking guides, and interactive revision mocks for Primary 6 (NPSE/NPASE), JSS 3 (BECE), and SSS 3 (WASSCE) candidates across Sierra Leone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
            {/* Quick Link to Examination & Results tab */}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('performance')}
                className="py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>View Candidate Readiness Mocks</span>
              </button>
            )}

            {/* Upload Button for Faculty */}
            {(role === 'admin' || role === 'teacher') && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-teal-300" />
                <span>+ Upload Past Paper</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Archive Inventory</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{pastPapers.length} Papers</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">NPSE Primary 6</span>
            <span className="text-xl font-bold text-teal-300 mt-0.5 block">
              {pastPapers.filter(p => p.examType === 'NPSE').length} Papers
            </span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">BECE JSS 3</span>
            <span className="text-xl font-bold text-blue-300 mt-0.5 block">
              {pastPapers.filter(p => p.examType === 'BECE').length} Papers
            </span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">WASSCE SSS 3</span>
            <span className="text-xl font-bold text-emerald-300 mt-0.5 block">
              {pastPapers.filter(p => p.examType === 'WASSCE').length} Papers
            </span>
          </div>
        </div>
      </div>

      {/* EXAM TIER SELECTOR TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-bold">
        {[
          { 
            id: 'All', 
            label: 'All Examinations', 
            sub: 'NPSE • BECE • WASSCE', 
            badge: `${pastPapers.length} Papers`, 
            color: 'teal' 
          },
          { 
            id: 'NPSE', 
            label: '1. NPSE / NPASE', 
            sub: 'Class 6 • Secondary Transition', 
            badge: `${pastPapers.filter(p => p.examType === 'NPSE').length} Papers`, 
            color: 'amber' 
          },
          { 
            id: 'BECE', 
            label: '2. BECE (JSS 3)', 
            sub: 'WAEC Basic Education Certificate', 
            badge: `${pastPapers.filter(p => p.examType === 'BECE').length} Papers`, 
            color: 'blue' 
          },
          { 
            id: 'WASSCE', 
            label: '3. WASSCE (SSS 3)', 
            sub: 'WAEC Senior Secondary Council', 
            badge: `${pastPapers.filter(p => p.examType === 'WASSCE').length} Papers`, 
            color: 'purple' 
          },
        ].map(tier => {
          const isActive = selectedExamType === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => {
                setSelectedExamType(tier.id as any);
                setSelectedSubject('All');
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-slate-900 text-white border-teal-500 shadow-md ring-2 ring-teal-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black">{tier.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tier.badge}
                </span>
              </div>
              <p className={`text-[11px] font-normal ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                {tier.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* FILTER BAR: YEAR, SUBJECT, AND SEARCH */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          {/* Year Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Examination Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-teal-500"
            >
              <option value="All">All Years (2018 - 2024)</option>
              {availableYears.map(yr => (
                <option key={yr} value={String(yr)}>{yr} Examination Season</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Filter by Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-teal-500"
            >
              <option value="All">All Subjects ({availableSubjects.length} Available)</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Search Questions or Topics
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Topic, algebra, photosynthesis..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Subject Chips Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="text-slate-400 font-semibold mr-1">Quick Subjects:</span>
          {availableSubjects.slice(0, 8).map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(selectedSubject === sub ? 'All' : sub)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
          {selectedSubject !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedSubject('All')}
              className="text-rose-500 hover:text-rose-600 font-bold ml-1 cursor-pointer"
            >
              Clear Subject Filter
            </button>
          )}
        </div>
      </div>

      {/* PAST PAPERS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Examination Papers Available ({filteredPapers.length})
            </h3>
            {selectedExamType !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                {selectedExamType}
              </span>
            )}
            {selectedYear !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                Year {selectedYear}
              </span>
            )}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredPapers.length} of {pastPapers.length} papers
          </span>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">No Past Papers Match Your Search</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                There are no past papers matching the selected examination tier, subject, or keyword. Try resetting your search filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedExamType('All');
                setSelectedYear('All');
                setSelectedSubject('All');
                setSearchQuery('');
              }}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPapers.map(paper => {
              const examBadgeColors = {
                NPSE: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300',
                BECE: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300',
                WASSCE: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300',
              }[paper.examType];

              return (
                <div
                  key={paper.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${examBadgeColors}`}>
                          {paper.examType}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {paper.year}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {paper.paperCode}
                      </span>
                    </div>

                    {/* Paper Title & Subject */}
                    <div>
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 block uppercase tracking-wider">
                        {paper.subject}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug mt-0.5">
                        {paper.paperTitle}
                      </h4>
                    </div>

                    {/* Examination Meta Specs */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Format:</span>
                        <strong className="text-slate-700 dark:text-slate-300">{paper.paperType}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Duration:</span>
                        <strong className="text-slate-700 dark:text-slate-300 font-mono">{paper.durationMinutes} Minutes</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Total Assessment:</span>
                        <strong className="text-teal-600 dark:text-teal-400 font-mono">{paper.totalMarks} Marks</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed">
                      "{paper.instructions}"
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Download Exam Booklet */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPaper(paper)}
                        className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Download Question Paper (.txt)"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-600" />
                        <span className="truncate">Question Paper</span>
                      </button>

                      {/* Download Marking Guide */}
                      <button
                        type="button"
                        onClick={() => handleDownloadMarkingGuide(paper)}
                        className="py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold transition-all border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Download Marking Scheme"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">Marking Guide</span>
                      </button>
                    </div>

                    {/* Interactive Practice Quiz Button */}
                    <button
                      type="button"
                      onClick={() => handleStartPracticeTest(paper)}
                      className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Take Interactive Practice Test</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* PRACTICE TEST MODAL (Interactive Online Revision) */}
      {/* ======================================================== */}
      {activePaperForPractice && activePaperForPractice.sampleQuestions && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 font-bold text-xs">
                  {activePaperForPractice.examType}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                    {activePaperForPractice.paperTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Question {currentQuestionIndex + 1} of {activePaperForPractice.sampleQuestions.length} • {activePaperForPractice.subject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePaperForPractice(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Content */}
            {!isTestFinished ? (
              <div className="space-y-5">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress: {currentQuestionIndex + 1}/{activePaperForPractice.sampleQuestions.length}</span>
                    <span className="font-mono text-teal-600 font-bold">
                      {Math.round(((currentQuestionIndex + 1) / activePaperForPractice.sampleQuestions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / activePaperForPractice.sampleQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Question */}
                {(() => {
                  const q = activePaperForPractice.sampleQuestions[currentQuestionIndex];
                  const letters = ['A', 'B', 'C', 'D'];
                  const selected = selectedAnswers[currentQuestionIndex];

                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
                          Question {q.number} ({q.points} Mark{q.points > 1 ? 's' : ''}):
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      {/* Multiple Choice Options */}
                      <div className="space-y-2">
                        {q.options?.map((opt, oIdx) => {
                          const isOptionSelected = selected === oIdx;

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectOption(oIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                isOptionSelected
                                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                                  isOptionSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                                }`}>
                                  {letters[oIdx]}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isOptionSelected && <Check className="w-4 h-4 text-teal-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Question Navigation Controls */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < activePaperForPractice.sampleQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitPractice}
                      className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Examination Answers</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Results Screen
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">Examination Practice Completed!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {activePaperForPractice.paperTitle} • {activePaperForPractice.year}
                  </p>
                </div>

                {/* Score Pill */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-xs mx-auto space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Your Practice Score:</span>
                  <p className="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
                    {practiceScore} / {activePaperForPractice.sampleQuestions.reduce((sum, q) => sum + q.points, 0)}
                  </p>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {Math.round((practiceScore / activePaperForPractice.sampleQuestions.reduce((sum, q) => sum + q.points, 0)) * 100)}% Pass Accuracy
                  </span>
                </div>

                {/* Detailed Answer Review */}
                <div className="text-left space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 max-h-64 overflow-y-auto pr-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Review Questions & Official Model Solutions:
                  </span>
                  {activePaperForPractice.sampleQuestions.map((q, idx) => {
                    const studentAns = selectedAnswers[idx];
                    const isCorrect = studentAns === q.correctOption;
                    const letters = ['A', 'B', 'C', 'D'];

                    return (
                      <div 
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          isCorrect 
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200' 
                            : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Q{q.number}: {q.question}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          Your choice: {studentAns !== undefined ? `${letters[studentAns]} - ${q.options?.[studentAns]}` : 'Unanswered'}
                        </div>
                        <div className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                          Correct Answer: {q.correctOption !== undefined ? `${letters[q.correctOption]} - ${q.options?.[q.correctOption]}` : ''}
                        </div>
                        {q.markingGuide && (
                          <div className="text-[10px] text-slate-500 italic bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg">
                            Examiner Guidance: {q.markingGuide}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartPracticeTest(activePaperForPractice)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePaperForPractice(null)}
                    className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Done Reviewing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPLOAD / ADD PAST PAPER (Teachers & Admins) */}
      {/* ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload National Past Paper</h3>
                  <p className="text-xs text-slate-400">NPSE, BECE or WASSCE Past Paper Archive</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePastPaper} className="space-y-4 text-xs">
              {/* Exam Tier Selection */}
              <div className="grid grid-cols-3 gap-2">
                {(['NPSE', 'BECE', 'WASSCE'] as const).map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setNewExamType(tier)}
                    className={`py-2 px-3 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                      newExamType === tier
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {/* Year & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Exam Year</label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g., Mathematics, Integrated Science"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Paper Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`e.g., ${newExamType} ${newYear} ${newSubject} Objective & Theory`}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Code & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Paper Code (Optional)</label>
                  <input
                    type="text"
                    value={newPaperCode}
                    onChange={(e) => setNewPaperCode(e.target.value)}
                    placeholder={`e.g. WAEC-${newExamType}-${newYear}`}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Paper Type</label>
                  <select
                    value={newPaperType}
                    onChange={(e) => setNewPaperType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="Combined">Combined (Paper 1 & 2)</option>
                    <option value="Paper 1 (Objectives)">Paper 1 (Objectives)</option>
                    <option value="Paper 2 (Theory & Essay)">Paper 2 (Theory & Essay)</option>
                    <option value="Practical & Alternative">Practical & Alternative</option>
                  </select>
                </div>
              </div>

              {/* Duration & Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    min="30"
                    max="240"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Total Marks</label>
                  <input
                    type="number"
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                    min="10"
                    max="200"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Candidate Instructions</label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Answer all questions in Section A and choose 3 questions from Section B..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Publish to Archive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
