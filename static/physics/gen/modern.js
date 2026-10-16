/* Physics Ladder: problem generators for Waves, Optics and Modern Physics (course key "modern").
   One generator per topic of data/physics/topics/modern.json, registered with MathLadder.gen, unit by unit in the order of
   the skill map. Built from /tmp/work_modern/gen/*.js by build_gen.js.
   Conventions (Physics Ladder overview): SI units; answers carry `unit` and a relative tolerance (rtol 0.02, 0.03 for
   multi-step work with rounded constants); data are given to 2 or 3 significant figures. Constants: c = 3.00 × 10⁸ m/s,
   h = 6.626 × 10⁻³⁴ J·s, ħ = 1.055 × 10⁻³⁴ J·s, hc = 1240 eV·nm, ħc = 197.3 eV·nm, e = 1.602 × 10⁻¹⁹ C,
   m_e c² = 0.511 MeV, m_p c² = 938.3 MeV, 1 u = 931.5 MeV/c², k_B = 8.617 × 10⁻⁵ eV/K, σ = 5.67 × 10⁻⁸ W/(m²·K⁴),
   Wien b = 2.898 × 10⁻³ m·K, a₀ = 0.0529 nm, R_H = 1.097 × 10⁷ m⁻¹, h/(m_e c) = 2.426 pm. Atomic masses: AME 2020.
   Optics signs: "real is positive" (f > 0 converging; d_i > 0 real image); lensmaker R > 0 when the center of curvature is
   on the outgoing side. Relativity: β = v/c, γ = 1/√(1 − β²); x′ = γ(x − vt), t′ = γ(t − vx/c²).
   ML.__modernTest (set only by the course's verification script in the builder's work folder) receives the givens of each
   problem so that a separate script can recompute every answer by another route. It is never set on the site. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, U = ML.util, M = Math, PI = M.PI;
  var C = 3.00e8, HP = 6.626e-34, HBAR = 1.055e-34, QE = 1.602e-19, ME = 9.109e-31, MP = 1.673e-27, HC = 1240, HBARC = 197.3,
    MEC2 = 0.511, MPC2 = 938.3, MNC2 = 939.6, UMEV = 931.5, KBEV = 8.617e-5, KB = 1.381e-23, SIGMA = 5.67e-8, WIEN = 2.898e-3,
    A0 = 0.0529, RH = 1.097e7, LCOMP = 2.426, KE = 8.99e9, GN = 6.674e-11;
  function rec(id, d) { if (ML.__modernTest) ML.__modernTest(id, d); }
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function lv(ctx) { return (ctx && ctx.level) || 1; }

  // ---------- numbers ----------
  function rnd(x, n) { if (!isFinite(x) || x === 0) return x; return +x.toPrecision(n || 3); }
  /* nx(x, n): TeX for x with n significant figures (default 3): 0.0346, 2.50, 1240, 12{,}400, 3.00 \times 10^{8} */
  function nx(x, n) {
    n = n || 3; if (x === 0) return '0'; if (!isFinite(x)) return '?';
    var neg = x < 0, a = rnd(M.abs(x), n), e = M.floor(M.log10(a) + 1e-12), s;
    if (e >= 5 || e <= -4) { var m = a / M.pow(10, e); if (+m.toFixed(n - 1) >= 10) { e += 1; m /= 10; } s = m.toFixed(n - 1) + ' \\times 10^{' + e + '}'; }
    else { s = a.toFixed(M.max(0, n - 1 - e)); if (e >= 4) s = s.replace(/^(\d+)(\d{3})/, '$1{,}$2'); }
    return (neg ? '-' : '') + s;
  }
  /* av(x, n): the answer string for a spec (4 significant figures by default; scientific as "1.234e-7") */
  function av(x, n) {
    n = n || 4; var a = rnd(x, n); if (a === 0) return '0';
    var e = M.floor(M.log10(M.abs(a)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = +(a / M.pow(10, e)).toPrecision(n); return String(m) + 'e' + e; }
    return String(a);
  }
  function num(x, rt, n) { return { t: 'num', v: av(x, n), rtol: rt || 0.02 }; }
  function exact(v) { return { t: 'num', v: String(v) }; }
  /* qu(x, unit, n): a quantity in TeX: "2.50\,\text{m}" (unit '' gives the number alone) */
  function qu(x, unit, n) { return nx(x, n) + (unit ? '\\,\\text{' + unit + '}' : ''); }
  function deg(x, n) { return nx(x, n || 3) + '^\\circ'; }
  function sind(a) { return M.sin(a * PI / 180); } function cosd(a) { return M.cos(a * PI / 180); } function tand(a) { return M.tan(a * PI / 180); }
  function asind(x) { return M.asin(x) * 180 / PI; } function acosd(x) { return M.acos(x) * 180 / PI; } function atand(x) { return M.atan(x) * 180 / PI; }
  function gam(b) { return 1 / M.sqrt(1 - b * b); }
  function mc(correct, wrongs, extra) { var s = { t: 'mc', choices: [correct].concat(wrongs), v: 0 }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function multi(parts) { return { t: 'multi', parts: parts }; }
  function pick(R, arr) { return R.pick(arr); }
  function frac(n, d) { return T.frac(n, d); }

  // ---- u1
  // ===================================================================== Unit 1: Waves with Calculus

  /* a sinusoidal wave y = A sin(s1·kx + s2·ωt) (s1 = −1 writes it as sin(ωt − kx)); returns TeX and its parts */
  function waveTex(A, k, w, form) {
    var a = qu(A, 'm', 2);
    if (form === 'minus') return '(' + a + ')\\sin(' + nx(k, 2) + 'x - ' + nx(w, 2) + 't)';
    if (form === 'plus') return '(' + a + ')\\sin(' + nx(k, 2) + 'x + ' + nx(w, 2) + 't)';
    return '(' + a + ')\\sin(' + nx(w, 2) + 't - ' + nx(k, 2) + 'x)';
  }
  G('modern.wave-function', function (R, ctx) {
    var L = lv(ctx), form = L === 1 ? R.pick(['minus', 'plus']) : R.pick(['minus', 'plus', 'swap']);
    var k = R.pick([0.50, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0]), v = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 12]);
    var w = rnd(k * v, 2); if (w !== k * v) { v = 2.0; w = k * v; }
    var A = R.pick([0.010, 0.015, 0.020, 0.025, 0.030, 0.040, 0.050, 0.060, 0.080]);
    var dir = form === 'plus' ? -1 : 1, s2 = form === 'minus' ? -1 : 1, s1 = form === 'swap' ? -1 : 1;
    var wt = '$$y = ' + waveTex(A, k, w, form) + '$$', given = 'with $x$ in meters and $t$ in seconds';
    var read = 'Compare with $A\\sin(kx \\mp \\omega t)$: $k = ' + qu(k, 'rad/m', 2) + '$ and $\\omega = ' + qu(w, 'rad/s', 2) + '$.';
    var kinds = by(ctx, ['lambda', 'freq', 'speed', 'period'], ['velocity', 'vmax', 'disp', 'speed', 'lambda'], ['vy', 'disp', 'velocity', 'ay']);
    var kind = R.pick(kinds), p;
    var lam = 2 * PI / k, f = w / (2 * PI);
    rec('modern.wave-function', { kind: kind, A: A, k: k, w: w, form: form });
    if (kind === 'lambda') p = { q: 'A wave on a string is ' + wt + given + '. What is its wavelength?', a: num(lam), unit: 'm',
      steps: [read, '$\\lambda = \\dfrac{2\\pi}{k} = \\dfrac{2\\pi}{' + qu(k, 'rad/m', 2) + '} = ' + qu(lam, 'm') + '$.'], hint: 'The phase changes by $2\\pi$ over one wavelength: $k = 2\\pi/\\lambda$.' };
    else if (kind === 'freq') p = { q: 'A wave on a string is ' + wt + given + '. What is its frequency?', a: num(f), unit: 'Hz',
      steps: [read, '$f = \\dfrac{\\omega}{2\\pi} = \\dfrac{' + qu(w, 'rad/s', 2) + '}{2\\pi} = ' + qu(f, 'Hz') + '$.'], hint: 'Angular frequency counts radians per second: $\\omega = 2\\pi f$.' };
    else if (kind === 'period') p = { q: 'A wave on a string is ' + wt + given + '. What is its period?', a: num(2 * PI / w), unit: 's',
      steps: [read, '$T = \\dfrac{2\\pi}{\\omega} = \\dfrac{2\\pi}{' + qu(w, 'rad/s', 2) + '} = ' + qu(2 * PI / w, 's') + '$.'], hint: 'One period is one full cycle, $2\\pi$ radians of $\\omega t$.' };
    else if (kind === 'speed') p = { q: 'A wave on a string is ' + wt + given + '. How fast does the wave travel along the string?', a: num(v), unit: 'm/s',
      steps: [read, '$v = \\dfrac{\\omega}{k} = \\dfrac{' + nx(w, 2) + '}{' + nx(k, 2) + '} = ' + qu(v, 'm/s', 2) + '$.', 'Check: $f\\lambda = ' + nx(f) + ' \\times ' + nx(lam) + ' = ' + nx(v, 2) + '$ m/s.'], hint: 'Follow a crest: the phase $kx - \\omega t$ stays constant.' };
    else if (kind === 'velocity') p = { q: 'A wave on a string is ' + wt + given + '. Give the wave\'s velocity along the $x$-axis: positive if it travels toward $+x$, negative if toward $-x$.', a: num(dir * v), unit: 'm/s',
      steps: [read, 'Ride on a crest, where the phase stays constant: ' + (form === 'minus' ? '$' + nx(k, 2) + 'x - ' + nx(w, 2) + 't = C$, so $x = \\dfrac{C + ' + nx(w, 2) + 't}{' + nx(k, 2) + '}$' : form === 'plus' ? '$' + nx(k, 2) + 'x + ' + nx(w, 2) + 't = C$, so $x = \\dfrac{C - ' + nx(w, 2) + 't}{' + nx(k, 2) + '}$' : '$' + nx(w, 2) + 't - ' + nx(k, 2) + 'x = C$, so $x = \\dfrac{' + nx(w, 2) + 't - C}{' + nx(k, 2) + '}$') + '.',
        'As $t$ grows, $x$ ' + (dir > 0 ? 'grows' : 'shrinks') + ': the wave moves toward $' + (dir > 0 ? '+' : '-') + 'x$ at $\\omega/k = ' + qu(v, 'm/s', 2) + '$.',
        'Velocity: $' + qu(dir * v, 'm/s', 2) + '$.'], hint: 'When $kx$ and $\\omega t$ have opposite signs, the wave moves toward $+x$.' };
    else if (kind === 'vmax') p = { q: 'A wave on a string is ' + wt + given + '. What is the greatest speed of any bit of the string as it moves up and down?', a: num(A * w), unit: 'm/s',
      steps: [read, 'The string\'s own velocity is $\\partial y/\\partial t$, which has amplitude $A\\omega$.', '$A\\omega = (' + qu(A, 'm', 2) + ')(' + qu(w, 'rad/s', 2) + ') = ' + qu(A * w, 'm/s') + '$.', 'That is not the wave speed $\\omega/k = ' + qu(v, 'm/s', 2) + '$.'], hint: 'Differentiate $y$ with respect to $t$, holding $x$ fixed.' };
    else {
      var x, t, ph, tries = 0;
      do { x = R.pick([0.10, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.75, 1.0, 1.2]); t = R.pick([0.050, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50]); ph = s1 * k * x + s2 * w * t; tries++; }
      while ((M.abs(M.sin(ph)) < 0.25 || M.abs(M.cos(ph)) < 0.25) && tries < 60);
      var phT = (s1 > 0 ? '(' + nx(k, 2) + ')(' + nx(x, 2) + ')' : '(' + nx(w, 2) + ')(' + nx(t, 2) + ')') + (s1 > 0 ? (s2 > 0 ? ' + ' : ' - ') + '(' + nx(w, 2) + ')(' + nx(t, 2) + ')' : ' - (' + nx(k, 2) + ')(' + nx(x, 2) + ')');
      var y = A * M.sin(ph), vy = A * s2 * w * M.cos(ph), ay = -w * w * y;
      var at = 'at $x = ' + qu(x, 'm', 2) + '$ and $t = ' + qu(t, 's', 2) + '$';
      rec('modern.wave-function', { kind: kind, A: A, k: k, w: w, form: form, x: x, t: t });
      var ph1 = 'Phase: $' + phT + ' = ' + nx(ph) + '$ rad (radians, not degrees).';
      if (kind === 'disp') p = { q: 'A wave on a string is ' + wt + given + '. Find the displacement $y$ of the string ' + at + '.', a: { t: 'num', v: av(y), rtol: 0.02 }, unit: 'm',
        steps: [ph1, '$y = ' + nx(A, 2) + '\\sin(' + nx(ph) + ') = ' + qu(y, 'm') + '$.'], hint: 'Put the numbers into the phase first, and use radians.' };
      else if (kind === 'vy') p = { q: 'A wave on a string is ' + wt + given + '. Find the transverse velocity $v_y = \\partial y/\\partial t$ of the string ' + at + '.', a: num(vy), unit: 'm/s',
        steps: ['$\\dfrac{\\partial y}{\\partial t} = ' + (s2 > 0 ? '' : '-') + 'A\\omega\\cos(\\text{phase})$, holding $x$ fixed.', ph1, '$v_y = ' + (s2 > 0 ? '' : '-') + '(' + nx(A, 2) + ')(' + nx(w, 2) + ')\\cos(' + nx(ph) + ') = ' + qu(vy, 'm/s') + '$.'], hint: 'Differentiate with respect to $t$; the chain rule brings out a factor of $\\pm\\omega$.' };
      else p = { q: 'A wave on a string is ' + wt + given + '. Find the transverse acceleration $a_y = \\partial^2 y/\\partial t^2$ of the string ' + at + '.', a: num(ay), unit: 'm/s²',
        steps: ['Differentiating twice in $t$ gives $\\dfrac{\\partial^2 y}{\\partial t^2} = -\\omega^2 y$, as for any simple harmonic motion.', ph1, '$y = ' + nx(A, 2) + '\\sin(' + nx(ph) + ') = ' + qu(y, 'm') + '$.', '$a_y = -(' + nx(w, 2) + ')^2(' + nx(y) + ') = ' + qu(ay, 'm/s²') + '$.'], hint: 'Each bit of string is a simple harmonic oscillator: $a = -\\omega^2 y$.' };
    }
    return p;
  });

  G('modern.wave-equation', function (R, ctx) {
    var kind = R.pick(by(ctx, ['pulse', 'string'], ['pulse2', 'string', 'standing'], ['which', 'omega', 'pulse2', 'standing']));
    var p;
    if (kind === 'pulse') {
      var v = R.pick([2.0, 3.0, 4.0, 5.0, 6.0, 8.0]), A = R.pick([0.10, 0.20, 0.30]), sg = R.pick([-1, 1]);
      var sh = R.pick(['exp', 'frac']);
      var inner = '(x ' + (sg < 0 ? '- ' : '+ ') + nx(v, 2) + 't)';
      var tex = sh === 'exp' ? '(' + qu(A, 'm', 2) + ')\\,e^{-' + inner + '^2}' : '\\dfrac{' + qu(A, 'm', 2) + '}{1 + ' + inner + '^2}';
      rec('modern.wave-equation', { kind: kind, v: v, sg: sg, sh: sh });
      p = { q: 'A pulse on a rope is $$y = ' + tex + '$$ with $x$ in m and $t$ in s. Give its velocity along $x$ (negative if it moves toward $-x$).', a: num(sg < 0 ? v : -v), unit: 'm/s',
        steps: ['$y$ depends on $x$ and $t$ only through $' + inner.slice(1, -1) + '$, so it is a fixed shape sliding along.', sg < 0 ? 'A function of $x - vt$ moves toward $+x$ at speed $v$.' : 'A function of $x + vt$ moves toward $-x$ at speed $v$.', 'Velocity: $' + qu(sg < 0 ? v : -v, 'm/s', 2) + '$.'],
        hint: 'Write the inside as $x \\mp vt$ and read off $v$.' };
    } else if (kind === 'pulse2') {
      var a = R.pick([2.0, 3.0, 4.0, 5.0]), vv = R.pick([1.5, 2.0, 2.5, 3.0, 4.0]), b = a * vv, sg2 = R.pick([-1, 1]), A2 = R.pick([0.10, 0.20, 0.50]);
      var inner2 = '(' + nx(a, 2) + 'x ' + (sg2 < 0 ? '- ' : '+ ') + nx(b, 2) + 't)';
      var sh2 = R.pick(['exp', 'frac']);
      var tex2 = sh2 === 'exp' ? '(' + qu(A2, 'm', 2) + ')\\,e^{-' + inner2 + '^2}' : '\\dfrac{' + qu(A2, 'm', 2) + '}{1 + ' + inner2 + '^2}';
      rec('modern.wave-equation', { kind: kind, a: a, b: b, sg: sg2, sh: sh2 });
      p = { q: 'A pulse on a rope is $$y = ' + tex2 + '$$ with $x$ in m and $t$ in s. Give its velocity along $x$ (negative if it moves toward $-x$).', a: num(sg2 < 0 ? vv : -vv), unit: 'm/s',
        steps: ['Factor out ' + nx(a, 2) + ': $' + inner2.slice(1, -1) + ' = ' + nx(a, 2) + '(x ' + (sg2 < 0 ? '- ' : '+ ') + nx(vv, 2) + 't)$.', 'So the shape is a function of $x ' + (sg2 < 0 ? '-' : '+') + ' ' + nx(vv, 2) + 't$ and moves toward $' + (sg2 < 0 ? '+' : '-') + 'x$ at $' + nx(b, 2) + '/' + nx(a, 2) + ' = ' + qu(vv, 'm/s', 2) + '$.', 'Velocity: $' + qu(sg2 < 0 ? vv : -vv, 'm/s', 2) + '$.'],
        hint: 'The speed is not the coefficient of $t$ alone: write the inside as a multiple of $(x \\mp vt)$.' };
    } else if (kind === 'string') {
      var mu = R.pick([1.0e-3, 1.2e-3, 2.0e-3, 2.5e-3, 4.0e-3, 5.0e-3, 8.0e-3, 0.010, 0.020]), FT = R.pick([20, 40, 45, 60, 75, 80, 100, 120, 150, 200]);
      var vs = M.sqrt(FT / mu);
      rec('modern.wave-equation', { kind: kind, mu: mu, FT: FT });
      p = { q: 'Newton\'s second law for a string under tension $F_T = ' + qu(FT, 'N') + '$ with linear density $\\mu = ' + qu(mu, 'kg/m', 2) + '$ gives $$\\frac{\\partial^2 y}{\\partial x^2} = \\frac{\\mu}{F_T}\\,\\frac{\\partial^2 y}{\\partial t^2}.$$ What is the speed of waves on this string?', a: num(vs), unit: 'm/s',
        steps: ['Match with the wave equation: $\\dfrac{1}{v^2} = \\dfrac{\\mu}{F_T}$, so $v = \\sqrt{F_T/\\mu}$.', '$v = \\sqrt{\\dfrac{' + qu(FT, 'N') + '}{' + qu(mu, 'kg/m', 2) + '}} = ' + qu(vs, 'm/s') + '$.'],
        hint: 'Compare the factor in front of $\\partial^2 y/\\partial t^2$ with $1/v^2$.' };
    } else if (kind === 'standing') {
      var kk = R.pick([2, 3, 4, 5, 6]), ww = kk * R.pick([2, 3, 4, 5]), fn = R.pick(['sin', 'cos']);
      rec('modern.wave-equation', { kind: kind, k: kk, w: ww });
      p = { q: 'The function $$y = (0.010\\ \\text{m})\\,\\' + fn + '(' + kk + 'x)\\sin(' + ww + 't)$$ ($x$ in m, $t$ in s) satisfies the wave equation for one wave speed $v$. Find $v$.', a: num(ww / kk), unit: 'm/s',
        steps: ['$\\dfrac{\\partial^2 y}{\\partial x^2} = -' + kk * kk + 'y$ and $\\dfrac{\\partial^2 y}{\\partial t^2} = -' + ww * ww + 'y$.', 'The wave equation needs $-' + kk * kk + 'y = \\dfrac{1}{v^2}(-' + ww * ww + 'y)$, so $v^2 = \\dfrac{' + ww * ww + '}{' + kk * kk + '}$.', '$v = ' + ww + '/' + kk + ' = ' + qu(ww / kk, 'm/s', 3) + '$. It is a standing wave: two waves moving each way at this speed.'],
        hint: 'Take the second partial derivative in $x$ and in $t$, and compare.' };
    } else if (kind === 'omega') {
      var mu3 = R.pick([2.0e-3, 4.0e-3, 5.0e-3, 0.010]), FT3 = R.pick([50, 80, 100, 125, 160, 200]), k3 = R.pick([2.0, 3.0, 4.0, 5.0, 8.0]);
      var v3 = M.sqrt(FT3 / mu3);
      rec('modern.wave-equation', { kind: kind, mu: mu3, FT: FT3, k: k3 });
      p = { q: 'A string has tension $' + qu(FT3, 'N') + '$ and linear density $' + qu(mu3, 'kg/m', 2) + '$. A wave $y = A\\sin(kx - \\omega t)$ on it has $k = ' + qu(k3, 'rad/m', 2) + '$. What must $\\omega$ be for the wave to satisfy the string\'s wave equation?', a: num(k3 * v3), unit: 'rad/s',
        steps: ['Substituting $A\\sin(kx - \\omega t)$ into the wave equation gives $-k^2 y = -\\dfrac{\\omega^2}{v^2}y$, so $\\omega = kv$.', '$v = \\sqrt{F_T/\\mu} = \\sqrt{' + nx(FT3) + '/' + nx(mu3, 2) + '} = ' + qu(v3, 'm/s') + '$.', '$\\omega = kv = (' + nx(k3, 2) + ')(' + nx(v3) + ') = ' + qu(k3 * v3, 'rad/s') + '$.'],
        hint: 'A sine wave solves the wave equation only if $\\omega/k = v$.' };
    } else {
      var vq = R.pick([2, 3, 4]), opts = [
        ['(x - ' + vq + 't)^3', true], ['e^{x + ' + vq + 't}', true], ['\\sin(x)\\cos(' + vq + 't)', true], ['x^2 + ' + vq * vq + 't^2', true],
        ['x^2 - ' + vq + 't', false], ['e^{x}\\,t', false], ['\\sin(' + vq + 'x - t)', false], ['x^2 + ' + vq + 't^2', false], ['(x - ' + vq * vq + 't)^2', false], ['\\cos(x)\\cos(' + (vq + 1) + 't)', false]];
      var good = R.pick(opts.filter(function (q) { return q[1]; })), bad = R.sample(opts.filter(function (q) { return !q[1]; }), 3);
      rec('modern.wave-equation', { kind: kind, v: vq, good: good[0], bad: bad.map(function (q) { return q[0]; }) });
      p = { q: 'Which function satisfies the wave equation $\\dfrac{\\partial^2 y}{\\partial x^2} = \\dfrac{1}{v^2}\\dfrac{\\partial^2 y}{\\partial t^2}$ with $v = ' + vq + '$ m/s?', a: mc('$y = ' + good[0] + '$', bad.map(function (q) { return '$y = ' + q[0] + '$'; })),
        steps: ['A function satisfies it when $\\dfrac{\\partial^2 y}{\\partial t^2} = ' + vq * vq + '\\,\\dfrac{\\partial^2 y}{\\partial x^2}$ for every $x$ and $t$.', 'For $y = ' + good[0] + '$ this holds (differentiate twice in each variable and compare).', 'Each of the others fails: for example, a function of $x - ct$ with $c \\ne ' + vq + '$ moves at the wrong speed, and terms like $t$ or $t^2$ with the wrong coefficient leave the two sides unequal.'],
        hint: 'Shapes of $x - vt$ or $x + vt$ always work, and so do sums of them.' };
    }
    return p;
  });

  G('modern.wave-power', function (R, ctx) {
    var kind = R.pick(by(ctx, ['ratio', 'power'], ['power', 'powerT', 'ratio'], ['amp', 'powerT', 'ratio2']));
    var p;
    if (kind === 'ratio' || kind === 'ratio2') {
      var ka = R.pick([2, 3, 0.5, 1.5]), kf = kind === 'ratio' ? 1 : R.pick([2, 0.5, 3, 1.5]), ch = kind === 'ratio' ? R.pick(['A', 'f']) : 'both';
      var fa = ch === 'f' ? 1 : ka, ff = ch === 'A' ? 1 : (ch === 'f' ? ka : kf);
      var factor = fa * fa * ff * ff;
      var say = function (x) { return x === 2 ? 'doubled' : x === 3 ? 'tripled' : x === 0.5 ? 'halved' : 'multiplied by ' + nx(x, 2); };
      var what = ch === 'A' ? 'the amplitude is ' + say(fa) : ch === 'f' ? 'the frequency is ' + say(ff) : 'the amplitude is ' + say(fa) + ' and the frequency is ' + say(ff);
      rec('modern.wave-power', { kind: kind, fa: fa, ff: ff });
      p = { q: 'A sinusoidal wave travels on a stretched string. The tension and the string stay the same, but ' + what + '. By what factor does the average power carried by the wave change?', a: { t: 'num', v: av(factor, 6), rtol: 0.005 },
        steps: ['$P_{\\text{avg}} = \\tfrac{1}{2}\\mu\\omega^2A^2v$, and $\\mu$ and $v = \\sqrt{F_T/\\mu}$ do not change.', 'So $P \\propto \\omega^2A^2$, and $\\omega \\propto f$.', 'Factor: $(' + nx(fa, 2) + ')^2 \\times (' + nx(ff, 2) + ')^2 = ' + nx(factor, 4) + '$.'],
        hint: 'Power depends on the squares of both the amplitude and the frequency.' };
    } else if (kind === 'power' || kind === 'powerT') {
      var mu = R.pick([0.050, 0.10, 0.20, 0.25, 0.40, 0.50]), f = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 5.0]), A = R.pick([0.020, 0.030, 0.040, 0.050, 0.060, 0.080]);
      var v, FT, vstep = [];
      if (kind === 'power') { v = R.pick([8.0, 10, 12, 15, 20]); }
      else { FT = R.pick([20, 40, 50, 80, 100]); v = M.sqrt(FT / mu); vstep = ['$v = \\sqrt{F_T/\\mu} = \\sqrt{' + nx(FT) + '/' + nx(mu, 2) + '} = ' + qu(v, 'm/s') + '$.']; }
      var w = 2 * PI * f, P = 0.5 * mu * w * w * A * A * v;
      rec('modern.wave-power', { kind: kind, mu: mu, f: f, A: A, v: v });
      p = { q: 'A rope with linear density $' + qu(mu, 'kg/m', 2) + '$ ' + (kind === 'power' ? 'carries waves at $' + qu(v, 'm/s', 2) + '$' : 'is held at tension $' + qu(FT, 'N', 2) + '$') + '. You shake one end at $' + qu(f, 'Hz', 2) + '$ with amplitude $' + qu(A * 100, 'cm', 2) + '$. What average power does the wave carry?', a: num(P), unit: 'W',
        steps: vstep.concat(['$\\omega = 2\\pi f = 2\\pi(' + nx(f, 2) + ') = ' + qu(w, 'rad/s') + '$.', '$P = \\tfrac{1}{2}\\mu\\omega^2A^2v = \\tfrac{1}{2}(' + nx(mu, 2) + ')(' + nx(w) + ')^2(' + nx(A, 2) + ')^2(' + nx(v) + ')$.', '$P = ' + qu(P, 'W') + '$.']),
        hint: 'Use $P_{\\text{avg}} = \\tfrac{1}{2}\\mu\\omega^2A^2v$ with $A$ in meters and $\\omega = 2\\pi f$.' };
    } else {
      var mu2 = R.pick([2.0e-3, 4.0e-3, 5.0e-3, 8.0e-3, 0.010]), FT2 = R.pick([40, 60, 80, 100, 120]), f2 = R.pick([40, 50, 60, 80, 100, 120]), P2 = R.pick([0.50, 1.0, 1.5, 2.0, 3.0, 5.0]);
      var v2 = M.sqrt(FT2 / mu2), w2 = 2 * PI * f2, A2 = M.sqrt(2 * P2 / (mu2 * w2 * w2 * v2));
      rec('modern.wave-power', { kind: kind, mu: mu2, FT: FT2, f: f2, P: P2 });
      p = { q: 'A string has linear density $' + qu(mu2, 'kg/m', 2) + '$ and tension $' + qu(FT2, 'N', 2) + '$. What amplitude, in millimeters, must a $' + qu(f2, 'Hz', 2) + '$ wave have to carry an average power of $' + qu(P2, 'W', 2) + '$?', a: num(A2 * 1000), unit: 'mm',
        steps: ['$v = \\sqrt{F_T/\\mu} = \\sqrt{' + nx(FT2) + '/' + nx(mu2, 2) + '} = ' + qu(v2, 'm/s') + '$ and $\\omega = 2\\pi f = ' + qu(w2, 'rad/s') + '$.', 'Solve $P = \\tfrac{1}{2}\\mu\\omega^2A^2v$ for $A$: $$A = \\sqrt{\\frac{2P}{\\mu\\omega^2 v}} = \\sqrt{\\frac{2(' + nx(P2, 2) + ')}{(' + nx(mu2, 2) + ')(' + nx(w2) + ')^2(' + nx(v2) + ')}}$$', '$A = ' + qu(A2, 'm') + ' = ' + qu(A2 * 1000, 'mm') + '$.'],
        hint: 'Find the wave speed from the tension first, then solve the power formula for $A$.' };
    }
    return p;
  });

  G('modern.phase-interference', function (R, ctx) {
    var kind = R.pick(by(ctx, ['amp', 'classify'], ['speakers', 'amp', 'classify', 'inverse'], ['lowf', 'speakers', 'inverse']));
    var p;
    if (kind === 'amp') {
      var A = R.pick([2.0, 3.0, 4.0, 5.0, 6.0, 8.0]), fr = R.pick([[1, 3], [1, 2], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [4, 3], [3, 2]]);
      var phi = fr[0] * PI / fr[1], Ar = 2 * A * M.abs(M.cos(phi / 2));
      var phT = (fr[0] === 1 ? '' : fr[0]) + '\\pi/' + fr[1];
      rec('modern.phase-interference', { kind: kind, A: A, phi: phi });
      p = { q: 'Two waves on the same string, each with amplitude $' + qu(A, 'mm', 2) + '$ and the same frequency and direction, differ in phase by $\\phi = ' + phT + '$. What is the amplitude of the wave they make together?', a: num(Ar), unit: 'mm',
        steps: ['$A_{\\text{res}} = 2A\\left|\\cos\\dfrac{\\phi}{2}\\right| = 2(' + nx(A, 2) + ')\\left|\\cos\\dfrac{' + phT + '}{2}\\right|$.', '$= ' + nx(2 * A, 2) + ' \\times ' + nx(M.abs(M.cos(phi / 2)), 3) + ' = ' + qu(Ar, 'mm') + '$.'],
        hint: 'Add the two sines with the sum-to-product formula: the amplitude is $2A|\\cos(\\phi/2)|$.' };
    } else if (kind === 'classify') {
      var lam = R.pick([0.40, 0.50, 0.80, 1.0, 1.2, 1.6, 2.0]), m = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 0.25, 0.75, 1.25]), dr = m * lam;
      var type = M.abs(m - M.round(m)) < 1e-9 ? 0 : M.abs(m - M.floor(m) - 0.5) < 1e-9 ? 1 : 2;
      var ch = ['Constructive: the waves arrive in step', 'Destructive: the waves arrive exactly out of step', 'Neither: partly constructive'];
      rec('modern.phase-interference', { kind: kind, lam: lam, dr: dr, type: type });
      p = { q: 'Two speakers driven in phase send the same tone, of wavelength $' + qu(lam, 'm', 2) + '$, to a listener. The listener is $' + qu(dr, 'm', 3) + '$ farther from one speaker than the other. What kind of interference happens there?', a: { t: 'mc', choices: ch, v: type, keep: true },
        steps: ['Number of wavelengths in the path difference: $\\Delta r/\\lambda = ' + nx(dr, 3) + '/' + nx(lam, 2) + ' = ' + nx(m, 3) + '$.', 'Phase difference: $\\phi = 2\\pi(' + nx(m, 3) + ') = ' + (type === 0 ? M.round(2 * m) + '\\pi' : nx(2 * m, 3) + '\\pi') + '$ rad.', type === 0 ? 'A whole number of wavelengths: crest meets crest.' : type === 1 ? 'A whole number plus a half: crest meets trough.' : 'Neither a whole nor a half number: the amplitude is between 0 and $2A$.'],
        hint: 'Divide the path difference by the wavelength.' };
    } else if (kind === 'speakers') {
      var f = R.pick([340, 400, 500, 600, 680, 750, 850, 1000]), d1 = R.pick([2.00, 2.50, 3.00, 4.00]), dd = R.pick([0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.45]);
      var lam2 = 343 / f, phi2 = 2 * PI * dd / lam2, cf = M.abs(M.cos(phi2 / 2)), tries = 0;
      while ((cf < 0.15 || cf > 0.97) && tries < 20) { dd = R.pick([0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.45, 0.55]); phi2 = 2 * PI * dd / lam2; cf = M.abs(M.cos(phi2 / 2)); tries++; }
      var rel = 4 * cf * cf;
      rec('modern.phase-interference', { kind: kind, f: f, dd: dd });
      p = { q: 'Two speakers driven in phase play $' + qu(f, 'Hz', 3) + '$ tones of equal strength ($v = 343$ m/s). You stand $' + qu(d1, 'm', 3) + '$ from one and $' + qu(d1 + dd, 'm', 3) + '$ from the other. What is the sound intensity there, as a multiple of the intensity of one speaker alone?', a: num(rel, 0.03), unit: '',
        steps: ['$\\lambda = v/f = 343/' + f + ' = ' + qu(lam2, 'm') + '$.', '$\\Delta r = ' + qu(dd, 'm', 2) + '$, so $\\phi = 2\\pi\\dfrac{\\Delta r}{\\lambda} = ' + nx(phi2) + '$ rad.', 'Amplitude: $2A\\left|\\cos\\dfrac{\\phi}{2}\\right| = ' + nx(2 * cf) + 'A$.', 'Intensity goes as amplitude squared: $(' + nx(2 * cf) + ')^2 = ' + nx(rel) + '$ times one speaker.'],
        hint: 'Find the phase difference from the path difference, then square the amplitude ratio.' };
    } else if (kind === 'inverse') {
      var r = R.pick([0.5, 1.0, 1.2, 1.5, 1.8, 0.8]), phi3 = 2 * M.acos(r / 2);
      rec('modern.phase-interference', { kind: kind, r: r });
      p = { q: 'Two equal waves of amplitude $A$ add to a wave of amplitude $' + nx(r, 2) + 'A$. What is the smallest phase difference between them, in radians?', a: num(phi3), unit: 'rad',
        steps: ['$2A\\cos\\dfrac{\\phi}{2} = ' + nx(r, 2) + 'A$, so $\\cos\\dfrac{\\phi}{2} = ' + nx(r / 2, 3) + '$.', '$\\dfrac{\\phi}{2} = \\cos^{-1}(' + nx(r / 2, 3) + ') = ' + nx(phi3 / 2) + '$ rad.', '$\\phi = ' + nx(phi3) + '$ rad $= ' + deg(phi3 * 180 / PI) + '$.'],
        hint: 'Solve $2A\\cos(\\phi/2) = A_{\\text{res}}$ for $\\phi$.' };
    } else {
      var outp = R.coin(), want = R.pick(['loud', 'quiet']), dr4 = R.pick([0.25, 0.40, 0.50, 0.60, 0.70, 0.75, 0.80, 1.00]);
      // smallest positive frequency: in phase: loud Δr = λ, quiet Δr = λ/2; out of phase: loud Δr = λ/2, quiet Δr = λ
      var lamF = (outp ? (want === 'loud' ? 2 * dr4 : dr4) : (want === 'loud' ? dr4 : 2 * dr4)), fF = 343 / lamF;
      rec('modern.phase-interference', { kind: kind, outp: outp, want: want, dr: dr4 });
      p = { q: 'Two speakers are driven ' + (outp ? 'exactly out of phase (one pushes while the other pulls)' : 'in phase') + '. A listener is $' + qu(dr4, 'm', 2) + '$ farther from one speaker than the other. What is the lowest frequency that is ' + (want === 'loud' ? 'loudest (fully constructive)' : 'silenced (fully destructive)') + ' at the listener? Use $v = 343$ m/s.', a: num(fF), unit: 'Hz',
        steps: ['Total phase difference: $\\phi = \\dfrac{2\\pi\\Delta r}{\\lambda}' + (outp ? ' + \\pi' : '') + '$.', (want === 'loud' ? 'Constructive needs $\\phi = 2\\pi m$' : 'Destructive needs $\\phi = (2m + 1)\\pi$') + '; the lowest frequency means the longest wavelength, the smallest nonzero $2\\pi\\Delta r/\\lambda$.',
          'That gives $\\Delta r = ' + (lamF === dr4 ? '\\lambda' : '\\lambda/2') + '$, so $\\lambda = ' + qu(lamF, 'm', 3) + '$.', '$f = v/\\lambda = 343/' + nx(lamF, 3) + ' = ' + qu(fF, 'Hz') + '$.'],
        hint: (outp ? 'The wiring adds $\\pi$ to the phase difference before any path difference.' : 'Lower frequency means longer wavelength.') };
    }
    return p;
  });

  G('modern.standing-wave-math', function (R, ctx) {
    var c = R.pick([0.25, 0.50, 1.0, 2.0, 1.5]), lam = 2 / c, k = c * PI, wc = R.pick([20, 40, 60, 80, 100, 120]), w = wc * PI, S = R.pick([0.020, 0.040, 0.060, 0.080, 0.10]);
    var v = w / k;
    var yT = '$$y = (' + qu(S, 'm', 2) + ')\\sin(' + (c === 1 ? '' : nx(c, 2)) + '\\pi x)\\cos(' + wc + '\\pi t)$$';
    var intro = 'A string vibrates as ' + yT + 'with $x$ in m and $t$ in s.';
    var kRead = '$k = ' + (c === 1 ? '' : nx(c, 2)) + '\\pi$ rad/m, so $\\lambda = 2\\pi/k = ' + qu(lam, 'm', 3) + '$.';
    var kind = R.pick(by(ctx, ['nodes', 'travA'], ['speed', 'antinode', 'ampAt', 'nodes'], ['vmaxAt', 'ampAt', 'harm']));
    rec('modern.standing-wave-math', { kind: kind, c: c, wc: wc, S: S });
    var p;
    if (kind === 'nodes') p = { q: intro + ' How far apart are neighboring nodes?', a: num(lam / 2), unit: 'm',
      steps: ['Nodes are where $\\sin kx = 0$: $kx = 0, \\pi, 2\\pi, \\ldots$', kRead, 'Neighboring nodes are $\\lambda/2 = ' + qu(lam / 2, 'm', 3) + '$ apart.'], hint: 'Nodes sit where $\\sin kx = 0$, every $\\pi$ of $kx$.' };
    else if (kind === 'travA') p = { q: intro + ' It is the sum of two traveling waves moving in opposite directions. What is the amplitude of each traveling wave?', a: num(S / 2), unit: 'm',
      steps: ['$A\\sin(kx - \\omega t) + A\\sin(kx + \\omega t) = 2A\\sin(kx)\\cos(\\omega t)$.', '$2A = ' + qu(S, 'm', 2) + '$, so $A = ' + qu(S / 2, 'm', 2) + '$.'], hint: 'The standing wave\'s largest amplitude is twice each traveling wave\'s.' };
    else if (kind === 'speed') p = { q: intro + ' At what speed do the two traveling waves that make it up move?', a: num(v), unit: 'm/s',
      steps: ['Each traveling wave has the same $k$ and $\\omega$ as the standing wave.', '$v = \\dfrac{\\omega}{k} = \\dfrac{' + wc + '\\pi}{' + (c === 1 ? '' : nx(c, 2)) + '\\pi} = ' + qu(v, 'm/s') + '$.'], hint: 'Read $k$ and $\\omega$ and use $v = \\omega/k$.' };
    else if (kind === 'antinode') { var nA = R.pick([1, 2, 3]), xa = (2 * nA - 1) * lam / 4;
      p = { q: intro + ' How far from $x = 0$ is the ' + ['first', 'second', 'third'][nA - 1] + ' antinode on the positive side?', a: num(xa), unit: 'm',
        steps: ['Antinodes are where $|\\sin kx| = 1$: $kx = \\dfrac{\\pi}{2}, \\dfrac{3\\pi}{2}, \\dfrac{5\\pi}{2}, \\ldots$, that is $x = \\dfrac{\\lambda}{4}, \\dfrac{3\\lambda}{4}, \\dfrac{5\\lambda}{4}, \\ldots$', kRead, 'The ' + ['first', 'second', 'third'][nA - 1] + ' is at $' + (nA === 1 ? '' : 2 * nA - 1) + '\\lambda/4 = ' + qu(xa, 'm', 3) + '$.'], hint: 'Antinodes lie halfway between nodes, starting a quarter wavelength from $x = 0$.' }; }
    else {
      var x = R.pick([0.10, 0.20, 0.30, 0.40, 0.60, 0.70, 0.90, 1.1, 1.3]), s = M.abs(M.sin(k * x)), tries = 0;
      while ((s < 0.2 || s > 0.98) && tries < 30) { x = R.pick([0.10, 0.20, 0.30, 0.40, 0.60, 0.70, 0.90, 1.1, 1.3, 0.15, 0.35]); s = M.abs(M.sin(k * x)); tries++; }
      rec('modern.standing-wave-math', { kind: kind, c: c, wc: wc, S: S, x: x });
      var sx = '$|\\sin(' + (c === 1 ? '' : nx(c, 2)) + '\\pi \\times ' + nx(x, 2) + ')| = ' + nx(s) + '$';
      if (kind === 'ampAt') p = { q: intro + ' What is the amplitude of the motion of the point at $x = ' + qu(x, 'm', 2) + '$?', a: num(S * s), unit: 'm',
        steps: ['Each point oscillates as $\\cos\\omega t$ with amplitude $' + nx(S, 2) + '|\\sin kx|$.', sx + '.', 'Amplitude: $' + nx(S, 2) + ' \\times ' + nx(s) + ' = ' + qu(S * s, 'm') + '$.'], hint: 'The factor $\\sin kx$ is the local amplitude; use radians.' };
      else if (kind === 'vmaxAt') p = { q: intro + ' What is the greatest speed of the point at $x = ' + qu(x, 'm', 2) + '$?', a: num(S * s * w), unit: 'm/s',
        steps: ['$\\dfrac{\\partial y}{\\partial t} = -(' + nx(S, 2) + ')\\sin(kx)(' + wc + '\\pi)\\sin(' + wc + '\\pi t)$.', sx + '.', 'Top speed: $' + nx(S, 2) + ' \\times ' + nx(s) + ' \\times ' + wc + '\\pi = ' + qu(S * s * w, 'm/s') + '$.'], hint: 'Differentiate in $t$; the largest value of $|\\sin\\omega t|$ is 1.' };
      else { var Ls = R.pick([0.60, 0.75, 0.80, 1.0, 1.2]), n = R.pick([2, 3, 4, 5]), vv = R.pick([120, 150, 200, 240, 300]);
        rec('modern.standing-wave-math', { kind: kind, L: Ls, n: n, v: vv });
        p = { q: 'A string of length $' + qu(Ls, 'm', 2) + '$, fixed at both ends, carries waves at $' + qu(vv, 'm/s') + '$. It vibrates as $y = 2A\\sin(kx)\\cos(\\omega t)$ with ' + n + ' antinodes. What is $\\omega$?', a: num(n * PI * vv / Ls), unit: 'rad/s',
          steps: ['Both ends are nodes: $\\sin(kL) = 0$, so $kL = n\\pi$ with $n = ' + n + '$ (one antinode per half wavelength).', '$k = \\dfrac{' + n + '\\pi}{' + nx(Ls, 2) + '} = ' + qu(n * PI / Ls, 'rad/m') + '$.', '$\\omega = kv = ' + nx(n * PI / Ls) + ' \\times ' + vv + ' = ' + qu(n * PI * vv / Ls, 'rad/s') + '$.'], hint: 'Fixed ends force $\\sin(kL) = 0$; count antinodes to get $n$.' }; }
    }
    return p;
  });

  G('modern.sound-waves', function (R, ctx) {
    var kind = R.pick(by(ctx, ['speed', 'lambda'], ['dp', 'smax', 'speed', 'where'], ['dp', 'smax', 'intensity', 'where']));
    var p, rho = 1.20, v = 343;
    if (kind === 'speed') {
      var med = R.pick([['water', 2.2e9, 1000], ['air', 1.42e5, 1.20], ['a liquid', R.pick([1.2e9, 1.5e9, 1.8e9, 2.6e9]), R.pick([800, 900, 1100, 1200])], ['a light oil', R.pick([1.0e9, 1.3e9]), R.pick([850, 900])]]);
      var vs = M.sqrt(med[1] / med[2]);
      rec('modern.sound-waves', { kind: kind, B: med[1], rho: med[2] });
      p = { q: 'Find the speed of sound in ' + med[0] + ', with bulk modulus $B = ' + qu(med[1], 'Pa', 3) + '$ and density $\\rho = ' + qu(med[2], 'kg/m³', 3) + '$.', a: num(vs), unit: 'm/s',
        steps: ['$v = \\sqrt{B/\\rho} = \\sqrt{\\dfrac{' + qu(med[1], 'Pa') + '}{' + qu(med[2], 'kg/m³') + '}}$.', '$v = ' + qu(vs, 'm/s') + '$. (Pa divided by kg/m³ is m²/s².)'], hint: 'Stiffness over inertia: $v = \\sqrt{B/\\rho}$.' };
    } else if (kind === 'lambda') {
      var f = R.pick([110, 220, 256, 440, 880, 1000, 2000, 4000]), medium = R.pick([['air', 343], ['water', 1480]]);
      rec('modern.sound-waves', { kind: kind, f: f, v: medium[1] });
      p = { q: 'A ' + f + ' Hz sound wave travels through ' + medium[0] + ' at $' + medium[1] + '$ m/s. What is its wave number $k$?', a: num(2 * PI * f / medium[1]), unit: 'rad/m',
        steps: ['$\\lambda = v/f = ' + medium[1] + '/' + f + ' = ' + qu(medium[1] / f, 'm') + '$.', '$k = 2\\pi/\\lambda = ' + qu(2 * PI * f / medium[1], 'rad/m') + '$. (Or $k = \\omega/v$.)'], hint: 'Use $k = \\omega/v = 2\\pi f/v$.' };
    } else if (kind === 'dp' || kind === 'smax' || kind === 'intensity') {
      var f2 = R.pick([250, 500, 1000, 2000, 3000, 4000]), w = 2 * PI * f2;
      if (kind === 'dp') {
        var s = R.pick([1.0, 2.0, 5.0, 10, 20, 50]) * 1e-9, dp = rho * v * w * s;
        rec('modern.sound-waves', { kind: kind, f: f2, s: s });
        p = { q: 'A $' + f2 + '$ Hz sound wave in air ($\\rho = 1.20$ kg/m³, $v = 343$ m/s) has displacement amplitude $' + qu(s, 'm', 2) + '$. What is its pressure amplitude?', a: num(dp), unit: 'Pa',
          steps: ['$\\Delta p_{\\max} = Bks_{\\max} = \\rho v\\omega s_{\\max}$ (since $B = \\rho v^2$ and $k = \\omega/v$).', '$\\omega = 2\\pi(' + f2 + ') = ' + qu(w, 'rad/s') + '$.', '$\\Delta p_{\\max} = (1.20)(343)(' + nx(w) + ')(' + nx(s, 2) + ') = ' + qu(dp, 'Pa') + '$.'], hint: 'Pressure comes from squeezing: $\\Delta p = -B\\,\\partial s/\\partial x$.' };
      } else if (kind === 'smax') {
        var dp2 = R.pick([0.010, 0.020, 0.050, 0.10, 0.20, 0.50, 1.0]), s2 = dp2 / (rho * v * w);
        rec('modern.sound-waves', { kind: kind, f: f2, dp: dp2 });
        p = { q: 'A $' + f2 + '$ Hz tone in air ($\\rho = 1.20$ kg/m³, $v = 343$ m/s) has pressure amplitude $' + qu(dp2, 'Pa', 2) + '$. How far does each layer of air swing, in nanometers (the displacement amplitude)?', a: num(s2 * 1e9), unit: 'nm',
          steps: ['$s_{\\max} = \\dfrac{\\Delta p_{\\max}}{\\rho v\\omega}$.', '$\\omega = 2\\pi(' + f2 + ') = ' + qu(w, 'rad/s') + '$.', '$s_{\\max} = \\dfrac{' + nx(dp2, 2) + '}{(1.20)(343)(' + nx(w) + ')} = ' + qu(s2, 'm') + ' = ' + qu(s2 * 1e9, 'nm') + '$.'], hint: 'Rearrange $\\Delta p_{\\max} = \\rho v\\omega s_{\\max}$.' };
      } else {
        var dp3 = R.pick([0.020, 0.050, 0.10, 0.20, 0.50, 1.0, 2.0]), I = dp3 * dp3 / (2 * rho * v);
        rec('modern.sound-waves', { kind: kind, dp: dp3 });
        p = { q: 'The intensity of a sound wave is $I = \\dfrac{\\Delta p_{\\max}^2}{2\\rho v}$. Find the intensity of a sound in air ($\\rho = 1.20$ kg/m³, $v = 343$ m/s) with pressure amplitude $' + qu(dp3, 'Pa', 2) + '$.', a: num(I), unit: 'W/m²',
          steps: ['$I = \\dfrac{(' + nx(dp3, 2) + ')^2}{2(1.20)(343)}$.', '$I = ' + qu(I, 'W/m²') + '$.'], hint: 'Square the pressure amplitude; intensity goes as amplitude squared.' };
      }
    } else {
      var where = R.pick(['dispNode', 'dispMax']);
      rec('modern.sound-waves', { kind: kind, where: where });
      var right = where === 'dispNode' ? 'The pressure varies the most there' : 'The pressure there stays at normal atmospheric pressure';
      var wrong = where === 'dispNode' ? ['The pressure there stays at normal atmospheric pressure', 'The air there swings the most, so the pressure varies the most too', 'Sound waves have no pressure change'] : ['The pressure varies the most there', 'The pressure there is always above normal', 'The pressure there is always below normal'];
      p = { q: 'In a sound wave $s = s_{\\max}\\cos(kx - \\omega t)$, consider a place where the air ' + (where === 'dispNode' ? 'is at its normal position ($s = 0$) at this instant' : 'is displaced the farthest ($s = s_{\\max}$) at this instant') + '. Which is true there at this instant?', a: mc(right, wrong),
        steps: ['$\\Delta p = -B\\,\\dfrac{\\partial s}{\\partial x} = Bks_{\\max}\\sin(kx - \\omega t)$.', where === 'dispNode' ? 'Where $\\cos(kx - \\omega t) = 0$, $|\\sin(kx - \\omega t)| = 1$: the slope of $s$ is steepest, so the air is squeezed or stretched the most.' : 'Where $\\cos(kx - \\omega t) = 1$, $\\sin(kx - \\omega t) = 0$: neighboring layers move together, so the air is neither squeezed nor stretched.'],
        hint: 'Pressure depends on the slope $\\partial s/\\partial x$, not on $s$ itself.' };
    }
    return p;
  });

  G('modern.beats', function (R, ctx) {
    var kind = R.pick(by(ctx, ['beat', 'period'], ['tune', 'beat', 'tone'], ['tension', 'tune', 'tone']));
    var p;
    if (kind === 'beat' || kind === 'period' || kind === 'tone') {
      var f1 = R.pick([196, 220, 256, 262, 330, 392, 440, 523]), d = R.pick([1, 2, 3, 4, 5, 6, 0.5, 1.5, 2.5]) * R.sign(), f2 = f1 + d;
      rec('modern.beats', { kind: kind, f1: f1, f2: f2 });
      if (kind === 'beat') p = { q: 'A $' + nx(f1, 3) + '$ Hz tuning fork and a string at $' + nx(f2, 4) + '$ Hz sound together. How many beats per second do you hear?', a: num(M.abs(d), 0.01), unit: 'Hz',
        steps: ['$f_{\\text{beat}} = |f_1 - f_2| = |' + nx(f1, 4) + ' - ' + nx(f2, 4) + '|$.', '$f_{\\text{beat}} = ' + qu(M.abs(d), 'Hz', 2) + '$.'], hint: 'Beats come from the difference of the two frequencies.' };
      else if (kind === 'period') p = { q: 'Two tones of $' + nx(f1, 3) + '$ Hz and $' + nx(f2, 4) + '$ Hz sound together. How much time passes between loud swells?', a: num(1 / M.abs(d), 0.01), unit: 's',
        steps: ['$f_{\\text{beat}} = |f_1 - f_2| = ' + qu(M.abs(d), 'Hz', 2) + '$.', 'Time between swells: $1/f_{\\text{beat}} = ' + qu(1 / M.abs(d), 's') + '$.'], hint: 'Find the beat frequency first; the time between beats is its reciprocal.' };
      else p = { q: 'Two tones of $' + nx(f1, 3) + '$ Hz and $' + nx(f2, 4) + '$ Hz sound together. You hear one tone that throbs. What is the frequency of that tone (the pitch, not the throbbing)?', a: num((f1 + f2) / 2, 0.001), unit: 'Hz',
        steps: ['$\\cos(2\\pi f_1t) + \\cos(2\\pi f_2t) = 2\\cos\\!\\left(2\\pi\\frac{f_1 - f_2}{2}t\\right)\\cos\\!\\left(2\\pi\\frac{f_1 + f_2}{2}t\\right)$.', 'The fast factor is the pitch: $\\dfrac{f_1 + f_2}{2} = \\dfrac{' + nx(f1, 4) + ' + ' + nx(f2, 4) + '}{2} = ' + qu((f1 + f2) / 2, 'Hz', 5) + '$.', 'The throbbing is at $|f_1 - f_2| = ' + qu(M.abs(d), 'Hz', 2) + '$.'], hint: 'The pitch is the average; the beats are the difference.' };
    } else if (kind === 'tune') {
      var fork = R.pick([256, 330, 392, 440, 523]), b = R.pick([2, 3, 4, 5, 6]), above = R.coin(), act = R.pick(['tighten', 'loosen']);
      // tightening raises f. If string is above and you tighten -> beats faster. Construct the observed change from the truth.
      var faster = (act === 'tighten') === above;
      var fs = above ? fork + b : fork - b;
      rec('modern.beats', { kind: kind, fork: fork, b: b, act: act, faster: faster });
      p = { q: 'A string sounded with a $' + fork + '$ Hz tuning fork gives $' + b + '$ beats per second. When you ' + act + ' the string slightly, the beats get ' + (faster ? 'faster' : 'slower') + '. What was the string\'s frequency before the change?', a: num(fs, 0.001), unit: 'Hz',
        steps: ['The string is at $' + fork + ' + ' + b + ' = ' + (fork + b) + '$ Hz or $' + fork + ' - ' + b + ' = ' + (fork - b) + '$ Hz.', (act === 'tighten' ? 'Tightening raises' : 'Loosening lowers') + ' the string\'s frequency, since $f \\propto \\sqrt{F_T}$.', 'The beats got ' + (faster ? 'faster, so the string moved away from' : 'slower, so the string moved toward') + ' ' + fork + ' Hz. That means it started ' + (above ? 'above' : 'below') + ' the fork.'],
        hint: 'Decide whether the change moved the string toward the fork\'s frequency or away from it.' };
    } else {
      var f0 = R.pick([110, 196, 220, 262, 330, 440]), pct = R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0]), up = R.coin();
      var fn = f0 * M.sqrt(1 + (up ? 1 : -1) * pct / 100), fb = M.abs(fn - f0);
      rec('modern.beats', { kind: kind, f0: f0, pct: pct, up: up });
      p = { q: 'Two identical strings both sound $' + f0 + '$ Hz. The tension in one is ' + (up ? 'raised' : 'lowered') + ' by $' + nx(pct, 2) + '\\%$. What beat frequency do you now hear?', a: num(fb, 0.03), unit: 'Hz',
        steps: ['For a string, $f = \\dfrac{1}{2L}\\sqrt{F_T/\\mu}$, so $f \\propto \\sqrt{F_T}$.', 'New frequency: $' + f0 + '\\sqrt{' + nx(1 + (up ? 1 : -1) * pct / 100, 4) + '} = ' + qu(fn, 'Hz', 5) + '$.', 'Beats: $|' + nx(fn, 5) + ' - ' + f0 + '| = ' + qu(fb, 'Hz') + '$.'], hint: 'Frequency goes as the square root of the tension.' };
    }
    return p;
  });

  G('modern.shock-waves', function (R, ctx) {
    var kind = R.pick(by(ctx, ['angle', 'mach'], ['speed', 'angle', 'mach'], ['delay', 'height', 'cherenkov']));
    var p;
    if (kind === 'angle') {
      var Mn = R.pick([1.2, 1.25, 1.4, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.5, 2.8, 3.0, 3.5]), th = asind(1 / Mn);
      rec('modern.shock-waves', { kind: kind, M: Mn });
      p = { q: 'A jet flies at Mach $' + nx(Mn, 2) + '$. What is the half-angle of its shock cone?', a: num(th), unit: '°',
        steps: ['$\\sin\\theta = \\dfrac{v}{v_s} = \\dfrac{1}{M} = \\dfrac{1}{' + nx(Mn, 2) + '} = ' + nx(1 / Mn) + '$.', '$\\theta = \\sin^{-1}(' + nx(1 / Mn) + ') = ' + deg(th) + '$.'], hint: 'The sine of the half-angle is the wave speed over the source speed.' };
    } else if (kind === 'mach') {
      var th2 = R.pick([18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 55, 60]), Mn2 = 1 / sind(th2);
      rec('modern.shock-waves', { kind: kind, th: th2 });
      p = { q: 'A photo of a bullet in flight shows a shock cone with half-angle $' + th2 + '^\\circ$. What is the bullet\'s Mach number?', a: num(Mn2), unit: '',
        steps: ['$\\sin\\theta = \\dfrac{1}{M}$, so $M = \\dfrac{1}{\\sin\\theta}$.', '$M = \\dfrac{1}{\\sin ' + th2 + '^\\circ} = ' + nx(Mn2) + '$.'], hint: 'A narrower cone means a faster source.' };
    } else if (kind === 'speed') {
      var vw = R.pick([295, 300, 310, 320, 330, 340, 343]), th3 = R.pick([25, 28, 30, 32, 35, 38, 40, 45, 50, 55]), vs = vw / sind(th3);
      rec('modern.shock-waves', { kind: kind, vw: vw, th: th3 });
      p = { q: 'A plane\'s shock cone has a half-angle of $' + th3 + '^\\circ$ where the speed of sound is $' + vw + '$ m/s. How fast is the plane flying?', a: num(vs), unit: 'm/s',
        steps: ['$\\sin\\theta = \\dfrac{v}{v_s}$, so $v_s = \\dfrac{v}{\\sin\\theta}$.', '$v_s = \\dfrac{' + vw + '}{\\sin ' + th3 + '^\\circ} = ' + qu(vs, 'm/s') + '$.'], hint: 'Solve $\\sin\\theta = v/v_s$ for the source speed.' };
    } else if (kind === 'delay' || kind === 'height') {
      var Mn3 = R.pick([1.25, 1.5, 2.0, 2.5]), vw3 = R.pick([295, 300, 320]), h = R.pick([5.0, 6.0, 8.0, 10, 12]) * 1000, vs3 = Mn3 * vw3, th4 = asind(1 / Mn3), t = h / (vs3 * tand(th4));
      rec('modern.shock-waves', { kind: kind, M: Mn3, vw: vw3, h: h });
      if (kind === 'delay') p = { q: 'A jet flies level at Mach $' + nx(Mn3, 3) + '$, $' + qu(h / 1000, 'km', 2) + '$ above you, where the speed of sound is $' + vw3 + '$ m/s (take it the same all the way down). How long after the jet passes directly overhead do you hear the boom?', a: num(t), unit: 's',
        steps: ['$\\sin\\theta = 1/M = ' + nx(1 / Mn3) + '$, so $\\theta = ' + deg(th4) + '$; the jet\'s speed is $' + nx(Mn3, 3) + ' \\times ' + vw3 + ' = ' + qu(vs3, 'm/s') + '$.', 'The cone reaches you when the jet is a horizontal distance $x = h/\\tan\\theta$ past you: $x = ' + nx(h) + '/' + nx(tand(th4)) + ' = ' + qu(h / tand(th4), 'm') + '$.', '$t = x/v_s = ' + qu(t, 's') + '$.'], hint: 'Draw the cone\'s edge from the jet down to you: it makes the half-angle with the flight path.' };
      else p = { q: 'A jet flying level at Mach $' + nx(Mn3, 3) + '$ passes directly overhead, and you hear its boom $' + qu(t, 's', 3) + '$ later. The speed of sound is $' + vw3 + '$ m/s (the same at all heights). How high is the jet?', a: num(h), unit: 'm',
        steps: ['$\\theta = \\sin^{-1}(1/' + nx(Mn3, 3) + ') = ' + deg(th4) + '$ and $v_s = ' + qu(vs3, 'm/s') + '$.', 'In that time the jet moves $x = v_st = ' + qu(vs3 * t, 'm') + '$ past you.', 'The cone\'s edge reaches you then, so $\\tan\\theta = h/x$: $h = x\\tan\\theta = ' + qu(h, 'm') + '$.'], hint: 'The jet\'s distance past you and its height make a right triangle with the cone\'s half-angle.' };
    } else {
      var n = R.pick([1.33, 1.50, 1.46]), b = R.pick([0.80, 0.85, 0.90, 0.95, 0.99]), th5 = asind(1 / (n * b));
      rec('modern.shock-waves', { kind: kind, n: n, b: b });
      p = { q: 'A charged particle moves through a medium with index of refraction $n = ' + nx(n, 3) + '$ at $' + nx(b, 2) + 'c$, faster than light travels in that medium. Find the half-angle of the cone of light wavefronts it leaves behind (Cherenkov light).', a: num(th5), unit: '°',
        steps: ['Light in the medium moves at $c/n = ' + nx(1 / n) + 'c$.', '$\\sin\\theta = \\dfrac{c/n}{v} = \\dfrac{1}{n\\beta} = \\dfrac{1}{(' + nx(n, 3) + ')(' + nx(b, 2) + ')} = ' + nx(1 / (n * b)) + '$.', '$\\theta = ' + deg(th5) + '$.'], hint: 'Same geometry as a sonic boom, with the wave speed $c/n$.' };
    }
    return p;
  });

  // ---- u2
  // ===================================================================== Unit 2: Wave Optics
  var MEDIA = [['water', 1.33], ['glass', 1.50], ['diamond', 2.42], ['fused quartz', 1.46], ['crown glass', 1.52], ['acrylic plastic', 1.49]];

  G('modern.huygens-principle', function (R, ctx) {
    var kind = R.pick(by(ctx, ['grow', 'lamIn'], ['wavelet', 'lamIn', 'grow'], ['wavelet', 'speedFrom', 'concept']));
    var med = R.pick(MEDIA), n = med[1], p;
    if (kind === 'grow') {
      var t = R.pick([1.0, 2.0, 0.50, 1.5, 3.0]), d = C * t * 1e-9 / n * 100;
      rec('modern.huygens-principle', { kind: kind, n: n, t: t });
      p = { q: 'Light travels through ' + med[0] + ' ($n = ' + nx(n, 3) + '$). In $' + qu(t, 'ns', 2) + '$, how far does a Huygens wavelet grow, in centimeters?', a: num(d), unit: 'cm',
        steps: ['Wavelets spread at the local speed of light, $v = c/n = \\dfrac{' + nx(C) + '\\ \\text{m/s}}{' + nx(n, 3) + '} = ' + qu(C / n, 'm/s') + '$.', 'Radius: $vt = (' + nx(C / n) + ')(' + nx(t, 2) + ' \\times 10^{-9}) = ' + qu(d / 100, 'm') + ' = ' + qu(d, 'cm') + '$.'],
        hint: 'A wavelet grows at the wave speed in that material.' };
    } else if (kind === 'lamIn') {
      var lam = R.pick([450, 500, 532, 589, 600, 633, 650, 700]);
      rec('modern.huygens-principle', { kind: kind, n: n, lam: lam });
      p = { q: 'Light of wavelength $' + qu(lam, 'nm', 3) + '$ in air enters ' + med[0] + ' ($n = ' + nx(n, 3) + '$). What is its wavelength in the ' + med[0] + '?', a: num(lam / n), unit: 'nm',
        steps: ['The frequency stays the same: each wavefront that arrives must leave.', 'The speed drops by a factor of $n$, so the wavelength does too: $\\lambda_n = \\lambda/n = ' + lam + '/' + nx(n, 3) + ' = ' + qu(lam / n, 'nm') + '$.'],
        hint: 'Frequency is fixed by the source; $v = f\\lambda$.' };
    } else if (kind === 'wavelet') {
      var th1 = R.pick([30, 35, 40, 45, 50, 55, 60]), r1 = R.pick([1.0, 1.2, 1.5, 2.0, 3.0]), ratio = 1 / n, r2 = r1 * ratio, AC = r1 / sind(th1), th2 = asind(r2 / AC);
      rec('modern.huygens-principle', { kind: kind, th1: th1, r1: r1, n: n });
      p = { q: 'A straight wavefront of light in air meets a flat surface of ' + med[0] + ' ($n = ' + nx(n, 3) + '$) at $' + th1 + '^\\circ$ from the normal. In the time the far end of the wavefront travels the last $' + qu(r1, 'μm', 2) + '$ to the surface, the wavelet from the near end grows into the ' + med[0] + '. Use that wavelet to find the angle of refraction.', a: num(th2), unit: '°',
        steps: ['The wavelet grows at $c/n$: radius $' + nx(r1, 2) + '/' + nx(n, 3) + ' = ' + qu(r2, 'μm') + '$.', 'Stretch of surface between the two ends: $AC = \\dfrac{' + nx(r1, 2) + '}{\\sin ' + th1 + '^\\circ} = ' + qu(AC, 'μm') + '$.', 'The new wavefront is tangent to the wavelet: $\\sin\\theta_2 = \\dfrac{' + nx(r2) + '}{' + nx(AC) + '} = ' + nx(r2 / AC) + '$.', '$\\theta_2 = ' + deg(th2) + '$, the same as Snell\'s law gives.'],
        hint: 'Two right triangles share the stretch of surface AC as their hypotenuse.' };
    } else if (kind === 'speedFrom') {
      var th1b = R.pick([30, 40, 45, 50, 60]), th2b = asind(sind(th1b) / n), th2s = rnd(th2b, 3), v2 = C * sind(th2s) / sind(th1b);
      rec('modern.huygens-principle', { kind: kind, th1: th1b, th2: th2s });
      p = { q: 'Wavefronts of light in air ($v = 3.00 \\times 10^8$ m/s) strike a clear material at $' + th1b + '^\\circ$ from the normal and leave the boundary at $' + nx(th2s, 3) + '^\\circ$ from the normal. How fast do the Huygens wavelets spread inside the material?', a: num(v2), unit: 'm/s',
        steps: ['From the wavelet construction, $\\dfrac{\\sin\\theta_1}{\\sin\\theta_2} = \\dfrac{v_1}{v_2}$.', '$v_2 = v_1\\dfrac{\\sin\\theta_2}{\\sin\\theta_1} = (3.00 \\times 10^8)\\dfrac{\\sin ' + nx(th2s, 3) + '^\\circ}{\\sin ' + th1b + '^\\circ} = ' + qu(v2, 'm/s') + '$.'],
        hint: 'The wavelet radii in the two materials are in the ratio of the speeds.' };
    } else {
      var right = 'Its frequency stays the same while its speed and wavelength both decrease';
      var wrong = ['Its frequency decreases, so its color changes', 'Its wavelength stays the same while its speed decreases', 'Its speed and wavelength both increase'];
      rec('modern.huygens-principle', { kind: kind });
      p = { q: 'Light passes from air into ' + med[0] + '. According to the wavelet picture, which statement is true?', a: mc(right, wrong),
        steps: ['Wavelets in the ' + med[0] + ' spread at $c/n$, slower than in air.', 'Wavefronts arrive at the boundary at the source\'s rate and must leave at the same rate, so $f$ is unchanged.', 'With $v = f\\lambda$, a smaller $v$ means a smaller $\\lambda$: $\\lambda_n = \\lambda/n$.'],
        hint: 'Ask what the boundary cannot change: the rate at which wavefronts arrive.' };
    }
    return p;
  });

  G('modern.brewster-angle', function (R, ctx) {
    var kind = R.pick(by(ctx, ['thetaB', 'thetaB'], ['nFrom', 'refr', 'thetaB'], ['sun', 'inside', 'nFrom']));
    var med = R.coin() ? R.pick(MEDIA.concat([['ice', 1.31], ['a plastic', 1.59]])) : [R.pick(['a sample of glass', 'a clear plastic', 'a crystal', 'a lens blank']), R.int(140, 175) / 100], n = med[1], p;
    if (kind === 'thetaB') {
      var tb = atand(n);
      rec('modern.brewster-angle', { kind: kind, n1: 1, n2: n });
      p = { q: 'Light in air reflects from ' + med[0] + ' ($n = ' + nx(n, 3) + '$). At what angle of incidence is the reflected light completely polarized?', a: num(tb), unit: '°',
        steps: ['$\\tan\\theta_B = \\dfrac{n_2}{n_1} = \\dfrac{' + nx(n, 3) + '}{1.00}$.', '$\\theta_B = \\tan^{-1}(' + nx(n, 3) + ') = ' + deg(tb) + '$ from the normal.'], hint: 'Brewster: $\\tan\\theta_B = n_2/n_1$.' };
    } else if (kind === 'nFrom') {
      var tb2 = R.int(104, 136) / 2, n2 = tand(tb2);
      rec('modern.brewster-angle', { kind: kind, tb: tb2 });
      p = { q: 'Light in air reflecting from a new transparent material is completely polarized when the angle of incidence is $' + nx(tb2, 3) + '^\\circ$. What is the material\'s index of refraction?', a: num(n2, 0.01), unit: '',
        steps: ['$\\tan\\theta_B = n_2/n_1$ with $n_1 = 1.00$.', '$n_2 = \\tan ' + nx(tb2, 3) + '^\\circ = ' + nx(n2) + '$.'], hint: 'Solve $\\tan\\theta_B = n_2/n_1$ for $n_2$.' };
    } else if (kind === 'refr') {
      var tb3 = atand(n);
      rec('modern.brewster-angle', { kind: kind, n: n });
      p = { q: 'Light in air hits ' + med[0] + ' ($n = ' + nx(n, 3) + '$) at Brewster\'s angle. What is the angle of refraction?', a: num(90 - tb3), unit: '°',
        steps: ['$\\theta_B = \\tan^{-1}(' + nx(n, 3) + ') = ' + deg(tb3) + '$.', 'At Brewster\'s angle the reflected and refracted rays are perpendicular, so $\\theta_2 = 90^\\circ - \\theta_B = ' + deg(90 - tb3) + '$.', 'Check with Snell\'s law: $\\sin\\theta_2 = \\sin ' + nx(tb3, 3) + '^\\circ/' + nx(n, 3) + ' = ' + nx(sind(tb3) / n) + '$.'],
        hint: 'At Brewster\'s angle, $\\theta_B + \\theta_2 = 90^\\circ$.' };
    } else if (kind === 'sun') {
      var w = R.pick([['a calm lake', 1.33], ['a sheet of ice', 1.31], ['a flat glass skylight', R.pick([1.50, 1.52])], ['a wet road', 1.33], ['a glossy plastic table', R.pick([1.46, 1.49, 1.55, 1.59])], ['a pool of oil', R.pick([1.44, 1.47])]]), tb4 = atand(w[1]);
      rec('modern.brewster-angle', { kind: kind, n: w[1] });
      p = { q: 'Sunlight reflects from ' + w[0] + ' ($n = ' + nx(w[1], 3) + '$). How high above the horizon is the Sun, in degrees, when the reflection is completely polarized?', a: num(90 - tb4), unit: '°',
        steps: ['$\\theta_B = \\tan^{-1}(' + nx(w[1], 3) + ') = ' + deg(tb4) + '$, measured from the normal, which points straight up.', 'Height above the horizon is measured from the surface: $90^\\circ - ' + nx(tb4) + '^\\circ = ' + deg(90 - tb4) + '$.'],
        hint: 'Brewster\'s angle is measured from the vertical normal; the horizon is $90^\\circ$ away from it.' };
    } else {
      var pair = R.pick([[1.52, 1.33, 'glass', 'water'], [1.50, 1.00, 'glass', 'air'], [1.33, 1.00, 'water', 'air'], [2.42, 1.33, 'diamond', 'water'], [1.33, 1.52, 'water', 'glass'], [1.31, 1.00, 'ice', 'air'], [1.46, 1.00, 'fused quartz', 'air'], [1.65, 1.33, 'flint glass', 'water'], [1.33, 1.65, 'water', 'flint glass'], [1.49, 1.33, 'acrylic', 'water'], [2.42, 1.00, 'diamond', 'air']]), tb5 = atand(pair[1] / pair[0]);
      rec('modern.brewster-angle', { kind: kind, n1: pair[0], n2: pair[1] });
      p = { q: 'Light traveling in ' + pair[2] + ' ($n = ' + nx(pair[0], 3) + '$) reflects from a boundary with ' + pair[3] + ' ($n = ' + nx(pair[1], 3) + '$). At what angle of incidence is the reflection completely polarized?', a: num(tb5), unit: '°',
        steps: ['$n_1$ is where the light starts: $n_1 = ' + nx(pair[0], 3) + '$, $n_2 = ' + nx(pair[1], 3) + '$.', '$\\tan\\theta_B = \\dfrac{' + nx(pair[1], 3) + '}{' + nx(pair[0], 3) + '} = ' + nx(pair[1] / pair[0]) + '$, so $\\theta_B = ' + deg(tb5) + '$.'],
        hint: 'Put the index of the second material on top.' };
    }
    return p;
  });

  G('modern.two-slit-intensity', function (R, ctx) {
    var kind = R.pick(by(ctx, ['Iy', 'Iy'], ['Iy', 'counts', 'half'], ['firstZero', 'Itheta', 'counts']));
    var p, lam = R.pick([450, 500, 550, 600, 633, 650]), d = R.pick([0.050, 0.10, 0.15, 0.20, 0.25]), L = R.pick([1.0, 1.5, 2.0, 2.5, 3.0]);
    var dy = lam * 1e-9 * L / (d * 1e-3);
    if (kind === 'Iy') {
      var fr = R.pick([0.10, 0.125, 0.20, 0.25, 0.30, 0.375, 0.40, 0.60, 0.70, 0.75, 0.80, 1 / 3, 1 / 6]), y = rnd(fr * dy * 1000, 3);
      var arg = PI * d * 1e-3 * y * 1e-3 / (lam * 1e-9 * L), I = M.pow(M.cos(arg), 2);
      rec('modern.two-slit-intensity', { kind: kind, lam: lam, d: d, L: L, y: y });
      p = { q: 'Two narrow slits $' + qu(d, 'mm', 2) + '$ apart are lit with $' + qu(lam, 'nm', 3) + '$ light, and the screen is $' + qu(L, 'm', 2) + '$ away. What is the intensity at $' + qu(y, 'mm', 3) + '$ from the center of the pattern, as a fraction of the central intensity $I_{\\max}$?', a: num(I, 0.02), unit: '',
        steps: ['Small angles: $\\sin\\theta \\approx y/L$, so $I = I_{\\max}\\cos^2\\!\\left(\\dfrac{\\pi d y}{\\lambda L}\\right)$.', '$\\dfrac{\\pi d y}{\\lambda L} = \\dfrac{\\pi(' + nx(d * 1e-3, 2) + ')(' + nx(y * 1e-3, 3) + ')}{(' + nx(lam * 1e-9, 3) + ')(' + nx(L, 2) + ')} = ' + nx(arg) + '$ rad.', '$I/I_{\\max} = \\cos^2(' + nx(arg) + ') = ' + nx(I) + '$.'],
        hint: 'The phase difference is $2\\pi d\\sin\\theta/\\lambda$; the intensity goes as $\\cos^2$ of half of it.' };
    } else if (kind === 'half') {
      var yh = dy / 4 * 1000;
      rec('modern.two-slit-intensity', { kind: kind, lam: lam, d: d, L: L });
      p = { q: 'Two narrow slits $' + qu(d, 'mm', 2) + '$ apart are lit with $' + qu(lam, 'nm', 3) + '$ light, and the screen is $' + qu(L, 'm', 2) + '$ away. How far from the center of the pattern does the intensity first drop to half of $I_{\\max}$?', a: num(yh), unit: 'mm',
        steps: ['Half intensity: $\\cos^2\\!\\left(\\dfrac{\\pi d y}{\\lambda L}\\right) = \\dfrac{1}{2}$, so $\\dfrac{\\pi d y}{\\lambda L} = \\dfrac{\\pi}{4}$.', '$y = \\dfrac{\\lambda L}{4d} = \\dfrac{(' + nx(lam * 1e-9, 3) + ')(' + nx(L, 2) + ')}{4(' + nx(d * 1e-3, 2) + ')} = ' + qu(yh / 1000, 'm') + ' = ' + qu(yh, 'mm') + '$.', 'That is a quarter of the fringe spacing $\\lambda L/d$.'],
        hint: 'Solve $\\cos^2 x = 1/2$ for the smallest $x$.' };
    } else if (kind === 'counts') {
      var N = R.pick([3, 4, 5, 6, 8, 10]), what = R.pick(['sec', 'zeros', 'peak']);
      var val = what === 'sec' ? N - 2 : what === 'zeros' ? N - 1 : N * N;
      rec('modern.two-slit-intensity', { kind: kind, N: N, what: what });
      var qq = what === 'sec' ? 'How many secondary (small) maxima lie between two neighboring principal maxima?' : what === 'zeros' ? 'How many points of zero intensity lie between two neighboring principal maxima?' : 'A principal maximum is how many times as bright as the light from one slit alone?';
      p = { q: 'A grating has $N = ' + N + '$ equal, narrow slits lit by one wavelength. ' + qq, a: exact(val),
        steps: what === 'peak' ? ['At a principal maximum all ' + N + ' waves arrive in step, so their amplitudes add: $' + N + 'E_0$.', 'Intensity goes as amplitude squared: $(' + N + 'E_0)^2 = ' + N * N + 'I_0$.'] :
          ['Between principal maxima, the phase step $\\phi$ between neighboring slits runs from $0$ to $2\\pi$.', 'The total is zero whenever $N\\phi$ is a multiple of $2\\pi$ but $\\phi$ is not: $\\phi = \\dfrac{2\\pi}{' + N + '}, \\dfrac{4\\pi}{' + N + '}, \\ldots$, which gives $N - 1 = ' + (N - 1) + '$ zeros.', what === 'sec' ? 'Between each pair of neighboring zeros there is one small maximum: $N - 2 = ' + (N - 2) + '$.' : 'So there are $' + (N - 1) + '$ dark points.'],
        hint: what === 'peak' ? 'Amplitudes add; intensities go as amplitude squared.' : 'Count the phase steps $\\phi$ with $N\\phi$ a multiple of $2\\pi$.' };
    } else if (kind === 'firstZero') {
      var N2 = R.pick([2, 3, 4, 5, 6, 10, 20]), dd = R.pick([2.0, 2.5, 5.0, 10, 20]), s = lam * 1e-9 / (N2 * dd * 1e-6), th = asind(s);
      rec('modern.two-slit-intensity', { kind: kind, N: N2, d: dd, lam: lam });
      p = { q: 'A set of $N = ' + N2 + '$ equal slits, each $' + qu(dd, 'μm', 2) + '$ from the next, is lit with $' + qu(lam, 'nm', 3) + '$ light. At what angle is the first point of zero intensity next to the central maximum?', a: num(th), unit: '°',
        steps: ['The $N$ waves cancel when the phase step between neighbors is $\\phi = 2\\pi/N$, that is $d\\sin\\theta = \\lambda/N$.', '$\\sin\\theta = \\dfrac{' + nx(lam * 1e-9, 3) + '}{' + N2 + '(' + nx(dd * 1e-6, 2) + ')} = ' + nx(s) + '$.', '$\\theta = ' + deg(th) + '$.'],
        hint: 'All $N$ phase steps together make one full circle at the first zero.' };
    } else {
      var dd2 = R.pick([2.0, 3.0, 4.0, 5.0, 6.0]), thd = R.pick([3.0, 4.0, 5.0, 7.0, 8.0, 10.0, 12.0]), ph = PI * dd2 * 1e-6 * sind(thd) / (lam * 1e-9), I2 = M.pow(M.cos(ph), 2), tries = 0;
      while ((I2 < 0.08 || I2 > 0.95) && tries < 40) { thd = R.pick([3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 15.0]); ph = PI * dd2 * 1e-6 * sind(thd) / (lam * 1e-9); I2 = M.pow(M.cos(ph), 2); tries++; }
      rec('modern.two-slit-intensity', { kind: kind, d: dd2, th: thd, lam: lam });
      p = { q: 'Two narrow slits $' + qu(dd2, 'μm', 2) + '$ apart are lit with $' + qu(lam, 'nm', 3) + '$ light. What is the intensity at $\\theta = ' + nx(thd, 2) + '^\\circ$, as a fraction of $I_{\\max}$?', a: num(I2, 0.02), unit: '',
        steps: ['$I = I_{\\max}\\cos^2\\!\\left(\\dfrac{\\pi d\\sin\\theta}{\\lambda}\\right)$.', '$\\dfrac{\\pi d\\sin\\theta}{\\lambda} = \\dfrac{\\pi(' + nx(dd2 * 1e-6, 2) + ')\\sin ' + nx(thd, 2) + '^\\circ}{' + nx(lam * 1e-9, 3) + '} = ' + nx(ph) + '$ rad.', '$I/I_{\\max} = \\cos^2(' + nx(ph) + ') = ' + nx(I2) + '$.'],
        hint: 'Work out the half phase difference $\\pi d\\sin\\theta/\\lambda$ in radians.' };
    }
    return p;
  });

  G('modern.diffraction-envelope', function (R, ctx) {
    var kind = R.pick(by(ctx, ['missing', 'missing'], ['count', 'Im', 'missing'], ['width', 'count', 'Im']));
    var r = by(ctx, R.pick([2, 3, 4, 5]), R.pick([2, 3, 4, 5, 6]), R.pick([2, 3, 4, 5, 2.5, 3.5])), a = R.pick([0.020, 0.025, 0.040, 0.050, 0.10]), d = rnd(a * r, 3), p;
    var dT = qu(d, 'mm', 3), aT = qu(a, 'mm', 2);
    if (kind === 'missing') {
      rec('modern.diffraction-envelope', { kind: kind, d: d, a: a });
      var first = r === M.round(r) ? r : 2 * r;
      p = { q: 'Two slits, each $' + aT + '$ wide, have centers $' + dT + '$ apart. What is the lowest order $m > 0$ of the double-slit bright fringes that is missing from the pattern?', a: exact(first),
        steps: ['A bright fringe $d\\sin\\theta = m\\lambda$ is missing when it lands on a zero of the single-slit envelope, $a\\sin\\theta = p\\lambda$.', 'Both together: $m = p\\,\\dfrac{d}{a} = ' + nx(r, 2) + 'p$.', r === M.round(r) ? 'The smallest is $p = 1$: $m = ' + r + '$.' : 'The smallest whole number is at $p = 2$: $m = ' + first + '$.'],
        hint: 'Divide the slit spacing by the slit width.' };
    } else if (kind === 'count') {
      var cnt = r === M.round(r) ? 2 * r - 1 : 2 * M.floor(r) + 1;
      rec('modern.diffraction-envelope', { kind: kind, d: d, a: a });
      p = { q: 'Two slits, each $' + aT + '$ wide, have centers $' + dT + '$ apart. How many bright fringes lie inside the central bright band of the single-slit envelope?', a: exact(cnt),
        steps: ['The central band of the envelope runs out to $a\\sin\\theta = \\lambda$ on each side.', 'In terms of double-slit orders that is $|m| < \\dfrac{d}{a} = ' + nx(r, 2) + '$' + (r === M.round(r) ? ', and $m = \\pm' + r + '$ itself is missing (it sits on the zero).' : '.'), 'Allowed orders: $m = 0, \\pm1, \\ldots, \\pm' + (r === M.round(r) ? r - 1 : M.floor(r)) + '$, which is ' + cnt + ' fringes.'],
        hint: 'Fringes with $|m| < d/a$ fit inside the central band.' };
    } else if (kind === 'Im') {
      var m = R.pick([1, 2]), beta = PI * m / r, env = M.pow(M.sin(beta) / beta, 2);
      if (m >= r) { m = 1; beta = PI / r; env = M.pow(M.sin(beta) / beta, 2); }
      rec('modern.diffraction-envelope', { kind: kind, d: d, a: a, m: m });
      p = { q: 'Two slits, each $' + aT + '$ wide, have centers $' + dT + '$ apart. How bright is the $m = ' + m + '$ bright fringe, as a fraction of the central fringe?', a: num(env, 0.02), unit: '',
        steps: ['At the $m = ' + m + '$ fringe, $d\\sin\\theta = ' + (m === 1 ? '' : m) + '\\lambda$, so the two-slit factor $\\cos^2(\\pi d\\sin\\theta/\\lambda)$ equals 1.', 'Envelope there: $\\beta = \\dfrac{\\pi a\\sin\\theta}{\\lambda} = ' + (m === 1 ? '' : m) + '\\pi\\dfrac{a}{d} = ' + nx(beta) + '$ rad.', '$\\left(\\dfrac{\\sin\\beta}{\\beta}\\right)^2 = \\left(\\dfrac{' + nx(M.sin(beta)) + '}{' + nx(beta) + '}\\right)^2 = ' + nx(env) + '$.'],
        hint: 'Only the single-slit envelope dims a bright fringe; find $\\beta$ at that fringe.' };
    } else {
      var rr = R.pick([3, 4, 5, 6]), dd = R.pick([0.10, 0.12, 0.15, 0.20, 0.24, 0.30]), aa = dd / rr;
      rec('modern.diffraction-envelope', { kind: kind, d: dd, r: rr });
      p = { q: 'A double slit with centers $' + qu(dd, 'mm', 2) + '$ apart shows every bright order up to $m = ' + (rr - 1) + '$, but the $m = ' + rr + '$ fringe is missing. How wide is each slit, in micrometers?', a: num(aa * 1000), unit: 'μm',
        steps: ['The first missing order is where the first zero of the envelope lands: $m = d/a$.', '$a = \\dfrac{d}{' + rr + '} = \\dfrac{' + nx(dd, 2) + '\\ \\text{mm}}{' + rr + '} = ' + qu(aa * 1000, 'μm') + '$.'],
        hint: 'The first missing order equals $d/a$.' };
    }
    return p;
  });

  G('modern.resolution', function (R, ctx) {
    var kind = R.pick(by(ctx, ['theta', 'theta'], ['sep', 'maxDist', 'arcsec'], ['aperture', 'sep', 'maxDist']));
    var p, lam = R.pick([450, 500, 550, 600, 650]);
    if (kind === 'theta' || kind === 'arcsec') {
      var scope = R.pick([['a backyard telescope', 0.20], ['a telescope', 0.10], ['a large telescope', 4.0], ['the Hubble Space Telescope', 2.4], ['a pair of binoculars', 0.050], ['a camera lens', 0.025]]);
      var th = 1.22 * lam * 1e-9 / scope[1], as = th * 206265;
      rec('modern.resolution', { kind: kind, lam: lam, D: scope[1] });
      if (kind === 'theta') p = { q: 'Find the diffraction limit (Rayleigh criterion) of ' + scope[0] + ' with an aperture $' + qu(scope[1], 'm', 2) + '$ across, at $' + qu(lam, 'nm', 3) + '$, in radians.', a: num(th), unit: 'rad',
        steps: ['$\\theta_R = 1.22\\dfrac{\\lambda}{D} = 1.22\\,\\dfrac{' + nx(lam * 1e-9, 3) + '\\ \\text{m}}{' + nx(scope[1], 2) + '\\ \\text{m}}$.', '$\\theta_R = ' + qu(th, 'rad') + '$.'], hint: 'Use $\\theta_R = 1.22\\lambda/D$ with both lengths in meters.' };
      else p = { q: 'Find the diffraction limit of ' + scope[0] + ' with an aperture $' + qu(scope[1], 'm', 2) + '$ across, at $' + qu(lam, 'nm', 3) + '$, in arcseconds (1 rad $= 206{,}265\'\'$).', a: num(as), unit: '″',
        steps: ['$\\theta_R = 1.22\\dfrac{\\lambda}{D} = 1.22\\,\\dfrac{' + nx(lam * 1e-9, 3) + '}{' + nx(scope[1], 2) + '} = ' + qu(th, 'rad') + '$.', 'In arcseconds: $' + nx(th) + ' \\times 206{,}265 = ' + nx(as) + '\'\'$.'], hint: 'Find the angle in radians first, then convert.' };
    } else if (kind === 'sep') {
      var c = R.pick([['the Moon', 3.84e8, 'm'], ['a mountain 50 km away', 5.0e4, 'cm'], ['a satellite 400 km up', 4.0e5, 'm'], ['a sign 2.0 km away', 2.0e3, 'mm']]), D = R.pick([0.050, 0.10, 0.15, 0.20, 0.50, 1.0, 2.4]);
      var sep = 1.22 * lam * 1e-9 / D * c[1], scale = c[2] === 'cm' ? 100 : c[2] === 'mm' ? 1000 : 1;
      rec('modern.resolution', { kind: kind, lam: lam, D: D, L: c[1], scale: scale });
      p = { q: 'A telescope with a $' + qu(D * 100, 'cm', 3) + '$ aperture looks at ' + c[0] + ' (distance $' + qu(c[1], 'm', 3) + '$) in $' + qu(lam, 'nm', 3) + '$ light. What is the smallest separation between two features it could resolve there, if diffraction is the only limit? Answer in ' + { m: 'meters', cm: 'centimeters', mm: 'millimeters' }[c[2]] + '.', a: num(sep * scale), unit: c[2],
        steps: ['$\\theta_R = 1.22\\dfrac{\\lambda}{D} = 1.22\\,\\dfrac{' + nx(lam * 1e-9, 3) + '}{' + nx(D, 2) + '} = ' + qu(1.22 * lam * 1e-9 / D, 'rad') + '$.', 'Small angles: separation $= L\\theta_R = (' + nx(c[1]) + ')(' + nx(1.22 * lam * 1e-9 / D) + ') = ' + qu(sep, 'm') + '$' + (scale !== 1 ? ' $= ' + qu(sep * scale, c[2]) + '$' : '') + '.'],
        hint: 'Arc length = distance × angle in radians.' };
    } else if (kind === 'maxDist') {
      var pup = R.pick([2.0, 3.0, 4.0, 5.0, 6.0]), s = R.pick([['headlights 1.4 m apart', 1.4], ['two lamps 0.50 m apart', 0.50], ['two people 1.0 m apart', 1.0], ['the two dots of a colon 2.0 mm apart', 0.0020]]);
      var thE = 1.22 * lam * 1e-9 / (pup * 1e-3), dist = s[1] / thE;
      rec('modern.resolution', { kind: kind, lam: lam, pupil: pup, s: s[1] });
      p = { q: 'Your pupil is $' + qu(pup, 'mm', 2) + '$ across. Using $' + qu(lam, 'nm', 3) + '$ light and counting only diffraction, from how far away, in meters, could you still see ' + s[0] + ' as two?', a: num(dist), unit: 'm',
        steps: ['$\\theta_R = 1.22\\,\\dfrac{' + nx(lam * 1e-9, 3) + '}{' + nx(pup * 1e-3, 2) + '} = ' + qu(thE, 'rad') + '$.', 'Distance $= \\dfrac{\\text{separation}}{\\theta_R} = \\dfrac{' + nx(s[1], 2) + '}{' + nx(thE) + '} = ' + qu(dist, 'm') + '$.'],
        hint: 'At the limit, the separation divided by the distance equals $\\theta_R$.' };
    } else {
      var L2 = R.pick([3.84e8, 1.0e6, 3.6e7]), s2 = R.pick([10, 20, 50, 100, 200]), Dn = 1.22 * lam * 1e-9 * L2 / s2;
      rec('modern.resolution', { kind: kind, lam: lam, L: L2, s: s2 });
      p = { q: 'What is the smallest aperture, in meters, that could resolve two features $' + qu(s2, 'm', 2) + '$ apart from a distance of $' + qu(L2, 'm', 3) + '$, at $' + qu(lam, 'nm', 3) + '$?', a: num(Dn), unit: 'm',
        steps: ['The features subtend $\\theta = \\dfrac{' + nx(s2, 2) + '}{' + nx(L2) + '} = ' + qu(s2 / L2, 'rad') + '$.', 'Set $1.22\\lambda/D = \\theta$: $D = \\dfrac{1.22\\lambda}{\\theta} = \\dfrac{1.22(' + nx(lam * 1e-9, 3) + ')}{' + nx(s2 / L2) + '} = ' + qu(Dn, 'm') + '$.'],
        hint: 'Find the angle the features make, then solve the Rayleigh criterion for $D$.' };
    }
    return p;
  });

  G('modern.michelson-interferometer', function (R, ctx) {
    var kind = R.pick(by(ctx, ['N', 'N'], ['d', 'lam', 'N'], ['film', 'gas', 'lam']));
    var lam = R.pick([546, 589, 633, 532, 488, 650]), p;
    if (kind === 'N') {
      var d = R.pick([0.010, 0.020, 0.050, 0.10, 0.25, 0.50]), N = 2 * d * 1e-3 / (lam * 1e-9);
      rec('modern.michelson-interferometer', { kind: kind, lam: lam, d: d });
      p = { q: 'In a Michelson interferometer lit by $' + qu(lam, 'nm', 3) + '$ light, one mirror is moved $' + qu(d, 'mm', 2) + '$. How many fringes pass the center of the pattern?', a: num(N, 0.01), unit: 'fringes',
        steps: ['The light goes out and back, so the path changes by $2d = ' + qu(2 * d, 'mm', 2) + '$.', '$N = \\dfrac{2d}{\\lambda} = \\dfrac{' + nx(2 * d * 1e-3, 2) + '}{' + nx(lam * 1e-9, 3) + '} = ' + nx(N, 4) + '$.'],
        hint: 'One fringe for each half wavelength of mirror motion.' };
    } else if (kind === 'd') {
      var N2 = R.pick([100, 150, 200, 250, 400, 500, 800, 1000]), d2 = N2 * lam * 1e-9 / 2;
      rec('modern.michelson-interferometer', { kind: kind, lam: lam, N: N2 });
      p = { q: 'A Michelson interferometer uses $' + qu(lam, 'nm', 3) + '$ light. While a mirror moves, $' + N2 + '$ fringes pass. How far did the mirror move, in micrometers?', a: num(d2 * 1e6), unit: 'μm',
        steps: ['Each fringe is $\\lambda/2$ of mirror motion.', '$d = \\dfrac{N\\lambda}{2} = \\dfrac{' + N2 + '(' + nx(lam * 1e-9, 3) + ')}{2} = ' + qu(d2, 'm') + ' = ' + qu(d2 * 1e6, 'μm') + '$.'],
        hint: 'The round trip grows by $2d$; each fringe is one wavelength of round trip.' };
    } else if (kind === 'lam') {
      var d3 = R.pick([0.100, 0.150, 0.200, 0.250]), N3 = M.round(2 * d3 * 1e-3 / (lam * 1e-9)), l3 = 2 * d3 * 1e-3 / N3;
      rec('modern.michelson-interferometer', { kind: kind, d: d3, N: N3 });
      p = { q: 'Moving a Michelson interferometer\'s mirror by $' + qu(d3, 'mm', 3) + '$ makes $' + N3 + '$ fringes pass. What is the wavelength of the light, in nanometers?', a: num(l3 * 1e9), unit: 'nm',
        steps: ['$N = 2d/\\lambda$, so $\\lambda = \\dfrac{2d}{N}$.', '$\\lambda = \\dfrac{2(' + nx(d3 * 1e-3, 3) + ')}{' + N3 + '} = ' + qu(l3, 'm') + ' = ' + qu(l3 * 1e9, 'nm') + '$.'],
        hint: 'Solve $N = 2d/\\lambda$ for $\\lambda$.' };
    } else if (kind === 'film') {
      var nf = R.pick([1.40, 1.45, 1.50, 1.58, 1.60]), t = R.pick([5.0, 8.0, 10, 12, 20]), Nf = 2 * t * 1e-6 * (nf - 1) / (lam * 1e-9);
      rec('modern.michelson-interferometer', { kind: kind, lam: lam, n: nf, t: t });
      p = { q: 'A thin plastic sheet $' + qu(t, 'μm', 2) + '$ thick with index $' + nx(nf, 3) + '$ is slipped into one arm of a Michelson interferometer lit by $' + qu(lam, 'nm', 3) + '$ light, perpendicular to the beam. How many fringes shift?', a: num(Nf, 0.01), unit: 'fringes',
        steps: ['The beam crosses the sheet twice. The sheet holds $nt/\\lambda$ wavelengths where there were $t/\\lambda$ before.', 'Extra path: $2t(n - 1) = 2(' + nx(t * 1e-6, 2) + ')(' + nx(nf - 1, 2) + ') = ' + qu(2 * t * 1e-6 * (nf - 1), 'm') + '$.', '$N = \\dfrac{2t(n - 1)}{\\lambda} = ' + nx(Nf) + '$.'],
        hint: 'Only the extra wavelengths count: $n - 1$, and the light passes through twice.' };
    } else {
      var Lc = R.pick([2.0, 3.0, 4.0, 5.0, 10]), Ng = R.pick([18, 20, 25, 28, 30, 40, 45]), ng = 1 + Ng * lam * 1e-9 / (2 * Lc * 1e-2);
      rec('modern.michelson-interferometer', { kind: kind, lam: lam, L: Lc, N: Ng });
      p = { q: 'An empty cell $' + qu(Lc, 'cm', 2) + '$ long sits in one arm of a Michelson interferometer lit by $' + qu(lam, 'nm', 3) + '$ light. As gas flows into the cell, $' + Ng + '$ fringes pass. What is $n - 1$ for the gas?', a: num(ng - 1), unit: '',
        steps: ['The light crosses the cell twice, so the extra path is $2L(n - 1)$.', '$2L(n - 1) = N\\lambda$: $n - 1 = \\dfrac{' + Ng + '(' + nx(lam * 1e-9, 3) + ')}{2(' + nx(Lc * 1e-2, 2) + ')} = ' + nx(ng - 1) + '$.'],
        hint: 'The fringe count measures the extra wavelengths of round trip: $N\\lambda = 2L(n - 1)$.' };
    }
    return p;
  });

  G('modern.thin-film-design', function (R, ctx) {
    var kind = R.pick(by(ctx, ['ar', 'ar'], ['ar2', 'wedge', 'ideal'], ['spacing', 'hr', 'ar2']));
    var lam = R.pick([500, 520, 550, 560, 600]), p;
    var coat = R.pick([['magnesium fluoride', 1.38], ['a fluoropolymer', 1.34], ['silica', 1.46], ['cryolite', 1.35]]), ng = R.pick([1.52, 1.60, 1.70, 1.80]);
    if (kind === 'ar' || kind === 'ar2') {
      var m = kind === 'ar' ? 0 : R.pick([1, 2]), t = (2 * m + 1) * lam / (4 * coat[1]);
      rec('modern.thin-film-design', { kind: kind, lam: lam, nc: coat[1], ng: ng, m: m });
      p = { q: 'A lens of glass ($n = ' + nx(ng, 3) + '$) gets a coating of ' + coat[0] + ' ($n = ' + nx(coat[1], 3) + '$) to cancel the reflection of $' + qu(lam, 'nm', 3) + '$ light. What is the ' + (m === 0 ? 'thinnest' : m === 1 ? 'second-thinnest' : 'third-thinnest') + ' coating that works?', a: num(t), unit: 'nm',
        steps: ['Both reflections go toward a higher index (1.00 → ' + nx(coat[1], 3) + ' → ' + nx(ng, 3) + '), so both flip and the flips cancel.', 'Cancellation then needs $2t = (m + \\tfrac{1}{2})\\lambda_c$ with $\\lambda_c = \\lambda/n_c = ' + qu(lam / coat[1], 'nm') + '$.', 'With $m = ' + m + '$: $t = \\dfrac{' + (2 * m + 1) + '\\lambda}{4n_c} = \\dfrac{' + (2 * m + 1) + '(' + lam + ')}{4(' + nx(coat[1], 3) + ')} = ' + qu(t, 'nm') + '$.'],
        hint: 'Count the half-wave flips, and use the wavelength inside the coating.' };
    } else if (kind === 'ideal') {
      rec('modern.thin-film-design', { kind: kind, ng: ng });
      p = { q: 'For an antireflection coating to cancel a reflection completely, the reflections from its two surfaces must be equally strong, which happens when $\\dfrac{n_c}{1.00} = \\dfrac{n_g}{n_c}$. What coating index is ideal on glass with $n_g = ' + nx(ng, 3) + '$?', a: num(M.sqrt(ng), 0.01), unit: '',
        steps: ['$n_c^2 = (1.00)(' + nx(ng, 3) + ')$.', '$n_c = \\sqrt{' + nx(ng, 3) + '} = ' + nx(M.sqrt(ng)) + '$.'],
        hint: 'The coating index should be the geometric mean of the indices on either side.' };
    } else if (kind === 'wedge' || kind === 'spacing') {
      var Lp = R.pick([5.0, 8.0, 10.0, 12.0, 15.0]), m2 = R.pick([40, 60, 80, 100, 120, 150, 200]), tw = m2 * lam / 2;
      rec('modern.thin-film-design', { kind: kind, lam: lam, L: Lp, m: m2 });
      if (kind === 'wedge') p = { q: 'Two flat glass plates $' + qu(Lp, 'cm', 2) + '$ long touch along one edge and are held apart by a thin wire at the other edge, making an air wedge. In $' + qu(lam, 'nm', 3) + '$ light, the dark fringe at the wire is the $' + m2 + '$th one counted from the contact line (which is dark fringe number 0). How thick is the wire, in micrometers?', a: num(tw / 1000), unit: 'μm',
        steps: ['Only the reflection at the lower plate (air to glass) flips, so dark fringes are where $2t = m\\lambda$; the contact line is $m = 0$.', 'At the wire: $t = \\dfrac{m\\lambda}{2} = \\dfrac{' + m2 + '(' + lam + '\\ \\text{nm})}{2} = ' + qu(tw, 'nm') + ' = ' + qu(tw / 1000, 'μm') + '$.'],
        hint: 'Each dark fringe means the air gap has grown by half a wavelength.' };
      else p = { q: 'Two flat glass plates $' + qu(Lp, 'cm', 2) + '$ long touch along one edge and are separated by $' + qu(tw / 1000, 'μm', 3) + '$ at the other. In $' + qu(lam, 'nm', 3) + '$ light, how far apart are neighboring dark fringes, in millimeters?', a: num(Lp * 10 / m2), unit: 'mm',
        steps: ['Neighboring dark fringes differ in gap by $\\lambda/2 = ' + qu(lam / 2, 'nm', 3) + '$.', 'Number of half-wavelength steps across the wedge: $\\dfrac{' + nx(tw, 3) + '\\ \\text{nm}}{' + nx(lam / 2, 3) + '\\ \\text{nm}} = ' + m2 + '$.', 'The gap grows evenly, so the spacing is $\\dfrac{' + nx(Lp * 10, 3) + '\\ \\text{mm}}{' + m2 + '} = ' + qu(Lp * 10 / m2, 'mm') + '$.'],
        hint: 'How many half wavelengths does the gap grow across the whole wedge?' };
    } else {
      var hc = R.pick([['titanium dioxide', 2.40], ['zinc sulfide', 2.35], ['tantalum oxide', 2.10]]), ng2 = R.pick([1.50, 1.52]), th = lam / (4 * hc[1]);
      rec('modern.thin-film-design', { kind: kind, lam: lam, nc: hc[1], ng: ng2 });
      p = { q: 'A coating of ' + hc[0] + ' ($n = ' + nx(hc[1], 3) + '$) on glass ($n = ' + nx(ng2, 3) + '$) is meant to make the reflection of $' + qu(lam, 'nm', 3) + '$ light as <b>strong</b> as possible. What is the thinnest coating that does it?', a: num(th), unit: 'nm',
        steps: ['Top surface: 1.00 → ' + nx(hc[1], 3) + ' flips. Bottom surface: ' + nx(hc[1], 3) + ' → ' + nx(ng2, 3) + ' (a lower index) does not. One flip in all.', 'With one flip, the reflections add when $2t = (m + \\tfrac{1}{2})\\lambda_c$.', 'Thinnest: $t = \\dfrac{\\lambda}{4n_c} = \\dfrac{' + lam + '}{4(' + nx(hc[1], 3) + ')} = ' + qu(th, 'nm') + '$.'],
        hint: 'Count the flips first: a coating with a higher index than the glass has only one.' };
    }
    return p;
  });

  G('modern.bragg-diffraction', function (R, ctx) {
    var kind = R.pick(by(ctx, ['theta', 'theta'], ['d', 'lam', 'theta2'], ['normal', 'turned', 'maxm']));
    var lam = R.pick([0.154, 0.071, 0.179, 0.100, 0.120]), d = R.pick([0.282, 0.201, 0.314, 0.246, 0.360, 0.400]), p;
    if (kind === 'theta' || kind === 'theta2') {
      var m = kind === 'theta' ? 1 : 2; if (m * lam / (2 * d) >= 0.95) m = 1;
      var th = asind(m * lam / (2 * d));
      rec('modern.bragg-diffraction', { kind: kind, lam: lam, d: d, m: m });
      p = { q: 'X-rays of wavelength $' + qu(lam, 'nm', 3) + '$ reflect from crystal planes $' + qu(d, 'nm', 3) + '$ apart. Find the glancing angle (measured from the planes) for ' + (m === 1 ? 'first' : 'second') + '-order reflection.', a: num(th), unit: '°',
        steps: ['Bragg: $2d\\sin\\theta = m\\lambda$, so $\\sin\\theta = \\dfrac{' + (m === 1 ? '' : m) + '(' + nx(lam, 3) + ')}{2(' + nx(d, 3) + ')} = ' + nx(m * lam / (2 * d)) + '$.', '$\\theta = ' + deg(th) + '$.'], hint: 'Use $2d\\sin\\theta = m\\lambda$ with the angle from the planes.' };
    } else if (kind === 'd') {
      var th2 = R.pick([10.0, 12.5, 15.0, 17.5, 20.0, 22.5, 25.0]), m2 = R.pick([1, 2]), d2 = m2 * lam / (2 * sind(th2));
      rec('modern.bragg-diffraction', { kind: kind, lam: lam, th: th2, m: m2 });
      p = { q: 'X-rays of wavelength $' + qu(lam, 'nm', 3) + '$ give a ' + (m2 === 1 ? 'first' : 'second') + '-order Bragg reflection at a glancing angle of $' + nx(th2, 3) + '^\\circ$. What is the spacing of the planes?', a: num(d2), unit: 'nm',
        steps: ['$d = \\dfrac{m\\lambda}{2\\sin\\theta} = \\dfrac{' + m2 + '(' + nx(lam, 3) + ')}{2\\sin ' + nx(th2, 3) + '^\\circ}$.', '$d = ' + qu(d2, 'nm') + '$.'], hint: 'Solve Bragg\'s law for $d$.' };
    } else if (kind === 'lam') {
      var th3 = R.pick([12.0, 14.0, 16.0, 18.0, 20.0, 24.0]), l3 = 2 * d * sind(th3);
      rec('modern.bragg-diffraction', { kind: kind, d: d, th: th3 });
      p = { q: 'Planes $' + qu(d, 'nm', 3) + '$ apart give a first-order Bragg reflection at a glancing angle of $' + nx(th3, 3) + '^\\circ$. What is the X-ray wavelength?', a: num(l3), unit: 'nm',
        steps: ['$\\lambda = 2d\\sin\\theta$ for $m = 1$.', '$\\lambda = 2(' + nx(d, 3) + ')\\sin ' + nx(th3, 3) + '^\\circ = ' + qu(l3, 'nm') + '$.'], hint: 'First order: $\\lambda = 2d\\sin\\theta$.' };
    } else if (kind === 'normal' || kind === 'turned') {
      var thg = R.pick([11.0, 13.0, 15.0, 18.0, 21.0, 24.0]), dd = lam / (2 * sind(thg));
      rec('modern.bragg-diffraction', { kind: kind, lam: lam, th: thg });
      var given = kind === 'normal' ? 'makes an angle of $' + nx(90 - thg, 3) + '^\\circ$ with the normal to the crystal planes' : 'is turned through a total angle of $' + nx(2 * thg, 3) + '^\\circ$ by the crystal';
      p = { q: 'A beam of $' + qu(lam, 'nm', 3) + '$ X-rays ' + given + ' when it gives a first-order Bragg reflection. What is the spacing of the planes?', a: num(dd), unit: 'nm',
        steps: [kind === 'normal' ? 'Bragg\'s law uses the glancing angle from the planes: $\\theta = 90^\\circ - ' + nx(90 - thg, 3) + '^\\circ = ' + deg(thg) + '$.' : 'The beam turns through $2\\theta$, so the glancing angle is $\\theta = ' + nx(2 * thg, 3) + '^\\circ/2 = ' + deg(thg) + '$.', '$d = \\dfrac{\\lambda}{2\\sin\\theta} = \\dfrac{' + nx(lam, 3) + '}{2\\sin ' + nx(thg, 3) + '^\\circ} = ' + qu(dd, 'nm') + '$.'],
        hint: 'Convert to the glancing angle (from the planes) before using $2d\\sin\\theta = m\\lambda$.' };
    } else {
      var tries = 0; while (M.abs(2 * d / lam - M.round(2 * d / lam)) < 0.08 && tries < 20) { d = R.pick([0.282, 0.201, 0.314, 0.246, 0.360, 0.400]); lam = R.pick([0.154, 0.071, 0.179, 0.100, 0.120]); tries++; }
      var mm = M.floor(2 * d / lam);
      rec('modern.bragg-diffraction', { kind: kind, lam: lam, d: d });
      p = { q: 'X-rays of wavelength $' + qu(lam, 'nm', 3) + '$ fall on planes $' + qu(d, 'nm', 3) + '$ apart. What is the highest order of Bragg reflection that can occur?', a: exact(mm),
        steps: ['$\\sin\\theta = \\dfrac{m\\lambda}{2d}$ cannot exceed 1, so $m \\le \\dfrac{2d}{\\lambda} = \\dfrac{' + nx(2 * d, 3) + '}{' + nx(lam, 3) + '} = ' + nx(2 * d / lam) + '$.', 'The largest whole number: $m = ' + mm + '$.'], hint: 'The sine of an angle can be at most 1.' };
    }
    return p;
  });

  // ---- u3
  // ===================================================================== Unit 3: Images and Optical Instruments
  function rTex(R) { return R === Infinity ? '\\infty' : (R > 0 ? '+' : '') + nx(R, 2) + '\\ \\text{cm}'; }
  function invR(R) { return R === Infinity ? 0 : 1 / R; }

  G('modern.lensmaker', function (R, ctx) {
    var kind = R.pick(by(ctx, ['biconvex', 'biconvex'], ['shape', 'biconvex', 'shape'], ['symR', 'water', 'nFrom']));
    var n = R.pick([1.50, 1.52, 1.60, 1.65, 1.45]), p;
    if (kind === 'biconvex' || kind === 'shape') {
      var a = R.pick([10, 12, 15, 20, 25, 30, 40]), b = R.pick([10, 15, 20, 25, 30, 40, 60]), shape = kind === 'biconvex' ? 'biconvex' : R.pick(['biconcave', 'plano-convex', 'plano-concave', 'meniscus']);
      var R1, R2, words;
      if (shape === 'biconvex') { R1 = a; R2 = -b; words = 'bulges outward on both sides, with radii ' + a + ' cm (the side facing the light) and ' + b + ' cm (the other side)'; }
      else if (shape === 'biconcave') { R1 = -a; R2 = b; words = 'is hollowed inward on both sides, with radii ' + a + ' cm (the side facing the light) and ' + b + ' cm (the other side)'; }
      else if (shape === 'plano-convex') { var flatFirst = R.coin(); R1 = flatFirst ? Infinity : a; R2 = flatFirst ? -a : Infinity; words = 'is flat on ' + (flatFirst ? 'the side facing the light' : 'the far side') + ' and bulges outward on the other side, with radius ' + a + ' cm'; }
      else if (shape === 'plano-concave') { var ff = R.coin(); R1 = ff ? Infinity : -a; R2 = ff ? a : Infinity; words = 'is flat on ' + (ff ? 'the side facing the light' : 'the far side') + ' and hollowed inward on the other side, with radius ' + a + ' cm'; }
      else { var r1 = M.min(a, b), r2 = M.max(a, b); if (r1 === r2) r2 = r1 + 10; R1 = r1; R2 = r2; words = 'is a meniscus: both surfaces curve the same way, with their centers of curvature beyond the lens (on the outgoing side); the side facing the light has radius ' + r1 + ' cm and the other side ' + r2 + ' cm'; }
      var f = 1 / ((n - 1) * (invR(R1) - invR(R2)));
      rec('modern.lensmaker', { kind: kind, n: n, R1: R1, R2: R2 });
      p = { q: 'A thin glass lens ($n = ' + nx(n, 3) + '$) ' + words + '. Find its focal length, with its sign.', a: num(f), unit: 'cm',
        steps: ['Signs: $R > 0$ when the center of curvature is on the outgoing side. Here $R_1 = ' + rTex(R1) + '$ and $R_2 = ' + rTex(R2) + '$.',
          '$\\dfrac{1}{f} = (n - 1)\\left(\\dfrac{1}{R_1} - \\dfrac{1}{R_2}\\right) = (' + nx(n - 1, 2) + ')\\left(' + nx(invR(R1), 3) + ' - (' + nx(invR(R2), 3) + ')\\right)\\ \\text{cm}^{-1}$.',
          '$\\dfrac{1}{f} = ' + nx(1 / f, 3) + '\\ \\text{cm}^{-1}$, so $f = ' + qu(f, 'cm') + '$ (' + (f > 0 ? 'converging' : 'diverging') + ').'],
        hint: 'Decide the sign of each radius from where its center of curvature lies; a flat side has $1/R = 0$.' };
    } else if (kind === 'symR') {
      var ft = R.pick([10, 12, 15, 20, 25, 30, 40, 50]), Rs = 2 * (n - 1) * ft;
      rec('modern.lensmaker', { kind: kind, n: n, f: ft });
      p = { q: 'A lens maker wants a symmetric double-convex lens (both surfaces with the same radius) with $f = ' + qu(ft, 'cm', 2) + '$, from glass with $n = ' + nx(n, 3) + '$. What radius should each surface have?', a: num(Rs), unit: 'cm',
        steps: ['Symmetric and double-convex: $R_1 = +R$ and $R_2 = -R$.', '$\\dfrac{1}{f} = (n - 1)\\left(\\dfrac{1}{R} + \\dfrac{1}{R}\\right) = \\dfrac{2(n - 1)}{R}$.', '$R = 2(n - 1)f = 2(' + nx(n - 1, 2) + ')(' + nx(ft, 2) + ') = ' + qu(Rs, 'cm') + '$.'],
        hint: 'With equal radii of opposite sign, the bracket becomes $2/R$.' };
    } else if (kind === 'water') {
      var fa = R.pick([10, 15, 20, 24, 30]), med = R.pick([['water', 1.33], ['oil', 1.47], ['alcohol', 1.36]]), fw = fa * (n - 1) / (n / med[1] - 1);
      rec('modern.lensmaker', { kind: kind, n: n, fa: fa, nm: med[1] });
      p = { q: 'A glass lens ($n = ' + nx(n, 3) + '$) has $f = ' + qu(fa, 'cm', 2) + '$ in air. What is its focal length when it is immersed in ' + med[0] + ' ($n = ' + nx(med[1], 3) + '$)?', a: num(fw), unit: 'cm',
        steps: ['In a medium, $n - 1$ becomes $\\dfrac{n}{n_m} - 1$; the radii stay the same.', 'In air: $n - 1 = ' + nx(n - 1, 2) + '$. In ' + med[0] + ': $\\dfrac{' + nx(n, 3) + '}{' + nx(med[1], 3) + '} - 1 = ' + nx(n / med[1] - 1) + '$.', '$f$ scales by the inverse ratio: $f = ' + nx(fa, 2) + ' \\times \\dfrac{' + nx(n - 1, 2) + '}{' + nx(n / med[1] - 1) + '} = ' + qu(fw, 'cm') + '$.'],
        hint: 'Only the relative index $n/n_m$ matters for how much each surface bends the light.' };
    } else {
      var R1b = R.pick([15, 20, 25, 30]), R2b = -R.pick([15, 20, 30, 40]), nb = R.pick([1.48, 1.52, 1.55, 1.60, 1.66, 1.70]), fb = rnd(1 / ((nb - 1) * (1 / R1b - 1 / R2b)), 3), nAns = 1 + 1 / (fb * (1 / R1b - 1 / R2b));
      rec('modern.lensmaker', { kind: kind, R1: R1b, R2: R2b, f: fb });
      p = { q: 'A double-convex lens with $R_1 = ' + rTex(R1b) + '$ and $R_2 = ' + rTex(R2b) + '$ has a measured focal length of $' + qu(fb, 'cm', 3) + '$ in air. What is the index of refraction of its glass?', a: num(nAns, 0.005), unit: '',
        steps: ['$\\dfrac{1}{R_1} - \\dfrac{1}{R_2} = \\dfrac{1}{' + R1b + '} + \\dfrac{1}{' + (-R2b) + '} = ' + nx(1 / R1b - 1 / R2b, 3) + '\\ \\text{cm}^{-1}$.', '$n - 1 = \\dfrac{1/f}{1/R_1 - 1/R_2} = \\dfrac{' + nx(1 / fb, 3) + '}{' + nx(1 / R1b - 1 / R2b, 3) + '} = ' + nx(nAns - 1) + '$.', '$n = ' + nx(nAns, 4) + '$.'],
        hint: 'Solve the lensmaker\'s equation for $n - 1$.' };
    }
    return p;
  });

  G('modern.two-lens-systems', function (R, ctx) {
    var L = lv(ctx), tries = 0, f1, f2, s, d1, di1, do2, di2, m1, m2;
    do {
      f1 = R.pick([5, 8, 10, 12, 15, 20]); f2 = L === 3 ? R.pick([-20, -15, -10, 10, 15, 20, 25]) : R.pick([5, 8, 10, 12, 15, 20, 25]);
      d1 = R.pick([1.5, 2, 3, 4]) * f1; di1 = 1 / (1 / f1 - 1 / d1);
      s = L === 3 ? R.pick([0.4, 0.5, 0.6, 0.75, 1.5, 2, 2.5]) * di1 : R.pick([1.3, 1.5, 2, 2.5]) * di1 + R.pick([0, 5, 10]);
      s = M.round(s); do2 = s - di1; di2 = 1 / (1 / f2 - 1 / do2); m1 = -di1 / d1; m2 = -di2 / do2; tries++;
    } while ((M.abs(do2) < 2 || M.abs(do2 - f2) < 3 || M.abs(di2) > 150 || M.abs(di2) < 2 || (L === 3 && do2 > 0 && f2 > 0)) && tries < 200);
    var Mt = m1 * m2;
    rec('modern.two-lens-systems', { kind: L === 1 ? 'di' : 'both', f1: f1, f2: f2, s: s, d1: d1 });
    var q = 'Lens 1 ($f_1 = ' + qu(f1, 'cm', 2) + '$) and lens 2 ($f_2 = ' + (f2 > 0 ? '' : '') + qu(f2, 'cm', 2) + '$) are $' + qu(s, 'cm', 3) + '$ apart. An object stands $' + qu(d1, 'cm', 3) + '$ in front of lens 1. ';
    var steps = ['Lens 1: $\\dfrac{1}{d_{i1}} = \\dfrac{1}{' + f1 + '} - \\dfrac{1}{' + nx(d1, 3) + '}$, so $d_{i1} = ' + qu(di1, 'cm') + '$ and $m_1 = -\\dfrac{d_{i1}}{d_{o1}} = ' + nx(m1) + '$.',
      'The first image is the object for lens 2: $d_{o2} = s - d_{i1} = ' + nx(s, 3) + ' - ' + nx(di1) + ' = ' + qu(do2, 'cm') + '$' + (do2 < 0 ? ' (negative: a virtual object, since lens 2 catches the light before it focuses).' : '.'),
      'Lens 2: $\\dfrac{1}{d_{i2}} = \\dfrac{1}{' + nx(f2, 2) + '} - \\dfrac{1}{' + nx(do2) + '}$, so $d_{i2} = ' + qu(di2, 'cm') + '$ (' + (di2 > 0 ? 'real, beyond lens 2' : 'virtual, on the incoming side of lens 2') + ').',
      '$m_2 = -\\dfrac{d_{i2}}{d_{o2}} = ' + nx(m2) + '$, so $M = m_1m_2 = ' + nx(Mt) + '$ (' + (Mt > 0 ? 'upright' : 'inverted') + ').'];
    var p;
    if (L === 1) p = { q: q + 'Where is the final image? Give $d_{i2}$, measured from lens 2 (positive for a real image beyond lens 2).', a: num(di2), unit: 'cm', steps: steps, hint: 'Find the image of lens 1, then measure its distance from lens 2.' };
    else p = { q: q + 'Find the final image distance $d_{i2}$ from lens 2 (positive beyond lens 2) and the overall magnification $M$.',
      a: multi([{ label: '$d_{i2}$ (cm) $=$', a: num(di2), unit: 'cm' }, { label: '$M =$', a: num(Mt) }]), steps: steps, hint: 'Lens 2 sees the first image as its object, measured from lens 2; the magnifications multiply.' };
    return p;
  });

  G('modern.eye-and-glasses', function (R, ctx) {
    var kind = R.pick(by(ctx, ['myopia', 'hyperopia'], ['myopiaG', 'farFrom', 'hyperopia'], ['hyperopiaG', 'myopiaG', 'type']));
    var p;
    if (kind === 'myopia' || kind === 'myopiaG') {
      var FP = R.pick([0.25, 0.30, 0.40, 0.50, 0.60, 0.75, 0.80, 1.0, 1.2, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]), dg = kind === 'myopia' ? 0 : R.pick([0.010, 0.012, 0.015, 0.018, 0.020, 0.025]), P = -1 / (FP - dg);
      rec('modern.eye-and-glasses', { kind: kind, FP: FP, d: dg });
      p = { q: 'A nearsighted person\'s far point is $' + qu(FP * 100, 'cm', 3) + '$ from the eye. What power of ' + (dg ? 'glasses worn $' + qu(dg * 100, 'cm', 2) + '$ in front of the eye' : 'contact lens') + ' lets them see distant objects clearly?', a: num(P), unit: 'D',
        steps: ['The lens must make a virtual image of a distant object at the far point.', dg ? 'Measured from the glasses, the far point is $' + nx(FP, 3) + ' - ' + nx(dg, 2) + ' = ' + qu(FP - dg, 'm') + '$ away.' : 'A contact lens sits on the eye, so the far point is $' + qu(FP, 'm') + '$ from the lens.', '$\\dfrac{1}{f} = \\dfrac{1}{\\infty} + \\dfrac{1}{-' + nx(FP - dg) + '\\ \\text{m}}$, so $P = ' + qu(P, 'D') + '$ (diverging).'],
        hint: 'The image of a faraway object must land at the far point, on the same side as the object.' };
    } else if (kind === 'hyperopia' || kind === 'hyperopiaG') {
      var NP = R.pick([0.40, 0.50, 0.60, 0.75, 0.80, 1.0, 1.2, 1.25, 1.5, 2.0, 3.0]), dh = kind === 'hyperopia' ? 0 : R.pick([0.010, 0.015, 0.018, 0.020]), Ph = 1 / (0.25 - dh) - 1 / (NP - dh);
      rec('modern.eye-and-glasses', { kind: kind, NP: NP, d: dh });
      p = { q: 'A farsighted person\'s near point is $' + qu(NP * 100, 'cm', 3) + '$ from the eye. What power of ' + (dh ? 'reading glasses worn $' + qu(dh * 100, 'cm', 2) + '$ in front of the eye' : 'contact lens') + ' lets them read a page held 25 cm from the eye?', a: num(Ph), unit: 'D',
        steps: ['The lens must make a virtual image of the page at the near point.', dh ? 'From the glasses: page at $d_o = 0.25 - ' + nx(dh, 2) + ' = ' + qu(0.25 - dh, 'm') + '$, image at $d_i = -(' + nx(NP, 3) + ' - ' + nx(dh, 2) + ') = ' + qu(-(NP - dh), 'm') + '$.' : 'Page at $d_o = 0.25$ m; image at $d_i = -' + qu(NP, 'm') + '$.', '$P = \\dfrac{1}{d_o} + \\dfrac{1}{d_i} = ' + nx(1 / (0.25 - dh)) + ' - ' + nx(1 / (NP - dh)) + ' = ' + qu(Ph, 'D') + '$ (converging).'],
        hint: 'Image the page (at 25 cm) at the near point, on the same side as the page.' };
    } else if (kind === 'farFrom') {
      var Pf = -R.pick([0.25, 0.50, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0, 3.5, 4.0, 5.0]), fp = -1 / Pf;
      rec('modern.eye-and-glasses', { kind: kind, P: Pf });
      p = { q: 'A contact lens prescription reads $' + qu(Pf, 'D', 3) + '$. How far from the eye, in centimeters, is the person\'s far point without lenses?', a: num(fp * 100), unit: 'cm',
        steps: ['$f = 1/P = 1/(' + nx(Pf, 3) + ') = ' + qu(1 / Pf, 'm') + '$.', 'This diverging lens images distant objects at its focal point, which must be the far point: $' + qu(fp, 'm') + ' = ' + qu(fp * 100, 'cm') + '$.'],
        hint: 'For a nearsighted eye, the lens\'s focal length equals minus the far point distance.' };
    } else {
      var which = R.pick(['near', 'far']), dist = which === 'near' ? R.pick([50, 60, 75, 80, 100, 120, 150]) : R.pick([40, 50, 60, 80, 100, 150, 200, 300]);
      rec('modern.eye-and-glasses', { kind: kind, which: which });
      var right = which === 'far' ? 'A diverging lens with negative power' : 'A converging lens with positive power';
      var wrong = which === 'far' ? ['A converging lens with positive power', 'A converging lens, because the person cannot see far away', 'No lens can help'] : ['A diverging lens with negative power', 'A diverging lens, because the person cannot see up close', 'No lens can help'];
      p = { q: 'A person ' + (which === 'far' ? 'sees clearly only out to ' + dist + ' cm (their far point)' : 'cannot focus on anything closer than ' + dist + ' cm (their near point)') + '. What kind of lens corrects their vision?', a: mc(right, wrong),
        steps: [which === 'far' ? 'Distant objects focus in front of the retina: the eye bends light too much. (Nearsighted.)' : 'Near objects focus behind the retina: the eye bends light too little. (Farsighted.)', which === 'far' ? 'A diverging lens makes a virtual image of a far object close by, at the far point, where the eye can focus.' : 'A converging lens makes a virtual image of a near object farther away, at the near point, where the eye can focus.'],
        hint: 'Where must the lens put the image so the eye can focus on it?' };
    }
    return p;
  });

  G('modern.microscopes', function (R, ctx) {
    var kind = R.pick(by(ctx, ['mag', 'product'], ['tube', 'magNear', 'product'], ['lens', 'tube', 'feFor']));
    var p;
    if (kind === 'mag' || kind === 'magNear') {
      var f = R.pick([2.0, 2.5, 4.0, 5.0, 6.0, 8.0, 10, 12.5]), Mg = kind === 'mag' ? 25 / f : 1 + 25 / f;
      rec('modern.microscopes', { kind: kind, f: f });
      p = { q: 'A magnifying glass has a focal length of $' + qu(f, 'cm', 2) + '$. What is its angular magnification ' + (kind === 'mag' ? 'when the object is at its focal point (relaxed eye)' : 'when the image is at the near point, 25 cm from the eye') + '?', a: num(Mg, 0.01), unit: '×',
        steps: kind === 'mag' ? ['Without the lens, the object at 25 cm covers $\\theta_0 = h/25$; at the focal point, through the lens, it covers $\\theta = h/f$.', '$M = \\dfrac{25\\ \\text{cm}}{f} = \\dfrac{25}{' + nx(f, 2) + '} = ' + nx(Mg) + '$.'] : ['With the image at the near point, $M = 1 + \\dfrac{25\\ \\text{cm}}{f}$.', '$M = 1 + \\dfrac{25}{' + nx(f, 2) + '} = ' + nx(Mg) + '$.'],
        hint: 'Compare the angle through the lens with the angle at 25 cm without it.' };
    } else if (kind === 'product') {
      var mo = R.pick([4, 10, 20, 40, 60, 100]), me = R.pick([5, 10, 12.5, 15, 20]);
      rec('modern.microscopes', { kind: kind, mo: mo, me: me });
      p = { q: 'A microscope has a $' + mo + '\\times$ objective and a $' + nx(me, 3) + '\\times$ eyepiece. What is its total magnification (as a positive number)?', a: num(mo * me, 0.01), unit: '×',
        steps: ['The eyepiece magnifies the image the objective has already enlarged, so the factors multiply.', '$' + mo + ' \\times ' + nx(me, 3) + ' = ' + nx(mo * me, 4) + '$.'], hint: 'Two enlargements in a row multiply.' };
    } else if (kind === 'tube') {
      var fo = R.pick([0.40, 0.50, 0.80, 1.0, 1.6, 2.0]), fe = R.pick([1.25, 2.0, 2.5, 4.0, 5.0]), Lt = 16, Mt = Lt / fo * 25 / fe;
      rec('modern.microscopes', { kind: kind, fo: fo, fe: fe, L: Lt });
      p = { q: 'A microscope has an objective with $f_{\\text{obj}} = ' + qu(fo, 'cm', 2) + '$, an eyepiece with $f_{\\text{eye}} = ' + qu(fe, 'cm', 3) + '$ and a tube length $L = 16$ cm. What is the size of its total magnification?', a: num(Mt), unit: '×',
        steps: ['Objective: $|m_{\\text{obj}}| = \\dfrac{L}{f_{\\text{obj}}} = \\dfrac{16}{' + nx(fo, 2) + '} = ' + nx(Lt / fo) + '$.', 'Eyepiece: $M_{\\text{eye}} = \\dfrac{25}{' + nx(fe, 3) + '} = ' + nx(25 / fe) + '$.', 'Total: $' + nx(Lt / fo) + ' \\times ' + nx(25 / fe) + ' = ' + nx(Mt) + '$.'],
        hint: 'Multiply the objective\'s $L/f_{\\text{obj}}$ by the eyepiece\'s $25\\ \\text{cm}/f_{\\text{eye}}$.' };
    } else if (kind === 'lens') {
      var fo2 = R.pick([0.40, 0.50, 0.60, 0.80, 1.0]), dO = rnd(fo2 * R.pick([1.02, 1.04, 1.05, 1.08, 1.1]), 3), fe2 = R.pick([2.0, 2.5, 4.0, 5.0]), di = 1 / (1 / fo2 - 1 / dO), mo2 = -di / dO, Mt2 = mo2 * 25 / fe2;
      rec('modern.microscopes', { kind: kind, fo: fo2, dO: dO, fe: fe2 });
      p = { q: 'A microscope\'s objective ($f = ' + qu(fo2, 'cm', 2) + '$) holds a specimen $' + qu(dO, 'cm', 3) + '$ away. The eyepiece has $f = ' + qu(fe2, 'cm', 2) + '$ and is used with a relaxed eye. Find the total magnification, with its sign (negative for an inverted image).', a: num(Mt2, 0.03), unit: '',
        steps: ['Objective: $\\dfrac{1}{d_i} = \\dfrac{1}{' + nx(fo2, 2) + '} - \\dfrac{1}{' + nx(dO, 3) + '}$, so $d_i = ' + qu(di, 'cm') + '$.', '$m_{\\text{obj}} = -\\dfrac{d_i}{d_o} = -\\dfrac{' + nx(di) + '}{' + nx(dO, 3) + '} = ' + nx(mo2) + '$.', 'Eyepiece: $M_{\\text{eye}} = \\dfrac{25}{' + nx(fe2, 2) + '} = ' + nx(25 / fe2) + '$.', '$M = (' + nx(mo2) + ')(' + nx(25 / fe2) + ') = ' + nx(Mt2) + '$.'],
        hint: 'Use the thin lens equation for the objective, then multiply by the eyepiece\'s magnification.' };
    } else {
      var target = R.pick([200, 250, 400, 500, 1000]), mo3 = R.pick([10, 20, 40, 50, 100]), Me = target / mo3, fe3 = 25 / Me;
      if (Me < 2) { mo3 = 20; Me = target / mo3; fe3 = 25 / Me; }
      rec('modern.microscopes', { kind: kind, target: target, mo: mo3 });
      p = { q: 'You want a total magnification of $' + target + '\\times$ from a microscope whose objective magnifies $' + mo3 + '\\times$. What eyepiece focal length do you need (relaxed eye)?', a: num(fe3), unit: 'cm',
        steps: ['The eyepiece must supply $M_{\\text{eye}} = \\dfrac{' + target + '}{' + mo3 + '} = ' + nx(Me) + '$.', '$M_{\\text{eye}} = \\dfrac{25\\ \\text{cm}}{f}$, so $f = \\dfrac{25}{' + nx(Me) + '} = ' + qu(fe3, 'cm') + '$.'],
        hint: 'Divide the total by the objective\'s share to get the eyepiece\'s share.' };
    }
    return p;
  });

  G('modern.telescope-optics', function (R, ctx) {
    var kind = R.pick(by(ctx, ['mag', 'length'], ['fe', 'light', 'mag'], ['crater', 'light', 'angle']));
    var fo = R.pick([50, 60, 80, 90, 100, 120, 150, 200]), fe = R.pick([1.0, 1.25, 1.5, 2.0, 2.5, 4.0, 5.0]), p;
    if (kind === 'mag') {
      rec('modern.telescope-optics', { kind: kind, fo: fo, fe: fe });
      p = { q: 'A refracting telescope has an objective with $f_o = ' + qu(fo, 'cm', 3) + '$ and an eyepiece with $f_e = ' + qu(fe, 'cm', 3) + '$. What is the size of its angular magnification?', a: num(fo / fe, 0.01), unit: '×',
        steps: ['$|M| = \\dfrac{f_o}{f_e} = \\dfrac{' + nx(fo, 3) + '}{' + nx(fe, 3) + '} = ' + nx(fo / fe) + '$.', 'With the sign, $M = -' + nx(fo / fe) + '$: the image is inverted.'], hint: 'Angles are multiplied by $f_o/f_e$.' };
    } else if (kind === 'length') {
      rec('modern.telescope-optics', { kind: kind, fo: fo, fe: fe });
      p = { q: 'A refracting telescope uses an objective with $f_o = ' + qu(fo, 'cm', 3) + '$ and an eyepiece with $f_e = ' + qu(fe, 'cm', 3) + '$, set for a relaxed eye. How far apart are the two lenses?', a: num(fo + fe, 0.01), unit: 'cm',
        steps: ['The objective\'s image of a distant star forms in its focal plane, $f_o$ behind it.', 'For parallel rays to leave the eyepiece, that image must be at the eyepiece\'s focal point: separation $= f_o + f_e = ' + qu(fo + fe, 'cm', 4) + '$.'], hint: 'The two lenses share a focal point.' };
    } else if (kind === 'fe') {
      var Mw = R.pick([25, 30, 40, 50, 60, 75, 100]);
      rec('modern.telescope-optics', { kind: kind, fo: fo, M: Mw });
      p = { q: 'A telescope objective has $f_o = ' + qu(fo, 'cm', 3) + '$. What eyepiece focal length gives an angular magnification of $' + Mw + '\\times$?', a: num(fo / Mw), unit: 'cm',
        steps: ['$|M| = f_o/f_e$, so $f_e = \\dfrac{f_o}{|M|} = \\dfrac{' + nx(fo, 3) + '}{' + Mw + '} = ' + qu(fo / Mw, 'cm') + '$.'], hint: 'Solve $|M| = f_o/f_e$ for $f_e$.' };
    } else if (kind === 'light') {
      var D1 = R.pick([[5.0, 'cm'], [10, 'cm'], [15, 'cm'], [20, 'cm'], [25, 'cm'], [40, 'cm'], [2.4, 'm'], [8.2, 'm']]), D2 = R.pick([[7.0, 'mm', 'a dark-adapted eye'], [5.0, 'cm', 'a pair of binoculars'], [10, 'cm', 'a small telescope']]);
      var a1 = D1[0] * (D1[1] === 'm' ? 1000 : 10), a2 = D2[0] * (D2[1] === 'cm' ? 10 : 1);
      if (a1 <= a2) { D1 = [20, 'cm']; a1 = 200; }
      var ratio = M.pow(a1 / a2, 2);
      rec('modern.telescope-optics', { kind: kind, a1: a1, a2: a2 });
      p = { q: 'How many times as much light does a telescope with a $' + qu(D1[0], D1[1], 2) + '$ aperture collect as ' + D2[2] + ' with a $' + qu(D2[0], D2[1], 2) + '$ opening?', a: num(ratio), unit: '×',
        steps: ['Collected light is proportional to the aperture\'s area, so to $D^2$.', 'In the same units: $' + qu(a1, 'mm', 3) + '$ and $' + qu(a2, 'mm', 2) + '$.', 'Ratio: $\\left(\\dfrac{' + nx(a1, 3) + '}{' + nx(a2, 2) + '}\\right)^2 = ' + nx(ratio) + '$.'],
        hint: 'Area goes as the diameter squared; magnification does not matter here.' };
    } else if (kind === 'angle') {
      var obj = R.pick([['the Moon', 0.52], ['the Sun', 0.53], ['Jupiter at its closest', 0.0139], ['Mars at a close approach', 0.0069], ['Saturn with its rings', 0.0125]]);
      var Mm = fo / fe;
      rec('modern.telescope-optics', { kind: kind, fo: fo, fe: fe, th: obj[1] });
      p = { q: obj[0].charAt(0).toUpperCase() + obj[0].slice(1) + ' covers about $' + nx(obj[1], 2) + '^\\circ$ of sky. Through a telescope with $f_o = ' + qu(fo, 'cm', 3) + '$ and $f_e = ' + qu(fe, 'cm', 3) + '$, about how large an angle does it appear to cover, in degrees?', a: num(obj[1] * Mm, 0.02), unit: '°',
        steps: ['The telescope multiplies small angles by $f_o/f_e = ' + nx(Mm) + '$.', 'Apparent angle: $' + nx(obj[1], 2) + '^\\circ \\times ' + nx(Mm) + ' = ' + deg(obj[1] * Mm) + '$.'], hint: 'Angular magnification multiplies angles.' };
    } else {
      var D = R.pick([0.10, 0.15, 0.20, 0.30, 0.50, 1.0, 2.4]), lam = 550, dist = 3.84e8, sMin = 1.22 * lam * 1e-9 / D * dist;
      rec('modern.telescope-optics', { kind: kind, D: D });
      p = { q: 'A telescope with a $' + qu(D * 100, 'cm', 3) + '$ aperture views the Moon ($3.84 \\times 10^8$ m away) in $550$ nm light. If diffraction is the only limit, what is the smallest crater it can make out, in kilometers? (Magnification does not change the answer.)', a: num(sMin / 1000), unit: 'km',
        steps: ['$\\theta_R = 1.22\\dfrac{\\lambda}{D} = 1.22\\,\\dfrac{550 \\times 10^{-9}}{' + nx(D, 2) + '} = ' + qu(1.22 * lam * 1e-9 / D, 'rad') + '$.', 'Size: $L\\theta_R = (3.84 \\times 10^8)(' + nx(1.22 * lam * 1e-9 / D) + ') = ' + qu(sMin, 'm') + ' = ' + qu(sMin / 1000, 'km') + '$.'],
        hint: 'Resolution depends on the aperture, not on the eyepiece.' };
    }
    return p;
  });

  // ---- u4
  // ===================================================================== Unit 4: Special Relativity
  var BETAS = [0.60, 0.80, 0.28, 0.96, 0.50, 0.90, 0.95, 0.98, 0.99, 0.995, 0.75, 0.30];
  function gT(b) { return '\\gamma = \\dfrac{1}{\\sqrt{1 - ' + nx(b, 3) + '^2}} = ' + nx(gam(b), 4); }
  function bT(b) { return nx(b, b >= 0.99 ? 3 : 2); }

  G('modern.relativity-postulates', function (R, ctx) {
    var kind = R.pick(by(ctx, ['cabin', 'lightSpeed'], ['galileo', 'cabin', 'which'], ['which', 'galileo', 'which']));
    var b = R.pick([0.25, 0.40, 0.50, 0.60, 0.75, 0.80, 0.90]), p;
    if (kind === 'cabin') {
      var L = R.pick([15, 24, 30, 45, 60, 90, 120, 150]), what = R.pick(['crew', 'crew', 'lab']);
      rec('modern.relativity-postulates', { kind: kind, L: L, b: b });
      p = { q: 'A spaceship moves past Earth at $' + bT(b) + 'c$. ' + (what === 'crew' ? 'Inside, a light pulse crosses the $' + L + '$ m cabin from the back wall to the front wall. How long does the crossing take according to the crew?' : 'A physics lab is set up inside it. The crew time a laser pulse over a $' + L + '$ m path in the lab. What time do they measure?'), a: num(L / C * 1e9), unit: 'ns',
        steps: ['In the crew\'s frame the ship is at rest; by postulate 1 their physics is the same as on Earth.', 'By postulate 2 the pulse moves at $c$ in their frame: $t = \\dfrac{' + L + '\\ \\text{m}}{3.00 \\times 10^8\\ \\text{m/s}} = ' + qu(L / C, 's') + ' = ' + qu(L / C * 1e9, 'ns') + '$.', 'The ship\'s speed relative to Earth plays no part.'],
        hint: 'In their own frame, the crew is at rest.' };
    } else if (kind === 'lightSpeed') {
      var sc = R.pick(['A spaceship moving at $' + bT(b) + 'c$ toward Earth fires a laser at Earth.', 'A probe moving away from Earth at $' + bT(b) + 'c$ sends a radio signal back toward Earth.', 'A star moves toward us at $' + bT(b) + 'c$ (an extreme case) and emits light toward us.', 'An observer flies at $' + bT(b) + 'c$ straight toward a lamp at rest and times its light.']);
      rec('modern.relativity-postulates', { kind: kind });
      p = { q: sc + ' At what speed does the light approach, as measured by ' + (/observer flies/.test(sc) ? 'the moving observer' : 'observers on Earth') + '? (In m/s.)', a: num(C, 0.01), unit: 'm/s',
        steps: ['Postulate 2: light in vacuum moves at $c$ in every inertial frame, whatever the motion of the source or the observer.', 'So the measured speed is $c = 3.00 \\times 10^8$ m/s, not $c \\pm v$.'],
        hint: 'Which postulate is about the speed of light?' };
    } else if (kind === 'galileo') {
      var tow = R.coin();
      rec('modern.relativity-postulates', { kind: kind, b: b, tow: tow });
      p = { q: 'A source moving ' + (tow ? 'toward' : 'away from') + ' an observer at $' + bT(b) + 'c$ emits light toward the observer. What speed, as a multiple of $c$, would Galileo\'s rule of adding velocities predict the observer measures? (Experiments find exactly $c$, which is why the rule must change.)', a: num(tow ? 1 + b : 1 - b, 0.01), unit: 'c',
        steps: ['Galileo: velocities add, $u = u\' + v$.', 'Light leaves the source at $c$; the source moves ' + (tow ? 'toward' : 'away from') + ' the observer at $' + bT(b) + 'c$.', 'Prediction: $c ' + (tow ? '+' : '-') + ' ' + bT(b) + 'c = ' + nx(tow ? 1 + b : 1 - b, 3) + 'c$. Measured: $c$. Postulate 2 replaces the rule.'],
        hint: 'Add the source\'s velocity to the light\'s, the everyday way.' };
    } else {
      var Q = R.pick([
        ['A windowless lab moves in a straight line at a steady $' + bT(b) + 'c$ relative to Earth. Which statement is true?', 'No experiment inside the lab, mechanical or optical, can reveal its speed', ['Timing light along and across the motion would reveal the lab\'s speed', 'Light inside the lab moves at $c$ only in the direction of motion', 'Balls dropped in the lab fall at a slant because of the motion']],
        ['Which observation was a key clue that light does not need a medium (an ether) with a frame of its own?', 'Michelson and Morley found no change in the fringes as their interferometer turned', ['Light bends when it enters glass', 'Light from the Sun takes about 8 minutes to reach Earth', 'Red light has a longer wavelength than blue light']],
        ['Two observers move at $' + bT(b) + 'c$ relative to each other, and both time the same flash of light. What do they find?', 'Both measure the flash moving at $c$', ['The observer moving toward the flash measures more than $c$', 'They measure speeds that differ by $' + bT(b) + 'c$', 'Only the observer at rest relative to the source measures $c$']],
        ['Which statement is the first postulate of special relativity?', 'The laws of physics are the same in every inertial frame', ['Every frame, accelerating or not, is equally good for the laws of physics', 'All motion is relative, so no quantity is the same for all observers', 'The speed of light depends on the motion of its source']]]);
      rec('modern.relativity-postulates', { kind: kind, right: Q[1] });
      p = { q: Q[0], a: mc(Q[1], Q[2]), steps: ['Postulate 1: the laws of physics are the same in every inertial frame. Postulate 2: light in vacuum moves at $c$ in every inertial frame.', 'The correct choice: ' + Q[1].charAt(0).toLowerCase() + Q[1].slice(1) + '.'], hint: 'Test each choice against the two postulates.' };
    }
    return p;
  });

  G('modern.simultaneity', function (R, ctx) {
    var kind = R.pick(by(ctx, ['first', 'dt'], ['dt', 'first', 'dtkm'], ['speedFor', 'causal', 'lag']));
    var b = R.pick([0.50, 0.60, 0.80, 0.28, 0.96, 0.90]), g = gam(b), p;
    if (kind === 'first') {
      var ends = R.pick([['east', 'west'], ['north', 'south'], ['front', 'back']]), towardFirst = R.coin();
      var setup = R.pick(['platform', 'ship']);
      var head = towardFirst ? ends[0] : ends[1], other = towardFirst ? ends[1] : ends[0];
      rec('modern.simultaneity', { kind: kind, head: head });
      var q = setup === 'platform' ? 'Two lights flash at the ' + ends[0] + ' and ' + ends[1] + ' ends of a long platform at the same moment, according to clocks on the platform. A train speeds along the platform toward the ' + head + ' end. According to clocks on the train, which flash happened first?' :
        'Two beacons at the ' + ends[0] + ' and ' + ends[1] + ' ends of a space station blink at the same moment, according to the station\'s clocks. A ship flies past along the station, heading toward its ' + head + ' end. According to the ship\'s clocks, which beacon blinked first?';
      p = { q: q, a: { t: 'mc', choices: ['The ' + head + ' one', 'The ' + other + ' one', 'Both at the same time, for the moving observer too'], v: 0 },
        steps: ['Take $+x$ toward the ' + head + ' end. For events simultaneous in the ' + (setup === 'platform' ? 'platform' : 'station') + ' frame, the Lorentz transformation gives $t\' = -\\gamma\\dfrac{vx}{c^2}$ (plus a constant) in a frame moving at $+v$.', 'So the event with the larger $x$, the ' + head + ' one, has the smaller $t\'$.', 'By the moving clocks, the ' + head + ' event happened first; the gap is $\\gamma v\\Delta x/c^2$.'],
        hint: 'In a frame moving toward one of two events, that event happens first.' };
    } else if (kind === 'dt' || kind === 'dtkm') {
      var dx = kind === 'dt' ? R.pick([300, 450, 600, 900, 1200, 1500]) : R.pick([1.0, 2.0, 3.0, 5.0, 10]) * 1000, dtp = g * b * dx / C;
      rec('modern.simultaneity', { kind: kind, b: b, dx: dx });
      p = { q: 'Two events happen at the same time in the lab, $' + (kind === 'dt' ? qu(dx, 'm', 3) : qu(dx / 1000, 'km', 2)) + '$ apart. A ship flies along the line joining them at $' + bT(b) + 'c$. How far apart in time are the two events on the ship\'s clocks, in microseconds?', a: num(dtp * 1e6), unit: 'μs',
        steps: ['$' + gT(b) + '$.', '$\\Delta t\' = \\gamma\\dfrac{v\\Delta x}{c^2} = \\gamma\\,\\dfrac{\\beta\\,\\Delta x}{c} = ' + nx(g, 4) + ' \\times \\dfrac{(' + bT(b) + ')(' + nx(dx, 3) + ')}{3.00 \\times 10^8}$.', '$\\Delta t\' = ' + qu(dtp, 's') + ' = ' + qu(dtp * 1e6, 'μs') + '$; the event ahead of the ship comes first.'],
        hint: 'Use $\\Delta t\' = \\gamma v\\Delta x/c^2$; note that $v/c^2 = \\beta/c$.' };
    } else if (kind === 'speedFor') {
      var dx2 = R.pick([600, 900, 1500, 3000]), dt2 = R.pick([1.0, 2.0, 3.0, 4.0]) * 1e-6, k = C * dt2 / dx2, bb = k / M.sqrt(1 + k * k);
      if (k > 6) { dt2 = 1.0e-6; k = C * dt2 / dx2; bb = k / M.sqrt(1 + k * k); }
      rec('modern.simultaneity', { kind: kind, dx: dx2, dt: dt2 });
      p = { q: 'Two events $' + qu(dx2, 'm', 3) + '$ apart are simultaneous in frame $S$. How fast must a frame move along the line joining them for the events to be $' + qu(dt2 * 1e6, 'μs', 2) + '$ apart in that frame? Give the speed as a fraction of $c$.', a: num(bb, 0.01), unit: 'c',
        steps: ['$\\Delta t\' = \\gamma\\beta\\dfrac{\\Delta x}{c}$, so $\\gamma\\beta = \\dfrac{c\\Delta t\'}{\\Delta x} = \\dfrac{(3.00 \\times 10^8)(' + nx(dt2, 2) + ')}{' + nx(dx2, 3) + '} = ' + nx(k) + '$.', '$\\gamma\\beta = \\dfrac{\\beta}{\\sqrt{1 - \\beta^2}} = k$ gives $\\beta = \\dfrac{k}{\\sqrt{1 + k^2}}$.', '$\\beta = \\dfrac{' + nx(k) + '}{\\sqrt{1 + ' + nx(k) + '^2}} = ' + nx(bb) + '$.'],
        hint: 'Solve $\\gamma\\beta = c\\Delta t\'/\\Delta x$ for $\\beta$; square both sides.' };
    } else if (kind === 'causal') {
      var dx3 = R.pick([300, 600, 900, 1200, 1800]), dt3 = R.pick([1.0, 2.0, 3.0, 4.0, 5.0]) * 1e-6, reach = C * dt3;
      if (M.abs(reach - dx3) < 50) dt3 += 1e-6, reach = C * dt3;
      var canFlip = dx3 > reach;
      rec('modern.simultaneity', { kind: kind, dx: dx3, dt: dt3 });
      p = { q: 'In the lab, event A happens $' + qu(dt3 * 1e6, 'μs', 2) + '$ before event B, and B is $' + qu(dx3, 'm', 3) + '$ from A. Could some observer moving at less than $c$ see B happen before A?',
        a: { t: 'mc', choices: ['Yes: no signal can get from A to B in time, so the order depends on the frame', 'No: B is within light\'s reach of A, so every observer sees A first', 'Yes: any two events can appear in either order to a fast enough observer', 'No: no two events can ever change order'], v: canFlip ? 0 : 1, keep: true },
        steps: ['In $' + qu(dt3 * 1e6, 'μs', 2) + '$, light travels $(3.00 \\times 10^8)(' + nx(dt3, 2) + ') = ' + qu(reach, 'm') + '$.', canFlip ? 'B is farther than that, so no signal links them (a spacelike pair); for a frame with $v/c > c\\Delta t/\\Delta x$, the order reverses.' : 'B is within that distance, so A could cause B; $\\Delta t\' = \\gamma(\\Delta t - v\\Delta x/c^2) > 0$ for every $v < c$.'],
        hint: 'Compare the distance with how far light travels in the time between the events.' };
    } else {
      var L0 = R.pick([150, 300, 450, 600, 900]), lag = L0 * b / C;
      rec('modern.simultaneity', { kind: kind, L0: L0, b: b });
      p = { q: 'A rocket $' + qu(L0, 'm', 3) + '$ long (in its own frame) has clocks at its nose and tail, synchronized in the rocket\'s frame. It flies past Earth nose first at $' + bT(b) + 'c$. At one instant of Earth time, Earth observers read both clocks. How much less does the nose clock read than the tail clock, in nanoseconds?', a: num(lag * 1e9), unit: 'ns',
        steps: ['The two readings are simultaneous in Earth\'s frame, and in Earth\'s frame the clocks are $L_0/\\gamma$ apart.', 'In the rocket\'s frame those two reading events are $\\Delta t\' = \\gamma\\dfrac{v}{c^2}\\cdot\\dfrac{L_0}{\\gamma} = \\dfrac{vL_0}{c^2}$ apart, with the nose event earlier.', 'So the nose clock reads less by $\\dfrac{\\beta L_0}{c} = \\dfrac{(' + bT(b) + ')(' + L0 + ')}{3.00 \\times 10^8} = ' + qu(lag, 's') + ' = ' + qu(lag * 1e9, 'ns') + '$ ("leading clocks lag").'],
        hint: 'Find how far apart in rocket time the two readings are; the factor $\\gamma$ cancels.' };
    }
    return p;
  });

  G('modern.time-dilation', function (R, ctx) {
    var kind = R.pick(by(ctx, ['dilate', 'trip'], ['speed', 'muon', 'trip'], ['small', 'which', 'speed']));
    var b = R.pick(BETAS), g = gam(b), p;
    if (kind === 'dilate') {
      var sc = R.pick([['A particle lives', 'μs', R.pick([2.2, 0.026, 1.5, 0.89])], ['An astronaut naps for', 'h', R.pick([1.0, 2.0, 8.0])], ['A ship\'s clock ticks off', 's', R.pick([10, 60, 100])], ['A machine on a ship runs for', 'min', R.pick([15, 30, 45])]]);
      rec('modern.time-dilation', { kind: kind, b: b, tau: sc[2] });
      p = { q: sc[0] + ' $' + qu(sc[2], sc[1], 2) + '$ by its own clock while moving at $' + bT(b) + 'c$ relative to Earth. How long does this last as measured from Earth?', a: num(g * sc[2]), unit: sc[1],
        steps: ['The proper time $\\Delta\\tau = ' + qu(sc[2], sc[1], 2) + '$ is measured by the moving clock, present at both events.', '$' + gT(b) + '$.', '$\\Delta t = \\gamma\\Delta\\tau = ' + nx(g, 4) + ' \\times ' + nx(sc[2], 2) + ' = ' + qu(g * sc[2], sc[1]) + '$.'],
        hint: 'Earth sees the moving clock run slow: the Earth time is longer.' };
    } else if (kind === 'trip') {
      var D = R.pick([4.2, 5.0, 8.6, 10, 12, 20, 25]), tE = D / b, tS = tE / g;
      rec('modern.time-dilation', { kind: kind, b: b, D: D });
      p = { q: 'A ship travels $' + qu(D, 'ly', 3) + '$ at $' + bT(b) + 'c$ to a star at rest relative to Earth. How long does the trip take according to the ship\'s clock?', a: num(tS), unit: 'yr',
        steps: ['Earth frame: $t = \\dfrac{' + nx(D, 3) + '\\ \\text{ly}}{' + bT(b) + '\\ \\text{ly/yr}} = ' + qu(tE, 'yr') + '$.', 'Departure and arrival both happen at the ship, so its clock reads the proper time.', '$' + gT(b) + '$, so $\\Delta\\tau = \\dfrac{' + nx(tE) + '}{' + nx(g, 4) + '} = ' + qu(tS, 'yr') + '$.'],
        hint: 'Find the Earth-frame time first; the ship\'s clock reads less by the factor $\\gamma$.' };
    } else if (kind === 'speed') {
      var ratio = R.pick([1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 10]), bb = M.sqrt(1 - 1 / (ratio * ratio)), tau = R.pick([1.0, 2.0, 4.0, 6.0]);
      rec('modern.time-dilation', { kind: kind, ratio: ratio });
      p = { q: 'A clock on a fast ship records $' + qu(tau, 'h', 2) + '$, while Earth observers measure the same interval as $' + qu(tau * ratio, 'h', 3) + '$. How fast is the ship moving, as a fraction of $c$?', a: num(bb, 0.005), unit: 'c',
        steps: ['$\\gamma = \\dfrac{\\Delta t}{\\Delta\\tau} = \\dfrac{' + nx(tau * ratio, 3) + '}{' + nx(tau, 2) + '} = ' + nx(ratio, 3) + '$.', '$\\beta = \\sqrt{1 - \\dfrac{1}{\\gamma^2}} = \\sqrt{1 - \\dfrac{1}{' + nx(ratio, 3) + '^2}} = ' + nx(bb, 4) + '$.'],
        hint: 'Find $\\gamma$ from the two times, then solve $\\gamma = 1/\\sqrt{1 - \\beta^2}$ for $\\beta$.' };
    } else if (kind === 'muon') {
      var bm = R.pick([0.98, 0.99, 0.995, 0.999, 0.95]), gm = gam(bm), tau2 = 2.2e-6, dist = bm * C * gm * tau2;
      rec('modern.time-dilation', { kind: kind, b: bm });
      p = { q: 'Muons live on average $2.2$ μs in their own frame. How far does a muon moving at $' + bT(bm) + 'c$ travel in Earth\'s frame during one average lifetime, in kilometers?', a: num(dist / 1000), unit: 'km',
        steps: ['$' + gT(bm) + '$.', 'Earth-frame lifetime: $\\gamma \\times 2.2\\ \\mu\\text{s} = ' + qu(gm * 2.2, 'μs') + '$.', 'Distance: $(' + bT(bm) + ')(3.00 \\times 10^8)(' + nx(gm * tau2) + ') = ' + qu(dist, 'm') + ' = ' + qu(dist / 1000, 'km') + '$.'],
        hint: 'In Earth\'s frame the muon\'s clock runs slow, so it lives longer.' };
    } else if (kind === 'small') {
      var v = R.pick([250, 300, 1000, 3900, 7700, 11000]), hrs = R.pick([1, 10, 24, 100]), dtn = 0.5 * (v / C) * (v / C) * hrs * 3600;
      var who = v < 400 ? 'An airliner flies at' : v < 5000 ? 'A satellite moves at' : 'A spacecraft moves at';
      rec('modern.time-dilation', { kind: kind, v: v, hrs: hrs });
      p = { q: who + ' $' + qu(v, 'm/s', 3) + '$ for $' + hrs + '$ h of Earth time. By special relativity alone, how much less time passes on its clock, in nanoseconds? Use $\\gamma \\approx 1 + \\tfrac{1}{2}\\beta^2$.', a: num(dtn * 1e9), unit: 'ns',
        steps: ['$\\Delta t - \\Delta\\tau = \\Delta t\\left(1 - \\dfrac{1}{\\gamma}\\right) \\approx \\tfrac{1}{2}\\beta^2\\Delta t$.', '$\\beta^2 = \\left(\\dfrac{' + nx(v, 3) + '}{3.00 \\times 10^8}\\right)^2 = ' + nx((v / C) * (v / C)) + '$.', '$\\tfrac{1}{2}(' + nx((v / C) * (v / C)) + ')(' + nx(hrs * 3600, 3) + '\\ \\text{s}) = ' + qu(dtn, 's') + ' = ' + qu(dtn * 1e9, 'ns') + '$.'],
        hint: 'For small $\\beta$, $1 - 1/\\gamma \\approx \\beta^2/2$.' };
    } else {
      var S = R.pick([
        ['A twin flies to a star and back while the other stays home. Whose clock measures the proper time for the outbound leg (leaving Earth, reaching the star)?', 'The traveling twin\'s clock', ['The Earth twin\'s clock', 'A clock at the star', 'Both clocks equally']],
        ['A muon is created high in the atmosphere and decays near the ground. Which clock measures the proper time between those two events?', 'A clock riding along with the muon', ['A clock on the ground below', 'A clock at the top of the atmosphere', 'Either clock: proper time is the same in every frame']],
        ['A ship flashes a light as it passes Earth and again as it passes Mars. Which clock reads the proper time between the flashes?', 'The ship\'s clock', ['A clock on Earth', 'A clock on Mars', 'The Earth and Mars clocks together, synchronized']]]);
      rec('modern.time-dilation', { kind: kind, right: S[1] });
      p = { q: S[0], a: mc(S[1], S[2]), steps: ['Proper time is measured by a single clock present at both events.', 'Only ' + S[1].charAt(0).toLowerCase() + S[1].slice(1) + ' is at both events, so it reads the shortest time, $\\Delta\\tau$; others measure $\\gamma\\Delta\\tau$.'], hint: 'Which clock is present at both events?' };
    }
    return p;
  });

  G('modern.length-contraction', function (R, ctx) {
    var kind = R.pick(by(ctx, ['contract', 'contract'], ['speedFor', 'proper', 'muonFrame'], ['tilt', 'tiltAngle', 'speedFor']));
    var b = R.pick(BETAS), g = gam(b), p;
    if (kind === 'contract') {
      var obj = R.pick([['A spaceship', 100, 'm'], ['A rocket', 60, 'm'], ['A train of the future', 250, 'm'], ['A meter stick', 1.00, 'm'], ['A space station', 1.5, 'km']]);
      rec('modern.length-contraction', { kind: kind, b: b, L0: obj[1] });
      p = { q: obj[0] + ' is $' + qu(obj[1], obj[2], 3) + '$ long in its own frame. How long is it, measured in a frame where it moves lengthwise at $' + bT(b) + 'c$?', a: num(obj[1] / g), unit: obj[2],
        steps: ['$' + gT(b) + '$.', '$L = \\dfrac{L_0}{\\gamma} = \\dfrac{' + nx(obj[1], 3) + '}{' + nx(g, 4) + '} = ' + qu(obj[1] / g, obj[2]) + '$.'], hint: 'Moving lengths are shorter along the motion: divide by $\\gamma$.' };
    } else if (kind === 'speedFor') {
      var frac = R.pick([0.20, 0.25, 0.40, 0.50, 0.60, 0.75, 0.80, 0.90]), bb = M.sqrt(1 - frac * frac);
      rec('modern.length-contraction', { kind: kind, frac: frac });
      p = { q: 'How fast must a rod move along its length to be measured at $' + nx(frac * 100, 2) + '\\%$ of its proper length? Give $v$ as a fraction of $c$.', a: num(bb, 0.005), unit: 'c',
        steps: ['$\\dfrac{L}{L_0} = \\sqrt{1 - \\beta^2} = ' + nx(frac, 2) + '$.', '$\\beta = \\sqrt{1 - ' + nx(frac, 2) + '^2} = ' + nx(bb, 4) + '$.'], hint: 'Square both sides of $L/L_0 = \\sqrt{1 - \\beta^2}$.' };
    } else if (kind === 'proper') {
      var Lm = R.pick([30, 45, 60, 80, 120]);
      rec('modern.length-contraction', { kind: kind, b: b, L: Lm });
      p = { q: 'Earth observers measure a passing ship to be $' + qu(Lm, 'm', 3) + '$ long while it moves at $' + bT(b) + 'c$. How long is the ship in its own frame?', a: num(Lm * g), unit: 'm',
        steps: ['The ship\'s own length is its proper length, the longest one: $L_0 = \\gamma L$.', '$' + gT(b) + '$, so $L_0 = ' + nx(g, 4) + ' \\times ' + nx(Lm, 3) + ' = ' + qu(Lm * g, 'm') + '$.'], hint: 'The measured (moving) length is the shorter one.' };
    } else if (kind === 'muonFrame') {
      var bm = R.pick([0.98, 0.99, 0.995, 0.999]), H = R.pick([8.0, 10, 12, 15]);
      rec('modern.length-contraction', { kind: kind, b: bm, H: H });
      p = { q: 'In Earth\'s frame, a muon moving straight down at $' + bT(bm) + 'c$ crosses $' + qu(H, 'km', 2) + '$ of atmosphere. How thick is that layer of atmosphere in the muon\'s frame?', a: num(H / gam(bm)), unit: 'km',
        steps: ['The atmosphere is at rest on Earth, so $' + qu(H, 'km', 2) + '$ is its proper length.', 'In the muon\'s frame the atmosphere rushes past at $' + bT(bm) + 'c$: $' + gT(bm) + '$.', '$L = \\dfrac{' + nx(H, 2) + '}{' + nx(gam(bm), 4) + '} = ' + qu(H / gam(bm), 'km') + '$.'], hint: 'In the muon\'s frame it is the atmosphere that moves.' };
    } else {
      var L0 = R.pick([1.00, 2.00, 0.50, 1.50]), th = R.pick([30, 37, 45, 53, 60]), Lx = L0 * cosd(th) / g, Ly = L0 * sind(th), Ln = M.hypot(Lx, Ly), an = atand(Ly / Lx);
      rec('modern.length-contraction', { kind: kind, b: b, L0: L0, th: th });
      var ask = kind === 'tilt' ? 'length' : 'angle';
      p = { q: 'A rod $' + qu(L0, 'm', 3) + '$ long lies at $' + th + '^\\circ$ to the $x$-axis in its own frame. It moves along $x$ at $' + bT(b) + 'c$. What is its ' + (ask === 'length' ? 'length' : 'angle to the $x$-axis') + ' in the lab frame?', a: num(ask === 'length' ? Ln : an), unit: ask === 'length' ? 'm' : '°',
        steps: ['Components in the rod\'s frame: $L_x = ' + nx(L0, 3) + '\\cos ' + th + '^\\circ = ' + qu(L0 * cosd(th), 'm') + '$, $L_y = ' + nx(L0, 3) + '\\sin ' + th + '^\\circ = ' + qu(Ly, 'm') + '$.', 'Only $L_x$ contracts: $\\dfrac{' + nx(L0 * cosd(th)) + '}{' + nx(g, 4) + '} = ' + qu(Lx, 'm') + '$; $L_y$ is unchanged.',
          ask === 'length' ? '$L = \\sqrt{' + nx(Lx) + '^2 + ' + nx(Ly) + '^2} = ' + qu(Ln, 'm') + '$.' : 'Angle: $\\tan^{-1}\\dfrac{' + nx(Ly) + '}{' + nx(Lx) + '} = ' + deg(an) + '$ (steeper than in its own frame).'],
        hint: 'Split the rod into components along and across the motion; only one of them shrinks.' };
    }
    return p;
  });

  G('modern.lorentz-transformation', function (R, ctx) {
    var kind = R.pick(by(ctx, ['xp', 'tp'], ['both', 'both', 'dtp'], ['inverse', 'simulV', 'dtp']));
    var b = R.pick([0.60, 0.80, 0.28, 0.96, 0.50]), g = gam(b), x = R.pick([1.0, 2.0, 3.0, 4.0, 5.0, 6.0]) * R.pick([1, 1, -1]), t = R.pick([1.0, 2.0, 3.0, 4.0, 5.0]), p;
    var xp = g * (x - b * t), tp = g * (t - b * x);
    var given = 'In frame $S$ an event happens at $x = ' + qu(x, 'ly', 2) + '$, $t = ' + qu(t, 'yr', 2) + '$. Frame $S\'$ moves at $' + bT(b) + 'c$ along $+x$, and the origins coincide at $t = t\' = 0$. Use $c = 1$ ly/yr.';
    var st = ['$' + gT(b) + '$; with $c = 1$ ly/yr, $v = ' + bT(b) + '$ ly/yr.', '$x\' = \\gamma(x - vt) = ' + nx(g, 4) + '(' + nx(x, 2) + ' - ' + bT(b) + ' \\times ' + nx(t, 2) + ') = ' + qu(xp, 'ly') + '$.', '$t\' = \\gamma\\left(t - \\dfrac{vx}{c^2}\\right) = ' + nx(g, 4) + '(' + nx(t, 2) + ' - ' + bT(b) + ' \\times ' + T.p(nx(x, 2)) + ') = ' + qu(tp, 'yr') + '$.'];
    rec('modern.lorentz-transformation', { kind: kind, b: b, x: x, t: t });
    if (kind === 'xp') p = { q: given + ' Find $x\'$.', a: num(xp, 0.02), unit: 'ly', steps: [st[0], st[1]], hint: 'Use $x\' = \\gamma(x - vt)$.' };
    else if (kind === 'tp') p = { q: given + ' Find $t\'$.', a: num(tp, 0.02), unit: 'yr', steps: [st[0], st[2]], hint: 'Use $t\' = \\gamma(t - vx/c^2)$; don\'t drop the $vx/c^2$ term.' };
    else if (kind === 'both') p = { q: given + ' Find $x\'$ and $t\'$.', a: multi([{ label: '$x\'$ (ly) $=$', a: num(xp, 0.02), unit: 'ly' }, { label: '$t\'$ (yr) $=$', a: num(tp, 0.02), unit: 'yr' }]), steps: st, hint: 'Apply both formulas; the $vx/c^2$ term matters.' };
    else if (kind === 'inverse') {
      var xq = R.pick([1.0, 2.0, 3.0, -1.0]), tq = R.pick([2.0, 3.0, 4.0, 5.0]), X = g * (xq + b * tq), Tt = g * (tq + b * xq);
      rec('modern.lorentz-transformation', { kind: kind, b: b, xp: xq, tp: tq });
      p = { q: 'In frame $S\'$, which moves at $' + bT(b) + 'c$ along $+x$ relative to $S$, an event has $x\' = ' + qu(xq, 'ly', 2) + '$ and $t\' = ' + qu(tq, 'yr', 2) + '$. Find its coordinates $x$ and $t$ in $S$ (use $c = 1$ ly/yr).', a: multi([{ label: '$x$ (ly) $=$', a: num(X, 0.02), unit: 'ly' }, { label: '$t$ (yr) $=$', a: num(Tt, 0.02), unit: 'yr' }]),
        steps: ['Going back, swap primes and change the sign of $v$: $x = \\gamma(x\' + vt\')$, $t = \\gamma(t\' + vx\'/c^2)$.', '$' + gT(b) + '$.', '$x = ' + nx(g, 4) + '(' + nx(xq, 2) + ' + ' + bT(b) + ' \\times ' + nx(tq, 2) + ') = ' + qu(X, 'ly') + '$.', '$t = ' + nx(g, 4) + '(' + nx(tq, 2) + ' + ' + bT(b) + ' \\times ' + T.p(nx(xq, 2)) + ') = ' + qu(Tt, 'yr') + '$.'],
        hint: 'The inverse transformation has $+v$.' };
    } else if (kind === 'simulV') {
      var dx = R.pick([2.0, 3.0, 4.0, 5.0, 8.0, 10]), dtv = R.pick([0.5, 1.0, 1.5, 2.0, 2.5, 3.0]); if (dtv >= dx) dtv = dx / 2;
      rec('modern.lorentz-transformation', { kind: kind, dx: dx, dt: dtv });
      p = { q: 'In frame $S$, event B happens $' + qu(dtv, 'yr', 2) + '$ after event A and $' + qu(dx, 'ly', 2) + '$ farther along $+x$. How fast must frame $S\'$ move along $+x$ for the two events to be simultaneous in $S\'$? Give $v$ as a fraction of $c$.', a: num(dtv / dx, 0.01), unit: 'c',
        steps: ['$\\Delta t\' = \\gamma\\left(\\Delta t - \\dfrac{v\\Delta x}{c^2}\\right) = 0$ requires $v = \\dfrac{c^2\\Delta t}{\\Delta x}$.', 'With $c = 1$ ly/yr: $\\beta = \\dfrac{' + nx(dtv, 2) + '}{' + nx(dx, 2) + '} = ' + nx(dtv / dx, 3) + '$.', 'This works only because $c\\Delta t < \\Delta x$ (the events are too far apart for a signal to link them).'],
        hint: 'Set $\\Delta t\' = 0$ in the Lorentz transformation.' };
    } else {
      var x1 = R.pick([0, 1.0, 2.0]), x2 = x1 + R.pick([2.0, 3.0, 4.0, 5.0]), t1 = R.pick([0, 1.0, 2.0]), t2 = t1 + R.pick([0, 1.0, 2.0, 3.0]), dtp = g * ((t2 - t1) - b * (x2 - x1));
      rec('modern.lorentz-transformation', { kind: kind, b: b, x1: x1, x2: x2, t1: t1, t2: t2 });
      p = { q: 'In frame $S$, event A is at $(x, t) = (' + nx(x1, 2) + '\\ \\text{ly}, ' + nx(t1, 2) + '\\ \\text{yr})$ and event B at $(' + nx(x2, 2) + '\\ \\text{ly}, ' + nx(t2, 2) + '\\ \\text{yr})$. In a frame moving at $' + bT(b) + 'c$ along $+x$, what is $t\'_B - t\'_A$? (Use $c = 1$ ly/yr; a negative answer means B comes first.)', a: num(dtp, 0.02), unit: 'yr',
        steps: ['Differences: $\\Delta x = ' + qu(x2 - x1, 'ly', 2) + '$, $\\Delta t = ' + qu(t2 - t1, 'yr', 2) + '$.', '$' + gT(b) + '$.', '$\\Delta t\' = \\gamma(\\Delta t - v\\Delta x) = ' + nx(g, 4) + '(' + nx(t2 - t1, 2) + ' - ' + bT(b) + ' \\times ' + nx(x2 - x1, 2) + ') = ' + qu(dtp, 'yr') + '$.'],
        hint: 'The Lorentz transformation works on differences too: $\\Delta t\' = \\gamma(\\Delta t - v\\Delta x/c^2)$.' };
    }
    return p;
  });

  G('modern.spacetime-interval', function (R, ctx) {
    var kind = R.pick(by(ctx, ['tau', 's2'], ['classify', 'tau', 'xprime'], ['twin', 'xprime', 'classify']));
    var trip = R.pick([[5, 3], [5, 4], [10, 6], [10, 8], [13, 5], [13, 12], [17, 8], [25, 7], [25, 24], [4, 2], [6, 3], [8, 5], [3, 1], [3, 2], [4, 1], [4, 3], [6, 5], [7, 3], [7, 5], [8, 3], [9, 4], [12, 5], [15, 9], [20, 12], [20, 16], [2, 1]]), dt = trip[0], dx = trip[1], s2 = dt * dt - dx * dx, p;
    if (kind === 'tau' || kind === 's2') {
      rec('modern.spacetime-interval', { kind: kind, dt: dt, dx: dx });
      p = { q: 'Event B happens $' + dt + '$ yr after event A and $' + dx + '$ ly away from it. ' + (kind === 'tau' ? 'What does a clock read for the trip if it travels at constant velocity from A to B?' : 'What is the spacetime interval $s^2 = (c\\Delta t)^2 - \\Delta x^2$, in ly² (with $c = 1$ ly/yr)?'), a: num(kind === 'tau' ? M.sqrt(s2) : s2, 0.01), unit: kind === 'tau' ? 'yr' : 'ly²',
        steps: ['$s^2 = (' + dt + ')^2 - (' + dx + ')^2 = ' + s2 + '$ ly² (positive: timelike).'].concat(kind === 'tau' ? ['The traveling clock is at both events, so it reads the proper time: $\\Delta\\tau = s/c = \\sqrt{' + s2 + '} = ' + qu(M.sqrt(s2), 'yr') + '$.', 'Check: it moves at $' + dx + '/' + dt + ' = ' + nx(dx / dt) + 'c$, and $' + dt + '/\\gamma$ gives the same.'] : []),
        hint: kind === 'tau' ? 'The proper time is the interval divided by $c$.' : 'Square the time (in years) and the distance (in light-years), and subtract.' };
    } else if (kind === 'classify') {
      var a = R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0]), d = R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0]), ty = a > d ? 0 : a < d ? 1 : 2;
      rec('modern.spacetime-interval', { kind: kind, dt: a, dx: d });
      p = { q: 'Two events are $' + qu(a, 'yr', 2) + '$ apart in time and $' + qu(d, 'ly', 2) + '$ apart in space in some frame. What kind of separation do they have?',
        a: { t: 'mc', choices: ['Timelike: one could cause the other, and every observer agrees on their order', 'Spacelike: no signal can link them, and their order depends on the frame', 'Lightlike: only a light signal could link them'], v: ty, keep: true },
        steps: ['$s^2 = (c\\Delta t)^2 - \\Delta x^2 = ' + nx(a * a, 3) + ' - ' + nx(d * d, 3) + ' = ' + nx(a * a - d * d, 3) + '$ ly².', ty === 0 ? 'Positive: timelike.' : ty === 1 ? 'Negative: spacelike.' : 'Zero: lightlike.'],
        hint: 'Compare $c\\Delta t$ with $\\Delta x$.' };
    } else if (kind === 'xprime') {
      var tp = dt + R.pick([1, 2, 3, 5]), xp = M.sqrt(tp * tp - s2);
      rec('modern.spacetime-interval', { kind: kind, dt: dt, dx: dx, tp: tp });
      p = { q: 'In frame $S$, two events are $' + dt + '$ yr and $' + dx + '$ ly apart. In another frame $S\'$ they are $' + tp + '$ yr apart. How far apart in space are they in $S\'$? (Use $c = 1$ ly/yr.)', a: num(xp, 0.01), unit: 'ly',
        steps: ['The interval is the same in both frames: $s^2 = ' + dt + '^2 - ' + dx + '^2 = ' + s2 + '$ ly².', 'In $S\'$: $' + tp + '^2 - \\Delta x\'^2 = ' + s2 + '$, so $\\Delta x\'^2 = ' + (tp * tp - s2) + '$.', '$\\Delta x\' = ' + qu(xp, 'ly') + '$.'],
        hint: 'Use the invariance of $(c\\Delta t)^2 - \\Delta x^2$.' };
    } else {
      var l1 = R.pick([[5, 3], [5, 4], [10, 6], [10, 8], [13, 12]]), outT = l1[0], outX = l1[1], tauT = 2 * M.sqrt(outT * outT - outX * outX);
      rec('modern.spacetime-interval', { kind: kind, dt: outT, dx: outX });
      p = { q: 'A traveler leaves Earth, flies at constant speed to a star $' + outX + '$ ly away, and returns at the same speed. Each leg takes $' + outT + '$ yr in Earth\'s frame. How much time passes on the traveler\'s clock for the whole trip?', a: num(tauT, 0.01), unit: 'yr',
        steps: ['Each leg is a straight path in spacetime: $\\Delta\\tau = \\sqrt{(\\Delta t)^2 - (\\Delta x/c)^2} = \\sqrt{' + outT + '^2 - ' + outX + '^2} = ' + qu(tauT / 2, 'yr') + '$.', 'Two legs: $' + qu(tauT, 'yr') + '$, while $' + 2 * outT + '$ yr pass on Earth.', 'Not symmetric: only the traveler changes frames, at the turnaround.'],
        hint: 'Find the proper time of each leg and add them.' };
    }
    return p;
  });

  G('modern.velocity-addition', function (R, ctx) {
    var kind = R.pick(by(ctx, ['forward', 'forward'], ['backward', 'approach', 'forward'], ['inverse', 'approach', 'inverse']));
    var v = R.pick([0.50, 0.60, 0.70, 0.80, 0.90, 0.40, 0.25]), u1 = R.pick([0.50, 0.60, 0.70, 0.80, 0.90, 0.40, 0.25, 0.30]), p;
    if (kind === 'forward' || kind === 'backward') {
      var up = kind === 'forward' ? u1 : -u1, u = (up + v) / (1 + up * v);
      rec('modern.velocity-addition', { kind: kind, v: v, up: up });
      p = { q: 'A ship moving at $' + bT(v) + 'c$ relative to Earth fires a probe ' + (kind === 'forward' ? 'forward' : 'backward') + ' at $' + bT(u1) + 'c$ relative to the ship. What is the probe\'s velocity relative to Earth, as a multiple of $c$ (negative if it moves opposite to the ship)?', a: num(u, 0.01), unit: 'c',
        steps: ['$u\' = ' + bT(up) + 'c$ and $v = ' + bT(v) + 'c$.', '$u = \\dfrac{u\' + v}{1 + u\'v/c^2} = \\dfrac{' + bT(up) + ' + ' + bT(v) + '}{1 + (' + bT(up) + ')(' + bT(v) + ')}c = \\dfrac{' + nx(up + v, 3) + '}{' + nx(1 + up * v, 4) + '}c$.', '$u = ' + nx(u, 4) + 'c$ (Galileo would say $' + nx(up + v, 3) + 'c$).'],
        hint: 'Use the relativistic rule, with a minus sign for a velocity pointing backward.' };
    } else if (kind === 'approach') {
      var va = R.pick([0.50, 0.60, 0.70, 0.80, 0.90]), vb = R.pick([0.50, 0.60, 0.70, 0.80, 0.90]), rel = (va + vb) / (1 + va * vb);
      rec('modern.velocity-addition', { kind: kind, va: va, vb: vb });
      p = { q: 'Two ships head toward each other. In Earth\'s frame, ship A moves at $' + bT(va) + 'c$ and ship B at $' + bT(vb) + 'c$ (in the opposite direction). How fast does B approach, as measured by the crew of A? (As a multiple of $c$.)', a: num(rel, 0.01), unit: 'c',
        steps: ['Work in A\'s frame, which moves at $v = ' + bT(va) + 'c$. In Earth\'s frame B moves at $u = -' + bT(vb) + 'c$.', '$u\' = \\dfrac{u - v}{1 - uv/c^2} = \\dfrac{-' + bT(vb) + ' - ' + bT(va) + '}{1 + (' + bT(vb) + ')(' + bT(va) + ')}c = ' + nx(-rel, 4) + 'c$.', 'So B approaches at $' + nx(rel, 4) + 'c$, less than $c$.'],
        hint: 'Transform B\'s velocity into A\'s frame with $u\' = (u - v)/(1 - uv/c^2)$.' };
    } else {
      var uu = R.pick([0.80, 0.85, 0.90, 0.95, 0.98]), vv = R.pick([0.30, 0.40, 0.50, 0.60]), upp = (uu - vv) / (1 - uu * vv);
      rec('modern.velocity-addition', { kind: kind, u: uu, v: vv });
      p = { q: 'In Earth\'s frame a particle moves at $' + bT(uu) + 'c$. A ship follows it in the same direction at $' + bT(vv) + 'c$. How fast does the particle move as measured from the ship? (As a multiple of $c$.)', a: num(upp, 0.01), unit: 'c',
        steps: ['$u\' = \\dfrac{u - v}{1 - uv/c^2} = \\dfrac{' + bT(uu) + ' - ' + bT(vv) + '}{1 - (' + bT(uu) + ')(' + bT(vv) + ')}c = \\dfrac{' + nx(uu - vv, 3) + '}{' + nx(1 - uu * vv, 4) + '}c$.', '$u\' = ' + nx(upp, 4) + 'c$ (Galileo would say $' + nx(uu - vv, 3) + 'c$).'],
        hint: 'Use the reverse rule, with a minus sign in the denominator too.' };
    }
    return p;
  });

  G('modern.relativistic-doppler', function (R, ctx) {
    var kind = R.pick(by(ctx, ['lamRecede', 'fApproach'], ['betaFromLam', 'z', 'fRecede'], ['betaFromRatio', 'betaFromLam', 'compare']));
    var b = R.pick([0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.80]), fac = M.sqrt((1 + b) / (1 - b)), p;
    var line = R.pick([['hydrogen\'s red line', 656.3], ['hydrogen\'s blue-green line', 486.1], ['a sodium line', 589.0], ['a calcium line', 393.4]]);
    if (kind === 'lamRecede' || kind === 'z') {
      var lam = line[1] * fac;
      rec('modern.relativistic-doppler', { kind: kind, b: b, lam0: line[1] });
      p = { q: (line[0].charAt(0).toUpperCase() + line[0].slice(1)) + ' has $\\lambda_0 = ' + qu(line[1], 'nm', 4) + '$. ' + (kind === 'lamRecede' ? 'At what wavelength is it observed from a galaxy receding at $' + bT(b) + 'c$?' : 'What redshift $z$ does a galaxy receding at $' + bT(b) + 'c$ show?'), a: kind === 'lamRecede' ? num(lam, 0.005) : num(fac - 1, 0.01), unit: kind === 'lamRecede' ? 'nm' : '',
        steps: ['Receding: $\\lambda = \\lambda_0\\sqrt{\\dfrac{1 + \\beta}{1 - \\beta}} = \\lambda_0\\sqrt{\\dfrac{' + nx(1 + b, 3) + '}{' + nx(1 - b, 3) + '}} = ' + nx(fac, 4) + '\\lambda_0$.', kind === 'lamRecede' ? '$\\lambda = ' + nx(fac, 4) + ' \\times ' + nx(line[1], 4) + ' = ' + qu(lam, 'nm', 4) + '$.' : '$z = \\dfrac{\\lambda - \\lambda_0}{\\lambda_0} = ' + nx(fac, 4) + ' - 1 = ' + nx(fac - 1, 3) + '$ (the same for every line).'],
        hint: 'A receding source stretches wavelengths by $\\sqrt{(1 + \\beta)/(1 - \\beta)}$.' };
    } else if (kind === 'fApproach' || kind === 'fRecede') {
      var f0 = R.pick([5.0, 6.0, 10, 2.4, 1.0]), ap = kind === 'fApproach', fo = ap ? f0 * fac : f0 / fac;
      rec('modern.relativistic-doppler', { kind: kind, b: b, f0: f0 });
      p = { q: 'A beacon on a spacecraft transmits at $' + qu(f0, 'GHz', 2) + '$ in its own frame. The craft ' + (ap ? 'approaches' : 'moves away from') + ' Earth at $' + bT(b) + 'c$. What frequency do we receive?', a: num(fo, 0.005), unit: 'GHz',
        steps: [(ap ? 'Approaching' : 'Receding') + ': $f = f_0\\sqrt{\\dfrac{1 ' + (ap ? '+' : '-') + ' \\beta}{1 ' + (ap ? '-' : '+') + ' \\beta}} = f_0\\sqrt{\\dfrac{' + nx(ap ? 1 + b : 1 - b, 3) + '}{' + nx(ap ? 1 - b : 1 + b, 3) + '}}$.', '$f = ' + nx(f0, 2) + ' \\times ' + nx(ap ? fac : 1 / fac, 4) + ' = ' + qu(fo, 'GHz', 4) + '$.'],
        hint: 'Approach raises the frequency; recession lowers it.' };
    } else if (kind === 'betaFromLam') {
      var lo = rnd(line[1] * fac, 4), r = lo / line[1], bb = (r * r - 1) / (r * r + 1);
      rec('modern.relativistic-doppler', { kind: kind, lam0: line[1], lam: lo });
      p = { q: (line[0].charAt(0).toUpperCase() + line[0].slice(1)) + ', at $' + qu(line[1], 'nm', 4) + '$ in the lab, is observed at $' + qu(lo, 'nm', 4) + '$ in a galaxy\'s spectrum. Treating the shift as motion away from us, how fast is the galaxy receding, as a fraction of $c$?', a: num(bb, 0.01), unit: 'c',
        steps: ['$\\dfrac{\\lambda}{\\lambda_0} = \\dfrac{' + nx(lo, 4) + '}{' + nx(line[1], 4) + '} = ' + nx(r, 4) + '$.', 'Square: $\\dfrac{1 + \\beta}{1 - \\beta} = ' + nx(r * r, 4) + '$, so $\\beta = \\dfrac{' + nx(r * r, 4) + ' - 1}{' + nx(r * r, 4) + ' + 1} = ' + nx(bb, 3) + '$.'],
        hint: 'Square the wavelength ratio, then solve for $\\beta$.' };
    } else if (kind === 'betaFromRatio') {
      var ratio = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 0.5, 0.75, 1.2]), bb2 = (ratio * ratio - 1) / (ratio * ratio + 1);
      rec('modern.relativistic-doppler', { kind: kind, ratio: ratio });
      p = { q: 'A source\'s light arrives with ' + nx(ratio, 2) + ' times its emitted frequency. What is its velocity toward us, as a fraction of $c$ (negative if it is moving away)?', a: num(bb2, 0.01), unit: 'c',
        steps: ['$\\dfrac{f}{f_0} = \\sqrt{\\dfrac{1 + \\beta}{1 - \\beta}}$ with $\\beta > 0$ for approach.', '$\\dfrac{1 + \\beta}{1 - \\beta} = ' + nx(ratio * ratio, 4) + '$, so $\\beta = \\dfrac{' + nx(ratio * ratio, 4) + ' - 1}{' + nx(ratio * ratio, 4) + ' + 1} = ' + nx(bb2, 3) + '$.'],
        hint: 'Square the frequency ratio and solve for $\\beta$.' };
    } else {
      var bc = R.pick([0.20, 0.40, 0.50, 0.60, 0.80]), rel = M.sqrt((1 + bc) / (1 - bc));
      rec('modern.relativistic-doppler', { kind: kind, b: bc });
      p = { q: 'A source approaches at $' + bT(bc) + 'c$. Someone wrongly uses the sound formula $f = \\dfrac{f_0}{1 - \\beta}$ and gets $' + nx(1 / (1 - bc), 3) + 'f_0$. What is the correct ratio $f/f_0$?', a: num(rel, 0.005), unit: '',
        steps: ['Correct: $\\dfrac{f}{f_0} = \\sqrt{\\dfrac{1 + \\beta}{1 - \\beta}} = \\sqrt{\\dfrac{' + nx(1 + bc, 3) + '}{' + nx(1 - bc, 3) + '}} = ' + nx(rel, 4) + '$.', 'The sound formula is too large by $\\gamma = ' + nx(gam(bc), 4) + '$: it leaves out the slowing of the source\'s clock.'],
        hint: 'Light\'s formula depends only on the relative speed and includes time dilation.' };
    }
    return p;
  });

  G('modern.relativistic-energy', function (R, ctx) {
    var kind = R.pick(by(ctx, ['E', 'K', 'p'], ['vFromK', 'pFromK', 'K'], ['voltage', 'classical', 'pFromK']));
    var part = R.pick([['an electron', MEC2], ['a proton', MPC2], ['a muon', 105.7], ['an alpha particle', 3727]]), mc2 = part[1], p;
    var b = R.pick([0.50, 0.60, 0.80, 0.90, 0.95, 0.99, 0.28, 0.96]), g = gam(b);
    if (kind === 'E' || kind === 'K' || kind === 'p') {
      var E = g * mc2, K = E - mc2, pc = E * b, val = kind === 'E' ? E : kind === 'K' ? K : pc;
      rec('modern.relativistic-energy', { kind: kind, mc2: mc2, b: b });
      p = { q: 'Find the ' + (kind === 'E' ? 'total energy' : kind === 'K' ? 'kinetic energy' : 'momentum') + ' of ' + part[0] + ' ($mc^2 = ' + qu(mc2, 'MeV', mc2 < 1 ? 3 : 4) + '$) moving at $' + bT(b) + 'c$' + (kind === 'p' ? ', in MeV/$c$.' : ', in MeV.'), a: num(val), unit: kind === 'p' ? 'MeV/c' : 'MeV',
        steps: ['$' + gT(b) + '$.', kind === 'p' ? '$pc = \\gamma mc^2\\beta = ' + nx(g, 4) + ' \\times ' + nx(mc2, mc2 < 1 ? 3 : 4) + ' \\times ' + bT(b) + ' = ' + qu(pc, 'MeV') + '$, so $p = ' + nx(pc) + '$ MeV/$c$.' : '$E = \\gamma mc^2 = ' + nx(g, 4) + ' \\times ' + nx(mc2, mc2 < 1 ? 3 : 4) + ' = ' + qu(E, 'MeV') + '$.'].concat(kind === 'K' ? ['$K = E - mc^2 = ' + nx(E) + ' - ' + nx(mc2, mc2 < 1 ? 3 : 4) + ' = ' + qu(K, 'MeV') + '$.'] : []),
        hint: kind === 'K' ? 'Kinetic energy is the total energy minus the rest energy.' : kind === 'p' ? 'Use $p = \\gamma mu$, so $pc = \\gamma mc^2\\beta$.' : 'Total energy is $\\gamma mc^2$.' };
    } else if (kind === 'vFromK' || kind === 'pFromK') {
      var Kk = mc2 * R.pick([0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0]), Kr = rnd(Kk, 3), g2 = 1 + Kr / mc2, b2 = M.sqrt(1 - 1 / (g2 * g2)), pc2 = M.sqrt(Kr * Kr + 2 * Kr * mc2);
      rec('modern.relativistic-energy', { kind: kind, mc2: mc2, K: Kr });
      if (kind === 'vFromK') p = { q: 'A particle accelerator gives ' + part[0] + ' ($mc^2 = ' + qu(mc2, 'MeV', mc2 < 1 ? 3 : 4) + '$) a kinetic energy of $' + qu(Kr, 'MeV', 3) + '$. How fast does it move, as a fraction of $c$?', a: num(b2, 0.005), unit: 'c',
        steps: ['$\\gamma = 1 + \\dfrac{K}{mc^2} = 1 + \\dfrac{' + nx(Kr, 3) + '}{' + nx(mc2, mc2 < 1 ? 3 : 4) + '} = ' + nx(g2, 4) + '$.', '$\\beta = \\sqrt{1 - \\dfrac{1}{\\gamma^2}} = \\sqrt{1 - \\dfrac{1}{' + nx(g2, 4) + '^2}} = ' + nx(b2, 4) + '$.'], hint: 'Get $\\gamma$ from $K = (\\gamma - 1)mc^2$.' };
      else p = { q: 'What is the momentum of ' + part[0] + ' ($mc^2 = ' + qu(mc2, 'MeV', mc2 < 1 ? 3 : 4) + '$) with kinetic energy $' + qu(Kr, 'MeV', 3) + '$, in MeV/$c$?', a: num(pc2), unit: 'MeV/c',
        steps: ['$E = K + mc^2 = ' + nx(Kr, 3) + ' + ' + nx(mc2, mc2 < 1 ? 3 : 4) + ' = ' + qu(Kr + mc2, 'MeV') + '$.', '$pc = \\sqrt{E^2 - (mc^2)^2} = \\sqrt{' + nx(Kr + mc2) + '^2 - ' + nx(mc2, mc2 < 1 ? 3 : 4) + '^2} = ' + qu(pc2, 'MeV') + '$.', '$p = ' + nx(pc2) + '$ MeV/$c$.'], hint: 'Use $E^2 = (pc)^2 + (mc^2)^2$ with $E = K + mc^2$.' };
    } else if (kind === 'voltage') {
      var V = R.pick([0.10, 0.20, 0.50, 1.0, 2.0, 5.0]), K3 = V, g3 = 1 + K3 / MEC2, b3 = M.sqrt(1 - 1 / (g3 * g3));
      rec('modern.relativistic-energy', { kind: kind, V: V });
      p = { q: 'An electron ($mc^2 = 0.511$ MeV) starts from rest and is accelerated through a potential difference of $' + qu(V, 'MV', 2) + '$. How fast is it moving, as a fraction of $c$?', a: num(b3, 0.005), unit: 'c',
        steps: ['It gains kinetic energy $K = eV = ' + qu(K3, 'MeV', 2) + '$.', '$\\gamma = 1 + \\dfrac{K}{mc^2} = 1 + \\dfrac{' + nx(K3, 2) + '}{0.511} = ' + nx(g3, 4) + '$.', '$\\beta = \\sqrt{1 - 1/\\gamma^2} = ' + nx(b3, 4) + '$.' + (V >= 0.5 ? ' (The classical $\\frac{1}{2}mv^2$ would give more than $c$.)' : '')],
        hint: 'One electron through 1 MV gains 1 MeV.' };
    } else {
      var rat = (g - 1) / (0.5 * b * b);
      rec('modern.relativistic-energy', { kind: kind, b: b });
      p = { q: 'At $' + bT(b) + 'c$, how many times larger is a particle\'s true kinetic energy $(\\gamma - 1)mc^2$ than the classical $\\frac{1}{2}mv^2$?', a: num(rat, 0.01), unit: '×',
        steps: ['$' + gT(b) + '$, so $(\\gamma - 1)mc^2 = ' + nx(g - 1, 4) + 'mc^2$.', 'Classical: $\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}\\beta^2mc^2 = ' + nx(0.5 * b * b, 4) + 'mc^2$.', 'Ratio: $' + nx(g - 1, 4) + '/' + nx(0.5 * b * b, 4) + ' = ' + nx(rat) + '$.'],
        hint: 'Write both energies as multiples of $mc^2$.' };
    }
    return p;
  });

  // ---- u5
  // ===================================================================== Unit 5: The Quantum World
  var HB2M = 0.0381, HEV = 4.136e-15, HBAREV = 6.582e-16, ELBOX = 0.376, KAPPA1 = 5.123; // eV·nm², eV·s, eV·s, eV·nm², nm⁻¹ per √eV

  G('modern.planck-blackbody', function (R, ctx) {
    var kind = R.pick(by(ctx, ['peak', 'Tfrom'], ['ratio', 'power', 'peakE'], ['meanE', 'ratio', 'power']));
    var p;
    if (kind === 'peak') {
      var obj = R.chance(0.4) ? R.pick([['the Sun\'s surface', 5772], ['a stove element', 1000], ['a light bulb filament', 2800], ['a person\'s skin', 306], ['a warm cup of tea', 340], ['the cosmic microwave background', 2.725], ['a lava flow', 1400]]) : [R.pick(['a star\'s surface', 'the surface of a star', 'a star']), R.pick([3000, 3200, 3500, 4000, 4500, 5000, 6000, 7500, 9000, 10000, 12000, 15000, 20000, 25000, 30000])];
      rec('modern.planck-blackbody', { kind: kind, T: obj[1] });
      var lm = WIEN / obj[1], unit = lm < 1e-6 ? 'nm' : lm < 1e-3 ? 'μm' : 'mm', sc = unit === 'nm' ? 1e9 : unit === 'μm' ? 1e6 : 1e3;
      p = { q: 'At what wavelength does the thermal radiation of ' + obj[0] + ' (about $' + qu(obj[1], 'K', obj[1] >= 1000 ? 4 : 3) + '$) peak? Answer in ' + { nm: 'nanometers', 'μm': 'micrometers', mm: 'millimeters' }[unit] + '.', a: num(lm * sc), unit: unit,
        steps: ['Wien\'s law: $\\lambda_{\\max} = \\dfrac{2.898 \\times 10^{-3}\\ \\text{m·K}}{T} = \\dfrac{2.898 \\times 10^{-3}}{' + nx(obj[1], 4) + '}$.', '$\\lambda_{\\max} = ' + qu(lm, 'm') + ' = ' + qu(lm * sc, unit) + '$.'],
        hint: 'Use Wien\'s displacement law with $T$ in kelvins.' };
    } else if (kind === 'Tfrom') {
      var lam = R.pick([290, 350, 400, 420, 450, 480, 500, 520, 550, 580, 600, 650, 700, 750, 800, 900, 1000, 1200, 1500, 2000]), T = WIEN / (lam * 1e-9);
      rec('modern.planck-blackbody', { kind: kind, lam: lam });
      p = { q: 'A star\'s spectrum peaks at $' + qu(lam, 'nm', 3) + '$. Treating it as a blackbody, what is its surface temperature?', a: num(T), unit: 'K',
        steps: ['$T = \\dfrac{2.898 \\times 10^{-3}\\ \\text{m·K}}{\\lambda_{\\max}} = \\dfrac{2.898 \\times 10^{-3}}{' + nx(lam * 1e-9, 3) + '}$.', '$T = ' + qu(T, 'K') + '$.'], hint: 'Solve Wien\'s law for $T$.' };
    } else if (kind === 'ratio') {
      var f = R.pick([1.5, 2, 3, 0.5, 1.2, 10]), what = R.pick(['power', 'peak']);
      rec('modern.planck-blackbody', { kind: kind, f: f, what: what });
      p = { q: 'A blackbody\'s absolute temperature is multiplied by ' + nx(f, 2) + ' (its size stays the same). By what factor does ' + (what === 'power' ? 'the total power it radiates' : 'the wavelength of its peak') + ' change?', a: num(what === 'power' ? M.pow(f, 4) : 1 / f, 0.01), unit: '×',
        steps: what === 'power' ? ['Stefan–Boltzmann: $P = \\sigma AT^4$, so $P \\propto T^4$.', 'Factor: $' + nx(f, 2) + '^4 = ' + nx(M.pow(f, 4), 4) + '$.'] : ['Wien: $\\lambda_{\\max} \\propto 1/T$.', 'Factor: $1/' + nx(f, 2) + ' = ' + nx(1 / f, 3) + '$.'],
        hint: what === 'power' ? 'Total power goes as the fourth power of $T$.' : 'The peak wavelength is inversely proportional to $T$.' };
    } else if (kind === 'power') {
      var A = R.pick([0.010, 0.050, 0.10, 0.50, 1.0, 2.0]), T2 = R.pick([300, 500, 800, 1000, 1500, 2000, 3000]), P = SIGMA * A * M.pow(T2, 4);
      rec('modern.planck-blackbody', { kind: kind, A: A, T: T2 });
      p = { q: 'A blackbody with surface area $' + qu(A, 'm²', 2) + '$ is at $' + qu(T2, 'K', 4) + '$. What total power does it radiate? ($\\sigma = 5.67 \\times 10^{-8}$ W/(m²·K⁴).)', a: num(P), unit: 'W',
        steps: ['$P = \\sigma AT^4 = (5.67 \\times 10^{-8})(' + nx(A, 2) + ')(' + nx(T2, 4) + ')^4$.', '$P = ' + qu(P, 'W') + '$.'], hint: 'Stefan–Boltzmann law with emissivity 1.' };
    } else if (kind === 'peakE') {
      var T3 = R.pick([3000, 4000, 5772, 6000, 8000, 10000]), lm3 = WIEN / T3, E3 = HC / (lm3 * 1e9);
      rec('modern.planck-blackbody', { kind: kind, T: T3 });
      p = { q: 'A blackbody is at $' + qu(T3, 'K', 4) + '$. What is the energy, in eV, of a photon at the peak wavelength of its spectrum? ($hc = 1240$ eV·nm.)', a: num(E3), unit: 'eV',
        steps: ['$\\lambda_{\\max} = \\dfrac{2.898 \\times 10^{-3}}{' + nx(T3, 4) + '} = ' + qu(lm3 * 1e9, 'nm') + '$.', '$E = \\dfrac{hc}{\\lambda} = \\dfrac{1240}{' + nx(lm3 * 1e9) + '} = ' + qu(E3, 'eV') + '$.'], hint: 'Find the peak wavelength first, then $E = hc/\\lambda$.' };
    } else {
      var T4 = R.pick([1000, 2000, 3000, 5000, 6000]), lam4 = R.pick([500, 1000, 2000, 5000, 10000]), hf = HC / lam4, kT = KBEV * T4, x = hf / kT, ratio = x / (M.exp(x) - 1), tries = 0;
      while ((x < 0.3 || x > 9) && tries < 30) { T4 = R.pick([1000, 2000, 3000, 5000, 6000]); lam4 = R.pick([500, 1000, 2000, 5000, 10000]); hf = HC / lam4; kT = KBEV * T4; x = hf / kT; ratio = x / (M.exp(x) - 1); tries++; }
      rec('modern.planck-blackbody', { kind: kind, T: T4, lam: lam4 });
      p = { q: 'In a cavity at $' + qu(T4, 'K', 4) + '$, what is the average energy of a radiation mode of wavelength $' + qu(lam4, 'nm', 3) + '$, as a fraction of the classical value $k_BT$? ($hc = 1240$ eV·nm, $k_B = 8.617 \\times 10^{-5}$ eV/K.)', a: num(ratio, 0.02), unit: '',
        steps: ['$hf = \\dfrac{1240}{' + nx(lam4, 3) + '} = ' + qu(hf, 'eV') + '$ and $k_BT = ' + qu(kT, 'eV') + '$, so $x = \\dfrac{hf}{k_BT} = ' + nx(x) + '$.', 'Planck: $\\dfrac{\\langle E\\rangle}{k_BT} = \\dfrac{x}{e^x - 1} = \\dfrac{' + nx(x) + '}{' + nx(M.exp(x) - 1) + '} = ' + nx(ratio) + '$.'],
        hint: 'Compare one energy step $hf$ with $k_BT$, then use $\\langle E\\rangle = hf/(e^{hf/k_BT} - 1)$.' };
    }
    return p;
  });

  G('modern.compton-formula', function (R, ctx) {
    var kind = R.pick(by(ctx, ['shift', 'shift'], ['lamPrime', 'theta', 'shift'], ['Ke', 'Eprime', 'theta']));
    var th = R.pick([30, 45, 60, 90, 120, 135, 150, 180]), l0 = R.pick([10, 20, 30, 50, 71, 100, 154]), dl = LCOMP * (1 - cosd(th)), p;
    if (kind === 'shift' || kind === 'lamPrime') {
      rec('modern.compton-formula', { kind: kind, th: th, l0: l0 });
      p = { q: (kind === 'shift' ? 'X-rays scatter from free electrons through $' + th + '^\\circ$. By how much does their wavelength increase?' : 'X-rays of wavelength $' + qu(l0, 'pm', 3) + '$ scatter from free electrons through $' + th + '^\\circ$. What is the scattered wavelength?'), a: num(kind === 'shift' ? dl : l0 + dl, 0.01), unit: 'pm',
        steps: ['$\\Delta\\lambda = \\dfrac{h}{m_ec}(1 - \\cos\\theta) = (2.426\\ \\text{pm})(1 - \\cos ' + th + '^\\circ)$.', '$\\Delta\\lambda = 2.426 \\times ' + nx(1 - cosd(th), 3) + ' = ' + qu(dl, 'pm') + '$.'].concat(kind === 'lamPrime' ? ['$\\lambda\' = ' + nx(l0, 3) + ' + ' + nx(dl) + ' = ' + qu(l0 + dl, 'pm', 4) + '$.'] : []),
        hint: 'The scale of the shift is the electron\'s Compton wavelength, 2.426 pm.' };
    } else if (kind === 'theta') {
      var dl2 = R.pick([0.50, 1.00, 1.50, 2.00, 2.43, 3.00, 3.50, 4.00, 4.50]), th2 = acosd(1 - dl2 / LCOMP);
      rec('modern.compton-formula', { kind: kind, dl: dl2 });
      p = { q: 'X-rays scattered from free electrons come out with wavelengths $' + qu(dl2, 'pm', 3) + '$ longer than they went in. Through what angle were they scattered?', a: num(th2), unit: '°',
        steps: ['$1 - \\cos\\theta = \\dfrac{\\Delta\\lambda}{h/m_ec} = \\dfrac{' + nx(dl2, 3) + '}{2.426} = ' + nx(dl2 / LCOMP) + '$.', '$\\cos\\theta = ' + nx(1 - dl2 / LCOMP) + '$, so $\\theta = ' + deg(th2) + '$.'], hint: 'Solve the Compton formula for $\\cos\\theta$.' };
    } else {
      var lp = l0 + dl, E0 = 1.240e3 / l0, E1 = 1.240e3 / lp; // keV with λ in pm: hc = 1240 keV·pm
      rec('modern.compton-formula', { kind: kind, th: th, l0: l0 });
      if (kind === 'Eprime') p = { q: 'A photon of wavelength $' + qu(l0, 'pm', 3) + '$ scatters from a free electron through $' + th + '^\\circ$. What is the scattered photon\'s energy, in keV? ($hc = 1240$ keV·pm.)', a: num(E1, 0.01), unit: 'keV',
        steps: ['$\\Delta\\lambda = 2.426(1 - \\cos ' + th + '^\\circ) = ' + qu(dl, 'pm') + '$, so $\\lambda\' = ' + qu(lp, 'pm', 4) + '$.', '$E\' = \\dfrac{1240\\ \\text{keV·pm}}{' + nx(lp, 4) + '\\ \\text{pm}} = ' + qu(E1, 'keV', 4) + '$.'], hint: 'Find the new wavelength, then $E = hc/\\lambda$.' };
      else p = { q: 'A photon of wavelength $' + qu(l0, 'pm', 3) + '$ scatters from a free electron through $' + th + '^\\circ$. How much kinetic energy does the electron gain, in keV? ($hc = 1240$ keV·pm.)', a: num(E0 - E1, 0.02), unit: 'keV',
        steps: ['$\\lambda\' = ' + nx(l0, 3) + ' + 2.426(1 - \\cos ' + th + '^\\circ) = ' + qu(lp, 'pm', 4) + '$.', 'Photon energies: $\\dfrac{1240}{' + nx(l0, 3) + '} = ' + qu(E0, 'keV', 4) + '$ before, $\\dfrac{1240}{' + nx(lp, 4) + '} = ' + qu(E1, 'keV', 4) + '$ after.', 'Energy conservation: $K_e = ' + nx(E0, 4) + ' - ' + nx(E1, 4) + ' = ' + qu(E0 - E1, 'keV') + '$.'], hint: 'The electron gets the energy the photon lost.' };
    }
    return p;
  });

  G('modern.bohr-hydrogen', function (R, ctx) {
    var kind = R.pick(by(ctx, ['E', 'r', 'nFrom', 'KU'], ['ionize', 'between', 'speed', 'nFrom', 'KU'], ['ion', 'ionR', 'between', 'debroglie']));
    if (kind === 'KU' || kind === 'debroglie') {
      var nk = R.pick([1, 2, 3, 4, 5, 6, 7, 8]), which = R.pick(['K', 'U']);
      rec('modern.bohr-hydrogen', { kind: kind, n: nk, which: which });
      if (kind === 'debroglie') return { q: 'In the Bohr model, how long is the electron\'s de Broglie wavelength in hydrogen\'s $n = ' + nk + '$ orbit? ($a_0 = 0.0529$ nm.)', a: num(2 * PI * nk * A0), unit: 'nm',
        steps: ['Bohr\'s rule $m_evr = n\\hbar$ with $\\lambda = h/m_ev$ says $n\\lambda = 2\\pi r_n$: $n$ wavelengths fit around the orbit.', '$\\lambda = \\dfrac{2\\pi r_n}{n} = \\dfrac{2\\pi n^2a_0}{n} = 2\\pi(' + nk + ')(0.0529) = ' + qu(2 * PI * nk * A0, 'nm') + '$.'], hint: 'A whole number of wavelengths fits around the orbit.' };
      return { q: 'In the Bohr model, what is the electron\'s ' + (which === 'K' ? 'kinetic energy' : 'electric potential energy') + ' in hydrogen\'s $n = ' + nk + '$ level?', a: num(which === 'K' ? 13.6 / (nk * nk) : -27.2 / (nk * nk)), unit: 'eV',
        steps: ['For a circular Coulomb orbit, $K = \\dfrac{ke^2}{2r}$ and $U = -\\dfrac{ke^2}{r}$, so $K = -E$ and $U = 2E$.', '$E_{' + nk + '} = ' + qu(-13.6 / (nk * nk), 'eV') + '$, so ' + (which === 'K' ? '$K = ' + qu(13.6 / (nk * nk), 'eV') + '$.' : '$U = ' + qu(-27.2 / (nk * nk), 'eV') + '$.')], hint: 'In a Coulomb orbit, $K = \\frac{1}{2}|U|$ and $E = K + U$.' };
    }
    if (kind === 'nFrom') {
      var nq = R.pick([2, 3, 4, 5, 6, 7, 8]), Eq = rnd(-13.6 / (nq * nq), 3);
      rec('modern.bohr-hydrogen', { kind: kind, E: Eq });
      return { q: 'A hydrogen atom has energy $' + qu(Eq, 'eV', 3) + '$. Which level $n$ is its electron in?', a: exact(nq),
        steps: ['$E_n = -\\dfrac{13.6}{n^2}$, so $n^2 = \\dfrac{13.6}{' + nx(-Eq, 3) + '} = ' + nx(13.6 / -Eq, 3) + '$.', '$n = ' + nq + '$.'], hint: 'Solve $-13.6/n^2 = E$ for $n$.' };
    }
    var n = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20]), p;
    if (kind === 'E' || kind === 'r') {
      rec('modern.bohr-hydrogen', { kind: kind, n: n });
      p = kind === 'E' ? { q: 'What is the energy of hydrogen\'s $n = ' + n + '$ level?', a: num(-13.6 / (n * n)), unit: 'eV', steps: ['$E_n = -\\dfrac{13.6\\ \\text{eV}}{n^2} = -\\dfrac{13.6}{' + n * n + '} = ' + qu(-13.6 / (n * n), 'eV') + '$.'], hint: 'The levels are $-13.6\\ \\text{eV}/n^2$: negative, rising toward 0.' }
        : { q: 'In the Bohr model, what is the radius of hydrogen\'s $n = ' + n + '$ orbit? ($a_0 = 0.0529$ nm.)', a: num(n * n * A0), unit: 'nm', steps: ['$r_n = n^2a_0 = ' + n * n + ' \\times 0.0529\\ \\text{nm} = ' + qu(n * n * A0, 'nm') + '$.'], hint: 'Radii grow as $n^2$.' };
    } else if (kind === 'ionize') {
      rec('modern.bohr-hydrogen', { kind: kind, n: n });
      p = { q: 'How much energy does it take to ionize a hydrogen atom that starts in its $n = ' + n + '$ state?', a: num(13.6 / (n * n)), unit: 'eV',
        steps: ['$E_{' + n + '} = -\\dfrac{13.6}{' + n * n + '} = ' + qu(-13.6 / (n * n), 'eV') + '$.', 'Ionized means $E = 0$ (the electron just free): needed $0 - (' + nx(-13.6 / (n * n)) + ') = ' + qu(13.6 / (n * n), 'eV') + '$.'], hint: 'Raise the electron from its level to $E = 0$.' };
    } else if (kind === 'between') {
      var n1 = R.pick([1, 2, 3, 4]), n2 = n1 + R.pick([1, 2, 3, 4, 5]), dE = 13.6 * (1 / (n1 * n1) - 1 / (n2 * n2));
      rec('modern.bohr-hydrogen', { kind: kind, n1: n1, n2: n2 });
      p = { q: 'How much energy must a hydrogen atom absorb to move its electron from $n = ' + n1 + '$ to $n = ' + n2 + '$?', a: num(dE), unit: 'eV',
        steps: ['$E_{' + n1 + '} = ' + qu(-13.6 / (n1 * n1), 'eV') + '$ and $E_{' + n2 + '} = ' + qu(-13.6 / (n2 * n2), 'eV') + '$.', '$\\Delta E = E_{' + n2 + '} - E_{' + n1 + '} = ' + qu(dE, 'eV') + '$.'], hint: 'Subtract the lower level from the higher one.' };
    } else if (kind === 'speed') {
      var v = 2.188e6 / n;
      rec('modern.bohr-hydrogen', { kind: kind, n: n });
      p = { q: 'In the Bohr model, the electron in hydrogen\'s ground state moves at $2.19 \\times 10^6$ m/s, and $m_evr = n\\hbar$ with $r = n^2a_0$. How fast does it move in the $n = ' + n + '$ orbit?', a: num(v), unit: 'm/s',
        steps: ['$v = \\dfrac{n\\hbar}{m_er_n} = \\dfrac{n\\hbar}{m_en^2a_0} = \\dfrac{v_1}{n}$.', '$v_{' + n + '} = \\dfrac{2.19 \\times 10^6}{' + n + '} = ' + qu(v, 'm/s') + '$.'], hint: 'Combine $m_evr = n\\hbar$ with $r = n^2a_0$.' };
    } else {
      var ion = R.pick([['He$^+$', 2], ['Li$^{2+}$', 3], ['Be$^{3+}$', 4], ['B$^{4+}$', 5], ['C$^{5+}$', 6]]), Z = ion[1], nn = R.pick([1, 2, 3, 4]);
      rec('modern.bohr-hydrogen', { kind: kind, Z: Z, n: nn });
      if (kind === 'ion') p = { q: 'The ion ' + ion[0] + ' has one electron and nuclear charge $Z = ' + Z + '$. What is the energy of its $n = ' + nn + '$ level?', a: num(-13.6 * Z * Z / (nn * nn)), unit: 'eV',
        steps: ['For one electron around charge $Ze$: $E_n = -\\dfrac{13.6\\ \\text{eV}\\cdot Z^2}{n^2}$ (the Coulomb force is $Z$ times stronger, and the orbit $Z$ times smaller).', '$E_{' + nn + '} = -\\dfrac{13.6 \\times ' + Z * Z + '}{' + nn * nn + '} = ' + qu(-13.6 * Z * Z / (nn * nn), 'eV') + '$.'], hint: 'Energies scale as $Z^2$.' };
      else p = { q: 'The ion ' + ion[0] + ' has one electron and nuclear charge $Z = ' + Z + '$. In the Bohr model, what is the radius of its $n = ' + nn + '$ orbit? ($a_0 = 0.0529$ nm.)', a: num(nn * nn * A0 / Z), unit: 'nm',
        steps: ['$r_n = \\dfrac{n^2}{Z}a_0$: the stronger pull draws the electron in.', '$r_{' + nn + '} = \\dfrac{' + nn * nn + '}{' + Z + '}(0.0529) = ' + qu(nn * nn * A0 / Z, 'nm') + '$.'], hint: 'Radii scale as $n^2/Z$.' };
    }
    return p;
  });

  G('modern.hydrogen-series', function (R, ctx) {
    var kind = R.pick(by(ctx, ['lam', 'lam', 'photonE'], ['limit', 'identify', 'lines', 'lam'], ['series', 'longest', 'identify']));
    var nf = R.pick([1, 2, 3]), ni = nf + R.pick([1, 2, 3, 4, 5, 6]), SER = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen' }, p;
    var inv = function (a, b) { return RH * (1 / (a * a) - 1 / (b * b)); };
    if (kind === 'photonE') {
      var Eph = 13.6 * (1 / (nf * nf) - 1 / (ni * ni));
      rec('modern.hydrogen-series', { kind: kind, nf: nf, ni: ni });
      return { q: 'What energy, in eV, does the photon carry when a hydrogen atom drops from $n = ' + ni + '$ to $n = ' + nf + '$?', a: num(Eph), unit: 'eV',
        steps: ['$E = 13.6\\ \\text{eV}\\left(\\dfrac{1}{' + nf * nf + '} - \\dfrac{1}{' + ni * ni + '}\\right) = 13.6 \\times ' + nx(1 / (nf * nf) - 1 / (ni * ni), 4) + '$.', '$E = ' + qu(Eph, 'eV') + '$ (' + SER[nf] + ' series).'], hint: 'The photon carries the energy difference between the two levels.' };
    }
    if (kind === 'lam') {
      var l = 1e9 / inv(nf, ni);
      rec('modern.hydrogen-series', { kind: kind, nf: nf, ni: ni });
      p = { q: 'Find the wavelength of the photon emitted when a hydrogen atom drops from $n = ' + ni + '$ to $n = ' + nf + '$. ($R_H = 1.097 \\times 10^7$ m⁻¹.)', a: num(l), unit: 'nm',
        steps: ['$\\dfrac{1}{\\lambda} = R_H\\left(\\dfrac{1}{' + nf * nf + '} - \\dfrac{1}{' + ni * ni + '}\\right) = (1.097 \\times 10^7)(' + nx(1 / (nf * nf) - 1 / (ni * ni), 4) + ') = ' + qu(inv(nf, ni), 'm⁻¹') + '$.', '$\\lambda = ' + qu(l * 1e-9, 'm') + ' = ' + qu(l, 'nm') + '$ (' + SER[nf] + ' series).'], hint: 'The lower level goes first in the bracket.' };
    } else if (kind === 'limit' || kind === 'longest') {
      var lam = kind === 'limit' ? 1e9 / (RH / (nf * nf)) : 1e9 / inv(nf, nf + 1);
      rec('modern.hydrogen-series', { kind: kind, nf: nf });
      p = { q: 'What is the ' + (kind === 'limit' ? 'shortest' : 'longest') + ' wavelength in hydrogen\'s ' + SER[nf] + ' series ($n_f = ' + nf + '$)? ($R_H = 1.097 \\times 10^7$ m⁻¹.)', a: num(lam), unit: 'nm',
        steps: kind === 'limit' ? ['The shortest wavelength (the series limit) comes from the biggest jump, $n_i \\to \\infty$.', '$\\dfrac{1}{\\lambda} = \\dfrac{R_H}{' + nf * nf + '}$, so $\\lambda = \\dfrac{' + nf * nf + '}{1.097 \\times 10^7} = ' + qu(lam, 'nm') + '$.'] : ['The longest wavelength comes from the smallest jump, $n_i = ' + (nf + 1) + '$.', '$\\dfrac{1}{\\lambda} = R_H\\left(\\dfrac{1}{' + nf * nf + '} - \\dfrac{1}{' + (nf + 1) * (nf + 1) + '}\\right)$, so $\\lambda = ' + qu(lam, 'nm') + '$.'],
        hint: kind === 'limit' ? 'Let $n_i$ go to infinity.' : 'Use the smallest possible jump into $n_f$.' };
    } else if (kind === 'identify') {
      var lamI = rnd(1e9 / inv(nf, ni), 4);
      rec('modern.hydrogen-series', { kind: kind, nf: nf, ni: ni });
      p = { q: 'A hydrogen line in the ' + SER[nf] + ' series ($n_f = ' + nf + '$) is measured at $' + qu(lamI, 'nm', 4) + '$. From which level $n_i$ did the electron fall? ($R_H = 1.097 \\times 10^7$ m⁻¹.)', a: exact(ni),
        steps: ['$\\dfrac{1}{\\lambda R_H} = \\dfrac{1}{(' + nx(lamI * 1e-9, 4) + ')(1.097 \\times 10^7)} = ' + nx(1e9 / (lamI * RH), 4) + '$.', '$\\dfrac{1}{' + nf * nf + '} - \\dfrac{1}{n_i^2} = ' + nx(1e9 / (lamI * RH), 4) + '$, so $\\dfrac{1}{n_i^2} = ' + nx(1 / (nf * nf) - 1e9 / (lamI * RH), 3) + '$.', '$n_i^2 = ' + nx(1 / (1 / (nf * nf) - 1e9 / (lamI * RH)), 3) + '$, so $n_i = ' + ni + '$.'],
        hint: 'Solve the Rydberg formula for $1/n_i^2$.' };
    } else if (kind === 'lines') {
      var top = R.pick([3, 4, 5, 6, 7, 8, 9, 10]);
      rec('modern.hydrogen-series', { kind: kind, top: top });
      p = { q: 'Hydrogen atoms are excited up to the $n = ' + top + '$ level. As they drop back down by every possible route, how many different spectral lines can appear?', a: exact(top * (top - 1) / 2),
        steps: ['Each line is one pair of levels (upper, lower) among $n = 1$ to $' + top + '$.', 'Number of pairs: $\\dfrac{' + top + ' \\times ' + (top - 1) + '}{2} = ' + top * (top - 1) / 2 + '$.'], hint: 'Count pairs of levels.' };
    } else {
      var l2 = 1e9 / inv(nf, ni);
      rec('modern.hydrogen-series', { kind: kind, nf: nf, ni: ni });
      p = { q: 'A hydrogen emission line is observed at $' + qu(rnd(l2, 4), 'nm', 4) + '$. Which series does it belong to?', a: mc(SER[nf] + ' (ending at $n = ' + nf + '$)', [1, 2, 3].filter(function (k) { return k !== nf; }).map(function (k) { return SER[k] + ' (ending at $n = ' + k + '$)'; }).concat(['Brackett (ending at $n = 4$)'])),
        steps: ['Series limits: Lyman 91.2 nm (lines 91–122 nm, UV), Balmer 364.6 nm (365–656 nm), Paschen 820.4 nm (820–1875 nm, IR).', 'A line at $' + nx(l2, 4) + '$ nm falls in the ' + SER[nf] + ' range ($' + ni + ' \\to ' + nf + '$).'],
        hint: 'Each series covers its own range of wavelengths, set by the level it ends on.' };
    }
    return p;
  });

  G('modern.uncertainty-principle', function (R, ctx) {
    var kind = R.pick(by(ctx, ['dp', 'dv'], ['dx', 'dE', 'dv'], ['nucleus', 'dE', 'dx']));
    var p;
    if (kind === 'dp' || kind === 'dv') {
      var dx = R.pick([0.020, 0.050, 0.080, 0.10, 0.15, 0.20, 0.25, 0.30, 0.50, 0.75, 1.0, 2.0, 5.0, 10, 50]) * 1e-9, dp = HBAR / (2 * dx);
      rec('modern.uncertainty-principle', { kind: kind, dx: dx });
      var who = R.pick(['A particle', 'An atom', 'A molecule', 'An electron']);
      if (kind === 'dp') p = { q: who + ' is confined to a region $' + qu(dx * 1e9, 'nm', 2) + '$ wide ($\\Delta x$). What is the smallest possible spread in its momentum, $\\Delta p$?', a: num(dp), unit: 'kg·m/s',
        steps: ['$\\Delta p \\ge \\dfrac{\\hbar}{2\\Delta x} = \\dfrac{1.055 \\times 10^{-34}}{2(' + nx(dx, 2) + ')}$.', '$\\Delta p = ' + qu(dp, 'kg·m/s') + '$.'], hint: '$\\Delta x\\,\\Delta p \\ge \\hbar/2$.' };
      else p = { q: 'An electron ($m = 9.11 \\times 10^{-31}$ kg) is confined to a region $' + qu(dx * 1e9, 'nm', 2) + '$ wide. What is the smallest possible spread in its velocity?', a: num(dp / ME), unit: 'm/s',
        steps: ['$\\Delta p \\ge \\dfrac{\\hbar}{2\\Delta x} = ' + qu(dp, 'kg·m/s') + '$.', '$\\Delta v = \\dfrac{\\Delta p}{m} = \\dfrac{' + nx(dp) + '}{9.11 \\times 10^{-31}} = ' + qu(dp / ME, 'm/s') + '$.'], hint: 'Find $\\Delta p$, then divide by the mass.' };
    } else if (kind === 'dx') {
      var obj = R.pick([['An electron', ME, R.pick([1.0e3, 2.0e3, 5.0e3, 1.0e4, 2.0e4, 5.0e4, 1.0e5, 5.0e5])], ['A proton', MP, R.pick([1.0, 5.0, 10, 20, 50, 100, 1.0e3])], ['A neutron', 1.675e-27, R.pick([2.0, 10, 50, 200])], ['A dust grain of mass $1.0 \\times 10^{-15}$ kg', 1.0e-15, R.pick([1.0e-3, 1.0e-6, 1.0e-9])]]), dxm = HBAR / (2 * obj[1] * obj[2]);
      rec('modern.uncertainty-principle', { kind: kind, m: obj[1], dv: obj[2] });
      p = { q: obj[0] + '\'s velocity is known to within $' + qu(obj[2], 'm/s', 2) + '$. What is the smallest possible spread in its position?', a: num(dxm), unit: 'm',
        steps: ['$\\Delta p = m\\Delta v = ' + qu(obj[1] * obj[2], 'kg·m/s') + '$.', '$\\Delta x \\ge \\dfrac{\\hbar}{2\\Delta p} = \\dfrac{1.055 \\times 10^{-34}}{2(' + nx(obj[1] * obj[2]) + ')} = ' + qu(dxm, 'm') + '$.'], hint: 'Turn the velocity spread into a momentum spread first.' };
    } else if (kind === 'dE') {
      var tau = R.pick([0.50, 1.0, 1.6, 2.0, 3.0, 5.0, 8.0, 10, 16, 20, 26, 50, 100, 1000]) * 1e-9, dE = HBAR / (2 * tau) / QE;
      rec('modern.uncertainty-principle', { kind: kind, tau: tau });
      p = { q: 'An excited state lives about $' + qu(tau * 1e9, 'ns', 2) + '$. Estimate the smallest spread in the energy of the photons it emits, in eV, using $\\Delta E\\,\\Delta t \\ge \\hbar/2$.', a: num(dE), unit: 'eV',
        steps: ['$\\Delta E \\ge \\dfrac{\\hbar}{2\\Delta t} = \\dfrac{1.055 \\times 10^{-34}}{2(' + nx(tau, 2) + ')} = ' + qu(dE * QE, 'J') + '$.', 'In eV: $\\dfrac{' + nx(dE * QE) + '}{1.602 \\times 10^{-19}} = ' + qu(dE, 'eV') + '$.'], hint: 'The lifetime plays the role of $\\Delta t$.' };
    } else {
      var Lf = R.pick([2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 10, 12, 15]), pc = HBARC * 1e-6 * 1e6 / (2 * Lf), Kn = pc * pc / (2 * MPC2); // ħc = 197.3 MeV·fm
      rec('modern.uncertainty-principle', { kind: kind, L: Lf });
      p = { q: 'A proton ($mc^2 = 938.3$ MeV) is confined in a nucleus to $\\Delta x = ' + qu(Lf, 'fm', 2) + '$. Taking its momentum to be about $\\Delta p = \\hbar/(2\\Delta x)$, estimate its kinetic energy in MeV. ($\\hbar c = 197.3$ MeV·fm.)', a: num(Kn, 0.02), unit: 'MeV',
        steps: ['$pc \\approx \\dfrac{\\hbar c}{2\\Delta x} = \\dfrac{197.3}{2(' + nx(Lf, 2) + ')} = ' + qu(pc, 'MeV') + '$.', 'This is much less than $mc^2$, so $K \\approx \\dfrac{(pc)^2}{2mc^2} = \\dfrac{' + nx(pc) + '^2}{2(938.3)} = ' + qu(Kn, 'MeV') + '$.'],
        hint: 'Work in MeV and fm with $\\hbar c$; then use $K = p^2/2m$.' };
    }
    return p;
  });

  G('modern.wavefunction-probability', function (R, ctx) {
    var kind = R.pick(by(ctx, ['uniform', 'uniformA'], ['box', 'expA', 'expP'], ['box', 'poly', 'expP']));
    var p;
    if (kind === 'uniform' || kind === 'uniformA') {
      var L = R.pick([0.50, 1.0, 2.0, 4.0, 5.0]), a = rnd(L * R.pick([0.1, 0.2, 0.25, 0.3, 0.4]), 3), b = rnd(L * R.pick([0.5, 0.6, 0.75, 0.8, 0.9]), 3);
      rec('modern.wavefunction-probability', { kind: kind, L: L, a: a, b: b });
      if (kind === 'uniform') p = { q: 'A particle\'s wave function is $\\psi = A$ (a constant) for $0 < x < ' + qu(L, 'nm', 2) + '$ and zero elsewhere. What is the probability of finding it between $x = ' + qu(a, 'nm', 3) + '$ and $x = ' + qu(b, 'nm', 3) + '$?', a: num((b - a) / L, 0.01), unit: '',
        steps: ['Normalize: $\\int_0^L A^2\\,dx = A^2L = 1$, so $A^2 = \\dfrac{1}{L}$.', '$P = \\int_a^b \\dfrac{1}{L}\\,dx = \\dfrac{b - a}{L} = \\dfrac{' + nx(b - a, 3) + '}{' + nx(L, 2) + '} = ' + nx((b - a) / L, 3) + '$.'], hint: 'A uniform density spreads the probability evenly over the region.' };
      else p = { q: 'A particle\'s wave function is $\\psi = A$ for $0 < x < ' + qu(L, 'nm', 2) + '$ and zero elsewhere. Find $A^2$ (in nm⁻¹) so that $\\psi$ is normalized.', a: num(1 / L, 0.01), unit: 'nm⁻¹',
        steps: ['$\\int_0^L |\\psi|^2\\,dx = A^2L = 1$.', '$A^2 = \\dfrac{1}{' + nx(L, 2) + '\\ \\text{nm}} = ' + qu(1 / L, 'nm⁻¹') + '$.'], hint: 'The total probability over the region must be 1.' };
    } else if (kind === 'box') {
      var n = by(ctx, 1, R.pick([1, 2]), R.pick([1, 2, 3])), fr = R.pick([[0, 0.25], [0, 1 / 3], [0.25, 0.75], [0, 0.5], [1 / 3, 2 / 3], [0.4, 0.6], [0, 0.1], [0.5, 0.75]]);
      var F = function (u) { return u - M.sin(2 * PI * n * u) / (2 * PI * n); }, P = F(fr[1]) - F(fr[0]);
      var ft = function (u) { return u === 0 ? '0' : u === 0.5 ? 'L/2' : u === 0.25 ? 'L/4' : u === 0.75 ? '3L/4' : M.abs(u - 1 / 3) < 1e-9 ? 'L/3' : M.abs(u - 2 / 3) < 1e-9 ? '2L/3' : nx(u, 1) + 'L'; };
      rec('modern.wavefunction-probability', { kind: kind, n: n, a: fr[0], b: fr[1] });
      p = { q: 'A particle in a box ($0 < x < L$) is in the state $\\psi_' + n + ' = \\sqrt{2/L}\\,\\sin(' + (n === 1 ? '' : n) + '\\pi x/L)$. What is the probability of finding it between $x = ' + ft(fr[0]) + '$ and $x = ' + ft(fr[1]) + '$?', a: num(P, 0.02), unit: '',
        steps: ['$P = \\dfrac{2}{L}\\int \\sin^2\\dfrac{' + (n === 1 ? '' : n) + '\\pi x}{L}\\,dx$; with $u = x/L$ and $\\sin^2\\theta = \\tfrac{1}{2}(1 - \\cos 2\\theta)$, the antiderivative is $u - \\dfrac{\\sin(' + 2 * n + '\\pi u)}{' + 2 * n + '\\pi}$.', 'Evaluate from $u = ' + nx(fr[0], 3) + '$ to $u = ' + nx(fr[1], 3) + '$: $' + nx(F(fr[1]), 4) + ' - ' + nx(F(fr[0]), 4) + ' = ' + nx(P, 3) + '$.'],
        hint: 'Integrate $|\\psi|^2$, not $\\psi$, using $\\sin^2\\theta = \\tfrac{1}{2}(1 - \\cos 2\\theta)$.' };
    } else if (kind === 'expA' || kind === 'expP') {
      var a2 = R.pick([0.10, 0.20, 0.25, 0.50, 1.0]), b2 = rnd(a2 * R.pick([0.25, 0.5, 1, 1.5, 2]), 3);
      rec('modern.wavefunction-probability', { kind: kind, a: a2, b: b2 });
      if (kind === 'expA') p = { q: 'A wave function is $\\psi = Ae^{-x/a}$ for $x \\ge 0$ (and zero for $x < 0$), with $a = ' + qu(a2, 'nm', 2) + '$. Find $A^2$, in nm⁻¹, so that it is normalized.', a: num(2 / a2, 0.01), unit: 'nm⁻¹',
        steps: ['$\\int_0^\\infty A^2e^{-2x/a}\\,dx = A^2\\,\\dfrac{a}{2} = 1$.', '$A^2 = \\dfrac{2}{a} = \\dfrac{2}{' + nx(a2, 2) + '} = ' + qu(2 / a2, 'nm⁻¹') + '$.'], hint: 'Square $\\psi$ first: $|\\psi|^2 = A^2e^{-2x/a}$.' };
      else p = { q: 'A normalized wave function is $\\psi = \\sqrt{2/a}\\,e^{-x/a}$ for $x \\ge 0$, with $a = ' + qu(a2, 'nm', 2) + '$. What is the probability of finding the particle between $x = 0$ and $x = ' + qu(b2, 'nm', 3) + '$?', a: num(1 - M.exp(-2 * b2 / a2), 0.01), unit: '',
        steps: ['$P = \\int_0^b \\dfrac{2}{a}e^{-2x/a}\\,dx = 1 - e^{-2b/a}$.', '$\\dfrac{2b}{a} = ' + nx(2 * b2 / a2, 3) + '$, so $P = 1 - e^{-' + nx(2 * b2 / a2, 3) + '} = ' + nx(1 - M.exp(-2 * b2 / a2), 3) + '$.'], hint: 'Integrate $|\\psi|^2 = \\frac{2}{a}e^{-2x/a}$.' };
    } else {
      var L3 = R.pick([0.50, 1.0, 2.0]);
      rec('modern.wavefunction-probability', { kind: kind, L: L3 });
      p = { q: 'Find $A^2$ so that $\\psi = A\\,x(L - x)$ on $0 < x < L$ (zero elsewhere) is normalized, for $L = ' + qu(L3, 'nm', 2) + '$. Give $A^2$ in nm⁻⁵.', a: num(30 / M.pow(L3, 5), 0.01), unit: 'nm⁻⁵',
        steps: ['$\\int_0^L x^2(L - x)^2\\,dx = \\int_0^L (L^2x^2 - 2Lx^3 + x^4)\\,dx = \\dfrac{L^5}{3} - \\dfrac{L^5}{2} + \\dfrac{L^5}{5} = \\dfrac{L^5}{30}$.', '$A^2\\,\\dfrac{L^5}{30} = 1$, so $A^2 = \\dfrac{30}{L^5} = \\dfrac{30}{' + nx(L3, 2) + '^5} = ' + qu(30 / M.pow(L3, 5), 'nm⁻⁵') + '$.'], hint: 'Expand $x^2(L - x)^2$ and integrate term by term.' };
    }
    return p;
  });

  G('modern.schrodinger-equation', function (R, ctx) {
    var kind = R.pick(by(ctx, ['Efree', 'Efree'], ['kappa', 'Efromkappa', 'Ebox'], ['gauss', 'which', 'kappa']));
    var p;
    if (kind === 'Efree') {
      var k = R.pick([2.0, 4.0, 5.0, 8.0, 10, 12, 15, 20]), E = HB2M * k * k;
      rec('modern.schrodinger-equation', { kind: kind, k: k });
      p = { q: 'In a region where $U = 0$, an electron has the wave function $\\psi = A\\sin(kx)$ with $k = ' + qu(k, 'nm⁻¹', 2) + '$. What is its energy? ($\\hbar^2/2m_e = 0.0381$ eV·nm².)', a: num(E), unit: 'eV',
        steps: ['$\\psi\'\' = -k^2\\psi$, so $-\\dfrac{\\hbar^2}{2m}\\psi\'\' = \\dfrac{\\hbar^2k^2}{2m}\\psi$, and the equation holds with $E = \\dfrac{\\hbar^2k^2}{2m}$.', '$E = 0.0381 \\times ' + nx(k, 2) + '^2 = ' + qu(E, 'eV') + '$.'], hint: 'Differentiate twice and compare with $E\\psi$.' };
    } else if (kind === 'kappa' || kind === 'Efromkappa') {
      var U0 = R.pick([2.0, 4.0, 5.0, 6.0, 8.0, 10]), Ee = rnd(U0 * R.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75]), 3), kap = M.sqrt((U0 - Ee) / HB2M);
      if (kind === 'kappa') {
        rec('modern.schrodinger-equation', { kind: kind, U0: U0, E: Ee });
        p = { q: 'An electron with $E = ' + qu(Ee, 'eV', 3) + '$ is in a region where $U = ' + qu(U0, 'eV', 2) + '$. There its wave function is $\\psi = Ae^{-\\kappa x}$. Find $\\kappa$. ($\\hbar^2/2m_e = 0.0381$ eV·nm².)', a: num(kap), unit: 'nm⁻¹',
          steps: ['$\\psi\'\' = \\kappa^2\\psi$, so the equation reads $-\\dfrac{\\hbar^2\\kappa^2}{2m} + U = E$.', '$\\kappa^2 = \\dfrac{U - E}{\\hbar^2/2m} = \\dfrac{' + nx(U0 - Ee, 3) + '}{0.0381} = ' + qu(kap * kap, 'nm⁻²') + '$.', '$\\kappa = ' + qu(kap, 'nm⁻¹') + '$.'], hint: 'Put $e^{-\\kappa x}$ into the equation; the second derivative brings out $+\\kappa^2$.' };
      } else {
        var kq = R.pick([3.0, 4.0, 5.0, 6.0, 8.0]), Uq = R.pick([3.0, 4.0, 5.0, 6.0]), Eq = Uq - HB2M * kq * kq;
        if (Eq <= 0.1) { kq = 4.0; Uq = 5.0; Eq = Uq - HB2M * 16; }
        rec('modern.schrodinger-equation', { kind: kind, k: kq, U0: Uq });
        p = { q: 'Inside a barrier where $U = ' + qu(Uq, 'eV', 2) + '$, an electron\'s wave function is $\\psi = Ae^{-\\kappa x}$ with $\\kappa = ' + qu(kq, 'nm⁻¹', 2) + '$. What is the electron\'s energy? ($\\hbar^2/2m_e = 0.0381$ eV·nm².)', a: num(Eq), unit: 'eV',
          steps: ['The equation gives $E = U - \\dfrac{\\hbar^2\\kappa^2}{2m}$.', '$E = ' + nx(Uq, 2) + ' - 0.0381 \\times ' + nx(kq, 2) + '^2 = ' + nx(Uq, 2) + ' - ' + nx(HB2M * kq * kq) + ' = ' + qu(Eq, 'eV') + '$.'], hint: 'In a forbidden region, the second-derivative term lowers the energy below $U$.' };
      }
    } else if (kind === 'Ebox') {
      var L = R.pick([0.20, 0.25, 0.40, 0.50, 1.0]), n = R.pick([1, 2, 3]), kb = n * PI / L, Eb = HB2M * kb * kb;
      rec('modern.schrodinger-equation', { kind: kind, L: L, n: n });
      p = { q: 'An electron between hard walls at $x = 0$ and $x = ' + qu(L, 'nm', 2) + '$ ($U = 0$ between them) has $\\psi = A\\sin(kx)$, with the smallest $k$ that ' + (n === 1 ? '' : 'has ' + (n - 1) + ' zero' + (n > 2 ? 's' : '') + ' between the walls and ') + 'meets the boundary conditions. Find its energy. ($\\hbar^2/2m_e = 0.0381$ eV·nm².)', a: num(Eb), unit: 'eV',
        steps: ['$\\psi(L) = 0$ needs $kL = n\\pi$; here $n = ' + n + '$, so $k = \\dfrac{' + (n === 1 ? '' : n) + '\\pi}{' + nx(L, 2) + '} = ' + qu(kb, 'nm⁻¹') + '$.', '$E = \\dfrac{\\hbar^2k^2}{2m} = 0.0381 \\times ' + nx(kb) + '^2 = ' + qu(Eb, 'eV') + '$.'], hint: 'The boundary condition picks out $k$; then $E = \\hbar^2k^2/2m$.' };
    } else if (kind === 'gauss') {
      var b = R.pick([0.050, 0.10, 0.20, 0.30]), Eg = HB2M / (b * b);
      rec('modern.schrodinger-equation', { kind: kind, b: b });
      p = { q: 'The function $\\psi = e^{-x^2/2b^2}$ with $b = ' + qu(b, 'nm', 2) + '$ solves the Schrödinger equation for an electron in the potential $U = \\dfrac{\\hbar^2x^2}{2m_eb^4}$ (a harmonic oscillator). Find its energy. ($\\hbar^2/2m_e = 0.0381$ eV·nm².)', a: num(Eg), unit: 'eV',
        steps: ['$\\psi\'\' = \\left(\\dfrac{x^2}{b^4} - \\dfrac{1}{b^2}\\right)\\psi$.', '$-\\dfrac{\\hbar^2}{2m}\\psi\'\' + U\\psi = \\left(\\dfrac{\\hbar^2}{2mb^2} - \\dfrac{\\hbar^2x^2}{2mb^4} + \\dfrac{\\hbar^2x^2}{2mb^4}\\right)\\psi = \\dfrac{\\hbar^2}{2mb^2}\\psi$.', '$E = \\dfrac{0.0381}{' + nx(b, 2) + '^2} = ' + qu(Eg, 'eV') + '$.'], hint: 'Differentiate the Gaussian twice; the $x^2$ terms cancel with $U$.' };
    } else {
      var sets = R.pick([
        ['A particle is in a box with hard walls at $x = 0$ and $x = L$ ($U = 0$ inside). Which function is an allowed energy state?', '$\\sin(2\\pi x/L)$', ['$\\cos(\\pi x/L)$', '$x(L - x)$', '$\\sin(\\pi x/2L)$']],
        ['In a region with $U = 0$, which function solves the Schrödinger equation with a single energy $E > 0$?', '$\\cos(3x)$', ['$x^2$', '$e^{-x^2}$', '$x\\sin x$']],
        ['Where $U > E$ for all $x > 0$, which function is an acceptable wave function for $x > 0$?', '$e^{-2x}$', ['$e^{2x}$', '$\\sin(2x)$', '$x^2e^{x}$']]]);
      rec('modern.schrodinger-equation', { kind: kind, right: sets[1] });
      p = { q: sets[0], a: mc(sets[1], sets[2]), steps: ['A wave function must solve $-\\dfrac{\\hbar^2}{2m}\\psi\'\' + U\\psi = E\\psi$ with one constant $E$, and meet the boundary conditions (zero at hard walls, finite everywhere).', 'Only ' + sets[1] + ' does both; each other choice fails one of the two tests.'], hint: 'Check two things: the equation, and the conditions at the edges.' };
    }
    return p;
  });

  G('modern.particle-in-box', function (R, ctx) {
    var kind = R.pick(by(ctx, ['En', 'En'], ['photon', 'Lfrom', 'ratio'], ['nucleon', 'photon', 'Lfrom']));
    var L = R.pick([0.20, 0.25, 0.30, 0.40, 0.50, 0.80, 1.0, 1.5, 2.0]), p;
    if (kind === 'En') {
      var n = R.pick([1, 2, 3, 4]), E = n * n * ELBOX / (L * L);
      rec('modern.particle-in-box', { kind: kind, L: L, n: n });
      p = { q: 'An electron is confined to a box $' + qu(L, 'nm', 2) + '$ wide. What is the energy of its $n = ' + n + '$ state? ($h^2/8m_e = 0.376$ eV·nm².)', a: num(E), unit: 'eV',
        steps: ['$E_n = n^2\\dfrac{h^2}{8mL^2} = ' + n * n + ' \\times \\dfrac{0.376}{' + nx(L, 2) + '^2}$.', '$E_{' + n + '} = ' + qu(E, 'eV') + '$.'], hint: 'Energies grow as $n^2/L^2$.' };
    } else if (kind === 'photon') {
      var hi = R.pick([2, 3, 4]), lo = R.pick([1, 1, 2]); if (lo >= hi) lo = 1;
      var dE = (hi * hi - lo * lo) * ELBOX / (L * L), lam = HC / dE;
      rec('modern.particle-in-box', { kind: kind, L: L, hi: hi, lo: lo });
      p = { q: 'An electron in a box $' + qu(L, 'nm', 2) + '$ wide drops from $n = ' + hi + '$ to $n = ' + lo + '$. What wavelength of light does it emit? ($h^2/8m_e = 0.376$ eV·nm², $hc = 1240$ eV·nm.)', a: num(lam), unit: 'nm',
        steps: ['$\\Delta E = (' + hi + '^2 - ' + lo + '^2)\\dfrac{0.376}{' + nx(L, 2) + '^2} = ' + qu(dE, 'eV') + '$.', '$\\lambda = \\dfrac{1240}{' + nx(dE) + '} = ' + qu(lam, 'nm') + '$.'], hint: 'Find the energy difference, then $\\lambda = hc/\\Delta E$.' };
    } else if (kind === 'Lfrom') {
      var E1 = R.pick([0.50, 1.0, 1.5, 2.0, 3.0, 5.0, 10]), Lf = M.sqrt(ELBOX / E1);
      rec('modern.particle-in-box', { kind: kind, E1: E1 });
      p = { q: 'An electron in a box has a ground-state energy of $' + qu(E1, 'eV', 2) + '$. How wide is the box? ($h^2/8m_e = 0.376$ eV·nm².)', a: num(Lf), unit: 'nm',
        steps: ['$E_1 = \\dfrac{0.376}{L^2}$, so $L = \\sqrt{\\dfrac{0.376}{E_1}} = \\sqrt{\\dfrac{0.376}{' + nx(E1, 2) + '}}$.', '$L = ' + qu(Lf, 'nm') + '$.'], hint: 'Solve $E_1 = h^2/8mL^2$ for $L$.' };
    } else if (kind === 'ratio') {
      var a = R.pick([2, 3, 4, 5]), b = R.pick([1, 2, 3]); if (b >= a) b = 1;
      var ask = R.pick(['ratio', 'gap']);
      rec('modern.particle-in-box', { kind: kind, a: a, b: b, ask: ask });
      p = ask === 'ratio' ? { q: 'For a particle in a box, how many times larger is $E_' + a + '$ than $E_' + b + '$?', a: num(a * a / (b * b), 0.005), unit: '×', steps: ['$E_n \\propto n^2$, so $\\dfrac{E_' + a + '}{E_' + b + '} = \\dfrac{' + a * a + '}{' + b * b + '} = ' + nx(a * a / (b * b), 3) + '$.'], hint: 'Energies go as $n^2$.' }
        : { q: 'For a particle in a box, the gap $E_' + a + ' - E_' + b + '$ is how many times the ground-state energy $E_1$?', a: exact(a * a - b * b), steps: ['$E_n = n^2E_1$.', '$E_' + a + ' - E_' + b + ' = (' + a * a + ' - ' + b * b + ')E_1 = ' + (a * a - b * b) + 'E_1$.'], hint: 'Write each level as $n^2E_1$.' };
    } else {
      var part = R.pick([['a proton', MPC2], ['a neutron', MNC2]]), Lfm = R.pick([5.0, 8.0, 10, 12, 15]), Enuc = 1240 * 1240 / (8 * part[1] * Lfm * Lfm);
      rec('modern.particle-in-box', { kind: kind, mc2: part[1], L: Lfm });
      p = { q: 'Model ' + part[0] + ' ($mc^2 = ' + qu(part[1], 'MeV', 4) + '$) as trapped in a box $' + qu(Lfm, 'fm', 2) + '$ wide, about the size of a nucleus. Estimate its ground-state energy, in MeV. ($hc = 1240$ MeV·fm.)', a: num(Enuc), unit: 'MeV',
        steps: ['$E_1 = \\dfrac{h^2}{8mL^2} = \\dfrac{(hc)^2}{8(mc^2)L^2}$.', '$E_1 = \\dfrac{1240^2}{8(' + nx(part[1], 4) + ')(' + nx(Lfm, 2) + ')^2} = ' + qu(Enuc, 'MeV') + '$.'], hint: 'Multiply top and bottom by $c^2$ to work in MeV and fm.' };
    }
    return p;
  });

  G('modern.tunneling', function (R, ctx) {
    var kind = R.pick(by(ctx, ['kappa', 'T'], ['T', 'widthRatio', 'kappa'], ['width', 'stm', 'widthRatio']));
    var U0 = R.pick([3.0, 4.0, 5.0, 6.0, 8.0, 10]), E = rnd(U0 * R.pick([0.25, 0.4, 0.5, 0.6, 0.75]), 3), kap = KAPPA1 * M.sqrt(U0 - E), Lw = R.pick([0.20, 0.30, 0.40, 0.50, 0.60, 0.80, 1.0]), p;
    var base = 'An electron with energy $' + qu(E, 'eV', 3) + '$ meets a barrier of height $U_0 = ' + qu(U0, 'eV', 2) + '$';
    var kst = '$\\kappa = \\dfrac{\\sqrt{2m(U_0 - E)}}{\\hbar} = 5.123\\sqrt{' + nx(U0 - E, 3) + '}\\ \\text{nm}^{-1} = ' + qu(kap, 'nm⁻¹') + '$.';
    if (kind === 'kappa') {
      rec('modern.tunneling', { kind: kind, U0: U0, E: E });
      p = { q: base + '. Find the decay constant $\\kappa$ of its wave function inside the barrier. (For an electron, $\\sqrt{2m_e \\cdot 1\\ \\text{eV}}/\\hbar = 5.123$ nm⁻¹.)', a: num(kap), unit: 'nm⁻¹', steps: [kst], hint: 'Only the energy deficit $U_0 - E$ matters.' };
    } else if (kind === 'T') {
      var T = M.exp(-2 * kap * Lw);
      rec('modern.tunneling', { kind: kind, U0: U0, E: E, L: Lw });
      p = { q: base + ' and width $' + qu(Lw, 'nm', 2) + '$. Estimate the probability that it tunnels through, using $T \\approx e^{-2\\kappa L}$. ($\\sqrt{2m_e \\cdot 1\\ \\text{eV}}/\\hbar = 5.123$ nm⁻¹.)', a: num(T, 0.03), unit: '',
        steps: [kst, '$2\\kappa L = 2(' + nx(kap) + ')(' + nx(Lw, 2) + ') = ' + nx(2 * kap * Lw) + '$.', '$T \\approx e^{-' + nx(2 * kap * Lw) + '} = ' + nx(T) + '$.'], hint: 'Find $\\kappa$, then the exponent $2\\kappa L$.' };
    } else if (kind === 'widthRatio') {
      var f = R.pick([1.5, 2, 0.5, 1.2]), ratio = M.exp(-2 * kap * Lw * (f - 1));
      rec('modern.tunneling', { kind: kind, U0: U0, E: E, L: Lw, f: f });
      p = { q: base + ' and width $' + qu(Lw, 'nm', 2) + '$. If the width changes to $' + qu(Lw * f, 'nm', 3) + '$, by what factor does $T \\approx e^{-2\\kappa L}$ change? ($\\sqrt{2m_e \\cdot 1\\ \\text{eV}}/\\hbar = 5.123$ nm⁻¹.)', a: num(ratio, 0.03), unit: '×',
        steps: [kst, '$\\dfrac{T_{\\text{new}}}{T_{\\text{old}}} = e^{-2\\kappa(L_{\\text{new}} - L_{\\text{old}})} = e^{-2(' + nx(kap) + ')(' + nx(Lw * (f - 1), 3) + ')}$.', '$= ' + nx(ratio) + '$.'], hint: 'Divide the two exponentials: only the change in width matters.' };
    } else if (kind === 'width') {
      var Tt = R.pick([1e-2, 1e-3, 1e-4, 1e-6]), Lneed = -M.log(Tt) / (2 * kap);
      rec('modern.tunneling', { kind: kind, U0: U0, E: E, T: Tt });
      p = { q: base + '. How wide must the barrier be for the tunneling probability to be $' + nx(Tt, 1) + '$, using $T \\approx e^{-2\\kappa L}$? ($\\sqrt{2m_e \\cdot 1\\ \\text{eV}}/\\hbar = 5.123$ nm⁻¹.)', a: num(Lneed), unit: 'nm',
        steps: [kst, '$L = \\dfrac{-\\ln T}{2\\kappa} = \\dfrac{' + nx(-M.log(Tt)) + '}{2(' + nx(kap) + ')} = ' + qu(Lneed, 'nm') + '$.'], hint: 'Take the natural log of both sides.' };
    } else {
      var phi = R.pick([4.0, 4.5, 5.0]), dL = R.pick([0.050, 0.10, 0.15, 0.20]), k2 = KAPPA1 * M.sqrt(phi), fac = M.exp(-2 * k2 * dL);
      rec('modern.tunneling', { kind: kind, phi: phi, dL: dL });
      p = { q: 'In a scanning tunneling microscope, electrons tunnel across the gap between tip and surface through a barrier $' + qu(phi, 'eV', 2) + '$ above their energy. If the gap widens by $' + qu(dL, 'nm', 2) + '$, by what factor does the tunneling current change? (Current $\\propto T \\approx e^{-2\\kappa L}$; $\\sqrt{2m_e \\cdot 1\\ \\text{eV}}/\\hbar = 5.123$ nm⁻¹.)', a: num(fac, 0.03), unit: '×',
        steps: ['$\\kappa = 5.123\\sqrt{' + nx(phi, 2) + '} = ' + qu(k2, 'nm⁻¹') + '$.', 'Factor: $e^{-2\\kappa\\Delta L} = e^{-2(' + nx(k2) + ')(' + nx(dL, 2) + ')} = ' + nx(fac) + '$.'], hint: 'Only the change in the gap enters the ratio.' };
    }
    return p;
  });

  G('modern.quantum-oscillator', function (R, ctx) {
    var kind = R.pick(by(ctx, ['En', 'zero'], ['photon', 'zero', 'En'], ['kFrom', 'amp', 'photon']));
    var p;
    if (kind === 'En' || kind === 'zero') {
      var hw = R.pick([0.050, 0.10, 0.12, 0.15, 0.20, 0.25, 0.30, 0.36, 0.40, 0.50, 0.60, 0.80]), n = kind === 'zero' ? 0 : R.pick([1, 2, 3, 4, 5, 6, 8, 10]);
      rec('modern.quantum-oscillator', { kind: kind, hw: hw, n: n });
      p = { q: 'A quantum harmonic oscillator has level spacing $\\hbar\\omega = ' + qu(hw, 'eV', 2) + '$. What is the energy of its ' + (n === 0 ? 'ground state ($n = 0$)' : '$n = ' + n + '$ level') + '?', a: num((n + 0.5) * hw), unit: 'eV',
        steps: ['$E_n = \\left(n + \\tfrac{1}{2}\\right)\\hbar\\omega = \\left(' + n + ' + \\tfrac{1}{2}\\right)(' + nx(hw, 2) + ')$.', '$E_{' + n + '} = ' + qu((n + 0.5) * hw, 'eV') + '$' + (n === 0 ? ', the zero-point energy.' : '.')], hint: 'Levels sit at half-integer multiples of $\\hbar\\omega$.' };
    } else if (kind === 'photon') {
      var f = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 4.5, 5.0, 6.0, 6.5, 7.0, 8.66, 9.0, 11.0]) * 1e13, hf = HEV * f, lam = 1240 / hf / 1000;
      rec('modern.quantum-oscillator', { kind: kind, f: f });
      p = { q: 'A molecule vibrates like a quantum oscillator at $f = ' + qu(f, 'Hz', 3) + '$. What wavelength of light lifts it from $n = 0$ to $n = 1$, in micrometers? ($h = 4.136 \\times 10^{-15}$ eV·s, $hc = 1240$ eV·nm.)', a: num(lam), unit: 'μm',
        steps: ['The gap is one step: $\\Delta E = hf = (4.136 \\times 10^{-15})(' + nx(f, 3) + ') = ' + qu(hf, 'eV') + '$.', '$\\lambda = \\dfrac{1240}{' + nx(hf) + '}\\ \\text{nm} = ' + qu(lam * 1000, 'nm') + ' = ' + qu(lam, 'μm') + '$ (infrared).'], hint: 'Every step on the ladder is $\\hbar\\omega = hf$.' };
    } else if (kind === 'kFrom') {
      var m = R.pick([1.0, 1.6, 2.0, 2.3]) * 1e-26, hw2 = R.pick([0.10, 0.15, 0.20, 0.25, 0.30]), w = hw2 / HBAREV, k = m * w * w;
      rec('modern.quantum-oscillator', { kind: kind, m: m, hw: hw2 });
      p = { q: 'An atom of mass $' + qu(m, 'kg', 2) + '$ vibrates in a molecule like a quantum oscillator with level spacing $' + qu(hw2, 'eV', 2) + '$. What is the effective spring constant? ($\\hbar = 6.582 \\times 10^{-16}$ eV·s.)', a: num(k), unit: 'N/m',
        steps: ['$\\omega = \\dfrac{\\Delta E}{\\hbar} = \\dfrac{' + nx(hw2, 2) + '}{6.582 \\times 10^{-16}} = ' + qu(w, 'rad/s') + '$.', '$k = m\\omega^2 = (' + nx(m, 2) + ')(' + nx(w) + ')^2 = ' + qu(k, 'N/m') + '$.'], hint: 'Get $\\omega$ from the spacing, then $k = m\\omega^2$.' };
    } else {
      var mm = R.pick([['an electron', ME], ['a proton', MP]]), wv = R.pick([1.0e14, 2.0e14, 5.0e14, 1.0e15]), A = M.sqrt(HBAR / (mm[1] * wv));
      rec('modern.quantum-oscillator', { kind: kind, m: mm[1], w: wv });
      p = { q: 'A quantum oscillator made of ' + mm[0] + ' ($m = ' + qu(mm[1], 'kg', 4) + '$) has $\\omega = ' + qu(wv, 'rad/s', 2) + '$. In its ground state, how far from the center is the classical turning point (where $\\tfrac{1}{2}m\\omega^2x^2 = E_0$)? Give it in nanometers.', a: num(A * 1e9), unit: 'nm',
        steps: ['$\\tfrac{1}{2}m\\omega^2x^2 = \\tfrac{1}{2}\\hbar\\omega$ gives $x = \\sqrt{\\dfrac{\\hbar}{m\\omega}}$.', '$x = \\sqrt{\\dfrac{1.055 \\times 10^{-34}}{(' + nx(mm[1], 4) + ')(' + nx(wv, 2) + ')}} = ' + qu(A, 'm') + ' = ' + qu(A * 1e9, 'nm') + '$.'], hint: 'Set the potential energy equal to the zero-point energy.' };
    }
    return p;
  });

  G('modern.quantum-numbers', function (R, ctx) {
    var kind = R.pick(by(ctx, ['shell', 'mlCount'], ['valid', 'subshell', 'Lmag'], ['angle', 'valid', 'nml']));
    var p, LET = ['s', 'p', 'd', 'f', 'g'];
    if (kind === 'shell') {
      var n = R.pick([1, 2, 3, 4, 5]);
      rec('modern.quantum-numbers', { kind: kind, n: n });
      p = { q: 'How many electron states (counting spin) are there in hydrogen\'s $n = ' + n + '$ shell?', a: exact(2 * n * n),
        steps: ['$l = 0$ to $' + (n - 1) + '$; each $l$ has $2l + 1$ values of $m_l$, and each of those 2 spins.', 'Total: $2\\sum_{l=0}^{' + (n - 1) + '}(2l + 1) = 2n^2 = ' + 2 * n * n + '$.'], hint: 'Count $m_l$ values for each allowed $l$, then double for spin.' };
    } else if (kind === 'mlCount') {
      var l = R.pick([0, 1, 2, 3]);
      rec('modern.quantum-numbers', { kind: kind, l: l });
      p = { q: 'How many different values of $m_l$ are there for an electron with $l = ' + l + '$ (a ' + LET[l] + ' electron)?', a: exact(2 * l + 1),
        steps: ['$m_l$ runs from $-l$ to $+l$ in steps of 1.', 'That is $2l + 1 = ' + (2 * l + 1) + '$ values.'], hint: 'List them: $-l, \\ldots, 0, \\ldots, +l$.' };
    } else if (kind === 'subshell') {
      var nn = R.pick([2, 3, 4, 5]), ll = R.int(0, M.min(3, nn - 1));
      rec('modern.quantum-numbers', { kind: kind, l: ll });
      p = { q: 'How many electrons can the ' + nn + LET[ll] + ' subshell hold?', a: exact(2 * (2 * ll + 1)),
        steps: [LET[ll] + ' means $l = ' + ll + '$, with $2l + 1 = ' + (2 * ll + 1) + '$ orbitals ($m_l$ values).', 'Two spins each: $' + 2 * (2 * ll + 1) + '$.'], hint: 'Orbitals times 2.' };
    } else if (kind === 'Lmag') {
      var l2 = R.pick([1, 2, 3, 4]);
      rec('modern.quantum-numbers', { kind: kind, l: l2 });
      p = { q: 'What is the magnitude of the orbital angular momentum of an electron with $l = ' + l2 + '$, in units of $\\hbar$?', a: num(M.sqrt(l2 * (l2 + 1)), 0.01), unit: 'ħ',
        steps: ['$L = \\sqrt{l(l + 1)}\\,\\hbar = \\sqrt{' + l2 * (l2 + 1) + '}\\,\\hbar = ' + nx(M.sqrt(l2 * (l2 + 1)), 3) + '\\hbar$.', 'It is longer than the largest $L_z = ' + l2 + '\\hbar$.'], hint: 'Not $l\\hbar$: use $\\sqrt{l(l + 1)}$.' };
    } else if (kind === 'angle') {
      var l3 = R.pick([1, 2, 3, 4]), ml = R.int(-l3, l3), ang = acosd(ml / M.sqrt(l3 * (l3 + 1)));
      rec('modern.quantum-numbers', { kind: kind, l: l3, ml: ml });
      p = { q: 'An electron has $l = ' + l3 + '$ and $m_l = ' + ml + '$. What angle does $\\vec{L}$ make with the $z$-axis?', a: num(ang), unit: '°',
        steps: ['$L = \\sqrt{' + l3 * (l3 + 1) + '}\\,\\hbar$ and $L_z = ' + ml + '\\hbar$.', '$\\cos\\theta = \\dfrac{L_z}{L} = \\dfrac{' + ml + '}{' + nx(M.sqrt(l3 * (l3 + 1)), 4) + '} = ' + nx(ml / M.sqrt(l3 * (l3 + 1))) + '$, so $\\theta = ' + deg(ang) + '$.'], hint: 'Use $\\cos\\theta = L_z/|L|$.' };
    } else if (kind === 'nml') {
      var n3 = R.pick([2, 3, 4, 5]), m3 = R.int(0, n3 - 1), cnt = 2 * (n3 - m3);
      rec('modern.quantum-numbers', { kind: kind, n: n3, ml: m3 });
      p = { q: 'In the $n = ' + n3 + '$ shell, how many electron states (counting spin) have $m_l = ' + m3 + '$?', a: exact(cnt),
        steps: ['$m_l = ' + m3 + '$ needs $l \\ge ' + m3 + '$; allowed $l$: ' + m3 + ' to ' + (n3 - 1) + ', which is ' + (n3 - m3) + ' value' + (n3 - m3 > 1 ? 's' : '') + '.', 'Each has one orbital with that $m_l$, holding 2 spins: $' + cnt + '$.'], hint: 'For each allowed $l$, is $m_l$ within $-l$ to $+l$?' };
    } else {
      var good = R.pick([[2, 1, -1, '+'], [3, 2, 2, '-'], [3, 0, 0, '+'], [4, 3, -2, '-'], [4, 1, 1, '+'], [5, 4, 3, '-']]);
      var bads = [[2, 2, 0, '+'], [3, 1, 2, '-'], [1, 1, 0, '+'], [3, 3, -1, '-'], [2, 0, 1, '+'], [4, 2, -3, '+'], [2, 1, 0, '0']];
      var fmt = function (q) { return '$(' + q[0] + ', ' + q[1] + ', ' + q[2] + ', ' + (q[3] === '0' ? '0' : q[3] + '\\tfrac{1}{2}') + ')$'; };
      var pickBad = R.sample(bads, 3);
      rec('modern.quantum-numbers', { kind: kind, good: good, bad: pickBad });
      p = { q: 'Which set of quantum numbers $(n, l, m_l, m_s)$ describes an allowed state of an electron in hydrogen?', a: mc(fmt(good), pickBad.map(fmt)),
        steps: ['Rules: $l = 0, \\ldots, n - 1$; $|m_l| \\le l$; $m_s = \\pm\\tfrac{1}{2}$.', fmt(good) + ' satisfies all three; each of the others breaks at least one.'], hint: 'Check $l < n$, then $|m_l| \\le l$, then $m_s$.' };
    }
    return p;
  });

  var ELEMS = [null, ['H', 'hydrogen'], ['He', 'helium'], ['Li', 'lithium'], ['Be', 'beryllium'], ['B', 'boron'], ['C', 'carbon'], ['N', 'nitrogen'], ['O', 'oxygen'], ['F', 'fluorine'], ['Ne', 'neon'], ['Na', 'sodium'], ['Mg', 'magnesium'], ['Al', 'aluminum'], ['Si', 'silicon'], ['P', 'phosphorus'], ['S', 'sulfur'], ['Cl', 'chlorine'], ['Ar', 'argon'], ['K', 'potassium'], ['Ca', 'calcium']];
  var ORDER = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2]];
  function config(Z) { var out = [], left = Z; ORDER.forEach(function (o) { if (left <= 0) return; var k = M.min(left, o[1]); out.push([o[0], k]); left -= k; }); return out; }
  function configTex(Z) { return config(Z).map(function (c) { return c[0] + '^{' + c[1] + '}'; }).join('\\,'); }

  G('modern.exclusion-principle', function (R, ctx) {
    var kind = R.pick(by(ctx, ['subMax', 'shellMax'], ['outer', 'config', 'lCount'], ['mlzero', 'spin', 'config']));
    var p, LET = ['s', 'p', 'd', 'f'];
    if (kind === 'subMax') {
      var l = R.pick([0, 1, 2, 3]);
      rec('modern.exclusion-principle', { kind: kind, l: l });
      p = { q: 'By the exclusion principle, what is the largest number of electrons a ' + LET[l] + ' subshell ($l = ' + l + '$) can hold?', a: exact(2 * (2 * l + 1)),
        steps: ['Each state needs its own set $(n, l, m_l, m_s)$.', '$2l + 1 = ' + (2 * l + 1) + '$ values of $m_l$, times 2 values of $m_s$: $' + 2 * (2 * l + 1) + '$.'], hint: 'Two electrons per orbital, with opposite spins.' };
    } else if (kind === 'shellMax') {
      var n = R.pick([1, 2, 3, 4]);
      rec('modern.exclusion-principle', { kind: kind, n: n });
      p = { q: 'What is the largest number of electrons the $n = ' + n + '$ shell can hold?', a: exact(2 * n * n), steps: ['Shell $n$ has $n^2$ orbitals, each holding 2 electrons.', '$2n^2 = ' + 2 * n * n + '$.'], hint: 'Count the orbitals: $n^2$.' };
    } else if (kind === 'outer' || kind === 'lCount') {
      var Z = R.int(3, 20), cfg = config(Z), last = cfg[cfg.length - 1];
      if (kind === 'outer') {
        rec('modern.exclusion-principle', { kind: kind, Z: Z });
        p = { q: 'How many electrons does a neutral ' + ELEMS[Z][1] + ' atom ($Z = ' + Z + '$) have in its last, partly or just filled subshell (' + last[0] + ') in the ground state?', a: exact(last[1]),
          steps: ['Fill in order 1s, 2s, 2p, 3s, 3p, 4s, two per orbital: $' + configTex(Z) + '$.', 'The last subshell, ' + last[0] + ', holds ' + last[1] + '.'], hint: 'Fill the subshells in order until you have placed $Z$ electrons.' };
      } else {
        var lq = R.pick([0, 1]), cnt = cfg.filter(function (c) { return c[0].charAt(1) === LET[lq]; }).reduce(function (s, c) { return s + c[1]; }, 0);
        rec('modern.exclusion-principle', { kind: kind, Z: Z, l: lq });
        p = { q: 'In a neutral ' + ELEMS[Z][1] + ' atom ($Z = ' + Z + '$) in its ground state, how many electrons have $l = ' + lq + '$ (' + LET[lq] + ' electrons)?', a: exact(cnt),
          steps: ['Configuration: $' + configTex(Z) + '$.', 'Add the ' + LET[lq] + ' subshells: ' + cnt + '.'], hint: 'Write the configuration, then count the ' + LET[lq] + ' electrons.' };
      }
    } else if (kind === 'config') {
      var Z2 = R.int(3, 20), right = '$' + configTex(Z2) + '$', cfg2 = config(Z2), wrongs = [];
      var w1 = cfg2.map(function (c) { return c.slice(); }); w1[0][1] += 1; w1[w1.length - 1][1] -= 1; if (!w1[w1.length - 1][1]) w1.pop(); // one electron too many in 1s
      wrongs.push('$' + w1.map(function (c) { return c[0] + '^{' + c[1] + '}'; }).join('\\,') + '$');
      wrongs.push('$1s^{' + Z2 + '}$');
      var w3 = Z2 > 4 ? '$1s^{2}\\,2s^{' + M.min(Z2 - 2, 8) + '}' + (Z2 > 10 ? '\\,3s^{' + (Z2 - 10) + '}' : '') + '$' : '$1s^{1}\\,2s^{' + (Z2 - 1) + '}$';
      wrongs.push(w3);
      rec('modern.exclusion-principle', { kind: kind, Z: Z2 });
      p = { q: 'Which is the ground-state electron configuration of ' + ELEMS[Z2][1] + ' ($Z = ' + Z2 + '$)?', a: mc(right, wrongs.filter(function (w, i, a) { return w !== right && a.indexOf(w) === i; })),
        steps: ['Each subshell holds $2(2l + 1)$: s holds 2, p holds 6.', 'Filling 1s, 2s, 2p, 3s, 3p, 4s in order with ' + Z2 + ' electrons gives ' + right + '.', 'The others put more electrons in a subshell than the exclusion principle allows.'], hint: 'An s subshell can hold only 2.' };
    } else if (kind === 'mlzero') {
      var n2 = R.pick([2, 3, 4]);
      rec('modern.exclusion-principle', { kind: kind, n: n2 });
      p = { q: 'In an atom whose $n = ' + n2 + '$ shell is completely filled, how many of that shell\'s electrons have $m_l = 0$?', a: exact(2 * n2),
        steps: ['$n = ' + n2 + '$ has $l = 0$ to $' + (n2 - 1) + '$: ' + n2 + ' values, each with exactly one $m_l = 0$ orbital.', 'Two electrons per orbital: $' + 2 * n2 + '$.'], hint: 'Every allowed $l$ includes $m_l = 0$.' };
    } else {
      var what = R.pick(['mag', 'z']);
      rec('modern.exclusion-principle', { kind: kind, what: what });
      p = what === 'mag' ? { q: 'What is the magnitude of an electron\'s spin angular momentum, in J·s? ($\\hbar = 1.055 \\times 10^{-34}$ J·s.)', a: num(M.sqrt(0.75) * HBAR), unit: 'J·s', steps: ['$|S| = \\sqrt{s(s + 1)}\\,\\hbar$ with $s = \\tfrac{1}{2}$: $\\sqrt{3/4}\\,\\hbar$.', '$|S| = 0.866 \\times 1.055 \\times 10^{-34} = ' + qu(M.sqrt(0.75) * HBAR, 'J·s') + '$.'], hint: 'Spin works like orbital angular momentum with $s = \\tfrac{1}{2}$.' }
        : { q: 'What is the largest possible $z$-component of an electron\'s spin, in J·s? ($\\hbar = 1.055 \\times 10^{-34}$ J·s.)', a: num(0.5 * HBAR), unit: 'J·s', steps: ['$S_z = m_s\\hbar$ with $m_s = \\pm\\tfrac{1}{2}$.', 'Largest: $\\tfrac{1}{2}\\hbar = ' + qu(0.5 * HBAR, 'J·s') + '$.'], hint: '$m_s$ can only be $\\pm\\tfrac{1}{2}$.' };
    }
    p.nolint = ['1x']; // electron configurations such as 1s^{2} are meant
    return p;
  });

  G('modern.band-theory', function (R, ctx) {
    var kind = R.pick(by(ctx, ['cutoff', 'led'], ['gapFrom', 'dope', 'cutoff'], ['thermal', 'temp', 'gapFrom']));
    var mat = R.pick([['silicon', 1.12], ['germanium', 0.67], ['gallium arsenide', 1.42], ['gallium nitride', 3.4], ['diamond', 5.5], ['cadmium sulfide', 2.42]]), p;
    if (kind === 'cutoff') {
      var lam = HC / mat[1];
      rec('modern.band-theory', { kind: kind, Eg: mat[1] });
      p = { q: (mat[0].charAt(0).toUpperCase() + mat[0].slice(1)) + ' has a band gap of $' + qu(mat[1], 'eV', 3) + '$. What is the longest wavelength of light that can lift an electron across the gap? ($hc = 1240$ eV·nm.)', a: num(lam), unit: 'nm',
        steps: ['A photon needs $hf \\ge E_g$, so $\\lambda \\le \\dfrac{hc}{E_g}$.', '$\\lambda_{\\max} = \\dfrac{1240}{' + nx(mat[1], 3) + '} = ' + qu(lam, 'nm') + '$.'], hint: 'Longer wavelength means less energy per photon.' };
    } else if (kind === 'led' || kind === 'gapFrom') {
      var col = R.pick([['red', 630], ['orange', 605], ['yellow', 590], ['green', 525], ['blue', 465], ['violet', 405], ['infrared', 850]]);
      rec('modern.band-theory', { kind: kind, lam: col[1] });
      p = kind === 'led' ? { q: 'An LED emits light with photon energy close to its band gap. What gap gives ' + col[0] + ' light at $' + qu(col[1], 'nm', 3) + '$? ($hc = 1240$ eV·nm.)', a: num(HC / col[1]), unit: 'eV', steps: ['An electron falling across the gap emits one photon: $E_g \\approx \\dfrac{hc}{\\lambda}$.', '$E_g = \\dfrac{1240}{' + col[1] + '} = ' + qu(HC / col[1], 'eV') + '$.'], hint: 'Photon energy $= hc/\\lambda$.' }
        : { q: 'A semiconductor starts absorbing light only at wavelengths shorter than $' + qu(col[1], 'nm', 3) + '$. What is its band gap? ($hc = 1240$ eV·nm.)', a: num(HC / col[1]), unit: 'eV', steps: ['The absorption edge is where $hc/\\lambda = E_g$.', '$E_g = \\dfrac{1240}{' + col[1] + '} = ' + qu(HC / col[1], 'eV') + '$.'], hint: 'The longest absorbed wavelength matches the gap.' };
    } else if (kind === 'dope') {
      var d = R.pick([['phosphorus', 5, 'n'], ['arsenic', 5, 'n'], ['antimony', 5, 'n'], ['boron', 3, 'p'], ['gallium', 3, 'p'], ['aluminum', 3, 'p']]);
      rec('modern.band-theory', { kind: kind, el: d[0], type: d[2] });
      var right = d[2] === 'n' ? 'n-type: each atom donates an extra electron to the conduction band' : 'p-type: each atom leaves a hole in the valence band';
      var wrong = d[2] === 'n' ? ['p-type: each atom leaves a hole in the valence band', 'It makes silicon an insulator by widening the gap', 'It has no effect, since the atom has the same number of outer electrons as silicon'] : ['n-type: each atom donates an extra electron to the conduction band', 'It makes silicon an insulator by widening the gap', 'It has no effect, since the atom has the same number of outer electrons as silicon'];
      p = { q: 'A small amount of ' + d[0] + ' (' + d[1] + ' outer electrons) is added to silicon (4 outer electrons). What does it do?', a: mc(right, wrong), steps: ['Silicon atoms bond with 4 outer electrons each.', d[2] === 'n' ? 'With 5, the extra electron is only loosely held and is easily freed into the conduction band: n-type.' : 'With 3, one bond is missing an electron: a hole that acts as a positive carrier: p-type.'], hint: 'Compare the number of outer electrons with silicon\'s four.' };
    } else if (kind === 'thermal') {
      var T1 = R.pick([250, 300]), T2 = T1 + R.pick([25, 50, 100]), Eg = R.pick([0.67, 1.12, 1.42]), r = M.exp(Eg / (2 * KBEV) * (1 / T1 - 1 / T2));
      rec('modern.band-theory', { kind: kind, Eg: Eg, T1: T1, T2: T2 });
      p = { q: 'The number of electrons thermally excited across a gap $E_g$ goes roughly as $e^{-E_g/2k_BT}$. For a gap of $' + qu(Eg, 'eV', 3) + '$, by what factor does this factor grow when the temperature rises from $' + T1 + '$ K to $' + T2 + '$ K? ($k_B = 8.617 \\times 10^{-5}$ eV/K.)', a: num(r, 0.03), unit: '×',
        steps: ['Ratio: $\\exp\\left[\\dfrac{E_g}{2k_B}\\left(\\dfrac{1}{T_1} - \\dfrac{1}{T_2}\\right)\\right]$.', '$\\dfrac{E_g}{2k_B} = \\dfrac{' + nx(Eg, 3) + '}{2(8.617 \\times 10^{-5})} = ' + qu(Eg / (2 * KBEV), 'K') + '$.', 'Exponent: $' + nx(Eg / (2 * KBEV)) + '\\left(\\dfrac{1}{' + T1 + '} - \\dfrac{1}{' + T2 + '}\\right) = ' + nx(Eg / (2 * KBEV) * (1 / T1 - 1 / T2)) + '$, so the factor is $' + nx(r) + '$.'],
        hint: 'Divide the two exponentials and combine the exponents.' };
    } else {
      rec('modern.band-theory', { kind: kind });
      p = { q: 'A piece of pure silicon and a copper wire are both warmed from 20 °C to 80 °C. What happens to their electrical resistances?', a: mc('The silicon\'s resistance falls; the copper\'s rises', ['Both resistances rise', 'Both resistances fall', 'The silicon\'s resistance rises; the copper\'s falls']),
        steps: ['Copper (a metal) has a fixed number of free electrons; warmer atoms scatter them more, so resistance rises.', 'Silicon (a semiconductor) gains many more carriers across its gap as it warms (roughly $e^{-E_g/2k_BT}$), which outweighs the extra scattering: resistance falls.'], hint: 'What changes with temperature: the number of carriers, or only how often they scatter?' };
    }
    return p;
  });

  // ---- u6
  // ===================================================================== Unit 6: Nuclei and Particles
  // Atomic masses in u (Atomic Mass Evaluation 2020, rounded to 6 decimals); [Z, A, mass, name]
  var MH = 1.007825, MN = 1.008665, MEU = 0.000549;
  var NUC = {
    'H-2': [1, 2, 2.014102, 'deuterium'], 'H-3': [1, 3, 3.016049, 'tritium'], 'He-3': [2, 3, 3.016029, 'helium-3'], 'He-4': [2, 4, 4.002603, 'helium-4'],
    'Li-7': [3, 7, 7.016003, 'lithium-7'], 'Be-9': [4, 9, 9.012183, 'beryllium-9'], 'C-11': [6, 11, 11.011433, 'carbon-11'], 'B-11': [5, 11, 11.009305, 'boron-11'], 'C-12': [6, 12, 12.000000, 'carbon-12'], 'C-13': [6, 13, 13.003355, 'carbon-13'],
    'C-14': [6, 14, 14.003242, 'carbon-14'], 'N-13': [7, 13, 13.005739, 'nitrogen-13'], 'N-14': [7, 14, 14.003074, 'nitrogen-14'], 'N-15': [7, 15, 15.000109, 'nitrogen-15'], 'O-15': [8, 15, 15.003066, 'oxygen-15'],
    'O-16': [8, 16, 15.994915, 'oxygen-16'], 'F-19': [9, 19, 18.998403, 'fluorine-19'], 'O-18': [8, 18, 17.999160, 'oxygen-18'], 'F-18': [9, 18, 18.000938, 'fluorine-18'], 'Ne-20': [10, 20, 19.992440, 'neon-20'], 'Ca-40': [20, 40, 39.962591, 'calcium-40'],
    'P-32': [15, 32, 31.973908, 'phosphorus-32'], 'S-32': [16, 32, 31.972071, 'sulfur-32'],
    'Fe-56': [26, 56, 55.934936, 'iron-56'], 'Co-60': [27, 60, 59.933816, 'cobalt-60'], 'Ni-60': [28, 60, 59.930786, 'nickel-60'], 'Ni-62': [28, 62, 61.928345, 'nickel-62'],
    'Cs-137': [55, 137, 136.907090, 'cesium-137'], 'Ba-137': [56, 137, 136.905827, 'barium-137'], 'Pb-206': [82, 206, 205.974465, 'lead-206'], 'Pb-208': [82, 208, 207.976652, 'lead-208'],
    'Po-210': [84, 210, 209.982874, 'polonium-210'], 'Rn-222': [86, 222, 222.017578, 'radon-222'], 'Ra-226': [88, 226, 226.025410, 'radium-226'], 'Th-230': [90, 230, 230.033134, 'thorium-230'],
    'Th-234': [90, 234, 234.043601, 'thorium-234'], 'U-234': [92, 234, 234.040952, 'uranium-234'], 'U-235': [92, 235, 235.043928, 'uranium-235'], 'U-238': [92, 238, 238.050788, 'uranium-238'],
    'Ba-141': [56, 141, 140.914403, 'barium-141'], 'Kr-92': [36, 92, 91.926173, 'krypton-92']
  };
  function sup(k) { var d = NUC[k]; return '{}^{' + d[1] + '}\\text{' + k.split('-')[0] + '}'; }
  function mU(x) { return nx(x, 7).replace(/\{,\}/g, ''); } // masses with 7 significant figures (no thousands comma)
  function mFix(x) { return x.toFixed(6); }

  G('modern.nuclear-binding', function (R, ctx) {
    var kind = R.pick(by(ctx, ['radius', 'radius'], ['BE', 'BEA', 'radiusRatio'], ['BEA', 'density', 'compare']));
    var p;
    if (kind === 'radius' || kind === 'radiusRatio') {
      var keys = Object.keys(NUC).filter(function (k) { return NUC[k][1] >= 4; }), k1 = R.pick(keys), A1 = NUC[k1][1];
      if (kind === 'radius') {
        rec('modern.nuclear-binding', { kind: kind, A: A1 });
        p = { q: 'Estimate the radius of a $' + sup(k1) + '$ nucleus, using $R = r_0A^{1/3}$ with $r_0 = 1.2$ fm.', a: num(1.2 * M.cbrt(A1)), unit: 'fm',
          steps: ['$A = ' + A1 + '$, so $A^{1/3} = ' + nx(M.cbrt(A1), 4) + '$.', '$R = 1.2 \\times ' + nx(M.cbrt(A1), 4) + ' = ' + qu(1.2 * M.cbrt(A1), 'fm') + '$.'], hint: 'Take the cube root of the mass number.' };
      } else {
        var k2 = R.pick(keys.filter(function (k) { return NUC[k][1] < A1; }).concat(['He-4'])), A2 = NUC[k2][1]; if (A2 === A1) { k2 = 'He-4'; A2 = 4; if (A1 === 4) { k1 = 'U-238'; A1 = 238; } }
        rec('modern.nuclear-binding', { kind: kind, A1: A1, A2: A2 });
        p = { q: 'How many times larger is the radius of a $' + sup(k1) + '$ nucleus than that of a $' + sup(k2) + '$ nucleus?', a: num(M.cbrt(A1 / A2), 0.01), unit: '×',
          steps: ['$R \\propto A^{1/3}$, so the ratio is $\\left(\\dfrac{' + A1 + '}{' + A2 + '}\\right)^{1/3}$.', '$= (' + nx(A1 / A2, 4) + ')^{1/3} = ' + nx(M.cbrt(A1 / A2), 4) + '$.'], hint: 'Radii scale as the cube root of $A$.' };
      }
    } else if (kind === 'BE' || kind === 'BEA' || kind === 'compare') {
      var list = ['H-2', 'H-3', 'He-3', 'He-4', 'Li-7', 'Be-9', 'C-12', 'C-14', 'N-14', 'O-16', 'F-19', 'Ne-20', 'Ca-40', 'Fe-56', 'Co-60', 'Ni-62', 'Cs-137', 'Pb-206', 'Pb-208', 'U-235', 'U-238'];
      var k = R.pick(list), Z = NUC[k][0], A = NUC[k][1], N = A - Z, Mx = NUC[k][2], dm = Z * MH + N * MN - Mx, BE = dm * UMEV;
      var stepsBE = ['$Z = ' + Z + '$ protons and $N = ' + N + '$ neutrons: $' + Z + '(1.007825) + ' + N + '(1.008665) = ' + mFix(Z * MH + N * MN) + '$ u.', 'Mass defect: $' + mFix(Z * MH + N * MN) + ' - ' + mFix(Mx) + ' = ' + mFix(dm) + '$ u.', '$E_B = ' + mFix(dm) + ' \\times 931.5 = ' + qu(BE, 'MeV', 4) + '$.'];
      if (kind === 'compare') {
        var kk = R.sample(['He-4', 'C-12', 'O-16', 'Fe-56', 'Pb-208', 'U-238', 'Ca-40', 'Li-7'], 2), be = kk.map(function (q) { var d = NUC[q]; return (d[0] * MH + (d[1] - d[0]) * MN - d[2]) * UMEV / d[1]; });
        var tb = be[0] > be[1] ? 0 : 1;
        rec('modern.nuclear-binding', { kind: kind, a: kk[0], b: kk[1] });
        p = { q: 'Which nucleus is more tightly bound, meaning it has the larger binding energy per nucleon: $' + sup(kk[0]) + '$ (atomic mass ' + mFix(NUC[kk[0]][2]) + ' u) or $' + sup(kk[1]) + '$ (atomic mass ' + mFix(NUC[kk[1]][2]) + ' u)?', a: { t: 'mc', choices: ['$' + sup(kk[0]) + '$', '$' + sup(kk[1]) + '$'], v: tb, keep: true },
          steps: kk.map(function (q, i) { return '$' + sup(q) + '$: $E_B/A = ' + nx(be[i], 3) + '$ MeV per nucleon.'; }).concat(['The binding curve peaks near iron-56; the nucleus closer to the peak wins.']), hint: 'Work out $E_B/A$ for both, or ask which is closer to iron on the binding curve.' };
      } else {
        rec('modern.nuclear-binding', { kind: kind, k: k });
        p = { q: 'Find the ' + (kind === 'BE' ? 'binding energy' : 'binding energy per nucleon') + ' of $' + sup(k) + '$ (atomic mass ' + mFix(Mx) + ' u). Use $m(^1\\text{H}) = 1.007825$ u, $m_n = 1.008665$ u and 1 u $= 931.5$ MeV/$c^2$.', a: num(kind === 'BE' ? BE : BE / A, 0.01), unit: 'MeV',
          steps: kind === 'BE' ? stepsBE : stepsBE.concat(['Per nucleon: $' + nx(BE, 4) + '/' + A + ' = ' + qu(BE / A, 'MeV', 3) + '$.']), hint: 'Add up the masses of the separate hydrogen atoms and neutrons, and subtract the atom\'s mass.' };
      }
    } else {
      rec('modern.nuclear-binding', { kind: kind });
      var r0 = 1.2e-15, rho = 1.6605e-27 / (4 / 3 * PI * r0 * r0 * r0);
      p = { q: 'Using $R = r_0A^{1/3}$ with $r_0 = 1.2$ fm, and a mass of $A$ u ($1\\ \\text{u} = 1.66 \\times 10^{-27}$ kg), estimate the density of nuclear matter. (It is the same for every nucleus.)', a: num(rho, 0.02), unit: 'kg/m³',
        steps: ['Volume: $\\tfrac{4}{3}\\pi r_0^3A$; mass: $A \\times 1.66 \\times 10^{-27}$ kg. The $A$ cancels.', '$\\rho = \\dfrac{1.66 \\times 10^{-27}}{\\tfrac{4}{3}\\pi(1.2 \\times 10^{-15})^3} = \\dfrac{1.66 \\times 10^{-27}}{7.24 \\times 10^{-45}} = ' + qu(rho, 'kg/m³') + '$.', 'A teaspoon of it would weigh about a billion tons.'],
        hint: 'Write the mass and the volume both in terms of $A$.' };
    }
    return p;
  });

  var HALF = [['carbon-14', 5730, 'yr', 14], ['radium-226', 1600, 'yr', 226], ['cobalt-60', 5.27, 'yr', 60], ['strontium-90', 28.8, 'yr', 90], ['cesium-137', 30.1, 'yr', 137], ['tritium (hydrogen-3)', 12.3, 'yr', 3], ['iodine-131', 8.02, 'd', 131], ['phosphorus-32', 14.3, 'd', 32], ['radon-222', 3.82, 'd', 222], ['polonium-210', 138, 'd', 210], ['technetium-99m', 6.01, 'h', 99], ['fluorine-18', 110, 'min', 18]];
  var SEC = { yr: 3.156e7, d: 86400, h: 3600, min: 60, s: 1 }, UNAME = { yr: 'years', d: 'days', h: 'hours', min: 'minutes' };

  G('modern.decay-law', function (R, ctx) {
    var kind = R.pick(by(ctx, ['lambda', 'frac'], ['activity', 'time', 'meanlife'], ['halfFrom', 'activityMass', 'time']));
    var iso = R.pick(HALF), T = iso[1], u = iso[2], lam = M.LN2 / T, p;
    var Tq = qu(T, u, 3);
    if (kind === 'lambda') {
      var perS = R.coin() || u === 'min';
      rec('modern.decay-law', { kind: kind, T: T, u: u, perS: perS });
      p = { q: (iso[0].charAt(0).toUpperCase() + iso[0].slice(1)) + ' has a half-life of $' + Tq + '$. What is its decay constant ' + (perS ? 'in s⁻¹' : 'per ' + { yr: 'year', d: 'day', h: 'hour', min: 'minute' }[u]) + '?', a: num(perS ? lam / SEC[u] : lam), unit: perS ? 's⁻¹' : { yr: 'yr⁻¹', d: 'd⁻¹', h: 'h⁻¹', min: 'min⁻¹' }[u],
        steps: ['$\\lambda = \\dfrac{\\ln 2}{T_{1/2}} = \\dfrac{0.693}{' + Tq + '} = ' + nx(lam) + '$ per ' + { yr: 'year', d: 'day', h: 'hour', min: 'minute' }[u] + '.'].concat(perS ? ['In seconds: $1\\ \\text{' + u + '} = ' + qu(SEC[u], 's', 4) + '$, so $\\lambda = ' + qu(lam / SEC[u], 's⁻¹') + '$.'] : []),
        hint: 'The decay constant and the half-life are linked by $\\ln 2$.' };
    } else if (kind === 'frac') {
      var tt = rnd(T * R.pick([0.5, 1.5, 2.5, 3.0, 4.0, 0.25, 5.0, 1.2]), 3), fr = M.exp(-lam * tt);
      rec('modern.decay-law', { kind: kind, T: T, t: tt });
      p = { q: (iso[0].charAt(0).toUpperCase() + iso[0].slice(1)) + ' has a half-life of $' + Tq + '$. What fraction of a sample is left after $' + qu(tt, u, 3) + '$?', a: num(fr, 0.02), unit: '',
        steps: ['$\\dfrac{N}{N_0} = e^{-\\lambda t}$ with $\\lambda t = \\dfrac{\\ln 2}{' + nx(T, 3) + '}(' + nx(tt, 3) + ') = ' + nx(lam * tt) + '$.', '$\\dfrac{N}{N_0} = e^{-' + nx(lam * tt) + '} = ' + nx(fr) + '$. (Same as $0.5^{t/T_{1/2}} = 0.5^{' + nx(tt / T, 3) + '}$.)'],
        hint: 'Count half-lives, or use $e^{-\\lambda t}$.' };
    } else if (kind === 'activity') {
      var Nn = R.pick([1.0, 2.0, 5.0]) * M.pow(10, R.int(12, 18)), A = lam / SEC[u] * Nn;
      rec('modern.decay-law', { kind: kind, T: T, u: u, N: Nn });
      p = { q: 'A sample contains $' + nx(Nn, 2) + '$ nuclei of ' + iso[0] + ' (half-life $' + Tq + '$). What is its activity, in becquerels?', a: num(A), unit: 'Bq',
        steps: ['$\\lambda = \\dfrac{\\ln 2}{T_{1/2}} = \\dfrac{0.693}{(' + nx(T, 3) + ')(' + nx(SEC[u], 4) + '\\ \\text{s})} = ' + qu(lam / SEC[u], 's⁻¹') + '$.', '$A = \\lambda N = (' + nx(lam / SEC[u]) + ')(' + nx(Nn, 2) + ') = ' + qu(A, 'Bq') + '$.'],
        hint: 'Activity is $\\lambda N$, with $\\lambda$ in s⁻¹.' };
    } else if (kind === 'time') {
      var f2 = R.pick([0.80, 0.60, 0.40, 0.30, 0.20, 0.10, 0.050, 0.010]), t2 = M.log(1 / f2) / lam;
      rec('modern.decay-law', { kind: kind, T: T, f: f2 });
      p = { q: 'How long does it take for ' + iso[0] + ' (half-life $' + Tq + '$) to decay to $' + nx(f2 * 100, 2) + '\\%$ of its starting amount? Answer in ' + UNAME[u] + '.', a: num(t2), unit: u,
        steps: ['$e^{-\\lambda t} = ' + nx(f2, 2) + '$, so $t = \\dfrac{\\ln(1/' + nx(f2, 2) + ')}{\\lambda} = \\dfrac{T_{1/2}}{\\ln 2}\\ln\\dfrac{1}{' + nx(f2, 2) + '}$.', '$t = \\dfrac{' + nx(T, 3) + '}{0.693} \\times ' + nx(M.log(1 / f2)) + ' = ' + qu(t2, u) + '$.'],
        hint: 'Take the natural log of both sides of $N/N_0 = e^{-\\lambda t}$.' };
    } else if (kind === 'meanlife') {
      rec('modern.decay-law', { kind: kind, T: T });
      p = { q: (iso[0].charAt(0).toUpperCase() + iso[0].slice(1)) + ' has a half-life of $' + Tq + '$. What is its mean life $\\tau = 1/\\lambda$? Answer in ' + UNAME[u] + '.', a: num(T / M.LN2), unit: u,
        steps: ['$\\tau = \\dfrac{1}{\\lambda} = \\dfrac{T_{1/2}}{\\ln 2} = \\dfrac{' + nx(T, 3) + '}{0.693} = ' + qu(T / M.LN2, u) + '$.', 'The mean life is about 1.44 half-lives.'], hint: 'Invert the decay constant.' };
    } else if (kind === 'halfFrom') {
      var Th = R.pick([2.0, 3.0, 5.0, 6.0, 8.0, 12, 15]), dt = R.pick([1.0, 2.0, 4.0, 5.0, 10]), A0 = R.pick([800, 1000, 1200, 2000, 5000]), A1 = rnd(A0 * M.exp(-M.LN2 * dt / Th), 3), Thf = M.LN2 * dt / M.log(A0 / A1);
      rec('modern.decay-law', { kind: kind, A0: A0, A1: A1, dt: dt });
      p = { q: 'A counter reads $' + A0 + '$ decays per second from a sample, and $' + nx(A1, 3) + '$ decays per second $' + qu(dt, 'h', 2) + '$ later. What is the half-life, in hours?', a: num(Thf), unit: 'h',
        steps: ['$\\dfrac{A}{A_0} = e^{-\\lambda t}$, so $\\lambda = \\dfrac{\\ln(A_0/A)}{t} = \\dfrac{\\ln(' + A0 + '/' + nx(A1, 3) + ')}{' + nx(dt, 2) + '\\ \\text{h}} = ' + qu(M.log(A0 / A1) / dt, 'h⁻¹') + '$.', '$T_{1/2} = \\dfrac{\\ln 2}{\\lambda} = ' + qu(Thf, 'h') + '$.'],
        hint: 'Activity decays with the same exponential as the number of nuclei.' };
    } else {
      var mg = R.pick([1.0, 0.50, 2.0, 0.10, 10]), mol = iso[3], Nm = mg * 1e-3 / mol * 6.022e23 * 1000 / 1000 * 1, Am = M.LN2 / (T * SEC[u]) * (mg / mol * 6.022e23);
      rec('modern.decay-law', { kind: kind, T: T, u: u, mg: mg, molar: mol });
      p = { q: 'What is the activity of $' + qu(mg, 'g', 2) + '$ of pure ' + iso[0] + ' (half-life $' + Tq + '$, molar mass about $' + mol + '$ g/mol)? Answer in becquerels.', a: num(Am), unit: 'Bq',
        steps: ['$N = \\dfrac{' + nx(mg, 2) + '}{' + mol + '} \\times 6.022 \\times 10^{23} = ' + nx(mg / mol * 6.022e23) + '$ nuclei.', '$\\lambda = \\dfrac{0.693}{(' + nx(T, 3) + ')(' + nx(SEC[u], 4) + '\\ \\text{s})} = ' + qu(M.LN2 / (T * SEC[u]), 's⁻¹') + '$.', '$A = \\lambda N = ' + qu(Am, 'Bq') + '$.'],
        hint: 'Count the nuclei from the moles, then multiply by $\\lambda$ in s⁻¹.' };
      void Nm;
    }
    return p;
  });

  var ALPHA = [['U-238', 'Th-234'], ['Ra-226', 'Rn-222'], ['Po-210', 'Pb-206'], ['U-234', 'Th-230'], ['Th-230', 'Ra-226'], ['Rn-222', 'Po-218'], ['Pu-239', 'U-235'], ['Am-241', 'Np-237'], ['Th-232', 'Ra-228']];
  NUC['Pu-239'] = [94, 239, 239.052163, 'plutonium-239']; NUC['Am-241'] = [95, 241, 241.056829, 'americium-241']; NUC['Np-237'] = [93, 237, 237.048173, 'neptunium-237'];
  NUC['Th-232'] = [90, 232, 232.038055, 'thorium-232']; NUC['Ra-228'] = [88, 228, 228.031070, 'radium-228']; NUC['O-17'] = [8, 17, 16.999132, 'oxygen-17'];
  var BMINUS = [['C-14', 'N-14'], ['H-3', 'He-3'], ['Co-60', 'Ni-60'], ['Cs-137', 'Ba-137'], ['P-32', 'S-32'], ['K-40', 'Ca-40']];
  NUC['K-40'] = [19, 40, 39.963998, 'potassium-40'];
  var BPLUS = [['F-18', 'O-18'], ['C-11', 'B-11'], ['N-13', 'C-13'], ['O-15', 'N-15']];
  NUC['Po-218'] = [84, 218, 218.008973, 'polonium-218'];
  G('modern.q-values', function (R, ctx) {
    var kind = R.pick(by(ctx, ['alpha', 'defect', 'sample'], ['betaMinus', 'fusion', 'alpha', 'endo', 'sample'], ['betaPlus', 'Kalpha', 'fission', 'perKg', 'sample']));
    if (kind === 'sample') {
      var ps = R.pick(ALPHA), Qs1 = (NUC[ps[0]][2] - NUC[ps[1]][2] - NUC['He-4'][2]) * UMEV, mug = R.pick([1.0, 2.0, 3.0, 4.0, 5.0, 8.0, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 500]), A0 = NUC[ps[0]][1], Ns = mug * 1e-6 / A0 * 6.022e23, Es = Ns * Qs1 * 1.602e-13;
      rec('modern.q-values', { kind: kind, par: ps[0], dau: ps[1], mug: mug });
      return { q: 'Each alpha decay $' + sup(ps[0]) + ' \\to ' + sup(ps[1]) + ' + \\alpha$ releases $' + qu(Qs1, 'MeV') + '$. How much energy, in joules, do these decays release in all when $' + qu(mug, 'μg', 2) + '$ of ' + NUC[ps[0]][3] + ' decays completely (counting only this first step)? (Molar mass about ' + A0 + ' g/mol; 1 MeV $= 1.602 \\times 10^{-13}$ J.)', a: num(Es, 0.02), unit: 'J',
        steps: ['Nuclei: $\\dfrac{' + nx(mug * 1e-6, 2) + '\\ \\text{g}}{' + A0 + '\\ \\text{g/mol}} \\times 6.022 \\times 10^{23} = ' + nx(Ns) + '$.', 'Energy: $' + nx(Ns) + ' \\times ' + nx(Qs1) + '\\ \\text{MeV} \\times 1.602 \\times 10^{-13}\\ \\text{J/MeV} = ' + qu(Es, 'J') + '$.'], hint: 'Count the nuclei, then multiply by the energy per decay.' };
    }
    var p, mm = function (k) { return NUC[k][2]; };
    if (kind === 'defect') {
      var pd = R.pick(ALPHA), dmd = mm(pd[0]) - mm(pd[1]) - mm('He-4');
      rec('modern.q-values', { kind: kind, par: pd[0], dau: pd[1] });
      return { q: 'In the alpha decay $' + sup(pd[0]) + ' \\to ' + sup(pd[1]) + ' + \\alpha$, how much mass disappears, in atomic mass units? Atomic masses: ' + NUC[pd[0]][3] + ' ' + mFix(mm(pd[0])) + ' u, ' + NUC[pd[1]][3] + ' ' + mFix(mm(pd[1])) + ' u, helium-4 4.002603 u.', a: num(dmd, 0.01), unit: 'u',
        steps: ['Mass before minus mass after: $' + mFix(mm(pd[0])) + ' - (' + mFix(mm(pd[1])) + ' + 4.002603)$.', '$= ' + mFix(dmd) + '$ u, which becomes $' + qu(dmd * UMEV, 'MeV') + '$ of energy.'], hint: 'Add the two products\' masses and subtract from the parent\'s.' };
    }
    if (kind === 'endo') {
      var be = 14.003074 + 4.002603, af = 16.999132 + MH, Qe = (be - af) * UMEV, keep = R.coin();
      rec('modern.q-values', { kind: kind });
      return { q: 'Rutherford\'s 1919 reaction: $\\alpha + {}^{14}\\text{N} \\to {}^{17}\\text{O} + {}^{1}\\text{H}$. Find its Q-value. Atomic masses: helium-4 4.002603 u, nitrogen-14 14.003074 u, oxygen-17 16.999132 u, hydrogen-1 1.007825 u (1 u = 931.5 MeV/$c^2$).', a: num(Qe, 0.01), unit: 'MeV',
        steps: ['Before: $4.002603 + 14.003074 = ' + mFix(be) + '$ u. After: $16.999132 + 1.007825 = ' + mFix(af) + '$ u.', '$Q = (' + mFix(be) + ' - ' + mFix(af) + ')(931.5) = ' + qu(Qe, 'MeV') + '$.', 'Negative: the alpha particle must bring in at least this much kinetic energy (a little more, in fact, since momentum must be conserved).'], hint: 'A negative Q means energy must be supplied.' };
    }
    if (kind === 'perKg') {
      var Qdt = (mm('H-2') + mm('H-3') - mm('He-4') - MN) * UMEV, mfuel = (mm('H-2') + mm('H-3')) * 1.6605e-27, Ekg = Qdt * 1.602e-13 / mfuel, frac2 = R.pick([1, 1]);
      rec('modern.q-values', { kind: kind });
      return { q: 'Each deuterium–tritium fusion ($^2$H + $^3$H → $^4$He + n) releases 17.6 MeV. How much energy, in joules, would 1.0 kg of D–T fuel release if all of it fused? (Fuel mass per reaction: 5.0302 u; 1 u $= 1.6605 \\times 10^{-27}$ kg; 1 MeV $= 1.602 \\times 10^{-13}$ J.)', a: num(17.6 * 1.602e-13 / (5.0302 * 1.6605e-27), 0.02), unit: 'J',
        steps: ['Reactions per kilogram: $\\dfrac{1.0}{5.0302 \\times 1.6605 \\times 10^{-27}} = ' + nx(1 / (5.0302 * 1.6605e-27)) + '$.', 'Energy: $' + nx(1 / (5.0302 * 1.6605e-27)) + ' \\times 17.6 \\times 1.602 \\times 10^{-13}\\ \\text{J} = ' + qu(17.6 * 1.602e-13 / (5.0302 * 1.6605e-27), 'J') + '$.', 'That is about ten million times the energy of burning a kilogram of gasoline.'], hint: 'Count the reactions in a kilogram, then multiply by the energy of each.' };
    }
    if (kind === 'alpha' || kind === 'Kalpha') {
      var pr = R.pick(ALPHA), dm = mm(pr[0]) - mm(pr[1]) - mm('He-4'), Q = dm * UMEV, A = NUC[pr[0]][1];
      rec('modern.q-values', { kind: kind, par: pr[0], dau: pr[1] });
      var st = ['Atomic masses (the electrons balance): $' + mFix(mm(pr[0])) + ' - ' + mFix(mm(pr[1])) + ' - ' + mFix(mm('He-4')) + ' = ' + mFix(dm) + '$ u.', '$Q = ' + mFix(dm) + ' \\times 931.5 = ' + qu(Q, 'MeV') + '$.'];
      if (kind === 'alpha') p = { q: 'Find the energy released in the alpha decay $' + sup(pr[0]) + ' \\to ' + sup(pr[1]) + ' + \\alpha$. Atomic masses: ' + NUC[pr[0]][3] + ' ' + mFix(mm(pr[0])) + ' u, ' + NUC[pr[1]][3] + ' ' + mFix(mm(pr[1])) + ' u, helium-4 4.002603 u (1 u = 931.5 MeV/$c^2$).', a: num(Q, 0.01), unit: 'MeV', steps: st, hint: 'Mass before minus mass after, times 931.5 MeV/u.' };
      else p = { q: 'In the alpha decay $' + sup(pr[0]) + ' \\to ' + sup(pr[1]) + ' + \\alpha$, the energy released is $Q = ' + qu(Q, 'MeV') + '$. The parent was at rest. About how much of it does the alpha particle carry away as kinetic energy?', a: num(Q * (A - 4) / A, 0.01), unit: 'MeV',
        steps: ['Momentum: the alpha and the daughter fly apart with equal momenta $p$, so $K = \\dfrac{p^2}{2m}$ is shared inversely to mass.', '$K_\\alpha = Q\\,\\dfrac{m_{\\text{daughter}}}{m_{\\text{daughter}} + m_\\alpha} \\approx Q\\,\\dfrac{A - 4}{A} = ' + nx(Q) + ' \\times \\dfrac{' + (A - 4) + '}{' + A + '}$.', '$K_\\alpha = ' + qu(Q * (A - 4) / A, 'MeV') + '$; the heavy daughter recoils with the small rest.'],
        hint: 'Equal and opposite momenta: the lighter particle gets more kinetic energy.' };
    } else if (kind === 'betaMinus' || kind === 'betaPlus') {
      var pl = kind === 'betaMinus', pb = R.pick(pl ? BMINUS : BPLUS), dmb = mm(pb[0]) - mm(pb[1]), Qb = dmb * UMEV - (pl ? 0 : 2 * MEC2);
      rec('modern.q-values', { kind: kind, par: pb[0], dau: pb[1] });
      p = { q: 'Find the Q-value of the beta-' + (pl ? 'minus' : 'plus') + ' decay $' + sup(pb[0]) + ' \\to ' + sup(pb[1]) + ' + ' + (pl ? 'e^- + \\bar{\\nu}_e' : 'e^+ + \\nu_e') + '$. Atomic masses: ' + NUC[pb[0]][3] + ' ' + mFix(mm(pb[0])) + ' u, ' + NUC[pb[1]][3] + ' ' + mFix(mm(pb[1])) + ' u (1 u = 931.5 MeV/$c^2$, $m_ec^2 = 0.511$ MeV).', a: num(Qb, 0.02), unit: 'MeV',
        steps: ['Atomic mass difference: $' + mFix(mm(pb[0])) + ' - ' + mFix(mm(pb[1])) + ' = ' + mFix(dmb) + '$ u, which is $' + qu(dmb * UMEV, 'MeV', 4) + '$.', pl ? 'Beta-minus: the daughter atom\'s extra electron is the emitted one, so the atomic masses already balance: $Q = ' + qu(Qb, 'MeV') + '$.' : 'Beta-plus: the daughter atom has one electron too many and a positron leaves, so subtract $2m_ec^2 = 1.022$ MeV: $Q = ' + qu(Qb, 'MeV') + '$.'],
        hint: pl ? 'With atomic masses, beta-minus needs no electron correction.' : 'With atomic masses, beta-plus needs $-2m_ec^2$.' };
    } else if (kind === 'fusion') {
      var rx = R.pick([[['H-2', 'H-3'], ['He-4', 'n'], 'Deuterium–tritium fusion'], [['H-2', 'H-2'], ['He-3', 'n'], 'Deuterium–deuterium fusion'], [['H-2', 'H-2'], ['H-3', 'H-1'], 'Deuterium–deuterium fusion (the other branch)'], [['H-2', 'He-3'], ['He-4', 'H-1'], 'Deuterium–helium-3 fusion']]);
      var mass = function (k) { return k === 'n' ? MN : k === 'H-1' ? MH : mm(k); }, lab = function (k) { return k === 'n' ? 'n' : k === 'H-1' ? '{}^{1}\\text{H}' : sup(k); };
      var before = rx[0].reduce(function (s, k) { return s + mass(k); }, 0), after = rx[1].reduce(function (s, k) { return s + mass(k); }, 0), Qf = (before - after) * UMEV;
      rec('modern.q-values', { kind: kind, before: rx[0], after: rx[1] });
      var mlist = rx[0].concat(rx[1]).filter(function (k, i, a) { return a.indexOf(k) === i; }).map(function (k) { return (k === 'n' ? 'neutron' : k === 'H-1' ? 'hydrogen-1' : NUC[k][3]) + ' ' + mFix(mass(k)) + ' u'; }).join(', ');
      p = { q: rx[2] + ': $' + rx[0].map(lab).join(' + ') + ' \\to ' + rx[1].map(lab).join(' + ') + '$. Find $Q$. Masses: ' + mlist + ' (1 u = 931.5 MeV/$c^2$).', a: num(Qf, 0.01), unit: 'MeV',
        steps: ['Before: $' + mFix(before) + '$ u. After: $' + mFix(after) + '$ u.', '$Q = (' + mFix(before) + ' - ' + mFix(after) + ')(931.5) = ' + qu(Qf, 'MeV') + '$.'], hint: 'Add the masses on each side, then subtract.' };
    } else {
      var nfr = R.pick([3, 3]), bf = mm('U-235') + MN, af = mm('Ba-141') + mm('Kr-92') + nfr * MN, Qs = (bf - af) * UMEV;
      rec('modern.q-values', { kind: kind });
      p = { q: 'Find the energy released in the fission $\\text{n} + {}^{235}\\text{U} \\to {}^{141}\\text{Ba} + {}^{92}\\text{Kr} + 3\\text{n}$. Masses: neutron 1.008665 u, uranium-235 235.043928 u, barium-141 140.914403 u, krypton-92 91.926173 u (1 u = 931.5 MeV/$c^2$).', a: num(Qs, 0.01), unit: 'MeV',
        steps: ['Before: $1.008665 + 235.043928 = ' + mFix(bf) + '$ u.', 'After: $140.914403 + 91.926173 + 3(1.008665) = ' + mFix(af) + '$ u.', '$Q = ' + mFix(bf - af) + ' \\times 931.5 = ' + qu(Qs, 'MeV') + '$, tens of millions of times the energy of a chemical reaction per atom.'],
        hint: 'Count all three neutrons on the right.' };
    }
    return p;
  });

  G('modern.radioactive-dating', function (R, ctx) {
    var kind = R.pick(by(ctx, ['cFrac', 'cHalves'], ['cActivity', 'uPb', 'cFrac'], ['method', 'leftAfter', 'uPb']));
    var TC = 5730, p;
    if (kind === 'cFrac') {
      var f = R.pick([0.90, 0.80, 0.70, 0.60, 0.45, 0.35, 0.30, 0.20, 0.15, 0.10, 0.05]), t = TC / M.LN2 * M.log(1 / f);
      rec('modern.radioactive-dating', { kind: kind, f: f });
      p = { q: 'A piece of ' + R.pick(['wood', 'charcoal', 'bone', 'linen cloth', 'a seed']) + ' has ' + nx(f * 100, 2) + '% of the carbon-14 found in living things. How old is it? (Half-life 5730 years.)', a: num(t), unit: 'yr',
        steps: ['$t = \\dfrac{T_{1/2}}{\\ln 2}\\ln\\dfrac{N_0}{N} = \\dfrac{5730}{0.693}\\ln\\dfrac{1}{' + nx(f, 2) + '}$.', '$t = 8267 \\times ' + nx(M.log(1 / f)) + ' = ' + qu(t, 'yr') + '$.'], hint: 'Solve $N/N_0 = e^{-\\lambda t}$ for $t$.' };
    } else if (kind === 'cHalves') {
      var k = R.pick([1, 2, 3, 4, 5]), f2 = M.pow(0.5, k);
      rec('modern.radioactive-dating', { kind: kind, k: k });
      p = { q: 'A sample has $' + T.frac(1, M.pow(2, k)) + '$ of the carbon-14 it had when it died. How many years ago did it die? (Half-life 5730 years.)', a: num(k * TC, 0.01), unit: 'yr',
        steps: ['$' + T.frac(1, M.pow(2, k)) + ' = \\left(\\tfrac{1}{2}\\right)^{' + k + '}$: ' + k + ' half-li' + (k === 1 ? 'fe has' : 'ves have') + ' passed.', '$t = ' + k + ' \\times 5730 = ' + qu(k * TC, 'yr', 5) + '$.'], hint: 'Count the halvings.' };
      void f2;
    } else if (kind === 'cActivity') {
      var a = R.pick([12.0, 10.0, 8.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.5]), t3 = TC / M.LN2 * M.log(15.3 / a);
      rec('modern.radioactive-dating', { kind: kind, a: a });
      p = { q: 'Carbon in living things gives about 15.3 decays per minute per gram. Carbon from an ancient sample gives $' + nx(a, 2) + '$ decays per minute per gram. How old is the sample? (Half-life 5730 years.)', a: num(t3), unit: 'yr',
        steps: ['Activity is proportional to the number of carbon-14 nuclei: $\\dfrac{N_0}{N} = \\dfrac{15.3}{' + nx(a, 2) + '} = ' + nx(15.3 / a) + '$.', '$t = \\dfrac{5730}{0.693}\\ln(' + nx(15.3 / a) + ') = ' + qu(t3, 'yr') + '$.'], hint: 'The ratio of activities equals the ratio of carbon-14 amounts.' };
    } else if (kind === 'uPb') {
      var r = R.pick([0.10, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.75, 0.90, 1.0]), tu = 4.47e9 / M.LN2 * M.log(1 + r);
      rec('modern.radioactive-dating', { kind: kind, r: r });
      p = { q: 'A zircon crystal contains $' + nx(r, 2) + '$ atoms of lead-206 for every atom of uranium-238. Assuming it started with no lead and kept every atom, how old is it? (Uranium-238 half-life $4.47 \\times 10^9$ yr.)', a: num(tu), unit: 'yr',
        steps: ['Each decayed uranium atom became a lead atom: $N_0 = N_{\\text{U}} + N_{\\text{Pb}}$, so $\\dfrac{N_0}{N_{\\text{U}}} = 1 + ' + nx(r, 2) + '$.', '$t = \\dfrac{4.47 \\times 10^9}{0.693}\\ln(' + nx(1 + r, 3) + ') = ' + qu(tu, 'yr') + '$.'], hint: 'The lead atoms count the uranium atoms that have decayed.' };
    } else if (kind === 'leftAfter') {
      var age = R.pick([1000, 2500, 5000, 10000, 20000, 30000, 50000]), fl = M.exp(-M.LN2 * age / TC);
      rec('modern.radioactive-dating', { kind: kind, age: age });
      p = { q: 'What fraction of its original carbon-14 does a ' + T.commas(age) + '-year-old bone still have? (Half-life 5730 years.)', a: num(fl, 0.02), unit: '',
        steps: ['$\\dfrac{N}{N_0} = \\left(\\tfrac{1}{2}\\right)^{t/T_{1/2}} = 0.5^{' + nx(age / TC, 3) + '}$.', '$= ' + nx(fl) + '$.'], hint: 'Divide the age by the half-life to count half-lives.' };
    } else {
      var S = R.pick([
        ['A layer of volcanic rock is thought to be about 70 million years old. Which dating method fits?', 'Uranium–lead (or another long-lived parent): carbon-14 would be long gone', ['Carbon-14, measuring the carbon left in the rock', 'Carbon-14, because it works for anything that is old', 'No radioactive method can date rocks']],
        ['A wooden tool is thought to be about 3000 years old. Which dating method fits?', 'Carbon-14: the wood was once alive and the age is within its range', ['Uranium–lead, because carbon-14 only works for very recent samples', 'Uranium–lead, because the tool is made of wood', 'No radioactive method works on wood']],
        ['Why can\'t carbon-14 date a dinosaur bone 70 million years old?', 'After 70 million years (over 12,000 half-lives), essentially no carbon-14 is left to measure', ['Dinosaur bones never contained carbon', 'Carbon-14 decays faster inside rock', 'Carbon-14 only works on plants']]]);
      rec('modern.radioactive-dating', { kind: kind, right: S[1] });
      p = { q: S[0], a: mc(S[1], S[2]), steps: ['Carbon-14 (half-life 5730 yr) dates once-living things up to about 50,000 years (about 9 half-lives).', 'For millions or billions of years, a parent with a half-life in that range is needed, such as uranium-238 ($4.47 \\times 10^9$ yr).'], hint: 'Compare the age with about 10 half-lives of the clock.' };
    }
    return p;
  });

  // quarks: [charge in thirds, baryon thirds, strangeness]
  var QK = { u: [2, 1, 0], d: [-1, 1, 0], s: [-1, 1, -1], c: [2, 1, 0], b: [-1, 1, 0], t: [2, 1, 0] };
  function qTex(k) { var a = /bar$/.test(k), f = k.replace('bar', ''); return a ? '\\bar{' + f + '}' : f; }
  function qSum(list, i) { return list.reduce(function (s, k) { var a = /bar$/.test(k) ? -1 : 1; return s + a * QK[k.replace('bar', '')][i]; }, 0); }
  var KNOWN = [[['u', 'u', 'd'], 'proton'], [['u', 'd', 'd'], 'neutron'], [['u', 'u', 's'], '\\Sigma^+'], [['d', 'd', 's'], '\\Sigma^-'], [['u', 'd', 's'], '\\Lambda^0'], [['s', 's', 's'], '\\Omega^-'], [['u', 's', 's'], '\\Xi^0'], [['d', 's', 's'], '\\Xi^-'], [['u', 'u', 'u'], '\\Delta^{++}'],
    [['u', 'dbar'], '\\pi^+'], [['d', 'ubar'], '\\pi^-'], [['u', 'sbar'], 'K^+'], [['s', 'ubar'], 'K^-'], [['d', 'sbar'], 'K^0'], [['c', 'cbar'], 'J/\\psi'], [['ubar', 'ubar', 'dbar'], '\\bar{p}'], [['c', 'dbar'], 'D^+']];
  function chT(q3) { return q3 % 3 === 0 ? T.num(q3 / 3) : T.frac(q3, 3); }

  G('modern.particle-families', function (R, ctx) {
    var kind = R.pick(by(ctx, ['charge', 'classify'], ['charge', 'baryonNum', 'name'], ['third', 'strange', 'classify']));
    var p;
    if (kind === 'charge' || kind === 'baryonNum' || kind === 'strange') {
      var item = R.pick(KNOWN), qs = item[0], q3 = qSum(qs, 0), b3 = qSum(qs, 1), S = qSum(qs, 2);
      if (R.chance(0.3) && kind === 'charge') { qs = R.pick([['c', 'sbar'], ['b', 'ubar'], ['s', 'sbar'], ['u', 'c', 'd'], ['ubar', 'dbar', 'dbar'], ['s', 'dbar']]); q3 = qSum(qs, 0); b3 = qSum(qs, 1); S = qSum(qs, 2); }
      rec('modern.particle-families', { kind: kind, qs: qs });
      var parts = qs.map(function (k) { var a = /bar$/.test(k) ? -1 : 1; return T.frac(a * QK[k.replace('bar', '')][0], 3); });
      if (kind === 'charge') p = { q: 'What is the electric charge (in units of $e$) of a hadron made of $' + qs.map(qTex).join('') + '$?', a: exact(q3 % 3 === 0 ? String(q3 / 3) : q3 + '/3'),
        steps: ['Quark charges: $u, c, t$: $+\\tfrac{2}{3}$; $d, s, b$: $-\\tfrac{1}{3}$; an antiquark has the opposite charge.', 'Sum: $' + parts.join(' + ').replace(/\+ -/g, '- ') + ' = ' + chT(q3) + '$.'], hint: 'Add the quark charges; flip the sign for antiquarks.' };
      else if (kind === 'baryonNum') p = { q: 'What is the baryon number of a particle made of $' + qs.map(qTex).join('') + '$?', a: exact(String(b3 / 3)),
        steps: ['Each quark has $B = +\\tfrac{1}{3}$ and each antiquark $B = -\\tfrac{1}{3}$.', '$B = ' + qs.map(function (k) { return /bar$/.test(k) ? '-\\tfrac{1}{3}' : '\\tfrac{1}{3}'; }).join(' + ').replace(/\+ -/g, '- ') + ' = ' + (b3 / 3) + '$.'], hint: 'Three quarks make a baryon ($B = 1$); a quark and an antiquark make $B = 0$.' };
      else p = { q: 'The strange quark has strangeness $-1$ (and $\\bar{s}$ has $+1$); other quarks have 0. What is the strangeness of a particle made of $' + qs.map(qTex).join('') + '$?', a: exact(String(S)),
        steps: ['Count strange quarks ($-1$ each) and strange antiquarks ($+1$ each).', 'Strangeness $= ' + S + '$.'], hint: 'Only $s$ and $\\bar{s}$ count.' };
    } else if (kind === 'classify') {
      var c = R.pick([['proton', 'baryon'], ['neutron', 'baryon'], ['electron', 'lepton'], ['muon', 'lepton'], ['electron neutrino', 'lepton'], ['tau', 'lepton'], ['pion $\\pi^+$', 'meson'], ['kaon $K^-$', 'meson'], ['lambda $\\Lambda^0$', 'baryon'], ['omega $\\Omega^-$', 'baryon'], ['J/ψ', 'meson']]);
      var ch = { baryon: 'A baryon: made of three quarks', meson: 'A meson: made of a quark and an antiquark', lepton: 'A lepton: a fundamental particle, not made of quarks' };
      rec('modern.particle-families', { kind: kind, fam: c[1] });
      p = { q: 'Which family does the ' + c[0] + ' belong to?', a: { t: 'mc', choices: [ch.baryon, ch.meson, ch.lepton, 'A gauge boson: a force carrier'], v: ['baryon', 'meson', 'lepton'].indexOf(c[1]), keep: true },
        steps: ['Leptons: e, μ, τ and their neutrinos. Baryons: three quarks (p, n, Λ, Σ, Ξ, Ω, Δ). Mesons: a quark and an antiquark (π, K, J/ψ, D).', 'The ' + c[0] + ' is a ' + c[1] + '.'], hint: 'Is it made of quarks at all? If so, how many?' };
    } else if (kind === 'name') {
      var it = R.pick(KNOWN.slice(0, 12)), wrongs = R.sample(KNOWN.slice(0, 12).filter(function (k) { return k !== it; }), 3).map(function (k) { return '$' + (k[1] === 'proton' || k[1] === 'neutron' ? '\\text{' + k[1] + '}' : k[1]) + '$'; });
      rec('modern.particle-families', { kind: kind, qs: it[0], nm: it[1] });
      var nmT = '$' + (it[1] === 'proton' || it[1] === 'neutron' ? '\\text{' + it[1] + '}' : it[1]) + '$';
      p = { q: 'Which particle has the quark content $' + it[0].map(qTex).join('') + '$?', a: mc(nmT, wrongs),
        steps: ['Charge: $' + chT(qSum(it[0], 0)) + '$; baryon number: $' + qSum(it[0], 1) / 3 + '$; strangeness: $' + qSum(it[0], 2) + '$.', 'That matches ' + nmT + '.'], hint: 'Work out the charge and strangeness first; they narrow it down.' };
    } else {
      var tgt = R.pick([[['u', 'u'], 'd', 'proton', '+1'], [['u', 'd'], 'd', 'neutron', '0'], [['u', 'd'], 's', '\\Lambda^0', '0'], [['s', 's'], 's', '\\Omega^-', '-1'], [['u', 's'], 's', '\\Xi^0', '0'], [['u', 'u'], 's', '\\Sigma^+', '+1'], [['d', 'd'], 's', '\\Sigma^-', '-1'], [['u', 'u'], 'u', '\\Delta^{++}', '+2']]);
      var opts = ['u', 'd', 's'].map(function (f) { return '$' + f + '$'; });
      rec('modern.particle-families', { kind: kind, two: tgt[0], third: tgt[1], Q: tgt[3] });
      var hasS = /s/.test(tgt[0].join('') + tgt[1]), Ss = (tgt[0].join('') + tgt[1]).split('s').length - 1;
      p = { q: 'A baryon with charge $' + tgt[3] + '$ and strangeness $' + (Ss ? '-' + Ss : '0') + '$ contains the quarks $' + tgt[0].join('') + '$ and one more. Which is the third quark?', a: { t: 'mc', choices: opts.concat(['$\\bar{u}$']), v: ['u', 'd', 's'].indexOf(tgt[1]), keep: true },
        steps: ['A baryon has three quarks (no antiquarks), so the third is a quark.', 'Charge so far: $' + chT(qSum(tgt[0], 0)) + '$; strangeness so far: $' + qSum(tgt[0], 2) + '$.', 'The third must bring charge $' + chT(qSum([tgt[1]], 0)) + '$ and strangeness $' + qSum([tgt[1]], 2) + '$: that is $' + tgt[1] + '$.'],
        hint: 'Match both the charge and the strangeness.' };
      void hasS;
    }
    return p;
  });

  G('modern.antimatter', function (R, ctx) {
    var kind = R.pick(by(ctx, ['threshold', 'share'], ['annihLam', 'share', 'annihE', 'annihF'], ['moving', 'why', 'share']));
    if (kind === 'annihF') {
      var Kf = R.pick([0, 0.05, 0.10, 0.20, 0.50]), Ef = MEC2 + Kf, fq = Ef * 1e6 / 4.136e-15;
      rec('modern.antimatter', { kind: kind, K: Kf });
      return { q: 'An electron and a positron' + (Kf ? ', each with kinetic energy $' + qu(Kf, 'MeV', 2) + '$ and equal and opposite momenta,' : ', both at rest,') + ' annihilate into two photons. What is the frequency of each photon? ($m_ec^2 = 0.511$ MeV, $h = 4.136 \\times 10^{-15}$ eV·s.)', a: num(fq), unit: 'Hz',
        steps: ['Zero total momentum: two photons of equal energy, $E = m_ec^2 + K = ' + qu(Ef, 'MeV', 3) + '$ each.', '$f = \\dfrac{E}{h} = \\dfrac{' + nx(Ef * 1e6, 3) + '\\ \\text{eV}}{4.136 \\times 10^{-15}\\ \\text{eV·s}} = ' + qu(fq, 'Hz') + '$.'], hint: 'Find each photon\'s energy, then $f = E/h$.' };
    }
    var part = R.pick([['electron–positron', MEC2], ['muon–antimuon', 105.66], ['proton–antiproton', MPC2], ['neutron–antineutron', MNC2], ['tau–antitau', 1776.9]]), p;
    if (kind === 'threshold') {
      rec('modern.antimatter', { kind: kind, mc2: part[1] });
      p = { q: 'What is the smallest photon energy that can create a ' + part[0] + ' pair (near a heavy nucleus, whose recoil energy you can ignore)? Each particle has $mc^2 = ' + qu(part[1], 'MeV', part[1] < 1 ? 3 : 4) + '$.', a: num(2 * part[1], 0.01), unit: 'MeV',
        steps: ['The photon must supply both rest energies: $E_\\gamma \\ge 2mc^2$.', '$2 \\times ' + nx(part[1], part[1] < 1 ? 3 : 4) + ' = ' + qu(2 * part[1], 'MeV', 4) + '$.'], hint: 'Two particles, each with rest energy $mc^2$.' };
    } else if (kind === 'share') {
      var Eg = R.int(12, 80) / 10, Ke = (Eg - 2 * MEC2) / 2;
      rec('modern.antimatter', { kind: kind, E: Eg });
      p = { q: 'A $' + qu(Eg, 'MeV', 3) + '$ photon makes an electron–positron pair near a heavy nucleus. If the two share the leftover energy equally, how much kinetic energy does each get? ($m_ec^2 = 0.511$ MeV.)', a: num(Ke, 0.01), unit: 'MeV',
        steps: ['Rest energy used: $2 \\times 0.511 = 1.022$ MeV.', 'Left over: $' + nx(Eg, 3) + ' - 1.022 = ' + qu(Eg - 1.022, 'MeV') + '$; each gets half: $' + qu(Ke, 'MeV') + '$.'], hint: 'Take off the two rest energies first.' };
    } else if (kind === 'annihLam' || kind === 'annihE') {
      var pp = R.pick([['an electron and a positron', MEC2], ['a proton and an antiproton', MPC2], ['a muon and an antimuon', 105.66]]);
      rec('modern.antimatter', { kind: kind, mc2: pp[1] });
      if (kind === 'annihE') p = { q: pp[0].charAt(0).toUpperCase() + pp[0].slice(1) + ', both at rest, annihilate into two photons. What is the energy of each photon? (Each particle has $mc^2 = ' + qu(pp[1], 'MeV', pp[1] < 1 ? 3 : 4) + '$.)', a: num(pp[1], 0.01), unit: 'MeV',
        steps: ['Total momentum is zero, so the two photons fly apart with equal and opposite momenta, hence equal energies.', 'Energy: $2mc^2$ shared by two photons: $' + qu(pp[1], 'MeV', pp[1] < 1 ? 3 : 4) + '$ each.'], hint: 'Zero total momentum means two equal photons.' };
      else p = { q: pp[0].charAt(0).toUpperCase() + pp[0].slice(1) + ', both at rest, annihilate into two photons. What is the wavelength of each photon, in picometers? ($mc^2 = ' + qu(pp[1], 'MeV', pp[1] < 1 ? 3 : 4) + '$ each; $hc = 1240$ MeV·fm $= 1.240 \\times 10^{-3}$ MeV·nm.)', a: num(1.240e-3 / pp[1] * 1000, 0.01), unit: 'pm',
        steps: ['Each photon has $E = mc^2 = ' + qu(pp[1], 'MeV', pp[1] < 1 ? 3 : 4) + '$.', '$\\lambda = \\dfrac{hc}{E} = \\dfrac{1.240 \\times 10^{-3}\\ \\text{MeV·nm}}{' + nx(pp[1], pp[1] < 1 ? 3 : 4) + '\\ \\text{MeV}} = ' + qu(1.240e-3 / pp[1], 'nm') + ' = ' + qu(1.240e-3 / pp[1] * 1000, 'pm') + '$.'], hint: 'Find each photon\'s energy, then $\\lambda = hc/E$.' };
    } else if (kind === 'moving') {
      var K = R.pick([0.10, 0.20, 0.25, 0.30, 0.40, 0.50, 0.75, 1.0, 1.5, 2.0, 3.0]);
      rec('modern.antimatter', { kind: kind, K: K });
      p = { q: 'An electron and a positron, each with kinetic energy $' + qu(K, 'MeV', 2) + '$, collide head-on with equal and opposite momenta and annihilate into two photons. What is the energy of each photon? ($m_ec^2 = 0.511$ MeV.)', a: num(MEC2 + K, 0.01), unit: 'MeV',
        steps: ['Total momentum is zero (equal and opposite), so the two photons have equal energies.', 'Total energy: $2(0.511 + ' + nx(K, 2) + ') = ' + qu(2 * (MEC2 + K), 'MeV') + '$; each photon: $' + qu(MEC2 + K, 'MeV') + '$.'], hint: 'Each particle brings its rest energy plus its kinetic energy.' };
    } else {
      rec('modern.antimatter', { kind: kind });
      p = { q: 'Why can\'t a single 5 MeV photon turn into an electron–positron pair in empty space, even though it has more than 1.022 MeV?',
        a: mc('A pair with the photon\'s momentum $p$ needs energy $\\sqrt{(pc)^2 + (1.022\\ \\text{MeV})^2}$, always more than the photon\'s $pc$', ['The photon has too little energy: it needs at least 5.11 MeV', 'Charge would not be conserved', 'Photons can never turn into matter']),
        steps: ['Charge is fine ($0 \\to -1 + 1$) and there is enough energy.', 'Momentum is the problem: a photon has $E = pc$, but a pair with the same total momentum needs $E \\ge \\sqrt{(pc)^2 + (2m_ec^2)^2} > pc$.', 'Near a nucleus, the nucleus takes up some momentum, and pair production happens.'], hint: 'Check momentum as well as energy.' };
    }
    return p;
  });

  // particles for conservation checks: [TeX, Q, B, Le, Lmu, Ltau, mass MeV]
  var PT = { p: ['p', 1, 1, 0, 0, 0, 938.272], n: ['n', 0, 1, 0, 0, 0, 939.565], 'e-': ['e^-', -1, 0, 1, 0, 0, 0.511], 'e+': ['e^+', 1, 0, -1, 0, 0, 0.511], 'mu-': ['\\mu^-', -1, 0, 0, 1, 0, 105.658], 'mu+': ['\\mu^+', 1, 0, 0, -1, 0, 105.658],
    nue: ['\\nu_e', 0, 0, 1, 0, 0, 0], anue: ['\\bar{\\nu}_e', 0, 0, -1, 0, 0, 0], numu: ['\\nu_\\mu', 0, 0, 0, 1, 0, 0], anumu: ['\\bar{\\nu}_\\mu', 0, 0, 0, -1, 0, 0], gamma: ['\\gamma', 0, 0, 0, 0, 0, 0],
    'pi+': ['\\pi^+', 1, 0, 0, 0, 0, 139.570], 'pi-': ['\\pi^-', -1, 0, 0, 0, 0, 139.570], pi0: ['\\pi^0', 0, 0, 0, 0, 0, 134.977], 'K+': ['K^+', 1, 0, 0, 0, 0, 493.677], L0: ['\\Lambda^0', 0, 1, 0, 0, 0, 1115.683], ap: ['\\bar{p}', -1, -1, 0, 0, 0, 938.272] };
  var RX = [ // [before, after]
    [['n'], ['p', 'e-', 'anue']], [['n'], ['p', 'e-']], [['n'], ['p', 'e-', 'nue']], [['p'], ['e+', 'gamma']], [['p'], ['n', 'e+', 'nue']], [['pi+'], ['mu+', 'numu']], [['pi+'], ['mu+', 'anumu']], [['pi-'], ['mu-', 'anumu']],
    [['mu-'], ['e-', 'anue', 'numu']], [['mu-'], ['e-', 'gamma']], [['mu+'], ['e+', 'nue', 'anumu']], [['L0'], ['p', 'pi-']], [['p', 'p'], ['p', 'n', 'pi+']], [['p', 'p'], ['p', 'p', 'ap']], [['p', 'p'], ['p', 'p', 'p', 'ap']],
    [['pi-', 'p'], ['n', 'pi0']], [['pi-', 'p'], ['L0', 'K+']], [['e-', 'e+'], ['gamma', 'gamma']], [['e-', 'p'], ['n', 'nue']], [['e-', 'p'], ['n', 'anue']], [['K+'], ['mu+', 'numu']], [['K+'], ['pi+', 'pi0']]];
  var LAWS = [['charge', 1], ['baryon number', 2], ['electron lepton number', 3], ['muon lepton number', 4]];
  function rxTex(r) { return r[0].map(function (k) { return PT[k][0]; }).join(' + ') + ' \\to ' + r[1].map(function (k) { return PT[k][0]; }).join(' + '); }
  function broken(r) { var out = []; LAWS.forEach(function (L) { var a = r[0].reduce(function (s, k) { return s + PT[k][L[1]]; }, 0), b = r[1].reduce(function (s, k) { return s + PT[k][L[1]]; }, 0); if (a !== b) out.push(L[0]); }); if (r[0].length === 1) { var m0 = PT[r[0][0]][6], m1 = r[1].reduce(function (s, k) { return s + PT[k][6]; }, 0); if (m1 >= m0) out.push('energy'); } return out; }
  function sumsT(r, i) { var a = r[0].reduce(function (s, k) { return s + PT[k][i]; }, 0), b = r[1].reduce(function (s, k) { return s + PT[k][i]; }, 0); return a + ' \\to ' + b; }

  G('modern.conservation-laws-particles', function (R, ctx) {
    var kind = R.pick(by(ctx, ['allowed', 'count'], ['which', 'allowed', 'missing'], ['which', 'missing', 'energy']));
    var p;
    if (kind === 'allowed' || kind === 'which') {
      var pool = kind === 'which' ? RX.filter(function (r) { return broken(r).length === 1 && broken(r)[0] !== 'energy'; }) : RX, r = R.pick(pool), br = broken(r);
      rec('modern.conservation-laws-particles', { kind: kind, r: r });
      var steps = LAWS.map(function (L) { return L[0].charAt(0).toUpperCase() + L[0].slice(1) + ': $' + sumsT(r, L[1]) + '$' + (br.indexOf(L[0]) >= 0 ? ' ✗' : ' ✓'); });
      if (r[0].length === 1) steps.push('Energy: the parent (' + nx(PT[r[0][0]][6], 4) + ' MeV) must outweigh the products (' + nx(r[1].reduce(function (s, k) { return s + PT[k][6]; }, 0), 4) + ' MeV)' + (br.indexOf('energy') >= 0 ? ' ✗' : ' ✓'));
      if (kind === 'allowed') p = { q: 'Is this ' + (r[0].length === 1 ? 'decay' : 'reaction') + ' allowed by the conservation laws? $$' + rxTex(r) + '$$', a: { t: 'mc', choices: ['Allowed', 'Forbidden'], v: br.length ? 1 : 0, keep: true }, steps: steps.concat([br.length ? 'Forbidden: ' + br.join(' and ') + ' not conserved.' : 'Allowed: every quantity balances' + (r[0].length > 1 ? ' (given enough collision energy).' : '.')]), hint: 'Check charge, baryon number and each lepton number separately.' };
      else p = { q: 'This ' + (r[0].length === 1 ? 'decay' : 'reaction') + ' never happens. Which conservation law does it break? $$' + rxTex(r) + '$$', a: mc(br[0].charAt(0).toUpperCase() + br[0].slice(1), LAWS.map(function (L) { return L[0].charAt(0).toUpperCase() + L[0].slice(1); }).filter(function (x) { return x.toLowerCase() !== br[0]; })), steps: steps, hint: 'Total each quantity before and after.' };
    } else if (kind === 'count') {
      var r2 = R.pick(RX), L = R.pick(LAWS.slice(0, 3)), a = r2[1].reduce(function (s, k) { return s + PT[k][L[1]]; }, 0);
      rec('modern.conservation-laws-particles', { kind: kind, r: r2, i: L[1] });
      p = { q: 'What is the total ' + L[0] + ' of the particles on the right side? $$' + rxTex(r2) + '$$', a: exact(String(a)),
        steps: ['Add each particle\'s ' + L[0] + ' (antiparticles have the opposite sign).', r2[1].map(function (k) { return '$' + PT[k][0] + '$: ' + PT[k][L[1]]; }).join(', ') + '.', 'Total: $' + a + '$.'], hint: L[1] === 2 ? 'Baryons count +1, antibaryons −1, everything else 0.' : L[1] === 1 ? 'Add the charges.' : 'Electrons and electron neutrinos count +1; their antiparticles −1.' };
    } else if (kind === 'missing') {
      var M2 = R.pick([[['n'], ['p', 'e-'], 'anue'], [['pi+'], ['mu+'], 'numu'], [['pi-'], ['mu-'], 'anumu'], [['pi+'], ['e+'], 'nue'], [['e-', 'p'], ['n'], 'nue'], [['mu-'], ['e-', 'anue'], 'numu'], [['mu+'], ['e+', 'nue'], 'anumu']]);
      var opts = ['nue', 'anue', 'numu', 'anumu'];
      rec('modern.conservation-laws-particles', { kind: kind, r: [M2[0], M2[1].concat([M2[2]])], ans: M2[2] });
      p = { q: 'What neutral particle is missing? $$' + M2[0].map(function (k) { return PT[k][0]; }).join(' + ') + ' \\to ' + M2[1].map(function (k) { return PT[k][0]; }).join(' + ') + ' + \\text{?}$$', a: { t: 'mc', choices: opts.map(function (k) { return '$' + PT[k][0] + '$'; }), v: opts.indexOf(M2[2]), keep: true },
        steps: ['Charge and baryon number already balance, so the missing particle is a neutral lepton: a neutrino or antineutrino.', 'Electron lepton number: $' + sumsT([M2[0], M2[1]], 3) + '$; muon lepton number: $' + sumsT([M2[0], M2[1]], 4) + '$.', 'The missing particle must make up the difference: $' + PT[M2[2]][0] + '$.'], hint: 'Balance each lepton number separately.' };
    } else {
      var E = R.pick([[['n'], ['p', 'e-', 'anue']], [['pi+'], ['mu+', 'numu']], [['L0'], ['p', 'pi-']], [['K+'], ['mu+', 'numu']], [['mu-'], ['e-', 'anue', 'numu']], [['K+'], ['pi+', 'pi0']]]), Qe = PT[E[0][0]][6] - E[1].reduce(function (s, k) { return s + PT[k][6]; }, 0);
      rec('modern.conservation-laws-particles', { kind: kind, r: E });
      p = { q: 'How much kinetic energy is released in the decay of a particle at rest? $$' + rxTex(E) + '$$ Rest energies (MeV): ' + E[0].concat(E[1]).filter(function (k, i, a) { return a.indexOf(k) === i; }).map(function (k) { return '$' + PT[k][0] + '$ ' + PT[k][6]; }).join(', ') + ' (neutrinos about 0).', a: num(Qe, 0.01), unit: 'MeV',
        steps: ['$Q = m_{\\text{parent}}c^2 - \\sum m_{\\text{products}}c^2$.', '$Q = ' + PT[E[0][0]][6] + ' - (' + E[1].map(function (k) { return PT[k][6]; }).join(' + ') + ') = ' + qu(Qe, 'MeV', 4) + '$.'], hint: 'Subtract the products\' rest energies from the parent\'s.' };
    }
    return p;
  });

  G('modern.fundamental-forces', function (R, ctx) {
    var kind = R.pick(by(ctx, ['carrier', 'ratio', 'whichForce'], ['range', 'feels', 'ratio'], ['mass', 'range', 'feels']));
    var p;
    if (kind === 'whichForce') {
      var cr = R.pick([['photon', 'Electromagnetic'], ['gluon', 'Strong'], ['W boson', 'Weak'], ['Z boson', 'Weak']]);
      rec('modern.fundamental-forces', { kind: kind, c: cr[0] });
      return { q: 'Which force does the ' + cr[0] + ' carry?', a: mc(cr[1], ['Electromagnetic', 'Strong', 'Weak', 'Gravity'].filter(function (x) { return x !== cr[1]; })),
        steps: ['Photons carry the electromagnetic force, gluons the strong force, and the W and Z bosons the weak force.', 'So the ' + cr[0] + ' carries the ' + cr[1].toLowerCase() + ' force.'], hint: 'Match each carrier with its force.' };
    }
    if (kind === 'carrier') {
      var f = R.pick([['electromagnetic', 'the photon'], ['strong', 'the gluon'], ['weak', 'the W and Z bosons']]);
      rec('modern.fundamental-forces', { kind: kind, f: f[0] });
      p = { q: 'Which particle carries the ' + f[0] + ' force?', a: mc(f[1].charAt(0).toUpperCase() + f[1].slice(1), ['The photon', 'The gluon', 'The W and Z bosons', 'The graviton (observed)'].filter(function (x) { return x.toLowerCase() !== f[1].toLowerCase(); }).slice(0, 3)),
        steps: ['Electromagnetic: photon. Strong: gluons. Weak: W⁺, W⁻ and Z⁰. Gravity: a graviton is proposed but has never been observed.', 'So the ' + f[0] + ' force is carried by ' + f[1] + '.'], hint: 'Each force has its own carrier.' };
    } else if (kind === 'ratio') {
      var pr = R.pick([['two protons', MP, MP], ['two electrons', ME, ME], ['an electron and a proton', ME, MP]]), rat = KE * QE * QE / (GN * pr[1] * pr[2]), rr = R.pick(['1.0 fm', '0.10 nm', '1.0 mm', '1.0 m', '1.0 km']);
      rec('modern.fundamental-forces', { kind: kind, m1: pr[1], m2: pr[2] });
      p = { q: 'How many times stronger is the electric force than the gravitational force between ' + pr[0] + ' ' + rr + ' apart? ($k = 8.99 \\times 10^9$, $G = 6.674 \\times 10^{-11}$ (SI), $e = 1.602 \\times 10^{-19}$ C, $m_p = 1.673 \\times 10^{-27}$ kg, $m_e = 9.109 \\times 10^{-31}$ kg.)', a: num(rat, 0.02), unit: '×',
        steps: ['Both forces go as $1/r^2$, so the distance cancels: $\\dfrac{F_e}{F_g} = \\dfrac{ke^2}{Gm_1m_2}$.', '$= \\dfrac{(8.99 \\times 10^9)(1.602 \\times 10^{-19})^2}{(6.674 \\times 10^{-11})(' + nx(pr[1], 4) + ')(' + nx(pr[2], 4) + ')} = ' + nx(rat) + '$.'], hint: 'Divide Coulomb\'s law by Newton\'s law of gravity.' };
    } else if (kind === 'range' || kind === 'mass') {
      var mx = R.pick([150, 200, 250, 300, 400, 500, 600, 770, 1000, 2000]), car = R.pick([['the pion', 139.6], ['the W boson', 80400], ['the Z boson', 91190], ['a meson of ' + mx + ' MeV', mx], ['a hypothetical carrier of ' + mx + ' MeV', mx]]);
      if (kind === 'range') {
        rec('modern.fundamental-forces', { kind: kind, mc2: car[1] });
        p = { q: 'Estimate the range of a force carried by ' + car[0] + ' ($mc^2 = ' + qu(car[1], 'MeV', 4) + '$), using $R \\approx \\hbar c/(mc^2)$ with $\\hbar c = 197.3$ MeV·fm.', a: num(HBARC / car[1]), unit: 'fm',
          steps: ['$R \\approx \\dfrac{\\hbar c}{mc^2} = \\dfrac{197.3\\ \\text{MeV·fm}}{' + nx(car[1], 4) + '\\ \\text{MeV}} = ' + qu(HBARC / car[1], 'fm') + '$.'], hint: 'A heavier carrier can only exist for a shorter time, so the force reaches less far.' };
      } else {
        var Rr = R.pick([0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.75, 0.80, 1.0, 1.2, 1.4, 2.0, 2.5e-3, 1.0e-3]);
        rec('modern.fundamental-forces', { kind: kind, R: Rr });
        p = { q: 'A force has a range of about $' + qu(Rr, 'fm', 2) + '$. Using $R \\approx \\hbar c/(mc^2)$ with $\\hbar c = 197.3$ MeV·fm, estimate the rest energy of its carrier, in MeV.', a: num(HBARC / Rr), unit: 'MeV',
          steps: ['$mc^2 \\approx \\dfrac{\\hbar c}{R} = \\dfrac{197.3}{' + nx(Rr, 2) + '} = ' + qu(HBARC / Rr, 'MeV') + '$.'], hint: 'Solve the range formula for $mc^2$.' };
      }
    } else {
      var Fq = R.pick([['electron', 'It feels gravity, the electromagnetic force and the weak force, but not the strong force'], ['neutrino', 'It feels gravity and the weak force only'], ['proton', 'It feels all four forces'], ['muon', 'It feels gravity, the electromagnetic force and the weak force, but not the strong force']]);
      var all = ['It feels gravity, the electromagnetic force and the weak force, but not the strong force', 'It feels gravity and the weak force only', 'It feels all four forces', 'It feels only the strong force'];
      rec('modern.fundamental-forces', { kind: kind, who: Fq[0] });
      p = { q: 'Which forces act on a' + (Fq[0] === 'electron' ? 'n' : '') + ' ' + Fq[0] + '?', a: { t: 'mc', choices: all, v: all.indexOf(Fq[1]), keep: true },
        steps: ['Gravity acts on everything with energy; the weak force on all quarks and leptons; the electromagnetic force on charged particles; the strong force only on quarks (and the hadrons made of them).', 'The ' + Fq[0] + ': ' + Fq[1].charAt(0).toLowerCase() + Fq[1].slice(1) + '.'], hint: 'Is it made of quarks? Is it charged?' };
    }
    return p;
  });

  // ---- tail
})(window.MathLadder);
