import React from 'react';
import {
  Award,
  MapPin,
  Scale,
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Target,
  BookOpen,
  HeartHandshake,
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { PageHeader } from '../ui/PageHeader';
import { Reveal } from '../ui/Reveal';
import { LanguageNotice } from '../ui/LanguageNotice';
import { SectionHeading } from '../ui/SectionHeading';
import { CountUp } from '../ui/CountUp';

interface AboutProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

const PRINCIPLES = [
  {
    icon: Users,
    title: 'Worker-first defaults',
    body: 'Hindi is the default language, the helpline is on every screen, and no feature depends on the worker owning a smartphone beyond a basic browser.',
  },
  {
    icon: Scale,
    title: 'Statute over opinion',
    body: 'Wage maths follows the MP Minimum Wages Act bands. The platform never invents a rate, and every computed figure can be traced back to a published band.',
  },
  {
    icon: BookOpen,
    title: 'Inspectable by design',
    body: 'The cryptographic audit bench is a public part of the demo. Judges, officers and workers can all run the same verification, not just the author.',
  },
  {
    icon: HeartHandshake,
    title: 'No extraction',
    body: 'There is no data resale, no credit scoring and no paid tier for workers. Records belong to the worker who generated them.',
  },
];

export const About: React.FC<AboutProps> = ({ onNavigate, lang }) => {
  return (
    <div className="pb-4">
      <LanguageNotice lang={lang} />

      <PageHeader
        eyebrow="About the project"
        icon={<Award className="h-5 w-5" />}
        title={
          <>
            Built in Indore, for the people who{' '}
            <span className="italic text-forest-700">build Indore</span>
          </>
        }
        description="Shram Setu began as a field observation: the only record of a construction worker's month is a diary kept by the person who owes them money. This is our attempt to give both sides the same page."
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brass-300/70 bg-brass-50/80 px-3 py-1.5 text-[10.5px] font-bold text-brass-900">
            <Award className="h-3 w-3" /> Senior Bal Vigyan · Division II
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white/80 px-3 py-1.5 text-[10.5px] font-bold text-ink-600">
            <MapPin className="h-3 w-3 text-forest-700" /> Indore, Madhya Pradesh
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white/80 px-3 py-1.5 text-[10.5px] font-bold text-ink-600">
            <Sparkles className="h-3 w-3 text-brass-600" /> Applied digital solutions
          </span>
        </div>
      </PageHeader>

      {/* Origin story */}
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div className="prose-editorial space-y-5">
          <Reveal>
            <span className="eyebrow text-forest-700">Genesis</span>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="text-[1.6rem] leading-snug text-ink-950 sm:text-[1.9rem]">
              The dispute was never about money. It was about evidence.
            </h2>
          </Reveal>
          <Reveal delay={130}>
            <p>
              Shram Setu was conceived during field inquiries at civil construction sites across
              Indore. Over <strong>85% of India’s construction workforce</strong> operates in the
              unorganised sector — vulnerable to delayed payments, arbitrary muster cuts and denial of
              overtime.
            </p>
          </Reveal>
          <Reveal delay={190}>
            <p>
              Contractor diaries and paper muster rolls are frequently withheld, lost or altered
              exactly when weekly settlements fall due. A worker has no independent, verifiable
              record to enforce rights under the{' '}
              <strong>Madhya Pradesh Minimum Wages Act, 1948</strong> — and a contractor has no
              defence against inflated claims either.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <p>
              The 2.0 architecture replaces the contested page with a shared, signed timeline: a site
              requests a shift, the worker approves it on their own device, statute prices it, and a
              hash chain seals it. Neither party can rewrite it alone.
            </p>
          </Reveal>
        </div>

        <Reveal direction="right" delay={120} className="space-y-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
            <p className="font-display text-[2.5rem] font-semibold leading-none text-ink-950">
              <CountUp value={85} suffix="%" />
            </p>
            <p className="mt-2 text-[12px] font-bold text-ink-700">
              of India’s construction workforce is informal
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink-400">
              No written wage record, no portable employment history.
            </p>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
            <p className="font-display text-[2.5rem] font-semibold leading-none text-ink-950">
              <CountUp value={4} />
            </p>
            <p className="mt-2 text-[12px] font-bold text-ink-700">
              statutory wage bands encoded
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink-400">
              Unskilled to highly skilled, with pro-rata overtime.
            </p>
          </div>
          <div className="rounded-2xl border border-forest-200 bg-forest-50/70 p-6">
            <Target className="h-5 w-5 text-forest-700" />
            <p className="mt-3 text-[12px] font-bold text-forest-900">One portable record</p>
            <p className="mt-1 text-[11px] leading-relaxed text-forest-800/80">
              The same pass should eventually travel between sites, contractors and states — so a
              career can be proven, not just a month.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Principles */}
      <section className="mt-20">
        <SectionHeading
          eyebrow="Design principles"
          title="Four rules we refuse to trade away"
          description="Every product decision is checked against these. If a feature breaks one, it does not ship."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 80}>
                <div className="group flex h-full gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-forest-200 hover:shadow-lift">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest-50 to-sand-100 text-forest-700 ring-1 ring-inset ring-forest-100 transition-colors group-hover:from-forest-700 group-hover:to-forest-900 group-hover:text-white">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-bold text-ink-900">{item.title}</h3>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Compliance */}
      <section className="mt-20 overflow-hidden rounded-[1.75rem] border border-sand-200 bg-white">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 p-8 text-white sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
            <div className="relative">
              <Scale className="h-6 w-6 text-brass-300" />
              <h2 className="mt-4 text-[1.4rem] leading-snug text-white">
                Statutory welfare alignment
              </h2>
              <p className="mt-3 text-[12px] leading-relaxed text-sand-200/65">
                The platform is designed to bridge workers into existing welfare programmes rather
                than replace them.
              </p>
              <div className="mt-6 space-y-2">
                {['e-Shram NDUW', 'MP BOCW Welfare Board', 'Direct Benefit Transfer'].map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-semibold text-sand-200/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brass-400" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <ul className="space-y-4">
              {[
                [
                  'e-Shram National Database of Unorganised Workers',
                  'Connects worker UAN credentials to authentic employment muster histories instead of self-declared months.',
                ],
                [
                  'MP BOCW Welfare Board',
                  'Generates tamper-evident 90-day attendance certificates required for accident insurance, maternity benefits and children’s education assistance.',
                ],
                [
                  'Direct Benefit Transfer',
                  'Records bank accounts and UPI receipts so disbursements can be audited rather than asserted.',
                ],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="text-[11.5px] leading-relaxed text-ink-500">
                    <strong className="block text-[12px] font-bold text-ink-900">{title}</strong>
                    {body}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-start gap-2.5 rounded-xl border border-brass-200 bg-brass-50/70 p-3.5">
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-700" />
              <p className="text-[10.5px] leading-relaxed text-brass-900">
                An independent innovation project — not an official government portal. Registration
                with e-Shram and the BOCW board remains mandatory and separate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <Reveal delay={80}>
        <section className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl border border-sand-200 bg-sand-100/60 px-6 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-[1.2rem] leading-snug text-ink-950">
              Want to see the audit trail in person?
            </h2>
            <p className="mt-1 text-[11.5px] text-ink-500">
              Judge demo mode loads a full Indore dataset with the cryptographic bench unlocked.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button onClick={() => onNavigate('how-it-works')} className="btn btn-outline btn-sm">
              How it works
            </button>
            <button onClick={() => onNavigate('help')} className="btn btn-primary btn-sm">
              Contact the team
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </Reveal>
    </div>
  );
};
