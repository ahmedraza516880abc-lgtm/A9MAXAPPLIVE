import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword,
  signInAdminDemo 
} from '../services/firebase';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    language, 
    t, 
    showToast,
    isLive
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithGoogle();
      showToast(language === 'hi' ? 'Google द्वारा सफलतापूर्वक लॉग इन किया गया!' : 'Successfully signed in with Google!');
      setAuthModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    try {
      setLoading(true);
      await signInAdminDemo();
      showToast(language === 'hi' ? 'एडमिन मोड सक्रिय: ahmeda9a99a9@gmail.com' : 'Admin Demo mode active: ahmeda9a99a9@gmail.com');
      setAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      if (authModalTab === 'signin') {
        await signInWithEmail(email, password);
        showToast(language === 'hi' ? 'सफलतापूर्वक लॉग इन हुआ!' : 'Signed in successfully!');
      } else {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name.trim());
        showToast(language === 'hi' ? 'खाता सफलतापूर्वक बनाया गया!' : 'Account created successfully!');
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }
    try {
      setLoading(true);
      await resetPassword(email);
      setResetSent(true);
      showToast(t.resetEmailSent);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" fillOpacity="0.8" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {authModalTab === 'signin' ? t.loginPrompt : t.signUp}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-5">
          <button
            onClick={() => {
              setAuthModalTab('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'signin'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.signIn}
          </button>
          <button
            onClick={() => {
              setAuthModalTab('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'signup'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.signUp}
          </button>
        </div>

        {/* Google sign in button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60 shadow-2xs mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t.continueWithGoogle}</span>
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-gray-200 dark:border-gray-800"></div>
          <span className="shrink mx-3 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
            {t.orWithEmail}
          </span>
          <div className="grow border-t border-gray-200 dark:border-gray-800"></div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t.displayName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t.password}
              </label>
              {authModalTab === 'signin' && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {t.forgotPassword}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : authModalTab === 'signin' ? t.signIn : t.signUp}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Admin Quick Switch (Convenience for testing specified admin email ahmeda9a99a9@gmail.com) */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <button
            onClick={handleAdminDemoLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Quick Login (ahmeda9a99a9@gmail.com)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
