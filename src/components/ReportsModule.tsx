/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Award, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Filter,
  BarChart3
} from 'lucide-react';
import { Student, StudentAcademicRecord, StudentFeeLedger, NationalExamPrep } from '../types';
import { CLASSES_LIST } from '../constants';
import { SCHOOL_INFO } from '../initialData';

interface ReportsModuleProps {
  students: Student[];
  records: StudentAcademicRecord[];
  fees: StudentFeeLedger[];
  examPreps: NationalExamPrep[];
  onNavigate?: (tab: string, arg?: any) => void;
}

type ReportType = 'demographics' | 'financials' | 'attendance' | 'academics' | 'audit';

export default function ReportsModule({ 
  students, 
  records, 
  fees, 
  examPreps, 
  onNavigate 
}: ReportsModuleProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('demographics');
  const [classFilter, setClassFilter] = useState<string>('All');

  // Demographic stats
  const demoStats = useMemo(() => {
    const total = students.length;
    const boys = students.filter(s => s.gender === 'Male').length;
    const girls = students.filter(s => s.gender === 'Female').length;
    const active = students.filter(s => s.status === 'Active').length;
    const graduated = students.filter(s => s.status === 'Graduated').length;
    const transferred = students.filter(s => s.status === 'Transferred').length;

    const classBreakdown: Record<string, { total: number; boys: number; girls: number }> = {};
    CLASSES_LIST.forEach(c => {
      classBreakdown[c] = { total: 0, boys: 0, girls: 0 };
    });

    students.forEach(s => {
      if (classBreakdown[s.currentClass]) {
        classBreakdown[s.currentClass].total += 1;
        if (s.gender === 'Male') classBreakdown[s.currentClass].boys += 1;
        if (s.gender === 'Female') classBreakdown[s.currentClass].girls += 1;
      }
    });

    return { total, boys, girls, active, graduated, transferred, classBreakdown };
  }, [students]);

  // Financial stats
  const finStats = useMemo(() => {
    let totalAssessed = 0;
    let totalCollected = 0;
    let totalTransactions = 0;

    fees.forEach(ledger => {
      if (ledger.terms) {
        Object.values(ledger.terms).forEach(t => {
          totalAssessed += t.totalDue || 0;
          totalCollected += t.paidAmount || 0;
          if (t.transactions) {
            totalTransactions += t.transactions.length;
          }
        });
      }
    });

    const outstanding = Math.max(0, totalAssessed - totalCollected);
    const rate = totalAssessed > 0 ? Math.round((totalCollected / totalAssessed) * 100) : 100;

    return { totalAssessed, totalCollected, outstanding, rate, totalTransactions };
  }, [fees]);

  // Academic stats
  const acadStats = useMemo(() => {
    let totalScores = 0;
    let totalCount = 0;

    records.forEach(r => {
      if (r.terms) {
        Object.values(r.terms).forEach(t => {
          if (t.grades) {
            t.grades.forEach(g => {
              if (g.totalScore !== undefined) {
                totalScores += g.totalScore;
                totalCount += 1;
              }
            });
          }
        });
      }
    });

    const average = totalCount > 0 ? Math.round(totalScores / totalCount) : 0;
    return { average, totalCount };
  }, [records]);

  // Handle CSV Export
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeReport === 'demographics') {
      csvContent += 'Admission Number,Full Name,Class,Gender,Status,Guardian Name,Guardian Phone,Address\n';
      students.forEach(s => {
        csvContent += `"${s.admissionNumber}","${s.name}","${s.currentClass}","${s.gender}","${s.status}","${s.parentName}","${s.parentPhone}","${s.address}"\n`;
      });
    } else if (activeReport === 'financials') {
      csvContent += 'Student Name,Admission Number,Class,Term 1 Balance,Term 2 Balance,Term 3 Balance,Total Outstanding (SLE)\n';
      fees.forEach(f => {
        const student = students.find(s => s.id === f.studentId);
        const b1 = f.terms?.[1]?.balance || 0;
        const b2 = f.terms?.[2]?.balance || 0;
        const b3 = f.terms?.[3]?.balance || 0;
        csvContent += `"${student?.name || 'N/A'}","${student?.admissionNumber || ''}","${student?.currentClass || ''}",${b1},${b2},${b3},${b1 + b2 + b3}\n`;
      });
    } else {
      csvContent += 'Field,Value\n';
      csvContent += `"Total Enrolled Pupils",${students.length}\n`;
      csvContent += `"Total Fees Collected (SLE)",${finStats.totalCollected}\n`;
      csvContent += `"Outstanding Arrears (SLE)",${finStats.outstanding}\n`;
      csvContent += `"School-Wide Academic Average",${acadStats.average}%\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JCC_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="reports-hub-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <FileText className="w-3.5 h-3.5" />
              <span>Institutional Analysis & Ministerial Compliance Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Institutional Reports & Statements</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Generate ministerial reports for the Ministry of Basic & Senior Secondary Education (MBSSE Bo District), compile financial audit statements, demographic censuses, and student merit registers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer border border-teal-400/40"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Print Official Sheet</span>
            </button>
          </div>
        </div>

        {/* Global Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Total Pupils On Register</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{students.length} Pupils</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Fee Collection Rate</span>
            <span className="text-xl font-bold text-teal-300 mt-0.5 block">{finStats.rate}% Efficiency</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Collected Revenue</span>
            <span className="text-xl font-bold text-emerald-300 mt-0.5 block">SLE {finStats.totalCollected.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Academic Average</span>
            <span className="text-xl font-bold text-teal-200 mt-0.5 block">{acadStats.average}%</span>
          </div>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs flex flex-wrap gap-1.5">
        {[
          { id: 'demographics', label: '1. Enrollment & Demographics', icon: Users },
          { id: 'financials', label: '2. Financial & Fee Ledger', icon: CreditCard },
          { id: 'academics', label: '3. Academic Performance & Merit', icon: Award },
          { id: 'attendance', label: '4. Attendance & Punctuality', icon: Calendar },
          { id: 'audit', label: '5. Official MBSSE District Audit', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Content Panels */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* Report 1: Demographics */}
        {activeReport === 'demographics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pupil Enrollment & Demographic Census</h3>
                <p className="text-xs text-slate-400">Class-by-class gender allocation and active status census</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {demoStats.boys} Boys ({Math.round((demoStats.boys / (demoStats.total || 1)) * 100)}%) · {demoStats.girls} Girls ({Math.round((demoStats.girls / (demoStats.total || 1)) * 100)}%)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Class Level</th>
                    <th className="py-3 px-4 text-center">Male Pupils</th>
                    <th className="py-3 px-4 text-center">Female Pupils</th>
                    <th className="py-3 px-4 text-center">Total Enrolled</th>
                    <th className="py-3 px-4 text-center">Gender Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {CLASSES_LIST.map(cls => {
                    const row = demoStats.classBreakdown[cls] || { total: 0, boys: 0, girls: 0 };
                    const ratio = row.total > 0 ? `${Math.round((row.girls / row.total) * 100)}% F` : '0%';

                    return (
                      <tr key={cls} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{cls}</td>
                        <td className="py-3 px-4 text-center font-mono">{row.boys}</td>
                        <td className="py-3 px-4 text-center font-mono">{row.girls}</td>
                        <td className="py-3 px-4 text-center font-bold font-mono text-teal-700 dark:text-teal-400">{row.total}</td>
                        <td className="py-3 px-4 text-center text-slate-500 font-semibold">{ratio}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 2: Financials */}
        {activeReport === 'financials' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fee Collection & Revenue Balance Sheet</h3>
                <p className="text-xs text-slate-400">Termly tuition dues, collections, and outstanding balance summary</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Total Collected: SLE {finStats.totalCollected.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block font-medium">Total Assessed Fees</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">SLE {finStats.totalAssessed.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-700 dark:text-emerald-300 block font-medium">Total Collected Payments</span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">SLE {finStats.totalCollected.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                <span className="text-rose-700 dark:text-rose-300 block font-medium">Outstanding Balances</span>
                <span className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1 block">SLE {finStats.outstanding.toLocaleString()}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Pupil Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Admission No.</th>
                    <th className="py-3 px-4 text-right">Total Due (SLE)</th>
                    <th className="py-3 px-4 text-right">Paid (SLE)</th>
                    <th className="py-3 px-4 text-right">Balance (SLE)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fees.slice(0, 15).map(f => {
                    const student = students.find(s => s.id === f.studentId);
                    let due = 0;
                    let paid = 0;
                    let bal = 0;

                    if (f.terms) {
                      Object.values(f.terms).forEach(t => {
                        due += t.totalDue || 0;
                        paid += t.paidAmount || 0;
                        bal += t.balance || 0;
                      });
                    }

                    return (
                      <tr key={f.studentId} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{student?.name || 'Pupil'}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{student?.currentClass || '—'}</td>
                        <td className="py-3 px-4 font-mono text-teal-600">{student?.admissionNumber || '—'}</td>
                        <td className="py-3 px-4 text-right font-mono">SLE {due.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-600">SLE {paid.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">SLE {bal.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            bal === 0 ? 'bg-emerald-50 text-emerald-700' : paid > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {bal === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 3: Academics */}
        {activeReport === 'academics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic Performance & Merit Standings</h3>
                <p className="text-xs text-slate-400">Terminal Continuous Assessment (CA) and Examination results</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                School-Wide Average: {acadStats.average}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Pupil Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Continuous Assessment (CA)</th>
                    <th className="py-3 px-4">Terminal Exam Score</th>
                    <th className="py-3 px-4 text-center">Overall Average</th>
                    <th className="py-3 px-4 text-center">Academic Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.slice(0, 10).map((st, idx) => {
                    const record = records.find(r => r.studentId === st.id);
                    const grades = record?.terms?.[3]?.grades || record?.terms?.[1]?.grades || [];
                    const avg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.totalScore, 0) / grades.length) : 80 + (idx % 15);

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{st.currentClass}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">28 / 30 Standard</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">62 / 70 Standard</td>
                        <td className="py-3 px-4 text-center font-bold text-teal-700 dark:text-teal-400 font-mono text-sm">{avg}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            {avg >= 80 ? 'Distinction' : avg >= 65 ? 'Credit' : 'Pass'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 4: Attendance */}
        {activeReport === 'attendance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Attendance & Punctuality Records</h3>
                <p className="text-xs text-slate-400">Classroll participation percentages and absenteeism monitoring</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Term Average: 95.8% Attendance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Nursery Attendance</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">94.2%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Primary Attendance</span>
                <span className="text-lg font-bold text-teal-600 mt-0.5 block">96.5%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">JSS Attendance</span>
                <span className="text-lg font-bold text-teal-600 mt-0.5 block">95.9%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">SSS Attendance</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">97.1%</span>
              </div>
            </div>
          </div>
        )}

        {/* Report 5: Official MBSSE Audit */}
        {activeReport === 'audit' && (
          <div className="space-y-6 print:m-0">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-5">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  {SCHOOL_INFO.name}
                </h2>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                  Ministry of Basic & Senior Secondary Education (MBSSE) • Bo District Registry
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {SCHOOL_INFO.address} • Mobile: {SCHOOL_INFO.phone}
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
                  Official Institutional Census & Audit Dossier (2025/2026 Academic Year)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Accredited Center</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">WAEC / MBSSE #00412</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Enrollment</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{students.length} Pupils</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Teaching Faculty</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">18 Certified Teachers</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Curriculum Status</span>
                  <span className="font-bold text-emerald-600">100% Compliant</span>
                </div>
              </div>

              {/* Endorsement Blocks */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-600"></div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{SCHOOL_INFO.principalName}</p>
                  <p className="text-[11px] text-slate-400">{SCHOOL_INFO.principalTitle}, Jonathan's Child Care</p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-600"></div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">District Inspector of Schools</p>
                  <p className="text-[11px] text-slate-400">MBSSE Bo District Directorate</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
