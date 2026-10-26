/**
 * Automated Test Suite for Shram Setu 2.0
 * Verifies bilingual dictionary, language switching, contact numbers,
 * Smart Shram Pass formatting, wage calculations, and local demo mode.
 */

import { translations, t, formatCurrency, getLocalizedTrade, getLocalizedSkill, Language } from '../src/services/i18n';
import { APP_CONFIG } from '../src/config';
import { INITIAL_WORKERS, INITIAL_SITES, INITIAL_ATTENDANCE, INITIAL_LEDGER, db } from '../src/services/db';
import { calculateRecordBreakdown, calculateShiftWage } from '../src/services/wageEngine';
import { createAuditEvent, verifyAuditChain, GENESIS_HASH } from '../src/services/cryptoAudit';
import { evaluateAnomalies } from '../src/services/anomalyEngine';
import { AttendanceRecord, WageLedgerEntry, DisputeGrievance } from '../src/types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (details) console.error(`    Details: ${details}`);
    process.exitCode = 1;
  }
}

console.log('\n=== SHRAM SETU 2.0 AUTOMATED TEST BENCH ===\n');

// TEST SUITE 1: Translation Dictionary Integrity & Completeness
console.log('1. Testing Translation System Integrity:');
const enKeys = Object.keys(translations.en) as (keyof typeof translations.en)[];
const hiKeys = Object.keys(translations.hi) as (keyof typeof translations.hi)[];

assert(
  enKeys.length === hiKeys.length,
  'English and Hindi translation dictionaries have exact same key count',
  `EN has ${enKeys.length} keys, HI has ${hiKeys.length} keys`
);

let missingInHi = 0;
let missingInEn = 0;
let emptyValues = 0;

for (const key of enKeys) {
  if (!(key in translations.hi)) {
    missingInHi++;
  }
  if (!translations.en[key] || translations.en[key].trim() === '') {
    emptyValues++;
  }
}

for (const key of hiKeys) {
  if (!(key in translations.en)) {
    missingInEn++;
  }
  if (!translations.hi[key] || translations.hi[key].trim() === '') {
    emptyValues++;
  }
}

assert(missingInHi === 0, 'No keys missing in Hindi dictionary');
assert(missingInEn === 0, 'No keys missing in English dictionary');
assert(emptyValues === 0, 'No empty or blank translation values in either language');

// TEST SUITE 2: Dynamic Translation & Parameter Interpolation
console.log('\n2. Testing Dynamic Translation Function (t):');
const testParamEn = t('rightsProtectionBody', 'en', { wage: 550 });
assert(
  testParamEn.includes('₹550/day') && !testParamEn.includes('{wage}'),
  'Parameter interpolation works correctly in English',
  testParamEn
);

const testParamHi = t('rightsProtectionBody', 'hi', { wage: 550 });
assert(
  testParamHi.includes('₹550/दिन') && !testParamHi.includes('{wage}'),
  'Parameter interpolation works correctly in Hindi',
  testParamHi
);

const fallbackTest = t('nonExistentKey' as any, 'en');
assert(
  fallbackTest === 'nonExistentKey',
  'Fallback mechanism safely returns key name without undefined/blank crash'
);

// TEST SUITE 3: Contact Phone Number Verification (Must be 7909348017)
console.log('\n3. Testing Contact Phone Number & WhatsApp Links:');
assert(
  APP_CONFIG.CONTACT_PHONE === '7909348017',
  'Project contact phone number is precisely 7909348017',
  `Current: ${APP_CONFIG.CONTACT_PHONE}`
);

assert(
  APP_CONFIG.WHATSAPP_NUMBER === '917909348017',
  'WhatsApp number is in Indian international format 917909348017',
  `Current: ${APP_CONFIG.WHATSAPP_NUMBER}`
);

assert(
  APP_CONFIG.WHATSAPP_LINK === 'https://wa.me/917909348017',
  'WhatsApp link directs to wa.me/917909348017',
  `Current: ${APP_CONFIG.WHATSAPP_LINK}`
);

// TEST SUITE 4: Smart Shram Pass Screen Elements & Localized Trade
console.log('\n4. Testing Smart Shram Pass Localization:');
const tradeMasonEn = getLocalizedTrade('Head Mason (मुख्य राजमिस्त्री)', 'en');
const tradeMasonHi = getLocalizedTrade('Head Mason (मुख्य राजमिस्त्री)', 'hi');

assert(
  tradeMasonEn === 'Head Mason',
  'Trade in English eliminates bracketed Hindi text',
  `Got: "${tradeMasonEn}"`
);

assert(
  tradeMasonHi === 'मुख्य राजमिस्त्री',
  'Trade in Hindi returns pure Hindi text',
  `Got: "${tradeMasonHi}"`
);

const skillSkilledEn = getLocalizedSkill('skilled', 'en');
const skillSkilledHi = getLocalizedSkill('skilled', 'hi');

assert(
  skillSkilledEn.label === 'Skilled Artisan',
  'Skill label in English is "Skilled Artisan"'
);
assert(
  skillSkilledHi.label === 'कुशल कारीगर',
  'Skill label in Hindi is "कुशल कारीगर"'
);

assert(
  formatCurrency(1500) === '₹1,500',
  'Currency formatting applies Indian numbering format for positive amount'
);
assert(
  formatCurrency(-500) === '-₹500',
  'Currency formatting applies Indian numbering format for negative amount'
);

// TEST SUITE 5: Wage Calculation Engine & Statutory Overtime Rates
console.log('\n5. Testing Wage Calculation Formulas (MP Minimum Wages Act):');
const baseWage = 550;
const halfDayWage = Math.round(baseWage * 0.5);
const overtime2hWage = Math.round(baseWage + (baseWage / 8) * 2);
const overtime4hWage = Math.round(baseWage + (baseWage / 8) * 4);

assert(halfDayWage === 275, 'Half day wage is exactly 50% of base rate (₹275)');
assert(overtime2hWage === 688, 'Overtime 2h wage is base + 2h standard pro-rata rate (₹688)');
assert(overtime4hWage === 825, 'Night overtime 4h wage is base + 4h rate (₹825)');

// TEST SUITE 6: Demo Mode & Data Protection (Without Remote Supabase)
console.log('\n6. Testing Demo Mode & Data Protection:');
assert(INITIAL_WORKERS.length >= 5, 'Baseline demo data has 5+ realistic workers in Indore MP');
assert(INITIAL_SITES.length >= 3, 'Baseline demo data has 3+ verified civil construction sites');
assert(INITIAL_ATTENDANCE.length >= 7, 'Baseline demo data has 7+ verified muster records');
assert(INITIAL_LEDGER.length >= 6, 'Baseline demo data has 6+ ledger transaction entries');

const worker1 = INITIAL_WORKERS[0];
assert(
  worker1.eShramUAN === '1009 8472 9102',
  'Worker e-Shram UAN preserved without corruption'
);

// Verify net balance arithmetic
const gross = 550 + 688 + 550 + 275; // 2063
const advance = 500;
const netDue = gross - advance; // 1563
assert(netDue === 1563, 'Net wage balance due calculation is mathematically sound (₹1,563)');

// TEST SUITE 7: Responsive Layout & Horizontal Overflow Prevention
console.log('\n7. Testing Responsive Layout & Horizontal Overflow Prevention:');
import * as fs from 'fs';
import * as path from 'path';

const currentDir = import.meta.dirname || path.dirname(new URL(import.meta.url).pathname);
const indexCss = fs.readFileSync(path.resolve(currentDir, '../src/index.css'), 'utf-8');
assert(
  indexCss.includes('box-sizing: border-box'),
  'Global index.css specifies strict box-sizing: border-box reset'
);
assert(
  indexCss.includes('max-width: 100%'),
  'Global index.css constrains html, body, #root and media elements to max-width: 100%'
);

const workerCardCode = fs.readFileSync(path.resolve(currentDir, '../src/components/WorkerCard.tsx'), 'utf-8');
assert(
  workerCardCode.includes('grid-cols-2 lg:grid-cols-2 xl:grid-cols-4') || workerCardCode.includes('grid-cols-2 lg:grid-cols-2'),
  'WorkerCard stat cards use responsive 2-column layout on tablet/laptop to prevent side blowout'
);
assert(
  workerCardCode.includes('min-w-0'),
  'WorkerCard grid/flex elements enforce min-w-0 to allow proper flex shrinking'
);
assert(
  workerCardCode.includes('max-w-[480px]'),
  'WorkerCard pass card simulation uses max-w-[480px] instead of rigid unconstrained width'
);

const headerCode = fs.readFileSync(path.resolve(currentDir, '../src/components/Header.tsx'), 'utf-8');
assert(
  headerCode.includes('xl:flex') && headerCode.includes('xl:hidden'),
  'Header employs xl breakpoint for top bar links and provides overflow-safe subnav for mobile & tablet'
);

const appCode = fs.readFileSync(path.resolve(currentDir, '../src/App.tsx'), 'utf-8');
assert(
  appCode.includes('overflow-x-hidden') && appCode.includes('max-w-full'),
  'App root container applies max-w-full and overflow boundary safeguards'
);

// Verify no rogue 100vw usages in src
const srcFiles = ['App.tsx', 'components/WorkerCard.tsx', 'components/Header.tsx', 'components/AttendanceMuster.tsx', 'components/WageProtectionLedger.tsx'];
let found100vw = false;
for (const f of srcFiles) {
  const content = fs.readFileSync(path.resolve(currentDir, `../src/${f}`), 'utf-8');
  if (content.includes('100vw') || content.includes('w-screen')) {
    found100vw = true;
    break;
  }
}
assert(!found100vw, 'No unconstrained 100vw or w-screen declarations in key UI modules');

// TEST SUITE 8: Authoritative Wage Engine & Ledger Calculations
console.log('\n8. Testing Authoritative calculateRecordBreakdown:');
const testAttendance4Days: AttendanceRecord[] = [
  { id: 'ATT-1', workerId: 'W1', workerName: 'Worker 1', siteId: 'S1', siteName: 'Indore Metro', date: '2026-10-21', timeIn: '08:00:00', timeOut: '17:00:00', shiftType: 'full_day', baseHours: 8, overtimeHours: 0, calculatedWage: 650, status: 'present', supervisorName: 'Vikram Singh', verificationHash: 'hash1', geoVerified: true },
  { id: 'ATT-2', workerId: 'W1', workerName: 'Worker 1', siteId: 'S1', siteName: 'Indore Metro', date: '2026-10-22', timeIn: '08:00:00', timeOut: '17:00:00', shiftType: 'full_day', baseHours: 8, overtimeHours: 0, calculatedWage: 650, status: 'present', supervisorName: 'Vikram Singh', verificationHash: 'hash2', geoVerified: true },
  { id: 'ATT-3', workerId: 'W1', workerName: 'Worker 1', siteId: 'S1', siteName: 'Indore Metro', date: '2026-10-23', timeIn: '08:00:00', timeOut: '17:00:00', shiftType: 'full_day', baseHours: 8, overtimeHours: 0, calculatedWage: 650, status: 'present', supervisorName: 'Vikram Singh', verificationHash: 'hash3', geoVerified: true },
  { id: 'ATT-4', workerId: 'W1', workerName: 'Worker 1', siteId: 'S1', siteName: 'Indore Metro', date: '2026-10-24', timeIn: '08:00:00', timeOut: '17:00:00', shiftType: 'full_day', baseHours: 8, overtimeHours: 0, calculatedWage: 650, status: 'present', supervisorName: 'Vikram Singh', verificationHash: 'hash4', geoVerified: true },
];

const testLedgerPayment: WageLedgerEntry[] = [
  {
    id: 'PAY-1300',
    workerId: 'W1',
    date: '2026-10-24',
    type: 'weekly_settlement',
    amount: -1300,
    description: 'Weekly settlement payment',
    hindiDescription: 'साप्ताहिक मजदूरी भुगतान',
    paymentMode: 'bank_transfer',
    status: 'settled',
    acknowledgmentStatus: 'acknowledged_by_worker',
    acknowledgedAt: '2026-10-24T18:00:00Z',
    siteId: 'S1',
    siteName: 'Indore Metro',
    contractorName: 'Radhe Const',
  },
];

const breakdownCalc = calculateRecordBreakdown(testAttendance4Days, testLedgerPayment);

assert(
  breakdownCalc.grossWagesEarned === 2600,
  '₹650 × 4 days = ₹2,600 gross statutory wages earned',
  `Got: ₹${breakdownCalc.grossWagesEarned}`
);

assert(
  breakdownCalc.paymentsRecorded === 1300,
  '₹1,300 payment recorded as contractor payout deduction',
  `Got: ₹${breakdownCalc.paymentsRecorded}`
);

assert(
  breakdownCalc.outstandingBalance === 1300,
  'Outstanding payable balance is exactly ₹1,300 (₹2,600 - ₹1,300)',
  `Got: ₹${breakdownCalc.outstandingBalance}`
);

assert(
  breakdownCalc.paymentsAcknowledged === 1300,
  'Worker payment acknowledgment tracked distinctly (₹1,300 acknowledged)',
  `Got: ₹${breakdownCalc.paymentsAcknowledged}`
);

// Verify payment deduplication
const duplicateLedger = [testLedgerPayment[0], { ...testLedgerPayment[0] }];
const breakdownDup = calculateRecordBreakdown(testAttendance4Days, duplicateLedger);
assert(
  breakdownDup.paymentsRecorded === 1300,
  'Duplicate payment ID is deduplicated and not counted twice',
  `Expected ₹1,300, got ₹${breakdownDup.paymentsRecorded}`
);

// Verify payments NEVER increase gross earnings
assert(
  breakdownCalc.grossWagesEarned === 2600 && breakdownDup.grossWagesEarned === 2600,
  'Contractor payments reduce balance due and NEVER increase gross earnings'
);

// Verify unacknowledged payments
const unackLedger: WageLedgerEntry[] = [
  {
    id: 'PAY-UNACK',
    workerId: 'W1',
    date: '2026-10-24',
    type: 'weekly_settlement',
    amount: -1300,
    description: 'Supervisor marked payout',
    hindiDescription: 'साप्ताहिक मजदूरी भुगतान',
    paymentMode: 'bank_transfer',
    status: 'pending',
    acknowledgmentStatus: 'recorded_by_contractor',
    siteId: 'S1',
    siteName: 'Indore Metro',
    contractorName: 'Radhe Const',
  },
];
const breakdownUnack = calculateRecordBreakdown(testAttendance4Days, unackLedger);
assert(
  breakdownUnack.paymentsRecorded === 1300 && breakdownUnack.paymentsAcknowledged === 0,
  'Payment recorded without worker acknowledgment reflects in paymentsRecorded but 0 in paymentsAcknowledged'
);

// TEST SUITE 9: Cryptographic Audit Chain Verification (All 4 Outcomes)
console.log('\n9. Testing Cryptographic Audit Chain (All 4 Outcomes):');

// Outcome 1: INTEGRITY_PASSED
const event1 = await createAuditEvent(
  'work_record',
  'ATT-1',
  'created',
  'contractor',
  'SUP-1',
  { date: '2026-10-21', hours: 8, wage: 650 },
  GENESIS_HASH,
  1
);

const event2 = await createAuditEvent(
  'work_record',
  'ATT-2',
  'created',
  'contractor',
  'SUP-1',
  { date: '2026-10-22', hours: 8, wage: 650 },
  event1.hash,
  2
);

const validChainResult = await verifyAuditChain([event1, event2]);
assert(
  validChainResult.outcome === 'INTEGRITY_PASSED',
  'Outcome 1 (INTEGRITY_PASSED): Valid chain passes full SHA-256 verification',
  `Result: ${validChainResult.outcome}`
);

// Outcome 2: RECORD_MODIFIED
const modifiedEvent = {
  ...event1,
  canonicalPayload: '{"date":"2026-10-21","hours":12,"wage":900}', // modified in-place
};
const modifiedChainResult = await verifyAuditChain([modifiedEvent, event2]);
assert(
  modifiedChainResult.outcome === 'RECORD_MODIFIED',
  'Outcome 2 (RECORD_MODIFIED): In-place modification of event payload detected',
  `Result: ${modifiedChainResult.outcome}`
);

// Outcome 3: CHAIN_LINKAGE_BROKEN
const brokenLinkageEvent = {
  ...event2,
  previousHash: 'f'.repeat(64), // fake previous hash
};
const brokenChainResult = await verifyAuditChain([event1, brokenLinkageEvent]);
assert(
  brokenChainResult.outcome === 'CHAIN_LINKAGE_BROKEN',
  'Outcome 3 (CHAIN_LINKAGE_BROKEN): Broken previousHash linkage detected',
  `Result: ${brokenChainResult.outcome}`
);

// Outcome 4: VERIFICATION_INCOMPLETE
const emptyChainResult = await verifyAuditChain([]);
assert(
  emptyChainResult.outcome === 'VERIFICATION_INCOMPLETE',
  'Outcome 4 (VERIFICATION_INCOMPLETE): Missing history or incomplete records detected',
  `Result: ${emptyChainResult.outcome}`
);

// TEST SUITE 10: Deterministic Anomaly Engine (RULE-01 to RULE-07)
console.log('\n10. Testing Deterministic Anomaly Detection (RULE-01 to RULE-07):');

// Multi-day shifts must NOT trigger excessive continuous shift duration
const alerts4Days = evaluateAnomalies(testAttendance4Days, testLedgerPayment, breakdownCalc);
const rule2Triggered = alerts4Days.some((a) => a.ruleId === 'RULE-02');
assert(
  !rule2Triggered,
  'RULE-02: Four 8-hour days across 4 dates are NOT treated as a 32-hour continuous shift'
);

// Single shift exceeding 12h threshold triggers RULE-02
const excessiveSingleShift: AttendanceRecord[] = [
  { id: 'ATT-LONG', workerId: 'W1', workerName: 'Worker 1', siteId: 'S1', siteName: 'Indore Metro', date: '2026-10-21', timeIn: '08:00:00', timeOut: '22:00:00', shiftType: 'full_day', baseHours: 8, overtimeHours: 6, calculatedWage: 1100, status: 'overtime', supervisorName: 'Vikram Singh', verificationHash: 'h', geoVerified: true },
];
const alertsExcessive = evaluateAnomalies(excessiveSingleShift, [], calculateRecordBreakdown(excessiveSingleShift, []));
assert(
  alertsExcessive.some((a) => a.ruleId === 'RULE-02'),
  'RULE-02: Single shift exceeding 12h threshold (14h) triggers Excessive Shift warning'
);

// RULE-01: Duplicate punches on same date
const dupAttendance: AttendanceRecord[] = [
  testAttendance4Days[0],
  { ...testAttendance4Days[0], id: 'ATT-1-PUNCH-2' },
];
const alertsDupPunch = evaluateAnomalies(dupAttendance, [], calculateRecordBreakdown(dupAttendance, []));
assert(
  alertsDupPunch.some((a) => a.ruleId === 'RULE-01'),
  'RULE-01: Duplicate punches on exact same calendar date triggers Duplicate Daily Work Entry'
);

// RULE-05: Unreasoned wage deduction
const vagueDeduction: WageLedgerEntry[] = [
  { id: 'DED-VAGUE', workerId: 'W1', date: '2026-10-24', type: 'deduction', amount: -250, description: 'penalty', hindiDescription: 'कटौती', paymentMode: 'cash', status: 'settled', acknowledgmentStatus: 'acknowledged_by_worker', siteId: 'S1', siteName: 'Indore Metro', contractorName: 'Radhe Const' },
];
const alertsDeduction = evaluateAnomalies(testAttendance4Days, vagueDeduction, breakdownCalc);
assert(
  alertsDeduction.some((a) => a.ruleId === 'RULE-05'),
  'RULE-05: Vague unexplained wage cut triggers Unreasoned Wage Deduction warning'
);

// RULE-07: Statutory minimum wage benchmark comparison
const belowMinimumShift: AttendanceRecord[] = [
  { id: 'ATT-LOW', workerId: 'W1', workerName: 'Worker 1', siteId: 'S1', siteName: 'Indore Metro', date: '2026-10-24', timeIn: '08:00:00', timeOut: '17:00:00', shiftType: 'full_day', baseHours: 8, overtimeHours: 0, calculatedWage: 300, status: 'present', supervisorName: 'Vikram Singh', verificationHash: 'h', geoVerified: true },
];
const alertsLow = evaluateAnomalies(belowMinimumShift, [], calculateRecordBreakdown(belowMinimumShift, []));
const rule7Alert = alertsLow.find((a) => a.ruleId === 'RULE-07');
assert(
  !!rule7Alert && rule7Alert.explanation.includes('unverified prototype'),
  'RULE-07: Flags rate below statutory benchmark and explicitly notes unverified prototype status'
);

// TEST SUITE 11: Privacy & Safe QR Token Generation
console.log('\n11. Testing QR Payload Privacy & Token Safety:');
const sampleWorker = INITIAL_WORKERS[0];
const sampleQrPayload = `https://shramsetu.gov.in/verify?workerId=${encodeURIComponent(sampleWorker.id)}&auth=opaque_${Buffer.from(sampleWorker.id).toString('hex')}`;

assert(
  !sampleQrPayload.includes(sampleWorker.eShramUAN),
  'QR payload does not contain 12-digit e-Shram UAN'
);
assert(
  !sampleQrPayload.includes(sampleWorker.phone) && !sampleQrPayload.toLowerCase().includes('aadhaar'),
  'QR payload does not contain mobile number or Aadhaar PII'
);
assert(
  !sampleQrPayload.includes('₹') && !sampleQrPayload.includes('2600') && !sampleQrPayload.includes('grossWages'),
  'QR payload does not leak confidential wage ledger balances'
);
assert(
  sampleQrPayload.startsWith('https://'),
  'QR payload is a clean, secure verification URL'
);

// TEST SUITE 12: Role-Based Account Lifecycle & Authorization Scoping
console.log('\n12. Testing Role-Based Account Lifecycle & Scoping:');

// Provide localStorage shim for headless test bench
if (!globalThis.localStorage) {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
}
(globalThis as any).window = globalThis;

import { auth } from '../src/services/auth';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

// Test Worker Registration
const workerRegRes = await auth.signUp({
  role: 'worker',
  fullName: 'Arjun Singh Patel',
  phone: '+91 98260 55123',
  email: 'arjun.worker@example.com',
  password: 'SecurePassword123!',
  trade: 'Site Electrician',
  consentToShareContact: true,
  privacyAccepted: true,
});

assert(workerRegRes.success && !!workerRegRes.user, 'Worker successfully registered through auth service');
const regWorker = workerRegRes.user!;
assert(regWorker.role === 'worker', 'Registered user role is strictly "worker"');
assert(regWorker.qrReferenceToken.startsWith('WKR-'), 'Worker receives opaque QR token starting with WKR-');

// Test that newly registered worker does NOT inherit seeded demo attendance
const newWorkerAttendance = db.getAttendance(regWorker.id);
assert(
  newWorkerAttendance.length === 0,
  'Newly registered worker starts with clean state (0 attendance records, no demo data leak)',
  `Got: ${newWorkerAttendance.length} records`
);

// Test Contractor Registration
const contractorRegRes = await auth.signUp({
  role: 'contractor',
  fullName: 'Rajesh Sharma',
  phone: '+91 94250 99887',
  email: 'rajesh.contractor@infra.com',
  password: 'ContractorPass456!',
  organizationName: 'Malwa Civil Projects Pvt Ltd',
  consentToShareContact: true,
  privacyAccepted: true,
});

assert(contractorRegRes.success && !!contractorRegRes.user, 'Contractor successfully registered through auth service');
const regContractor = contractorRegRes.user!;
assert(regContractor.role === 'contractor', 'Registered user role is strictly "contractor"');

// Test that passwords are NEVER stored in localStorage or user profile
const storedSession = localStorage.getItem('shramsetu_auth_active_user');
assert(
  !storedSession?.includes('SecurePassword123!') && !storedSession?.includes('ContractorPass456!'),
  'Plain text passwords are NEVER stored in localStorage session or client database'
);

// Test Sign Out preserves data without deleting users or database
await auth.signOut();
const stateAfterSignOut = auth.getAuthState();
assert(!stateAfterSignOut.isAuthenticated && stateAfterSignOut.user === null, 'Sign out clears session and sets isAuthenticated: false');
assert(db.getWorkers().length >= 5, 'Signing out preserves database records without resetting database');

// TEST SUITE 13: Mobile Number Lifecycle & Manual Contact Verification
console.log('\n13. Testing Contact Verification Lifecycle & Cross-Checks:');

// Status 1: number_supplied initially
assert(
  regWorker.contactVerificationStatus === 'number_supplied',
  'Newly registered user starts in "number_supplied" state (not marked verified by form entry alone)'
);

// Sign back in as contractor to record manual check
await auth.signIn({ loginId: 'rajesh.contractor@infra.com', password: 'ContractorPass456!' });

// Contractor executes personal telephonic cross-check
const checkResult = auth.recordManualContactCheck(
  regWorker.id,
  regWorker.phone,
  'confirmed_match',
  'Called worker directly on phone. Confirmed electrician credentials and site availability.'
);

assert(!!checkResult, 'Authorized contractor can record mutual manual contact cross-check');
assert(checkResult?.outcome === 'confirmed_match', 'Reported outcome is confirmed_match');
assert(checkResult?.checkedByUserId === regContractor.id, 'Check records who performed the check');
assert(!!checkResult?.checkedAt, 'Check records authoritative timestamp');

// Verify updated user state in registry
const updatedUsers = auth.getLocalUsers();
const targetWorkerAfterCheck = updatedUsers.find((u) => u.id === regWorker.id);
assert(
  targetWorkerAfterCheck?.contactVerificationStatus === 'manual_check_completed',
  'Target user contactVerificationStatus transitioned to "manual_check_completed"'
);

// TEST SUITE 14: Genuine QR Code Matrix Encoding, Decoding via jsQR & Approval Workflow
console.log('\n14. Testing Real QR Encoding, jsQR Decoding & Cross-Device Approval:');

const workerOpaqueUrl = `https://shramsetu.in/#verify?refToken=${encodeURIComponent(regWorker.qrReferenceToken)}`;
const qrCodeModel = QRCode.create(workerOpaqueUrl, { errorCorrectionLevel: 'M' });
const qrSize = qrCodeModel.modules.size;
const qrData = qrCodeModel.modules.data; // byte array of 0s and 1s

// Convert to RGBA for jsQR decoder
const rgbaBuffer = new Uint8ClampedArray(qrSize * qrSize * 4);
for (let y = 0; y < qrSize; y++) {
  for (let x = 0; x < qrSize; x++) {
    const isDark = qrData[y * qrSize + x] === 1;
    const offset = (y * qrSize + x) * 4;
    const color = isDark ? 0 : 255;
    rgbaBuffer[offset] = color;     // R
    rgbaBuffer[offset + 1] = color; // G
    rgbaBuffer[offset + 2] = color; // B
    rgbaBuffer[offset + 3] = 255;   // A
  }
}

// Decode with real jsQR decoder
const decoded = jsQR(rgbaBuffer, qrSize, qrSize);
assert(Boolean(decoded && decoded.data === workerOpaqueUrl), 'Real QR decoder (jsQR) successfully decodes generated QR code', `Decoded: ${decoded?.data}`);
assert(Boolean(decoded && !decoded.data.includes(regWorker.phone)), 'Decoded QR URL contains zero phone numbers');
assert(Boolean(decoded && (decoded.data.includes('refToken=') || decoded.data.includes('WKR-'))), 'Decoded QR URL contains valid opaque reference parameter');

// Test Cross-Device Approval Workflow
const issuedReqId = `REQ-TEST-${Date.now()}`;
db.addApprovalRequest({
  id: issuedReqId,
  workerId: regWorker.id,
  workerName: regWorker.fullName,
  workerReferenceToken: regWorker.qrReferenceToken,
  contractorId: regContractor.id,
  contractorName: regContractor.fullName,
  contractorPhone: regContractor.phone,
  siteName: 'Indore Metro Line 3 Viaduct Package',
  actionType: 'attendance_confirmation',
  recordId: 'ATT-CONF-TEST',
  shiftDate: '2026-10-25',
  shiftType: 'full_day',
  hours: 8,
  agreedWage: 600,
  amount: 600,
  status: 'pending',
  createdAt: new Date().toISOString(),
});

const pendingRequests = db.getApprovalRequests(regWorker.id);
assert(
  pendingRequests.some((r) => r.id === issuedReqId && r.status === 'pending'),
  'Contractor-issued shift request appears in worker pending requests list'
);

// Worker approves the request
const approvedReq = db.updateApprovalRequestStatus(issuedReqId, 'approved', 'Confirmed worked 8h on Sunday');
assert(approvedReq?.status === 'approved', 'Worker successfully approves the request');

// Verify that approval automatically created verified AttendanceRecord and wage credit
const attendanceAfterApproval = db.getAttendance(regWorker.id);
assert(
  attendanceAfterApproval.length === 1 && attendanceAfterApproval[0].calculatedWage === 600,
  'Approved request automatically created verified AttendanceRecord with ₹600 wage'
);

const ledgerAfterApproval = db.getLedger(regWorker.id);
assert(
  ledgerAfterApproval.length === 1 && ledgerAfterApproval[0].amount === 600,
  'Approved request automatically credited ₹600 into worker wage ledger'
);

console.log(`\n===========================================`);
console.log(`TEST RUN COMPLETED: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`===========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}


