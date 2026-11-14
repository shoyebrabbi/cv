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
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold flex items-center gap-2 text-blue-400">
            <LinkIcon className="w-5 h-5" /> Hyperlink Manager (লিংক যুক্ত / এডিট করুন)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
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
        <div className="flex justify-between items-center gap-2 mt-6 pt-3 border-t border-slate-700">
          <button
            type="button"
            onClick={onRemove}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
          >
            Remove Link
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={() => onApply(text, url)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
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

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
            <Bot className="w-5 h-5 text-emerald-400" /> Live ATS Diagnostic & Score Booster
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target role selector */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-700 text-xs">
          <span className="font-semibold text-slate-300">Target Role Benchmark:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTargetRole('hybrid')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                targetRole === 'hybrid' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              All-in-One Hybrid
            </button>
            <button
              onClick={() => setTargetRole('data')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                targetRole === 'data' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Data Analyst & BI
            </button>
            <button
              onClick={() => setTargetRole('sqa')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                targetRole === 'sqa' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Software QA (SQA)
            </button>
            <button
              onClick={() => setTargetRole('it')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                targetRole === 'it' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              IT Support & Infra
            </button>
          </div>
        </div>

        {/* Live score box */}
        <div className="mt-4 space-y-3 text-xs text-slate-200">
          <div className="flex flex-wrap items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700 gap-3">
            <div>
              <div className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                Real-Time ATS Parseability & Compliance Score
              </div>
              <div
                className={`text-3xl font-extrabold ${
                  score === 100 ? 'text-emerald-400' : 'text-blue-400'
                } mt-0.5`}
              >
                {score}% {score === 100 ? '🏆 (100% Strict ATS Ready)' : '✨ (BD Corporate Standard)'}
              </div>
            </div>
            <div className="text-right text-[11px] space-y-1">
              <div>
                Photo Mode:{' '}
                <strong className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                  isPhotoHidden ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-blue-900/60 text-cyan-300 border border-blue-500/40'
                }`}>
                  {isPhotoHidden ? 'No Photo (100% ATS)' : photoPosition}
                </strong>
              </div>
              <div>
                Role Keywords Matched:{' '}
                <strong className={missingKeywords.length === 0 ? 'text-emerald-400' : 'text-amber-300'}>
                  {matchedKeywords.length} / {currentList.length}
                </strong>
              </div>
            </div>
          </div>

          {/* Interactive Breakdown Progress Bars */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80 space-y-2.5">
            <div className="font-bold text-slate-300 text-xs flex items-center justify-between">
              <span>📊 ATS স্কোর ক্যাটাগরিভিত্তিক ব্রেকডাউন:</span>
              <span className="text-[11px] text-cyan-400 font-semibold">{score} / 100 Points</span>
            </div>

            <div className="space-y-2 text-[11px]">
              {/* 1. Contacts */}
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-300 font-medium">📞 Contact Information & Clickable Links</span>
                  <span className="text-emerald-400 font-bold">{activeBreakdown.contacts} / 15 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeBreakdown.contacts / 15) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 2. Headings */}
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-300 font-medium">📑 Headings & ATS Section Structure</span>
                  <span className="text-emerald-400 font-bold">{activeBreakdown.headings} / 20 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeBreakdown.headings / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 3. Metrics */}
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-300 font-medium">📊 Quantifiable Numbers & Impact (50k+, 80+, 100+)</span>
                  <span className="text-emerald-400 font-bold">{activeBreakdown.metrics} / 20 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeBreakdown.metrics / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 4. Keywords */}
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-300 font-medium">🔑 Domain Keywords (SQL, Power BI, Postman, Linux)</span>
                  <span className="text-emerald-400 font-bold">{activeBreakdown.keywords} / 25 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeBreakdown.keywords / 25) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 5. Verbs */}
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-300 font-medium">⚡ Strong Action Verbs (Accomplishment Formula)</span>
                  <span className="text-emerald-400 font-bold">{activeBreakdown.verbs} / 10 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeBreakdown.verbs / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 6. Photo Compliance */}
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-300 font-medium">
                    📷 Photo & Graphic Compliance (Strict ATS Standard)
                  </span>
                  <span className={isPhotoHidden ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {activeBreakdown.photo} / 10 pts
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isPhotoHidden ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(activeBreakdown.photo / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isPhotoHidden
                    ? '✅ কোনো ছবি নেই — আন্তর্জাতিক US/UK/EU ATS স্ক্যানারে ১০০% নিরাপদ ও বায়াস-মুক্ত।'
                    : '⚠️ সিভিতে ছবি রয়েছে — বাংলাদেশে ছবি থাকা উত্তম, তবে আন্তর্জাতিক ATS-এ ১০% নম্বর কাটা যায়।'}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div
            className={`p-3.5 rounded-xl border ${
              isPhotoHidden
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            } leading-relaxed`}
          >
            <div className="font-bold text-xs mb-1">
              {isPhotoHidden
                ? '✅ ১০০% Strict ATS স্কোর অর্জিত হয়েছে!'
                : '💡 ছবি থাকা অবস্থায় কেন ৯০% দেখায় এবং কীভাবে ১০০% করবেন?'}
            </div>
            <p className="text-[11px]">
              {isPhotoHidden
                ? 'আপনার সিভিতে কোনো ছবি নেই এবং সব টেক্সট ১০০% মেশিন-রিডেবল ফরম্যাটে আছে। মার্কিন যুক্তরাষ্ট্র, যুক্তরাজ্য বা রিমোট জবের ATS স্ক্যানারের (Workday, Taleo, Greenhouse) জন্য এটি ১০০% প্রস্তুত।'
                : 'আপনার সিভির সমস্ত কন্টাক্ট, কিওয়ার্ড ও মেট্রিক্স ১০০% নিখুঁত। কিন্তু আমেরিকা ও ইউরোপের নিয়োগ নীতিমালায় (EEOC) বৈষম্য এড়াতে ছবি নিষেধ থাকে, তাই আন্তর্জাতিক ATS সিস্টেমে ছবি থাকলে ১০% কম (৯০%) দেখায়। বাংলাদেশে যেকোনো কর্পোরেট জবে আবেদন করলে ছবি ডানপাশে রেখেই আবেদন করুন (যা আদর্শ)। আর আন্তর্জাতিক জবে আবেদনের সময় নিচের "⚡ 1-Click Boost to 100% ATS" বাটনে ক্লিক করলেই স্বয়ংক্রিয়ভাবে ১০০% হয়ে যাবে।'}
            </p>
          </div>

          {/* Matched & Missing Keywords with 1-Click Add */}
          <div className="space-y-3">
            <div>
              <div className="font-bold text-slate-300 mb-1.5">
                ✅ Matched Role Keywords ({matchedKeywords.length} / {currentList.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedKeywords.map((k) => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase text-[10px] font-bold"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>

            {missingKeywords.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80">
                <div className="font-bold text-amber-300 mb-1.5 text-[11px]">
                  ⚡ Missing Target Keywords — Click to Add Instantly to Skills:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingKeywords.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => onAddKeyword(k)}
                      className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 uppercase text-[10px] font-bold transition flex items-center gap-1"
                    >
                      <span>+ {k}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-between items-center gap-2 mt-5 pt-3 border-t border-slate-700">
          <button
            onClick={onRestoreBDCorporate}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40"
          >
            BD Corporate Mode (90% + Right Photo)
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onBoost100();
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
              }}
              className="px-4 py-2 rounded-lg text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm flex items-center gap-1.5 transition"
            >
              <Zap className="w-4 h-4 fill-slate-950" /> 1-Click Boost to 100% ATS
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200"
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
              • কোনো গোপন API Key বা ব্যাকএন্ডের নির্ভরতা নেই—সব ফিচার ব্রাউজারে নিখুঁত চলে।
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
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200 text-[11.5px]">বিকল্প: ১-ক্লিকে Vercel বা Netlify-তে লাইভ</div>
              <p className="text-[10.5px] text-slate-400">গিটহাবে পুশ করার পর Vercel-এ ইমপোর্ট করলে সাথে সাথে লাইভ হবে।</p>
            </div>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold flex items-center gap-1 text-[11px]"
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
