/* Molecular symmetry: apply a turn, a mirror or an inversion to a molecule and watch it land on itself. */
(function () {
  var s3 = Math.sqrt(3), k = 0.63;
  function ring(n, r, z, a0) { var o = []; for (var i = 0; i < n; i++) { var a = (a0 || 0) + 2 * Math.PI * i / n; o.push([r * Math.cos(a), r * Math.sin(a), z]); } return o; }
  var X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  var M = [
    { n: 'Water', f: 'H₂O', g: 'C2v', ord: 4, at: [['O', [0, 0, 0.25]], ['H', [0.76, 0, -0.35]], ['H', [-0.76, 0, -0.35]]], b: [[0, 1], [0, 2]],
      ops: [{ t: 'rot', ax: Z, deg: 180, n: 'Half-turn (C₂)' }, { t: 'ref', nv: X, n: 'Mirror across the middle (σ)' }, { t: 'ref', nv: Y, n: 'Mirror in its own plane (σ)' }] },
    { n: 'Ammonia', f: 'NH₃', g: 'C3v', ord: 6, at: [['N', [0, 0, 0.3]]].concat(ring(3, 0.94, -0.12).map(function (p) { return ['H', p]; })), b: [[0, 1], [0, 2], [0, 3]],
      ops: [{ t: 'rot', ax: Z, deg: 120, n: 'Third-turn (C₃)' }, { t: 'ref', nv: Y, n: 'Mirror through one N–H bond (σ)' }] },
    { n: 'Boron trifluoride', f: 'BF₃', g: 'D3h', ord: 12, at: [['B', [0, 0, 0]]].concat(ring(3, 1.3, 0).map(function (p) { return ['F', p]; })), b: [[0, 1], [0, 2], [0, 3]],
      ops: [{ t: 'rot', ax: Z, deg: 120, n: 'Third-turn (C₃)' }, { t: 'rot', ax: X, deg: 180, n: 'Half-turn about a B–F bond (C₂)' }, { t: 'ref', nv: Z, n: 'Mirror in its own plane (σh)' }] },
    { n: 'Methane', f: 'CH₄', g: 'Td', ord: 24, at: [['C', [0, 0, 0]], ['H', [k, k, k]], ['H', [k, -k, -k]], ['H', [-k, k, -k]], ['H', [-k, -k, k]]], b: [[0, 1], [0, 2], [0, 3], [0, 4]],
      ops: [{ t: 'rot', ax: [1 / s3, 1 / s3, 1 / s3], deg: 120, n: 'Third-turn about a C–H bond (C₃)' }, { t: 'rot', ax: X, deg: 180, n: 'Half-turn (C₂)' },
        { t: 'ref', nv: [0, Math.SQRT1_2, -Math.SQRT1_2], n: 'Mirror through two C–H bonds (σd)' }, { t: 'srot', ax: X, deg: 90, n: 'Quarter-turn, then mirror (S₄)' }] },
    { n: 'Benzene', f: 'C₆H₆', g: 'D6h', ord: 24, at: ring(6, 1.4, 0).map(function (p) { return ['C', p]; }).concat(ring(6, 2.45, 0).map(function (p) { return ['H', p]; })),
      b: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]],
      ops: [{ t: 'rot', ax: Z, deg: 60, n: 'Sixth-turn (C₆)' }, { t: 'rot', ax: X, deg: 180, n: 'Half-turn across the ring (C₂)' }, { t: 'ref', nv: Z, n: 'Mirror in its own plane (σh)' }, { t: 'inv', n: 'Inversion through the center (i)' }] }
  ];
  var CPK = { H: ['#f4f4f4', '#e9eef0'], C: ['#4a4f55', '#9aa3ab'], N: ['#3050c8', '#6d8cf0'], O: ['#d0302a', '#f0645c'], B: ['#e0a080', '#f0b898'], F: ['#58b04a', '#7fd070'] };
  function rotv(p, a, th) { var c = Math.cos(th), s = Math.sin(th), d = p[0] * a[0] + p[1] * a[1] + p[2] * a[2];
    var cr = [a[1] * p[2] - a[2] * p[1], a[2] * p[0] - a[0] * p[2], a[0] * p[1] - a[1] * p[0]];
    return [p[0] * c + cr[0] * s + a[0] * d * (1 - c), p[1] * c + cr[1] * s + a[1] * d * (1 - c), p[2] * c + cr[2] * s + a[2] * d * (1 - c)]; }
  function refv(p, nv, t) { var d = p[0] * nv[0] + p[1] * nv[1] + p[2] * nv[2]; return [p[0] - 2 * t * d * nv[0], p[1] - 2 * t * d * nv[1], p[2] - 2 * t * d * nv[2]]; }
  Cx.viz('mpc-molsym', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}');
    var mi = 4, P, P0, lab, oi = -1, anim = null, yaw = -0.5, pitch = 0.9, drag = null;
    root.innerHTML = '<div class="vb-row vb-wrap" role="group" aria-label="Molecule">' + M.map(function (m, i) { return '<button type="button" class="cx-btn" data-m="' + i + '" aria-pressed="false">' + m.f + '</button>'; }).join('') + '</div>' +
      '<canvas class="vb-cv" role="img"></canvas><div class="vb-row vb-wrap vb-ops" role="group" aria-label="Symmetry operations"></div><p class="vb-cap" aria-live="polite"></p><p class="vb-note">Drag the molecule to look at it from another side.</p>';
    var cv = root.querySelector('canvas'), cap = root.querySelector('.vb-cap'), opsEl = root.querySelector('.vb-ops');
    root.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { pick(+b.dataset.m); }; });
    cv.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY, yaw, pitch]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; yaw = drag[2] + (e.clientX - drag[0]) / 110; pitch = Math.max(-1.5, Math.min(1.5, drag[3] + (e.clientY - drag[1]) / 110)); draw(); });
    cv.addEventListener('pointerup', function () { drag = null; });
    function pick(i) {
      mi = i; oi = -1; anim = null; var m = M[i]; pitch = [0.25, 0.3, 0.6, 0.35, 0.9][i]; yaw = [-0.35, -0.4, -0.4, -0.35, -0.5][i];
      P = m.at.map(function (a) { return a[1].slice(); });
      var h = 0; lab = m.at.map(function (a) { return a[0] === 'H' || a[0] === 'F' ? a[0] + (++h) : a[0]; });
      if (m.f === 'C₆H₆') { h = 0; lab = lab.map(function (l) { return l === 'C' ? 'C' + (++h) : l; }); }
      root.querySelectorAll('[data-m]').forEach(function (b) { var on = +b.dataset.m === i; b.setAttribute('aria-pressed', on); b.classList.toggle('vb-on', on); });
      opsEl.innerHTML = m.ops.map(function (o, j) { return '<button type="button" class="cx-btn" data-o="' + j + '">' + o.n + '</button>'; }).join('') + '<button type="button" class="cx-btn" data-o="r">Reset numbers</button>';
      opsEl.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function () { b.dataset.o === 'r' ? pick(mi) : run(+b.dataset.o); }; });
      cap.innerHTML = '<b>' + m.n + ' (' + m.f + ')</b> has ' + m.ord + ' symmetry operations in all, counting "do nothing". Chemists call its group <b>' + m.g[0] + '<sub>' + m.g.slice(1) + '</sub>' + '</b>. Pick an operation: the atoms move, but the molecule lands on itself. Only the numbers show that anything happened.';
      draw();
    }
    function at(o, p, t) {
      if (o.t === 'rot') return rotv(p, o.ax, o.deg * Math.PI / 180 * t);
      if (o.t === 'ref') return refv(p, o.nv, t);
      if (o.t === 'inv') return [p[0] * (1 - 2 * t), p[1] * (1 - 2 * t), p[2] * (1 - 2 * t)];
      var r = rotv(p, o.ax, o.deg * Math.PI / 180 * Math.min(1, t * 2)); return refv(r, o.ax, Math.max(0, t * 2 - 1));
    }
    function run(j) {
      if (anim) { var po = M[mi].ops[oi]; P = P0.map(function (p) { return at(po, p, 1); }); anim = null; }
      var o = M[mi].ops[j]; oi = j; P0 = P.map(function (p) { return p.slice(); });
      if (U.still()) { P = P0.map(function (p) { return at(o, p, 1); }); done(); return; }
      var t0 = performance.now();
      var me = function (t) { if (anim !== me) return; var u = Math.min(1, (t - t0) / 1400); u = u * u * (3 - 2 * u); P = P0.map(function (p) { return at(o, p, u); }); draw(); if (u < 1) requestAnimationFrame(me); else { anim = null; done(); } };
      anim = me; requestAnimationFrame(me);
    }
    function done() {
      draw(); var m = M[mi], o = m.ops[oi], moved = [];
      m.at.forEach(function (a, i) { var best = 0, bd = 1e9; m.at.forEach(function (b, j) { var d = Math.hypot(P[i][0] - b[1][0], P[i][1] - b[1][1], P[i][2] - b[1][2]); if (d < bd) { bd = d; best = j; } }); if (best !== i && /\d/.test(lab[i])) moved.push(lab[i]); });
      cap.innerHTML = '<b>' + o.n + ':</b> the molecule looks exactly as before. ' + (moved.length ? 'These atoms swapped places: ' + moved.join(', ') + '.' : 'Every atom stayed in its own place.');
    }
    function draw() {
      var m = M[mi], col = U.colors(), c = U.size(cv, cv.parentNode.clientWidth < 500 ? 0.85 : 0.5), ctx = c.ctx, w = c.w, h = c.h, dk = U.dark();
      var sc = Math.min(w, h) * (m.f === 'C₆H₆' ? 0.17 : 0.27), cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      function pr(p) { var x1 = p[0] * cy - p[1] * sy, y1 = p[0] * sy + p[1] * cy, y2 = y1 * cp - p[2] * sp, z2 = y1 * sp + p[2] * cp; return [w / 2 + sc * x1, h / 2 - sc * z2, y2]; }
      ctx.fillStyle = col.bg2; ctx.fillRect(0, 0, w, h);
      var o = oi >= 0 ? m.ops[oi] : null;
      if (o && (o.t === 'ref' || o.t === 'srot')) { // the mirror plane
        var nv = o.t === 'ref' ? o.nv : o.ax, u = Math.abs(nv[2]) < 0.9 ? [nv[1], -nv[0], 0] : [1, 0, 0], ul = Math.hypot(u[0], u[1], u[2]); u = u.map(function (q) { return q / ul; });
        var v = [nv[1] * u[2] - nv[2] * u[1], nv[2] * u[0] - nv[0] * u[2], nv[0] * u[1] - nv[1] * u[0]], R = m.f === 'C₆H₆' ? 2.8 : 1.15;
        ctx.beginPath(); [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(function (q, i) { var p = pr([R * (q[0] * u[0] + q[1] * v[0]), R * (q[0] * u[1] + q[1] * v[1]), R * (q[0] * u[2] + q[1] * v[2])]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
        ctx.closePath(); ctx.fillStyle = col.accent; ctx.globalAlpha = 0.16; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = col.accent; ctx.lineWidth = 1; ctx.stroke();
      }
      if (o && (o.t === 'rot' || o.t === 'srot')) { var R2 = m.f === 'C₆H₆' ? 3 : 1.5, a = pr(o.ax.map(function (q) { return q * R2; })), b = pr(o.ax.map(function (q) { return -q * R2; }));
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.setLineDash([6, 4]); ctx.strokeStyle = col.accent; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
      if (o && o.t === 'inv') { var z = pr([0, 0, 0]); ctx.beginPath(); ctx.arc(z[0], z[1], 5, 0, 7); ctx.fillStyle = col.accent; ctx.fill(); }
      var Q = P.map(pr);
      ctx.lineCap = 'round';
      m.b.forEach(function (bd) { var a = Q[bd[0]], b = Q[bd[1]]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = col.dim; ctx.lineWidth = 5; ctx.stroke(); });
      var idx = Q.map(function (q, i) { return i; }).sort(function (a, b) { return Q[b][2] - Q[a][2]; });
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      idx.forEach(function (i) {
        var e = m.at[i][0], q = Q[i], r = sc * (e === 'H' ? 0.22 : 0.34) * (1 - q[2] * 0.06), cc = CPK[e][dk ? 1 : 0];
        var g = ctx.createRadialGradient(q[0] - r * 0.35, q[1] - r * 0.35, r * 0.1, q[0], q[1], r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, cc); g.addColorStop(1, cc);
        ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = col.lead; ctx.lineWidth = 1; ctx.stroke();
        if (/\d/.test(lab[i])) { ctx.font = 'bold ' + Math.max(10, Math.round(r * 0.8)) + 'px system-ui, sans-serif'; ctx.fillStyle = e === 'H' || e === 'B' ? '#1d2420' : '#fff'; ctx.fillText(lab[i].replace(/\D/g, ''), q[0], q[1] + 0.5); }
      });
      cv.setAttribute('aria-label', m.n + ' molecule' + (o ? ', showing ' + o.n : ''));
    }
    pick(mi); U.onResize(root, draw); U.onTheme(draw);
  });
  function VU(v, css) {
    if (css && !document.getElementById('vb-css-' + v.id)) { var st = document.createElement('style'); st.id = 'vb-css-' + v.id; st.textContent = css; document.head.appendChild(st); }
    v.stage.classList.add('vb-st');
    return {
      dark: v.dark, still: function () { return v.reduced; }, onTheme: v.onTheme,
      colors: function () { var c = v.colors(), d = c.dark; return { bg2: c.bg, fg: c.ink, dim: c.muted, accent: c.green, gold: c.gold, lead: d ? '#0b0d0e' : '#2a2622',
        glass: d ? ['#4a86e8', '#e0584a', '#e6b93e', '#3faa72', '#9a6ad6', '#4fb8c8'] : ['#2d63b8', '#c0392b', '#d9a521', '#2e8b57', '#7a4bb0', '#2a9bb0'] }; },
      size: function (cv, ratio) {
        var w = cv.parentNode.clientWidth || 600, h = Math.round(w * ratio), r = Math.min(2, window.devicePixelRatio || 1);
        if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.height = h + 'px'; }
        var ctx = cv.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0); return { ctx: ctx, w: w, h: h };
      },
      onResize: function (el, f) { var t, lw = el.clientWidth; try { new ResizeObserver(function () { if (!el.clientWidth || el.clientWidth === lw) return; lw = el.clientWidth; clearTimeout(t); t = setTimeout(f, 80); }).observe(el); } catch (e) { } }
    };
  }
})();
