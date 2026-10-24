/* Ancient Egypt in 3-D: the six models, built from published dimensions (see the info panels on /egypt/3d/ for sources).
   Meters; x east, y up, z south (north is -z). Each model: { id, icon, title, sub, lead, alt, view, tour, switches,
   xray, build(T) -> { objects, labels, radius } }. Objects: { mesh, shell (see-through when X is on), xa, alphaFix, when(vals),
   anim(vals) -> { off, alpha }, edge, edgeAlpha, ds, unlit }. Labels: { p, t, note, x (inside: only when see-through),
   when, anim, minD, maxD, pri }. */
(function (G) {
  'use strict';
  var T = G.TRB3D; if (!T) return;
  var M = Math, PI = M.PI, D2R = PI / 180;
  var C = {
    sand: '#d6bd88', lime: '#ece1c4', core: '#ccb185', coreDk: '#b99f74', granite: '#b06a5c', granDk: '#8e4f45', basalt: '#5a5650',
    gold: '#dca52c', goldDk: '#b8862a', pass: '#1f7a4d', shaft: '#3a79c2', rock: '#c49561', rockDk: '#a97c4d', bed: '#b8a07a',
    dark: '#2b241e', water: '#3c7fa8', wine: '#8a2a40', mud: '#a5845e', paint: '#e8c25a', stone: '#d9c9a2', black: '#34312f', glass: '#9fc6d8'
  };
  function sm(a, b, x) { var t = M.max(0, M.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function hash(x, z) { var s = M.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - M.floor(s); }
  function wob(x, z) { return 0.04 * M.sin(x / 210) * M.cos(z / 160) + 0.015 * M.sin((x + z) / 120); }
  function shadeHex(h, k) { var n = parseInt(h.slice(1), 16); return [M.min(1, ((n >> 16) & 255) / 255 * k), M.min(1, ((n >> 8) & 255) / 255 * k), M.min(1, (n & 255) / 255 * k)]; }
  function person(m, x, y, z, col) { // a 1.7 m figure for scale
    col = col || C.wine;
    m.box(x - 0.17, y, z - 0.1, x + 0.17, y + 0.84, z + 0.1, col);
    m.box(x - 0.22, y + 0.84, z - 0.12, x + 0.22, y + 1.44, z + 0.12, col);
    m.box(x - 0.11, y + 1.47, z - 0.11, x + 0.11, y + 1.7, z + 0.11, '#ffcc4d'); // the head, in the site's one cartoon skin color
    return m;
  }
  // a true pyramid on the ground at (cx, cz), base b, height h; sideCols shade the four faces a little apart
  function pyramid(m, cx, y0, cz, b, h, col, o) { o = o || {}; return m.frustum(cx, cz, y0, y0 + h, b, b, 0, 0, col, { edges: o.edges, noBottom: o.noBottom }); }
  // a stepped core: n blocks whose outer corners follow the original slope, up to height top
  function steppedCore(m, cx, y0, cz, b, slope, top, n, col, col2) {
    var t = M.tan(slope * D2R);
    for (var i = 0; i < n; i++) {
      var ya = top * i / n, yb = top * (i + 1) / n, half = b / 2 - yb / t + (yb - ya) / t * 0.45;
      m.box(cx - half, y0 + ya, cz - half, cx + half, y0 + yb, cz + half, i % 2 ? col : col2, { noBottom: i > 0 });
    }
    return m;
  }
  function ghostPyr(m, cx, y0, cz, b, h) { // outline only
    var q = [[cx - b / 2, y0, cz - b / 2], [cx + b / 2, y0, cz - b / 2], [cx + b / 2, y0, cz + b / 2], [cx - b / 2, y0, cz + b / 2]], a = [cx, y0 + h, cz];
    m.loop(q); q.forEach(function (p) { m.line(p, a); }); return m;
  }
  function O(mesh, o) { o = o || {}; o.mesh = mesh; return o; }

  /* =========================================================== 1. the Giza plateau */
  // centers from Petrie's survey as tabulated by Legon (1988): Khafre 353.9 m south and 334.4 m west of Khufu's center,
  // Menkaure 739.2 m south and 574.4 m west.
  var GZ = {
    khufu: { x: 0, z: 0, b: 230.3, h: 146.6, s: 51.84, now: 138.5 },
    khafre: { x: -334.4, z: 353.9, b: 215.3, h: 143.5, s: 53.13, now: 136.4 },
    menkaure: { x: -574.4, z: 739.2, b: 103.4, h: 65.5, s: 51.34, now: 61 }
  };
  function gizaH(x, z) {
    var k = 10 * M.exp(-((x + 334.4) * (x + 334.4) + (z - 353.9) * (z - 353.9)) / (2 * 210 * 210)); // Khafre stands about 10 m higher
    var e = sm(170, 430, x + 0.25 * (z - 200)); // the plateau's edge falls toward the valley in the east
    return k - 30 * e;
  }
  function gizaBuild() {
    var obs = [], L = [];
    var g = T.mesh().terrain(-1700, -1050, 1200, 1800, 48, 46, gizaH, function (x, z, y) { return shadeHex(C.sand, 0.97 + wob(x, z) + y * 0.002); });
    obs.push(O(g, { noOcc: true }));
    var ps = ['khufu', 'khafre', 'menkaure'];
    // as built: smooth casing (Menkaure's lowest courses in red granite)
    var built = T.mesh(), today = T.mesh(), ghost = T.mesh();
    ps.forEach(function (k) {
      var P = GZ[k], y0 = gizaH(P.x, P.z);
      built.box(P.x - P.b / 2, y0 - 25, P.z - P.b / 2, P.x + P.b / 2, y0, P.z + P.b / 2, C.coreDk, { noTop: true });
      if (k === 'menkaure') {
        var hb = 9, t = M.tan(P.s * D2R), b2 = P.b - 2 * hb / t;
        built.frustum(P.x, P.z, y0, y0 + hb, P.b, P.b, b2, b2, C.granite, { noBottom: true });
        built.frustum(P.x, P.z, y0 + hb, y0 + P.h, b2, b2, 0, 0, C.lime, { noBottom: true });
      } else pyramid(built, P.x, y0, P.z, P.b, P.h, C.lime, { noBottom: true });
      // today: the stepped core, the lost top shown as an outline; Khafre keeps casing on its top part
      today.box(P.x - P.b / 2, y0 - 25, P.z - P.b / 2, P.x + P.b / 2, y0, P.z + P.b / 2, C.coreDk, { noTop: true });
      if (k === 'khafre') {
        var yc = 0.72 * P.now, tt = M.tan(P.s * D2R), bc = P.b - 2 * yc / tt, bt = P.b - 2 * P.now / tt;
        steppedCore(today, P.x, y0, P.z, P.b, P.s, yc, 18, C.core, C.coreDk);
        today.frustum(P.x, P.z, y0 + yc, y0 + P.now, bc, bc, bt, bt, C.lime, { noBottom: true });
      } else steppedCore(today, P.x, y0, P.z, P.b, P.s, P.now, k === 'menkaure' ? 12 : 22, C.core, C.coreDk);
      ghostPyr(ghost, P.x, y0, P.z, P.b, P.h);
    });
    obs.push(O(built, { when: function (v) { return v.state === 'built'; }, edge: '#7b6a48', edgeAlpha: 0.35 }));
    obs.push(O(today, { when: function (v) { return v.state === 'today'; } }));
    obs.push(O(ghost, { when: function (v) { return v.state === 'today'; }, edge: '#6e5200', edgeAlpha: 0.55 }));
    // queens' pyramids (simple form) and Khafre's satellite pyramid
    var q = T.mesh();
    [[185, 40, 49.5, 30.25], [187, 96, 49, 30], [190, 150, 46, 29.6]].forEach(function (a) { var y0 = gizaH(a[0], a[1]); q.box(a[0] - a[2] / 2, y0 - 12, a[1] - a[2] / 2, a[0] + a[2] / 2, y0, a[1] + a[2] / 2, C.coreDk, { noTop: true }); pyramid(q, a[0], y0, a[1], a[2], a[3], C.core, { noBottom: true }); });
    var y3 = gizaH(-520, 830); q.box(-542, y3 - 12, 808, -498, y3, 852, C.coreDk, { noTop: true }); pyramid(q, -520, y3, 830, 44, 28, C.core, { noBottom: true });
    [-574, -622].forEach(function (x) { var y0 = gizaH(x, 830); for (var i = 0; i < 4; i++) { var w = 31 - i * 7; q.cbox(x, y0 - (i ? 0 : 10), 830, w, (i ? 4.5 : 14.5), w, C.core); } });
    var y2 = gizaH(-334.4, 492); q.cbox(-334.4, y2 - 5, 492, 21, 8, 21, C.core);
    obs.push(O(q, { edge: '#7b6a48', edgeAlpha: 0.25 }));
    // temples and causeways (simple form)
    var tp = T.mesh();
    function block(x0, z0, x1, z1, h, col) { var y0 = M.min(gizaH(x0, z0), gizaH(x1, z1), gizaH(x0, z1), gizaH(x1, z0)); tp.box(x0, y0 - 3, z0, x1, M.max(gizaH(x0, z0), gizaH(x1, z1)) + h, z1, col); }
    function causeway(x, z, ang, len, w) { var n = M.ceil(len / 30), dx = M.cos(ang * D2R), dz = M.sin(ang * D2R); for (var i = 0; i < n; i++) { var a = [x + dx * len * i / n, 0, z + dz * len * i / n], b = [x + dx * len * (i + 1) / n, 0, z + dz * len * (i + 1) / n]; a[1] = gizaH(a[0], a[2]) - 1; b[1] = gizaH(b[0], b[2]) - 1; tp.passage(a, b, w, 3.6, C.stone); } }
    block(115.2, -26, 155, 26, 1.6, C.basalt);                 // Khufu's mortuary temple (its basalt floor survives)
    causeway(155, 0, -14, 450, 9);                             // Khufu's causeway, 14 degrees north of east (most of it lost)
    block(-226.8, 330, -120, 378, 5, C.stone);                 // Khafre's mortuary temple
    causeway(-120, 353.9, 14, 494.6, 9);                       // Khafre's causeway, 494.6 m, 14 degrees south of east
    block(362, 452, 407, 497, 7, '#c9b48a');                   // Khafre's valley temple (limestone core, granite inside)
    block(368, 408, 410, 448, 5, C.stone);                     // the Sphinx temple
    block(-521.7, 716, -480, 762, 4, C.stone);                 // Menkaure's mortuary temple
    causeway(-480, 739.2, 0, 590, 8);                          // Menkaure's causeway (simplified)
    block(110, 717, 152, 761, 4, C.mud);                       // Menkaure's valley temple (finished in mud brick)
    obs.push(O(tp, { edge: '#7b6a48', edgeAlpha: 0.25 }));
    // mastaba cemeteries west and east of the Great Pyramid
    var mc = T.mesh();
    for (var i = 0; i < 7; i++) for (var j = 0; j < 8; j++) { var x = -170 - i * 27, z = -105 + j * 30; if ((i * 7 + j) % 9 === 4) continue; var y0 = gizaH(x, z); mc.frustum(x, z, y0 - 2, y0 + 6, 10, 22, 8.6, 20.6, C.stone); }
    for (i = 0; i < 3; i++) for (j = 0; j < 7; j++) { var xe = 240 + i * 26, ze = -55 + j * 30; var ye = gizaH(xe, ze); mc.frustum(xe, ze, ye - 3, ye + 5, 10, 22, 8.6, 20.6, C.stone); }
    obs.push(O(mc, { edge: '#7b6a48', edgeAlpha: 0.2 }));
    // the Great Sphinx: 73 m long, 20 m high, facing east (simple blocks)
    var sp = T.mesh(), sx = 290, sz = 433, sy = gizaH(326, 433) - 1;
    sp.box(sx, sy, sz - 7, sx + 50, sy + 9.5, sz + 7, C.core);                    // the lion's body
    sp.box(sx, sy, sz - 8.5, sx + 14, sy + 10.5, sz + 8.5, C.core);              // haunches
    sp.box(sx + 46, sy, sz - 6.5, sx + 56, sy + 13, sz + 6.5, C.core);           // chest
    sp.box(sx + 53, sy, sz - 6.5, sx + 73, sy + 2.6, sz - 2.3, C.core);          // paws
    sp.box(sx + 53, sy, sz + 2.3, sx + 73, sy + 2.6, sz + 6.5, C.core);
    sp.frustum(sx + 51.5, sz, sy + 11, sy + 19.3, 7, 10.5, 5, 6.6, C.lime);      // the nemes headdress
    sp.box(sx + 53.5, sy + 12.5, sz - 2.6, sx + 57.2, sy + 20, sz + 2.6, '#dcc9a0'); // the face
    obs.push(O(sp, { edge: '#6b5a3c', edgeAlpha: 0.3 }));
    var fig = T.mesh(); person(fig, 121, gizaH(121, -121), -121);
    obs.push(O(fig));
    var yk = gizaH(0, 0);
    L.push({ p: [0, yk + 152, 0], t: 'Great Pyramid of Khufu', note: '230.3 m square, 146.6 m high as built, sides at 51.8°. The tallest building in the world for almost 3,800 years.', pri: 3 });
    L.push({ p: [-334.4, gizaH(-334.4, 353.9) + 148, 353.9], t: 'Pyramid of Khafre', note: '215.3 m square, 143.5 m high, sides at about 53°. It stands on rock about 10 m higher, so it can look the tallest. Casing survives near the top.', pri: 3 });
    L.push({ p: [-574.4, gizaH(-574.4, 739.2) + 70, 739.2], t: 'Pyramid of Menkaure', note: 'About 103 m square and 65.5 m high, the smallest of the three. Its lowest courses were cased in red granite.', pri: 3 });
    L.push({ p: [345, sy + 23, sz], t: 'Great Sphinx', note: 'About 73 m long and 20 m high, carved from the bedrock and facing east. Its face is usually identified as Khafre’s.', pri: 2 });
    L.push({ p: [190, gizaH(190, 96) + 34, 96], t: 'Queens’ pyramids', note: 'Three small pyramids beside the Great Pyramid, each about 46–50 m square and 30 m high as built.', maxD: 1700 });
    L.push({ p: [-572, gizaH(-572, 830) + 30, 830], t: 'Menkaure’s queens’ pyramids', note: 'Three small pyramids south of Menkaure’s. The eastern one is a true pyramid; the other two have stepped cores.', maxD: 1700 });
    L.push({ p: [100, gizaH(120, 413) + 8, 413], t: 'Khafre’s causeway', note: 'A walled ramp 494.6 m long from the mortuary temple to the valley temple, about 14° south of east.', maxD: 1900 });
    L.push({ p: [470, gizaH(470, -78) + 6, -78], t: 'Khufu’s causeway', note: 'It ran about 14° north of east down to a valley temple; most of it now lies under the modern town. Its course is simplified here.', maxD: 1900 });
    L.push({ p: [385, gizaH(385, 475) + 16, 475], t: 'Valley temple of Khafre', note: 'Built of huge limestone blocks sheathed in red granite, with a hall of granite pillars. Boats could reach it on a canal.', maxD: 900 });
    L.push({ p: [135, yk + 6, 0], t: 'Mortuary temple', note: 'Khufu’s temple for offerings on the east side; only its basalt pavement survives.', maxD: 900 });
    L.push({ p: [-250, gizaH(-250, 0) + 12, 0], t: 'Western Cemetery', note: 'Rows of mastaba tombs for officials and royal family, laid out like streets (simplified here).', maxD: 1500 });
    L.push({ p: [266, gizaH(266, 40) + 10, 40], t: 'Eastern Cemetery', note: 'Mastabas for the king’s close family east of the queens’ pyramids (simplified).', maxD: 1100 });
    L.push({ p: [121, gizaH(121, -121) + 2.1, -121], t: 'A person, 1.7 m', note: 'For scale, at the Great Pyramid’s northeast corner.', maxD: 160, pri: 4 });
    return { objects: obs, labels: L, radius: 700, sun: T.v.norm([0.5, 0.75, 0.45]), island: [-220, 380, 950, 1380] };
  }
  T.add({
    id: 'giza', icon: '△', title: 'The Giza plateau', sub: 'Fourth Dynasty, c. 2589–2503 BC · the three pyramids, the Sphinx, queens’ pyramids, causeways and cemeteries',
    lead: 'The three great pyramids at their true sizes, angles and positions. Turn the plateau, switch between the pyramids as built and as they stand today, or start the tour.',
    alt: 'The Giza plateau from above, with the pyramids of Khufu, Khafre and Menkaure on a diagonal from northeast to southwest, the Sphinx to the east.',
    view: { t: [-200, 0, 360], yaw: -0.75, pitch: 0.36, d: 1650 }, minD: 6, maxD: 3200, panLimit: 900,
    switches: [{ id: 'state', type: 'seg', label: 'Pyramids:', value: 'built', options: [['built', 'As built'], ['today', 'Today']] }],
    tour: [
      { title: 'Three kings, three pyramids', cam: { t: [-280, 0, 380], yaw: -0.62, pitch: 0.3, d: 1500 }, set: { state: 'built' }, text: 'Khufu built the first and largest, his son Khafre the second, and Menkaure the third, in less than a century. Their corners line up on a rough diagonal running southwest from the Great Pyramid, and their sides face the four directions almost exactly.' },
      { title: 'The Great Pyramid', cam: { t: [0, 40, 0], yaw: -0.5, pitch: 0.22, d: 560 }, text: 'Khufu’s pyramid was 146.6 m high with a square base 230.3 m on a side, and its faces rise at 51.8°. It holds about 2.3 million blocks. White limestone from Tura, across the river, made the smooth outer casing.' },
      { title: 'Khafre’s pyramid', cam: { t: [-334, 40, 354], yaw: -1.1, pitch: 0.18, d: 520 }, text: 'Khafre’s pyramid is a little smaller (143.5 m) but steeper, at about 53°, and it stands on bedrock about 10 m higher, so from many places it looks the tallest. It still has some of its casing near the top.' },
      { title: 'Menkaure’s pyramid', cam: { t: [-560, 20, 760], yaw: -0.4, pitch: 0.22, d: 330 }, text: 'Menkaure’s pyramid is much smaller, 65.5 m high, with three queens’ pyramids to its south. Its lowest courses were cased in red granite brought from Aswan, far up the Nile; the work stopped after the king died, and part of the granite was left rough.' },
      { title: 'The Sphinx and the valley temple', cam: { t: [335, -18, 440], yaw: 2.05, pitch: 0.3, d: 135 }, text: 'The Sphinx was carved from the bedrock where the quarry men had left a knoll. It faces east beside the valley temple, where Khafre’s causeway begins. Most Egyptologists date it to Khafre’s reign; the face is usually taken as his.' },
      { title: 'Causeways', cam: { t: [60, -5, 300], yaw: 0.5, pitch: 0.42, d: 900 }, text: 'Each pyramid had a temple on its east side for offerings, a covered causeway down to the edge of the valley, and a valley temple near the water. Khafre’s causeway is 494.6 m long. Khufu’s ran northeast and is mostly lost under the modern town.' },
      { title: 'Queens and officials', cam: { t: [40, 0, 40], yaw: -0.2, pitch: 0.55, d: 620 }, text: 'Small pyramids for queens stand beside the kings’. Around them, streets of mastaba tombs held the king’s family and officials, so the whole court stayed near him after death.' },
      { title: 'A person for scale', cam: { t: [121, 5, -121], yaw: 0.75, pitch: 0.12, d: 16 }, text: 'This figure is 1.7 m tall, at the Great Pyramid’s northeast corner. The lowest course of blocks alone is about 1.5 m high.' },
      { title: 'Giza today', cam: { t: [-250, 0, 380], yaw: -0.85, pitch: 0.28, d: 1400 }, set: { state: 'today' }, text: 'Most of the white casing was stripped in the Middle Ages and carted to Cairo for building. Today we see the stepped core blocks. The Great Pyramid has lost about 8 m from its top (138.5 m now); the outlines show the original shapes.' }
    ],
    build: gizaBuild
  });

  /* =========================================================== 2. the Great Pyramid cutaway */
  var GP = { b: 230.3, h: 146.6, s: 51.84, now: 138.5, xp: 7.6 };
  function gpBuild() {
    var obs = [], L = [], half = GP.b / 2, tn = M.tan(GP.s * D2R), XP = GP.xp;
    function faceZ(y) { return -(half - y / tn); } // the north face at height y
    var bed = T.mesh().box(-420, -46, -420, 420, 0, 420, C.bed, { cols: { top: C.sand } });
    obs.push(O(bed, { shell: true, xa: 0.22, edge: '#8a7550', edgeAlpha: 0.0 }));
    var shellB = T.mesh(); pyramid(shellB, 0, 0, 0, GP.b, GP.h, C.lime, { edges: true, noBottom: true });
    obs.push(O(shellB, { shell: true, xa: 0.13, when: function (v) { return v.state === 'built'; }, edge: '#6e5a33', edgeAlpha: 0.6 }));
    var shellT = T.mesh(); steppedCore(shellT, 0, 0, 0, GP.b, GP.s, GP.now, 26, C.core, C.coreDk);
    obs.push(O(shellT, { shell: true, xa: 0.12, when: function (v) { return v.state === 'today'; } }));
    var gh = T.mesh(); ghostPyr(gh, 0, 0, 0, GP.b, GP.h);
    obs.push(O(gh, { when: function (v) { return v.state === 'today'; }, edge: '#6e5200', edgeAlpha: 0.5 }));
    var cas = T.mesh(); cas.frustum(0, -half + 2.6, 0, 1.5, 70, 5.2, 70, 2.9, C.lime, { oz: -1.15 }); // casing stones left at the foot of the north side
    obs.push(O(cas, { when: function (v) { return v.state === 'today'; } }));
    // passages (green), chambers (gold), granite rooms (red), shafts (blue)
    var p = T.mesh(), ch = T.mesh(), gr = T.mesh(), sh = T.mesh(), tun = T.mesh();
    var s26 = M.sin(26.45 * D2R), c26 = M.cos(26.45 * D2R), sa = M.sin(26.1 * D2R), ca = M.cos(26.1 * D2R);
    var ent = [XP, 17, faceZ(17)], dEnd = [XP, -29, faceZ(17) + 46 / M.tan(26.45 * D2R)];
    p.passage(ent, dEnd, 1.05, 1.34, C.pass);                                                  // descending passage
    p.passage(dEnd, [XP, -29, -4.2], 0.85, 0.9, C.pass);                                        // lower horizontal passage
    var jn = [XP, 17 - 28 * s26, faceZ(17) + 28 * c26], aEnd = [XP, jn[1] + 39.3 * sa, jn[2] + 39.3 * ca];
    p.passage(jn, aEnd, 1.05, 1.32, C.pass);                                                    // ascending passage
    p.passage(aEnd, [XP, aEnd[1], -2.6], 1.05, 1.17, C.pass);                                   // passage to the Queen's Chamber
    p.passage([1, -29, 4.2], [1, -29, 20.6], 0.75, 0.75, C.pass);                               // the blind passage south
    ch.box(XP + 0.5 - 14.1, -29, -4.2, XP + 0.5, -25, 4.2, '#b07a3c');                          // subterranean chamber, about 27 m down
    ch.box(3.4, -32, -1, 5.4, -29, 1, '#8c5f2e');                                               // the pit
    var gTop = [XP, aEnd[1] + 46.68 * sa, aEnd[2] + 46.68 * ca], q0 = [], q1 = [];
    [[-1.03, 0], [1.03, 0], [0.52, 8.6], [-0.52, 8.6]].forEach(function (o) { q0.push([XP + o[0], aEnd[1] + o[1], aEnd[2]]); q1.push([XP + o[0], gTop[1] + o[1], gTop[2]]); });
    ch.rings(q0, q1, C.gold);                                                                   // Grand Gallery
    ch.gable(XP + 0.52 - 5.8, -2.6, XP + 0.52, 2.6, aEnd[1], aEnd[1] + 4.7, aEnd[1] + 6.3, C.gold); // Queen's Chamber
    var kf = 43.2;
    p.passage([XP, kf, gTop[2]], [XP, kf, 3.3], 1.05, 1.1, C.pass);
    gr.box(XP - 0.83, kf, 3.3, XP + 0.83, kf + 3.8, 6.25, C.granite);                          // antechamber
    p.passage([XP, kf, 6.25], [XP, kf, 8.8], 1.05, 1.1, C.pass);
    gr.box(XP + 0.52 - 10.47, kf, 8.8, XP + 0.52, kf + 5.84, 14.03, C.granite);                // King's Chamber
    var sar = T.mesh().box(-2.2, kf, 10.3, -1.2, kf + 1.05, 12.6, C.black); obs.push(O(sar, { inner: true }));
    for (var i = 0; i < 4; i++) { var y0 = kf + 5.84 + 1.6 + i * 2.8; gr.box(XP + 1 - 11.5, y0, 8.6, XP + 1, y0 + 1.2, 14.3, '#c98a7c'); }
    gr.gable(XP + 1 - 11.5, 8.6, XP + 1, 14.3, kf + 5.84 + 12.8, kf + 5.84 + 14.2, kf + 5.84 + 17.4, '#d4b98e'); // the top relieving chamber, gabled
    // air shafts: the King's Chamber's reach the outside; the Queen's end at small stone doors
    var k0n = [2, kf + 0.9, 8.8], k0s = [2, kf + 0.9, 14.03];
    var tN = (k0n[2] + half - k0n[1] / tn) / (M.cos(32.6 * D2R) + M.sin(32.6 * D2R) / tn), tS = (half - k0s[1] / tn - k0s[2]) / (M.cos(45 * D2R) + M.sin(45 * D2R) / tn);
    var kN = [2, k0n[1] + tN * M.sin(32.6 * D2R), k0n[2] - tN * M.cos(32.6 * D2R)], kS = [2, k0s[1] + tS * M.sin(45 * D2R), k0s[2] + tS * M.cos(45 * D2R)];
    function thin(a, b) { sh.passage(a, b, 0.5, 0.5, C.shaft); sh.line(a, b); }
    thin(k0n, kN); thin(k0s, kS);
    var qn0 = [5.2, aEnd[1] + 1, -2.6], qs0 = [5.2, aEnd[1] + 1, 2.6], ql = 62, qa = 39.6 * D2R;
    var qn = [5.2, qn0[1] + ql * M.sin(qa), -2.6 - ql * M.cos(qa)], qs = [5.2, qs0[1] + ql * M.sin(qa), 2.6 + ql * M.cos(qa)];
    thin(qn0, qn); thin(qs0, qs); sh.box(4.8, qs[1] - 0.1, qs[2] - 0.2, 5.6, qs[1] + 0.7, qs[2] + 0.4, '#24538a');
    // the well shaft from the foot of the Grand Gallery down to the descending passage (approximate course)
    var wl = [[-41.4, 21.6], [-41.4, 13.8], [-39.6, 8.5], [-38.8, 5.7], [-31.5, -12], [-27.5, -19.5], [-25.6, -21]];
    for (i = 0; i < wl.length - 1; i++) { var A = [XP - 1.6, wl[i][1], wl[i][0]], B = [XP - 1.6, wl[i + 1][1], wl[i + 1][0]]; sh.passage(A, B, 0.75, 0.75, '#5f6f86'); }
    // the robbers' tunnel credited to al-Mamun (about AD 820), today's way in
    var mt = [[3.6, 7, faceZ(7)], [4.6, 6.4, -100], [5.8, 5.6, -90], [6.6, 4.6, -80], [XP, 4.6, jn[2] - 1.5]];
    for (i = 0; i < mt.length - 1; i++) tun.passage(mt[i], mt[i + 1], 1.6, 1.7, '#8d7a62');
    obs.push(O(p, { inner: true }), O(ch, { inner: true }), O(gr, { inner: true }), O(sh, { inner: true, edge: '#24538a', edgeAlpha: 0.9 }), O(tun, { inner: true }));
    var fig = T.mesh(); person(fig, XP + 3, 0, -half - 4); obs.push(O(fig));
    L.push({ p: [XP, 21, faceZ(17) - 1], t: 'Original entrance', note: 'On the north face, about 17 m up and 7 to 8 m east of the center line.', pri: 3 });
    L.push({ p: [XP, -2, faceZ(17) + 38 * c26], t: 'Descending passage', note: 'About 1 m wide and 1.2 m high, sloping down at about 26.5° into the bedrock.', x: true });
    L.push({ p: [XP - 6, -24.5, 0], t: 'Subterranean chamber', note: 'Cut into the rock about 27 m below the base, 8.4 × 14.1 m, and never finished.', x: true, pri: 2 });
    L.push({ p: [XP, 14.5, -60], t: 'Ascending passage', note: '39.3 m long at about 26°. Granite plug blocks still close its lower end.', x: true });
    L.push({ p: [XP, 37, -18], t: 'Grand Gallery', note: '46.68 m long and 8.6 m high, with a corbelled roof: each course of the walls steps in over the one below, seven times.', x: true, pri: 2 });
    L.push({ p: [5.2, 29, 0], t: 'Queen’s Chamber', note: 'Halfway between the north and south faces, 5.2 × 5.8 m, with a pointed roof 6.3 m high. Its name is a later guess; it was not a queen’s burial.', x: true, pri: 2 });
    L.push({ p: [2.6, 50, 11.4], t: 'King’s Chamber', note: 'Lined with red granite, 10.5 × 5.2 m and 5.8 m high, about 43 m above the base. The lidless granite sarcophagus is still inside.', x: true, pri: 3 });
    L.push({ p: [2.6, 67, 11.4], t: 'Relieving chambers', note: 'Five low spaces above the King’s Chamber, roofed with huge granite beams and, at the top, a pointed limestone roof. Workmen’s painted marks there name Khufu.', x: true, pri: 2 });
    L.push({ p: [XP, 48.5, 4.8], t: 'Antechamber', note: 'Once closed by sliding stone portcullis slabs.', x: true, maxD: 120 });
    L.push({ p: [kN[0], kN[1] - 4, kN[2] + 6], t: 'Air shafts', note: 'Narrow shafts about 20 cm square. The King’s Chamber’s reach the outside; the Queen’s end at small stone doors found by a robot in 1993.', x: true });
    L.push({ p: [XP - 1.6, 0, -34], t: 'Well shaft', note: 'A narrow, winding shaft linking the foot of the Grand Gallery with the descending passage, perhaps the workers’ way out after the plugs were slid down.', x: true, maxD: 260 });
    L.push({ p: [4, 9, -104], t: 'Al-Mamun’s tunnel', note: 'A robbers’ tunnel credited to the caliph al-Mamun, about AD 820. Visitors use it today.', x: true, maxD: 300 });
    L.push({ p: [0, 152, 0], t: 'Missing top', note: 'About 8 m of the top is gone; the pyramid is 138.5 m high today.', when: function (v) { return v.state === 'today'; } });
    L.push({ p: [0, 4, -half - 2], t: 'Casing stones that remain', note: 'A few casing stones of white Tura limestone survive at the foot of each side, best on the north.', when: function (v) { return v.state === 'today'; }, maxD: 420 });
    return { objects: obs, labels: L, radius: 200, sun: T.v.norm([0.6, 0.7, -0.35]), island: [0, 0, 250, 380] };
  }
  T.add({
    id: 'great-pyramid', icon: '◭', title: 'Inside the Great Pyramid', sub: 'Khufu, Fourth Dynasty, reigned c. 2589–2566 BC · passages, chambers and shafts, to scale',
    lead: 'The pyramid is drawn see-through so you can follow the passages from the entrance to the King’s Chamber. Passages are green, chambers gold, the granite rooms red and the shafts blue.',
    alt: 'A see-through Great Pyramid showing the descending passage, the subterranean chamber, the ascending passage, the Queen’s Chamber, the Grand Gallery, the King’s Chamber and the relieving chambers.',
    view: { t: [2, 22, -22], yaw: 1.9, pitch: 0.14, d: 215 }, minD: 4, maxD: 900, xray: true, xrayDefault: true, minPitch: -0.5, minY: -40,
    switches: [{ id: 'state', type: 'seg', label: 'Outside:', value: 'built', options: [['built', 'Original casing'], ['today', 'Today']] }],
    tour: [
      { title: 'The way in', cam: { t: [XPv(), 12, -96], yaw: 2.75, pitch: 0.16, d: 58 }, xray: true, set: { state: 'built' }, text: 'The original entrance is on the north face, about 17 m above the ground and a little east of center. From it the descending passage, barely wide enough to crawl, slopes down at about 26.5°.' },
      { title: 'The unfinished chamber', cam: { t: [2, -27, -2], yaw: 1.7, pitch: 0.12, d: 48 }, text: 'The passage runs on through the bedrock to a chamber about 27 m below the base. Its floor was never finished. Many scholars think the plan changed and burial moved up into the pyramid.' },
      { title: 'Up the ascending passage', cam: { t: [XPv(), 12, -60], yaw: 1.9, pitch: 0.12, d: 70 }, text: 'About 28 m in, a second passage climbs south at about 26°. Three granite plugs still block its lower end; robbers later dug around them, and today’s visitors use that tunnel.' },
      { title: 'The Queen’s Chamber', cam: { t: [5, 24, -6], yaw: 1.5, pitch: 0.18, d: 42 }, text: 'A level passage leads to a room with a pointed roof, right on the pyramid’s east–west center line. Its name was given by Arab explorers; no queen was buried there, and its use is unknown.' },
      { title: 'The Grand Gallery', cam: { t: [XPv(), 34, -20], yaw: 1.75, pitch: 0.1, d: 62 }, text: 'The gallery climbs 46.68 m at the same slope and rises 8.6 m high. Its walls step inward seven times toward a narrow roof: a corbelled vault, one of the boldest pieces of Old Kingdom building.' },
      { title: 'The King’s Chamber', cam: { t: [3, 46, 11], yaw: 1.3, pitch: 0.2, d: 36 }, text: 'The burial room is lined with red granite from Aswan and holds a granite sarcophagus without its lid. It sits about 43 m above the base, a little south of the pyramid’s center.' },
      { title: 'Relieving chambers', cam: { t: [3, 58, 11], yaw: 1.4, pitch: 0.12, d: 44 }, text: 'Above the flat granite ceiling are five low spaces stacked like a sandwich, the top one with a pointed roof, which spread the weight of the stone above. Painted marks left by the work gangs name Khufu.' },
      { title: 'The shafts', cam: { t: [3, 58, 0], yaw: 1.62, pitch: 0.08, d: 175 }, text: 'Two narrow shafts leave each upper chamber. They are not for air: many think they point the king’s spirit toward the stars. The King’s Chamber shafts reach the outside; the Queen’s end at small stone doors.' },
      { title: 'Casing and core', cam: { t: [0, 50, 0], yaw: 2.3, pitch: 0.12, d: 420 }, set: { state: 'today' }, xray: false, text: 'As built, the pyramid had smooth faces of fine white limestone and a point 146.6 m high. Most of the casing was carried off for building in Cairo, so today we see the stepped core, 138.5 m high.' },
      { title: 'What we don’t know', cam: { t: [4, 50, -10], yaw: 1.95, pitch: 0.16, d: 330 }, set: { state: 'built' }, xray: true, text: 'How the blocks were raised is still debated: straight, zigzag or wrapping ramps, or a ramp inside, which is one architect’s theory. None is drawn. In 2017 the ScanPyramids team reported a large empty space above the Grand Gallery, found with muon detectors; its shape and purpose are unknown, so it isn’t drawn either.' }
    ],
    build: gpBuild
  });
  function XPv() { return 7.6; }

  /* =========================================================== 3. a temple on the standard plan: Horus at Edfu */
  function column(m, x, z, y0, h, r, col, cap) {
    m.cyl(x, z, y0, y0 + h, r * 1.05, r, 8, col);
    m.cyl(x, z, y0 + h, y0 + h + r * 1.8, r, r * 1.65, 8, cap || col, { noBottom: true });
    m.box(x - r * 1.2, y0 + h + r * 1.8, z - r * 1.2, x + r * 1.2, y0 + h + r * 2.4, z + r * 1.2, col);
    return y0 + h + r * 2.4;
  }
  function edfuBuild() {
    var obs = [], L = [];
    var gnd = T.mesh().box(-220, -1.5, -200, 220, 0, 240, C.sand); obs.push(O(gnd));
    var st = T.mesh(), sh = T.mesh(), cols = T.mesh(), hcols = T.mesh(), inn = T.mesh(), dk = T.mesh();
    // pylon: two battered towers, about 36 m high, with a cornice; the gate between them
    [-1, 1].forEach(function (s) {
      st.frustum(s * 21, 78.5, 0, 34.5, 33, 11, 29, 7, C.stone, { ox: s * 2, edges: true });
      st.box(s * 21 + s * 2 - 15.3, 34.5, 74.2, s * 21 + s * 2 + 15.3, 36, 82.8, '#e4d6b2');
    });
    st.box(-4.6, 0, 74, 4.6, 22.5, 83, C.stone, { edges: true }); st.box(-5.2, 22.5, 73.6, 5.2, 24, 83.4, '#e4d6b2');
    dk.box(-2.4, 0, 83, 2.4, 13.5, 83.25, C.dark);
    var poles = T.mesh(); [-14.5, -8.5, 8.5, 14.5].forEach(function (x) { poles.cyl(x, 85, 0, 40, 0.45, 0.32, 6, '#7a5a34'); });
    obs.push(O(poles, { alphaFix: 0.45 }));
    // the enclosure wall and the court's outer walls
    sh.box(-25.5, 0, -57, -23, 12, 73.5, C.stone); sh.box(23, 0, -57, 25.5, 12, 73.5, C.stone); sh.box(-25.5, 0, -57, 25.5, 12, -54.5, C.stone);
    // court: paving, 32 columns on three sides (12 + 12 + 8), roofed colonnades
    st.box(-23, 0, 21, 23, 0.08, 73, '#e3d6b4');
    var zc = []; for (var i = 0; i < 12; i++) zc.push(65.6 - i * (65.6 - 25) / 11);
    zc.forEach(function (z) { column(cols, -19.4, z, 0.08, 10.6, 0.8, C.stone, '#c9d9b8'); column(cols, 19.4, z, 0.08, 10.6, 0.8, C.stone, '#c9d9b8'); });
    [-16.2, -12.9, -9.6, -6.3, 6.3, 9.6, 12.9, 16.2].forEach(function (x) { column(cols, x, 69.6, 0.08, 10.6, 0.8, C.stone, '#c9d9b8'); });
    sh.box(-23, 13.3, 21, -17.8, 14.6, 73, C.stone); sh.box(17.8, 13.3, 21, 23, 14.6, 73, C.stone); sh.box(-23, 13.3, 67.6, 23, 14.6, 73.5, C.stone);
    // the pronaos (first hypostyle hall): 18 columns in three rows of six, screen walls between the front columns
    var xs6 = [-16, -9.6, -3.2, 3.2, 9.6, 16];
    [20.3, 14.1, 8].forEach(function (z, r) { xs6.forEach(function (x) { column(hcols, x, z, 0.5, 11.6, 1.0, C.stone, r === 0 ? '#c9d9b8' : '#d8c9a0'); }); });
    [[-19, -17], [-15, -10.6], [-8.6, -4.2], [4.2, 8.6], [10.6, 15], [17, 19]].forEach(function (a) { st.box(a[0], 0.5, 19.8, a[1], 7.6, 20.9, C.stone); });
    sh.box(-19, 13.2, 19.6, 19, 16.5, 21, C.stone);                       // the front architrave and cornice
    sh.box(-19, 0.5, 3, -17.5, 16, 19.6, C.stone); sh.box(17.5, 0.5, 3, 19, 16, 19.6, C.stone); sh.box(-19, 15, 3, 19, 16.5, 19.6, C.stone, {});
    // the second hypostyle (festival hall): 12 columns
    [0.2, -4, -8.2].forEach(function (z) { [-9, -3, 3, 9].forEach(function (x) { column(hcols, x, z, 1, 9.4, 0.8, '#d8c9a0'); }); });
    sh.box(-16, 1, -11, -14.5, 13.5, 3, C.stone); sh.box(14.5, 1, -11, 16, 13.5, 3, C.stone); sh.box(-16, 12.3, -11, 16, 13.5, 3, C.stone); sh.box(-16, 1, 2, 16, 13.5, 3, C.stone, {});
    // offering hall, vestibule and the sanctuary block, each a little higher in floor and lower in roof
    sh.box(-16, 1.4, -17, 16, 12.6, -11, C.stone); sh.box(-16, 1.8, -23, 16, 12, -17, C.stone); sh.box(-16, 2.2, -48, 16, 11.4, -23, C.stone);
    st.box(-16, 0, -48, 16, 2.2, 3, '#cfbf98', { noBottom: true });
    // inside the sanctuary block: the sanctuary room, the naos of Nectanebo II and the barque stand
    inn.box(-5, 2.2, -36, -3.8, 9.6, -24, '#cdbb92'); inn.box(3.8, 2.2, -36, 5, 9.6, -24, '#cdbb92'); inn.box(-5, 2.2, -37.2, 5, 9.6, -36, '#cdbb92');
    inn.box(-0.8, 2.2, -35.6, 0.8, 5.7, -34, C.black); inn.frustum(0, -34.8, 5.7, 6.6, 1.6, 1.6, 0, 0, C.black);
    inn.box(-1, 2.2, -31, 1, 3.2, -28, '#b9a47a'); inn.box(-0.5, 3.2, -31.6, 0.5, 3.9, -27.4, C.gold);
    [-15.5, -10.5, 10.5, 15.5].forEach(function (x) { inn.box(x - 0.4, 2.2, -47.5, x + 0.4, 9.5, -24, '#cdbb92'); }); // chapel partitions (simplified)
    // two granite falcons of Horus at the pronaos door
    [-2.6, 2.6].forEach(function (x) { cols.box(x - 0.7, 0.08, 21.6, x + 0.7, 1.2, 23.4, C.black); cols.frustum(x, 22.6, 1.2, 3.8, 1.1, 1.6, 0.6, 0.9, C.black); cols.box(x - 0.3, 3.8, 22.4, x + 0.3, 4.4, 23.2, C.black); });
    obs.push(O(st, { edge: '#8a7550', edgeAlpha: 0.35 }), O(dk, { unlit: true }), O(sh, { shell: true, xa: 0.18, edge: '#8a7550', edgeAlpha: 0.3 }), O(cols), O(hcols, { inner: true }), O(inn, { inner: true }));
    var fig = T.mesh(); person(fig, 0, 0, 88); obs.push(O(fig));
    L.push({ p: [-21, 38, 78], t: 'Pylon', note: 'Two towers about 36 m high framing the gate: to the Egyptians, the horizon where the sun rose. Its front shows the king striking his enemies before Horus.', pri: 3 });
    L.push({ p: [14.5, 41, 85], t: 'Flagpoles', note: 'Tall wooden masts stood in four grooves on the front, flying pennants. They are long gone; their places are shown faintly.', maxD: 260 });
    L.push({ p: [0, 3, 47], t: 'Open court', note: 'A courtyard open to the sky with 32 columns on three sides. On feast days people could come this far.', pri: 2 });
    L.push({ p: [0, 18, 12], t: 'Hypostyle hall', note: 'The pronaos: a roofed hall of 18 columns in three rows, its front closed by low screen walls between the columns.', pri: 2 });
    L.push({ p: [0, 15, -4], t: 'Second hypostyle hall', note: 'A smaller hall of 12 columns, sometimes called the festival hall.' });
    L.push({ p: [-8, 14, -14], t: 'Offering hall', note: 'Where offerings were laid out for the god.' });
    L.push({ p: [8, 13.6, -20], t: 'Vestibule', note: 'A hall before the sanctuary, with stairs (not shown) up to the roof.', maxD: 200 });
    L.push({ p: [0, 13, -30], t: 'Sanctuary', note: 'The god’s room. It holds a black granite shrine of Nectanebo II, older than the temple around it, and a stand for the god’s boat. Chapels surround it.', pri: 2 });
    L.push({ p: [0, 8.2, -35], t: 'Naos of Nectanebo II', note: 'A shrine for the cult statue, cut from one block of black granite, from an earlier temple on this spot.', x: true, maxD: 120 });
    L.push({ p: [20, 13.5, -40], t: 'Ambulatory', note: 'A passage between the temple and its enclosure wall. The inner face of the wall tells the story of Horus and Seth.' });
    L.push({ p: [2.6, 6, 22.5], t: 'Horus falcons', note: 'Granite statues of Horus as a falcon guard the door of the hypostyle hall.', maxD: 140 });
    L.push({ p: [0, 2.1, 88], t: 'A person, 1.7 m', note: 'For scale.', maxD: 90, pri: 4 });
    return { objects: obs, labels: L, radius: 110, sun: T.v.norm([0.55, 0.75, 0.5]), island: [0, 12, 125, 185] };
  }
  T.add({
    id: 'edfu', icon: '⛩', title: 'A temple: Horus at Edfu', sub: 'Ptolemaic, 237–57 BC · pylon, court, hypostyle halls, sanctuary: the standard plan, best preserved here',
    lead: 'Edfu keeps its roof, walls and pylon almost whole, so it shows the classic Egyptian temple plan better than any other. Turn on See through (X) to look under the roofs.',
    alt: 'The Temple of Horus at Edfu from the south, with its tall pylon, the open court with columns, and the roofed halls leading to the sanctuary.',
    view: { t: [0, 6, 8], yaw: 0.55, pitch: 0.55, d: 200 }, minD: 3, maxD: 600, xray: true, minPitch: -0.1,
    tour: [
      { title: 'The pylon', cam: { t: [0, 17, 78], yaw: 0.3, pitch: 0.14, d: 120 }, xray: false, text: 'The temple faces south. Its pylon, two towers about 36 m high, framed the gate as the horizon frames the rising sun. Reliefs on the front show the king striking his enemies before Horus.' },
      { title: 'The open court', cam: { t: [0, 4, 48], yaw: 2.6, pitch: 0.62, d: 88 }, text: 'Behind the gate lies a court open to the sky, ringed on three sides by 32 columns. Ordinary people could enter this far on festival days, when Hathor of Dendera came by boat to visit Horus.' },
      { title: 'The hypostyle hall', cam: { t: [0, 7, 12], yaw: 0.55, pitch: 0.4, d: 70 }, xray: true, text: 'The first roofed hall has 18 columns with plant-shaped capitals, like a papyrus marsh turned to stone. Low screen walls between the front columns let in light from above and kept the inside from view.' },
      { title: 'The second hall', cam: { t: [0, 6, -4], yaw: 0.7, pitch: 0.45, d: 55 }, text: 'A smaller hall of 12 columns follows. With each room the floor rises a little, the roof comes lower and the light grows dimmer, until the inner rooms are almost dark.' },
      { title: 'The sanctuary', cam: { t: [0, 4, -31], yaw: 0.45, pitch: 0.5, d: 42 }, text: 'At the heart is the god’s room, with a black granite shrine made for Nectanebo II, more than a century older than the temple around it. Only the king, or the high priest in his place, went in, to tend the god’s statue each day.' },
      { title: 'The ambulatory', cam: { t: [18, 6, -30], yaw: 1.2, pitch: 0.5, d: 80 }, text: 'A tall enclosure wall surrounds the building with a passage between. Its reliefs tell how Horus defeated Seth, and the temple’s own building texts record its sizes and dates.' },
      { title: 'One plan for every temple', cam: { t: [0, 8, 10], yaw: 0.0, pitch: 1.2, d: 190 }, xray: true, text: 'Seen from above, the parts follow one axis: pylon, court, hypostyle hall, offering hall, sanctuary. Karnak, Luxor and Dendera use the same plan; some temples also had a quay and an avenue of sphinxes in front. Compare the plan below.' }
    ],
    build: edfuBuild
  });

  /* =========================================================== 4. Abu Simbel: the Great Temple and its move */
  var AS = { rock: '#c79d6a', rock2: '#b98d5c', rock3: '#d6b07e', cliff: '#b08356', cliff2: '#a07548' };
  function colossus(m, z, broken) {
    var R = AS.rock, R2 = AS.rock2, R3 = AS.rock3;
    m.box(0, 0, z - 4.3, 11.2, 1, z + 4.3, R2);                                // base
    m.box(0, 1, z - 4.0, 6.4, 8.3, z + 4.0, R);                                // throne, its back merged with the facade
    m.box(6.0, 1, z - 2.4, 8.7, 8.5, z + 2.4, R2);                             // shins, together
    m.box(6.0, 1, z - 2.6, 10.6, 2.0, z + 2.6, R2);                            // feet
    m.box(1.4, 8.3, z - 2.7, 9.1, 9.8, z + 2.7, R);                            // thighs and knees
    m.box(3.2, 9.8, z - 3.1, 8.8, 10.6, z - 1.9, R3); m.box(3.2, 9.8, z + 1.9, 8.8, 10.6, z + 3.1, R3); // forearms on the thighs
    [-1, 1].forEach(function (sd) { m.box(6.2, 1, z + sd * 3.3 - 0.6, 7.6, 5.0, z + sd * 3.3 + 0.6, R3); m.box(6.5, 5.0, z + sd * 3.3 - 0.4, 7.3, 5.8, z + sd * 3.3 + 0.4, R3); }); // family by his legs
    if (broken) return;
    m.frustum(3.0, z, 9.8, 14.4, 2.8, 4.4, 3.2, 7.0, R);                       // torso
    m.box(2.2, 10.4, z - 3.85, 4.0, 14.2, z - 3.0, R2); m.box(2.2, 10.4, z + 3.0, 4.0, 14.2, z + 3.85, R2); // upper arms
    m.frustum(2.6, z, 13.0, 17.1, 3.2, 5.6, 2.8, 3.4, R3);                     // nemes
    m.box(3.8, 12.4, z - 2.4, 4.6, 14.8, z - 1.4, R3); m.box(3.8, 12.4, z + 1.4, 4.6, 14.8, z + 2.4, R3); // lappets
    m.box(2.0, 14.6, z - 1.4, 4.6, 16.9, z + 1.4, R);                          // face
    m.box(4.4, 13.8, z - 0.35, 4.95, 14.7, z + 0.35, R2);                      // beard
    m.cyl(2.7, z, 17.1, 17.9, 1.7, 1.6, 10, R2);                               // the double crown: red crown
    m.cyl(2.7, z, 17.9, 19.6, 1.1, 0.55, 10, R3); m.cyl(2.7, z, 19.6, 20, 0.55, 0.2, 8, R3); // white crown
  }
  // a rock wing beside the facade: high next to it, falling away to the side (s = -1 north, 1 south)
  function wing(m, s) {
    var zi = 19 * s, zo = 50 * s, b = [[-64, -6, zi], [3, -6, zi], [-6, -6, zo], [-64, -6, zo]], t = [[-64, 33.5, zi], [0.6, 33.5, zi], [-12, 5, zo], [-64, 12, zo]];
    if (s < 0) { b.reverse(); t.reverse(); }
    m.rings(b, t, AS.cliff, { cols: { top: AS.rock2 } });
  }
  function asBuild() {
    var obs = [], L = [];
    function step(v) { return v.move == null ? 0 : v.move; }
    function off(v) { var s = step(v), up = M.min(1, s / 0.45), back = M.max(0, (s - 0.45) / 0.55); return [-208 * sm(0, 1, back), 65 * sm(0, 1, up), 0]; }
    var mv = function (v) { return { off: off(v) }; };
    // the land: river, the slope above the old site, the desert plateau on top
    function hgt(x, z) { var y; if (x > 45) y = -30; else if (x > 20) y = lerp(-1.2, -14, (x - 20) / 25); else if (x > -2) y = -1.2; else if (x > -150) y = lerp(-1.2, 62, sm(0, 1, (-2 - x) / 148)); else y = 62 + 3 * wob(x * 3, z * 3) * 10; return y; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    var land = T.mesh().terrain(-560, -440, 380, 440, 47, 44, hgt, function (x, z, y) { return shadeHex(y > 55 ? C.sand : y > 30 ? '#cfb07c' : AS.rock2, 0.97 + wob(x, z)); });
    obs.push(O(land, { noOcc: true }));
    // the temple and its cliff (they move together)
    var rk = T.mesh(), fac = T.mesh(), dk = T.mesh(), rooms = T.mesh(), pil = T.mesh();
    rk.box(-64, -6, -19, -0.6, 33.5, 19, AS.cliff, { noBottom: true });        // the cut facade and the rock behind
    wing(rk, -1); wing(rk, 1);
    rk.frustum(-33, 0, 33.5, 41, 62, 38, 44, 22, AS.cliff2, { ox: -6, noBottom: true });
    fac.box(-0.6, 27.6, -19, 0.7, 30.5, 19, AS.rock3);                          // cornice
    for (var i = 0; i < 22; i++) { var zb = -18.2 + i * (36.4 / 21); fac.box(-0.4, 30.5, zb - 0.55, 0.9, 32.2, zb + 0.55, AS.rock); fac.box(-0.1, 32.2, zb - 0.35, 0.8, 33, zb + 0.35, AS.rock2); } // 22 baboons
    fac.box(-0.6, -1.2, -26, 22, 0, 26, '#d9c39b');                             // terrace
    dk.box(-0.65, 0, -1.8, -0.55, 7, 1.8, C.dark);                              // the door
    dk.box(-0.65, 8.2, -2.6, -0.55, 17.5, 2.6, '#5c4a36');                     // the niche
    fac.box(-0.5, 8.4, -1.3, 1.2, 15.4, 1.3, AS.rock3); fac.box(-0.3, 15.4, -0.9, 1.6, 16.8, 0.9, AS.rock2); fac.cyl(0.6, 0, 16.8, 17.4, 0.9, 0.9, 8, '#c9774f'); // Ra-Horakhty, falcon-headed, with the sun disk
    colossus(fac, -15, false); colossus(fac, -6, false); colossus(fac, 6, true); colossus(fac, 15, false);
    // fallen head and torso of the broken colossus, left where they fell
    fac.box(11.5, 0, 3.0, 17.0, 4.0, 8.2, AS.rock); fac.frustum(19.5, 9.8, 0, 3.4, 4.2, 3.8, 3.4, 3.0, AS.rock3); fac.box(17.8, 0, 6.4, 21.0, 2.2, 8.2, AS.rock2);
    // the rooms inside: hypostyle hall (18 x 16.7 m, eight Osiris pillars), the second hall, vestibule and sanctuary
    rooms.box(-7, 0, -1.8, -0.6, 7, 1.8, C.gold); rooms.box(-25, 0, -8.35, -7, 9, 8.35, C.gold);
    rooms.box(-26, 0, -1.5, -25, 6, 1.5, C.gold); rooms.box(-37, 0.6, -5.6, -26, 6.6, 5.6, C.gold); rooms.box(-41, 0.9, -7.2, -37, 5.4, 7.2, C.gold); rooms.box(-45, 1.2, -2.2, -41, 5.2, 2.2, C.gold);
    [-9.6, -13.6, -17.6, -21.6].forEach(function (x) { [-3.4, 3.4].forEach(function (z) { pil.box(x - 0.8, 0, z - 0.8, x + 0.8, 9, z + 0.8, C.rock); pil.box(x - 0.5, 0, z - (z < 0 ? -0.8 : 1.6), x + 0.5, 8.2, z - (z < 0 ? -1.6 : 0.8), C.lime); }); });
    [-28.8, -34].forEach(function (x) { [-2.6, 2.6].forEach(function (z) { pil.box(x - 0.6, 0.6, z - 0.6, x + 0.6, 6.6, z + 0.6, C.rock); }); });
    [-1.5, -0.5, 0.5, 1.5].forEach(function (z) { pil.box(-44.9, 1.2, z - 0.4, -44.1, 3.0, z + 0.4, C.lime); });
    pil.box(-42.6, 1.2, -0.6, -41.8, 2.2, 0.6, C.rockDk);
    var mw = function (o) { o.anim = mv; return o; };
    obs.push(mw(O(rk, { shell: true, xa: 0.18 })), mw(O(fac, { edge: '#6b4e2e', edgeAlpha: 0.22 })), mw(O(dk, { unlit: true })), mw(O(rooms, { inner: true, alphaFix: 0.5, edge: '#7a5a10', edgeAlpha: 0.8 })), mw(O(pil, { inner: true })));
    // the sun's line on the old dates
    var ray = T.mesh().passage([60, 2.6, 0], [-44, 2.2, 0], 0.45, 0.45, '#ffd75e');
    obs.push(O(ray, { unlit: true, alphaFix: 0.55, when: function (v) { return v.sun && step(v) < 0.02; } }));
    // the Small Temple of Nefertari and Hathor, to the north
    var smt = T.mesh(); smt.prism([[-30, -138], [2, -138], [2, -110], [-30, -110]], -4, 14, C.rock); smt.prism([[-30, -150], [-2, -150], [4, -138], [-30, -138]], -4, 16, C.rock); smt.prism([[-30, -110], [4, -110], [-2, -98], [-30, -98]], -4, 16, C.rock);
    [-134, -129.5, -125, -123, -118.5, -114].forEach(function (z, k) { smt.box(2, 0, z - 1.1, 4.2, 9.6, z + 1.1, k === 2 || k === 3 ? C.lime : C.rockDk); smt.box(2.3, 9.6, z - 0.7, 3.9, 10.6, z + 0.7, C.rockDk); });
    smt.box(1.95, 0, -124.6, 2.05, 5.5, -123.4, C.dark);
    obs.push(mw(O(smt, { edge: '#6b4e2e', edgeAlpha: 0.2 })));
    // the artificial hill built over the moved temples (a concrete dome under rock fill)
    var hill = T.mesh(); hill.frustum(-246, 0, 60, 84, 104, 110, 66, 76, C.rock); hill.frustum(-252, 0, 84, 102, 66, 76, 30, 40, C.rock);
    obs.push(O(hill, { shell: true, xa: 0.18, when: function (v) { return step(v) > 0.97; } }));
    var water = T.mesh().face([[-560, 0, -440], [380, 0, -440], [380, 0, 440], [-560, 0, 440]], C.water, [0, 1, 0]);
    obs.push(O(water, { ds: true, alphaFix: 0.8, anim: function (v) { return { off: [0, lerp(-14, 45, sm(0.5, 1, step(v))), 0] }; } }));
    var fig = T.mesh(); person(fig, 16, 0, -21); obs.push(mw(O(fig)));
    var la = function (v) { return off(v); };
    L.push({ p: [8, 22.5, -15], t: 'Colossi of Ramesses II', note: 'Four seated statues of the king, each about 20 m high, cut from the living rock.', anim: la, pri: 3 });
    L.push({ p: [8, 11.5, 6], t: 'Broken colossus', note: 'An earthquake brought down its head and torso, probably within the king’s own reign. The pieces were left at its feet, and the engineers kept them that way.', anim: la, pri: 2 });
    L.push({ p: [1.5, 19, 0], t: 'Ra-Horakhty', note: 'The falcon-headed sun god stands in a niche over the door; with his symbols he spells out the king’s throne name, User-maat-Ra.', anim: la });
    L.push({ p: [0.5, 35, -9], t: 'Baboon frieze', note: 'Twenty-two baboons with raised hands greet the rising sun along the top.', anim: la, maxD: 240 });
    L.push({ p: [-16, 10, 0], t: 'Hypostyle hall', note: '18 × 16.7 m, with eight pillars carved as the king in the form of Osiris.', x: true, anim: la, pri: 2 });
    L.push({ p: [-43, 6.2, 0], t: 'Sanctuary', note: 'Four seated gods: Ptah, Amun-Ra, Ramesses himself and Ra-Horakhty.', x: true, anim: la, pri: 2 });
    L.push({ p: [2, 18, -124], t: 'Small Temple', note: 'For Queen Nefertari and the goddess Hathor, with six standing statues: four of the king and two of the queen.', anim: la });
    L.push({ p: [40, 46, 60], t: 'Lake Nasser', note: 'The reservoir behind the Aswan High Dam. Its water covers the temple’s first site.', when: function (v) { return step(v) > 0.8; } });
    L.push({ p: [4, 49, 0], t: 'The old site, now under water', note: 'The temple stood here until 1964.', when: function (v) { return step(v) > 0.8; } });
    L.push({ p: [-250, 104, 0], t: 'Artificial hill', note: 'A concrete dome covered with rock, built over the rebuilt temple to look like the old cliff.', when: function (v) { return step(v) > 0.97; } });
    L.push({ p: [16, 2.1, -21], t: 'A person, 1.7 m', note: 'For scale.', anim: la, maxD: 70, pri: 4 });
    return { objects: obs, labels: L, radius: 220, sun: T.v.norm([0.8, 0.55, -0.25]), island: [-110, 0, 300, 430] };
  }
  T.add({
    id: 'abu-simbel', icon: '𓀀', title: 'Abu Simbel and its move', sub: 'Ramesses II, c. 1264–1244 BC · the Great Temple’s facade, its rooms, and the move of 1964–68',
    lead: 'The Great Temple’s facade, about 33 m high and 38 m wide. Slide or play the move to see how it was cut up, lifted 65 m and set back 208 m from the rising lake.',
    alt: 'The facade of the Great Temple at Abu Simbel with its four seated colossi of Ramesses II, one broken, by the Nile; a slider moves the temple up to its new site above Lake Nasser.',
    view: { t: [6, 14, -2], yaw: 1.2, pitch: 0.1, d: 105 }, minD: 3, maxD: 900, xray: true, panLimit: 420, minPitch: -0.05,
    switches: [{ id: 'move', type: 'range', label: 'The move:', value: 0, ends: ['1963', '1968'], play: 'Play the move', back: 'Back to 1963', dur: 4200 }],
    tour: [
      { title: 'A temple cut into a cliff', cam: { t: [6, 14, -2], yaw: 1.25, pitch: 0.1, d: 105 }, set: { move: 0, sun: false }, xray: false, text: 'Ramesses II had the Great Temple carved straight into a sandstone cliff by the Nile in Nubia, the land south of Egypt. Ships coming downriver met four giant images of the king.' },
      { title: 'The colossi', cam: { t: [8, 12, 0], yaw: 1.5, pitch: 0.05, d: 55 }, text: 'Each seated statue is about 20 m high and wears the double crown. Small figures of his mother, wives and children stand by his legs. The one left of the door lost its head and torso in an earthquake.' },
      { title: 'The sun god over the door', cam: { t: [2, 15, 0], yaw: 1.6, pitch: 0.02, d: 28 }, text: 'Above the door, Ra-Horakhty stands in a niche, and 22 baboons line the top. The temple faces east, toward the sunrise.' },
      { title: 'Into the mountain', cam: { t: [-22, 4, 0], yaw: 1.15, pitch: 0.55, d: 70 }, xray: true, text: 'Inside, a hall of eight pillars carved as Osiris leads to a second hall and the sanctuary, all cut from the rock. Battle scenes on the walls show the Battle of Kadesh.' },
      { title: 'The sun reaches the gods', cam: { t: [-10, 4, 0], yaw: 1.45, pitch: 0.3, d: 75 }, set: { sun: true }, text: 'On about 22 February and 22 October, the rising sun shone down the whole length of the temple onto three of the four gods in the sanctuary. Ptah, a god linked with the underworld, stayed in the dark.' },
      { title: 'A lake is coming', cam: { t: [-90, 20, 0], yaw: 1.1, pitch: 0.3, d: 380 }, set: { sun: false }, xray: false, text: 'In the 1960s the new Aswan High Dam began to fill Lake Nasser, which would drown the temples. UNESCO led an appeal, and Egypt and many other countries paid for a rescue.' },
      { title: 'Cut, lifted, rebuilt', cam: { t: [-100, 40, 0], yaw: 1.05, pitch: 0.3, d: 420 }, set: { move: 1 }, text: 'From 1964 to 1968 engineers sawed the temples into 1,036 blocks (807 for the Great Temple), lifted them 65 m higher and 208 m back from the river, and rebuilt them against a concrete dome covered with rock to look like the old cliff.' },
      { title: 'Abu Simbel today', cam: { t: [-205, 79, 0], yaw: 1.3, pitch: 0.12, d: 120 }, text: 'The temples now face the lake from their new hill, still lined up with the sunrise. The broken colossus was rebuilt as it was found, with its pieces at its feet.' }
    ],
    build: asBuild
  });

  /* =========================================================== 5. KV62, the tomb of Tutankhamun */
  function kvBuild() {
    var obs = [], L = [], top = 6.4;
    var vfl = T.mesh().box(-60, top - 0.6, -50, 80, top, 40, '#d7b98a');
    vfl.loop([[11.6, top, -1.95], [19.6, top, -1.95], [19.6, top, -0.25], [11.6, top, -0.25]]);
    obs.push(O(vfl, { shell: true, xa: 0.14, edge: '#6e5200', edgeAlpha: 0.6 }));
    var fl = T.mesh(), rm = T.mesh(), pt = T.mesh();
    function room(x0, z0, x1, z1, y0, h, col) { fl.box(x0, y0 - 0.05, z0, x1, y0, z1, C.stone); rm.box(x0, y0, z0, x1, y0 + h, z1, col, { edges: true }); }
    // the stairway: 16 steps down to the west
    for (var i = 0; i < 16; i++) { var x0 = 11.6 + i * 0.5, y0 = 1.6 + i * 0.3; fl.box(x0, y0 - 0.3, -1.95, x0 + 0.5, y0, -0.25, C.stone); }
    rm.rings([[11.6, 1.6, -1.95], [19.6, top, -1.95], [19.6, top, -0.25], [11.6, 1.6, -0.25]], [[11.6, top, -1.95], [19.6, top + 0.001, -1.95], [19.6, top + 0.001, -0.25], [11.6, top, -0.25]], C.gold, { edges: true });
    rm.passage([11.6, 1.6, -1.1], [3.6, 0, -1.1], 1.7, 2.0, C.gold);                                  // corridor, 8 m
    room(0, -7.9, 3.6, 0, 0, 2.68, C.gold);                                                          // antechamber, 7.9 x 3.6 m
    room(-3.4, -4.0, -0.8, 0.4, -0.9, 2.55, C.gold); rm.box(-0.8, -0.9, -1.2, 0, 0.5, -0.4, C.gold);   // annexe, 4.4 x 2.6 m, and its low door
    room(-0.6, -12.5, 5.8, -8.5, -0.9, 3.63, C.paint); rm.box(1.2, -0.9, -8.5, 2.4, 1.8, -7.9, C.gold); // burial chamber, 4 x 6.4 m: the only painted room
    room(6.4, -13.3, 10.2, -8.5, -0.9, 2.33, C.gold); rm.box(5.8, -0.9, -10.6, 6.4, 1.2, -9.6, C.gold); // treasury, 4.8 x 3.8 m
    obs.push(O(fl, { inner: true }), O(rm, { inner: true, alphaFix: 0.32, edge: '#7a5a10', edgeAlpha: 0.9 }));
    // as found, 1922-23: the antechamber's couches and chariots, the guardian statues, the gilded shrine, the Anubis and canopic shrines
    var f = T.mesh();
    [[-6.9, -5.1], [-4.9, -3.1], [-2.9, -1.1]].forEach(function (z) { f.box(0.15, 0, z[0], 0.95, 1.3, z[1], C.gold); });
    f.box(2.5, 0, -6.5, 3.45, 1.1, -3.6, '#b98a3a');
    [0.45, 3.0].forEach(function (x) { f.box(x - 0.25, 0, -7.75, x + 0.25, 1.9, -7.3, C.black); f.box(x - 0.2, 1.7, -7.7, x + 0.2, 1.95, -7.35, C.gold); });
    f.box(-3.2, -0.9, -3.6, -1.0, 0.3, 0.2, '#b98a3a');
    f.box(0.06, -0.9, -12.14, 5.14, 1.85, -8.86, C.gold);                                             // outer shrine 5.08 x 3.28 x 2.75 m
    f.box(6.5, -0.9, -10.4, 7.6, -0.3, -9.8, C.black); f.box(6.7, -0.3, -10.3, 7.4, 0.15, -9.9, C.black); // Anubis on his chest
    f.box(8.8, -0.9, -11.6, 10.0, 1.1, -10.1, C.gold);                                              // canopic shrine
    obs.push(O(f, { inner: true, when: function (v) { return v.state === 'found'; } }));
    var td = T.mesh(); td.box(1.0, -0.9, -11.25, 3.75, 0.55, -9.75, '#a36a4f'); td.box(0.6, 0, -6.0, 2.6, 0.9, -4.8, C.glass);
    obs.push(O(td, { inner: true, when: function (v) { return v.state === 'today'; } }));
    var fig = T.mesh(); person(fig, 1.8, 0, -3); obs.push(O(fig, { inner: true }));
    L.push({ p: [17, top + 0.8, -1.1], t: 'Stairway', note: 'Sixteen steps cut down into the valley floor, heading west.', pri: 2 });
    L.push({ p: [8, 3.3, -1.1], t: 'Corridor', note: '8 m long and 1.7 m wide, sloping down. Robbers broke in twice soon after the burial; the corridor was then packed with rubble.' });
    L.push({ p: [1.8, 3.2, -5], t: 'Antechamber', note: '7.9 × 3.6 m. It held 600 to 700 objects: couches, chariots, boxes and chairs.', pri: 3 });
    L.push({ p: [-2.1, 2.2, -2], t: 'Annexe', note: '4.4 × 2.6 m, a step down. Over 2,000 objects, piled high: food, oils, weapons, shabti figures.', pri: 2 });
    L.push({ p: [2.6, 3.4, -10.5], t: 'Burial chamber', note: '4 × 6.4 m, the only room with painted walls, showing the funeral and the king with the gods. The king’s body is still in the tomb.', pri: 3 });
    L.push({ p: [8.3, 2.0, -11], t: 'Treasury', note: '4.8 × 3.8 m. It held the canopic chest and many boxes of jewelry and models.', pri: 2 });
    L.push({ p: [1.7, 2.4, -7.5], t: 'Guardian statues', note: 'Two life-size statues of the king in black and gold stood at the sealed burial chamber door.', when: function (v) { return v.state === 'found'; }, maxD: 26 });
    L.push({ p: [2.6, 2.3, -9.2], t: 'Gilded shrine', note: 'The outermost of four nested gilded shrines, 5.08 × 3.28 m, nearly filling the room. Inside: the stone sarcophagus and three coffins, the innermost of solid gold.', when: function (v) { return v.state === 'found'; }, maxD: 30 });
    L.push({ p: [2.4, 1.0, -10.5], t: 'Sarcophagus', note: 'The quartzite sarcophagus is still here; the shrines and coffin treasures went to Cairo.', when: function (v) { return v.state === 'today'; }, maxD: 30 });
    L.push({ p: [7.0, 0.7, -10.1], t: 'Anubis shrine', note: 'A black jackal of Anubis on a gilded chest guarded the treasury door.', when: function (v) { return v.state === 'found'; }, maxD: 26 });
    L.push({ p: [9.4, 1.5, -10.8], t: 'Canopic shrine', note: 'A gilded shrine guarded by four goddesses, holding the alabaster chest for the king’s organs.', when: function (v) { return v.state === 'found'; }, maxD: 26 });
    return { objects: obs, labels: L, radius: 26, sun: T.v.norm([0.4, 0.8, 0.45]), island: [5, -4, 24, 36] };
  }
  T.add({
    id: 'kv62', icon: '⚱', title: 'The tomb of Tutankhamun', sub: 'KV62, Valley of the Kings · c. 1327 BC · found by Howard Carter, November 1922',
    lead: 'A small tomb with a famous treasure. The rock is see-through so you can see the stairway, the corridor and the four rooms, with the main finds where Carter’s team recorded them.',
    alt: 'A see-through plan of Tutankhamun’s tomb: a stairway and corridor lead west to the antechamber, with the annexe to the southwest, the burial chamber to the north and the treasury beside it.',
    view: { t: [4, 0, -5], yaw: 0.7, pitch: 0.62, d: 36 }, minD: 2, maxD: 140, xray: true, xrayDefault: true, panLimit: 40, minPitch: -0.3, minY: -6, maxY: 20,
    switches: [{ id: 'state', type: 'seg', label: 'Show:', value: 'found', options: [['found', 'As found, 1922–23'], ['today', 'Today']] }],
    tour: [
      { title: 'Steps in the valley floor', cam: { t: [15, 4, -1], yaw: 0.9, pitch: 0.4, d: 22 }, set: { state: 'found' }, text: 'On 4 November 1922 Carter’s workmen uncovered the first of sixteen steps. Huts of the men who built a later tomb above had hidden the entrance for three thousand years.' },
      { title: 'The corridor', cam: { t: [8, 1, -1], yaw: 1.2, pitch: 0.35, d: 16 }, text: 'A sloping corridor 8 m long, packed with rubble after robbers had broken in, led to a sealed door. On 26 November Carter looked through a hole and saw “wonderful things.”' },
      { title: 'The antechamber', cam: { t: [1.8, 1, -4], yaw: 0.6, pitch: 0.6, d: 15 }, text: 'The first room held couches shaped like animals, dismantled chariots, chests and chairs. Two statues of the king guarded a sealed door in the north wall.' },
      { title: 'The annexe', cam: { t: [-2, 0, -2], yaw: -0.4, pitch: 0.55, d: 13 }, text: 'Through a low hole, a small storeroom was crammed with more than 2,000 objects: food, oils, wine jars, weapons and shabti figures.' },
      { title: 'The burial chamber', cam: { t: [2.6, 0.5, -10.5], yaw: 0.3, pitch: 0.55, d: 16 }, text: 'In February 1923 the sealed door was opened. A gilded shrine nearly filled the only painted room; inside it were three more shrines, a stone sarcophagus and three nested coffins, the innermost of solid gold.' },
      { title: 'The treasury', cam: { t: [8.3, 0.5, -11], yaw: 1.0, pitch: 0.55, d: 14 }, text: 'A black jackal of Anubis lay on a chest at the doorway. Behind it stood the gilded canopic shrine. Recording and removing everything took Carter’s team about ten years.' },
      { title: 'A small tomb', cam: { t: [4, 0, -5], yaw: 0.0, pitch: 1.25, d: 40 }, set: { state: 'today' }, text: 'For a king, KV62 is tiny, perhaps a tomb made for someone else and finished in a hurry when the young king died. Tutankhamun’s mummy and the quartzite sarcophagus are still in the tomb; the treasures are in Cairo.' }
    ],
    build: kvBuild
  });

  /* =========================================================== 6. a mastaba */
  function maBuild() {
    var obs = [], L = [], H = 8;
    var bed = T.mesh().box(-55, -22, -55, 55, 0, 55, C.bed, { cols: { top: C.sand } }); obs.push(O(bed, { shell: true, xa: 0.2 }));
    var mb = T.mesh(); mb.frustum(0, 0, 0, H, 12, 32, 9, 29, C.stone, { edges: true, noBottom: true });
    for (var cy = 0.8; cy < H - 0.1; cy += 0.8) { var hw = 6 - 1.5 * cy / H, hd = 16 - 1.5 * cy / H; mb.loop([[-hw, cy, -hd], [hw, cy, -hd], [hw, cy, hd], [-hw, cy, hd]]); } obs.push(O(mb, { shell: true, xa: 0.16, edge: '#8a7550', edgeAlpha: 0.5 }));
    var sp = T.mesh(), fx = T.mesh(), dk = T.mesh();
    sp.box(1.0, 0, 5, 4.2, 3.5, 11, C.gold, { edges: true });                          // the offering chapel
    sp.box(4.2, 0, 9.4, 5.9, 2.6, 10.6, C.gold);                                        // its door from the east
    sp.box(-2.6, 0.3, 5.6, -0.6, 3.0, 8.6, '#c98a7c', { edges: true });                 // the serdab
    sp.box(-0.6, 1.8, 6.9, 1.0, 2.0, 7.3, '#c98a7c');                                   // the slot into the chapel
    sp.box(-2, -15, -7, 0, H, -5, '#9a8a6c', { edges: true });                          // the shaft, filled with rubble after the burial
    sp.box(-2.6, -15, -5, 1.4, -12.4, -1.4, C.gold, { edges: true });                   // the burial chamber, cut into the bedrock
    obs.push(O(sp, { inner: true, alphaFix: 0.42, edge: '#7a5a10', edgeAlpha: 0.9 }));
    fx.box(0.85, 0, 6.9, 1.0, 3.2, 8.9, '#efe5c8'); fx.box(1.0, 0, 7.6, 1.05, 2.4, 8.2, C.rockDk); // false door
    fx.box(1.3, 0, 7.5, 1.9, 0.5, 8.3, C.stone);                                        // offering table
    fx.box(-1.8, 0.3, 6.8, -1.3, 1.9, 7.4, C.lime);                                     // statue in the serdab
    fx.box(-1.8, -15, -4.2, 0.6, -13.9, -2.4, C.lime);                                  // sarcophagus
    fx.box(-0.4, -14.95, -7.2, 0.9, -14.4, -6.6, '#8c7a58');                            // the blocking stone
    obs.push(O(fx, { inner: true }));
    dk.face([[6.02, 0, 9.5], [6.02, 0, 10.5], [6.02 - 2.5 * 1.5 / H, 2.5, 10.5], [6.02 - 2.5 * 1.5 / H, 2.5, 9.5]], C.dark, [1, 0.19, 0]); obs.push(O(dk, { unlit: true, ds: true }));
    var fig = T.mesh(); person(fig, 8.5, 0, 10); obs.push(O(fig));
    L.push({ p: [0, H + 2, 0], t: 'Mastaba', note: 'A flat-topped tomb with sloping sides, here 32 × 12 m and 8 m high, a typical size. The name is Arabic for “bench.”', pri: 3, notX: false });
    L.push({ p: [2.6, 4.4, 8], t: 'Offering chapel', note: 'The room the family and priests could enter, to bring food and drink and say the offering prayers.', pri: 2 });
    L.push({ p: [1, 3.6, 7.9], t: 'False door', note: 'A carved stone doorway that does not open. The dead person’s spirit was thought to pass through it to receive the offerings.', x: true, maxD: 40 });
    L.push({ p: [-1.6, 3.4, 7], t: 'Serdab', note: 'A sealed room for a statue of the owner, with a slot so the statue could “see” the offerings.', x: true, maxD: 45 });
    L.push({ p: [-1, -6, -6], t: 'Shaft', note: 'A square shaft from the roof down into the bedrock, filled with rubble after the burial to stop robbers.', x: true, pri: 2 });
    L.push({ p: [-0.6, -11.8, -3.2], t: 'Burial chamber', note: 'Cut into the rock at the foot of the shaft, with a stone sarcophagus. The door was blocked with a slab.', x: true, pri: 2 });
    L.push({ p: [8.5, 2.1, 10], t: 'A person, 1.7 m', note: 'For scale.', maxD: 50, pri: 4 });
    return { objects: obs, labels: L, radius: 30, sun: T.v.norm([0.6, 0.7, 0.35]), island: [0, 0, 34, 50] };
  }
  T.add({
    id: 'mastaba', icon: '▬', title: 'A mastaba tomb', sub: 'Early Dynastic and Old Kingdom, c. 3000–2160 BC · a typical tomb of an official, not one particular tomb',
    lead: 'Above ground, a chapel where the family brought offerings; below, a deep shaft to the burial chamber. Turn on See through (X) to look inside.',
    alt: 'A mastaba: a long, flat-topped stone tomb with sloping walls, its chapel and false door on the east side, a statue room, and a shaft down to a burial chamber in the rock.',
    view: { t: [0, 0, 0], yaw: 0.9, pitch: 0.42, d: 62 }, minD: 2, maxD: 220, xray: true, panLimit: 40, minPitch: -0.4, minY: -20,
    tour: [
      { title: 'A house for eternity', cam: { t: [0, 3, 0], yaw: 0.85, pitch: 0.3, d: 46 }, xray: false, text: 'Kings of the first dynasties, and then officials and their families for centuries, were buried in mastabas: long tombs with flat tops and sloping walls, of mud brick or stone. Many line the streets of the cemeteries at Saqqara and Giza.' },
      { title: 'The chapel', cam: { t: [3, 1.5, 8], yaw: 1.2, pitch: 0.45, d: 20 }, xray: true, text: 'A door on the east side led into the offering chapel. Its walls were carved with the owner’s name and titles and with scenes of daily life and offering bearers.' },
      { title: 'The false door', cam: { t: [1.2, 1.6, 7.9], yaw: 1.5, pitch: 0.12, d: 3.2 }, text: 'In the west wall stands a false door, a stone carved like a doorway. Egyptians believed the spirit (the ka) came through it to take the offerings laid on the table in front.' },
      { title: 'The serdab', cam: { t: [-1, 1.5, 7], yaw: 0.6, pitch: 0.3, d: 11 }, text: 'Behind the wall, a closed room held a statue of the owner, with only a narrow slot into the chapel.' },
      { title: 'Down the shaft', cam: { t: [-0.6, -7, -4], yaw: 0.9, pitch: 0.15, d: 40 }, text: 'From the roof a square shaft went straight down into the bedrock. After the funeral the coffin rested in the chamber at the bottom, the door was blocked, and the shaft was filled with rubble.' },
      { title: 'From mastaba to pyramid', cam: { t: [0, 0, 0], yaw: 2.2, pitch: 0.5, d: 75 }, xray: false, text: 'Djoser’s Step Pyramid at Saqqara began as a square mastaba and grew into six steps, one on top of another: the first pyramid. Officials kept building mastabas around the kings’ pyramids.' }
    ],
    build: maBuild
  });
})(window);
