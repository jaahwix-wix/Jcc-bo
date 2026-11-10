/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ClipboardList, 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  UploadCloud, 
  Upload,
  Paperclip,
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  GraduationCap, 
  User, 
  Calendar, 
  Award, 
  Trash2, 
  FileText, 
  X, 
  Send, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  School,
  Layers,
  BookOpenCheck,
  CheckCheck
} from 'lucide-react';
import { Student, StudentClass, Assignment, Submission, Teacher } from '../types';
import { CLASSES_LIST, CLASS_GROUPS, getSubjectsForClass, getTierForClass } from '../constants';
import { SCHOOL_INFO } from '../initialData';
import { useAuth } from '../context/AuthContext';
import { syncFirestoreCollection, saveToFirestore, deleteFromFirestore } from '../services/firestoreSync';

interface AssignmentsModuleProps {
  students: Student[];
  onNavigate?: (tab: string, arg?: any) => void;
}

const DEFAULT_INITIAL_ASSIGNMENTS: Assignment[] = [];

export default function AssignmentsModule({ students, onNavigate }: AssignmentsModuleProps) {
  const { user, role } = useAuth();

  // State: assignments and submissions
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Filtering State
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Graded'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [activeAssignmentForSubmission, setActiveAssignmentForSubmission] = useState<Assignment | null>(null);
  const [activeAssignmentForGrading, setActiveAssignmentForGrading] = useState<Assignment | null>(null);
  const [activeSubmissionToGrade, setActiveSubmissionToGrade] = useState<Submission | null>(null);

  // Notice toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student portal context resolution
  const activeStudentAdmission = typeof window !== 'undefined' ? localStorage.getItem('sma_active_portal_student') : null;
  const currentStudent = useMemo(() => {
    if (!students || students.length === 0) return null;
    if (activeStudentAdmission) {
      return students.find(s => s.admissionNumber === activeStudentAdmission) || null;
    }
    if (user?.role === 'student_parent') {
      return students.find(s => s.id === user.uid || s.name === user.displayName) || students[0] || null;
    }
    return null;
  }, [students, activeStudentAdmission, user]);

  // Form State for Creating an Assignment
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState<StudentClass>('Primary 4');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newDueDate, setNewDueDate] = useState('2026-11-25');
  const [newMaxPoints, setNewMaxPoints] = useState(30);
  const [newDescription, setNewDescription] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentSize, setNewAttachmentSize] = useState('');
  const [newAttachmentData, setNewAttachmentData] = useState('');
  const teacherFileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Student Submission
  const [submitStudentId, setSubmitStudentId] = useState(currentStudent?.id || '');
  const [submitTextResponse, setSubmitTextResponse] = useState('');
  const [submitFileName, setSubmitFileName] = useState('');
  const [submitFileSize, setSubmitFileSize] = useState('');
  const [submitFileData, setSubmitFileData] = useState('');
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Grading
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Real-time synchronization for assignments
  useEffect(() => {
    const unsubAssignments = syncFirestoreCollection<Assignment>(
      'assignments',
      'sma_assignments',
      (items) => {
        setAssignments(items || []);
      },
      []
    );

    // Sync submissions
    const unsubSubmissions = syncFirestoreCollection<Submission>(
      'assignment_submissions',
      'sma_submissions',
      (items) => {
        if (items) setSubmissions(items);
      },
      []
    );

    return () => {
      unsubAssignments();
      unsubSubmissions();
    };
  }, []);

  // Sync current student ID if found
  useEffect(() => {
    if (currentStudent && !submitStudentId) {
      setSubmitStudentId(currentStudent.id);
    }
  }, [currentStudent, submitStudentId]);

  // Update subject list when changing class in create modal
  const createModalSubjects = useMemo(() => {
    return getSubjectsForClass(newClass);
  }, [newClass]);

  useEffect(() => {
    if (createModalSubjects.length > 0 && !createModalSubjects.includes(newSubject)) {
      setNewSubject(createModalSubjects[0]);
    }
  }, [createModalSubjects, newSubject]);

  // Available subjects based on active class selection
  const availableFilterSubjects = useMemo(() => {
    if (selectedClass !== 'All') {
      return getSubjectsForClass(selectedClass as StudentClass);
    }
    // If a tier is selected
    if (selectedTier !== 'All') {
      const sampleClassInTier = CLASS_GROUPS.find(g => g.tier === selectedTier)?.classes[0] || 'Primary 1';
      return getSubjectsForClass(sampleClassInTier);
    }
    // Global list of popular subjects across all levels
    return [
      'Mathematics',
      'English Language',
      'Integrated Science',
      'General Science',
      'Social Studies',
      'Language Development & Phonics',
      'Early Numeracy',
      'Biology',
      'Chemistry',
      'Physics',
      'Economics',
      'Government',
      'Agricultural Science',
      'Computer Studies / ICT',
      'French'
    ];
  }, [selectedClass, selectedTier]);

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter(item => {
      // 1. Tier Filter
      if (selectedTier !== 'All') {
        const itemTier = getTierForClass(item.className);
        if (itemTier !== selectedTier) return false;
      }

      // 2. Class Filter
      if (selectedClass !== 'All' && item.className !== selectedClass) {
        return false;
      }

      // 3. Subject Filter
      if (selectedSubject !== 'All' && item.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      // 4. Status Filter (relevant if a student context exists)
      if (statusFilter !== 'All' && currentStudent) {
        const sub = submissions.find(s => s.assignmentId === item.id && s.studentId === currentStudent.id);
        if (statusFilter === 'Pending' && sub) return false;
        if (statusFilter === 'Submitted' && (!sub || sub.status === 'Graded')) return false;
        if (statusFilter === 'Graded' && sub?.status !== 'Graded') return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchSubject = item.subject.toLowerCase().includes(q);
        const matchTeacher = item.teacherName.toLowerCase().includes(q);
        const matchClass = item.className.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubject && !matchTeacher && !matchClass) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, selectedTier, selectedClass, selectedSubject, statusFilter, searchQuery, currentStudent, submissions]);

  // Handle Teacher File Upload
  const handleTeacherFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    setNewAttachmentName(file.name);
    setNewAttachmentSize(sizeStr);
    const reader = new FileReader();
    reader.onload = () => {
      setNewAttachmentData(reader.result as string);
    };
    reader.readAsDataURL(file);
    setToastMessage(`Selected worksheet: ${file.name} (${sizeStr})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearTeacherFile = () => {
    setNewAttachmentName('');
    setNewAttachmentSize('');
    setNewAttachmentData('');
    if (teacherFileInputRef.current) teacherFileInputRef.current.value = '';
  };

  // Handle Student File Upload
  const handleStudentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    setSubmitFileName(file.name);
    setSubmitFileSize(sizeStr);
    const reader = new FileReader();
    reader.onload = () => {
      setSubmitFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
    setToastMessage(`Attached file: ${file.name} (${sizeStr})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearStudentFile = () => {
    setSubmitFileName('');
    setSubmitFileSize('');
    setSubmitFileData('');
    if (studentFileInputRef.current) studentFileInputRef.current.value = '';
  };

  // Handle Download Assignment Worksheet (Direct file or formatted activity sheet)
  const handleDownloadWorksheet = (assign: Assignment) => {
    if (assign.attachmentData) {
      const a = document.createElement('a');
      a.href = assign.attachmentData;
      a.download = assign.attachmentName || `${assign.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Worksheet.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setToastMessage(`Downloaded file: ${assign.attachmentName || assign.title}`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const textContent = `
================================================================================
           JONATHAN'S CHILD CARE (JCC) - ACADEMIC ASSIGNMENT SHEET
                    Bo District • Bo City, Sierra Leone
================================================================================
Title:        ${assign.title}
Subject:      ${assign.subject}
Class Level:  ${assign.className}
Teacher:      ${assign.teacherName}
Due Date:     ${assign.dueDate}
Total Marks:  ${assign.maxPoints} Points
Date Issued:  ${new Date(assign.createdAt).toLocaleDateString()}
================================================================================

INSTRUCTIONS & QUESTIONS:
--------------------------------------------------------------------------------
${assign.description}

ATTACHMENT REFERENCE:
${assign.attachmentName || 'Standard Classroom Exercise Workbook'}

STUDENT SUBMISSION INSTRUCTIONS:
1. Write or type your answers thoroughly.
2. Log into the JCC Student & Parent Portal with your Admission Number.
3. Open the "Assignments" tab and submit your response before the due date.

================================================================================
    Director & Principal: Jonathan Davis • JCC Management Information System
================================================================================
`.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assign.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Worksheet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage(`Downloaded worksheet for ${assign.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Download Student's Submitted Work (Document / Image / Solution Notes)
  const handleDownloadStudentSubmission = (sub: Submission) => {
    if (sub.fileData) {
      const a = document.createElement('a');
      a.href = sub.fileData;
      a.download = sub.fileName || `${sub.studentName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Submission.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setToastMessage(`Downloaded submission file: ${sub.fileName}`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const textContent = `================================================================================
           JONATHAN'S CHILD CARE (JCC) - PUPIL HOMEWORK SUBMISSION
                    Bo District • Bo City, Sierra Leone
================================================================================
Student Name:     ${sub.studentName}
Student ID:       ${sub.studentId}
Class Level:      ${sub.className}
Submitted At:     ${new Date(sub.submittedAt).toLocaleString()}
Status:           ${sub.status}
Score Awarded:    ${sub.score !== undefined ? `${sub.score} Points` : 'Pending Teacher Evaluation'}
Attached File:    ${sub.fileName || 'Direct Solution'} (${sub.fileSize || 'Text Response'})
================================================================================

PUPIL'S ANSWERS & WORK:
--------------------------------------------------------------------------------
${sub.textResponse || '(Refer to uploaded document/image)'}

--------------------------------------------------------------------------------
TEACHER EVALUATION & FEEDBACK:
--------------------------------------------------------------------------------
${sub.feedback || 'Pending educator evaluation and grading.'}

================================================================================
    Director & Principal: Jonathan Davis • JCC Management Information System
================================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sub.studentName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Submission.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage(`Downloaded submission from ${sub.studentName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const teacherName = user?.displayName || SCHOOL_INFO.principalName;
    const teacherId = user?.uid || 'tch-admin';

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      teacherId,
      teacherName,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Complete the assigned questions and submit before the deadline.',
      subject: newSubject,
      className: newClass,
      dueDate: newDueDate,
      maxPoints: Number(newMaxPoints) || 30,
      createdAt: new Date().toISOString(),
      attachmentName: newAttachmentName.trim() || `${newSubject}_Worksheet_${newClass}.pdf`,
      attachmentSize: newAttachmentSize || '250 KB',
      attachmentData: newAttachmentData || undefined
    };

    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    localStorage.setItem('sma_assignments', JSON.stringify(updated));

    // Save to Cloud Firestore & Hostinger
    saveToFirestore('assignments', newAssignment.id, newAssignment);

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewAttachmentName('');
    setNewAttachmentSize('');
    setNewAttachmentData('');
    if (teacherFileInputRef.current) teacherFileInputRef.current.value = '';
    setToastMessage(`Assignment "${newAssignment.title}" broadcasted to ${newAssignment.className}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Delete Assignment
  const handleDeleteAssignment = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete assignment "${title}"?`)) return;

    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    localStorage.setItem('sma_assignments', JSON.stringify(updated));
    deleteFromFirestore('assignments', id);

    setToastMessage(`Deleted assignment: ${title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Submit Student Assignment
  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentForSubmission) return;

    const targetStudent = students.find(s => s.id === submitStudentId) || currentStudent;
    if (!targetStudent) {
      alert('Please select a student record to submit this assignment.');
      return;
    }

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId: activeAssignmentForSubmission.id,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      className: activeAssignmentForSubmission.className,
      submittedAt: new Date().toISOString(),
      textResponse: submitTextResponse.trim() || 'Homework completed and submitted via JCC Student Portal.',
      fileName: submitFileName.trim() || `${targetStudent.name.replace(/\s+/g, '_')}_Completed_Homework.pdf`,
      fileSize: submitFileSize || '180 KB',
      fileData: submitFileData || undefined,
      status: 'Pending'
    };

    // Filter out previous submission if replacing
    const filteredSubs = submissions.filter(
      s => !(s.assignmentId === activeAssignmentForSubmission.id && s.studentId === targetStudent.id)
    );
    const updatedSubs = [newSub, ...filteredSubs];

    setSubmissions(updatedSubs);
    localStorage.setItem('sma_submissions', JSON.stringify(updatedSubs));

    // Save to Firestore & Hostinger
    saveToFirestore('assignment_submissions', newSub.id, newSub);

    setIsSubmitModalOpen(false);
    setSubmitTextResponse('');
    setSubmitFileName('');
    setSubmitFileSize('');
    setSubmitFileData('');
    if (studentFileInputRef.current) studentFileInputRef.current.value = '';
    setActiveAssignmentForSubmission(null);
    setToastMessage(`Homework for "${activeAssignmentForSubmission.title}" submitted successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Grade Submission
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmissionToGrade || !activeAssignmentForGrading) return;

    const updatedSub: Submission = {
      ...activeSubmissionToGrade,
      status: 'Graded',
      score: Number(gradeScore),
      feedback: gradeFeedback.trim() || 'Good effort. Keep up the high academic standard.'
    };

    const updatedList = submissions.map(s => s.id === updatedSub.id ? updatedSub : s);
    setSubmissions(updatedList);
    localStorage.setItem('sma_submissions', JSON.stringify(updatedList));

    saveToFirestore('assignment_submissions', updatedSub.id, updatedSub);

    setActiveSubmissionToGrade(null);
    setGradeFeedback('');
    setToastMessage(`Graded ${updatedSub.studentName}: ${gradeScore}/${activeAssignmentForGrading.maxPoints} Marks`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Navigate to Student Portal for specific student
  const handleLaunchStudentPortal = (studentAdmission?: string) => {
    if (studentAdmission) {
      localStorage.setItem('sma_active_portal_student', studentAdmission);
    }
    if (onNavigate) {
      onNavigate('student-portal');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="assignments-module-container">
      {/* Toast Notification */}
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
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Nursery 1 to SSS 3 • Subject-Wise Assignments & Homework Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Academic Assignments & Coursework</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Standardized curriculum assignments across all levels from Nursery 1 to SSS 3. Filter by subject, download worksheets, submit homework, and seamlessly access the student & parent portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
            {/* Direct Access Student Portal Button */}
            <button
              type="button"
              onClick={() => handleLaunchStudentPortal()}
              className="py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Open Student & Parent Portal</span>
            </button>

            {/* Post Assignment Button (Teachers / Admins) */}
            {(role === 'admin' || role === 'teacher') && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-teal-300" />
                <span>+ Post New Assignment</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Total Active Tasks</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{assignments.length} Tasks</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Class Coverage</span>
            <span className="text-xl font-bold text-teal-300 mt-0.5 block">Nursery 1 - SSS 3</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Submissions Received</span>
            <span className="text-xl font-bold text-emerald-300 mt-0.5 block">{submissions.length} Submissions</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Cloud Database Sync</span>
            <span className="text-xl font-bold text-teal-200 mt-0.5 block">100% Synced</span>
          </div>
        </div>
      </div>

      {/* STUDENT PORTAL GATEWAY BANNER (Personalized if student context is active) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {currentStudent ? `Student Portal Gateway: ${currentStudent.name}` : 'Student & Parent Portal Gateway'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                {currentStudent ? currentStudent.currentClass : 'All 15 Classes'}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
              {currentStudent 
                ? `Admission No: ${currentStudent.admissionNumber} • You have access to submit homework, review teacher grades, and view report cards.`
                : 'Select any enrolled student from Nursery 1 to SSS 3 to immediately switch into their personal portal view.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick student picker if not locked into a student account */}
          {students.length > 0 && !currentStudent && (
            <select
              onChange={(e) => handleLaunchStudentPortal(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-teal-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              defaultValue=""
            >
              <option value="" disabled>Select Pupil to Access Portal...</option>
              {students.slice(0, 15).map(s => (
                <option key={s.id} value={s.admissionNumber}>
                  {s.name} ({s.currentClass} • {s.admissionNumber})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => handleLaunchStudentPortal()}
            className="py-2 px-3.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Enter Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS: LEVEL, CLASS & SUBJECT FILTER TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        
        {/* Tier Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>School Tier:</span>
          </span>

          {[
            { id: 'All', label: 'All Levels (Nursery - SSS)' },
            { id: 'Nursery', label: '1. Nursery (Nursery 1 - 3)' },
            { id: 'Primary', label: '2. Primary (Primary 1 - 6)' },
            { id: 'JSS', label: '3. Junior Secondary (JSS 1 - 3)' },
            { id: 'SSS', label: '4. Senior Secondary (SSS 1 - 3)' },
          ].map(tier => {
            const isActive = selectedTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => {
                  setSelectedTier(tier.id);
                  setSelectedClass('All');
                  setSelectedSubject('All');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>

        {/* Specific Class & Subject Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          {/* Class Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Filter by Class (Nursery 1 to SSS 3)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject('All');
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-teal-500"
            >
              <option value="All">All Classes ({assignments.length} Tasks)</option>
              {CLASSES_LIST.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
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
              <option value="All">All Subjects (Complete Curriculum)</option>
              {availableFilterSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Submission Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Open / Pending Submission</option>
              <option value="Submitted">Submitted (Awaiting Grading)</option>
              <option value="Graded">Graded with Feedback</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Search Assignment
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Topic, title or teacher..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Subject Chips Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="text-slate-400 font-semibold mr-1">Quick Subjects:</span>
          {availableFilterSubjects.slice(0, 7).map(sub => (
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

      {/* ASSIGNMENTS LIST GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Active Coursework & Homework ({filteredAssignments.length})
            </h3>
            {selectedClass !== 'All' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                {selectedClass}
              </span>
            )}
            {selectedSubject !== 'All' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                {selectedSubject}
              </span>
            )}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </span>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">No Assignments Match This Filter</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                There are currently no coursework tasks for {selectedClass === 'All' ? 'the selected tier' : selectedClass} in {selectedSubject === 'All' ? 'all subjects' : selectedSubject}.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('All');
                  setSelectedClass('All');
                  setSelectedSubject('All');
                  setStatusFilter('All');
                  setSearchQuery('');
                }}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
              {(role === 'admin' || role === 'teacher') && (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  + Post First Assignment
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.map(assign => {
              // Check if current student has submitted
              const studentSubmission = currentStudent 
                ? submissions.find(s => s.assignmentId === assign.id && s.studentId === currentStudent.id)
                : null;

              // Total submissions for this assignment (for teachers/admins)
              const assignmentSubs = submissions.filter(s => s.assignmentId === assign.id);

              return (
                <div 
                  key={assign.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Top Badges */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {assign.className}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {assign.subject}
                        </span>
                      </div>

                      {/* Delete button (Admins/Teachers) */}
                      {(role === 'admin' || role === 'teacher') && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(assign.id, assign.title)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {assign.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                        {assign.description}
                      </p>
                    </div>

                    {/* Metadata & Deadlines */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{assign.teacherName}</span>
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {assign.maxPoints} Marks
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due Date:</span>
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {assign.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Submission Status for Current Student */}
                    {currentStudent && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                        {studentSubmission ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{studentSubmission.status === 'Graded' ? 'Graded by Teacher' : 'Submitted'}</span>
                              </span>
                              {studentSubmission.score !== undefined && (
                                <span className="font-black font-mono text-emerald-700 dark:text-emerald-300 text-xs bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                                  {studentSubmission.score} / {assign.maxPoints}
                                </span>
                              )}
                            </div>
                            {studentSubmission.feedback && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                                "{studentSubmission.feedback}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Your Submission</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-wider">Open</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Download Worksheet Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadWorksheet(assign)}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Download Activity Sheet"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-600" />
                        <span className="truncate">Worksheet</span>
                      </button>

                      {/* Submit Homework Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAssignmentForSubmission(assign);
                          setIsSubmitModalOpen(true);
                        }}
                        className="py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span className="truncate">
                          {studentSubmission ? 'Resubmit' : 'Submit'}
                        </span>
                      </button>
                    </div>

                    {/* Teacher Submissions Review Button */}
                    {(role === 'admin' || role === 'teacher') && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAssignmentForGrading(assign);
                          setIsGradingModalOpen(true);
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] transition-colors border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Review Submissions ({assignmentSubs.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE & POST ASSIGNMENT (Teachers/Admin) */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Post Academic Assignment</h3>
                  <p className="text-xs text-slate-400">Broadcast homework for any class from Nursery 1 to SSS 3</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              {/* Target Class Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Target Class Level</label>
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value as StudentClass)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                >
                  {CLASSES_LIST.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                >
                  {createModalSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Assignment Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Long Division Practice & Story Problems"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              {/* Due Date & Max Points */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Total Marks / Points</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newMaxPoints}
                    onChange={(e) => setNewMaxPoints(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* Description & Questions */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Instructions, Prompts & Questions</label>
                <textarea
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Type the homework questions, exercise numbers, and guidance for pupils..."
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              {/* Functional Teacher Worksheet Upload */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Upload Worksheet or Activity File (Functional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">PDF, Word, TXT, Images</span>
                </div>

                <input
                  type="file"
                  ref={teacherFileInputRef}
                  onChange={handleTeacherFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                  id="teacher-assignment-file-input"
                />

                {newAttachmentName ? (
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-teal-600 text-white rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-teal-950 dark:text-teal-200 block truncate text-xs">
                          {newAttachmentName}
                        </span>
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono">
                          {newAttachmentSize || 'Attached and ready for pupils'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearTeacherFile}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => teacherFileInputRef.current?.click()}
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-teal-50/30 dark:hover:bg-teal-950/30"
                  >
                    <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Click to Upload Assignment File / Worksheet</span>
                  </button>
                )}

                <div className="pt-1">
                  <input
                    type="text"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    placeholder="Custom attachment label (e.g. Mathematics_Workbook_Exercise.pdf)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: STUDENT HOMEWORK SUBMISSION */}
      {/* ======================================================== */}
      {isSubmitModalOpen && activeAssignmentForSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Submit Homework Assignment</h3>
                  <p className="text-xs text-slate-400">{activeAssignmentForSubmission.title} ({activeAssignmentForSubmission.className})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
              {/* Student Identification */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Pupil Submitting Homework</label>
                {currentStudent ? (
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-slate-900 dark:text-white font-bold flex items-center justify-between">
                    <span>{currentStudent.name}</span>
                    <span className="font-mono text-teal-700 dark:text-teal-400">{currentStudent.admissionNumber}</span>
                  </div>
                ) : (
                  <select
                    value={submitStudentId}
                    onChange={(e) => setSubmitStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Select Enrolled Pupil...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.currentClass} • {s.admissionNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Assignment Prompt Recap */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-[10px] uppercase text-slate-400 block">Teacher Questions / Instructions:</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeAssignmentForSubmission.description}
                </p>
              </div>

              {/* Typed Response */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Your Answers / Solution Notes</label>
                <textarea
                  rows={4}
                  value={submitTextResponse}
                  onChange={(e) => setSubmitTextResponse(e.target.value)}
                  placeholder="Type your answers, solutions, or explanation here..."
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              {/* Functional Student Homework File Upload */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Upload Completed Homework File or Handwritten Photo</span>
                  </label>
                  <span className="text-[10px] text-slate-400">PDF, Word, TXT, Images</span>
                </div>

                <input
                  type="file"
                  ref={studentFileInputRef}
                  onChange={handleStudentFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                  id="student-homework-file-input"
                />

                {submitFileName ? (
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-teal-600 text-white rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-teal-950 dark:text-teal-200 block truncate text-xs">
                          {submitFileName}
                        </span>
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono">
                          {submitFileSize || 'Ready for teacher submission'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearStudentFile}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Remove uploaded file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => studentFileInputRef.current?.click()}
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-teal-50/30 dark:hover:bg-teal-950/30"
                  >
                    <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Click to Upload Homework File / Photo</span>
                  </button>
                )}

                <div className="pt-1">
                  <input
                    type="text"
                    value={submitFileName}
                    onChange={(e) => setSubmitFileName(e.target.value)}
                    placeholder="Document or photo label (e.g. Mathematics_Homework_Solutions.pdf)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit to Teacher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REVIEW & GRADE SUBMISSIONS (Teachers/Admin) */}
      {/* ======================================================== */}
      {isGradingModalOpen && activeAssignmentForGrading && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Review Student Submissions</h3>
                  <p className="text-xs text-slate-400">
                    {activeAssignmentForGrading.title} • {activeAssignmentForGrading.className} ({activeAssignmentForGrading.maxPoints} Marks)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGradingModalOpen(false);
                  setActiveSubmissionToGrade(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of submissions for this assignment */}
            {(() => {
              const subsForThis = submissions.filter(s => s.assignmentId === activeAssignmentForGrading.id);

              return (
                <div className="space-y-4 text-xs">
                  {subsForThis.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <Clock className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-bold text-slate-700 dark:text-slate-300">No Pupil Submissions Received Yet</p>
                      <p className="text-slate-500 text-[11px]">Pupil responses will appear here as soon as they submit their homework.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {subsForThis.map(sub => (
                        <div
                          key={sub.id}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{sub.studentName}</span>
                              <span className="text-[10px] text-slate-400 block">Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'Graded'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {sub.status === 'Graded' ? `Graded: ${sub.score} / ${activeAssignmentForGrading.maxPoints}` : 'Pending Grading'}
                            </span>
                          </div>

                          {/* Pupil Response Text */}
                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {sub.textResponse}
                          </div>

                          {/* Attached Pupil File & Download */}
                          {sub.fileName && (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px]">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                                <span className="font-bold text-teal-950 dark:text-teal-200 truncate">{sub.fileName}</span>
                                <span className="text-slate-400 font-mono text-[10px]">({sub.fileSize || 'Attached File'})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDownloadStudentSubmission(sub)}
                                className="py-1 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download Pupil Work</span>
                              </button>
                            </div>
                          )}

                          {/* Feedback if already graded */}
                          {sub.feedback && (
                            <p className="text-[11px] text-slate-500 italic">
                              Teacher Feedback: "{sub.feedback}"
                            </p>
                          )}

                          {/* Grade Action Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSubmissionToGrade(sub);
                              setGradeScore(sub.score || Math.round(activeAssignmentForGrading.maxPoints * 0.85));
                              setGradeFeedback(sub.feedback || 'Excellent work! Demonstrated thorough understanding.');
                            }}
                            className="py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            {sub.status === 'Graded' ? 'Modify Grade & Comments' : 'Award Marks & Feedback'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Grading Form */}
                  {activeSubmissionToGrade && (
                    <form onSubmit={handleSaveGrade} className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-900 dark:text-teal-200">
                          Award Marks to {activeSubmissionToGrade.studentName}
                        </span>
                        <span className="text-[11px] text-teal-700">Max Points: {activeAssignmentForGrading.maxPoints}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Score Awarded</label>
                          <input
                            type="number"
                            min="0"
                            max={activeAssignmentForGrading.maxPoints}
                            value={gradeScore}
                            onChange={(e) => setGradeScore(Number(e.target.value))}
                            required
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold font-mono text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Percentage</label>
                          <div className="px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-teal-700 dark:text-teal-300">
                            {Math.round((gradeScore / activeAssignmentForGrading.maxPoints) * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Teacher Remarks / Feedback</label>
                        <input
                          type="text"
                          value={gradeFeedback}
                          onChange={(e) => setGradeFeedback(e.target.value)}
                          placeholder="e.g. Well organized answers. High mastery of concepts."
                          required
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveSubmissionToGrade(null)}
                          className="py-1.5 px-3 rounded-lg bg-slate-200 text-slate-700 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-1.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold"
                        >
                          Save & Publish Grade
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
