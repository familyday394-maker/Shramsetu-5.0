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
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import { Worker, DisputeGrievance } from '../types';
import { Language, t, formatCurrency, getLocalizedTrade } from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';
import { db } from '../services/db';

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

  // Contractor response state
  const [contractorRebuttalText, setContractorRebuttalText] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);

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

  const handleAddContractorResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievanceForNotice || !contractorRebuttalText.trim()) return;

    db.addContractorResponse(selectedGrievanceForNotice.id, contractorRebuttalText.trim());
    setSelectedGrievanceForNotice({
      ...selectedGrievanceForNotice,
      contractorResponse: contractorRebuttalText.trim(),
      contractorResponseDate: new Date().toISOString().split('T')[0],
      status: 'under_inquiry',
    });
    setContractorRebuttalText('');
    setShowResponseForm(false);
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
5. संलग्न साक्ष्य: श्रम सेतु 2.0 डिजिटल मस्टर रोल के ${g.evidenceMusterCount} सत्यापित कार्य दिवस।

श्रमिक का अभिकथन:
"${g.description}"

${g.contractorResponse ? `अनावेदक ठेकेदार का प्रतिउत्तर (दिनांक ${g.contractorResponseDate || g.filingDate}):\n"${g.contractorResponse}"\n` : 'ठेकेदार का प्रतिउत्तर: लंबित (नोटिस जारी होने की प्रक्रिया में)\n'}
अतः महोदय से विनम्र प्रार्थना है कि अनावेदक ठेकेदार को नोटिस जारी कर प्रार्थी की बकाया मजदूरी ₹${g.claimedAmount} मय सांविधिक क्षतिपूर्ति तत्काल दिलाई जाने की कृपा करें।

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
5. Primary Evidentiary Records: ${g.evidenceMusterCount} verified muster roll records certified on Shram Setu 2.0.

Worker's Statement of Claim:
"${g.description}"

${g.contractorResponse ? `Respondent Contractor's Statement (Dated ${g.contractorResponseDate || g.filingDate}):\n"${g.contractorResponse}"\n` : "Contractor's Statement: Pending statutory inquiry response\n"}
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
      <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-ink-900">
                {t('grievanceTitle', lang)}
              </h2>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
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
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-sand-200 shadow-xs space-y-4 min-w-0">
          <div className="border-b border-sand-200 pb-3">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{t('grievanceFormTitle', lang)}</span>
            </h3>
            <span className="text-[11px] text-ink-500">
              {t('grievanceFormSubtitle', lang)}
            </span>
          </div>

          <form onSubmit={handleSubmitDispute} className="space-y-3.5 text-xs">
            
            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('grievanceContractorLabel', lang)}
              </label>
              <input
                type="text"
                required
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder={t('grievanceContractorPlaceholder', lang)}
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-800 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('grievancePhoneLabel', lang)}
              </label>
              <input
                type="text"
                value={contractorPhone}
                onChange={(e) => setContractorPhone(e.target.value)}
                placeholder="+91 94250 XXXXX"
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-800 font-mono focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('grievanceSiteLabel', lang)}
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-800 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-ink-700 block mb-1">
                  {t('grievanceTypeLabel', lang)}
                </label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value as DisputeGrievance['disputeType'])}
                  className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2 text-ink-800 focus:outline-none focus:ring-1 focus:ring-brass-500"
                >
                  <option value="unpaid_wages">{t('grievanceReasonUnpaid', lang)}</option>
                  <option value="arbitrary_deduction">{t('grievanceReasonDeduction', lang)}</option>
                  <option value="denied_overtime">{t('grievanceReasonOvertime', lang)}</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink-700 block mb-1">
                  {t('grievanceAmountLabel', lang)}
                </label>
                <input
                  type="number"
                  min="100"
                  required
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2 font-mono font-bold text-ink-800 focus:outline-none focus:ring-1 focus:ring-brass-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('grievanceStatementLabel', lang)}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('grievanceStatementPlaceholder', lang)}
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-800 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{t('grievanceSubmitBtn', lang)}</span>
            </button>

          </form>
        </div>

        {/* Right: Active Cases List + Document Preview + Contractor Rebuttal */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sand-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-ink-900 flex items-center justify-between">
              <span>{t('grievanceActiveTitle', lang)}</span>
              <span className="text-xs font-mono text-ink-500">
                {grievances.length} {t('grievanceCasesCount', lang)}
              </span>
            </h3>

            <div className="space-y-2">
              {grievances.map((g) => {
                const isSelected = selectedGrievanceForNotice?.id === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      setSelectedGrievanceForNotice(g);
                      setShowResponseForm(false);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between min-w-0 ${
                      isSelected
                        ? 'border-red-500 bg-red-50/40 shadow-xs'
                        : 'border-ink-200 hover:bg-ink-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-ink-900 truncate">{g.dloFilingRef}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${
                          g.status === 'notice_issued'
                            ? 'bg-brass-50 text-brass-800 border-brass-300'
                            : g.status === 'under_inquiry'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-ink-100 text-ink-800 border-ink-300'
                        }`}>
                          {g.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {g.contractorResponse && (
                          <span className="text-[10px] bg-forest-50 text-forest-800 border border-forest-200 px-1.5 py-0.5 rounded font-medium">
                            {lang === 'hi' ? 'ठेकेदार का पक्ष दर्ज' : 'Rebuttal On File'}
                          </span>
                        )}
                      </div>
                      <span className="text-ink-600 block mt-0.5 truncate">
                        {t('grievanceAgainst', lang)} <strong>{g.contractorName}</strong> ({g.siteName})
                      </span>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono font-bold text-red-700 text-sm block">
                        {formatCurrency(g.claimedAmount)}
                      </span>
                      <span className="text-[10px] text-ink-400 font-mono">
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
            <div className="bg-ink-900 text-sand-100 p-4 sm:p-5 rounded-2xl border border-ink-800 shadow-lg space-y-3 font-mono text-xs min-w-0">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-800 pb-2">
                <div className="flex items-center gap-2 text-brass-400 font-sans font-bold">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>{t('grievanceDocHeader', lang)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSpeakNotice}
                    className="p-1 text-ink-400 hover:text-white cursor-pointer"
                    title={t('listenAudio', lang)}
                  >
                    <Volume2 className="w-4 h-4 text-brass-400" />
                  </button>

                  <button
                    onClick={handleCopyNotice}
                    className="flex items-center gap-1 px-2.5 py-1 bg-ink-800 hover:bg-ink-700 text-sand-200 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                  >
                    {copiedNotice ? <Check className="w-3.5 h-3.5 text-forest-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotice ? t('grievanceCopiedNotice', lang) : t('grievanceCopyNotice', lang)}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-2.5 py-1 bg-brass-600 hover:bg-brass-500 text-white rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('grievancePrintNotice', lang)}</span>
                  </button>

                  <button
                    onClick={() => setShowResponseForm(!showResponseForm)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-ink-800 hover:bg-ink-700 text-brass-400 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{showResponseForm ? 'Cancel' : (lang === 'hi' ? '+ ठेकेदार का पक्ष जोड़ें' : '+ Add Rebuttal')}</span>
                  </button>
                </div>
              </div>

              {/* Contractor Rebuttal Form (Preserves Both Sides of Dispute) */}
              {showResponseForm && (
                <form onSubmit={handleAddContractorResponse} className="bg-ink-800 p-3 rounded-xl border border-ink-700 space-y-2 font-sans">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brass-300">
                      {lang === 'hi' ? 'अनावेदक ठेकेदार का औपचारिक प्रतिउत्तर दर्ज करें:' : "Record Contractor's Official Rebuttal:"}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={contractorRebuttalText}
                    onChange={(e) => setContractorRebuttalText(e.target.value)}
                    placeholder={lang === 'hi' ? 'ठेकेदार का स्पष्टीकरण, भुगतान वाउचर संदर्भ अथवा समझौता विवरण...' : 'Contractor explanation, voucher proof, or settlement statement...'}
                    className="w-full text-xs bg-ink-900 border border-ink-600 rounded p-2 text-white focus:outline-none focus:border-brass-500"
                  />
                  <div className="text-right">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-brass-600 hover:bg-brass-500 text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      {lang === 'hi' ? 'प्रतिउत्तर सुरक्षित करें' : 'Save Rebuttal'}
                    </button>
                  </div>
                </form>
              )}

              {/* Scrollable Document Body in clean language */}
              <pre className="whitespace-pre-wrap font-sans text-ink-300 text-[11px] leading-relaxed max-h-80 overflow-y-auto bg-ink-950 p-4 rounded-xl border border-ink-800 break-words w-full">
                {generateLegalPetitionText(selectedGrievanceForNotice, lang)}
              </pre>

              <div className="flex items-center justify-between text-[10px] text-ink-400 pt-1 font-sans">
                <span>{lang === 'hi' ? 'प्रारूप: जिला श्रम पदाधिकारी इंदौर संभाग' : 'Format: District Labour Officer, Indore Division'}</span>
                <span className="text-forest-400 font-bold">{t('grievanceLegalGrounding', lang)}</span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
