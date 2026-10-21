export type SkillLevel = 'unskilled' | 'semi_skilled' | 'skilled' | 'highly_skilled';

export interface Worker {
  id: string;
  name: string;
  hindiName: string;
  phone: string;
  trade: string; // e.g. 'Rajmistri (Mason)', 'Beldar (Helper)', 'Painter', 'Bar Bender', 'Electrician'
  skillLevel: SkillLevel;
  dailyBaseWage: number; // in INR
  eShramUAN: string; // 12-digit UAN
  bocwRegistrationNo: string; // MP BOCW registration ID
  aadhaarLast4: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  photoUrl: string;
  joinedDate: string;
  activeSiteId: string;
  bankAccountLast4?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface ConstructionSite {
  id: string;
  name: string;
  hindiName: string;
  location: string;
  city: string;
  contractorName: string;
  contractorPhone: string;
  projectType: string; // 'Metro Rail', 'Commercial Complex', 'Road & Flyover', 'Residential'
  coordinates: {
    lat: number;
    lng: number;
  };
  activeWorkers: number;
  safetyRating: string;
}

export type ShiftType = 'full_day' | 'half_day' | 'overtime_2h' | 'overtime_4h';

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  siteId: string;
  siteName: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:mm:ss
  timeOut: string; // HH:mm:ss or null
  shiftType: ShiftType;
  baseHours: number;
  overtimeHours: number;
  calculatedWage: number;
  status: 'present' | 'half_day' | 'overtime';
  supervisorName: string;
  verificationHash: string; // cryptographic proof representation
  geoVerified: boolean;
  notes?: string;
}

export type PaymentType = 'daily_credit' | 'advance_kharcha' | 'weekly_settlement' | 'bonus' | 'penalty_adjustment';
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer';

export interface WageLedgerEntry {
  id: string;
  workerId: string;
  date: string;
  type: PaymentType;
  amount: number;
  description: string;
  hindiDescription: string;
  paymentMode: PaymentMode;
  status: 'settled' | 'pending';
  utrOrReceiptNo?: string;
  siteId: string;
  siteName: string;
  contractorName: string;
}

export interface DisputeGrievance {
  id: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  contractorName: string;
  contractorPhone: string;
  siteName: string;
  disputeType: 'unpaid_wages' | 'arbitrary_deduction' | 'denied_overtime' | 'unsafe_conditions' | 'bocw_benefit_denial';
  claimedAmount: number;
  incidentDate: string;
  filingDate: string;
  status: 'submitted' | 'under_inquiry' | 'notice_issued' | 'settled';
  description: string;
  dloFilingRef: string; // e.g. DLO-INDORE-2026-XXXX
  evidenceMusterCount: number;
}

export interface WelfareScheme {
  id: string;
  title: string;
  hindiTitle: string;
  organization: string;
  benefitAmount: string;
  eligibility: string;
  hindiEligibility: string;
  category: 'insurance' | 'pension' | 'education' | 'tool_kit' | 'maternity';
  linkUrl: string;
}
