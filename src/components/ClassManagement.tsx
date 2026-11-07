/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  ChevronRight, 
  GraduationCap, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  X, 
  Sparkles,
  School
} from 'lucide-react';
import { Student, StudentClass, Teacher, SchoolClassRecord } from '../types';
import { CLASSES_LIST, CLASS_GROUPS, SSS_STREAMS } from '../constants';
import { SCHOOL_INFO } from '../initialData';

interface ClassManagementProps {
  students: Student[];
  teachers?: Teacher[];
  onNavigate?: (tab: string, arg?: any) => void;
}

// Initial default class records
const DEFAULT_CLASS_RECORDS: SchoolClassRecord[] = [
  // Nursery
  { name: 'Nursery 1', tier: 'Nursery', room: 'Block A - Room 101', capacity: 30, classTeacherName: 'Mrs. Mariama Turay' },
  { name: 'Nursery 2', tier: 'Nursery', room: 'Block A - Room 102', capacity: 30, classTeacherName: 'Miss Zainab Conteh' },
  { name: 'Nursery 3', tier: 'Nursery', room: 'Block A - Room 103', capacity: 30, classTeacherName: 'Mrs. Hawa Mansaray' },
  // Primary
  { name: 'Primary 1', tier: 'Primary', room: 'Block B - Room 201', capacity: 35, classTeacherName: 'Mr. Alimamy Sesay' },
  { name: 'Primary 2', tier: 'Primary', room: 'Block B - Room 202', capacity: 35, classTeacherName: 'Miss Fatmata Kamara' },
  { name: 'Primary 3', tier: 'Primary', room: 'Block B - Room 203', capacity: 35, classTeacherName: 'Mr. Brima Bangura' },
  { name: 'Primary 4', tier: 'Primary', room: 'Block B - Room 204', capacity: 35, classTeacherName: 'Mrs. Isatu Koroma' },
  { name: 'Primary 5', tier: 'Primary', room: 'Block B - Room 205', capacity: 35, classTeacherName: 'Mr. Sorie Jalloh' },
  { name: 'Primary 6', tier: 'Primary', room: 'Block B - Room 206', capacity: 40, classTeacherName: 'Mr. Mohamed Koroma' },
  // JSS
  { name: 'JSS 1', tier: 'JSS', room: 'Block C - Room 301', capacity: 40, classTeacherName: 'Mr. Santigie Bangura' },
  { name: 'JSS 2', tier: 'JSS', room: 'Block C - Room 302', capacity: 40, classTeacherName: 'Mrs. Mariama Bangura' },
  { name: 'JSS 3', tier: 'JSS', room: 'Block C - Room 303', capacity: 40, classTeacherName: 'Mr. Abu Bakarr Kamara' },
  // SSS
  { name: 'SSS 1', tier: 'SSS', room: 'Block D - Room 401', capacity: 40, classTeacherName: 'Mrs. Fatmata Sesay' },
  { name: 'SSS 2', tier: 'SSS', room: 'Block D - Room 402', capacity: 40, classTeacherName: 'Mr. Osman Fofanah' },
  { name: 'SSS 3', tier: 'SSS', room: 'Block D - Room 403', capacity: 40, classTeacherName: 'Jonathan Davis' },
];

export default function ClassManagement({ students, teachers = [], onNavigate }: ClassManagementProps) {
  const [selectedTier, setSelectedTier] = useState<'All' | 'Nursery' | 'Primary' | 'JSS' | 'SSS'>('All');
  const [search, setSearch] = useState('');
  const [classRecords, setClassRecords] = useState<SchoolClassRecord[]>(() => {
    try {
      const cached = localStorage.getItem('jcc_class_records');
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_CLASS_RECORDS;
  });

  const [activeClassModal, setActiveClassModal] = useState<SchoolClassRecord | null>(null);
  const [viewingRosterClass, setViewingRosterClass] = useState<StudentClass | null>(null);

  // Form edit states
  const [formRoom, setFormRoom] = useState('');
  const [formCapacity, setFormCapacity] = useState(35);
  const [formTeacherName, setFormTeacherName] = useState('');

  const handleOpenEdit = (cls: SchoolClassRecord) => {
    setActiveClassModal(cls);
    setFormRoom(cls.room);
    setFormCapacity(cls.capacity);
    setFormTeacherName(cls.classTeacherName || '');
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassModal) return;

    const updated = classRecords.map(c => 
      c.name === activeClassModal.name 
        ? { ...c, room: formRoom, capacity: formCapacity, classTeacherName: formTeacherName } 
        : c
    );
    setClassRecords(updated);
    localStorage.setItem('jcc_class_records', JSON.stringify(updated));
    setActiveClassModal(null);
  };

  // Compute student counts per class
  const classStats = useMemo(() => {
    const stats: Record<string, { total: number; boys: number; girls: number; active: number }> = {};
    CLASSES_LIST.forEach(cls => {
      stats[cls] = { total: 0, boys: 0, girls: 0, active: 0 };
    });

    students.forEach(st => {
      const cls = st.currentClass;
      if (stats[cls]) {
        stats[cls].total += 1;
        if (st.status === 'Active') stats[cls].active += 1;
        if (st.gender === 'Male') stats[cls].boys += 1;
        if (st.gender === 'Female') stats[cls].girls += 1;
      }
    });

    return stats;
  }, [students]);

  // Filtered class records
  const filteredClasses = useMemo(() => {
    return classRecords.filter(c => {
      const matchesTier = selectedTier === 'All' || c.tier === selectedTier;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                            c.room.toLowerCase().includes(search.toLowerCase()) ||
                            (c.classTeacherName || '').toLowerCase().includes(search.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [classRecords, selectedTier, search]);

  // Roster students for active roster modal
  const rosterStudents = useMemo(() => {
    if (!viewingRosterClass) return [];
    return students.filter(s => s.currentClass === viewingRosterClass);
  }, [viewingRosterClass, students]);

  return (
    <div className="space-y-6 animate-fade-in" id="class-management-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <School className="w-3.5 h-3.5" />
              <span>Jonathan's Child Care Academic Structure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Class Management</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Supervise classroom capacities, assign class teachers, manage learning streams (Science, Arts, Commercial), and review pupil allocations across Nursery, Primary, JSS, and SSS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Print Class Allocations</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Total Classes</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{CLASSES_LIST.length} Classes</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Nursery & Primary</span>
            <span className="text-lg font-bold text-teal-300 mt-0.5 block">9 Classes</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Junior & Senior Secondary</span>
            <span className="text-lg font-bold text-teal-200 mt-0.5 block">6 Classes</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px] font-medium">Total Enrolled Pupils</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{students.length} Pupils</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['All', 'Nursery', 'Primary', 'JSS', 'SSS'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTier === tier 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tier === 'All' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class, room, or teacher..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(cls => {
          const stats = classStats[cls.name] || { total: 0, boys: 0, girls: 0, active: 0 };
          const occupancyRate = Math.min(100, Math.round((stats.total / (cls.capacity || 35)) * 100));

          return (
            <div 
              key={cls.name}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    cls.tier === 'Nursery' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    cls.tier === 'Primary' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                    cls.tier === 'JSS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {cls.tier}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Class Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{cls.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{cls.room}</p>

                {/* Class Teacher */}
                <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Teacher</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cls.classTeacherName || 'Unassigned'}</span>
                  </div>
                  <UserCheck className="w-4 h-4 text-teal-600" />
                </div>

                {/* Pupil Statistics */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Occupancy</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{stats.total} / {cls.capacity} Pupils ({occupancyRate}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        occupancyRate > 90 ? 'bg-rose-500' : occupancyRate > 75 ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Boys: <strong className="text-slate-600 dark:text-slate-300">{stats.boys}</strong></span>
                    <span>Girls: <strong className="text-slate-600 dark:text-slate-300">{stats.girls}</strong></span>
                    <span>Active: <strong className="text-teal-600 font-bold">{stats.active}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingRosterClass(cls.name)}
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Roster ({stats.total})</span>
                </button>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('attendance', { className: cls.name })}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Take Attendance"
                  >
                    Attendance
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Class Modal */}
      {activeClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit {activeClassModal.name} Settings
              </h3>
              <button 
                onClick={() => setActiveClassModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Assigned Class Teacher</label>
                <input 
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  placeholder="e.g. Mr. Mohamed Koroma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Classroom Location / Room</label>
                <input 
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="e.g. Block B - Room 204"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Class Seating Capacity</label>
                <input 
                  type="number"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(parseInt(e.target.value) || 35)}
                  min={10}
                  max={60}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveClassModal(null)}
                  className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster Viewer Modal */}
      {viewingRosterClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Class Roster: {viewingRosterClass}
                </h3>
                <p className="text-xs text-slate-400">
                  {rosterStudents.length} pupils registered in this class
                </p>
              </div>
              <button 
                onClick={() => setViewingRosterClass(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-3 divide-y divide-slate-100">
              {rosterStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No pupils currently enrolled in {viewingRosterClass}.
                </div>
              ) : (
                rosterStudents.map((st, idx) => (
                  <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 w-6 text-right">{idx + 1}.</span>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{st.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono">{st.admissionNumber}</span>
                          <span>•</span>
                          <span>{st.gender}</span>
                          {st.stream && (
                            <>
                              <span>•</span>
                              <span className="text-teal-600 font-semibold">{st.stream}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Jonathan's Child Care Register</span>
              <button
                type="button"
                onClick={() => setViewingRosterClass(null)}
                className="py-2 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
