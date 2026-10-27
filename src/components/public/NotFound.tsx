import React from 'react';
import { Compass, ArrowRight, QrCode, PhoneCall } from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { APP_CONFIG } from '../../config';
import { Reveal } from '../ui/Reveal';
import { getPublicCopy } from '../../services/publicCopy';

interface NotFoundProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

/**
 * Friendly dead-end: keeps a mistyped or expired link inside the product
 * instead of silently bouncing the visitor to the marketing page.
 */
export const NotFound: React.FC<NotFoundProps> = ({ onNavigate, lang }) => {
  const copy = getPublicCopy(lang);

  const links: { route: AppRoute; label: string; hint: string }[] = [
    { route: 'home', label: copy.nav.home, hint: 'Start from the overview' },
    { route: 'how-it-works', label: copy.nav.howItWorks, hint: 'How a shift becomes a record' },
    { route: 'verify', label: 'Verify a pass', hint: 'Check a QR reference' },
    { route: 'help', label: copy.nav.help, hint: 'Reach a coordinator' },
  ];

  return (
    <div className="mx-auto max-w-3xl py-10 sm:py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-sand-200 bg-gradient-to-b from-white via-sand-50 to-sand-100/70 px-6 py-12 text-center noise sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full glow-brass opacity-40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-sand-200 bg-white text-forest-700 shadow-soft">
              <Compass className="h-7 w-7" />
            </span>

            <p className="mt-6 font-mono text-[11px] font-bold tracking-[0.28em] text-brass-600">
              404 · ROUTE NOT FOUND
            </p>
            <h1 className="mt-3 text-[1.9rem] leading-tight text-ink-950 sm:text-[2.4rem]">
              This page is not on the bridge.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-relaxed text-ink-500">
              The link may be mistyped or out of date. Nothing was lost — your records are stored
              against your own account, not against this URL.
            </p>

            <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {links.map((link) => (
                <button
                  key={link.route}
                  onClick={() => onNavigate(link.route)}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift cursor-pointer"
                >
                  <span>
                    <span className="block text-[12px] font-bold text-ink-900">{link.label}</span>
                    <span className="block text-[10.5px] text-ink-400">{link.hint}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-forest-700" />
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[11px]">
              <a
                href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
                className="inline-flex items-center gap-1.5 font-semibold text-forest-800 hover:underline"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {APP_CONFIG.CONTACT_PHONE_DISPLAY}
              </a>
              <span className="text-ink-300">·</span>
              <button
                onClick={() => onNavigate('verify')}
                className="inline-flex items-center gap-1.5 font-semibold text-ink-500 hover:text-forest-800 cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5" />
                Scanning a pass instead?
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
