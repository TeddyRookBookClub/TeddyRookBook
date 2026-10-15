/* Trebuchet Workshop physics. A counterweight trebuchet in a vertical plane, from Lagrange's equations.
   Generalized coordinates q = (θ, φ, ψ), all absolute angles from the +x axis (x toward the target, y up):
     θ  the beam's long arm (axle → sling end);  the short arm points the other way, −θ
     φ  the counterweight's hanger (hinge → counterweight's centre); with a fixed counterweight it is not used
     ψ  the sling (end of the long arm → stone)
   Axle at (0, H). The beam is a uniform rod of mass mb, length L1 + L2; the counterweight (M) and the stone (m) are point masses.
     T = ½ Ib θ̇² + ½ M |Ċ|² + ½ m |Ṙ|²,   V = g (mb y_beam + M y_C + m y_R)
   Phase 1: the stone slides in the trough (R_y fixed at the stone's radius), a constraint with a Lagrange multiplier λ, the
   normal force. When λ would turn negative, the stone lifts off. Phase 2: the stone swings freely in the sling. It is released
   when the sling's angle to the arm drops to the release angle. Phase 3: the stone flies, with optional air drag
   F = ½ ρ C_d A v². Integrators: classical RK4 with small fixed steps (swing 0.5 ms, flight 2 ms), checked against energy
   conservation and the exact vacuum range. SI units throughout: meters, kilograms, seconds, newtons, joules. */
(function (root) {
  'use strict';
  var G0 = 9.80665;          // standard gravity, m/s² (NIST)
  var RHO_AIR = 1.2;         // air at sea level and about 20 °C, kg/m³ (NASA Glenn atmosphere model gives 1.225 at 15 °C)
  var CD_SPHERE = 0.47;      // textbook value for a sphere below the drag crisis (NASA: 0.07 to 0.5, by Reynolds number)
  var RHO_STONE = 2700;      // granite, OpenStax College Physics, Table 11.1
  var D2R = Math.PI / 180;

  function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; }
  function radiusOf(m) { return Math.cbrt(3 * m / (4 * Math.PI * RHO_STONE)); }
  function dragK(m, drag) { if (!drag) return 0; var r = radiusOf(m); return 0.5 * RHO_AIR * CD_SPHERE * Math.PI * r * r / m; }

  /* A machine from the settings. o: {M counterweight kg, m stone kg, ratio long/short arm, sling m, rel release angle °,
     hinged bool, mb beam kg, Lb beam length m, H axle height m, L3 hanger m, drag bool, g, fric axle damping N·m·s} */
  function machine(o) {
    var k = {};
    k.M = o.M === undefined ? 1500 : o.M; k.m = o.m === undefined ? 15 : o.m;
    k.ratio = o.ratio || 4; k.Lb = o.Lb || 8; k.H = o.H || 4.6; k.L3 = o.L3 === undefined ? 1.2 : o.L3;
    k.L4 = o.sling || 5.5; k.mb = o.mb === undefined ? 150 : o.mb; k.hinged = o.hinged !== false;
    k.g = o.g === undefined ? G0 : o.g; k.fric = o.fric || 0; k.drag = o.drag !== false;
    k.rel = (o.rel === undefined ? 45 : o.rel) * D2R;
    k.L1 = k.Lb * k.ratio / (1 + k.ratio); k.L2 = k.Lb / (1 + k.ratio);
    if (!k.hinged) k.L3 = 0;
    k.d = (k.L1 - k.L2) / 2;                                   // beam's centre of mass, along the long arm
    k.Ib = k.mb * (Math.pow(k.L1, 3) + Math.pow(k.L2, 3)) / (3 * (k.L1 + k.L2)); // uniform rod about the axle
    k.rp = radiusOf(k.m); k.hTip = 0.6;                        // the cocked arm's tip stops 0.6 m above the ground
    var s = (k.H - k.hTip) / k.L1;
    k.th0 = s < 1 ? Math.PI + Math.asin(s) : 1.5 * Math.PI;   // long arm down and back, away from the target
    k.th0 = wrap(k.th0);
    k.ph0 = -Math.PI / 2;                                      // counterweight hanging straight down
    var tipY = k.H + k.L1 * Math.sin(k.th0), sy = (k.rp - tipY) / k.L4;
    k.ground0 = sy >= -1;                                      // the sling reaches the trough: the stone starts there
    k.ps0 = k.ground0 ? Math.asin(sy) : -Math.PI / 2;          // stone forward of the tip, in the trough under the frame
    k.yCmin = k.H - k.L2 - k.L3;                               // lowest the counterweight could ever go
    k.yC0 = k.H - k.L2 * Math.sin(k.th0) + k.L3 * Math.sin(k.ph0);
    k.stored = k.M * k.g * (k.yC0 - k.yCmin);                  // energy stored by winching the counterweight up
    return k;
  }

  // Positions of the parts for a state q
  function points(k, q) {
    var ct = Math.cos(q[0]), st = Math.sin(q[0]);
    var P = [k.L1 * ct, k.H + k.L1 * st], Q = [-k.L2 * ct, k.H - k.L2 * st];
    var C = [Q[0] + k.L3 * Math.cos(q[1]), Q[1] + k.L3 * Math.sin(q[1])];
    var R = [P[0] + k.L4 * Math.cos(q[2]), P[1] + k.L4 * Math.sin(q[2])];
    return { P: P, Q: Q, C: C, R: R };
  }
  function velocities(k, q, v) {
    var nt = [-Math.sin(q[0]), Math.cos(q[0])], np = [-Math.sin(q[1]), Math.cos(q[1])], ns = [-Math.sin(q[2]), Math.cos(q[2])];
    var Pd = [k.L1 * v[0] * nt[0], k.L1 * v[0] * nt[1]];
    var Cd = [-k.L2 * v[0] * nt[0] + k.L3 * v[1] * np[0], -k.L2 * v[0] * nt[1] + k.L3 * v[1] * np[1]];
    var Rd = [Pd[0] + k.L4 * v[2] * ns[0], Pd[1] + k.L4 * v[2] * ns[1]];
    return { P: Pd, C: Cd, R: Rd };
  }

  /* Energy, split into parts. stone: whether the stone is still in the sling. */
  function energy(k, q, v, stone) {
    var p = points(k, q), u = velocities(k, q, v), m = stone ? k.m : 0;
    var e = {};
    e.beamK = 0.5 * k.Ib * v[0] * v[0];
    e.cwK = 0.5 * k.M * (u.C[0] * u.C[0] + u.C[1] * u.C[1]);
    e.stoneK = 0.5 * m * (u.R[0] * u.R[0] + u.R[1] * u.R[1]);
    e.beamV = k.mb * k.g * (k.H + k.d * Math.sin(q[0]));
    e.cwV = k.M * k.g * p.C[1];
    e.stoneV = m * k.g * p.R[1];
    e.total = e.beamK + e.cwK + e.stoneK + e.beamV + e.cwV + e.stoneV;
    return e;
  }

  /* Accelerations. mode 0: stone held in the trough; 1: stone swinging in the sling; 2: no stone (after release).
     Returns [θ̈, φ̈, ψ̈, λ] where λ is the trough's push up on the stone (mode 0 only). */
  function accel(k, q, v, mode, out) {
    var m = mode === 2 ? 0 : k.m, g = k.g;
    var sTP = Math.sin(q[0] - q[1]), cTP = Math.cos(q[0] - q[1]), sTS = Math.sin(q[0] - q[2]), cTS = Math.cos(q[0] - q[2]);
    var a = k.M * k.L2 * k.L3, b = m * k.L1 * k.L4;
    var M11 = k.Ib + k.M * k.L2 * k.L2 + m * k.L1 * k.L1, M12 = -a * cTP, M13 = b * cTS;
    var M22 = k.M * k.L3 * k.L3, M33 = m * k.L4 * k.L4;
    var f1 = a * sTP * v[1] * v[1] - b * sTS * v[2] * v[2] - g * (k.mb * k.d - k.M * k.L2 + m * k.L1) * Math.cos(q[0]) - k.fric * v[0];
    var f2 = -a * sTP * v[0] * v[0] - g * k.M * k.L3 * Math.cos(q[1]);
    var f3 = b * sTS * v[0] * v[0] - g * m * k.L4 * Math.cos(q[2]);
    if (!k.hinged) { M12 = 0; M22 = 1; f2 = 0; }          // fixed counterweight: φ is not a coordinate
    if (mode === 2) { M13 = 0; M33 = 1; f3 = 0; f1 += (k.hingeDamp || 0) * (v[1] - v[0]); f2 -= (k.hingeDamp || 0) * (v[1] - v[0]); }
    // Solve the symmetric 3×3 system [M11 M12 M13; M12 M22 0; M13 0 M33] x = r by eliminating φ̈ and ψ̈ into θ̈
    var den = M11 - M12 * M12 / M22 - M13 * M13 / M33;
    out = out || [0, 0, 0, 0];
    var x1 = (f1 - M12 * f2 / M22 - M13 * f3 / M33) / den;
    out[0] = x1; out[1] = (f2 - M12 * x1) / M22; out[2] = (f3 - M13 * x1) / M33; out[3] = 0;
    if (mode === 0) {
      // constraint R_y = rp: J q̈ = γ with J = [L1 cos θ, 0, L4 cos ψ]; the same solve for w = M⁻¹ Jᵀ
      var J1 = k.L1 * Math.cos(q[0]), J3 = k.L4 * Math.cos(q[2]);
      var gam = k.L1 * Math.sin(q[0]) * v[0] * v[0] + k.L4 * Math.sin(q[2]) * v[2] * v[2];
      var w0 = (J1 - M13 * J3 / M33) / den, w1 = -M12 * w0 / M22, w2 = (J3 - M13 * w0) / M33;
      var lam = (gam - (J1 * out[0] + J3 * out[2])) / (J1 * w0 + J3 * w2);
      out[0] += lam * w0; out[1] += lam * w1; out[2] += lam * w2; out[3] = lam;
    }
    return out;
  }

  // One RK4 step of the machine. s = {q:[3], v:[3]}.
  function rk4(k, s, dt, mode) {
    var q = s.q, v = s.v, i, a1 = accel(k, q, v, mode), q2 = [], v2 = [], q3 = [], v3 = [], q4 = [], v4 = [];
    for (i = 0; i < 3; i++) { q2[i] = q[i] + 0.5 * dt * v[i]; v2[i] = v[i] + 0.5 * dt * a1[i]; }
    var a2 = accel(k, q2, v2, mode);
    for (i = 0; i < 3; i++) { q3[i] = q[i] + 0.5 * dt * v2[i]; v3[i] = v[i] + 0.5 * dt * a2[i]; }
    var a3 = accel(k, q3, v3, mode);
    for (i = 0; i < 3; i++) { q4[i] = q[i] + dt * v3[i]; v4[i] = v[i] + dt * a3[i]; }
    var a4 = accel(k, q4, v4, mode);
    for (i = 0; i < 3; i++) {
      q[i] += dt / 6 * (v[i] + 2 * v2[i] + 2 * v3[i] + v4[i]);
      v[i] += dt / 6 * (a1[i] + 2 * a2[i] + 2 * a3[i] + a4[i]);
    }
    return a1[3];
  }

  // Keep the stone exactly on the trough floor (removes the tiny drift of the constraint)
  function project(k, s) {
    var sy = (k.rp - k.H - k.L1 * Math.sin(s.q[0])) / k.L4;
    if (sy < -1 || sy > 1) return;
    var c = Math.cos(s.q[2]) >= 0 ? 1 : -1;
    s.q[2] = c > 0 ? Math.asin(sy) : Math.PI - Math.asin(sy);
    var J3 = k.L4 * Math.cos(s.q[2]);
    if (Math.abs(J3) > 1e-9) s.v[2] = -k.L1 * Math.cos(s.q[0]) * s.v[0] / J3;
  }

  // The sling's angle to the arm: 0 when the sling is in line with the arm, positive while the stone trails behind it.
  function slingAngle(q) { return wrap(q[2] - q[0]); }

  /* Swing the machine from rest with the stone in the sling, never releasing, until the sling angle passes minDeg or
     tMax. Records frames every rec seconds. Returns {frames, liftT, maxErr} where each frame is
     {t, q, v, ground, beta, E} */
  function swing(k, opt) {
    opt = opt || {};
    var dt = opt.dt || 5e-4, tMax = opt.tMax || 6, rec = opt.rec || 1e-3, minB = (opt.minDeg === undefined ? -40 : opt.minDeg) * D2R;
    var s = { q: [k.th0, k.ph0, k.ps0], v: [0, 0, 0] }, ground = k.ground0, t = 0, frames = [], liftT = ground ? null : 0;
    var E0 = energy(k, s.q, s.v, true).total, maxErr = 0, nextRec = 0, prevB = slingAngle(s.q), maxB = prevB, lam, stuck = 0;
    function push() {
      var e = energy(k, s.q, s.v, true);
      maxErr = Math.max(maxErr, Math.abs(e.total - E0));
      frames.push({ t: t, q: s.q.slice(), v: s.v.slice(), ground: ground, beta: slingAngle(s.q), E: e });
    }
    push();
    while (t < tMax) {
      if (ground) {
        lam = accel(k, s.q, s.v, 0)[3];
        if (lam <= 0) { ground = false; liftT = t; }
      }
      rk4(k, s, dt, ground ? 0 : 1); t += dt;
      if (s.q[0] > k.th0) { s.q[0] = k.th0; if (s.v[0] > 0) s.v[0] = 0; stuck += dt; } // the arm rests on its stop
      if (ground) project(k, s);
      else {
        var R = points(k, s.q).R;
        if (R[1] < k.rp && t - liftT > 0.002) {
          // the stone drops back to the trough: an inelastic bump that removes its downward speed
          var u = velocities(k, s.q, s.v).R;
          if (u[1] < 0) { ground = true; project(k, s); }
        }
      }
      var B = slingAngle(s.q);
      if (B > maxB) maxB = B;
      if (t >= nextRec - 1e-12) { push(); nextRec += rec; }
      if (!ground && B < minB && prevB >= minB) break;
      if (!ground && maxB - B > 1.5 * Math.PI) break;   // the sling has wrapped around: stop
      if (stuck > 0.3) break;                          // the counterweight can't lift the arm
      prevB = B;
    }
    push();
    // maxErr is only meaningful while nothing hit a stop
    return { frames: frames, liftT: liftT, maxErr: stuck > 0 ? NaN : maxErr, E0: E0, dt: dt, stuck: stuck > 0 };
  }

  // The exact state at the moment the sling angle first drops to rel (after lift-off): find the recorded frames on either
  // side, then bisect on the time step from the earlier one, integrating with RK4 each time. Returns a frame or null.
  function releaseFrame(k, sw, rel) {
    var f = sw.frames, i;
    for (i = 1; i < f.length; i++) {
      if (f[i].ground || f[i - 1].ground) continue;
      if (f[i - 1].beta > rel && f[i].beta <= rel && f[i - 1].beta - f[i].beta < Math.PI) {
        var a = f[i - 1], span = f[i].t - a.t, lo = 0, hi = span, s;
        var at = function (tau) {
          var st = { q: a.q.slice(), v: a.v.slice() }, n = Math.max(1, Math.ceil(tau / sw.dt - 1e-9));
          for (var j = 0; j < n; j++) rk4(k, st, tau / n, 1);
          return st;
        };
        for (var it = 0; it < 28; it++) {
          var mid = (lo + hi) / 2; s = at(mid);
          if (wrap(s.q[2] - s.q[0]) > rel) lo = mid; else hi = mid;
        }
        s = at((lo + hi) / 2);
        return { t: a.t + (lo + hi) / 2, q: s.q, v: s.v, beta: rel, index: i };
      }
    }
    return null;
  }

  /* Fly a stone from (x, y) at (vx, vy). opt: {k drag constant per meter, g, yLand, dt, rec}. Lands when y drops to yLand.
     Returns {path [[t,x,y]...], range (x at landing), peak, time, vImpact} */
  function fly(x, y, vx, vy, opt) {
    var kd = opt.k || 0, g = opt.g === undefined ? G0 : opt.g, yL = opt.yLand || 0, dt = opt.dt || 2e-3, rec = opt.rec || 1 / 60;
    var t = 0, path = [[0, x, y]], peak = y, nextRec = rec, s = [x, y, vx, vy];
    function f(s, o) { var sp = Math.sqrt(s[2] * s[2] + s[3] * s[3]); o[0] = s[2]; o[1] = s[3]; o[2] = -kd * sp * s[2]; o[3] = -g - kd * sp * s[3]; return o; }
    var k1 = [0, 0, 0, 0], k2 = [0, 0, 0, 0], k3 = [0, 0, 0, 0], k4 = [0, 0, 0, 0], tmp = [0, 0, 0, 0], prev = s.slice();
    for (var n = 0; n < 2e6; n++) {
      prev[0] = s[0]; prev[1] = s[1]; prev[2] = s[2]; prev[3] = s[3];
      f(s, k1); for (var i = 0; i < 4; i++) tmp[i] = s[i] + 0.5 * dt * k1[i];
      f(tmp, k2); for (i = 0; i < 4; i++) tmp[i] = s[i] + 0.5 * dt * k2[i];
      f(tmp, k3); for (i = 0; i < 4; i++) tmp[i] = s[i] + dt * k3[i];
      f(tmp, k4); for (i = 0; i < 4; i++) s[i] += dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
      t += dt;
      if (s[1] > peak) peak = s[1];
      if (s[1] <= yL && s[3] < 0) {
        // landing between the last two steps: a cubic Hermite fit in time for y, linear for x
        var a = hermiteRoot(prev[1], prev[3], s[1], s[3], dt, yL);
        var xl = prev[0] + (s[0] - prev[0]) * a, tl = t - dt + a * dt;
        var vxl = prev[2] + (s[2] - prev[2]) * a, vyl = prev[3] + (s[3] - prev[3]) * a;
        path.push([tl, xl, yL]);
        return { path: path, range: xl, peak: peak, time: tl, vImpact: Math.sqrt(vxl * vxl + vyl * vyl) };
      }
      if (t >= nextRec) { path.push([t, s[0], s[1]]); nextRec += rec; }
    }
    return { path: path, range: s[0], peak: peak, time: t, vImpact: 0 };
  }
  // fraction a in [0,1] of a step of length h where a cubic Hermite through (y0, v0) → (y1, v1) reaches yL
  function hermiteRoot(y0, v0, y1, v1, h, yL) {
    var lo = 0, hi = 1;
    for (var i = 0; i < 50; i++) {
      var a = (lo + hi) / 2, a2 = a * a, a3 = a2 * a;
      var y = (2 * a3 - 3 * a2 + 1) * y0 + (a3 - 2 * a2 + a) * h * v0 + (-2 * a3 + 3 * a2) * y1 + (a3 - a2) * h * v1;
      if (y > yL) lo = a; else hi = a;
    }
    return (lo + hi) / 2;
  }

  // Exact vacuum range from height h above the landing level: x = v cos θ (v sin θ + √(v² sin²θ + 2 g h)) / g
  function vacuumRange(v, ang, h, g) { g = g || G0; var s = Math.sin(ang), c = Math.cos(ang); return v * c * (v * s + Math.sqrt(v * v * s * s + 2 * g * h)) / g; }

  /* Whole shot: swing, release, flight. Returns a result with everything the page shows. */
  function shot(k, sw) {
    sw = sw || swing(k);
    var r = { k: k, sw: sw, released: false };
    var rf = releaseFrame(k, sw, k.rel);
    if (!rf) {
      // the sling never got that far: it slips off at the end of its swing (the smallest angle it reached)
      var best = null, f = sw.frames;
      for (var i = 1; i < f.length; i++) if (!f[i].ground && (!best || f[i].beta < best.beta)) best = f[i];
      if (!best) return r;
      rf = { t: best.t, q: best.q.slice(), v: best.v.slice(), beta: best.beta, index: f.indexOf(best), late: true };
    }
    r.released = true; r.rel = rf;
    var p = points(k, rf.q), u = velocities(k, rf.q, rf.v), e = energy(k, rf.q, rf.v, true);
    r.x0 = p.R[0]; r.y0 = p.R[1]; r.vx = u.R[0]; r.vy = u.R[1];
    r.speed = Math.sqrt(r.vx * r.vx + r.vy * r.vy); r.angle = Math.atan2(r.vy, r.vx);
    r.E = e; r.keStone = e.stoneK;
    r.drop = k.M * k.g * (k.yC0 - p.C[1]);                  // counterweight's drop so far, as energy
    r.eff = r.keStone / k.stored;                               // share of the stored energy that the stone carries away
    r.effDrop = r.keStone / r.drop;
    r.flight = fly(r.x0, r.y0, r.vx, r.vy, { k: dragK(k.m, k.drag), g: k.g, yLand: k.rp, rec: 1 / 120 });
    r.range = r.flight.range; r.peak = r.flight.peak - k.rp; r.time = r.flight.time;
    return r;
  }

  /* The range for every release angle from lo to hi degrees (one swing serves them all). */
  function releaseScan(k, sw, lo, hi, step) {
    var out = [], kd = dragK(k.m, k.drag);
    for (var a = lo; a <= hi + 1e-9; a += step) {
      var rf = releaseFrame(k, sw, a * D2R);
      if (!rf) { out.push([a, NaN]); continue; }
      var p = points(k, rf.q).R, u = velocities(k, rf.q, rf.v).R;
      out.push([a, fly(p[0], p[1], u[0], u[1], { k: kd, g: k.g, yLand: k.rp, dt: 4e-3 }).range]);
    }
    return out;
  }

  /* After release: the beam and counterweight swing on, with the sling flapping (no stone), damped so they settle. */
  function afterSwing(k, q, v, tMax, rec) {
    var kk = Object.create(k), I = k.Ib + k.M * k.L2 * k.L2;
    kk.fric = k.fric + 0.5 * I; kk.hingeDamp = 0.5 * k.M * k.L3 * k.L3;    // axle and hinge friction, so it settles
    var s = { q: q.slice(), v: v.slice() }, t = 0, dt = 1e-3, out = [{ t: 0, q: s.q.slice() }], next = rec;
    while (t < tMax) {
      rk4(kk, s, dt, 2); t += dt;
      var tipY = k.H + k.L1 * Math.sin(s.q[0]), cy = k.H - k.L2 * Math.sin(s.q[0]) + k.L3 * Math.sin(s.q[1]);
      var tipVy = k.L1 * Math.cos(s.q[0]) * s.v[0];
      if (tipY < 0.35 && tipVy < 0) s.v[0] *= -0.3;                       // the arm bumps the ground and bounces back a little
      if (s.q[0] > k.th0 && s.v[0] > 0) s.v[0] *= -0.3;                   // or its stop at the back
      if (cy < 0.5 && k.hinged) s.v[1] *= -0.3;
      if (t >= next) { out.push({ t: t, q: s.q.slice() }); next += rec; }
    }
    return out;
  }

  var api = { G0: G0, RHO_AIR: RHO_AIR, CD: CD_SPHERE, RHO_STONE: RHO_STONE, machine: machine, points: points, velocities: velocities,
    energy: energy, accel: accel, swing: swing, releaseFrame: releaseFrame, shot: shot, fly: fly, vacuumRange: vacuumRange,
    dragK: dragK, radiusOf: radiusOf, releaseScan: releaseScan, afterSwing: afterSwing, slingAngle: slingAngle, wrap: wrap };
  root.TrebPhys = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
