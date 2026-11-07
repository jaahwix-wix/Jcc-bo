/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Calendar, 
  FileText,
  CreditCard,
  QrCode,
  Download
} from 'lucide-react';
import { SCHOOL_INFO } from '../initialData';
import schoolLogo from '../assets/logo.jpg';

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  studentName: string;
  admissionNumber: string;
  studentClass: string;
  parentName?: string;
  parentPhone?: string;
  academicYear?: string;
  term?: number;
  amount: number;
  paymentMethod: string;
  totalDue?: number;
  balanceRemaining?: number;
  bursarName?: string;
}

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

export default function OfficialReceiptModal({ isOpen, onClose, receipt }: OfficialReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedAmount = (receipt.amount || 0).toLocaleString();
  const termName = receipt.term ? `Term ${receipt.term}` : 'Current Term';
  const academicYear = receipt.academicYear || '2025/2026';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        className="bg-white text-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:max-w-none print:rounded-none"
        id="printable-receipt-modal"
      >
        {/* Top Control Bar (Hidden when Printing) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-teal-300">
              Official Bursary Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6" id="receipt-print-area">
          {/* Header with Tricolor accent */}
          <div className="relative border-b-2 border-slate-900 pb-5">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full mb-4">
              <div className="bg-emerald-500 w-1/3"></div>
              <div className="bg-white border border-slate-200 w-1/3"></div>
              <div className="bg-teal-600 w-1/3"></div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img 
                  src={schoolLogo} 
                  alt={SCHOOL_INFO.name} 
                  className="w-16 h-16 rounded-2xl object-contain bg-white p-1 border border-slate-200 shadow-xs"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                    {SCHOOL_INFO.name}
                  </h1>
                  <p className="text-xs font-semibold text-teal-700 mt-1">
                    MBSSE Registered • Bo District Directorate
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {SCHOOL_INFO.address}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono font-medium">
                    Tel: {SCHOOL_INFO.phone} • Email: {SCHOOL_INFO.email}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-teal-50 text-teal-800 border border-teal-200">
                  Original Receipt
                </span>
                <p className="font-mono text-xs font-black text-slate-800 mt-1.5">
                  {receipt.receiptNumber}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Date: {receipt.date}
                </p>
              </div>
            </div>
          </div>

          {/* Student & Term Identification Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Pupil Name</span>
              <p className="font-black text-slate-900 text-sm mt-0.5">{receipt.studentName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Admission Number</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{receipt.admissionNumber}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Class</span>
              <p className="font-bold text-teal-700 mt-0.5">{receipt.studentClass}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Academic Session</span>
              <p className="font-bold text-slate-700 mt-0.5">{academicYear} ({termName})</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Payment Channel</span>
              <p className="font-bold text-slate-800 mt-0.5">{receipt.paymentMethod}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Guardian Contact</span>
              <p className="font-medium text-slate-700 mt-0.5">{receipt.parentName || 'School Guardian'}</p>
            </div>
          </div>

          {/* Ledger Payment Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-center">Session / Term</th>
                  <th className="py-2.5 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Tuition & Continuous Assessment Dues
                    <span className="text-[10px] text-slate-500 font-normal block">
                      Fee installment settlement via {receipt.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-600">
                    {termName}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-sm text-teal-700 font-mono">
                    SLE {formattedAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block">
                Total Amount Received
              </span>
              <p className="text-2xl font-black text-teal-900 font-mono mt-0.5">
                SLE {formattedAmount}
              </p>
              <p className="text-[11px] font-medium text-teal-700 mt-0.5">
                Sierra Leone New Leones (Official Currency)
              </p>
            </div>

            {receipt.balanceRemaining !== undefined && (
              <div className="text-right sm:border-l sm:border-teal-200 sm:pl-6">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Remaining Term Balance
                </span>
                <p className={`text-base font-black font-mono mt-0.5 ${receipt.balanceRemaining > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {receipt.balanceRemaining > 0 ? `SLE ${receipt.balanceRemaining.toLocaleString()}` : 'Fully Settled (SLE 0)'}
                </p>
              </div>
            )}
          </div>

          {/* Signatures & Certification Seal */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-8">Authorized Bursar Signature</p>
              <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
                {receipt.bursarName || 'Mr. Emmanuel Bio'}
                <span className="text-[10px] text-slate-400 block font-normal">Bursary & Accounts Controller</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-8">Official School Seal</p>
              <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
                {SCHOOL_INFO.principalName}
                <span className="text-[10px] text-slate-400 block font-normal">{SCHOOL_INFO.principalTitle}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 text-[10px] text-slate-400">
            <p>Thank you for your prompt fee remittance. Official electronic record generated by {SCHOOL_INFO.name} MIS.</p>
            <p className="font-mono mt-0.5">System Reference: {receipt.receiptNumber} • Bo Campus</p>
          </div>
        </div>

        {/* Footer Actions (Hidden when printing) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-[11px] text-slate-500">
            Printable to standard A4 or 80mm thermal receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
