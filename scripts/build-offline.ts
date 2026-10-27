/**
 * Builds the offline single-file edition of Shram Setu 2.0.
 *
 * Produces `offline/index.html`: one self-contained file containing the whole
 * application (markup, minified script, stylesheet, four typefaces and both
 * photographs) that runs by double-clicking, with no server, no network and no
 * install step. Open it from a USB stick on a laptop in a labour office that
 * has never seen the internet.
 *
 *   npm run build:offline
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from 'vite';
import { transformSync } from 'esbuild';

const root = process.cwd();
const singleDir = path.join(root, 'dist-single');
const parentDir = path.join(root, 'node_modules', '@fontsource-variable');
const outDir = path.join(root, 'offline');
const outFile = path.join(outDir, 'index.html');

/** Photographs under public/assets/images that the interface actually renders. */
const IMAGES = [
  { file: 'shram_setu_hero_pass_1792385013356.jpg', width: 1400, quality: 78 },
  { file: 'construction_site_muster_1792385014214.jpg', width: 1200, quality: 72 },
];

/** Variable-font subsets, embedded so typography survives without the network. */
const FONTS = [
  { family: 'Fraunces', style: 'normal', weight: '100 900', pkg: 'fraunces', file: 'fraunces-latin-wght-normal.woff2' },
  { family: 'Fraunces', style: 'italic', weight: '100 900', pkg: 'fraunces', file: 'fraunces-latin-wght-italic.woff2' },
  { family: 'Plus Jakarta Sans', style: 'normal', weight: '200 800', pkg: 'plus-jakarta-sans', file: 'plus-jakarta-sans-latin-wght-normal.woff2' },
  { family: 'Plus Jakarta Sans', style: 'italic', weight: '200 800', pkg: 'plus-jakarta-sans', file: 'plus-jakarta-sans-latin-wght-italic.woff2' },
  { family: 'JetBrains Mono', style: 'normal', weight: '100 800', pkg: 'jetbrains-mono', file: 'jetbrains-mono-latin-wght-normal.woff2' },
  { family: 'Noto Sans Devanagari', style: 'normal', weight: '100 900', pkg: 'noto-sans-devanagari', file: 'noto-sans-devanagari-devanagari-wght-normal.woff2' },
];

const kb = (input: number | Buffer) => {
  const bytes = Buffer.isBuffer(input) ? input.length : input;
  return `${(bytes / 1024).toFixed(0)} kB`;
};

function compressImage(file: string, width: number, quality: number): Buffer {
  const source = path.join(root, 'public', 'assets', 'images', file);
  const targetDir = path.join(singleDir, '_media');
  const target = path.join(targetDir, 'optimised-' + file);
  fs.mkdirSync(targetDir, { recursive: true });

  try {
    execFileSync(
      'convert',
      [source, '-resize', `${width}x`, '-strip', '-interlace', 'Plane', '-quality', String(quality), target],
      { stdio: 'ignore' }
    );
    return fs.readFileSync(target);
  } catch {
    // ImageMagick is optional: fall back to the original bytes so the build
    // always succeeds on machines that only have Node installed.
    console.warn(`  ! ImageMagick unavailable, embedding ${file} at full size`);
    return fs.readFileSync(source);
  }
}

async function run() {
  console.log('\n▸ Building the application for a single-file bundle…');
  await build({ configFile: 'vite.config.single.ts', logLevel: 'warn' });

  const builtHtmlPath = path.join(singleDir, 'index.html');
  let html = fs.readFileSync(builtHtmlPath, 'utf8');
  const jsMatch = /<script\b[^>]*src="\.\/([^"]+\.js)"[^>]*><\/script>/.exec(html);
  const cssMatch = /<link\b[^>]*rel="stylesheet"[^>]*href="\.\/([^"]+\.css)"[^>]*>/.exec(html);
  if (!jsMatch || !cssMatch) {
    throw new Error('Could not locate the built script/stylesheet inside dist-single/index.html');
  }
  const js = fs.readFileSync(path.join(singleDir, jsMatch[1]), 'utf8');
  const css = fs.readFileSync(path.join(singleDir, cssMatch[1]), 'utf8');

  const problems: string[] = [];

  console.log('▸ Embedding photographs…');
  let bundle = js;
  const assetEntries: string[] = [];
  for (const image of IMAGES) {
    const bytes = compressImage(image.file, image.width, image.quality);
    const dataUri = `data:image/jpeg;base64,${bytes.toString('base64')}`;
    const before = bundle.length;
    const expression = `window.__SS_ASSETS[${JSON.stringify(image.file)}]`;
    // The path only ever appears inside a string literal, so the literal itself
    // must be replaced — quotes included — otherwise the inserted code would be
    // read as text. Two historical shapes exist (public path and a stale
    // `/src/assets/...` photoUrl); the longer one is matched first.
    for (const quote of ['"', "'", '`']) {
      bundle = bundle.split(`${quote}/src/assets/images/${image.file}${quote}`).join(expression);
      bundle = bundle.split(`${quote}/assets/images/${image.file}${quote}`).join(expression);
    }
    if (bundle.includes(`/assets/images/${image.file}`)) {
      problems.push(`${image.file} still referenced as a path`);
    }
    assetEntries.push(`  ${JSON.stringify(image.file)}: ${JSON.stringify(dataUri)}`);
    console.log(`  · ${image.file} → ${kb(bytes)} (${before === bundle.length ? 'not referenced' : 'inlined'})`);
  }

  console.log('▸ Embedding typefaces…');
  let fontCss = '';
  for (const font of FONTS) {
    const fontPath = path.join(parentDir, font.pkg, 'files', font.file);
    if (!fs.existsSync(fontPath)) {
      console.warn(`  ! missing font file ${font.file}, skipping`);
      continue;
    }
    const bytes = fs.readFileSync(fontPath);
    fontCss +=
      `@font-face{font-family:${JSON.stringify(font.family)};font-style:${font.style};` +
      `font-weight:${font.weight};font-display:swap;` +
      `src:url(data:font/woff2;base64,${bytes.toString('base64')}) format('woff2')}\n`;
    console.log(`  · ${font.family} ${font.style} → ${kb(bytes)}`);
  }

  // localStorage can be blocked (some managed browsers, some file:// setups).
  // The fallback keeps the demo usable instead of crashing on first write.
  const storageShim = `(function(){var ok=true;try{var k='__ss_probe';window.localStorage.setItem(k,'1');window.localStorage.removeItem(k);}catch(e){ok=false;}
if(!ok){var mem={};var shim={getItem:function(k){return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null;},setItem:function(k,v){mem[k]=String(v);},removeItem:function(k){delete mem[k];},clear:function(){mem={};},key:function(i){return Object.keys(mem)[i]||null;},get length(){return Object.keys(mem).length;}};
try{Object.defineProperty(window,'localStorage',{value:shim,configurable:true});}catch(e){}
try{Object.defineProperty(window,'sessionStorage',{value:shim,configurable:true});}catch(e){}}}());`;

  const inlineScript = [
    '/* Shram Setu 2.0 — offline edition */',
    storageShim,
    `window.__SS_ASSETS = {\n${assetEntries.join(',\n')}\n};`,
    bundle,
  ]
    .join('\n')
    .replace(/<\/script/gi, '<\\/script');

  // A syntax error here would produce a blank page with no explanation, so the
  // concatenated script is parsed with esbuild before it is embedded.
  transformSync(inlineScript, { loader: 'js', minify: false });

  const inlineStyle = `${fontCss}\n${css}`.replace(/<\/style/gi, '<\\/style');

  console.log('▸ Inlining assets into index.html…');
  // The classic (non-module) bundle must run after #root exists, so the tag is
  // dropped here and re-inserted at the end of <body> below.
  html = html.replace(jsMatch[0], '');
  html = html.replace(cssMatch[0], '<!--APP_STYLE-->');

  // No external requests survive in an offline file.
  html = html.replace(/<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>/gi, '');
  html = html.replace(/<link\b[^>]*rel="manifest"[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="og:image"[^>]*\/?>/gi, '');
  html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi, '');

  html = html.replace('<head>', `<head>\n    <!--\n      Shram Setu 2.0 — offline single-file edition.\n      Everything below is embedded: no server, no network, no install.\n      Generated ${new Date().toISOString().slice(0, 10)} by scripts/build-offline.ts\n    -->`);
  // Function replacers: the payload contains `$&` and backtick sequences that
  // String.replace would otherwise expand as substitution patterns and corrupt
  // the bundle.
  html = html.replace('<!--APP_STYLE-->', () => `<style>\n${inlineStyle}\n</style>`);
  html = html.replace('</body>', () => `<script>\n${inlineScript}\n</script>\n  </body>`);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, html, 'utf8');

  // ---- self-checks -------------------------------------------------------
  if (/<script\b[^>]*src=/i.test(html)) problems.push('a <script src> survived');
  if (/<link\b[^>]*rel="stylesheet"[^>]*href=/i.test(html)) problems.push('an external stylesheet survived');
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) problems.push('Google Fonts link survived');
  if (/\/assets\/images\/[\w.-]+\.(?:jpg|jpeg|png|webp)/i.test(html)) {
    problems.push('an image file path survived');
  }
  if (!html.includes('__SS_ASSETS')) problems.push('asset map missing');
  if (!html.includes('id="root"')) problems.push('#root missing');
  if (!/data:font\/woff2;base64,/.test(html)) problems.push('no embedded fonts');

  const bytes = Buffer.byteLength(html, 'utf8');
  console.log(`\n  ${problems.length === 0 ? '✓' : '✗'} Wrote ${path.relative(root, outFile)} — ${kb(bytes)}`);
  console.log(`    script ${kb(js.length)} · styles ${kb(css.length)} · fonts ${kb(fontCss.length)}`);
  if (problems.length) {
    problems.forEach((problem) => console.error(`  ✗ ${problem}`));
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
