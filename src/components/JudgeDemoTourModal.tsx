import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  Upload, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { db } from '../services/db';
import { verifyAuditChain } from '../services/cryptoAudit';
import { evaluateAnomalies } from '../services/anomalyEngine';
import { AuditVerificationResult, AnomalyAlert } from '../types';
import { Language } from '../services/i18n';

interface JudgeDemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
  lang: Language;
}

export const JudgeDemoTourModal: React.FC<JudgeDemoTourModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'crypto' | 'anomalies' | 'reset'>('tour');
  
  // Crypto audit state
  const [auditResult, setAuditResult] = useState<AuditVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperStatus, setTamperStatus] = useState<string>('Clean Baseline');

  // Anomaly evaluation state
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);

  // Reset state
  const [resetMode, setResetMode] = useState<'demo_only' | 'factory'>('demo_only');
  const [resetConfirmed, setResetConfirmed] = useState(false);

  // Backup state
  const [backupJson, setBackupJson] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');

  const runVerification = async () => {
    setIsVerifying(true);
    const chain = db.getAuditEvents();
    const res = await verifyAuditChain(chain);
    setAuditResult(res);
    setIsVerifying(false);
  };

  const runAnomalyEvaluation = () => {
    const attendance = db.getAttendance();
    const ledger = db.getLedger();
    const worker1 = db.getWorkers()[0];
    const stats = worker1 ? db.getWorkerStats(worker1.id) : {
      grossWagesEarnedPaise: 0,
      additionsAllowancesPaise: 0,
      itemizedDeductionsPaise: 0,
      netWagesDuePaise: 0,
      paymentsRecordedPaise: 0,
      paymentsAcknowledgedPaise: 0,
      outstandingBalancePaise: 0,
      overpaymentPaise: 0,
      disputedAmountsPaise: 0,
      grossWagesEarned: 0,
      netWagesDue: 0,
      paymentsRecorded: 0,
      paymentsAcknowledged: 0,
      outstandingBalance: 0,
      overpayment: 0,
      isOverpaid: false,
      disputedAmounts: 0,
      totalDaysWorked: 0,
      totalHalfDays: 0,
      totalOvertimeHours: 0,
    };
    const alerts = evaluateAnomalies(attendance, ledger, stats);
    setAnomalies(alerts);
  };

  useEffect(() => {
    if (isOpen) {
      runVerification();
      runAnomalyEvaluation();
    }
  }, [isOpen]);

  const handleTamperRecord = async () => {
    db.tamperAuditEvent(0, 'UNAUTHORIZED_PAYMENT_INJECTION_4000');
    setTamperStatus('Tampered: Injected unverified record modification');
    await runVerification();
  };

  const handleBreakLinkage = async () => {
    db.breakAuditLinkage(0);
    setTamperStatus('Tampered: Corrupted predecessor SHA-256 hash pointer');
    await runVerification();
  };

  const handleRestoreBaseline = async () => {
    db.restoreAuditBaseline();
    setTamperStatus('Clean Baseline Restored');
    await runVerification();
  };

  const handleExecuteReset = () => {
    if (resetMode === 'demo_only') {
      db.resetDemoDataOnly();
    } else {
      db.resetToDefault();
    }
    setResetConfirmed(true);
    onDataReset();
    setTimeout(() => {
      setResetConfirmed(false);
      onClose();
    }, 1200);
  };

  const handleExportBackup = () => {
    const json = db.exportBackup();
    setBackupJson(json);

    // Download file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shram-setu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = db.importBackup(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
        onDataReset();
      } else {
        setImportStatus('Failed to parse backup JSON. Invalid schema.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                {lang === 'hi' ? 'जज डेमो टूर एवं सुरक्षा ऑडिट बेंच' : "Judges' Tour & Audit Test Bench"}
              </h2>
              <span className="text-[11px] text-orange-300 font-medium block">
                Shram Setu 2.0 · Verified Architecture & Anomaly Controls
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('tour')}
            className={`py-3 px-4 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'tour' ? 'border-b-2 border-orange-600 text-orange-600 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'प्रोटोटाइप अवलोकन' : 'Core Innovation Tour'}
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`py-3 px-4 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'crypto' ? 'border-b-2 border-orange-600 text-orange-600 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'क्रिप्टोग्राफिक ऑडिट (SHA-256)' : 'Cryptographic Audit Bench'}
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`py-3 px-4 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'anomalies' ? 'border-b-2 border-orange-600 text-orange-600 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'असंगति नियम (RULE-01 to 07)' : 'Anomaly Engine (RULE 01-07)'}
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`py-3 px-4 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'reset' ? 'border-b-2 border-orange-600 text-orange-600 bg-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'डेटा रीसेट एवं बैकअप' : 'Safe Reset & Backup'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          
          {/* TAB 1: Core Innovation Tour */}
          {activeTab === 'tour' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <h3 className="font-bold text-orange-950 text-sm mb-1">
                  Defining Innovation: Absolute Wage Transparency
                </h3>
                <p className="text-orange-900 text-xs leading-relaxed">
                  Every wage explained, every change traceable, every payment status explicit, and every disagreement visible.
                  Empowering 450M+ unorganized construction and informal workers against wage theft, arbitrary cuts, and unrecorded overtime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">1. Smart Shram Pass</span>
                  <p className="text-slate-600 text-[11px]">
                    Dual-sided physical and digital card. QR code contains an <strong>opaque unguessable reference</strong> URL, completely sanitizing Aadhaar and wage balances for privacy.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">2. Authoritative Wage Engine</span>
                  <p className="text-slate-600 text-[11px]">
                    Evaluates exact integer paise arithmetic. <strong>₹650 × 4 days = ₹2,600</strong> gross. Recording a ₹1,300 payment leaves ₹1,300 outstanding. Payments never count as earnings.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">3. SHA-256 Audit Chain</span>
                  <p className="text-slate-600 text-[11px]">
                    Deterministic canonical serialization with cryptographic predecessor hash pointers. Detects unauthorized in-place record alterations.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">4. Explainable Anomaly Detection</span>
                  <p className="text-slate-600 text-[11px]">
                    Deterministic rules (RULE-01 to RULE-07) with neutral explanations. Ensures 4 days of 8 hours are never conflated as a 32-hour continuous shift.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600">
                <strong>Project Origin:</strong> Senior Bal Vigyan Innovation Exhibit, Indore, Madhya Pradesh. Official Helpline: <strong className="text-slate-900 font-mono">7909348017</strong>.
              </div>
            </div>
          )}

          {/* TAB 2: Cryptographic Audit Bench */}
          {activeTab === 'crypto' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Chain Status</span>
                  <h4 className="text-sm font-bold text-slate-900 font-mono">{tamperStatus}</h4>
                </div>
                <button
                  onClick={runVerification}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>Verify Audit Chain</span>
                </button>
              </div>

              {/* Verification Outcome Box */}
              {auditResult && (
                <div className={`p-4 rounded-xl border ${
                  auditResult.outcome === 'INTEGRITY_PASSED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {auditResult.outcome === 'INTEGRITY_PASSED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-sm font-mono">{auditResult.outcome}</span>
                  </div>
                  <p className="text-xs">{auditResult.details}</p>
                </div>
              )}

              {/* Attack Scenarios */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block">Simulated Attack Scenarios for Evaluation:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={handleTamperRecord}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 rounded-lg font-medium text-left cursor-pointer transition-colors"
                  >
                    <span className="block font-bold">1. Tamper Record</span>
                    <span className="text-[10px] text-rose-700 block">Simulate unauthorized payload edit</span>
                  </button>

                  <button
                    onClick={handleBreakLinkage}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg font-medium text-left cursor-pointer transition-colors"
                  >
                    <span className="block font-bold">2. Break Linkage</span>
                    <span className="text-[10px] text-amber-700 block">Corrupt predecessor hash</span>
                  </button>

                  <button
                    onClick={handleRestoreBaseline}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-lg font-medium text-left cursor-pointer transition-colors"
                  >
                    <span className="block font-bold">3. Restore Baseline</span>
                    <span className="text-[10px] text-emerald-700 block">Reset valid genesis hash chain</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                <strong>Cryptographic Notice:</strong> Standard Web Crypto SHA-256 digests verify data integrity within the platform's verifiable event log. A locally held hash chain cannot protect against an adversary with root write access to the host device without remote timestamping.
              </div>
            </div>
          )}

          {/* TAB 3: Anomaly Engine */}
          {activeTab === 'anomalies' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs">Deterministic Rule Findings (RULE-01 to RULE-07)</span>
                <span className="text-[11px] text-slate-500 font-mono">{anomalies.length} active notifications</span>
              </div>

              {anomalies.length === 0 ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center">
                  No anomalies detected. All work records, payment totals, and shifts meet configured thresholds.
                </div>
              ) : (
                anomalies.map((alert, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded font-mono text-[10px]">
                          {alert.ruleId}
                        </span>
                        <span>{alert.ruleName}</span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{alert.explanation}</p>
                    <p className="text-slate-500 text-[10px] italic">
                      <strong>Suggested Action:</strong> {alert.suggestedAction}
                    </p>
                  </div>
                ))
              )}

              <div className="p-3 bg-slate-100 rounded text-[11px] text-slate-600">
                <strong>RULE-02 Safety Check:</strong> Individual 8-hour days are verified independently; four days of 8 hours are never aggregated as a continuous 32-hour shift.
              </div>
            </div>
          )}

          {/* TAB 4: Safe Reset & Backup */}
          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Safe Reset & Demonstration Isolation</span>
                </div>
                <p className="text-[11px] text-amber-900">
                  To protect real records, Shram Setu isolates demonstration data. You can choose whether to reset only the sample seed data or perform a complete factory wipe.
                </p>

                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="resetMode"
                      value="demo_only"
                      checked={resetMode === 'demo_only'}
                      onChange={() => setResetMode('demo_only')}
                      className="text-orange-600"
                    />
                    <span><strong>Reset Demo Data Only (Recommended):</strong> Preserves newly registered real workers.</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="resetMode"
                      value="factory"
                      checked={resetMode === 'factory'}
                      onChange={() => setResetMode('factory')}
                      className="text-orange-600"
                    />
                    <span><strong>Factory Reset:</strong> Wipes all local records back to initial Bal Vigyan Indore prototype state.</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExecuteReset}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-sm"
                  >
                    {resetConfirmed ? 'Resetting...' : 'Confirm and Execute Reset'}
                  </button>
                  {resetConfirmed && (
                    <span className="text-emerald-700 ml-2 font-semibold">✓ Reset completed!</span>
                  )}
                </div>
              </div>

              {/* Versioned Backup Export / Restore */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">Versioned Data Backup & Restore (JSON Interchange)</span>
                <p className="text-slate-600 text-[11px]">
                  Export all current workers, verified muster attendance, wage ledger records, and audit events into a portable schema v2.0 JSON file.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON Backup</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore from JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>

                {importStatus && (
                  <div className="text-[11px] font-semibold text-emerald-700">{importStatus}</div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
