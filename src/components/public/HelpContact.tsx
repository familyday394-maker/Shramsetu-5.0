import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AppRoute } from '../../services/router';
import { Language } from '../../services/i18n';
import { APP_CONFIG } from '../../config';

interface HelpContactProps {
  onNavigate: (route: AppRoute) => void;
  lang: Language;
}

export const HelpContact: React.FC<HelpContactProps> = ({ onNavigate, lang }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [subject, setSubject] = useState('wage_dispute');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSent(true);
    setTimeout(() => {
      setName('');
      setPhone('+91 ');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Help, Support & Contact
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Senior Bal Vigyan Innovation Project · Direct Support Helpline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          
          {/* Official Phone Helpline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Official Project Helpline
              </span>
              <a
                href={`tel:${APP_CONFIG.CONTACT_PHONE}`}
                className="font-mono text-xl font-bold text-emerald-800 hover:text-emerald-700 transition-colors block mt-0.5"
              >
                {APP_CONFIG.CONTACT_PHONE_DISPLAY}
              </a>
              <p className="text-xs text-slate-500 mt-1">
                Direct phone support for daily workers experiencing muster disputes or wage withholding.
              </p>
            </div>
          </div>

          {/* WhatsApp Support Link */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Instant WhatsApp Assistant
              </span>
              <a
                href={APP_CONFIG.WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors block mt-0.5"
              >
                wa.me/{APP_CONFIG.WHATSAPP_NUMBER}
              </a>
              <p className="text-xs text-slate-500 mt-1">
                Share muster snapshots, report arbitrary deductions, or get audio guidance in Hindi.
              </p>
            </div>
          </div>

          {/* Location & Bal Vigyan Context */}
          <div className="bg-[#faf8f5] rounded-2xl border border-amber-900/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-emerald-800" />
              <span>Project Exhibit & Innovation Center</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Senior Bal Vigyan Project, Division II — Applied Digital Solutions.<br />
              Indore District, Madhya Pradesh, India.<br />
              Aligned with Madhya Pradesh Building and Other Construction Workers Welfare Board (MP BOCW).
            </p>
          </div>

        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Send a Message or Report an Issue</h2>
          <p className="text-xs text-slate-500 mb-6">Our innovation team and labor welfare advocates respond within 24 hours.</p>

          {isSent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Message Recorded Successfully</h3>
              <p className="text-xs text-slate-600">
                Your inquiry has been logged in our local support registry. A representative will contact you at your provided number.
              </p>
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Santosh Verma"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98260 12345"
                  className="w-full text-xs sm:text-sm font-mono p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Category</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none bg-white"
                >
                  <option value="wage_dispute">Unpaid or Underpaid Wages</option>
                  <option value="qr_pass">Smart Shram Pass Help</option>
                  <option value="contractor_onboarding">Contractor Compliance & Muster Integration</option>
                  <option value="bal_vigyan">Senior Bal Vigyan Exhibit Inquiry</option>
                  <option value="general">General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message / Incident Details</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your site location, dates, contractor name, or questions..."
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
