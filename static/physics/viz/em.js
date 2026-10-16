/* Physics Ladder visuals made for Electricity and Magnetism (em). Registered on window.MathLadder.viz; loaded on em topic
   pages after viz/core.js and the physics kit. Source of truth: this file (Teddy Rook Book). Units are SI unless noted.

   em-pieces: a charged rod or ring cut into n pieces dq, each drawing its own field arrow dE at a point P (or its own
   potential dV). Bars compare adding the sizes |dE| (a mistake), adding the vectors, and the exact integral.
     opts:
       shape: "rod"            "rod" or "ring"
       at: "bisector"          rod only: "bisector" (P above the middle), "end" (P above one end) or "axis" (P on the
                               rod's line, beyond its right end)
       L: 0.4, d: 0.1          rod length and the distance of P from the rod (from the end for "axis"), in meters
       R: 0.05, z: 0.05        ring radius and the distance of P along the axis from the center, in meters
       Q: 10                   total charge in nC (positive or negative)
       n: 8, maxN: 48          pieces shown at the start and the most offered by the slider
       sum: "E"                "E" (field vectors, with components) or "V" (potential: plain numbers that add)
       components: true        draw the components of one mirror pair of arrows
       slider: true            a slider for d (rod) or z (ring)
       task, label             a task line above the picture and the aria-label

   em-share: two metal spheres far apart, joined (or not) by a long thin wire. Joined spheres reach the same potential,
   so they share charge in proportion to their radii, and the smaller one has the stronger surface field.
     opts:
       R1: 2, R2: 6            radii in cm (sliders 1 to 10 cm)
       q1: 8, q2: 0            starting charges in nC (before the wire is connected)
       connected: false        start connected
       task, label

   em-taper: a conductor whose radius changes from r1 to r2 along its length, cut into n slices. Each slice adds
   dR = ρ dx / A(x); the graph shows ρ/A(x) with the slices as bars, and the area under it is the resistance.
     opts:
       r1: 1, r2: 3            end radii in mm (r2 has a slider, 0.5 to 6 mm)
       L: 20                   length in cm
       rho: 1.1e-6             resistivity in Ω·m (default about that of nichrome)
       n: 6, maxN: 40          slices at the start and the most offered
       task, label
   em-decay: the exponential curves of RC and RL circuits on a time axis marked in time constants, with a time slider.
     opts:
       mode: "rc-discharge"    "rc-discharge" (V_C, and a second capacitor starting at half the voltage), "rc-charge"
                               (V_C and I), "rl-rise" (I and V_L) or "rl-decay" (I)
       R: 1000                 resistance in ohms (slider)
       C: 100                  capacitance in μF (RC modes)
       L: 2                    inductance in henries (RL modes)
       V0: 12                  battery emf, or the capacitor's starting voltage for "rc-discharge"
       energy: false           rc-discharge: also draw the stored energy as a fraction of its start
       t: 0                    starting time for the cursor (s)
       task, label
   Every visual: light and dark themes, keyboard (all controls are sliders and buttons), a live text readout that says
   what the picture shows, no horizontal overflow at 360 px, and touch scrolling stays possible over the picture. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('physics/viz/em.js: load math/viz/core.js first'); return; }
  var M = Math, PI = M.PI, fm = V.fmt, KC = 8.99e9, EPS0 = 8.85e-12;

  (function css() {
    if (D.getElementById('em-viz-css')) return;
    var s = D.createElement('style'); s.id = 'em-viz-css';
    s.textContent = '.emv .em-task{margin:0 0 .5rem;font-size:.95rem;line-height:1.45}.emv .em-box{position:relative}' +
      '.emv .ml-readout b{font-variant-numeric:tabular-nums}.emv .em-key{display:inline-block;width:.8em;height:.8em;border-radius:2px;margin:0 .25em 0 .1em;vertical-align:-.05em}';
    D.head.appendChild(s);
  })();
  function nv(x, d) { var y = typeof x === 'string' ? parseFloat(x) : x; return typeof y === 'number' && isFinite(y) ? y : d; }
  function frame(el, o, label) {
    el.classList.add('emv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = V.el('p', 'em-task', o.task); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = V.el('div', 'em-box'); el.appendChild(F.box);
    F.ctl = V.el('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    return F;
  }
  function canvasIn(F, aspect, label, min, max) {
    var c = V.canvas(F.box, { aspect: aspect, min: min || 260, max: max || 470 });
    c.cv.style.touchAction = 'pan-y'; c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', label);
    return c;
  }
  function font(sz, w) { return (w || 600) + ' ' + sz + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; }
  function text(ctx, s, x, y, o) { o = o || {}; ctx.save(); ctx.font = font(o.size || 12, o.weight); ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; if (o.halo) { ctx.lineWidth = 3.5; ctx.strokeStyle = o.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); } ctx.fillStyle = o.color; ctx.fillText(s, x, y); ctx.restore(); }
  function arrow(ctx, x1, y1, x2, y2, col, w, dash) {
    var L = M.hypot(x2 - x1, y2 - y1); if (L < 1) return; var a = M.atan2(y2 - y1, x2 - x1), hs = M.min(5 + 2 * (w || 2), L * 0.5);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = 'round'; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(a), y2 - hs * 0.6 * M.sin(a)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.42), y2 - hs * M.sin(a - 0.42)); ctx.lineTo(x2 - hs * M.cos(a + 0.42), y2 - hs * M.sin(a + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function dot(ctx, x, y, r, fill, stroke) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); }
  function rgba(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function bg(c, k) { var ctx = c.ctx; ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h); ctx.restore(); }
  function sci(v, sig) { // a value with sig significant figures, scientific form when large or small
    if (!isFinite(v)) return '—'; if (v === 0) return '0'; sig = sig || 3; var a = M.abs(v), e = M.floor(M.log10(a) + 1e-12);
    if (e >= 5 || e <= -3) { var m = (v / M.pow(10, e)).toFixed(sig - 1); return m.replace('-', '−') + ' × 10' + String(e).replace('-', '⁻').replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; }); }
    return fm(v, M.max(0, sig - 1 - e));
  }
  /* horizontal bars: rows [{label, v, color, note}] scaled to max */
  function bars(ctx, k, x, y, w, rows, max) {
    var lw = M.min(170, w * 0.42), bw = w - lw - 8, rh = 22;
    rows.forEach(function (r, i) {
      var yy = y + i * (rh + 6), L = max > 0 ? M.max(0, M.min(1, M.abs(r.v) / max)) * bw : 0;
      text(ctx, r.label, x + lw, yy + rh / 2, { size: 11.5, align: 'right', color: k.ink, weight: 600 });
      ctx.save(); ctx.fillStyle = rgba(k.grid[0] === '#' ? k.grid : '#e4ebe6', 0.6); ctx.fillRect(x + lw + 8, yy, bw, rh); ctx.fillStyle = r.color; ctx.fillRect(x + lw + 8, yy, L, rh); ctx.restore();
      if (r.note) text(ctx, r.note, x + lw + 14 + (L > bw - 90 ? 0 : L), yy + rh / 2, { size: 11.5, color: L > bw - 90 ? '#ffffff' : k.ink, weight: 700 });
    });
    return rows.length * (rh + 6);
  }

  // ------------------------------------------------------------------ em-pieces
  V.register('em-pieces', function (el, o) {
    o = Object.assign({ shape: 'rod', at: 'bisector', L: 0.4, d: 0.1, R: 0.05, z: 0.05, Q: 10, n: 8, maxN: 48, sum: 'E', components: true, slider: true }, o || {});
    var ring = o.shape === 'ring', S = { n: M.max(1, M.round(nv(o.n, 8))), d: nv(ring ? o.z : o.d, ring ? 0.05 : 0.1) }, Lr = nv(o.L, 0.4), Rr = nv(o.R, 0.05), Q = nv(o.Q, 10) * 1e-9, at = ring ? 'axis' : o.at, isV = o.sum === 'V';
    var F = frame(el, o, ring ? 'A charged ring cut into pieces, each adding its field at a point on the axis' : 'A charged rod cut into pieces, each adding its field at a point P');
    var c = canvasIn(F, 1.45, ring ? 'A ring seen at a slant, a point P on its axis, and the field arrow from each piece of the ring at P.' : 'A rod cut into pieces, a point P, and the field arrow from each piece at P.', 380, 520);
    V.slider(F.ctl, { label: 'pieces n', min: 1, max: M.max(2, nv(o.maxN, 48)), step: 1, value: S.n, input: function (v) { S.n = v; draw(); } });
    if (o.slider !== false) {
      var dmax = ring ? 3 * Rr : M.max(0.3, Lr), dmin = ring ? 0 : 0.01;
      V.slider(F.ctl, { label: ring ? 'distance z (m)' : at === 'axis' ? 'gap beyond the end (m)' : 'distance d (m)', min: dmin, max: dmax, step: (dmax - dmin) / 100, value: S.d, fmt: function (v) { return fm(v, 3); }, input: function (v) { S.d = v; draw(); } });
    }
    // piece positions (meters) and P
    function geom() {
      var n = S.n, pcs = [], P;
      if (ring) { for (var i = 0; i < n; i++) { var a = 2 * PI * (i + 0.5) / n; pcs.push([0, Rr * M.cos(a), Rr * M.sin(a)]); } P = [S.d, 0, 0]; }
      else {
        var x0 = at === 'bisector' ? -Lr / 2 : 0; for (var j = 0; j < n; j++) pcs.push([x0 + Lr * (j + 0.5) / n, 0, 0]);
        P = at === 'bisector' ? [0, S.d, 0] : at === 'end' ? [0, S.d, 0] : [Lr + S.d, 0, 0];
      }
      return { pcs: pcs, P: P };
    }
    function exact(P) { // exact field (vector) and potential from the closed forms
      var lam = Q / Lr;
      if (ring) { var z = P[0], r2 = z * z + Rr * Rr; return { E: [KC * Q * z / M.pow(r2, 1.5), 0], V: KC * Q / M.sqrt(r2) }; }
      if (at === 'bisector') { var d = P[1], h = Lr / 2, s = M.sqrt(d * d + h * h); return { E: [0, KC * Q / (d * s)], V: 2 * KC * lam * M.log((h + s) / d) }; }
      if (at === 'end') { var dd = P[1], s2 = M.sqrt(dd * dd + Lr * Lr); return { E: [-KC * lam * (1 / dd - 1 / s2), KC * lam * Lr / (dd * s2)], V: KC * lam * M.log((Lr + s2) / dd) }; }
      var a = S.d; return { E: [KC * Q / (a * (a + Lr)), 0], V: KC * lam * M.log((a + Lr) / a) };
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, W0 = c.w, H0 = c.h, g = geom(), n = S.n, dq = Q / n, Pq = g.P;
      bg(c, k);
      var top = 10, picH = H0 - 118, sumX = 0, sumY = 0, sumMag = 0, sumV = 0, dEs = [];
      g.pcs.forEach(function (s) { var dx = Pq[0] - s[0], dy = Pq[1] - s[1], dz = Pq[2] - s[2], r = M.sqrt(dx * dx + dy * dy + dz * dz), e = KC * dq / (r * r); dEs.push({ s: s, e: e, u: [dx / r, dy / r, dz / r], r: r }); sumX += e * dx / r; sumY += e * dy / r; sumMag += M.abs(e); sumV += KC * dq / r; });
      if (M.abs(sumX) < 1e-9 * sumMag) sumX = 0; if (M.abs(sumY) < 1e-9 * sumMag) sumY = 0;
      var ex = exact(Pq), Eex = M.hypot(ex.E[0], ex.E[1]), Evec = M.hypot(sumX, sumY);
      // world -> pixels
      var X, Y, proj;
      var sc = 1;
      if (ring) { var span = M.max(3 * Rr, S.d + 1.2 * Rr) + Rr * 0.8; sc = M.min((W0 - 40) / span, picH / (2.6 * Rr)); var ox = 20 + 0.9 * Rr * sc; proj = function (p) { return [ox + p[0] * sc - p[2] * sc * 0.28, top + picH / 2 - p[1] * sc]; }; }
      else { var xs = [-Lr / 2, Lr / 2, Pq[0]], ys = [0, Pq[1]], minx = M.min.apply(null, at === 'bisector' ? xs : [0, Lr, Pq[0]]), maxx = M.max.apply(null, at === 'bisector' ? xs : [0, Lr, Pq[0]]), maxy = M.max.apply(null, ys); var scx = (W0 - 60) / ((maxx - minx) || 1), scy = (picH - 50) / (maxy || Lr * 0.4); var sc2 = M.min(scx, at === 'axis' ? scx : scy); var oy = at === 'axis' ? top + picH * 0.62 : top + picH - 22; var ox2 = (W0 - (maxx - minx) * sc2) / 2 - minx * sc2; proj = function (p) { return [ox2 + p[0] * sc2, oy - p[1] * sc2]; }; }
      X = function (p) { return proj(p)[0]; }; Y = function (p) { return proj(p)[1]; };
      // the charged object
      if (ring) { var cx = X([0, 0, 0]), cy = Y([0, 0, 0]), rx = Rr * sc * 0.28, ry = M.abs(Y([0, Rr, 0]) - cy); ctx.save(); ctx.strokeStyle = rgba(Q >= 0 ? k.red : k.blue, 0.75); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(cx, cy, M.max(2, rx), ry, 0, 0, 2 * PI); ctx.stroke(); ctx.restore(); ctx.save(); ctx.strokeStyle = k.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(W0 - 8, cy); ctx.stroke(); ctx.restore(); text(ctx, 'axis', W0 - 10, cy - 10, { align: 'right', size: 11, color: k.muted }); }
      else { var a0 = proj([at === 'bisector' ? -Lr / 2 : 0, 0, 0]), a1 = proj([at === 'bisector' ? Lr / 2 : Lr, 0, 0]); ctx.save(); ctx.fillStyle = rgba(Q >= 0 ? k.red : k.blue, 0.22); ctx.strokeStyle = Q >= 0 ? k.red : k.blue; ctx.lineWidth = 2; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(a0[0], a0[1] - 5, a1[0] - a0[0], 10, 5); else ctx.rect(a0[0], a0[1] - 5, a1[0] - a0[0], 10); ctx.fill(); ctx.stroke(); ctx.restore(); }
      // pieces and their arrows (or potential bars)
      var emax = 0, rmin = Infinity; dEs.forEach(function (q) { emax = M.max(emax, q.e); rmin = M.min(rmin, q.r); }); var Lmax = M.min(80, picH * 0.36);
      var Ppx = proj(Pq), i0 = M.floor(n / 5), hi = [i0, n - 1 - i0];
      dEs.forEach(function (q, i) {
        var sp = proj(q.s), back = ring && q.s[2] < 0;
        dot(ctx, sp[0], sp[1], n > 30 ? 2.5 : 4, Q >= 0 ? k.red : k.blue, null);
        if (!isV) {
          var u2 = proj([Pq[0] + q.u[0], Pq[1] + q.u[1], Pq[2] + q.u[2]]), ux = u2[0] - Ppx[0], uy = u2[1] - Ppx[1], ul = M.hypot(ux, uy) || 1, L = q.e / emax * Lmax * (Q < 0 ? -1 : 1);
          var hl = o.components !== false && (i === hi[0] || i === hi[1]) && n > 1, col = hl ? k.pink : rgba(k.red, back ? 0.28 : 0.5);
          if (n <= 60) arrow(ctx, Ppx[0], Ppx[1], Ppx[0] + ux / ul * L, Ppx[1] + uy / ul * L, col, hl ? 2.4 : 1.6);
          if (hl) {
            var exx = ux / ul * L, eyy = uy / ul * L;
            ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = rgba(k.muted, 0.7); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sp[0], sp[1]); ctx.lineTo(Ppx[0], Ppx[1]); ctx.stroke(); ctx.restore();
            arrow(ctx, Ppx[0], Ppx[1], Ppx[0] + exx, Ppx[1], k.orange, 2, [5, 3]); arrow(ctx, Ppx[0] + exx, Ppx[1], Ppx[0] + exx, Ppx[1] + eyy, k.green, 2, [5, 3]);
          }
        } else if (n <= 60) {
          var hgt = 34 * rmin / q.r;
          ctx.save(); ctx.fillStyle = rgba(k.purple, back ? 0.35 : 0.7); ctx.fillRect(sp[0] - 3, sp[1] - 8 - hgt, 6, hgt); ctx.restore();
        }
      });
      // the total arrow at P
      if (!isV) { var tot = M.hypot(sumX, sumY), Lt = M.min(picH * 0.5, 150) * tot / (sumMag || 1); if (tot > 1e-12 * sumMag) { var ux2, uy2; if (ring) { ux2 = M.sign(sumX); uy2 = 0; } else { ux2 = sumX / tot; uy2 = -sumY / tot; } arrow(ctx, Ppx[0], Ppx[1], Ppx[0] + ux2 * Lt, Ppx[1] + uy2 * Lt, k.red, 3.4); text(ctx, 'ΣdE', Ppx[0] + ux2 * Lt + (ux2 >= 0 ? 6 : -6), Ppx[1] + uy2 * Lt - 10, { align: ux2 >= 0 ? 'left' : 'right', size: 12.5, weight: 800, color: k.red, halo: k.bg }); } }
      dot(ctx, Ppx[0], Ppx[1], 6, k.gold, k.bg); text(ctx, 'P', Ppx[0] + 9, Ppx[1] + 12, { size: 13, weight: 800, color: k.ink, halo: k.bg });
      // bars
      var by0 = H0 - 102, rows;
      if (!isV) {
        var mx = M.max(sumMag, Eex, Evec) || 1;
        rows = [{ label: 'adding sizes Σ|dE|', v: sumMag, color: rgba(k.orange, 0.85), note: sci(sumMag) + ' N/C (wrong)' }, { label: 'adding vectors |ΣdE|', v: Evec, color: rgba(k.red, 0.85), note: sci(Evec) + ' N/C' }, { label: 'exact (n → ∞)', v: Eex, color: rgba(k.green, 0.85), note: sci(Eex) + ' N/C' }];
        bars(ctx, k, 8, by0, W0 - 16, rows, mx);
      } else {
        var mv = M.max(M.abs(sumV), M.abs(ex.V)) || 1;
        rows = [{ label: 'adding n pieces ΣkΔq/r', v: sumV, color: rgba(k.purple, 0.85), note: sci(sumV) + ' V' }, { label: 'exact (n → ∞)', v: ex.V, color: rgba(k.green, 0.85), note: sci(ex.V) + ' V' }];
        bars(ctx, k, 8, by0 + 14, W0 - 16, rows, mv);
      }
      var where = ring ? 'P on the axis, ' + fm(S.d * 100, 1) + ' cm from the center' : at === 'axis' ? 'P on the rod\'s line, ' + fm(S.d * 100, 1) + ' cm past its end' : 'P ' + fm(S.d * 100, 1) + ' cm from the rod, above ' + (at === 'end' ? 'one end' : 'the middle');
      if (!isV) F.out.set('<b>' + n + '</b> piece' + (n === 1 ? '' : 's') + ', ' + where + '. Adding the vectors: <i>E<sub>x</sub></i> = ' + sci(sumX) + ' N/C, <i>E<sub>y</sub></i> = ' + sci(ring ? 0 : sumY) + ' N/C, so |Σd<i>E</i>| = <b>' + sci(Evec) + '</b> N/C (exact: ' + sci(Eex) + ' N/C). Adding only the sizes would give ' + sci(sumMag) + ' N/C' + (sumMag > 1.02 * Evec ? ', too big, because the ' + (ring ? 'sideways' : at === 'bisector' ? 'sideways' : 'tilted') + ' parts point in different directions and cancel.' : ', the same here, because every arrow points the same way.') + (o.components !== false && n > 1 ? ' <span class="em-key" style="background:' + k.orange + '"></span>and <span class="em-key" style="background:' + k.green + '"></span>show the components of the two highlighted arrows' + (ring || at === 'bisector' ? ', from mirror-image pieces.' : '.') : ''));
      else F.out.set('<b>' + n + '</b> piece' + (n === 1 ? '' : 's') + ', ' + where + '. Potential is a number, not an arrow: each piece adds <i>k</i>Δ<i>q</i>/<i>r</i>, with the same sign as its charge, and nothing cancels. Sum: <b>' + sci(sumV) + '</b> V (exact: ' + sci(ex.V) + ' V).');
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  // ------------------------------------------------------------------ em-share
  V.register('em-share', function (el, o) {
    o = Object.assign({ R1: 2, R2: 6, q1: 8, q2: 0, connected: false }, o || {});
    var S = { R1: nv(o.R1, 2), R2: nv(o.R2, 6), q1: nv(o.q1, 8), q2: nv(o.q2, 0), on: !!o.connected };
    var F = frame(el, o, 'Two metal spheres that can be joined by a wire');
    var c = canvasIn(F, 1.7, 'Two metal spheres of different sizes with their charges, joined or not by a thin wire. Field arrows at each surface show how strong the field is there.', 280, 460);
    V.slider(F.ctl, { label: 'radius of sphere 1 (cm)', min: 1, max: 10, step: 0.5, value: S.R1, fmt: function (v) { return fm(v, 1); }, input: function (v) { S.R1 = v; draw(); } });
    V.slider(F.ctl, { label: 'radius of sphere 2 (cm)', min: 1, max: 10, step: 0.5, value: S.R2, fmt: function (v) { return fm(v, 1); }, input: function (v) { S.R2 = v; draw(); } });
    var btn = V.button(F.ctl, S.on ? 'Cut the wire' : 'Connect the wire', function () { S.on = !S.on; if (!S.on) { var cq = charges(); S.q1 = cq[0]; S.q2 = cq[1]; } btn.textContent = S.on ? 'Cut the wire' : 'Connect the wire'; draw(); });
    function charges() { if (!S.on) return [S.q1, S.q2]; var Qt = S.q1 + S.q2; return [Qt * S.R1 / (S.R1 + S.R2), Qt * S.R2 / (S.R1 + S.R2)]; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, W0 = c.w, H0 = c.h; bg(c, k);
      var q = charges(), R = [S.R1, S.R2], Vv = [0, 1].map(function (i) { return KC * q[i] * 1e-9 / (R[i] / 100); }), Ev = [0, 1].map(function (i) { return KC * q[i] * 1e-9 / M.pow(R[i] / 100, 2); });
      var picH = H0 - 104, sc = M.min((W0 * 0.42) / (2 * 10 + 6), picH / (2 * 10 + 8)), cy = 12 + picH / 2, cx = [W0 * 0.25, W0 * 0.73];
      // wire
      ctx.save(); ctx.strokeStyle = S.on ? k.gold : rgba(k.muted, 0.6); ctx.lineWidth = S.on ? 3 : 2; ctx.setLineDash(S.on ? [] : [6, 6]); ctx.beginPath(); ctx.moveTo(cx[0] + R[0] * sc, cy); ctx.lineTo(cx[1] - R[1] * sc, cy); ctx.stroke(); ctx.restore();
      text(ctx, S.on ? 'wire connected: same potential' : 'no wire', (cx[0] + cx[1]) / 2, cy - 14, { align: 'center', size: 11.5, color: S.on ? k.gold : k.muted, weight: 700, halo: k.bg });
      var Emax = M.max(M.abs(Ev[0]), M.abs(Ev[1])) || 1;
      [0, 1].forEach(function (i) {
        var r = R[i] * sc, x = cx[i], col = q[i] >= 0 ? k.red : k.blue, ns = M.min(28, M.round(M.abs(q[i]) * 2));
        var nA = 12, La = 8 + 36 * M.abs(Ev[i]) / Emax;
        if (M.abs(q[i]) > 1e-9) for (var j = 0; j < nA; j++) { var a = 2 * PI * (j + 0.25) / nA, x1 = x + (r + 3) * M.cos(a), y1 = cy + (r + 3) * M.sin(a), s = q[i] > 0 ? 1 : -1; if (s > 0) arrow(ctx, x1, y1, x1 + La * M.cos(a), y1 + La * M.sin(a), rgba(k.red, 0.75), 1.8); else arrow(ctx, x1 + La * M.cos(a), y1 + La * M.sin(a), x1, y1, rgba(k.blue, 0.75), 1.8); }
        ctx.save(); var g = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.35, r * 0.1, x, cy, r); g.addColorStop(0, k.bg); g.addColorStop(1, rgba('#7b8794', 0.55)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, cy, r, 0, 2 * PI); ctx.fill(); ctx.strokeStyle = '#7b8794'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        for (var m2 = 0; m2 < ns; m2++) { var b = 2 * PI * m2 / M.max(1, ns); text(ctx, q[i] >= 0 ? '+' : '−', x + (r - 7) * M.cos(b), cy + (r - 7) * M.sin(b), { align: 'center', size: 11, weight: 800, color: col }); }
        text(ctx, 'sphere ' + (i + 1), x, cy + r + 54 > picH + 12 ? 20 : cy + r + 48, { align: 'center', size: 11.5, color: k.muted, weight: 700 });
      });
      var mq = M.max(M.abs(q[0]), M.abs(q[1]), 0.01), by0 = H0 - 92;
      bars(ctx, k, 8, by0, W0 - 16, [{ label: 'charge Q₁', v: q[0], color: rgba(k.red, 0.8), note: fm(q[0], 2) + ' nC' }, { label: 'charge Q₂', v: q[1], color: rgba(k.red, 0.8), note: fm(q[1], 2) + ' nC' }], mq);
      text(ctx, 'surface field: E₁ = ' + sci(M.abs(Ev[0])) + ' N/C,  E₂ = ' + sci(M.abs(Ev[1])) + ' N/C', 10, H0 - 22, { size: 11.5, color: k.ink, weight: 600 });
      F.out.set((S.on ? 'Joined by the wire, the spheres reach the <b>same potential</b>, ' + sci(Vv[0]) + ' V. Since <i>V</i> = <i>kQ</i>/<i>R</i>, each charge is proportional to its radius: <i>Q</i>₁ : <i>Q</i>₂ = ' + fm(S.R1, 1) + ' : ' + fm(S.R2, 1) + ', giving <b>' + fm(q[0], 2) + ' nC</b> and <b>' + fm(q[1], 2) + ' nC</b>, not equal halves.' : 'Not joined: sphere 1 holds ' + fm(q[0], 2) + ' nC at ' + sci(Vv[0]) + ' V and sphere 2 holds ' + fm(q[1], 2) + ' nC at ' + sci(Vv[1]) + ' V. Connect the wire and charge flows until the potentials match.') +
        ' Surface fields: <i>E</i> = <i>V</i>/<i>R</i>, so ' + (S.on ? 'the <b>smaller sphere has the stronger field</b> (' + sci(M.abs(Ev[S.R1 < S.R2 ? 0 : 1])) + ' N/C), the reason sharp points spark first.' : 'E₁ = ' + sci(M.abs(Ev[0])) + ' N/C and E₂ = ' + sci(M.abs(Ev[1])) + ' N/C.'));
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw, charges: charges };
  });

  // ------------------------------------------------------------------ em-taper
  V.register('em-taper', function (el, o) {
    o = Object.assign({ r1: 1, r2: 3, L: 20, rho: 1.1e-6, n: 6, maxN: 40 }, o || {});
    var S = { r2: nv(o.r2, 3), n: M.max(1, M.round(nv(o.n, 6))) }, r1 = nv(o.r1, 1), Lc = nv(o.L, 20), rho = nv(o.rho, 1.1e-6);
    var F = frame(el, o, 'A tapered conductor cut into slices, with the resistance added slice by slice');
    var c = canvasIn(F, 1.25, 'A conductor that widens from one end to the other, cut into slices, above a graph of resistivity divided by area along its length.', 320, 540);
    V.slider(F.ctl, { label: 'wide-end radius r₂ (mm)', min: 0.5, max: 6, step: 0.25, value: S.r2, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.r2 = v; draw(); } });
    V.slider(F.ctl, { label: 'slices n', min: 1, max: M.max(2, nv(o.maxN, 40)), step: 1, value: S.n, input: function (v) { S.n = v; draw(); } });
    function rad(x) { return (r1 + (S.r2 - r1) * x / Lc) / 1000; } // x in cm -> radius in m
    function dRdx(x) { var r = rad(x); return rho / (PI * r * r); }   // Ω per meter
    function draw() {
      var k = V.colors(), ctx = c.ctx, W0 = c.w, H0 = c.h, n = S.n; bg(c, k);
      var Lm = Lc / 100, exact = rho * Lm / (PI * (r1 / 1000) * (S.r2 / 1000)), ravg = (r1 + S.r2) / 2000, wrongAvg = rho * Lm / (PI * ravg * ravg), sumS = 0;
      for (var i = 0; i < n; i++) sumS += dRdx((i + 0.5) * Lc / n) * Lm / n;
      // the conductor (side view), scaled so the larger radius fills about 38% of the top half
      var x0 = 40, x1 = W0 - 20, topH = H0 * 0.42, cy = 10 + topH / 2, rmax = M.max(r1, S.r2), sy = (topH * 0.44) / rmax;
      var X = function (xc) { return x0 + (x1 - x0) * xc / Lc; };
      var shareMax = 0, sh = []; for (i = 0; i < n; i++) { var s = dRdx((i + 0.5) * Lc / n) * Lm / n; sh.push(s); shareMax = M.max(shareMax, s); }
      for (i = 0; i < n; i++) { var xa = i * Lc / n, xb = (i + 1) * Lc / n, ra = (r1 + (S.r2 - r1) * xa / Lc) * sy, rb = (r1 + (S.r2 - r1) * xb / Lc) * sy; ctx.save(); ctx.fillStyle = rgba(k.orange, 0.15 + 0.6 * sh[i] / shareMax); ctx.beginPath(); ctx.moveTo(X(xa), cy - ra); ctx.lineTo(X(xb), cy - rb); ctx.lineTo(X(xb), cy + rb); ctx.lineTo(X(xa), cy + ra); ctx.closePath(); ctx.fill(); ctx.strokeStyle = rgba(k.ink, 0.35); ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), cy - r1 * sy); ctx.lineTo(X(Lc), cy - S.r2 * sy); ctx.moveTo(X(0), cy + r1 * sy); ctx.lineTo(X(Lc), cy + S.r2 * sy); ctx.stroke(); ctx.restore();
      text(ctx, 'r₁ = ' + fm(r1, 2) + ' mm', X(0) - 2, cy - r1 * sy - 10, { size: 11, color: k.muted, weight: 700 });
      text(ctx, 'r₂ = ' + fm(S.r2, 2) + ' mm', X(Lc), cy - S.r2 * sy - 10 < 8 ? 10 : cy - S.r2 * sy - 10, { size: 11, color: k.muted, weight: 700, align: 'right' });
      arrow(ctx, 8, cy, X(0) - 4, cy, k.gold, 2.4); text(ctx, 'I', 14, cy - 12, { size: 12, weight: 800, color: k.gold });
      // graph of ρ/A(x)
      var gx = 46, gy = topH + 26, gw = W0 - gx - 16, gh = H0 - gy - 30, ymax = M.max(dRdx(0), dRdx(Lc)) * 1.12;
      var GX = function (xc) { return gx + gw * xc / Lc; }, GY = function (v) { return gy + gh - gh * v / ymax; };
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke(); ctx.restore();
      for (i = 0; i < n; i++) { var xm = (i + 0.5) * Lc / n, v = dRdx(xm); ctx.save(); ctx.fillStyle = rgba(k.orange, 0.35); ctx.strokeStyle = rgba(k.orange, 0.9); ctx.lineWidth = 1; ctx.fillRect(GX(i * Lc / n), GY(v), GX((i + 1) * Lc / n) - GX(i * Lc / n), GY(0) - GY(v)); ctx.strokeRect(GX(i * Lc / n), GY(v), GX((i + 1) * Lc / n) - GX(i * Lc / n), GY(0) - GY(v)); ctx.restore(); }
      ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 2.4; ctx.beginPath(); for (var j = 0; j <= 120; j++) { var xx = Lc * j / 120, px = GX(xx), py = GY(dRdx(xx)); if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); ctx.restore();
      text(ctx, 'ρ/A(x)  (Ω per m)', gx + 6, gy + 6, { size: 11, color: k.blue, weight: 700 });
      text(ctx, 'x along the conductor (cm)', gx + gw / 2, gy + gh + 14, { size: 11, color: k.muted, align: 'center' }); text(ctx, '0', gx, gy + gh + 14, { size: 11, color: k.muted, align: 'center' }); text(ctx, fm(Lc, 0), gx + gw, gy + gh + 14, { size: 11, color: k.muted, align: 'right' });
      F.out.set('<b>' + n + '</b> slice' + (n === 1 ? '' : 's') + ': each adds Δ<i>R</i> = ρΔ<i>x</i>/<i>A</i>, darker where the conductor is thin. Sum of the slices: <b>' + sci(sumS) + ' Ω</b>. The area under the curve, ∫ρ d<i>x</i>/(π<i>r</i>²) = ρ<i>L</i>/(π<i>r</i>₁<i>r</i>₂) = <b>' + sci(exact) + ' Ω</b>. Using one area, at the average radius, would give ' + sci(wrongAvg) + ' Ω' + (M.abs(wrongAvg - exact) > 0.01 * exact ? ', too small: the thin end matters most.' : ', the same only because the conductor barely tapers.'));
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  // ------------------------------------------------------------------ em-decay
  V.register('em-decay', function (el, o) {
    o = Object.assign({ mode: 'rc-discharge', R: 1000, C: 100, L: 2, V0: 12, energy: false, t: 0 }, o || {});
    var mode = ['rc-discharge', 'rc-charge', 'rl-rise', 'rl-decay'].indexOf(o.mode) >= 0 ? o.mode : 'rc-discharge', rc = mode.slice(0, 2) === 'rc';
    var S = { R: nv(o.R, 1000), C: nv(o.C, 100), L: nv(o.L, 2), V0: nv(o.V0, 12), t: nv(o.t, 0) };
    var F = frame(el, o, { 'rc-discharge': 'A capacitor discharging through a resistor', 'rc-charge': 'A capacitor charging through a resistor', 'rl-rise': 'Current rising in an RL circuit', 'rl-decay': 'Current dying away in an RL circuit' }[mode]);
    var c = canvasIn(F, 1.6, 'A graph against time, marked in time constants, with a cursor at the time chosen by the slider.', 260, 420);
    function tau() { return rc ? S.R * S.C * 1e-6 : S.L / S.R; }
    var tsl = null;
    V.slider(F.ctl, { label: 'resistance R (Ω)', min: rc ? 100 : 1, max: rc ? 10000 : 100, step: rc ? 100 : 1, value: S.R, input: function (v) { S.R = v; draw(); } });
    if (rc) V.slider(F.ctl, { label: 'capacitance C (μF)', min: 10, max: 1000, step: 10, value: S.C, input: function (v) { S.C = v; draw(); } });
    else V.slider(F.ctl, { label: 'inductance L (H)', min: 0.1, max: 10, step: 0.1, value: S.L, fmt: function (v) { return fm(v, 1); }, input: function (v) { S.L = v; draw(); } });
    tsl = V.slider(F.ctl, { label: 'time, in time constants', min: 0, max: 5, step: 0.05, value: S.t / tau() || 0, fmt: function (v) { return fm(v, 2) + ' τ'; }, input: function (v) { S.t = v * tau(); draw(); } });
    function draw() {
      var k = V.colors(), ctx = c.ctx, W0 = c.w, H0 = c.h; bg(c, k);
      var T = tau(), gx = 44, gy = 14, gw = W0 - gx - 16, gh = H0 - gy - 40, f = S.t / T;
      var X = function (u) { return gx + gw * u / 5; }, Y = function (y) { return gy + gh - gh * y; };
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; for (var i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(X(i), gy); ctx.lineTo(X(i), gy + gh); ctx.stroke(); } for (var j = 0; j <= 4; j++) { ctx.beginPath(); ctx.moveTo(gx, Y(j / 4)); ctx.lineTo(gx + gw, Y(j / 4)); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke(); ctx.restore();
      for (i = 0; i <= 5; i++) text(ctx, i === 0 ? '0' : i + 'τ', X(i), gy + gh + 13, { align: 'center', size: 11, color: k.muted });
      text(ctx, 't  (τ = ' + sci(T) + ' s)', gx + gw, gy + gh + 28, { align: 'right', size: 11, color: k.muted });
      ['0', '¼', '½', '¾', '1'].forEach(function (s2, jj) { text(ctx, s2, gx - 8, Y(jj / 4), { align: 'right', size: 11, color: k.muted }); });
      function curve(fn, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2.4; ctx.setLineDash(dash || []); ctx.beginPath(); for (var q = 0; q <= 200; q++) { var u = 5 * q / 200, px = X(u), py = Y(fn(u)); if (q) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
      var ex = function (u) { return M.exp(-u); }, rise = function (u) { return 1 - M.exp(-u); }, rd = '', half = M.LN2;
      if (mode === 'rc-discharge') {
        curve(ex, k.green, 2.6); curve(function (u) { return 0.5 * M.exp(-u); }, k.blue, 2.4, [6, 4]);
        if (o.energy) { curve(function (u) { return M.exp(-2 * u); }, k.purple, 2, [2, 3]); text(ctx, 'dotted: stored energy', X(2.4), Y(0.62), { size: 11.5, color: k.purple, weight: 700, halo: k.bg }); }
        ctx.save(); ctx.strokeStyle = rgba(k.muted, 0.8); ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y(0.5)); ctx.lineTo(X(half), Y(0.5)); ctx.moveTo(gx, Y(0.25)); ctx.lineTo(X(half), Y(0.25)); ctx.moveTo(X(half), Y(0.5)); ctx.lineTo(X(half), gy + gh); ctx.stroke(); ctx.restore();
        text(ctx, 't½ = τ ln 2', X(half) + 5, gy + gh - 10, { size: 11, color: k.ink, weight: 700, halo: k.bg });
        text(ctx, 'V_C, starting at ' + fm(S.V0, 1) + ' V', X(0.15), Y(0.95), { size: 11.5, color: k.green, weight: 700, halo: k.bg });
        text(ctx, 'starting at ' + fm(S.V0 / 2, 1) + ' V', X(0.15), Y(0.42), { size: 11.5, color: k.blue, weight: 700, halo: k.bg });
        rd = 'τ = RC = <b>' + sci(T) + ' s</b>. At t = ' + sci(S.t) + ' s (' + fm(f, 2) + 'τ): V<sub>C</sub> = ' + fm(S.V0 * M.exp(-f), 2) + ' V and ' + fm(S.V0 / 2 * M.exp(-f), 2) + ' V, each <b>' + fm(100 * M.exp(-f), 1) + '%</b> of where it started. Both reach half their starting value at t½ = τ ln 2 = <b>' + sci(T * half) + ' s</b>: the half time does not depend on how much charge there was.' + (o.energy ? ' The stored energy (dotted) falls as e<sup>−2t/τ</sup>, so it halves in only ' + sci(T * half / 2) + ' s.' : '');
      } else if (mode === 'rc-charge') {
        curve(rise, k.green, 2.6); curve(ex, k.gold, 2.4, [6, 4]);
        text(ctx, 'V_C / ε', X(3.6), Y(0.9), { size: 11.5, color: k.green, weight: 700, halo: k.bg }); text(ctx, 'I / I₀', X(0.5), Y(0.35), { size: 11.5, color: k.gold, weight: 700, halo: k.bg });
        rd = 'τ = RC = <b>' + sci(T) + ' s</b>. The current starts at its largest, I₀ = ε/R = ' + sci(S.V0 / S.R) + ' A, because the empty capacitor has no voltage to oppose the battery. At t = ' + fm(f, 2) + 'τ: V<sub>C</sub> = ' + fm(S.V0 * rise(f), 2) + ' V (' + fm(100 * rise(f), 1) + '% of ε) and I = ' + sci(S.V0 / S.R * ex(f)) + ' A.';
      } else if (mode === 'rl-rise') {
        curve(rise, k.green, 2.6); curve(ex, k.purple, 2.4, [6, 4]);
        text(ctx, 'I / (ε/R)', X(3.6), Y(0.9), { size: 11.5, color: k.green, weight: 700, halo: k.bg }); text(ctx, 'V_L / ε', X(0.5), Y(0.35), { size: 11.5, color: k.purple, weight: 700, halo: k.bg });
        rd = 'τ = L/R = <b>' + sci(T) + ' s</b>. The current starts at <b>zero</b>: the inductor\'s back emf, L dI/dt, takes the whole battery voltage at first. At t = ' + fm(f, 2) + 'τ: I = ' + sci(S.V0 / S.R * rise(f)) + ' A (' + fm(100 * rise(f), 1) + '% of ε/R = ' + sci(S.V0 / S.R) + ' A) and V<sub>L</sub> = ' + fm(S.V0 * ex(f), 2) + ' V.';
      } else {
        curve(ex, k.green, 2.6);
        text(ctx, 'I / I₀', X(0.5), Y(0.75), { size: 11.5, color: k.green, weight: 700, halo: k.bg });
        rd = 'τ = L/R = <b>' + sci(T) + ' s</b>. The inductor keeps the current going: it cannot jump to zero. At t = ' + fm(f, 2) + 'τ: I = ' + fm(100 * ex(f), 1) + '% of I₀ = ' + sci(S.V0 / S.R * ex(f)) + ' A.';
      }
      ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(M.min(5, f)), gy); ctx.lineTo(X(M.min(5, f)), gy + gh); ctx.stroke(); ctx.restore();
      F.out.set(rd);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });
})(window, document);
