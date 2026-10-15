/* Circuit Builder: the page. Building on the grid, drawing, missions. The physics is in model.js. */
(function () {
  'use strict';
  var CM = window.CircuitModel, LAB = window.TRBLab;
  var root = document.getElementById('circuits-lab');
  if (!root || !CM || !LAB) return;
  function $(id) { return document.getElementById(id); }
  var view = $('circuits-view'), cv = $('circuits-cv'), K = LAB.canvas(cv), ctx = K.c;
  var hud = $('circuits-hud'), warn = $('circuits-warn'), pop = $('circuits-pop'), tray = $('circuits-tray');
  var hintEl = $('circuits-hint'), liveEl = $('circuits-live'), selEl = $('circuits-sel'), readEl = $('circuits-read');
  var ST = LAB.store('circuits'), RM = LAB.reduced;
  var COLS = CM.COLS, ROWS = CM.ROWS, T = CM.TYPES;
  var C = { bg: '#06111a', board: '#0a1923', hole: '#22404f', wire: '#3f7299', wireHi: '#8cc4e8', lead: '#a9b9c6', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', ink: '#dbe7ef', muted: '#8fb3c6', brass: '#c9a54a' };
  var NAMES = { cell: '1.5 V cell', battery9: '9 V battery', bulb: 'Bulb', resistor: 'Resistor', led: 'LED', sw: 'Switch', buzzer: 'Buzzer', ammeter: 'Ammeter', voltmeter: 'Voltmeter' };
  var KEYS = ['cell', 'battery9', 'bulb', 'resistor', 'led', 'sw', 'buzzer', 'ammeter', 'voltmeter'];

  // ---------- state ----------
  var board = { parts: [], wires: {} }, nextId = 1, res = null, dirty = true;
  var sel = null, tool = null, drag = null, ghost = null, hover = null;
  var cursor = { x: 6, y: 4, show: false }, pen = false;
  var history = [], built = false, time = 0;
  var opts = { dots: ST.get('dots', true), elec: false, nums: ST.get('nums', false), speed: 1, sound: ST.get('sound', true) };
  var phase = {}, overT = {}, swAng = {}, fx = [], ledHold = 0, toastQ = [], toastT = 0, lastLive = '', liveT = 0;
  var G = { cell: 40, ox: 0, oy: 0, T: false }, guide = null;

  // ---------- formatting ----------
  function fA(I) { var a = Math.abs(I); if (a < 1e-7) return '0 A'; if (a >= 1) return LAB.fmt(I, 2) + ' A'; if (a >= 1e-3) return LAB.fmt(I * 1e3, a >= 0.1 ? 0 : 1) + ' mA'; return LAB.fmt(I * 1e6, 1) + ' µA'; }
  function fV(v) { var a = Math.abs(v); if (a < 5e-4) return '0 V'; return LAB.fmt(v, a >= 10 ? 1 : 2) + ' V'; }
  function fW(p) { var a = Math.abs(p); if (a < 1e-6) return '0 W'; if (a >= 1) return LAB.fmt(p, 2) + ' W'; if (a >= 1e-3) return LAB.fmt(p * 1e3, 0) + ' mW'; return LAB.fmt(p * 1e6, 0) + ' µW'; }
  function fR(r) { return r >= 1000 ? (r / 1000) + ' kΩ' : r + ' Ω'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- scenes ----------
  function mk(t, x, y, o, ex) { var p = { t: t, x: x, y: y, o: o, f: false }; if (t === 'sw') p.on = false; if (t === 'resistor') p.R = 100; if (t === 'led') p.c = 'red'; for (var k in ex || {}) p[k] = ex[k]; return p; }
  function cells2() { return [mk('cell', 2, 3, 'v'), mk('cell', 2, 5, 'v')]; }
  var LOOP = [[[2, 2], [9, 2], [9, 3]], [[2, 6], [9, 6], [9, 5]]];
  var SCENES = {
    empty: function () { return { parts: [], paths: [], hint: 'An empty board. Pick parts from the tray and wire them up.' }; },
    one: function () { return { parts: cells2().concat([mk('sw', 5, 2, 'h', { on: true }), mk('bulb', 9, 4, 'v')]), paths: [[[2, 2], [4, 2]], [[6, 2], [9, 2], [9, 3]], LOOP[1]], hint: 'One bulb and a switch. Tap the switch to turn the bulb off and on.' }; },
    series: function () { return { parts: cells2().concat([mk('bulb', 6, 2, 'h'), mk('bulb', 9, 4, 'v')]), paths: [[[2, 2], [5, 2]], [[7, 2], [9, 2], [9, 3]], LOOP[1]], hint: 'Two bulbs in series share the battery’s voltage, so each glows dimmer than one bulb alone.' }; },
    parallel: function () { return { parts: cells2().concat([mk('bulb', 6, 4, 'v'), mk('bulb', 9, 4, 'v')]), paths: [LOOP[0], [[6, 2], [6, 3]], LOOP[1], [[6, 6], [6, 5]]], hint: 'Two bulbs in parallel: each has its own path, and each gets the full battery voltage.' }; },
    and: function () { return { parts: cells2().concat([mk('sw', 4, 2, 'h'), mk('sw', 7, 2, 'h'), mk('bulb', 10, 4, 'v')]), paths: [[[2, 2], [3, 2]], [[5, 2], [6, 2]], [[8, 2], [10, 2], [10, 3]], [[2, 6], [10, 6], [10, 5]]], hint: 'Two switches in series: the bulb lights only when both are on (AND). Tap them.' }; },
    or: function () { return { parts: cells2().concat([mk('sw', 5, 1, 'h'), mk('sw', 5, 3, 'h'), mk('bulb', 10, 4, 'v')]), paths: [[[2, 2], [3, 2]], [[3, 1], [3, 3]], [[3, 1], [4, 1]], [[3, 3], [4, 3]], [[6, 1], [7, 1], [7, 3], [6, 3]], [[7, 2], [10, 2], [10, 3]], [[2, 6], [10, 6], [10, 5]]], hint: 'Two switches in parallel: either one lights the bulb (OR). Tap them.' }; },
    dimmer: function () { return { parts: cells2().concat([mk('resistor', 5, 2, 'h', { R: 4.7 }), mk('bulb', 9, 4, 'v')]), paths: [[[2, 2], [4, 2]], [[6, 2], [9, 2], [9, 3]], LOOP[1]], hint: 'A resistor in series takes part of the voltage. Tap it and change its ohms: more ohms, dimmer bulb.' }; },
    led: function () { return { parts: [mk('battery9', 2, 4, 'v'), mk('resistor', 5, 2, 'h', { R: 470 }), mk('led', 9, 4, 'v')], paths: [[[2, 3], [2, 2], [4, 2]], [[6, 2], [9, 2], [9, 3]], [[2, 5], [2, 6], [9, 6], [9, 5]]], hint: 'The 470 Ω resistor holds the LED near 15 mA. Tap it and try smaller values, carefully.' }; },
    // mission starting points
    m_light: function () { return { parts: cells2().concat([mk('bulb', 9, 4, 'v')]), paths: [], guide: [[2, 2], [9, 3]], hint: 'Drag from the battery’s + end to one end of the bulb to draw a wire. Then join the − end to the other end of the bulb.' }; },
    m_series: function () { return { parts: cells2().concat([mk('bulb', 6, 2, 'h'), mk('bulb', 9, 4, 'v')]), paths: [[[2, 2], [5, 2]], [[7, 2], [9, 2], [9, 3]], LOOP[1]], hint: 'These two bulbs are in series. Add a third bulb with its own wires straight to the battery’s two ends, and compare.' }; },
    m_parallel: function () { return { parts: cells2().concat([mk('bulb', 9, 4, 'v')]), paths: [LOOP[0], LOOP[1]], hint: 'Add a second bulb and connect its two ends to the same two wires as the first bulb.' }; },
    m_dim: function () { return { parts: cells2().concat([mk('bulb', 9, 4, 'v'), mk('resistor', 5, 4, 'h', { R: 100 })]), paths: [[[2, 2], [4, 2]], [[6, 2], [9, 2], [9, 3]], LOOP[1]], hint: 'Drag the resistor into the gap in the wire. Then tap it and change its ohms until the bulb glows at 20 to 60%.' }; },
    m_back: function () { return { parts: cells2().concat([mk('resistor', 5, 2, 'h'), mk('led', 6, 4, 'h')]), paths: [[[2, 2], [4, 2]], [[6, 2], [9, 2], [9, 3]], LOOP[1]], hint: 'Drag the LED into the gap. Then tap it and press ⇄ to flip it: one way it glows, the other way it stays dark.' }; },
    m_led: function () { return { parts: [mk('battery9', 2, 4, 'v'), mk('resistor', 5, 4, 'h', { R: 470 }), mk('led', 9, 4, 'v')], paths: [[[2, 3], [2, 2]], [[2, 5], [2, 6]]], hint: 'Make one loop: 9 V battery, resistor, LED. The LED’s + leg must face the battery’s + side.' }; },
    m_ohm: function () { return { parts: [mk('battery9', 2, 4, 'v'), mk('resistor', 9, 4, 'v', { R: 220 }), mk('ammeter', 5, 4, 'h'), mk('voltmeter', 11, 4, 'v')], paths: [[[2, 3], [2, 2], [4, 2]], [[6, 2], [9, 2], [9, 3]], [[2, 5], [2, 6], [9, 6], [9, 5]]], hint: 'Put the ammeter in the gap, so the current flows through it. Wire the voltmeter across the resistor, one lead to each end.' }; },
    m_or: function () { return { parts: cells2().concat([mk('bulb', 10, 4, 'v'), mk('sw', 5, 4, 'h'), mk('sw', 8, 4, 'h')]), paths: [[[2, 2], [3, 2]], [[7, 2], [10, 2], [10, 3]], [[2, 6], [10, 6], [10, 5]]], hint: 'Fill the gap with the two switches side by side (in parallel), so either one can close the loop.' }; }
  };

  var MIS = [
    { id: 'light', title: 'Light a bulb', goal: 'Make a closed loop from the battery, through a bulb and back.', done: 'A closed loop lets charge flow all the way around, and the bulb lights.' },
    { id: 'series', title: 'Two in a row', goal: 'Put two bulbs in series, with one more bulb across the same battery to compare.', done: 'Same current through both, half the voltage each: each series bulb gets about a quarter of the power.' },
    { id: 'parallel', title: 'Side by side', goal: 'Connect two bulbs in parallel across a battery. Both stay bright.', done: 'In parallel, each bulb gets nearly the full battery voltage.' },
    { id: 'dim', title: 'Turn it down', goal: 'Put a resistor in series with a bulb so it glows at 20 to 60% brightness.', done: 'The resistor takes part of the voltage, so less current flows.' },
    { id: 'back', title: 'One-way street', goal: 'Connect an LED backwards to a battery and see it stay dark.', done: 'A diode lets current through one way only.' },
    { id: 'led', title: 'Safe glow', goal: 'Keep an LED lit at 2 to 30 mA for 2 seconds, without burning it out.', done: 'The resistor limits the current, so the LED glows safely.' },
    { id: 'ohm', title: 'Check Ohm’s law', goal: 'Measure a resistor’s voltage with the voltmeter and its current with the ammeter. Does V ÷ I equal R?', done: '' },
    { id: 'or', title: 'Either switch', goal: 'Build a light that two switches control, where either one turns it on.', done: 'Two switches in parallel: either path closes the loop.' }
  ];
  var MS = LAB.missions($('circuits-missions'), 'circuits', MIS, function (id) { loadScene('m_' + id, true); });

  // ---------- board helpers ----------
  function addPart(p) { p.id = 'p' + (nextId++); board.parts.push(p); return p; }
  function byId(id) { for (var i = 0; i < board.parts.length; i++) if (board.parts[i].id === id) return board.parts[i]; return null; }
  function centerAt(x, y) { for (var i = 0; i < board.parts.length; i++) if (board.parts[i].x === x && board.parts[i].y === y) return board.parts[i]; return null; }
  function partsWithEnd(x, y) { return board.parts.filter(function (p) { var e = CM.ends(p); return (e[0][0] === x && e[0][1] === y) || (e[1][0] === x && e[1][1] === y); }); }
  function ser() { return { v: 1, parts: board.parts.map(function (p) { var q = {}; ['id', 't', 'x', 'y', 'o', 'f', 'on', 'R', 'c', 'burned'].forEach(function (k) { if (p[k] !== undefined && p[k] !== false) q[k] = p[k]; }); return q; }), wires: Object.keys(board.wires), next: nextId }; }
  function load(o) {
    board = { parts: [], wires: {} }; nextId = 1;
    if (!o || !o.parts) return;
    o.parts.forEach(function (q) {
      if (!T[q.t] || typeof q.x !== 'number' || typeof q.y !== 'number') return;
      var p = { id: String(q.id || ''), t: q.t, x: q.x | 0, y: q.y | 0, o: q.o === 'v' ? 'v' : 'h', f: !!q.f };
      if (p.t === 'sw') p.on = !!q.on;
      if (p.t === 'resistor') p.R = CM.RES_VALUES.indexOf(q.R) >= 0 ? q.R : 100;
      if (p.t === 'led') p.c = CM.LED_COLORS[q.c] ? q.c : 'red';
      if ((p.t === 'bulb' || p.t === 'led') && q.burned) p.burned = true;
      var n = parseInt(p.id.slice(1), 10); if (!p.id || byId(p.id) || isNaN(n)) p.id = 'p' + (1000 + board.parts.length);
      if (!CM.canPlace(board, p)) board.parts.push(p);
    });
    board.parts.forEach(function (p) { var n = parseInt(p.id.slice(1), 10); if (n >= nextId) nextId = n + 1; });
    if (o.next > nextId) nextId = o.next;
    (o.wires || []).forEach(function (k) { if (!/^\d+-\d+$/.test(k)) return; var ij = CM.eparse(k); if (ij[0] < CM.NX * CM.NY && ij[1] < CM.NX * CM.NY && CM.canWire(board, ij[0], ij[1])) board.wires[CM.ekey(ij[0], ij[1])] = 1; });
  }
  var saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { ST.set('board', ser()); }, 300); }
  function snap() { history.push(JSON.stringify(ser())); if (history.length > 80) history.shift(); }
  function changed(structural) { if (structural) { built = true; guide = null; } save(); resolve(); }
  function undo() {
    if (!history.length) { say('Nothing to undo.'); return; }
    load(JSON.parse(history.pop())); sel = null; built = true; overT = {}; save(); refreshSel(); resolve();
  }
  function loadScene(name, isMission) {
    var s = SCENES[name] && SCENES[name](); if (!s) return;
    if (board.parts.length || Object.keys(board.wires).length) snap();
    board = { parts: [], wires: {} };
    s.parts.forEach(addPart);
    s.paths.forEach(function (pp) { CM.wirePath(board, pp); });
    sel = null; tool = null; pen = false; built = false; overT = {}; ledHold = 0; dirty = true; guide = s.guide || null;
    setHint(s.hint); setTool(null); save(); refreshSel(); resolve();
    var b = root.querySelectorAll('[data-scene]'); for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', b[i].dataset.scene === name ? 'true' : 'false');
    if (!isMission) MS.setCurrent(null);
  }
  function setHint(t) { hintEl.textContent = t || ''; hintEl.hidden = !t; }

  // ---------- layout and coordinates ----------
  function layout() {
    K.fit();
    var w = K.w, h = K.h, trayH = tray.offsetHeight || 56, top = 46, bot = trayH + 16, side = 6;
    var aw = w - 2 * side, ah = h - top - bot;
    var cl = Math.min(aw / (COLS + 1), ah / (ROWS + 1)), cp = Math.min(aw / (ROWS + 1), ah / (COLS + 1));
    G.T = cp > cl * 1.1; G.cell = Math.max(12, G.T ? cp : cl);
    var dw = (G.T ? ROWS : COLS) * G.cell, dh = (G.T ? COLS : ROWS) * G.cell;
    G.ox = (w - dw) / 2; G.oy = top + (ah - dh) / 2;
  }
  function S(wx, wy) { return G.T ? [G.ox + wy * G.cell, G.oy + wx * G.cell] : [G.ox + wx * G.cell, G.oy + wy * G.cell]; }
  function W(sx, sy) { var a = (sx - G.ox) / G.cell, b = (sy - G.oy) / G.cell; return G.T ? [b, a] : [a, b]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ---------- solving and analysis ----------
  function bright(p) {
    if (!res || p.burned) return 0;
    if (p.t === 'bulb') return Math.max(0, res.p[p.id] || 0) / T.bulb.ratedP;
    if (p.t === 'led') return Math.max(0, res.i[p.id] || 0) / CM.LED.iref;
    if (p.t === 'buzzer') return Math.abs(res.i[p.id] || 0) >= 0.004 ? Math.min(1, Math.abs(res.i[p.id]) / 0.03) : 0;
    return 0;
  }
  var conductors = [];
  function resolve() {
    res = CM.solve(board); dirty = false;
    conductors = [];
    for (var k in res.wire) { var ij = CM.eparse(k); conductors.push({ k: k, a: [CM.px(ij[0]), CM.py(ij[0])], b: [CM.px(ij[1]), CM.py(ij[1])], len: 1, I: res.wire[k] }); }
    board.parts.forEach(function (p) { var I = res.i[p.id] || 0; if (!p.burned && Math.abs(I) > 1e-5 && p.t !== 'voltmeter') { var e = CM.ends(p); conductors.push({ k: p.id, a: e[0], b: e[1], len: 2, I: I }); } });
    for (var id in overT) if (res.over.indexOf(id) < 0) delete overT[id];
    updateHud(); updateRead(); refreshSelValues();
    if (built) checkMissions();
    announce();
  }
  function srcOut() { var m = 0; for (var id in res.out) m = Math.max(m, res.out[id]); return m; }
  function hasSrc() { return board.parts.some(function (p) { return T[p.t].src; }); }
  function root2(pt) { return res.uf.find(pt); }
  function pairKey(p) { var a = root2(p._a), b = root2(p._b); return a < b ? a + ':' + b : b + ':' + a; }
  function members() {
    var m = {};
    board.parts.forEach(function (p) {
      if (p.t === 'voltmeter' || CM.isZero(p)) return;
      [p._a, p._b].forEach(function (pt) { var r = root2(pt); (m[r] = m[r] || []).push(p); });
    });
    return m;
  }
  function seriesPairs() {
    var m = members(), out = [];
    for (var r in m) if (m[r].length === 2 && m[r][0] !== m[r][1]) out.push(m[r]);
    return out;
  }
  function checkMissions() {
    var bulbs = board.parts.filter(function (p) { return p.t === 'bulb' && !p.burned; });
    var leds = board.parts.filter(function (p) { return p.t === 'led' && !p.burned; });
    if (!MS.isDone('light') && bulbs.some(function (b) { return bright(b) >= 0.1; })) win('light');
    var pairs = seriesPairs();
    if (!MS.isDone('series')) pairs.forEach(function (pr) {
      if (pr[0].t !== 'bulb' || pr[1].t !== 'bulb' || pr[0].burned || pr[1].burned || Math.abs(res.i[pr[0].id]) < 0.01) return;
      var pm = Math.max(res.p[pr[0].id], res.p[pr[1].id]);
      if (bulbs.some(function (c) { return c !== pr[0] && c !== pr[1] && bright(c) >= 0.1 && res.p[c.id] >= 2 * pm; })) win('series');
    });
    if (!MS.isDone('dim')) pairs.forEach(function (pr) {
      var b = pr[0].t === 'bulb' ? pr[0] : pr[1].t === 'bulb' ? pr[1] : null, r = pr[0].t === 'resistor' ? pr[0] : pr[1].t === 'resistor' ? pr[1] : null;
      if (b && r && !b.burned && bright(b) >= 0.2 && bright(b) <= 0.6) win('dim');
    });
    if (!MS.isDone('parallel')) {
      var groups = {};
      bulbs.forEach(function (b) { if (root2(b._a) !== root2(b._b) && bright(b) >= 0.1) (groups[pairKey(b)] = groups[pairKey(b)] || []).push(b); });
      for (var g in groups) if (groups[g].length >= 2) {
        var skip = {}; bulbs.forEach(function (b) { if (pairKey(b) === g) skip[b.id] = true; });
        var r2 = CM.solve(board, { skip: skip, noFlow: true }), b0 = groups[g][0];
        var voc = Math.abs(r2.nv(b0._a) - r2.nv(b0._b));
        if (voc > 0.5 && Math.abs(res.v[b0.id]) >= 0.85 * voc) { win('parallel'); break; }
      }
    }
    if (!MS.isDone('back') && leds.some(function (l) { return res.v[l.id] < -1 && Math.abs(res.i[l.id]) < 1e-6; })) win('back');
    if (!MS.isDone('ohm')) {
      var vms = board.parts.filter(function (p) { return p.t === 'voltmeter'; }), ams = board.parts.filter(function (p) { return p.t === 'ammeter'; });
      var rs = board.parts.filter(function (p) { return (p.t === 'resistor' || p.t === 'bulb') && !p.burned; });
      vms.forEach(function (vm) {
        if (Math.abs(res.v[vm.id]) < 0.05) return;
        rs.forEach(function (r) {
          if (pairKey(r) !== pairKey(vm) || Math.abs(res.i[r.id]) < 5e-4) return;
          ams.forEach(function (am) {
            var ia = Math.abs(res.i[am.id]), ir = Math.abs(res.i[r.id]);
            if (MS.isDone('ohm') || Math.abs(ia - ir) > 0.01 * ir) return;
            var V = Math.abs(res.v[vm.id]);
            win('ohm', 'Ohm’s law checks out: ' + fV(V) + ' ÷ ' + ia.toPrecision(3) + ' A = ' + (V / ia).toPrecision(3) + ' Ω, and the part is ' + fR(CM.resOf(r)) + '.');
          });
        });
      });
    }
    if (!MS.isDone('or')) {
      var sws = board.parts.filter(function (p) { return p.t === 'sw'; }), lit = bulbs.filter(function (b) { return bright(b) >= 0.1; });
      if (sws.length >= 2 && lit.length) {
        for (var i = 0; i < sws.length && !MS.isDone('or'); i++) for (var j = i + 1; j < sws.length && !MS.isDone('or'); j++) {
          var pat = [[0, 0], [1, 0], [0, 1], [1, 1]].map(function (s) { var o = {}; o[sws[i].id] = !!s[0]; o[sws[j].id] = !!s[1]; return CM.solve(board, { sw: o, noFlow: true }); });
          lit.forEach(function (b) {
            var on = pat.map(function (r) { return (r.p[b.id] || 0) / T.bulb.ratedP >= 0.1 ? 1 : 0; }).join('');
            if (on === '0111') win('or');
          });
        }
      }
    }
  }
  function win(id, msg) {
    if (!MS.done(id)) return;
    var m = MIS.filter(function (x) { return x.id === id; })[0];
    toastQ.push('✓ ' + m.title + '. ' + (msg || m.done));
    if (MS.count() === MIS.length) toastQ.push('All ' + MIS.length + ' missions done! The board is yours: keep building.');
    var next = MIS.filter(function (x) { return !MS.isDone(x.id); })[0];
    if (MS.current() === id) MS.setCurrent(null);
    setHint(next ? 'Mission done. Next: ' + next.title + '. Press “Try it” in the list for a head start.' : 'Every mission is done. Try the scenes, or build anything you like.');
    blip('win');
  }

  // ---------- HUD, readouts, live text ----------
  function updateHud() {
    var shorted = res.shorts.length > 0, s;
    if (!board.parts.length) s = 'Empty board: pick a part below';
    else if (!hasSrc()) s = 'No battery yet';
    else if (shorted) s = '<b style="color:#ff8787">⚠ Short circuit: ' + fA(srcOut()) + '</b>';
    else if (srcOut() > 1e-6) s = '● Current <b>' + fA(srcOut()) + '</b>';
    else s = '○ Open loop: no current';
    var t2 = '';
    if (tool === 'erase') t2 = 'Eraser: tap to remove';
    else if (tool) t2 = NAMES[tool] + ': tap the board';
    else if (pen) t2 = 'Wire pen on (W stops)';
    hud.innerHTML = s + (t2 ? '<br><span class="circuits-hud2">' + esc(t2) + '</span>' : '');
    var short = res.shorts.length > 0, burnedAmm = board.parts.some(function (p) { return p.t === 'ammeter' && Math.abs(res.i[p.id] || 0) > CM.SHORT_I; });
    warn.hidden = !short;
    if (short) warn.textContent = (burnedAmm ? 'Short circuit through the ammeter! Ammeters have almost no resistance, so they always go in series, never straight across a battery. ' : 'Short circuit! The battery’s ends are joined with almost no resistance. ') + 'A real short drains a battery fast and can make it dangerously hot, so never short a real battery.';
  }
  function updateRead() {
    var bulbs = board.parts.filter(function (p) { return p.t === 'bulb'; }), lit = bulbs.filter(function (b) { return bright(b) >= 0.02; }).length;
    var leds = board.parts.filter(function (p) { return p.t === 'led'; }), ll = leds.filter(function (l) { return bright(l) >= 0.05; }).length;
    var rows = [['Current from the battery', hasSrc() ? fA(srcOut()) : '—'], ['Power used by the parts', fW(res.loadP)], ['Heat inside the batteries', fW(res.lossP)], ['Bulbs lit', lit + ' of ' + bulbs.length]];
    if (leds.length) rows.push(['LEDs lit', ll + ' of ' + leds.length]);
    readEl.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
  }
  function announce() {
    var bulbs = board.parts.filter(function (p) { return p.t === 'bulb'; });
    var msg = res.shorts.length ? 'Short circuit.' : (hasSrc() ? (srcOut() > 1e-6 ? 'Current ' + fA(srcOut()) + '.' : 'No current.') : '') + (bulbs.length ? ' ' + bulbs.filter(function (b) { return bright(b) >= 0.02; }).length + ' of ' + bulbs.length + ' bulbs lit.' : '');
    if (msg !== lastLive) { lastLive = msg; clearTimeout(liveT); liveT = setTimeout(function () { liveEl.textContent = msg; }, 700); }
  }
  function say(t) { toastQ.unshift(t); toastT = 0; }

  // ---------- selection panel and pop-up buttons ----------
  function selPart() { return sel && sel.k === 'part' ? byId(sel.id) : null; }
  function select(s) { sel = s; refreshSel(); }
  function partInfo(p) {
    var t = p.t;
    if (t === 'cell') return '1.5 V, 0.2 Ω inside';
    if (t === 'battery9') return '9 V, 1.5 Ω inside';
    if (t === 'bulb') return 'rated 3 V, 0.3 A (10 Ω)';
    if (t === 'resistor') return fR(p.R) + ', ¼ W';
    if (t === 'led') return CM.LED_COLORS[p.c].name + ', about ' + CM.LED_COLORS[p.c].vf.toFixed(1) + ' V at 20 mA';
    if (t === 'sw') return p.on ? 'on (closed)' : 'off (open)';
    if (t === 'buzzer') return 'acts like 200 Ω';
    if (t === 'ammeter') return 'reads current through it; 0 Ω';
    if (t === 'voltmeter') return 'reads voltage across it; 10 MΩ';
    return '';
  }
  function refreshSel() {
    var p = selPart();
    if (sel && sel.k === 'wire') { selEl.innerHTML = '<p class="lab-small">A wire. It has (almost) no resistance, so both its ends are at the same voltage.</p><div class="lab-row"><button type="button" class="lab-btn" data-act="del">Delete wire</button></div>'; buildPop(); return; }
    if (!p) { selEl.innerHTML = '<p class="lab-small">Tap a part on the board to see its numbers and settings.</p>'; buildPop(); return; }
    var h = '<p class="circuits-selname"><b>' + NAMES[p.t] + '</b> <span>' + esc(partInfo(p)) + '</span></p><dl class="lab-readout" id="circuits-selread"></dl>';
    if (p.t === 'resistor') h += '<label class="lab-field"><span>Resistance</span><select data-set="R" aria-label="Resistance">' + CM.RES_VALUES.map(function (r) { return '<option value="' + r + '"' + (r === p.R ? ' selected' : '') + '>' + fR(r) + '</option>'; }).join('') + '</select></label>';
    if (p.t === 'led') h += '<label class="lab-field"><span>Color</span><select data-set="c" aria-label="LED color">' + Object.keys(CM.LED_COLORS).map(function (c) { return '<option value="' + c + '"' + (c === p.c ? ' selected' : '') + '>' + CM.LED_COLORS[c].name + ' (' + CM.LED_COLORS[c].nm + ' nm)</option>'; }).join('') + '</select></label>';
    h += '<div class="lab-row">';
    if (p.t === 'sw') h += '<button type="button" class="lab-btn pri" data-act="tog">' + (p.on ? 'Switch off' : 'Switch on') + '</button>';
    if (p.burned) h += '<button type="button" class="lab-btn pri" data-act="fix">Replace it</button>';
    h += '<button type="button" class="lab-btn" data-act="rot">Turn ↻</button>';
    if (T[p.t].polar) h += '<button type="button" class="lab-btn" data-act="flip">Flip ⇄</button>';
    h += '<button type="button" class="lab-btn" data-act="del">Delete</button></div>';
    selEl.innerHTML = h; refreshSelValues(); buildPop();
  }
  function refreshSelValues() {
    var p = selPart(), dl = $('circuits-selread'); if (!p || !dl || !res) return;
    var v = res.v[p.id] || 0, I = res.i[p.id] || 0, rows = [];
    if (T[p.t].src) { rows.push(['Voltage at its ends', fV(v)], ['Current it gives', fA(res.out[p.id] || 0)], ['Power it gives', fW((res.out[p.id] || 0) * v)]); }
    else if (p.t === 'ammeter') rows.push(['Reading', fA(I)]);
    else if (p.t === 'voltmeter') rows.push(['Reading', fV(v)]);
    else if (p.t === 'sw') rows.push(['Voltage across it', fV(v)], ['Current through it', fA(I)]);
    else {
      rows.push(['Voltage across it', fV(v)], ['Current through it', fA(I)], ['Power', fW(v * I)]);
      if (p.t === 'bulb') rows.push(['Brightness', p.burned ? 'burned out' : Math.round(bright(p) * 100) + '%']);
      if (p.t === 'led') rows.push(['State', p.burned ? 'burned out' : v < -0.5 ? 'backwards: blocked' : I > CM.LED.imax ? 'too much current!' : I >= 1e-3 ? 'glowing' : 'dark']);
      if (p.t === 'resistor' && Math.abs(I) > 1e-9) rows.push(['V ÷ I', fR(+(v / I).toPrecision(3))]);
      if (p.t === 'resistor' && v * I > T.resistor.ratedP) rows.push(['Warning', 'over ¼ W: hot']);
    }
    dl.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
  }
  function buildPop() {
    var p = selPart(), h = '';
    if (sel && sel.k === 'wire') h = '<button type="button" data-act="del" aria-label="Delete this wire" title="Delete">✕</button>';
    else if (p) {
      if (p.t === 'sw') h += '<button type="button" data-act="tog" class="wide" aria-label="Switch ' + (p.on ? 'off' : 'on') + '">' + (p.on ? 'Off' : 'On') + '</button>';
      if (p.burned) h += '<button type="button" data-act="fix" class="wide">Replace</button>';
      if (p.t === 'resistor') h += '<button type="button" data-act="rdown" aria-label="Fewer ohms">◂</button><span class="circuits-pv">' + fR(p.R) + '</span><button type="button" data-act="rup" aria-label="More ohms">▸</button>';
      if (p.t === 'led') h += '<button type="button" data-act="color" aria-label="Change color" title="Color"><i style="background:' + CM.LED_COLORS[p.c].hex + '"></i></button>';
      h += '<button type="button" data-act="rot" aria-label="Turn" title="Turn">↻</button>';
      if (T[p.t].polar) h += '<button type="button" data-act="flip" aria-label="Flip" title="Flip">⇄</button>';
      h += '<button type="button" data-act="del" aria-label="Delete" title="Delete">✕</button>';
    }
    pop.innerHTML = h; pop.hidden = !h; popAt = '';
  }
  var popAt = '';
  function placePop() {
    if (pop.hidden) return;
    var x, y;
    if (drag && (drag.mode === 'move' || drag.mode === 'wire')) { pop.style.visibility = 'hidden'; return; }
    pop.style.visibility = '';
    var p = selPart(), L = G.cell;
    if (p) { var c = S(p.x, p.y); x = c[0]; y = c[1]; }
    else if (sel && sel.k === 'wire' && sel.keys.length) { var ij = CM.eparse(sel.keys[0]), a = S(CM.px(ij[0]), CM.py(ij[0])), b = S(CM.px(ij[1]), CM.py(ij[1])); x = (a[0] + b[0]) / 2; y = (a[1] + b[1]) / 2; }
    else return;
    var pw = pop.offsetWidth, ph = pop.offsetHeight, top = y + 0.62 * L + 4;
    if (top + ph > K.h - tray.offsetHeight - 14) top = y - 0.62 * L - ph - 4;
    var left = clamp(x - pw / 2, 6, K.w - pw - 6); top = clamp(top, 6, K.h - ph - 6);
    var key = Math.round(left) + ',' + Math.round(top);
    if (key !== popAt) { popAt = key; pop.style.left = Math.round(left) + 'px'; pop.style.top = Math.round(top) + 'px'; }
  }
  function act(a) {
    var p = selPart();
    if (a === 'del') {
      if (sel && sel.k === 'wire') { snap(); sel.keys.forEach(function (k) { delete board.wires[k]; }); select(null); changed(true); }
      else if (p) { snap(); board.parts.splice(board.parts.indexOf(p), 1); select(null); changed(true); blip('del'); }
      return;
    }
    if (!p) return;
    if (a === 'tog') { snap(); p.on = !p.on; changed(false); blip('click'); }
    else if (a === 'fix') { p.burned = false; delete overT[p.id]; changed(false); }
    else if (a === 'rot') {
      var q = { id: p.id, t: p.t, x: p.x, y: p.y, o: p.o === 'h' ? 'v' : 'h', f: p.f };
      if (!CM.canPlace(board, q, p.id)) { snap(); p.o = q.o; changed(true); } else say('No room to turn it here.');
    } else if (a === 'flip') { snap(); p.f = !p.f; changed(true); }
    else if (a === 'rup' || a === 'rdown') {
      var i = CM.RES_VALUES.indexOf(p.R) + (a === 'rup' ? 1 : -1);
      if (i >= 0 && i < CM.RES_VALUES.length) { snap(); p.R = CM.RES_VALUES[i]; changed(true); }
    } else if (a === 'color') { var cs = Object.keys(CM.LED_COLORS); snap(); p.c = cs[(cs.indexOf(p.c) + 1) % cs.length]; changed(true); }
    refreshSel();
  }
  pop.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) act(b.dataset.act); });
  selEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && b.dataset.act) act(b.dataset.act); });
  selEl.addEventListener('change', function (e) {
    var p = selPart(), s = e.target; if (!p || !s.dataset.set) return;
    snap(); if (s.dataset.set === 'R') p.R = +s.value; else p.c = s.value; changed(true); refreshSel();
  });

  // ---------- tools ----------
  function setTool(t) {
    tool = t; ghost = null;
    var b = tray.querySelectorAll('button[data-tool]'); for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', b[i].dataset.tool === t ? 'true' : 'false');
    if (res) updateHud();
  }
  function ghostFor(t, fx, fy, prev) {
    var x = Math.round(fx), y = Math.round(fy), dh = Math.abs(fy - y), dv = Math.abs(fx - x), o = prev || 'h';
    if (dh + 0.12 < dv) o = 'h'; else if (dv + 0.12 < dh) o = 'v';
    function at(o2) { var p = { id: '_g', t: t, x: clamp(x, o2 === 'h' ? 1 : 0, o2 === 'h' ? COLS - 1 : COLS), y: clamp(y, o2 === 'v' ? 1 : 0, o2 === 'v' ? ROWS - 1 : ROWS), o: o2, f: false }; if (t === 'sw') p.on = false; if (t === 'resistor') p.R = 100; if (t === 'led') p.c = 'red'; return p; }
    var p = at(o), ok = !CM.canPlace(board, p);
    if (!ok) { var q = at(o === 'h' ? 'v' : 'h'); if (!CM.canPlace(board, q)) { p = q; ok = true; } }
    return { p: p, ok: ok };
  }
  function placeGhost() {
    if (!ghost || !ghost.ok) { say('No room there: parts can’t overlap, and wires can’t run under a part.'); return false; }
    snap(); var p = addPart(ghost.p); ghost = null; setTool(null); select({ k: 'part', id: p.id }); changed(true); blip('place');
    return true;
  }
  tray.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tool]'); if (!b) return;
    if (trayDrag && trayDrag.placed) { trayDrag = null; return; }
    setTool(tool === b.dataset.tool ? null : b.dataset.tool); pen = false;
    if (tool) select(null);
  });
  // drag a part straight from the tray onto the board
  var trayDrag = null;
  tray.addEventListener('pointerdown', function (e) { var b = e.target.closest('button[data-tool]'); if (!b || b.dataset.tool === 'erase') return; trayDrag = { t: b.dataset.tool, x: e.clientX, y: e.clientY, on: false, placed: false }; });
  window.addEventListener('pointermove', function (e) {
    if (!trayDrag) return;
    if (!trayDrag.on && Math.hypot(e.clientX - trayDrag.x, e.clientY - trayDrag.y) > 10) { trayDrag.on = true; setTool(trayDrag.t); select(null); }
    if (trayDrag.on) { var r = cv.getBoundingClientRect(), w = W(e.clientX - r.left, e.clientY - r.top); var inside = e.clientY < r.top + r.height - tray.offsetHeight - 4 && e.clientY > r.top; ghost = inside ? ghostFor(trayDrag.t, w[0], w[1], ghost && ghost.p.o) : null; }
  });
  window.addEventListener('pointerup', function () {
    if (!trayDrag) return;
    if (trayDrag.on) { if (ghost) { placeGhost(); } trayDrag.placed = true; setTimeout(function () { trayDrag = null; }, 0); }
    else trayDrag = null;
  });
  window.addEventListener('pointercancel', function () { if (trayDrag && !trayDrag.on) trayDrag = null; });

  // ---------- pointer on the board ----------
  function ptrW(e) { var r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top, w = W(sx, sy); return { sx: sx, sy: sy, fx: w[0], fy: w[1] }; }
  function partAt(fx, fy) {
    var best = null, bd = 9;
    board.parts.forEach(function (p) {
      var ux = p.o === 'h' ? 1 : 0, uy = 1 - ux, dx = fx - p.x, dy = fy - p.y, al = dx * ux + dy * uy, pe = Math.abs(dx * uy - dy * ux);
      if (Math.abs(al) <= 0.74 && pe <= 0.42) { var d = pe + Math.abs(al) * 0.3; if (d < bd) { bd = d; best = p; } }
    });
    return best;
  }
  function segD(px, py, ax, ay, bx, by) { var dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1); return Math.hypot(px - ax - t * dx, py - ay - t * dy); }
  function edgeAt(fx, fy, lim) {
    var best = null, bd = lim || 0.24;
    for (var k in board.wires) { var ij = CM.eparse(k), d = segD(fx, fy, CM.px(ij[0]), CM.py(ij[0]), CM.px(ij[1]), CM.py(ij[1])); if (d < bd) { bd = d; best = k; } }
    return best;
  }
  // a wire "run": joined segments up to a junction, a corner with a part, or a free end
  function wireRun(key) {
    var adj = {}, k;
    for (k in board.wires) { var ij = CM.eparse(k); (adj[ij[0]] = adj[ij[0]] || []).push(k); (adj[ij[1]] = adj[ij[1]] || []).push(k); }
    var term = {}; board.parts.forEach(function (p) { CM.ends(p).forEach(function (e) { term[CM.idx(e[0], e[1])] = 1; }); });
    var out = {}, stack = [key]; out[key] = 1;
    while (stack.length) {
      var e = stack.pop(), pts = CM.eparse(e);
      pts.forEach(function (pt) { if (adj[pt].length === 2 && !term[pt]) adj[pt].forEach(function (k2) { if (!out[k2]) { out[k2] = 1; stack.push(k2); } }); });
    }
    return Object.keys(out);
  }
  function eraseAt(fx, fy) {
    var p = partAt(fx, fy) || centerAt(Math.round(fx), Math.round(fy));
    if (p) { if (!drag.snapped) { snap(); drag.snapped = true; } board.parts.splice(board.parts.indexOf(p), 1); if (sel && sel.id === p.id) select(null); changed(true); blip('del'); return; }
    var k = edgeAt(fx, fy, 0.3);
    if (k) { if (!drag.snapped) { snap(); drag.snapped = true; } wireRun(k).forEach(function (q) { delete board.wires[q]; }); if (sel && sel.k === 'wire') select(null); changed(true); }
  }
  function extendWire(d, fx, fy) {
    var tx = clamp(Math.round(fx), 0, COLS), ty = clamp(Math.round(fy), 0, ROWS);
    if (Math.hypot(fx - tx, fy - ty) > 0.45) return;
    for (var guard = 0; guard < 40; guard++) {
      var cur = d.path[d.path.length - 1], cx = CM.px(cur), cy = CM.py(cur);
      if (cx === tx && cy === ty) break;
      var nx = cx, ny = cy, ddx = tx - cx, ddy = ty - cy;
      if (Math.abs(ddx) >= Math.abs(ddy)) nx += Math.sign(ddx); else ny += Math.sign(ddy);
      var ni = CM.idx(nx, ny);
      if (d.path.length > 1 && ni === d.path[d.path.length - 2]) { var kb = CM.ekey(cur, ni); if (d.added[kb]) { delete board.wires[kb]; delete d.added[kb]; dirty = true; } d.path.pop(); continue; }
      if (!CM.canWire(board, cur, ni)) { d.blocked = true; break; }
      var k = CM.ekey(cur, ni); if (!board.wires[k]) { board.wires[k] = 1; d.added[k] = 1; dirty = true; }
      d.path.push(ni); d.blocked = false;
    }
  }
  cv.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    cursor.show = false;
    var q = ptrW(e), gx = Math.round(q.fx), gy = Math.round(q.fy), pd = Math.hypot(q.fx - gx, q.fy - gy), inG = CM.inGrid(gx, gy);
    try { cv.setPointerCapture(e.pointerId); } catch (err) { }
    audio(true);
    if (tool && tool !== 'erase') { ghost = ghostFor(tool, q.fx, q.fy, ghost && ghost.p.o); drag = { mode: 'place', sx: q.sx, sy: q.sy }; return; }
    if (tool === 'erase') { drag = { mode: 'erase' }; eraseAt(q.fx, q.fy); return; }
    var part = partAt(q.fx, q.fy);
    if (inG && pd < 0.3 && !centerAt(gx, gy)) drag = { mode: 'wpend', start: CM.idx(gx, gy), sx: q.sx, sy: q.sy };
    else if (part) drag = { mode: 'ppend', id: part.id, dx: q.fx - part.x, dy: q.fy - part.y, sx: q.sx, sy: q.sy };
    else { var k = edgeAt(q.fx, q.fy); if (k) drag = { mode: 'epend', key: k, sx: q.sx, sy: q.sy }; else if (inG && pd < 0.5 && !centerAt(gx, gy)) drag = { mode: 'wpend', start: CM.idx(gx, gy), sx: q.sx, sy: q.sy }; else { drag = null; select(null); } }
  });
  cv.addEventListener('pointermove', function (e) {
    var q = ptrW(e);
    if (!drag) { hoverAt(q, e.pointerType); return; }
    var moved = Math.hypot(q.sx - drag.sx, q.sy - drag.sy) > 7;
    if (drag.mode === 'place') ghost = ghostFor(tool, q.fx, q.fy, ghost && ghost.p.o);
    else if (drag.mode === 'erase') eraseAt(q.fx, q.fy);
    else if (drag.mode === 'wpend' && moved) { snap(); drag = { mode: 'wire', path: [drag.start], added: {}, sx: drag.sx, sy: drag.sy }; select(null); extendWire(drag, q.fx, q.fy); }
    else if (drag.mode === 'wire') extendWire(drag, q.fx, q.fy);
    else if (drag.mode === 'ppend' && moved) { drag.mode = 'move'; select({ k: 'part', id: drag.id }); }
    if (drag && drag.mode === 'move') {
      var p = byId(drag.id); if (!p) { drag = null; return; }
      var g = { id: p.id, t: p.t, x: Math.round(q.fx - drag.dx), y: Math.round(q.fy - drag.dy), o: p.o, f: p.f, on: p.on, R: p.R, c: p.c, burned: p.burned };
      ghost = { p: g, ok: !CM.canPlace(board, g, p.id) && (g.x !== p.x || g.y !== p.y) , same: g.x === p.x && g.y === p.y };
    }
  });
  function endDrag(e, cancel) {
    var d = drag; drag = null; if (!d) return;
    if (d.mode === 'place') { if (!cancel) placeGhost(); else ghost = null; }
    else if (d.mode === 'wire') { if (Object.keys(d.added).length) changed(true); else history.pop(); }
    else if (d.mode === 'wpend' && !cancel) { var x = CM.px(d.start), y = CM.py(d.start), ps = partsWithEnd(x, y); select(ps.length ? { k: 'part', id: ps[0].id } : null); }
    else if (d.mode === 'ppend' && !cancel) { var p = byId(d.id); select({ k: 'part', id: d.id }); if (p && p.t === 'sw' && !p.burned) act('tog'); }
    else if (d.mode === 'epend' && !cancel) select({ k: 'wire', keys: wireRun(d.key) });
    else if (d.mode === 'move') {
      var p2 = byId(d.id);
      if (ghost && p2 && ghost.ok && !cancel) { snap(); p2.x = ghost.p.x; p2.y = ghost.p.y; changed(true); blip('place'); }
      else if (ghost && !ghost.ok && !ghost.same && !cancel) say('No room there: parts can’t overlap, and wires can’t run under a part.');
      ghost = null;
    }
  }
  cv.addEventListener('pointerup', function (e) { endDrag(e, false); });
  cv.addEventListener('pointercancel', function (e) { endDrag(e, true); });
  cv.addEventListener('pointerleave', function () { if (!drag) { hover = null; if (tool && tool !== 'erase' && !trayDrag) ghost = null; } });
  function hoverAt(q, type) {
    if (tool && tool !== 'erase') { ghost = ghostFor(tool, q.fx, q.fy, ghost && ghost.p.o); cv.style.cursor = 'copy'; return; }
    var gx = Math.round(q.fx), gy = Math.round(q.fy), pd = Math.hypot(q.fx - gx, q.fy - gy);
    hover = null;
    if (tool === 'erase') { cv.style.cursor = 'pointer'; return; }
    if (CM.inGrid(gx, gy) && pd < 0.3 && !centerAt(gx, gy)) { hover = [gx, gy]; cv.style.cursor = 'crosshair'; }
    else if (partAt(q.fx, q.fy)) cv.style.cursor = 'grab';
    else if (edgeAt(q.fx, q.fy)) cv.style.cursor = 'pointer';
    else cv.style.cursor = 'default';
    if (type !== 'mouse') hover = null;
  }

  // ---------- keyboard ----------
  cv.addEventListener('keydown', function (e) {
    var k = e.key, p = selPart();
    if ((e.ctrlKey || e.metaKey) && (k === 'z' || k === 'Z')) { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    cursor.show = true;
    var mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (mv) {
      e.preventDefault();
      if (G.T) mv = [mv[1], mv[0]];
      var nx = clamp(cursor.x + mv[0], 0, COLS), ny = clamp(cursor.y + mv[1], 0, ROWS);
      if (pen && (nx !== cursor.x || ny !== cursor.y)) {
        var a = CM.idx(cursor.x, cursor.y), b = CM.idx(nx, ny);
        if (CM.canWire(board, a, b)) { if (!board.wires[CM.ekey(a, b)]) { board.wires[CM.ekey(a, b)] = 1; changed(true); } }
        else { say('A wire can’t go into the middle of a part.'); return; }
      }
      cursor.x = nx; cursor.y = ny; return;
    }
    if (k === 'w' || k === 'W') { pen = !pen; if (pen) { snap(); setTool(null); } updateHud(); liveEl.textContent = pen ? 'Wire pen on: move with the arrow keys to draw.' : 'Wire pen off.'; e.preventDefault(); return; }
    var n = k.length === 1 ? '123456789'.indexOf(k) : -1;
    if ((k === 'Enter' || k === ' ') && tool && tool !== 'erase') { e.preventDefault(); n = KEYS.indexOf(tool); }
    if (n >= 0) {
      var t = KEYS[n], g = { id: '_g', t: t, x: cursor.x, y: cursor.y, o: G.T ? 'v' : 'h', f: false };
      if (CM.canPlace(board, g)) g.o = g.o === 'h' ? 'v' : 'h';
      if (!CM.canPlace(board, g)) { if (t === 'sw') g.on = false; if (t === 'resistor') g.R = 100; if (t === 'led') g.c = 'red'; ghost = { p: g, ok: true }; placeGhost(); }
      else say('No room for a ' + NAMES[t] + ' centered here.');
      e.preventDefault(); return;
    }
    if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      var c = centerAt(cursor.x, cursor.y) || partsWithEnd(cursor.x, cursor.y)[0];
      if (c) { select({ k: 'part', id: c.id }); if (c.t === 'sw' && !c.burned) act('tog'); else say(NAMES[c.t] + ' selected: R turns, F flips, Delete removes.'); }
      else select(null);
      return;
    }
    if (k === 'Delete' || k === 'Backspace') {
      e.preventDefault();
      if (sel) act('del'); else { var c2 = centerAt(cursor.x, cursor.y); if (c2) { select({ k: 'part', id: c2.id }); act('del'); } else { var adj = Object.keys(board.wires).filter(function (q) { var ij = CM.eparse(q); return ij[0] === CM.idx(cursor.x, cursor.y) || ij[1] === CM.idx(cursor.x, cursor.y); }); if (adj.length) { snap(); adj.forEach(function (q) { delete board.wires[q]; }); changed(true); } } }
      return;
    }
    if (k === 'Escape') { setTool(null); pen = false; select(null); updateHud(); return; }
    if (!p) return;
    if (k === 'r' || k === 'R') act('rot');
    else if (k === 'f' || k === 'F') act('flip');
    else if (k === '+' || k === '=' || k === ']') act('rup');
    else if (k === '-' || k === '[') act('rdown');
    else if (k === 'c' || k === 'C') act('color');
  });
  cv.addEventListener('blur', function () { cursor.show = false; });

  // ---------- burning out, timers ----------
  function burn(id) {
    var p = byId(id); if (!p || p.burned) return;
    p.burned = true; delete overT[id]; dirty = true; save();
    var c = S(p.x, p.y); boom(c[0], c[1], p.t === 'led' ? CM.LED_COLORS[p.c].hex : C.gold);
    blip('pop');
    if (p.t === 'led') say('Pop! The LED burned out: more than 40 mA. Put a resistor in series. Tap it, then Replace.');
    else say('Pop! The bulb burned out: far more than its rated power. Tap it, then Replace.');
    if (selPart() === p) refreshSel();
  }
  function boom(x, y, col) {
    var L = G.cell;
    fx.push({ k: 'text', x: x, y: y - 0.5 * L, t: 0, life: 1.2, s: 'pop!' });
    if (RM) return;
    for (var i = 0; i < 16; i++) { var a = Math.random() * Math.PI * 2, v = (0.8 + Math.random() * 2.2) * L; fx.push({ k: 'spark', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.35 + Math.random() * 0.35, col: i % 3 ? col : '#ffffff' }); }
    for (i = 0; i < 6; i++) fx.push({ k: 'smoke', x: x + (Math.random() - 0.5) * 0.3 * L, y: y, vx: (Math.random() - 0.5) * 0.3 * L, vy: -(0.3 + Math.random() * 0.5) * L, t: 0, life: 1 + Math.random() * 0.8, r: (0.12 + Math.random() * 0.12) * L });
  }
  function tick(dt) {
    time += dt;
    if (res) {
      res.over.forEach(function (id) { overT[id] = (overT[id] || 0) + dt; if (overT[id] > 0.45) burn(id); });
      var okLed = built && !MS.isDone('led') && board.parts.some(function (p) { var I = res.i[p.id] || 0; return p.t === 'led' && !p.burned && I >= 0.002 && I <= 0.030; });
      ledHold = okLed ? ledHold + dt : 0;
      if (ledHold >= 2) { var l = board.parts.filter(function (p) { return p.t === 'led' && !p.burned && res.i[p.id] >= 0.002; })[0]; win('led', 'Safe glow at ' + fA(res.i[l.id]) + ': bright, and well under the 40 mA limit.'); ledHold = 0; }
      var mul = (opts.elec ? -1 : 1) * 8 * opts.speed;
      conductors.forEach(function (c) { var v = clamp(c.I * mul, -12, 12); phase[c.k] = (((phase[c.k] || 0) + v * dt) % 0.5 + 0.5) % 0.5; });
    }
    board.parts.forEach(function (p) { if (p.t !== 'sw') return; var target = p.on ? 0 : 0.6, a = swAng[p.id] === undefined ? target : swAng[p.id]; swAng[p.id] = RM ? target : a + (target - a) * Math.min(1, dt * 14); });
    for (var i = fx.length - 1; i >= 0; i--) { var f = fx[i]; f.t += dt; if (f.t > f.life) { fx.splice(i, 1); continue; } if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; if (f.k === 'spark') f.vy += G.cell * 4 * dt; } }
    toastT -= dt;
    if (toastT <= 0 && toastQ.length) { LAB.toast(view, toastQ.shift()); toastT = 2.8; }
    var loud = 0; if (res) board.parts.forEach(function (p) { if (p.t === 'buzzer') loud = Math.max(loud, bright(p)); });
    buzz(loud);
  }

  // ---------- sound ----------
  var AC = null, bz = null;
  function audio(gesture) {
    if (!opts.sound) return null;
    if (!AC && gesture) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended' && gesture) { try { AC.resume(); } catch (e) { } }
    return AC;
  }
  function blip(kind) {
    var ac = audio(false); if (!ac || ac.state !== 'running') return;
    var t = ac.currentTime, g = ac.createGain(); g.connect(ac.destination);
    if (kind === 'pop') {
      var n = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.18), ac.sampleRate), d = n.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      var src = ac.createBufferSource(), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; src.buffer = n; src.connect(bp); bp.connect(g);
      g.gain.setValueAtTime(0.5, t); src.start(t); return;
    }
    var o = ac.createOscillator(), f = { click: 1800, place: 520, del: 260, win: 660 }[kind] || 600;
    o.type = kind === 'win' ? 'triangle' : 'sine'; o.frequency.setValueAtTime(f, t);
    if (kind === 'win') o.frequency.setValueAtTime(f * 1.5, t + 0.09);
    var dur = kind === 'click' ? 0.03 : kind === 'win' ? 0.25 : 0.07;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'click' ? 0.05 : 0.07, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); o.start(t); o.stop(t + dur + 0.02);
  }
  function buzz(level) {
    var ac = AC; if (!ac || ac.state !== 'running') return;
    if (!opts.sound) level = 0;
    if (!bz && level > 0) {
      bz = { o: ac.createOscillator(), lp: ac.createBiquadFilter(), g: ac.createGain() };
      bz.o.type = 'square'; bz.o.frequency.value = 420; bz.lp.type = 'lowpass'; bz.lp.frequency.value = 1500; bz.g.gain.value = 0;
      bz.o.connect(bz.lp); bz.lp.connect(bz.g); bz.g.connect(ac.destination); bz.o.start();
    }
    if (!bz) return;
    var t = ac.currentTime, g = bz.g.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(level * 0.03, t + 0.04); g.linearRampToValueAtTime(0, t + 0.3);
    bz.o.frequency.setValueAtTime(380 + 80 * level, t);
  }

  // ---------- drawing ----------
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  var BAND = ['#1b1b1b', '#7a4a1e', '#d63b3b', '#f08c2a', '#f2d83a', '#3aa655', '#3b6fd6', '#8e4fd1', '#8d8d8d', '#f4f4f4'];
  function bands(R) { var e = Math.floor(Math.log10(R) + 1e-9) - 1, m = Math.round(R / Math.pow(10, e)); if (m >= 100) { m = Math.round(m / 10); e++; } var d1 = Math.floor(m / 10), d2 = m % 10; return [BAND[d1], BAND[d2], e < 0 ? '#c9a54a' : BAND[e], '#c9a54a']; }
  function mixHex(a, b, t) { var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); function ch(s) { return Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t); } return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')'; }
  // draws a part between screen points A (terminal 0) and B (terminal 1); in the local frame t0 is at x = −L
  function drawPart(c, p, A, B, L, o) {
    o = o || {};
    var cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, ang = Math.atan2(B[1] - A[1], B[0] - A[0]), b = o.b || 0, lw = Math.max(1.4, L * 0.055);
    c.save(); c.translate(cx, cy); c.rotate(ang);
    function lead(x0, x1) { c.strokeStyle = C.lead; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x1, 0); c.stroke(); }
    if (o.sel) { c.save(); c.shadowColor = C.green; c.shadowBlur = 12; c.strokeStyle = 'rgba(99,230,190,.9)'; c.lineWidth = 2; rr(c, -0.86 * L, -0.5 * L, 1.72 * L, L, 0.22 * L); c.stroke(); c.restore(); }
    var t = p.t, g, hh;
    if (t === 'cell') {
      lead(-L, -0.62 * L); lead(0.6 * L, L); hh = 0.25 * L;
      g = c.createLinearGradient(0, -hh, 0, hh); g.addColorStop(0, '#34495a'); g.addColorStop(0.42, '#6b8396'); g.addColorStop(1, '#1e2a34');
      rr(c, -0.6 * L, -hh, 1.2 * L, 2 * hh, 0.07 * L); c.fillStyle = g; c.fill();
      g = c.createLinearGradient(0, -hh, 0, hh); g.addColorStop(0, '#a77a22'); g.addColorStop(0.42, '#ffe08a'); g.addColorStop(1, '#8a6418');
      c.save(); rr(c, -0.6 * L, -hh, 1.2 * L, 2 * hh, 0.07 * L); c.clip(); c.fillStyle = g; c.fillRect(-0.6 * L, -hh, 0.4 * L, 2 * hh); c.restore();
      c.fillStyle = '#d7dde2'; c.fillRect(-0.68 * L, -0.09 * L, 0.09 * L, 0.18 * L);
      if (o.hot) { c.fillStyle = 'rgba(255,90,60,' + (0.25 + 0.2 * Math.sin(time * 9)) + ')'; rr(c, -0.6 * L, -hh, 1.2 * L, 2 * hh, 0.07 * L); c.fill(); }
    } else if (t === 'battery9') {
      lead(-L, -0.7 * L); lead(0.7 * L, L); hh = 0.36 * L;
      g = c.createLinearGradient(0, -hh, 0, hh); g.addColorStop(0, '#1c3550'); g.addColorStop(0.45, '#33597f'); g.addColorStop(1, '#152639');
      rr(c, -0.7 * L, -hh, 1.4 * L, 2 * hh, 0.08 * L); c.fillStyle = g; c.fill();
      g = c.createLinearGradient(0, -hh, 0, hh); g.addColorStop(0, '#a77a22'); g.addColorStop(0.45, '#ffd479'); g.addColorStop(1, '#8a6418');
      c.save(); rr(c, -0.7 * L, -hh, 1.4 * L, 2 * hh, 0.08 * L); c.clip(); c.fillStyle = g; c.fillRect(-0.7 * L, -hh, 0.28 * L, 2 * hh); c.restore();
      c.fillStyle = '#cfd6dc'; c.fillRect(-0.77 * L, -0.15 * L, 0.08 * L, 0.3 * L); c.fillRect(0.7 * L, -0.12 * L, 0.06 * L, 0.24 * L);
      if (o.hot) { c.fillStyle = 'rgba(255,90,60,' + (0.25 + 0.2 * Math.sin(time * 9)) + ')'; rr(c, -0.7 * L, -hh, 1.4 * L, 2 * hh, 0.08 * L); c.fill(); }
    } else if (t === 'bulb') {
      lead(-L, -0.38 * L); lead(0.38 * L, L);
      var R = 0.4 * L, lit = !p.burned && b > 0.01;
      c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2);
      if (lit) { g = c.createRadialGradient(0, 0, 0, 0, 0, R); g.addColorStop(0, 'rgba(255,250,225,' + Math.min(1, 0.25 + b) + ')'); g.addColorStop(0.6, 'rgba(255,212,121,' + Math.min(0.85, 0.15 + 0.7 * b) + ')'); g.addColorStop(1, 'rgba(255,190,90,' + Math.min(0.5, 0.1 + 0.4 * b) + ')'); c.fillStyle = g; }
      else c.fillStyle = p.burned ? 'rgba(70,70,70,.55)' : 'rgba(170,210,235,.10)';
      c.fill(); c.strokeStyle = p.burned ? 'rgba(150,150,150,.7)' : 'rgba(200,230,250,.65)'; c.lineWidth = Math.max(1.2, L * 0.04); c.stroke();
      // filament on two posts
      var fcol = p.burned ? '#555' : lit ? mixHex('#8f9aa3', '#fff4c8', Math.min(1, b * 1.4)) : '#8f9aa3';
      c.strokeStyle = C.lead; c.lineWidth = Math.max(1, L * 0.035); c.beginPath(); c.moveTo(-0.38 * L, 0); c.lineTo(-0.2 * L, 0.12 * L); c.moveTo(0.38 * L, 0); c.lineTo(0.2 * L, 0.12 * L); c.stroke();
      c.strokeStyle = fcol; c.lineWidth = Math.max(1, L * 0.04); c.beginPath();
      for (var k = 0; k <= 16; k++) { var fxp = -0.2 * L + 0.4 * L * k / 16, fy = 0.12 * L - Math.abs(Math.sin(k * Math.PI / 4)) * 0.1 * L; if (p.burned && k > 6 && k < 10) { c.moveTo(fxp, fy + 0.04 * L); continue; } if (k) c.lineTo(fxp, fy); else c.moveTo(fxp, fy); }
      c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(1, L * 0.035); c.beginPath(); c.arc(0, 0, R * 0.72, -2.6, -1.8); c.stroke();
    } else if (t === 'resistor') {
      lead(-L, -0.5 * L); lead(0.5 * L, L); hh = 0.16 * L;
      g = c.createLinearGradient(0, -hh, 0, hh); g.addColorStop(0, '#f0dcaa'); g.addColorStop(0.5, '#d8bb80'); g.addColorStop(1, '#a98a52');
      rr(c, -0.5 * L, -hh, L, 2 * hh, hh); c.fillStyle = g; c.fill();
      var bc = bands(p.R || 100), bx = [-0.3, -0.15, 0, 0.3];
      for (var n2 = 0; n2 < 4; n2++) { c.fillStyle = bc[n2]; c.fillRect(bx[n2] * L - 0.04 * L, -hh, 0.08 * L, 2 * hh); }
      if (o.hot) { c.fillStyle = 'rgba(255,110,60,' + Math.min(0.55, 0.15 + 0.1 * o.hot) + ')'; rr(c, -0.5 * L, -hh, L, 2 * hh, hh); c.fill(); }
    } else if (t === 'led') {
      lead(-L, -0.3 * L); lead(0.3 * L, L);
      var col = CM.LED_COLORS[p.c] ? CM.LED_COLORS[p.c].hex : '#ff6b6b', R2 = 0.3 * L;
      c.beginPath(); c.arc(0, 0, R2, 0, Math.PI * 2);
      if (p.burned) c.fillStyle = '#3b302b';
      else if (b > 0.02) { g = c.createRadialGradient(0, 0, 0, 0, 0, R2); g.addColorStop(0, mixHex(col, '#ffffff', Math.min(0.85, b * 0.6))); g.addColorStop(1, col); c.fillStyle = g; }
      else c.fillStyle = mixHex(col, '#0a1923', 0.62);
      c.fill(); c.strokeStyle = p.burned ? '#6b5d55' : mixHex(col, '#ffffff', 0.35); c.lineWidth = Math.max(1.2, L * 0.04); c.stroke();
      c.strokeStyle = p.burned ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.8)'; c.fillStyle = c.strokeStyle; c.lineWidth = Math.max(1, L * 0.035);
      c.beginPath(); c.moveTo(-0.13 * L, -0.14 * L); c.lineTo(0.1 * L, 0); c.lineTo(-0.13 * L, 0.14 * L); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(0.12 * L, -0.14 * L); c.lineTo(0.12 * L, 0.14 * L); c.stroke();
      if (p.burned) { c.strokeStyle = '#1b1411'; c.beginPath(); c.moveTo(-0.2 * L, -0.18 * L); c.lineTo(0.02 * L, 0.02 * L); c.lineTo(-0.05 * L, 0.2 * L); c.stroke(); }
    } else if (t === 'sw') {
      lead(-L, -0.55 * L); lead(0.55 * L, L);
      rr(c, -0.74 * L, -0.2 * L, 1.48 * L, 0.4 * L, 0.1 * L); c.fillStyle = '#122430'; c.fill(); c.strokeStyle = '#2c4656'; c.lineWidth = 1; c.stroke();
      var a = swAng[p.id] === undefined ? (p.on ? 0 : 0.6) : swAng[p.id], bl = 1.12 * L, ex = -0.55 * L + bl * Math.cos(a), ey = -bl * Math.sin(a);
      c.strokeStyle = '#7d8c97'; c.lineWidth = Math.max(1.4, L * 0.05); c.beginPath(); c.moveTo(0.48 * L, -0.12 * L); c.lineTo(0.48 * L, 0); c.moveTo(0.62 * L, -0.12 * L); c.lineTo(0.62 * L, 0); c.stroke();
      c.strokeStyle = '#dfe6eb'; c.lineWidth = Math.max(2, L * 0.075); c.lineCap = 'round'; c.beginPath(); c.moveTo(-0.55 * L, 0); c.lineTo(ex, ey); c.stroke();
      c.fillStyle = C.brass; c.beginPath(); c.arc(-0.55 * L, 0, 0.1 * L, 0, Math.PI * 2); c.arc(0.55 * L, 0, 0.07 * L, 0, Math.PI * 2); c.fill();
      c.fillStyle = p.on ? C.green : C.red; c.beginPath(); c.arc(-0.55 * L + bl * 0.8 * Math.cos(a), -bl * 0.8 * Math.sin(a), 0.11 * L, 0, Math.PI * 2); c.fill();
    } else if (t === 'buzzer') {
      lead(-L, -0.4 * L); lead(0.4 * L, L);
      g = c.createRadialGradient(-0.1 * L, -0.1 * L, 0, 0, 0, 0.4 * L); g.addColorStop(0, '#3a434b'); g.addColorStop(1, '#101519');
      c.beginPath(); c.arc(0, 0, 0.4 * L, 0, Math.PI * 2); c.fillStyle = g; c.fill(); c.strokeStyle = '#56636e'; c.lineWidth = Math.max(1.2, L * 0.04); c.stroke();
      c.beginPath(); c.arc(0, 0, 0.26 * L, 0, Math.PI * 2); c.strokeStyle = '#2b343b'; c.stroke();
      c.beginPath(); c.arc(0, 0, 0.07 * L, 0, Math.PI * 2); c.fillStyle = '#000'; c.fill();
      if (b > 0) {
        c.strokeStyle = 'rgba(249,168,212,' + (0.35 + 0.55 * b) + ')'; c.lineWidth = Math.max(1.2, L * 0.04);
        for (var s2 = -1; s2 <= 1; s2 += 2) for (var r3 = 0; r3 < 2; r3++) { var rad = (0.52 + 0.2 * r3) * L + (RM ? 0 : Math.sin(time * 40 + r3) * 0.02 * L); c.beginPath(); c.arc(0, 0, rad, s2 * Math.PI / 2 - 0.45, s2 * Math.PI / 2 + 0.45); c.stroke(); }
      }
    } else if (t === 'ammeter' || t === 'voltmeter') {
      lead(-L, -0.44 * L); lead(0.44 * L, L);
      c.beginPath(); c.arc(0, 0, 0.44 * L, 0, Math.PI * 2); c.fillStyle = '#e9eff3'; c.fill(); c.strokeStyle = '#26353f'; c.lineWidth = Math.max(1.5, L * 0.05); c.stroke();
      c.beginPath(); c.arc(0, 0, 0.36 * L, 0, Math.PI * 2); c.strokeStyle = t === 'ammeter' ? C.blue : C.pink; c.lineWidth = Math.max(1.2, L * 0.035); c.stroke();
      c.fillStyle = '#e03131'; c.beginPath(); c.arc(-0.44 * L, 0, 0.08 * L, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#20262b'; c.beginPath(); c.arc(0.44 * L, 0, 0.08 * L, 0, Math.PI * 2); c.fill();
    }
    if (o.bad) { c.fillStyle = 'rgba(255,80,80,.28)'; rr(c, -0.86 * L, -0.42 * L, 1.72 * L, 0.84 * L, 0.2 * L); c.fill(); }
    c.restore();
    // upright marks
    var ux = (B[0] - A[0]) / (2 * L), uy = (B[1] - A[1]) / (2 * L), fs = Math.max(9, L * 0.3);
    function txt(s, lx, ly, col, font) { c.fillStyle = col; c.font = font || ('700 ' + fs + 'px system-ui, sans-serif'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, cx + ux * lx - uy * ly, cy + uy * lx + ux * ly); }
    if (t === 'cell') { txt('+', -0.4 * L, 0, '#3b2a00'); txt('−', 0.36 * L, 0, '#e8eef2'); }
    if (t === 'battery9') { txt('+', -0.56 * L, 0, '#3b2a00', '700 ' + (fs * 0.9) + 'px system-ui, sans-serif'); txt('9V', 0.12 * L, 0, C.gold, '800 ' + Math.max(9, L * 0.32) + 'px system-ui, sans-serif'); }
    if (t === 'led' && o.marks !== false) txt('+', -0.62 * L, -0.3 * L, '#ffb3b3', '700 ' + Math.max(9, L * 0.24) + 'px system-ui, sans-serif');
    if (t === 'ammeter') txt('A', 0, 0, '#13212b', '800 ' + Math.max(9, L * 0.38) + 'px system-ui, sans-serif');
    if (t === 'voltmeter') txt('V', 0, 0, '#13212b', '800 ' + Math.max(9, L * 0.38) + 'px system-ui, sans-serif');
    if ((t === 'ammeter' || t === 'voltmeter') && o.marks !== false) { txt('+', -0.62 * L, -0.3 * L, '#ff8787', '700 ' + Math.max(9, L * 0.24) + 'px system-ui, sans-serif'); }
  }
  function glow(c, p, A, B, L, b, over) {
    if (p.burned || b <= 0.01) return;
    var cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, fl = over && !RM ? 0.75 + 0.25 * Math.sin(time * 50) : 1, g, r;
    if (p.t === 'bulb') {
      r = L * (0.6 + 1.0 * Math.sqrt(Math.min(b, 3)));
      g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(255,240,200,' + Math.min(0.75, 0.6 * b) * fl + ')'); g.addColorStop(0.35, 'rgba(255,212,121,' + Math.min(0.4, 0.35 * b) * fl + ')'); g.addColorStop(1, 'rgba(255,190,90,0)');
    } else if (p.t === 'led') {
      var col = CM.LED_COLORS[p.c].hex, rgb = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)].join(',');
      r = L * (0.45 + 0.9 * Math.sqrt(Math.min(b, 3)));
      g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(' + rgb + ',' + Math.min(0.8, 0.7 * b) * fl + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    } else return;
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
  }
  function pill(c, x, y, s, col, align) {
    var fs = clamp(G.cell * 0.24, 10, 13); c.font = '600 ' + fs + 'px system-ui, sans-serif';
    var w = c.measureText(s).width + 10, h = fs + 7, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    c.fillStyle = 'rgba(6,17,26,.82)'; rr(c, x0, y - h / 2, w, h, h / 2); c.fill();
    c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(s, x0 + 5, y + 0.5);
  }
  function labelOf(p) {
    var v = res ? res.v[p.id] || 0 : 0, I = res ? res.i[p.id] || 0 : 0, b = bright(p), s = '', col = C.ink;
    if (p.burned) return ['burned out', C.red];
    if (p.t === 'cell') s = '1.5 V';
    else if (p.t === 'bulb') { if (b >= 0.005) { s = Math.round(b * 100) + '%'; col = b > 1.05 ? '#ffa94d' : C.gold; } }
    else if (p.t === 'resistor') { s = fR(p.R); if (Math.abs(v * I) > T.resistor.ratedP) { s += ' · hot!'; col = '#ffa94d'; } }
    else if (p.t === 'led') { if (v < -0.5) { s = 'blocked'; col = C.muted; } else if (I >= 1e-4) { s = fA(I); col = I > CM.LED.imax ? C.red : CM.LED_COLORS[p.c].hex; } }
    else if (p.t === 'buzzer') { if (b > 0) { s = 'bzzz'; col = C.pink; } }
    else if (p.t === 'ammeter') { s = fA(I); col = C.blue; }
    else if (p.t === 'voltmeter') { s = fV(v); col = C.pink; }
    if (opts.nums && p.t !== 'ammeter' && p.t !== 'voltmeter' && res) {
      var nn = T[p.t].src ? fV(v) + ', ' + fA(res.out[p.id] || 0) : fV(v) + ', ' + fA(I);
      s = s ? s + ' · ' + nn : nn;
    }
    return [s, col];
  }
  function draw() {
    var c = ctx, w = K.w, h = K.h, L = G.cell, i, k, p;
    c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    // board
    var tl = S(-0.5, -0.5), br = S(COLS + 0.5, ROWS + 0.5);
    rr(c, Math.min(tl[0], br[0]), Math.min(tl[1], br[1]), Math.abs(br[0] - tl[0]), Math.abs(br[1] - tl[1]), 12); c.fillStyle = C.board; c.fill(); c.strokeStyle = '#16303f'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = 'rgba(120,170,200,.07)'; c.lineWidth = 1; c.beginPath();
    for (var gx = 0; gx <= COLS; gx++) { var g0 = S(gx, 0), g1 = S(gx, ROWS); c.moveTo(g0[0], g0[1]); c.lineTo(g1[0], g1[1]); }
    for (var gy = 0; gy <= ROWS; gy++) { var h0 = S(0, gy), h1 = S(COLS, gy); c.moveTo(h0[0], h0[1]); c.lineTo(h1[0], h1[1]); }
    c.stroke();
    c.fillStyle = C.hole;
    for (var x = 0; x <= COLS; x++) for (var y = 0; y <= ROWS; y++) { var q = S(x, y); c.beginPath(); c.arc(q[0], q[1], Math.max(1.4, L * 0.045), 0, Math.PI * 2); c.fill(); }
    // wires
    var shortI = CM.SHORT_I, selKeys = {}; if (sel && sel.k === 'wire') sel.keys.forEach(function (kk) { selKeys[kk] = 1; });
    var wlw = Math.max(3, L * 0.11), deg = {};
    for (k in board.wires) {
      var ij = CM.eparse(k), a = S(CM.px(ij[0]), CM.py(ij[0])), b = S(CM.px(ij[1]), CM.py(ij[1])), I = res && res.wire[k] ? Math.abs(res.wire[k]) : 0;
      deg[ij[0]] = (deg[ij[0]] || 0) + 1; deg[ij[1]] = (deg[ij[1]] || 0) + 1;
      c.lineCap = 'round';
      if (selKeys[k] || I > shortI) { c.strokeStyle = selKeys[k] ? 'rgba(99,230,190,.55)' : 'rgba(255,90,60,' + (0.45 + 0.25 * Math.sin(time * 10)) + ')'; c.lineWidth = wlw * 2.3; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
      c.strokeStyle = C.wire; c.lineWidth = wlw; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      c.strokeStyle = I > 1e-6 ? 'rgba(170,215,245,.75)' : 'rgba(140,196,232,.35)'; c.lineWidth = wlw * 0.32; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
    }
    // parts
    var moving = drag && drag.mode === 'move' ? drag.id : null;
    board.parts.forEach(function (p) { CM.ends(p).forEach(function (e) { var id = CM.idx(e[0], e[1]); deg[id] = (deg[id] || 0) + 1; }); });
    for (i = 0; i < board.parts.length; i++) {
      p = board.parts[i]; var e2 = CM.ends(p), A = S(e2[0][0], e2[0][1]), B = S(e2[1][0], e2[1][1]);
      var hot = 0; if (res) { if (T[p.t].src && res.shorts.indexOf(p.id) >= 0) hot = 1; if (p.t === 'resistor') { var pw = Math.abs((res.v[p.id] || 0) * (res.i[p.id] || 0)); if (pw > T.resistor.ratedP) hot = pw / T.resistor.ratedP; } }
      c.globalAlpha = p.id === moving ? 0.3 : 1;
      drawPart(c, p, A, B, L, { b: bright(p), sel: sel && sel.k === 'part' && sel.id === p.id && !moving, hot: hot });
      c.globalAlpha = 1;
    }
    // terminals and junctions
    for (k in deg) {
      var pt = +k, s = S(CM.px(pt), CM.py(pt)), isT = false;
      if (deg[k] >= 3) { c.fillStyle = '#9cc8e6'; c.beginPath(); c.arc(s[0], s[1], Math.max(2.5, L * 0.09), 0, Math.PI * 2); c.fill(); }
    }
    board.parts.forEach(function (p) { CM.ends(p).forEach(function (e) { var s2 = S(e[0], e[1]); c.fillStyle = '#1a2a35'; c.strokeStyle = C.brass; c.lineWidth = Math.max(1.2, L * 0.035); c.beginPath(); c.arc(s2[0], s2[1], Math.max(2.4, L * 0.075), 0, Math.PI * 2); c.fill(); c.stroke(); }); });
    // glows
    c.globalCompositeOperation = 'lighter';
    for (i = 0; i < board.parts.length; i++) { p = board.parts[i]; if (p.t !== 'bulb' && p.t !== 'led') continue; var e3 = CM.ends(p); glow(c, p, S(e3[0][0], e3[0][1]), S(e3[1][0], e3[1][1]), L, bright(p), res && res.over.indexOf(p.id) >= 0); }
    c.globalCompositeOperation = 'source-over';
    // current dots
    if (opts.dots && res) {
      var dr = Math.max(1.6, L * 0.055);
      c.fillStyle = opts.elec ? C.blue : C.gold;
      conductors.forEach(function (cd) {
        if (Math.abs(cd.I) < 1e-5) return;
        var ph = phase[cd.k] || 0;
        for (var sd = ph; sd < cd.len - 1e-6; sd += 0.5) {
          var f = sd / cd.len, wx = cd.a[0] + (cd.b[0] - cd.a[0]) * f, wy = cd.a[1] + (cd.b[1] - cd.a[1]) * f, sp = S(wx, wy);
          c.beginPath(); c.arc(sp[0], sp[1], dr, 0, Math.PI * 2); c.fill();
        }
      });
    }
    // labels
    for (i = 0; i < board.parts.length; i++) {
      p = board.parts[i]; if (p.id === moving) continue;
      var lb = labelOf(p); if (!lb[0]) continue;
      var e4 = CM.ends(p), P0 = S(e4[0][0], e4[0][1]), P1 = S(e4[1][0], e4[1][1]), mx = (P0[0] + P1[0]) / 2, my = (P0[1] + P1[1]) / 2;
      if (Math.abs(P1[0] - P0[0]) > Math.abs(P1[1] - P0[1])) { var yy = my - 0.62 * L; if (yy < G.oy - 0.2 * L) yy = my + 0.62 * L; pill(c, mx, yy, lb[0], lb[1], 'center'); }
      else { var right = mx + 0.55 * L + 60 < K.w; pill(c, right ? mx + 0.5 * L : mx - 0.5 * L, my, lb[0], lb[1], right ? 'left' : 'right'); }
    }
    // wire being drawn: blocked end
    if (drag && drag.mode === 'wire' && drag.blocked) { var be = S(CM.px(drag.path[drag.path.length - 1]), CM.py(drag.path[drag.path.length - 1])); c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.arc(be[0], be[1], L * 0.22, 0, Math.PI * 2); c.stroke(); }
    // where to start, on the first board
    if (guide && !drag) guide.forEach(function (g, n) { var gs = S(g[0], g[1]), ph = RM ? 0.5 : (time * 1.2 + n * 0.5) % 1; c.strokeStyle = 'rgba(99,230,190,' + (0.9 * (1 - ph)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(gs[0], gs[1], L * (0.15 + 0.35 * ph), 0, Math.PI * 2); c.stroke(); });
    // hover point
    if (hover && !drag) { var hs = S(hover[0], hover[1]); c.strokeStyle = 'rgba(99,230,190,.85)'; c.lineWidth = 2; c.beginPath(); c.arc(hs[0], hs[1], L * 0.2, 0, Math.PI * 2); c.stroke(); }
    // ghost
    if (ghost) { var ge = CM.ends(ghost.p); c.globalAlpha = 0.7; drawPart(c, ghost.p, S(ge[0][0], ge[0][1]), S(ge[1][0], ge[1][1]), L, { bad: !ghost.ok && !ghost.same }); c.globalAlpha = 1; }
    // keyboard cursor
    if (cursor.show && document.activeElement === cv) {
      var cs = S(cursor.x, cursor.y); c.strokeStyle = C.gold; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.arc(cs[0], cs[1], L * 0.3, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      if (pen) { c.fillStyle = C.gold; c.beginPath(); c.arc(cs[0], cs[1], L * 0.1, 0, Math.PI * 2); c.fill(); }
    }
    // pops
    fx.forEach(function (f) {
      var a = 1 - f.t / f.life;
      if (f.k === 'spark') { c.strokeStyle = f.col; c.globalAlpha = a; c.lineWidth = 2; c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x - f.vx * 0.04, f.y - f.vy * 0.04); c.stroke(); }
      else if (f.k === 'smoke') { c.fillStyle = 'rgba(160,170,180,' + (0.35 * a) + ')'; c.beginPath(); c.arc(f.x, f.y, f.r * (1 + f.t), 0, Math.PI * 2); c.fill(); }
      else { c.globalAlpha = a; c.fillStyle = '#fff'; c.font = '800 ' + Math.max(14, L * 0.42) + 'px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(f.s, f.x, f.y - (RM ? 0 : f.t * L * 0.6)); }
      c.globalAlpha = 1;
    });
  }

  // ---------- tray icons ----------
  function drawIcons() {
    var bs = tray.querySelectorAll('button[data-tool] canvas');
    for (var i = 0; i < bs.length; i++) {
      var cvs = bs[i], t = cvs.parentNode.dataset.tool, dpr = Math.min(2, window.devicePixelRatio || 1), w = 46, h = 26;
      cvs.width = w * dpr; cvs.height = h * dpr; var c = cvs.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
      if (t === 'erase') {
        c.save(); c.translate(23, 13); c.rotate(-0.5); rr(c, -11, -6, 22, 12, 3); c.fillStyle = '#f9a8d4'; c.fill(); c.fillStyle = '#74c0fc'; c.fillRect(-11, -6, 8, 12); c.restore();
        continue;
      }
      var p = { id: 'i' + t, t: t, x: 0, y: 0, o: 'h', f: false, on: t !== 'sw', R: 220, c: 'red' };
      var L = 18, A = [23 - L, 13], B = [23 + L, 13];
      drawPart(c, p, A, B, L, { b: t === 'bulb' ? 0.8 : t === 'led' ? 0.9 : 0, marks: false });
      if (t === 'bulb' || t === 'led') { c.globalCompositeOperation = 'lighter'; glow(c, p, A, B, L * 0.7, t === 'bulb' ? 0.6 : 0.7, false); c.globalCompositeOperation = 'source-over'; }
    }
  }

  // ---------- controls ----------
  root.querySelectorAll('[data-scene]').forEach(function (b) { b.addEventListener('click', function () { loadScene(b.dataset.scene); }); });
  function bindChk(id, key, cb) { var el = $(id); if (!el) return; el.checked = !!opts[key]; el.addEventListener('change', function () { opts[key] = el.checked; if (key === 'dots' || key === 'nums') ST.set(key, el.checked); if (cb) cb(); }); }
  bindChk('circuits-dots', 'dots'); bindChk('circuits-elec', 'elec'); bindChk('circuits-nums', 'nums');
  var spd = $('circuits-speed'); if (spd) spd.addEventListener('change', function () { opts.speed = +spd.value || 1; });
  $('circuits-undo').addEventListener('click', undo);
  $('circuits-clear').addEventListener('click', function () { if (!board.parts.length && !Object.keys(board.wires).length) return; snap(); board = { parts: [], wires: {} }; select(null); built = true; changed(true); setHint('Board cleared. Undo (↶) brings it back.'); });
  var sndBtn = $('circuits-sound');
  function sndUi() { sndBtn.setAttribute('aria-pressed', opts.sound ? 'true' : 'false'); sndBtn.setAttribute('aria-label', opts.sound ? 'Sound on' : 'Sound off'); sndBtn.title = opts.sound ? 'Sound on' : 'Sound off'; sndBtn.querySelector('.on').style.display = opts.sound ? '' : 'none'; sndBtn.querySelector('.off').style.display = opts.sound ? 'none' : ''; }
  sndBtn.addEventListener('click', function () { opts.sound = !opts.sound; ST.set('sound', opts.sound); sndUi(); if (opts.sound) audio(true); else buzz(0); });
  sndUi();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && (tool || sel) && document.activeElement && root.contains(document.activeElement)) { setTool(null); select(null); } });

  // ---------- start ----------
  var saved = ST.get('board', null);
  if (saved && saved.parts && saved.parts.length) { load(saved); setHint('Welcome back: here is the board you left. Scenes and missions are on the right.'); }
  else { loadScene('m_light', true); MS.setCurrent('light'); }
  drawIcons(); refreshSel();
  window.addEventListener('resize', function () { popAt = ''; });
  LAB.loop(function (dt) { layout(); if (dirty) resolve(); tick(dt); draw(); placePop(); }, view);
  // test hook (read-only view of the state, used by the automated checks)
  window.__circuits = { board: function () { return board; }, res: function () { return res; }, geom: function () { return G; }, S: S, scene: loadScene, solve: function () { resolve(); } };
})();
