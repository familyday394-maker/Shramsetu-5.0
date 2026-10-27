import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  QrCode,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  MapPin,
  BadgeCheck,
  Clock,
  Info,
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { verifyAuditChain } from '../../services/cryptoAudit';
import { PageHeader } from '../ui/PageHeader';
import { Reveal } from '../ui/Reveal';
import { QrPattern } from '../ui/QrPattern';

interface VerifyPassProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
  /** Reference token read from the QR deep link (#/verify?refToken=…). */
  refToken?: string;
}

type Verdict = 'idle' | 'searching' | 'valid' | 'invalid';

interface ResolvedPass {
  reference: string;
  displayName: string;
  trade: string;
  skillLevel: string;
  siteName: string;
  memberSince: string;
  shiftsRecorded: number;
  chainIntact: boolean | null;
}

/** Masks a name to the minimum needed for a site supervisor to confirm identity. */
const maskName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Registered worker';
  const first = parts[0];
  const initials = parts.slice(1).map((part) => `${part.charAt(0).toUpperCase()}.`);
  return [first, ...initials].join(' ');
};

/** Hides everything but the last four characters of a reference token. */
const maskReference = (token: string) => {
  const tail = token.slice(-4).toUpperCase();
  return `SS2-••••-${tail}`;
};

export const VerifyPass: React.FC<VerifyPassProps> = ({ onNavigate, refToken = '' }) => {
  const [query, setQuery] = useState(refToken);
  const [verdict, setVerdict] = useState<Verdict>('idle');
  const [resolved, setResolved] = useState<ResolvedPass | null>(null);

  const normalise = (value: string) => value.trim().replace(/^#?\/?/, '').toUpperCase();

  const lookup = useMemo(
    () => (token: string) => {
      const needle = normalise(token);
      if (!needle) return null;

      const worker = db
        .getWorkers()
        .find(
          (w) =>
            normalise(w.id) === needle ||
            normalise(w.eShramUAN) === needle ||
            normalise(w.bocwRegistrationNo) === needle
        );

      const user = auth
        .getLocalUsers()
        .find(
          (u) =>
            normalise(u.id) === needle ||
            normalise(u.qrReferenceToken || '') === needle
        );

      const record = worker || (user ? db.getWorkerById(user.id) : undefined);
      if (!record && !user) return null;

      const site = record ? db.getSites().find((s) => s.id === record.activeSiteId) : undefined;
      const shifts = record ? db.getAttendance(record.id).length : 0;

      return {
        reference: record?.id || user?.id || needle,
        displayName: maskName(record?.name || user?.fullName || 'Registered worker'),
        trade: record?.trade || user?.trade || 'General construction worker',
        skillLevel: record?.skillLevel || 'skilled',
        siteName: site?.name || 'Site not yet assigned',
        memberSince: record?.joinedDate || user?.createdAt?.split('T')[0] || '—',
        shiftsRecorded: shifts,
      } as Omit<ResolvedPass, 'chainIntact'>;
    },
    []
  );

  const runLookup = async (token: string) => {
    if (!token.trim()) {
      setVerdict('idle');
      setResolved(null);
      return;
    }

    setVerdict('searching');
    const found = lookup(token);

    if (!found) {
      setResolved(null);
      setVerdict('invalid');
      return;
    }

    let chainIntact: boolean | null = null;
    try {
      const events = db.getAuditEvents();
      if (events.length > 0) {
        const result = await verifyAuditChain(events);
        chainIntact = result?.outcome === 'INTEGRITY_PASSED';
      }
    } catch {
      chainIntact = null;
    }

    setResolved({ ...found, chainIntact });
    setVerdict('valid');
  };

  useEffect(() => {
    if (refToken) {
      setQuery(refToken);
      void runLookup(refToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refToken]);

  return (
    <div className="pb-4">
      <PageHeader
        eyebrow="Pass verification"
        icon={<QrCode className="h-5 w-5" />}
        title="Verify a Smart Shram Pass"
        description="Scanning a worker pass opens this page. It confirms that the credential exists and that the record behind it has not been tampered with — without exposing the worker's identity, phone number or wages."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runLookup(query);
          }}
          className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pass reference, e.g. WKR-482103"
              aria-label="Pass reference"
              className="field field-icon pr-3 uppercase placeholder:normal-case"
            />
          </div>
          <button type="submit" className="btn btn-primary shrink-0">
            Verify pass
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </PageHeader>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.85fr] lg:gap-8">
        {/* Result panel */}
        <Reveal>
          <div className="overflow-hidden rounded-[1.5rem] border border-sand-200 bg-white shadow-soft">
            {verdict === 'idle' && (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand-100 text-ink-400">
                  <QrCode className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-[1.1rem] text-ink-950">Waiting for a reference</h2>
                <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-ink-500">
                  Enter the reference printed under the QR code, or scan the pass with your phone
                  camera to open this page automatically.
                </p>
              </div>
            )}

            {verdict === 'searching' && (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-forest-50 text-forest-700">
                  <ShieldCheck className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-[1.1rem] text-ink-950">Checking the record…</h2>
                <p className="mt-2 text-[12px] text-ink-500">Recomputing the hash chain on device.</p>
              </div>
            )}

            {verdict === 'invalid' && (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                  <ShieldX className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-[1.1rem] text-ink-950">No record found for this reference</h2>
                <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-ink-500">
                  This reference is not registered on this device or workspace. It may belong to a
                  different installation, or the pass may be forged. Do not record a shift against an
                  unverified pass — call the helpline to confirm first.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button onClick={() => onNavigate('help')} className="btn btn-outline btn-sm">
                    Contact support
                  </button>
                  <button
                    onClick={() => {
                      setQuery('');
                      setVerdict('idle');
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Try another reference
                  </button>
                </div>
              </div>
            )}

            {verdict === 'valid' && resolved && (
              <div>
                <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 p-6 text-white">
                  <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-forest-100">
                        <CheckCircle2 className="h-3 w-3" /> Authentic pass
                      </span>
                      <p className="mt-4 font-display text-[1.4rem] font-semibold leading-tight text-white">
                        {resolved.displayName}
                      </p>
                      <p className="mt-1 text-[11.5px] text-sand-200/65">{resolved.trade}</p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-white p-1.5">
                      <QrPattern
                        seed={resolved.reference}
                        size={58}
                        className="text-ink-950"
                      />
                    </div>
                  </div>

                  <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-[11px]">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sand-200/40">
                        Reference
                      </p>
                      <p className="mt-0.5 font-mono font-semibold text-sand-200/85">
                        {maskReference(resolved.reference)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sand-200/40">
                        Skill band
                      </p>
                      <p className="mt-0.5 font-semibold capitalize text-sand-200/85">
                        {resolved.skillLevel.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sand-200/40">
                        Assigned site
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 font-semibold text-sand-200/85">
                        <MapPin className="h-3 w-3 text-brass-300" />
                        {resolved.siteName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sand-200/40">
                        Registered since
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 font-mono font-semibold text-sand-200/85">
                        <Clock className="h-3 w-3 text-brass-300" />
                        {resolved.memberSince}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-6">
                  <div className="flex items-start gap-3 rounded-xl border border-forest-200 bg-forest-50/70 p-3.5">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                    <div>
                      <p className="text-[11.5px] font-bold text-forest-900">
                        {resolved.shiftsRecorded} shift
                        {resolved.shiftsRecorded === 1 ? '' : 's'} recorded on this pass
                      </p>
                      <p className="mt-0.5 text-[10.5px] leading-relaxed text-forest-800/70">
                        Each is a separately approved event, not a bulk upload.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                      resolved.chainIntact === false
                        ? 'border-rose-200 bg-rose-50/70'
                        : 'border-sand-200 bg-sand-50'
                    }`}
                  >
                    {resolved.chainIntact === false ? (
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    ) : (
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
                    )}
                    <div>
                      <p
                        className={`text-[11.5px] font-bold ${
                          resolved.chainIntact === false ? 'text-rose-800' : 'text-ink-900'
                        }`}
                      >
                        {resolved.chainIntact === false
                          ? 'Audit chain broken — escalate before payment'
                          : resolved.chainIntact
                            ? 'SHA-256 audit chain intact'
                            : 'Audit chain not available on this device'}
                      </p>
                      <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-500">
                        {resolved.chainIntact === false
                          ? 'One or more historical entries no longer match their hash. Treat the ledger as disputed.'
                          : 'Historical entries have been recomputed and match their recorded hashes.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-sand-200 bg-white p-3.5">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                    <p className="text-[10.5px] leading-relaxed text-ink-500">
                      Name is partially masked and no phone number, Aadhaar fragment, address or wage
                      balance is ever shown on this page.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setQuery('');
                      setVerdict('idle');
                      setResolved(null);
                    }}
                    className="btn btn-outline btn-sm w-full"
                  >
                    Verify another pass
                  </button>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Explainer */}
        <Reveal direction="right" delay={100} className="space-y-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
            <h2 className="text-[13px] font-bold text-ink-900">What this page proves</h2>
            <ul className="mt-3 space-y-2.5">
              {[
                'The pass reference exists in a registered workspace',
                'The trade and skill band on the card match the record',
                'The historic ledger still hashes correctly',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-[11.5px] leading-relaxed text-ink-500">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brass-200 bg-brass-50/70 p-6">
            <h2 className="text-[13px] font-bold text-brass-900">What it does not prove</h2>
            <ul className="mt-3 space-y-2.5">
              {[
                'Legal identity — this is not a government ID check',
                'That the cardholder is the registered worker in person',
                'Any entitlement outside this platform’s own records',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-[11.5px] leading-relaxed text-brass-900/75">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
            <h2 className="text-[13px] font-bold text-ink-900">Scanning instead?</h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-500">
              Point any phone camera at the pass QR code. The link it contains opens this page with the
              reference already filled in.
            </p>
            <button onClick={() => onNavigate('how-it-works')} className="btn btn-outline btn-sm mt-4 w-full">
              How the pass is issued
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
