import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Share2, 
  Volume2, 
  Search,
  Check,
  ExternalLink
} from 'lucide-react';
import { Worker, WageLedgerEntry, ConstructionSite, PaymentType, PaymentMode } from '../types';
import { Language, t, formatCurrency, getLocalizedTrade } from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';

interface WageProtectionLedgerProps {
  worker: Worker;
  ledgerEntries: WageLedgerEntry[];
  site?: ConstructionSite;
  stats: {
    totalDaysWorked: number;
    totalEarned: number;
    totalAdvancesTaken: number;
    netBalanceDue: number;
  };
  onAddLedgerEntry: (entry: WageLedgerEntry) => void;
  lang: Language;
}

export const WageProtectionLedger: React.FC<WageProtectionLedgerProps> = ({
  worker,
  ledgerEntries,
  site,
  stats,
  onAddLedgerEntry,
  lang,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'advance'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);

  // Modal form states
  const [entryType, setEntryType] = useState<PaymentType>('advance_kharcha');
  const [amount, setAmount] = useState<string>('500');
  const [desc, setDesc] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [utrNumber, setUtrNumber] = useState<string>('');

  const localizedTrade = getLocalizedTrade(worker.trade, lang);
  const workerDisplayName = lang === 'hi' ? worker.hindiName : worker.name;
  const siteDisplayName = lang === 'hi' && site?.hindiName ? site.hindiName : (site?.name || worker.activeSiteId);

  const handleSpeakLedger = () => {
    if (lang === 'hi') {
      speech.speak(
        `${worker.hindiName} का मजदूरी खाता। कुल अर्जित मजदूरी ₹${stats.totalEarned}। लिया गया अग्रिम खर्चा ₹${stats.totalAdvancesTaken}। वर्तमान में शुद्ध देय बकाया राशि ₹${stats.netBalanceDue} है। सहायता हेतु हेल्पलाइन ${APP_CONFIG.CONTACT_PHONE}।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `Wage ledger for ${worker.name}. Gross statutory wages: ₹${stats.totalEarned}. Advances taken: ₹${stats.totalAdvancesTaken}. Net payable balance: ₹${stats.netBalanceDue}. Project Helpline ${APP_CONFIG.CONTACT_PHONE}.`,
        'en-IN'
      );
    }
  };

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const actualAmount = entryType === 'advance_kharcha' ? -numAmount : numAmount;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const randomUtr = utrNumber.trim() || `UPI-SS-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const defaultDescEn = entryType === 'advance_kharcha' ? 'Household ration and medical advance' : 'Direct weekly wage payout';
    const defaultDescHi = entryType === 'advance_kharcha' ? 'पारिवारिक राशन व दवाई अग्रिम खर्चा' : 'साप्ताहिक मजदूरी भुगतान';

    const finalDesc = desc.trim() || (lang === 'hi' ? defaultDescHi : defaultDescEn);

    const newEntry: WageLedgerEntry = {
      id: `LDG-${Date.now()}`,
      workerId: worker.id,
      date: dateStr,
      type: entryType,
      amount: actualAmount,
      description: finalDesc,
      hindiDescription: entryType === 'advance_kharcha' ? 'पारिवारिक अग्रिम खर्चा भुगतान' : 'साप्ताहिक मजदूरी भुगतान',
      paymentMode,
      status: 'settled',
      utrOrReceiptNo: randomUtr,
      siteId: site?.id || worker.activeSiteId,
      siteName: site?.name || 'Indore Construction Project',
      contractorName: site?.contractorName || 'Registered Civil Contractor',
    };

    onAddLedgerEntry(newEntry);
    setShowModal(false);
    setDesc('');
    setUtrNumber('');

    if (lang === 'hi') {
      speech.speak(
        `लेन-देन दर्ज हुआ। ₹${numAmount} का ${entryType === 'advance_kharcha' ? 'खर्चा' : 'भुगतान'} खाते में अद्यतन कर दिया गया है।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `Transaction logged. ₹${numAmount} updated in wage ledger.`,
        'en-IN'
      );
    }
  };

  const generateWhatsAppSlipText = () => {
    if (lang === 'hi') {
      return `*${t('whatsappSlipHeader', 'hi')}*
---------------------------------
*${t('whatsappWorkerLabel', 'hi')}* ${worker.hindiName} (${worker.name})
*${t('whatsappTradeLabel', 'hi')}* ${getLocalizedTrade(worker.trade, 'hi')}
*${t('whatsappUanLabel', 'hi')}* ${worker.eShramUAN}
*${t('whatsappBocwLabel', 'hi')}* ${worker.bocwRegistrationNo}
*${t('whatsappSiteLabel', 'hi')}* ${siteDisplayName}
---------------------------------
*${t('whatsappDaysWorkedLabel', 'hi')}* ${stats.totalDaysWorked} दिन
*${t('whatsappDailyRateLabel', 'hi')}* ₹${worker.dailyBaseWage}/दिन
*${t('whatsappGrossWagesLabel', 'hi')}* ₹${stats.totalEarned}
*${t('whatsappAdvancesLabel', 'hi')}* -₹${stats.totalAdvancesTaken}
---------------------------------
*${t('whatsappNetDueLabel', 'hi')}* ₹${stats.netBalanceDue}
*${t('whatsappVerificationLabel', 'hi')}*
---------------------------------
_${t('whatsappHelplineNotice', 'hi')} ${APP_CONFIG.CONTACT_PHONE}_`;
    }

    return `*${t('whatsappSlipHeader', 'en')}*
---------------------------------
*${t('whatsappWorkerLabel', 'en')}* ${worker.name}
*${t('whatsappTradeLabel', 'en')}* ${getLocalizedTrade(worker.trade, 'en')}
*${t('whatsappUanLabel', 'en')}* ${worker.eShramUAN}
*${t('whatsappBocwLabel', 'en')}* ${worker.bocwRegistrationNo}
*${t('whatsappSiteLabel', 'en')}* ${siteDisplayName}
---------------------------------
*${t('whatsappDaysWorkedLabel', 'en')}* ${stats.totalDaysWorked} days
*${t('whatsappDailyRateLabel', 'en')}* ₹${worker.dailyBaseWage}/day
*${t('whatsappGrossWagesLabel', 'en')}* ₹${stats.totalEarned}
*${t('whatsappAdvancesLabel', 'en')}* -₹${stats.totalAdvancesTaken}
---------------------------------
*${t('whatsappNetDueLabel', 'en')}* ₹${stats.netBalanceDue}
*${t('whatsappVerificationLabel', 'en')}*
---------------------------------
_${t('whatsappHelplineNotice', 'en')} ${APP_CONFIG.CONTACT_PHONE}_`;
  };

  const handleCopyWhatsAppSlip = () => {
    const slipText = generateWhatsAppSlipText();
    navigator.clipboard.writeText(slipText);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 3000);
  };

  const filteredEntries = ledgerEntries.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.hindiDescription && entry.hindiDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.utrOrReceiptNo && entry.utrOrReceiptNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.date.includes(searchQuery);

    if (filterType === 'credit') return matchesSearch && entry.amount > 0;
    if (filterType === 'advance') return matchesSearch && entry.amount < 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Ledger Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {t('ledgerTitle', lang)}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('ledgerSubtitle', lang)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSpeakLedger}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg border border-orange-200 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-orange-600" />
              <span>{t('ledgerListenSummary', lang)}</span>
            </button>

            {/* Copy / WhatsApp Slip Button */}
            <button
              onClick={handleCopyWhatsAppSlip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 transition-colors cursor-pointer"
              title="Copy WhatsApp-ready wage slip"
            >
              {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{copiedSlip ? t('ledgerSlipCopied', lang) : t('ledgerWhatsAppButton', lang)}</span>
            </button>

            <button
              onClick={() => {
                setDesc('');
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('ledgerRecordAdvanceBtn', lang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <span className="text-xs text-slate-500 block font-medium truncate">
              {t('ledgerGrossCardTitle', lang)}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 tabular-nums block">
              {formatCurrency(stats.totalEarned)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
              {stats.totalDaysWorked} {t('ledgerGrossDaysVerified', lang)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 ml-2">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <span className="text-xs text-slate-500 block font-medium truncate">
              {t('ledgerAdvancesCardTitle', lang)}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-700 tabular-nums block">
              {formatCurrency(-stats.totalAdvancesTaken)}
            </span>
            <span className="text-[11px] text-amber-600 block mt-0.5 truncate">
              {t('ledgerAdvancesSubtitle', lang)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 ml-2">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-orange-50/80 p-4 rounded-xl border border-orange-200 shadow-xs flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <span className="text-xs text-orange-900 font-semibold block truncate">
              {t('ledgerNetBalanceCardTitle', lang)}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-orange-700 tabular-nums block">
              {formatCurrency(stats.netBalanceDue)}
            </span>
            <span className="text-[11px] text-orange-800 block mt-0.5 font-medium truncate">
              {t('ledgerNetBalanceSubtitle', lang)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-700 font-bold shrink-0 ml-2">
            ₹
          </div>
        </div>

      </div>

      {/* Ledger Table Container */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 min-w-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t('ledgerHistoryTitle', lang)}
            </h3>
            <span className="text-[11px] text-slate-500">
              {filteredEntries.length} {lang === 'hi' ? 'प्रविष्टियां दर्ज' : 'transactions found'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter segments */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t('ledgerFilterAll', lang)}
              </button>
              <button
                onClick={() => setFilterType('credit')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  filterType === 'credit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t('ledgerFilterEarnings', lang)}
              </button>
              <button
                onClick={() => setFilterType('advance')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  filterType === 'advance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t('ledgerFilterAdvances', lang)}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ledgerSearchPlaceholder', lang)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl w-full max-w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">{t('ledgerColDate', lang)}</th>
                <th className="py-2.5 px-3">{t('ledgerColDescription', lang)}</th>
                <th className="py-2.5 px-3">{t('ledgerColType', lang)}</th>
                <th className="py-2.5 px-3">{t('ledgerColModeUtr', lang)}</th>
                <th className="py-2.5 px-3 text-right">{t('ledgerColAmount', lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {t('ledgerNoTransactions', lang)}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isCredit = entry.amount > 0;
                  const displayDesc = lang === 'hi' && entry.hindiDescription ? entry.hindiDescription : entry.description;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {entry.date}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block">
                          {displayDesc}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {entry.siteName}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${
                            isCredit
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {entry.type === 'daily_credit'
                            ? t('ledgerTagMusterWage', lang)
                            : entry.type === 'advance_kharcha'
                            ? t('ledgerTagAdvanceKharcha', lang)
                            : t('ledgerTagSettlement', lang)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        <span className="uppercase font-semibold block text-[10px] text-slate-500">
                          {entry.paymentMode}
                        </span>
                        <span className="truncate max-w-[120px] block" title={entry.utrOrReceiptNo}>
                          {entry.utrOrReceiptNo || t('ledgerCashVoucher', lang)}
                        </span>
                      </td>

                      <td className={`py-2.5 px-3 text-right font-mono font-bold text-sm tabular-nums ${
                        isCredit ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {formatCurrency(entry.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* RECORD ADVANCE / PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {t('modalAdvanceTitle', lang)}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-3.5 text-xs">
              
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('modalAdvanceTypeLabel', lang)}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEntryType('advance_kharcha');
                      setDesc(lang === 'hi' ? 'पारिवारिक राशन व आवश्यक खर्च' : 'Household ration and grocery support');
                    }}
                    className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                      entryType === 'advance_kharcha'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {t('modalAdvanceTypeAdvance', lang)}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEntryType('weekly_settlement');
                      setDesc(lang === 'hi' ? 'साप्ताहिक मजदूरी भुगतान' : 'Direct weekly wage payout');
                    }}
                    className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                      entryType === 'weekly_settlement'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {t('modalAdvanceTypeSettlement', lang)}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('modalAdvanceAmountLabel', lang)}
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  max="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('modalAdvanceDescLabel', lang)}
                </label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={t('modalAdvanceDescPlaceholder', lang)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('modalAdvanceModeLabel', lang)}
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
                  >
                    <option value="upi">{t('modalAdvanceModeUpi', lang)}</option>
                    <option value="bank_transfer">{t('modalAdvanceModeBank', lang)}</option>
                    <option value="cash">{t('modalAdvanceModeCash', lang)}</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('modalAdvanceUtrLabel', lang)}
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder={t('modalAdvanceUtrPlaceholder', lang)}
                    className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t('modalAdvanceCancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {t('modalAdvanceSave', lang)}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
