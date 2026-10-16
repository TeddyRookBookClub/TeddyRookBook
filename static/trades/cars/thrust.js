/* Cars course, Lesson 12 (Thrusters and Fans): a cold-gas thruster simulator for the 2026 Roadster.
   Tesla has not published tank pressure, nozzle size, thrust or the car's weight, so those are sliders with assumed defaults.
   Model (ideal gas, gamma = 1.4 for air and nitrogen):
   - Tank: adiabatic (isentropic) blowdown, no heat from the walls: T = T0 (rho/rho0)^(gamma-1), p = rho R T
     (OpenStax University Physics 2, 3.6: T V^(gamma-1) = constant).
   - Each nozzle, while choked (p/pa >= ((gamma+1)/2)^(gamma/(gamma-1)) = 1.893):
     mdot = A* p sqrt(gamma/(R T)) (2/(gamma+1))^((gamma+1)/(2(gamma-1)))   (NASA Glenn, "Mass Flow Choking").
     Bell nozzle: ideally expanded to outside pressure: ve = sqrt(2 gamma R T/(gamma-1) (1 - (pa/p)^((gamma-1)/gamma))), pe = pa.
     Plain hole: sonic exit: T* = 2T/(gamma+1), ve = sqrt(gamma R T*), pe = p (2/(gamma+1))^(gamma/(gamma-1)), Ae = A*.
     Below the choking ratio the flow is subsonic and leaves the throat at outside pressure.
   - Thrust F = mdot ve + (pe - pa) Ae   (NASA Glenn, "Rocket Thrust Equations").
   - Car: tires push (or brake) at their grip limit mu m g the whole time, plus thrust; mass = car + gas left.
     Air drag and rolling resistance are left out. Hop: on the ground until thrust beats weight, then free flight.
   The model runs in node too (module.exports) for the tests in /tmp/work_roadster/test_models.js. */
(function (W) {
  'use strict';
  var PA = 101325, G0 = 9.80665, MPH = 0.44704, T20 = 293.15, V60 = 60 * MPH;
  var GAS = { air: { R: 287.05, g: 1.4, name: 'Air' }, n2: { R: 296.80, g: 1.4, name: 'Nitrogen' } };

  function chokeConst(g) { return Math.sqrt(g) * Math.pow(2 / (g + 1), (g + 1) / (2 * (g - 1))); }
  function critRatio(g) { return Math.pow((g + 1) / 2, g / (g - 1)); }

  function nozzle(p, T, gas, A, kind) {
    var g = gas.g, R = gas.R, out = { mdot: 0, ve: 0, F: 0, pe: PA, Te: T, choked: false };
    if (!(p > PA) || !(A > 0)) return out;
    var r = PA / p, k = (g - 1) / g;
    if (p / PA >= critRatio(g)) {
      out.choked = true;
      out.mdot = chokeConst(g) * A * p / Math.sqrt(R * T);
      if (kind === 'hole') {
        out.Te = 2 * T / (g + 1);
        out.ve = Math.sqrt(g * R * out.Te);
        out.pe = p * Math.pow(2 / (g + 1), g / (g - 1));
        out.F = out.mdot * out.ve + (out.pe - PA) * A;
        return out;
      }
    }
    out.Te = T * Math.pow(r, k);
    out.ve = Math.sqrt(2 * g / (g - 1) * R * T * (1 - Math.pow(r, k)));
    if (!out.choked) out.mdot = A * (PA / (R * out.Te)) * out.ve;
    out.F = out.mdot * out.ve;
    return out;
  }

  // o: {V m3, p0 Pa, T0 K, gas 'air'|'n2', n, d m, mCar kg, mode 'boost'|'brake'|'hop', mu, kind 'bell'|'hole', tOpen s, v0 m/s, dt s}
  function simulate(o) {
    var gas = GAS[o.gas] || GAS.air, g = gas.g, R = gas.R, T0 = o.T0 || T20;
    var A = Math.PI * o.d * o.d / 4, rho0 = o.p0 / (R * T0), m0 = rho0 * o.V, mu = o.mu, mode = o.mode;
    function tank(m) { var rho = m / o.V, T = T0 * Math.pow(rho / rho0, g - 1); return { p: rho * R * T, T: T }; }
    var dt = o.dt || 0.001, t = 0, m = m0, open = o.tOpen > 0, emptied = false;
    var v = mode === 'brake' ? (o.v0 != null ? o.v0 : V60) : 0, x = 0, y = 0, air = false;
    var J = 0, dv = 0, burn = 0, t60 = null, tStop = null, xStop = null, peak = 0, tUp = null, tLand = null;
    var s0 = tank(m0), n0 = nozzle(s0.p, s0.T, gas, A, o.kind), mt0 = o.mCar + m0, F0 = o.n * n0.F;
    var S = { t: [], p: [], T: [], F: [], a: [], v: [], x: [], y: [], md: [] };
    var every = Math.max(1, Math.round(0.005 / dt)), step = 0, done = false, F = 0, md = 0, a = 0;
    function rec() {
      var s = tank(m);
      S.t.push(t); S.p.push(s.p); S.T.push(s.T); S.F.push(F); S.a.push(a); S.v.push(v); S.x.push(x); S.y.push(y); S.md.push(md);
    }
    // first sample shows the opening state
    F = open ? F0 : 0; md = open ? o.n * n0.mdot : 0;
    a = mode === 'hop' ? Math.max(0, F / mt0 - G0) / G0 : (F / mt0 + mu * G0) / G0;
    rec();
    while (!done && t < 60) {
      if (open && t >= o.tOpen - 1e-12) open = false;
      F = 0; md = 0;
      if (open) {
        var s1 = tank(m), z1 = nozzle(s1.p, s1.T, gas, A, o.kind);
        if (z1.F <= 0 || z1.mdot <= 0) { open = false; emptied = true; }
        else {
          var s2 = tank(Math.max(1e-9, m - o.n * z1.mdot * dt / 2)), z2 = nozzle(s2.p, s2.T, gas, A, o.kind);
          F = o.n * z2.F; md = o.n * z2.mdot;
          if (z2.F <= 0) { F = o.n * z1.F / 2; md = o.n * z1.mdot / 2; }
        }
      }
      var mt = o.mCar + m - md * dt / 2;
      if (mode === 'boost') {
        a = F / mt + mu * G0;
        var vb = v; v += a * dt; x += (vb + v) / 2 * dt;
        if (t60 === null && v >= V60) t60 = t + dt * (V60 - vb) / (v - vb);
      } else if (mode === 'brake') {
        a = F / mt + mu * G0;
        var vb2 = v; v -= a * dt;
        if (v <= 0) { var f = vb2 / (vb2 - v); x += vb2 / 2 * dt * f; tStop = t + dt * f; xStop = x; v = 0; open = false; }
        else x += (vb2 + v) / 2 * dt;
      } else {
        var wt = mt * G0;
        if (!air && F > wt) { air = true; tUp = t; }
        if (air) {
          a = F / mt - G0;
          var vy = v; v += a * dt; y += (vy + v) / 2 * dt;
          if (y > peak) peak = y;
          if (y <= 0 && v < 0) { y = 0; tLand = t + dt; v = 0; air = false; done = true; }
        } else a = 0;
      }
      if (F > 0) { J += F * dt; dv += F / mt * dt; burn += dt; }
      m -= md * dt;
      t += dt; step++;
      if (mode === 'boost' && !open && t60 !== null) done = true;
      if (mode === 'brake' && tStop !== null) done = true;
      if (mode === 'hop' && !open && !air && tLand === null && t > 0) done = true;
      if (mode === 'boost' && !open && t60 === null && t > 30) done = true;
      a = mode === 'hop' ? (air ? a / G0 : 0) : a / G0;
      if (done || step % every === 0) rec();
    }
    var se = tank(m);
    return {
      S: S, gas: gas, A: A, m0: m0, mt0: mt0, F0: F0, md0: o.n * n0.mdot, ve0: n0.ve, Te0: n0.Te, pe0: n0.pe, choked0: n0.choked,
      rTire: mu > 0 ? F0 / (mu * mt0 * G0) : Infinity, rW: F0 / (mt0 * G0), burn: burn, emptied: emptied, J: J, dv: dv,
      mUsed: m0 - m, pEnd: se.p, TEnd: se.T, tEnd: t, t60: t60, t60Tires: mu > 0 ? V60 / (mu * G0) : Infinity,
      tStop: tStop, xStop: xStop, xStopTires: mu > 0 ? Math.pow(o.v0 != null ? o.v0 : V60, 2) / (2 * mu * G0) : Infinity,
      tStopTires: mu > 0 ? (o.v0 != null ? o.v0 : V60) / (mu * G0) : Infinity,
      peak: peak, tUp: tUp, tLand: tLand, vEnd: v,
      E: o.p0 * o.V * Math.log(o.p0 / PA) - (o.p0 - PA) * o.V
    };
  }

  var M = { PA: PA, G0: G0, MPH: MPH, T20: T20, GAS: GAS, chokeConst: chokeConst, critRatio: critRatio, nozzle: nozzle, simulate: simulate };
  if (typeof module === 'object' && module.exports) { module.exports = M; return; }
  W.TRRoadster = W.TRRoadster || {};
  W.TRRoadster.model = M;

  // ---------- dark plot panels (shared with fans.js) ----------
  var D = W.document, NS = 'http://www.w3.org/2000/svg';
  function sv(tag, at, par) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
  function niceStep(span) { var p = Math.pow(10, Math.floor(Math.log10(span || 1))), f = span / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
  function trimNum(v) { if (Math.abs(v) < 1e-9) v = 0; var s = Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(Math.abs(v) < 1 && v !== 0 ? 2 : 1); return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1').replace(/^-/, '\u2212'); }
  // Plot(parent, {title, xlab, ylab, label}) → {draw(xs, series[], opts), cursor(x)}
  function Plot(parent, o) {
    var fig = D.createElement('figure'); fig.className = 'rd-plot'; parent.appendChild(fig);
    var cap = D.createElement('figcaption'); cap.innerHTML = o.title + (o.ylab ? ' <span class="rd-unit">(' + o.ylab + ')</span>' : ''); fig.appendChild(cap);
    var Wd = 320, Ht = 168, L = 46, Rm = 10, T = 10, B = 28;
    var svg = sv('svg', { viewBox: '0 0 ' + Wd + ' ' + Ht, role: 'img', 'aria-label': o.label || o.title.replace(/<[^>]+>/g, '') }, fig);
    var gGrid = sv('g', null, svg), gRef = sv('g', null, svg), gLine = sv('g', null, svg);
    var cur = sv('line', { class: 'rd-cur', y1: T, y2: Ht - B, x1: -10, x2: -10 }, svg);
    var dots = [], sx = null, xmax = 1;
    sv('text', { class: 'rd-ax', x: Wd - Rm, y: Ht - 4, 'text-anchor': 'end' }, svg).textContent = o.xlab || 'time (s)';
    function draw(xs, series, opt) {
      opt = opt || {};
      gGrid.textContent = ''; gRef.textContent = ''; gLine.textContent = '';
      xmax = opt.xmax || xs[xs.length - 1] || 1;
      var lo = opt.ymin != null ? opt.ymin : Infinity, hi = opt.ymax != null ? opt.ymax : -Infinity;
      series.forEach(function (s) { s.y.forEach(function (v) { if (opt.ymin == null && v < lo) lo = v; if (opt.ymax == null && v > hi) hi = v; }); });
      (opt.refs || []).forEach(function (r) { if (opt.ymax == null && r.y > hi && r.y < (opt.refCap || Infinity)) hi = r.y; });
      if (!isFinite(lo)) lo = 0; if (!isFinite(hi)) hi = 1;
      if (opt.zero !== false) lo = Math.min(0, lo);
      if (hi - lo < 1e-9) hi = lo + 1;
      var st = niceStep((hi - lo) / 4); lo = Math.floor(lo / st + 1e-9) * st; hi = Math.ceil(hi / st - 1e-9) * st;
      var xst = niceStep(xmax / 4);
      sx = function (v) { return L + (Wd - L - Rm) * v / xmax; };
      var sy = function (v) { return T + (Ht - T - B) * (1 - (v - lo) / (hi - lo)); };
      for (var yv = lo; yv <= hi + st / 2; yv += st) {
        sv('line', { class: 'rd-grid', x1: L, x2: Wd - Rm, y1: sy(yv), y2: sy(yv) }, gGrid);
        sv('text', { class: 'rd-ax', x: L - 5, y: sy(yv) + 3.5, 'text-anchor': 'end' }, gGrid).textContent = trimNum(yv);
      }
      for (var xv = 0; xv <= xmax + 1e-9; xv += xst) {
        sv('line', { class: 'rd-grid', y1: T, y2: Ht - B, x1: sx(xv), x2: sx(xv) }, gGrid);
        sv('text', { class: 'rd-ax', x: sx(xv), y: Ht - B + 12, 'text-anchor': 'middle' }, gGrid).textContent = trimNum(xv);
      }
      (opt.refs || []).forEach(function (r) {
        if (r.y < lo || r.y > hi) return;
        sv('line', { class: 'rd-ref ' + (r.cls || ''), x1: L, x2: Wd - Rm, y1: sy(r.y), y2: sy(r.y) }, gRef);
        sv('text', { class: 'rd-reft ' + (r.cls || ''), x: opt.refRight ? Wd - Rm - 3 : L + 5, y: sy(r.y) - 4, 'text-anchor': opt.refRight ? 'end' : 'start' }, gRef).textContent = r.label;
      });
      dots = [];
      series.forEach(function (s) {
        var d = '';
        for (var i = 0; i < xs.length; i++) d += (i ? 'L' : 'M') + sx(Math.min(xs[i], xmax)).toFixed(1) + ',' + sy(s.y[i]).toFixed(1);
        sv('path', { class: 'rd-line ' + (s.cls || ''), d: d }, gLine);
        dots.push({ el: sv('circle', { class: 'rd-dot ' + (s.cls || ''), r: 3.6, cx: -10, cy: -10 }, gLine), y: s.y, sy: sy });
      });
      this.xs = xs;
    }
    function cursor(tv) {
      var xs = this.xs; if (!xs || !sx) return;
      if (tv == null) { cur.setAttribute('x1', -10); cur.setAttribute('x2', -10); dots.forEach(function (d) { d.el.setAttribute('cx', -10); }); return; }
      var i = 0; while (i < xs.length - 1 && xs[i + 1] <= tv) i++;
      var X = sx(Math.min(tv, xmax));
      cur.setAttribute('x1', X); cur.setAttribute('x2', X);
      dots.forEach(function (d) { d.el.setAttribute('cx', sx(Math.min(xs[i], xmax))); d.el.setAttribute('cy', d.sy(d.y[i])); });
    }
    return { draw: draw, cursor: cursor, el: fig };
  }
  W.TRRoadster.Plot = Plot;
  W.TRRoadster.minus = function (t) { return String(t).replace(/(^|[^\w])-(?=\d)/g, '$1\u2212'); };
  W.TRRoadster.sv = sv;

  // ---------- the widget ----------
  var root = D.getElementById('tr-w-thrust');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, h = T.h, fmt = T.fmt;
  root.innerHTML = '';
  root.classList.add('rd-w');

  var modes = [['boost', 'Boost'], ['brake', 'Brake'], ['hop', 'Hop']];
  var st = { mode: 'boost', gas: 'air', kind: 'bell', V: 600, p: 300, n: 4, d: 16, m: 1900, mu: 1.0, tOpen: 1.0 };

  var top = h('div', { class: 'rd-top' }); root.appendChild(top);
  var segMode = h('div', { class: 'tr-seg', role: 'group', 'aria-label': 'Which way the thrusters point' }); top.appendChild(segMode);
  modes.forEach(function (m, i) { var b = h('button', { type: 'button', 'data-m': m[0], 'aria-pressed': i ? 'false' : 'true' }); b.textContent = m[1]; segMode.appendChild(b); });
  var modeNote = h('p', { class: 'rd-modenote' }); top.appendChild(modeNote);

  var grid = h('div', { class: 'tr-w-grid rd-grid2' }); root.appendChild(grid);
  var leftCol = h('div', { class: 'rd-left' }); grid.appendChild(leftCol);
  var stageWrap = h('div', { class: 'rd-stage' }); leftCol.appendChild(stageWrap);
  var side = h('div', { class: 'rd-side' }); grid.appendChild(side);

  // stage
  var svg = sv('svg', { viewBox: '0 0 640 260', role: 'img', 'aria-label': 'Animated side view of the Roadster firing its thrusters' }, stageWrap);
  svg.innerHTML = '<defs><linearGradient id="rd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1510"/><stop offset="1" stop-color="#16271e"/></linearGradient>' +
    '<marker id="rd-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rd-aht"/></marker>' +
    '<marker id="rd-ahg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rd-ahg"/></marker>' +
    '<marker id="rd-ahb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rd-ahb"/></marker>' +
    '<marker id="rd-ahw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rd-ahw"/></marker></defs>' +
    '<rect width="640" height="260" fill="url(#rd-sky)"/>';
  var world = sv('g', null, svg);
  var GY = 214, PXM = 44, CS = 1.3;
  var groundG = sv('g', null, world);
  sv('rect', { class: 'rd-road', x: 0, y: GY, width: 640, height: 400 }, groundG);
  sv('line', { class: 'rd-roadedge', x1: 0, x2: 640, y1: GY, y2: GY }, groundG);
  var dashG = sv('g', null, groundG), dashes = [], posts = [];
  for (var i = 0; i < 9; i++) dashes.push(sv('rect', { class: 'rd-dash', x: 0, y: GY + 22, width: 40, height: 4, rx: 2 }, dashG));
  for (var j = 0; j < 4; j++) {
    var pg = sv('g', null, dashG);
    sv('rect', { class: 'rd-post', x: -3, y: GY - 34, width: 6, height: 34, rx: 2 }, pg);
    sv('rect', { class: 'rd-postr', x: -3, y: GY - 34, width: 6, height: 8, rx: 2 }, pg);
    posts.push(pg);
  }
  var ruler = sv('g', { class: 'rd-ruler' }, world), rulerTicks = [];
  for (var k = 0; k < 12; k++) {
    var rg = sv('g', null, ruler);
    sv('line', { x1: 14, x2: 26, y1: 0, y2: 0 }, rg);
    sv('text', { x: 30, y: 4 }, rg);
    rulerTicks.push(rg);
  }
  // car (local coords: rear at x=0, front at x=200, ground y=0; faces right)
  var car = sv('g', null, world);
  var shadow = sv('ellipse', { class: 'rd-shadow', cx: 0, cy: GY + 3, rx: 130, ry: 7 }, world);
  world.insertBefore(shadow, car);
  var plumeG = sv('g', null, car);
  sv('path', { class: 'rd-car', d: 'M5,-14 L3,-34 Q4,-44 16,-47 L52,-51 Q76,-55 94,-69 Q104,-76 118,-76 L128,-75 Q140,-71 154,-58 L186,-48 Q199,-44 201,-32 L200,-16 Q199,-11 194,-11 L180,-11 A20,20 0 0 0 140,-11 L60,-11 A20,20 0 0 0 20,-11 L9,-11 Q5,-11 5,-14 Z' }, car);
  sv('path', { class: 'rd-glass', d: 'M98,-66 Q106,-72 118,-72 L127,-71 Q137,-68 148,-58 L102,-57 Z' }, car);
  sv('path', { class: 'rd-trim', d: 'M8,-30 L40,-31 M170,-40 L196,-36' }, car);
  [40, 160].forEach(function (cx) { sv('circle', { class: 'rd-tire', cx: cx, cy: -11 + 0, r: 19 }, car); sv('circle', { class: 'rd-rim', cx: cx, cy: -11, r: 11 }, car); });
  var nozG = sv('g', null, car);
  var arrows = sv('g', null, world);
  var arThrust = sv('path', { class: 'rd-arT', 'marker-end': 'url(#rd-ah)' }, arrows);
  var arTire = sv('path', { class: 'rd-arG', 'marker-end': 'url(#rd-ahg)' }, arrows);
  var arW = sv('path', { class: 'rd-arW', 'marker-end': 'url(#rd-ahw)' }, arrows);
  var tThrust = sv('text', { class: 'rd-art rd-arTt' }, arrows), tTire = sv('text', { class: 'rd-art rd-arGt' }, arrows), tW = sv('text', { class: 'rd-art rd-arWt' }, arrows);
  // HUD
  var hud = sv('g', { class: 'rd-hud' }, svg);
  var hud1 = sv('text', { x: 14, y: 28 }, hud), hud2 = sv('text', { x: 14, y: 54 }, hud), hud3 = sv('text', { x: 14, y: 80 }, hud);
  var gauge = sv('g', { transform: 'translate(596,18)' }, svg);
  sv('rect', { class: 'rd-gbox', x: 0, y: 0, width: 26, height: 96, rx: 8 }, gauge);
  var gFill = sv('rect', { class: 'rd-gfill', x: 4, y: 4, width: 18, height: 88, rx: 5 }, gauge);
  sv('text', { class: 'rd-gl', x: 13, y: 110, 'text-anchor': 'middle' }, gauge).textContent = 'tank';
  var gT = sv('text', { class: 'rd-gl', x: -6, y: 12, 'text-anchor': 'end' }, gauge);
  var gP = sv('text', { class: 'rd-gl', x: -6, y: 28, 'text-anchor': 'end' }, gauge);
  var pool = [];
  for (var q = 0; q < 140; q++) pool.push({ el: sv('circle', { class: 'rd-puff', r: 0, cx: -50, cy: -50 }, plumeG), life: 0 });

  // controls
  var ctl = h('div', { class: 'rd-ctl' }); side.appendChild(ctl);
  function slider(key, label, min, max, step, aria) {
    var lab = h('label', { class: 'tr-field' });
    lab.innerHTML = '<span class="rd-fl">' + label + ' <span class="v"></span></span>';
    var inp = h('input', { type: 'range', min: min, max: max, step: step, value: st[key], 'aria-label': aria });
    lab.appendChild(inp); ctl.appendChild(lab);
    inp.addEventListener('input', function () { st[key] = +inp.value; update(); });
    return { inp: inp, v: lab.querySelector('.v') };
  }
  function seg(key, label, opts) {
    var wrap = h('div', { class: 'tr-field rd-segf' });
    wrap.appendChild(h('span', { class: 'rd-fl', text: label }));
    var g = h('div', { class: 'tr-seg', role: 'group', 'aria-label': label }); wrap.appendChild(g);
    opts.forEach(function (o) {
      var b = h('button', { type: 'button', 'aria-pressed': st[key] === o[0] ? 'true' : 'false' }); b.textContent = o[1]; g.appendChild(b);
      b.addEventListener('click', function () { st[key] = o[0]; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); update(); });
    });
    ctl.appendChild(wrap);
  }
  var sl = {
    V: slider('V', 'Tank volume', 50, 1000, 10, 'Total tank volume in liters'),
    p: slider('p', 'Tank pressure at the start (assumed)', 50, 700, 10, 'Starting tank pressure in bar; Tesla has not said'),
    n: slider('n', 'Thrusters firing', 1, 10, 1, 'Number of thrusters firing'),
    d: slider('d', 'Nozzle throat across', 4, 40, 1, 'Nozzle throat diameter in millimeters'),
    tOpen: slider('tOpen', 'Valves open for', 0.1, 6, 0.1, 'How long the valves stay open, in seconds'),
    m: slider('m', 'Car mass without the gas (assumed)', 1000, 3000, 50, 'Car mass in kilograms, not counting the gas'),
    mu: slider('mu', 'Tire grip, μ', 0.3, 1.5, 0.05, 'Tire grip coefficient')
  };
  seg('gas', 'Gas in the tanks', [['air', 'Air'], ['n2', 'Nitrogen']]);
  seg('kind', 'Nozzle shape', [['bell', 'Bell'], ['hole', 'Plain hole']]);

  var btns = h('div', { class: 'tr-w-ctrl' }); leftCol.appendChild(btns);
  var bFire = h('button', { type: 'button', class: 'hs-btn rd-fire' }); bFire.textContent = '▶ Fire'; btns.appendChild(bFire);
  var bReset = h('button', { type: 'button', class: 'hs-btn hs-btn-ghost' }); bReset.textContent = '↺ Reset'; btns.appendChild(bReset);

  // results
  var tiles = h('div', { class: 'rd-tiles', 'aria-live': 'polite' }); leftCol.appendChild(tiles);
  var summary = h('p', { class: 'rd-sum' }); leftCol.appendChild(summary);
  var plots = h('div', { class: 'rd-plots' }); root.appendChild(plots);
  var P1 = Plot(plots, { title: 'Tank pressure', ylab: 'bar' });
  var P2 = Plot(plots, { title: 'Gas temperature in the tank', ylab: '°C' });
  var P3 = Plot(plots, { title: 'Thrust, all thrusters', ylab: 'kN' });
  var P4 = Plot(plots, { title: 'Car acceleration', ylab: 'g' });
  var note = h('p', { class: 'tr-w-note rd-assume' }); root.appendChild(note);

  var R = null, play = null, tNow = null;
  function tile(b, s, cls) { return '<div class="rd-tile' + (cls ? ' ' + cls : '') + '"><b>' + b + '</b><span>' + s + '</span></div>'; }
  function f1(x) { return fmt(x, x < 10 ? 2 : x < 100 ? 1 : 0); }

  function update() {
    sl.V.v.textContent = fmt(st.V) + ' L';
    sl.p.v.textContent = fmt(st.p) + ' bar (' + fmt(st.p * 14.5038) + ' psi)';
    sl.n.v.textContent = st.n;
    sl.d.v.textContent = st.d + ' mm';
    sl.tOpen.v.textContent = fmt(st.tOpen, 1) + ' s';
    sl.m.v.textContent = fmt(st.m) + ' kg';
    sl.mu.v.textContent = fmt(st.mu, 2);
    segMode.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === st.mode ? 'true' : 'false'); });
    modeNote.textContent = st.mode === 'boost' ? 'Boost: rear thrusters push gas backward, so the car is pushed forward. The tires push too, at their grip limit.'
      : st.mode === 'brake' ? 'Brake: forward-facing thrusters push gas ahead of the car, slowing it from 60 mph along with the tires.'
      : 'Hop: downward thrusters push gas at the ground. The car leaves the ground only if the thrust beats its weight.';
    R = simulate({ V: st.V / 1000, p0: st.p * 1e5, gas: st.gas, n: st.n, d: st.d / 1000, mCar: st.m, mode: st.mode, mu: st.mu, kind: st.kind, tOpen: st.tOpen, dt: 0.001 });
    var S = R.S, t = S.t;
    P1.draw(t, [{ y: S.p.map(function (v) { return v / 1e5; }), cls: 'c1' }], {});
    P2.draw(t, [{ y: S.T.map(function (v) { return v - 273.15; }), cls: 'c2' }], { zero: false });
    var refs = [{ y: st.mu * R.mt0 * G0 / 1000, label: 'tire grip limit', cls: 'g' }];
    if (st.mode === 'hop') refs.push({ y: R.mt0 * G0 / 1000, label: 'weight', cls: 'w' });
    P3.draw(t, [{ y: S.F.map(function (v) { return v / 1000; }), cls: 'c3' }], { refs: refs, refCap: Math.max(1, R.F0 / 1000) * 3 });
    P4.el.querySelector('figcaption').textContent = st.mode === 'hop' ? 'Upward acceleration in the air' : st.mode === 'brake' ? 'Car deceleration (tires plus thrust)' : 'Car acceleration (tires plus thrust)';
    P4.draw(t, [{ y: S.a, cls: 'c4' }], { refs: st.mode === 'hop' ? [] : [{ y: st.mu, label: 'tires alone', cls: 'g' }] });

    var html = tile(f1(R.F0 / 1000) + ' kN', 'starting thrust') +
      (st.mode === 'hop' ? tile(f1(R.rW) + '×', 'thrust ÷ weight', R.rW > 1 ? 'hi' : '') : tile(f1(R.rTire) + '×', 'thrust ÷ tire grip', R.rTire >= 1 ? 'hi' : '')) +
      tile(fmt(R.m0) + ' kg', 'gas in the tanks') +
      tile(fmt(R.ve0) + ' m/s', 'exhaust speed at the start') +
      tile(fmt(R.burn, 2) + ' s', R.emptied ? 'burn (tank ran down)' : 'burn (valves closed)') +
      tile(f1(R.J / 1000) + ' kN·s', 'total impulse ∫F dt') +
      tile(fmt(R.dv / MPH, 0) + ' mph', 'Δv from thrust alone');
    if (st.mode === 'boost') html += tile(R.t60 != null ? fmt(R.t60, 2) + ' s' : '—', '0–60 mph (tires alone: ' + fmt(R.t60Tires, 2) + ' s)', 'hi');
    else if (st.mode === 'brake') html += tile(fmt(R.xStop, 1) + ' m', 'stop from 60 mph (tires alone: ' + fmt(R.xStopTires, 1) + ' m)', 'hi');
    else html += tile(R.tUp != null ? fmt(R.peak, 2) + ' m' : 'stays down', R.tUp != null ? 'peak height, ' + fmt((R.tLand || R.tEnd) - R.tUp, 2) + ' s in the air' : 'thrust is less than weight', 'hi');
    html += tile(fmt(R.E / 3.6e6, 1) + ' kWh', 'stored energy, ideal most');
    tiles.innerHTML = html;

    var rr = R.rTire;
    summary.textContent = 'With ' + st.n + ' thruster' + (st.n > 1 ? 's' : '') + ' and ' + fmt(st.V) + ' liters of ' + R.gas.name.toLowerCase() + ' at ' + fmt(st.p) + ' bar, the starting thrust is ' + f1(R.F0 / 1000) + ' kN, ' +
      f1(rr) + ' times what the tires can grip and ' + f1(R.rW) + ' times the car’s weight. ' +
      'The tank gas falls to ' + fmt(R.pEnd / 1e5) + ' bar and ' + fmt(R.TEnd - 273.15) + ' °C after ' + fmt(R.burn, 2) + ' s of thrust, using ' + fmt(R.mUsed) + ' kg of gas. ' +
      (st.mode === 'boost' ? (R.t60 != null ? 'The car reaches 60 mph in ' + fmt(R.t60, 2) + ' s, against ' + fmt(R.t60Tires, 2) + ' s on tires alone.' : '')
        : st.mode === 'brake' ? 'It stops from 60 mph in ' + fmt(R.xStop, 1) + ' m, against ' + fmt(R.xStopTires, 1) + ' m on tires alone.'
          : (R.tUp != null ? 'It hops ' + fmt(R.peak, 2) + ' m high.' : 'It stays on the ground: the thrust is less than its weight.'));
    summary.textContent = W.TRRoadster.minus(summary.textContent);

    var cold = R.Te0 < 90;
    note.innerHTML = '<b>Assumed, not published by Tesla:</b> tank pressure, nozzle size, thrust and the car’s weight. Ideal gas (at hundreds of bar, real air and nitrogen differ from it by a few to tens of percent; a real tank holds less than this); the tank gets no heat from its walls; perfect nozzles with no friction; ' +
      (st.kind === 'bell' ? 'the bell is assumed to expand the gas exactly to outside pressure at every moment, the best a nozzle can do. ' : 'a plain hole lets gas out at the speed of sound with pressure left over, which adds the (p<sub>e</sub> − p<sub>a</sub>)A<sub>e</sub> term. ') +
      'No air drag or rolling resistance. Starting exhaust temperature in this ideal model: ' + fmt(R.Te0 - 273.15) + ' °C' + (cold ? ', colder than the −196 °C at which nitrogen boils, so real gas would partly condense and a real nozzle would do a little worse.' : '.') +
      ' “Stored energy, ideal most” is the work the gas could do if it expanded slowly at room temperature.';
    note.innerHTML = W.TRRoadster.minus(note.innerHTML);
    stopPlay(); show(null);
  }

  function nozzleDraw() {
    nozG.textContent = '';
    var pts = st.mode === 'boost' ? [[3, -22, 180], [4, -34, 180]] : st.mode === 'brake' ? [[201, -24, 0], [200, -36, 0]] : [[26, -11, 90], [74, -11, 90], [126, -11, 90], [174, -11, 90]];
    pts.forEach(function (p) {
      var g = sv('g', { transform: 'translate(' + p[0] + ',' + p[1] + ') rotate(' + p[2] + ')' }, nozG);
      sv('path', { class: 'rd-noz', d: 'M-2,-3 L4,-3 L11,-6.5 L11,6.5 L4,3 L-2,3 Z' }, g);
    });
    return pts;
  }
  var NP = nozzleDraw();
  var lastI = 0;
  function show(tv) {
    var S = R.S, i = 0;
    if (tv == null) tv = 0;
    while (i < S.t.length - 1 && S.t[i + 1] <= tv) i++;
    lastI = i;
    var v = S.v[i], x = S.x[i], y = S.y[i], F = S.F[i];
    var camY = Math.max(0, y * PXM - 110);
    var carX = st.mode === 'brake' ? 236 : 150, carY = GY - y * PXM + camY;
    car.setAttribute('transform', 'translate(' + carX + ',' + carY + ') scale(' + CS + ')');
    shadow.setAttribute('cx', carX + 100 * CS); shadow.setAttribute('cy', GY + 3 + camY);
    shadow.setAttribute('opacity', Math.max(0.1, 0.55 - y * 0.08));
    groundG.setAttribute('transform', 'translate(0,' + camY + ')');
    var off = ((x * PXM) % 80 + 80) % 80;
    dashes.forEach(function (d, k) { d.setAttribute('x', k * 80 - off); });
    var offp = ((x * PXM) % 220 + 220) % 220;
    posts.forEach(function (p, k) { p.setAttribute('transform', 'translate(' + (k * 220 + 60 - offp) + ',0)'); });
    ruler.style.display = st.mode === 'hop' ? '' : 'none';
    if (st.mode === 'hop') {
      var stepM = R.peak > 12 ? 5 : R.peak > 5 ? 2 : 1;
      rulerTicks.forEach(function (rg, k) {
        var hm = k * stepM, yy = GY - hm * PXM + camY;
        rg.setAttribute('transform', 'translate(0,' + yy + ')');
        rg.style.display = yy > 96 && yy <= GY + 1 ? '' : 'none';
        rg.querySelector('text').textContent = hm + ' m';
      });
    }
    var pk = S.p[i] / R.S.p[0];
    gFill.setAttribute('height', Math.max(0, 88 * pk)); gFill.setAttribute('y', 4 + 88 * (1 - pk));
    gP.textContent = fmt(S.p[i] / 1e5) + ' bar'; gT.textContent = W.TRRoadster.minus(fmt(S.T[i] - 273.15)) + ' °C';
    hud1.textContent = 't = ' + fmt(S.t[i], 2) + ' s';
    hud2.textContent = st.mode === 'hop' ? 'height ' + fmt(y, 2) + ' m' : 'speed ' + fmt(v / MPH) + ' mph';
    hud3.textContent = 'thrust ' + f1(F / 1000) + ' kN';
    // icy nozzles as the gas cools
    var cool = Math.min(1, Math.max(0, (T20 - S.T[i]) / 140));
    nozG.style.setProperty('--rd-ice', cool.toFixed(2));
    nozG.classList.toggle('icy', cool > 0.25);
    // force arrows (length ∝ force, capped)
    var mt = st.m + R.m0, Ftire = st.mu * mt * G0, Wt = mt * G0, sc = 90 / Math.max(F, Ftire, st.mode === 'hop' ? Wt : 0, 1);
    var cx = carX + 100 * CS, cy = carY - 52;
    if (st.mode === 'hop') {
      arThrust.setAttribute('d', F > 0 ? 'M' + cx + ',' + (cy + 4) + ' v' + (-F * sc) : 'M0,0');
      arW.setAttribute('d', 'M' + (cx + 40) + ',' + (cy + 8) + ' v' + (Wt * sc));
      arTire.setAttribute('d', 'M0,0');
      tThrust.setAttribute('x', cx - 8); tThrust.setAttribute('y', cy - F * sc - 2); tThrust.setAttribute('text-anchor', 'end');
      tThrust.textContent = F > 0 ? 'thrust' : '';
      tW.setAttribute('x', cx + 48); tW.setAttribute('y', cy + 8 + Wt * sc - 4); tW.textContent = 'weight';
      tTire.textContent = '';
    } else {
      var dir = st.mode === 'boost' ? 1 : -1;
      var x0 = st.mode === 'boost' ? cx + 80 : cx - 80;
      arThrust.setAttribute('d', F > 0 ? 'M' + x0 + ',' + (cy - 30) + ' h' + (dir * F * sc) : 'M0,0');
      tThrust.setAttribute('x', x0); tThrust.setAttribute('y', cy - 38); tThrust.setAttribute('text-anchor', dir > 0 ? 'start' : 'end');
      tThrust.textContent = F > 0 ? 'thrust' : '';
      var moving = st.mode === 'boost' || v > 0;
      arTire.setAttribute('d', moving ? 'M' + x0 + ',' + (GY + camY + 12) + ' h' + (dir * Ftire * sc) : 'M0,0');
      tTire.setAttribute('x', x0); tTire.setAttribute('y', GY + camY + 30); tTire.setAttribute('text-anchor', dir > 0 ? 'start' : 'end');
      tTire.textContent = moving ? 'tire grip' : '';
      arW.setAttribute('d', 'M0,0'); tW.textContent = '';
    }
    [P1, P2, P3, P4].forEach(function (p) { p.cursor(tNow == null && tv === 0 ? null : tv); });
  }

  function puff(dt, Fon, md, ve) {
    var rate = Fon ? Math.min(900, 60 + md * 6) : 0, sp = 260 + ve * 0.45;
    var n = rate * dt, pts = NP;
    pool.forEach(function (p) {
      if (p.life > 0) {
        p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 40;
        p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', p.y.toFixed(1)); p.el.setAttribute('r', p.r.toFixed(1));
        p.el.setAttribute('opacity', Math.max(0, p.life / p.max * 0.7).toFixed(2));
        if (p.life <= 0) p.el.setAttribute('r', 0);
      }
    });
    while (n > 0) {
      if (n < 1 && Math.random() > n) break;
      n -= 1;
      var free = null; for (var k = 0; k < pool.length; k++) if (pool[k].life <= 0) { free = pool[k]; break; }
      if (!free) break;
      var np = pts[Math.floor(Math.random() * pts.length)], ang = np[2] * Math.PI / 180 + (Math.random() - 0.5) * 0.35;
      free.x = np[0] + Math.cos(ang) * 11; free.y = np[1] + Math.sin(ang) * 11;
      var s = sp * (0.7 + Math.random() * 0.5);
      free.vx = Math.cos(ang) * s; free.vy = Math.sin(ang) * s;
      free.r = 2 + Math.random() * 2; free.max = free.life = 0.22 + Math.random() * 0.2;
    }
  }
  function clearPuffs() { pool.forEach(function (p) { p.life = 0; p.el.setAttribute('r', 0); }); }

  var clock = 0, speedUp = 1;
  function stopPlay() { play = false; tNow = null; bFire.textContent = '▶ Fire'; clearPuffs(); }
  function frame(dt) {
    if (!play) return;
    clock += dt * speedUp;
    var end = R.S.t[R.S.t.length - 1];
    if (clock >= end) { clock = end; play = false; bFire.textContent = '▶ Fire again'; }
    tNow = clock; show(clock);
    var S = R.S, i = lastI;
    puff(dt, S.F[i] > 0, S.md[i], R.ve0 * Math.sqrt(Math.max(0.1, S.T[i] / S.T[0])));
    if (!play) { clearPuffs(); }
  }
  // our own frame loop: it runs only while a burn the reader started is playing (a few seconds at most)
  var raf = 0, last = 0;
  function tick(ts) {
    raf = 0;
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    frame(dt);
    if (play) raf = W.requestAnimationFrame(tick);
  }
  function startLoop() { last = 0; if (!raf) raf = W.requestAnimationFrame(tick); }
  bFire.addEventListener('click', function () {
    if (play) { stopPlay(); show(null); return; }
    var end = R.S.t[R.S.t.length - 1];
    if (T.reduced) { tNow = end; show(end); bFire.textContent = '▶ Fire again'; return; }
    speedUp = end > 6 ? end / 6 : 1;
    clock = 0; play = true; bFire.textContent = '■ Stop'; startLoop();
  });
  bReset.addEventListener('click', function () {
    st = { mode: st.mode, gas: 'air', kind: 'bell', V: 600, p: 300, n: 4, d: 16, m: 1900, mu: 1.0, tOpen: st.mode === 'hop' ? 0.5 : 1.0 };
    Object.keys(sl).forEach(function (k) { sl[k].inp.value = st[k]; });
    ctl.querySelectorAll('.rd-segf').forEach(function (w, wi) { var key = wi === 0 ? 'gas' : 'kind'; w.querySelectorAll('button').forEach(function (b, bi) { b.setAttribute('aria-pressed', (key === 'gas' ? ['air', 'n2'] : ['bell', 'hole'])[bi] === st[key] ? 'true' : 'false'); }); });
    update();
  });
  segMode.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      st.mode = b.dataset.m;
      if (st.mode === 'hop' && st.tOpen > 0.5) { st.tOpen = 0.5; sl.tOpen.inp.value = 0.5; }
      NP = nozzleDraw(); update();
    });
  });
  update();
})(typeof window !== 'undefined' ? window : this);
