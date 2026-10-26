/**
 * Shram Setu 2.0 — Deterministic Explainable Anomaly Detection Engine
 * Evaluates rules RULE-01 through RULE-07 without speculative AI scoring or accusations of misconduct.
 */

import { AttendanceRecord, WageLedgerEntry, AnomalyAlert, WageBreakdown } from '../types';

export interface AnomalyEngineOptions {
  overdueThresholdDays?: number; // Configurable threshold (default: 7 days)
  statutoryMinimumWageInr?: number; // Configurable benchmark (default: 412 INR)
  maxDailyHoursThreshold?: number; // Configurable single-shift ceiling (default: 12h)
}

export const DEFAULT_ANOMALY_OPTIONS: AnomalyEngineOptions = {
  overdueThresholdDays: 7,
  statutoryMinimumWageInr: 412,
  maxDailyHoursThreshold: 12,
};

/**
 * Runs deterministic rule evaluation across attendance, ledger, and breakdown data.
 */
export function evaluateAnomalies(
  attendance: AttendanceRecord[],
  ledger: WageLedgerEntry[],
  breakdown: WageBreakdown,
  options: AnomalyEngineOptions = DEFAULT_ANOMALY_OPTIONS
): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = [];
  const opts = { ...DEFAULT_ANOMALY_OPTIONS, ...options };

  // -------------------------------------------------------------
  // RULE-01: Duplicate Work Entries
  // Same worker with multiple punches on the exact same calendar date
  // -------------------------------------------------------------
  const dateMap = new Map<string, AttendanceRecord[]>();
  for (const record of attendance) {
    const key = `${record.workerId}_${record.date}`;
    const list = dateMap.get(key) || [];
    list.push(record);
    dateMap.set(key, list);
  }

  for (const [key, records] of dateMap.entries()) {
    if (records.length > 1) {
      alerts.push({
        ruleId: 'RULE-01',
        ruleName: 'Duplicate Daily Work Entry',
        severity: 'warning',
        recordId: records[0].id,
        valuesExamined: {
          workerId: records[0].workerId,
          date: records[0].date,
          duplicateRecordsCount: records.length,
          recordIds: records.map((r) => r.id),
        },
        triggerCondition: 'Multiple attendance punches recorded for the same worker on the same calendar date.',
        explanation: `Found ${records.length} distinct attendance punches logged on ${records[0].date}. This may indicate accidental double-punching or multiple shifts requiring reconciliation.`,
        suggestedAction: 'Verify site logs with the on-site supervisor and merge or remove redundant entries.',
      });
    }
  }

  // -------------------------------------------------------------
  // RULE-02: Excessive Continuous Shift Duration
  // IMPORTANT: Four days of 8 hours must NOT be classified as a continuous 32-hour shift!
  // Checks each individual daily shift for hours exceeding threshold (12h standard ceiling).
  // -------------------------------------------------------------
  for (const record of attendance) {
    const totalShiftHours = (record.baseHours || 0) + (record.overtimeHours || 0);
    if (totalShiftHours > (opts.maxDailyHoursThreshold || 12)) {
      alerts.push({
        ruleId: 'RULE-02',
        ruleName: 'Excessive Continuous Shift Duration',
        severity: 'warning',
        recordId: record.id,
        valuesExamined: {
          recordId: record.id,
          date: record.date,
          baseHours: record.baseHours,
          overtimeHours: record.overtimeHours,
          totalShiftHours,
          thresholdHours: opts.maxDailyHoursThreshold,
        },
        triggerCondition: `Single continuous shift duration (${totalShiftHours}h) exceeds the configured health & safety threshold (${opts.maxDailyHoursThreshold}h).`,
        explanation: `Shift on ${record.date} logged ${totalShiftHours} continuous hours (Base: ${record.baseHours}h + Overtime: ${record.overtimeHours}h). Note: This rule evaluates individual single-day shifts; multi-day rosters are strictly evaluated per individual date.`,
        suggestedAction: 'Confirm whether mandatory statutory rest breaks were provided during extended concrete/finishing shifts.',
      });
    }
  }

  // -------------------------------------------------------------
  // RULE-03: Retroactive Modification Without Audit Trail
  // Detects modifications or ledger entries with retroactive dates
  // -------------------------------------------------------------
  const now = new Date();
  for (const entry of ledger) {
    const entryDate = new Date(entry.date);
    const diffDays = Math.round((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 30 && entry.type === 'penalty_adjustment') {
      alerts.push({
        ruleId: 'RULE-03',
        ruleName: 'Retroactive Deduction Modification',
        severity: 'warning',
        recordId: entry.id,
        valuesExamined: {
          ledgerId: entry.id,
          date: entry.date,
          daysElapsed: diffDays,
          type: entry.type,
          amount: entry.amount,
        },
        triggerCondition: 'Penalty or wage adjustment recorded with retrospective effective date exceeding 30 days.',
        explanation: `A deduction of ₹${Math.abs(entry.amount)} was posted against work completed ${diffDays} days ago (${entry.date}). Retroactive adjustments require verified evidence.`,
        suggestedAction: 'Review supporting site supervisor documentation and ensure worker was notified.',
      });
    }
  }

  // -------------------------------------------------------------
  // RULE-04: Payment Reconciliation Discrepancy
  // Net wages due, payments recorded, and outstanding balance arithmetic
  // -------------------------------------------------------------
  if (breakdown.isOverpaid && breakdown.overpayment > 0) {
    alerts.push({
      ruleId: 'RULE-04',
      ruleName: 'Payment Reconciliation: Surplus Advance Balance',
      severity: 'info',
      valuesExamined: {
        grossWagesEarned: breakdown.grossWagesEarned,
        paymentsRecorded: breakdown.paymentsRecorded,
        surplusOverpayment: breakdown.overpayment,
      },
      triggerCondition: 'Total recorded payments exceed gross wages earned to date.',
      explanation: `Contractor payments and grocery advances (₹${breakdown.paymentsRecorded}) exceed earned wages (₹${breakdown.grossWagesEarned}) by ₹${breakdown.overpayment}. Outstanding balance due is ₹0.`,
      suggestedAction: 'Credit balance will automatically carry forward to offset subsequent upcoming work days.',
    });
  }

  // -------------------------------------------------------------
  // RULE-05: Unreasoned Deductions
  // Flag deductions without explicit specific descriptions
  // -------------------------------------------------------------
  for (const entry of ledger) {
    if (entry.type === 'penalty_adjustment' || entry.type === 'deduction' || (entry.type === 'advance_kharcha' && !entry.description)) {
      const desc = (entry.description || '').trim().toLowerCase();
      const isVague = desc === '' || desc === 'penalty' || desc === 'deduction' || desc === 'cut' || desc === 'fine';

      if (isVague) {
        alerts.push({
          ruleId: 'RULE-05',
          ruleName: 'Unreasoned Wage Deduction',
          severity: 'warning',
          recordId: entry.id,
          valuesExamined: {
            ledgerId: entry.id,
            amount: entry.amount,
            description: entry.description,
          },
          triggerCondition: 'Deduction logged without clear itemized justification or specific reason.',
          explanation: `Deduction of ₹${Math.abs(entry.amount)} lacks an itemized statutory justification (current text: "${entry.description || '[Blank]'}"). Section 7 of Payment of Wages Act limits deductions to authorized causes.`,
          suggestedAction: 'Update entry with verifiable description (e.g. advance recovery, tool deposit, or mutual agreement).',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // RULE-06: Overdue Outstanding Wage Balance
  // Configurable demonstration threshold (explicitly annotated as demo threshold)
  // -------------------------------------------------------------
  if (breakdown.outstandingBalance > 0 && attendance.length > 0) {
    const oldestPendingAttendance = attendance[attendance.length - 1];
    const punchDate = new Date(oldestPendingAttendance.date);
    const daysSinceOldest = Math.round((now.getTime() - punchDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceOldest > (opts.overdueThresholdDays || 7)) {
      alerts.push({
        ruleId: 'RULE-06',
        ruleName: 'Overdue Wage Settlement (Demonstration Threshold)',
        severity: 'warning',
        valuesExamined: {
          outstandingBalance: breakdown.outstandingBalance,
          oldestWorkDate: oldestPendingAttendance.date,
          daysPending: daysSinceOldest,
          configuredThresholdDays: opts.overdueThresholdDays,
        },
        triggerCondition: `Outstanding balance of ₹${breakdown.outstandingBalance} has remained unpaid beyond the ${opts.overdueThresholdDays}-day demonstration threshold.`,
        explanation: `Statutory wages earned since ${oldestPendingAttendance.date} (${daysSinceOldest} days ago) have an unsettled net balance of ₹${breakdown.outstandingBalance}. Note: This threshold is a configurable demonstration benchmark.`,
        suggestedAction: 'Schedule weekly wage payout settlement with the principal civil contractor.',
      });
    }
  }

  // -------------------------------------------------------------
  // RULE-07: Statutory Minimum Wage Benchmark Comparison
  // Explicitly discloses official status as unverified prototype reference
  // -------------------------------------------------------------
  for (const record of attendance) {
    if (record.shiftType === 'full_day' && record.calculatedWage < (opts.statutoryMinimumWageInr || 412)) {
      alerts.push({
        ruleId: 'RULE-07',
        ruleName: 'Statutory Wage Rate Benchmark Discrepancy',
        severity: 'warning',
        recordId: record.id,
        valuesExamined: {
          recordId: record.id,
          dailyRate: record.calculatedWage,
          statutoryBenchmark: opts.statutoryMinimumWageInr,
          status: 'UNVERIFIED_PROTOTYPE_BENCHMARK',
        },
        triggerCondition: `Daily wage rate ₹${record.calculatedWage} is below the baseline reference rate of ₹${opts.statutoryMinimumWageInr}/day.`,
        explanation: `Daily wage rate of ₹${record.calculatedWage} logged on ${record.date} is below the baseline reference of ₹${opts.statutoryMinimumWageInr}/day. IMPORTANT LEGAL NOTICE: This benchmark is an unverified prototype gazette reference; local field compliance requires official District Labour Officer notification.`,
        suggestedAction: 'Inspect prevailing regional Minimum Wage notification issued by the MP Labour Commissioner.',
      });
    }
  }

  return alerts;
}
