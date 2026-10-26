import React from 'react';
import { Award, ShieldCheck, MapPin, Scale, HeartHandshake, ArrowRight } from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';

interface AboutProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

export const About: React.FC<AboutProps> = ({ onNavigate, lang }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Indore Senior Bal Vigyan 2.0 Innovation</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          About the Shram Setu Project
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Empowering unorganized informal construction workers with verifiable digital labor records
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        
        {/* Origin */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Project Genesis & Inspiration</h2>
          <p>
            Shram Setu was conceived during field inquiries at civil construction sites in Indore, Madhya Pradesh. Over 85% of India’s construction workforce operates in the unorganized informal sector, vulnerable to delayed payments, arbitrary muster cuts, and denial of overtime.
          </p>
          <p>
            Conventional contractor diaries and paper muster rolls are frequently withheld, lost, or altered when weekly settlements are due. Workers lack an independent, verifiable record to enforce their rights under the <strong>Madhya Pradesh Minimum Wages Act (1948)</strong>.
          </p>
        </section>

        {/* What Shram Setu 2.0 Solves */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">The 2.0 Architectural Leap</h2>
          <p>
            Shram Setu 2.0 replaces disputed verbal promises with a decentralized, low-friction record:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-amber-900/10">
              <h3 className="font-bold text-slate-900 mb-1">Permanent Reusable QR Pass</h3>
              <p className="text-xs text-slate-600">
                Every worker carries a persistent physical or digital pass that encodes an opaque reference with zero PII, preventing surveillance while enabling seamless check-in.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-amber-900/10">
              <h3 className="font-bold text-slate-900 mb-1">Cross-Device Mutual Confirmation</h3>
              <p className="text-xs text-slate-600">
                Contractors cannot unilaterally change attendance history. Shifts and wage entries generate requests requiring worker approval on their own device.
              </p>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Statutory Welfare Alignment</h2>
          <p>
            Shram Setu 2.0 is designed to bridge workers into government welfare programs:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>e-Shram National Database of Unorganised Workers (NDUW):</strong> Connects worker 12-digit UAN credentials to authentic employment muster histories.</li>
            <li><strong>MP BOCW Welfare Board:</strong> Generates tamper-evident 90-day attendance certificates required for accident insurance, maternity benefits, and children education assistance.</li>
            <li><strong>Direct Benefit Transfer (DBT):</strong> Transparently registers bank accounts and UPI payment receipts for audit.</li>
          </ul>
        </section>

        {/* Location & Exhibit */}
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950">
            <span className="font-bold block">Presented at Indore Senior Bal Vigyan Exhibition</span>
            <span>Senior Division II (Applied Science & Innovation) · Indore District, MP. Helpline: 7909348017.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
