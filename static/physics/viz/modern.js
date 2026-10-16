/* Physics Ladder visuals made for Waves, Optics and Modern Physics (course key modern). Registered on
   window.MathLadder.viz; styles are injected below. Built on the toolkit in static/math/viz/core.js; follows the light or
   dark theme, works with mouse, touch and keyboard (every control is a button), keeps a live text readout, and fits a
   360 px screen.

   modern-quarks   quarks and the conservation laws of particle physics
     mode: 'build' (default)  build a hadron from quarks: pick three quarks (a baryon), three antiquarks (an antibaryon) or a
                              quark and an antiquark (a meson); the picture shows the quarks with their color charges, and
                              the readout adds up charge, baryon number and strangeness and names the particle when it is a
                              well-known one.
           quarks: ['u', 'u', 'd']   the starting quarks (2 or 3 of u d s c b t, with 'bar' for antiquarks: 'dbar')
           fixed: false              true hides the controls (a frozen picture, e.g. inside a problem)
     mode: 'reaction'         checks a reaction or decay law by law: charge Q, baryon number B, lepton numbers L_e, L_μ, L_τ,
                              and (for a decay) whether the products are lighter than the parent.
           before: ['n'], after: ['p', 'e-', 'anti-nu_e']   particle keys: p n e- e+ mu- mu+ tau- tau+ nu_e anti-nu_e nu_mu
                              anti-nu_mu nu_tau anti-nu_tau gamma pi+ pi- pi0 K+ K- K0 Lambda0 Sigma+ Sigma- Xi0 Omega- anti-p
                              anti-n Z0 W+ W-
           presets: true             a row of example reactions to switch between (default true in lesson mode)
     Common: task (text above), label (aria-label), quiet: true (no readout sums; for problems).                        */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/modern.js: load viz/core.js first'); return; }
  var M = Math;

  if (!D.getElementById('mqv-css')) {
    var css = D.createElement('style'); css.id = 'mqv-css';
    css.textContent = [
      '.mqv{--mq-acc:#2d5596;--mq-ok:#00703c;--mq-bad:#c92a2a}',
      'html[data-theme="dark"] .mqv{--mq-acc:#8fb1ea;--mq-ok:#6cc79a;--mq-bad:#ff8787}',
      '.mqv .mqv-task{margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}',
      '.mqv .mqv-box .ml-cv{box-shadow:inset 0 0 0 1px var(--mv-line);border-radius:10px}',
      '.mqv .mqv-row{display:flex;flex-wrap:wrap;gap:.35rem .6rem;align-items:center;margin:.5rem 0 0}',
      '.mqv .mqv-lab{font-size:.82rem;color:var(--mv-muted);min-width:4.2rem}',
      '.mqv .ml-seg{flex-wrap:wrap}',
      '.mqv .ml-seg button{min-width:2.3rem;min-height:36px}',
      '.mqv .ml-seg button[aria-pressed="true"]{background:var(--mq-acc);border-color:var(--mq-acc);color:#fff}',
      'html[data-theme="dark"] .mqv .ml-seg button[aria-pressed="true"]{color:#0f1a24}',
      '.mqv .mqv-bar{text-decoration:overline}',
      '.mqv .mqv-eq{font-size:1.15rem;margin:.2rem 0 .5rem;text-align:center;overflow-wrap:anywhere}',
      '.mqv .mqv-tw{max-width:100%;overflow-x:auto}',
      '.mqv table.mqv-t{border-collapse:collapse;margin:.2rem auto 0;font-size:.92rem;font-variant-numeric:tabular-nums}',
      '.mqv table.mqv-t th,.mqv table.mqv-t td{border:1px solid var(--mv-line);padding:.3rem .6rem;text-align:center}',
      '.mqv table.mqv-t th{background:var(--mv-card);font-weight:650}',
      '.mqv .mqv-ok{color:var(--mq-ok);font-weight:700}.mqv .mqv-no{color:var(--mq-bad);font-weight:700}',
      '.mqv .ml-readout{overflow-wrap:anywhere}'
    ].join('\n');
    D.head.appendChild(css);
  }

  // ---------------------------------------------------------------- data (Particle Data Group values, rounded)
  var Q = { u: [2, 3], d: [-1, 3], s: [-1, 3], c: [2, 3], b: [-1, 3], t: [2, 3] };
  var QNAME = { u: 'up', d: 'down', s: 'strange', c: 'charm', b: 'bottom', t: 'top' };
  // hadrons by sorted quark content
  var HADRONS = {
    'u u d': 'proton (p)', 'u d d': 'neutron (n)', 'u u u': 'Δ⁺⁺', 'd d d': 'Δ⁻', 'u d s': 'Λ⁰ or Σ⁰', 'u u s': 'Σ⁺', 'd d s': 'Σ⁻',
    'u s s': 'Ξ⁰', 'd s s': 'Ξ⁻', 's s s': 'Ω⁻', 'u d c': 'Λc⁺', 'u u c': 'Σc⁺⁺',
    'ubar ubar dbar': 'antiproton (p̄)', 'ubar dbar dbar': 'antineutron (n̄)', 'sbar sbar sbar': 'anti-Ω (Ω̄⁺)',
    'u dbar': 'pion π⁺', 'd ubar': 'pion π⁻', 'u ubar': 'π⁰ (a mix of uū and dd̄)', 'd dbar': 'π⁰ (a mix of uū and dd̄)',
    'u sbar': 'kaon K⁺', 's ubar': 'kaon K⁻', 'd sbar': 'kaon K⁰', 's dbar': 'anti-kaon K̄⁰', 's sbar': 'φ meson',
    'c ubar': 'D⁰ meson', 'c dbar': 'D⁺ meson', 'c cbar': 'J/ψ meson', 'b bbar': 'Υ (upsilon) meson', 'u bbar': 'B⁺ meson', 'b ubar': 'B⁻ meson'
  };
  // particles for reactions: [label HTML, Q, B, Le, Lmu, Ltau, mass MeV]
  function bar(s) { return '<span class="mqv-bar">' + s + '</span>'; }
  var P = {
    'p': ['p', 1, 1, 0, 0, 0, 938.27], 'n': ['n', 0, 1, 0, 0, 0, 939.57], 'anti-p': [bar('p'), -1, -1, 0, 0, 0, 938.27], 'anti-n': [bar('n'), 0, -1, 0, 0, 0, 939.57],
    'e-': ['e⁻', -1, 0, 1, 0, 0, 0.511], 'e+': ['e⁺', 1, 0, -1, 0, 0, 0.511], 'mu-': ['μ⁻', -1, 0, 0, 1, 0, 105.66], 'mu+': ['μ⁺', 1, 0, 0, -1, 0, 105.66],
    'tau-': ['τ⁻', -1, 0, 0, 0, 1, 1776.9], 'tau+': ['τ⁺', 1, 0, 0, 0, -1, 1776.9],
    'nu_e': ['ν<sub>e</sub>', 0, 0, 1, 0, 0, 0], 'anti-nu_e': [bar('ν') + '<sub>e</sub>', 0, 0, -1, 0, 0, 0], 'nu_mu': ['ν<sub>μ</sub>', 0, 0, 0, 1, 0, 0], 'anti-nu_mu': [bar('ν') + '<sub>μ</sub>', 0, 0, 0, -1, 0, 0],
    'nu_tau': ['ν<sub>τ</sub>', 0, 0, 0, 0, 1, 0], 'anti-nu_tau': [bar('ν') + '<sub>τ</sub>', 0, 0, 0, 0, -1, 0],
    'gamma': ['γ', 0, 0, 0, 0, 0, 0], 'pi+': ['π⁺', 1, 0, 0, 0, 0, 139.57], 'pi-': ['π⁻', -1, 0, 0, 0, 0, 139.57], 'pi0': ['π⁰', 0, 0, 0, 0, 0, 134.98],
    'K+': ['K⁺', 1, 0, 0, 0, 0, 493.68], 'K-': ['K⁻', -1, 0, 0, 0, 0, 493.68], 'K0': ['K⁰', 0, 0, 0, 0, 0, 497.61],
    'Lambda0': ['Λ⁰', 0, 1, 0, 0, 0, 1115.68], 'Sigma+': ['Σ⁺', 1, 1, 0, 0, 0, 1189.37], 'Sigma-': ['Σ⁻', -1, 1, 0, 0, 0, 1197.45], 'Xi0': ['Ξ⁰', 0, 1, 0, 0, 0, 1314.86], 'Omega-': ['Ω⁻', -1, 1, 0, 0, 0, 1672.45],
    'Z0': ['Z⁰', 0, 0, 0, 0, 0, 91188], 'W+': ['W⁺', 1, 0, 0, 0, 0, 80377], 'W-': ['W⁻', -1, 0, 0, 0, 0, 80377]
  };
  var PRESETS = [
    [['n'], ['p', 'e-', 'anti-nu_e'], 'neutron decay'], [['n'], ['p', 'e-'], 'no antineutrino'], [['p'], ['e+', 'gamma'], 'proton decay?'],
    [['pi+'], ['mu+', 'nu_mu'], 'pion decay'], [['mu-'], ['e-', 'anti-nu_e', 'nu_mu'], 'muon decay'], [['mu-'], ['e-', 'gamma'], 'μ → e γ?'],
    [['p', 'p'], ['p', 'n', 'pi+'], 'collision'], [['p'], ['n', 'e+', 'nu_e'], 'free proton → n?']
  ];

  function frac(n, d) { // reduced fraction as text with a real minus sign
    if (n === 0) return '0'; var g = (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(M.abs(n), d); n /= g; d /= g;
    return (n < 0 ? '−' : '+') + M.abs(n) + (d === 1 ? '' : '/' + d);
  }
  function qText(k) { var anti = /bar$/.test(k), f = k.replace('bar', ''); return anti ? bar(f) : f; }
  function frame(el, o, label) {
    el.classList.add('mqv'); el.setAttribute('role', 'group'); if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {}; if (o.task) { F.task = V.el('p', 'mqv-task', o.task); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = V.el('div', 'mqv-box'); el.appendChild(F.box); F.ctl = V.el('div', 'mqv-ctl'); el.appendChild(F.ctl); F.out = V.readout(el);
    if (o.quiet || o.readout === false) F.out.el.hidden = true;
    return F;
  }

  // ---------------------------------------------------------------- build mode
  function build(el, o) {
    var F = frame(el, o, 'Build a hadron from quarks');
    var start = (o.quarks && o.quarks.length ? o.quarks : ['u', 'u', 'd']).slice(0, 3).map(String);
    var anti = function (k) { return /bar$/.test(k); };
    var kind = start.length === 2 ? 'meson' : start.every(anti) ? 'antibaryon' : 'baryon';
    var qs = start.slice();
    function normalize() { // make the slots match the kind
      if (kind === 'meson') { qs = [qs[0] && !anti(qs[0]) ? qs[0] : 'u', qs[1] && anti(qs[1]) ? qs[1] : 'dbar']; }
      else if (kind === 'baryon') { qs = [0, 1, 2].map(function (i) { var k = qs[i] || 'u'; return anti(k) ? k.replace('bar', '') : k; }); }
      else { qs = [0, 1, 2].map(function (i) { var k = qs[i] || 'ubar'; return anti(k) ? k : k + 'bar'; }); }
    }
    normalize();
    var c = V.canvas(F.box, { aspect: 1.9, max: 280, min: 230 });
    var segs = [];
    function controls() {
      F.ctl.innerHTML = '';
      if (o.fixed || o.interactive === false) return;
      var r0 = V.el('div', 'mqv-row'); F.ctl.appendChild(r0);
      V.seg(r0, { label: 'Kind of hadron', items: [['baryon', 'Baryon: 3 quarks'], ['meson', 'Meson: quark + antiquark'], ['antibaryon', 'Antibaryon']], value: kind, change: function (v) { kind = v; normalize(); controls(); draw(); } });
      segs = qs.map(function (k, i) {
        var row = V.el('div', 'mqv-row'); F.ctl.appendChild(row);
        var isA = anti(k); row.appendChild(V.el('span', 'mqv-lab', (isA ? 'Antiquark ' : 'Quark ') + (i + 1)));
        var items = 'udscbt'.split('').map(function (f) { return [isA ? f + 'bar' : f, isA ? bar(f) : f]; });
        return V.seg(row, { label: (isA ? 'Antiquark ' : 'Quark ') + (i + 1), items: items, value: k, change: function (v) { qs[i] = v; draw(); } });
      });
    }
    function sums() {
      var num = 0, B = 0, S = 0; // charge in thirds
      qs.forEach(function (k) { var f = k.replace('bar', ''), s = anti(k) ? -1 : 1; num += s * Q[f][0]; B += s; if (f === 's') S += -s; });
      return { q3: num, B3: B, S: S };
    }
    function name() { // canonical order: quarks before antiquarks, flavors in the order u d s c b t
      var ord = function (k) { return (anti(k) ? 10 : 0) + 'udscbt'.indexOf(k.replace('bar', '')); };
      return HADRONS[qs.slice().sort(function (a, b) { return ord(a) - ord(b); }).join(' ')] || null;
    }
    function draw() {
      c.fit(); var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h; ctx.clearRect(0, 0, w, h); ctx.fillStyle = k.panel || k.bg; ctx.fillRect(0, 0, w, h);
      var dark = D.documentElement.getAttribute('data-theme') === 'dark', ink2 = dark ? '#0f1a24' : '#fff';
      var cx = w / 2, cy = h / 2 + 8, R = M.min(h * 0.40, w * 0.34);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * M.PI); ctx.fillStyle = k.blueSoft || 'rgba(45,85,150,.1)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = k.muted; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
      var cols = kind === 'meson' ? [k.red, k.teal] : kind === 'baryon' ? [k.red, k.green, k.blue] : [k.teal, k.pink, k.gold];
      var n = qs.length, rq = M.max(16, M.min(30, R * 0.33));
      var pos = qs.map(function (q, i) { var a = -M.PI / 2 + i * 2 * M.PI / n + (n === 2 ? M.PI / 2 : 0); return [cx + R * 0.48 * M.cos(a), cy + R * 0.48 * M.sin(a)]; });
      // gluon "springs" between the quarks
      ctx.strokeStyle = k.gold; ctx.lineWidth = 2;
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) { var a = pos[i], b = pos[j], L = M.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L; ctx.beginPath(); for (var s = 0; s <= 40; s++) { var t = s / 40, wv = M.sin(t * M.PI * 8) * 4; ctx.lineTo(a[0] + (b[0] - a[0]) * t + nx * wv, a[1] + (b[1] - a[1]) * t + ny * wv); } ctx.stroke(); }
      qs.forEach(function (q, i) {
        var p = pos[i], f = q.replace('bar', ''); ctx.beginPath(); ctx.arc(p[0], p[1], rq, 0, 2 * M.PI); ctx.fillStyle = cols[i % cols.length]; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = k.ink; ctx.stroke();
        ctx.fillStyle = ink2; ctx.font = '700 ' + M.round(rq * 0.95) + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f, p[0], p[1] + 1);
        if (anti(q)) { ctx.strokeStyle = ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p[0] - rq * 0.35, p[1] - rq * 0.55); ctx.lineTo(p[0] + rq * 0.35, p[1] - rq * 0.55); ctx.stroke(); }
        var qq = Q[f], sg = anti(q) ? -1 : 1, lab = frac(sg * qq[0], qq[1]); ctx.font = '700 12px system-ui, sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = k.panel || k.bg; ctx.strokeText(lab, p[0], p[1] + rq + 12); ctx.fillStyle = k.ink; ctx.fillText(lab, p[0], p[1] + rq + 12);
      });
      ctx.fillStyle = k.muted; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(kind === 'meson' ? 'color + anticolor = neutral' : kind === 'baryon' ? 'red + green + blue = neutral' : 'three anticolors = neutral', 10, 18);
      var S = sums(), nm = name();
      var qtxt = qs.map(qText).join(''), parts = qs.map(function (q) { var f = q.replace('bar', ''), sg = anti(q) ? -1 : 1; return frac(sg * Q[f][0], Q[f][1]); }).join(' ');
      var chg = S.q3 / 3, Bn = S.B3 / 3;
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', 'A ' + kind + ' made of ' + qs.map(function (q) { return (anti(q) ? 'anti-' : '') + QNAME[q.replace('bar', '')]; }).join(', ') + ' quarks.');
      F.out.set('<b>' + qtxt + '</b>: charge ' + parts.replace(/ /g, ' ').replace(/\+/g, '+') + ' = <b>' + (chg > 0 ? '+' : chg < 0 ? '−' : '') + M.abs(chg) + '</b>, baryon number <b>' + (Bn < 0 ? '−' : '') + M.abs(Bn) + '</b>, strangeness <b>' + (S.S < 0 ? '−' : S.S > 0 ? '+' : '') + M.abs(S.S) + '</b>' + (nm ? '. This is the <b>' + nm + '</b>.' : '. (A real ' + kind + ', but not one of the common ones named here.)') + ' Quark charges are fractions, yet every hadron’s total is a whole number.');
    }
    controls(); c.onResize(draw); V.onTheme(draw); draw();
    return {};
  }

  // ---------------------------------------------------------------- reaction mode
  function reaction(el, o) {
    var F = frame(el, o, 'Checking a particle reaction against the conservation laws');
    var cur = { before: (o.before || ['n']).filter(function (k) { return P[k]; }), after: (o.after || ['p', 'e-', 'anti-nu_e']).filter(function (k) { return P[k]; }) };
    var eq = V.el('p', 'mqv-eq'); F.box.appendChild(eq);
    var tw = V.el('div', 'mqv-tw'); F.box.appendChild(tw);
    if (o.presets !== false && o.interactive !== false && !o.fixed) {
      var row = V.el('div', 'mqv-row'); F.ctl.appendChild(row);
      var items = PRESETS.map(function (pr, i) { return [String(i), pr[2]]; });
      var match = PRESETS.findIndex(function (pr) { return pr[0].join() === cur.before.join() && pr[1].join() === cur.after.join(); });
      V.seg(row, { label: 'Example reactions', items: items, value: match >= 0 ? String(match) : '', change: function (v) { var pr = PRESETS[+v]; cur = { before: pr[0].slice(), after: pr[1].slice() }; draw(); } });
    }
    function sum(list, i) { return list.reduce(function (s, k) { return s + P[k][i]; }, 0); }
    function sgn(x) { return x > 0 ? '+' + x : x < 0 ? '−' + M.abs(x) : '0'; }
    function draw() {
      eq.innerHTML = cur.before.map(function (k) { return P[k][0]; }).join(' + ') + ' &rarr; ' + cur.after.map(function (k) { return P[k][0]; }).join(' + ');
      var rows = [['Charge Q', 1], ['Baryon number B', 2], ['Lepton number L<sub>e</sub>', 3], ['Lepton number L<sub>μ</sub>', 4], ['Lepton number L<sub>τ</sub>', 5]], bad = [];
      var html = '<table class="mqv-t"><thead><tr><th scope="col">Quantity</th><th scope="col">Before</th><th scope="col">After</th><th scope="col">Conserved?</th></tr></thead><tbody>';
      rows.forEach(function (r) { var a = sum(cur.before, r[1]), b = sum(cur.after, r[1]), ok = a === b; if (!ok) bad.push(r[0].replace(/<[^>]+>/g, '')); html += '<tr><th scope="row">' + r[0] + '</th><td>' + sgn(a) + '</td><td>' + sgn(b) + '</td><td class="' + (ok ? 'mqv-ok">✓ yes' : 'mqv-no">✗ no') + '</td></tr>'; });
      var decay = cur.before.length === 1, mOk = true;
      if (decay) { var m0 = sum(cur.before, 6), m1 = sum(cur.after, 6); mOk = m1 < m0; if (!mOk) bad.push('energy'); html += '<tr><th scope="row">Rest energy (MeV)</th><td>' + V.fmt(m0, 1) + '</td><td>' + V.fmt(m1, 1) + '</td><td class="' + (mOk ? 'mqv-ok">✓ lighter' : 'mqv-no">✗ heavier') + '</td></tr>'; }
      tw.innerHTML = html + '</tbody></table>';
      var txt = eq.textContent;
      F.out.set(bad.length ? 'Forbidden: <b>' + bad.join(', ') + '</b> ' + (bad.length > 1 ? 'are' : 'is') + ' not conserved.' + (decay && mOk ? ' (A decay also needs lighter products; that part is fine.)' : '') : 'Allowed by every law checked here' + (decay ? ', and the products are lighter, so the leftover rest energy becomes kinetic energy.' : '.') + (cur.before.length === 2 ? ' (A collision also needs enough kinetic energy to make the products’ extra mass.)' : ''));
      el.setAttribute('aria-label', (o.label || 'Conservation check') + ': ' + txt);
    }
    draw();
    return {};
  }

  V.register('modern-quarks', function (el, o) { o = o || {}; return o.mode === 'reaction' ? reaction(el, o) : build(el, o); });
})(window, document);
