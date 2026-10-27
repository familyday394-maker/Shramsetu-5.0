import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Volume2,
  Globe,
  Award,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  Menu,
  X,
  Phone,
  ArrowRight,
  LayoutDashboard,
  Calendar,
  Wallet,
  QrCode,
  AlertTriangle,
} from 'lucide-react';
import { Worker, UserProfile } from '../types';
import { Language } from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';
import { AppRoute } from '../services/router';
import { AuthState } from '../services/auth';
import { BrandMark } from './ui/BrandMark';
import { getPublicCopy } from '../services/publicCopy';

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

const PUBLIC_NAV: { route: AppRoute; label: string }[] = [
  { route: 'home', label: 'Home' },
  { route: 'how-it-works', label: 'How It Works' },
  { route: 'about', label: 'About the Project' },
  { route: 'privacy', label: 'Privacy & Data Use' },
  { route: 'help', label: 'Help & Contact' },
];

const DEMO_TABS = [
  { id: 'pass', label: 'Smart Pass', icon: QrCode },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'ledger', label: 'Wage Khata', icon: Wallet },
  { id: 'contractor', label: 'Contractor Roll', icon: LayoutDashboard },
  { id: 'grievance', label: 'Disputes', icon: AlertTriangle },
];


/** Language pill — module scope so it never remounts between renders. */
const LanguageSwitch: React.FC<{ lang: Language; onToggle: () => void }> = ({ lang, onToggle }) => (
  <button
    onClick={onToggle}
    className="group inline-flex items-center gap-1.5 rounded-full border border-ink-200/80 bg-white/80 px-2 py-1 text-[11px] font-bold text-ink-700 shadow-soft transition-colors hover:border-forest-300 hover:text-forest-800 cursor-pointer"
    title={lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
    aria-label={lang === 'en' ? 'Switch language to Hindi' : 'Switch language to English'}
  >
    <Globe className="h-3.5 w-3.5 text-ink-400 transition-colors group-hover:text-forest-600" />
    <span className="flex items-center gap-1">
      <span
        className={`rounded-full px-1.5 py-0.5 transition-colors ${
          lang === 'en' ? 'bg-forest-700 text-white' : 'text-ink-400'
        }`}
      >
        EN
      </span>
      <span
        className={`rounded-full px-1.5 py-0.5 transition-colors ${
          lang === 'hi' ? 'bg-forest-700 text-white' : 'text-ink-400'
        }`}
      >
        हिं
      </span>
    </span>
  </button>
);

/** Speaker button for the audio brand readout. */
const AudioButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="grid h-9 w-9 place-items-center rounded-full border border-transparent text-ink-500 transition-all hover:border-ink-200 hover:bg-white hover:text-forest-800 cursor-pointer"
    title="Listen to an audio overview"
    aria-label="Listen to an audio overview of Shram Setu"
  >
    <Volume2 className="h-4 w-4" />
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  currentRoute = 'home',
  onNavigate = () => {},
  authState,
  onSignOut = () => {},
  currentTab = 'pass',
  onSelectTab = () => {},
  lang,
  onToggleLang,
  onOpenJudgeTourModal,
  onEnterJudgeDemo = () => {},
}) => {
  const isAuthed = authState?.isAuthenticated ?? false;
  const user = authState?.user;
  const isJudgeDemo = authState?.isJudgeDemo ?? false;

  const copy = getPublicCopy(lang);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Soft elevation once the page leaves the very top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes or Escape is pressed.
  useEffect(() => setMobileOpen(false), [currentRoute]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  // -------------------------------------------------------------------------
  // AUTHENTICATED HEADER (Worker, Contractor & Judge Demo)
  // -------------------------------------------------------------------------
  if (isAuthed) {
    return (
      <header className="sticky top-0 z-50 w-full max-w-full no-print">
        {isJudgeDemo && (
          <div className="relative overflow-hidden bg-gradient-to-r from-brass-500 via-brass-400 to-brass-300 text-ink-950">
            <div className="container-page flex items-center justify-between gap-3 py-1.5">
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink-950 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink-950" />
                </span>
                <Sparkles className="h-3.5 w-3.5" />
                <span className="truncate">
                  Judge Demo Mode — pre-loaded Indore evaluation dataset
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="shrink-0 rounded-full bg-ink-950/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-ink-950/20 cursor-pointer"
              >
                Exit demo
              </button>
            </div>
          </div>
        )}

        <div
          className={`w-full border-b transition-all duration-300 ${
            scrolled
              ? 'border-sand-200 bg-sand-50/90 shadow-[0_18px_40px_-32px_rgba(10,34,25,0.55)] backdrop-blur-xl'
              : 'border-transparent bg-sand-50/70 backdrop-blur-md'
          }`}
        >
          <div className="container-page flex h-[4.25rem] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <BrandMark size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[1.0625rem] font-semibold leading-none text-ink-950">
                    Shram Setu
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isJudgeDemo
                        ? 'bg-brass-100 text-brass-800 ring-1 ring-inset ring-brass-300'
                        : user?.role === 'worker'
                          ? 'bg-forest-50 text-forest-800 ring-1 ring-inset ring-forest-200'
                          : 'bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200'
                    }`}
                  >
                    {isJudgeDemo ? 'Demo' : user?.role === 'worker' ? 'Worker' : 'Contractor'}
                  </span>
                </div>
                <p className="mt-1 hidden truncate text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400 sm:block">
                  {user?.organizationName || user?.trade || 'Verified employment records'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2.5 rounded-full border border-sand-200 bg-white/70 py-1 pl-1 pr-3.5 md:flex">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-800 text-[11px] font-bold text-white">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
                <div className="leading-tight">
                  <span className="block max-w-[9.5rem] truncate text-[11px] font-bold text-ink-900">
                    {user?.fullName}
                  </span>
                  <span className="block font-mono text-[9.5px] text-ink-400">{user?.phone}</span>
                </div>
              </div>

              <AudioButton onClick={handleSpeakBrand} />
              <LanguageSwitch lang={lang} onToggle={onToggleLang} />

              {isJudgeDemo && onOpenJudgeTourModal && (
                <button
                  onClick={onOpenJudgeTourModal}
                  className="hidden items-center gap-1.5 rounded-full border border-brass-300 bg-brass-50 px-3 py-1.5 text-[11px] font-bold text-brass-800 transition-colors hover:bg-brass-100 lg:flex cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5" />
                  Audit bench
                </button>
              )}

              <button
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-ink-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>

          {/* Judge demo tab rail */}
          {isJudgeDemo && (
            <div className="border-t border-sand-200/80 bg-white/60">
              <div className="container-page">
                <div
                  className="hide-scrollbar -mb-px flex items-center gap-1 overflow-x-auto py-1.5"
                  role="tablist"
                  aria-label="Demo sections"
                >
                  {DEMO_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = currentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onSelectTab(tab.id)}
                        className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                          active ? 'text-white' : 'text-ink-500 hover:bg-white hover:text-ink-900'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="demo-tab-pill"
                            className="absolute inset-0 rounded-full bg-forest-800 shadow-[0_8px_18px_-10px_rgba(22,58,43,0.8)]"
                            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                          />
                        )}
                        <span className="relative flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------------------
  // PUBLIC (LOGGED-OUT) HEADER
  // -------------------------------------------------------------------------
  return (
    <header className="sticky top-0 z-50 w-full max-w-full no-print">
      <div
        className={`w-full border-b transition-all duration-300 ${
          scrolled
            ? 'border-sand-200 bg-sand-50/88 shadow-[0_18px_40px_-34px_rgba(10,34,25,0.5)] backdrop-blur-xl'
            : 'border-transparent bg-sand-50/60 backdrop-blur-md'
        }`}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
          {/* Brand */}
          <a
            href="#/home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-offset-4"
          >
            <BrandMark size="md" className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:rotate-[-3deg]" />
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-display text-[1.125rem] font-semibold leading-none tracking-tight text-ink-950 transition-colors group-hover:text-forest-800">
                  Shram Setu
                </span>
                <span className="rounded-full border border-brass-300/70 bg-brass-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-brass-800">
                  2.0
                </span>
              </span>
              <span className="mt-1 hidden text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-400 sm:block">
                {copy.brandTagline}
              </span>
            </span>
          </a>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
            {PUBLIC_NAV.map((item) => {
              const active = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-colors cursor-pointer ${
                    active ? 'text-forest-900' : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {copy.nav[item.route as keyof typeof copy.nav] ?? item.label}
                  {active && (
                    <motion.span
                      layoutId="public-nav-underline"
                      className="absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-brass-400 via-brass-400 to-forest-500"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden lg:block">
              <AudioButton onClick={handleSpeakBrand} />
            </div>
            <LanguageSwitch lang={lang} onToggle={onToggleLang} />

            <button
              onClick={onEnterJudgeDemo}
              className="hidden items-center gap-1.5 rounded-full border border-brass-300/70 bg-brass-50/80 px-3 py-1.5 text-[11px] font-bold text-brass-800 transition-all hover:border-brass-400 hover:bg-brass-100 lg:flex cursor-pointer"
              title="Open the isolated Judge Demo & cryptographic audit suite"
            >
              <Sparkles className="h-3.5 w-3.5 text-brass-600" />
              <span>{copy.judgeDemo}</span>
            </button>

            <button
              onClick={() => onNavigate('sign-in')}
              className={`hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors sm:flex cursor-pointer ${
                currentRoute === 'sign-in'
                  ? 'bg-ink-100 text-ink-900'
                  : 'text-ink-600 hover:bg-white hover:text-ink-950'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              {copy.signIn}
            </button>

            <button
              onClick={() => onNavigate('create-account')}
              className="btn btn-primary btn-sm hidden sm:inline-flex"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {copy.createAccount}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white/80 text-ink-700 transition-colors hover:border-forest-300 hover:text-forest-800 xl:hidden cursor-pointer"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-sand-200 bg-sand-50/95 backdrop-blur-xl xl:hidden"
            >
              <div className="container-page max-h-[calc(100vh-4.5rem)] overflow-y-auto py-5">
                <nav className="flex flex-col" aria-label="Mobile">
                  {PUBLIC_NAV.map((item, index) => {
                    const active = currentRoute === item.route;
                    return (
                      <motion.button
                        key={item.route}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + index * 0.045, duration: 0.35 }}
                        onClick={() => onNavigate(item.route)}
                        className={`flex items-center justify-between border-b border-sand-200/80 py-3 text-left text-[15px] font-semibold transition-colors cursor-pointer ${
                          active ? 'text-forest-800' : 'text-ink-700 hover:text-forest-800'
                        }`}
                      >
                        {copy.nav[item.route as keyof typeof copy.nav] ?? item.label}
                        <ArrowRight
                          className={`h-4 w-4 transition-transform ${
                            active ? 'text-brass-500' : 'text-ink-300'
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </nav>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button onClick={() => onNavigate('sign-in')} className="btn btn-outline w-full">
                    <LogIn className="h-4 w-4" />
                    {copy.signIn}
                  </button>
                  <button
                    onClick={() => onNavigate('create-account')}
                    className="btn btn-primary w-full"
                  >
                    <UserPlus className="h-4 w-4" />
                    {copy.createAccount}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-brass-200 bg-brass-50/70 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brass-200/70 text-brass-800">
                      <Award className="h-4 w-4" />
                    </span>
                    <div className="leading-tight">
                      <span className="block text-[11px] font-bold text-brass-900">
                        {copy.mobileEvaluation}
                      </span>
                      <span className="block text-[10px] text-brass-700">
                        {copy.mobileEvaluationHint}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onEnterJudgeDemo}
                    className="shrink-0 rounded-full bg-brass-500 px-3 py-1.5 text-[10px] font-bold text-ink-950 transition-colors hover:bg-brass-400 cursor-pointer"
                  >
                    {copy.launch}
                  </button>
                </div>

                <a
                  href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-forest-200 bg-white py-2.5 text-[11.5px] font-bold text-forest-800"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {copy.helpline} {APP_CONFIG.CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
