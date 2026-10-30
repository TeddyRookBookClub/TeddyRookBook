#!/usr/bin/env node
/*
  Offline manifests for teddyrookbook.com.

  Run after `hugo --minify`:   node scripts/offline/build-manifests.js [public]

  Writes public/offline/manifests/index.json and one <section>.json per section.
  A section is one entry in the main menu (hugo.toml). Each section lists every file it
  needs: its own pages and files under its URL, plus the pictures, scripts and data its
  pages use. "core" holds the home page, the group pages, the site's style and scripts,
  and the search index; every download includes it.

  Each file is listed as [path, bytes, hash]. The hash is SHA-256 (first 12 hex digits) of
  the file with two kinds of build noise removed, so a rebuild with no real change gives
  the same hashes: the "?v=123456" cache-busting numbers (they come from file times, which
  change on every checkout) and the copyright year in the footer.

  The installable web app (/sw.js, /offline/) and the download kit's updater both compare
  these hashes with the ones they saved, and fetch only files that changed.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const PUB = path.resolve(process.argv[2] || path.join(ROOT, 'public'));
const OUT = path.join(PUB, 'offline', 'manifests');
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const ORIGINS = /^(?:https?:)?\/\/(?:teddyrookbook\.com|www\.teddyrookbook\.com|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)(?=\/|$)/i;
const TEXT = /\.(html?|css|js|mjs|json|xml|txt|svg|csv|md)$/i;

if (!fs.existsSync(path.join(PUB, 'index.html'))) { console.error('No built site at ' + PUB + ' (run hugo first)'); process.exit(1); }

/* ---------- the menu, read from hugo.toml ---------- */
function readMenu() {
  const toml = fs.readFileSync(path.join(ROOT, 'hugo.toml'), 'utf8').split(/\r?\n/);
  const items = []; let cur = null, inParams = false, groups = [];
  const val = s => { s = s.trim(); const m = /^"((?:[^"\\]|\\.)*)"/.exec(s); if (m) return JSON.parse('"' + m[1] + '"'); const n = Number(s.replace(/#.*/, '')); return isNaN(n) ? s : n; };
  let block = '';
  for (const raw of toml) {
    const line = raw.trim();
    if (/^\[\[menu\.main\]\]/.test(line)) { cur = { params: {} }; items.push(cur); inParams = false; block = 'menu'; continue; }
    if (/^\[menu\.main\.params\]/.test(line)) { inParams = true; continue; }
    if (/^\[/.test(line)) { cur = null; block = line; continue; }
    const kv = /^([A-Za-z_]+)\s*=\s*(.+)$/.exec(line);
    if (!kv) continue;
    if (cur) (inParams ? cur.params : cur)[kv[1]] = val(kv[2]);
    else if (block === '[params]' && kv[1] === 'menugroups') groups = JSON.parse(kv[2].replace(/#.*$/, ''));
  }
  return { items: items.filter(i => i.url && i.params.group), groups };
}

/* ---------- files ---------- */
const files = new Map(); // '/math/index.html' -> {size}
(function walk(dir, rel) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name), r = rel + '/' + e.name;
    if (e.isDirectory()) walk(p, r); else if (e.isFile()) files.set(r, { size: fs.statSync(p).size });
  }
})(PUB, '');
for (const f of [...files.keys()]) if (f.startsWith('/offline/manifests/')) files.delete(f);

function excluded(f) {
  return CFG.exclude.some(x => x.startsWith('*') ? f.endsWith(x.slice(1)) : (x.endsWith('/') ? f.startsWith(x) : f === x));
}
const isPage = f => /\.html?$/i.test(f);
function pageFile(u) { // URL path -> file path, or null
  if (u.endsWith('/')) u += 'index.html';
  if (files.has(u)) return u;
  if (!/\.[a-z0-9]+$/i.test(u) && files.has(u + '/index.html')) return u + '/index.html';
  return null;
}

/* ---------- references inside a file ---------- */
const refCache = new Map(), fonts = new Set();
function refsOf(f) {
  if (refCache.has(f)) return refCache.get(f);
  const out = new Set();
  if (!TEXT.test(f) || /\.(xml|txt|md)$/i.test(f)) { refCache.set(f, out); return out; }
  let s; try { s = fs.readFileSync(path.join(PUB, f), 'utf8'); } catch (e) { refCache.set(f, out); return out; }
  s = s.replace(/\\\//g, '/');
  const base = f.replace(/[^/]*$/, '');
  const cands = [];
  if (isPage(f) || /\.svg$/i.test(f)) {
    const re = /\s(?:src|href|data-[\w-]+|content|poster|srcset|action|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi; let m;
    while ((m = re.exec(s))) { const v = m[1] ?? m[2] ?? m[3] ?? ''; v.split(/,\s+/).forEach(p => cands.push([p.trim().split(/\s+/)[0], true])); }
  }
  if (/\.(html?|css|svg)$/i.test(f)) { const re = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi; let m; while ((m = re.exec(s))) cands.push([m[1], true]); }
  { const re = /["'`]((?:https?:)?\/\/[^"'`\s<>]+|\/[A-Za-z0-9_\-][^"'`\s<>]*)["'`]/g; let m; while ((m = re.exec(s))) cands.push([m[1], false]); }
  for (let [v, rel] of cands) {
    if (!v || /^(#|data:|mailto:|tel:|javascript:|blob:)/i.test(v)) continue;
    if (/^https:\/\/fonts\.googleapis\.com\/css/.test(v)) { fonts.add(v.replace(/&amp;/g, '&')); continue; }
    const o = ORIGINS.exec(v); if (o) v = v.slice(o[0].length) || '/';
    else if (/^(?:[a-z]+:)?\/\//i.test(v)) continue;
    v = v.replace(/[?#].*$/, ''); if (!v) continue;
    try { v = decodeURI(v); } catch (e) { }
    if (!v.startsWith('/')) { if (!rel) continue; v = path.posix.normalize(base + v); }
    if (v.endsWith('/')) continue;
    if (files.has(v) && !isPage(v)) out.add(v);
  }
  refCache.set(f, out); return out;
}
function closure(start) { // all non-page files reachable from these files
  const seen = new Set(), q = [...start];
  while (q.length) { const f = q.pop(); for (const r of refsOf(f)) if (!seen.has(r) && !excluded(r)) { seen.add(r); q.push(r); } }
  return seen;
}

/* ---------- sections ---------- */
const menu = readMenu();
const secs = new Map();
const idOf = u => u.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
for (const it of menu.items) {
  const id = idOf(it.url);
  if (!secs.has(id)) secs.set(id, { id, title: it.name, url: it.url, icon: it.params.icon || '', note: it.params.note || '', groups: [], weight: it.weight || 0 });
  const s = secs.get(id); if (!s.groups.includes(it.params.group)) s.groups.push(it.params.group);
}
const prefixes = [...secs.values()].map(s => s.url).sort((a, b) => b.length - a.length);
const ownerOf = f => prefixes.find(p => f.startsWith(p));
const sectionRoots = new Set(prefixes.map(p => p.split('/')[1]));
const online = u => Object.keys(CFG.onlineOnly).find(p => u.startsWith(p));

// core
const corePages = CFG.corePages.concat(['/offline/fallback/']).map(pageFile).filter(Boolean);
const core = new Set(corePages.concat(CFG.coreFiles.filter(f => files.has(f))));
for (const r of closure(core)) core.add(r);

// expansion: a script or style from a folder of its own (like /lang/ or /geog/) brings that whole folder,
// because such scripts often load their data by name at run time.
const rootFiles = new Map();
for (const f of files.keys()) { const r = f.split('/')[1]; if (!rootFiles.has(r)) rootFiles.set(r, []); rootFiles.get(r).push(f); }
function expand(set) {
  const roots = new Set();
  for (const f of set) {
    const parts = f.split('/'); if (parts.length < 3) continue;
    const r = parts[1];
    if (CFG.sharedRoots.includes(r) || sectionRoots.has(r) || !/\.(js|mjs|json|css|wasm)$/i.test(f)) continue;
    roots.add(r);
  }
  for (const r of roots) for (const f of rootFiles.get(r) || []) if (!isPage(f) && !excluded(f)) set.add(f);
}

const owned = new Map(); // id -> files
for (const f of files.keys()) {
  if (excluded(f) || core.has(f)) continue;
  const p = ownerOf(f); const lo = !p && isPage(f) && CFG.leftovers.find(l => f.startsWith(l.prefix)); const id = p ? idOf(p) : (lo ? lo.id : null);
  if (!id) continue;
  if (!owned.has(id)) owned.set(id, []);
  owned.get(id).push(f);
}
for (const o of CFG.leftovers) if (owned.has(o.id)) secs.set(o.id, { id: o.id, title: o.title, url: '', icon: o.icon, note: o.note, groups: [o.group], weight: 9999 });

/* ---------- hashing ---------- */
const hashCache = new Map();
function hashOf(f) {
  if (hashCache.has(f)) return hashCache.get(f);
  let b = fs.readFileSync(path.join(PUB, f));
  if (TEXT.test(f)) b = Buffer.from(b.toString('utf8').replace(/\?v=\d{6,}/g, '?v=').replace(/(&copy;|©)(\s*)(?:19|20)\d\d/g, '$1$2'), 'utf8');
  const h = crypto.createHash('sha256').update(b).digest('hex').slice(0, 12);
  hashCache.set(f, h); return h;
}
function manifest(id, set) {
  const list = [...set].sort().map(f => [f.slice(1), files.get(f).size, hashOf(f)]);
  const bytes = list.reduce((a, x) => a + x[1], 0);
  const hash = crypto.createHash('sha256').update(list.map(x => x.join(' ')).join('\n')).digest('hex').slice(0, 12);
  return { v: 1, id, hash, bytes, files: list };
}

/* ---------- build ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const index = { v: 1, built: new Date().toISOString(), groups: [], sections: {} };
const write = m => fs.writeFileSync(path.join(OUT, m.id + '.json'), JSON.stringify(m));

const cm = manifest('core', core); write(cm);
index.core = { title: 'Site basics', note: 'The home page, menus, styles, search and the offline page. Saved with any section.', bytes: cm.bytes, files: cm.files.length, hash: cm.hash };

for (const s of secs.values()) {
  const why = online(s.url);
  const e = { title: s.title, url: s.url, icon: s.icon, note: s.note };
  if (why) { e.online = why; index.sections[s.id] = e; continue; }
  const set = new Set(owned.get(s.id) || []);
  for (const r of closure([...set])) set.add(r);
  for (const x of (CFG.extra[s.url] || [])) for (const f of files.keys()) if (f.startsWith(x) && !isPage(f) && !excluded(f)) set.add(f);
  expand(set);
  for (const f of core) set.delete(f);
  for (const f of [...set]) { const p = ownerOf(f); if (p && online(p)) set.delete(f); } // never store live-data pages
  if (!set.size) continue;
  const m = manifest(s.id, set); write(m);
  Object.assign(e, { bytes: m.bytes, files: m.files.length, hash: m.hash });
  index.sections[s.id] = e;
}
const byGroup = {};
for (const s of [...secs.values()].sort((a, b) => a.weight - b.weight)) for (const g of s.groups) (byGroup[g] = byGroup[g] || []).push(s.id);
for (const g of menu.groups.concat(Object.keys(byGroup).filter(g => !menu.groups.includes(g)))) if (byGroup[g]) index.groups.push({ name: g, items: byGroup[g].filter(id => index.sections[id]) });
index.fonts = [...fonts].sort();
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));

// summary
const mb = n => (n / 1048576).toFixed(1) + ' MB';
const all = new Set(core); let total = 0;
for (const id of Object.keys(index.sections)) { if (index.sections[id].online) continue; for (const x of JSON.parse(fs.readFileSync(path.join(OUT, id + '.json'))).files) all.add('/' + x[0]); }
for (const f of all) total += files.get(f).size;
console.log('Offline manifests: core ' + mb(cm.bytes) + ', ' + Object.keys(index.sections).length + ' sections, everything together ' + mb(total) + ' in ' + all.size + ' files -> ' + path.relative(process.cwd(), OUT));
if (process.env.VERBOSE) for (const [id, e] of Object.entries(index.sections)) console.log('  ' + id.padEnd(28) + (e.online ? 'online only' : mb(e.bytes).padStart(10) + String(e.files).padStart(7) + ' files'));
