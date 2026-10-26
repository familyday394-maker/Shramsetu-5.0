import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  FileCheck, 
  ShieldCheck, 
  Check, 
  Phone
} from 'lucide-react';
import { Worker, ConstructionSite, AttendanceRecord } from '../types';
import { Language, t, formatCurrency, getLocalizedTrade } from '../services/i18n';
import { speech } from '../services/speech';
import { APP_CONFIG } from '../config';
import { computeSha256Hex, canonicalSerialize } from '../services/cryptoAudit';

interface ContractorPortalProps {
  workers: Worker[];
  sites: ConstructionSite[];
  onBulkPunchAttendance: (records: AttendanceRecord[]) => void;
  lang: Language;
}

export const ContractorPortal: React.FC<ContractorPortalProps> = ({
  workers,
  sites,
  onBulkPunchAttendance,
  lang,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(workers.map((w) => w.id));
  const [lookupQuery, setLookupQuery] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState(false);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const toggleWorkerSelection = (id: string) => {
    if (selectedWorkerIds.includes(id)) {
      setSelectedWorkerIds(selectedWorkerIds.filter((wId) => wId !== id));
    } else {
      setSelectedWorkerIds([...selectedWorkerIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedWorkerIds.length === workers.length) {
      setSelectedWorkerIds([]);
    } else {
      setSelectedWorkerIds(workers.map((w) => w.id));
    }
  };

  const handleExecuteBulkPunch = async () => {
    if (selectedWorkerIds.length === 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const newRecords: AttendanceRecord[] = await Promise.all(
      selectedWorkerIds.map(async (wId) => {
        const w = workers.find((item) => item.id === wId)!;
        const payload = {
          workerId: w.id,
          siteId: selectedSite.id,
          date: dateStr,
          timeIn: timeStr,
          wage: w.dailyBaseWage,
        };
        const genuineHash = await computeSha256Hex(canonicalSerialize(payload));

        return {
          id: `ATT-${dateStr}-${w.id}-${Date.now().toString().slice(-4)}`,
          workerId: w.id,
          workerName: w.name,
          siteId: selectedSite.id,
          siteName: selectedSite.name,
          date: dateStr,
          timeIn: timeStr,
          timeOut: '17:30:00',
          shiftType: 'full_day',
          baseHours: 8,
          overtimeHours: 0,
          calculatedWage: w.dailyBaseWage,
          status: 'present',
          supervisorName: 'Anil Sisodiya (JE)',
          verificationHash: genuineHash,
          geoVerified: true,
          notes: `Bulk supervisor verified roll on ${selectedSite.name}`,
        };
      })
    );

    onBulkPunchAttendance(newRecords);
    setBulkSuccess(true);

    if (lang === 'hi') {
      speech.speak(
        `सुपरवाइजर द्वारा ${selectedWorkerIds.length} कामगारों की हाजिरी मस्टर रोल में दर्ज कर दी गई है।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `Bulk muster attendance verified for ${selectedWorkerIds.length} crew workers on site.`,
        'en-IN'
      );
    }

    setTimeout(() => setBulkSuccess(false), 4000);
  };

  // Lookup worker verification result
  const lookupWorker = workers.find(
    (w) =>
      w.eShramUAN.replace(/\s/g, '').includes(lookupQuery.replace(/\s/g, '')) ||
      w.id.toLowerCase() === lookupQuery.trim().toLowerCase() ||
      w.name.toLowerCase().includes(lookupQuery.trim().toLowerCase()) ||
      w.hindiName.includes(lookupQuery.trim())
  );

  return (
    <div className="space-y-6">
      
      {/* Contractor Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {t('contractorTitle', lang)}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('contractorSubtitle', lang)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 text-slate-800 rounded-lg py-1.5 px-3 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'hi' ? s.hindiName : s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Site Spotlight with Documentary Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-w-0">
        
        {/* Left: Site Info & Compliance Stats */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 min-w-0">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] text-orange-700 font-bold uppercase tracking-wider block">
                  {t('contractorActiveProject', lang)}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'hi' ? selectedSite.hindiName : selectedSite.name}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {selectedSite.safetyRating}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('contractorLeadContractor', lang)}</span>
                <span className="font-bold text-slate-900 text-xs block truncate" title={selectedSite.contractorName}>
                  {selectedSite.contractorName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate block">{selectedSite.contractorPhone}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('contractorCategory', lang)}</span>
                <span className="font-bold text-slate-900 text-xs block truncate">{selectedSite.projectType}</span>
                <span className="text-[10px] text-emerald-600 truncate block">{t('contractorDept', lang)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('contractorWorkforce', lang)}</span>
                <span className="font-mono font-bold text-slate-900 text-sm block tabular-nums">
                  {selectedSite.activeWorkers} {lang === 'hi' ? 'कारीगर' : 'Artisans'}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">{t('contractorShramRegd', lang)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('contractorAuditCleared', lang)}</span>
            </div>
            <span className="text-[11px] font-mono text-orange-400 font-bold">19 Oct 2026</span>
          </div>
        </div>

        {/* Right: Site Photo from image generator */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-slate-900 min-w-0">
          <img
            src="/assets/images/construction_site_muster_1792385014214.jpg"
            alt="Site muster verification in Madhya Pradesh"
            className="w-full h-full min-h-[220px] object-cover object-center"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('/images/')) {
                target.src = '/images/construction_site_muster_1792385014214.jpg';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
            <span className="font-semibold block">{t('contractorInspectTitle', lang)}</span>
            <span className="text-[11px] text-slate-300">{t('contractorInspectSub', lang)}</span>
          </div>
        </div>

      </div>

      {/* Crew Bulk Attendance Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span>{t('contractorBulkHeading', lang)}</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {t('contractorBulkSubtitle', lang)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md font-medium cursor-pointer"
            >
              {selectedWorkerIds.length === workers.length ? t('contractorDeselectAll', lang) : t('contractorSelectAll', lang)}
            </button>

            <button
              onClick={handleExecuteBulkPunch}
              disabled={selectedWorkerIds.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {bulkSuccess ? <Check className="w-3.5 h-3.5" /> : <FileCheck className="w-3.5 h-3.5" />}
              <span>
                {bulkSuccess 
                  ? t('contractorBulkSuccess', lang)
                  : t('contractorPunchCrewBtn', lang, { count: selectedWorkerIds.length })}
              </span>
            </button>
          </div>
        </div>

        {/* Worker crew cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {workers.map((w) => {
            const isSelected = selectedWorkerIds.includes(w.id);
            return (
              <div
                key={w.id}
                onClick={() => toggleWorkerSelection(w.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent div
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">
                      {lang === 'hi' ? w.hindiName : w.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {getLocalizedTrade(w.trade, lang)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                      ₹{w.dailyBaseWage}/day
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono text-slate-400 block">{w.id.slice(-6)}</span>
                  <span className="text-[10px] text-slate-600 font-mono">UID •{w.aadhaarLast4}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Worker Pass Fast Verification Lookup Tool */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-orange-600" />
            <span>{t('contractorLookupHeading', lang)}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {t('contractorLookupSubtitle', lang)}
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder={t('contractorLookupPlaceholder', lang)}
            className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button
            onClick={() => setLookupQuery('1009 8472 9102')}
            className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
          >
            {t('contractorLookupDemoBtn', lang)}
          </button>
        </div>

        {/* Lookup Result Box */}
        {lookupWorker ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-950 text-sm">
                  {lang === 'hi' ? lookupWorker.hindiName : lookupWorker.name}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                {t('contractorLookupVerifiedBadge', lang)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">{t('passCardUanLabel', lang)}</span>
                <span className="font-bold">XXXX XXXX {lookupWorker.eShramUAN.replace(/\s/g, '').slice(-4)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">{t('passCardBocwLabel', lang)}</span>
                <span className="font-bold">{lookupWorker.bocwRegistrationNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">{t('passCardTradeLabel', lang)}:</span>
                <span className="font-bold text-slate-900">{getLocalizedTrade(lookupWorker.trade, lang)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">{t('contractorLookupMandatoryWage', lang)}</span>
                <span className="font-bold text-emerald-700">₹{lookupWorker.dailyBaseWage}/day</span>
              </div>
            </div>
          </div>
        ) : lookupQuery.trim() ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
            {t('contractorLookupNotFound', lang)}
          </div>
        ) : null}

      </div>

    </div>
  );
};
