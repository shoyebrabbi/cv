import React, { useState, useRef } from 'react';
import {
  X,
  FileDown,
  Printer,
  FileText,
  FileSpreadsheet,
  FileCheck,
  FileCode,
  Download,
  Upload,
  Copy,
  Sparkles,
  Cloud,
  Lock,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

interface ExportHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onPrint: () => void;
  onExportWord: (ext: 'doc' | 'docx') => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onExportHTML: () => void;
  onExportMarkdown: () => void;
  onExportPlainText: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCopyAllText: () => void;
  ownerEmail?: string | null;
  cloudSyncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  onSyncCloudNow?: () => Promise<void>;
  onLockStudio: () => void;
}

export function ExportHubModal({
  isOpen,
  onClose,
  onExportPDF,
  onExportPNG,
  onPrint,
  onExportWord,
  onExportExcel,
  onExportCSV,
  onExportHTML,
  onExportMarkdown,
  onExportPlainText,
  onExportJSON,
  onImportJSON,
  onCopyAllText,
  ownerEmail,
  cloudSyncStatus = 'synced',
  onSyncCloudNow,
  onLockStudio,
}: ExportHubModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'docs' | 'data' | 'security'>('all');
  const [manualSynced, setManualSynced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handleManualSync() {
    if (!onSyncCloudNow) return;
    await onSyncCloudNow();
    setManualSynced(true);
    setTimeout(() => setManualSynced(false), 2500);
  }

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-3xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                Shoyeb Export &amp; Security Hub
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                সকল ডকুমেন্ট ফরম্যাট, ডেটা ব্যাকআপ এবং ওনার লগইন সিকিউরিটি কন্ট্রোল
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0F172A] border-b border-slate-800 flex flex-nowrap overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Formats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'docs' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Print &amp; Office Docs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'data' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Excel, Web &amp; Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Backup &amp; Passcode
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* SECTION 1: DOCUMENTS & PRINT */}
          {(activeTab === 'all' || activeTab === 'docs') && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                📄 প্রিন্ট এবং অফিস ডকুমেন্ট (Print & Office Formats)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF();
                    onClose();
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Direct A4 PDF</div>
                    <div className="text-[11px] text-slate-400">১-ক্লিকে সরাসরি A4 PDF ডাউনলোড</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => onPrint(), 150);
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Vector Print / Save PDF</div>
                    <div className="text-[11px] text-slate-400">হাই-রেজোলিউশন প্রিন্ট ও সিলেক্টেবল টেক্সট</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportWord('docx');
                    onClose();
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Microsoft Word (.docx)</div>
                    <div className="text-[11px] text-slate-400">আধুনিক MS Word-এ এডিটযোগ্য ফরম্যাট</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportWord('doc');
                    onClose();
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Word Classic (.doc)</div>
                    <div className="text-[11px] text-slate-400">সকল পুরোনো ও নতুন MS Word ভার্সনে সাপোর্টেড</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportPNG();
                    onClose();
                  }}
                  className="sm:col-span-2 flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">High-Res CV Image (.png)</div>
                    <div className="text-[11px] text-slate-400">LinkedIn, WhatsApp বা মোবাইল শেয়ারের জন্য ক্রিস্প HD ইমেজ ডাউনলোড</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: DATA, WEB & DEVELOPER FORMATS */}
          {(activeTab === 'all' || activeTab === 'data') && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                📊 স্প্রেডশিট, ওয়েব ও ATS ডেটা (Spreadsheets & Web Files)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onExportExcel();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-800/70 border border-emerald-500/30 hover:border-emerald-400 transition text-left flex items-center gap-2.5"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Excel (.xlsx)</div>
                    <div className="text-[10px] text-slate-400">৫-শিটের পূর্ণাঙ্গ ওয়ার্কবুক</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportCSV();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-800/70 border border-teal-500/30 hover:border-teal-400 transition text-left flex items-center gap-2.5"
                >
                  <FileCheck className="w-5 h-5 text-teal-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">CSV Matrix (.csv)</div>
                    <div className="text-[10px] text-slate-400">ডেটা অ্যানালাইসিস টেবিল</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportHTML();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-800/70 border border-orange-500/30 hover:border-orange-400 transition text-left flex items-center gap-2.5"
                >
                  <FileCode className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Web HTML (.html)</div>
                    <div className="text-[10px] text-slate-400">স্ট্যান্ডঅ্যালোন ওয়েব ফাইল</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportMarkdown();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-blue-400 transition text-left flex items-center gap-2.5"
                >
                  <FileText className="w-5 h-5 text-blue-300 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Markdown (.md)</div>
                    <div className="text-[10px] text-slate-400">GitHub README স্টাইল</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportPlainText();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-slate-400 transition text-left flex items-center gap-2.5"
                >
                  <FileText className="w-5 h-5 text-slate-300 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Plain Text (.txt)</div>
                    <div className="text-[10px] text-slate-400">ক্লিন ATS টেক্সট ফাইল</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onCopyAllText();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-800/70 border border-cyan-500/30 hover:border-cyan-400 transition text-left flex items-center gap-2.5"
                >
                  <Copy className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Copy Full Text</div>
                    <div className="text-[10px] text-slate-400">ক্লিপবোর্ডে সম্পূর্ণ সিভি কপি</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: BACKUP & OWNER SECURITY */}
          {(activeTab === 'all' || activeTab === 'security') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Backup & Restore */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  💾 প্রজেক্ট ব্যাকআপ ও রিস্টোর (JSON)
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onExportJSON}
                    className="flex-1 py-2 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" /> Save Backup (.json)
                  </button>
                  <label className="flex-1 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition">
                    <Upload className="w-4 h-4" /> Restore (.json)
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        onImportJSON(e);
                        onClose();
                      }}
                    />
                  </label>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  অন্য কম্পিউটারে বা ব্রাউজারে আপনার সমস্ত এডিট ও ডিজাইন স্থানান্তর করতে JSON ফাইল সেভ করে রাখুন।
                </p>
              </div>

              {/* Cloud Sync & Google Owner Auth */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" /> Firebase ক্লাউড সিঙ্ক ও সিকিউরিটি
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      onLockStudio();
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 text-[10.5px] font-bold flex items-center gap-1 shrink-0"
                  >
                    <Lock className="w-3 h-3" /> Sign Out & Lock
                  </button>
                </div>

                <div className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                  <div className="truncate text-slate-300">
                    Signed in:{' '}
                    <span className="font-semibold text-white">{ownerEmail || 'Google Owner'}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                      cloudSyncStatus === 'syncing'
                        ? 'bg-amber-500/20 text-amber-300'
                        : cloudSyncStatus === 'error'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {cloudSyncStatus === 'syncing'
                      ? 'Syncing...'
                      : cloudSyncStatus === 'error'
                      ? 'Sync Warning'
                      : 'Cloud Live'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={!onSyncCloudNow || cloudSyncStatus === 'syncing'}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  {manualSynced ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> লাইভ ক্লাউডে পাবলিশ সম্পন্ন!
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Sync & Publish All Profiles to Cloud
                    </>
                  )}
                </button>

                <p className="text-[10.5px] text-slate-400">
                  সব এডিট স্বয়ংক্রিয়ভাবে Firebase Firestore-এ সেভ হয়ে বিশ্বব্যাপী লাইভ ওয়েবসাইটে আপডেট হয়।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
