import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Copy,
  Check,
  X,
  Database,
  ShieldCheck,
  Server,
  Users,
  Award,
} from 'lucide-react';
import { BULLET_PHRASES, BulletPhraseItem } from '../data/bulletLibrary';

interface BulletLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoleTitle?: string;
  onInsertBullet: (htmlText: string) => void;
}

type CategoryFilter = 'all' | 'data_bi' | 'sqa_testing' | 'netops_it' | 'leadership_ops' | 'general_impact';

export function BulletLibraryModal({
  isOpen,
  onClose,
  targetRoleTitle,
  onInsertBullet,
}: BulletLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Categories', icon: Sparkles, count: BULLET_PHRASES.length },
    {
      id: 'data_bi',
      label: 'Data Analytics & Power BI',
      icon: Database,
      count: BULLET_PHRASES.filter((b) => b.category === 'data_bi').length,
    },
    {
      id: 'sqa_testing',
      label: 'Software QA & Testing',
      icon: ShieldCheck,
      count: BULLET_PHRASES.filter((b) => b.category === 'sqa_testing').length,
    },
    {
      id: 'netops_it',
      label: 'IT Ops & Systems',
      icon: Server,
      count: BULLET_PHRASES.filter((b) => b.category === 'netops_it').length,
    },
    {
      id: 'leadership_ops',
      label: 'Leadership & Management',
      icon: Users,
      count: BULLET_PHRASES.filter((b) => b.category === 'leadership_ops').length,
    },
    {
      id: 'general_impact',
      label: 'General Impact',
      icon: Award,
      count: BULLET_PHRASES.filter((b) => b.category === 'general_impact').length,
    },
  ];

  const filteredBullets = useMemo(() => {
    return BULLET_PHRASES.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.headline.toLowerCase().includes(q) ||
        item.plainText.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  function handleCopy(item: BulletPhraseItem) {
    navigator.clipboard.writeText(item.plainText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleInsert(item: BulletPhraseItem) {
    onInsertBullet(item.html);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-[#060911]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Action Bullet Points &amp; Phrases Library
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Ready-to-Use
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {targetRoleTitle ? (
                  <span>
                    Inserting into:{' '}
                    <strong className="text-blue-300">{targetRoleTitle}</strong>
                  </span>
                ) : (
                  'উচ্চ-প্রভাবশালী পরিমাপযোগ্য (Metric-Driven) বুলেট পয়েন্ট ১-ক্লিকে যুক্ত করুন।'
                )}
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

        {/* Search & Categories Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-[#080D1A] space-y-3 shrink-0">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g., DAX, Postman, Active Directory, Agile, SQL)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition text-[11px] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bullets List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          {filteredBullets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              কোন বুলেট পয়েন্ট পাওয়া যায়নি। অন্য কোনো কিওয়ার্ড দিয়ে সার্চ করুন।
            </div>
          ) : (
            filteredBullets.map((bullet) => (
              <div
                key={bullet.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-2 group/card"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900/60">
                      {bullet.headline}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {bullet.categoryLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(bullet)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition"
                      title="Copy to clipboard"
                    >
                      {copiedId === bullet.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsert(bullet)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 transition shadow-sm"
                      title="Insert directly into role"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>

                <div
                  className="text-xs text-slate-200 leading-relaxed font-sans"
                  dangerouslySetInnerHTML={{ __html: bullet.html }}
                />

                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {bullet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9.5px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#080D1A] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            Showing <strong className="text-white">{filteredBullets.length}</strong> bullet templates
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
