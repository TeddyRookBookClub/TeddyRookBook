/* Physics Ladder visuals for Astrophysics (course key "astrophys"), registered on window.MathLadder.viz.
   Load after static/math/viz/core.js. Standalone: they use only core.js (not the ph- kit), inject their own CSS, follow
   the site's light or dark theme, work with mouse, touch and keyboard (sliders and buttons), keep a live text readout,
   and set an aria-label that describes the picture in words. Options every one takes: task (a short instruction above
   the canvas), label (the aria-label), quiet: true (hide numbers that would give a problem's answer away),
   interactive: false (a frozen picture with no controls, for problems).

   astrophys-filters  A blackbody spectrum seen through the Johnson B (about 440 nm) and V (about 550 nm) filters, with
     optional interstellar dust. The color index is computed from the curve (zero point: a 9,600 K blackbody, like Vega,
     has B − V = 0). Dust follows A_λ = A_V (550 nm/λ)^1.25, which gives A_V ≈ 3.1 E(B − V) as for Milky Way dust.
     opts: T (5772 K), Av (0 mag), dust (false: show the dust slider), Tmin (2500), Tmax (40000), xrange ([250, 950] nm).

   astrophys-eclipse  An eclipsing binary (or a transiting planet) seen edge-on, with its light curve. Disks of uniform
     brightness; surface brightness ∝ T⁴ (no limb darkening). The primary eclipse is the deeper one.
     opts: R1 (1), R2 (0.5) in any common unit, T1 (6000 K), T2 (4000 K; 0 = a dark planet), phase (0.1, 0–1; 0 =
     star 2 in front), b (0, the impact parameter in units of R1: the smallest projected distance between centers),
     sep (4, the orbit's radius in units of R1 + R2, only for the drawing), play (false), names (['star 1', 'star 2']).
     Tags (show letters on the light curve): tags: {primary: 'A', secondary: 'B'}. shift (0; 0.25 when quiet and not
     interactive): the light curve is drawn against phase + shift, so both dips can sit away from the edges.

   astrophys-chirp  Two compact objects spiraling together (Newtonian inspiral, then a short ringdown), the gravitational
     wave they send out (strain against time: the "chirp"), and a ring of free particles stretched and squeezed as the
     wave passes (the effect is magnified about 10^20 times so it can be seen).
     opts: m1 (36), m2 (29) in solar masses, t (time before merger shown at the start, s), play (false).

   astrophys-pulsar  A neutron star as a lighthouse: the magnetic axis, tilted from the spin axis, carries two radio
     beams around once per turn; Earth sees a pulse whenever a beam sweeps across its direction. Below, the pulse
     train over three turns. The animation runs in slow motion (one turn every two seconds).
     opts: P (0.0337 s, the real period, for the readout), Pdot (optional, s/s: adds the spin-down power for
     I = 10^38 kg·m²), tilt (40°, magnetic axis from the spin axis), view (60°, Earth's direction from the spin
     axis), beam (12°, beam half-width), play (false).

   astrophys-plot  A clean labeled plot of a few curves (CAS expressions in x), for physical relations: labels sit on
     the curves, optional shaded bands and vertical markers, measured points, and an optional cursor slider with
     live readouts computed from expressions.
     opts: xmin, xmax, ymin, ymax; xlabel, ylabel; xpow / ypow (true: the axis value is a log₁₀, so ticks show 10ⁿ);
     curves: [{f: 'expression in x', label, color ('blue'|'red'|'green'|'gold'|'purple'|'orange'|'teal'|'pink'),
     dash: true, from, to, at (x where the label sits)}]; points: [{x, y, label}]; vlines: [{x, label}];
     bands: [{from, to, label, color}]; cursor: {label, min, max, value, step, fmt: 'pow'|'num', readout:
     [{label, f: 'expression in x', d (decimals) or sig (significant figures), unit}]}; height (px).

   astrophys-s2  A star on a Kepler ellipse around the Milky Way's central black hole (default: the star S2), drawn to
     scale with the black hole at a focus, a short trail, a scale bar and live readouts of distance and speed
     (vis-viva). The animation runs at about a tenth of an orbit per second.
     opts: a (1030 AU), e (0.886), M (4.2e6 solar masses), t (0.25, the starting time as a fraction of the period
     after closest approach), play (true).                                                                          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/astrophys.js: load viz/core.js first'); return; }
  var M = Math, PI = M.PI, TAU = 2 * PI;

  // ---------------------------------------------------------------- shared helpers
  (function css() {
    if (D.getElementById('apx-css')) return;
    var s = D.createElement('style'); s.id = 'apx-css';
    s.textContent = '.apx{--apx-acc:#2d5596}html[data-theme="dark"] .apx{--apx-acc:#8fb1ea}' +
      '.apx .apx-task{margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}' +
      '.apx .ml-cv{box-shadow:inset 0 0 0 1px var(--mv-line)}' +
      '.apx .ml-sl input{accent-color:var(--apx-acc)}' +
      '.apx .ml-btn.pri{background:var(--apx-acc);border-color:var(--apx-acc);color:#fff}html[data-theme="dark"] .apx .ml-btn.pri{color:#0f1a24}' +
      '.apx .apx-stat{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:.4rem;margin:.6rem 0 0}' +
      '.apx .apx-stat>div{background:var(--mv-card);border:1px solid var(--mv-line);border-left:3px solid var(--apx-acc);border-radius:9px;padding:.3rem .55rem;font-size:.78rem;color:var(--mv-muted);line-height:1.3;min-width:0}' +
      '.apx .apx-stat b{display:block;color:var(--mv-ink);font-size:1rem;font-weight:650;font-variant-numeric:tabular-nums;overflow-wrap:break-word}' +
      '.apx .apx-stat:empty{display:none}.apx .ml-ctl:empty{display:none}.apx .ml-readout{overflow-wrap:break-word}.apx .ml-readout:empty{display:none}' +
      '.apx .apx-key{display:flex;flex-wrap:wrap;gap:.25rem .9rem;margin:.45rem 0 0;font-size:.8rem;color:var(--mv-muted)}.apx .apx-key:empty{display:none}' +
      '.apx .apx-key i{display:inline-block;width:1.2rem;height:.22rem;border-radius:2px;background:var(--c);vertical-align:.22em;margin-right:.35rem}' +
      '.apx .apx-key i.dot{background:repeating-linear-gradient(90deg,var(--c) 0 3px,transparent 3px 6px)}';
    D.head.appendChild(s);
  })();
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in o || {}) if (o[k] !== undefined && o[k] !== null) r[k] = o[k]; return r; }
  function num(v, d) { var x = typeof v === 'number' ? v : parseFloat(v); return isFinite(x) ? x : d; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fm(v, d) { return V.fmt(v, d); }
  function sci(x, n) { // "3.2 × 10⁵" style text for the canvas and readouts
    if (x === 0) return '0'; var e = M.floor(M.log10(M.abs(x))); if (e >= -2 && e < 5) return fm(+x.toPrecision(n || 3), 3);
    var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    var m = (x / M.pow(10, e)).toFixed((n || 3) - 1); return m + ' × 10' + String(e).split('').map(function (c) { return SUP[c]; }).join('');
  }
  function commas(x) { return String(M.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function frame(e, o, label) {
    e.classList.add('apx'); e.setAttribute('role', 'group');
    var F = { o: o };
    if (o.task && o.interactive !== false) { F.task = V.el('p', 'apx-task', o.task); e.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (er) { } }
    F.box = V.el('div', 'apx-box'); e.appendChild(F.box);
    F.ctl = V.el('div', 'ml-ctl'); e.appendChild(F.ctl);
    F.stat = V.el('div', 'apx-stat'); e.appendChild(F.stat);
    F.out = V.readout(e);
    F.label = function (s) { e.setAttribute('aria-label', o.label || s); };
    F.label(label);
    F.stats = function (rows) { F.stat.innerHTML = rows.map(function (r) { return '<div>' + r[0] + '<b>' + r[1] + '</b></div>'; }).join(''); };
    return F;
  }
  function txt(ctx, s, x, y, q) {
    q = q || {}; var k = V.colors(); ctx.save();
    ctx.font = (q.bold ? '700 ' : '') + (q.size || 12) + 'px system-ui,-apple-system,"Segoe UI",sans-serif';
    ctx.textAlign = q.align || 'left'; ctx.textBaseline = q.base || 'middle';
    if (q.halo) { ctx.lineWidth = 3.5; ctx.strokeStyle = q.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = q.color || k.ink; ctx.fillText(s, x, y); ctx.restore();
  }
  function stars(ctx, w, h, n) { // a fixed scatter of faint background stars (a hash, so it does not form lines)
    for (var i = 0; i < n; i++) {
      var hx = M.sin(i * 12.9898 + 4.1) * 43758.5453, hy = M.sin(i * 78.233 + 1.7) * 24634.6345;
      ctx.fillStyle = 'rgba(219,231,239,' + (0.12 + (i % 5) * 0.07) + ')'; ctx.fillRect((hx - M.floor(hx)) * w, (hy - M.floor(hy)) * h, 1.2, 1.2);
    }
  }
  function line(ctx, x1, y1, x2, y2, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function rgba(hex, a) { var v = parseInt(String(hex).slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  // approximate sRGB color of a blackbody (a standard fit to the CIE colors; 1000–40000 K)
  function bbRGB(T) {
    var t = clamp(T, 1000, 40000) / 100, r, g, b;
    if (t <= 66) { r = 255; g = 99.4708025861 * M.log(t) - 161.1195681661; b = t <= 19 ? 0 : 138.5177312231 * M.log(t - 10) - 305.0447927307; }
    else { r = 329.698727446 * M.pow(t - 60, -0.1332047592); g = 288.1221695283 * M.pow(t - 60, -0.0755148492); b = 255; }
    return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
  }
  function rgbStr(c, a) { return 'rgba(' + M.round(c[0]) + ',' + M.round(c[1]) + ',' + M.round(c[2]) + ',' + (a == null ? 1 : a) + ')'; }
  var HCK = 1.4388e-2; // hc/k in m·K
  function planck(lnm, T) { var l = lnm * 1e-9, x = HCK / (l * T); return x > 700 ? 0 : 1 / (M.pow(l, 5) * (M.exp(x) - 1)); } // relative B_λ

  // ---------------------------------------------------------------- astrophys-filters
  // Johnson-like passbands (approximate, smooth): B centered 440 nm, V centered 550 nm
  function passB(l) { var x = (l - 440) / 48; return M.exp(-0.5 * x * x * x * x / 2); }
  function passV(l) { var x = (l - 548) / 44; return M.exp(-0.5 * x * x * x * x / 2); }
  function bandFlux(T, Av, pass) { var s = 0; for (var l = 330; l <= 700; l += 2) s += planck(l, T) * pass(l) * M.pow(10, -0.4 * Av * M.pow(550 / l, 1.25)); return s; }
  var BV0 = 0; BV0 = -2.5 * M.log10(bandFlux(9600, 0, passB) / bandFlux(9600, 0, passV));
  function colorBV(T, Av) { return -2.5 * M.log10(bandFlux(T, Av || 0, passB) / bandFlux(T, Av || 0, passV)) - BV0; }
  ML.__apxColor = colorBV; // for tests

  V.register('astrophys-filters', function (e, o) {
    o = opt(o, { T: 5772, Av: 0, dust: false, Tmin: 2500, Tmax: 40000, xrange: [250, 950] });
    var T = clamp(num(o.T, 5772), 1000, 60000), Av = clamp(num(o.Av, 0), 0, 6), live = o.interactive !== false, quiet = !!o.quiet || o.readout === false;
    var x0 = num(o.xrange[0], 250), x1 = num(o.xrange[1], 950);
    var F = frame(e, o, 'Blackbody spectrum through the B and V filters'), c = V.canvas(F.box, { aspect: 1.75, max: 380, min: 230 }), key = V.el('div', 'apx-key'); F.box.appendChild(key);
    if (live) {
      V.slider(F.ctl, { label: 'Temperature', min: M.log10(num(o.Tmin, 2500)), max: M.log10(num(o.Tmax, 40000)), step: 0.002, value: M.log10(T), fmt: function (v) { var t = M.pow(10, v); return commas(M.abs(t - T) < 0.003 * T ? T : sig2(t)) + ' K'; }, input: function (v) { T = sig2(M.pow(10, v)); draw(); } });
      if (o.dust) V.slider(F.ctl, { label: 'Dust, Aᵥ', min: 0, max: 4, step: 0.1, value: Av, fmt: function (v) { return fm(v, 1) + ' mag'; }, input: function (v) { Av = v; draw(); } });
    }
    function sig2(x) { return +x.toPrecision(3); }
    function draw() {
      var ctx = c.ctx, k = V.colors(), w = c.w, h = c.h, padL = 38, padR = 12, padT = 22, padB = 46;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var X = function (l) { return padL + (l - x0) / (x1 - x0) * (w - padL - padR); };
      var ymax = 0, l; for (l = x0; l <= x1; l += 2) ymax = M.max(ymax, planck(l, T));
      ymax *= 1.12;
      var Y = function (v) { return h - padB - v / ymax * (h - padT - padB); };
      // rainbow strip of the visible band under the axis
      for (l = 380; l < 750; l += 2) { ctx.fillStyle = wlColor(l, 0.9); ctx.fillRect(X(l), h - padB + 4, X(l + 2) - X(l) + 0.6, 7); }
      // filter bands
      [[passB, k.blue, 'B'], [passV, k.green, 'V']].forEach(function (b) {
        ctx.save(); ctx.fillStyle = rgba(b[1], 0.14); ctx.strokeStyle = rgba(b[1], 0.7); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(330), Y(0));
        for (var q = 330; q <= 700; q += 2) ctx.lineTo(X(q), Y(b[0](q) * ymax / 1.12 * 0.98)); ctx.lineTo(X(700), Y(0)); ctx.closePath(); ctx.fill(); ctx.setLineDash([3, 3]); ctx.stroke(); ctx.restore();
        var cx = b[2] === 'B' ? 440 : 548, narrow = w < 520; txt(ctx, narrow ? b[2] : b[2] + ' filter', X(cx) + (narrow ? 0 : b[2] === 'B' ? -14 : 14), padT - 8, { align: 'center', bold: true, size: 12, color: b[1] });
      });
      // axes
      line(ctx, padL, h - padB, w - padR, h - padB, k.axis, 1.2); line(ctx, padL, padT - 2, padL, h - padB, k.axis, 1.2);
      for (l = M.ceil(x0 / 100) * 100; l <= x1; l += 100) { line(ctx, X(l), h - padB, X(l), h - padB + 3, k.axis, 1); txt(ctx, String(l), X(l), h - padB + 20, { align: 'center', size: 10.5, color: k.muted }); }
      txt(ctx, 'wavelength (nm)', w - padR, h - 9, { align: 'right', size: 11, color: k.muted });
      ctx.save(); ctx.translate(12, (padT + h - padB) / 2); ctx.rotate(-PI / 2); txt(ctx, 'flux per nm (relative)', 0, 0, { align: 'center', size: 11, color: k.muted }); ctx.restore();
      // curves: without dust (dashed when dust is present) and with dust
      var col = k.red;
      function curve(av, color, width, dash) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash); ctx.beginPath(); for (var q = x0; q <= x1; q += 2) { var v = planck(q, T) * M.pow(10, -0.4 * av * M.pow(550 / q, 1.25)); if (q === x0) ctx.moveTo(X(q), Y(v)); else ctx.lineTo(X(q), Y(v)); } ctx.stroke(); ctx.restore(); }
      var dmax = 0; for (l = x0; l <= x1; l += 2) dmax = M.max(dmax, planck(l, T) * M.pow(10, -0.4 * Av * M.pow(550 / l, 1.25)));
      function curveS(av, sc, color, width, dash) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash); ctx.beginPath(); for (var q = x0; q <= x1; q += 2) { var v = sc * planck(q, T) * M.pow(10, -0.4 * av * M.pow(550 / q, 1.25)); if (q === x0) ctx.moveTo(X(q), Y(v)); else ctx.lineTo(X(q), Y(v)); } ctx.stroke(); ctx.restore(); }
      if (Av > 0) { curve(0, rgba(col, 0.6), 1.8, [6, 4]); curve(Av, k.purple, 2.8); curveS(Av, ymax / 1.12 / dmax, rgba(k.purple, 0.7), 1.6, [2, 3]); } else curve(0, col, 2.6);
      // star swatch(es)
      var rgb = bbRGB(T), rgbD = reddened(rgb, Av), sx = w - padR - 24, sy = padT + 22;
      swatch(ctx, sx, sy, 13, rgbD, Av > 0 ? 'seen' : 'color');
      if (Av > 0) swatch(ctx, sx - 40, sy, 13, rgb, 'true');
      if (key) key.innerHTML = Av > 0 ? '<span><i style="--c:' + rgba(col, 0.7) + '"></i>no dust</span><span><i style="--c:' + k.purple + '"></i>through the dust</span><span><i class="dot" style="--c:' + k.purple + '"></i>same, scaled up to compare shapes</span>' : '<span><i style="--c:' + col + '"></i>blackbody spectrum</span><span><i style="--c:' + k.blue + '"></i>B band</span><span><i style="--c:' + k.green + '"></i>V band</span>';
      var bvTrue = colorBV(T, 0), bvObs = colorBV(T, Av), peak = 2.898e-3 / T * 1e9;
      var rows = [['temperature', commas(T) + ' K'], ['peak (Wien)', peak < 10000 ? fm(peak, 0) + ' nm' : sci(peak) + ' nm']];
      if (!quiet) { rows.push([Av > 0 ? 'true B − V (blackbody)' : 'B − V (blackbody)', fm(bvTrue, 2)]); if (Av > 0) { rows.push(['observed B − V', fm(bvObs, 2)]); rows.push(['E(B − V)', fm(bvObs - bvTrue, 2)]); rows.push(['V flux kept', fm(100 * M.pow(10, -0.4 * Av), 0) + '%']); } }
      F.stats(rows);
      var hot = bvTrue < 0.3 ? 'more of its light through B than a Sun-like star: a small (or negative) B − V, a hot star' : bvTrue < 0.9 ? 'light about evenly through both filters' : 'much more light through V than through B: a large B − V, a cool red star';
      F.out.set(quiet ? 'A ' + commas(T) + ' K blackbody seen through the B and V filters' + (Av > 0 ? ', dimmed by ' + fm(Av, 1) + ' magnitudes of dust.' : '.') :
        'At ' + commas(T) + ' K the star sends ' + hot + '. ' + (Av > 0 ? 'Dust removes more blue than red, so the observed $B - V$ (' + fm(bvObs, 2) + ') is larger than the true value (' + fm(bvTrue, 2) + '): the star looks redder, as if cooler. The reddening $E(B - V) = ' + fm(bvObs - bvTrue, 2) + '$, and $A_V/E(B - V) \\approx 3.1$. ' : '') + 'These colors are for a perfect blackbody. Real stars absorb extra blue light in the many lines of their atmospheres, so a real star of the same temperature has a somewhat larger $B - V$ (the Sun\'s is 0.65).');
      F.label('Spectrum of a ' + commas(T) + ' kelvin blackbody with the B and V filter bands' + (Av > 0 ? ', dimmed and reddened by ' + fm(Av, 1) + ' magnitudes of dust' : '') + (quiet ? '' : '; B minus V is ' + fm(bvObs, 2)) + '.');
    }
    function swatch(ctx, x, y, r, rgb, lab) {
      var k = V.colors(), g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
      g.addColorStop(0, rgbStr([M.min(255, rgb[0] + 40), M.min(255, rgb[1] + 40), M.min(255, rgb[2] + 40)])); g.addColorStop(1, rgbStr(rgb));
      ctx.save(); ctx.fillStyle = g; ctx.strokeStyle = k.line || k.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = k.muted; ctx.stroke(); ctx.restore();
      txt(ctx, lab, x, y + r + 9, { align: 'center', size: 10, color: k.muted });
    }
    function reddened(rgb, av) { if (!(av > 0)) return rgb; var t = [M.pow(10, -0.4 * av * M.pow(550 / 610, 1.25)), M.pow(10, -0.4 * av), M.pow(10, -0.4 * av * M.pow(550 / 455, 1.25))], c2 = [rgb[0] * t[0], rgb[1] * t[1], rgb[2] * t[2]], mx = M.max(c2[0], c2[1], c2[2]) || 1; return c2.map(function (v) { return v / mx * 255; }); }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
  function wlColor(l, a) { // approximate color of a wavelength (nm) for the rainbow strip
    var r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
    var f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (750 - l) / 50 : 1;
    return 'rgba(' + M.round(255 * r * f) + ',' + M.round(255 * g * f) + ',' + M.round(255 * b * f) + ',' + a + ')';
  }

  // ---------------------------------------------------------------- astrophys-eclipse
  function overlap(r1, r2, d) { // area of the intersection of two disks
    if (d >= r1 + r2) return 0; if (d <= M.abs(r1 - r2)) return PI * M.min(r1, r2) * M.min(r1, r2);
    var a = r1 * r1 * M.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)), b = r2 * r2 * M.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
    return a + b - 0.5 * M.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  }
  function ecl(P, ph) { // relative flux at orbital phase ph (0 = star 2 in front of star 1), seen edge-on-ish
    var a = P.sep * (P.R1 + P.R2), ang = TAU * ph, x = a * M.sin(ang), z = M.cos(ang), y = P.b * P.R1, dd = M.hypot(x, y);
    var s1 = P.R1 * P.R1 * M.pow(P.T1, 4), s2 = P.R2 * P.R2 * M.pow(P.T2, 4), tot = s1 + s2, ov = overlap(P.R1, P.R2, dd) / PI;
    var lost = z > 0 ? ov * M.pow(P.T1, 4) : ov * M.pow(P.T2, 4); // z > 0: star 2 in front of star 1
    return { f: (tot - lost) / tot, x: x, y: y, z: z };
  }
  ML.__apxEcl = ecl;
  V.register('astrophys-eclipse', function (e, o) {
    o = opt(o, { R1: 1, R2: 0.5, T1: 6000, T2: 4000, phase: 0.1, b: 0, sep: 4, play: false, names: ['star 1', 'star 2'] });
    var P = { R1: M.max(1e-3, num(o.R1, 1)), R2: M.max(1e-3, num(o.R2, 0.5)), T1: M.max(0, num(o.T1, 6000)), T2: M.max(0, num(o.T2, 4000)), b: M.max(0, num(o.b, 0)), sep: M.max(1.5, num(o.sep, 4)) };
    var ph = ((num(o.phase, 0.1) % 1) + 1) % 1, live = o.interactive !== false, quiet = !!o.quiet || o.readout === false, tags = o.tags || {}, names = o.names || ['star 1', 'star 2'];
    var shift = num(o.shift, quiet && !live ? 0.25 : 0); // the light curve is drawn against phase + shift
    var planet = P.T2 === 0;
    var F = frame(e, o, 'Eclipsing binary and its light curve'), c = V.canvas(F.box, { aspect: 1.45, max: 460, min: 300 });
    var play = !!o.play && !V.reduced, lp = null, sl = null, pb = null;
    if (live) {
      pb = V.button(F.ctl, play ? 'Pause' : 'Play', function () { play = !play; pb.textContent = play ? 'Pause' : 'Play'; if (play) lp.start(); }, 'pri');
      sl = V.slider(F.ctl, { label: 'Orbital phase', min: 0, max: 1, step: 0.002, value: ph, fmt: function (v) { return fm(v, 2); }, input: function (v) { ph = v; play = false; pb.textContent = 'Play'; draw(); } });
      if (o.controls !== false) {
        V.slider(F.ctl, { label: names[1].charAt(0).toUpperCase() + names[1].slice(1) + '\'s radius', min: 0.05, max: 1.5, step: 0.01, value: P.R2 / P.R1, fmt: function (v) { return fm(v, 2) + '×'; }, input: function (v) { P.R2 = v * P.R1; draw(); } });
        if (!planet) V.slider(F.ctl, { label: names[1].charAt(0).toUpperCase() + names[1].slice(1) + '\'s temperature', min: 2500, max: 30000, step: 100, value: P.T2, fmt: function (v) { return commas(v) + ' K'; }, input: function (v) { P.T2 = v; draw(); } });
      }
      lp = V.loop(e, function (dt) { if (!play) return; ph = (ph + dt * 0.06) % 1; if (sl) sl.set(ph); draw(); });
      if (!play) lp.stop();
    }
    function draw() {
      var ctx = c.ctx, k = V.colors(), w = c.w, h = c.h, topH = M.round(h * 0.46);
      // sky panel: dark space in both themes
      ctx.fillStyle = '#07121c'; ctx.fillRect(0, 0, w, topH);
      var ir = M.min(26, topH * 0.13), ix = w - ir - 16, iy = ir + 20, ang = TAU * ph, right = ix - ir - 12, left = 14;
      var a = P.sep * (P.R1 + P.R2), mR = M.max(P.R1, P.R2), sc = M.min((right - left) / (2 * a + 2 * mR), (topH - 64) / (2 * mR)), cx = w / 2, cy = topH / 2 + 6;
      if (cx + (a + mR) * sc > right) cx = (left + right) / 2;
      var st = ecl(P, ph), mx = M.max(P.T1, P.T2) || 1, where = M.abs(st.z) < 0.15 ? 'to the side' : st.z > 0 ? 'in front' : 'behind';
      function disk(xw, yw, r, T, dark) {
        var px = cx + xw * sc, py = cy - yw * sc, pr = M.max(2, r * sc);
        if (dark) { ctx.save(); ctx.fillStyle = '#1b2633'; ctx.strokeStyle = 'rgba(219,231,239,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); return; }
        var rgb = bbRGB(T), br = 0.45 + 0.55 * M.pow(T / mx, 1.2), g = ctx.createRadialGradient(px, py, pr * 0.1, px, py, pr);
        g.addColorStop(0, rgbStr([M.min(255, rgb[0] * br + 60), M.min(255, rgb[1] * br + 60), M.min(255, rgb[2] * br + 60)])); g.addColorStop(1, rgbStr([rgb[0] * br * 0.8, rgb[1] * br * 0.8, rgb[2] * br * 0.8]));
        ctx.save(); ctx.shadowColor = rgbStr(rgb, 0.6); ctx.shadowBlur = 14 * br; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fill(); ctx.restore();
      }
      // orbit hint
      ctx.save(); ctx.strokeStyle = 'rgba(120,170,200,0.25)'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(cx - a * sc, cy - st.y * sc); ctx.lineTo(cx + a * sc, cy - st.y * sc); ctx.stroke(); ctx.restore();
      if (st.z > 0) { disk(0, 0, P.R1, P.T1); disk(st.x, st.y, P.R2, P.T2, planet); } else { disk(st.x, st.y, P.R2, P.T2, planet); disk(0, 0, P.R1, P.T1); }
      txt(ctx, names[0] + (planet ? '' : ' (' + commas(P.T1) + ' K)'), 10, 13, { size: 11.5, color: '#dbe7ef' });
      txt(ctx, names[1] + (planet ? ' (dark)' : ' (' + commas(P.T2) + ' K)') + ': ' + where, 10, 29, { size: 11.5, color: '#8fb3c6' });
      var who = planet ? 'the planet slides' : 'the stars slide';
      txt(ctx, w >= 440 ? 'our view: the orbit is edge-on, so ' + who + ' back and forth' : 'edge-on view: ' + who + ' back and forth', 10, topH - 10, { size: 10.5, color: '#8fb3c6' });
      // top-view inset: where star 2 is on its orbit, and which way Earth is
      ctx.save(); ctx.strokeStyle = 'rgba(120,170,200,0.45)'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.fillStyle = rgbStr(bbRGB(P.T1 || 5000)); ctx.beginPath(); ctx.arc(ix, iy, 4.5, 0, TAU); ctx.fill(); ctx.fillStyle = planet ? '#8fb3c6' : rgbStr(bbRGB(P.T2)); ctx.beginPath(); ctx.arc(ix + ir * M.sin(ang), iy + ir * M.cos(ang), 3.2, 0, TAU); ctx.fill(); ctx.restore();
      txt(ctx, 'top view', ix, 8, { align: 'center', size: 10, color: '#8fb3c6' }); txt(ctx, 'Earth ↓', ix, iy + ir + 12, { align: 'center', size: 10, color: '#8fb3c6' });
      // light curve panel
      var gx = 44, gw = w - gx - 14, gy = topH + 22, gh = h - gy - 34;
      ctx.fillStyle = k.bg; ctx.fillRect(0, topH, w, h - topH);
      var N = 400, fs = [], fmin = 1, i; for (i = 0; i <= N; i++) { var fv = ecl(P, i / N - shift).f; fs.push(fv); fmin = M.min(fmin, fv); }
      var lo = M.max(0, 1 - (1 - fmin) * 1.25 - 0.002), hi = 1 + (1 - lo) * 0.12;
      var GX = function (q) { return gx + q * gw; }, GY = function (v) { return gy + (hi - v) / (hi - lo) * gh; };
      line(ctx, gx, gy - 4, gx, gy + gh, k.axis, 1.2); line(ctx, gx, gy + gh, gx + gw, gy + gh, k.axis, 1.2);
      txt(ctx, 'brightness', gx - 2, gy - 12, { size: 11, color: k.muted });
      txt(ctx, 'orbital phase', gx + gw, h - 8, { align: 'right', size: 11, color: k.muted });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (q) { txt(ctx, fm(q, 2), GX(q), gy + gh + 13, { align: 'center', size: 10.5, color: k.muted }); });
      txt(ctx, '1', gx - 6, GY(1), { align: 'right', size: 10.5, color: k.muted }); line(ctx, gx, GY(1), gx + gw, GY(1), k.grid, 1, [3, 3]);
      if (!quiet) txt(ctx, fm(lo, lo > 0.9 ? 3 : 2), gx - 6, GY(lo), { align: 'right', size: 10.5, color: k.muted });
      ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 2.4; ctx.beginPath(); for (i = 0; i <= N; i++) { if (i) ctx.lineTo(GX(i / N), GY(fs[i])); else ctx.moveTo(GX(0), GY(fs[0])); } ctx.stroke(); ctx.restore();
      // eclipse labels
      var e0 = ecl(P, 0).f, e5 = ecl(P, 0.5).f, d0 = 1 - e0, d5 = 1 - e5;
      var prim = d0 >= d5 ? 0 : 0.5, sec = prim === 0 ? 0.5 : 0;
      function mark(q, word, tag) {
        var d = 1 - ecl(P, q).f; if (d < 1e-6) return;
        var qs = ((q + shift) % 1 + 1) % 1, px = qs < 0.03 ? gx + 26 : GX(qs), py = GY(1 - d) + 14;
        if (py + (tag ? 26 : 8) > gy + gh) { px += qs > 0.8 ? -44 : 44; py = GY(1 - 0.55 * d) - (tag ? 8 : 0); } // deep dip: label beside it
        txt(ctx, word, px, py, { align: 'center', size: 11, bold: true, color: k.ink, halo: k.bg });
        if (tag) { ctx.save(); ctx.fillStyle = '#b8963e'; ctx.beginPath(); ctx.arc(px, py + 16, 9, 0, TAU); ctx.fill(); ctx.restore(); txt(ctx, tag, px, py + 16, { align: 'center', size: 11, bold: true, color: '#fff' }); }
      }
      if (!planet) { mark(prim, quiet ? 'eclipse' : 'primary', tags.primary); mark(sec, quiet ? 'eclipse' : 'secondary', tags.secondary); } else mark(0, 'transit', tags.primary);
      if (prim === 0 && 1 - ecl(P, 1).f > 1e-6) { /* the phase-1 copy of the eclipse at 0 is drawn by the curve */ }
      // cursor
      if (live) { var cxp = GX(((ph + shift) % 1 + 1) % 1); line(ctx, cxp, gy - 4, cxp, gy + gh, k.gold, 2); ctx.save(); ctx.fillStyle = k.gold; ctx.beginPath(); ctx.arc(cxp, GY(st.f), 5, 0, TAU); ctx.fill(); ctx.restore(); }
      // stats and readout
      var hidden0 = planet ? 'the planet blocks part of the star' : 'the ' + names[1] + ' passes in front of the ' + names[0];
      var rows = [];
      if (!quiet) { rows.push(['dip at phase 0', fm(100 * d0, d0 < 0.01 ? 3 : 1) + '%']); if (!planet) rows.push(['dip at phase 0.5', fm(100 * d5, d5 < 0.01 ? 3 : 1) + '%']); rows.push(['brightness now', fm(st.f, 4)]); }
      F.stats(rows);
      var read;
      if (planet) read = 'A dark planet crossing its star blocks a fraction $(R_p/R_\\star)^2$ of the light' + (quiet ? '.' : ': here ' + fm(100 * d0, 3) + '%.') + ' When it passes behind the star, nothing visible is hidden.';
      else read = 'At phase 0, ' + hidden0 + '; at phase 0.5, the ' + names[1] + ' is behind the ' + names[0] + '. In both eclipses (when one disk lies fully across the other) the same area is covered, so the deeper eclipse is the one that hides the <b>hotter</b> surface, whose every square meter is brighter ($\\propto T^4$).' + (quiet ? '' : ' Here the dips are ' + fm(100 * d0, 1) + '% and ' + fm(100 * d5, 1) + '%.');
      F.out.set(quiet ? 'The light curve of ' + (planet ? 'a planet crossing its star' : 'an eclipsing binary seen edge-on') + ' over one orbit.' : read);
      F.label((planet ? 'A planet transiting its star' : 'Two stars eclipsing each other') + ', seen edge-on, with the light curve; phase ' + fm(ph, 2) + ', ' + names[1] + ' ' + where + '.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ---------------------------------------------------------------- astrophys-chirp
  var TSUN = 4.925491e-6; // G M_sun / c^3 in seconds
  function chirpModel(m1, m2) {
    var Mt = m1 + m2, Mc = M.pow(m1 * m2, 0.6) / M.pow(Mt, 0.2), tc = Mc * TSUN;
    var fISCO = 1 / (M.pow(6, 1.5) * PI * Mt * TSUN), fEnd = 2.4 * fISCO, tau = function (f) { return 5 / 256 * M.pow(PI * f, -8 / 3) * M.pow(tc, -5 / 3); };
    var tauEnd = tau(fEnd), fr = 1.6 * fEnd, dRing = 6 * Mt * TSUN; // ringdown frequency and decay time (schematic)
    function f(t) { var ta = -t; return ta > tauEnd ? M.pow(5 / (256 * ta), 3 / 8) * M.pow(tc, -5 / 8) / PI : fEnd; } // t < 0 before merger
    function phase(t) { var ta = M.max(-t, tauEnd); return -2 * M.pow(ta / (5 * tc), 5 / 8); }
    function h(t) { // relative strain
      var ph0 = phase(-tauEnd);
      if (-t > tauEnd) { var ff = f(t); return M.pow(ff / fEnd, 2 / 3) * M.cos(phase(t) - ph0); }
      var s = t + tauEnd; return M.exp(-s / dRing) * M.cos(TAU * fr * s);
    }
    return { Mc: Mc, Mt: Mt, f: f, h: h, tauEnd: tauEnd, fEnd: fEnd, fr: fr, dRing: dRing, tau: tau };
  }
  ML.__apxChirp = chirpModel;
  V.register('astrophys-chirp', function (e, o) {
    o = opt(o, { m1: 36, m2: 29, t: 0.25, play: false });
    var m1 = clamp(num(o.m1, 36), 1, 200), m2 = clamp(num(o.m2, 29), 1, 200), C = chirpModel(m1, m2), span = clamp(num(o.t, 0.25), 0.02, 5);
    var t0 = -span, t = t0 + span * 0.15, tEnd = -C.tauEnd + 6 * C.dRing, live = o.interactive !== false;
    var F = frame(e, o, 'Two black holes spiraling together and the gravitational wave chirp'), c = V.canvas(F.box, { aspect: 1.5, max: 460, min: 300 });
    var play = !!o.play && !V.reduced, lp = null, sl = null, pb = null;
    if (live) {
      pb = V.button(F.ctl, play ? 'Pause' : 'Play', function () { if (t >= tEnd - 1e-9) t = t0; play = !play; pb.textContent = play ? 'Pause' : 'Play'; if (play) lp.start(); }, 'pri');
      sl = V.slider(F.ctl, { label: 'Time (merger at 0)', min: t0, max: tEnd, step: (tEnd - t0) / 1000, value: t, fmt: function (v) { return fm(v * 1000, 0) + ' ms'; }, input: function (v) { t = v; play = false; pb.textContent = 'Play'; draw(); } });
      lp = V.loop(e, function (dt) { if (!play) return; t += dt * span / 12; if (t >= tEnd) { t = tEnd; play = false; pb.textContent = 'Play'; } if (sl) sl.set(t); draw(); });
      if (!play) lp.stop();
    }
    function draw() {
      var ctx = c.ctx, k = V.colors(), w = c.w, h = c.h, topH = M.round(h * 0.55), half = w / 2;
      ctx.fillStyle = '#07121c'; ctx.fillRect(0, 0, w, topH);
      line(ctx, half, 8, half, topH - 8, 'rgba(120,170,200,0.25)', 1);
      // left: the binary. separation from Kepler: a ∝ f^(-2/3); orbital phase = GW phase / 2
      var merged = -t <= C.tauEnd, fnow = C.f(t), fRef = C.f(t0);
      var aMax = M.min(half * 0.42, topH * 0.4), aNow = merged ? 0 : aMax * M.pow(fnow / fRef, -2 / 3) * 0.9, cxL = half / 2, cyL = topH / 2 + 6;
      var phi = merged ? 0 : -(-2 * M.pow(-t / (5 * C.Mc * TSUN), 5 / 8)) / 2, r1 = aNow * m2 / (m1 + m2), r2 = aNow * m1 / (m1 + m2);
      function bh(x, y, r) { ctx.save(); ctx.fillStyle = '#000'; ctx.strokeStyle = 'rgba(255,212,121,0.85)'; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(255,212,121,0.6)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
      var rs1 = 4 + 5 * m1 / 60, rs2 = 4 + 5 * m2 / 60;
      if (!merged) { bh(cxL + r1 * M.cos(phi), cyL + r1 * M.sin(phi), rs1); bh(cxL - r2 * M.cos(phi), cyL - r2 * M.sin(phi), rs2); }
      else bh(cxL, cyL, 4 + 5 * (m1 + m2) * 0.95 / 60);
      txt(ctx, merged ? 'one black hole, ringing down' : 'orbiting pair (top view)', cxL, 16, { align: 'center', size: 11.5, color: '#dbe7ef' });
      // right: ring of free particles, plus polarization, face-on to the wave
      var hv = C.h(t), amp = 0.28 * hv, cxR = half + half / 2, cyR = cyL, R0 = M.min(half * 0.3, topH * 0.3);
      ctx.save(); ctx.strokeStyle = 'rgba(120,170,200,0.35)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(cxR, cyR, R0, 0, TAU); ctx.stroke(); ctx.restore();
      for (var i = 0; i < 16; i++) { var th = TAU * i / 16, x = R0 * M.cos(th) * (1 + amp / 2), y = R0 * M.sin(th) * (1 - amp / 2); ctx.save(); ctx.fillStyle = '#63e6be'; ctx.beginPath(); ctx.arc(cxR + x, cyR + y, 3.6, 0, TAU); ctx.fill(); ctx.restore(); }
      txt(ctx, 'ring of free particles', cxR, 16, { align: 'center', size: 11.5, color: '#dbe7ef' });
      txt(ctx, 'stretch shown ~10²⁰ times larger', cxR, topH - 12, { align: 'center', size: 10.5, color: '#8fb3c6' });
      // bottom: waveform
      ctx.fillStyle = k.bg; ctx.fillRect(0, topH, w, h - topH);
      var gx = 12, gw = w - 24, gy = topH + 18, gh = h - gy - 26, mid = gy + gh / 2, TX = function (s) { return gx + (s - t0) / (tEnd - t0) * gw; };
      line(ctx, gx, mid, gx + gw, mid, k.grid, 1);
      ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 1.6; ctx.beginPath();
      var n = M.max(600, M.round(gw * 3)); for (var j = 0; j <= n; j++) { var s = t0 + (tEnd - t0) * j / n, y2 = mid - C.h(s) * gh * 0.46; if (j) ctx.lineTo(TX(s), y2); else ctx.moveTo(TX(s), y2); } ctx.stroke(); ctx.restore();
      line(ctx, TX(-C.tauEnd), gy, TX(-C.tauEnd), gy + gh, k.muted, 1, [3, 3]);
      txt(ctx, 'merger', TX(-C.tauEnd) - 4, gy + 4, { align: 'right', size: 10.5, color: k.muted });
      line(ctx, TX(t), gy - 4, TX(t), gy + gh + 4, k.gold, 2);
      txt(ctx, 'strain h (relative)', gx, gy - 8, { size: 11, color: k.muted });
      txt(ctx, 'time →', gx + gw, h - 9, { align: 'right', size: 11, color: k.muted });
      var fo = merged ? C.fr : fnow;
      F.stats([['masses', fm(m1, 0) + ' + ' + fm(m2, 0) + ' M☉'], ['time to merger', merged ? 'merged' : fm(-t * 1000, 0) + ' ms'], [merged ? 'ringdown frequency' : 'wave frequency', fm(fo, 0) + ' Hz'], merged ? ['orbit', 'none: merged'] : ['orbits per second', fm(fnow / 2, 0)]]);
      F.out.set(merged ? 'The two holes have merged into one, which rings like a struck bell and settles down within milliseconds. Real signals of this kind stretch a 4 km detector arm by only about $10^{-18}$ m.' :
        'The wave\'s frequency is <b>twice</b> the orbital frequency (the pattern repeats every half orbit). As the waves carry energy away, the orbit shrinks and speeds up, so frequency and strength both rise: a <b>chirp</b>. The ring is squeezed one way while it is stretched the other, across the direction the wave travels.');
      F.label('Inspiral of ' + fm(m1, 0) + ' and ' + fm(m2, 0) + ' solar-mass black holes; ' + (merged ? 'after the merger' : fm(-t * 1000, 0) + ' milliseconds before the merger, wave frequency ' + fm(fnow, 0) + ' hertz') + '.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ---------------------------------------------------------------- astrophys-pulsar
  function pulseI(alpha, zeta, phi, w) { // brightness seen from direction zeta for magnetic axis at (alpha, phi): both poles
    var c = M.sin(alpha) * M.sin(zeta) * M.cos(phi) + M.cos(alpha) * M.cos(zeta), a1 = M.acos(clamp(c, -1, 1)), a2 = M.acos(clamp(-c, -1, 1));
    return M.exp(-0.5 * M.pow(a1 / w, 2)) + 0.8 * M.exp(-0.5 * M.pow(a2 / w, 2));
  }
  ML.__apxPulse = pulseI;
  V.register('astrophys-pulsar', function (e, o) {
    o = opt(o, { P: 0.0337, tilt: 40, view: 50, beam: 12, play: false });
    var DEG = PI / 180, tilt = clamp(num(o.tilt, 40), 0, 90), view = clamp(num(o.view, 50), 0, 180), w = clamp(num(o.beam, 12), 3, 40) * DEG, P = num(o.P, 0.0337), Pdot = num(o.Pdot, 0), live = o.interactive !== false, quiet = !!o.quiet;
    var F = frame(e, o, 'A pulsar as a lighthouse'), c = V.canvas(F.box, { aspect: 1.45, max: 460, min: 300 });
    var phi = 0.6, play = !!o.play && !V.reduced, lp = null, pb = null;
    if (live) {
      pb = V.button(F.ctl, play ? 'Pause' : 'Play', function () { play = !play; pb.textContent = play ? 'Pause' : 'Play'; if (play) lp.start(); }, 'pri');
      V.slider(F.ctl, { label: 'Tilt of the magnetic axis', min: 0, max: 90, step: 1, value: tilt, fmt: function (v) { return fm(v, 0) + '°'; }, input: function (v) { tilt = v; draw(); } });
      V.slider(F.ctl, { label: 'Our direction from the spin axis', min: 0, max: 180, step: 1, value: view, fmt: function (v) { return fm(v, 0) + '°'; }, input: function (v) { view = v; draw(); } });
      lp = V.loop(e, function (dt) { if (!play) return; phi = (phi + dt * PI) % TAU; draw(); });
      if (!play) lp.stop();
    }
    function draw() {
      var ctx = c.ctx, k = V.colors(), W0 = c.w, H0 = c.h, topH = M.round(H0 * 0.6), al = tilt * DEG, ze = view * DEG;
      ctx.fillStyle = '#07121c'; ctx.fillRect(0, 0, W0, topH);
      // a few fixed background stars
      stars(ctx, W0, topH, 60);
      // orthographic camera: looking at the origin from a direction slightly above the equator
      var cam = [0.42, -0.86, 0.29], nrm = M.hypot(cam[0], cam[1], cam[2]); cam = cam.map(function (x) { return x / nrm; });
      var rgt = [-cam[1], cam[0], 0], rn = M.hypot(rgt[0], rgt[1]); rgt = [rgt[0] / rn, rgt[1] / rn, 0];
      var up = [cam[1] * rgt[2] - cam[2] * rgt[1], cam[2] * rgt[0] - cam[0] * rgt[2], cam[0] * rgt[1] - cam[1] * rgt[0]];
      var cx = W0 * 0.45, cy = topH * 0.5, Ls = M.min(W0 * 0.36, topH * 0.42);
      function pr(v) { return [cx + Ls * (v[0] * rgt[0] + v[1] * rgt[1] + v[2] * rgt[2]), cy - Ls * (v[0] * up[0] + v[1] * up[1] + v[2] * up[2])]; }
      function depth(v) { return v[0] * cam[0] + v[1] * cam[1] + v[2] * cam[2]; } // > 0: toward the camera
      var m = [M.sin(al) * M.cos(phi), M.sin(al) * M.sin(phi), M.cos(al)], ear = [M.sin(ze), 0, M.cos(ze)];
      var Inow = pulseI(al, ze, phi, w), lit = Inow > 0.35;
      // Earth direction
      var pe = pr([ear[0] * 1.35, ear[1] * 1.35, ear[2] * 1.35]), p0 = pr([0, 0, 0]);
      line(ctx, p0[0], p0[1], pe[0], pe[1], lit ? '#ffd479' : 'rgba(143,179,198,0.7)', lit ? 2.6 : 1.6, [6, 5]);
      ctx.save(); if (lit) { ctx.shadowColor = '#ffd479'; ctx.shadowBlur = 18; } ctx.fillStyle = lit ? '#ffd479' : '#74c0fc'; ctx.beginPath(); ctx.arc(pe[0], pe[1], lit ? 9 : 7, 0, TAU); ctx.fill(); ctx.restore();
      txt(ctx, 'to Earth', pe[0], pe[1] - 15, { align: 'center', size: 11.5, color: '#dbe7ef', halo: 'rgba(7,18,28,0.85)' });
      // beams (draw the one pointing away from the camera first)
      function beam(sgn) {
        var dir = [sgn * m[0], sgn * m[1], sgn * m[2]], tip = pr([dir[0] * 1.15, dir[1] * 1.15, dir[2] * 1.15]), base = pr([dir[0] * 0.12, dir[1] * 0.12, dir[2] * 0.12]);
        var dx = tip[0] - base[0], dy = tip[1] - base[1], len = M.hypot(dx, dy) || 1, half = M.tan(w) * Ls * 1.15, nx = -dy / len * half, ny = dx / len * half;
        var g = ctx.createLinearGradient(base[0], base[1], tip[0], tip[1]); g.addColorStop(0, 'rgba(255,224,150,0.9)'); g.addColorStop(1, 'rgba(255,212,121,0.06)');
        ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(tip[0] + nx, tip[1] + ny); ctx.lineTo(tip[0] - nx, tip[1] - ny); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      var order = depth(m) > 0 ? [-1, 1] : [1, -1];
      beam(order[0]);
      // spin axis
      var sa = pr([0, 0, 1.25]), sb = pr([0, 0, -1.25]);
      line(ctx, sb[0], sb[1], sa[0], sa[1], 'rgba(143,179,198,0.8)', 1.4, [3, 4]);
      var sl = sa[1] < 24 ? sb : sa; txt(ctx, 'spin axis', sl[0] + 6, M.min(topH - 26, M.max(14, sl[1] + 2)), { size: 11, color: '#8fb3c6' });
      // the star
      var rr = M.max(10, Ls * 0.12), gr = ctx.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, 1, cx, cy, rr);
      gr.addColorStop(0, '#f1f6ff'); gr.addColorStop(1, '#6c8fb8'); ctx.save(); ctx.shadowColor = 'rgba(160,200,255,0.8)'; ctx.shadowBlur = 16; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill(); ctx.restore();
      // magnetic axis
      var ma = pr([m[0] * 0.5, m[1] * 0.5, m[2] * 0.5]), mb = pr([-m[0] * 0.5, -m[1] * 0.5, -m[2] * 0.5]);
      line(ctx, mb[0], mb[1], ma[0], ma[1], '#f783ac', 2.2);
      beam(order[1]);
      var lab = ma[1] < mb[1] ? ma : mb; txt(ctx, 'magnetic axis', lab[0] + (lab[0] < cx ? -8 : 8), lab[1] + (lab[1] < cy ? -8 : 10), { size: 11, color: '#f9a8d4', halo: 'rgba(7,18,28,0.85)', align: lab[0] < cx ? 'right' : 'left' });
      txt(ctx, 'slow motion: the real period is ' + (P < 1 ? fm(P * 1000, P < 0.01 ? 2 : 1) + ' ms' : fm(P, 3) + ' s'), 10, topH - 10, { size: 11, color: '#8fb3c6' });
      // pulse train
      ctx.fillStyle = k.bg; ctx.fillRect(0, topH, W0, H0 - topH);
      var gx = 40, gw = W0 - gx - 14, gy = topH + 22, gh = H0 - gy - 26, N = 600, mx = 1.85, j;
      line(ctx, gx, gy + gh, gx + gw, gy + gh, k.axis, 1.2); line(ctx, gx, gy - 4, gx, gy + gh, k.axis, 1.2);
      txt(ctx, 'radio signal at Earth', gx, gy - 11, { size: 11, color: k.muted });
      for (j = 0; j <= 3; j++) txt(ctx, j === 0 ? '0' : j + (j === 1 ? ' turn' : ' turns'), gx + gw * j / 3, gy + gh + 13, { align: j === 0 ? 'left' : j === 3 ? 'right' : 'center', size: 10.5, color: k.muted });
      ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2; ctx.beginPath();
      var npk = 0, prevI = 0, rising = false;
      for (j = 0; j <= N; j++) { var ph = TAU * 3 * j / N, I = pulseI(al, ze, ph, w), px = gx + gw * j / N, py = gy + gh - M.min(1, I / mx) * gh; if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke(); ctx.restore();
      // pulses per turn
      for (j = 0; j < 720; j++) { var I2 = pulseI(al, ze, TAU * j / 720, w); if (I2 > 0.35 && !rising) { npk++; rising = true; } else if (I2 <= 0.35) rising = false; }
      if (rising && pulseI(al, ze, 0, w) > 0.35 && npk > 1) npk--; // a pulse that wraps around the start of the turn
      var curx = gx + gw * (phi / TAU) / 3; line(ctx, curx, gy - 4, curx, gy + gh, k.gold, 2);
      var rows = [['pulses per turn', String(npk)], ['period', P < 1 ? fm(P * 1000, 2) + ' ms' : fm(P, 3) + ' s']];
      if (Pdot > 0 && !quiet) rows.push(['spin-down power', sci(4 * PI * PI * 1e38 * Pdot / M.pow(P, 3), 2) + ' W']);
      F.stats(rows);
      F.out.set(npk === 0 ? 'With this tilt and viewing direction the beams never sweep across Earth, so we would see no pulses at all, although the star still spins and slows down. Many pulsars must be hidden from us this way.'
        : 'The beams are locked to the magnetic axis, which is tilted ' + fm(tilt, 0) + '° from the spin axis, so they sweep around once per turn like a lighthouse. Earth, ' + fm(view, 0) + '° from the spin axis, sees ' + (npk === 1 ? 'one pulse' : 'two pulses (one from each pole)') + ' per turn. The pulses keep perfect time because they are tied to the rotation of a massive flywheel.');
      F.label('Pulsar with magnetic axis tilted ' + fm(tilt, 0) + ' degrees and Earth ' + fm(view, 0) + ' degrees from the spin axis: ' + npk + ' pulse' + (npk === 1 ? '' : 's') + ' per turn.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ---------------------------------------------------------------- astrophys-plot
  function cfun(src) { // a CAS expression in x as a fast function
    var C = W.CAS; if (!C) throw new Error('astrophys-plot needs the CAS');
    var t = C.parse(String(src)), g = C.compile(t, ['x']);
    return function (x) { try { var r = +g(x); return isFinite(r) ? r : NaN; } catch (er) { return NaN; } };
  }
  var SUPD = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '.': '·' };
  function powLab(v) { var r = M.round(v * 10) / 10; return r === 0 ? '1' : r === 1 ? '10' : '10' + String(r).split('').map(function (ch) { return SUPD[ch] || ch; }).join(''); }
  function niceStep(span, n) { var raw = span / n, m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  V.register('astrophys-plot', function (e, o) {
    o = opt(o, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, xlabel: 'x', ylabel: 'y', curves: [], points: [], vlines: [], bands: [] });
    var live = o.interactive !== false, F = frame(e, o, o.label || 'Plot of ' + o.ylabel + ' against ' + o.xlabel), c = V.canvas(F.box, { aspect: 1.55, max: o.height || 420, min: 260 });
    var curves = (o.curves || []).map(function (q) { return { f: cfun(q.f), label: q.label || '', color: q.color || 'blue', dash: !!q.dash, from: q.from != null ? +q.from : -Infinity, to: q.to != null ? +q.to : Infinity, at: q.at }; });
    var cur = o.cursor ? { x: +o.cursor.value, rd: (o.cursor.readout || []).map(function (r) { return { label: r.label, f: cfun(r.f), d: r.d, sig: r.sig, unit: r.unit || '' }; }) } : null;
    if (cur && live) V.slider(F.ctl, { label: o.cursor.label || o.xlabel, min: +o.cursor.min, max: +o.cursor.max, step: +o.cursor.step || (o.cursor.max - o.cursor.min) / 200, value: cur.x, fmt: function (v) { return o.cursor.fmt === 'pow' ? powLab(v) : fm(v, 2); }, input: function (v) { cur.x = v; draw(); } });
    function draw() {
      var ctx = c.ctx, k = V.colors(), w = c.w, h = c.h, padL = 46, padR = 12, padT = 24, padB = 38;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var X = function (x) { return padL + (x - o.xmin) / (o.xmax - o.xmin) * (w - padL - padR); }, Y = function (y) { return h - padB - (y - o.ymin) / (o.ymax - o.ymin) * (h - padT - padB); };
      (o.bands || []).forEach(function (b, i) { var x1 = X(M.max(o.xmin, b.from)), x2 = X(M.min(o.xmax, b.to)); ctx.fillStyle = rgba(k[b.color || 'gold'] || k.gold, 0.09); ctx.fillRect(x1, padT, x2 - x1, h - padT - padB); if (b.label && x2 - x1 > 30) txt(ctx, b.label, (x1 + x2) / 2, padT + 10, { align: 'center', size: w < 480 ? 10 : 11, bold: true, color: k[b.color || 'gold'] || k.muted }); });
      // grid and axes
      var xs = niceStep(o.xmax - o.xmin, w < 480 ? 4 : 7), ys = niceStep(o.ymax - o.ymin, 6), t;
      ctx.lineWidth = 1;
      for (t = M.ceil(o.xmin / xs) * xs; t <= o.xmax + 1e-9; t += xs) { line(ctx, X(t), padT, X(t), h - padB, k.grid, 1); txt(ctx, o.xpow ? powLab(t) : fm(t, 3), X(t), h - padB + 13, { align: 'center', size: 10.5, color: k.muted }); }
      for (t = M.ceil(o.ymin / ys) * ys; t <= o.ymax + 1e-9; t += ys) { line(ctx, padL, Y(t), w - padR, Y(t), k.grid, 1); txt(ctx, o.ypow ? powLab(t) : fm(t, 3), padL - 5, Y(t), { align: 'right', size: 10.5, color: k.muted }); }
      line(ctx, padL, padT - 4, padL, h - padB, k.axis, 1.3); line(ctx, padL, h - padB, w - padR, h - padB, k.axis, 1.3);
      txt(ctx, o.xlabel, w - padR, h - 8, { align: 'right', size: 11, color: k.muted });
      txt(ctx, o.ylabel, padL + 4, padT - 12, { size: 11, color: k.muted });
      (o.vlines || []).forEach(function (v) { if (v.x < o.xmin || v.x > o.xmax) return; line(ctx, X(v.x), padT, X(v.x), h - padB, k.muted, 1.2, [4, 4]); if (v.label) txt(ctx, v.label, X(v.x) + (X(v.x) > w * 0.7 ? -4 : 4), h - padB - 10, { align: X(v.x) > w * 0.7 ? 'right' : 'left', size: 10.5, color: k.muted, halo: k.bg }); });
      // curves
      ctx.save(); ctx.beginPath(); ctx.rect(padL, padT - 2, w - padL - padR, h - padT - padB + 4); ctx.clip();
      curves.forEach(function (cv) {
        var col = k[cv.color] || cv.color; ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.setLineDash(cv.dash ? [7, 5] : []); ctx.beginPath(); var on = false, n = 400;
        for (var i = 0; i <= n; i++) { var x = o.xmin + (o.xmax - o.xmin) * i / n; if (x < cv.from || x > cv.to) { on = false; continue; } var y = cv.f(x); if (!isFinite(y)) { on = false; continue; } if (on) ctx.lineTo(X(x), Y(y)); else { ctx.moveTo(X(x), Y(y)); on = true; } }
        ctx.stroke();
      });
      ctx.restore(); ctx.setLineDash([]);
      curves.forEach(function (cv) { if (!cv.label) return; var col = k[cv.color] || cv.color, ax = cv.at != null ? +cv.at : M.min(o.xmax, cv.to) - (o.xmax - o.xmin) * 0.03, ay = cv.f(ax); if (!isFinite(ay)) return; ay = clamp(ay, o.ymin, o.ymax); txt(ctx, cv.label, X(ax), Y(ay) - 11, { align: X(ax) > w * 0.75 ? 'right' : 'center', size: w < 480 ? 11 : 12, bold: true, color: col, halo: k.bg }); });
      (o.points || []).forEach(function (p) { ctx.save(); ctx.fillStyle = k.red; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 5, 0, TAU); ctx.fill(); ctx.restore(); if (p.label) txt(ctx, p.label, X(p.x) + (X(p.x) > w * 0.7 ? -8 : 8), Y(p.y) - 10, { align: X(p.x) > w * 0.7 ? 'right' : 'left', size: 11, bold: true, color: k.red, halo: k.bg }); });
      if (cur) {
        line(ctx, X(cur.x), padT, X(cur.x), h - padB, k.gold, 2);
        curves.forEach(function (cv) { var y = cv.f(cur.x); if (!isFinite(y) || cur.x < cv.from || cur.x > cv.to || y < o.ymin || y > o.ymax) return; ctx.save(); ctx.fillStyle = k[cv.color] || cv.color; ctx.beginPath(); ctx.arc(X(cur.x), Y(y), 4.5, 0, TAU); ctx.fill(); ctx.restore(); });
        F.stats(cur.rd.map(function (r) { var v = r.f(cur.x); return [r.label, (!isFinite(v) ? '—' : r.sig ? sci(v, r.sig) : fm(v, r.d == null ? 2 : r.d)) + (r.unit ? ' ' + r.unit : '')]; }));
      }
      if (o.read) F.out.set(o.read);
      F.label(o.label || ('Plot of ' + o.ylabel + ' against ' + o.xlabel + ': ' + curves.map(function (cv) { return cv.label; }).filter(Boolean).join(', ')));
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
  // ---------------------------------------------------------------- astrophys-s2
  ML.__apxKepler = function (a, e, Pyr, t) { // position (AU, black hole at the origin, closest approach on +x) at time t (yr) after closest approach
    var Mn = TAU * ((((t / Pyr) % 1) + 1) % 1), E = Mn > PI ? Mn - e : Mn + e;
    for (var i = 0; i < 50; i++) E -= (E - e * M.sin(E) - Mn) / (1 - e * M.cos(E));
    var b = a * M.sqrt(1 - e * e), x = a * (M.cos(E) - e), y = b * M.sin(E);
    return { x: x, y: y, r: M.hypot(x, y) };
  };
  V.register('astrophys-s2', function (e, o) {
    o = opt(o, { a: 1030, e: 0.886, M: 4.2e6, t: 0.25, play: true });
    var a = M.max(1, num(o.a, 1030)), ec = clamp(num(o.e, 0.886), 0, 0.97), Ms = M.max(1, num(o.M, 4.2e6)), Pyr = M.sqrt(a * a * a / Ms);
    var t = ((num(o.t, 0.25) % 1) + 1) % 1 * Pyr, live = o.interactive !== false, quiet = !!o.quiet;
    var F = frame(e, o, 'A star orbiting the black hole at the center of the Milky Way'), c = V.canvas(F.box, { aspect: 1.6, max: 460, min: 300 });
    var play = live && o.play !== false && !V.reduced, lp = null, sl = null, pb = null, trail = [];
    if (live) {
      pb = V.button(F.ctl, play ? 'Pause' : 'Play', function () { play = !play; pb.textContent = play ? 'Pause' : 'Play'; if (play) lp.start(); }, 'pri');
      sl = V.slider(F.ctl, { label: 'Years since closest approach', min: 0, max: M.round(Pyr * 100) / 100, step: 0.01, value: t, fmt: function (v) { return fm(v, 2) + ' yr'; }, input: function (v) { t = v; play = false; pb.textContent = 'Play'; draw(); } });
      // slow near apocenter, fast near closest approach: real time, about 1.6 years of orbit per second
      lp = V.loop(e, function (dt) { if (!play) return; t = (t + dt * Pyr / 10) % Pyr; if (sl) sl.set(t); draw(); });
      if (!play) lp.stop();
    }
    function draw() {
      var ctx = c.ctx, w = c.w, h = c.h, bb = a * M.sqrt(1 - ec * ec);
      ctx.fillStyle = '#07121c'; ctx.fillRect(0, 0, w, h);
      stars(ctx, w, h, 80); var i;
      var x0 = -a * (1 + ec), x1 = a * (1 - ec), pad = 30, sc = M.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad - 30) / (2 * bb));
      var ox = pad + (w - 2 * pad - (x1 - x0) * sc) / 2 - x0 * sc, oy = h / 2 + 4;
      function X(x) { return ox + x * sc; } function Y(y) { return oy - y * sc; }
      ctx.save(); ctx.strokeStyle = 'rgba(143,179,198,0.55)'; ctx.lineWidth = 1.3; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.ellipse(X(-a * ec), Y(0), a * sc, bb * sc, 0, 0, TAU); ctx.stroke(); ctx.restore();
      // scale bar
      var bar = a > 600 ? 500 : a > 120 ? 100 : 10; line(ctx, 14, h - 16, 14 + bar * sc, h - 16, '#dbe7ef', 2); txt(ctx, commas(bar) + ' AU', 14 + bar * sc + 6, h - 16, { size: 11, color: '#dbe7ef' });
      // the black hole: a dark disk with a faint ring (not to scale: its horizon is far smaller than a pixel here)
      var g = ctx.createRadialGradient(X(0), Y(0), 3, X(0), Y(0), 13); g.addColorStop(0, 'rgba(255,170,90,0.85)'); g.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(0), Y(0), 13, 0, TAU); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(X(0), Y(0), 4.5, 0, TAU); ctx.fill();
      txt(ctx, 'Sgr A*', X(0) - 4, Y(0) + 22, { align: 'right', size: 11.5, bold: true, color: '#ffc58a' });
      // trail and the star
      var pos = ML.__apxKepler(a, ec, Pyr, t);
      ctx.save(); ctx.strokeStyle = 'rgba(116,192,252,0.85)'; ctx.lineWidth = 2.2; ctx.beginPath();
      for (i = 0; i <= 40; i++) { var q = ML.__apxKepler(a, ec, Pyr, t - Pyr * 0.06 * (1 - i / 40)); if (i) ctx.lineTo(X(q.x), Y(q.y)); else ctx.moveTo(X(q.x), Y(q.y)); }
      ctx.stroke(); ctx.restore();
      ctx.save(); ctx.shadowColor = '#a5d8ff'; ctx.shadowBlur = 10; ctx.fillStyle = '#d0ebff'; ctx.beginPath(); ctx.arc(X(pos.x), Y(pos.y), 5.5, 0, TAU); ctx.fill(); ctx.restore();
      txt(ctx, 'S2', X(pos.x) + 9, Y(pos.y) - 11, { size: 12, bold: true, color: '#d0ebff' });
      txt(ctx, 'closest approach', X(a * (1 - ec)), Y(0) - bb * sc * 0.2 - 14, { align: 'right', size: 10.5, color: '#8fb3c6' });
      txt(ctx, 'farthest point', X(-a * (1 + ec)) + 4, Y(0) - 12, { size: 10.5, color: '#8fb3c6' });
      var GM = 4 * PI * PI * Ms, v = M.sqrt(GM * (2 / pos.r - 1 / a)) * 4.74; // AU/yr → km/s
      if (!quiet) F.stats([['period', fm(Pyr, 1) + ' yr'], ['distance from Sgr A*', commas(pos.r) + ' AU'], ['speed', commas(v) + ' km/s'], ['speed ÷ c', fm(100 * v / 299792, 2) + '%']]);
      F.out.set(quiet ? 'A star on a long ellipse around a black hole, which sits at one focus.' : 'Kepler\'s third law with $a$ in AU and $P$ in years gives $M = a^3/P^2$. The star crawls at about ' + commas(M.sqrt(GM * (2 / (a * (1 + ec)) - 1 / a)) * 4.74) + ' km/s at its farthest point and swings past the black hole at about ' + commas(M.sqrt(GM * (2 / (a * (1 - ec)) - 1 / a)) * 4.74) + ' km/s, ' + commas(a * (1 - ec)) + ' AU from it.');
      F.label('A star on an orbit with a = ' + commas(a) + ' AU and e = ' + fm(ec, 3) + ' around a black hole of ' + sci(Ms, 2) + ' solar masses; now ' + commas(pos.r) + ' AU from it, moving at ' + commas(v) + ' km/s.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
})(window, document);
