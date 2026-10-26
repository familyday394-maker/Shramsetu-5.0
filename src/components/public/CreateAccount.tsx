import React, { useState } from 'react';
import { Users, Building2, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Phone, Lock, User, Briefcase, Mail } from 'lucide-react';
import { auth, SignUpParams } from '../../services/auth';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';

interface CreateAccountProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

export const CreateAccount: React.FC<CreateAccountProps> = ({ onNavigate, lang }) => {
  const [accountType, setAccountType] = useState<'worker' | 'contractor'>('worker');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trade, setTrade] = useState('Head Mason (मुख्य राजमिस्त्री)');
  const [organizationName, setOrganizationName] = useState('');
  const [consentToShareContact, setConsentToShareContact] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit mobile number with country code.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please choose a secure password (minimum 6 characters).');
      return;
    }

    if (!privacyAccepted) {
      setError('You must accept the Shram Setu privacy terms and data use policy.');
      return;
    }

    setIsLoading(true);

    const params: SignUpParams = {
      role: accountType,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password: password,
      trade: accountType === 'worker' ? trade : undefined,
      organizationName: accountType === 'contractor' ? organizationName.trim() : undefined,
      consentToShareContact,
      privacyAccepted,
    };

    const res = await auth.signUp(params);
    setIsLoading(false);

    if (res.success && res.user) {
      if (res.user.role === 'worker') {
        onNavigate('worker');
      } else {
        onNavigate('contractor');
      }
    } else {
      setError(res.error || 'Failed to create account. Please verify details.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create Your Shram Setu Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Select your account type to configure your digital work records
          </p>
        </div>

        {/* Account Type Selector (Step 1) */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Select Account Role
          </label>
          <div className="grid grid-cols-2 gap-4">
            
            <button
              type="button"
              onClick={() => setAccountType('worker')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                accountType === 'worker'
                  ? 'border-emerald-700 bg-emerald-50/50 text-slate-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${accountType === 'worker' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Users className="w-5 h-5" />
                </div>
                {accountType === 'worker' && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
              </div>
              <div>
                <span className="block font-bold text-sm text-slate-900">Worker</span>
                <span className="text-[11px] text-slate-500">Daily wage, artisan, helper, mason</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('contractor')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                accountType === 'contractor'
                  ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${accountType === 'contractor' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                {accountType === 'contractor' && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
              </div>
              <div>
                <span className="block font-bold text-sm text-slate-900">Contractor</span>
                <span className="text-[11px] text-slate-500">Site builder, engineer, supervisor</span>
              </div>
            </button>

          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={accountType === 'worker' ? 'e.g., Rameshwar Lal Ahirwar' : 'e.g., Anil Sisodiya'}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile Number with Country Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number (with Country Code) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98260 12345"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Required for mutual contact verification cross-checks. Not displayed in public QR scans.
            </p>
          </div>

          {/* Email Address (Optional for workers, recommended for contractors) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address {accountType === 'worker' ? '(Optional)' : '<span className="text-rose-500">*</span>'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required={accountType === 'contractor'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Secured through authentication provider. Never stored in localStorage or client databases.
            </p>
          </div>

          {/* Worker Specific: Trade Category */}
          {accountType === 'worker' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trade or Work Category
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none bg-white"
                >
                  <option value="Head Mason (मुख्य राजमिस्त्री)">Head Mason (मुख्य राजमिस्त्री)</option>
                  <option value="Steel Binder & Rigging Helper (सरिया बाइंडर)">Steel Binder & Rigging Helper (सरिया बाइंडर)</option>
                  <option value="Site Electrician & Cable Jointer (साइट इलेक्ट्रीशियन)">Site Electrician & Cable Jointer (साइट इलेक्ट्रीशियन)</option>
                  <option value="General Helper & Concrete Batching (बेलदार)">General Helper & Concrete Batching (बेलदार)</option>
                  <option value="Tile Grinding & Surface Polisher (फिनिशिंग)">Tile Grinding & Surface Polisher (फिनिशिंग)</option>
                  <option value="Carpenter & Shuttering (शटरिंग बढ़ई)">Carpenter & Shuttering (शटरिंग बढ़ई)</option>
                  <option value="Plumber & Pipe Fitter (प्लंबर)">Plumber & Pipe Fitter (प्लंबर)</option>
                  <option value="Painter & Putty Applicator (पेंटर)">Painter & Putty Applicator (पेंटर)</option>
                </select>
              </div>
            </div>
          )}

          {/* Contractor Specific: Organization Name */}
          {accountType === 'contractor' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contractor Business / Agency Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g., Narmada Infra Engineering Ltd."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Consent Checkboxes */}
          <div className="pt-2 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentToShareContact}
                onChange={(e) => setConsentToShareContact(e.target.checked)}
                className="mt-1 rounded text-emerald-700 focus:ring-emerald-700"
              />
              <span className="text-xs text-slate-600">
                I consent to sharing my registered mobile number with my authorized workplace counterpart (worker or contractor) for manual shift cross-checks.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 rounded text-emerald-700 focus:ring-emerald-700"
              />
              <span className="text-xs text-slate-600">
                I agree to the <button type="button" onClick={() => onNavigate('privacy')} className="text-emerald-800 font-semibold underline">Privacy and Data Use Policy</button>. My shift records and wages will be recorded under Madhya Pradesh labor welfare standards.
              </span>
            </label>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                accountType === 'worker' ? 'bg-emerald-800 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <span>{isLoading ? 'Creating Account...' : `Register as ${accountType === 'worker' ? 'Worker' : 'Contractor'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('sign-in')}
              className="text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Sign In here
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
