import React from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  Scale,
  FileText,
  CheckCircle2,
  XCircle,
  Database,
  Trash2,
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { PageHeader } from '../ui/PageHeader';
import { Reveal } from '../ui/Reveal';
import { LanguageNotice } from '../ui/LanguageNotice';

interface PrivacyProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

const NEVER = [
  'Aadhaar or national biometric identifiers',
  'Mobile phone numbers or residential addresses',
  'Bank account numbers, IFSC codes or UPI IDs',
  'Accumulated wage balances or transaction amounts',
  'Personal attendance logs or dispute filings',
];

const SECTIONS = [
  {
    id: 'qr',
    icon: Lock,
    title: 'Zero-PII QR standard',
    body: (
      <>
        <p>
          Shram Setu guarantees that no personally identifiable information is encoded directly into
          a worker QR pass. The code encodes exclusively an opaque, unguessable token that resolves to
          a record on the host network.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-forest-200 bg-forest-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-forest-800">
              <CheckCircle2 className="h-3.5 w-3.5" /> Encoded
            </p>
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-forest-900/80">
              <li>Opaque reference token</li>
              <li>Issue date</li>
              <li>Integrity checksum</li>
            </ul>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-800">
              <XCircle className="h-3.5 w-3.5" /> Never encoded
            </p>
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-rose-900/80">
              {NEVER.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'phone',
    icon: UserCheck,
    title: 'Mobile number & mutual verification',
    body: (
      <>
        <p>
          Mobile numbers are collected during registration solely to provide a human cross-check
          between workers and authorised contractors. They are only shown to counterparts who have
          mutually joined the same site or shift.
        </p>
        <p className="mt-2">
          Cross-checks record the timestamp, reporting party and outcome — confirmed match, details
          mismatch or unreachable.
        </p>
        <div className="mt-3 rounded-xl border border-brass-200 bg-brass-50/70 p-3.5 text-[11px] leading-relaxed text-brass-900">
          <strong className="font-bold">Legal clarification:</strong> mutual manual phone checks are
          human cross-checks between workplace counterparts. They do <strong>not</strong> constitute
          statutory identity verification, biometric authentication or definitive proof of legal
          identity.
        </div>
      </>
    ),
  },
  {
    id: 'scoping',
    icon: Database,
    title: 'Role-based scoping & isolation',
    body: (
      <p>
        Workers can only access their own work records, wage balances and disputes. Contractors
        cannot inspect records of workers outside their authorised assignments. Newly created
        accounts start empty and never inherit demonstration data.
      </p>
    ),
  },
  {
    id: 'credentials',
    icon: EyeOff,
    title: 'Password & credential security',
    body: (
      <p>
        Passwords are handled by the authentication provider (Supabase Auth when configured) and are
        never stored in localStorage, sessionStorage or IndexedDB. The optional “Remember my login
        ID” feature stores only the public identifier, never the password.
      </p>
    ),
  },
  {
    id: 'audit',
    icon: FileText,
    title: 'Non-repudiable audit log',
    body: (
      <p>
        Critical transitions — muster punches, payouts, acknowledgements and dispute filings — are
        written into a sequential SHA-256 hash chain. Historical wage records cannot be altered
        retroactively without immediate detection by an auditor.
      </p>
    ),
  },
  {
    id: 'retention',
    icon: Trash2,
    title: 'Retention & your controls',
    body: (
      <>
        <p>
          Records live primarily in your browser (IndexedDB) and are mirrored to the configured cloud
          backend when one exists. You can export a complete JSON backup at any time from the audit
          bench, and clearing your browser storage removes the local copy.
        </p>
        <p className="mt-2">
          To request deletion of a cloud copy, contact the helpline with your registered mobile
          number. Accounts and statutory records may be retained where labour law requires it.
        </p>
      </>
    ),
  },
];

export const Privacy: React.FC<PrivacyProps> = ({ onNavigate, lang }) => {
  return (
    <div className="pb-4">
      <LanguageNotice lang={lang} />

      <PageHeader
        eyebrow="Informal worker privacy framework"
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Privacy and data use, in plain language"
        description="Written to be read by the person it protects — not only by a lawyer. Effective for Shram Setu 2.0 · Senior Bal Vigyan Indore Innovation."
      >
        <div className="flex flex-wrap gap-2">
          {[
            'Zero-PII QR',
            'No data resale',
            'Local-first storage',
            'Export any time',
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-forest-200 bg-forest-50 px-3 py-1.5 text-[10.5px] font-bold text-forest-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.32fr_1fr] lg:gap-12">
        {/* Sticky index */}
        <nav aria-label="Sections" className="hidden lg:block">
          <div className="sticky top-28 space-y-1">
            <p className="mb-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-ink-400">
              On this page
            </p>
            {SECTIONS.map((section, index) => (
              <a
                key={section.id}
                href={`#privacy-${section.id}`}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11.5px] font-semibold text-ink-500 transition-colors hover:bg-white hover:text-forest-800"
              >
                <span className="font-mono text-[9.5px] text-ink-300 group-hover:text-brass-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          {SECTIONS.map((section, index) => {
            const Icon = section.icon;
            return (
              <Reveal key={section.id} delay={index * 60}>
                <section
                  id={`privacy-${section.id}`}
                  className="scroll-mt-28 rounded-2xl border border-sand-200 bg-white p-6 shadow-soft sm:p-7"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest-50 to-sand-100 text-forest-700 ring-1 ring-inset ring-forest-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[9.5px] font-bold tracking-[0.2em] text-ink-300">
                        SECTION {String(index + 1).padStart(2, '0')}
                      </p>
                      <h2 className="mt-1 text-[15px] leading-snug text-ink-950">{section.title}</h2>
                    </div>
                  </div>
                  <div className="mt-3 text-[12px] leading-relaxed text-ink-500">{section.body}</div>
                </section>
              </Reveal>
            );
          })}

          <Reveal delay={80}>
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-sand-200 bg-sand-100/60 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <Scale className="mt-0.5 h-5 w-5 shrink-0 text-forest-700" />
                <div>
                  <p className="text-[12.5px] font-bold text-ink-900">Questions about your data?</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">
                    Ask before you register — nothing is created until you submit the form.
                  </p>
                </div>
              </div>
              <button onClick={() => onNavigate('help')} className="btn btn-primary btn-sm shrink-0">
                Contact the team
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};
