import React from 'react';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  Calculator, 
  Lock, 
  FileCheck, 
  ArrowRight, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';

interface HowItWorksProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate, lang }) => {
  const steps = [
    {
      num: '01',
      title: 'Permanent Worker Pass Issued',
      desc: 'Each registered worker receives a reusable, printable QR pass. The QR code contains strictly an opaque reference URL and zero private PII (no Aadhaar, phone numbers, or wage balances).',
      icon: QrCode,
    },
    {
      num: '02',
      title: 'Mutual Phone Contact Cross-Check',
      desc: 'When an authorized contractor and worker establish a working relationship, both parties verify mobile contact numbers through a mutual manual check recorded with timestamp and reported outcome.',
      icon: UserCheck,
    },
    {
      num: '03',
      title: 'QR Scan & Shift Confirmation Request',
      desc: 'The site contractor scans the worker’s pass with their device camera. Rather than unilaterally imposing muster records, Shram Setu creates a pending approval request on the worker’s account.',
      icon: Smartphone,
    },
    {
      num: '04',
      title: 'Worker Reviews & Approves in Real Time',
      desc: 'The worker opens their authenticated dashboard, verifies the shift date, site, hours, and agreed wage rate, and approves the shift with full transparency.',
      icon: CheckCircle,
    },
    {
      num: '05',
      title: 'Mathematical Wage Ledger Accounting',
      desc: 'Our statutory wage engine computes pro-rata overtime under the MP Minimum Wages Act. Contractor payments and advances are recorded distinctly and require worker acknowledgment.',
      icon: Calculator,
    },
    {
      num: '06',
      title: 'Cryptographic SHA-256 Audit Trail',
      desc: 'Every muster punch, wage credit, disbursement, and dispute resolution is permanently hashed into a sequential cryptographic chain, ensuring undeniable legal proof.',
      icon: Lock,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-12">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparent Technology Workflow</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
          How Shram Setu 2.0 Works
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          From first site check-in to final statutory wage settlement — every transition is mutually confirmed and tamper-evident.
        </p>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-emerald-600/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    STEP {step.num}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#1e3d2f] text-white rounded-3xl p-8 sm:p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to experience transparent wage protection?</h2>
        <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto mb-6">
          Create your free worker or contractor account today. No specialized hardware required — runs on standard mobile web browsers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('create-account')}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('sign-in')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors cursor-pointer"
          >
            <span>Sign In</span>
          </button>
        </div>
      </div>

    </div>
  );
};
