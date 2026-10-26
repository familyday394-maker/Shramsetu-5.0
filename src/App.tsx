/**
 * Shram Setu 2.0 - Role-Based Website, Account Lifecycle & Contact Verification
 * Senior Bal Vigyan Innovation · Indore, Madhya Pradesh
 * 
 * Strict Architecture Rules:
 * 1. Logged out visitors see professional public pages with proper URL hash routes.
 * 2. Authenticated Workers see dedicated 7-tab portal; newly registered accounts start clean.
 * 3. Authenticated Contractors see 9-tab portal with QR camera scanner & shift approvals.
 * 4. Signing out preserves database records and clears session.
 * 5. Isolated Judge Demo Mode is strictly separated from genuine user accounts.
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './components/public/Home';
import { HowItWorks } from './components/public/HowItWorks';
import { CreateAccount } from './components/public/CreateAccount';
import { SignIn } from './components/public/SignIn';
import { PasswordRecovery } from './components/public/PasswordRecovery';
import { Privacy } from './components/public/Privacy';
import { HelpContact } from './components/public/HelpContact';
import { About } from './components/public/About';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { ContractorDashboard } from './components/contractor/ContractorDashboard';

// Legacy Demo Components for Isolated Judge Demo Mode
import { HeroSection } from './components/HeroSection';
import { WorkerCard } from './components/WorkerCard';
import { AttendanceMuster } from './components/AttendanceMuster';
import { WageProtectionLedger } from './components/WageProtectionLedger';
import { ContractorPortal } from './components/ContractorPortal';
import { GrievanceRedressal } from './components/GrievanceRedressal';
import { WelfareSchemes } from './components/WelfareSchemes';
import { NewWorkerModal } from './components/NewWorkerModal';
import { BalVigyanAboutModal } from './components/BalVigyanAboutModal';
import { JudgeDemoTourModal } from './components/JudgeDemoTourModal';

import { db } from './services/db';
import { auth, AuthState } from './services/auth';
import { router, AppRoute, RouteState } from './services/router';
import { Worker, ConstructionSite, AttendanceRecord, WageLedgerEntry, DisputeGrievance } from './types';
import { Language, t, getSavedLanguage, saveLanguage } from './services/i18n';
import { APP_CONFIG } from './config';
import { Phone, MessageCircle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => getSavedLanguage());
  const [routeState, setRouteState] = useState<RouteState>(() => router.getCurrentRoute());
  const [authState, setAuthState] = useState<AuthState>(() => auth.getAuthState());
  const [currentTab, setCurrentTab] = useState<string>('pass');

  // Demo / Shared dataset state
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
      window.scrollTo(0, 0);
    });
    const unsubAuth = auth.subscribe((newAuth) => {
      setAuthState(newAuth);
    });

    return () => {
      unsubRouter();
      unsubAuth();
    };
  }, []);

  // Synchronize URL route with authentication state
  useEffect(() => {
    if (authState.isAuthenticated) {
      if (authState.isJudgeDemo && routeState.route !== 'judge-demo') {
        router.navigate('judge-demo');
      } else if (!authState.isJudgeDemo) {
        if (authState.user?.role === 'worker' && routeState.route !== 'worker') {
          router.navigate('worker');
        } else if (authState.user?.role === 'contractor' && routeState.route !== 'contractor') {
          router.navigate('contractor');
        }
      }
    } else {
      // If logged out and on protected routes, redirect to sign-in
      if (routeState.route === 'worker' || routeState.route === 'contractor') {
        router.navigate('sign-in');
      }
    }
  }, [authState.isAuthenticated, authState.user?.role, authState.isJudgeDemo]);

  // Load demo database
  const refreshData = () => {
    const loadedWorkers = db.getWorkers();
    const loadedSites = db.getSites();
    setWorkers(loadedWorkers);
    setSites(loadedSites);

    const activeId = selectedWorkerId && loadedWorkers.some((w) => w.id === selectedWorkerId)
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
  const workerStats = selectedWorkerId ? db.getWorkerStats(selectedWorkerId) : {
    totalDaysWorked: 0,
    totalHalfDays: 0,
    totalOvertimeHours: 0,
    totalEarned: 0,
    totalAdvancesTaken: 0,
    netBalanceDue: 0,
  };

  // Demo actions
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

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-orange-200">
      
      {/* Universal Responsive Header */}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
        
        {/* PUBLIC LOGGED-OUT PAGES */}
        {!authState.isAuthenticated && (
          <>
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

            {routeState.route === 'privacy' && (
              <Privacy onNavigate={handleNavigate} lang={lang} />
            )}

            {routeState.route === 'help' && (
              <HelpContact onNavigate={handleNavigate} lang={lang} />
            )}

            {routeState.route === 'about' && (
              <About onNavigate={handleNavigate} lang={lang} />
            )}
          </>
        )}

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
          <ContractorDashboard
            user={authState.user}
            lang={lang}
          />
        )}

        {/* ISOLATED JUDGE DEMO MODE (Senior Bal Vigyan Exhibit Suite) */}
        {authState.isJudgeDemo && activeWorker && (
          <div className="space-y-6">
            
            {/* Judge Demo Role Switcher */}
            <div className="bg-white rounded-2xl border border-amber-300 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Evaluation Perspective:</span>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleEnterJudgeDemo('worker')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      authState.user?.role === 'worker' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Worker View ({activeWorker?.name ? activeWorker.name.split(' ')[0] : 'Worker'})
                  </button>
                  <button
                    onClick={() => handleEnterJudgeDemo('contractor')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      authState.user?.role === 'contractor' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Contractor View (Anil JE)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowJudgeTourModal(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Run Cryptographic Audit Bench
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Exit Demo to Public Site
                </button>
              </div>
            </div>

            {/* If Demo Worker */}
            {authState.user?.role === 'worker' ? (
              <>
                <HeroSection
                  lang={lang}
                  onNavigateTab={setCurrentTab}
                  onNewWorkerClick={() => setShowNewWorkerModal(true)}
                />

                {currentTab === 'pass' && (
                  <WorkerCard
                    worker={activeWorker}
                    site={activeSite}
                    stats={workerStats}
                    lang={lang}
                  />
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

                {currentTab === 'welfare' && (
                  <WelfareSchemes
                    worker={activeWorker}
                    lang={lang}
                  />
                )}
              </>
            ) : (
              /* If Demo Contractor */
              <ContractorDashboard
                user={authState.user!}
                lang={lang}
              />
            )}

          </div>
        )}

      </main>

      {/* Clean Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 w-full max-w-full no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Shram Setu 2.0
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600">
                Senior Bal Vigyan Innovation, Indore MP
              </span>
              <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
              <span className="text-slate-600 hidden sm:inline">
                MP Minimum Wages Act Aligned
              </span>
            </div>

            {/* Helpline and WhatsApp Links with 7909348017 */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500 hidden sm:inline">Helpline:</span>
              <a
                href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
                className="flex items-center gap-1.5 font-mono font-bold text-slate-800 hover:text-emerald-800 transition-colors shrink-0"
                title="Call Shram Setu Helpline"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span>{APP_CONFIG.CONTACT_PHONE_DISPLAY}</span>
              </a>

              <a
                href={APP_CONFIG.WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300 transition-colors font-medium shrink-0"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => handleNavigate('about')}
                className="text-emerald-800 hover:text-emerald-900 font-semibold cursor-pointer"
              >
                About Bal Vigyan 2.0
              </button>
              <button
                onClick={() => handleNavigate('privacy')}
                className="hover:text-slate-900 cursor-pointer text-slate-600"
              >
                Privacy & Data Use
              </button>
              <button
                onClick={() => setShowJudgeTourModal(true)}
                className="hover:text-slate-900 cursor-pointer font-medium text-amber-700"
                title="Run Cryptographic Audit Bench"
              >
                Cryptographic Audit Test Bench
              </button>
              <span className="text-slate-400">IndexedDB Local Persistence · Supabase Standby</span>
            </div>

            <div className="text-slate-400">
              © 2026 Shram Setu · All Rights Reserved
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <NewWorkerModal
        isOpen={showNewWorkerModal}
        onClose={() => setShowNewWorkerModal(false)}
        onAddWorker={handleAddWorker}
        sites={sites}
        lang={lang}
      />

      <BalVigyanAboutModal
        isOpen={showBalVigyanModal}
        onClose={() => setShowBalVigyanModal(false)}
        onDataReset={refreshData}
        lang={lang}
      />

      <JudgeDemoTourModal
        isOpen={showJudgeTourModal}
        onClose={() => setShowJudgeTourModal(false)}
        onDataReset={refreshData}
        lang={lang}
      />

    </div>
  );
}
