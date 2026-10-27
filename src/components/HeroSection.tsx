import React from 'react';
import { Shield, QrCode, CheckCircle2, Volume2, ArrowRight, Sparkles } from 'lucide-react';
import { Language, t } from '../services/i18n';
import { speech } from '../services/speech';

interface HeroSectionProps {
  lang: Language;
  onNavigateTab: (tab: string) => void;
  onNewWorkerClick: () => void;
}

/**
 * Compact hero for the judge-demo workspace. Sits inside the main content
 * column, so it is a rounded panel rather than a full-bleed band.
 */
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

  const stats = [
    { value: '450M+', label: t('heroStatWorkforce', lang), tone: 'text-white' },
    { value: '100%', label: t('heroStatMuster', lang), tone: 'text-forest-300' },
    { value: '₹0', label: t('heroStatLoss', lang), tone: 'text-brass-300' },
  ];

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 text-white no-print">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full glow-brass opacity-40 blur-3xl animate-aurora"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full glow-emerald opacity-40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-5 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1 text-[10px] font-bold text-brass-200">
              <Shield className="h-3 w-3 text-brass-300" />
              {t('heroBadge', lang)}
            </span>
            <span className="text-[10px] font-semibold text-sand-200/62">
              {t('heroWageStandard', lang)}
            </span>
          </div>

          <h1 className="max-w-2xl text-[1.6rem] leading-[1.12] text-white sm:text-[2.15rem] lg:text-[2.4rem]">
            {t('heroTitlePart1', lang)}{' '}
            <span className="text-brass-300">{t('heroTitlePart2', lang)}</span>{' '}
            {t('heroTitlePart3', lang)}
          </h1>

          <p className="max-w-2xl text-[12px] leading-relaxed text-sand-200/65 sm:text-[13px]">
            {t('heroSubtitle', lang)}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={() => onNavigateTab('attendance')} className="btn btn-gold btn-sm">
              <QrCode className="h-3.5 w-3.5" />
              {t('heroMarkAttendance', lang)}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onNavigateTab('ledger')}
              className="btn btn-sm border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12]"
            >
              {t('heroViewLedger', lang)}
            </button>

            <button
              onClick={handleSpeakOverview}
              className="btn btn-sm border border-white/10 bg-transparent text-brass-200 hover:bg-white/[0.08]"
              title={t('listenAudio', lang)}
            >
              <Volume2 className="h-3.5 w-3.5" />
              {t('listenAudio', lang)}
            </button>

            <button
              onClick={onNewWorkerClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sand-200/62 underline decoration-sand-200/30 underline-offset-4 transition-colors hover:text-white cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />+ {t('heroRegisterWorker', lang)}
            </button>
          </div>

          <div className="grid max-w-md grid-cols-3 gap-3 border-t border-white/10 pt-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className={`font-mono text-[15px] font-bold tabular-nums sm:text-base ${stat.tone}`}>
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[10px] leading-tight text-sand-200/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0 lg:col-span-5">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.9)]">
            <img
              src="/assets/images/shram_setu_hero_pass_1792385013356.jpg"
              alt="Construction worker displaying a verified Smart Shram Pass at an Indore site"
              className="h-56 w-full object-cover object-center transition-transform duration-[1200ms] group-hover:scale-[1.04] sm:h-72"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/')) {
                  target.src = '/images/shram_setu_hero_pass_1792385013356.jpg';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />

            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/10 bg-ink-950/85 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-300" />
                  <div className="min-w-0">
                    <span className="block truncate text-[11.5px] font-bold text-white">
                      Rameshwar Lal Ahirwar
                    </span>
                    <span className="block truncate text-[10px] text-sand-200/62">
                      {t('heroCardSubtext', lang)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block font-mono text-[11.5px] font-bold text-brass-300">
                    ₹550/day
                  </span>
                  <span className="block text-[9.5px] text-sand-200/60">
                    {t('heroCardBocw', lang)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
