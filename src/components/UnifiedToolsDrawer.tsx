import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Mail,
  FileText,
  FileSearch,
  Sparkles,
  Copy,
  Download,
  Upload,
  Zap,
  Linkedin,
  Briefcase,
  Trash2,
  Plus,
  ExternalLink,
  Highlighter,
  FileDown,
} from 'lucide-react';
import { CVData, JobApplication, StudioSettings } from '../types/cv';
import { exportCoverLetterPDF, exportCoverLetterDoc } from '../utils/exporters';

interface UnifiedToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  settings: StudioSettings;
  score: number;
  activeProfileName?: string;
  jdHighlightKeywords?: string[];
  onToggleJDHighlight?: (keywords: string[]) => void;
  onInsertXYZBullet?: (bulletHtml: string) => void;
  onApplyRolePreset: (preset: 'master' | 'data' | 'sqa' | 'netops') => void;
  onOpenATSModal: () => void;
  onAddSkillKeyword: (kw: string) => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

const UNIFIED_SAMPLE_JDS = {
  sqa: 'Software QA Engineer: Manual Testing, Regression Testing, Smoke Testing, BVA, ECP, RTM, Postman, REST API, JSON Schema, Cypress, Jira, SQL, PostgreSQL, Agile, SDLC, STLC.',
  data: 'Data Analyst: Advanced SQL, PostgreSQL, Power BI, DAX, Star Schema, Power Query, ETL, Excel, Python, data integrity, KPI reporting, ERP.',
  sysadmin: 'IT Support and Network Administrator: Windows Server, Active Directory, Linux, MikroTik, CCNA, LAN, VLAN, ERP, SaaS, RBAC, backup management.',
};

const TECH_KEYWORDS = [
  'SQL', 'PostgreSQL', 'Power BI', 'DAX', 'Star Schema', 'Power Query', 'ETL', 'Excel', 'Python',
  'Manual Testing', 'Regression', 'Smoke', 'Sanity', 'BVA', 'ECP', 'RTM', 'Postman', 'REST API',
  'JSON Schema', 'Cypress', 'Playwright', 'Selenium', 'JMeter', 'Jira', 'Agile', 'Scrum', 'SDLC', 'STLC',
  'Git', 'GitHub', 'CI/CD', 'ERP', 'SaaS', 'RBAC', 'Windows Server', 'Active Directory', 'Linux',
  'MikroTik', 'CCNA', 'LAN', 'Node.js', 'React', 'Vercel',
];

const ACTION_VERBS = {
  'Data & Analysis': [
    'Analyzed', 'Constructed', 'Reconciled', 'Extracted', 'Engineered', 'Standardized',
    'Modeled', 'Benchmarked', 'Forecasted', 'Queried', 'Transformed', 'Verified'
  ],
  'Software QA & Testing': [
    'Validated', 'Authored', 'Executed', 'Audited', 'Investigated', 'Debugged',
    'Diagnosed', 'Triage-tagged', 'Documented', 'Automated', 'Configured', 'Certified'
  ],
  'Leadership & Execution': [
    'Spearheaded', 'Orchestrated', 'Championed', 'Administered', 'Delivered', 'Streamlined',
    'Architected', 'Deployed', 'Facilitated', 'Overhauled', 'Accelerated', 'Optimized'
  ],
};

export function UnifiedToolsDrawer({
  isOpen,
  onClose,
  cvData,
  settings,
  score,
  activeProfileName = 'Master Executive',
  jdHighlightKeywords = [],
  onToggleJDHighlight,
  onInsertXYZBullet,
  onApplyRolePreset,
  onOpenATSModal,
  onAddSkillKeyword,
  onShowToast,
}: UnifiedToolsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'ats' | 'verbs' | 'linkedin' | 'signature' | 'cover' | 'tracker' | 'pdf'>('ats');
  const [selectedRole, setSelectedRole] = useState<'master' | 'data' | 'sqa' | 'netops'>('master');

  // Job Application Tracker state (persisted in localStorage)
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('shoyeb_job_tracker_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [appCompany, setAppCompany] = useState('');
  const [appRole, setAppRole] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appNotes, setAppNotes] = useState('');
  const [appStatus, setAppStatus] = useState<JobApplication['status']>('Applied');
  const [appFilter, setAppFilter] = useState<'All' | JobApplication['status']>('All');
  const [appSearch, setAppSearch] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('shoyeb_job_tracker_v1', JSON.stringify(applications));
    } catch {
      // ignore
    }
  }, [applications]);

  // JD state
  const [jdText, setJdText] = useState('');

  // XYZ Builder state
  const [xyzAchieved, setXyzAchieved] = useState('Reconciled multi-source client sales records');
  const [xyzMeasured, setXyzMeasured] = useState('50,000+ entries with 100% data integrity');
  const [xyzDoing, setXyzDoing] = useState('utilizing advanced PostgreSQL JOINs and Power Query ETL pipelines');

  // Signature state
  const [sigLayout, setSigLayout] = useState<'blue' | 'compact' | 'dark'>('blue');
  const [sigHeadline, setSigHeadline] = useState('');
  const [sigHighlights, setSigHighlights] = useState('');
  const [sigCta, setSigCta] = useState('View Full CV & Portfolio');
  const [showSigCta, setShowSigCta] = useState(true);

  // Cover letter state
  const [coverRole, setCoverRole] = useState('');
  const [coverCompany, setCoverCompany] = useState('');
  const [coverManager, setCoverManager] = useState('Hiring Manager');
  const [coverLocation, setCoverLocation] = useState('Chattogram, Bangladesh');
  const [coverTrack, setCoverTrack] = useState<'hybrid' | 'sqa' | 'data' | 'netops'>('hybrid');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedCover, setGeneratedCover] = useState('');

  // PDF Viewer state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Auto-generate drafts on open or parameter change
  useEffect(() => {
    handleGenerateDrafts();
  }, [coverRole, coverCompany, coverManager, coverLocation, coverTrack, cvData]);

  if (!isOpen) return null;

  // JD Keyword analysis
  const cvFullText = [
    cvData.name,
    cvData.title,
    cvData.summary,
    ...cvData.skills.map((s) => s.category + ' ' + s.competencies),
    ...cvData.experiences.flatMap((e) => [e.role, e.company, ...e.bullets.map((b) => b.text)]),
    ...cvData.projects.map((p) => p.title + ' ' + p.technologies + ' ' + p.description),
  ]
    .join(' ')
    .toLowerCase();

  const jdLower = jdText.toLowerCase();
  const requiredKeywords = TECH_KEYWORDS.filter((k) => jdLower.includes(k.toLowerCase()));
  const matchedKeywords = requiredKeywords.filter((k) => cvFullText.includes(k.toLowerCase()));
  const missingKeywords = requiredKeywords.filter((k) => !cvFullText.includes(k.toLowerCase()));
  const matchRate = requiredKeywords.length
    ? Math.round((matchedKeywords.length / requiredKeywords.length) * 100)
    : 100;

  function handleGenerateDrafts() {
    const role = coverRole.trim() || 'the advertised position';
    const company = coverCompany.trim() || 'your organization';
    const manager = coverManager.trim() || 'Hiring Manager';
    const location = coverLocation.trim() || '';

    const focus = {
      hybrid: 'Data Analytics, Software QA, and Enterprise IT Infrastructure',
      sqa: 'Software Quality Assurance, REST API Testing, and Manual/Automated Test Suite Design',
      data: 'Data Analytics, Advanced SQL, Power BI Reporting, and ETL Pipelines',
      netops: 'IT Support, Systems, Windows Server, Linux, and Network Operations',
    }[coverTrack];

    const firstBullets = cvData.experiences
      .flatMap((e) => e.bullets)
      .slice(0, 2)
      .map((b) => '• ' + b.text.replace(/<[^>]+>/g, ''))
      .join('\n');

    const phone = cvData.contacts.find((c) => c.type === 'phone')?.label || '+8801622517200';
    const email = cvData.contacts.find((c) => c.type === 'email')?.label || 'shoyebrabbi@gmail.com';
    const website = cvData.contacts.find((c) => c.type === 'website')?.url || 'https://shoyebrabbi.com';

    const emailDraft = `Subject: Application for ${role} — ${cvData.name}\n\nDear ${manager},\n\nI am writing to express my strong interest in the ${role} position at ${company}. As an experienced ${cvData.title}, my background centers on ${focus}.\n\n${cvData.summary}\n\nKey Highlights of My Experience:\n${firstBullets}\n\nI have attached my comprehensive 2-page master CV for your review. Thank you for your time and consideration.\n\nBest regards,\n${cvData.name}\n${phone} | ${email}\nPortfolio: ${website}`;

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const coverDraft = `${today}\n\nTo\n${manager}\n${company}${location ? `\n${location}` : ''}\n\nSubject: Formal Application for ${role}\n\nDear ${manager},\n\nI am writing to formally present my qualifications for the ${role} position at ${company}. Having reviewed your requirements, I am confident that my specialized technical background in ${focus} makes me a strong fit for your team.\n\n${cvData.summary}\n\nRelevant Experience & Accomplishments:\n${firstBullets}\n\nI would welcome the opportunity to discuss how my skill set and problem-solving abilities can drive measurable results for ${company}. Thank you for your consideration.\n\nSincerely,\n${cvData.name}\n${cvData.title}\n${phone} | ${email}\n${website}`;

    setGeneratedEmail(emailDraft);
    setGeneratedCover(coverDraft);
  }

  function handleCopyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} ক্লিপবোর্ডে কপি হয়েছে!`, 'success');
  }

  function handleDownloadTxt(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`${filename} ডাউনলোড হয়েছে!`, 'success');
  }

  function handlePdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      onShowToast('অনুগ্রহ করে শুধুমাত্র PDF ফাইল সিলেক্ট করুন', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    onShowToast('রেফারেন্স PDF লোড হয়েছে', 'info');
  }

  // Signature card styling helper
  const palette =
    sigLayout === 'dark'
      ? { accent: '#0f172a', text: '#e2e8f0', muted: '#94a3b8', border: '#334155', bg: '#0b1120' }
      : sigLayout === 'compact'
      ? { accent: '#334155', text: '#1e293b', muted: '#475569', border: '#cbd5e1', bg: '#ffffff' }
      : { accent: '#0f4c81', text: '#1e293b', muted: '#475569', border: '#bfdbfe', bg: '#ffffff' };

  const phone = cvData.contacts.find((c) => c.type === 'phone')?.label || '+8801622517200';
  const email = cvData.contacts.find((c) => c.type === 'email')?.label || 'shoyebrabbi@gmail.com';
  const website = cvData.contacts.find((c) => c.type === 'website')?.url || 'https://shoyebrabbi.com';
  const linkedin = cvData.contacts.find((c) => c.type === 'linkedin')?.url || 'https://linkedin.com/in/shoyebrabbi';

  // LinkedIn Bio content
  const linkedinHeadlines = [
    `Data Analyst & BI Specialist | SQL, PostgreSQL, Power BI, DAX & ETL Pipelines`,
    `Software QA Engineer | Manual Testing, Postman REST APIs, Cypress & Jira Defect Tracking`,
    `Junior Data Analyst | SQA & Enterprise IT Support Specialist | B.Sc. in CSIT`,
  ];

  const linkedinAbout = `Dynamic and quality-focused Computer Science graduate (B.Sc. in CSIT) with 2+ years of hands-on professional industry experience bridging Data Analytics, Software Quality Assurance (SQA), and Enterprise IT Systems.

Core Expertise:
• Data Analytics: Advanced SQL (Complex JOINs, Subqueries), PostgreSQL, Power BI KPI Dashboards, Star Schema Modeling, Power Query ETL pipelines.
• Software QA: Manual functional, regression, sanity & smoke testing; REST API verification with Postman; BVA/ECP test design; Jira defect life cycle.
• Enterprise IT: Providing support to 100+ active users, Windows Server & Linux administration, ERP client workflows, and network infrastructure.

Graduated with a B.Sc. in CSIT (2020) and certified in Google Data Analytics, Applied Data Science with Python, and SQL query optimization. Open to high-impact Data Analyst and Software QA opportunities.`;

  const builtXyzBullet = `${xyzAchieved}, as measured by ${xyzMeasured}, ${xyzDoing}.`;

  return (
    <>
      <div
        className="no-print fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="no-print fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-slate-700 bg-slate-950 text-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 p-4 backdrop-blur">
          <div>
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Shoyeb CV Career Tools
            </h2>
            <p className="text-[11px] text-slate-400">সব টুল বর্তমান Master CV থেকে লাইভ কাজ করে</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <nav className="sticky top-[69px] z-10 flex flex-wrap gap-1 border-b border-slate-800 bg-slate-950 p-2">
          <button
            onClick={() => setActiveTab('ats')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'ats' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> ATS & JD
          </button>
          <button
            onClick={() => setActiveTab('verbs')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'verbs' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Action Verbs & XYZ
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'linkedin' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Bio
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'signature' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Gmail Signature
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'cover' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'tracker' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Job Tracker ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'pdf' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" /> PDF
          </button>
        </nav>

        {/* Tab 1: ATS & JD Match */}
        {activeTab === 'ats' && (
          <div className="space-y-4 p-4 text-xs">
            {/* Role Preset */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> ATS Audit & Role Tailoring
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                যেকোনো Role preset প্রয়োগ করলে একই CV-এর headline ও summary তাৎক্ষণিকভাবে টার্গেট রোলে রূপান্তরিত হবে।
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="master">Master / All-in-One</option>
                  <option value="data">Data Analyst & BI Developer</option>
                  <option value="sqa">Software QA Engineer</option>
                  <option value="netops">IT Support & Network Specialist</option>
                </select>
                <button
                  onClick={() => onApplyRolePreset(selectedRole)}
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold hover:bg-blue-500 text-white"
                >
                  Apply Role
                </button>
                <button
                  onClick={onOpenATSModal}
                  className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold hover:bg-emerald-600 text-white"
                >
                  Full ATS Audit
                </button>
              </div>
              <div className="mt-3 text-xs text-slate-300">
                Current live ATS score:{' '}
                <strong className="text-emerald-300 font-extrabold text-sm">{score}%</strong>
              </div>
            </div>

            {/* JD Matcher */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="font-bold text-blue-300">Job Description Keyword Matcher</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                চাকরির বিজ্ঞপ্তি (Job Description) পেস্ট করুন। সিস্টেম মিলিয়ে দেখাবে কোন কোন কিওয়ার্ড সিভিতে আছে এবং কোনটি নেই।
              </p>
              <textarea
                rows={5}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="এখানে Job Description পেস্ট করুন..."
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setJdText(UNIFIED_SAMPLE_JDS.sqa)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] hover:bg-slate-700 text-slate-300"
                >
                  Sample SQA JD
                </button>
                <button
                  onClick={() => setJdText(UNIFIED_SAMPLE_JDS.data)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] hover:bg-slate-700 text-slate-300"
                >
                  Sample Data JD
                </button>
                <button
                  onClick={() => setJdText(UNIFIED_SAMPLE_JDS.sysadmin)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] hover:bg-slate-700 text-slate-300"
                >
                  Sample IT JD
                </button>
              </div>

              {/* Results */}
              <div className="mt-4">
                {jdText.trim() ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">JD Keyword Match:</span>
                      <strong
                        className={`text-sm ${
                          matchRate >= 80 ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        {matchRate}% ({matchedKeywords.length}/{requiredKeywords.length})
                      </strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-slate-800">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${matchRate}%` }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-emerald-300">CV-তে ম্যাচ করেছে ({matchedKeywords.length}):</p>
                        {onToggleJDHighlight && matchedKeywords.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              onToggleJDHighlight(
                                jdHighlightKeywords.length > 0 ? [] : matchedKeywords
                              )
                            }
                            className={`px-2 py-0.5 rounded text-[10.5px] font-bold flex items-center gap-1 transition ${
                              jdHighlightKeywords.length > 0
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40'
                            }`}
                          >
                            <Highlighter className="w-3 h-3" />
                            {jdHighlightKeywords.length > 0 ? 'Turn Off Highlight' : 'Highlight on CV'}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedKeywords.map((w) => (
                          <span
                            key={w}
                            className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-200"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                    {missingKeywords.length > 0 && (
                      <div>
                        <p className="mb-1 font-bold text-amber-300">
                          CV-তে পাওয়া যায়নি (সিভিতে যোগ করতে ক্লিক করুন):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingKeywords.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => onAddSkillKeyword(w)}
                              className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10.5px] text-amber-200 hover:bg-amber-500/25 transition flex items-center gap-1"
                            >
                              {w} <span>+</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="italic text-slate-500 text-center py-2">
                    Job Description পেস্ট করুন অথবা উপরের স্যাম্পলগুলোতে ক্লিক করুন।
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Action Verbs & Google XYZ Formula */}
        {activeTab === 'verbs' && (
          <div className="space-y-4 p-4 text-xs">
            {/* Google XYZ Formula Assistant */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-amber-300">Google XYZ Formula Bullet Assistant</h3>
              </div>
              <p className="text-[11px] text-slate-400">
                গুগল ও শীর্ষ টেক কোম্পানির পরামর্শ অনুযায়ী প্রতিটি বুলেটে মেট্রিক রাখুন: <br />
                <code className="text-amber-300 font-mono">Accomplished [X], as measured by [Y], by doing [Z]</code>
              </p>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[10.5px] text-slate-300 block mb-0.5">X (কী অর্জন করেছেন / Accomplishment):</label>
                  <input
                    type="text"
                    value={xyzAchieved}
                    onChange={(e) => setXyzAchieved(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] text-slate-300 block mb-0.5">Y (পরিমাপযোগ্য ফলাফল / Quantifiable Metric):</label>
                  <input
                    type="text"
                    value={xyzMeasured}
                    onChange={(e) => setXyzMeasured(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] text-slate-300 block mb-0.5">Z (কী প্রযুক্তি / মেথড ব্যবহার করেছেন):</label>
                  <input
                    type="text"
                    value={xyzDoing}
                    onChange={(e) => setXyzDoing(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Live result */}
              <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-[10.5px] font-bold text-emerald-400">তৈরি হওয়া হাই-ইমপ্যাক্ট বুলেট:</div>
                <div className="text-slate-200 text-xs italic leading-relaxed">
                  "<strong>Data Analytics & DB Optimization:</strong> {builtXyzBullet}"
                </div>
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  {onInsertXYZBullet && (
                    <button
                      type="button"
                      onClick={() =>
                        onInsertXYZBullet(`<strong>Impact Highlight:</strong> ${builtXyzBullet}`)
                      }
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3 h-3" /> সিভিতে যুক্ত করুন
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopyText(builtXyzBullet, 'Google XYZ Bullet')}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <Copy className="w-3 h-3" /> কপি করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Categorized Power Action Verbs */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
              <h3 className="font-bold text-blue-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> ৫০+ পাওয়ারফুল অ্যাকশন ভার্ব লাইব্রেরি
              </h3>
              <p className="text-[11px] text-slate-400">
                যেকোনো ভার্বে ক্লিক করলেই তা ক্লিপবোর্ডে কপি হয়ে যাবে এবং আপনি সিভিতে পেস্ট করতে পারবেন:
              </p>

              {Object.entries(ACTION_VERBS).map(([category, verbs]) => (
                <div key={category} className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-300">{category}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {verbs.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleCopyText(v, `"${v}" Verb`)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-[10.5px] transition"
                        title="Click to copy verb"
                      >
                        {v} +
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: LinkedIn Bio & Headline Generator */}
        {activeTab === 'linkedin' && (
          <div className="space-y-4 p-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-blue-300">LinkedIn Profile Headline & Bio Generator</h3>
              </div>
              <p className="text-[11px] text-slate-400">
                আপনার বর্তমান সিভি থেকে সরাসরি তৈরি হওয়া রেডি-টু-ইউজ লিঙ্কডইন হেডলাইন ও এবাউট সেকশন:
              </p>

              {/* Headlines */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-slate-200 block">Suggested Profile Headlines:</label>
                {linkedinHeadlines.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-200 text-xs">{h}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(h, 'Headline')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-blue-300 shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>

              {/* About Bio */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200">Suggested LinkedIn About / Bio:</label>
                  <button
                    type="button"
                    onClick={() => handleCopyText(linkedinAbout, 'LinkedIn About')}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[11px] font-bold text-white flex items-center gap-1 shadow"
                  >
                    <Copy className="w-3 h-3" /> Copy Bio
                  </button>
                </div>
                <textarea
                  rows={10}
                  readOnly
                  value={linkedinAbout}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Gmail Signature Card */}
        {activeTab === 'signature' && (
          <div className="space-y-4 p-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="font-bold text-blue-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Gmail Signature Card Generator
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                নাম, পদবি ও যোগাযোগের লিংক সরাসরি CV থেকে নেওয়া হয়। রেন্ডার করা কার্ড সরাসরি জিমেইলে পেস্ট করা যাবে।
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">কার্ড ডিজাইন স্টাইল:</label>
                  <select
                    value={sigLayout}
                    onChange={(e) => setSigLayout(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="blue">Executive Blue</option>
                    <option value="compact">Compact Corporate</option>
                    <option value="dark">Dark Tech</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">কাস্টম পদবি / হেডলাইন:</label>
                  <input
                    type="text"
                    value={sigHeadline}
                    onChange={(e) => setSigHeadline(e.target.value)}
                    placeholder={cvData.title}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-slate-300 block mb-1">হাইলাইটস (প্রতি লাইনে একটি):</label>
                <textarea
                  rows={2}
                  value={sigHighlights}
                  onChange={(e) => setSigHighlights(e.target.value)}
                  placeholder="2+ Years Experience in SQL, BI & Software QA&#10;50,000+ Records Handled, 80+ Test Cases Designed"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showSigCta}
                    onChange={(e) => setShowSigCta(e.target.checked)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>Show "View Portfolio" CTA Button</span>
                </label>
              </div>

              {/* Rendered Card Preview */}
              <div className="mt-4 rounded-xl border border-slate-700 p-4 bg-white text-slate-900 shadow-md">
                <div
                  id="gmailSignatureCard"
                  style={{
                    backgroundColor: palette.bg,
                    color: palette.text,
                    border: `1px solid ${palette.border}`,
                    borderRadius: '8px',
                    padding: '14px',
                    maxWidth: '520px',
                    fontFamily: 'Inter, Arial, sans-serif',
                  }}
                >
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top' }}>
                          <div
                            style={{
                              fontSize: '17px',
                              fontWeight: 800,
                              color: palette.accent,
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {cvData.name}
                          </div>
                          <div
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: palette.muted,
                              marginTop: '2px',
                            }}
                          >
                            {sigHeadline || cvData.title}
                          </div>
                          {sigHighlights.trim() && (
                            <div
                              style={{
                                fontSize: '10.5px',
                                color: palette.text,
                                marginTop: '6px',
                                paddingLeft: '8px',
                                borderLeft: `2px solid ${palette.accent}`,
                                lineHeight: '1.5',
                              }}
                            >
                              {sigHighlights
                                .split('\n')
                                .map((l) => l.trim())
                                .filter(Boolean)
                                .map((line, idx) => (
                                  <div key={idx}>{line}</div>
                                ))}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: '11px',
                              color: palette.muted,
                              marginTop: '6px',
                              lineHeight: '1.6',
                            }}
                          >
                            <span>📞 {phone}</span> &nbsp;|&nbsp; <span>✉️ {email}</span>
                            <br />
                            <a
                              href={website}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: palette.accent, fontWeight: 'bold', textDecoration: 'none' }}
                            >
                              🌐 {website.replace('https://', '')}
                            </a>
                            &nbsp;|&nbsp;
                            <a
                              href={linkedin}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: palette.accent, fontWeight: 'bold', textDecoration: 'none' }}
                            >
                              💼 LinkedIn
                            </a>
                          </div>
                          {showSigCta && (
                            <div style={{ marginTop: '10px' }}>
                              <a
                                href={website}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-block',
                                  padding: '5px 12px',
                                  backgroundColor: palette.accent,
                                  color: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  borderRadius: '5px',
                                  textDecoration: 'none',
                                }}
                              >
                                {sigCta} →
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Copy actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('gmailSignatureCard');
                    if (el) {
                      const range = document.createRange();
                      range.selectNodeContents(el);
                      const sel = window.getSelection();
                      sel?.removeAllRanges();
                      sel?.addRange(range);
                      document.execCommand('copy');
                      sel?.removeAllRanges();
                      onShowToast('Gmail-এ পেস্ট করার জন্য রেন্ডার করা সিগনেচার কপি হয়েছে!', 'success');
                    }
                  }}
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold hover:bg-blue-500 text-white flex items-center gap-1.5 shadow"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Rendered Card for Gmail
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('gmailSignatureCard');
                    if (el) {
                      navigator.clipboard.writeText(el.outerHTML);
                      onShowToast('Signature HTML কপি হয়েছে!', 'success');
                    }
                  }}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold hover:bg-slate-700 text-slate-300"
                >
                  Copy HTML
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Cover Letter & Email Draft */}
        {activeTab === 'cover' && (
          <div className="space-y-4 p-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Cover Letter & Job Application Email
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                টার্গেট পদের বিবরণ দিন। সিস্টেম আপনার বর্তমান CV-এর তথ্য দিয়ে স্বয়ংক্রিয়ভাবে প্রফেশনাল ইমেইল ও কভার লেটার ড্রাফট তৈরি করবে।
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">টার্গেট পদ (Job Title):</label>
                  <input
                    type="text"
                    value={coverRole}
                    onChange={(e) => setCoverRole(e.target.value)}
                    placeholder="e.g. Junior Data Analyst / SQA Engineer"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">কোম্পানির নাম (Company):</label>
                  <input
                    type="text"
                    value={coverCompany}
                    onChange={(e) => setCoverCompany(e.target.value)}
                    placeholder="e.g. Apex Tech Ltd."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">হায়ারিং ম্যানেজার (Manager):</label>
                  <input
                    type="text"
                    value={coverManager}
                    onChange={(e) => setCoverManager(e.target.value)}
                    placeholder="Hiring Manager"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">লোকেশন (Location):</label>
                  <input
                    type="text"
                    value={coverLocation}
                    onChange={(e) => setCoverLocation(e.target.value)}
                    placeholder="Chattogram / Dhaka / Remote"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1">টেকনিক্যাল ট্র্যাক (Role Track):</label>
                  <select
                    value={coverTrack}
                    onChange={(e) => setCoverTrack(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="hybrid">Hybrid: Data Analytics + SQA + IT Support</option>
                    <option value="sqa">Software QA: Manual, API, Cypress, Jira</option>
                    <option value="data">Data Analyst: SQL, Power BI, ETL, PostgreSQL</option>
                    <option value="netops">IT Infrastructure: Windows Server, Linux, Networking</option>
                  </select>
                </div>
              </div>

              {/* Email Draft Box */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <strong className="text-blue-300">📧 Job Application Email Draft:</strong>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleCopyText(generatedEmail, 'Email Draft')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-200 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button
                      onClick={() => handleDownloadTxt(generatedEmail, 'Job_Application_Email.txt')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-200 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> .txt
                    </button>
                  </div>
                </div>
                <textarea
                  rows={7}
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11.5px] leading-relaxed text-slate-200 font-sans"
                />
              </div>

              {/* Formal Cover Letter Box */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <strong className="text-amber-300">📄 Formal Cover Letter:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        onShowToast('Cover Letter PDF তৈরি হচ্ছে...', 'info');
                        await exportCoverLetterPDF(generatedCover, cvData, settings, coverCompany);
                        onShowToast('Matched Cover Letter PDF ডাউনলোড হয়েছে!', 'success');
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 rounded text-[11px] font-bold text-white flex items-center gap-1 shadow"
                    >
                      <FileDown className="w-3 h-3" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportCoverLetterDoc(generatedCover, cvData, settings, coverCompany);
                        onShowToast('Cover Letter Word (.doc) ডাউনলোড হয়েছে!', 'success');
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[11px] font-bold text-white flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> .doc
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(generatedCover, 'Cover Letter')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-200 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadTxt(generatedCover, 'Cover_Letter.txt')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-200 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> .txt
                    </button>
                  </div>
                </div>
                <textarea
                  rows={10}
                  value={generatedCover}
                  onChange={(e) => setGeneratedCover(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11.5px] leading-relaxed text-slate-200 font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Job Application Tracker */}
        {activeTab === 'tracker' && (
          <div className="space-y-4 p-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> Job Application Tracker
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    কোথায় কোন ভার্সনের CV পাঠিয়েছেন তা এখানে সেভ রাখুন (ব্রাউজারে অটো-সেভ হয়)
                  </p>
                </div>
                {applications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const csvRows = [
                        ['Company', 'Role', 'Date', 'Profile Used', 'Status', 'URL', 'Notes'],
                        ...applications.map((a) => [
                          a.company,
                          a.role,
                          a.appliedDate,
                          a.profileName,
                          a.status,
                          a.url || '',
                          a.notes || '',
                        ]),
                      ]
                        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
                        .join('\n');
                      handleDownloadTxt(csvRows, 'Job_Applications_Tracker.csv');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                )}
              </div>

              {/* Add new application form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!appCompany.trim() || !appRole.trim()) return;
                  const entry: JobApplication = {
                    id: 'app_' + Date.now(),
                    company: appCompany.trim(),
                    role: appRole.trim(),
                    appliedDate: new Date().toISOString().split('T')[0],
                    profileName: activeProfileName,
                    status: appStatus,
                    url: appUrl.trim() || undefined,
                    notes: appNotes.trim() || undefined,
                  };
                  setApplications((prev) => [entry, ...prev]);
                  setAppCompany('');
                  setAppRole('');
                  setAppUrl('');
                  setAppNotes('');
                  onShowToast(`"${entry.company}" অ্যাপ্লিকেশন ট্র্যাকারে সেভ হয়েছে!`, 'success');
                }}
                className="space-y-2.5 bg-slate-950/70 border border-slate-800 rounded-xl p-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={appCompany}
                    onChange={(e) => setAppCompany(e.target.value)}
                    placeholder="কোম্পানির নাম (e.g. bKash)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={appRole}
                    onChange={(e) => setAppRole(e.target.value)}
                    placeholder="পদের নাম (e.g. SQA Engineer)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as JobApplication['status'])}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Technical Test">Technical Test</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="Job Post URL (ঐচ্ছিক)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="নোট (e.g. Submitted Data Analyst CV)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Entry
                  </button>
                </div>
              </form>

              {/* Filter & Search */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="কোম্পানি বা পদ খুঁজুন..."
                  className="flex-1 min-w-[140px] bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="All">All Status ({applications.length})</option>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Technical Test">Technical Test</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Applications List */}
              {(() => {
                const filtered = applications.filter((a) => {
                  const matchesStatus = appFilter === 'All' || a.status === appFilter;
                  const q = appSearch.toLowerCase();
                  const matchesSearch =
                    !q ||
                    a.company.toLowerCase().includes(q) ||
                    a.role.toLowerCase().includes(q);
                  return matchesStatus && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500">
                      {applications.length === 0
                        ? 'এখনো কোনো জব অ্যাপ্লিকেশন লগ করা হয়নি। উপরের ফর্ম থেকে আপনার প্রথম অ্যাপ্লিকেশন যুক্ত করুন!'
                        : 'এই ফিল্টারে কোনো অ্যাপ্লিকেশন পাওয়া যায়নি।'}
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {filtered.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              {app.company}
                              {app.url && (
                                <a
                                  href={app.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-[11px] text-cyan-300 font-medium">{app.role}</div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <select
                              value={app.status}
                              onChange={(e) => {
                                const next = e.target.value as JobApplication['status'];
                                setApplications((prev) =>
                                  prev.map((item) =>
                                    item.id === app.id ? { ...item, status: next } : item
                                  )
                                );
                              }}
                              className={`rounded px-2 py-0.5 text-[10.5px] font-bold border ${
                                app.status === 'Offer'
                                  ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                                  : app.status === 'Interview' || app.status === 'Technical Test'
                                  ? 'bg-blue-950 border-blue-500/40 text-blue-300'
                                  : app.status === 'Rejected'
                                  ? 'bg-rose-950 border-rose-500/40 text-rose-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-300'
                              }`}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Technical Test">Technical Test</option>
                              <option value="Interview">Interview</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                setApplications((prev) => prev.filter((item) => item.id !== app.id))
                              }
                              className="p-1 text-slate-500 hover:text-rose-400"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-slate-400">
                          <span>Date: {app.appliedDate}</span>
                          <span>·</span>
                          <span>CV: {app.profileName}</span>
                        </div>
                        {app.notes && (
                          <p className="text-[11px] text-slate-300 bg-slate-900/70 px-2 py-1 rounded">
                            {app.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 7: PDF Reference Viewer */}
        {activeTab === 'pdf' && (
          <div className="space-y-4 p-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h3 className="font-bold text-rose-300 flex items-center gap-1.5">
                <FileSearch className="w-4 h-4" /> PDF Reference Viewer
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                সিভি এডিট করার সময় আপনার অরিজিনাল রেফারেন্স PDF ফাইলটি পাশে রেখে মেলাতে পারেন।
              </p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold hover:bg-blue-500 text-white shadow">
                <Upload className="w-4 h-4" /> Choose PDF File
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfFile} />
              </label>

              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="PDF Reference Preview"
                  className="mt-3 h-[65vh] w-full rounded-lg border border-slate-700 bg-white"
                />
              ) : (
                <div className="mt-4 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500">
                  কোনো PDF ফাইল নির্বাচন করা হয়নি। আপনার পূর্বের CV PDF টি এখানে আপলোড করে পাশে প্রিভিউ করতে পারেন।
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
