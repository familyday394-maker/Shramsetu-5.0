/**
 * Shram Setu 2.0 - Core Domain Models & Types
 * Unified schema for local IndexedDB, wage calculation, cryptographic audit, and Supabase readiness.
 */

export type SkillLevel = 'unskilled' | 'semi_skilled' | 'skilled' | 'highly_skilled';

export interface Worker {
  id: string;
  name: string;
  hindiName: string;
  phone: string;
  trade: string; // e.g. 'Head Mason (मुख्य राजमिस्त्री)', 'Steel Binder'
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
  isDemoRecord?: boolean;
}

export interface ConstructionSite {
  id: string;
  name: string;
  hindiName: string;
  location: string;
  city: string;
  contractorName: string;
  contractorPhone: string;
  projectType: string;
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
  timeOut: string; // HH:mm:ss
  shiftType: ShiftType;
  baseHours: number;
  overtimeHours: number;
  calculatedWage: number; // in INR
  calculatedWagePaise?: number; // in paise
  status: 'present' | 'half_day' | 'overtime';
  supervisorName: string;
  verificationHash: string; // Cryptographic hash
  previousHash?: string;
  geoVerified: boolean;
  notes?: string;
  isDemoRecord?: boolean;
}

export type PaymentType = 'daily_credit' | 'advance_kharcha' | 'weekly_settlement' | 'bonus' | 'penalty_adjustment' | 'deduction';
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer';
export type PaymentAcknowledgmentStatus = 
  | 'unpaid'
  | 'partially_paid'
  | 'recorded_by_contractor'
  | 'acknowledged_by_worker'
  | 'disputed';

export interface WageLedgerEntry {
  id: string;
  workerId: string;
  date: string;
  type: PaymentType;
  amount: number; // In INR: positive for earnings/credits, negative for deductions/advances/payouts
  amountPaise?: number; // In integer paise for exact accounting
  description: string;
  hindiDescription: string;
  paymentMode: PaymentMode;
  status: 'settled' | 'pending';
  acknowledgmentStatus: PaymentAcknowledgmentStatus;
  acknowledgedAt?: string;
  acknowledgedByWorkerId?: string;
  utrOrReceiptNo?: string;
  siteId: string;
  siteName: string;
  contractorName: string;
  isDemoRecord?: boolean;
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
  description: string; // Worker's statement
  contractorResponse?: string; // Preserved contractor statement
  contractorResponseDate?: string;
  dloFilingRef: string;
  evidenceMusterCount: number;
  isDemoRecord?: boolean;
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

// Cryptographic Audit Event Structure
export interface AuditEvent {
  id: string;
  sequenceNumber: number;
  entityType: 'work_record' | 'payment' | 'correction' | 'dispute' | 'approval';
  entityId: string;
  action: 'created' | 'modified' | 'acknowledged' | 'disputed' | 'resolved';
  actorRole: 'worker' | 'contractor' | 'auditor' | 'system';
  actorId: string;
  timestamp: string;
  canonicalPayload: string;
  previousHash: string;
  hash: string;
}

export type AuditVerificationOutcome =
  | 'INTEGRITY_PASSED'
  | 'RECORD_MODIFIED'
  | 'CHAIN_LINKAGE_BROKEN'
  | 'VERIFICATION_INCOMPLETE';

export interface AuditVerificationResult {
  outcome: AuditVerificationOutcome;
  totalEventsChecked: number;
  failedEventIndex?: number;
  failedEventId?: string;
  expectedHash?: string;
  actualHash?: string;
  details: string;
}

// Anomaly Detection Rule Findings
export interface AnomalyAlert {
  ruleId: 'RULE-01' | 'RULE-02' | 'RULE-03' | 'RULE-04' | 'RULE-05' | 'RULE-06' | 'RULE-07';
  ruleName: string;
  severity: 'warning' | 'info';
  recordId?: string;
  valuesExamined: Record<string, any>;
  triggerCondition: string;
  explanation: string;
  suggestedAction: string;
}

// Authoritative Wage Breakdown Structure
export interface WageBreakdown {
  grossWagesEarnedPaise: number;
  additionsAllowancesPaise: number;
  itemizedDeductionsPaise: number;
  netWagesDuePaise: number;
  paymentsRecordedPaise: number;
  paymentsAcknowledgedPaise: number;
  outstandingBalancePaise: number;
  overpaymentPaise: number;
  disputedAmountsPaise: number;
  // Expressed in INR
  grossWagesEarned: number;
  netWagesDue: number;
  paymentsRecorded: number;
  paymentsAcknowledged: number;
  outstandingBalance: number;
  overpayment: number;
  isOverpaid: boolean;
  disputedAmounts: number;
  // Summary counts
  totalDaysWorked: number;
  totalHalfDays: number;
  totalOvertimeHours: number;
}

// QR Reference Structure (Zero PII, Opaque Reference)
export interface SecureQRReference {
  version: '2.0';
  refToken: string; // Opaque unguessable token
  workerId: string;
  publicName: string;
  trade: string;
  verifyUrl: string;
}

// User Role & Authentication Models
export type UserRole = 'worker' | 'contractor' | 'public_visitor';

export type ContactVerificationStatus =
  | 'number_supplied'
  | 'shared_with_counterpart'
  | 'manual_check_pending'
  | 'manual_check_completed'
  | 'disputed_or_review';

export interface ManualContactCheckRecord {
  id: string;
  targetUserId: string;
  targetPhone: string;
  checkedByUserId: string;
  checkedByName: string;
  checkedByRole: 'worker' | 'contractor';
  checkedAt: string;
  outcome: 'confirmed_match' | 'details_mismatch' | 'unreachable' | 'reported_suspicious';
  notes: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  phone: string;
  fullName: string;
  role: 'worker' | 'contractor';
  trade?: string;
  organizationName?: string;
  contactVerificationStatus: ContactVerificationStatus;
  manualChecks: ManualContactCheckRecord[];
  consentToShareContact: boolean;
  privacyAccepted: boolean;
  qrReferenceToken: string; // Opaque unguessable token
  assignedWorkerIds?: string[];
  contractorId?: string;
  createdAt: string;
  isJudgeDemo?: boolean;
}

// Approval Request for Cross-Device / Multi-User workflows
export interface ApprovalRequest {
  id: string;
  workerId: string;
  workerName?: string;
  workerReferenceToken: string;
  contractorId: string;
  contractorName: string;
  contractorPhone: string;
  siteName: string;
  actionType: 'attendance_confirmation' | 'wage_payment_acknowledgment' | 'site_joining';
  recordId: string;
  amount?: number;
  shiftDate?: string;
  shiftType?: ShiftType;
  hours?: number;
  agreedWage?: number;
  notes?: string;
  workerResponseNotes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported_suspicious';
  createdAt: string;
  respondedAt?: string;
}
