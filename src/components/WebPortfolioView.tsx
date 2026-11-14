import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  FileText,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  GraduationCap,
  Award,
  Layers,
  ArrowRight,
  Code2,
  Database,
  ShieldCheck,
  Server,
  Lock,
  Unlock,
  Globe,
  Sun,
  Moon,
  X,
  Send,
  Copy,
  Check,
  Briefcase,
  Search,
  QrCode,
  UserPlus,
  Languages,
  Compass,
  Eye,
  Menu,
  ArrowUp,
} from 'lucide-react';
import { CVData, PortfolioAccentTheme, ProjectItem, StudioSettings } from '../types/cv';
import { exportVCard } from '../utils/exporters';

interface PublicProfileSummary {
  id: string;
  name: string;
  rolePreset: string;
  description: string;
}

interface WebPortfolioViewProps {
  cvData: CVData;
  settings: StudioSettings;
  isStudioUnlocked: boolean;
  activeRoleLabel?: string;
  profiles?: PublicProfileSummary[];
  activeProfileId?: string;
  onSelectPublicProfile?: (id: string) => void;
  onOpenLogin: () => void;
  onLockStudio: () => void;
  onBackToEditor: () => void;
  onExportPDF: () => void;
  onOpenPrintPreview?: () => void;
}

const ROLE_ROTATIONS = [
  'Data Analyst & Power BI Specialist',
  'Software QA & REST API Engineer',
  'Enterprise IT & Systems Administrator',
];

type ResolvedAccentKey = 'cobalt' | 'emerald' | 'teal' | 'indigo' | 'rose';

const PORTFOLIO_ACCENTS: Record<
  ResolvedAccentKey,
  {
    eyebrow: string;
    navActive: string;
    btnPrimary: string;
    dot: string;
    hoverBorder: string;
    activePill: string;
    tabActive: string;
    progress: string;
  }
> = {
  cobalt: {
    eyebrow: 'text-blue-600 dark:text-cyan-400',
    navActive: 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400',
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white',
    dot: 'bg-blue-600 dark:bg-cyan-400',
    hoverBorder: 'hover:border-blue-500/60',
    activePill: 'bg-blue-600 text-white border-blue-600',
    tabActive: 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-blue-600 via-cyan-500 to-emerald-500',
  },
  emerald: {
    eyebrow: 'text-emerald-600 dark:text-emerald-400',
    navActive: 'border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400',
    btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
    hoverBorder: 'hover:border-emerald-500/60',
    activePill: 'bg-emerald-600 text-white border-emerald-600',
    tabActive: 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-emerald-600 via-teal-500 to-cyan-500',
  },
  teal: {
    eyebrow: 'text-teal-600 dark:text-teal-400',
    navActive: 'border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400',
    btnPrimary: 'bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-500 text-white',
    dot: 'bg-teal-600 dark:bg-teal-400',
    hoverBorder: 'hover:border-teal-500/60',
    activePill: 'bg-teal-600 text-white border-teal-600',
    tabActive: 'bg-white dark:bg-teal-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-teal-600 via-cyan-500 to-blue-500',
  },
  indigo: {
    eyebrow: 'text-indigo-600 dark:text-indigo-400',
    navActive: 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white',
    dot: 'bg-indigo-600 dark:bg-indigo-400',
    hoverBorder: 'hover:border-indigo-500/60',
    activePill: 'bg-indigo-600 text-white border-indigo-600',
    tabActive: 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-indigo-600 via-blue-500 to-cyan-500',
  },
  rose: {
    eyebrow: 'text-rose-600 dark:text-rose-400',
    navActive: 'border-rose-600 dark:border-rose-400 text-rose-600 dark:text-rose-400',
    btnPrimary: 'bg-rose-600 hover:bg-rose-700 dark:hover:bg-rose-500 text-white',
    dot: 'bg-rose-600 dark:bg-rose-400',
    hoverBorder: 'hover:border-rose-500/60',
    activePill: 'bg-rose-600 text-white border-rose-600',
    tabActive: 'bg-white dark:bg-rose-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-rose-600 via-amber-500 to-orange-500',
  },
};

function resolveAccentKey(
  accentTheme: PortfolioAccentTheme | undefined,
  cvPrimaryHex: string
): ResolvedAccentKey {
  if (accentTheme && accentTheme !== 'auto') return accentTheme;
  const hex = (cvPrimaryHex || '#0f4c81').replace('#', '');
  if (hex.length !== 6) return 'cobalt';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (r > g + 45 && r > b + 35) return 'rose';
  if (g > r + 25 && b >= g - 15) return 'teal';
  if (g > r + 25 && g > b + 15) return 'emerald';
  if (r > 55 && b > 140 && r > g + 15) return 'indigo';
  return 'cobalt';
}

function splitTopLevelCommas(input: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(') depth++;
    else if (ch === ')' && depth > 0) depth--;
    if (ch === ',' && depth === 0) {
      const trimmed = current.trim().replace(/\.$/, '');
      if (trimmed) result.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }
  const last = current.trim().replace(/\.$/, '');
  if (last) result.push(last);
  return result;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function parseMonthYear(token: string): Date | null {
  const clean = token.trim().toLowerCase();
  if (!clean) return null;
  if (clean.includes('present') || clean.includes('current') || clean.includes('now')) {
    return new Date();
  }
  const match = clean.match(/([a-z]+)?\s*(\d{4})/);
  if (!match) return null;
  const year = parseInt(match[2], 10);
  const monthIdx = match[1] && MONTH_MAP[match[1]] !== undefined ? MONTH_MAP[match[1]] : 0;
  return new Date(year, monthIdx, 1);
}

function calculateDuration(dateStr: string): string | null {
  const parts = dateStr.split(/\s*[-–—to]+\s*/i);
  if (parts.length < 2) return null;
  const start = parseMonthYear(parts[0]);
  const end = parseMonthYear(parts[1]);
  if (!start || !end) return null;
  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  if (totalMonths <= 0 || totalMonths > 600) return null;
  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;
  const chunks: string[] = [];
  if (yrs > 0) chunks.push(`${yrs} ${yrs === 1 ? 'yr' : 'yrs'}`);
  if (mos > 0) chunks.push(`${mos} ${mos === 1 ? 'mo' : 'mos'}`);
  return chunks.join(' ') || '1 mo';
}

function ProjectBlueprintBanner({ proj }: { proj: ProjectItem }) {
  const hay = (proj.title + ' ' + proj.technologies + ' ' + proj.description).toLowerCase();

  if (hay.includes('power bi') || hay.includes('sql') || hay.includes('etl')) {
    return (
      <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 p-3 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-['JetBrains_Mono',monospace] text-slate-500 dark:text-slate-400">
            Dimensional Analytics
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
            <span>PostgreSQL</span>
            <span className="text-slate-400">→</span>
            <span>ETL</span>
            <span className="text-slate-400">→</span>
            <span className="text-blue-600 dark:text-cyan-400">Star Schema</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-9 shrink-0" aria-hidden="true">
          {[38, 56, 48, 72, 64, 88, 96].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-t-sm ${
                i >= 5 ? 'bg-blue-600 dark:bg-cyan-400' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (hay.includes('postman') || hay.includes('api') || hay.includes('json')) {
    return (
      <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 p-3 flex items-center justify-between gap-4 font-['JetBrains_Mono',monospace]">
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 dark:text-slate-400">API Verification</div>
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            REST CRUD · Bearer Auth · Schema
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            200 OK
          </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300">
            201
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
            4xx
          </span>
        </div>
      </div>
    );
  }

  if (hay.includes('jira') || hay.includes('test') || hay.includes('bva')) {
    return (
      <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 p-3 space-y-2">
        <div className="flex items-center justify-between text-[10.5px] font-['JetBrains_Mono',monospace]">
          <span className="text-slate-500 dark:text-slate-400">QA Coverage Matrix</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">80+ Test Cases · BVA/ECP</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
          <div className="h-full bg-emerald-500 w-[72%]" />
          <div className="h-full bg-blue-500 w-[20%]" />
          <div className="h-full bg-amber-400 w-[8%]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 p-3 flex items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="text-[10px] font-['JetBrains_Mono',monospace] text-slate-500 dark:text-slate-400">
          Full-Stack Architecture
        </div>
        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
          RBAC Auth · Relational DB · Cloud Deploy
        </div>
      </div>
      <div className="w-16 h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex flex-col justify-between shrink-0" aria-hidden="true">
        <div className="flex gap-1">
          <span className="w-1 h-1 rounded-full bg-slate-400" />
          <span className="w-1 h-1 rounded-full bg-slate-400" />
          <span className="w-1 h-1 rounded-full bg-slate-400" />
        </div>
        <div className="h-2 rounded-sm bg-blue-600/25 dark:bg-cyan-500/30 w-full" />
      </div>
    </div>
  );
}

export function WebPortfolioView({
  cvData,
  settings,
  isStudioUnlocked,
  activeRoleLabel,
  profiles = [],
  activeProfileId,
  onSelectPublicProfile,
  onOpenLogin,
  onLockStudio,
  onBackToEditor,
  onExportPDF,
  onOpenPrintPreview,
}: WebPortfolioViewProps) {
  // Light / Dark Mode state (persisted locally)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('shoyeb_portfolio_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  // Scroll Progress, Back-to-Top, Mobile Menu & Active Section Scroll Spy
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [copiedCoord, setCopiedCoord] = useState<'email' | 'phone' | null>(null);

  // Role Specialization Rotation
  const [roleIdx, setRoleIdx] = useState(0);
  const [roleFade, setRoleFade] = useState(true);

  // Interactive Filters & Modals
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [caseTab, setCaseTab] = useState<'overview' | 'architecture' | 'stack'>('overview');

  // Command Palette (Ctrl+K) & QR Card Modal
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCardDataUrl, setQrCardDataUrl] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Zero-Backend Contact Form
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [inquirySubject, setInquirySubject] = useState('Job / Interview Opportunity');
  const [senderMessage, setSenderMessage] = useState('');
  const [contactCopied, setContactCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('shoyeb_portfolio_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Smooth scroll progress (compositor-only transform scaleX)
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    const ids = [
      'about',
      'skills',
      'experience',
      'projects',
      'education',
      ...(cvData.customSections && cvData.customSections.length > 0 ? ['highlights'] : []),
      'contact',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0.05 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [cvData.customSections]);

  // Role rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRoleFade(false);
      setTimeout(() => {
        setRoleIdx((prev) => (prev + 1) % ROLE_ROTATIONS.length);
        setRoleFade(true);
      }, 220);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  // Global ESC + Ctrl/Cmd+K Spotlight Command Palette shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelectedProject(null);
        setCommandOpen(false);
        setQrModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (commandOpen) {
      setCommandQuery('');
      setTimeout(() => commandInputRef.current?.focus(), 40);
    }
  }, [commandOpen]);

  // Generate QR Business Card when opened
  useEffect(() => {
    if (!qrModalOpen) return;
    const shareTarget = window.location.href;
    QRCode.toDataURL(shareTarget, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(setQrCardDataUrl)
      .catch(console.error);
  }, [qrModalOpen]);

  const email = cvData.contacts.find((c) => c.type === 'email')?.label || 'shoyebrabbi@gmail.com';
  const phone = cvData.contacts.find((c) => c.type === 'phone')?.label || '+8801622517200';
  const location = cvData.contacts.find((c) => c.type === 'location')?.label || 'Chattogram, Bangladesh';
  const linkedin = cvData.contacts.find((c) => c.type === 'linkedin')?.url || 'https://linkedin.com/in/shoyebrabbi';
  const github = cvData.contacts.find((c) => c.type === 'github')?.url || 'https://github.com/shoyebrabbi';
  const website = cvData.contacts.find((c) => c.type === 'website')?.url || '';

  const portfolioConfig = settings.portfolio || {
    availabilityActive: true,
    availabilityText: 'Available for Immediate Joining · Chattogram / Dhaka / Remote',
    showSectionNumbers: false,
    accentTheme: 'cobalt' as PortfolioAccentTheme,
    metrics: [
      { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
      { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
      { id: 'm3', value: '80+', label: 'Test Cases Authored' },
      { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
    ],
  };
  const showSectionNumbers = Boolean(portfolioConfig.showSectionNumbers);
  const hasCustomSections = Boolean(cvData.customSections && cvData.customSections.length > 0);
  const accent = PORTFOLIO_ACCENTS[resolveAccentKey(portfolioConfig.accentTheme, settings.themePrimary)];

  function handleCopyCoordinate(type: 'email' | 'phone', val: string) {
    navigator.clipboard.writeText(val);
    setCopiedCoord(type);
    setTimeout(() => setCopiedCoord(null), 1800);
  }

  const filteredSkills = useMemo(() => {
    if (skillFilter === 'all') return cvData.skills;
    const byId = cvData.skills.filter((s) => s.id === skillFilter);
    if (byId.length > 0) return byId;
    return cvData.skills;
  }, [cvData.skills, skillFilter]);

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'all') return cvData.projects;
    return cvData.projects.filter((p) => {
      const hay = (p.title + ' ' + p.technologies + ' ' + p.description).toLowerCase();
      if (projectFilter === 'data') return hay.includes('power bi') || hay.includes('sql') || hay.includes('etl');
      if (projectFilter === 'sqa') return hay.includes('postman') || hay.includes('qa') || hay.includes('test') || hay.includes('jira');
      if (projectFilter === 'fullstack') return hay.includes('node') || hay.includes('portal') || hay.includes('vercel') || hay.includes('tailwind');
      return true;
    });
  }, [cvData.projects, projectFilter]);

  // Command Palette searchable items
  const commandItems = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    const baseActions = [
      {
        id: 'act-pdf',
        group: 'Actions',
        title: 'Download Tailored A4 CV (PDF)',
        subtitle: 'Instant export of active profile view',
        run: () => onExportPDF(),
      },
      {
        id: 'act-vcard',
        group: 'Actions',
        title: 'Save Contact Card (.vcf)',
        subtitle: `${phone} · ${email}`,
        run: () => exportVCard(cvData),
      },
      {
        id: 'act-qr',
        group: 'Actions',
        title: 'Open Digital QR Business Card',
        subtitle: 'Scan or copy shareable portfolio link',
        run: () => setQrModalOpen(true),
      },
      {
        id: 'act-theme',
        group: 'Actions',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle display contrast theme',
        run: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'nav-skills',
        group: 'Navigate',
        title: 'Jump to Technical Skills',
        subtitle: 'SQL, Power BI, QA Testing, API, Infrastructure',
        run: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }),
      },
      {
        id: 'nav-exp',
        group: 'Navigate',
        title: 'Jump to Work Experience',
        subtitle: cvData.experiences.map((e) => e.company).join(' · '),
        run: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }),
      },
      {
        id: 'nav-proj',
        group: 'Navigate',
        title: 'Jump to Projects & Case Studies',
        subtitle: `${cvData.projects.length} documented projects`,
        run: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }),
      },
      ...(cvData.customSections && cvData.customSections.length > 0
        ? [
            {
              id: 'nav-highlights',
              group: 'Navigate',
              title: 'Jump to Additional Highlights',
              subtitle: cvData.customSections.map((s) => s.title).join(' · '),
              run: () => document.getElementById('highlights')?.scrollIntoView({ behavior: 'smooth' }),
            },
          ]
        : []),
      {
        id: 'nav-contact',
        group: 'Navigate',
        title: 'Jump to Direct Contact Form',
        subtitle: email,
        run: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
      },
    ];

    const projectActions = cvData.projects.map((p) => ({
      id: `proj-${p.id}`,
      group: 'Projects',
      title: p.title,
      subtitle: p.technologies,
      run: () => {
        setCaseTab('overview');
        setSelectedProject(p);
      },
    }));

    const roleActions =
      onSelectPublicProfile && profiles.length > 0
        ? profiles.map((prof) => ({
            id: `role-${prof.id}`,
            group: 'Role Lenses',
            title: `Switch Portfolio View: ${prof.name}`,
            subtitle: prof.description,
            run: () => onSelectPublicProfile(prof.id),
          }))
        : [];

    const all = [...baseActions, ...projectActions, ...roleActions];
    if (!q) return all;
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [commandQuery, cvData, email, phone, theme, profiles, onExportPDF, onSelectPublicProfile]);

  function handleSendMailto(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`${inquirySubject} — from ${senderName || 'Portfolio Visitor'}`);
    const body = encodeURIComponent(
      `Name: ${senderName || 'N/A'}\nEmail / Company: ${senderEmail || 'N/A'}\n\n${senderMessage}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  function handleCopyMessage() {
    const formatted = `To: ${email}\nSubject: ${inquirySubject}\nFrom: ${senderName} (${senderEmail})\n\n${senderMessage}`;
    navigator.clipboard.writeText(formatted);
    setContactCopied(true);
    setTimeout(() => setContactCopied(false), 2500);
  }

  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    ...(hasCustomSections ? [{ id: 'highlights', label: 'Highlights' }] : []),
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200 pb-16 md:pb-0 font-['Plus_Jakarta_Sans','Hind_Siliguri',sans-serif]">
        {/* Top Reading Scroll Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-transparent pointer-events-none">
          <div
            className={`h-full bg-gradient-to-r ${accent.progress} origin-left transition-transform duration-75`}
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>

        {/* Clean 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
            {/* Zone 1: Mobile Menu Trigger + Single-line Brand Wordmark */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <a
                href="#about"
                className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 truncate"
              >
                {cvData.name}
              </a>
            </div>

            {/* Zone 2: Clean Single-Line Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? accent.navActive
                        : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Zone 3: Quick Actions + Primary Download Action */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5 text-xs"
                title="Quick Command Search (Ctrl+K)"
                aria-label="Open Command Search"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xl:inline font-['JetBrains_Mono',monospace] text-[10.5px] text-slate-500">
                  ⌘K
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Light or Dark Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {onOpenPrintPreview && (
                <button
                  type="button"
                  onClick={onOpenPrintPreview}
                  className="hidden sm:flex px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-colors items-center gap-1.5 whitespace-nowrap shrink-0"
                  title="Inspect formatted A4 CV right in browser"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View CV</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExportPDF}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${accent.btnPrimary}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CV</span>
              </button>

              {isStudioUnlocked ? (
                <>
                  <button
                    type="button"
                    onClick={onBackToEditor}
                    className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/35 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CV Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLockStudio}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800 transition-colors"
                    title="লক করে পাবলিক মোডে যান"
                    aria-label="Lock CV Studio"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  title="ওনার লগইন (Document CV Studio-তে প্রবেশ করুন)"
                >
                  <Unlock className={`w-3.5 h-3.5 ${accent.eyebrow}`} />
                  <span className="hidden sm:inline">Studio Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Slide-Down Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      activeSection === item.id
                        ? accent.activePill
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              {onOpenPrintPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPrintPreview();
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Formatted A4 CV
                </button>
              )}
            </div>
          )}
        </header>

        {/* Asymmetric Editorial Split Hero + Bento Quick Switcher */}
        <section
          id="about"
          className="relative py-14 sm:py-20 px-4 sm:px-6 overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.14) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
            {/* Left Editorial Narrative Column */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Quiet unboxed metadata line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium mb-3">
                <span>{cvData.education.degree}</span>
                <span aria-hidden="true">·</span>
                <span>{cvData.education.school}</span>
                <span aria-hidden="true">·</span>
                <span>{location}</span>
                {activeRoleLabel && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-semibold">
                      Tailored View: {activeRoleLabel}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight text-balance">
                {cvData.name}
              </h1>

              <p className={`text-sm sm:text-base font-bold ${accent.eyebrow} mt-2.5 tracking-wide`}>
                {cvData.title}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span
                    className={`transition-opacity duration-200 ${
                      roleFade ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    Focus: {ROLE_ROTATIONS[roleIdx]}
                  </span>
                </span>
                {portfolioConfig.availabilityActive && (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {portfolioConfig.availabilityText}
                  </span>
                )}
              </div>

              <p className="mt-5 text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed text-justify max-w-2xl">
                {cvData.summary}
              </p>

              {/* Quick Actions & Recruiter Tools */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <a
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" /> LinkedIn
                </a>
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Website
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => exportVCard(cvData)}
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                  title="Download .vcf contact file for mobile or Outlook"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Save Contact (.vcf)
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <QrCode className={`w-4 h-4 ${accent.eyebrow}`} /> QR Card
                </button>
              </div>
            </div>

            {/* Right Asymmetric Bento Portrait + Interactive Recruiter Role-Lens Card */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0">
                  <img
                    src={settings.photoSrc}
                    alt={cvData.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${settings.photoPosX ?? 50}% ${settings.photoPosY ?? 50}%`,
                      transform: `scale(${settings.photoScale || 1})`,
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-500 dark:text-slate-400">
                    Direct Coordinates
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCoordinate('email', email)}
                    className="w-full flex items-center justify-between gap-1.5 text-left group/coord"
                    title="Click to copy email"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {email}
                    </span>
                    <span className="text-slate-400 group-hover/coord:text-slate-700 dark:group-hover/coord:text-slate-200 shrink-0">
                      {copiedCoord === 'email' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyCoordinate('phone', phone)}
                    className="w-full flex items-center justify-between gap-1.5 text-left group/coord"
                    title="Click to copy phone number"
                  >
                    <span className="text-xs font-['JetBrains_Mono',monospace] tabular-nums text-slate-600 dark:text-slate-300 truncate">
                      {phone}
                    </span>
                    <span className="text-slate-400 group-hover/coord:text-slate-700 dark:group-hover/coord:text-slate-200 shrink-0">
                      {copiedCoord === 'phone' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </span>
                  </button>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{location}</div>
                </div>
              </div>

              {/* Interactive Recruiter Role-Lens Switcher */}
              {profiles.length > 0 && onSelectPublicProfile && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Compass className={`w-3.5 h-3.5 ${accent.eyebrow}`} />
                      Recruiter Role Lens
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">Tailor View &amp; PDF</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {profiles.slice(0, 4).map((prof) => {
                      const isSel = prof.id === activeProfileId;
                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => onSelectPublicProfile(prof.id)}
                          className={`px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold border transition-colors truncate ${
                            isSel
                              ? accent.activePill
                              : `bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 ${accent.hoverBorder}`
                          }`}
                          title={prof.description}
                        >
                          {prof.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <a
                  href="#contact"
                  className={`font-semibold ${accent.eyebrow} hover:underline inline-flex items-center gap-1 whitespace-nowrap`}
                >
                  Schedule Interview <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <div className="flex items-center gap-1.5">
                  {onOpenPrintPreview && (
                    <button
                      type="button"
                      onClick={onOpenPrintPreview}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold whitespace-nowrap inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> A4 View
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onExportPDF}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-[11px] font-bold whitespace-nowrap"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full-Width 4-Column Quantitative Metrics Strip (Studio-Editable) */}
        <section className="bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80 py-7 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 text-center font-['JetBrains_Mono',monospace] tabular-nums">
            {portfolioConfig.metrics.map((m, idx) => (
              <div key={m.id} className="p-3">
                <div
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    idx === 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : idx === 1
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : idx === 2
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-indigo-600 dark:text-amber-400'
                  }`}
                >
                  {m.value}
                </div>
                <div className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Skills Matrix with Interactive Filter */}
        <section id="skills" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className={`text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold mb-1.5`}>
                {showSectionNumbers ? '01 · Capabilities' : 'Capabilities'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                Core Technical Skills &amp; Competencies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Data Analytics · Software QA · Cloud APIs · Enterprise Infrastructure
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 self-start">
              <button
                type="button"
                onClick={() => setSkillFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  skillFilter === 'all'
                    ? accent.tabActive
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Domains
              </button>
              {cvData.skills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSkillFilter(s.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    skillFilter === s.id
                      ? accent.tabActive
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s.category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSkills.map((s, idx) => {
              const tags = splitTopLevelCommas(s.competencies);
              return (
                <div
                  key={s.id || idx}
                  className={`bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 ${accent.hoverBorder} transition-colors flex flex-col`}
                >
                  <div className="flex items-center gap-3 mb-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {s.category.includes('Data') ? (
                        <Database className="w-4 h-4" />
                      ) : s.category.includes('QA') ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : s.category.includes('API') ? (
                        <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      ) : s.category.includes('Enterprise') ? (
                        <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {s.category}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-snug"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Experience Timeline */}
        <section
          id="experience"
          className="py-16 px-4 sm:px-6 bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <div className={`text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold mb-1.5`}>
                {showSectionNumbers ? '02 · Career Timeline' : 'Career Timeline'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                Professional Work Experience
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Verified industry track record · Production operations · Measurable outcomes
              </p>
            </div>

            <div className="space-y-6 relative before:hidden md:before:block before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
              {cvData.experiences.map((exp) => {
                const duration = calculateDuration(exp.date);
                return (
                  <div
                    key={exp.id}
                    className={`md:ml-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${accent.hoverBorder} transition-colors rounded-xl p-6 relative`}
                  >
                    <div className={`hidden md:block absolute -left-[33px] top-7 w-2.5 h-2.5 rounded-full ${accent.dot} ring-4 ring-white dark:ring-slate-950`} />
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {exp.role}
                        </h3>
                        <div className={`text-xs font-semibold ${accent.eyebrow} mt-0.5`}>
                          {exp.company}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-['JetBrains_Mono',monospace] tabular-nums text-slate-500 dark:text-slate-400">
                        <span>{exp.date}</span>
                        {duration && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px] font-semibold">
                            {duration}
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{exp.location}</span>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 text-xs sm:text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed list-outside ml-4 list-disc">
                      {exp.bullets.map((b) => (
                        <li key={b.id} dangerouslySetInnerHTML={{ __html: b.text }} />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Key Projects Showcase with Blueprint Banners & Tabbed Case Study Modal */}
        <section id="projects" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className={`text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold mb-1.5`}>
                {showSectionNumbers ? '03 · Case Studies' : 'Case Studies'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                Key Technical Projects &amp; Case Studies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Click any project card to inspect architecture, methodology, and deliverables
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 self-start">
              {[
                { key: 'all', label: 'All Projects' },
                { key: 'data', label: 'Data & BI' },
                { key: 'sqa', label: 'SQA & API' },
                { key: 'fullstack', label: 'Full-Stack' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setProjectFilter(tab.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    projectFilter === tab.key
                      ? accent.tabActive
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => (
              <article
                key={proj.id}
                onClick={() => {
                  setCaseTab('overview');
                  setSelectedProject(proj);
                }}
                className={`cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-6 ${accent.hoverBorder} transition-colors flex flex-col justify-between group`}
              >
                <div>
                  <ProjectBlueprintBanner proj={proj} />

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white transition-colors">
                      {proj.title}
                    </h3>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0 p-1"
                        aria-label={`Open ${proj.title}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className={`text-[11.5px] font-['JetBrains_Mono',monospace] ${accent.eyebrow} mb-3`}>
                    {proj.technologies.split(',').map((t) => t.trim()).join(' · ')}
                  </div>

                  <p className="text-xs sm:text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                    {proj.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span className={`${accent.eyebrow} inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform`}>
                    Inspect Case Study <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      Source / Demo
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Credentials Bento Grid (Education, Certifications, Languages & Strengths) */}
        <section
          id="education"
          className="py-16 px-4 sm:px-6 bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <div className={`text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold mb-1.5`}>
                {showSectionNumbers ? '04 · Credentials' : 'Credentials'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                Education, Certifications &amp; Languages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Academic foundation · Verified technical credentials · Core competencies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Academic Background */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Academic Background
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {cvData.education.degree}
                    </div>
                    <div className={`font-bold ${accent.eyebrow} text-sm`}>
                      {cvData.education.school}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-['JetBrains_Mono',monospace] tabular-nums">
                      {cvData.education.year} · {cvData.education.location}
                    </div>
                    <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed pt-3 border-t border-slate-200 dark:border-slate-800">
                      {cvData.education.modules}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="md:col-span-7 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Professional Certifications
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                  {cvData.certifications.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Languages & Core Strengths Bento Strip */}
              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-start gap-3">
                <Languages className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Languages</div>
                  <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    {cvData.languages}
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Key Professional Strengths</div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {cvData.strengths}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Studio Sections (Awards, Publications, References) */}
        {hasCustomSections && (
          <section id="highlights" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
            <div className="mb-10">
              <div className={`text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold mb-1.5`}>
                {showSectionNumbers ? '05 · Highlights' : 'Highlights'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                Additional Highlights &amp; Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Custom achievements, references &amp; publications published from Studio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cvData.customSections.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3"
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    {sec.title}
                  </h3>
                  {sec.type === 'bullets' || sec.type === 'references' ? (
                    <ul className="space-y-2 text-xs sm:text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed list-outside ml-4 list-disc">
                      {sec.content.map((item, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs sm:text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                      {sec.content.join(' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Direct Contact Composer & Actions */}
        <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className={`text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                {showSectionNumbers
                  ? `${hasCustomSections ? '06' : '05'} · Get In Touch`
                  : 'Get In Touch'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                Let&apos;s Connect &amp; Work Together
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Open to full-time positions, remote opportunities, and technical consulting in Data Analytics, Software QA, and IT Infrastructure.
              </p>

              <div className="space-y-2.5 pt-2 text-xs">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 transition-colors"
                >
                  <Mail className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Direct Email</div>
                    <div className="font-bold text-slate-900 dark:text-white">{email}</div>
                  </div>
                </a>

                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Phone / WhatsApp</div>
                    <div className="font-bold text-slate-900 dark:text-white font-['JetBrains_Mono',monospace] tabular-nums">
                      {phone}
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400">Location</div>
                    <div className="font-bold text-slate-900 dark:text-white">{location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zero-Backend Interactive Message Form */}
            <form
              onSubmit={handleSendMailto}
              className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 text-xs"
            >
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Send a Direct Message
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Recruiter / Hiring Manager"
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Email or Company
                  </label>
                  <input
                    type="text"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Job / Interview Opportunity">Job / Interview Opportunity</option>
                  <option value="Data Analytics / Power BI Project">Data Analytics / Power BI Project</option>
                  <option value="Software QA Consulting">Software QA Consulting</option>
                  <option value="IT Support / General Inquiry">IT Support / General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={senderMessage}
                  onChange={(e) => setSenderMessage(e.target.value)}
                  placeholder="Share role details, interview schedule, or project requirements..."
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  {contactCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Message Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Message
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${accent.btnPrimary}`}
                >
                  <Send className="w-3.5 h-3.5" /> Open in Email App
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Clean Minimal Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} {cvData.name}. All rights reserved.</p>
            {!isStudioUnlocked && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3" /> Owner Access
              </button>
            )}
          </div>
        </footer>

        {/* Mobile Sticky Bottom CTA Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onExportPDF}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap ${accent.btnPrimary}`}
          >
            <Download className="w-3.5 h-3.5" /> Download CV
          </button>
          <a
            href="#contact"
            className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5" /> Contact Me
          </a>
        </div>

        {/* Floating Back-to-Top Button */}
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-16 md:bottom-6 right-5 z-30 p-2.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg hover:scale-105 transition-transform"
            title="Back to top"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* Tabbed Project Case Study Modal */}
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[11px] font-['JetBrains_Mono',monospace] text-blue-600 dark:text-cyan-400 mb-1">
                    Technical Case Study
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
                  aria-label="Close Case Study"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Case Study Interactive Tabs */}
              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                {[
                  { key: 'overview', label: 'Overview & Impact' },
                  { key: 'architecture', label: 'Architecture Preview' },
                  { key: 'stack', label: 'Stack & Deliverables' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCaseTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
                      caseTab === tab.key
                        ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {caseTab === 'overview' && (
                <div className="space-y-3 text-xs sm:text-[13.5px] leading-relaxed">
                  <p className="text-slate-600 dark:text-slate-300 text-justify">
                    {selectedProject.description}
                  </p>
                </div>
              )}

              {caseTab === 'architecture' && (
                <div className="space-y-3 text-xs">
                  <ProjectBlueprintBanner proj={selectedProject} />
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Designed with end-to-end validation checkpoints, clear separation between raw inputs, verification layers, and structured reporting outputs.
                  </p>
                </div>
              )}

              {caseTab === 'stack' && (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Core Tooling &amp; Technologies
                  </div>
                  <p className="font-['JetBrains_Mono',monospace] text-blue-600 dark:text-cyan-300 leading-relaxed">
                    {selectedProject.technologies.split(',').map((t) => t.trim()).join(' · ')}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                {selectedProject.url && (
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    Open Live / Repository <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Spotlight Command Palette Modal (Ctrl+K) */}
        {commandOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
            onClick={() => setCommandOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Search actions, projects, role views, or sections..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCommandOpen(false)}
                  className="text-[10.5px] font-['JetBrains_Mono',monospace] text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  ESC
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                {commandItems.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No matching action or project found.
                  </div>
                ) : (
                  commandItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCommandOpen(false);
                        item.run();
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <span className="text-[10px] font-['JetBrains_Mono',monospace] text-blue-600 dark:text-cyan-400 shrink-0">
                        {item.group}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Digital QR Business Card Modal */}
        {qrModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setQrModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Digital Business Card
                </h3>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {qrCardDataUrl && (
                <div className="inline-block p-3 bg-white rounded-xl border border-slate-200">
                  <img src={qrCardDataUrl} alt="Portfolio QR Code" className="w-44 h-44" />
                </div>
              )}

              <div className="space-y-0.5">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">{cvData.name}</div>
                <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold">
                  {cvData.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  }}
                  className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5"
                >
                  {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{shareCopied ? 'Copied' : 'Copy URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportVCard(cvData)}
                  className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Save .vcf
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
