/**
 * Offline edition smoke test.
 *
 * Loads `offline/index.html` from disk in a browser-like DOM and asserts that
 * the single file boots with no network, renders the home screen, can navigate
 * to another route through the hash, and leaves no external resource requests.
 *
 * Run after `npm run build:offline`:  npx tsx scripts/offline-smoke.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const file = path.join(process.cwd(), 'offline', 'index.html');
let failures = 0;
const results: string[] = [];

function check(label: string, ok: boolean, detail = '') {
  results.push(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures += 1;
}

if (!fs.existsSync(file)) {
  console.error('offline/index.html not found — run `npm run build:offline` first.');
  process.exit(1);
}

const html = fs.readFileSync(file, 'utf8');
check('single file exists', true, `${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
check('no external script tags', !/<script\b[^>]*src=/i.test(html));
check('no external stylesheet links', !/<link\b[^>]*rel="stylesheet"[^>]*href=/i.test(html));
check('no Google Fonts requests', !/fonts\.(googleapis|gstatic)\.com/.test(html));
check('photographs embedded', (html.match(/data:image\/jpeg;base64,/g) || []).length >= 2);
check('typefaces embedded', (html.match(/data:font\/woff2;base64,/g) || []).length >= 4);

const consoleErrors: string[] = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (error) => consoleErrors.push(String(error.message)));
virtualConsole.on('error', (...args: unknown[]) => consoleErrors.push(args.map(String).join(' ')));

const dom = new JSDOM(html, {
  url: `file://${file}`,
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    // jsdom does not implement the browser APIs the interface progressively
    // enhances with; the app must run without them.
    const noopObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
    (window as any).IntersectionObserver = noopObserver;
    (window as any).ResizeObserver = noopObserver;
    (window as any).matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    });
    (window as any).scrollTo = () => {};
    (window as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
      setTimeout(() => cb(Date.now()), 0) as unknown as number;
    (window as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
  },
});

const w = dom.window as unknown as Window & typeof globalThis;

await new Promise((resolve) => setTimeout(resolve, 1200));

const root = w.document.getElementById('root');
const text = (root?.textContent || '').replace(/\s+/g, ' ');
check('app mounted', Boolean(root && root.children.length > 0));
check('home screen rendered', text.includes('Every shift recorded'));
const embeddedImages = Array.from(w.document.querySelectorAll('img[src]')).filter((img) =>
  (img.getAttribute('src') || '').startsWith('data:image/')
);
check('photographs render from embedded data', embeddedImages.length > 0, `${embeddedImages.length} img`);
check('no uncaught runtime errors', consoleErrors.length === 0, consoleErrors[0] || '');

// Hash navigation must work from a file:// document.
w.location.hash = '#/how-it-works';
await new Promise((resolve) => setTimeout(resolve, 400));
check('hash routing works offline', (root?.textContent || '').includes('How it works'));

// Subresources must all be embedded. Ordinary hyperlinks (a WhatsApp helpline,
// a policy reference) are allowed to point at the web: they cost nothing until
// someone who happens to be online clicks one.
const remoteSubresources = Array.from(
  w.document.querySelectorAll('img[src], script[src], iframe[src], source[src], link[href]')
)
  .map((el) => el.getAttribute('src') || el.getAttribute('href') || '')
  .filter((url) => /^(https?:)?\/\//i.test(url));
check(
  'no remote subresources referenced by the DOM',
  remoteSubresources.length === 0,
  remoteSubresources.slice(0, 2).join(', ')
);



console.log(results.join('\n'));
console.log(`\n${failures === 0 ? '✓' : '✗'} ${results.length - failures}/${results.length} offline checks passed.\n`);
dom.window.close();
process.exit(failures === 0 ? 0 : 1);
