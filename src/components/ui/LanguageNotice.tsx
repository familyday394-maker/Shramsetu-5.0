import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { Language } from '../../services/i18n';
import { getPublicCopy } from '../../services/publicCopy';

/**
 * Honest note for pages whose long-form editorial copy is English-only.
 * Shown only when Hindi is selected, so visitors are never surprised by a
 * half-translated page.
 */
export const LanguageNotice: React.FC<{ lang: Language }> = ({ lang }) => {
  if (lang !== 'hi') return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brass-200 bg-brass-50/70 px-4 py-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brass-200/70 text-brass-800">
        <Languages className="h-3.5 w-3.5" />
      </span>
      <p className="text-[11.5px] leading-relaxed text-brass-900">
        {getPublicCopy(lang).englishOnlyNotice}{' '}
        <span className="inline-flex items-center gap-1 font-semibold text-brass-800">
          <Globe className="h-3 w-3" />
          English below
        </span>
      </p>
    </div>
  );
};
