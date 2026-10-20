#!/usr/bin/env node
/* Checks data/elements/elements.json against schema v1 (the Science Lab's Elements page).
   Usage: node scripts/elements/check-data.js [path/to/elements.json]
   Exits 1 and lists every problem if anything fails. */
'use strict';
var fs = require('fs'), path = require('path');
var file = process.argv[2] || path.join(__dirname, '..', '..', 'data', 'elements', 'elements.json');
var D = JSON.parse(fs.readFileSync(file, 'utf8'));
var errs = [], warns = [];
function err(z, msg) { errs.push((z ? 'Z=' + z + ': ' : '') + msg); }
function isInt(v) { return typeof v === 'number' && Math.floor(v) === v; }
function isNum(v) { return typeof v === 'number' && isFinite(v); }
function str(v) { return typeof v === 'string' && v.trim().length > 0; }
function strOrNull(v) { return v === null || str(v); }

var CATS = ['alkali metal', 'alkaline earth metal', 'transition metal', 'post-transition metal', 'metalloid',
  'reactive nonmetal', 'noble gas', 'lanthanide', 'actinide', 'unknown'];
var KEYS = ['z', 'symbol', 'name', 'category', 'categoryNote', 'group', 'period', 'block', 'row', 'col', 'weight', 'config',
  'shells', 'isotopes', 'mostStable', 'model', 'state', 'stateNote', 'melt', 'boil', 'density', 'en', 'ie1', 'radius',
  'discovery', 'nameOrigin', 'crust', 'found', 'uses', 'fact', 'safety', 'spectrum'];
var SUB = { weight: ['value', 'text', 'kind', 'interval', 'note'], config: ['full', 'short', 'exception', 'predicted', 'note'],
  melt: ['k', 'note'], boil: ['k', 'note'], density: ['value', 'unit', 'note'], model: ['a', 'protons', 'neutrons'],
  discovery: ['by', 'year', 'ancient', 'where', 'note'], spectrum: ['status', 'lines', 'note'] };

// ---- layout rule (same as the Chemistry Ladder's place()) ----
function place(Z) {
  var P = [0, 2, 10, 18, 36, 54, 86, 118], p = 1; while (Z > P[p]) p++;
  var k = Z - P[p - 1], g = null, b, r = p, c;
  if (p === 1) { g = Z === 1 ? 1 : 18; b = 's'; }
  else if (p <= 3) { g = k <= 2 ? k : k + 10; b = k <= 2 ? 's' : 'p'; }
  else if (p <= 5) { g = k; b = k <= 2 ? 's' : k <= 12 ? 'd' : 'p'; }
  else if (k <= 2) { g = k; b = 's'; }
  else if (k === 3) { g = 3; b = 'd'; }
  else if (k <= 17) { b = 'f'; r = p + 3; c = k; }
  else { g = k - 14; b = k <= 26 ? 'd' : 'p'; }
  if (c == null) c = g;
  return { g: g, p: p, b: b, r: r, c: c };
}
// ---- configurations ----
var LL = 'spdf', CAP = { s: 2, p: 6, d: 10, f: 14 };
var SUBS = []; for (var n = 1; n <= 7; n++) for (var l = 0; l < Math.min(4, n); l++) SUBS.push([n, l]);
SUBS.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]; });
function madelung(Z) { var o = {}, left = Z; SUBS.forEach(function (q) { if (left <= 0) return; var e = Math.min(left, CAP[LL[q[1]]]); o[q[0] + LL[q[1]]] = e; left -= e; }); return o; }
function parseCfg(s, z, what) {
  var o = {}, order = [];
  s.split(' ').forEach(function (t) {
    var m = /^(\d)([spdf])(\d+)$/.exec(t);
    if (!m) { err(z, what + ': bad term "' + t + '"'); return; }
    var k = m[1] + m[2], e = +m[3];
    if (+m[1] <= LL.indexOf(m[2])) err(z, what + ': impossible subshell ' + k);
    if (e < 1 || e > CAP[m[2]]) err(z, what + ': ' + t + ' over capacity or empty');
    if (o[k]) err(z, what + ': repeated ' + k);
    o[k] = e; order.push([+m[1], LL.indexOf(m[2])]);
  });
  for (var i = 1; i < order.length; i++) if (order[i][0] < order[i - 1][0] || (order[i][0] === order[i - 1][0] && order[i][1] <= order[i - 1][1])) err(z, what + ': not in n-then-l order');
  return o;
}
function sum(o) { var t = 0; for (var k in o) t += o[k]; return t; }
var CORES = { He: 2, Ne: 10, Ar: 18, Kr: 36, Xe: 54, Rn: 86 };

// ---- top level ----
if (!D.meta || !Array.isArray(D.elements)) err(0, 'top level must be {meta, elements}');
var M = D.meta || {};
['version', 'updated', 'units', 'sources', 'notes', 'categories'].forEach(function (k) { if (!(k in M)) err(0, 'meta.' + k + ' missing'); });
if (JSON.stringify(M.categories) !== JSON.stringify(CATS)) err(0, 'meta.categories differs from the schema list');
['layout', 'weights', 'radius', 'spectra', 'unknowns'].forEach(function (k) { if (!M.notes || !str(M.notes[k])) err(0, 'meta.notes.' + k + ' missing'); });
['weights', 'isotopes', 'ie1', 'en', 'radius', 'physical', 'crust', 'spectra', 'discovery'].forEach(function (k) { if (!M.sources || !str(M.sources[k])) err(0, 'meta.sources.' + k + ' missing'); });
if (D.elements.length !== 118) err(0, 'expected 118 elements, found ' + D.elements.length);

var seenSym = {}, seenCell = {}, nSpec = { ok: 0, few: 0, none: 0 };
D.elements.forEach(function (e, i) {
  var z = e.z;
  KEYS.forEach(function (k) { if (!(k in e)) err(z || i + 1, 'missing key ' + k); });
  Object.keys(e).forEach(function (k) { if (KEYS.indexOf(k) < 0) err(z, 'unexpected key ' + k); });
  for (var k in SUB) if (e[k] && typeof e[k] === 'object') SUB[k].forEach(function (s) { if (!(s in e[k])) err(z, 'missing ' + k + '.' + s); });
  if (z !== i + 1) err(i + 1, 'z out of order (' + z + ')');
  if (!/^[A-Z][a-z]?$/.test(e.symbol)) err(z, 'bad symbol'); if (seenSym[e.symbol]) err(z, 'duplicate symbol'); seenSym[e.symbol] = 1;
  if (!str(e.name)) err(z, 'empty name');
  if (/Aluminium|Caesium|Sulphur/.test(e.name)) err(z, 'use American spelling');
  if (CATS.indexOf(e.category) < 0) err(z, 'bad category ' + e.category);
  if (!strOrNull(e.categoryNote)) err(z, 'categoryNote empty string');
  if (e.category === 'unknown' && !str(e.categoryNote)) err(z, 'unknown category needs a note');
  if (z >= 57 && z <= 71 && e.category !== 'lanthanide') err(z, 'La–Lu should be lanthanide');
  if (z >= 89 && z <= 103 && e.category !== 'actinide') err(z, 'Ac–Lr should be actinide');

  // position
  var p = place(z);
  if (e.group !== p.g || e.period !== p.p || e.block !== p.b || e.row !== p.r || e.col !== p.c)
    err(z, 'position ' + [e.group, e.period, e.block, e.row, e.col] + ' should be ' + [p.g, p.p, p.b, p.r, p.c]);
  var cell = e.row + ',' + e.col; if (seenCell[cell]) err(z, 'cell ' + cell + ' shared with Z=' + seenCell[cell]); seenCell[cell] = z;

  // weight
  var w = e.weight || {};
  if (!isNum(w.value) || w.value < 1 || w.value > 300) err(z, 'weight.value');
  if (['standard', 'interval', 'mass number'].indexOf(w.kind) < 0) err(z, 'weight.kind');
  if (!str(w.text)) err(z, 'weight.text');
  if (w.kind === 'mass number') {
    if (w.text !== '[' + w.value + ']' || !isInt(w.value)) err(z, 'mass-number weight text should be "[A]"');
    if (!e.mostStable || e.mostStable.a !== w.value) err(z, 'bracketed mass number should match mostStable.a');
  } else {
    if (Math.abs(parseFloat(w.text) - w.value) > 1e-9) err(z, 'weight.text and value disagree');
    if (Math.abs(w.value - z * 2.5) > z * 0.6 + 2) err(z, 'weight out of range for Z');
  }
  if (w.kind === 'interval') {
    var m = /^\[([\d.]+), ([\d.]+)\]$/.exec(w.interval || '');
    if (!m) err(z, 'interval format'); else if (!(+m[1] - 0.005 <= w.value && w.value <= +m[2] + 0.005)) err(z, 'conventional value far outside interval'); // IUPAC's rounded conventional values for O and Tl sit just outside
  } else if (w.interval !== null) err(z, 'interval must be null');

  // configuration
  var c = e.config || {}, full = parseCfg(c.full || '', z, 'config.full');
  if (sum(full) !== z) err(z, 'config.full has ' + sum(full) + ' electrons');
  var sm = /^(?:\[(He|Ne|Ar|Kr|Xe|Rn)\] ?)?(.*)$/.exec(c.short || '');
  var short = sm[2] ? parseCfg(sm[2], z, 'config.short') : {}, core = sm[1] ? CORES[sm[1]] : 0;
  if (core) { var co = madelung(core); for (var ck in co) short[ck] = (short[ck] || 0) + co[ck]; }
  if (JSON.stringify(Object.keys(short).sort().map(function (k) { return k + short[k]; })) !== JSON.stringify(Object.keys(full).sort().map(function (k) { return k + full[k]; })))
    err(z, 'config.short does not expand to config.full');
  if (z > 2 && !core) err(z, 'config.short should use a noble-gas core');
  var md = madelung(z), same = Object.keys(md).length === Object.keys(full).length && Object.keys(md).every(function (k) { return md[k] === full[k]; });
  if (c.exception !== !same) err(z, 'config.exception should be ' + !same);
  if (typeof c.predicted !== 'boolean' || c.predicted !== (z >= 104)) err(z, 'config.predicted should be ' + (z >= 104));
  if (!strOrNull(c.note)) err(z, 'config.note empty string');

  // shells
  if (!Array.isArray(e.shells) || e.shells.reduce(function (a, b) { return a + b; }, 0) !== z) err(z, 'shells do not sum to Z');
  else {
    var sh = []; for (var k2 in full) { var nn = +k2[0]; sh[nn - 1] = (sh[nn - 1] || 0) + full[k2]; }
    for (var j = 0; j < sh.length; j++) sh[j] = sh[j] || 0;
    if (JSON.stringify(sh) !== JSON.stringify(e.shells)) err(z, 'shells ' + e.shells + ' do not match config (' + sh + ')');
    e.shells.forEach(function (n2, j2) { if (n2 > 2 * (j2 + 1) * (j2 + 1)) err(z, 'shell ' + (j2 + 1) + ' over 2n²'); });
    if (e.shells.length !== e.period && z !== 46) err(z, 'number of shells should equal the period'); // Pd: [Kr] 4d10, no fifth-shell electron
  }

  // isotopes, most stable, model
  if (!Array.isArray(e.isotopes)) err(z, 'isotopes not an array');
  else if (e.isotopes.length) {
    var tot = 0, prev = 101;
    e.isotopes.forEach(function (s) {
      if (!isInt(s.a) || s.a < z || s.a > 3 * z + 10) err(z, 'isotope mass number ' + s.a);
      if (!isNum(s.abundance) || s.abundance <= 0 || s.abundance > 100) err(z, 'isotope abundance ' + s.abundance);
      if (s.abundance > prev) err(z, 'isotopes not most abundant first'); prev = s.abundance; tot += s.abundance;
      if (!strOrNull(s.halfLife)) err(z, 'isotope halfLife empty string');
    });
    if (Math.abs(tot - 100) > 0.05) err(z, 'isotope abundances sum to ' + tot.toFixed(4));
  }
  var ms = e.mostStable;
  if (ms !== null) {
    if (!isInt(ms.a) || !str(ms.halfLife) || !isNum(ms.halfLifeS) || ms.halfLifeS <= 0) err(z, 'mostStable fields');
    if (!strOrNull(ms.note)) err(z, 'mostStable.note empty string');
  }
  var radioOnly = z === 43 || z === 61 || z >= 83;
  if (radioOnly && !ms) err(z, 'radioactive element needs mostStable');
  if (!radioOnly && ms) err(z, 'element with a stable isotope should have mostStable null');
  if (!e.isotopes.length && !ms) err(z, 'no isotope at all');
  var md2 = e.model || {};
  if (md2.protons !== z || md2.neutrons !== md2.a - z || md2.neutrons < 0) err(z, 'model numbers');
  var want = e.isotopes.length ? e.isotopes[0].a : (ms && ms.a);
  if (md2.a !== want) err(z, 'model.a should be ' + want);

  // physical
  if (['solid', 'liquid', 'gas', 'unknown'].indexOf(e.state) < 0) err(z, 'state');
  if (e.state === 'unknown' && !str(e.stateNote)) err(z, 'unknown state needs stateNote');
  ['melt', 'boil'].forEach(function (f) {
    var t = e[f] || {};
    if (t.k !== null && (!isNum(t.k) || t.k <= 0 || t.k > 7000)) err(z, f + '.k out of range');
    if (t.k === null && !str(t.note)) err(z, f + '.k null without a note');
    if (!strOrNull(t.note)) err(z, f + '.note empty string');
  });
  if (e.melt.k !== null && e.boil.k !== null && e.melt.k >= e.boil.k) err(z, 'melts above its boiling point');
  if (e.melt.k !== null && e.boil.k !== null) {
    var T = 298.15, st = T < e.melt.k ? 'solid' : T < e.boil.k ? 'liquid' : 'gas';
    if (e.state !== 'unknown' && st !== e.state) err(z, 'state ' + e.state + ' disagrees with melt/boil (' + st + ')');
  }
  var d = e.density || {};
  if (['g/cm3', 'g/L'].indexOf(d.unit) < 0) err(z, 'density.unit');
  if ((e.state === 'gas') !== (d.unit === 'g/L')) err(z, 'gases use g/L, others g/cm3');
  if (d.value !== null && (!isNum(d.value) || d.value <= 0 || d.value > (d.unit === 'g/L' ? 15 : 30))) err(z, 'density out of range');
  if (d.value === null && !str(d.note)) err(z, 'density null without a note');
  if (e.en !== null && (!isNum(e.en) || e.en < 0.6 || e.en > 4)) err(z, 'en out of range');
  if (e.ie1 !== null && (!isNum(e.ie1) || e.ie1 < 3 || e.ie1 > 25)) err(z, 'ie1 out of range (eV)');
  if (e.radius !== null && (!isInt(e.radius) || e.radius < 25 || e.radius > 300)) err(z, 'radius out of range (pm)');
  if (e.crust !== null && (!isNum(e.crust) || e.crust <= 0 || e.crust > 500000)) err(z, 'crust out of range');
  if (z <= 102 && e.ie1 === null) err(z, 'ie1 is measured for Z <= 103');

  // text
  var ds = e.discovery || {};
  if (typeof ds.ancient !== 'boolean') err(z, 'discovery.ancient');
  if (ds.ancient) { if (ds.year !== null || ds.by !== null) err(z, 'ancient: year and by must be null'); if (!str(ds.note)) err(z, 'ancient element needs a note'); }
  else { if (!isInt(ds.year) || ds.year < 1600 || ds.year > 2026) err(z, 'discovery.year'); if (!str(ds.by) || !str(ds.where)) err(z, 'discovery.by/where'); }
  if (!strOrNull(ds.note)) err(z, 'discovery.note empty string');
  ['nameOrigin', 'found', 'fact'].forEach(function (f) { if (!str(e[f])) err(z, f + ' empty'); });
  if (!Array.isArray(e.uses) || e.uses.length < 1 || e.uses.length > 4 || !e.uses.every(str)) err(z, 'uses must be 1–4 strings');
  if (!strOrNull(e.safety)) err(z, 'safety empty string');
  var text = [e.categoryNote, e.nameOrigin, e.found, e.fact, e.safety, ds.note, ds.where].concat(e.uses).join(' ');
  if (/genuinely|honestly|straightforward|book club/i.test(text)) err(z, 'banned word in text');
  if (/\b(weapons?|bombs?|chain reactions?|enrich\w*|critical mass|warheads?|fallout)\b/i.test(text)) err(z, 'off-limits topic in text');

  // spectrum
  var sp = e.spectrum || {};
  if (['ok', 'few', 'none'].indexOf(sp.status) < 0) err(z, 'spectrum.status'); else nSpec[sp.status]++;
  var ls = sp.lines || [];
  if (sp.status === 'none' && (ls.length || !str(sp.note))) err(z, 'status none needs no lines and a note');
  if (sp.status === 'few' && !(ls.length >= 1 && ls.length < 3)) err(z, 'status few means 1–2 lines');
  if (sp.status === 'ok' && ls.length < 3) err(z, 'status ok needs 3+ lines');
  var last = 0, top = 0;
  ls.forEach(function (x) {
    if (!isNum(x.nm) || x.nm < 380 || x.nm > 750) err(z, 'line ' + x.nm + ' outside 380–750 nm');
    if (x.nm <= last) err(z, 'lines not sorted ascending'); last = x.nm;
    if (!isNum(x.i) || x.i <= 0 || x.i > 1) err(z, 'line i not in (0, 1]'); top = Math.max(top, x.i);
    if (x.rel !== null && (!isNum(x.rel) || x.rel <= 0)) err(z, 'line rel');
  });
  if (ls.length && top !== 1) err(z, 'strongest line should have i = 1');
  if (ls.length && ls.some(function (x) { return x.rel !== null; })) {
    var mx = Math.max.apply(null, ls.map(function (x) { return x.rel || 0; }));
    ls.forEach(function (x) { if (x.rel !== null && Math.abs(x.i - x.rel / mx) > 1e-3) err(z, 'i should be rel / strongest'); });
  }
});

// a few anchors that must never drift
var A = { 1: ['H', 1.008, '1s1'], 6: ['C', 12.011, '[He] 2s2 2p2'], 24: ['Cr', 51.9961, '[Ar] 3d5 4s1'], 26: ['Fe', 55.845, '[Ar] 3d6 4s2'],
  29: ['Cu', 63.546, '[Ar] 3d10 4s1'], 46: ['Pd', 106.42, '[Kr] 4d10'], 64: ['Gd', 157.25, '[Xe] 4f7 5d1 6s2'], 79: ['Au', 196.96657, '[Xe] 4f14 5d10 6s1'],
  92: ['U', 238.02891, '[Rn] 5f3 6d1 7s2'], 103: ['Lr', 266, '[Rn] 5f14 7s2 7p1'] };
for (var az in A) { var e2 = D.elements[az - 1]; if (!e2 || e2.symbol !== A[az][0] || e2.weight.value !== A[az][1] || e2.config.short !== A[az][2]) err(+az, 'anchor check failed'); }
var h = D.elements[0].spectrum.lines.filter(function (x) { return Math.abs(x.nm - 656.28) < 0.05; });
if (!h.length || h[0].i !== 1) err(1, 'H-alpha (656.28 nm) should be the strongest hydrogen line');
var na = D.elements[10].spectrum.lines.filter(function (x) { return Math.abs(x.nm - 588.995) < 0.01; });
if (!na.length || na[0].i !== 1) err(11, 'Na D2 (589.0 nm) should be the strongest sodium line');

if (errs.length) { console.log('FAIL: ' + errs.length + ' problem(s)'); errs.forEach(function (s) { console.log('  ' + s); }); process.exit(1); }
console.log('OK: 118 elements; spectra ok ' + nSpec.ok + ', few ' + nSpec.few + ', none ' + nSpec.none + '.');
