import React from 'react';
import { ShieldCheck, Volume2, Globe, Award, Phone } from 'lucide-react';
import { Worker } from '../types';
import { Language, t } from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onToggleLang: () => void;
  workers: Worker[];
  selectedWorkerId: string;
  onSelectWorker: (id: string) => void;
  onOpenBalVigyanModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  workers,
  selectedWorkerId,
  onSelectWorker,
  onOpenBalVigyanModal,
}) => {
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full max-w-full no-print">
      {/* Top Bar following Top Bar Contract: 3 distinct zones separated by gap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
        
        {/* Zone 1: Wordmark & brand */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <button
            onClick={() => onSelectTab('pass')}
            className="text-left group cursor-pointer focus:outline-none min-w-0"
            title={t('navPass', lang)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors whitespace-nowrap">
                {t('brandName', lang)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-1 sm:px-1.5 py-0.5 rounded">
                2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden md:block whitespace-nowrap truncate max-w-[200px]">
              {t('brandSubtitle', lang)}
            </p>
          </button>
        </div>

        {/* Zone 2: Navigation links on xl+ screens */}
        <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-xs 2xl:text-sm font-medium text-slate-600 shrink-0">
          <button
            onClick={() => onSelectTab('pass')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'pass'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('navPass', lang)}
          </button>
          <button
            onClick={() => onSelectTab('attendance')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'attendance'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('navAttendance', lang)}
          </button>
          <button
            onClick={() => onSelectTab('ledger')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'ledger'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('navLedger', lang)}
          </button>
          <button
            onClick={() => onSelectTab('contractor')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'contractor'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('navContractor', lang)}
          </button>
          <button
            onClick={() => onSelectTab('grievance')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'grievance'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('navGrievance', lang)}
          </button>
          <button
            onClick={() => onSelectTab('welfare')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'welfare'
                ? 'text-orange-600 font-semibold border-b-2 border-orange-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('navWelfare', lang)}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls (Worker selection, Helpline, Language, Bal Vigyan badge) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Worker Selector dropdown */}
          <div className="relative">
            <select
              value={selectedWorkerId}
              onChange={(e) => onSelectWorker(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 text-slate-800 rounded-md py-1.5 pl-2 pr-6 font-medium focus:ring-1 focus:ring-orange-500 focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[145px] md:max-w-[180px] truncate"
              title={t('selectWorker', lang)}
              aria-label={t('selectWorker', lang)}
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {lang === 'hi' ? w.hindiName : w.name} ({w.id.slice(-3)})
                </option>
              ))}
            </select>
          </div>

          {/* Project Contact Helpline (7909348017) */}
          <a
            href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
            className="hidden 2xl:flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            title={`${t('helplineText', lang)}: ${APP_CONFIG.CONTACT_PHONE_DISPLAY}`}
          >
            <Phone className="w-3.5 h-3.5 text-orange-600" />
            <span className="font-mono font-medium">{APP_CONFIG.CONTACT_PHONE}</span>
          </a>

          {/* Audio narration button */}
          <button
            onClick={handleSpeakBrand}
            className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors shrink-0"
            title={t('audioReadout', lang)}
            aria-label={t('audioReadout', lang)}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Language Toggle with persisted preference */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer shrink-0"
            title={lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
            aria-label="Toggle language between English and Hindi"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{lang === 'en' ? t('toggleToHindi', lang) : t('toggleToEnglish', lang)}</span>
            <span className="sm:hidden">{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Bal Vigyan Award Pill Button */}
          <button
            onClick={onOpenBalVigyanModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shadow-sm cursor-pointer shrink-0"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Bal Vigyan 2.0</span>
            <span className="md:hidden">2.0</span>
          </button>
        </div>

      </div>

      {/* Sub-Navigation Bar for screens < xl (Mobile & Tablet) */}
      <div className="xl:hidden w-full max-w-full overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs font-medium space-x-2 scrollbar-none flex items-center">
        <button
          onClick={() => onSelectTab('pass')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentTab === 'pass' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          {t('navPass', lang)}
        </button>
        <button
          onClick={() => onSelectTab('attendance')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentTab === 'attendance' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          {t('navAttendance', lang)}
        </button>
        <button
          onClick={() => onSelectTab('ledger')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentTab === 'ledger' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          {t('navLedger', lang)}
        </button>
        <button
          onClick={() => onSelectTab('contractor')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentTab === 'contractor' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          {t('navContractor', lang)}
        </button>
        <button
          onClick={() => onSelectTab('grievance')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentTab === 'grievance' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          {t('navGrievance', lang)}
        </button>
        <button
          onClick={() => onSelectTab('welfare')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded cursor-pointer transition-colors ${
            currentTab === 'welfare' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          {t('navWelfare', lang)}
        </button>
      </div>
    </header>
  );
};
