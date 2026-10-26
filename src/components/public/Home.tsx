import React from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  FileCheck2, 
  Scale, 
  ArrowRight, 
  Users, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Award,
  PhoneCall
} from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { APP_CONFIG } from '../../config';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
  onEnterJudgeDemo: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, lang, onEnterJudgeDemo }) => {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1e3d2f] text-white border border-[#2d5743] shadow-lg">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-16 lg:py-20 text-center">
          
          {/* Recognition Kicker */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-200 mb-6">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Senior Bal Vigyan Innovation · Indore, Madhya Pradesh</span>
            <span aria-hidden="true">·</span>
            <span>MP Minimum Wages Act Aligned</span>
          </div>

          {/* Central Innovation Proposition */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
            Every shift recorded.<br />
            <span className="text-amber-300">Every wage explained.</span><br />
            Every change traceable.
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Shram Setu 2.0 provides informal daily wage and construction workers with an unalterable digital work record, verifiable QR pass, and statutory wage protection ledger.
          </p>

          {/* Primary Call to Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={() => onNavigate('create-account')}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('sign-in')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* Isolated Judge Demo Prompt */}
          <div className="mt-8 pt-6 border-t border-emerald-700/50 flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-200">
            <span>Evaluating for Senior Bal Vigyan?</span>
            <button
              onClick={onEnterJudgeDemo}
              className="font-semibold text-amber-300 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              Launch Isolated Judge Demo & Cryptographic Audit Bench
            </button>
          </div>

        </div>
      </section>

      {/* Two Pillars: Workers and Contractors */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
            Two Dedicated Portals, One Trusted Record
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Eliminating informal exploitation through mutual accountability and mathematical transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Worker Card */}
          <div className="bg-[#faf8f5] rounded-2xl border border-amber-900/10 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-emerald-600/30 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center mb-6 shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">For Construction & Daily Workers</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Take full control of your employment history. Never lose wages to contractor deductions or unrecorded overtime.
              </p>
              
              <ul className="space-y-3 text-xs text-slate-700 mb-8">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Permanent QR Pass:</strong> One reusable credential that contains zero private PII.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Plain-Language Khata:</strong> Understandable breakdown of earned wages, advances, and dues.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Shift Approvals:</strong> Contractor requests must be accepted by you to be finalized.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Samadhan Grievances:</strong> Direct statutory filing framework under MP BOCW norms.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('create-account')}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register as a Worker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Contractor Card */}
          <div className="bg-[#faf8f5] rounded-2xl border border-amber-900/10 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-emerald-600/30 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">For Civil Contractors & Builders</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Streamline site muster rolls, prevent wage disputes, and establish compliance with statutory labor laws.
              </p>
              
              <ul className="space-y-3 text-xs text-slate-700 mb-8">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <span><strong>Instant Pass Scanning:</strong> Scan worker QR passes directly with your phone camera.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <span><strong>Verified Disbursements:</strong> Record wage payments with distinct worker acknowledgment.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <span><strong>Contact Cross-Check:</strong> Log mutual telephonic checks with registered counterparts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <span><strong>Cryptographic Compliance:</strong> Produce tamper-proof reports ready for labor audits.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('create-account')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register as a Contractor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="bg-white border-y border-slate-200 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Built on 4 Rigorous Engineering Standards
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Indore Senior Bal Vigyan Division II Innovation Benchmark
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Zero-PII QR Standard</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                QR passes encode only opaque references. No Aadhaar, phone numbers, or balances are exposed to unauthorized scanners.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Cryptographic Audit Chain</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every muster entry and payment creates a chained SHA-256 hash event. Backdated alterations immediately break the chain.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">MP Statutory Wage Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict integer-paise calculations enforce statutory pro-rata overtime and ensure contractor advances never exceed net earnings.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Human Contact Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mutual manual telephone checks are recorded with timestamps and outcomes, providing human trust without fake claims.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Helpline Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-6 rounded-2xl bg-[#faf8f5] border border-amber-900/10">
          <h3 className="text-base font-bold text-slate-900">Need assistance or reporting labor rights violations?</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4">
            Direct Bal Vigyan Innovation Support Helpline: <span className="font-mono font-bold text-emerald-800">{APP_CONFIG.CONTACT_PHONE_DISPLAY}</span>
          </p>
          <div className="flex justify-center gap-3">
            <a
              href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Call Helpline ({APP_CONFIG.CONTACT_PHONE})
            </a>
            <button
              onClick={() => onNavigate('help')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
            >
              Inquiry & Support Form
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
