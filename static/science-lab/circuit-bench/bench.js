/* Circuit Bench (/science-lab/circuit-bench/): the screen, drawing and controls. Written for this site; needs
   /js/rule-drag.js (window.RuleDrag), /games/lab/lab.js (window.TRBLab) and model.js (window.CBModel).

   Dragging follows RuleDrag: a part only lands on a free spot on the bench (or the bin), and a wire end only lands on a
   terminal. While you drag a wire, every terminal it could reach is colored by what that wire would do (green: it
   completes a circuit; red: it would short the battery), and the bench shows the circuit as if the wire were there.
   Element ids in layouts/science-lab/circuit-bench.html are this script's contract. */
(function () {
  'use strict';
  var M = window.CBModel, RD = window.RuleDrag, LAB = window.TRBLab, D = document;
  var view = D.getElementById('cb-view'), cv = D.getElementById('cb-cv');
  if (!M || !RD || !LAB || !view || !cv) return;
  var $ = function (id) { return D.getElementById(id); };
  var store = LAB.store('circuit-bench'), cvs = LAB.canvas(cv), ctx = cvs.c;
  var NAMES = {}; Object.keys(M.TYPES).forEach(function (t) { NAMES[t] = M.TYPES[t].name; });
  var WIRE_COLORS = ['#e03131', '#1c7ed6', '#f2c94c', '#2f9e44', '#e8590c', '#ae3ec9', '#e9ecef'];
  var NSLOT = 15, SH = 124, TOP = 14, BINH = 62;
  var L = { C: 5, SW: 146, PAD: 20, WW: 770, WH: 450, s: 1 };
  var S = { bench: M.newBench(), sol: null, view: null, sel: null, focus: null, drag: null, chal: null, mem: {}, morse: [], nums: false, t: 0, motorA: {}, sound: store.get('sound', true), warnedShort: false };

  // ---------- layout ----------
  function layout() {
    var w = view.parentNode.getBoundingClientRect().width || 360;
    var narrow = w < 600;
    L.C = narrow ? 3 : 5; L.SW = narrow ? 124 : 146; L.PAD = narrow ? 12 : 20;
    L.WW = L.C * L.SW + 2 * L.PAD; L.WH = TOP + Math.ceil(NSLOT / L.C) * SH + BINH;
    L.s = w / L.WW;
    var h = Math.round(L.WH * L.s);
    if (view.style.height !== h + 'px') view.style.height = h + 'px';
    cvs.fit();
  }
  function slotC(i) { return { x: L.PAD + (i % L.C + 0.5) * L.SW, y: TOP + (Math.floor(i / L.C) + 0.5) * SH }; }
  function binR() { return { x: L.WW - L.PAD - 104, y: L.WH - BINH + 8, w: 104, h: BINH - 16 }; }
  function binC() { var r = binR(); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
  function centerOf(p) {
    var d = S.drag;
    if (d && d.kind === 'part' && d.id === p.id && d.st) return d.st.bin ? binC() : slotC(d.st.slot);
    return slotC(p.slot);
  }
  function termOff(p, k) {
    if (p.t === 'twoway') return k === 'c' ? { x: -50, y: 24 } : k === 'a' ? { x: 50, y: 6 } : { x: 50, y: 42 };
    var left = M.TYPES[p.t].terms[0];
    if (p.t === 'led' && p.flip) left = 'ca';
    return { x: k === left ? -50 : 50, y: 26 };
  }
  function termPt(x) { var p = M.part(S.bench, x.p); if (!p) return { x: 0, y: 0 }; var c = centerOf(p), o = termOff(p, x.k); return { x: c.x + o.x, y: c.y + o.y }; }
  function wirePts(a, b) {
    var d = Math.hypot(b.x - a.x, b.y - a.y), sag = 18 + d * 0.22;
    return [a, { x: a.x, y: a.y + sag }, { x: b.x, y: b.y + sag }, b];
  }
  function bez(P, t) {
    var u = 1 - t;
    return { x: u * u * u * P[0].x + 3 * u * u * t * P[1].x + 3 * u * t * t * P[2].x + t * t * t * P[3].x,
      y: u * u * u * P[0].y + 3 * u * u * t * P[1].y + 3 * u * t * t * P[2].y + t * t * t * P[3].y };
  }
  function wireMid(w) { return bez(wirePts(termPt(w.a), termPt(w.b)), 0.5); }
  function toWorld(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / L.s, y: (e.clientY - r.top) / L.s }; }
  function usedSlots(except) { var u = {}; S.bench.parts.forEach(function (p) { if (p.id !== except) u[p.slot] = 1; }); return u; }
  function freeSlots(except) { var u = usedSlots(except), out = []; for (var i = 0; i < NSLOT; i++) if (!u[i]) out.push(i); return out; }
  function tName(x) { var p = M.part(S.bench, x.p); return p ? NAMES[p.t] + ' ' + M.TYPES[p.t].tl[x.k] : ''; }

  // ---------- solving and checking ----------
  function changed(why) {
    S.sol = M.solve(S.bench); S.view = null;
    check();
    renderSel(); status(); save();
    if (why) say(why);
  }
  function check() {
    if (!S.chal) { $('cb-note').textContent = ''; return; }
    var ch = chalById(S.chal); if (!ch) return;
    var r = ch.check({ bench: S.bench, sol: S.sol, mem: S.mem, morse: S.morse });
    $('cb-note').textContent = r.note || '';
    if (r.done && !S.mem.__done) {
      S.mem.__done = 1;
      mis.done(ch.id); LAB.toast(view, 'Challenge done: ' + ch.title + ' ✓'); $('cb-goal').classList.add('done'); say('Challenge done: ' + ch.title + '. ' + (r.note || ''));
    }
  }
  function chalById(id) { for (var i = 0; i < M.CHALLENGES.length; i++) if (M.CHALLENGES[i].id === id) return M.CHALLENGES[i]; return null; }
  function sol() { return S.view || S.sol; }

  // ---------- status line and warnings ----------
  function fmtI(i) { i = Math.abs(i); return i >= 1 ? i.toFixed(2) + ' A' : i >= 0.001 ? (i * 1000).toFixed(i >= 0.1 ? 0 : 1) + ' mA' : '0 A'; }
  function fmtV(v) { return LAB.fmt(v, Math.abs(v) >= 10 ? 1 : 2) + ' V'; }
  function status() {
    var s = S.sol, b = S.bench, msg = '', warn = '';
    if (s.short.length) {
      warn = 'Short circuit! The battery’s two ends are joined by wire with nothing in between to use the energy. About ' + fmtI(s.parts[s.short[0]].i) + ' would flow: a real wire would get hot within seconds and the battery would drain fast. Remove the red wire to fix it.';
      msg = 'Short circuit across the battery.';
    } else if (s.complete) {
      var bats = b.parts.filter(function (p) { return p.t === 'battery' && s.parts[p.id].on; });
      msg = 'Complete circuit: ' + fmtI(s.parts[bats[0].id].i) + ' flows from the battery' + (bats.length > 1 ? 's' : '') + '.';
      b.parts.forEach(function (p) { var q = s.parts[p.id]; if (p.t === 'led' && q.over) msg += ' The LED is getting ' + fmtI(q.i) + ': a real one would burn out. Add a resistor.'; if (p.t === 'lamp' && q.hot) msg += ' A bulb is far over its rating and would burn out soon.'; });
    } else if (s.gaps.length) {
      var g = s.gaps.slice(0, 3).map(function (x) {
        var p = M.part(b, x.p);
        if (x.why === 'open') return 'the ' + NAMES[p.t].toLowerCase() + ' is open';
        if (x.why === 'throw') return 'the two-way switch points to a contact with no wire';
        if (x.why === 'backward') return 'the LED is the wrong way round (its + leg must face the battery’s + end)';
        return 'nothing is connected to the ' + tName(x);
      });
      msg = 'Open circuit: no current flows, because ' + g.join('; ') + (s.gaps.length > 3 ? '; and more' : '') + '.';
    } else if (b.wires.length) {
      msg = b.parts.some(function (p) { return p.t === 'battery'; }) ? 'No current flows. The loop looks closed, so something inside a part may be broken. A voltmeter across a gap reads the whole battery voltage.' : 'Add a battery holder: nothing flows without one.';
    } else msg = b.parts.length ? 'Drag from one brass terminal to another to add a wire.' : 'The bench is empty. Add parts from the tray below, or pick a challenge.';
    $('cb-status').textContent = msg;
    var wEl = $('cb-warn');
    if (warn) { wEl.textContent = warn; wEl.hidden = false; } else wEl.hidden = true;
  }
  function say(t) { $('cb-live').textContent = t; }

  // ---------- the selected-part panel ----------
  function renderSel() {
    var el = $('cb-sel'), s = S.sol, h = '';
    if (S.sel && S.sel.kind === 'wire') {
      var w = null; S.bench.wires.forEach(function (x) { if (x.id === S.sel.id) w = x; });
      if (!w) { S.sel = null; } else {
        h = '<p><b>Wire</b> from the ' + tName(w.a) + ' to the ' + tName(w.b) + '.</p><dl class="lab-readout"><dt>Current</dt><dd>' + fmtI(s.wires[w.id] || 0) + '</dd></dl>' +
          '<div class="lab-row"><button type="button" class="lab-btn" data-act="rmw">Remove wire</button></div><p class="lab-small">Drag either end of the wire to another terminal, or onto the bin.</p>';
      }
    }
    var p = S.sel && S.sel.kind === 'part' ? M.part(S.bench, S.sel.id) : null;
    if (S.sel && S.sel.kind === 'part' && !p) S.sel = null;
    if (p) {
      var q = s.parts[p.id], rows = [];
      h = '<p><b>' + NAMES[p.t] + '</b> ' + blurb(p) + '</p>';
      if (p.t === 'battery') { rows.push(['Cells', p.n + ' × 1.5 V = ' + (1.5 * p.n).toFixed(1) + ' V']); rows.push(['Across its ends', fmtV(q.v)]); rows.push(['Current out of +', fmtI(q.i)]); }
      else if (p.t === 'voltmeter') rows.push(['Reading', fmtV(q.read)]);
      else if (p.t === 'ammeter') rows.push(['Reading', (q.read < 0 && Math.abs(q.read) > 1e-4 ? '−' : '') + fmtI(q.read)]);
      else if (p.t === 'twoway') rows.push(['Points to', p.pos === 'a' ? 'upper contact' : 'lower contact']);
      else if (p.t === 'switch' || p.t === 'key') rows.push(['State', (p.t === 'key' ? p.down : p.on) ? 'closed (on)' : 'open (off)']);
      else { rows.push(['Voltage', fmtV(q.v)]); rows.push(['Current', fmtI(q.i)]); }
      if (p.t === 'lamp') rows.push(['Brightness', Math.round((q.bright || 0) * 100) + '% of its rating']);
      if (p.t === 'resistor') rows.push(['Resistance', p.r + ' Ω']);
      if (p.t === 'coil') rows.push(['Strength', Math.round(q.at) + ' ampere-turns']);
      if (p.t === 'motor') rows.push(['Spinning', q.spin ? (q.spin > 0 ? 'clockwise' : 'counterclockwise') : 'no']);
      if (p.t === 'buzzer') rows.push(['Sounding', q.on ? 'yes' : 'no']);
      h += '<dl class="lab-readout">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl><div class="lab-row">';
      if (p.t === 'battery') h += '<button type="button" class="lab-btn" data-act="cells-" aria-label="One cell fewer"' + (p.n <= 1 ? ' disabled' : '') + '>− cell</button><button type="button" class="lab-btn" data-act="cells+" aria-label="One cell more"' + (p.n >= 4 ? ' disabled' : '') + '>+ cell</button>';
      if (p.t === 'resistor') h += '<label class="lab-field"><span>Size</span><select data-act="res">' + M.RES.map(function (r) { return '<option value="' + r + '"' + (r === p.r ? ' selected' : '') + '>' + (r >= 1000 ? r / 1000 + ' kΩ' : r + ' Ω') + '</option>'; }).join('') + '</select></label>';
      if (p.t === 'led') h += '<button type="button" class="lab-btn" data-act="flip">⇄ Turn it around</button>';
      if (p.t === 'switch') h += '<button type="button" class="lab-btn" data-act="toggle">' + (p.on ? 'Switch off' : 'Switch on') + '</button>';
      if (p.t === 'twoway') h += '<button type="button" class="lab-btn" data-act="toggle">Flip</button>';
      if (p.t === 'key') h += '<button type="button" class="lab-btn pri" data-act="press">Press the key</button>';
      h += '<button type="button" class="lab-btn" data-act="rm">Remove</button></div>';
    }
    if (!h) h = '<p class="lab-small">Tap a part or a wire to see its numbers. Tap a switch to flip it; press the telegraph key’s lever to close it.</p>';
    if (el._h !== h) { el._h = h; el.innerHTML = h; }
  }
  function blurb(p) {
    switch (p.t) {
      case 'battery': return 'holds 1 to 4 cells end to end, so their voltages add.';
      case 'lamp': return 'a flashlight bulb made for 3 V (10 Ω).' + (p.broken ? '' : '');
      case 'switch': return 'a gap you can open and close.';
      case 'key': return 'a springy switch: closed only while you hold it down.';
      case 'twoway': return 'joins its middle terminal to the upper or the lower contact.';
      case 'led': return 'lets current through only from its + leg (long) to its − leg, and needs a resistor.';
      case 'resistor': return 'limits the current: V = I × R.';
      case 'buzzer': return 'a small buzzer (150 Ω) that works either way round.';
      case 'coil': return '100 turns of wire around an iron nail (3 Ω).';
      case 'motor': return 'a small motor (8 Ω). The current’s direction sets which way it turns.';
      case 'voltmeter': return 'reads the voltage between its two leads. It goes across a part.';
      case 'ammeter': return 'reads the current going through it. It goes in the loop, in series.';
    }
    return '';
  }
  $('cb-sel').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var a = b.dataset.act, p = S.sel && S.sel.kind === 'part' ? M.part(S.bench, S.sel.id) : null;
    if (a === 'rmw' && S.sel) { M.removeWire(S.bench, S.sel.id); S.sel = null; changed('Wire removed.'); return; }
    if (!p) return;
    if (a === 'cells-' || a === 'cells+') { p.n = Math.max(1, Math.min(4, p.n + (a === 'cells+' ? 1 : -1))); changed('Battery: ' + p.n + (p.n > 1 ? ' cells, ' : ' cell, ') + (1.5 * p.n).toFixed(1) + ' V.'); }
    if (a === 'flip') { flipLed(p); }
    if (a === 'toggle') toggle(p);
    if (a === 'rm') { M.removePart(S.bench, p.id); S.sel = null; changed(NAMES[p.t] + ' removed.'); }
  });
  $('cb-sel').addEventListener('change', function (e) {
    var p = S.sel && S.sel.kind === 'part' ? M.part(S.bench, S.sel.id) : null;
    if (p && e.target.dataset.act === 'res') { p.r = +e.target.value; changed('Resistor: ' + p.r + ' ohms.'); }
  });
  // the key's button: press and hold
  $('cb-sel').addEventListener('pointerdown', function (e) { var b = e.target.closest('button[data-act="press"]'); if (!b) return; e.preventDefault(); var p = M.part(S.bench, S.sel.id); if (p) keyDown(p); try { b.setPointerCapture(e.pointerId); } catch (er) { } });
  function relBtn(e) { var b = e.target.closest && e.target.closest('button[data-act="press"]'); if (!b) return; S.bench.parts.forEach(function (p) { if (p.t === 'key' && p.down) keyUp(p); }); }
  $('cb-sel').addEventListener('pointerup', relBtn);
  $('cb-sel').addEventListener('pointercancel', relBtn);
  $('cb-sel').addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && e.target.dataset && e.target.dataset.act === 'press') { e.preventDefault(); if (!e.repeat) { var p = M.part(S.bench, S.sel.id); if (p) keyDown(p); } } });
  $('cb-sel').addEventListener('keyup', function (e) { if ((e.key === ' ' || e.key === 'Enter') && e.target.dataset && e.target.dataset.act === 'press') relBtn(e); });

  function toggle(p) {
    if (p.t === 'switch') { p.on = !p.on; changed('Switch ' + (p.on ? 'on' : 'off') + '.'); }
    else if (p.t === 'twoway') { p.pos = p.pos === 'a' ? 'b' : 'a'; changed('Two-way switch now points to the ' + (p.pos === 'a' ? 'upper' : 'lower') + ' contact.'); }
    else if (p.t === 'key') { keyDown(p); setTimeout(function () { keyUp(p); }, 150); }
  }
  function flipLed(p) {
    // turn the LED around: its legs swap places, so the wires on them now meet the other leg
    p.flip = !p.flip;
    S.bench.wires.forEach(function (w) { [w.a, w.b].forEach(function (x) { if (x.p === p.id) x.k = x.k === 'an' ? 'ca' : 'an'; }); });
    changed('LED turned around. Its + leg is now on the ' + (p.flip ? 'right' : 'left') + '.');
  }
  function sounderOn() { return S.bench.parts.some(function (p) { var q = S.sol.parts[p.id]; return (p.t === 'coil' || p.t === 'buzzer') && q && q.on; }); }
  function coilOn() { return S.bench.parts.some(function (p) { var q = S.sol.parts[p.id]; return p.t === 'coil' && q && q.on; }); }
  function keyDown(p, t) {
    if (p.down) return;
    var was = coilOn();
    p.down = true; p._t = t !== undefined ? t : performance.now();
    S.sol = M.solve(S.bench); p._snd = sounderOn(); renderSel(); status(); dirty();
    if (!was && coilOn()) click(true);
  }
  function keyUp(p, t) {
    if (!p.down) return;
    var was = coilOn();
    p.down = false;
    var now = t !== undefined ? t : performance.now();
    if (p._snd && S.chal === 'telegraph') { S.morse.push({ down: p._t, up: now }); if (S.morse.length > 60) S.morse.shift(); }
    S.sol = M.solve(S.bench); check(); renderSel(); status(); dirty();
    if (was && !coilOn()) click(false);
  }

  // ---------- sound (only after a tap or key press; can be muted) ----------
  var AC = null, buzzOsc = null, buzzGain = null;
  function audio() {
    if (!S.sound) return null;
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) { } }
    return AC;
  }
  function click(down) {
    var a = AC && S.sound ? AC : null; if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = 'square'; o.frequency.value = down ? 180 : 120; g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.06);
  }
  function buzz(on) {
    var a = AC && S.sound ? AC : null;
    if (on && a && !buzzOsc) {
      buzzOsc = a.createOscillator(); buzzGain = a.createGain(); buzzOsc.type = 'square'; buzzOsc.frequency.value = 420; buzzGain.gain.value = 0.03;
      buzzOsc.connect(buzzGain); buzzGain.connect(a.destination); buzzOsc.start();
    } else if ((!on || !a) && buzzOsc) { try { buzzOsc.stop(); } catch (e) { } buzzOsc = null; }
  }
  D.addEventListener('pointerdown', function () { if (S.sound) audio(); }, { once: true, capture: true });
  D.addEventListener('keydown', function () { if (S.sound) audio(); }, { once: true, capture: true });
  var sndBtn = $('cb-sound');
  function sndUI() { sndBtn.setAttribute('aria-pressed', S.sound ? 'true' : 'false'); sndBtn.setAttribute('aria-label', S.sound ? 'Sound on' : 'Sound off'); sndBtn.title = S.sound ? 'Sound on' : 'Sound off'; }
  sndBtn.addEventListener('click', function () { S.sound = !S.sound; store.set('sound', S.sound); if (S.sound) audio(); else buzz(false); sndUI(); });
  sndUI();

  // ---------- drawing ----------
  var COL = { board: '#0b1b27', slot: 'rgba(120,170,200,.10)', slotOk: 'rgba(99,230,190,.55)', ink: '#dbe7ef', muted: '#8fb3c6', gold: '#ffd479', brass: '#d4a843', red: '#ff6b6b', green: '#63e6be' };
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function text(t, x, y, size, color, align, weight) { if (S.icon) return; ctx.font = (weight || 600) + ' ' + size + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; ctx.fillStyle = color; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); }
  function draw() {
    var s = sol(), dpr = cvs.dpr;
    ctx.setTransform(dpr * L.s, 0, 0, dpr * L.s, 0, 0);
    ctx.fillStyle = COL.board; ctx.fillRect(0, 0, L.WW, L.WH);
    var d = S.drag, used = usedSlots(d && d.kind === 'part' ? d.id : null), i;
    // the spots: during a part drag, the free ones glow (the allowed states)
    for (i = 0; i < NSLOT; i++) {
      var c = slotC(i), free = !used[i], allowed = d && (d.kind === 'part' || d.kind === 'new') && free;
      ctx.setLineDash(allowed ? [6, 5] : []); ctx.lineWidth = allowed ? 2 : 1;
      ctx.strokeStyle = allowed ? COL.slotOk : COL.slot;
      rr(c.x - L.SW / 2 + 6, c.y - SH / 2 + 6, L.SW - 12, SH - 12, 12); ctx.stroke();
    }
    ctx.setLineDash([]);
    // the bin
    var br = binR(), binHot = d && d.st && d.st.bin;
    ctx.fillStyle = binHot ? 'rgba(255,107,107,.25)' : 'rgba(120,170,200,.08)'; rr(br.x, br.y, br.w, br.h, 10); ctx.fill();
    ctx.strokeStyle = binHot ? COL.red : 'rgba(120,170,200,.3)'; ctx.lineWidth = 1.5; ctx.stroke();
    text('🗑 Remove', br.x + br.w / 2, br.y + br.h / 2, 14, binHot ? '#fff' : COL.muted);
    // parts
    S.bench.parts.forEach(function (p) { drawPart(p, centerOf(p), s.parts[p.id] || {}); });
    if (d && d.kind === 'new' && d.st) drawPart(d.part, slotC(d.st.slot), {}, true);
    // wires
    S.bench.wires.forEach(function (w, k) { drawWire(w, k, s); });
    if (d && d.kind === 'wire' && d.to && !M.sameT(d.to, d.from)) drawTempWire(termPt(d.from), termPt(d.to));
    if (d && d.kind === 'wend' && d.st && !d.st.bin) drawTempWire(termPt(d.fixed), termPt(d.st));
    // terminals on top
    S.bench.parts.forEach(function (p) { M.TYPES[p.t].terms.forEach(function (k) { drawTerm({ p: p.id, k: k }); }); });
    // gaps (only when nothing is being dragged)
    if (!d && !s.short.length) s.gaps.forEach(function (g) {
      var p = M.part(S.bench, g.p); if (!p) return;
      var pulse = 0.55 + 0.45 * Math.sin(S.t * 5);
      ctx.strokeStyle = 'rgba(255,107,107,' + pulse + ')'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 4]);
      if (g.k) { var tp = termPt(g); ctx.beginPath(); ctx.arc(tp.x, tp.y, 13, 0, 7); ctx.stroke(); }
      else { var c = centerOf(p); rr(c.x - 46, c.y - 36, 92, 56, 10); ctx.stroke(); text(g.why === 'backward' ? 'backward' : g.why === 'throw' ? 'no wire there' : 'open', c.x, c.y + 36, 12, COL.red); }
      ctx.setLineDash([]);
    });
    // wire candidates while dragging a wire end
    if (d && (d.kind === 'wire' || d.kind === 'wend')) d.cands.forEach(function (x) {
      var tp = termPt(x.t), col = x.short ? COL.red : x.complete ? COL.green : 'rgba(219,231,239,.6)';
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(tp.x, tp.y, 12, 0, 7); ctx.stroke();
    });
    // selection and keyboard focus
    if (S.sel && S.sel.kind === 'part') { var sp = M.part(S.bench, S.sel.id); if (sp) { var sc = centerOf(sp); ctx.strokeStyle = COL.gold; ctx.lineWidth = 2; rr(sc.x - L.SW / 2 + 8, sc.y - SH / 2 + 8, L.SW - 16, SH - 16, 10); ctx.stroke(); } }
    if (S.focus && S.kbd && D.activeElement === cv) {
      var fp = itemAt(S.focus); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(fp.x, fp.y, S.focus.kind === 'part' ? 40 : 16, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  function drawTempWire(a, b) {
    var P = wirePts(a, b); ctx.strokeStyle = 'rgba(255,212,121,.85)'; ctx.lineWidth = 4; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(P[0].x, P[0].y); ctx.bezierCurveTo(P[1].x, P[1].y, P[2].x, P[2].y, P[3].x, P[3].y); ctx.stroke(); ctx.setLineDash([]);
  }
  function drawWire(w, k, s) {
    if (S.drag && S.drag.kind === 'wend' && S.drag.id === w.id) return;
    var a = termPt(w.a), b = termPt(w.b), P = wirePts(a, b), I = s.wires[w.id] || 0, on = Math.abs(I) > 1e-3, sh = s.shortWires.indexOf(w.id) >= 0;
    function path() { ctx.beginPath(); ctx.moveTo(P[0].x, P[0].y); ctx.bezierCurveTo(P[1].x, P[1].y, P[2].x, P[2].y, P[3].x, P[3].y); }
    if (on || sh) { path(); ctx.strokeStyle = sh ? 'rgba(255,80,80,' + (0.35 + 0.25 * Math.sin(S.t * 8)) + ')' : 'rgba(255,212,121,.28)'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.stroke(); }
    path(); ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    path(); ctx.strokeStyle = sh ? COL.red : WIRE_COLORS[k % WIRE_COLORS.length]; ctx.lineWidth = 4; ctx.stroke();
    if (S.sel && S.sel.kind === 'wire' && S.sel.id === w.id) { path(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]); [a, b].forEach(function (q) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q.x, q.y, 10, 0, 7); ctx.fill(); }); }
    if (on && !LAB.reduced) {
      // moving dots for the current (conventional direction); speed grows with the current, but slowly
      var sp = 0.15 + Math.min(1, Math.log10(1 + Math.abs(I) * 1000) / 3) * 0.6, ph = (S.t * sp * (I > 0 ? 1 : -1)) % 1, n = 6;
      ctx.fillStyle = sh ? '#fff' : COL.gold;
      for (var j = 0; j < n; j++) { var t = ((j / n + ph) % 1 + 1) % 1, q = bez(P, t); ctx.beginPath(); ctx.arc(q.x, q.y, 2.6, 0, 7); ctx.fill(); }
    }
  }
  function drawTerm(x) {
    var p = M.part(S.bench, x.p), tp = termPt(x);
    ctx.fillStyle = COL.brass; ctx.beginPath(); ctx.arc(tp.x, tp.y, 7, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7a5c18'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = '#7a5c18'; ctx.beginPath(); ctx.moveTo(tp.x - 4, tp.y); ctx.lineTo(tp.x + 4, tp.y); ctx.stroke();
    var lab = { battery: { pos: '+', neg: '−' }, led: { an: '+', ca: '−' }, voltmeter: { pos: '+', neg: '−' }, ammeter: { pos: '+', neg: '−' } }[p.t];
    if (lab) text(lab[x.k], tp.x, tp.y + 16, 14, x.k === 'pos' || x.k === 'an' ? '#ff8787' : '#9fb4c3', 'center', 800);
  }
  function drawPart(p, c, q, ghost) {
    var x = c.x, y = c.y;
    ctx.save(); if (ghost) ctx.globalAlpha = 0.6;
    // legs from the body to the terminals
    ctx.strokeStyle = '#9aa7b0'; ctx.lineWidth = 2.5;
    M.TYPES[p.t].terms.forEach(function (k) { var o = termOff(p, k); ctx.beginPath(); ctx.moveTo(x + o.x, y + o.y); ctx.lineTo(x + o.x * 0.62, y + Math.min(o.y, 12)); ctx.stroke(); });
    switch (p.t) {
      case 'battery': {
        ctx.fillStyle = '#2b2f33'; rr(x - 44, y - 22, 88, 36, 6); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke();
        var cw = 80 / 4;
        for (var i = 0; i < 4; i++) {
          var cx = x - 40 + i * cw;
          if (i < p.n) { ctx.fillStyle = '#c9a227'; ctx.fillRect(cx + 1, y - 17, cw - 2, 26); ctx.fillStyle = '#1d1d1d'; ctx.fillRect(cx + 1, y - 17, (cw - 2) * 0.62, 26); ctx.fillStyle = '#bbb'; ctx.fillRect(cx + cw - 2, y - 9, 2, 10); }
          else { ctx.strokeStyle = '#444'; ctx.strokeRect(cx + 1.5, y - 16.5, cw - 3, 25); }
        }
        if (q.on && !sol().short.length) { ctx.strokeStyle = 'rgba(255,212,121,.6)'; ctx.lineWidth = 2; rr(x - 46, y - 24, 92, 40, 7); ctx.stroke(); }
        if (sol().short.indexOf(p.id) >= 0) { ctx.strokeStyle = 'rgba(255,80,80,' + (0.5 + 0.5 * Math.sin(S.t * 8)) + ')'; ctx.lineWidth = 3; rr(x - 47, y - 25, 94, 42, 8); ctx.stroke(); }
        text((1.5 * p.n).toFixed(1) + ' V', x, y - 34, 13, COL.ink);
        break;
      }
      case 'lamp': {
        var br = Math.min(1.6, q.bright || 0), lit = q.lit;
        if (lit) { var gr = ctx.createRadialGradient(x, y - 10, 2, x, y - 10, 20 + 30 * Math.min(1, br)); gr.addColorStop(0, 'rgba(255,236,160,' + Math.min(0.95, 0.3 + br * 0.6) + ')'); gr.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y - 10, 52, 0, 7); ctx.fill(); }
        ctx.fillStyle = lit ? 'rgba(255,240,190,' + (0.35 + 0.5 * Math.min(1, br)) + ')' : 'rgba(200,225,240,.18)'; ctx.strokeStyle = 'rgba(220,235,245,.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y - 12, 17, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9aa7b0'; ctx.fillRect(x - 9, y + 4, 18, 12); ctx.strokeStyle = '#6c7a84'; for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x - 9, y + 7 + k * 3.5); ctx.lineTo(x + 9, y + 7 + k * 3.5); ctx.stroke(); }
        ctx.strokeStyle = lit ? '#fff3b0' : '#6c7a84'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 5, y + 4); ctx.lineTo(x - 5, y - 12);
        for (k = 0; k < 4; k++) ctx.lineTo(x - 5 + (k + 0.5) * 2.5, y - 12 + (k % 2 ? 3 : -3));
        ctx.lineTo(x + 5, y - 12); ctx.lineTo(x + 5, y + 4); ctx.stroke();
        break;
      }
      case 'switch': case 'key': {
        var closed = p.t === 'key' ? !!p.down : !!p.on;
        ctx.fillStyle = p.t === 'key' ? '#5b3a1e' : '#2b2f33'; rr(x - 40, y + 2, 80, 12, 4); ctx.fill();
        ctx.fillStyle = '#c0c8cf'; ctx.beginPath(); ctx.arc(x - 26, y + 2, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x + 26, y + 2, 5, 0, 7); ctx.fill();
        ctx.strokeStyle = closed ? COL.gold : '#c0c8cf'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        var ang = closed ? 0 : -0.5;
        ctx.beginPath(); ctx.moveTo(x - 26, y + 2); ctx.lineTo(x - 26 + 56 * Math.cos(ang), y + 2 + 56 * Math.sin(ang)); ctx.stroke();
        if (p.t === 'key') { ctx.fillStyle = '#1d1d1d'; ctx.beginPath(); ctx.arc(x - 26 + 60 * Math.cos(ang), y - 4 + 60 * Math.sin(ang), 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke(); }
        text(closed ? 'on' : 'off', x, y - 34, 12, closed ? COL.gold : COL.muted);
        break;
      }
      case 'twoway': {
        ctx.fillStyle = '#2b2f33'; rr(x - 40, y - 6, 80, 54, 6); ctx.fill();
        ctx.fillStyle = '#c0c8cf'; [[x - 26, y + 24], [x + 26, y + 6], [x + 26, y + 42]].forEach(function (d) { ctx.beginPath(); ctx.arc(d[0], d[1], 4.5, 0, 7); ctx.fill(); });
        ctx.strokeStyle = COL.gold; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 26, y + 24); ctx.lineTo(x + 24, p.pos === 'a' ? y + 7 : y + 41); ctx.stroke();
        text(p.pos === 'a' ? 'up' : 'down', x, y - 18, 12, COL.muted);
        break;
      }
      case 'led': {
        var on = q.lit, f = p.flip ? -1 : 1;
        if (on) { var g2 = ctx.createRadialGradient(x, y - 10, 2, x, y - 10, 40); g2.addColorStop(0, 'rgba(255,70,70,' + Math.min(0.9, 0.3 + (q.i || 0) * 30) + ')'); g2.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x, y - 10, 42, 0, 7); ctx.fill(); }
        ctx.fillStyle = on ? '#ff5a5a' : '#8a2a2a'; ctx.beginPath(); ctx.arc(x, y - 12, 12, Math.PI, 0); ctx.lineTo(x + 12, y + 2); ctx.lineTo(x - 12, y + 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = on ? '#ff8a8a' : '#a33'; ctx.fillRect(x - 15, y + 2, 30, 4);
        ctx.strokeStyle = '#9aa7b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 5 * f, y + 6); ctx.lineTo(x - 5 * f, y + 18); ctx.moveTo(x + 5 * f, y + 6); ctx.lineTo(x + 5 * f, y + 12); ctx.stroke();
        if (q.over) text('too much current!', x, y - 34, 12, COL.red);
        else text(on ? Math.round(q.i * 1000) + ' mA' : 'LED', x, y - 34, 12, on ? '#ffb3b3' : COL.muted);
        break;
      }
      case 'resistor': {
        ctx.fillStyle = '#d9c39a'; rr(x - 28, y - 9, 56, 18, 8); ctx.fill();
        var bands = { 47: ['#ffd43b', '#ae3ec9', '#000'], 68: ['#1c7ed6', '#868e96', '#000'], 100: ['#8b5a2b', '#000', '#8b5a2b'], 120: ['#8b5a2b', '#e03131', '#8b5a2b'], 150: ['#8b5a2b', '#2f9e44', '#8b5a2b'], 220: ['#e03131', '#e03131', '#8b5a2b'], 330: ['#f76707', '#f76707', '#8b5a2b'], 470: ['#ffd43b', '#ae3ec9', '#8b5a2b'], 1000: ['#8b5a2b', '#000', '#e03131'] }[p.r] || [];
        bands.forEach(function (col, j) { ctx.fillStyle = col; ctx.fillRect(x - 18 + j * 9, y - 9, 4, 18); });
        ctx.fillStyle = '#c9a227'; ctx.fillRect(x + 16, y - 9, 4, 18);
        text(p.r >= 1000 ? p.r / 1000 + ' kΩ' : p.r + ' Ω', x, y - 26, 13, COL.ink);
        break;
      }
      case 'buzzer': {
        ctx.fillStyle = '#1d1d1d'; ctx.beginPath(); ctx.arc(x, y - 6, 18, 0, 7); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(x, y - 6, 4, 0, 7); ctx.fill();
        if (q.on) { ctx.strokeStyle = COL.gold; ctx.lineWidth = 2; for (var r = 0; r < 3; r++) { var rad = 24 + r * 7 + (S.t * 30 % 7); ctx.globalAlpha = (ghost ? 0.6 : 1) * (1 - r / 3); ctx.beginPath(); ctx.arc(x, y - 6, rad, -0.6, 0.6); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - 6, rad, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke(); } ctx.globalAlpha = ghost ? 0.6 : 1; }
        text(q.on ? 'bzzz' : 'buzzer', x, y - 36, 12, q.on ? COL.gold : COL.muted);
        break;
      }
      case 'coil': {
        var pull = q.on;
        ctx.fillStyle = '#6c757d'; ctx.fillRect(x - 34, y - 2, 68, 10);
        ctx.fillStyle = '#b87333';
        for (var t = 0; t < 12; t++) { ctx.beginPath(); ctx.ellipse(x - 26 + t * 4.7, y + 3, 2.6, 9, 0, 0, 7); ctx.fill(); }
        // the iron bar (armature) above: pulled down with a click when the magnet is on
        ctx.fillStyle = '#adb5bd'; ctx.fillRect(x - 30, pull ? y - 12 : y - 24, 60, 6);
        if (pull && !LAB.reduced) { ctx.strokeStyle = 'rgba(116,192,252,.6)'; ctx.lineWidth = 1.5; [16, 24].forEach(function (rw) { ctx.beginPath(); ctx.ellipse(x, y + 3, 34 + rw * 0.3, rw, 0, 0, 7); ctx.stroke(); }); }
        text(pull ? Math.round(q.at) + ' A-turns' : 'magnet off', x, y - 38, 12, pull ? '#a5d8ff' : COL.muted);
        break;
      }
      case 'motor': {
        var a0 = S.motorA[p.id] || 0;
        ctx.fillStyle = '#868e96'; rr(x - 22, y - 16, 34, 30, 6); ctx.fill(); ctx.fillStyle = '#495057'; ctx.fillRect(x + 12, y - 10, 6, 18);
        ctx.strokeStyle = '#ced4da'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 18, y - 1); ctx.lineTo(x + 26, y - 1); ctx.stroke();
        ctx.save(); ctx.translate(x + 28, y - 1); ctx.rotate(a0); ctx.fillStyle = '#4dabf7';
        for (var bl = 0; bl < 3; bl++) { ctx.rotate(2.094); ctx.beginPath(); ctx.ellipse(0, -9, 3.5, 9, 0, 0, 7); ctx.fill(); }
        ctx.restore();
        text(q.spin ? (q.spin > 0 ? '↻ spinning' : '↺ spinning') : 'motor', x, y - 34, 12, q.spin ? COL.gold : COL.muted);
        break;
      }
      case 'voltmeter': case 'ammeter': {
        var isV = p.t === 'voltmeter', val = q.read || 0;
        ctx.fillStyle = isV ? '#1864ab' : '#a61e4d'; rr(x - 36, y - 26, 72, 42, 8); ctx.fill();
        ctx.fillStyle = '#c3fae8'; rr(x - 30, y - 20, 60, 20, 3); ctx.fill();
        var s2 = isV ? LAB.fmt(val, Math.abs(val) >= 10 ? 1 : 2) + ' V' : (Math.abs(val) < 1 ? LAB.fmt(val * 1000, Math.abs(val) < 0.1 ? 1 : 0) + ' mA' : LAB.fmt(val, 2) + ' A');
        text(s2, x, y - 10, 12, '#0b3d2e', 'center', 700);
        text(isV ? 'V' : 'A', x, y + 8, 12, '#fff', 'center', 800);
        break;
      }
    }
    if (S.nums && !ghost && q && q.v !== undefined && ['voltmeter', 'ammeter'].indexOf(p.t) < 0) {
      text(fmtV(q.v) + ' · ' + fmtI(q.i), x, y + 56, 11, '#a5d8ff');
    }
    ctx.restore();
  }

  // ---------- pointer: parts, wires and terminals ----------
  function hitTerm(pt, slop) {
    var best = null, bd = 12 + slop;
    M.terminals(S.bench).forEach(function (x) { var tp = termPt(x), d = Math.hypot(tp.x - pt.x, tp.y - pt.y); if (d < bd) { bd = d; best = x; } });
    return best;
  }
  function hitPart(pt) {
    for (var i = S.bench.parts.length - 1; i >= 0; i--) { var p = S.bench.parts[i], c = centerOf(p); if (Math.abs(pt.x - c.x) < 46 && pt.y > c.y - 44 && pt.y < c.y + 22) return p; }
    return null;
  }
  function hitWire(pt) {
    var best = null, bd = 9;
    S.bench.wires.forEach(function (w) { var P = wirePts(termPt(w.a), termPt(w.b)); for (var t = 0; t <= 1; t += 0.04) { var q = bez(P, t), d = Math.hypot(q.x - pt.x, q.y - pt.y); if (d < bd) { bd = d; best = w; } } });
    return best;
  }
  function partSession(p, grab) {
    var states = freeSlots(p.id).map(function (i) { return { slot: i }; }); states.push({ bin: true });
    var own = null; states.forEach(function (st) { if (st.slot === p.slot) own = st; });
    var g0 = grab || centerOf(p), moved = false;
    S.drag = { kind: 'part', id: p.id, st: own };
    return {
      states: states, start: own, grab: g0,
      at: function (st) { return st.bin ? binC() : slotC(st.slot); },
      move: function (st, q) { if (q && Math.hypot(q.x - g0.x, q.y - g0.y) > 6) moved = true; S.drag.st = st; S.drag.moved = moved; dirty(); },
      end: function (st, viaKeys) {
        S.drag = null;
        if (!moved && !viaKeys && st === own) { tapPart(p); return; }
        if (st.bin) { M.removePart(S.bench, p.id); if (S.sel && S.sel.id === p.id) S.sel = null; S.focus = null; changed(NAMES[p.t] + ' removed.'); return; }
        p.slot = st.slot; S.sel = { kind: 'part', id: p.id }; changed(NAMES[p.t] + ' moved.');
      },
      cancel: function () { S.drag = null; dirty(); }
    };
  }
  function tapPart(p) {
    S.sel = { kind: 'part', id: p.id };
    if (p.t === 'switch' || p.t === 'twoway') { toggle(p); return; }
    renderSel(); dirty();
    say(NAMES[p.t] + ' selected.');
  }
  function candList(from, ignoreWire) {
    var b = S.bench;
    if (ignoreWire) { b = M.clone(S.bench); M.removeWire(b, ignoreWire); }
    return M.terminals(b).filter(function (x) { return M.wireOK(b, from, x); }).map(function (x) { var r = M.tryWire(b, from, x); return { t: x, short: r && r.short, complete: r && r.complete && !r.short, sol: r && r.sol }; });
  }
  function wireSession(from) {
    var cands = candList(from), states = [{ t: from, self: true }].concat(cands);
    S.drag = { kind: 'wire', from: from, to: from, cands: cands };
    return {
      states: states, start: states[0], grab: termPt(from),
      at: function (st) { return termPt(st.t); },
      bonus: function (st) { return st.complete ? 10 : 0; },
      move: function (st) { S.drag.to = st.t; S.view = st.self ? null : st.sol; dirty(); },
      end: function (st) {
        S.drag = null; S.view = null;
        if (st.self) { dirty(); return; }
        var w = M.addWire(S.bench, from, st.t);
        changed(w ? 'Wire from the ' + tName(from) + ' to the ' + tName(st.t) + '.' + (st.short ? ' That is a short circuit!' : '') : '');
      },
      cancel: function () { S.drag = null; S.view = null; dirty(); }
    };
  }
  function wireEndSession(w, endKey) {
    var fixed = endKey === 'a' ? w.b : w.a, moving = endKey === 'a' ? w.a : w.b;
    var cands = candList(fixed, w.id), states = [{ t: moving, self: true }].concat(cands); states.push({ bin: true });
    S.drag = { kind: 'wend', id: w.id, fixed: fixed, st: states[0], cands: cands };
    return {
      states: states, start: states[0], grab: termPt(moving),
      at: function (st) { return st.bin ? binC() : termPt(st.t); },
      move: function (st) { S.drag.st = st.bin ? { bin: true } : { p: st.t.p, k: st.t.k, bin: false }; S.view = st.bin ? null : st.sol || null; if (st.bin) { var b2 = M.clone(S.bench); M.removeWire(b2, w.id); S.view = M.solve(b2); } dirty(); },
      end: function (st) {
        S.drag = null; S.view = null;
        if (st.self) { dirty(); return; }
        if (st.bin) { M.removeWire(S.bench, w.id); S.sel = null; changed('Wire removed.'); return; }
        var x = endKey === 'a' ? w.a : w.b; x.p = st.t.p; x.k = st.t.k; changed('Wire moved to the ' + tName(st.t) + '.');
      },
      cancel: function () { S.drag = null; S.view = null; dirty(); }
    };
  }
  RD.attach(cv, {
    point: toWorld,
    begin: function (pt, e) {
      cv.focus({ preventScroll: true });
      var slop = e.pointerType === 'touch' ? 10 : 4;
      // the ends of the selected wire
      if (S.sel && S.sel.kind === 'wire') {
        var w = null; S.bench.wires.forEach(function (x) { if (x.id === S.sel.id) w = x; });
        if (w) { var ea = termPt(w.a), eb = termPt(w.b); if (Math.hypot(ea.x - pt.x, ea.y - pt.y) < 12 + slop) return wireEndSession(w, 'a'); if (Math.hypot(eb.x - pt.x, eb.y - pt.y) < 12 + slop) return wireEndSession(w, 'b'); }
      }
      var t = hitTerm(pt, slop);
      if (t) { S.sel = null; renderSel(); return wireSession(t); }
      var p = hitPart(pt);
      if (p && p.t === 'key' && pt.y < centerOf(p).y - 2) {
        S.sel = { kind: 'part', id: p.id }; keyDown(p);
        return { states: [0], at: function () { return pt; }, move: function () { }, end: function () { keyUp(p); }, cancel: function () { keyUp(p); } };
      }
      if (p) return partSession(p, centerOf(p));
      var wh = hitWire(pt);
      if (wh) { S.sel = { kind: 'wire', id: wh.id }; renderSel(); dirty(); say('Wire selected. Drag an end to move it, or onto the bin to remove it.'); return null; }
      if (S.sel) { S.sel = null; renderSel(); dirty(); }
      return null;
    }
  });

  // ---------- keyboard: RuleDrag.keys (arrows move the focus or the held thing, Enter picks up and drops) ----------
  function items() {
    var out = [];
    S.bench.parts.forEach(function (p) { out.push({ kind: 'part', id: p.id }); M.TYPES[p.t].terms.forEach(function (k) { out.push({ kind: 'term', p: p.id, k: k }); }); });
    S.bench.wires.forEach(function (w) { out.push({ kind: 'wire', id: w.id }); });
    return out;
  }
  function itemAt(it) {
    if (it.kind === 'part') { var p = M.part(S.bench, it.id); return p ? centerOf(p) : { x: 0, y: 0 }; }
    if (it.kind === 'term') return termPt(it);
    var w = null; S.bench.wires.forEach(function (x) { if (x.id === it.id) w = x; }); return w ? wireMid(w) : { x: 0, y: 0 };
  }
  function sameItem(a, b) { return a && b && a.kind === b.kind && (a.kind === 'term' ? a.p === b.p && a.k === b.k : a.id === b.id); }
  function describe(it) {
    if (it.kind === 'part') { var p = M.part(S.bench, it.id); return p ? NAMES[p.t] + '. Enter picks it up to move it; Space ' + (p.t === 'key' ? 'presses it' : p.t === 'switch' || p.t === 'twoway' ? 'flips it' : 'selects it') + '; Delete removes it.' : ''; }
    if (it.kind === 'term') return 'Terminal: ' + tName(it) + ', ' + M.wiresAt(S.bench, it).length + ' wire(s). Enter starts a wire from here.';
    var w = null; S.bench.wires.forEach(function (x) { if (x.id === it.id) w = x; });
    return w ? 'Wire from the ' + tName(w.a) + ' to the ' + tName(w.b) + '. Enter picks up its second end; Delete removes it.' : '';
  }
  var KB = RD.keys(cv, {
    items: items, itemAt: itemAt, same: sameItem, pickKeys: ['Enter'],
    focus: function (it) { S.focus = it; if (it.kind !== 'term') S.sel = { kind: it.kind, id: it.id }; renderSel(); dirty(); say(describe(it)); },
    blocked: function () { say('Nothing further that way.'); },
    pick: function (it) {
      var ses = null;
      if (it.kind === 'part') { var p = M.part(S.bench, it.id); if (!p) return null; ses = partSession(p); say('Holding the ' + NAMES[p.t].toLowerCase() + '. Arrow keys move it between free spots and the bin; Enter drops it; Escape puts it back.'); }
      else if (it.kind === 'term') { ses = wireSession(it); say('New wire from the ' + tName(it) + '. Arrow keys move its far end between terminals; green ones complete a circuit, red ones would short the battery. Enter connects it.'); }
      else { var w = null; S.bench.wires.forEach(function (x) { if (x.id === it.id) w = x; }); if (!w) return null; ses = wireEndSession(w, 'b'); say('Holding the wire’s end at the ' + tName(w.b) + '. Arrow keys move it; the bin removes the wire.'); }
      var end = ses.end, mv = ses.move;
      ses.end = function (st) { end(st, true); var f = S.focus; if (f && f.kind === 'part' && !M.part(S.bench, f.id)) S.focus = null; dirty(); };
      ses.move = function (st, q) { mv(st, null); if (st.bin) say('The bin: Enter removes it.'); else if (st.t) say(st.self ? 'Back where it started.' : 'To the ' + tName(st.t) + (st.short ? ': short circuit!' : st.complete ? ': completes a circuit.' : '.')); else if (st.slot !== undefined) say('Spot ' + (st.slot + 1) + '.'); };
      return ses;
    },
    key: function (e, it) {
      var k = e.key, p = it && it.kind === 'part' ? M.part(S.bench, it.id) : null;
      if (k === ' ' && p) { e.preventDefault(); if (p.t === 'key') { if (!e.repeat) keyDown(p); } else if (p.t === 'switch' || p.t === 'twoway') toggle(p); else { S.sel = { kind: 'part', id: p.id }; renderSel(); dirty(); } return true; }
      if ((k === 'Delete' || k === 'Backspace') && it) {
        e.preventDefault();
        if (p) { M.removePart(S.bench, p.id); S.sel = null; S.focus = null; changed(NAMES[p.t] + ' removed.'); }
        else if (it.kind === 'wire') { M.removeWire(S.bench, it.id); S.sel = null; S.focus = null; changed('Wire removed.'); }
        return true;
      }
      if (p && (k === '+' || k === '=' || k === '-' || k === '_')) {
        var up = k === '+' || k === '=';
        if (p.t === 'battery') { p.n = Math.max(1, Math.min(4, p.n + (up ? 1 : -1))); changed('Battery: ' + p.n + ' cells.'); }
        else if (p.t === 'resistor') { var i = M.RES.indexOf(p.r) + (up ? 1 : -1); p.r = M.RES[Math.max(0, Math.min(M.RES.length - 1, i))]; changed('Resistor: ' + p.r + ' ohms.'); }
        e.preventDefault(); return true;
      }
      if (p && (k === 'f' || k === 'F') && p.t === 'led') { flipLed(p); return true; }
      if (k === 'n' || k === 'N') { $('cb-nums').click(); return true; }
      return false;
    }
  });
  cv.addEventListener('keydown', function () { S.kbd = true; }, true);
  cv.addEventListener('pointerdown', function () { S.kbd = false; }, true);
  cv.addEventListener('keyup', function (e) { if (e.key === ' ') S.bench.parts.forEach(function (p) { if (p.t === 'key' && p.down) keyUp(p); }); });
  cv.addEventListener('focus', function () { try { S.kbd = cv.matches(':focus-visible'); } catch (e) { } if (!S.focus && S.bench.parts.length) KB.setFocus({ kind: 'part', id: S.bench.parts[0].id }); dirty(); });
  cv.addEventListener('blur', dirty);

  // ---------- the parts tray ----------
  var TRAY = ['battery', 'lamp', 'switch', 'twoway', 'key', 'led', 'resistor', 'buzzer', 'coil', 'motor', 'voltmeter', 'ammeter'];
  var SHORT = { battery: 'Battery', lamp: 'Bulb', switch: 'Switch', twoway: '2-way', key: 'Key', led: 'LED', resistor: 'Resistor', buzzer: 'Buzzer', coil: 'Magnet', motor: 'Motor', voltmeter: 'Voltmeter', ammeter: 'Ammeter' };
  var tray = $('cb-tray');
  TRAY.forEach(function (t) {
    var b = D.createElement('button'); b.type = 'button'; b.className = 'cb-tb'; b.setAttribute('aria-label', 'Add a ' + NAMES[t].toLowerCase());
    b.innerHTML = '<canvas aria-hidden="true" width="88" height="56"></canvas><span>' + SHORT[t] + '</span>';
    tray.appendChild(b);
    wireTrayButton(b, t);
  });
  function trayIcons() {
    Array.prototype.forEach.call(tray.querySelectorAll('canvas'), function (c, i) {
      var t = TRAY[i], g = c.getContext('2d'), save = ctx, p = M.addPart(M.newBench(), t, 0, null, 'icon');
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 88, 56); g.setTransform(0.7, 0, 0, 0.7, 44, 30);
      ctx = g; S.icon = true;
      try { drawPart(p, { x: 0, y: 0 }, {}); } catch (e) { }
      S.icon = false; ctx = save;
    });
  }
  function overCanvas(e) { var r = cv.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
  var lastEv = null;
  function wireTrayButton(btn, t) {
    var start = null, moved = false;
    btn.addEventListener('pointerdown', function (e) { lastEv = e; start = { x: e.clientX, y: e.clientY }; moved = false; }, true);
    btn.addEventListener('pointermove', function (e) { lastEv = e; if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) moved = true; }, true);
    RD.attach(btn, {
      point: toWorld,
      begin: function () {
        var free = freeSlots(null); if (!free.length) { LAB.toast(view, 'The bench is full. Remove a part first.'); return null; }
        var states = free.map(function (i) { return { slot: i }; }), p = { id: 'new', t: t, slot: -1 };
        var dd = M.newBench(); p = M.addPart(dd, t, -1, null, 'new');
        S.drag = { kind: 'new', part: p, st: null };
        return {
          states: states, at: function (st) { return slotC(st.slot); },
          move: function (st) { S.drag.st = moved && lastEv && overCanvas(lastEv) ? st : null; dirty(); },
          end: function (st) {
            var over = moved && lastEv && overCanvas(lastEv); S.drag = null;
            if (!moved) { addPart(t); return; }
            if (over) addPart(t, st.slot); else dirty();
          },
          cancel: function () { S.drag = null; dirty(); }
        };
      }
    });
    btn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (addPart(t)) { cv.focus(); } } });
  }
  function addPart(t, slot) {
    var free = freeSlots(null);
    if (!free.length) { LAB.toast(view, 'The bench is full. Remove a part first.'); return null; }
    if (slot === undefined || free.indexOf(slot) < 0) slot = free[0];
    var p = M.addPart(S.bench, t, slot);
    S.sel = { kind: 'part', id: p.id }; S.focus = { kind: 'part', id: p.id };
    changed(NAMES[p.t] + ' added in spot ' + (slot + 1) + '. Drag from its brass terminals to wire it.');
    return p;
  }

  // ---------- challenges ----------
  var mis = LAB.missions($('cb-missions'), 'circuit-bench', M.CHALLENGES.map(function (c) { return { id: c.id, title: c.title, goal: c.short }; }), function (id) { load(id); });
  function load(id, bench) {
    var ch = id ? chalById(id) : null;
    S.chal = ch ? id : null; S.mem = {}; S.morse = []; S.sel = null; S.focus = null; S.drag = null;
    if (bench) S.bench = bench; else { S.bench = M.newBench(); if (ch) ch.setup(S.bench); }
    S.bench.nid = Math.max(S.bench.nid || 1, 100);
    S.bench.parts.forEach(function (p) { p.down = false; });
    $('cb-goal').classList.remove('done');
    $('cb-goal').innerHTML = ch ? '<b>' + ch.title + '.</b> ' + ch.goal : '<b>Free bench.</b> Build anything you like. Pick a challenge below for a goal.';
    if (mis.setCurrent) mis.setCurrent(ch ? id : null);
    changed(ch ? 'Challenge: ' + ch.title + '.' : 'Free bench.');
  }
  $('cb-free').addEventListener('click', function () { load(null); });
  $('cb-clear').addEventListener('click', function () { if (S.chal) load(S.chal); else load(null); say(S.chal ? 'Challenge reset.' : 'Bench cleared.'); });
  $('cb-nums').addEventListener('change', function (e) { S.nums = e.target.checked; store.set('nums', S.nums); dirty(); });
  S.nums = !!store.get('nums', false); $('cb-nums').checked = S.nums;
  function save() { try { store.set('state', { chal: S.chal, bench: { parts: S.bench.parts.map(function (p) { var o = {}; for (var k in p) if (k[0] !== '_' && k !== 'down') o[k] = p[k]; return o; }), wires: S.bench.wires, nid: S.bench.nid } }); } catch (e) { } }

  // ---------- animation ----------
  var isDirty = true;
  function dirty() { isDirty = true; }
  LAB.loop(function (dt) {
    S.t += dt;
    var s = sol(), anim = !!S.drag || s.short.length > 0 || s.gaps.length > 0 || s.complete;
    S.bench.parts.forEach(function (p) { if (p.t === 'motor') { var q = s.parts[p.id]; if (q && q.spin && !LAB.reduced) S.motorA[p.id] = (S.motorA[p.id] || 0) + dt * 14 * q.speed; } });
    buzz(S.bench.parts.some(function (p) { var q = S.sol.parts[p.id]; return p.t === 'buzzer' && q && q.on; }));
    if (anim || isDirty) { draw(); isDirty = false; }
  }, view);
  var lastW = 0;
  function relayout() { var w = view.parentNode.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; layout(); dirty(); } }
  window.addEventListener('resize', relayout);
  if ('ResizeObserver' in window) { try { new ResizeObserver(relayout).observe(view.parentNode); } catch (e) { } }

  // ---------- start ----------
  layout();
  var saved = store.get('state', null), ok = false;
  if (saved && saved.bench && Array.isArray(saved.bench.parts)) {
    try {
      var b0 = { parts: saved.bench.parts.filter(function (p) { return M.TYPES[p.t] && p.slot >= 0 && p.slot < NSLOT; }), wires: [], nid: saved.bench.nid || 100 };
      (saved.bench.wires || []).forEach(function (w) { if (w && w.a && w.b && M.wireOK(b0, w.a, w.b)) b0.wires.push({ id: w.id, a: { p: w.a.p, k: w.a.k }, b: { p: w.b.p, k: w.b.k } }); });
      load(saved.chal && chalById(saved.chal) ? saved.chal : null, b0); ok = true;
    } catch (e) { ok = false; }
  }
  if (!ok) load('bulb');
  trayIcons();

  // A small hook for the page's own tests (scripts/circuit-bench/verify-challenges.js): plays recorded solutions.
  window.CBBench = {
    state: function () { return S; }, load: load, done: function (id) { return mis.isDone(id); },
    act: function (a) {
      var b = S.bench, p;
      switch (a[0]) {
        case 'wire': M.addWire(b, { p: a[1], k: a[2] }, { p: a[3], k: a[4] }); changed(); break;
        case 'unwire': b.wires = b.wires.filter(function (w) { return !((w.a.p === a[1] && w.a.k === a[2]) || (w.b.p === a[1] && w.b.k === a[2])); }); changed(); break;
        case 'add': M.addPart(b, a[1], a[3] !== undefined ? a[3] : freeSlots(null)[0], null, a[2]); changed(); break;
        case 'remove': M.removePart(b, a[1]); changed(); break;
        case 'set': p = M.part(b, a[1]); p[a[2]] = a[3]; changed(); break;
        case 'toggle': toggle(M.part(b, a[1])); break;
        case 'flip': flipLed(M.part(b, a[1])); break;
        case 'tap': p = M.part(b, a[1]); keyDown(p, a[2]); keyUp(p, a[3]); break;
      }
    }
  };
})();
