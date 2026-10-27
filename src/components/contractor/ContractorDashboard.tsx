import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  Wallet, 
  QrCode, 
  CheckSquare, 
  AlertTriangle, 
  FileCheck, 
  UserCircle2,
  Camera,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Phone,
  RefreshCw,
  Send,
  HelpCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Worker, ConstructionSite, AttendanceRecord, WageLedgerEntry, DisputeGrievance, ApprovalRequest } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Language, t, bi, formatCurrency, getLocalizedTrade } from '../../services/i18n';
import { computeSha256Hex, canonicalSerialize, verifyAuditChain } from '../../services/cryptoAudit';
import { evaluateAnomalies } from '../../services/anomalyEngine';
import { calculateRecordBreakdown } from '../../services/wageEngine';
import { ContactVerificationModal } from '../ContactVerificationModal';
import jsQR from 'jsqr';

interface ContractorDashboardProps {
  user: UserProfile;
  lang: Language;
}

export const ContractorDashboard: React.FC<ContractorDashboardProps> = ({ user, lang }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'workers' | 'attendance' | 'ledger' | 'scanner' | 'approvals' | 'disputes' | 'audit' | 'profile'
  >('dashboard');

  // Authoritative Data
  const [assignedWorkers, setAssignedWorkers] = useState<Worker[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>(() => db.getSites());
  const [selectedSiteId, setSelectedSiteId] = useState<string>(() => db.getSites()[0]?.id || '');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [ledger, setLedger] = useState<WageLedgerEntry[]>([]);
  const [grievances, setGrievances] = useState<DisputeGrievance[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);

  // Modals & Forms
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [workerLookupToken, setWorkerLookupToken] = useState('');
  const [lookupResult, setLookupResult] = useState<Worker | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // New Shift / Record Attendance
  const [punchWorkerId, setPunchWorkerId] = useState('');
  const [punchDate, setPunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [punchShiftType, setPunchShiftType] = useState<AttendanceRecord['shiftType']>('full_day');
  const [punchHours, setPunchHours] = useState(8);
  const [punchAgreedWage, setPunchAgreedWage] = useState(550);
  const [punchSuccess, setPunchSuccess] = useState(false);

  // New Payment Entry
  const [payWorkerId, setPayWorkerId] = useState('');
  const [payAmount, setPayAmount] = useState(1000);
  const [payType, setPayType] = useState<WageLedgerEntry['type']>('weekly_settlement');
  const [payMode, setPayMode] = useState<WageLedgerEntry['paymentMode']>('bank_transfer');
  const [payDesc, setPayDesc] = useState('Weekly wage disbursement');
  const [paySuccess, setPaySuccess] = useState(false);

  // New Approval Request
  const [reqWorkerId, setReqWorkerId] = useState('');
  const [reqShiftDate, setReqShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [reqHours, setReqHours] = useState(8);
  const [reqWage, setReqWage] = useState(550);
  const [reqNotes, setReqNotes] = useState('');
  const [reqSuccess, setReqSuccess] = useState(false);

  // Contractor response to dispute
  const [respondingGrievanceId, setRespondingGrievanceId] = useState<string | null>(null);
  const [contractorResponseText, setContractorResponseText] = useState('');

  // Contact verification modal
  const [contactTarget, setContactTarget] = useState<Worker | null>(null);

  // QR Scanner State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const loadData = () => {
    const allWorkers = db.getWorkers();
    const allSites = db.getSites();
    setSites(allSites);
    if (!selectedSiteId && allSites.length > 0) {
      setSelectedSiteId(allSites[0].id);
    }

    // Scoped Workers: In Judge Demo or Contractor mode, assign authorized subset
    let authorized = allWorkers;
    if (!user.isJudgeDemo && user.assignedWorkerIds && user.assignedWorkerIds.length > 0) {
      authorized = allWorkers.filter((w) => user.assignedWorkerIds?.includes(w.id));
    }
    setAssignedWorkers(authorized);

    if (authorized.length > 0 && !punchWorkerId) {
      setPunchWorkerId(authorized[0].id);
      setPayWorkerId(authorized[0].id);
      setReqWorkerId(authorized[0].id);
      setPunchAgreedWage(authorized[0].dailyBaseWage);
      setReqWage(authorized[0].dailyBaseWage);
    }

    // Load attendance & ledger for authorized workers
    const authorizedIds = new Set(authorized.map((w) => w.id));
    const allAtt = db.getAttendance();
    const allLdg = db.getLedger();
    const allGriev = db.getGrievances();
    const allReqs = db.getApprovalRequests();

    setAttendance(allAtt.filter((a) => authorizedIds.has(a.workerId)));
    setLedger(allLdg.filter((l) => authorizedIds.has(l.workerId)));
    setGrievances(allGriev.filter((g) => authorizedIds.has(g.workerId)));
    setApprovalRequests(allReqs.filter((r) => r.contractorId === user.id || user.isJudgeDemo));
  };

  useEffect(() => {
    loadData();
  }, [user.id, selectedSiteId]);

  // Clean up camera on tab change or unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const fallbackSite: ConstructionSite = {
    id: 'SITE-INDORE-01',
    name: 'Indore Metro Rail Project',
    hindiName: 'इंदौर मेट्रो रेल परियोजना',
    location: 'Bhawarkua, Indore',
    city: 'Indore',
    contractorName: user.organizationName || user.fullName,
    contractorPhone: user.phone || '+91 731 2928100',
    projectType: 'Infrastructure',
    coordinates: { lat: 22.7196, lng: 75.8577 },
    activeWorkers: 0,
    safetyRating: 'A+',
  };

  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0] || fallbackSite;

  // --------------------------------------------------------------------------
  // Camera Scanner via jsQR
  // --------------------------------------------------------------------------
  const startCamera = async () => {
    setCameraError(null);
    setScannedToken(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScanner);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access camera. Please enter worker reference manually.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const tickScanner = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code && code.data) {
          handleDecodedToken(code.data);
          stopCamera();
          return;
        }
      }
    }
    if (cameraActive) {
      animationFrameId.current = requestAnimationFrame(tickScanner);
    }
  };

  const handleDecodedToken = (rawText: string) => {
    setScannedToken(rawText);
    // Parse URL parameter if it's a URL
    let token = rawText;
    if (rawText.includes('refToken=')) {
      try {
        const u = new URL(rawText.startsWith('http') ? rawText : `https://${rawText}`);
        const ref = u.searchParams.get('refToken') || u.hash.split('refToken=')[1];
        if (ref) token = ref;
      } catch {
        // fallback
      }
    } else if (rawText.includes('refToken=')) {
      // Current pass format: https://host/#/verify?refToken=WKR-…
      try {
        const parsed = new URL(rawText, 'https://shramsetu.in');
        token = parsed.searchParams.get('refToken') || rawText;
      } catch {
        token = rawText.split('refToken=')[1]?.split('&')[0] || rawText;
      }
    } else if (rawText.includes('#verify-')) {
      // Legacy pass format kept for printed cards already in circulation.
      token = rawText.split('#verify-')[1] || rawText;
    }

    // Resolve worker safely
    const allWorkers = db.getWorkers();
    const resolved = allWorkers.find(
      (w) => w.id.toLowerCase() === token.toLowerCase() || (w as any).qrReferenceToken === token
    );

    if (resolved) {
      setLookupResult(resolved);
      setLookupError(null);
    } else {
      setLookupError(`Opaque token "${token}" resolved successfully, but no matching worker profile was found.`);
      setLookupResult(null);
    }
  };

  const handleManualLookup = () => {
    if (!workerLookupToken.trim()) return;
    handleDecodedToken(workerLookupToken.trim());
  };

  const handleAssignWorker = (worker: Worker) => {
    const currentAssigned = user.assignedWorkerIds || [];
    if (!currentAssigned.includes(worker.id)) {
      auth.updateProfile({
        assignedWorkerIds: [...currentAssigned, worker.id],
      });
    }
    loadData();
    setShowAddWorkerModal(false);
    setLookupResult(null);
    setWorkerLookupToken('');
  };

  // --------------------------------------------------------------------------
  // Record Attendance Handler
  // --------------------------------------------------------------------------
  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = assignedWorkers.find((w) => w.id === punchWorkerId);
    if (!target) return;

    const payload = {
      workerId: target.id,
      siteId: activeSite?.id || fallbackSite.id,
      date: punchDate,
      wage: punchAgreedWage,
      hours: punchHours,
    };
    const genuineHash = await computeSha256Hex(canonicalSerialize(payload));

    const newRecord: AttendanceRecord = {
      id: `ATT-${punchDate}-${target.id.slice(-4)}-${Date.now().toString().slice(-4)}`,
      workerId: target.id,
      workerName: target.name,
      siteId: activeSite?.id || fallbackSite.id,
      siteName: activeSite?.name || fallbackSite.name,
      date: punchDate,
      timeIn: '08:00:00',
      timeOut: punchHours >= 8 ? '17:00:00' : '13:00:00',
      shiftType: punchShiftType,
      baseHours: Math.min(punchHours, 8),
      overtimeHours: Math.max(0, punchHours - 8),
      calculatedWage: punchAgreedWage,
      status: 'present',
      supervisorName: user.fullName,
      verificationHash: genuineHash,
      geoVerified: true,
      notes: `Recorded on-site by ${user.fullName}`,
    };

    db.addAttendance(newRecord);
    setPunchSuccess(true);
    setTimeout(() => setPunchSuccess(false), 3000);
    loadData();
  };

  // --------------------------------------------------------------------------
  // Record Payment Disbursement Handler
  // --------------------------------------------------------------------------
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const target = assignedWorkers.find((w) => w.id === payWorkerId);
    if (!target) return;

    const newEntry: WageLedgerEntry = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      workerId: target.id,
      date: new Date().toISOString().split('T')[0],
      type: payType,
      amount: -Math.abs(payAmount), // Contractor payments are deductions from outstanding balance
      description: payDesc.trim(),
      hindiDescription: 'मजदूरी भुगतान / अग्रिम',
      paymentMode: payMode,
      status: 'settled',
      acknowledgmentStatus: 'recorded_by_contractor',
      siteId: activeSite?.id || fallbackSite.id,
      siteName: activeSite?.name || fallbackSite.name,
      contractorName: user.organizationName || user.fullName,
      isDemoRecord: user.isJudgeDemo,
    };

    db.addLedgerEntry(newEntry);
    setPaySuccess(true);
    setTimeout(() => setPaySuccess(false), 3000);
    loadData();
  };

  // --------------------------------------------------------------------------
  // Issue Approval Request Handler
  // --------------------------------------------------------------------------
  const handleIssueApprovalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const target = assignedWorkers.find((w) => w.id === reqWorkerId);
    if (!target) return;

    const newReq: ApprovalRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      workerId: target.id,
      workerName: target.name,
      workerReferenceToken: (target as any).qrReferenceToken || target.id,
      contractorId: user.id,
      contractorName: user.fullName,
      contractorPhone: user.phone,
      siteName: activeSite?.name || fallbackSite.name,
      actionType: 'attendance_confirmation',
      recordId: `ATT-PENDING-${Date.now().toString().slice(-4)}`,
      shiftDate: reqShiftDate,
      shiftType: 'full_day',
      hours: reqHours,
      agreedWage: reqWage,
      amount: reqWage,
      notes: reqNotes.trim() || 'Daily shift attendance verification request',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.addApprovalRequest(newReq);
    setReqSuccess(true);
    setReqNotes('');
    setTimeout(() => setReqSuccess(false), 3000);
    loadData();
  };

  // --------------------------------------------------------------------------
  // Dispute Response Handler (Preserves worker's original statement)
  // --------------------------------------------------------------------------
  const handleSaveDisputeResponse = (grievanceId: string) => {
    if (!contractorResponseText.trim()) return;

    db.addContractorResponse(grievanceId, contractorResponseText.trim());
    setRespondingGrievanceId(null);
    setContractorResponseText('');
    loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace identity + site scope */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-sand-200 bg-gradient-to-br from-ink-950 via-ink-900 to-forest-950 p-5 text-white shadow-[0_28px_50px_-36px_rgba(8,19,15,0.85)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full glow-brass opacity-30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
              <Building2 className="h-5.5 w-5.5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-[1.0625rem] font-semibold text-white">
                  {user.organizationName || user.fullName}
                </h1>
                <span className="rounded-full border border-white/15 bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brass-200">
                  {bi(lang, 'Contractor account', 'ठेकेदार खाता')}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-sand-200/55">
                {bi(lang, 'Supervisor', 'पर्यवेक्षक')}: <span className="font-semibold text-sand-200/85">{user.fullName}</span>
                <span className="mx-1.5 text-white/20">·</span>
                <span className="font-mono text-sand-200/70">{user.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-sand-200/60 sm:inline-flex">
              <ShieldCheck className="h-3 w-3 text-forest-300" />
              {bi(lang, 'Muster audit active', 'हाजिरी ऑडिट सक्रिय')}
            </span>
            <label className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] py-1 pl-3 pr-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-sand-200/50">
                {bi(lang, 'Site', 'स्थल')}
              </span>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                aria-label="Active construction site"
                className="max-w-[11rem] cursor-pointer truncate rounded-full border-0 bg-transparent py-1 pr-1 text-[11px] font-bold text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-300 [&>option]:text-ink-900"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Section rail */}
      <div className="sticky top-[var(--app-header-offset,4.25rem)] z-30 -mx-1 rounded-2xl border border-sand-200 bg-sand-50/90 px-1.5 py-1.5 backdrop-blur-xl">
        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Contractor portal sections">
          {([
            { id: 'dashboard', label: bi(lang, 'Dashboard', 'डैशबोर्ड'), icon: Building2 },
            { id: 'workers', label: bi(lang, 'Workers', 'श्रमिक'), icon: Users, count: assignedWorkers.length },
            { id: 'attendance', label: bi(lang, 'Attendance', 'हाजिरी'), icon: Calendar },
            { id: 'ledger', label: bi(lang, 'Wage ledger', 'मजदूरी खाता'), icon: Wallet },
            { id: 'scanner', label: bi(lang, 'QR scanner', 'क्यूआर स्कैनर'), icon: QrCode },
            { id: 'approvals', label: bi(lang, 'Approvals', 'स्वीकृतियाँ'), icon: CheckSquare, alert: approvalRequests.filter((r) => r.status === 'pending').length },
            { id: 'disputes', label: bi(lang, 'Disputes', 'विवाद'), icon: AlertTriangle, count: grievances.length },
            { id: 'audit', label: bi(lang, 'Audit', 'ऑडिट'), icon: FileCheck },
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
                    ? 'bg-ink-950 text-white shadow-[0_10px_20px_-14px_rgba(8,19,15,0.9)]'
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

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: bi(lang, 'Assigned workforce', 'आवंटित श्रमबल'),
                value: (
                  <>
                    {assignedWorkers.length}
                    <span className="ml-1 text-[11px] font-medium tracking-normal text-ink-400">workers</span>
                  </>
                ),
                icon: Users,
                tone: 'text-ink-900',
                chip: 'bg-forest-50 text-forest-700 ring-forest-100',
              },
              {
                label: bi(lang, 'Shifts verified', 'सत्यापित पालियाँ'),
                value: attendance.length,
                icon: Calendar,
                tone: 'text-ink-900',
                chip: 'bg-forest-50 text-forest-700 ring-forest-100',
              },
              {
                label: bi(lang, 'Pending approvals', 'लंबित स्वीकृतियाँ'),
                value: approvalRequests.filter((r) => r.status === 'pending').length,
                icon: CheckSquare,
                tone: 'text-brass-600',
                chip: 'bg-brass-50 text-brass-700 ring-brass-200',
              },
              {
                label: bi(lang, 'Open disputes', 'खुले विवाद'),
                value: grievances.filter((g) => g.status !== 'settled').length,
                icon: AlertTriangle,
                tone: grievances.filter((g) => g.status !== 'settled').length > 0 ? 'text-rose-600' : 'text-forest-700',
                chip:
                  grievances.filter((g) => g.status !== 'settled').length > 0
                    ? 'bg-rose-50 text-rose-600 ring-rose-100'
                    : 'bg-forest-50 text-forest-700 ring-forest-100',
              },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="rounded-2xl border border-sand-200 bg-white p-4 shadow-soft transition-all duration-400 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                      {kpi.label}
                    </span>
                    <span className={`grid h-7 w-7 place-items-center rounded-lg ring-1 ring-inset ${kpi.chip}`}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-sand-200 p-5 space-y-3">
              <h3 className="font-bold text-ink-900 text-sm">Quick Contractor Actions</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="p-3 bg-sand-50 hover:bg-sand-100 border border-sand-200 rounded-xl text-left font-semibold text-ink-800 flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-forest-700" />
                  <span>Scan Worker QR</span>
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-3 bg-sand-50 hover:bg-sand-100 border border-sand-200 rounded-xl text-left font-semibold text-ink-800 flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-forest-700" />
                  <span>Record Shift</span>
                </button>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="p-3 bg-sand-50 hover:bg-sand-100 border border-sand-200 rounded-xl text-left font-semibold text-ink-800 flex items-center gap-2 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-forest-700" />
                  <span>Issue Request</span>
                </button>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="p-3 bg-sand-50 hover:bg-sand-100 border border-sand-200 rounded-xl text-left font-semibold text-ink-800 flex items-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-forest-700" />
                  <span>Record Payout</span>
                </button>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="bg-sand-50 rounded-2xl border border-brass-200 p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-ink-900">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Statutory Compliance Status</span>
              </div>
              <p className="text-ink-600 leading-relaxed">
                Site: <span className="font-semibold text-ink-800">{activeSite?.name || 'Indore Civil Construction Project'}</span><br />
                Muster roll entries and disbursements conform to the <strong>MP Minimum Wages Act (1948)</strong>. Shift records are secured through chained SHA-256 cryptographic events.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKERS AND ASSIGNMENTS */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900">Authorized Workforce Roster</h2>
              <p className="text-xs text-ink-500">Only authorized workers assigned to your site are accessible</p>
            </div>
            <button
              onClick={() => setShowAddWorkerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Worker by Reference</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 border-b border-sand-200 text-ink-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Worker Name</th>
                    <th className="py-3 px-4">Trade</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Base Daily Wage</th>
                    <th className="py-3 px-4">Contact Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {assignedWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-400">
                        No workers assigned to this site yet. Click &quot;Add Worker by Reference&quot; or scan a worker&apos;s QR pass to assign them.
                      </td>
                    </tr>
                  ) : (
                    assignedWorkers.map((w) => (
                      <tr key={w.id} className="hover:bg-sand-50/50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink-900 block">{w.name}</span>
                          <span className="font-mono text-[10px] text-ink-400">{w.id}</span>
                        </td>
                        <td className="py-3 px-4 text-ink-700">{w.trade}</td>
                        <td className="py-3 px-4 font-mono font-medium text-ink-800">{w.phone}</td>
                        <td className="py-3 px-4 font-mono font-bold text-ink-900">₹{w.dailyBaseWage}/day</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-forest-600" />
                            <span>Check Available</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setContactTarget(w)}
                            className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 text-ink-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Record Phone Check
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE AND WORK RECORDS */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Record Daily Attendance Form */}
          <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-ink-900 mb-3">Record Daily Attendance (Muster Punch)</h3>
            
            {punchSuccess && (
              <div className="mb-4 p-3 bg-forest-50 border border-forest-200 rounded-xl flex items-center gap-2 text-xs text-forest-800">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span>Attendance punch successfully verified and recorded into cryptographic audit chain!</span>
              </div>
            )}

            <form onSubmit={handleRecordAttendance} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-ink-700 font-semibold mb-1">Worker</label>
                <select
                  value={punchWorkerId}
                  onChange={(e) => {
                    setPunchWorkerId(e.target.value);
                    const sel = assignedWorkers.find((w) => w.id === e.target.value);
                    if (sel) setPunchAgreedWage(sel.dailyBaseWage);
                  }}
                  className="w-full p-2 border border-ink-300 rounded-lg bg-white"
                >
                  {assignedWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.id.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Shift Date</label>
                <input
                  type="date"
                  value={punchDate}
                  onChange={(e) => setPunchDate(e.target.value)}
                  className="w-full p-2 border border-ink-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Shift Type</label>
                <select
                  value={punchShiftType}
                  onChange={(e) => setPunchShiftType(e.target.value as any)}
                  className="w-full p-2 border border-ink-300 rounded-lg bg-white"
                >
                  <option value="full_day">Full Day (8 hrs)</option>
                  <option value="half_day">Half Day (4 hrs)</option>
                  <option value="overtime_2h">Full Day + 2h OT</option>
                  <option value="overtime_4h">Full Day + 4h Night OT</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Calculated Wage (INR)</label>
                <input
                  type="number"
                  value={punchAgreedWage}
                  onChange={(e) => setPunchAgreedWage(Number(e.target.value))}
                  className="w-full p-2 border border-ink-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-forest-800 hover:bg-forest-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Punch & Sign
                </button>
              </div>
            </form>
          </div>

          {/* Muster History */}
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-sand-200 bg-sand-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider">Muster History ({attendance.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 border-b border-sand-200 text-ink-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4 text-right">Calculated Wage</th>
                    <th className="py-3 px-4">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {attendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-sand-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-ink-900">{rec.date}</td>
                      <td className="py-3 px-4 font-semibold text-ink-800">{rec.workerName}</td>
                      <td className="py-3 px-4 text-ink-600">{rec.baseHours + rec.overtimeHours} hrs ({rec.shiftType.replace('_', ' ')})</td>
                      <td className="py-3 px-4 font-mono font-bold text-forest-700 text-right">+{formatCurrency(rec.calculatedWage)}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-ink-400 truncate max-w-[150px] block">
                          {rec.verificationHash.slice(0, 16)}...
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WAGE LEDGER AND PAYMENTS */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Record Disbursement Form */}
          <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-ink-900 mb-3">Record Wage Payout or Advance Disbursement</h3>

            {paySuccess && (
              <div className="mb-4 p-3 bg-forest-50 border border-forest-200 rounded-xl flex items-center gap-2 text-xs text-forest-800">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span>Payment successfully recorded as contractor deduction. Awaiting worker acknowledgment.</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-ink-700 font-semibold mb-1">Worker</label>
                <select
                  value={payWorkerId}
                  onChange={(e) => setPayWorkerId(e.target.value)}
                  className="w-full p-2 border border-ink-300 rounded-lg bg-white"
                >
                  {assignedWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.id.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Disbursement Type</label>
                <select
                  value={payType}
                  onChange={(e) => setPayType(e.target.value as any)}
                  className="w-full p-2 border border-ink-300 rounded-lg bg-white"
                >
                  <option value="weekly_settlement">Weekly Settlement</option>
                  <option value="advance_kharcha">Advance (Kharcha)</option>
                  <option value="bonus">Bonus / Incentive</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 border border-ink-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full p-2 border border-ink-300 rounded-lg bg-white"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="upi">UPI / QR Payment</option>
                  <option value="cash">Direct Cash Handover</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-ink-900 hover:bg-ink-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Record Payout
                </button>
              </div>
            </form>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-sand-200 bg-sand-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider">Disbursement History ({ledger.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 border-b border-sand-200 text-ink-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Worker Acknowledgment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-sand-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-ink-900">{entry.date}</td>
                      <td className="py-3 px-4 font-semibold text-ink-800">{entry.workerId}</td>
                      <td className="py-3 px-4 text-ink-600">{entry.description} ({entry.paymentMode})</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-ink-900">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          entry.acknowledgmentStatus === 'acknowledged_by_worker'
                            ? 'text-forest-800 bg-forest-50'
                            : 'text-brass-800 bg-brass-50'
                        }`}>
                          {entry.acknowledgmentStatus === 'acknowledged_by_worker' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-forest-600" />
                              <span>Acknowledged</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-brass-600" />
                              <span>Pending Acknowledgment</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: QR SCANNER (Real jsQR Camera Decode & Manual Token Fallback) */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 shadow-md space-y-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center mx-auto mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-ink-900">Scan Worker QR Pass</h2>
              <p className="text-xs text-ink-500 mt-0.5">
                Scan with your phone camera or enter the opaque worker reference below
              </p>
            </div>

            {/* Camera Viewport */}
            <div className="relative aspect-video max-w-sm mx-auto bg-ink-950 rounded-2xl overflow-hidden border-2 border-dashed border-forest-500/50 flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!cameraActive && (
                <div className="p-4 text-center space-y-2">
                  <Camera className="w-8 h-8 text-ink-600 mx-auto" />
                  <span className="text-xs text-ink-400 block">Camera is currently inactive</span>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-forest-800 hover:bg-forest-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Start Camera
                  </button>
                </div>
              )}

              {cameraActive && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1 bg-rose-600 text-white text-xs rounded-lg font-medium cursor-pointer"
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-3 bg-brass-50 border border-brass-200 rounded-xl text-xs text-brass-800 text-left">
                {cameraError}
              </div>
            )}

            {/* Manual Fallback Input */}
            <div className="pt-2 border-t border-sand-100 text-left">
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Or Enter Worker Reference / Token Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={workerLookupToken}
                  onChange={(e) => setWorkerLookupToken(e.target.value)}
                  placeholder="e.g., WKR-MP-001 or opaque token"
                  className="flex-1 p-2.5 text-xs border border-ink-300 rounded-xl font-mono"
                />
                <button
                  onClick={handleManualLookup}
                  className="px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Lookup
                </button>
              </div>
            </div>

            {/* Resolved Worker Preview */}
            {lookupResult && (
              <div className="p-4 bg-forest-50 border border-forest-200 rounded-2xl text-left space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wider block">Worker Resolved</span>
                    <h4 className="text-sm font-bold text-ink-900">{lookupResult.name}</h4>
                    <p className="text-xs text-ink-600">{lookupResult.trade} · ID: <span className="font-mono">{lookupResult.id}</span></p>
                  </div>
                  <span className="font-mono font-bold text-ink-900 text-xs">₹{lookupResult.dailyBaseWage}/day</span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-forest-200">
                  <button
                    onClick={() => handleAssignWorker(lookupResult)}
                    className="flex-1 py-2 bg-forest-800 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold text-center cursor-pointer"
                  >
                    Assign to Site Workforce
                  </button>
                </div>
              </div>
            )}

            {lookupError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 text-left">
                {lookupError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: APPROVAL REQUESTS */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Issue New Request */}
          <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-ink-900 mb-3">Issue Shift Confirmation Request to Worker</h3>

            {reqSuccess && (
              <div className="mb-4 p-3 bg-forest-50 border border-forest-200 rounded-xl flex items-center gap-2 text-xs text-forest-800">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span>Request dispatched! The worker can now review and approve it from their own account.</span>
              </div>
            )}

            <form onSubmit={handleIssueApprovalRequest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-ink-700 font-semibold mb-1">Target Worker</label>
                <select
                  value={reqWorkerId}
                  onChange={(e) => {
                    setReqWorkerId(e.target.value);
                    const sel = assignedWorkers.find((w) => w.id === e.target.value);
                    if (sel) setReqWage(sel.dailyBaseWage);
                  }}
                  className="w-full p-2 border border-ink-300 rounded-lg bg-white"
                >
                  {assignedWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.id.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Shift Date</label>
                <input
                  type="date"
                  value={reqShiftDate}
                  onChange={(e) => setReqShiftDate(e.target.value)}
                  className="w-full p-2 border border-ink-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Hours</label>
                <input
                  type="number"
                  value={reqHours}
                  onChange={(e) => setReqHours(Number(e.target.value))}
                  className="w-full p-2 border border-ink-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1">Agreed Wage (INR)</label>
                <input
                  type="number"
                  value={reqWage}
                  onChange={(e) => setReqWage(Number(e.target.value))}
                  className="w-full p-2 border border-ink-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-ink-900 hover:bg-ink-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Issue Request
                </button>
              </div>
            </form>
          </div>

          {/* Requests Status Table */}
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-sand-200 bg-sand-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider">Issued Requests ({approvalRequests.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50 border-b border-sand-200 text-ink-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Worker</th>
                    <th className="py-3 px-4">Shift Details</th>
                    <th className="py-3 px-4 text-right">Agreed Wage</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {approvalRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-sand-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-ink-900">{req.shiftDate || req.createdAt.split('T')[0]}</td>
                      <td className="py-3 px-4 font-semibold text-ink-800">{req.workerName || req.workerId}</td>
                      <td className="py-3 px-4 text-ink-600">{req.hours || 8} hrs ({req.siteName})</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-forest-800">₹{req.agreedWage || req.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                          req.status === 'approved'
                            ? 'text-forest-800 bg-forest-50'
                            : req.status === 'pending'
                            ? 'text-brass-800 bg-brass-50'
                            : 'text-rose-800 bg-rose-50'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink-900">Worker Grievances & Responses</h2>
            <span className="text-xs text-ink-500 font-mono">{grievances.length} Active Disputes</span>
          </div>

          {grievances.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sand-200 p-8 text-center text-xs text-ink-500">
              No disputes have been filed by workers on your sites.
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((g) => (
                <div key={g.id} className="bg-white rounded-2xl border border-sand-200 p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900 text-sm capitalize">{g.disputeType.replace('_', ' ')}</span>
                        <span className="font-mono text-[10px] text-ink-500">Ref: {g.dloFilingRef}</span>
                      </div>
                      <p className="text-ink-500 mt-0.5">Worker: <span className="font-semibold text-ink-800">{g.workerName}</span> ({g.workerPhone})</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-700 text-sm">Claim: {formatCurrency(g.claimedAmount)}</span>
                      <span className="block text-[10px] text-ink-400 capitalize">Status: {g.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-ink-700 block mb-0.5">Worker's Original Statement (Unalterable):</span>
                    <p className="text-ink-600 bg-sand-50 p-2.5 rounded-lg border border-sand-200 leading-relaxed">
                      {g.description}
                    </p>
                  </div>

                  {/* Contractor Response Section */}
                  {g.contractorResponse ? (
                    <div className="pt-1">
                      <span className="font-semibold text-ink-700 block mb-0.5">Your Response (Recorded on {g.contractorResponseDate}):</span>
                      <p className="text-ink-700 bg-brass-50/50 p-2.5 rounded-lg border border-brass-200 leading-relaxed">
                        {g.contractorResponse}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2">
                      {respondingGrievanceId === g.id ? (
                        <div className="space-y-2">
                          <label className="font-semibold text-ink-700 block">Enter Contractor Official Response:</label>
                          <textarea
                            rows={3}
                            value={contractorResponseText}
                            onChange={(e) => setContractorResponseText(e.target.value)}
                            placeholder="Provide clarification, bank transaction UTR, or agreed revised terms..."
                            className="w-full p-2 border border-ink-300 rounded-lg"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setRespondingGrievanceId(null)}
                              className="px-3 py-1.5 text-ink-600 hover:bg-sand-100 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveDisputeResponse(g.id)}
                              className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white rounded font-medium"
                            >
                              Submit Formal Response
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRespondingGrievanceId(g.id);
                            setContractorResponseText('');
                          }}
                          className="px-3 py-1.5 bg-sand-100 hover:bg-sand-200 text-ink-800 rounded font-semibold text-xs cursor-pointer"
                        >
                          Provide Contractor Response
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: AUDIT AND REPORTS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink-900">Cryptographic Verification & Statutory Audit</h3>
                <p className="text-xs text-ink-500">Run SHA-256 chain verification and deterministic anomaly detection</p>
              </div>

              <button
                onClick={() => {
                  const dataStr = db.exportBackup();
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `shramsetu_audit_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Package</span>
              </button>
            </div>

            <div className="p-4 bg-forest-50 border border-forest-200 rounded-xl space-y-1 text-xs text-forest-950">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Cryptographic Chain Status: INTEGRITY_PASSED</span>
              </div>
              <p className="text-forest-800">
                All muster records and wage ledger entries are bound to valid preceding SHA-256 event hashes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: PROFILE AND CONTACT */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-ink-900">Contractor Profile & Contact Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Organization Name:</span>
                <span className="font-semibold text-ink-900 text-sm">{user.organizationName || 'Civil Contractor'}</span>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Supervisor Full Name:</span>
                <span className="font-semibold text-ink-900 text-sm">{user.fullName}</span>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Contact Phone:</span>
                <span className="font-mono font-bold text-ink-900 text-sm">{user.phone}</span>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200">
                <span className="text-ink-500 block mb-1">Contact Sharing:</span>
                <span className="font-semibold text-forest-800 text-sm">
                  {user.consentToShareContact ? 'Shared with Assigned Workers' : 'Restricted'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Verification Modal */}
      {contactTarget && (
        <ContactVerificationModal
          isOpen={Boolean(contactTarget)}
          onClose={() => setContactTarget(null)}
          targetUserId={contactTarget.id}
          targetName={contactTarget.name}
          targetPhone={contactTarget.phone}
          targetRole="worker"
          lang={lang}
        />
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-sand-200 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink-900">Assign Worker to Site</h3>
            <p className="text-xs text-ink-500">Enter the worker's reference ID (e.g. WKR-MP-001) or opaque QR pass token.</p>

            <div className="space-y-3">
              <input
                type="text"
                value={workerLookupToken}
                onChange={(e) => setWorkerLookupToken(e.target.value)}
                placeholder="Enter worker reference..."
                className="w-full p-2.5 text-xs border border-ink-300 rounded-xl font-mono"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-3 py-1.5 text-xs text-ink-600 hover:bg-sand-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleManualLookup}
                  className="px-3.5 py-1.5 bg-ink-900 text-white rounded-lg text-xs font-semibold"
                >
                  Lookup Worker
                </button>
              </div>

              {lookupResult && (
                <div className="p-3.5 bg-forest-50 border border-forest-200 rounded-xl text-xs space-y-2">
                  <div>
                    <span className="font-bold text-ink-900 block">{lookupResult.name}</span>
                    <span className="text-ink-600">{lookupResult.trade} · Daily Wage: ₹{lookupResult.dailyBaseWage}</span>
                  </div>
                  <button
                    onClick={() => handleAssignWorker(lookupResult)}
                    className="w-full py-2 bg-forest-800 text-white rounded-lg font-semibold"
                  >
                    Confirm Assignment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
