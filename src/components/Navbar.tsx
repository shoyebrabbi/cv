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
  Undo,
  Redo,
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
} from 'lucide-react';
import { CVTemplateKey, PhotoPosition } from '../types/cv';

interface NavbarProps {
  score: number;
  isEditMode: boolean;
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
  wordCount: number;
  readTimeSeconds: number;
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
  wordCount,
  readTimeSeconds,
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
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const insertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (insertRef.current && !insertRef.current.contains(e.target as Node)) {
        setInsertMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isStrictATS = score === 100 || photoPosition === 'hide';

  return (
    <header className="no-print sticky top-0 z-40 bg-[#080D1A] border-b border-slate-800/90 text-slate-100 select-none shrink-0">
      {/* TIER 1: Primary Studio Command Bar */}
      <div className="max-w-[1800px] mx-auto px-2.5 sm:px-4 xl:px-5 py-1.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5 lg:gap-2 xl:gap-4">
        {/* Left Zone: Brand Identity + Unclipped Profile Version + Clear ATS Scorecard Trigger */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 xl:gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center tracking-tight shadow-sm">
              S
            </div>
            <span className="font-bold text-xs xl:text-sm tracking-tight text-white whitespace-nowrap shrink-0">
              <span className="sm:hidden">Shoyeb Studio</span>
              <span className="hidden sm:inline lg:hidden xl:inline">Shoyeb CV Studio</span>
              <span className="hidden lg:inline xl:hidden">CV Studio</span>
            </span>
          </div>

          <div className="hidden md:block h-4 w-px bg-slate-800 shrink-0" />

          {/* Multi-Profile Version Switcher (Accessible on ALL Mobile, Tablet & Desktop viewports) */}
          <div className="flex items-center gap-1 bg-[#0F172A] border border-slate-800 rounded-lg px-1.5 xl:px-2 py-1 min-w-0">
            <select
              value={activeProfileId}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="bg-transparent text-[11px] xl:text-xs font-medium text-slate-100 focus:outline-none min-w-[90px] sm:min-w-[130px] lg:min-w-[110px] xl:min-w-[155px] max-w-[125px] sm:max-w-[180px] xl:max-w-[230px] truncate cursor-pointer pr-0.5 sm:pr-1"
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
              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] font-medium whitespace-nowrap shrink-0 border-l border-slate-800 pl-1.5 xl:pl-2"
              title="প্রোফাইল তৈরি / ডুপ্লিকেট / শেয়ার লিংক"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden 2xl:inline">Profiles</span>
            </button>
          </div>

          {/* Crystal-Clear ATS Scorecard Trigger */}
          <button
            type="button"
            onClick={onOpenATSModal}
            className={`px-2 xl:px-3 py-1 xl:py-1.5 rounded-lg text-[11px] xl:text-xs font-semibold flex items-center gap-1.5 border transition whitespace-nowrap shrink-0 ${
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
            <span className="text-[10.5px] opacity-80 border-l border-current/25 pl-1.5 hidden xl:inline font-medium">
              {isStrictATS ? 'Global Ready' : 'BD · Photo Mode'}
            </span>
          </button>
        </div>

        {/* Right Zone: Horizontal Scrollable on Mobile/Tablet, Crisp Single-Row Fit on Laptop & Desktop */}
        <div className="flex items-center gap-1.5 xl:gap-2 overflow-x-auto no-scrollbar max-w-full lg:overflow-visible shrink-0 pb-0.5 lg:pb-0">
          {/* Edit / Preview Segmented Toggle */}
          <div className="flex items-center bg-[#0F172A] border border-slate-800 rounded-lg p-0.5 text-[11px] xl:text-xs shrink-0">
            <button
              type="button"
              onClick={() => !isEditMode && onToggleEditMode()}
              className={`px-2 xl:px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 xl:gap-1.5 transition whitespace-nowrap shrink-0 ${
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
              className={`px-2 xl:px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 xl:gap-1.5 transition whitespace-nowrap shrink-0 ${
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
            className="px-2 xl:px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700/90 text-[11px] xl:text-xs font-semibold text-slate-100 flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            title="ATS Matcher, XYZ Bullets, LinkedIn, Cover Letter & Job Tracker"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Career Tools</span>
          </button>

          <button
            type="button"
            onClick={onTogglePortfolioMode}
            className="px-2 xl:px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700/90 text-[11px] xl:text-xs font-semibold text-slate-100 flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            title="লাইভ পার্সোনাল ওয়েবসাইট মোডে দেখুন"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{portfolioMode ? 'CV Editor' : 'Live Website'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportHub}
            className="px-2 xl:px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700/90 text-[11px] xl:text-xs font-semibold text-slate-100 flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            title="Print, Word, Excel, Backup ও পাসকোড সেটিংস"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Export Hub</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            className="px-2.5 xl:px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] xl:text-xs font-bold flex items-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0"
            title="১ ক্লিকে A4 PDF ডাউনলোড করুন"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileToolsOpen((prev) => !prev)}
            className={`md:hidden px-2 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition whitespace-nowrap shrink-0 ${
              mobileToolsOpen
                ? 'bg-blue-600/25 border-blue-500/50 text-blue-200'
                : 'bg-[#0F172A] border-slate-700/90 text-slate-200'
            }`}
            title="টেমপ্লেট, ফরম্যাটিং ও ফটো টুলবার দেখুন/লুকান"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Format</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Compact Utility Icons */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5 xl:pl-2 shrink-0">
            <button
              type="button"
              onClick={onOpenGitHubModal}
              className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
              title="GitHub Pages Deploy Guide"
            >
              <Github className="w-4 h-4" />
            </button>

            {onOpenShortcuts && (
              <button
                type="button"
                onClick={onOpenShortcuts}
                className="hidden sm:inline-flex p-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            )}

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

            {onOpenSecuritySettings && (
              <button
                type="button"
                onClick={onOpenSecuritySettings}
                className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition"
                title="পাসওয়ার্ড পরিবর্তন ও সিকিউরিটি সেটিংস"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}

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

      {/* TIER 2: Contextual Design, Template, Photo & Formatting Workbench (Collapsible on mobile < md) */}
      <div className={`${mobileToolsOpen ? 'block' : 'hidden md:block'} bg-[#0D1424] border-t border-slate-800/80`}>
        <div className="max-w-[1800px] mx-auto px-2.5 sm:px-5 py-1.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-1.5 text-xs">
          {/* Row A: Design Panel, Unclipped Template Picker, Insert & Print Preview (Outside overflow-x-auto so dropdown never clips!) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onToggleStudioSidebar}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
              title="বাম দিকের Design Inspector প্যানেল চালু/বন্ধ করুন"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Design</span>
              <span className="hidden sm:inline">Panel</span>
            </button>

            <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded-lg overflow-hidden min-w-0 flex-1 sm:flex-initial">
              <span className="px-2.5 text-[11px] text-slate-400 hidden 2xl:inline-flex items-center gap-1 border-r border-slate-800 py-1 whitespace-nowrap">
                <Layers className="w-3 h-3 text-blue-400" />
                Template
              </span>
              <select
                value={selectedTemplate}
                onChange={(e) => onSelectTemplate(e.target.value as CVTemplateKey)}
                className="bg-transparent text-slate-100 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium focus:outline-none min-w-0 w-full sm:w-auto sm:min-w-[195px] sm:max-w-[260px] cursor-pointer truncate"
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
                className="px-2 sm:px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 border-l border-slate-800 text-blue-300 font-semibold flex items-center gap-1 sm:gap-1.5 transition whitespace-nowrap shrink-0"
                title="ভিজ্যুয়াল গ্যালারি ও Custom Template Manager খুলুন"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gallery</span>
              </button>
            </div>

            {/* + Insert Dropdown Menu (kept outside horizontal scroll containers) */}
            <div className="relative shrink-0" ref={insertRef}>
              <button
                type="button"
                onClick={() => setInsertMenuOpen(!insertMenuOpen)}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold flex items-center gap-1 transition whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {insertMenuOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
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

            {onOpenPrintPreview && (
              <button
                type="button"
                onClick={onOpenPrintPreview}
                className="px-2.5 py-1 rounded-lg bg-[#080D1A] hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
                title="Full-Screen A4 Print Preview দেখুন"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">Print Preview</span>
              </button>
            )}
          </div>

          {/* Row B: Horizontal Scrollable Formatting, Photo & Auto-Fit Workbench */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full xl:overflow-visible pb-0.5 xl:pb-0">
            {/* Crystal-Clear Photo Position Switcher */}
            <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded-lg p-0.5 text-[11px] shrink-0">
              <span className="px-2 text-slate-500 font-medium whitespace-nowrap">Photo:</span>
              {(
                [
                  { id: 'right', label: 'Right', tip: 'Photo Right (BD Corporate Standard)' },
                  { id: 'left', label: 'Left', tip: 'Photo Left' },
                  { id: 'center', label: 'Center', tip: 'Photo Centered' },
                  { id: 'hide', label: 'No Photo', tip: 'Hide Photo (100% Global Strict ATS)' },
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

            {/* Global Undo/Redo */}
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

            {/* Inline Formatting Strip */}
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

              <div className="hidden xl:flex items-center border-l border-slate-800 pl-1 gap-0.5">
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
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onFormatDoc('undo');
                }}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
                title="Text Undo"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onFormatDoc('redo');
                }}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
                title="Text Redo"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto-Fit 1P / 2P */}
            <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded-lg p-0.5 text-[11px] shrink-0">
              <button
                type="button"
                onClick={onAutoFit1Page}
                className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition whitespace-nowrap"
                title="১ পৃষ্ঠায় ফিট করুন"
              >
                1-Page Fit
              </button>
              <button
                type="button"
                onClick={onAutoFit2Pages}
                className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition whitespace-nowrap"
                title="২ পৃষ্ঠায় ফিট করুন"
              >
                2-Page Fit
              </button>
            </div>

            {/* Quiet Word & Scan Counter */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-400 tabular-nums whitespace-nowrap shrink-0">
              <span>{wordCount} words</span>
              <span>·</span>
              <span>{readTimeSeconds}s scan</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
