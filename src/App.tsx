import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CVData, StudioSettings, CVTemplateKey, PhotoPosition, CVProfile, CustomTemplatePreset } from './types/cv';
import { INITIAL_CV_DATA, INITIAL_SETTINGS, INITIAL_PROFILES } from './data/initialCV';
import {
  exportDirectPDF,
  exportHighResPNG,
  exportWordDoc,
  exportExcel,
  exportCSV,
  exportMarkdown,
  exportPlainText,
  exportHTMLFile,
  exportJSONBackup,
  copyAllCVText,
} from './utils/exporters';
import { Navbar } from './components/Navbar';
import { StyleCombinerDrawer } from './components/StyleCombinerDrawer';
import { UnifiedToolsDrawer } from './components/UnifiedToolsDrawer';
import { CVDocument } from './components/CVDocument';
import { SignatureModal } from './components/SignatureModal';
import { WebPortfolioView } from './components/WebPortfolioView';
import { OwnerLoginModal } from './components/OwnerLoginModal';
import { ExportHubModal } from './components/ExportHubModal';
import { ProfileManagerModal } from './components/ProfileManagerModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import {
  HyperlinkModal,
  ATSAuditModal,
  AddSectionModal,
  ResetModal,
  GitHubDeployModal,
} from './components/Modals';
import {
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  Printer,
  Columns2,
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function App() {
  // Multi-Profile Versions (loaded early to support ?role= shareable URLs)
  const [profiles, setProfiles] = useState<CVProfile[]>(() => {
    try {
      const saved = localStorage.getItem('shoyeb_cv_master_v3_profiles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROFILES;
  });

  // Detect optional ?role= parameter for role-specific live portfolio sharing
  const initialRoleMatch = useMemo(() => {
    try {
      const roleParam = new URLSearchParams(window.location.search).get('role')?.trim().toLowerCase();
      if (!roleParam) return null;
      return (
        profiles.find(
          (p) =>
            p.id.toLowerCase() === roleParam ||
            p.id.toLowerCase() === `prof_${roleParam}` ||
            p.rolePreset.toLowerCase() === roleParam
        ) || null
      );
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load CV data from ?role= profile, localStorage, or initial
  const [cvData, setCvData] = useState<CVData>(() => {
    if (initialRoleMatch) return initialRoleMatch.data;
    try {
      const saved = localStorage.getItem('shoyeb_cv_master_v3_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CV_DATA;
  });

  // Load Settings from ?role= profile, localStorage, or initial
  const [settings, setSettings] = useState<StudioSettings>(() => {
    if (initialRoleMatch) return initialRoleMatch.settings;
    try {
      const saved = localStorage.getItem('shoyeb_cv_master_v3_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETTINGS;
  });

  // Global CV Snapshot Undo / Redo History
  const [historyPast, setHistoryPast] = useState<CVData[]>([]);
  const [historyFuture, setHistoryFuture] = useState<CVData[]>([]);
  const cvDataRef = useRef<CVData>(cvData);
  cvDataRef.current = cvData;

  const applyCVUpdate = useCallback((updater: React.SetStateAction<CVData>) => {
    const prev = cvDataRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      setHistoryPast((past) => [...past.slice(-29), prev]);
      setHistoryFuture([]);
      cvDataRef.current = next;
      setCvData(next);
    }
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = 't_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const handleUndoCV = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const current = cvDataRef.current;
    setHistoryPast((past) => past.slice(0, -1));
    setHistoryFuture((future) => [current, ...future.slice(0, 29)]);
    cvDataRef.current = previous;
    setCvData(previous);
    showToast('পূর্বের CV স্টেট ফিরিয়ে আনা হয়েছে (Undo)', 'info');
  }, [historyPast, showToast]);

  const handleRedoCV = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const current = cvDataRef.current;
    setHistoryFuture((future) => future.slice(1));
    setHistoryPast((past) => [...past.slice(-29), current]);
    cvDataRef.current = next;
    setCvData(next);
    showToast('পরবর্তী CV স্টেটে এগিয়ে যাওয়া হয়েছে (Redo)', 'info');
  }, [historyFuture, showToast]);

  // Drawer toggles
  const [isStudioOpen, setIsStudioOpen] = useState(true);
  const [isUnifiedToolsOpen, setIsUnifiedToolsOpen] = useState(false);

  // Public-first Owner Access Gate (defaults to locked Live Website Mode for visitors)
  const [isStudioUnlocked, setIsStudioUnlocked] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('shoyeb_studio_unlocked') === 'true' ||
        localStorage.getItem('shoyeb_studio_remember') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [ownerPasscode, setOwnerPasscode] = useState<string>(() => {
    try {
      return localStorage.getItem('shoyeb_studio_passcode') || '2026';
    } catch {
      return '2026';
    }
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [exportHubOpen, setExportHubOpen] = useState(false);
  const [profileManagerOpen, setProfileManagerOpen] = useState(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [jdHighlightKeywords, setJdHighlightKeywords] = useState<string[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplatePreset[]>(() => {
    try {
      const saved = localStorage.getItem('shoyeb_cv_master_v3_custom_templates');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Modals state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState<{
    type: 'contact' | 'project' | 'selection';
    id?: string;
    text: string;
    url: string;
  }>({ type: 'selection', text: '', url: 'https://' });

  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  const [activeProfileId, setActiveProfileId] = useState<string>(
    initialRoleMatch ? initialRoleMatch.id : 'prof_master'
  );
  const [activeRoleLabel, setActiveRoleLabel] = useState<string | undefined>(
    initialRoleMatch ? initialRoleMatch.name : undefined
  );
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [sideBySideSpread, setSideBySideSpread] = useState(false);
  const spreadPage1Ref = useRef<HTMLDivElement>(null);
  const spreadPage2Ref = useRef<HTMLDivElement>(null);
  const [docHeight, setDocHeight] = useState<number>(1120);
  const [showPageGuide, setShowPageGuide] = useState(true);

  const showPublicWebsite = !isStudioUnlocked || Boolean(settings.portfolioMode);

  // Keyboard shortcuts: Ctrl/Cmd+Z / Ctrl+Y Undo/Redo, Ctrl/Cmd+P -> A4 Print Preview, Esc -> Exit Focus Mode
  useEffect(() => {
    if (showPublicWebsite) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPrintPreviewOpen(true);
        return;
      }
      if (e.key === 'Escape' && zenMode && !printPreviewOpen) {
        setZenMode(false);
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedoCV();
        } else {
          handleUndoCV();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedoCV();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showPublicWebsite, zenMode, printPreviewOpen, handleUndoCV, handleRedoCV]);

  // Owner Passcode Auth Handlers
  function handleVerifyPasscode(pass: string, remember: boolean): boolean {
    if (pass !== ownerPasscode) return false;
    setIsStudioUnlocked(true);
    try {
      sessionStorage.setItem('shoyeb_studio_unlocked', 'true');
      if (remember) {
        localStorage.setItem('shoyeb_studio_remember', 'true');
      } else {
        localStorage.removeItem('shoyeb_studio_remember');
      }
    } catch (e) {
      console.error(e);
    }
    setSettings((prev) => ({ ...prev, portfolioMode: false }));
    setLoginModalOpen(false);
    showToast('স্বাগতম! Document CV Studio আনলক হয়েছে।', 'success');
    return true;
  }

  function handleLockStudio() {
    setIsStudioUnlocked(false);
    setIsUnifiedToolsOpen(false);
    setExportHubOpen(false);
    setProfileManagerOpen(false);
    try {
      sessionStorage.removeItem('shoyeb_studio_unlocked');
      localStorage.removeItem('shoyeb_studio_remember');
    } catch (e) {
      console.error(e);
    }
    showToast('স্টুডিও লক করা হয়েছে — এখন শুধু আপনার লাইভ ওয়েবসাইট দেখা যাবে।', 'info');
  }

  function handleUpdatePasscode(newPass: string) {
    setOwnerPasscode(newPass);
    try {
      localStorage.setItem('shoyeb_studio_passcode', newPass);
    } catch (e) {
      console.error(e);
    }
    showToast('ওনার পাসকোড সফলভাবে আপডেট হয়েছে!', 'success');
  }

  // Auto-Save to localStorage (only when Document CV Studio is unlocked so public visitors never overwrite owner data)
  useEffect(() => {
    if (!isStudioUnlocked) return;
    try {
      localStorage.setItem('shoyeb_cv_master_v3_data', JSON.stringify(cvData));
    } catch (e) {
      console.error(e);
    }
  }, [cvData, isStudioUnlocked]);

  useEffect(() => {
    if (!isStudioUnlocked) return;
    try {
      localStorage.setItem('shoyeb_cv_master_v3_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings, isStudioUnlocked]);

  useEffect(() => {
    try {
      localStorage.setItem('shoyeb_cv_master_v3_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.error(e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem('shoyeb_cv_master_v3_custom_templates', JSON.stringify(customTemplates));
    } catch (e) {
      console.error(e);
    }
  }, [customTemplates]);

  // Document Height Meter & Overflow Observer
  useEffect(() => {
    const el = document.getElementById('cvDocument');
    if (!el) return;
    const updateHeight = () => {
      if (el.scrollHeight > 0) setDocHeight(el.scrollHeight);
    };
    updateHeight();
    const obs = new ResizeObserver(updateHeight);
    obs.observe(el);
    return () => obs.disconnect();
  }, [cvData, settings, showPublicWebsite]);

  // Synchronize CSS Variables, Dynamic Print @page Rule & Body classes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', settings.themePrimary);
    root.style.setProperty('--theme-secondary', settings.themeBorder);
    root.style.setProperty('--theme-light', settings.themeLight);
    root.style.setProperty('--theme-border', settings.themeBorder);
    root.style.setProperty('--cv-font', settings.cvFont);
    root.style.setProperty('--cv-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--cv-line-height', `${settings.lineHeight}`);
    root.style.setProperty('--cv-section-gap', `${settings.sectionGap}px`);
    root.style.setProperty('--cv-page-padding', `${settings.pagePadding}mm`);
    root.style.setProperty('--cv-text-color', settings.cvTextColor || '#1e293b');
    root.style.setProperty('--cv-paper-bg', settings.cvPaperBg || '#ffffff');
    root.style.setProperty('--sidebar-bg', settings.sidebarBg || settings.themeLight);
    root.style.setProperty('--sidebar-text', settings.sidebarTextColor || 'inherit');
    root.style.setProperty('--sidebar-width', `${settings.sidebarWidthPercent || 33}%`);
    root.style.setProperty('--photo-width', `${settings.photoSize}px`);
    root.style.setProperty('--photo-height', `${Math.round(settings.photoSize * 1.14)}px`);
    root.style.setProperty('--photo-radius', settings.photoShape);
    root.style.setProperty('--photo-scale', `${settings.photoScale}`);
    root.style.setProperty('--photo-pos-x', `${settings.photoPosX}%`);
    root.style.setProperty('--photo-pos-y', `${settings.photoPosY}%`);

    document.body.classList.toggle('edit-active', settings.isEditMode);
    document.body.classList.toggle('page-split-view', settings.pageSplitView);
    document.body.classList.toggle('print-browser-margins', settings.hideBrowserPrintChrome === false);

    // Dynamic @page margin rule to suppress browser print header/footer (URL/Date/Title) cleanly
    let styleEl = document.getElementById('dynamicPrintPageRule') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamicPrintPageRule';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@media print { @page { size: A4 portrait; margin: ${
      settings.hideBrowserPrintChrome === false ? '9mm 11mm' : '0'
    }; } }`;

    // Bullet style class
    document.body.classList.remove(
      'bullet-disc',
      'bullet-square',
      'bullet-arrow',
      'bullet-check',
      'bullet-dash'
    );
    document.body.classList.add(settings.bulletStyle);
  }, [settings]);

  // Live ATS score calculation with individual category breakdown
  const calculateScore = useCallback(() => {
    let contacts = 0;
    let headings = 0;
    let metrics = 0;
    let keywords = 0;
    let verbs = 0;
    let photo = 0;

    const text = [
      cvData.name,
      cvData.title,
      cvData.summary,
      ...cvData.contacts.map((c) => c.label + ' ' + c.url),
      ...cvData.skills.map((s) => s.category + ' ' + s.competencies),
      ...cvData.experiences.flatMap((e) => [e.role, e.company, ...e.bullets.map((b) => b.text)]),
      ...cvData.projects.map((p) => p.title + ' ' + p.technologies + ' ' + p.description),
      cvData.education.degree,
      cvData.education.school,
      ...cvData.certifications,
    ]
      .join(' ')
      .toLowerCase();

    // 1. Contacts & Clickable Links (15 pts)
    const hasEmail = cvData.contacts.some((c) => c.label.includes('@') || c.url.includes('@'));
    const hasPhone = cvData.contacts.some((c) => /\d{5,}/.test(c.label));
    const hasLinks = cvData.contacts.some((c) => c.url.includes('http') || c.label.includes('github') || c.label.includes('linkedin'));
    const hasLoc = cvData.contacts.some((c) => c.type === 'location' || c.label.toLowerCase().includes('bangladesh') || c.label.toLowerCase().includes('chattogram'));

    if (hasEmail) contacts += 5;
    if (hasPhone) contacts += 4;
    if (hasLinks) contacts += 4;
    if (hasLoc) contacts += 2;

    // 2. Headings & Core Structure (20 pts)
    if (cvData.summary && cvData.summary.trim().length > 40) headings += 5;
    if (cvData.skills && cvData.skills.length >= 3) headings += 5;
    if (cvData.experiences && cvData.experiences.length >= 2) headings += 5;
    if (cvData.education && cvData.education.degree && cvData.education.school) headings += 5;

    // 3. Measurable Quantifiable Numbers (20 pts)
    const metricMatches = (text.match(/(\d+[\d,]*\s*(\+|%|users|cases|records|k|x)?)/g) || []).filter(
      (m) => /\d/.test(m) && m.trim().length > 1
    );
    metrics = Math.min(20, Math.max(5, metricMatches.length * 4));

    // 4. Core Keywords (25 pts)
    const kw = ['sql', 'postgresql', 'power bi', 'power query', 'etl', 'postman', 'rest api', 'jira', 'regression', 'bva', 'ecp', 'erp', 'windows server', 'linux'];
    const matched = kw.filter((k) => text.includes(k));
    keywords = Math.round((matched.length / kw.length) * 25);

    // 5. Strong Action Verbs (10 pts)
    const actionVerbsList = ['managed', 'designed', 'diagnosed', 'executed', 'extracted', 'engineered', 'authored', 'developed', 'automated', 'led', 'analyzed', 'resolved'];
    const foundVerbs = actionVerbsList.filter((v) => text.includes(v));
    verbs = Math.min(10, Math.round((foundVerbs.length / 6) * 10));

    // 6. ATS Layout & Photo Compliance (10 pts)
    const isPhotoHidden = settings.photoPosition === 'hide';
    if (isPhotoHidden) {
      photo = 10; // 100% Strict ATS Compliance (No photo, zero EEOC bias flag)
    } else {
      photo = 0; // Photo included: Standard in BD/Asia (+0%), but docks 10% on strict US/UK/EU ATS
    }

    const total = Math.min(100, Math.max(20, contacts + headings + metrics + keywords + verbs + photo));

    return {
      total,
      contacts,
      headings,
      metrics,
      keywords,
      verbs,
      photo,
      isPhotoHidden,
    };
  }, [cvData, settings.photoPosition]);

  const atsScoreData = calculateScore();
  const score = atsScoreData.total;

  // Word Count, Searchable Text & Scan Time Tracker
  const cvSearchText = useMemo(() => {
    return [
      cvData.name,
      cvData.title,
      cvData.summary,
      ...cvData.contacts.map((c) => c.label),
      ...cvData.skills.flatMap((s) => [s.category, s.competencies]),
      ...cvData.experiences.flatMap((e) => [
        e.role,
        e.company,
        ...e.bullets.map((b) => b.text.replace(/<[^>]*>/g, '')),
      ]),
      ...cvData.projects.flatMap((p) => [p.title, p.technologies, p.description]),
      cvData.education.degree,
      cvData.education.school,
      cvData.education.modules,
      ...cvData.certifications,
      cvData.languages,
      cvData.strengths,
      ...cvData.customSections.flatMap((cs) => [
        cs.title,
        ...cs.content.map((c) => c.replace(/<[^>]*>/g, '')),
      ]),
    ].join(' ');
  }, [cvData]);

  const wordCount = useMemo(() => {
    const words = cvSearchText.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [cvSearchText]);

  const readTimeSeconds = Math.ceil((wordCount / 130) * 60);

  // Real-time Page Overflow & Height Metrics (A4 standard: ~1123px per page at 96dpi)
  const PAGE_PX = 1123;
  const estimatedPages = Math.max(1, Math.ceil(docHeight / PAGE_PX));
  const page1Overflow = docHeight > PAGE_PX && docHeight < PAGE_PX + 180 ? docHeight - PAGE_PX : 0;
  const page2Overflow = docHeight > PAGE_PX * 2 && docHeight < PAGE_PX * 2 + 190 ? docHeight - PAGE_PX * 2 : 0;
  const overflowPx = page1Overflow || page2Overflow;

  // Populate 2-Page Side-by-Side Spread Clones when active
  useEffect(() => {
    if (!sideBySideSpread || showPublicWebsite) return;
    const source = document.getElementById('cvDocument');
    const host1 = spreadPage1Ref.current;
    const host2 = spreadPage2Ref.current;
    if (!source || !host1 || !host2) return;

    const makeCleanClone = (offsetTopPx: number) => {
      const clone = source.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.querySelectorAll('.builder-control').forEach((el) => el.remove());
      clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      if (offsetTopPx > 0) {
        clone.style.marginTop = `-${offsetTopPx}px`;
      }
      return clone;
    };

    host1.innerHTML = '';
    host2.innerHTML = '';
    host1.appendChild(makeCleanClone(0));
    host2.appendChild(makeCleanClone(PAGE_PX));
  }, [sideBySideSpread, showPublicWebsite, cvData, settings, docHeight]);

  // Public Website Role-Lens Switcher (updates active preview & downloadable PDF cleanly)
  function handleSelectPublicProfile(newProfileId: string) {
    if (newProfileId === activeProfileId) return;
    const target = profiles.find((p) => p.id === newProfileId);
    if (!target) return;
    cvDataRef.current = target.data;
    setCvData(target.data);
    setSettings((prev) => ({
      ...target.settings,
      portfolioMode: prev.portfolioMode,
    }));
    setActiveProfileId(target.id);
    setActiveRoleLabel(target.id === 'prof_master' ? undefined : target.name);
    setHistoryPast([]);
    setHistoryFuture([]);
    showToast(`পোর্টফোলিও লেন্স পরিবর্তন হয়েছে: ${target.name}`, 'info');
  }

  // Profile Switching & Custom Profile Manager handlers
  function handleSelectProfile(newProfileId: string) {
    if (newProfileId === activeProfileId) return;

    // Save current active profile state before switching
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfileId
          ? { ...p, data: cvData, settings, updatedAt: new Date().toISOString() }
          : p
      )
    );

    const target = profiles.find((p) => p.id === newProfileId);
    if (target) {
      cvDataRef.current = target.data;
      setCvData(target.data);
      setSettings(target.settings);
      setActiveProfileId(newProfileId);
      setActiveRoleLabel(target.id === 'prof_master' ? undefined : target.name);
      setHistoryPast([]);
      setHistoryFuture([]);
      showToast(`প্রোফাইল ভার্সন "${target.name}" লোড হয়েছে!`, 'success');
    }
  }

  function handleCreateProfile(name: string, description: string, baseProfileId: string) {
    const sourceProfile =
      baseProfileId === activeProfileId
        ? { data: cvData, settings }
        : profiles.find((p) => p.id === baseProfileId) || { data: cvData, settings };

    const newProfile: CVProfile = {
      id: 'prof_' + Date.now(),
      name,
      description,
      rolePreset: 'custom',
      data: JSON.parse(JSON.stringify(sourceProfile.data)),
      settings: JSON.parse(JSON.stringify(sourceProfile.settings)),
      updatedAt: new Date().toISOString(),
    };

    setProfiles((prev) => [
      ...prev.map((p) =>
        p.id === activeProfileId
          ? { ...p, data: cvData, settings, updatedAt: new Date().toISOString() }
          : p
      ),
      newProfile,
    ]);
    cvDataRef.current = newProfile.data;
    setCvData(newProfile.data);
    setSettings(newProfile.settings);
    setActiveProfileId(newProfile.id);
    setHistoryPast([]);
    setHistoryFuture([]);
    showToast(`নতুন কাস্টম প্রোফাইল "${name}" তৈরি ও লোড হয়েছে!`, 'success');
  }

  function handleRenameProfile(id: string, newName: string) {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
      )
    );
    showToast(`প্রোফাইলের নাম পরিবর্তন করে "${newName}" করা হয়েছে!`, 'success');
  }

  function handleDeleteProfile(id: string) {
    if (id === 'prof_master') return;
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (activeProfileId === id) {
      const fallback = remaining.find((p) => p.id === 'prof_master') || remaining[0];
      if (fallback) {
        cvDataRef.current = fallback.data;
        setCvData(fallback.data);
        setSettings(fallback.settings);
        setActiveProfileId(fallback.id);
        setHistoryPast([]);
        setHistoryFuture([]);
      }
    }
    showToast('কাস্টম প্রোফাইল ডিলিট করা হয়েছে।', 'info');
  }

  function handleCopyShareLink(url: string, profileName: string) {
    navigator.clipboard.writeText(url);
    showToast(`"${profileName}" এর শেয়ারযোগ্য রোল লিংক কপি হয়েছে!`, 'success');
  }

  // 1-Click Page Auto-Fit Handlers
  function handleAutoFit1Page() {
    setSettings((prev) => ({
      ...prev,
      fontSize: 11.2,
      lineHeight: 1.3,
      sectionGap: 8,
      pagePadding: 8,
    }));
    showToast('⚡ ১-পৃষ্ঠা অটো-ফিট স্পেসিং প্রয়োগ হয়েছে (11.2px / 8mm)', 'success');
  }

  function handleAutoFit2Pages() {
    setSettings((prev) => ({
      ...prev,
      fontSize: 12.4,
      lineHeight: 1.44,
      sectionGap: 13,
      pagePadding: 11,
    }));
    showToast('📄 ২-পৃষ্ঠা এক্সিকিউটিভ স্পেসিং প্রয়োগ হয়েছে (12.4px / 11mm)', 'success');
  }

  // Digital Signature Save Handler
  function handleSaveSignature(signatureDataUrl: string, candidateName: string, date: string) {
    setSettings((prev) => ({
      ...prev,
      signature: {
        ...prev.signature,
        enabled: true,
        image: signatureDataUrl,
        name: candidateName,
        date: date,
      },
    }));
    setSignatureModalOpen(false);
    showToast('ডিজিটাল সিগনেচার ও ঘোষণা সফলভাবে যুক্ত হয়েছে!', 'success');
  }

  // Canvas Zoom Handlers
  function handleZoomChange(delta: number) {
    setSettings((prev) => {
      const cur = prev.zoomLevel || 1;
      const next = Math.min(1.5, Math.max(0.5, Math.round((cur + delta) * 10) / 10));
      return { ...prev, zoomLevel: next };
    });
  }

  function handleResetZoom() {
    setSettings((prev) => ({ ...prev, zoomLevel: 1 }));
  }

  // Custom Template Builder & Manager handlers
  function handleSaveCustomTemplate(name: string, description: string) {
    const snapshot: Partial<StudioSettings> = {
      template: settings.template,
      photoPosition: settings.photoPosition,
      headerStyle: settings.headerStyle,
      headerAlign: settings.headerAlign,
      showHeader: settings.showHeader,
      showHeaderDivider: settings.showHeaderDivider,
      showTitle: settings.showTitle,
      showContacts: settings.showContacts,
      bodyColumns: settings.bodyColumns,
      sectionHeading: settings.sectionHeading,
      skillsMode: settings.skillsMode,
      bulletStyle: settings.bulletStyle,
      themePrimary: settings.themePrimary,
      themeLight: settings.themeLight,
      themeBorder: settings.themeBorder,
      cvTextColor: settings.cvTextColor,
      cvPaperBg: settings.cvPaperBg,
      sidebarBg: settings.sidebarBg,
      sidebarTextColor: settings.sidebarTextColor,
      sidebarWidthPercent: settings.sidebarWidthPercent,
      sidebarSections: settings.sidebarSections,
      sectionTitles: settings.sectionTitles,
      cvFont: settings.cvFont,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      sectionGap: settings.sectionGap,
      pagePadding: settings.pagePadding,
      photoShape: settings.photoShape,
      photoSize: settings.photoSize,
      showFooter: settings.showFooter,
      footerNote: settings.footerNote,
      footerRightText: settings.footerRightText,
      showFooterPageNum: settings.showFooterPageNum,
      hideBrowserPrintChrome: settings.hideBrowserPrintChrome,
    };
    const preset: CustomTemplatePreset = {
      id: 'ctpl_' + Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
      settingsSnapshot: snapshot,
    };
    setCustomTemplates((prev) => [preset, ...prev]);
    setSettings((prev) => ({ ...prev, customTemplateId: preset.id }));
    showToast(`নতুন কাস্টম টেমপ্লেট "${name}" গ্যালারিতে সেভ হয়েছে!`, 'success');
  }

  function handleSelectCustomTemplate(preset: CustomTemplatePreset) {
    setSettings((prev) => ({
      ...prev,
      ...preset.settingsSnapshot,
      customTemplateId: preset.id,
    }));
    showToast(`কাস্টম টেমপ্লেট "${preset.name}" চালু হয়েছে!`, 'success');
  }

  function handleDeleteCustomTemplate(id: string) {
    setCustomTemplates((prev) => prev.filter((c) => c.id !== id));
    if (settings.customTemplateId === id) {
      setSettings((prev) => ({ ...prev, customTemplateId: undefined }));
    }
    showToast('কাস্টম টেমপ্লেট ডিলিট করা হয়েছে।', 'info');
  }

  function handleImportCustomTemplates(imported: CustomTemplatePreset[]) {
    setCustomTemplates((prev) => [...imported, ...prev]);
    showToast(`${imported.length}টি নতুন টেমপ্লেট ইমপোর্ট হয়েছে!`, 'success');
  }

  // Template switch handler (12 built-in templates cleanly clear custom overrides first)
  function handleSelectTemplate(tpl: CVTemplateKey) {
    setSettings((prev) => ({
      ...prev,
      customTemplateId: undefined,
      sidebarBg: '',
      sidebarTextColor: '',
      cvPaperBg: '#ffffff',
      cvTextColor: '#1e293b',
    }));
    if (tpl === 'bd-corporate') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '1col',
        sectionHeading: 'accent-bar',
        skillsMode: 'table',
        bulletStyle: 'bullet-disc',
        themePrimary: '#0f4c81',
        themeLight: '#f0f7ff',
        themeBorder: '#1e6091',
        cvFont: "'Inter', sans-serif",
        fontSize: 12.4,
        lineHeight: 1.44,
        sectionGap: 13,
        pagePadding: 11,
      }));
      showToast('Template 1: BD Corporate Executive (Right Photo) চালু হয়েছে', 'success');
    } else if (tpl === 'strict-ats') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'hide',
        headerStyle: 'hide',
        bodyColumns: '1col',
        sectionHeading: 'line',
        skillsMode: 'table',
        bulletStyle: 'bullet-disc',
        themePrimary: '#000000',
        themeLight: '#ffffff',
        themeBorder: '#000000',
        cvFont: 'Georgia, serif',
        fontSize: 12.2,
        lineHeight: 1.42,
        sectionGap: 12,
        pagePadding: 12,
      }));
      showToast('Template 2: 100% Strict Harvard ATS Mode চালু হয়েছে!', 'success');
    } else if (tpl === 'original-master') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'left',
        headerStyle: 'left',
        bodyColumns: '1col',
        sectionHeading: 'accent-bar',
        skillsMode: 'table',
        bulletStyle: 'bullet-disc',
        themePrimary: '#0f4c81',
        themeLight: '#f0f7ff',
        themeBorder: '#1e6091',
        cvFont: "'Inter', sans-serif",
        fontSize: 12.4,
        lineHeight: 1.44,
        sectionGap: 13,
        pagePadding: 11,
      }));
      showToast('Template 3: Original PDF Replica (Left Photo) চালু হয়েছে', 'success');
    } else if (tpl === 'modern-split') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '2col-right',
        sectionHeading: 'pill',
        skillsMode: 'grid',
        bulletStyle: 'bullet-arrow',
        themePrimary: '#1e3a8a',
        themeLight: '#eff6ff',
        themeBorder: '#3b82f6',
        cvFont: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        lineHeight: 1.42,
        sectionGap: 12,
        pagePadding: 10,
      }));
      showToast('Template 4: Modern Silicon Valley Split (Right Sidebar) চালু হয়েছে', 'success');
    } else if (tpl === 'two-col-sidebar') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '2col-left',
        sectionHeading: 'accent-bar',
        skillsMode: 'pills',
        bulletStyle: 'bullet-check',
        themePrimary: '#0f766e',
        themeLight: '#f0fdfa',
        themeBorder: '#14b8a6',
        cvFont: "'Inter', sans-serif",
        fontSize: 12,
        lineHeight: 1.42,
        sectionGap: 12,
        pagePadding: 10,
      }));
      showToast('Template 5: Two-Column Executive Sidebar (Teal) চালু হয়েছে', 'success');
    } else if (tpl === 'data-boxed') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '1col',
        sectionHeading: 'accent-bar',
        skillsMode: 'grid',
        bulletStyle: 'bullet-square',
        themePrimary: '#0f4c81',
        themeLight: '#f0f7ff',
        themeBorder: '#1e6091',
        cvFont: "'Inter', sans-serif",
        fontSize: 12.2,
        lineHeight: 1.42,
        sectionGap: 12,
        pagePadding: 11,
      }));
      showToast('Template 6: Data & SQA Boxed Cards চালু হয়েছে', 'success');
    } else if (tpl === 'compact-onepage') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '1col',
        sectionHeading: 'line',
        skillsMode: 'pills',
        bulletStyle: 'bullet-dash',
        themePrimary: '#0f4c81',
        themeLight: '#f0f7ff',
        themeBorder: '#1e6091',
        cvFont: "'Inter', sans-serif",
        fontSize: 11.1,
        lineHeight: 1.28,
        sectionGap: 8,
        pagePadding: 8,
      }));
      showToast('Template 7: Ultra-Compact 1-Page Fit চালু হয়েছে', 'success');
    } else if (tpl === 'dark-header') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'dark-banner',
        bodyColumns: '1col',
        sectionHeading: 'solid',
        skillsMode: 'table',
        bulletStyle: 'bullet-arrow',
        themePrimary: '#0f2942',
        themeLight: '#f1f5f9',
        themeBorder: '#334155',
        cvFont: "'Inter', sans-serif",
        fontSize: 12.3,
        lineHeight: 1.44,
        sectionGap: 13,
        pagePadding: 11,
      }));
      showToast('Template 8: Dark Header Executive চালু হয়েছে', 'success');
    } else if (tpl === 'exec-ats') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '1col',
        sectionHeading: 'double',
        skillsMode: 'pills',
        bulletStyle: 'bullet-arrow',
        themePrimary: '#7f1d1d',
        themeLight: '#fef2f2',
        themeBorder: '#b91c1c',
        cvFont: "'Merriweather', serif",
        fontSize: 12.3,
        lineHeight: 1.45,
        sectionGap: 14,
        pagePadding: 11,
      }));
      showToast('Template 9: Executive Timeline Pro (Vertical Rail) চালু হয়েছে', 'success');
    } else if (tpl === 'exec-sidebar') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'left',
        headerStyle: 'left',
        bodyColumns: '2col-left',
        sectionHeading: 'accent-bar',
        skillsMode: 'pills',
        bulletStyle: 'bullet-check',
        themePrimary: '#0f2942',
        themeLight: '#f1f5f9',
        themeBorder: '#1e3a8a',
        cvFont: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        lineHeight: 1.42,
        sectionGap: 12,
        pagePadding: 10,
      }));
      showToast('Template 10: Dark Sidebar Pro (Colored Sidebar) চালু হয়েছে', 'success');
    } else if (tpl === 'swiss-grid') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '1col',
        sectionHeading: 'line',
        skillsMode: 'table',
        bulletStyle: 'bullet-dash',
        themePrimary: '#0f172a',
        themeLight: '#f8fafc',
        themeBorder: '#2563eb',
        cvFont: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        lineHeight: 1.44,
        sectionGap: 14,
        pagePadding: 11,
      }));
      showToast('Template 11: Minimalist Swiss Grid Pro চালু হয়েছে', 'success');
    } else if (tpl === 'tech-mono') {
      setSettings((prev) => ({
        ...prev,
        template: tpl,
        photoPosition: 'right',
        headerStyle: 'right',
        bodyColumns: '1col',
        sectionHeading: 'accent-bar',
        skillsMode: 'grid',
        bulletStyle: 'bullet-arrow',
        themePrimary: '#0f766e',
        themeLight: '#f0fdfa',
        themeBorder: '#0d9488',
        cvFont: "'DM Sans', sans-serif",
        fontSize: 12,
        lineHeight: 1.42,
        sectionGap: 13,
        pagePadding: 11,
      }));
      showToast('Template 12: Tech Monospace Developer চালু হয়েছে', 'success');
    }
  }

  // 1-Click Boost to 100% ATS
  function handleBoost100() {
    setSettings((prev) => ({
      ...prev,
      photoPosition: 'hide',
      headerStyle: 'hide',
      bodyColumns: '1col',
      sectionHeading: 'line',
      skillsMode: 'table',
      themePrimary: '#000000',
      themeLight: '#ffffff',
      themeBorder: '#000000',
      cvFont: 'Georgia, serif',
    }));
    showToast('🏆 ১০০% ATS স্কোর অর্জিত হয়েছে! (No-Photo + Clean Harvard ATS Layout)', 'success');
  }

  function handleRestoreBDCorporate() {
    handleSelectTemplate('bd-corporate');
  }

  // Role preset handler in Unified Tools
  function handleApplyRolePreset(preset: 'master' | 'data' | 'sqa' | 'netops') {
    const presets = {
      master: {
        title: INITIAL_CV_DATA.title,
        summary: INITIAL_CV_DATA.summary,
      },
      data: {
        title: 'DATA ANALYST | POWER BI DEVELOPER & SQL DATABASE SPECIALIST',
        summary:
          'Analytical and detail-oriented Computer Science graduate with 2+ years of professional experience in Data Analytics, Advanced SQL, Power BI interactive reporting, and Power Query ETL pipelines. Experienced in reconciling operational records, designing dimensional Star Schemas, and auditing enterprise ERP/SaaS data for business decision-making.',
      },
      sqa: {
        title: 'SOFTWARE QA ENGINEER | REST API, SQL & MANUAL TESTING SPECIALIST',
        summary:
          'Quality-driven Software QA specialist with hands-on experience in manual functional and regression testing, Postman REST API verification, SQL database auditing, BVA/ECP test design, and Jira defect tracking across Agile workflows. Skilled in cross-browser verification, UI test automation basics, and requirements traceability.',
      },
      netops: {
        title: 'IT SUPPORT ENGINEER | SYSTEM, NETWORK & ERP SPECIALIST',
        summary:
          'Enterprise IT Support and Network Operations specialist experienced in supporting 100+ business users, Windows Server and Linux system administration, network switch and router troubleshooting, ERP/SaaS support, and scheduled backup operations.',
      },
    };

    const sel = presets[preset];
    applyCVUpdate((prev) => ({
      ...prev,
      title: sel.title,
      summary: sel.summary,
    }));
    showToast(`একই CV-তে ${preset.toUpperCase()} role preset প্রয়োগ হয়েছে!`, 'success');
  }

  // Add missing keyword to CV skills
  function handleAddSkillKeyword(kw: string) {
    applyCVUpdate((prev) => {
      const skills = prev.skills.map((s) => ({ ...s }));
      const target = skills.find((s) => s.category.includes('Tools') || s.category.includes('Data')) || skills[0];
      if (target && !target.competencies.toLowerCase().includes(kw.toLowerCase())) {
        target.competencies = `${target.competencies}, ${kw}`;
      } else if (!target) {
        skills.push({
          id: 's_' + Date.now(),
          category: 'JD Targeted Competencies',
          competencies: kw,
        });
      }
      return { ...prev, skills };
    });
    showToast(`"${kw}" স্কিল সেকশনে যুক্ত করা হয়েছে!`, 'success');
  }

  function handleInsertXYZBullet(bulletHtml: string) {
    applyCVUpdate((prev) => {
      const experiences = prev.experiences.map((exp, idx) => {
        if (idx !== 0) return exp;
        return {
          ...exp,
          bullets: [
            { id: 'b_xyz_' + Date.now(), text: bulletHtml },
            ...exp.bullets,
          ],
        };
      });
      return { ...prev, experiences };
    });
    showToast('Google XYZ বুলেট ১ম অভিজ্ঞতায় যুক্ত করা হয়েছে!', 'success');
  }

  // Rich Text ExecCommands
  function handleFormatDoc(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
  }

  function handleInsertSymbol(sym: string) {
    document.execCommand('insertText', false, sym);
  }

  // Hyperlink handling
  function handleOpenLinkModalForContact(contactId: string, currentText: string, currentUrl: string) {
    setLinkTarget({
      type: 'contact',
      id: contactId,
      text: currentText,
      url: currentUrl,
    });
    setLinkModalOpen(true);
  }

  function handleOpenLinkModalForProject(projectId: string, currentTitle: string, currentUrl: string) {
    setLinkTarget({
      type: 'project',
      id: projectId,
      text: currentTitle,
      url: currentUrl,
    });
    setLinkModalOpen(true);
  }

  function handleOpenLinkModalSelection() {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';
    setLinkTarget({
      type: 'selection',
      text: text || '',
      url: 'https://',
    });
    setLinkModalOpen(true);
  }

  function handleApplyHyperlink(text: string, url: string) {
    if (linkTarget.type === 'contact' && linkTarget.id) {
      applyCVUpdate((prev) => ({
        ...prev,
        contacts: prev.contacts.map((c) => (c.id === linkTarget.id ? { ...c, label: text, url } : c)),
      }));
      showToast('কন্টাক্ট লিংক আপডেট হয়েছে!', 'success');
    } else if (linkTarget.type === 'project' && linkTarget.id) {
      applyCVUpdate((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === linkTarget.id ? { ...p, title: text, url } : p)),
      }));
      showToast('প্রজেক্ট লিংক আপডেট হয়েছে!', 'success');
    } else {
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${url}" target="_blank" class="theme-text font-semibold underline">${text || url}</a>`
      );
      showToast('নতুন হাইপারলিঙ্ক যুক্ত হয়েছে!', 'success');
    }
    setLinkModalOpen(false);
  }

  function handleRemoveHyperlink() {
    if (linkTarget.type === 'contact' && linkTarget.id) {
      applyCVUpdate((prev) => ({
        ...prev,
        contacts: prev.contacts.map((c) => (c.id === linkTarget.id ? { ...c, url: '' } : c)),
      }));
    } else if (linkTarget.type === 'project' && linkTarget.id) {
      applyCVUpdate((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === linkTarget.id ? { ...p, url: '' } : p)),
      }));
    } else {
      document.execCommand('unlink', false);
    }
    setLinkModalOpen(false);
    showToast('লিংক সরানো হয়েছে', 'info');
  }

  // Add custom section
  function handleAddSection(title: string, type: 'bullets' | 'paragraph' | 'references') {
    let initialContent: string[] = [];
    if (type === 'bullets') {
      initialContent = [
        '<strong>Key Achievement 1:</strong> Describe accomplishment, award, or extracurricular...',
        '<strong>Key Achievement 2:</strong> Detail measurable results and impact...',
      ];
    } else if (type === 'paragraph') {
      initialContent = ['Write your custom section overview or notes here. Fully live editable.'];
    } else if (type === 'references') {
      initialContent = [
        '<strong>Reference 1:</strong> Designation, Organization | Email: ref1@example.com | Phone: +880 1XXX-XXXXXX',
        '<strong>Reference 2:</strong> Designation, Organization | Email: ref2@example.com | Phone: +880 1XXX-XXXXXX',
      ];
    }

    applyCVUpdate((prev) => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        {
          id: 'sec_' + Date.now(),
          title,
          type,
          content: initialContent,
          forcePageBreak: false,
        },
      ],
    }));
    showToast(`"${title}" সেকশন যোগ করা হয়েছে!`, 'success');
  }

  // Reset CV
  function handleConfirmReset() {
    applyCVUpdate(INITIAL_CV_DATA);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem('shoyeb_cv_master_v3_data');
    localStorage.removeItem('shoyeb_cv_master_v3_settings');
    showToast('সিভি মূল ডিফল্ট অবস্থায় রিসেট হয়েছে!', 'success');
  }

  // Import JSON project
  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) applyCVUpdate(parsed.data);
        if (parsed.settings) setSettings(parsed.settings);
        showToast('JSON প্রজেক্ট সফলভাবে রিস্টোর হয়েছে!', 'success');
      } catch {
        showToast('JSON ফাইলটি পড়া যায়নি', 'error');
      }
    };
    reader.readAsText(file);
  }

  async function handleDownloadPDF() {
    showToast('পিডিএফ তৈরি হচ্ছে...', 'info');
    await exportDirectPDF('cvDocument', cvData.name);
    confetti({ particleCount: 50, spread: 60 });
    showToast('PDF ডাউনলোড সম্পন্ন হয়েছে!', 'success');
  }

  async function handleDownloadPNG() {
    showToast('হাই-রেজোলিউশন PNG তৈরি হচ্ছে...', 'info');
    const ok = await exportHighResPNG('cvDocument', cvData.name);
    if (ok) {
      showToast('HD PNG ইমেজ ডাউনলোড সম্পন্ন হয়েছে!', 'success');
    } else {
      showToast('PNG তৈরি করা যায়নি — অনুগ্রহ করে পুনরায় চেষ্টা করুন।', 'error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {showPublicWebsite ? (
        <>
          <WebPortfolioView
            cvData={cvData}
            settings={settings}
            isStudioUnlocked={isStudioUnlocked}
            activeRoleLabel={activeRoleLabel}
            profiles={profiles.map((p) => ({
              id: p.id,
              name: p.name,
              rolePreset: p.rolePreset,
              description: p.description,
            }))}
            activeProfileId={activeProfileId}
            onSelectPublicProfile={handleSelectPublicProfile}
            onOpenLogin={() => setLoginModalOpen(true)}
            onLockStudio={handleLockStudio}
            onBackToEditor={() => setSettings((s) => ({ ...s, portfolioMode: false }))}
            onExportPDF={handleDownloadPDF}
            onOpenPrintPreview={() => setPrintPreviewOpen(true)}
          />
          {/* Offscreen clean A4 document for 1-click PDF download directly from Live Website */}
          <div
            style={{
              position: 'fixed',
              left: '-12000px',
              top: 0,
              width: '210mm',
              background: '#ffffff',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <CVDocument
              cvData={cvData}
              settings={{ ...settings, isEditMode: false }}
              estimatedPages={estimatedPages}
              onUpdateCVData={applyCVUpdate}
              onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
              onOpenLinkModalForContact={handleOpenLinkModalForContact}
              onOpenLinkModalForProject={handleOpenLinkModalForProject}
              onOpenSignatureModal={() => setSignatureModalOpen(true)}
            />
          </div>
        </>
      ) : (
        <>
          {/* Top Navbar Ribbon (Hidden in Zen Focus Mode) */}
          {!zenMode && (
            <Navbar
              score={score}
              isEditMode={settings.isEditMode}
              onToggleEditMode={() =>
                setSettings((prev) => ({ ...prev, isEditMode: !prev.isEditMode }))
              }
            photoPosition={settings.photoPosition}
            onSetPhotoPosition={(pos: PhotoPosition) =>
              setSettings((prev) => ({ ...prev, photoPosition: pos, headerStyle: pos }))
            }
            selectedTemplate={settings.template}
            onSelectTemplate={handleSelectTemplate}
            onOpenTemplateGallery={() => setTemplateGalleryOpen(true)}
            onOpenATSModal={() => setAtsModalOpen(true)}
            onOpenGitHubModal={() => setGithubModalOpen(true)}
            onToggleUnifiedTools={() => setIsUnifiedToolsOpen(!isUnifiedToolsOpen)}
            onToggleStudioSidebar={() => setIsStudioOpen(!isStudioOpen)}
            onOpenLinkModal={handleOpenLinkModalSelection}
            onOpenAddSectionModal={() => setAddSectionModalOpen(true)}
            onAddContact={() => {
              applyCVUpdate((prev) => ({
                ...prev,
                contacts: [
                  ...prev.contacts,
                  {
                    id: 'c_' + Date.now(),
                    label: 'New Link',
                    url: 'https://shoyebrabbi.com',
                    type: 'custom',
                  },
                ],
              }));
              showToast('নতুন কন্টাক্ট লিংক যুক্ত হয়েছে', 'success');
            }}
            onAddSkill={() => {
              applyCVUpdate((prev) => ({
                ...prev,
                skills: [
                  ...prev.skills,
                  {
                    id: 's_' + Date.now(),
                    category: 'New Category',
                    competencies: 'Enter tools, technologies, and skills...',
                  },
                ],
              }));
              showToast('নতুন স্কিল রো যুক্ত হয়েছে', 'success');
            }}
            onAddJob={() => {
              applyCVUpdate((prev) => ({
                ...prev,
                experiences: [
                  ...prev.experiences,
                  {
                    id: 'e_' + Date.now(),
                    role: 'Position / Role',
                    company: 'Company / Organization',
                    date: 'Month Year - Present',
                    location: 'Chattogram, Bangladesh',
                    bullets: [
                      {
                        id: 'b_' + Date.now(),
                        text: '<strong>Key Responsibility:</strong> Describe your impact and metrics...',
                      },
                    ],
                  },
                ],
              }));
              showToast('নতুন পদবি যুক্ত হয়েছে', 'success');
            }}
            onAddProject={() => {
              applyCVUpdate((prev) => ({
                ...prev,
                projects: [
                  ...prev.projects,
                  {
                    id: 'p_' + Date.now(),
                    title: 'New Project Title',
                    url: 'https://github.com/shoyebrabbi',
                    technologies: 'Technologies, Frameworks, Tools',
                    description: 'Describe project architecture, pipelines, and results achieved...',
                  },
                ],
              }));
              showToast('নতুন প্রজেক্ট যুক্ত হয়েছে', 'success');
            }}
            onExportPDF={handleDownloadPDF}
            onOpenExportHub={() => setExportHubOpen(true)}
            onLockStudio={handleLockStudio}
            onFormatDoc={handleFormatDoc}
            onInsertSymbol={handleInsertSymbol}
            portfolioMode={Boolean(settings.portfolioMode)}
            onTogglePortfolioMode={() =>
              setSettings((prev) => ({ ...prev, portfolioMode: !prev.portfolioMode }))
            }
            activeProfileId={activeProfileId}
            onSelectProfile={handleSelectProfile}
            profiles={profiles.map((p) => ({ id: p.id, name: p.name }))}
            wordCount={wordCount}
            readTimeSeconds={readTimeSeconds}
            onAutoFit1Page={handleAutoFit1Page}
            onAutoFit2Pages={handleAutoFit2Pages}
            onOpenProfileManager={() => setProfileManagerOpen(true)}
            canUndoCV={historyPast.length > 0}
            canRedoCV={historyFuture.length > 0}
              onUndoCV={handleUndoCV}
              onRedoCV={handleRedoCV}
              onOpenPrintPreview={() => setPrintPreviewOpen(true)}
              zenMode={zenMode}
              onToggleZenMode={() => setZenMode((z) => !z)}
            />
          )}

          {zenMode && (
            <div className="no-print fixed top-4 right-5 z-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrintPreviewOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0B1120]/95 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-xl backdrop-blur"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" /> Preview
              </button>
              <button
                type="button"
                onClick={() => setZenMode(false)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl"
              >
                <Minimize2 className="w-3.5 h-3.5" /> Exit Focus Mode
              </button>
            </div>
          )}

          <div
            className={`flex-1 flex relative overflow-hidden ${
              zenMode ? 'h-screen' : 'md:h-[calc(100vh-92px)]'
            }`}
          >
            {/* Left Design Inspector Drawer (Hidden in Zen Focus Mode) */}
            {!zenMode && (
              <StyleCombinerDrawer
                isOpen={isStudioOpen}
                onClose={() => setIsStudioOpen(false)}
                settings={settings}
                onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
                onResetClick={() => setResetModalOpen(true)}
                onOpenSignatureModal={() => setSignatureModalOpen(true)}
                onAutoFit1Page={handleAutoFit1Page}
                onAutoFit2Pages={handleAutoFit2Pages}
                onSaveCustomTemplate={handleSaveCustomTemplate}
                onOpenTemplateGallery={() => setTemplateGalleryOpen(true)}
              />
            )}

            {/* Center Live A4 Canvas */}
            <main className="flex-1 py-6 px-3 sm:px-8 overflow-y-auto overflow-x-auto bg-[#060911]">
              {/* Clean Floating Canvas Bar */}
              <div className="no-print max-w-[210mm] mx-auto mb-4 bg-[#0B1120] border border-slate-800/90 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
                <div className="flex items-center gap-2.5">
                  <span className="font-medium text-slate-300">
                    {estimatedPages} {estimatedPages > 1 ? 'Pages' : 'Page'} · {Math.round(docHeight * 0.264583)}mm
                  </span>

                  {overflowPx > 0 ? (
                    <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded text-[11px] font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        +{Math.round(overflowPx)}px overflow on Page {estimatedPages - 1}
                      </span>
                      <button
                        type="button"
                        onClick={estimatedPages <= 2 ? handleAutoFit1Page : handleAutoFit2Pages}
                        className="underline hover:text-amber-100 font-semibold ml-1"
                      >
                        Auto-Fit
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Clean Fit
                    </span>
                  )}
                </div>

                {/* Canvas Zoom, Page Break Guide & 2-Page Spread Toggle */}
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {estimatedPages >= 2 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSideBySideSpread((s) => !s)}
                        className={`hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          sideBySideSpread
                            ? 'bg-emerald-600/25 text-emerald-300'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Page 1 এবং Page 2 পাশাপাশি দেখুন"
                      >
                        <Columns2 className="w-3 h-3" />
                        <span>{sideBySideSpread ? 'Back to Edit' : '2-Page Spread'}</span>
                      </button>
                      <div className="hidden xl:block h-3 w-px bg-slate-800 mx-0.5" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPageGuide(!showPageGuide)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      showPageGuide
                        ? 'bg-blue-600/25 text-blue-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="A4 পেজ ব্রেক লাইন অন/অফ করুন"
                  >
                    {showPageGuide ? 'Guides: On' : 'Guides: Off'}
                  </button>
                  <div className="h-3 w-px bg-slate-800 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => handleZoomChange(-0.1)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-200 min-w-[36px] text-center">
                    {Math.round((settings.zoomLevel || 1) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(0.1)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-[10.5px] font-medium text-slate-400 hover:text-white"
                    title="Reset 100%"
                  >
                    1:1
                  </button>
                </div>
              </div>

              {/* Desktop 2-Page Side-by-Side Spread Preview (when toggled) */}
              {sideBySideSpread && estimatedPages >= 2 && (
                <div className="no-print max-w-[1160px] mx-auto mb-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-items-center">
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono font-semibold text-slate-400 text-center">
                        Page 1 of {estimatedPages}
                      </div>
                      <div
                        className="rounded-lg shadow-2xl border border-slate-800 overflow-hidden bg-white"
                        style={{ width: '532px', height: '752px' }}
                      >
                        <div
                          ref={spreadPage1Ref}
                          style={{
                            width: '794px',
                            transform: 'scale(0.67)',
                            transformOrigin: 'top left',
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] font-mono font-semibold text-slate-400 text-center">
                        Page 2 of {estimatedPages}
                      </div>
                      <div
                        className="rounded-lg shadow-2xl border border-slate-800 overflow-hidden bg-white"
                        style={{ width: '532px', height: '752px' }}
                      >
                        <div
                          ref={spreadPage2Ref}
                          style={{
                            width: '794px',
                            transform: 'scale(0.67)',
                            transformOrigin: 'top left',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document wrapper with Zoom scaling (stays mounted cleanly when spread mode active) */}
              <div
                className={`cv-document-wrapper relative transition-transform duration-200 ${
                  sideBySideSpread && estimatedPages >= 2
                    ? 'fixed left-[-12000px] top-0 opacity-0 pointer-events-none'
                    : ''
                }`}
                style={{
                  transform: `scale(${settings.zoomLevel || 1})`,
                  transformOrigin: 'top center',
                  marginBottom:
                    settings.zoomLevel && settings.zoomLevel < 1
                      ? `-${Math.round((1 - settings.zoomLevel) * (docHeight || 1120))}px`
                      : undefined,
                }}
              >
                {/* Visual A4 Page Break Guidelines (Non-printable) */}
                {showPageGuide && (
                  <div
                    className="no-print absolute left-[-16px] right-[-16px] pointer-events-none flex items-center justify-between z-30"
                    style={{ top: '1123px' }}
                  >
                    <div className="h-[2px] flex-1 border-b-2 border-dashed border-rose-500/80"></div>
                    <span className="bg-rose-950 border border-rose-500/80 text-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap mx-2">
                      ✂️ A4 Page 1 End (297mm) / Page 2 Start
                    </span>
                    <div className="h-[2px] flex-1 border-b-2 border-dashed border-rose-500/80"></div>
                  </div>
                )}

                {showPageGuide && docHeight > 2246 && (
                  <div
                    className="no-print absolute left-[-16px] right-[-16px] pointer-events-none flex items-center justify-between z-30"
                    style={{ top: '2246px' }}
                  >
                    <div className="h-[2px] flex-1 border-b-2 border-dashed border-rose-500/80"></div>
                    <span className="bg-rose-950 border border-rose-500/80 text-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap mx-2">
                      ✂️ A4 Page 2 End (594mm) / Page 3 Start
                    </span>
                    <div className="h-[2px] flex-1 border-b-2 border-dashed border-rose-500/80"></div>
                  </div>
                )}

                <CVDocument
                  cvData={cvData}
                  settings={settings}
                  estimatedPages={estimatedPages}
                  jdHighlightKeywords={jdHighlightKeywords}
                  onClearJDHighlight={() => setJdHighlightKeywords([])}
                  onUpdateCVData={applyCVUpdate}
                  onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
                  onOpenLinkModalForContact={handleOpenLinkModalForContact}
                  onOpenLinkModalForProject={handleOpenLinkModalForProject}
                  onOpenSignatureModal={() => setSignatureModalOpen(true)}
                />
              </div>
            </main>
          </div>

          {/* Right Unified Tools Drawer */}
          <UnifiedToolsDrawer
            isOpen={isUnifiedToolsOpen}
            onClose={() => setIsUnifiedToolsOpen(false)}
            cvData={cvData}
            settings={settings}
            score={score}
            activeProfileName={profiles.find((p) => p.id === activeProfileId)?.name}
            jdHighlightKeywords={jdHighlightKeywords}
            onToggleJDHighlight={(kws) => {
              setJdHighlightKeywords(kws);
              showToast(
                kws.length > 0
                  ? `${kws.length}টি ম্যাচিং কিওয়ার্ড সিভিতে হাইলাইট করা হয়েছে!`
                  : 'JD Highlight বন্ধ করা হয়েছে।',
                'info'
              );
            }}
            onInsertXYZBullet={handleInsertXYZBullet}
            onApplyRolePreset={handleApplyRolePreset}
            onOpenATSModal={() => setAtsModalOpen(true)}
            onAddSkillKeyword={handleAddSkillKeyword}
            onShowToast={showToast}
          />
        </>
      )}

      {/* Visual Template Gallery Modal (12 Built-in + Custom Saved Templates) */}
      <TemplateGalleryModal
        isOpen={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
        selectedTemplate={settings.template}
        onSelectTemplate={handleSelectTemplate}
        customTemplates={customTemplates}
        activeCustomTemplateId={settings.customTemplateId}
        onSelectCustomTemplate={handleSelectCustomTemplate}
        onSaveCurrentAsTemplate={handleSaveCustomTemplate}
        onDeleteCustomTemplate={handleDeleteCustomTemplate}
        onImportCustomTemplates={handleImportCustomTemplates}
      />

      {/* Custom Profile Manager & Shareable Link Modal */}
      <ProfileManagerModal
        isOpen={profileManagerOpen}
        onClose={() => setProfileManagerOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        onRenameProfile={handleRenameProfile}
        onDeleteProfile={handleDeleteProfile}
        onCopyShareLink={handleCopyShareLink}
      />

      {/* Owner Access & Unified Export Modals */}
      <OwnerLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onVerify={handleVerifyPasscode}
      />

      <ExportHubModal
        isOpen={exportHubOpen}
        onClose={() => setExportHubOpen(false)}
        onExportPDF={handleDownloadPDF}
        onExportPNG={handleDownloadPNG}
        onPrint={() => window.print()}
        onExportWord={(ext) => {
          exportWordDoc(ext, cvData, settings);
          showToast(`Microsoft Word (.${ext}) ডাউনলোড সম্পন্ন হয়েছে!`, 'success');
        }}
        onExportExcel={() => {
          exportExcel(cvData);
          showToast('৫-শিটের এক্সেল (.xlsx) ফাইল ডাউনলোড সম্পন্ন হয়েছে!', 'success');
        }}
        onExportCSV={() => {
          exportCSV(cvData);
          showToast('CSV স্প্রেডশিট ডাউনলোড সম্পন্ন হয়েছে!', 'success');
        }}
        onExportHTML={() => {
          exportHTMLFile(cvData, settings);
          showToast('Standalone HTML (.html) ফাইল ডাউনলোড সম্পন্ন হয়েছে!', 'success');
        }}
        onExportMarkdown={() => {
          exportMarkdown(cvData, settings);
          showToast('Markdown (.md) ফাইল ডাউনলোড সম্পন্ন হয়েছে!', 'success');
        }}
        onExportPlainText={() => {
          exportPlainText(cvData, settings);
          showToast('Plain Text (.txt) ফাইল ডাউনলোড সম্পন্ন হয়েছে!', 'success');
        }}
        onExportJSON={() => {
          exportJSONBackup(cvData, settings);
          showToast('JSON প্রজেক্ট ব্যাকআপ সেভ হয়েছে!', 'success');
        }}
        onImportJSON={handleImportJSON}
        onCopyAllText={async () => {
          await copyAllCVText(cvData, settings);
          showToast('সম্পূর্ণ সিভির টেক্সট ক্লিপবোর্ডে কপি হয়েছে!', 'success');
        }}
        onUpdatePasscode={handleUpdatePasscode}
        onLockStudio={handleLockStudio}
      />

      {/* Studio Modals */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        initialImage={settings.signature?.image || ''}
        candidateName={cvData.name || 'Md Shoyeb Rabbi'}
        onSave={handleSaveSignature}
      />

      <HyperlinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onApply={handleApplyHyperlink}
        onRemove={handleRemoveHyperlink}
        initialText={linkTarget.text}
        initialUrl={linkTarget.url}
      />

      <ATSAuditModal
        isOpen={atsModalOpen}
        onClose={() => setAtsModalOpen(false)}
        score={score}
        scoreBreakdown={atsScoreData}
        photoPosition={settings.photoPosition}
        cvSearchText={cvSearchText}
        onBoost100={handleBoost100}
        onRestoreBDCorporate={handleRestoreBDCorporate}
        onAddKeyword={handleAddSkillKeyword}
      />

      <AddSectionModal
        isOpen={addSectionModalOpen}
        onClose={() => setAddSectionModalOpen(false)}
        onAdd={handleAddSection}
      />

      <ResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

      <GitHubDeployModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onCopyText={(text) => {
          navigator.clipboard.writeText(text);
          showToast('Git কমান্ডগুলো কপি করা হয়েছে!', 'success');
        }}
      />

      <PrintPreviewModal
        isOpen={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
        onPrint={() => window.print()}
        onExportPDF={handleDownloadPDF}
        estimatedPages={estimatedPages}
        docHeightPx={docHeight}
        hideBrowserPrintChrome={settings.hideBrowserPrintChrome !== false}
      />

      {/* Floating Toast Container */}
      <div className="no-print fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto border-l-4 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium transition-all duration-300 ${
              t.type === 'success'
                ? 'bg-emerald-900/95 border-emerald-400 text-emerald-100'
                : t.type === 'error'
                ? 'bg-rose-900/95 border-rose-400 text-rose-100'
                : 'bg-slate-800/95 border-blue-400 text-blue-100'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
