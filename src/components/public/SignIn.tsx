import React, { useState, useEffect } from 'react';
import { LogIn, ShieldCheck, ArrowRight, AlertCircle, Phone, Lock, Sparkles } from 'lucide-react';
import { auth } from '../../services/auth';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';

interface SignInProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
  onEnterJudgeDemo: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onNavigate, lang, onEnterJudgeDemo }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const remembered = auth.getRememberedLoginId();
    if (remembered) {
      setLoginId(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginId.trim()) {
      setError('Please enter your registered mobile number or email address.');
      return;
    }

    setIsLoading(true);
    const res = await auth.signIn({
      loginId: loginId.trim(),
      password,
      rememberMe,
    });
    setIsLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'worker') {
        onNavigate('worker');
      } else {
        onNavigate('contractor');
      }
    } else {
      setError(res.error || 'Sign in failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-14 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-xs">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to Shram Setu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your verified work records and wage ledger
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number or Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="+91 98260 12345 or email"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-emerald-800 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-700"
              />
              <span className="text-xs text-slate-600">Remember my login ID</span>
            </label>
            <span className="text-[10px] text-slate-400">Password is never saved</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('create-account')}
              className="text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>

        </form>

        {/* Isolated Judge Demo Mode Divider & CTA */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Senior Bal Vigyan Judge Evaluation</span>
            </div>
            <p className="text-[11px] text-amber-800/90 mb-3">
              Testing the platform? You can tour the pre-populated Indore demonstration dataset without creating an account.
            </p>
            <button
              onClick={onEnterJudgeDemo}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Launch Isolated Judge Demo Tour
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
