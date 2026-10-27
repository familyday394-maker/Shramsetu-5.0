import React from 'react';
import {
  ShieldCheck,
  QrCode,
  Scale,
  ArrowRight,
  Users,
  Building2,
  Lock,
  CheckCircle2,
  Award,
  PhoneCall,
  Sparkles,
  ScanLine,
  Fingerprint,
  FileCheck2,
  MapPin,
  PlayCircle,
  Clock,
  Wallet,
  BadgeCheck,
  Languages,
  Link2,
  Smartphone,
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { APP_CONFIG } from '../../config';
import { Reveal } from '../ui/Reveal';
import { SpotlightCard } from '../ui/SpotlightCard';
import { SectionHeading } from '../ui/SectionHeading';
import { CountUp } from '../ui/CountUp';
import { Accordion } from '../ui/Accordion';
import { QrPattern } from '../ui/QrPattern';
import { TiltCard } from '../ui/TiltCard';
import { getPublicCopy } from '../../services/publicCopy';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
  onEnterJudgeDemo: () => void;
}

/* ------------------------------------------------------------------------- */
/* Hero pass preview — stylised, non-scannable sample credential              */
/* ------------------------------------------------------------------------- */
const PassPreview: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[24rem]">
    {/* halo */}
    <div
      className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-[radial-gradient(circle_at_55%_35%,rgba(217,168,68,0.22),transparent_62%)] blur-2xl"
      aria-hidden="true"
    />

    {/* pass card */}
    <TiltCard className="relative">
    <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 p-5 text-white shadow-[0_38px_80px_-40px_rgba(8,19,15,0.85)] ring-1 ring-inset ring-white/10">
      {/* shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -inset-y-8 left-0 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15">
              <ShieldCheck className="h-4 w-4 text-brass-300" />
            </span>
            <div className="leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass-300/90">
                Govt. of Madhya Pradesh
              </p>
              <p className="text-[11px] font-bold text-white">Smart Shram Pass</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-forest-400/20 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-forest-200 ring-1 ring-inset ring-forest-400/30">
            <span className="h-1 w-1 rounded-full bg-forest-300" /> Active
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative">
            <img
              src="/assets/images/shram_setu_hero_pass_1792385013356.jpg"
              alt=""
              className="h-14 w-14 rounded-xl object-cover object-[60%_18%] ring-2 ring-white/20"
              loading="eager"
              decoding="async"
            />
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brass-400 text-ink-950 ring-2 ring-forest-900">
              <BadgeCheck className="h-3 w-3" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold leading-tight">Rajesh Kumar Ahirwar</p>
            <p className="mt-0.5 text-[10px] text-forest-200/80">Head Mason · Skilled</p>
            <p className="mt-1 font-mono text-[9.5px] tracking-wide text-brass-300/80">
              WKR-IND-•••• 4821
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white p-2.5">
          <div className="relative overflow-hidden rounded-lg bg-white p-1">
            <QrPattern seed="WKR-IND-4821-RAJESH" size={62} className="text-ink-950" />
            {/* scan beam */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-emerald-400/0 via-emerald-400/50 to-emerald-400/0 animate-scan"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-ink-400">
              Muster status
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-ink-900">
              <CheckCircle2 className="h-3 w-3 text-forest-600" />
              Shift approved today
            </p>
            <p className="mt-1 text-[9px] leading-snug text-ink-400">
              Zero personal data in the code — reference only.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-forest-200/60">
          <span>e-Shram linked</span>
          <span className="h-2.5 w-px bg-white/15" />
          <span>MP BOCW</span>
          <span className="h-2.5 w-px bg-white/15" />
          <span>SHA-256 sealed</span>
        </div>
      </div>
    </div>
    </TiltCard>

    {/* floating: geofence */}
    <div className="absolute -left-6 top-[38%] hidden animate-float-slow [animation-delay:-3s] sm:block">
      <div className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white/95 px-3 py-2 shadow-lift backdrop-blur">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-50 text-forest-700">
          <MapPin className="h-3.5 w-3.5" />
        </span>
        <div className="leading-tight">
          <p className="text-[9px] font-bold uppercase tracking-wider text-ink-400">Geofence</p>
          <p className="text-[10.5px] font-bold text-ink-900">Site verified · 42 m</p>
        </div>
      </div>
    </div>

    {/* floating: wage credit */}
    <div className="absolute -right-4 bottom-[16%] hidden animate-float [animation-delay:-1.5s] sm:block">
      <div className="flex items-center gap-2 rounded-xl border border-forest-200 bg-white/95 px-3 py-2 shadow-lift backdrop-blur">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-700 text-white">
          <Wallet className="h-3.5 w-3.5" />
        </span>
        <div className="leading-tight">
          <p className="text-[9px] font-bold uppercase tracking-wider text-ink-400">Wage credited</p>
          <p className="font-mono text-[10.5px] font-bold text-forest-800">+ ₹618.00</p>
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------------- */
/* Home                                                                      */
/* ------------------------------------------------------------------------- */
export const Home: React.FC<HomeProps> = ({ onNavigate, lang, onEnterJudgeDemo }) => {
  const copy = getPublicCopy(lang);

  const compliance = [
    'MP Minimum Wages Act 1948',
    'e-Shram NDUW alignment',
    'MP BOCW Welfare Board',
    'Direct Benefit Transfer ready',
    'SHA-256 chained audit',
    'Zero-PII QR credential',
    'Mutual shift approval',
    'Offline-first IndexedDB',
  ];

  const steps = [
    {
      num: '01',
      title: 'Pass issued',
      body: 'A reusable QR credential with an opaque reference. No Aadhaar, no phone number, no balance.',
      icon: QrCode,
    },
    {
      num: '02',
      title: 'Contractor scans',
      body: 'The site scans the pass and a shift request lands on the worker’s own device — never an imposed entry.',
      icon: ScanLine,
    },
    {
      num: '03',
      title: 'Worker approves',
      body: 'Date, site, hours and rate are reviewed by the worker before any wage is computed.',
      icon: Fingerprint,
    },
    {
      num: '04',
      title: 'Ledger sealed',
      body: 'Statutory pro-rata wages are credited into a chained SHA-256 ledger that cannot be quietly rewritten.',
      icon: Lock,
    },
  ];

  const faqs = [
    {
      question: 'Does the QR pass contain my Aadhaar or phone number?',
      answer: (
        <>
          No. The pass encodes only an opaque reference token. A scanner resolves that token through
          authorised records, so a photograph of the card cannot leak identity, contacts or balances
          to a stranger.
        </>
      ),
    },
    {
      question: 'Can a contractor change my attendance after the shift?',
      answer: (
        <>
          Every muster punch creates a <strong>pending approval</strong> on your account. Nothing is
          finalised until you confirm the date, site, hours and rate. Backdated edits break the
          cryptographic chain and are visibly flagged in the audit bench.
        </>
      ),
    },
    {
      question: 'How is overtime calculated at the end of the week?',
      answer: (
        <>
          The engine works in integer paise, not floating-point rupees, and applies statutory
          pro-rata overtime for your skill category — unskilled, semi-skilled, skilled or highly
          skilled — before any advance or deduction is netted off.
        </>
      ),
    },
    {
      question: 'What happens when I have no network on site?',
      answer: (
        <>
          Shram Setu is offline-first. Records are written to your device immediately and synced to
          the Supabase backend when a connection returns, so a dead zone never means a lost shift.
        </>
      ),
    },
    {
      question: 'Is this an official government portal?',
      answer: (
        <>
          Shram Setu is a Senior Bal Vigyan innovation project from Indore, built to align with MP
          labour statutes and e-Shram / BOCW workflows. It is an independent transparency tool, not a
          government service.
        </>
      ),
    },
  ];

  return (
    <div className="pb-4">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-[2rem] border border-sand-200 bg-gradient-to-b from-white via-sand-50 to-sand-100/80 noise">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-80" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-[30rem] w-[30rem] rounded-full glow-brass opacity-50 blur-3xl animate-aurora"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full glow-emerald opacity-40 blur-3xl animate-drift"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brass-300/60 to-transparent" />

        <div className="relative grid items-center gap-12 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:py-20 xl:px-14">
          {/* Copy */}
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-brass-300/70 bg-white/70 py-1 pl-1 pr-3 text-[10.5px] font-bold text-brass-900 shadow-soft backdrop-blur">
                <span className="inline-flex items-center gap-1 rounded-full bg-brass-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-ink-950">
                  <Award className="h-2.5 w-2.5" /> Bal Vigyan
                </span>
                {copy.heroBadge}
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-[2.35rem] leading-[1.04] tracking-[-0.02em] text-ink-950 sm:text-[3.25rem] lg:text-[3.5rem] xl:text-[3.9rem]">
                {copy.heroTitleA}
                <br />
                <span className="text-gradient-forest italic">{copy.heroTitleB}</span>
                <br />
                {copy.heroTitleC}
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500">
                {copy.heroBody}
              </p>
            </Reveal>

            <Reveal delay={230}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => onNavigate('create-account')}
                  className="btn btn-primary btn-lg group w-full sm:w-auto"
                >
                  <span>{copy.ctaPrimary}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="btn btn-outline btn-lg group w-full sm:w-auto"
                >
                  <PlayCircle className="h-4 w-4 text-forest-700" />
                  <span>{copy.ctaSecondary}</span>
                </button>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" /> {copy.trustNoResale}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" /> {copy.trustAnyPhone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" /> {copy.trustBilingual}
                </span>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-sand-200 bg-white/60 px-4 py-3 backdrop-blur">
                <span className="text-[11px] font-medium text-ink-500">
                  {copy.judgePrompt}
                </span>
                <button
                  onClick={onEnterJudgeDemo}
                  className="group inline-flex items-center gap-1.5 text-[11px] font-bold text-forest-800 transition-colors hover:text-forest-900 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brass-500" />
                  {copy.judgeLink}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </Reveal>
          </div>

          {/* Pass preview */}
          <Reveal direction="scale" delay={200} className="relative">
            <PassPreview />
          </Reveal>
        </div>
      </section>

      {lang === 'hi' && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brass-200 bg-brass-50/70 px-4 py-3">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brass-200/70 text-brass-800">
            <Languages className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11.5px] leading-relaxed text-brass-900">{copy.homeDeeperNotice}</p>
        </div>
      )}

      {/* ================= COMPLIANCE MARQUEE ================= */}
      <section className="marquee-mask mt-10 overflow-hidden border-y border-sand-200 bg-white/70 py-3.5">
        <div className="marquee-track items-center gap-0">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {compliance.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex shrink-0 items-center gap-2.5 px-6 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400"
                >
                  <span className="h-1 w-1 rounded-full bg-brass-400" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="mt-16">
        <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: 90, suffix: '%', label: 'of India’s workforce is informal', hint: 'No written wage record' },
            { value: 4, suffix: '', label: 'skill categories priced', hint: 'Statutory MP wage bands' },
            { value: 100, suffix: '%', label: 'of changes hashed', hint: 'SHA-256 chained events' },
            { value: 0, suffix: '', label: 'personal data in the QR', hint: 'Opaque reference only' },
          ].map((stat, index) => (
            <Reveal key={stat.label} delay={index * 90} className="bg-sand-50 p-6 sm:p-7">
              <p className="font-display text-[2.25rem] font-semibold leading-none text-ink-950">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-[12.5px] font-bold leading-snug text-ink-700">{stat.label}</p>
              <p className="mt-1 text-[10.5px] leading-snug text-ink-400">{stat.hint}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= TWO PORTALS ================= */}
      <section className="mt-20">
        <SectionHeading
          eyebrow="Two portals, one trusted record"
          title={
            <>
              Built for both sides of a <span className="italic text-forest-700">handshake</span>
            </>
          }
          description="Exploitation thrives on asymmetric records. Shram Setu gives workers and contractors the same immutable ledger — so neither side has to argue about what happened."
        />

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 lg:gap-8">
          {/* Worker */}
          <Reveal direction="left">
            <SpotlightCard className="group flex h-full flex-col justify-between rounded-[1.5rem] border border-sand-200 bg-white p-7 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:border-forest-200 hover:shadow-lift sm:p-9">
              <div>
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 text-white shadow-[0_16px_30px_-18px_rgba(22,58,43,0.9)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-4deg]">
                    <Users className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-forest-800">
                    For workers
                  </span>
                </div>

                <h3 className="mt-6 text-[1.35rem] leading-snug text-ink-950">
                  Own the proof of every day you worked
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-500">
                  No more contractor diaries that vanish at settlement. Your muster, overtime and
                  advances live in a record you can show to any authority.
                </p>

                <ul className="mt-6 space-y-3">
                  {[
                    ['Permanent QR pass', 'One reusable credential with zero private data.'],
                    ['Plain-language khata', 'Earned, advanced, due — explained line by line.'],
                    ['Approval control', 'A contractor cannot finalise a shift without you.'],
                    ['Samadhan grievances', 'Structured statutory filing under MP BOCW norms.'],
                  ].map(([title, body]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-ink-500">
                        <strong className="font-bold text-ink-800">{title} — </strong>
                        {body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onNavigate('create-account')}
                className="btn btn-primary mt-8 w-full justify-between"
              >
                <span>Register as a worker</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </SpotlightCard>
          </Reveal>

          {/* Contractor */}
          <Reveal direction="right">
            <SpotlightCard className="group flex h-full flex-col justify-between rounded-[1.5rem] border border-sand-200 bg-gradient-to-b from-ink-950 to-ink-900 p-7 text-white shadow-[0_30px_60px_-40px_rgba(8,19,15,0.9)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float sm:p-9">
              <div>
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-brass-300 ring-1 ring-inset ring-white/15 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[4deg]">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-sand-200/70">
                    For contractors
                  </span>
                </div>

                <h3 className="mt-6 text-[1.35rem] leading-snug text-white">
                  Run a compliant muster with no paperwork
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-sand-200/60">
                  Replace the khata diary with a live site register that settles disputes before
                  they start — and produces audit-ready evidence on demand.
                </p>

                <ul className="mt-6 space-y-3">
                  {[
                    ['Instant pass scanning', 'Scan worker passes with your phone camera.'],
                    ['Verified disbursements', 'Payments recorded with worker acknowledgement.'],
                    ['Contact cross-check', 'Mutual telephonic checks with timestamps.'],
                    ['Audit-ready exports', 'Tamper-evident reports for labour inspections.'],
                  ].map(([title, body]) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 text-brass-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-sand-200/70">
                        <strong className="font-bold text-white">{title} — </strong>
                        {body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onNavigate('create-account')}
                className="btn btn-gold mt-8 w-full justify-between"
              >
                <span>Register as a contractor</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      {/* ================= HOW THE RECORD IS BUILT ================= */}
      <section className="relative mt-24 overflow-hidden rounded-[2rem] border border-sand-200 bg-white px-6 py-14 sm:px-10 sm:py-16 noise">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full glow-brass opacity-30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              align="left"
              eyebrow="The chain of custody"
              title="A shift becomes a record in four verifiable steps"
              description="Each step writes a signed event. Break one link and the audit bench shows exactly where the chain snapped."
            />
            <button
              onClick={() => onNavigate('how-it-works')}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-[11.5px] font-bold text-ink-700 transition-colors hover:border-forest-300 hover:text-forest-800 cursor-pointer"
            >
              Full workflow
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="relative mt-12">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-[2.15rem] hidden h-px lg:block">
              <svg className="h-px w-full overflow-visible" aria-hidden="true">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="url(#stepGradient)"
                  strokeWidth="1.5"
                  className="flow-line"
                />
                <defs>
                  <linearGradient id="stepGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8bc7a6" stopOpacity="0.2" />
                    <stop offset="45%" stopColor="#358b62" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#d9a844" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.num} delay={index * 110} className="group relative">
                    <div className="relative flex h-full flex-col rounded-2xl border border-sand-200 bg-sand-50/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-forest-200 hover:bg-white hover:shadow-lift">
                      <div className="flex items-center justify-between">
                        <span className="relative grid h-11 w-11 place-items-center rounded-xl border border-sand-200 bg-white text-forest-700 shadow-soft transition-colors duration-500 group-hover:border-forest-300 group-hover:bg-forest-800 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-300">
                          {step.num}
                        </span>
                      </div>
                      <h4 className="mt-5 text-[14px] font-bold text-ink-900">{step.title}</h4>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">{step.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= ENGINEERING STANDARDS ================= */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="Engineering standards"
          title="Four guarantees that are enforced in code, not in a policy PDF"
          description="Every rule below is implemented, tested and visible in the audit bench."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: QrCode,
              title: 'Zero-PII QR',
              body: 'The pass carries an opaque reference only. No Aadhaar, no phone number, no balance — a photo of the card reveals nothing.',
              tag: 'Privacy',
            },
            {
              icon: Lock,
              title: 'SHA-256 chain',
              body: 'Each muster and payment event hashes the previous one. A backdated edit breaks the chain instantly and is flagged.',
              tag: 'Integrity',
            },
            {
              icon: Scale,
              title: 'Integer-paise engine',
              body: 'Statutory MP wage bands and pro-rata overtime computed in paise — no rounding drift, no silent deductions.',
              tag: 'Fairness',
            },
            {
              icon: FileCheck2,
              title: 'Written acknowledgement',
              body: 'A payment is only “settled” once the worker confirms receipt. Silence never counts as agreement.',
              tag: 'Consent',
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 90}>
                <SpotlightCard className="group relative flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-forest-200 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-forest-50 to-sand-100 text-forest-700 ring-1 ring-inset ring-forest-100 transition-colors group-hover:from-forest-700 group-hover:to-forest-900 group-hover:text-white group-hover:ring-forest-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-300">
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="mt-5 text-[14px] font-bold text-ink-900">{item.title}</h4>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-500">{item.body}</p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================= FIELD STORY ================= */}
      <section className="mt-24 overflow-hidden rounded-[2rem] border border-sand-200 bg-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[18rem] overflow-hidden">
            <img
              src="/assets/images/construction_site_muster_1792385014214.jpg"
              alt="Site supervisors reviewing a digital muster roll on a tablet at a Madhya Pradesh infrastructure project"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ink-900 backdrop-blur">
                  <MapPin className="h-3 w-3 text-forest-700" /> Indore Metro corridor
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ink-900 backdrop-blur">
                  <Clock className="h-3 w-3 text-brass-600" /> Field-tested on site
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12">
            <Reveal>
              <span className="eyebrow text-forest-700">Why it matters</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 text-[1.75rem] leading-tight text-ink-950 sm:text-[2.1rem]">
                A wage dispute is usually a{' '}
                <span className="italic text-forest-700">memory</span> dispute.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-500">
                Paper muster rolls are kept by the party that benefits from the ambiguity. When a
                worker says “I worked eleven days” and the register says eight, there is nothing to
                inspect — only two accounts.
              </p>
            </Reveal>
            <Reveal delay={210}>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
                Shram Setu replaces the contested page with a shared, signed timeline: the shift is
                requested by the site, approved on the worker's phone, priced by statute, and sealed
                in a hash chain that neither party can rewrite alone.
              </p>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Smartphone, label: 'Works on a ₹6,000 phone' },
                  { icon: Link2, label: 'e-Shram & BOCW ready' },
                  { icon: ShieldCheck, label: 'No data resale' },
                  { icon: CheckCircle2, label: 'Hindi-first interface' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2.5 text-[11.5px] font-semibold text-ink-700"
                    >
                      <Icon className="h-3.5 w-3.5 text-forest-700" />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mt-24 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Questions workers ask"
            title="Straight answers, no fine print"
            description="If something here is unclear, call the helpline — a human will walk you through it in Hindi or English."
          />
          <Reveal delay={200}>
            <a
              href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
              className="btn btn-outline mt-7 w-full sm:w-auto"
            >
              <PhoneCall className="h-4 w-4 text-forest-700" />
              {APP_CONFIG.CONTACT_PHONE_DISPLAY}
            </a>
          </Reveal>
        </div>

        <Reveal direction="right" delay={100}>
          <Accordion items={faqs} />
        </Reveal>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative mt-24 overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 px-6 py-14 text-white sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full glow-brass opacity-40 blur-3xl animate-aurora"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full glow-emerald opacity-40 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <Reveal>
              <span className="eyebrow eyebrow-center text-brass-300">Start in under two minutes</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 text-[1.9rem] leading-[1.1] text-white sm:text-[2.6rem]">
                {copy.ctaTitleA}{' '}
                <span className="text-gradient italic">{copy.ctaTitleB}</span>.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-4 text-[13px] leading-relaxed text-sand-200/65">{copy.ctaBody}</p>
            </Reveal>
          </div>

          <Reveal delay={200} className="w-full max-w-sm">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNavigate('create-account')}
                className="btn btn-gold btn-lg group w-full justify-between"
              >
                <span>{copy.ctaCreate}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate('sign-in')}
                className="btn btn-lg w-full border border-white/20 bg-white/5 text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                {copy.ctaSignIn}
              </button>
              <a
                href={APP_CONFIG.WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center justify-center gap-2 text-[11px] font-semibold text-sand-200/60 transition-colors hover:text-white"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {copy.ctaWhatsApp}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};
