import React, { useState } from 'react';
import {
  KeyRound,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Phone,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { auth } from '../../services/auth';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { APP_CONFIG } from '../../config';
import { AuthLayout } from './AuthLayout';

interface PasswordRecoveryProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setIsLoading(true);
    const res = await auth.requestPasswordRecovery(email.trim());
    setIsLoading(false);

    if (res.success) {
      setStatusMessage(res.message);
    } else {
      setError(res.message || 'Unable to process the recovery request. Please try again.');
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Enter the email registered on your account and we will send recovery instructions."
      icon={<KeyRound className="h-5 w-5" />}
      onNavigate={onNavigate}
      asideTitle="Locked out? Your records are still safe."
      asidePoints={[
        'Shifts, wages and grievances are never deleted on sign-out',
        'Registered phone numbers can also be used to sign in',
        'Our helpline can verify you in person if email is unavailable',
      ]}
      footer={
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
            className="flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2.5 text-[11px] font-semibold text-ink-700 transition-colors hover:border-forest-300 hover:text-forest-800"
          >
            <Phone className="h-3.5 w-3.5 text-forest-700" />
            {APP_CONFIG.CONTACT_PHONE_DISPLAY}
          </a>
          <a
            href={APP_CONFIG.WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2.5 text-[11px] font-semibold text-ink-700 transition-colors hover:border-forest-300 hover:text-forest-800"
          >
            <MessageCircle className="h-3.5 w-3.5 text-forest-700" />
            WhatsApp support
          </a>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[11.5px] text-rose-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {statusMessage && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-forest-200 bg-forest-50 p-3.5 text-[11.5px] text-forest-900"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recovery-email" className="label">
            Registered email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="recovery-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="field field-icon"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send recovery instructions
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11.5px] text-ink-500">
          Remembered it?{' '}
          <button
            type="button"
            onClick={() => onNavigate('sign-in')}
            className="font-bold text-forest-800 hover:underline cursor-pointer"
          >
            Back to sign in
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};
