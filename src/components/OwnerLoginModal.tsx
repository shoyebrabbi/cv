import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import { OWNER_ADMIN_EMAIL } from '../firebase';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => Promise<void>;
  onSignOut: () => Promise<void>;
  signedInEmail?: string | null;
  isAuthorized: boolean;
  authError?: string;
}

export function OwnerLoginModal({
  isOpen,
  onClose,
  onGoogleLogin,
  onSignOut,
  signedInEmail,
  isAuthorized,
  authError,
}: OwnerLoginModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleGoogleClick() {
    setLoading(true);
    try {
      await onGoogleLogin();
    } finally {
      setLoading(false);
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
              <p className="text-[11px] text-slate-400">Firebase Google Owner Authentication</p>
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
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              এই লাইভ পোর্টফোলিও ওয়েবসাইটটি সবার জন্য উন্মুক্ত।{' '}
              <strong className="text-white">Shoyeb CV Studio</strong>-তে এডিট করতে এবং রিয়েল-টাইমে
              ক্লাউডে পাবলিশ করতে অনুমোদিত ওনার Google অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
            </div>
          </div>

          {signedInEmail && !isAuthorized && (
            <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3.5 text-xs text-rose-200 space-y-2">
              <div className="flex items-start gap-2 font-semibold text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>অননুমোদিত অ্যাকাউন্ট ({signedInEmail})</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                শুধুমাত্র ভেরিফায়েড ওনার অ্যাকাউন্ট ({OWNER_ADMIN_EMAIL}) স্টুডিও আনলক করতে পারবে।
              </p>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/45 border border-rose-400/40 text-white text-[11px] font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Switch Account / Sign Out
              </button>
            </div>
          )}

          {authError && (
            <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-3 text-[11.5px] text-amber-200 leading-relaxed">
              {authError}
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleClick}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Google-এ যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
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
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>সিকিউর Firebase OAuth 2.0</span>
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
