import React, { useState } from 'react';
import { Phone, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, HelpCircle, X } from 'lucide-react';
import { ManualContactCheckRecord } from '../types';
import { auth } from '../services/auth';
import { Language } from '../services/i18n';

interface ContactVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetName: string;
  targetPhone: string;
  targetRole: 'worker' | 'contractor';
  onCompleted?: (record: ManualContactCheckRecord) => void;
  lang?: Language;
}

export const ContactVerificationModal: React.FC<ContactVerificationModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetName,
  targetPhone,
  targetRole,
  onCompleted,
  lang = 'en',
}) => {
  const [outcome, setOutcome] = useState<ManualContactCheckRecord['outcome']>('confirmed_match');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const record = auth.recordManualContactCheck(targetUserId, targetPhone, outcome, notes);
      if (record && onCompleted) {
        onCompleted(record);
      }
      onClose();
    } catch (err) {
      console.error('Failed to record manual check:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs no-print">
      <div 
        role="dialog" 
        aria-modal="true"
        className="bg-white rounded-2xl max-w-lg w-full border border-sand-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-ink-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-600 flex items-center justify-center text-white shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Manual Phone Verification</h3>
              <p className="text-xs text-ink-300">Mutual workplace contact verification check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-400 hover:text-white hover:bg-ink-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal & Governance Notice */}
        <div className="bg-brass-50/80 border-b border-brass-200/80 px-6 py-3 flex items-start gap-2.5 text-xs text-brass-900">
          <AlertTriangle className="w-4 h-4 text-brass-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important Notice:</strong> This manual phone check is a mutual human cross-check between workplace counterparts. It does <strong>not</strong> constitute a government identity document verification or statutory background check.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-sand-50 p-3.5 rounded-xl border border-sand-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-500">Contact Target:</span>
              <span className="font-semibold text-ink-800">{targetName} ({targetRole})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Registered Phone:</span>
              <span className="font-mono font-bold text-ink-900">{targetPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Target Identifier:</span>
              <span className="font-mono text-ink-600">{targetUserId}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">
              Call & Verification Outcome
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-sand-200 hover:bg-sand-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="outcome"
                  value="confirmed_match"
                  checked={outcome === 'confirmed_match'}
                  onChange={() => setOutcome('confirmed_match')}
                  className="text-forest-600 focus:ring-forest-500"
                />
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <div>
                  <span className="font-semibold text-ink-800">Confirmed Match:</span>
                  <span className="text-ink-500 ml-1">Spoke directly with counterpart, identity and shift details matched.</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-sand-200 hover:bg-sand-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="outcome"
                  value="unreachable"
                  checked={outcome === 'unreachable'}
                  onChange={() => setOutcome('unreachable')}
                  className="text-brass-600 focus:ring-brass-500"
                />
                <HelpCircle className="w-4 h-4 text-brass-600 shrink-0" />
                <div>
                  <span className="font-semibold text-ink-800">Unreachable:</span>
                  <span className="text-ink-500 ml-1">Call unanswered, switched off, or network unavailable.</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-sand-200 hover:bg-sand-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="outcome"
                  value="details_mismatch"
                  checked={outcome === 'details_mismatch'}
                  onChange={() => setOutcome('details_mismatch')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-semibold text-ink-800">Details Mismatch:</span>
                  <span className="text-ink-500 ml-1">Person denied being associated with this trade, site, or name.</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Verification Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Called on 25-Oct at 11:15 AM. Verified Masonry work history on Indore Metro site."
              rows={3}
              className="w-full text-xs p-2.5 border border-ink-300 rounded-lg focus:ring-1 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-700 hover:bg-sand-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-forest-700 hover:bg-forest-600 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Record Cross-Check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
