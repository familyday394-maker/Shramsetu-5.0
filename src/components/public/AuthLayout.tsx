import React from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Phone } from 'lucide-react';
import { AppRoute } from '../../services/router';
import { APP_CONFIG } from '../../config';
import { Reveal } from '../ui/Reveal';
import { BrandMark } from '../ui/BrandMark';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onNavigate: (route: AppRoute) => void;
  children: React.ReactNode;
  /** Shown under the form, inside the card. */
  footer?: React.ReactNode;
  /** Width of the card column. */
  width?: 'md' | 'lg';
  asideTitle?: string;
  asidePoints?: string[];
}

const DEFAULT_POINTS = [
  'A reusable QR pass that carries zero personal data',
  'Statutory wage maths computed in integer paise',
  'Every muster punch needs your written approval',
  'A SHA-256 chain that exposes backdated edits',
];

/**
 * Two-panel authentication shell: a warm editorial promise panel on the left,
 * a focused, quiet form on the right. Collapses to a single column on mobile.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  eyebrow,
  title,
  subtitle,
  icon,
  onNavigate,
  children,
  footer,
  width = 'md',
  asideTitle = 'A work record that cannot be quietly rewritten.',
  asidePoints = DEFAULT_POINTS,
}) => {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 py-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-10 lg:py-8">
      {/* Promise panel */}
      <Reveal
        direction="left"
        className="relative hidden overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 p-9 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full glow-brass opacity-40 blur-3xl animate-aurora"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full glow-emerald opacity-40 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <BrandMark size="md" />
            <div>
              <p className="font-display text-[1.0625rem] font-semibold leading-none text-white">
                Shram Setu
              </p>
              <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-sand-200/62">
                Verified work &amp; wage records
              </p>
            </div>
          </div>

          <p className="mt-12 max-w-xs font-display text-[1.65rem] leading-[1.2] text-white">
            {asideTitle}
          </p>

          <ul className="mt-8 space-y-3.5">
            {asidePoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-sand-200/75">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brass-300" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-12 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brass-400/15 text-brass-300">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sand-200/60">
                Need help registering?
              </p>
              <a
                href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
                className="mt-1 block font-mono text-[13px] font-bold text-white hover:text-brass-200"
              >
                {APP_CONFIG.CONTACT_PHONE_DISPLAY}
              </a>
              <p className="mt-1 text-[10.5px] leading-snug text-sand-200/62">
                Mon–Sat, 9am–7pm · Hindi &amp; English
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Form panel */}
      <Reveal
        direction="up"
        delay={80}
        className="flex flex-col justify-center rounded-[1.75rem] border border-sand-200 bg-white p-6 shadow-soft sm:p-9"
      >
        <div className={width === 'lg' ? 'mx-auto w-full max-w-xl' : 'mx-auto w-full max-w-md'}>
          <div className="mb-7 flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-forest-800">
                <ShieldCheck className="h-3 w-3" />
                {eyebrow}
              </span>
              <h1 className="mt-4 text-[1.65rem] leading-tight text-ink-950 sm:text-[1.9rem]">
                {title}
              </h1>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">{subtitle}</p>
            </div>
            <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-forest-50 to-sand-100 text-forest-700 ring-1 ring-inset ring-forest-100 sm:grid">
              {icon}
            </span>
          </div>

          {children}

          {footer && <div className="mt-7 border-t border-sand-200 pt-5">{footer}</div>}

          <div className="mt-7 flex items-center justify-between gap-3 text-[10.5px] text-ink-400">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 font-semibold text-ink-500 transition-colors hover:text-forest-800 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to home
            </button>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Passwords are never stored in plain text
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
