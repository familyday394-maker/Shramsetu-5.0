import React from 'react';
import { Shield, QrCode, CheckCircle2, Volume2, ArrowRight } from 'lucide-react';
import { Language, t } from '../services/i18n';
import { speech } from '../services/speech';

interface HeroSectionProps {
  lang: Language;
  onNavigateTab: (tab: string) => void;
  onNewWorkerClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  onNavigateTab,
  onNewWorkerClick,
}) => {
  const handleSpeakOverview = () => {
    if (lang === 'hi') {
      speech.speak(
        'श्रम सेतु 2.0 असंगठित एवं दैनिक वेतन भोगी श्रमिकों के अधिकारों की रक्षा करता है। यह डिजिटल क्यूआर पास, जीपीएस आधारित हाजिरी और न्यूनतम मजदूरी की गारंटी सुनिश्चित करता है।',
        'hi-IN'
      );
    } else {
      speech.speak(
        'Shram Setu 2.0 secures verified daily work records, geofenced attendance, and statutory minimum wage protection for informal construction and daily-wage laborers.',
        'en-IN'
      );
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Mission, Title, Actions */}
          <div className="lg:col-span-7 space-y-5 min-w-0">
            
            {/* Civic Tech & Innovation Tag */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-orange-400 font-medium">
              <span className="flex items-center gap-1.5 bg-orange-950/80 border border-orange-800/80 px-2.5 py-1 rounded text-orange-300">
                <Shield className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>{t('heroBadge', lang)}</span>
              </span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-slate-400 text-[11px] sm:text-xs">
                {t('heroWageStandard', lang)}
              </span>
            </div>

            {/* Headline with balance constraint */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight break-words" style={{ textWrap: 'balance' }}>
              {t('heroTitlePart1', lang)}{' '}
              <span className="text-orange-400">{t('heroTitlePart2', lang)}</span>{' '}
              {t('heroTitlePart3', lang)}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
              {t('heroSubtitle', lang)}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('attendance')}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>{t('heroMarkAttendance', lang)}</span>
                <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
              </button>

              <button
                onClick={() => onNavigateTab('ledger')}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <span>{t('heroViewLedger', lang)}</span>
              </button>

              <button
                onClick={handleSpeakOverview}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-orange-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0"
                title={t('listenAudio', lang)}
              >
                <Volume2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{t('listenAudio', lang)}</span>
              </button>

              <button
                onClick={onNewWorkerClick}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                + {t('heroRegisterWorker', lang)}
              </button>
            </div>

            {/* Quick Proof points */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-slate-800 text-xs">
              <div>
                <div className="text-white font-bold font-mono text-sm sm:text-base tabular-nums">450M+</div>
                <div className="text-slate-400 text-[10px] sm:text-[11px] leading-tight">{t('heroStatWorkforce', lang)}</div>
              </div>
              <div>
                <div className="text-emerald-400 font-bold font-mono text-sm sm:text-base tabular-nums">100%</div>
                <div className="text-slate-400 text-[10px] sm:text-[11px] leading-tight">{t('heroStatMuster', lang)}</div>
              </div>
              <div>
                <div className="text-orange-400 font-bold font-mono text-sm sm:text-base tabular-nums">₹0</div>
                <div className="text-slate-400 text-[10px] sm:text-[11px] leading-tight">{t('heroStatLoss', lang)}</div>
              </div>
            </div>

          </div>

          {/* Right Column: High-Fidelity Editorial Card Image */}
          <div className="lg:col-span-5 relative min-w-0">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800">
              <img
                src="/assets/images/shram_setu_hero_pass_1792385013356.jpg"
                alt="Artisan construction worker displaying verified Smart Shram Pass in Indore"
                className="w-full h-64 sm:h-80 object-cover object-center"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to secondary static asset path if needed
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/')) {
                    target.src = '/images/shram_setu_hero_pass_1792385013356.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 p-2.5 sm:p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold text-white truncate block">Rameshwar Lal Ahirwar</span>
                      <span className="text-slate-400 text-[11px] block truncate">{t('heroCardSubtext', lang)}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-emerald-400 font-mono font-bold">₹550/day</span>
                    <span className="text-[10px] text-slate-400 block">{t('heroCardBocw', lang)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
