import React from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle,
  Calculator,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  FileCheck2,
  HelpCircle,
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { PageHeader } from '../ui/PageHeader';
import { Reveal } from '../ui/Reveal';
import { LanguageNotice } from '../ui/LanguageNotice';
import { SectionHeading } from '../ui/SectionHeading';
import { SpotlightCard } from '../ui/SpotlightCard';

interface HowItWorksProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

const STEPS = [
  {
    num: '01',
    title: 'A permanent worker pass is issued',
    desc: 'Each registered worker receives one reusable, printable QR pass. The code carries strictly an opaque reference — no Aadhaar, no phone number, no wage balance.',
    detail: 'Issued once · never expires · reprint any time',
    icon: QrCode,
  },
  {
    num: '02',
    title: 'Mutual phone contact cross-check',
    desc: 'Before a working relationship begins, both contractor and worker verify each other’s mobile contact through a manual check that is logged with a timestamp and an outcome.',
    detail: 'Confirmed · mismatch · unreachable',
    icon: UserCheck,
  },
  {
    num: '03',
    title: 'The site scans the pass',
    desc: 'The contractor scans the pass with a phone camera. Instead of silently writing a muster entry, Shram Setu creates a pending approval request on the worker’s account.',
    detail: 'Geofence radius and site ID captured',
    icon: Smartphone,
  },
  {
    num: '04',
    title: 'The worker approves the shift',
    desc: 'The worker opens their own dashboard and verifies the date, site, hours and agreed rate. Only after that confirmation is the shift priced and written to the ledger.',
    detail: 'Approval · rejection with reason · suspicious report',
    icon: CheckCircle,
  },
  {
    num: '05',
    title: 'Wages are computed by statute',
    desc: 'The engine calculates pro-rata overtime under the MP Minimum Wages Act in integer paise. Advances and deductions are recorded separately and never silently netted.',
    detail: 'Unskilled · semi-skilled · skilled · highly skilled',
    icon: Calculator,
  },
  {
    num: '06',
    title: 'The audit trail is sealed',
    desc: 'Every muster punch, wage credit, disbursement and resolution is hashed into a sequential SHA-256 chain. Alter any past entry and the break is visible immediately.',
    detail: 'Chained hashes · verifiable offline',
    icon: Lock,
  },
];

const GUARANTEES = [
  {
    icon: PhoneCall,
    title: 'A human always answers',
    body: 'Every screen shows the same helpline. A worker who cannot read the interface can call and be walked through it.',
  },
  {
    icon: FileCheck2,
    title: 'Conflict resolved before payment',
    body: 'Disputes are filed against the same record both parties signed, so the conversation starts from shared facts.',
  },
  {
    icon: ShieldCheck,
    title: 'No hidden scoring',
    body: 'There is no credit score, no blacklist and no automated penalty. Only the entries you and your site approved.',
  },
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate, lang }) => {
  return (
    <div className="pb-4">
      <LanguageNotice lang={lang} />

      <PageHeader
        eyebrow="Transparent workflow"
        icon={<ShieldCheck className="h-5 w-5" />}
        title={
          <>
            From the first site check-in to a{' '}
            <span className="italic text-forest-700">final settlement</span>
          </>
        }
        description="Six mutual confirmations replace a contested paper register. Nothing here is automatic on the part of an employer — every step requires a second signature."
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {['No hardware needed', 'Works offline', 'Hindi + English', 'Free for workers'].map(
            (tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white/80 px-3 py-1.5 text-[10.5px] font-bold text-ink-600 backdrop-blur"
              >
                <CheckCircle className="h-3 w-3 text-forest-600" />
                {tag}
              </span>
            )
          )}
        </div>
      </PageHeader>

      {/* Timeline */}
      <section className="relative mx-auto max-w-4xl">
        <div
          className="absolute left-[1.4375rem] top-4 bottom-12 w-px bg-gradient-to-b from-brass-300/70 via-forest-300/60 to-transparent sm:left-[1.9375rem]"
          aria-hidden="true"
        />

        <ol className="space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.num} as="li" delay={index * 70} direction="left">
                <div className="group relative flex gap-4 sm:gap-6">
                  <div className="relative z-10 shrink-0">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-sand-200 bg-white text-forest-700 shadow-soft transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-forest-300 group-hover:bg-forest-800 group-hover:text-white group-hover:shadow-lift sm:h-16 sm:w-16">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                  </div>

                  <SpotlightCard className="flex-1 rounded-2xl border border-sand-200 bg-white p-5 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-forest-200 group-hover:shadow-lift sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-brass-600">
                        STEP {step.num}
                      </span>
                      <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[9.5px] font-semibold text-ink-500">
                        {step.detail}
                      </span>
                    </div>
                    <h2 className="mt-2 text-[15px] leading-snug text-ink-950 sm:text-base">
                      {step.title}
                    </h2>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">{step.desc}</p>
                  </SpotlightCard>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </section>

      {/* What it does not do */}
      <section className="mt-20">
        <SectionHeading
          eyebrow="Honest boundaries"
          title="What Shram Setu deliberately does not do"
          description="A tool people trust should be explicit about its limits. These are enforced design decisions, not roadmap gaps."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {GUARANTEES.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 90}>
                <div className="h-full rounded-2xl border border-sand-200 bg-sand-50/80 p-5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-forest-700 shadow-soft">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-4 text-[13px] font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">{item.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brass-200 bg-brass-50/70 p-4">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-brass-700" />
            <p className="text-[11.5px] leading-relaxed text-brass-900">
              <strong className="font-bold">Shram Setu is not a government portal.</strong> It is an
              independent transparency project built to align with MP labour statutes and e-Shram /
              BOCW workflows. It does not replace statutory registration, and it does not verify
              identity.
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative mt-20 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 px-6 py-12 text-white sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full glow-brass opacity-40 blur-3xl animate-aurora"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-lg">
            <h2 className="text-[1.75rem] leading-tight text-white sm:text-[2.1rem]">
              Ready to see your own wage khata?
            </h2>
            <p className="mt-3 text-[12.5px] leading-relaxed text-sand-200/65">
              Create a free account — worker or contractor — and the platform starts empty, with your
              name on it and nothing else.
            </p>
          </div>
          <div className="flex w-full max-w-xs flex-col gap-2.5">
            <button
              onClick={() => onNavigate('create-account')}
              className="btn btn-gold w-full justify-between"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('sign-in')}
              className="btn w-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
