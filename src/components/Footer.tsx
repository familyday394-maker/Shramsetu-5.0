import React from 'react';
import {
  ArrowUpRight,
  ArrowUp,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  LockKeyhole,
} from 'lucide-react';
import { AppRoute } from '../services/router';
import { APP_CONFIG } from '../config';
import { BrandMark } from './ui/BrandMark';
import { getPublicCopy } from '../services/publicCopy';
import { Language } from '../services/i18n';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
  onEnterJudgeDemo: () => void;
  lang?: Language;
}

const PLATFORM_LINKS: { label: string; route: AppRoute }[] = [
  { label: 'Home', route: 'home' },
  { label: 'How it works', route: 'how-it-works' },
  { label: 'Create an account', route: 'create-account' },
  { label: 'Sign in', route: 'sign-in' },
  { label: 'Help & contact', route: 'help' },
];

const TRUST_LINKS: { label: string; route: AppRoute }[] = [
  { label: 'About the project', route: 'about' },
  { label: 'Privacy & data use', route: 'privacy' },
  { label: 'Password recovery', route: 'forgot-password' },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate, onEnterJudgeDemo, lang = 'en' }) => {
  const year = new Date().getFullYear();
  const copy = getPublicCopy(lang);

  return (
    <footer className="relative mt-20 overflow-hidden bg-ink-950 text-sand-200 no-print">
      {/* ambient light */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full glow-emerald opacity-30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full glow-brass opacity-20 blur-3xl"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass-400/50 to-transparent" />

      <div className="relative container-page pb-10 pt-14 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <BrandMark size="md" />
              <div>
                <span className="font-display text-lg font-semibold text-white">Shram Setu</span>
                <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-1.5 py-0.5 align-middle text-[9px] font-bold tracking-wider text-brass-300">
                  2.0
                </span>
                <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-sand-200/60">
                  Verified work &amp; wage records
                </p>
              </div>
            </div>
            <p className="mt-5 text-[12.5px] leading-relaxed text-sand-200/60">
              {copy.footerTagline}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-sand-200/70">
                <ShieldCheck className="h-3 w-3 text-forest-300" /> MP Minimum Wages aligned
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-sand-200/70">
                <LockKeyhole className="h-3 w-3 text-brass-300" /> SHA-256 audit chain
              </span>
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Platform">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-sand-200/55">
              {copy.footerPlatform}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.route}>
                  <button
                    onClick={() => onNavigate(link.route)}
                    className="group inline-flex items-center gap-1 text-[12.5px] font-medium text-sand-200/70 transition-colors hover:text-white cursor-pointer"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-70" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Trust */}
          <nav aria-label="Trust and legal">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-sand-200/55">
              {copy.footerTrust}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {TRUST_LINKS.map((link) => (
                <li key={link.route}>
                  <button
                    onClick={() => onNavigate(link.route)}
                    className="group inline-flex items-center gap-1 text-[12.5px] font-medium text-sand-200/70 transition-colors hover:text-white cursor-pointer"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-70" />
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onEnterJudgeDemo}
                  className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brass-300 transition-colors hover:text-brass-200 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  {copy.footerJudge}
                </button>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-sand-200/55">
              {copy.footerReach}
            </h3>
            <div className="mt-4 space-y-3">
              <a
                href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-brass-400/40 hover:bg-white/[0.07]"
              >
                <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-brass-400/15 text-brass-300">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-sand-200/55">
                    {copy.footerWorkerHelpline}
                  </span>
                  <span className="block font-mono text-[12.5px] font-semibold text-white">
                    {APP_CONFIG.CONTACT_PHONE_DISPLAY}
                  </span>
                </span>
              </a>

              <a
                href={APP_CONFIG.WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-forest-400/40 hover:bg-white/[0.07]"
              >
                <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-forest-400/15 text-forest-300">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-sand-200/55">
                    {copy.footerWhatsApp}
                  </span>
                  <span className="block text-[12.5px] font-semibold text-white">
                    {copy.footerWhatsAppCta}
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-3 px-1 text-[11px] leading-relaxed text-sand-200/62">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-300/80" />
                <span>
                  {APP_CONFIG.LAB_LOCATION}
                  <br />
                  <a
                    href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-1 text-sand-200/60 transition-colors hover:text-white"
                  >
                    <Mail className="h-3 w-3" />
                    {APP_CONFIG.SUPPORT_EMAIL}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[10.5px] text-sand-200/55 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span>© {year} Shram Setu</span>
            <span className="text-white/15">·</span>
            <span>Senior Bal Vigyan Innovation, Indore MP</span>
            <span className="hidden text-white/15 sm:inline">·</span>
            <span className="hidden sm:inline">Local-first · Supabase ready</span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10.5px] font-semibold text-sand-200/70 transition-colors hover:border-brass-400/40 hover:text-white cursor-pointer"
          >
            {copy.footerBackToTop}
            <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
