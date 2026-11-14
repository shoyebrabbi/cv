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
}: NavbarProps) {
  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
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

  return (
    <header className="no-print sticky top-0 z-40 bg-[#0B1120] border-b border-slate-800 text-slate-100 select-none">
      {/* TIER 1: Primary Workspace Header */}
      <div className="max-w-[1760px] mx-auto px-3 sm:px-5 h-12 flex items-center justify-between gap-3">
        {/* Left: Brand Identity + Profile Version + ATS Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center tracking-tight shadow-sm">
              S
            </div>
            <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
              Shoyeb CV Studio
            </span>
          </div>

          <div className="hidden md:block h-4 w-px bg-slate-800 shrink-0" />

          {/* Multi-Profile Version Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-1.5 py-0.5">
            <select
              value={activeProfileId}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none max-w-[165px] py-0.5 cursor-pointer"
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
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="প্রোফাইল তৈরি / ডুপ্লিকেট / শেয়ার লিংক"
            >
              <FolderKanban className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean ATS Health Indicator */}
          <button
            type="button"
            onClick={onOpenATSModal}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
              score === 100
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-blue-500/60'
            }`}
            title="ATS অডিট রিপোর্ট ও ১০০% বুস্ট দেখুন"
          >
            <Bot className={`w-3.5 h-3.5 ${score === 100 ? 'text-emerald-400' : 'text-blue-400'}`} />
            <span>ATS {score}%</span>
          </button>
        </div>

        {/* Right: Workspace Modes + Career Tools + Exporters */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Edit / Preview Segmented Toggle */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => !isEditMode && onToggleEditMode()}
              className={`px-2 py-1 rounded font-semibold flex items-center gap-1 transition ${
                isEditMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ক্যানভাসে সরাসরি লেখা এডিট করুন"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
            <button
              type="button"
              onClick={() => isEditMode && onToggleEditMode()}
              className={`px-2 py-1 rounded font-semibold flex items-center gap-1 transition ${
                !isEditMode ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="পরিষ্কার প্রিভিউ মোড"
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleUnifiedTools}
            className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/90 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            title="ATS Matcher, XYZ Bullets, LinkedIn, Cover Letter & Job Tracker"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">Career Tools</span>
          </button>

          <button
            type="button"
            onClick={onTogglePortfolioMode}
            className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/90 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            title="লাইভ পার্সোনাল ওয়েবসাইট মোডে দেখুন"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{portfolioMode ? 'CV Editor' : 'Live Website'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGitHubModal}
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            title="GitHub Pages Deploy Guide"
          >
            <Github className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onLockStudio}
            className="p-1.5 rounded-md bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition"
            title="স্টুডিও লক করে পাবলিক ওয়েবসাইটে ফিরে যান"
          >
            <Lock className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {onToggleZenMode && (
            <button
              type="button"
              onClick={onToggleZenMode}
              className={`p-1.5 rounded-md border transition ${
                zenMode
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Zen Focus Mode (সব সাইডবার লুকিয়ে নিরিবিলি এডিট করুন)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {onOpenPrintPreview && (
            <button
              type="button"
              onClick={onOpenPrintPreview}
              className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
              title="Full-Screen A4 Print Preview দেখুন"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Print Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenExportHub}
            className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            title="Print, Word, Excel, Backup ও পাসকোড সেটিংস"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export Hub</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            title="১ ক্লিকে A4 PDF ডাউনলোড করুন"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* TIER 2: Clean Contextual Design, Formatting & Insert Strip */}
      <div className="bg-[#0F172A] border-t border-slate-800/80">
        <div className="max-w-[1760px] mx-auto px-3 sm:px-5 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Group A: Design Inspector, Template & Photo */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleStudioSidebar}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold flex items-center gap-1.5 transition"
              title="বাম দিকের Design Inspector প্যানেল চালু/বন্ধ করুন"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Design Panel</span>
            </button>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
              <span className="px-2 text-[11px] text-slate-400 hidden xl:inline border-r border-slate-800">
                <Layers className="w-3 h-3 inline mr-1 text-slate-400" />
                Template
              </span>
              <select
                value={selectedTemplate}
                onChange={(e) => onSelectTemplate(e.target.value as CVTemplateKey)}
                className="bg-transparent text-slate-200 px-2 py-1 text-xs font-medium focus:outline-none max-w-[190px] cursor-pointer"
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
                className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border-l border-slate-800 text-blue-300 font-semibold flex items-center gap-1 transition"
                title="ভিজ্যুয়াল গ্যালারি ও Custom Template Manager খুলুন"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gallery</span>
              </button>
            </div>

            {/* Compact Photo Switcher */}
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-[11px]">
              {(
                [
                  { id: 'right', label: 'Photo R', tip: 'Photo Right' },
                  { id: 'left', label: 'L', tip: 'Photo Left' },
                  { id: 'center', label: 'C', tip: 'Photo Center' },
                  { id: 'hide', label: 'No Photo', tip: 'Hide Photo (100% ATS)' },
                ] as Array<{ id: PhotoPosition; label: string; tip: string }>
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onSetPhotoPosition(pos.id)}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    photoPosition === pos.id
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={pos.tip}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group B: Clean Text Formatting + Undo/Redo */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Global Undo/Redo */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
              <button
                type="button"
                onClick={onUndoCV}
                disabled={!canUndoCV}
                className="px-1.5 py-0.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
                title="Undo CV (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRedoCV}
                disabled={!canRedoCV}
                className="px-1.5 py-0.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
                title="Redo CV (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Formatting Strip */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 gap-0.5">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onFormatDoc('bold');
                }}
                className="p-1 rounded hover:bg-slate-800 text-slate-200"
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
                className="p-1 rounded hover:bg-slate-800 text-slate-200"
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
                className="p-1 rounded hover:bg-slate-800 text-slate-200"
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

              <label className="px-1 py-0.5 rounded hover:bg-slate-800 cursor-pointer flex items-center gap-0.5" title="Text Color">
                <span className="font-bold text-blue-400 text-[11px]">A</span>
                <input
                  type="color"
                  defaultValue="#0f4c81"
                  onChange={(e) => onFormatDoc('foreColor', e.target.value)}
                  className="w-3 h-3 bg-transparent border-0 cursor-pointer"
                />
              </label>
              <label className="px-1 py-0.5 rounded hover:bg-slate-800 cursor-pointer flex items-center gap-0.5" title="Highlight Color">
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
                className="p-1 rounded hover:bg-slate-800 text-slate-300"
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
                className="p-1 rounded hover:bg-slate-800 text-slate-300"
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
                className="p-1 rounded hover:bg-slate-800 text-slate-300"
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
                className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-blue-300 font-semibold flex items-center gap-1"
                title="Insert / Edit Hyperlink"
              >
                <LinkIcon className="w-3 h-3" /> Link
              </button>

              <div className="hidden lg:flex items-center border-l border-slate-800 pl-1 gap-0.5">
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
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-300 border-l border-slate-800 ml-0.5"
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
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
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
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
                title="Text Redo"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Group C: Clean "+ Insert" Dropdown + Auto-Fit + Word Stats */}
          <div className="flex items-center gap-1.5">
            {/* + Insert Dropdown Menu */}
            <div className="relative" ref={insertRef}>
              <button
                type="button"
                onClick={() => setInsertMenuOpen(!insertMenuOpen)}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {insertMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onAddContact();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Contact Link</span>
                    <span className="text-[10px] text-slate-500">Header</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddSkill();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Skill Row</span>
                    <span className="text-[10px] text-slate-500">Skills</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddJob();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Work Experience</span>
                    <span className="text-[10px] text-slate-500">Job</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddProject();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>+ Project Case Study</span>
                    <span className="text-[10px] text-slate-500">Project</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAddSectionModal();
                      setInsertMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-blue-300 font-semibold"
                  >
                    + Custom Section...
                  </button>
                </div>
              )}
            </div>

            {/* Auto-Fit 1P / 2P */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-[11px]">
              <button
                type="button"
                onClick={onAutoFit1Page}
                className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="১ পৃষ্ঠায় ফিট করুন"
              >
                1P Fit
              </button>
              <button
                type="button"
                onClick={onAutoFit2Pages}
                className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="২ পৃষ্ঠায় ফিট করুন"
              >
                2P Fit
              </button>
            </div>

            {/* Quiet Word & Scan Counter */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-400">
              <span>{wordCount}w</span>
              <span>·</span>
              <span>{readTimeSeconds}s scan</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
