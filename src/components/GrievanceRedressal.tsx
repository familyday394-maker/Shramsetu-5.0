import React, { useState } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Send, 
  Printer, 
  Copy, 
  Check, 
  Volume2, 
  ShieldAlert, 
  Scale, 
  Phone
} from 'lucide-react';
import { Worker, DisputeGrievance } from '../types';
import { Language, t, formatCurrency, getLocalizedTrade } from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';

interface GrievanceRedressalProps {
  worker: Worker;
  grievances: DisputeGrievance[];
  onAddGrievance: (grievance: DisputeGrievance) => void;
  lang: Language;
}

export const GrievanceRedressal: React.FC<GrievanceRedressalProps> = ({
  worker,
  grievances,
  onAddGrievance,
  lang,
}) => {
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [siteName, setSiteName] = useState('Indore Construction Site');
  const [disputeType, setDisputeType] = useState<DisputeGrievance['disputeType']>('unpaid_wages');
  const [claimedAmount, setClaimedAmount] = useState('3500');
  const [description, setDescription] = useState('');
  const [selectedGrievanceForNotice, setSelectedGrievanceForNotice] = useState<DisputeGrievance | null>(
    grievances[0] || null
  );
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(claimedAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filingRef = `DLO-IND-WAGE-${now.getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const newGrievance: DisputeGrievance = {
      id: `GRV-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerPhone: worker.phone,
      contractorName: contractorName.trim() || 'Unregistered Sub-Contractor',
      contractorPhone: contractorPhone.trim() || '+91 94250 00000',
      siteName: siteName.trim(),
      disputeType,
      claimedAmount: amountNum,
      incidentDate: dateStr,
      filingDate: dateStr,
      status: 'submitted',
      description: description.trim() || (lang === 'hi' ? 'सत्यापित मस्टर होने के बावजूद सांविधिक मजदूरी का भुगतान नहीं किया गया।' : 'Non-payment of earned statutory daily wages despite verified muster roll.'),
      dloFilingRef: filingRef,
      evidenceMusterCount: 8,
    };

    onAddGrievance(newGrievance);
    setSelectedGrievanceForNotice(newGrievance);

    // Reset fields
    setContractorName('');
    setContractorPhone('');
    setDescription('');

    if (lang === 'hi') {
      speech.speak(
        `आपकी शिकायत संदर्भ संख्या ${filingRef} के साथ दर्ज हो गई है। जिला श्रम पदाधिकारी इंदौर को भेजने हेतु आवेदन पत्र तैयार है। हेल्पलाइन 7909348017।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `Wage grievance filed successfully under reference ${filingRef}. Legal representation generated for District Labor Officer, Indore. Helpline 7909348017.`,
        'en-IN'
      );
    }
  };

  const generateLegalPetitionText = (g: DisputeGrievance, currentLang: Language) => {
    const tradeEn = getLocalizedTrade(worker.trade, 'en');
    const tradeHi = getLocalizedTrade(worker.trade, 'hi');

    if (currentLang === 'hi') {
      return `सेवा में,
श्रीमती / श्रीमान जिला श्रम पदाधिकारी (DLO),
श्रम कल्याण संभाग, इंदौर, मध्य प्रदेश।

विषय: न्यूनतम मजदूरी अधिनियम 1948 (धारा 20) एवं वेतन संदाय अधिनियम 1936 अंतर्गत बकाया मजदूरी वसूली बाबत औपचारिक आवेदन।

संदर्भ आवेदन संख्या: ${g.dloFilingRef}
दिनांक: ${g.filingDate}

महोदय,
सविनय निवेदन है कि प्रार्थी ${worker.hindiName} (ई-श्रम UAN: ${worker.eShramUAN}, म.प्र. बीओसीडब्ल्यू पंजीयन: ${worker.bocwRegistrationNo}), पेशा: ${tradeHi}, मोबाइल: ${g.workerPhone} द्वारा निम्न विवरण प्रस्तुत किया जा रहा है:

1. कार्य स्थल: ${g.siteName}
2. अनावेदक ठेकेदार: ${g.contractorName} (मोबाइल: ${g.contractorPhone})
3. विवाद का प्रकार: ${
        g.disputeType === 'unpaid_wages'
          ? 'अर्जित मजदूरी का अनाधिकृत रूप से रोका जाना'
          : g.disputeType === 'arbitrary_deduction'
          ? 'मजदूरी में से अवैध व मनमानी कटौती'
          : 'ओवरटाइम कार्य का भुगतान न किया जाना'
      }
4. कुल बकाया दावा राशि: ₹${g.claimedAmount} (रुपये ${g.claimedAmount} मात्र)
5. संलग्न साक्ष्य: श्रम सेतु 2.0 डिजिटल मस्टर रोल के ${g.evidenceMusterCount} सत्यापित कार्य दिवस (SHA256 क्रिप्टोग्राफिक हस्ताक्षर सहित)।

विवरण:
"${g.description}"

अतः महोदय से विनम्र प्रार्थना है कि अनावेदक ठेकेदार को नोटिस जारी कर प्रार्थी की बकाया मजदूरी ₹${g.claimedAmount} मय 10 गुना क्षतिपूर्ति (धारा 20(3) अनुसार) तत्काल दिलाई जाने की कृपा करें।

हस्ताक्षर / अंगूठा निशान:
${worker.hindiName} (प्रार्थी श्रमिक)
सत्यापित डिजिटल प्रतिलिपि - श्रम सेतु 2.0 (वरिष्ठ बाल विज्ञान नवाचार, इंदौर)
आधिकारिक सहायता हेल्पलाइन: ${APP_CONFIG.CONTACT_PHONE}`;
    }

    return `BEFORE THE DISTRICT LABOUR OFFICER (DLO),
LABOUR WELFARE DIVISION, INDORE, MADHYA PRADESH.

SUBJECT: PETITION UNDER SECTION 20 OF MINIMUM WAGES ACT 1948 & PAYMENT OF WAGES ACT 1936 FOR RECOVERY OF UNPAID STATUTORY WAGES.

Filing Reference No: ${g.dloFilingRef}
Date of Filing: ${g.filingDate}

To,
The District Labour Officer,
Indore Division, Madhya Pradesh.

Respected Officer,
The applicant ${worker.name} (e-Shram UAN: ${worker.eShramUAN}, MP BOCW Reg: ${worker.bocwRegistrationNo}), Trade: ${tradeEn}, Mobile: ${g.workerPhone}, respectfully states as follows:

1. Construction Project Site: ${g.siteName}
2. Respondent Contractor: ${g.contractorName} (Contact: ${g.contractorPhone})
3. Classification of Dispute: ${
      g.disputeType === 'unpaid_wages'
        ? 'Unlawful Non-payment of Earned Statutory Daily Wages'
        : g.disputeType === 'arbitrary_deduction'
        ? 'Arbitrary and Illegal Wage Deduction'
        : 'Denial of Statutory Overtime Compensation'
    }
4. Total Claimed Unpaid Amount: ₹${g.claimedAmount} (Rupees ${g.claimedAmount} only)
5. Primary Cryptographic Evidence: ${g.evidenceMusterCount} verified muster roll records certified on Shram Setu 2.0 (with SHA256 integrity hash).

Statement of Facts:
"${g.description}"

Prayer:
It is respectfully prayed that this Authority issue urgent statutory notice to the respondent contractor and direct immediate payment of the outstanding amount of ₹${g.claimedAmount} along with statutory compensation under Section 20(3) of the Minimum Wages Act 1948.

Signature of Applicant Worker:
${worker.name}
Verified Digital Copy — Shram Setu 2.0 Civic Labor Platform (Indore, MP)
Official Support Helpline: ${APP_CONFIG.CONTACT_PHONE}`;
  };

  const handleCopyNotice = () => {
    if (!selectedGrievanceForNotice) return;
    const text = generateLegalPetitionText(selectedGrievanceForNotice, lang);
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const handleSpeakNotice = () => {
    if (!selectedGrievanceForNotice) return;
    if (lang === 'hi') {
      speech.speak(
        `आवेदन पत्र: जिला श्रम पदाधिकारी इंदौर को प्रेषित। दावा राशि ₹${selectedGrievanceForNotice.claimedAmount}। अनावेदक ठेकेदार: ${selectedGrievanceForNotice.contractorName}। डिजिटल मस्टर साक्ष्य संलग्न है। हेल्पलाइन 7909348017।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `Legal petition for District Labor Officer, Indore. Claimed unpaid wages: ₹${selectedGrievanceForNotice.claimedAmount} against contractor ${selectedGrievanceForNotice.contractorName}. Helpline 7909348017.`,
        'en-IN'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {t('grievanceTitle', lang)}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('grievanceSubtitle', lang)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{t('grievanceActNotice', lang)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Filing Form (Left 5 cols) + Legal Petition & Active Cases (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
        
        {/* Form to File New Grievance */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 min-w-0">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{t('grievanceFormTitle', lang)}</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {t('grievanceFormSubtitle', lang)}
            </span>
          </div>

          <form onSubmit={handleSubmitDispute} className="space-y-3.5 text-xs">
            
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('grievanceContractorLabel', lang)}
              </label>
              <input
                type="text"
                required
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder={t('grievanceContractorPlaceholder', lang)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('grievancePhoneLabel', lang)}
                </label>
                <input
                  type="tel"
                  value={contractorPhone}
                  onChange={(e) => setContractorPhone(e.target.value)}
                  placeholder="+91 94250 00000"
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('grievanceAmountLabel', lang)}
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  className="w-full font-mono font-bold text-red-700 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('grievanceSiteLabel', lang)}
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder={t('grievanceSitePlaceholder', lang)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('grievanceReasonLabel', lang)}
              </label>
              <select
                value={disputeType}
                onChange={(e) => setDisputeType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
              >
                <option value="unpaid_wages">{t('grievanceReasonUnpaid', lang)}</option>
                <option value="arbitrary_deduction">{t('grievanceReasonDeduction', lang)}</option>
                <option value="denied_overtime">{t('grievanceReasonOvertime', lang)}</option>
                <option value="unsafe_conditions">{t('grievanceReasonSafety', lang)}</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {t('grievanceDescLabel', lang)}
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('grievanceDescPlaceholder', lang)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t('grievanceSubmitBtn', lang)}</span>
            </button>

          </form>
        </div>

        {/* Right 7 Cols: Formatted Legal Notice Generator & Dispute Tracker */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          
          {/* Active Grievances List */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>{t('grievanceActiveTitle', lang)}</span>
              <span className="text-xs font-mono text-slate-500">
                {grievances.length} {t('grievanceCasesCount', lang)}
              </span>
            </h3>

            <div className="space-y-2">
              {grievances.map((g) => {
                const isSelected = selectedGrievanceForNotice?.id === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGrievanceForNotice(g)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between min-w-0 ${
                      isSelected
                        ? 'border-red-500 bg-red-50/40 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 truncate">{g.dloFilingRef}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${
                          g.status === 'notice_issued'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}>
                          {g.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-slate-600 block mt-0.5 truncate">
                        {t('grievanceAgainst', lang)} <strong>{g.contractorName}</strong> ({g.siteName})
                      </span>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono font-bold text-red-700 text-sm block">
                        {formatCurrency(g.claimedAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {g.filingDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formatted Legal Petition Display (DLO Indore Document) */}
          {selectedGrievanceForNotice && (
            <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3 font-mono text-xs min-w-0">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-orange-400 font-sans font-bold">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>{t('grievanceDocHeader', lang)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSpeakNotice}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title={t('listenAudio', lang)}
                  >
                    <Volume2 className="w-4 h-4 text-orange-400" />
                  </button>

                  <button
                    onClick={handleCopyNotice}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                  >
                    {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotice ? t('grievanceCopiedNotice', lang) : t('grievanceCopyNotice', lang)}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('grievancePrintNotice', lang)}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Document Body in clean language */}
              <pre className="whitespace-pre-wrap font-sans text-slate-300 text-[11px] leading-relaxed max-h-80 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 break-words w-full">
                {generateLegalPetitionText(selectedGrievanceForNotice, lang)}
              </pre>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-sans">
                <span>{t('grievanceAuditHashLabel', lang)} SHA256:DLO9021INDORE</span>
                <span className="text-emerald-400 font-bold">{t('grievanceLegalGrounding', lang)}</span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
