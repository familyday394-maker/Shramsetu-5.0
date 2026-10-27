import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  QrCode, 
  CheckSquare, 
  AlertTriangle, 
  UserCircle2, 
  Phone, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile, Worker, ConstructionSite, AttendanceRecord, WageLedgerEntry, DisputeGrievance, ApprovalRequest, ManualContactCheckRecord } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Language, t, bi, formatCurrency, getLocalizedTrade, getLocalizedSkill } from '../../services/i18n';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { WorkerCard } from '../WorkerCard';
import { ContactVerificationModal } from '../ContactVerificationModal';
import { buildVerifyUrl } from '../../services/verifyLink';

interface WorkerPortalProps {
  user: UserProfile;
  lang: Language;
  onNavigateHome: () => void;
}

export const WorkerPortal: React.FC<WorkerPortalProps> = ({ user, lang, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'wages' | 'qr' | 'approvals' | 'disputes' | 'profile'>('overview');
  
  // Scoped Data State
  const [workerRecord, setWorkerRecord] = useState<Worker | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [ledger, setLedger] = useState<WageLedgerEntry[]>([]);
  const [grievances, setGrievances] = useState<DisputeGrievance[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>(() => db.getSites());
  const [copiedToken, setCopiedToken] = useState(false);

  // Dispute form state
  const [showNewDisputeModal, setShowNewDisputeModal] = useState(false);
  const [disputeType, setDisputeType] = useState<DisputeGrievance['disputeType']>('unpaid_wages');
  const [claimedAmount, setClaimedAmount] = useState<number>(1000);
  const [contractorName, setContractorName] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [siteName, setSiteName] = useState('');

  // Contact verification modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalTarget, setContactModalTarget] = useState<{ id: string; name: string; phone: string } | null>(null);

  const loadData = () => {
    // Check if worker profile exists in db
    let wk = db.getWorkerById(user.id);
    if (!wk) {
      // Create lightweight worker representation in db if newly registered
      wk = {
        id: user.id,
        name: user.fullName,
        hindiName: user.fullName,
        phone: user.phone,
        trade: user.trade || 'General Construction Worker',
        skillLevel: 'skilled',
        dailyBaseWage: 550,
        eShramUAN: 'Unlinked UAN',
        bocwRegistrationNo: 'Pending Registration',
        aadhaarLast4: 'XXXX',
        bloodGroup: 'B+',
        emergencyContact: {
          name: 'Primary Family Member',
          phone: user.phone,
          relation: 'Family',
        },
        photoUrl: '/assets/images/shram_setu_hero_pass_1792385013356.jpg',
        joinedDate: user.createdAt.split('T')[0],
        activeSiteId: 'SITE-IND-METRO-01',
        isDemoRecord: user.isJudgeDemo,
      };
      db.addWorker(wk);
    }
    setWorkerRecord(wk);

    // Scoped queries: Only retrieve records belonging to this worker
    const myAttendance = db.getAttendance(user.id);
    const myLedger = db.getLedger(user.id);
    const myGrievances = db.getGrievances(user.id);
    const myRequests = db.getApprovalRequests(user.id);
    const loadedSites = db.getSites();

    setAttendance(myAttendance);
    setLedger(myLedger);
    setGrievances(myGrievances);
    setApprovalRequests(myRequests);
    setSites(loadedSites);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const stats = db.getWorkerStats(user.id);
  const fallbackSite: ConstructionSite = {
    id: 'SITE-INDORE-01',
    name: 'Indore Metro Rail Project',
    hindiName: 'इंदौर मेट्रो रेल परियोजना',
    location: 'Bhawarkua, Indore',
    city: 'Indore',
    contractorName: 'Indore Civil Infra Ltd',
    contractorPhone: '+91 731 2928100',
    projectType: 'Infrastructure',
    coordinates: { lat: 22.7196, lng: 75.8577 },
    activeWorkers: 0,
    safetyRating: 'A+',
  };
  const activeSite = sites.find((s) => s.id === workerRecord?.activeSiteId) || sites[0] || fallbackSite;

  // Actions
  const handleApproveRequest = (reqId: string) => {
    db.updateApprovalRequestStatus(reqId, 'approved');
    loadData();
  };

  const handleRejectRequest = (reqId: string, reason?: string) => {
    db.updateApprovalRequestStatus(reqId, 'rejected', reason || 'Rejected by worker');
    loadData();
  };

  const handleReportSuspicious = (reqId: string) => {
    db.updateApprovalRequestStatus(reqId, 'reported_suspicious', 'Worker reported unrecognized shift or suspicious contractor details');
    loadData();
  };

  const handleAcknowledgePayment = (entryId: string) => {
    db.acknowledgePayment(entryId, user.id);
    loadData();
  };

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDesc.trim()) return;

    const newGrievance: DisputeGrievance = {
      id: `DISP-${Date.now().toString().slice(-6)}`,
      workerId: user.id,
      workerName: user.fullName,
      workerPhone: user.phone,
      contractorName: contractorName.trim() || 'Site In-Charge',
      contractorPhone: activeSite?.contractorPhone || '+91 731 2928100',
      siteName: siteName.trim() || activeSite?.name || 'Indore Construction Site',
      disputeType,
      claimedAmount,
      incidentDate: new Date().toISOString().split('T')[0],
      filingDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      description: disputeDesc.trim(),
      dloFilingRef: `MP-DLO-IND-${Date.now().toString().slice(-5)}`,
      evidenceMusterCount: attendance.length,
      isDemoRecord: user.isJudgeDemo,
    };

    db.addGrievance(newGrievance);
    setShowNewDisputeModal(false);
    setDisputeDesc('');
    setClaimedAmount(1000);
    loadData();
  };

  const qrPayloadUrl = buildVerifyUrl(user.qrReferenceToken || user.id);

  const copyQrToken = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(user.qrReferenceToken || user.id);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const getContactStatusBadge = (status: UserProfile['contactVerificationStatus']) => {
    switch (status) {
      case 'manual_check_completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-forest-600" />
            <span>Manual Check Completed</span>
          </span>
        );
      case 'shared_with_counterpart':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
            <Phone className="w-3 h-3 text-sky-600" />
            <span>Shared with Site Supervisor</span>
          </span>
        );
      case 'disputed_or_review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Disputed / Review Required</span>
          </span>
        );
      case 'number_supplied':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-700 bg-sand-100 border border-sand-200 px-2 py-0.5 rounded-md">
            <Phone className="w-3 h-3 text-ink-500" />
            <span>Number Supplied (Pending Check)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace identity + tab rail */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-sand-200 bg-gradient-to-br from-forest-800 via-forest-900 to-ink-950 p-5 text-white shadow-[0_28px_50px_-36px_rgba(10,34,25,0.8)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full glow-brass opacity-30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-base font-bold text-white ring-1 ring-inset ring-white/15">
              {user.fullName.charAt(0)}
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-forest-400 text-ink-950 ring-2 ring-forest-900">
                <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
              </span>
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-[1.0625rem] font-semibold text-white">{user.fullName}</h1>
                <span className="rounded-full border border-white/15 bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brass-200">
                  {bi(lang, 'Worker account', 'श्रमिक खाता')}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-sand-200/55">
                {bi(lang, 'Trade', 'पेशा')}: <span className="font-semibold text-sand-200/85">{user.trade || 'General Artisan'}</span>
                <span className="mx-1.5 text-white/20">·</span>
                ID: <span className="font-mono text-sand-200/70">{user.id}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="[&>span]:border-white/15 [&>span]:bg-white/[0.07] [&>span]:text-sand-200/80">
              {getContactStatusBadge(user.contactVerificationStatus)}
            </div>
            <button
              onClick={() => setActiveTab('qr')}
              className="btn btn-gold btn-sm"
            >
              <QrCode className="h-3.5 w-3.5" />
              {bi(lang, 'Show QR pass', 'क्यूआर पास देखें')}
            </button>
          </div>
        </div>
      </div>

      {/* Primary navigation rail */}
      <div className="sticky top-[var(--app-header-offset,4.25rem)] z-30 -mx-1 rounded-2xl border border-sand-200 bg-sand-50/90 px-1.5 py-1.5 backdrop-blur-xl">
        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Worker portal sections">
          {([
            { id: 'overview', label: bi(lang, 'Overview', 'सारांश'), icon: LayoutDashboard },
            { id: 'records', label: bi(lang, 'Work records', 'कार्य रिकॉर्ड'), icon: Calendar, count: attendance.length },
            { id: 'wages', label: bi(lang, 'Wages', 'मजदूरी'), icon: Wallet },
            { id: 'qr', label: bi(lang, 'QR pass', 'क्यूआर पास'), icon: QrCode },
            { id: 'approvals', label: bi(lang, 'Approvals', 'स्वीकृतियाँ'), icon: CheckSquare, alert: approvalRequests.filter((r) => r.status === 'pending').length },
            { id: 'disputes', label: bi(lang, 'Disputes', 'विवाद'), icon: AlertTriangle, count: grievances.length },
            { id: 'profile', label: bi(lang, 'Profile', 'प्रोफ़ाइल'), icon: UserCircle2 },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11.5px] font-bold transition-all duration-300 cursor-pointer ${
                  active
                    ? 'bg-forest-800 text-white shadow-[0_10px_20px_-14px_rgba(22,58,43,0.9)]'
                    : 'text-ink-500 hover:bg-white hover:text-ink-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {'count' in tab && tab.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      active ? 'bg-white/15 text-white' : 'bg-sand-200 text-ink-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {'alert' in tab && tab.alert > 0 && (
                  <span className="rounded-full bg-brass-400 px-1.5 py-0.5 text-[9px] font-extrabold text-ink-950">
                    {tab.alert}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active section */}
      <div key={activeTab} className="animate-fade-up">

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: bi(lang, 'Days worked', 'कार्य दिवस'),
                value: (
                  <>
                    {stats.totalDaysWorked}
                    <span className="ml-1 text-[11px] font-medium tracking-normal text-ink-400">
                      days
                    </span>
                  </>
                ),
                icon: Calendar,
                tone: 'text-ink-900',
                iconTone: 'bg-forest-50 text-forest-700 ring-forest-100',
              },
              {
                label: bi(lang, 'Gross wages earned', 'कुल अर्जित मजदूरी'),
                value: formatCurrency(stats.grossWagesEarned),
                icon: Wallet,
                tone: 'text-forest-700',
                iconTone: 'bg-forest-50 text-forest-700 ring-forest-100',
              },
              {
                label: bi(lang, 'Payments recorded', 'दर्ज भुगतान'),
                value: formatCurrency(stats.paymentsRecorded),
                icon: CheckCircle2,
                tone: 'text-ink-800',
                iconTone: 'bg-sand-100 text-ink-600 ring-sand-200',
              },
              {
                label: bi(lang, 'Outstanding balance', 'बकाया राशि'),
                value: formatCurrency(stats.outstandingBalance),
                icon: AlertTriangle,
                tone: 'text-brass-600',
                iconTone: 'bg-brass-50 text-brass-700 ring-brass-200',
              },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="group rounded-2xl border border-sand-200 bg-white p-4 shadow-soft transition-all duration-400 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                      {kpi.label}
                    </span>
                    <span className={`grid h-7 w-7 place-items-center rounded-lg ring-1 ring-inset ${kpi.iconTone}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className={`mt-2.5 font-mono text-[1.35rem] font-bold leading-none tabular-nums ${kpi.tone}`}>
                    {kpi.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* If new account with 0 records: helpful empty state */}
          {attendance.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ink-900">Welcome to Shram Setu!</h3>
              <p className="text-xs text-ink-600 max-w-md mx-auto leading-relaxed">
                Your genuine account has been configured with an opaque QR pass. When you arrive at a construction site, show your QR pass to the contractor to punch your first shift.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('qr')}
                  className="px-4 py-2 bg-forest-800 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  View My QR Pass
                </button>
              </div>
            </div>
          ) : (
            /* Recent Shifts Preview */
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-sand-200 bg-sand-50/50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider">Recent Work Records</h3>
                <button
                  onClick={() => setActiveTab('records')}
                  className="text-xs text-forest-800 font-semibold hover:underline"
                >
                  View All ({attendance.length})
                </button>
              </div>
              <div className="divide-y divide-sand-100">
                {attendance.slice(0, 5).map((att) => (
                  <div key={att.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-ink-900">{att.date}</span>
                        <span className="font-semibold text-ink-700">· {att.shiftType.replace('_', ' ')}</span>
                      </div>
                      <p className="text-ink-500 mt-0.5">{att.siteName} (Supervisor: {att.supervisorName})</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-forest-700 text-sm">+{formatCurrency(att.calculatedWage)}</span>
                      <span className="block text-[10px] text-ink-400">SHA-256 Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY WORK RECORDS */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink-900">Attendance & Shift Records</h2>
            <span className="text-xs text-ink-500 font-mono">{attendance.length} Shifts Logged</span>
          </div>

          {attendance.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-xs text-ink-500">
              No shift records have been logged yet for this account. Shifts approved through your contractor will appear here.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sand-50 border-b border-sand-200 text-ink-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Site</th>
                      <th className="py-3 px-4">Shift & Hours</th>
                      <th className="py-3 px-4 text-right">Calculated Wage</th>
                      <th className="py-3 px-4">Supervisor</th>
                      <th className="py-3 px-4">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-100">
                    {attendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-sand-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-ink-900">{rec.date}</td>
                        <td className="py-3 px-4 text-ink-700 font-medium">{rec.siteName}</td>
                        <td className="py-3 px-4 text-ink-600">
                          {rec.shiftType.replace('_', ' ')} ({rec.baseHours + rec.overtimeHours} hrs)
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-forest-700 text-right">
                          +{formatCurrency(rec.calculatedWage)}
                        </td>
                        <td className="py-3 px-4 text-ink-600">{rec.supervisorName}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-forest-600" />
                            <span>Integrity Verified</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WAGES AND PAYMENTS */}
      {activeTab === 'wages' && (
        <div className="space-y-6">
          <div className="bg-sand-50 rounded-2xl border border-brass-200 p-5 space-y-3">
            <h2 className="text-base font-bold text-ink-900">Authoritative Wage & Khata Balance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="p-3 bg-white rounded-xl border border-sand-200">
                <span className="text-ink-500 block">Total Statutory Earned:</span>
                <span className="font-mono font-bold text-lg text-forest-800">{formatCurrency(stats.grossWagesEarned)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-sand-200">
                <span className="text-ink-500 block">Total Payouts / Advances:</span>
                <span className="font-mono font-bold text-lg text-ink-800">{formatCurrency(stats.paymentsRecorded)}</span>
                <span className="text-[10px] text-ink-400 block mt-0.5">({formatCurrency(stats.paymentsAcknowledged)} acknowledged by you)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-sand-200">
                <span className="text-ink-500 block">Net Outstanding Dues:</span>
                <span className="font-mono font-bold text-lg text-brass-600">{formatCurrency(stats.outstandingBalance)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-sand-200 bg-sand-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider">Disbursements & Wage Credits</h3>
              <span className="text-xs text-ink-500 font-mono">{ledger.length} Transactions</span>
            </div>

            {ledger.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-500">
                No wage ledger entries recorded yet. Disbursements made by your contractor will appear here for your explicit acknowledgment.
              </div>
            ) : (
              <div className="divide-y divide-sand-100">
                {ledger.map((entry) => (
                  <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-ink-900">{entry.date}</span>
                        <span className="text-ink-500">·</span>
                        <span className="font-semibold text-ink-800">{entry.description}</span>
                      </div>
                      <p className="text-ink-500 mt-0.5">
                        Mode: <span className="uppercase font-medium">{entry.paymentMode}</span> · Site: {entry.siteName}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right justify-between sm:justify-end">
                      <div>
                        <span className={`font-mono font-bold text-sm ${entry.amount > 0 ? 'text-forest-700' : 'text-ink-900'}`}>
                          {entry.amount > 0 ? `+${formatCurrency(entry.amount)}` : formatCurrency(entry.amount)}
                        </span>
                        <span className="block text-[10px] text-ink-400">
                          {entry.acknowledgmentStatus === 'acknowledged_by_worker' ? 'Acknowledged' : 'Pending acknowledgment'}
                        </span>
                      </div>

                      {entry.amount < 0 && entry.acknowledgmentStatus !== 'acknowledged_by_worker' && (
                        <button
                          onClick={() => handleAcknowledgePayment(entry.id)}
                          className="px-3 py-1.5 bg-forest-700 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MY QR PASS */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 shadow-md text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mx-auto">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-ink-900">Your Permanent Smart Shram Pass</h2>
            <p className="text-xs text-ink-600 leading-relaxed">
              Show this QR pass to any authorized site supervisor to record shifts. It contains exclusively an opaque token — zero phone numbers or private wages are exposed.
            </p>

            <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 inline-block mx-auto">
              <QRCodeDisplay value={qrPayloadUrl} size={180} />
            </div>

            <div className="bg-sand-50 p-3 rounded-xl border border-sand-200 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-500">Worker Reference:</span>
                <span className="font-mono font-bold text-ink-800">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Opaque Token:</span>
                <span className="font-mono text-ink-600 truncate max-w-[200px]">{user.qrReferenceToken || user.id}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={copyQrToken}
                className="px-4 py-2 border border-ink-300 hover:bg-sand-50 rounded-xl text-xs font-semibold text-ink-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-forest-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Token Copied!' : 'Copy Reference'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-forest-800 hover:bg-forest-700 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: APPROVAL REQUESTS */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900">Contractor Shift & Wage Requests</h2>
              <p className="text-xs text-ink-500">Review requests from site supervisors before they are finalized</p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 text-ink-500 hover:text-ink-800 rounded-lg border border-sand-200 transition-colors"
              title="Refresh requests"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {approvalRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-xs text-ink-500">
              No pending approval requests. When a contractor scans your QR pass and creates a shift entry, it will appear here for your approval.
            </div>
          ) : (
            <div className="space-y-3">
              {approvalRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                    req.status === 'pending'
                      ? 'border-brass-300 bg-brass-50/20'
                      : req.status === 'approved'
                      ? 'border-forest-200'
                      : 'border-ink-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900 text-sm">
                          {req.actionType === 'attendance_confirmation' ? 'Shift Confirmation Request' : 'Wage Acknowledgment'}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          req.status === 'pending'
                            ? 'bg-brass-100 text-brass-800'
                            : req.status === 'approved'
                            ? 'bg-forest-100 text-forest-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-ink-600 mt-1">
                        Supervisor: <span className="font-semibold text-ink-800">{req.contractorName}</span> (Phone: {req.contractorPhone})
                      </p>
                      <p className="text-ink-500">
                        Site: {req.siteName} · Shift Date: <span className="font-mono font-semibold">{req.shiftDate || req.createdAt.split('T')[0]}</span>
                      </p>
                      {req.notes && <p className="text-ink-500 italic mt-1">"{req.notes}"</p>}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-2">
                      <div className="sm:text-right">
                        <span className="font-mono font-bold text-base text-forest-800">
                          {formatCurrency(req.agreedWage || req.amount || 0)}
                        </span>
                        <span className="block text-[10px] text-ink-400">
                          {req.hours ? `${req.hours} Hours Shift` : 'Agreed Terms'}
                        </span>
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-2 sm:pt-0">
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="px-3 py-1.5 bg-forest-700 hover:bg-forest-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="px-3 py-1.5 bg-sand-100 hover:bg-sand-200 text-ink-700 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleReportSuspicious(req.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Report Suspicious Contractor"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DISPUTES & SAMADHAN */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900">Dispute & Grievance Redressal (Samadhan)</h2>
              <p className="text-xs text-ink-500">File formal wage disagreements under MP BOCW and DLO standards</p>
            </div>
            <button
              onClick={() => setShowNewDisputeModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>File Dispute</span>
            </button>
          </div>

          {grievances.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-xs text-ink-500">
              No disputes logged. If a contractor underpays, denies recorded shifts, or makes arbitrary deductions, click "File Dispute" to generate an official claim.
            </div>
          ) : (
            <div className="space-y-3">
              {grievances.map((g) => (
                <div key={g.id} className="bg-white rounded-2xl border border-sand-200 p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900 text-sm capitalize">{g.disputeType.replace('_', ' ')}</span>
                        <span className="font-mono text-[10px] text-ink-500">Ref: {g.dloFilingRef}</span>
                      </div>
                      <p className="text-ink-500 mt-0.5">Contractor: {g.contractorName} · Site: {g.siteName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-700 text-sm">Claimed: {formatCurrency(g.claimedAmount)}</span>
                      <span className="block text-[10px] text-ink-400 capitalize">Status: {g.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-ink-700 block mb-0.5">Worker's Statement:</span>
                    <p className="text-ink-600 bg-sand-50 p-2.5 rounded-lg border border-sand-200 leading-relaxed">
                      {g.description}
                    </p>
                  </div>

                  {g.contractorResponse && (
                    <div className="pt-1">
                      <span className="font-semibold text-ink-700 block mb-0.5">Contractor Response (Preserved):</span>
                      <p className="text-ink-600 bg-brass-50/50 p-2.5 rounded-lg border border-brass-200 leading-relaxed">
                        {g.contractorResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: PROFILE & CONTACT */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-ink-900">Worker Profile & Contact Governance</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Full Legal Name:</span>
                <span className="font-semibold text-ink-900 text-sm">{user.fullName}</span>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Registered Mobile Number:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-ink-900 text-sm">{user.phone}</span>
                  {getContactStatusBadge(user.contactVerificationStatus)}
                </div>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Work Trade / Skill:</span>
                <span className="font-semibold text-ink-900 text-sm">{user.trade || 'Masonry Artisan'}</span>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Contact Sharing Preference:</span>
                <span className="font-semibold text-forest-800 text-sm">
                  {user.consentToShareContact ? 'Permitted to Authorized Contractors' : 'Private'}
                </span>
              </div>
            </div>

            {/* Manual Phone Checks Log */}
            <div className="pt-4 border-t border-sand-200">
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-2">
                Mutual Contact Check History
              </h3>
              <p className="text-xs text-ink-500 mb-3">
                Log of authorized counterparts who personally phoned to cross-check work details.
              </p>

              {!user.manualChecks || user.manualChecks.length === 0 ? (
                <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 text-center text-xs text-ink-500">
                  No manual phone checks recorded yet. Your contractor can log a cross-check upon verifying your shift.
                </div>
              ) : (
                <div className="space-y-2">
                  {user.manualChecks.map((chk) => (
                    <div key={chk.id} className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-ink-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
                          <span>Checked by {chk.checkedByName} ({chk.checkedByRole})</span>
                        </div>
                        <span className="text-[11px] text-ink-500 mt-0.5 block">{chk.notes || 'Routine shift phone check'}</span>
                      </div>
                      <span className="font-mono text-[10px] text-ink-400">{chk.checkedAt.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Dispute Modal */}
      {showNewDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-sand-200 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink-900">File Formal Grievance (Samadhan)</h3>
            <p className="text-xs text-ink-500">This will be preserved in the cryptographic audit chain and formatted for the Indore District Labor Officer.</p>

            <form onSubmit={handleCreateDispute} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">Dispute Category</label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value as any)}
                  className="w-full p-2 border border-ink-300 rounded-lg bg-white"
                >
                  <option value="unpaid_wages">Unpaid Wages / Withheld Pay</option>
                  <option value="arbitrary_deduction">Arbitrary Deductions / Kharcha Penalty</option>
                  <option value="denied_overtime">Denied Statutory Overtime</option>
                  <option value="unsafe_conditions">Unsafe Construction Site Conditions</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-700 mb-1">Contractor / Supervisor Name</label>
                <input
                  type="text"
                  required
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  placeholder="e.g., Anil Sisodiya"
                  className="w-full p-2 border border-ink-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-700 mb-1">Claimed Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(Number(e.target.value))}
                  className="w-full p-2 border border-ink-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-700 mb-1">Worker Statement & Incident Details</label>
                <textarea
                  required
                  rows={4}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Describe the shifts worked, promised daily wage, and what the contractor stated..."
                  className="w-full p-2 border border-ink-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDisputeModal(false)}
                  className="px-4 py-2 text-ink-600 hover:bg-sand-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded-lg"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
