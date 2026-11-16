import React, { useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  Minimize2,
  Columns2,
  RefreshCw,
} from 'lucide-react';
import { CVData, StudioSettings } from '../types/cv';

interface CVHealthCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  settings: StudioSettings;
  overflowPx: number;
  estimatedPages: number;
  onUpdateCVData: (updater: (prev: CVData) => CVData) => void;
  onAutoFit1Page: () => void;
  onAutoFit2Pages: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface IssueItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  title: string;
  detail: string;
  actionLabel?: string;
  onFix?: () => void;
}

export function CVHealthCheckModal({
  isOpen,
  onClose,
  cvData,
  settings,
  overflowPx,
  estimatedPages,
  onUpdateCVData,
  onAutoFit1Page,
  onAutoFit2Pages,
  onShowToast,
}: CVHealthCheckModalProps) {
  // Analyze CV
  const auditReport = useMemo(() => {
    const issues: IssueItem[] = [];
    let passedChecks = 0;
    const totalChecks = 6;

    // 1. Punctuation Check
    const unpunctuatedBullets: { expIdx: number; bIdx: number; text: string }[] = [];
    cvData.experiences.forEach((exp, expIdx) => {
      exp.bullets.forEach((b, bIdx) => {
        const plain = b.text.replace(/<[^>]+>/g, '').trim();
        if (plain.length > 10 && !/[.!?]$/.test(plain)) {
          unpunctuatedBullets.push({ expIdx, bIdx, text: plain });
        }
      });
    });

    if (unpunctuatedBullets.length > 0) {
      issues.push({
        id: 'punctuation',
        type: 'warning',
        category: 'Formatting Hygiene',
        title: `${unpunctuatedBullets.length} Bullet Point(s) Missing Period`,
        detail:
          'Consistent punctuation signals recruiter polish. Some bullets do not end with a full stop.',
        actionLabel: '⚡ Auto-Fix All Punctuation',
        onFix: () => {
          onUpdateCVData((prev) => {
            const nextExp = prev.experiences.map((exp) => ({
              ...exp,
              bullets: exp.bullets.map((b) => {
                let trimmed = b.text.trim();
                const plain = trimmed.replace(/<[^>]+>/g, '').trim();
                if (plain.length > 5 && !/[.!?]$/.test(plain)) {
                  // check if ending tag exists
                  if (trimmed.endsWith('</strong>') || trimmed.endsWith('</span>')) {
                    trimmed = trimmed + '.';
                  } else {
                    trimmed = trimmed + '.';
                  }
                }
                return { ...b, text: trimmed };
              }),
            }));
            return { ...prev, experiences: nextExp };
          });
          onShowToast('সকল বুলেট পয়েন্টে ফুলস্টপ (.) যুক্ত করা হয়েছে!', 'success');
        },
      });
    } else {
      passedChecks++;
    }

    // 2. Placeholder Text Detection
    const placeholders = [
      'Company Name',
      'Role Title',
      'Month Year',
      'New Project Title',
      'Describe your impact',
      'ref1@example.com',
      '+880 1XXX',
    ];
    let placeholderCount = 0;
    const allText = JSON.stringify(cvData);
    placeholders.forEach((ph) => {
      if (allText.includes(ph)) placeholderCount++;
    });

    if (placeholderCount > 0) {
      issues.push({
        id: 'placeholders',
        type: 'error',
        category: 'Placeholder Text',
        title: `Found ${placeholderCount} Placeholder Dummy Item(s)`,
        detail:
          'Default placeholder text (like "Company Name" or dummy emails) is still present. Update them before sending to recruiters.',
      });
    } else {
      passedChecks++;
    }

    // 3. Link Protocols Check
    const unformattedLinks: string[] = [];
    cvData.contacts.forEach((c) => {
      if (c.url && c.type !== 'email' && c.type !== 'phone') {
        if (!/^https?:\/\//i.test(c.url.trim()) && !/^mailto:/i.test(c.url) && !/^tel:/i.test(c.url)) {
          unformattedLinks.push(c.label || c.type);
        }
      }
    });
    cvData.projects.forEach((p) => {
      if (p.url && !/^https?:\/\//i.test(p.url.trim())) {
        unformattedLinks.push(p.title);
      }
    });

    if (unformattedLinks.length > 0) {
      issues.push({
        id: 'link_protocols',
        type: 'info',
        category: 'Link Protocols',
        title: `${unformattedLinks.length} URL(s) Missing 'https://'`,
        detail: 'Prepend https:// so ATS readers and PDFs open clickable URLs directly in browser.',
        actionLabel: '⚡ Auto-Format URLs',
        onFix: () => {
          onUpdateCVData((prev) => ({
            ...prev,
            contacts: prev.contacts.map((c) => {
              if (c.url && c.type !== 'email' && c.type !== 'phone' && !/^https?:\/\//i.test(c.url.trim())) {
                return { ...c, url: `https://${c.url.trim()}` };
              }
              return c;
            }),
            projects: prev.projects.map((p) => {
              if (p.url && !/^https?:\/\//i.test(p.url.trim())) {
                return { ...p, url: `https://${p.url.trim()}` };
              }
              return p;
            }),
          }));
          onShowToast('সকল লিংকে https:// প্রটোকল যোগ করা হয়েছে!', 'success');
        },
      });
    } else {
      passedChecks++;
    }

    // 4. Quantifiable Metric Density Check
    let totalBullets = 0;
    let metricBullets = 0;
    cvData.experiences.forEach((exp) => {
      exp.bullets.forEach((b) => {
        totalBullets++;
        if (/\d+([,.]\d+)?(%|\+|\$|x|k|hrs?|hours?|users?|records?|cases?|ms)?/i.test(b.text)) {
          metricBullets++;
        }
      });
    });

    const metricPercent = totalBullets > 0 ? Math.round((metricBullets / totalBullets) * 100) : 0;
    if (metricPercent < 60) {
      issues.push({
        id: 'metric_density',
        type: 'warning',
        category: 'ATS & Recruiter Impact',
        title: `Metric Density at ${metricPercent}% (${metricBullets}/${totalBullets} bullets)`,
        detail:
          'Top candidates include quantified numbers, percentages, or cost/time savings in at least 70% of bullets.',
      });
    } else {
      passedChecks++;
    }

    // 5. Page Overflow Spill Check
    if (overflowPx > 20) {
      issues.push({
        id: 'overflow_spill',
        type: 'error',
        category: 'Print & Layout Fit',
        title: `Page Spill Alert (~${overflowPx}px overflown)`,
        detail:
          'A few stranded lines may awkwardly spill onto the next page. Use 1-Click Auto-Fit to perfectly fit.',
        actionLabel: estimatedPages === 1 ? '⚡ 1-Click Fit to 1 Page' : '⚡ 1-Click Fit to 2 Pages',
        onFix: () => {
          if (estimatedPages === 1) {
            onAutoFit1Page();
          } else {
            onAutoFit2Pages();
          }
          onShowToast('লেআউট অটো-কমপ্যাক্ট করা হয়েছে!', 'success');
        },
      });
    } else {
      passedChecks++;
    }

    // 6. Contact Essentials
    const hasEmail = cvData.contacts.some((c) => c.type === 'email' && c.label.includes('@'));
    const hasPhone = cvData.contacts.some((c) => c.type === 'phone' && c.label.length >= 7);
    if (!hasEmail || !hasPhone) {
      issues.push({
        id: 'contact_essentials',
        type: 'error',
        category: 'Contact Information',
        title: 'Missing Direct Contact Details',
        detail: 'Ensure both an email address and a phone number are present for recruiters.',
      });
    } else {
      passedChecks++;
    }

    const healthScore = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

    return { issues, healthScore, passedChecks, totalChecks };
  }, [cvData, overflowPx, estimatedPages, onUpdateCVData, onAutoFit1Page, onAutoFit2Pages, onShowToast]);

  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-[#060911]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                CV Health &amp; Pre-Flight Inspector
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    auditReport.healthScore >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : auditReport.healthScore >= 70
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {auditReport.healthScore}% Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                রিসার্চ-ব্যাকড প্রাক-ডেলিভারি অডিট: পাঙ্কচুয়েশন, ডামি টেক্সট, লিংক ও পেজ স্পিল চেক।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score banner */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black text-white font-mono">
              {auditReport.passedChecks}
              <span className="text-sm font-normal text-slate-400">/{auditReport.totalChecks} Checks Passed</span>
            </div>
            <div className="h-6 w-px bg-slate-700 hidden sm:block" />
            <div className="text-xs text-slate-300">
              {auditReport.issues.length === 0 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Perfect! CV is 100% recruiter-ready.
                </span>
              ) : (
                <span>
                  <strong className="text-amber-400">{auditReport.issues.length}</strong> items require attention or 1-click auto-fix.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAutoFit1Page}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              title="Compact font and padding to fit 1 page"
            >
              <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Fit 1-Page</span>
            </button>
            <button
              type="button"
              onClick={onAutoFit2Pages}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              title="Expand layout to balance across 2 pages"
            >
              <Columns2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fit 2-Pages</span>
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {auditReport.issues.length === 0 ? (
            <div className="text-center py-12 text-slate-300 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">সবকিছু নিখুঁত ও প্রফেশনাল!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                আপনার সিভিতে কোন ডামি টেক্সট নেই, সবগুলো বুলেট পয়েন্টে ফুলস্টপ রয়েছে, লিংকগুলো সুরক্ষিত এবং কোনো পেজ স্পিল নেই।
              </p>
            </div>
          ) : (
            auditReport.issues.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.type === 'error'
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : item.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-blue-950/20 border-blue-800/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.type === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : item.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{item.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.detail}</p>
                </div>

                {item.onFix && (
                  <button
                    type="button"
                    onClick={item.onFix}
                    className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{item.actionLabel || 'Auto-Fix'}</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#080D1A] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            Document status:{' '}
            <strong className="text-slate-200">
              {estimatedPages} Page(s) · {overflowPx > 0 ? `${overflowPx}px Spill` : '0px Spill'}
            </strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-semibold"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
