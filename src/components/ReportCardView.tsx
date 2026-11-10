/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  ChevronLeft, 
  ArrowLeft,
  Award, 
  Calendar, 
  MapPin, 
  Phone, 
  Signature, 
  FileCheck,
  CheckSquare,
  Globe,
  Eye,
  X,
  Plus,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Student, StudentAcademicRecord, StudentClass } from '../types';
import { SCHOOL_INFO } from '../initialData';
import { getGradingScale, getSubjectsForClass, calculateGrade } from '../constants';
import { saveToFirestore } from '../services/firestoreSync';

interface ReportCardViewProps {
  students: Student[];
  records: StudentAcademicRecord[];
  onNavigateBack: () => void;
  initialStudentId?: string;
  onUpdateRecord?: (record: StudentAcademicRecord) => void;
}

export default function ReportCardView({ 
  students, 
  records, 
  onNavigateBack, 
  initialStudentId,
  onUpdateRecord 
}: ReportCardViewProps) {
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || (students[0]?.id || ''));
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3>(3); // default to final Term 3
  const [localRecords, setLocalRecords] = useState<StudentAcademicRecord[]>(records);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  // Keep selected student valid if students change
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    } else if (students.length > 0 && (!selectedStudentId || !students.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, initialStudentId, selectedStudentId]);

  const student = students.find(s => s.id === selectedStudentId);
  const record = localRecords.find(r => r.studentId === selectedStudentId);

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Generate Report Card for student if no academic record exists
  const handleGenerateReportCard = (targetStudent: Student) => {
    const subjects = getSubjectsForClass(targetStudent.currentClass, targetStudent.stream);
    
    // Generate marks for Term 1, 2, and 3
    const buildGradesForTerm = (baseCa: number, baseExam: number) => {
      return subjects.map(sub => {
        const caMax = targetStudent.currentClass.startsWith('Class') || targetStudent.currentClass.startsWith('Prep') ? 40 : 30;
        const examMax = targetStudent.currentClass.startsWith('Class') || targetStudent.currentClass.startsWith('Prep') ? 60 : 70;
        const caScore = Math.min(caMax, Math.round(baseCa * (caMax / 40)));
        const examScore = Math.min(examMax, Math.round(baseExam * (examMax / 60)));
        const totalScore = caScore + examScore;
        const { grade, remark } = calculateGrade(totalScore, targetStudent.currentClass);
        return {
          subject: sub,
          caScore,
          examScore,
          totalScore,
          grade,
          remark: remark || 'Good understanding demonstrated'
        };
      });
    };

    const newRecord: StudentAcademicRecord = {
      studentId: targetStudent.id,
      academicYear: '2025/2026',
      terms: {
        1: {
          grades: buildGradesForTerm(30, 48),
          attendance: { totalDays: 70, presentDays: 68 },
          conduct: 'Excellent',
          teacherRemarks: `${targetStudent.name} is attentive and demonstrates strong engagement in classroom activities.`,
          principalRemarks: `Satisfactory academic progress under ${SCHOOL_INFO.principalName} supervision.`
        },
        2: {
          grades: buildGradesForTerm(32, 50),
          attendance: { totalDays: 65, presentDays: 63 },
          conduct: 'Very Good',
          teacherRemarks: `Consistent academic discipline shown across all subjects.`,
          principalRemarks: `Keep maintaining high academic standards.`
        },
        3: {
          grades: buildGradesForTerm(34, 52),
          attendance: { totalDays: 72, presentDays: 70 },
          conduct: 'Excellent',
          teacherRemarks: `Outstanding effort throughout the academic session. Promoted to the next class level.`,
          principalRemarks: `Promoted. Approved by Director & Principal ${SCHOOL_INFO.principalName}.`
        }
      }
    };

    const updated = [newRecord, ...localRecords.filter(r => r.studentId !== targetStudent.id)];
    setLocalRecords(updated);
    try {
      localStorage.setItem('sma_academic_records', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    saveToFirestore('academic_records', newRecord.studentId, newRecord);
    if (onUpdateRecord) onUpdateRecord(newRecord);

    setToastMessage(`Generated official Terminal Report Card for ${targetStudent.name}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (students.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto mt-6 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100">No Registered Students in Database</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please register students in the Student Information module first to generate and print terminal report cards.
          </p>
        </div>
        <button 
          onClick={onNavigateBack} 
          className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Previous Page</span>
        </button>
      </div>
    );
  }

  const termData = record?.terms?.[selectedTerm];
  const grades = termData?.grades || [];

  // Metrics
  const subjectsCount = grades.length;
  const totalScoreSum = grades.reduce((sum, g) => sum + g.totalScore, 0);
  const averageScore = subjectsCount > 0 ? Math.round(totalScoreSum / subjectsCount) : 0;
  
  // Attendance metrics
  const attendancePresent = termData?.attendance?.presentDays || 0;
  const attendanceTotal = termData?.attendance?.totalDays || 0;
  const attendancePercentage = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

  // Promotion/Pass Decision
  let verdict = 'Promoted';
  let verdictColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  if (selectedTerm === 3) {
    if (averageScore < 45) {
      verdict = 'Held Over / Retained';
      verdictColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (averageScore < 55) {
      verdict = 'Promoted on Probation';
      verdictColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }
  }

  // Render the core printable report template
  const renderReportCardContent = (isModal: boolean = false) => {
    if (!student) return null;

    if (!record) {
      return (
        <div className="p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Terminal Report Card Not Yet Generated</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No continuous assessment or exam scores are on file for {student.name} ({student.currentClass}). Click below to generate the full terminal report card.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleGenerateReportCard(student)}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Official Terminal Report Card</span>
          </button>
        </div>
      );
    }

    return (
      <div 
        className={`bg-white border-2 border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md max-w-4xl mx-auto ${isModal ? 'shadow-2xl' : 'print:border-none print:shadow-none print:p-0'}`}
        id={isModal ? 'printable-report-preview-box' : 'printable-report-container'}
      >
        {/* Sierra Leone National Colors ribbon */}
        <div className="flex h-1.5 w-full overflow-hidden rounded-full">
          <div className="bg-emerald-500 w-1/3"></div>
          <div className="bg-white w-1/3 border-y border-slate-100"></div>
          <div className="bg-blue-500 w-1/3"></div>
        </div>

        {/* Report Card Header */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left border-b-2 border-slate-800 pb-5 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Official School Crest Logo */}
            <img 
              src={SCHOOL_INFO.logo} 
              alt={`${SCHOOL_INFO.name} Crest`} 
              className="w-16 h-16 md:w-20 md:h-20 object-contain bg-white rounded-xl border border-slate-200 p-1 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight font-sans uppercase">{SCHOOL_INFO.name}</h1>
              <p className="text-[11px] font-bold text-indigo-600 italic">" {SCHOOL_INFO.motto} "</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {SCHOOL_INFO.address}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {SCHOOL_INFO.phone}</span>
                {SCHOOL_INFO.email && <span className="flex items-center gap-1">✉ {SCHOOL_INFO.email}</span>}
              </div>
            </div>
          </div>

          <div className="text-center md:text-right md:shrink-0">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-md border border-slate-900">
              Official Academic Report
            </span>
            <p className="text-xs font-bold text-slate-700 mt-2">Academic Year: {record.academicYear}</p>
            <p className="text-xs font-bold text-indigo-600 mt-0.5">Term {selectedTerm} Terminal Assessment</p>
          </div>
        </div>

        {/* Student Profile Segment */}
        <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs font-medium text-slate-600">
          {student.profileImage && (
            <div className="shrink-0 flex justify-center items-center">
              <img
                src={student.profileImage}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover border border-slate-300 shadow-sm"
              />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Student Name</p>
              <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Admission ID</p>
              <p className="font-bold text-slate-800 font-mono">{student.admissionNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Current Grade/Class</p>
              <p className="font-bold text-slate-800">
                {student.currentClass}
                {student.stream ? ` (${student.stream} Stream)` : ''}
                {student.classSection ? ` - ${student.classSection}` : ''}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Student Gender</p>
              <p className="font-bold text-slate-800">{student.gender === 'Male' ? 'Boy' : 'Girl'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Date of Birth</p>
              <p className="font-bold text-slate-800">{student.dateOfBirth}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Parent / Guardian</p>
              <p className="font-bold text-slate-800">{student.parentName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Guardian Phone</p>
              <p className="font-bold text-slate-800 font-mono">{student.parentPhone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Term Enrollment Status</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 mt-0.5">
                Active Registry
              </span>
            </div>
          </div>
        </div>

        {/* Academic Marks Ledger */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest border-l-4 border-slate-900 pl-2">
            SUBJECT-WISE PERFORMANCE MATRIX
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-500 font-black uppercase tracking-wider">
                  <th className="py-2">Subject Name</th>
                  <th className="py-2 text-center">Continuous Assessment ({student.currentClass.startsWith('Class') || student.currentClass.startsWith('Prep') ? '40' : '30'} marks)</th>
                  <th className="py-2 text-center">Terminal Exam ({student.currentClass.startsWith('Class') || student.currentClass.startsWith('Prep') ? '60' : '70'} marks)</th>
                  <th className="py-2 text-center">Total Score (100)</th>
                  <th className="py-2 text-center">Grade</th>
                  <th className="py-2 text-right">Teacher Verdict / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {grades.map((g) => (
                  <tr key={g.subject}>
                    <td className="py-2.5 font-bold text-slate-800">{g.subject}</td>
                    <td className="py-2.5 text-center font-mono">{g.caScore}</td>
                    <td className="py-2.5 text-center font-mono">{g.examScore}</td>
                    <td className="py-2.5 text-center font-black font-mono">{g.totalScore}</td>
                    <td className="py-2.5 text-center">
                      <span className="font-bold font-mono border border-slate-300 px-1.5 py-0.5 rounded">
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-[10px] text-slate-500 italic font-medium">{g.remark}</td>
                  </tr>
                ))}
                {grades.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No terminal grade files entered for Term {selectedTerm}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terminal Aggregates & Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t-2 border-slate-800 pt-5">
          
          {/* Left Block: Summary Statistics */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Performance Analytics Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-medium">Term Average</span>
                <span className="text-xl font-black text-slate-800 mt-1">{averageScore}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-medium">Attendance Rate</span>
                <span className="text-xl font-black text-slate-800 mt-1">{attendancePercentage}% <span className="text-[10px] text-slate-400 font-normal">({attendancePresent}/{attendanceTotal} days)</span></span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center col-span-2">
                <span className="text-[10px] text-slate-400 font-medium">Conduct & Deportment Rating</span>
                <span className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-500" /> {termData?.conduct || 'Excellent'}
                </span>
              </div>
            </div>

            {/* If Term 3, display promotion verdict */}
            {selectedTerm === 3 && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${verdictColor}`}>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest opacity-80">Next Session Status</span>
                  <p className="text-sm font-black mt-0.5">{verdict}</p>
                </div>
                <FileCheck className="w-6 h-6 opacity-75 shrink-0" />
              </div>
            )}
          </div>

          {/* Right Block: Official Evaluation Comments */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Formal Educator Assessment</h4>
            <div className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Class Teacher's Assessment</span>
                <p className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 italic leading-relaxed text-slate-700">
                  "{termData?.teacherRemarks || 'Continuous diligent focus on basic reading skills recommended.'}"
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Principal's Board Evaluation</span>
                <p className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 italic leading-relaxed text-slate-700">
                  "{termData?.principalRemarks || `Approved academic standing. Maintained high standards under ${SCHOOL_INFO.principalName}.`}"
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Grading Scale Guide & Legal Signature Stamp Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
          {/* Grading Legend */}
          <div>
            <p className="font-bold text-slate-700 uppercase tracking-wider mb-2">Grading Legend Guide</p>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {getGradingScale(student.currentClass).map(scale => (
                <span key={scale.grade} className="px-1.5 py-0.5 border border-slate-200 rounded font-mono">
                  <span className="font-bold text-slate-700">{scale.grade}</span> ({scale.minScore}+) {scale.remark}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[9px] text-slate-400">
              * Official national education criteria: WAEC (BECE/WASSCE) rules applied for secondary levels. Prep & primary rules apply elsewhere.
            </p>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-4">
            <div className="text-center w-1/2">
              <div className="h-8 border-b border-slate-400/80 w-32 mx-auto"></div>
              <p className="mt-1 font-semibold text-slate-600">Class Teacher</p>
              <p className="text-[8px] text-slate-400">{SCHOOL_INFO.name}</p>
            </div>
            <div className="text-center w-1/2 relative">
              {/* Virtual stamp placeholder */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-indigo-500/30 flex items-center justify-center rotate-12 text-[8px] text-indigo-500/40 font-black pointer-events-none uppercase">
                JCC Seal
              </div>
              <div className="h-8 border-b border-slate-400/80 w-36 mx-auto"></div>
              <p className="mt-1 font-bold text-slate-800">{SCHOOL_INFO.principalName}</p>
              <p className="text-[8px] text-slate-500 font-medium">{SCHOOL_INFO.principalTitle}</p>
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6" id="report-card-portal">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center gap-3 border border-indigo-400 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Controller Bar - Hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onNavigateBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Go Back"
            id="report-card-back-btn"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-bold sm:hidden">Back</span>
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Student Terminal Report Card</h2>
            <p className="text-xs text-slate-400">Generate, preview, and print official terminal academic reports</p>
          </div>
        </div>

        {/* Filters and Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Select Student */}
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {students.filter(s => s.status === 'Active').map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.currentClass})</option>
            ))}
          </select>

          {/* Select Term */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(parseInt(e.target.value) as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="1">Term 1 Record</option>
            <option value="2">Term 2 Record</option>
            <option value="3">Term 3 Record (Final)</option>
          </select>

          {/* Generate Button if Record is Missing */}
          {student && !record && (
            <button
              type="button"
              onClick={() => handleGenerateReportCard(student)}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Generate Report</span>
            </button>
          )}

          {/* Print Preview Button */}
          <button 
            type="button"
            onClick={() => setIsPrintPreviewOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Open print preview mode"
            id="report-card-preview-btn"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Print Preview</span>
          </button>

          {/* Print Now Button */}
          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            id="report-card-print-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Page Report Card Display */}
      {renderReportCardContent(false)}

      {/* ======================================================== */}
      {/* DEDICATED PRINT PREVIEW MODAL */}
      {/* ======================================================== */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col p-4 sm:p-6 overflow-y-auto animate-fade-in">
          {/* Preview Toolbar */}
          <div className="max-w-4xl w-full mx-auto mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Print Preview (A4 Formatted View)</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    Official Document
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {student?.name} • Class {student?.currentClass} • Term {selectedTerm}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintPreviewOpen(false)}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Close Preview</span>
              </button>
            </div>
          </div>

          {/* Realistic A4 Paper Preview Container */}
          <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-300 overflow-hidden">
            {renderReportCardContent(true)}
          </div>
        </div>
      )}
    </div>
  );
}
