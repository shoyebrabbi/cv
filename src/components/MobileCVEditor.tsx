import React, { useState, useRef } from 'react';
import {
  User,
  Phone,
  FileText,
  Layers,
  Briefcase,
  FolderGit2,
  GraduationCap,
  PenTool,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Camera,
  RotateCcw,
  RotateCw,
  Bot,
  Sparkles,
  Globe,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  Bold,
  Italic,
  Link as LinkIcon,
  Eraser,
} from 'lucide-react';
import {
  CVData,
  CVTemplateKey,
  StudioSettings,
  PhotoPosition,
  ContactItem,
  SkillRow,
  ExperienceItem,
  ProjectItem,
} from '../types/cv';
import { compressImageFileToDataUrl } from '../utils/imageCompress';
import { sanitizeRichTextHtml } from '../utils/sanitizeHtml';
import { getDefaultContactIcon } from '../utils/contactIcon';
import { getExperienceDateLabel } from '../utils/experienceDate';

const TEMPLATE_DISPLAY_NAMES: Record<CVTemplateKey, string> = {
  'bd-corporate': 'BD Corporate',
  'strict-ats': 'Strict ATS',
  'original-master': 'Original PDF',
  'modern-split': 'Modern Split',
  'two-col-sidebar': 'Teal Sidebar',
  'data-boxed': 'Data & SQA',
  'compact-onepage': '1-Page Fit',
  'dark-header': 'Dark Header',
  'exec-ats': 'Timeline Pro',
  'exec-sidebar': 'Dark Sidebar',
  'swiss-grid': 'Swiss Grid',
  'tech-mono': 'Tech Mono',
};

interface MobileCVEditorProps {
  cvData: CVData;
  settings: StudioSettings;
  score: number;
  estimatedPages: number;
  overflowPx: number;
  activeProfileName: string;
  canUndoCV: boolean;
  canRedoCV: boolean;
  onUndoCV: () => void;
  onRedoCV: () => void;
  onUpdateCVData: (updater: (prev: CVData) => CVData) => void;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onOpenATSModal: () => void;
  onOpenProfileManager: () => void;
  onOpenTemplateGallery: () => void;
  onOpenSignatureModal: () => void;
  onOpenAddSectionModal: () => void;
  onTogglePortfolioMode: () => void;
  onToggleUnifiedTools: () => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

type EditorSectionKey =
  | 'header'
  | 'contacts'
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'custom';

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function MobileCVEditor({
  cvData,
  settings,
  score,
  estimatedPages,
  overflowPx,
  activeProfileName,
  canUndoCV,
  canRedoCV,
  onUndoCV,
  onRedoCV,
  onUpdateCVData,
  onUpdateSettings,
  onOpenATSModal,
  onOpenProfileManager,
  onOpenTemplateGallery,
  onOpenSignatureModal,
  onOpenAddSectionModal,
  onTogglePortfolioMode,
  onToggleUnifiedTools,
  onShowToast,
}: MobileCVEditorProps) {
  const [openSection, setOpenSection] = useState<EditorSectionKey>('header');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const bulletRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeLinkBulletKey, setActiveLinkBulletKey] = useState<string | null>(null);
  const [linkUrlDraft, setLinkUrlDraft] = useState('https://');
  const savedRangeRef = useRef<Range | null>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFileToDataUrl(file);
      onUpdateSettings({ photoSrc: compressed });
      onShowToast('প্রোফাইল ছবি আপলোড ও সেভ হয়েছে!', 'success');
    } catch {
      onShowToast('ছবি প্রসেস করতে সমস্যা হয়েছে।', 'error');
    }
    e.target.value = '';
  }

  function syncBulletHtml(expIdx: number, bIdx: number, bulletId: string) {
    const el = bulletRefs.current[bulletId];
    if (!el) return;
    const nextHtml = el.innerHTML;
    onUpdateCVData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((item, i) =>
        i === expIdx
          ? {
              ...item,
              bullets: item.bullets.map((bul, bi) =>
                bi === bIdx ? { ...bul, text: nextHtml } : bul
              ),
            }
          : item
      ),
    }));
  }

  function applyBulletCommand(
    expIdx: number,
    bIdx: number,
    bulletId: string,
    cmd: 'bold' | 'italic' | 'removeFormat'
  ) {
    const el = bulletRefs.current[bulletId];
    if (el) el.focus();
    document.execCommand(cmd, false);
    syncBulletHtml(expIdx, bIdx, bulletId);
  }

  function openBulletLinkBar(bulletId: string) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
    setLinkUrlDraft('https://');
    setActiveLinkBulletKey((prev) => (prev === bulletId ? null : bulletId));
  }

  function applyBulletLink(expIdx: number, bIdx: number, bulletId: string) {
    const cleanUrl = linkUrlDraft.trim();
    if (!cleanUrl || cleanUrl === 'https://') {
      setActiveLinkBulletKey(null);
      return;
    }
    const el = bulletRefs.current[bulletId];
    if (el) el.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    document.execCommand('createLink', false, cleanUrl);
    syncBulletHtml(expIdx, bIdx, bulletId);
    setActiveLinkBulletKey(null);
    savedRangeRef.current = null;
  }

  function toggleSection(key: EditorSectionKey) {
    setOpenSection((prev) => (prev === key ? ('' as EditorSectionKey) : key));
  }

  const sectionsMeta: {
    key: EditorSectionKey;
    title: string;
    subtitle: string;
    icon: typeof User;
    tint: string;
  }[] = [
    {
      key: 'header',
      title: '১. নাম, টাইটেল ও ছবি',
      subtitle: 'Header Name, Job Title & Profile Photo',
      icon: User,
      tint: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    },
    {
      key: 'contacts',
      title: `২. কন্টাক্ট ও সোশ্যাল লিংক (${cvData.contacts.length})`,
      subtitle: 'Phone, Email, Location, LinkedIn, GitHub',
      icon: Phone,
      tint: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    },
    {
      key: 'summary',
      title: '৩. প্রোফাইল সামারি',
      subtitle: 'Professional Summary Statement',
      icon: FileText,
      tint: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    },
    {
      key: 'skills',
      title: `৪. টেকনিক্যাল স্কিলস (${cvData.skills.length})`,
      subtitle: 'Skill Categories & Tools Matrix',
      icon: Layers,
      tint: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    },
    {
      key: 'experience',
      title: `৫. কাজের অভিজ্ঞতা (${cvData.experiences.length})`,
      subtitle: 'Roles, Companies & Impact Bullets',
      icon: Briefcase,
      tint: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
    {
      key: 'projects',
      title: `৬. প্রজেক্ট ও কেস স্টাডি (${cvData.projects.length})`,
      subtitle: 'Technical Projects, Links & Stack',
      icon: FolderGit2,
      tint: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    },
    {
      key: 'education',
      title: '৭. শিক্ষা, সার্টিফিকেট ও ভাষা',
      subtitle: 'Degree, Certifications, Languages & Strengths',
      icon: GraduationCap,
      tint: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
    },
    {
      key: 'custom',
      title: `৮. কাস্টম সেকশন, স্বাক্ষর ও ফুটার`,
      subtitle: 'Custom Blocks, Digital Signature & Page Footer',
      icon: PenTool,
      tint: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    },
  ];

  return (
    <div className="lg:hidden w-full max-w-2xl mx-auto px-2 sm:px-3 pt-2 pb-20 space-y-3 text-slate-100">
      {/* Native Mobile App Status & Quick Controls Card */}
      <div className="rounded-2xl bg-[#0B1221] border border-slate-800 p-3.5 sm:p-4 shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
              Mobile App Editor
            </div>
            <h1 className="text-base font-extrabold text-white truncate mt-0.5">
              {activeProfileName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
              <span>{estimatedPages} Page A4</span>
              <span>·</span>
              {overflowPx > 0 ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Overflow ({Math.round(overflowPx)}px)
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clean Fit
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onUndoCV}
              disabled={!canUndoCV}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
              aria-label="Undo"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRedoCV}
              disabled={!canRedoCV}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
              aria-label="Redo"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2x2 Clear App Action Tiles (No duplicate A4 Sheet switcher — lives uniquely in Bottom Nav) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleUnifiedTools}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span className="truncate">Career Tools</span>
          </button>

          <button
            type="button"
            onClick={onTogglePortfolioMode}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/35 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="truncate">Live Website</span>
          </button>

          <button
            type="button"
            onClick={onOpenATSModal}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">ATS Score: {score}%</span>
          </button>

          <button
            type="button"
            onClick={onOpenTemplateGallery}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <LayoutGrid className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">
              {TEMPLATE_DISPLAY_NAMES[settings.template] || settings.template}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenProfileManager}
          className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 border-t border-slate-800/90 text-xs font-semibold text-slate-300 flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Role Profile পরিবর্তন বা নতুন ভার্সন</span>
          </span>
          <span className="text-blue-400 font-bold shrink-0">Manage →</span>
        </button>
      </div>

      {/* Section Accordion Cards */}
      <div className="space-y-2.5">
        {sectionsMeta.map((sec) => {
          const Icon = sec.icon;
          const isOpen = openSection === sec.key;

          return (
            <div
              key={sec.key}
              className="rounded-2xl bg-[#0B1221] border border-slate-800/90 overflow-hidden shadow-lg"
            >
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full min-h-[60px] px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${sec.tint}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{sec.title}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{sec.subtitle}</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-4 pt-3 border-t border-slate-800/80 space-y-4 bg-[#080D1A]/60">
                  {/* 1. HEADER & PHOTO */}
                  {sec.key === 'header' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Full Name (আপনার নাম)
                        </label>
                        <input
                          type="text"
                          value={cvData.name}
                          onChange={(e) =>
                            onUpdateCVData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full min-h-[44px] rounded-xl bg-[#0B1221] border border-slate-700 px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Professional Headline / Title
                        </label>
                        <input
                          type="text"
                          value={cvData.title}
                          onChange={(e) =>
                            onUpdateCVData((prev) => ({ ...prev, title: e.target.value }))
                          }
                          className="w-full min-h-[44px] rounded-xl bg-[#0B1221] border border-slate-700 px-3.5 py-2.5 text-sm text-blue-300 font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Photo Upload & Position */}
                      <div className="rounded-xl bg-[#0B1221] border border-slate-800 p-3.5 space-y-3">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={settings.photoSrc}
                            alt={cvData.name}
                            className="w-16 h-20 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="text-xs font-bold text-white">Profile Photo</div>
                            <input
                              ref={photoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => photoInputRef.current?.click()}
                              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                            >
                              <Camera className="w-4 h-4" /> নতুন ছবি আপলোড
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-slate-400 mb-1.5">
                            Photo Position in A4 CV:
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {(
                              [
                                { id: 'right', label: 'Right' },
                                { id: 'left', label: 'Left' },
                                { id: 'center', label: 'Center' },
                                { id: 'hide', label: 'Hide' },
                              ] as Array<{ id: PhotoPosition; label: string }>
                            ).map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() =>
                                  onUpdateSettings({
                                    photoPosition: pos.id,
                                    headerStyle: pos.id,
                                  })
                                }
                                className={`min-h-[40px] rounded-lg text-xs font-semibold border transition ${
                                  settings.photoPosition === pos.id
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-slate-900 border-slate-800 text-slate-300'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. CONTACTS */}
                  {sec.key === 'contacts' && (
                    <div className="space-y-3">
                      {cvData.contacts.map((c, idx) => (
                        <div
                          key={c.id}
                          className={`space-y-2.5 ${idx > 0 ? 'pt-3 border-t border-slate-800/80' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={c.type}
                              onChange={(e) =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  contacts: prev.contacts.map((item, i) =>
                                    i === idx
                                      ? { ...item, type: e.target.value as ContactItem['type'] }
                                      : item
                                  ),
                                }))
                              }
                              className="min-h-[38px] rounded-lg bg-slate-900 border border-slate-700 px-2.5 text-xs font-semibold text-slate-200"
                            >
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="location">Location</option>
                              <option value="linkedin">LinkedIn</option>
                              <option value="github">GitHub</option>
                              <option value="website">Website</option>
                              <option value="custom">Custom Link</option>
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    contacts: arrayMove(prev.contacts, idx, idx - 1),
                                  }))
                                }
                                disabled={idx === 0}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                                aria-label="Move up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    contacts: arrayMove(prev.contacts, idx, idx + 1),
                                  }))
                                }
                                disabled={idx === cvData.contacts.length - 1}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                                aria-label="Move down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    contacts: prev.contacts.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300"
                                aria-label="Delete contact"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Contact Icon (emoji or symbol)
                            </label>
                            <input
                              type="text"
                              value={c.icon ?? ''}
                              maxLength={16}
                              onChange={(e) =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  contacts: prev.contacts.map((item, i) =>
                                    i === idx ? { ...item, icon: e.target.value } : item
                                  ),
                                }))
                              }
                              placeholder={`${getDefaultContactIcon(c.type)} (automatic)`}
                              aria-label={`Icon for ${c.label}`}
                              className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-lg text-white"
                            />
                            <p className="mt-1 text-[10px] text-slate-500">
                              Leave blank to use the icon for this contact type.
                            </p>
                          </div>

                          <input
                            type="text"
                            value={c.label}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                contacts: prev.contacts.map((item, i) =>
                                  i === idx ? { ...item, label: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Display Label"
                            className="w-full min-h-[42px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-white"
                          />
                          <input
                            type="text"
                            value={c.url}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                contacts: prev.contacts.map((item, i) =>
                                  i === idx ? { ...item, url: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Link URL (mailto:, tel:, https://...)"
                            className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-800 px-3 text-xs text-slate-300 font-mono"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCVData((prev) => ({
                            ...prev,
                            contacts: [
                              ...prev.contacts,
                              {
                                id: 'c_' + Date.now(),
                                label: 'New Contact',
                                url: 'https://shoyebrabbi.com',
                                type: 'custom',
                              },
                            ],
                          }))
                        }
                        className="w-full min-h-[44px] rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> নতুন কন্টাক্ট যোগ করুন
                      </button>
                    </div>
                  )}

                  {/* 3. SUMMARY */}
                  {sec.key === 'summary' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300">
                        Professional Summary Statement
                      </label>
                      <textarea
                        rows={7}
                        value={cvData.summary}
                        onChange={(e) =>
                          onUpdateCVData((prev) => ({ ...prev, summary: e.target.value }))
                        }
                        className="w-full rounded-xl bg-[#0B1221] border border-slate-700 p-3.5 text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* 4. SKILLS */}
                  {sec.key === 'skills' && (
                    <div className="space-y-3">
                      {cvData.skills.map((skill: SkillRow, idx) => (
                        <div
                          key={skill.id}
                          className={`space-y-2.5 ${idx > 0 ? 'pt-3 border-t border-slate-800/80' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-300">
                              Skill Row #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    skills: arrayMove(prev.skills, idx, idx - 1),
                                  }))
                                }
                                disabled={idx === 0}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    skills: arrayMove(prev.skills, idx, idx + 1),
                                  }))
                                }
                                disabled={idx === cvData.skills.length - 1}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    skills: prev.skills.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={skill.category}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                skills: prev.skills.map((s, i) =>
                                  i === idx ? { ...s, category: e.target.value } : s
                                ),
                              }))
                            }
                            placeholder="Category Name"
                            className="w-full min-h-[42px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm font-bold text-white"
                          />
                          <textarea
                            rows={3}
                            value={skill.competencies}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                skills: prev.skills.map((s, i) =>
                                  i === idx ? { ...s, competencies: e.target.value } : s
                                ),
                              }))
                            }
                            placeholder="Comma-separated tools & skills..."
                            className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-3 text-sm text-slate-200 leading-relaxed"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCVData((prev) => ({
                            ...prev,
                            skills: [
                              ...prev.skills,
                              {
                                id: 's_' + Date.now(),
                                category: 'New Skill Domain',
                                competencies: 'Tools, Languages, Frameworks...',
                              },
                            ],
                          }))
                        }
                        className="w-full min-h-[44px] rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> নতুন স্কিল ক্যাটাগরি যোগ করুন
                      </button>
                    </div>
                  )}

                  {/* 5. EXPERIENCE */}
                  {sec.key === 'experience' && (
                    <div className="space-y-4">
                      {cvData.experiences.map((exp: ExperienceItem, idx) => (
                        <div
                          key={exp.id}
                          className={`space-y-3 ${idx > 0 ? 'pt-4 border-t border-slate-800/80' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-amber-300">
                              Role #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    experiences: arrayMove(prev.experiences, idx, idx - 1),
                                  }))
                                }
                                disabled={idx === 0}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    experiences: arrayMove(prev.experiences, idx, idx + 1),
                                  }))
                                }
                                disabled={idx === cvData.experiences.length - 1}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    experiences: prev.experiences.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                experiences: prev.experiences.map((item, i) =>
                                  i === idx ? { ...item, role: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Job Role / Title"
                            className="w-full min-h-[42px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm font-bold text-white"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((item, i) =>
                                    i === idx ? { ...item, company: e.target.value } : item
                                  ),
                                }))
                              }
                              placeholder="Company"
                              className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-blue-300"
                            />
                            <input
                              type="text"
                              value={getExperienceDateLabel(exp)}
                              onChange={(e) =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((item, i) =>
                                    i === idx ? { ...item, date: e.target.value } : item
                                  ),
                                }))
                              }
                              placeholder="Date (e.g. March 2021 - May 2023)"
                              className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-slate-200"
                            />
                          </div>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                experiences: prev.experiences.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        date: getExperienceDateLabel(item),
                                        location: e.target.value,
                                      }
                                    : item
                                ),
                              }))
                            }
                            placeholder="Work Location"
                            className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-slate-200"
                          />

                          <div className="space-y-2 pt-1">
                            <div className="text-xs font-semibold text-slate-400">
                              Impact Bullets ({exp.bullets.length}):
                            </div>
                            {exp.bullets.map((b, bIdx) => (
                              <div key={b.id} className="space-y-1.5 rounded-lg bg-[#080D1A] border border-slate-800 p-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                                  <span>Bullet #{bIdx + 1}</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        applyBulletCommand(idx, bIdx, b.id, 'bold');
                                      }}
                                      className="min-h-[30px] min-w-[30px] rounded bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center"
                                      title="Bold selected text"
                                      aria-label="Bold"
                                    >
                                      <Bold className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        applyBulletCommand(idx, bIdx, b.id, 'italic');
                                      }}
                                      className="min-h-[30px] min-w-[30px] rounded bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center"
                                      title="Italic selected text"
                                      aria-label="Italic"
                                    >
                                      <Italic className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        openBulletLinkBar(b.id);
                                      }}
                                      className={`min-h-[30px] min-w-[30px] rounded border flex items-center justify-center ${
                                        activeLinkBulletKey === b.id
                                          ? 'bg-blue-600 border-blue-500 text-white'
                                          : 'bg-slate-900 border-slate-700 text-slate-200'
                                      }`}
                                      title="Add hyperlink"
                                      aria-label="Add hyperlink"
                                    >
                                      <LinkIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        applyBulletCommand(idx, bIdx, b.id, 'removeFormat');
                                      }}
                                      className="min-h-[30px] min-w-[30px] rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center"
                                      title="Clear formatting"
                                      aria-label="Clear formatting"
                                    >
                                      <Eraser className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onUpdateCVData((prev) => ({
                                          ...prev,
                                          experiences: prev.experiences.map((item, i) =>
                                            i === idx
                                              ? {
                                                  ...item,
                                                  bullets: item.bullets.filter((_, bi) => bi !== bIdx),
                                                }
                                              : item
                                          ),
                                        }))
                                      }
                                      className="text-rose-400 hover:underline font-semibold px-2 py-1 ml-1"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                {activeLinkBulletKey === b.id && (
                                  <div className="flex items-center gap-1.5 bg-slate-900 border border-blue-500/40 rounded-lg p-1.5">
                                    <input
                                      type="url"
                                      value={linkUrlDraft}
                                      onChange={(e) => setLinkUrlDraft(e.target.value)}
                                      placeholder="https://..."
                                      className="flex-1 min-w-0 bg-[#080D1A] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => applyBulletLink(idx, bIdx, b.id)}
                                      className="px-2.5 py-1 rounded bg-blue-600 text-white text-[11px] font-bold shrink-0"
                                    >
                                      Apply
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActiveLinkBulletKey(null)}
                                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] shrink-0"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}

                                <div
                                  ref={(el) => {
                                    bulletRefs.current[b.id] = el;
                                  }}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={() => syncBulletHtml(idx, bIdx, b.id)}
                                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(b.text) }}
                                  className="min-h-[60px] rounded-lg bg-[#0B1221] border border-slate-700 p-2.5 text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((item, i) =>
                                    i === idx
                                      ? {
                                          ...item,
                                          bullets: [
                                            ...item.bullets,
                                            {
                                              id: 'b_' + Date.now(),
                                              text: '<strong>Key Achievement:</strong> Quantified outcome and tools used...',
                                            },
                                          ],
                                        }
                                      : item
                                  ),
                                }))
                              }
                              className="w-full min-h-[40px] rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-blue-300 flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCVData((prev) => ({
                            ...prev,
                            experiences: [
                              ...prev.experiences,
                              {
                                id: 'e_' + Date.now(),
                                role: 'Position / Role',
                                company: 'Organization Name',
                                date: 'Month Year - Present',
                                location: 'Chattogram, Bangladesh',
                                bullets: [
                                  {
                                    id: 'b_' + Date.now(),
                                    text: '<strong>Impact:</strong> Describe measurable achievements...',
                                  },
                                ],
                              },
                            ],
                          }))
                        }
                        className="w-full min-h-[44px] rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> নতুন কাজের অভিজ্ঞতা যোগ করুন
                      </button>
                    </div>
                  )}

                  {/* 6. PROJECTS */}
                  {sec.key === 'projects' && (
                    <div className="space-y-3">
                      {cvData.projects.map((proj: ProjectItem, idx) => (
                        <div
                          key={proj.id}
                          className={`space-y-2.5 ${idx > 0 ? 'pt-3.5 border-t border-slate-800/80' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-purple-300">
                              Project #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    projects: arrayMove(prev.projects, idx, idx - 1),
                                  }))
                                }
                                disabled={idx === 0}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    projects: arrayMove(prev.projects, idx, idx + 1),
                                  }))
                                }
                                disabled={idx === cvData.projects.length - 1}
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCVData((prev) => ({
                                    ...prev,
                                    projects: prev.projects.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="min-h-[36px] min-w-[36px] rounded-lg bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p, i) =>
                                  i === idx ? { ...p, title: e.target.value } : p
                                ),
                              }))
                            }
                            placeholder="Project Title"
                            className="w-full min-h-[42px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm font-bold text-white"
                          />
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p, i) =>
                                  i === idx ? { ...p, technologies: e.target.value } : p
                                ),
                              }))
                            }
                            placeholder="Technologies (e.g. SQL, Power BI, Postman)"
                            className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-xs text-cyan-300 font-mono"
                          />
                          <input
                            type="text"
                            value={proj.url}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p, i) =>
                                  i === idx ? { ...p, url: e.target.value } : p
                                ),
                              }))
                            }
                            placeholder="GitHub / Live URL"
                            className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-800 px-3 text-xs text-slate-300 font-mono"
                          />
                          <textarea
                            rows={3}
                            value={proj.description}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p, i) =>
                                  i === idx ? { ...p, description: e.target.value } : p
                                ),
                              }))
                            }
                            placeholder="Project Architecture & Impact..."
                            className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-3 text-sm text-slate-200 leading-relaxed"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCVData((prev) => ({
                            ...prev,
                            projects: [
                              ...prev.projects,
                              {
                                id: 'p_' + Date.now(),
                                title: 'New Technical Project',
                                url: 'https://github.com/shoyebrabbi',
                                technologies: 'SQL, Power BI, REST API',
                                description: 'Describe project architecture and quantified impact...',
                              },
                            ],
                          }))
                        }
                        className="w-full min-h-[44px] rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> নতুন প্রজেক্ট যোগ করুন
                      </button>
                    </div>
                  )}

                  {/* 7. EDUCATION, CERTS & LANGUAGES */}
                  {sec.key === 'education' && (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-[#0B1221] border border-slate-800 p-3.5 space-y-2.5">
                        <div className="text-xs font-bold text-teal-300">Academic Degree</div>
                        <input
                          type="text"
                          value={cvData.education.degree}
                          onChange={(e) =>
                            onUpdateCVData((prev) => ({
                              ...prev,
                              education: { ...prev.education, degree: e.target.value },
                            }))
                          }
                          placeholder="Degree Name"
                          className="w-full min-h-[42px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm font-bold text-white"
                        />
                        <input
                          type="text"
                          value={cvData.education.school}
                          onChange={(e) =>
                            onUpdateCVData((prev) => ({
                              ...prev,
                              education: { ...prev.education, school: e.target.value },
                            }))
                          }
                          placeholder="University / Institution"
                          className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-slate-200"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cvData.education.year}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                education: { ...prev.education, year: e.target.value },
                              }))
                            }
                            placeholder="Year"
                            className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-slate-200"
                          />
                          <input
                            type="text"
                            value={cvData.education.location}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                education: { ...prev.education, location: e.target.value },
                              }))
                            }
                            placeholder="Location"
                            className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-slate-200"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={cvData.education.modules}
                          onChange={(e) =>
                            onUpdateCVData((prev) => ({
                              ...prev,
                              education: { ...prev.education, modules: e.target.value },
                            }))
                          }
                          placeholder="Key Courses / Modules"
                          className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-sm text-slate-200"
                        />
                      </div>

                      <div className="rounded-xl bg-[#0B1221] border border-slate-800 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            Certifications ({cvData.certifications.length})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                certifications: [...prev.certifications, 'New Certification'],
                              }))
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-blue-300 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                        {cvData.certifications.map((cert, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={cert}
                              onChange={(e) =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  certifications: prev.certifications.map((c, i) =>
                                    i === idx ? e.target.value : c
                                  ),
                                }))
                              }
                              className="flex-1 min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  certifications: prev.certifications.filter((_, i) => i !== idx),
                                }))
                              }
                              className="min-h-[40px] min-w-[40px] rounded-lg bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl bg-[#0B1221] border border-slate-800 p-3.5 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Languages
                          </label>
                          <textarea
                            rows={2}
                            value={cvData.languages}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({ ...prev, languages: e.target.value }))
                            }
                            className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Key Professional Strengths
                          </label>
                          <textarea
                            rows={3}
                            value={cvData.strengths}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({ ...prev, strengths: e.target.value }))
                            }
                            className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-sm text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. CUSTOM SECTIONS, SIGNATURE & FOOTER */}
                  {sec.key === 'custom' && (
                    <div className="space-y-3">
                      {cvData.customSections.map((cs, idx) => (
                        <div
                          key={cs.id}
                          className={`space-y-2.5 ${idx > 0 ? 'pt-3.5 border-t border-slate-800/80' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={cs.title}
                              onChange={(e) =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  customSections: prev.customSections.map((s, i) =>
                                    i === idx ? { ...s, title: e.target.value } : s
                                  ),
                                }))
                              }
                              className="flex-1 min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm font-bold text-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  customSections: prev.customSections.filter((_, i) => i !== idx),
                                }))
                              }
                              className="min-h-[40px] min-w-[40px] rounded-lg bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Section Layout
                            </label>
                            <select
                              value={cs.type}
                              onChange={(e) =>
                                onUpdateCVData((prev) => ({
                                  ...prev,
                                  customSections: prev.customSections.map((section, i) =>
                                    i === idx
                                      ? {
                                          ...section,
                                          type: e.target.value as
                                            | 'bullets'
                                            | 'paragraph'
                                            | 'references',
                                        }
                                      : section
                                  ),
                                }))
                              }
                              className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm text-slate-200"
                            >
                              <option value="bullets">Bullet list</option>
                              <option value="paragraph">Paragraph</option>
                              <option value="references">References</option>
                            </select>
                          </div>

                          <textarea
                            rows={4}
                            value={cs.content.join('\n')}
                            onChange={(e) =>
                              onUpdateCVData((prev) => ({
                                ...prev,
                                customSections: prev.customSections.map((s, i) =>
                                  i === idx ? { ...s, content: e.target.value.split('\n') } : s
                                ),
                              }))
                            }
                            placeholder="One item per line..."
                            className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-3 text-sm text-slate-200 leading-relaxed"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={onOpenAddSectionModal}
                        className="w-full min-h-[44px] rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> নতুন কাস্টম সেকশন যুক্ত করুন
                      </button>

                      <button
                        type="button"
                        onClick={onOpenSignatureModal}
                        className="w-full min-h-[44px] rounded-xl bg-[#0B1221] border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <PenTool className="w-4 h-4 text-rose-400" />
                        <span>Digital Signature আঁকুন / আপলোড করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
