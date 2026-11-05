/* Circuit Bench model (/science-lab/circuit-bench/), written for this site with no outside code. window.CBModel, or
   require() in Node for the tests in scripts/circuit-bench/.

   A bench is {parts: [...], wires: [...]}. A part is {id, t, slot, ...settings}; each type has named terminals.
   A wire joins two terminals: {id, a: {p, k}, b: {p, k}} (p = part id, k = terminal name).

   solve(bench) does nodal analysis: every terminal is a node, and every connection is a branch whose current from
   end a to end b is g · (Va − Vb − e). A wire, a closed switch and the ammeter are 0.1 mΩ; a resistor, bulb, coil,
   motor or buzzer has e = 0; a battery holder is its EMF e in series with its inside resistance; an LED that is on is
   e = 1.9 V with 5 Ω (about 2.0 V at 20 mA) and off it passes nothing. Kirchhoff's junction rule at every node gives
   G · V = I, solved by Gaussian elimination; the LEDs are switched on and off until the answer agrees with itself.
   A tiny leak (1 nS) from every node keeps loose parts from making the matrix singular. */
(function (g) {
  'use strict';
  var CELL_V = 1.5, CELL_R = 0.2, ZERO_R = 1e-4, GMIN = 1e-9, LED_V0 = 1.9, LED_RD = 5, LED_MAX = 0.03;
  var LAMP_R = 10, LAMP_W = 0.9, COIL_R = 3, COIL_TURNS = 100, MOTOR_R = 8, BUZZ_R = 150, VM_R = 1e7;
  var RES = [47, 68, 100, 120, 150, 220, 330, 470, 1000];
  var TYPES = {
    battery: { name: 'Battery holder', terms: ['neg', 'pos'], tl: { neg: '− end', pos: '+ end' } },
    lamp: { name: 'Bulb', terms: ['a', 'b'], tl: { a: 'left end', b: 'right end' } },
    switch: { name: 'Switch', terms: ['a', 'b'], tl: { a: 'left end', b: 'right end' } },
    key: { name: 'Telegraph key', terms: ['a', 'b'], tl: { a: 'left end', b: 'right end' } },
    twoway: { name: 'Two-way switch', terms: ['c', 'a', 'b'], tl: { c: 'middle (common)', a: 'upper', b: 'lower' } },
    led: { name: 'LED', terms: ['an', 'ca'], tl: { an: '+ leg (long)', ca: '− leg (short)' } },
    resistor: { name: 'Resistor', terms: ['a', 'b'], tl: { a: 'left end', b: 'right end' } },
    buzzer: { name: 'Buzzer', terms: ['a', 'b'], tl: { a: 'left end', b: 'right end' } },
    coil: { name: 'Electromagnet', terms: ['a', 'b'], tl: { a: 'left end', b: 'right end' } },
    motor: { name: 'Motor', terms: ['a', 'b'], tl: { a: 'left end', b: 'right end' } },
    voltmeter: { name: 'Voltmeter', terms: ['pos', 'neg'], tl: { pos: 'red (+) lead', neg: 'black (−) lead' } },
    ammeter: { name: 'Ammeter', terms: ['pos', 'neg'], tl: { pos: 'red (+) end', neg: 'black (−) end' } }
  };
  function defaults(t) {
    if (t === 'battery') return { n: 2 };
    if (t === 'switch') return { on: false };
    if (t === 'twoway') return { pos: 'a' };
    if (t === 'resistor') return { r: 220 };
    if (t === 'led') return { flip: false };
    return {};
  }

  // ---------- the bench ----------
  function newBench() { return { parts: [], wires: [], nid: 1 }; }
  function part(b, id) { for (var i = 0; i < b.parts.length; i++) if (b.parts[i].id === id) return b.parts[i]; return null; }
  function addPart(b, t, slot, props, id) {
    var p = { id: id || ('p' + (b.nid++)), t: t, slot: slot }, d = defaults(t), k;
    for (k in d) p[k] = d[k];
    if (props) for (k in props) p[k] = props[k];
    b.parts.push(p); return p;
  }
  function removePart(b, id) {
    b.parts = b.parts.filter(function (p) { return p.id !== id; });
    b.wires = b.wires.filter(function (w) { return w.a.p !== id && w.b.p !== id; });
  }
  function tkey(x) { return x.p + '.' + x.k; }
  function sameT(x, y) { return x.p === y.p && x.k === y.k; }
  function wireOK(b, x, y) {
    if (!part(b, x.p) || !part(b, y.p) || sameT(x, y)) return false;
    for (var i = 0; i < b.wires.length; i++) {
      var w = b.wires[i];
      if ((sameT(w.a, x) && sameT(w.b, y)) || (sameT(w.a, y) && sameT(w.b, x))) return false;
    }
    return true;
  }
  function addWire(b, x, y, id) {
    if (!wireOK(b, x, y)) return null;
    var w = { id: id || ('w' + (b.nid++)), a: { p: x.p, k: x.k }, b: { p: y.p, k: y.k } };
    b.wires.push(w); return w;
  }
  function removeWire(b, id) { b.wires = b.wires.filter(function (w) { return w.id !== id; }); }
  function terminals(b) {
    var out = [];
    b.parts.forEach(function (p) { TYPES[p.t].terms.forEach(function (k) { out.push({ p: p.id, k: k }); }); });
    return out;
  }
  function wiresAt(b, x) { return b.wires.filter(function (w) { return sameT(w.a, x) || sameT(w.b, x); }); }
  function clone(b) { return JSON.parse(JSON.stringify(b)); }

  // ---------- branches ----------
  // each: {a, b, g, e, part, kind}; kind 'zero' marks a no-resistance path (for finding short circuits)
  function branches(b) {
    var out = [];
    function br(p, ka, kb, R, e, kind) { out.push({ a: p.id + '.' + ka, b: p.id + '.' + kb, g: 1 / R, e: e || 0, part: p.id, kind: kind || '' }); }
    b.wires.forEach(function (w) { out.push({ a: tkey(w.a), b: tkey(w.b), g: 1 / ZERO_R, e: 0, wire: w.id, kind: 'zero' }); });
    b.parts.forEach(function (p) {
      switch (p.t) {
        case 'battery': br(p, 'pos', 'neg', CELL_R * p.n, CELL_V * p.n, 'bat'); break;
        case 'lamp': if (!p.broken) br(p, 'a', 'b', LAMP_R); break;
        case 'switch': if (p.on) br(p, 'a', 'b', ZERO_R, 0, 'zero'); break;
        case 'key': if (p.down) br(p, 'a', 'b', ZERO_R, 0, 'zero'); break;
        case 'twoway': br(p, 'c', p.pos === 'b' ? 'b' : 'a', ZERO_R, 0, 'zero'); break;
        case 'led': out.push({ a: p.id + '.an', b: p.id + '.ca', g: GMIN, e: 0, part: p.id, kind: 'led' }); break;
        case 'resistor': br(p, 'a', 'b', p.r); break;
        case 'buzzer': br(p, 'a', 'b', BUZZ_R); break;
        case 'coil': br(p, 'a', 'b', COIL_R); break;
        case 'motor': br(p, 'a', 'b', MOTOR_R); break;
        case 'voltmeter': br(p, 'pos', 'neg', VM_R); break;
        case 'ammeter': br(p, 'pos', 'neg', ZERO_R, 0, 'zero'); break;
      }
    });
    return out;
  }
  function gauss(A, x) {
    var n = x.length, i, j, k;
    for (k = 0; k < n; k++) {
      var piv = k, mx = Math.abs(A[k][k]);
      for (i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > mx) { mx = Math.abs(A[i][k]); piv = i; }
      if (mx === 0) continue;
      if (piv !== k) { var t = A[k]; A[k] = A[piv]; A[piv] = t; var tx = x[k]; x[k] = x[piv]; x[piv] = tx; }
      for (i = k + 1; i < n; i++) {
        var f = A[i][k] / A[k][k]; if (f === 0) continue;
        for (j = k; j < n; j++) A[i][j] -= f * A[k][j];
        x[i] -= f * x[k];
      }
    }
    for (k = n - 1; k >= 0; k--) {
      var s = x[k];
      for (j = k + 1; j < n; j++) s -= A[k][j] * x[j];
      x[k] = A[k][k] ? s / A[k][k] : 0;
    }
    return x;
  }
  function linear(nodes, brs) {
    var n = nodes.length, idx = {}, A = [], I = [], i;
    nodes.forEach(function (k, j) { idx[k] = j; });
    for (i = 0; i < n; i++) { A.push(new Array(n).fill(0)); A[i][i] = GMIN; I.push(0); }
    brs.forEach(function (r) {
      var a = idx[r.a], b = idx[r.b];
      A[a][a] += r.g; A[b][b] += r.g; A[a][b] -= r.g; A[b][a] -= r.g;
      I[a] += r.g * r.e; I[b] -= r.g * r.e;
    });
    var x = gauss(A, I), V = {};
    nodes.forEach(function (k, j) { V[k] = x[j]; });
    return V;
  }
  function current(r, V) { return r.g * (V[r.a] - V[r.b] - r.e); }

  // ---------- solve ----------
  function solve(b) {
    var nodes = terminals(b).map(tkey), brs = branches(b), V = null, it, leds = brs.filter(function (r) { return r.kind === 'led'; });
    for (it = 0; it < 40; it++) {
      V = linear(nodes, brs);
      var changed = false;
      leds.forEach(function (r) {
        var on = r.g > 1;
        var want = on ? current(r, V) > 0 : V[r.a] - V[r.b] > LED_V0;
        if (want !== on) { changed = true; if (want) { r.g = 1 / LED_RD; r.e = LED_V0; } else { r.g = GMIN; r.e = 0; } }
      });
      if (!changed) break;
    }
    var S = { V: V, parts: {}, wires: {}, short: [], shortWires: [], gaps: [], complete: false, notes: [] };
    var byPart = {};
    brs.forEach(function (r) {
      var i = current(r, V);
      if (r.wire) S.wires[r.wire] = i;
      else (byPart[r.part] = byPart[r.part] || []).push({ r: r, i: i });
    });
    b.parts.forEach(function (p) {
      var T = TYPES[p.t], k0 = p.id + '.' + T.terms[0], k1 = p.id + '.' + T.terms[1];
      var v = V[k0] - V[k1], list = byPart[p.id] || [], i = list.length ? list[0].i : 0, o = { v: v, i: i };
      switch (p.t) {
        case 'battery': o.v = V[p.id + '.pos'] - V[p.id + '.neg']; o.i = -i; o.emf = CELL_V * p.n; o.on = Math.abs(o.i) > 1e-3; break;
        case 'lamp': o.p = i * i * LAMP_R; o.bright = o.p / LAMP_W; o.lit = !p.broken && o.bright > 0.05; o.hot = o.bright > 2.2; break;
        case 'led': o.v = V[p.id + '.an'] - V[p.id + '.ca']; o.lit = i > 1e-3; o.over = i > LED_MAX; o.rev = o.v < -0.5; break;
        case 'buzzer': o.on = Math.abs(i) > 0.008; break;
        case 'coil': o.at = COIL_TURNS * Math.abs(i); o.on = Math.abs(i) > 0.15; break;
        case 'motor': o.spin = Math.abs(v) > 0.5 ? (v > 0 ? 1 : -1) : 0; o.speed = v / 3; break;
        case 'voltmeter': o.read = v; break;
        case 'ammeter': o.read = i; break;
        case 'twoway': o.v = V[p.id + '.c'] - V[p.id + '.' + p.pos]; break;
      }
      S.parts[p.id] = o;
    });
    // short circuits: a battery whose ends are joined by a path with no resistance (wires, closed switches, the ammeter)
    var par = {};
    function find(x) { while (par[x] && par[x] !== x) x = par[x] = par[par[x]] || par[x]; return x; }
    function join(x, y) { x = find(x); y = find(y); if (x !== y) par[x] = y; }
    nodes.forEach(function (k) { par[k] = k; });
    brs.forEach(function (r) { if (r.kind === 'zero') join(r.a, r.b); });
    b.parts.forEach(function (p) {
      if (p.t === 'battery' && find(p.id + '.pos') === find(p.id + '.neg')) {
        S.short.push(p.id);
        var root = find(p.id + '.pos');
        brs.forEach(function (r) { if (r.wire && find(r.a) === root && Math.abs(current(r, V)) > 0.5) S.shortWires.push(r.wire); });
      }
    });
    b.parts.forEach(function (p) { if (p.t === 'battery' && S.parts[p.id].on) S.complete = true; });
    S.gaps = findGaps(b, S);
    return S;
  }
  // Where is the circuit open? For a battery with wires on it and no current: open switches, terminals with nothing
  // on them, and LEDs the wrong way round, among the parts it reaches.
  function findGaps(b, S) {
    var out = [], seen = {};
    b.parts.forEach(function (bat) {
      if (bat.t !== 'battery' || S.parts[bat.id].on) return;
      if (!wiresAt(b, { p: bat.id, k: 'pos' }).length && !wiresAt(b, { p: bat.id, k: 'neg' }).length) return;
      var reach = {}, stack = [bat.id];
      reach[bat.id] = 1;
      while (stack.length) {
        var id = stack.pop();
        b.wires.forEach(function (w) {
          var o = w.a.p === id ? w.b.p : w.b.p === id ? w.a.p : null;
          if (o && !reach[o]) { reach[o] = 1; stack.push(o); }
        });
      }
      b.parts.forEach(function (p) {
        if (!reach[p.id] || p.t === 'voltmeter') return;
        TYPES[p.t].terms.forEach(function (k) {
          if (p.t === 'twoway' && k !== 'c' && k !== p.pos) return;
          var key = p.id + '.' + k;
          if (!wiresAt(b, { p: p.id, k: k }).length && !seen[key]) { seen[key] = 1; out.push({ p: p.id, k: k, why: 'loose' }); }
        });
        if ((p.t === 'switch' && !p.on) || (p.t === 'key' && !p.down)) { if (!seen[p.id]) { seen[p.id] = 1; out.push({ p: p.id, why: 'open' }); } }
        if (p.t === 'twoway' && !wiresAt(b, { p: p.id, k: p.pos }).length && !seen[p.id]) { seen[p.id] = 1; out.push({ p: p.id, why: 'throw' }); }
        if (p.t === 'led' && S.parts[p.id].rev && !seen[p.id]) { seen[p.id] = 1; out.push({ p: p.id, why: 'backward' }); }
      });
    });
    return out;
  }
  // What would happen with one more wire? (for the colors while you drag a wire end)
  function tryWire(b, x, y) {
    var c = clone(b);
    if (!addWire(c, x, y, 'try')) return null;
    var s = solve(c);
    return { short: s.short.length > 0, complete: s.complete, sol: s };
  }

  // ---------- Morse code ----------
  var MORSE = { '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U',
    '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z' };
  var DOT_MS = 280, LETTER_GAP_MS = 750;
  // presses: [{down: ms, up: ms}] in time order -> {letters: [...], text, raw}
  function decodeMorse(presses) {
    var letters = [], cur = '', raw = '';
    presses.forEach(function (p, i) {
      if (i > 0 && p.down - presses[i - 1].up > LETTER_GAP_MS && cur) { letters.push(cur); cur = ''; }
      var s = p.up - p.down < DOT_MS ? '.' : '-';
      cur += s; raw += s;
    });
    if (cur) letters.push(cur);
    return { letters: letters, text: letters.map(function (l) { return MORSE[l] || '?'; }).join(''), raw: raw };
  }

  // ---------- challenges ----------
  // setup(b) fills an empty bench; check(ctx) -> {done, note}. ctx = {bench, sol, mem (kept between checks), morse}
  function lamps(ctx) { return ctx.bench.parts.filter(function (p) { return p.t === 'lamp'; }); }
  function partsOf(b, t) { return b.parts.filter(function (p) { return p.t === t; }); }
  function near(a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b), 1e-9); }
  function solveWith(b, fn) { var c = clone(b); fn(c); return { b: c, s: solve(c) }; }
  function pct(x) { return Math.round(x * 100) + '%'; }
  var CHALLENGES = [
    { id: 'bulb', short: 'One battery, one bulb, one loop.', title: 'Light a bulb', goal: 'Wire the battery to the bulb so it lights. Current needs a full loop: out of one end of the battery, through the bulb, and back to the other end.',
      setup: function (b) { addPart(b, 'battery', 1, { n: 2 }, 'B'); addPart(b, 'lamp', 3, null, 'L1'); },
      check: function (ctx) {
        var ok = !ctx.sol.short.length && lamps(ctx).some(function (p) { return ctx.sol.parts[p.id].bright >= 0.3; });
        return { done: ok, note: ok ? 'The loop is complete, so current flows and the filament glows.' : '' };
      } },
    { id: 'series', short: 'Two bulbs in a line, then side by side.', title: 'Series or parallel?', goal: 'Light both bulbs in a line (series), then each on its own path (parallel). Which way are they brighter?',
      setup: function (b) { addPart(b, 'battery', 1, { n: 2 }, 'B'); addPart(b, 'lamp', 2, null, 'L1'); addPart(b, 'lamp', 3, null, 'L2'); },
      check: function (ctx) {
        var L = lamps(ctx).filter(function (p) { return ctx.sol.parts[p.id].lit; }), bat = partsOf(ctx.bench, 'battery')[0];
        if (L.length === 2 && bat && !ctx.sol.short.length) {
          var a = ctx.sol.parts[L[0].id], c = ctx.sol.parts[L[1].id], ib = Math.abs(ctx.sol.parts[bat.id].i);
          if (near(Math.abs(a.i), Math.abs(c.i), 0.01) && near(ib, Math.abs(a.i), 0.02)) ctx.mem.series = a.bright;
          if (near(ib, Math.abs(a.i) + Math.abs(c.i), 0.02) && near(Math.abs(a.i), Math.abs(c.i), 0.01)) ctx.mem.parallel = a.bright;
        }
        var m = ctx.mem, done = m.series !== undefined && m.parallel !== undefined;
        var note = (m.series !== undefined ? 'Series: each bulb at ' + pct(m.series) + '. ' : '') + (m.parallel !== undefined ? 'Parallel: each bulb at ' + pct(m.parallel) + '. ' : '');
        if (done) note += 'In series the two bulbs share the battery’s voltage; in parallel each gets all of it.';
        return { done: done, note: note };
      } },
    { id: 'meters', short: 'Ammeter in the loop, voltmeter across.', title: 'Read the meters', goal: 'Light the bulb with the ammeter in the loop, so the current goes through it, and the voltmeter across the bulb, one lead on each end.',
      setup: function (b) { addPart(b, 'battery', 0, { n: 2 }, 'B'); addPart(b, 'lamp', 2, null, 'L1'); addPart(b, 'ammeter', 1, null, 'A'); addPart(b, 'voltmeter', 7, null, 'V'); },
      check: function (ctx) {
        var am = partsOf(ctx.bench, 'ammeter')[0], vm = partsOf(ctx.bench, 'voltmeter')[0], s = ctx.sol;
        if (!am || !vm || s.short.length) return { done: false, note: s.short.length ? '' : '' };
        var ok = lamps(ctx).some(function (p) {
          var q = s.parts[p.id];
          return q.lit && near(Math.abs(s.parts[am.id].read), Math.abs(q.i), 0.02) && near(Math.abs(s.parts[vm.id].read), Math.abs(q.v), 0.02) && Math.abs(q.v) > 0.5;
        });
        return { done: ok, note: ok ? 'The ammeter reads ' + Math.abs(s.parts[am.id].read).toFixed(3) + ' A and the voltmeter ' + Math.abs(s.parts[vm.id].read).toFixed(2) + ' V. Divide: ' + (Math.abs(s.parts[vm.id].read) / Math.abs(s.parts[am.id].read)).toFixed(1) + ' Ω, the bulb’s resistance.' : '' };
      } },
    { id: 'led', short: 'Pick the resistor for about 20 mA.', title: 'An LED, the right way round', goal: 'Light the LED at about 20 mA (15 to 25 mA counts). Its + leg goes toward the battery’s + end, and it needs a resistor: R = (4.5 V − 2 V) ÷ 0.020 A. Pick the nearest size.',
      setup: function (b) { addPart(b, 'battery', 0, { n: 3 }, 'B'); addPart(b, 'led', 2, null, 'D'); addPart(b, 'resistor', 1, { r: 1000 }, 'R'); },
      check: function (ctx) {
        var ok = false, best = null;
        partsOf(ctx.bench, 'led').forEach(function (p) { var q = ctx.sol.parts[p.id]; if (q.i > 0.015 && q.i < 0.025) ok = true; if (q.lit) best = q; });
        return { done: ok && !ctx.sol.short.length, note: ok ? 'About ' + Math.round(best.i * 1000) + ' mA: bright, and safe for a small LED.' : best ? 'The LED is on at ' + (best.i * 1000).toFixed(1) + ' mA.' : '' };
      } },
    { id: 'twolamps', short: 'One switch controls both bulbs.', title: 'One switch, two bulbs', goal: 'Wire two bulbs and one switch so the switch turns both bulbs on and off together, and both shine brightly (60% or more).',
      setup: function (b) { addPart(b, 'battery', 0, { n: 2 }, 'B'); addPart(b, 'switch', 1, null, 'S'); addPart(b, 'lamp', 3, null, 'L1'); addPart(b, 'lamp', 4, null, 'L2'); },
      check: function (ctx) {
        var ok = partsOf(ctx.bench, 'switch').some(function (sw) {
          var on = solveWith(ctx.bench, function (c) { part(c, sw.id).on = true; }), off = solveWith(ctx.bench, function (c) { part(c, sw.id).on = false; });
          var Lon = on.b.parts.filter(function (p) { return p.t === 'lamp' && on.s.parts[p.id].bright >= 0.6; });
          var Loff = off.b.parts.filter(function (p) { return p.t === 'lamp' && off.s.parts[p.id].lit; });
          return Lon.length >= 2 && !on.s.short.length && Lon.every(function (p) { return Loff.every(function (q) { return q.id !== p.id; }); });
        });
        return { done: ok, note: ok ? 'One switch in the shared part of the circuit controls both branches. A house works this way.' : '' };
      } },
    { id: 'magnet', short: 'Compare 1 cell and 3 cells.', title: 'A stronger electromagnet', goal: 'Run the electromagnet on 1 cell, then on 3 cells (use + and − on the battery holder). Watch the ampere-turns: the current times the 100 turns of wire.',
      setup: function (b) { addPart(b, 'battery', 1, { n: 1 }, 'B'); addPart(b, 'coil', 3, null, 'M'); },
      check: function (ctx) {
        var m = ctx.mem; m.seen = m.seen || {};
        var bats = partsOf(ctx.bench, 'battery');
        partsOf(ctx.bench, 'coil').forEach(function (c) {
          var q = ctx.sol.parts[c.id];
          if (q.on && bats.length === 1 && !ctx.sol.short.length) m.seen[bats[0].n] = q.at;
        });
        var done = m.seen[1] !== undefined && m.seen[3] !== undefined, note = Object.keys(m.seen).sort().map(function (n) { return n + (n === '1' ? ' cell: ' : ' cells: ') + Math.round(m.seen[n]) + ' ampere-turns'; }).join(' · ');
        if (done) note += '. More cells push more current through the coil, and the magnet gets stronger.';
        return { done: done, note: note };
      } },
    { id: 'telegraph', short: 'Build it, then send SOS.', title: 'Morse’s telegraph', goal: 'Wire the battery, the key and the electromagnet (the sounder) in one loop. Then send SOS: three short taps, three long presses, three short taps (· · · — — — · · ·).',
      setup: function (b) { addPart(b, 'battery', 0, { n: 2 }, 'B'); addPart(b, 'key', 1, null, 'K'); addPart(b, 'coil', 3, null, 'M'); },
      check: function (ctx) {
        var d = decodeMorse(ctx.morse || []), done = d.text.indexOf('SOS') >= 0 || d.raw.indexOf('...---...') >= 0;
        return { done: done, note: d.raw ? 'Received: ' + d.letters.join(' ') + (d.text ? ' (' + d.text + ')' : '') : '' };
      } },
    { id: 'motor', short: 'Make it spin both ways.', title: 'Turn the motor around', goal: 'Make the motor spin, then make it spin the other way. What do you have to change?',
      setup: function (b) { addPart(b, 'battery', 1, { n: 2 }, 'B'); addPart(b, 'motor', 3, null, 'Mo'); },
      check: function (ctx) {
        var m = ctx.mem;
        partsOf(ctx.bench, 'motor').forEach(function (p) { var q = ctx.sol.parts[p.id]; if (q.spin > 0) m.fwd = 1; if (q.spin < 0) m.rev = 1; });
        var done = !!(m.fwd && m.rev);
        return { done: done, note: done ? 'Swap the wires and the current goes through the motor the other way, so the push on its coil reverses.' : (m.fwd || m.rev) ? 'It spins one way. Now the other.' : '' };
      } },
    { id: 'stairs', short: 'Either switch flips the bulb.', title: 'Staircase lights', goal: 'Use the two two-way switches so that either one turns the bulb on or off, like the switches at the top and bottom of a staircase.',
      setup: function (b) { addPart(b, 'battery', 0, { n: 2 }, 'B'); addPart(b, 'twoway', 1, null, 'S1'); addPart(b, 'twoway', 3, null, 'S2'); addPart(b, 'lamp', 7, null, 'L1'); },
      check: function (ctx) {
        var tw = partsOf(ctx.bench, 'twoway'); if (tw.length < 2) return { done: false, note: '' };
        var ok = lamps(ctx).some(function (L) {
          var lit = {}, bad = false;
          ['a', 'b'].forEach(function (x) { ['a', 'b'].forEach(function (y) {
            var r = solveWith(ctx.bench, function (c) { part(c, tw[0].id).pos = x; part(c, tw[1].id).pos = y; });
            if (r.s.short.length) bad = true;
            var q = r.s.parts[L.id]; lit[x + y] = q.bright >= 0.6 ? 1 : q.lit ? 2 : 0;
          }); });
          if (bad || lit.aa === 2 || lit.ab === 2 || lit.ba === 2 || lit.bb === 2) return false;
          return lit.aa !== lit.ba && lit.aa !== lit.ab && lit.bb !== lit.ab && lit.bb !== lit.ba;
        });
        return { done: ok, note: ok ? 'Either switch flips the bulb. Two wires run between the switches, and each switch picks one of them.' : '' };
      } },
    { id: 'fault', short: 'Find the broken part and replace it.', title: 'Find the fault', goal: 'This circuit should light both bulbs, but neither glows. Use the voltmeter to find the broken part (a gap reads the whole battery voltage), then swap it for a new one from the parts tray.',
      setup: function (b) {
        addPart(b, 'battery', 0, { n: 2 }, 'B'); addPart(b, 'lamp', 2, { broken: true }, 'L1'); addPart(b, 'lamp', 4, null, 'L2'); addPart(b, 'voltmeter', 7, null, 'V');
        addWire(b, { p: 'B', k: 'pos' }, { p: 'L1', k: 'a' }, 'w1'); addWire(b, { p: 'L1', k: 'b' }, { p: 'L2', k: 'a' }, 'w2'); addWire(b, { p: 'L2', k: 'b' }, { p: 'B', k: 'neg' }, 'w3');
      },
      check: function (ctx) {
        var L = lamps(ctx).filter(function (p) { return !p.broken && ctx.sol.parts[p.id].bright >= 0.15; });
        return { done: L.length >= 2 && !ctx.sol.short.length, note: L.length >= 2 ? 'Fixed. The broken bulb’s filament had snapped, leaving a gap, so no current could flow anywhere in the loop.' : '' };
      } }
  ];

  var api = { TYPES: TYPES, RES: RES, CHALLENGES: CHALLENGES, consts: { CELL_V: CELL_V, CELL_R: CELL_R, LED_V0: LED_V0, LED_RD: LED_RD, LED_MAX: LED_MAX, LAMP_R: LAMP_R, LAMP_W: LAMP_W, COIL_R: COIL_R, COIL_TURNS: COIL_TURNS, MOTOR_R: MOTOR_R, BUZZ_R: BUZZ_R, VM_R: VM_R, DOT_MS: DOT_MS, LETTER_GAP_MS: LETTER_GAP_MS },
    newBench: newBench, part: part, addPart: addPart, removePart: removePart, addWire: addWire, wireOK: wireOK, removeWire: removeWire,
    terminals: terminals, wiresAt: wiresAt, sameT: sameT, tkey: tkey, clone: clone, solve: solve, tryWire: tryWire, decodeMorse: decodeMorse, MORSE: MORSE };
  if (typeof module === 'object' && module.exports) module.exports = api; else g.CBModel = api;
})(typeof window !== 'undefined' ? window : this);
