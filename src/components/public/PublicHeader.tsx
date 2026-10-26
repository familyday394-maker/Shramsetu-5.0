import React from 'react';
import { ShieldCheck, Globe, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { Language, t } from '../../services/i18n';
import { AppRoute } from '../../services/router';

interface PublicHeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  lang: Language;
  onToggleLang: () => void;
  onEnterJudgeDemo: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentRoute,
  onNavigate,
  lang,
  onToggleLang,
  onEnterJudgeDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full max-w-full no-print">
      {/* Top Bar following Top Bar Contract: 3 distinct zones separated by gap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
        
        {/* Zone 1: Wordmark & Brand Title */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="text-left group cursor-pointer focus:outline-none min-w-0"
            title="Shram Setu 2.0 Home"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap">
                Shram Setu
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden md:block whitespace-nowrap truncate max-w-[220px]">
              Verified Digital Work & Wage Records
            </p>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links on xl+ screens */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 text-xs 2xl:text-sm font-medium text-slate-600 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentRoute === 'home'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentRoute === 'how-it-works'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-slate-900'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentRoute === 'about'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-slate-900'
            }`}
          >
            About the Project
          </button>
          <button
            onClick={() => onNavigate('privacy')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentRoute === 'privacy'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-slate-900'
            }`}
          >
            Privacy & Data Use
          </button>
          <button
            onClick={() => onNavigate('help')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentRoute === 'help'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-slate-900'
            }`}
          >
            Help & Contact
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Language, Sign In, Create Account, Judge Demo) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
            title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Judge Demo Entry */}
          <button
            onClick={onEnterJudgeDemo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Explore Bal Vigyan Judge Demo & Audit Suite"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Judge Demo</span>
          </button>

          {/* Sign In */}
          <button
            onClick={() => onNavigate('sign-in')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentRoute === 'sign-in'
                ? 'bg-slate-200 text-slate-900'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          {/* Create Account CTA */}
          <button
            onClick={() => onNavigate('create-account')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>

        </div>

      </div>

      {/* Sub-Navigation for screens < xl (Mobile & Tablet) */}
      <div className="xl:hidden w-full max-w-full overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs font-medium space-x-2 scrollbar-none flex items-center">
        <button
          onClick={() => onNavigate('home')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentRoute === 'home' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('how-it-works')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentRoute === 'how-it-works' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          How It Works
        </button>
        <button
          onClick={() => onNavigate('about')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentRoute === 'about' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          About the Project
        </button>
        <button
          onClick={() => onNavigate('privacy')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentRoute === 'privacy' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Privacy & Data Use
        </button>
        <button
          onClick={() => onNavigate('help')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentRoute === 'help' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Help & Contact
        </button>
        <button
          onClick={onEnterJudgeDemo}
          className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors text-amber-800 bg-amber-100 hover:bg-amber-200 font-semibold"
        >
          Judge Demo
        </button>
      </div>
    </header>
  );
};
