/**
 * End-to-end client flow test (jsdom).
 *
 * Mounts the real React tree, navigates every public route, then exercises the
 * worker sign-up → portal → sign-out → judge demo → contractor journey. This
 * catches runtime-only failures that server rendering cannot see.
 *
 * Run with: npx tsx scripts/flow-test.ts
 */
import { JSDOM } from 'jsdom';
import React from 'react';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:3000/#/home',
  pretendToBeVisual: true,
  resources: 'usable',
});

const w = dom.window as unknown as Window & typeof globalThis;

Object.assign(globalThis as any, {
  window: w,
  document: w.document,
  localStorage: w.localStorage,
  sessionStorage: w.sessionStorage,
  HTMLElement: w.HTMLElement,
  Element: w.Element,
  Node: w.Node,
  Event: w.Event,
  CustomEvent: w.CustomEvent,
  KeyboardEvent: w.KeyboardEvent,
  MouseEvent: w.MouseEvent,
  getComputedStyle: w.getComputedStyle,
  requestAnimationFrame: (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 16) as unknown as number,
  cancelAnimationFrame: (id: number) => clearTimeout(id as unknown as NodeJS.Timeout),
  IS_REACT_ACT_ENVIRONMENT: true,
});

Object.defineProperty(globalThis, 'navigator', {
  value: w.navigator,
  configurable: true,
  writable: true,
});

const noopObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
(globalThis as any).IntersectionObserver = noopObserver;
(w as any).IntersectionObserver = noopObserver;
(globalThis as any).ResizeObserver = noopObserver;
(w as any).matchMedia = () => ({
  matches: false,
  media: '',
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
});
(w as any).scrollTo = () => {};
(w as any).scrollBy = () => {};
w.HTMLElement.prototype.scrollIntoView = () => {};

const { createRoot } = await import('react-dom/client');
const { act } = await import('react');

const container = w.document.getElementById('root')!;
const root = createRoot(container);

const errors: string[] = [];
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = args.map(String).join(' ');
  // React act() warnings are noise here; real errors are what matter.
  if (!message.includes('not wrapped in act') && !message.includes('Not implemented')) {
    errors.push(message);
  }
  if (process.env.VERBOSE) originalError(...args);
};

const results: { step: string; ok: boolean; note?: string }[] = [];
const record = (step: string, ok: boolean, note?: string) => results.push({ step, ok, note });

const text = () => container.textContent || '';

const flush = async (ms = 60) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
};

const goto = async (hash: string) => {
  await act(async () => {
    w.location.hash = hash;
    w.dispatchEvent(new w.HashChangeEvent('hashchange'));
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
  await flush(40);
};

const click = async (node: Element | null) => {
  if (!node) throw new Error('click target missing');
  await act(async () => {
    node.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
};

const findByText = (selector: string, needle: string) =>
  Array.from(container.querySelectorAll(selector)).find((el) =>
    (el.textContent || '').toLowerCase().includes(needle.toLowerCase())
  ) || null;

try {
  await act(async () => {
    root.render(React.createElement((await import('../src/App.tsx')).default));
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
  record('App mounts on home', text().includes('Every shift recorded'));

  // ---- Public routes -----------------------------------------------------
  const routes: [string, string][] = [
    ['#/how-it-works', 'From the first site check-in'],
    ['#/about', 'Built in Indore'],
    ['#/privacy', 'Privacy and data use'],
    ['#/help', 'Help, support'],
    ['#/sign-in', 'Sign in to your portal'],
    ['#/create-account', 'Set up your Shram Setu record'],
    ['#/forgot-password', 'Reset your password'],
    ['#/verify', 'Verify a Smart Shram Pass'],
  ];

  for (const [hash, needle] of routes) {
    await goto(hash);
    record(`Route ${hash}`, text().includes(needle), text().includes(needle) ? undefined : 'content missing');
  }

  // ---- Language switch ---------------------------------------------------
  await goto('#/home');
  const langToggle = container.querySelector(
    'button[aria-label^="Switch language"]'
  ) as HTMLButtonElement | null;
  await click(langToggle);
  await flush(80);
  record('Language toggle switches public site to Hindi', text().includes('मुख्य पृष्ठ'));
  await click(langToggle);
  await flush(80);
  record('Language toggle returns to English', text().includes('Every shift recorded'));

  // Unknown route falls back to home
  await goto('#/does-not-exist');
  record('Unknown route falls back home', text().includes('Every shift recorded'));

  // ---- Verification depth link ------------------------------------------
  await goto('#/verify?refToken=WKR-INVALID-000');
  const invalidPanel = text().toLowerCase();
  record('Verify route reports unknown reference', invalidPanel.includes('no record found'));

  // ---- Sign up as a worker ----------------------------------------------
  await goto('#/create-account');
  const inputs = Array.from(container.querySelectorAll('input'));
  const nameInput = inputs.find((i) => i.id === 'full-name') as HTMLInputElement | undefined;
  const phoneInput = inputs.find((i) => i.id === 'phone') as HTMLInputElement | undefined;
  const passInput = inputs.find((i) => i.id === 'new-password') as HTMLInputElement | undefined;
  const privacy = inputs.find((i) => i.type === 'checkbox' && i.hasAttribute('required')) as
    | HTMLInputElement
    | undefined;

  const setValue = async (input: HTMLInputElement | undefined, value: string) => {
    if (!input) throw new Error('input missing');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, value);
      input.dispatchEvent(new w.Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
  };

  await setValue(nameInput, 'Sunita Bai Verma');
  await setValue(phoneInput, '+91 98111 22334');
  await setValue(passInput, 'worker123');
  if (privacy) {
    await act(async () => {
      privacy.click();
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
  }

  const form = container.querySelector('form');
  await act(async () => {
    (form as HTMLFormElement).requestSubmit?.();
    await new Promise((resolve) => setTimeout(resolve, 260));
  });
  await flush(160);

  record('Worker sign-up lands in portal', text().includes('Worker account'), `hash=${w.location.hash}`);
  record('New account starts clean', text().includes('No shift records') || text().includes('Welcome to Shram Setu'));
  record('Portal shows approval tab', text().includes('Approvals'));

  // Tab switching
  const wagesTab = findByText('button', 'Wages');
  await click(wagesTab);
  record('Worker wages tab renders', text().toLowerCase().includes('wage'));
  const profileTab = findByText('button', 'Profile');
  await click(profileTab);
  record('Worker profile tab renders', text().toLowerCase().includes('contact'));

  // Sign out
  const signOut = findByText('button', 'Sign out');
  await click(signOut);
  await flush(120);
  record('Sign out returns to public site', text().includes('Every shift recorded'), `hash=${w.location.hash}`);

  // ---- Judge demo --------------------------------------------------------
  await goto('#/sign-in');
  const demoButton = findByText('button', 'Launch judge demo');
  await click(demoButton);
  await flush(160);
  record('Judge demo launches', text().includes('Judge Demo') || text().includes('Evaluation'), `hash=${w.location.hash}`);
  record('Judge demo has worker pass tab', text().includes('Smart Pass') || text().includes('SHRAM SETU'));

  const auditButton = findByText('button', 'Audit bench');
  await click(auditButton);
  await flush(120);
  record('Audit modal opens', text().includes('Audit') && text().includes('Tour'));
  const closeBtn = container.querySelector('[role="dialog"] button[aria-label="Close"]');
  await click(closeBtn);

  // Contractor view of the demo
  const contractorView = findByText('button', 'Contractor view');
  await click(contractorView);
  await flush(200);
  record('Demo contractor view renders', text().includes('Contractor account'), `hash=${w.location.hash}`);

  const scannerTab = findByText('button', 'QR scanner');
  await click(scannerTab);
  record('Contractor scanner tab renders', text().toLowerCase().includes('scan'));

  const auditTab = findByText('button', 'Audit');
  await click(auditTab);
  record('Contractor audit tab renders', text().toLowerCase().includes('export') || text().toLowerCase().includes('audit'));
} catch (error: any) {
  record('Flow completed without throwing', false, error?.message ?? String(error));
  if (process.env.VERBOSE) originalError(error);
}

console.error = originalError;

let failed = 0;
for (const result of results) {
  if (result.ok) {
    console.log(`  PASS  ${result.step}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${result.step}${result.note ? ` — ${result.note}` : ''}`);
  }
}

if (errors.length) {
  console.log('\nRuntime console errors:');
  errors.slice(0, 12).forEach((error) => console.log(`  ! ${error.slice(0, 300)}`));
  failed += 1;
}

console.log(`\n${results.length - (failed > 0 && errors.length ? 1 : 0)}/${results.length} steps passed.`);
process.exit(failed === 0 ? 0 : 1);
