import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Camera, 
  Volume2, 
  Search,
  Check
} from 'lucide-react';
import { Worker, ConstructionSite, AttendanceRecord, ShiftType } from '../types';
import { Language, t, formatCurrency } from '../services/i18n';
import { speech } from '../services/speech';
import { calculateShiftWage } from '../services/wageEngine';
import { computeSha256Hex, canonicalSerialize } from '../services/cryptoAudit';

interface AttendanceMusterProps {
  worker: Worker;
  sites: ConstructionSite[];
  attendanceList: AttendanceRecord[];
  onMarkAttendance: (record: AttendanceRecord) => void;
  lang: Language;
}

export const AttendanceMuster: React.FC<AttendanceMusterProps> = ({
  worker,
  sites,
  attendanceList,
  onMarkAttendance,
  lang,
}) => {
  // Form states
  const [selectedSiteId, setSelectedSiteId] = useState(worker.activeSiteId || sites[0]?.id);
  const [shiftType, setShiftType] = useState<ShiftType>('full_day');
  const [notes, setNotes] = useState('');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'half_day' | 'overtime'>('all');

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const shiftCalc = calculateShiftWage(worker.dailyBaseWage, shiftType);
  const currentPreviewWage = shiftCalc.totalWageInr;

  const handlePunchAttendance = async () => {
    setIsSimulatingScan(true);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];

    let baseHours = 8;
    let overtimeHours = 0;
    let status: 'present' | 'half_day' | 'overtime' = 'present';

    if (shiftType === 'half_day') {
      baseHours = 4;
      status = 'half_day';
    } else if (shiftType === 'overtime_2h') {
      overtimeHours = 2;
      status = 'overtime';
    } else if (shiftType === 'overtime_4h') {
      overtimeHours = 4;
      status = 'overtime';
    }

    const payloadObj = {
      workerId: worker.id,
      siteId: selectedSite.id,
      date: dateStr,
      timeIn: timeStr,
      shiftType,
      baseHours,
      overtimeHours,
      calculatedWage: currentPreviewWage,
    };

    const genuineSha256 = await computeSha256Hex(canonicalSerialize(payloadObj));

    const newRecord: AttendanceRecord = {
      id: `ATT-${dateStr}-${Date.now().toString().slice(-4)}`,
      workerId: worker.id,
      workerName: worker.name,
      siteId: selectedSite.id,
      siteName: selectedSite.name,
      date: dateStr,
      timeIn: timeStr,
      timeOut: '17:30:00',
      shiftType,
      baseHours,
      overtimeHours,
      calculatedWage: currentPreviewWage,
      status,
      supervisorName: 'Anil Sisodiya (JE)',
      verificationHash: genuineSha256,
      geoVerified: true,
      notes: notes.trim() || undefined,
    };

    onMarkAttendance(newRecord);
    setIsSimulatingScan(false);
    setScanSuccess(true);
    setNotes('');

      // Voice notification
      if (lang === 'hi') {
        speech.speak(
          `हाजिरी दर्ज हो गई है। ${worker.hindiName}। ${
            shiftType === 'half_day' ? 'आधा दिन' : shiftType.includes('overtime') ? 'ओवरटाइम' : 'पूर्ण दिवस'
          }। मजदूरी ₹${currentPreviewWage} आपके मस्टर खाते में जुड़ गई।`,
          'hi-IN'
        );
      } else {
        speech.speak(
          `Attendance marked successfully for ${worker.name}. Wage of ₹${currentPreviewWage} credited to muster ledger.`,
          'en-IN'
        );
      }

      setTimeout(() => {
        setScanSuccess(false);
      }, 4000);
  };

  const handleSpeakHistory = () => {
    const totalPunches = attendanceList.length;
    const totalWages = attendanceList.reduce((sum, a) => sum + a.calculatedWage, 0);

    if (lang === 'hi') {
      speech.speak(
        `आपके कुल ${totalPunches} हाजिरी रिकॉर्ड सत्यापित हैं। कुल अर्जित मजदूरी ₹${totalWages} है। सभी रिकॉर्ड म.प्र. शासन न्यूनतम मजदूरी नियमों अनुसार सुरक्षित हैं।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `You have ${totalPunches} verified muster records, totaling ₹${totalWages} in statutory wages under MP Minimum Wages Act.`,
        'en-IN'
      );
    }
  };

  // Filter attendance records
  const filteredList = attendanceList.filter((record) => {
    const matchesSearch =
      record.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.date.includes(searchQuery) ||
      record.supervisorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Site Status */}
      <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse-ring rounded-full bg-forest-500" />
              <h2 className="text-lg font-bold text-ink-900">
                {t('attendanceTitle', lang)}
              </h2>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              {t('attendanceSubtitle', lang)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakHistory}
              className="btn btn-sm border border-brass-200 bg-brass-50 text-brass-800 hover:bg-brass-100"
            >
              <Volume2 className="w-3.5 h-3.5 text-brass-600" />
              <span>{t('attendanceListenSummary', lang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Punch Interface on Left + Muster Roll Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PUNCH-IN FORM (5 Cols) */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-soft sm:p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brass-600" />
              <span>{t('attendancePunchHeading', lang)}</span>
            </h3>
            <span className="text-[11px] font-mono text-ink-500 bg-sand-100 px-2 py-0.5 rounded">
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>

          {/* Site Selector */}
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1">
              {t('attendanceSelectSiteLabel', lang)}
            </label>
            <div className="relative">
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="field bg-white font-medium"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === 'hi' ? s.hindiName : s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-500 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
              <span className="truncate">{selectedSite?.location}</span>
            </div>
          </div>

          {/* Shift Type Options */}
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">
              {t('attendanceShiftDurationLabel', lang)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShiftType('full_day')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  shiftType === 'full_day'
                    ? 'border-brass-400 bg-brass-50 text-brass-900 font-bold ring-1 ring-brass-300 shadow-soft'
                    : 'border-sand-200 bg-white text-ink-700 hover:-translate-y-0.5 hover:border-ink-300 hover:bg-sand-50'
                }`}
              >
                <div className="text-xs">{t('attendanceShiftFullDay', lang)}</div>
                <div className="text-[11px] text-ink-500 font-mono">
                  {t('attendanceShiftFullDayHours', lang)} · ₹{worker.dailyBaseWage}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShiftType('half_day')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  shiftType === 'half_day'
                    ? 'border-brass-400 bg-brass-50 text-brass-900 font-bold ring-1 ring-brass-300 shadow-soft'
                    : 'border-sand-200 bg-white text-ink-700 hover:-translate-y-0.5 hover:border-ink-300 hover:bg-sand-50'
                }`}
              >
                <div className="text-xs">{t('attendanceShiftHalfDay', lang)}</div>
                <div className="text-[11px] text-ink-500 font-mono">
                  {t('attendanceShiftHalfDayHours', lang)} · ₹{Math.round(worker.dailyBaseWage * 0.5)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShiftType('overtime_2h')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  shiftType === 'overtime_2h'
                    ? 'border-brass-400 bg-brass-50 text-brass-900 font-bold ring-1 ring-brass-300 shadow-soft'
                    : 'border-sand-200 bg-white text-ink-700 hover:-translate-y-0.5 hover:border-ink-300 hover:bg-sand-50'
                }`}
              >
                <div className="text-xs">{t('attendanceShiftOvertime2h', lang)}</div>
                <div className="text-[11px] text-ink-500 font-mono">
                  {t('attendanceShiftOvertime2hHours', lang)} · ₹{Math.round(worker.dailyBaseWage + (worker.dailyBaseWage / 8) * 2)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShiftType('overtime_4h')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  shiftType === 'overtime_4h'
                    ? 'border-brass-400 bg-brass-50 text-brass-900 font-bold ring-1 ring-brass-300 shadow-soft'
                    : 'border-sand-200 bg-white text-ink-700 hover:-translate-y-0.5 hover:border-ink-300 hover:bg-sand-50'
                }`}
              >
                <div className="text-xs">{t('attendanceShiftOvertime4h', lang)}</div>
                <div className="text-[11px] text-ink-500 font-mono">
                  {t('attendanceShiftOvertime4hHours', lang)} · ₹{Math.round(worker.dailyBaseWage + (worker.dailyBaseWage / 8) * 4)}
                </div>
              </button>
            </div>
          </div>

          {/* Wage Calculation Summary */}
          <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-ink-600">
              <span>{t('attendanceBaseRateLabel', lang)}</span>
              <span className="font-mono font-semibold text-ink-800">₹{worker.dailyBaseWage}</span>
            </div>
            {shiftType.includes('overtime') && (
              <div className="flex justify-between items-center text-forest-700 font-medium">
                <span>{t('attendanceOtPremiumLabel', lang)}</span>
                <span className="font-mono font-semibold">
                  +₹{currentPreviewWage - worker.dailyBaseWage}
                </span>
              </div>
            )}
            <div className="border-t border-sand-200 pt-1.5 flex justify-between items-center font-bold text-sm text-ink-900">
              <span>{t('attendanceCalculatedWageLabel', lang)}</span>
              <span className="font-mono text-forest-700 text-base">₹{currentPreviewWage}</span>
            </div>
          </div>

          {/* Work Activity Notes */}
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1">
              {t('attendanceNotesLabel', lang)}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('attendanceNotesPlaceholder', lang)}
              className="w-full text-xs bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-800 focus:outline-none focus:ring-1 focus:ring-brass-500"
            />
          </div>

          {/* Punch Button */}
          <button
            type="button"
            disabled={isSimulatingScan}
            onClick={handlePunchAttendance}
            className="btn btn-gold w-full"
          >
            {isSimulatingScan ? (
              <>
                <Camera className="w-4 h-4 animate-spin" />
                <span>{t('attendancePunchVerifying', lang)}</span>
              </>
            ) : scanSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>{t('attendancePunchSuccess', lang)}</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>{t('attendancePunchButton', lang)}</span>
              </>
            )}
          </button>

          {/* Geofence notice */}
          <div className="flex items-center gap-1.5 text-[10px] text-ink-600 bg-forest-50 text-forest-800 p-2.5 rounded-lg border border-forest-200">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-600 shrink-0" />
            <span>{t('attendanceGeofenceNotice', lang)}</span>
          </div>

        </div>

        {/* MUSTER ROLL HISTORY (7 Cols) */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-soft sm:p-5 lg:col-span-7">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink-900">
                {t('attendanceLedgerTitle', lang)}
              </h3>
              <span className="text-[11px] text-ink-500">
                {filteredList.length} {t('attendanceRecordsFound', lang)}
              </span>
            </div>

            {/* Status Filter buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-sand-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded font-medium cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-600'
                }`}
              >
                {t('attendanceFilterAll', lang)}
              </button>
              <button
                onClick={() => setStatusFilter('present')}
                className={`px-2 py-1 rounded font-medium cursor-pointer ${
                  statusFilter === 'present' ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-600'
                }`}
              >
                {t('attendanceFilterPresent', lang)}
              </button>
              <button
                onClick={() => setStatusFilter('overtime')}
                className={`px-2 py-1 rounded font-medium cursor-pointer ${
                  statusFilter === 'overtime' ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-600'
                }`}
              >
                {t('attendanceFilterOvertime', lang)}
              </button>
              <button
                onClick={() => setStatusFilter('half_day')}
                className={`px-2 py-1 rounded font-medium cursor-pointer ${
                  statusFilter === 'half_day' ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-600'
                }`}
              >
                {t('attendanceFilterHalf', lang)}
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('attendanceSearchPlaceholder', lang)}
              className="w-full text-xs bg-sand-50 border border-ink-300 rounded-lg pl-8 pr-3 py-2 text-ink-800 focus:outline-none focus:ring-1 focus:ring-brass-500"
            />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-sand-200 rounded-xl w-full max-w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 text-ink-600 font-semibold border-b border-sand-200">
                <tr>
                  <th className="py-2.5 px-3">{t('attendanceColDate', lang)}</th>
                  <th className="py-2.5 px-3">{t('attendanceColSite', lang)}</th>
                  <th className="py-2.5 px-3">{t('attendanceColShift', lang)}</th>
                  <th className="py-2.5 px-3 text-right">{t('attendanceColWage', lang)}</th>
                  <th className="py-2.5 px-3 text-right">{t('attendanceColVerification', lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink-400">
                      {t('attendanceNoRecords', lang)}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((record) => (
                    <tr key={record.id} className="hover:bg-sand-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-ink-800 whitespace-nowrap">
                        {record.date}
                        <span className="block text-[10px] text-ink-400 font-sans">
                          {record.timeIn}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-ink-900 block truncate max-w-[170px]" title={record.siteName}>
                          {record.siteName}
                        </span>
                        <span className="text-[10px] text-ink-500 block">
                          Supv: {record.supervisorName}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-medium capitalize text-ink-800">
                          {record.shiftType === 'half_day'
                            ? t('attendanceShiftHalfDay', lang)
                            : record.shiftType === 'overtime_2h'
                            ? t('attendanceShiftOvertime2h', lang)
                            : record.shiftType === 'overtime_4h'
                            ? t('attendanceShiftOvertime4h', lang)
                            : t('attendanceShiftFullDay', lang)}
                        </span>
                        <span className="text-[10px] text-ink-500 block font-mono">
                          {record.baseHours + record.overtimeHours} {t('attendanceTotalHours', lang)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-forest-700 tabular-nums">
                        {formatCurrency(record.calculatedWage)}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[10px] font-mono text-forest-700 bg-forest-50 border border-forest-200 px-1.5 py-0.5 rounded inline-block">
                          ✓ {t('attendanceSignedBadge', lang)}
                        </span>
                        <span className="text-[9px] text-ink-400 block font-mono mt-0.5 truncate max-w-[80px] ml-auto" title={record.verificationHash}>
                          {record.verificationHash.slice(7, 15)}...
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
