import React from 'react';
import {
  Bot,
  Compass,
  FileText,
  Keyboard,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  PanelRightClose,
} from 'lucide-react';
import { CVData, CVSectionId, StudioSettings } from '../types/cv';

interface ATSBreakdown {
  total: number;
  contacts: number;
  headings: number;
  metrics: number;
  keywords: number;
  verbs: number;
  photo: number;
  isPhotoHidden: boolean;
}

interface StudioRightRailProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  settings: StudioSettings;
  atsScoreData: ATSBreakdown;
  wordCount: number;
  readTimeSeconds: number;
  estimatedPages: number;
  docHeightPx: number;
  overflowPx: number;
  onOpenATSModal: () => void;
  onAutoFit1Page: () => void;
  onAutoFit2Pages: () => void;
  onJumpToSection: (sectionId: string) => void;
  onOpenShortcuts: () => void;
}

const SECTION_LABELS: Record<CVSectionId, string> = {
  summary: 'Professional Summary',
  skills: 'Core Technical Skills',
  experience: 'Work Experience',
  projects: 'Technical Projects',
  credentials: 'Education & Certs',
};

export function StudioRightRail({
  isOpen,
  onClose,
  cvData,
  settings,
  atsScoreData,
  wordCount,
  readTimeSeconds,
  estimatedPages,
  docHeightPx,
  overflowPx,
  onOpenATSModal,
  onAutoFit1Page,
  onAutoFit2Pages,
  onJumpToSection,
  onOpenShortcuts,
}: StudioRightRailProps) {
  if (!isOpen) return null;

  const score = atsScoreData.total;
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const ringStroke = score === 100 ? '#10b981' : score >= 85 ? '#3b82f6' : '#f59e0b';

  const order: CVSectionId[] =
    settings.sectionOrder && settings.sectionOrder.length === 5
      ? settings.sectionOrder
      : ['summary', 'skills', 'experience', 'projects', 'credentials'];
  const hiddenSet = new Set(settings.hiddenSections || []);

  const criteria = [
    { label: 'Contacts & Links', pts: atsScoreData.contacts, max: 15 },
    { label: 'Core Headings', pts: atsScoreData.headings, max: 20 },
    { label: 'Impact Metrics', pts: atsScoreData.metrics, max: 20 },
    { label: 'Role Keywords', pts: atsScoreData.keywords, max: 25 },
    { label: 'Action Verbs', pts: atsScoreData.verbs, max: 10 },
    { label: 'ATS Compliance', pts: atsScoreData.photo, max: 10 },
  ];

  return (
    <aside
      aria-label="Desktop Studio Inspector Rail"
      className="no-print hidden lg:flex flex-col w-[272px] xl:w-[288px] shrink-0 bg-[#080D1A] border-l border-slate-800/90 text-slate-200 overflow-y-auto"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/90 flex items-center justify-between bg-[#0B1120] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-white tracking-tight truncate">
            Live Studio Monitor
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title="Hide Right Rail"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 space-y-4 text-xs flex-1">
        {/* 1. Live Radial ATS Pulse */}
        <section className="rounded-xl bg-[#0D1424] border border-slate-800/90 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
                  <circle
                    cx="30"
                    cy="30"
                    r={r}
                    fill="none"
                    stroke={ringStroke}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-white studio-mono tabular-nums">
                  {score}%
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">ATS Readiness</span>
                </div>
                <div className="text-[10.5px] text-slate-400 mt-0.5">
                  {atsScoreData.isPhotoHidden ? 'Global Strict Ready' : 'BD · Photo Mode'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            {criteria.map((c) => {
              const pct = Math.round((c.pts / c.max) * 100);
              return (
                <div key={c.label} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-400">{c.label}</span>
                    <span className="studio-mono text-slate-200 font-semibold tabular-nums">
                      {c.pts}/{c.max}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100
                          ? 'bg-emerald-500'
                          : pct >= 70
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenATSModal}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-blue-300 transition"
          >
            Open Detailed ATS Report
          </button>
        </section>

        {/* 2. Page Density & Margin Telemetry */}
        <section className="rounded-xl bg-[#0D1424] border border-slate-800/90 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Page &amp; Density
            </span>
            <span className="text-[10.5px] studio-mono text-slate-400">
              {Math.round(docHeightPx * 0.264583)}mm
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-lg bg-[#080D1A] border border-slate-800 p-2">
              <div className="text-sm font-bold text-white studio-mono tabular-nums">
                {estimatedPages}
              </div>
              <div className="text-[10px] text-slate-400">Pages</div>
            </div>
            <div className="rounded-lg bg-[#080D1A] border border-slate-800 p-2">
              <div className="text-sm font-bold text-white studio-mono tabular-nums">
                {wordCount}
              </div>
              <div className="text-[10px] text-slate-400">Words</div>
            </div>
            <div className="rounded-lg bg-[#080D1A] border border-slate-800 p-2">
              <div className="text-sm font-bold text-white studio-mono tabular-nums">
                {readTimeSeconds}s
              </div>
              <div className="text-[10px] text-slate-400">Scan</div>
            </div>
          </div>

          {overflowPx > 0 ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-950/40 border border-amber-500/35 px-2.5 py-1.5 text-[10.5px] text-amber-200">
              <span className="flex items-center gap-1 min-w-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">+{Math.round(overflowPx)}px spill</span>
              </span>
              <button
                type="button"
                onClick={estimatedPages <= 2 ? onAutoFit1Page : onAutoFit2Pages}
                className="font-bold text-amber-300 hover:underline shrink-0"
              >
                Auto-Fit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-950/35 border border-emerald-500/30 px-2.5 py-1.5 text-[10.5px] text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>A4 Print Bounds Clean ({settings.pagePadding}mm pad)</span>
            </div>
          )}
        </section>

        {/* 3. Section Outline Navigator */}
        <section className="rounded-xl bg-[#0D1424] border border-slate-800/90 p-3.5 space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Document Navigator
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onJumpToSection('cvHeader')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-between"
            >
              <span>Header &amp; Contacts</span>
              <span className="text-[10px] studio-mono text-slate-500">Top</span>
            </button>
            {order
              .filter((id) => !hiddenSet.has(id))
              .map((secId, idx) => (
                <button
                  key={secId}
                  type="button"
                  onClick={() => onJumpToSection(secId)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-between gap-2"
                >
                  <span className="truncate">{SECTION_LABELS[secId]}</span>
                  <span className="text-[10px] studio-mono text-slate-500 shrink-0">
                    0{idx + 1}
                  </span>
                </button>
              ))}
            {cvData.customSections.length > 0 && (
              <div className="pt-1 border-t border-slate-800/70 text-[10.5px] text-slate-400 px-2.5">
                +{cvData.customSections.length} Custom Section(s)
              </div>
            )}
          </div>
        </section>

        {/* 4. Power Shortcuts Quick Reference */}
        <section className="rounded-xl bg-[#0D1424] border border-slate-800/90 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              Shortcuts
            </span>
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="text-[10.5px] text-blue-400 hover:underline font-semibold"
            >
              View All
            </button>
          </div>
          <div className="space-y-1 text-[10.5px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Undo / Redo CV</span>
              <span className="studio-mono text-slate-200">Ctrl+Z / Y</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Print Preview</span>
              <span className="studio-mono text-slate-200">Ctrl+P</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Toggle Design Panel</span>
              <span className="studio-mono text-slate-200">Ctrl+\</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Edit / Preview Mode</span>
              <span className="studio-mono text-slate-200">Ctrl+E</span>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const items = [
    { key: 'Ctrl / ⌘ + Z', desc: 'সর্বশেষ CV এডিট পূর্বের অবস্থায় ফিরিয়ে আনুন (Undo)' },
    { key: 'Ctrl / ⌘ + Y', desc: 'পূর্বাবস্থায় ফেরানো এডিট আবার সামনে আনুন (Redo)' },
    { key: 'Ctrl / ⌘ + P', desc: 'A4 Print Preview ওপেন করুন' },
    { key: 'Ctrl / ⌘ + E', desc: 'Edit Mode ও Preview Mode সুইচ করুন' },
    { key: 'Ctrl / ⌘ + \\', desc: 'বাম পাশের Design Inspector চালু বা বন্ধ করুন' },
    { key: 'Esc', desc: 'Zen Focus Mode বা ওপেন মোডাল বন্ধ করুন' },
    { key: '?', desc: 'যেকোনো সময় এই শর্টকাট গাইড দেখুন' },
  ];

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Studio Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 divide-y divide-slate-800/80 text-xs">
          {items.map((item) => (
            <div key={item.key} className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-300 leading-snug">{item.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10.5px] studio-mono text-blue-300 font-semibold whitespace-nowrap shrink-0">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
