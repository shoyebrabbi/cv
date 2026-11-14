import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Layers,
  Share2,
  Edit2,
} from 'lucide-react';
import { CVProfile } from '../types/cv';

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: CVProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, description: string, baseProfileId: string) => void;
  onRenameProfile: (id: string, newName: string) => void;
  onDeleteProfile: (id: string) => void;
  onCopyShareLink: (url: string, profileName: string) => void;
}

export function ProfileManagerModal({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
  onCopyShareLink,
}: ProfileManagerModalProps) {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [baseId, setBaseId] = useState(activeProfileId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  function buildShareUrl(profile: CVProfile) {
    const slug =
      profile.rolePreset !== 'custom' && profile.id.startsWith('prof_')
        ? profile.id.replace('prof_', '')
        : profile.id;
    const base = window.location.origin + window.location.pathname;
    return `${base}?role=${encodeURIComponent(slug)}`;
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProfile(
      newName.trim(),
      newDesc.trim() || 'Custom tailored CV version',
      baseId || activeProfileId
    );
    setNewName('');
    setNewDesc('');
  }

  function handleCopy(profile: CVProfile) {
    const url = buildShareUrl(profile);
    onCopyShareLink(url, profile.name);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-2xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B1120]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Custom Profile Manager &amp; Shareable Role Links
              </h3>
              <p className="text-[11px] text-slate-400">
                আলাদা কোম্পানির জন্য কাস্টম সিভি তৈরি করুন এবং ডিরেক্ট রোল-লিংক (?role=...) শেয়ার করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Create New Version Form */}
          <form
            onSubmit={handleCreate}
            className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3"
          >
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> নতুন কাস্টম সিভি ভার্সন তৈরি করুন (Duplicate &amp; Tailor)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="যেমন: bKash SQA / Pathao Data Analyst"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <select
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    Copy from: {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="সংক্ষিপ্ত নোট (ঐচ্ছিক): যেমন Focus on PostgreSQL + Power BI"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold flex items-center justify-center gap-1.5 transition shrink-0"
              >
                <Plus className="w-4 h-4" /> Create Profile
              </button>
            </div>
          </form>

          {/* Existing Profiles List */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              আপনার সেভ করা প্রোফাইলসমূহ ({profiles.length})
            </div>

            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              const isBase = p.id === 'prof_master';
              const shareUrl = buildShareUrl(p);

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-950/35 border-blue-500/60'
                      : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    {editingId === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          className="bg-slate-950 border border-blue-500 rounded px-2 py-1 text-xs text-white flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingName.trim()) {
                              onRenameProfile(p.id, editingName.trim());
                            }
                            setEditingId(null);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{p.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 truncate">{p.description}</p>
                    <div className="text-[10.5px] font-mono text-cyan-300/80 truncate flex items-center gap-1.5">
                      <Share2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{shareUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => onSelectProfile(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-blue-600 text-white font-semibold transition"
                      >
                        Load
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold flex items-center gap-1 transition"
                      title="এই রোলের ডিরেক্ট ওয়েবসাইট লিংক কপি করুন"
                    >
                      {copiedId === p.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Share Link
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(p.id);
                        setEditingName(p.name);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                      title="Rename Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!isBase && (
                      <button
                        type="button"
                        onClick={() => onDeleteProfile(p.id)}
                        className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-400 border border-rose-500/30"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
