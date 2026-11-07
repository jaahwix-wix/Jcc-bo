/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Users, 
  Filter, 
  Download, 
  Printer, 
  Save, 
  CheckCheck, 
  TrendingUp, 
  Sparkles, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Student, StudentClass, DailyAttendanceRecord } from '../types';
import { CLASSES_LIST } from '../constants';
import { SCHOOL_INFO } from '../initialData';

interface AttendanceModuleProps {
  students: Student[];
  initialClassName?: StudentClass;
  onNavigate?: (tab: string, arg?: any) => void;
}

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export default function AttendanceModule({ students, initialClassName, onNavigate }: AttendanceModuleProps) {
  const [selectedClass, setSelectedClass] = useState<StudentClass>(initialClassName || 'Primary 1');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // State of attendance entries for the selected class and date: studentId -> { status, remark, timeIn }
  const [recordsMap, setRecordsMap] = useState<Record<string, { status: AttendanceStatus; remark: string; timeIn: string }>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Filter students in selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.currentClass === selectedClass && s.status === 'Active');
  }, [students, selectedClass]);

  // Load existing attendance record from localStorage if saved
  useEffect(() => {
    const storageKey = `jcc_attendance_${selectedClass}_${selectedDate}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setRecordsMap(JSON.parse(saved));
        return;
      }
    } catch {}

    // Default initialization: default all pupils to 'Present'
    const initial: Record<string, { status: AttendanceStatus; remark: string; timeIn: string }> = {};
    classStudents.forEach(st => {
      initial[st.id] = { status: 'Present', remark: '', timeIn: '08:00 AM' };
    });
    setRecordsMap(initial);
  }, [selectedClass, selectedDate, classStudents]);

  // Status counters for the current class
  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    classStudents.forEach(st => {
      const rec = recordsMap[st.id]?.status || 'Present';
      if (rec === 'Present') present++;
      else if (rec === 'Absent') absent++;
      else if (rec === 'Late') late++;
      else if (rec === 'Excused') excused++;
    });

    const total = classStudents.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return { present, absent, late, excused, total, rate };
  }, [classStudents, recordsMap]);

  // Handlers
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { remark: '', timeIn: '08:00 AM' }),
        status
      }
    }));
  };

  const handleSetRemark = (studentId: string, remark: string) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'Present', timeIn: '08:00 AM' }),
        remark
      }
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const next: Record<string, { status: AttendanceStatus; remark: string; timeIn: string }> = {};
    classStudents.forEach(st => {
      next[st.id] = {
        status,
        remark: status === 'Present' ? '' : (recordsMap[st.id]?.remark || ''),
        timeIn: status === 'Present' ? '08:00 AM' : ''
      };
    });
    setRecordsMap(next);
  };

  const handleSaveAttendance = () => {
    const storageKey = `jcc_attendance_${selectedClass}_${selectedDate}`;
    localStorage.setItem(storageKey, JSON.stringify(recordsMap));

    // Also update overall log
    const logItem: DailyAttendanceRecord = {
      id: `att-${selectedClass}-${selectedDate}`,
      date: selectedDate,
      className: selectedClass,
      markedBy: SCHOOL_INFO.principalName,
      records: classStudents.map(st => ({
        studentId: st.id,
        studentName: st.name,
        status: recordsMap[st.id]?.status || 'Present',
        remark: recordsMap[st.id]?.remark || '',
        timeIn: recordsMap[st.id]?.timeIn || '08:00 AM'
      }))
    };

    const existingLogs = JSON.parse(localStorage.getItem('jcc_attendance_all_logs') || '[]');
    const filtered = existingLogs.filter((l: any) => l.id !== logItem.id);
    filtered.push(logItem);
    localStorage.setItem('jcc_attendance_all_logs', JSON.stringify(filtered));

    setSaveStatus('Attendance saved & synchronized successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="attendance-register-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Attendance & Punctuality Register</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Attendance Register</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Record daily morning roll calls, log late arrivals and excused absences, track chronic absenteeism, and generate official ministerial attendance sheets for Jonathan's Child Care.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleSaveAttendance}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer border border-teal-400/40"
            >
              <Save className="w-4 h-4" />
              <span>Save Register</span>
            </button>
            <button
              onClick={handlePrintSheet}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Live Feedback banner */}
        {saveStatus && (
          <div className="mt-4 p-3 bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Attendance KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Class Attendance Rate</span>
            <span className="text-xl font-bold text-teal-300 mt-0.5 block">{counts.rate}%</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Present</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{counts.present} Pupils</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Late Arrivals</span>
            <span className="text-xl font-bold text-amber-300 mt-0.5 block">{counts.late} Pupils</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Absent</span>
            <span className="text-xl font-bold text-rose-400 mt-0.5 block">{counts.absent} Pupils</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Excused</span>
            <span className="text-xl font-bold text-slate-300 mt-0.5 block">{counts.excused} Pupils</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Class, Date & Bulk Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Class Picker */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as StudentClass)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-teal-500"
            >
              {CLASSES_LIST.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Roll Call Date</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end pt-1">
            <button
              type="button"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>

        {/* Quick Batch Marking */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden lg:inline">Quick Roll:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="py-1.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="py-1.5 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Pupils Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Roll Call Sheet: {selectedClass}
            </h3>
            <p className="text-xs text-slate-400">
              {classStudents.length} active registered pupils for {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
            {counts.present} Present / {counts.total} Enrolled
          </span>
        </div>

        {classStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No active pupils registered in {selectedClass}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Pupil Name</th>
                  <th className="py-3 px-4">Admission No.</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents.map((st, idx) => {
                  const rec = recordsMap[st.id] || { status: 'Present', remark: '', timeIn: '08:00 AM' };

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                        <div className="text-[11px] text-slate-400">{st.parentName} ({st.parentPhone})</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                        {st.admissionNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{st.gender}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'Present')}
                            className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              rec.status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'Late')}
                            className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              rec.status === 'Late'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'Absent')}
                            className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              rec.status === 'Absent'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st.id, 'Excused')}
                            className={`py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              rec.status === 'Excused'
                                ? 'bg-slate-700 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="text"
                          value={rec.remark}
                          onChange={(e) => handleSetRemark(st.id, e.target.value)}
                          placeholder={rec.status === 'Absent' ? 'Reason for absence...' : 'Optional remark...'}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-teal-500 text-slate-700 dark:text-slate-200"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Jonathan's Child Care • Attendance records archived with date and time stamping.
          </div>
          <button
            type="button"
            onClick={handleSaveAttendance}
            className="py-2 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Synchronize Register</span>
          </button>
        </div>
      </div>
    </div>
  );
}
