import React, { useId, useState } from 'react';
import { Plus } from 'lucide-react';

export interface AccordionItem {
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number | null;
  className?: string;
}

/**
 * Accessible disclosure list with a smooth height transition
 * (grid-template-rows 0fr → 1fr, which animates without measuring).
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpen = 0,
  className = '',
}) => {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className={`divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft ${className}`}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.question} className="group">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-sand-50/80 cursor-pointer sm:px-6"
              >
                <span className="text-sm font-bold text-ink-900 sm:text-[0.9375rem]">
                  {item.question}
                </span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                    isOpen
                      ? 'rotate-45 border-forest-700 bg-forest-700 text-white'
                      : 'border-sand-300 bg-sand-50 text-ink-500 group-hover:border-forest-300 group-hover:text-forest-700'
                  }`}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.2} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[0.8125rem] leading-relaxed text-ink-500 sm:px-6">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
