import React, { useState, useEffect } from 'react';
import { Lock, Unlock, X, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (passcode: string, remember: boolean) => boolean;
}

export function OwnerLoginModal({ isOpen, onClose, onVerify }: OwnerLoginModalProps) {
  const [passcode, setPasscode] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = onVerify(passcode.trim(), remember);
    if (!ok) {
      setError('ভুল পাসকোড! অনুগ্রহ করে সঠিক ওনার পাসকোড দিন।');
    }
  }

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Shoyeb CV Studio Access</h3>
              <p className="text-[11px] text-slate-400">Owner authentication</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              এই পোর্টফোলিও ওয়েবসাইটটি ভিজিটর ও রিক্রুটারদের জন্য উন্মুক্ত।{' '}
              <strong className="text-white">Shoyeb CV Studio</strong>-তে প্রবেশ ও এডিট করার জন্য
              আপনার ওনার পাসকোড লিখুন।
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Owner Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="পাসকোড লিখুন..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-rose-400 mt-1.5 font-medium">{error}</p>}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-blue-500 w-3.5 h-3.5 rounded"
            />
            <span>এই ব্রাউজারে লগইন সেভ রাখুন (Remember me)</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition"
            >
              <Unlock className="w-3.5 h-3.5" /> Unlock Studio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
