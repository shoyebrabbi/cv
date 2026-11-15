import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Globe,
  RefreshCw,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Camera,
  User,
  BarChart3,
  Layers,
  Briefcase,
  FolderGit2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  GitMerge,
  Eye,
  EyeOff,
  ImagePlus,
  Send,
} from 'lucide-react';
import {
  CVData,
  CustomSection,
  DEFAULT_SPECIALIZATION_CARDS,
  ExperienceItem,
  PortfolioSettings,
  ProjectItem,
  SkillRow,
  WebsiteContentOverrides,
  WebsiteEditorTab,
  WebsiteProjectEnhancement,
  WebsiteSectionKey,
  WebsiteSpecializationCard,
} from '../types/cv';
import { compressImageFileToDataUrl } from '../utils/imageCompress';

interface WebsiteEditorDrawerProps {
  isOpen: boolean;
  initialTab?: WebsiteEditorTab;
  onClose: () => void;
  cvData: CVData;
  cvPhotoSrc: string;
  portfolio: PortfolioSettings;
  onUpdatePortfolio: (updater: (prev: PortfolioSettings) => PortfolioSettings) => void;
  hasUnpublishedDraft?: boolean;
  onPublishDraft?: () => void;
  onDiscardDraft?: () => void;
  onShowToast?: (msg: string, type: 'info' | 'success' | 'error') => void;
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function StatusPill({ isCustom }: { isCustom: boolean }) {
  return isCustom ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10.5px] font-semibold whitespace-nowrap">
      <Sparkles className="w-3 h-3" /> Website-Only Custom
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10.5px] font-semibold whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3" /> Auto-Synced from CV
    </span>
  );
}

export function WebsiteEditorDrawer({
  isOpen,
  initialTab = 'hero',
  onClose,
  cvData,
  cvPhotoSrc,
  portfolio,
  onUpdatePortfolio,
  hasUnpublishedDraft = false,
  onPublishDraft,
  onDiscardDraft,
  onShowToast,
}: WebsiteEditorDrawerProps) {
  const [activeTab, setActiveTab] = useState<WebsiteEditorTab>(initialTab);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const ov: WebsiteContentOverrides = portfolio.websiteOverrides || {};

  const cvEmail = cvData.contacts.find((c) => c.type === 'email')?.label || 'shoyebrabbi@gmail.com';
  const cvPhone = cvData.contacts.find((c) => c.type === 'phone')?.label || '+8801622517200';
  const cvLocation = cvData.contacts.find((c) => c.type === 'location')?.label || 'Chattogram, Bangladesh';
  const cvLinkedin =
    cvData.contacts.find((c) => c.type === 'linkedin')?.url || 'https://linkedin.com/in/shoyebrabbi';
  const cvGithub =
    cvData.contacts.find((c) => c.type === 'github')?.url || 'https://github.com/shoyebrabbi';
  const cvWebsite = cvData.contacts.find((c) => c.type === 'website')?.url || '';

  const siteSkills = ov.skills ?? cvData.skills;
  const siteExperiences = ov.experiences ?? cvData.experiences;
  const siteProjects = ov.projects ?? cvData.projects;
  const siteEducation = ov.education ?? cvData.education;
  const siteCertifications = ov.certifications ?? cvData.certifications;
  const siteCustomSections = ov.customSections ?? cvData.customSections;
  const siteSpecializations = ov.specializations ?? DEFAULT_SPECIALIZATION_CARDS;
  const hiddenSections: WebsiteSectionKey[] = Array.isArray(ov.hiddenSections)
    ? ov.hiddenSections
    : [];
  const projectEnhancements: Record<string, WebsiteProjectEnhancement> =
    ov.projectEnhancements || {};
  const safeMetrics = Array.isArray(portfolio.metrics) ? portfolio.metrics : [];

  const customSectionCount = [
    ov.name !== undefined ||
      ov.title !== undefined ||
      ov.summary !== undefined ||
      ov.email !== undefined ||
      ov.phone !== undefined ||
      ov.location !== undefined ||
      ov.linkedin !== undefined ||
      ov.github !== undefined ||
      ov.website !== undefined ||
      ov.heroPhotoSrc !== undefined,
    ov.specializations !== undefined,
    ov.skills !== undefined || ov.skillsIntro !== undefined,
    ov.experiences !== undefined || ov.experienceIntro !== undefined,
    ov.projects !== undefined ||
      ov.projectsIntro !== undefined ||
      (ov.projectEnhancements !== undefined && Object.keys(ov.projectEnhancements).length > 0),
    ov.education !== undefined ||
      ov.certifications !== undefined ||
      ov.languages !== undefined ||
      ov.strengths !== undefined ||
      ov.customSections !== undefined ||
      ov.contactHeading !== undefined ||
      ov.contactSubtext !== undefined,
    hiddenSections.length > 0,
  ].filter(Boolean).length;

  function patchOverrides(patch: Partial<WebsiteContentOverrides>) {
    onUpdatePortfolio((prev) => ({
      ...prev,
      websiteOverrides: {
        ...(prev.websiteOverrides || {}),
        ...patch,
      },
    }));
  }

  function clearOverrideKeys(keys: Array<keyof WebsiteContentOverrides>, label: string) {
    onUpdatePortfolio((prev) => {
      const nextOv = { ...(prev.websiteOverrides || {}) };
      keys.forEach((k) => {
        delete nextOv[k];
      });
      return {
        ...prev,
        websiteOverrides: Object.keys(nextOv).length > 0 ? nextOv : undefined,
      };
    });
    onShowToast?.(`${label} এখন Master CV / PDF থেকে লাইভ সিঙ্ক হচ্ছে।`, 'info');
  }

  function handleMergeNewSkillsFromCV() {
    const existingIds = new Set(siteSkills.map((s) => s.id));
    const existingCats = new Set(siteSkills.map((s) => s.category.trim().toLowerCase()));
    const missing = cvData.skills.filter(
      (s) => !existingIds.has(s.id) && !existingCats.has(s.category.trim().toLowerCase())
    );
    if (missing.length === 0) {
      onShowToast?.('Master CV-তে নতুন কোনো স্কিল পাওয়া যায়নি (সবই ওয়েবসাইটে আছে)।', 'info');
      return;
    }
    patchOverrides({ skills: [...siteSkills, ...missing] });
    onShowToast?.(`CV থেকে ${missing.length}টি নতুন স্কিল ক্যাটাগরি ওয়েবসাইটে যুক্ত হয়েছে!`, 'success');
  }

  function handleMergeNewExperiencesFromCV() {
    const existingIds = new Set(siteExperiences.map((e) => e.id));
    const existingKeys = new Set(
      siteExperiences.map((e) => `${e.role.trim().toLowerCase()}::${e.company.trim().toLowerCase()}`)
    );
    const missing = cvData.experiences.filter(
      (e) =>
        !existingIds.has(e.id) &&
        !existingKeys.has(`${e.role.trim().toLowerCase()}::${e.company.trim().toLowerCase()}`)
    );
    if (missing.length === 0) {
      onShowToast?.('Master CV-তে নতুন কোনো অভিজ্ঞতা পাওয়া যায়নি।', 'info');
      return;
    }
    patchOverrides({ experiences: [...missing, ...siteExperiences] });
    onShowToast?.(`CV থেকে ${missing.length}টি নতুন অভিজ্ঞতা ওয়েবসাইটে যুক্ত হয়েছে!`, 'success');
  }

  function handleMergeNewProjectsFromCV() {
    const existingIds = new Set(siteProjects.map((p) => p.id));
    const existingTitles = new Set(siteProjects.map((p) => p.title.trim().toLowerCase()));
    const missing = cvData.projects.filter(
      (p) => !existingIds.has(p.id) && !existingTitles.has(p.title.trim().toLowerCase())
    );
    if (missing.length === 0) {
      onShowToast?.('Master CV-তে নতুন কোনো প্রজেক্ট পাওয়া যায়নি।', 'info');
      return;
    }
    patchOverrides({ projects: [...missing, ...siteProjects] });
    onShowToast?.(`CV থেকে ${missing.length}টি নতুন প্রজেক্ট ওয়েবসাইটে যুক্ত হয়েছে!`, 'success');
  }

  function handleMergeAllNewFromCV() {
    let addedCount = 0;
    onUpdatePortfolio((prev) => {
      const curOv = { ...(prev.websiteOverrides || {}) };
      if (curOv.skills) {
        const ids = new Set(curOv.skills.map((s) => s.id));
        const cats = new Set(curOv.skills.map((s) => s.category.trim().toLowerCase()));
        const missing = cvData.skills.filter(
          (s) => !ids.has(s.id) && !cats.has(s.category.trim().toLowerCase())
        );
        if (missing.length > 0) {
          curOv.skills = [...curOv.skills, ...missing];
          addedCount += missing.length;
        }
      }
      if (curOv.experiences) {
        const ids = new Set(curOv.experiences.map((e) => e.id));
        const keys = new Set(
          curOv.experiences.map(
            (e) => `${e.role.trim().toLowerCase()}::${e.company.trim().toLowerCase()}`
          )
        );
        const missing = cvData.experiences.filter(
          (e) =>
            !ids.has(e.id) &&
            !keys.has(`${e.role.trim().toLowerCase()}::${e.company.trim().toLowerCase()}`)
        );
        if (missing.length > 0) {
          curOv.experiences = [...missing, ...curOv.experiences];
          addedCount += missing.length;
        }
      }
      if (curOv.projects) {
        const ids = new Set(curOv.projects.map((p) => p.id));
        const titles = new Set(curOv.projects.map((p) => p.title.trim().toLowerCase()));
        const missing = cvData.projects.filter(
          (p) => !ids.has(p.id) && !titles.has(p.title.trim().toLowerCase())
        );
        if (missing.length > 0) {
          curOv.projects = [...missing, ...curOv.projects];
          addedCount += missing.length;
        }
      }
      if (curOv.certifications) {
        const existing = new Set(curOv.certifications.map((c) => c.trim().toLowerCase()));
        const missing = cvData.certifications.filter((c) => !existing.has(c.trim().toLowerCase()));
        if (missing.length > 0) {
          curOv.certifications = [...curOv.certifications, ...missing];
          addedCount += missing.length;
        }
      }
      if (curOv.customSections) {
        const ids = new Set(curOv.customSections.map((c) => c.id));
        const titles = new Set(curOv.customSections.map((c) => c.title.trim().toLowerCase()));
        const missing = cvData.customSections.filter(
          (c) => !ids.has(c.id) && !titles.has(c.title.trim().toLowerCase())
        );
        if (missing.length > 0) {
          curOv.customSections = [...curOv.customSections, ...missing];
          addedCount += missing.length;
        }
      }
      return { ...prev, websiteOverrides: curOv };
    });

    if (addedCount > 0) {
      onShowToast?.(
        `CV / PDF থেকে ${addedCount}টি নতুন আইটেম ওয়েবসাইটে যুক্ত হয়েছে (আপনার কাস্টম এডিট ঠিক রেখে)!`,
        'success'
      );
    } else {
      onShowToast?.('সব নতুন CV/PDF আইটেম ইতোমধ্যেই ওয়েবসাইটে সিঙ্ক করা আছে।', 'info');
    }
  }

  async function handleWebsitePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFileToDataUrl(file);
      patchOverrides({ heroPhotoSrc: compressed });
      onShowToast?.('শুধু Live Website-এর প্রোফাইল ছবি আপডেট হয়েছে (CV ছবি অপরিবর্তিত)।', 'success');
    } catch {
      onShowToast?.('ছবি প্রসেস করতে সমস্যা হয়েছে।', 'error');
    }
    e.target.value = '';
  }

  async function handleProjectImageUpload(
    projectId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFileToDataUrl(file, {
        maxWidth: 1120,
        maxHeight: 720,
        quality: 0.84,
      });
      patchOverrides({
        projectEnhancements: {
          ...projectEnhancements,
          [projectId]: {
            ...(projectEnhancements[projectId] || {}),
            imageUrl: compressed,
          },
        },
      });
      onShowToast?.('প্রজেক্টের ওয়েবসাইট প্রিভিউ ছবি যুক্ত হয়েছে (A4 CV অপরিবর্তিত)।', 'success');
    } catch {
      onShowToast?.('প্রজেক্টের ছবি প্রসেস করতে সমস্যা হয়েছে।', 'error');
    }
    e.target.value = '';
  }

  async function handleProjectGalleryUpload(
    projectId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const existing = projectEnhancements[projectId]?.galleryUrls || [];
    const remainingSlots = Math.max(0, 4 - existing.length);
    if (remainingSlots === 0) {
      onShowToast?.('সর্বোচ্চ ৪টি অতিরিক্ত গ্যালারি ছবি যুক্ত করা যাবে।', 'info');
      e.target.value = '';
      return;
    }
    try {
      const uploaded: string[] = [];
      for (const f of files.slice(0, remainingSlots)) {
        const compressed = await compressImageFileToDataUrl(f, {
          maxWidth: 1080,
          maxHeight: 680,
          quality: 0.8,
        });
        uploaded.push(compressed);
      }
      updateProjectEnhancement(projectId, {
        galleryUrls: [...existing, ...uploaded],
      });
      onShowToast?.(`${uploaded.length}টি গ্যালারি স্ক্রিনশট যুক্ত হয়েছে (CV অপরিবর্তিত)।`, 'success');
    } catch {
      onShowToast?.('গ্যালারি ছবি প্রসেস করতে সমস্যা হয়েছে।', 'error');
    }
    e.target.value = '';
  }

  function updateProjectEnhancement(
    projectId: string,
    patch: Partial<WebsiteProjectEnhancement>
  ) {
    const current = projectEnhancements[projectId] || {};
    const nextEntry: WebsiteProjectEnhancement = { ...current, ...patch };
    const hasSteps =
      Array.isArray(nextEntry.architectureSteps) && nextEntry.architectureSteps.some((s) => s.trim());
    const hasGallery =
      Array.isArray(nextEntry.galleryUrls) && nextEntry.galleryUrls.length > 0;
    const hasBeforeAfter = Boolean(
      nextEntry.beforeAfterImpact &&
        (nextEntry.beforeAfterImpact.beforeLabel.trim() ||
          nextEntry.beforeAfterImpact.beforeValue.trim() ||
          nextEntry.beforeAfterImpact.afterLabel.trim() ||
          nextEntry.beforeAfterImpact.afterValue.trim())
    );
    const hasSnippet = Boolean(
      nextEntry.technicalSnippet &&
        (nextEntry.technicalSnippet.label.trim() ||
          nextEntry.technicalSnippet.language.trim() ||
          nextEntry.technicalSnippet.code.trim())
    );
    if (
      !nextEntry.imageUrl &&
      !hasGallery &&
      !nextEntry.problem &&
      !nextEntry.solution &&
      !nextEntry.impact &&
      !hasSteps &&
      !nextEntry.deliverables &&
      !hasBeforeAfter &&
      !hasSnippet
    ) {
      const nextMap = { ...projectEnhancements };
      delete nextMap[projectId];
      patchOverrides({
        projectEnhancements: Object.keys(nextMap).length > 0 ? nextMap : undefined,
      });
      return;
    }
    patchOverrides({
      projectEnhancements: {
        ...projectEnhancements,
        [projectId]: nextEntry,
      },
    });
  }

  function toggleHiddenSection(key: WebsiteSectionKey) {
    const exists = hiddenSections.includes(key);
    const next = exists
      ? hiddenSections.filter((s) => s !== key)
      : [...hiddenSections, key];
    patchOverrides({ hiddenSections: next.length > 0 ? next : undefined });
  }

  const tabs: Array<{ id: WebsiteEditorTab; label: string; icon: typeof User }> = [
    { id: 'hero', label: 'Hero & Bio', icon: User },
    { id: 'metrics', label: 'Metrics & Cards', icon: BarChart3 },
    { id: 'skills', label: 'Skills', icon: Layers },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'credentials', label: 'Credentials', icon: GraduationCap },
    { id: 'visibility', label: 'Show / Hide', icon: Eye },
  ];

  const isHeroCustom =
    ov.name !== undefined ||
    ov.title !== undefined ||
    ov.summary !== undefined ||
    ov.email !== undefined ||
    ov.phone !== undefined ||
    ov.location !== undefined ||
    ov.linkedin !== undefined ||
    ov.github !== undefined ||
    ov.website !== undefined ||
    ov.heroPhotoSrc !== undefined;

  return (
    <>
      <div
        className="no-print fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        aria-label="Website Content Editor"
        className="no-print fixed inset-y-0 right-0 z-50 w-[96vw] sm:w-full max-w-2xl rounded-l-3xl sm:rounded-none overflow-y-auto border-l border-slate-800 bg-[#090E1A] text-slate-100 shadow-2xl flex flex-col"
      >
        {/* Sticky Top Header + Tabs */}
        <div className="sticky top-0 z-10 bg-[#080D1A]/95 backdrop-blur border-b border-slate-800/90">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Live Website Content Editor</span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                এখানের পরিবর্তন শুধু ওয়েবসাইটে সেভ হবে — A4 CV বা PDF বদলাবে না
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center justify-center shrink-0"
              aria-label="Close Website Content Editor"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Non-Destructive Layer Explanation + Global CV Merge Bar */}
          <div className="px-4 sm:px-5 py-2 bg-[#0B1221] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                CV Protected ·{' '}
                <strong className="text-white">
                  {customSectionCount > 0
                    ? `${customSectionCount}টি সেকশন Website-Only`
                    : 'সব সেকশন CV থেকে Auto-Synced'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleMergeAllNewFromCV}
                className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-300 font-semibold flex items-center gap-1 transition whitespace-nowrap"
                title="আপনার কাস্টম এডিট রেখেই CV/PDF-এর নতুন আইটেম যোগ করুন"
              >
                <GitMerge className="w-3 h-3" />
                <span>Pull New from CV</span>
              </button>

              {customSectionCount > 0 && !confirmResetAll && (
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 font-semibold flex items-center gap-1 transition whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}

              {confirmResetAll && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdatePortfolio((prev) => ({
                        ...prev,
                        websiteOverrides: undefined,
                      }));
                      setConfirmResetAll(false);
                      onShowToast?.(
                        'সব ওয়েবসাইট কাস্টম ওভাররাইড রিসেট হয়ে Master CV থেকে সিঙ্ক হয়েছে।',
                        'info'
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition whitespace-nowrap"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex flex-nowrap overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 border-t border-slate-800/80 bg-[#0B1221] px-3 sm:px-4 py-2">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-[#111827] border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 p-4 sm:p-5 pb-20 sm:pb-8 space-y-4 text-xs">
          {/* TAB 1: HERO & BIO */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill isCustom={isHeroCustom} />
                {isHeroCustom && (
                  <button
                    type="button"
                    onClick={() =>
                      clearOverrideKeys(
                        [
                          'name',
                          'title',
                          'summary',
                          'email',
                          'phone',
                          'location',
                          'linkedin',
                          'github',
                          'website',
                          'heroPhotoSrc',
                        ],
                        'Hero & Bio'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Hero to CV
                  </button>
                )}
              </div>

              {/* Availability Status */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-slate-200">Availability Status Badge</span>
                  <input
                    type="checkbox"
                    checked={portfolio.availabilityActive !== false}
                    onChange={(e) =>
                      onUpdatePortfolio((prev) => ({
                        ...prev,
                        availabilityActive: e.target.checked,
                      }))
                    }
                    className="accent-emerald-500 w-4 h-4"
                  />
                </label>
                <input
                  type="text"
                  value={portfolio.availabilityText}
                  onChange={(e) =>
                    onUpdatePortfolio((prev) => ({
                      ...prev,
                      availabilityText: e.target.value,
                    }))
                  }
                  className="w-full min-h-[40px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-xs text-white"
                  placeholder="Availability text..."
                />
              </div>

              {/* Website Photo (Separate from CV photo if uploaded) */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 flex items-center gap-3.5">
                <img
                  src={ov.heroPhotoSrc || cvPhotoSrc}
                  alt={ov.name ?? cvData.name}
                  className="w-16 h-20 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="text-xs font-bold text-white">
                    Website Portrait Photo{' '}
                    <span className="text-[10.5px] font-normal text-slate-400">
                      ({ov.heroPhotoSrc ? 'Website-Only' : 'From CV'})
                    </span>
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWebsitePhotoUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" /> Change Website Photo
                    </button>
                    {ov.heroPhotoSrc && (
                      <button
                        type="button"
                        onClick={() => clearOverrideKeys(['heroPhotoSrc'], 'Website Photo')}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Use CV Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name, Headline & Bio */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Website Display Name
                  </label>
                  <input
                    type="text"
                    value={ov.name ?? cvData.name}
                    onChange={(e) => patchOverrides({ name: e.target.value })}
                    className="w-full min-h-[42px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Website Headline / Role Title
                  </label>
                  <input
                    type="text"
                    value={ov.title ?? cvData.title}
                    onChange={(e) => patchOverrides({ title: e.target.value })}
                    className="w-full min-h-[42px] rounded-lg bg-[#080D1A] border border-slate-700 px-3 text-xs font-semibold text-cyan-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Website Intro / About Summary (এখানে CV-র চেয়ে বড় বা আলাদা বায়ো লিখতে পারেন)
                  </label>
                  <textarea
                    rows={5}
                    value={ov.summary ?? cvData.summary}
                    onChange={(e) => patchOverrides({ summary: e.target.value })}
                    className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-3 text-xs text-slate-100 leading-relaxed"
                  />
                </div>
              </div>

              {/* Direct Links & Coordinates */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <div className="font-bold text-slate-200 text-xs">
                  Website Links &amp; Direct Coordinates
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] text-slate-400 mb-1">Email</label>
                    <input
                      type="text"
                      value={ov.email ?? cvEmail}
                      onChange={(e) => patchOverrides({ email: e.target.value })}
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-slate-400 mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={ov.phone ?? cvPhone}
                      onChange={(e) => patchOverrides({ phone: e.target.value })}
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={ov.location ?? cvLocation}
                      onChange={(e) => patchOverrides({ location: e.target.value })}
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-slate-400 mb-1">Personal Website URL</label>
                    <input
                      type="text"
                      value={ov.website ?? cvWebsite}
                      onChange={(e) => patchOverrides({ website: e.target.value })}
                      placeholder="https://..."
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-cyan-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={ov.linkedin ?? cvLinkedin}
                      onChange={(e) => patchOverrides({ linkedin: e.target.value })}
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-blue-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="text"
                      value={ov.github ?? cvGithub}
                      onChange={(e) => patchOverrides({ github: e.target.value })}
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METRICS & SPECIALIZATION PILLARS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {/* Quantitative Metrics Strip */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white">4-Column Impact Numbers</div>
                  <span className="text-[10.5px] text-emerald-300 font-semibold">Website-Only</span>
                </div>
                {safeMetrics.map((m, idx) => (
                  <div key={m.id} className="grid grid-cols-5 gap-2">
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => {
                        const updated = safeMetrics.map((item, i) =>
                          i === idx ? { ...item, value: e.target.value } : item
                        );
                        onUpdatePortfolio((prev) => ({ ...prev, metrics: updated }));
                      }}
                      className="col-span-2 min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-cyan-300 tabular-nums"
                    />
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const updated = safeMetrics.map((item, i) =>
                          i === idx ? { ...item, label: e.target.value } : item
                        );
                        onUpdatePortfolio((prev) => ({ ...prev, metrics: updated }));
                      }}
                      className="col-span-3 min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                    />
                  </div>
                ))}
              </div>

              {/* 3 Specialization Cards */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-white">3 Hero Specialization Cards</div>
                  {ov.specializations && (
                    <button
                      type="button"
                      onClick={() => clearOverrideKeys(['specializations'], 'Specialization Cards')}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10.5px] text-slate-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Restore Default
                    </button>
                  )}
                </div>

                {siteSpecializations.map((card, idx) => (
                  <div
                    key={card.id}
                    className={`space-y-2 ${idx > 0 ? 'pt-3 border-t border-slate-800/80' : ''}`}
                  >
                    <div className="grid grid-cols-5 gap-2">
                      <input
                        type="text"
                        value={card.label}
                        onChange={(e) => {
                          const next = siteSpecializations.map((c, i) =>
                            i === idx ? { ...c, label: e.target.value } : c
                          );
                          patchOverrides({ specializations: next });
                        }}
                        placeholder="Card Title"
                        className="col-span-3 min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-white"
                      />
                      <input
                        type="text"
                        value={card.metric}
                        onChange={(e) => {
                          const next = siteSpecializations.map((c, i) =>
                            i === idx ? { ...c, metric: e.target.value } : c
                          );
                          patchOverrides({ specializations: next });
                        }}
                        placeholder="Metric Badge"
                        className="col-span-2 min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-mono text-emerald-300"
                      />
                    </div>
                    <input
                      type="text"
                      value={card.proof}
                      onChange={(e) => {
                        const next = siteSpecializations.map((c, i) =>
                          i === idx ? { ...c, proof: e.target.value } : c
                        );
                        patchOverrides({ specializations: next });
                      }}
                      placeholder="Proof points..."
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill isCustom={ov.skills !== undefined || ov.skillsIntro !== undefined} />
                <div className="flex flex-wrap items-center gap-1.5">
                  {ov.skills !== undefined && (
                    <button
                      type="button"
                      onClick={handleMergeNewSkillsFromCV}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <GitMerge className="w-3 h-3" /> Merge New from CV
                    </button>
                  )}
                  {(ov.skills !== undefined || ov.skillsIntro !== undefined) && (
                    <button
                      type="button"
                      onClick={() => clearOverrideKeys(['skills', 'skillsIntro'], 'Skills Section')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to CV
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Skills Section Subtitle (Website-Only)
                </label>
                <input
                  type="text"
                  value={
                    ov.skillsIntro ??
                    'Data Analytics · Software QA · Cloud APIs · Enterprise Infrastructure'
                  }
                  onChange={(e) => patchOverrides({ skillsIntro: e.target.value })}
                  className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                />
              </div>

              {siteSkills.map((s: SkillRow, idx) => (
                <div
                  key={s.id}
                  className="rounded-xl bg-[#0D1424] border border-slate-800 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-cyan-300">
                      Skill Domain #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          patchOverrides({ skills: arrayMove(siteSkills, idx, idx - 1) })
                        }
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === siteSkills.length - 1}
                        onClick={() =>
                          patchOverrides({ skills: arrayMove(siteSkills, idx, idx + 1) })
                        }
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchOverrides({ skills: siteSkills.filter((_, i) => i !== idx) })
                        }
                        className="p-1.5 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={s.category}
                    onChange={(e) =>
                      patchOverrides({
                        skills: siteSkills.map((item, i) =>
                          i === idx ? { ...item, category: e.target.value } : item
                        ),
                      })
                    }
                    className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-white"
                  />
                  <textarea
                    rows={2}
                    value={s.competencies}
                    onChange={(e) =>
                      patchOverrides({
                        skills: siteSkills.map((item, i) =>
                          i === idx ? { ...item, competencies: e.target.value } : item
                        ),
                      })
                    }
                    className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-xs text-slate-200"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  patchOverrides({
                    skills: [
                      ...siteSkills,
                      {
                        id: 'ws_s_' + Date.now(),
                        category: 'Website-Only Skill Domain',
                        competencies: 'Tools, Frameworks, Methodologies...',
                      },
                    ],
                  })
                }
                className="w-full min-h-[42px] rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Website-Only Skill Domain
              </button>
            </div>
          )}

          {/* TAB 4: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill
                  isCustom={ov.experiences !== undefined || ov.experienceIntro !== undefined}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  {ov.experiences !== undefined && (
                    <button
                      type="button"
                      onClick={handleMergeNewExperiencesFromCV}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <GitMerge className="w-3 h-3" /> Merge New from CV
                    </button>
                  )}
                  {(ov.experiences !== undefined || ov.experienceIntro !== undefined) && (
                    <button
                      type="button"
                      onClick={() =>
                        clearOverrideKeys(
                          ['experiences', 'experienceIntro'],
                          'Experience Section'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to CV
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Experience Section Subtitle (Website-Only)
                </label>
                <input
                  type="text"
                  value={
                    ov.experienceIntro ??
                    'Verified industry track record · Production operations · Measurable outcomes'
                  }
                  onChange={(e) => patchOverrides({ experienceIntro: e.target.value })}
                  className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                />
              </div>

              {siteExperiences.map((exp: ExperienceItem, idx) => (
                <div
                  key={exp.id}
                  className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-300">Role #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          patchOverrides({
                            experiences: arrayMove(siteExperiences, idx, idx - 1),
                          })
                        }
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === siteExperiences.length - 1}
                        onClick={() =>
                          patchOverrides({
                            experiences: arrayMove(siteExperiences, idx, idx + 1),
                          })
                        }
                        className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchOverrides({
                            experiences: siteExperiences.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1.5 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) =>
                      patchOverrides({
                        experiences: siteExperiences.map((item, i) =>
                          i === idx ? { ...item, role: e.target.value } : item
                        ),
                      })
                    }
                    placeholder="Role Title"
                    className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-white"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        patchOverrides({
                          experiences: siteExperiences.map((item, i) =>
                            i === idx ? { ...item, company: e.target.value } : item
                          ),
                        })
                      }
                      placeholder="Company"
                      className="min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-blue-300"
                    />
                    <input
                      type="text"
                      value={exp.date}
                      onChange={(e) =>
                        patchOverrides({
                          experiences: siteExperiences.map((item, i) =>
                            i === idx ? { ...item, date: e.target.value } : item
                          ),
                        })
                      }
                      placeholder="Date Range"
                      className="min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) =>
                        patchOverrides({
                          experiences: siteExperiences.map((item, i) =>
                            i === idx ? { ...item, location: e.target.value } : item
                          ),
                        })
                      }
                      placeholder="Location"
                      className="min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    {exp.bullets.map((b, bIdx) => (
                      <div key={b.id} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={b.text}
                          onChange={(e) =>
                            patchOverrides({
                              experiences: siteExperiences.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      bullets: item.bullets.map((bul, bi) =>
                                        bi === bIdx ? { ...bul, text: e.target.value } : bul
                                      ),
                                    }
                                  : item
                              ),
                            })
                          }
                          className="flex-1 rounded-lg bg-[#080D1A] border border-slate-700 p-2 text-xs text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            patchOverrides({
                              experiences: siteExperiences.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      bullets: item.bullets.filter((_, bi) => bi !== bIdx),
                                    }
                                  : item
                              ),
                            })
                          }
                          className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 shrink-0"
                          title="Delete Bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        patchOverrides({
                          experiences: siteExperiences.map((item, i) =>
                            i === idx
                              ? {
                                  ...item,
                                  bullets: [
                                    ...item.bullets,
                                    {
                                      id: 'ws_b_' + Date.now(),
                                      text: '<strong>Impact:</strong> Describe outcome for website visitors...',
                                    },
                                  ],
                                }
                              : item
                          ),
                        })
                      }
                      className="w-full min-h-[36px] rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-blue-300 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  patchOverrides({
                    experiences: [
                      ...siteExperiences,
                      {
                        id: 'ws_e_' + Date.now(),
                        role: 'Website-Only Experience / Consulting Role',
                        company: 'Organization Name',
                        date: 'Month Year - Present',
                        location: 'Remote / Chattogram',
                        bullets: [
                          {
                            id: 'ws_b_' + Date.now(),
                            text: '<strong>Impact:</strong> Detailed achievement shown only on your live website.',
                          },
                        ],
                      },
                    ],
                  })
                }
                className="w-full min-h-[42px] rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Website-Only Role
              </button>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill
                  isCustom={ov.projects !== undefined || ov.projectsIntro !== undefined}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  {ov.projects !== undefined && (
                    <button
                      type="button"
                      onClick={handleMergeNewProjectsFromCV}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <GitMerge className="w-3 h-3" /> Merge New from CV
                    </button>
                  )}
                  {(ov.projects !== undefined || ov.projectsIntro !== undefined) && (
                    <button
                      type="button"
                      onClick={() =>
                        clearOverrideKeys(['projects', 'projectsIntro'], 'Projects Section')
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to CV
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Projects Section Subtitle (Website-Only)
                </label>
                <input
                  type="text"
                  value={
                    ov.projectsIntro ??
                    'Tap any project card to inspect architecture, methodology, and deliverables'
                  }
                  onChange={(e) => patchOverrides({ projectsIntro: e.target.value })}
                  className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                />
              </div>

              {siteProjects.map((proj: ProjectItem, idx) => {
                const enh = projectEnhancements[proj.id] || {};
                const fileInputId = `proj-img-${proj.id}`;
                const galleryInputId = `proj-gallery-${proj.id}`;
                const galleryUrls = enh.galleryUrls || [];
                return (
                  <div
                    key={proj.id}
                    className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-purple-300">Project #{idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            patchOverrides({ projects: arrayMove(siteProjects, idx, idx - 1) })
                          }
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === siteProjects.length - 1}
                          onClick={() =>
                            patchOverrides({ projects: arrayMove(siteProjects, idx, idx + 1) })
                          }
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            patchOverrides({
                              projects: siteProjects.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1.5 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) =>
                        patchOverrides({
                          projects: siteProjects.map((p, i) =>
                            i === idx ? { ...p, title: e.target.value } : p
                          ),
                        })
                      }
                      placeholder="Project Title"
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-white"
                    />
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) =>
                        patchOverrides({
                          projects: siteProjects.map((p, i) =>
                            i === idx ? { ...p, technologies: e.target.value } : p
                          ),
                        })
                      }
                      placeholder="Technologies (comma separated)"
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-cyan-300 font-mono"
                    />
                    <input
                      type="text"
                      value={proj.url}
                      onChange={(e) =>
                        patchOverrides({
                          projects: siteProjects.map((p, i) =>
                            i === idx ? { ...p, url: e.target.value } : p
                          ),
                        })
                      }
                      placeholder="GitHub / Live Demo URL"
                      className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-300 font-mono"
                    />
                    <textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) =>
                        patchOverrides({
                          projects: siteProjects.map((p, i) =>
                            i === idx ? { ...p, description: e.target.value } : p
                          ),
                        })
                      }
                      placeholder="Full Website Case Study Description..."
                      className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-xs text-slate-200 leading-relaxed"
                    />

                    {/* Website-Only Case Study Enrichment (Screenshot + Problem/Solution/Impact) */}
                    <div className="pt-2.5 mt-1 border-t border-slate-800/80 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-emerald-300">
                          Website Case Study Media &amp; Impact (CV-তে যাবে না)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            id={fileInputId}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProjectImageUpload(proj.id, e)}
                            className="hidden"
                          />
                          <label
                            htmlFor={fileInputId}
                            className="cursor-pointer px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-cyan-300 inline-flex items-center gap-1"
                          >
                            <ImagePlus className="w-3.5 h-3.5" />
                            <span>{enh.imageUrl ? 'Change Screenshot' : 'Add Screenshot'}</span>
                          </label>
                          {enh.imageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                updateProjectEnhancement(proj.id, { imageUrl: undefined })
                              }
                              className="px-2 py-1 rounded-lg bg-rose-950/50 border border-rose-500/30 text-[11px] text-rose-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {enh.imageUrl && (
                        <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-[16/9]">
                          <img
                            src={enh.imageUrl}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Additional Case Study Gallery Screenshots (max 4) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10.5px] font-semibold text-slate-400">
                            Extra Gallery Screenshots ({galleryUrls.length}/4)
                          </span>
                          <div>
                            <input
                              id={galleryInputId}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleProjectGalleryUpload(proj.id, e)}
                              className="hidden"
                            />
                            <label
                              htmlFor={galleryInputId}
                              className="cursor-pointer px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10.5px] font-semibold text-slate-300 inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3 text-cyan-400" />
                              <span>Add Gallery Shots</span>
                            </label>
                          </div>
                        </div>

                        {galleryUrls.length > 0 && (
                          <div className="grid grid-cols-4 gap-1.5">
                            {galleryUrls.map((gUrl, gIdx) => (
                              <div
                                key={gIdx}
                                className="relative rounded-md overflow-hidden border border-slate-700 bg-slate-950 aspect-[16/10] group/gal"
                              >
                                <img
                                  src={gUrl}
                                  alt={`${proj.title} screenshot ${gIdx + 2}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateProjectEnhancement(proj.id, {
                                      galleryUrls:
                                        galleryUrls.length > 1
                                          ? galleryUrls.filter((_, gi) => gi !== gIdx)
                                          : undefined,
                                    })
                                  }
                                  className="absolute top-0.5 right-0.5 p-0.5 rounded bg-rose-950/90 text-rose-200 hover:bg-rose-600"
                                  title="Remove gallery image"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={enh.problem || ''}
                          onChange={(e) =>
                            updateProjectEnhancement(proj.id, {
                              problem: e.target.value || undefined,
                            })
                          }
                          placeholder="01 Problem: What challenge existed?"
                          className="w-full min-h-[36px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2.5 text-xs text-slate-200 placeholder-slate-500"
                        />
                        <input
                          type="text"
                          value={enh.solution || ''}
                          onChange={(e) =>
                            updateProjectEnhancement(proj.id, {
                              solution: e.target.value || undefined,
                            })
                          }
                          placeholder="02 Solution: Architecture / approach built"
                          className="w-full min-h-[36px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2.5 text-xs text-slate-200 placeholder-slate-500"
                        />
                        <input
                          type="text"
                          value={enh.impact || ''}
                          onChange={(e) =>
                            updateProjectEnhancement(proj.id, {
                              impact: e.target.value || undefined,
                            })
                          }
                          placeholder="03 Impact: e.g. 42% faster reporting · 50k+ rows automated"
                          className="w-full min-h-[36px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2.5 text-xs text-emerald-300 placeholder-slate-500"
                        />
                        <textarea
                          rows={3}
                          value={(enh.architectureSteps || []).join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n');
                            const hasAny = lines.some((l) => l.trim().length > 0);
                            updateProjectEnhancement(proj.id, {
                              architectureSteps: hasAny ? lines : undefined,
                            });
                          }}
                          placeholder="Architecture Workflow Steps (1 step per line, optional — auto-generated if empty)"
                          className="w-full rounded-lg bg-[#080D1A] border border-slate-700/80 p-2.5 text-xs text-cyan-200 placeholder-slate-500 leading-relaxed"
                        />
                        <input
                          type="text"
                          value={enh.deliverables || ''}
                          onChange={(e) =>
                            updateProjectEnhancement(proj.id, {
                              deliverables: e.target.value || undefined,
                            })
                          }
                          placeholder="Key Deliverables (optional): e.g. Executive PBIX · SQL Views · Test Suite"
                          className="w-full min-h-[36px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2.5 text-xs text-slate-200 placeholder-slate-500"
                        />
                        <div className="pt-1.5 border-t border-slate-800/70 space-y-1.5">
                          <div className="text-[10.5px] font-semibold text-slate-400">
                            Before vs After Impact Card (Optional)
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={enh.beforeAfterImpact?.beforeLabel || ''}
                              onChange={(e) =>
                                updateProjectEnhancement(proj.id, {
                                  beforeAfterImpact: {
                                    beforeLabel: e.target.value,
                                    beforeValue: enh.beforeAfterImpact?.beforeValue || '',
                                    afterLabel: enh.beforeAfterImpact?.afterLabel || '',
                                    afterValue: enh.beforeAfterImpact?.afterValue || '',
                                  },
                                })
                              }
                              placeholder="Before label (e.g. Manual Recon)"
                              className="w-full min-h-[34px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2 text-[11px] text-slate-300 placeholder-slate-500"
                            />
                            <input
                              type="text"
                              value={enh.beforeAfterImpact?.beforeValue || ''}
                              onChange={(e) =>
                                updateProjectEnhancement(proj.id, {
                                  beforeAfterImpact: {
                                    beforeLabel: enh.beforeAfterImpact?.beforeLabel || '',
                                    beforeValue: e.target.value,
                                    afterLabel: enh.beforeAfterImpact?.afterLabel || '',
                                    afterValue: enh.beforeAfterImpact?.afterValue || '',
                                  },
                                })
                              }
                              placeholder="Before metric (e.g. 4 hrs / cycle)"
                              className="w-full min-h-[34px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2 text-[11px] text-rose-300 placeholder-slate-500"
                            />
                            <input
                              type="text"
                              value={enh.beforeAfterImpact?.afterLabel || ''}
                              onChange={(e) =>
                                updateProjectEnhancement(proj.id, {
                                  beforeAfterImpact: {
                                    beforeLabel: enh.beforeAfterImpact?.beforeLabel || '',
                                    beforeValue: enh.beforeAfterImpact?.beforeValue || '',
                                    afterLabel: e.target.value,
                                    afterValue: enh.beforeAfterImpact?.afterValue || '',
                                  },
                                })
                              }
                              placeholder="After label (e.g. Automated ETL)"
                              className="w-full min-h-[34px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2 text-[11px] text-slate-300 placeholder-slate-500"
                            />
                            <input
                              type="text"
                              value={enh.beforeAfterImpact?.afterValue || ''}
                              onChange={(e) =>
                                updateProjectEnhancement(proj.id, {
                                  beforeAfterImpact: {
                                    beforeLabel: enh.beforeAfterImpact?.beforeLabel || '',
                                    beforeValue: enh.beforeAfterImpact?.beforeValue || '',
                                    afterLabel: enh.beforeAfterImpact?.afterLabel || '',
                                    afterValue: e.target.value,
                                  },
                                })
                              }
                              placeholder="After metric (e.g. 8 mins · 99.9%)"
                              className="w-full min-h-[34px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2 text-[11px] text-emerald-300 placeholder-slate-500"
                            />
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-slate-800/70 space-y-1.5">
                          <div className="text-[10.5px] font-semibold text-slate-400">
                            Technical Blueprint Snippet (Optional — SQL, Postman, or Code Sample)
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <input
                              type="text"
                              value={enh.technicalSnippet?.label || ''}
                              onChange={(e) =>
                                updateProjectEnhancement(proj.id, {
                                  technicalSnippet: {
                                    label: e.target.value,
                                    language: enh.technicalSnippet?.language || 'SQL',
                                    code: enh.technicalSnippet?.code || '',
                                  },
                                })
                              }
                              placeholder="Title (e.g. Reconciliation Query)"
                              className="col-span-2 min-h-[34px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2 text-[11px] text-slate-200 placeholder-slate-500"
                            />
                            <input
                              type="text"
                              value={enh.technicalSnippet?.language || ''}
                              onChange={(e) =>
                                updateProjectEnhancement(proj.id, {
                                  technicalSnippet: {
                                    label: enh.technicalSnippet?.label || '',
                                    language: e.target.value,
                                    code: enh.technicalSnippet?.code || '',
                                  },
                                })
                              }
                              placeholder="Lang (SQL/JS)"
                              className="col-span-1 min-h-[34px] rounded-lg bg-[#080D1A] border border-slate-700/80 px-2 text-[11px] font-mono text-cyan-300 placeholder-slate-500"
                            />
                          </div>
                          <textarea
                            rows={3}
                            value={enh.technicalSnippet?.code || ''}
                            onChange={(e) =>
                              updateProjectEnhancement(proj.id, {
                                technicalSnippet: {
                                  label: enh.technicalSnippet?.label || '',
                                  language: enh.technicalSnippet?.language || 'SQL',
                                  code: e.target.value,
                                },
                              })
                            }
                            placeholder="Paste SQL / Postman / Test Assertion snippet (auto-generated if blank)"
                            className="w-full rounded-lg bg-[#080D1A] border border-slate-700/80 p-2 text-[11px] font-mono text-emerald-200 placeholder-slate-500 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  patchOverrides({
                    projects: [
                      ...siteProjects,
                      {
                        id: 'ws_p_' + Date.now(),
                        title: 'New Website Showcase Project',
                        url: 'https://github.com/shoyebrabbi',
                        technologies: 'PostgreSQL, Power BI, REST API',
                        description:
                          'Detailed portfolio-only case study that will not clutter your 1-2 page A4 CV.',
                      },
                    ],
                  })
                }
                className="w-full min-h-[42px] rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Website-Only Project
              </button>
            </div>
          )}

          {/* TAB 6: CREDENTIALS, CUSTOM HIGHLIGHTS & CONTACT */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill
                  isCustom={
                    ov.education !== undefined ||
                    ov.certifications !== undefined ||
                    ov.languages !== undefined ||
                    ov.strengths !== undefined ||
                    ov.customSections !== undefined ||
                    ov.contactHeading !== undefined ||
                    ov.contactSubtext !== undefined
                  }
                />
                {(ov.education !== undefined ||
                  ov.certifications !== undefined ||
                  ov.languages !== undefined ||
                  ov.strengths !== undefined ||
                  ov.customSections !== undefined ||
                  ov.contactHeading !== undefined ||
                  ov.contactSubtext !== undefined) && (
                  <button
                    type="button"
                    onClick={() =>
                      clearOverrideKeys(
                        [
                          'education',
                          'certifications',
                          'languages',
                          'strengths',
                          'customSections',
                          'contactHeading',
                          'contactSubtext',
                        ],
                        'Credentials & Highlights'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset All to CV
                  </button>
                )}
              </div>

              {/* Education */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <div className="font-bold text-teal-300">Academic Background</div>
                <input
                  type="text"
                  value={siteEducation.degree}
                  onChange={(e) =>
                    patchOverrides({ education: { ...siteEducation, degree: e.target.value } })
                  }
                  className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-white"
                />
                <input
                  type="text"
                  value={siteEducation.school}
                  onChange={(e) =>
                    patchOverrides({ education: { ...siteEducation, school: e.target.value } })
                  }
                  className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={siteEducation.year}
                    onChange={(e) =>
                      patchOverrides({ education: { ...siteEducation, year: e.target.value } })
                    }
                    className="min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    value={siteEducation.location}
                    onChange={(e) =>
                      patchOverrides({ education: { ...siteEducation, location: e.target.value } })
                    }
                    className="min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-slate-200"
                  />
                </div>
                <textarea
                  rows={2}
                  value={siteEducation.modules}
                  onChange={(e) =>
                    patchOverrides({ education: { ...siteEducation, modules: e.target.value } })
                  }
                  className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-xs text-slate-200"
                />
              </div>

              {/* Certifications */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">
                    Certifications ({siteCertifications.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      patchOverrides({
                        certifications: [...siteCertifications, 'New Website Certification'],
                      })
                    }
                    className="px-2.5 py-1 rounded bg-slate-800 text-xs font-semibold text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {siteCertifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) =>
                        patchOverrides({
                          certifications: siteCertifications.map((c, i) =>
                            i === idx ? e.target.value : c
                          ),
                        })
                      }
                      className="flex-1 min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patchOverrides({
                          certifications: siteCertifications.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Languages & Strengths */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Languages</label>
                  <textarea
                    rows={2}
                    value={ov.languages ?? cvData.languages}
                    onChange={(e) => patchOverrides({ languages: e.target.value })}
                    className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Key Professional Strengths
                  </label>
                  <textarea
                    rows={2}
                    value={ov.strengths ?? cvData.strengths}
                    onChange={(e) => patchOverrides({ strengths: e.target.value })}
                    className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Website-Only Custom Highlight Blocks */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">
                    Website Highlights &amp; Custom Sections ({siteCustomSections.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      patchOverrides({
                        customSections: [
                          ...siteCustomSections,
                          {
                            id: 'ws_cs_' + Date.now(),
                            title: 'Website-Only Highlight / Testimonial',
                            type: 'bullets',
                            content: ['Add publications, awards, testimonials or extra portfolio notes...'],
                          } as CustomSection,
                        ],
                      })
                    }
                    className="px-2.5 py-1 rounded bg-emerald-600/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Block
                  </button>
                </div>

                {siteCustomSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`space-y-2 ${idx > 0 ? 'pt-3 border-t border-slate-800/80' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) =>
                          patchOverrides({
                            customSections: siteCustomSections.map((s, i) =>
                              i === idx ? { ...s, title: e.target.value } : s
                            ),
                          })
                        }
                        className="flex-1 min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patchOverrides({
                            customSections: siteCustomSections.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={sec.content.join('\n')}
                      onChange={(e) =>
                        patchOverrides({
                          customSections: siteCustomSections.map((s, i) =>
                            i === idx ? { ...s, content: e.target.value.split('\n') } : s
                          ),
                        })
                      }
                      placeholder="One bullet per line..."
                      className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-xs text-slate-200"
                    />
                  </div>
                ))}
              </div>

              {/* Contact Section CTA Copy */}
              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <div className="font-bold text-slate-200">Contact Section Heading &amp; Note</div>
                <input
                  type="text"
                  value={ov.contactHeading ?? "Let's Connect & Work Together"}
                  onChange={(e) => patchOverrides({ contactHeading: e.target.value })}
                  className="w-full min-h-[38px] rounded-lg bg-[#080D1A] border border-slate-700 px-2.5 text-xs font-bold text-white"
                />
                <textarea
                  rows={2}
                  value={
                    ov.contactSubtext ??
                    'Open to full-time positions, remote opportunities, and technical consulting in Data Analytics, Software QA, and IT Infrastructure.'
                  }
                  onChange={(e) => patchOverrides({ contactSubtext: e.target.value })}
                  className="w-full rounded-lg bg-[#080D1A] border border-slate-700 p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          )}
          {/* TAB 7: SECTION VISIBILITY (WEBSITE ONLY) */}
          {activeTab === 'visibility' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill isCustom={hiddenSections.length > 0} />
                {hiddenSections.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearOverrideKeys(['hiddenSections'], 'Section Visibility')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Show All Sections
                  </button>
                )}
              </div>

              <div className="rounded-xl bg-[#0D1424] border border-slate-800 p-3.5 space-y-2.5">
                <div className="font-bold text-white text-xs">
                  Live Website Section Visibility
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  এখান থেকে যেকোনো সেকশন শুধু Live Website থেকে লুকিয়ে রাখতে পারেন। আপনার A4 Master CV ও PDF-এ সব সেকশন অক্ষত থাকবে।
                </p>

                <div className="divide-y divide-slate-800/80 pt-1">
                  {(
                    [
                      { key: 'metrics', label: 'Impact Metrics Strip', desc: '4-column quantitative highlights' },
                      { key: 'skills', label: 'Technical Skills & Domains', desc: 'Core competencies matrix' },
                      { key: 'experience', label: 'Professional Work Experience', desc: 'Career timeline & bullets' },
                      { key: 'projects', label: 'Projects & Case Studies', desc: 'Interactive portfolio showcase' },
                      { key: 'education', label: 'Education & Certifications', desc: 'Degree, certs, languages & strengths' },
                      { key: 'highlights', label: 'Additional Highlights', desc: 'Custom Studio sections' },
                      { key: 'contact', label: 'Direct Contact Composer', desc: 'Contact info & recruiter email form' },
                    ] as Array<{ key: WebsiteSectionKey; label: string; desc: string }>
                  ).map((item) => {
                    const isHidden = hiddenSections.includes(item.key);
                    return (
                      <div
                        key={item.key}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white">{item.label}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleHiddenSection(item.key)}
                          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition ${
                            isHidden
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {isHidden ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Hidden
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Visible
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer with Draft vs Publish Live */}
        <div className="sticky bottom-0 z-10 px-4 sm:px-5 py-3 bg-[#080D1A]/95 backdrop-blur border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-[11px] flex items-center gap-1.5 min-w-0">
            {hasUnpublishedDraft ? (
              <span className="text-amber-300 font-semibold truncate">
                Draft Preview (এখনো লাইভ পাবলিশ হয়নি)
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5 truncate">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Live Published · CV Untouched</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasUnpublishedDraft && onDiscardDraft && (
              <button
                type="button"
                onClick={onDiscardDraft}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold transition"
              >
                Discard Draft
              </button>
            )}
            {hasUnpublishedDraft && onPublishDraft && (
              <button
                type="button"
                onClick={onPublishDraft}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" /> Publish Live
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
            >
              Done
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
