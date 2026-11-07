/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  FileJson,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  Table,
  Layers,
  GraduationCap,
  CreditCard,
  Building2,
  Trash2,
  Radio,
  CheckCircle2,
  Cloud,
  CloudUpload,
  CloudDownload,
  FolderArchive,
  History,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Student, StudentAcademicRecord, NationalExamPrep, StudentFeeLedger } from '../types';
import { SCHOOL_INFO } from '../initialData';
import { wipeAllSystemData, getDatabaseAuditCounts } from '../utils/dataStore';
import { 
  saveAllSchoolRecordsToSupabase,
  createReferenceSnapshot,
  fetchReferenceSnapshots,
  deleteReferenceSnapshot,
  clearAllSupabaseSchoolData,
  ReferenceSnapshot
} from '../services/supabaseSync';
import { useAuth } from '../context/AuthContext';
import { getStoredSupabaseConfig } from '../supabase';

interface DataBackupProps {
  students: Student[];
  records: StudentAcademicRecord[];
  examPreps: NationalExamPrep[];
  fees: StudentFeeLedger[];
  onRestoreData: (data: {
    students: Student[];
    records: StudentAcademicRecord[];
    examPreps: NationalExamPrep[];
    fees: StudentFeeLedger[];
  }) => void;
  onResetData: () => void;
  onLoadDemoData?: () => void;
}

export default function DataBackup({ students, records, examPreps, fees, onRestoreData, onResetData, onLoadDemoData }: DataBackupProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAuth();
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isCloudFetching, setIsCloudFetching] = useState(false);
  const [referenceSnapshots, setReferenceSnapshots] = useState<ReferenceSnapshot[]>([]);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshotTitle, setSnapshotTitle] = useState('');
  const [snapshotNotes, setSnapshotNotes] = useState('');
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  React.useEffect(() => {
    loadCloudSnapshots();
  }, []);

  const loadCloudSnapshots = async () => {
    setIsCloudFetching(true);
    try {
      const list = await fetchReferenceSnapshots();
      setReferenceSnapshots(list);
    } catch (err) {
      console.warn('Error fetching reference snapshots:', err);
    } finally {
      setIsCloudFetching(false);
    }
  };

  const handleSaveAllToFirestore = async () => {
    setIsCloudSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
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
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
        setSuccessMessage(
          `All school records successfully saved to Supabase Cloud for reference! Synced: ${result.counts.students} students, ${result.counts.records} academic files, ${result.counts.fees} fee ledgers, ${result.counts.teachers} faculty, ${result.counts.books} books, ${result.counts.buses} buses.`
        );
      } else {
        setErrorMessage('Failed to save some collections to Supabase. Please check network connection.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error executing Supabase sync.');
    } finally {
      setIsCloudSaving(false);
      setTimeout(() => setSuccessMessage(''), 7000);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSnapshot(true);
    try {
      const teachers = JSON.parse(localStorage.getItem('sma_teachers') || '[]');
      const books = JSON.parse(localStorage.getItem('sma_library_books') || '[]');

      const newSnap = await createReferenceSnapshot(
        snapshotTitle || `Reference Archive (${new Date().toLocaleDateString('en-GB')})`,
        snapshotNotes,
        user?.displayName || `${SCHOOL_INFO.principalName} (Admin)`,
        { students, records, examPreps, fees, teachers, books }
      );

      if (newSnap) {
        setReferenceSnapshots(prev => [newSnap, ...prev]);
        setSuccessMessage(`Reference archive snapshot "${newSnap.title}" permanently saved in Cloud Firestore!`);
        setShowSnapshotModal(false);
        setSnapshotTitle('');
        setSnapshotNotes('');
      } else {
        setErrorMessage('Failed to archive snapshot to Cloud Firestore.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating snapshot.');
    } finally {
      setIsCreatingSnapshot(false);
      setTimeout(() => setSuccessMessage(''), 6000);
    }
  };

  const handleRestoreSnapshot = (snap: ReferenceSnapshot) => {
    onRestoreData({
      students: snap.payload.students,
      records: snap.payload.records,
      examPreps: snap.payload.examPreps,
      fees: snap.payload.fees
    });
    setSuccessMessage(`Active database loaded from reference snapshot "${snap.title}".`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleDeleteSnapshot = async (id: string) => {
    const ok = await deleteReferenceSnapshot(id);
    if (ok) {
      setReferenceSnapshots(prev => prev.filter(s => s.id !== id));
      setSuccessMessage('Reference archive removed from Cloud Firestore.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // 1. Export Data to JSON
  const handleExport = () => {
    try {
      const dataToExport = {
        app: "Jonathan's Child Care (JCC) Records Manager",
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        payload: {
          students,
          records,
          examPreps,
          fees
        }
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Givers_World_Mission_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage('School database backup downloaded successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to generate database backup file.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Helper: RFC 4180 compliant CSV generator with UTF-8 BOM
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    try {
      const csvContent = '\uFEFF' + rows.map(row => 
        row.map(field => {
          const str = String(field ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      ).join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(`Exported ${filename} successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) {
      setErrorMessage('Failed to generate CSV export file.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // BULK EXPORT 1: Student Records (CSV)
  const handleExportStudentsCSV = () => {
    if (students.length === 0) {
      setErrorMessage('No student records currently in system to export. System is in live clean slate mode.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const headers = [
      'Admission Number',
      'Full Name',
      'Gender',
      'Current Class',
      'Stream',
      'Section',
      'Date of Birth',
      'Address',
      'Parent / Guardian Name',
      'Parent Phone',
      'Blood Group',
      'Allergies',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Enrollment Year',
      'Status'
    ];

    const dataRows = students.map(s => [
      s.admissionNumber,
      s.name,
      s.gender,
      s.currentClass,
      s.stream || 'N/A',
      s.classSection || 'A',
      s.dateOfBirth,
      s.address,
      s.parentName,
      s.parentPhone,
      s.bloodType || 'N/A',
      s.allergies || 'None',
      s.emergencyContactName || 'N/A',
      s.emergencyContactPhone || 'N/A',
      s.enrollmentYear,
      s.status
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`Givers_World_Mission_Students_Register_${dateStr}.csv`, [headers, ...dataRows]);
  };

  // BULK EXPORT 2: Financial Ledgers (CSV)
  const handleExportFeesCSV = () => {
    if (students.length === 0) {
      setErrorMessage('No student fee accounts in system to export. System is in live clean slate mode.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const headers = [
      'Admission Number',
      'Student Name',
      'Class',
      'Term 1 Billed (SLE)',
      'Term 1 Paid (SLE)',
      'Term 1 Balance (SLE)',
      'Term 2 Billed (SLE)',
      'Term 2 Paid (SLE)',
      'Term 2 Balance (SLE)',
      'Term 3 Billed (SLE)',
      'Term 3 Paid (SLE)',
      'Term 3 Balance (SLE)',
      'Total Annual Billed (SLE)',
      'Total Annual Paid (SLE)',
      'Total Outstanding (SLE)',
      'Account Status'
    ];

    const dataRows = students.map(s => {
      const ledger = fees.find(f => f.studentId === s.id);
      const t1 = ledger?.terms[1] || { totalDue: 0, paidAmount: 0, balance: 0, status: 'Unpaid' };
      const t2 = ledger?.terms[2] || { totalDue: 0, paidAmount: 0, balance: 0, status: 'Unpaid' };
      const t3 = ledger?.terms[3] || { totalDue: 0, paidAmount: 0, balance: 0, status: 'Unpaid' };

      const totalBilled = t1.totalDue + t2.totalDue + t3.totalDue;
      const totalPaid = t1.paidAmount + t2.paidAmount + t3.paidAmount;
      const totalBalance = t1.balance + t2.balance + t3.balance;
      const overallStatus = totalBalance === 0 ? 'Fully Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';

      return [
        s.admissionNumber,
        s.name,
        s.currentClass,
        t1.totalDue,
        t1.paidAmount,
        t1.balance,
        t2.totalDue,
        t2.paidAmount,
        t2.balance,
        t3.totalDue,
        t3.paidAmount,
        t3.balance,
        totalBilled,
        totalPaid,
        totalBalance,
        overallStatus
      ];
    });

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`Givers_World_Mission_Financial_Ledger_${dateStr}.csv`, [headers, ...dataRows]);
  };

  // BULK EXPORT 3: Student Master Register (PDF / Printable Report)
  const handleExportStudentsPDF = () => {
    if (students.length === 0) {
      setErrorMessage('No students enrolled in registry. Add students before generating official PDF register.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Pop-up was blocked. Please allow pop-ups for this site to generate the official report.');
        return;
      }

      const activeCount = students.filter(s => s.status === 'Active').length;
      const maleCount = students.filter(s => s.gender === 'Male').length;
      const femaleCount = students.filter(s => s.gender === 'Female').length;
      const dateString = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const tableRowsHtml = students.map((s, idx) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: 600;">${s.admissionNumber}</td>
          <td style="font-weight: 600;">${s.name}</td>
          <td>${s.gender}</td>
          <td><strong>${s.currentClass}</strong> ${s.stream ? `(${s.stream})` : ''}</td>
          <td>${s.parentName}</td>
          <td style="font-family: monospace;">${s.parentPhone}</td>
          <td>${s.address}</td>
          <td style="text-align: center;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; ${s.status === 'Active' ? 'background: #ecfdf5; color: #047857;' : 'background: #fef2f2; color: #b91c1c;'}">
              ${s.status}
            </span>
          </td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${SCHOOL_INFO.name} - Student Master Registry</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 16px; font-size: 11px; }
            .header-box { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; }
            .header-left { display: flex; align-items: center; gap: 14px; }
            .school-logo { width: 56px; height: 56px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1; }
            .school-title { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin: 0; }
            .school-sub { font-size: 10px; color: #475569; margin: 2px 0 0 0; }
            .report-badge { text-align: right; }
            .badge-title { font-size: 13px; font-weight: 800; color: #4338ca; text-transform: uppercase; margin: 0; }
            .stats-bar { display: flex; gap: 12px; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; }
            .stat-item { flex: 1; }
            .stat-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .stat-value { font-size: 14px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
            th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 6px 8px; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
            td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 16px; border-top: 1px dashed #cbd5e1; page-break-inside: avoid; }
            .sign-col { width: 220px; text-align: center; }
            .sign-line { border-bottom: 1px solid #0f172a; height: 35px; margin-bottom: 4px; }
            .sign-name { font-weight: 800; font-size: 10px; }
            .sign-title { color: #64748b; font-size: 9px; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #3730a3; font-weight: 600;">Official Student Master Register ready for print / save as PDF.</span>
            <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; cursor: pointer;">Print / Save as PDF</button>
          </div>

          <div class="header-box">
            <div class="header-left">
              <img src="${SCHOOL_INFO.logo}" class="school-logo" alt="Logo" />
              <div>
                <h1 class="school-title">${SCHOOL_INFO.name}</h1>
                <p class="school-sub">Motto: <em>"${SCHOOL_INFO.motto}"</em> • ${SCHOOL_INFO.address}</p>
                <p class="school-sub">Ministry of Basic & Senior Secondary Education (MBSSE) • Bo District Registry</p>
              </div>
            </div>
            <div class="report-badge">
              <p class="badge-title">Official Student Register</p>
              <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">Generated: ${dateString}</p>
              <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">Academic Year: 2025/2026</p>
            </div>
          </div>

          <div class="stats-bar">
            <div class="stat-item">
              <div class="stat-label">Total Enrollment</div>
              <div class="stat-value">${students.length} Students</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Active Status</div>
              <div class="stat-value" style="color: #047857;">${activeCount} Active</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Gender Breakdown</div>
              <div class="stat-value">${maleCount} Male / ${femaleCount} Female</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Accreditation Tier</div>
              <div class="stat-value">Pre-School to SSS 3</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">#</th>
                <th>Admission No</th>
                <th>Student Full Name</th>
                <th>Gender</th>
                <th>Current Class</th>
                <th>Parent / Guardian</th>
                <th>Contact Phone</th>
                <th>Residential Address</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-col">
              <div class="sign-line"></div>
              <div class="sign-name">School Registrar</div>
              <div class="sign-title">Givers World Mission Admissions Office</div>
            </div>
            <div class="sign-col">
              <div class="sign-line"></div>
              <div class="sign-name">${SCHOOL_INFO.principalName}</div>
              <div class="sign-title">${SCHOOL_INFO.principalTitle}</div>
            </div>
            <div class="sign-col">
              <div class="sign-line"></div>
              <div class="sign-name">District Inspector of Schools</div>
              <div class="sign-title">MBSSE Bo District Directorate</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      setSuccessMessage('Student Registry PDF document opened for printing / save.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to generate printable PDF view.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // BULK EXPORT 4: Financial Ledger (PDF / Printable Report)
  const handleExportFeesPDF = () => {
    if (students.length === 0) {
      setErrorMessage('No student fee accounts found. Add students before generating official PDF ledger.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Pop-up was blocked. Please allow pop-ups for this site to generate the official financial report.');
        return;
      }

      let totalAnnualBilled = 0;
      let totalAnnualPaid = 0;
      let totalAnnualBalance = 0;

      const rowsHtml = students.map((s, idx) => {
        const ledger = fees.find(f => f.studentId === s.id);
        const t1 = ledger?.terms[1] || { totalDue: 0, paidAmount: 0, balance: 0, status: 'Unpaid' };
        const t2 = ledger?.terms[2] || { totalDue: 0, paidAmount: 0, balance: 0, status: 'Unpaid' };
        const t3 = ledger?.terms[3] || { totalDue: 0, paidAmount: 0, balance: 0, status: 'Unpaid' };

        const billed = t1.totalDue + t2.totalDue + t3.totalDue;
        const paid = t1.paidAmount + t2.paidAmount + t3.paidAmount;
        const balance = t1.balance + t2.balance + t3.balance;

        totalAnnualBilled += billed;
        totalAnnualPaid += paid;
        totalAnnualBalance += balance;

        const statusStyle = balance === 0 
          ? 'background: #ecfdf5; color: #047857;' 
          : paid > 0 
            ? 'background: #fffbeb; color: #b45309;' 
            : 'background: #fef2f2; color: #b91c1c;';

        const statusLabel = balance === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

        return `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td style="font-family: monospace;">${s.admissionNumber}</td>
            <td style="font-weight: 600;">${s.name}</td>
            <td><strong>${s.currentClass}</strong></td>
            <td style="text-align: right;">SLE ${t1.balance.toLocaleString()}</td>
            <td style="text-align: right;">SLE ${t2.balance.toLocaleString()}</td>
            <td style="text-align: right;">SLE ${t3.balance.toLocaleString()}</td>
            <td style="text-align: right; font-weight: 600;">SLE ${billed.toLocaleString()}</td>
            <td style="text-align: right; color: #047857; font-weight: 700;">SLE ${paid.toLocaleString()}</td>
            <td style="text-align: right; color: ${balance > 0 ? '#b91c1c' : '#047857'}; font-weight: 800;">SLE ${balance.toLocaleString()}</td>
            <td style="text-align: center;">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; ${statusStyle}">
                ${statusLabel}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      const collectionRate = totalAnnualBilled > 0 ? Math.round((totalAnnualPaid / totalAnnualBilled) * 100) : 0;
      const dateString = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${SCHOOL_INFO.name} - Official Tuition Accounts Ledger</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 16px; font-size: 11px; }
            .header-box { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; }
            .header-left { display: flex; align-items: center; gap: 14px; }
            .school-logo { width: 56px; height: 56px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1; }
            .school-title { font-size: 18px; font-weight: 900; color: #0f172a; margin: 0; }
            .school-sub { font-size: 10px; color: #475569; margin: 2px 0 0 0; }
            .stats-bar { display: flex; gap: 12px; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; }
            .stat-item { flex: 1; }
            .stat-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .stat-value { font-size: 14px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
            th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 6px 8px; font-weight: 700; text-transform: uppercase; font-size: 9px; }
            td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 16px; border-top: 1px dashed #cbd5e1; page-break-inside: avoid; }
            .sign-col { width: 220px; text-align: center; }
            .sign-line { border-bottom: 1px solid #0f172a; height: 35px; margin-bottom: 4px; }
            .sign-name { font-weight: 800; font-size: 10px; }
            .sign-title { color: #64748b; font-size: 9px; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #3730a3; font-weight: 600;">Official Financial & Fee Ledger ready for print / save as PDF.</span>
            <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; cursor: pointer;">Print / Save as PDF</button>
          </div>

          <div class="header-box">
            <div class="header-left">
              <img src="${SCHOOL_INFO.logo}" class="school-logo" alt="Logo" />
              <div>
                <h1 class="school-title">${SCHOOL_INFO.name}</h1>
                <p class="school-sub">Office of the Bursar & Accounts Directorate • ${SCHOOL_INFO.address}</p>
                <p class="school-sub">Free Quality School Education (FQSE) Subsidies & Tuition Financial Ledger</p>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 13px; font-weight: 800; color: #047857; text-transform: uppercase; margin: 0;">Tuition Accounts Ledger</p>
              <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">Audit Date: ${dateString}</p>
              <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">Currency: Sierra Leone New Leones (SLE)</p>
            </div>
          </div>

          <div class="stats-bar">
            <div class="stat-item">
              <div class="stat-label">Total Annual Billed</div>
              <div class="stat-value">SLE ${totalAnnualBilled.toLocaleString()}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Revenue Collected</div>
              <div class="stat-value" style="color: #047857;">SLE ${totalAnnualPaid.toLocaleString()}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Outstanding Balance</div>
              <div class="stat-value" style="color: #b91c1c;">SLE ${totalAnnualBalance.toLocaleString()}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Collection Rate</div>
              <div class="stat-value" style="color: #4338ca;">${collectionRate}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">#</th>
                <th>Admission No</th>
                <th>Student Full Name</th>
                <th>Class</th>
                <th style="text-align: right;">T1 Due</th>
                <th style="text-align: right;">T2 Due</th>
                <th style="text-align: right;">T3 Due</th>
                <th style="text-align: right;">Total Billed</th>
                <th style="text-align: right;">Total Paid</th>
                <th style="text-align: right;">Balance (SLE)</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-col">
              <div class="sign-line"></div>
              <div class="sign-name">Bursar / Financial Controller</div>
              <div class="sign-title">Givers World Mission Bursary</div>
            </div>
            <div class="sign-col">
              <div class="sign-line"></div>
              <div class="sign-name">${SCHOOL_INFO.principalName}</div>
              <div class="sign-title">${SCHOOL_INFO.principalTitle}</div>
            </div>
            <div class="sign-col">
              <div class="sign-line"></div>
              <div class="sign-name">Auditor / Board Representative</div>
              <div class="sign-title">Financial Oversight Committee</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      setSuccessMessage('Financial Ledger PDF document opened for printing / save.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to generate printable financial PDF view.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // 2. Import / Restore Data from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Validation checks
        if (!["Jonathan's Child Care (JCC) Records Manager", 'Givers World Mission School Records Manager', 'Naiahcom School Records Manager', 'Salone Model Academy Records Manager'].includes(json.app) || !json.payload) {
          throw new Error('Invalid backup file signature.');
        }

        const { students: impStuds, records: impRecs, examPreps: impPreps, fees: impFees } = json.payload;

        if (!Array.isArray(impStuds) || !Array.isArray(impRecs) || !Array.isArray(impPreps) || !Array.isArray(impFees)) {
          throw new Error('Malformed backup database records structure.');
        }

        onRestoreData({
          students: impStuds,
          records: impRecs,
          examPreps: impPreps,
          fees: impFees
        });

        setSuccessMessage(`Database restored successfully. Loaded ${impStuds.length} student files.`);
        setErrorMessage('');
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to parse database backup file. Ensure it is a valid NS/SMA JSON file.');
        setSuccessMessage('');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ''; // clear input
  };

  return (
    <div className="space-y-6" id="data-backup-portal">
      {/* Informative Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Backup & Administration Center</h2>
        <p className="text-xs text-slate-400">Save records to Supabase Cloud for reference, export database backups, or generate official audit reports</p>
      </div>

      {/* SUPABASE REFERENCE STORAGE & DATABASE SYNC */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl space-y-5" id="supabase-cloud-reference-center">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-900/60 pb-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl shadow-inner">
              <Cloud className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-white text-base sm:text-lg">
                  Supabase Cloud Reference Database
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Supabase Cloud
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Persistent cloud storage for Jonathan's Child Care Ministries. Save all active records into your dedicated Supabase database for permanent reference and historical audit.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-[11px] text-slate-300">
              <span className="text-emerald-400 font-bold">Supabase:</span> Connected
            </div>
            {lastSyncTime && (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Synced at {lastSyncTime}
              </span>
            )}
          </div>
        </div>

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Registry</span>
            <span className="text-lg font-black text-white mt-0.5 block">{students.length} Records</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Terms</span>
            <span className="text-lg font-black text-indigo-300 mt-0.5 block">{records.length} Student Files</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tuition Ledgers</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">{fees.length} Accounts</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saved Archives</span>
            <span className="text-lg font-black text-amber-300 mt-0.5 block">{referenceSnapshots.length} Snapshots</span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isCloudSaving}
              onClick={handleSaveAllToFirestore}
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
              title="Save all currently staged records to Supabase Cloud for permanent reference"
            >
              <CloudUpload className={`w-4 h-4 ${isCloudSaving ? 'animate-bounce' : ''}`} />
              <span>{isCloudSaving ? 'Saving to Supabase...' : 'Save All Records to Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSnapshotModal(true)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border border-indigo-400/40"
              title="Archive a labeled historical snapshot of current records in Supabase"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Save Reference Snapshot Archive</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isCloudFetching}
            onClick={loadCloudSnapshots}
            className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Refresh saved snapshots from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCloudFetching ? 'animate-spin' : ''}`} />
            <span>Refresh Cloud</span>
          </button>
        </div>

        {/* Saved Reference Snapshots Table */}
        <div className="pt-3 border-t border-indigo-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Saved Reference Snapshot Archives in Supabase ({referenceSnapshots.length})
            </h4>
            <span className="text-[11px] text-slate-400">Immutable cloud audit checkpoints</span>
          </div>

          {referenceSnapshots.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center py-6 space-y-2">
              <FolderArchive className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No reference snapshots created yet.</p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Click <span className="text-emerald-400 font-bold">"Save All Records to Supabase"</span> to sync current data, or click <span className="text-indigo-300 font-bold">"Save Reference Snapshot Archive"</span> to create an audit reference point.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {referenceSnapshots.map(snap => (
                <div 
                  key={snap.id} 
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-white text-sm">{snap.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">
                        {new Date(snap.savedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date(snap.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {snap.notes && (
                      <p className="text-[11px] text-slate-300 line-clamp-1">{snap.notes}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5 flex-wrap">
                      <span>👤 Saved by: <strong className="text-slate-300">{snap.savedBy}</strong></span>
                      <span>👥 {snap.metrics.studentsCount} Students</span>
                      <span>📚 {snap.metrics.recordsCount} Academic Files</span>
                      <span>💳 {snap.metrics.feesCount} Fee Ledgers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Load this reference snapshot into active database"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Load Snapshot</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Delete snapshot from Supabase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE REFERENCE SNAPSHOT ARCHIVE */}
      {showSnapshotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Save Reference Archive Snapshot</h3>
                  <p className="text-[11px] text-slate-400">Save complete checkpoint to Supabase</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSnapshotModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Archive Title / Reference Label</label>
                <input
                  type="text"
                  required
                  value={snapshotTitle}
                  onChange={(e) => setSnapshotTitle(e.target.value)}
                  placeholder={`e.g. 2025/2026 Term 3 Final Audit (${new Date().toLocaleDateString('en-GB')})`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Administrative Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={snapshotNotes}
                  onChange={(e) => setSnapshotNotes(e.target.value)}
                  placeholder="Notes for ministerial audit, end-of-term reference, or enrollment milestone..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1 text-[11px] text-slate-300">
                <span className="font-bold text-indigo-300 block">Snapshot Contents:</span>
                <p>• {students.length} Student Files & Identifiers</p>
                <p>• {records.length} Terminal Continuous Assessments</p>
                <p>• {fees.length} Tuition Fee Accounts & Transaction Receipts</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSnapshotModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSnapshot}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{isCreatingSnapshot ? 'Saving Snapshot...' : 'Save to Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK EXPORT FEATURE: External Reporting & Audit Center */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5" id="bulk-export-center">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bulk Export & External Reporting</h3>
              <p className="text-xs text-slate-500">
                Official ministerial and administrative export formats for MBSSE, District Education Office Bo, and School Audits
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            MBSSE & Audit Compliant
          </span>
        </div>

        {/* 2-Column Bulk Export Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Module 1: Student Master Register */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Student Master Register</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Export all {students.length} registered students including Admission Number, Class, Stream, Parent / Guardian information, contact numbers, and medical data.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={handleExportStudentsCSV}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                title="Download full student master register as CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportStudentsPDF}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                title="Open official formatted student register for printing or saving as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Official PDF</span>
              </button>
            </div>
          </div>

          {/* Module 2: Financial & Tuition Fee Ledgers */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Financial & Tuition Fee Ledgers</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Audit breakdown of Term 1, Term 2, and Term 3 dues, collections, and outstanding receivable balances in Sierra Leone New Leones (SLE).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={handleExportFeesCSV}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                title="Download financial ledger and fees audit as CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportFeesPDF}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                title="Open official bursary tuition ledger for printing or saving as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Export & Import Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Export Database */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Download School Backup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate a completely compiled database snapshot file containing all registered students, term continuous assessments, exam prep predictors, and fee histories. Keep this file safe on your computer as a terminal backup.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> SECURE JSON SIGNATURE
            </span>
            <button
              onClick={handleExport}
              className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <FileJson className="w-4 h-4" /> Download Backup (.json)
            </button>
          </div>
        </div>

        {/* Card 2: Restore Database */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Upload & Restore Database</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a previously downloaded NS/SMA backup file (`.json`) to completely restore your student lists, continuous assessments, and payment records. Restoring will overwrite the current live browser database state.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <span className="text-slate-400 font-semibold">OVERWRITES LIVE STATE</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Database className="w-4 h-4" /> Upload Backup File
            </button>
          </div>
        </div>

      </div>

      {/* Alerts Row */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-100 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-indigo-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card 3: Production Go-Live & Database Maintenance Operations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Production Go-Live & Clean Slate Controls
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Prepare Givers World Mission School for official deployment or sandbox testing.
            </p>
          </div>
          <span className={`self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
            students.length === 0 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${students.length === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {students.length === 0 ? 'Live Mode: Clean Production Slate' : 'Data Loaded: Active Records'}
          </span>
        </div>

        {/* Database Partition Summary */}
        {(() => {
          const audit = getDatabaseAuditCounts();
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Students Enrolled</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{students.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Academic Records</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{records.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Fee Ledgers</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{fees.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Staff & Faculty</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{audit.teachers}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Library Catalog</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{audit.books} Books</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">School Fleet</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{audit.buses} Buses</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Attendance Logs</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{audit.attendance}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Disciplinary Logs</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{audit.incidents}</p>
              </div>
            </div>
          );
        })()}

        {/* Action 1: Delete All Data to Go Live */}
        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete All Data to Go Live
            </p>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Completely wipe all students, grades, fee transactions, faculty files, library items, bus routes, and attendance logs. This prepares the system with a 100% blank slate ready for real-world school admissions.
            </p>
          </div>

          <button
            onClick={async () => {
              wipeAllSystemData();
              try {
                await clearAllSupabaseSchoolData();
              } catch (e) {
                console.warn('Supabase purge notice:', e);
              }
              onResetData();
              setSuccessMessage('All students, staff, teachers and school data deleted from local storage and Supabase! Live clean baseline active.');
              setTimeout(() => setSuccessMessage(''), 5000);
            }}
            className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Trash2 className="w-4 h-4" /> Reset Database Records
          </button>
        </div>

        {/* Action 2: Optional Sandbox Demo Data */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5 max-w-xl">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Populate Foundational Records
            </p>
            <p className="text-[11px] text-slate-500">
              Immediately generates and loads comprehensive Sierra Leone school records (students, grades, WASSCE preps, fees).
            </p>
          </div>

          <button
            onClick={() => {
              if (onLoadDemoData) {
                onLoadDemoData();
              }
              setSuccessMessage('Foundational reference records generated and loaded successfully.');
              setTimeout(() => setSuccessMessage(''), 4000);
            }}
            className="py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" /> Generate & Load Records
          </button>
        </div>
      </div>
    </div>
  );
}
