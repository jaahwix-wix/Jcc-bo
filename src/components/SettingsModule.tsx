/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Calendar, 
  BookOpen, 
  Award, 
  Shield, 
  Save, 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock,
  Sparkles,
  School
} from 'lucide-react';
import { SCHOOL_INFO } from '../initialData';
import { CLASSES_LIST, WAEC_GRADING_SCALE, PRIMARY_GRADING_SCALE } from '../constants';
import { useAuth } from '../context/AuthContext';

interface SettingsModuleProps {
  onOpenPrivileges?: () => void;
}

export default function SettingsModule({ onOpenPrivileges }: SettingsModuleProps) {
  const { role, can } = useAuth();
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [currentTerm, setCurrentTerm] = useState<1 | 2 | 3>(3);
  const [termStart, setTermStart] = useState('2026-04-14');
  const [termEnd, setTermEnd] = useState('2026-07-24');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      academicYear,
      currentTerm,
      termStart,
      termEnd,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('jcc_system_settings', JSON.stringify(config));
    setSaveStatus('System settings updated and saved successfully.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings-module">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>System Configuration & Academic Master Rules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Settings & Academic Rules</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Configure current academic cycles, active terms, grading scale benchmarks, school profile details, and role-based permissions for Jonathan's Child Care (JCC).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 text-teal-200 border border-white/20">
              Active: 2025/2026 Term {currentTerm}
            </span>
          </div>
        </div>

        {saveStatus && (
          <div className="mt-4 p-3 bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic Calendar & Term Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 rounded-xl border border-teal-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Academic Session & Term Setup</h3>
                <p className="text-xs text-slate-400">Controls the active grading, attendance, and fee assessment period</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026 (Active Session)</option>
                  <option value="2026/2027">2026/2027 (Upcoming)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Active Term</label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCurrentTerm(t)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        currentTerm === t
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Term {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Term Start Date</label>
                <input 
                  type="date"
                  value={termStart}
                  onChange={(e) => setTermStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Term Closing / Vacation Date</label>
                <input 
                  type="date"
                  value={termEnd}
                  onChange={(e) => setTermEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Academic Settings</span>
              </button>
            </div>
          </form>

          {/* Grading System Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 rounded-xl border border-teal-100">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Grading Scales & Benchmarks</h3>
                <p className="text-xs text-slate-400">West African Examinations Council (WAEC) & Sierra Leone MBSSE standards</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Secondary Grading (JSS & SSS) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Secondary Scale (JSS & SSS)</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">WAEC Aligned</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  {WAEC_GRADING_SCALE.slice(0, 6).map(g => (
                    <div key={g.grade} className="flex justify-between py-0.5 border-b border-slate-200/50">
                      <span className="font-mono font-bold text-teal-700">{g.grade} (≥ {g.minScore}%)</span>
                      <span className="text-slate-600">{g.remark}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary & Nursery Grading */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Primary & Nursery Scale</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">MBSSE Standard</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  {PRIMARY_GRADING_SCALE.map(g => (
                    <div key={g.grade} className="flex justify-between py-0.5 border-b border-slate-200/50">
                      <span className="font-mono font-bold text-teal-700">{g.grade} (≥ {g.minScore}%)</span>
                      <span className="text-slate-600">{g.remark}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Identity & Permissions */}
        <div className="space-y-6">
          {/* Institutional Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-100">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Institutional Profile</h3>
                <p className="text-xs text-slate-400">School registration details</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">System / School Name</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{SCHOOL_INFO.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Physical Location</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{SCHOOL_INFO.address}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Phone Line</span>
                <p className="font-mono font-bold text-teal-700 dark:text-teal-400 mt-0.5">{SCHOOL_INFO.phone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Director and Principal</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{SCHOOL_INFO.principalName}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Curriculum Scope</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">Nursery 1-3 · Primary 1-6 · JSS 1-3 · SSS 1-3</p>
              </div>
            </div>
          </div>

          {/* Access Control & Privileges Callout */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs space-y-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Role-Based Security (RBAC)</h4>
                <p className="text-xs text-slate-400">Governance & privilege enforcement</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Jonathan's Child Care operates on secure role enforcement: Administrators have full oversight, Teachers handle marks and attendance, and Bursars manage tuition and receipting.
            </p>

            {onOpenPrivileges && (
              <button
                type="button"
                onClick={onOpenPrivileges}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Shield className="w-4 h-4" />
                <span>Open Role Switcher & Privileges</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
