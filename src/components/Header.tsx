import React from 'react';
import { 
  ShieldCheck, 
  Volume2, 
  Globe, 
  Award, 
  Phone, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Sparkles,
  Users,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Worker, UserProfile } from '../types';
import { Language, t } from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';
import { AppRoute } from '../services/router';
import { AuthState } from '../services/auth';

interface HeaderProps {
  currentRoute?: AppRoute;
  onNavigate?: (route: AppRoute) => void;
  authState?: AuthState;
  onSignOut?: () => void;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  lang: Language;
  onToggleLang: () => void;
  workers?: Worker[];
  selectedWorkerId?: string;
  onSelectWorker?: (id: string) => void;
  onOpenBalVigyanModal?: () => void;
  onOpenJudgeTourModal?: () => void;
  onEnterJudgeDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute = 'home',
  onNavigate = () => {},
  authState,
  onSignOut = () => {},
  currentTab = 'pass',
  onSelectTab = () => {},
  lang,
  onToggleLang,
  workers = [],
  selectedWorkerId = '',
  onSelectWorker = () => {},
  onOpenBalVigyanModal = () => {},
  onOpenJudgeTourModal,
  onEnterJudgeDemo = () => {},
}) => {
  const isAuthed = authState?.isAuthenticated ?? false;
  const user = authState?.user;
  const isJudgeDemo = authState?.isJudgeDemo ?? false;

  const handleSpeakBrand = () => {
    if (lang === 'hi') {
      speech.speak(
        'श्रम सेतु 2.0। असंगठित एवं दैनिक वेतन भोगी श्रमिकों के लिए डिजिटल वर्क पास एवं मजदूरी सुरक्षा प्रणाली। वरिष्ठ बाल विज्ञान नवाचार, इंदौर मध्य प्रदेश। हेल्पलाइन 7909348017।',
        'hi-IN'
      );
    } else {
      speech.speak(
        'Shram Setu 2.0. Digital work pass, attendance verification, and wage protection platform for informal workers. Senior Bal Vigyan innovation, Indore MP. Helpline 7909348017.',
        'en-IN'
      );
    }
  };

  // --------------------------------------------------------------------------
  // LOGGED-OUT PUBLIC VISITOR HEADER
  // --------------------------------------------------------------------------
  if (!isAuthed) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full max-w-full no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
          
          {/* Zone 1: Wordmark & brand */}
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="text-left group cursor-pointer focus:outline-none min-w-0"
              title="Shram Setu 2.0"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap">
                  Shram Setu
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block whitespace-nowrap truncate max-w-[200px]">
                Verified Digital Work & Wage Records
              </p>
            </button>
          </div>

          {/* Zone 2: Public Navigation Links on xl+ screens */}
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

          {/* Zone 3: Primary Actions (Language, Judge Demo, Sign In, Create Account) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Audio Readout */}
            <button
              onClick={handleSpeakBrand}
              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
              title="Listen to audio overview"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
              title={lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Isolated Judge Demo Button */}
            <button
              onClick={onEnterJudgeDemo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Open Isolated Judge Demo & Cryptographic Audit Suite"
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
            className="sm:hidden shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors text-amber-800 bg-amber-100 font-semibold"
          >
            Judge Demo
          </button>
        </div>
      </header>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED HEADER (WORKER OR CONTRACTOR)
  // --------------------------------------------------------------------------
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full max-w-full no-print">
      
      {/* Isolated Demo Notice Bar if in Judge Demo Mode */}
      {isJudgeDemo && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-1.5 max-w-4xl mx-auto w-full">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Judge Demo Mode (Offline Senior Bal Vigyan Evaluation Suite) — Demonstrating with pre-loaded Indore records.</span>
          </div>
          <button
            onClick={onSignOut}
            className="text-[11px] font-bold underline hover:text-black cursor-pointer whitespace-nowrap shrink-0"
          >
            Exit Demo
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
        
        {/* Zone 1: Wordmark & Role Identifier */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-xs shrink-0 ${
            user?.role === 'worker' ? 'bg-emerald-800' : 'bg-slate-900'
          }`}>
            {user?.role === 'worker' ? <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Shram Setu
              </span>
              <span className={`text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                user?.role === 'worker' ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' : 'text-slate-900 bg-slate-100 border border-slate-200'
              }`}>
                {user?.role === 'worker' ? 'Worker Portal' : 'Contractor Portal'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden md:block whitespace-nowrap truncate max-w-[200px]">
              {user?.organizationName || user?.trade || 'Verified Employment Records'}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links on xl+ screens (Legacy Tab selector support for Judge Demo) */}
        {isJudgeDemo && (
          <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-slate-600 shrink-0">
            <button
              onClick={() => onSelectTab('pass')}
              className={`py-1 cursor-pointer transition-colors ${currentTab === 'pass' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800' : 'hover:text-slate-900'}`}
            >
              Smart Pass
            </button>
            <button
              onClick={() => onSelectTab('attendance')}
              className={`py-1 cursor-pointer transition-colors ${currentTab === 'attendance' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800' : 'hover:text-slate-900'}`}
            >
              Attendance
            </button>
            <button
              onClick={() => onSelectTab('ledger')}
              className={`py-1 cursor-pointer transition-colors ${currentTab === 'ledger' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800' : 'hover:text-slate-900'}`}
            >
              Wage Khata
            </button>
            <button
              onClick={() => onSelectTab('contractor')}
              className={`py-1 cursor-pointer transition-colors ${currentTab === 'contractor' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800' : 'hover:text-slate-900'}`}
            >
              Contractor Roll
            </button>
            <button
              onClick={() => onSelectTab('grievance')}
              className={`py-1 cursor-pointer transition-colors ${currentTab === 'grievance' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800' : 'hover:text-slate-900'}`}
            >
              Disputes
            </button>
          </nav>
        )}

        {/* Zone 3: Active User Name, Language, Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Active Registered User Badge */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
              {user?.fullName}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {user?.phone}
            </span>
          </div>

          {/* Audio narration button */}
          <button
            onClick={handleSpeakBrand}
            className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
            title="Listen to audio overview"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
            title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Bal Vigyan Modal trigger in Demo */}
          {isJudgeDemo && onOpenJudgeTourModal && (
            <button
              onClick={onOpenJudgeTourModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5 text-white" />
              <span>Audit Bench</span>
            </button>
          )}

          {/* Sign Out Button (Preserves user records without database reset) */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

        </div>

      </div>

      {/* Subnav for Judge Demo screen < xl */}
      {isJudgeDemo && (
        <div className="xl:hidden w-full max-w-full overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs font-medium space-x-2 scrollbar-none flex items-center">
          <button
            onClick={() => onSelectTab('pass')}
            className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${currentTab === 'pass' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'}`}
          >
            Smart Pass
          </button>
          <button
            onClick={() => onSelectTab('attendance')}
            className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${currentTab === 'attendance' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'}`}
          >
            Attendance
          </button>
          <button
            onClick={() => onSelectTab('ledger')}
            className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${currentTab === 'ledger' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'}`}
          >
            Wage Khata
          </button>
          <button
            onClick={() => onSelectTab('contractor')}
            className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${currentTab === 'contractor' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'}`}
          >
            Contractor Roll
          </button>
          <button
            onClick={() => onSelectTab('grievance')}
            className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${currentTab === 'grievance' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'}`}
          >
            Disputes
          </button>
        </div>
      )}
    </header>
  );
};
