/* Pyramid Explorer: the data. Seven Old Kingdom pyramids as surfaces only (the outer casing and the walls of each open
   space), the number patterns in their surveyed dimensions, and candidate spaces that have not been entered.
   Meters; x east, y up from the base, z south (north is -z); origin at the center of the base.
   Each space is one or more prisms: a profile p (u across, v up) carried from a to b, with ends 'cap' (stone),
   'open' (nothing) or 'door' (a dark doorway seen from the next room). No outside libraries. Runs in node for checks. */
(function (G) {
  'use strict';
  var CUBIT = 0.5236, M = Math, rad = M.PI / 180;
  function f(x, d) { return (+x).toFixed(d == null ? 2 : d); }
  function sg(x, d) { return (x >= 0 ? '+' : '−') + M.abs(x).toFixed(d == null ? 2 : d); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var RECT = function (w, h) { return [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]]; };
  var SQ = function (w, d) { d = d || w; return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]; };
  var GABLE = function (w, wall, apex) { return [[-w / 2, 0], [w / 2, 0], [w / 2, wall], [0, apex], [-w / 2, wall]]; };
  // corbelled section: width w at the floor, vertical to hv, then n overhanging courses in to wt at height h
  function CORBEL(w, h, hv, n, wt) {
    var p = [[-w / 2, 0], [w / 2, 0], [w / 2, hv]], hw = w / 2, y = hv, i, st = (w - wt) / 2 / n, r = (h - hv) / n;
    for (i = 0; i < n; i++) { hw -= st; p.push([hw, y]); y += r; p.push([hw, y]); }
    for (i = p.length - 1; i >= 2; i--) p.push([-p[i][0], p[i][1]]);
    return p;
  }
  function pyr(half, h) { return [{ y: 0, hx: half, hz: half }, { y: h, hx: 0, hz: 0 }]; }
  function halfAt(levels, y) {
    for (var i = 0; i < levels.length - 1; i++) { var a = levels[i], b = levels[i + 1]; if (b.y > a.y && y >= a.y && y <= b.y) { var t = (y - a.y) / (b.y - a.y); return { hx: a.hx + (b.hx - a.hx) * t, hz: a.hz + (b.hz - a.hz) * t }; } }
    return { hx: 0, hz: 0 };
  }
  function dimRows(list) { return list.map(function (d) { var c = d[1] / CUBIT; return { name: d[0], m: d[1], cubits: c, target: d[2], label: d[3], diff: c - d[2] }; }); }
  function dimTable(rows, tol) {
    return '<div class="px-tw"><table><tr><th>Dimension</th><th class="n">m</th><th class="n">cubits</th><th class="n">aim</th><th class="n">off</th></tr>' + rows.map(function (d) {
      return '<tr><td>' + esc(d.name) + '</td><td class="n">' + f(d.m) + '</td><td class="n">' + f(d.cubits) + '</td><td class="n">' + (d.label || d.target) + '</td><td class="n ' + (M.abs(d.diff) <= (tol || 0.25) ? 'ok' : 'off') + '">' + sg(d.diff) + '</td></tr>';
    }).join('') + '</table></div>';
  }
  function slopeTable(list, tol) {
    return '<table><tr><th>Slope</th><th class="n">surveyed</th><th class="n">rise : run</th><th class="n">off</th></tr>' + list.map(function (d) {
      var t = M.atan(d[2]) / rad, diff = d[1] - t;
      return '<tr><td>' + esc(d[0]) + '</td><td class="n">' + f(d[1]) + '°</td><td class="n">' + d[3] + '</td><td class="n ' + (M.abs(diff) <= (tol || 0.6) ? 'ok' : 'off') + '">' + sg(diff) + '°</td></tr>';
    }).join('') + '</table>';
  }
  function rms(rows) { return M.sqrt(rows.reduce(function (s, d) { return s + M.pow(d.diff / d.target, 2); }, 0) / rows.length) * 100; }
  function stdPatterns(o) {
    var rows = dimRows(o.dims), out = [];
    out.push({ h: 'Whole numbers of cubits', html: '<p>' + o.dimLead + ' Typical misfit across these ' + rows.length + ' dimensions: ' + f(rms(rows), 1) + '%.</p>' + dimTable(rows) });
    out.push({ h: 'Slopes as rise over run', html: '<p>' + o.slopeLead + '</p>' + slopeTable(o.slopes) });
    (o.extra || []).forEach(function (e) { out.push(e); });
    out.push({ h: 'How far to trust this', html: '<p>A match within a quarter of a cubit is shown in green. Single matches happen by luck in any set of numbers; a rule counts when it fits many independent measurements. Positions in this model are good to a few meters, so only lengths and angles are tested here.</p>' });
    return out;
  }
  var P = [];

  /* ================================================================== Khufu */
  (function () {
    var BH = 220 * CUBIT, H = 280 * CUBIT, AX = 7.29;
    var ENT = { y: 16.97, z: -(BH - 16.97 * 11 / 14) }, dA = 26.52 * rad, aA = 26.03 * rad, gA = 26.28 * rad;
    var JUNC = { z: ENT.z + 28.21 * M.cos(dA), y: ENT.y - 28.21 * M.sin(dA) };
    var DBOT = { z: ENT.z + 105.23 * M.cos(dA), y: ENT.y - 105.23 * M.sin(dA) };
    var GG0 = { z: JUNC.z + 39.29 * M.cos(aA), y: 21.66 };
    var STEP = { z: GG0.z + 46.11 * M.cos(gA) }, GGS = 1.55;
    var KC = { zn: 8.40, zs: 13.635, xe: AX + 0.52, xw: AX + 0.52 - 10.47, y: 43.03, h: 5.84 };
    var QC = { zn: -2.615, zs: 2.615, xe: AX + 0.52, xw: AX + 0.52 - 5.76, y: 21.19, wall: 4.69, apex: 6.23 };
    var SUB = { zn: DBOT.z + 8.79, y: -30.0, roof: -26.8 }; SUB.zs = SUB.zn + 8.26; SUB.xe = AX + 0.52; SUB.xw = SUB.xe - 14.05;
    var NFC = { z0: -99.0, z1: -90.0, y: 19.5 }, qx = (QC.xe + QC.xw) / 2, kx = KC.xe - 2.5, qS = 39.6 * rad, qRun = 61.6;
    var QD = { y: QC.y + 1.6 + qRun * M.sin(qS), dz: 2.615 + 2.0 + qRun * M.cos(qS) };
    function out(z0, y0, a, dir) { var t = (BH - dir * z0 - y0 * 11 / 14) / (M.cos(a) + M.sin(a) * 11 / 14); return { z0: z0, y0: y0, z: z0 + dir * t * M.cos(a), y: y0 + t * M.sin(a) }; }
    var kN = out(KC.zn - 2.6, KC.y + 1.0, 32.47 * rad, -1), kS = out(KC.zs + 1.7, KC.y + 1.0, 45 * rad, 1);
    var GAL = (function () { var p = [[-1.03, 0], [1.03, 0], [1.03, 2.29]], hw = 1.03, y = 2.29, i; for (i = 0; i < 7; i++) { hw -= 0.0735; p.push([hw, y]); y += (8.6 - 2.29) / 7; p.push([hw, y]); } for (i = p.length - 1; i >= 2; i--) p.push([-p[i][0], p[i][1]]); return p; })();
    function nfc(z) { return NFC.y + (z - NFC.z1) / 2; }
    var L3 = 123 * CUBIT, kcz = (KC.zn + KC.zs) / 2, sz = (SUB.zn + SUB.zs) / 2;
    var spaces = [
      { id: 'entrance', name: 'Entrance and descending passage', short: 'Entrance', stone: 'lime', dims: 'slope 26.52°, length 105.2 m',
        note: 'Opens on the north face 17 m up, then runs 105 m down at 26.5° through masonry and bedrock.',
        parts: [{ p: RECT(1.05, 1.2), a: [AX, ENT.y, ENT.z], b: [AX, DBOT.y, DBOT.z], ends: ['door', 'open'] }, { p: RECT(0.82, 0.9), a: [AX, DBOT.y, DBOT.z], b: [AX, SUB.y, SUB.zn], ends: ['open', 'door'] }], view: [AX, ENT.y + 0.6, ENT.z + 3], far: 1 },
      { id: 'sub', name: 'Subterranean chamber', stone: 'rock', dims: '14.05 × 8.26 m (27 × 16 cubits)', look: 270,
        note: 'Unfinished room cut 30 m down in bedrock, with a pit in the floor and a blind passage leading south.',
        parts: [{ p: RECT(8.26, SUB.roof - SUB.y + 0.9), a: [SUB.xw, SUB.y - 0.4, sz], b: [SUB.xe, SUB.y - 0.4, sz], ends: ['cap', 'cap'] }, { p: RECT(0.75, 0.75), a: [AX, SUB.y, SUB.zs], b: [AX, SUB.y, SUB.zs + 16.3], ends: ['door', 'cap'] }, { p: SQ(1.9), a: [AX - 3.5, SUB.y - 0.4, SUB.zn + 4], b: [AX - 3.5, SUB.y - 3.4, SUB.zn + 4], ends: ['open', 'cap'] }], view: [2, SUB.y + 1.4, SUB.zn + 4] },
      { id: 'asc', name: 'Ascending passage', stone: 'lime', dims: 'slope 26.03°, length 39.3 m (75 cubits)',
        note: 'Branches upward from the descending passage. Three granite plugs still block its lower end.',
        parts: [{ p: RECT(1.05, 1.2), a: [AX, JUNC.y + 1.3, JUNC.z], b: [AX, GG0.y, GG0.z], ends: ['cap', 'open'] }], view: [AX, (JUNC.y + GG0.y) / 2 + 0.6, (JUNC.z + GG0.z) / 2] },
      { id: 'mamun', name: 'Robbers’ tunnel (al-Ma’mun)', short: 'Robbers’ tunnel', stone: 'rough', dims: 'about 27 m long, on the center line',
        note: 'Forced through the north face around AD 820. Today’s visitors enter here.',
        parts: [{ p: RECT(1.8, 2.0), a: [0, 6.6, -(BH - 6.6 * 11 / 14)], b: [0, 6.6, -82], ends: ['door', 'cap'] }, { p: RECT(1.6, 2.0), a: [0, 6.6, -82.8], b: [AX, JUNC.y + 3.0, JUNC.z + 5.5], ends: ['open', 'open'] }], view: [0, 7.6, -100], far: 1 },
      { id: 'nfc', name: 'North Face Corridor', stone: 'lime', dims: '9 × 2.1 × 2.3 m',
        note: 'Gabled corridor behind the chevrons above the entrance. Found by muons in 2016, seen by endoscope in 2023. It has no known exit.',
        parts: [{ p: GABLE(2.1, 1.45, 2.3), a: [AX, NFC.y, NFC.z0], b: [AX, NFC.y, NFC.z1], ends: ['cap', 'cap'] }], view: [AX, NFC.y + 1.2, -94.5] },
      { id: 'qpass', name: 'Passage to the Queen’s Chamber', short: 'Queen’s passage', stone: 'lime', dims: '38.7 m long, 2 cubits wide',
        note: 'Level passage from the foot of the Grand Gallery. The floor drops half a meter for the last 5.5 m.',
        parts: [{ p: RECT(1.05, 1.17), a: [AX, GG0.y, GG0.z], b: [AX, GG0.y, QC.zn - 5.5], ends: ['open', 'open'] }, { p: RECT(1.05, 1.72), a: [AX, QC.y, QC.zn - 5.5], b: [AX, QC.y, QC.zn], ends: ['open', 'door'] }], view: [AX, GG0.y + 0.6, -20] },
      { id: 'qc', name: 'Queen’s Chamber', stone: 'lime', dims: '5.76 × 5.23 m (11 × 10 cubits), apex 6.23 m', look: 90,
        note: 'Gabled limestone room whose ridge lies exactly on the pyramid’s east–west center plane. A corbelled niche is cut in the east wall.',
        parts: [{ p: GABLE(5.23, QC.wall, QC.apex), a: [QC.xw, QC.y, 0], b: [QC.xe, QC.y, 0], ends: ['cap', 'cap'] }, { p: [[-0.79, 0], [0.79, 0], [0.79, 1.7], [0.52, 2.5], [0.26, 4.67], [-0.26, 4.67], [-0.52, 2.5], [-0.79, 1.7]], a: [QC.xe, QC.y, 0.64], b: [QC.xe + 1.04, QC.y, 0.64], ends: ['open', 'cap'] }], view: [QC.xw + 1.2, QC.y + 1.6, 0.6] },
      { id: 'qshafts', name: 'Queen’s Chamber shafts', stone: 'lime', thin: 1, dims: '63.6 m long (121 cubits), about 39.6°', far: 1,
        note: 'Two 20 cm shafts that never reach the outside. Each ends at a small stone door with copper pins about 62 m up; a second blocking stone sits behind the south door.',
        parts: [{ p: RECT(0.21, 0.21), a: [qx, QC.y + 1.6, QC.zs], b: [qx, QC.y + 1.6, QC.zs + 2], ends: ['open', 'open'] }, { p: RECT(0.21, 0.21), a: [qx, QC.y + 1.6, QC.zs + 2], b: [qx, QD.y, QD.dz], ends: ['open', 'cap'] }, { p: RECT(0.21, 0.21), a: [qx, QC.y + 1.6, QC.zn], b: [qx, QC.y + 1.6, QC.zn - 2], ends: ['open', 'open'] }, { p: RECT(0.21, 0.21), a: [qx, QC.y + 1.6, QC.zn - 2], b: [qx - 3.2, QD.y, -QD.dz], ends: ['open', 'cap'] }], view: [qx, QD.y, QD.dz - 1.5] },
      { id: 'gg', name: 'Grand Gallery', stone: 'lime', dims: '46.1 m of sloping floor (88 cubits), slope 26.28°',
        note: 'Corbelled hall 8.6 m high. Seven overhanging courses narrow it from 4 cubits at the floor to 2 at the roof.',
        parts: [{ p: GAL, a: [AX, GG0.y, GG0.z], b: [AX, GG0.y + (GGS - GG0.z) * M.tan(gA), GGS], ends: ['cap', 'cap'] }], view: [AX, GG0.y + 3, GG0.z + 4] },
      { id: 'well', name: 'Well shaft and grotto', stone: 'rough', thin: 1, dims: 'about 60 m in all', far: 1,
        note: 'Rough shaft dropping from the foot of the gallery through a natural grotto to the lower descending passage.',
        parts: [{ p: SQ(0.7), a: [AX - 1.4, GG0.y, GG0.z + 0.8], b: [AX - 1.4, 6.5, GG0.z + 0.8], ends: ['open', 'open'] }, { p: RECT(3.0, 1.6), a: [AX - 3.6, 4.9, GG0.z + 0.2], b: [AX - 0.6, 4.9, GG0.z + 0.2], ends: ['cap', 'cap'] }, { p: RECT(0.7, 0.75), a: [AX - 1.4, 5.0, GG0.z + 1.2], b: [AX - 1.0, -20.5, -24.0], ends: ['open', 'open'] }, { p: RECT(0.7, 0.75), a: [AX - 1.0, -20.5, -24.0], b: [AX - 0.5, DBOT.y + 3.5, DBOT.z - 7.5], ends: ['open', 'open'] }], view: [AX - 2, 5.7, GG0.z + 0.2] },
      { id: 'ante', name: 'Antechamber', stone: 'granite', dims: '2.95 × 1.65 × 3.8 m',
        note: 'Short passage and portcullis room between the Great Step and the King’s Chamber.',
        parts: [{ p: RECT(1.05, 1.11), a: [AX, KC.y, GGS], b: [AX, KC.y, GGS + 1.33], ends: ['door', 'open'] }, { p: RECT(1.65, 3.8), a: [AX, KC.y, GGS + 1.33], b: [AX, KC.y, GGS + 4.28], ends: ['cap', 'cap'] }, { p: RECT(1.05, 1.11), a: [AX, KC.y, GGS + 4.28], b: [AX, KC.y, KC.zn], ends: ['open', 'door'] }], view: [AX, KC.y + 1.5, GGS + 2.8] },
      { id: 'kc', name: 'King’s Chamber', stone: 'granite', dims: '10.47 × 5.235 × 5.84 m (20 × 10 × 5√5 cubits)', look: 250,
        note: 'Red granite room holding the lidless sarcophagus. Its floor sits at the height where the pyramid’s cross-section is half the base area.',
        parts: [{ p: RECT(5.235, KC.h), a: [KC.xw, KC.y, kcz], b: [KC.xe, KC.y, kcz], ends: ['cap', 'cap'] }], solid: [{ min: [KC.xw + 1.2, KC.y, KC.zn + 2.0], max: [KC.xw + 2.18, KC.y + 1.05, KC.zn + 4.28] }], view: [KC.xe - 1.5, KC.y + 1.6, KC.zn + 1.2] },
      { id: 'kshafts', name: 'King’s Chamber shafts', stone: 'lime', thin: 1, dims: 'north 32.47° (7:11), south 45° (1:1)', far: 1,
        note: 'Two 20 cm shafts that run all the way to the outer faces, exiting about 80 m up.',
        parts: [{ p: RECT(0.21, 0.21), a: [kx, KC.y + 1.0, KC.zn], b: [kx, kN.y0, kN.z0], ends: ['open', 'open'] }, { p: RECT(0.21, 0.21), a: [kx, kN.y0, kN.z0], b: [kx, kN.y, kN.z], ends: ['open', 'open'] }, { p: RECT(0.21, 0.21), a: [kx, KC.y + 1.0, KC.zs], b: [kx, kS.y0, kS.z0], ends: ['open', 'open'] }, { p: RECT(0.21, 0.21), a: [kx, kS.y0, kS.z0], b: [kx, kS.y, kS.z], ends: ['open', 'open'] }], view: [kx, kS.y - 1, kS.z - 3] },
      { id: 'relief', name: 'Relieving chambers', stone: 'granite', dims: 'stack tops out about 64.4 m above the base', look: 265,
        note: 'Five low compartments stacked above the King’s Chamber. The top one, Campbell’s, has a gabled limestone roof and carries Khufu’s name in builders’ paint.',
        parts: [0, 1, 2, 3].map(function (i) { var y = 49.9 + i * 2.6; return { p: RECT(5.235, 1.0), a: [KC.xw, y, kcz], b: [KC.xe + 0.8, y, kcz], ends: ['cap', 'cap'] }; }).concat([{ p: GABLE(5.235, 0.9, 4.1), a: [KC.xw, 60.3, kcz], b: [KC.xe + 0.8, 60.3, kcz], ends: ['cap', 'cap'] }]), view: [KC.xe - 1, 61.2, 11] }
    ];
    var cands = [
      { id: 'C1', name: 'Big Void', cls: 'detected', score: 5, where: 'Above the Grand Gallery, roughly 50–68 m above the base', far: 1,
        basis: 'Seen independently by three muon detector types (Nature, 2017): at least 30 m long with a cross-section like the Grand Gallery. Its tilt is unresolved. Drawn here on the line the North Face Corridor would follow at the 1:2 passage slope.',
        parts: [{ p: RECT(2.1, 8.0), a: [AX, nfc(-32), -32], b: [AX, nfc(-2), -2], ends: ['cap', 'cap'] }], view: [AX, nfc(-17) + 4, -17] },
      { id: 'C2', name: 'Cells behind the Queen’s shaft doors', cls: 'detected', score: 4, where: 'South and north, about 62 m up, 14 m short of the faces',
        basis: 'Robots filmed a small space with red ochre marks behind the south door and a second blocking stone beyond it. Both shafts were built to the same length (121 cubits, written on the wall) and stop at the same height, within 5 cubits of the third rung of the level ladder. Nobody has seen past the second stone.',
        parts: [{ p: RECT(2.1, 2.1), a: [qx, QD.y - 0.9, QD.dz + 0.4], b: [qx, QD.y - 0.9, QD.dz + 3.0], ends: ['cap', 'cap'] }, { p: RECT(2.1, 2.1), a: [qx - 3.2, QD.y - 0.9, -QD.dz - 0.4], b: [qx - 3.2, QD.y - 0.9, -QD.dz - 3.0], ends: ['cap', 'cap'] }], view: [qx, QD.y, QD.dz + 1.5] },
      { id: 'C3', name: 'North-east edge cavity', cls: 'detected', score: 3, where: 'On the north-east edge, around 105 m up',
        basis: 'Muon telescopes outside the pyramid (2016) reported a cavity on this edge similar in size to the known notch cave at 83 m. It fits ideas of corner turning rooms on an internal ramp, but it could be a gap in the core masonry.',
        parts: [{ p: RECT(3, 3), a: [BH * (1 - 105 / H) - 5, 103.5, -(BH * (1 - 105 / H) - 5)], b: [BH * (1 - 105 / H) - 2, 103.5, -(BH * (1 - 105 / H) - 2)], ends: ['cap', 'cap'] }], view: [BH * (1 - 105 / H) - 3.5, 105, -(BH * (1 - 105 / H) - 3.5)] },
      { id: 'C4', name: 'Rising link from the North Face Corridor', cls: 'pattern', score: 3, where: 'From the corridor’s south end up toward the Big Void', far: 1,
        basis: 'Every built passage in the pyramid slopes at 1:2. A 1:2 line from the corridor’s south end climbs straight into the Big Void zone and crosses the center plane at 64.5 m, the third rung of the level ladder. The corridor floor height is only known to ±3 m, so the crossing is 62–68 m.',
        parts: [{ p: RECT(1.05, 1.2), a: [AX, NFC.y, NFC.z1], b: [AX, nfc(-32), -32], ends: ['cap', 'cap'] }], view: [AX, nfc(-60) + 0.6, -60] },
      { id: 'C5', name: 'Third chamber on the center plane', cls: 'pattern', score: 3, where: '123 cubits (64.4 m) up, on the east–west center plane',
        basis: 'The Queen’s floor is at 41 cubits and the King’s at 82. The next rung, 123 cubits, is where three things converge: the top of the relieving stack (64.4 m), the 1:2 line from the North Face Corridor (64.5 m) and the south end of the Big Void. Drawn as a 20 × 10 cubit room like the King’s Chamber.',
        parts: [{ p: RECT(5.235, 5.84), a: [KC.xw, L3, 0], b: [KC.xe, L3, 0], ends: ['cap', 'cap'] }], view: [KC.xe - 1.5, L3 + 1.6, 0] },
      { id: 'C6', name: 'Corridor under the Queen’s passage', cls: 'pattern', score: 2, where: 'Beneath the step in the horizontal passage, 3–8 m north of the Queen’s Chamber',
        basis: 'The passage floor drops one cubit for no structural reason exactly 10.5 cubits before the chamber, and the south wall to step distance (20.5 cubits) repeats the King’s Chamber to antechamber distance. Dormion and Verd’hurt reported radar reflections below this floor in 2000. Not verified by excavation or muons.',
        parts: [{ p: RECT(1.05, 2.6), a: [AX, QC.y - 3.4, QC.zn - 8.5], b: [AX, QC.y - 3.4, QC.zn - 2.5], ends: ['cap', 'cap'] }], view: [AX, QC.y - 2.2, QC.zn - 5.5] },
      { id: 'C7', name: 'Room beyond the blind south passage', cls: 'pattern', score: 2, where: '30 m underground, 26 m south of the center',
        basis: 'A finished 16 m passage leads south from the subterranean chamber and stops at a bare rock face. Passages elsewhere in the pyramid always lead somewhere. The simplest reading is abandoned work, so any room here was planned and probably never cut.',
        parts: [{ p: RECT(5.2, 3.0), a: [AX - 4, SUB.y - 0.4, SUB.zs + 19], b: [AX + 2, SUB.y - 0.4, SUB.zs + 19], ends: ['cap', 'cap'] }], view: [AX - 1, SUB.y + 1, SUB.zs + 19] },
      { id: 'C8', name: 'Mirror passage system on the west', cls: 'pattern', score: 1, where: '14 cubits west of the center, mirroring the known passages', far: 1,
        basis: 'Every known passage lies in one plane 14 cubits east of the center, which leaves the west side empty. Symmetry suggests a twin. Against it: the muon detectors in the Queen’s Chamber looked straight up through this region and reported no second gallery.',
        parts: [{ p: RECT(2.06, 8.6), a: [-AX, GG0.y, GG0.z], b: [-AX, GG0.y + (GGS - GG0.z) * M.tan(gA), GGS], ends: ['cap', 'cap'] }], view: [-AX, 34, -18] },
      { id: 'C9', name: 'Fourth rung of the level ladder', cls: 'pattern', score: 1, where: '164 cubits (85.9 m) up, on the central axis',
        basis: 'Pure extrapolation of the 41-cubit ladder, included to show where the rule stops working. The nearest known features miss it: the King’s shafts leave the faces at 154 cubits and the north-east notch cave sits at about 159. Nothing has been detected here.',
        parts: [{ p: RECT(3, 3), a: [AX - 1.5, 164 * CUBIT, 0], b: [AX + 1.5, 164 * CUBIT, 0], ends: ['cap', 'cap'] }], view: [AX, 164 * CUBIT + 1.5, 0] }
    ];
    function patterns() {
      var c = function (m) { return m / CUBIT; }, hA = 280 * (1 - M.SQRT1_2), hV = 280 * (1 - M.pow(0.5, 1 / 3));
      var dims = dimRows([['Base side', 230.36, 440], ['Height (original)', 146.6, 280], ['King’s Chamber length', 10.47, 20], ['King’s Chamber width', 5.235, 10], ['King’s Chamber height', 5.84, 5 * M.sqrt(5), '5√5'],
        ['Queen’s Chamber east–west', 5.76, 11], ['Queen’s Chamber north–south', 5.23, 10], ['Queen’s Chamber wall height', 4.69, 9], ['Queen’s Chamber apex height', 6.23, 12],
        ['Subterranean chamber east–west', 14.05, 27], ['Subterranean chamber north–south', 8.26, 16], ['Grand Gallery sloping floor', 46.11, 88], ['Grand Gallery floor width', 2.06, 4], ['Grand Gallery roof width', 1.04, 2],
        ['Passage width', 1.05, 2], ['Ascending passage length', 39.29, 75], ['Queen’s shaft length', 63.6, 121], ['Passage plane east of center', AX, 14]]);
      var lev = [['Subterranean passage floor', SUB.y, -hV, 'mirror of the half-volume height'], ['Queen’s Chamber floor', QC.y, 41, 'rung 1 (half of 82)'], ['Grand Gallery foot', GG0.y, 41, 'rung 1'], ['King’s Chamber floor', KC.y, hA, 'rung 2, half-area height'], ['Queen’s shaft doors', QD.y, 123, 'rung 3'], ['Top of relieving chambers', 64.4, 123, 'rung 3'], ['King’s shaft outlets', (kN.y + kS.y) / 2, 164, 'rung 4']];
      var el = [], cov = 0, y, k;
      [1 / 2, 1 / 3, 2 / 3, 1 / 4, 3 / 4, 1 / 5].forEach(function (fr) { el.push(280 * fr, 280 * (1 - M.sqrt(fr)), 280 * (1 - M.pow(fr, 1 / 3))); });
      el.push(280 / 1.6180339887, 280 / M.PI, 280 / 2.6180339887);
      for (y = 0; y < 280; y += 0.01) for (k = 0; k < el.length; k++) if (M.abs(y - el[k]) <= 0.5) { cov += 0.01; break; }
      var pHit = cov / 280;
      return [
        { h: 'One unit, whole numbers', html: '<p>Nearly every dimension is a whole number of royal cubits (0.5236 m). Across these ' + dims.length + ' dimensions the typical misfit is ' + f(rms(dims), 1) + '%.</p>' + dimTable(dims) },
        { h: 'Face slope: 14 up for 11 in', html: '<p>Height 280 over half-base 220 is 14:11, a seked of 5½ palms, giving ' + f(M.atan(14 / 11) / rad) + '°. The famous π relation follows from it automatically: perimeter ÷ (2 × height) = 22/7 = 3.1429.</p>' },
        { h: 'Passage slope: 1 up for 2 along', html: '<p>All three sloping passages aim at 26.57°. The shafts use other whole-number ratios.</p>' + slopeTable([['Descending passage', 26.52, 0.5, '1:2'], ['Ascending passage', 26.03, 0.5, '1:2'], ['Grand Gallery', 26.28, 0.5, '1:2'], ['King’s north shaft', 32.47, 7 / 11, '7:11'], ['King’s south shaft', 45, 1, '1:1'], ['Queen’s shafts (mean)', 39.35, 9 / 11, '9:11']]) },
        { h: 'Two reference planes', html: '<p>Every passage lies in one north–south plane 14 cubits east of the center. The east–west center plane is marked twice: by the ridge of the Queen’s Chamber roof and by the face of the Great Step, which this model places ' + f(M.abs(STEP.z) * 100, 0) + ' cm from it using Petrie’s lengths and angles alone.</p>' },
        { h: 'A ladder of levels, 41 cubits apart', html: '<p>The King’s floor sits where the pyramid’s horizontal cross-section is exactly half the base area: 280 × (1 − 1/√2) = ' + f(hA) + ' cubits. The Queen’s level is half of that. The subterranean floor mirrors the half-volume height (' + f(hV) + ' cubits) below ground.</p><div class="px-tw"><table><tr><th>Level</th><th class="n">m</th><th class="n">cubits</th><th class="n">aim</th><th class="n">off</th></tr>' + lev.map(function (d) { var cu = c(d[1]), df = cu - d[2]; return '<tr><td>' + esc(d[0]) + '<br><span class="px-nt">' + d[3] + '</span></td><td class="n">' + f(d[1]) + '</td><td class="n">' + f(cu, 1) + '</td><td class="n">' + f(d[2], 1) + '</td><td class="n ' + (M.abs(df) <= 0.6 ? 'ok' : 'off') + '">' + sg(df, 1) + '</td></tr>'; }).join('') + '</table></div><p>The ladder holds for rungs 1 to 3 and fails at rung 4. The top of the relieving stack is only known to about a meter, so its perfect fit is partly luck.</p>' },
        { h: 'King’s Chamber: 3-4-5', html: '<p>With sides of 20 and 10 cubits and a height of 5√5 (11.18, surveyed ' + f(c(5.84)) + '), the end-wall diagonal is 15 and the room’s long diagonal is 25. Together with the 20-cubit length they form a 15-20-25 triangle.</p>' },
        { h: 'Chance check', html: '<p>Patterns are easy to find in any large set of numbers. Of ' + el.length + ' heights that would look elegant (simple fractions of the height, cross-section area and volume, plus π and φ ratios), a random level lands within half a cubit of one ' + f(pHit * 100, 0) + '% of the time, so among 8 levels about ' + f(pHit * 8, 1) + ' matches are expected by luck alone.</p><p>That makes any single match weak evidence. The cubit grid, the 1:2 slope and the center plane are strong because each is one rule fitting many independent measurements.</p>' }
      ];
    }
    P.push({ id: 'khufu', name: 'Great Pyramid', king: 'Khufu', when: 'about 2560 BC', site: 'Giza', levels: pyr(BH, H), band: 0.7, home: 400,
      today: 'Shown with its original casing, 146.6 m high. Today it stands 138.5 m with the casing gone.',
      spaces: spaces, cands: cands, patterns: patterns,
      candNote: 'Zahi Hawass said in November 2025 that scans had found a 30 m corridor ending at a sealed door, to be presented in 2026. No published survey of it was found, so it is not drawn separately. It would be consistent with C1 or C4.',
      uncertain: ['The well shaft, grotto and robbers’ tunnel are rough-cut and only roughly placed.', 'The relieving chambers and the North Face Corridor are placed to about a meter.', 'The Big Void’s tilt and exact height are unknown.'],
      sources: 'Petrie, The Pyramids and Temples of Gizeh (1883); Morishima et al., Nature 552 (2017); Procureur et al., Nature Communications 14 (2023); the Djedi and Upuaut shaft surveys.' });
  })();

  /* ================================================================== Khafre */
  (function () {
    var BH = 107.625, H = 143.5, AX = 12.45, yH = -3.5, uA = 25.92 * rad, lA = 21.67 * rad;
    var UE = { y: 11.54, z: -(BH - 11.54 * 3 / 4) }, uLen = (UE.y - yH) / M.sin(uA), UB = { z: UE.z + uLen * M.cos(uA) };
    var LE = { z: -(BH + 3) }, lLen = 34, LB = { y: -lLen * M.sin(lA), z: LE.z + lLen * M.cos(lA) }, LH = LB.z + 16, rise = (yH - LB.y) / M.tan(lA), JN = LH + rise;
    var BC = { zn: -1.5, zs: 3.5, xe: AX + 0.55, y: -5.2 }; BC.xw = BC.xe - 14.15;
    var sy = LB.y - 0.65, sz = LB.z + 8, hA = H * (1 - M.SQRT1_2);
    var spaces = [
      { id: 'upper', name: 'Upper entrance and passage', short: 'Upper entrance', stone: 'granite', dims: 'opens 11.54 m up; slope about 25.9°', far: 1,
        note: 'Granite-lined passage from the north face down into the bedrock, then level all the way to the burial chamber.',
        parts: [{ p: RECT(1.05, 1.2), a: [AX, UE.y, UE.z], b: [AX, yH, UB.z], ends: ['door', 'open'] }, { p: RECT(1.05, 1.8), a: [AX, yH, UB.z], b: [AX, yH, BC.zn], ends: ['open', 'door'] }], view: [AX, UE.y + 0.6, UE.z + 3] },
      { id: 'lower', name: 'Lower entrance and passage', short: 'Lower entrance', stone: 'rock', dims: 'opens in the pavement; slope about 21.7°', far: 1,
        note: 'A second way in, cut entirely in rock. It dips, runs level, then climbs to join the upper passage. It may be left from an earlier plan with the pyramid further north.',
        parts: [{ p: RECT(1.05, 1.2), a: [AX, 0, LE.z], b: [AX, LB.y, LB.z], ends: ['door', 'open'] }, { p: RECT(1.05, 1.8), a: [AX, LB.y, LB.z], b: [AX, LB.y, LH], ends: ['open', 'open'] }, { p: RECT(1.05, 1.2), a: [AX, LB.y, LH], b: [AX, yH, JN], ends: ['open', 'open'] }], view: [AX, LB.y + 0.9, LB.z + 6] },
      { id: 'side', name: 'Subsidiary chamber', stone: 'rock', dims: '10.41 × 3.12 m (20 × 6 cubits), gabled, 2.61 m high', look: 270,
        note: 'Rock-cut room west of the lower passage, the same length as the King’s Chamber in the Great Pyramid. Perhaps a store or statue room.',
        parts: [{ p: RECT(1.05, 1.2), a: [AX, LB.y, sz], b: [AX - 4, sy, sz], ends: ['door', 'door'] }, { p: GABLE(3.12, 1.83, 2.61), a: [AX - 4 - 10.41, sy, sz], b: [AX - 4, sy, sz], ends: ['cap', 'cap'] }], view: [AX - 6, sy + 1.3, sz] },
      { id: 'burial', name: 'Burial chamber', stone: 'rock', dims: '14.15 × 5.0 m (27 × 9½ cubits), 6.83 m to the apex', look: 270,
        note: 'Cut down into the bedrock and roofed with limestone gables at base level. The black granite sarcophagus is sunk into the floor at the west end.',
        parts: [{ p: GABLE(5.0, 5.2, 6.83), a: [BC.xw, BC.y, 1], b: [BC.xe, BC.y, 1], ends: ['cap', 'cap'] }], solid: [{ min: [BC.xw + 1.0, BC.y, 0.6], max: [BC.xw + 3.6, BC.y + 0.35, 1.7] }], view: [BC.xe - 2, BC.y + 1.6, 1] }
    ];
    var cands = [
      { id: 'F1', name: 'East twin of the subsidiary chamber', cls: 'pattern', score: 2, where: 'East of the lower passage, opposite the known side room',
        basis: 'The lower passage has a finished room on its west side and a large empty alcove of unknown purpose on its east side. Egyptian plans usually pair such rooms. The alcove may only have been turning space for the portcullis and the sarcophagus.',
        parts: [{ p: GABLE(3.12, 1.83, 2.61), a: [AX + 4, sy, sz], b: [AX + 4 + 10.41, sy, sz], ends: ['cap', 'cap'] }], view: [AX + 9, sy + 1.3, sz] },
      { id: 'F2', name: 'Chamber in the masonry', cls: 'pattern', score: 1, where: 'On the axis at the half-area height, 42 m up',
        basis: 'Khufu’s pyramid and all three of Sneferu’s have rooms in or reaching into the body. Khafre’s 2.2 million cubic meters have none known. Against it: Luis Alvarez’s muon survey of 1968–69 looked up from the burial chamber through about a fifth of the volume and found no chamber.',
        parts: [{ p: RECT(5.235, 5.84), a: [-5.2, hA, 0], b: [5.2, hA, 0], ends: ['cap', 'cap'] }], view: [0, hA + 1.6, 0] },
      { id: 'F3', name: 'Deep structures claimed from radar satellites', cls: 'disputed', score: 1, where: 'Below the pyramid, to depths of hundreds of meters', far: 1,
        basis: 'In 2025 a team led by Corrado Malanga and Filippo Biondi announced shafts and chambers far below Khafre from satellite radar. The method cannot image solid rock at that depth by accepted physics, the work is not peer reviewed, and Egyptologists and radar specialists reject it. Drawn only so you can see what is being claimed.',
        parts: [{ p: SQ(8), a: [0, -34, 0], b: [0, -150, 0], ends: ['cap', 'cap'] }], view: [0, -60, 0] }
    ];
    P.push({ id: 'khafre', name: 'Pyramid of Khafre', king: 'Khafre', when: 'about 2530 BC', site: 'Giza', levels: pyr(BH, H), band: 0.7, home: 380,
      today: 'Shown as built, 143.5 m high. Today it stands 136.4 m and still keeps casing stones near the top.',
      spaces: spaces, cands: cands,
      patterns: function () {
        return stdPatterns({ dimLead: 'The chambers fit the cubit well. The base is 411 cubits by Petrie’s survey, though 410 is often quoted.',
          dims: [['Base side', 215.25, 411], ['Height (original)', 143.5, 274], ['Burial chamber east–west', 14.15, 27], ['Burial chamber north–south', 5.0, 9.5, '9½'], ['Burial chamber height', 6.83, 13], ['Subsidiary chamber length', 10.41, 20], ['Subsidiary chamber width', 3.12, 6], ['Subsidiary chamber height', 2.61, 5], ['Passage width', 1.05, 2]],
          slopeLead: 'The face is the 3-4-5 triangle: 4 up for 3 in, a seked of 5¼ palms. The upper passage is close to the 1:2 slope of Khufu’s passages; the lower one is nearer 2:5.',
          slopes: [['Face', 53.17, 4 / 3, '4:3'], ['Upper passage', 25.92, 0.5, '1:2'], ['Lower passage', 21.67, 0.4, '2:5']],
          extra: [{ h: 'The 27-cubit room', html: '<p>The burial chamber is 27 cubits long. So is the subterranean chamber of the Great Pyramid, and so is the antechamber of Menkaure’s pyramid. The side room repeats the 20-cubit length of Khufu’s King’s Chamber. The three Giza kings seem to have reused a small set of room lengths.</p>' },
            { h: 'Two entrances on one line', html: '<p>Both passages lie in one plane about 12 m (24 cubits) east of the center. The lower entrance sits outside the base, which is why many think the pyramid was first planned about 30 m further north.</p>' }] });
      },
      uncertain: ['Chamber positions are good to a few meters; the lengths of the passages are fitted to close the plan.', 'The alcove opposite the subsidiary chamber and the portcullises are not drawn.'],
      sources: 'Petrie (1883); Maragioglio and Rinaldi, L’architettura delle piramidi menfite V; Lehner, The Complete Pyramids (1997); Alvarez et al., Science 167 (1970).' });
  })();

  /* ================================================================== Menkaure */
  (function () {
    var BH = 100 * CUBIT, H = 125 * CUBIT, dA = 26.03 * rad, EN = { y: 4.0 }; EN.z = -(BH - EN.y * 4 / 5);
    var len = 31, B = { y: EN.y - len * M.sin(dA), z: EN.z + len * M.cos(dA) }, pz = B.z + 3.63, az = pz + 12.6, ay = B.y - 0.4;
    var AN = { zn: az, zs: az + 3.84, xe: 5.0, xw: -9.2 }, by = ay - 5.6, hA = H * (1 - M.SQRT1_2);
    var hx6 = BH - 6 * 4 / 5;
    var spaces = [
      { id: 'entrance', name: 'Entrance and descending passage', short: 'Entrance', stone: 'granite', dims: 'opens 4 m up; slope 26.03°, length 31 m', far: 1,
        note: 'Lined with granite where it passes through the masonry, then cut in rock.',
        parts: [{ p: RECT(1.05, 1.2), a: [0, EN.y, EN.z], b: [0, B.y, B.z], ends: ['door', 'door'] }], view: [0, EN.y + 0.6, EN.z + 3] },
      { id: 'panel', name: 'Panelled chamber', stone: 'rock', dims: '3.63 × 3.16 m (7 × 6 cubits)',
        note: 'A small room whose walls are carved with a palace-facade pattern, the first decoration inside a pyramid since Djoser.',
        parts: [{ p: RECT(3.16, 2.4), a: [0, B.y, B.z], b: [0, B.y, pz], ends: ['cap', 'cap'] }, { p: RECT(1.05, 1.8), a: [0, B.y, pz], b: [0, B.y, az], ends: ['door', 'door'] }], view: [0, B.y + 1.4, B.z + 1.8] },
      { id: 'ante', name: 'Antechamber', stone: 'rock', dims: '14.2 × 3.84 m (27 × 7⅓ cubits), 4.87 m high', look: 270,
        note: 'The long east–west room under the center of the pyramid. Probably the burial chamber of a smaller first design.',
        parts: [{ p: RECT(3.84, 4.87), a: [AN.xw, ay, (AN.zn + AN.zs) / 2], b: [AN.xe, ay, (AN.zn + AN.zs) / 2], ends: ['cap', 'cap'] }], view: [AN.xe - 2, ay + 1.6, (AN.zn + AN.zs) / 2] },
      { id: 'upper', name: 'Upper passage', stone: 'rock', dims: 'ends blind in the masonry',
        note: 'Opens high in the antechamber’s north wall and climbs north until it meets the masonry. It was the entrance of the first design, cut off when the pyramid was enlarged.',
        parts: [{ p: RECT(1.05, 1.2), a: [0, ay + 3.2, AN.zn], b: [0, ay + 3.2, AN.zn - 5], ends: ['door', 'open'] }, { p: RECT(1.05, 1.2), a: [0, ay + 3.2, AN.zn - 5], b: [0, -0.8, AN.zn - 5 - (ay + 3.2 + 0.8) / -M.tan(dA)], ends: ['open', 'cap'] }], view: [0, ay + 4, AN.zn - 4] },
      { id: 'ramp', name: 'Ramp to the burial chamber', short: 'Ramp', stone: 'granite', dims: 'drops about 5.6 m to the west',
        note: 'A granite-lined ramp sunk through the antechamber floor.',
        parts: [{ p: RECT(1.05, 1.5), a: [-1.5, ay, (AN.zn + AN.zs) / 2], b: [-9.6, by, (AN.zn + AN.zs) / 2], ends: ['door', 'open'] }, { p: RECT(1.05, 1.8), a: [-9.6, by, (AN.zn + AN.zs) / 2], b: [-11.2, by, (AN.zn + AN.zs) / 2], ends: ['open', 'door'] }], view: [-6, (ay + by) / 2 + 0.8, (AN.zn + AN.zs) / 2] },
      { id: 'cellar', name: 'Room with six niches', stone: 'rock', dims: 'about 5.3 × 1.9 m',
        note: 'Reached by a stair from the ramp. Four deep niches on the east and two on the north, perhaps for canopic jars and crowns.',
        parts: [{ p: RECT(1.9, 2.1), a: [-8.6, by, AN.zn - 0.2], b: [-8.6, by, AN.zn - 5.5], ends: ['door', 'cap'] }], view: [-8.6, by + 1.3, AN.zn - 3] },
      { id: 'burial', name: 'Burial chamber', stone: 'granite', dims: '6.59 × 2.62 m (12½ × 5 cubits), 3.43 m high', look: 180,
        note: 'Lined entirely in granite, with a roof of gabled slabs carved underneath into a barrel vault. Its basalt sarcophagus was lost at sea in 1838.',
        parts: [{ p: GABLE(2.62, 2.5, 3.43), a: [-12.5, by, AN.zn - 0.9], b: [-12.5, by, AN.zn - 0.9 + 6.59], ends: ['cap', 'cap'] }], view: [-12.5, by + 1.5, AN.zn + 0.6] }
    ];
    var cands = [
      { id: 'N1', name: 'Voids behind the east face', cls: 'detected', score: 4, where: 'Just behind the polished granite on the east face',
        basis: 'Radar, ultrasound and electrical resistivity (Cairo University and TU Munich, NDT&E International, 2025) found two air-filled anomalies 1.4 m and 1.13 m behind a patch of unusually smooth granite, about 1.5 × 1 m and 0.9 × 0.7 m. Their height on the face is drawn by eye.',
        parts: [{ p: RECT(1.5, 1.0), a: [hx6 - 1.4, 5.2, -1.4], b: [hx6 - 2.6, 5.2, -1.4], ends: ['cap', 'cap'] }, { p: RECT(0.9, 0.7), a: [hx6 - 1.13, 6.6, 1.3], b: [hx6 - 2.0, 6.6, 1.3], ends: ['cap', 'cap'] }], view: [hx6 - 2, 6, 0] },
      { id: 'N2', name: 'Eastern entrance corridor', cls: 'pattern', score: 3, where: 'From the east face toward the chambers', far: 1,
        basis: 'The smooth granite patch on the east face, 4 m high and 6 m wide, looks like the dressed granite around the north entrance (Stijn van den Hoven, 2019). If the two voids mark a second entrance, a passage at the builders’ usual slope would run down toward the antechamber. No corridor has been detected yet.',
        parts: [{ p: RECT(1.05, 1.2), a: [hx6 - 2.6, 5.0, 0], b: [AN.xe + 1.5, ay + 3.2, 0], ends: ['cap', 'cap'] }], view: [25, 0, 0] },
      { id: 'N3', name: 'Chamber in the masonry', cls: 'pattern', score: 1, where: 'On the axis at the half-area height, 19 m up',
        basis: 'Menkaure’s rooms are all in the rock. By the pattern of Khufu’s pyramid a room could sit where the cross-section is half the base. Nothing supports this beyond the analogy, and the two later Giza kings both kept their chambers low.',
        parts: [{ p: RECT(2.62, 3.4), a: [-3.3, hA, 0], b: [3.3, hA, 0], ends: ['cap', 'cap'] }], view: [0, hA + 1.5, 0] }
    ];
    P.push({ id: 'menkaure', name: 'Pyramid of Menkaure', king: 'Menkaure', when: 'about 2500 BC', site: 'Giza', levels: pyr(BH, H), band: 0.7, home: 190,
      today: 'Shown as designed, 65.5 m high. Today it is about 61 m; the lowest 16 courses were cased in red granite.',
      spaces: spaces, cands: cands,
      patterns: function () {
        return stdPatterns({ dimLead: 'The plan is 200 cubits square and 125 high. The rooms are less tidy than Khufu’s, partly because they were recut when the design grew.',
          dims: [['Base side', 104.6, 200], ['Height (original)', 65.5, 125], ['Antechamber east–west', 14.2, 27], ['Antechamber north–south', 3.84, 7 + 1 / 3, '7⅓'], ['Burial chamber length', 6.59, 12.5, '12½'], ['Burial chamber width', 2.62, 5], ['Panelled chamber length', 3.63, 7], ['Panelled chamber width', 3.16, 6], ['Passage width', 1.05, 2]],
          slopeLead: 'The face rises 5 for every 4 in, a seked of 5⅗ palms. The descending passage has exactly the angle of Khufu’s ascending passage.',
          slopes: [['Face', 51.34, 5 / 4, '5:4'], ['Descending passage', 26.03, 0.5, '1:2']],
          extra: [{ h: 'The 27-cubit room again', html: '<p>The antechamber is 27 cubits long, like Khafre’s burial chamber and Khufu’s subterranean chamber. In all three pyramids this long room lies east–west under the center.</p>' },
            { h: 'A design that grew', html: '<p>The blind upper passage shows the first pyramid was smaller, with its entrance where that passage meets the masonry. Any hidden corridor should fit one of the two designs, which is one reason the east-face voids are interesting: they belong to the final casing.</p>' }] });
      },
      uncertain: ['The chambers are placed from published plans to a few meters. The passage plane is drawn on the center line.', 'The height of the east-face voids is not given in the summaries used here.'],
      sources: 'Vyse and Perring (1837–40); Maragioglio and Rinaldi VI; Lehner (1997); Helal, Pugacheva et al., NDT&E International (2025).' });
  })();

  /* ================================================================== Meidum */
  (function () {
    var BH = 137.5 * CUBIT, H = 175 * CUBIT, EN = { y: 18.5 }; EN.z = -(BH - EN.y * 11 / 14);
    var yh = -7.8, zh0 = -11.6, zh1 = -2.15, cy = yh + 6.65;
    var spaces = [
      { id: 'entrance', name: 'Entrance and descending passage', short: 'Entrance', stone: 'lime', dims: 'opens 18.5 m up; about 57 m at 27½° to 30½°', far: 1,
        note: 'The first pyramid entrance placed high on the north face. The passage steepens slightly twice on the way down.',
        parts: [{ p: RECT(0.84, 1.65), a: [0, EN.y, EN.z], b: [0, yh, zh0], ends: ['door', 'open'] }], view: [0, EN.y + 0.8, EN.z + 3] },
      { id: 'hall', name: 'Horizontal passage and niches', short: 'Niches', stone: 'rock', dims: '9.45 m long, with two side rooms about 2.6 × 2.2 m',
        note: 'Level passage just below ground with a small room on each side, perhaps to park the blocking stones.',
        parts: [{ p: RECT(0.84, 1.75), a: [0, yh, zh0], b: [0, yh, zh1], ends: ['open', 'cap'] }, { p: RECT(2.2, 1.75), a: [0.42, yh, zh0 + 2.4], b: [3.0, yh, zh0 + 2.4], ends: ['open', 'cap'] }, { p: RECT(2.2, 1.75), a: [-0.42, yh, zh0 + 6.2], b: [-3.0, yh, zh0 + 6.2], ends: ['open', 'cap'] }], view: [0, yh + 1.1, zh0 + 4] },
      { id: 'relief', name: 'Relieving spaces', stone: 'lime', dims: 'found in 1998–2000',
        note: 'Small corbelled voids built over the niches and the foot of the descending passage to keep weight off their flat ceilings. Gilles Dormion and Jean-Yves Verd’hurt found them with an endoscope.',
        parts: [{ p: CORBEL(2.2, 2.2, 0.4, 4, 0.5), a: [0.42, yh + 2.9, zh0 + 2.4], b: [3.0, yh + 2.9, zh0 + 2.4], ends: ['cap', 'cap'] }, { p: CORBEL(2.2, 2.2, 0.4, 4, 0.5), a: [-0.42, yh + 2.9, zh0 + 6.2], b: [-3.0, yh + 2.9, zh0 + 6.2], ends: ['cap', 'cap'] }, { p: CORBEL(0.84, 1.8, 0.3, 3, 0.3), a: [0, yh + 3.2, zh0 - 4], b: [0, yh + 3.2, zh0 + 0.5], ends: ['cap', 'cap'] }], view: [1.7, yh + 3.8, zh0 + 2.4] },
      { id: 'shaft', name: 'Vertical shaft', stone: 'lime', thin: 1, dims: '6.65 m up into the chamber floor',
        note: 'The only way into the burial chamber: a well rising through its floor. Cedar beams still span it.',
        parts: [{ p: SQ(0.85, 1.15), a: [0, yh + 1.75, zh1 - 0.6], b: [0, cy, zh1 - 0.6], ends: ['open', 'door'] }], view: [0, yh + 3, zh1 - 0.6] },
      { id: 'burial', name: 'Burial chamber', stone: 'lime', dims: '5.9 × 2.65 m (11¼ × 5 cubits), 5.05 m high', look: 180,
        note: 'The first corbelled stone vault in Egypt, at ground level on the pyramid’s axis. The walls were never smoothed and no sarcophagus was found.',
        parts: [{ p: CORBEL(2.65, 5.05, 1.2, 7, 0.4), a: [0, cy, -2.95], b: [0, cy, 2.95], ends: ['cap', 'cap'] }], view: [0, cy + 1.5, -1.6] }
    ];
    var cands = [
      { id: 'D1', name: 'More hidden relieving spaces', cls: 'pattern', score: 3, where: 'Above flat ceilings along the descending passage',
        basis: 'Until 1998 nobody knew the builders had hidden corbelled voids above the niches and the lower passage. Only the lowest part of the passage ceiling has been probed. If the builders followed one rule, similar small voids sit above other flat-roofed stretches.',
        parts: [{ p: CORBEL(0.84, 1.8, 0.3, 3, 0.3), a: [0, yh + 6.2, zh0 - 9], b: [0, yh + 3.2 + 4.5 * 0.57, zh0 - 4.5], ends: ['cap', 'cap'] }], view: [0, yh + 6.5, zh0 - 6.5] },
      { id: 'D2', name: 'Upper chamber on the axis', cls: 'pattern', score: 1, where: 'On the axis, about 27 m up (half-area height)',
        basis: 'Sneferu’s next two pyramids put chambers higher in the body, ending with Khufu’s. Meidum was begun as a step pyramid and enlarged twice, and rooms could have been planned for a later stage. Nothing has been detected, and the unfinished burial chamber suggests the interior was abandoned early.',
        parts: [{ p: CORBEL(2.65, 5.05, 1.2, 7, 0.4), a: [0, H * (1 - M.SQRT1_2), -2.95], b: [0, H * (1 - M.SQRT1_2), 2.95], ends: ['cap', 'cap'] }], view: [0, H * (1 - M.SQRT1_2) + 1.5, 0] }
    ];
    P.push({ id: 'meidum', name: 'Pyramid of Meidum', king: 'Sneferu (perhaps begun for Huni)', when: 'about 2600 BC', site: 'Meidum', levels: pyr(BH, H), band: 0.6, home: 260,
      today: 'Shown as the true pyramid it was meant to be, 91.7 m high. The outer layers fell away long ago, leaving a three-stepped tower 65 m high.',
      spaces: spaces, cands: cands,
      patterns: function () {
        return stdPatterns({ dimLead: 'Meidum is a 5:8 scale model of the Great Pyramid built a generation earlier: 275 by 175 cubits against 440 by 280.',
          dims: [['Base side', 144.32, 275], ['Height (intended)', 91.65, 175], ['Burial chamber length', 5.9, 11.25, '11¼'], ['Burial chamber width', 2.65, 5], ['Horizontal passage length', 9.45, 18], ['Shaft height', 6.65, 12.75, '12¾'], ['Entrance above base', 18.5, 35]],
          slopeLead: 'The face slope is the same 14:11 that Khufu used. The passage is steeper than the later 1:2 standard.',
          slopes: [['Face', 51.84, 14 / 11, '14:11'], ['Descending passage (mean)', 28.9, 0.55, '11:20']],
          extra: [{ h: 'The first 14:11 pyramid', html: '<p>Height over half-base is 175 : 137.5 = 14 : 11, so the same π-like ratio of perimeter to height (44/7) appears here first. It comes from choosing a seked of 5½ palms, not from knowing π.</p>' }] });
      },
      uncertain: ['The passage length is fitted so the plan closes; published angles range from 27°36′ to 30°23′.', 'The relieving spaces are drawn schematically.', 'The three building stages (E1, E2, E3) are not shown.'],
      sources: 'Petrie, Medum (1892); Maragioglio and Rinaldi III; Lehner (1997); Dormion and Verd’hurt (2000); Supreme Council of Antiquities site notes.' });
  })();

  /* ================================================================== Bent */
  (function () {
    var BH = 94.72, yB = 90 * CUBIT, hB = BH - yB * 5 / 7, H = 200 * CUBIT;
    var NE = { y: 11.33 }; NE.z = -(BH - NE.y * 5 / 7);
    var nLen = 79.5, nA = 26.6 * rad, NB = { y: NE.y - nLen * M.sin(nA), z: NE.z + nLen * M.cos(nA) };
    var az1 = NB.z + 5.4, ly = NB.y + 6.25, lz1 = az1 + 6.3;
    var WE = { y: 32.76 }; WE.x = -(BH - WE.y * 5 / 7);
    var wLen = 67.66, wA = 26.5 * rad, WB = { y: WE.y - wLen * M.sin(wA), x: WE.x + wLen * M.cos(wA) }, wz = 4.0, ux0 = WB.x + 20.12;
    var spaces = [
      { id: 'north', name: 'North entrance and passage', short: 'North entrance', stone: 'lime', dims: 'opens 11.3 m up; 79.5 m long, about 26½°', far: 1,
        note: 'The longer of the two ways in. It leads to the lower rooms.',
        parts: [{ p: RECT(1.1, 1.1), a: [0, NE.y, NE.z], b: [0, NB.y, NB.z], ends: ['door', 'door'] }], view: [0, NE.y + 0.6, NE.z + 3] },
      { id: 'lante', name: 'Lower antechamber', stone: 'lime', dims: '5.4 × 1.1 m, corbelled, 12.6 m high',
        note: 'A tall narrow slot at the foot of the passage. A stair at its south end climbs to the lower chamber.',
        parts: [{ p: CORBEL(1.1, 12.6, 5.5, 8, 0.3), a: [0, NB.y, NB.z], b: [0, NB.y, az1], ends: ['cap', 'cap'] }], view: [0, NB.y + 1.5, NB.z + 1.5] },
      { id: 'lower', name: 'Lower chamber', stone: 'lime', dims: '6.3 × 4.96 m (12 × 9½ cubits), corbelled, 17.3 m high',
        note: 'Corbelled on all four sides: every course steps inward until the walls almost meet. The tallest room in any pyramid.',
        parts: [{ p: CORBEL(4.96, 17.3, 3.5, 15, 0.4), a: [0, ly, az1], b: [0, ly, lz1], ends: ['cap', 'cap'] }], view: [0, ly + 1.6, az1 + 1.5] },
      { id: 'chimney', name: 'The chimney', stone: 'lime', thin: 1, dims: 'about 15 m high, on the pyramid’s axis',
        note: 'A short passage from the lower chamber leads to a finely built vertical shaft that rises along the pyramid’s central axis and stops.',
        parts: [{ p: RECT(0.75, 1.0), a: [0, ly, lz1], b: [0, ly, -0.5], ends: ['door', 'open'] }, { p: SQ(1.0), a: [0, ly, 0], b: [0, ly + 15, 0], ends: ['cap', 'cap'] }], view: [0, ly + 7, 0] },
      { id: 'tunnel', name: 'Connecting tunnel', stone: 'rough', thin: 1, dims: 'rough-cut, from 12.6 m up the lower chamber’s south wall',
        note: 'A crooked tunnel hacked through the masonry to join the two systems. The builders made it themselves, after the upper passage had been blocked.',
        parts: [{ p: RECT(0.75, 0.9), a: [0.8, ly + 12.6, lz1], b: [2.5, WB.y - 2, 2.2], ends: ['door', 'open'] }, { p: RECT(0.75, 0.9), a: [2.5, WB.y - 2, 2.2], b: [WB.x + 12, WB.y, wz], ends: ['open', 'open'] }], view: [1.6, ly + 14, lz1 + 2] },
      { id: 'west', name: 'West entrance and passage', short: 'West entrance', stone: 'lime', dims: 'opens 32.8 m up the west face; 67.7 m down, then 20.1 m level', far: 1,
        note: 'The only west entrance of any Old Kingdom pyramid. Two sliding portcullis slabs closed the level stretch; one is still in place.',
        parts: [{ p: RECT(1.1, 1.1), a: [WE.x, WE.y, wz], b: [WB.x, WB.y, wz], ends: ['door', 'open'] }, { p: RECT(1.1, 1.6), a: [WB.x, WB.y, wz], b: [ux0, WB.y, wz], ends: ['open', 'door'] }], view: [WE.x + 3, WE.y + 0.6, wz] },
      { id: 'upper', name: 'Upper chamber', stone: 'lime', dims: '7.97 × 5.26 m (15¼ × 10 cubits), corbelled, 16.5 m high', look: 180,
        note: 'Still braced by cedar beams from Sneferu’s time, set there when cracks appeared. Its floor was raised with masonry.',
        parts: [{ p: CORBEL(5.26, 16.5, 4.0, 14, 0.5), a: [ux0 + 2.63, WB.y, wz - 1.5], b: [ux0 + 2.63, WB.y, wz - 1.5 + 7.97], ends: ['cap', 'cap'] }], view: [ux0 + 2.6, WB.y + 1.6, wz] }
    ];
    var cands = [
      { id: 'B1', name: 'Room at the top of the chimney', cls: 'pattern', score: 2, where: 'On the central axis, above the chimney',
        basis: 'The chimney is carefully built, stands exactly on the pyramid’s vertical axis and leads nowhere. An axis shaft in Meidum leads up into the burial chamber. Against it: the 2016 muon survey from the lower chamber showed the upper chamber clearly and no other room of that size in its field of view, so anything here would have to be small.',
        parts: [{ p: RECT(2.6, 2.6), a: [0, ly + 15.6, -1.5], b: [0, ly + 15.6, 1.5], ends: ['cap', 'cap'] }], view: [0, ly + 16.8, 0] },
      { id: 'B2', name: 'A third chamber', cls: 'pattern', score: 1, where: 'Higher on the axis, by analogy with the Red Pyramid',
        basis: 'Sneferu’s next pyramid has three rooms stepping upward; this one has two. Some Egyptologists have looked for the king’s true burial here. The same muon survey argues against any large room above the lower chamber.',
        parts: [{ p: CORBEL(4.18, 9, 3, 8, 0.5), a: [-4, 22, 2], b: [4, 22, 2], ends: ['cap', 'cap'] }], view: [0, 23.5, 2] }
    ];
    P.push({ id: 'bent', name: 'Bent Pyramid', king: 'Sneferu', when: 'about 2590 BC', site: 'Dahshur', levels: [{ y: 0, hx: BH, hz: BH }, { y: yB, hx: hB, hz: hB }, { y: H, hx: 0, hz: 0 }], band: 0.6, home: 330,
      today: 'Shown as built, 104.7 m high. It keeps more of its smooth casing than any other pyramid.',
      spaces: spaces, cands: cands,
      patterns: function () {
        return stdPatterns({ dimLead: 'The outline is exact: 362 cubits square, bending at 90 cubits and ending at 200. The room sizes are less regular.',
          dims: [['Base side', 189.43, 362], ['Height', 104.71, 200], ['Height of the bend', 47.04, 90], ['Lower chamber length', 6.3, 12], ['Lower chamber width', 4.96, 9.5, '9½'], ['Lower chamber height', 17.3, 33], ['Upper chamber length', 7.97, 15.25, '15¼'], ['Upper chamber width', 5.26, 10], ['Upper chamber height', 16.5, 31.5, '31½']],
          slopeLead: 'The lower slope rises 7 for every 5 in (seked 5). Above the bend it changes to 17:18, the slope then used for the whole Red Pyramid.',
          slopes: [['Lower face', 54.46, 7 / 5, '7:5'], ['Upper face', 43.37, 17 / 18, '17:18'], ['North passage (mean)', 26.6, 0.5, '1:2'], ['West passage (mean)', 26.5, 0.5, '1:2']],
          extra: [{ h: 'The bend closes the outline', html: '<p>Start 181 cubits from the center, rise 90 cubits at 7:5 and you are ' + f(hB / CUBIT, 1) + ' cubits from the axis. Rising the remaining 110 cubits at 17:18 brings you in by 116.5, which lands on the axis to within ' + f(M.abs(hB - (H - yB) * 18 / 17) / CUBIT, 1) + ' cubit. The three numbers 362, 90 and 200 were chosen together.</p>' },
            { h: 'Two systems, two axes', html: '<p>The north rooms lie on the north–south center line and the west rooms on an east–west line a little south of center. The chimney marks the point where the vertical axis passes the lower system.</p>' }] });
      },
      uncertain: ['The two passage planes are placed to a few meters; their offsets from the center lines are approximate.', 'Each passage changes slope once; a mean slope is drawn.', 'The connecting tunnel is schematic.'],
      sources: 'Perring (1839); Fakhry, The Monuments of Sneferu at Dahshur (1959); Maragioglio and Rinaldi III; Monnier and Puchkov (2016); ScanPyramids first results (2016).' });
  })();

  /* ================================================================== Red */
  (function () {
    var BH = 210 * CUBIT, H = 200 * CUBIT, EN = { y: 28 }; EN.z = -(BH - EN.y * 21 / 20);
    var dA = 27.93 * rad, B = { y: EN.y - 62.63 * M.sin(dA), z: EN.z + 62.63 * M.cos(dA) }, z1 = B.z + 7.4, z2 = z1 + 8.36, z3 = z2 + 3.0, z4 = z3 + 8.36, uy = B.y + 7.6, z5 = z4 + 7.0;
    var spaces = [
      { id: 'entrance', name: 'Entrance and descending passage', short: 'Entrance', stone: 'lime', dims: 'opens 28 m up; 62.63 m at 27°56′, then 7.4 m level', far: 1,
        note: 'A long crouch down from high on the north face to ground level.',
        parts: [{ p: RECT(1.23, 0.91), a: [1.2, EN.y, EN.z], b: [1.2, B.y, B.z], ends: ['door', 'open'] }, { p: RECT(1.23, 1.4), a: [1.2, B.y, B.z], b: [1.2, B.y, z1], ends: ['open', 'door'] }], view: [1.2, EN.y + 0.5, EN.z + 3] },
      { id: 'ante1', name: 'First antechamber', stone: 'lime', dims: '3.65 × 8.36 m (7 × 16 cubits), corbelled, 12.31 m high',
        note: 'Eleven overhanging courses on each long wall. The stone is so well fitted that the vault has not moved in 4,600 years.',
        parts: [{ p: CORBEL(3.65, 12.31, 3.7, 11, 0.4), a: [0, B.y, z1], b: [0, B.y, z2], ends: ['cap', 'cap'] }, { p: RECT(1.05, 1.4), a: [-1.2, B.y, z2], b: [-1.2, B.y, z3], ends: ['door', 'door'] }], view: [0, B.y + 1.6, z1 + 1.5] },
      { id: 'ante2', name: 'Second antechamber', stone: 'lime', dims: '3.65 × 8.36 m, 12.31 m high; under the apex',
        note: 'A twin of the first, lying directly below the point of the pyramid. The way on is a doorway 7.6 m up its south wall.',
        parts: [{ p: CORBEL(3.65, 12.31, 3.7, 11, 0.4), a: [0, B.y, z3], b: [0, B.y, z4], ends: ['cap', 'cap'] }, { p: RECT(1.05, 1.1), a: [0, uy, z4], b: [0, uy, z5], ends: ['door', 'door'] }], view: [0, B.y + 1.6, z3 + 1.5] },
      { id: 'burial', name: 'Burial chamber', stone: 'lime', dims: '4.18 × 8.55 m (8 × 16⅓ cubits), corbelled, 14.67 m high', look: 270,
        note: 'Turned east–west and set higher, inside the masonry. Robbers dug out its floor looking for more passages and found none.',
        parts: [{ p: CORBEL(4.18, 14.67, 4.0, 14, 0.4), a: [-4.275, uy, z5 + 2.09], b: [4.275, uy, z5 + 2.09], ends: ['cap', 'cap'] }], view: [3, uy + 1.6, z5 + 2.1] }
    ];
    var cands = [
      { id: 'R1', name: 'A fourth room on the rising line', cls: 'pattern', score: 1, where: 'South of the burial chamber and higher',
        basis: 'The three rooms step south and upward: two at ground level, the third 7.6 m higher. One more step on the same line would be a room here. Against it: the robbers’ pit in the burial chamber floor met only masonry, and no scan of this pyramid has been published.',
        parts: [{ p: CORBEL(4.18, 9, 3, 8, 0.4), a: [-4.275, uy + 7.6, z5 + 4.18 + 7 + 2.09], b: [4.275, uy + 7.6, z5 + 4.18 + 7 + 2.09], ends: ['cap', 'cap'] }], view: [0, uy + 9.2, z5 + 13.3] },
      { id: 'R2', name: 'A west entrance like the Bent Pyramid’s', cls: 'pattern', score: 1, where: 'From the west face down to the burial chamber', far: 1,
        basis: 'Sneferu’s previous pyramid has a second entrance on the west face leading to its upper room, and here the upper room is turned east–west as if to meet one. The west face has lost its casing and shows no opening.',
        parts: [{ p: RECT(1.1, 1.1), a: [-(BH - 40 * 21 / 20), 40, z5 + 2.09], b: [-4.4, uy + 4, z5 + 2.09], ends: ['cap', 'cap'] }], view: [-40, 24, z5 + 2.09] }
    ];
    P.push({ id: 'red', name: 'Red Pyramid', king: 'Sneferu', when: 'about 2580 BC', site: 'Dahshur', levels: pyr(BH, H), band: 0.6, home: 380,
      today: 'Shown as built, 104.7 m high with white casing. Its name comes from the reddish core stone exposed today.',
      spaces: spaces, cands: cands,
      patterns: function () {
        return stdPatterns({ dimLead: 'The best cubit fit of all seven. The designers clearly worked in whole and simple fractional cubits.',
          dims: [['Base side', 220, 420], ['Height', 104.7, 200], ['Antechamber width', 3.65, 7], ['Antechamber length', 8.36, 16], ['Antechamber height', 12.31, 23.5, '23½'], ['Burial chamber width', 4.18, 8], ['Burial chamber length', 8.55, 16 + 1 / 3, '16⅓'], ['Burial chamber height', 14.67, 28], ['Descending passage', 62.63, 120], ['Level passage', 7.4, 14], ['Doorway above floor', 7.6, 14.5, '14½']],
          slopeLead: 'With a half-base of 210 cubits and a height of 200 the face rises 20 for every 21 in. The surveyed angle is a little lower and matches the 17:18 of the Bent Pyramid’s top.',
          slopes: [['Face (design 20:21)', 43.37, 20 / 21, '20:21'], ['Face (as 17:18)', 43.37, 17 / 18, '17:18'], ['Descending passage', 27.93, 8 / 15, '8:15']],
          extra: [{ h: 'Sevens and sixteens', html: '<p>Both antechambers are 7 by 16 cubits. The burial chamber is 8 by 16⅓, one cubit wider. The level passage is 14 cubits, twice 7, and the doorway to the burial chamber is 14½ cubits up. The room heights, 23½ and 28 cubits, differ by 4½.</p>' },
            { h: 'Under the apex', html: '<p>The second antechamber, not the burial chamber, lies on the pyramid’s vertical axis. Khufu’s builders later did the same with the Queen’s Chamber.</p>' }] });
      },
      uncertain: ['The passage is drawn 1.2 m east of the center line and the link between the antechambers 1.2 m west; the true offsets are of that order.', 'Published heights for the pyramid range from 104 to 105 m.'],
      sources: 'Perring (1839); Stadelmann, Die ägyptischen Pyramiden (1985); Lehner (1997); Rossi, Architecture and Mathematics in Ancient Egypt (2004).' });
  })();

  /* ================================================================== Djoser */
  (function () {
    var hx0 = 60.5, hz0 = 54.5, H = 62.5, n = 6, th = H / n, bat = 3.0, led = 5.25, levels = [], i, hx = hx0, hz = hz0, y = 0;
    for (i = 0; i < n; i++) { levels.push({ y: y, hx: hx, hz: hz }); hx -= bat; hz -= bat; y += th; levels.push({ y: y, hx: hx, hz: hz }); if (i < n - 1) { hx -= led; hz -= led; } }
    var D = -28, gy = D + 0.2, parts = [], g;
    // four gallery groups around the foot of the shaft, drawn as a ring corridor with side rooms
    var ring = [[-20, -20], [20, -20], [20, 20], [-20, 20]];
    for (i = 0; i < 4; i++) { var a = ring[i], b = ring[(i + 1) % 4]; parts.push({ p: RECT(1.6, 2.0), a: [a[0], gy, a[1]], b: [b[0], gy, b[1]], ends: ['open', 'open'] }); }
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
      parts.push({ p: RECT(1.4, 1.9), a: [d[0] * 3.5, gy, d[1] * 3.5], b: [d[0] * 20, gy, d[1] * 20], ends: ['door', 'open'] });
      for (g = -2; g <= 2; g++) if (g) parts.push({ p: RECT(1.5, 1.8), a: [d[0] * 20 + d[1] * g * 7, gy, d[1] * 20 + d[0] * g * 7], b: [d[0] * 28 + d[1] * g * 7, gy, d[1] * 28 + d[0] * g * 7], ends: ['open', 'cap'] });
    });
    var east = [], zz;
    for (i = 0; i < 11; i++) { zz = -35 + i * 7; east.push({ p: SQ(1.6), a: [33, 0, zz], b: [33, -32.5, zz], ends: ['cap', 'open'] }); east.push({ p: RECT(1.6, 1.8), a: [33.8, -33.5, zz], b: [6, -33.5, zz], ends: ['cap', 'cap'] }); }
    var spaces = [
      { id: 'shaft', name: 'Central shaft', stone: 'rock', dims: '7 × 7 m, 28 m deep', far: 1,
        note: 'The great square pit at the heart of the tomb, later filled with rubble and buried under the pyramid.',
        parts: [{ p: SQ(7), a: [0, 0, 0], b: [0, D, 0], ends: ['cap', 'cap'] }], view: [0, -14, 0] },
      { id: 'vault', name: 'Granite burial vault', stone: 'granite', dims: 'inside 2.96 × 1.65 × 1.65 m',
        note: 'A box of pink granite blocks in four courses at the bottom of the shaft. The only way in was a hole in its roof, plugged with a 3.5-ton granite stopper.',
        parts: [{ p: RECT(1.65, 1.65), a: [0, D - 3.2, -1.48], b: [0, D - 3.2, 1.48], ends: ['cap', 'cap'] }, { p: SQ(1.0), a: [0, D - 1.55, 0], b: [0, D - 0.02, 0], ends: ['open', 'door'] }], view: [0, D - 2.5, -0.8] },
      { id: 'north', name: 'North descent', stone: 'rock', dims: 'begins as an open trench in the mortuary temple', far: 1,
        note: 'The original way down: a stair and ramp from the temple on the north side to the foot of the shaft.',
        parts: [{ p: RECT(1.8, 2.2), a: [0, -1, -72], b: [0, D + 3, -3.6], ends: ['door', 'door'] }], view: [0, -8, -55] },
      { id: 'south', name: 'South gallery', stone: 'rough', dims: 'cut about 2,000 years after Djoser', far: 1,
        note: 'A tunnel driven in from the south court in the Saite period, when the shaft was emptied by people curious about the old tomb.',
        parts: [{ p: RECT(1.8, 2.2), a: [0, -2, 66], b: [0, -12, 3.6], ends: ['door', 'door'] }], view: [0, -5, 50] },
      { id: 'galleries', name: 'Galleries around the shaft', short: 'Galleries', stone: 'rock', dims: 'about 5.7 km of tunnels in all; a small part is drawn', far: 1,
        note: 'Four groups of corridors and store rooms ring the shaft. Those on the east are the king’s apartments, lined with blue-green faience tiles imitating reed matting. Tens of thousands of stone vessels were stacked in the others.',
        parts: parts, view: [14, gy + 1.2, 0] },
      { id: 'east', name: 'Eleven eastern shafts', short: 'Eastern shafts', stone: 'rock', dims: 'each about 32–33 m deep with a gallery about 30 m long', far: 1,
        note: 'A row of shafts along the east side of the first mastaba, each leading to a gallery running west under the tomb. Used for burials of the royal family and for storage, then covered when the building was enlarged.',
        parts: east, view: [20, -32.6, 0] }
    ];
    var cands = [
      { id: 'J1', name: 'Unmapped continuations of the galleries', cls: 'pattern', score: 2, where: 'Beyond the ends of the mapped corridors', far: 1,
        basis: 'The substructure was cut in several campaigns and parts are choked with rubble or were left unfinished. Mapped corridors that stop at a fall of rock may run on. This is a general expectation from how the tunnels were dug; no specific hidden gallery has been reported.',
        parts: [{ p: RECT(1.6, 2.0), a: [-28, gy, -14], b: [-42, gy, -14], ends: ['cap', 'cap'] }, { p: RECT(1.6, 2.0), a: [14, gy, 28], b: [14, gy, 40], ends: ['cap', 'cap'] }], view: [-35, gy + 1.2, -14] },
      { id: 'J2', name: 'A western row to match the eastern shafts', cls: 'pattern', score: 1, where: 'Under the west side of the pyramid', far: 1,
        basis: 'Eleven shafts line the east side and nothing matches them on the west. Symmetry suggests a twin row, but the eastern shafts belong to one particular enlargement of the mastaba and the builders had no need to repeat them. Long galleries do exist further west, outside the pyramid, under the western mounds of the enclosure.',
        parts: [0, 1, 2, 3, 4].map(function (k) { return { p: SQ(1.6), a: [-33, 0, -28 + k * 14], b: [-33, -32.5, -28 + k * 14], ends: ['cap', 'cap'] }; }), view: [-33, -16, 0] }
    ];
    P.push({ id: 'djoser', name: 'Step Pyramid', king: 'Djoser, built by Imhotep', when: 'about 2650 BC', site: 'Saqqara', levels: levels, band: 0, home: 230,
      today: 'Shown as finished, six steps and 62.5 m high. It began as a square mastaba and was enlarged five times.',
      spaces: spaces, cands: cands,
      patterns: function () {
        return stdPatterns({ dimLead: 'The first large stone building was not laid out on a tidy cubit grid. It grew by stages, and its final sizes are whatever the last enlargement produced.',
          dims: [['Base east–west', 121, 231], ['Base north–south', 109, 208], ['Height', 62.5, 119], ['Central shaft width', 7, 13], ['Central shaft depth', 28, 53.5, '53½'], ['Eastern shaft depth', 33, 63], ['Vault length inside', 2.96, 5 + 2 / 3, '5⅔'], ['Vault width inside', 1.65, 3 + 1 / 7, '3⅐']],
          slopeLead: 'There are no sloping faces to test. The masonry of each step leans inward in layers, at about 16° from vertical.',
          slopes: [['Step face from vertical', 16, 2 / 7, '2:7']],
          extra: [{ h: 'What the plan does repeat', html: '<p>The patterns here are counts and directions, not lengths: a square shaft on the axis, four gallery groups facing the four directions, eleven shafts in an evenly spaced row, and an entrance from the north. The cubit targets in the table are just the nearest tidy values, and several miss.</p>' },
            { h: 'From here to Giza', html: '<p>Djoser’s burial is a shaft under the building. Meidum raises the room to ground level, the Dahshur pyramids lift it into the masonry, and Khufu’s King’s Chamber ends the climb 43 m up. After Khufu the kings went back to rooms in the rock.</p>' }] });
      },
      candNote: 'The galleries are drawn as a diagram. About one tenth of the real tunnels are shown, tidied into straight lines.',
      uncertain: ['The step heights are drawn equal; the real steps shrink slightly upward.', 'The gallery groups are a diagram of the real maze, not a survey.', 'The eastern galleries are drawn straight; several curve and are at slightly different depths.'],
      sources: 'Firth and Quibell, The Step Pyramid (1935); Lauer, La pyramide à degrés (1936–39); Lehner (1997).' });
  })();

  var DATA = { CUBIT: CUBIT, pyramids: P, halfAt: halfAt };
  G.PX_DATA = DATA;
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
