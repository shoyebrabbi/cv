import React, { useRef, useState } from 'react';
import {
  X,
  Boxes,
  Camera,
  Palette,
  RotateCcw,
  QrCode as QrIcon,
  PenTool,
  Globe,
  Eye,
  Printer,
  BookmarkPlus,
  LayoutGrid,
  Sliders,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  StudioSettings,
  CVSectionId,
  BodyColumns,
  SectionHeadingStyle,
  SkillsMode,
  BulletStyle,
} from '../types/cv';

interface StyleCombinerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onResetClick: () => void;
  onOpenSignatureModal: () => void;
  onAutoFit1Page: () => void;
  onAutoFit2Pages: () => void;
  onSaveCustomTemplate?: (name: string, description: string) => void;
  onOpenTemplateGallery?: () => void;
}

type InspectorTab = 'layout' | 'style' | 'media' | 'print';

export function StyleCombinerDrawer({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetClick,
  onOpenSignatureModal,
  onAutoFit1Page,
  onAutoFit2Pages,
  onSaveCustomTemplate,
  onOpenTemplateGallery,
}: StyleCombinerDrawerProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>('layout');
  const [showSaveTpl, setShowSaveTpl] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');

  if (!isOpen) return null;

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onUpdateSettings({ photoSrc: event.target.result });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay (<1024px) */}
      <div
        className="no-print lg:hidden fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="no-print fixed lg:static inset-y-0 left-0 w-[94vw] max-w-[390px] lg:w-[356px] rounded-r-3xl lg:rounded-none bg-[#090E1A] border-r border-slate-800/90 text-slate-200 flex flex-col shrink-0 z-50 lg:z-30 h-full overflow-hidden shadow-2xl lg:shadow-none">
        {/* Inspector Header */}
        <div className="px-4 py-3 border-b border-slate-800/90 flex items-center justify-between shrink-0 bg-[#080D1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm lg:text-xs tracking-wide text-slate-100">
                Design Inspector
              </h2>
              <p className="text-[11px] text-slate-400">লেআউট, কালার, ওয়েবসাইট ও প্রিন্ট</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center"
            title="প্যানেল বন্ধ করুন"
            aria-label="Close Design Inspector"
          >
            <X className="w-5 h-5 lg:w-4 lg:h-4" />
          </button>
        </div>

      {/* Pinned 4-Tab Bar (Full Unclipped Labels) */}
      <div className="grid grid-cols-4 border-b border-slate-800/90 bg-[#0B1221] shrink-0 text-[11px]">
        {(
          [
            { id: 'layout', label: 'Layout', Icon: Boxes },
            { id: 'style', label: 'Style', Icon: Palette },
            { id: 'media', label: 'Media', Icon: Camera },
            { id: 'print', label: 'Print & Web', Icon: Printer },
          ] as Array<{ id: InspectorTab; label: string; Icon: React.FC<{ className?: string }> }>
        ).map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`py-2.5 px-1.5 flex flex-col items-center justify-center gap-1 font-semibold transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 bg-blue-600/10 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : ''}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Active Tab Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/75 text-xs">
        {/* ================= TAB 1: LAYOUT & SECTIONS ================= */}
        {activeTab === 'layout' && (
          <>
            {/* Quick Gallery & Save Template Action */}
            <div className="p-4 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                {onOpenTemplateGallery && (
                  <button
                    type="button"
                    onClick={onOpenTemplateGallery}
                    className="py-2 px-3 rounded-lg bg-[#111827] hover:bg-slate-800 border border-slate-700/90 text-slate-100 font-semibold flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Templates</span>
                  </button>
                )}
                {onSaveCustomTemplate && (
                  <button
                    type="button"
                    onClick={() => setShowSaveTpl(!showSaveTpl)}
                    className="py-2 px-3 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 font-semibold flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 shrink-0" />
                    <span>Save Design</span>
                  </button>
                )}
              </div>

              {showSaveTpl && onSaveCustomTemplate && (
                <div className="bg-[#111827] border border-emerald-500/40 rounded-lg p-3 space-y-2">
                  <input
                    type="text"
                    value={tplName}
                    onChange={(e) => setTplName(e.target.value)}
                    placeholder="নতুন টেমপ্লেটের নাম..."
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={tplDesc}
                    onChange={(e) => setTplDesc(e.target.value)}
                    placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)..."
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!tplName.trim()) return;
                      onSaveCustomTemplate(tplName.trim(), tplDesc.trim() || 'Custom Designer Template');
                      setTplName('');
                      setTplDesc('');
                      setShowSaveTpl(false);
                    }}
                    className="w-full py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                  >
                    Save to Template Gallery
                  </button>
                </div>
              )}
            </div>

            {/* Structure Controls */}
            <div className="p-4 space-y-3.5">
              <div className="text-[11px] font-bold tracking-wide text-slate-300">
                Structure &amp; Layout
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Header Style</label>
                <select
                  value={settings.headerStyle}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    onUpdateSettings({
                      headerStyle: val,
                      photoPosition: val === 'dark-banner' ? 'right' : val,
                    });
                  }}
                  className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="right">Photo Right (BD Corporate Best)</option>
                  <option value="left">Photo Left (Classic)</option>
                  <option value="center">Centered Executive Header</option>
                  <option value="dark-banner">Dark Full-Width Banner</option>
                  <option value="hide">No Photo (100% Global Strict ATS)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Column Layout</label>
                <select
                  value={settings.bodyColumns}
                  onChange={(e) => onUpdateSettings({ bodyColumns: e.target.value as BodyColumns })}
                  className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="1col">1-Column Full Width (Best ATS)</option>
                  <option value="2col-left">2-Column (Left Sidebar)</option>
                  <option value="2col-right">2-Column (Right Sidebar)</option>
                </select>
              </div>

              {settings.bodyColumns !== '1col' && (
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Sidebar Width</span>
                    <span className="text-slate-100 font-mono tabular-nums">
                      {settings.sidebarWidthPercent || 33}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="26"
                    max="42"
                    step="1"
                    value={settings.sidebarWidthPercent || 33}
                    onChange={(e) =>
                      onUpdateSettings({ sidebarWidthPercent: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Section Headings</label>
                <select
                  value={settings.sectionHeading}
                  onChange={(e) => onUpdateSettings({ sectionHeading: e.target.value as SectionHeadingStyle })}
                  className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="accent-bar">Left Accent Bar + Rule</option>
                  <option value="line">Minimal Bottom Line</option>
                  <option value="pill">Shaded Card Box</option>
                  <option value="solid">Full-Width Solid Theme Bar</option>
                  <option value="double">Harvard Double Rule</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Skills Display</label>
                <select
                  value={settings.skillsMode}
                  onChange={(e) => onUpdateSettings({ skillsMode: e.target.value as SkillsMode })}
                  className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="table">Structured Table</option>
                  <option value="pills">Stacked Cards</option>
                  <option value="grid">2-Column Grid Cards</option>
                  <option value="bars">Skill Progress Bars</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Bullet Icon Style</label>
                <select
                  value={settings.bulletStyle}
                  onChange={(e) => onUpdateSettings({ bulletStyle: e.target.value as BulletStyle })}
                  className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="bullet-disc">• Classic Disc</option>
                  <option value="bullet-square">▪ Executive Square</option>
                  <option value="bullet-arrow">▸ Modern Arrow</option>
                  <option value="bullet-check">✓ Checkmark</option>
                  <option value="bullet-dash">— Clean Dash</option>
                </select>
              </div>
            </div>

            {/* Section Order, Rename, Visibility & Column Placement (Clean 2-Row Unclipped Cards) */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> Sections: Order &amp; Titles
                </span>
                {settings.bodyColumns !== '1col' && (
                  <span className="text-[10.5px] text-slate-400">Sidebar / Main</span>
                )}
              </div>

              <div className="space-y-2">
                {(() => {
                  const defaultOrder: CVSectionId[] = [
                    'summary',
                    'skills',
                    'experience',
                    'projects',
                    'credentials',
                  ];
                  const order =
                    settings.sectionOrder && settings.sectionOrder.length === 5
                      ? settings.sectionOrder
                      : defaultOrder;
                  const shortLabels: Record<CVSectionId, string> = {
                    summary: 'Summary',
                    skills: 'Skills',
                    experience: 'Experience',
                    projects: 'Projects',
                    credentials: 'Education & Certs',
                  };
                  const defaultTitles: Record<CVSectionId, string> = {
                    summary: 'PROFESSIONAL SUMMARY',
                    skills: 'CORE TECHNICAL SKILLS & COMPETENCIES',
                    experience: 'PROFESSIONAL EXPERIENCE',
                    projects: 'KEY TECHNICAL PROJECTS & CASE STUDIES',
                    credentials: 'EDUCATION',
                  };
                  const sidebarSet = new Set<CVSectionId>(
                    settings.sidebarSections && settings.sidebarSections.length > 0
                      ? settings.sidebarSections
                      : ['skills', 'credentials']
                  );
                  const isTwoCol = settings.bodyColumns !== '1col';

                  return order.map((secId, idx) => {
                    const hidden = (settings.hiddenSections || []).includes(secId);
                    const inSidebar = sidebarSet.has(secId);
                    const customTitle = settings.sectionTitles?.[secId] ?? '';

                    const moveSec = (dir: -1 | 1) => {
                      const target = idx + dir;
                      if (target < 0 || target >= order.length) return;
                      const next = [...order];
                      [next[idx], next[target]] = [next[target], next[idx]];
                      onUpdateSettings({ sectionOrder: next });
                    };

                    const togglePlacement = () => {
                      const next = new Set(sidebarSet);
                      if (inSidebar) next.delete(secId);
                      else next.add(secId);
                      onUpdateSettings({ sidebarSections: Array.from(next) });
                    };

                    return (
                      <div
                        key={secId}
                        className="bg-[#111827] border border-slate-800/90 rounded-lg p-2.5 space-y-2"
                      >
                        {/* Row 1: Sequence, Label, Reorder, Placement & Visibility */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10.5px] font-mono tabular-nums text-slate-500 font-bold">
                              0{idx + 1}
                            </span>
                            <span
                              className={`text-[11px] font-semibold truncate ${
                                hidden ? 'text-slate-500 line-through' : 'text-slate-200'
                              }`}
                            >
                              {shortLabels[secId]}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center bg-[#080D1A] border border-slate-800 rounded p-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSec(-1)}
                                className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === order.length - 1}
                                onClick={() => moveSec(1)}
                                className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {isTwoCol && (
                              <button
                                type="button"
                                onClick={togglePlacement}
                                className={`px-2 py-0.5 rounded text-[10.5px] font-semibold shrink-0 transition whitespace-nowrap ${
                                  inSidebar
                                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
                                }`}
                                title="Switch Sidebar / Main Column"
                              >
                                {inSidebar ? 'Sidebar' : 'Main'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const cur = new Set(settings.hiddenSections || []);
                                if (hidden) cur.delete(secId);
                                else cur.add(secId);
                                onUpdateSettings({ hiddenSections: Array.from(cur) });
                              }}
                              className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border transition whitespace-nowrap ${
                                hidden
                                  ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                              }`}
                              title={hidden ? 'Show section' : 'Hide section'}
                            >
                              {hidden ? 'Hidden' : 'Visible'}
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Full-Width Editable Heading Title (Never Clipped) */}
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) =>
                            onUpdateSettings({
                              sectionTitles: {
                                ...(settings.sectionTitles || {}),
                                [secId]: e.target.value,
                              },
                            })
                          }
                          placeholder={defaultTitles[secId]}
                          className={`w-full bg-[#080D1A] border border-slate-800 focus:border-blue-500 rounded-md px-2.5 py-1.5 text-[11px] focus:outline-none ${
                            hidden ? 'text-slate-500 line-through' : 'text-slate-100'
                          }`}
                        />
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Sub-headings inside Credentials */}
              <div className="pt-2 space-y-2">
                <div className="text-[10.5px] text-slate-400 font-medium">Credentials Sub-Headings</div>
                <div className="grid grid-cols-1 gap-1.5">
                  <input
                    type="text"
                    value={settings.sectionTitles?.certifications ?? ''}
                    onChange={(e) =>
                      onUpdateSettings({
                        sectionTitles: {
                          ...(settings.sectionTitles || {}),
                          certifications: e.target.value,
                        },
                      })
                    }
                    placeholder="CERTIFICATIONS"
                    className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-md px-2.5 py-1.5 text-[11px] text-slate-100 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={settings.sectionTitles?.languages ?? ''}
                    onChange={(e) =>
                      onUpdateSettings({
                        sectionTitles: {
                          ...(settings.sectionTitles || {}),
                          languages: e.target.value,
                        },
                      })
                    }
                    placeholder="LANGUAGES & CORE"
                    className="w-full bg-[#111827] border border-slate-800 focus:border-blue-500 rounded-md px-2.5 py-1.5 text-[11px] text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: STYLE, COLORS & SPACING ================= */}
        {activeTab === 'style' && (
          <>
            {/* Preset Swatches & Custom Colors */}
            <div className="p-4 space-y-3.5">
              <div className="text-[11px] font-bold tracking-wide text-slate-300">
                Color Palette
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {[
                  { primary: '#0f4c81', light: '#f0f7ff', border: '#1e6091', label: 'Royal Blue' },
                  { primary: '#1e3a8a', light: '#eff6ff', border: '#1d4ed8', label: 'Navy' },
                  { primary: '#065f46', light: '#ecfdf5', border: '#047857', label: 'Emerald' },
                  { primary: '#0f766e', light: '#f0fdfa', border: '#0d9488', label: 'Teal' },
                  { primary: '#4338ca', light: '#eef2ff', border: '#4f46e5', label: 'Indigo' },
                  { primary: '#7f1d1d', light: '#fef2f2', border: '#b91c1c', label: 'Burgundy' },
                  { primary: '#000000', light: '#f8fafc', border: '#000000', label: 'Pure ATS Black' },
                ].map((c) => (
                  <button
                    key={c.primary}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        themePrimary: c.primary,
                        themeLight: c.light,
                        themeBorder: c.border,
                      })
                    }
                    className={`w-7 h-7 rounded-full transition border border-white/15 ${
                      settings.themePrimary === c.primary ? 'ring-2 ring-white scale-110' : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.primary }}
                    title={c.label}
                  />
                ))}
                <input
                  type="color"
                  value={settings.themePrimary}
                  onChange={(e) =>
                    onUpdateSettings({
                      themePrimary: e.target.value,
                      themeLight: '#f8fafc',
                      themeBorder: e.target.value,
                    })
                  }
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  title="Custom Primary Color"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-2 flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] text-slate-200 font-medium">Text Color</span>
                  <input
                    type="color"
                    value={settings.cvTextColor || '#1e293b'}
                    onChange={(e) => onUpdateSettings({ cvTextColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                </label>
                <label className="bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-2 flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] text-slate-200 font-medium">Card Tint</span>
                  <input
                    type="color"
                    value={settings.themeLight || '#f0f7ff'}
                    onChange={(e) => onUpdateSettings({ themeLight: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                </label>
                <label className="bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-2 flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] text-slate-200 font-medium">Paper BG</span>
                  <input
                    type="color"
                    value={settings.cvPaperBg || '#ffffff'}
                    onChange={(e) => onUpdateSettings({ cvPaperBg: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                </label>
                <label className="bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-2 flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] text-slate-200 font-medium">Sidebar BG</span>
                  <input
                    type="color"
                    value={settings.sidebarBg || settings.themeLight || '#f0f7ff'}
                    onChange={(e) => onUpdateSettings({ sidebarBg: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                </label>
              </div>
              {(settings.sidebarBg ||
                (settings.cvPaperBg && settings.cvPaperBg !== '#ffffff') ||
                (settings.cvTextColor && settings.cvTextColor !== '#1e293b')) && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      cvTextColor: '#1e293b',
                      cvPaperBg: '#ffffff',
                      sidebarBg: '',
                      sidebarTextColor: '',
                    })
                  }
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition"
                >
                  Reset Paper &amp; Sidebar Colors
                </button>
              )}
            </div>

            {/* Typography & Spacing Sliders */}
            <div className="p-4 space-y-3.5">
              <div className="text-[11px] font-bold tracking-wide text-slate-300">
                Typography &amp; Page Spacing
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Document Font</label>
                <select
                  value={settings.cvFont}
                  onChange={(e) => onUpdateSettings({ cvFont: e.target.value })}
                  className="w-full bg-[#111827] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="'Inter', sans-serif">Inter (Modern Executive)</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Tech)</option>
                  <option value="'DM Sans', sans-serif">DM Sans (Clean Minimal)</option>
                  <option value="'JetBrains Mono', monospace">JetBrains Mono (Dev)</option>
                  <option value="'Roboto', sans-serif">Roboto (Corporate)</option>
                  <option value="Georgia, serif">Georgia (Harvard ATS Serif)</option>
                  <option value="'Merriweather', Georgia, serif">Merriweather (Editorial)</option>
                  <option value="Calibri, Arial, sans-serif">Calibri (MS Word Standard)</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Font Size</span>
                  <span className="text-slate-100 font-mono tabular-nums">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10.5"
                  max="15"
                  step="0.2"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Line Height</span>
                  <span className="text-slate-100 font-mono tabular-nums">{settings.lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1.15"
                  max="1.75"
                  step="0.04"
                  value={settings.lineHeight}
                  onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Section Gap</span>
                  <span className="text-slate-100 font-mono tabular-nums">{settings.sectionGap}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="1"
                  value={settings.sectionGap}
                  onChange={(e) => onUpdateSettings({ sectionGap: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Page Margin</span>
                  <span className="text-slate-100 font-mono tabular-nums">{settings.pagePadding}mm</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="1"
                  value={settings.pagePadding}
                  onChange={(e) => onUpdateSettings({ pagePadding: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <label className="flex items-center justify-between pt-2 border-t border-slate-800/80 cursor-pointer">
                <span className="text-[11px] text-slate-200 font-medium">Page-by-Page Split Guides</span>
                <input
                  type="checkbox"
                  checked={settings.pageSplitView}
                  onChange={(e) => onUpdateSettings({ pageSplitView: e.target.checked })}
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onAutoFit1Page}
                  className="py-2 px-2.5 rounded-lg bg-[#111827] hover:bg-slate-800 border border-slate-800 text-slate-100 font-semibold transition whitespace-nowrap"
                >
                  Auto-Fit 1 Page
                </button>
                <button
                  type="button"
                  onClick={onAutoFit2Pages}
                  className="py-2 px-2.5 rounded-lg bg-[#111827] hover:bg-slate-800 border border-slate-800 text-slate-100 font-semibold transition whitespace-nowrap"
                >
                  Auto-Fit 2 Pages
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 3: MEDIA (PHOTO, QR, SIGNATURE) ================= */}
        {activeTab === 'media' && (
          <>
            {/* Photo Controls */}
            <div className="p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wide text-slate-300">
                  Profile Photo
                </span>
                <label className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg cursor-pointer font-semibold whitespace-nowrap">
                  Upload Photo
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="অথবা ছবির লিংক দিন..."
                  className="flex-1 min-w-0 bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) onUpdateSettings({ photoSrc: val });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input && input.value.trim()) {
                      onUpdateSettings({ photoSrc: input.value.trim() });
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0"
                >
                  Apply
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {[
                  { val: '10px', label: 'Rounded' },
                  { val: '999px', label: 'Circle' },
                  { val: '0px', label: 'Square' },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => onUpdateSettings({ photoShape: s.val })}
                    className={`py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                      settings.photoShape === s.val
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-[#111827] border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Box Size</span>
                  <span className="font-mono tabular-nums text-slate-100">{settings.photoSize}px</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="155"
                  value={settings.photoSize}
                  onChange={(e) => onUpdateSettings({ photoSize: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Photo Zoom</span>
                  <span className="font-mono tabular-nums text-slate-100">{settings.photoScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.05"
                  value={settings.photoScale}
                  onChange={(e) => onUpdateSettings({ photoScale: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Horizontal Pan</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.photoPosX}
                    onChange={(e) => onUpdateSettings({ photoPosX: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Vertical Pan</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.photoPosY}
                    onChange={(e) => onUpdateSettings({ photoPosY: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* QR Code Controls */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
                  <QrIcon className="w-3.5 h-3.5 text-blue-400" /> Dynamic QR Code
                </span>
                <input
                  type="checkbox"
                  checked={settings.qrCode?.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      qrCode: { ...settings.qrCode, enabled: e.target.checked },
                    })
                  }
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {settings.qrCode?.enabled && (
                <div className="space-y-2.5 pt-1">
                  <input
                    type="text"
                    value={settings.qrCode.url}
                    onChange={(e) =>
                      onUpdateSettings({
                        qrCode: { ...settings.qrCode, url: e.target.value },
                      })
                    }
                    placeholder="QR URL..."
                    className="w-full bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <select
                      value={settings.qrCode.position}
                      onChange={(e) =>
                        onUpdateSettings({
                          qrCode: { ...settings.qrCode, position: e.target.value as any },
                        })
                      }
                      className="bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                    >
                      <option value="header">Header (Top)</option>
                      <option value="footer">Footer (Bottom)</option>
                    </select>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      value={settings.qrCode.size}
                      onChange={(e) =>
                        onUpdateSettings({
                          qrCode: { ...settings.qrCode, size: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Digital Signature */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-amber-400" /> Digital Signature
                </span>
                <input
                  type="checkbox"
                  checked={settings.signature?.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      signature: { ...settings.signature, enabled: e.target.checked },
                    })
                  }
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {settings.signature?.enabled && (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onOpenSignatureModal}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5 text-xs transition"
                  >
                    <PenTool className="w-3.5 h-3.5" /> Open Signature Pad
                  </button>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.signature.showDeclaration}
                      onChange={(e) =>
                        onUpdateSettings({
                          signature: {
                            ...settings.signature,
                            showDeclaration: e.target.checked,
                          },
                        })
                      }
                      className="accent-blue-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">Show Declaration Text</span>
                  </label>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= TAB 4: PRINT, HEADER/FOOTER & WEBSITE ================= */}
        {activeTab === 'print' && (
          <>
            {/* Print Suppression */}
            <div className="p-4 space-y-3">
              <div className="text-[11px] font-bold tracking-wide text-slate-300">
                Print &amp; Header / Footer Control
              </div>

              <label className="flex items-start justify-between gap-2.5 bg-[#111827] p-3 rounded-lg border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-[11.5px] font-semibold text-emerald-300 block">
                    Hide Browser Print URL / Date
                  </span>
                  <span className="text-[10.5px] text-slate-400 leading-relaxed block mt-0.5">
                    প্রিন্ট করার সময় ব্রাউজারের উপরের/নিচের লেখা আসবে না
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hideBrowserPrintChrome !== false}
                  onChange={(e) => onUpdateSettings({ hideBrowserPrintChrome: e.target.checked })}
                  className="accent-emerald-500 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                />
              </label>

              {/* CV Header Visibility */}
              <div className="bg-[#111827] p-3 rounded-lg border border-slate-800 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11.5px] font-semibold text-slate-100">Show Entire CV Header</span>
                  <input
                    type="checkbox"
                    checked={settings.showHeader !== false}
                    onChange={(e) => onUpdateSettings({ showHeader: e.target.checked })}
                    className="accent-blue-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                {settings.showHeader !== false && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showTitle !== false}
                          onChange={(e) => onUpdateSettings({ showTitle: e.target.checked })}
                          className="accent-blue-500 w-3.5 h-3.5"
                        />
                        Title
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showContacts !== false}
                          onChange={(e) => onUpdateSettings({ showContacts: e.target.checked })}
                          className="accent-blue-500 w-3.5 h-3.5"
                        />
                        Contacts
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showHeaderDivider !== false}
                          onChange={(e) => onUpdateSettings({ showHeaderDivider: e.target.checked })}
                          className="accent-blue-500 w-3.5 h-3.5"
                        />
                        Border
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Header Alignment:</span>
                      <div className="flex gap-1">
                        {(['auto', 'left', 'center'] as const).map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() => onUpdateSettings({ headerAlign: al })}
                            className={`px-2.5 py-1 rounded text-[10.5px] capitalize whitespace-nowrap ${
                              (settings.headerAlign || 'auto') === al
                                ? 'bg-blue-600 text-white font-semibold'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            {al}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CV Footer Visibility */}
              <div className="bg-[#111827] p-3 rounded-lg border border-slate-800 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11.5px] font-semibold text-amber-200">
                    Show Entire CV Footer
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.showFooter !== false}
                    onChange={(e) => onUpdateSettings({ showFooter: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                {settings.showFooter !== false && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      value={settings.footerNote ?? ''}
                      onChange={(e) => onUpdateSettings({ footerNote: e.target.value })}
                      placeholder="Left Footer Text (নাম পরিবর্তন)..."
                      className="w-full bg-[#080D1A] border border-slate-800 rounded-md px-2.5 py-1.5 text-[11px] text-white"
                    />
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[11px] text-slate-200">Show Right Page Label</span>
                      <input
                        type="checkbox"
                        checked={settings.showFooterPageNum !== false}
                        onChange={(e) => onUpdateSettings({ showFooterPageNum: e.target.checked })}
                        className="accent-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>
                    {settings.showFooterPageNum !== false && (
                      <input
                        type="text"
                        value={settings.footerRightText ?? ''}
                        onChange={(e) => onUpdateSettings({ footerRightText: e.target.value })}
                        placeholder="Right Footer (Default: Page 1 / 2)..."
                        className="w-full bg-[#080D1A] border border-slate-800 rounded-md px-2.5 py-1.5 text-[11px] text-white"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live Website Availability & KPIs */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wide text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Live Website Controls
                </span>
                <input
                  type="checkbox"
                  checked={settings.portfolio?.availabilityActive !== false}
                  onChange={(e) =>
                    onUpdateSettings({
                      portfolio: {
                        ...(settings.portfolio || {}),
                        availabilityActive: e.target.checked,
                        availabilityText:
                          settings.portfolio?.availabilityText ||
                          'Available for Immediate Joining · Chattogram / Dhaka / Remote',
                        metrics: settings.portfolio?.metrics || [
                          { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
                          { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
                          { id: 'm3', value: '80+', label: 'Test Cases Authored' },
                          { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
                        ],
                      },
                    })
                  }
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <label className="flex items-center justify-between bg-[#111827] px-3 py-2 rounded-lg border border-slate-800 cursor-pointer">
                <span className="text-[11px] text-slate-200 font-medium">Show Section Numbers (01, 02...)</span>
                <input
                  type="checkbox"
                  checked={Boolean(settings.portfolio?.showSectionNumbers)}
                  onChange={(e) =>
                    onUpdateSettings({
                      portfolio: {
                        ...(settings.portfolio || {}),
                        availabilityActive: settings.portfolio?.availabilityActive !== false,
                        availabilityText:
                          settings.portfolio?.availabilityText ||
                          'Available for Immediate Joining · Chattogram / Dhaka / Remote',
                        showSectionNumbers: e.target.checked,
                        metrics: settings.portfolio?.metrics || [
                          { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
                          { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
                          { id: 'm3', value: '80+', label: 'Test Cases Authored' },
                          { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
                        ],
                      },
                    })
                  }
                  className="accent-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Website Accent Theme Selector (Full Unclipped Names in 3x2 Grid) */}
              <div className="bg-[#111827] px-3 py-2.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-medium">Website Accent Theme</span>
                  <span className="font-mono text-[10.5px] text-cyan-400 uppercase">
                    {settings.portfolio?.accentTheme || 'cobalt'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { key: 'auto', label: 'Match CV', color: settings.themePrimary || '#0f4c81' },
                      { key: 'cobalt', label: 'Cobalt', color: '#2563eb' },
                      { key: 'emerald', label: 'Emerald', color: '#059669' },
                      { key: 'teal', label: 'Teal', color: '#0d9488' },
                      { key: 'indigo', label: 'Indigo', color: '#4f46e5' },
                      { key: 'rose', label: 'Rose', color: '#e11d48' },
                    ] as const
                  ).map((opt) => {
                    const active = (settings.portfolio?.accentTheme || 'cobalt') === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            portfolio: {
                              ...(settings.portfolio || {}),
                              availabilityActive: settings.portfolio?.availabilityActive !== false,
                              availabilityText:
                                settings.portfolio?.availabilityText ||
                                'Available for Immediate Joining · Chattogram / Dhaka / Remote',
                              accentTheme: opt.key,
                              metrics: settings.portfolio?.metrics || [
                                { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
                                { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
                                { id: 'm3', value: '80+', label: 'Test Cases Authored' },
                                { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
                              ],
                            },
                          })
                        }
                        className={`py-1.5 px-2 rounded-md text-[10.5px] font-semibold flex items-center gap-1.5 border transition whitespace-nowrap ${
                          active
                            ? 'border-blue-400 bg-slate-800 text-white shadow-sm'
                            : 'border-slate-800 bg-[#080D1A] text-slate-400 hover:text-white'
                        }`}
                        title={opt.key === 'auto' ? 'Auto-match CV Theme Color' : opt.label}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Website Design Style Selector */}
              <div className="bg-[#111827] px-3 py-2.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-medium">Website Design Layout</span>
                  <span className="font-mono text-[10.5px] text-emerald-400 uppercase">
                    {settings.portfolio?.designStyle || 'bento'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(
                    [
                      {
                        key: 'bento',
                        label: 'Signature Bento',
                        desc: 'Asymmetric proof cards & executive split (Recommended)',
                      },
                      {
                        key: 'editorial',
                        label: 'Executive Monograph',
                        desc: 'Serif display headings & publication hairline rules',
                      },
                      {
                        key: 'blueprint',
                        label: 'Systems Blueprint',
                        desc: 'Architectural grid cells & engineering precision',
                      },
                    ] as const
                  ).map((opt) => {
                    const active = (settings.portfolio?.designStyle || 'bento') === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            portfolio: {
                              ...(settings.portfolio || {}),
                              availabilityActive: settings.portfolio?.availabilityActive !== false,
                              availabilityText:
                                settings.portfolio?.availabilityText ||
                                'Available for Immediate Joining · Chattogram / Dhaka / Remote',
                              designStyle: opt.key,
                              metrics: settings.portfolio?.metrics || [
                                { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
                                { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
                                { id: 'm3', value: '80+', label: 'Test Cases Authored' },
                                { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
                              ],
                            },
                          })
                        }
                        className={`px-2.5 py-2 rounded-md text-left border transition ${
                          active
                            ? 'border-blue-400 bg-slate-800 text-white shadow-sm'
                            : 'border-slate-800 bg-[#080D1A] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold flex items-center justify-between">
                          <span>{opt.label}</span>
                          {active && <span className="text-[9.5px] font-mono text-cyan-300">ACTIVE</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                type="text"
                value={
                  settings.portfolio?.availabilityText ??
                  'Available for Immediate Joining · Chattogram / Dhaka / Remote'
                }
                onChange={(e) =>
                  onUpdateSettings({
                    portfolio: {
                      ...(settings.portfolio || {}),
                      availabilityActive: settings.portfolio?.availabilityActive !== false,
                      availabilityText: e.target.value,
                      metrics: settings.portfolio?.metrics || [
                        { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
                        { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
                        { id: 'm3', value: '80+', label: 'Test Cases Authored' },
                        { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
                      ],
                    },
                  })
                }
                className="w-full bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white"
              />

              <div className="space-y-1.5">
                {(
                  settings.portfolio?.metrics || [
                    { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
                    { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
                    { id: 'm3', value: '80+', label: 'Test Cases Authored' },
                    { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
                  ]
                ).map((m, idx, arr) => (
                  <div key={m.id} className="grid grid-cols-5 gap-1.5">
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => {
                        const updated = arr.map((item, i) =>
                          i === idx ? { ...item, value: e.target.value } : item
                        );
                        onUpdateSettings({
                          portfolio: {
                            ...(settings.portfolio || {}),
                            availabilityActive: settings.portfolio?.availabilityActive !== false,
                            availabilityText:
                              settings.portfolio?.availabilityText ||
                              'Available for Immediate Joining · Chattogram / Dhaka / Remote',
                            metrics: updated,
                          },
                        });
                      }}
                      className="col-span-2 bg-[#111827] border border-slate-800 rounded-md px-2 py-1.5 text-[11px] text-cyan-300 font-bold tabular-nums"
                    />
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const updated = arr.map((item, i) =>
                          i === idx ? { ...item, label: e.target.value } : item
                        );
                        onUpdateSettings({
                          portfolio: {
                            ...(settings.portfolio || {}),
                            availabilityActive: settings.portfolio?.availabilityActive !== false,
                            availabilityText:
                              settings.portfolio?.availabilityText ||
                              'Available for Immediate Joining · Chattogram / Dhaka / Remote',
                            metrics: updated,
                          },
                        });
                      }}
                      className="col-span-3 bg-[#111827] border border-slate-800 rounded-md px-2 py-1.5 text-[11px] text-slate-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reset to Default */}
            <div className="p-4">
              <button
                type="button"
                onClick={onResetClick}
                className="w-full py-2.5 rounded-lg bg-rose-950/35 hover:bg-rose-950/65 text-rose-300 border border-rose-500/30 font-semibold transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset CV to Default
              </button>
            </div>
          </>
        )}
        {/* End Scrollable Active Tab Content */}
      </div>
    </aside>
    </>
  );
}
