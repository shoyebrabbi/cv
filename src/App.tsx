import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { CVData, StudioSettings, CVTemplateKey, PhotoPosition, CVProfile, CustomTemplatePreset, JobApplication } from './types/cv';
import { INITIAL_CV_DATA, INITIAL_SETTINGS, INITIAL_PROFILES } from './data/initialCV';
import {
  FIREBASE_PROJECT_ID,
  OWNER_ADMIN_EMAIL,
  isOwnerEmail,
  isAuthorizedOwner,
  subscribeAuth,
  signInOwnerWithGoogle,
  signInOwnerWithEmailPassword,
  registerOwnerWithEmailPassword,
  resendOwnerVerificationEmail,
  refreshOwnerVerificationStatus,
  sendOwnerPasswordReset,
  changeOwnerPassword,
  linkOwnerPassword,
  signOutOwner,
  subscribePublicSite,
  subscribePublicProfiles,
  savePublicSiteState,
  upsertPublicProfile,
  deletePublicProfileCloud,
  seedCloudWorkspaceIfEmpty,
  subscribeCustomTemplates,
  upsertCustomTemplateCloud,
  deleteCustomTemplateCloud,
  upsertJobApplicationCloud,
} from './firebase';
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
import { StudioRightRail, ShortcutsModal } from './components/StudioRightRail';
import { MobileCVEditor } from './components/MobileCVEditor';
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
  PanelRightOpen,
  Ruler,
  Sliders,
  Edit3,
  Eye,
  Briefcase,
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

function mergeCVData(raw?: Partial<CVData> | null): CVData {
  if (!raw || typeof raw !== 'object') return INITIAL_CV_DATA;
  return {
    ...INITIAL_CV_DATA,
    ...raw,
    contacts: Array.isArray(raw.contacts) ? raw.contacts : INITIAL_CV_DATA.contacts,
    skills: Array.isArray(raw.skills) ? raw.skills : INITIAL_CV_DATA.skills,
    experiences: Array.isArray(raw.experiences) ? raw.experiences : INITIAL_CV_DATA.experiences,
    projects: Array.isArray(raw.projects) ? raw.projects : INITIAL_CV_DATA.projects,
    certifications: Array.isArray(raw.certifications) ? raw.certifications : INITIAL_CV_DATA.certifications,
    customSections: Array.isArray(raw.customSections) ? raw.customSections : [],
    education: {
      ...INITIAL_CV_DATA.education,
      ...(raw.education || {}),
    },
  };
}

function mergeStudioSettings(raw?: Partial<StudioSettings> | null): StudioSettings {
  if (!raw || typeof raw !== 'object') return INITIAL_SETTINGS;
  return {
    ...INITIAL_SETTINGS,
    ...raw,
    qrCode: {
      ...INITIAL_SETTINGS.qrCode!,
      ...(raw.qrCode || {}),
    },
    signature: {
      ...INITIAL_SETTINGS.signature!,
      ...(raw.signature || {}),
    },
    portfolio: {
      ...INITIAL_SETTINGS.portfolio!,
      ...(raw.portfolio || {}),
      metrics:
        Array.isArray(raw.portfolio?.metrics) && raw.portfolio.metrics.length > 0
          ? raw.portfolio.metrics
          : INITIAL_SETTINGS.portfolio!.metrics,
    },
    hiddenSections: Array.isArray(raw.hiddenSections) ? raw.hiddenSections : INITIAL_SETTINGS.hiddenSections,
    sidebarSections: Array.isArray(raw.sidebarSections) ? raw.sidebarSections : INITIAL_SETTINGS.sidebarSections,
  };
}

export default function App() {
  // Multi-Profile Versions (loaded early to support ?role= shareable URLs)
  const [profiles, setProfiles] = useState<CVProfile[]>(() => {
    try {
      const saved = localStorage.getItem('shoyeb_cv_master_v3_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: CVProfile) => ({
            ...p,
            data: mergeCVData(p.data),
            settings: mergeStudioSettings(p.settings),
          }));
        }
      }
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
    if (initialRoleMatch) return mergeCVData(initialRoleMatch.data);
    try {
      const saved = localStorage.getItem('shoyeb_cv_master_v3_data');
      if (saved) return mergeCVData(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CV_DATA;
  });

  // Load Settings from ?role= profile, localStorage, or initial
  const [settings, setSettings] = useState<StudioSettings>(() => {
    if (initialRoleMatch) return mergeStudioSettings(initialRoleMatch.settings);
    try {
      const saved = localStorage.getItem('shoyeb_cv_master_v3_settings');
      if (saved) return mergeStudioSettings(JSON.parse(saved));
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

  // Mobile native Studio view ('app' card editor vs 'paper' zoomed A4 sheet)
  const [mobileStudioView, setMobileStudioView] = useState<'app' | 'paper'>('app');

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

  // Drawer toggles (Closed by default below lg/1024px so mobile & tablet show CV canvas immediately)
  const [isStudioOpen, setIsStudioOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isRightRailOpen, setIsRightRailOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1440 : false
  );
  const [isUnifiedToolsOpen, setIsUnifiedToolsOpen] = useState(false);

  // Public-first Firebase Single-Owner Auth Gate (visitors see Live Website immediately)
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const isStudioUnlocked = isAuthorizedOwner(authUser);
  const ownerUid = isStudioUnlocked && authUser ? authUser.uid : null;
  const hasPasswordProvider = Boolean(
    authUser?.providerData?.some((p) => p.providerId === 'password')
  );

  const suppressCloudSyncRef = useRef(false);
  const hasCloudHydratedRef = useRef(false);
  const hasSeededCloudRef = useRef(false);
  const hasVisitorPickedLensRef = useRef(false);
  const urlRoleParam = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('role')?.trim().toLowerCase() || '';
    } catch {
      return '';
    }
  }, []);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [exportHubOpen, setExportHubOpen] = useState(false);
  const [exportHubTab, setExportHubTab] = useState<'all' | 'docs' | 'data' | 'security'>('all');
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
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [sideBySideSpread, setSideBySideSpread] = useState(false);
  const spreadPage1Ref = useRef<HTMLDivElement>(null);
  const spreadPage2Ref = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [docHeight, setDocHeight] = useState<number>(1120);
  const [showPageGuide, setShowPageGuide] = useState(true);
  const [showRulerGuides, setShowRulerGuides] = useState(true);

  const showPublicWebsite = !isStudioUnlocked || Boolean(settings.portfolioMode);

  // Keyboard shortcuts: Ctrl/Cmd+Z / Ctrl+Y Undo/Redo, Ctrl/Cmd+P Print Preview, Ctrl+\ Toggle Inspector, Ctrl+E Edit/Preview, ? Shortcuts HUD, Esc Exit Focus Mode
  useEffect(() => {
    if (showPublicWebsite) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPrintPreviewOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setIsStudioOpen((o) => !o);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, isEditMode: !prev.isEditMode }));
        return;
      }
      if (e.key === 'Escape') {
        if (shortcutsModalOpen) {
          setShortcutsModalOpen(false);
          return;
        }
        if (zenMode && !printPreviewOpen) {
          setZenMode(false);
          return;
        }
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
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen((s) => !s);
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
  }, [showPublicWebsite, zenMode, printPreviewOpen, shortcutsModalOpen, handleUndoCV, handleRedoCV]);

  // Keep live refs for async Firebase sync without stale closures
  const settingsRef = useRef<StudioSettings>(settings);
  settingsRef.current = settings;
  const profilesRef = useRef<CVProfile[]>(profiles);
  profilesRef.current = profiles;
  const activeProfileIdRef = useRef<string>(activeProfileId);
  activeProfileIdRef.current = activeProfileId;
  const isStudioUnlockedRef = useRef<boolean>(isStudioUnlocked);
  isStudioUnlockedRef.current = isStudioUnlocked;
  const loginModalOpenRef = useRef<boolean>(loginModalOpen);
  loginModalOpenRef.current = loginModalOpen;

  // 1. Firebase Auth Listener
  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      if (user && user.email && !isOwnerEmail(user.email)) {
        // Immediately sign out any non-owner account for strict single-owner lock
        void signOutOwner();
        setAuthUser(null);
        setAuthError(
          `Access denied: ${user.email} is not authorized. Only ${OWNER_ADMIN_EMAIL} can unlock the Studio.`
        );
        return;
      }

      setAuthUser(user);
      if (isAuthorizedOwner(user)) {
        setAuthError('');
        setAuthSuccess('');
        if (loginModalOpenRef.current) {
          setLoginModalOpen(false);
          setSettings((prev) => ({ ...prev, portfolioMode: false }));
          showToast('স্বাগতম! Verified ওনার হিসেবে Document CV Studio আনলক হয়েছে।', 'success');
        }
      }
    });
    return () => unsub();
  }, [showToast]);

  // 2. Public Real-Time Firestore Subscription (Live Website & ?role= Profiles)
  useEffect(() => {
    let publicSiteMissing = false;

    const unsubSite = subscribePublicSite(
      (cloudSite) => {
        if (!cloudSite) {
          publicSiteMissing = true;
          hasCloudHydratedRef.current = true;
          return;
        }
        publicSiteMissing = false;
        setCloudSyncStatus('synced');

        // On visitor view, stay on ?role= lens if URL specifies one
        if (urlRoleParam && !isStudioUnlockedRef.current) {
          hasCloudHydratedRef.current = true;
          return;
        }
        // Once owner has already hydrated cloud state and is editing live, avoid overwriting cursor
        if (isStudioUnlockedRef.current && hasCloudHydratedRef.current) {
          return;
        }

        suppressCloudSyncRef.current = true;
        const mergedData = mergeCVData(cloudSite.activeData);
        const mergedSettings = mergeStudioSettings(cloudSite.activeSettings);
        cvDataRef.current = mergedData;
        setCvData(mergedData);
        setSettings((prev) => ({
          ...mergedSettings,
          portfolioMode: isStudioUnlockedRef.current ? prev.portfolioMode : mergedSettings.portfolioMode,
        }));
        setActiveProfileId(cloudSite.activeProfileId || 'prof_master');
        hasCloudHydratedRef.current = true;
      },
      () => {
        setCloudSyncStatus('error');
      }
    );

    const unsubProfiles = subscribePublicProfiles(
      (cloudProfiles) => {
        if (cloudProfiles.length === 0) return;
        const normalized = cloudProfiles.map((p) => ({
          ...p,
          data: mergeCVData(p.data),
          settings: mergeStudioSettings(p.settings),
        }));
        setProfiles(normalized);

        if (urlRoleParam && !hasVisitorPickedLensRef.current && !isStudioUnlockedRef.current) {
          const matched = normalized.find(
            (p) =>
              p.id.toLowerCase() === urlRoleParam ||
              p.id.toLowerCase() === `prof_${urlRoleParam}` ||
              p.rolePreset.toLowerCase() === urlRoleParam
          );
          if (matched) {
            suppressCloudSyncRef.current = true;
            cvDataRef.current = matched.data;
            setCvData(matched.data);
            setSettings(matched.settings);
            setActiveProfileId(matched.id);
            setActiveRoleLabel(matched.id === 'prof_master' ? undefined : matched.name);
          }
        }
      },
      () => {
        setCloudSyncStatus('error');
      }
    );

    void publicSiteMissing;
    return () => {
      unsubSite();
      unsubProfiles();
    };
  }, [urlRoleParam]);

  // 3. When Owner Signs In: Seed Cloud Workspace if Empty & Sync Custom Templates
  useEffect(() => {
    if (!ownerUid) return;
    let active = true;

    if (!hasSeededCloudRef.current) {
      hasSeededCloudRef.current = true;
      seedCloudWorkspaceIfEmpty(ownerUid, {
        activeProfileId: activeProfileIdRef.current,
        activeData: cvDataRef.current,
        activeSettings: settingsRef.current,
        profiles: profilesRef.current,
      })
        .then((didSeed) => {
          if (!active) return;
          if (didSeed) {
            setCloudSyncStatus('synced');
            showToast('প্রথমবার Firebase ক্লাউড ডাটাবেজ ইনিশিয়ালাইজ ও সিঙ্ক সম্পন্ন হয়েছে!', 'success');
          }
        })
        .catch(() => {
          if (active) setCloudSyncStatus('error');
        });
    }

    const unsubTpls = subscribeCustomTemplates(ownerUid, (cloudTpls) => {
      if (cloudTpls.length > 0) {
        setCustomTemplates(cloudTpls);
      }
    });

    return () => {
      active = false;
      unsubTpls();
    };
  }, [ownerUid, showToast]);

  // 4. Debounced Cloud Auto-Sync whenever Verified Owner Edits CV, Design Settings, or Active Profile
  useEffect(() => {
    if (!isStudioUnlocked || !ownerUid) return;
    if (suppressCloudSyncRef.current) {
      suppressCloudSyncRef.current = false;
      return;
    }

    setCloudSyncStatus('syncing');
    const timer = window.setTimeout(async () => {
      try {
        await savePublicSiteState(ownerUid, {
          activeProfileId: activeProfileIdRef.current,
          activeData: cvDataRef.current,
          activeSettings: settingsRef.current,
        });

        const currentIdx = profilesRef.current.findIndex((p) => p.id === activeProfileIdRef.current);
        if (currentIdx >= 0) {
          const updatedProfile: CVProfile = {
            ...profilesRef.current[currentIdx],
            data: cvDataRef.current,
            settings: settingsRef.current,
            updatedAt: new Date().toISOString(),
          };
          await upsertPublicProfile(ownerUid, updatedProfile, currentIdx);
        }
        setCloudSyncStatus('synced');
      } catch (err) {
        console.error('Auto-sync failed:', err);
        setCloudSyncStatus('error');
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [cvData, settings, activeProfileId, isStudioUnlocked, ownerUid]);

  function mapFirebaseAuthError(err: unknown, fallback: string): string {
    const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
    switch (code) {
      case 'auth/unauthorized-owner-email':
        return `Security lock: only ${OWNER_ADMIN_EMAIL} is authorized to access this studio.`;
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password. If this is your first time, switch to "First-Time Setup" to create your password.';
      case 'auth/email-already-in-use':
        return 'A password is already configured for this email. Use "Sign In" or "Reset Password".';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password with at least 8 characters.';
      case 'auth/too-many-requests':
        return 'Temporarily blocked due to repeated failed attempts. Please wait a moment or reset your password.';
      case 'auth/operation-not-allowed':
        return `Enable "Email/Password" in Firebase Console (${FIREBASE_PROJECT_ID}) → Authentication → Sign-in method.`;
      case 'auth/requires-recent-login':
        return 'For your security, please sign in again before updating your password.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/unauthorized-domain': {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        return `Domain (${currentHost}) is not listed in Firebase Authorized Domains (${FIREBASE_PROJECT_ID}). Use Email & Password above, or add this domain in Firebase Console.`;
      }
      default:
        return fallback;
    }
  }

  // Firebase Owner Auth Handlers (Email/Password + Optional Google)
  async function handleEmailPasswordLogin(email: string, password: string) {
    setAuthError('');
    setAuthSuccess('');
    try {
      const user = await signInOwnerWithEmailPassword(email, password);
      if (!user.emailVerified) {
        setAuthError('');
        setAuthSuccess('Credentials accepted. Please click the verification link sent to your email to continue.');
      }
    } catch (err: unknown) {
      setAuthError(mapFirebaseAuthError(err, 'Unable to sign in. Please verify your credentials and try again.'));
      throw err;
    }
  }

  async function handleFirstTimeSetup(email: string, password: string) {
    setAuthError('');
    setAuthSuccess('');
    try {
      await registerOwnerWithEmailPassword(email, password);
      setAuthSuccess(
        `Verification link sent to ${OWNER_ADMIN_EMAIL}. Open your Gmail inbox (or Spam folder), click the link, then press "I've Verified My Email" below.`
      );
    } catch (err: unknown) {
      setAuthError(mapFirebaseAuthError(err, 'Unable to complete initial setup.'));
    }
  }

  async function handleSendPasswordReset(email: string) {
    setAuthError('');
    setAuthSuccess('');
    try {
      await sendOwnerPasswordReset(email);
      setAuthSuccess(
        `Password reset email sent to ${OWNER_ADMIN_EMAIL}. Follow the link in your inbox to choose a new password.`
      );
    } catch (err: unknown) {
      setAuthError(mapFirebaseAuthError(err, 'Failed to send password reset email.'));
    }
  }

  async function handleResendVerification() {
    setAuthError('');
    setAuthSuccess('');
    try {
      await resendOwnerVerificationEmail();
      setAuthSuccess(`A new verification link has been sent to ${OWNER_ADMIN_EMAIL}.`);
    } catch (err: unknown) {
      setAuthError(mapFirebaseAuthError(err, 'Unable to send verification link right now.'));
    }
  }

  async function handleRefreshVerification() {
    setAuthError('');
    setAuthSuccess('');
    try {
      const refreshed = await refreshOwnerVerificationStatus();
      if (refreshed && isAuthorizedOwner(refreshed)) {
        setAuthUser(refreshed);
        setLoginModalOpen(false);
        setSettings((prev) => ({ ...prev, portfolioMode: false }));
        showToast('Email verified! CV Studio unlocked.', 'success');
      } else {
        setAuthError('Email is not verified yet. Please click the link in your Gmail inbox and try again.');
      }
    } catch (err: unknown) {
      setAuthError(mapFirebaseAuthError(err, 'Unable to check verification status.'));
    }
  }

  async function handleGoogleLogin() {
    setAuthError('');
    setAuthSuccess('');
    try {
      const user = await signInOwnerWithGoogle();
      if (!isAuthorizedOwner(user)) {
        setAuthError(
          `This account (${user.email || 'Unknown'}) is not authorized. Please sign in with ${OWNER_ADMIN_EMAIL}.`
        );
      }
    } catch (err: unknown) {
      setAuthError(mapFirebaseAuthError(err, 'Google sign-in could not be completed.'));
    }
  }

  async function handleChangePassword(currentPassword: string, newPassword: string) {
    try {
      await changeOwnerPassword(currentPassword, newPassword);
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
    } catch (err: unknown) {
      throw new Error(mapFirebaseAuthError(err, 'বর্তমান পাসওয়ার্ড সঠিক নয় বা পরিবর্তন করা যায়নি।'));
    }
  }

  async function handleLinkPassword(newPassword: string) {
    try {
      await linkOwnerPassword(newPassword);
      const refreshed = await refreshOwnerVerificationStatus();
      if (refreshed) setAuthUser(refreshed);
      showToast('অ্যাকাউন্টে নতুন লগইন পাসওয়ার্ড যুক্ত হয়েছে!', 'success');
    } catch (err: unknown) {
      throw new Error(mapFirebaseAuthError(err, 'পাসওয়ার্ড সেট করা যায়নি।'));
    }
  }

  async function handleSignOutOwner() {
    try {
      await signOutOwner();
      setAuthError('');
      setAuthSuccess('');
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLockStudio() {
    setIsUnifiedToolsOpen(false);
    setExportHubOpen(false);
    setProfileManagerOpen(false);
    await handleSignOutOwner();
    showToast('সাইন আউট সম্পন্ন ও স্টুডিও লক করা হয়েছে — এখন শুধু লাইভ ওয়েবসাইট দেখা যাবে।', 'info');
  }

  async function handleSyncCloudNow() {
    if (!ownerUid) return;
    setCloudSyncStatus('syncing');
    try {
      await savePublicSiteState(ownerUid, {
        activeProfileId: activeProfileIdRef.current,
        activeData: cvDataRef.current,
        activeSettings: settingsRef.current,
      });
      await Promise.all(
        profilesRef.current.map((p, idx) =>
          upsertPublicProfile(
            ownerUid,
            p.id === activeProfileIdRef.current
              ? { ...p, data: cvDataRef.current, settings: settingsRef.current }
              : p,
            idx
          )
        )
      );
      await Promise.all(customTemplates.map((tpl) => upsertCustomTemplateCloud(ownerUid, tpl)));
      setCloudSyncStatus('synced');
      showToast('সমস্ত প্রোফাইল ও ডিজাইন সফলভাবে ক্লাউডে পাবলিশ হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      setCloudSyncStatus('error');
      showToast('ক্লাউড সিঙ্কে সমস্যা হয়েছে — কনসোল চেক করুন।', 'error');
    }
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

  // Document Height Meter & Responsive Canvas Width Observer
  useEffect(() => {
    const el = document.getElementById('cvDocument');
    const host = canvasHostRef.current;
    const updateMetrics = () => {
      if (el && el.scrollHeight > 0) setDocHeight(el.scrollHeight);
      if (host && host.clientWidth > 0) setCanvasWidth(host.clientWidth);
    };
    updateMetrics();
    const obs = new ResizeObserver(updateMetrics);
    if (el) obs.observe(el);
    if (host) obs.observe(host);
    return () => obs.disconnect();
  }, [cvData, settings, showPublicWebsite, isStudioOpen, isRightRailOpen, zenMode]);

  const viewportFitScale = useMemo(() => {
    if (!canvasWidth || canvasWidth >= 836) return 1;
    const horizontalPad = canvasWidth < 640 ? 20 : 48;
    return Math.max(0.38, Math.min(1, (canvasWidth - horizontalPad) / 794));
  }, [canvasWidth]);

  const effectiveZoomScale = Math.round(viewportFitScale * (settings.zoomLevel || 1) * 1000) / 1000;

  const spreadMetrics = useMemo(() => {
    const avail = Math.max(700, canvasWidth - 88);
    const cardWidth = Math.min(532, Math.max(330, Math.floor(avail / 2)));
    const scale = Math.round((cardWidth / 794) * 1000) / 1000;
    const cardHeight = Math.round(1123 * scale);
    return { cardWidth, scale, cardHeight };
  }, [canvasWidth]);

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
    hasVisitorPickedLensRef.current = true;
    suppressCloudSyncRef.current = true;
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

    const currentIdx = profiles.findIndex((p) => p.id === activeProfileId);
    const updatedPrev =
      currentIdx >= 0
        ? { ...profiles[currentIdx], data: cvData, settings, updatedAt: new Date().toISOString() }
        : null;

    // Save current active profile state before switching
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfileId && updatedPrev ? updatedPrev : p))
    );
    if (ownerUid && updatedPrev && currentIdx >= 0) {
      void upsertPublicProfile(ownerUid, updatedPrev, currentIdx).catch(console.error);
    }

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

    const nextList = [
      ...profiles.map((p) =>
        p.id === activeProfileId
          ? { ...p, data: cvData, settings, updatedAt: new Date().toISOString() }
          : p
      ),
      newProfile,
    ];
    setProfiles(nextList);
    cvDataRef.current = newProfile.data;
    setCvData(newProfile.data);
    setSettings(newProfile.settings);
    setActiveProfileId(newProfile.id);
    setHistoryPast([]);
    setHistoryFuture([]);

    if (ownerUid) {
      void upsertPublicProfile(ownerUid, newProfile, nextList.length - 1).catch(console.error);
    }
    showToast(`নতুন কাস্টম প্রোফাইল "${name}" তৈরি ও লোড হয়েছে!`, 'success');
  }

  function handleRenameProfile(id: string, newName: string) {
    const idx = profiles.findIndex((p) => p.id === id);
    const updated =
      idx >= 0 ? { ...profiles[idx], name: newName, updatedAt: new Date().toISOString() } : null;
    setProfiles((prev) => prev.map((p) => (p.id === id && updated ? updated : p)));
    if (ownerUid && updated && idx >= 0) {
      void upsertPublicProfile(ownerUid, updated, idx).catch(console.error);
    }
    showToast(`প্রোফাইলের নাম পরিবর্তন করে "${newName}" করা হয়েছে!`, 'success');
  }

  function handleDeleteProfile(id: string) {
    if (id === 'prof_master') return;
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (ownerUid) {
      void deletePublicProfileCloud(id).catch(console.error);
    }
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

  function handleFitHeight() {
    if (typeof window === 'undefined') return;
    const availH = Math.max(400, window.innerHeight - 195);
    const ratio = Math.max(0.5, Math.min(1, Math.round((availH / 1123) * 20) / 20));
    setSettings((prev) => ({ ...prev, zoomLevel: ratio }));
  }

  function handleToggleSpread() {
    setSideBySideSpread((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && window.innerWidth < 1480) {
        setIsStudioOpen(false);
        setIsRightRailOpen(false);
      }
      return next;
    });
  }

  function handleJumpToSection(sectionId: string) {
    const host = canvasHostRef.current;
    if (!host) return;
    if (sectionId === 'cvHeader') {
      host.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = host.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    if (ownerUid) {
      void upsertCustomTemplateCloud(ownerUid, preset).catch(console.error);
    }
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
    if (ownerUid) {
      void deleteCustomTemplateCloud(ownerUid, id).catch(console.error);
    }
    if (settings.customTemplateId === id) {
      setSettings((prev) => ({ ...prev, customTemplateId: undefined }));
    }
    showToast('কাস্টম টেমপ্লেট ডিলিট করা হয়েছে।', 'info');
  }

  function handleImportCustomTemplates(imported: CustomTemplatePreset[]) {
    setCustomTemplates((prev) => [...imported, ...prev]);
    if (ownerUid) {
      imported.forEach((tpl) => {
        void upsertCustomTemplateCloud(ownerUid, tpl).catch(console.error);
      });
    }
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

  // Import Full JSON Workspace Backup
  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const nextData = parsed.data ? mergeCVData(parsed.data) : null;
        const nextSettings = parsed.settings ? mergeStudioSettings(parsed.settings) : null;

        if (nextData) applyCVUpdate(nextData);
        if (nextSettings) setSettings(nextSettings);

        if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
          const restoredProfiles: CVProfile[] = parsed.profiles.map((p: CVProfile) => ({
            ...p,
            data: mergeCVData(p.data),
            settings: mergeStudioSettings(p.settings),
          }));
          setProfiles(restoredProfiles);
          if (ownerUid) {
            void Promise.all(
              restoredProfiles.map((p, idx) => upsertPublicProfile(ownerUid, p, idx))
            ).catch((err) => console.error('Cloud profile restore failed:', err));
          }
        }

        if (typeof parsed.activeProfileId === 'string' && parsed.activeProfileId) {
          setActiveProfileId(parsed.activeProfileId);
        }

        if (Array.isArray(parsed.customTemplates)) {
          const restoredTemplates = parsed.customTemplates as CustomTemplatePreset[];
          setCustomTemplates(restoredTemplates);
          if (ownerUid) {
            void Promise.all(
              restoredTemplates.map((tpl) => upsertCustomTemplateCloud(ownerUid, tpl))
            ).catch((err) => console.error('Cloud template restore failed:', err));
          }
        }

        if (Array.isArray(parsed.jobApplications)) {
          const restoredApps = parsed.jobApplications as JobApplication[];
          try {
            localStorage.setItem('shoyeb_job_tracker_v1', JSON.stringify(restoredApps));
          } catch {
            // ignore quota errors
          }
          if (ownerUid) {
            void Promise.all(
              restoredApps.map((app) => upsertJobApplicationCloud(ownerUid, app))
            ).catch((err) => console.error('Cloud job tracker restore failed:', err));
          }
        }

        showToast('সম্পূর্ণ প্রজেক্ট ব্যাকআপ সফলভাবে রিস্টোর ও সিঙ্ক হয়েছে!', 'success');
      } catch {
        showToast('JSON ফাইলটি পড়া যায়নি', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleDownloadPDF() {
    showToast('পিডিএফ তৈরি হচ্ছে...', 'info');
    const result = await exportDirectPDF('cvDocument', cvData.name);
    if (result === 'downloaded') {
      confetti({ particleCount: 50, spread: 60 });
      showToast('PDF ডাউনলোড সম্পন্ন হয়েছে!', 'success');
    } else {
      showToast('প্রিন্ট ডায়ালগ থেকে "Save as PDF" বেছে নিন।', 'info');
    }
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
    <div
      className={`print-shell-reset min-h-screen flex flex-col bg-[#060911] text-slate-100 ${
        !showPublicWebsite ? 'h-[100dvh] overflow-hidden' : ''
      }`}
    >
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
            onUpdatePortfolioStyle={
              isStudioUnlocked
                ? (designStyle) =>
                    setSettings((s) => ({
                      ...s,
                      portfolio: {
                        ...(s.portfolio || INITIAL_SETTINGS.portfolio!),
                        designStyle,
                      },
                    }))
                : undefined
            }
          />
          {/* Offscreen clean A4 document for 1-click PDF & Print directly from Live Website */}
          <div
            className="print-only-cv-host"
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
            onOpenExportHub={() => {
              setExportHubTab('all');
              setExportHubOpen(true);
            }}
            onOpenSecuritySettings={() => {
              setExportHubTab('security');
              setExportHubOpen(true);
            }}
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
              onOpenShortcuts={() => setShortcutsModalOpen(true)}
              mobileStudioView={mobileStudioView}
              onSetMobileStudioView={setMobileStudioView}
            />
          )}

          {zenMode && (
            <div className="no-print fixed top-4 right-5 z-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrintPreviewOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0B1120]/95 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-xl backdrop-blur whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" /> Preview
              </button>
              <button
                type="button"
                onClick={() => setZenMode(false)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl whitespace-nowrap"
              >
                <Minimize2 className="w-3.5 h-3.5" /> Exit Focus Mode
              </button>
            </div>
          )}

          <div className="print-shell-reset flex-1 min-h-0 flex relative overflow-hidden">
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

            {/* Center Live A4 Canvas (+ Mobile App Editor on < 1024px when mobileStudioView === 'app') */}
            <main
              ref={canvasHostRef}
              className="print-shell-reset flex-1 py-3 sm:py-6 px-2 sm:px-6 pb-24 lg:pb-6 overflow-y-auto overflow-x-auto bg-[#060911]"
            >
              {mobileStudioView === 'app' && (
                <MobileCVEditor
                  cvData={cvData}
                  settings={settings}
                  score={score}
                  estimatedPages={estimatedPages}
                  overflowPx={overflowPx}
                  activeProfileName={profiles.find((p) => p.id === activeProfileId)?.name || 'Master CV'}
                  canUndoCV={historyPast.length > 0}
                  canRedoCV={historyFuture.length > 0}
                  onUndoCV={handleUndoCV}
                  onRedoCV={handleRedoCV}
                  onUpdateCVData={applyCVUpdate}
                  onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
                  onSwitchToPaperView={() => setMobileStudioView('paper')}
                  onOpenATSModal={() => setAtsModalOpen(true)}
                  onOpenProfileManager={() => setProfileManagerOpen(true)}
                  onOpenTemplateGallery={() => setTemplateGalleryOpen(true)}
                  onOpenSignatureModal={() => setSignatureModalOpen(true)}
                  onOpenAddSectionModal={() => setAddSectionModalOpen(true)}
                  onTogglePortfolioMode={() =>
                    setSettings((prev) => ({ ...prev, portfolioMode: true }))
                  }
                  onShowToast={showToast}
                />
              )}

              {/* Clean Floating Canvas Bar (Shown on Desktop lg+ or on Mobile when switched to 'paper' view) */}
              <div
                className={`${
                  mobileStudioView === 'app' ? 'hidden lg:flex' : 'flex'
                } no-print max-w-[210mm] mx-auto mb-2.5 sm:mb-4 bg-[#090E1A] border border-slate-800/90 rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs shadow-lg`}
              >
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-semibold text-slate-200 tabular-nums whitespace-nowrap text-[11px] sm:text-xs">
                    {estimatedPages} {estimatedPages > 1 ? 'Pages' : 'Page'} · {Math.round(docHeight * 0.264583)}mm
                  </span>

                  {overflowPx > 0 ? (
                    <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2 sm:px-2.5 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="tabular-nums">
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
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Clean A4 Fit
                    </span>
                  )}
                </div>

                {/* Canvas Zoom, Page Break Guide, Ruler, 2-Page Spread & Right Rail Toggle */}
                <div className="flex items-center gap-1 bg-[#0D1424] px-2 py-1 rounded-lg border border-slate-800 ml-auto overflow-x-auto no-scrollbar max-w-full">
                  {estimatedPages >= 2 && (
                    <>
                      <button
                        type="button"
                        onClick={handleToggleSpread}
                        className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition whitespace-nowrap ${
                          sideBySideSpread
                            ? 'bg-emerald-600/25 text-emerald-300'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title="Page 1 এবং Page 2 পাশাপাশি দেখুন (অটো-ফিট)"
                      >
                        <Columns2 className="w-3.5 h-3.5" />
                        <span>{sideBySideSpread ? 'Back to Edit' : '2-Page Spread'}</span>
                      </button>
                      <div className="hidden lg:block h-3.5 w-px bg-slate-800 mx-0.5" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowRulerGuides(!showRulerGuides)}
                    className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition whitespace-nowrap ${
                      showRulerGuides
                        ? 'bg-slate-800 text-cyan-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="A4 Millimeter Ruler & Margin Frame চালু/বন্ধ করুন"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Ruler</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPageGuide(!showPageGuide)}
                    className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition whitespace-nowrap ${
                      showPageGuide
                        ? 'bg-blue-600/25 text-blue-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="A4 পেজ ব্রেক লাইন অন/অফ করুন"
                  >
                    {showPageGuide ? 'Guides: On' : 'Guides: Off'}
                  </button>
                  <div className="h-3.5 w-px bg-slate-800 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => handleZoomChange(-0.1)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-200 min-w-[38px] text-center">
                    {Math.round(effectiveZoomScale * 100)}%
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
                    onClick={handleFitHeight}
                    className="hidden lg:inline-block px-1.5 py-0.5 rounded hover:bg-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white whitespace-nowrap"
                    title="পুরো A4 পাতা ল্যাপটপ স্ক্রিনের উচ্চতা অনুযায়ী ফিট করুন"
                  >
                    Fit H
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-1.5 sm:px-2 py-0.5 rounded hover:bg-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white whitespace-nowrap"
                    title={viewportFitScale < 1 ? 'Fit to Screen' : 'Reset 100%'}
                  >
                    {viewportFitScale < 1 ? 'Fit' : 'Reset'}
                  </button>

                  <div className="lg:hidden h-3.5 w-px bg-slate-800 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => setPrintPreviewOpen(true)}
                    className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-[11px] font-semibold text-cyan-300 transition whitespace-nowrap"
                    title="A4 Print Preview"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Preview</span>
                  </button>

                  {!isRightRailOpen && !zenMode && (
                    <>
                      <div className="hidden lg:block h-3.5 w-px bg-slate-800 mx-0.5" />
                      <button
                        type="button"
                        onClick={() => setIsRightRailOpen(true)}
                        className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-blue-300 transition whitespace-nowrap"
                        title="Open Live Studio Monitor & Section Navigator"
                      >
                        <PanelRightOpen className="w-3 h-3" />
                        <span>Live Audit</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Laptop & Desktop 2-Page Side-by-Side Spread Preview (dynamically fitted to viewport) */}
              {sideBySideSpread && estimatedPages >= 2 && (
                <div className="no-print max-w-[1160px] mx-auto mb-6">
                  <div className="flex flex-wrap justify-center gap-5">
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono font-semibold text-slate-400 text-center">
                        Page 1 of {estimatedPages}
                      </div>
                      <div
                        className="rounded-lg shadow-2xl border border-slate-800 overflow-hidden bg-white"
                        style={{
                          width: `${spreadMetrics.cardWidth}px`,
                          height: `${spreadMetrics.cardHeight}px`,
                        }}
                      >
                        <div
                          ref={spreadPage1Ref}
                          style={{
                            width: '794px',
                            transform: `scale(${spreadMetrics.scale})`,
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
                        style={{
                          width: `${spreadMetrics.cardWidth}px`,
                          height: `${spreadMetrics.cardHeight}px`,
                        }}
                      >
                        <div
                          ref={spreadPage2Ref}
                          style={{
                            width: '794px',
                            transform: `scale(${spreadMetrics.scale})`,
                            transformOrigin: 'top left',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop & Laptop A4 Millimeter Top Ruler (Hidden on small phones) */}
              {showRulerGuides && !sideBySideSpread && (
                <div
                  className="no-print hidden md:flex items-end justify-between mx-auto mb-1 text-[9px] studio-mono text-slate-500 border-b border-slate-800/80 pb-0.5 select-none"
                  style={{ width: `${Math.round(794 * effectiveZoomScale)}px` }}
                  aria-hidden="true"
                >
                  {[0, 30, 60, 90, 120, 150, 180, 210].map((mm) => (
                    <span key={mm} className="flex flex-col items-center leading-none">
                      <span>{mm}</span>
                      <span className="w-px h-1.5 bg-slate-700 mt-0.5" />
                    </span>
                  ))}
                </div>
              )}

              {/* Document wrapper with Responsive Auto-Fit + Zoom scaling (kept offscreen when Mobile App Editor is active so page count & PDF capture remain accurate) */}
              <div
                className={`cv-zoom-frame mx-auto relative ${
                  sideBySideSpread && estimatedPages >= 2
                    ? 'fixed left-[-12000px] top-0 opacity-0 pointer-events-none'
                    : mobileStudioView === 'app'
                    ? 'fixed left-[-12000px] top-0 opacity-0 pointer-events-none lg:static lg:opacity-100 lg:pointer-events-auto'
                    : ''
                }`}
                style={{
                  width: `${Math.round(794 * effectiveZoomScale)}px`,
                  height: `${Math.round((docHeight || 1120) * effectiveZoomScale)}px`,
                }}
              >
                <div
                  className="cv-document-wrapper relative transition-transform duration-150"
                  style={{
                    width: '794px',
                    transform: `scale(${effectiveZoomScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/* Visual A4 Print Safe-Margin Frame (Non-printable) */}
                  {showRulerGuides && settings.isEditMode && (
                    <div
                      className="no-print absolute pointer-events-none border border-dashed border-blue-400/25 z-20"
                      style={{
                        top: `${settings.pagePadding}mm`,
                        left: `${settings.pagePadding}mm`,
                        right: `${settings.pagePadding}mm`,
                        bottom: '40px',
                      }}
                    />
                  )}

                  {/* Visual A4 Page Break Guidelines (Non-printable) */}
                  {showPageGuide && (
                    <div
                      className="no-print absolute left-0 right-0 pointer-events-none flex items-center justify-between z-30"
                      style={{ top: '1123px' }}
                    >
                      <div className="h-[2px] flex-1 border-b-2 border-dashed border-rose-500/80"></div>
                      <span className="bg-rose-950 border border-rose-500/80 text-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap mx-2">
                        A4 Page 1 End (297mm) / Page 2 Start
                      </span>
                      <div className="h-[2px] flex-1 border-b-2 border-dashed border-rose-500/80"></div>
                    </div>
                  )}

                  {showPageGuide && docHeight > 2246 && (
                    <div
                      className="no-print absolute left-0 right-0 pointer-events-none flex items-center justify-between z-30"
                      style={{ top: '2246px' }}
                    >
                      <div className="h-[2px] flex-1 border-b-2 border-dashed border-rose-500/80"></div>
                      <span className="bg-rose-950 border border-rose-500/80 text-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap mx-2">
                        A4 Page 2 End (594mm) / Page 3 Start
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
              </div>
            </main>

            {/* Right Desktop 3-Pane Studio Workbench Rail */}
            {!zenMode && (
              <StudioRightRail
                isOpen={isRightRailOpen}
                onClose={() => setIsRightRailOpen(false)}
                cvData={cvData}
                settings={settings}
                atsScoreData={atsScoreData}
                wordCount={wordCount}
                readTimeSeconds={readTimeSeconds}
                estimatedPages={estimatedPages}
                docHeightPx={docHeight}
                overflowPx={overflowPx}
                onOpenATSModal={() => setAtsModalOpen(true)}
                onAutoFit1Page={handleAutoFit1Page}
                onAutoFit2Pages={handleAutoFit2Pages}
                onJumpToSection={handleJumpToSection}
                onOpenShortcuts={() => setShortcutsModalOpen(true)}
              />
            )}
          </div>

          {/* Mobile & Tablet Thumb-Zone Native App Bottom Bar (<1024px) */}
          {!zenMode && (
            <nav
              aria-label="Mobile Studio Actions"
              className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080D1A]/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1.5 grid grid-cols-4 gap-1.5 shadow-[0_-8px_24px_rgba(2,6,23,0.45)]"
            >
              <button
                type="button"
                onClick={() => {
                  setIsStudioOpen(false);
                  setIsUnifiedToolsOpen(false);
                  setMobileStudioView('app');
                }}
                className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition ${
                  mobileStudioView === 'app' && !isStudioOpen && !isUnifiedToolsOpen
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>App Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsStudioOpen(false);
                  setIsUnifiedToolsOpen(false);
                  setMobileStudioView('paper');
                }}
                className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition ${
                  mobileStudioView === 'paper' && !isStudioOpen && !isUnifiedToolsOpen
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>A4 Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsUnifiedToolsOpen(false);
                  setIsStudioOpen((v) => !v);
                }}
                className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition ${
                  isStudioOpen
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Design</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsStudioOpen(false);
                  setIsUnifiedToolsOpen((v) => !v);
                }}
                className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition ${
                  isUnifiedToolsOpen
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Tools</span>
              </button>
            </nav>
          )}

          {/* Right Unified Tools Drawer */}
          <UnifiedToolsDrawer
            isOpen={isUnifiedToolsOpen}
            onClose={() => setIsUnifiedToolsOpen(false)}
            cvData={cvData}
            settings={settings}
            score={score}
            ownerUid={ownerUid}
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
        onEmailPasswordLogin={handleEmailPasswordLogin}
        onFirstTimeSetup={handleFirstTimeSetup}
        onSendPasswordReset={handleSendPasswordReset}
        onResendVerification={handleResendVerification}
        onRefreshVerification={handleRefreshVerification}
        onGoogleLogin={handleGoogleLogin}
        onSignOut={handleSignOutOwner}
        signedInEmail={authUser?.email || null}
        isEmailVerified={Boolean(authUser?.emailVerified)}
        isAuthorized={isStudioUnlocked}
        authError={authError}
        authSuccess={authSuccess}
        onClearMessages={() => {
          setAuthError('');
          setAuthSuccess('');
        }}
      />

      <ExportHubModal
        isOpen={exportHubOpen}
        onClose={() => setExportHubOpen(false)}
        initialTab={exportHubTab}
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
          let jobApplications: JobApplication[] = [];
          try {
            const rawApps = localStorage.getItem('shoyeb_job_tracker_v1');
            if (rawApps) jobApplications = JSON.parse(rawApps);
          } catch {
            // ignore
          }
          const latestProfiles = profiles.map((p) =>
            p.id === activeProfileId
              ? { ...p, data: cvData, settings, updatedAt: new Date().toISOString() }
              : p
          );
          exportJSONBackup(cvData, settings, {
            activeProfileId,
            profiles: latestProfiles,
            customTemplates,
            jobApplications,
          });
          showToast('সম্পূর্ণ A-to-Z প্রজেক্ট ব্যাকআপ (.json) ডাউনলোড হয়েছে!', 'success');
        }}
        onImportJSON={handleImportJSON}
        onCopyAllText={async () => {
          await copyAllCVText(cvData, settings);
          showToast('সম্পূর্ণ সিভির টেক্সট ক্লিপবোর্ডে কপি হয়েছে!', 'success');
        }}
        ownerEmail={authUser?.email || null}
        cloudSyncStatus={cloudSyncStatus}
        onSyncCloudNow={handleSyncCloudNow}
        onLockStudio={handleLockStudio}
        hasPasswordProvider={hasPasswordProvider}
        onChangePassword={handleChangePassword}
        onLinkPassword={handleLinkPassword}
        onSendPasswordReset={() => handleSendPasswordReset(OWNER_ADMIN_EMAIL)}
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

      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Floating Toast Container */}
      <div
        className={`no-print fixed left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm z-50 flex flex-col gap-2 pointer-events-none ${
          showPublicWebsite ? 'bottom-20 md:bottom-4' : 'bottom-20 lg:bottom-4'
        }`}
      >
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
