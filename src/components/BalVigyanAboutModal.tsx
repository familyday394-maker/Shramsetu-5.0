import React, { useState } from 'react';
import { 
  Award, 
  Database, 
  Download, 
  RotateCcw, 
  Phone,
  MessageCircle
} from 'lucide-react';
import { db } from '../services/db';
import { Language, t } from '../services/i18n';
import { APP_CONFIG } from '../config';

interface BalVigyanAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
  lang: Language;
}

export const BalVigyanAboutModal: React.FC<BalVigyanAboutModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
  lang,
}) => {
  const [copiedBackup, setCopiedBackup] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = db.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shramsetu_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 3000);
  };

  const handleReset = () => {
    const confirmMsg = lang === 'hi' 
      ? 'क्या आप डेटाबेस को वरिष्ठ बाल विज्ञान इंदौर प्रोटोटाइप डेटा पर रीसेट करना चाहते हैं?'
      : 'Reset database to Senior Bal Vigyan Indore prototype seed data?';

    if (window.confirm(confirmMsg)) {
      db.resetToDefault();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Award className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('balVigyanModalTitle', lang)}
              </h3>
              <p className="text-xs text-slate-500">
                {t('balVigyanModalSub', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Project Genesis & Problem Statement */}
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-orange-50/70 rounded-xl border border-orange-200">
            <span className="font-bold text-orange-950 block text-sm">
              {t('balVigyanGenesisTitle', lang)}
            </span>
            <p className="text-orange-900 mt-1 leading-relaxed">
              {t('balVigyanGenesisBody', lang)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{t('balVigyanPillar1Title', lang)}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar1Body', lang)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{t('balVigyanPillar2Title', lang)}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar2Body', lang)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{t('balVigyanPillar3Title', lang)}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar3Body', lang)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">{t('balVigyanPillar4Title', lang)}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar4Body', lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Project Contact & Helpline Callout */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900 block">
              {t('balVigyanHelplineContact', lang)}
            </span>
            <span className="text-slate-600 font-mono text-sm font-semibold">
              {APP_CONFIG.CONTACT_PHONE_DISPLAY} ({APP_CONFIG.CONTACT_PHONE})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:border-orange-500 rounded-lg text-slate-800 font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span>Call</span>
            </a>

            <a
              href={APP_CONFIG.WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Database & Architecture Status (IndexedDB + Supabase Roadmap) */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Database className="w-4 h-4" />
              <span>{t('balVigyanPersistenceTitle', lang)}</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-orange-400 px-2 py-0.5 rounded border border-slate-700">
              {t('balVigyanPersistenceTag', lang)}
            </span>
          </div>

          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            {t('balVigyanPersistenceBody', lang)}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedBackup ? t('balVigyanBackupDownloaded', lang) : t('balVigyanExportBtn', lang)}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('balVigyanResetBtn', lang)}</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            {t('balVigyanClose', lang)}
          </button>
        </div>

      </div>
    </div>
  );
};
