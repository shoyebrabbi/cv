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
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  BookOpen,
  Cpu,
  User,
  Sparkles,
  Pencil,
  EyeOff,
  Clock,
  Link2,
} from 'lucide-react';
import {
  CVData,
  PortfolioAccentTheme,
  PortfolioDesignStyle,
  PortfolioSettings,
  ProjectItem,
  StudioSettings,
  WebsiteSectionKey,
} from '../types/cv';
import { exportVCard } from '../utils/exporters';
import {
  WebsiteEditorDrawer,
  WebsiteEditorTab,
  DEFAULT_SPECIALIZATION_CARDS,
} from './WebsiteEditorDrawer';

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
  hasUnpublishedDraft?: boolean;
  onPublishDraft?: () => void;
  onDiscardDraft?: () => void;
  activeRoleLabel?: string;
  profiles?: PublicProfileSummary[];
  activeProfileId?: string;
  onSelectPublicProfile?: (id: string) => void;
  onOpenLogin: () => void;
  onLockStudio: () => void;
  onBackToEditor: () => void;
  onExportPDF: () => void;
  onOpenPrintPreview?: () => void;
  onUpdatePortfolioStyle?: (designStyle: PortfolioDesignStyle) => void;
  onUpdatePortfolioSettings?: (updater: (prev: PortfolioSettings) => PortfolioSettings) => void;
  onSubmitInquiry?: (inquiry: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
    targetRole?: string;
  }) => Promise<{ savedToCloud: boolean } | void>;
  onShowToast?: (msg: string, type: 'info' | 'success' | 'error') => void;
}

const ROLE_SPECIALIZATIONS = [
  {
    key: 'data',
    label: 'Data & Power BI',
    headline: 'Data Analyst & Power BI Specialist',
    proof: 'PostgreSQL · Star Schema · Automated ETL · 50,000+ Records',
    metric: '50,000+ Rows',
    icon: Database,
  },
  {
    key: 'sqa',
    label: 'Software QA & API',
    headline: 'Software QA & REST API Engineer',
    proof: 'Postman CRUD · BVA/ECP · 80+ Test Cases · Jira Triage',
    metric: '80+ Cases',
    icon: ShieldCheck,
  },
  {
    key: 'netops',
    label: 'Enterprise IT',
    headline: 'Enterprise IT & Systems Administrator',
    proof: 'Windows Server · Linux · ERP RBAC · 100+ Users Supported',
    metric: '100+ Users',
    icon: Server,
  },
] as const;

const DESIGN_STYLE_OPTIONS: {
  key: PortfolioDesignStyle;
  label: string;
  shortLabel: string;
  desc: string;
  icon: typeof LayoutGrid;
}[] = [
  {
    key: 'bento',
    label: 'Signature Bento',
    shortLabel: 'Bento',
    desc: 'Asymmetric showcase & executive split (Recommended)',
    icon: LayoutGrid,
  },
  {
    key: 'editorial',
    label: 'Executive Monograph',
    shortLabel: 'Monograph',
    desc: 'Editorial serif headings & hairline publication rules',
    icon: BookOpen,
  },
  {
    key: 'blueprint',
    label: 'Systems Blueprint',
    shortLabel: 'Blueprint',
    desc: 'Precision architectural grid & engineering matrix',
    icon: Cpu,
  },
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
    ringSoft: string;
    monogramBg: string;
    heroGlow: string;
  }
> = {
  cobalt: {
    eyebrow: 'text-blue-600 dark:text-cyan-400',
    navActive: 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400',
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white',
    dot: 'bg-blue-600 dark:bg-cyan-400',
    hoverBorder: 'hover:border-blue-500/60 dark:hover:border-cyan-400/50',
    activePill: 'bg-blue-600 text-white border-blue-600',
    tabActive: 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-blue-600 via-cyan-500 to-emerald-500',
    ringSoft: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-cyan-300',
    monogramBg: 'bg-blue-600/10 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-300 border-blue-200 dark:border-cyan-500/30',
    heroGlow: 'radial-gradient(ellipse 65% 50% at 75% 15%, rgba(37,99,235,0.12), transparent 70%)',
  },
  emerald: {
    eyebrow: 'text-emerald-600 dark:text-emerald-400',
    navActive: 'border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400',
    btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
    hoverBorder: 'hover:border-emerald-500/60 dark:hover:border-emerald-400/50',
    activePill: 'bg-emerald-600 text-white border-emerald-600',
    tabActive: 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-emerald-600 via-teal-500 to-cyan-500',
    ringSoft: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    monogramBg: 'bg-emerald-600/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    heroGlow: 'radial-gradient(ellipse 65% 50% at 75% 15%, rgba(5,150,105,0.12), transparent 70%)',
  },
  teal: {
    eyebrow: 'text-teal-600 dark:text-teal-400',
    navActive: 'border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400',
    btnPrimary: 'bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-500 text-white',
    dot: 'bg-teal-600 dark:bg-teal-400',
    hoverBorder: 'hover:border-teal-500/60 dark:hover:border-teal-400/50',
    activePill: 'bg-teal-600 text-white border-teal-600',
    tabActive: 'bg-white dark:bg-teal-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-teal-600 via-cyan-500 to-blue-500',
    ringSoft: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300',
    monogramBg: 'bg-teal-600/10 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
    heroGlow: 'radial-gradient(ellipse 65% 50% at 75% 15%, rgba(13,148,136,0.12), transparent 70%)',
  },
  indigo: {
    eyebrow: 'text-indigo-600 dark:text-indigo-400',
    navActive: 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white',
    dot: 'bg-indigo-600 dark:bg-indigo-400',
    hoverBorder: 'hover:border-indigo-500/60 dark:hover:border-indigo-400/50',
    activePill: 'bg-indigo-600 text-white border-indigo-600',
    tabActive: 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-indigo-600 via-blue-500 to-cyan-500',
    ringSoft: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    monogramBg: 'bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
    heroGlow: 'radial-gradient(ellipse 65% 50% at 75% 15%, rgba(79,70,229,0.12), transparent 70%)',
  },
  rose: {
    eyebrow: 'text-rose-600 dark:text-rose-400',
    navActive: 'border-rose-600 dark:border-rose-400 text-rose-600 dark:text-rose-400',
    btnPrimary: 'bg-rose-600 hover:bg-rose-700 dark:hover:bg-rose-500 text-white',
    dot: 'bg-rose-600 dark:bg-rose-400',
    hoverBorder: 'hover:border-rose-500/60 dark:hover:border-rose-400/50',
    activePill: 'bg-rose-600 text-white border-rose-600',
    tabActive: 'bg-white dark:bg-rose-600 text-slate-900 dark:text-white shadow-sm',
    progress: 'from-rose-600 via-amber-500 to-orange-500',
    ringSoft: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
    monogramBg: 'bg-rose-600/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    heroGlow: 'radial-gradient(ellipse 65% 50% at 75% 15%, rgba(225,29,72,0.10), transparent 70%)',
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

function getCompanyInitials(company: string): string {
  const words = company
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'CO';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function ProjectBlueprintBanner({
  proj,
  compact = false,
}: {
  proj: ProjectItem;
  compact?: boolean;
}) {
  const hay = (proj.title + ' ' + proj.technologies + ' ' + proj.description).toLowerCase();
  const padClass = compact ? 'p-3' : 'p-4';

  if (hay.includes('power bi') || hay.includes('sql') || hay.includes('etl')) {
    return (
      <div
        className={`mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 ${padClass} flex flex-wrap items-center justify-between gap-3`}
      >
        <div className="space-y-1 min-w-0">
          <div className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-500 dark:text-slate-400">
            Dimensional Analytics
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>PostgreSQL</span>
            <span className="text-slate-400">→</span>
            <span>Power Query ETL</span>
            <span className="text-slate-400">→</span>
            <span className="text-blue-600 dark:text-cyan-400">Star Schema</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-10 shrink-0" aria-hidden="true">
          {[36, 54, 46, 70, 62, 86, 98].map((h, i) => (
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
      <div
        className={`mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 ${padClass} flex flex-wrap items-center justify-between gap-3 font-['JetBrains_Mono',monospace]`}
      >
        <div className="space-y-1 min-w-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">API Verification</div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 break-words">
            REST CRUD · Bearer Auth · Schema
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0 tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-400">200 OK</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-blue-600 dark:text-blue-400">201</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-amber-600 dark:text-amber-400">4xx</span>
        </div>
      </div>
    );
  }

  if (hay.includes('jira') || hay.includes('test') || hay.includes('bva')) {
    return (
      <div
        className={`mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 ${padClass} space-y-2.5`}
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-['JetBrains_Mono',monospace]">
          <span className="text-slate-500 dark:text-slate-400">QA Coverage Matrix</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            80+ Test Cases · BVA/ECP
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
          <div className="h-full bg-emerald-500 w-[72%]" />
          <div className="h-full bg-blue-500 w-[20%]" />
          <div className="h-full bg-amber-400 w-[8%]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 ${padClass} flex flex-wrap items-center justify-between gap-3`}
    >
      <div className="space-y-1 min-w-0">
        <div className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-500 dark:text-slate-400">
          Full-Stack Architecture
        </div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
          RBAC Auth · Relational DB · Cloud Deploy
        </div>
      </div>
      <div
        className="w-16 h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 flex flex-col justify-between shrink-0"
        aria-hidden="true"
      >
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

type ActiveRoleFocusKey = 'data' | 'sqa' | 'netops' | null;

function resolveActiveRoleFocusKey(profile?: PublicProfileSummary, roleLabel?: string): ActiveRoleFocusKey {
  const preset = (profile?.rolePreset || '').toLowerCase();
  const text = `${profile?.name || ''} ${roleLabel || ''}`.toLowerCase();
  if (preset === 'master' || text.includes('master')) return null;
  if (preset === 'data' || text.includes('data') || text.includes('power bi') || text.includes('analyst')) {
    return 'data';
  }
  if (preset === 'sqa' || text.includes('qa') || text.includes('sqa') || text.includes('test')) {
    return 'sqa';
  }
  if (
    preset === 'netops' ||
    text.includes('it ') ||
    text.includes('sysadmin') ||
    text.includes('network') ||
    text.includes('support') ||
    text.includes('infrastructure')
  ) {
    return 'netops';
  }
  return null;
}

function matchesRoleDomain(text: string, roleKey: ActiveRoleFocusKey): boolean {
  if (!roleKey) return false;
  const hay = text.toLowerCase();
  if (roleKey === 'data') {
    return (
      hay.includes('sql') ||
      hay.includes('power bi') ||
      hay.includes('dax') ||
      hay.includes('etl') ||
      hay.includes('data') ||
      hay.includes('analytics') ||
      hay.includes('excel') ||
      hay.includes('star schema') ||
      hay.includes('postgres')
    );
  }
  if (roleKey === 'sqa') {
    return (
      hay.includes('qa') ||
      hay.includes('sqa') ||
      hay.includes('test') ||
      hay.includes('postman') ||
      hay.includes('api') ||
      hay.includes('jira') ||
      hay.includes('bva') ||
      hay.includes('ecp') ||
      hay.includes('rtm') ||
      hay.includes('cypress') ||
      hay.includes('regression')
    );
  }
  if (roleKey === 'netops') {
    return (
      hay.includes('server') ||
      hay.includes('linux') ||
      hay.includes('network') ||
      hay.includes('mikrotik') ||
      hay.includes('active directory') ||
      hay.includes('erp') ||
      hay.includes('rbac') ||
      hay.includes('infrastructure') ||
      hay.includes('support') ||
      hay.includes('system')
    );
  }
  return false;
}

function buildProjectArchitectureSteps(
  proj: ProjectItem,
  customSteps?: string[]
): { steps: string[]; defaultDeliverables: string; isCustom: boolean } {
  const cleanedCustom = (customSteps || []).map((s) => s.trim()).filter(Boolean);
  const hay = `${proj.title} ${proj.technologies} ${proj.description}`.toLowerCase();

  if (hay.includes('power bi') || hay.includes('etl') || hay.includes('star schema') || hay.includes('sql')) {
    return {
      isCustom: cleanedCustom.length > 0,
      steps:
        cleanedCustom.length > 0
          ? cleanedCustom
          : [
              'Source Extraction & Relational Modeling — Standardized multi-source tables with primary/foreign key integrity checks in PostgreSQL.',
              'Power Query ETL Cleansing — Deduplicated records, normalized date/currency dimensions, and enforced null-safe transformations.',
              'Star Schema & DAX Measures — Modeled fact/dimension relationships for fast slice-and-dice executive KPI aggregation.',
              'Stakeholder Reporting & Audit — Verified visual totals directly against raw SQL baseline queries before publication.',
            ],
      defaultDeliverables: 'Star-Schema Model · DAX KPI Measures · Reconciled Executive Report',
    };
  }

  if (hay.includes('postman') || hay.includes('api') || hay.includes('json')) {
    return {
      isCustom: cleanedCustom.length > 0,
      steps:
        cleanedCustom.length > 0
          ? cleanedCustom
          : [
              'Endpoint Inventory & Contract Review — Mapped authentication headers, payloads, and expected HTTP status codes.',
              'Environment & Token Automation — Chained dynamic Bearer auth variables across CRUD collections for repeatable runs.',
              'Schema & Boundary Assertions — Validated JSON response contracts, 2xx success paths, and 4xx negative edge cases.',
              'Defect Documentation — Logged reproducible request/response traces with severity classification for rapid resolution.',
            ],
      defaultDeliverables: 'Postman Test Collection · JSON Schema Assertions · Defect Trace Log',
    };
  }

  if (hay.includes('qa') || hay.includes('test') || hay.includes('jira') || hay.includes('bva')) {
    return {
      isCustom: cleanedCustom.length > 0,
      steps:
        cleanedCustom.length > 0
          ? cleanedCustom
          : [
              'Requirements & Risk Analysis — Mapped functional user journeys into a Requirement Traceability Matrix (RTM).',
              'Structured Test Design — Applied Equivalence Class Partitioning (ECP) and Boundary Value Analysis (BVA).',
              'Cross-Module Execution & Regression — Executed smoke, sanity, and end-to-end regression suites across builds.',
              'Jira Triage & Sign-Off — Documented steps to reproduce, environment telemetry, and release readiness sign-off.',
            ],
      defaultDeliverables: 'RTM Coverage Matrix · BVA/ECP Test Suite · Verified Bug Reports',
    };
  }

  return {
    isCustom: cleanedCustom.length > 0,
    steps:
      cleanedCustom.length > 0
        ? cleanedCustom
        : [
            'Scope & Access Architecture — Structured role-based boundaries, user workflows, and core data models.',
            'Modular Implementation — Built clean UI/service separation using the project technology stack for predictable behavior.',
            'Validation & Edge-Case Hardening — Verified form constraints, error states, and persistence paths end to end.',
            'Production Packaging — Prepared deployment configuration and clean documentation for immediate stakeholder use.',
          ],
    defaultDeliverables: `${proj.technologies.split(',').slice(0, 3).map((t) => t.trim()).join(' · ')} Production Build`,
  };
}

export function WebPortfolioView({
  cvData,
  settings,
  isStudioUnlocked,
  hasUnpublishedDraft = false,
  onPublishDraft,
  onDiscardDraft,
  activeRoleLabel,
  profiles = [],
  activeProfileId,
  onSelectPublicProfile,
  onOpenLogin,
  onLockStudio,
  onBackToEditor,
  onExportPDF,
  onOpenPrintPreview,
  onUpdatePortfolioStyle,
  onUpdatePortfolioSettings,
  onSubmitInquiry,
  onShowToast,
}: WebPortfolioViewProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('shoyeb_portfolio_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const configuredDesignStyle: PortfolioDesignStyle = settings.portfolio?.designStyle || 'bento';
  const [activeStyle, setActiveStyle] = useState<PortfolioDesignStyle>(configuredDesignStyle);

  useEffect(() => {
    setActiveStyle(configuredDesignStyle);
  }, [configuredDesignStyle]);

  function handleChangeDesignStyle(next: PortfolioDesignStyle) {
    setActiveStyle(next);
    if (isStudioUnlocked && onUpdatePortfolioStyle) {
      onUpdatePortfolioStyle(next);
    }
  }

  const [websiteEditMode, setWebsiteEditMode] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<WebsiteEditorTab>('hero');

  const openSectionEditor = (tab: WebsiteEditorTab) => {
    setEditorTab(tab);
    setEditorOpen(true);
  };

  useEffect(() => {
    if (!isStudioUnlocked) {
      setWebsiteEditMode(false);
      setEditorOpen(false);
    }
  }, [isStudioUnlocked]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [copiedCoord, setCopiedCoord] = useState<'email' | 'phone' | null>(null);
  const [portraitFailed, setPortraitFailed] = useState(false);

  const [focusIdx, setFocusIdx] = useState(0);
  const [focusPaused, setFocusPaused] = useState(false);
  const [collapsedExpIds, setCollapsedExpIds] = useState<Record<string, boolean>>({});

  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [caseTab, setCaseTab] = useState<'overview' | 'architecture' | 'stack'>('overview');
  const [selectedCaseImageIdx, setSelectedCaseImageIdx] = useState<number>(0);

  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCardDataUrl, setQrCardDataUrl] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [roleLinkCopied, setRoleLinkCopied] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [inquirySubject, setInquirySubject] = useState('Job / Interview Opportunity');
  const [senderMessage, setSenderMessage] = useState('');
  const [contactCopied, setContactCopied] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySubmittedState, setInquirySubmittedState] = useState<{
    savedToCloud: boolean;
    sentAt: string;
  } | null>(null);

  const portfolioConfig: PortfolioSettings = settings.portfolio || {
    availabilityActive: true,
    availabilityText: 'Available for Immediate Joining · Chattogram / Dhaka / Remote',
    showSectionNumbers: false,
    accentTheme: 'cobalt' as PortfolioAccentTheme,
    designStyle: 'bento' as PortfolioDesignStyle,
    metrics: [
      { id: 'm1', value: '2+ Years', label: 'Industry Experience' },
      { id: 'm2', value: '50,000+', label: 'Records Reconciled' },
      { id: 'm3', value: '80+', label: 'Test Cases Authored' },
      { id: 'm4', value: '100+', label: 'Enterprise Users Supported' },
    ],
  };

  const ov = portfolioConfig.websiteOverrides || {};

  const cvEmail = cvData.contacts.find((c) => c.type === 'email')?.label || 'shoyebrabbi@gmail.com';
  const cvPhone = cvData.contacts.find((c) => c.type === 'phone')?.label || '+8801622517200';
  const cvLocation = cvData.contacts.find((c) => c.type === 'location')?.label || 'Chattogram, Bangladesh';
  const cvLinkedin =
    cvData.contacts.find((c) => c.type === 'linkedin')?.url || 'https://linkedin.com/in/shoyebrabbi';
  const cvGithub =
    cvData.contacts.find((c) => c.type === 'github')?.url || 'https://github.com/shoyebrabbi';
  const cvWebsite = cvData.contacts.find((c) => c.type === 'website')?.url || '';

  const email = ov.email !== undefined ? ov.email : cvEmail;
  const phone = ov.phone !== undefined ? ov.phone : cvPhone;
  const location = ov.location !== undefined ? ov.location : cvLocation;
  const linkedin = ov.linkedin !== undefined ? ov.linkedin : cvLinkedin;
  const github = ov.github !== undefined ? ov.github : cvGithub;
  const website = ov.website !== undefined ? ov.website : cvWebsite;

  const siteData: CVData = useMemo(
    () => ({
      ...cvData,
      name: ov.name ?? cvData.name,
      title: ov.title ?? cvData.title,
      summary: ov.summary ?? cvData.summary,
      skills: ov.skills ?? cvData.skills,
      experiences: ov.experiences ?? cvData.experiences,
      projects: ov.projects ?? cvData.projects,
      education: ov.education ?? cvData.education,
      certifications: ov.certifications ?? cvData.certifications,
      languages: ov.languages ?? cvData.languages,
      strengths: ov.strengths ?? cvData.strengths,
      customSections: ov.customSections ?? cvData.customSections,
      contacts: cvData.contacts.map((c) => {
        if (c.type === 'email' && ov.email !== undefined) return { ...c, label: ov.email, url: `mailto:${ov.email}` };
        if (c.type === 'phone' && ov.phone !== undefined) return { ...c, label: ov.phone, url: `tel:${ov.phone}` };
        if (c.type === 'location' && ov.location !== undefined) return { ...c, label: ov.location };
        if (c.type === 'linkedin' && ov.linkedin !== undefined) return { ...c, url: ov.linkedin };
        if (c.type === 'github' && ov.github !== undefined) return { ...c, url: ov.github };
        if (c.type === 'website' && ov.website !== undefined) return { ...c, url: ov.website, label: ov.website };
        return c;
      }),
    }),
    [cvData, ov]
  );

  const sitePhotoSrc = ov.heroPhotoSrc || settings.photoSrc;
  const siteSpecializations = useMemo(() => {
    const cards = ov.specializations && ov.specializations.length > 0
      ? ov.specializations
      : DEFAULT_SPECIALIZATION_CARDS;
    const icons = [Database, ShieldCheck, Server];
    return cards.map((card, idx) => ({
      ...card,
      icon: icons[idx % icons.length],
    }));
  }, [ov.specializations]);

  const skillsIntro =
    ov.skillsIntro ??
    (activeStyle === 'editorial'
      ? 'Structured competencies spanning Data Analytics, Software Quality Assurance, API Verification, and Enterprise Systems.'
      : 'Data Analytics · Software QA · Cloud APIs · Enterprise Infrastructure');
  const experienceIntro =
    ov.experienceIntro ??
    (activeStyle === 'editorial'
      ? 'Production analytics, quality assurance engineering, and enterprise IT administration.'
      : 'Verified industry track record · Production operations · Measurable outcomes');
  const projectsIntro =
    ov.projectsIntro ?? 'Tap any project card to inspect architecture, methodology, and deliverables';
  const contactHeading = ov.contactHeading ?? "Let's Connect & Work Together";
  const contactSubtext =
    ov.contactSubtext ??
    'Open to full-time positions, remote opportunities, and technical consulting in Data Analytics, Software QA, and IT Infrastructure.';

  const isHeroCustomized = Boolean(
    ov.name !== undefined ||
      ov.title !== undefined ||
      ov.summary !== undefined ||
      ov.email !== undefined ||
      ov.phone !== undefined ||
      ov.location !== undefined ||
      ov.linkedin !== undefined ||
      ov.github !== undefined ||
      ov.website !== undefined ||
      ov.heroPhotoSrc !== undefined
  );
  const isSkillsCustomized = Boolean(ov.skills !== undefined || ov.skillsIntro !== undefined);
  const isExpCustomized = Boolean(ov.experiences !== undefined || ov.experienceIntro !== undefined);
  const isProjectsCustomized = Boolean(
    ov.projects !== undefined ||
      ov.projectsIntro !== undefined ||
      (ov.projectEnhancements !== undefined && Object.keys(ov.projectEnhancements).length > 0)
  );
  const isCredsCustomized = Boolean(
    ov.education !== undefined ||
      ov.certifications !== undefined ||
      ov.languages !== undefined ||
      ov.strengths !== undefined ||
      ov.customSections !== undefined ||
      ov.contactHeading !== undefined ||
      ov.contactSubtext !== undefined
  );
  const isMetricsCustomized = Boolean(ov.specializations !== undefined);

  const hiddenSectionsSet = useMemo(
    () => new Set<WebsiteSectionKey>(Array.isArray(ov.hiddenSections) ? ov.hiddenSections : []),
    [ov.hiddenSections]
  );
  const projectEnhancements = ov.projectEnhancements || {};
  const safeMetrics = Array.isArray(portfolioConfig.metrics) ? portfolioConfig.metrics : [];

  const handleUnhideSection = (key: WebsiteSectionKey) => {
    if (!onUpdatePortfolioSettings) return;
    onUpdatePortfolioSettings((prev) => {
      const prevOv = prev.websiteOverrides || {};
      const nextHidden = (prevOv.hiddenSections || []).filter((s) => s !== key);
      return {
        ...prev,
        websiteOverrides: {
          ...prevOv,
          hiddenSections: nextHidden.length > 0 ? nextHidden : undefined,
        },
      };
    });
  };

  useEffect(() => {
    setPortraitFailed(false);
  }, [sitePhotoSrc]);

  useEffect(() => {
    setSelectedCaseImageIdx(0);
  }, [selectedProject?.id]);

  useEffect(() => {
    const cleanName = (siteData.name || 'Md Shoyeb Rabbi').trim();
    const roleSuffix = activeRoleLabel
      ? ` — ${activeRoleLabel} Portfolio`
      : ' — Data Analyst, Software QA & Enterprise IT';
    document.title = `${cleanName}${roleSuffix}`;
  }, [siteData.name, activeRoleLabel]);

  useEffect(() => {
    try {
      localStorage.setItem('shoyeb_portfolio_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

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

  useEffect(() => {
    const ids = [
      'about',
      'skills',
      'experience',
      'projects',
      'education',
      ...(siteData.customSections && siteData.customSections.length > 0 ? ['highlights'] : []),
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
      { rootMargin: '-32% 0px -52% 0px', threshold: 0.05 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [siteData.customSections, activeStyle]);

  useEffect(() => {
    if (focusPaused || siteSpecializations.length === 0) return;
    const timer = setInterval(() => {
      setFocusIdx((prev) => (prev + 1) % siteSpecializations.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [focusPaused, siteSpecializations.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (!isStudioUnlocked) {
          onOpenLogin();
        }
      } else if (e.key === 'Escape') {
        setSelectedProject(null);
        setCommandOpen(false);
        setQrModalOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isStudioUnlocked, onOpenLogin]);

  useEffect(() => {
    if (commandOpen) {
      setCommandQuery('');
      setTimeout(() => commandInputRef.current?.focus(), 40);
    }
  }, [commandOpen]);

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

  const showSectionNumbers = Boolean(portfolioConfig.showSectionNumbers);
  const hasCustomSections = Boolean(siteData.customSections && siteData.customSections.length > 0);
  const accent = PORTFOLIO_ACCENTS[resolveAccentKey(portfolioConfig.accentTheme, settings.themePrimary)];

  function handleCopyCoordinate(type: 'email' | 'phone', val: string) {
    navigator.clipboard.writeText(val);
    setCopiedCoord(type);
    setTimeout(() => setCopiedCoord(null), 1800);
  }

  function toggleExperienceCard(id: string) {
    setCollapsedExpIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const activeProfileObj = useMemo(
    () => profiles.find((p) => p.id === activeProfileId),
    [profiles, activeProfileId]
  );
  const activeRoleKey = useMemo(
    () => resolveActiveRoleFocusKey(activeProfileObj, activeRoleLabel),
    [activeProfileObj, activeRoleLabel]
  );

  const filteredSkills = useMemo(() => {
    if (skillFilter === 'all') return siteData.skills;
    const byId = siteData.skills.filter((s) => s.id === skillFilter);
    if (byId.length > 0) return byId;
    return siteData.skills;
  }, [siteData.skills, skillFilter]);

  const filteredProjects = useMemo(() => {
    const base =
      projectFilter === 'all'
        ? siteData.projects
        : siteData.projects.filter((p) => {
            const hay = (p.title + ' ' + p.technologies + ' ' + p.description).toLowerCase();
            if (projectFilter === 'data') return hay.includes('power bi') || hay.includes('sql') || hay.includes('etl');
            if (projectFilter === 'sqa') return hay.includes('postman') || hay.includes('qa') || hay.includes('test') || hay.includes('jira');
            if (projectFilter === 'fullstack') return hay.includes('node') || hay.includes('portal') || hay.includes('vercel') || hay.includes('tailwind');
            return true;
          });

    if (!activeRoleKey || projectFilter !== 'all') return base;
    return [...base].sort((a, b) => {
      const aMatch = matchesRoleDomain(`${a.title} ${a.technologies} ${a.description}`, activeRoleKey) ? 1 : 0;
      const bMatch = matchesRoleDomain(`${b.title} ${b.technologies} ${b.description}`, activeRoleKey) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [siteData.projects, projectFilter, activeRoleKey]);

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
        run: () => exportVCard(siteData),
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
      ...DESIGN_STYLE_OPTIONS.map((st) => ({
        id: `layout-${st.key}`,
        group: 'Website Design',
        title: `Apply Layout: ${st.label}`,
        subtitle: st.desc,
        run: () => handleChangeDesignStyle(st.key),
      })),
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
        subtitle: siteData.experiences.map((e) => e.company).join(' · '),
        run: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }),
      },
      {
        id: 'nav-proj',
        group: 'Navigate',
        title: 'Jump to Projects & Case Studies',
        subtitle: `${siteData.projects.length} documented projects`,
        run: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }),
      },
      ...(siteData.customSections && siteData.customSections.length > 0
        ? [
            {
              id: 'nav-highlights',
              group: 'Navigate',
              title: 'Jump to Additional Highlights',
              subtitle: siteData.customSections.map((s) => s.title).join(' · '),
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

    const projectActions = siteData.projects.map((p) => ({
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
  }, [commandQuery, siteData, email, phone, theme, profiles, onExportPDF, onSelectPublicProfile, isStudioUnlocked]);

  function buildCurrentRoleShareUrl(): string {
    const base = `${window.location.origin}${window.location.pathname}`;
    if (!activeProfileId || activeProfileId === 'prof_master') return base;
    return `${base}?role=${encodeURIComponent(activeProfileId)}`;
  }

  function handleCopyActiveRoleUrl() {
    const url = buildCurrentRoleShareUrl();
    navigator.clipboard.writeText(url);
    setRoleLinkCopied(true);
    onShowToast?.('শেয়ারযোগ্য Role URL কপি হয়েছে!', 'success');
    setTimeout(() => setRoleLinkCopied(false), 2200);
  }

  function handleExplorePillarProjects(label: string) {
    const lower = label.toLowerCase();
    if (lower.includes('data') || lower.includes('bi') || lower.includes('sql')) {
      setProjectFilter('data');
    } else if (lower.includes('qa') || lower.includes('test') || lower.includes('api')) {
      setProjectFilter('sqa');
    } else {
      setProjectFilter('all');
    }
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleDirectInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !senderMessage.trim()) return;
    setIsSubmittingInquiry(true);
    try {
      if (onSubmitInquiry) {
        const res = await onSubmitInquiry({
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
          subject: inquirySubject,
          message: senderMessage.trim(),
          targetRole: activeRoleLabel || activeProfileObj?.name || 'Master Portfolio',
        });
        setInquirySubmittedState({
          savedToCloud: Boolean(res && res.savedToCloud),
          sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        setSenderName('');
        setSenderEmail('');
        setSenderMessage('');
      } else {
        handleOpenMailtoFallback();
      }
    } finally {
      setIsSubmittingInquiry(false);
    }
  }

  function handleOpenMailtoFallback() {
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

  const allNavItems = [
    { id: 'about', sectionKey: null as WebsiteSectionKey | null, label: 'About', desc: 'Bio, specialization & role lenses', icon: User },
    { id: 'skills', sectionKey: 'skills' as WebsiteSectionKey | null, label: 'Skills', desc: 'SQL, Power BI, QA & Enterprise IT', icon: Layers },
    { id: 'experience', sectionKey: 'experience' as WebsiteSectionKey | null, label: 'Experience', desc: 'Work history & verified outcomes', icon: Briefcase },
    { id: 'projects', sectionKey: 'projects' as WebsiteSectionKey | null, label: 'Projects', desc: 'Interactive technical case studies', icon: Code2 },
    { id: 'contact', sectionKey: 'contact' as WebsiteSectionKey | null, label: 'Contact', desc: 'Email, phone & direct inquiry form', icon: Mail },
  ];
  const navItems = allNavItems.filter(
    (item) => !item.sectionKey || !hiddenSectionsSet.has(item.sectionKey)
  );

  const isEditorial = activeStyle === 'editorial';
  const isBlueprint = activeStyle === 'blueprint';

  const canvasClass = isEditorial
    ? 'bg-[#FAF9F5] dark:bg-[#0C0D10] text-slate-900 dark:text-slate-100'
    : isBlueprint
    ? 'bg-[#F3F5F9] dark:bg-[#060A13] text-slate-900 dark:text-slate-100'
    : 'bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100';

  const displayHeadingFont = isEditorial
    ? "font-['Playfair_Display',Georgia,serif]"
    : "font-['Outfit','Plus_Jakarta_Sans','Hind_Siliguri',sans-serif]";

  const sectionBandBg = isEditorial
    ? 'bg-white/60 dark:bg-white/[0.02] border-y border-stone-200 dark:border-stone-800/80'
    : isBlueprint
    ? 'bg-white dark:bg-[#090F1D] border-y border-slate-200 dark:border-slate-800'
    : 'bg-white dark:bg-slate-900/45 border-y border-slate-200 dark:border-slate-800';

  const cardSurfaceClass = isEditorial
    ? 'bg-white dark:bg-[#12141A] border border-stone-200 dark:border-stone-800 rounded-2xl'
    : isBlueprint
    ? 'bg-white dark:bg-[#0B1222] border border-slate-200 dark:border-slate-800 rounded-xl'
    : 'bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl';

  const sectionLabel = (num: string, title: string) =>
    showSectionNumbers || isBlueprint ? `${num}. ${title}` : title;

  const renderHiddenPlaceholder = (key: WebsiteSectionKey, title: string) => {
    if (!isStudioUnlocked || !websiteEditMode || !onUpdatePortfolioSettings) return null;
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 my-4">
        <div className="rounded-xl border border-dashed border-amber-400/60 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/25 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
            <EyeOff className="w-4 h-4 shrink-0" />
            <span>{title} · এই সেকশনটি এখন Live Website-এ লুকানো আছে (A4 CV-তে অক্ষত)</span>
          </div>
          <button
            type="button"
            onClick={() => handleUnhideSection(key)}
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition whitespace-nowrap"
          >
            Unhide Section
          </button>
        </div>
      </div>
    );
  };

  const renderSectionEditButton = (
    tab: WebsiteEditorTab,
    isOverridden: boolean,
    label = 'Edit Section'
  ) => {
    if (!isStudioUnlocked || !websiteEditMode || !onUpdatePortfolioSettings) return null;
    return (
      <button
        type="button"
        onClick={() => openSectionEditor(tab)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors whitespace-nowrap shrink-0 ${
          isOverridden
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
        }`}
        title={
          isOverridden
            ? 'Website-Only customized section (A4 CV untouched)'
            : 'Auto-synced from CV — click to customize for Website only'
        }
      >
        <Pencil className="w-3 h-3" />
        <span>{label}</span>
        <span className="hidden sm:inline opacity-80 font-normal">
          · {isOverridden ? 'Website-Only' : 'CV Synced'}
        </span>
      </button>
    );
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} no-print relative z-10`}>
      <div
        className={`min-h-screen ${canvasClass} selection:bg-blue-600 selection:text-white transition-colors duration-200 pb-24 md:pb-0 font-['Plus_Jakarta_Sans','Hind_Siliguri',sans-serif]`}
      >
        {/* Top Reading Scroll Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-transparent pointer-events-none">
          <div
            className={`h-full bg-gradient-to-r ${accent.progress} origin-left transition-transform duration-75`}
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>

        {/* Clean 3-Zone Top Bar Contract */}
        <header
          className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
            isEditorial
              ? 'bg-[#FAF9F5]/92 dark:bg-[#0C0D10]/92 border-stone-200 dark:border-stone-800/80'
              : 'bg-white/92 dark:bg-[#070B14]/92 border-slate-200 dark:border-slate-800/80'
          }`}
        >
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-8">
            {/* Zone 1: Clear Labeled Mobile Menu Button + Single Brand Wordmark */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden min-h-[40px] px-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold shrink-0"
                aria-label="Open Navigation and Controls Menu"
              >
                <Menu className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Menu</span>
              </button>
              <a
                href="#about"
                className={`text-sm sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 truncate max-w-[155px] sm:max-w-none ${displayHeadingFont}`}
              >
                {siteData.name}
              </a>
            </div>

            {/* Zone 2: 5 Clean Single-Line Nav Links (Desktop lg+) */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
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

            {/* Zone 3: Quick Utility Triggers + Primary Action */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="hidden sm:flex p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors items-center gap-1.5 text-xs"
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
                className="min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 p-2 rounded-xl sm:rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-center"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Light or Dark Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {isStudioUnlocked && (
                <>
                  {onUpdatePortfolioSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!websiteEditMode) {
                          setWebsiteEditMode(true);
                          setEditorOpen(true);
                        } else {
                          setEditorOpen(true);
                        }
                      }}
                      className={`hidden sm:flex px-3 py-2 rounded-lg text-xs font-bold transition-colors items-center gap-1.5 whitespace-nowrap shrink-0 border ${
                        websiteEditMode
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/35 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/40'
                      }`}
                      title="Edit Live Website Content Only (A4 CV / PDF remains untouched)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Site</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onBackToEditor}
                    className="hidden sm:flex px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/35 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-xs font-bold transition-colors items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>CV Studio</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onExportPDF}
                className={`min-h-[40px] sm:min-h-0 px-3 sm:px-4 py-2 rounded-xl sm:rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${accent.btnPrimary}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download CV</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* NON-DESTRUCTIVE WEBSITE EDIT MODE & DRAFT/PUBLISH RIBBON (Owner Only) */}
        {isStudioUnlocked && (websiteEditMode || hasUnpublishedDraft) && onUpdatePortfolioSettings && (
          <div className="bg-amber-50/95 dark:bg-amber-950/45 border-b border-amber-200 dark:border-amber-500/30 px-3.5 sm:px-6 py-2">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 min-w-0">
                <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold truncate">
                  {hasUnpublishedDraft
                    ? 'Draft Preview Active · এই পরিবর্তন এখনো লাইভ পাবলিশ হয়নি (A4 CV অপরিবর্তিত)'
                    : 'Website Edit Mode · এখানের পরিবর্তন শুধু ওয়েবসাইটে সেভ হবে (A4 CV / PDF অপরিবর্তিত থাকবে)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {hasUnpublishedDraft && onPublishDraft && (
                  <button
                    type="button"
                    onClick={onPublishDraft}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3 h-3" /> Publish Live
                  </button>
                )}
                {hasUnpublishedDraft && onDiscardDraft && (
                  <button
                    type="button"
                    onClick={onDiscardDraft}
                    className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-semibold transition"
                  >
                    Discard Draft
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditorOpen(true)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
                >
                  Open Content Editor
                </button>
                {websiteEditMode && (
                  <button
                    type="button"
                    onClick={() => setWebsiteEditMode(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 font-semibold transition"
                  >
                    Exit Edit Mode
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FULL NATIVE-APP MOBILE MENU & CONTROLS SHEET (< 1024px) */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className={`flex-1 overflow-y-auto ${canvasClass} p-4 pb-12 space-y-5`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className={`text-lg font-extrabold text-slate-900 dark:text-white ${displayHeadingFont}`}>
                    Navigation &amp; Controls
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    সব সেকশন, ওয়েবসাইট ডিজাইন ও রিক্রুটার টুলস
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Website Design Layout Switcher */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  Website Design Style বেছে নিন
                </div>
                <div className="space-y-2">
                  {DESIGN_STYLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isCurrent = activeStyle === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleChangeDesignStyle(opt.key)}
                        className={`w-full min-h-[60px] p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition ${
                          isCurrent
                            ? `${accent.activePill} shadow-sm`
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : `${accent.ringSoft}`
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold flex items-center justify-between gap-2">
                            <span>{opt.label}</span>
                            {isCurrent && <Check className="w-4 h-4 shrink-0" />}
                          </div>
                          <div
                            className={`text-xs mt-0.5 leading-snug ${
                              isCurrent ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Page Sections with Clear Descriptions */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  Page Sections (সরাসরি যান)
                </div>
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = activeSection === item.id;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full min-h-[58px] p-3.5 rounded-2xl border flex items-center gap-3.5 transition ${
                          isCurrent
                            ? `${accent.activePill}`
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent ? 'bg-white/20 text-white' : accent.ringSoft
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold">{item.label}</div>
                          <div
                            className={`text-xs mt-0.5 ${
                              isCurrent ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.desc}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 shrink-0 opacity-70" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* 3. Recruiter Role Lens (if available) */}
              {profiles.length > 0 && onSelectPublicProfile && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                    Role Perspectives (পদের ধরন)
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {profiles.slice(0, 4).map((prof) => {
                      const isSel = prof.id === activeProfileId;
                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => {
                            onSelectPublicProfile(prof.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`min-h-[52px] px-4 py-2.5 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                            isSel
                              ? accent.activePill
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{prof.name}</div>
                            <div
                              className={`text-xs truncate ${
                                isSel ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {prof.description}
                            </div>
                          </div>
                          {isSel && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Quick Tools & Owner Access */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  Quick Actions &amp; Owner Studio
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCommandOpen(true);
                    }}
                    className="min-h-[48px] px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" /> Quick Search
                  </button>
                  {onOpenPrintPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPrintPreview();
                      }}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> A4 CV View
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      exportVCard(siteData);
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[48px] px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-500" /> Save Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setQrModalOpen(true);
                    }}
                    className="min-h-[48px] px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2"
                  >
                    <QrCode className={`w-4 h-4 ${accent.eyebrow}`} /> QR Card
                  </button>
                </div>

                {isStudioUnlocked && (
                  <div className="space-y-2 pt-1">
                    {onUpdatePortfolioSettings && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setWebsiteEditMode(true);
                          setEditorOpen(true);
                        }}
                        className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Pencil className="w-4 h-4" /> Edit Live Website (CV Untouched)
                      </button>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onBackToEditor();
                        }}
                        className="col-span-2 min-h-[50px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> Open CV Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLockStudio();
                        }}
                        className="min-h-[50px] px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-4 h-4" /> Lock
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section
          id="about"
          className="relative py-8 sm:py-14 lg:py-16 px-4 sm:px-6 overflow-hidden"
          style={
            isBlueprint
              ? {
                  backgroundImage:
                    'linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }
              : isEditorial
              ? undefined
              : {
                  backgroundImage: `${accent.heroGlow}, radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.14) 1px, transparent 0)`,
                  backgroundSize: '100% 100%, 28px 28px',
                }
          }
        >
          <div className="max-w-6xl mx-auto relative z-10 space-y-6">
            {/* Sub-header Portfolio Toolbar: Metadata + Design Layout Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                <span>{siteData.education.degree}</span>
                <span aria-hidden="true">·</span>
                <span>{siteData.education.school}</span>
                <span aria-hidden="true">·</span>
                <span>{location}</span>
                {activeRoleLabel && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className={`font-semibold ${accent.eyebrow}`}>
                      Tailored: {activeRoleLabel}
                    </span>
                  </>
                )}
              </div>

              {/* Clean Segmented Website Design Selector */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {renderSectionEditButton('hero', isHeroCustomized, 'Edit Hero')}
                <div
                  className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-full overflow-x-auto no-scrollbar"
                  role="group"
                  aria-label="Website Design Style"
                >
                  {DESIGN_STYLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isCurrent = activeStyle === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleChangeDesignStyle(opt.key)}
                        title={opt.desc}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isCurrent
                            ? accent.tabActive
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{opt.label}</span>
                        <span className="sm:hidden">{opt.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interactive Role Lens Bar + 1-Click Shareable Role Link */}
            {profiles.length > 1 && onSelectPublicProfile && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/80 dark:bg-slate-900/75 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                  <Compass className={`w-3.5 h-3.5 ${accent.eyebrow}`} />
                  <span>Target Role Lens:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                    {profiles.slice(0, 5).map((prof) => {
                      const isSel = prof.id === activeProfileId;
                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => onSelectPublicProfile(prof.id)}
                          title={prof.description}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                            isSel
                              ? accent.activePill
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {prof.name}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyActiveRoleUrl}
                    title="Copy direct shareable URL for this role view (?role=...)"
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                  >
                    {roleLinkCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied Link
                      </>
                    ) : (
                      <>
                        <Link2 className={`w-3 h-3 ${accent.eyebrow}`} /> Copy Role URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* HERO VARIANT 1: EXECUTIVE MONOGRAPH */}
            {isEditorial ? (
              <div className="portfolio-reveal space-y-8 pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                  <div className="lg:col-span-8 space-y-5">
                    {portfolioConfig.availabilityActive && (
                      <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{portfolioConfig.availabilityText}</span>
                      </div>
                    )}

                    <h1
                      className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.08] text-balance ${displayHeadingFont}`}
                    >
                      {siteData.name}
                    </h1>

                    <p className={`text-sm sm:text-base font-semibold tracking-wide ${accent.eyebrow}`}>
                      {siteData.title}
                    </p>

                    <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-[1.75] max-w-2xl">
                      {siteData.summary}
                    </p>

                    <div className="pt-2 space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={onExportPDF}
                          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap transition-colors ${accent.btnPrimary}`}
                        >
                          <Download className="w-4 h-4" /> Download Tailored CV
                        </button>
                        <a
                          href="#contact"
                          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-2 whitespace-nowrap hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
                        >
                          Schedule Interview <ArrowRight className="w-4 h-4" />
                        </a>
                        {onOpenPrintPreview && (
                          <button
                            type="button"
                            onClick={onOpenPrintPreview}
                            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View A4 CV
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <a
                          href={github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" /> GitHub
                        </a>
                        <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                        <a
                          href={linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> LinkedIn
                        </a>
                        {website && (
                          <>
                            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                            <a
                              href={website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Website
                            </a>
                          </>
                        )}
                        <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                        <button
                          type="button"
                          onClick={() => exportVCard(siteData)}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Save .vcf
                        </button>
                        <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                        <button
                          type="button"
                          onClick={() => setQrModalOpen(true)}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <QrCode className={`w-3.5 h-3.5 ${accent.eyebrow}`} /> QR Card
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Dossier Right Column */}
                  <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 pt-6 lg:pt-0 lg:pl-8 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-28 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 shrink-0 p-1">
                        {portraitFailed || !sitePhotoSrc ? (
                          <div className="w-full h-full rounded-lg flex items-center justify-center text-lg font-bold text-slate-500">
                            {getCompanyInitials(siteData.name)}
                          </div>
                        ) : (
                          <img
                            src={sitePhotoSrc}
                            alt={siteData.name}
                            referrerPolicy="no-referrer"
                            onError={() => setPortraitFailed(true)}
                            className="w-full h-full object-cover rounded-lg"
                            style={{
                              objectPosition: `${settings.photoPosX ?? 50}% ${settings.photoPosY ?? 50}%`,
                              transform: `scale(${settings.photoScale || 1})`,
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1.5">
                        <div className="text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Direct Dossier
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoordinate('email', email)}
                          className="w-full flex items-center justify-between gap-1.5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                        >
                          <span className="truncate">{email}</span>
                          {copiedCoord === 'email' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCoordinate('phone', phone)}
                          className="w-full flex items-center justify-between gap-1.5 text-left text-xs sm:text-sm font-['JetBrains_Mono',monospace] tabular-nums text-slate-600 dark:text-slate-300"
                        >
                          <span className="truncate">{phone}</span>
                          {copiedCoord === 'phone' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrModalOpen(true)}
                          className={`text-xs font-semibold ${accent.eyebrow} inline-flex items-center gap-1 hover:underline`}
                        >
                          <QrCode className="w-3.5 h-3.5" /> QR Business Card
                        </button>
                      </div>
                    </div>

                    {profiles.length > 0 && onSelectPublicProfile && (
                      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Compass className={`w-4 h-4 ${accent.eyebrow}`} />
                          Tailored Role Perspectives
                        </div>
                        <div className="space-y-1.5">
                          {profiles.slice(0, 4).map((prof) => {
                            const isSel = prof.id === activeProfileId;
                            return (
                              <button
                                key={prof.id}
                                type="button"
                                onClick={() => onSelectPublicProfile(prof.id)}
                                className={`w-full min-h-[40px] px-3 py-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                                  isSel
                                    ? accent.activePill
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                                }`}
                              >
                                <span className="truncate">{prof.name}</span>
                                {isSel && <Check className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editorial Hairline 3-Pillar Interactive Specialization Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-stone-200 dark:border-stone-800 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800">
                  {siteSpecializations.map((spec, idx) => {
                    const Icon = spec.icon;
                    const isSel = idx === focusIdx;
                    return (
                      <div
                        key={spec.id}
                        onClick={() => {
                          setFocusIdx(idx);
                          setFocusPaused(true);
                        }}
                        className={`py-4 md:px-5 first:md:pl-0 last:md:pr-0 space-y-2 cursor-pointer transition-colors ${
                          isSel ? 'bg-stone-100/60 dark:bg-white/[0.03]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            <Icon className={`w-4 h-4 ${accent.eyebrow} shrink-0`} />
                            <span>{spec.label}</span>
                          </span>
                          <span className={`text-[11px] font-['JetBrains_Mono',monospace] font-bold ${accent.eyebrow}`}>
                            {spec.metric}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {spec.proof}
                        </p>
                        {!hiddenSectionsSet.has('projects') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExplorePillarProjects(spec.label);
                            }}
                            className={`text-[11px] font-bold ${accent.eyebrow} hover:underline inline-flex items-center gap-1`}
                          >
                            Filter Related Projects <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* HERO VARIANT 2 & 3: SIGNATURE BENTO OR SYSTEMS BLUEPRINT */
              <div className="portfolio-reveal space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-stretch">
                  {/* Left Narrative & Interactive Specialization Focus */}
                  <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
                    {portfolioConfig.availabilityActive && (
                      <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{portfolioConfig.availabilityText}</span>
                      </div>
                    )}

                    <h1
                      className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08] text-balance ${displayHeadingFont}`}
                    >
                      {siteData.name}
                    </h1>

                    <p className={`text-sm sm:text-base font-bold ${accent.eyebrow} tracking-wide`}>
                      {siteData.title}
                    </p>

                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed text-left sm:text-justify max-w-2xl">
                      {siteData.summary}
                    </p>

                    {/* Primary 2-CTA Anchor + Quiet Utility Links Row */}
                    <div className="pt-2 space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={onExportPDF}
                          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap transition-colors ${accent.btnPrimary}`}
                        >
                          <Download className="w-4 h-4" /> Download Tailored CV
                        </button>
                        <a
                          href="#contact"
                          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 whitespace-nowrap transition-colors"
                        >
                          Schedule Interview <ArrowRight className="w-4 h-4" />
                        </a>
                        {onOpenPrintPreview && (
                          <button
                            type="button"
                            onClick={onOpenPrintPreview}
                            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View A4 CV
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <a
                          href={github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" /> GitHub
                        </a>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <a
                          href={linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> LinkedIn
                        </a>
                        {website && (
                          <>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                            <a
                              href={website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Website
                            </a>
                          </>
                        )}
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <button
                          type="button"
                          onClick={() => exportVCard(siteData)}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Download .vcf contact file for mobile or Outlook"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Save .vcf
                        </button>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <button
                          type="button"
                          onClick={() => setQrModalOpen(true)}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <QrCode className={`w-3.5 h-3.5 ${accent.eyebrow}`} /> QR Card
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Signature Bento / Blueprint Profile Card */}
                  <div
                    className={`lg:col-span-5 ${cardSurfaceClass} p-5 flex flex-col justify-between gap-4 shadow-sm`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0">
                        {portraitFailed || !sitePhotoSrc ? (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500">
                            {getCompanyInitials(siteData.name)}
                          </div>
                        ) : (
                          <img
                            src={sitePhotoSrc}
                            alt={siteData.name}
                            referrerPolicy="no-referrer"
                            onError={() => setPortraitFailed(true)}
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${settings.photoPosX ?? 50}% ${settings.photoPosY ?? 50}%`,
                              transform: `scale(${settings.photoScale || 1})`,
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-500 dark:text-slate-400">
                          Direct Coordinates
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoordinate('email', email)}
                          className="w-full flex items-center justify-between gap-1.5 text-left group/coord"
                          title="Click to copy email"
                        >
                          <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                            {email}
                          </span>
                          <span className="text-slate-400 group-hover/coord:text-slate-700 dark:group-hover/coord:text-slate-200 shrink-0">
                            {copiedCoord === 'email' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCoordinate('phone', phone)}
                          className="w-full flex items-center justify-between gap-1.5 text-left group/coord"
                          title="Click to copy phone number"
                        >
                          <span className="text-xs sm:text-[13px] font-['JetBrains_Mono',monospace] tabular-nums text-slate-600 dark:text-slate-300 truncate">
                            {phone}
                          </span>
                          <span className="text-slate-400 group-hover/coord:text-slate-700 dark:group-hover/coord:text-slate-200 shrink-0">
                            {copiedCoord === 'phone' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </button>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{location}</div>
                      </div>
                    </div>

                    {profiles.length > 0 && onSelectPublicProfile && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Compass className={`w-3.5 h-3.5 ${accent.eyebrow}`} />
                            Recruiter Role Lens
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">Tailor View &amp; PDF</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {profiles.slice(0, 4).map((prof) => {
                            const isSel = prof.id === activeProfileId;
                            return (
                              <button
                                key={prof.id}
                                type="button"
                                onClick={() => onSelectPublicProfile(prof.id)}
                                className={`min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-colors truncate ${
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
                      <div className="flex items-center gap-2">
                        {onOpenPrintPreview && (
                          <button
                            type="button"
                            onClick={onOpenPrintPreview}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> A4 View
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onExportPDF}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold whitespace-nowrap"
                        >
                          Export PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature 3-Pillar Interactive Specialization Showcase */}
                <div
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1"
                  onMouseEnter={() => setFocusPaused(true)}
                  onMouseLeave={() => setFocusPaused(false)}
                >
                  {siteSpecializations.map((spec, idx) => {
                    const Icon = spec.icon;
                    const isSel = idx === focusIdx;
                    return (
                      <div
                        key={spec.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setFocusIdx(idx);
                          setFocusPaused(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setFocusIdx(idx);
                            setFocusPaused(true);
                          }
                        }}
                        className={`cursor-pointer text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                          isSel
                            ? `bg-white dark:bg-slate-900 border-blue-500/60 dark:border-cyan-400/50 shadow-sm`
                            : 'bg-white/70 dark:bg-slate-900/50 border-slate-200/90 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSel ? accent.btnPrimary : accent.ringSoft
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {spec.label}
                            </span>
                            <span className={`text-[11px] font-['JetBrains_Mono',monospace] font-bold shrink-0 ${accent.eyebrow}`}>
                              {spec.metric}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                            {spec.proof}
                          </div>
                          {!hiddenSectionsSet.has('projects') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExplorePillarProjects(spec.label);
                              }}
                              className={`text-[11px] font-bold ${accent.eyebrow} hover:underline inline-flex items-center gap-1 pt-0.5`}
                            >
                              Explore Projects <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FULL-WIDTH 4-COLUMN QUANTITATIVE METRICS STRIP */}
        {hiddenSectionsSet.has('metrics') ? (
          renderHiddenPlaceholder('metrics', 'Impact Metrics Strip')
        ) : (
          <section className={`${sectionBandBg} py-6 sm:py-7 px-4`}>
            {isStudioUnlocked && websiteEditMode && onUpdatePortfolioSettings && (
              <div className="max-w-6xl mx-auto mb-3 flex justify-end">
                {renderSectionEditButton('metrics', isMetricsCustomized, 'Edit Metrics & Pillars')}
              </div>
            )}
            <div
              className={`max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 text-center font-['JetBrains_Mono',monospace] tabular-nums ${
                isBlueprint ? 'gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800' : ''
              }`}
            >
              {safeMetrics.map((m, idx) => (
                <div
                  key={m.id}
                  className={
                    isBlueprint
                      ? 'p-4 bg-white dark:bg-[#0B1222]'
                      : 'p-3.5 border-slate-200 dark:border-slate-800 [&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:border-r-0 sm:border-r sm:last:border-r-0 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0'
                  }
                >
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
                  <div className="text-xs font-sans text-slate-600 dark:text-slate-400 mt-1 font-semibold">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TECHNICAL SKILLS MATRIX */}
        {hiddenSectionsSet.has('skills') ? (
          renderHiddenPlaceholder('skills', 'Technical Skills Matrix')
        ) : (
        <section id="skills" className="py-14 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          {isEditorial ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-24">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                    {sectionLabel('01', 'Capabilities')}
                  </div>
                  {renderSectionEditButton('skills', isSkillsCustomized, 'Edit Skills')}
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                  Technical Skills &amp; Core Domains
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {skillsIntro}
                </p>
              </div>

              <div className="lg:col-span-8 divide-y divide-stone-200 dark:divide-stone-800 border-t border-b border-stone-200 dark:border-stone-800">
                {siteData.skills.map((s, idx) => {
                  const tags = splitTopLevelCommas(s.competencies);
                  const isRoleMatch = matchesRoleDomain(`${s.category} ${s.competencies}`, activeRoleKey);
                  return (
                    <div key={s.id || idx} className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-baseline">
                      <div className="sm:col-span-4 space-y-1">
                        <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {s.category}
                        </div>
                        {isRoleMatch && (
                          <div className={`text-[10.5px] font-['JetBrains_Mono',monospace] uppercase tracking-wider font-bold ${accent.eyebrow}`}>
                            ● Role Match
                          </div>
                        )}
                      </div>
                      <div className="sm:col-span-8 flex flex-wrap items-center gap-y-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {tags.map((tag, tIdx) => (
                          <React.Fragment key={tIdx}>
                            <span>{tag}</span>
                            {tIdx < tags.length - 1 && (
                              <span aria-hidden="true" className="mx-2 text-stone-300 dark:text-stone-700">
                                ·
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                      {sectionLabel('01', 'Capabilities')}
                    </div>
                    {renderSectionEditButton('skills', isSkillsCustomized, 'Edit Skills')}
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                    Core Technical Skills &amp; Competencies
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    {skillsIntro}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start max-w-full overflow-x-auto no-scrollbar sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSkillFilter('all')}
                    className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      skillFilter === 'all'
                        ? accent.tabActive
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All Domains
                  </button>
                  {siteData.skills.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkillFilter(s.id)}
                      className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
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

              <div
                className={
                  isBlueprint
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden'
                    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                }
              >
                {filteredSkills.map((s, idx) => {
                  const tags = splitTopLevelCommas(s.competencies);
                  const isRoleMatch = matchesRoleDomain(`${s.category} ${s.competencies}`, activeRoleKey);
                  const isFeaturedBento =
                    !isBlueprint && skillFilter === 'all' && idx === 0 && filteredSkills.length >= 4;
                  return (
                    <div
                      key={s.id || idx}
                      className={
                        isBlueprint
                          ? 'bg-white dark:bg-[#0B1222] p-5 flex flex-col justify-between transition-colors hover:bg-slate-50 dark:hover:bg-[#0F172A]'
                          : `${cardSurfaceClass} p-5 ${accent.hoverBorder} transition-all duration-200 hover:-translate-y-0.5 flex flex-col ${
                              isFeaturedBento ? 'md:col-span-2' : ''
                            }`
                      }
                    >
                      <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${accent.ringSoft} flex items-center justify-center shrink-0`}>
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
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug truncate">
                              {s.category}
                            </h3>
                            {isRoleMatch && (
                              <div className={`text-[10px] font-['JetBrains_Mono',monospace] uppercase tracking-wider font-bold ${accent.eyebrow}`}>
                                ● Role Match
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-['JetBrains_Mono',monospace] text-xs text-slate-400 tabular-nums shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-2 text-[13.5px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {tags.map((tag, tIdx) => (
                          <React.Fragment key={tIdx}>
                            <span>{tag}</span>
                            {tIdx < tags.length - 1 && (
                              <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-600 select-none">
                                ·
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
        )}

        {/* EXPERIENCE TIMELINE */}
        {hiddenSectionsSet.has('experience') ? (
          renderHiddenPlaceholder('experience', 'Professional Work Experience')
        ) : (
        <section id="experience" className={`${sectionBandBg} py-14 sm:py-16 px-4 sm:px-6`}>
          <div className={isEditorial ? 'max-w-6xl mx-auto' : 'max-w-5xl mx-auto'}>
            {isEditorial ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-24">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                      {sectionLabel('02', 'Career Timeline')}
                    </div>
                    {renderSectionEditButton('experience', isExpCustomized, 'Edit Experience')}
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                    Professional Experience
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {experienceIntro}
                  </p>
                </div>

                <div className="lg:col-span-8 divide-y divide-stone-200 dark:divide-stone-800 border-t border-b border-stone-200 dark:border-stone-800">
                  {siteData.experiences.map((exp) => {
                    const duration = calculateDuration(exp.date);
                    return (
                      <article key={exp.id} className="py-6 space-y-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold text-slate-900 dark:text-white ${displayHeadingFont}`}>
                              {exp.role}
                            </h3>
                            <div className={`text-sm font-semibold ${accent.eyebrow} mt-0.5`}>
                              {exp.company}
                            </div>
                          </div>
                          <div className="text-xs font-['JetBrains_Mono',monospace] tabular-nums text-slate-500 dark:text-slate-400">
                            {exp.date}
                            {duration ? ` (${duration})` : ''} · {exp.location}
                          </div>
                        </div>
                        <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-outside ml-4 list-disc">
                          {exp.bullets.map((b) => (
                            <li key={b.id} dangerouslySetInnerHTML={{ __html: b.text }} />
                          ))}
                        </ul>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 sm:mb-10">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                      {sectionLabel('02', 'Career Timeline')}
                    </div>
                    {renderSectionEditButton('experience', isExpCustomized, 'Edit Experience')}
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                    Professional Work Experience
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    {experienceIntro}
                  </p>
                </div>

                <div className="space-y-5 relative before:hidden md:before:block before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                  {siteData.experiences.map((exp) => {
                    const duration = calculateDuration(exp.date);
                    const isCollapsed = Boolean(collapsedExpIds[exp.id]);
                    return (
                      <div
                        key={exp.id}
                        className={`md:ml-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${accent.hoverBorder} transition-colors ${
                          isBlueprint ? 'rounded-xl' : 'rounded-2xl'
                        } p-5 sm:p-6 relative`}
                      >
                        <div className={`hidden md:block absolute -left-[33px] top-7 w-2.5 h-2.5 rounded-full ${accent.dot} ring-4 ring-white dark:ring-[#070B14]`} />
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-extrabold font-['JetBrains_Mono',monospace] shrink-0 ${accent.monogramBg}`}
                            >
                              {getCompanyInitials(exp.company)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                {exp.role}
                              </h3>
                              <div className={`text-xs sm:text-sm font-semibold ${accent.eyebrow} mt-0.5`}>
                                {exp.company}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs font-['JetBrains_Mono',monospace] tabular-nums text-slate-500 dark:text-slate-400">
                            <span>{exp.date}</span>
                            {duration && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                  {duration}
                                </span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span>{exp.location}</span>
                            <button
                              type="button"
                              onClick={() => toggleExperienceCard(exp.id)}
                              className="ml-1 min-h-[36px] min-w-[36px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center"
                              aria-label={isCollapsed ? 'Expand role details' : 'Collapse role details'}
                              title={isCollapsed ? 'Expand highlights' : 'Compact view'}
                            >
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isCollapsed ? (
                          <div className="mt-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>{exp.bullets.length} documented achievements &amp; responsibilities</span>
                            <button
                              type="button"
                              onClick={() => toggleExperienceCard(exp.id)}
                              className={`font-semibold ${accent.eyebrow} hover:underline`}
                            >
                              Expand details
                            </button>
                          </div>
                        ) : (
                          <ul className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-outside ml-4 list-disc">
                            {exp.bullets.map((b) => (
                              <li key={b.id} dangerouslySetInnerHTML={{ __html: b.text }} />
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
        )}

        {/* KEY PROJECTS SHOWCASE */}
        {hiddenSectionsSet.has('projects') ? (
          renderHiddenPlaceholder('projects', 'Key Projects & Case Studies')
        ) : (
        <section id="projects" className="py-14 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                  {sectionLabel('03', 'Case Studies')}
                </div>
                {renderSectionEditButton('projects', isProjectsCustomized, 'Edit Projects')}
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                Key Technical Projects &amp; Case Studies
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {projectsIntro}
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start max-w-full overflow-x-auto no-scrollbar sm:flex-wrap">
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
                  className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
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

          <div
            className={
              isBlueprint
                ? 'grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden'
                : 'grid grid-cols-1 md:grid-cols-2 gap-6'
            }
          >
            {filteredProjects.map((proj, idx) => {
              const isHeroProject =
                activeStyle === 'bento' &&
                projectFilter === 'all' &&
                idx === 0 &&
                filteredProjects.length >= 3;
              const enh = projectEnhancements[proj.id];
              return (
                <article
                  key={proj.id}
                  onClick={() => {
                    setCaseTab('overview');
                    setSelectedProject(proj);
                  }}
                  className={
                    isBlueprint
                      ? 'relative cursor-pointer bg-white dark:bg-[#0B1222] hover:bg-slate-50 dark:hover:bg-[#0F172A] p-5 sm:p-6 transition-colors flex flex-col justify-between group'
                      : `relative cursor-pointer ${cardSurfaceClass} p-5 sm:p-6 ${accent.hoverBorder} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30 flex flex-col justify-between group ${
                          isHeroProject ? 'md:col-span-2' : ''
                        }`
                  }
                >
                  {isStudioUnlocked && websiteEditMode && onUpdatePortfolioSettings && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSectionEditor('projects');
                      }}
                      className="absolute top-3.5 right-3.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/95 hover:bg-amber-400 text-slate-950 text-[11px] font-bold shadow-sm transition-colors"
                      title="Edit this project card for Live Website"
                    >
                      <Pencil className="w-3 h-3" /> Quick Edit
                    </button>
                  )}

                  <div className={isHeroProject ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : ''}>
                    <div className={isHeroProject ? 'lg:col-span-5' : ''}>
                      {enh?.imageUrl ? (
                        <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 aspect-[16/9]">
                          <img
                            src={enh.imageUrl}
                            alt={proj.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <ProjectBlueprintBanner proj={proj} />
                      )}
                    </div>

                    <div className={isHeroProject ? 'lg:col-span-7' : ''}>
                      {matchesRoleDomain(`${proj.title} ${proj.technologies} ${proj.description}`, activeRoleKey) && (
                        <div className={`text-[10.5px] font-['JetBrains_Mono',monospace] uppercase tracking-wider font-bold mb-1 ${accent.eyebrow}`}>
                          ● Recommended for {activeProfileObj?.name || 'Active Role'}
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white transition-colors ${isEditorial ? displayHeadingFont : ''}`}>
                          {isBlueprint ? `${String(idx + 1).padStart(2, '0')} · ${proj.title}` : proj.title}
                        </h3>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0 p-1.5"
                            aria-label={`Open ${proj.title}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <div className={`text-xs font-['JetBrains_Mono',monospace] ${accent.eyebrow} mb-3`}>
                        {proj.technologies.split(',').map((t) => t.trim()).join(' · ')}
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left sm:text-justify">
                        {proj.description}
                      </p>

                      {enh?.impact && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-['JetBrains_Mono',monospace]">
                          Impact · {enh.impact}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-[13px] font-semibold">
                    <span className={`${accent.eyebrow} inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform`}>
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
              );
            })}
          </div>
        </section>
        )}

        {/* CREDENTIALS BENTO GRID */}
        {hiddenSectionsSet.has('education') ? (
          renderHiddenPlaceholder('education', 'Education & Certifications')
        ) : (
        <section id="education" className={`${sectionBandBg} py-14 sm:py-16 px-4 sm:px-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 sm:mb-10">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                  {sectionLabel('04', 'Credentials')}
                </div>
                {renderSectionEditButton('credentials', isCredsCustomized, 'Edit Credentials')}
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                Education, Certifications &amp; Languages
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Academic foundation · Verified technical credentials · Core competencies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Academic Background
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      {siteData.education.degree}
                    </div>
                    <div className={`font-bold ${accent.eyebrow} text-sm`}>
                      {siteData.education.school}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-['JetBrains_Mono',monospace] tabular-nums">
                      {siteData.education.year} · {siteData.education.location}
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-3 border-t border-slate-200 dark:border-slate-800">
                      {siteData.education.modules}
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Professional Certifications
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
                  {siteData.certifications.map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-3">
                <Languages className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Languages</div>
                  <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {siteData.languages}
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Key Professional Strengths</div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {siteData.strengths}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* CUSTOM STUDIO SECTIONS */}
        {hasCustomSections && (
          hiddenSectionsSet.has('highlights') ? (
            renderHiddenPlaceholder('highlights', 'Additional Highlights & Credentials')
          ) : (
          <section id="highlights" className="py-14 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
            <div className="mb-8 sm:mb-10">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                  {sectionLabel('05', 'Highlights')}
                </div>
                {renderSectionEditButton('credentials', isCredsCustomized, 'Edit Highlights')}
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                Additional Highlights &amp; Credentials
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Custom achievements, references &amp; publications published from Studio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {siteData.customSections.map((sec) => (
                <div key={sec.id} className={`${cardSurfaceClass} p-5 sm:p-6 space-y-3`}>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    {sec.title}
                  </h3>
                  {sec.type === 'bullets' || sec.type === 'references' ? (
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed list-outside ml-4 list-disc">
                      {sec.content.map((item, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left sm:text-justify">
                      {sec.content.join(' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
          )
        )}

        {/* DIRECT CONTACT COMPOSER */}
        {hiddenSectionsSet.has('contact') ? (
          renderHiddenPlaceholder('contact', 'Direct Contact Composer')
        ) : (
        <section id="contact" className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className={`text-xs font-['JetBrains_Mono',monospace] uppercase tracking-[0.14em] ${accent.eyebrow} font-semibold`}>
                  {sectionLabel(hasCustomSections ? '06' : '05', 'Get In Touch')}
                </div>
                {renderSectionEditButton('credentials', isCredsCustomized, 'Edit Contact Copy')}
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance ${displayHeadingFont}`}>
                {contactHeading}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {contactSubtext}
              </p>

              <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
                <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${accent.hoverBorder} transition-colors`}>
                  <a href={`mailto:${email}`} className="flex items-center gap-3 min-w-0 flex-1">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Direct Email</div>
                      <div className="font-bold text-slate-900 dark:text-white truncate">{email}</div>
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyCoordinate('email', email)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0"
                    title="Copy email"
                  >
                    {copiedCoord === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${accent.hoverBorder} transition-colors`}>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 min-w-0 flex-1">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Phone / WhatsApp</div>
                      <div className="font-bold text-slate-900 dark:text-white font-['JetBrains_Mono',monospace] tabular-nums truncate">
                        {phone}
                      </div>
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyCoordinate('phone', phone)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0"
                    title="Copy phone"
                  >
                    {copiedCoord === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Location &amp; Timezone</div>
                    <div className="font-bold text-slate-900 dark:text-white">{location}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-emerald-500" /> GMT+6 · Async &amp; Remote Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleDirectInquirySubmit}
              className={`lg:col-span-7 ${cardSurfaceClass} p-5 sm:p-6 space-y-4 text-sm`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-base text-slate-900 dark:text-white">
                  Send a Direct Message
                </div>
                <span className="text-[11px] font-['JetBrains_Mono',monospace] text-emerald-600 dark:text-emerald-400">
                  Direct Inbox Delivery
                </span>
              </div>

              {inquirySubmittedState ? (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-500/40 p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                        Message Delivered to {siteData.name}&apos;s Inbox!
                      </div>
                      <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                        {inquirySubmittedState.savedToCloud
                          ? `Synced securely at ${inquirySubmittedState.sentAt}. You can also copy the email address or send a backup via your email app.`
                          : `Saved locally at ${inquirySubmittedState.sentAt}. For instant external email delivery, click "Open in Email App" below.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setInquirySubmittedState(null)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold ${accent.btnPrimary}`}
                    >
                      Send Another Message
                    </button>
                    <a
                      href={`mailto:${email}`}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> Open Email App
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Recruiter / Hiring Manager"
                        className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Email or Company
                      </label>
                      <input
                        type="text"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="hr@company.com"
                        className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Inquiry Topic
                    </label>
                    <select
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Job / Interview Opportunity">Job / Interview Opportunity</option>
                      <option value="Data Analytics / Power BI Project">Data Analytics / Power BI Project</option>
                      <option value="Software QA Consulting">Software QA Consulting</option>
                      <option value="IT Support / General Inquiry">IT Support / General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      placeholder="Share role details, interview schedule, or project requirements..."
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        {contactCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copy
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenMailtoFallback}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <Mail className="w-4 h-4" /> Email App
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className={`min-h-[44px] px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap disabled:opacity-60 ${accent.btnPrimary}`}
                    >
                      <Send className="w-4 h-4" /> {isSubmittingInquiry ? 'Sending...' : 'Send Direct Message'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </section>
        )}

        {/* Clean Minimal Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} {siteData.name}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {onOpenPrintPreview && (
                <button
                  type="button"
                  onClick={onOpenPrintPreview}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> A4 CV Preview
                </button>
              )}
              {isStudioUnlocked ? (
                <button
                  type="button"
                  onClick={onLockStudio}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock Studio
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-[11px] text-slate-400/70 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                  title="Owner Sign In (Ctrl+Shift+L or ?studio=1)"
                >
                  <Lock className="w-3 h-3" /> Owner
                </button>
              )}
            </div>
          </div>
        </footer>

        {/* Mobile Sticky Native App Bottom Bar */}
        <nav
          aria-label="Mobile Quick Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 grid grid-cols-4 gap-1.5 shadow-[0_-8px_24px_rgba(2,6,23,0.16)]"
        >
          <button
            type="button"
            onClick={onExportPDF}
            className={`min-h-[46px] rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 ${accent.btnPrimary}`}
          >
            <Download className="w-4 h-4" />
            <span>CV PDF</span>
          </button>
          {onOpenPrintPreview ? (
            <button
              type="button"
              onClick={onOpenPrintPreview}
              className="min-h-[46px] rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-[11px] font-bold flex flex-col items-center justify-center gap-0.5"
            >
              <Eye className="w-4 h-4" />
              <span>A4 View</span>
            </button>
          ) : (
            <a
              href="#projects"
              className="min-h-[46px] rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-[11px] font-bold flex flex-col items-center justify-center gap-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Projects</span>
            </a>
          )}
          <a
            href="#contact"
            className="min-h-[46px] rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-[11px] font-bold flex flex-col items-center justify-center gap-0.5"
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="min-h-[46px] rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-[11px] font-bold flex flex-col items-center justify-center gap-0.5"
          >
            <Menu className={`w-4 h-4 ${accent.eyebrow}`} />
            <span>Menu</span>
          </button>
        </nav>

        {/* Wide-Desktop Section Progress Rail (1440px+ / 2xl) */}
        <nav
          aria-label="Desktop Section Navigator"
          className="hidden 2xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-between gap-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? accent.activePill
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Floating Back-to-Top Button */}
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 md:bottom-6 right-4 sm:right-5 z-30 p-3 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg hover:scale-105 transition-transform"
            title="Back to top"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* Slide-Over Project Case Study Drawer */}
        {selectedProject && (
          <div
            className="no-print fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex justify-end"
            onClick={() => setSelectedProject(null)}
          >
            <aside
              role="dialog"
              aria-modal="true"
              aria-label={selectedProject.title}
              className="bg-white dark:bg-[#0B1222] border-l border-slate-200 dark:border-slate-800 max-w-xl w-full h-full overflow-y-auto p-5 sm:p-7 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col justify-between gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="min-w-0">
                    <div className={`text-xs font-['JetBrains_Mono',monospace] ${accent.eyebrow} mb-1`}>
                      Technical Case Study
                    </div>
                    <h3 className={`text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white ${displayHeadingFont}`}>
                      {selectedProject.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 shrink-0 flex items-center justify-center"
                    aria-label="Close Case Study"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Case Study Tabs */}
                <div className="flex flex-wrap sm:inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs w-full sm:w-auto">
                  {[
                    { key: 'overview', label: 'Overview & Impact' },
                    { key: 'architecture', label: 'Architecture' },
                    { key: 'stack', label: 'Stack & Tools' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCaseTab(tab.key as 'overview' | 'architecture' | 'stack')}
                      className={`min-h-[38px] flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap text-center ${
                        caseTab === tab.key
                          ? accent.tabActive
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {caseTab === 'overview' && (() => {
                  const enh = projectEnhancements[selectedProject.id];
                  const allGallery = [enh?.imageUrl, ...(enh?.galleryUrls || [])].filter(
                    (u): u is string => Boolean(u)
                  );
                  const activeImg = allGallery[selectedCaseImageIdx] || allGallery[0];
                  return (
                  <div className="space-y-4 text-sm leading-relaxed">
                    {activeImg ? (
                      <div className="space-y-2">
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 aspect-[16/9]">
                          <img
                            src={activeImg}
                            alt={`${selectedProject.title} visual ${selectedCaseImageIdx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {allGallery.length > 1 && (
                          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                            {allGallery.map((gImg, gIdx) => (
                              <button
                                key={gIdx}
                                type="button"
                                onClick={() => setSelectedCaseImageIdx(gIdx)}
                                className={`w-16 aspect-[16/10] rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                                  selectedCaseImageIdx === gIdx
                                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                                    : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={gImg}
                                  alt={`Thumb ${gIdx + 1}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <ProjectBlueprintBanner proj={selectedProject} />
                    )}
                    <p className="text-slate-600 dark:text-slate-300 text-left sm:text-justify">
                      {selectedProject.description}
                    </p>
                    {(projectEnhancements[selectedProject.id]?.problem ||
                      projectEnhancements[selectedProject.id]?.solution ||
                      projectEnhancements[selectedProject.id]?.impact) && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                        {projectEnhancements[selectedProject.id]?.problem && (
                          <div className="py-3 space-y-1">
                            <div className="text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              01 · Problem
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                              {projectEnhancements[selectedProject.id].problem}
                            </p>
                          </div>
                        )}
                        {projectEnhancements[selectedProject.id]?.solution && (
                          <div className="py-3 space-y-1">
                            <div className="text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              02 · Solution
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                              {projectEnhancements[selectedProject.id].solution}
                            </p>
                          </div>
                        )}
                        {projectEnhancements[selectedProject.id]?.impact && (
                          <div className="py-3 space-y-1">
                            <div className="text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              03 · Impact
                            </div>
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                              {projectEnhancements[selectedProject.id].impact}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })()}

                {caseTab === 'architecture' && (() => {
                  const enh = projectEnhancements[selectedProject.id];
                  const arch = buildProjectArchitectureSteps(selectedProject, enh?.architectureSteps);
                  const deliverables = enh?.deliverables?.trim() || arch.defaultDeliverables;
                  return (
                    <div className="space-y-4 text-sm">
                      <ProjectBlueprintBanner proj={selectedProject} />
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                            System Execution Pipeline ({arch.isCustom ? 'Custom' : 'Contextual'})
                          </span>
                          {isStudioUnlocked && onUpdatePortfolioSettings && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProject(null);
                                openSectionEditor('projects');
                              }}
                              className={`text-[11px] font-semibold inline-flex items-center gap-1 ${accent.eyebrow} hover:underline`}
                            >
                              <Pencil className="w-3 h-3" /> Edit Steps
                            </button>
                          )}
                        </div>
                        <ol className="space-y-2.5">
                          {arch.steps.map((step, sIdx) => (
                            <li
                              key={sIdx}
                              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800"
                            >
                              <span className={`font-['JetBrains_Mono',monospace] text-xs font-extrabold shrink-0 pt-0.5 ${accent.eyebrow}`}>
                                {String(sIdx + 1).padStart(2, '0')}
                              </span>
                              <span className="text-slate-700 dark:text-slate-200 leading-relaxed text-[13px]">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[11px] font-['JetBrains_Mono',monospace] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Key Deliverables
                        </div>
                        <p className={`text-xs sm:text-[13px] font-['JetBrains_Mono',monospace] font-semibold ${accent.eyebrow}`}>
                          {deliverables}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {caseTab === 'stack' && (
                  <div className="space-y-3 text-sm">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Core Tooling &amp; Technologies
                    </div>
                    <p className={`font-['JetBrains_Mono',monospace] ${accent.eyebrow} leading-relaxed`}>
                      {selectedProject.technologies.split(',').map((t) => t.trim()).join(' · ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                {selectedProject.url && (
                  <a
                    href={selectedProject.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5 ${accent.btnPrimary}`}
                  >
                    Open Live / Repository <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* Spotlight Command Palette Modal (Ctrl+K) */}
        {commandOpen && (
          <div
            className="no-print fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-20 p-4"
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
                  placeholder="Search actions, design styles, projects, role views..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCommandOpen(false)}
                  className="text-xs font-['JetBrains_Mono',monospace] text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1"
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
                      className="w-full min-h-[52px] px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <span className={`text-[11px] font-['JetBrains_Mono',monospace] ${accent.eyebrow} shrink-0`}>
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
            className="no-print fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setQrModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Digital Business Card
                </h3>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
                  aria-label="Close QR Business Card"
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
                <div className="font-extrabold text-base text-slate-900 dark:text-white">{siteData.name}</div>
                <div className={`text-xs ${accent.eyebrow} font-semibold`}>
                  {siteData.title}
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
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5"
                >
                  {shareCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{shareCopied ? 'Copied' : 'Copy URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportVCard(siteData)}
                  className={`min-h-[44px] py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 ${accent.btnPrimary}`}
                >
                  <UserPlus className="w-4 h-4" /> Save .vcf
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NON-DESTRUCTIVE LIVE WEBSITE CONTENT EDITOR DRAWER */}
        {isStudioUnlocked && onUpdatePortfolioSettings && (
          <WebsiteEditorDrawer
            isOpen={editorOpen}
            initialTab={editorTab}
            onClose={() => setEditorOpen(false)}
            cvData={cvData}
            cvPhotoSrc={settings.photoSrc}
            portfolio={portfolioConfig}
            onUpdatePortfolio={onUpdatePortfolioSettings}
            hasUnpublishedDraft={hasUnpublishedDraft}
            onPublishDraft={onPublishDraft}
            onDiscardDraft={onDiscardDraft}
            onShowToast={onShowToast}
          />
        )}
      </div>
    </div>
  );
}
