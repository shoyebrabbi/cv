import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Layers,
  FileDown,
  Sliders,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Link as LinkIcon,
  Eraser,
  Edit3,
  Eye,
  Plus,
  Github,
  Sparkles,
  Lock,
  FolderKanban,
  RotateCcw,
  RotateCw,
  LayoutGrid,
  Globe,
  ChevronDown,
  Briefcase,
  Printer,
  Maximize2,
  Keyboard,
  KeyRound,
  Menu,
  X,
  Palette,
  MoreVertical,
} from 'lucide-react';
import { CVTemplateKey, PhotoPosition } from '../types/cv';

interface NavbarProps {
  score: number;
  isEditMode: boolean;
  isStudioOpen?: boolean;
  onToggleEditMode: () => void;
  photoPosition: PhotoPosition;
  onSetPhotoPosition: (pos: PhotoPosition) => void;
  selectedTemplate: CVTemplateKey;
  onSelectTemplate: (tpl: CVTemplateKey) => void;
  onOpenATSModal: () => void;
  onOpenGitHubModal: () => void;
  onToggleUnifiedTools: () => void;
  onToggleStudioSidebar: () => void;
  onOpenLinkModal: () => void;
  onOpenAddSectionModal: () => void;
  onAddContact: () => void;
  onAddSkill: () => void;
  onAddJob: () => void;
  onAddProject: () => void;
  onExportPDF: () => void;
  onOpenExportHub: () => void;
  onLockStudio: () => void;
  onFormatDoc: (cmd: string, val?: string) => void;
  onInsertSymbol: (sym: string) => void;
  portfolioMode: boolean;
  onTogglePortfolioMode: () => void;
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  profiles: Array<{ id: string; name: string }>;
  onAutoFit1Page: () => void;
  onAutoFit2Pages: () => void;
  onOpenProfileManager: () => void;
  canUndoCV: boolean;
  canRedoCV: boolean;
  onUndoCV: () => void;
  onRedoCV: () => void;
  onOpenTemplateGallery: () => void;
  onOpenPrintPreview?: () => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
  onOpenShortcuts?: () => void;
  onOpenSecuritySettings?: () => void;
}

export function Navbar({
  score,
  isEditMode,
  isStudioOpen = false,
  onToggleEditMode,
  photoPosition,
  onSetPhotoPosition,
  selectedTemplate,
  onSelectTemplate,
  onOpenATSModal,
  onOpenGitHubModal,
  onToggleUnifiedTools,
  onToggleStudioSidebar,
  onOpenLinkModal,
  onOpenAddSectionModal,
  onAddContact,
  onAddSkill,
  onAddJob,
  onAddProject,
  onExportPDF,
  onOpenExportHub,
  onLockStudio,
  onFormatDoc,
  onInsertSymbol,
  portfolioMode,
  onTogglePortfolioMode,
  activeProfileId,
  onSelectProfile,
  profiles,
  onAutoFit1Page,
  onAutoFit2Pages,
  onOpenProfileManager,
  canUndoCV,
  canRedoCV,
  onUndoCV,
  onRedoCV,
  onOpenTemplateGallery,
  onOpenPrintPreview,
  zenMode,
  onToggleZenMode,
  onOpenShortcuts,
  onOpenSecuritySettings,
}: NavbarProps) {
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mobileStudioMenuOpen, setMobileStudioMenuOpen] = useState(false);
  const insertRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (insertRef.current && !insertRef.current.contains(e.target as Node)) {
        setInsertMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isStrictATS = score === 100 || photoPosition === 'hide';
  const activeProfileName = profiles.find((p) => p.id === activeProfileId)?.name || 'Master CV';

  return (
    <header className="no-print sticky top-0 z-40 bg-[#080D1A] border-b border-slate-800/90 text-slate-100 select-none shrink-0">
      {/* MOBILE NATIVE APP HEADER (< 1024px) — 48px compact bar (Edit/A4 view tabs live uniquely in Bottom Nav) */}
      <div className="lg:hidden px-3 h-12 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMobileStudioMenuOpen(true)}
          className="min-h-[38px] px-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-700/90 text-slate-100 text-xs font-bold flex items-center gap-1.5 shrink-0"
          aria-label="Open Studio Menu"
        >
          <Menu className="w-4 h-4 text-blue-400" />
          <span>Menu</span>
        </button>

        <div className="min-w-0 flex-1 text-center px-1">
          <div className="text-xs font-extrabold text-white truncate leading-tight">
            {activeProfileName}
          </div>
          <div className="text-[10.5px] text-slate-400 truncate leading-tight">
            ATS {score}% · {isStrictATS ? 'Global' : 'BD Photo'}
          </div>
        </div>

        <button
          type="button"
          onClick={onExportPDF}
          className="min-h-[38px] px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>PDF</span>
        </button>
      </div>

      {/* MOBILE STUDIO FULL-EXPLANATION APP MENU SHEET */}
      {mobileStudioMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col"
          onClick={() => setMobileStudioMenuOpen(false)}
        >
          <div
            className="flex-1 overflow-y-auto bg-[#080D1A] p-4 space-y-4 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-white">CV Studio Menu</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  সিভি এডিট, ডিজাইন, ব্যাকআপ এবং লাইভ ওয়েবসাইটের সব অপশন
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileStudioMenuOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Role Profile Switcher */}
            <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Active Role Profile</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileStudioMenuOpen(false);
                    onOpenProfileManager();
                  }}
                  className="text-xs font-bold text-blue-400 hover:underline"
                >
                  Manage Profiles →
                </button>
              </div>
              <select
                value={activeProfileId}
                onChange={(e) => onSelectProfile(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-[#080D1A] border border-slate-700 px-3 text-sm font-semibold text-white"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Self-Explanatory Tool Tiles */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                সব টুলস ও অপশন
              </div>

              {(
                [
                  {
                    title: portfolioMode ? 'CV Editor-এ ফিরে যান' : 'Live Website দেখুন',
                    desc: 'পাবলিক পোর্টফোলিও ওয়েবসাইট ও ডিজাইন প্রিভিউ',
                    icon: Globe,
                    tint: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
                    action: onTogglePortfolioMode,
                  },
                  {
                    title: 'Design Inspector (কালার, ফন্ট ও ওয়েব লেআউট)',
                    desc: 'সিভির কালার, মার্জিন, ছবি ও লাইভ সাইট ডিজাইন বদলান',
                    icon: Palette,
                    tint: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
                    action: onToggleStudioSidebar,
                  },
                  {
                    title: 'Template Gallery (12+ টেমপ্লেট)',
                    desc: 'কর্পোরেট, ATS ও আপনার সেভ করা কাস্টম টেমপ্লেট দেখুন',
                    icon: LayoutGrid,
                    tint: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
                    action: onOpenTemplateGallery,
                  },
                  {
                    title: `ATS Readiness Report (স্কোর ${score}%)`,
                    desc: 'সিভির ৬টি ATS পয়েন্ট চেক করুন ও ১০০% বুস্ট করুন',
                    icon: Bot,
                    tint: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
                    action: onOpenATSModal,
                  },
                  {
                    title: 'Career Toolkit (JD Matcher & Job Tracker)',
                    desc: 'চাকরির বর্ণনা ম্যাচ, কভার লেটার ও জব অ্যাপ্লিকেশন ট্র্যাকার',
                    icon: Briefcase,
                    tint: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
                    action: onToggleUnifiedTools,
                  },
                  ...(onOpenPrintPreview
                    ? [
                        {
                          title: 'A4 Print Preview ও ডাউনলোড',
                          desc: 'প্রিন্ট বা PDF করার আগে পুরো A4 পাতা পরিষ্কারভাবে দেখুন',
                          icon: Printer,
                          tint: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
                          action: onOpenPrintPreview,
                        },
                      ]
                    : []),
                  {
                    title: 'Export Hub ও ফুল A-to-Z ব্যাকআপ',
                    desc: 'Word, Excel, PNG এবং সম্পূর্ণ প্রজেক্ট (.json) ব্যাকআপ/রিস্টোর',
                    icon: Sparkles,
                    tint: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
                    action: onOpenExportHub,
                  },
                  ...(onOpenSecuritySettings
                    ? [
                        {
                          title: 'Password ও Account Security',
                          desc: 'আপনার লগইন পাসওয়ার্ড পরিবর্তন ও ক্লাউড সিঙ্ক দেখুন',
                          icon: KeyRound,
                          tint: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
                          action: onOpenSecuritySettings,
                        },
                      ]
                    : []),
                  {
                    title: 'GitHub Pages Deploy গাইড',
                    desc: 'নিজের GitHub ওয়েবসাইটে কীভাবে পাবলিশ করবেন দেখুন',
                    icon: Github,
                    tint: 'text-slate-300 bg-slate-800 border-slate-700',
                    action: onOpenGitHubModal,
                  },
                ] as Array<{
                  title: string;
                  desc: string;
                  icon: typeof Globe;
                  tint: string;
                  action: () => void;
                }>
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setMobileStudioMenuOpen(false);
                      item.action();
                    }}
                    className="w-full min-h-[60px] p-3.5 rounded-2xl bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 flex items-center gap-3.5 text-left transition"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.tint}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white leading-snug">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </button>
                );
              })}

              {/* Auto Fit Quick Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileStudioMenuOpen(false);
                    onAutoFit1Page();
                  }}
                  className="min-h-[44px] rounded-xl bg-[#0F172A] border border-slate-800 text-xs font-bold text-slate-200"
                >
                  Auto-Fit 1 Page
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileStudioMenuOpen(false);
                    onAutoFit2Pages();
                  }}
                  className="min-h-[44px] rounded-xl bg-[#0F172A] border border-slate-800 text-xs font-bold text-slate-200"
                >
                  Auto-Fit 2 Pages
                </button>
              </div>

              {/* Lock / Sign Out */}
              <button
                type="button"
                onClick={() => {
                  setMobileStudioMenuOpen(false);
                  onLockStudio();
                }}
                className="w-full min-h-[48px] mt-2 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/35 text-rose-200 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Studio লক করে পাবলিক মোডে যান</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIER 1: Primary Desktop Studio Command Bar (3 clean zones, zero overflow on 1024px–1440px+) */}
      <div className="hidden lg:flex max-w-[1800px] mx-auto px-4 xl:px-5 h-12 items-center justify-between gap-3">
        {/* Left Zone: Brand + Profile Version Switcher + ATS Trigger */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center tracking-tight shadow-sm">
              S
            </div>
            <span className="font-bold text-xs xl:text-sm tracking-tight text-white whitespace-nowrap shrink-0">
              <span className="xl:hidden">Studio</span>
              <span className="hidden xl:inline">Shoyeb CV Studio</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          {/* Active Profile Switcher */}
          <div className="flex items-center gap-1 bg-[#0F172A] border border-slate-800 rounded-lg px-2 py-1 min-w-0">
            <select
              value={activeProfileId}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-100 focus:outline-none min-w-[100px] xl:min-w-[140px] max-w-[135px] xl:max-w-[200px] 2xl:max-w-[240px] truncate cursor-pointer pr-1"
              title="Switch Active Role CV Profile"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onOpenProfileManager}
              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] font-medium whitespace-nowrap shrink-0 border-l border-slate-800 pl-2"
              title="প্রোফাইল তৈরি / ডুপ্লিকেট / শেয়ার লিংক"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden 2xl:inline">Profiles</span>
            </button>
          </div>

          {/* ATS Scorecard Trigger */}
          <button
            type="button"
            onClick={onOpenATSModal}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition whitespace-nowrap shrink-0 ${
              score === 100
                ? 'bg-emerald-950/70 border-emerald-500/45 text-emerald-200 hover:bg-emerald-900/60'
                : score >= 85
                ? 'bg-blue-950/50 border-blue-500/40 text-blue-100 hover:border-blue-400'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-200 hover:border-amber-400'
            }`}
            title="ATS অডিট রিপোর্ট, ৬টি স্কোর ব্রেকডাউন ও ১০০% বুস্ট দেখুন"
          >
            <Bot
              className={`w-3.5 h-3.5 shrink-0 ${
                score === 100
                  ? 'text-emerald-400'
                  : score >= 85
                  ? 'text-blue-400'
                  : 'text-amber-400'
              }`}
            />
            <span className="tabular-nums font-bold">ATS {score}%</span>
            <span className="text-[10.5px] opacity-80 border-l border-current/25 pl-1.5 hidden 2xl:inline font-medium">
              {isStrictATS ? 'Global Ready' : 'BD · Photo'}
            </span>
          </button>
        </div>

        {/* Right Zone: Mode Segmented Toggle + Primary Actions + Clean Utility Dropdown */}
        <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
          {/* Edit / Preview Segmented Toggle */}
          <div className="flex items-center bg-[#0F172A] border border-slate-800 rounded-lg p-0.5 text-xs shrink-0">
            <button
              type="button"
              onClick={() => !isEditMode && onToggleEditMode()}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                isEditMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-100'
              }`}
              title="ক্যানভাসে সরাসরি লেখা এডিট করুন (Ctrl+E)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => isEditMode && onToggleEditMode()}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                !isEditMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-100'
              }`}
              title="পরিষ্কার প্রিভিউ মোড (Ctrl+E)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleUnifiedTools}
            className="px-2.5 xl:px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700/90 text-xs font-semibold text-slate-100 flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            title="ATS Matcher, XYZ Bullets, LinkedIn, Cover Letter & Job Tracker"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Career Tools</span>
          </button>

          <button
            type="button"
            onClick={onTogglePortfolioMode}
            className="px-2.5 xl:px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700/90 text-xs font-semibold text-slate-100 flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            title="লাইভ পার্সোনাল ওয়েবসাইট মোডে দেখুন"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{portfolioMode ? 'CV Editor' : 'Website'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportHub}
            className="px-2.5 xl:px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700/90 text-xs font-semibold text-slate-100 flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            title="Print, Word, Excel, Backup ও সিকিউরিটি সেটিংস"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Export Hub</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            className="px-3 xl:px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0"
            title="১ ক্লিকে A4 PDF ডাউনলোড করুন"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span>PDF</span>
          </button>

          {/* Compact Utility Cluster */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2 shrink-0">
            {onToggleZenMode && (
              <button
                type="button"
                onClick={onToggleZenMode}
                className={`p-1.5 rounded-lg border transition ${
                  zenMode
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#0F172A] hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Zen Focus Mode (সব সাইডবার লুকিয়ে নিরিবিলি এডিট করুন)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((v) => !v)}
                className={`p-1.5 rounded-lg border transition ${
                  moreMenuOpen
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-[#0F172A] hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="More Studio Tools (GitHub, Security, Shortcuts)"
                aria-label="More Studio Tools"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                  {onOpenSecuritySettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onOpenSecuritySettings();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Password &amp; Security</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onOpenGitHubModal();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span>GitHub Pages Deploy</span>
                  </button>
                  {onOpenShortcuts && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onOpenShortcuts();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2.5">
                        <Keyboard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Keyboard Shortcuts</span>
                      </span>
                      <kbd className="text-[10px] studio-mono text-slate-400">?</kbd>
                    </button>
                  )}
                  {onOpenPrintPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onOpenPrintPreview();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Full Print Preview</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onLockStudio}
              className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition"
              title="স্টুডিও লক করে পাবলিক ওয়েবসাইটে ফিরে যান"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TIER 2: Contextual Design, Template, Insert & Formatting Workbench (Desktop lg+) */}
      <div className="hidden lg:block bg-[#0D1424] border-t border-slate-800/80">
        <div className="max-w-[1800px] mx-auto px-4 xl:px-5 py-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs">
          {/* Left Group: Design Inspector Toggle, Template Picker, + Insert & Single Unambiguous CV Undo/Redo */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onToggleStudioSidebar}
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                isStudioOpen
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
              }`}
              title="বাম দিকের Design Inspector প্যানেল চালু/বন্ধ করুন (Ctrl+\)"
            >
              <Sliders className={`w-3.5 h-3.5 ${isStudioOpen ? 'text-white' : 'text-blue-400'}`} />
              <span>Design</span>
            </button>

            <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded-lg overflow-hidden min-w-0">
              <span className="px-2 text-[11px] text-slate-400 hidden 2xl:inline-flex items-center gap-1 border-r border-slate-800 py-1 whitespace-nowrap">
                <Layers className="w-3 h-3 text-blue-400" />
                Template
              </span>
              <select
                value={selectedTemplate}
                onChange={(e) => onSelectTemplate(e.target.value as CVTemplateKey)}
                className="bg-transparent text-slate-100 px-2.5 py-1 text-xs font-medium focus:outline-none min-w-[175px] max-w-[235px] cursor-pointer truncate"
              >
                <option value="bd-corporate" className="bg-slate-900">1. BD Corporate Executive</option>
                <option value="strict-ats" className="bg-slate-900">2. Strict ATS Harvard</option>
                <option value="original-master" className="bg-slate-900">3. Original PDF Replica</option>
                <option value="modern-split" className="bg-slate-900">4. Silicon Valley Split</option>
                <option value="two-col-sidebar" className="bg-slate-900">5. Two-Col Teal Sidebar</option>
                <option value="data-boxed" className="bg-slate-900">6. Data &amp; SQA Boxed</option>
                <option value="compact-onepage" className="bg-slate-900">7. Compact 1-Page Fit</option>
                <option value="dark-header" className="bg-slate-900">8. Dark Header Executive</option>
                <option value="exec-ats" className="bg-slate-900">9. Executive Timeline Pro</option>
                <option value="exec-sidebar" className="bg-slate-900">10. Dark Sidebar Pro</option>
                <option value="swiss-grid" className="bg-slate-900">11. Minimalist Swiss Grid</option>
                <option value="tech-mono" className="bg-slate-900">12. Tech Mono Developer</option>
              </select>
              <button
                type="button"
                onClick={onOpenTemplateGallery}
                className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 border-l border-slate-800 text-blue-300 font-semibold flex items-center gap-1 transition whitespace-nowrap shrink-0"
                title="ভিজ্যুয়াল গ্যালারি ও Custom Template Manager খুলুন"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>
            </div>

            {/* + Insert Dropdown Menu */}
            <div className="relative shrink-0" ref={insertRef}>
              <button
                type="button"
                onClick={() => setInsertMenuOpen(!insertMenuOpen)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold flex items-center gap-1 transition whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {insertMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onAddContact();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Contact Link</span>
                    <span className="text-[10.5px] text-slate-500">Header</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddSkill();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Skill Row</span>
                    <span className="text-[10.5px] text-slate-500">Skills</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddJob();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Work Experience</span>
                    <span className="text-[10.5px] text-slate-500">Job</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddProject();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Project Case Study</span>
                    <span className="text-[10.5px] text-slate-500">Project</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAddSectionModal();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-blue-300 font-semibold"
                  >
                    + Custom Section...
                  </button>
                </div>
              )}
            </div>

            {/* Single Unambiguous CV Undo/Redo */}
            <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={onUndoCV}
                disabled={!canUndoCV}
                className="px-2 py-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
                title="Undo CV (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRedoCV}
                disabled={!canRedoCV}
                className="px-2 py-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
                title="Redo CV (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Group: Contextual Inline Rich-Text Bar (only in Edit Mode) + Photo Quick Control */}
          <div className="flex items-center gap-2 flex-wrap">
            {isEditMode ? (
              <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded-lg p-0.5 gap-0.5 shrink-0">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onFormatDoc('bold');
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-200"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onFormatDoc('italic');
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-200"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onFormatDoc('underline');
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-200"
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

                <label className="px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer flex items-center gap-1" title="Text Color">
                  <span className="font-bold text-blue-400 text-[11px]">A</span>
                  <input
                    type="color"
                    defaultValue="#0f4c81"
                    onChange={(e) => onFormatDoc('foreColor', e.target.value)}
                    className="w-3 h-3 bg-transparent border-0 cursor-pointer"
                  />
                </label>
                <label className="px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer flex items-center gap-1" title="Highlight Color">
                  <span className="bg-amber-300 text-slate-950 font-bold px-1 rounded text-[9.5px]">H</span>
                  <input
                    type="color"
                    defaultValue="#fef08a"
                    onChange={(e) => onFormatDoc('hiliteColor', e.target.value)}
                    className="w-3 h-3 bg-transparent border-0 cursor-pointer"
                  />
                </label>

                <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onFormatDoc('justifyLeft');
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onFormatDoc('justifyCenter');
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onFormatDoc('justifyFull');
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
                  title="Justify"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onOpenLinkModal();
                  }}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-blue-300 font-semibold flex items-center gap-1 whitespace-nowrap"
                  title="Insert / Edit Hyperlink"
                >
                  <LinkIcon className="w-3 h-3" /> Link
                </button>

                <div className="hidden 2xl:flex items-center border-l border-slate-800 pl-1 gap-0.5">
                  {[' | ', ' • ', ' — ', ' → ', ' ✓ '].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onInsertSymbol(sym);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 font-mono text-[11px]"
                      title={`Insert ${sym.trim()}`}
                    >
                      {sym.trim()}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onFormatDoc('removeFormat');
                  }}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-300 border-l border-slate-800 ml-0.5"
                  title="Clear Formatting"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 px-2 py-1">
                Preview Mode — প্রিন্ট-রেডি ভিউ (Edit চাপলে সরাসরি টেক্সট ফরম্যাটিং টুল খুলবে)
              </span>
            )}

            {/* Quick Photo Mode Segmented Control */}
            <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded-lg p-0.5 text-[11px] shrink-0">
              <span className="px-2 text-slate-500 font-medium whitespace-nowrap">Photo:</span>
              {(
                [
                  { id: 'right', label: 'Right', tip: 'Photo Right (BD Corporate Standard)' },
                  { id: 'left', label: 'Left', tip: 'Photo Left' },
                  { id: 'center', label: 'Center', tip: 'Photo Centered' },
                  { id: 'hide', label: 'Off', tip: 'Hide Photo (100% Global Strict ATS)' },
                ] as Array<{ id: PhotoPosition; label: string; tip: string }>
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onSetPhotoPosition(pos.id)}
                  className={`px-2 py-0.5 rounded-md font-medium transition whitespace-nowrap shrink-0 ${
                    photoPosition === pos.id
                      ? 'bg-slate-700 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                  title={pos.tip}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
