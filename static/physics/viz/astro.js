/* =====================================================================================================
   Astronomy course visuals (Physics Ladder, course astro). Registered with window.MathLadder.viz.register.
   Loaded after static/math/viz/core.js (and normally the ladder kit static/physics/viz/physics.js, whose styles
   these reuse when present; a small fallback stylesheet is injected). Vanilla JS, no libraries, no network.
   Every visual draws on a dark "space" canvas (the same in both site themes, like the kit's sky visuals), has an
   aria-label describing its state, keyboard-usable controls, and these shared options:
     interactive: false   problem mode: frozen exactly as the options describe (no controls, no animation)
     quiet: true          hides the readout and any computed numbers that could give an answer away
     tags: {id: 'A'}      letter tags on named elements (ids listed per visual)
     task: 'text'         an instruction above the canvas (lesson mode)      label: 'text'  replaces the aria-label
     play: true|false     autoplay (default true, never when the viewer prefers reduced motion)
     t                    the frozen moment in problem mode (each visual's own time unit)

   astro-moonclock   Earth seen from above its North Pole with sunlight from the left, an observer turning with Earth,
                     and the Moon at its phase: when is the Moon above the observer's horizon?
                     age (days since new moon, 7.4), time (clock hours 0–24, 18). Ids: moon, observer, sun.
   astro-retrograde  Earth passing an outer planet: lines of sight from Earth to the planet land on a strip of distant
                     stars, where the planet's apparent path loops backward. a2 (outer orbit, AU, 1.52), t (0–1 of the
                     window around opposition). Ids: earth, planet, loop.
   astro-springneap  Earth's ocean bulges from the Moon and the Sun (exaggerated) and the tidal range through the month.
                     age (days since new moon, 0). Ids: moon, earth.
   astro-aperture    Two telescope apertures: collecting areas with arriving photons, and each one's image of a close
                     double star (diffraction blur θ ≈ 2.5 × 10⁵ λ/D arcsec). d1, d2 (meters, 0.2 and 1), sep (arcsec,
                     0.3), lambda (nm, 550). Ids: a1, a2.
   astro-disk        A slowly spinning cloud collapses, spins up and flattens into a disk around the young Sun, with the
                     frost line separating rock-and-metal condensation from ices. t (0–1, 0 cloud, 0.5 disk, 1 planetesimals).
                     Ids: sun, frost.
   astro-galaxies    Sketches of Hubble types in a grid. types (['E0','E5','Sb','SBb','Sc','Irr']; any of E0–E7, S0, Sa, Sb,
                     Sc, SBa, SBb, SBc, Irr). Labels under each sketch unless quiet. Ids: the type names.
   astro-pulsar      A spinning neutron star with a tilted magnetic axis sweeping two beams; a detector toward Earth records
                     a pulse each time a beam crosses the line of sight. period (s, 1), tilt (magnetic axis from the spin axis,
                     degrees, 55), view (line of sight from the spin axis, degrees, 60), t (rotations). Ids: star, beam, earth.
   ===================================================================================================== */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('physics/viz/astro.js: load math/viz/core.js first'); return; }
  var M = Math, PI = M.PI, TAU = 2 * PI, DEG = PI / 180;

  // ---------- styles (fallback when the kit's physics.css is not on the page) ----------
  if (!D.getElementById('astv-css')) {
    var st = D.createElement('style'); st.id = 'astv-css';
    st.textContent = '.astv .astv-box{position:relative}.astv .astv-box .ml-cv{border-radius:10px;display:block;max-width:100%}' +
      '.astv .astv-task{margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card,rgba(127,127,127,.06));border:1px solid var(--mv-line,rgba(127,127,127,.25));border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}' +
      '.astv .astv-ctl{display:flex;flex-wrap:wrap;gap:.45rem .8rem;align-items:center;margin-top:.55rem}.astv .astv-ctl:empty{display:none}.astv .astv-ctl .ml-sl{flex:1 1 170px;min-width:0}' +
      '.astv .astv-ctl .ml-btn{min-height:36px}.astv .astv-play{min-width:6.2rem}.astv .ml-sl input{accent-color:#2d5596}html[data-theme="dark"] .astv .ml-sl input{accent-color:#8fb1ea}' +
      '.astv .ml-btn.pri{background:#2d5596;border-color:#2d5596;color:#fff}html[data-theme="dark"] .astv .ml-btn.pri{background:#8fb1ea;border-color:#8fb1ea;color:#0f1a24}' +
      '.astv .astv-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}';
    (D.head || D.documentElement).appendChild(st);
  }

  // ---------- helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function num(v, d) { var x = +v; return v != null && v !== '' && isFinite(x) ? x : d; }
  function fm(v, d) { return V.fmt(v, d == null ? 1 : d); }
  function rng(seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = M.imul(t ^ t >>> 15, t | 1); t ^= t + M.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var K = { space: '#07121c', space2: '#0d1d2a', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,0.32)', acc: '#63e6be', gold: '#ffd479', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', earth: '#1d4a6b', moon: '#e6ecf2', moonDark: '#3a3f44' };
  function font(sz, w) { return (w || 600) + ' ' + (sz || 12) + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; }
  function txt(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = font(o.size, o.weight); ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle';
    var w = ctx.measureText(s).width, cw = ctx.canvas.width / (ctx.getTransform ? ctx.getTransform().a : 1), al = ctx.textAlign, left = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x;
    if (w < cw - 6) { if (left < 3) x += 3 - left; else if (left + w > cw - 3) x -= left + w - (cw - 3); }
    ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(7,18,28,0.85)'; ctx.strokeText(s, x, y);
    ctx.fillStyle = o.color || K.ink; ctx.fillText(s, x, y); ctx.restore(); return w;
  }
  function circ(ctx, x, y, r, o) { o = o || {}; ctx.save(); ctx.beginPath(); ctx.arc(x, y, M.max(0.1, r), o.a0 || 0, o.a1 == null ? TAU : o.a1, !!o.ccw); if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); } if (o.color) { ctx.strokeStyle = o.color; ctx.lineWidth = o.w || 1.5; ctx.setLineDash(o.dash || []); ctx.stroke(); } ctx.restore(); }
  function line(ctx, x1, y1, x2, y2, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.setLineDash(dash || []); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function arrow(ctx, x1, y1, x2, y2, col, w) { var a = M.atan2(y2 - y1, x2 - x1), hs = 7 + (w || 2); line(ctx, x1, y1, x2 - hs * 0.6 * M.cos(a), y2 - hs * 0.6 * M.sin(a), col, w || 2); ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.42), y2 - hs * M.sin(a - 0.42)); ctx.lineTo(x2 - hs * M.cos(a + 0.42), y2 - hs * M.sin(a + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore(); }
  function tagDot(ctx, s, x, y) { if (!s) return; circ(ctx, x, y, 11, { fill: '#07121c' }); circ(ctx, x, y, 9.5, { fill: '#ffd479' }); ctx.save(); ctx.font = font(12, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1d2320'; ctx.fillText(s, x, y + 0.5); ctx.restore(); }
  function space(c, seed) { var ctx = c.ctx; ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = K.space; ctx.fillRect(0, 0, c.w, c.h); var R0 = rng(seed || 7); for (var i = 0; i < 80; i++) { var s = R0(); ctx.fillStyle = 'rgba(219,231,239,' + (0.15 + 0.5 * s * s) + ')'; ctx.fillRect(R0() * c.w, R0() * c.h, s > 0.9 ? 1.6 : 1, s > 0.9 ? 1.6 : 1); } ctx.restore(); }
  /* moonFace(ctx, x, y, r, phase): the Moon as seen from Earth; phase angle 0 = new, π = full, waxing lit on the right */
  function moonFace(ctx, x, y, r, ph) {
    ph = ((ph % TAU) + TAU) % TAU; circ(ctx, x, y, r, { fill: K.moonDark });
    var waxing = ph < PI, k = M.cos(ph); // terminator ellipse half-width r·|cos|
    ctx.save(); ctx.beginPath();
    if (waxing) { ctx.arc(x, y, r, -PI / 2, PI / 2, false); ctx.ellipse(x, y, r * M.abs(k), r, 0, PI / 2, -PI / 2, k < 0); }
    else { ctx.arc(x, y, r, PI / 2, -PI / 2, false); ctx.ellipse(x, y, r * M.abs(k), r, 0, -PI / 2, PI / 2, k < 0); }
    ctx.closePath(); ctx.fillStyle = K.moon; ctx.fill(); ctx.restore();
  }

  /* frame(el, o, label): task, canvas box, control row, readout, screen-reader line; handles the shared options */
  function frame(el, o, label) {
    el.classList.add('astv', 'phv'); el.setAttribute('role', 'group'); if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { o: o, live: o.interactive !== false, quiet: !!(o.quiet || o.readout === false), tags: o.tags || {} };
    if (o.task && F.live) { F.task = V.el('p', 'astv-task phv-task', '<span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = V.el('div', 'astv-box phv-box'); el.appendChild(F.box);
    F.ctl = V.el('div', 'ml-ctl astv-ctl phv-ctl'); el.appendChild(F.ctl); if (!F.live) F.ctl.hidden = true;
    F.out = V.readout(el); if (F.quiet) F.out.el.hidden = true;
    F.sr = V.el('p', 'astv-sr'); F.sr.setAttribute('aria-live', 'polite'); el.appendChild(F.sr);
    F.tag = function (ctx, id, x, y) { if (F.tags[id] != null) tagDot(ctx, String(F.tags[id]), x, y); };
    F.canvas = function (aspect, narrow) {
      var q = { aspect: aspect, min: 230, max: 460 }, c = V.canvas(F.box, q);
      var adj = function () { var w = F.box.clientWidth || 300, nh = w < 520 ? M.round(w / (narrow || 1.05)) : 0; if (nh !== (q.height || 0)) { q.height = nh || undefined; c.fit(); } };
      c.onResize(adj); adj(); c.onResize(function () { F.now(); }); V.onTheme(function () { F.now(); });
      c.cv.setAttribute('role', 'img'); c.cv.style.touchAction = 'pan-y'; F.c = c; return c;
    };
    F.draw = null; F.now = function () { if (F.draw) F.draw(); };
    F.desc = function (s) { if (F.c && s !== F._d) { F._d = s; F.c.cv.setAttribute('aria-label', s); F.c.cv.textContent = s; } };
    F.read = function (h) { if (h !== F._r) { F._r = h; F.out.set(h); } };
    F.slider = function (q) { return V.slider(F.ctl, { label: q.label, min: q.min, max: q.max, step: q.step, value: q.value, fmt: q.fmt, input: function (v) { q.input(v); F.now(); } }); };
    /* anim(q): play, step, reset and a time slider. q = {t0, tmax, rate, dt, loop, tlabel, tfmt} */
    F.anim = function (q) {
      var A = { t: o.t != null ? num(o.t, q.t0 || 0) : (q.t0 || 0), playing: false };
      if (!F.live) return A;
      var row = V.el('div', 'ml-ctl astv-ctl phv-ctl phv-anim'); el.insertBefore(row, F.ctl);
      var bp = V.button(row, '▶ Play', function () { if (A.playing) pause(); else play(); }, 'pri astv-play phv-play');
      var bs = V.button(row, 'Step ›', function () { pause(); adv(q.dt || q.tmax / 60); }); bs.setAttribute('aria-label', 'Step forward');
      var sl = V.slider(row, { label: q.tlabel || 'Time', min: 0, max: q.tmax, step: q.tmax / 500, value: A.t, fmt: q.tfmt || function (v) { return fm(v, 2); }, input: function (v) { pause(); A.t = v; F.now(); } });
      var lp = V.loop(F.box, function (dt) { if (A.playing) adv(dt * (q.rate || 1)); }); lp.stop();
      function adv(h) { A.t += h; if (A.t >= q.tmax) { if (q.loop !== false) A.t %= q.tmax; else { A.t = q.tmax; pause(); } } sl.set(A.t); F.now(); }
      function paint() { bp.textContent = A.playing ? '❚❚ Pause' : '▶ Play'; bp.setAttribute('aria-pressed', String(A.playing)); F.out.el.setAttribute('aria-live', A.playing ? 'off' : 'polite'); }
      function play() { if (q.loop === false && A.t >= q.tmax - 1e-9) A.t = 0; A.playing = true; lp.start(); paint(); }
      function pause() { A.playing = false; lp.stop(); paint(); }
      A.set = function (t) { A.t = t; sl.set(t); F.now(); };
      paint(); if ((o.play != null ? !!o.play : true) && !V.reduced) play();
      return A;
    };
    return F;
  }

  // =====================================================================================================
  // astro-moonclock
  V.register('astro-moonclock', function (el, o) {
    var F = frame(el, o, 'When the Moon is above the horizon'), c = F.canvas(1.6, 0.95), P = { age: clamp(num(o.age, 7.4), 0, 29.5) };
    var A = F.anim({ t0: num(o.time, 18), tmax: 24, rate: 2, dt: 0.5, tlabel: 'Time of day', tfmt: function (v) { var h = M.floor(v) % 24, m = M.floor((v - M.floor(v)) * 60); return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' am' : ' pm'); } });
    if (F.live) F.slider({ label: 'Moon\'s age', min: 0, max: 29.5, step: 0.1, value: P.age, fmt: function (v) { return fm(v, 1) + ' days'; }, input: function (v) { P.age = v; } });
    var NAMES = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'third quarter', 'waning crescent'];
    function clock(h) { h = ((h % 24) + 24) % 24; var hh = M.floor(h), mm = M.round((h - hh) * 60); if (mm === 60) { hh = (hh + 1) % 24; mm = 0; } if (hh === 0 && mm === 0) return 'midnight'; if (hh === 12 && mm === 0) return 'noon'; return (hh % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + (hh < 12 ? ' am' : ' pm'); }
    F.draw = function () {
      var ctx = c.ctx, W0 = c.w, H0 = c.h, t = A.t, wide = W0 > 560; space(c, 3);
      var cx = wide ? W0 * 0.4 : W0 * 0.5, cy = wide ? H0 * 0.52 : H0 * 0.42, Re = M.min(W0, H0) * (wide ? 0.13 : 0.12), Rm = M.min(wide ? W0 * 0.3 : W0 * 0.4, H0 * (wide ? 0.4 : 0.34));
      // sunlight
      txt(ctx, 'sunlight →', 10, 14, { size: 11.5, color: K.gold }); for (var i = 0; i < 4; i++) arrow(ctx, 8, 40 + i * (H0 - 70) / 3, 38, 40 + i * (H0 - 70) / 3, 'rgba(255,212,121,0.5)', 1.4);
      F.tag(ctx, 'sun', 52, 26);
      // Earth with day and night halves
      circ(ctx, cx, cy, Re, { fill: '#0b2033' }); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Re, PI / 2, 1.5 * PI); ctx.closePath(); ctx.fillStyle = K.earth; ctx.fill(); ctx.restore(); circ(ctx, cx, cy, Re, { color: K.blue, w: 1.5 });
      txt(ctx, 'day', cx - Re * 0.55, cy, { size: 10.5, color: K.ink, align: 'center' }); txt(ctx, 'night', cx + Re * 0.5, cy, { size: 10.5, color: K.muted, align: 'center' });
      // Moon's orbit and the Moon (lit half toward the Sun)
      circ(ctx, cx, cy, Rm, { color: K.line, w: 1, dash: [3, 4] });
      var phi = PI + P.age / 29.53 * TAU, mx = cx + Rm * M.cos(phi), my = cy - Rm * M.sin(phi);
      circ(ctx, mx, my, 9, { fill: K.moonDark }); ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 9, PI / 2, 1.5 * PI); ctx.closePath(); ctx.fillStyle = K.moon; ctx.fill(); ctx.restore(); F.tag(ctx, 'moon', mx + 15, my - 15);
      // observer, local up and horizon
      var th = PI + (t - 12) / 24 * TAU, ox = cx + Re * M.cos(th), oy = cy - Re * M.sin(th), ux = M.cos(th), uy = -M.sin(th), hx = -uy, hy = ux, hl = Re * 1.9;
      var big = M.max(W0, H0) * 2; ctx.save(); var gsky = ctx.createLinearGradient(ox, oy, ox + ux * Rm * 1.3, oy + uy * Rm * 1.3); gsky.addColorStop(0, 'rgba(99,230,190,0.13)'); gsky.addColorStop(1, 'rgba(99,230,190,0)'); ctx.beginPath(); ctx.moveTo(ox - hx * big, oy - hy * big); ctx.lineTo(ox + hx * big, oy + hy * big); ctx.lineTo(ox + hx * big + ux * big, oy + hy * big + uy * big); ctx.lineTo(ox - hx * big + ux * big, oy - hy * big + uy * big); ctx.closePath(); ctx.fillStyle = gsky; ctx.fill(); ctx.restore();
      line(ctx, ox - hx * hl, oy - hy * hl, ox + hx * hl, oy + hy * hl, K.acc, 2); arrow(ctx, ox, oy, ox + ux * 26, oy + uy * 26, K.acc, 2); circ(ctx, ox, oy, 4.5, { fill: '#fff' });
      txt(ctx, 'your horizon', ox + hx * hl, oy + hy * hl + (hy >= 0 ? 12 : -12), { size: 10.5, color: K.acc, align: 'center' }); txt(ctx, 'your sky', ox + ux * 44, oy + uy * 44, { size: 10.5, color: K.acc, align: 'center' }); F.tag(ctx, 'observer', ox - ux * 16, oy - uy * 16);
      var cm = M.cos(th - phi), cs = M.cos(th - PI), up = cm > 0.02, sunUp = cs > 0.02, elong = P.age / 29.53 * 360, q4 = function (h) { return M.round(h * 4) / 4; }, rise = q4(6 + elong / 15), set = q4(rise + 12), high = q4(rise + 6), nm = NAMES[M.round(P.age / 29.53 * 8) % 8];
      var moonTxt = M.abs(cm) <= 0.02 ? (M.sin(th - phi) < 0 ? 'Moon rising' : 'Moon setting') : up ? 'Moon above your horizon' : 'Moon below your horizon', sunTxt = M.abs(cs) <= 0.02 ? (M.sin(th - PI) < 0 ? 'sunrise' : 'sunset') : sunUp ? 'Sun up' : 'Sun down';
      // phase as seen from Earth
      var vx = wide ? W0 - 70 : W0 - 46, vy = wide ? 70 : H0 - 50, vr = wide ? 34 : 24; moonFace(ctx, vx, vy, vr, P.age / 29.53 * TAU); txt(ctx, 'seen from Earth', vx, vy + vr + 13, { size: 10.5, color: K.muted, align: 'center' }); txt(ctx, nm, vx, vy - vr - 12, { size: 11, weight: 700, align: 'center' });
      // status
      txt(ctx, clock(t) + ' · ' + sunTxt, 10, H0 - 34, { size: 12, weight: 700, color: sunUp ? K.gold : K.muted });
      txt(ctx, moonTxt, 10, H0 - 15, { size: 12, weight: 700, color: up ? K.acc : M.abs(cm) <= 0.02 ? K.gold : K.red });
      F.desc('At ' + clock(t) + ' with a ' + nm + ' (' + fm(P.age, 1) + ' days old): ' + moonTxt.toLowerCase() + ', ' + sunTxt.toLowerCase() + '.');
      F.read('Earth turns counterclockwise in this view, carrying you past the Sun and the Moon. The ' + nm + ' is about <b>' + fm(elong, 0) + '°</b> east of the Sun, so it rises about ' + fm(elong / 15, 1) + ' h after the Sun: near <b>' + clock(rise) + '</b>. It is highest about ' + clock(high) + ' and sets about ' + clock(set) + '. (Times assume sunrise at 6 am.)');
      F.sr.textContent = '';
    };
    F.now(); return {};
  });

  // =====================================================================================================
  // astro-retrograde
  V.register('astro-retrograde', function (el, o) {
    var F = frame(el, o, 'Earth passing an outer planet'), c = F.canvas(1.45, 0.78), a2 = clamp(num(o.a2, 1.52), 1.2, 10);
    var A = F.anim({ t0: 0, tmax: 1, rate: 0.12, dt: 1 / 24, tlabel: 'Time', tfmt: function (v) { return fm(v * 100, 0) + '%'; }, loop: true });
    var Tw = 0.9 * M.max(1, M.min(1.6, a2 / 1.52)), N = 19; // the window (years) centered on opposition
    function pos(a, tau) { var w = TAU / M.pow(a, 1.5); return [a * M.cos(w * tau), a * M.sin(w * tau)]; }
    function lam(tau) { var e = pos(1, tau), p = pos(a2, tau); return M.atan2(p[1] - e[1], p[0] - e[0]); }
    function beta(tau) { var e = pos(1, tau), p = pos(a2, tau), d = M.hypot(p[0] - e[0], p[1] - e[1]); return M.atan(a2 * M.sin(1.85 * DEG) * M.cos(TAU / M.pow(a2, 1.5) * tau + 0.6) / d); }
    F.draw = function () {
      var ctx = c.ctx, W0 = c.w, H0 = c.h, t = A.t, wide = W0 > 560; space(c, 5);
      var topH = H0 * 0.6, cx = wide ? W0 * 0.3 : W0 * 0.38, cy = topH * 0.52, sc = M.min((wide ? W0 * 0.26 : W0 * 0.34) / a2, topH * 0.44 / a2);
      var X = function (x) { return cx + x * sc; }, Y = function (y) { return cy - y * sc; };
      circ(ctx, cx, cy, 8, { fill: K.gold }); circ(ctx, cx, cy, sc, { color: K.line, w: 1 }); circ(ctx, cx, cy, a2 * sc, { color: K.line, w: 1 });
      var farX = wide ? W0 - 30 : W0 - 14; line(ctx, farX, 10, farX, topH - 10, 'rgba(219,231,239,0.25)', 6); txt(ctx, 'distant stars', farX - 6, 12, { size: 10.5, color: K.muted, align: 'right' });
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W0, topH); ctx.clip();
      var taus = []; for (var i = 0; i < N; i++) taus.push(-Tw / 2 + Tw * i / (N - 1));
      var cur = -Tw / 2 + Tw * t;
      taus.forEach(function (tau, i) { var e = pos(1, tau), p = pos(a2, tau), dx = p[0] - e[0], dy = p[1] - e[1], k = (farX - X(e[0])) / (dx * sc || 1e-9), yy = Y(e[1]) - dy * sc * k; if (tau <= cur + 1e-9) { line(ctx, X(e[0]), Y(e[1]), farX, yy, 'rgba(255,212,121,0.22)', 1); circ(ctx, X(e[0]), Y(e[1]), 2.2, { fill: 'rgba(116,192,252,0.7)' }); circ(ctx, X(p[0]), Y(p[1]), 2.2, { fill: 'rgba(255,135,135,0.7)' }); circ(ctx, farX, yy, 2.4, { fill: K.red }); } });
      var e0 = pos(1, cur), p0 = pos(a2, cur), dx0 = p0[0] - e0[0], dy0 = p0[1] - e0[1], k0 = (farX - X(e0[0])) / (dx0 * sc || 1e-9);
      line(ctx, X(e0[0]), Y(e0[1]), farX, Y(e0[1]) - dy0 * sc * k0, K.gold, 1.6);
      circ(ctx, X(e0[0]), Y(e0[1]), 6, { fill: K.blue }); circ(ctx, X(p0[0]), Y(p0[1]), 6, { fill: K.red });
      txt(ctx, 'Earth', X(e0[0]) - 10, Y(e0[1]) + 14, { size: 11, weight: 700, color: K.blue, align: 'right' }); txt(ctx, a2 < 1.7 ? 'Mars' : 'outer planet', X(p0[0]) + 8, Y(p0[1]) + 14, { size: 11, weight: 700, color: K.red });
      ctx.restore(); F.tag(ctx, 'earth', X(e0[0]) - 16, Y(e0[1]) - 14); F.tag(ctx, 'planet', X(p0[0]) + 16, Y(p0[1]) - 14);
      // bottom strip: the planet's path against the stars (east to the left), latitude exaggerated
      var sy = topH + 8, sh = H0 - topH - 16, sx = 14, sw = W0 - 28; ctx.save(); ctx.fillStyle = K.space2; ctx.fillRect(sx, sy, sw, sh); ctx.restore();
      var L = taus.map(lam), lmin = M.min.apply(null, L), lmax = M.max.apply(null, L), pad = (lmax - lmin) * 0.12 + 1e-6, B = taus.map(beta), bmax = M.max.apply(null, B.map(M.abs)) || 1;
      var SX = function (l) { return sx + sw - 20 - (l - lmin + pad) / (lmax - lmin + 2 * pad) * (sw - 40); }, SY = function (b) { return sy + sh / 2 - b / bmax * sh * 0.3; };
      var pts = [], nfine = 120; for (var j = 0; j <= nfine; j++) { var tf = -Tw / 2 + Tw * j / nfine; if (tf > cur) break; pts.push([SX(lam(tf)), SY(beta(tf))]); }
      ctx.save(); ctx.strokeStyle = 'rgba(255,135,135,0.6)'; ctx.lineWidth = 1.6; ctx.beginPath(); pts.forEach(function (q, j) { if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
      taus.forEach(function (tau, i) { if (tau <= cur + 1e-9) { circ(ctx, SX(L[i]), SY(B[i]), 2.6, { fill: K.red }); if (!F.quiet && i % 3 === 0) txt(ctx, String(i / 3 + 1), SX(L[i]), SY(B[i]) - 10, { size: 9.5, color: K.muted, align: 'center' }); } });
      circ(ctx, SX(lam(cur)), SY(beta(cur)), 5, { fill: '#fff' }); F.tag(ctx, 'loop', SX(lam(0)), sy + 12);
      txt(ctx, '← east', sx + 6, sy + sh - 10, { size: 10.5, color: K.muted }); txt(ctx, 'west →', sx + sw - 6, sy + sh - 10, { size: 10.5, color: K.muted, align: 'right' }); txt(ctx, 'the planet against the stars', sx + sw / 2, sy + 11, { size: 10.5, color: K.muted, align: 'center' });
      var back = (lam(cur + 0.002) - lam(cur - 0.002)) < 0; // longitude decreasing = moving west = retrograde
      if (!F.quiet) txt(ctx, back ? 'retrograde: Earth is passing it' : 'moving east (normal)', 10, 14, { size: 11.5, weight: 700, color: back ? K.red : K.acc });
      F.desc('Earth and ' + (a2 < 1.7 ? 'Mars' : 'an outer planet') + ' around the Sun, with lines of sight to the distant stars. ' + (back ? 'Right now the planet appears to move backward (west).' : 'Right now the planet appears to move east, as usual.'));
      F.read('Both planets always move forward around the Sun. Earth, on the inside track, moves faster; while it overtakes the planet (around opposition, the middle of this window), the line of sight swings backward and the planet seems to loop westward against the stars. The loop is an effect of our own motion. (The north–south spread of the loop, from the planet\'s slightly tilted orbit, is exaggerated.)');
    };
    F.now(); return {};
  });

  // =====================================================================================================
  // astro-springneap
  V.register('astro-springneap', function (el, o) {
    var F = frame(el, o, 'Spring and neap tides'), c = F.canvas(1.6, 0.9);
    var A = F.anim({ t0: clamp(num(o.age, 0), 0, 29.53), tmax: 29.53, rate: 2.5, dt: 0.5, tlabel: 'Moon\'s age', tfmt: function (v) { return fm(v, 1) + ' days'; } });
    var hs = 0.46;
    function amp(phi) { return M.sqrt(1 + hs * hs + 2 * hs * M.cos(2 * (phi - PI))); }
    F.draw = function () {
      var ctx = c.ctx, W0 = c.w, H0 = c.h, age = A.t, wide = W0 > 560; space(c, 9);
      var gx = wide ? W0 * 0.62 : 14, gw = wide ? W0 * 0.35 : W0 - 28, gh = wide ? H0 * 0.42 : H0 * 0.26, gy = wide ? H0 * 0.5 : H0 - gh - 26;
      var topA = wide ? H0 : gy - 44, cx = wide ? W0 * 0.3 : W0 * 0.5, cy = wide ? H0 * 0.5 : topA * 0.5 + 8, Re = M.min(wide ? W0 * 0.12 : W0 * 0.16, topA * 0.19), Rm = M.min(wide ? W0 * 0.25 : W0 * 0.42, topA * 0.42);
      txt(ctx, 'sunlight →', 10, 14, { size: 11.5, color: K.gold }); for (var i = 0; i < 4; i++) arrow(ctx, 8, 36 + i * (topA - 70) / 3, 36, 36 + i * (topA - 70) / 3, 'rgba(255,212,121,0.5)', 1.4);
      var phi = PI + age / 29.53 * TAU, hm = Re * 0.32, hsun = hm * hs;
      function shape(f) { ctx.beginPath(); for (var k = 0; k <= 120; k++) { var a = k / 120 * TAU, r = f(a), x = cx + r * M.cos(a), y = cy - r * M.sin(a); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); }
      ctx.save(); shape(function (a) { return Re + hm * M.cos(2 * (a - phi)) + hsun * M.cos(2 * (a - PI)); }); ctx.fillStyle = 'rgba(116,192,252,0.28)'; ctx.fill(); ctx.strokeStyle = K.blue; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.setLineDash([4, 4]); shape(function (a) { return Re + hm * M.cos(2 * (a - phi)); }); ctx.strokeStyle = 'rgba(116,192,252,0.55)'; ctx.lineWidth = 1.2; ctx.stroke(); shape(function (a) { return Re + hsun * M.cos(2 * (a - PI)); }); ctx.strokeStyle = 'rgba(255,212,121,0.6)'; ctx.stroke(); ctx.restore();
      circ(ctx, cx, cy, Re * 0.82, { fill: K.earth, color: 'rgba(116,192,252,0.6)', w: 1 }); F.tag(ctx, 'earth', cx - 14, cy + 14);
      circ(ctx, cx, cy, Rm, { color: K.line, w: 1, dash: [3, 4] }); var mx = cx + Rm * M.cos(phi), my = cy - Rm * M.sin(phi); circ(ctx, mx, my, 9, { fill: K.moonDark }); ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 9, PI / 2, 1.5 * PI); ctx.closePath(); ctx.fillStyle = K.moon; ctx.fill(); ctx.restore(); F.tag(ctx, 'moon', mx + 15, my - 15);
      var Av = amp(phi), kind = Av > 1.35 ? 'spring tide' : Av < 0.62 ? 'neap tide' : 'in between';
      if (!F.quiet) { var kc = kind === 'spring tide' ? K.acc : kind === 'neap tide' ? K.red : K.ink; if (wide) txt(ctx, kind, cx, cy + Re + hm + 22, { size: 12, weight: 800, color: kc, align: 'center' }); else txt(ctx, kind, W0 - 10, 14, { size: 12, weight: 800, color: kc, align: 'right' }); }
      txt(ctx, 'dashed: Moon\'s tide (blue), Sun\'s tide (gold)', 10, wide ? H0 - 10 : gy - 30, { size: 10, color: K.muted });
      // graph of the range through the month
      ctx.save(); ctx.fillStyle = K.space2; ctx.fillRect(gx, gy - 18, gw, gh + 36); ctx.restore();
      var GX = function (d) { return gx + 10 + d / 29.53 * (gw - 20); }, GY = function (v) { return gy + gh - (v - 0.4) / 1.2 * gh; };
      ctx.save(); ctx.strokeStyle = K.gold; ctx.lineWidth = 2; ctx.beginPath(); for (var d = 0; d <= 29.53; d += 0.25) { var y = GY(amp(PI + d / 29.53 * TAU)); if (d) ctx.lineTo(GX(d), y); else ctx.moveTo(GX(d), y); } ctx.stroke(); ctx.restore();
      line(ctx, GX(age), gy - 4, GX(age), gy + gh + 4, K.acc, 1.5, [4, 3]); circ(ctx, GX(age), GY(Av), 4.5, { fill: K.acc });
      txt(ctx, 'tidal range', gx + 8, gy - 8, { size: 10.5, color: K.muted }); [['new', 0], ['1st qtr', 7.38], ['full', 14.77], ['3rd qtr', 22.15]].forEach(function (q) { txt(ctx, q[0], GX(q[1]), gy + gh + 12, { size: 9.5, color: K.muted, align: 'center' }); });
      F.desc('Earth\'s ocean bulges ' + fm(age, 1) + ' days after new moon: ' + kind + '.');
      F.read('The Moon\'s tide (blue dashes) and the Sun\'s weaker tide (gold dashes, about 46% as strong) add up to the ocean shape. When the Sun and Moon line up (new and full moon) the bulges add: <b>spring tides</b>, the largest range. At the quarter moons they are at right angles and partly cancel: <b>neap tides</b>. Bulges hugely exaggerated.');
    };
    F.now(); return {};
  });

  // =====================================================================================================
  // astro-aperture
  V.register('astro-aperture', function (el, o) {
    var F = frame(el, o, 'Two telescope apertures compared'), c = F.canvas(1.6, 0.8);
    var P = { d1: clamp(num(o.d1, 0.2), 0.007, 10), d2: clamp(num(o.d2, 1), 0.007, 10), sep: clamp(num(o.sep, 0.3), 0.02, 5), lam: num(o.lambda, 550) };
    var lg = function (v) { return M.round(M.log10(v) * 100) / 100; }, ex = function (v) { return M.pow(10, v); }, dl = function (v) { return v < 1 ? fm(v * 100, v < 0.1 ? 1 : 0) + ' cm' : fm(v, 1) + ' m'; };
    if (F.live) {
      F.slider({ label: 'Telescope 1 aperture', min: -2.15, max: 1, step: 0.01, value: lg(P.d1), fmt: function (v) { return dl(ex(v)); }, input: function (v) { P.d1 = ex(v); } });
      F.slider({ label: 'Telescope 2 aperture', min: -2.15, max: 1, step: 0.01, value: lg(P.d2), fmt: function (v) { return dl(ex(v)); }, input: function (v) { P.d2 = ex(v); } });
      F.slider({ label: 'Star separation', min: 0.05, max: 3, step: 0.01, value: P.sep, fmt: function (v) { return fm(v, 2) + '″'; }, input: function (v) { P.sep = v; } });
    }
    var drops = [], R0 = rng(11), last = 0;
    var lp = F.live && !V.reduced ? V.loop(F.box, function (dt) { var dmax = M.max(P.d1, P.d2); [P.d1, P.d2].forEach(function (d, i) { var rate = 60 * (d * d) / (dmax * dmax); if (R0() < rate * dt) drops.push({ i: i, a: R0() * TAU, r: M.sqrt(R0()), y: -1 }); }); drops.forEach(function (q) { q.y += dt * 2.5; }); drops = drops.filter(function (q) { return q.y < 0.2; }); last += dt; if (last > 0.05) { last = 0; F.now(); } }) : null;
    void lp;
    F.draw = function () {
      var ctx = c.ctx, W0 = c.w, H0 = c.h, wide = W0 > 560; space(c, 13);
      var colW = W0 / 2, dmax = M.max(P.d1, P.d2), rMax = M.min(colW * 0.3, H0 * 0.17);
      [P.d1, P.d2].forEach(function (d, i) {
        var x0 = colW * (i + 0.5), yA = H0 * 0.27, r = M.max(2.5, rMax * d / dmax), th = 2.5e5 * P.lam * 1e-9 / d, res = P.sep > th;
        circ(ctx, x0, yA, r, { fill: 'rgba(116,192,252,0.18)', color: K.blue, w: 2 }); F.tag(ctx, 'a' + (i + 1), x0 + r + 14, yA - r);
        drops.filter(function (q) { return q.i === i; }).forEach(function (q) { var px = x0 + r * q.r * M.cos(q.a), py = yA + r * q.r * M.sin(q.a) * 0.5 + q.y * H0 * 0.12; circ(ctx, px, py, 1.6, { fill: K.gold }); });
        txt(ctx, 'telescope ' + (i + 1) + ': ' + dl(d), x0, yA - rMax - 14, { size: 11.5, weight: 700, align: 'center' });
        if (!F.quiet) txt(ctx, 'light collected: ' + (i === 0 ? '1×' : fm(M.pow(d / P.d1, 2), M.pow(d / P.d1, 2) < 10 ? 2 : 0) + '×'), x0, yA + rMax + 14, { size: 10.5, color: K.gold, align: 'center' });
        // image of the double star
        var bx = x0 - colW * 0.38, bw = colW * 0.76, by = H0 * 0.52, bh = H0 * (wide ? 0.38 : 0.34), field = M.max(P.sep * 3.2, th * 2.6), pxs = bw / field;
        ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(bx, by, bw, bh); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
        var sig = M.max(1.2, th * pxs / 2.355), stars = [-P.sep / 2, P.sep / 2], bright = M.min(1, 0.25 + 0.75 * d / dmax);
        stars.forEach(function (sx) { var gx = bx + bw / 2 + sx * pxs, gy = by + bh / 2, g = ctx.createRadialGradient(gx, gy, 0, gx, gy, sig * 3); g.addColorStop(0, 'rgba(255,246,213,' + bright + ')'); g.addColorStop(0.35, 'rgba(255,212,121,' + 0.55 * bright + ')'); g.addColorStop(1, 'rgba(255,212,121,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, sig * 3, 0, TAU); ctx.fill(); });
        ctx.restore(); ctx.save(); ctx.strokeStyle = K.line; ctx.strokeRect(bx, by, bw, bh); ctx.restore();
        if (!F.quiet) { if (wide) txt(ctx, (res ? 'two stars resolved' : 'one blur: not resolved') + ' · θ ≈ ' + fm(th, th < 0.1 ? 3 : 2) + '″', x0, by + bh + 13, { size: 10.5, weight: 700, color: res ? K.acc : K.red, align: 'center' }); else { txt(ctx, res ? 'resolved' : 'not resolved', x0, by + bh + 11, { size: 10.5, weight: 700, color: res ? K.acc : K.red, align: 'center' }); txt(ctx, 'θ ≈ ' + fm(th, th < 0.1 ? 3 : 2) + '″', x0, by + bh + 25, { size: 10, color: K.muted, align: 'center' }); } }
      });
      var r12 = M.pow(P.d2 / P.d1, 2), t1 = 2.5e5 * P.lam * 1e-9 / P.d1, t2 = 2.5e5 * P.lam * 1e-9 / P.d2;
      F.desc('Telescope 1 (' + dl(P.d1) + ') and telescope 2 (' + dl(P.d2) + ') looking at a double star ' + fm(P.sep, 2) + ' arcseconds apart.');
      F.read('Light collected goes as the area, $D^2$: telescope 2 gathers <b>' + fm(r12, r12 < 10 ? 2 : 0) + '</b> times as much as telescope 1. The finest detail is about $2.5 \\times 10^{5}\\,\\lambda/D$: <b>' + fm(t1, 3) + '″</b> and <b>' + fm(t2, 3) + '″</b> at ' + P.lam + ' nm. A pair of stars ' + fm(P.sep, 2) + '″ apart is split only by the aperture whose blur is smaller than that. Magnifying a blur does not split it.');
    };
    F.now(); return {};
  });

  // =====================================================================================================
  // astro-disk
  V.register('astro-disk', function (el, o) {
    var F = frame(el, o, 'A spinning cloud collapsing into a disk'), c = F.canvas(1.6, 0.95);
    var A = F.anim({ t0: num(o.t, 0), tmax: 1, rate: 0.09, dt: 0.02, tlabel: 'Time', tfmt: function (v) { return v < 0.5 ? 'collapsing' : 'disk'; }, loop: false });
    var R0 = rng(21), P = []; for (var i = 0; i < 520; i++) { var u = R0() * 2 - 1, ph = R0() * TAU, rr = M.cbrt(R0()), s = M.sqrt(1 - u * u); P.push({ x: rr * s * M.cos(ph), y: rr * s * M.sin(ph), z: rr * u, k: R0() }); }
    function sm(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    function scaleAt(t) { return 1.6 - 0.75 * sm(t / 0.5); }
    function spinAt(t) { var a = 0, n = 60; for (var j = 0; j < n; j++) { var tt = (j + 0.5) / n * M.min(t, 1); var s = scaleAt(tt) / 1.6; a += 1.2 / (s * s) * M.min(t, 1) / n; } return a * 4; }
    F.draw = function () {
      var ctx = c.ctx, W0 = c.w, H0 = c.h, t = A.t; space(c, 17);
      var cx = W0 / 2, cy = H0 * 0.5, R = M.min(W0 * 0.5, H0 * 1.0), tilt = 70 * DEG, s = scaleAt(t), flat = 1 - 0.93 * sm((t - 0.15) / 0.4), spin = spinAt(t), frost = 0.42, disk = t > 0.5, grow = sm((t - 0.6) / 0.4);
      var pts = P.map(function (q) { var x = q.x * s, y = q.y * s, z = q.z * s * flat; if (disk) { var rad = M.hypot(q.x, q.y); x = q.x / (rad || 1) * M.pow(rad, 0.9) * s * 1.05; y = q.y / (rad || 1) * M.pow(rad, 0.9) * s * 1.05; } var ca = M.cos(spin * (0.4 + 0.6 / M.max(0.3, M.hypot(x, y)))), sa = M.sin(spin * (0.4 + 0.6 / M.max(0.3, M.hypot(x, y)))), xr = x * ca - y * sa, yr = x * sa + y * ca; return { X: cx + xr * R, Y: cy - (z * M.sin(tilt) - yr * M.cos(tilt)) * R * 0.95, d: yr, r: M.hypot(xr, yr), q: q }; });
      pts.sort(function (a, b) { return b.d - a.d; });
      var hz = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * s); hz.addColorStop(0, 'rgba(120,150,200,' + (disk ? 0.14 : 0.2) + ')'); hz.addColorStop(1, 'rgba(120,150,200,0)'); ctx.save(); ctx.translate(cx, cy); ctx.scale(1, M.max(0.3, flat * M.sin(tilt) + M.cos(tilt)) * 0.95); ctx.translate(-cx, -cy); ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(cx, cy, R * s, 0, TAU); ctx.fill(); ctx.restore();
      if (disk) { ctx.save(); ctx.strokeStyle = 'rgba(255,212,121,0.55)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(cx, cy, frost * s * 1.05 * R, frost * s * 1.05 * R * M.cos(tilt) * 0.95, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
      pts.forEach(function (p) { var inner = p.r < frost * s * 1.05, col = !disk ? 'rgba(175,200,235,0.75)' : inner ? 'rgba(214,160,110,0.85)' : (p.q.k > 0.5 ? 'rgba(170,220,255,0.9)' : 'rgba(214,160,110,0.7)'); var sz = (disk ? 1.3 : 1.6) + (disk && p.q.k > 0.93 ? 2.6 * grow : 0); circ(ctx, p.X, p.Y, sz, { fill: col }); });
      var sunR = 3 + 6 * sm(t / 0.5), g = ctx.createRadialGradient(cx, cy, 1, cx, cy, sunR * 2.6); g.addColorStop(0, '#fff6d5'); g.addColorStop(0.45, '#ffd479'); g.addColorStop(1, 'rgba(255,212,121,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, sunR * 2.6, 0, TAU); ctx.fill(); F.tag(ctx, 'sun', cx + 16, cy - 18);
      if (disk) { var fx = cx + frost * s * 1.05 * R, fy = cy; F.tag(ctx, 'frost', fx + 12, fy - 12); if (!F.quiet) { txt(ctx, 'frost line', fx + 4, fy + 14, { size: 11, weight: 700, color: K.gold }); txt(ctx, 'rock and metal', cx, cy + frost * s * 1.05 * R * M.cos(tilt) * 0.95 + 16, { size: 11, weight: 700, color: '#e0a878', align: 'center' }); txt(ctx, 'ices freeze too', cx - R * 0.72 * s, cy - R * 0.36 * s * M.cos(tilt) - 14, { size: 11, weight: 700, color: K.blue, align: 'center' }); } }
      txt(ctx, t < 0.5 ? 'cloud collapsing: spinning faster, flattening' : t < 0.65 ? 'a flat, spinning disk around the young Sun' : 'grains stick together into planetesimals', 10, 14, { size: 11.5, weight: 700, color: K.acc });
      F.desc(t < 0.5 ? 'A spinning cloud of gas and dust shrinking and flattening.' : 'A disk around the young Sun, with rocky grains inside the frost line and icy ones outside.');
      F.read('As the cloud shrinks it spins faster (angular momentum is kept), and spinning keeps it from collapsing along its equator, so it flattens into a disk. The Sun forms at the center. Close in, only rock and metal can condense; beyond the <b>frost line</b> ices freeze too, giving much more solid material, so giant planets form out there. (Sizes and speeds are not to scale.)');
    };
    F.now(); return {};
  });

  // =====================================================================================================
  // astro-galaxies
  var GNAME = { E0: 'elliptical E0', E1: 'elliptical E1', E2: 'elliptical E2', E3: 'elliptical E3', E4: 'elliptical E4', E5: 'elliptical E5', E6: 'elliptical E6', E7: 'elliptical E7', S0: 'lenticular S0', Sa: 'spiral Sa', Sb: 'spiral Sb', Sc: 'spiral Sc', SBa: 'barred spiral SBa', SBb: 'barred spiral SBb', SBc: 'barred spiral SBc', Irr: 'irregular' };
  V.register('astro-galaxies', function (el, o) {
    var F = frame(el, o, 'Kinds of galaxies'), types = (Array.isArray(o.types) ? o.types : ['E0', 'E5', 'Sb', 'SBb', 'Sc', 'Irr']).filter(function (x) { return GNAME[x]; }).slice(0, 8);
    var c = F.canvas(types.length > 4 ? 1.6 : 1.9, types.length > 4 ? 0.7 : 0.95);
    function blob(ctx, x, y, r, col, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    function draw1(ctx, ty, x, y, R, seed) {
      var R1 = rng(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (ty[0] === 'E') { var n = +ty[1], ba = 1 - n / 10; ctx.translate(x, y); ctx.rotate(-0.4); ctx.scale(1, ba); for (var k = 6; k >= 1; k--) blob(ctx, 0, 0, R * k / 6, '255,214,170', 0.22); }
      else if (ty === 'Irr') { for (var k2 = 0; k2 < 14; k2++) blob(ctx, x + (R1() - 0.5) * R * 1.3, y + (R1() - 0.5) * R * 0.9, R * (0.15 + R1() * 0.3), R1() > 0.5 ? '170,200,255' : '255,180,210', 0.35); }
      else {
        var barred = ty[1] === 'B', cls = ty[ty.length - 1], tight = cls === 'a' ? 0.18 : cls === 'b' ? 0.3 : 0.45, bulge = ty === 'S0' ? 0.55 : cls === 'a' ? 0.42 : cls === 'b' ? 0.3 : 0.18, tilt = 0.55;
        ctx.translate(x, y); ctx.scale(1, tilt);
        blob(ctx, 0, 0, R * 1.05, '200,215,240', 0.18);
        if (ty !== 'S0') { var r0 = barred ? R * 0.42 : R * 0.15; for (var arm = 0; arm < 2; arm++) for (var j = 0; j < 160; j++) { var u = j / 160, th = arm * PI + u * 3.2 * PI * (0.6 / (tight + 0.2)) * 0.35 + (barred ? 0 : 0.3), rr = r0 + (R - r0) * u, sc = (R1() - 0.5) * R * 0.08 * (1 + u); blob(ctx, rr * M.cos(th) + sc, rr * M.sin(th) + sc, 2.2 + R1() * 2.5, R1() > 0.75 ? '255,170,200' : '160,200,255', 0.55); } }
        if (barred) { ctx.save(); ctx.fillStyle = 'rgba(255,222,180,0.35)'; ctx.beginPath(); ctx.ellipse(0, 0, R * 0.45, R * 0.1, 0, 0, TAU); ctx.fill(); ctx.restore(); }
        blob(ctx, 0, 0, R * bulge, '255,226,180', 0.75);
      }
      ctx.restore();
    }
    F.draw = function () {
      var ctx = c.ctx, W0 = c.w, H0 = c.h, n = types.length, cols = W0 > 560 ? (n <= 4 ? n : n % 3 === 0 ? 3 : 4) : M.min(n, 2), rows = M.ceil(n / cols), cw = W0 / cols, ch = H0 / rows; space(c, 23);
      types.forEach(function (ty, i) {
        var cx = cw * (i % cols + 0.5), cy = ch * (M.floor(i / cols) + 0.45), R = M.min(cw, ch) * 0.34;
        draw1(ctx, ty, cx, cy, R, 31 + i * 7); F.tag(ctx, ty, cw * (i % cols) + 18, ch * M.floor(i / cols) + 18);
        if (!F.quiet) txt(ctx, GNAME[ty], cx, ch * (M.floor(i / cols) + 1) - 12, { size: 11, weight: 700, align: 'center', color: K.ink });
      });
      F.desc('Sketches of galaxies: ' + (F.quiet ? n + ' galaxies of different types.' : types.map(function (t) { return GNAME[t]; }).join(', ') + '.'));
      F.read('Ellipticals (E0 round to E7 flattest) are smooth balls of old, yellow-red stars with little gas. Spirals have a bulge and a flat disk with arms of gas and young blue stars; from a to c the bulge shrinks and the arms open up. Barred spirals have arms starting from a central bar. Irregulars have no regular shape. (Sketches, not photographs.)');
    };
    F.now(); return {};
  });

  // =====================================================================================================
  // astro-pulsar
  V.register('astro-pulsar', function (el, o) {
    var F = frame(el, o, 'A pulsar: a spinning neutron star sweeping two beams'), c = F.canvas(1.5, 0.85), P = { tilt: clamp(num(o.tilt, 55), 0, 90), view: clamp(num(o.view, 60), 0, 90), per: M.max(0.001, num(o.period, 1)) };
    var A = F.anim({ t0: num(o.t, 0), tmax: 3, rate: 0.4, dt: 0.02, tlabel: 'Rotations', tfmt: function (v) { return fm(v, 2); } });
    if (F.live) F.slider({ label: 'Magnetic axis tilt', min: 0, max: 90, step: 1, value: P.tilt, fmt: function (v) { return fm(v, 0) + '°'; }, input: function (v) { P.tilt = v; } });
    var BW = 15 * DEG;
    function beamAng(rot, south) { var a = P.tilt * DEG, w = TAU * rot, m = [M.sin(a) * M.cos(w), M.sin(a) * M.sin(w), M.cos(a)]; if (south) m = m.map(function (v) { return -v; }); var z = P.view * DEG, n = [M.sin(z), 0, M.cos(z)]; return { m: m, ang: M.acos(clamp(m[0] * n[0] + m[1] * n[1] + m[2] * n[2], -1, 1)) }; }
    function inten(rot) { var a = beamAng(rot, false).ang, b = beamAng(rot, true).ang; return M.exp(-M.pow(a / (BW * 0.7), 2)) + M.exp(-M.pow(b / (BW * 0.7), 2)); }
    F.draw = function () {
      var ctx = c.ctx, W0 = c.w, H0 = c.h, rot = A.t; space(c, 29);
      var gh = H0 * 0.26, cx = W0 * 0.4, cy = (H0 - gh) * 0.5, Rs = M.min(W0, H0 - gh) * 0.07, L = M.min(W0 * 0.34, (H0 - gh) * 0.46);
      var P3 = function (v) { return [cx + (v[0] * 0.95 + v[1] * 0.25) * L, cy - (v[2] * 0.95 - v[1] * 0.12) * L]; };
      line(ctx, cx, cy - L * 1.02, cx, cy + L * 1.02, 'rgba(219,231,239,0.35)', 1.2, [5, 4]); txt(ctx, 'spin axis', cx + 6, cy - L * 1.02 + 6, { size: 10.5, color: K.muted });
      var z = P.view * DEG, ex = cx + M.sin(z) * L * 1.15, ey = cy - M.cos(z) * L * 1.15; arrow(ctx, cx + M.sin(z) * L * 0.75, cy - M.cos(z) * L * 0.75, ex, ey, K.blue, 2); txt(ctx, 'to Earth', ex + 4, ey - 8, { size: 11, weight: 700, color: K.blue }); F.tag(ctx, 'earth', ex + 14, ey + 12);
      [false, true].forEach(function (south) { var b = beamAng(rot, south), tip = P3(b.m), perp = [-(tip[1] - cy), tip[0] - cx], pl = M.hypot(perp[0], perp[1]) || 1, wv = M.tan(BW) * M.hypot(tip[0] - cx, tip[1] - cy); ctx.save(); var g = ctx.createLinearGradient(cx, cy, tip[0], tip[1]); g.addColorStop(0, 'rgba(177,151,252,0.75)'); g.addColorStop(1, 'rgba(177,151,252,0.05)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tip[0] + perp[0] / pl * wv, tip[1] + perp[1] / pl * wv); ctx.lineTo(tip[0] - perp[0] / pl * wv, tip[1] - perp[1] / pl * wv); ctx.closePath(); ctx.fill(); ctx.restore(); if (!south) F.tag(ctx, 'beam', tip[0], tip[1] - 14); });
      var g2 = ctx.createRadialGradient(cx - Rs * 0.3, cy - Rs * 0.3, 1, cx, cy, Rs); g2.addColorStop(0, '#ffffff'); g2.addColorStop(1, '#8fb1ea'); circ(ctx, cx, cy, Rs, { fill: g2 }); F.tag(ctx, 'star', cx - Rs - 12, cy + Rs + 6);
      var I = inten(rot); if (I > 0.3) { circ(ctx, ex, ey, 10 + 10 * M.min(1, I), { fill: 'rgba(116,192,252,' + (0.25 * M.min(1, I)) + ')' }); }
      // detector trace
      var gx = 14, gy = H0 - gh + 4, gw = W0 - 28, gH = gh - 22; ctx.save(); ctx.fillStyle = K.space2; ctx.fillRect(gx, gy, gw, gH + 14); ctx.restore();
      ctx.save(); ctx.strokeStyle = K.blue; ctx.lineWidth = 1.8; ctx.beginPath(); for (var k = 0; k <= 300; k++) { var r2 = k / 300 * 3, yv = gy + gH - 4 - M.min(1.2, inten(r2)) / 1.2 * (gH - 14); if (k) ctx.lineTo(gx + k / 300 * gw, yv); else ctx.moveTo(gx, yv); } ctx.stroke(); ctx.restore();
      line(ctx, gx + rot / 3 * gw, gy + 2, gx + rot / 3 * gw, gy + gH, K.acc, 1.4, [4, 3]); txt(ctx, 'signal at the detector', gx + 6, gy + 10, { size: 10.5, color: K.muted }); txt(ctx, '1 rotation', gx + gw / 3, gy + gH + 7, { size: 9.5, color: K.muted, align: 'center' });
      var seen = [0, 1].some(function (s) { var mn = 1e9; for (var k2 = 0; k2 < 90; k2++) mn = M.min(mn, beamAng(k2 / 90, !!s).ang); return mn < BW; });
      F.desc('A neutron star spinning with its magnetic axis tilted ' + fm(P.tilt, 0) + ' degrees; ' + (seen ? 'its beam sweeps across Earth once per turn.' : 'its beams miss Earth, so no pulses are seen.'));
      F.read('The beams come out along the magnetic axis, which is tilted from the spin axis, so they sweep around like a lighthouse\'s. ' + (seen ? 'Each time one crosses our line of sight we get a pulse: one per rotation' + (!F.quiet ? (P.per < 1 ? ', ' + fm(1 / P.per, 0) + ' times a second for this star' : '') : '') + '.' : 'At this tilt the beams never cross our line of sight: the star is there, but we see no pulses.') + ' The star does not swell or shrink.');
    };
    F.now(); return {};
  });
})(window, document);
