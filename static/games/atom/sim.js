/* Build an Atom: the page. Draws the atom, the element card, the periodic table and the chart of nuclides on one canvas,
   runs the Half-life scene, the controls and the missions. The data and rules live in model.js (window.AtomModel). */
(function () {
  'use strict';
  var LAB = window.TRBLab, AM = window.AtomModel;
  var root = document.getElementById('atom-lab');
  if (!root || !LAB || !AM) return;
  function $(id) { return document.getElementById(id); }
  var view = $('atom-view'), cv = $('atom-cv'), K = LAB.canvas(cv), ctx = K.c;
  var reduced = LAB.reduced, st = LAB.store('atom');
  var C = { ink: '#dbe7ef', muted: '#8fb3c6', dim: '#5d7f92', line: 'rgba(120,170,200,.25)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', p: '#ff8787', n: '#c3cfd9', e: '#74c0fc', box: 'rgba(11,27,39,.82)' };
  var CAT = { nonmetal: '#63e6be', noble: '#b197fc', alkali: '#ff8787', alkearth: '#ffa94d', metalloid: '#74c0fc', halogen: '#f9a8d4', transition: '#ffd479', post: '#a9c4d4' };
  var KIND_COL = { stable: C.green, slow: C.green, radio: C.gold, gone: C.red, unseen: C.red, beyond: C.red, neutron: C.gold, neutrons: C.red, empty: C.muted };
  var SHELL_COL = ['#74c0fc', '#63e6be', '#ffd479', '#f9a8d4', '#b197fc'];
  var MAXN = 70, GA = Math.PI * (3 - Math.sqrt(5));
  var FONT = 'system-ui,-apple-system,"Segoe UI",sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';

  // ---------- state ----------
  var S = {
    scene: 'build', z: 0, n: 0, e: 0, info: AM.nucleus(0, 0),
    nucleons: [], electrons: [], view: st.get('view', 'shells') === 'cloud' ? 'cloud' : 'shells', built: st.get('built', {}) || {},
    drag: null, fly: [], fx: [], anim: null, clock: 0, cardFlash: 0, lastZ: 0, hover: null, cloud: [], cloudAt: -1
  };
  var H = { iso: AM.SAMPLES[0], n0: 1000, times: null, flags: null, branch: null, t: 0, tMax: 6, playing: true, speed: 1, left: 0, hist: [], halfAt: null, done: false, dating: null, flash: [], seed: 1 };
  var SPEEDS = [0.5, 1, 2, 4], SPEED_TXT = ['½×', '1×', '2×', '4×'], speedIx = 1;
  var L = {}; // layout

  // ---------- controls ----------
  var el = {
    scenes: $('atom-scenes'), build: $('atom-build'), half: $('atom-half'), pause: $('atom-pause'), speed: $('atom-speed'), reset: $('atom-reset'),
    pN: $('atom-p-n'), nN: $('atom-n-n'), eN: $('atom-e-n'), neutral: $('atom-neutral'), decay: $('atom-decay'), views: $('atom-views'), jump: $('atom-jump'),
    rEl: $('atom-r-el'), rIso: $('atom-r-iso'), rA: $('atom-r-a'), rQ: $('atom-r-q'), rNuc: $('atom-r-nuc'), rHl: $('atom-r-hl'), rAb: $('atom-r-ab'), rSh: $('atom-r-sh'), rCf: $('atom-r-cf'),
    note: $('atom-note'), live: $('atom-live'), quiz: $('atom-quiz'), quizFb: $('atom-quiz-fb'),
    iso: $('atom-iso'), size: $('atom-size'), newS: $('atom-new'), date: $('atom-date'), dateBox: $('atom-datebox'), guess: $('atom-guess'), guessO: $('atom-guess-o'), check: $('atom-check'),
    hIso: $('atom-h-iso'), hHl: $('atom-h-hl'), hTo: $('atom-h-to'), hT: $('atom-h-t'), hLeft: $('atom-h-left'), hExp: $('atom-h-exp'), hHalf: $('atom-h-half'), hUse: $('atom-h-use')
  };

  var MISSIONS = [
    { id: 'hydrogen', title: 'Hydrogen', goal: 'Build the simplest atom: one proton with one electron.' },
    { id: 'carbon', title: 'Carbon-12', goal: 'Build a neutral carbon-12 atom: 6 protons, 6 neutrons, 6 electrons.' },
    { id: 'ion', title: 'Make an ion', goal: 'Make a sodium ion, Na⁺ (one electron short), or a chloride ion, Cl⁻ (one extra), with a stable nucleus.' },
    { id: 'c14', title: 'Carbon-14', goal: 'Make carbon-14, a radioactive isotope, and answer why it is unstable.' },
    { id: 'neon', title: 'Full shells', goal: 'Fill the first two electron shells completely with a neutral, stable atom. Which element is it?' },
    { id: 'heavy', title: 'The heaviest stable atom', goal: 'Build the heaviest atom on this table that is stable: the most protons and neutrons that never decay.' },
    { id: 'halflife', title: 'Half-life', goal: 'In the Half-life scene, watch a sample of 100 or more nuclei until half of them have decayed, and read off the half-life.' },
    { id: 'dating', title: 'Carbon dating', goal: 'Date a mystery sample from how much carbon-14 is left, to within 4%.' }
  ];
  var PICK = {
    hydrogen: function () { showScene('build'); setAtom(0, 0, 0, true); sayNow('Drag one proton (red) and one electron (blue) into the atom. Or tap them.'); },
    carbon: function () { showScene('build'); setAtom(0, 0, 0, true); sayNow('Carbon has 6 protons. Add 6 protons, 6 neutrons and 6 electrons.'); },
    ion: function () { showScene('build'); setAtom(11, 12, 11, true); sayNow('This is a neutral sodium atom. Pull one electron out of it.'); },
    c14: function () { showScene('build'); setAtom(6, 6, 6, true); sayNow('This is carbon-12. Add two more neutrons.'); },
    neon: function () { showScene('build'); setAtom(0, 0, 0, true); sayNow('The first shell holds 2 electrons, the second holds 8. How many protons will you need?'); },
    heavy: function () { showScene('build'); setAtom(36, 48, 36, true); sayNow('Krypton-84. Krypton is the last element here. How many neutrons can it hold and stay stable?'); },
    halflife: function () { showScene('half'); pickIso('c14'); setSize(1000); newSample(); sayNow('Watch the count. When half the nuclei are gone, one half-life has passed.'); },
    dating: function () { showScene('half'); startDating(); }
  };
  var MS = LAB.missions($('atom-missions'), 'atom', MISSIONS, function (id) { toastQ = []; if (PICK[id]) PICK[id](); });
  // toasts: answers to what you just did show at once; finished missions wait their turn; small news is dropped when busy
  var toastQ = [], toastAt = -10;
  function now() { return performance.now() / 1000; }
  function say(text, low) {
    if (low) { if (toastQ.length || now() - toastAt < 2.8) return; }
    toastQ.push({ text: text, low: !!low }); if (toastQ.length > 3) toastQ.shift(); pumpToasts();
  }
  function sayNow(text) { toastQ = toastQ.filter(function (q) { return q.mission; }); toastAt = now(); LAB.toast(view, text); }
  function pumpToasts() { if (toastQ.length && now() - toastAt > 2.8) { toastAt = now(); LAB.toast(view, toastQ.shift().text); } }
  function complete(id, text) { if (MS.done(id)) { toastQ = toastQ.filter(function (q) { return !q.low; }); toastQ.push({ text: '✓ ' + MISSIONS.filter(function (m) { return m.id === id; })[0].title + ': ' + text, mission: true }); pumpToasts(); } }

  // ---------- words ----------
  var SUPN = function (v) { return AM.sup(v); };
  function chargeText(q) { return q === 0 ? '' : (Math.abs(q) === 1 ? '' : SUPN(Math.abs(q))) + (q > 0 ? '⁺' : '⁻'); }
  function isoName(z, a) { var E = AM.el(z); return E ? E.name + '-' + a : ''; }
  function pct(f) { if (f >= 1) return '100%'; var p = f * 100, d = p >= 99.99 ? 4 : p >= 99 ? 3 : p >= 1 ? 2 : p >= 0.1 ? 3 : -1; return (d < 0 ? String(Number(p.toPrecision(2))) : p.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')) + '%'; }
  function numWord(v) { return v.toLocaleString('en-US'); }
  function nucleusLine(info, z, n) {
    var E = AM.el(z), a = z + n;
    switch (info.kind) {
      case 'empty': return { head: 'Empty', text: 'Drag in a proton to start. The number of protons decides the element.' };
      case 'neutron': return { head: 'A lone neutron', text: 'A free neutron is radioactive. Half of a group of free neutrons turn into protons in about 10 minutes.' };
      case 'neutrons': return { head: 'Not a nucleus', text: 'Neutrons alone don’t stick together. Add a proton.' };
      case 'stable': return { head: 'Stable', text: info.abundance ? pct(info.abundance) + ' of the ' + E.name.toLowerCase() + ' found in nature' : 'Stable' };
      case 'slow': return { head: 'Radioactive, but barely', text: 'Half-life ' + AM.halfLifeText(info.sec) + ', far longer than the age of the universe. ' + (info.abundance ? pct(info.abundance) + ' of natural ' + E.name.toLowerCase() + '.' : '') };
      case 'radio': return { head: 'Radioactive', text: AM.modesText(info.modes) + ' · half-life ' + (info.sec === null ? 'not yet measured' : (info.flag === '~' ? 'not yet measured (about ' + AM.halfLifeText(info.sec) + ')' : (info.flag === '<' ? 'under ' : info.flag === '>' ? 'over ' : '') + AM.halfLifeText(info.sec))) + (info.abundance ? ' · ' + pct(info.abundance) + ' of natural ' + E.name.toLowerCase() : '') };
      case 'gone': var m0 = info.modes[0].m; return { head: 'Falls apart at once', text: (m0 === 'a' ? 'It splits into two helium-4 nuclei' : m0 === 'n' ? 'A neutron drips off' : m0 === '2n' ? 'Two neutrons drip off' : m0 === '2p' ? 'Two protons fly off' : 'A proton flies off') + (info.sec ? ', in about ' + AM.halfLifeText(info.sec) : ' almost instantly') + '.' };
      case 'unseen': return { head: 'Never observed', text: 'Nobody has detected ' + E.name.toLowerCase() + '-' + a + ', though its neighbors are known. It probably falls apart too fast to be seen.' };
      case 'beyond': return { head: 'Never made', text: (n > z ? 'Too many neutrons' : 'Too few neutrons') + ': nobody has made ' + (E ? E.name.toLowerCase() + '-' + a : 'this nucleus') + '. Nuclei this far from the stable ones last a split second at most, if they hold together at all.' };
    }
    return { head: '', text: '' };
  }
  function whyText(info, z, n) {
    if (info.kind !== 'radio' && info.kind !== 'gone' && info.kind !== 'slow') return '';
    var stab = AM.stableIsotopes(z); if (!stab.length) return '';
    var lo = stab[0] - z, hi = stab[stab.length - 1] - z, E = AM.el(z);
    if (n > hi) return 'Too many neutrons for ' + z + ' proton' + (z > 1 ? 's' : '') + ': stable ' + E.name.toLowerCase() + ' has ' + (lo === hi ? lo : lo + ' to ' + hi) + '.';
    if (n < lo) return 'Too few neutrons for ' + z + ' proton' + (z > 1 ? 's' : '') + ': stable ' + E.name.toLowerCase() + ' has ' + (lo === hi ? lo : lo + ' to ' + hi) + '.';
    return 'It sits between stable isotopes, but this mix of protons and neutrons still has a lower-energy neighbor to decay into.';
  }

  function extraLine(info) {
    var z = S.z, E = AM.el(z); if (!E) return '';
    if (info.kind === 'stable' || info.kind === 'slow') {
      var st2 = AM.stableIsotopes(z);
      return st2.length === 1 ? 'The only stable isotope of ' + E.name.toLowerCase() + '.' : 'Stable ' + E.name.toLowerCase() + ': ' + st2.map(function (a) { return E.sym + '-' + a; }).join(', ') + '.';
    }
    return whyText(info, z, S.n);
  }
  // ---------- building ----------
  function rnd(seed) { return AM.rng(seed); }
  function makeNucleons(z, n) {
    var arr = [], r = rnd(z * 131 + n * 7 + 3), i, p = [];
    for (i = 0; i < z + n; i++) p.push(i < z);
    for (i = p.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = p[i]; p[i] = p[j]; p[j] = t; }
    for (i = 0; i < p.length; i++) arr.push({ p: p[i], x: L.cx, y: L.cy, ph: r() * 6.28 });
    return arr;
  }
  function setAtom(z, n, e, instant) {
    S.z = z; S.n = n; S.e = e;
    S.nucleons = makeNucleons(z, n);
    S.electrons = []; for (var i = 0; i < e; i++) S.electrons.push({ x: L.cx, y: L.cy });
    targets(); if (instant || reduced) snap();
    changed(true);
  }
  function snap() { S.nucleons.forEach(function (o) { o.x = o.tx; o.y = o.ty; }); S.electrons.forEach(function (o) { o.x = o.tx; o.y = o.ty; }); }
  function nucleonR() { var a = Math.max(1, S.z + S.n); return Math.max(3.6, Math.min(L.R * 0.062, 11, L.R * 0.31 / Math.sqrt(a + 2))); }
  function nucRadius(a) { return a ? nucleonR() * (0.95 * Math.sqrt(a) + 0.6) : 0; }
  function shellRadii(count) {
    var rin = Math.max(nucRadius(S.z + S.n) + nucleonR() * 2.2, L.R * 0.24), slots = Math.max(3, count), gap = (L.R - rin) / slots, out = [];
    for (var k = 0; k < count; k++) out.push(rin + gap * (k + 0.75));
    return out;
  }
  function targets() {
    var s = nucleonR() * 0.95, a = S.nucleons.length, i;
    for (i = 0; i < a; i++) { var r = s * Math.sqrt(i + 0.5), th = i * GA; S.nucleons[i].tx = L.cx + r * Math.cos(th); S.nucleons[i].ty = L.cy + r * Math.sin(th); S.nucleons[i].slot = i; }
    var sh = AM.shells(S.z, S.electrons.length), radii = shellRadii(sh.length), idx = 0;
    S.shells = sh; S.radii = radii;
    for (var k = 0; k < sh.length; k++) for (var j = 0; j < sh[k]; j++) {
      var o = S.electrons[idx++], ang = -Math.PI / 2 + k * 0.45 + j * 2 * Math.PI / sh[k];
      o.shell = k; o.tx = L.cx + radii[k] * Math.cos(ang); o.ty = L.cy + radii[k] * Math.sin(ang);
    }
  }
  function pending(kind) { var c = 0; for (var i = 0; i < S.fly.length; i++) if (S.fly[i].add === kind) c++; return c; }
  function canAdd(kind, flying) {
    var z = S.z + pending('p') - (flying === 'p' ? 1 : 0), n = S.n + pending('n') - (flying === 'n' ? 1 : 0), e = S.e + pending('e') - (flying === 'e' ? 1 : 0);
    if (kind === 'p' && z >= 36) { sayNow('This lab stops at krypton, element 36.'); return false; }
    if (kind === 'n' && n >= MAXN) { sayNow('That’s as many neutrons as this lab holds.'); return false; }
    if (kind === 'e' && !z) { sayNow('Add a proton first: electrons need a nucleus to hold them.'); return false; }
    if (kind === 'e' && e >= z + 3) { sayNow(S.z ? 'No atom holds that many extra electrons.' : 'Add a proton first: electrons need a nucleus to hold them.'); return false; }
    return true;
  }
  function add(kind, x, y, flying) {
    if (!canAdd(kind, flying)) return;
    if (kind === 'e') { S.e++; S.electrons.push({ x: x, y: y }); }
    else {
      if (kind === 'p') S.z++; else S.n++;
      S.nucleons.push({ p: kind === 'p', x: x, y: y, ph: Math.random() * 6.28 });
    }
    targets(); if (reduced) snap();
    S.fx.push({ x: x, y: y, t: 0, dur: 0.45, col: C[kind], r: 18 });
    changed();
  }
  function remove(kind, idx) {
    var o = null;
    if (kind === 'e') { if (!S.e) return null; if (idx === undefined || idx < 0) idx = S.electrons.length - 1; o = S.electrons.splice(idx, 1)[0]; S.e--; }
    else {
      var want = kind === 'p';
      if (want ? !S.z : !S.n) return null;
      if (idx === undefined || idx < 0 || S.nucleons[idx].p !== want) { for (var i = S.nucleons.length - 1; i >= 0; i--) if (S.nucleons[i].p === want) { idx = i; break; } }
      o = S.nucleons.splice(idx, 1)[0]; if (want) S.z--; else S.n--;
    }
    targets(); if (reduced) snap();
    changed();
    return o;
  }
  function flyTo(kind, x0, y0, x1, y1, dur, done) { S.fly.push({ kind: kind, x0: x0, y0: y0, x1: x1, y1: y1, t: 0, dur: reduced ? 0.01 : dur, done: done }); }
  function tapAdd(kind) {
    if (!canAdd(kind)) return;
    var tr = L.trays[kind], tx = L.cx, ty = L.cy;
    if (kind === 'e') { var sh = AM.shells(S.z, S.e + 1), rr = shellRadii(sh.length); tx = L.cx + rr[sh.length - 1] * 0.7; ty = L.cy - rr[sh.length - 1] * 0.7; }
    flyTo(kind, tr.cx, tr.cy, tx, ty, 0.3, function () { add(kind, tx, ty); });
    S.fly[S.fly.length - 1].add = kind;
  }
  function tapRemove(kind) {
    var o = remove(kind); if (!o) return;
    var tr = L.trays[kind]; flyTo(kind, o.x, o.y, tr.cx, tr.cy, 0.3);
  }
  function loadElement(z, n) {
    if (n === undefined) n = AM.commonIsotope(z) - z;
    setAtom(z, n, z);
  }

  // after any change: readouts, missions, the element record
  var liveTimer = 0;
  function changed(silent) {
    var z = S.z, n = S.n, e = S.e, a = z + n, E = AM.el(z), info = AM.nucleus(z, n);
    S.info = info;
    if (z !== S.lastZ) { S.cardFlash = 1; S.lastZ = z; }
    if (E && (info.kind === 'stable' || info.kind === 'slow' || info.kind === 'radio') && !S.built[z]) {
      S.built[z] = 1; st.set('built', S.built);
      var cnt = Object.keys(S.built).length;
      if (!silent || cnt > 1) say('New element for your table: ' + E.name + ' (' + cnt + ' of 36)', true);
    }
    // panel
    el.pN.textContent = z; el.nN.textContent = n; el.eN.textContent = e;
    var q = z - e;
    el.rEl.textContent = E ? E.name + ' · ' + E.sym + ' · ' + z : (n ? 'none (no protons)' : '—');
    el.rIso.textContent = E ? isoName(z, a) : '—';
    el.rA.textContent = a ? a + ' (' + z + ' + ' + n + ')' : '0';
    el.rQ.textContent = (q > 0 ? '+' : q < 0 ? '−' : '') + Math.abs(q) + (z ? (q === 0 ? ' (neutral atom)' : q > 0 ? ' (positive ion)' : ' (negative ion)') : '');
    var nl = nucleusLine(info, z, n);
    el.rNuc.textContent = nl.head;
    el.rHl.textContent = info.kind === 'radio' || info.kind === 'slow' || info.kind === 'gone' || info.kind === 'neutron' ? (info.sec === null || info.sec === undefined ? 'not measured' : (info.flag === '~' ? 'about ' : info.flag === '<' ? 'under ' : info.flag === '>' ? 'over ' : '') + AM.halfLifeText(info.sec)) + (info.modes ? ' · ' + AM.modesText(info.modes) : '') : '—';
    el.rAb.textContent = info.abundance ? pct(info.abundance) : (E ? 'none' : '—');
    var sh = AM.shells(z, e);
    el.rSh.textContent = e ? sh.join(', ') : '—';
    el.rCf.textContent = e ? AM.configText(z, e) : '—';
    el.note.textContent = noteText(info, z, n, e);
    el.decay.disabled = !(info.kind === 'radio' || info.kind === 'slow' || info.kind === 'gone' || info.kind === 'neutron');
    el.neutral.disabled = !z || e === z;
    if (el.jump && E) el.jump.value = String(z);
    // quiz
    var showQuiz = z === 6 && n === 8 && !MS.isDone('c14');
    if (showQuiz && el.quiz.hidden) { el.quizFb.textContent = ''; }
    el.quiz.hidden = !showQuiz || S.scene !== 'build';
    placeQuiz();
    // live text
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { el.live.textContent = (E ? isoName(z, a) : 'No element') + '. ' + z + ' protons, ' + n + ' neutrons, ' + e + ' electrons. ' + (z ? (q === 0 ? 'Neutral atom. ' : 'Charge ' + (q > 0 ? 'plus ' : 'minus ') + Math.abs(q) + '. ') : '') + nl.head + '. ' + nl.text; }, 400);
    checkBuild();
  }
  function noteText(info, z, n, e) {
    var q = z - e, E = AM.el(z), why = whyText(info, z, n), out = [];
    if (why) out.push(why);
    if (E && q !== 0) {
      var ions = AM.IONS[z] || [];
      if (ions.indexOf(q) >= 0) out.push(E.sym + chargeText(q) + ' is a common ion of ' + E.name.toLowerCase() + '.');
      if (q <= -2) out.push('Ions with two or more extra electrons only stay together inside solids and solutions, like O²⁻ in rust. A lone one in empty space loses an electron.');
      if (z === 1 && e === 0) out.push('A bare proton: the hydrogen ion H⁺ that makes acids sour.');
    }
    if (E && q === 0 && e > 0) {
      var sh = AM.shells(z, e), outer = sh[sh.length - 1];
      if (z === 2 || z === 10 || z === 18 || z === 36) out.push(E.name + ' is a noble gas: its outer shell is full, so it hardly ever reacts.');
      else if (sh.length > 1 || z <= 2) out.push('Outer shell: ' + outer + ' electron' + (outer > 1 ? 's' : '') + '. These outer electrons decide how the atom reacts.');
    }
    return out.join(' ');
  }
  function checkBuild() {
    var z = S.z, n = S.n, e = S.e, k = S.info.kind;
    if (z === 1 && e === 1 && k === 'stable') complete('hydrogen', 'one proton and one electron. Hydrogen makes up about three quarters of the normal matter in the universe, by mass.');
    if (z === 6 && n === 6 && e === 6) complete('carbon', 'six of everything. Carbon-12 is the atom that defines the atomic mass unit.');
    if (k === 'stable' && ((z === 11 && e === 10) || (z === 17 && e === 18))) complete('ion', z === 11 ? 'Na⁺. Sodium gives up its one outer electron easily, which leaves a full shell underneath.' : 'Cl⁻. Chlorine grabs one electron to fill its outer shell. Na⁺ and Cl⁻ together make table salt.');
    if (z === 10 && e === 10 && k === 'stable') complete('neon', 'neon: 2 + 8 electrons, two full shells. That is why neon is a noble gas.');
    if (z === 36 && n === 50 && k === 'stable') complete('heavy', 'krypton-86, with 36 protons and 50 neutrons. Add one more neutron and it becomes radioactive.');
  }

  // decay: pick the mode (by its branching), animate, then change the nucleus
  function pickMode(info) {
    var ms = info.modes || [], tot = 0, i;
    for (i = 0; i < ms.length; i++) if (ms[i].pct !== null) tot += ms[i].pct;
    if (tot <= 0) return ms[0].m;
    var r = Math.random() * tot;
    for (i = 0; i < ms.length; i++) { if (ms[i].pct === null) continue; r -= ms[i].pct; if (r <= 0) return ms[i].m; }
    return ms[0].m;
  }
  function decayNow() {
    if (S.anim) return;
    var info = S.info, z = S.z, n = S.n;
    if (!(info.kind === 'radio' || info.kind === 'slow' || info.kind === 'gone' || info.kind === 'neutron')) { sayNow(info.kind === 'stable' ? 'This nucleus is stable: it never decays.' : 'Build a radioactive nucleus first.'); return; }
    var mode = pickMode(info), d = AM.MODES[mode];
    if ((mode === 'ec' || mode === '2ec') && S.e < (mode === 'ec' ? 1 : 2)) { sayNow('Electron capture needs an electron to capture. A bare nucleus like this one can’t decay this way. Add an electron.'); return; }
    var oldName = z ? isoName(z, z + n) : 'The neutron', nz = z + d[0], nn = n + d[1];
    S.anim = { mode: mode, t: 0, dur: reduced ? 0.05 : 1.3, oldName: oldName, nz: nz, nn: nn, slow: info.kind === 'slow', bits: [] };
    var ang = Math.random() * 6.28, R = L.R * 1.6;
    function out(kind, a, label) { S.anim.bits.push({ kind: kind, a: a, label: label }); }
    if (mode.indexOf('b-') === 0) { out('e', ang, 'e⁻'); out('nu', ang + Math.PI, 'ν̄'); }
    if (mode === '2b-') { out('e', ang, 'e⁻'); out('e', ang + 2.4, 'e⁻'); }
    if (mode === 'b+' || mode.indexOf('b+') === 0) { out('pos', ang, 'e⁺'); out('nu', ang + Math.PI, 'ν'); }
    if (mode === 'ec' || mode === '2ec') { out('nu', ang, 'ν'); S.anim.capture = true; }
    if (mode === 'a' || mode === 'b-a' || mode === 'b+a') out('alpha', ang + 1.2, 'α');
    if (mode === 'p' || mode === 'b+p') out('p', ang + 2, 'p');
    if (mode === '2p' || mode === 'b+2p') { out('p', ang + 2, 'p'); out('p', ang + 3.5, 'p'); }
    if (mode === 'n' || mode === 'b-n') out('n', ang + 2, 'n');
    if (mode === '2n' || mode === 'b-2n') { out('n', ang + 2, 'n'); out('n', ang + 3.5, 'n'); }
    S.fx.push({ x: L.cx, y: L.cy, t: 0, dur: 0.6, col: C.gold, r: nucRadius(z + n) + 30 });
  }
  function finishDecay() {
    var A = S.anim; S.anim = null;
    var dz = A.nz - S.z, dn = A.nn - S.n, i;
    // turn nucleons into each other, then remove what flew out
    function conv(fromP, count) { for (i = S.nucleons.length - 1; i >= 0 && count > 0; i--) if (S.nucleons[i].p === fromP) { S.nucleons[i].p = !fromP; S.nucleons[i].glow = 1; count--; } }
    function drop(isP, count) { for (i = S.nucleons.length - 1; i >= 0 && count > 0; i--) if (S.nucleons[i].p === isP) { S.nucleons.splice(i, 1); count--; } }
    var d = AM.MODES[A.mode], beta = { 'b-': 1, 'b-n': 1, 'b-2n': 1, 'b-a': 1 }[A.mode] ? 1 : ({ '2b-': 2 }[A.mode] || 0), plus = /^(b\+|ec)/.test(A.mode) ? 1 : (A.mode === '2ec' ? 2 : 0);
    if (beta) conv(false, beta);
    if (plus) conv(true, plus);
    var lostP = (beta - plus) - d[0], lostN = -(d[1] + beta - plus); // nucleons that flew out
    drop(true, lostP); drop(false, lostN);
    if (A.mode === 'ec') { if (S.e) S.electrons.shift(); S.e = Math.max(0, S.e - 1); }
    if (A.mode === '2ec') { S.electrons.splice(0, 2); S.e = Math.max(0, S.e - 2); }
    S.z = A.nz; S.n = A.nn;
    targets(); if (reduced) snap();
    changed();
    var E = AM.el(S.z), nm = E ? isoName(S.z, S.z + S.n) : 'a bare neutron';
    var q = S.z - S.e;
    var msg = A.oldName + ' → ' + nm + ' by ' + AM.modeWords(A.mode).split(':')[0] + '.';
    if (q !== 0 && S.z) msg += ' The new atom has a charge of ' + (q > 0 ? '+' : '−') + Math.abs(q) + ' until it gains or loses electrons.';
    if (A.slow) msg += ' (A real one would take far longer than the age of the universe.)';
    sayNow(msg);
  }

  // ---------- Half-life scene ----------
  function pickIso(id) { AM.SAMPLES.forEach(function (s) { if (s.id === id) H.iso = s; }); syncIso(); }
  function syncIso() {
    Array.prototype.forEach.call(el.iso.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-iso') === H.iso.id ? 'true' : 'false'); });
  }
  function setSize(nn) { H.n0 = nn; Array.prototype.forEach.call(el.size.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-n') === nn ? 'true' : 'false'); }); }
  function newSample() {
    H.dating = null; el.dateBox.hidden = true;
    H.seed = (H.seed * 1103515245 + 12345 + Date.now()) >>> 0;
    var r = AM.rng(H.seed);
    H.times = AM.lifetimes(H.n0, 1, r); // in half-lives
    H.flags = new Uint8Array(H.n0); H.branch = new Uint8Array(H.n0);
    if (H.iso.branch) for (var i = 0; i < H.n0; i++) H.branch[i] = r() < H.iso.branch.p2 ? 1 : 0;
    H.t = 0; H.left = H.n0; H.hist = [[0, H.n0]]; H.halfAt = null; H.done = false; H.flash = []; H.playing = true;
    gridLayout(); halfReadouts(); toolState();
  }
  var OBJECTS = ['a piece of charcoal from an old campfire', 'a wooden tool handle', 'a bone found in a cave', 'a scrap of woven cloth', 'seeds found in a clay pot', 'a reed sandal', 'a deer antler', 'a chunk of a wooden canoe'];
  function startDating() {
    pickIso('c14');
    var r = AM.rng((Date.now() & 0xffffff) + 7);
    for (var k = 0; k < 3; k++) r();
    var age = Math.round((1000 + r() * 24000) / 10) * 10, f = Math.round(AM.fractionAtAge(age, 5700) * 1000) / 1000;
    var obj = OBJECTS[Math.floor(r() * OBJECTS.length)], lit = new Uint8Array(1000), want = Math.round(f * 1000), idx = [], i;
    for (i = 0; i < 1000; i++) idx.push(i);
    for (i = 999; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    for (i = 0; i < want; i++) lit[idx[i]] = 1;
    H.dating = { obj: obj, age: age, f: f, guess: 0, lit: lit, solved: false, tries: 0 };
    H.playing = false; H.done = true;
    el.dateBox.hidden = false; el.guess.value = 0; guessOut();
    gridLayout(); halfReadouts(); toolState();
    sayNow('Mystery sample: ' + obj + '. ' + (f * 100).toFixed(1) + '% of its carbon-14 is left. Drag the age line on the graph (or the slider) to find its age.');
  }
  function guessOut() {
    var g = +el.guess.value, D = H.dating; if (!D) return;
    D.guess = g;
    el.guessO.textContent = numWord(g) + ' years';
    el.guess.setAttribute('aria-valuetext', numWord(g) + ' years: ' + (AM.fractionAtAge(g, 5700) * 100).toFixed(1) + '% of carbon-14 left');
  }
  function checkAge() {
    var D = H.dating; if (!D) return;
    var g = D.guess, left = AM.fractionAtAge(g, 5700) * 100, err = (g - D.age) / D.age;
    D.tries++;
    if (Math.abs(err) <= 0.04) {
      D.solved = true;
      sayNow('Yes! It is about ' + numWord(D.age) + ' years old: 5,700 × log₂(1 / ' + D.f.toFixed(3) + ') = ' + numWord(Math.round(AM.ageFromFraction(D.f, 5700))) + ' years.');
      complete('dating', 'you read the age off the decay curve.');
    } else {
      sayNow((err < 0 ? 'Too young' : 'Too old') + ': at ' + numWord(g) + ' years, ' + left.toFixed(1) + '% would be left, not ' + (D.f * 100).toFixed(1) + '%. Slide the line to where the curve crosses the dashed line.');
    }
    halfReadouts();
  }
  function stepHalf(dt) {
    if (!H.times || H.dating) return;
    if (H.playing && !H.done) {
      var before = H.left;
      H.t = Math.min(H.tMax, H.t + dt * SPEEDS[speedIx] / 4);
      for (var i = 0; i < H.n0; i++) if (!H.flags[i] && H.times[i] <= H.t) { H.flags[i] = 1; H.left--; if (H.flash.length < 400) H.flash.push({ i: i, t: 0 }); }
      if (H.left !== before) H.hist.push([H.t, H.left]);
      if (H.halfAt === null && H.left <= H.n0 / 2) {
        H.halfAt = H.t;
        var hv = fmtTime(H.t);
        if (H.n0 >= 100) complete('halflife', 'half the sample was gone after ' + hv + '. The half-life of ' + isoLabel(H.iso) + ' is ' + fmtTime(1) + '.');
        else sayNow('Half gone after ' + hv + '. With only ' + H.n0 + ' nuclei, chance plays a big part. Try a bigger sample.');
      }
      if (H.t >= H.tMax || H.left === 0) { H.done = true; H.hist.push([H.t, H.left]); toolState(); }
    }
    for (var k = H.flash.length - 1; k >= 0; k--) { H.flash[k].t += dt; if (H.flash[k].t > 0.6) H.flash.splice(k, 1); }
  }
  function isoLabel(s) { var E = s.z <= 36 ? AM.el(s.z) : { name: AM.SAMPLE_NAMES[s.z][1] }; return E.name.toLowerCase() + '-' + s.a; }
  function isoSym(s) { var sym = s.z <= 36 ? AM.el(s.z).sym : AM.SAMPLE_NAMES[s.z][0]; return SUPN(s.a) + sym; }
  var UNIT = { y: ['year', 'years'], d: ['day', 'days'], min: ['minute', 'minutes'] };
  function fmtTime(u) { // u in half-lives → words in the isotope's unit
    var v = u * H.iso.half, unit = H.iso.unit, w = UNIT[unit];
    if (unit === 'y' && v >= 1e8) return (v / 1e9).toPrecision(3) + ' billion years';
    var s = v >= 1000 ? numWord(Math.round(v)) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
    return s + ' ' + (s === '1' || s === '1.00' ? w[0] : w[1]);
  }
  function halfReadouts() {
    var s = H.iso;
    el.hIso.textContent = isoLabel(s).replace(/^./, function (c) { return c.toUpperCase(); });
    el.hHl.textContent = fmtTime(1);
    el.hTo.textContent = s.to + ' (' + AM.modeLabel(s.mode) + ')';
    el.hUse.textContent = s.use;
    if (H.dating) {
      var D = H.dating;
      el.hT.textContent = 'your guess: ' + numWord(D.guess) + ' years';
      el.hLeft.textContent = (D.f * 100).toFixed(1) + '% (measured)';
      el.hExp.textContent = (AM.fractionAtAge(D.guess, 5700) * 100).toFixed(1) + '% at your guess';
      el.hHalf.textContent = D.solved ? numWord(D.age) + ' years old' : '—';
    } else {
      el.hT.textContent = fmtTime(H.t);
      el.hLeft.textContent = numWord(H.left) + ' of ' + numWord(H.n0) + ' (' + (100 * H.left / H.n0).toFixed(1) + '%)';
      el.hExp.textContent = AM.expected(H.n0, 1, H.t).toFixed(H.n0 < 100 ? 1 : 0);
      el.hHalf.textContent = H.halfAt === null ? 'not yet' : fmtTime(H.halfAt);
    }
  }

  // ---------- layout ----------
  function layout() {
    K.fit();
    var W = K.w, Hh = K.h, wide = W >= 640;
    L.W = W; L.H = Hh; L.wide = wide;
    // periodic table along the bottom
    var ptW = W - 24, cw = ptW / 18, ch = Math.max(17, Math.min(30, cw * 0.62)), ptH = ch * 4;
    L.pt = { x: 12, y: Hh - ptH - 10, cw: cw, ch: ch, w: ptW, h: ptH };
    var top = 10, bottom = L.pt.y - 10;
    if (wide) {
      var rightW = Math.min(310, Math.max(240, W * 0.33)), trayW = 86;
      L.card = { x: W - rightW - 8, y: 54, w: rightW, h: 124 };
      L.stab = { x: L.card.x, y: L.card.y + L.card.h + 8, w: rightW, h: 92 };
      var chY = L.stab.y + L.stab.h + 10, chH = bottom - chY - 4;
      L.chart = chH >= 110 ? { x: L.card.x, y: chY, w: rightW, h: chH } : null;
      var ax0 = trayW + 18, ax1 = L.card.x - 10;
      L.cx = (ax0 + ax1) / 2; L.cy = (top + bottom) / 2;
      L.R = Math.max(60, Math.min((ax1 - ax0) / 2 - 8, (bottom - top) / 2 - 8));
      var th = Math.min(96, (bottom - top - 16) / 3 - 10), ty0 = L.cy - (th * 3 + 20) / 2;
      L.trays = {}; ['p', 'n', 'e'].forEach(function (k, i) { var y = ty0 + i * (th + 10); L.trays[k] = { x: 10, y: y, w: trayW, h: th, cx: 10 + trayW / 2, cy: y + th * 0.36 }; });
    } else {
      L.card = { x: 8, y: 8, w: W - 16 - 130, h: 50 };
      L.stab = { x: 8, y: 62, w: W - 16, h: 40 };
      L.chart = null;
      var trH = 54, trY = bottom - trH, tw = (W - 16 - 12) / 3;
      L.trays = {}; ['p', 'n', 'e'].forEach(function (k, i) { var x = 8 + i * (tw + 6); L.trays[k] = { x: x, y: trY, w: tw, h: trH, cx: x + 17, cy: trY + trH / 2 }; });
      var aTop = L.stab.y + L.stab.h + 6, aBot = trY - 6;
      L.cx = W / 2; L.cy = (aTop + aBot) / 2; L.R = Math.max(50, Math.min(W / 2 - 14, (aBot - aTop) / 2 - 4));
    }
    // half-life scene
    if (wide) { L.grid = { x: 16, y: 56, w: W * 0.5 - 24, h: Hh - 56 - 16 }; L.graph = { x: W * 0.5 + 40, y: 100, w: W * 0.5 - 58, h: Hh - 100 - 52 }; }
    else { var gh = (Hh - 60) * 0.5; L.grid = { x: 10, y: 54, w: W - 20, h: gh - 10 }; L.graph = { x: 50, y: 54 + gh + 34, w: W - 64, h: Hh - (54 + gh + 34) - 40 }; }
    if (S.nucleons) { targets(); if (!S.anim) snap(); }
    if (H.times || H.dating) gridLayout();
    chartCache = null; placeQuiz();
  }
  function placeQuiz() {
    if (!L.trays) return;
    var q = el.quiz.style;
    if (L.wide) { q.left = (L.trays.p.x + L.trays.p.w + 14) + 'px'; q.right = (L.W - L.card.x + 10) + 'px'; q.bottom = (L.H - L.pt.y + 12) + 'px'; q.top = 'auto'; }
    else { q.left = '8px'; q.right = '8px'; q.top = (L.stab.y + L.stab.h + 4) + 'px'; q.bottom = 'auto'; }
  }
  function gridLayout() {
    var n = H.dating ? 1000 : H.n0, g = L.grid, hdr = 54, bw = g.w, bh = g.h - hdr - 8;
    var cols = Math.max(1, Math.round(Math.sqrt(n * bw / bh))), rows = Math.ceil(n / cols);
    while (cols * rows < n) cols++;
    var cell = Math.min(bw / cols, bh / rows), ox = g.x + (bw - cell * cols) / 2, oy = g.y + hdr + (bh - cell * rows) / 2;
    H.cell = cell; H.pos = new Float32Array(n * 2);
    for (var i = 0; i < n; i++) { H.pos[2 * i] = ox + (i % cols + 0.5) * cell; H.pos[2 * i + 1] = oy + (Math.floor(i / cols) + 0.5) * cell; }
  }

  // ---------- drawing helpers ----------
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function txt(s, x, y, size, col, align, weight, font) { ctx.font = (weight || 400) + ' ' + size + 'px ' + (font || FONT); ctx.fillStyle = col; ctx.textAlign = align || 'left'; ctx.fillText(s, x, y); }
  function wrap(s, x, y, maxW, lh, size, col, maxLines) {
    ctx.font = '400 ' + size + 'px ' + FONT; ctx.fillStyle = col; ctx.textAlign = 'left';
    var words = s.split(' '), line = '', lines = 0;
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) { if (maxLines && lines === maxLines - 1) { ctx.fillText(line + ' …', x, y); return lines + 1; } ctx.fillText(line, x, y); y += lh; lines++; line = words[i]; }
      else line = test;
    }
    if (line) { ctx.fillText(line, x, y); lines++; }
    return lines;
  }
  function ball(x, y, r, kind, alpha) {
    var col = kind === 'p' ? C.p : kind === 'n' ? C.n : kind === 'pos' ? C.pink : C.e;
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    if (kind === 'p') { g.addColorStop(0, '#ffd0d0'); g.addColorStop(0.5, '#ff8787'); g.addColorStop(1, '#b8404a'); }
    else if (kind === 'n') { g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#c3cfd9'); g.addColorStop(1, '#6d7f8c'); }
    else { g.addColorStop(0, '#e6f4ff'); g.addColorStop(0.45, col); g.addColorStop(1, kind === 'pos' ? '#a8467d' : '#2f6fa8'); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    if (r >= 6) {
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(1, r * 0.16); ctx.beginPath();
      if (kind === 'p' || kind === 'pos') { ctx.moveTo(x - r * 0.38, y); ctx.lineTo(x + r * 0.38, y); ctx.moveTo(x, y - r * 0.38); ctx.lineTo(x, y + r * 0.38); }
      else if (kind === 'e') { ctx.moveTo(x - r * 0.38, y); ctx.lineTo(x + r * 0.38, y); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function glow(x, y, r, col, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.globalAlpha = 1; }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }

  // ---------- draw: build scene ----------
  var chartCache = null;
  function drawBuild(dt) {
    var W = L.W, Hh = L.H, t = S.clock, i, o;
    // backdrop
    var bg = ctx.createRadialGradient(L.cx, L.cy, 0, L.cx, L.cy, L.R * 1.4); bg.addColorStop(0, '#0d2333'); bg.addColorStop(1, '#06111a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, Hh);
    // drop zone while dragging a new particle
    if (S.drag && S.drag.from === 'tray' && S.drag.moved) {
      var inside = Math.hypot(S.drag.x - L.cx, S.drag.y - L.cy) < L.R + 20;
      ctx.strokeStyle = hexA(C.green, inside ? 0.7 : 0.3); ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(L.cx, L.cy, L.R + 8, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
    }
    // ease particles
    var k = reduced ? 1 : 1 - Math.exp(-dt * 10);
    S.nucleons.forEach(function (o) { o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; if (o.glow) o.glow = Math.max(0, o.glow - dt * 0.8); });
    S.electrons.forEach(function (o) { o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; });
    var a = S.z + S.n, rn = nucRadius(a), info = S.info, kcol = KIND_COL[info.kind] || C.muted;
    // electron shells or cloud
    var sh = S.shells || [], radii = S.radii || [];
    if (S.view === 'shells') {
      for (i = 0; i < radii.length; i++) {
        ctx.strokeStyle = hexA(SHELL_COL[i], 0.35); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(L.cx, L.cy, radii[i], 0, 6.2832); ctx.stroke();
        var la = -Math.PI / 4;
        txt(String(sh[i]), L.cx + (radii[i] + 2) * Math.cos(la) + 4, L.cy + (radii[i] + 2) * Math.sin(la) - 3, 11, hexA(SHELL_COL[i], 0.9), 'left', 700, MONO);
      }
    } else drawCloud(sh, radii);
    // nucleus aura
    if (a) {
      var pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * (info.kind === 'radio' || info.kind === 'gone' ? 5 : 1.6));
      glow(L.cx, L.cy, rn * 1.9 + 14, kcol, info.kind === 'stable' ? 0.16 : 0.18 + 0.18 * pulse);
    }
    // nucleons, outer first so the inner ones sit on top
    var r0 = nucleonR(), dragIdx = S.drag && S.drag.from === 'atom' && S.drag.kind !== 'e' ? S.drag.idx : -1;
    var order = S.nucleons.map(function (o, j) { return j; }).sort(function (p, q) { return S.nucleons[q].slot - S.nucleons[p].slot; });
    var jig = reduced ? 0 : 0.6;
    for (i = 0; i < order.length; i++) {
      var j = order[i]; o = S.nucleons[j]; if (j === dragIdx) continue;
      var jx = jig * Math.sin(t * 7 + o.ph), jy = jig * Math.cos(t * 6.3 + o.ph * 1.7);
      if (o.glow) glow(o.x, o.y, r0 * 3, C.gold, o.glow * 0.8);
      ball(o.x + jx, o.y + jy, r0, o.p ? 'p' : 'n');
    }
    // electrons
    if (S.view === 'shells') {
      var de = S.drag && S.drag.from === 'atom' && S.drag.kind === 'e' ? S.drag.idx : -1, er = Math.max(4, Math.min(7, L.R * 0.028));
      S.electrons.forEach(function (o, j) {
        if (j === de) return;
        glow(o.x, o.y, er * 3.2, C.e, reduced ? 0.4 : 0.32 + 0.12 * Math.sin(t * 3 + j));
        ball(o.x, o.y, er, 'e');
      });
    }
    // charge badge
    var q = S.z - S.e;
    if (S.z && q) {
      var bx = L.cx + L.R * 0.78, by = L.cy - L.R * 0.86, s = (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−');
      ctx.fillStyle = q > 0 ? 'rgba(255,135,135,.18)' : 'rgba(116,192,252,.18)'; ctx.strokeStyle = q > 0 ? C.red : C.blue; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx, by, 19, 0, 6.2832); ctx.fill(); ctx.stroke();
      txt(s, bx, by + 6, 16, q > 0 ? C.red : C.blue, 'center', 800);
    }
    // labels about the model
    var cap = S.view === 'shells' ? 'Shell picture: a simplified model. Real electrons spread out in clouds called orbitals.' : 'Electron cloud (still simplified): the dots show where electrons are likely to be found.';
    ctx.globalAlpha = 0.85;
    if (L.wide) { wrap(cap, L.trays.p.x + L.trays.p.w + 14, 22, L.card.x - L.trays.p.w - 40, 15, 11.5, C.muted, 2); wrap('Not to scale: a real nucleus is tens of thousands of times smaller.', L.trays.p.x + L.trays.p.w + 14, L.pt.y - 14, L.card.x - L.trays.p.w - 40, 14, 11, C.dim, 1); }
    else { txt(S.view === 'shells' ? 'Shell picture (simplified model)' : 'Electron cloud (simplified)', 10, L.stab.y + L.stab.h + 14, 10.5, C.dim); txt('Not to scale', W - 10, L.stab.y + L.stab.h + 14, 10.5, C.dim, 'right'); }
    ctx.globalAlpha = 1;
    if (!a && !S.e && !S.fly.length && !(S.drag && S.drag.moved)) {
      txt(L.wide ? 'Drag a proton in here' : 'Tap or drag a proton in', L.cx, L.cy - 4, L.wide ? 17 : 15, C.ink, 'center', 600);
      txt('The number of protons decides the element', L.cx, L.cy + 18, 12, C.muted, 'center');
    }
    drawDecayAnim(dt);
    drawTrays();
    drawCard();
    if (L.chart) drawChart();
    drawPT();
    // flying particles and effects
    for (i = S.fly.length - 1; i >= 0; i--) {
      var f = S.fly[i]; f.t += dt;
      var u = Math.min(1, f.t / f.dur), e2 = u * u * (3 - 2 * u);
      ball(f.x0 + (f.x1 - f.x0) * e2, f.y0 + (f.y1 - f.y0) * e2 - Math.sin(u * Math.PI) * 30, f.kind === 'e' ? 6 : 7.5, f.kind);
      if (u >= 1) { S.fly.splice(i, 1); if (f.done) f.done(); }
    }
    for (i = S.fx.length - 1; i >= 0; i--) {
      var x = S.fx[i]; x.t += dt; var v = x.t / x.dur;
      if (v >= 1) { S.fx.splice(i, 1); continue; }
      if (reduced) continue;
      ctx.strokeStyle = hexA(x.col, 0.8 * (1 - v)); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x.x, x.y, x.r * (0.4 + v), 0, 6.2832); ctx.stroke();
    }
    // the particle being dragged
    if (S.drag && (S.drag.moved || S.drag.from === 'atom')) { glow(S.drag.x, S.drag.y, 30, C[S.drag.kind], 0.5); ball(S.drag.x, S.drag.y, S.drag.kind === 'e' ? 8 : 10, S.drag.kind); }
  }
  function drawCloud(sh, radii) {
    var t = S.clock;
    if (S.cloudAt < 0 || (!reduced && t - S.cloudAt > 0.06) || S.cloud.length === 0 || S.cloudKey !== sh.join(',') + '|' + radii.map(Math.round).join(',')) {
      S.cloudAt = t; S.cloudKey = sh.join(',') + '|' + radii.map(Math.round).join(',');
      var pts = [], gap = radii.length > 1 ? radii[1] - radii[0] : (L.R * 0.18);
      for (var k = 0; k < sh.length; k++) {
        var cnt = Math.min(800, sh[k] * 90);
        for (var j = 0; j < cnt; j++) {
          var u1 = Math.random() || 1e-9, u2 = Math.random(), g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(6.2832 * u2);
          var r = Math.abs(radii[k] + g * gap * 0.34), th = Math.random() * 6.2832;
          pts.push(L.cx + r * Math.cos(th), L.cy + r * Math.sin(th), k);
        }
      }
      S.cloud = pts;
    }
    for (var kk = 0; kk < sh.length; kk++) glow(L.cx, L.cy, radii[kk] * 1.2, SHELL_COL[kk], 0.08);
    var p = S.cloud;
    for (var i = 0; i < p.length; i += 3) { ctx.fillStyle = hexA(SHELL_COL[p[i + 2]], 0.75); ctx.fillRect(p[i] - 1.1, p[i + 1] - 1.1, 2.2, 2.2); }
  }
  function drawDecayAnim(dt) {
    var A = S.anim; if (!A) return;
    A.t += dt; var u = Math.min(1, A.t / A.dur), d = L.R * 1.5 * u;
    if (A.capture && S.electrons.length) { var o = S.electrons[0]; o.x += (L.cx - o.x) * Math.min(1, u * 1.6); o.y += (L.cy - o.y) * Math.min(1, u * 1.6); }
    A.bits.forEach(function (b) {
      var x = L.cx + Math.cos(b.a) * (nucRadius(S.z + S.n) + d), y = L.cy + Math.sin(b.a) * (nucRadius(S.z + S.n) + d);
      if (b.kind === 'nu') { ctx.strokeStyle = hexA(C.ink, 0.6 * (1 - u)); ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(L.cx, L.cy); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); txt(b.label, x + 6, y - 6, 13, hexA(C.ink, 1 - u * 0.7), 'left', 600); return; }
      ctx.strokeStyle = hexA(b.kind === 'alpha' ? C.gold : b.kind === 'p' ? C.red : b.kind === 'pos' ? C.pink : b.kind === 'n' ? C.n : C.blue, 0.5 * (1 - u)); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L.cx, L.cy); ctx.lineTo(x, y); ctx.stroke();
      if (b.kind === 'alpha') { var r = nucleonR(); ball(x - r * 0.5, y - r * 0.5, r, 'p'); ball(x + r * 0.5, y + r * 0.5, r, 'p'); ball(x + r * 0.5, y - r * 0.5, r, 'n'); ball(x - r * 0.5, y + r * 0.5, r, 'n'); }
      else ball(x, y, b.kind === 'e' || b.kind === 'pos' ? 6 : nucleonR(), b.kind === 'pos' ? 'pos' : b.kind);
      txt(b.label, x + 10, y - 10, 13, C.ink, 'left', 700);
    });
    var lbl = { 'b-': 'β⁻ decay: a neutron turns into a proton', 'b+': 'β⁺ decay: a proton turns into a neutron', ec: 'Electron capture: a proton swallows an electron', a: 'Alpha decay', n: 'A neutron drips off', '2n': 'Two neutrons drip off', p: 'A proton flies off', '2p': 'Two protons fly off' }[A.mode] || AM.modeWords(A.mode).split(':')[0].replace(/^./, function (c) { return c.toUpperCase(); });
    ctx.font = '700 13px ' + FONT; var lw = ctx.measureText(lbl).width + 20, ly = L.cy + L.R * 0.62;
    rr(L.cx - lw / 2, ly - 16, lw, 24, 12); ctx.fillStyle = 'rgba(6,17,26,.85)'; ctx.fill(); ctx.strokeStyle = hexA(C.gold, 0.7); ctx.lineWidth = 1; ctx.stroke();
    txt(lbl, L.cx, ly + 1, 13, C.gold, 'center', 700);
    if (u >= 1) finishDecay();
  }
  function drawTrays() {
    ['p', 'n', 'e'].forEach(function (k) {
      var tr = L.trays[k], cnt = k === 'p' ? S.z : k === 'n' ? S.n : S.e, name = k === 'p' ? 'Proton' : k === 'n' ? 'Neutron' : 'Electron';
      var hov = S.hover === 'tray-' + k;
      rr(tr.x, tr.y, tr.w, tr.h, 12); ctx.fillStyle = hov ? 'rgba(20,45,62,.95)' : C.box; ctx.fill(); ctx.strokeStyle = hexA(C[k], hov ? 0.9 : 0.45); ctx.lineWidth = 1.5; ctx.stroke();
      if (L.wide) {
        glow(tr.cx, tr.cy, 26, C[k], 0.35); ball(tr.cx, tr.cy, 12, k);
        txt(name, tr.cx, tr.y + tr.h * 0.66, 12, C.ink, 'center', 600);
        txt(String(cnt), tr.cx, tr.y + tr.h - 9, 15, C[k], 'center', 800, MONO);
        tr.minus = { x: tr.x + tr.w - 17, y: tr.y + 15, r: 12 };
      } else {
        glow(tr.cx, tr.cy, 18, C[k], 0.3); ball(tr.cx, tr.cy, 9, k);
        txt(name, tr.x + 31, tr.cy - 4, 10.5, C.ink, 'left', 600);
        txt(String(cnt), tr.x + 31, tr.cy + 13, 13, C[k], 'left', 800, MONO);
        tr.minus = { x: tr.x + tr.w - 16, y: tr.cy, r: 12 };
      }
      var m = tr.minus; ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = hexA(C.ink, cnt ? 0.7 : 0.25); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x - 5, m.y); ctx.lineTo(m.x + 5, m.y); ctx.stroke();
    });
  }
  function drawCard() {
    var c = L.card, s = L.stab, E = AM.el(S.z), a = S.z + S.n, info = S.info, q = S.z - S.e;
    S.cardFlash = Math.max(0, S.cardFlash - 0.03);
    var col = E ? CAT[E.cat] : C.muted;
    if (L.wide) {
      rr(c.x, c.y, c.w, c.h, 12); ctx.fillStyle = C.box; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
      // element tile
      var tw = 92, tx = c.x + 12, ty = c.y + 12, th = c.h - 24;
      rr(tx, ty, tw, th, 8); ctx.fillStyle = hexA(col, 0.14 + 0.25 * S.cardFlash); ctx.fill(); ctx.strokeStyle = hexA(col, 0.8); ctx.lineWidth = 1.5; ctx.stroke();
      if (E) {
        txt(String(S.z), tx + 7, ty + 15, 12, C.ink, 'left', 700, MONO);
        txt(E.sym, tx + tw / 2, ty + th / 2 + 12, 38, '#fff', 'center', 800);
        txt(E.name, tx + tw / 2, ty + th - 22, 11, C.ink, 'center', 600);
        txt(E.weight, tx + tw / 2, ty + th - 8, 10, C.muted, 'center', 400, MONO);
      } else txt('?', tx + tw / 2, ty + th / 2 + 12, 36, C.dim, 'center', 800);
      var x = tx + tw + 12, y = c.y + 30, w = c.x + c.w - x - 10;
      if (E) {
        // notation: mass number up left, atomic number down left, symbol, charge up right
        ctx.font = '700 13px ' + FONT; var aw = ctx.measureText(String(a)).width;
        txt(String(a), x, y - 4, 13, C.gold, 'left', 700);
        txt(String(S.z), x, y + 14, 13, C.p, 'left', 700);
        txt(E.sym, x + aw + 3, y + 12, 26, '#fff', 'left', 800);
        ctx.font = '800 26px ' + FONT; var sw = ctx.measureText(E.sym).width;
        if (q) txt((Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−'), x + aw + 5 + sw, y - 4, 14, q > 0 ? C.red : C.blue, 'left', 800);
        txt(isoName(S.z, a), x, y + 36, 13.5, C.ink, 'left', 700);
        txt(S.z + ' p · ' + S.n + ' n · ' + S.e + ' e', x, y + 55, 12, C.muted, 'left', 400, MONO);
        txt(q === 0 ? 'Neutral atom' : (q > 0 ? 'Positive ion, charge +' + q : 'Negative ion, charge −' + (-q)), x, y + 73, 12, q === 0 ? C.green : q > 0 ? C.red : C.blue, 'left', 600);
        txt(E.catName, x, y + 89, 11, hexA(col, 0.95), 'left', 600);
      } else {
        wrap(S.n ? 'No protons yet, so this is not an element.' : 'Add protons, neutrons and electrons.', x, y, w, 16, 12.5, C.muted, 4);
      }
      // stability
      rr(s.x, s.y, s.w, s.h, 12); ctx.fillStyle = C.box; ctx.fill();
      var kc = KIND_COL[info.kind] || C.muted; ctx.fillStyle = kc; rr(s.x, s.y, 5, s.h, 2); ctx.fill();
      var nl = nucleusLine(info, S.z, S.n);
      txt('NUCLEUS', s.x + 16, s.y + 18, 10, C.muted, 'left', 700);
      txt(nl.head.toUpperCase(), s.x + 74, s.y + 18, 12, kc, 'left', 800);
      var used = wrap(nl.text, s.x + 16, s.y + 38, s.w - 26, 15, 12, C.ink, 3), extra = extraLine(info);
      if (extra && used < 3) wrap(extra, s.x + 16, s.y + 38 + used * 15 + 3, s.w - 26, 14, 11, C.muted, 3 - used);
    } else {
      // compact: tile + name on the left, stability line below
      var tw2 = 46; rr(c.x, c.y, tw2, c.h, 7); ctx.fillStyle = hexA(col, 0.15 + 0.25 * S.cardFlash); ctx.fill(); ctx.strokeStyle = hexA(col, 0.8); ctx.lineWidth = 1.2; ctx.stroke();
      if (E) { txt(String(S.z), c.x + 4, c.y + 11, 9, C.ink, 'left', 700, MONO); txt(E.sym, c.x + tw2 / 2, c.y + c.h / 2 + 10, 21, '#fff', 'center', 800); }
      else txt('?', c.x + tw2 / 2, c.y + c.h / 2 + 8, 20, C.dim, 'center', 800);
      var x2 = c.x + tw2 + 8;
      txt(E ? isoName(S.z, a) + (q ? ' ' + E.sym + chargeText(q) : '') : (S.n ? 'No element' : 'Empty'), x2, c.y + 18, 14, '#fff', 'left', 700);
      txt(S.z + 'p · ' + S.n + 'n · ' + S.e + 'e · ' + (q === 0 ? 'neutral' : 'charge ' + (q > 0 ? '+' : '−') + Math.abs(q)), x2, c.y + 37, 11.5, C.muted, 'left', 400, MONO);
      var nl2 = nucleusLine(info, S.z, S.n), kc2 = KIND_COL[info.kind] || C.muted;
      rr(s.x, s.y, s.w, s.h, 9); ctx.fillStyle = C.box; ctx.fill(); ctx.fillStyle = kc2; rr(s.x, s.y, 4, s.h, 2); ctx.fill();
      txt(nl2.head, s.x + 12, s.y + 15, 11.5, kc2, 'left', 800);
      wrap(nl2.text, s.x + 12, s.y + 31, s.w - 20, 13, 10.5, C.ink, 1);
    }
  }
  function drawChart() {
    var c = L.chart, maxN = 68, maxZ = 36;
    var cell = Math.min((c.w - 30) / (maxN + 1), (c.h - 34) / (maxZ + 1)), ox = c.x + 22, oy = c.y + 16 + (maxZ + 1) * cell;
    L.chartCell = { ox: ox, oy: oy, cell: cell, maxN: maxN, maxZ: maxZ };
    if (!chartCache || chartCache.w !== c.w || chartCache.h !== c.h || chartCache.dpr !== K.dpr) {
      var off = document.createElement('canvas'); off.width = Math.ceil(c.w * K.dpr); off.height = Math.ceil(c.h * K.dpr);
      var g = off.getContext('2d'); g.setTransform(K.dpr, 0, 0, K.dpr, -c.x * K.dpr, -c.y * K.dpr);
      g.fillStyle = C.box; g.beginPath(); g.moveTo(c.x + 12, c.y); g.arcTo(c.x + c.w, c.y, c.x + c.w, c.y + c.h, 12); g.arcTo(c.x + c.w, c.y + c.h, c.x, c.y + c.h, 12); g.arcTo(c.x, c.y + c.h, c.x, c.y, 12); g.arcTo(c.x, c.y, c.x + c.w, c.y, 12); g.fill();
      // N = Z line
      g.strokeStyle = 'rgba(143,179,198,.35)'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + (maxZ + 1) * cell, oy - (maxZ + 1) * cell); g.stroke(); g.setLineDash([]);
      AM.all().forEach(function (x) {
        var k = AM.nucleus(x.z, x.n).kind, m = x.modes.length ? x.modes[0].m : '', col;
        if (k === 'stable') col = '#f1f5f8'; else if (k === 'slow') col = '#b9e8d6'; else if (k === 'gone') col = 'rgba(255,135,135,.55)';
        else if (m === 'a') col = C.gold; else if (m.charAt(0) === 'b' && m.charAt(1) === '-' || m === '2b-') col = 'rgba(116,192,252,.75)'; else col = 'rgba(249,168,212,.75)';
        g.fillStyle = col; g.fillRect(ox + x.n * cell, oy - (x.z + 1) * cell, Math.max(1, cell - 0.6), Math.max(1, cell - 0.6));
      });
      g.font = '600 10px ' + FONT; g.fillStyle = C.muted; g.textAlign = 'left';
      g.fillText('Chart of the nuclides', c.x + 10, c.y + 12);
      g.textAlign = 'right'; g.fillText('neutrons →', ox + (maxN + 1) * cell, oy + 12);
      g.save(); g.translate(c.x + 12, oy - 4); g.rotate(-Math.PI / 2); g.textAlign = 'left'; g.fillText('protons →', 0, 0); g.restore();
      // legend
      var lx = ox + 44 * cell, ly = oy - 4 * 12 - 6; g.font = '600 9.5px ' + FONT;
      [['stable', '#f1f5f8'], ['β⁻', 'rgba(116,192,252,.9)'], ['β⁺/EC', 'rgba(249,168,212,.9)'], ['falls apart', 'rgba(255,135,135,.8)']].forEach(function (it, i) {
        var yy = ly + i * 12; g.fillStyle = it[1]; g.fillRect(lx, yy - 7, 7, 7); g.fillStyle = C.muted; g.textAlign = 'left'; g.fillText(it[0], lx + 10, yy);
      });
      chartCache = { cv: off, w: c.w, h: c.h, dpr: K.dpr };
    }
    ctx.drawImage(chartCache.cv, c.x, c.y, c.w, c.h);
    if (S.z || S.n) {
      var px = ox + (S.n + 0.5) * cell, py = oy - (S.z + 0.5) * cell;
      if (S.n <= maxN && S.z <= maxZ) {
        ctx.strokeStyle = hexA(C.gold, 0.45); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(px - 5, py); ctx.moveTo(px, oy); ctx.lineTo(px, py + 5); ctx.stroke();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, Math.max(4, cell * 1.2), 0, 6.2832); ctx.stroke();
      }
    }
  }
  function drawPT() {
    var p = L.pt, cnt = 0;
    for (var z = 1; z <= 36; z++) {
      var E = AM.el(z), x = p.x + (E.group - 1) * p.cw, y = p.y + (E.period - 1) * p.ch, made = !!S.built[z], cur = z === S.z, col = CAT[E.cat];
      if (made) cnt++;
      rr(x + 1, y + 1, p.cw - 2, p.ch - 2, 4);
      ctx.fillStyle = cur ? hexA(col, 0.55) : made ? hexA(col, 0.26) : 'rgba(255,255,255,.04)'; ctx.fill();
      ctx.strokeStyle = cur ? C.gold : made ? hexA(col, 0.6) : 'rgba(143,179,198,.18)'; ctx.lineWidth = cur ? 2 : 1; ctx.stroke();
      if (cur) glow(x + p.cw / 2, y + p.ch / 2, p.cw, C.gold, 0.25);
      var fs = Math.max(8.5, Math.min(14, p.ch * 0.46));
      txt(E.sym, x + p.cw / 2, y + p.ch / 2 + fs * 0.36 + (p.ch > 24 ? 3 : 0), fs, cur ? '#fff' : made ? C.ink : C.dim, 'center', 700);
      if (p.ch > 24 && p.cw > 30) txt(String(z), x + 4, y + 10, 8, made || cur ? C.muted : C.dim, 'left', 400, MONO);
    }
    var lbl = 'Periodic table, elements 1–36 · you have made ' + cnt + ' of 36';
    if (p.cw * 10 > 230) { ctx.globalAlpha = 0.9; txt(lbl, p.x + p.cw * 2.2, p.y + p.ch * 0.62, Math.min(12, p.ch * 0.42), C.muted, 'left', 600); ctx.globalAlpha = 1; }
    else txt('Made ' + cnt + ' of 36', p.x + p.cw * 2.2, p.y + p.ch * 0.7, 9.5, C.muted, 'left', 600);
  }

  // ---------- draw: half-life scene ----------
  function drawHalf(dt) {
    var W = L.W, Hh = L.H, g = L.grid, s = H.iso, D = H.dating, i;
    ctx.fillStyle = '#06111a'; ctx.fillRect(0, 0, W, Hh);
    // header
    var parentSym = isoSym(s), daughter = s.branch ? 'calcium-40 or argon-40' : s.to.split(' ')[0];
    if (D) {
      txt('Mystery sample', g.x, g.y + 4, 15, C.gold, 'left', 700);
      wrap(D.obj.charAt(0).toUpperCase() + D.obj.slice(1) + '. Of every 1,000 carbon-14 atoms it had when it was alive, ' + Math.round(D.f * 1000) + ' are left.', g.x, g.y + 22, g.w, 15, 12, C.ink, 2);
    } else {
      txt(parentSym + ' → ' + daughter, g.x, g.y + 4, 15, C.gold, 'left', 700);
      txt('half-life ' + fmtTime(1) + ' · ' + AM.modeLabel(s.mode) + ' decay', g.x, g.y + 22, 12, C.muted);
      txt('Time: ' + fmtTime(H.t), g.x, g.y + 40, 13, C.ink, 'left', 700, MONO);
      txt(numWord(H.left) + ' left', g.x + g.w, g.y + 40, 13, C.gold, 'right', 700, MONO);
    }
    // the nuclei
    var n = D ? 1000 : H.n0, cell = H.cell, rad = Math.max(1.4, cell * 0.36);
    if (!H.pos) gridLayout();
    if (n <= 10) {
      for (i = 0; i < n; i++) {
        var x = H.pos[2 * i], y = H.pos[2 * i + 1], alive = !H.flags[i], r = Math.min(cell * 0.4, 46);
        glow(x, y, r * 1.8, alive ? C.gold : C.blue, alive ? 0.35 : 0.15);
        ctx.fillStyle = alive ? 'rgba(255,212,121,.22)' : 'rgba(116,192,252,.12)'; ctx.strokeStyle = alive ? C.gold : hexA(C.blue, 0.6); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); ctx.stroke();
        var lab = alive ? parentSym : (s.branch && H.branch[i] ? '⁴⁰Ar' : daughterSym(s));
        txt(lab, x, y + r * 0.18, Math.max(10, r * 0.5), alive ? '#fff' : C.blue, 'center', 800);
      }
    } else {
      ctx.fillStyle = 'rgba(116,192,252,.38)'; ctx.beginPath();
      for (i = 0; i < n; i++) if (D ? !D.lit[i] : H.flags[i]) { ctx.moveTo(H.pos[2 * i] + rad * 0.8, H.pos[2 * i + 1]); ctx.arc(H.pos[2 * i], H.pos[2 * i + 1], rad * 0.8, 0, 6.2832); }
      ctx.fill();
      if (s.branch && !D) { ctx.fillStyle = 'rgba(177,151,252,.6)'; ctx.beginPath(); for (i = 0; i < n; i++) if (H.flags[i] && H.branch[i]) { ctx.moveTo(H.pos[2 * i] + rad * 0.8, H.pos[2 * i + 1]); ctx.arc(H.pos[2 * i], H.pos[2 * i + 1], rad * 0.8, 0, 6.2832); } ctx.fill(); }
      ctx.fillStyle = C.gold; ctx.beginPath();
      for (i = 0; i < n; i++) if (D ? D.lit[i] : !H.flags[i]) { ctx.moveTo(H.pos[2 * i] + rad, H.pos[2 * i + 1]); ctx.arc(H.pos[2 * i], H.pos[2 * i + 1], rad, 0, 6.2832); }
      ctx.fill();
    }
    if (!reduced) H.flash.forEach(function (f) {
      var x = H.pos[2 * f.i], y = H.pos[2 * f.i + 1], v = f.t / 0.6, r = (n <= 10 ? Math.min(cell * 0.4, 46) : rad) * (1 + v * 2);
      ctx.strokeStyle = hexA(s.mode === 'a' ? C.gold : s.mode === 'b+' ? C.pink : C.blue, 0.75 * (1 - v)); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke();
    });
    // legend under the grid
    var ly = g.y + g.h + 2;
    if (L.wide) {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(g.x + 6, ly - 4, 4, 0, 6.2832); ctx.fill(); txt(D ? 'carbon-14 still there' : parentSym + ' (not yet decayed)', g.x + 15, ly, 11, C.muted);
      ctx.fillStyle = 'rgba(116,192,252,.7)'; ctx.beginPath(); ctx.arc(g.x + g.w * 0.55, ly - 4, 4, 0, 6.2832); ctx.fill(); txt(D ? 'already decayed to nitrogen-14' : 'decayed to ' + daughter, g.x + g.w * 0.55 + 9, ly, 11, C.muted);
    }
    drawGraph();
  }
  function daughterSym(s) { var m = { c14: '¹⁴N', h3: '³He', f18: '¹⁸O', i131: '¹³¹Xe', co60: '⁶⁰Ni', rn222: '²¹⁸Po', k40: '⁴⁰Ca', u238: '²³⁴Th' }; return m[s.id]; }
  function graphMap() {
    var gr = L.graph, D = H.dating, tMax = D ? 35000 / 5700 : H.tMax;
    return { x0: gr.x, y0: gr.y + gr.h, w: gr.w, h: gr.h, tMax: tMax, X: function (u) { return gr.x + gr.w * u / tMax; }, Y: function (f) { return gr.y + gr.h * (1 - f); } };
  }
  function drawGraph() {
    var gr = L.graph, m = graphMap(), D = H.dating, s = H.iso, i;
    rr(gr.x - 34, gr.y - 30, gr.w + 46, gr.h + 66, 12); ctx.fillStyle = 'rgba(11,27,39,.6)'; ctx.fill();
    txt(D ? 'Carbon-14 left vs. age' : 'Nuclei left vs. time', gr.x, gr.y - 12, 12, C.ink, 'left', 700);
    // grid: each half-life
    ctx.lineWidth = 1;
    var stepT = D ? (gr.w < 400 ? 10000 : 5000) / 5700 : 1;
    for (var u = 0; u <= m.tMax + 1e-9; u += stepT) {
      var x = m.X(u), last = u + stepT > m.tMax + 1e-9; ctx.strokeStyle = 'rgba(120,170,200,.16)'; ctx.beginPath(); ctx.moveTo(x, gr.y); ctx.lineTo(x, gr.y + gr.h); ctx.stroke();
      txt(D ? numWord(Math.round(u * 5700)) : (u === 0 ? '0' : Math.round(u) + ' T½'), x, gr.y + gr.h + 14, 10, C.muted, last && x > gr.x + gr.w - 20 ? 'right' : 'center', 400, MONO);
    }
    [1, 0.5, 0.25, 0.125].forEach(function (f) { var y = m.Y(f); ctx.strokeStyle = 'rgba(120,170,200,.16)'; ctx.beginPath(); ctx.moveTo(gr.x, y); ctx.lineTo(gr.x + gr.w, y); ctx.stroke(); txt(f === 1 ? '100%' : f === 0.5 ? '50%' : f === 0.25 ? '25%' : '12.5%', gr.x - 5, y + 4, 10, C.muted, 'right', 400, MONO); });
    txt(D ? 'age in years' : 'time, in half-lives (1 T½ = ' + fmtTime(1) + ')', gr.x + gr.w, gr.y + gr.h + 30, 10.5, C.muted, 'right');
    ctx.strokeStyle = 'rgba(219,231,239,.5)'; ctx.beginPath(); ctx.moveTo(gr.x, gr.y); ctx.lineTo(gr.x, gr.y + gr.h); ctx.lineTo(gr.x + gr.w, gr.y + gr.h); ctx.stroke();
    // the exponential curve
    ctx.strokeStyle = hexA(C.gold, 0.85); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath();
    for (i = 0; i <= 120; i++) { var uu = m.tMax * i / 120, xx = m.X(uu), yy = m.Y(Math.pow(2, -uu)); if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
    ctx.stroke(); ctx.setLineDash([]);
    if (D) {
      var fy = m.Y(D.f); ctx.strokeStyle = hexA(C.pink, 0.9); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gr.x, fy); ctx.lineTo(gr.x + gr.w, fy); ctx.stroke(); ctx.setLineDash([]);
      txt('your sample: ' + (D.f * 100).toFixed(1) + '%', gr.x + gr.w - 4, fy - 5, 11, C.pink, 'right', 700);
      var gx = m.X(D.guess / 5700), gy = m.Y(AM.fractionAtAge(D.guess, 5700));
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gr.y); ctx.lineTo(gx, gr.y + gr.h); ctx.stroke();
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, 6.2832); ctx.fill();
      rr(gx - 9, gr.y + gr.h - 26, 18, 22, 5); ctx.fill();
      txt(numWord(D.guess) + ' y', Math.min(gx + 8, gr.x + gr.w - 60), gr.y + 14, 11, C.green, 'left', 700, MONO);
      if (D.solved) { var ax = m.X(D.age / 5700); ctx.strokeStyle = hexA(C.gold, 0.9); ctx.beginPath(); ctx.arc(ax, fy, 8, 0, 6.2832); ctx.stroke(); }
      return;
    }
    // measured
    if (H.hist.length) {
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath();
      var prev = H.hist[0]; ctx.moveTo(m.X(prev[0]), m.Y(prev[1] / H.n0));
      for (i = 1; i < H.hist.length; i++) { var h = H.hist[i]; ctx.lineTo(m.X(h[0]), m.Y(prev[1] / H.n0)); ctx.lineTo(m.X(h[0]), m.Y(h[1] / H.n0)); prev = h; }
      ctx.lineTo(m.X(H.t), m.Y(prev[1] / H.n0)); ctx.stroke();
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(m.X(H.t), m.Y(H.left / H.n0), 3.5, 0, 6.2832); ctx.fill();
    }
    if (H.halfAt !== null) {
      var hx = m.X(H.halfAt), hy = m.Y(0.5); ctx.strokeStyle = hexA(C.pink, 0.9); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, gr.y + gr.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, 6.2832); ctx.fill();
      txt('half gone: ' + fmtTime(H.halfAt), Math.min(hx + 8, gr.x + gr.w - 150), hy - 8, 11, C.pink, 'left', 700);
    }
    var lx = gr.x + gr.w - 6, ly = gr.y + 4;
    ctx.fillStyle = C.green; ctx.fillRect(lx - 128, ly + 6, 14, 2.5); txt('this sample', lx - 108, ly + 11, 10.5, C.muted);
    ctx.strokeStyle = C.gold; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(lx - 128, ly + 24); ctx.lineTo(lx - 114, ly + 24); ctx.stroke(); ctx.setLineDash([]); txt('N₀ · 2^(−t/T½)', lx - 108, ly + 28, 10.5, C.muted);
  }

  // ---------- frame ----------
  var lastUi = 0;
  LAB.loop(function (dt) {
    S.clock += dt;
    if (L.W !== K.w || L.H !== K.h || !L.trays) layout();
    if (S.scene === 'build') drawBuild(dt);
    else { stepHalf(dt); drawHalf(dt); if (S.clock - lastUi > 0.15) { lastUi = S.clock; halfReadouts(); } }
    pumpToasts();
  }, view);

  // ---------- pointer ----------
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function inRect(p, r) { return r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
  function hitTray(p) { for (var k in L.trays) { var tr = L.trays[k], m = tr.minus; if (m && Math.hypot(p.x - m.x, p.y - m.y) <= m.r + 8) return { kind: k, minus: true }; if (inRect(p, tr)) return { kind: k }; } return null; }
  function hitPT(p) {
    var t = L.pt; if (!inRect(p, t)) return 0;
    var col = Math.floor((p.x - t.x) / t.cw) + 1, row = Math.floor((p.y - t.y) / t.ch) + 1;
    for (var z = 1; z <= 36; z++) { var E = AM.el(z); if (E.group === col && E.period === row) return z; }
    return 0;
  }
  function hitChart(p) {
    var c = L.chartCell; if (!L.chart || !c || !inRect(p, L.chart)) return null;
    var n = Math.floor((p.x - c.ox) / c.cell), z = Math.floor((c.oy - p.y) / c.cell);
    if (n < 0 || z < 1 || n > c.maxN || z > c.maxZ) return null;
    return AM.nuclide(z, n) ? { z: z, n: n } : null;
  }
  function hitAtom(p) {
    var d = Math.hypot(p.x - L.cx, p.y - L.cy), rn = nucRadius(S.z + S.n), i, best = -1, bd = 1e9;
    if (S.nucleons.length && d < rn + 8) {
      for (i = 0; i < S.nucleons.length; i++) { var o = S.nucleons[i], dd = Math.hypot(p.x - o.x, p.y - o.y); if (dd < bd) { bd = dd; best = i; } }
      return { kind: S.nucleons[best].p ? 'p' : 'n', idx: best };
    }
    if (!S.electrons.length) return null;
    if (S.view === 'cloud') return d < L.R + 12 && d > rn ? { kind: 'e', idx: S.electrons.length - 1 } : null;
    for (i = 0; i < S.electrons.length; i++) { var q = S.electrons[i], de = Math.hypot(p.x - q.x, p.y - q.y); if (de < bd) { bd = de; best = i; } }
    return bd < 18 ? { kind: 'e', idx: best } : null;
  }
  cv.addEventListener('pointerdown', function (e) {
    var p = pt(e); if (e.pointerType === 'mouse') cv.focus({ preventScroll: true });
    if (S.scene === 'half') {
      if (H.dating && inRect(p, { x: L.graph.x - 12, y: L.graph.y - 10, w: L.graph.w + 24, h: L.graph.h + 30 })) { S.drag = { kind: 'age' }; setGuessAt(p.x); try { cv.setPointerCapture(e.pointerId); } catch (er) { } }
      return;
    }
    if (S.anim) return;
    var t = hitTray(p);
    if (t && t.minus) { tapRemove(t.kind); return; }
    if (t) { S.drag = { kind: t.kind, from: 'tray', x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } return; }
    var z = hitPT(p); if (z) { loadElement(z); return; }
    var ch = hitChart(p); if (ch) { setAtom(ch.z, ch.n, ch.z); return; }
    var h = hitAtom(p);
    if (h) { S.drag = { kind: h.kind, from: 'atom', idx: h.idx, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } }
  });
  cv.addEventListener('pointermove', function (e) {
    var p = pt(e);
    if (S.drag) {
      if (S.drag.kind === 'age') { setGuessAt(p.x); return; }
      S.drag.x = p.x; S.drag.y = p.y; if (Math.hypot(p.x - S.drag.sx, p.y - S.drag.sy) > 6) S.drag.moved = true; return;
    }
    if (S.scene !== 'build') { cv.style.cursor = H.dating && inRect(p, L.graph) ? 'ew-resize' : 'default'; return; }
    var t = hitTray(p), z = hitPT(p), h = !t && !z && hitAtom(p), c = !t && !z && hitChart(p);
    S.hover = t ? 'tray-' + t.kind : null;
    cv.style.cursor = t ? (t.minus ? 'pointer' : 'grab') : z || c ? 'pointer' : h ? 'grab' : 'default';
  });
  function endDrag(e) {
    var D = S.drag; if (!D) return; S.drag = null;
    if (D.kind === 'age') { halfReadouts(); return; }
    var p = pt(e), d = Math.hypot(p.x - L.cx, p.y - L.cy);
    if (D.from === 'tray') {
      if (!D.moved) tapAdd(D.kind);
      else if (d < L.R + 20) add(D.kind, p.x, p.y);
      else { var tr = L.trays[D.kind]; flyTo(D.kind, p.x, p.y, tr.cx, tr.cy, 0.25); }
    } else if (D.from === 'atom') {
      var lim = D.kind === 'e' ? (S.radii && S.radii.length ? S.radii[S.radii.length - 1] + 26 : L.R) : nucRadius(S.z + S.n) + 26;
      if (D.moved && d > lim) { var o = remove(D.kind, D.idx); if (o) { var tr2 = L.trays[D.kind]; flyTo(D.kind, p.x, p.y, tr2.cx, tr2.cy, 0.3); } }
    }
  }
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', function () { S.drag = null; });
  cv.addEventListener('pointerleave', function () { S.hover = null; });
  function setGuessAt(x) {
    var m = graphMap(), u = Math.max(0, Math.min(m.tMax, (x - m.x0) / m.w * m.tMax)), yrs = Math.round(u * 5700 / 10) * 10;
    el.guess.value = yrs; guessOut(); halfReadouts();
  }
  cv.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (S.scene === 'build') {
      if (k === 'p' || k === 'n' || k === 'e') { e.preventDefault(); if (e.shiftKey) tapRemove(k); else tapAdd(k); }
      else if (k === 'd') { e.preventDefault(); decayNow(); }
      else if (k === 'm') { e.preventDefault(); makeNeutral(); }
      else if (k === 'v') { e.preventDefault(); setView(S.view === 'shells' ? 'cloud' : 'shells'); }
    } else {
      if (k === ' ') { e.preventDefault(); togglePause(); }
      else if (H.dating && (k === 'arrowleft' || k === 'arrowright')) { e.preventDefault(); el.guess.value = Math.max(0, Math.min(35000, +el.guess.value + (k === 'arrowright' ? 1 : -1) * (e.shiftKey ? 1000 : 100))); guessOut(); halfReadouts(); }
      else if (k === 'enter' && H.dating) { e.preventDefault(); checkAge(); }
    }
  });

  // ---------- panel ----------
  function showScene(sc) {
    S.scene = sc; el.build.hidden = sc !== 'build'; el.half.hidden = sc !== 'half';
    Array.prototype.forEach.call(el.scenes.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-scene') === sc ? 'true' : 'false'); });
    el.quiz.hidden = !(sc === 'build' && S.z === 6 && S.n === 8 && !MS.isDone('c14'));
    if (sc === 'half' && !H.times && !H.dating) newSample();
    cv.setAttribute('aria-label', sc === 'build' ? CANVAS_BUILD : CANVAS_HALF);
    toolState(); st.set('scene', sc);
  }
  var CANVAS_BUILD = cv.getAttribute('aria-label');
  var CANVAS_HALF = 'Half-life scene: a sample of radioactive nuclei. Gold dots have not decayed yet, blue ones have. Beside it, a graph of how many are left over time, with the exponential decay curve. Space pauses.';
  function toolState() {
    var half = S.scene === 'half';
    el.pause.hidden = !half || !!H.dating; el.speed.hidden = !half || !!H.dating;
    el.pause.textContent = H.playing && !H.done ? '❚❚' : '▶'; el.pause.setAttribute('aria-label', H.playing && !H.done ? 'Pause' : 'Play');
    el.speed.textContent = SPEED_TXT[speedIx]; el.speed.setAttribute('aria-label', 'Playback speed: ' + SPEED_TXT[speedIx]);
    el.reset.setAttribute('aria-label', half ? 'Start a new sample' : 'Start over with an empty atom'); el.reset.title = half ? 'New sample' : 'Start over';
  }
  function togglePause() { if (H.dating) return; if (H.done) { newSample(); return; } H.playing = !H.playing; toolState(); }
  function makeNeutral() {
    if (!S.z || S.e === S.z) return;
    while (S.e < S.z) { S.e++; S.electrons.push({ x: L.cx + (Math.random() - 0.5) * L.R * 2, y: L.cy - L.R * 1.2 }); }
    while (S.e > S.z) { S.e--; S.electrons.pop(); }
    targets(); if (reduced) snap(); changed();
  }
  function setView(v) { S.view = v; st.set('view', v); Array.prototype.forEach.call(el.views.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === v ? 'true' : 'false'); }); }
  el.scenes.addEventListener('click', function (e) { var b = e.target.closest('button[data-scene]'); if (b) showScene(b.getAttribute('data-scene')); });
  root.querySelectorAll('[data-add]').forEach(function (b) { b.addEventListener('click', function () { tapAdd(b.getAttribute('data-add')); }); });
  root.querySelectorAll('[data-rem]').forEach(function (b) { b.addEventListener('click', function () { tapRemove(b.getAttribute('data-rem')); }); });
  el.neutral.addEventListener('click', makeNeutral);
  el.decay.addEventListener('click', decayNow);
  el.views.addEventListener('click', function (e) { var b = e.target.closest('button[data-view]'); if (b) setView(b.getAttribute('data-view')); });
  el.jump.addEventListener('change', function () { var z = +el.jump.value; if (z) loadElement(z); });
  el.pause.addEventListener('click', togglePause);
  el.speed.addEventListener('click', function () { speedIx = (speedIx + 1) % SPEEDS.length; toolState(); });
  el.reset.addEventListener('click', function () { if (S.scene === 'half') newSample(); else { S.anim = null; setAtom(0, 0, 0, true); } });
  el.iso.addEventListener('click', function (e) { var b = e.target.closest('button[data-iso]'); if (!b) return; pickIso(b.getAttribute('data-iso')); newSample(); halfReadouts(); });
  el.size.addEventListener('click', function (e) { var b = e.target.closest('button[data-n]'); if (!b) return; setSize(+b.getAttribute('data-n')); newSample(); });
  el.newS.addEventListener('click', newSample);
  el.date.addEventListener('click', startDating);
  el.guess.addEventListener('input', function () { guessOut(); halfReadouts(); });
  el.check.addEventListener('click', checkAge);
  el.quiz.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-a]'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'n') { el.quiz.hidden = true; complete('c14', 'it has too many neutrons for 6 protons. Stable carbon has 6 or 7. In time, one neutron turns into a proton and carbon-14 becomes nitrogen-14. Press “Let it decay” to watch.'); }
    else if (a === 'e') el.quizFb.textContent = 'Not quite: electrons don’t change the nucleus. Carbon-14 is radioactive whatever its electrons do.';
    else el.quizFb.textContent = 'Not quite: carbon-12 and carbon-13 are stable. Only some isotopes of an element are radioactive.';
  });

  // ---------- start ----------
  layout();
  setView(S.view);
  pickIso('c14'); setSize(1000);
  setAtom(2, 2, 2, true);
  S.lastZ = 2; S.cardFlash = 0;
  if (st.get('scene', 'build') === 'half') showScene('half'); else showScene('build');
})();
