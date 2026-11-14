import React, { useState, useEffect } from 'react';
import {
  Lock,
  X,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  Loader2,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { OWNER_ADMIN_EMAIL, isOwnerEmail } from '../firebase';

type AuthMode = 'login' | 'setup' | 'forgot';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailPasswordLogin: (email: string, password: string) => Promise<void>;
  onFirstTimeSetup: (email: string, password: string) => Promise<void>;
  onSendPasswordReset: (email: string) => Promise<void>;
  onResendVerification: () => Promise<void>;
  onRefreshVerification: () => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onSignOut: () => Promise<void>;
  signedInEmail?: string | null;
  isEmailVerified?: boolean;
  isAuthorized: boolean;
  authError?: string;
  authSuccess?: string;
}

export function OwnerLoginModal({
  isOpen,
  onClose,
  onEmailPasswordLogin,
  onFirstTimeSetup,
  onSendPasswordReset,
  onResendVerification,
  onRefreshVerification,
  onGoogleLogin,
  onSignOut,
  signedInEmail,
  isEmailVerified = false,
  isAuthorized,
  authError,
  authSuccess,
}: OwnerLoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState(OWNER_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setLocalError('');
      setPassword('');
      setConfirmPassword('');
      setEmail(OWNER_ADMIN_EMAIL);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!cooldownUntil) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownLeft(remaining);
      if (remaining === 0) {
        setCooldownUntil(0);
        setFailedAttempts(0);
      }
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  if (!isOpen) return null;

  const isPendingVerification = Boolean(
    signedInEmail && isOwnerEmail(signedInEmail) && !isEmailVerified && !isAuthorized
  );
  const isWrongAccount = Boolean(signedInEmail && !isOwnerEmail(signedInEmail));
  const activeError = localError || authError;

  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s += 1;
    if (password.length >= 12) s += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s += 1;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  })();

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');

    if (cooldownLeft > 0) {
      setLocalError(`অনেকবার ভুল চেষ্টার কারণে নিরাপত্তার জন্য ${cooldownLeft} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    if (!isOwnerEmail(email)) {
      setLocalError(`নিরাপত্তা লক: শুধুমাত্র ${OWNER_ADMIN_EMAIL} অ্যাকাউন্ট অনুমোদিত।`);
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await onSendPasswordReset(email);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 8) {
      setLocalError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }

    if (mode === 'setup') {
      if (password !== confirmPassword) {
        setLocalError('দুটি পাসওয়ার্ড মেলেনি — অনুগ্রহ করে একই পাসওয়ার্ড দিন।');
        return;
      }
      setLoading(true);
      try {
        await onFirstTimeSetup(email, password);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      await onEmailPasswordLogin(email, password);
      setFailedAttempts(0);
    } catch {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      if (nextFails >= 5) {
        setCooldownUntil(Date.now() + 30_000);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(fn: () => Promise<void>) {
    setLocalError('');
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 text-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Shoyeb CV Studio Access</h3>
              <p className="text-[11px] text-slate-400">Single-Owner Email &amp; Password Lock</p>
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

        <div className="mt-4 space-y-4">
          {/* Security Notice */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-[11.5px] text-slate-300 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              এই স্টুডিও শুধুমাত্র ভেরিফায়েড ওনার{' '}
              <span className="font-semibold text-white">{OWNER_ADMIN_EMAIL}</span>-এর জন্য লক করা। অন্য কোনো ইমেইল দিয়ে কেউ লগইন বা এডিট করতে পারবে না।
            </div>
          </div>

          {/* Wrong Account Guard */}
          {isWrongAccount && (
            <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3.5 text-xs text-rose-200 space-y-2">
              <div className="flex items-start gap-2 font-semibold text-rose-300">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>অননুমোদিত অ্যাকাউন্ট ({signedInEmail})</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                শুধুমাত্র {OWNER_ADMIN_EMAIL} স্টুডিও আনলক করতে পারবে।
              </p>
              <button
                type="button"
                onClick={() => handleAction(onSignOut)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/45 border border-rose-400/40 text-white text-[11px] font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}

          {/* Email Verification Gate (when logged in with owner email, before email link clicked) */}
          {isPendingVerification ? (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>ইমেইল ভেরিফিকেশন বাকি আছে</span>
              </div>
              <p className="text-[11.5px] text-amber-100/90 leading-relaxed">
                নিরাপত্তার জন্য আপনার <strong className="text-white">{OWNER_ADMIN_EMAIL}</strong> ইনবক্সে (Inbox বা Spam ফোল্ডার) একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। লিংকটিতে ক্লিক করার পর নিচের বোতামে চাপুন:
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction(onRefreshVerification)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>আমি ইমেইল ভেরিফাই করেছি — Studio আনলক করুন</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction(onResendVerification)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> লিংক আবার পাঠান
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction(onSignOut)}
                    className="py-2 px-3 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalError('');
                  }}
                  className={`py-1.5 rounded-lg font-semibold transition ${
                    mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  লগইন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('setup');
                    setLocalError('');
                  }}
                  className={`py-1.5 rounded-lg font-semibold transition ${
                    mode === 'setup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  প্রথমবার সেটআপ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setLocalError('');
                  }}
                  className={`py-1.5 rounded-lg font-semibold transition ${
                    mode === 'forgot' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  পাসওয়ার্ড রিসেট
                </button>
              </div>

              {authSuccess && (
                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 text-[11.5px] text-emerald-200 leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {activeError && (
                <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 text-[11.5px] text-rose-200 leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{activeError}</span>
                </div>
              )}

              {/* Email & Password Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Owner Email (সুরক্ষিত ও নির্ধারিত)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                      placeholder={OWNER_ADMIN_EMAIL}
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {mode === 'setup' ? 'নতুন পাসওয়ার্ড তৈরি করুন (কমপক্ষে ৮ অক্ষর)' : 'পাসওয়ার্ড'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'setup' && password.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-1 flex-1 rounded-full ${
                              passwordStrength >= lvl
                                ? passwordStrength >= 3
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-1">
                          {passwordStrength >= 3 ? 'Strong' : passwordStrength >= 2 ? 'Medium' : 'Weak'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'setup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      পাসওয়ার্ড নিশ্চিত করুন
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                        placeholder="পাসওয়ার্ড আবার লিখুন"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || cooldownLeft > 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>যাচাই করা হচ্ছে...</span>
                    </>
                  ) : cooldownLeft > 0 ? (
                    <span>নিরাপত্তা বিরতি: {cooldownLeft}s</span>
                  ) : mode === 'setup' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>পাসওয়ার্ড সেট ও ভেরিফিকেশন পাঠান</span>
                    </>
                  ) : mode === 'forgot' ? (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠান</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>লগইন ও Studio আনলক করুন</span>
                    </>
                  )}
                </button>
              </form>

              {/* Optional Google Fallback */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction(onGoogleLogin)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11.5px] font-semibold flex items-center justify-center gap-2 transition"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                  <span>অথবা Google দিয়ে সাইন ইন (ঐচ্ছিক)</span>
                </button>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>সিকিউর Firebase Auth + Rules Lock</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
