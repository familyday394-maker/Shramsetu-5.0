import { Worker, ConstructionSite, AttendanceRecord, WageLedgerEntry, DisputeGrievance, WelfareScheme } from '../types';

const DB_NAME = 'ShramSetu_DB_v2';
const DB_VERSION = 1;

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
    location: 'Khajrana Square, Ring Road, Indore',
    city: 'Indore, MP',
    contractorName: 'MP PWD Bridge Division',
    contractorPhone: '+91 731 2541092',
    projectType: 'Road & Flyover',
    coordinates: { lat: 22.7244, lng: 75.9082 },
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
    timeIn: '08:15:22',
    timeOut: '17:30:10',
    shiftType: 'full_day',
    baseHours: 8,
    overtimeHours: 0,
    calculatedWage: 550,
    status: 'present',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'SHA256:8f4c2e91a0d3bf49ec227184',
    geoVerified: true,
    notes: 'Pillar reinforcement masonry work on pier P-42.',
  },
  {
    id: 'ATT-2026-10-17-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-17',
    timeIn: '08:00:15',
    timeOut: '19:45:00',
    shiftType: 'overtime_2h',
    baseHours: 8,
    overtimeHours: 2,
    calculatedWage: 688, // 550 + (550/8 * 2) = 687.5
    status: 'overtime',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'SHA256:7102de92b8aa10398f5c317a',
    geoVerified: true,
    notes: 'Extended night deck concrete pouring.',
  },
  {
    id: 'ATT-2026-10-16-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-16',
    timeIn: '08:10:04',
    timeOut: '17:05:40',
    shiftType: 'full_day',
    baseHours: 8,
    overtimeHours: 0,
    calculatedWage: 550,
    status: 'present',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'SHA256:3d9021fa44bc819920aa912e',
    geoVerified: true,
  },
  {
    id: 'ATT-2026-10-15-001',
    workerId: 'WKR-MP-001',
    workerName: 'Rameshwar Lal Ahirwar',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    date: '2026-10-15',
    timeIn: '08:05:11',
    timeOut: '13:00:00',
    shiftType: 'half_day',
    baseHours: 4,
    overtimeHours: 0,
    calculatedWage: 275,
    status: 'half_day',
    supervisorName: 'Anil Sisodiya (JE)',
    verificationHash: 'SHA256:550bca8199341fae01928374',
    geoVerified: true,
    notes: 'Afternoon permit leave for health checkup.',
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
    verificationHash: 'SHA256:c099318fa82bde7718920194',
    geoVerified: true,
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
    verificationHash: 'SHA256:7b8893d19fca901289417721',
    geoVerified: true,
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
    calculatedWage: 725, // 580 + (580/8 * 2) = 725
    status: 'overtime',
    supervisorName: 'R.K. Patel',
    verificationHash: 'SHA256:1a82fca90123984019284910',
    geoVerified: true,
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
    utrOrReceiptNo: 'SBIN881920384102',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
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
    utrOrReceiptNo: 'SBIN771920381903',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
  },
  {
    id: 'LDG-003',
    workerId: 'WKR-MP-001',
    date: '2026-10-16',
    type: 'advance_kharcha',
    amount: -500,
    description: 'Mid-week household ration advance (खर्चा)',
    hindiDescription: 'साप्ताहिक पारिवारिक राशन अग्रिम खर्चा भुगतान',
    paymentMode: 'upi',
    status: 'settled',
    utrOrReceiptNo: 'UPI-NARMADA-550192',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
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
    utrOrReceiptNo: 'SBIN661920381001',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
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
    utrOrReceiptNo: 'SBIN551920380992',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
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
    utrOrReceiptNo: 'BKID99102830192',
    siteId: 'SITE-IND-METRO-01',
    siteName: 'Indore Metro Line 3 Viaduct Package',
    contractorName: 'Narmada Infra Ltd.',
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
    dloFilingRef: 'DLO-IND-WAGE-2026/0419',
    evidenceMusterCount: 10,
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

class SafeStorage {
  private memoryStore = new Map<string, string>();

  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.memoryStore.get(key) || null;
      }
    }
    return this.memoryStore.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        this.memoryStore.set(key, value);
      }
    } else {
      this.memoryStore.set(key, value);
    }
  }

  removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        this.memoryStore.delete(key);
      }
    } else {
      this.memoryStore.delete(key);
    }
  }
}

const storage = new SafeStorage();

// Database API
class ShramSetuDB {
  private workersKey = 'shramsetu_workers';
  private sitesKey = 'shramsetu_sites';
  private attendanceKey = 'shramsetu_attendance';
  private ledgerKey = 'shramsetu_ledger';
  private grievancesKey = 'shramsetu_grievances';

  constructor() {
    this.init();
  }

  private init() {
    const rawWorkers = storage.getItem(this.workersKey);
    if (!rawWorkers) {
      storage.setItem(this.workersKey, JSON.stringify(INITIAL_WORKERS));
    } else if (rawWorkers.includes('/src/assets/images/')) {
      // Migrate old /src/... URLs to production /assets/... URLs
      const migrated = rawWorkers.replaceAll('/src/assets/images/', '/assets/images/');
      storage.setItem(this.workersKey, migrated);
    }

    if (!storage.getItem(this.sitesKey)) {
      storage.setItem(this.sitesKey, JSON.stringify(INITIAL_SITES));
    }
    if (!storage.getItem(this.attendanceKey)) {
      storage.setItem(this.attendanceKey, JSON.stringify(INITIAL_ATTENDANCE));
    }
    if (!storage.getItem(this.ledgerKey)) {
      storage.setItem(this.ledgerKey, JSON.stringify(INITIAL_LEDGER));
    }
    if (!storage.getItem(this.grievancesKey)) {
      storage.setItem(this.grievancesKey, JSON.stringify(INITIAL_GRIEVANCES));
    }
  }

  public getWorkers(): Worker[] {
    try {
      const data = storage.getItem(this.workersKey);
      const list: Worker[] = data ? JSON.parse(data) : INITIAL_WORKERS;
      // Normalize photoUrl so all devices and production builds reliably find assets
      return list.map((w) => ({
        ...w,
        photoUrl: (w.photoUrl || '/assets/images/shram_setu_hero_pass_1792385013356.jpg')
          .replace('/src/assets/images/', '/assets/images/'),
      }));
    } catch {
      return INITIAL_WORKERS;
    }
  }

  public getWorker(id: string): Worker | undefined {
    return this.getWorkers().find((w) => w.id === id);
  }

  public addWorker(worker: Worker): void {
    const list = this.getWorkers();
    list.unshift(worker);
    storage.setItem(this.workersKey, JSON.stringify(list));
  }

  public getSites(): ConstructionSite[] {
    try {
      const data = storage.getItem(this.sitesKey);
      return data ? JSON.parse(data) : INITIAL_SITES;
    } catch {
      return INITIAL_SITES;
    }
  }

  public getAttendance(workerId?: string): AttendanceRecord[] {
    try {
      const data = storage.getItem(this.attendanceKey);
      const list: AttendanceRecord[] = data ? JSON.parse(data) : INITIAL_ATTENDANCE;
      if (workerId) {
        return list.filter((a) => a.workerId === workerId);
      }
      return list;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  }

  public addAttendance(record: AttendanceRecord): void {
    const list = this.getAttendance();
    list.unshift(record);
    storage.setItem(this.attendanceKey, JSON.stringify(list));

    // Also auto-record into wage ledger
    const ledgerEntry: WageLedgerEntry = {
      id: `LDG-${Date.now()}`,
      workerId: record.workerId,
      date: record.date,
      type: 'daily_credit',
      amount: record.calculatedWage,
      description: `Daily attendance credit - ${record.shiftType.replace('_', ' ')} (${record.siteName})`,
      hindiDescription: `दैनिक हाजिरी मजदूरी - ${record.shiftType === 'half_day' ? 'आधा दिन' : record.shiftType.includes('overtime') ? 'ओवरटाइम सहित' : 'पूर्ण दिवस'}`,
      paymentMode: 'bank_transfer',
      status: 'settled',
      utrOrReceiptNo: `SETU-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      siteId: record.siteId,
      siteName: record.siteName,
      contractorName: 'Verified On-Site Supervisor',
    };
    this.addLedgerEntry(ledgerEntry);
  }

  public getLedger(workerId?: string): WageLedgerEntry[] {
    try {
      const data = storage.getItem(this.ledgerKey);
      const list: WageLedgerEntry[] = data ? JSON.parse(data) : INITIAL_LEDGER;
      if (workerId) {
        return list.filter((l) => l.workerId === workerId);
      }
      return list;
    } catch {
      return INITIAL_LEDGER;
    }
  }

  public addLedgerEntry(entry: WageLedgerEntry): void {
    const list = this.getLedger();
    list.unshift(entry);
    storage.setItem(this.ledgerKey, JSON.stringify(list));
  }

  public getGrievances(workerId?: string): DisputeGrievance[] {
    try {
      const data = storage.getItem(this.grievancesKey);
      const list: DisputeGrievance[] = data ? JSON.parse(data) : INITIAL_GRIEVANCES;
      if (workerId) {
        return list.filter((g) => g.workerId === workerId);
      }
      return list;
    } catch {
      return INITIAL_GRIEVANCES;
    }
  }

  public addGrievance(grievance: DisputeGrievance): void {
    const list = this.getGrievances();
    list.unshift(grievance);
    storage.setItem(this.grievancesKey, JSON.stringify(list));
  }

  public getWorkerStats(workerId: string) {
    const attendance = this.getAttendance(workerId);
    const ledger = this.getLedger(workerId);

    const totalDaysWorked = attendance.filter((a) => a.status === 'present' || a.status === 'overtime').length;
    const totalHalfDays = attendance.filter((a) => a.status === 'half_day').length;
    const totalOvertimeHours = attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

    const totalEarned = ledger
      .filter((l) => l.amount > 0)
      .reduce((sum, l) => sum + l.amount, 0);

    const totalAdvancesTaken = Math.abs(
      ledger
        .filter((l) => l.amount < 0)
        .reduce((sum, l) => sum + l.amount, 0)
    );

    const netBalanceDue = totalEarned - totalAdvancesTaken;

    return {
      totalDaysWorked,
      totalHalfDays,
      totalOvertimeHours,
      totalEarned,
      totalAdvancesTaken,
      netBalanceDue,
    };
  }

  public resetToDefault(): void {
    storage.setItem(this.workersKey, JSON.stringify(INITIAL_WORKERS));
    storage.setItem(this.sitesKey, JSON.stringify(INITIAL_SITES));
    storage.setItem(this.attendanceKey, JSON.stringify(INITIAL_ATTENDANCE));
    storage.setItem(this.ledgerKey, JSON.stringify(INITIAL_LEDGER));
    storage.setItem(this.grievancesKey, JSON.stringify(INITIAL_GRIEVANCES));
  }

  public exportBackup(): string {
    const backup = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      workers: this.getWorkers(),
      sites: this.getSites(),
      attendance: this.getAttendance(),
      ledger: this.getLedger(),
      grievances: this.getGrievances(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.workers) storage.setItem(this.workersKey, JSON.stringify(data.workers));
      if (data.sites) storage.setItem(this.sitesKey, JSON.stringify(data.sites));
      if (data.attendance) storage.setItem(this.attendanceKey, JSON.stringify(data.attendance));
      if (data.ledger) storage.setItem(this.ledgerKey, JSON.stringify(data.ledger));
      if (data.grievances) storage.setItem(this.grievancesKey, JSON.stringify(data.grievances));
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new ShramSetuDB();
