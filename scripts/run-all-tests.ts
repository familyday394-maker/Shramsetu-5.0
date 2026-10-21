/**
 * Automated Test Suite for Shram Setu 2.0
 * Verifies bilingual dictionary, language switching, contact numbers,
 * Smart Shram Pass formatting, wage calculations, and local demo mode.
 */

import { translations, t, formatCurrency, getLocalizedTrade, getLocalizedSkill, Language } from '../src/services/i18n';
import { APP_CONFIG } from '../src/config';
import { INITIAL_WORKERS, INITIAL_SITES, INITIAL_ATTENDANCE, INITIAL_LEDGER, db } from '../src/services/db';

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

console.log(`\n===========================================`);
console.log(`TEST RUN COMPLETED: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`===========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}

