import { useEffect, useRef } from 'react';

/**
 * Shared dialog behaviour: Escape to close, body scroll lock, focus capture
 * and restoration. Returns a ref to attach to the dialog panel for focus.
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    window.addEventListener('keydown', onKeyDown);

    // Move focus into the dialog without stealing it on every render.
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.focus({ preventScroll: true });
    }, 40);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  return panelRef;
}
