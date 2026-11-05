#!/usr/bin/env node
/* Unit tests for the Circuit Bench solver (static/science-lab/circuit-bench/model.js). Run: node scripts/circuit-bench/test-model.js
   Each expected value is worked out by hand from the part values in model.js (cells 1.5 V with 0.2 Ω each, bulb 10 Ω,
   LED 1.9 V + 5 Ω, wires 0.1 mΩ), so a pass means the nodal analysis agrees with Ohm's law and the series/parallel rules. */
'use strict';
const path = require('path');
const M = require(path.join(__dirname, '..', '..', 'static', 'science-lab', 'circuit-bench', 'model.js'));
let fails = 0, n = 0;
function eq(name, got, want, tol) {
  n++;
  const ok = Math.abs(got - want) <= (tol || 1e-4) * Math.max(1, Math.abs(want));
  if (!ok) { fails++; console.log('FAIL', name, 'got', got, 'want', want); } else console.log('ok  ', name, +got.toPrecision(6));
}
function yes(name, v) { n++; if (!v) { fails++; console.log('FAIL', name); } else console.log('ok  ', name); }
const W = 1e-4; // one wire
function T(p, k) { return { p: p, k: k }; }

// one bulb on two cells: I = 3 / (10 + 0.4 + 2 wires)
let b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'lamp', 1, null, 'L');
M.addWire(b, T('B', 'pos'), T('L', 'a')); M.addWire(b, T('L', 'b'), T('B', 'neg'));
let s = M.solve(b);
eq('one bulb, current', s.parts.L.i, 3 / (10.4 + 2 * W));
eq('one bulb, battery current = bulb current', s.parts.B.i, s.parts.L.i);
eq('one bulb, power 0.832 W', s.parts.L.p, Math.pow(3 / 10.4, 2) * 10, 1e-3);
yes('one bulb is lit and the circuit is complete', s.parts.L.lit && s.complete && !s.short.length);

// two bulbs in series: I = 3 / 20.4 ; each bulb V = 10 I
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'lamp', 1, null, 'L1'); M.addPart(b, 'lamp', 2, null, 'L2');
M.addWire(b, T('B', 'pos'), T('L1', 'a')); M.addWire(b, T('L1', 'b'), T('L2', 'a')); M.addWire(b, T('L2', 'b'), T('B', 'neg'));
s = M.solve(b);
eq('series, current 0.147059 A', s.parts.L1.i, 3 / 20.4);
eq('series, same current in both bulbs', s.parts.L2.i, s.parts.L1.i, 1e-9);
eq('series, each bulb gets half the voltage', s.parts.L1.v, 10 * 3 / 20.4);

// two bulbs in parallel: R = 5, I = 3 / 5.4, each bulb I/2
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'lamp', 1, null, 'L1'); M.addPart(b, 'lamp', 2, null, 'L2');
M.addWire(b, T('B', 'pos'), T('L1', 'a')); M.addWire(b, T('L1', 'b'), T('B', 'neg')); M.addWire(b, T('L1', 'a'), T('L2', 'a')); M.addWire(b, T('L1', 'b'), T('L2', 'b'));
s = M.solve(b);
eq('parallel, battery current 0.555556 A', s.parts.B.i, 3 / 5.4);
eq('parallel, each bulb half of it', s.parts.L2.i, 3 / 10.8);
eq('parallel, battery terminal voltage 3 − 0.4 I', s.parts.B.v, 3 - 0.4 * 3 / 5.4);

// 100 Ω + (220 ∥ 470) on 6 cells? use two holders in series: 4 + 2 cells = 9 V, r = 1.2 Ω
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 4 }, 'B1'); M.addPart(b, 'battery', 1, { n: 2 }, 'B2');
M.addPart(b, 'resistor', 2, { r: 100 }, 'R1'); M.addPart(b, 'resistor', 3, { r: 220 }, 'R2'); M.addPart(b, 'resistor', 4, { r: 470 }, 'R3');
M.addWire(b, T('B1', 'pos'), T('B2', 'neg')); M.addWire(b, T('B2', 'pos'), T('R1', 'a')); M.addWire(b, T('R1', 'b'), T('R2', 'a')); M.addWire(b, T('R1', 'b'), T('R3', 'a'));
M.addWire(b, T('R2', 'b'), T('B1', 'neg')); M.addWire(b, T('R3', 'b'), T('B1', 'neg'));
s = M.solve(b);
const Rp = 1 / (1 / 220 + 1 / 470), I9 = 9 / (1.2 + 100 + Rp);
eq('two holders in series add: 9 V, combination current', s.parts.R1.i, I9);
eq('current divides 470 : 220', s.parts.R2.i / s.parts.R3.i, 470 / 220);
eq('junction rule: R1 = R2 + R3 (within the 1 nS leak)', s.parts.R1.i, s.parts.R2.i + s.parts.R3.i, 1e-7);

// LED rule: 3 cells, R = 120 Ω: I = (4.5 − 1.9) / (120 + 5 + 0.6)
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 3 }, 'B'); M.addPart(b, 'resistor', 1, { r: 120 }, 'R'); M.addPart(b, 'led', 2, null, 'D');
M.addWire(b, T('B', 'pos'), T('R', 'a')); M.addWire(b, T('R', 'b'), T('D', 'an')); M.addWire(b, T('D', 'ca'), T('B', 'neg'));
s = M.solve(b);
eq('LED + 120 Ω on 4.5 V: 20.7 mA', s.parts.D.i, 2.6 / 125.6, 1e-3);
eq('LED voltage about 2 V', s.parts.D.v, 1.9 + 5 * 2.6 / 125.6, 1e-3);
yes('LED lit, not over 30 mA', s.parts.D.lit && !s.parts.D.over);
eq('resistor rule R = (4.5 − 2) / 0.02 = 125 Ω', (4.5 - 2) / 0.02, 125);
// the same LED turned around: no current, and it is named as the gap
b.wires = []; M.addWire(b, T('B', 'pos'), T('R', 'a')); M.addWire(b, T('R', 'b'), T('D', 'ca')); M.addWire(b, T('D', 'an'), T('B', 'neg'));
s = M.solve(b);
yes('backward LED passes no current', Math.abs(s.parts.D.i) < 1e-6 && !s.complete);
yes('backward LED is reported', s.gaps.some(g => g.p === 'D' && g.why === 'backward'));
// LED with no resistor on 3 cells: far too much current
b.wires = []; M.addWire(b, T('B', 'pos'), T('D', 'an')); M.addWire(b, T('D', 'ca'), T('B', 'neg'));
s = M.solve(b);
eq('LED with no resistor: (4.5 − 1.9) / 5.6 A', s.parts.D.i, 2.6 / 5.6, 1e-3);
yes('flagged as too much current', s.parts.D.over);

// short circuit: a wire across one cell -> 1.5 / 0.2 = 7.5 A and a warning
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 1 }, 'B'); M.addWire(b, T('B', 'pos'), T('B', 'neg'), 'w');
s = M.solve(b);
eq('short circuit current 7.5 A', s.parts.B.i, 1.5 / (0.2 + W), 1e-3);
yes('short circuit is flagged, with its wire', s.short.length === 1 && s.shortWires[0] === 'w');
// an ammeter straight across the battery is a short too
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'ammeter', 1, null, 'A');
M.addWire(b, T('B', 'pos'), T('A', 'pos')); M.addWire(b, T('A', 'neg'), T('B', 'neg'));
yes('ammeter across a battery is a short', M.solve(b).short.length === 1);
// a bulb with a switch: open = a gap, closed = lit
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'switch', 1, null, 'S'); M.addPart(b, 'lamp', 2, null, 'L');
M.addWire(b, T('B', 'pos'), T('S', 'a')); M.addWire(b, T('S', 'b'), T('L', 'a')); M.addWire(b, T('L', 'b'), T('B', 'neg'));
s = M.solve(b);
yes('open switch: no current, switch named as the gap', !s.complete && s.gaps.some(g => g.p === 'S' && g.why === 'open'));
M.part(b, 'S').on = true; s = M.solve(b);
yes('closed switch: lit, no gaps', s.parts.L.lit && !s.gaps.length);
// a loose end is found
b.wires.pop(); M.part(b, 'S').on = true; s = M.solve(b);
yes('loose terminal is named', s.gaps.some(g => g.p === 'L' && g.k === 'b' && g.why === 'loose'));
// voltmeter across a bulb reads the bulb's voltage (draws a trickle), ammeter in series reads its current
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'ammeter', 1, null, 'A'); M.addPart(b, 'lamp', 2, null, 'L'); M.addPart(b, 'voltmeter', 3, null, 'V');
M.addWire(b, T('B', 'pos'), T('A', 'pos')); M.addWire(b, T('A', 'neg'), T('L', 'a')); M.addWire(b, T('L', 'b'), T('B', 'neg'));
M.addWire(b, T('V', 'pos'), T('L', 'a')); M.addWire(b, T('V', 'neg'), T('L', 'b'));
s = M.solve(b);
eq('ammeter reads the bulb current', s.parts.A.read, s.parts.L.i, 1e-6);
eq('voltmeter reads the bulb voltage', s.parts.V.read, s.parts.L.v, 1e-6);
eq('V / I = 10 Ω', s.parts.V.read / s.parts.A.read, 10, 1e-4);
// electromagnet: ampere-turns = 100 × 1.5 / 3.2 on one cell, 100 × 4.5 / 3.6 on three
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 1 }, 'B'); M.addPart(b, 'coil', 1, null, 'M');
M.addWire(b, T('B', 'pos'), T('M', 'a')); M.addWire(b, T('M', 'b'), T('B', 'neg'));
eq('coil on 1 cell: 46.9 ampere-turns', M.solve(b).parts.M.at, 100 * 1.5 / 3.2, 1e-3);
M.part(b, 'B').n = 3;
eq('coil on 3 cells: 125 ampere-turns', M.solve(b).parts.M.at, 100 * 4.5 / 3.6, 1e-3);
// two-way switches: the lamp follows the XOR of the two switches
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'twoway', 1, null, 'S1'); M.addPart(b, 'twoway', 2, null, 'S2'); M.addPart(b, 'lamp', 3, null, 'L');
M.addWire(b, T('B', 'pos'), T('S1', 'c')); M.addWire(b, T('S1', 'a'), T('S2', 'a')); M.addWire(b, T('S1', 'b'), T('S2', 'b')); M.addWire(b, T('S2', 'c'), T('L', 'a')); M.addWire(b, T('L', 'b'), T('B', 'neg'));
const tab = {};
['a', 'b'].forEach(x => ['a', 'b'].forEach(y => { M.part(b, 'S1').pos = x; M.part(b, 'S2').pos = y; tab[x + y] = M.solve(b).parts.L.lit; }));
yes('staircase truth table (on when both match)', tab.aa && tab.bb && !tab.ab && !tab.ba);
// motor direction follows the current
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 2 }, 'B'); M.addPart(b, 'motor', 1, null, 'Mo');
M.addWire(b, T('B', 'pos'), T('Mo', 'a')); M.addWire(b, T('Mo', 'b'), T('B', 'neg'));
const d1 = M.solve(b).parts.Mo.spin; b.wires = []; M.addWire(b, T('B', 'pos'), T('Mo', 'b')); M.addWire(b, T('Mo', 'a'), T('B', 'neg'));
yes('motor reverses when the wires are swapped', d1 === 1 && M.solve(b).parts.Mo.spin === -1);
// Morse
const P = (seq, gap) => { let t = 0; const out = []; seq.split('').forEach(c => { if (c === ' ') { t += gap; return; } const d = c === '.' ? 120 : 450; out.push({ down: t, up: t + d }); t += d + 200; }); return out; };
yes('Morse decodes SOS', M.decodeMorse(P('... --- ...', 900)).text === 'SOS');
yes('Morse decodes E T', M.decodeMorse(P('. -', 900)).text === 'ET');
// junction rule on a random-ish network: current in = current out at every node
b = M.newBench(); M.addPart(b, 'battery', 0, { n: 3 }, 'B');
['R1', 'R2', 'R3', 'R4', 'R5'].forEach((id, i) => M.addPart(b, 'resistor', i + 1, { r: M.RES[i * 2] }, id));
[['B', 'pos', 'R1', 'a'], ['B', 'pos', 'R2', 'a'], ['R1', 'b', 'R3', 'a'], ['R2', 'b', 'R4', 'a'], ['R1', 'b', 'R5', 'a'], ['R5', 'b', 'R2', 'b'], ['R3', 'b', 'B', 'neg'], ['R4', 'b', 'B', 'neg']]
  .forEach(w => M.addWire(b, T(w[0], w[1]), T(w[2], w[3])));
s = M.solve(b);
eq('bridge: battery current = current into the far end', s.parts.B.i, s.parts.R3.i + s.parts.R4.i, 1e-7);
eq('bridge: node at R1.b', s.parts.R1.i, s.parts.R3.i + s.parts.R5.i, 1e-7);
console.log(`\n${n - fails} of ${n} passed`);
process.exit(fails ? 1 : 0);
