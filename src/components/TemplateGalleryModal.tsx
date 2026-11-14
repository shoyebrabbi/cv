import React, { useState, useRef } from 'react';
import { X, Check, LayoutGrid, ShieldCheck, BookmarkPlus, Trash2, Download, Upload } from 'lucide-react';
import { CVTemplateKey, CustomTemplatePreset } from '../types/cv';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: CVTemplateKey;
  onSelectTemplate: (tpl: CVTemplateKey) => void;
  customTemplates?: CustomTemplatePreset[];
  activeCustomTemplateId?: string;
  onSelectCustomTemplate?: (preset: CustomTemplatePreset) => void;
  onSaveCurrentAsTemplate?: (name: string, description: string) => void;
  onDeleteCustomTemplate?: (id: string) => void;
  onImportCustomTemplates?: (presets: CustomTemplatePreset[]) => void;
}

interface TemplateMeta {
  key: CVTemplateKey;
  number: number;
  name: string;
  subtitle: string;
  category: 'ats' | 'split' | 'executive';
  accent: string;
  bgTint: string;
  photo: 'right' | 'left' | 'none';
  columns: '1col' | '2col-left' | '2col-right';
  darkHeader?: boolean;
  darkSidebar?: boolean;
  atsNote: string;
}

const TEMPLATES: TemplateMeta[] = [
  {
    key: 'bd-corporate',
    number: 1,
    name: 'BD Corporate Executive',
    subtitle: 'Right Photo · Classic Table · Royal Blue',
    category: 'executive',
    accent: '#0f4c81',
    bgTint: '#f0f7ff',
    photo: 'right',
    columns: '1col',
    atsNote: 'BD Best',
  },
  {
    key: 'strict-ats',
    number: 2,
    name: '100% Strict ATS Harvard',
    subtitle: 'No Photo · Pure B&W · Georgia Serif',
    category: 'ats',
    accent: '#0f172a',
    bgTint: '#ffffff',
    photo: 'none',
    columns: '1col',
    atsNote: '100% Strict ATS',
  },
  {
    key: 'original-master',
    number: 3,
    name: 'Original PDF Replica',
    subtitle: 'Left Photo · Clean Balanced Structure',
    category: 'executive',
    accent: '#0f4c81',
    bgTint: '#f0f7ff',
    photo: 'left',
    columns: '1col',
    atsNote: 'Classic BD',
  },
  {
    key: 'modern-split',
    number: 4,
    name: 'Silicon Valley Split',
    subtitle: 'Right Sidebar · Grid Skills · Cobalt',
    category: 'split',
    accent: '#1e3a8a',
    bgTint: '#eff6ff',
    photo: 'right',
    columns: '2col-right',
    atsNote: 'Modern 2-Col',
  },
  {
    key: 'two-col-sidebar',
    number: 5,
    name: 'Two-Column Teal Executive',
    subtitle: 'Left Sidebar · Stacked Cards · Deep Teal',
    category: 'split',
    accent: '#0f766e',
    bgTint: '#f0fdfa',
    photo: 'right',
    columns: '2col-left',
    atsNote: 'Balanced 2-Col',
  },
  {
    key: 'data-boxed',
    number: 6,
    name: 'Data & SQA Boxed Cards',
    subtitle: 'Grid Matrix · Structured Technical Cards',
    category: 'ats',
    accent: '#0f4c81',
    bgTint: '#f0f7ff',
    photo: 'right',
    columns: '1col',
    atsNote: 'Tech Matrix',
  },
  {
    key: 'compact-onepage',
    number: 7,
    name: 'Ultra-Compact 1-Page Fit',
    subtitle: 'Tight Spacing · Dense Single-Page Flow',
    category: 'ats',
    accent: '#0f4c81',
    bgTint: '#f8fafc',
    photo: 'right',
    columns: '1col',
    atsNote: '1-Page Fit',
  },
  {
    key: 'dark-header',
    number: 8,
    name: 'Dark Header Executive',
    subtitle: 'Full-Width Navy Banner · Solid Section Bars',
    category: 'executive',
    accent: '#0f2942',
    bgTint: '#f1f5f9',
    photo: 'right',
    columns: '1col',
    darkHeader: true,
    atsNote: 'High Impact',
  },
  {
    key: 'exec-ats',
    number: 9,
    name: 'Executive Timeline Pro',
    subtitle: 'Vertical Rail · Burgundy Serif Authority',
    category: 'executive',
    accent: '#7f1d1d',
    bgTint: '#fef2f2',
    photo: 'right',
    columns: '1col',
    atsNote: 'Editorial Timeline',
  },
  {
    key: 'exec-sidebar',
    number: 10,
    name: 'Dark Sidebar Pro',
    subtitle: 'Colored Left Rail · High-Contrast Identity',
    category: 'split',
    accent: '#0f2942',
    bgTint: '#f1f5f9',
    photo: 'left',
    columns: '2col-left',
    darkSidebar: true,
    atsNote: 'Executive Split',
  },
  {
    key: 'swiss-grid',
    number: 11,
    name: 'Minimalist Swiss Grid Pro',
    subtitle: 'Architectural Spacing · Crisp Cobalt Rules',
    category: 'ats',
    accent: '#0f172a',
    bgTint: '#f8fafc',
    photo: 'right',
    columns: '1col',
    atsNote: 'Swiss Minimal',
  },
  {
    key: 'tech-mono',
    number: 12,
    name: 'Tech Monospace Developer',
    subtitle: 'Engineering Hierarchy · DM Sans + Mono Labels',
    category: 'ats',
    accent: '#0f766e',
    bgTint: '#f0fdfa',
    photo: 'right',
    columns: '1col',
    atsNote: 'Dev & Data',
  },
];

export function TemplateGalleryModal({
  isOpen,
  onClose,
  selectedTemplate,
  onSelectTemplate,
  customTemplates = [],
  activeCustomTemplateId,
  onSelectCustomTemplate,
  onSaveCurrentAsTemplate,
  onDeleteCustomTemplate,
  onImportCustomTemplates,
}: TemplateGalleryModalProps) {
  const [filter, setFilter] = useState<'all' | 'ats' | 'split' | 'executive' | 'custom'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const visible =
    filter === 'all'
      ? TEMPLATES
      : filter === 'custom'
      ? []
      : TEMPLATES.filter((t) => t.category === filter);

  function handleExportCustomJSON() {
    const blob = new Blob([JSON.stringify(customTemplates, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_cv_templates.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onImportCustomTemplates) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        const valid = list.filter((item) => item && item.name && item.settingsSnapshot);
        if (valid.length > 0) {
          onImportCustomTemplates(
            valid.map((item) => ({
              id: item.id || 'ctpl_' + Date.now() + Math.random().toString(36).slice(2, 6),
              name: item.name,
              description: item.description || 'Imported Custom Template',
              createdAt: item.createdAt || new Date().toISOString(),
              settingsSnapshot: item.settingsSnapshot,
            }))
          );
          setFilter('custom');
        }
      } catch {
        // Ignore malformed JSON silently
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-5xl w-full text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Visual CV Template Gallery (১২টি ডিজাইন + আপনার কাস্টম টেমপ্লেট)
              </h3>
              <p className="text-[11px] text-slate-400">
                বিল্ট-ইন টেমপ্লেট বা আপনার নিজের কাস্টম ডিজাইন সেভ করে এক ক্লিকে অ্যাপ্লাই করুন
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSaveCurrentAsTemplate && (
              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <BookmarkPlus className="w-3.5 h-3.5" /> + Save Current Design
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {[
                { key: 'all', label: 'All (12)' },
                { key: 'ats', label: '1-Col & ATS' },
                { key: 'split', label: '2-Column' },
                { key: 'executive', label: 'Executive' },
                { key: 'custom', label: `My Custom (${customTemplates.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition whitespace-nowrap ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inline Save Current Design & Import/Export Bar */}
        {(showCreateForm || filter === 'custom') && (
          <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {showCreateForm && onSaveCurrentAsTemplate ? (
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="নতুন টেমপ্লেটের নাম (যেমন: Clean Minimal Indigo)..."
                  className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="বিবরণ (যেমন: No Footer, Custom Teal)..."
                  className="flex-1 min-w-[180px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newName.trim()) return;
                    onSaveCurrentAsTemplate(
                      newName.trim(),
                      newDesc.trim() || 'Custom Designer Template'
                    );
                    setNewName('');
                    setNewDesc('');
                    setShowCreateForm(false);
                    setFilter('custom');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                >
                  Save Now
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                বাম দিকের Studio থেকে কালার, ফন্ট, হেডার/ফুটার সাজিয়ে <strong>+ Save Current Design</strong>-এ সেভ করুন।
              </span>
            )}

            <div className="flex items-center gap-2">
              {customTemplates.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCustomJSON}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
              )}
              {onImportCustomTemplates && (
                <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Import JSON
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Visual Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filter === 'all' || filter === 'custom') &&
            customTemplates.map((ctpl) => {
              const snap = ctpl.settingsSnapshot;
              const accent = snap.themePrimary || '#0f4c81';
              const bgTint = snap.sidebarBg || snap.themeLight || '#f0f7ff';
              const cols = snap.bodyColumns || '1col';
              const isSelected = activeCustomTemplateId === ctpl.id;
              return (
                <div
                  key={ctpl.id}
                  className={`rounded-xl border p-3.5 transition flex flex-col gap-3 relative ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-slate-800/60 border-emerald-500/30 hover:border-emerald-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCustomTemplate) {
                        onSelectCustomTemplate(ctpl);
                        onClose();
                      }
                    }}
                    className="text-left flex flex-col gap-3 group w-full"
                  >
                    <div
                      className="w-full h-36 rounded-lg p-2.5 shadow-inner border border-slate-200 flex flex-col gap-1.5 overflow-hidden relative"
                      style={{ backgroundColor: snap.cvPaperBg || '#ffffff' }}
                    >
                      <div
                        className={`flex items-center justify-between gap-2 pb-1.5 border-b ${
                          snap.headerStyle === 'dark-banner' ? 'rounded px-2 py-1.5 border-transparent' : ''
                        }`}
                        style={{
                          backgroundColor: snap.headerStyle === 'dark-banner' ? accent : 'transparent',
                          borderColor: accent,
                        }}
                      >
                        <div className="flex-1 space-y-1">
                          <div
                            className="h-2 w-24 rounded-sm"
                            style={{ backgroundColor: snap.headerStyle === 'dark-banner' ? '#ffffff' : '#0f172a' }}
                          />
                          <div
                            className="h-1.5 w-28 rounded-sm opacity-75"
                            style={{ backgroundColor: snap.headerStyle === 'dark-banner' ? '#93c5fd' : accent }}
                          />
                        </div>
                      </div>
                      {cols === '1col' ? (
                        <div className="space-y-1.5 flex-1">
                          <div className="h-1.5 w-16 rounded-sm" style={{ backgroundColor: accent }} />
                          <div className="h-1 w-full bg-slate-200 rounded-sm" />
                          <div className="h-1 w-4/5 bg-slate-200 rounded-sm" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-1.5 flex-1">
                          <div
                            className="col-span-4 rounded p-1 space-y-1"
                            style={{ backgroundColor: bgTint }}
                          >
                            <div className="h-1 w-full bg-slate-400/70 rounded-sm" />
                            <div className="h-1 w-3/4 bg-slate-300/70 rounded-sm" />
                          </div>
                          <div className="col-span-8 space-y-1">
                            <div className="h-1.5 w-16 rounded-sm" style={{ backgroundColor: accent }} />
                            <div className="h-1 w-full bg-slate-200 rounded-sm" />
                          </div>
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-emerald-300 group-hover:text-white transition-colors">
                          ★ {ctpl.name}
                        </span>
                        <span
                          className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: accent }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">{ctpl.description}</p>
                      <div className="text-[10px] font-semibold text-emerald-400">
                        Custom Saved Template
                      </div>
                    </div>
                  </button>

                  {onDeleteCustomTemplate && (
                    <button
                      type="button"
                      onClick={() => onDeleteCustomTemplate(ctpl.id)}
                      className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                      title="Delete Custom Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

          {filter === 'custom' && customTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-700 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-slate-300">
                এখনো কোনো কাস্টম টেমপ্লেট সেভ করা হয়নি।
              </p>
              <p className="text-xs text-slate-400">
                উপরের "+ Save Current Design" বাটনে ক্লিক করে আপনার বর্তমান কালার, ফন্ট ও লেআউট নতুন টেমপ্লেট হিসেবে সেভ করুন।
              </p>
            </div>
          )}

          {visible.map((tpl) => {
            const isSelected = !activeCustomTemplateId && selectedTemplate === tpl.key;
            return (
              <button
                key={tpl.key}
                type="button"
                onClick={() => {
                  onSelectTemplate(tpl.key);
                  onClose();
                }}
                className={`text-left rounded-xl border p-3.5 transition flex flex-col gap-3 group ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/40'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                {/* Mini Wireframe A4 Preview */}
                <div className="w-full h-36 rounded-lg bg-white p-2.5 shadow-inner border border-slate-200 flex flex-col gap-1.5 overflow-hidden relative">
                  {/* Top Header Wireframe */}
                  <div
                    className={`flex items-center justify-between gap-2 pb-1.5 border-b ${
                      tpl.darkHeader ? 'rounded px-2 py-1.5 border-transparent' : ''
                    }`}
                    style={{
                      backgroundColor: tpl.darkHeader ? tpl.accent : 'transparent',
                      borderColor: tpl.accent,
                    }}
                  >
                    {tpl.photo === 'left' && (
                      <div
                        className="w-5 h-6 rounded shrink-0"
                        style={{ backgroundColor: tpl.darkHeader ? '#e2e8f0' : tpl.accent, opacity: 0.85 }}
                      />
                    )}
                    <div className="flex-1 space-y-1">
                      <div
                        className="h-2 w-24 rounded-sm"
                        style={{ backgroundColor: tpl.darkHeader ? '#ffffff' : '#0f172a' }}
                      />
                      <div
                        className="h-1.5 w-32 rounded-sm opacity-75"
                        style={{ backgroundColor: tpl.darkHeader ? '#93c5fd' : tpl.accent }}
                      />
                    </div>
                    {tpl.photo === 'right' && (
                      <div
                        className="w-5 h-6 rounded shrink-0"
                        style={{ backgroundColor: tpl.darkHeader ? '#e2e8f0' : tpl.accent, opacity: 0.85 }}
                      />
                    )}
                  </div>

                  {/* Body Columns Wireframe */}
                  {tpl.columns === '1col' ? (
                    <div className="space-y-1.5 flex-1">
                      <div className="h-1.5 w-16 rounded-sm" style={{ backgroundColor: tpl.accent }} />
                      <div className="h-1 w-full bg-slate-200 rounded-sm" />
                      <div className="h-1 w-11/12 bg-slate-200 rounded-sm" />
                      <div className="grid grid-cols-3 gap-1 pt-0.5">
                        <div className="h-3 rounded-sm border border-slate-200" style={{ backgroundColor: tpl.bgTint }} />
                        <div className="h-3 col-span-2 rounded-sm border border-slate-200 bg-slate-50" />
                      </div>
                      <div className="h-1.5 w-20 rounded-sm mt-1" style={{ backgroundColor: tpl.accent }} />
                      <div className="h-1 w-full bg-slate-200 rounded-sm" />
                      <div className="h-1 w-4/5 bg-slate-200 rounded-sm" />
                    </div>
                  ) : (
                    <div
                      className={`grid gap-1.5 flex-1 ${
                        tpl.columns === '2col-left' ? 'grid-cols-12' : 'grid-cols-12'
                      }`}
                    >
                      {tpl.columns === '2col-left' ? (
                        <>
                          <div
                            className="col-span-4 rounded p-1 space-y-1"
                            style={{ backgroundColor: tpl.darkSidebar ? tpl.accent : tpl.bgTint }}
                          >
                            <div className={`h-1 w-full rounded-sm ${tpl.darkSidebar ? 'bg-white/60' : 'bg-slate-400'}`} />
                            <div className={`h-1 w-3/4 rounded-sm ${tpl.darkSidebar ? 'bg-white/40' : 'bg-slate-300'}`} />
                            <div className={`h-1 w-full rounded-sm ${tpl.darkSidebar ? 'bg-white/40' : 'bg-slate-300'}`} />
                          </div>
                          <div className="col-span-8 space-y-1">
                            <div className="h-1.5 w-16 rounded-sm" style={{ backgroundColor: tpl.accent }} />
                            <div className="h-1 w-full bg-slate-200 rounded-sm" />
                            <div className="h-1 w-5/6 bg-slate-200 rounded-sm" />
                            <div className="h-1.5 w-14 rounded-sm mt-1" style={{ backgroundColor: tpl.accent }} />
                            <div className="h-1 w-full bg-slate-200 rounded-sm" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-span-8 space-y-1">
                            <div className="h-1.5 w-16 rounded-sm" style={{ backgroundColor: tpl.accent }} />
                            <div className="h-1 w-full bg-slate-200 rounded-sm" />
                            <div className="h-1 w-5/6 bg-slate-200 rounded-sm" />
                            <div className="h-1.5 w-14 rounded-sm mt-1" style={{ backgroundColor: tpl.accent }} />
                            <div className="h-1 w-full bg-slate-200 rounded-sm" />
                          </div>
                          <div
                            className="col-span-4 rounded p-1 space-y-1"
                            style={{ backgroundColor: tpl.bgTint }}
                          >
                            <div className="h-1 w-full bg-slate-400 rounded-sm" />
                            <div className="h-1 w-3/4 bg-slate-300 rounded-sm" />
                            <div className="h-1 w-full bg-slate-300 rounded-sm" />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                      {tpl.number}. {tpl.name}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: tpl.accent }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">{tpl.subtitle}</p>
                  <div className="text-[10.5px] font-semibold text-emerald-400 flex items-center gap-1 pt-0.5">
                    <ShieldCheck className="w-3 h-3" /> {tpl.atsNote}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
