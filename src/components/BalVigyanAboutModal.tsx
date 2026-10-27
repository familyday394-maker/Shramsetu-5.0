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
import { useModalBehavior } from '../hooks/useModalBehavior';
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
  const modalRef = useModalBehavior(isOpen, onClose);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('balVigyanModalTitle', lang)}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-2xl space-y-5 rounded-[1.5rem] border border-sand-200 bg-white p-6 shadow-[0_40px_80px_-40px_rgba(8,19,15,0.6)] outline-none">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sand-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brass-600 flex items-center justify-center text-white">
              <Award className="w-4 h-4 text-brass-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-900">
                {t('balVigyanModalTitle', lang)}
              </h3>
              <p className="text-xs text-ink-500">
                {t('balVigyanModalSub', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 font-bold text-base cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Project Genesis & Problem Statement */}
        <div className="space-y-3 text-xs text-ink-700 leading-relaxed">
          <div className="p-3.5 bg-brass-50/70 rounded-xl border border-brass-200">
            <span className="font-bold text-brass-900 block text-sm">
              {t('balVigyanGenesisTitle', lang)}
            </span>
            <p className="text-brass-900 mt-1 leading-relaxed">
              {t('balVigyanGenesisBody', lang)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-ink-900 block">{t('balVigyanPillar1Title', lang)}</span>
              <p className="text-ink-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar1Body', lang)}
              </p>
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-ink-900 block">{t('balVigyanPillar2Title', lang)}</span>
              <p className="text-ink-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar2Body', lang)}
              </p>
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-ink-900 block">{t('balVigyanPillar3Title', lang)}</span>
              <p className="text-ink-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar3Body', lang)}
              </p>
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-ink-900 block">{t('balVigyanPillar4Title', lang)}</span>
              <p className="text-ink-600 mt-0.5 leading-relaxed">
                {t('balVigyanPillar4Body', lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Project Contact & Helpline Callout */}
        <div className="p-3 bg-sand-100 rounded-xl border border-ink-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-ink-900 block">
              {t('balVigyanHelplineContact', lang)}
            </span>
            <span className="text-ink-600 font-mono text-sm font-semibold">
              {APP_CONFIG.CONTACT_PHONE_DISPLAY} ({APP_CONFIG.CONTACT_PHONE})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-ink-300 hover:border-brass-500 rounded-lg text-ink-800 font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brass-600" />
              <span>Call</span>
            </a>

            <a
              href={APP_CONFIG.WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-forest-600 hover:bg-forest-500 text-white rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Database & Architecture Status (IndexedDB + Supabase Roadmap) */}
        <div className="bg-ink-900 text-sand-100 p-4 rounded-xl border border-ink-800 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-forest-400 font-bold">
              <Database className="w-4 h-4" />
              <span>{t('balVigyanPersistenceTitle', lang)}</span>
            </div>
            <span className="text-[10px] bg-ink-800 text-brass-400 px-2 py-0.5 rounded border border-ink-700">
              {t('balVigyanPersistenceTag', lang)}
            </span>
          </div>

          <p className="text-ink-300 font-sans text-xs leading-relaxed">
            {t('balVigyanPersistenceBody', lang)}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-sand-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-forest-400" />
              <span>{copiedBackup ? t('balVigyanBackupDownloaded', lang) : t('balVigyanExportBtn', lang)}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-brass-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
            className="px-5 py-2 bg-ink-900 hover:bg-ink-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            {t('balVigyanClose', lang)}
          </button>
        </div>

      </div>
    </div>
  );
};
