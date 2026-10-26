import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck, Scale, FileText } from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';

interface PrivacyProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

export const Privacy: React.FC<PrivacyProps> = ({ onNavigate, lang }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8">
      
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Informal Worker Privacy Framework</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Privacy and Data Use Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Effective for Shram Setu 2.0 · Senior Bal Vigyan Indore Innovation
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Lock className="w-4 h-4 text-emerald-700" />
            <h2>1. Zero-PII QR Code Standard</h2>
          </div>
          <p>
            Shram Setu 2.0 strictly guarantees that no personally identifiable information (PII) is encoded directly into worker QR passes. Specifically, the QR matrix never contains:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Aadhaar numbers or national biometric identifiers</li>
            <li>Mobile phone numbers or residential addresses</li>
            <li>Bank account numbers, IFSC codes, or UPI payment IDs</li>
            <li>Accumulated wage ledger balances or transaction amounts</li>
            <li>Personal attendance logs or historical dispute filings</li>
          </ul>
          <p className="text-slate-500 text-xs">
            The QR code encodes exclusively an opaque, unguessable cryptographic token that resolves to a working application URL on the actual host network.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <h2>2. Mobile Number & Mutual Verification Protocol</h2>
          </div>
          <p>
            Mobile numbers are collected during registration solely to provide a human cross-check between workers and authorized contractors.
          </p>
          <p>
            Contact numbers are only displayed to authorized counterparts who have mutually joined a specific site or shift. Contact cross-checks are recorded with timestamps, reporting parties, and outcomes (confirmed match, details mismatch, or unreachable).
          </p>
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs">
            <strong>Mandatory Legal Clarification:</strong> Mutual manual phone checks are human cross-checks between workplace counterparts. They do <strong>not</strong> constitute statutory identity verification, government biometric authentication, or definitive proof of legal identity.
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Scale className="w-4 h-4 text-emerald-700" />
            <h2>3. Role-Based Scoping & Data Isolation</h2>
          </div>
          <p>
            Workers only have access to their own work records, wage khata balances, and disputes. Contractors cannot inspect the private records of workers outside of their authorized assignments. Newly created accounts start with a clean state and do not inherit random demonstration records.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <EyeOff className="w-4 h-4 text-emerald-700" />
            <h2>4. Password & Credential Security</h2>
          </div>
          <p>
            Passwords are handled through the authentication provider (Supabase Auth when configured) and are <strong>never stored in localStorage, sessionStorage, or IndexedDB</strong>. The optional "Remember my login ID" feature stores only the public identifier (email or phone) and never remembers passwords.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-4 h-4 text-emerald-700" />
            <h2>5. Non-Repudiable Cryptographic Audit Log</h2>
          </div>
          <p>
            All critical transitions (daily muster punches, contractor payouts, worker acknowledgments, and dispute filings) are recorded in a sequential SHA-256 cryptographic hash chain. This ensures that historical wage records cannot be altered retroactively without immediate detection by labor welfare auditors.
          </p>
        </section>

      </div>
    </div>
  );
};
