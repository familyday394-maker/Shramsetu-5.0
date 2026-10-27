/**
 * Headless render smoke test.
 *
 * Boots a jsdom document, server-renders the whole application tree and every
 * public page, then asserts that key content is present. This catches broken
 * imports, runtime crashes and empty routes without needing a browser.
 *
 * Run with: npx tsx scripts/smoke-render.ts
 */
import { JSDOM } from 'jsdom';
import React from 'react';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:3000/#/home',
  pretendToBeVisual: true,
});

const w = dom.window as unknown as Window & typeof globalThis;
(globalThis as any).window = w;
(globalThis as any).document = w.document;
Object.defineProperty(globalThis, 'navigator', {
  value: w.navigator,
  configurable: true,
  writable: true,
});
(globalThis as any).localStorage = w.localStorage;
(globalThis as any).HTMLElement = w.HTMLElement;
(globalThis as any).Element = w.Element;
(globalThis as any).Node = w.Node;
(globalThis as any).getComputedStyle = w.getComputedStyle;
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).matchMedia = () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
});
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const { renderToString } = await import('react-dom/server');

const results: { name: string; ok: boolean; error?: string; missing?: string[] }[] = [];

const check = (name: string, html: string, needles: string[]) => {
  const missing = needles.filter((needle) => !html.includes(needle));
  results.push({ name, ok: missing.length === 0, missing });
};

try {
  const { default: App } = await import('../src/App.tsx');
  const html = renderToString(React.createElement(App));
  check('App shell (home route)', html, [
    'Shram Setu',
    'Every shift recorded',
    'Create your account',
    'Verified work',
    'Zero-PII QR',
    'Questions workers ask',
    'Senior Bal Vigyan',
  ]);

  const { Home } = await import('../src/components/public/Home');
  const { HowItWorks } = await import('../src/components/public/HowItWorks');
  const { CreateAccount } = await import('../src/components/public/CreateAccount');
  const { SignIn } = await import('../src/components/public/SignIn');
  const { PasswordRecovery } = await import('../src/components/public/PasswordRecovery');
  const { Privacy } = await import('../src/components/public/Privacy');
  const { HelpContact } = await import('../src/components/public/HelpContact');
  const { About } = await import('../src/components/public/About');

  const nav = () => {};
  const pages: [string, React.ComponentType<any>, string[]][] = [
    ['Home', Home, ['Every wage explained']],
    ['HowItWorks', HowItWorks, ['From the first site check-in']],
    ['CreateAccount', CreateAccount, ['Set up your Shram Setu record']],
    ['SignIn', SignIn, ['Sign in to your portal']],
    ['PasswordRecovery', PasswordRecovery, ['Reset your password']],
    ['Privacy', Privacy, ['Privacy']],
    ['HelpContact', HelpContact, ['human on the line']],
    ['About', About, ['Built in Indore']],
  ];

  for (const [name, Component, needles] of pages) {
    try {
      const html = renderToString(
        React.createElement(Component, {
          onNavigate: nav,
          onEnterJudgeDemo: nav,
          lang: 'en',
        })
      );
      check(name, html, needles);
    } catch (error: any) {
      results.push({ name, ok: false, error: error?.message ?? String(error) });
    }
  }
} catch (error: any) {
  results.push({ name: 'App shell', ok: false, error: error?.message ?? String(error) });
}

let failed = 0;
for (const result of results) {
  if (result.ok) {
    console.log(`  PASS  ${result.name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${result.name}`);
    if (result.error) console.log(`        error: ${result.error}`);
    if (result.missing?.length) console.log(`        missing: ${result.missing.join(', ')}`);
  }
}

console.log(`\n${results.length - failed}/${results.length} screens rendered cleanly.`);
process.exit(failed === 0 ? 0 : 1);
