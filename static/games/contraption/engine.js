/* Contraption Workshop: the parts and the physics (/games/contraption/). Written for this site; no outside code.
   Runs in the browser (window.CW) and in node (require), so scripts/contraption/verify-levels.js can play every
   level's recorded solution headless.

   World: 960 x 560 px, y down, grid cell 40 px, the floor's top at y = 540. Gravity 900 px/s².
   Parts (p = {id, t, x, y, a, n, fixed}):
     ball    (x, y) center                      ramp   (x, y) center, a = angle in degrees (-45..45), n = length in cells
     dominoes(x, y) first domino on its support, a = direction (1 right, -1 left), n = how many
     lever   (x, y) fulcrum base, a = which end starts down     pulley (x, y) wheel, a = side of the bucket you fill
     spring  (x, y) base, a = tilt in degrees                    funnel (x, y) top of the mouth
     cup     (x, y) base            bell (x, y) center            wedge  (x, y) base
     screw   (x, y) base, n = height in cells, a = side it lets out on      wheel (x, y) axle (a paddle wheel)
     block   (x, y) top-left, a = width, n = height in px (levels only: walls and shelves)
   The physics: balls are circles; every other moving part has one degree of freedom (a lever, a domino or the
   paddle wheel turns about its pivot; the pulley's two buckets move together on the rope). Contacts are solved
   with impulses along the joint's own direction, which keeps the machines stable. Fixed step 1/60 s, 8 substeps,
   so slow motion only plays the same steps more slowly. */
(function (root) {
  'use strict';
  var W = 960, H = 560, FLOOR = 540, GRAV = 900, BALL_R = 11, DT = 1 / 60, SUB = 8;
  var DOM_W = 8, DOM_H = 40, DOM_PITCH = 24;

  // ---------- geometry helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function closest(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
    t = clamp(t, 0, 1);
    return [ax + dx * t, ay + dy * t];
  }
  function segSegDist(a, b) {
    // distance between segments a=[ax,ay,bx,by] and b
    if (segsCross(a, b)) return 0;
    var d = Infinity, c;
    c = closest(a[0], a[1], b[0], b[1], b[2], b[3]); d = Math.min(d, Math.hypot(a[0] - c[0], a[1] - c[1]));
    c = closest(a[2], a[3], b[0], b[1], b[2], b[3]); d = Math.min(d, Math.hypot(a[2] - c[0], a[3] - c[1]));
    c = closest(b[0], b[1], a[0], a[1], a[2], a[3]); d = Math.min(d, Math.hypot(b[0] - c[0], b[1] - c[1]));
    c = closest(b[2], b[3], a[0], a[1], a[2], a[3]); d = Math.min(d, Math.hypot(b[2] - c[0], b[3] - c[1]));
    return d;
  }
  function segsCross(a, b) {
    function o(px, py, qx, qy, rx, ry) { return (qx - px) * (ry - py) - (qy - py) * (rx - px); }
    var d1 = o(a[0], a[1], a[2], a[3], b[0], b[1]), d2 = o(a[0], a[1], a[2], a[3], b[2], b[3]);
    var d3 = o(b[0], b[1], b[2], b[3], a[0], a[1]), d4 = o(b[0], b[1], b[2], b[3], a[2], a[3]);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  }
  function rad(deg) { return deg * Math.PI / 180; }

  // ---------- part catalogue ----------
  // supported: must stand on the floor, a level ramp or a block. machine: which simple machine it is.
  var TYPES = {
    ball:     { name: 'Ball', supported: false },
    ramp:     { name: 'Ramp', supported: false, machine: 'incline', angles: [-45, -30, -15, 0, 15, 30, 45], sizes: [2, 3, 4, 5, 6] },
    dominoes: { name: 'Dominoes', supported: true, sizes: [2, 3, 4, 5, 6, 7, 8] },
    lever:    { name: 'Lever', supported: true, machine: 'lever' },
    pulley:   { name: 'Pulley', supported: false, machine: 'pulley' },
    spring:   { name: 'Spring', supported: true, angles: [-30, -15, 0, 15, 30] },
    funnel:   { name: 'Funnel', supported: false },
    cup:      { name: 'Cup', supported: true },
    bell:     { name: 'Bell', supported: false },
    wedge:    { name: 'Wedge', supported: true, machine: 'wedge' },
    screw:    { name: 'Screw lift', supported: true, machine: 'screw', sizes: [2, 3, 4, 5, 6] },
    wheel:    { name: 'Paddle wheel', supported: false, machine: 'wheel' },
    block:    { name: 'Wall', supported: false }
  };
  var MACHINES = [
    { k: 'incline', name: 'Inclined plane', part: 'a ramp' },
    { k: 'lever', name: 'Lever', part: 'the lever' },
    { k: 'wheel', name: 'Wheel and axle', part: 'the paddle wheel' },
    { k: 'pulley', name: 'Pulley', part: 'the pulley' },
    { k: 'wedge', name: 'Wedge', part: 'the wedge' },
    { k: 'screw', name: 'Screw', part: 'the screw lift' }
  ];
  var LEVER_LEN = 160, LEVER_H = 24, LEVER_LIM = 0.26, PUL_R = 28, PUL_ROPE = 110, PUL_RANGE = 60, BKT_W = 44, BKT_H = 30;
  var SPRING_H = 26, SPRING_W = 44, CUP_W = 52, CUP_H = 36, WEDGE_W = 80, WEDGE_H = 40, SCREW_W = 34, WHEEL_R = 46;

  // Static outline of a part (segments with a radius) in its starting pose: used for placement rules and drawing.
  // Each entry: [ax, ay, bx, by, r].
  function shapes(p) {
    var x = p.x, y = p.y, s = [], i;
    switch (p.t) {
      case 'ball': s.push([x, y, x, y, BALL_R]); break;
      case 'ramp': {
        var L = p.n * 40 / 2, c = Math.cos(rad(p.a)), sn = Math.sin(rad(p.a));
        s.push([x - c * L, y - sn * L, x + c * L, y + sn * L, 4]); break;
      }
      case 'dominoes':
        for (i = 0; i < p.n; i++) { var dx = x + p.a * i * DOM_PITCH; s.push([dx, y - 5, dx, y - DOM_H + 4, DOM_W / 2]); }
        break;
      case 'lever':
        s.push([x - 14, y - 1, x, y - LEVER_H, 2], [x + 14, y - 1, x, y - LEVER_H, 2]);
        var t0 = p.a * LEVER_LIM, cc = Math.cos(t0) * LEVER_LEN / 2, ss = Math.sin(t0) * LEVER_LEN / 2;
        s.push([x - cc, y - LEVER_H - 3 - ss, x + cc, y - LEVER_H - 3 + ss, 3]);
        break;
      case 'pulley': {
        s.push([x, y, x, y, PUL_R + 3]);
        var ax = x + p.a * PUL_R, bx = x - p.a * PUL_R, ya = y + PUL_ROPE - PUL_RANGE, yb = y + PUL_ROPE + PUL_RANGE;
        s.push.apply(s, bucketSegs(ax, ya).concat(bucketSegs(bx, yb)));
        s.push([ax, y, ax, ya, 1], [bx, y, bx, yb, 1]);
        break;
      }
      case 'spring': {
        var tc = Math.cos(rad(p.a)) * SPRING_W / 2, ts = Math.sin(rad(p.a)) * SPRING_W / 2;
        s.push([x - 16, y - 2, x + 16, y - 2, 2], [x, y - 2, x, y - SPRING_H, 3], [x - tc, y - SPRING_H - ts, x + tc, y - SPRING_H + ts, 3]);
        break;
      }
      case 'funnel': s.push([x - 42, y, x - 17, y + 48, 3], [x + 42, y, x + 17, y + 48, 3], [x - 17, y + 48, x - 17, y + 66, 3], [x + 17, y + 48, x + 17, y + 66, 3]); break;
      case 'cup': s.push([x - CUP_W / 2, y - CUP_H, x - CUP_W / 2, y - 3, 3], [x - CUP_W / 2, y - 3, x + CUP_W / 2, y - 3, 3], [x + CUP_W / 2, y - 3, x + CUP_W / 2, y - CUP_H, 3]); break;
      case 'bell': s.push([x, y, x, y, 15]); break;
      case 'wedge': s.push([x - WEDGE_W / 2, y - 2, x, y - WEDGE_H, 2], [x, y - WEDGE_H, x + WEDGE_W / 2, y - 2, 2], [x - WEDGE_W / 2, y - 2, x + WEDGE_W / 2, y - 2, 2]); break;
      case 'screw': {
        var h = p.n * 40, w2 = SCREW_W / 2;
        // the back wall and the front wall, with a gap at the bottom (the intake, on the far side) and at the top (the outlet)
        s.push([x + p.a * w2, y - 3, x + p.a * w2, y - h + 34, 3]);   // outlet side: open at the top
        s.push([x - p.a * w2, y - 34, x - p.a * w2, y - h, 3]);       // intake side: open at the bottom
        s.push([x - w2, y - h, x + w2, y - h, 3]);
        break;
      }
      case 'wheel': {
        s.push([x, y, x, y, 6]);
        for (i = 0; i < 4; i++) { var an = i * Math.PI / 2 + Math.PI / 4; s.push([x, y, x + Math.cos(an) * WHEEL_R, y + Math.sin(an) * WHEEL_R, 3]); }
        break;
      }
      case 'block': s.push([x, y, x + p.a, y, 2], [x + p.a, y, x + p.a, y + p.n, 2], [x + p.a, y + p.n, x, y + p.n, 2], [x, y + p.n, x, y, 2]); break;
    }
    return s;
  }
  function bucketSegs(cx, top) {
    var w = BKT_W / 2;
    return [[cx - w, top, cx - w + 3, top + BKT_H, 3], [cx - w + 3, top + BKT_H, cx + w - 3, top + BKT_H, 3], [cx + w - 3, top + BKT_H, cx + w, top, 3]];
  }
  // A part's swept space: its outline plus where its moving bits go, so other parts can't be put in the way.
  function clearance(p) {
    var s = shapes(p).slice();
    if (p.t === 'lever') {
      var x = p.x, y = p.y - LEVER_H - 3, t0 = -p.a * LEVER_LIM, cc = Math.cos(t0) * LEVER_LEN / 2, ss = Math.sin(t0) * LEVER_LEN / 2;
      s.push([x - cc, y - ss, x + cc, y + ss, 3]);
    } else if (p.t === 'pulley') {
      var ax = p.x + p.a * PUL_R, bx = p.x - p.a * PUL_R;
      s.push.apply(s, bucketSegs(ax, p.y + PUL_ROPE + PUL_RANGE).concat(bucketSegs(bx, p.y + PUL_ROPE - PUL_RANGE)));
    } else if (p.t === 'wheel') {
      for (var i = 0; i < 8; i++) { var an = i * Math.PI / 4; s.push([p.x, p.y, p.x + Math.cos(an) * WHEEL_R, p.y + Math.sin(an) * WHEEL_R, 3]); }
    }
    return s;
  }
  // The base of a supported part: half its width, for checking it fits on its shelf.
  function baseHalf(p) {
    switch (p.t) {
      case 'dominoes': return null;
      case 'lever': return 14; case 'spring': return 16; case 'cup': return CUP_W / 2; case 'wedge': return WEDGE_W / 2; case 'screw': return SCREW_W / 2;
    }
    return 10;
  }
  function baseSpan(p) {
    if (p.t === 'dominoes') { var x2 = p.x + p.a * (p.n - 1) * DOM_PITCH; return [Math.min(p.x, x2) - DOM_W / 2, Math.max(p.x, x2) + DOM_W / 2]; }
    var h = baseHalf(p); return [p.x - h, p.x + h];
  }
  // Surfaces a part can stand on: [x1, x2, y].
  function surfaces(parts) {
    var out = [[0, W, FLOOR]];
    parts.forEach(function (q) {
      if (q.t === 'ramp' && q.a === 0) out.push([q.x - q.n * 20, q.x + q.n * 20, q.y - 4]);
      if (q.t === 'block') out.push([q.x, q.x + q.a, q.y - 2]);
    });
    return out;
  }
  function inWorld(sh) {
    for (var i = 0; i < sh.length; i++) {
      var s = sh[i], r = s[4];
      if (Math.min(s[0], s[2]) - r < -0.5 || Math.max(s[0], s[2]) + r > W + 0.5) return false;
      if (Math.min(s[1], s[3]) - r < -0.5 || Math.max(s[1], s[3]) + r > FLOOR + 4.5) return false;
    }
    return true;
  }
  function overlaps(sa, sb, slack) {
    for (var i = 0; i < sa.length; i++) for (var j = 0; j < sb.length; j++) {
      var a = sa[i], b = sb[j];
      if (segSegDist(a, b) < a[4] + b[4] - (slack || 1.5)) return true;
    }
    return false;
  }
  // Is part p allowed where it is, among the other parts?
  function placeOK(p, others) {
    var sh = clearance(p);
    if (!inWorld(sh)) return false;
    if (TYPES[p.t].supported) {
      var sp = baseSpan(p), ok = false;
      surfaces(others).forEach(function (s) { if (Math.abs(s[2] - p.y) < 0.5 && sp[0] >= s[0] - 0.5 && sp[1] <= s[1] + 0.5) ok = true; });
      if (!ok) return false;
    }
    for (var i = 0; i < others.length; i++) if (overlaps(sh, clearance(others[i]))) return false;
    return true;
  }
  // Every allowed spot for part p (keeping its a and n) among the others, on a 20 px grid (supported parts: on
  // every surface, every 10 px).
  function candidates(p, others) {
    var out = [], x, y, q;
    if (TYPES[p.t].supported) {
      surfaces(others).forEach(function (s) {
        for (x = Math.ceil(s[0] / 10) * 10; x <= s[1]; x += 10) {
          q = Object.assign({}, p, { x: x, y: s[2] });
          if (placeOK(q, others)) out.push(q);
        }
      });
    } else {
      for (y = 20; y <= FLOOR; y += 20) for (x = 20; x < W; x += 20) {
        q = Object.assign({}, p, { x: x, y: y });
        if (placeOK(q, others)) out.push(q);
      }
    }
    return out;
  }
  // Where motion leaves a part (outlets) and where a part can take it (inlets), for the "connect" magnet.
  function outlets(p) {
    var L, c, s;
    switch (p.t) {
      case 'ball': return [[p.x, p.y + BALL_R]];
      case 'ramp': if (p.a === 0) return []; L = p.n * 20; c = Math.cos(rad(p.a)); s = Math.sin(rad(p.a));
        return p.a > 0 ? [[p.x + c * L + 12, p.y + s * L + 6]] : [[p.x - c * L - 12, p.y - s * L + 6]];
      case 'funnel': return [[p.x, p.y + 70]];
      case 'screw': return [[p.x + p.a * (SCREW_W / 2 + 24), p.y - p.n * 40 + 14]];
      case 'lever': return [[p.x - p.a * LEVER_LEN / 2, p.y - LEVER_H - 40]];
      case 'spring': return [];
    }
    return [];
  }
  function inlets(p) {
    var L, c, s;
    switch (p.t) {
      case 'ramp': if (p.a === 0) return [[p.x, p.y - 6]]; L = p.n * 20; c = Math.cos(rad(p.a)); s = Math.sin(rad(p.a));
        return p.a > 0 ? [[p.x - c * L + 8, p.y - s * L - 4]] : [[p.x + c * L - 8, p.y + s * L - 4]];
      case 'funnel': return [[p.x, p.y]];
      case 'cup': return [[p.x, p.y - CUP_H]];
      case 'bell': return [[p.x, p.y - 15]];
      case 'lever': return [[p.x - p.a * LEVER_LEN / 2 * 0.85, p.y - LEVER_H - 30], [p.x + p.a * LEVER_LEN / 2 * 0.85, p.y - LEVER_H]];
      case 'pulley': return [[p.x + p.a * PUL_R, p.y + PUL_ROPE - PUL_RANGE]];
      case 'spring': return [[p.x, p.y - SPRING_H]];
      case 'wedge': return [[p.x, p.y - WEDGE_H]];
      case 'screw': return [[p.x - p.a * (SCREW_W / 2 + 6), p.y - 14]];
      case 'wheel': return [[p.x + 20, p.y - WHEEL_R], [p.x - 20, p.y - WHEEL_R]];
      case 'dominoes': return [[p.x - p.a * 10, p.y - DOM_H + 4]];
    }
    return [];
  }
  // Does p take motion from one of the others? (an inlet just under an outlet, within reach of a falling ball)
  function connects(p, others) {
    var ins = inlets(p), outs = [], i, j;
    others.forEach(function (q) { outs = outs.concat(outlets(q)); });
    var mine = outlets(p), ins2 = [];
    others.forEach(function (q) { ins2 = ins2.concat(inlets(q)); });
    for (i = 0; i < ins.length; i++) for (j = 0; j < outs.length; j++) {
      var dx = ins[i][0] - outs[j][0], dy = ins[i][1] - outs[j][1];
      if (dy > -6 && dy < 170 && Math.abs(dx) < 8 + dy * 0.08) return true;
    }
    for (i = 0; i < mine.length; i++) for (j = 0; j < ins2.length; j++) {
      var ex = ins2[j][0] - mine[i][0], ey = ins2[j][1] - mine[i][1];
      if (ey > -6 && ey < 170 && Math.abs(ex) < 8 + ey * 0.08) return true;
    }
    return false;
  }

  // ---------- the simulation ----------
  function Sim(parts) {
    this.parts = parts;
    this.balls = []; this.segs = []; this.kins = []; this.bells = []; this.cups = []; this.screws = []; this.springs = [];
    this.t = 0; this.rings = []; this.active = []; this.activeSet = {}; this.cupDone = false; this.lifted = false; this.quiet = 0;
    this.goalT = null; this.cupT = {};
    var self = this;
    // walls and floor
    this.segs.push({ ax: -20, ay: FLOOR + 20, bx: W + 20, by: FLOOR + 20, r: 20, e: 0.25, mu: 0.04, owner: null });
    this.segs.push({ ax: -20, ay: -400, bx: -20, by: FLOOR, r: 20, e: 0.3, mu: 0.1, owner: null });
    this.segs.push({ ax: W + 20, ay: -400, bx: W + 20, by: FLOOR, r: 20, e: 0.3, mu: 0.1, owner: null });
    parts.forEach(function (p) { self.add(p); });
  }
  Sim.prototype.seg = function (a, owner, e, mu, kind) {
    this.segs.push({ ax: a[0], ay: a[1], bx: a[2], by: a[3], r: a[4], e: e === undefined ? 0.3 : e, mu: mu === undefined ? 0.03 : mu, owner: owner, kind: kind });
  };
  Sim.prototype.add = function (p) {
    var self = this, sh, i;
    switch (p.t) {
      case 'ball': this.balls.push({ x: p.x, y: p.y, vx: 0, vy: 0, r: BALL_R, owner: p.id, spin: 0, cap: null }); break;
      case 'ramp': case 'wedge': case 'block':
        shapes(p).forEach(function (s) { self.seg(s, p.id, 0.25, 0.03); }); break;
      case 'funnel': shapes(p).forEach(function (s) { self.seg(s, p.id, 0.05, 0.03); }); break;
      case 'cup':
        shapes(p).forEach(function (s) { self.seg(s, p.id, 0.15, 0.2); });
        this.cups.push({ owner: p.id, x1: p.x - CUP_W / 2 + 3, x2: p.x + CUP_W / 2 - 3, y1: p.y - CUP_H, y2: p.y - 3 }); break;
      case 'bell': this.seg([p.x, p.y, p.x, p.y, 15], p.id, 0.5, 0.05, 'bell');
        this.bells.push({ owner: p.id, x: p.x, y: p.y, rung: 0, swing: 0, sv: 0 }); break;
      case 'spring':
        sh = shapes(p);
        this.seg(sh[0], p.id, 0.2, 0.2); this.seg(sh[1], p.id, 0.2, 0.2);
        this.seg(sh[2], p.id, 0.2, 0.05, 'spring');
        this.springs.push({ owner: p.id, squash: 0 }); break;
      case 'screw':
        shapes(p).forEach(function (s) { self.seg(s, p.id, 0.2, 0.1); });
        this.screws.push({ owner: p.id, x: p.x, y0: p.y - 14, y1: p.y - p.n * 40 + 16, dir: p.a, ix: p.x - p.a * 2, turn: 0 }); break;
      case 'lever': {
        sh = shapes(p); this.seg(sh[0], p.id, 0.2, 0.2); this.seg(sh[1], p.id, 0.2, 0.2);
        var px = p.x, py = p.y - LEVER_H, hl = LEVER_LEN / 2, m = 0.7;
        this.kins.push({
          owner: p.id, type: 'rot', px: px, py: py, q: p.a * LEVER_LIM, v: 0, lo: -LEVER_LIM, hi: LEVER_LIM, eLim: 0.15, damp: 0.2,
          invI: 1 / (m * LEVER_LEN * LEVER_LEN / 12), m: m, com: [0, -3],
          segs: [[-hl, -3, hl, -3, 3, 0.5], [p.a * hl, -3, p.a * hl, -13, 2, 0.15]], tips: [[-hl, -3], [hl, -3]]   // a lip only on the end that starts down, to hold a ball there
        });
        break;
      }
      case 'dominoes':
        for (i = 0; i < p.n; i++) {
          var x0 = p.x + p.a * i * DOM_PITCH, d = p.a, piv = x0 + d * DOM_W / 2, w = DOM_W, h = DOM_H;
          // local coordinates about the front-bottom corner; the domino falls toward its front
          var bx = -d * w;
          this.kins.push({
            owner: p.id, type: 'rot', px: piv, py: p.y, q: 0, v: 0, lo: d > 0 ? 0 : -Math.PI / 2, hi: d > 0 ? Math.PI / 2 : 0, eLim: 0, damp: 0.05,
            invI: 1 / (0.35 * (w * w + h * h) / 3), m: 0.35, com: [bx / 2, -h / 2], dom: d,
            segs: [[bx, 0, bx, -h, 1, 0.1], [bx, -h, 0, -h, 1, 0.1], [0, -h, 0, 0, 1, 0.1]], tips: [[0, -h], [bx / 2, -h]], back: 0
          });
        }
        break;
      case 'pulley': {
        var ax = p.x + p.a * PUL_R, bx2 = p.x - p.a * PUL_R, ya = p.y + PUL_ROPE, segsP = [], tips = [];
        bucketSegs(ax, ya).forEach(function (s) { segsP.push([s[0], s[1], s[2], s[3], s[4], 0.1, 1]); });
        bucketSegs(bx2, ya).forEach(function (s) { segsP.push([s[0], s[1], s[2], s[3], s[4], 0.1, -1]); });
        tips.push([ax - BKT_W / 2, ya, 1], [ax + BKT_W / 2, ya, 1], [bx2 - BKT_W / 2, ya, -1], [bx2 + BKT_W / 2, ya, -1], [bx2, ya, -1]);
        this.kins.push({ owner: p.id, type: 'slide', q: -PUL_RANGE, v: 0, lo: -PUL_RANGE, hi: PUL_RANGE, eLim: 0.05, damp: 0.6,
          mA: 0.45, mB: 1.0, invI: 1 / (0.45 + 1.0 + 0.4), segs: segsP, tips: tips, wx: p.x, wy: p.y });
        break;
      }
      case 'wheel': {
        var sp = [], tp = [];
        for (i = 0; i < 4; i++) { var an = i * Math.PI / 2 + Math.PI / 4, ex = Math.cos(an) * WHEEL_R, ey = Math.sin(an) * WHEEL_R; sp.push([0, 0, ex, ey, 3, 0.1]); tp.push([ex, ey]); }
        this.kins.push({ owner: p.id, type: 'rot', px: p.x, py: p.y, q: 0, v: 0, lo: -Infinity, hi: Infinity, eLim: 0, damp: 0.9,
          invI: 1 / (4 * 0.25 * WHEEL_R * WHEEL_R / 3 + 300), m: 0, com: [0, 0], segs: sp, tips: tp, spin: true });
        break;
      }
    }
  };
  // world position of a kin body's local point, and its d(point)/dq
  function kinPt(k, lx, ly, sg) {
    if (k.type === 'rot') { var c = Math.cos(k.q), s = Math.sin(k.q); return [k.px + lx * c - ly * s, k.py + lx * s + ly * c]; }
    return [lx, ly + sg * k.q];
  }
  function kinJac(k, wx, wy, sg) {
    if (k.type === 'rot') return [-(wy - k.py), wx - k.px];
    return [0, sg];
  }
  Sim.prototype.kinGravity = function (k) {
    if (k.type === 'slide') return GRAV * (k.mA - k.mB);
    if (!k.m) return 0;
    var p = kinPt(k, k.com[0], k.com[1]);
    return k.m * GRAV * (p[0] - k.px);
  };
  Sim.prototype.markActive = function (owner) {
    if (owner === null || owner === undefined || this.activeSet[owner]) return;
    this.activeSet[owner] = true; this.active.push({ id: owner, t: this.t });
  };
  Sim.prototype.ring = function (b, by, owner) {
    if (b.cool > 0) return;
    b.cool = 0.25; b.rung++; b.sv += 6;
    this.rings.push({ bell: b.owner, by: by, from: owner, t: this.t });
    this.markActive(b.owner);
  };
  Sim.prototype.step = function () {
    for (var i = 0; i < SUB; i++) this.sub(DT / SUB);
    this.t += DT;
    var self = this;
    this.bells.forEach(function (b) { b.cool = Math.max(0, (b.cool || 0) - DT); b.sv -= b.swing * 40 * DT; b.sv *= 0.97; b.swing += b.sv * DT; });
    this.springs.forEach(function (s) { s.squash *= 0.85; });
    this.screws.forEach(function (s) { s.turn += DT * 5; });
    // goals
    this.cups.forEach(function (c) {
      var inside = self.balls.some(function (b) { return b.x > c.x1 && b.x < c.x2 && b.y > c.y1 && b.y < c.y2 && Math.hypot(b.vx, b.vy) < 60; });
      self.cupT[c.owner] = inside ? (self.cupT[c.owner] || 0) + DT : 0;
      if (self.cupT[c.owner] > 0.4) { if (!self.cupDone) { self.cupDone = self.t; self.markActive(c.owner); } }
    });
    this.kins.forEach(function (k) { if (k.type === 'slide' && k.q > k.hi - 3 && !self.lifted) self.lifted = self.t; });
    // still?
    var moving = this.balls.some(function (b) { return b.cap || Math.hypot(b.vx, b.vy) > 8; }) || this.kins.some(function (k) { return Math.abs(k.v) > (k.type === 'slide' ? 3 : 0.05); });
    this.quiet = moving ? 0 : this.quiet + DT;
  };
  Sim.prototype.sub = function (h) {
    var self = this, balls = this.balls, kins = this.kins, i, j, k, b;
    // forces
    for (i = 0; i < balls.length; i++) { b = balls[i]; if (!b.cap) b.vy += GRAV * h; }
    for (i = 0; i < kins.length; i++) {
      k = kins[i];
      k.v += this.kinGravity(k) * k.invI * h;
      k.v *= 1 - k.damp * h;
    }
    // world segments of moving parts
    var ks = [];
    for (i = 0; i < kins.length; i++) {
      k = kins[i];
      for (j = 0; j < k.segs.length; j++) {
        var s = k.segs[j], a = kinPt(k, s[0], s[1], s[6]), c = kinPt(k, s[2], s[3], s[6]);
        ks.push({ k: k, ax: a[0], ay: a[1], bx: c[0], by: c[1], r: s[4], e: s[5], sg: s[6], mu: 0.1, owner: k.owner });
      }
    }
    // screw lifts: carry captured balls; capture balls at the intake
    this.screws.forEach(function (sc) {
      balls.forEach(function (bb) {
        if (bb.cap === sc) {
          bb.y -= 110 * h; bb.x = sc.x; bb.vx = 0; bb.vy = 0; bb.spin += h * 8;
          if (bb.y <= sc.y1) { bb.cap = null; bb.y = sc.y1; bb.x = sc.x + sc.dir * 6; bb.vx = sc.dir * 170; bb.vy = -40; }
        } else if (!bb.cap && Math.abs(bb.x - (sc.x - sc.dir * 4)) < 14 && Math.abs(bb.y - sc.y0) < 12) {
          bb.cap = sc; self.markActive(sc.owner);
        }
      });
    });
    // contacts
    var cs = [];
    for (i = 0; i < balls.length; i++) {
      b = balls[i]; if (b.cap) continue;
      for (j = 0; j < this.segs.length; j++) this.ballSeg(b, this.segs[j], null, cs);
      for (j = 0; j < ks.length; j++) this.ballSeg(b, ks[j], ks[j].k, cs);
      for (j = i + 1; j < balls.length; j++) {
        var o = balls[j]; if (o.cap) continue;
        var dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy);
        if (d < b.r + o.r && d > 1e-6) cs.push({ bb: true, a: b, b: o, nx: dx / d, ny: dy / d, pen: b.r + o.r - d, e: 0.4 });
      }
    }
    // tips of moving parts against other moving parts (dominoes knocking dominoes, a lever end on a domino)
    for (i = 0; i < kins.length; i++) {
      var A = kins[i];
      for (var t = 0; t < A.tips.length; t++) {
        var tp = kinPt(A, A.tips[t][0], A.tips[t][1], A.tips[t][2]);
        for (j = 0; j < ks.length; j++) {
          var S = ks[j]; if (S.k === A) continue;
          var cl = closest(tp[0], tp[1], S.ax, S.ay, S.bx, S.by), ddx = tp[0] - cl[0], ddy = tp[1] - cl[1], dd = Math.hypot(ddx, ddy);
          if (dd < S.r + 1.5 && dd > 1e-6) cs.push({ kk: true, A: A, asg: A.tips[t][2], B: S.k, bsg: S.sg, px: tp[0], py: tp[1], cx: cl[0], cy: cl[1], nx: ddx / dd, ny: ddy / dd, pen: S.r + 1.5 - dd });
        }
        // bells hit by moving parts
        for (j = 0; j < this.bells.length; j++) {
          var bl = this.bells[j];
          if (Math.hypot(tp[0] - bl.x, tp[1] - bl.y) < 24 && Math.abs(A.v) > (A.type === 'slide' ? 5 : 0.2)) this.ring(bl, A.dom ? 'domino' : A.type === 'slide' ? 'bucket' : A.spin ? 'wheel' : 'lever', A.owner);
        }
      }
    }
    // pre-solve normal speeds for restitution
    cs.forEach(function (c) { c.vn0 = self.relVn(c); });
    for (var it = 0; it < 6; it++) cs.forEach(function (c) { self.solve(c, h); });
    // position fixes for balls
    cs.forEach(function (c) {
      if (c.bb) { var f = Math.max(0, c.pen - 0.2) * 0.4; c.a.x -= c.nx * f; c.a.y -= c.ny * f; c.b.x += c.nx * f; c.b.y += c.ny * f; }
      else if (c.ball) { var g = Math.max(0, c.pen - 0.2) * 0.8; c.ball.x += c.nx * g; c.ball.y += c.ny * g; }
    });
    // integrate
    for (i = 0; i < balls.length; i++) {
      b = balls[i]; if (b.cap) continue;
      var sp = Math.hypot(b.vx, b.vy); if (sp > 1300) { b.vx *= 1300 / sp; b.vy *= 1300 / sp; }
      b.x += b.vx * h; b.y += b.vy * h;
      if (b.y > FLOOR + 200 || b.x < -200 || b.x > W + 200) { b.x = clamp(b.x, BALL_R, W - BALL_R); b.y = FLOOR - BALL_R; b.vx = b.vy = 0; }
    }
    for (i = 0; i < kins.length; i++) {
      k = kins[i];
      var vmax = k.type === 'slide' ? 600 : 25; k.v = clamp(k.v, -vmax, vmax);
      k.q += k.v * h;
      var vb = k.type === 'slide' ? 30 : 0.6;   // slower than this, a part that hits its stop stays there
      if (k.q < k.lo) { k.q = k.lo; if (k.v < 0) k.v = k.v < -vb ? -k.v * k.eLim : 0; }
      if (k.q > k.hi) { k.q = k.hi; if (k.v > 0) k.v = k.v > vb ? -k.v * k.eLim : 0; }
      if (Math.abs(k.v) > (k.type === 'slide' ? 8 : 0.4)) this.markActive(k.owner);
    }
  };
  Sim.prototype.ballSeg = function (b, s, k, cs) {
    var cl = closest(b.x, b.y, s.ax, s.ay, s.bx, s.by), dx = b.x - cl[0], dy = b.y - cl[1], d = Math.hypot(dx, dy);
    if (d >= b.r + s.r) return;
    var nx, ny;
    if (d < 1e-6) { nx = 0; ny = -1; } else { nx = dx / d; ny = dy / d; }
    cs.push({ ball: b, s: s, k: k, sg: s.sg, cx: cl[0], cy: cl[1], nx: nx, ny: ny, pen: b.r + s.r - d, e: s.e, mu: s.mu });
  };
  Sim.prototype.relVn = function (c) {
    if (c.bb) return (c.b.vx - c.a.vx) * c.nx + (c.b.vy - c.a.vy) * c.ny;
    if (c.ball) {
      var vx = c.ball.vx, vy = c.ball.vy;
      if (c.k) { var J = kinJac(c.k, c.cx, c.cy, c.sg); vx -= J[0] * c.k.v; vy -= J[1] * c.k.v; }
      return vx * c.nx + vy * c.ny;
    }
    var JA = kinJac(c.A, c.px, c.py, c.asg), JB = kinJac(c.B, c.cx, c.cy, c.bsg);
    return (JA[0] * c.A.v - JB[0] * c.B.v) * c.nx + (JA[1] * c.A.v - JB[1] * c.B.v) * c.ny;
  };
  // One pass of the impulse solver on contact c. Impulses add up over the passes (c.jn, c.jt), and the total push
  // can never pull; friction is capped by the push (Coulomb's law), so a resting ball neither sinks nor sticks.
  Sim.prototype.solve = function (c, h) {
    var vn = this.relVn(c), e, dj, acc;
    if (c.bb) {
      e = c.vn0 < -40 ? c.e : 0;
      dj = (-e * c.vn0 - vn) / 2; acc = Math.max(0, (c.jn || 0) + dj); dj = acc - (c.jn || 0); c.jn = acc;
      c.a.vx -= dj * c.nx; c.a.vy -= dj * c.ny; c.b.vx += dj * c.nx; c.b.vy += dj * c.ny;
      return;
    }
    if (c.ball) {
      var b = c.ball, s = c.s, k = c.k, Jn = 0, invI = 0;
      if (s.kind === 'spring') {
        if (vn < 0 && !c.done) {
          c.done = true;
          var boost = 720, out = Math.max(-vn * 0.85, boost) - vn;
          b.vx += out * c.nx; b.vy += out * c.ny;
          var sp0 = this.springs.filter(function (q) { return q.owner === s.owner; })[0]; if (sp0) sp0.squash = 1;
          this.markActive(s.owner);
        }
        return;
      }
      if (k) { var J = kinJac(k, c.cx, c.cy, c.sg); Jn = J[0] * c.nx + J[1] * c.ny; invI = k.invI; }
      var kn = 1 + Jn * Jn * invI;
      e = c.vn0 < -80 ? c.e : 0;
      dj = (-e * c.vn0 - vn) / kn; acc = Math.max(0, (c.jn || 0) + dj); dj = acc - (c.jn || 0); c.jn = acc;
      b.vx += dj * c.nx; b.vy += dj * c.ny;
      if (k) k.v -= dj * Jn * invI;
      if (!c.marked) {
        c.marked = true;
        if (s.kind === 'bell') { if (-c.vn0 > 20) { var bl = this.bells.filter(function (q) { return q.owner === s.owner; })[0]; if (bl) this.ring(bl, 'ball', b.owner); } }
        else if (-c.vn0 > 30 || Math.hypot(b.vx, b.vy) > 40) this.markActive(s.owner);
      }
      // friction along the surface
      var tx = -c.ny, ty = c.nx, vx = b.vx, vy = b.vy, Jt = 0;
      if (k) { var J2 = kinJac(k, c.cx, c.cy, c.sg); vx -= J2[0] * k.v; vy -= J2[1] * k.v; Jt = J2[0] * tx + J2[1] * ty; }
      var vt = vx * tx + vy * ty, kt = 1 + Jt * Jt * invI, lim = (c.mu || 0) * c.jn;
      var nt = clamp((c.jt || 0) - vt / kt, -lim, lim), djt = nt - (c.jt || 0); c.jt = nt;
      b.vx += djt * tx; b.vy += djt * ty; if (k) k.v -= djt * Jt * invI;
      if (!c.spun) { c.spun = true; b.spin += vt * h / b.r; }
      return;
    }
    // part against part
    var JA = kinJac(c.A, c.px, c.py, c.asg), JB = kinJac(c.B, c.cx, c.cy, c.bsg);
    var na = JA[0] * c.nx + JA[1] * c.ny, nb = JB[0] * c.nx + JB[1] * c.ny;
    var kk = na * na * c.A.invI + nb * nb * c.B.invI;
    if (kk < 1e-12) return;
    var bias = Math.max(0, c.pen - 0.5) * 0.15 / h;
    e = c.vn0 < -60 ? 0.1 : 0;
    var target = Math.max(-e * c.vn0, bias);
    dj = (target - vn) / kk; acc = Math.max(0, (c.jn || 0) + dj); dj = acc - (c.jn || 0); c.jn = acc;
    c.A.v += dj * na * c.A.invI; c.B.v -= dj * nb * c.B.invI;
  };
  // Run until the machine is still (or a time limit). Returns what happened.
  Sim.prototype.run = function (maxT) {
    maxT = maxT || 20;
    while (this.t < maxT) { this.step(); if (this.t > 1.5 && this.quiet > 1.2) break; }
    return this.result();
  };
  Sim.prototype.result = function () {
    var byType = {}, self = this;
    this.parts.forEach(function (p) { byType[p.id] = p.t; });
    var chain = this.active.filter(function (a) { var t = byType[a.id]; return t && t !== 'ball' && t !== 'bell' && t !== 'block'; });
    var firstRing = this.rings.length ? this.rings[0].t : null;
    var before = firstRing === null ? chain : chain.filter(function (a) { return a.t <= firstRing + 1e-9; });
    var used = {};
    this.active.forEach(function (a) { var m = TYPES[byType[a.id]] && TYPES[byType[a.id]].machine; if (m) used[m] = true; });
    var bellsRung = {}; this.rings.forEach(function (r) { bellsRung[r.bell] = true; });
    return { t: this.t, rings: this.rings.slice(), bellsRung: Object.keys(bellsRung).length, ringBy: this.rings.map(function (r) { return r.by; }),
      firstRing: firstRing, steps: before.length, chain: before.map(function (a) { return a.id; }), cup: this.cupDone, lifted: this.lifted, used: used };
  };

  // ---------- levels: goals and stars ----------
  // goal: {type: 'ring'} | {type: 'ring', by: 'domino'} | {type: 'ring', from: <id of the ball that must ring it>} | {type: 'cup'} | {type: 'lift'} | {type: 'steps', n} |
  //       {type: 'machines', need: ['lever', 'pulley']} (and ring) | {type: 'bells', n}
  function goalMet(goal, r) {
    switch (goal.type) {
      case 'ring': return r.rings.some(function (x) { return (!goal.by || x.by === goal.by) && (!goal.from || x.from === goal.from); });
      case 'cup': return !!r.cup;
      case 'lift': return !!r.lifted;
      case 'steps': return r.rings.length > 0 && r.steps === goal.n;
      case 'machines': return r.rings.length > 0 && goal.need.every(function (m) { return r.used[m]; });
      case 'bells': return r.bellsRung >= goal.n;
    }
    return false;
  }
  function goalTime(goal, r) {
    switch (goal.type) { case 'cup': return r.cup || null; case 'lift': return r.lifted || null; }
    if (goal.type === 'bells') { var seen = {}, n = 0; for (var i = 0; i < r.rings.length; i++) { if (!seen[r.rings[i].bell]) { seen[r.rings[i].bell] = 1; n++; if (n >= goal.n) return r.rings[i].t; } } return null; }
    if (goal.by || goal.from) { for (var j = 0; j < r.rings.length; j++) if ((!goal.by || r.rings[j].by === goal.by) && (!goal.from || r.rings[j].from === goal.from)) return r.rings[j].t; return null; }
    return r.firstRing;
  }
  // stars: 1 for the goal, 1 for using no more than `par` parts, 1 for the bonus
  function stars(level, placedCount, r) {
    if (!goalMet(level.goal, r)) return { n: 0, goal: false, par: false, bonus: false };
    var par = placedCount <= level.par, bonus = false, b = level.bonus || {};
    if (b.time) { var t = goalTime(level.goal, r); bonus = t !== null && t <= b.time; }
    if (b.cup) bonus = !!r.cup;
    if (b.lift) bonus = !!r.lifted;
    if (b.machines) bonus = Object.keys(r.used).length >= b.machines;
    if (b.bells) bonus = r.bellsRung >= b.bells;
    if (b.steps) bonus = r.steps >= b.steps;
    return { n: 1 + (par ? 1 : 0) + (bonus ? 1 : 0), goal: true, par: par, bonus: bonus };
  }

  // ---------- layout codes for links and saving ----------
  var CODE = { ball: 'b', ramp: 'r', dominoes: 'd', lever: 'l', pulley: 'p', spring: 's', funnel: 'f', cup: 'c', bell: 'g', wedge: 'w', screw: 'x', wheel: 'h', block: 'k' };
  var UNCODE = {}; Object.keys(CODE).forEach(function (k) { UNCODE[CODE[k]] = k; });
  function encode(parts) {
    return parts.filter(function (p) { return !p.fixed; }).map(function (p) {
      return CODE[p.t] + [p.x, p.y, (p.a || 0) + 60, p.n || 0].map(function (v) { return Math.round(v).toString(36); }).join('.');
    }).join('-');
  }
  function decode(str) {
    var out = [];
    String(str || '').split('-').forEach(function (s, i) {
      var t = UNCODE[s.charAt(0)]; if (!t || t === 'block') return;
      var v = s.slice(1).split('.').map(function (x) { return parseInt(x, 36); });
      if (v.length !== 4 || v.some(isNaN)) return;
      var p = { id: 'u' + i, t: t, x: v[0], y: v[1], a: v[2] - 60, n: v[3] };
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) return;
      out.push(p);
    });
    return out;
  }

  var api = {
    W: W, H: H, FLOOR: FLOOR, GRAV: GRAV, BALL_R: BALL_R, DT: DT, TYPES: TYPES, MACHINES: MACHINES,
    DOM: { w: DOM_W, h: DOM_H, pitch: DOM_PITCH }, LEVER: { len: LEVER_LEN, h: LEVER_H, lim: LEVER_LIM },
    PULLEY: { r: PUL_R, rope: PUL_ROPE, range: PUL_RANGE, bw: BKT_W, bh: BKT_H }, SPRING: { h: SPRING_H, w: SPRING_W },
    CUP: { w: CUP_W, h: CUP_H }, WEDGE: { w: WEDGE_W, h: WEDGE_H }, SCREW: { w: SCREW_W }, WHEEL: { r: WHEEL_R },
    shapes: shapes, clearance: clearance, surfaces: surfaces, placeOK: placeOK, candidates: candidates, connects: connects,
    inlets: inlets, outlets: outlets, kinPt: kinPt, Sim: Sim, goalMet: goalMet, goalTime: goalTime, stars: stars,
    encode: encode, decode: decode
  };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CW = api;
})(typeof window !== 'undefined' ? window : this);
