import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { Check, Lock, Mail, Phone, RefreshCw, ShieldAlert, User as UserIcon, X } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import type { CityItem, LanguageCode, UserGender } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

export const PENDING_PROFILE_STORAGE_PREFIX = 'shia_updates_pending_profile_';

export interface PendingManualProfile {
  displayName: string;
  mobileNumber: string;
  city: string;
  gender: UserGender;
  preferredLanguage: LanguageCode;
}

function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Email/Password sign-in is not yet enabled in Firebase Authentication. Please enable Email/Password under Firebase Console → Authentication → Sign-in method, or use Continue with Google.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please switch to the Login tab.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your credentials or use Forgot password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing sign-in.';
    default:
      return err instanceof Error ? err.message : 'Authentication could not be completed.';
  }
}

interface AuthModalProps {
  lang: LanguageCode;
  cities: CityItem[];
  defaultCity: string;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthenticated: () => void;
}

export function AuthModal({
  lang,
  cities,
  defaultCity,
  initialMode = 'login',
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const t = TRANSLATIONS[lang];
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState(defaultCity || 'Mumbai');
  const [gender, setGender] = useState<UserGender>('prefer_not_to_say');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuthenticated();
      onClose();
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!cred.user.emailVerified) {
        setVerificationPendingEmail(cred.user.email || email.trim());
        return;
      }
      onAuthenticated();
      onClose();
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    if (password.length < 6) {
      setErrorMsg(t.auth.passwordHint);
      return;
    }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const cleanName = displayName.trim() || 'Community Member';
      await updateProfile(cred.user, { displayName: cleanName });

      const pending: PendingManualProfile = {
        displayName: cleanName,
        mobileNumber: mobileNumber.trim(),
        city,
        gender,
        preferredLanguage: lang,
      };
      try {
        localStorage.setItem(
          `${PENDING_PROFILE_STORAGE_PREFIX}${cred.user.uid}`,
          JSON.stringify(pending)
        );
      } catch {
        // Ignore storage quota errors
      }

      try {
        await sendEmailVerification(cred.user);
      } catch {
        // Non-fatal if rate-limited; user can click resend
      }

      setVerificationPendingEmail(cred.user.email || email.trim());
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Please enter your email address above first.');
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg(t.auth.resetSent);
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setInfoMsg(t.auth.verifyResent);
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        await auth.currentUser.getIdToken(true);
        onAuthenticated();
        onClose();
      } else {
        setErrorMsg(t.auth.verifyStillPending);
      }
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[92vh] overflow-y-auto sm:rounded-3xl rounded-t-3xl p-5 sm:p-6 space-y-5 shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#B4832E]">{t.appName}</div>
            <h2 className="text-xl font-semibold text-[#0F172A] mt-0.5">
              {verificationPendingEmail ? t.auth.verifyTitle : t.auth.modalTitle}
            </h2>
            {!verificationPendingEmail && (
              <p className="text-xs sm:text-sm text-stone-600 mt-1">{t.auth.modalSubtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-xs text-[#064E3B] flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {verificationPendingEmail ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200 space-y-2">
              <div className="text-xs font-semibold text-[#064E3B]">{verificationPendingEmail}</div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {t.auth.verifyMessage}
              </p>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleRefreshVerification}
              className="w-full min-h-[48px] rounded-xl bg-[#064E3B] text-white text-sm font-semibold hover:bg-[#047857] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.auth.refreshVerify}</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleResendVerification}
              className="w-full min-h-[44px] rounded-xl border border-stone-200 text-sm font-medium text-[#0F172A] hover:bg-stone-50 cursor-pointer disabled:opacity-60"
            >
              {t.auth.resendVerify}
            </button>
          </div>
        ) : (
          <>
            {/* Option 1: Continue with Google */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-sm font-semibold text-[#0F172A] flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-60"
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
              <span>{t.actions.signInGoogle}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-stone-500 whitespace-nowrap">
                {t.auth.orDivider}
              </span>
              <div className="border-t border-stone-200 w-full" />
            </div>

            {/* Option 2: Manual Email & Contact Details (Login / Register Tabs) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-white text-[#064E3B] shadow-sm' : 'text-stone-600'
                }`}
              >
                {t.auth.loginTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-white text-[#064E3B] shadow-sm' : 'text-stone-600'
                }`}
              >
                {t.auth.registerTab}
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleEmailLogin} className="space-y-3.5 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    {t.auth.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-stone-600">
                      {t.auth.passwordLabel}
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-medium text-[#064E3B] hover:underline cursor-pointer"
                    >
                      {t.auth.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[48px] rounded-xl bg-[#064E3B] text-white text-sm font-semibold hover:bg-[#047857] cursor-pointer disabled:opacity-60"
                >
                  {submitting ? '...' : t.auth.loginButton}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailRegister} className="space-y-3 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    {t.profile.fullName} *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ali Rizvi"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    {t.auth.emailLabel} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    {t.auth.contactDetailsLabel} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-600">{t.profile.city}</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6] text-xs sm:text-sm focus:outline-none focus:border-[#064E3B]"
                    >
                      {cities
                        .filter((c) => c.isActive)
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-600">{t.profile.gender}</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as UserGender)}
                      className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-[#FAF9F6] text-xs sm:text-sm focus:outline-none focus:border-[#064E3B]"
                    >
                      <option value="male">{t.profile.male}</option>
                      <option value="female">{t.profile.female}</option>
                      <option value="prefer_not_to_say">{t.profile.preferNotToSay}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    {t.auth.passwordLabel} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.auth.passwordHint}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[48px] rounded-xl bg-[#064E3B] text-white text-sm font-semibold hover:bg-[#047857] cursor-pointer disabled:opacity-60"
                >
                  {submitting ? '...' : t.auth.registerButton}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
