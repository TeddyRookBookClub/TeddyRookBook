/* Newton's Laws, Chapter 1 (Inertia): the models behind the page, in SI units. window.NL1Phys in the browser,
   module.exports in node (tests in the build notes).
   - Track: Galileo's two ramps joined by a short flat, with rounded corners, and a ball that rolls on it.
   - Probe: a spacecraft in deep space pushed by short thruster bursts.
   - The small inertia demos: tablecloth, coin on a card, a braking car, a ball dropped on a train. */
(function (root) {
  'use strict';
  var G = 9.80665;          // standard gravity, m/s² (exact by definition; NIST SP 811)
  var BETA = 7 / 5;         // a solid ball rolling without slipping: kinetic energy is (1 + 2/5) × ½mv²

  // ---------- Galileo's two ramps ----------
  // o.aL, o.aR: ramp angles (rad, aR may be 0 for a flat that goes on forever); o.flat: length of the flat bottom between
  // the corners (m); o.R: radius of the rounded corners (m); o.Htop, o.HR: heights of the left and right ramp tops (m).
  function Track(o) {
    o = o || {};
    var aL = o.aL === undefined ? 30 * Math.PI / 180 : o.aL, aR = o.aR === undefined ? 30 * Math.PI / 180 : o.aR;
    var flat = o.flat || 0.6, R = o.R || 0.3, Htop = o.Htop || 1.2, HR = o.HR || 1.3;
    this.aL = aL; this.aR = aR; this.flat = flat; this.R = R; this.Htop = Htop; this.HR = HR;
    var segs = [], s = 0;
    var tL = R * Math.tan(aL / 2), tR = aR > 0 ? R * Math.tan(aR / 2) : 0;
    var cxL = -flat / 2, cxR = flat / 2;
    // left ramp, going down to the right
    var P1 = { x: cxL - tL * Math.cos(aL), y: tL * Math.sin(aL) };
    var lenL = (Htop - P1.y) / Math.sin(aL);
    var T = { x: P1.x - lenL * Math.cos(aL), y: Htop };
    segs.push({ type: 'line', s0: s, len: lenL, x0: T.x, y0: T.y, th: -aL }); s += lenL;
    // left corner: θ goes from −aL to 0; centre (cxL + tL, R)
    segs.push({ type: 'arc', s0: s, len: R * aL, cx: cxL + tL, cy: R, th0: -aL }); s += R * aL;
    // the flat
    var fx0 = cxL + tL;
    if (aR > 0) {
      var flen = (cxR - tR) - fx0;
      segs.push({ type: 'line', s0: s, len: flen, x0: fx0, y0: 0, th: 0 }); s += flen;
      segs.push({ type: 'arc', s0: s, len: R * aR, cx: cxR - tR, cy: R, th0: 0 }); s += R * aR;
      var P4 = { x: cxR - tR + R * Math.sin(aR), y: R - R * Math.cos(aR) };
      var lenR = (HR - P4.y) / Math.sin(aR);
      segs.push({ type: 'line', s0: s, len: lenR, x0: P4.x, y0: P4.y, th: aR }); s += lenR;
      this.sRight = segs[3].s0;               // where the right corner begins
      this.sRightRamp = segs[4].s0;
    } else {
      segs.push({ type: 'line', s0: s, len: Infinity, x0: fx0, y0: 0, th: 0 }); s = Infinity;
      this.sRight = segs[2].s0 + (cxR - fx0);  // the point under the right "corner", for distances
      this.sRightRamp = this.sRight;
    }
    this.segs = segs; this.L = s;
    this.sBottom = segs[2].s0 + (0 - fx0);     // the middle of the flat, x = 0
  }
  Track.prototype.seg = function (s) {
    var g = this.segs;
    for (var i = g.length - 1; i > 0; i--) if (s >= g[i].s0) return g[i];
    return g[0];
  };
  Track.prototype.theta = function (s) { var g = this.seg(s); return g.type === 'line' ? g.th : g.th0 + (s - g.s0) / this.R; };
  Track.prototype.kappa = function (s) { return this.seg(s).type === 'arc' ? 1 / this.R : 0; };
  Track.prototype.pos = function (s) {
    var g = this.seg(s), u = s - g.s0;
    if (g.type === 'line') return { x: g.x0 + u * Math.cos(g.th), y: g.y0 + u * Math.sin(g.th) };
    var th = g.th0 + u / this.R;
    return { x: g.cx + this.R * Math.sin(th), y: g.cy - this.R * Math.cos(th) };
  };
  Track.prototype.height = function (s) { return this.pos(s).y; };
  // the arc length on the left ramp where the ball's contact point is at height h
  Track.prototype.sAtHeightLeft = function (h) { var g = this.segs[0]; return Math.max(0, Math.min(g.len, (this.Htop - h) / Math.sin(this.aL))); };

  // A ball rolling on the track. C: rolling resistance as a fraction of the normal force (0 = none).
  function Ball(track, h0, C) {
    this.tr = track; this.C = C || 0; this.beta = BETA; this.g = G;
    this.s = track.sAtHeightLeft(h0); this.v = 0; this.t = 0; this.moving = true;
    this.h0 = track.height(this.s); this.lost = 0; // energy per kg turned into heat by rolling resistance
  }
  Ball.prototype.acc = function (s, v, dir) {
    var th = this.tr.theta(s), k = this.tr.kappa(s), g = this.g;
    var N = g * Math.cos(th) + v * v * k;           // normal force per kg (the track only curves upward)
    return (-g * Math.sin(th) - this.C * dir * N) / this.beta;
  };
  Ball.prototype.energy = function () { return 0.5 * this.beta * this.v * this.v + this.g * this.tr.height(this.s); }; // J per kg
  // One RK4 step of h seconds. Returns 'turn' when the ball turns around, 'stop' when it comes to rest, or ''.
  Ball.prototype.step = function (h) {
    var tr = this.tr, s = this.s, v = this.v, C = this.C, g = this.g, ev = '';
    if (!this.moving) {
      var th0 = tr.theta(s);
      if (Math.abs(Math.sin(th0)) > C * Math.cos(th0) + 1e-12) this.moving = true; else { this.t += h; return ''; }
    }
    var dir = v > 0 ? 1 : v < 0 ? -1 : (tr.theta(s) > 0 ? -1 : 1), self = this;
    function f(ss, vv) { return self.acc(ss, vv, dir); }
    var k1v = f(s, v), k1s = v;
    var k2v = f(s + 0.5 * h * k1s, v + 0.5 * h * k1v), k2s = v + 0.5 * h * k1v;
    var k3v = f(s + 0.5 * h * k2s, v + 0.5 * h * k2v), k3s = v + 0.5 * h * k2v;
    var k4v = f(s + h * k3s, v + h * k3v), k4s = v + h * k3v;
    var s1 = s + h * (k1s + 2 * k2s + 2 * k3s + k4s) / 6, v1 = v + h * (k1v + 2 * k2v + 2 * k3v + k4v) / 6;
    if (C > 0) this.lost += C * Math.abs(s1 - s) * (g * Math.cos(tr.theta(0.5 * (s + s1))) + v * v * tr.kappa(0.5 * (s + s1)));
    if (v1 * dir < 0) {                        // the speed passed through zero during the step
      ev = 'turn';
      if (C > 0) {
        var th1 = tr.theta(s1);
        v1 = 0;
        if (Math.abs(Math.sin(th1)) <= C * Math.cos(th1)) { this.moving = false; ev = 'stop'; }
      }
    }
    // the ends of the track are padded bumpers
    if (s1 < 0) { s1 = 0; v1 = 0; }
    if (s1 > tr.L) { s1 = tr.L; v1 = 0; }
    this.s = s1; this.v = v1; this.t += h;
    return ev;
  };

  // ---------- the deep-space probe ----------
  // mass m (kg); thrust (N) of each thruster; mu: friction as if it slid on a floor (0 in space).
  function Probe(o) { o = o || {}; this.m = o.m || 1000; this.F = o.F || 500; this.mu = o.mu || 0; this.x = o.x || 0; this.y = o.y || 0; this.vx = o.vx || 0; this.vy = o.vy || 0; this.t = 0; }
  // ux, uy: which way the thrusters push (−1, 0, 1 each). One step of h seconds.
  Probe.prototype.step = function (h, ux, uy) {
    var ax = this.F * (ux || 0) / this.m, ay = this.F * (uy || 0) / this.m, sp = Math.hypot(this.vx, this.vy);
    var vx = this.vx + ax * h, vy = this.vy + ay * h;
    if (this.mu > 0) {
      var sp1 = Math.hypot(vx, vy), dv = this.mu * G * h;
      if (sp1 <= dv) { vx = 0; vy = 0; } else { vx -= dv * vx / sp1; vy -= dv * vy / sp1; }
    }
    this.x += 0.5 * (this.vx + vx) * h; this.y += 0.5 * (this.vy + vy) * h; this.vx = vx; this.vy = vy; this.t += h;
    return sp;
  };
  Probe.prototype.speed = function () { return Math.hypot(this.vx, this.vy); };

  // ---------- inertia demos ----------
  // A dish on a cloth. The cloth is jerked to speed u (m/s) and pulled a distance pull (m). The dish starts a distance L
  // from the cloth's back edge. mu: dish on cloth, muT: dish on table (kinetic; static taken as at least as large).
  // Returns the dish's position x(t) and the cloth's, plus the result.
  function tablecloth(o) {
    var u = o.u, L = o.L, mu = o.mu, muT = o.muT, pull = o.pull, h = 1e-4, t = 0, xd = 0, vd = 0, xc = 0, onCloth = true, ridden = false, path = [];
    while (t < 10) {
      var vc = xc < pull ? u : 0;
      if (onCloth) {
        var rel = vc - vd, a;
        if (Math.abs(rel) < mu * G * h && vc > 0) { vd = vc; a = 0; ridden = true; }   // static friction: the dish rides along
        else a = rel > 0 ? mu * G : rel < 0 ? -mu * G : 0;
        vd += a * h; xd += vd * h; xc += vc * h;
        if (xc - xd >= L) onCloth = false;            // the cloth's back edge has passed under the dish
        if (vc === 0 && Math.abs(vd) < 1e-9) break;
      } else {
        xc += vc * h;
        if (vd > 0) { vd = Math.max(0, vd - muT * G * h); xd += vd * h; }
        if (vd === 0 && vc === 0) break;
      }
      t += h;
      if (path.length === 0 || t - path[path.length - 1][0] >= 0.005) path.push([t, xd, xc]);
    }
    path.push([t, xd, xc]);
    return { slid: xd, ridden: ridden, onCloth: onCloth, path: path, tEnd: t };
  }
  // A car braking hard from v0 (m/s) at a (m/s²) with a passenger who is or isn't belted. gap: room before the dashboard (m).
  // Unbelted, the passenger keeps going at v0 (no seat friction) until the gap closes. Returns the contact time and the
  // passenger's speed relative to the car at contact.
  function braking(v0, a, gap) {
    var tStop = v0 / a, tHit = Math.sqrt(2 * gap / a);
    if (tHit > tStop) {      // the car stops first; the passenger then slides the rest of the way at v0
      var rel = 0.5 * a * tStop * tStop;
      return { tStop: tStop, dStop: v0 * v0 / (2 * a), tHit: tStop + (gap - rel) / v0, vRel: v0 };
    }
    return { tStop: tStop, dStop: v0 * v0 / (2 * a), tHit: tHit, vRel: a * tHit };
  }
  // A ball dropped from height H in a train going at u: fall time and how far the train (and the ball) move meanwhile.
  function trainDrop(H, u) { var t = Math.sqrt(2 * H / G); return { t: t, dx: u * t }; }

  var api = { G: G, BETA: BETA, Track: Track, Ball: Ball, Probe: Probe, tablecloth: tablecloth, braking: braking, trainDrop: trainDrop };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NL1Phys = api;
})(this);
