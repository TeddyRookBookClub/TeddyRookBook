/* Optics Bench: the page. Draws the bench, the pieces and the rays on one canvas, runs the controls and the missions.
   The optics lives in physics.js (window.OpticsModel): lengths in cm, wavelengths in nm, y pointing up. */
(function () {
  'use strict';
  var LAB = window.TRBLab, M = window.OpticsModel;
  var root = document.getElementById('optics-lab');
  if (!root || !LAB || !M) return;
  function $(id) { return document.getElementById(id); }
  var view = $('optics-view'), cv = $('optics-cv'), K = LAB.canvas(cv), ctx = K.c;
  var D2R = Math.PI / 180, fmt = LAB.fmt, reduced = LAB.reduced, ui = LAB.store('optics-ui');
  var C = { ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', bg: '#06111a' };
  var NAMES = { laser: 'Laser', lamp: 'Lamp', sun: 'Sunlight', mirror: 'Flat mirror', cmirror: 'Curved mirror', lens: 'Convex lens', dlens: 'Concave lens', block: 'Glass block', prism: 'Prism', drop: 'Water drop', screen: 'Screen', target: 'Target', wall: 'Wall', eye: 'Eye' };
  var COLOR_TXT = { red: 'Red 650 nm', yellow: 'Yellow 589 nm', green: 'Green 532 nm', blue: 'Blue 450 nm', violet: 'Violet 405 nm', white: 'White' };
  var MAX_PIECES = 16;

  // ---------- colors of light ----------
  function bruton(w) {
    var r = 0, g = 0, b = 0;
    if (w < 440) { r = (440 - w) / 60; b = 1; } else if (w < 490) { g = (w - 440) / 50; b = 1; } else if (w < 510) { g = 1; b = (510 - w) / 20; }
    else if (w < 580) { r = (w - 510) / 70; g = 1; } else if (w < 645) { r = 1; g = (645 - w) / 65; } else r = 1;
    var f = w < 420 ? 0.3 + 0.7 * (w - 380) / 40 : w > 700 ? 0.3 + 0.7 * (780 - w) / 80 : 1;
    return [r * f, g * f, b * f];
  }
  // the nine colors of white light are balanced so that together they add up to white
  var WB = (function () {
    var s = [0, 0, 0], i, c, mx = 0;
    for (i = 0; i < M.WHITE.length; i++) { c = bruton(M.WHITE[i]); s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; }
    var w = [1 / s[0], 1 / s[1], 1 / s[2]];
    for (i = 0; i < M.WHITE.length; i++) { c = bruton(M.WHITE[i]); mx = Math.max(mx, c[0] * w[0], c[1] * w[1], c[2] * w[2]); }
    return { w: [w[0] / mx, w[1] / mx, w[2] / mx], gain: mx };
  })();
  var colCache = {};
  function lamRGB(lam, white) {
    var key = lam + (white ? 'w' : 's');
    if (colCache[key]) return colCache[key];
    var c = bruton(lam), m;
    if (white) c = [c[0] * WB.w[0], c[1] * WB.w[1], c[2] * WB.w[2]];
    else { m = Math.max(c[0], c[1], c[2]) || 1; c = [c[0] / m, c[1] / m, c[2] / m]; }
    return (colCache[key] = c);
  }
  function css(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + (a === undefined ? 1 : a) + ')'; }
  function hueName(c) {
    var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]), h;
    if (mx <= 0) return 'nothing';
    if ((mx - mn) / mx < 0.3) return 'white';
    if (mx === c[0]) h = 60 * (((c[1] - c[2]) / (mx - mn)) % 6); else if (mx === c[1]) h = 60 * ((c[2] - c[0]) / (mx - mn) + 2); else h = 60 * ((c[0] - c[1]) / (mx - mn) + 4);
    if (h < 0) h += 360;
    return h < 18 || h >= 320 ? 'red' : h < 42 ? 'orange' : h < 70 ? 'yellow' : h < 165 ? 'green' : h < 200 ? 'blue-green' : h < 255 ? 'blue' : 'violet';
  }
  function colorName(lam) { return lam < 440 ? 'violet' : lam < 490 ? 'blue' : lam < 565 ? 'green' : lam < 590 ? 'yellow' : lam < 620 ? 'orange' : 'red'; }

  // ---------- state ----------
  var S = {
    scene: 'snell', pieces: [], sel: 0, ideal: !!ui.get('ideal', false), angles: ui.get('angles', true) !== false, weak: ui.get('weak', true) !== false,
    tr: null, meas: null, dirty: true, raysDirty: true, reveal: 1e9, revealing: false, time: 0, drag: null, hover: null,
    pw: 0, ph: 0, eye: null, readKey: '', hudKey: '', selKey: ''
  };
  var V = { k: 6, ox: 0, oy: 0, narrow: false };
  var RC = document.createElement('canvas'), rctx = RC.getContext('2d');   // the rays, redrawn only when they change
  var BG = document.createElement('canvas'), bctx = BG.getContext('2d');   // the table and its grid

  var el = {
    scenes: $('optics-scenes'), note: $('optics-note'), add: $('optics-add'), selbox: $('optics-selbox'), sel: $('optics-sel'), selinfo: $('optics-selinfo'),
    ideal: $('optics-ideal'), angles: $('optics-angles'), weak: $('optics-weak'), read: $('optics-read'), hud: $('optics-hud'),
    tAngles: $('optics-t-angles'), tWeak: $('optics-t-weak'), tReset: $('optics-t-reset')
  };

  // ---------- missions ----------
  var MISSIONS = [
    { id: 'snell', title: 'Bend a beam', goal: 'Turn the laser so it enters the glass block at 20° or more from straight on, and watch the beam bend.' },
    { id: 'mirrors', title: 'Around the wall', goal: 'Turn the two mirrors so the laser gets over the wall and hits the target.' },
    { id: 'tir', title: 'Trap the light', goal: 'Aim the laser into the end of the glass rod so it bounces along inside by total internal reflection, three times or more in a row.' },
    { id: 'focus', title: 'Focus sunlight', goal: 'Move the screen until sunlight through the convex lens makes a spot 3 mm wide or less. Its distance from the lens is the focal length.' },
    { id: 'image', title: 'Make an image', goal: 'Move the screen (or the lamp) until the lamp’s rays meet in a sharp point on the screen, under 0.8 mm. Then compare with 1/f = 1/dₒ + 1/dᵢ.' },
    { id: 'prism', title: 'Split white light', goal: 'Put the prism in the white beam and catch a spectrum at least 1 cm wide on the screen.' },
    { id: 'rainbow', title: 'The rainbow angle', goal: 'Move the eye around the raindrop to where the returning sunlight piles up: the rainbow, about 42° from the line back to the Sun.' },
    { id: 'second', title: 'The second bow', goal: 'Find the fainter second rainbow, about 51° out. Its colors come in the opposite order.' }
  ];
  var PICK = {
    snell: ['snell', 'Drag the laser’s round handle to tilt it.'], mirrors: ['mirrors', 'Select a mirror and drag its round handle to turn it.'],
    tir: ['fiber', 'Turn the laser to aim at the left end of the rod.'], focus: ['lens', 'Drag the screen toward the lens.'],
    image: ['image', 'Drag the screen toward the lens until the spot is a point.'], prism: ['prism', 'Drag the prism down into the white beam.'],
    rainbow: ['rainbow', 'Drag the eye up and around the drop.'], second: ['rainbow', 'Drag the eye farther around, past the dark band.']
  };
  var MS = LAB.missions($('optics-missions'), 'optics', MISSIONS, function (id) { var p = PICK[id]; if (!p) return; loadScene(p[0]); toastQ = []; toastAt = -10; say(p[1]); });
  var toastQ = [], toastAt = -10;
  function say(text) { toastQ.push(text); pumpToasts(); }
  function pumpToasts() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.9) { toastAt = now; LAB.toast(view, toastQ.shift()); } }
  function win(id, text) { if (MS.done(id)) { var m = MISSIONS.filter(function (x) { return x.id === id; })[0]; say('✓ ' + m.title + ': ' + text); } }

  // ---------- scenes ----------
  var NOTES = {
    snell: 'A laser shines straight down onto a block of BK7 glass. Tilt the laser (drag its round handle) so the beam hits the glass at a slant.',
    mirrors: 'A wall hides the target. Turn the two mirrors (select one, then drag its round handle) to send the laser over the wall.',
    fiber: 'A long glass rod, like a thick optical fiber. Aim the laser into its left end and watch the light stay inside.',
    lens: 'Sunlight through a convex lens onto a screen. Drag the screen toward the lens until the spot is as small as it gets.',
    image: 'A lamp, a convex lens and a screen. Move the screen until the lamp’s rays meet in one sharp point.',
    prism: 'A narrow beam of white light. Drag the prism into the beam and catch the colors on the screen.',
    rainbow: 'Sunlight falls on a raindrop, drawn a hundred times too big. Drag the eye around the drop and watch the graph.',
    free: 'Sunlight on a curved mirror, a laser through a concave lens and a block. Add pieces, move them, turn them.'
  };
  function loadScene(id) {
    if (!M.SCENES[id]) id = 'snell';
    S.scene = id; ui.set('scene', id);
    S.pieces = M.SCENES[id](); S.sel = 0; S.drag = null;
    if (id === 'rainbow') S.weak = true;
    var bs = el.scenes.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-scene') === id ? 'true' : 'false');
    el.note.textContent = NOTES[id];
    startReveal(); S.dirty = true; syncToggles(); buildSel();
  }
  function startReveal() { if (reduced) { S.reveal = 1e9; S.revealing = false; } else { S.reveal = 0; S.revealing = true; } S.raysDirty = true; }

  // ---------- geometry helpers ----------
  function piece(id) { for (var i = 0; i < S.pieces.length; i++) if (S.pieces[i].id === id) return S.pieces[i]; return null; }
  function first(type) { for (var i = 0; i < S.pieces.length; i++) if (S.pieces[i].type === type) return S.pieces[i]; return null; }
  function sx(x) { return V.ox + x * V.k; }
  function sy(y) { return V.oy - y * V.k; }
  function toLocal(p, X, Y) { var dx = X - p.x, dy = Y - p.y, c = Math.cos(p.a), s = Math.sin(p.a); return [dx * c + dy * s, -dx * s + dy * c]; }
  function bbox(p) {
    var g, h, R, v;
    switch (p.type) {
      case 'laser': return [-6, 0.6, -1.1, 1.1];
      case 'lamp': return [-1.7, 1.7, -1.7, 1.7];
      case 'sun': h = Math.max(p.width / 2, 2.6); return [-5.6, 0.5, -h, h];
      case 'mirror': case 'screen': return [-0.5, 0.5, -p.len / 2, p.len / 2];
      case 'wall': return [-0.9, 0.9, -p.len / 2, p.len / 2];
      case 'cmirror': R = Math.max(p.R, p.ap / 2 + 0.5); h = p.ap / 2; return [-0.5, R - Math.sqrt(R * R - h * h) + 0.5, -h, h];
      case 'lens': case 'dlens': g = M.lensGeom(p); h = (p.type === 'lens' ? g.t : g.t + 2 * g.sag) / 2; return [-h - 0.2, h + 0.2, -g.a, g.a];
      case 'block': return [-p.w / 2, p.w / 2, -p.h / 2, p.h / 2];
      case 'prism': v = M.prismVerts(p); return [v[1][0], v[2][0], v[1][1], v[0][1]];
      case 'drop': case 'target': return [-p.r, p.r, -p.r, p.r];
      case 'eye': return [-2.4, 2.4, -1.6, 1.6];
    }
    return [-1, 1, -1, 1];
  }
  function canTurn(p) { return p.type !== 'eye' && p.type !== 'target' && p.type !== 'drop'; }
  function handlePos(p) { var b = bbox(p), gap = 30 / V.k; return M.W(p, 0, b[3] + gap); }
  function pick(X, Y) {
    var pad = 14 / V.k, best = null, bestA = 1e18;
    for (var i = S.pieces.length - 1; i >= 0; i--) {
      var p = S.pieces[i], b = bbox(p), l = toLocal(p, X, Y);
      if (l[0] >= b[0] - pad && l[0] <= b[1] + pad && l[1] >= b[2] - pad && l[1] <= b[3] + pad) {
        var A = (b[1] - b[0] + 2 * pad) * (b[3] - b[2] + 2 * pad);
        if (A < bestA) { bestA = A; best = p; }
      }
    }
    return best;
  }

  // ---------- tracing and measuring ----------
  var histCache = {};
  function dropHist(mat) {
    if (histCache[mat]) return histCache[mat];
    var out = { lams: M.WHITE.slice(), bins: [], bin: 0.25, max: 0, sum: null, bow1: {}, bow2: {} }, i, j, k;
    var nb = Math.round(90 / out.bin); out.sum = new Float64Array(nb);
    for (i = 0; i < out.lams.length; i++) {
      var n = M.nOf(mat, out.lams[i]), b = M.dropScatter(n, 1800, out.bin, 90, 2), t = new Float64Array(nb);
      for (k = 0; k < b.length; k++) for (j = 0; j < nb; j++) t[j] += b[k][j];
      // light the eye sees through a 1° wide pupil: smooth over ±2 bins
      var sm = new Float64Array(nb);
      for (j = 0; j < nb; j++) { var a = 0, c = 0; for (k = -2; k <= 2; k++) if (j + k >= 0 && j + k < nb) { a += t[j + k]; c++; } sm[j] = a / c; }
      out.bins.push(sm);
      for (j = 0; j < nb; j++) { out.sum[j] += sm[j]; if (j * out.bin < 62 && sm[j] > out.max) out.max = sm[j]; }
      out.bow1[out.lams[i]] = M.bowAngle(n, 1).theta / D2R; out.bow2[out.lams[i]] = M.bowAngle(n, 2).theta / D2R;
    }
    var sm2 = 0; for (j = 0; j < nb; j++) if (j * out.bin < 62) sm2 = Math.max(sm2, out.sum[j]); out.sumMax = sm2;
    out.p1 = [M.bowAngle(M.nOf(mat, 405), 1).theta / D2R, M.bowAngle(M.nOf(mat, 680), 1).theta / D2R];
    out.p2 = [M.bowAngle(M.nOf(mat, 680), 2).theta / D2R, M.bowAngle(M.nOf(mat, 405), 2).theta / D2R];
    return (histCache[mat] = out);
  }
  function eyeInfo() {
    var eye = first('eye'); if (!eye) return null;
    var sun = first('sun'), drop = null, best = 1e9, i;
    for (i = 0; i < S.pieces.length; i++) { var p = S.pieces[i]; if (p.type === 'drop') { var d = Math.hypot(p.x - eye.x, p.y - eye.y); if (d < best) { best = d; drop = p; } } }
    if (!drop || !sun) return { eye: eye, drop: drop, sun: sun, ok: false };
    var sxv = Math.cos(sun.a), syv = Math.sin(sun.a), vx = eye.x - drop.x, vy = eye.y - drop.y, vl = Math.hypot(vx, vy) || 1;
    var th = Math.acos(Math.max(-1, Math.min(1, -(vx * sxv + vy * syv) / vl))) / D2R;
    // is the drop in the sunbeam?
    var rx = drop.x - sun.x, ry = drop.y - sun.y, along = rx * sxv + ry * syv, across = Math.abs(-rx * syv + ry * sxv);
    var lit = along > drop.r && across < sun.width / 2 + drop.r * 0.5;
    var H = dropHist(drop.mat), j = Math.min(H.sum.length - 1, Math.max(0, Math.floor(th / H.bin))), rgb = [0, 0, 0], tot = 0, bestL = 0, bestV = 0;
    for (i = 0; i < H.lams.length; i++) {
      var v = H.bins[i][j], c = lamRGB(H.lams[i], true); rgb[0] += c[0] * v; rgb[1] += c[1] * v; rgb[2] += c[2] * v; tot += v;
      if (v > bestV) { bestV = v; bestL = H.lams[i]; }
    }
    var rel = lit && H.sumMax ? tot / H.sumMax : 0;
    var m = Math.max(rgb[0], rgb[1], rgb[2]) || 1;
    var spread = 0; if (tot > 0) { var lo = 1e9, hi = 0; for (i = 0; i < H.lams.length; i++) if (H.bins[i][j] > 0.25 * bestV) { lo = Math.min(lo, H.lams[i]); hi = Math.max(hi, H.lams[i]); } spread = hi - lo; }
    return { eye: eye, drop: drop, sun: sun, ok: true, lit: lit, theta: th, rel: rel, rgb: [rgb[0] / m, rgb[1] / m, rgb[2] / m], lam: bestL, mixed: spread > 150, H: H, side: (-vx * syv + vy * sxv) >= 0 ? 1 : -1 };
  }
  function retrace() {
    S.tr = M.trace(S.pieces, { ideal: S.ideal });
    S.meas = M.measure(S.pieces, S.tr);
    S.eye = eyeInfo();
    S.dirty = false; S.raysDirty = true;
    checkMissions(); updateReadouts();
  }

  // ---------- missions: checked after every change ----------
  function deg(a, d) { return fmt(a / D2R, d === undefined ? 1 : d) + '°'; }
  function checkMissions() {
    var m = S.meas, i, j;
    if (m.snell && m.snell.thI >= 20 * D2R) {
      var e = m.snell; win('snell', 'in at ' + deg(e.thI) + ', bent to ' + deg(e.thT) + '. 1.000 × sin ' + deg(e.thI) + ' = ' + fmt(e.n2, 3) + ' × sin ' + deg(e.thT) + '.');
    }
    if (m.target && m.targetMirrors >= 1) win('mirrors', 'the beam reached the target after ' + m.targetMirrors + ' mirror bounce' + (m.targetMirrors > 1 ? 's' : '') + '. Each mirror sends light back at the angle it came in.');
    if (m.tirRun >= 3) win('tir', m.tirRun + ' total internal reflections in a row. Optical fibers carry light for kilometers this way.');
    for (i = 0; i < m.screens.length; i++) {
      var sc = m.screens[i];
      for (j = 0; j < sc.groups.length; j++) {
        var g = sc.groups[j], L = g.lens;
        if (g.srcType === 'sun' && L && L.type === 'lens' && g.nRays >= 5 && g.width <= 0.3) {
          var dS = M.axisDist(L, sc.piece.x, sc.piece.y), fL = M.lensmaker(L, M.LAM_D);
          win('focus', 'a ' + fmt(g.width * 10, 1) + ' mm spot ' + fmt(dS, 1) + ' cm from the lens. The lensmaker’s equation gives f = ' + fmt(fL, 1) + ' cm.');
        }
        if (g.srcType === 'lamp' && L && L.type === 'lens' && g.nRays >= 3 && g.width <= 0.08) {
          var f = M.lensmaker(L, M.LAM_D), dO = M.axisDist(L, g.srcPiece.x, g.srcPiece.y), dI = M.axisDist(L, sc.piece.x, sc.piece.y);
          if (dO > f) win('image', 'dₒ = ' + fmt(dO, 1) + ' cm, dᵢ = ' + fmt(dI, 1) + ' cm. 1/dₒ + 1/dᵢ = ' + fmt(1 / dO + 1 / dI, 4) + ' per cm; 1/f = ' + fmt(1 / f, 4) + ' per cm.');
        }
        if (g.white && g.prism && g.nLam >= 6 && g.spread >= 1) win('prism', 'a spectrum ' + fmt(g.spread, 1) + ' cm wide. Violet bends the most, red the least.');
      }
    }
    var E = S.eye;
    if (E && E.ok && E.lit && E.drop.mat === 'water') {
      var H = E.H;
      if (E.theta >= H.p1[0] - 0.3 && E.theta <= H.p1[1] + 0.3) win('rainbow', 'there it is, ' + fmt(E.theta, 1) + '° from the line to the Sun. Red sits outside at ' + fmt(H.p1[1], 1) + '°, violet inside at ' + fmt(H.p1[0], 1) + '°.');
      if (E.theta >= H.p2[0] - 0.3 && E.theta <= H.p2[1] + 0.3) win('second', fmt(E.theta, 1) + '°. Two reflections inside the drop: red now on the inside (' + fmt(H.p2[0], 1) + '°), violet outside (' + fmt(H.p2[1], 1) + '°).');
    }
  }

  // ---------- readouts ----------
  function laserEvent() {
    var ev = S.tr.events, sel = piece(S.sel), i;
    if (sel) for (i = 0; i < ev.length; i++) if (ev[i].piece === sel && ev[i].type !== 'mirror') return ev[i];
    for (i = 0; i < ev.length; i++) if (ev[i].type !== 'mirror') return ev[i];
    return ev[0] || null;
  }
  function lensOfInterest() { var p = piece(S.sel); if (p && (p.type === 'lens' || p.type === 'dlens')) return p; return first('lens') || first('dlens'); }
  function screenGroup() {
    var sel = piece(S.sel), list = S.meas.screens, i, best = null;
    for (i = 0; i < list.length; i++) { if (sel && list[i].piece !== sel) continue; if (list[i].groups.length) { best = list[i]; break; } }
    if (!best) for (i = 0; i < list.length; i++) if (list[i].groups.length) { best = list[i]; break; }
    return best;
  }
  function updateReadouts() {
    var rows = [], hud = [], e = laserEvent(), lens = lensOfInterest(), sg = screenGroup(), E = S.eye, sel = piece(S.sel), las = first('laser');
    var lamTxt = las && las.color !== 'white' ? M.COLORS[las.color] : 589;
    if (e) {
      rows.push(['Laser meets', NAMES[e.piece.type].toLowerCase()]);
      if (e.type === 'refract') {
        rows.push(['Angle in, θ₁', deg(e.thI)], ['Angle out, θ₂', deg(e.thT)], ['n₁ → n₂', fmt(e.n1, 4) + ' → ' + fmt(e.n2, 4)], ['Reflected back', fmt(e.R * 100, 1) + '%']);
        if (e.crit) rows.push(['Critical angle', deg(e.crit)]);
        hud.push('θ₁ <b>' + deg(e.thI) + '</b> → θ₂ <b>' + deg(e.thT) + '</b> · n ' + fmt(e.n1, 3) + ' → ' + fmt(e.n2, 3));
      } else if (e.type === 'tir') {
        rows.push(['Angle at the surface', deg(e.thI)], ['Critical angle', deg(e.crit)], ['Result', 'total internal reflection']);
        hud.push('Total internal reflection: <b>' + deg(e.thI) + '</b> &gt; ' + deg(e.crit));
      } else rows.push(['Angle in = angle out', deg(e.thI)]);
      if (S.meas.tirRun) rows.push(['Trapped bounces in a row', String(S.meas.tirRun)]);
    }
    if (S.meas.tirRun >= 2 && S.scene === 'fiber') hud.push('Bounces trapped inside: <b>' + S.meas.tirRun + '</b>');
    if (sel && M.isGlass(sel)) {
      var mat = M.MATS[sel.mat], n = M.nOf(sel.mat, lamTxt);
      rows.push(['Material', mat.short], ['n at ' + lamTxt + ' nm', fmt(n, 4)], ['n violet 405 / red 656', fmt(M.nOf(sel.mat, 404.7), 4) + ' / ' + fmt(M.nOf(sel.mat, 656.3), 4)], ['Critical angle (to air)', deg(Math.asin(1 / n))]);
    }
    if (lens) {
      var fT = M.lensmaker(lens, M.LAM_D), fThin = M.lensThin(lens, M.LAM_D), pr = M.probeLens(lens, M.LAM_D, S.ideal, 0.01);
      rows.push(['f, lensmaker (thick)', fmt(fT, 2) + ' cm'], ['f, thin-lens formula', fmt(fThin, 2) + ' cm']);
      if (pr) rows.push(['f, from a ray near the axis', fmt(pr.f, 2) + ' cm' + (S.ideal ? ' (ideal)' : '')]);
    }
    if (sg) {
      var g = sg.groups[0], L = g.lens;
      var multi = g.nRays > 1 || g.nLam > 1;
      if (multi) rows.push(['Light on the screen', (g.width < 1 ? fmt(g.width * 10, 1) + ' mm' : fmt(g.width, 1) + ' cm') + ' wide']);
      if (g.white && g.nLam > 1 && g.prism) rows.push(['Violet to red', fmt(g.spread, 1) + ' cm']);
      if (L) {
        var dI = M.axisDist(L, sg.piece.x, sg.piece.y);
        rows.push(['Screen to lens' + (g.srcType === 'lamp' ? ', dᵢ' : ''), fmt(dI, 1) + ' cm']);
        if (g.srcType === 'lamp') {
          var dO = M.axisDist(L, g.srcPiece.x, g.srcPiece.y), f = M.lensmaker(L, M.LAM_D);
          rows.push(['Lamp to lens, dₒ', fmt(dO, 1) + ' cm'], ['1/dₒ + 1/dᵢ', fmt(1 / dO + 1 / dI, 4) + ' /cm'], ['1/f', fmt(1 / f, 4) + ' /cm']);
          hud.push('dₒ <b>' + fmt(dO, 1) + ' cm</b> · dᵢ <b>' + fmt(dI, 1) + ' cm</b> · spot <b>' + fmt(g.width * 10, 1) + ' mm</b>');
        } else hud.push('Screen <b>' + fmt(dI, 1) + ' cm</b> from the lens' + (multi ? ' · spot <b>' + (g.width < 1 ? fmt(g.width * 10, 1) + ' mm' : fmt(g.width, 1) + ' cm') + '</b>' : ''));
      } else if (g.prism && g.white) hud.push('Spectrum on the screen: <b>' + fmt(g.spread, 1) + ' cm</b> from violet to red');
    }
    if (E) {
      if (!E.ok) rows.push(['Eye', E.drop ? 'needs sunlight' : 'needs a drop']);
      else {
        var hn = hueName(E.rgb), look = !E.lit ? 'no sunlight on the drop' : E.rel > 0.3 ? 'bright ' + hn : E.rel > 0.08 ? hn : E.rel > 0.02 ? 'a faint ' + (hn === 'white' ? 'glow' : hn) : 'almost nothing';
        rows.push(['Eye, from the line to the Sun', fmt(E.theta, 1) + '°'], ['The eye sees', look], ['Rainbow (1 reflection)', fmt(E.H.p1[0], 1) + '° to ' + fmt(E.H.p1[1], 1) + '°'], ['Second bow (2 reflections)', fmt(E.H.p2[0], 1) + '° to ' + fmt(E.H.p2[1], 1) + '°']);
        hud.push('Eye at <b>' + fmt(E.theta, 1) + '°</b> from the line to the Sun · sees <b>' + look + '</b>');
      }
    }
    if (S.meas.target) hud.push('Target: <b>hit!</b>');
    else if (first('target')) hud.push('Target: not yet');
    if (!rows.length) rows.push(['Tip', 'select a piece to see its numbers']);
    var key = rows.map(function (r) { return r[0] + r[1]; }).join('|');
    if (key !== S.readKey) { S.readKey = key; el.read.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }
    var hk = hud.slice(0, 2).join('<br>');
    if (!hk) { var sp = piece(S.sel); hk = sp ? NAMES[sp.type] + ' selected' : 'Tap a piece to select it'; }
    if (hk !== S.hudKey) { S.hudKey = hk; el.hud.innerHTML = hk; }
  }

  // ---------- the selected piece's controls ----------
  var PARAMS = {
    laser: [['color', 'Color', 'colors']],
    lamp: [['color', 'Color', 'colors'], ['spread', 'Fan, each side', 1, 40, 1, '°'], ['count', 'Rays', 3, 25, 1, '']],
    sun: [['width', 'Beam width', 2, 24, 0.5, ' cm'], ['count', 'Rays', 3, 31, 1, '']],
    mirror: [['len', 'Length', 4, 30, 0.5, ' cm']],
    cmirror: [['R', 'Radius of curvature', 12, 100, 1, ' cm'], ['ap', 'Width', 4, 30, 0.5, ' cm']],
    lens: [['R', 'Radius of each face', 6, 80, 0.5, ' cm'], ['ap', 'Diameter', 3, 16, 0.5, ' cm'], ['mat', 'Glass', 'mats']],
    dlens: [['R', 'Radius of each face', 6, 80, 0.5, ' cm'], ['ap', 'Diameter', 3, 16, 0.5, ' cm'], ['mat', 'Glass', 'mats']],
    block: [['w', 'Length', 2, 80, 0.5, ' cm'], ['h', 'Height', 1, 30, 0.5, ' cm'], ['mat', 'Glass', 'mats']],
    prism: [['side', 'Side', 4, 30, 0.5, ' cm'], ['apex', 'Apex angle', 20, 100, 1, '°'], ['mat', 'Glass', 'mats']],
    drop: [['r', 'Radius', 3, 16, 0.5, ' cm'], ['mat', 'Material', 'mats']],
    screen: [['len', 'Length', 4, 40, 0.5, ' cm']],
    wall: [['len', 'Length', 4, 50, 1, ' cm']], target: [], eye: []
  };
  var MAT_TXT = { bk7: 'BK7 glass', sf11: 'SF11 flint', water: 'Water' };
  function angDeg(p) { var d = Math.round(p.a / D2R) % 360; if (d > 180) d -= 360; if (d <= -180) d += 360; return d; }
  function buildSel() {
    var p = piece(S.sel), h = '';
    var opts = '<option value="0">Pick a piece…</option>' + S.pieces.map(function (q, i) { return '<option value="' + q.id + '"' + (q.id === S.sel ? ' selected' : '') + '>' + (i + 1) + '. ' + NAMES[q.type] + '</option>'; }).join('');
    h += '<label class="lab-field"><span>Piece on the bench</span><select id="optics-pick" aria-label="Pick a piece on the bench">' + opts + '</select></label>';
    if (p) {
      if (canTurn(p)) h += '<label class="lab-field"><span>Turn <output id="optics-o-a">' + angDeg(p) + '°</output></span><input type="range" min="-180" max="180" step="1" value="' + angDeg(p) + '" data-k="a" aria-label="Angle of the ' + NAMES[p.type].toLowerCase() + ' in degrees"></label>';
      (PARAMS[p.type] || []).forEach(function (d) {
        if (d[2] === 'colors') {
          h += '<div class="lab-field"><span>' + d[1] + '</span><div class="lab-seg optics-mini" role="group" aria-label="' + d[1] + '">' + ['red', 'yellow', 'green', 'blue', 'violet', 'white'].map(function (c) {
            return '<button type="button" data-k="color" data-v="' + c + '" aria-pressed="' + (p.color === c) + '"><i class="optics-sw" style="background:' + (c === 'white' ? '#fff' : css(lamRGB(M.COLORS[c], false))) + '"></i>' + COLOR_TXT[c] + '</button>';
          }).join('') + '</div></div>';
        } else if (d[2] === 'mats') {
          h += '<div class="lab-field"><span>' + d[1] + '</span><div class="lab-seg optics-mini" role="group" aria-label="' + d[1] + '">' + ['bk7', 'sf11', 'water'].map(function (m) {
            return '<button type="button" data-k="mat" data-v="' + m + '" aria-pressed="' + (p.mat === m) + '">' + MAT_TXT[m] + '</button>';
          }).join('') + '</div></div>';
        } else {
          h += '<label class="lab-field"><span>' + d[1] + ' <output id="optics-o-' + d[0] + '">' + fmt(p[d[0]], d[4] < 1 ? 1 : 0) + d[5] + '</output></span><input type="range" min="' + d[2] + '" max="' + d[3] + '" step="' + d[4] + '" value="' + p[d[0]] + '" data-k="' + d[0] + '" aria-label="' + d[1] + '"></label>';
        }
      });
      if (p.type !== 'eye') h += '<div class="lab-row"><button type="button" class="lab-btn" data-k="remove">Remove from the bench</button></div>';
    }
    el.sel.innerHTML = h;
    el.selinfo.textContent = p ? NAMES[p.type] + ' selected. Drag it to move it' + (canTurn(p) ? ', or drag its round handle to turn it.' : '.') : 'Nothing selected. Tap a piece on the bench.';
  }
  function select(id) { if (S.sel === id) return; S.sel = id; buildSel(); updateReadouts(); }
  function clampParams(p) {
    if (p.type === 'lens' || p.type === 'dlens') { if (p.R < p.ap / 2 + 0.3) p.R = Math.ceil((p.ap / 2 + 0.3) * 2) / 2; }
    if (p.type === 'cmirror') { if (p.R < p.ap / 2 + 0.5) p.R = Math.ceil(p.ap / 2 + 0.5); }
  }
  el.sel.addEventListener('input', function (e) {
    var t = e.target, p = piece(S.sel), k = t.getAttribute('data-k');
    if (!p || !k || t.tagName !== 'INPUT') return;
    var v = parseFloat(t.value);
    if (k === 'a') { p.a = v * D2R; var o = $('optics-o-a'); if (o) o.textContent = v + '°'; }
    else {
      p[k] = v; clampParams(p);
      var d = (PARAMS[p.type] || []).filter(function (x) { return x[0] === k; })[0], oo = $('optics-o-' + k);
      if (oo && d) oo.textContent = fmt(p[k], d[4] < 1 ? 1 : 0) + d[5];
      if (p[k] !== v) t.value = p[k];
    }
    S.dirty = true;
  });
  el.sel.addEventListener('change', function (e) { if (e.target.id === 'optics-pick') { select(+e.target.value || 0); } });
  el.sel.addEventListener('click', function (e) {
    var b = e.target.closest('button'), p = piece(S.sel); if (!b || !p) return;
    var k = b.getAttribute('data-k');
    if (k === 'remove') { removeSel(); return; }
    if (k === 'color' || k === 'mat') {
      p[k] = b.getAttribute('data-v');
      var bs = b.parentNode.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i] === b ? 'true' : 'false');
      if (k === 'color') startReveal();
      S.dirty = true;
    }
  });
  function removeSel() {
    var p = piece(S.sel); if (!p || p.type === 'eye') return;
    S.pieces = S.pieces.filter(function (q) { return q !== p; }); S.sel = 0; S.dirty = true; buildSel();
  }

  // ---------- adding pieces ----------
  var ADD = {
    laser: [0, { color: 'red' }], lamp: [0, { color: 'white', spread: 8, count: 9 }], sun: [0, { width: 8, count: 13 }], mirror: [120, {}], cmirror: [180, {}],
    lens: [0, {}], dlens: [0, {}], block: [0, { w: 16, h: 8 }], prism: [0, { side: 14 }], drop: [0, { r: 8, mat: 'water' }], screen: [180, { len: 14 }]
  };
  var addN = 0;
  el.add.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-add]'); if (!b) return;
    if (S.pieces.length >= MAX_PIECES) { say('The bench is full: remove a piece first.'); return; }
    var t = b.getAttribute('data-add'), d = ADD[t], off = (addN++ % 5) * 3 - 6;
    var x = M.isSource({ type: t }) ? -36 : off, y = M.isSource({ type: t }) ? off : -off * 0.5;
    var p = M.make(t, x, y, d[0], d[1]); S.pieces.push(p); select(p.id);
    if (M.isSource(p)) startReveal();
    S.dirty = true; say(NAMES[t] + ' added. Drag it into place.');
  });

  // ---------- toggles ----------
  function syncToggles() {
    el.angles.checked = S.angles; el.weak.checked = S.weak;
    el.tAngles.setAttribute('aria-pressed', S.angles ? 'true' : 'false'); el.tWeak.setAttribute('aria-pressed', S.weak ? 'true' : 'false');
    var bs = el.ideal.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', (bs[i].getAttribute('data-ideal') === '1') === S.ideal ? 'true' : 'false');
  }
  function setAngles(v) { S.angles = v; ui.set('angles', v); syncToggles(); }
  function setWeak(v) { S.weak = v; ui.set('weak', v); syncToggles(); S.raysDirty = true; }
  function setIdeal(v) { S.ideal = v; ui.set('ideal', v); syncToggles(); S.dirty = true; }
  el.angles.addEventListener('change', function () { setAngles(el.angles.checked); });
  el.weak.addEventListener('change', function () { setWeak(el.weak.checked); });
  el.tAngles.addEventListener('click', function () { setAngles(!S.angles); });
  el.tWeak.addEventListener('click', function () { setWeak(!S.weak); });
  el.tReset.addEventListener('click', function () { loadScene(S.scene); });
  el.ideal.addEventListener('click', function (e) { var b = e.target.closest('button[data-ideal]'); if (b) setIdeal(b.getAttribute('data-ideal') === '1'); });
  el.scenes.addEventListener('click', function (e) { var b = e.target.closest('button[data-scene]'); if (!b) return; loadScene(b.getAttribute('data-scene')); toastQ = []; toastAt = -10; });

  // ---------- pointer and keys ----------
  function evWorld(e) { var r = cv.getBoundingClientRect(); return [((e.clientX - r.left) - V.ox) / V.k, (V.oy - (e.clientY - r.top)) / V.k]; }
  function clampPos(p) { p.x = Math.max(-58, Math.min(58, p.x)); p.y = Math.max(-38, Math.min(38, p.y)); }
  cv.addEventListener('pointerdown', function (e) {
    var w = evWorld(e), sel = piece(S.sel);
    if (sel && canTurn(sel)) {
      var hp = handlePos(sel);
      if (Math.hypot(hp[0] - w[0], hp[1] - w[1]) * V.k < 22) {
        var b = bbox(sel); S.drag = { mode: 'turn', p: sel, off: Math.atan2(b[3] + 30 / V.k, 0) };
        try { cv.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); return;
      }
    }
    var p = pick(w[0], w[1]);
    if (p) { select(p.id); S.drag = { mode: 'move', p: p, dx: w[0] - p.x, dy: w[1] - p.y }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); }
    else select(0);
  });
  cv.addEventListener('pointermove', function (e) {
    var w = evWorld(e), d = S.drag;
    if (!d) {
      var sel = piece(S.sel), over = pick(w[0], w[1]), onH = false;
      if (sel && canTurn(sel)) { var hp = handlePos(sel); onH = Math.hypot(hp[0] - w[0], hp[1] - w[1]) * V.k < 22; }
      cv.style.cursor = onH ? 'alias' : over ? 'grab' : 'default';
      return;
    }
    if (d.mode === 'move') {
      var step = e.shiftKey ? 1 : 0.1;
      d.p.x = Math.round((w[0] - d.dx) / step) * step; d.p.y = Math.round((w[1] - d.dy) / step) * step; clampPos(d.p);
    } else {
      var a = Math.atan2(w[1] - d.p.y, w[0] - d.p.x) - d.off, snap = (e.shiftKey ? 15 : 1) * D2R;
      d.p.a = Math.round(a / snap) * snap; syncAngle();
    }
    cv.style.cursor = d.mode === 'move' ? 'grabbing' : 'alias';
    S.dirty = true;
  });
  function endDrag() { if (S.drag) { S.drag = null; S.dirty = true; } }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  function syncAngle() { var p = piece(S.sel); if (!p) return; var r = el.sel.querySelector('input[data-k="a"]'), o = $('optics-o-a'); if (r) r.value = angDeg(p); if (o) o.textContent = angDeg(p) + '°'; }
  cv.addEventListener('keydown', function (e) {
    var p = piece(S.sel), k = e.key, big = e.shiftKey, used = true;
    if (k === 'n' || k === 'N') { if (S.pieces.length) { var i = S.pieces.indexOf(p); i = (i + (k === 'N' ? S.pieces.length - 1 : 1)) % S.pieces.length; if (i < 0) i = 0; select(S.pieces[i].id); say(NAMES[S.pieces[i].type] + ' selected'); } }
    else if (k === 'a' || k === 'A') setAngles(!S.angles);
    else if (k === 'Escape') select(0);
    else if (!p && (k.indexOf('Arrow') === 0 || k === 'q' || k === 'e')) { if (S.pieces.length) select(S.pieces[0].id); }
    else if (p && k.indexOf('Arrow') === 0) {
      var s = big ? 2 : 0.5;
      if (k === 'ArrowLeft') p.x -= s; else if (k === 'ArrowRight') p.x += s; else if (k === 'ArrowUp') p.y += s; else p.y -= s;
      p.x = Math.round(p.x * 10) / 10; p.y = Math.round(p.y * 10) / 10; clampPos(p); S.dirty = true;
    } else if (p && canTurn(p) && (k === 'q' || k === 'Q' || k === 'e' || k === 'E' || k === '[' || k === ']')) {
      var dir = (k === 'q' || k === 'Q' || k === '[') ? 1 : -1;
      p.a = Math.round((p.a / D2R + dir * (big ? 5 : 1))) * D2R; syncAngle(); S.dirty = true;
    } else if (p && (k === 'Delete' || k === 'Backspace')) removeSel();
    else used = false;
    if (used) e.preventDefault();
  });

  // ---------- drawing ----------
  function fitView() {
    K.fit();
    var w = K.w, h = K.h;
    V.narrow = w < 640;
    V.k = Math.min(w / 102, h / (V.narrow ? 66 : 62));
    V.ox = w / 2; V.oy = V.narrow ? Math.min(h / 2, 34 * V.k + 44) : h / 2;
    var pw = cv.width, ph = cv.height;
    if (pw !== S.pw || ph !== S.ph) {
      S.pw = pw; S.ph = ph; RC.width = pw; RC.height = ph; BG.width = pw; BG.height = ph;
      drawBG(); S.raysDirty = true;
    }
  }
  function drawBG() {
    var c = bctx, w = K.w, h = K.h, k = V.k, x, y;
    c.setTransform(K.dpr, 0, 0, K.dpr, 0, 0);
    c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    var g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.7);
    g.addColorStop(0, 'rgba(30,60,80,0.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    var x0 = Math.floor(-V.ox / k / 5) * 5, x1 = Math.ceil((w - V.ox) / k / 5) * 5, y0 = Math.floor((V.oy - h) / k / 5) * 5, y1 = Math.ceil(V.oy / k / 5) * 5;
    c.lineWidth = 1;
    for (x = x0; x <= x1; x += 5) { c.strokeStyle = x % 10 === 0 ? 'rgba(120,170,200,0.10)' : 'rgba(120,170,200,0.05)'; c.beginPath(); c.moveTo(Math.round(sx(x)) + 0.5, 0); c.lineTo(Math.round(sx(x)) + 0.5, h); c.stroke(); }
    for (y = y0; y <= y1; y += 5) { c.strokeStyle = y % 10 === 0 ? 'rgba(120,170,200,0.10)' : 'rgba(120,170,200,0.05)'; c.beginPath(); c.moveTo(0, Math.round(sy(y)) + 0.5); c.lineTo(w, Math.round(sy(y)) + 0.5); c.stroke(); }
    // centimeter ruler along the bottom: 0 at the left end of the bench (x = −50 cm)
    var by = h - 1;
    c.fillStyle = 'rgba(6,17,26,0.75)'; c.fillRect(0, h - 20, w, 20);
    c.strokeStyle = 'rgba(143,179,198,0.55)'; c.fillStyle = 'rgba(143,179,198,0.85)'; c.font = '10px system-ui,sans-serif'; c.textAlign = 'center';
    for (x = Math.ceil(-V.ox / k); x <= (w - V.ox) / k; x++) {
      var L = x % 10 === 0 ? 9 : x % 5 === 0 ? 6 : 3; if (k < 5 && L === 3) continue;
      c.beginPath(); c.moveTo(Math.round(sx(x)) + 0.5, by); c.lineTo(Math.round(sx(x)) + 0.5, by - L); c.stroke();
      if (x % 10 === 0 && x + 50 >= 0 && x + 50 <= 100 && sx(x) > 12 && sx(x) < w - 30) c.fillText(String(x + 50), sx(x), by - 10);
    }
    c.textAlign = 'right'; c.fillText('cm', w - 6, by - 10); c.textAlign = 'left'; c.fillText('ruler', 4, by - 10);
  }

  // rays: grouped by color and brightness, then drawn twice (a soft glow, then a bright core) with light adding up
  function renderRays() {
    var c = rctx, tr = S.tr; S.raysDirty = false;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, RC.width, RC.height);
    if (!tr) return;
    c.setTransform(K.dpr, 0, 0, K.dpr, 0, 0);
    var groups = {}, i, P = S.pieces, maxL = 0;
    for (i = 0; i < tr.segs.length; i++) {
      var s = tr.segs[i]; if (s.weak && !S.weak) continue;
      var src = P[s.src]; if (!src) continue;
      var white = src.type === 'sun' || src.color === 'white';
      var base = src.type === 'laser' ? 1 : src.type === 'lamp' ? 0.75 : 0.62;
      var a = base * Math.pow(s.I, 0.5) * (s.weak ? 0.45 : 1); if (a < 0.012) continue;
      var q = Math.min(24, Math.max(1, Math.round(a * 24)));
      if (s.L0 > S.reveal) continue;
      var t = Math.min(1, (S.reveal - s.L0) / s.len); if (s.L0 + Math.min(s.len, 120) > maxL) maxL = s.L0 + Math.min(s.len, 120);
      var key = s.lam + (white ? 'w' : 's') + q + (src.type === 'laser' ? 'L' : '');
      var G = groups[key] || (groups[key] = { lam: s.lam, white: white, a: q / 24, laser: src.type === 'laser', p: new Path2D() });
      G.p.moveTo(sx(s.x1), sy(s.y1)); G.p.lineTo(sx(s.x1 + (s.x2 - s.x1) * t), sy(s.y1 + (s.y2 - s.y1) * t));
    }
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (var key2 in groups) {
      var G2 = groups[key2], col = lamRGB(G2.lam, G2.white), a2 = G2.a * (G2.white ? 0.95 : 1);
      c.strokeStyle = css(col, Math.min(1, a2 * 0.16)); c.lineWidth = G2.laser ? 7 : 4.5; c.stroke(G2.p);
      c.strokeStyle = css(col, Math.min(1, a2 * (G2.white ? 0.95 : 0.9))); c.lineWidth = G2.laser ? 2 : 1.3; c.stroke(G2.p);
      if (G2.laser && !G2.white) { c.strokeStyle = 'rgba(255,255,255,' + (a2 * 0.35) + ')'; c.lineWidth = 0.8; c.stroke(G2.p); }
    }
    c.globalCompositeOperation = 'source-over';
    if (S.revealing && S.reveal > maxL + 5) { S.revealing = false; S.reveal = 1e9; }
  }

  function poly(pts) { ctx.beginPath(); for (var i = 0; i < pts.length; i++) { var X = sx(pts[i][0]), Y = sy(pts[i][1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.closePath(); }
  function lensPts(p) {
    var g = M.lensGeom(p), pts = [], N = 26, i, y, x, conv = p.type === 'lens', R = g.R;
    for (i = 0; i <= N; i++) { y = g.a - 2 * g.a * i / N; x = conv ? (-g.t / 2 + R - Math.sqrt(R * R - y * y)) : (-g.t / 2 - R + Math.sqrt(R * R - y * y)); pts.push(M.W(p, x, y)); }
    for (i = 0; i <= N; i++) { y = -g.a + 2 * g.a * i / N; x = conv ? (g.t / 2 - R + Math.sqrt(R * R - y * y)) : (g.t / 2 + R - Math.sqrt(R * R - y * y)); pts.push(M.W(p, x, y)); }
    return pts;
  }
  function glassStyle(p, fillA) {
    var water = p.mat === 'water', flint = p.mat === 'sf11';
    ctx.fillStyle = water ? 'rgba(80,170,255,' + (fillA * 1.3) + ')' : flint ? 'rgba(190,200,255,' + fillA + ')' : 'rgba(150,215,240,' + fillA + ')';
    ctx.strokeStyle = water ? 'rgba(140,200,255,0.85)' : flint ? 'rgba(210,215,255,0.85)' : 'rgba(170,225,245,0.85)';
  }
  function drawPiece(p) {
    var k = V.k, i, pts, X = sx(p.x), Y = sy(p.y), ang = -p.a;
    ctx.save();
    switch (p.type) {
      case 'block': case 'prism': {
        pts = p.type === 'block' ? [[-p.w / 2, -p.h / 2], [p.w / 2, -p.h / 2], [p.w / 2, p.h / 2], [-p.w / 2, p.h / 2]].map(function (q) { return M.W(p, q[0], q[1]); }) : M.prismVerts(p).map(function (q) { return M.W(p, q[0], q[1]); });
        glassStyle(p, 0.13); poly(pts); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke();
        break;
      }
      case 'lens': case 'dlens': {
        pts = lensPts(p);
        if (S.ideal) {
          glassStyle(p, 0.05); poly(pts); ctx.fill(); ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
          var g = M.lensGeom(p), a = M.W(p, 0, g.a), b = M.W(p, 0, -g.a), conv = p.type === 'lens';
          ctx.strokeStyle = 'rgba(220,240,255,0.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(a[0]), sy(a[1])); ctx.lineTo(sx(b[0]), sy(b[1])); ctx.stroke();
          // the textbook symbol: arrowheads pointing out for a converging lens, in for a diverging one
          var ux = Math.cos(p.a), uy = Math.sin(p.a), s = 7 / k;
          [[a, 1], [b, -1]].forEach(function (q) {
            var tip = q[0], ox = -uy * q[1], oy = ux * q[1], apx = conv ? tip[0] : tip[0] - ox * s, apy = conv ? tip[1] : tip[1] - oy * s;
            var bx = conv ? tip[0] - ox * s : tip[0], by = conv ? tip[1] - oy * s : tip[1];
            ctx.beginPath(); ctx.moveTo(sx(bx + ux * s * 0.6), sy(by + uy * s * 0.6)); ctx.lineTo(sx(apx), sy(apy)); ctx.lineTo(sx(bx - ux * s * 0.6), sy(by - uy * s * 0.6)); ctx.stroke();
          });
        } else {
          glassStyle(p, 0.16); poly(pts); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke();
        }
        break;
      }
      case 'drop': {
        var gr = ctx.createRadialGradient(X - p.r * k * 0.35, Y - p.r * k * 0.35, p.r * k * 0.1, X, Y, p.r * k);
        gr.addColorStop(0, p.mat === 'water' ? 'rgba(160,215,255,0.22)' : 'rgba(200,235,250,0.2)'); gr.addColorStop(1, p.mat === 'water' ? 'rgba(60,140,230,0.12)' : 'rgba(150,215,240,0.1)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(X, Y, p.r * k, 0, 2 * Math.PI); ctx.fill();
        glassStyle(p, 0); ctx.lineWidth = 1.5; ctx.stroke();
        break;
      }
      case 'mirror': case 'cmirror': {
        if (p.type === 'mirror') pts = [M.W(p, 0, -p.len / 2), M.W(p, 0, p.len / 2)];
        else { var R = Math.max(p.R, p.ap / 2 + 0.5), h = p.ap / 2; pts = []; for (i = 0; i <= 24; i++) { var yy = -h + 2 * h * i / 24; pts.push(M.W(p, R - Math.sqrt(R * R - yy * yy), yy)); } }
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); pts.forEach(function (q, j) { if (j) ctx.lineTo(sx(q[0]), sy(q[1])); else ctx.moveTo(sx(q[0]), sy(q[1])); });
        ctx.strokeStyle = 'rgba(120,150,170,0.55)'; ctx.lineWidth = 6; ctx.stroke();
        ctx.strokeStyle = '#e8f0f6'; ctx.lineWidth = 2.2; ctx.stroke();
        break;
      }
      case 'screen': {
        var a1 = M.W(p, 0, -p.len / 2), b1 = M.W(p, 0, p.len / 2);
        ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(sx(a1[0]), sy(a1[1])); ctx.lineTo(sx(b1[0]), sy(b1[1]));
        ctx.strokeStyle = 'rgba(200,215,225,0.18)'; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = 'rgba(225,232,238,0.9)'; ctx.lineWidth = 2.5; ctx.stroke();
        break;
      }
      case 'wall': {
        var a2 = M.W(p, 0, -p.len / 2), b2 = M.W(p, 0, p.len / 2);
        ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(sx(a2[0]), sy(a2[1])); ctx.lineTo(sx(b2[0]), sy(b2[1]));
        ctx.strokeStyle = '#33424f'; ctx.lineWidth = Math.max(6, 1.6 * k); ctx.stroke();
        ctx.strokeStyle = 'rgba(143,179,198,0.35)'; ctx.lineWidth = 1; ctx.stroke();
        break;
      }
      case 'target': {
        var hit = S.meas && S.meas.target, pr = p.r * k, pulse = hit && !reduced ? 0.5 + 0.5 * Math.sin(S.time * 6) : 0.5;
        if (hit) { var tg = ctx.createRadialGradient(X, Y, 0, X, Y, pr * 3); tg.addColorStop(0, 'rgba(255,212,121,' + (0.35 + 0.25 * pulse) + ')'); tg.addColorStop(1, 'rgba(255,212,121,0)'); ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(X, Y, pr * 3, 0, 7); ctx.fill(); }
        ctx.lineWidth = 2; ctx.strokeStyle = C.red; ctx.beginPath(); ctx.arc(X, Y, pr, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.arc(X, Y, pr * 0.55, 0, 7); ctx.stroke();
        ctx.fillStyle = hit ? C.gold : C.red; ctx.beginPath(); ctx.arc(X, Y, pr * 0.22, 0, 7); ctx.fill();
        break;
      }
      case 'laser': {
        ctx.translate(X, Y); ctx.rotate(ang);
        var lw = 6 * k, lh = Math.max(9, 2 * k);
        ctx.fillStyle = '#1b2c38'; ctx.strokeStyle = 'rgba(143,179,198,0.7)'; ctx.lineWidth = 1;
        rr(-lw, -lh / 2, lw, lh, Math.min(4, lh / 3)); ctx.fill(); ctx.stroke();
        var lc = p.color === 'white' ? [1, 1, 1] : lamRGB(M.COLORS[p.color], false);
        ctx.fillStyle = css(lc, 0.95); rr(-2.2, -lh / 2 + 1.5, 3, lh - 3, 1.5); ctx.fill();
        ctx.fillStyle = 'rgba(219,231,239,0.55)'; ctx.fillRect(-lw + 4, -1, lw * 0.45, 2);
        break;
      }
      case 'lamp': {
        var lr = Math.max(7, 1.4 * k), lc2 = p.color === 'white' ? [1, 0.95, 0.85] : lamRGB(M.COLORS[p.color], false);
        var lg = ctx.createRadialGradient(X, Y, 0, X, Y, lr * 2.6); lg.addColorStop(0, css(lc2, 0.55)); lg.addColorStop(1, css(lc2, 0)); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(X, Y, lr * 2.6, 0, 7); ctx.fill();
        ctx.fillStyle = css(lc2, 0.95); ctx.beginPath(); ctx.arc(X, Y, lr, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.stroke();
        break;
      }
      case 'sun': {
        var hw = p.width / 2, s1 = M.W(p, 0, -hw), s2 = M.W(p, 0, hw), sc = M.W(p, -3.2, 0), sr = Math.max(8, 2.1 * k);
        ctx.strokeStyle = 'rgba(255,212,121,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx(s1[0]), sy(s1[1])); ctx.lineTo(sx(s2[0]), sy(s2[1])); ctx.stroke();
        var sg = ctx.createRadialGradient(sx(sc[0]), sy(sc[1]), 0, sx(sc[0]), sy(sc[1]), sr * 2.2); sg.addColorStop(0, 'rgba(255,220,130,0.6)'); sg.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx(sc[0]), sy(sc[1]), sr * 2.2, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffd479'; ctx.beginPath(); ctx.arc(sx(sc[0]), sy(sc[1]), sr, 0, 7); ctx.fill();
        ctx.strokeStyle = '#ffd479'; ctx.lineWidth = 1.5; var spin = reduced ? 0 : S.time * 0.3;
        for (i = 0; i < 8; i++) { var aa = spin + i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(sx(sc[0]) + Math.cos(aa) * sr * 1.3, sy(sc[1]) + Math.sin(aa) * sr * 1.3); ctx.lineTo(sx(sc[0]) + Math.cos(aa) * sr * 1.75, sy(sc[1]) + Math.sin(aa) * sr * 1.75); ctx.stroke(); }
        break;
      }
      case 'eye': {
        var ew = Math.max(14, 2.4 * k), eh = ew * 0.55, E = S.eye, tone = E && E.ok && E.lit ? Math.min(1, E.rel * 2.5) : 0;
        ctx.translate(X, Y);
        if (tone > 0.02) { var eg = ctx.createRadialGradient(0, 0, 0, 0, 0, ew * 1.8); eg.addColorStop(0, css(E.rgb, 0.5 * tone)); eg.addColorStop(1, css(E.rgb, 0)); ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(0, 0, ew * 1.8, 0, 7); ctx.fill(); }
        ctx.beginPath(); ctx.moveTo(-ew, 0); ctx.quadraticCurveTo(0, -eh * 1.6, ew, 0); ctx.quadraticCurveTo(0, eh * 1.6, -ew, 0); ctx.closePath();
        ctx.fillStyle = '#eef4f8'; ctx.fill(); ctx.strokeStyle = '#8fb3c6'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = '#2b6f9e'; ctx.beginPath(); ctx.arc(0, 0, eh * 0.62, 0, 7); ctx.fill(); ctx.fillStyle = '#06111a'; ctx.beginPath(); ctx.arc(0, 0, eh * 0.3, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-eh * 0.2, -eh * 0.22, eh * 0.12, 0, 7); ctx.fill();
        break;
      }
    }
    ctx.restore();
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawSelection() {
    var p = piece(S.sel); if (!p) return;
    var b = bbox(p), pad = 6 / V.k, c = [[b[0] - pad, b[2] - pad], [b[1] + pad, b[2] - pad], [b[1] + pad, b[3] + pad], [b[0] - pad, b[3] + pad]].map(function (q) { return M.W(p, q[0], q[1]); });
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(99,230,190,0.8)'; ctx.lineWidth = 1.2; poly(c); ctx.stroke(); ctx.setLineDash([]);
    if (canTurn(p)) {
      var top = M.W(p, 0, b[3] + pad), hp = handlePos(p);
      ctx.strokeStyle = 'rgba(99,230,190,0.6)'; ctx.beginPath(); ctx.moveTo(sx(top[0]), sy(top[1])); ctx.lineTo(sx(hp[0]), sy(hp[1])); ctx.stroke();
      ctx.fillStyle = '#0b1b27'; ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(hp[0]), sy(hp[1]), 10, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.green; ctx.font = '600 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('↻', sx(hp[0]), sy(hp[1]) + 0.5);
    }
    // label
    var lb = M.W(p, 0, b[2] - pad);
    ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(99,230,190,0.95)';
    ctx.fillText(NAMES[p.type], sx(lb[0]), Math.min(K.h - 34, sy(lb[1]) + 6));
    ctx.restore();
  }

  function pill(text, x, y, color) {
    ctx.font = '600 11px ui-monospace,Menlo,Consolas,monospace'; var w = ctx.measureText(text).width + 8;
    ctx.fillStyle = 'rgba(6,17,26,0.82)'; rr(x - w / 2, y - 8, w, 16, 5); ctx.fill();
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 0.5);
  }
  function arcBetween(X, Y, r, v1, v2, color) {
    var a1 = Math.atan2(-v1[1], v1[0]), a2 = Math.atan2(-v2[1], v2[0]), d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(X, Y, r, a1, a1 + d, d < 0); ctx.stroke();
    var am = a1 + d / 2; return [X + Math.cos(am) * (r + 16), Y + Math.sin(am) * (r + 16)];
  }
  function drawAngles() {
    if (!S.angles || !S.tr) return;
    var ev = S.tr.events, n = 0, i, used = [], lastTir = null;
    ctx.save();
    for (i = 0; i < ev.length && n < 8; i++) {
      var e = ev[i]; if (e.lam !== ev[0].lam) continue;
      // in a run of total internal reflections, label only the first bounce
      if (e.type !== 'tir') lastTir = null; else if (lastTir === e.piece) continue;
      var X = sx(e.x), Y = sy(e.y), tooClose = false;
      for (var j = 0; j < used.length; j++) if (Math.hypot(used[j][0] - X, used[j][1] - Y) < 46) tooClose = true;
      if (tooClose) continue; used.push([X, Y]); n++;
      if (e.type === 'tir') lastTir = e.piece;
      var L = 3.6 * V.k, nx = e.nx, ny = e.ny;
      ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(219,231,239,0.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X - nx * L, Y + ny * L); ctx.lineTo(X + nx * L, Y - ny * L); ctx.stroke(); ctx.setLineDash([]);
      if (e.thI < 0.6 * D2R) { pill(e.type === 'mirror' ? '0°: straight back' : '0°: straight through', X + ny * 62, Y + nx * 62, C.gold); continue; }
      var r = Math.max(16, 1.8 * V.k), p1 = arcBetween(X, Y, r, [nx, ny], [-e.dx, -e.dy], C.gold);
      if (e.type === 'tir') {
        var p3 = arcBetween(X, Y, r + 6, [nx, ny], [e.ox, e.oy], C.pink); pill(deg(e.thI) + ' > ' + deg(e.crit) + ': all reflects', p3[0], p3[1] - 12, C.pink);
        continue;
      }
      pill(deg(e.thI), p1[0], p1[1], C.gold);
      if (e.type === 'refract') {
        var p2 = arcBetween(X, Y, r, [-nx, -ny], [e.ox, e.oy], C.green); pill(deg(e.thT), p2[0], p2[1], C.green);
      } else {
        var p4 = arcBetween(X, Y, r + 6, [nx, ny], [e.ox, e.oy], C.blue); pill(deg(e.thI), p4[0], p4[1], C.blue);
      }
    }
    ctx.restore();
  }

  // focal points and distance markers for the first lens
  function drawLensGuides() {
    var L = lensOfInterest(); if (!L) return;
    var sel = piece(S.sel), show = sel === L || S.scene === 'lens' || S.scene === 'image';
    if (!show) return;
    var ux = Math.cos(L.a), uy = Math.sin(L.a), f = M.lensmaker(L, M.LAM_D), g = M.lensGeom(L), ext = 60;
    ctx.save();
    ctx.setLineDash([2, 6]); ctx.strokeStyle = 'rgba(143,179,198,0.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx(L.x - ux * ext), sy(L.y - uy * ext)); ctx.lineTo(sx(L.x + ux * ext), sy(L.y + uy * ext)); ctx.stroke(); ctx.setLineDash([]);
    [1, -1].forEach(function (s) {
      var fx = L.x + ux * f * s, fy = L.y + uy * f * s;
      ctx.fillStyle = 'rgba(255,212,121,0.85)'; ctx.beginPath(); ctx.arc(sx(fx), sy(fy), 3, 0, 7); ctx.fill();
      ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(s > 0 ? 'F′' : 'F', sx(fx), sy(fy) - 5);
    });
    // distances along the axis: lens to screen, lamp to lens
    var off = -(g.a + 2.6), vx = -uy, vy = ux;
    function dim(d1, d2, label, color) {
      var ax = L.x + ux * d1 + vx * off, ay = L.y + uy * d1 + vy * off, bx = L.x + ux * d2 + vx * off, by = L.y + uy * d2 + vy * off;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx(ax), sy(ay)); ctx.lineTo(sx(bx), sy(by)); ctx.stroke();
      [[ax, ay], [bx, by]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(sx(q[0] - vx * 0.8), sy(q[1] - vy * 0.8)); ctx.lineTo(sx(q[0] + vx * 0.8), sy(q[1] + vy * 0.8)); ctx.stroke(); });
      pill(label, sx((ax + bx) / 2), sy((ay + by) / 2) + 10, color);
    }
    var scr = null, best = 1e9;
    S.pieces.forEach(function (q) { if (q.type !== 'screen') return; var vOff = Math.abs(-(q.x - L.x) * uy + (q.y - L.y) * ux); if (vOff < q.len / 2 + 4) { var d = (q.x - L.x) * ux + (q.y - L.y) * uy; if (d > 0 && d < best) { best = d; scr = q; } } });
    var lamp = first('lamp');
    if (scr) dim(0, best, (lamp ? 'dᵢ ' : '') + fmt(best, 1) + ' cm', 'rgba(116,192,252,0.9)');
    if (lamp) { var dl = (lamp.x - L.x) * ux + (lamp.y - L.y) * uy; if (dl < 0 && Math.abs(-(lamp.x - L.x) * uy + (lamp.y - L.y) * ux) < 20) dim(dl, 0, 'dₒ ' + fmt(-dl, 1) + ' cm', 'rgba(249,168,212,0.9)'); }
    ctx.restore();
  }

  // the rainbow: the angle at the drop, the two paths of the rainbow ray, and the graph of returning light
  function drawRainbowGuides() {
    var E = S.eye; if (!E || !E.ok) return;
    var d = E.drop, sun = E.sun, sxv = Math.cos(sun.a), syv = Math.sin(sun.a), X = sx(d.x), Y = sy(d.y);
    ctx.save();
    // line back toward the Sun, and the line to the eye
    var Lr = (d.r + 14) * V.k;
    ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,212,121,0.55)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - sxv * Lr, Y + syv * Lr); ctx.stroke();
    ctx.strokeStyle = 'rgba(219,231,239,0.6)'; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(sx(E.eye.x), sy(E.eye.y)); ctx.stroke(); ctx.setLineDash([]);
    var lp = arcBetween(X, Y, (d.r + 4) * V.k, [-sxv, -syv], [E.eye.x - d.x, E.eye.y - d.y], C.gold);
    pill(fmt(E.theta, 1) + '°', lp[0], lp[1], C.gold);
    var tl = [X - sxv * Lr, Y + syv * Lr]; ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,212,121,0.8)'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('toward the Sun', tl[0] + 10, tl[1] + 5);
    // the rainbow rays (the paths that leave at the bow angle), on the eye's side
    if (E.lit) {
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var kk = E.theta > 46 ? 2 : 1;
      [650, 532, 405].forEach(function (lam) {
        var n = M.nOf(d.mat, lam), bw = M.bowAngle(n, kk), best = null;
        [1, -1].forEach(function (sg) { var pth = M.dropPath(d.x, d.y, d.r, sxv, syv, n, kk, sg * bw.b); if (pth && ((E.eye.x - d.x) * pth.dx + (E.eye.y - d.y) * pth.dy) > 0 && (!best || ((E.eye.x - d.x) * pth.dx + (E.eye.y - d.y) * pth.dy) > best.score)) { pth.score = (E.eye.x - d.x) * pth.dx + (E.eye.y - d.y) * pth.dy; best = pth; } });
        if (!best) return;
        var col = lamRGB(lam, false), last = best.pts[best.pts.length - 1], ext = Math.hypot(E.eye.x - d.x, E.eye.y - d.y) + 4;
        var p1 = best.pts[1], back = (p1[0] - sun.x) * sxv + (p1[1] - sun.y) * syv; best.pts[0] = [p1[0] - sxv * back, p1[1] - syv * back];
        ctx.beginPath(); best.pts.forEach(function (q, j) { if (j) ctx.lineTo(sx(q[0]), sy(q[1])); else ctx.moveTo(sx(q[0]), sy(q[1])); });
        ctx.lineTo(sx(last[0] + best.dx * ext), sy(last[1] + best.dy * ext));
        ctx.strokeStyle = css(col, 0.18); ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = css(col, 0.85); ctx.lineWidth = 1.6; ctx.stroke();
      });
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }
  function insetBox(x, y, w, h, title) {
    ctx.fillStyle = 'rgba(11,27,39,0.88)'; ctx.strokeStyle = 'rgba(120,170,200,0.3)'; ctx.lineWidth = 1; rr(x, y, w, h, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.muted; ctx.font = '600 10.5px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(title, x + 8, y + 6);
  }
  function drawRainbowChart(box) {
    var E = S.eye; if (!E || !E.ok) return;
    var H = E.H, x = box[0], y = box[1], w = box[2], h = box[3];
    insetBox(x, y, w, h, w < 300 ? 'Light sent back, by angle' : 'Light sent back by the drop, by angle from the Sun line');
    var gx = x + 10, gy = y + 22, gw = w - 20, gh = h - 40, maxA = 60, nb = Math.round(maxA / H.bin), i, j;
    ctx.save();
    ctx.strokeStyle = 'rgba(120,170,200,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy + gh + 0.5); ctx.lineTo(gx + gw, gy + gh + 0.5); ctx.stroke();
    ctx.fillStyle = C.muted; ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (i = 0; i <= maxA; i += 10) { var tx = gx + gw * i / maxA; ctx.fillRect(tx, gy + gh, 1, 3); ctx.fillText(i + '°', tx, gy + gh + 4); }
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < H.lams.length; i++) {
      var col = lamRGB(H.lams[i], false), bins = H.bins[i];
      ctx.beginPath();
      for (j = 0; j < nb; j++) { var v = Math.sqrt(bins[j] / H.max), px = gx + gw * (j + 0.5) / nb, py = gy + gh - Math.min(1, v) * gh; if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.strokeStyle = css(col, 0.75); ctx.lineWidth = 1.2; ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    var ex = gx + gw * Math.min(maxA, E.theta) / maxA;
    if (E.theta <= maxA) { ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ex, gy - 2); ctx.lineTo(ex, gy + gh); ctx.stroke(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(ex - 4, gy - 4); ctx.lineTo(ex + 4, gy - 4); ctx.lineTo(ex, gy + 2); ctx.fill(); }
    ctx.restore();
  }
  // what the screen shows: light added up along its length
  function drawScreenView(box) {
    var sg = screenGroup(); if (!sg) return false;
    var scr = sg.piece, x = box[0], y = box[1], w = box[2], h = box[3], N = Math.max(40, Math.floor(w - 16)), acc = [new Float32Array(N), new Float32Array(N), new Float32Array(N)], i, j;
    var hits = S.tr.hits, kern = [0.12, 0.35, 1, 0.35, 0.12];
    for (i = 0; i < hits.length; i++) {
      var hh = hits[i]; if (hh.piece !== scr || (hh.weak && !S.weak)) continue;
      var src = S.pieces[hh.src]; if (!src) continue;
      var white = src.type === 'sun' || src.color === 'white', col = lamRGB(hh.lam, white), gain = (src.type === 'laser' ? 1.4 : src.type === 'lamp' ? 0.9 : 0.5) * hh.I;
      var b = Math.round((hh.s / scr.len + 0.5) * (N - 1));
      for (j = -2; j <= 2; j++) { var q = b + j; if (q < 0 || q >= N) continue; var kw = kern[j + 2] * gain; acc[0][q] += col[0] * kw; acc[1][q] += col[1] * kw; acc[2][q] += col[2] * kw; }
    }
    var spot = sg.groups[0], title = spot.nRays < 2 && spot.nLam < 2 ? 'On the screen' : 'On the screen · ' + (spot.width < 1 ? fmt(spot.width * 10, 1) + ' mm' : fmt(spot.width, 1) + ' cm') + ' wide';
    insetBox(x, y, w, h, title);
    var sx0 = x + 8, sy0 = y + 22, sh = h - 30;
    ctx.fillStyle = '#0d1820'; ctx.fillRect(sx0, sy0, N, sh);
    for (i = 0; i < N; i++) {
      var r = 1 - Math.exp(-2.4 * acc[0][i]), g = 1 - Math.exp(-2.4 * acc[1][i]), bl = 1 - Math.exp(-2.4 * acc[2][i]);
      if (r + g + bl < 0.01) continue;
      ctx.fillStyle = 'rgb(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(bl * 255) + ')'; ctx.fillRect(sx0 + i, sy0, 1, sh);
    }
    ctx.strokeStyle = 'rgba(120,170,200,0.3)'; ctx.strokeRect(sx0 - 0.5, sy0 - 0.5, N + 1, sh + 1);
    return true;
  }
  // a few bright dots running along the laser beams
  function drawPulses() {
    if (reduced || S.revealing || !S.tr) return;
    var segs = S.tr.segs, P = S.pieces, sp = 14, ph = (S.time * 34) % sp, i;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < segs.length; i++) {
      var s = segs[i], src = P[s.src]; if (!src || src.type !== 'laser' || s.weak || s.I < 0.2) continue;
      var len = Math.min(s.len, 140), first0 = Math.ceil((s.L0 - ph) / sp) * sp + ph - s.L0;
      var col = src.color === 'white' ? [1, 1, 1] : lamRGB(s.lam, false);
      if (src.color === 'white' && s.lam !== M.WHITE[4]) continue;
      ctx.fillStyle = css(col, 0.9 * s.I);
      for (var t = first0; t < len; t += sp) { var px = sx(s.x1 + (s.x2 - s.x1) * t / s.len), py = sy(s.y1 + (s.y2 - s.y1) * t / s.len); ctx.beginPath(); ctx.arc(px, py, 1.8, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }

  function frame(dt) {
    S.time += dt;
    fitView();
    if (S.dirty) retrace();
    if (S.revealing) { S.reveal += dt * 160; S.raysDirty = true; }
    if (S.raysDirty) renderRays();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(BG, 0, 0); ctx.setTransform(K.dpr, 0, 0, K.dpr, 0, 0);
    drawLensGuides();
    for (var i = 0; i < S.pieces.length; i++) drawPiece(S.pieces[i]);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(RC, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.setTransform(K.dpr, 0, 0, K.dpr, 0, 0);
    drawPulses();
    drawRainbowGuides();
    drawAngles();
    drawSelection();
    // insets: the screen's view, and the rainbow graph
    var w = K.w, h = K.h, hasChart = S.eye && S.eye.ok;
    if (V.narrow) {
      var cw = w - 16, ch = 92, yb = h - 26 - ch;
      if (hasChart) { drawRainbowChart([8, yb, cw, ch]); yb -= 58; }
      drawScreenView([8, yb + (hasChart ? 0 : ch - 50), Math.min(cw, 300), 50]);
    } else {
      drawScreenView([w - 12 - Math.min(260, w * 0.32), 54, Math.min(260, w * 0.32), 52]);
      if (hasChart) drawRainbowChart([w - 12 - Math.min(340, w * 0.42), h - 28 - 120, Math.min(340, w * 0.42), 120]);
    }
    pumpToasts();
  }

  // ---------- start ----------
  syncToggles();
  loadScene(ui.get('scene', 'snell'));
  LAB.loop(frame, view);
  LAB.onTheme(function () { });
})();
