/**
 * Centralized Typed Translation System for Shram Setu 2.0
 * Provides 100% complete bilingual support (English & Hindi) without mixed-language artifacts.
 */

import { APP_CONFIG } from '../config';

export type Language = 'en' | 'hi';

export const LANGUAGE_STORAGE_KEY = 'shramsetu_preferred_lang';

export function getSavedLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'hi') {
      return saved;
    }
  }
  return 'hi'; // Default to Hindi for informal worker accessibility
}

export function saveLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
}

export const translations = {
  en: {
    // Brand & Header
    brandName: 'Shram Setu',
    brandSubtitle: 'Verified Digital Work & Wage Records',
    navPass: 'Smart Shram Pass',
    navAttendance: 'Muster & Attendance',
    navLedger: 'Wage Khata',
    navContractor: 'Contractor Portal',
    navGrievance: 'Samadhan (Disputes)',
    navWelfare: 'Welfare Schemes',
    navInnovation: 'Bal Vigyan Exhibit',
    selectWorker: 'Select Worker Profile',
    activeSite: 'Active Site',
    helplineText: 'Helpline',
    whatsappChat: 'WhatsApp Support',
    audioReadout: 'Audio Pass',
    listenAudio: 'Listen',
    stopAudio: 'Stop Audio',
    toggleToHindi: 'हिन्दी',
    toggleToEnglish: 'English',

    // Hero Section
    heroBadge: 'Senior Bal Vigyan Award Innovation · Indore, MP',
    heroWageStandard: 'MP Minimum Wages Act Aligned',
    heroTitlePart1: 'Dignified Identity,',
    heroTitlePart2: 'Tamper-Proof Muster',
    heroTitlePart3: '& Statutory Wage Protection',
    heroSubtitle: 'A decentralized, low-friction digital work pass and muster verification platform for informal construction workers. Eliminates contractor wage theft, guarantees statutory minimum wages, and directly links e-Shram & MP BOCW benefits.',
    heroMarkAttendance: 'Mark Daily Attendance',
    heroViewLedger: 'View Wage Khata',
    heroRegisterWorker: 'Register New Worker',
    heroStatWorkforce: 'Unorganised Workforce',
    heroStatMuster: 'Audit-Proof Muster',
    heroStatLoss: 'Contractor Cut Loss',
    heroCardVerified: 'Biometrically Verified',
    heroCardBocw: 'MP BOCW Registered',
    heroCardSubtext: 'Head Mason · Indore Metro Package 3',

    // Smart Shram Pass Screen
    passHeaderTitle: 'Smart Shram Card & Digital Pass',
    passActiveBadge: 'Active & Verified',
    passSubheader: 'Directly linked with MP BOCW Board and National e-Shram Registry',
    passFlipFront: 'View Front',
    passFlipBack: 'View Back',
    passFlipCard: 'Flip Card',
    passPrintButton: 'Print Pass',
    passCardTopGovt: 'Govt. of Madhya Pradesh · Labour Welfare Division',
    passCardTopTitle: 'SHRAM SETU · SMART WORK PASS',
    passCardIdPrefix: 'ID',
    passCardEShramLinked: 'e-Shram Linked',
    passCardUidPrefix: 'UID',
    passCardBloodPrefix: 'Blood',
    passCardTradeLabel: 'Trade / Skill',
    passCardMinWageLabel: 'Min. Statutory Wage',
    passCardPerDay: '/ day (8h)',
    passCardScanPrompt: 'Scan to Verify',
    passCardUanLabel: 'e-Shram UAN:',
    passCardBocwLabel: 'BOCW Reg:',
    passCardBackHeader: 'EMERGENCY SOS & DIRECT BENEFIT TRANSFER',
    passCardBackActNotice: 'BOCW MP-ACT 1996',
    passCardEmergencyLabel: 'Emergency Contact:',
    passCardDirectCreditLabel: 'Direct Wage Credit (No Contractor Cut):',
    passCardAccountLabel: 'Account:',
    passCardIfscLabel: 'IFSC:',
    passCardUpiLabel: 'UPI ID:',
    passCardDeploymentLabel: 'Current Project Deployment:',
    passCardContractorLabel: 'Contractor:',
    passCardHashLabel: 'Cryptographic Pass Hash:',
    passCardHint: 'Click card or use Flip button to inspect front & back credentials.',

    // Stats Bar
    statsDaysWorked: 'Verified Days Worked',
    statsDaysGpsBadge: 'GPS Geofenced',
    statsGrossEarned: 'Gross Earned Wages',
    statsGrossSubtitle: 'Statutory Rates',
    statsAdvances: 'Advances Taken (Kharcha)',
    statsAdvancesSubtitle: 'Ration / Emergency',
    statsNetDue: 'Net Due Balance',
    statsNetDueSubtitle: 'Payable this week',

    // Statutory Rights Panel
    rightsHeader: 'Statutory Rights & Social Security Status',
    rightsCompliantBadge: '100% Compliant',
    rightsEshramTitle: 'e-Shram Universal Account Number',
    rightsEshramSubtitle: 'PMSBY ₹2,00,000 accidental cover active',
    rightsBocwTitle: 'MP BOCW Registration Board',
    rightsBocwSubtitle: 'Eligible for ₹5,000 artisan tool grant',
    rightsProtectionTitle: 'MP Minimum Wages Act Protection Guarantee',
    rightsProtectionBody: 'Base statutory rate is ₹{wage}/day. Any unauthorized contractor deduction or delayed wage is a punishable offense under Section 20 of Minimum Wages Act 1948.',

    // QR Modal
    qrModalTitle: 'Cryptographic QR Verification',
    qrModalWorker: 'Worker:',
    qrModalUan: 'e-Shram UAN:',
    qrModalVerifiedDays: 'Verified Days:',
    qrModalWageDue: 'Wage Due:',
    qrModalHash: 'Security Hash:',
    qrModalInstruction: 'Site supervisors or Labor Enforcement Officers can scan this QR with any device camera to verify real-time status.',
    qrModalClose: 'Close Verification',

    // Attendance & Muster Roll
    attendanceTitle: 'Daily Attendance & Digital Muster Roll',
    attendanceSubtitle: 'GPS-geofenced timestamping, automatic overtime multiplier, and cryptographic supervisor sign-off.',
    attendanceListenSummary: 'Listen Muster Summary',
    attendancePunchHeading: 'Mark Today\'s Muster Punch',
    attendanceSelectSiteLabel: 'Construction Project Site',
    attendanceShiftDurationLabel: 'Select Shift Duration',
    attendanceShiftFullDay: 'Full Day',
    attendanceShiftFullDayHours: '8h',
    attendanceShiftHalfDay: 'Half Day',
    attendanceShiftHalfDayHours: '4h',
    attendanceShiftOvertime2h: 'Overtime (+2 hrs)',
    attendanceShiftOvertime2hHours: '10h',
    attendanceShiftOvertime4h: 'Night (+4h OT)',
    attendanceShiftOvertime4hHours: '12h',
    attendanceBaseRateLabel: 'Statutory Daily Rate (8h):',
    attendanceOtPremiumLabel: 'Overtime Premium:',
    attendanceCalculatedWageLabel: 'Calculated Wage Credit:',
    attendanceNotesLabel: 'Work Notes / Location Remarks (Optional)',
    attendanceNotesPlaceholder: 'e.g. Pillar reinforcement, plastering pier 4',
    attendancePunchVerifying: 'Verifying GPS & QR Token...',
    attendancePunchSuccess: 'Muster Verified & Signed!',
    attendancePunchButton: 'Confirm & Punch Attendance',
    attendanceGeofenceNotice: 'Indore Municipal Site Geofence active (50m perimeter verification enabled).',
    attendanceLedgerTitle: 'Verified Muster Roll Ledger',
    attendanceRecordsFound: 'records logged',
    attendanceFilterAll: 'All',
    attendanceFilterPresent: 'Present',
    attendanceFilterOvertime: 'Overtime',
    attendanceFilterHalf: 'Half Day',
    attendanceSearchPlaceholder: 'Search by date, site, or supervisor...',
    attendanceColDate: 'Date',
    attendanceColSite: 'Project Site',
    attendanceColShift: 'Shift & Hours',
    attendanceColWage: 'Wage Earned',
    attendanceColVerification: 'Verification',
    attendanceNoRecords: 'No muster records found.',
    attendanceTotalHours: 'hrs total',
    attendanceSignedBadge: 'Signed',

    // Wage Protection Ledger & Khata
    ledgerTitle: 'Wage Protection & Digital Khata',
    ledgerSubtitle: 'Immutable audit trail of day-wage credits, mid-week grocery advances, and direct settlements.',
    ledgerListenSummary: 'Listen Ledger Summary',
    ledgerWhatsAppButton: 'WhatsApp Wage Slip',
    ledgerSlipCopied: 'Slip Copied!',
    ledgerRecordAdvanceBtn: 'Record Advance / Pay',
    ledgerGrossCardTitle: 'Gross Earned Wages',
    ledgerTotalEarnedCardTitle: 'Gross Earned Wages',
    ledgerEarnedSubtitle: 'Muster-verified statutory earnings',
    ledgerGrossDaysVerified: 'days verified',
    ledgerAdvancesCardTitle: 'Advances Taken (Kharcha)',
    ledgerAdvancesSubtitle: 'Ration & Emergency support',
    ledgerNetBalanceCardTitle: 'Net Payable Balance',
    ledgerNetBalanceSubtitle: 'Direct contractor transfer (No Cut)',
    ledgerHistoryTitle: 'Transaction History & Proof Vouchers',
    ledgerFilterAll: 'All',
    ledgerFilterEarnings: 'Earnings (+)',
    ledgerFilterAdvances: 'Advances (-)',
    ledgerSearchPlaceholder: 'Search by description, date, or UTR number...',
    ledgerColDate: 'Date',
    ledgerColDescription: 'Description',
    ledgerColType: 'Type',
    ledgerColModeUtr: 'Mode & UTR',
    ledgerColAmount: 'Amount',
    ledgerNoTransactions: 'No transactions recorded.',
    ledgerTagMusterWage: 'Muster Wage',
    ledgerTagAdvanceKharcha: 'Kharcha Advance',
    ledgerTagSettlement: 'Settlement Payout',
    ledgerCashVoucher: 'CASH-VOUCHER',

    // Record Advance Modal
    modalAdvanceTitle: 'Record Advance or Wage Settlement',
    modalAdvanceTypeLabel: 'Transaction Type',
    modalAdvanceTypeAdvance: 'Advance (Kharcha) (-)',
    modalAdvanceTypeSettlement: 'Settlement Payment (+)',
    modalAdvanceAmountLabel: 'Amount (in ₹)',
    modalAdvanceDescLabel: 'Description / Purpose',
    modalAdvanceDescPlaceholder: 'e.g. Mid-week family grocery and medical support',
    modalAdvanceModeLabel: 'Payment Mode',
    modalAdvanceModeUpi: 'UPI (PhonePe / GPay / Paytm)',
    modalAdvanceModeBank: 'Direct Bank Transfer (NEFT/IMPS)',
    modalAdvanceModeCash: 'Cash Handover (Signed Voucher)',
    modalAdvanceUtrLabel: 'UTR / Voucher Reference',
    modalAdvanceUtrPlaceholder: 'Auto-generated if blank',
    modalAdvanceCancel: 'Cancel',
    modalAdvanceSave: 'Save Transaction',

    // WhatsApp Wage Slip Text (in English)
    whatsappSlipHeader: 'SHRAM SETU 2.0 · VERIFIED DIGITAL WAGE SLIP',
    whatsappWorkerLabel: 'Worker:',
    whatsappTradeLabel: 'Trade:',
    whatsappUanLabel: 'e-Shram UAN:',
    whatsappBocwLabel: 'BOCW Reg:',
    whatsappSiteLabel: 'Project Site:',
    whatsappDaysWorkedLabel: 'Verified Days Worked:',
    whatsappDailyRateLabel: 'Daily Base Wage:',
    whatsappGrossWagesLabel: 'Gross Earned Wages:',
    whatsappAdvancesLabel: 'Advances Taken (Kharcha):',
    whatsappNetDueLabel: 'Net Payable Balance:',
    whatsappVerificationLabel: 'Verification: Certified via SHA256 Cryptographic Muster',
    whatsappHelplineNotice: 'Govt. of MP Labour Dept · Helpline:',

    // Contractor Portal
    contractorTitle: 'Site Supervisor & Contractor Portal',
    contractorSubtitle: 'Project site muster verification, crew bulk attendance, and statutory BOCW payroll compliance.',
    contractorActiveProject: 'Active Construction Project',
    contractorLeadContractor: 'Lead Contractor',
    contractorCategory: 'Project Category',
    contractorDept: 'PWD / Urban Govt.',
    contractorWorkforce: 'Active Workforce',
    contractorShramRegd: '100% Shram Pass Registered',
    contractorAuditCleared: 'Demonstration Muster Roll Status (Indore Zone)',
    contractorInspectTitle: 'Indore Infrastructure Engineering Inspection',
    contractorInspectSub: 'Daily Muster Verification & Safety Compliance',
    contractorBulkHeading: 'Crew Quick Muster Punch (Bulk Verification)',
    contractorBulkSubtitle: 'Site supervisor can mark full-day shift for entire crew with one cryptographically signed action.',
    contractorDeselectAll: 'Deselect All',
    contractorSelectAll: 'Select All Crew',
    contractorBulkSuccess: 'Crew Logged Successfully!',
    contractorPunchCrewBtn: 'Punch {count} Workers',
    contractorLookupHeading: 'Worker Digital Pass Verification (Instant UAN / QR Check)',
    contractorLookupSubtitle: 'Verify identity, trade skill certification, and statutory wage rates for any visiting worker.',
    contractorLookupPlaceholder: 'Enter 12-digit e-Shram UAN, Worker Name, or ID...',
    contractorLookupDemoBtn: 'Demo UAN',
    contractorLookupVerifiedBadge: 'VERIFIED PASS',
    contractorLookupMandatoryWage: 'Mandatory Wage:',
    contractorLookupNotFound: 'No registered artisan found with this query.',

    // Grievance Redressal (Samadhan)
    grievanceTitle: 'Shram Samadhan: Wage Theft Redressal & Legal Notice',
    grievanceSubtitle: 'Automated legal representation for District Labor Officer (DLO Indore) with tamper-proof muster evidence.',
    grievanceActNotice: 'Section 20 MW Act 1948',
    grievanceFormTitle: 'File Unpaid Wage / Theft Dispute',
    grievanceFormSubtitle: 'Worker\'s tamper-proof muster logs will be automatically attached as primary legal evidence.',
    grievanceContractorLabel: 'Contractor / Sub-contractor Name',
    grievanceContractorPlaceholder: 'e.g. Radhe Construction Services',
    grievancePhoneLabel: 'Contractor Phone',
    grievanceAmountLabel: 'Claimed Unpaid Amount (₹)',
    grievanceSiteLabel: 'Construction Site Location',
    grievanceSitePlaceholder: 'e.g. Super Corridor Ring Road Project',
    grievanceReasonLabel: 'Dispute Classification',
    grievanceTypeLabel: 'Dispute Classification',
    grievanceReasonUnpaid: 'Unpaid Daily Wages (Denial of wages)',
    grievanceReasonDeduction: 'Arbitrary Pay Cut (Unauthorized deduction)',
    grievanceReasonOvertime: 'Denied Overtime Wages (Unpaid extra hours)',
    grievanceReasonSafety: 'Safety Gear & Hazard Violation',
    grievanceDescLabel: 'Incident Details & Timeline',
    grievanceStatementLabel: 'Worker Statement / Claim Details',
    grievanceDescPlaceholder: 'Describe when work was completed, contractor responses, and dates...',
    grievanceStatementPlaceholder: 'Describe when work was completed, contractor responses, and dates...',
    grievanceSubmitBtn: 'Submit & Generate Legal Notice',
    grievanceActiveTitle: 'Active Grievance Cases & DLO Status',
    grievanceCasesCount: 'cases',
    grievanceAgainst: 'Against:',
    grievanceDocHeader: 'DLO INDORE LEGAL PETITION (SEC 20 MW ACT)',
    grievanceCopyNotice: 'Copy Text',
    grievanceCopiedNotice: 'Copied',
    grievancePrintNotice: 'Print',
    grievanceAuditHashLabel: 'Tamper-Proof Audit Hash:',
    grievanceLegalGrounding: '100% Valid Legal Grounding',

    // Welfare Schemes Hub
    welfareTitle: 'e-Shram & MP BOCW Social Security Hub',
    welfareSubtitle: 'Direct benefit social security, accident coverage, tool grants, and old-age pension entitlements.',
    welfareListenButton: 'Listen Schemes',
    welfareActiveBadge: 'Active',
    welfareBenefitAmountLabel: 'Benefit Amount:',
    welfareEligibilityLabel: 'Eligibility:',
    welfareUanPreverified: 'Pre-verified UAN',
    welfareRequiresReg: 'Requires Registration',
    welfareOfficialPortal: 'Official Portal',
    welfarePensionHeading: 'PM-SYM Monthly Pension Estimator',
    welfarePensionSubtitle: 'Calculate monthly worker contribution and 50% central matching grant.',
    welfareWorkerAgeLabel: 'Current Worker Age (18-40 yrs):',
    welfareYearsUnit: 'Years',
    welfareMatchingText: '50% of the monthly contribution is directly matched by the Central Government into the worker’s pension account.',
    welfareWorkerShareLabel: 'Worker Monthly Share:',
    welfareGovtShareLabel: 'Govt. 50% Matching Grant:',
    welfareAssuredPensionLabel: 'Assured Pension after 60:',
    welfarePerMonth: '/ month',

    // New Worker Modal
    workerModalTitle: 'Register New Worker & Issue Smart Pass',
    workerModalFullNameEn: 'Full Name (English) *',
    workerModalFullNameHi: 'Full Name (in Hindi)',
    workerModalMobile: 'Mobile Number',
    workerModalBloodGroup: 'Blood Group',
    workerModalTrade: 'Trade / Skill *',
    workerModalSkillLevel: 'Skill Classification',
    workerModalBaseWage: 'Base Daily Wage (₹ / Day)',
    workerModalUan: 'e-Shram UAN (12 digits)',
    workerModalAadhaar: 'Aadhaar Last 4 Digits',
    workerModalEmergencyName: 'Emergency Contact Name',
    workerModalEmergencyPhone: 'Emergency Phone',
    workerModalDeploySite: 'Initial Deployment Site',
    workerModalCancel: 'Cancel',
    workerModalSubmit: 'Issue Smart Shram Pass',

    // Bal Vigyan Innovation Exhibit Modal
    balVigyanModalTitle: 'Senior Bal Vigyan Innovation Exhibit · Shram Setu 2.0',
    balVigyanModalSub: 'Developed in Indore, Madhya Pradesh · Civic-Tech for 450M+ Unorganised Workers',
    balVigyanGenesisTitle: 'The Genesis & Core Problem:',
    balVigyanGenesisBody: 'In India, informal daily-wage construction laborers, masons, and helpers face chronic wage theft, arbitrary pay cuts, missing overtime records, and lack of proof of work. Because attendance registers (muster rolls) are held exclusively by labor contractors (पेटी ठेकेदार), workers have zero evidence when disputes arise.',
    balVigyanPillar1Title: '1. Cryptographic Smart Pass',
    balVigyanPillar1Body: 'Physical/Digital hybrid card with offline QR verification, e-Shram UAN linkage, and SHA256 integrity token.',
    balVigyanPillar2Title: '2. Zero-Literacy Voice Engine',
    balVigyanPillar2Body: 'Bilingual Web Speech audio narration in Hindi & English so workers who cannot read can hear their dues and hours.',
    balVigyanPillar3Title: '3. Statutory Wage Guard',
    balVigyanPillar3Body: 'Enforces MP Gazetted minimum wage rates (₹412-₹530/day) and automatic overtime doubling.',
    balVigyanPillar4Title: '4. Legal Petition Automation',
    balVigyanPillar4Body: 'Auto-drafts legal complaints under Section 20 of Minimum Wages Act for the District Labor Officer (DLO Indore).',
    balVigyanPersistenceTitle: 'PERSISTENCE: LOCAL DEMO MODE (INDEXEDDB ACTIVE)',
    balVigyanPersistenceTag: 'Supabase Ready v5.0',
    balVigyanPersistenceBody: 'As indicated in the system configuration, client-side persistent storage (IndexedDB + LocalStorage) is actively running with pre-seeded Indore site & worker muster data. The database schema is fully aligned for Supabase PostgreSQL activation next week.',
    balVigyanExportBtn: 'Export JSON Backup',
    balVigyanBackupDownloaded: 'Backup Downloaded!',
    balVigyanResetBtn: 'Reset to Bal Vigyan Seed Data',
    balVigyanClose: 'Close Exhibit',
    balVigyanHelplineContact: 'Project Inquiry & Bal Vigyan Mentorship Helpline:',

    // Footer
    footerTitle: 'Shram Setu 2.0',
    footerInnovation: 'Senior Bal Vigyan Gold Innovation (Indore, MP)',
    footerCompliance: 'Section 20 MW Act 1948 Compliant',
    footerExhibitBtn: 'Bal Vigyan Exhibit',
    footerResetBtn: 'Reset Prototype Data',
    footerDemoMode: 'IndexedDB Local Demo',
    footerHelplineLabel: 'Official Support & Helpline:',
  },

  hi: {
    // Brand & Header
    brandName: 'श्रम सेतु',
    brandSubtitle: 'सत्यापित डिजिटल कार्य एवं मजदूरी रिकॉर्ड',
    navPass: 'स्मार्ट श्रम कार्ड',
    navAttendance: 'हाजिरी व मस्टर',
    navLedger: 'मजदूरी खाता',
    navContractor: 'ठेकेदार पोर्टल',
    navGrievance: 'श्रम समाधान (शिकायत)',
    navWelfare: 'कल्याण योजनाएं',
    navInnovation: 'बाल विज्ञान नवाचार',
    selectWorker: 'कारीगर / मजदूर चुनें',
    activeSite: 'कार्य स्थल',
    helplineText: 'हेल्पलाइन',
    whatsappChat: 'व्हाट्सएप सहायता',
    audioReadout: 'बोलकर सुनें (ऑडियो)',
    listenAudio: 'सुनें',
    stopAudio: 'आवाज रोकें',
    toggleToHindi: 'हिन्दी',
    toggleToEnglish: 'English',

    // Hero Section
    heroBadge: 'वरिष्ठ बाल विज्ञान स्वर्ण नवाचार · इंदौर, म.प्र.',
    heroWageStandard: 'म.प्र. न्यूनतम मजदूरी अधिनियम अनुसार',
    heroTitlePart1: 'मजदूर का स्वाभिमान,',
    heroTitlePart2: 'सत्यापित मस्टर हाजिरी',
    heroTitlePart3: 'एवं सुरक्षित सांविधिक मजदूरी',
    heroSubtitle: 'असंगठित निर्माण कारीगरों, राजमिस्त्रियों और सहायकों के लिए डिजिटल श्रम कार्ड, क्यूआर हाजिरी, एवं बिचौलिया-मुक्त मजदूरी खाता। अब न कोई हाजिरी कटेगी, न मजदूरी रुकेगी। ई-श्रम एवं मध्य प्रदेश संनिर्माण मंडल से सीधे संबद्ध।',
    heroMarkAttendance: 'दैनिक हाजिरी लगाएं',
    heroViewLedger: 'मजदूरी खाता देखें',
    heroRegisterWorker: 'नया कारीगर जोड़ें',
    heroStatWorkforce: 'असंगठित कार्यबल',
    heroStatMuster: 'सत्यापित मस्टर रिकॉर्ड',
    heroStatLoss: 'बिचौलिया कटौती हानि',
    heroCardVerified: 'बायोमेट्रिक सत्यापित',
    heroCardBocw: 'म.प्र. संनिर्माण मंडल पंजीकृत',
    heroCardSubtext: 'मुख्य राजमिस्त्री · इंदौर मेट्रो पैकेज 3',

    // Smart Shram Pass Screen
    passHeaderTitle: 'स्मार्ट श्रम कार्ड व डिजिटल पास',
    passActiveBadge: 'सक्रिय एवं सत्यापित',
    passSubheader: 'म.प्र. भवन संनिर्माण कर्मकार मंडल एवं ई-श्रम राष्ट्रीय डेटाबेस से सीधे संबद्ध',
    passFlipFront: 'सामने देखें',
    passFlipBack: 'पीछे देखें',
    passFlipCard: 'कार्ड पलटें',
    passPrintButton: 'पास प्रिंट करें',
    passCardTopGovt: 'मध्य प्रदेश शासन · श्रम कल्याण प्रभाग',
    passCardTopTitle: 'श्रम सेतु · स्मार्ट वर्क पास',
    passCardIdPrefix: 'आईडी',
    passCardEShramLinked: 'ई-श्रम संबद्ध',
    passCardUidPrefix: 'यूआईडी',
    passCardBloodPrefix: 'रक्त समूह',
    passCardTradeLabel: 'पेशा / हुनर',
    passCardMinWageLabel: 'न्यूनतम सांविधिक दर',
    passCardPerDay: '/ दिन (8 घंटे)',
    passCardScanPrompt: 'सत्यापन हेतु स्कैन करें',
    passCardUanLabel: 'ई-श्रम यूएएन:',
    passCardBocwLabel: 'बीओसीडब्ल्यू:',
    passCardBackHeader: 'आपातकालीन संपर्क एवं प्रत्यक्ष मजदूरी अंतरण',
    passCardBackActNotice: 'म.प्र. संनिर्माण अधिनियम 1996',
    passCardEmergencyLabel: 'आपातकालीन संपर्क:',
    passCardDirectCreditLabel: 'प्रत्यक्ष मजदूरी भुगतान (बिचौलिया कटौती मुक्त):',
    passCardAccountLabel: 'खाता संख्या:',
    passCardIfscLabel: 'आईएफएससी:',
    passCardUpiLabel: 'यूपीआई आईडी:',
    passCardDeploymentLabel: 'वर्तमान कार्य स्थल तैनाती:',
    passCardContractorLabel: 'ठेकेदार:',
    passCardHashLabel: 'क्रिप्टोग्राफिक पास हैश:',
    passCardHint: 'कार्ड को टैप करके या ऊपर दिए बटन से दोनों तरफ देख सकते हैं।',

    // Stats Bar
    statsDaysWorked: 'सत्यापित कार्य दिवस',
    statsDaysGpsBadge: 'जीपीएस सत्यापित',
    statsGrossEarned: 'कुल अर्जित मजदूरी',
    statsGrossSubtitle: 'सांविधिक दर अनुसार',
    statsAdvances: 'लिया गया खर्चा (अग्रिम)',
    statsAdvancesSubtitle: 'राशन व आपातकालीन',
    statsNetDue: 'शुद्ध देय बकाया राशि',
    statsNetDueSubtitle: 'इस सप्ताह देय',

    // Statutory Rights Panel
    rightsHeader: 'सांविधिक अधिकार एवं सामाजिक सुरक्षा स्थिति',
    rightsCompliantBadge: '100% अनुपालन',
    rightsEshramTitle: 'ई-श्रम यूनिवर्सल अकाउंट नंबर (UAN)',
    rightsEshramSubtitle: 'पीएमएसबीवाई ₹2,00,000 दुर्घटना बीमा सक्रिय',
    rightsBocwTitle: 'म.प्र. भवन संनिर्माण कर्मकार मंडल',
    rightsBocwSubtitle: '₹5,000 औजार किट अनुदान हेतु पात्र',
    rightsProtectionTitle: 'म.प्र. न्यूनतम मजदूरी संरक्षण गारंटी',
    rightsProtectionBody: 'इस कामगार का आधार सांविधिक वेतन ₹{wage}/दिन है। किसी भी ठेकेदार द्वारा इससे कम दर या अवैध कटौती दण्डनीय अपराध है (धारा 20, न्यूनतम मजदूरी अधिनियम 1948)।',

    // QR Modal
    qrModalTitle: 'क्रिप्टोग्राफिक क्यूआर सत्यापन',
    qrModalWorker: 'कारीगर:',
    qrModalUan: 'ई-श्रम यूएएन:',
    qrModalVerifiedDays: 'सत्यापित दिन:',
    qrModalWageDue: 'देय मजदूरी:',
    qrModalHash: 'सुरक्षा हैश:',
    qrModalInstruction: 'साइट सुपरवाइजर या श्रम निरीक्षक इस क्यूआर को किसी भी स्मार्टफोन से स्कैन कर वास्तविक समय की प्रामाणिकता की जांच कर सकते हैं।',
    qrModalClose: 'सत्यापन बंद करें',

    // Attendance & Muster Roll
    attendanceTitle: 'दैनिक हाजिरी व डिजिटल मस्टर रोल',
    attendanceSubtitle: 'जीपीएस सत्यापित समय, ओवर-टाइम गणना एवं छेड़छाड़-रहित डिजिटल हस्ताक्षर युक्त।',
    attendanceListenSummary: 'हाजिरी विवरण सुनें',
    attendancePunchHeading: 'नया हाजिरी पंच लगाएं',
    attendanceSelectSiteLabel: 'कार्य स्थल (प्रोजेक्ट साइट)',
    attendanceShiftDurationLabel: 'शिफ्ट का समय चुनें',
    attendanceShiftFullDay: 'पूर्ण दिवस',
    attendanceShiftFullDayHours: '8 घंटे',
    attendanceShiftHalfDay: 'आधा दिन',
    attendanceShiftHalfDayHours: '4 घंटे',
    attendanceShiftOvertime2h: 'ओवरटाइम (+2 घंटे)',
    attendanceShiftOvertime2hHours: '10 घंटे',
    attendanceShiftOvertime4h: 'नाइट शिफ्ट (+4h OT)',
    attendanceShiftOvertime4hHours: '12 घंटे',
    attendanceBaseRateLabel: 'आधार मजदूरी दर (8 घंटे):',
    attendanceOtPremiumLabel: 'ओवरटाइम अतिरिक्त लाभ:',
    attendanceCalculatedWageLabel: 'आज देय कुल मजदूरी:',
    attendanceNotesLabel: 'कार्य विवरण / स्थल टिप्पणी (वैकल्पिक)',
    attendanceNotesPlaceholder: 'उदा. पिलर सरिया बांधना, प्लास्टर कार्य',
    attendancePunchVerifying: 'क्यूआर व जीपीएस सत्यापित हो रहा है...',
    attendancePunchSuccess: 'हाजिरी सफलतापूर्वक दर्ज!',
    attendancePunchButton: 'हाजिरी दर्ज करें (पंच इन)',
    attendanceGeofenceNotice: 'इंदौर नगर निगम कार्य स्थल भू-सीमा (Geofence) सक्रिय है (50 मीटर परिधि सत्यापन मान्य)।',
    attendanceLedgerTitle: 'प्रमाणित हाजिरी रिकॉर्ड (मस्टर रजिस्टर)',
    attendanceRecordsFound: 'प्रविष्टियां दर्ज',
    attendanceFilterAll: 'सभी',
    attendanceFilterPresent: 'उपस्थित',
    attendanceFilterOvertime: 'ओवरटाइम',
    attendanceFilterHalf: 'आधा दिन',
    attendanceSearchPlaceholder: 'दिनांक, साइट या सुपरवाइजर से खोजें...',
    attendanceColDate: 'तारीख',
    attendanceColSite: 'कार्य स्थल',
    attendanceColShift: 'शिफ्ट व घंटे',
    attendanceColWage: 'अर्जित मजदूरी',
    attendanceColVerification: 'सत्यापन',
    attendanceNoRecords: 'कोई हाजिरी रिकॉर्ड नहीं मिला।',
    attendanceTotalHours: 'घंटे कुल',
    attendanceSignedBadge: 'हस्ताक्षरित',

    // Wage Protection Ledger & Khata
    ledgerTitle: 'वेतन सुरक्षा व पारदर्शी मजदूरी खाता (डिजिटल खाता)',
    ledgerSubtitle: 'दैनिक मजदूरी का हिसाब, लिए गए अग्रिम खर्चे और शुद्ध देय राशि का अपरिवर्तनीय ऑडिट-ट्रेल।',
    ledgerListenSummary: 'खाता सुनें',
    ledgerWhatsAppButton: 'व्हाट्सएप पर्ची',
    ledgerSlipCopied: 'पर्ची कॉपी हो गई!',
    ledgerRecordAdvanceBtn: 'खर्चा / भुगतान दर्ज करें',
    ledgerGrossCardTitle: 'कुल अर्जित मजदूरी',
    ledgerTotalEarnedCardTitle: 'कुल अर्जित मजदूरी',
    ledgerEarnedSubtitle: 'मस्टर सत्यापित सांविधिक आय',
    ledgerGrossDaysVerified: 'दिनों का कार्य सत्यापित',
    ledgerAdvancesCardTitle: 'कुल अग्रिम खर्चा (कटौती)',
    ledgerAdvancesSubtitle: 'पारिवारिक राशन व दवाई खर्च',
    ledgerNetBalanceCardTitle: 'वर्तमान शुद्ध देय राशि',
    ledgerNetBalanceSubtitle: 'प्रत्यक्ष ठेकेदार भुगतान (कटौती रहित)',
    ledgerHistoryTitle: 'खाता विवरण व रसीदें',
    ledgerFilterAll: 'सभी',
    ledgerFilterEarnings: 'कमाई (+)',
    ledgerFilterAdvances: 'खर्चा (-)',
    ledgerSearchPlaceholder: 'विवरण, तारीख या यूटीआर (UTR) संख्या से खोजें...',
    ledgerColDate: 'तारीख',
    ledgerColDescription: 'विवरण',
    ledgerColType: 'प्रकार',
    ledgerColModeUtr: 'माध्यम व UTR',
    ledgerColAmount: 'राशि',
    ledgerNoTransactions: 'कोई लेन-देन दर्ज नहीं है।',
    ledgerTagMusterWage: 'मस्टर मजदूरी',
    ledgerTagAdvanceKharcha: 'अग्रिम खर्चा',
    ledgerTagSettlement: 'साप्ताहिक भुगतान',
    ledgerCashVoucher: 'नकद रसीद',

    // Record Advance Modal
    modalAdvanceTitle: 'खर्चा अथवा भुगतान दर्ज करें',
    modalAdvanceTypeLabel: 'लेन-देन प्रकार',
    modalAdvanceTypeAdvance: 'अग्रिम खर्चा (-)',
    modalAdvanceTypeSettlement: 'साप्ताहिक भुगतान (+)',
    modalAdvanceAmountLabel: 'राशि (₹ में)',
    modalAdvanceDescLabel: 'विवरण / कारण',
    modalAdvanceDescPlaceholder: 'उदा. पारिवारिक राशन एवं चिकित्सा खर्च हेतु अग्रिम',
    modalAdvanceModeLabel: 'भुगतान माध्यम',
    modalAdvanceModeUpi: 'यूपीआई (PhonePe / GPay / Paytm)',
    modalAdvanceModeBank: 'बैंक खाता अंतरण (NEFT/IMPS)',
    modalAdvanceModeCash: 'नकद भुगतान (हस्ताक्षरित वाउचर)',
    modalAdvanceUtrLabel: 'यूटीआर / वाउचर संदर्भ',
    modalAdvanceUtrPlaceholder: 'खाली छोड़ने पर स्वतः उत्पन्न होगा',
    modalAdvanceCancel: 'रद्द करें',
    modalAdvanceSave: 'खाते में जोड़ें',

    // WhatsApp Wage Slip Text (in Hindi)
    whatsappSlipHeader: 'श्रम सेतु 2.0 · डिजिटल मजदूरी पर्ची (WAGE SLIP)',
    whatsappWorkerLabel: 'कारीगर:',
    whatsappTradeLabel: 'पेशा:',
    whatsappUanLabel: 'ई-श्रम UAN:',
    whatsappBocwLabel: 'BOCW पंजीयन:',
    whatsappSiteLabel: 'कार्य स्थल:',
    whatsappDaysWorkedLabel: 'सत्यापित कार्य दिवस:',
    whatsappDailyRateLabel: 'दैनिक मजदूरी दर:',
    whatsappGrossWagesLabel: 'कुल अर्जित राशि:',
    whatsappAdvancesLabel: 'अग्रिम खर्चा (कटौती):',
    whatsappNetDueLabel: 'शुद्ध देय बकाया राशि:',
    whatsappVerificationLabel: 'सत्यापन: SHA256 डिजिटल मस्टर हस्ताक्षर द्वारा प्रमाणित',
    whatsappHelplineNotice: 'म.प्र. शासन श्रम विभाग दिशा-निर्देश अनुसार · हेल्पलाइन:',

    // Contractor Portal
    contractorTitle: 'ठेकेदार व साइट प्रबंधन पोर्टल',
    contractorSubtitle: 'साइट मस्टर रोल सत्यापन, दल थोक हाजिरी एवं म.प्र. संनिर्माण मंडल सांविधिक अनुपालन।',
    contractorActiveProject: 'सक्रिय निर्माण परियोजना',
    contractorLeadContractor: 'मुख्य ठेकेदार',
    contractorCategory: 'प्रोजेक्ट श्रेणी',
    contractorDept: 'पी.डब्ल्यू.डी. / नगर निगम',
    contractorWorkforce: 'सक्रिय कार्यबल',
    contractorShramRegd: '100% श्रम पास पंजीकृत',
    contractorAuditCleared: 'डेमो मस्टर रोल स्थिति (इंदौर क्षेत्र)',
    contractorInspectTitle: 'इंदौर सिविल इंजीनियरिंग निरीक्षण',
    contractorInspectSub: 'दैनिक मस्टर सत्यापन एवं सुरक्षा अनुपालन',
    contractorBulkHeading: 'दैनिक दल हाजिरी (एक-क्लिक थोक सत्यापन)',
    contractorBulkSubtitle: 'साइट सुपरवाइजर कार्य दल के सभी कारीगरों की हाजिरी एक साथ प्रमाणित कर सकते हैं।',
    contractorDeselectAll: 'चयन हटाएं',
    contractorSelectAll: 'सभी कारीगर चुनें',
    contractorBulkSuccess: 'पूरे दल की हाजिरी दर्ज हो गई!',
    contractorPunchCrewBtn: '{count} कारीगरों की हाजिरी लगाएं',
    contractorLookupHeading: 'कारीगर डिजिटल पास सत्यापन (QR / UAN खोज)',
    contractorLookupSubtitle: 'नए कामगार की प्रामाणिकता, कौशल स्तर और कानूनी न्यूनतम मजदूरी दर की जांच करें।',
    contractorLookupPlaceholder: '12-अंकों का ई-श्रम UAN, कारीगर का नाम या ID दर्ज करें...',
    contractorLookupDemoBtn: 'डेमो UAN',
    contractorLookupVerifiedBadge: 'सत्यापित पास',
    contractorLookupMandatoryWage: 'अनिवार्य न्यूनतम दर:',
    contractorLookupNotFound: 'इस विवरण के साथ कोई पंजीकृत कारीगर नहीं मिला।',

    // Grievance Redressal (Samadhan)
    grievanceTitle: 'श्रम समाधान: मजदूरी चोरी निवारण एवं कानूनी शिकायत कक्ष',
    grievanceSubtitle: 'न्यूनतम मजदूरी अधिनियम 1948 की धारा 20 के तहत जिला श्रम पदाधिकारी (DLO इंदौर) हेतु स्व-चालित कानूनी आवेदन।',
    grievanceActNotice: 'धारा 20 न्यूनतम मजदूरी अधिनियम 1948',
    grievanceFormTitle: 'नई शिकायत / बकाया दावा दर्ज करें',
    grievanceFormSubtitle: 'प्रार्थी के सत्यापित डिजिटल मस्टर रिकॉर्ड अपने आप कानूनी साक्ष्य के रूप में संलग्न हो जाएंगे।',
    grievanceContractorLabel: 'ठेकेदार / पेटी ठेकेदार का नाम',
    grievanceContractorPlaceholder: 'उदा. राधे कंस्ट्रक्शन सर्विसेज',
    grievancePhoneLabel: 'ठेकेदार का मोबाइल',
    grievanceAmountLabel: 'बकाया दावा राशि (₹)',
    grievanceSiteLabel: 'कार्य स्थल (साइट का नाम)',
    grievanceSitePlaceholder: 'उदा. सुपर कॉरिडोर रिंग रोड प्रोजेक्ट',
    grievanceReasonLabel: 'शिकायत का मुख्य कारण',
    grievanceTypeLabel: 'शिकायत का मुख्य कारण',
    grievanceReasonUnpaid: 'अर्जित मजदूरी का अनाधिकृत रूप से रोका जाना',
    grievanceReasonDeduction: 'मजदूरी में से अवैध व मनमानी कटौती',
    grievanceReasonOvertime: 'ओवरटाइम कार्य का भुगतान न किया जाना',
    grievanceReasonSafety: 'सुरक्षा उपकरण व जान-माल का खतरा',
    grievanceDescLabel: 'घटना का पूरा विवरण',
    grievanceStatementLabel: 'श्रमिक का कथन व घटना विवरण',
    grievanceDescPlaceholder: 'मजदूरी किस तारीख से रोकी गई, ठेकेदार ने क्या कहा...',
    grievanceStatementPlaceholder: 'मजदूरी किस तारीख से रोकी गई, ठेकेदार ने क्या कहा...',
    grievanceSubmitBtn: 'शिकायत दर्ज करें व आवेदन पत्र बनाएं',
    grievanceActiveTitle: 'पंजीकृत विवाद व कानूनी स्थिति',
    grievanceCasesCount: 'प्रकरण',
    grievanceAgainst: 'विरुद्ध:',
    grievanceDocHeader: 'जिला श्रम पदाधिकारी इंदौर कानूनी आवेदन पत्र (धारा 20)',
    grievanceCopyNotice: 'आवेदन कॉपी करें',
    grievanceCopiedNotice: 'कॉपी हुआ',
    grievancePrintNotice: 'प्रिंट करें',
    grievanceAuditHashLabel: 'अपरिवर्तनीय ऑडिट हैश:',
    grievanceLegalGrounding: '100% विधि सम्मत कानूनी आधार',

    // Welfare Schemes Hub
    welfareTitle: 'ई-श्रम व म.प्र. भवन संनिर्माण कर्मकार कल्याण योजनाएं',
    welfareSubtitle: 'पंजीकृत कामगारों के लिए दुर्घटना बीमा, पेंशन, औजार किट अनुदान एवं शिक्षा सहायता।',
    welfareListenButton: 'योजनाएं सुनें',
    welfareActiveBadge: 'सक्रिय',
    welfareBenefitAmountLabel: 'आर्थिक सहायता राशि:',
    welfareEligibilityLabel: 'पात्रता शर्ते:',
    welfareUanPreverified: 'पूर्व-सत्यापित यूएएन',
    welfareRequiresReg: 'पंजीयन आवश्यक',
    welfareOfficialPortal: 'आधिकारिक पोर्टल',
    welfarePensionHeading: 'प्रधानमंत्री श्रम योगी मानधन (PM-SYM) पेंशन कैलकुलेटर',
    welfarePensionSubtitle: '60 वर्ष की आयु के बाद ₹3,000 मासिक सुनिश्चित पेंशन हेतु अंशदान गणना।',
    welfareWorkerAgeLabel: 'कारीगर की वर्तमान आयु (18-40 वर्ष):',
    welfareYearsUnit: 'वर्ष',
    welfareMatchingText: 'जितना अंशदान आप जमा करते हैं, उतनी ही 50% बराबर राशि भारत सरकार द्वारा आपके पेंशन खाते में जमा की जाती है।',
    welfareWorkerShareLabel: 'कारीगर का मासिक अंशदान:',
    welfareGovtShareLabel: 'भारत सरकार का अंशदान (50%):',
    welfareAssuredPensionLabel: '60 वर्ष बाद सुनिश्चित मासिक पेंशन:',
    welfarePerMonth: '/ माह',

    // New Worker Modal
    workerModalTitle: 'नया कारीगर पंजीयन एवं स्मार्ट पास',
    workerModalFullNameEn: 'पूरा नाम (अंग्रेजी में) *',
    workerModalFullNameHi: 'पूरा नाम (हिन्दी में)',
    workerModalMobile: 'मोबाइल नंबर',
    workerModalBloodGroup: 'रक्त समूह',
    workerModalTrade: 'पेशा / हुनर *',
    workerModalSkillLevel: 'कौशल वर्गीकरण',
    workerModalBaseWage: 'आधार दैनिक मजदूरी (₹ / दिन)',
    workerModalUan: 'ई-श्रम UAN (12 अंक)',
    workerModalAadhaar: 'आधार अंतिम 4 अंक',
    workerModalEmergencyName: 'आपातकालीन संपर्क नाम',
    workerModalEmergencyPhone: 'आपातकालीन मोबाइल',
    workerModalDeploySite: 'प्रारंभिक कार्य स्थल',
    workerModalCancel: 'रद्द करें',
    workerModalSubmit: 'स्मार्ट श्रम पास जारी करें',

    // Bal Vigyan Innovation Exhibit Modal
    balVigyanModalTitle: 'वरिष्ठ बाल विज्ञान नवाचार प्रदर्शनी · श्रम सेतु 2.0',
    balVigyanModalSub: 'इंदौर, मध्य प्रदेश में विकसित · 45 करोड़ असंगठित कामगारों हेतु सामाजिक नवाचार',
    balVigyanGenesisTitle: 'उद्देश्य एवं मूल समस्या:',
    balVigyanGenesisBody: 'भारत में असंगठित दैनिक वेतन भोगी निर्माण श्रमिकों, मिस्त्रियों और मजदूरों को लगातार मजदूरी चोरी, मनमानी कटौती, ओवरटाइम के इंकार और कार्य के कानूनी प्रमाण के अभाव का सामना करना पड़ता है। हाजिरी रजिस्टर (मस्टर रोल) केवल ठेकेदारों के पास होने के कारण विवाद की स्थिति में मजदूरों के पास कोई साक्ष्य नहीं होता।',
    balVigyanPillar1Title: '1. क्रिप्टोग्राफिक स्मार्ट पास',
    balVigyanPillar1Body: 'ऑफलाइन क्यूआर सत्यापन, ई-श्रम यूएएन लिकेंज और SHA256 डिजिटल अखंडता टोकन युक्त भौतिक/डिजिटल हाइब्रिड कार्ड।',
    balVigyanPillar2Title: '2. निरक्षरता-मुक्त वाक इंजन (Voice Engine)',
    balVigyanPillar2Body: 'हिन्दी एवं अंग्रेजी में टेक्स्ट-टू-स्पीच ऑडियो वाचन, जिससे कम पढ़े-लिखे कामगार भी अपने कार्य के घंटे और देय राशि आसानी से सुन सकते हैं।',
    balVigyanPillar3Title: '3. सांविधिक मजदूरी सुरक्षा कवच',
    balVigyanPillar3Body: 'म.प्र. शासन द्वारा अधिसूचित न्यूनतम मजदूरी दरों (₹412-₹530/दिन) एवं स्वतः ओवरटाइम गणना को बाध्यकारी रूप से लागू करता है।',
    balVigyanPillar4Title: '4. कानूनी शिकायत स्वचालन (DLO Indore)',
    balVigyanPillar4Body: 'न्यूनतम मजदूरी अधिनियम की धारा 20 अंतर्गत जिला श्रम पदाधिकारी इंदौर हेतु मस्टर साक्ष्यों सहित कानूनी आवेदन पत्र तैयार करता है।',
    balVigyanPersistenceTitle: 'डेटाबेस: लोकल डेमो मोड (IndexedDB सक्रिय)',
    balVigyanPersistenceTag: 'सुपाबेस तैयार v5.0',
    balVigyanPersistenceBody: 'सिस्टम विनिर्देशानुसार, क्लाइंट-साइड सुरक्षित स्टोरेज (IndexedDB + LocalStorage) इंदौर साइट एवं मस्टर डेटा के साथ सक्रिय है। आगामी सप्ताह सुपाबेस पोस्टग्रेसक्यूएल माइग्रेशन हेतु डेटा संरचना पूरी तरह संगत है।',
    balVigyanExportBtn: 'बैकअप JSON डाउनलोड करें',
    balVigyanBackupDownloaded: 'बैकअप डाउनलोड हुआ!',
    balVigyanResetBtn: 'बाल विज्ञान डेमो डेटा पुनर्स्थापित करें',
    balVigyanClose: 'प्रदर्शनी बंद करें',
    balVigyanHelplineContact: 'परियोजना संपर्क एवं बाल विज्ञान मार्गदर्शन हेल्पलाइन:',

    // Footer
    footerTitle: 'श्रम सेतु 2.0',
    footerInnovation: 'वरिष्ठ बाल विज्ञान स्वर्ण नवाचार (इंदौर, म.प्र.)',
    footerCompliance: 'धारा 20 न्यूनतम मजदूरी अधिनियम 1948 अनुसार',
    footerExhibitBtn: 'बाल विज्ञान प्रदर्शनी',
    footerResetBtn: 'डेमो डेटा रीसेट करें',
    footerDemoMode: 'IndexedDB लोकल डेमो मोड',
    footerHelplineLabel: 'आधिकारिक सहायता एवं हेल्पलाइन:',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/**
 * Robust translation retrieval function.
 * Detects missing keys at runtime and logs a warning in non-production,
 * falling back safely to the other language or raw key to guarantee no blank/undefined labels.
 */
export function t(
  key: TranslationKey,
  lang: Language = 'hi',
  params?: Record<string, string | number>
): string {
  const dictionary: Record<string, string> = translations[lang] || translations.hi;
  let text: string | undefined = dictionary[key];

  if (!text) {
    // Fallback to opposite language
    const fallbackLang = lang === 'en' ? 'hi' : 'en';
    const fallbackDict: Record<string, string> = translations[fallbackLang] || translations.en;
    text = fallbackDict[key];

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing translation key "${key}" for language "${lang}".`);
    }
  }

  if (!text) {
    return String(key);
  }

  if (params) {
    let interpolated = text;
    for (const [paramKey, paramVal] of Object.entries(params)) {
      interpolated = interpolated.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    }
    return interpolated;
  }

  return text;
}

/**
 * Currency formatter respecting Indian numbering format
 */
export function formatCurrency(amount?: number | null): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formatted = Math.abs(num).toLocaleString('en-IN');
  return num < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Localized Trade cleaner: eliminates awkward mixed brackets like "Head Mason (मुख्य राजमिस्त्री)"
 */
export function getLocalizedTrade(trade: string, lang: Language): string {
  if (!trade) return '';

  const tradeMap: Record<string, { en: string; hi: string }> = {
    'head mason': { en: 'Head Mason', hi: 'मुख्य राजमिस्त्री' },
    'mason': { en: 'Mason', hi: 'राजमिस्त्री' },
    'rajmistri': { en: 'Head Mason', hi: 'मुख्य राजमिस्त्री' },
    'steel binder': { en: 'Steel Binder & Rigging Helper', hi: 'सरिया बाइंडर व सहायक' },
    'electrician': { en: 'Site Electrician & Wireman', hi: 'साइट इलेक्ट्रीशियन' },
    'beldar': { en: 'General Helper & Batching Assistant', hi: 'बेलदार व कंक्रीट सहायक' },
    'tile': { en: 'Tile Finisher & Surface Polisher', hi: 'टाइल पॉलिश व फिनिशर' },
    'carpenter': { en: 'Shuttering Carpenter', hi: 'शटरिंग बढ़ई' },
    'painter': { en: 'Commercial Painter', hi: 'पेंटर / पुताई कारीगर' },
  };

  const lower = trade.toLowerCase();
  for (const [key, val] of Object.entries(tradeMap)) {
    if (lower.includes(key)) {
      return lang === 'hi' ? val.hi : val.en;
    }
  }

  // If trade contains parenthesis like "Trade Name (हिन्दी नाम)"
  const match = trade.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (match) {
    const enPart = match[1].trim();
    const hiPart = match[2].trim();
    return lang === 'hi' ? hiPart : enPart;
  }

  return trade;
}

/**
 * Localized Skill Level info
 */
export function getLocalizedSkill(skillLevel: string, lang: Language): { label: string; color: string } {
  switch (skillLevel) {
    case 'skilled':
      return {
        label: lang === 'hi' ? 'कुशल कारीगर' : 'Skilled Artisan',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      };
    case 'semi_skilled':
      return {
        label: lang === 'hi' ? 'अर्ध-कुशल' : 'Semi-Skilled',
        color: 'bg-blue-50 text-blue-800 border-blue-300',
      };
    case 'highly_skilled':
      return {
        label: lang === 'hi' ? 'उच्च कुशल' : 'Highly Skilled',
        color: 'bg-purple-50 text-purple-800 border-purple-300',
      };
    default:
      return {
        label: lang === 'hi' ? 'सामान्य सहायक' : 'General Labor',
        color: 'bg-amber-50 text-amber-800 border-amber-300',
      };
  }
}
