/* Predators and Prey: the model, kept apart from the drawing so it can be tested in node.
   window.EcoModel (module.exports in node):
     create(params, seed)   a field of grass, rabbits and foxes; .step() runs one day
     lv                     the Lotka–Volterra equations: deriv, rk4, period, invariant
     Peaks(rel, abs)        finds peaks and troughs in a noisy series as it arrives
   Units: time in days (a season is 90 days, a model year 360), lengths in grass cells (the field is 64 × 40),
   grass in "cells' worth" (a full cell holds 1), energy in days of food (an animal burns 1 a day). */
(function (root) {
  'use strict';
  var W = 64, H = 40, SEASON = 90, YEAR = 360, CELL = 4, GW = W / CELL, GH = H / CELL;
  // how fast grass grows in each season, relative to the year's average (spring, summer, autumn, winter)
  var SEASON_GROW = [1.3, 1.1, 0.9, 0.7];

  // a small, fast random number generator with a seed, so a run can be repeated exactly
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var DEFAULTS = {
    rabbits0: 150, foxes0: 12,
    grow: 0.045,         // share of the missing grass that grows back each day (times the season factor)
    rLitter: 4,          // young in a rabbit litter (on average); a well-fed rabbit can have a litter every month
    fLitter: 3,          // cubs in a fox litter (on average); a well-fed fox has at most one litter a year
    grassFood: 4,        // days of energy a rabbit gets from one full cell of grass
    rabbitFood: 10,      // days of energy a fox gets from one rabbit
    hunt: 0.4,           // chance that a fox's pounce catches the rabbit
    refuge: 0,           // share of the field's width behind the fence, where foxes can't go (0 to 0.4)
    seasons: false
  };
  // fixed traits of each species. emax: the most energy it can store (days); bite: most grass eaten a day (cells' worth);
  // mature: age when it can have young (days); young: energy a parent spends on each baby; kitE: a newborn's energy;
  // gap: least time between litters (days); chance: daily chance of a litter once it can have one; breed: share of emax needed;
  // life: range of natural life spans (days); speeds in cells a day; look, sight, reach, mateR: distances in cells;
  // full: a fox above this share of emax doesn't hunt
  var RAB = { emax: 12, bite: 0.5, mature: 90, young: 2, kitE: 6, gap: 30, chance: 0.1, breed: 0.5, life: [540, 1440], speed: 0.35, run: 1.0, leap: 1.5, look: 2.5, mateR: 6 };
  var FOX = { emax: 40, mature: 300, young: 6, kitE: 12, gap: 300, chance: 0.05, breed: 0.5, life: [720, 2160], speed: 0.8, chase: 1.2, sight: 3, reach: 1.2, full: 0.8, mateR: 12 };

  var WINTER = { days: 30, grow: 0.5, cost: 1.15 };

  function seasonFactor(day) {
    // linear between the middles of the seasons; the average over a year is 1
    var x = ((day % YEAR) + YEAR) % YEAR / SEASON - 0.5, i = Math.floor(x), f = x - i;
    var a = SEASON_GROW[(i + 4) % 4], b = SEASON_GROW[(i + 5) % 4];
    return a + (b - a) * f;
  }

  function create(params, seed) {
    var p = {}, k;
    for (k in DEFAULTS) p[k] = DEFAULTS[k];
    for (k in params || {}) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) p[k] = params[k];
    var m = {
      W: W, H: H, p: p, seed: seed >>> 0 || 1, day: 0,
      grass: new Float32Array(W * H), rabbits: [], foxes: [],
      winter: 0, nextId: 1, fx: [], tally: null, last: { cause: '' }
    };
    var rand;
    var bucketsR = [], bucketsF = [];
    for (var i = 0; i < GW * GH; i++) { bucketsR.push([]); bucketsF.push([]); }

    function newTally() { return { rBorn: 0, fBorn: 0, rEaten: 0, rStarved: 0, rOld: 0, rSick: 0, fStarved: 0, fOld: 0, grassEaten: 0 }; }
    function lifeSpan(sp) { return sp.life[0] + rand() * (sp.life[1] - sp.life[0]); }
    function animal(sp, x, y, age, e) {
      return { id: m.nextId++, x: x, y: y, px: x, py: y, a: rand() * 6.283, age: age, e: e, life: lifeSpan(sp), born: -1e9, dead: false, cause: '', hop: rand() };
    }
    m.addRabbit = function (x, y, age, e) {
      if (x === undefined) { x = rand() * W; y = rand() * H; }
      var r = animal(RAB, clamp(x, 0.2, W - 0.2), clamp(y, 0.2, H - 0.2), age === undefined ? RAB.mature + rand() * 200 : age, e === undefined ? RAB.emax * (0.5 + 0.4 * rand()) : e);
      m.rabbits.push(r); return r;
    };
    m.addFox = function (x, y, age, e) {
      var xr = fence() + 0.4;
      if (x === undefined) { x = xr + rand() * (W - xr); y = rand() * H; }
      var f = animal(FOX, clamp(Math.max(x, xr), 0.2, W - 0.2), clamp(y, 0.2, H - 0.2), age === undefined ? FOX.mature + rand() * 300 : age, e === undefined ? FOX.emax * (0.5 + 0.4 * rand()) : e);
      m.foxes.push(f); return f;
    };
    function fence() { return p.refuge * W; }
    m.fence = fence;

    m.reset = function (s) {
      if (s !== undefined) m.seed = s >>> 0 || 1;
      rand = rng(m.seed); m.rand = rand;
      m.day = 0; m.winter = 0; m.nextId = 1; m.fx = []; m.tally = newTally(); m.total = newTally();
      m.rabbits = []; m.foxes = [];
      for (var i = 0; i < W * H; i++) m.grass[i] = 0.55 + 0.45 * rand();
      // the first animals are grown up and had their last litter at some random time before the start
      for (i = 0; i < p.rabbits0; i++) m.addRabbit().born = -rand() * RAB.gap;
      for (i = 0; i < p.foxes0; i++) m.addFox().born = -rand() * FOX.gap;
      return m;
    };

    m.season = function () { return Math.floor((m.day % YEAR) / SEASON); };
    m.growFactor = function () { return p.seasons ? seasonFactor(m.day) : 1; };

    function grassAt(x, y) { var i = (y | 0) * W + (x | 0); return m.grass[i]; }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

    // move an animal one step along its heading, bouncing off the edges (and, for foxes, the fence)
    function move(o, speed, minX) {
      var nx = o.x + Math.cos(o.a) * speed, ny = o.y + Math.sin(o.a) * speed;
      var lo = Math.max(0.2, minX || 0);
      if (nx < lo) { nx = 2 * lo - nx; o.a = Math.PI - o.a; }
      if (nx > W - 0.2) { nx = 2 * (W - 0.2) - nx; o.a = Math.PI - o.a; }
      if (ny < 0.2) { ny = 0.4 - ny; o.a = -o.a; }
      if (ny > H - 0.2) { ny = 2 * (H - 0.2) - ny; o.a = -o.a; }
      o.x = clamp(nx, lo, W - 0.2); o.y = clamp(ny, 0.2, H - 0.2);
    }
    function bucket(x, y) { return clamp((y / CELL) | 0, 0, GH - 1) * GW + clamp((x / CELL) | 0, 0, GW - 1); }
    function fill(buckets, list) {
      for (var i = 0; i < buckets.length; i++) buckets[i].length = 0;
      for (i = 0; i < list.length; i++) if (!list[i].dead) buckets[bucket(list[i].x, list[i].y)].push(list[i]);
    }
    // the nearest living animal in the buckets within radius r of (x, y); skip those in the refuge if asked
    function nearest(buckets, x, y, r, skipRefuge) {
      var best = null, bd = r * r, xr = fence();
      var bx0 = clamp(((x - r) / CELL) | 0, 0, GW - 1), bx1 = clamp(((x + r) / CELL) | 0, 0, GW - 1);
      var by0 = clamp(((y - r) / CELL) | 0, 0, GH - 1), by1 = clamp(((y + r) / CELL) | 0, 0, GH - 1);
      for (var by = by0; by <= by1; by++) for (var bx = bx0; bx <= bx1; bx++) {
        var b = buckets[by * GW + bx];
        for (var i = 0; i < b.length; i++) {
          var o = b[i]; if (o.dead || (skipRefuge && o.x < xr)) continue;
          var dx = o.x - x, dy = o.y - y, d2 = dx * dx + dy * dy;
          if (d2 < bd) { bd = d2; best = o; }
        }
      }
      return best;
    }

    m.step = function () {
      var i, t = m.tally = newTally(), xr = fence(), fx = m.fx = [];
      m.day++;
      // grass
      var gr = p.grow * m.growFactor() * (m.winter > 0 ? WINTER.grow : 1), G = m.grass;
      if (gr > 0) for (i = 0; i < G.length; i++) G[i] += gr * (1 - G[i]);
      var cost = m.winter > 0 ? WINTER.cost : 1;
      if (m.winter > 0) m.winter--;
      // rabbits
      fill(bucketsR, m.rabbits); fill(bucketsF, m.foxes);
      var R = m.rabbits, nR = R.length;
      for (i = 0; i < nR; i++) {
        var r = R[i]; if (r.dead) continue;
        r.px = r.x; r.py = r.y; r.age++; r.e -= cost;
        var here = grassAt(r.x, r.y), sp;
        if (here < 0.3) {
          // short grass: look around for greener grass and hop toward it
          var bestA = r.a + (rand() - 0.5) * 1.2, bestG = -1;
          for (var j = 0; j < 6; j++) {
            var aa = r.a + j * 1.0472 + rand() * 0.5, gx = r.x + Math.cos(aa) * RAB.look, gy = r.y + Math.sin(aa) * RAB.look;
            if (gx < 0 || gy < 0 || gx >= W || gy >= H) continue;
            var gg = grassAt(gx, gy); if (gg > bestG) { bestG = gg; bestA = aa; }
          }
          r.a = bestA; sp = RAB.run;
        } else { r.a += (rand() - 0.5) * 1.2; sp = RAB.speed * (here > 0.6 ? 0.5 : 1); }
        move(r, sp, 0);
        // eat
        var gi = (r.y | 0) * W + (r.x | 0), want = Math.min(RAB.bite, (RAB.emax - r.e) / p.grassFood), got = Math.max(0, Math.min(G[gi], want));
        G[gi] -= got; r.e += got * p.grassFood; t.grassEaten += got;
        // have young
        if (r.age >= RAB.mature && r.e > RAB.emax * RAB.breed && m.day - r.born >= RAB.gap && rand() < RAB.chance && mate(bucketsR, r, RAB)) {
          var n = litter(p.rLitter); r.born = m.day;
          for (var c = 0; c < n && r.e > RAB.young + 2; c++) {
            r.e -= RAB.young;
            var kid = m.addRabbit(r.x + (rand() - 0.5), r.y + (rand() - 0.5), 0, RAB.kitE);
            kid.px = kid.x; kid.py = kid.y; t.rBorn++;
          }
          fx.push({ k: 'rb', x: r.x, y: r.y });
        }
        if (r.e <= 0) { r.dead = true; r.cause = 'starved'; t.rStarved++; m.last.cause = 'starved'; fx.push({ k: 'rs', x: r.x, y: r.y }); }
        else if (r.age > r.life) { r.dead = true; r.cause = 'old'; t.rOld++; m.last.cause = 'old'; }
      }
      // foxes
      fill(bucketsR, R);
      var F = m.foxes, nF = F.length;
      for (i = 0; i < nF; i++) {
        var o = F[i]; if (o.dead) continue;
        o.px = o.x; o.py = o.y; o.age++; o.e -= cost;
        var prey = o.e < FOX.emax * FOX.full ? nearest(bucketsR, o.x, o.y, FOX.sight, true) : null;
        if (prey) {
          var dx = prey.x - o.x, dy = prey.y - o.y, d = Math.sqrt(dx * dx + dy * dy);
          o.a = Math.atan2(dy, dx);
          if (d <= FOX.reach) {
            // pounce
            move(o, Math.max(0, d - 0.3), xr + 0.3);
            if (rand() < p.hunt) {
              prey.dead = true; prey.cause = 'eaten'; t.rEaten++; m.last.cause = 'eaten';
              o.e = Math.min(FOX.emax, o.e + p.rabbitFood);
              fx.push({ k: 'catch', x: prey.x, y: prey.y });
            } else {
              // the rabbit gets away with a leap
              prey.a = Math.atan2(prey.y - o.y, prey.x - o.x) + (rand() - 0.5) * 0.6; move(prey, RAB.leap, 0);
              fx.push({ k: 'miss', x: prey.x, y: prey.y });
            }
          } else move(o, Math.min(FOX.chase, d - 0.5 * FOX.reach), xr + 0.3);
        } else {
          o.a += (rand() - 0.5) * 0.9; move(o, FOX.speed, xr + 0.3);
        }
        if (o.age >= FOX.mature && o.e > FOX.emax * FOX.breed && m.day - o.born >= FOX.gap && (!p.seasons || m.season() === 0) && rand() < FOX.chance && mate(bucketsF, o, FOX)) {
          var nk = litter(p.fLitter); o.born = m.day;
          for (c = 0; c < nk && o.e > FOX.young + 2; c++) {
            o.e -= FOX.young;
            var cub = m.addFox(o.x + (rand() - 0.5), o.y + (rand() - 0.5), 0, FOX.kitE);
            cub.px = cub.x; cub.py = cub.y; t.fBorn++;
          }
          fx.push({ k: 'fb', x: o.x, y: o.y });
        }
        if (o.e <= 0) { o.dead = true; o.cause = 'starved'; t.fStarved++; fx.push({ k: 'fs', x: o.x, y: o.y }); }
        else if (o.age > o.life) { o.dead = true; o.cause = 'old'; t.fOld++; }
      }
      compact(m.rabbits); compact(m.foxes);
      for (k in t) m.total[k] += t[k];
      return m;
    };
    // another grown animal of the same kind close enough to be a mate
    function mate(buckets, me, sp) {
      var r = sp.mateR, bx0 = clamp(((me.x - r) / CELL) | 0, 0, GW - 1), bx1 = clamp(((me.x + r) / CELL) | 0, 0, GW - 1);
      var by0 = clamp(((me.y - r) / CELL) | 0, 0, GH - 1), by1 = clamp(((me.y + r) / CELL) | 0, 0, GH - 1);
      for (var by = by0; by <= by1; by++) for (var bx = bx0; bx <= bx1; bx++) {
        var b = buckets[by * GW + bx];
        for (var i = 0; i < b.length; i++) {
          var o = b[i]; if (o === me || o.dead || o.age < sp.mature) continue;
          var dx = o.x - me.x, dy = o.y - me.y; if (dx * dx + dy * dy <= r * r) return true;
        }
      }
      return false;
    }
    // a litter size near the average n: n − 1, n or n + 1 (never fewer than 1)
    function litter(n) { var u = rand(), k = Math.floor(n), f = n - k; k += u < f ? 1 : 0; var v = rand(); return Math.max(1, k + (v < 0.25 ? -1 : v > 0.75 ? 1 : 0)); }
    function compact(list) { var j = 0; for (var i = 0; i < list.length; i++) if (!list[i].dead) list[j++] = list[i]; list.length = j; }

    // move the fence; foxes caught on the rabbits' side are moved out
    m.setRefuge = function (v) {
      p.refuge = clamp(v, 0, 0.5); var xr = fence();
      for (var i = 0; i < m.foxes.length; i++) { var o = m.foxes[i]; if (o.x < xr + 0.3) { o.x = o.px = xr + 0.3 + rand() * 2; } }
    };
    m.grassMean = function () { var s = 0, G = m.grass; for (var i = 0; i < G.length; i++) s += G[i]; return s / G.length; };
    // a hard winter: for a while snow slows the grass, and the cold makes every animal burn more energy
    m.hardWinter = function () { m.winter = WINTER.days; };
    m.disease = function (share) {
      var n = 0; for (var i = 0; i < m.rabbits.length; i++) if (rand() < share) { m.rabbits[i].dead = true; m.rabbits[i].cause = 'sick'; n++; m.fx.push({ k: 'sick', x: m.rabbits[i].x, y: m.rabbits[i].y }); }
      compact(m.rabbits); m.total.rSick += n; return n;
    };
    m.reset(seed);
    return m;
  }

  // ---------- the Lotka–Volterra equations ----------
  // dR/dt = a R (1 − F/Fs),  dF/dt = d F (R/Rs − 1). The usual form, dR/dt = αR − βRF and dF/dt = δRF − γF,
  // is the same with α = a, β = a/Fs, γ = d, δ = d/Rs: Rs and Fs are the numbers where both stop changing.
  var lv = {
    deriv: function (R, F, q) { return [q.a * R * (1 - F / q.Fs), q.d * F * (R / q.Rs - 1)]; },
    rk4: function (s, q, h) {
      var k1 = lv.deriv(s[0], s[1], q), k2 = lv.deriv(s[0] + h / 2 * k1[0], s[1] + h / 2 * k1[1], q),
        k3 = lv.deriv(s[0] + h / 2 * k2[0], s[1] + h / 2 * k2[1], q), k4 = lv.deriv(s[0] + h * k3[0], s[1] + h * k3[1], q);
      return [s[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), s[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
    },
    // a quantity that stays exactly the same along every orbit of the equations
    invariant: function (R, F, q) { return q.d * (R / q.Rs - Math.log(R / q.Rs)) + q.a * (F / q.Fs - Math.log(F / q.Fs)); },
    // the time for one full loop from (R, F): follow the angle around the balance point (in log coordinates) until it turns once
    period: function (R, F, q, h) {
      h = h || Math.max(0.02, Math.min(1, lv.smallPeriod(q) / 2000));
      if (!(R > 0 && F > 0)) return NaN;
      var s = [R, F], ang = 0, prev = Math.atan2(Math.log(F / q.Fs), Math.log(R / q.Rs)), t = 0;
      if (Math.abs(Math.log(R / q.Rs)) < 1e-6 && Math.abs(Math.log(F / q.Fs)) < 1e-6) return 2 * Math.PI / Math.sqrt(q.a * q.d);
      while (t < 36000) {
        s = lv.rk4(s, q, h); t += h;
        var th = Math.atan2(Math.log(s[1] / q.Fs), Math.log(s[0] / q.Rs)), dth = th - prev;
        if (dth > Math.PI) dth -= 2 * Math.PI; else if (dth < -Math.PI) dth += 2 * Math.PI;
        prev = th; var na = ang + dth;
        if (Math.abs(na) >= 2 * Math.PI) return t - h * (Math.abs(na) - 2 * Math.PI) / Math.abs(dth);
        ang = na;
      }
      return NaN;
    },
    smallPeriod: function (q) { return 2 * Math.PI / Math.sqrt(q.a * q.d); }
  };

  // ---------- peaks ----------
  // A peak counts once the series has fallen below its highest point (since the last trough) by `rel` of that height and by at least `abs`;
  // a trough counts the same way on the way up. Each is reported when it is confirmed, with the time it happened (t).
  function Peaks(rel, abs) {
    var o = { peaks: [], troughs: [] };
    function thr(x) { return Math.max(abs, rel * x); }
    o.reset = function () { o.peaks = []; o.troughs = []; o.mode = 0; o.hi = -Infinity; o.hiT = 0; o.lo = Infinity; o.loT = 0; };
    o.push = function (t, v) {
      var ev = null;
      if (o.mode === 0) {
        if (v > o.hi) { o.hi = v; o.hiT = t; }
        if (v < o.lo) { o.lo = v; o.loT = t; }
        if (v <= o.hi - thr(o.hi)) { o.mode = -1; o.lo = v; o.loT = t; }
        else if (v >= o.lo + thr(v)) { o.mode = 1; o.hi = v; o.hiT = t; }
      } else if (o.mode === 1) {
        if (v > o.hi) { o.hi = v; o.hiT = t; }
        else if (v <= o.hi - thr(o.hi)) { ev = { kind: 'peak', t: o.hiT, v: o.hi, seen: t }; o.peaks.push(ev); o.mode = -1; o.lo = v; o.loT = t; }
      } else {
        if (v < o.lo) { o.lo = v; o.loT = t; }
        else if (v >= o.lo + thr(v)) { ev = { kind: 'trough', t: o.loT, v: o.lo, seen: t }; o.troughs.push(ev); o.mode = 1; o.hi = v; o.hiT = t; }
      }
      return ev;
    };
    o.reset();
    return o;
  }

  var api = { WINTER: WINTER, create: create, lv: lv, Peaks: Peaks, rng: rng, seasonFactor: seasonFactor, DEFAULTS: DEFAULTS, RAB: RAB, FOX: FOX, W: W, H: H, SEASON: SEASON, YEAR: YEAR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.EcoModel = api;
})(this);
