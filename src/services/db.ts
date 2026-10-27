import { 
  Worker, 
  ConstructionSite, 
  AttendanceRecord, 
  WageLedgerEntry, 
  DisputeGrievance, 
  WelfareScheme,
  AuditEvent,
  ApprovalRequest,
  WageBreakdown 
} from '../types';
import { calculateRecordBreakdown, calculateShiftWage } from './wageEngine';
import { idb } from './indexedDB';
import { createAuditEvent, GENESIS_HASH } from './cryptoAudit';

// Initial Seed Data for Indore, Madhya Pradesh
export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'WKR-MP-001',
    name: 'Rameshwar Lal Ahirwar',
    hindiName: 'रामेश्वर लाल अहिरवार',
    phone: '+91 98260 14820',
    trade: 'Head Mason (मुख्य राजमिस्त्री)',
    skillLevel: 'skilled',
    dailyBaseWage: 550,
    eShramUAN: '1009 8472 9102',
    bocwRegistrationNo: 'MP-BOCW-IND-2023-88910',
    aadhaarLast4: '4921',
    bloodGroup: 'B+',
    emergencyContact: {
      name: 'Kaushalya Bai (Wife)',
      phone: '+91 97531 88204',
      relation: 'Spouse',
    },
    photoUrl: '/assets/images/shram_setu_hero_pass_1792385013356.jpg',
    joinedDate: '2023-04-12',
    activeSiteId: 'SITE-IND-METRO-01',
    bankAccountLast4: '3819',
    ifscCode: 'SBIN0003042',
    upiId: '9826014820@sbi',
    isDemoRecord: true,
  },
  {
    id: 'WKR-MP-002',
    name: 'Sunita Bai Gond',
    hindiName: 'सुनीता बाई गोंड',
    phone: '+91 94066 33912',
    trade: 'Steel Binder & Rigging Helper (सरिया बाइंडर व सहायक)',
    skillLevel: 'semi_skilled',
    dailyBaseWage: 465,
    eShramUAN: '1012 3991 4082',
    bocwRegistrationNo: 'MP-BOCW-IND-2022-44102',
    aadhaarLast4: '8109',
    bloodGroup: 'O+',
    emergencyContact: {
      name: 'Laxman Gond (Brother)',
      phone: '+91 91114 90281',
      relation: 'Brother',
    },
    photoUrl: '/assets/images/shram_setu_hero_pass_1792385013356.jpg',
    joinedDate: '2023-08-19',
    activeSiteId: 'SITE-IND-METRO-01',
    bankAccountLast4: '9920',
    ifscCode: 'BKID0008819',
    upiId: 'sunitagond@boi',
    isDemoRecord: true,
  },
  {
    id: 'WKR-MP-003',
    name: 'Santosh Kumar Verma',
    hindiName: 'संतोष कुमार वर्मा',
    phone: '+91 98930 77154',
    trade: 'Site Electrician & Cable Jointer (साइट इलेक्ट्रीशियन)',
    skillLevel: 'skilled',
    dailyBaseWage: 580,
    eShramUAN: '1004 8831 2940',
    bocwRegistrationNo: 'MP-BOCW-IND-2024-19042',
    aadhaarLast4: '3042',
    bloodGroup: 'A+',
    emergencyContact: {
      name: 'Pooja Verma (Daughter)',
      phone: '+91 73890 22104',
      relation: 'Daughter',
    },
    photoUrl: '/assets/images/shram_setu_hero_pass_1792385013356.jpg',
    joinedDate: '2024-01-10',
    activeSiteId: 'SITE-IND-COM-02',
    bankAccountLast4: '1104',
    ifscCode: 'PUNB0182700',
    upiId: 'vermasantosh@pnb',
    isDemoRecord: true,
  },
  {
    id: 'WKR-MP-004',
    name: 'Mukesh Yadav',
    hindiName: 'मुकेश यादव',
    phone: '+91 88782 44901',
    trade: 'General Helper & Concrete Batching (बेलदार व कंक्रीट सहायक)',
    skillLevel: 'unskilled',
    dailyBaseWage: 420,
    eShramUAN: '1015 7720 1934',
    bocwRegistrationNo: 'MP-BOCW-IND-2023-30192',
    aadhaarLast4: '7715',
    bloodGroup: 'AB+',
    emergencyContact: {
      name: 'Dinesh Yadav (Uncle)',
      phone: '+91 99264 55102',
      relation: 'Uncle',
    },
    photoUrl: '/assets/images/shram_setu_hero_pass_1792385013356.jpg',
    joinedDate: '2023-11-05',
    activeSiteId: 'SITE-IND-METRO-01',
    bankAccountLast4: '5561',
    ifscCode: 'CBIN0283921',
    upiId: 'mukeshyadav@centralbank',
    isDemoRecord: true,
  },
  {
    id: 'WKR-MP-005',
    name: 'Geeta Devi Malviya',
    hindiName: 'गीता देवी मालवीय',
    phone: '+91 96300 11928',
    trade: 'Tile Grinding & Surface Polisher (फिनिशिंग व पॉलिशर)',
    skillLevel: 'semi_skilled',
    dailyBaseWage: 475,
    eShramUAN: '1008 1943 0081',
    bocwRegistrationNo: 'MP-BOCW-IND-2024-51209',
    aadhaarLast4: '9028',
    bloodGroup: 'B-',
    emergencyContact: {
      name: 'Kamlesh Malviya (Son)',
      phone: '+91 97130 48821',
      relation: 'Son',
    },
    photoUrl: '/assets/images/shram_setu_hero_pass_1792385013356.jpg',
    joinedDate: '2024-02-14',
    activeSiteId: 'SITE-IND-COM-02',
    bankAccountLast4: '7203',
    ifscCode: 'BARB0VIJIND',
    upiId: 'geetamalviya@bob',
    isDemoRecord: true,
  },
];

export const INITIAL_SITES: ConstructionSite[] = [
  {
    id: 'SITE-IND-METRO-01',
    name: 'Indore Metro Line 3 Viaduct Package',
    hindiName: 'इंदौर मेट्रो लाइन 3 वायडक्ट पैकेज (सुपर कॉरिडोर)',
    location: 'Gandhi Nagar to Super Corridor, Indore',
    city: 'Indore, MP',
    contractorName: 'Narmada Infra & Urban Engineering Ltd.',
    contractorPhone: '+91 731 2928100',
    projectType: 'Metro Rail Infrastructure',
    coordinates: { lat: 22.7533, lng: 75.8437 },
    activeWorkers: 142,
    safetyRating: 'Grade A (BOCW Compliant)',
  },
  {
    id: 'SITE-IND-COM-02',
    name: 'Vijay Nagar Smart Commercial Hub',
    hindiName: 'विजय नगर स्मार्ट कॉमर्शियल हब',
    location: 'Plot 44, Scheme 54, Vijay Nagar, Indore',
    city: 'Indore, MP',
    contractorName: 'Malwa Buildcon & Projects Pvt Ltd',
    contractorPhone: '+91 731 4059281',
    projectType: 'Commercial Complex',
    coordinates: { lat: 22.7538, lng: 75.8937 },
    activeWorkers: 88,
    safetyRating: 'Grade A-',
  },
  {
    id: 'SITE-IND-FLY-03',
    name: 'Khajrana Ring Road Elevated Corridor',
    hindiName: 'खजराना रिंग रोड एलिवेटेड कॉरिडोर',
    location: 'Khajrana Square to Bengali Square, Indore',
    city: 'Indore, MP',
    contractorName: 'Indore Vikas Highway Authority',
    contractorPhone: '+91 731 2530192',
    projectType: 'Flyover & Highways',
    coordinates: { lat: 22.7214, lng: 75.9082 },
    activeWorkers: 64,
    safetyRating: 'Grade B+',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-2026-10-18-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-18',
    timeIn: '08:02:14',
    timeOut: '17:31:05',
    shiftType: 'full_day',
    baseHours: 8,
    overtimeHours: 0,
    calculatedWage: 550,
    status: 'present',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    geoVerified: true,
    isDemoRecord: true,
  },
  {
    id: 'ATT-2026-10-17-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-17',
    timeIn: '08:00:22',
    timeOut: '19:35:10',
    shiftType: 'overtime_2h',
    baseHours: 8,
    overtimeHours: 2,
    calculatedWage: 688,
    status: 'overtime',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    geoVerified: true,
    isDemoRecord: true,
  },
  {
    id: 'ATT-2026-10-16-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-16',
    timeIn: '07:55:10',
    timeOut: '17:30:00',
    shiftType: 'full_day',
    baseHours: 8,
    overtimeHours: 0,
    calculatedWage: 550,
    status: 'present',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
    geoVerified: true,
    isDemoRecord: true,
  },
  {
    id: 'ATT-2026-10-15-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-15',
    timeIn: '08:05:00',
    timeOut: '12:30:00',
    shiftType: 'half_day',
    baseHours: 4,
    overtimeHours: 0,
    calculatedWage: 275,
    status: 'half_day',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: '550bca8199341fae01928374a2f8c05763920958172901384029103984029102',
    geoVerified: true,
    notes: 'Afternoon permit leave for health checkup.',
    isDemoRecord: true,
  },
  {
    id: 'ATT-2026-10-18-002',
    workerId: 'WKR-MP-002',
    workerName: 'Sunita Bai Gond',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-18',
    timeIn: '08:20:00',
    timeOut: '17:15:00',
    shiftType: 'full_day',
    baseHours: 8,
    overtimeHours: 0,
    calculatedWage: 465,
    status: 'present',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'c099318fa82bde77189201948810294719028471920481920481920481920481',
    geoVerified: true,
    isDemoRecord: true,
  },
  {
    id: 'ATT-2026-10-17-002',
    workerId: 'WKR-MP-002',
    workerName: 'Sunita Bai Gond',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-17',
    timeIn: '08:15:30',
    timeOut: '17:25:00',
    shiftType: 'full_day',
    baseHours: 8,
    overtimeHours: 0,
    calculatedWage: 465,
    status: 'present',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: '7b8893d19fca9012894177218902819028491028491028491028491028491028',
    geoVerified: true,
    isDemoRecord: true,
  },
  {
    id: 'ATT-2026-10-18-003',
    workerId: 'WKR-MP-003',
    workerName: 'Santosh Kumar Verma',
    siteId: 'SITE-IND-COM-02',
    siteName: 'Vijay Nagar Smart Commercial Hub',
    date: '2026-10-18',
    timeIn: '08:30:00',
    timeOut: '18:30:00',
    shiftType: 'overtime_2h',
    baseHours: 8,
    overtimeHours: 2,
    calculatedWage: 725,
    status: 'overtime',
    supervisorName: 'R.K. Patel',
    verificationHash: '1a82fca901239840192849102938401928301928301928301928301928301928',
    geoVerified: true,
    isDemoRecord: true,
  },
];

export const INITIAL_LEDGER: WageLedgerEntry[] = [
  {
    id: 'LDG-001',
    workerId: 'WKR-MP-001',
    date: '2026-10-18',
    type: 'daily_credit',
    amount: 550,
    description: 'Day attendance credit (Pier P-42 masonry shift)',
    hindiDescription: 'दैनिक हाजिरी मजदूरी (पियर P-42 निर्माण कार्य)',
    paymentMode: 'bank_transfer',
    status: 'settled',
    acknowledgmentStatus: 'acknowledged_by_worker',
    acknowledgedAt: '2026-10-18T18:00:00Z',
    acknowledgedByWorkerId: 'WKR-MP-001',
    utrOrReceiptNo: 'SBIN881920384102',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
    isDemoRecord: true,
  },
  {
    id: 'LDG-002',
    workerId: 'WKR-MP-001',
    date: '2026-10-17',
    type: 'daily_credit',
    amount: 688,
    description: 'Day attendance + 2h verified overtime credit',
    hindiDescription: 'दैनिक हाजिरी व 2 घंटे ओवरटाइम मजदूरी',
    paymentMode: 'bank_transfer',
    status: 'settled',
    acknowledgmentStatus: 'acknowledged_by_worker',
    acknowledgedAt: '2026-10-17T20:00:00Z',
    acknowledgedByWorkerId: 'WKR-MP-001',
    utrOrReceiptNo: 'SBIN771920381903',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
    isDemoRecord: true,
  },
  {
    id: 'LDG-003',
    workerId: 'WKR-MP-001',
    date: '2026-10-16',
    type: 'advance_kharcha',
    amount: -500, // Negative for deduction/advance payout
    description: 'Mid-week household ration advance (खर्चा)',
    hindiDescription: 'साप्ताहिक पारिवारिक राशन अग्रिम खर्चा भुगतान',
    paymentMode: 'upi',
    status: 'settled',
    acknowledgmentStatus: 'acknowledged_by_worker',
    acknowledgedAt: '2026-10-16T18:30:00Z',
    acknowledgedByWorkerId: 'WKR-MP-001',
    utrOrReceiptNo: 'UPI-NARMADA-550192',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
    isDemoRecord: true,
  },
  {
    id: 'LDG-004',
    workerId: 'WKR-MP-001',
    date: '2026-10-16',
    type: 'daily_credit',
    amount: 550,
    description: 'Day attendance credit (Casting yard masonry)',
    hindiDescription: 'दैनिक हाजिरी मजदूरी',
    paymentMode: 'bank_transfer',
    status: 'settled',
    acknowledgmentStatus: 'acknowledged_by_worker',
    acknowledgedAt: '2026-10-16T18:00:00Z',
    acknowledgedByWorkerId: 'WKR-MP-001',
    utrOrReceiptNo: 'SBIN661920381001',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
    isDemoRecord: true,
  },
  {
    id: 'LDG-005',
    workerId: 'WKR-MP-001',
    date: '2026-10-15',
    type: 'daily_credit',
    amount: 275,
    description: 'Half day approved attendance credit',
    hindiDescription: 'आधा दिन स्वीकृत हाजिरी भुगतान',
    paymentMode: 'bank_transfer',
    status: 'settled',
    acknowledgmentStatus: 'acknowledged_by_worker',
    acknowledgedAt: '2026-10-15T13:00:00Z',
    acknowledgedByWorkerId: 'WKR-MP-001',
    utrOrReceiptNo: 'SBIN551920380992',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
    isDemoRecord: true,
  },
  {
    id: 'LDG-006',
    workerId: 'WKR-MP-002',
    date: '2026-10-18',
    type: 'daily_credit',
    amount: 465,
    description: 'Full day steel binding muster credit',
    hindiDescription: 'पूर्ण दिवस सरिया बाइंडिंग मजदूरी',
    paymentMode: 'bank_transfer',
    status: 'settled',
    acknowledgmentStatus: 'acknowledged_by_worker',
    acknowledgedAt: '2026-10-18T18:00:00Z',
    acknowledgedByWorkerId: 'WKR-MP-002',
    utrOrReceiptNo: 'BKID99102830192',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
    isDemoRecord: true,
  },
];

export const INITIAL_GRIEVANCES: DisputeGrievance[] = [
  {
    id: 'GRV-2026-IND-01',
    workerId: 'WKR-MP-004',
    workerName: 'Mukesh Yadav',
    workerPhone: '+91 88782 44901',
    contractorName: 'Shree Radhe Sub-Contractors',
    contractorPhone: '+91 94250 81920',
    siteName: 'Rau Bypass Commercial Complex',
    disputeType: 'unpaid_wages',
    claimedAmount: 4200,
    incidentDate: '2026-09-28',
    filingDate: '2026-10-04',
    status: 'notice_issued',
    description: 'Worked 10 continuous days on concrete mixer batching. Contractor absconded without paying 10 days daily wages.',
    contractorResponse: 'Subcontractor pending reconciliation with principal firm; payment tranche scheduled under DLO mediation.',
    contractorResponseDate: '2026-10-06',
    dloFilingRef: 'DLO-IND-WAGE-2026/0419',
    evidenceMusterCount: 10,
    isDemoRecord: true,
  },
];

export const WELFARE_SCHEMES: WelfareScheme[] = [
  {
    id: 'SCH-01',
    title: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    hindiTitle: 'प्रधानमंत्री सुरक्षा बीमा योजना (दुर्घटना बीमा)',
    organization: 'Ministry of Labour & Employment / e-Shram',
    benefitAmount: '₹2,00,000 for accidental death or permanent disability',
    eligibility: 'All e-Shram registered workers aged 18 to 70 years',
    hindiEligibility: '18 से 70 वर्ष के सभी ई-श्रम पंजीकृत कामगार',
    category: 'insurance',
    linkUrl: 'https://eshram.gov.in',
  },
  {
    id: 'SCH-02',
    title: 'MP BOCW Free Artisan Tool-Kit Grant',
    hindiTitle: 'मध्य प्रदेश भवन संनिर्माण कर्मकार औजार किट अनुदान',
    organization: 'MP Building & Other Construction Workers Board',
    benefitAmount: '₹5,000 direct bank transfer for purchasing trade tools',
    eligibility: 'Registered construction artisans (Masons, Carpenters, Plumbers, Electricians) with valid BOCW card',
    hindiEligibility: 'मध्य प्रदेश श्रम कल्याण मंडल में पंजीकृत निर्माण कारीगर',
    category: 'tool_kit',
    linkUrl: 'https://labour.mp.gov.in',
  },
  {
    id: 'SCH-03',
    title: 'Pradhan Mantri Shram Yogi Maandhan (PM-SYM)',
    hindiTitle: 'प्रधानमंत्री श्रम योगी मानधन (मासिक पेंशन योजना)',
    organization: 'Government of India',
    benefitAmount: 'Assured monthly pension of ₹3,000 after 60 years of age',
    eligibility: 'Unorganised workers aged 18–40 earning less than ₹15,000/month',
    hindiEligibility: '18 से 40 वर्ष की आयु के असंगठित श्रमिक, मासिक आय ₹15,000 से कम',
    category: 'pension',
    linkUrl: 'https://maandhan.in',
  },
  {
    id: 'SCH-04',
    title: 'MP Shramik Prasooti Sahayata (Maternity Benefit)',
    hindiTitle: 'मुख्यमंत्री प्रसूति सहायता योजना (महिला कामगार)',
    organization: 'MP Labor Department',
    benefitAmount: '₹16,000 financial support during childbirth & rest',
    eligibility: 'Registered female construction workers under MP BOCW',
    hindiEligibility: 'पंजीकृत महिला निर्माण श्रमिक (2 प्रसव तक)',
    category: 'maternity',
    linkUrl: 'https://labour.mp.gov.in',
  },
];

// Initial Audit Chain Seed
export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'AUD-2026-10-15-0001',
    sequenceNumber: 1,
    entityType: 'work_record',
    entityId: 'ATT-2026-10-15-001',
    action: 'created',
    actorRole: 'contractor',
    actorId: 'Anil Sisodiya (JE)',
    timestamp: '2026-10-15T12:35:00.000Z',
    canonicalPayload: '{"date":"2026-10-15","hours":4,"siteId":"SITE-IND-METRO-01","wage":275,"workerId":"WKR-MP-001"}',
    previousHash: GENESIS_HASH,
    hash: '6a42bbce31720d20ef228f419c8f00109fa5d481028472910481029482019481',
  },
];

// Initial Approval Requests for Demo
export const INITIAL_APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'REQ-2026-10-25-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    workerReferenceToken: 'WKR-DEMO-OPAQUE-TOKEN-001',
    contractorId: 'CTR-IND-METRO',
    contractorName: 'Anil Sisodiya (JE)',
    contractorPhone: '+91 731 2928100',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    actionType: 'attendance_confirmation',
    recordId: 'ATT-CONF-001',
    shiftDate: '2026-10-25',
    shiftType: 'full_day',
    hours: 8,
    agreedWage: 550,
    amount: 550,
    status: 'pending',
    notes: 'Scheduled concrete pouring shift on Super Corridor pier 42.',
    createdAt: '2026-10-25T07:30:00Z',
  },
];

class ShramSetuDB {
  private workers: Worker[] = [];
  private sites: ConstructionSite[] = [];
  private attendance: AttendanceRecord[] = [];
  private ledger: WageLedgerEntry[] = [];
  private grievances: DisputeGrievance[] = [];
  private auditEvents: AuditEvent[] = [];
  private approvalRequests: ApprovalRequest[] = [];
  private isInitialized = false;

  constructor() {
    this.initSync();
  }

  /**
   * Synchronous memory initialization for immediate initial render
   */
  private initSync(): void {
    if (this.isInitialized) return;

    // Check localStorage for prior saved data
    let loadedWorkers = INITIAL_WORKERS;
    let loadedSites = INITIAL_SITES;
    let loadedAttendance = INITIAL_ATTENDANCE;
    let loadedLedger = INITIAL_LEDGER;
    let loadedGrievances = INITIAL_GRIEVANCES;
    let loadedApprovals = INITIAL_APPROVAL_REQUESTS;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const w = window.localStorage.getItem('shramsetu_workers');
        if (w) loadedWorkers = JSON.parse(w);
        const s = window.localStorage.getItem('shramsetu_sites');
        if (s) loadedSites = JSON.parse(s);
        const a = window.localStorage.getItem('shramsetu_attendance');
        if (a) loadedAttendance = JSON.parse(a);
        const l = window.localStorage.getItem('shramsetu_ledger');
        if (l) loadedLedger = JSON.parse(l);
        const g = window.localStorage.getItem('shramsetu_grievances');
        if (g) loadedGrievances = JSON.parse(g);
        const reqs = window.localStorage.getItem('shramsetu_approval_requests');
        if (reqs) loadedApprovals = JSON.parse(reqs);
      } catch {
        // Safe fallback
      }
    }

    this.workers = loadedWorkers;
    this.sites = loadedSites;
    this.attendance = loadedAttendance;
    this.ledger = loadedLedger;
    this.grievances = loadedGrievances;
    this.auditEvents = INITIAL_AUDIT_EVENTS;
    this.approvalRequests = loadedApprovals;
    this.isInitialized = true;

    // Trigger background IndexedDB warm-up and migration
    if (typeof window !== 'undefined') {
      setTimeout(() => this.migrateToIndexedDB(), 0);
    }
  }

  /**
   * Migrates local memory / localStorage records safely into IndexedDB
   */
  public async migrateToIndexedDB(): Promise<void> {
    try {
      const existingInIdb = await idb.getAll<Worker>('workers');
      if (existingInIdb.length === 0) {
        // Populate IndexedDB with current authoritative records
        await idb.putBatch('workers', this.workers);
        await idb.putBatch('work_records', this.attendance);
        await idb.putBatch('payments', this.ledger);
        await idb.putBatch('disputes', this.grievances);
        await idb.putBatch('audit_events', this.auditEvents);
      }
    } catch (err) {
      console.warn('[DB] Background IndexedDB sync skipped:', err);
    }
  }

  // --------------------------------------------------------------------------
  // Workers API
  // --------------------------------------------------------------------------
  public getWorkers(): Worker[] {
    this.initSync();
    return [...this.workers];
  }

  public getWorkerById(id: string): Worker | undefined {
    this.initSync();
    return this.workers.find((w) => w.id === id);
  }

  public addWorker(worker: Worker): void {
    this.initSync();
    this.workers.unshift(worker);
    this.persist('workers', this.workers);
    idb.put('workers', worker).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // Sites API
  // --------------------------------------------------------------------------
  public getSites(): ConstructionSite[] {
    this.initSync();
    return [...this.sites];
  }

  // --------------------------------------------------------------------------
  // Attendance Muster API
  // --------------------------------------------------------------------------
  public getAttendance(workerId?: string): AttendanceRecord[] {
    this.initSync();
    if (workerId) {
      return this.attendance.filter((a) => a.workerId === workerId);
    }
    return [...this.attendance];
  }

  public addAttendance(record: AttendanceRecord): void {
    this.initSync();

    // One approved shift per worker per calendar day. Re-marking the same date
    // replaces the previous entry (and its auto-generated wage credit) so a
    // duplicate punch can never double-credit the ledger.
    const duplicate = this.attendance.find(
      (att) => att.workerId === record.workerId && att.date === record.date
    );
    if (duplicate) {
      this.attendance = this.attendance.filter((att) => att.id !== duplicate.id);
      this.ledger = this.ledger.filter((entry) => entry.id !== `LDG-ATT-${duplicate.id}`);
      idb.delete('work_records', duplicate.id).catch(() => {});
    }

    this.attendance.unshift(record);
    this.persist('attendance', this.attendance);
    idb.put('work_records', record).catch(() => {});

    // Automatically generate matched wage ledger credit entry
    const ledgerEntry: WageLedgerEntry = {
      id: `LDG-ATT-${record.id}`,
      workerId: record.workerId,
      date: record.date,
      type: 'daily_credit',
      amount: record.calculatedWage,
      description: `Daily attendance credit - ${record.shiftType.replace('_', ' ')} (${record.siteName})`,
      hindiDescription: `दैनिक हाजिरी मजदूरी - ${record.shiftType === 'half_day' ? 'आधा दिन' : record.shiftType.includes('overtime') ? 'ओवरटाइम सहित' : 'पूर्ण दिवस'}`,
      paymentMode: 'bank_transfer',
      status: 'settled',
      acknowledgmentStatus: 'acknowledged_by_worker',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedByWorkerId: record.workerId,
      utrOrReceiptNo: `SETU-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      siteId: record.siteId,
      siteName: record.siteName,
      contractorName: 'Verified On-Site Supervisor',
      isDemoRecord: record.isDemoRecord,
    };
    this.addLedgerEntry(ledgerEntry);
  }

  // --------------------------------------------------------------------------
  // Wage Ledger API
  // --------------------------------------------------------------------------
  public getLedger(workerId?: string): WageLedgerEntry[] {
    this.initSync();
    if (workerId) {
      return this.ledger.filter((l) => l.workerId === workerId);
    }
    return [...this.ledger];
  }

  public addLedgerEntry(entry: WageLedgerEntry): void {
    this.initSync();
    // Enforce de-duplication: do not add duplicate payment ID
    const exists = this.ledger.some((l) => l.id === entry.id);
    if (!exists) {
      this.ledger.unshift(entry);
      this.persist('ledger', this.ledger);
      idb.put('payments', entry).catch(() => {});
    }
  }

  public acknowledgePayment(entryId: string, workerId: string): boolean {
    this.initSync();
    const entry = this.ledger.find((l) => l.id === entryId && l.workerId === workerId);
    if (entry) {
      entry.acknowledgmentStatus = 'acknowledged_by_worker';
      entry.acknowledgedAt = new Date().toISOString();
      entry.acknowledgedByWorkerId = workerId;
      this.persist('ledger', this.ledger);
      idb.put('payments', entry).catch(() => {});
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // Disputes & Grievance API
  // --------------------------------------------------------------------------
  public getGrievances(workerId?: string): DisputeGrievance[] {
    this.initSync();
    if (workerId) {
      return this.grievances.filter((g) => g.workerId === workerId);
    }
    return [...this.grievances];
  }

  public addGrievance(grievance: DisputeGrievance): void {
    this.initSync();
    this.grievances.unshift(grievance);
    this.persist('grievances', this.grievances);
    idb.put('disputes', grievance).catch(() => {});
  }

  public addContractorResponse(grievanceId: string, responseText: string): boolean {
    this.initSync();
    const g = this.grievances.find((item) => item.id === grievanceId);
    if (g) {
      g.contractorResponse = responseText;
      g.contractorResponseDate = new Date().toISOString().split('T')[0];
      if (g.status === 'submitted') {
        g.status = 'under_inquiry';
      }
      this.persist('grievances', this.grievances);
      idb.put('disputes', g).catch(() => {});
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // Cryptographic Audit Events API
  // --------------------------------------------------------------------------
  public getAuditEvents(): AuditEvent[] {
    this.initSync();
    return [...this.auditEvents];
  }

  public async recordAuditEvent(
    entityType: AuditEvent['entityType'],
    entityId: string,
    action: AuditEvent['action'],
    actorRole: AuditEvent['actorRole'],
    actorId: string,
    payloadData: Record<string, any>
  ): Promise<AuditEvent> {
    this.initSync();
    const prev = this.auditEvents[this.auditEvents.length - 1];
    const prevHash = prev ? prev.hash : GENESIS_HASH;
    const seq = (prev?.sequenceNumber || 0) + 1;

    const event = await createAuditEvent(entityType, entityId, action, actorRole, actorId, payloadData, prevHash, seq);
    this.auditEvents.push(event);
    idb.put('audit_events', event).catch(() => {});
    return event;
  }

  // Controlled test bench audit tampering scenarios
  public tamperAuditEvent(index: number, fakeField: string = 'hacked_amount'): void {
    if (this.auditEvents[index]) {
      this.auditEvents[index] = {
        ...this.auditEvents[index],
        canonicalPayload: this.auditEvents[index].canonicalPayload.replace('}', `,"tampered":"${fakeField}"}`),
      };
    }
  }

  public breakAuditLinkage(index: number): void {
    if (this.auditEvents[index]) {
      this.auditEvents[index] = {
        ...this.auditEvents[index],
        previousHash: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      };
    }
  }

  public restoreAuditBaseline(): void {
    this.auditEvents = [...INITIAL_AUDIT_EVENTS];
  }

  // --------------------------------------------------------------------------
  // Approval Requests API (Cross-Device Worker Approval Workflow)
  // --------------------------------------------------------------------------
  public getApprovalRequests(workerId?: string, contractorId?: string): ApprovalRequest[] {
    this.initSync();
    if (workerId) {
      return this.approvalRequests.filter((r) => r.workerId === workerId);
    }
    if (contractorId) {
      return this.approvalRequests.filter((r) => r.contractorId === contractorId);
    }
    return [...this.approvalRequests];
  }

  public addApprovalRequest(req: ApprovalRequest): void {
    this.initSync();
    this.approvalRequests.unshift(req);
    this.persist('approval_requests', this.approvalRequests);

    // Cryptographic audit log for issued request
    this.recordAuditEvent(
      'approval',
      req.id,
      'created',
      'contractor',
      req.contractorId,
      {
        actionType: req.actionType,
        workerId: req.workerId,
        shiftDate: req.shiftDate,
        agreedWage: req.agreedWage,
      }
    ).catch(() => {});
  }

  public updateApprovalRequestStatus(
    requestId: string,
    status: ApprovalRequest['status'],
    responseNotes?: string
  ): ApprovalRequest | null {
    this.initSync();
    const req = this.approvalRequests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = status;
    req.respondedAt = new Date().toISOString();
    if (responseNotes) {
      req.workerResponseNotes = responseNotes;
    }

    this.persist('approval_requests', this.approvalRequests);

    // Cryptographic audit event for resolution
    const auditAction = status === 'approved' ? 'acknowledged' : status === 'rejected' ? 'disputed' : 'modified';
    this.recordAuditEvent(
      'approval',
      req.id,
      auditAction,
      'worker',
      req.workerId,
      {
        status,
        responseNotes: responseNotes || '',
        actionType: req.actionType,
      }
    ).catch(() => {});

    // If shift attendance confirmation was approved, automatically instantiate verified AttendanceRecord
    if (status === 'approved' && req.actionType === 'attendance_confirmation') {
      const shiftDate = req.shiftDate || new Date().toISOString().split('T')[0];
      const agreedWage = req.agreedWage || req.amount || 550;
      const shiftType = req.shiftType || 'full_day';
      const hours = req.hours || 8;

      const recordId = `ATT-${shiftDate}-${req.workerId.slice(-4)}-${Date.now().toString().slice(-4)}`;
      const attendanceRecord: AttendanceRecord = {
        id: recordId,
        workerId: req.workerId,
        workerName: req.workerName || 'Registered Worker',
        siteId: 'SITE-IND-METRO-01',
        siteName: req.siteName || 'Indore Construction Site',
        date: shiftDate,
        timeIn: '08:00:00',
        timeOut: '17:00:00',
        shiftType,
        baseHours: Math.min(hours, 8),
        overtimeHours: Math.max(0, hours - 8),
        calculatedWage: agreedWage,
        status: 'present',
        supervisorName: req.contractorName,
        verificationHash: `VERIFIED_APPROVAL_${req.id}`,
        geoVerified: true,
        notes: `Cross-device verified via worker QR approval (Req: ${req.id})`,
      };

      this.addAttendance(attendanceRecord);
    }

    return req;
  }

  // --------------------------------------------------------------------------
  // Worker Statistics & Authoritative Breakdown
  // --------------------------------------------------------------------------
  public getWorkerStats(workerId: string): WageBreakdown {
    const attendance = this.getAttendance(workerId);
    const ledger = this.getLedger(workerId);
    const disputes = this.getGrievances(workerId);

    // Call the single authoritative calculation engine
    return calculateRecordBreakdown(attendance, ledger, disputes);
  }

  // --------------------------------------------------------------------------
  // Safe Reset & Demo Data Isolation
  // --------------------------------------------------------------------------
  /**
   * Resets ONLY the demo dataset. Real user records are strictly preserved!
   */
  public resetDemoDataOnly(): void {
    this.initSync();

    // Preserve non-demo records
    const userWorkers = this.workers.filter((w) => !w.isDemoRecord);
    const userAttendance = this.attendance.filter((a) => !a.isDemoRecord);
    const userLedger = this.ledger.filter((l) => !l.isDemoRecord);
    const userGrievances = this.grievances.filter((g) => !g.isDemoRecord);

    this.workers = [...INITIAL_WORKERS, ...userWorkers];
    this.sites = INITIAL_SITES;
    this.attendance = [...INITIAL_ATTENDANCE, ...userAttendance];
    this.ledger = [...INITIAL_LEDGER, ...userLedger];
    this.grievances = [...INITIAL_GRIEVANCES, ...userGrievances];
    this.auditEvents = [...INITIAL_AUDIT_EVENTS];

    this.persistAll();
  }

  /**
   * Factory reset (requires explicit confirmation).
   */
  public resetToDefault(): void {
    this.workers = [...INITIAL_WORKERS];
    this.sites = [...INITIAL_SITES];
    this.attendance = [...INITIAL_ATTENDANCE];
    this.ledger = [...INITIAL_LEDGER];
    this.grievances = [...INITIAL_GRIEVANCES];
    this.auditEvents = [...INITIAL_AUDIT_EVENTS];
    this.persistAll();
  }

  private persist(key: string, data: any): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(`shramsetu_${key}`, JSON.stringify(data));
      } catch {
        // quota exceeded or private mode
      }
    }
  }

  private persistAll(): void {
    this.persist('workers', this.workers);
    this.persist('sites', this.sites);
    this.persist('attendance', this.attendance);
    this.persist('ledger', this.ledger);
    this.persist('grievances', this.grievances);
    this.persist('approval_requests', this.approvalRequests);
  }

  // --------------------------------------------------------------------------
  // Versioned Backup Export & Import
  // --------------------------------------------------------------------------
  public exportBackup(): string {
    const backup = {
      schemaVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      platform: 'Shram Setu 2.0',
      workers: this.getWorkers(),
      sites: this.getSites(),
      attendance: this.getAttendance(),
      ledger: this.getLedger(),
      grievances: this.getGrievances(),
      auditEvents: this.getAuditEvents(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      if (Array.isArray(data.workers)) this.workers = data.workers;
      if (Array.isArray(data.sites)) this.sites = data.sites;
      if (Array.isArray(data.attendance)) this.attendance = data.attendance;
      if (Array.isArray(data.ledger)) this.ledger = data.ledger;
      if (Array.isArray(data.grievances)) this.grievances = data.grievances;
      if (Array.isArray(data.auditEvents)) this.auditEvents = data.auditEvents;

      this.persistAll();
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new ShramSetuDB();
