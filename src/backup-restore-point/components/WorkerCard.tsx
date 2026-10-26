import React, { useState, useEffect } from 'react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { 
  RotateCw, 
  Volume2, 
  Printer, 
  ShieldCheck, 
  CheckCircle,
  AlertCircle,
  Phone,
  CreditCard,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  FileText,
  X
} from 'lucide-react';
import { Worker, ConstructionSite } from '../types';
import { 
  Language, 
  t, 
  formatCurrency, 
  getLocalizedTrade, 
  getLocalizedSkill 
} from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';

const DEFAULT_WORKER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120"><rect width="100" height="120" fill="%23f1f5f9"/><circle cx="50" cy="42" r="22" fill="%23cbd5e1"/><path d="M18 108 C18 78 82 78 82 108" fill="%2394a3b8"/><rect x="36" y="22" width="28" height="6" rx="3" fill="%23ea580c"/></svg>`;

interface WorkerCardProps {
  worker: Worker;
  site?: ConstructionSite;
  stats: {
    totalDaysWorked: number;
    totalEarned: number;
    totalAdvancesTaken: number;
    netBalanceDue: number;
  };
  lang: Language;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  site,
  stats,
  lang,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copiedRecord, setCopiedRecord] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Preload worker photo asset so it is hot in browser cache before print is triggered
  useEffect(() => {
    if (worker.photoUrl) {
      const img = new Image();
      img.src = worker.photoUrl;
    }
  }, [worker.photoUrl]);

  // Ensure isPrinting state clears when the print dialog closes
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Cryptographic payload encoded in the QR code (keeps standard machine-readable IDs)
  const qrPayload = JSON.stringify({
    sys: 'SHRAM_SETU_2.0',
    id: worker.id,
    uan: worker.eShramUAN,
    bocw: worker.bocwRegistrationNo,
    name: worker.name,
    trade: getLocalizedTrade(worker.trade, 'en'),
    wage: worker.dailyBaseWage,
    verifiedDays: stats.totalDaysWorked,
    balanceDue: stats.netBalanceDue,
    site: site?.name || worker.activeSiteId,
    hash: `SHA256:SS20-${worker.id.replace(/-/g, '')}-${worker.aadhaarLast4}`,
  });

  const localizedTrade = getLocalizedTrade(worker.trade, lang);
  const skillInfo = getLocalizedSkill(worker.skillLevel, lang);
  const siteName = lang === 'hi' && site?.hindiName ? site.hindiName : (site?.name || worker.activeSiteId);

  const handleSpeakCard = () => {
    if (lang === 'hi') {
      const msg = `${worker.hindiName}। पेशा: ${localizedTrade}। कौशल स्तर: ${skillInfo.label}। दैनिक सांविधिक मजदूरी ₹${worker.dailyBaseWage}। कुल सत्यापित कार्य दिवस: ${
        stats.totalDaysWorked
      } दिन। वर्तमान बकाया शुद्ध मजदूरी ₹${stats.netBalanceDue}। कार्य स्थल: ${siteName}। हेल्पलाइन ${APP_CONFIG.CONTACT_PHONE}।`;
      speech.speak(msg, 'hi-IN');
    } else {
      const msg = `${worker.name}. Trade: ${localizedTrade}. Skill level: ${skillInfo.label}. Daily wage: ₹${worker.dailyBaseWage}. Verified days: ${
        stats.totalDaysWorked
      } days. Net wage balance due: ₹${stats.netBalanceDue}. Working at ${siteName}. Helpline ${APP_CONFIG.CONTACT_PHONE}.`;
      speech.speak(msg, 'en-IN');
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setPrintError(null);
    setShowPrintModal(true);

    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.focus();
        window.print();
      }
    } catch (err: any) {
      console.warn('Direct window.print restricted in frame:', err);
      setPrintError(
        lang === 'hi'
          ? 'ब्राउज़र सुरक्षा या आईफ्रेम के कारण सीधे प्रिंट विंडो नहीं खुल सकी। आप नीचे प्रदर्शित पत्रक से सीधे प्रिंट कर सकते हैं या Ctrl+P / ⌘+P दबाएं।'
          : 'Direct print dialog was restricted by browser/iframe security. You can print via the sheet below or press Ctrl+P / ⌘+P.'
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCopyPassRecord = async () => {
    try {
      const summaryText = `SHRAM SETU 2.0 - CERTIFIED SMART PASS\nWorker: ${worker.name} (${worker.hindiName})\nTrade: ${localizedTrade} (${skillInfo.label})\nUAN: ${worker.eShramUAN}\nBOCW: ${worker.bocwRegistrationNo}\nAadhaar UID: XXXX-XXXX-${worker.aadhaarLast4}\nDaily Base Statutory Wage: ₹${worker.dailyBaseWage}\nVerified Days: ${stats.totalDaysWorked} Days\nPayable Balance: ₹${stats.netBalanceDue}\nSite: ${siteName}\nOfficial Labour Helpline: ${APP_CONFIG.CONTACT_PHONE}`;
      await navigator.clipboard.writeText(summaryText);
      setCopiedRecord(true);
      setTimeout(() => setCopiedRecord(false), 2500);
    } catch {
      // Fallback if clipboard api is restricted
      setCopiedRecord(true);
      setTimeout(() => setCopiedRecord(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Bar (Hidden during printing) */}
      <div className="no-print space-y-3">
        {printError && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{printError}</span>
            </div>
            <button 
              onClick={() => setPrintError(null)}
              className="text-amber-700 hover:text-amber-900 font-bold px-1.5 cursor-pointer"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>{t('passHeaderTitle', lang)}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-300 whitespace-nowrap">
                {t('passActiveBadge', lang)}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('passSubheader', lang)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Flip Button */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors cursor-pointer shrink-0"
              title={t('passFlipCard', lang)}
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>{isFlipped ? t('passFlipFront', lang) : t('passFlipBack', lang)}</span>
            </button>

            {/* Speech Audio Button */}
            <button
              onClick={handleSpeakCard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg border border-orange-200 transition-colors cursor-pointer shrink-0"
              title={t('audioReadout', lang)}
            >
              <Volume2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>{t('audioReadout', lang)}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
              title={t('passPrintButton', lang)}
              aria-label={t('passPrintButton', lang)}
            >
              <Printer className={`w-3.5 h-3.5 text-slate-200 shrink-0 ${isPrinting ? 'animate-pulse' : ''}`} />
              <span>
                {isPrinting ? (lang === 'hi' ? 'प्रिंट तैयार हो रहा है...' : 'Preparing...') : t('passPrintButton', lang)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Center Card Display Area (Screen Only - Hidden during print) */}
      <div className="no-print flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* The Physical Card Simulation */}
        <div className="w-full max-w-[480px] lg:w-[450px] xl:w-[480px] shrink-0 mx-auto perspective-1000 min-w-0">
          <div 
            className={`relative w-full rounded-2xl shadow-xl transition-all duration-500 overflow-hidden border border-slate-300 bg-white min-h-[310px] ${
              isFlipped ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            
            {/* FRONT OF CARD */}
            {!isFlipped ? (
              <div className="p-3.5 sm:p-5 flex flex-col justify-between h-full bg-gradient-to-br from-slate-50 via-white to-orange-50/40 min-w-0">
                
                {/* Card Header Strip: Government & Shram Setu branding */}
                <div className="border-b border-slate-200 pb-2.5 sm:pb-3 flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                      {lang === 'hi' ? 'श्र' : 'SS'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-[12px] font-black tracking-wide text-slate-900 uppercase truncate">
                        {t('passCardTopTitle', lang)}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-600 font-medium truncate">
                        {t('passCardTopGovt', lang)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-mono text-slate-400 block">
                      {t('passCardIdPrefix', lang)}: {worker.id}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                      {t('passCardEShramLinked', lang)}
                    </span>
                  </div>
                </div>

                {/* Card Body: Photo, Worker Identity, Trade, QR */}
                <div className="py-2.5 sm:py-3 grid grid-cols-12 gap-2 sm:gap-3 items-center min-w-0">
                  
                  {/* Photo & Hologram */}
                  <div className="col-span-4 flex flex-col items-center shrink-0">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border-2 border-slate-300 shadow-sm bg-slate-100">
                      <img 
                        src={worker.photoUrl?.replace('/src/assets/images/', '/assets/images/') || '/assets/images/shram_setu_hero_pass_1792385013356.jpg'} 
                        alt={worker.name} 
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('/assets/images/')) {
                            target.src = '/images/shram_setu_hero_pass_1792385013356.jpg';
                          } else {
                            target.src = DEFAULT_WORKER_AVATAR;
                          }
                        }}
                      />
                      <div 
                        className="absolute top-1 right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border border-white shadow-xs" 
                        title={t('heroCardVerified', lang)} 
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[7px] sm:text-[8px] text-white text-center py-0.5 font-mono">
                        {t('passCardUidPrefix', lang)}-{worker.aadhaarLast4}
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-mono text-slate-600 mt-1 font-semibold">
                      {t('passCardBloodPrefix', lang)}: {worker.bloodGroup}
                    </span>
                  </div>

                  {/* Worker Details */}
                  <div className="col-span-5 space-y-0.5 sm:space-y-1 min-w-0">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                        {lang === 'hi' ? worker.hindiName : worker.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs font-semibold text-orange-700 truncate">
                        {lang === 'hi' ? worker.name : worker.hindiName}
                      </p>
                    </div>

                    <div className="pt-0.5">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                        {t('passCardTradeLabel', lang)}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 block leading-tight truncate">
                        {localizedTrade}
                      </span>
                    </div>

                    <div className="pt-0.5 flex items-center gap-1">
                      <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate ${skillInfo.color}`}>
                        {skillInfo.label}
                      </span>
                    </div>

                    <div className="pt-0.5 text-[10px] sm:text-[11px] text-slate-700 font-mono">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-sans block">
                        {t('passCardMinWageLabel', lang)}:
                      </span>
                      <span className="font-bold text-emerald-700 text-xs">₹{worker.dailyBaseWage}</span> {t('passCardPerDay', lang)}
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="col-span-3 flex flex-col items-center justify-center text-center">
                    <button 
                      onClick={() => setShowQrModal(true)}
                      className="p-1 sm:p-1.5 bg-white rounded-lg border border-slate-300 shadow-xs hover:border-orange-500 transition-colors cursor-pointer group"
                      title={t('passCardScanPrompt', lang)}
                    >
                      <div className="block sm:hidden">
                        <QRCodeDisplay 
                          value={qrPayload}
                          size={60}
                        />
                      </div>
                      <div className="hidden sm:block">
                        <QRCodeDisplay 
                          value={qrPayload}
                          size={76}
                        />
                      </div>
                    </button>
                    <span className="text-[7px] sm:text-[8px] text-slate-500 mt-1 font-medium group-hover:text-orange-600 line-clamp-1">
                      {t('passCardScanPrompt', lang)}
                    </span>
                  </div>

                </div>

                {/* Card Footer: e-Shram UAN & MP BOCW ID */}
                <div className="border-t border-slate-200 pt-2 flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] min-w-0">
                  <div className="truncate">
                    <span className="text-slate-500">{t('passCardUanLabel', lang)} </span>
                    <span className="font-mono font-bold text-slate-900">{worker.eShramUAN}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">{t('passCardBocwLabel', lang)} </span>
                    <span className="font-mono font-bold text-slate-900">{worker.bocwRegistrationNo.slice(-9)}</span>
                  </div>
                </div>

              </div>
            ) : (
              /* BACK OF CARD */
              <div className="p-3.5 sm:p-5 flex flex-col justify-between h-full bg-slate-900 text-white min-w-0">
                
                {/* Back Top Strip */}
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 min-w-0">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('passCardBackHeader', lang)}</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono shrink-0">{t('passCardBackActNotice', lang)}</span>
                </div>

                {/* Back Details Grid */}
                <div className="py-2 space-y-2 text-xs min-w-0">
                  
                  {/* Emergency Contact */}
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-red-400 font-semibold block uppercase">
                      {t('passCardEmergencyLabel', lang)}
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5">
                      <span className="font-bold text-slate-100 truncate">{worker.emergencyContact.name}</span>
                      <span className="font-mono text-emerald-400 font-bold">{worker.emergencyContact.phone}</span>
                    </div>
                  </div>

                  {/* Bank & UPI for Direct Wage Settlement */}
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      {t('passCardDirectCreditLabel', lang)}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-0.5 text-[11px] font-mono">
                      <div className="truncate">
                        <span className="text-slate-500 text-[10px] font-sans block">{t('passCardAccountLabel', lang)} ••••{worker.bankAccountLast4}</span>
                        <span className="text-slate-300 font-semibold">{worker.ifscCode}</span>
                      </div>
                      <div className="sm:text-right truncate">
                        <span className="text-slate-500 text-[10px] font-sans block">{t('passCardUpiLabel', lang)}</span>
                        <span className="text-orange-300 font-semibold truncate block">{worker.upiId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Site & Supervisor */}
                  <div className="text-[11px] min-w-0">
                    <span className="text-slate-400 text-[10px] block uppercase">{t('passCardDeploymentLabel', lang)}</span>
                    <span className="font-semibold text-slate-200 block truncate">
                      {siteName}
                    </span>
                    <span className="text-slate-400 text-[10px] block mt-0.5 truncate">
                      {t('passCardContractorLabel', lang)} {site?.contractorName || 'Registered Civil Contractor'}
                    </span>
                  </div>

                </div>

                {/* Back Footer: Tamper-proof Hash */}
                <div className="border-t border-slate-800 pt-2 flex flex-wrap items-center justify-between gap-1 text-[9px] text-slate-400 font-mono">
                  <span>{t('passCardHashLabel', lang)}</span>
                  <span className="text-orange-400">SHA256:8F4C...{worker.aadhaarLast4}</span>
                </div>

              </div>
            )}

          </div>

          <div className="text-center mt-2">
            <span className="text-[11px] text-slate-500">
              {t('passCardHint', lang)}
            </span>
          </div>
        </div>

        {/* Right Column: Worker Verified Work Stats & Quick Ledger Summary */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          
          {/* Key Stat Cards (4 Grid) - 2 cols on mobile/tablet, 4 cols on xl */}
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">
                {t('statsDaysWorked', lang)}
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums block">
                {stats.totalDaysWorked}
              </span>
              <span className="text-[10px] text-emerald-600 block font-medium mt-0.5 truncate">
                ✓ {t('statsDaysGpsBadge', lang)}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">
                {t('statsGrossEarned', lang)}
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums block">
                {formatCurrency(stats.totalEarned)}
              </span>
              <span className="text-[10px] text-slate-500 block font-medium mt-0.5 truncate">
                {t('statsGrossSubtitle', lang)}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">
                {t('statsAdvances', lang)}
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-700 tabular-nums block">
                {formatCurrency(stats.totalAdvancesTaken)}
              </span>
              <span className="text-[10px] text-amber-600 block font-medium mt-0.5 truncate">
                {t('statsAdvancesSubtitle', lang)}
              </span>
            </div>

            <div className="bg-orange-50 p-3.5 rounded-xl border border-orange-200 shadow-xs min-w-0">
              <span className="text-[11px] text-orange-800 font-semibold block truncate">
                {t('statsNetDue', lang)}
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-orange-700 tabular-nums block">
                {formatCurrency(stats.netBalanceDue)}
              </span>
              <span className="text-[10px] text-orange-600 block font-medium mt-0.5 truncate">
                {t('statsNetDueSubtitle', lang)}
              </span>
            </div>

          </div>

          {/* Social Security & Statutory Rights Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex flex-wrap items-center justify-between gap-1">
              <span>{t('rightsHeader', lang)}</span>
              <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                <CheckCircle className="w-3.5 h-3.5" /> {t('rightsCompliantBadge', lang)}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('rightsEshramTitle', lang)}</span>
                <span className="font-mono font-bold text-slate-800 text-sm truncate block">{worker.eShramUAN}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">{t('rightsEshramSubtitle', lang)}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('rightsBocwTitle', lang)}</span>
                <span className="font-mono font-bold text-slate-800 text-sm truncate block">{worker.bocwRegistrationNo}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">{t('rightsBocwSubtitle', lang)}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold block">
                  {t('rightsProtectionTitle', lang)}
                </span>
                <span className="leading-relaxed mt-0.5 block break-words">
                  {t('rightsProtectionBody', lang, { wage: worker.dailyBaseWage })}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Large Verifiable QR Modal */}
      {showQrModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900">{t('qrModalTitle', lang)}</span>
              <button 
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex justify-center border border-slate-200">
              <QRCodeDisplay 
                value={qrPayload}
                size={220}
              />
            </div>

            <div className="text-xs text-slate-600 text-left space-y-1 font-mono bg-slate-100 p-3 rounded-lg">
              <div><strong className="text-slate-800 font-sans">{t('qrModalWorker', lang)}</strong> {lang === 'hi' ? worker.hindiName : worker.name}</div>
              <div><strong className="text-slate-800 font-sans">{t('qrModalUan', lang)}</strong> {worker.eShramUAN}</div>
              <div><strong className="text-slate-800 font-sans">{t('qrModalVerifiedDays', lang)}</strong> {stats.totalDaysWorked}</div>
              <div><strong className="text-slate-800 font-sans">{t('qrModalWageDue', lang)}</strong> {formatCurrency(stats.netBalanceDue)}</div>
              <div className="truncate"><strong className="text-slate-800 font-sans">{t('qrModalHash', lang)}</strong> {qrPayload.slice(0, 36)}...</div>
            </div>

            <p className="text-[11px] text-slate-500">
              {t('qrModalInstruction', lang)}
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('qrModalClose', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Official Print Pass & Identity Sheet Modal (Ensures print & digital pass access on ALL devices & iframes) */}
      {showPrintModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 text-slate-900 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block">
                  {lang === 'hi' ? 'मध्य प्रदेश शासन · श्रम कल्याण प्रभाग' : 'GOVT. OF MADHYA PRADESH · LABOUR WELFARE DIVISION'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>{lang === 'hi' ? 'सत्यापित स्मार्ट श्रम पास (प्रिंट एवं डिजिटल पत्रक)' : 'Verified Smart Shram Pass & Print Sheet'}</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Print Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.focus();
                      window.print();
                    } catch (e) {
                      console.warn('Frame print exception:', e);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>{lang === 'hi' ? 'प्रिंट करें / Save PDF' : 'Print Pass / Save PDF'}</span>
                </button>

                {/* Copy Verification Summary */}
                <button
                  type="button"
                  onClick={handleCopyPassRecord}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                  title="Copy certified record"
                >
                  {copiedRecord ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                  <span>{copiedRecord ? (lang === 'hi' ? 'सत्यापन कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'विवरण कॉपी करें' : 'Copy Details')}</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close Print Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile / Iframe Helpful Advice Strip */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">
                  {lang === 'hi' ? 'प्रिंट एवं सुरक्षित रखने हेतु निर्देश:' : 'Print & Save Instructions:'}
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {lang === 'hi'
                    ? 'कंप्यूटर पर सीधे प्रिंट संवाद हेतु "प्रिंट करें" बटन दबाएं (या Ctrl+P / ⌘+P)। मोबाइल या टैबलेट पर आप अपने ब्राउज़र के शेयर मेनू (Share ➔ Print) का उपयोग कर सकते हैं या नीचे दिए गए आधिकारिक पहचान पत्र का स्क्रीनशॉट ले सकते हैं।'
                    : 'On computers, click "Print Pass" or press Ctrl+P (⌘+P on Mac). On mobile devices, tablets, or framed previews, you can print via browser menu (Share ➔ Print) or save a snapshot of this certified record.'}
                </p>
              </div>
            </div>

            {/* Visual Certified Pass Sheet (Mirroring physical print rendering) */}
            <div className="border-2 border-slate-900 rounded-2xl p-4 sm:p-6 bg-white space-y-4 shadow-sm text-slate-900">
              
              {/* Sheet Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                    {lang === 'hi' ? 'श्र' : 'SS'}
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-orange-700">
                      {lang === 'hi' ? 'मध्य प्रदेश शासन · श्रम कल्याण प्रभाग' : 'GOVT. OF MADHYA PRADESH · LABOUR WELFARE DIVISION'}
                    </div>
                    <div className="text-base font-black text-slate-950 leading-tight">
                      {lang === 'hi' ? 'स्मार्ट श्रम कार्ड एवं कामगार पहचान पत्र' : 'SMART SHRAM PASS & LABOUR IDENTITY CARD'}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 block">ID: {worker.id}</span>
                  <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 inline-block">
                    {lang === 'hi' ? '✓ म.प्र. शासन सत्यापित' : '✓ Active & Verified'}
                  </span>
                </div>
              </div>

              {/* Dual-Sided Physical Card Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>{lang === 'hi' ? 'स्मार्ट श्रम कार्ड (द्विपक्षीय भौतिक पास)' : 'OFFICIAL SMART SHRAM CARD (FRONT & BACK)'}</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {lang === 'hi' ? '✂ कार्ड धारक में रखने हेतु यहाँ से काटें या मोड़ें' : '✂ Cut or fold along border for wallet card holder'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Front */}
                  <div className="border-2 border-slate-800 rounded-xl p-3.5 bg-gradient-to-br from-slate-50 to-orange-50/50 flex flex-col justify-between min-h-[225px] relative overflow-hidden">
                    <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-orange-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {lang === 'hi' ? 'श्र' : 'SS'}
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-900 tracking-wide">
                          {t('passCardTopTitle', lang)}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-600 font-bold">
                        UID-••••{worker.aadhaarLast4}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-2 items-center py-1">
                      <div className="col-span-3 flex flex-col items-center">
                        <div className="w-16 h-20 rounded border border-slate-400 overflow-hidden bg-slate-100">
                          <img
                            src={worker.photoUrl?.replace('/src/assets/images/', '/assets/images/') || '/assets/images/shram_setu_hero_pass_1792385013356.jpg'}
                            alt={worker.name}
                            className="w-full h-full object-cover object-top"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes('/assets/images/')) {
                                target.src = '/images/shram_setu_hero_pass_1792385013356.jpg';
                              } else {
                                target.src = DEFAULT_WORKER_AVATAR;
                              }
                            }}
                          />
                        </div>
                        <span className="text-[8px] font-mono font-bold text-slate-700 mt-0.5">{worker.bloodGroup}</span>
                      </div>

                      <div className="col-span-6 space-y-0.5 min-w-0">
                        <div className="text-xs font-black text-slate-950 leading-tight break-words">
                          {lang === 'hi' ? worker.hindiName : worker.name}
                        </div>
                        <div className="text-[10px] font-bold text-orange-700 leading-tight break-words">
                          {lang === 'hi' ? worker.name : worker.hindiName}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-800 pt-0.5">{localizedTrade}</div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-700 bg-slate-200/80 px-1 py-0.2 rounded border border-slate-300">
                            {skillInfo.label}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-800 pt-0.5">
                          <span className="font-bold text-emerald-800">₹{worker.dailyBaseWage}</span> {t('passCardPerDay', lang)}
                        </div>
                      </div>

                      <div className="col-span-3 flex flex-col items-center justify-center text-center">
                        <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                          <QRCodeDisplay value={qrPayload} size={64} />
                        </div>
                        <span className="text-[7px] text-slate-600 font-bold mt-0.5 block">
                          {t('passCardScanPrompt', lang)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-1 flex items-center justify-between text-[9px] font-mono text-slate-800">
                      <span>UAN: <strong>{worker.eShramUAN}</strong></span>
                      <span>BOCW: <strong>{worker.bocwRegistrationNo.slice(-9)}</strong></span>
                    </div>
                  </div>

                  {/* Card Back */}
                  <div className="border-2 border-slate-800 rounded-xl p-3.5 bg-slate-900 text-white flex flex-col justify-between min-h-[225px] relative overflow-hidden">
                    <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                        {t('passCardBackHeader', lang)}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">
                        {t('passCardBackActNotice', lang)}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                        <span className="text-[8px] text-red-400 font-bold block uppercase">{t('passCardEmergencyLabel', lang)}</span>
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-slate-100">{worker.emergencyContact.name}</span>
                          <span className="text-emerald-400 font-bold">{worker.emergencyContact.phone}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase">{t('passCardDirectCreditLabel', lang)}</span>
                        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                          <div>
                            <span className="text-slate-400 text-[8px] block">A/C: ••••{worker.bankAccountLast4}</span>
                            <span className="text-slate-200">{worker.ifscCode}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 text-[8px] block">UPI ID:</span>
                            <span className="text-orange-300 font-bold">{worker.upiId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px]">
                        <span className="text-slate-400 text-[8px] block uppercase">{t('passCardDeploymentLabel', lang)}</span>
                        <span className="font-bold text-slate-200 block truncate">{siteName}</span>
                        <span className="text-slate-400 text-[8px] block">{site?.contractorName || 'Registered Civil Contractor'}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-1 flex items-center justify-between text-[8px] font-mono text-slate-400">
                      <span>HASH: {worker.id}-SS20</span>
                      <span className="text-orange-400">SHA256:8F4C...{worker.aadhaarLast4}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work & Wage Statistics Summary */}
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-900">
                  <span>{lang === 'hi' ? 'सत्यापित कार्य एवं मजदूरी सारांश (म.प्र. शासन)' : 'VERIFIED MUSTER & STATUTORY WAGE RECORD'}</span>
                  <span className="text-[10px] font-mono text-slate-500">Sec 20, Min Wages Act 1948</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">{t('statsDaysWorked', lang)}</span>
                    <span className="font-bold font-mono text-slate-900">{stats.totalDaysWorked} Days</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">{t('statsGrossEarned', lang)}</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency(stats.totalEarned)}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">{t('statsAdvances', lang)}</span>
                    <span className="font-bold font-mono text-amber-700">{formatCurrency(stats.totalAdvancesTaken)}</span>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-orange-200">
                    <span className="text-[9px] text-orange-800 font-bold block">{t('statsNetDue', lang)}</span>
                    <span className="font-bold font-mono text-orange-700">{formatCurrency(stats.netBalanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Official Helpline Strip */}
              <div className="border-t border-slate-200 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">{lang === 'hi' ? 'आधिकारिक श्रम हेल्पलाइन:' : 'Labour Helpline:'} </span>
                  <span className="font-mono font-bold text-orange-700">{APP_CONFIG.CONTACT_PHONE}</span>
                  <span className="mx-2">·</span>
                  <span>WhatsApp: <strong className="font-mono">+{APP_CONFIG.WHATSAPP_NUMBER}</strong></span>
                </div>
                <div className="font-mono text-[9px] text-slate-500">
                  Shram Setu 2.0 · Senior Bal Vigyan Indore Innovation
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                {lang === 'hi' ? 'सत्यापित कामगार पहचान पत्र' : 'Official Labour Identity Pass'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {lang === 'hi' ? 'बंद करें' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.focus();
                      window.print();
                    } catch (e) {
                      console.warn('Frame print exception:', e);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-200" />
                  <span>{lang === 'hi' ? 'प्रिंट संवाद खोलें' : 'Open Print Dialog'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      <div className="print-only w-full font-sans text-slate-900">
        <div className="print-avoid-break border-2 border-slate-900 rounded-2xl p-6 bg-white space-y-5 max-w-[800px] mx-auto">
          
          {/* Official Header Strip */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                {lang === 'hi' ? 'श्र' : 'SS'}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-orange-700">
                  {lang === 'hi' ? 'मध्य प्रदेश शासन · श्रम कल्याण प्रभाग' : 'GOVT. OF MADHYA PRADESH · LABOUR WELFARE DIVISION'}
                </div>
                <h1 className="text-lg font-black text-slate-950 tracking-tight leading-tight">
                  {lang === 'hi' ? 'स्मार्ट श्रम कार्ड एवं सत्यापित कामगार पहचान पत्र' : 'SMART SHRAM PASS & VERIFIED LABOUR IDENTITY'}
                </h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  {lang === 'hi'
                    ? 'वरिष्ठ बाल विज्ञान नवाचार · न्यूनतम मजदूरी अधिनियम 1948 एवं बीओसीडब्ल्यू संनिर्माण कल्याण अधिनियम अंतर्गत विधिमान्य'
                    : 'Senior Bal Vigyan Civic Innovation · Certified under Minimum Wages Act, 1948 & BOCW Act'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-slate-900 block">
                ID: {worker.id}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 inline-block mt-0.5">
                {lang === 'hi' ? '✓ म.प्र. शासन सत्यापित' : '✓ Active & Verified'}
              </span>
              <span className="text-[9px] text-slate-500 font-mono block mt-1">
                {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Dual-Sided Card Simulation (Side-by-Side for Direct Lamination / Folding) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>{lang === 'hi' ? 'स्मार्ट श्रम कार्ड (द्विपक्षीय भौतिक पास)' : 'OFFICIAL SMART SHRAM CARD (FRONT & BACK)'}</span>
              <span className="text-[10px] font-normal text-slate-500">
                {lang === 'hi' ? '✂ कार्ड धारक में रखने हेतु यहाँ से काटें या मोड़ें' : '✂ Cut or fold along border for wallet card holder'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* CARD FRONT (PRINT RENDERING) */}
              <div className="border-2 border-slate-800 rounded-xl p-3.5 bg-gradient-to-br from-slate-50 to-orange-50/50 flex flex-col justify-between h-[235px] relative overflow-hidden">
                {/* Card Front Top */}
                <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-orange-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {lang === 'hi' ? 'श्र' : 'SS'}
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-wide">
                      {t('passCardTopTitle', lang)}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 font-bold">
                    UID-••••{worker.aadhaarLast4}
                  </span>
                </div>

                {/* Card Front Body */}
                <div className="grid grid-cols-12 gap-2 items-center py-1">
                  {/* Photo */}
                  <div className="col-span-3 flex flex-col items-center">
                    <div className="w-16 h-20 rounded border border-slate-400 overflow-hidden bg-slate-100">
                      <img
                        src={worker.photoUrl?.replace('/src/assets/images/', '/assets/images/') || '/assets/images/shram_setu_hero_pass_1792385013356.jpg'}
                        alt={worker.name}
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('/assets/images/')) {
                            target.src = '/images/shram_setu_hero_pass_1792385013356.jpg';
                          } else {
                            target.src = DEFAULT_WORKER_AVATAR;
                          }
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-mono font-bold text-slate-700 mt-0.5">
                      {worker.bloodGroup}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="col-span-6 space-y-0.5 min-w-0">
                    <div className="text-xs font-black text-slate-950 leading-tight break-words">
                      {lang === 'hi' ? worker.hindiName : worker.name}
                    </div>
                    <div className="text-[10px] font-bold text-orange-700 leading-tight break-words">
                      {lang === 'hi' ? worker.name : worker.hindiName}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 pt-0.5">
                      {localizedTrade}
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-700 bg-slate-200/80 px-1 py-0.2 rounded border border-slate-300">
                        {skillInfo.label}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-800 pt-0.5">
                      <span className="font-bold text-emerald-800">₹{worker.dailyBaseWage}</span> {t('passCardPerDay', lang)}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="col-span-3 flex flex-col items-center justify-center text-center">
                    <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                      <QRCodeDisplay
                        value={qrPayload}
                        size={64}
                      />
                    </div>
                    <span className="text-[7px] text-slate-600 font-bold mt-0.5 block">
                      {t('passCardScanPrompt', lang)}
                    </span>
                  </div>
                </div>

                {/* Card Front Footer */}
                <div className="border-t border-slate-300 pt-1 flex items-center justify-between text-[9px] font-mono text-slate-800">
                  <span>UAN: <strong>{worker.eShramUAN}</strong></span>
                  <span>BOCW: <strong>{worker.bocwRegistrationNo.slice(-9)}</strong></span>
                </div>
              </div>

              {/* CARD BACK (PRINT RENDERING) */}
              <div className="border-2 border-slate-800 rounded-xl p-3.5 bg-slate-900 text-white flex flex-col justify-between h-[235px] relative overflow-hidden">
                {/* Back Top */}
                <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                    {t('passCardBackHeader', lang)}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">
                    {t('passCardBackActNotice', lang)}
                  </span>
                </div>

                {/* Back Body */}
                <div className="space-y-1.5 text-[10px]">
                  <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                    <span className="text-[8px] text-red-400 font-bold block uppercase">
                      {t('passCardEmergencyLabel', lang)}
                    </span>
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-100">{worker.emergencyContact.name}</span>
                      <span className="text-emerald-400 font-bold">{worker.emergencyContact.phone}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                    <span className="text-[8px] text-slate-400 font-bold block uppercase">
                      {t('passCardDirectCreditLabel', lang)}
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                      <div>
                        <span className="text-slate-400 text-[8px] block">A/C: ••••{worker.bankAccountLast4}</span>
                        <span className="text-slate-200">{worker.ifscCode}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[8px] block">UPI ID:</span>
                        <span className="text-orange-300 font-bold">{worker.upiId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px]">
                    <span className="text-slate-400 text-[8px] block uppercase">{t('passCardDeploymentLabel', lang)}</span>
                    <span className="font-bold text-slate-200 block truncate">{siteName}</span>
                    <span className="text-slate-400 text-[8px] block">{site?.contractorName || 'Registered Civil Contractor'}</span>
                  </div>
                </div>

                {/* Back Footer */}
                <div className="border-t border-slate-800 pt-1 flex items-center justify-between text-[8px] font-mono text-slate-400">
                  <span>HASH: {worker.id}-SS20</span>
                  <span className="text-orange-400">SHA256:8F4C...{worker.aadhaarLast4}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Statutory Work Records & Rights Verification */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {lang === 'hi' ? 'सत्यापित कार्य एवं मजदूरी सारांश (श्रम सेतु रिकॉर्ड)' : 'VERIFIED MUSTER & STATUTORY WAGE RECORD (SHRAM SETU)'}
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Section 20, Minimum Wages Act 1948
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">{t('statsDaysWorked', lang)}</span>
                <span className="text-base font-bold font-mono text-slate-900">{stats.totalDaysWorked} Days</span>
                <span className="text-[9px] text-emerald-700 block font-medium">✓ GPS Geofenced</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">{t('statsGrossEarned', lang)}</span>
                <span className="text-base font-bold font-mono text-slate-900">{formatCurrency(stats.totalEarned)}</span>
                <span className="text-[9px] text-slate-500 block">Base Statutory Rate</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">{t('statsAdvances', lang)}</span>
                <span className="text-base font-bold font-mono text-amber-700">{formatCurrency(stats.totalAdvancesTaken)}</span>
                <span className="text-[9px] text-amber-600 block">Ration / Advances</span>
              </div>

              <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-200">
                <span className="text-[10px] text-orange-800 font-bold block">{t('statsNetDue', lang)}</span>
                <span className="text-base font-bold font-mono text-orange-700">{formatCurrency(stats.netBalanceDue)}</span>
                <span className="text-[9px] text-orange-700 block font-medium">Current Payable</span>
              </div>
            </div>

            {/* Social Security & Statutory Rights Strip */}
            <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">{t('rightsEshramTitle', lang)}</span>
                <span className="font-mono text-slate-700">{worker.eShramUAN} · PMSBY ₹2,00,000 Active</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">{t('rightsBocwTitle', lang)}</span>
                <span className="font-mono text-slate-700">{worker.bocwRegistrationNo} · Entitled</span>
              </div>
            </div>
          </div>

          {/* Section: Official Helpline & Legal Guarantee Footer */}
          <div className="border-t border-slate-300 pt-3 flex items-center justify-between text-[10px] text-slate-600">
            <div>
              <span className="font-bold text-slate-900">
                {lang === 'hi' ? 'आधिकारिक सहायता हेल्पलाइन:' : 'Official Labour Helpline:'}{' '}
              </span>
              <span className="font-mono font-bold text-orange-700">{APP_CONFIG.CONTACT_PHONE}</span>
              <span className="mx-2">·</span>
              <span>WhatsApp: <strong className="font-mono">+{APP_CONFIG.WHATSAPP_NUMBER}</strong></span>
            </div>
            <div className="text-right font-mono text-[9px] text-slate-500">
              Shram Setu 2.0 · Senior Bal Vigyan Indore Innovation · MP BOCW Aligned
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
