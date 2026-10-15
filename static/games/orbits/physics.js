/* Orbit Lab model: Newton's gravity for a light craft moving among heavy bodies.
   The bodies follow fixed paths (they stand still or go round circles at a steady rate);
   every body pulls on the craft, and the craft is too light to pull back.
   SI units throughout (metres, seconds, m³/s² for GM).
   Integrator: kick-drift-kick leapfrog (velocity Verlet). The step shrinks near each body:
   h = min over bodies of (ETA·√(r³/GM), ETAV·r/v_rel). Crossing a body's surface stops the craft there.
   Browser: window.OrbitPhys. Node: module.exports. */
(function (root) {
  'use strict';
  var TAU = 2 * Math.PI;

  /* Constants and their sources (also listed on the page):
     GM Earth: IERS Conventions 2010 (NASA Earth fact sheet: 0.39860e6 km³/s²); Earth mean radius 6371.0 km: NASA Earth fact sheet.
     GM Moon 4902.800118 km³/s²: JPL astrodynamic parameters; Moon mean radius 1737.4 km, mean distance 384,400 km: NASA Moon fact sheet.
     GM Sun 1.32712440018e20 m³/s² (JPL), AU 149,597,870.7 km (IAU 2012, JPL), Sun radius 695,700 km (NASA Sun fact sheet).
     Planet GM: JPL astrodynamic parameters; mean radius and orbit size: NASA planetary fact sheets.
     Sidereal day 86,164.0905 s: JPL astrodynamic parameters. */
  var K = {
    GM_EARTH: 3.986004418e14, R_EARTH: 6.371e6,
    GM_MOON: 4.902800118e12, R_MOON: 1.7374e6, D_MOON: 3.844e8,
    GM_SUN: 1.32712440018e20, R_SUN: 6.957e8, AU: 1.495978707e11,
    SIDEREAL_DAY: 86164.0905,
    PLANETS: {
      mercury: { name: 'Mercury', gm: 2.2031868551e13, r: 2.4397e6, a: 5.7909e10 },
      venus: { name: 'Venus', gm: 3.24858592e14, r: 6.0518e6, a: 1.0821e11 },
      earth: { name: 'Earth', gm: 3.986004418e14, r: 6.371e6, a: 1.49598e11 },
      mars: { name: 'Mars', gm: 4.2828375816e13, r: 3.3895e6, a: 2.27956e11 }
    }
  };
  var ETA = 0.005, ETAV = 0.02, MAXSUB = 60000;

  /* A body: fixed at (x, y), or going round (x, y) on a circle of radius R at angular rate w, starting at angle ph. */
  function body(o) {
    return { name: o.name, gm: o.gm, r: o.r, x: o.x || 0, y: o.y || 0, R: o.R || 0, w: o.w || 0, ph: o.ph || 0 };
  }
  function posAt(b, t, out) {
    if (!b.R) { out[0] = b.x; out[1] = b.y; return out; }
    var a = b.w * t + b.ph; out[0] = b.x + b.R * Math.cos(a); out[1] = b.y + b.R * Math.sin(a); return out;
  }
  function velAt(b, t, out) {
    if (!b.R) { out[0] = 0; out[1] = 0; return out; }
    var a = b.w * t + b.ph, s = b.R * b.w; out[0] = -s * Math.sin(a); out[1] = s * Math.cos(a); return out;
  }

  var P = [0, 0], V = [0, 0], P2 = [0, 0];
  /* Gravity at (x, y) at time t, plus the step size suggested there and the shortest free-fall time scale. */
  function field(sys, x, y, vx, vy, t, F) {
    var bs = sys.bodies, ax = 0, ay = 0, h = Infinity, tau = Infinity, eta = sys.eta || ETA, etav = sys.etav || ETAV;
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i]; posAt(b, t, P); velAt(b, t, V);
      var dx = P[0] - x, dy = P[1] - y, r2 = dx * dx + dy * dy, r = Math.sqrt(r2), f = b.gm / (r2 * r);
      ax += f * dx; ay += f * dy;
      var ts = Math.sqrt(r2 * r / b.gm); if (ts < tau) tau = ts;
      var ux = vx - V[0], uy = vy - V[1], u = Math.sqrt(ux * ux + uy * uy) + 1e-9;
      var hi = Math.min(eta * ts, etav * r / u); if (hi < h) h = hi;
    }
    if (sys.hmax && h > sys.hmax) h = sys.hmax;
    F.ax = ax; F.ay = ay; F.h = h; F.tau = tau; return F;
  }
  function timescale(sys, x, y, t) { return field(sys, x, y, 0, 0, t, {}).tau; }

  /* A craft's state. */
  function state(x, y, vx, vy, t) { return { x: x, y: y, vx: vx, vy: vy, t: t || 0, hit: -1, hx: 0, hy: 0, hitT: 0, hitV: 0, area: 0, ang: 0, n: 0 }; }
  function copy(s) { var o = {}; for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k) && k !== '_f') o[k] = s[k]; return o; }

  /* Advance state s by T seconds (T < 0 runs time backwards). onSub(s, x0, y0, t0) is called after every sub-step.
     sys.ref: index of the body about which the swept area (s.area, m²) and turned angle (s.ang, rad) are counted.
     Returns the number of sub-steps. */
  var F0 = {};
  function step(sys, s, T, onSub) {
    var bs = sys.bodies, i;
    if (s.hit >= 0) { s.t += T; posAt(bs[s.hit], s.t, P); velAt(bs[s.hit], s.t, V); s.x = P[0] + s.hx; s.y = P[1] + s.hy; s.vx = V[0]; s.vy = V[1]; return 0; }
    var sign = T < 0 ? -1 : 1, left = Math.abs(T), n = 0, F = F0, ref = sys.ref >= 0 ? bs[sys.ref] : null;
    field(sys, s.x, s.y, s.vx, s.vy, s.t, F);
    while (left > 0 && n < MAXSUB) {
      /* Time-symmetric step size: take a trial step with the size wanted here, then redo it with the mean of the
         sizes wanted at its start and end. A step chosen this way is the same run forwards or backwards, which
         keeps the energy from creeping over many orbits. */
      var x0 = s.x, y0 = s.y, vx0 = s.vx, vy0 = s.vy, t0 = s.t, ax0 = F.ax, ay0 = F.ay, ha = F.h, h = ha, dt, it;
      for (it = 0; it < 2; it++) {
        if (h >= left * 0.999999) h = left;
        dt = sign * h;
        s.vx = vx0 + 0.5 * dt * ax0; s.vy = vy0 + 0.5 * dt * ay0;
        s.x = x0 + dt * s.vx; s.y = y0 + dt * s.vy; s.t = t0 + dt;
        field(sys, s.x, s.y, s.vx, s.vy, s.t, F);
        s.vx += 0.5 * dt * F.ax; s.vy += 0.5 * dt * F.ay;
        var hs = 0.5 * (ha + F.h);
        if (it === 1 || Math.abs(hs - h) < 1e-3 * h || (h === left && hs >= left)) break;
        h = hs;
      }
      left -= h; n++;
      if (ref) {
        posAt(ref, t0, P2); var r0x = x0 - P2[0], r0y = y0 - P2[1];
        posAt(ref, s.t, P2); var r1x = s.x - P2[0], r1y = s.y - P2[1];
        var cr = r0x * r1y - r0y * r1x; s.area += 0.5 * cr; s.ang += Math.atan2(cr, r0x * r1x + r0y * r1y);
      }
      if (!sys.noHit) {
        for (i = 0; i < bs.length; i++) {
          var b = bs[i]; posAt(b, s.t, P);
          var qx = s.x - P[0], qy = s.y - P[1];
          if (qx * qx + qy * qy < b.r * b.r) { hitBody(sys, s, i, x0, y0, t0, dt); break; }
        }
      }
      if (onSub) onSub(s, x0, y0, t0);
      if (s.hit >= 0) { s.t += sign * left; posAt(bs[s.hit], s.t, P); s.x = P[0] + s.hx; s.y = P[1] + s.hy; return n; }
    }
    s.n += n;
    return n;
  }
  /* The craft crossed body i's surface during the last sub-step: find where, and stick it there. */
  function hitBody(sys, s, i, x0, y0, t0, dt) {
    var b = sys.bodies[i], A = [0, 0], B = [0, 0];
    posAt(b, t0, A); posAt(b, s.t, B); velAt(b, s.t, V);
    var q0x = x0 - A[0], q0y = y0 - A[1], dx = (s.x - B[0]) - q0x, dy = (s.y - B[1]) - q0y;
    var a = dx * dx + dy * dy, bb = 2 * (q0x * dx + q0y * dy), c = q0x * q0x + q0y * q0y - b.r * b.r, u = 0;
    if (c > 0 && a > 0) { var disc = bb * bb - 4 * a * c; u = disc > 0 ? (-bb - Math.sqrt(disc)) / (2 * a) : 1; u = Math.max(0, Math.min(1, u)); }
    var qx = q0x + u * dx, qy = q0y + u * dy, q = Math.sqrt(qx * qx + qy * qy) || 1;
    s.hit = i; s.hx = qx / q * b.r; s.hy = qy / q * b.r; s.hitT = t0 + u * dt;
    var ux = s.vx - V[0], uy = s.vy - V[1]; s.hitV = Math.sqrt(ux * ux + uy * uy);
    s.x = B[0] + s.hx; s.y = B[1] + s.hy; s.vx = V[0]; s.vy = V[1];
  }

  /* Orbit (conic) of a craft at relative position (rx, ry) and velocity (vx, vy) around a body with this GM. */
  function elements(gm, rx, ry, vx, vy) {
    var r = Math.sqrt(rx * rx + ry * ry), v2 = vx * vx + vy * vy, rv = rx * vx + ry * vy, h = rx * vy - ry * vx;
    var en = 0.5 * v2 - gm / r, k = v2 - gm / r;
    var ex = (k * rx - rv * vx) / gm, ey = (k * ry - rv * vy) / gm, e = Math.sqrt(ex * ex + ey * ey);
    var p = h * h / gm, a = en < 0 ? -gm / (2 * en) : (en > 0 ? -gm / (2 * en) : Infinity);
    var rp = p / (1 + e), ra = e < 1 ? p / (1 - e) : Infinity;
    var T = en < 0 ? TAU * Math.sqrt(a * a * a / gm) : Infinity;
    var w = e > 1e-9 ? Math.atan2(ey, ex) : Math.atan2(ry, rx);
    var nu = Math.atan2(ry, rx) - w;
    return { r: r, v: Math.sqrt(v2), energy: en, h: h, e: e, p: p, a: a, rp: rp, ra: ra, T: T, w: w, nu: nu, bound: en < 0 };
  }
  function circularSpeed(gm, r) { return Math.sqrt(gm / r); }
  function escapeSpeed(gm, r) { return Math.sqrt(2 * gm / r); }
  function period(gm, a) { return TAU * Math.sqrt(a * a * a / gm); }
  function radiusForPeriod(gm, T) { return Math.cbrt(gm * T * T / (TAU * TAU)); }

  /* Scenes' bodies. */
  function earthOnly() { return { bodies: [body({ name: 'Earth', gm: K.GM_EARTH, r: K.R_EARTH })], ref: 0 }; }
  /* Earth and Moon on circles round their common centre of mass (at the origin). The Moon starts at angle ph. */
  function earthMoon(ph) {
    var gE = K.GM_EARTH, gM = K.GM_MOON, D = K.D_MOON, mu = gM / (gE + gM), w = Math.sqrt((gE + gM) / (D * D * D));
    return {
      bodies: [body({ name: 'Earth', gm: gE, r: K.R_EARTH, R: mu * D, w: w, ph: ph + Math.PI }),
        body({ name: 'Moon', gm: gM, r: K.R_MOON, R: (1 - mu) * D, w: w, ph: ph })],
      ref: 0, w: w, mu: mu
    };
  }
  /* Sun fixed at the origin; planets on circles (angle ph[name] at t = 0) in the same plane. */
  function inner(ph) {
    var bs = [body({ name: 'Sun', gm: K.GM_SUN, r: K.R_SUN })];
    ['mercury', 'venus', 'earth', 'mars'].forEach(function (k) {
      var p = K.PLANETS[k];
      bs.push(body({ name: p.name, gm: p.gm, r: p.r, R: p.a, w: Math.sqrt(K.GM_SUN / (p.a * p.a * p.a)), ph: (ph && ph[k]) || 0 }));
      bs[bs.length - 1].key = k;
    });
    return { bodies: bs, ref: 0, hmax: 2000 };
  }
  /* Sphere of influence of a planet of this GM on an orbit of radius a round a star of GM gs. */
  function soi(gm, a, gs) { return a * Math.pow(gm / gs, 0.4); }

  /* A flyby: the state at closest approach (time tca) that passes body bi at distance rp with approach speed vinf,
     coming in from outside its orbit heading straight for the Sun. side +1 passes behind the planet, −1 in front. */
  function flybyState(sys, bi, tca, rp, vinf, side) {
    var b = sys.bodies[bi], Pp = posAt(b, tca, [0, 0]), Vp = velAt(b, tca, [0, 0]);
    var rr = Math.sqrt(Pp[0] * Pp[0] + Pp[1] * Pp[1]), ix = -Pp[0] / rr, iy = -Pp[1] / rr;
    var d = 2 * Math.asin(1 / (1 + rp * vinf * vinf / b.gm)), th = -side * d;
    var ox = ix * Math.cos(th) - iy * Math.sin(th), oy = ix * Math.sin(th) + iy * Math.cos(th);
    var px = ix + ox, py = iy + oy, pn = Math.sqrt(px * px + py * py); px /= pn; py /= pn;
    var g = side * Math.PI / 2, nx = px * Math.cos(g) - py * Math.sin(g), ny = px * Math.sin(g) + py * Math.cos(g);
    var vp = Math.sqrt(vinf * vinf + 2 * b.gm / rp);
    return { s: state(Pp[0] + rp * nx, Pp[1] + rp * ny, Vp[0] + vp * px, Vp[1] + vp * py, tca), turn: d };
  }

  var api = { K: K, TAU: TAU, ETA: ETA, body: body, posAt: posAt, velAt: velAt, field: field, timescale: timescale, state: state, copy: copy, step: step,
    elements: elements, circularSpeed: circularSpeed, escapeSpeed: escapeSpeed, period: period, radiusForPeriod: radiusForPeriod,
    earthOnly: earthOnly, earthMoon: earthMoon, inner: inner, soi: soi, flybyState: flybyState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.OrbitPhys = api;
})(typeof window !== 'undefined' ? window : this);
