/**
 * Shram Setu 2.0 - Role-Based Website, Account Lifecycle & Contact Verification
 * Senior Bal Vigyan Innovation · Indore, Madhya Pradesh
 *
 * Strict Architecture Rules:
 * 1. Logged out visitors see professional public pages with proper URL hash routes.
 * 2. Authenticated Workers see a dedicated 7-tab portal; new accounts start clean.
 * 3. Authenticated Contractors see a 9-tab portal with QR camera scanner & shift approvals.
 * 4. Signing out preserves database records and clears the session only.
 * 5. Isolated Judge Demo Mode is strictly separated from genuine user accounts.
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollProgress } from './components/ui/ScrollProgress';

import { Home } from './components/public/Home';
import { HowItWorks } from './components/public/HowItWorks';
import { CreateAccount } from './components/public/CreateAccount';
import { SignIn } from './components/public/SignIn';
import { PasswordRecovery } from './components/public/PasswordRecovery';
import { Privacy } from './components/public/Privacy';
import { HelpContact } from './components/public/HelpContact';
import { About } from './components/public/About';
import { VerifyPass } from './components/public/VerifyPass';
import { RouteFallback } from './components/ui/RouteFallback';

// Authenticated workspaces and the exhibit suite are code-split: a public
// visitor never downloads the portal bundles, and a worker only pays for the
// demo suite if they open it.
const WorkerPortal = lazy(() =>
  import('./components/worker/WorkerPortal').then((m) => ({ default: m.WorkerPortal }))
);
const ContractorDashboard = lazy(() =>
  import('./components/contractor/ContractorDashboard').then((m) => ({
    default: m.ContractorDashboard,
  }))
);
const NewWorkerModal = lazy(() =>
  import('./components/NewWorkerModal').then((m) => ({ default: m.NewWorkerModal }))
);
const BalVigyanAboutModal = lazy(() =>
  import('./components/BalVigyanAboutModal').then((m) => ({ default: m.BalVigyanAboutModal }))
);
const JudgeDemoTourModal = lazy(() =>
  import('./components/JudgeDemoTourModal').then((m) => ({ default: m.JudgeDemoTourModal }))
);

// Judge-demo composition screens (loaded together with the demo workspace)
const HeroSection = lazy(() =>
  import('./components/HeroSection').then((m) => ({ default: m.HeroSection }))
);
const WorkerCard = lazy(() =>
  import('./components/WorkerCard').then((m) => ({ default: m.WorkerCard }))
);
const AttendanceMuster = lazy(() =>
  import('./components/AttendanceMuster').then((m) => ({ default: m.AttendanceMuster }))
);
const WageProtectionLedger = lazy(() =>
  import('./components/WageProtectionLedger').then((m) => ({ default: m.WageProtectionLedger }))
);
const ContractorPortal = lazy(() =>
  import('./components/ContractorPortal').then((m) => ({ default: m.ContractorPortal }))
);
const GrievanceRedressal = lazy(() =>
  import('./components/GrievanceRedressal').then((m) => ({ default: m.GrievanceRedressal }))
);
const WelfareSchemes = lazy(() =>
  import('./components/WelfareSchemes').then((m) => ({ default: m.WelfareSchemes }))
);

import { db } from './services/db';
import { auth, AuthState } from './services/auth';
import { router, AppRoute, RouteState } from './services/router';
import { Worker, ConstructionSite, AttendanceRecord, WageLedgerEntry, DisputeGrievance } from './types';
import { Language, getSavedLanguage, saveLanguage } from './services/i18n';

export default function App() {
  const [lang, setLang] = useState<Language>(() => getSavedLanguage());
  const [routeState, setRouteState] = useState<RouteState>(() => router.getCurrentRoute());
  const [authState, setAuthState] = useState<AuthState>(() => auth.getAuthState());
  const [currentTab, setCurrentTab] = useState<string>('pass');

  // Demo / shared dataset state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<WageLedgerEntry[]>([]);
  const [grievances, setGrievances] = useState<DisputeGrievance[]>([]);

  // Modals
  const [showNewWorkerModal, setShowNewWorkerModal] = useState(false);
  const [showBalVigyanModal, setShowBalVigyanModal] = useState(false);
  const [showJudgeTourModal, setShowJudgeTourModal] = useState(false);

  // Subscribe to router and auth changes
  useEffect(() => {
    const unsubRouter = router.subscribe((newRoute) => {
      setRouteState(newRoute);
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
    const unsubAuth = auth.subscribe((newAuth) => {
      setAuthState(newAuth);
    });

    return () => {
      unsubRouter();
      unsubAuth();
    };
  }, []);

  // Keep the URL in sync with the authenticated role
  useEffect(() => {
    if (authState.isAuthenticated) {
      if (authState.isJudgeDemo) {
        if (routeState.route !== 'judge-demo') router.navigate('judge-demo');
      } else if (authState.user?.role === 'worker') {
        if (routeState.route !== 'worker') router.navigate('worker');
      } else if (authState.user?.role === 'contractor') {
        if (routeState.route !== 'contractor') router.navigate('contractor');
      }
    } else if (routeState.route === 'worker' || routeState.route === 'contractor') {
      router.navigate('sign-in');
    }
    // routeState.route intentionally included so deep links are corrected on load
  }, [authState.isAuthenticated, authState.user?.role, authState.isJudgeDemo, routeState.route]);

  // Keep the document title and language attribute in sync with the app state.
  useEffect(() => {
    const titles: Record<AppRoute, string> = {
      home: 'Shram Setu 2.0 — Verified Digital Work & Wage Records',
      'how-it-works': 'How it works · Shram Setu 2.0',
      'create-account': 'Create an account · Shram Setu 2.0',
      'sign-in': 'Sign in · Shram Setu 2.0',
      'forgot-password': 'Password recovery · Shram Setu 2.0',
      privacy: 'Privacy & data use · Shram Setu 2.0',
      help: 'Help & contact · Shram Setu 2.0',
      about: 'About the project · Shram Setu 2.0',
      verify: 'Verify a pass · Shram Setu 2.0',
      worker: 'Worker portal · Shram Setu 2.0',
      contractor: 'Contractor portal · Shram Setu 2.0',
      'judge-demo': 'Judge demo · Shram Setu 2.0',
    };

    document.title = titles[routeState.route] || titles.home;
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  }, [routeState.route, lang]);

  // Load the demo database
  const refreshData = () => {
    const loadedWorkers = db.getWorkers();
    const loadedSites = db.getSites();
    setWorkers(loadedWorkers);
    setSites(loadedSites);

    const activeId =
      selectedWorkerId && loadedWorkers.some((w) => w.id === selectedWorkerId)
        ? selectedWorkerId
        : loadedWorkers[0]?.id || '';

    setSelectedWorkerId(activeId);
    setAttendanceList(db.getAttendance(activeId));
    setLedgerEntries(db.getLedger(activeId));
    setGrievances(db.getGrievances());
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedWorkerId) {
      setAttendanceList(db.getAttendance(selectedWorkerId));
      setLedgerEntries(db.getLedger(selectedWorkerId));
    }
  }, [selectedWorkerId]);

  const activeWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const activeSite = sites.find((s) => s.id === activeWorker?.activeSiteId) || sites[0];
  const workerStats = selectedWorkerId
    ? db.getWorkerStats(selectedWorkerId)
    : {
        totalDaysWorked: 0,
        totalHalfDays: 0,
        totalOvertimeHours: 0,
        totalEarned: 0,
        totalAdvancesTaken: 0,
        netBalanceDue: 0,
      };

  const handleMarkAttendance = (newRecord: AttendanceRecord) => {
    db.addAttendance(newRecord);
    refreshData();
  };

  const handleBulkAttendance = (newRecords: AttendanceRecord[]) => {
    newRecords.forEach((r) => db.addAttendance(r));
    refreshData();
  };

  const handleAddLedgerEntry = (newEntry: WageLedgerEntry) => {
    db.addLedgerEntry(newEntry);
    refreshData();
  };

  const handleAddGrievance = (newGrievance: DisputeGrievance) => {
    db.addGrievance(newGrievance);
    setGrievances(db.getGrievances());
  };

  const handleAddWorker = (newWorker: Worker) => {
    db.addWorker(newWorker);
    setWorkers(db.getWorkers());
    setSelectedWorkerId(newWorker.id);
    refreshData();
  };

  const handleAcknowledgePayment = (entryId: string) => {
    db.acknowledgePayment(entryId, selectedWorkerId);
    refreshData();
  };

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    saveLanguage(nextLang);
  };

  const handleNavigate = (targetRoute: AppRoute) => {
    router.navigate(targetRoute);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.navigate('home');
  };

  const handleEnterJudgeDemo = (role: 'worker' | 'contractor' = 'worker') => {
    auth.enterJudgeDemo(role, { id: activeWorker?.id, fullName: activeWorker?.name });
    router.navigate('judge-demo');
  };

  const publicRouteKey = authState.isAuthenticated ? 'app' : routeState.route;

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-sand-50 text-ink-900 selection:bg-brass-200">
      <ScrollProgress />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-forest-800 focus:px-4 focus:py-2.5 focus:text-[12px] focus:font-bold focus:text-white focus:shadow-lift"
      >
        Skip to main content
      </a>

      <Header
        currentRoute={routeState.route}
        onNavigate={handleNavigate}
        authState={authState}
        onSignOut={handleSignOut}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        onToggleLang={handleToggleLang}
        workers={workers}
        selectedWorkerId={selectedWorkerId}
        onSelectWorker={setSelectedWorkerId}
        onOpenBalVigyanModal={() => setShowBalVigyanModal(true)}
        onOpenJudgeTourModal={() => setShowJudgeTourModal(true)}
        onEnterJudgeDemo={() => handleEnterJudgeDemo('worker')}
      />

      <main
        id="main-content"
        className="container-page w-full min-w-0 flex-1 py-6 sm:py-8"
        style={
          {
            '--app-header-offset': authState.isJudgeDemo ? '8.75rem' : '4.25rem',
          } as React.CSSProperties
        }
      >
        {/* PUBLIC (LOGGED-OUT) PAGES */}
        {!authState.isAuthenticated && (
          <div key={publicRouteKey} className="animate-fade-up">
            {routeState.route === 'home' && (
              <Home
                onNavigate={handleNavigate}
                lang={lang}
                onEnterJudgeDemo={() => handleEnterJudgeDemo('worker')}
              />
            )}

            {routeState.route === 'how-it-works' && (
              <HowItWorks onNavigate={handleNavigate} lang={lang} />
            )}

            {routeState.route === 'create-account' && (
              <CreateAccount onNavigate={handleNavigate} lang={lang} />
            )}

            {routeState.route === 'sign-in' && (
              <SignIn
                onNavigate={handleNavigate}
                lang={lang}
                onEnterJudgeDemo={() => handleEnterJudgeDemo('worker')}
              />
            )}

            {routeState.route === 'forgot-password' && (
              <PasswordRecovery onNavigate={handleNavigate} lang={lang} />
            )}

            {routeState.route === 'privacy' && <Privacy onNavigate={handleNavigate} lang={lang} />}

            {routeState.route === 'help' && <HelpContact onNavigate={handleNavigate} lang={lang} />}

            {routeState.route === 'about' && <About onNavigate={handleNavigate} lang={lang} />}

            {routeState.route === 'verify' && (
              <VerifyPass
                onNavigate={handleNavigate}
                lang={lang}
                refToken={routeState.params.refToken || routeState.params.ref || ''}
              />
            )}
          </div>
        )}

        <Suspense fallback={<RouteFallback />}>
        {/* AUTHENTICATED WORKER PORTAL */}
        {authState.isAuthenticated && !authState.isJudgeDemo && authState.user?.role === 'worker' && (
          <WorkerPortal
            user={authState.user}
            lang={lang}
            onNavigateHome={() => router.navigate('home')}
          />
        )}

        {/* AUTHENTICATED CONTRACTOR PORTAL */}
        {authState.isAuthenticated && !authState.isJudgeDemo && authState.user?.role === 'contractor' && (
          <ContractorDashboard user={authState.user} lang={lang} />
        )}

        {/* ISOLATED JUDGE DEMO MODE (Senior Bal Vigyan exhibit suite) */}
        {authState.isJudgeDemo && activeWorker && (
          <div className="space-y-6 animate-fade-up">
            {/* Evaluation perspective switcher */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-brass-200 bg-gradient-to-r from-brass-50 via-white to-sand-50 p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brass-400/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-brass-900">
                  <Sparkles className="h-3 w-3" /> Evaluation
                </span>
                <div className="flex items-center gap-1 rounded-full border border-sand-200 bg-white p-1">
                  <button
                    onClick={() => handleEnterJudgeDemo('worker')}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                      authState.user?.role === 'worker'
                        ? 'bg-forest-800 text-white shadow-soft'
                        : 'text-ink-500 hover:text-ink-900'
                    }`}
                  >
                    Worker view · {activeWorker?.name ? activeWorker.name.split(' ')[0] : 'Worker'}
                  </button>
                  <button
                    onClick={() => handleEnterJudgeDemo('contractor')}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                      authState.user?.role === 'contractor'
                        ? 'bg-ink-950 text-white shadow-soft'
                        : 'text-ink-500 hover:text-ink-900'
                    }`}
                  >
                    Contractor view
                  </button>
                  <ArrowLeftRight className="mr-1 h-3 w-3 text-ink-300" aria-hidden="true" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowJudgeTourModal(true)}
                  className="btn btn-sm border border-brass-300 bg-brass-50 text-brass-900 transition-colors hover:bg-brass-100"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Audit bench
                </button>
                <button
                  onClick={handleSignOut}
                  className="btn btn-sm border border-sand-300 bg-white text-ink-600 hover:bg-sand-100"
                >
                  Exit demo
                </button>
              </div>
            </div>

            {authState.user?.role === 'worker' ? (
              <>
                <HeroSection
                  lang={lang}
                  onNavigateTab={setCurrentTab}
                  onNewWorkerClick={() => setShowNewWorkerModal(true)}
                />

                <div key={currentTab} className="animate-fade-up">
                  {currentTab === 'pass' && (
                    <WorkerCard worker={activeWorker} site={activeSite} stats={workerStats} lang={lang} />
                  )}

                  {currentTab === 'attendance' && (
                    <AttendanceMuster
                      worker={activeWorker}
                      sites={sites}
                      attendanceList={attendanceList}
                      onMarkAttendance={handleMarkAttendance}
                      lang={lang}
                    />
                  )}

                  {currentTab === 'ledger' && (
                    <WageProtectionLedger
                      worker={activeWorker}
                      ledgerEntries={ledgerEntries}
                      site={activeSite}
                      stats={workerStats}
                      onAddLedgerEntry={handleAddLedgerEntry}
                      onAcknowledgePayment={handleAcknowledgePayment}
                      lang={lang}
                    />
                  )}

                  {currentTab === 'contractor' && (
                    <ContractorPortal
                      workers={workers}
                      sites={sites}
                      onBulkPunchAttendance={handleBulkAttendance}
                      lang={lang}
                    />
                  )}

                  {currentTab === 'grievance' && (
                    <GrievanceRedressal
                      worker={activeWorker}
                      grievances={grievances}
                      onAddGrievance={handleAddGrievance}
                      lang={lang}
                    />
                  )}

                  {currentTab === 'welfare' && <WelfareSchemes worker={activeWorker} lang={lang} />}
                </div>
              </>
            ) : (
              <ContractorDashboard user={authState.user!} lang={lang} />
            )}
          </div>
        )}

        </Suspense>

        {/* Empty demo guard — keeps the screen from going blank if seeds are missing */}
        {authState.isJudgeDemo && !activeWorker && (
          <div className="card p-10 text-center">
            <p className="text-sm font-bold text-ink-900">Demo dataset is empty</p>
            <p className="mt-1 text-xs text-ink-500">
              Restore the prototype seed data from the audit bench to continue the tour.
            </p>
            <button
              onClick={() => {
                db.resetToDefault();
                refreshData();
              }}
              className="btn btn-primary btn-sm mt-4"
            >
              Restore demo dataset
            </button>
          </div>
        )}
      </main>

      <Footer onNavigate={handleNavigate} onEnterJudgeDemo={() => handleEnterJudgeDemo('worker')} lang={lang} />

      {/* Modals — mounted on demand so their code is fetched lazily */}
      {showNewWorkerModal && (
        <Suspense fallback={null}>
          <NewWorkerModal
            isOpen
            onClose={() => setShowNewWorkerModal(false)}
            onAddWorker={handleAddWorker}
            sites={sites}
            lang={lang}
          />
        </Suspense>
      )}

      {showBalVigyanModal && (
        <Suspense fallback={null}>
          <BalVigyanAboutModal
            isOpen
            onClose={() => setShowBalVigyanModal(false)}
            onDataReset={refreshData}
            lang={lang}
          />
        </Suspense>
      )}

      {showJudgeTourModal && (
        <Suspense fallback={null}>
          <JudgeDemoTourModal
            isOpen
            onClose={() => setShowJudgeTourModal(false)}
            onDataReset={refreshData}
            lang={lang}
          />
        </Suspense>
      )}
    </div>
  );
}
