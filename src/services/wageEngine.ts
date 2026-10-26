/**
 * Shram Setu 2.0 — Authoritative Wage Calculation Engine
 * Implements strict statutory wage arithmetic in integer paise to eliminate floating-point drift.
 * Separates gross earnings, deductions, recorded payments, worker acknowledgments, and outstanding balance.
 */

import { AttendanceRecord, WageLedgerEntry, DisputeGrievance, WageBreakdown } from '../types';

export const PAISE_PER_INR = 100;

export function inrToPaise(inr: number): number {
  return Math.round(inr * PAISE_PER_INR);
}

export function paiseToInr(paise: number): number {
  return Math.round(paise) / PAISE_PER_INR;
}

/**
 * Calculates work record wage breakdown based on shift type and daily base wage.
 */
export function calculateShiftWage(dailyBaseWageInr: number, shiftType: string, overtimeHours: number = 0): {
  baseWagePaise: number;
  overtimeWagePaise: number;
  totalWagePaise: number;
  totalWageInr: number;
} {
  const basePaise = inrToPaise(dailyBaseWageInr);
  let computedPaise = basePaise;
  let otPaise = 0;

  switch (shiftType) {
    case 'half_day':
      computedPaise = Math.round(basePaise * 0.5);
      break;
    case 'overtime_2h':
      // 8h base + 2h standard pro-rata overtime
      otPaise = Math.round((basePaise / 8) * 2);
      computedPaise = basePaise + otPaise;
      break;
    case 'overtime_4h':
      // 8h base + 4h standard pro-rata overtime
      otPaise = Math.round((basePaise / 8) * 4);
      computedPaise = basePaise + otPaise;
      break;
    case 'full_day':
    default:
      if (overtimeHours > 0) {
        otPaise = Math.round((basePaise / 8) * overtimeHours);
        computedPaise = basePaise + otPaise;
      } else {
        computedPaise = basePaise;
      }
      break;
  }

  return {
    baseWagePaise: computedPaise - otPaise,
    overtimeWagePaise: otPaise,
    totalWagePaise: computedPaise,
    totalWageInr: paiseToInr(computedPaise),
  };
}

/**
 * Authoritative single calculation engine for worker ledger records.
 * 
 * Rules:
 * - Gross wages: Earned via attendance muster credits (status 'present', 'half_day', 'overtime').
 * - Deductions: Explicit deductions / penalties with reasons.
 * - Payments: Contractor payments (advances or weekly settlements).
 *   Crucial: Payments REDUCE the balance due; they NEVER increase earnings!
 * - Deduplication: Uses unique payment IDs so duplicate entries are not counted twice.
 */
export function calculateRecordBreakdown(
  attendance: AttendanceRecord[],
  ledger: WageLedgerEntry[],
  disputes: DisputeGrievance[] = []
): WageBreakdown {
  // 1. Calculate Gross Wages from attendance
  let grossWagesEarnedPaise = 0;
  let totalDaysWorked = 0;
  let totalHalfDays = 0;
  let totalOvertimeHours = 0;

  for (const att of attendance) {
    if (att.status === 'present' || att.status === 'overtime') {
      totalDaysWorked++;
    } else if (att.status === 'half_day') {
      totalHalfDays++;
    }
    totalOvertimeHours += att.overtimeHours || 0;

    const shiftCalc = calculateShiftWage(att.calculatedWage || 0, att.shiftType, att.overtimeHours);
    grossWagesEarnedPaise += shiftCalc.totalWagePaise;
  }

  // 2. Process Ledger entries with strict de-duplication
  const seenLedgerIds = new Set<string>();
  let additionsAllowancesPaise = 0;
  let itemizedDeductionsPaise = 0;
  let paymentsRecordedPaise = 0;
  let paymentsAcknowledgedPaise = 0;

  for (const entry of ledger) {
    // Prevent duplicate payment IDs from being counted twice
    if (seenLedgerIds.has(entry.id)) {
      continue;
    }
    seenLedgerIds.add(entry.id);

    // Convert amount to positive absolute paise for category accounting
    const absPaise = inrToPaise(Math.abs(entry.amount));

    switch (entry.type) {
      case 'daily_credit':
        // If not already covered by attendance, or if independent credit
        // When attendance and daily_credit coexist, avoid double counting if ID matches
        if (!entry.id.startsWith('LDG-ATT-')) {
          // Independent bonus or credit
          additionsAllowancesPaise += absPaise;
        }
        break;

      case 'bonus':
        additionsAllowancesPaise += absPaise;
        break;

      case 'penalty_adjustment':
      case 'deduction':
        itemizedDeductionsPaise += absPaise;
        break;

      case 'advance_kharcha':
      case 'weekly_settlement':
        // These are contractor payouts towards wages
        paymentsRecordedPaise += absPaise;
        if (entry.acknowledgmentStatus === 'acknowledged_by_worker' || (entry.status === 'settled' && entry.acknowledgedAt)) {
          paymentsAcknowledgedPaise += absPaise;
        }
        break;
    }
  }

  // 3. Net Wages Due = Gross + Allowances - Deductions
  const netWagesDuePaise = Math.max(0, grossWagesEarnedPaise + additionsAllowancesPaise - itemizedDeductionsPaise);

  // 4. Outstanding Balance = Net Due - Payments Recorded
  let outstandingBalancePaise = 0;
  let overpaymentPaise = 0;

  if (paymentsRecordedPaise > netWagesDuePaise) {
    overpaymentPaise = paymentsRecordedPaise - netWagesDuePaise;
    outstandingBalancePaise = 0;
  } else {
    outstandingBalancePaise = netWagesDuePaise - paymentsRecordedPaise;
  }

  // 5. Calculate open disputed amounts
  let disputedAmountsPaise = 0;
  for (const d of disputes) {
    if (d.status !== 'settled') {
      disputedAmountsPaise += inrToPaise(d.claimedAmount || 0);
    }
  }

  return {
    grossWagesEarnedPaise,
    additionsAllowancesPaise,
    itemizedDeductionsPaise,
    netWagesDuePaise,
    paymentsRecordedPaise,
    paymentsAcknowledgedPaise,
    outstandingBalancePaise,
    overpaymentPaise,
    disputedAmountsPaise,
    grossWagesEarned: paiseToInr(grossWagesEarnedPaise),
    netWagesDue: paiseToInr(netWagesDuePaise),
    paymentsRecorded: paiseToInr(paymentsRecordedPaise),
    paymentsAcknowledged: paiseToInr(paymentsAcknowledgedPaise),
    outstandingBalance: paiseToInr(outstandingBalancePaise),
    overpayment: paiseToInr(overpaymentPaise),
    isOverpaid: overpaymentPaise > 0,
    disputedAmounts: paiseToInr(disputedAmountsPaise),
    totalDaysWorked,
    totalHalfDays,
    totalOvertimeHours,
  };
}
