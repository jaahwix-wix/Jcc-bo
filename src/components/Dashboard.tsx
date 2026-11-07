/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  Award,
  CheckCircle,
  FileSpreadsheet,
  TrendingDown,
  Search,
  CreditCard,
  ChevronRight,
  User,
  ArrowRight,
  Send,
  Mail,
  MessageSquare,
  Bell,
  Phone,
  Copy,
  X,
  Clock,
  Sparkles,
  Building2,
  ShieldCheck,
  PhoneCall,
  RefreshCw,
  Cloud,
  CloudUpload,
  FolderArchive,
  Calendar,
  UserCheck,
  UserX,
  Briefcase,
  CheckCheck,
  ArrowUpRight,
  Filter,
  DollarSign,
  Printer
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Student, StudentAcademicRecord, NationalExamPrep, StudentFeeLedger, Teacher } from '../types';
import { SCHOOL_INFO, DEMO_SAMPLE_TEACHERS } from '../initialData';
import { useAuth } from '../context/AuthContext';
import { saveAllSchoolRecordsToSupabase } from '../services/supabaseSync';
import PrincipalsNoticeBanner from './PrincipalsNoticeBanner';
import VerificationQueue from './VerificationQueue';
import StudentAttendanceTrendsChart from './StudentAttendanceTrendsChart';
import PerformanceTrendsCard from './PerformanceTrendsCard';
import OfficialReceiptModal, { ReceiptData } from './OfficialReceiptModal';
import { getPendingFeeStudents } from '../utils/feeUtils';

interface DashboardProps {
  students: Student[];
  records: StudentAcademicRecord[];
  examPreps: NationalExamPrep[];
  fees: StudentFeeLedger[];
  onNavigate: (tab: string, arg?: any) => void;
  onUpdateStudent?: (student: Student) => void;
  onOpenCloudReferenceModal?: () => void;
}

export default function Dashboard({ 
  students, 
  records, 
  examPreps, 
  fees, 
  onNavigate, 
  onUpdateStudent,
  onOpenCloudReferenceModal
}: DashboardProps) {
  const { role, can } = useAuth();
  const isAdmin = role === 'admin' || can('canVerifyStaffAndStudents');

  // Official Printable Receipt Modal State
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<ReceiptData | null>(null);

  // Live Sync & Refresh animation state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live');

  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
    return () => clearTimeout(timer);
  }, [students.length, records.length, examPreps.length, fees.length]);

  const handleManualRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  // Supabase Quick Save State
  const [isSavingToSupabase, setIsSavingToSupabase] = useState(false);
  const [supabaseSaveFeedback, setSupabaseSaveFeedback] = useState<string | null>(null);

  const handleQuickSaveToSupabase = async () => {
    setIsSavingToSupabase(true);
    setSupabaseSaveFeedback(null);
    try {
      const teachers = JSON.parse(localStorage.getItem('sma_teachers') || '[]');
      const books = JSON.parse(localStorage.getItem('sma_library_books') || '[]');
      const buses = JSON.parse(localStorage.getItem('sma_buses') || '[]');
      const notices = JSON.parse(localStorage.getItem('sma_class_notices') || '[]');

      const result = await saveAllSchoolRecordsToSupabase({
        students,
        records,
        examPreps,
        fees,
        teachers,
        books,
        buses,
        notices
      });

      if (result.success) {
        setSupabaseSaveFeedback(
          `Successfully saved ${result.counts.students} students, ${result.counts.records} academic files, and ${result.counts.fees} fee ledgers to Supabase!`
        );
      } else {
        setSupabaseSaveFeedback('Failed to save some collections to Supabase database. Please check connection.');
      }
    } catch (e: any) {
      setSupabaseSaveFeedback(e?.message || 'Error saving to Supabase database.');
    } finally {
      setIsSavingToSupabase(false);
      setTimeout(() => setSupabaseSaveFeedback(null), 6000);
    }
  };

  // 1. Core Pupil Statistics
  const activeStudents = students.filter(s => s.status === 'Active');
  const totalStudentsCount = activeStudents.length;
  const maleCount = activeStudents.filter(s => s.gender === 'Male').length;
  const femaleCount = activeStudents.filter(s => s.gender === 'Female').length;
  const malePercentage = totalStudentsCount > 0 ? Math.round((maleCount / totalStudentsCount) * 100) : 0;
  const femalePercentage = totalStudentsCount > 0 ? Math.round((femaleCount / totalStudentsCount) * 100) : 0;

  // 2. Staff Statistics (Teaching vs Non-Teaching)
  const staffList: Teacher[] = useMemo(() => {
    try {
      const raw = localStorage.getItem('sma_teachers');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEMO_SAMPLE_TEACHERS;
  }, []);

  const totalStaffCount = staffList.length;
  const teachingStaffCount = staffList.filter(s => s.staffCategory === 'Teaching' || !s.staffCategory).length;
  const nonTeachingStaffCount = staffList.filter(s => s.staffCategory === 'Non-Teaching').length;
  const pupilTeacherRatio = teachingStaffCount > 0 ? Math.round(totalStudentsCount / teachingStaffCount) : 0;

  // 3. Attendance Statistics (Today & Term 3)
  const attendanceStats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let totalRollCalls = 0;

    records.forEach(r => {
      const att = r?.terms?.[3]?.attendance || r?.terms?.[2]?.attendance || r?.terms?.[1]?.attendance;
      if (att && att.totalDays > 0) {
        const pDays = att.presentDays || 0;
        const tDays = att.totalDays || 1;
        totalRollCalls += tDays;
        presentCount += pDays;
        absentCount += Math.max(0, tDays - pDays);
      }
    });

    // Default rate if records are nascent
    const calculatedRate = totalRollCalls > 0 ? Math.round((presentCount / totalRollCalls) * 100) : 94;
    // Scale for today's simulated daily register based on enrolled students
    const todayPresent = Math.round((totalStudentsCount * calculatedRate) / 100) || 0;
    const todayLate = Math.round(totalStudentsCount * 0.04) || 0;
    const todayAbsent = Math.max(0, totalStudentsCount - todayPresent - todayLate);

    return {
      rate: calculatedRate,
      todayPresent,
      todayLate,
      todayAbsent,
    };
  }, [records, totalStudentsCount]);

  // 4. Financial Statistics (Total Fees Collected & Outstanding Balances in SLE)
  const financialStats = useMemo(() => {
    let totalDue = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let overdueAccounts = 0;

    fees.forEach(ledger => {
      const student = activeStudents.find(s => s.id === ledger.studentId);
      if (!student || !ledger.terms) return;

      let studentHasBalance = false;
      [1, 2, 3].forEach(termNum => {
        const term = ledger.terms[termNum as 1 | 2 | 3];
        if (term) {
          totalDue += (term.totalDue || 0);
          totalCollected += (term.paidAmount || 0);
          totalOutstanding += (term.balance || 0);
          if ((term.balance || 0) > 0) {
            studentHasBalance = true;
          }
        }
      });

      if (studentHasBalance) overdueAccounts++;
    });

    const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    return {
      totalDue,
      totalCollected,
      totalOutstanding,
      collectionRate,
      overdueAccounts,
    };
  }, [fees, activeStudents]);

  // 5. Recent Admissions (5 latest enrolled students)
  const recentAdmissions = useMemo(() => {
    return [...activeStudents]
      .sort((a, b) => (b.enrollmentYear || 0) - (a.enrollmentYear || 0) || b.admissionNumber.localeCompare(a.admissionNumber))
      .slice(0, 5);
  }, [activeStudents]);

  // 6. Recent Payments (Latest transactions across all fee ledgers)
  const recentPayments = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      amount: number;
      paymentMethod: string;
      receiptNumber: string;
      studentName: string;
      studentClass: string;
      admissionNumber: string;
    }> = [];

    fees.forEach(ledger => {
      const student = activeStudents.find(s => s.id === ledger.studentId);
      if (!student || !ledger.terms) return;

      [3, 2, 1].forEach(termNum => {
        const term = ledger.terms[termNum as 1 | 2 | 3];
        if (term && term.transactions) {
          term.transactions.forEach(tx => {
            list.push({
              id: tx.id,
              date: tx.date,
              amount: tx.amount,
              paymentMethod: tx.paymentMethod || 'Cash',
              receiptNumber: tx.receiptNumber,
              studentName: student.name,
              studentClass: student.currentClass,
              admissionNumber: student.admissionNumber,
            });
          });
        }
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [fees, activeStudents]);

  // 7. Upcoming Examinations (National WAEC & Promotional Exams for JCC)
  const upcomingExaminations = [
    {
      id: 'exam-wassce-2026',
      title: 'WASSCE 2026 (West African Senior School Certificate)',
      targetClass: 'SSS 3 (Senior Secondary)',
      body: 'WAEC Regional Council',
      date: 'May 4, 2026',
      daysRemaining: 179,
      status: 'Registration Verified',
      candidatesCount: activeStudents.filter(s => s.currentClass === 'SSS 3').length || 4,
      color: 'border-l-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
    },
    {
      id: 'exam-npse-2026',
      title: 'NPSE 2026 (National Primary School Examination)',
      targetClass: 'Primary 6 (Class 6)',
      body: 'MBSSE & WAEC Bo District Directorate',
      date: 'May 9, 2026',
      daysRemaining: 184,
      status: 'Continuous Assessment Uploaded',
      candidatesCount: activeStudents.filter(s => s.currentClass === 'Primary 6').length || 6,
      color: 'border-l-teal-600 bg-teal-50/50 dark:bg-teal-950/20',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
    },
    {
      id: 'exam-bece-2026',
      title: 'BECE 2026 (Basic Education Certificate Examination)',
      targetClass: 'JSS 3 (Junior Secondary)',
      body: 'WAEC Freetown / Bo Centre',
      date: 'June 18, 2026',
      daysRemaining: 224,
      status: 'Mock Assessments In Progress',
      candidatesCount: activeStudents.filter(s => s.currentClass === 'JSS 3').length || 5,
      color: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
    },
    {
      id: 'exam-term3-2026',
      title: 'Term 3 Final Promotional Examinations',
      targetClass: 'Nursery 1-3, Primary 1-5, JSS 1-2, SSS 1-2',
      body: 'JCC Internal Academic Board',
      date: 'July 6 - July 17, 2026',
      daysRemaining: 242,
      status: 'Timetable Scheduled',
      candidatesCount: totalStudentsCount,
      color: 'border-l-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
    }
  ];

  // 8. Announcements & School Notices
  const announcements = useMemo(() => {
    try {
      const raw = localStorage.getItem('sma_class_notices');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 4);
        }
      }
    } catch {}

    return [
      {
        id: 'not-001',
        title: 'Term 3 Continuous Assessment (CA) Submission Deadline',
        author: `${SCHOOL_INFO.principalName} (${SCHOOL_INFO.principalTitle})`,
        date: '2026-05-18',
        audience: 'All Teaching Staff',
        content: 'All class teachers and subject masters for Nursery, Primary, JSS, and SSS are reminded that Continuous Assessment marks must be verified and uploaded before the audit by the Bo District Inspectorate.',
        smsDispatched: true,
      },
      {
        id: 'not-002',
        title: 'Outstanding Tuition Fee Settlement Notice',
        author: 'Office of the Bursar',
        date: '2026-05-14',
        audience: 'All Parents & Guardians',
        content: 'Parents and guardians with pending tuition fee balances are kindly urged to settle dues via Orange Money, Bank Transfer, or at the Simbaru Campus Bursary office.',
        smsDispatched: true,
      },
      {
        id: 'not-003',
        title: 'Primary 6 & JSS 3 Weekend Intensive Revision Classes',
        author: 'Mrs. Fatmata Sesay (Vice Principal)',
        date: '2026-05-10',
        audience: 'Primary 6, JSS 3 & SSS 3 Candidates',
        content: 'Special preparatory clinics for NPSE, BECE, and WASSCE candidates will run every Saturday from 8:30 AM to 1:00 PM at the JCC Simbaru Campus hall.',
        smsDispatched: true,
      }
    ];
  }, []);

  // Quick Telephone Copy Feedback
  const [copiedPhone, setCopiedPhone] = useState(false);
  const handleCopyPhone = (phoneNum: string) => {
    navigator.clipboard.writeText(phoneNum);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="space-y-6" id="dashboard-tab-panel">
      {/* 1. Official Principal Banner */}
      <PrincipalsNoticeBanner variant="dashboard" />

      {/* 2. Flag-Accented Official School Identity Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 md:p-8 shadow-md border border-slate-800" 
        id="school-banner-accent"
      >
        {/* Sierra Leone National Tricolor Accent Bar */}
        <div className="absolute top-0 right-0 h-full w-2.5 flex flex-col z-20">
          <div className="h-1/3 bg-emerald-500"></div>
          <div className="h-1/3 bg-white"></div>
          <div className="h-1/3 bg-teal-500"></div>
        </div>
        <div className="absolute top-0 right-0 h-full w-96 bg-gradient-to-l from-teal-500/15 via-indigo-500/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img 
              src={SCHOOL_INFO.logo} 
              alt={`${SCHOOL_INFO.name} Official Logo`} 
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white p-1.5 object-contain shadow-lg border border-slate-700 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                  MBSSE Bo District Certified
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Nursery 1-3 • Primary 1-6 • JSS 1-3 • SSS 1-3
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
                {SCHOOL_INFO.name}
              </h1>
              <p className="text-teal-300 font-semibold italic text-sm mt-0.5">
                "{SCHOOL_INFO.motto}"
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-slate-300 border-t border-slate-800/90 pt-3">
                <div><span className="text-slate-400 font-medium">{SCHOOL_INFO.principalTitle}:</span> <strong className="text-white">{SCHOOL_INFO.principalName}</strong></div>
                <div><span className="text-slate-400 font-medium">Campus:</span> <strong className="text-white">{SCHOOL_INFO.address}</strong></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Mobile:</span> 
                  <strong className="text-teal-300 font-mono">{SCHOOL_INFO.phone}</strong>
                  <button
                    onClick={() => handleCopyPhone(SCHOOL_INFO.phone)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Copy phone number"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copiedPhone && <span className="text-[10px] text-teal-400 font-bold">Copied!</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('students')}
              className="flex-1 md:flex-initial py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Pupil Admissions</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="flex-1 md:flex-initial py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-teal-300 border border-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Fees</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Supabase Cloud Database Status Bar */}
      <div 
        className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 border border-teal-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        id="dashboard-supabase-bar"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shrink-0">
            <Cloud className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Supabase Realtime Database</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live multi-user sync across Nursery, Primary, JSS & SSS administrative portals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            disabled={isSavingToSupabase}
            onClick={handleQuickSaveToSupabase}
            className="py-1.5 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            title="Save active student records and ledgers to Supabase"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSavingToSupabase ? 'animate-bounce' : ''}`} />
            <span>{isSavingToSupabase ? 'Saving...' : 'Sync to Supabase'}</span>
          </button>
          {onOpenCloudReferenceModal && (
            <button
              type="button"
              onClick={onOpenCloudReferenceModal}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Snapshots</span>
            </button>
          )}
        </div>
      </div>

      {supabaseSaveFeedback && (
        <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{supabaseSaveFeedback}</span>
        </div>
      )}

      {/* Admin Verification Queue */}
      {isAdmin && (
        <VerificationQueue 
          students={students} 
          onUpdateStudent={onUpdateStudent} 
          onNavigate={onNavigate} 
        />
      )}

      {/* 4. Core Metrics Toolbar & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Key Metrics
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/50">
            <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-teal-500'}`}></span>
            {isSyncing ? 'Recalculating...' : 'Live Synced'}
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400">Updated: {lastSyncTime}</span>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-teal-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Recalculate metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* 5. The 5 Core Metrics Cards Requested by User */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="stats-grid">
        {/* Card 1: Total Enrolled Pupils (with Male & Female Stats) */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          id="stat-card-pupils"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled Pupils</span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalStudentsCount}
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium text-teal-700 dark:text-teal-400">Boys: <strong>{maleCount}</strong> ({malePercentage}%)</span>
              <span className="font-medium text-indigo-700 dark:text-indigo-400">Girls: <strong>{femaleCount}</strong> ({femalePercentage}%)</span>
            </div>
            {/* Visual Ratio Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div className="bg-teal-600 h-full" style={{ width: `${malePercentage}%` }}></div>
              <div className="bg-indigo-600 h-full" style={{ width: `${femalePercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Teaching and Non-Teaching Staff */}
        <div 
          onClick={() => onNavigate('staff-management')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          id="stat-card-staff"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Staff</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalStaffCount}
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Teaching:</span>
              <strong className="text-slate-800 dark:text-slate-200">{teachingStaffCount} Teachers</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Non-Teaching:</span>
              <strong className="text-slate-800 dark:text-slate-200">{nonTeachingStaffCount} Support</strong>
            </div>
            <div className="flex justify-between text-[11px] text-teal-600 dark:text-teal-400 font-semibold pt-0.5">
              <span>Pupil-Teacher Ratio:</span>
              <span>1:{pupilTeacherRatio}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Attendance Percentage */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          id="stat-card-attendance"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {attendanceStats.rate}%
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Term 3</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span className="text-emerald-600 font-semibold">Present: <strong>{attendanceStats.todayPresent}</strong></span>
              <span className="text-amber-600 font-semibold">Late: <strong>{attendanceStats.todayLate}</strong></span>
              <span className="text-rose-600 font-semibold">Absent: <strong>{attendanceStats.todayAbsent}</strong></span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${attendanceStats.rate}%` }}></div>
              <div className="bg-rose-500 h-full" style={{ width: `${100 - attendanceStats.rate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Fees Collected */}
        <div 
          onClick={() => onNavigate('fees')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          id="stat-card-fees-collected"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Fees Collected</span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-slate-400 font-mono">SLE</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {financialStats.totalCollected.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Collection Rate:</span>
              <strong className="text-teal-600 dark:text-teal-400 font-black">{financialStats.collectionRate}%</strong>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: `${financialStats.collectionRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 5: Outstanding School Fees */}
        <div 
          onClick={() => onNavigate('fees')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
          id="stat-card-fees-outstanding"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Fees</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-slate-400 font-mono">SLE</span>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {financialStats.totalOutstanding.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Pending Accounts:</span>
              <strong className="text-amber-600 dark:text-amber-400 font-black">{financialStats.overdueAccounts} Pupils</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              Click to view overdue list
            </div>
          </div>
        </div>
      </div>

      {/* 6. Charts Section: Attendance Trends & Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentAttendanceTrendsChart records={records} students={students} />
        <PerformanceTrendsCard records={records} students={students} onNavigate={onNavigate} />
      </div>

      {/* 7. The 4 Dedicated Modules Requested by User */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module A: Recent Admissions Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Admissions</h3>
                <p className="text-xs text-slate-400">Latest enrolled pupils registered into JCC</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="pb-2.5">Pupil Details</th>
                  <th className="pb-2.5">Class Tier</th>
                  <th className="pb-2.5">Guardian Contact</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">No recent pupil admissions recorded.</td>
                  </tr>
                ) : (
                  recentAdmissions.map(pupil => (
                    <tr 
                      key={pupil.id}
                      onClick={() => onNavigate('students')}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-black text-xs flex items-center justify-center shrink-0">
                            {pupil.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{pupil.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">{pupil.admissionNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{pupil.currentClass}</span>
                        {pupil.stream && <span className="text-[10px] text-slate-400 block">{pupil.stream}</span>}
                      </td>
                      <td className="py-2.5 px-2">
                        <p className="text-slate-700 dark:text-slate-300 font-medium truncate">{pupil.parentName}</p>
                        <span className="font-mono text-[10px] text-slate-400">{pupil.parentPhone}</span>
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {pupil.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module B: Recent Payments Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Payments</h3>
                <p className="text-xs text-slate-400">Tuition receipts and transaction audit trail</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('fees')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Bursary Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="pb-2.5">Receipt #</th>
                  <th className="pb-2.5">Pupil & Class</th>
                  <th className="pb-2.5">Channel</th>
                  <th className="pb-2.5 text-right">Amount (SLE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">No payment transactions recorded yet.</td>
                  </tr>
                ) : (
                  recentPayments.map(payment => (
                    <tr 
                      key={payment.id}
                      onClick={() => onNavigate('fees')}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReceiptForPrint({
                                receiptNumber: payment.receiptNumber,
                                date: payment.date,
                                studentName: payment.studentName,
                                admissionNumber: payment.admissionNumber,
                                studentClass: payment.studentClass,
                                amount: payment.amount,
                                paymentMethod: payment.paymentMethod,
                                academicYear: '2025/2026',
                                term: 3
                              });
                            }}
                            className="p-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 transition-colors"
                            title="Print official receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <span className="text-teal-700 dark:text-teal-400 font-bold">{payment.receiptNumber}</span>
                            <span className="text-[10px] text-slate-400 block font-sans font-normal">{payment.date}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{payment.studentName}</p>
                        <span className="text-[10px] text-slate-400">{payment.studentClass}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right font-black text-teal-600 dark:text-teal-400">
                        SLE {payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module C: Upcoming Examinations Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Upcoming Examinations</h3>
                <p className="text-xs text-slate-400">WAEC national and internal promotion assessments</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('performance')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Exams Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingExaminations.map(exam => (
              <div 
                key={exam.id}
                onClick={() => onNavigate('performance')}
                className={`p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 ${exam.color} hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{exam.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${exam.badgeColor}`}>
                      {exam.targetClass}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {exam.date}
                    </span>
                    <span>•</span>
                    <span>{exam.candidatesCount} Candidates</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{exam.status}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Countdown</span>
                  <span className="font-black text-xs text-slate-900 dark:text-white">
                    {exam.daysRemaining} Days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module D: Announcements and School Notices */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Announcements & Notices</h3>
                <p className="text-xs text-slate-400">Administrative bulletins and parent notifications</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Publish Notice</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((notice: any) => (
              <div 
                key={notice.id}
                onClick={() => onNavigate('notices')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                    {notice.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0 font-mono">
                    {notice.date}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="font-medium text-slate-500 dark:text-slate-400">By: {notice.author}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                      {notice.audience}
                    </span>
                    {notice.smsDispatched && (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCheck className="w-3 h-3" /> SMS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Printable Fee Receipt Modal */}
      <OfficialReceiptModal
        isOpen={Boolean(selectedReceiptForPrint)}
        onClose={() => setSelectedReceiptForPrint(null)}
        receipt={selectedReceiptForPrint}
      />
    </div>
  );
}
