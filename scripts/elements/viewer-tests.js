#!/usr/bin/env node
/* Tests for The Elements page's math (static/games/elements/core.js) and its sound plans (sound.js):
   orbital normalization and nodes, filling order and exceptions against data/elements/elements.json, Slater's rules,
   wavelength -> color, and the sound mappings.   Run: node scripts/elements/viewer-tests.js */
'use strict';
const path = require('path'), fs = require('fs');
const root = path.join(__dirname, '..', '..');
const C = require(path.join(root, 'static/games/elements/core.js'));
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/elements/elements.json'), 'utf8'));
let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) passes++; else { fails++; console.log('FAIL', msg); } }
const M = Math, PI = M.PI;

// 1. radial functions: normalized, with n - l - 1 nodes
let worstR = 0;
for (let n = 1; n <= 7; n++) for (let l = 0; l <= M.min(n - 1, 3); l++) {
  const Z = 1 + (n * 7 + l) % 5, rmax = (3 * n * n + 40 * n) / Z, N = 200000, dr = rmax / N;
  let s = 0, nodes = 0, prev = null;
  for (let i = 0; i <= N; i++) {
    const r = i * dr, R = C.radial(n, l, Z, r), w = (i === 0 || i === N) ? 1 : (i % 2 ? 4 : 2);
    s += w * R * R * r * r;
    if (i > 0 && M.abs(R) > 1e-12) { const sg = M.sign(R); if (prev !== null && sg !== prev) nodes++; prev = sg; }
  }
  s *= dr / 3;
  worstR = M.max(worstR, M.abs(s - 1));
  ok(M.abs(s - 1) < 1e-5, `radial ${n}${'spdf'[l]} norm ${s}`);
  ok(nodes === n - l - 1, `radial ${n}${'spdf'[l]} nodes ${nodes}`);
  // mean radius formula
  let m1 = 0; for (let i = 0; i <= N; i++) { const r = i * dr, R = C.radial(n, l, Z, r), w = (i === 0 || i === N) ? 1 : (i % 2 ? 4 : 2); m1 += w * R * R * r * r * r; }
  m1 *= dr / 3; ok(M.abs(m1 - C.meanR(n, l, Z)) / C.meanR(n, l, Z) < 1e-4, `<r> ${n}${'spdf'[l]}`);
}
console.log('radial functions: worst normalization error', worstR.toExponential(2));

// 2. real spherical harmonics: orthonormal on the sphere; l - |m| nodes in θ, 2|m| sign changes in φ
const harm = []; for (let l = 0; l <= 3; l++) for (let m = -l; m <= l; m++) harm.push([l, m]);
const NT = 2000, NP = 64; let worstY = 0;
const grid = [];
for (let i = 0; i < NT; i++) { // Gauss-like midpoint in cos θ
  const u = -1 + (i + 0.5) * 2 / NT, st = M.sqrt(1 - u * u);
  for (let j = 0; j < NP; j++) { const ph = (j + 0.5) * 2 * PI / NP; grid.push([st * M.cos(ph), st * M.sin(ph), u]); }
}
const dA = (2 / NT) * (2 * PI / NP);
for (let a = 0; a < harm.length; a++) for (let b = a; b < harm.length; b++) {
  let s = 0; const [la, ma] = harm[a], [lb, mb] = harm[b];
  for (const p of grid) s += C.ylm(la, ma, p[0], p[1], p[2]) * C.ylm(lb, mb, p[0], p[1], p[2]);
  s *= dA; const want = a === b ? 1 : 0; worstY = M.max(worstY, M.abs(s - want));
  ok(M.abs(s - want) < 1e-4, `Y(${la},${ma})·Y(${lb},${mb}) = ${s}`);
}
console.log('spherical harmonics: worst orthonormality error', worstY.toExponential(2));
for (const [l, m] of harm) {
  const ph0 = 0.37 + (m < 0 ? 0.11 : 0); let zt = 0, prev = null;
  for (let i = 1; i < 4000; i++) { const th = i / 4000 * PI, v = C.ylm(l, m, M.sin(th) * M.cos(ph0), M.sin(th) * M.sin(ph0), M.cos(th)); if (M.abs(v) < 1e-12) continue; const sg = M.sign(v); if (prev !== null && sg !== prev) zt++; prev = sg; }
  let zp = 0; prev = null; let first = null; const th0 = 1.1;
  for (let j = 0; j <= 4000; j++) { const ph = j / 4000 * 2 * PI + 0.013, v = C.ylm(l, m, M.sin(th0) * M.cos(ph), M.sin(th0) * M.sin(ph), M.cos(th0)); const sg = M.sign(v); if (first === null) first = sg; if (prev !== null && sg !== prev) zp++; prev = sg; }
  ok(zt === l - M.abs(m), `Y(${l},${m}) θ nodes ${zt}`);
  ok(zp === 2 * M.abs(m), `Y(${l},${m}) φ sign changes ${zp}`);
}
ok(C.orbitals(1).map(o => o.name).join() === 'y,z,x', 'p orbital names');
ok(C.orbitals(2).map(o => o.name).join() === 'xy,yz,z²,xz,x²−y²', 'd orbital names');

// 3. sampling: 2p_z points have the right mean radius, <z²>/<r²> = 3/5, and the + lobe on +z
{
  const Z = 3.25, pts = C.sample(2, 1, 0, Z, 40000, C.rng(5), 0.9999);
  let r = 0, z2 = 0, r2 = 0, signOK = 0;
  for (let i = 0; i < 40000; i++) { const x = pts[i * 4], y = pts[i * 4 + 1], z = pts[i * 4 + 2], q = x * x + y * y + z * z; r += M.sqrt(q); z2 += z * z; r2 += q; if ((z > 0) === (pts[i * 4 + 3] > 0)) signOK++; }
  r /= 40000; ok(M.abs(r / C.meanR(2, 1, Z) - 1) < 0.02, `2p sample mean radius ${r}`);
  ok(M.abs(z2 / r2 - 0.6) < 0.01, `2p_z <z²>/<r²> ${z2 / r2}`);
  ok(signOK === 40000, '2p_z phase sign follows z');
  const s3 = C.sample(3, 0, 0, 1, 30000, C.rng(9), 0.9999); let inner = 0, outer = 0;
  for (let i = 0; i < 30000; i++) { const x = s3[i * 4], y = s3[i * 4 + 1], z = s3[i * 4 + 2], rr = M.hypot(x, y, z); if (rr > 7.1) { if (s3[i * 4 + 3] > 0) outer++; } }
  ok(outer > 0, '3s outermost lobe is drawn with the positive color');
}

// 4. Hund filling of orbitals
ok(C.fillOrbitals(6, 2).join() === '2,1,1,1,1', 'd6 boxes');
ok(C.fillOrbitals(3, 1).join() === '1,1,1', 'p3 boxes');
ok(C.fillOrbitals(14, 3).join() === '2,2,2,2,2,2,2', 'f14 boxes');

// 5. configurations from the data: electron counts, shells, Madelung order and the exceptions
const CAP = [2, 6, 10, 14];
function madelungConfig(Z) {
  const subs = []; for (let n = 1; n <= 8; n++) for (let l = 0; l < M.min(n, 4); l++) subs.push({ n, l });
  subs.sort((a, b) => (a.n + a.l) - (b.n + b.l) || a.n - b.n);
  const out = {}; let left = Z;
  for (const s of subs) { if (!left) break; const c = M.min(CAP[s.l], left); out[s.n + 'spdf'[s.l]] = c; left -= c; }
  return out;
}
const mismatches = [], flagged = [];
for (const e of data.elements) {
  const subs = C.parseConfig(e.config.full), shortSubs = C.parseConfig(e.config.short);
  ok(C.electrons(subs) === e.z, `${e.symbol} configuration has ${C.electrons(subs)} electrons`);
  ok(C.electrons(shortSubs) === e.z, `${e.symbol} shorthand has ${C.electrons(shortSubs)} electrons`);
  const sh = []; subs.forEach(s => { sh[s.n - 1] = (sh[s.n - 1] || 0) + s.count; });
  ok(JSON.stringify(sh.map(x => x || 0)) === JSON.stringify(e.shells), `${e.symbol} shells ${e.shells} vs config ${sh}`);
  ok(e.shells.reduce((a, b) => a + b, 0) === e.z, `${e.symbol} shells sum`);
  const mine = {}; subs.forEach(s => { mine[s.label] = s.count; });
  const pred = madelungConfig(e.z), same = Object.keys(pred).every(k => pred[k] === (mine[k] || 0)) && Object.keys(mine).every(k => mine[k] === (pred[k] || 0));
  if (!same) mismatches.push(e.symbol);
  if (e.config.exception) flagged.push(e.symbol);
  // the viewer can build every atom
  const orbs = C.atomOrbitals(e.config.full, e.z);
  ok(orbs.reduce((a, o) => a + o.electrons, 0) === e.z, `${e.symbol} orbitals hold Z electrons`);
  ok(orbs.every(o => o.zeff > 0 && o.r > 0 && isFinite(o.r90)), `${e.symbol} orbital sizes`);
}
ok(mismatches.join() === flagged.join(), `Madelung mismatches ${mismatches.join(' ')} vs flagged exceptions ${flagged.join(' ')}`);
console.log('exceptions to the Madelung order:', mismatches.join(' '));
['Cr', 'Cu', 'Nb', 'Mo', 'Ru', 'Rh', 'Pd', 'Ag', 'Pt', 'Au', 'La', 'Ce', 'Gd', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Cm'].forEach(s => ok(mismatches.includes(s), `${s} is an exception`));

// 6. Slater's rules
function zeff(cfg, Z, n, l) { return C.slaterZeff(C.parseConfig(cfg), Z, n, l); }
ok(M.abs(zeff('1s2 2s2 2p3', 7, 2, 1) - 3.90) < 1e-9, 'N 2p Zeff 3.90');
ok(M.abs(zeff('[Ar] 3d10 4s2', 30, 3, 2) - 8.85) < 1e-9, 'Zn 3d Zeff 8.85');
ok(M.abs(zeff('[Ar] 3d10 4s2', 30, 4, 0) - 4.35) < 1e-9, 'Zn 4s Zeff 4.35');
ok(M.abs(zeff('[Ar] 3d6 4s2', 26, 4, 0) - 3.75) < 1e-9, 'Fe 4s Zeff 3.75');
ok(M.abs(zeff('1s1', 1, 1, 0) - 1) < 1e-9, 'H 1s Zeff 1');
ok(M.abs(C.sizeZ(5.7, 1, 0) - 5.7) < 1e-9, '1s keeps Z\' = Zeff');

// 7. wavelength -> color
function dom(nm) { const c = C.nmToRGB(nm); return c; }
{ const c = dom(450); ok(c[2] > c[0] && c[2] > c[1], '450 nm is blue ' + c); }
{ const c = dom(530); ok(c[1] > 0.9 && c[0] < 0.3 && c[2] < 0.3, '530 nm is green ' + c); }
{ const c = dom(580); ok(c[0] > 0.9 && c[1] > 0.5 && c[2] < 0.2, '580 nm is yellow-orange ' + c); }
{ const c = dom(650); ok(c[0] > 0.9 && c[1] < 0.15 && c[2] < 0.15, '650 nm is red ' + c); }
{ const c = dom(405); ok(c[2] > c[1] && c[0] > c[1], '405 nm is violet ' + c); }
{ const a = dom(400), b = dom(440); ok(M.max(...a) < M.max(...b), 'fades toward the violet end'); }
for (let nm = 380; nm <= 750; nm += 5) { const c = dom(nm); ok(c.every(v => v >= 0 && v <= 1) && M.max(...c) > 0.25, `color in range at ${nm}`); }

// 8. sound mappings
ok(M.abs(C.lineHz(656.279) - 415.3) < 0.2, 'H-alpha -> 415.3 Hz ' + C.lineHz(656.279));
ok(M.abs(C.hzToMidi(C.lineHz(656.279)) - 68) < 0.05, 'H-alpha is G#4');
ok(M.abs(C.lineHz(400) / C.lineHz(800) - 2) < 1e-12, 'halving the wavelength doubles the pitch (intervals kept)');
ok(C.lineHz(750) > 360 && C.lineHz(380) < 720, `visible range maps to ${C.lineHz(750).toFixed(0)}-${C.lineHz(380).toFixed(0)} Hz`);
const fe = data.elements[25];
const mel = C.configMelody(C.parseConfig(fe.config.full));
ok(mel.map(n => n.deg).join('') === '1223343', 'Fe electron melody degrees ' + mel.map(n => n.deg).join(''));
ok(mel[0].midi === 60 && mel[6].midi === 64, 'do = C4, shell 3 = E4');
ok(mel[6].beats > mel[5].beats, 'a fuller subshell is a longer note (3d6 longer than 4s2)');
// the plans in sound.js (needs a window shim)
global.window = { TRBElCore: C };
require(path.join(root, 'static/games/elements/sound.js'));
const S = global.window.TRBElSound;
let silent = 0;
for (const e of data.elements) {
  const chord = S.plan(e, 'chord'), arp = S.plan(e, 'arp'), cfg = S.plan(e, 'config');
  const L = (e.spectrum && e.spectrum.lines) || [];
  ok(chord.length === M.min(16, L.length), `${e.symbol} chord uses its strongest lines`);
  ok(chord.reduce((a, n) => a + n.gain, 0) <= 0.5 + 1e-9, `${e.symbol} chord is not too loud`);
  ok(chord.every(n => n.hz > 350 && n.hz < 730), `${e.symbol} chord in range`);
  for (let i = 1; i < arp.length; i++) ok(arp[i].hz > arp[i - 1].hz && arp[i].t > arp[i - 1].t, `${e.symbol} arpeggio climbs from red to violet`);
  ok(cfg.length === C.parseConfig(e.config.full).length, `${e.symbol} one note per subshell`);
  if (L.length) { const top = L.reduce((a, b) => (b.i > a.i ? b : a)); ok(M.abs(M.max(...chord.map(n => n.gain)) - chord.find(n => M.abs(n.hz - C.lineHz(top.nm)) < 1e-9).gain) < 1e-12, `${e.symbol} strongest line is loudest`); }
  else silent++;
}
console.log('elements with no visible lines (silent in the spectrum modes):', silent);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
