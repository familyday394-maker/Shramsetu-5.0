import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ExternalLink, 
  Calculator, 
  Volume2, 
  CheckCircle2 
} from 'lucide-react';
import { WELFARE_SCHEMES } from '../services/db';
import { Worker, WelfareScheme } from '../types';
import { Language, t, formatCurrency } from '../services/i18n';
import { speech } from '../services/speech';

interface WelfareSchemesProps {
  worker: Worker;
  lang: Language;
}

export const WelfareSchemes: React.FC<WelfareSchemesProps> = ({ worker, lang }) => {
  // PM-SYM Pension Calculator state
  const [workerAge, setWorkerAge] = useState<number>(28);

  // Government defined monthly contributions based on age (18 -> ₹55, 29 -> ₹100, 40 -> ₹200)
  const getContribution = (age: number) => {
    if (age <= 18) return 55;
    if (age >= 40) return 200;
    return Math.round(55 + ((age - 18) / (40 - 18)) * (200 - 55));
  };

  const monthlyWorkerShare = getContribution(workerAge);
  const govtMatchingShare = monthlyWorkerShare;

  const handleSpeakSchemes = () => {
    if (lang === 'hi') {
      speech.speak(
        `${worker.hindiName} के लिए ई-श्रम एवं मध्य प्रदेश श्रम कल्याण मंडल की प्रमुख योजनाएं। प्रधानमंत्री सुरक्षा बीमा योजना में ₹2,00,000 का दुर्घटना बीमा, बीओसीडब्ल्यू औजार किट अनुदान ₹5,000, एवं श्रम योगी मानधन योजना में 60 वर्ष पश्चात ₹3,000 मासिक सुनिश्चित पेंशन उपलब्ध है।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `Government social security schemes for ${worker.name}. Accidental insurance of ₹2,00,000 under PMSBY, ₹5,000 artisan tool grant under MP BOCW, and ₹3,000 monthly pension under PM-SYM.`,
        'en-IN'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-brass-600" />
              <h2 className="text-lg font-bold text-ink-900">
                {t('welfareTitle', lang)}
              </h2>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              {t('welfareSubtitle', lang)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakSchemes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brass-50 hover:bg-brass-100 text-brass-700 text-xs font-semibold rounded-lg border border-brass-200 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-brass-600" />
              <span>{t('welfareListenButton', lang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Welfare Schemes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {WELFARE_SCHEMES.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-sand-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-brass-300 transition-colors min-w-0"
          >
            <div>
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] text-brass-700 font-bold uppercase tracking-wider block truncate">
                    {scheme.organization}
                  </span>
                  <h3 className="text-sm font-bold text-ink-900 mt-0.5 truncate">
                    {lang === 'hi' ? scheme.hindiTitle : scheme.title}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 whitespace-nowrap shrink-0">
                  {t('welfareActiveBadge', lang)}
                </span>
              </div>

              {/* Benefit Highlight Box */}
              <div className="mt-3 p-3 bg-brass-50/70 rounded-xl border border-brass-200 text-xs text-brass-900 font-medium">
                <span className="text-[10px] text-brass-800 font-bold block uppercase">
                  {t('welfareBenefitAmountLabel', lang)}
                </span>
                <span className="font-bold text-sm text-brass-900 block mt-0.5">
                  {scheme.benefitAmount}
                </span>
              </div>

              <div className="mt-3 text-xs text-ink-600">
                <span className="font-semibold text-ink-700 block">
                  {t('welfareEligibilityLabel', lang)}
                </span>
                <p className="text-ink-600 mt-0.5">
                  {lang === 'hi' ? scheme.hindiEligibility : scheme.eligibility}
                </p>
              </div>
            </div>

            <div className="border-t border-sand-100 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-forest-700 font-semibold flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{worker.eShramUAN ? t('welfareUanPreverified', lang) : t('welfareRequiresReg', lang)}</span>
              </span>

              <a
                href={scheme.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-brass-600 hover:text-brass-700 font-semibold text-xs shrink-0"
              >
                <span>{t('welfareOfficialPortal', lang)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Pension Estimator (PM-SYM) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sand-200 shadow-xs space-y-4 min-w-0">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brass-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-ink-900">
                {t('welfarePensionHeading', lang)}
              </h3>
              <p className="text-xs text-ink-500">
                {t('welfarePensionSubtitle', lang)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-w-0">
          
          <div className="md:col-span-6 space-y-3 min-w-0">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-ink-700 mb-1">
                <span>{t('welfareWorkerAgeLabel', lang)}</span>
                <span className="font-mono text-brass-700 font-bold text-sm">
                  {workerAge} {t('welfareYearsUnit', lang)}
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="40"
                value={workerAge}
                onChange={(e) => setWorkerAge(parseInt(e.target.value))}
                className="w-full accent-brass-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                <span>18 {t('welfareYearsUnit', lang)} (₹55/mo)</span>
                <span>29 {t('welfareYearsUnit', lang)} (₹100/mo)</span>
                <span>40 {t('welfareYearsUnit', lang)} (₹200/mo)</span>
              </div>
            </div>

            <p className="text-xs text-ink-500 leading-relaxed">
              {t('welfareMatchingText', lang)}
            </p>
          </div>

          <div className="md:col-span-6 bg-sand-50 p-4 rounded-xl border border-sand-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-ink-600">
              <span>{t('welfareWorkerShareLabel', lang)}</span>
              <span className="font-mono font-bold text-ink-900 text-sm">₹{monthlyWorkerShare} {t('welfarePerMonth', lang)}</span>
            </div>
            <div className="flex justify-between items-center text-forest-700">
              <span>{t('welfareGovtShareLabel', lang)}</span>
              <span className="font-mono font-bold text-sm">+₹{govtMatchingShare} {t('welfarePerMonth', lang)}</span>
            </div>
            <div className="border-t border-sand-200 pt-2 flex justify-between items-center font-bold text-ink-900">
              <span>{t('welfareAssuredPensionLabel', lang)}</span>
              <span className="font-mono text-forest-700 text-base">₹3,000 {t('welfarePerMonth', lang)}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
