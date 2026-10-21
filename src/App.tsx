/**
 * Shram Setu 2.0 - Verified Digital Work & Wage Records
 * Senior Bal Vigyan Innovation, Indore, Madhya Pradesh
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WorkerCard } from './components/WorkerCard';
import { AttendanceMuster } from './components/AttendanceMuster';
import { WageProtectionLedger } from './components/WageProtectionLedger';
import { ContractorPortal } from './components/ContractorPortal';
import { GrievanceRedressal } from './components/GrievanceRedressal';
import { WelfareSchemes } from './components/WelfareSchemes';
import { NewWorkerModal } from './components/NewWorkerModal';
import { BalVigyanAboutModal } from './components/BalVigyanAboutModal';
import { db } from './services/db';
import { Worker, ConstructionSite, AttendanceRecord, WageLedgerEntry, DisputeGrievance } from './types';
import { Language, t, getSavedLanguage, saveLanguage } from './services/i18n';
import { APP_CONFIG } from './config';
import { Phone, MessageCircle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => getSavedLanguage());
  const [currentTab, setCurrentTab] = useState<string>('pass');
  
  // Data state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<WageLedgerEntry[]>([]);
  const [grievances, setGrievances] = useState<DisputeGrievance[]>([]);
  
  // Modals
  const [showNewWorkerModal, setShowNewWorkerModal] = useState(false);
  const [showBalVigyanModal, setShowBalVigyanModal] = useState(false);

  // Load from DB
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

  // Update worker specific data when selection changes
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

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    saveLanguage(nextLang);
  };

  if (!activeWorker) {
    return <div className="p-8 text-center text-slate-500">Loading Shram Setu platform...</div>;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-orange-200">
      
      {/* Universal Top Navigation conforming to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        onToggleLang={handleToggleLang}
        workers={workers}
        selectedWorkerId={selectedWorkerId}
        onSelectWorker={setSelectedWorkerId}
        onOpenBalVigyanModal={() => setShowBalVigyanModal(true)}
      />

      {/* Hero Banner for overview & quick actions */}
      <HeroSection
        lang={lang}
        onNavigateTab={setCurrentTab}
        onNewWorkerClick={() => setShowNewWorkerModal(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
        
        {/* Tab 1: Smart Shram Pass & Physical Card */}
        {currentTab === 'pass' && (
          <WorkerCard
            worker={activeWorker}
            site={activeSite}
            stats={workerStats}
            lang={lang}
          />
        )}

        {/* Tab 2: Attendance & Muster Roll Punch */}
        {currentTab === 'attendance' && (
          <AttendanceMuster
            worker={activeWorker}
            sites={sites}
            attendanceList={attendanceList}
            onMarkAttendance={handleMarkAttendance}
            lang={lang}
          />
        )}

        {/* Tab 3: Wage Protection Ledger & Khata */}
        {currentTab === 'ledger' && (
          <WageProtectionLedger
            worker={activeWorker}
            ledgerEntries={ledgerEntries}
            site={activeSite}
            stats={workerStats}
            onAddLedgerEntry={handleAddLedgerEntry}
            lang={lang}
          />
        )}

        {/* Tab 4: Contractor & Muster Portal */}
        {currentTab === 'contractor' && (
          <ContractorPortal
            workers={workers}
            sites={sites}
            onBulkPunchAttendance={handleBulkAttendance}
            lang={lang}
          />
        )}

        {/* Tab 5: Grievance Redressal & Legal Representation */}
        {currentTab === 'grievance' && (
          <GrievanceRedressal
            worker={activeWorker}
            grievances={grievances}
            onAddGrievance={handleAddGrievance}
            lang={lang}
          />
        )}

        {/* Tab 6: Welfare Schemes & PM-SYM Pension */}
        {currentTab === 'welfare' && (
          <WelfareSchemes
            worker={activeWorker}
            lang={lang}
          />
        )}

      </main>

      {/* Clean Editorial Footer with Contact Helpline & WhatsApp */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 w-full max-w-full no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {t('footerTitle', lang)}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600">
                {t('footerInnovation', lang)}
              </span>
              <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
              <span className="text-slate-600 hidden sm:inline">
                {t('footerCompliance', lang)}
              </span>
            </div>

            {/* Helpline and WhatsApp Links with 7909348017 */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500 hidden sm:inline">{t('footerHelplineLabel', lang)}</span>
              <a
                href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
                className="flex items-center gap-1.5 font-mono font-bold text-slate-800 hover:text-orange-600 transition-colors shrink-0"
                title="Call Shram Setu Helpline"
              >
                <Phone className="w-3.5 h-3.5 text-orange-600 shrink-0" />
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
                onClick={() => setShowBalVigyanModal(true)}
                className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
              >
                {t('footerExhibitBtn', lang)}
              </button>
              <button
                onClick={() => {
                  db.resetToDefault();
                  refreshData();
                }}
                className="hover:text-slate-900 cursor-pointer"
              >
                {t('footerResetBtn', lang)}
              </button>
              <span className="text-slate-400">{t('footerDemoMode', lang)}</span>
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

    </div>
  );
}
