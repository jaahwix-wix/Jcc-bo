/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  Building2, 
  Plus, 
  Printer, 
  Filter, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles, 
  School,
  CheckCircle2
} from 'lucide-react';
import { StudentClass, TimetableSlot, Teacher } from '../types';
import { CLASSES_LIST } from '../constants';
import { SCHOOL_INFO } from '../initialData';

interface TimetableModuleProps {
  teachers?: Teacher[];
  onNavigate?: (tab: string, arg?: any) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

const PERIODS = [
  { num: 1, time: '08:15 - 09:00', label: 'Period 1' },
  { num: 2, time: '09:00 - 09:45', label: 'Period 2' },
  { num: 3, time: '09:45 - 10:30', label: 'Period 3' },
  { num: 4, time: '11:00 - 11:45', label: 'Period 4 (Post Break)' },
  { num: 5, time: '11:45 - 12:30', label: 'Period 5' },
  { num: 6, time: '12:30 - 01:15', label: 'Period 6' },
  { num: 7, time: '01:45 - 02:30', label: 'Period 7' }
];

// Seed realistic timetable slots
const INITIAL_TIMETABLE_SLOTS: TimetableSlot[] = [
  // Primary 1
  { id: 'tt-1', className: 'Primary 1', dayOfWeek: 'Monday', periodNumber: 1, startTime: '08:15', endTime: '09:00', subject: 'Mathematics', teacherId: 'tch-1', teacherName: 'Mr. Alimamy Sesay', room: 'Block B - 201' },
  { id: 'tt-2', className: 'Primary 1', dayOfWeek: 'Monday', periodNumber: 2, startTime: '09:00', endTime: '09:45', subject: 'English Language', teacherId: 'tch-2', teacherName: 'Miss Fatmata Kamara', room: 'Block B - 201' },
  { id: 'tt-3', className: 'Primary 1', dayOfWeek: 'Monday', periodNumber: 3, startTime: '09:45', endTime: '10:30', subject: 'Integrated Science', teacherId: 'tch-3', teacherName: 'Mr. Brima Bangura', room: 'Block B - 201' },
  { id: 'tt-4', className: 'Primary 1', dayOfWeek: 'Tuesday', periodNumber: 1, startTime: '08:15', endTime: '09:00', subject: 'Language Arts', teacherId: 'tch-2', teacherName: 'Miss Fatmata Kamara', room: 'Block B - 201' },
  { id: 'tt-5', className: 'Primary 1', dayOfWeek: 'Wednesday', periodNumber: 2, startTime: '09:00', endTime: '09:45', subject: 'Christian Religious Studies', teacherId: 'tch-4', teacherName: 'Jonathan Davis', room: 'Block B - 201' },
  // SSS 3
  { id: 'tt-6', className: 'SSS 3', dayOfWeek: 'Monday', periodNumber: 1, startTime: '08:15', endTime: '09:00', subject: 'Physics', teacherId: 'tch-003', teacherName: 'Mr. Abu Bakarr Kamara', room: 'Science Lab 1' },
  { id: 'tt-7', className: 'SSS 3', dayOfWeek: 'Monday', periodNumber: 2, startTime: '09:00', endTime: '09:45', subject: 'Chemistry', teacherId: 'tch-003', teacherName: 'Mr. Abu Bakarr Kamara', room: 'Science Lab 1' },
  { id: 'tt-8', className: 'SSS 3', dayOfWeek: 'Monday', periodNumber: 3, startTime: '09:45', endTime: '10:30', subject: 'Mathematics', teacherId: 'tch-004', teacherName: 'Mr. Santigie Bangura', room: 'Block D - 403' },
  { id: 'tt-9', className: 'SSS 3', dayOfWeek: 'Tuesday', periodNumber: 1, startTime: '08:15', endTime: '09:00', subject: 'English Language', teacherId: 'tch-002', teacherName: 'Mrs. Fatmata Sesay', room: 'Block D - 403' },
  { id: 'tt-10', className: 'SSS 3', dayOfWeek: 'Tuesday', periodNumber: 2, startTime: '09:00', endTime: '09:45', subject: 'Biology', teacherId: 'tch-003', teacherName: 'Mr. Abu Bakarr Kamara', room: 'Biology Lab' },
  { id: 'tt-11', className: 'SSS 3', dayOfWeek: 'Wednesday', periodNumber: 4, startTime: '11:00', endTime: '11:45', subject: 'Computer Studies (ICT)', teacherId: 'tch-004', teacherName: 'Mr. Santigie Bangura', room: 'ICT Lab' },
  { id: 'tt-12', className: 'SSS 3', dayOfWeek: 'Thursday', periodNumber: 1, startTime: '08:15', endTime: '09:00', subject: 'Christian Religious Studies', teacherId: 'tch-001', teacherName: 'Jonathan Davis', room: 'Block D - 403' },
  // JSS 3
  { id: 'tt-13', className: 'JSS 3', dayOfWeek: 'Monday', periodNumber: 1, startTime: '08:15', endTime: '09:00', subject: 'Integrated Science', teacherId: 'tch-003', teacherName: 'Mr. Abu Bakarr Kamara', room: 'Block C - 303' },
  { id: 'tt-14', className: 'JSS 3', dayOfWeek: 'Tuesday', periodNumber: 2, startTime: '09:00', endTime: '09:45', subject: 'Mathematics', teacherId: 'tch-004', teacherName: 'Mr. Santigie Bangura', room: 'Block C - 303' },
  { id: 'tt-15', className: 'JSS 3', dayOfWeek: 'Wednesday', periodNumber: 1, startTime: '08:15', endTime: '09:00', subject: 'Social Studies', teacherId: 'tch-002', teacherName: 'Mrs. Fatmata Sesay', room: 'Block C - 303' }
];

export default function TimetableModule({ teachers = [], onNavigate }: TimetableModuleProps) {
  const [selectedClass, setSelectedClass] = useState<StudentClass>('SSS 3');
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('Jonathan Davis');

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    try {
      const cached = localStorage.getItem('jcc_timetable_slots');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INITIAL_TIMETABLE_SLOTS;
  });

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form states
  const [formClass, setFormClass] = useState<StudentClass>(selectedClass);
  const [formDay, setFormDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formSubject, setFormSubject] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formRoom, setFormRoom] = useState('');

  const handleOpenAdd = (day?: typeof DAYS_OF_WEEK[number], period?: number) => {
    setEditingSlot(null);
    setFormClass(selectedClass);
    setFormDay(day || 'Monday');
    setFormPeriod(period || 1);
    setFormSubject('');
    setFormTeacher('');
    setFormRoom('Main Classroom');
    setIsSlotModalOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormClass(slot.className);
    setFormDay(slot.dayOfWeek);
    setFormPeriod(slot.periodNumber);
    setFormSubject(slot.subject);
    setFormTeacher(slot.teacherName);
    setFormRoom(slot.room || '');
    setIsSlotModalOpen(true);
  };

  const handleDeleteSlot = (id: string) => {
    const updated = timetableSlots.filter(s => s.id !== id);
    setTimetableSlots(updated);
    localStorage.setItem('jcc_timetable_slots', JSON.stringify(updated));
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formTeacher.trim()) return;

    const periodMeta = PERIODS.find(p => p.num === formPeriod) || PERIODS[0];
    const [start, end] = periodMeta.time.split(' - ');

    let updated: TimetableSlot[];
    if (editingSlot) {
      updated = timetableSlots.map(s => 
        s.id === editingSlot.id 
          ? {
              ...s,
              className: formClass,
              dayOfWeek: formDay,
              periodNumber: formPeriod,
              startTime: start,
              endTime: end,
              subject: formSubject,
              teacherName: formTeacher,
              room: formRoom
            }
          : s
      );
    } else {
      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}`,
        className: formClass,
        dayOfWeek: formDay,
        periodNumber: formPeriod,
        startTime: start,
        endTime: end,
        subject: formSubject,
        teacherId: `tch-${Date.now()}`,
        teacherName: formTeacher,
        room: formRoom
      };
      updated = [...timetableSlots, newSlot];
    }

    setTimetableSlots(updated);
    localStorage.setItem('jcc_timetable_slots', JSON.stringify(updated));
    setIsSlotModalOpen(false);
  };

  // Filter slots
  const displayedSlots = useMemo(() => {
    if (viewMode === 'class') {
      return timetableSlots.filter(s => s.className === selectedClass);
    } else {
      return timetableSlots.filter(s => s.teacherName.toLowerCase().includes(selectedTeacher.toLowerCase()));
    }
  }, [timetableSlots, viewMode, selectedClass, selectedTeacher]);

  // Unique teachers list for filter
  const teacherOptions = useMemo(() => {
    const names = new Set<string>();
    names.add('Jonathan Davis');
    timetableSlots.forEach(s => {
      if (s.teacherName) names.add(s.teacherName);
    });
    return Array.from(names);
  }, [timetableSlots]);

  return (
    <div className="space-y-6 animate-fade-in" id="timetable-management-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Institutional Master Class Schedules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Class Schedules & Timetable</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Organize weekly lesson periods, subject curriculum coverage, classroom room assignments, and teacher workload schedules across Jonathan's Child Care.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => handleOpenAdd()}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer border border-teal-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Timetable Slot</span>
            </button>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Print Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: View Mode & Class / Teacher Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('class')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'class' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              By Class
            </button>
            <button
              type="button"
              onClick={() => setViewMode('teacher')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'teacher' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              By Teacher
            </button>
          </div>

          {viewMode === 'class' ? (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as StudentClass)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-teal-500"
            >
              {CLASSES_LIST.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-teal-500"
            >
              {teacherOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing {displayedSlots.length} allocated lesson slots • Sierra Leone MBSSE Standard Academic Hours
        </div>
      </div>

      {/* Timetable Grid View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {viewMode === 'class' ? `Weekly Schedule: ${selectedClass}` : `Faculty Allocation: ${selectedTeacher}`}
          </h3>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Active Academic Term 3 (2025/2026)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-3.5 border-b border-r border-slate-200 dark:border-slate-700 w-32">
                  Time / Period
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} className="py-3 px-3.5 border-b border-slate-200 dark:border-slate-700 text-center">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {PERIODS.map(period => (
                <tr key={period.num} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                  <td className="py-3 px-3.5 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{period.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{period.time}</span>
                  </td>

                  {DAYS_OF_WEEK.map(day => {
                    const match = displayedSlots.find(
                      s => s.dayOfWeek === day && s.periodNumber === period.num
                    );

                    return (
                      <td key={day} className="p-2 border-r border-slate-100 dark:border-slate-800 align-top">
                        {match ? (
                          <div className="p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 space-y-1 relative group">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-teal-950 dark:text-teal-200 leading-tight block">
                                {match.subject}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(match)}
                                  className="p-1 hover:text-teal-600 cursor-pointer"
                                  title="Edit slot"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(match.id)}
                                  className="p-1 hover:text-rose-600 cursor-pointer"
                                  title="Delete slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-teal-600" />
                              <span className="truncate">{match.teacherName}</span>
                            </div>
                            {match.room && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                📍 {match.room}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd(day, period.num)}
                            className="w-full h-full min-h-[55px] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:bg-teal-50/30 flex items-center justify-center text-slate-300 hover:text-teal-600 transition-all cursor-pointer text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Jonathan's Child Care Timetable System • Bo, Sierra Leone</span>
          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="text-teal-600 font-bold hover:underline cursor-pointer"
          >
            + Add Period Assignment
          </button>
        </div>
      </div>

      {/* Add / Edit Timetable Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingSlot ? 'Edit Lesson Slot' : 'Add Timetable Slot'}
              </h3>
              <button 
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Class</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value as StudentClass)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {CLASSES_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Period Slot</label>
                <select
                  value={formPeriod}
                  onChange={(e) => setFormPeriod(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {PERIODS.map(p => (
                    <option key={p.num} value={p.num}>{p.label} ({p.time})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Subject Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Integrated Science, CRS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Assigned Teacher <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  placeholder="e.g. Mr. Abu Bakarr Kamara"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Room / Facility</label>
                <input 
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="e.g. Science Lab 1, Room 204"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
