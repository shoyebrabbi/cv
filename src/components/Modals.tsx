import React, { useState } from 'react';
import {
  Link as LinkIcon,
  X,
  Bot,
  PlusCircle,
  AlertTriangle,
  Github,
  CheckCircle2,
  Copy,
  ExternalLink,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HyperlinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string, url: string) => void;
  onRemove: () => void;
  initialText: string;
  initialUrl: string;
}

export function HyperlinkModal({
  isOpen,
  onClose,
  onApply,
  onRemove,
  initialText,
  initialUrl,
}: HyperlinkModalProps) {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl || 'https://');

  React.useEffect(() => {
    setText(initialText);
    setUrl(initialUrl || 'https://');
  }, [initialText, initialUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 text-blue-400 min-w-0">
            <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">Hyperlink Manager (লিংক এডিট)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white shrink-0 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3.5 mt-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-medium">প্রদর্শিত টেক্সট (Display Text):</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="যেমন: LinkedIn / GitHub / Live Project"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1 font-medium">টার্গেট লিংক (Target URL):</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://linkedin.com/in/shoyebrabbi"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 w-full">Quick Presets:</span>
            <button
              type="button"
              onClick={() => {
                setText('LinkedIn');
                setUrl('https://linkedin.com/in/shoyebrabbi');
              }}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px]"
            >
              LinkedIn
            </button>
            <button
              type="button"
              onClick={() => {
                setText('GitHub');
                setUrl('https://github.com/shoyebrabbi');
              }}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px]"
            >
              GitHub
            </button>
            <button
              type="button"
              onClick={() => {
                setText('shoyebrabbi.com');
                setUrl('https://shoyebrabbi.com');
              }}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px]"
            >
              Portfolio
            </button>
            <button
              type="button"
              onClick={() => {
                setText('shoyebrabbi@gmail.com');
                setUrl('mailto:shoyebrabbi@gmail.com');
              }}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px]"
            >
              Email
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2 mt-6 pt-3 border-t border-slate-700">
          <button
            type="button"
            onClick={onRemove}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 whitespace-nowrap"
          >
            Remove Link
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 whitespace-nowrap"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={() => onApply(text, url)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white whitespace-nowrap"
            >
              Save Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ATSAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  scoreBreakdown?: {
    contacts: number;
    headings: number;
    metrics: number;
    keywords: number;
    verbs: number;
    photo: number;
  };
  photoPosition: string;
  cvSearchText?: string;
  onBoost100: () => void;
  onRestoreBDCorporate: () => void;
  onAddKeyword: (kw: string) => void;
}

export function ATSAuditModal({
  isOpen,
  onClose,
  score,
  photoPosition,
  cvSearchText,
  scoreBreakdown,
  onBoost100,
  onRestoreBDCorporate,
  onAddKeyword,
}: ATSAuditModalProps) {
  const [targetRole, setTargetRole] = useState<'hybrid' | 'data' | 'sqa' | 'it'>('hybrid');

  if (!isOpen) return null;

  const isPhotoHidden = photoPosition === 'hide';
  const activeBreakdown = scoreBreakdown || {
    contacts: 15,
    headings: 20,
    metrics: 20,
    keywords: 25,
    verbs: 10,
    photo: isPhotoHidden ? 10 : 0,
  };

  const roleKeywords: Record<'hybrid' | 'data' | 'sqa' | 'it', string[]> = {
    hybrid: [
      'SQL', 'PostgreSQL', 'Power BI', 'Power Query', 'ETL', 'Postman',
      'REST API', 'Jira', 'Regression', 'BVA', 'ECP', 'ERP', 'Windows Server', 'Linux',
    ],
    data: [
      'SQL', 'PostgreSQL', 'Power BI', 'DAX', 'Star Schema', 'Power Query',
      'ETL', 'Excel', 'Python', 'Data Integrity', 'KPI Dashboards', 'PostgreSQL',
    ],
    sqa: [
      'Manual Functional Testing', 'Regression', 'Smoke', 'Sanity', 'BVA',
      'ECP', 'RTM', 'Postman', 'REST API', 'Cypress', 'Jira', 'SDLC', 'STLC', 'Test Plan',
    ],
    it: [
      'ERP', 'SaaS', 'RBAC', 'Windows Server', 'Linux', 'MikroTik',
      'CCNA', 'LAN', 'Switch', 'Backups', 'Active Directory', 'TCP/IP',
    ],
  };

  const currentList = Array.from(new Set(roleKeywords[targetRole]));
  const haystack = (cvSearchText || '').toLowerCase();
  const matchedKeywords = haystack
    ? currentList.filter((k) => haystack.includes(k.toLowerCase()))
    : currentList;
  const missingKeywords = haystack
    ? currentList.filter((k) => !haystack.includes(k.toLowerCase()))
    : [];

  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = ringCircumference * (1 - clampedScore / 100);
  const ringStroke =
    clampedScore === 100 ? '#10b981' : clampedScore >= 85 ? '#3b82f6' : '#f59e0b';

  const pillars = [
    {
      id: 'contacts',
      title: 'Contact & Links',
      subtitle: 'ফোন, ইমেইল ও ক্লিকেবল লিংক',
      pts: activeBreakdown.contacts,
      max: 15,
      status: activeBreakdown.contacts >= 15 ? 'Pass' : 'Needs Check',
      ok: activeBreakdown.contacts >= 15,
    },
    {
      id: 'headings',
      title: 'ATS Section Headings',
      subtitle: 'স্ট্যান্ডার্ড সেকশন ও কাঠামো',
      pts: activeBreakdown.headings,
      max: 20,
      status: activeBreakdown.headings >= 20 ? 'Pass' : 'Needs Check',
      ok: activeBreakdown.headings >= 20,
    },
    {
      id: 'metrics',
      title: 'Quantified Impact',
      subtitle: 'সংখ্যা ও মেট্রিক্স (50k+, 80+)',
      pts: activeBreakdown.metrics,
      max: 20,
      status: activeBreakdown.metrics >= 20 ? 'Pass' : 'Add Numbers',
      ok: activeBreakdown.metrics >= 20,
    },
    {
      id: 'keywords',
      title: 'Domain Keywords',
      subtitle: 'SQL, Power BI, Postman, Linux',
      pts: activeBreakdown.keywords,
      max: 25,
      status: activeBreakdown.keywords >= 20 ? 'Pass' : 'Add Stack',
      ok: activeBreakdown.keywords >= 20,
    },
    {
      id: 'verbs',
      title: 'Action Verbs',
      subtitle: 'শক্তিশালী অ্যাকশন ভার্ব ব্যবহার',
      pts: activeBreakdown.verbs,
      max: 10,
      status: activeBreakdown.verbs >= 10 ? 'Pass' : 'Strengthen',
      ok: activeBreakdown.verbs >= 10,
    },
    {
      id: 'photo',
      title: 'Photo & Strict ATS Rule',
      subtitle: isPhotoHidden
        ? 'ছবি নেই — US/UK/EU ATS নিরাপদ'
        : 'ছবি চালু আছে (BD মানদণ্ড)',
      pts: activeBreakdown.photo,
      max: 10,
      status: isPhotoHidden ? '100% Safe' : 'Photo -10 pts',
      ok: isPhotoHidden,
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#090E1A] border border-slate-800 rounded-2xl max-w-3xl w-full text-slate-100 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Architectural Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#080D1A] border-b border-slate-800/90 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                ATS Parseability &amp; Compliance Scorecard
              </h3>
              <p className="text-[11px] sm:text-[11.5px] text-slate-400 truncate sm:whitespace-normal">
                আন্তর্জাতিক ও বাংলাদেশি কর্পোরেট রিক্রুটিং সিস্টেমে আপনার সিভি কতটা স্পষ্ট ও রিডেবল
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

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs">
          {/* 1. Hero Scorecard + Mode Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch bg-[#0D1424] border border-slate-800/90 rounded-xl p-4">
            {/* Left: SVG Radial Score Gauge */}
            <div className="md:col-span-5 flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={ringRadius}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={ringRadius}
                    fill="none"
                    stroke={ringStroke}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-2xl font-extrabold tabular-nums leading-none ${
                      clampedScore === 100
                        ? 'text-emerald-400'
                        : clampedScore >= 85
                        ? 'text-blue-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {clampedScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 tabular-nums">
                    / 100 pts
                  </span>
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-400">
                  Current Compliance
                </div>
                <div className="text-sm font-bold text-white leading-snug">
                  {isPhotoHidden
                    ? 'Global Strict ATS Ready'
                    : 'BD Corporate Standard'}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isPhotoHidden
                    ? 'US, UK, EU এবং রিমোট জবের Workday/Greenhouse স্ক্যানারে ১০০% বায়াস-মুক্ত।'
                    : 'দেশের জবের জন্য ছবি থাকা ভালো; বিদেশি ATS-এ ছবি থাকলে ১০% নম্বর কাটা হয়।'}
                </p>
              </div>
            </div>

            {/* Right: 1-Click Mode Cards (Explains 90% vs 100% Instantly) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onRestoreBDCorporate}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                  !isPhotoHidden
                    ? 'bg-blue-600/15 border-blue-500/60 text-white'
                    : 'bg-[#080D1A] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs">BD Corporate</span>
                  <span className="text-[10.5px] font-mono tabular-nums font-bold text-blue-300">
                    90% · Photo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  বাংলাদেশের কর্পোরেট ও MNC আবেদনের জন্য ডানপাশে ছবি সহ আদর্শ লেআউট।
                </p>
                <span className="text-[10.5px] font-semibold text-blue-300">
                  {!isPhotoHidden ? 'Active Mode' : 'Switch to BD Mode →'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onBoost100();
                  confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                }}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                  isPhotoHidden
                    ? 'bg-emerald-600/15 border-emerald-500/60 text-white'
                    : 'bg-[#080D1A] border-slate-800 hover:border-emerald-500/50 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs">Global Strict ATS</span>
                  <span className="text-[10.5px] font-mono tabular-nums font-bold text-emerald-300">
                    100% · No Photo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  আন্তর্জাতিক রিমোট/US/EU পোর্টালে ১-ক্লিকে ছবি লুকিয়ে ১০০% পারফেক্ট স্কোর।
                </p>
                <span className="text-[10.5px] font-semibold text-emerald-300 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {isPhotoHidden ? '100% Mode Active' : 'Boost to 100% Now →'}
                </span>
              </button>
            </div>
          </div>

          {/* 2. 6-Pillar Architectural Diagnostic Matrix */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-200">
                ৬টি ক্যাটাগরিভিত্তিক পূর্ণাঙ্গ অডিট ব্রেকডাউন
              </h4>
              <span className="text-[11px] text-slate-400 tabular-nums">
                Matched Target Keywords: <strong className="text-white">{matchedKeywords.length}/{currentList.length}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {pillars.map((item) => {
                const pct = Math.min(100, Math.round((item.pts / item.max) * 100));
                return (
                  <div
                    key={item.id}
                    className="bg-[#0D1424] border border-slate-800/90 rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-100 text-[11.5px] leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">
                          {item.subtitle}
                        </div>
                      </div>
                      <span
                        className={`text-[10.5px] font-bold font-mono tabular-nums whitespace-nowrap shrink-0 ${
                          item.ok ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {item.pts}/{item.max}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.ok ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className={item.ok ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
                        {item.status}
                      </span>
                      <span className="text-slate-500 tabular-nums">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Target Role Benchmark & Missing Keywords Action Deck */}
          <div className="bg-[#0D1424] border border-slate-800/90 rounded-xl p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-100 text-xs">Target Role Keyword Benchmark</div>
                <div className="text-[10.5px] text-slate-400">
                  কোন রোলের জন্য আবেদন করছেন তা বেছে নিন — অনুপস্থিত কিওয়ার্ড ১ ক্লিকেই যোগ করতে পারবেন
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'hybrid', label: 'Hybrid (All)' },
                  { id: 'data', label: 'Data & BI' },
                  { id: 'sqa', label: 'Software QA' },
                  { id: 'it', label: 'IT & Infra' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTargetRole(r.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                      targetRole === r.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#080D1A] border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1 border-t border-slate-800/80">
              <div>
                <div className="text-[11px] font-semibold text-emerald-300 mb-1.5">
                  Matched in CV ({matchedKeywords.length} / {currentList.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchedKeywords.map((k) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-200 border border-emerald-500/30 text-[10.5px] font-semibold whitespace-nowrap"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {missingKeywords.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-amber-300 mb-1.5">
                    Missing Keywords — ক্লিক করলে সিভির Skills সেকশনে যুক্ত হবে:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingKeywords.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => onAddKeyword(k)}
                        className="px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-[10.5px] font-semibold transition whitespace-nowrap"
                      >
                        + {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#080D1A] border-t border-slate-800/90 flex flex-wrap justify-between items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRestoreBDCorporate}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 whitespace-nowrap transition"
          >
            BD Corporate Mode (90%)
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onBoost100();
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>1-Click Boost to 100% ATS</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 whitespace-nowrap transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, type: 'bullets' | 'paragraph' | 'references') => void;
}

export function AddSectionModal({ isOpen, onClose, onAdd }: AddSectionModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'bullets' | 'paragraph' | 'references'>('bullets');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
        <h3 className="text-base font-bold flex items-center gap-2 text-blue-400 mb-3">
          <PlusCircle className="w-5 h-5" /> নতুন কাস্টম সেকশন যোগ করুন
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 block mb-1">সেকশনের নাম (Section Heading):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ACHIEVEMENTS / REFERENCES / PUBLICATIONS"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1">সেকশনের ধরন (Layout Type):</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="bullets">Bullet List (অ্যাচিভমেন্ট, অ্যাওয়ার্ড বা কো-কারিকুলার)</option>
              <option value="paragraph">Paragraph Text (পেশাদার বিবরণ বা নোট)</option>
              <option value="references">Two-Column References (রেফারেন্স ব্লক)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            বাতিল
          </button>
          <button
            onClick={() => {
              if (!title.trim()) return;
              onAdd(title.toUpperCase(), type);
              setTitle('');
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
          >
            যোগ করুন (Add Section)
          </button>
        </div>
      </div>
    </div>
  );
}

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetModal({ isOpen, onClose, onConfirm }: ResetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-400 mb-3">
          <AlertTriangle className="w-7 h-7 shrink-0" />
          <h3 className="text-lg font-bold">ডিফল্ট সিভিতে রিসেট করবেন?</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          আপনি কি নিশ্চিত যে আপনার করা সব পরিবর্তন মুছে ফেলে মূল সিভির ডিফল্ট অবস্থায় ফিরে যেতে চান?
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            বাতিল
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white"
          >
            হ্যাঁ, রিসেট করুন
          </button>
        </div>
      </div>
    </div>
  );
}

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string) => void;
}

export function GitHubDeployModal({ isOpen, onClose, onCopyText }: GitHubDeployModalProps) {
  if (!isOpen) return null;

  const gitCode = `# ১. গিট ইনিশিয়ালাইজ ও কমিট করুন
git init
git add .
git commit -m "feat: live cv master studio ready for deployment"
git branch -M main

# ২. আপনার GitHub রিপোজিটরি যুক্ত করুন (YOUR_USERNAME এবং YOUR_REPO নাম দিয়ে বদলান)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitHub-এ লাইভ করার সহজ নির্দেশিকা</h3>
              <p className="text-[11px] text-slate-400">কোনো সার্ভার ছাড়াই ১০০% লাইভ চলবে</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Key guarantee */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl text-emerald-200">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" /> এই প্রোজেক্টটি ১০০% GitHub Pages ও Vercel প্রস্তুত!
            </div>
            <p className="text-[11.5px] leading-relaxed">
              • <code className="bg-emerald-900/60 px-1 py-0.5 rounded">vite.config.ts</code>-এ{' '}
              <strong>base: './'</strong> দেওয়া আছে, ফলে গিটহাব পেজেসে কোনো ব্ল্যাঙ্ক স্ক্রিন বা 404 হবে না।<br />
              • <code className="bg-emerald-900/60 px-1 py-0.5 rounded">.github/workflows/deploy.yml</code> আগেই তৈরি করা হয়েছে, তাই পুশ করলেই স্বয়ংক্রিয়ভাবে লাইভ হবে।<br />
              • Firebase Cloud Sync যুক্ত থাকায় লাইভ ওয়েবসাইটে বসে Google দিয়ে স্টুডিওতে এডিট করলেই সব পরিবর্তন সঙ্গে সঙ্গে গ্লোবালি আপডেট হবে (GitHub Pages-এ Google লগইনের জন্য Firebase Authorized Domains-এ <code className="bg-emerald-900/60 px-1 py-0.5 rounded">shoyebrabbi.github.io</code> যোগ রাখুন)।
            </p>
          </div>

          {/* Step 1: Terminal commands */}
          <div>
            <div className="flex items-center justify-between font-bold text-slate-200 mb-1.5">
              <span>ধাপ ১: টার্মিনালে নিচের কমান্ডগুলো চালান:</span>
              <button
                onClick={() => onCopyText(gitCode)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
              >
                <Copy className="w-3.5 h-3.5" /> কোড কপি করুন
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-cyan-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitCode}
            </pre>
          </div>

          {/* Step 2: GitHub Pages Activation */}
          <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
            <div className="font-bold text-amber-300">ধাপ ২: GitHub পেজেস চালু করুন (মাত্র ৩০ সেকেন্ড):</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11.5px] leading-relaxed">
              <li>আপনার GitHub রিপোজিটরিতে যান।</li>
              <li>উপরে <strong>Settings</strong> ট্যাবে ক্লিক করুন।</li>
              <li>বাম পাশের মেনু থেকে <strong>Pages</strong> অপশনটিতে যান।</li>
              <li>
                <strong>Build and deployment</strong> এর নিচে <strong>Source</strong> ড্রপডাউনে{' '}
                <span className="bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  GitHub Actions
                </span>{' '}
                সিলেক্ট করুন।
              </li>
              <li>
                ব্যস! ১ মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে:{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  https://&lt;username&gt;.github.io/&lt;repository&gt;/
                </span>
              </li>
            </ol>
          </div>

          {/* Troubleshooting */}
          <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5 text-[11.5px] text-amber-100/90">
            <div className="font-bold text-amber-300">ডিপ্লয় না হলে দ্রুত ৩টি বিষয় চেক করুন:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
              <li>
                <strong>Public Repo:</strong> ফ্রি GitHub অ্যাকাউন্টে রিপোজিটরি অবশ্যই <strong>Public</strong> হতে হবে (Private repo-তে ফ্রি GitHub Pages কাজ করে না)।
              </li>
              <li>
                <strong>Actions Permission:</strong> Repo-এর <code className="bg-slate-800 px-1 rounded">Settings → Actions → General</code>-এ গিয়ে <strong>Allow all actions</strong> চালু আছে কি না দেখুন।
              </li>
              <li>
                <strong>Error Log দেখা:</strong> Repo-এর <strong>Actions</strong> ট্যাবে গিয়ে লাল ❌ আইকনে ক্লিক করলে ঠিক কোন লাইনে সমস্যা হয়েছে তা দেখা যাবে।
              </li>
            </ul>
          </div>

          {/* Step 3: Vercel alternative */}
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="font-bold text-slate-200 text-[11.5px]">বিকল্প: ১-ক্লিকে Vercel বা Netlify-তে লাইভ</div>
              <p className="text-[10.5px] text-slate-400">গিটহাবে পুশ করার পর Vercel-এ ইমপোর্ট করলে সাথে সাথে লাইভ হবে।</p>
            </div>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold inline-flex items-center justify-center gap-1 text-[11px] whitespace-nowrap shrink-0"
            >
              Vercel Deploy <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
          >
            বুঝেছি (Got It)
          </button>
        </div>
      </div>
    </div>
  );
}
