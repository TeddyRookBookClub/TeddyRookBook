/* Mixing Lab: the page. Draws the three benches on one canvas, runs the controls and the missions.
   The chemistry lives in chem.js (window.ChemModel). */
(function () {
  'use strict';
  var LAB = window.TRBLab, CM = window.ChemModel;
  var root = document.getElementById('chem-lab-lab');
  if (!root || !LAB || !CM) return;
  function $(id) { return document.getElementById(id); }
  var view = $('cl-view'), cv = $('cl-cv'), K = LAB.canvas(cv), ctx = K.c;
  var fmt = LAB.fmt, reduced = LAB.reduced, ui = LAB.store('chem-lab-ui');
  var C = { ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', faint: 'rgba(120,170,200,.12)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', panel: 'rgba(11,27,39,.82)' };
  var SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgb(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a === undefined ? 1 : a) + ')'; }
  function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function sci(x) { // 1.0 × 10⁻⁷
    if (!(x > 0) || !isFinite(x)) return '—';
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    if (m >= 9.95) { m /= 10; e++; }
    return m.toFixed(1) + ' × 10' + String(e).split('').map(function (ch) { return SUP[ch] || ch; }).join('');
  }
  function conc(c) { return c >= 1 ? c.toFixed(1) : c >= 0.1 ? c.toFixed(2) : c >= 0.01 ? c.toFixed(3) : c.toFixed(4); }
  function mL(v, d) { return fmt(v, d === undefined ? 2 : d) + ' mL'; }
  function nature(pH) { return !isFinite(pH) ? '—' : pH < 6.995 ? 'acidic' : pH > 7.005 ? 'basic' : 'neutral'; }

  // ---------- the shelf ----------
  var SH = {}; CM.SHELF.forEach(function (s) { SH[s.id] = s; });
  SH.hcl = { id: 'hcl', name: 'Hydrochloric acid', short: 'HCl', tint: [214, 232, 244], op: 0, lab: true };
  SH.naoh = { id: 'naoh', name: 'Sodium hydroxide', short: 'NaOH', tint: [214, 232, 244], op: 0, lab: true };
  SH.water.lab = true;
  var BOTTLES = ['vinegar', 'milk', 'ammonia', 'coffee', 'soda', 'lemon', 'soap', 'cola', 'water', 'hcl', 'naoh'];
  var EVERYDAY = ['vinegar', 'milk', 'ammonia', 'coffee', 'soda', 'lemon', 'soap', 'cola', 'water'];
  var CAPS = { vinegar: '#c9d3c4', milk: '#4f8fd6', ammonia: '#6aa86e', coffee: '#7a4b2a', soda: '#e8a33d', lemon: '#f2d23a', soap: '#d58bd0', cola: '#d23b3b', water: '#74c0fc', hcl: '#ff8787', naoh: '#9b8cf2' };
  var LABEL = { vinegar: 'Vinegar', milk: 'Milk', ammonia: 'Ammonia', coffee: 'Coffee', soda: 'Baking soda', lemon: 'Lemon juice', soap: 'Soapy water', cola: 'Cola', water: 'Water', hcl: 'HCl', naoh: 'NaOH' };
  var CAP_ML = 250, FILL_ML = 100;

  // ---------- state ----------
  var S = { scene: 'mix', paused: false, speedIx: 0, clock: 0, uiClock: 0, hover: null, drag: null };
  var SPEEDS = [1, 2, 4];
  var savedTested = ui.get('tested', {});
  var MX = { kind: 'empty', shelf: null, nA: 0, nB: 0, vA: 0, vB: 0, vW: 0, ind: 'universal', pour: 10, cA: 0.1, cB: 0.1,
    level: 0, tested: typeof savedTested === 'object' && savedTested ? savedTested : {}, cab: {}, sel: 0, anim: null, msg: '', msgT: 0 };
  var TI = { acid: 'hcl', ca: 0.1, cb: 0.1, Va: 25, Ka: Infinity, Vb: 0, rate: 0, lastRate: 0.4, ind: 'phenol', marks: true, cursor: null,
    curve: null, step: 0.01, drops: [], blobs: [], acc: 0, closedFor: 0, passed: false, Veq: 25, swirl: 0, endMsg: false };
  var RX = { box: null, T: 298.15, nA: 40, nB: 40, Ea: 7000, cat: false, topUp: true, base: 1, flashes: [], balls: [], hist: new Float64Array(40), histN: 0,
    recent: [], strip: [], stripClock: 0, preset: 'start' };

  var el = {
    scenes: $('cl-scenes'), note: $('cl-note'), hud: $('cl-hud'), live: $('cl-live'), read: $('cl-read'), readNote: $('cl-read-note'), keys: $('cl-keys'),
    pMix: $('cl-p-mix'), pInd: $('cl-p-ind'), pTitr: $('cl-p-titr'), pRate: $('cl-p-rate'),
    shelf: $('cl-shelf'), pourSeg: $('cl-pour'), ca: $('cl-ca'), cb: $('cl-cb'), rinse: $('cl-rinse'), ind: $('cl-ind'),
    acid: $('cl-acid'), tca: $('cl-tca'), tcaW: $('cl-tca-w'), tcb: $('cl-tcb'), tap: $('cl-tap'), drop: $('cl-drop'), restart: $('cl-restart'), marks: $('cl-marks'), cur: $('cl-cur'), curO: $('cl-cur-o'),
    pre: $('cl-pre'), t: $('cl-t'), tO: $('cl-t-o'), na: $('cl-na'), naO: $('cl-na-o'), nb: $('cl-nb'), nbO: $('cl-nb-o'), ea: $('cl-ea'), eaO: $('cl-ea-o'), cat: $('cl-cat'), sup: $('cl-sup'),
    pause: $('cl-pause'), speed: $('cl-speed'), reset: $('cl-reset')
  };

  // ---------- missions ----------
  var MISSIONS = [
    { id: 'shelf', title: 'Acid or base?', goal: 'Test all nine everyday liquids, water included, and see them sorted on the pH scale.' },
    { id: 'cabbage', title: 'Cabbage colors', goal: 'Turn red cabbage juice three different colors.' },
    { id: 'dilute', title: 'Ten times weaker', goal: 'Dilute some HCl with water to ten times its volume. Its pH goes up by exactly 1.' },
    { id: 'neutral', title: 'Neutralize', goal: 'Mix HCl and NaOH to a pH between 6.5 and 7.5.' },
    { id: 'double', title: 'Twice as fast', goal: 'Make the reaction run at least twice as fast as the start setup.' },
    { id: 'catalyst', title: 'Cool and quick', goal: 'With a catalyst, beat the start setup’s rate at 5 °C or colder.' },
    { id: 'endpoint', title: 'Stop on the dot', goal: 'Close the burette within 0.10 mL of the equivalence point.' },
    { id: 'pka', title: 'Find the pKa', goal: 'Titrate acetic acid past its equivalence point, then read the curve halfway there: pH = pKa.' }
  ];
  var PICK = {
    shelf: function () { setScene('mix'); setInd('universal'); return 'Tap each everyday bottle on the shelf, one after another.'; },
    cabbage: function () { setScene('mix'); setInd('cabbage'); return 'Test something acidic, something neutral and something basic.'; },
    dilute: function () { setScene('mix'); rinse(); setPour(10); return 'Pour 10 mL of HCl, note the pH, then add 90 mL of water.'; },
    neutral: function () { setScene('mix'); rinse(); setInd('universal'); return 'Pour HCl, then NaOH, until the moles of each are equal.'; },
    double: function () { setScene('rate'); loadPreset('start'); return 'Heat the box, add particles, or turn on the catalyst.'; },
    catalyst: function () { setScene('rate'); loadPreset('start'); return 'Turn on the catalyst, then cool the box to 5 °C or below.'; },
    endpoint: function () { setScene('titr'); setAcid('hcl'); setInd('phenol'); return 'Open the tap, slow down near 25 mL and close it at the first pink that stays.'; },
    pka: function () { setScene('titr'); setAcid('acetic'); setInd('phenol'); return 'Run past the jump at 25 mL, then read the curve at 12.50 mL.'; }
  };
  var MS = LAB.missions($('cl-missions'), 'chem-lab', MISSIONS, function (id) { var f = PICK[id]; if (!f) return; var hint = f(); toastQ = []; toastAt = -10; say(hint); });
  var toastQ = [], toastAt = -10;
  function say(text) { toastQ.push(text); pumpToasts(); }
  function pumpToasts() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.9) { toastAt = now; LAB.toast(view, toastQ.shift()); } }
  function win(id, text) {
    if (!MS.done(id)) return;
    var m = MISSIONS.filter(function (x) { return x.id === id; })[0], q = /[?!]$/.test(m.title);
    var t = q ? text.charAt(0).toUpperCase() + text.slice(1) : text;
    say('✓ ' + m.title + (q ? ' ' : ': ') + t); speak(m.title + (q ? ' ' : ': ') + t);
  }
  function speak(t) { el.live.textContent = t; }

  // =====================================================================================
  // Bench 1: acids and bases
  // =====================================================================================
  function mixVolume() { return MX.kind === 'shelf' ? FILL_ML : MX.vA + MX.vB + MX.vW; }       // mL
  function mixPH() {
    if (MX.kind === 'shelf') return SH[MX.shelf].pH;
    if (MX.kind === 'lab') return CM.phStrong(MX.nA, MX.nB, mixVolume() / 1000);
    return NaN;
  }
  function rinse() { MX.kind = 'empty'; MX.shelf = null; MX.nA = MX.nB = MX.vA = MX.vB = MX.vW = 0; }
  function pour(id) {
    var b = SH[id]; if (!b) return;
    MX.sel = BOTTLES.indexOf(id);
    if (!b.lab) {
      rinse(); MX.kind = 'shelf'; MX.shelf = id;
      MX.anim = { id: id, t: 0, dur: 0.9 };
    } else {
      var note = '';
      if (MX.kind === 'shelf') { rinse(); note = 'Rinsed the beaker first: the everyday liquids are not mixed here. '; }
      var v = MX.pour;
      if (mixVolume() + v > CAP_ML + 1e-9) { flash('The beaker is full (250 mL). Rinse it to start again.'); return; }
      if (id === 'water') MX.vW += v;
      else if (id === 'hcl') { MX.vA += v; MX.nA += MX.cA * v / 1000; }
      else { MX.vB += v; MX.nB += MX.cB * v / 1000; }
      MX.kind = 'lab'; MX.anim = { id: id, t: 0, dur: v >= 10 ? 0.7 : 0.4 };
      if (note) flash(note);
    }
    afterMix(true);
  }
  function flash(t) { MX.msg = t; MX.msgT = 4; }
  function contents() {
    if (MX.kind === 'empty') return 'nothing yet';
    if (MX.kind === 'shelf') return FILL_ML + ' mL of ' + SH[MX.shelf].name.toLowerCase();
    var parts = [];
    if (MX.vA > 0) parts.push(fmt(MX.vA, MX.vA < 1 ? 2 : 1) + ' mL HCl');
    if (MX.vB > 0) parts.push(fmt(MX.vB, MX.vB < 1 ? 2 : 1) + ' mL NaOH');
    if (MX.vW > 0) parts.push(fmt(MX.vW, MX.vW < 1 ? 2 : 1) + ' mL water');
    return parts.join(' + ');
  }
  function afterMix(poured) {
    var pH = mixPH();
    if (MX.kind === 'shelf') MX.tested[MX.shelf] = 1;
    if (MX.kind === 'lab' && MX.vA === 0 && MX.vB === 0 && MX.vW > 0) MX.tested.water = 1;
    ui.set('tested', MX.tested);
    if (MX.ind === 'cabbage' && MX.kind !== 'empty') MX.cab[CM.cabbageName(pH)] = 1;
    shelfButtons(); updateReadout(); hud();
    if (poured && MX.kind !== 'empty') {
      var ic = CM.indicator(MX.ind, pH);
      speak(contents() + ': pH ' + (MX.kind === 'shelf' ? 'about ' + fmt(pH, 1) : fmt(pH, 2)) + ', ' + nature(pH) + (MX.ind !== 'none' ? '. ' + CM.INDICATORS[MX.ind].name + ' turns ' + ic.name + '.' : '.'));
    }
    checkMix();
  }
  function checkMix() {
    var pH = mixPH();
    var n = EVERYDAY.filter(function (id) { return MX.tested[id]; }).length;
    if (n >= EVERYDAY.length) win('shelf', 'acids below 7 (lemon, cola, vinegar, coffee, milk), water at 7, bases above (baking soda, soap, ammonia).');
    var cabs = Object.keys(MX.cab);
    if (cabs.length >= 3) win('cabbage', cabs.slice(0, 4).join(', ') + '. The same juice reads the whole pH scale.');
    if (MX.kind === 'lab' && MX.vA > 0 && MX.vB === 0 && MX.vW > 0 && Math.abs(mixVolume() / MX.vA - 10) < 0.15) {
      win('dilute', 'pH ' + fmt(CM.phStrong(MX.nA, 0, MX.vA / 1000), 2) + ' → ' + fmt(pH, 2) + '. Ten times less hydronium per liter, one step up the scale.');
    }
    if (MX.kind === 'lab' && MX.nA > 0 && MX.nB > 0 && pH >= 6.5 && pH <= 7.5)
      win('neutral', fmt(MX.nA * 1000, 3) + ' mmol of acid met ' + fmt(MX.nB * 1000, 3) + ' mmol of base: pH ' + fmt(pH, 2) + '.');
  }
  function setPour(v) {
    MX.pour = v;
    var bs = el.pourSeg.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', +bs[i].getAttribute('data-v') === v ? 'true' : 'false');
  }
  function setInd(id) {
    if (S.scene === 'titr') TI.ind = id; else MX.ind = id;
    syncInd();
    if (S.scene === 'mix') afterMix(false);
  }
  function syncInd() {
    var cur = S.scene === 'titr' ? TI.ind : MX.ind, bs = el.ind.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-ind') === cur ? 'true' : 'false');
  }
  function shelfButtons() {
    if (!el.shelf.childNodes.length) {
      el.shelf.innerHTML = BOTTLES.map(function (id) {
        var b = SH[id], sw = id === 'hcl' || id === 'naoh' ? CAPS[id] : rgb(b.tint);
        return '<button type="button" data-b="' + id + '" class="' + (b.lab && id !== 'water' ? 'chem-lab-btl' : '') + '" aria-label="Pour ' + b.name + '"><i style="background:' + sw + '"></i>' + LABEL[id] + '</button>';
      }).join('');
    }
    var bs = el.shelf.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) { var id = bs[i].getAttribute('data-b'); bs[i].classList.toggle('chem-lab-tested', !!(MX.tested[id] && EVERYDAY.indexOf(id) >= 0)); }
  }

  // =====================================================================================
  // Bench 2: titration
  // =====================================================================================
  var TSEED = 0;
  function setAcid(a) {
    TI.acid = a;
    var bs = el.acid.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-acid') === a ? 'true' : 'false');
    el.tcaW.hidden = a === 'mystery';
    freshFlask();
  }
  function freshFlask() {
    TI.Ka = TI.acid === 'acetic' ? CM.KA_ACETIC : Infinity;
    if (TI.acid === 'mystery') { TSEED++; var r = CM.mulberry((Date.now() & 0xffff) + TSEED * 7919)(); TI.ca = Math.round((0.06 + 0.08 * r) * 1000) / 1000; }
    else TI.ca = +el.tca.value;
    TI.cb = +el.tcb.value;
    TI.Veq = TI.ca * TI.Va / TI.cb;
    TI.Vb = 0; TI.drops = []; TI.blobs = []; TI.acc = 0; TI.closedFor = 0; TI.passed = false; TI.cursor = null; TI.endMsg = false;
    setTap(0);
    // the whole curve, every 0.01 mL up to 50 mL, so it can be drawn as far as the base has gone
    var n = Math.round(50 / TI.step) + 1, cur = new Float32Array(n);
    for (var i = 0; i < n; i++) cur[i] = CM.phTitration(TI.ca, TI.Va / 1000, TI.Ka, TI.cb, i * TI.step / 1000);
    TI.curve = cur;
    el.cur.value = 0; el.curO.textContent = '—';
  }
  function titrPH(v) { return CM.phTitration(TI.ca, TI.Va / 1000, TI.Ka, TI.cb, (v === undefined ? TI.Vb : v) / 1000); }
  function setTap(r) {
    if (r > 0) TI.lastRate = r;
    TI.rate = r;
    var bs = el.tap.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', +bs[i].getAttribute('data-rate') === r ? 'true' : 'false');
    if (r === 0 && S.scene === 'titr' && TI.Vb > 0) speak('Tap closed at ' + mL(TI.Vb) + ', pH ' + fmt(titrPH(), 2) + '.');
  }
  function addBase(v, visual) {
    if (TI.Vb >= 50 - 1e-9) { setTap(0); say('The burette is empty. Press Fresh flask to start again.'); return; }
    var before = TI.Vb; TI.Vb = Math.min(50, Math.round((TI.Vb + v) * 1e6) / 1e6);
    TI.closedFor = 0;
    if (visual) TI.drops.push({ y: 0, v: 0 });
    if (before < TI.Veq + 0.5 && TI.Vb >= TI.Veq + 0.5) TI.passed = true;
  }
  function checkTitr(dt) {
    if (TI.rate === 0 && TI.Vb > 0 && Math.abs(TI.Vb - TI.Veq) <= 0.10 + 1e-9) {
      TI.closedFor += dt;
      if (TI.closedFor > 0.6) win('endpoint', 'you stopped at ' + mL(TI.Vb) + '; the equivalence point is ' + mL(TI.Veq) + ' (pH ' + fmt(titrPH(TI.Veq), 2) + ').');
    } else TI.closedFor = 0;
    if (TI.acid === 'acetic' && TI.passed && TI.cursor !== null && Math.abs(TI.cursor - TI.Veq / 2) <= 0.25)
      win('pka', 'at ' + mL(TI.cursor) + ' the pH is ' + fmt(titrPH(TI.cursor), 3) + '; pKa of acetic acid = ' + fmt(CM.pKa(CM.KA_ACETIC), 3) + '.');
  }
  function setCursor(v) {
    if (v === null) { TI.cursor = null; el.curO.textContent = '—'; return; }
    v = clamp(Math.round(v / 0.05) * 0.05, 0, Math.max(0, TI.Vb));
    TI.cursor = v; el.cur.value = v;
    el.curO.textContent = mL(v) + ' → pH ' + fmt(titrPH(v), 3);
  }

  // =====================================================================================
  // Bench 3: reaction rates
  // =====================================================================================
  var PRESETS = {
    start: { T: 25, nA: 40, nB: 40, Ea: 7, cat: false, note: 'The start setup: 25 °C, 40 A and 40 B, a 7 kJ/mol barrier.' },
    hot: { T: 120, nA: 40, nB: 40, Ea: 7, cat: false, note: 'The same mix at 120 °C: faster particles, and more of them hit hard enough.' },
    crowd: { T: 25, nA: 80, nB: 80, Ea: 7, cat: false, note: 'Twice as many of each: four times as many A–B meetings.' },
    cat: { T: 25, nA: 40, nB: 40, Ea: 7, cat: true, note: 'A catalyst halves the barrier. Look at the hill and the energy chart.' },
    cold: { T: 0, nA: 40, nB: 40, Ea: 7, cat: false, note: 'At 0 °C fewer collisions are hard enough.' }
  };
  function newBox() {
    RX.box = new CM.Box({ seed: ((Date.now() % 100000) + 1) | 0, T: RX.T, Ea: RX.Ea, cat: RX.cat, topUp: RX.topUp });
    RX.box.add(CM.A, RX.nA); RX.box.add(CM.B, RX.nB);
    // the start setup's rate, from collision theory, for the "times the start" readout and the missions
    var ref = new CM.Box({ seed: 3, T: 298.15, Ea: 7000 }); ref.add(CM.A, 40); ref.add(CM.B, 40); RX.base = ref.predicted().rate;
    changed();
  }
  function loadPreset(id) {
    var p = PRESETS[id] || PRESETS.start; RX.preset = id;
    RX.T = p.T + 273.15; RX.nA = p.nA; RX.nB = p.nB; RX.Ea = p.Ea * 1000; RX.cat = p.cat; RX.topUp = true;
    newBox(); syncRate(); el.note.textContent = p.note;
  }
  function changed() { // anything the visitor changes starts a new measurement
    var b = RX.box; b.resetStats(); b.events = [];
    RX.hist = new Float64Array(40); RX.histN = 0; RX.recent = [];
  }
  function syncRate() {
    el.t.value = Math.round(RX.T - 273.15); el.tO.textContent = Math.round(RX.T - 273.15) + ' °C';
    el.na.value = RX.nA; el.naO.textContent = RX.nA; el.nb.value = RX.nB; el.nbO.textContent = RX.nB;
    el.ea.value = RX.Ea / 1000; el.eaO.textContent = fmt(RX.Ea / 1000, 1) + ' kJ/mol';
    el.cat.checked = RX.cat; el.sup.checked = RX.topUp;
  }
  function rateNow() { // measured since the last change
    var s = RX.box.stats; return s.t > 0 ? s.react / s.t : 0;
  }
  function checkRate() {
    var s = RX.box.stats; if (s.t < 8 || s.react < 20) return;
    var meas = s.react / s.t, pred = RX.box.predicted().rate, base = RX.base;
    if (meas >= 1.8 * base && pred >= 1.95 * base) win('double', 'you measured ×' + fmt(meas / base, 1) + ' the start rate (collision theory says ×' + fmt(pred / base, 1) + ').');
    if (RX.cat && RX.T <= 278.15 + 1e-6 && meas >= base && pred >= base) win('catalyst', 'at ' + Math.round(RX.T - 273.15) + ' °C with the catalyst, the rate is ×' + fmt(meas / base, 1) + ' the start setup at 25 °C.');
  }

  // =====================================================================================
  // scenes and controls
  // =====================================================================================
  var NOTES = {
    mix: 'Tap a bottle to pour it. Everyday liquids fill a clean beaker; water, HCl and NaOH add the pour size and mix.',
    titr: 'Open the tap to drip sodium hydroxide into the acid, and close it at the equivalence point. Tap the graph to read it.'
  };
  var KEYS = {
    mix: 'Keys, with the bench selected: ← → pick a bottle, Enter pours it, I changes the indicator, Backspace rinses, R starts again.',
    titr: 'Keys, with the bench selected: space opens or closes the tap, ↓ adds one drop, ← → move the reading line (Shift: 1 mL), R gives a fresh flask.',
    rate: 'Keys, with the bench selected: ← → temperature, ↑ ↓ particles of A, C the catalyst, space pauses, R the start setup.'
  };
  function setScene(id) {
    if (!NOTES[id] && id !== 'rate') id = 'mix';
    S.scene = id; ui.set('scene', id);
    var bs = el.scenes.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-scene') === id ? 'true' : 'false');
    el.pMix.hidden = id !== 'mix'; el.pTitr.hidden = id !== 'titr'; el.pRate.hidden = id !== 'rate'; el.pInd.hidden = id === 'rate';
    el.pause.hidden = id === 'mix'; el.speed.hidden = id !== 'rate';
    el.note.textContent = id === 'rate' ? (PRESETS[RX.preset] || PRESETS.start).note : NOTES[id];
    el.keys.textContent = KEYS[id];
    syncInd(); buildReadout(); S.uiClock = 1;
  }
  function buildReadout() {
    var rows = S.scene === 'mix' ? [['pH', 'r-ph'], ['Acid or base', 'r-nat'], ['[H₃O⁺]', 'r-h'], ['[OH⁻]', 'r-oh'], ['Indicator color', 'r-ind'], ['In the beaker', 'r-in'], ['HCl in it', 'r-na'], ['NaOH in it', 'r-nb']]
      : S.scene === 'titr' ? [['NaOH added', 'r-vb'], ['pH', 'r-ph'], ['Acid in the flask', 'r-acid'], ['Acid at the start', 'r-n0'], ['NaOH added so far', 'r-nb'], ['Equivalence point', 'r-eq'], ['Your result', 'r-res'], ['Reading line', 'r-cur']]
        : [['Reactions per s', 'r-rate'], ['Times the start', 'r-x'], ['Theory says', 'r-pred'], ['A–B collisions per s', 'r-coll'], ['Share that react', 'r-frac'], ['e^(−Ea/RT)', 'r-exp'], ['Measured over', 'r-over']];
    el.read.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd id="cl-' + r[1] + '">—</dd>'; }).join('');
  }
  function setText(id, t) { var e = $('cl-' + id); if (e && e.textContent !== t) e.textContent = t; }
  function updateReadout() {
    if (S.scene === 'mix') {
      var pH = mixPH(), ic = CM.indicator(MX.ind, pH), sh = MX.kind === 'shelf' ? SH[MX.shelf] : null;
      setText('r-ph', MX.kind === 'empty' ? '—' : sh ? 'about ' + fmt(pH, 1) : fmt(pH, 2));
      setText('r-nat', MX.kind === 'empty' ? '—' : nature(pH));
      setText('r-h', MX.kind === 'empty' ? '—' : (sh ? '≈ ' : '') + sci(Math.pow(10, -pH)) + ' mol/L');
      setText('r-oh', MX.kind === 'empty' ? '—' : (sh ? '≈ ' : '') + sci(Math.pow(10, pH - 14)) + ' mol/L');
      setText('r-ind', MX.kind === 'empty' || MX.ind === 'none' ? '—' : ic.name);
      setText('r-in', MX.kind === 'empty' ? 'empty' : MX.kind === 'shelf' ? sh.short : fmt(mixVolume(), mixVolume() < 1 ? 2 : 1) + ' mL');
      setText('r-na', MX.kind === 'lab' ? fmt(MX.nA * 1000, 3) + ' mmol' : '—');
      setText('r-nb', MX.kind === 'lab' ? fmt(MX.nB * 1000, 3) + ' mmol' : '—');
      el.readNote.textContent = MX.kind === 'shelf' ? sh.name + ': typical pH ' + (sh.lo === sh.hi ? 'about ' + fmt(sh.pH, 1) : fmt(sh.lo, 1) + ' to ' + fmt(sh.hi, 1)) + '. Real samples vary, so this bench shows a typical value and does not mix everyday liquids.'
        : MX.kind === 'lab' ? 'In the beaker: ' + contents() + '. The pH is exact for this mix at 25 °C. 1 mmol = 0.001 mol.'
          : 'Tested ' + EVERYDAY.filter(function (id) { return MX.tested[id]; }).length + ' of 9 everyday liquids so far.';
    } else if (S.scene === 'titr') {
      var p = titrPH();
      setText('r-vb', mL(TI.Vb)); setText('r-ph', fmt(p, 2));
      setText('r-acid', TI.Va.toFixed(2) + ' mL, ' + (TI.acid === 'mystery' ? '? mol/L' : TI.ca.toFixed(3) + ' mol/L'));
      setText('r-n0', TI.acid === 'mystery' ? '? mmol' : fmt(TI.ca * TI.Va, 3) + ' mmol');
      setText('r-nb', fmt(TI.cb * TI.Vb, 3) + ' mmol');
      setText('r-eq', TI.passed || TI.acid !== 'mystery' ? mL(TI.Veq) + ', pH ' + fmt(titrPH(TI.Veq), 2) : 'find it!');
      setText('r-res', TI.Vb > 0 ? fmt(TI.cb * TI.Vb / TI.Va, 4) + ' mol/L' : '—');
      setText('r-cur', TI.cursor === null ? 'tap the graph' : mL(TI.cursor) + ' → pH ' + fmt(titrPH(TI.cursor), 3));
      el.readNote.textContent = (TI.acid === 'acetic' ? 'Acetic acid: Ka = 1.8 × 10⁻⁵, pKa = 4.74. ' : TI.acid === 'mystery' ? (TI.passed ? 'The mystery acid was ' + TI.ca.toFixed(3) + ' mol/L HCl. ' : 'A strong acid of unknown concentration. ') : 'HCl is a strong acid. ')
        + '"Your result" is the acid concentration if you stopped right now: NaOH concentration × volume added ÷ 25.00 mL.';
    } else {
      var b = RX.box, s = b.stats, r = rateNow(), pr = b.predicted(), err = s.t > 0 ? Math.sqrt(Math.max(1, s.react)) / s.t : 0;
      setText('r-rate', s.t > 0.5 ? fmt(r, r < 10 ? 2 : 1) + ' ± ' + fmt(err, err < 1 ? 2 : 1) : '—');
      setText('r-x', s.t > 0.5 ? '×' + fmt(r / RX.base, 2) : '—');
      setText('r-pred', fmt(pr.rate, pr.rate < 10 ? 2 : 1));
      setText('r-coll', s.t > 0.5 ? fmt(s.coll / s.t, 1) : '—');
      setText('r-frac', s.coll > 0 ? fmt(100 * s.react / s.coll, 2) + '%' : '—');
      setText('r-exp', fmt(100 * Math.exp(-b.EaEff() / (CM.R * b.T)), 2) + '%');
      setText('r-over', fmt(s.t, 0) + ' s, ' + s.react + ' reactions');
      el.readNote.textContent = 'Measured since your last change, per second of box time. The ± is the counting uncertainty: wait and it shrinks. Theory: how often A meets B, times e^(−Ea/RT), the share of meetings hard enough.' + (RX.cat ? ' The catalyst halves Ea to ' + fmt(b.EaEff() / 1000, 1) + ' kJ/mol.' : '');
    }
  }

  // ---------- control wiring ----------
  el.scenes.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setScene(b.getAttribute('data-scene')); });
  el.shelf.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pour(b.getAttribute('data-b')); });
  el.pourSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setPour(+b.getAttribute('data-v')); });
  el.ca.addEventListener('change', function () { MX.cA = +el.ca.value; });
  el.cb.addEventListener('change', function () { MX.cB = +el.cb.value; });
  el.rinse.addEventListener('click', function () { rinse(); afterMix(false); speak('The beaker is empty.'); });
  el.ind.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setInd(b.getAttribute('data-ind')); });
  el.acid.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setAcid(b.getAttribute('data-acid')); });
  el.tca.addEventListener('change', freshFlask);
  el.tcb.addEventListener('change', freshFlask);
  el.tap.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setTap(+b.getAttribute('data-rate')); });
  el.drop.addEventListener('click', function () { addBase(0.05, true); });
  el.restart.addEventListener('click', freshFlask);
  el.marks.addEventListener('change', function () { TI.marks = el.marks.checked; });
  el.cur.addEventListener('input', function () { setCursor(+el.cur.value); });
  el.pre.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) loadPreset(b.getAttribute('data-pre')); });
  el.t.addEventListener('input', function () { RX.T = +el.t.value + 273.15; RX.box.setT(RX.T); changed(); syncRate(); });
  el.na.addEventListener('input', function () { RX.nA = +el.na.value; RX.box.setCount(CM.A, RX.nA); changed(); syncRate(); });
  el.nb.addEventListener('input', function () { RX.nB = +el.nb.value; RX.box.setCount(CM.B, RX.nB); changed(); syncRate(); });
  el.ea.addEventListener('input', function () { RX.Ea = +el.ea.value * 1000; RX.box.Ea = RX.Ea; changed(); syncRate(); });
  el.cat.addEventListener('change', function () { RX.cat = el.cat.checked; RX.box.cat = RX.cat; changed(); });
  el.sup.addEventListener('change', function () {
    RX.topUp = el.sup.checked; var b = RX.box; b.topUp = RX.topUp;
    if (RX.topUp) { b.clearProducts(); b.setCount(CM.A, RX.nA); b.setCount(CM.B, RX.nB); }
    else for (var i = 0; i < b.p.length; i++) b.p[i].ghost = false;
    changed();
  });
  el.pause.addEventListener('click', togglePause);
  el.speed.addEventListener('click', function () { S.speedIx = (S.speedIx + 1) % SPEEDS.length; el.speed.textContent = SPEEDS[S.speedIx] + '×'; el.speed.setAttribute('aria-label', 'Playback speed: ' + SPEEDS[S.speedIx] + ' times'); });
  el.reset.addEventListener('click', resetScene);
  function togglePause() { S.paused = !S.paused; el.pause.textContent = S.paused ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', S.paused ? 'Play' : 'Pause'); }
  function resetScene() {
    if (S.scene === 'mix') { rinse(); afterMix(false); }
    else if (S.scene === 'titr') freshFlask();
    else loadPreset('start');
  }

  // =====================================================================================
  // layout and drawing
  // =====================================================================================
  var L = {};
  function layout() {
    var w = K.w, h = K.h, narrow = w < 620;
    L.w = w; L.h = h; L.narrow = narrow;
    if (S.scene === 'mix') {
      var cols = narrow ? 6 : 11, rows = narrow ? 2 : 1, slot = (w - 24) / cols, bh = narrow ? 50 : 68, rowH = bh + (narrow ? 48 : 38);
      L.slot = slot; L.bh = bh; L.rowH = rowH; L.cols = cols; L.shelfY = narrow ? 64 : 54;
      L.shelfBottom = L.shelfY + rows * rowH;
      L.scaleY = h - (narrow ? 40 : 44); L.markTop = L.scaleY - 56;
      var bTop = L.shelfBottom + (narrow ? 12 : 44), bBot = L.markTop - (narrow ? 22 : 16);
      var bw = clamp(narrow ? w * 0.4 : w * 0.21, 110, 200);
      L.beaker = { x: (narrow ? w * 0.27 : w * 0.22) - bw / 2, y: bTop, w: bw, h: Math.max(80, bBot - bTop) };
      var mx = L.beaker.x + bw + (narrow ? 16 : 40), mw = Math.min(narrow ? w - mx - 10 : 210, w - mx - 12);
      L.meter = { x: mx, y: bTop + 4, w: mw, h: narrow ? 92 : 108 };
      L.card = { x: mx, y: L.meter.y + L.meter.h + 12, w: mw, h: narrow ? 64 : 74 };
      var nx = mx + mw + 20;
      L.book = !narrow && w - 16 - nx >= 170 ? { x: nx, y: bTop + 4, w: w - 16 - nx, h: Math.min(bBot - bTop - 4, 196) } : null;
    } else if (S.scene === 'titr') {
      if (narrow) {
        L.bur = { x: w * 0.22, top: 84, bot: Math.min(h * 0.42, 280) };
        L.flask = { cx: w * 0.22, top: L.bur.bot + 30, bot: L.bur.bot + 30 + 86, bw: 104 };
        L.box = { x: w * 0.45, y: 96, w: w * 0.55 - 12, h: 92 };
        L.graph = { x: 42, y: L.flask.bot + 26, w: w - 42 - 14, h: h - (L.flask.bot + 26) - 34 };
      } else {
        var zx = w * 0.17;
        L.bur = { x: zx, top: 92, bot: h * 0.58 };
        L.flask = { cx: zx, top: L.bur.bot + 36, bot: h - 22, bw: Math.min(170, w * 0.22) };
        L.box = null;
        L.graph = { x: w * 0.38 + 34, y: 84, w: w - (w * 0.38 + 34) - 22, h: h - 84 - 46 };
      }
    } else {
      if (narrow) {
        var bw2 = w - 24, bh2 = bw2 * 0.75;
        L.box = { x: 12, y: 62, w: bw2, h: bh2 };
        L.meterR = { x: 12, y: L.box.y + bh2 + 10, w: w - 24, h: 66 };
        var top = L.meterR.y + L.meterR.h + 8, half = (w - 30) / 2;
        L.diag = { x: 12, y: top, w: half, h: h - top - 10 };
        L.hist = { x: 18 + half, y: top, w: half, h: h - top - 10 };
        L.strip = null;
      } else {
        var bw3 = Math.min(w * 0.6, (h - 70 - 150) / 0.75), bh3 = bw3 * 0.75;
        L.box = { x: 16, y: 52, w: bw3, h: bh3 };
        L.strip = { x: 16, y: L.box.y + bh3 + 14, w: bw3, h: h - (L.box.y + bh3 + 14) - 14 };
        var rx = bw3 + 36, rw = w - rx - 16, ch = (h - 52 - 16 - 24) / 3;
        L.meterR = { x: rx, y: 52, w: rw, h: ch * 0.8 };
        L.diag = { x: rx, y: L.meterR.y + L.meterR.h + 12, w: rw, h: ch * 1.1 };
        L.hist = { x: rx, y: L.diag.y + L.diag.h + 12, w: rw, h: h - (L.diag.y + L.diag.h + 12) - 16 };
      }
    }
  }
  function panel(r, title) {
    ctx.fillStyle = 'rgba(11,27,39,.72)'; ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    rr(r.x, r.y, r.w, r.h, 10); ctx.fill(); ctx.stroke();
    if (title) { ctx.fillStyle = C.ink; ctx.font = '600 12px ' + SANS; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(title, r.x + 10, r.y + 18); }
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function text(t, x, y, font, color, align, base) { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = base || 'alphabetic'; ctx.fillText(t, x, y); }
  function background() {
    var g = ctx.createRadialGradient(L.w * 0.5, L.h * 0.35, 20, L.w * 0.5, L.h * 0.5, Math.max(L.w, L.h) * 0.75);
    g.addColorStop(0, '#0d2131'); g.addColorStop(1, '#06111a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, L.w, L.h);
  }

  // ---------- bench 1 drawing ----------
  function bottleAt(i) {
    var row = L.narrow ? (i < 6 ? 0 : 1) : 0, col = L.narrow ? (i < 6 ? i : i - 6) : i;
    var off = L.narrow && row === 1 ? L.slot * 0.5 : 0;
    return { x: 12 + off + L.slot * (col + 0.5), y: L.shelfY + row * L.rowH, row: row };
  }
  function drawBottle(id, i, hot) {
    var p = bottleAt(i), b = SH[id], lift = 0, tilt = 0;
    if (MX.anim && MX.anim.id === id) { var t = MX.anim.t / MX.anim.dur; lift = Math.sin(Math.min(1, t) * Math.PI) * 8; tilt = Math.sin(Math.min(1, t) * Math.PI) * 0.25; }
    var bw = Math.min(L.slot * 0.56, L.narrow ? 30 : 38), bh = L.bh, x = p.x, y = p.y + 4 - lift, lab = id === 'hcl' || id === 'naoh';
    ctx.save(); ctx.translate(x, y + bh); ctx.rotate(tilt); ctx.translate(-x, -(y + bh));
    if (hot) { ctx.shadowColor = 'rgba(99,230,190,.55)'; ctx.shadowBlur = 14; }
    // glass body
    var neck = bw * 0.36, top = y + bh * 0.2, bodyTop = y + bh * 0.38;
    ctx.beginPath();
    ctx.moveTo(x - neck / 2, y + 4); ctx.lineTo(x - neck / 2, top); ctx.quadraticCurveTo(x - bw / 2, top + 2, x - bw / 2, bodyTop);
    ctx.lineTo(x - bw / 2, y + bh - 5); ctx.quadraticCurveTo(x - bw / 2, y + bh, x - bw / 2 + 5, y + bh); ctx.lineTo(x + bw / 2 - 5, y + bh);
    ctx.quadraticCurveTo(x + bw / 2, y + bh, x + bw / 2, y + bh - 5); ctx.lineTo(x + bw / 2, bodyTop); ctx.quadraticCurveTo(x + bw / 2, top + 2, x + neck / 2, top); ctx.lineTo(x + neck / 2, y + 4); ctx.closePath();
    ctx.fillStyle = lab ? 'rgba(120,80,40,.55)' : 'rgba(200,225,240,.10)'; ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = hot ? C.green : 'rgba(200,225,240,.55)'; ctx.lineWidth = hot ? 1.6 : 1.1; ctx.stroke();
    // liquid
    var lt = y + bh * 0.48;
    ctx.save(); ctx.clip();
    ctx.fillStyle = lab ? 'rgba(214,232,244,.35)' : rgb(b.tint, 0.35 + b.op * 0.6); ctx.fillRect(x - bw / 2, lt, bw, y + bh - lt);
    ctx.restore();
    // cap and label
    ctx.fillStyle = CAPS[id]; rr(x - neck / 2 - 2, y - 2, neck + 4, 7, 2); ctx.fill();
    var lh = Math.min(16, bh * 0.24), ly = y + bh * 0.58;
    ctx.fillStyle = lab ? '#f4efe2' : 'rgba(255,255,255,.85)'; ctx.fillRect(x - bw / 2 + 3, ly, bw - 6, lh);
    ctx.fillStyle = CAPS[id]; ctx.fillRect(x - bw / 2 + 3, ly, bw - 6, 3);
    if (lab) text(id === 'hcl' ? 'HCl' : 'NaOH', x, ly + lh - 3, '700 ' + (L.narrow ? 7 : 8) + 'px ' + SANS, '#3b2a1a', 'center');
    ctx.restore();
    // name and concentration
    var nm = LABEL[id], fs = L.narrow ? 10 : 11, font = '600 ' + fs + 'px ' + SANS, lineY = p.y + bh + 18;
    ctx.font = font;
    if (ctx.measureText(nm).width > L.slot - 4 && nm.indexOf(' ') > 0) {
      var parts = nm.split(' '); text(parts[0], x, lineY - 1, font, hot ? C.green : C.ink, 'center'); text(parts.slice(1).join(' '), x, lineY + fs, font, hot ? C.green : C.ink, 'center'); lineY += fs;
    } else text(nm, x, lineY, font, hot ? C.green : C.ink, 'center');
    var sub = id === 'water' ? (MX.tested.water ? 'pH 7.00' : 'pure') : lab ? conc(id === 'hcl' ? MX.cA : MX.cB) + ' M' : MX.tested[id] ? 'pH ~' + fmt(b.pH, 1) : '';
    if (sub) text(sub, x, lineY + 12, fs - 1 + 'px ' + (lab && id !== 'water' ? SANS : MONO), C.muted, 'center');
  }
  function liquidColor() {
    var pH = mixPH(), base = MX.kind === 'shelf' ? SH[MX.shelf].tint : [205, 228, 242], op = MX.kind === 'shelf' ? SH[MX.shelf].op : 0;
    var ic = CM.indicator(MX.ind, pH);
    if (!(ic.a > 0)) return { c: base, a: Math.max(0.22, op * 0.95) };
    var c = mixc(ic.rgb, base, op * 0.85);
    if (ic.a < 0.9) c = mixc(base, c, ic.a / 0.9);
    return { c: c, a: Math.max(0.3 + 0.55 * ic.a, op * 0.95) };
  }
  function drawBeaker(dt) {
    var B = L.beaker, x = B.x, y = B.y, w = B.w, h = B.h, lip = 8;
    var target = MX.kind === 'empty' ? 0 : mixVolume();
    MX.level += (target - MX.level) * Math.min(1, dt * (reduced ? 30 : 6));
    if (Math.abs(target - MX.level) < 0.01) MX.level = target;
    // pouring stream
    if (MX.anim) {
      var b = SH[MX.anim.id], t = MX.anim.t / MX.anim.dur;
      if (t < 0.85) {
        var col = b.lab ? [205, 228, 242] : b.tint, sx = x + w * 0.5, top = y - 34, surf = y + h - h * Math.min(1, MX.level / CAP_ML);
        ctx.strokeStyle = rgb(col, 0.75); ctx.lineWidth = MX.pour < 1 && b.lab ? 2 : 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx, top); ctx.lineTo(sx, surf - 2); ctx.stroke(); ctx.lineCap = 'butt';
      }
    }
    // liquid
    var lv = h * Math.min(1, MX.level / CAP_ML), lc = liquidColor();
    if (lv > 0.5) {
      var g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, rgb(mixc(lc.c, [0, 0, 0], 0.18), lc.a)); g.addColorStop(0.45, rgb(lc.c, lc.a)); g.addColorStop(1, rgb(mixc(lc.c, [0, 0, 0], 0.25), lc.a));
      ctx.fillStyle = g; rr(x + 2, y + h - lv, w - 4, lv - 2, 6); ctx.fill();
      ctx.fillStyle = rgb(mixc(lc.c, [255, 255, 255], 0.35), Math.min(1, lc.a + 0.1)); ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - lv, w / 2 - 3, 4, 0, 0, Math.PI * 2); ctx.fill();
      if (!reduced && MX.ind !== 'none') { // a soft glow of the indicator's color
        var gcx = x + w / 2, gcy = y + h - lv / 2;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; var gg = ctx.createRadialGradient(gcx, gcy, 4, gcx, gcy, w);
        gg.addColorStop(0, rgb(lc.c, 0.18)); gg.addColorStop(1, rgb(lc.c, 0)); ctx.fillStyle = gg; ctx.fillRect(gcx - w, gcy - w, w * 2, w * 2); ctx.restore();
      }
    }
    // glass
    ctx.strokeStyle = 'rgba(210,230,245,.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - lip, y - 4); ctx.lineTo(x, y); ctx.lineTo(x, y + h - 8); ctx.quadraticCurveTo(x, y + h, x + 8, y + h); ctx.lineTo(x + w - 8, y + h); ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - 8); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.fillStyle = 'rgba(210,230,245,.06)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w * 0.55, y + 10); ctx.lineTo(x + w * 0.55, y + h - 14); ctx.stroke();
    // graduations
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(210,230,245,.5)';
    for (var v = 50; v <= CAP_ML; v += 50) {
      var gy = y + h - h * v / CAP_ML; ctx.beginPath(); ctx.moveTo(x + 3, gy); ctx.lineTo(x + 16, gy); ctx.stroke();
      text(v === CAP_ML ? v + ' mL' : String(v), x + 19, gy + 4, '10px ' + MONO, 'rgba(210,230,245,.7)', 'left');
    }
    // what is in it
    var label = MX.kind === 'empty' ? 'empty beaker' : MX.kind === 'shelf' ? SH[MX.shelf].name : contents();
    ctx.font = '600 12px ' + SANS; var tw = ctx.measureText(label).width, lx = clamp(x + w / 2, tw / 2 + 8, L.w - tw / 2 - 8);
    text(label, lx, y + h + 18, '600 12px ' + SANS, MX.kind === 'empty' ? C.muted : C.ink, 'center');
  }
  function drawMeter() {
    var M = L.meter, pH = mixPH(), has = MX.kind !== 'empty', nat = has ? nature(pH) : '';
    // probe into the beaker
    var B = L.beaker, px = B.x + B.w * 0.78, surf = B.y + B.h - B.h * Math.min(1, MX.level / CAP_ML);
    ctx.strokeStyle = 'rgba(200,220,235,.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(M.x, M.y + M.h * 0.55); ctx.bezierCurveTo(M.x - 24, M.y + M.h * 0.55, px, B.y - 50, px, B.y - 10); ctx.stroke();
    ctx.fillStyle = '#9fb3c2'; rr(px - 4, B.y - 12, 8, Math.max(30, B.h - 14), 4); ctx.fill();
    ctx.fillStyle = '#d6e4ee'; ctx.beginPath(); ctx.arc(px, B.y + Math.max(30, B.h - 14) - 12, 5, 0, Math.PI * 2); ctx.fill();
    void surf;
    // the meter box
    panel(M);
    text('pH METER', M.x + 10, M.y + 17, '700 10px ' + SANS, C.muted);
    var col = !has ? C.muted : nat === 'acidic' ? C.red : nat === 'basic' ? C.blue : C.green;
    ctx.fillStyle = '#0a1720'; rr(M.x + 10, M.y + 24, M.w - 20, M.h * 0.42, 6); ctx.fill();
    var big = !has ? '—.——' : MX.kind === 'shelf' ? '≈ ' + fmt(pH, 1) : fmt(pH, 2);
    text(big, M.x + M.w / 2, M.y + 24 + M.h * 0.21, '700 ' + (L.narrow ? 24 : 30) + 'px ' + MONO, col, 'center', 'middle');
    text(has ? nat : 'pour something in', M.x + M.w / 2, M.y + M.h - 12, '600 12px ' + SANS, has ? col : C.muted, 'center');
  }
  function drawCard() {
    var R = L.card, pH = mixPH(), has = MX.kind !== 'empty';
    panel(R);
    var nm = MX.ind === 'none' ? 'No indicator' : CM.INDICATORS[MX.ind].name;
    text(nm, R.x + 10, R.y + 18, '600 12px ' + SANS, C.ink);
    var ic = CM.indicator(MX.ind, pH), sw = R.x + 10, sy = R.y + 28;
    if (has && MX.ind !== 'none') {
      var lc = liquidColor(); ctx.fillStyle = rgb(lc.c, Math.max(0.5, lc.a)); rr(sw, sy, 26, 26, 6); ctx.fill();
      ctx.strokeStyle = C.line; ctx.stroke();
      text(ic.name, sw + 34, sy + 18, '700 ' + (L.narrow ? 13 : 15) + 'px ' + SANS, C.ink);
    } else text(MX.ind === 'none' ? 'Pick one in the panel' : 'Pour a liquid', sw, sy + 18, '12px ' + SANS, C.muted);
  }
  function indStops(id) { // colors to paint the pH scale with
    var out = [], k = id === 'none' ? 'universal' : id;
    for (var p = 0; p <= 14.001; p += 0.25) { var ic = CM.indicator(k, p), c = ic.a > 0 ? mixc([214, 228, 238], ic.rgb, Math.min(1, ic.a / 0.85)) : [214, 228, 238]; out.push([p, c]); }
    return out;
  }
  function drawScale() {
    var x0 = 24, x1 = L.w - 24, y = L.scaleY, hgt = 14, xs = function (p) { return x0 + (x1 - x0) * p / 14; };
    var st = indStops(MX.ind), g = ctx.createLinearGradient(x0, 0, x1, 0);
    st.forEach(function (s) { g.addColorStop(s[0] / 14, rgb(s[1], 0.95)); });
    ctx.fillStyle = g; rr(x0, y, x1 - x0, hgt, 7); ctx.fill();
    for (var p = 0; p <= 14; p++) {
      var tx = xs(p); ctx.fillStyle = 'rgba(6,17,26,.55)'; ctx.fillRect(tx - 0.5, y + hgt - 4, 1, 4);
      if (!L.narrow || p % 2 === 0) text(String(p), tx, y + hgt + 13, '10px ' + MONO, C.muted, 'center');
    }
    text('acidic', xs(1.2), y + hgt + 26, '600 10px ' + SANS, C.red, 'center');
    text('neutral', xs(7), y + hgt + 26, '600 10px ' + SANS, C.green, 'center');
    text('basic', xs(12.8), y + hgt + 26, '600 10px ' + SANS, C.blue, 'center');
    if (!L.narrow) text(MX.ind === 'none' ? 'pH scale, universal indicator colors' : 'pH scale, ' + CM.INDICATORS[MX.ind].name.toLowerCase() + ' colors', x1, L.markTop - 8, '600 11px ' + SANS, C.muted, 'right');
    // the liquids tested so far, stacked so their names don't overlap
    var items = EVERYDAY.filter(function (id) { return MX.tested[id]; }).map(function (id) { return { id: id, p: SH[id].pH, x: xs(SH[id].pH) }; }).sort(function (a, b) { return a.x - b.x; });
    var rowsEnd = [-1e9, -1e9, -1e9]; ctx.font = '600 10px ' + SANS;
    items.forEach(function (it) {
      var tw = ctx.measureText(LABEL[it.id]).width + 8, row = 0;
      while (row < 2 && rowsEnd[row] > it.x - tw / 2) row++;
      rowsEnd[row] = it.x + tw / 2;
      var ty = y - 8 - row * 14;
      ctx.strokeStyle = 'rgba(219,231,239,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(it.x, ty + 2); ctx.lineTo(it.x, y); ctx.stroke();
      ctx.fillStyle = CAPS[it.id]; ctx.beginPath(); ctx.arc(it.x, y - 2, 3, 0, Math.PI * 2); ctx.fill();
      text(LABEL[it.id], it.x, ty, '600 10px ' + SANS, MX.kind === 'shelf' && MX.shelf === it.id ? C.gold : C.ink, 'center');
    });
    // the beaker's pH
    if (MX.kind !== 'empty') {
      var px = xs(clamp(mixPH(), 0, 14));
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(px, y + hgt + 1); ctx.lineTo(px - 6, y + hgt + 9); ctx.lineTo(px + 6, y + hgt + 9); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, y - 3); ctx.lineTo(px, y + hgt + 2); ctx.stroke();
    }
  }

  function drawBook() {
    var R = L.book; panel(R, 'Notebook');
    var items = EVERYDAY.filter(function (id) { return MX.tested[id]; }).sort(function (a, b) { return SH[a].pH - SH[b].pH; });
    text(items.length + ' of 9 tested', R.x + R.w - 10, R.y + 18, '11px ' + SANS, C.muted, 'right');
    if (!items.length) { text('Pour the everyday liquids to', R.x + 10, R.y + 42, '12px ' + SANS, C.muted); text('sort them by pH.', R.x + 10, R.y + 58, '12px ' + SANS, C.muted); return; }
    var rowH = Math.min(18, (R.h - 30) / items.length);
    items.forEach(function (id, i) {
      var y = R.y + 36 + i * rowH, ph = SH[id].pH, nat = nature(ph), col = nat === 'acidic' ? C.red : nat === 'basic' ? C.blue : C.green;
      ctx.fillStyle = CAPS[id]; ctx.beginPath(); ctx.arc(R.x + 14, y - 4, 4, 0, Math.PI * 2); ctx.fill();
      text(SH[id].name, R.x + 24, y, '12px ' + SANS, MX.kind === 'shelf' && MX.shelf === id ? C.gold : C.ink);
      text(id === 'water' ? '7.00' : fmt(ph, 1), R.x + R.w - 64, y, '12px ' + MONO, C.ink, 'right');
      text(nat === 'acidic' ? 'acid' : nat === 'basic' ? 'base' : 'neutral', R.x + R.w - 10, y, '600 11px ' + SANS, col, 'right');
    });
  }
  function drawMix(dt) {
    if (MX.anim) { MX.anim.t += dt; if (MX.anim.t > MX.anim.dur) MX.anim = null; }
    // shelf planks
    var rows = L.narrow ? 2 : 1;
    for (var r = 0; r < rows; r++) {
      var py = L.shelfY + r * L.rowH + L.bh + 4;
      ctx.fillStyle = 'rgba(160,120,80,.35)'; ctx.fillRect(8, py, L.w - 16, 4);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(8, py + 4, L.w - 16, 3);
    }
    for (var i = 0; i < BOTTLES.length; i++) drawBottle(BOTTLES[i], i, S.hover === 'b' + i || (S.kbd && MX.sel === i));
    drawBeaker(dt); drawMeter(); drawCard(); drawScale(); if (L.book) drawBook();
    if (MX.msgT > 0) {
      MX.msgT -= dt; ctx.globalAlpha = clamp(MX.msgT, 0, 1);
      var bx = L.beaker; text(MX.msg, L.w / 2, bx.y - 14, '600 12px ' + SANS, C.gold, 'center'); ctx.globalAlpha = 1;
    }
  }

  // ---------- bench 2 drawing ----------
  function burY(v) { return L.bur.top + 14 + (L.bur.bot - L.bur.top - 14) * v / 50; }
  function drawTitr(dt) {
    var run = !S.paused;
    if (run && TI.rate > 0) {
      var add = TI.rate * dt; TI.acc += add;
      if (TI.rate <= 0.05) { while (TI.acc >= 0.05) { TI.acc -= 0.05; addBase(0.05, true); } }
      else { addBase(add, false); if (TI.acc > 0.25) { TI.acc = 0; TI.drops.push({ y: 0, v: 0, stream: true }); } }
      if (TI.Vb >= 50 - 1e-9) setTap(0);
    }
    var B = L.bur, F = L.flask, bx = B.x, tube = L.narrow ? 12 : 16;
    // stand
    ctx.fillStyle = 'rgba(150,170,185,.35)'; ctx.fillRect(bx - 46, B.top - 10, 5, F.bot - B.top + 10); ctx.fillRect(bx - 60, F.bot, 70, 5);
    ctx.fillRect(bx - 46, B.top + 40, 46 - tube / 2, 4);
    // burette tube and its NaOH
    var ly = burY(TI.Vb);
    ctx.fillStyle = 'rgba(214,232,244,.30)'; ctx.fillRect(bx - tube / 2 + 2, ly, tube - 4, B.bot - ly);
    ctx.fillStyle = 'rgba(214,232,244,.6)'; ctx.fillRect(bx - tube / 2 + 2, ly, tube - 4, 2);
    ctx.strokeStyle = 'rgba(210,230,245,.75)'; ctx.lineWidth = 1.5; ctx.strokeRect(bx - tube / 2, B.top, tube, B.bot - B.top);
    for (var v = 0; v <= 50; v++) {
      var gy = burY(v), long = v % 5 === 0; ctx.strokeStyle = 'rgba(210,230,245,' + (long ? 0.7 : 0.35) + ')'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx + tube / 2 - (long ? 7 : 4), gy); ctx.lineTo(bx + tube / 2, gy); ctx.stroke();
      if (v % 10 === 0) text(String(v), bx + tube / 2 + 4, gy + 3.5, '9px ' + MONO, 'rgba(210,230,245,.7)');
    }
    text('NaOH', bx, B.top - 6, '700 11px ' + SANS, C.ink, 'center');
    text(conc(TI.cb) + ' M', bx, B.top - 18, '10px ' + SANS, C.muted, 'center');
    // reading at the meniscus
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - tube / 2 - 10, ly); ctx.lineTo(bx - tube / 2, ly); ctx.stroke();
    // tap
    var ty = B.bot + 8, open = TI.rate > 0;
    ctx.fillStyle = 'rgba(210,230,245,.6)'; ctx.fillRect(bx - 3, B.bot, 6, 22);
    ctx.save(); ctx.translate(bx, ty); ctx.rotate(open ? 0 : Math.PI / 2);
    ctx.fillStyle = S.hover === 'tap' ? C.green : (open ? C.gold : '#9fb3c2'); rr(-15, -4, 30, 8, 4); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#0a1720'; ctx.beginPath(); ctx.arc(bx, ty, 3, 0, Math.PI * 2); ctx.fill();
    L.tapHit = { x: bx - 26, y: ty - 18, w: 52, h: 36 };
    var tipY = B.bot + 24;
    // flask
    var cx = F.cx, top = F.top, bot = F.bot, nw = Math.max(18, F.bw * 0.2), fh = bot - top, bw = F.bw;
    var flaskPath = new Path2D(); flaskPath.moveTo(cx - nw / 2, top); flaskPath.lineTo(cx - nw / 2, top + fh * 0.25); flaskPath.lineTo(cx - bw / 2, bot - 10); flaskPath.quadraticCurveTo(cx - bw / 2, bot, cx - bw / 2 + 10, bot); flaskPath.lineTo(cx + bw / 2 - 10, bot); flaskPath.quadraticCurveTo(cx + bw / 2, bot, cx + bw / 2, bot - 10); flaskPath.lineTo(cx + nw / 2, top + fh * 0.25); flaskPath.lineTo(cx + nw / 2, top); flaskPath.closePath();
    ctx.fillStyle = 'rgba(210,230,245,.06)'; ctx.fill(flaskPath);
    var pH = titrPH(), ic = CM.indicator(TI.ind, pH), base = [205, 228, 242];
    var col = ic.a > 0 ? mixc(base, ic.rgb, Math.min(1, ic.a / 0.85)) : base, alpha = ic.a > 0 ? 0.35 + 0.5 * ic.a : 0.25;
    var vol = TI.Va + TI.Vb, lf = 0.28 + 0.42 * vol / 75, surf = bot - fh * 0.75 * lf;
    ctx.save(); ctx.clip(flaskPath);
    TI.swirl += dt * (TI.rate > 0 ? 3 : 1);
    var wob = reduced ? 0 : Math.sin(TI.swirl) * 2;
    ctx.fillStyle = rgb(col, alpha); ctx.beginPath(); ctx.moveTo(cx - bw, surf + wob); ctx.quadraticCurveTo(cx, surf - wob, cx + bw, surf + wob); ctx.lineTo(cx + bw, bot + 2); ctx.lineTo(cx - bw, bot + 2); ctx.closePath(); ctx.fill();
    // the pink that flashes where a drop lands, then swirls away, near the end point
    for (var i = TI.blobs.length - 1; i >= 0; i--) {
      var bl = TI.blobs[i]; bl.t += dt; if (bl.t > bl.life) { TI.blobs.splice(i, 1); continue; }
      var a = (1 - bl.t / bl.life) * 0.8, rad = 6 + bl.t / bl.life * bw * 0.35;
      var gg = ctx.createRadialGradient(cx + bl.dx, surf + 8, 1, cx + bl.dx, surf + 8, rad); gg.addColorStop(0, 'rgba(226,52,150,' + a + ')'); gg.addColorStop(1, 'rgba(226,52,150,0)');
      ctx.fillStyle = gg; ctx.fillRect(cx - bw, surf - 20, bw * 2, bot - surf + 20);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(210,230,245,.75)'; ctx.lineWidth = 2; ctx.stroke(flaskPath);
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - bw / 2 + 12, bot - 14); ctx.lineTo(cx - nw / 2 - 4, top + fh * 0.32); ctx.stroke();
    text(TI.acid === 'acetic' ? 'acetic acid' : TI.acid === 'mystery' ? 'mystery acid' : 'HCl', cx, bot - 8, '600 11px ' + SANS, 'rgba(6,17,26,.8)', 'center');
    // drops
    for (i = TI.drops.length - 1; i >= 0; i--) {
      var d = TI.drops[i]; d.v += 900 * dt; d.y += d.v * dt;
      var dy = tipY + d.y;
      if (dy >= surf) {
        TI.drops.splice(i, 1);
        if (TI.ind === 'phenol' && pH < 8.2 && TI.Vb > TI.Veq * 0.9) TI.blobs.push({ t: 0, life: 0.3 + 2.2 * clamp((TI.Vb / TI.Veq - 0.9) / 0.1, 0, 1), dx: (Math.random() - 0.5) * bw * 0.2 });
        continue;
      }
      if (d.stream) { ctx.strokeStyle = 'rgba(214,232,244,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, Math.max(tipY, dy - 26)); ctx.lineTo(bx, dy); ctx.stroke(); }
      else { ctx.fillStyle = 'rgba(214,232,244,.85)'; ctx.beginPath(); ctx.arc(bx, dy, 2.6, 0, Math.PI * 2); ctx.fill(); }
    }
    if (TI.rate >= 0.4 && run) { ctx.strokeStyle = 'rgba(214,232,244,.5)'; ctx.lineWidth = TI.rate >= 2 ? 3 : 1.6; ctx.beginPath(); ctx.moveTo(bx, tipY); ctx.lineTo(bx, surf); ctx.stroke(); }
    // reading box (phones); on wide screens the reading sits in the graph's header
    var R = L.box, pc = pH < 6.995 ? C.red : pH > 7.005 ? C.blue : C.green;
    if (R) {
      panel(R);
      text('pH', R.x + 10, R.y + 18, '700 10px ' + SANS, C.muted);
      text(fmt(pH, 2), R.x + R.w / 2 + 6, R.y + R.h * 0.42, '700 22px ' + MONO, pc, 'center', 'middle');
      text('NaOH ' + mL(TI.Vb), R.x + R.w / 2, R.y + R.h - 12, '600 11px ' + SANS, C.ink, 'center');
    }
    drawGraph(pH, pc);
  }
  function gx(v) { var G = L.graph; return G.x + G.w * v / 50; }
  function gy(p) { var G = L.graph; return G.y + G.h * (1 - p / 14); }
  function drawGraph(pHnow, pc) {
    var G = L.graph; panel({ x: G.x - (L.narrow ? 36 : 46), y: G.y - 26, w: G.w + (L.narrow ? 46 : 60), h: G.h + (L.narrow ? 56 : 66) });
    text('Titration curve', G.x - (L.narrow ? 26 : 36), G.y - 9, '600 12px ' + SANS, C.ink);
    if (!L.box) {
      text('NaOH added ' + mL(TI.Vb), G.x + G.w + 8, G.y - 9, '600 12px ' + MONO, C.ink, 'right');
      ctx.font = '600 12px ' + MONO; var vw = ctx.measureText('NaOH added ' + mL(TI.Vb)).width;
      text('pH ' + fmt(pHnow, 2), G.x + G.w + 8 - vw - 16, G.y - 8, '700 16px ' + MONO, pc, 'right');
    }
    // indicator strip on the right
    if (TI.ind !== 'none') {
      for (var p = 0; p < 14; p += 0.25) { var ic = CM.indicator(TI.ind, p + 0.125), c = ic.a > 0 ? mixc([214, 228, 238], ic.rgb, Math.min(1, ic.a / 0.85)) : [214, 228, 238]; ctx.fillStyle = rgb(c, 0.85); ctx.fillRect(G.x + G.w + 3, gy(p + 0.25), 6, gy(p) - gy(p + 0.25) + 0.5); }
    }
    ctx.lineWidth = 1;
    for (var y = 0; y <= 14; y += 2) { ctx.strokeStyle = y === 7 ? 'rgba(99,230,190,.35)' : C.faint; ctx.beginPath(); ctx.moveTo(G.x, gy(y)); ctx.lineTo(G.x + G.w, gy(y)); ctx.stroke(); text(String(y), G.x - 6, gy(y) + 3.5, '10px ' + MONO, C.muted, 'right'); }
    for (var v = 0; v <= 50; v += 5) { ctx.strokeStyle = C.faint; ctx.beginPath(); ctx.moveTo(gx(v), G.y); ctx.lineTo(gx(v), G.y + G.h); ctx.stroke(); if (v % 10 === 0) text(String(v), gx(v), G.y + G.h + 14, '10px ' + MONO, C.muted, 'center'); }
    text('NaOH added (mL)', G.x + G.w / 2, G.y + G.h + (L.narrow ? 27 : 30), '11px ' + SANS, C.muted, 'center');
    ctx.save(); ctx.translate(G.x - (L.narrow ? 24 : 30), G.y + G.h / 2); ctx.rotate(-Math.PI / 2); text('pH', 0, 0, '11px ' + SANS, C.muted, 'center'); ctx.restore();
    // landmarks
    var weak = isFinite(TI.Ka), Veq = TI.Veq;
    if (TI.marks && weak && TI.Vb > Veq / 11) {
      var b0 = Veq / 11, b1 = Math.min(TI.Vb, 10 * Veq / 11);
      ctx.fillStyle = 'rgba(116,192,252,.10)'; ctx.fillRect(gx(b0), G.y, gx(b1) - gx(b0), G.h);
      if (gx(b1) - gx(b0) > 70) text('buffer region', (gx(b0) + gx(b1)) / 2, G.y + 14, '600 10px ' + SANS, C.blue, 'center');
    }
    // the curve so far
    var n = Math.min(TI.curve.length - 1, Math.round(TI.Vb / TI.step));
    if (n > 0) {
      ctx.save(); ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255,212,121,.6)'; ctx.shadowBlur = reduced ? 0 : 8;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.4; ctx.beginPath();
      var stride = Math.max(1, Math.floor(n / 1500));
      for (var i = 0; i <= n; i += stride) { var X = gx(i * TI.step), Y = gy(clamp(TI.curve[i], 0, 14)); if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.lineTo(gx(TI.Vb), gy(clamp(titrPH(), 0, 14))); ctx.stroke(); ctx.restore();
    }
    var cxp = gx(TI.Vb), cyp = gy(clamp(titrPH(), 0, 14)), pulse = reduced ? 0 : (Math.sin(S.clock * 5) + 1) * 2;
    ctx.fillStyle = 'rgba(255,212,121,.25)'; ctx.beginPath(); ctx.arc(cxp, cyp, 6 + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cxp, cyp, 4, 0, Math.PI * 2); ctx.fill();
    if (TI.marks && TI.passed) {
      var pe = titrPH(Veq);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = C.green; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(gx(Veq), G.y); ctx.lineTo(gx(Veq), G.y + G.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(gx(Veq), gy(pe), 5, 0, Math.PI * 2); ctx.fill();
      label('equivalence: ' + mL(Veq) + ', pH ' + fmt(pe, 2), gx(Veq) + 8, gy(pe) + (weak ? 16 : 4), C.green, 'left');
      if (weak) {
        var ph2 = titrPH(Veq / 2);
        ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(gx(Veq / 2), gy(ph2), 5, 0, Math.PI * 2); ctx.fill();
        ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(249,168,212,.6)'; ctx.beginPath(); ctx.moveTo(G.x, gy(ph2)); ctx.lineTo(gx(Veq / 2), gy(ph2)); ctx.lineTo(gx(Veq / 2), G.y + G.h); ctx.stroke(); ctx.setLineDash([]);
        label('halfway: pH ' + fmt(ph2, 3) + ' = pKa', gx(Veq / 2) - 8, gy(ph2) - 12, C.pink, 'right');
      }
    }
    // the reading line
    if (TI.cursor !== null) {
      var cp = titrPH(TI.cursor);
      ctx.strokeStyle = 'rgba(219,231,239,.75)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx(TI.cursor), G.y); ctx.lineTo(gx(TI.cursor), G.y + G.h); ctx.moveTo(G.x, gy(cp)); ctx.lineTo(G.x + G.w, gy(cp)); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(gx(TI.cursor), gy(cp), 3.5, 0, Math.PI * 2); ctx.fill();
      label(mL(TI.cursor) + ' → pH ' + fmt(cp, 3), gx(TI.cursor) + (gx(TI.cursor) > G.x + G.w * 0.6 ? -8 : 8), gy(cp) + (cp > 10 ? 22 : 20), '#fff', gx(TI.cursor) > G.x + G.w * 0.6 ? 'right' : 'left');
    }
  }
  function label(t, x, y, color, align) {
    ctx.font = '600 11px ' + SANS; var w = ctx.measureText(t).width, G = L.graph, x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    x0 = clamp(x0, G.x + 2, G.x + G.w - w - 2); y = clamp(y, G.y + 12, G.y + G.h - 4);
    ctx.fillStyle = 'rgba(6,17,26,.82)'; rr(x0 - 4, y - 11, w + 8, 15, 4); ctx.fill();
    text(t, x0, y, '600 11px ' + SANS, color, 'left');
  }

  // ---------- bench 3 drawing ----------
  var KIND = [C.blue, C.gold, C.pink, C.green], KIND_RGB = [[116, 192, 252], [255, 212, 121], [249, 168, 212], [99, 230, 190]];
  var sprites = {}, spriteKey = '';
  function sprite(k, r) {
    var key = k + ':' + r.toFixed(1) + ':' + K.dpr;
    if (sprites[key]) return sprites[key];
    var pad = r * 1.6, size = Math.ceil((r + pad) * 2 * K.dpr), c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), m = size / 2, rp = r * K.dpr, col = KIND_RGB[k];
    var glow = g.createRadialGradient(m, m, rp * 0.6, m, m, rp + pad * K.dpr); glow.addColorStop(0, rgb(col, 0.35)); glow.addColorStop(1, rgb(col, 0));
    g.fillStyle = glow; g.fillRect(0, 0, size, size);
    var body = g.createRadialGradient(m - rp * 0.35, m - rp * 0.35, rp * 0.1, m, m, rp); body.addColorStop(0, rgb(mixc(col, [255, 255, 255], 0.6))); body.addColorStop(1, rgb(col));
    g.fillStyle = body; g.beginPath(); g.arc(m, m, rp, 0, Math.PI * 2); g.fill();
    sprites[key] = { c: c, half: size / 2 / K.dpr, size: size / K.dpr };
    return sprites[key];
  }
  function bathColor(T) { var t = clamp((T - 273.15) / 200, 0, 1); return mixc([90, 170, 240], [255, 120, 90], t); }
  function stepRate(dt) {
    var b = RX.box;
    if (!S.paused) {
      var sim = dt * SPEEDS[S.speedIx];
      b.step(sim);
      var cps = b.stats.t > 1 ? b.stats.coll / b.stats.t : 60, keepP = Math.min(1, 3 / Math.max(1, cps * SPEEDS[S.speedIx] * dt) * dt);
      for (var i = 0; i < b.events.length; i++) {
        var e = b.events[i];
        var bin = Math.min(39, Math.floor(e.E / 0.5)); RX.hist[bin]++; RX.histN++;
        if (e.react) { RX.flashes.push({ x: e.x, y: e.y, t: 0, react: true }); RX.recent.push(b.time); }
        else if (!reduced && e.E > 0.45 * b.EaEff() / 1000 && Math.random() < 0.5) RX.flashes.push({ x: e.x, y: e.y, t: 0, react: false });
        if ((e.react && Math.random() < 0.7) || Math.random() < keepP) { if (RX.balls.length < 14) RX.balls.push({ E: e.E, react: e.react, t: 0 }); }
      }
      b.events.length = 0;
      while (RX.recent.length && RX.recent[0] < b.time - 3) RX.recent.shift();
      RX.stripClock += sim;
      if (RX.stripClock >= 0.5) { RX.stripClock = 0; RX.strip.push(RX.recent.length / Math.min(3, Math.max(0.5, b.stats.t))); if (RX.strip.length > 120) RX.strip.shift(); }
    }
  }
  function drawRate(dt) {
    stepRate(dt);
    var b = RX.box, Bx = L.box, s = Bx.w / b.W;
    // the box, inside a bath whose color shows the temperature
    var bc = bathColor(RX.T);
    ctx.save();
    ctx.shadowColor = rgb(bc, 0.55); ctx.shadowBlur = 18; ctx.strokeStyle = rgb(bc, 0.9); ctx.lineWidth = 3; rr(Bx.x - 3, Bx.y - 3, Bx.w + 6, Bx.h + 6, 8); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#081621'; ctx.fillRect(Bx.x, Bx.y, Bx.w, Bx.h);
    if (RX.cat) { var cg = ctx.createLinearGradient(0, Bx.y + Bx.h - 40, 0, Bx.y + Bx.h); cg.addColorStop(0, 'rgba(99,230,190,0)'); cg.addColorStop(1, 'rgba(99,230,190,.14)'); ctx.fillStyle = cg; ctx.fillRect(Bx.x, Bx.y, Bx.w, Bx.h); }
    ctx.save(); ctx.beginPath(); ctx.rect(Bx.x, Bx.y, Bx.w, Bx.h); ctx.clip();
    var r = b.r * s;
    for (var i = 0; i < b.p.length; i++) {
      var q = b.p[i], a = 1;
      if (q.fresh && q.age < 0.35) a = q.age / 0.35;
      if (q.k >= 2 && q.ghost) a = clamp(1 - q.age / b.life, 0, 1) * 0.85;
      if (a <= 0.01) continue;
      var sp = sprite(q.k, r); ctx.globalAlpha = a;
      ctx.drawImage(sp.c, Bx.x + q.x * s - sp.half, Bx.y + q.y * s - sp.half, sp.size, sp.size);
    }
    ctx.globalAlpha = 1;
    for (i = RX.flashes.length - 1; i >= 0; i--) {
      var f = RX.flashes[i]; f.t += dt; var life = f.react ? 0.6 : 0.3;
      if (f.t > life) { RX.flashes.splice(i, 1); continue; }
      var k = f.t / life, fx = Bx.x + f.x * s, fy = Bx.y + f.y * s;
      if (f.react) {
        ctx.strokeStyle = 'rgba(255,240,200,' + (1 - k) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fx, fy, r * (1 + 3 * k), 0, Math.PI * 2); ctx.stroke();
        if (!reduced) for (var j = 0; j < 6; j++) { var an = j * Math.PI / 3 + 0.3; ctx.beginPath(); ctx.moveTo(fx + Math.cos(an) * r * (1 + 2 * k), fy + Math.sin(an) * r * (1 + 2 * k)); ctx.lineTo(fx + Math.cos(an) * r * (1.6 + 3 * k), fy + Math.sin(an) * r * (1.6 + 3 * k)); ctx.stroke(); }
      } else { ctx.strokeStyle = 'rgba(219,231,239,' + 0.35 * (1 - k) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(fx, fy, r * (0.6 + 1.2 * k), 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.restore();
    // legend
    var lx = Bx.x + 10, ly = Bx.y + Bx.h - 10;
    ctx.fillStyle = 'rgba(6,17,26,.7)'; rr(lx - 6, ly - 15, L.narrow ? 172 : 196, 21, 6); ctx.fill();
    var names = ['A', 'B', 'C', 'D'], xx = lx;
    for (i = 0; i < 4; i++) {
      ctx.fillStyle = KIND[i]; ctx.beginPath(); ctx.arc(xx + 4, ly - 4, 4.5, 0, Math.PI * 2); ctx.fill();
      text(names[i], xx + 11, ly, '600 11px ' + SANS, C.ink); xx += 22;
      if (i === 0) { text('+', xx, ly, '11px ' + SANS, C.muted); xx += 12; }
      if (i === 1) { text('→', xx, ly, '11px ' + SANS, C.muted); xx += 16; }
      if (i === 2) { text('+', xx, ly, '11px ' + SANS, C.muted); xx += 12; }
    }
    text(Math.round(RX.T - 273.15) + ' °C', Bx.x + Bx.w - 10, Bx.y + Bx.h - 10, '700 12px ' + MONO, rgb(bc), 'right');
    if (RX.cat) text('catalyst on', Bx.x + Bx.w - 10, Bx.y + Bx.h - 26, '600 11px ' + SANS, C.green, 'right');
    if (S.paused) text('paused', Bx.x + Bx.w / 2, Bx.y + 22, '700 13px ' + SANS, C.gold, 'center');
    drawMeterR(); drawDiagram(dt); drawHist(); if (L.strip) drawStrip();
  }
  function drawMeterR() {
    var R = L.meterR, b = RX.box, st = b.stats, meas = st.t > 0 ? st.react / st.t : 0, pred = b.predicted().rate, base = RX.base;
    panel(R, L.narrow ? null : 'Reaction rate');
    var x0 = R.x + 12, x1 = R.x + R.w - 12, y = L.narrow ? R.y + 46 : R.y + R.h - 24, hh = 10;
    var vmax = Math.max(base * 3, pred * 1.3, meas * 1.2), xs = function (v) { return x0 + (x1 - x0) * Math.min(1, v / vmax); };
    ctx.fillStyle = 'rgba(120,170,200,.15)'; rr(x0, y - hh, x1 - x0, hh, 5); ctx.fill();
    if (st.t > 0.5) { var g = ctx.createLinearGradient(x0, 0, xs(meas), 0); g.addColorStop(0, '#2f9e6f'); g.addColorStop(1, C.green); ctx.fillStyle = g; rr(x0, y - hh, Math.max(4, xs(meas) - x0), hh, 5); ctx.fill(); }
    function tick(v, lab, col, above) { var tx = xs(v); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, y - hh - 4); ctx.lineTo(tx, y + 3); ctx.stroke(); text(lab, tx, above ? y - hh - 7 : y + 13, '600 10px ' + SANS, col, 'center'); }
    tick(base, 'start', C.muted, false); tick(base * 2, '2×', C.gold, false); tick(pred, 'theory', C.pink, true);
    var big = st.t > 0.5 ? fmt(meas, meas < 10 ? 2 : 1) + (L.narrow ? ' per second' : ' reactions per second') : 'measuring…';
    text(big, R.x + 10, L.narrow ? R.y + 17 : R.y + 42, '700 ' + (L.narrow ? 13 : 16) + 'px ' + SANS, C.ink);
    if (st.t > 0.5) text('×' + fmt(meas / base, 2) + ' the start', R.x + R.w - 10, L.narrow ? R.y + 17 : R.y + 18, '600 12px ' + MONO, meas >= 2 * base ? C.gold : C.muted, 'right');
  }
  function hump(s, Ea) { return Ea * Math.exp(-Math.pow((s - 0.5) / 0.12, 2)); }
  function drawDiagram(dt) {
    var R = L.diag, b = RX.box; panel(R, 'Energy hill');
    var x0 = R.x + 14, x1 = R.x + R.w - 10, y0 = R.y + R.h - 26, y1 = R.y + 40, Emax = Math.max(9, RX.Ea / 1000 * 1.4);
    var X = function (s) { return x0 + (x1 - x0) * s; }, Y = function (E) { return y0 - (y0 - y1) * Math.min(E, Emax) / Emax; };
    var EaU = RX.Ea / 1000, EaC = EaU * b.catFactor, active = RX.cat ? EaC : EaU, RT = CM.R * RX.T / 1000;
    // RT line
    ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(255,212,121,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(RT)); ctx.lineTo(x1, Y(RT)); ctx.stroke(); ctx.setLineDash([]);
    text('RT = ' + fmt(RT, 2), x1, Y(RT) - 4, '10px ' + MONO, 'rgba(255,212,121,.8)', 'right');
    function path(Ea, col, w, dash) { ctx.setLineDash(dash || []); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (var i = 0; i <= 80; i++) { var s = i / 80; if (i === 0) ctx.moveTo(X(s), Y(hump(s, Ea))); else ctx.lineTo(X(s), Y(hump(s, Ea))); } ctx.stroke(); ctx.setLineDash([]); }
    if (RX.cat) { path(EaU, 'rgba(219,231,239,.35)', 1.5, [4, 4]); path(EaC, C.green, 2.4); }
    else path(EaU, C.ink, 2.4);
    // Ea arrow
    ctx.strokeStyle = C.red; ctx.fillStyle = C.red; ctx.lineWidth = 1.4; var ax = X(0.5);
    ctx.beginPath(); ctx.moveTo(ax, y0); ctx.lineTo(ax, Y(active) + 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, Y(active)); ctx.lineTo(ax - 4, Y(active) + 7); ctx.lineTo(ax + 4, Y(active) + 7); ctx.closePath(); ctx.fill();
    text('Ea ' + fmt(active, 1) + ' kJ/mol', ax + 6, Y(active) - 6, '600 11px ' + SANS, RX.cat ? C.green : C.red, 'left');
    text('A + B', X(0.08), y0 + 15, '600 11px ' + SANS, C.ink, 'center'); text('C + D', X(0.92), y0 + 15, '600 11px ' + SANS, C.ink, 'center');
    ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    // collisions trying to climb the hill
    for (var i = RX.balls.length - 1; i >= 0; i--) {
      var bl = RX.balls[i]; if (!S.paused) bl.t += dt; var T = 1.4;
      if (bl.t > T) { RX.balls.splice(i, 1); continue; }
      var sTurn = 0.5; if (!bl.react) { var lo = 0.1, hi = 0.5; for (var k = 0; k < 20; k++) { var mid = (lo + hi) / 2; if (hump(mid, active) < bl.E) lo = mid; else hi = mid; } sTurn = lo; }
      var u = bl.t / T, sPos;
      if (bl.react) sPos = 0.08 + 0.84 * u; else sPos = u < 0.5 ? 0.08 + (sTurn - 0.08) * Math.sin(u * Math.PI) : 0.08 + (sTurn - 0.08) * Math.sin(u * Math.PI);
      var hy = hump(sPos, active), alpha = u < 0.15 ? u / 0.15 : u > 0.8 ? (1 - u) / 0.2 : 1;
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillStyle = bl.react ? C.gold : 'rgba(116,192,252,.9)'; ctx.beginPath(); ctx.arc(X(sPos), Y(hy) - 5, bl.react ? 4.5 : 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  function drawHist() {
    var R = L.hist, b = RX.box; panel(R, L.narrow ? 'Collision energies' : 'How hard A and B collide');
    var x0 = R.x + 12, x1 = R.x + R.w - 10, y0 = R.y + R.h - 26, y1 = R.y + 30, nb = 40, Emax = 20, RT = CM.R * b.T / 1000, Ea = b.EaEff() / 1000;
    var th = [], ymax = 0.02;
    for (var i = 0; i < nb; i++) { var e1 = i * 0.5, e2 = i === nb - 1 ? Infinity : (i + 1) * 0.5; th[i] = Math.exp(-e1 / RT) - (isFinite(e2) ? Math.exp(-e2 / RT) : 0); ymax = Math.max(ymax, th[i]); }
    var N = RX.histN;
    if (N > 0) for (i = 0; i < nb; i++) ymax = Math.max(ymax, RX.hist[i] / N);
    ymax *= 1.12;
    var bw = (x1 - x0) / nb, Y = function (f) { return y0 - (y0 - y1) * f / ymax; };
    for (i = 0; i < nb; i++) {
      var f = N > 0 ? RX.hist[i] / N : 0; if (f <= 0) continue;
      ctx.fillStyle = i * 0.5 >= Ea - 1e-9 ? 'rgba(255,212,121,.85)' : 'rgba(116,192,252,.55)';
      ctx.fillRect(x0 + i * bw + 0.5, Y(f), bw - 1, y0 - Y(f));
    }
    ctx.strokeStyle = C.pink; ctx.lineWidth = 1.6; ctx.beginPath();
    for (i = 0; i < nb - 1; i++) { var X = x0 + (i + 0.5) * bw; if (i === 0) ctx.moveTo(X, Y(th[i])); else ctx.lineTo(X, Y(th[i])); }
    ctx.stroke();
    var ex = x0 + (x1 - x0) * Math.min(Ea, Emax) / Emax;
    ctx.strokeStyle = RX.cat ? C.green : C.red; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ex, y1 - 4); ctx.lineTo(ex, y0); ctx.stroke();
    text('Ea', ex + 4, y1 + 6, '600 11px ' + SANS, RX.cat ? C.green : C.red);
    text('react →', ex + 4, y1 + 20, '10px ' + SANS, C.gold);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    for (var e = 0; e <= 20; e += 5) text(String(e), x0 + (x1 - x0) * e / 20, y0 + 13, '10px ' + MONO, C.muted, 'center');
    text('kJ/mol', x1, y0 + 24, '10px ' + SANS, C.muted, 'right');
    if (!L.narrow) text('pink: e^(−E/RT)', x0, y0 + 24, '10px ' + SANS, C.pink);
  }
  function drawStrip() {
    var R = L.strip; if (R.h < 50) return; panel(R, 'Reactions per second, last minute');
    var x0 = R.x + 34, x1 = R.x + R.w - 12, y0 = R.y + R.h - 12, y1 = R.y + 28, data = RX.strip, base = RX.base;
    var vmax = Math.max(base * 2.6, 1); for (var i = 0; i < data.length; i++) vmax = Math.max(vmax, data[i] * 1.1);
    var Y = function (v) { return y0 - (y0 - y1) * v / vmax; };
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(143,179,198,.6)'; ctx.beginPath(); ctx.moveTo(x0, Y(base)); ctx.lineTo(x1, Y(base)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,212,121,.6)'; ctx.beginPath(); ctx.moveTo(x0, Y(2 * base)); ctx.lineTo(x1, Y(2 * base)); ctx.stroke(); ctx.setLineDash([]);
    text('start', x0 - 4, Y(base) + 3, '10px ' + SANS, C.muted, 'right'); text('2×', x0 - 4, Y(2 * base) + 3, '10px ' + SANS, C.gold, 'right');
    if (data.length > 1) {
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath();
      for (i = 0; i < data.length; i++) { var X = x1 - (data.length - 1 - i) * (x1 - x0) / 119; if (i === 0) ctx.moveTo(X, Y(data[i])); else ctx.lineTo(X, Y(data[i])); }
      ctx.stroke();
    }
  }

  // ---------- HUD ----------
  function hud() {
    var h = '';
    if (S.scene === 'mix') {
      var pH = mixPH();
      h = MX.kind === 'empty' ? '<b>Empty beaker</b><br><span class="chem-lab-dim">tap a bottle to pour</span>'
        : '<b>pH ' + (MX.kind === 'shelf' ? '≈ ' + fmt(pH, 1) : fmt(pH, 2)) + '</b> · ' + nature(pH) + '<br><span class="chem-lab-dim">' + (MX.kind === 'shelf' ? SH[MX.shelf].name : fmt(mixVolume(), mixVolume() < 1 ? 2 : 1) + ' mL in the beaker') + '</span>';
    } else if (S.scene === 'titr') {
      h = '<b>pH ' + fmt(titrPH(), 2) + '</b> · NaOH ' + mL(TI.Vb) + '<br><span class="chem-lab-dim">' + (TI.acid === 'acetic' ? 'acetic acid' : TI.acid === 'mystery' ? 'mystery acid' : 'hydrochloric acid') + ' · tap ' + (TI.rate > 0 ? 'open' : 'closed') + '</span>';
    } else {
      var st = RX.box.stats;
      h = '<b>' + (st.t > 0.5 ? fmt(st.react / st.t, 2) : '…') + '</b> per second · ' + Math.round(RX.T - 273.15) + ' °C<br><span class="chem-lab-dim">Ea ' + fmt(RX.box.EaEff() / 1000, 1) + ' kJ/mol' + (RX.cat ? ' (catalyst)' : '') + '</span>';
    }
    if (el.hud.innerHTML !== h) el.hud.innerHTML = h;
  }

  // ---------- frame ----------
  var lastScene = '';
  function frame(dt) {
    S.clock += dt;
    K.fit(); layout();
    if (lastScene !== S.scene) { lastScene = S.scene; }
    background();
    if (S.scene === 'mix') drawMix(dt);
    else if (S.scene === 'titr') { drawTitr(dt); checkTitr(dt); }
    else { drawRate(dt); checkRate(); }
    S.uiClock += dt;
    if (S.uiClock > 0.15) { S.uiClock = 0; updateReadout(); hud(); }
    pumpToasts();
  }

  // ---------- pointer and keys ----------
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function inRect(p, R) { return R && p.x >= R.x && p.x <= R.x + R.w && p.y >= R.y && p.y <= R.y + R.h; }
  function hit(p) {
    if (S.scene === 'mix') {
      for (var i = 0; i < BOTTLES.length; i++) { var b = bottleAt(i); if (Math.abs(p.x - b.x) < L.slot / 2 && p.y > b.y - 6 && p.y < b.y + L.bh + 34) return 'b' + i; }
    } else if (S.scene === 'titr') {
      if (inRect(p, L.tapHit)) return 'tap';
      var G = L.graph; if (p.x >= G.x - 10 && p.x <= G.x + G.w + 10 && p.y >= G.y - 10 && p.y <= G.y + G.h + 10) return 'graph';
    }
    return null;
  }
  cv.addEventListener('pointerdown', function (e) {
    S.kbd = false; var p = pos(e), h = hit(p);
    if (!h) return;
    if (h.charAt(0) === 'b' && S.scene === 'mix') pour(BOTTLES[+h.slice(1)]);
    else if (h === 'tap') setTap(TI.rate > 0 ? 0 : TI.lastRate);
    else if (h === 'graph') { S.drag = 'graph'; try { cv.setPointerCapture(e.pointerId); } catch (er) { } cursorFrom(p); }
    e.preventDefault();
  });
  cv.addEventListener('pointermove', function (e) {
    var p = pos(e);
    if (S.drag === 'graph') { cursorFrom(p); return; }
    var h = e.pointerType === 'mouse' ? hit(p) : null; S.hover = h;
    cv.style.cursor = h ? (h === 'graph' ? 'crosshair' : 'pointer') : 'default';
  });
  function endDrag() { S.drag = null; }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('pointerleave', function () { if (!S.drag) S.hover = null; });
  function cursorFrom(p) { var G = L.graph; if (TI.Vb <= 0) { setCursor(null); return; } setCursor(clamp((p.x - G.x) / G.w * 50, 0, 50)); }
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === 'r' || k === 'R') resetScene();
    else if (S.scene === 'mix') {
      if (k === 'ArrowRight') { MX.sel = (MX.sel + 1) % BOTTLES.length; S.kbd = true; speak(SH[BOTTLES[MX.sel]].name); }
      else if (k === 'ArrowLeft') { MX.sel = (MX.sel + BOTTLES.length - 1) % BOTTLES.length; S.kbd = true; speak(SH[BOTTLES[MX.sel]].name); }
      else if (k === 'Enter' || k === ' ') { S.kbd = true; pour(BOTTLES[MX.sel]); }
      else if (k === 'i' || k === 'I') { var order = ['none', 'universal', 'cabbage', 'phenol', 'litmus']; setInd(order[(order.indexOf(MX.ind) + 1) % order.length]); speak(MX.ind === 'none' ? 'No indicator' : CM.INDICATORS[MX.ind].name); }
      else if (k === 'Backspace' || k === 'Delete') { rinse(); afterMix(false); speak('The beaker is empty.'); }
      else used = false;
    } else if (S.scene === 'titr') {
      if (k === ' ' || k === 'Enter') setTap(TI.rate > 0 ? 0 : TI.lastRate);
      else if (k === 'ArrowDown' || k === 'd' || k === 'D') addBase(0.05, true);
      else if (k === 'ArrowRight' || k === 'ArrowLeft') { var st = e.shiftKey ? 1 : 0.05, c0 = TI.cursor === null ? TI.Vb / 2 : TI.cursor; setCursor(c0 + (k === 'ArrowRight' ? st : -st)); speak(el.curO.textContent); }
      else if (k === 'p' || k === 'P') togglePause();
      else used = false;
    } else {
      if (k === 'ArrowRight' || k === 'ArrowLeft') { RX.T = clamp(RX.T + (k === 'ArrowRight' ? 5 : -5), 273.15, 473.15); RX.box.setT(RX.T); changed(); syncRate(); speak(Math.round(RX.T - 273.15) + ' degrees Celsius'); }
      else if (k === 'ArrowUp' || k === 'ArrowDown') { RX.nA = clamp(RX.nA + (k === 'ArrowUp' ? 5 : -5), 5, 80); RX.box.setCount(CM.A, RX.nA); changed(); syncRate(); speak(RX.nA + ' particles of A'); }
      else if (k === 'c' || k === 'C') { RX.cat = !RX.cat; RX.box.cat = RX.cat; changed(); syncRate(); speak(RX.cat ? 'Catalyst on' : 'Catalyst off'); }
      else if (k === ' ' || k === 'p' || k === 'P') togglePause();
      else used = false;
    }
    if (used) e.preventDefault();
  });

  // ---------- start ----------
  shelfButtons(); setPour(10);
  freshFlask();
  loadPreset('start');
  setScene(ui.get('scene', 'mix'));
  LAB.loop(frame, view);
})();
