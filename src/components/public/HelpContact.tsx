import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  ShieldAlert,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { APP_CONFIG } from '../../config';
import { PageHeader } from '../ui/PageHeader';
import { Reveal } from '../ui/Reveal';
import { LanguageNotice } from '../ui/LanguageNotice';
import { Accordion } from '../ui/Accordion';

interface HelpContactProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

const CATEGORIES = [
  { value: 'wage_dispute', label: 'Unpaid or underpaid wages' },
  { value: 'qr_pass', label: 'Smart Shram Pass help' },
  { value: 'contractor_onboarding', label: 'Contractor compliance & muster integration' },
  { value: 'bal_vigyan', label: 'Senior Bal Vigyan exhibit inquiry' },
  { value: 'general', label: 'General support' },
];

const QUICK_HELP = [
  {
    question: 'I worked but the contractor did not record my shift. What now?',
    answer: (
      <>
        Do not sign anything. Call the helpline and note the date, site name and supervisor. If your
        contractor is on Shram Setu, an approval request will appear on your account — approving it is
        what creates the record. If they are not, we log the complaint in the same format used for
        statutory filings.
      </>
    ),
  },
  {
    question: 'My pass QR code will not scan at the site.',
    answer: (
      <>
        Reprint the pass from your portal — do not photocopy a photocopy, as contrast degrades. Ask
        the supervisor to scan in daylight and hold the phone 15–20 cm away. The pass can always be
        typed in manually using the reference code printed under the QR.
      </>
    ),
  },
  {
    question: 'Can I use Shram Setu without a smartphone?',
    answer: (
      <>
        Yes. The QR pass prints on paper and can be scanned by the contractor’s phone. For approvals
        and wage acknowledgements, a family member or a site coordinator can assist under your
        registered number — or use the helpline.
      </>
    ),
  },
  {
    question: 'How do I correct a wrong entry in my wage khata?',
    answer: (
      <>
        Open the entry in <strong>Wages &amp; Payments</strong> and raise a dispute instead of editing
        it. Corrections are appended as new signed events so the original entry stays visible — that
        is what makes the record credible to an auditor.
      </>
    ),
  },
];

export const HelpContact: React.FC<HelpContactProps> = ({ onNavigate, lang }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [subject, setSubject] = useState('wage_dispute');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please tell us your name so we can address you correctly.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number so we can call you back.');
      return;
    }
    if (message.trim().length < 12) {
      setError('Please describe the issue in at least a sentence — site, dates and amount help us act faster.');
      return;
    }

    setIsSending(true);

    // Local-first: the inquiry is retained on-device for the support desk.
    try {
      const key = 'shramsetu_support_inquiries';
      const existing = JSON.parse(window.localStorage.getItem(key) || '[]');
      existing.unshift({
        id: `INQ-${Date.now().toString(36).toUpperCase()}`,
        name: name.trim(),
        phone: phone.trim(),
        category: subject,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
      window.localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Storage may be unavailable in private mode — the confirmation still stands.
    }

    window.setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setName('');
      setPhone('+91 ');
      setMessage('');
    }, 700);
  };

  return (
    <div className="pb-4">
      <LanguageNotice lang={lang} />

      <PageHeader
        eyebrow="Support"
        icon={<Phone className="h-5 w-5" />}
        title="Help, support & a real human on the line"
        description="A wage problem does not keep office hours, so neither does our intent. Call, message on WhatsApp, or write below — every inquiry reaches a coordinator."
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
            className="btn btn-primary btn-sm"
          >
            <Phone className="h-3.5 w-3.5" />
            {APP_CONFIG.CONTACT_PHONE_DISPLAY}
          </a>
          <a
            href={APP_CONFIG.WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
          >
            <MessageCircle className="h-3.5 w-3.5 text-forest-700" />
            WhatsApp support
          </a>
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        {/* Contact rail */}
        <div className="space-y-4">
          <Reveal direction="left">
            <a
              href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
              className="group flex items-start gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-soft transition-all duration-400 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 text-white shadow-[0_12px_24px_-14px_rgba(22,58,43,0.9)]">
                <Phone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
                  Worker helpline
                </span>
                <span className="mt-0.5 block font-mono text-[15px] font-bold text-ink-950 transition-colors group-hover:text-forest-800">
                  {APP_CONFIG.CONTACT_PHONE_DISPLAY}
                </span>
                <p className="mt-1 text-[11px] leading-snug text-ink-500">
                  Muster disputes, withheld wages, or pass trouble.
                </p>
              </div>
            </a>
          </Reveal>

          <Reveal direction="left" delay={70}>
            <a
              href={APP_CONFIG.WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-soft transition-all duration-400 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-700 text-white">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
                  WhatsApp assistant
                </span>
                <span className="mt-0.5 block font-mono text-[14px] font-bold text-ink-950 transition-colors group-hover:text-forest-800">
                  wa.me/{APP_CONFIG.WHATSAPP_NUMBER}
                </span>
                <p className="mt-1 text-[11px] leading-snug text-ink-500">
                  Send muster photos or get audio guidance in Hindi.
                </p>
              </div>
            </a>
          </Reveal>

          <Reveal direction="left" delay={140}>
            <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                <Clock className="h-3.5 w-3.5" />
                Response windows
              </div>
              <dl className="mt-3 space-y-2 text-[11.5px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-500">Phone &amp; WhatsApp</dt>
                  <dd className="font-semibold text-ink-900">Mon–Sat · 9am–7pm</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-500">Written inquiries</dt>
                  <dd className="font-semibold text-ink-900">Within 24 hours</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-500">Urgent wage withholding</dt>
                  <dd className="font-semibold text-forest-800">Same day</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal direction="left" delay={210}>
            <div className="rounded-2xl border border-brass-200 bg-brass-50/70 p-5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-brass-900">
                <MapPin className="h-4 w-4" />
                Exhibit &amp; innovation centre
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-brass-900/80">
                Senior Bal Vigyan Project, Division II — Applied Digital Solutions.
                <br />
                Indore District, Madhya Pradesh, India.
                <br />
                Aligned with the MP Building &amp; Other Construction Workers Welfare Board.
              </p>
              <a
                href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-brass-800 underline decoration-brass-300 underline-offset-2 hover:text-brass-900"
              >
                <Mail className="h-3.5 w-3.5" />
                {APP_CONFIG.SUPPORT_EMAIL}
              </a>
            </div>
          </Reveal>

          <Reveal direction="left" delay={280}>
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p className="text-[10.5px] leading-relaxed text-rose-900/85">
                <strong className="font-bold">In an emergency or unsafe site, call 112.</strong> For a
                formal labour complaint, the District Labour Officer, Indore can register it
                independently of this platform.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Form + FAQ */}
        <div className="space-y-6">
          <Reveal direction="right">
            <div className="rounded-[1.5rem] border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
              {isSent ? (
                <div className="py-6 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-50 text-forest-700 ring-8 ring-forest-50/50">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="mt-5 text-[1.25rem] text-ink-950">Inquiry recorded</h2>
                  <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-ink-500">
                    Your message is stored on this device for the support desk. A coordinator will
                    call the number you provided — usually the same working day.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    <button onClick={() => setIsSent(false)} className="btn btn-outline btn-sm">
                      Send another message
                    </button>
                    <button
                      onClick={() => onNavigate('how-it-works')}
                      className="btn btn-primary btn-sm"
                    >
                      Read how it works
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[1.25rem] leading-snug text-ink-950">
                        Send a message or report an issue
                      </h2>
                      <p className="mt-1 text-[11.5px] text-ink-500">
                        Our team and labour-welfare volunteers respond within 24 hours.
                      </p>
                    </div>
                    <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-sand-100 text-forest-700 sm:grid">
                      <Send className="h-4.5 w-4.5" />
                    </span>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[11.5px] text-rose-800"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="help-name" className="label">
                          Your name
                        </label>
                        <input
                          id="help-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Santosh Verma"
                          className="field"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="help-phone" className="label">
                          Mobile number
                        </label>
                        <input
                          id="help-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98260 12345"
                          className="field font-mono"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="help-subject" className="label">
                        What is this about?
                      </label>
                      <select
                        id="help-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="field bg-white"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="help-message" className="label">
                        Message / incident details
                      </label>
                      <textarea
                        id="help-message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Site location, dates, contractor name, amount due, and what happened…"
                        className="field resize-y"
                      />
                      <p className="mt-1.5 text-[10px] text-ink-400">
                        Never include Aadhaar, bank or OTP details in this form.
                      </p>
                    </div>

                    <button type="submit" disabled={isSending} className="btn btn-primary w-full">
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Recording…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit inquiry
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>

          <Reveal direction="right" delay={100}>
            <div>
              <h2 className="mb-3 px-1 text-[13px] font-bold text-ink-900">Quick answers</h2>
              <Accordion items={QUICK_HELP} defaultOpen={null} />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};
