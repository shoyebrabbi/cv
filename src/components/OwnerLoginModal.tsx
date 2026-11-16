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
  ArrowRight,
} from 'lucide-react';
import { isOwnerEmail } from '../firebase';

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
  onClearMessages?: () => void;
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
  onClearMessages,
}: OwnerLoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
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
      setEmail('');
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

  const modeHeading =
    mode === 'setup'
      ? 'Create Owner Password'
      : mode === 'forgot'
      ? 'Reset Owner Password'
      : 'Sign In to Studio';

  const modeSubtitle =
    mode === 'setup'
      ? 'Set your initial Studio password and verify ownership via Gmail.'
      : mode === 'forgot'
      ? 'We will send a secure password recovery link to your owner email.'
      : 'Enter your owner credentials to unlock live editing and cloud publishing.';

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setLocalError('');
    onClearMessages?.();
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');

    if (cooldownLeft > 0) {
      setLocalError(`Too many failed attempts. Please wait ${cooldownLeft} seconds before trying again.`);
      return;
    }

    if (!isOwnerEmail(email)) {
      setLocalError('Access restricted: only the verified site owner account is authorized to sign in.');
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
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    if (mode === 'setup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match. Please enter the same password in both fields.');
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
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-[#050811]/85 backdrop-blur-md p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-login-heading"
    >
      <div className="w-full max-w-[840px] max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0B1120] border border-slate-800/90 text-slate-100 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] grid grid-cols-1 md:grid-cols-12">
        {/* Left Architectural Identity Column */}
        <aside className="md:col-span-5 bg-[#070B14] border-b md:border-b-0 md:border-r border-slate-800/90 p-6 sm:p-8 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            {/* Brand Lockup */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F172A] border border-slate-700/80 flex items-center justify-center text-white font-['Outfit',sans-serif] font-bold text-base tracking-tight">
                S
              </div>
              <span className="font-['Outfit',sans-serif] font-semibold text-sm tracking-tight text-white whitespace-nowrap">
                Shoyeb CV Studio
              </span>
            </div>

            {/* Editorial Headline */}
            <div className="space-y-2.5">
              <h2
                id="owner-login-heading"
                className="font-['Outfit',sans-serif] text-2xl sm:text-[26px] font-semibold tracking-tight text-white leading-[1.2] text-balance"
              >
                Private Owner Workspace
              </h2>
              <p className="text-[13.5px] text-slate-400 leading-relaxed">
                Manage master resumes, tailor recruiter role lenses, and publish real-time portfolio updates from one secure console.
              </p>
            </div>

            {/* Clean Architectural Specs List (No Pills, No Nested Boxes) */}
            <div className="pt-2 border-t border-slate-800/80 divide-y divide-slate-800/70">
              <div className="py-3 flex items-baseline gap-3">
                <span className="font-mono tabular-nums text-[11px] text-slate-500 shrink-0">01</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200">Single-Owner Lock</div>
                  <div className="text-[11.5px] text-slate-400 truncate">Restricted to Verified Admin Account</div>
                </div>
              </div>
              <div className="py-3 flex items-baseline gap-3">
                <span className="font-mono tabular-nums text-[11px] text-slate-500 shrink-0">02</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200">Verified Identity Gate</div>
                  <div className="text-[11.5px] text-slate-400">Enforced by Firebase Auth &amp; Security Rules</div>
                </div>
              </div>
              <div className="py-3 flex items-baseline gap-3">
                <span className="font-mono tabular-nums text-[11px] text-slate-500 shrink-0">03</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200">Anytime Password Control</div>
                  <div className="text-[11.5px] text-slate-400">Re-authenticated updates &amp; email recovery</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiet Footer Metadata */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11.5px] text-slate-500">
            <span>Public Portfolio Mode</span>
            <span aria-hidden="true">·</span>
            <span>Admin Access Only</span>
          </div>
        </aside>

        {/* Right Interactive Auth Column */}
        <section className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-['Outfit',sans-serif] text-xl font-semibold tracking-tight text-white">
                  {isPendingVerification ? 'Verify Your Email' : modeHeading}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isPendingVerification
                    ? 'Confirm ownership of your authorized owner email to unlock editing.'
                    : modeSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close login modal"
                className="w-10 h-10 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wrong Account Alert */}
            {isWrongAccount && (
              <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 p-4 text-xs text-rose-200 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-rose-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Unauthorized Account</span>
                </div>
                <p className="text-[11.5px] text-rose-200/90 leading-relaxed">
                  Only the verified site owner account is permitted to unlock this studio.
                </p>
                <button
                  type="button"
                  onClick={() => handleAction(onSignOut)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600/25 hover:bg-rose-600/40 border border-rose-400/40 text-white text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* Verification Gate */}
            {isPendingVerification ? (
              <div className="space-y-4 pt-1">
                <div className="rounded-xl bg-amber-950/35 border border-amber-500/35 p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Email Verification Required</span>
                  </div>
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    A verification link has been sent to your authorized owner email. Check your inbox or spam folder, click the link, and then press the button below.
                  </p>
                </div>

                {authSuccess && (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/35 p-3.5 text-xs text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {activeError && (
                  <div className="rounded-xl bg-rose-950/40 border border-rose-500/35 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{activeError}</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction(onRefreshVerification)}
                    className="w-full h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>I&apos;ve Verified My Email — Unlock Studio</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleAction(onResendVerification)}
                      className="h-10 px-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Link</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleAction(onSignOut)}
                      className="h-10 px-3 rounded-xl bg-[#0F172A] hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Clean Segmented Mode Tabs */}
                <div
                  className="grid grid-cols-3 gap-1 bg-[#070B14] border border-slate-800/90 rounded-xl p-1 text-xs"
                  role="tablist"
                  aria-label="Authentication mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'login'}
                    onClick={() => switchMode('login')}
                    className={`py-2 px-2 rounded-lg font-medium transition-colors whitespace-nowrap truncate ${
                      mode === 'login'
                        ? 'bg-[#162036] text-white border border-slate-700/70'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'setup'}
                    onClick={() => switchMode('setup')}
                    className={`py-2 px-2 rounded-lg font-medium transition-colors whitespace-nowrap truncate ${
                      mode === 'setup'
                        ? 'bg-[#162036] text-white border border-slate-700/70'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    First-Time Setup
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'forgot'}
                    onClick={() => switchMode('forgot')}
                    className={`py-2 px-2 rounded-lg font-medium transition-colors whitespace-nowrap truncate ${
                      mode === 'forgot'
                        ? 'bg-[#162036] text-white border border-slate-700/70'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Reset Password
                  </button>
                </div>

                {/* Inline Status Banners */}
                {authSuccess && (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/35 px-3.5 py-3 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {activeError && (
                  <div className="rounded-xl bg-rose-950/45 border border-rose-500/40 px-3.5 py-3 text-xs text-rose-200 leading-relaxed flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{activeError}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="owner-email-input" className="font-medium text-slate-300">
                        Owner Email
                      </label>
                      <span className="text-[11px] text-slate-500">Single-owner locked</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="owner-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                        className="w-full h-11 bg-[#070B14] border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 rounded-xl pl-10 pr-3.5 text-[13px] text-white placeholder-slate-500 transition-colors"
                        placeholder="Enter authorized owner email"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Owner Admin ID:</span>
                      <button
                        type="button"
                        onClick={() => setEmail('md.shoyeb.rabbi@gmail.com')}
                        className="text-blue-400 hover:text-blue-300 font-mono text-[10.5px] hover:underline"
                        title="Click to fill owner email"
                      >
                        md.shoyeb.rabbi@gmail.com
                      </button>
                    </div>
                  </div>

                  {mode !== 'forgot' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label htmlFor="owner-password-input" className="font-medium text-slate-300">
                          {mode === 'setup' ? 'Create Password' : 'Password'}
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-[11.5px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="owner-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                          className="w-full h-11 bg-[#070B14] border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 rounded-xl pl-10 pr-11 text-[13px] text-white placeholder-slate-500 transition-colors"
                          placeholder="Enter at least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {mode === 'setup' && password.length > 0 && (
                        <div className="pt-1 flex items-center gap-2">
                          <div className="flex-1 grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((lvl) => (
                              <div
                                key={lvl}
                                className={`h-1 rounded-full transition-colors ${
                                  passwordStrength >= lvl
                                    ? passwordStrength >= 3
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                    : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                            {passwordStrength >= 3 ? 'Strong' : passwordStrength >= 2 ? 'Fair' : 'Weak'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === 'setup' && (
                    <div className="space-y-1.5">
                      <label htmlFor="owner-confirm-password-input" className="block text-xs font-medium text-slate-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="owner-confirm-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="w-full h-11 bg-[#070B14] border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 rounded-xl pl-10 pr-3.5 text-[13px] text-white placeholder-slate-500 transition-colors"
                          placeholder="Re-enter your password"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || cooldownLeft > 0}
                    className="w-full h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : cooldownLeft > 0 ? (
                      <span className="font-mono tabular-nums">Retry available in {cooldownLeft}s</span>
                    ) : mode === 'setup' ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Create Password &amp; Send Verification</span>
                      </>
                    ) : mode === 'forgot' ? (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Reset Email</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Sign In &amp; Unlock Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider & Optional Google Sign-In */}
                <div className="space-y-3">
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-slate-800/90" />
                    <span className="px-3 text-[11px] text-slate-500 whitespace-nowrap">or continue with</span>
                    <div className="flex-grow border-t border-slate-800/90" />
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction(onGoogleLogin)}
                    className="w-full h-10 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
                    <span>Continue with Google</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quiet Footer Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 text-[11.5px] text-slate-500">
            <span>Protected by Firebase Authentication</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white font-medium transition-colors"
            >
              Return to Portfolio
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
