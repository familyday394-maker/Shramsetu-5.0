import React, { useState } from 'react';
import { UserPlus, Check } from 'lucide-react';
import { Worker, SkillLevel, ConstructionSite } from '../types';
import { Language, t } from '../services/i18n';
import { useModalBehavior } from '../hooks/useModalBehavior';
import { speech } from '../services/speech';

interface NewWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorker: (worker: Worker) => void;
  sites: ConstructionSite[];
  lang: Language;
}

export const NewWorkerModal: React.FC<NewWorkerModalProps> = ({
  isOpen,
  onClose,
  onAddWorker,
  sites,
  lang,
}) => {
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [trade, setTrade] = useState('Mason');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('skilled');
  const [dailyBaseWage, setDailyBaseWage] = useState<number>(530);
  const [eShramUAN, setEShramUAN] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-IND-METRO-01');

  const modalRef = useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  // Auto-adjust default wage based on skill level (MP gazette rates)
  const handleSkillChange = (level: SkillLevel) => {
    setSkillLevel(level);
    switch (level) {
      case 'unskilled':
        setDailyBaseWage(412);
        break;
      case 'semi_skilled':
        setDailyBaseWage(465);
        break;
      case 'skilled':
        setDailyBaseWage(530);
        break;
      case 'highly_skilled':
        setDailyBaseWage(620);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const uanClean = eShramUAN.trim() || `10${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const uidLast4 = aadhaarLast4.trim() || `${Math.floor(1000 + Math.random() * 9000)}`;

    const newWorker: Worker = {
      id: `WKR-MP-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      hindiName: hindiName.trim() || name.trim(),
      phone: phone.trim() || '+91 98260 00000',
      trade: trade.trim(),
      skillLevel,
      dailyBaseWage: Number(dailyBaseWage) || 450,
      eShramUAN: uanClean,
      bocwRegistrationNo: `MP-BOCW-IND-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      aadhaarLast4: uidLast4,
      bloodGroup,
      emergencyContact: {
        name: emergencyName.trim() || (lang === 'hi' ? 'पारिवारिक सदस्य' : 'Family Member'),
        phone: emergencyPhone.trim() || '+91 97531 00000',
        relation: 'Relative',
      },
      photoUrl: '/src/assets/images/shram_setu_hero_pass_1792385013356.jpg',
      joinedDate: new Date().toISOString().split('T')[0],
      activeSiteId: siteId,
      bankAccountLast4: `${Math.floor(1000 + Math.random() * 9000)}`,
      ifscCode: 'SBIN0003042',
      upiId: `${phone.replace(/\D/g, '').slice(-10)}@upi`,
    };

    onAddWorker(newWorker);
    onClose();

    if (lang === 'hi') {
      speech.speak(
        `नया कारीगर ${newWorker.hindiName} सफलतापूर्वक पंजीकृत हुआ। स्मार्ट श्रम पास तैयार है।`,
        'hi-IN'
      );
    } else {
      speech.speak(
        `New worker ${newWorker.name} registered successfully. Smart Shram Pass is ready.`,
        'en-IN'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('workerModalTitle', lang)}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-lg space-y-4 rounded-[1.5rem] border border-sand-200 bg-white p-6 shadow-[0_40px_80px_-40px_rgba(8,19,15,0.6)] outline-none">
        
        <div className="flex items-center justify-between pb-3 border-b border-sand-200">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brass-600" />
            <h3 className="text-base font-bold text-ink-900">
              {t('workerModalTitle', lang)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 font-bold text-base cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalFullNameEn', lang)}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radheshyam Sharma"
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalFullNameHi', lang)}
              </label>
              <input
                type="text"
                value={hindiName}
                onChange={(e) => setHindiName(e.target.value)}
                placeholder="उदा. राधेश्याम शर्मा"
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalMobile', lang)}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full font-mono bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalBloodGroup', lang)}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 font-medium"
              >
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="B-">B-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-ink-700 block mb-1">
              {t('workerModalTrade', lang)}
            </label>
            <input
              type="text"
              required
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              placeholder="e.g. Mason, Helper, Carpenter, Electrician"
              className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalSkillLevel', lang)}
              </label>
              <select
                value={skillLevel}
                onChange={(e) => handleSkillChange(e.target.value as SkillLevel)}
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 font-medium"
              >
                <option value="unskilled">{lang === 'hi' ? 'अकुशल (₹412/दिन)' : 'Unskilled (₹412/day)'}</option>
                <option value="semi_skilled">{lang === 'hi' ? 'अर्ध-कुशल (₹465/दिन)' : 'Semi-Skilled (₹465/day)'}</option>
                <option value="skilled">{lang === 'hi' ? 'कुशल कारीगर (₹530/दिन)' : 'Skilled Artisan (₹530/day)'}</option>
                <option value="highly_skilled">{lang === 'hi' ? 'उच्च कुशल (₹620/दिन)' : 'Highly Skilled (₹620/day)'}</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalBaseWage', lang)}
              </label>
              <input
                type="number"
                required
                min="400"
                value={dailyBaseWage}
                onChange={(e) => setDailyBaseWage(Number(e.target.value))}
                className="w-full font-mono font-bold text-forest-700 bg-sand-50 border border-ink-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalUan', lang)}
              </label>
              <input
                type="text"
                value={eShramUAN}
                onChange={(e) => setEShramUAN(e.target.value)}
                placeholder="1009 8472 9102"
                className="w-full font-mono bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalAadhaar', lang)}
              </label>
              <input
                type="text"
                maxLength={4}
                value={aadhaarLast4}
                onChange={(e) => setAadhaarLast4(e.target.value)}
                placeholder="4921"
                className="w-full font-mono bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalEmergencyName', lang)}
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Suman Devi"
                className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <div>
              <label className="font-semibold text-ink-700 block mb-1">
                {t('workerModalEmergencyPhone', lang)}
              </label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 97531 XXXXX"
                className="w-full font-mono bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-ink-700 block mb-1">
              {t('workerModalDeploySite', lang)}
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full bg-sand-50 border border-ink-300 rounded-lg p-2.5 text-ink-900 font-medium"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'hi' ? s.hindiName : s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-sand-100 hover:bg-sand-200 text-ink-700 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {t('workerModalCancel', lang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brass-600 hover:bg-brass-500 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('workerModalSubmit', lang)}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
