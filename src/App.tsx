/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  CreditCard, 
  Database, 
  Menu, 
  X, 
  GraduationCap, 
  Bus, 
  Briefcase, 
  BookOpen, 
  Sun, 
  Moon,
  Shield,
  Lock,
  IdCard,
  BellRing,
  Building2,
  CalendarCheck,
  CalendarDays,
  Package,
  FileSpreadsheet,
  Settings,
  PanelLeftClose,
  PanelLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Student, StudentAcademicRecord, NationalExamPrep, StudentFeeLedger, FeeTransaction } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ACADEMIC_RECORDS, 
  INITIAL_NATIONAL_EXAMS, 
  INITIAL_FEE_LEDGERS,
  DEMO_SAMPLE_STUDENTS,
  DEMO_SAMPLE_ACADEMIC_RECORDS,
  DEMO_SAMPLE_NATIONAL_EXAMS,
  DEMO_SAMPLE_FEE_LEDGERS,
  SCHOOL_INFO 
} from './initialData';
import { wipeAllSystemData } from './utils/dataStore';
import { 
  syncSupabaseCollection, 
  saveToSupabase, 
  deleteFromSupabase, 
  batchSaveToSupabase, 
  clearAllSupabaseSchoolData 
} from './services/supabaseSync';

// Component Imports
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AcademicPortal from './components/AcademicPortal';
import ReportCardView from './components/ReportCardView';
import Financials from './components/Financials';
import DataBackup from './components/DataBackup';
import StudentPortal from './components/StudentPortal';
import BusManagement from './components/BusManagement';
import StaffManagement from './components/StaffManagement';
import Library from './components/Library';
import IdCardCenter from './components/IdCardCenter';
import NoticeManagement from './components/NoticeManagement';
import ClassManagement from './components/ClassManagement';
import AttendanceModule from './components/AttendanceModule';
import TimetableModule from './components/TimetableModule';
import InventoryModule from './components/InventoryModule';
import ReportsModule from './components/ReportsModule';
import SettingsModule from './components/SettingsModule';
import GlobalHeader from './components/GlobalHeader';
import PrivilegesModal from './components/PrivilegesModal';
import CloudReferenceModal from './components/CloudReferenceModal';
import AccessRestricted from './components/AccessRestricted';
import SessionLoginGate from './components/SessionLoginGate';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { AnimatePresence } from 'motion/react';

import schoolLogo from './assets/logo.jpg';
import { getPendingFeeStudents, PendingFeeStudent } from './utils/feeUtils';
import { ensureStudentAccessCodes } from './utils/codeGenerator';
export { getPendingFeeStudents };
export type { PendingFeeStudent };

export default function App() {
  const { user, role, privileges, can, isFirebaseOnline, setPortalActive, unlockSession } = useAuth();
  const [isPrivilegesModalOpen, setIsPrivilegesModalOpen] = useState(false);
  const [isCloudReferenceModalOpen, setIsCloudReferenceModalOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('sma_theme');
    if (cached === 'dark' || cached === 'light') return cached;
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sma_theme', theme);
  }, [theme]);

  // Ensure portal mode is always active and session unlocked on load
  useEffect(() => {
    setPortalActive(true);
    unlockSession();
  }, [setPortalActive, unlockSession]);

  // Active Tab Navigation State
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
    } catch {}
    return 'dashboard';
  });
  const [navigationArgs, setNavigationArgs] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Collapsible Sidebar State (persisted in local storage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jcc_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('jcc_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Core Database States
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<StudentAcademicRecord[]>([]);
  const [examPreps, setExamPreps] = useState<NationalExamPrep[]>([]);
  const [fees, setFees] = useState<StudentFeeLedger[]>([]);

  // 13 Core Modules Navigation Links definition with RBAC permissions
  const NAV_LINKS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'canViewDashboard' as const, moduleName: 'Executive Dashboard', requiredDesc: 'Total pupils, teachers, classes, attendance, fees & analytics' },
    { id: 'students', label: 'Student Management', icon: Users, permission: 'canViewStudents' as const, moduleName: 'Student Management', requiredDesc: 'Registration, admission numbers, profiles, guardians and student history' },
    { id: 'staff-management', label: 'Staff Management', icon: Briefcase, permission: 'canManageStaff' as const, moduleName: 'Staff Management', requiredDesc: 'Teacher profiles, employment records, roles and assignments' },
    { id: 'classes', label: 'Class Management', icon: Building2, permission: 'canViewAcademics' as const, moduleName: 'Class Management', requiredDesc: 'Nursery, primary classes, streams and class teachers' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, permission: 'canViewAcademics' as const, moduleName: 'Attendance', requiredDesc: 'Daily attendance, absent/late records and attendance reports' },
    { id: 'fees', label: 'Fees Management', icon: CreditCard, permission: 'canViewFinances' as const, moduleName: 'Fees Management', requiredDesc: 'Fee structures, payments, outstanding balances and receipts' },
    { id: 'performance', label: 'Examination & Results', icon: Award, permission: 'canViewAcademics' as const, moduleName: 'Examination & Results', requiredDesc: 'Assessments, exams, grades, positions and report cards' },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays, permission: 'canViewAcademics' as const, moduleName: 'Timetable', requiredDesc: 'Class schedules, subjects and teacher allocation' },
    { id: 'student-portal', label: 'Parent Portal', icon: GraduationCap, permission: 'canViewStudentPortal' as const, moduleName: 'Parent Portal', requiredDesc: 'View child attendance, fees, results and school announcements' },
    { id: 'notices', label: 'Communication', icon: BellRing, permission: 'canViewStudents' as const, moduleName: 'Communication', requiredDesc: 'Notices, announcements and parent notifications' },
    { id: 'inventory', label: 'Inventory', icon: Package, permission: 'canManageLibrary' as const, moduleName: 'Inventory', requiredDesc: 'Books, furniture, equipment and school assets' },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet, permission: 'canViewAcademics' as const, moduleName: 'Reports', requiredDesc: 'Student lists, financial statements, attendance and academic reports' },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'canBackupData' as const, moduleName: 'Settings', requiredDesc: 'Academic years, terms, subjects, grading and user permissions' },
    // Ancillary Modules
    { id: 'id-cards', label: 'ID Cards & Badges', icon: IdCard, permission: 'canViewStudents' as const, moduleName: 'ID Card & Credential Center', requiredDesc: 'Student & Staff identification badges' },
    { id: 'bus-service', label: 'School Bus', icon: Bus, permission: 'canManageBus' as const, moduleName: 'School Bus Fleet & Logistics', requiredDesc: 'Transportation logistics management' },
    { id: 'library', label: 'School Library', icon: BookOpen, permission: 'canManageLibrary' as const, moduleName: 'School Library Catalog', requiredDesc: 'Library resources and lending privileges' },
    { id: 'backup', label: 'Data Center', icon: Database, permission: 'canBackupData' as const, moduleName: 'System Administration & Backup', requiredDesc: 'Super Administrator system data privileges' }
  ];

  // Auto redirect if current tab is forbidden when switching role
  useEffect(() => {
    const currentLink = NAV_LINKS.find(n => n.id === activeTab);
    if (currentLink && !can(currentLink.permission)) {
      if (can('canViewDashboard')) setActiveTab('dashboard');
      else if (can('canViewStudentPortal')) setActiveTab('student-portal');
      else if (can('canViewAcademics')) setActiveTab('performance');
      else if (can('canViewFinances')) setActiveTab('fees');
      else if (can('canManageBus')) setActiveTab('bus-service');
    }
  }, [role]);

  // Clean slate initialization to ensure pristine state
  useEffect(() => {
    const cleanKey = 'sma_clean_slate_active_v8';
    if (localStorage.getItem(cleanKey) !== 'true') {
      wipeAllSystemData();
      setStudents([]);
      setRecords([]);
      setExamPreps([]);
      setFees([]);
      clearAllSupabaseSchoolData().then(() => {
        setStudents([]);
        setRecords([]);
        setExamPreps([]);
        setFees([]);
      }).catch((e) => console.warn('Clean slate sync notice:', e));
      localStorage.setItem(cleanKey, 'true');
    }
  }, []);

  // 1. Pure Supabase & LocalStorage Synchronization
  useEffect(() => {
    // Realtime Sync for Students
    const unsubStudents = syncSupabaseCollection<Student>(
      'students',
      'sma_students',
      (items) => setStudents(items.map(ensureStudentAccessCodes)),
      INITIAL_STUDENTS.map(ensureStudentAccessCodes)
    );

    // Realtime Sync for Academic Records
    const unsubRecords = syncSupabaseCollection<StudentAcademicRecord>(
      'academic_records',
      'sma_academic_records',
      (items) => setRecords(items),
      INITIAL_ACADEMIC_RECORDS
    );

    // Realtime Sync for National Exam Preps
    const unsubPreps = syncSupabaseCollection<NationalExamPrep>(
      'exam_preps',
      'sma_exam_preps',
      (items) => setExamPreps(items),
      INITIAL_NATIONAL_EXAMS
    );

    // Realtime Sync for Fee Ledgers
    const unsubFees = syncSupabaseCollection<StudentFeeLedger>(
      'fee_ledgers',
      'sma_fee_ledgers',
      (items) => setFees(items),
      INITIAL_FEE_LEDGERS
    );

    const handleLocalWipe = () => {
      setStudents([]);
      setRecords([]);
      setExamPreps([]);
      setFees([]);
    };

    window.addEventListener('sma_database_wiped', handleLocalWipe);

    return () => {
      unsubStudents();
      unsubRecords();
      unsubPreps();
      unsubFees();
      window.removeEventListener('sma_database_wiped', handleLocalWipe);
    };
  }, []);

  // Helpers to persist state modifications to local cache
  const saveStateToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Local storage write error:', e);
    }
  };

  // 2. Student CRUD Triggers & Referential Consistency with Supabase
  const handleAddStudent = (incomingStudent: Student) => {
    const newStudent = ensureStudentAccessCodes(incomingStudent);
    const updatedStuds = [newStudent, ...students];
    setStudents(updatedStuds);
    saveStateToStorage('sma_students', updatedStuds);
    // Persist to Supabase immediately
    saveToSupabase('students', newStudent.id, newStudent);

    // Initialize blank terminal grades record
    const newRecord: StudentAcademicRecord = {
      studentId: newStudent.id,
      academicYear: '2025/2026',
      terms: {
        1: { grades: [], teacherRemarks: '', principalRemarks: '', conduct: 'Excellent', attendance: { totalDays: 70, presentDays: 70 } },
        2: { grades: [], teacherRemarks: '', principalRemarks: '', conduct: 'Excellent', attendance: { totalDays: 70, presentDays: 70 } },
        3: { grades: [], teacherRemarks: '', principalRemarks: '', conduct: 'Excellent', attendance: { totalDays: 70, presentDays: 70 } }
      }
    };
    const updatedRecs = [newRecord, ...records];
    setRecords(updatedRecs);
    saveStateToStorage('sma_academic_records', updatedRecs);
    saveToSupabase('academic_records', newStudent.id, newRecord);

    // Initialize tuition fee ledger depending on class levels
    let termFee = 2500;
    if (newStudent.currentClass.startsWith('JSS')) termFee = 3500;
    if (newStudent.currentClass.startsWith('SSS')) termFee = 4500;

    const newLedger: StudentFeeLedger = {
      studentId: newStudent.id,
      academicYear: '2025/2026',
      terms: {
        1: { totalDue: termFee, paidAmount: 0, balance: termFee, status: 'Unpaid', transactions: [] },
        2: { totalDue: termFee, paidAmount: 0, balance: termFee, status: 'Unpaid', transactions: [] },
        3: { totalDue: termFee, paidAmount: 0, balance: termFee, status: 'Unpaid', transactions: [] }
      }
    };
    const updatedFees = [newLedger, ...fees];
    setFees(updatedFees);
    saveStateToStorage('sma_fee_ledgers', updatedFees);
    saveToSupabase('fee_ledgers', newStudent.id, newLedger);
  };

  const handleUpdateStudent = (incomingStudent: Student) => {
    const updatedStudent = ensureStudentAccessCodes(incomingStudent);
    const updatedStuds = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updatedStuds);
    saveStateToStorage('sma_students', updatedStuds);
    saveToSupabase('students', updatedStudent.id, updatedStudent);

    // Adjust fee ledgers if class tier changed (Prep/Primary to JSS or SSS)
    const original = students.find(s => s.id === updatedStudent.id);
    if (original && original.currentClass !== updatedStudent.currentClass) {
      let termFee = 2500;
      if (updatedStudent.currentClass.startsWith('JSS')) termFee = 3500;
      if (updatedStudent.currentClass.startsWith('SSS')) termFee = 4500;

      let changedLedger: StudentFeeLedger | null = null;
      const updatedFees = fees.map(f => {
        if (f.studentId === updatedStudent.id) {
          const updatedTerms = { ...f.terms };
          [1, 2, 3].forEach(t => {
            updatedTerms[t].totalDue = termFee;
            updatedTerms[t].balance = Math.max(0, termFee - updatedTerms[t].paidAmount);
            updatedTerms[t].status = updatedTerms[t].balance <= 0 
              ? 'Paid' 
              : (updatedTerms[t].paidAmount > 0 ? 'Partial' : 'Unpaid');
          });
          changedLedger = { ...f, terms: updatedTerms };
          return changedLedger;
        }
        return f;
      });
      setFees(updatedFees);
      saveStateToStorage('sma_fee_ledgers', updatedFees);
      if (changedLedger) {
        saveToSupabase('fee_ledgers', updatedStudent.id, changedLedger);
      }
    }
  };

  const handleDeleteStudent = (id: string) => {
    const updatedStuds = students.filter(s => s.id !== id);
    setStudents(updatedStuds);
    saveStateToStorage('sma_students', updatedStuds);
    deleteFromSupabase('students', id);

    // Cascade deletion of secondary records
    const updatedRecs = records.filter(r => r.studentId !== id);
    setRecords(updatedRecs);
    saveStateToStorage('sma_academic_records', updatedRecs);
    deleteFromSupabase('academic_records', id);

    const updatedPreps = examPreps.filter(ep => ep.studentId !== id);
    setExamPreps(updatedPreps);
    saveStateToStorage('sma_exam_preps', updatedPreps);
    deleteFromSupabase('exam_preps', id);

    const updatedFees = fees.filter(f => f.studentId !== id);
    setFees(updatedFees);
    saveStateToStorage('sma_fee_ledgers', updatedFees);
    deleteFromSupabase('fee_ledgers', id);
  };

  // 3. Academic & Exams Updators
  const handleUpdateRecord = (updatedRecord: StudentAcademicRecord) => {
    const updated = records.map(r => r.studentId === updatedRecord.studentId ? updatedRecord : r);
    setRecords(updated);
    saveStateToStorage('sma_academic_records', updated);
    saveToSupabase('academic_records', updatedRecord.studentId, updatedRecord);
  };

  const handleUpdateExamPrep = (updatedExamPrep: NationalExamPrep) => {
    const exists = examPreps.some(ep => ep.studentId === updatedExamPrep.studentId);
    let updated;
    if (exists) {
      updated = examPreps.map(ep => ep.studentId === updatedExamPrep.studentId ? updatedExamPrep : ep);
    } else {
      updated = [updatedExamPrep, ...examPreps];
    }
    setExamPreps(updated);
    saveStateToStorage('sma_exam_preps', updated);
    const docId = (updatedExamPrep as any).id || updatedExamPrep.studentId;
    saveToSupabase('exam_preps', docId, updatedExamPrep);
  };

  // 4. Financial Updators
  const handleUpdateFeeLedger = (updatedLedger: StudentFeeLedger) => {
    const updated = fees.map(f => f.studentId === updatedLedger.studentId ? updatedLedger : f);
    setFees(updated);
    saveStateToStorage('sma_fee_ledgers', updated);
    saveToSupabase('fee_ledgers', updatedLedger.studentId, updatedLedger);
  };

  const handleAddTransaction = (studentId: string, term: number, tx: Omit<FeeTransaction, 'id'>) => {
    const newTx: FeeTransaction = {
      ...tx,
      id: `TX-${Date.now()}`
    };
    const updatedFees = fees.map(f => {
      if (f.studentId === studentId) {
        const currentTerm = f.terms[term as 1|2|3];
        const newPaid = (currentTerm.paidAmount || 0) + newTx.amount;
        const newBalance = Math.max(0, (currentTerm.totalDue || 0) - newPaid);
        const newStatus: 'Paid' | 'Partial' | 'Unpaid' = newBalance <= 0 ? 'Paid' : (newPaid > 0 ? 'Partial' : 'Unpaid');
        const updatedLedger: StudentFeeLedger = {
          ...f,
          terms: {
            ...f.terms,
            [term]: {
              ...currentTerm,
              paidAmount: newPaid,
              balance: newBalance,
              status: newStatus,
              transactions: [newTx, ...(currentTerm.transactions || [])]
            }
          }
        };
        saveToSupabase('fee_ledgers', studentId, updatedLedger);
        return updatedLedger;
      }
      return f;
    });
    setFees(updatedFees);
    saveStateToStorage('sma_fee_ledgers', updatedFees);
  };

  // 5. Data Center Backup & Restore
  const handleRestoreData = (data: {
    students: Student[];
    records: StudentAcademicRecord[];
    examPreps: NationalExamPrep[];
    fees: StudentFeeLedger[];
  }) => {
    const sanitizedStudents = (data.students || []).map(ensureStudentAccessCodes);
    setStudents(sanitizedStudents);
    setRecords(data.records || []);
    setExamPreps(data.examPreps || []);
    setFees(data.fees || []);

    saveStateToStorage('sma_students', sanitizedStudents);
    saveStateToStorage('sma_academic_records', data.records || []);
    saveStateToStorage('sma_exam_preps', data.examPreps || []);
    saveStateToStorage('sma_fee_ledgers', data.fees || []);

    // Batch upload restored documents to Supabase
    if (sanitizedStudents.length > 0) batchSaveToSupabase('students', sanitizedStudents, 'id');
    if ((data.records || []).length > 0) batchSaveToSupabase('academic_records', data.records, 'studentId');
    if ((data.examPreps || []).length > 0) batchSaveToSupabase('exam_preps', data.examPreps, 'studentId');
    if ((data.fees || []).length > 0) batchSaveToSupabase('fee_ledgers', data.fees, 'studentId');
  };

  const handleResetData = () => {
    wipeAllSystemData();
    setStudents([]);
    setRecords([]);
    setExamPreps([]);
    setFees([]);
    clearAllSupabaseSchoolData();
  };

  const handleLoadDemoData = () => {
    // Optional Demo loader for testing
    setStudents(DEMO_SAMPLE_STUDENTS.map(ensureStudentAccessCodes));
    setRecords(DEMO_SAMPLE_ACADEMIC_RECORDS);
    setExamPreps(DEMO_SAMPLE_NATIONAL_EXAMS);
    setFees(DEMO_SAMPLE_FEE_LEDGERS);
  };

  // 6. Tab Router Navigation Handler
  const handleNavigate = (tab: string, args?: any) => {
    setActiveTab(tab);
    setNavigationArgs(args || null);
    setIsMobileMenuOpen(false);
  };

  const activeLinkMeta = NAV_LINKS.find(n => n.id === activeTab || (activeTab === 'report-card' && n.id === 'performance'));
  const isCurrentTabRestricted = activeLinkMeta && !can(activeLinkMeta.permission);

  const handleNavigateHome = () => {
    if (can('canViewDashboard')) setActiveTab('dashboard');
    else if (can('canViewStudentPortal')) setActiveTab('student-portal');
    else if (can('canViewAcademics')) setActiveTab('performance');
    else if (can('canViewFinances')) setActiveTab('fees');
    else if (can('canManageBus')) setActiveTab('bus-service');
    else setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200" id="main-app-container">
      
      {/* 1. Collapsible Sidebar Navigation (Desktop) - Hidden when printing */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 hidden md:flex print:hidden transition-all duration-300 ease-in-out relative select-none`} 
        id="desktop-sidebar"
      >
        {/* Sierra Leone National Tricolor Accent Bar */}
        <div className="flex h-1 w-full overflow-hidden absolute top-0 left-0 z-10">
          <div className="bg-emerald-500 w-1/3"></div>
          <div className="bg-white w-1/3"></div>
          <div className="bg-teal-500 w-1/3"></div>
        </div>

        {/* Sidebar Header */}
        <div className={`p-4 border-b border-slate-800/90 ${isSidebarCollapsed ? 'flex flex-col items-center gap-3' : 'space-y-3'}`}>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className={`flex items-center gap-2.5 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <img 
                src={schoolLogo} 
                alt={`${SCHOOL_INFO.name} Logo`} 
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-sm border border-slate-700 shrink-0"
                referrerPolicy="no-referrer"
              />
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <h2 className="font-black text-xs tracking-tight leading-tight uppercase truncate text-white">
                    {SCHOOL_INFO.name}
                  </h2>
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block truncate">
                    Bo, Sierra Leone
                  </span>
                </div>
              )}
            </div>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/80 shrink-0 shadow-2xs"
              title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar'}
              id="sidebar-collapse-toggle-btn"
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-teal-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-300" />}
            </button>
          </div>

          {!isSidebarCollapsed ? (
            <div className="py-1 px-2.5 rounded-lg bg-slate-800/70 border border-slate-700/70 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Database:</span>
              <span className="font-bold text-teal-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Supabase Connected
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center" title="Supabase Database Connected">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation Links (13 Core Modules) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden" id="desktop-nav-panel">
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            const isTabActive = activeTab === link.id || (link.id === 'performance' && activeTab === 'report-card');
            const hasAccess = can(link.permission);

            return (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                title={isSidebarCollapsed ? `${link.label} (${link.requiredDesc})` : undefined}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between py-2 px-3'} rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer group relative ${
                  isTabActive 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40' 
                    : hasAccess
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-400 opacity-70'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isTabActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'}`} />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{link.label}</span>
                  )}
                </div>

                {!isSidebarCollapsed && !hasAccess && (
                  <span title="Restricted by role privilege">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  </span>
                )}

                {/* Collapsed Tooltip Indicator */}
                {isSidebarCollapsed && isTabActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-teal-400 rounded-r-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Authenticated User & Role Profile Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          {!isSidebarCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-xs">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.displayName?.charAt(0).toUpperCase() || 'J'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {user?.displayName || 'Jonathan Davis'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-teal-900/80 text-teal-300 border border-teal-700">
                      {role.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      Director & Principal
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => setIsPrivilegesModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Roles & Privileges</span>
                </button>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 shadow-2xs flex items-center justify-center shrink-0"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setIsPrivilegesModalOpen(true)}
                className="w-10 h-10 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 flex items-center justify-center transition-all cursor-pointer"
                title="Switch Roles & Privileges"
              >
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                <span>Supabase Live</span>
              </span>
              <span>JCC MIS v2.5</span>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Top Header Navigation (Mobile) - Hidden when printing */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center md:hidden print:hidden" id="mobile-header">
        <div className="flex items-center gap-2">
          <img 
            src={schoolLogo} 
            alt={`${SCHOOL_INFO.name} Logo`} 
            className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 border border-slate-700"
            referrerPolicy="no-referrer"
          />
          <h2 className="font-bold text-xs uppercase text-teal-300">{SCHOOL_INFO.systemName}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrivilegesModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-white transition-all cursor-pointer border border-slate-700 flex items-center justify-center"
            title="Open Privileges"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            id="mobile-drawer-toggle-btn"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="bg-slate-900 border-b border-slate-800 text-white p-4 space-y-3"
              onClick={e => e.stopPropagation()}
              id="mobile-drawer"
            >
              <nav className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {NAV_LINKS.map(link => {
                  const Icon = link.icon;
                  const isTabActive = activeTab === link.id;
                  const hasAccess = can(link.permission);

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavigate(link.id)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold ${
                        isTabActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20' 
                          : hasAccess
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-500 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                      {!hasAccess && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPrivilegesModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Shield className="w-4 h-4" />
                <span>Privileges & Switcher</span>
              </button>

              <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
                <p>{SCHOOL_INFO.name}</p>
                <p className="text-emerald-400 font-bold mt-0.5">Connected to Supabase Database</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Layout Header with Search Bar */}
        <GlobalHeader 
          students={students}
          fees={fees}
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onOpenPrivileges={() => setIsPrivilegesModalOpen(true)}
          onOpenCloudReferenceModal={() => setIsCloudReferenceModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8" id="workspace-viewport">
          <ErrorBoundary fallbackTitle="Management Module Refreshed">
            {/* RBAC Access Guard Check */}
            {isCurrentTabRestricted ? (
              <AccessRestricted 
                moduleName={activeLinkMeta?.moduleName || 'Restricted Area'}
                requiredPrivilege={activeLinkMeta?.requiredDesc || 'Role-specific privilege required'}
                onNavigateHome={handleNavigateHome}
                onOpenPrivileges={() => setIsPrivilegesModalOpen(true)}
              />
            ) : (
              <>
                {/* 1. Executive Analytics Dashboard */}
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    students={students} 
                    records={records} 
                    examPreps={examPreps} 
                    fees={fees} 
                    onNavigate={handleNavigate}
                    onUpdateStudent={handleUpdateStudent}
                    onOpenCloudReferenceModal={() => setIsCloudReferenceModalOpen(true)}
                  />
                )}

                {/* 2. Noticeboard & SMS Broadcast Center */}
                {activeTab === 'notices' && (
                  <NoticeManagement 
                    students={students}
                  />
                )}

                {/* 3. Student Files Registry */}
                {activeTab === 'students' && (
                  <StudentList 
                    students={students} 
                    onAddStudent={handleAddStudent} 
                    onUpdateStudent={handleUpdateStudent} 
                    onDeleteStudent={handleDeleteStudent} 
                    onNavigate={handleNavigate}
                  />
                )}

                {/* 4. ID Card Credentialing & Badge Center */}
                {activeTab === 'id-cards' && (
                  <IdCardCenter 
                    students={students}
                  />
                )}

                {/* 5. Academic Portal */}
                {activeTab === 'performance' && (
                  <AcademicPortal 
                    students={students} 
                    records={records} 
                    examPreps={examPreps} 
                    onUpdateRecord={handleUpdateRecord} 
                    onUpdateExamPrep={handleUpdateExamPrep} 
                    initialSelectedStudentId={navigationArgs?.studentId}
                  />
                )}

                {/* 6. Printable Report Card Viewer */}
                {activeTab === 'report-card' && (
                  <ReportCardView 
                    students={students} 
                    records={records} 
                    initialStudentId={navigationArgs?.studentId}
                    onNavigateBack={() => handleNavigate('performance', { subTab: 'reports' })}
                  />
                )}

                {/* 7. Tuition & Financial Bursary */}
                {activeTab === 'fees' && (
                  <Financials 
                    students={students} 
                    fees={fees} 
                    onAddTransaction={handleAddTransaction}
                    initialStudentId={navigationArgs?.studentId}
                  />
                )}

                {/* 8. Staff Management & Payroll */}
                {activeTab === 'staff-management' && (
                  <StaffManagement 
                    students={students}
                  />
                )}

                {/* 9. School Library Catalog */}
                {activeTab === 'library' && (
                  <Library 
                    students={students}
                  />
                )}

                {/* 10. Student & Guardian Portal */}
                {activeTab === 'student-portal' && (
                  <StudentPortal 
                    students={students}
                    records={records}
                    fees={fees}
                  />
                )}

                {/* 11. School Bus Fleet Logistics */}
                {activeTab === 'bus-service' && (
                  <BusManagement 
                    students={students}
                  />
                )}

                {/* 13. Class Management (Nursery 1-3, Primary 1-6, JSS 1-3, SSS 1-3) */}
                {activeTab === 'classes' && (
                  <ClassManagement 
                    students={students}
                    onNavigate={handleNavigate}
                  />
                )}

                {/* 14. Daily Attendance Register & Roll Call */}
                {activeTab === 'attendance' && (
                  <AttendanceModule 
                    students={students}
                  />
                )}

                {/* 15. Timetable & Weekly Period Master Schedule */}
                {activeTab === 'timetable' && (
                  <TimetableModule />
                )}

                {/* 16. School Inventory & Assets Tracker */}
                {activeTab === 'inventory' && (
                  <InventoryModule />
                )}

                {/* 17. Central Institutional Reports Hub */}
                {activeTab === 'reports' && (
                  <ReportsModule 
                    students={students}
                    records={records}
                    examPreps={examPreps}
                    fees={fees}
                    onNavigate={handleNavigate}
                  />
                )}

                {/* 18. School System Settings & Academic Years */}
                {activeTab === 'settings' && (
                  <SettingsModule />
                )}

                {/* 19. Backup, Migration, and Purge Center */}
                {activeTab === 'backup' && (
                  <DataBackup 
                    students={students} 
                    records={records} 
                    examPreps={examPreps} 
                    fees={fees} 
                    onRestoreData={handleRestoreData} 
                    onResetData={handleResetData}
                    onLoadDemoData={handleLoadDemoData}
                  />
                )}
              </>
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Privileges & Authentication Modal */}
      <PrivilegesModal 
        isOpen={isPrivilegesModalOpen}
        onClose={() => setIsPrivilegesModalOpen(false)}
      />

      {/* Cloud Supabase Database Reference Modal */}
      <CloudReferenceModal 
        isOpen={isCloudReferenceModalOpen}
        onClose={() => setIsCloudReferenceModalOpen(false)}
        students={students}
        records={records}
        examPreps={examPreps}
        fees={fees}
        onRestoreData={handleRestoreData}
      />

      {/* Inactivity Session Lock & Login Gate */}
      <SessionLoginGate 
        onUnlock={() => unlockSession()}
      />

    </div>
  );
}
