/* Physics Ladder generators: Electricity and Magnetism (em). One generator per topic in data/physics/topics/em.json.
   Built from /tmp/work_em/gen/*.js by build-gen.js (edit the parts there, not this file).
   Every answer is computed from the numbers generated here. With MathLadder._emTest set (node tests only), each problem
   also carries _t: the givens and the kind of problem, which the work dir's tests use to recompute every answer by a
   different route (numerical integration, nodal analysis, ODE integration, conservation laws). Constants follow the
   ladder overview: k = 8.99 × 10⁹ N·m²/C², ε₀ = 8.85 × 10⁻¹² F/m, μ₀ = 4π × 10⁻⁷ T·m/A, e = 1.60 × 10⁻¹⁹ C,
   m_e = 9.11 × 10⁻³¹ kg, m_p = 1.67 × 10⁻²⁷ kg, u = 1.66 × 10⁻²⁷ kg, c = 3.00 × 10⁸ m/s. */
(function (ML) {
  'use strict';
  var G = ML.gen, T = ML.T, by = ML.byLevel, M = Math, PI = M.PI;
  var KC = 8.99e9, EPS0 = 8.85e-12, MU0 = 4 * PI * 1e-7, QE = 1.60e-19, ME = 9.11e-31, MP = 1.67e-27, AMU = 1.66e-27, CL = 3.00e8;
  var NBSP = ' ';

  // ---------------------------------------------------------------- numbers
  /* sf(x, n): x to n significant figures as TeX: plain decimal from 0.01 to 9999, otherwise a × 10^{e}; trailing zeros kept
     (they carry the significant figures), real minus from tex.js */
  function sf(x, n) {
    n = n || 3; if (!isFinite(x)) return '?'; if (x === 0) return '0';
    var neg = x < 0, a = Number(M.abs(x).toPrecision(n)), e = M.floor(M.log10(a) + 1e-12), s;
    if (e >= -2 && e <= 3) s = a.toFixed(M.max(0, n - 1 - e));
    else { var m = (a / M.pow(10, e)).toFixed(n - 1); if (+m >= 10) { e++; m = (a / M.pow(10, e)).toFixed(n - 1); } s = m + ' \\times 10^{' + e + '}'; }
    return (neg ? '-' : '') + s;
  }
  /* gv(x): a given value as written in a problem: at most 4 significant figures, no trailing zeros, a × 10^{e} when tiny or huge */
  function gv(x) {
    if (x === 0) return '0';
    var neg = x < 0, a = Number(M.abs(x).toPrecision(4)), e = M.floor(M.log10(a) + 1e-12), s;
    if (e >= -3 && e <= 4) { s = String(a); if (a < 10 && one(s)) s = a.toPrecision(2); }
    else { var m = Number((a / M.pow(10, e)).toPrecision(4)), ms = String(m); if (one(ms)) ms = m.toPrecision(2); s = ms + ' \\times 10^{' + e + '}'; }
    return (neg ? '-' : '') + s;
  }
  function one(s) { return s.replace('.', '').replace(/^0+/, '').replace(/0+$/, '').length === 1; } // one significant digit (5, 0.4, 0.05)
  function pl(x, n) { n = n || 3; var y = Number(x.toPrecision(n)); if (y !== 0 && (M.abs(y) >= 1e5 || M.abs(y) < 1e-3)) return y.toExponential(n - 1).replace('e+', 'e'); return String(y); } // plain answer value, 3 significant figures (scientific form when large or small)
  function U(unit) { return unit ? '\\ \\text{' + unit + '}' : ''; }             // a unit inside math
  function nu(x, unit, n) { return sf(x, n) + U(unit); }                          // computed value with unit (TeX)
  function gu(x, unit) { return gv(x) + U(unit); }                                // given value with unit (TeX)
  function $(s) { return '$' + s + '$'; }
  function num(x, unit, rtol) { return { a: { t: 'num', v: pl(x), rtol: rtol || 0.02 }, unit: unit }; }
  function mcq(correct, wrongs) { return { t: 'mc', choices: [correct].concat(wrongs), v: 0 }; }
  function test() { return !!ML._emTest; }
  /* P(q, a, steps, hint, t, extra): build a problem; a is {a, unit} from num() or an answer spec */
  function P(q, a, steps, hint, t, extra) {
    var p = { q: q, steps: steps, hint: hint };
    if (a && a.a) { p.a = a.a; if (a.unit) p.unit = a.unit; } else p.a = a;
    if (extra) for (var k in extra) p[k] = extra[k];
    if (test()) p._t = t || {};
    return p;
  }
  function kind(R, ctx, a, b, c) { return R.pick(by(ctx, a, b, c)); }
  function sq(x) { return x * x; }
  function deg(x) { return x * PI / 180; }
  function nm(x) { return x * 1e-9; }
  // TeX for k, ε₀, μ₀ substitutions
  var tK = '(8.99 \\times 10^{9})', tE0 = '(8.85 \\times 10^{-12})', tMU = '(4\\pi \\times 10^{-7})';
  function pw(x, unitExp) { return '(' + gv(x) + ' \\times 10^{' + unitExp + '})'; }  // e.g. 12 nC -> (12 \times 10^{-9})
  function p10(x) { return '(' + gv(x) + ')'; }


  // ================================================================ Unit 1: Charges, Fields and Gauss's Law

  G('em.charge-densities', function (R, ctx) {
    var k = kind(R, ctx, ['rod', 'rodQ', 'mc'], ['disk', 'shell', 'ball', 'linx', 'part', 'mc'], ['ballr', 'diskr', 'linx2', 'linx', 'ball']);
    var Q, L, lam, Rr, A, V, b, sig, rho, x1, x2;
    if (k === 'rod') {
      Q = R.pick([6, 8, 9, 12, 15, 18, 24, 30]); L = R.pick([0.20, 0.25, 0.30, 0.40, 0.50, 0.60]); lam = Q / L;
      return P('A thin plastic rod ' + $(gu(L, 'm')) + ' long carries ' + $(gu(Q, 'nC')) + ' spread evenly along it. What is its linear charge density $\\lambda$?',
        num(lam, 'nC/m'), ['Charge along a line is described per unit length: $\\lambda = Q/L$.', $('\\lambda = \\dfrac{' + gu(Q, 'nC') + '}{' + gu(L, 'm') + '} = ' + nu(lam, 'nC/m')), 'Check the unit: charge per length, C/m (here nC/m).'],
        'Divide the charge by the length.', { kind: k, Q: Q, L: L });
    }
    if (k === 'rodQ') {
      lam = R.pick([20, 25, 40, 50, 60, 75]); L = R.pick([0.20, 0.30, 0.40, 0.60, 0.80]); Q = lam * L;
      return P('A straight wire ' + $(gu(L, 'm')) + ' long has a uniform linear charge density $\\lambda = ' + gu(lam, 'nC/m') + '$. How much charge does it carry?',
        num(Q, 'nC'), ['For a uniform line, $Q = \\lambda L$ (the integral $\\int_0^L \\lambda\\,dx$ with $\\lambda$ constant).', $('Q = ' + gu(lam, 'nC/m') + ' \\times ' + gu(L, 'm') + ' = ' + nu(Q, 'nC'))],
        'Charge per meter times meters.', { kind: k, lam: lam, L: L });
    }
    if (k === 'mc') {
      var shape = R.pick(['shell', 'ball', 'ring', 'disk']);
      var right = { shell: '$\\sigma = Q/(4\\pi R^2)$, in C/m²', ball: '$\\rho = Q/(\\tfrac{4}{3}\\pi R^3)$, in C/m³', ring: '$\\lambda = Q/(2\\pi R)$, in C/m', disk: '$\\sigma = Q/(\\pi R^2)$, in C/m²' };
      var all = ['$\\sigma = Q/(4\\pi R^2)$, in C/m²', '$\\rho = Q/(\\tfrac{4}{3}\\pi R^3)$, in C/m³', '$\\lambda = Q/(2\\pi R)$, in C/m', '$\\sigma = Q/(\\pi R^2)$, in C/m²', '$\\lambda = Q/R$, in C/m'];
      var desc = { shell: 'a thin spherical shell of radius $R$ (all the charge on its surface)', ball: 'a solid ball of radius $R$ (charge spread evenly through its volume)', ring: 'a thin ring of radius $R$', disk: 'a flat disk of radius $R$' }[shape];
      var wr = all.filter(function (s) { return s !== right[shape]; }); wr = R.sample(wr, 3);
      return P('A charge $Q$ is spread evenly over ' + desc + '. Which density describes it?', mcq(right[shape], wr),
        ['Ask where the charge lives: along a line (λ, C/m), over a surface (σ, C/m²) or through a volume (ρ, C/m³).', 'Here it is ' + (shape === 'ring' ? 'along a line of length $2\\pi R$' : shape === 'ball' ? 'through a volume $\\tfrac{4}{3}\\pi R^3$' : shape === 'shell' ? 'over a surface of area $4\\pi R^2$' : 'over a surface of area $\\pi R^2$') + ', so ' + right[shape].replace(', in', ' with units of') + '.'],
        'Is the charge on a line, a surface or a volume?', { kind: k, shape: shape });
    }
    if (k === 'disk' || k === 'shell') {
      Q = R.pick([4, 5, 6, 8, 10, 12, 15, 20]); Rr = R.pick([0.04, 0.05, 0.06, 0.08, 0.10, 0.12, 0.15]);
      A = k === 'disk' ? PI * Rr * Rr : 4 * PI * Rr * Rr; sig = Q / A;
      return P((k === 'disk' ? 'A flat disk of radius ' : 'A thin spherical shell of radius ') + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly over ' + (k === 'disk' ? 'its face' : 'its surface') + '. Find the surface charge density $\\sigma$ in nC/m².',
        num(sig, 'nC/m²'), ['Surface density is charge per area: $\\sigma = Q/A$.', 'Area: $A = ' + (k === 'disk' ? '\\pi R^2 = \\pi(' + gv(Rr) + ')^2' : '4\\pi R^2 = 4\\pi(' + gv(Rr) + ')^2') + ' = ' + nu(A, 'm²') + '$ (use meters).', $('\\sigma = \\dfrac{' + gu(Q, 'nC') + '}{' + nu(A, 'm²') + '} = ' + nu(sig, 'nC/m²'))],
        k === 'disk' ? 'The area of a disk is πR²; convert cm to m first.' : 'A sphere\'s surface area is 4πR²; convert cm to m first.', { kind: k, Q: Q, R: Rr });
    }
    if (k === 'ball') {
      Q = R.pick([5, 8, 10, 12, 20, 25, 40]); Rr = R.pick([0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.10]);
      V = 4 / 3 * PI * M.pow(Rr, 3); rho = Q / V / 1000; // μC/m³
      return P('A solid plastic ball of radius ' + $(gu(Rr * 100, 'cm')) + ' has ' + $(gu(Q, 'nC')) + ' spread evenly through its volume. Find the volume charge density $\\rho$ in μC/m³.',
        num(rho, 'μC/m³'), ['Volume density is charge per volume: $\\rho = Q/V$ with $V = \\tfrac{4}{3}\\pi R^3$.', $('V = \\tfrac{4}{3}\\pi(' + gv(Rr) + '\\ \\text{m})^3 = ' + nu(V, 'm³')), $('\\rho = \\dfrac{' + gv(Q) + ' \\times 10^{-9}\\ \\text{C}}{' + nu(V, 'm³') + '} = ' + nu(rho * 1e-6, 'C/m³') + ' = ' + nu(rho, 'μC/m³'))],
        'Use the volume of the ball, not its surface area.', { kind: k, Q: Q, R: Rr });
    }
    if (k === 'linx' || k === 'part') {
      if (k === 'linx') {
        b = R.pick([10, 20, 30, 40, 60, 80]); L = R.pick([0.5, 1.0, 1.5, 2.0]); Q = b * L * L / 2;
        return P('A rod lies along the $x$-axis from $x = 0$ to $x = ' + gu(L, 'm') + '$. Its charge density grows along it: $\\lambda(x) = bx$ with $b = ' + gu(b, 'nC/m²') + '$. What is the total charge on the rod?',
          num(Q, 'nC'), ['A piece $dx$ carries $dq = \\lambda\\,dx = bx\\,dx$.', 'Add the pieces: $Q = \\int_0^{L} bx\\,dx = \\tfrac{1}{2}bL^2$.', $('Q = \\tfrac{1}{2}(' + gv(b) + ')(' + gv(L) + ')^2 = ' + nu(Q, 'nC'))],
          'Write dq = λ dx and integrate over the length.', { kind: k, b: b, L: L });
      }
      lam = R.pick([15, 20, 25, 40, 50]); L = R.pick([1.0, 1.2, 1.5, 2.0]); x1 = R.pick([0.2, 0.3, 0.4]); x2 = x1 + R.pick([0.3, 0.4, 0.5]);
      Q = lam * (x2 - x1);
      return P('A uniformly charged rod ' + $(gu(L, 'm')) + ' long carries ' + $(gu(lam * L, 'nC')) + '. How much of that charge lies between $x = ' + gu(x1, 'm') + '$ and $x = ' + gu(+(x2).toFixed(2), 'm') + '$, measured from one end?',
        num(Q, 'nC'), ['Uniform means $\\lambda = Q/L = ' + gu(lam * L, 'nC') + '/' + gu(L, 'm') + ' = ' + gu(lam, 'nC/m') + '$.', 'The piece is $' + gv(+(x2 - x1).toFixed(2)) + '\\ \\text{m}$ long, so it holds $' + gv(lam) + ' \\times ' + gv(+(x2 - x1).toFixed(2)) + ' = ' + nu(Q, 'nC') + '$.'],
        'Find λ first, then multiply by the length of the piece.', { kind: k, lam: lam, x1: x1, x2: x2 });
    }
    if (k === 'linx2') {
      b = R.pick([30, 60, 90, 120, 150]); L = R.pick([0.5, 1.0, 1.5, 2.0]); Q = b * M.pow(L, 3) / 3;
      return P('A rod along the $x$-axis from $0$ to $' + gu(L, 'm') + '$ has $\\lambda(x) = bx^2$ with $b = ' + gu(b, 'nC/m³') + '$. Find its total charge.',
        num(Q, 'nC'), ['$dq = \\lambda\\,dx = bx^2\\,dx$.', '$Q = \\int_0^L bx^2\\,dx = \\tfrac{1}{3}bL^3$.', $('Q = \\tfrac{1}{3}(' + gv(b) + ')(' + gv(L) + ')^3 = ' + nu(Q, 'nC'))],
        'Integrate λ(x) dx from 0 to L.', { kind: k, b: b, L: L });
    }
    if (k === 'ballr') {
      var r0 = R.pick([10, 20, 30, 40, 50, 60]); Rr = R.pick([0.05, 0.08, 0.10, 0.12]); Q = PI * r0 * 1e-6 * M.pow(Rr, 3) * 1e9; // nC
      return P('A ball of radius $R = ' + gu(Rr * 100, 'cm') + '$ has a charge density that grows from the center outward: $\\rho(r) = \\rho_0\\,r/R$ with $\\rho_0 = ' + gu(r0, 'μC/m³') + '$. Find its total charge in nC.',
        num(Q, 'nC'), ['Cut the ball into thin shells of radius $r$ and thickness $dr$: volume $dV = 4\\pi r^2\\,dr$, so $dq = \\rho_0 \\dfrac{r}{R}\\,4\\pi r^2\\,dr$.', '$$Q = \\frac{4\\pi\\rho_0}{R}\\int_0^R r^3\\,dr = \\frac{4\\pi\\rho_0}{R}\\cdot\\frac{R^4}{4} = \\pi\\rho_0 R^3$$', $('Q = \\pi(' + gv(r0) + ' \\times 10^{-6})(' + gv(Rr) + ')^3 = ' + nu(Q * 1e-9, 'C') + ' = ' + nu(Q, 'nC'))],
        'Use thin shells: dV = 4πr² dr.', { kind: k, rho0: r0, R: Rr });
    }
    // diskr
    var s0 = R.pick([2, 3, 4, 5, 6, 8]); Rr = R.pick([0.05, 0.10, 0.15, 0.20]); Q = 2 * PI * s0 * 1e-6 * Rr * Rr / 3 * 1e9;
    return P('A disk of radius $R = ' + gu(Rr * 100, 'cm') + '$ carries surface charge $\\sigma(r) = \\sigma_0\\,r/R$ with $\\sigma_0 = ' + gu(s0, 'μC/m²') + '$. Find its total charge in nC.',
      num(Q, 'nC'), ['Cut the disk into thin rings of radius $r$ and width $dr$: area $dA = 2\\pi r\\,dr$, so $dq = \\sigma_0\\dfrac{r}{R}\\,2\\pi r\\,dr$.', '$$Q = \\frac{2\\pi\\sigma_0}{R}\\int_0^R r^2\\,dr = \\frac{2\\pi\\sigma_0 R^2}{3}$$', $('Q = \\dfrac{2\\pi(' + gv(s0) + ' \\times 10^{-6})(' + gv(Rr) + ')^2}{3} = ' + nu(Q, 'nC'))],
      'Use thin rings: dA = 2πr dr.', { kind: 'diskr', s0: s0, R: Rr });
  });

  G('em.field-of-rod', function (R, ctx) {
    var k = kind(R, ctx, ['axis', 'axis', 'mc'], ['axis', 'bisect', 'bisect', 'long', 'mc'], ['bisect', 'end', 'endpar', 'long']);
    var Q = R.pick([4, 5, 6, 8, 10, 12, 15]), L = R.pick([0.10, 0.20, 0.30, 0.40]), lam = Q * 1e-9 / L, E, d, a;
    if (k === 'mc') {
      return P('A rod with charge spread evenly along it sits horizontally. Point P is on the perpendicular bisector, above the middle of the rod. When you add up the fields $d\\vec{E}$ of all the small pieces at P, what happens?',
        mcq('The horizontal parts cancel in pairs; only the vertical parts add, so $\\vec{E}$ points straight away from the rod.', ['The vertical parts cancel in pairs; only the horizontal parts add.', 'Nothing cancels, so $E = \\int k\\,dq/r^2$ added as plain numbers.', 'Everything cancels by symmetry, so $E = 0$ at P.']),
        ['Pair each piece on the left with its mirror piece on the right. They are the same distance from P.', 'Their fields have equal size. The horizontal components point in opposite directions and cancel; the vertical components point the same way and add.', 'So only $dE_y = dE\\,\\cos\\theta$ survives, and the field points straight away from the rod (for a positive rod).'],
        'Pair each piece with its mirror image across the bisector.', { kind: k });
    }
    if (k === 'axis') {
      a = R.pick([0.05, 0.08, 0.10, 0.15, 0.20]); E = KC * Q * 1e-9 / (a * (a + L));
      return P('A thin rod of length ' + $(gu(L, 'm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly. Point P lies on the line of the rod, ' + $(gu(a, 'm')) + ' beyond one end. Find the size of the electric field at P.',
        num(E, 'N/C'), ['Put P at the origin and the rod from $x = a$ to $x = a + L$. A piece $dx$ at distance $x$ carries $dq = \\lambda\\,dx$ and makes $dE = k\\lambda\\,dx/x^2$, all pointing along the same line, so the sizes add.',
          '$$E = k\\lambda\\int_a^{a+L}\\frac{dx}{x^2} = k\\lambda\\left(\\frac{1}{a} - \\frac{1}{a+L}\\right) = \\frac{kQ}{a(a+L)}$$',
          '$$E = \\frac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})}{(' + gv(a) + ')(' + gv(+(a + L).toFixed(2)) + ')} = ' + nu(E, 'N/C') + '$$', 'Check: if $a \\gg L$ this becomes $kQ/a^2$, a point charge.'],
        'Every piece pushes along the same line here, so you can add sizes: integrate kλ dx/x² from a to a + L.', { kind: k, Q: Q, L: L, a: a });
    }
    if (k === 'bisect' || k === 'long') {
      if (k === 'long') { L = R.pick([1.0, 1.5, 2.0]); d = R.pick([0.01, 0.015, 0.02, 0.025]); Q = R.pick([20, 30, 40, 50]); lam = Q * 1e-9 / L; }
      else d = R.pick([0.05, 0.08, 0.10, 0.12, 0.15]);
      E = KC * Q * 1e-9 / (d * M.sqrt(d * d + L * L / 4));
      var st = ['Put the rod on the $x$-axis from $-L/2$ to $L/2$ and P at height $d$. A piece $dx$ is $r = \\sqrt{x^2 + d^2}$ from P. The horizontal parts cancel in pairs; the vertical part of each is $dE_y = \\dfrac{k\\lambda\\,dx}{r^2}\\cdot\\dfrac{d}{r}$.',
        '$$E = k\\lambda d\\int_{-L/2}^{L/2}\\frac{dx}{(x^2 + d^2)^{3/2}} = \\frac{kQ}{d\\sqrt{d^2 + L^2/4}}$$ (substitute $x = d\\tan\\theta$).',
        '$$E = \\frac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})}{(' + gv(d) + ')\\sqrt{(' + gv(d) + ')^2 + (' + gv(L / 2) + ')^2}} = ' + nu(E, 'N/C') + '$$'];
      if (k === 'long') st.push('Check: P is very close compared with the length, so the rod looks infinitely long: $2k\\lambda/d = ' + nu(2 * KC * lam / d, 'N/C') + '$, almost the same.');
      return P('A rod ' + $(gu(L, 'm')) + ' long carries ' + $(gu(Q, 'nC')) + ' spread evenly. Find the field at a point ' + $(gu(d * 100, 'cm')) + ' from the rod\'s midpoint, on its perpendicular bisector.',
        num(E, 'N/C'), st, 'Only the components perpendicular to the rod survive. Integrate kλ d dx/(x² + d²)^(3/2).', { kind: k, Q: Q, L: L, d: d });
    }
    // end: P at distance d from one end, perpendicular to the rod
    d = R.pick([0.05, 0.10, 0.15, 0.20]); var Lr = M.sqrt(L * L + d * d), Ey = KC * lam * L / (d * Lr), Ex = KC * lam * (1 / d - 1 / Lr);
    if (k === 'end') {
      return P('A rod lies along the $x$-axis from $x = 0$ to $x = ' + gu(L, 'm') + '$ with ' + $(gu(Q, 'nC')) + ' spread evenly. Find the component of the field perpendicular to the rod, $E_y$, at the point $(0,\\ ' + gu(d, 'm') + ')$, straight above one end.',
        num(Ey, 'N/C'), ['A piece at $x$ is $r = \\sqrt{x^2 + d^2}$ away; its field has a $y$-part $dE_y = \\dfrac{k\\lambda\\,dx}{r^2}\\cdot\\dfrac{d}{r}$. Nothing cancels here, so keep components.', '$$E_y = k\\lambda d\\int_0^L\\frac{dx}{(x^2 + d^2)^{3/2}} = \\frac{k\\lambda L}{d\\sqrt{L^2 + d^2}}$$',
          '$\\lambda = Q/L = ' + nu(lam, 'C/m') + '$, so $$E_y = \\frac{' + tK + '(' + sf(lam) + ')(' + gv(L) + ')}{(' + gv(d) + ')(' + sf(Lr) + ')} = ' + nu(Ey, 'N/C') + '$$'],
        'Write dE_y = kλ d dx/(x² + d²)^(3/2) and integrate from 0 to L.', { kind: k, Q: Q, L: L, d: d });
    }
    return P('A rod lies along the $x$-axis from $x = 0$ to $x = ' + gu(L, 'm') + '$ with ' + $(gu(Q, 'nC')) + ' spread evenly. At the point $(0,\\ ' + gu(d, 'm') + ')$, straight above one end, find the size of the field component parallel to the rod, $|E_x|$.',
      num(Ex, 'N/C'), ['A piece at $x$ is $r = \\sqrt{x^2 + d^2}$ away; its field has an $x$-part of size $\\dfrac{k\\lambda\\,dx}{r^2}\\cdot\\dfrac{x}{r}$, pointing in $-x$ (away from the rod). All of them point the same way, so they add.', '$$|E_x| = k\\lambda\\int_0^L\\frac{x\\,dx}{(x^2 + d^2)^{3/2}} = k\\lambda\\left(\\frac{1}{d} - \\frac{1}{\\sqrt{L^2 + d^2}}\\right)$$ (substitute $u = x^2 + d^2$).',
        '$\\lambda = ' + nu(lam, 'C/m') + '$, so $$|E_x| = ' + tK + '(' + sf(lam) + ')\\left(\\frac{1}{' + gv(d) + '} - \\frac{1}{' + sf(Lr) + '}\\right) = ' + nu(Ex, 'N/C') + '$$'],
      'The x-parts all point the same way here. Integrate kλ x dx/(x² + d²)^(3/2) with u = x² + d².', { kind: 'endpar', Q: Q, L: L, d: d });
  });

  G('em.field-of-ring-disk', function (R, ctx) {
    var k = kind(R, ctx, ['ring', 'ring', 'center'], ['ring', 'disk', 'max', 'center', 'force'], ['disk', 'max', 'half', 'force', 'ring']);
    var Q = R.pick([3, 4, 5, 6, 8, 10, 12]), Rr = R.pick([0.03, 0.04, 0.05, 0.06, 0.08, 0.10]), z, E;
    if (k === 'center') {
      return P('A thin ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly around it. How strong is the electric field at the center of the ring?',
        num(0, 'N/C'), ['Every small piece of the ring has a partner directly across the center, with the same charge at the same distance.', 'Their fields at the center are equal in size and opposite in direction, so they cancel in pairs.', 'So $E = 0$ at the center, even though every piece is only $' + gv(Rr * 100) + '\\ \\text{cm}$ away. (On the axis, $E = kQz/(z^2 + R^2)^{3/2}$ also gives $0$ at $z = 0$.)'],
        'Pair each piece with the piece across the center.', { kind: k });
    }
    if (k === 'ring' || k === 'force') {
      z = R.pick([0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.10, 0.12]); E = KC * Q * 1e-9 * z / M.pow(z * z + Rr * Rr, 1.5);
      var st = ['On the axis, every piece is the same distance $r = \\sqrt{z^2 + R^2}$ away. The sideways parts cancel around the ring; the parts along the axis add, each with the factor $z/r$.', '$$E = \\int\\frac{k\\,dq}{r^2}\\cdot\\frac{z}{r} = \\frac{kQz}{(z^2 + R^2)^{3/2}}$$', '$$E = \\frac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})(' + gv(z) + ')}{\\left((' + gv(z) + ')^2 + (' + gv(Rr) + ')^2\\right)^{3/2}} = ' + nu(E, 'N/C') + '$$'];
      if (k === 'ring') return P('A ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly. Find the field on its axis, ' + $(gu(z * 100, 'cm')) + ' from the center.', num(E, 'N/C'), st, 'Only the components along the axis survive: E = kQz/(z² + R²)^(3/2).', { kind: k, Q: Q, R: Rr, z: z });
      var q = R.pick([1, 2, 3, 5]), F = q * 1e-9 * E * 1e6; // μN
      st.push('The force on the small charge is $F = qE = (' + gv(q) + ' \\times 10^{-9})(' + sf(E) + ') = ' + nu(F, 'μN') + '$.');
      return P('A ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly. A small ' + $(gu(q, 'nC')) + ' charge sits on the ring\'s axis, ' + $(gu(z * 100, 'cm')) + ' from the center. How big is the force on it, in μN?', num(F, 'μN'), st, 'Find E on the axis first, then F = qE.', { kind: k, Q: Q, R: Rr, z: z, q: q });
    }
    if (k === 'max') {
      z = Rr / M.SQRT2;
      return P('Along the axis of a uniformly charged ring of radius ' + $(gu(Rr * 100, 'cm')) + ', the field is zero at the center and fades far away, so it peaks somewhere between. How far from the center (in cm) is the field strongest?',
        num(z * 100, 'cm'), ['On the axis $E(z) = \\dfrac{kQz}{(z^2 + R^2)^{3/2}}$.', 'Set $dE/dz = 0$: $$\\frac{(z^2 + R^2)^{3/2} - z\\cdot 3z(z^2 + R^2)^{1/2}}{(z^2 + R^2)^3} = 0 \\Rightarrow z^2 + R^2 = 3z^2$$', '$z = R/\\sqrt{2} = ' + gv(Rr * 100) + '/\\sqrt{2} = ' + nu(z * 100, 'cm') + '$. The charge does not matter.'],
        'Differentiate kQz/(z² + R²)^(3/2) and set the derivative to zero.', { kind: k, R: Rr });
    }
    var sig = Q * 1e-9 / (PI * Rr * Rr);
    if (k === 'disk') {
      z = R.pick([0.01, 0.02, 0.03, 0.05, 0.08]); E = sig / (2 * EPS0) * (1 - z / M.sqrt(z * z + Rr * Rr));
      return P('A flat disk of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly over its face. Find the field on its axis, ' + $(gu(z * 100, 'cm')) + ' from the center.',
        num(E, 'N/C'), ['Build the disk from rings of radius $r$ and width $dr$, each with $dq = \\sigma\\,2\\pi r\\,dr$ and the ring\'s axial field.', '$$E = \\int_0^R\\frac{kz\\,\\sigma\\,2\\pi r\\,dr}{(z^2 + r^2)^{3/2}} = \\frac{\\sigma}{2\\varepsilon_0}\\left(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\right)$$',
          '$\\sigma = Q/(\\pi R^2) = ' + nu(sig, 'C/m²') + '$, so $\\sigma/(2\\varepsilon_0) = ' + nu(sig / (2 * EPS0), 'N/C') + '$.', '$$E = ' + sf(sig / (2 * EPS0)) + '\\left(1 - \\frac{' + gv(z) + '}{\\sqrt{(' + gv(z) + ')^2 + (' + gv(Rr) + ')^2}}\\right) = ' + nu(E, 'N/C') + '$$'],
        'Add rings: each ring of radius r carries σ·2πr dr. The result is (σ/2ε₀)(1 − z/√(z² + R²)).', { kind: k, Q: Q, R: Rr, z: z });
    }
    // half: where the disk's field is half the sheet value
    z = Rr / M.sqrt(3);
    return P('Close to a large charged disk the field is nearly $\\sigma/(2\\varepsilon_0)$, the value for an infinite sheet. For a disk of radius ' + $(gu(Rr * 100, 'cm')) + ', how far from the center along the axis (in cm) has the field dropped to half of $\\sigma/(2\\varepsilon_0)$?',
      num(z * 100, 'cm'), ['On the axis $E = \\dfrac{\\sigma}{2\\varepsilon_0}\\left(1 - \\dfrac{z}{\\sqrt{z^2 + R^2}}\\right)$.', 'Half the sheet value means $\\dfrac{z}{\\sqrt{z^2 + R^2}} = \\dfrac{1}{2}$, so $4z^2 = z^2 + R^2$ and $z = R/\\sqrt{3}$.', '$z = ' + gv(Rr * 100) + '/\\sqrt{3} = ' + nu(z * 100, 'cm') + '$.'],
      'Set the bracket 1 − z/√(z² + R²) equal to 1/2.', { kind: k, R: Rr });
  });

  G('em.electric-flux', function (R, ctx) {
    var k = kind(R, ctx, ['flat', 'flatS', 'mc'], ['flatS', 'flat', 'face', 'vary', 'mc'], ['vary', 'cubex', 'hemi', 'flatS']);
    var E = R.pick([200, 250, 300, 400, 500, 600, 800, 1200]), s, A, th, Phi;
    if (k === 'flat' || k === 'flatS') {
      s = R.pick([10, 12, 15, 20, 25, 30]); A = sq(s / 100); th = R.pick([20, 25, 30, 35, 40, 50, 55, 60, 70]);
      var cosT = k === 'flat' ? M.cos(deg(th)) : M.sin(deg(th)); Phi = E * A * cosT;
      var q = 'A uniform field of ' + $(gu(E, 'N/C')) + ' passes through a flat square ' + $(gu(s, 'cm')) + ' on a side. ' + (k === 'flat' ? 'The field makes an angle of $' + th + '^\\circ$ with the square\'s normal (the line perpendicular to its face).' : 'The field makes an angle of $' + th + '^\\circ$ with the surface of the square itself.') + ' Find the flux through the square.';
      var st = ['Flux counts the field passing straight through: $\\Phi_E = EA\\cos\\theta$, with $\\theta$ measured from the normal.'];
      if (k === 'flatS') st.push('The angle given is to the surface, so the angle to the normal is $\\theta = 90^\\circ - ' + th + '^\\circ = ' + (90 - th) + '^\\circ$.');
      st.push('$A = (' + gv(s / 100) + '\\ \\text{m})^2 = ' + gu(+A.toPrecision(4), 'm²') + '$.', $('\\Phi_E = (' + gv(E) + ')(' + gv(+A.toPrecision(4)) + ')\\cos ' + (k === 'flat' ? th : 90 - th) + '^\\circ = ' + nu(Phi, 'N·m²/C')));
      return P(q, num(Phi, 'N·m²/C'), st, k === 'flat' ? 'Φ = EA cos θ, with θ from the normal.' : 'Convert the angle to the surface into the angle to the normal first.', { kind: k, E: E, s: s, th: th });
    }
    if (k === 'mc') {
      return P('A flat loop sits in a uniform electric field. In which position is the flux through it largest?', mcq('With its surface perpendicular to the field (the normal along the field)', ['With its surface parallel to the field (the field skims along it)', 'Tilted at 45° to the field', 'The flux is the same in every position']),
        ['$\\Phi_E = EA\\cos\\theta$, with $\\theta$ between the field and the normal.', 'It is largest when $\\theta = 0$: the normal points along the field and every field line passes straight through.', 'When the surface is parallel to the field, $\\theta = 90^\\circ$ and no field passes through: $\\Phi_E = 0$.'],
        'Think about how many field lines pierce the loop.', { kind: k });
    }
    if (k === 'face') {
      s = R.pick([0.10, 0.20, 0.30, 0.40, 0.50]); var which = R.pick(['x0', 'xa', 'top', 'all']);
      Phi = which === 'x0' ? -E * s * s : which === 'xa' ? E * s * s : 0;
      var lbl = { x0: 'the face at $x = 0$', xa: 'the face at $x = ' + gv(s) + '\\ \\text{m}$', top: 'the top face (at $y = ' + gv(s) + '\\ \\text{m}$)', all: 'the whole closed surface of the cube' }[which];
      return P('A uniform field $\\vec{E} = ' + gv(E) + '\\,\\hat{\\imath}\\ \\text{N/C}$ fills a region holding an imaginary cube of side ' + $(gu(s, 'm')) + ', with one corner at the origin and edges along the axes. Using outward normals, find the flux through ' + lbl + '.',
        num(Phi, 'N·m²/C'), ['For a closed surface the normal of each face points outward.', which === 'x0' ? 'The face at $x = 0$ has outward normal $-\\hat{\\imath}$, against the field: $\\Phi = -EA = -(' + gv(E) + ')(' + gv(s) + ')^2 = ' + nu(Phi, 'N·m²/C') + '$. Field enters here, so the flux is negative.' : which === 'xa' ? 'The face at $x = ' + gv(s) + '$ has outward normal $+\\hat{\\imath}$, along the field: $\\Phi = EA = (' + gv(E) + ')(' + gv(s) + ')^2 = ' + nu(Phi, 'N·m²/C') + '$.' : which === 'top' ? 'The top face has outward normal $+\\hat{\\jmath}$, perpendicular to the field, so $\\cos 90^\\circ = 0$ and $\\Phi = 0$.' : 'The flux in at $x = 0$ is $-EA$ and the flux out at the far face is $+EA$; the other four faces get none. Total: $0$. Every field line that enters also leaves.'],
        'Outward normals: the face where the field enters gets a negative flux.', { kind: k, E: E, s: s, which: which });
    }
    if (k === 'vary') {
      var c = R.pick([100, 200, 300, 400, 500]), w = R.pick([0.1, 0.2, 0.3, 0.4]), h = R.pick([0.1, 0.2, 0.3, 0.5]); Phi = c * w * h * h / 2;
      return P('An electric field points along $+z$ and grows with height across the $xy$-plane: $E_z = cy$ with $c = ' + gu(c, 'N/(C·m)') + '$. Find the flux through the rectangle $0 \\le x \\le ' + gv(w) + '\\ \\text{m}$, $0 \\le y \\le ' + gv(h) + '\\ \\text{m}$ in the $xy$-plane (normal $+\\hat{k}$).',
        num(Phi, 'N·m²/C'), ['The field is not uniform, so add up strips. A strip at height $y$ of width $dy$ has area $dA = ' + gv(w) + '\\,dy$ and the field goes straight through it.', '$$\\Phi = \\int_0^{' + gv(h) + '} cy\\,(' + gv(w) + ')\\,dy = \\frac{c\\,(' + gv(w) + ')(' + gv(h) + ')^2}{2}$$', $('\\Phi = \\dfrac{(' + gv(c) + ')(' + gv(w) + ')(' + gv(h) + ')^2}{2} = ' + nu(Phi, 'N·m²/C'))],
        'Use strips parallel to the x-axis, where the field is the same along each strip.', { kind: k, c: c, w: w, h: h });
    }
    if (k === 'cubex') {
      var b = R.pick([100, 200, 300, 500, 800]); s = R.pick([0.1, 0.2, 0.3, 0.5]); Phi = b * M.pow(s, 3);
      return P('The field $\\vec{E} = bx\\,\\hat{\\imath}$, with $b = ' + gu(b, 'N/(C·m)') + '$, fills space. Find the net outward flux through the cube $0 \\le x, y, z \\le ' + gv(s) + '\\ \\text{m}$.',
        num(Phi, 'N·m²/C'), ['Only the two faces perpendicular to $x$ get flux; the field skims the other four.', 'At $x = 0$ the field is zero, so that face gets $0$.', 'At $x = ' + gv(s) + '$ the field is $b(' + gv(s) + ')$ and points out: $\\Phi = b(' + gv(s) + ')(' + gv(s) + ')^2 = b(' + gv(s) + ')^3$.', $('\\Phi = (' + gv(b) + ')(' + gv(s) + ')^3 = ' + nu(Phi, 'N·m²/C')) + '. (Gauss\'s law will say this means charge sits inside.)'],
        'Check each face: which ones does the field pierce, and how strong is it there?', { kind: k, b: b, s: s });
    }
    // hemi
    var Rr = R.pick([0.05, 0.10, 0.15, 0.20]); Phi = E * PI * Rr * Rr;
    return P('A uniform field of ' + $(gu(E, 'N/C')) + ' points straight up. An imaginary hemisphere (a bowl) of radius ' + $(gu(Rr * 100, 'cm')) + ' sits with its round side up and its flat rim level. How much flux passes through the curved surface, with the normal pointing outward (away from the center)?',
      num(Phi, 'N·m²/C'), ['Close the bowl with the flat disk at its rim. The closed surface has no charge inside, so the total flux is $0$.', 'Through the flat disk (outward normal pointing down, against the field) the flux is $-E\\pi R^2$.', 'So the curved part must carry $+E\\pi R^2 = (' + gv(E) + ')\\pi(' + gv(Rr) + ')^2 = ' + nu(Phi, 'N·m²/C') + '$: every line that crosses the rim\'s disk also crosses the bowl.'],
      'Every field line that crosses the bowl also crosses the flat disk at its rim.', { kind: k, E: E, R: Rr });
  });

  G('em.gauss-law', function (R, ctx) {
    var k = kind(R, ctx, ['net', 'net', 'mc'], ['net', 'qenc', 'face', 'hemi', 'mc', 'pic'], ['corner', 'face', 'qenc', 'pic', 'cornerFar']);
    var Phi, q;
    if (k === 'net') {
      var qs = R.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8], 3), ins = [true, R.coin(), false]; ins = R.shuffle(ins);
      if (!ins.some(Boolean)) ins[0] = true;
      var qin = 0; qs.forEach(function (x, i) { if (ins[i]) qin += x; }); if (qin === 0) { qs[ins.indexOf(true)] += 2; qin = 0; qs.forEach(function (x, i) { if (ins[i]) qin += x; }); }
      Phi = qin * 1e-9 / EPS0;
      var desc = qs.map(function (x, i) { return '$q_' + (i + 1) + ' = ' + (x > 0 ? '+' : '') + gu(x, 'nC') + '$ (' + (ins[i] ? 'inside' : 'outside') + ')'; }).join(', ');
      return P('A closed surface surrounds some charges: ' + desc + '. What is the net electric flux out of the surface?',
        num(Phi, 'N·m²/C'), ['Gauss\'s law: $\\oint \\vec{E}\\cdot d\\vec{A} = q_{\\text{enc}}/\\varepsilon_0$. Only the charges inside count.', 'Inside: $q_{\\text{enc}} = ' + qs.filter(function (x, i) { return ins[i]; }).map(function (x) { return '(' + x + ')'; }).join(' + ') + ' = ' + qin + '\\ \\text{nC}$.', $('\\Phi = \\dfrac{' + qin + ' \\times 10^{-9}}{8.85 \\times 10^{-12}} = ' + nu(Phi, 'N·m²/C')) + (qs.some(function (x, i) { return !ins[i]; }) ? ' The outside charge changes the field on the surface, but its lines go in and come back out, adding nothing.' : '')],
        'Add up only the charges inside, then divide by ε₀.', { kind: k, qs: qs, ins: ins });
    }
    if (k === 'qenc') {
      q = R.pick([2, 3, 4, 5, 6, 8, -2, -3, -5]); Phi = q * 1e-9 / EPS0; var shown = +Phi.toPrecision(3);
      return P('Measurements show a net flux of ' + $(gu(shown, 'N·m²/C')) + ' out through a closed surface. How much net charge is inside, in nC?',
        num(shown * EPS0 * 1e9, 'nC'), ['Gauss\'s law turned around: $q_{\\text{enc}} = \\varepsilon_0\\,\\Phi$.', $('q_{\\text{enc}} = (8.85 \\times 10^{-12})(' + gv(shown) + ') = ' + nu(shown * EPS0, 'C') + ' = ' + nu(shown * EPS0 * 1e9, 'nC')) + (q < 0 ? ' Negative flux (more field going in than out) means negative charge inside.' : '')],
        'q_enc = ε₀Φ.', { kind: k, Phi: shown });
    }
    if (k === 'face' || k === 'hemi') {
      q = R.pick([3, 4, 5, 6, 8, 9, 12]);
      Phi = q * 1e-9 / EPS0 / (k === 'face' ? 6 : 2);
      return P(k === 'face' ? 'A point charge of ' + $(gu(q, 'nC')) + ' sits at the exact center of a cube. How much flux passes through one face of the cube?' : 'A point charge of ' + $(gu(q, 'nC')) + ' sits at the center of a sphere. How much flux passes through the upper half (a hemisphere) of that sphere?',
        num(Phi, 'N·m²/C'), ['The whole closed surface gets $q/\\varepsilon_0 = ' + nu(q * 1e-9 / EPS0, 'N·m²/C') + '$.', k === 'face' ? 'By symmetry the six faces share it equally: $\\Phi = \\dfrac{q}{6\\varepsilon_0} = ' + nu(Phi, 'N·m²/C') + '$.' : 'By symmetry the two halves share it equally: $\\Phi = \\dfrac{q}{2\\varepsilon_0} = ' + nu(Phi, 'N·m²/C') + '$.'],
        'Find the total flux with Gauss\'s law, then share it out by symmetry.', { kind: k, q: q });
    }
    if (k === 'corner' || k === 'cornerFar') {
      q = R.pick([4, 6, 8, 12, 16, 24]); Phi = q * 1e-9 / EPS0 / (k === 'corner' ? 8 : 24);
      return P('A point charge of ' + $(gu(q, 'nC')) + ' sits exactly at one corner of an imaginary cube. ' + (k === 'corner' ? 'How much flux passes out through the cube as a whole?' : 'How much flux passes through one of the three faces that do not touch that corner?'),
        num(Phi, 'N·m²/C'), ['Picture eight identical cubes meeting at the charge: together they surround it, so together they get $q/\\varepsilon_0$, and each gets $q/(8\\varepsilon_0)$.', k === 'corner' ? '$\\Phi = \\dfrac{q}{8\\varepsilon_0} = \\dfrac{' + gv(q) + ' \\times 10^{-9}}{8(8.85 \\times 10^{-12})} = ' + nu(Phi, 'N·m²/C') + '$.' : 'In our cube, the three faces that touch the corner lie along field lines from the charge (the field skims them), so they get no flux. The three far faces share $q/(8\\varepsilon_0)$ equally: $\\Phi = \\dfrac{q}{24\\varepsilon_0} = ' + nu(Phi, 'N·m²/C') + '$.'],
        'How many identical cubes would it take to surround the charge completely?', { kind: k, q: q });
    }
    if (k === 'pic') {
      var cs = [{ q: R.pick([2, 3, 4, 5]), x: -0.05, y: 0.03 }, { q: -R.pick([1, 2, 3]), x: 0.05, y: -0.04 }, { q: R.pick([1, 2, 3, 4, 6]), x: 0.22, y: 0.1 }];
      if (R.coin()) cs[2] = { q: -R.pick([2, 4, 5]), x: -0.22, y: -0.08 };
      var qi = cs[0].q + cs[1].q; Phi = qi * 1e-9 / EPS0;
      return P('The dashed circle is a closed Gaussian surface (a sphere seen in cross section). Charges are labeled in nC. What is the net flux out through the surface?',
        num(Phi, 'N·m²/C'), ['Only the charges inside the surface count: $' + cs[0].q + ' + (' + cs[1].q + ') = ' + qi + '\\ \\text{nC}$. The charge outside sends lines in and back out.', $('\\Phi = \\dfrac{' + qi + ' \\times 10^{-9}}{8.85 \\times 10^{-12}} = ' + nu(Phi, 'N·m²/C'))],
        'Which charges are inside the dashed circle?', { kind: k, qs: cs },
        { viz: { name: 'ph-efield', opts: { mode: 'gauss', charges: cs, surface: { x: 0, y: 0, r: 0.12 }, interactive: false, quiet: true, hide: ['flux'] } } });
    }
    // mc
    return P('A positive charge sits inside a closed surface, and a second charge sits outside it. If you move the outside charge closer to the surface (still outside), what happens to the net flux through the surface?',
      mcq('It stays the same', ['It increases', 'It decreases', 'It depends on the sign of the outside charge']),
      ['Gauss\'s law: the net flux is $q_{\\text{enc}}/\\varepsilon_0$, and the enclosed charge has not changed.', 'The outside charge does change the field at points on the surface, but every field line it sends into the surface comes back out somewhere else: it adds as much negative flux as positive flux.', 'So the net flux stays the same.'],
      'What does Gauss\'s law say the net flux depends on?', { kind: 'mc' });
  });

  G('em.gauss-spheres', function (R, ctx) {
    var k = kind(R, ctx, ['ballout', 'ballin', 'shellin', 'mc'], ['ballin', 'concentric', 'ratio', 'mc', 'ballin'], ['nonuni', 'thick', 'concentric', 'ballin']);
    var Q = R.pick([4, 5, 6, 8, 10, 12, 15, 20]), Rr = R.pick([0.04, 0.05, 0.06, 0.08, 0.10]), r, E;
    if (k === 'ballout' || k === 'ballin' || k === 'shellin') {
      r = k === 'ballout' ? Rr * R.pick([1.5, 2, 2.5, 3]) : Rr * R.pick([0.25, 0.4, 0.5, 0.6, 0.75]);
      E = k === 'shellin' ? 0 : k === 'ballout' ? KC * Q * 1e-9 / (r * r) : KC * Q * 1e-9 * r / M.pow(Rr, 3);
      var obj = k === 'shellin' ? 'A thin spherical shell' : 'A solid ball';
      var st = k === 'ballout' ? ['Use a Gaussian sphere of radius $r$ outside the ball: it encloses all of $Q$, and by symmetry $E$ is the same all over it.', '$E(4\\pi r^2) = Q/\\varepsilon_0$, so $E = kQ/r^2$, as if all the charge sat at the center.', '$$E = \\frac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})}{(' + gv(+r.toFixed(4)) + ')^2} = ' + nu(E, 'N/C') + '$$']
        : k === 'ballin' ? ['Use a Gaussian sphere of radius $r$ inside the ball. It encloses only the fraction $(r/R)^3$ of the charge: $q_{\\text{enc}} = Q\\,r^3/R^3$.', '$E(4\\pi r^2) = \\dfrac{Q r^3}{\\varepsilon_0 R^3}$, so $E = \\dfrac{kQr}{R^3}$: it grows in step with $r$.', '$$E = \\frac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})(' + gv(+r.toFixed(4)) + ')}{(' + gv(Rr) + ')^3} = ' + nu(E, 'N/C') + '$$']
          : ['A Gaussian sphere inside the shell encloses no charge at all: $q_{\\text{enc}} = 0$.', 'By symmetry $E$ is the same all over that sphere, so $E(4\\pi r^2) = 0$ and $E = 0$ everywhere inside. The pulls from all parts of the shell cancel exactly.'];
      return P(obj + ' of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly ' + (k === 'shellin' ? 'over its surface' : 'through its volume') + '. Find the field ' + $(gu(+(r * 100).toFixed(2), 'cm')) + ' from the center.',
        num(E, 'N/C'), st, k === 'ballin' ? 'Inside a uniform ball, only the charge closer to the center than r counts.' : k === 'shellin' ? 'How much charge does a Gaussian sphere inside the shell enclose?' : 'Outside, the ball acts like a point charge at its center.', { kind: k, Q: Q, R: Rr, r: r });
    }
    if (k === 'concentric') {
      var q1 = R.pick([2, 3, 4, 5, -2, -3]), Q2 = R.pick([-6, -4, 3, 5, 6, 8]); var out = R.coin(); r = out ? Rr * R.pick([1.5, 2]) : Rr * R.pick([0.5, 0.6]);
      var qe = out ? q1 + Q2 : q1; if (qe === 0) { Q2 += 2; qe = out ? q1 + Q2 : q1; }
      E = KC * M.abs(qe) * 1e-9 / (r * r);
      return P('A point charge $q_1 = ' + gu(q1, 'nC') + '$ sits at the center of a thin spherical shell of radius ' + $(gu(Rr * 100, 'cm')) + ' that carries $Q_2 = ' + gu(Q2, 'nC') + '$ spread evenly. Find the size of the field ' + $(gu(+(r * 100).toFixed(2), 'cm')) + ' from the center.',
        num(E, 'N/C'), ['Draw a Gaussian sphere of radius $r = ' + gv(+(r * 100).toFixed(2)) + '\\ \\text{cm}$. ' + (out ? 'It is outside the shell, so it encloses both charges: $q_{\\text{enc}} = ' + q1 + ' + (' + Q2 + ') = ' + qe + '\\ \\text{nC}$.' : 'It is inside the shell, so it encloses only the point charge: $q_{\\text{enc}} = ' + q1 + '\\ \\text{nC}$. The shell adds nothing inside.'),
          $('E = \\dfrac{k|q_{\\text{enc}}|}{r^2} = \\dfrac{' + tK + '(' + M.abs(qe) + ' \\times 10^{-9})}{(' + gv(+r.toFixed(4)) + ')^2} = ' + nu(E, 'N/C'))],
        'Which charges does a Gaussian sphere through the point enclose?', { kind: k, q1: q1, Q2: Q2, R: Rr, r: r });
    }
    if (k === 'ratio') {
      var f = R.pick([0.5, 0.25, 0.75, 2, 3]);
      var ratio = f < 1 ? f : 1 / (f * f);
      return P('A solid ball carries charge spread evenly through its volume. The field at its surface is $E_s$. What is the field at ' + (f < 1 ? 'a point $' + (f === 0.5 ? '\\tfrac{1}{2}' : f === 0.25 ? '\\tfrac{1}{4}' : '\\tfrac{3}{4}') + 'R$ from the center' : 'a distance $' + f + 'R$ from the center') + ', as a multiple of $E_s$? (Type a number such as 0.5.)',
        { t: 'num', v: pl(ratio, 4), rtol: 0.01 }, [f < 1 ? 'Inside a uniform ball $E = kQr/R^3$ grows in proportion to $r$, so $E/E_s = r/R = ' + f + '$.' : 'Outside, $E = kQ/r^2$ falls as $1/r^2$, so $E/E_s = (R/r)^2 = 1/' + (f * f) + ' = ' + sf(ratio) + '$.'],
        f < 1 ? 'Inside a uniform ball, E is proportional to r.' : 'Outside, E falls off as 1/r².', { kind: k, f: f });
    }
    if (k === 'nonuni') {
      var r0 = R.pick([10, 20, 30, 40, 50]); r = Rr * R.pick([0.5, 0.6, 0.8]); E = r0 * 1e-6 * r * r / (4 * EPS0 * Rr);
      return P('A ball of radius $R = ' + gu(Rr * 100, 'cm') + '$ has charge density $\\rho(r) = \\rho_0\\,r/R$ with $\\rho_0 = ' + gu(r0, 'μC/m³') + '$. Find the field inside it, ' + $(gu(+(r * 100).toFixed(2), 'cm')) + ' from the center.',
        num(E, 'N/C'), ['Charge inside radius $r$: $$q(r) = \\int_0^r \\rho_0\\frac{s}{R}\\,4\\pi s^2\\,ds = \\frac{\\pi\\rho_0 r^4}{R}$$', 'Gauss: $E(4\\pi r^2) = \\dfrac{\\pi\\rho_0 r^4}{\\varepsilon_0 R}$, so $E = \\dfrac{\\rho_0 r^2}{4\\varepsilon_0 R}$.', '$$E = \\frac{(' + gv(r0) + ' \\times 10^{-6})(' + gv(+r.toFixed(4)) + ')^2}{4' + tE0 + '(' + gv(Rr) + ')} = ' + nu(E, 'N/C') + '$$'],
        'Find the charge inside radius r by integrating ρ over thin shells, then use Gauss\'s law.', { kind: k, rho0: r0, R: Rr, r: r });
    }
    if (k === 'thick') {
      var a = Rr, b = Rr * 2, rh = R.pick([4, 5, 8, 10, 20]); r = a * R.pick([1.25, 1.5, 1.75]);
      E = rh * 1e-6 * (M.pow(r, 3) - M.pow(a, 3)) / (3 * EPS0 * r * r);
      return P('A thick spherical shell has inner radius ' + $(gu(a * 100, 'cm')) + ' and outer radius ' + $(gu(b * 100, 'cm')) + ', with charge spread evenly through the material at $\\rho = ' + gu(rh, 'μC/m³') + '$. Find the field ' + $(gu(+(r * 100).toFixed(2), 'cm')) + ' from the center (inside the material).',
        num(E, 'N/C'), ['A Gaussian sphere of radius $r$ encloses the material between $a$ and $r$: $q_{\\text{enc}} = \\rho\\cdot\\tfrac{4}{3}\\pi(r^3 - a^3)$.', 'Gauss: $E(4\\pi r^2) = q_{\\text{enc}}/\\varepsilon_0$, so $E = \\dfrac{\\rho(r^3 - a^3)}{3\\varepsilon_0 r^2}$.', '$$E = \\frac{(' + gv(rh) + ' \\times 10^{-6})\\left((' + gv(+r.toFixed(4)) + ')^3 - (' + gv(a) + ')^3\\right)}{3' + tE0 + '(' + gv(+r.toFixed(4)) + ')^2} = ' + nu(E, 'N/C') + '$$'],
        'The hollow middle holds no charge; enclose only the material from a out to r.', { kind: k, rho: rh, a: a, r: r });
    }
    return P('A solid insulating ball has charge spread evenly through its volume. What is the field at a point inside the ball, halfway from the center to the surface?',
      mcq('Half as strong as the field at the surface', ['Zero, just as inside a charged shell', 'The same as at the surface', 'Four times as strong as at the surface']),
      ['Draw a Gaussian sphere through the point. Unlike a shell, the ball has charge inside that sphere: the fraction $(1/2)^3 = 1/8$ of the total.', '$E(4\\pi r^2) = q_{\\text{enc}}/\\varepsilon_0$ gives $E = kQr/R^3$, which grows in step with $r$.', 'At $r = R/2$ the field is half the surface value. It is zero only at the very center.'],
      'How much charge does a Gaussian sphere through that point enclose?', { kind: 'mc' });
  });

  G('em.gauss-lines-planes', function (R, ctx) {
    var k = kind(R, ctx, ['line', 'sheet', 'mc'], ['line', 'linerev', 'two', 'cyl', 'mc'], ['two', 'cyl', 'coax', 'slab']);
    var lam = R.pick([2, 3, 4, 5, 6, 8, 10]), r = R.pick([0.02, 0.03, 0.04, 0.05, 0.08, 0.10, 0.15]), E, sig;
    if (k === 'line') {
      E = lam * 1e-9 / (2 * PI * EPS0 * r);
      return P('A very long straight wire carries ' + $(gu(lam, 'nC/m')) + '. Find the field ' + $(gu(r * 100, 'cm')) + ' from the wire.',
        num(E, 'N/C'), ['Use a Gaussian cylinder of radius $r$ and length $\\ell$ around the wire. The field points straight out from the wire, so only the curved side gets flux: $E(2\\pi r\\ell)$.', 'It encloses $\\lambda\\ell$, so $E(2\\pi r\\ell) = \\lambda\\ell/\\varepsilon_0$ and $E = \\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}$.', '$$E = \\frac{' + gv(lam) + ' \\times 10^{-9}}{2\\pi' + tE0 + '(' + gv(r) + ')} = ' + nu(E, 'N/C') + '$$'],
        'A Gaussian cylinder around the wire: only its curved side gets flux.', { kind: k, lam: lam, r: r });
    }
    if (k === 'linerev') {
      E = R.pick([1200, 1800, 2400, 3600, 4500, 5400, 9000]); var L2 = 2 * PI * EPS0 * r * E * 1e9;
      return P('The field ' + $(gu(r * 100, 'cm')) + ' from a long charged wire is ' + $(gu(E, 'N/C')) + ', pointing away from the wire. What is the wire\'s charge per length, in nC/m?',
        num(L2, 'nC/m'), ['For a long line, $E = \\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}$, so $\\lambda = 2\\pi\\varepsilon_0 r E$.', $('\\lambda = 2\\pi' + tE0 + '(' + gv(r) + ')(' + gv(E) + ') = ' + nu(L2 * 1e-9, 'C/m') + ' = ' + nu(L2, 'nC/m')), 'Pointing away means the wire is positive.'],
        'Solve E = λ/(2πε₀r) for λ.', { kind: k, E: E, r: r });
    }
    if (k === 'sheet') {
      sig = R.pick([2, 3, 4, 5, 6, 8, 10]); var dd = R.pick([1, 2, 5, 10, 20]); E = sig * 1e-9 / (2 * EPS0);
      return P('A large flat sheet carries ' + $(gu(sig, 'nC/m²')) + '. Find the field ' + $(gu(dd, 'cm')) + ' from the sheet (far from its edges).',
        num(E, 'N/C'), ['Use a Gaussian pillbox (a short cylinder) that pokes through the sheet, with end caps of area $A$ on both sides. The field is perpendicular to the sheet, so only the two caps get flux: $2EA$.', 'It encloses $\\sigma A$: $2EA = \\sigma A/\\varepsilon_0$, so $E = \\dfrac{\\sigma}{2\\varepsilon_0}$, with no distance in it.', $('E = \\dfrac{' + gv(sig) + ' \\times 10^{-9}}{2' + tE0 + '} = ' + nu(E, 'N/C')) + '. The ' + gv(dd) + ' cm does not enter.'],
        'A pillbox through the sheet. Does the answer depend on the distance?', { kind: k, sig: sig, d: dd });
    }
    if (k === 'two') {
      var s1 = R.pick([2, 3, 4, 5, 6, 8]), s2 = R.pick([-6, -4, -3, -2, 2, 3, 5, 7]); if (s1 === s2) s2 = -s2; var where = R.pick(['between', 'outside']);
      E = (where === 'between' ? M.abs(s1 - s2) : M.abs(s1 + s2)) * 1e-9 / (2 * EPS0);
      if (E === 0) { s2 = -s1 + 1; E = (where === 'between' ? M.abs(s1 - s2) : M.abs(s1 + s2)) * 1e-9 / (2 * EPS0); }
      return P('Two large parallel sheets carry $\\sigma_1 = ' + gu(s1, 'nC/m²') + '$ (left) and $\\sigma_2 = ' + gu(s2, 'nC/m²') + '$ (right). Find the size of the field ' + (where === 'between' ? 'between the sheets' : 'to the right of both sheets') + '.',
        num(E, 'N/C'), ['Each sheet makes $\\sigma/(2\\varepsilon_0)$ on both sides, pointing away from it if positive and toward it if negative. Add the two with signs (take $+x$ to the right).',
          where === 'between' ? 'Between them: sheet 1 pushes right ($+\\sigma_1/2\\varepsilon_0$) and sheet 2, on the other side, contributes $-\\sigma_2/2\\varepsilon_0$. So $E = (\\sigma_1 - \\sigma_2)/(2\\varepsilon_0) = (' + s1 + ' - (' + s2 + '))\\times 10^{-9}/(2\\varepsilon_0)$.' : 'To the right of both, each sheet contributes $+\\sigma/(2\\varepsilon_0)$: $E = (\\sigma_1 + \\sigma_2)/(2\\varepsilon_0) = (' + s1 + ' + (' + s2 + '))\\times 10^{-9}/(2\\varepsilon_0)$.',
          '$|E| = ' + nu(E, 'N/C') + '$.'],
        'Superpose two sheet fields of σ/(2ε₀) each, keeping track of direction.', { kind: k, s1: s1, s2: s2, where: where });
    }
    if (k === 'cyl') {
      var Rc = R.pick([0.02, 0.03, 0.04, 0.05]), rho = R.pick([2, 4, 5, 8, 10]), inn = R.coin(); r = inn ? Rc * R.pick([0.5, 0.75]) : Rc * R.pick([2, 3]);
      E = inn ? rho * 1e-6 * r / (2 * EPS0) : rho * 1e-6 * Rc * Rc / (2 * EPS0 * r);
      return P('A long solid cylinder of radius ' + $(gu(Rc * 100, 'cm')) + ' has charge spread evenly through it, $\\rho = ' + gu(rho, 'μC/m³') + '$. Find the field ' + $(gu(+(r * 100).toFixed(2), 'cm')) + ' from its axis.',
        num(E, 'N/C'), ['Gaussian cylinder of radius $r$, length $\\ell$: flux $E(2\\pi r\\ell)$.', inn ? 'Inside, it encloses $\\rho\\pi r^2\\ell$: $E = \\dfrac{\\rho r}{2\\varepsilon_0}$.' : 'Outside, it encloses all the charge in that length, $\\rho\\pi R^2\\ell$: $E = \\dfrac{\\rho R^2}{2\\varepsilon_0 r}$.',
          inn ? $('E = \\dfrac{(' + gv(rho) + ' \\times 10^{-6})(' + gv(+r.toFixed(4)) + ')}{2' + tE0 + '} = ' + nu(E, 'N/C')) : $('E = \\dfrac{(' + gv(rho) + ' \\times 10^{-6})(' + gv(Rc) + ')^2}{2' + tE0 + '(' + gv(+r.toFixed(4)) + ')} = ' + nu(E, 'N/C'))],
        'Is the Gaussian cylinder inside or outside the charge?', { kind: k, R: Rc, rho: rho, r: r });
    }
    if (k === 'coax') {
      var l1 = R.pick([3, 4, 5, 6, 8]), l2 = R.pick([-8, -6, -4, -3, -2, 2]); var a = 0.01, b = 0.04, w2 = R.coin(); r = w2 ? 0.02 : 0.06; var le = w2 ? l1 : l1 + l2; if (le === 0) { l2 = -l1 + 1; le = w2 ? l1 : l1 + l2; }
      E = M.abs(le) * 1e-9 / (2 * PI * EPS0 * r);
      return P('A coaxial cable has a thin central wire carrying $\\lambda_1 = ' + gu(l1, 'nC/m') + '$ and a thin outer cylindrical shell of radius ' + $(gu(b * 100, 'cm')) + ' carrying $\\lambda_2 = ' + gu(l2, 'nC/m') + '$. Find the size of the field ' + $(gu(r * 100, 'cm')) + ' from the axis.',
        num(E, 'N/C'), ['A Gaussian cylinder of radius ' + gv(r * 100) + ' cm ' + (w2 ? 'lies inside the outer shell, so it encloses only $\\lambda_1$.' : 'lies outside both, so it encloses $\\lambda_1 + \\lambda_2 = ' + le + '\\ \\text{nC/m}$.'), $('E = \\dfrac{|\\lambda_{\\text{enc}}|}{2\\pi\\varepsilon_0 r} = \\dfrac{' + M.abs(le) + ' \\times 10^{-9}}{2\\pi' + tE0 + '(' + gv(r) + ')} = ' + nu(E, 'N/C'))],
        'Only the charge per length inside the Gaussian cylinder counts.', { kind: k, l1: l1, l2: l2, r: r });
    }
    if (k === 'slab') {
      var h = R.pick([0.01, 0.02, 0.03]), rs = R.pick([2, 3, 5, 10]), x = h * R.pick([0.5, 0.25, 0.75]), insd = R.coin(); if (!insd) x = h * 2;
      E = insd ? rs * 1e-6 * x / EPS0 : rs * 1e-6 * h / EPS0;
      return P('A large flat slab of thickness ' + $(gu(2 * h * 100, 'cm')) + ' has charge spread evenly through it, $\\rho = ' + gu(rs, 'μC/m³') + '$. Find the field ' + $(gu(+(x * 100).toFixed(2), 'cm')) + ' from the slab\'s middle plane.',
        num(E, 'N/C'), ['By symmetry the field is zero on the middle plane and points straight out on both sides. Use a pillbox with one cap on the middle plane and the other at distance $x$.', insd ? 'It encloses $\\rho A x$: $EA = \\rho A x/\\varepsilon_0$, so $E = \\rho x/\\varepsilon_0$.' : 'Beyond the surface it encloses $\\rho A h$ (half the thickness): $E = \\rho h/\\varepsilon_0$, the same at every distance outside.', $('E = ' + nu(E, 'N/C'))],
        'Put one cap of the pillbox on the middle plane, where E = 0.', { kind: k, h: h, rho: rs, x: x });
    }
    return P('You measure the field 1 cm from a large uniformly charged sheet, then 5 cm from it (still far from its edges). How do the two compare?',
      mcq('They are the same', ['The field at 5 cm is 1/25 as strong', 'The field at 5 cm is 1/5 as strong', 'The field at 5 cm is zero']),
      ['A pillbox through the sheet gives $2EA = \\sigma A/\\varepsilon_0$, so $E = \\sigma/(2\\varepsilon_0)$ with no distance in it.', 'Why: as you move away, each piece of the sheet is farther, but more of the sheet points its field toward you rather than sideways. The two effects cancel exactly for an infinite sheet.', 'For a real, finite sheet this holds while you stay close compared with its size.'],
      'Does the distance appear in E = σ/(2ε₀)?', { kind: 'mc' });
  });

  G('em.conductors', function (R, ctx) {
    var k = kind(R, ctx, ['shellIn', 'shellOut', 'sigE', 'mc'], ['shellOut', 'sphereE', 'Esig', 'regions', 'mc'], ['regions', 'shellOut', 'sphereE']);
    var q = R.pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), Qs = R.pick([-6, -3, -2, 0, 2, 4, 5, 8]);
    if (k === 'shellIn' || k === 'shellOut') {
      var ans = k === 'shellIn' ? -q : q + Qs;
      return P('A point charge of ' + $(gu(q, 'nC')) + ' sits at the center of a hollow metal sphere (a thick conducting shell) that carries a net charge of ' + $(gu(Qs, 'nC')) + '. How much charge is on the shell\'s ' + (k === 'shellIn' ? 'inner' : 'outer') + ' surface, in nC?',
        { t: 'num', v: String(ans) }, ['Inside the metal $E = 0$. A Gaussian sphere drawn within the metal therefore has zero flux, so the charge it encloses is zero: the inner surface must hold $' + (-q) + '\\ \\text{nC}$ to cancel the point charge.',
          'The shell\'s total is ' + Qs + ' nC, and charge is conserved, so the outer surface holds the rest: $' + Qs + ' - (' + (-q) + ') = ' + (q + Qs) + '\\ \\text{nC}$.', 'Answer: ' + (k === 'shellIn' ? 'inner surface $' + ans + '\\ \\text{nC}$.' : 'outer surface $' + ans + '\\ \\text{nC}$.')],
        'Draw a Gaussian sphere inside the metal, where E = 0.', { kind: k, q: q, Qs: Qs }, { unit: 'nC' });
    }
    if (k === 'sigE' || k === 'Esig') {
      var sig = R.pick([5, 8, 10, 20, 25, 40, 50]);
      if (k === 'sigE') { var E = sig * 1e-9 / EPS0; return P('A charged metal object has surface charge density ' + $(gu(sig, 'nC/m²')) + ' on a flat part of its surface. How strong is the field just outside that part?', num(E, 'N/C'), ['Use a tiny pillbox with one cap just outside the surface and one inside the metal. Inside, $E = 0$; the sides get no flux because the field outside is perpendicular to the surface.', 'So $EA = \\sigma A/\\varepsilon_0$ and $E = \\sigma/\\varepsilon_0$. (Twice the $\\sigma/2\\varepsilon_0$ of a lone sheet, because all the field goes out one side.)', $('E = \\dfrac{' + gv(sig) + ' \\times 10^{-9}}{8.85 \\times 10^{-12}} = ' + nu(E, 'N/C'))], 'Just outside a conductor, E = σ/ε₀.', { kind: k, sig: sig }); }
      var E2 = R.pick([1000, 2000, 3000, 4500, 6000, 9000]), s2 = E2 * EPS0 * 1e9;
      return P('Just outside the surface of a charged metal plate, the field is ' + $(gu(E2, 'N/C')) + ', pointing away from the plate. What is the surface charge density there, in nC/m²?', num(s2, 'nC/m²'), ['Just outside a conductor $E = \\sigma/\\varepsilon_0$, so $\\sigma = \\varepsilon_0 E$.', $('\\sigma = (8.85 \\times 10^{-12})(' + gv(E2) + ') = ' + nu(s2, 'nC/m²')) + ', positive because the field points away.'], 'σ = ε₀E just outside a conductor.', { kind: k, E: E2 });
    }
    if (k === 'sphereE') {
      var Q = R.pick([2, 4, 5, 8, 10, 15]), Rr = R.pick([0.05, 0.10, 0.15, 0.20]), sg = Q * 1e-9 / (4 * PI * Rr * Rr), Ex = sg / EPS0;
      return P('A solid metal sphere of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + '. Find the field just outside its surface.', num(Ex, 'N/C'),
        ['The charge spreads evenly over the surface: $\\sigma = Q/(4\\pi R^2) = ' + nu(sg, 'C/m²') + '$.', 'Just outside, $E = \\sigma/\\varepsilon_0 = ' + nu(Ex, 'N/C') + '$.', 'Check with Gauss for a sphere: $kQ/R^2 = ' + nu(KC * Q * 1e-9 / (Rr * Rr), 'N/C') + '$, the same.'],
        'All the charge is on the surface. E just outside is σ/ε₀, or kQ/R².', { kind: k, Q: Q, R: Rr });
    }
    if (k === 'regions') {
      var a = 0.05, b = 0.08, rr = R.pick([0.03, 0.06, 0.12]), qe = rr < a ? q : rr < b ? null : q + Qs; if (qe === 0) { Qs += 1; qe = q + Qs; }
      var Ef = qe === null ? 0 : KC * M.abs(qe) * 1e-9 / (rr * rr);
      return P('A point charge of ' + $(gu(q, 'nC')) + ' sits at the center of a thick metal shell with inner radius 5 cm and outer radius 8 cm. The shell carries net charge ' + $(gu(Qs, 'nC')) + '. Find the size of the field ' + $(gu(rr * 100, 'cm')) + ' from the center.',
        num(Ef, 'N/C'), [rr < a ? 'At ' + gv(rr * 100) + ' cm we are in the hollow. A Gaussian sphere there encloses only the point charge.' : rr < b ? 'At ' + gv(rr * 100) + ' cm we are inside the metal, where the field is zero in electrostatic equilibrium.' : 'At ' + gv(rr * 100) + ' cm we are outside. A Gaussian sphere encloses the point charge and the whole shell: $' + q + ' + (' + Qs + ') = ' + qe + '\\ \\text{nC}$.',
          qe === null ? '$E = 0$.' : $('E = \\dfrac{k|q_{\\text{enc}}|}{r^2} = \\dfrac{' + tK + '(' + M.abs(qe) + ' \\times 10^{-9})}{(' + gv(rr) + ')^2} = ' + nu(Ef, 'N/C'))],
        'Which region is the point in: the hollow, the metal or outside?', { kind: k, q: q, Qs: Qs, r: rr });
    }
    return P('A solid copper ball is given some extra negative charge. Once everything settles, where is that extra charge?',
      mcq('On the outer surface of the ball', ['Spread evenly through the whole volume', 'Packed at the center', 'Half on the surface and half at the center']),
      ['In a conductor, charges are free to move. If there were any field inside, they would keep moving, so at equilibrium $E = 0$ inside the metal.', 'A Gaussian surface drawn anywhere inside the metal then has zero flux, so it encloses zero net charge.', 'The only place left for the extra charge is the outer surface. (The electrons repel each other and spread as far apart as they can.)'],
      'What is the field inside a conductor at equilibrium, and what does Gauss\'s law then say?', { kind: 'mc' });
  });


  // ================================================================ Unit 2: Electric Potential

  G('em.potential-from-field', function (R, ctx) {
    var k = kind(R, ctx, ['uniform', 'uniform', 'point', 'mc'], ['uniform', 'point', 'line', 'Ex', 'shellin', 'mc'], ['Ex', 'line', 'ball', 'point']);
    var dV, q, r1, r2;
    if (k === 'uniform') {
      var E = R.pick([200, 250, 300, 400, 500, 600, 800]), d = R.pick([0.05, 0.10, 0.15, 0.20, 0.30, 0.40]), th = R.pick([0, 0, 180, 60, 120, 37, 90]);
      dV = -E * d * M.cos(deg(th)); if (M.abs(dV) < 1e-9) dV = 0;
      var how = th === 0 ? 'in the direction of the field' : th === 180 ? 'straight against the field' : 'at $' + th + '^\\circ$ to the field direction';
      return P('A uniform electric field of ' + $(gu(E, 'N/C')) + ' points along $+x$. Point B is ' + $(gu(d * 100, 'cm')) + ' from point A, ' + how + '. Find $V_B - V_A$.',
        { a: { t: 'num', v: pl(dV === 0 ? 0 : dV), rtol: 0.02 }, unit: 'V' }, ['$\\Delta V = -\\int_A^B \\vec{E}\\cdot d\\vec{\\ell}$. In a uniform field this is $-E\\,d\\cos\\theta$, with $\\theta$ the angle between the field and the step.',
          $('V_B - V_A = -(' + gv(E) + ')(' + gv(d) + ')\\cos ' + th + '^\\circ = ' + (dV === 0 ? '0' : sf(dV)) + '\\ \\text{V}'), th === 90 ? 'Moving across the field changes nothing: A and B are on the same equipotential.' : dV < 0 ? 'Going with the field, the potential drops.' : 'Going against the field, the potential rises.'],
        'ΔV = −E d cos θ. Potential falls along the field.', { kind: k, E: E, d: d, th: th });
    }
    if (k === 'point') {
      q = R.pick([2, 3, 4, 5, 6, 8, -2, -4, -5]); r1 = R.pick([0.02, 0.03, 0.04, 0.05]); r2 = r1 * R.pick([2, 3, 4, 5]);
      dV = KC * q * 1e-9 * (1 / r2 - 1 / r1);
      return P('A point charge of ' + $(gu(q, 'nC')) + ' sits at the origin. Point A is ' + $(gu(r1 * 100, 'cm')) + ' from it and point B is ' + $(gu(+(r2 * 100).toFixed(1), 'cm')) + ' from it. Find $V_B - V_A$ by integrating the field.',
        { a: { t: 'num', v: pl(dV), rtol: 0.02 }, unit: 'V' }, ['Go straight out along a radius: $\\vec{E}\\cdot d\\vec{\\ell} = \\dfrac{kq}{r^2}\\,dr$.', '$$V_B - V_A = -\\int_{r_A}^{r_B}\\frac{kq}{r^2}\\,dr = kq\\left(\\frac{1}{r_B} - \\frac{1}{r_A}\\right)$$',
          '$$= ' + tK + '(' + gv(q) + ' \\times 10^{-9})\\left(\\frac{1}{' + gv(+r2.toFixed(3)) + '} - \\frac{1}{' + gv(r1) + '}\\right) = ' + nu(dV, 'V') + '$$'],
        'Integrate −kq/r² dr from r_A to r_B.', { kind: k, q: q, r1: r1, r2: r2 });
    }
    if (k === 'line') {
      var lam = R.pick([2, 3, 4, 5, 8, 10]); r1 = R.pick([0.01, 0.02, 0.05]); r2 = r1 * R.pick([2, 3, 4, 5, 10]);
      dV = -lam * 1e-9 / (2 * PI * EPS0) * M.log(r2 / r1);
      return P('A long straight wire carries ' + $(gu(lam, 'nC/m')) + '. Find the potential difference $V_B - V_A$ between a point A ' + $(gu(r1 * 100, 'cm')) + ' from the wire and a point B ' + $(gu(+(r2 * 100).toFixed(1), 'cm')) + ' from it.',
        { a: { t: 'num', v: pl(dV), rtol: 0.02 }, unit: 'V' }, ['The field of a long line is $E = \\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}$, pointing straight out.', '$$V_B - V_A = -\\int_{r_A}^{r_B}\\frac{\\lambda}{2\\pi\\varepsilon_0 r}\\,dr = -\\frac{\\lambda}{2\\pi\\varepsilon_0}\\ln\\frac{r_B}{r_A}$$',
          '$$= -\\frac{' + gv(lam) + ' \\times 10^{-9}}{2\\pi' + tE0 + '}\\ln ' + gv(+(r2 / r1).toFixed(2)) + ' = ' + nu(dV, 'V') + '$$', 'Only differences make sense here: $V = 0$ at infinity would make every point infinite for an endless line.'],
        'Integrate the line\'s field λ/(2πε₀r) from r_A to r_B; you get a logarithm.', { kind: k, lam: lam, r1: r1, r2: r2 });
    }
    if (k === 'Ex') {
      var c = R.pick([100, 200, 300, 600, 900]), x1 = R.pick([0, 1, 2]), x2 = x1 + R.pick([1, 2, 3]);
      dV = -c * (M.pow(x2, 3) - M.pow(x1, 3)) / 3;
      return P('Along the $x$-axis the field is $E_x = cx^2$ with $c = ' + gu(c, 'V/m³') + '$ ($x$ in meters). Find $V(' + x2 + '\\ \\text{m}) - V(' + x1 + '\\ \\text{m})$.',
        { a: { t: 'num', v: pl(dV), rtol: 0.02 }, unit: 'V' }, ['$$V(x_2) - V(x_1) = -\\int_{x_1}^{x_2} cx^2\\,dx = -\\frac{c}{3}\\left(x_2^3 - x_1^3\\right)$$', $('= -\\dfrac{' + gv(c) + '}{3}\\left(' + x2 + '^3 - ' + x1 + '^3\\right) = ' + nu(dV, 'V')), 'Negative: the field points along $+x$, so the potential falls as $x$ grows.'],
        'ΔV = −∫E_x dx.', { kind: k, c: c, x1: x1, x2: x2 });
    }
    if (k === 'shellin') {
      var Q = R.pick([2, 3, 4, 5, 6, 8]), Rr = R.pick([0.05, 0.10, 0.15, 0.20]), rr = Rr * R.pick([0.25, 0.5, 0.75]), V0 = KC * Q * 1e-9 / Rr;
      return P('A thin spherical shell of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + '. Taking $V = 0$ far away, find the potential ' + $(gu(+(rr * 100).toFixed(2), 'cm')) + ' from the center (inside the shell).',
        num(V0, 'V'), ['Come in from infinity. Outside, $E = kQ/r^2$, so at the shell $V(R) = kQ/R$.', 'Inside, $E = 0$, so moving inward adds nothing: $\\Delta V = -\\int E\\,dr = 0$.', $('V = \\dfrac{kQ}{R} = \\dfrac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})}{' + gv(Rr) + '} = ' + nu(V0, 'V')) + ', the same everywhere inside.'],
        'Inside the shell E = 0, so V does not change from its value at the shell.', { kind: k, Q: Q, R: Rr, r: rr });
    }
    if (k === 'ball') {
      var Qb = R.pick([2, 4, 5, 6, 10]), Rb = R.pick([0.05, 0.10, 0.20]), Vc = 1.5 * KC * Qb * 1e-9 / Rb;
      return P('A ball of radius ' + $(gu(Rb * 100, 'cm')) + ' holds ' + $(gu(Qb, 'nC')) + ' spread evenly through its volume. Taking $V = 0$ far away, find the potential at its center.',
        num(Vc, 'V'), ['At the surface, as for a point charge, $V(R) = kQ/R$.', 'Inside, $E = kQr/R^3$, so $$V(0) - V(R) = -\\int_R^0 \\frac{kQr}{R^3}\\,dr = \\frac{kQ}{2R}.$$', $('V(0) = \\dfrac{kQ}{R} + \\dfrac{kQ}{2R} = \\dfrac{3kQ}{2R} = ' + nu(Vc, 'V')) + '. It is highest at the center, where $E = 0$.'],
        'Integrate in two pieces: from infinity to the surface, then from the surface to the center using E = kQr/R³.', { kind: k, Q: Qb, R: Rb });
    }
    return P('An electron and a proton are both released from rest in a region where the electric field points to the right. Which statement about potential is true?',
      mcq('The potential decreases toward the right, the direction the field points', ['The potential increases toward the right, the direction the field points', 'The potential is the same everywhere, since the field is the same everywhere', 'The potential decreases toward the right for the proton but increases for the electron']),
      ['$\\Delta V = -\\int \\vec{E}\\cdot d\\vec{\\ell}$: stepping along the field makes $\\vec{E}\\cdot d\\vec{\\ell}$ positive, so $V$ goes down.', 'Potential belongs to the place, not to the charge that visits it, so it is the same for both particles.', 'The proton moves toward lower potential and the electron toward higher potential, but the potential itself falls to the right.'],
      'Mind the minus sign in ΔV = −∫E·dl.', { kind: 'mc' });
  });

  G('em.potential-of-distributions', function (R, ctx) {
    var k = kind(R, ctx, ['ringcenter', 'ringaxis', 'mc'], ['ringaxis', 'arc', 'rodaxis', 'uneven', 'work', 'mc'], ['disk', 'rodaxis', 'rodbis', 'work']);
    var Q = R.pick([2, 3, 4, 5, 6, 8, 10]), Rr = R.pick([0.03, 0.04, 0.05, 0.06, 0.08, 0.10]), V, z;
    if (k === 'ringcenter' || k === 'uneven' || k === 'arc') {
      V = KC * Q * 1e-9 / Rr;
      var obj = k === 'arc' ? 'A thin wire bent into a ' + R.pick(['semicircle', 'quarter circle', 'three-quarter circle']) + ' of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly. Find the potential at the center of the circle it is part of.'
        : k === 'uneven' ? 'A ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ', but the charge is bunched up: most of it sits on one side. Find the potential at the center of the ring.'
          : 'A ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly. Find the potential at its center (taking $V = 0$ far away).';
      return P(obj, num(V, 'V'), ['Potential adds as plain numbers: $V = \\int \\dfrac{k\\,dq}{r}$, with no directions to worry about.', 'Every piece of charge is the same distance $R$ from the center, so $V = \\dfrac{k}{R}\\int dq = \\dfrac{kQ}{R}$' + (k === 'uneven' ? ', however the charge is arranged around the ring.' : k === 'arc' ? ', whatever fraction of the circle the wire covers.' : '.'),
        $('V = \\dfrac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})}{' + gv(Rr) + '} = ' + nu(V, 'V'))],
        'Every piece is the same distance from the center, and potentials add as plain numbers.', { kind: k, Q: Q, R: Rr });
    }
    if (k === 'ringaxis' || k === 'work') {
      z = R.pick([0.02, 0.03, 0.04, 0.05, 0.08, 0.12]); V = KC * Q * 1e-9 / M.sqrt(z * z + Rr * Rr);
      var st = ['Every piece of the ring is $r = \\sqrt{z^2 + R^2}$ from the point, so $$V = \\int\\frac{k\\,dq}{r} = \\frac{kQ}{\\sqrt{z^2 + R^2}}.$$', $('V = \\dfrac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})}{\\sqrt{(' + gv(z) + ')^2 + (' + gv(Rr) + ')^2}} = ' + nu(V, 'V'))];
      if (k === 'ringaxis') return P('A ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly. Find the potential on its axis, ' + $(gu(z * 100, 'cm')) + ' from the center.', num(V, 'V'), st, 'All pieces are the same distance √(z² + R²) away.', { kind: k, Q: Q, R: Rr, z: z });
      var q = R.pick([1, 2, 3, 5]), W = q * 1e-9 * V * 1e6; // μJ
      st.push('The work needed to bring the charge in slowly from far away is $W = qV = (' + gv(q) + ' \\times 10^{-9})(' + sf(V) + ') = ' + nu(W, 'μJ') + '$.');
      return P('A ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly. How much work (in μJ) does it take to bring a ' + $(gu(q, 'nC')) + ' charge from far away to a point on the axis ' + $(gu(z * 100, 'cm')) + ' from the center?', num(W, 'μJ'), st, 'Find V at the point, then W = qV.', { kind: k, Q: Q, R: Rr, z: z, q: q });
    }
    var L = R.pick([0.10, 0.20, 0.30, 0.40]), lam = Q * 1e-9 / L;
    if (k === 'rodaxis') {
      var a = R.pick([0.05, 0.10, 0.15, 0.20]); V = KC * lam * M.log((a + L) / a);
      return P('A rod ' + $(gu(L, 'm')) + ' long carries ' + $(gu(Q, 'nC')) + ' spread evenly. Find the potential at a point on the rod\'s line, ' + $(gu(a, 'm')) + ' beyond one end.',
        num(V, 'V'), ['A piece $dx$ at distance $x$ adds $dV = k\\lambda\\,dx/x$.', '$$V = \\int_a^{a+L}\\frac{k\\lambda\\,dx}{x} = k\\lambda\\ln\\frac{a + L}{a}$$', '$\\lambda = Q/L = ' + nu(lam, 'C/m') + '$, so $$V = ' + tK + '(' + sf(lam) + ')\\ln\\frac{' + gv(+(a + L).toFixed(2)) + '}{' + gv(a) + '} = ' + nu(V, 'V') + '$$'],
        'Integrate kλ dx/x from a to a + L.', { kind: k, Q: Q, L: L, a: a });
    }
    if (k === 'rodbis') {
      var d = R.pick([0.05, 0.10, 0.15]), h = L / 2, s = M.sqrt(h * h + d * d); V = 2 * KC * lam * M.log((h + s) / d);
      return P('A rod ' + $(gu(L, 'm')) + ' long carries ' + $(gu(Q, 'nC')) + ' spread evenly. Find the potential ' + $(gu(d * 100, 'cm')) + ' from its midpoint, on the perpendicular bisector.',
        num(V, 'V'), ['A piece at $x$ is $\\sqrt{x^2 + d^2}$ away and adds $k\\lambda\\,dx/\\sqrt{x^2 + d^2}$. No components: potential is a number.', '$$V = k\\lambda\\int_{-L/2}^{L/2}\\frac{dx}{\\sqrt{x^2 + d^2}} = 2k\\lambda\\ln\\frac{L/2 + \\sqrt{L^2/4 + d^2}}{d}$$', '$\\lambda = ' + nu(lam, 'C/m') + '$: $$V = 2' + tK + '(' + sf(lam) + ')\\ln\\frac{' + gv(h) + ' + ' + sf(s) + '}{' + gv(d) + '} = ' + nu(V, 'V') + '$$'],
        'Use ∫dx/√(x² + d²) = ln(x + √(x² + d²)).', { kind: k, Q: Q, L: L, d: d });
    }
    if (k === 'disk') {
      z = R.pick([0.02, 0.03, 0.05, 0.10]); var sig = Q * 1e-9 / (PI * Rr * Rr); V = sig / (2 * EPS0) * (M.sqrt(z * z + Rr * Rr) - z);
      return P('A disk of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + ' spread evenly over its face. Find the potential on its axis, ' + $(gu(z * 100, 'cm')) + ' from the center.',
        num(V, 'V'), ['Build the disk from rings: a ring of radius $r$ and width $dr$ holds $dq = \\sigma\\,2\\pi r\\,dr$ and adds $k\\,dq/\\sqrt{z^2 + r^2}$.', '$$V = \\int_0^R \\frac{k\\sigma 2\\pi r\\,dr}{\\sqrt{z^2 + r^2}} = \\frac{\\sigma}{2\\varepsilon_0}\\left(\\sqrt{z^2 + R^2} - z\\right)$$',
          '$\\sigma = ' + nu(sig, 'C/m²') + '$, so $$V = \\frac{' + sf(sig) + '}{2' + tE0 + '}\\left(\\sqrt{(' + gv(z) + ')^2 + (' + gv(Rr) + ')^2} - ' + gv(z) + '\\right) = ' + nu(V, 'V') + '$$'],
        'Add rings, each contributing k dq/√(z² + r²), with dq = σ·2πr dr.', { kind: k, Q: Q, R: Rr, z: z });
    }
    return P('A ring has $+Q$ spread evenly over its top half and $-Q$ over its bottom half. What are the potential $V$ and the field $\\vec{E}$ at its center?',
      mcq('$V = 0$, but $\\vec{E} \\neq 0$', ['$V = 0$ and $\\vec{E} = 0$', '$V = 2kQ/R$ and $\\vec{E} = 0$', '$V \\neq 0$ and $\\vec{E} = 0$']),
      ['Potential is a sum of numbers: $kQ/R$ from the top half and $-kQ/R$ from the bottom half add to $V = 0$.', 'The field is a sum of arrows. Positive charge above pushes the field down at the center; negative charge below pulls it down too. The arrows add: $\\vec{E}$ points down, toward the negative half.', 'So $V = 0$ does not mean $E = 0$.'],
      'Add V as numbers and E as arrows.', { kind: 'mc' });
  });

  G('em.field-from-potential', function (R, ctx) {
    var k = kind(R, ctx, ['poly', 'poly', 'graph', 'mc'], ['poly', 'grad', 'graph', 'radial', 'mc'], ['grad', 'radial', 'ring', 'grad']);
    if (k === 'poly') {
      var a = R.nz(-6, 6), b = R.int(-20, 20), c0 = R.int(-10, 10), x0 = R.pick([-2, -1, 1, 2, 3, 0.5]);
      var Ex = -(2 * a * x0 + b);
      return P('The potential along the $x$-axis is $V(x) = ' + T.poly([a, b, c0], 'x') + '$ (in volts, with $x$ in meters). Find $E_x$ at $x = ' + gv(x0) + '\\ \\text{m}$.',
        { a: { t: 'num', v: pl(Ex === 0 ? 0 : Ex), rtol: 0.001 }, unit: 'V/m' }, ['$E_x = -\\dfrac{dV}{dx} = -(' + T.lin(2 * a, 'x', b) + ')$.', $('E_x(' + gv(x0) + ') = -(' + T.num(2 * a) + '(' + gv(x0) + ')' + T.signed(b) + ') = ' + T.num(Ex === 0 ? 0 : Ex) + '\\ \\text{V/m}') + (Ex > 0 ? ' (the field points along $+x$, downhill in $V$).' : Ex < 0 ? ' (the field points along $-x$, downhill in $V$).' : ' (the potential is flat here).')],
        'E_x is minus the slope of V(x).', { kind: k, a: a, b: b, x0: x0 });
    }
    if (k === 'graph') {
      var pts = [[0, R.int(0, 4) * 10]], x = 0, regs = [];
      for (var i = 0; i < 3; i++) { var dx = R.pick([1, 2]), dv = R.pick([-40, -30, -20, -10, 0, 10, 20, 30]); x += dx; pts.push([x, pts[i][1] + dv]); regs.push({ x0: x - dx, x1: x, E: -dv / (dx * 0.01) }); }
      var ri = R.int(0, 2), reg = regs[ri], xm = (reg.x0 + reg.x1) / 2;
      var ys = pts.map(function (p) { return p[1]; }), lo = M.min.apply(null, ys), hi = M.max.apply(null, ys);
      return P('The graph shows the potential $V$ along the $x$-axis (with $x$ in centimeters). Find $E_x$ at $x = ' + gv(xm) + '\\ \\text{cm}$.',
        { a: { t: 'num', v: pl(reg.E === 0 ? 0 : reg.E), rtol: 0.01 }, unit: 'V/m' }, ['$E_x = -dV/dx$: minus the slope of the graph.', 'Between $x = ' + reg.x0 + '$ and $' + reg.x1 + '\\ \\text{cm}$, $V$ goes from $' + pts[ri][1] + '$ to $' + pts[ri + 1][1] + '\\ \\text{V}$: a slope of $\\dfrac{' + (pts[ri + 1][1] - pts[ri][1]) + '\\ \\text{V}}{' + gv((reg.x1 - reg.x0) / 100) + '\\ \\text{m}} = ' + T.num(-reg.E === 0 ? 0 : -reg.E) + '\\ \\text{V/m}$.', '$E_x = ' + T.num(reg.E === 0 ? 0 : reg.E) + '\\ \\text{V/m}$.' + (reg.E === 0 ? ' Where V is flat the field is zero, whatever the value of V.' : '')],
        'Read the slope of the segment that contains the point, in volts per meter, and change its sign.', { kind: k, pts: pts, ri: ri },
        { viz: { name: 'ph-graph', opts: { pts: pts, domain: [0, x], range: [M.min(0, lo - 10), hi + 10], xlab: 'x', ylab: 'V', xunit: 'cm', yunit: 'V', tool: 'none', drag: false, interactive: false, quiet: true } } });
    }
    if (k === 'grad') {
      var A = R.nz(-4, 4), B = R.nz(-5, 5), C = R.nz(-6, 6), P0 = [R.nz(-2, 2), R.nz(-2, 2), R.nz(-2, 2)];
      // V = A x^2 y + B y z + C z
      var Ex2 = -(2 * A * P0[0] * P0[1]), Ey = -(A * P0[0] * P0[0] + B * P0[2]), Ez = -(B * P0[1] + C);
      return P('In a region of space $V(x, y, z) = ' + T.terms([[A, 'x^{2}y'], [B, 'yz'], [C, 'z']]) + '$ (volts, with coordinates in meters). Find $\\vec{E}$ at the point $' + T.pt(P0) + '$, as components $(E_x, E_y, E_z)$ in V/m.',
        { a: { t: 'tuple', v: [String(Ex2 || 0), String(Ey || 0), String(Ez || 0)] }, unit: 'V/m' }, ['$\\vec{E} = -\\nabla V = -\\left(\\dfrac{\\partial V}{\\partial x}, \\dfrac{\\partial V}{\\partial y}, \\dfrac{\\partial V}{\\partial z}\\right)$.', '$\\dfrac{\\partial V}{\\partial x} = ' + T.mono(2 * A, 'xy') + '$, $\\dfrac{\\partial V}{\\partial y} = ' + T.terms([[A, 'x^{2}'], [B, 'z']]) + '$, $\\dfrac{\\partial V}{\\partial z} = ' + T.terms([[B, 'y'], [C, '']]) + '$.',
          'At $' + T.pt(P0) + '$: $\\vec{E} = ' + T.pt([Ex2 || 0, Ey || 0, Ez || 0]) + '\\ \\text{V/m}$.'],
        'Take each partial derivative, put in the point, and change every sign.', { kind: k, A: A, B: B, C: C, P0: P0 });
    }
    if (k === 'radial') {
      var Cc = R.pick([20, 40, 50, 80, 120]), n = R.pick([1, 2]), r = R.pick([0.1, 0.2, 0.5, 2]);
      var Er = n * Cc / M.pow(r, n + 1);
      return P('Around a small charged object the potential is $V(r) = \\dfrac{C}{' + (n === 1 ? 'r' : 'r^{' + n + '}') + '}$ with $C = ' + gv(Cc) + '\\ \\text{V·m}' + (n === 2 ? '^2' : '') + '$ (in some direction, with $r$ in meters). Find the radial field $E_r$ at $r = ' + gv(r) + '\\ \\text{m}$.',
        num(Er, 'V/m'), ['$E_r = -\\dfrac{dV}{dr} = -\\dfrac{d}{dr}\\left(Cr^{' + (n === 1 ? '-1' : '-' + n) + '}\\right) = \\dfrac{' + (n === 1 ? '' : n) + 'C}{r^{' + (n + 1) + '}}$.', $('E_r = \\dfrac{' + (n === 1 ? '' : n) + '(' + gv(Cc) + ')}{(' + gv(r) + ')^{' + (n + 1) + '}} = ' + nu(Er, 'V/m')) + ', pointing outward (V falls as r grows).'],
        'E_r = −dV/dr.', { kind: k, C: Cc, n: n, r: r });
    }
    if (k === 'ring') {
      var Q = R.pick([2, 4, 5, 8]), Rr = R.pick([0.03, 0.05, 0.10]), z = R.pick([0.02, 0.04, 0.05, 0.08]), Ez2 = KC * Q * 1e-9 * z / M.pow(z * z + Rr * Rr, 1.5);
      return P('On the axis of a ring of radius ' + $(gu(Rr * 100, 'cm')) + ' carrying ' + $(gu(Q, 'nC')) + ', the potential is $V(z) = kQ/\\sqrt{z^2 + R^2}$. Use it to find $E_z$ at $z = ' + gu(z * 100, 'cm') + '$.',
        num(Ez2, 'V/m'), ['$E_z = -\\dfrac{dV}{dz} = -kQ\\cdot\\left(-\\tfrac{1}{2}\\right)(z^2 + R^2)^{-3/2}\\cdot 2z = \\dfrac{kQz}{(z^2 + R^2)^{3/2}}$, the ring\'s field, with no components to fuss over.', '$$E_z = \\frac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})(' + gv(z) + ')}{\\left((' + gv(z) + ')^2 + (' + gv(Rr) + ')^2\\right)^{3/2}} = ' + nu(Ez2, 'V/m') + '$$'],
        'Differentiate V(z) with the chain rule and change the sign.', { kind: k, Q: Q, R: Rr, z: z });
    }
    return P('Midway between a $+q$ and a $-q$ charge, the potential is zero. What is the electric field there?',
      mcq('Not zero: it points from the $+q$ toward the $-q$', ['Zero, because the potential is zero', 'Zero, because the two fields cancel', 'Not zero: it points from the $-q$ toward the $+q$']),
      ['$V = kq/d - kq/d = 0$ at the midpoint, but the field depends on how $V$ <i>changes</i>, not on its value: $E = -dV/dx$.', 'Moving from the $+q$ toward the $-q$, $V$ drops from positive to negative, so the slope is steep there and $E$ is large.', 'Both charges\' fields point toward the $-q$ at the midpoint, so they add.'],
      'E depends on the slope of V, not on V itself.', { kind: 'mc' });
  });

  G('em.energy-of-charges', function (R, ctx) {
    var k = kind(R, ctx, ['line3', 'pairs', 'mc'], ['line3', 'tri', 'square', 'work'], ['square', 'work', 'tri', 'right']);
    var U = 0, i, j;
    if (k === 'pairs') {
      var N = R.int(4, 9);
      return P('How many terms $kq_iq_j/r_{ij}$ do you add to find the electric potential energy of a group of ' + N + ' point charges?',
        { t: 'num', v: String(N * (N - 1) / 2) }, ['Each pair of charges counts once.', 'Each of the ' + N + ' charges pairs with the other ' + (N - 1) + ', but that counts every pair twice: $\\dfrac{' + N + '\\cdot' + (N - 1) + '}{2} = ' + (N * (N - 1) / 2) + '$.'],
        'Count pairs, not ordered pairs.', { kind: k, N: N });
    }
    if (k === 'mc') {
      return P('Three charges are arranged so that their total electric potential energy (zero when they are far apart) is negative. What does that tell you?',
        mcq('Pulling them apart to infinite separation would take positive work from outside', ['They would fly apart on their own if released', 'At least one of the charges must be zero', 'The arrangement stores energy that pushes the charges apart']),
        ['$U$ is the work needed to assemble the charges from far apart. Negative $U$ means assembling them released energy: attractions won.', 'So separating them again needs that much work done on them from outside. Left alone, the group tends to pull together, not fly apart.'],
        'U is the work to bring the charges together from far apart.', { kind: 'mc' });
    }
    var qs, pos, d, s;
    if (k === 'line3') { d = R.pick([0.10, 0.20, 0.30]); qs = [R.pick([2, 3, 4]), R.pick([-2, -1, 1, 2, -3]), R.pick([1, 2, 3, -2])]; pos = [[0, 0], [d, 0], [2 * d, 0]]; }
    else if (k === 'tri') { s = R.pick([0.10, 0.20, 0.30]); qs = [R.pick([2, 3, 4]), R.pick([-2, -1, 1, 2]), R.pick([1, 2, 3, -3])]; pos = [[0, 0], [s, 0], [s / 2, s * M.sqrt(3) / 2]]; }
    else if (k === 'right') { s = 0.10; qs = [R.pick([2, 3, 4]), R.pick([-2, -1, 1, 2]), R.pick([1, 2, -3])]; pos = [[0, 0], [0.3, 0], [0, 0.4]]; }
    else { s = R.pick([0.10, 0.20]); var qq = R.pick([1, 2, 3]); qs = R.coin() ? [qq, qq, qq, qq] : [qq, -qq, qq, -qq]; pos = [[0, 0], [s, 0], [s, s], [0, s]]; }
    var terms = [];
    for (var tries = 0; tries < 6; tries++) {
      U = 0; terms = [];
      for (i = 0; i < qs.length; i++) for (j = i + 1; j < qs.length; j++) { var rij = M.hypot(pos[i][0] - pos[j][0], pos[i][1] - pos[j][1]); U += KC * qs[i] * qs[j] * 1e-12 / rij; terms.push('\\frac{(' + qs[i] + ')(' + qs[j] + ')}{' + sf(rij) + '}'); }
      if (M.abs(U) > 1e-3) break; qs[qs.length - 1] += qs[qs.length - 1] > 0 ? 1 : -1; // avoid an arrangement whose energy is exactly zero
    }
    var desc = k === 'line3' ? 'Three charges sit in a line, ' + $(gu(d, 'm')) + ' apart: $' + qs.map(function (x) { return gu(x, 'μC'); }).join(',\\ ') + '$ in that order.'
      : k === 'tri' ? 'Charges of $' + qs.map(function (x) { return gu(x, 'μC'); }).join(',\\ ') + '$ sit at the corners of an equilateral triangle with sides of ' + $(gu(s, 'm')) + '.'
        : k === 'right' ? 'Three charges sit at the corners of a right triangle: $q_1 = ' + gu(qs[0], 'μC') + '$ at the right angle, $q_2 = ' + gu(qs[1], 'μC') + '$ at the end of the 0.30 m leg and $q_3 = ' + gu(qs[2], 'μC') + '$ at the end of the 0.40 m leg.'
          : 'Four charges sit at the corners of a square with sides of ' + $(gu(s, 'm')) + ', going around: $' + qs.map(function (x) { return gu(x, 'μC'); }).join(',\\ ') + '$.';
    var npairs = terms.length;
    if (k === 'work') {
      var qn = R.pick([1, 2, -1, -2]), sq0 = 0.2, base = [[0, 0], [sq0, 0], [sq0, sq0]], qb = [R.pick([2, 3]), R.pick([-1, 1, 2]), R.pick([2, 3, -2])], tgt = [0, sq0];
      var Vp = 0, st2 = []; base.forEach(function (b, ii) { var rr = M.hypot(b[0] - tgt[0], b[1] - tgt[1]); Vp += KC * qb[ii] * 1e-6 / rr; st2.push('\\frac{(' + qb[ii] + ' \\times 10^{-6})}{' + sf(rr) + '}'); });
      var W = qn * 1e-6 * Vp;
      return P('Charges of $' + qb.map(function (x) { return gu(x, 'μC'); }).join(',\\ ') + '$ sit at three corners of a square with sides of 0.20 m: $(0, 0)$, $(0.20, 0)$ and $(0.20, 0.20)$ m. How much work does it take to bring a fourth charge, ' + $(gu(qn, 'μC')) + ', from far away to the empty corner $(0, 0.20)$?',
        num(W, 'J', 0.02), ['The work equals the new charge times the potential the others make at the corner: $W = qV$. Only the new pairs count; the energy of the first three does not change.', '$$V = k\\left(' + st2.join(' + ') + '\\right) = ' + nu(Vp, 'V') + '$$', $('W = qV = (' + gv(qn) + ' \\times 10^{-6})(' + sf(Vp) + ') = ' + nu(W, 'J')) + (W < 0 ? ' Negative: the charge is pulled in, so you would have to hold it back.' : '')],
        'W = qV, with V from the three charges already there.', { kind: k, qb: qb, qn: qn });
    }
    return P(desc + ' Find the electric potential energy of the arrangement (zero when the charges are far apart).',
      num(U, 'J', 0.02), ['Add $kq_iq_j/r_{ij}$ once for each pair: ' + npairs + ' pairs here.', '$$U = (8.99 \\times 10^{9})(10^{-12})\\left(' + terms.join(' + ') + '\\right)$$', $('U = ' + nu(U, 'J')) + (U < 0 ? ' Negative: attractions win, and it would take outside work to pull the charges apart.' : '')],
      'One term per pair. The charges in μC give a factor of 10⁻¹² in each product.', { kind: k, qs: qs, pos: pos });
  });

  G('em.energy-conservation-charges', function (R, ctx) {
    var k = kind(R, ctx, ['electron', 'proton', 'mc'], ['electron', 'release', 'closest', 'proton', 'mc'], ['release', 'closest', 'two']);
    var dV, v, K0;
    if (k === 'electron' || k === 'proton') {
      dV = R.pick([50, 100, 150, 200, 500, 1000, 2000]); var m = k === 'electron' ? ME : MP; v = M.sqrt(2 * QE * dV / m);
      return P('A' + (k === 'electron' ? 'n electron' : ' proton') + ' starts from rest and is accelerated through a potential difference of ' + $(gu(dV, 'V')) + '. How fast is it moving at the end? (' + (k === 'electron' ? '$m_e = 9.11 \\times 10^{-31}\\ \\text{kg}$' : '$m_p = 1.67 \\times 10^{-27}\\ \\text{kg}$') + ', $e = 1.60 \\times 10^{-19}\\ \\text{C}$)',
        num(v, 'm/s'), ['Energy is conserved: $\\Delta K = -q\\Delta V$. ' + (k === 'electron' ? 'The electron is negative, so it speeds up moving toward <i>higher</i> potential, gaining $e\\,|\\Delta V|$.' : 'The proton speeds up moving toward lower potential, gaining $e\\,|\\Delta V|$.'),
          $('K = (1.60 \\times 10^{-19})(' + gv(dV) + ') = ' + nu(QE * dV, 'J') + ' = ' + gv(dV) + '\\ \\text{eV}'), $('v = \\sqrt{\\dfrac{2K}{m}} = \\sqrt{\\dfrac{2(' + sf(QE * dV) + ')}{' + (k === 'electron' ? '9.11 \\times 10^{-31}' : '1.67 \\times 10^{-27}') + '}} = ' + nu(v, 'm/s'))],
        'Set ½mv² equal to e|ΔV|.', { kind: k, dV: dV });
    }
    if (k === 'release') {
      var Q = R.pick([2, 4, 5, 8, 10]), r1 = R.pick([1, 2, 5]) * 1e-3, toInf = R.coin(), r2 = toInf ? Infinity : r1 * R.pick([2, 4, 5]);
      var dU = KC * Q * 1e-9 * QE * (1 / r1 - (toInf ? 0 : 1 / r2)); v = M.sqrt(2 * dU / MP);
      return P('A proton is released from rest ' + $(gu(r1 * 1000, 'mm')) + ' from a fixed ' + $(gu(Q, 'nC')) + ' point charge. How fast is it moving when it is ' + (toInf ? 'very far away' : $(gu(r2 * 1000, 'mm')) + ' from the charge') + '? ($m_p = 1.67 \\times 10^{-27}\\ \\text{kg}$)',
        num(v, 'm/s', 0.02), ['The proton is pushed away; the potential energy it loses becomes kinetic energy: $\\tfrac{1}{2}mv^2 = kQe\\left(\\dfrac{1}{r_1} - \\dfrac{1}{r_2}\\right)$.', $('\\Delta K = ' + tK + '(' + gv(Q) + ' \\times 10^{-9})(1.60 \\times 10^{-19})\\left(\\dfrac{1}{' + gv(r1) + '}' + (toInf ? '' : ' - \\dfrac{1}{' + gv(r2) + '}') + '\\right) = ' + nu(dU, 'J')), $('v = \\sqrt{\\dfrac{2(' + sf(dU) + ')}{1.67 \\times 10^{-27}}} = ' + nu(v, 'm/s'))],
        'Potential energy lost = kinetic energy gained.', { kind: k, Q: Q, r1: r1, r2: toInf ? 0 : r2 });
    }
    if (k === 'closest') {
      var Z = R.pick([79, 47, 29, 82, 13]), name = { 79: 'gold', 47: 'silver', 29: 'copper', 82: 'lead', 13: 'aluminum' }[Z]; K0 = R.pick([2, 4, 5, 6, 7.7]);
      var rmin = KC * 2 * Z * QE * QE / (K0 * 1e6 * QE);
      return P('An alpha particle (charge $+2e$) with ' + $(gu(K0, 'MeV')) + ' of kinetic energy heads straight at a ' + name + ' nucleus (charge $+' + Z + 'e$), which stays put. How close does it get, in femtometers ($1\\ \\text{fm} = 10^{-15}\\ \\text{m}$)?',
        num(rmin * 1e15, 'fm', 0.02), ['At the closest point the alpha particle stops for an instant: all its kinetic energy has become potential energy, $K = \\dfrac{k(2e)(Ze)}{r_{\\min}}$.', $('K = ' + gv(K0) + ' \\times 10^{6} \\times 1.60 \\times 10^{-19}\\ \\text{J} = ' + nu(K0 * 1e6 * QE, 'J')), '$$r_{\\min} = \\frac{k(2e)(' + Z + 'e)}{K} = \\frac{' + tK + '(2)(' + Z + ')(1.60 \\times 10^{-19})^2}{' + sf(K0 * 1e6 * QE) + '} = ' + nu(rmin, 'm') + '$$', 'That is $' + sf(rmin * 1e15) + '\\ \\text{fm}$. Rutherford used this kind of estimate to show that a nucleus is tiny.'],
        'At closest approach all the kinetic energy has turned into potential energy.', { kind: k, Z: Z, K0: K0 });
    }
    if (k === 'two') {
      var q1 = R.pick([2, 3, 4]), q2 = R.pick([1, 2, 3]), m1 = R.pick([1, 2, 3]), m2 = R.pick([4, 5, 6]), d0 = R.pick([0.05, 0.10, 0.20]);
      var U0 = KC * q1 * q2 * 1e-12 / d0; // J, charges in μC, masses in grams
      var M1 = m1 * 1e-3, M2 = m2 * 1e-3, v1 = M.sqrt(2 * U0 * M2 / (M1 * (M1 + M2)));
      return P('Two small charged beads, $' + gu(q1, 'μC') + '$ with mass $' + gu(m1, 'g') + '$ and $' + gu(q2, 'μC') + '$ with mass $' + gu(m2, 'g') + '$, are held ' + $(gu(d0, 'm')) + ' apart on a smooth table and released. How fast is the lighter bead moving when they are far apart?',
        num(v1, 'm/s', 0.02), ['Two laws: momentum stays zero, $m_1v_1 = m_2v_2$, and the starting energy $U = kq_1q_2/d$ becomes kinetic energy of both.', $('U = \\dfrac{' + tK + '(' + gv(q1) + ' \\times 10^{-6})(' + gv(q2) + ' \\times 10^{-6})}{' + gv(d0) + '} = ' + nu(U0, 'J')),
          'With $v_2 = m_1v_1/m_2$: $\\tfrac{1}{2}m_1v_1^2 + \\tfrac{1}{2}m_2\\left(\\tfrac{m_1v_1}{m_2}\\right)^2 = U$, so $v_1 = \\sqrt{\\dfrac{2Um_2}{m_1(m_1 + m_2)}}$.', $('v_1 = \\sqrt{\\dfrac{2(' + sf(U0) + ')(' + gv(M2) + ')}{(' + gv(M1) + ')(' + gv(M1 + M2) + ')}} = ' + nu(v1, 'm/s'))],
        'Use conservation of momentum and conservation of energy together.', { kind: k, q1: q1, q2: q2, m1: m1, m2: m2, d: d0 });
    }
    return P('An electron is released from rest between two charged plates, where the potential rises from left to right. Which way does it move, and what happens to its kinetic energy?',
      mcq('It moves right, toward higher potential, and speeds up', ['It moves left, toward lower potential, and speeds up', 'It moves right, toward higher potential, and slows down', 'It stays put, since nothing pushes a charge toward higher potential']),
      ['$\\Delta K = -q\\Delta V$. For an electron $q = -e$, so $\\Delta K = e\\,\\Delta V$: it gains kinetic energy when $\\Delta V > 0$.', 'The field points from high to low potential (to the left here), and the force on a negative charge is opposite the field: to the right.', 'So the electron moves toward higher potential and speeds up. Positive charges "fall" to lower potential; negative charges "fall" to higher potential.'],
      'For a negative charge, ΔK = −qΔV = +eΔV.', { kind: 'mc' });
  });


  // ================================================================ Unit 3: Conductors, Capacitors and Dielectrics

  G('em.charge-sharing', function (R, ctx) {
    var k = kind(R, ctx, ['share', 'share', 'mc'], ['share', 'two', 'ratioE', 'V', 'mc'], ['two', 'flow', 'V', 'ratioE']);
    var R1 = R.pick([1, 2, 3, 4, 5]), R2 = R.pick([2, 3, 4, 5, 6, 8, 10]); if (R2 === R1) R2 = R1 * 2;
    var q1 = R.pick([6, 8, 10, 12, 15, 20, 24, 30]), q2 = 0, Qt, Q1, Q2;
    if (k === 'two' || k === 'flow') q2 = R.pick([-8, -6, -4, 2, 4, 6, 10]);
    Qt = q1 + q2; if (Qt === 0) { q1 += 4; Qt = q1 + q2; } Q1 = Qt * R1 / (R1 + R2); Q2 = Qt * R2 / (R1 + R2);
    var setup = 'Two metal spheres, of radii $R_1 = ' + gu(R1, 'cm') + '$ and $R_2 = ' + gu(R2, 'cm') + '$, sit far apart. Sphere 1 carries ' + $(gu(q1, 'nC')) + ' and sphere 2 carries ' + $(gu(q2, 'nC')) + '. They are then joined by a long thin wire.';
    var st = ['Joined conductors come to the same potential: $\\dfrac{kQ_1}{R_1} = \\dfrac{kQ_2}{R_2}$, so the charges are in proportion to the radii, $Q_1 : Q_2 = R_1 : R_2$.', 'Charge is conserved: $Q_1 + Q_2 = ' + q1 + ' + (' + q2 + ') = ' + Qt + '\\ \\text{nC}$.', '$Q_1 = ' + Qt + '\\cdot\\dfrac{' + R1 + '}{' + (R1 + R2) + '} = ' + sf(Q1) + '\\ \\text{nC}$ and $Q_2 = ' + Qt + '\\cdot\\dfrac{' + R2 + '}{' + (R1 + R2) + '} = ' + sf(Q2) + '\\ \\text{nC}$.'];
    if (k === 'share' || k === 'two') {
      var which = R.coin() ? 1 : 2;
      return P(setup + ' How much charge ends up on sphere ' + which + '?', num(which === 1 ? Q1 : Q2, 'nC', 0.01), st, 'Equal potentials mean Q/R is the same for both spheres.', { kind: k, R1: R1, R2: R2, q1: q1, q2: q2, which: which });
    }
    if (k === 'flow') {
      var dq = M.abs(q1 - Q1);
      st.push('Sphere 1 went from $' + q1 + '$ to $' + sf(Q1) + '\\ \\text{nC}$, so $' + sf(dq) + '\\ \\text{nC}$ passed through the wire.');
      return P(setup + ' How much charge flows through the wire (in nC)?', num(dq, 'nC', 0.01), st, 'Find each sphere\'s final charge, then compare with where it started.', { kind: k, R1: R1, R2: R2, q1: q1, q2: q2 });
    }
    if (k === 'V') {
      var V = KC * Qt * 1e-9 / ((R1 + R2) / 100);
      return P(setup + ' Taking $V = 0$ far away, what is the potential of the spheres once they are joined?', num(V, 'V'),
        st.concat(['$V = \\dfrac{kQ_1}{R_1} = \\dfrac{kQ_{\\text{total}}}{R_1 + R_2} = \\dfrac{' + tK + '(' + Qt + ' \\times 10^{-9})}{' + gv((R1 + R2) / 100) + '} = ' + nu(V, 'V') + '$.']),
        'Both spheres have the same potential, kQ₁/R₁ = kQ₂/R₂ = kQ/(R₁ + R₂).', { kind: k, R1: R1, R2: R2, q1: q1, q2: q2 });
    }
    if (k === 'ratioE') {
      var ratio = R2 / R1;
      return P(setup + ' Once they are joined, what is the ratio $E_1/E_2$ of the field strengths just outside the two spheres\' surfaces?', { t: 'num', v: pl(ratio, 4), rtol: 0.01 },
        st.slice(0, 1).concat(['At the surface $E = \\dfrac{kQ}{R^2} = \\dfrac{V}{R}$, and $V$ is the same for both.', '$\\dfrac{E_1}{E_2} = \\dfrac{R_2}{R_1} = \\dfrac{' + R2 + '}{' + R1 + '} = ' + sf(ratio) + '$. The smaller sphere has the stronger field, which is why sharp points spark first.']),
        'E at the surface is V/R, and V is shared.', { kind: k, R1: R1, R2: R2, q1: q1, q2: q2 });
    }
    return P('A small metal sphere and a large one, far apart, are joined by a long thin wire and given some charge. How is the charge shared once things settle?',
      mcq('The larger sphere gets more charge, in proportion to its radius', ['They get equal charges', 'The smaller sphere gets more charge, since its charge is more crowded', 'The larger sphere gets more, in proportion to its surface area']),
      ['Charge flows until there is no reason to flow: the two spheres reach the same potential.', 'A sphere\'s potential is $kQ/R$, so equal potentials need $Q_1/R_1 = Q_2/R_2$: charge in proportion to radius.', 'The smaller sphere has less charge but a higher surface density $\\sigma = Q/(4\\pi R^2)$, so its surface field is stronger.'],
      'What must be equal once the charge stops flowing?', { kind: 'mc' });
  });

  G('em.capacitance-geometry', function (R, ctx) {
    var k = kind(R, ctx, ['plates', 'plates', 'iso', 'mc'], ['plates', 'cyl', 'sph', 'Q', 'mc'], ['cyl', 'sph', 'rev', 'revcyl']);
    var C;
    if (k === 'plates' || k === 'Q' || k === 'rev') {
      var A = R.pick([25, 50, 100, 200, 400]), d = R.pick([0.5, 1.0, 1.5, 2.0, 2.5]);
      C = EPS0 * A * 1e-4 / (d * 1e-3);
      if (k === 'plates') return P('A parallel-plate capacitor has plates of area ' + $(gu(A, 'cm²')) + ' separated by ' + $(gu(d, 'mm')) + ' of air. Find its capacitance in pF.',
        num(C * 1e12, 'pF'), ['Gauss\'s law gives a uniform field $E = \\sigma/\\varepsilon_0 = Q/(\\varepsilon_0 A)$ between the plates, so $\\Delta V = Ed = \\dfrac{Qd}{\\varepsilon_0 A}$.', '$C = \\dfrac{Q}{\\Delta V} = \\dfrac{\\varepsilon_0 A}{d}$.', $('C = \\dfrac{' + tE0 + '(' + gv(A * 1e-4) + ')}{' + gv(d * 1e-3) + '} = ' + nu(C, 'F') + ' = ' + nu(C * 1e12, 'pF'))],
        'C = ε₀A/d, with A in m² and d in m.', { kind: k, A: A, d: d });
      if (k === 'Q') { var V = R.pick([6, 9, 12, 24, 50, 100]); return P('A capacitor with plates of area ' + $(gu(A, 'cm²')) + ' and a ' + $(gu(d, 'mm')) + ' air gap is connected to a ' + $(gu(V, 'V')) + ' battery. How much charge, in nC, sits on its positive plate?', num(C * V * 1e9, 'nC'), ['$C = \\dfrac{\\varepsilon_0 A}{d} = ' + nu(C, 'F') + '$.', $('Q = CV = (' + sf(C) + ')(' + gv(V) + ') = ' + nu(C * V, 'C') + ' = ' + nu(C * V * 1e9, 'nC'))], 'Find C from the geometry first, then Q = CV.', { kind: k, A: A, d: d, V: V }); }
      var Ct = R.pick([20, 50, 100, 150, 200]), dneed = EPS0 * A * 1e-4 / (Ct * 1e-12) * 1000;
      return P('What gap (in mm) would give an air-filled parallel-plate capacitor with plates of area ' + $(gu(A, 'cm²')) + ' a capacitance of ' + $(gu(Ct, 'pF')) + '?', num(dneed, 'mm'),
        ['$C = \\varepsilon_0 A/d$, so $d = \\varepsilon_0 A/C$.', $('d = \\dfrac{' + tE0 + '(' + gv(A * 1e-4) + ')}{' + gv(Ct) + ' \\times 10^{-12}} = ' + nu(dneed / 1000, 'm') + ' = ' + nu(dneed, 'mm'))], 'Solve C = ε₀A/d for d.', { kind: k, A: A, Ct: Ct });
    }
    if (k === 'cyl' || k === 'revcyl') {
      var a = R.pick([0.5, 1.0, 1.5]), b = a * R.pick([2, 3, 4, 5]), Lc = R.pick([0.5, 1, 2, 5, 10]);
      C = 2 * PI * EPS0 * Lc / M.log(b / a);
      if (k === 'cyl') return P('A coaxial cable ' + $(gu(Lc, 'm')) + ' long has an inner conductor of radius ' + $(gu(a, 'mm')) + ' and an outer conductor of radius ' + $(gu(b, 'mm')) + ', with air between. Find its capacitance in pF.',
        num(C * 1e12, 'pF'), ['Put $+Q$ on the inner conductor. Between them Gauss gives $E = \\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}$ with $\\lambda = Q/L$.', '$\\Delta V = \\int_a^b E\\,dr = \\dfrac{\\lambda}{2\\pi\\varepsilon_0}\\ln\\dfrac{b}{a}$, so $C = \\dfrac{Q}{\\Delta V} = \\dfrac{2\\pi\\varepsilon_0 L}{\\ln(b/a)}$.', $('C = \\dfrac{2\\pi' + tE0 + '(' + gv(Lc) + ')}{\\ln ' + gv(b / a) + '} = ' + nu(C * 1e12, 'pF'))],
        'Gauss for E between the conductors, integrate to get ΔV, then C = Q/ΔV.', { kind: k, a: a, b: b, L: Lc });
      var perL = 2 * PI * EPS0 / M.log(b / a) * 1e12;
      return P('An air-filled coaxial cable has inner radius ' + $(gu(a, 'mm')) + ' and outer radius ' + $(gu(b, 'mm')) + '. What is its capacitance per meter, in pF/m?', num(perL, 'pF/m'),
        ['For a coaxial cable $C = \\dfrac{2\\pi\\varepsilon_0 L}{\\ln(b/a)}$, so per meter $\\dfrac{C}{L} = \\dfrac{2\\pi\\varepsilon_0}{\\ln(b/a)}$.', $('\\dfrac{C}{L} = \\dfrac{2\\pi' + tE0 + '}{\\ln ' + gv(b / a) + '} = ' + nu(perL, 'pF/m')), 'Only the ratio of the radii matters, not their sizes.'],
        'Divide C = 2πε₀L/ln(b/a) by L.', { kind: k, a: a, b: b });
    }
    if (k === 'sph') {
      var ra = R.pick([2, 3, 4, 5]), rb = ra + R.pick([1, 2, 3, 5]); C = 4 * PI * EPS0 * (ra / 100) * (rb / 100) / ((rb - ra) / 100);
      return P('A spherical capacitor has an inner sphere of radius ' + $(gu(ra, 'cm')) + ' and an outer shell of radius ' + $(gu(rb, 'cm')) + ', with air between. Find its capacitance in pF.',
        num(C * 1e12, 'pF'), ['Between the spheres $E = kQ/r^2$, so $\\Delta V = kQ\\left(\\dfrac{1}{a} - \\dfrac{1}{b}\\right) = kQ\\,\\dfrac{b - a}{ab}$.', '$C = \\dfrac{Q}{\\Delta V} = \\dfrac{ab}{k(b - a)} = 4\\pi\\varepsilon_0\\dfrac{ab}{b - a}$.', $('C = 4\\pi' + tE0 + '\\dfrac{(' + gv(ra / 100) + ')(' + gv(rb / 100) + ')}{' + gv((rb - ra) / 100) + '} = ' + nu(C * 1e12, 'pF'))],
        'ΔV = kQ(1/a − 1/b), then C = Q/ΔV.', { kind: k, a: ra, b: rb });
    }
    if (k === 'iso') {
      var Rr = R.pick([0.05, 0.10, 0.20, 0.50, 1.0]); C = 4 * PI * EPS0 * Rr;
      return P('An isolated metal sphere of radius ' + $(gu(Rr * 100, 'cm')) + ' acts as a capacitor whose other "plate" is far away. Find its capacitance in pF.', num(C * 1e12, 'pF'),
        ['A sphere holding $Q$ has potential $V = kQ/R$ (zero far away).', '$C = \\dfrac{Q}{V} = \\dfrac{R}{k} = 4\\pi\\varepsilon_0 R$.', $('C = 4\\pi' + tE0 + '(' + gv(Rr) + ') = ' + nu(C * 1e12, 'pF'))],
        'C = Q/V with V = kQ/R.', { kind: k, R: Rr });
    }
    return P('A parallel-plate capacitor is connected first to a 6 V battery and then to a 12 V battery. What happens to its capacitance?',
      mcq('It stays the same; the charge doubles instead', ['It doubles', 'It halves', 'It quadruples, since the energy goes up four times']),
      ['$C = Q/V$ is fixed by the geometry ($\\varepsilon_0 A/d$ for plates). Doubling $V$ doubles $Q$, and their ratio stays the same.', 'Think of it like the size of a bottle: pushing harder fills it with more, but the bottle\'s size does not change.'],
      'Does V appear in C = ε₀A/d?', { kind: 'mc' });
  });

  G('em.field-energy', function (R, ctx) {
    var k = kind(R, ctx, ['u', 'u', 'uE'], ['Uplates', 'sphere', 'u', 'uE'], ['fraction', 'pull', 'sphere', 'Uplates']);
    var E, u;
    if (k === 'u' || k === 'uE') {
      if (k === 'u') { E = R.pick([1e4, 2e4, 5e4, 1e5, 2e5, 3e5, 5e5, 8e5, 1e6, 1.5e6, 2e6, 2.5e6, 3e6]); u = 0.5 * EPS0 * E * E;
        return P('The electric field in a region is ' + $(gu(E, 'V/m')) + '. What is the energy density stored in the field?', num(u, 'J/m³'),
          ['$u = \\tfrac{1}{2}\\varepsilon_0 E^2$.', $('u = \\tfrac{1}{2}' + tE0 + '(' + gv(E) + ')^2 = ' + nu(u, 'J/m³'))], 'u = ½ε₀E².', { kind: k, E: E }); }
      var V = R.pick([20, 50, 100, 150, 200, 300, 500]), d = R.pick([0.2, 0.5, 1, 1.5, 2]); E = V / (d * 1e-3); u = 0.5 * EPS0 * E * E;
      return P('A parallel-plate capacitor with a ' + $(gu(d, 'mm')) + ' air gap is charged to ' + $(gu(V, 'V')) + '. What is the energy density in the field between its plates?', num(u, 'J/m³'),
        ['The field between the plates is uniform: $E = V/d = ' + gv(V) + '/' + gv(d * 1e-3) + ' = ' + nu(E, 'V/m') + '$.', $('u = \\tfrac{1}{2}\\varepsilon_0 E^2 = \\tfrac{1}{2}' + tE0 + '(' + sf(E) + ')^2 = ' + nu(u, 'J/m³'))], 'Find E = V/d, then u = ½ε₀E².', { kind: k, V: V, d: d });
    }
    if (k === 'Uplates') {
      var A = R.pick([25, 50, 100, 200, 400]), dd = R.pick([0.5, 1, 1.5, 2]), Vv = R.pick([12, 24, 50, 100, 200]);
      E = Vv / (dd * 1e-3); u = 0.5 * EPS0 * E * E; var Ut = u * A * 1e-4 * dd * 1e-3;
      return P('An air-filled capacitor has plates of area ' + $(gu(A, 'cm²')) + ', ' + $(gu(dd, 'mm')) + ' apart, charged to ' + $(gu(Vv, 'V')) + '. Find the energy stored, in nJ, by multiplying the field\'s energy density by the volume between the plates.',
        num(Ut * 1e9, 'nJ'), ['$E = V/d = ' + nu(E, 'V/m') + '$, so $u = \\tfrac{1}{2}\\varepsilon_0 E^2 = ' + nu(u, 'J/m³') + '$.', 'Volume between the plates: $Ad = (' + gv(A * 1e-4) + ')(' + gv(dd * 1e-3) + ') = ' + nu(A * 1e-7 * dd, 'm³') + '$.', $('U = u\\,Ad = ' + nu(Ut, 'J') + ' = ' + nu(Ut * 1e9, 'nJ')), 'Check: $\\tfrac{1}{2}CV^2$ with $C = \\varepsilon_0 A/d$ gives the same.'],
        'U = (½ε₀E²)(volume).', { kind: k, A: A, d: dd, V: Vv });
    }
    if (k === 'sphere') {
      var Q = R.pick([2, 3, 5, 8, 10, 20, 50]), Rr = R.pick([0.02, 0.05, 0.08, 0.10, 0.20]), Us = KC * Q * Q * 1e-18 / (2 * Rr);
      return P('A metal sphere of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(Q, 'nC')) + '. Find the total energy stored in its electric field, in μJ, by integrating the energy density over all space outside the sphere.',
        num(Us * 1e6, 'μJ'), ['Outside, $E = kQ/r^2$, so $u = \\tfrac{1}{2}\\varepsilon_0\\dfrac{k^2Q^2}{r^4}$. Inside the metal $E = 0$.', 'Use thin shells of volume $4\\pi r^2\\,dr$: $$U = \\int_R^\\infty \\frac{\\varepsilon_0 k^2Q^2}{2r^4}\\,4\\pi r^2\\,dr = \\frac{kQ^2}{2R}$$ using $4\\pi\\varepsilon_0 k = 1$.', $('U = \\dfrac{' + tK + '(' + gv(Q) + ' \\times 10^{-9})^2}{2(' + gv(Rr) + ')} = ' + nu(Us, 'J') + ' = ' + nu(Us * 1e6, 'μJ')), 'The same as $\\tfrac{1}{2}QV$ with $V = kQ/R$.'],
        'Integrate u = ½ε₀E² over shells 4πr² dr from R to infinity.', { kind: k, Q: Q, R: Rr });
    }
    if (k === 'fraction') {
      var n = R.pick([1.5, 2, 2.5, 3, 4, 5, 8, 10]), f = 1 - 1 / n;
      return P('A charged metal sphere has radius $R$. What fraction of the energy in its electric field lies within a distance $' + n + 'R$ of its center? (Answer as a decimal.)',
        { t: 'num', v: pl(f, 4), rtol: 0.01 }, ['Energy in the field between $R$ and $r$: $$\\int_R^r \\frac{kQ^2}{2s^2}\\,ds = \\frac{kQ^2}{2}\\left(\\frac{1}{R} - \\frac{1}{r}\\right)$$', 'The total (out to infinity) is $\\dfrac{kQ^2}{2R}$, so the fraction is $1 - \\dfrac{R}{r} = 1 - \\dfrac{1}{' + n + '} = ' + sf(f) + '$.', 'Most of the energy sits close to the sphere, where the field is strong.'],
        'Integrate the energy density from R to nR and divide by the total from R to infinity.', { kind: k, n: n });
    }
    // pull: isolated capacitor, plates pulled apart
    var Ap = R.pick([100, 200, 400]), Qp = R.pick([1, 2, 5, 10]), d1 = R.pick([1, 2]), d2 = d1 + R.pick([1, 2, 3]);
    var W = Qp * Qp * 1e-18 * (d2 - d1) * 1e-3 / (2 * EPS0 * Ap * 1e-4);
    return P('An isolated parallel-plate capacitor (plates ' + $(gu(Ap, 'cm²')) + ') holds ' + $(gu(Qp, 'nC')) + '. How much work, in μJ, does it take to pull the plates from ' + $(gu(d1, 'mm')) + ' to ' + $(gu(d2, 'mm')) + ' apart?',
      num(W * 1e6, 'μJ'), ['Isolated means $Q$ stays fixed, and so does the field $E = Q/(\\varepsilon_0 A)$ and its energy density.', 'Pulling the plates apart creates new field-filled volume $A\\,\\Delta d$, and the work you do becomes the energy in it: $$W = u\\,A\\,\\Delta d = \\frac{Q^2\\,\\Delta d}{2\\varepsilon_0 A}$$', $('W = \\dfrac{(' + gv(Qp) + ' \\times 10^{-9})^2(' + gv((d2 - d1) * 1e-3) + ')}{2' + tE0 + '(' + gv(Ap * 1e-4) + ')} = ' + nu(W * 1e6, 'μJ'))],
      'With Q fixed, E and u stay the same; the stored energy grows with the volume between the plates.', { kind: 'pull', A: Ap, Q: Qp, d1: d1, d2: d2 });
  });

  G('em.dielectrics', function (R, ctx) {
    var k = kind(R, ctx, ['isoV', 'batQ', 'mc'], ['isoV', 'isoU', 'batU', 'batQ', 'mc'], ['side', 'layer', 'bound', 'isoU']);
    var C0 = R.pick([10, 20, 40, 50, 100]), V0 = R.pick([6, 9, 12, 24, 50]), kap = R.pick([2, 2.5, 3, 4, 5, 6]), Q0 = C0 * V0; // pC
    if (k === 'isoV') {
      return P('A ' + $(gu(C0, 'pF')) + ' air capacitor is charged to ' + $(gu(V0, 'V')) + ' and then disconnected from the battery. A slab with dielectric constant $\\kappa = ' + gv(kap) + '$ is slid in to fill the gap. What is the new voltage?',
        num(V0 / kap, 'V'), ['Disconnected, the charge has nowhere to go: $Q = C_0V_0$ stays fixed.', 'The dielectric raises the capacitance to $\\kappa C_0$, so $V = \\dfrac{Q}{\\kappa C_0} = \\dfrac{V_0}{\\kappa}$.', $('V = \\dfrac{' + gv(V0) + '}{' + gv(kap) + '} = ' + nu(V0 / kap, 'V'))], 'With the battery removed, Q stays the same.', { kind: k, C0: C0, V0: V0, kap: kap });
    }
    if (k === 'isoU') {
      var U0 = 0.5 * C0 * 1e-12 * V0 * V0, U1 = U0 / kap;
      return P('A ' + $(gu(C0, 'pF')) + ' air capacitor is charged to ' + $(gu(V0, 'V')) + ', disconnected, and then filled with a dielectric of $\\kappa = ' + gv(kap) + '$. How much energy, in nJ, does it store afterward?',
        num(U1 * 1e9, 'nJ'), ['Before: $U_0 = \\tfrac{1}{2}C_0V_0^2 = ' + nu(U0 * 1e9, 'nJ') + '$.', 'Isolated, $Q$ is fixed, so use $U = \\dfrac{Q^2}{2C}$: raising $C$ to $\\kappa C_0$ divides the energy by $\\kappa$.', $('U = \\dfrac{U_0}{\\kappa} = ' + nu(U1 * 1e9, 'nJ')) + '. The missing energy went into pulling the slab in: the capacitor draws a dielectric toward it.'],
        'With Q fixed, use U = Q²/(2C).', { kind: k, C0: C0, V0: V0, kap: kap });
    }
    if (k === 'batQ' || k === 'batU') {
      if (k === 'batQ') return P('A ' + $(gu(C0, 'pF')) + ' air capacitor stays connected to a ' + $(gu(V0, 'V')) + ' battery while a dielectric with $\\kappa = ' + gv(kap) + '$ fills its gap. How much charge, in pC, is on it afterward?',
        num(kap * Q0, 'pC'), ['Connected to the battery, the voltage stays $V_0$.', 'The capacitance rises to $\\kappa C_0$, so $Q = \\kappa C_0 V_0$: the battery pushes more charge on.', $('Q = (' + gv(kap) + ')(' + gv(C0) + '\\ \\text{pF})(' + gv(V0) + '\\ \\text{V}) = ' + nu(kap * Q0, 'pC'))], 'With the battery connected, V stays the same.', { kind: k, C0: C0, V0: V0, kap: kap });
      var Ub = 0.5 * kap * C0 * 1e-12 * V0 * V0;
      return P('A ' + $(gu(C0, 'pF')) + ' air capacitor stays connected to a ' + $(gu(V0, 'V')) + ' battery while a dielectric with $\\kappa = ' + gv(kap) + '$ fills its gap. How much energy, in nJ, does it store afterward?',
        num(Ub * 1e9, 'nJ'), ['$V$ stays $V_0$ and $C$ becomes $\\kappa C_0$, so use $U = \\tfrac{1}{2}CV^2$.', $('U = \\tfrac{1}{2}(' + gv(kap) + ' \\times ' + gv(C0) + ' \\times 10^{-12})(' + gv(V0) + ')^2 = ' + nu(Ub * 1e9, 'nJ')), 'The energy goes <i>up</i> by $\\kappa$ here, because the battery does work moving extra charge.'],
        'With V fixed, use U = ½CV².', { kind: k, C0: C0, V0: V0, kap: kap });
    }
    if (k === 'side' || k === 'layer') {
      var Cn = k === 'side' ? C0 * (1 + kap) / 2 : C0 * 2 * kap / (1 + kap);
      return P('An air-filled parallel-plate capacitor has $C_0 = ' + gu(C0, 'pF') + '$. A dielectric with $\\kappa = ' + gv(kap) + '$ is put in so that it fills ' + (k === 'side' ? 'the left half of the space between the plates (the full gap, across half the plate area)' : 'the lower half of the gap (half the thickness, across the whole plate area)') + '. Find the new capacitance.',
        num(Cn, 'pF'), k === 'side' ? ['The two halves sit side by side between the same two plates: two capacitors in <b>parallel</b>, each with half the area.', 'Air half: $C_0/2$. Dielectric half: $\\kappa C_0/2$. In parallel they add: $C = \\dfrac{C_0}{2}(1 + \\kappa)$.', $('C = \\dfrac{' + gv(C0) + '}{2}(1 + ' + gv(kap) + ') = ' + nu(Cn, 'pF'))]
          : ['The two layers are stacked between the plates: two capacitors in <b>series</b>, each with half the gap.', 'Air layer: $2C_0$. Dielectric layer: $2\\kappa C_0$. In series: $\\dfrac{1}{C} = \\dfrac{1}{2C_0} + \\dfrac{1}{2\\kappa C_0}$, so $C = \\dfrac{2\\kappa C_0}{1 + \\kappa}$.', $('C = \\dfrac{2(' + gv(kap) + ')(' + gv(C0) + ')}{1 + ' + gv(kap) + '} = ' + nu(Cn, 'pF'))],
        k === 'side' ? 'Side by side between the same plates means parallel.' : 'Stacked layers mean series.', { kind: k, C0: C0, kap: kap });
    }
    if (k === 'bound') {
      var Qf = R.pick([10, 20, 30, 40, 60]), Qb = Qf * (1 - 1 / kap);
      return P('A capacitor\'s plates hold $\\pm' + gu(Qf, 'nC') + '$. The gap is filled with a dielectric of $\\kappa = ' + gv(kap) + '$. How much bound (induced) charge, in nC, appears on each face of the dielectric?',
        num(Qb, 'nC'), ['The molecules of the dielectric line up with the field, leaving a layer of bound charge on each face, opposite in sign to the nearby plate.', 'That bound charge cancels part of the plates\' field so that the field drops to $E_0/\\kappa$: $Q - Q_b = Q/\\kappa$.', $('Q_b = Q\\left(1 - \\dfrac{1}{\\kappa}\\right) = ' + gv(Qf) + '\\left(1 - \\dfrac{1}{' + gv(kap) + '}\\right) = ' + nu(Qb, 'nC'))],
        'The field inside drops by κ; the bound charge is what cancels the difference.', { kind: k, Qf: Qf, kap: kap });
    }
    var bat = R.coin();
    return P('A charged parallel-plate capacitor ' + (bat ? 'stays connected to its battery' : 'has been disconnected from its battery') + ' while a dielectric slab is slid in to fill the gap. Which quantity stays the same?',
      mcq(bat ? 'The voltage across it' : 'The charge on its plates', [bat ? 'The charge on its plates' : 'The voltage across it', 'The energy it stores', 'Its capacitance']),
      [bat ? 'The battery holds the voltage fixed. $C$ rises to $\\kappa C_0$, so $Q = CV$ rises and so does $U = \\tfrac{1}{2}CV^2$.' : 'With no battery, the charge cannot leave the plates, so $Q$ is fixed. $C$ rises to $\\kappa C_0$, so $V = Q/C$ drops, and so does $U = Q^2/(2C)$.', 'Always ask first: is the capacitor connected (fixed $V$) or isolated (fixed $Q$)?'],
      'Is anything holding the voltage fixed?', { kind: 'mc', bat: bat });
  });


  // ================================================================ Unit 4: Current and Circuits

  var NCU = 8.5e28; // free electrons per m³ in copper
  G('em.drift-velocity', function (R, ctx) {
    var k = kind(R, ctx, ['vd', 'J', 'mc'], ['vd', 'time', 'I', 'J', 'mc'], ['series', 'time', 'vd']);
    var I = R.pick([0.5, 1, 1.5, 2, 3, 5, 10]), dmm = R.pick([0.5, 0.8, 1.0, 1.3, 1.6, 2.0]), A = PI * sq(dmm / 2 * 1e-3), vd = I / (NCU * QE * A);
    var given = 'Copper has about $8.5 \\times 10^{28}$ free electrons per cubic meter; $e = 1.60 \\times 10^{-19}\\ \\text{C}$.';
    if (k === 'vd') return P('A copper wire of diameter ' + $(gu(dmm, 'mm')) + ' carries ' + $(gu(I, 'A')) + '. Find the electrons\' drift speed in mm/s. ' + given, num(vd * 1000, 'mm/s'),
      ['$I = nqv_dA$, so $v_d = \\dfrac{I}{neA}$.', 'Area: $A = \\pi r^2 = \\pi(' + gv(dmm / 2 * 1e-3) + '\\ \\text{m})^2 = ' + nu(A, 'm²') + '$.', $('v_d = \\dfrac{' + gv(I) + '}{(8.5 \\times 10^{28})(1.60 \\times 10^{-19})(' + sf(A) + ')} = ' + nu(vd, 'm/s') + ' = ' + nu(vd * 1000, 'mm/s'))],
      'v_d = I/(neA). Use the radius, in meters, for the area.', { kind: k, I: I, d: dmm });
    if (k === 'J') return P('A wire of diameter ' + $(gu(dmm, 'mm')) + ' carries ' + $(gu(I, 'A')) + ' spread evenly over its cross section. Find the current density $J$.', num(I / A, 'A/m²'),
      ['$J = I/A$: current per unit of cross-sectional area.', '$A = \\pi(' + gv(dmm / 2 * 1e-3) + '\\ \\text{m})^2 = ' + nu(A, 'm²') + '$.', $('J = \\dfrac{' + gv(I) + '}{' + sf(A) + '} = ' + nu(I / A, 'A/m²'))], 'J = I/A.', { kind: k, I: I, d: dmm });
    if (k === 'time') { var Lw = R.pick([1, 2, 5]), tt = Lw / vd / 3600;
      return P('A copper wire of diameter ' + $(gu(dmm, 'mm')) + ' carries a steady ' + $(gu(I, 'A')) + '. How many hours would one electron take to drift ' + $(gu(Lw, 'm')) + ' along it? ' + given, num(tt, 'h'),
        ['$v_d = \\dfrac{I}{neA} = ' + nu(vd, 'm/s') + '$ (with $A = ' + nu(A, 'm²') + '$).', $('t = \\dfrac{' + gv(Lw) + '\\ \\text{m}}{' + sf(vd) + '\\ \\text{m/s}} = ' + nu(Lw / vd, 's') + ' = ' + nu(tt, 'h')), 'Yet the lamp lights almost at once: the field that pushes the electrons spreads along the wire at nearly the speed of light, and electrons all along the wire start moving together.'],
        'Find v_d first, then time = distance/speed.', { kind: k, I: I, d: dmm, L: Lw }); }
    if (k === 'I') { var v2 = R.pick([0.05, 0.1, 0.2, 0.3]) * 1e-3, I2 = NCU * QE * A * v2;
      return P('Electrons drift at ' + $(gu(v2 * 1000, 'mm/s')) + ' along a copper wire of diameter ' + $(gu(dmm, 'mm')) + '. What current does the wire carry? ' + given, num(I2, 'A'),
        ['$I = nev_dA$.', $('I = (8.5 \\times 10^{28})(1.60 \\times 10^{-19})(' + gv(v2) + ')(' + sf(A) + ') = ' + nu(I2, 'A'))], 'I = n e v_d A.', { kind: k, v: v2, d: dmm }); }
    if (k === 'series') { var d2 = dmm * R.pick([0.5, 2, 1.5]), r2 = sq(dmm / d2);
      return P('A copper wire of diameter ' + $(gu(dmm, 'mm')) + ' is joined end to end to a copper wire of diameter ' + $(gu(+d2.toFixed(2), 'mm')) + ', and a steady ' + $(gu(I, 'A')) + ' flows through both. Find the drift speed in the second wire, in mm/s. ' + given, num(vd * r2 * 1000, 'mm/s'),
        ['The same current flows through both wires (charge does not pile up at the joint), and $n$ is the same, so $v_d \\propto 1/A \\propto 1/d^2$.', 'First wire: $v_{d1} = \\dfrac{I}{neA_1} = ' + nu(vd * 1000, 'mm/s') + '$.', $('v_{d2} = v_{d1}\\left(\\dfrac{d_1}{d_2}\\right)^2 = ' + sf(vd * 1000) + '\\left(\\dfrac{' + gv(dmm) + '}{' + gv(+d2.toFixed(2)) + '}\\right)^2 = ' + nu(vd * r2 * 1000, 'mm/s'))],
        'Same current, same n: the drift speed goes as 1/area.', { kind: k, I: I, d: dmm, d2: d2 }); }
    return P('You flip a switch and a lamp across the room lights almost at once, yet electrons in the wire drift at only a fraction of a millimeter per second. Why?',
      mcq('The field that pushes the electrons spreads along the wire at nearly light speed, so electrons everywhere in the circuit start moving almost at once', ['The electrons near the switch race to the lamp at nearly light speed', 'The lamp draws electrons out of the battery, which travel very fast once they leave it', 'The current is a wave of electrons bouncing off each other at the speed of sound']),
      ['The wire is already full of free electrons, from the switch to the lamp and back.', 'Closing the switch sets up an electric field along the whole wire within nanoseconds; every electron in the circuit starts drifting at about the same time.', 'So the lamp\'s own electrons start moving right away, even though any one electron crawls along at a fraction of a mm/s.'],
      'What has to travel from the switch to the lamp for the lamp to light?', { kind: 'mc' });
  });

  G('em.resistance-integral', function (R, ctx) {
    var k = kind(R, ctx, ['cone', 'cone', 'rhox'], ['cone', 'radial', 'rhox', 'naive'], ['radial', 'sphere', 'cone', 'naive']);
    var rho, Rans;
    if (k === 'cone' || k === 'naive') {
      var mat = R.pick([['carbon', 3.5e-5], ['nichrome', 1.1e-6], ['graphite', 1.0e-5]]); rho = mat[1];
      var r1 = R.pick([0.5, 1.0, 1.5]), r2 = r1 * R.pick([2, 3, 4]), Lc = R.pick([2, 5, 10, 20]);
      Rans = rho * Lc / 100 / (PI * r1 * 1e-3 * r2 * 1e-3);
      if (k === 'naive') { var ra = (r1 + r2) / 2, Rn = rho * Lc / 100 / (PI * sq(ra * 1e-3)), pct = (Rans - Rn) / Rans * 100;
        return P('A ' + mat[0] + ' conductor ($\\rho = ' + gu(rho, 'Ω·m') + '$) is ' + $(gu(Lc, 'cm')) + ' long, and its radius grows evenly from ' + $(gu(r1, 'mm')) + ' to ' + $(gu(r2, 'mm')) + '. Someone estimates its resistance using one cross section, at the average radius. By what percent does that estimate fall short of the true resistance? (Give a percent, such as 12.)',
          { t: 'num', v: pl(pct), rtol: 0.02, pct: true }, ['True: slices $dx$ in series add $dR = \\rho\\,dx/A(x)$, and with a radius that changes linearly, $R = \\dfrac{\\rho L}{\\pi r_1 r_2} = ' + nu(Rans, 'Ω') + '$.', 'Estimate: $\\dfrac{\\rho L}{\\pi r_{\\text{avg}}^2}$ with $r_{\\text{avg}} = ' + gv(ra) + '\\ \\text{mm}$ gives $' + nu(Rn, 'Ω') + '$.', '$\\dfrac{' + sf(Rans) + ' - ' + sf(Rn) + '}{' + sf(Rans) + '} = ' + sf(pct) + '\\%$ short. The thin end, which the average hides, does most of the resisting.'],
          'Compute both: ρL/(πr₁r₂) and ρL/(πr_avg²).', { kind: k, rho: rho, r1: r1, r2: r2, L: Lc }); }
      return P('A ' + mat[0] + ' conductor ($\\rho = ' + gu(rho, 'Ω·m') + '$) is ' + $(gu(Lc, 'cm')) + ' long. It is round, and its radius grows evenly from ' + $(gu(r1, 'mm')) + ' at one end to ' + $(gu(r2, 'mm')) + ' at the other. Current flows from end to end. Find its resistance.',
        num(Rans, 'Ω'), ['Cut it into thin slices $dx$; they are in series, so their resistances add: $dR = \\dfrac{\\rho\\,dx}{\\pi r(x)^2}$ with $r(x) = r_1 + \\dfrac{r_2 - r_1}{L}x$.', 'Substitute $u = r(x)$, $dx = \\dfrac{L}{r_2 - r_1}du$: $$R = \\frac{\\rho L}{\\pi(r_2 - r_1)}\\int_{r_1}^{r_2}\\frac{du}{u^2} = \\frac{\\rho L}{\\pi(r_2 - r_1)}\\left(\\frac{1}{r_1} - \\frac{1}{r_2}\\right) = \\frac{\\rho L}{\\pi r_1 r_2}$$',
          $('R = \\dfrac{(' + gv(rho) + ')(' + gv(Lc / 100) + ')}{\\pi(' + gv(r1 * 1e-3) + ')(' + gv(r2 * 1e-3) + ')} = ' + nu(Rans, 'Ω'))],
        'Add series slices dR = ρ dx/(πr²) with r changing linearly; substitute u = r(x).', { kind: k, rho: rho, r1: r1, r2: r2, L: Lc });
    }
    if (k === 'rhox') {
      rho = R.pick([1, 2, 5]) * 1e-6; var Lw = R.pick([0.5, 1, 2]), dmm = R.pick([0.5, 1.0, 2.0]), A = PI * sq(dmm / 2 * 1e-3), f = R.pick([1, 2, 3]);
      Rans = rho * Lw * (1 + f / 2) / A;
      return P('A wire ' + $(gu(Lw, 'm')) + ' long with diameter ' + $(gu(dmm, 'mm')) + ' is made of a material whose resistivity changes along it: $\\rho(x) = \\rho_0\\left(1 + ' + (f === 1 ? '' : f) + 'x/L\\right)$ with $\\rho_0 = ' + gu(rho, 'Ω·m') + '$. Find its resistance.',
        num(Rans, 'Ω'), ['Slices in series: $dR = \\dfrac{\\rho(x)\\,dx}{A}$, with $A$ constant.', '$$R = \\frac{\\rho_0}{A}\\int_0^L\\left(1 + \\frac{' + (f === 1 ? '' : f) + 'x}{L}\\right)dx = \\frac{\\rho_0 L}{A}\\left(1 + \\frac{' + f + '}{2}\\right)$$', 'A = $' + nu(A, 'm²') + '$, so $R = \\dfrac{(' + gv(rho) + ')(' + gv(Lw) + ')}{' + sf(A) + '}(' + gv(1 + f / 2) + ') = ' + nu(Rans, 'Ω') + '$.'],
        'Integrate ρ(x) dx/A along the wire.', { kind: k, rho: rho, L: Lw, d: dmm, f: f });
    }
    if (k === 'radial') {
      rho = R.pick([10, 50, 100, 200]); var a = R.pick([0.5, 1, 2]), b = a * R.pick([2, 3, 5]), Lc2 = R.pick([0.1, 0.2, 0.5, 1]);
      Rans = rho * M.log(b / a) / (2 * PI * Lc2);
      return P('A coaxial cylinder ' + $(gu(Lc2, 'm')) + ' long has a thin inner conductor of radius ' + $(gu(a, 'cm')) + ' and an outer conductor of radius ' + $(gu(b, 'cm')) + '. The space between is filled with a poorly conducting material of resistivity ' + $(gu(rho, 'Ω·m')) + '. Find the resistance for current flowing straight outward from the inner to the outer conductor.',
        num(Rans, 'Ω'), ['The current crosses thin cylindrical shells of radius $r$, thickness $dr$ and area $2\\pi rL$; they are in series.', '$$R = \\int_a^b\\frac{\\rho\\,dr}{2\\pi rL} = \\frac{\\rho}{2\\pi L}\\ln\\frac{b}{a}$$', $('R = \\dfrac{' + gv(rho) + '}{2\\pi(' + gv(Lc2) + ')}\\ln ' + gv(b / a) + ' = ' + nu(Rans, 'Ω'))],
        'The area the current crosses is 2πrL, which grows with r.', { kind: k, rho: rho, a: a, b: b, L: Lc2 });
    }
    rho = R.pick([20, 50, 100]); var aa = R.pick([1, 2, 3]), bb = aa * R.pick([2, 3, 4]);
    Rans = rho * (1 / (aa / 100) - 1 / (bb / 100)) / (4 * PI);
    return P('A spherical shell of material with resistivity ' + $(gu(rho, 'Ω·m')) + ' fills the space between a metal ball of radius ' + $(gu(aa, 'cm')) + ' and a metal shell of radius ' + $(gu(bb, 'cm')) + '. Find the resistance for current flowing radially outward.',
      num(Rans, 'Ω'), ['Thin spherical shells of area $4\\pi r^2$ and thickness $dr$ are in series.', '$$R = \\int_a^b\\frac{\\rho\\,dr}{4\\pi r^2} = \\frac{\\rho}{4\\pi}\\left(\\frac{1}{a} - \\frac{1}{b}\\right)$$', $('R = \\dfrac{' + gv(rho) + '}{4\\pi}\\left(\\dfrac{1}{' + gv(aa / 100) + '} - \\dfrac{1}{' + gv(bb / 100) + '}\\right) = ' + nu(Rans, 'Ω'))],
      'Use shells of area 4πr²; integrate ρ dr/(4πr²).', { kind: 'sphere', rho: rho, a: aa, b: bb });
  });

  /* the two-battery, three-branch circuit: ε₁ (+ toward the top junction) with R₁ on the left, R₃ down the middle, ε₂ (+ toward the top)
     with R₂ on the right. Currents chosen first so the answers are friendly; the emfs follow from the loop rule. */
  function twoLoop(R, ctx) {
    for (var tries = 0; tries < 200; tries++) {
      var R1 = R.int(1, 8), R2 = R.int(1, 8), R3 = R.int(1, 10), I1 = by(ctx, R.int(1, 3), R.int(1, 4), R.pick([0.5, 1, 1.5, 2, 2.5])), I2 = by(ctx, R.int(1, 2), R.pick([-1, 1, 2, -2]), R.pick([-1.5, -0.5, 0.5, 1, 1.5])), I3 = I1 + I2;
      var e1 = I1 * R1 + I3 * R3, e2 = I2 * R2 + I3 * R3;
      if (I3 > 0 && e1 > 0 && e2 > 0 && e1 <= 48 && e2 <= 48 && e1 !== e2 && Number.isInteger(e1 * 2) && Number.isInteger(e2 * 2)) return { R1: R1, R2: R2, R3: R3, I1: I1, I2: I2, I3: I3, e1: e1, e2: e2 };
    }
    return { R1: 2, R2: 3, R3: 4, I1: 2, I2: 1, I3: 3, e1: 16, e2: 15 };
  }
  function ex1(x, unit) { return { a: { t: 'num', v: String(x), rtol: 0.01 }, unit: unit }; } // exact (the currents are chosen as multiples of 0.5 A)
  function dv(a, b) { return b === 1 ? a.replace(/^\((.*)\)$/, '$1') : a + '/' + b; }
  function twoLoopViz(c) {
    return { name: 'ph-circuit', opts: { circuit: [{ type: 'V', a: 'B', b: 'TL', value: c.e1, label: 'ε₁' }, { type: 'R', a: 'TL', b: 'TM', value: c.R1, label: 'R₁' }, { type: 'R', a: 'TM', b: 'B', value: c.R3, label: 'R₃' }, { type: 'R', a: 'TR', b: 'TM', value: c.R2, label: 'R₂' }, { type: 'V', a: 'B', b: 'TR', value: c.e2, label: 'ε₂' }], layout: { TL: [0, 0], TM: [2, 0], TR: [4, 0], B: [2, 2] }, interactive: false, quiet: true, hide: ['dots'] } };
  }
  G('em.multiloop-circuits', function (R, ctx) {
    var k = kind(R, ctx, ['I3', 'I3', 'I1'], ['I1', 'I2', 'I3', 'V3', 'P'], ['I2', 'P', 'I1', 'V3']);
    var c = twoLoop(R, ctx);
    var q0 = 'In the circuit shown, $\\varepsilon_1 = ' + gu(c.e1, 'V') + '$, $\\varepsilon_2 = ' + gu(c.e2, 'V') + '$ (both with their + terminals toward the top), $R_1 = ' + gu(c.R1, 'Ω') + '$, $R_2 = ' + gu(c.R2, 'Ω') + '$ and $R_3 = ' + gu(c.R3, 'Ω') + '$. ';
    var setup = ['Call $I_1$ the current through $R_1$ (to the right, out of $\\varepsilon_1$), $I_2$ the current through $R_2$ (to the left, out of $\\varepsilon_2$) and $I_3$ the current down through $R_3$. Junction rule at the top: $I_3 = I_1 + I_2$.',
      'Left loop (up through $\\varepsilon_1$, across $R_1$, down $R_3$): $' + gv(c.e1) + ' - ' + T.mono(c.R1, 'I_1') + ' - ' + T.mono(c.R3, 'I_3') + ' = 0$.', 'Right loop (up through $\\varepsilon_2$, across $R_2$, down $R_3$): $' + gv(c.e2) + ' - ' + T.mono(c.R2, 'I_2') + ' - ' + T.mono(c.R3, 'I_3') + ' = 0$.',
      'Substitute $I_1 = ' + dv('(' + gv(c.e1) + ' - ' + T.mono(c.R3, 'I_3') + ')', c.R1) + '$ and $I_2 = ' + dv('(' + gv(c.e2) + ' - ' + T.mono(c.R3, 'I_3') + ')', c.R2) + '$ into $I_3 = I_1 + I_2$ and solve: $I_3 = ' + gv(c.I3) + '\\ \\text{A}$, then $I_1 = ' + gv(c.I1) + '\\ \\text{A}$ and $I_2 = ' + gv(c.I2) + '\\ \\text{A}$.'];
    var ex = { viz: twoLoopViz(c) }, t = { kind: k, c: c };
    if (k === 'I3') return P(q0 + 'Find the current through $R_3$.', ex1(c.I3, 'A'), setup, 'Write the junction rule and one loop rule for each small loop, then solve the three equations.', t, ex);
    if (k === 'I1') return P(q0 + 'Find the current through $R_1$.', ex1(c.I1, 'A'), setup, 'Junction rule, then a loop rule around each window of the circuit.', t, ex);
    if (k === 'I2') return P(q0 + 'Find the current $I_2$ through $R_2$, counting it positive when it flows out of the + terminal of $\\varepsilon_2$ (to the left through $R_2$). It may come out negative.',
      ex1(c.I2, 'A'), setup.concat([c.I2 < 0 ? 'The minus sign is the answer, not a mistake: the current really flows the other way, <i>into</i> the + terminal of $\\varepsilon_2$, which is being charged by $\\varepsilon_1$. Keep the sign; do not flip it partway through.' : 'Positive: $\\varepsilon_2$ drives current out of its + terminal, as assumed.']),
      'Keep the sign that comes out of the algebra: it tells you the true direction.', t, ex);
    if (k === 'V3') return P(q0 + 'What is the potential difference across $R_3$?', ex1(c.I3 * c.R3, 'V'), setup.concat(['$V_3 = I_3R_3 = (' + gv(c.I3) + ')(' + c.R3 + ') = ' + gu(c.I3 * c.R3, 'V') + '$.']), 'Find I₃ first, then V = IR.', t, ex);
    var Pw = c.e1 * c.I1;
    return P(q0 + 'At what rate does battery $\\varepsilon_1$ deliver energy to the circuit?', ex1(Pw, 'W'), setup.concat(['$P = \\varepsilon_1 I_1 = (' + gv(c.e1) + ')(' + gv(c.I1) + ') = ' + gu(Pw, 'W') + '$.']), 'P = εI for a battery, with I the current through it.', t, ex);
  });

  G('em.rc-charging', function (R, ctx) {
    var k = kind(R, ctx, ['tau', 'I0', 'mc'], ['q', 'Vc', 'I', 'tau'], ['tfrac', 'findR', 'heat', 'Vc']);
    var e = R.pick([6, 9, 12, 18, 24]), Rk = R.pick([1, 2, 4.7, 5, 10, 20, 47]), Cu = R.pick([10, 22, 47, 50, 100, 220]), tau = Rk * 1e3 * Cu * 1e-6;
    var setup = 'An uncharged ' + $(gu(Cu, 'μF')) + ' capacitor is connected through a ' + $(gu(Rk, 'kΩ')) + ' resistor to a ' + $(gu(e, 'V')) + ' battery at $t = 0$. ';
    var tauStep = '$\\tau = RC = (' + gv(Rk * 1e3) + '\\ \\Omega)(' + gv(Cu * 1e-6) + '\\ \\text{F}) = ' + nu(tau, 's') + '$.';
    if (k === 'tau') return P(setup + 'What is the time constant?', num(tau, 's'), [tauStep, 'In one time constant the charge reaches $1 - e^{-1} \\approx 63\\%$ of its final value.'], 'τ = RC, in ohms and farads.', { kind: k, R: Rk, C: Cu, e: e });
    if (k === 'mc') return P('A switch connects an uncharged capacitor, a resistor $R$ and a battery $\\varepsilon$ in series. Which is true the instant the switch closes?',
      mcq('The current is at its largest, $\\varepsilon/R$', ['The current is zero, since the capacitor has no charge yet to push it', 'The capacitor\'s voltage jumps straight to $\\varepsilon$', 'The current is $\\varepsilon/(2R)$, shared between the resistor and the capacitor']),
      ['An empty capacitor has no voltage across it ($V_C = q/C = 0$), so it acts like a plain wire at first.', 'The whole battery voltage lands on the resistor: $I_0 = \\varepsilon/R$, the largest the current will ever be.', 'As charge builds, $V_C$ grows and pushes back, so the current dies away as $e^{-t/RC}$.'],
      'What is the voltage across a capacitor with no charge on it?', { kind: 'mc' });
    if (k === 'I0') return P(setup + 'What is the current the instant the circuit is connected, in mA?', num(e / Rk, 'mA'), ['At $t = 0$ the capacitor is empty, so $V_C = q/C = 0$, and the loop rule $\\varepsilon - IR - V_C = 0$ leaves $\\varepsilon = IR$.', $('I_0 = \\dfrac{\\varepsilon}{R} = \\dfrac{' + gv(e) + '\\ \\text{V}}{' + gv(Rk * 1e3) + '\\ \\Omega} = ' + nu(e / Rk, 'mA')), 'This is the largest the current ever gets.'], 'An empty capacitor has no voltage across it.', { kind: k, R: Rk, C: Cu, e: e });
    var tt = by(ctx, 1, R.pick([0.5, 1, 2, 3]), R.pick([0.5, 1.5, 2, 2.5])) * tau; tt = Number(tt.toPrecision(2));
    var x = tt / tau, ex = M.exp(-x);
    var de = ['Loop rule: $\\varepsilon - IR - \\dfrac{q}{C} = 0$ with $I = \\dfrac{dq}{dt}$, so $\\dfrac{dq}{dt} = \\dfrac{C\\varepsilon - q}{RC}$.', 'Separate and integrate from $q = 0$: $-\\ln\\dfrac{C\\varepsilon - q}{C\\varepsilon} = \\dfrac{t}{RC}$, so $q = C\\varepsilon\\left(1 - e^{-t/RC}\\right)$ and $I = \\dfrac{\\varepsilon}{R}e^{-t/RC}$.', tauStep];
    if (k === 'q') { var q = Cu * e * (1 - ex); return P(setup + 'How much charge, in μC, is on the capacitor at $t = ' + gu(tt, 's') + '$?', num(q, 'μC'), de.concat([$('q = (' + gv(Cu) + '\\ \\mu\\text{F})(' + gv(e) + '\\ \\text{V})\\left(1 - e^{-' + gv(tt) + '/' + sf(tau) + '}\\right) = ' + nu(q, 'μC'))]), 'q = Cε(1 − e^(−t/RC)).', { kind: k, R: Rk, C: Cu, e: e, t: tt }); }
    if (k === 'Vc') { var Vc = e * (1 - ex); return P(setup + 'What is the voltage across the capacitor at $t = ' + gu(tt, 's') + '$?', num(Vc, 'V'), de.concat([$('V_C = \\dfrac{q}{C} = \\varepsilon\\left(1 - e^{-t/RC}\\right) = ' + gv(e) + '\\left(1 - e^{-' + gv(tt) + '/' + sf(tau) + '}\\right) = ' + nu(Vc, 'V'))]), 'V_C = ε(1 − e^(−t/RC)).', { kind: k, R: Rk, C: Cu, e: e, t: tt }); }
    if (k === 'I') { var Ii = e / Rk * ex; return P(setup + 'What is the current, in mA, at $t = ' + gu(tt, 's') + '$?', num(Ii, 'mA'), de.concat([$('I = \\dfrac{\\varepsilon}{R}e^{-t/RC} = (' + sf(e / Rk) + '\\ \\text{mA})e^{-' + gv(tt) + '/' + sf(tau) + '} = ' + nu(Ii, 'mA'))]), 'I = (ε/R)e^(−t/RC): largest at the start.', { kind: k, R: Rk, C: Cu, e: e, t: tt }); }
    if (k === 'tfrac') { var f = R.pick([0.5, 0.75, 0.9, 0.95, 0.99]), tf = -tau * M.log(1 - f);
      return P(setup + 'How long does it take for the capacitor to reach ' + (f * 100) + '% of its final charge?', num(tf, 's'), de.concat(['Set $1 - e^{-t/RC} = ' + f + '$: $e^{-t/RC} = ' + gv(+(1 - f).toFixed(2)) + '$, so $t = -RC\\ln(' + gv(+(1 - f).toFixed(2)) + ')$.', $('t = -(' + sf(tau) + ')\\ln(' + gv(+(1 - f).toFixed(2)) + ') = ' + nu(tf, 's'))]), 'Solve 1 − e^(−t/τ) = fraction for t with a logarithm.', { kind: k, R: Rk, C: Cu, e: e, f: f }); }
    if (k === 'findR') { var tm = Number((tau * R.pick([0.5, 1, 2])).toPrecision(2)), Vm = e * (1 - M.exp(-tm / tau)), Vms = Number(Vm.toPrecision(3)), tauF = -tm / M.log(1 - Vms / e), Rf = tauF / (Cu * 1e-6) / 1000;
      return P('An uncharged ' + $(gu(Cu, 'μF')) + ' capacitor is connected through an unknown resistor to a ' + $(gu(e, 'V')) + ' battery. After ' + $(gu(tm, 's')) + ' the capacitor\'s voltage is ' + $(gu(Vms, 'V')) + '. Find the resistance, in kΩ.', num(Rf, 'kΩ', 0.02),
        ['$V_C = \\varepsilon(1 - e^{-t/RC})$, so $e^{-t/RC} = 1 - \\dfrac{V_C}{\\varepsilon} = 1 - \\dfrac{' + gv(Vms) + '}{' + gv(e) + '} = ' + sf(1 - Vms / e) + '$.', '$RC = \\dfrac{-t}{\\ln(' + sf(1 - Vms / e) + ')} = ' + nu(tauF, 's') + '$.', $('R = \\dfrac{' + sf(tauF) + '}{' + gv(Cu * 1e-6) + '} = ' + nu(Rf * 1000, 'Ω') + ' = ' + nu(Rf, 'kΩ'))],
        'Solve V_C = ε(1 − e^(−t/RC)) for RC, then divide by C.', { kind: k, C: Cu, e: e, t: tm, V: Vms }); }
    // heat in the resistor during full charging
    var Uc = 0.5 * Cu * 1e-6 * e * e * 1000; // mJ
    return P(setup + 'By the time the capacitor is fully charged, how much energy, in mJ, has turned into heat in the resistor?', num(Uc, 'mJ'),
      ['The battery moves charge $Q = C\\varepsilon$ through its emf, doing work $Q\\varepsilon = C\\varepsilon^2$.', 'The capacitor ends up storing $\\tfrac{1}{2}C\\varepsilon^2$.', 'The rest, $\\tfrac{1}{2}C\\varepsilon^2$, became heat in the resistor (the same for any resistance!): $\\tfrac{1}{2}(' + gv(Cu * 1e-6) + ')(' + gv(e) + ')^2 = ' + nu(Uc, 'mJ') + '$.'],
      'Compare the battery\'s work, Qε, with the energy stored, ½Cε².', { kind: 'heat', C: Cu, e: e, R: Rk });
  });

  G('em.rc-discharging', function (R, ctx) {
    var k = kind(R, ctx, ['half', 'q', 'mc'], ['q', 'half', 'I', 'time', 'heat'], ['energyHalf', 'time', 'heat', 'twoTimes']);
    var V0 = R.pick([6, 9, 12, 20, 50, 100]), Rk = R.pick([1, 2, 5, 10, 22, 47]), Cu = R.pick([10, 20, 47, 100, 220, 470]), tau = Rk * 1e3 * Cu * 1e-6, Q0 = Cu * V0;
    if (k === 'mc') { var ta = R.pick([2, 3, 4, 5]); return P('A capacitor charged to 10 V takes ' + ta + ' s to discharge to 5 V through a resistor. It is then recharged to 20 V and discharged through the same resistor. How long does it take to fall to 10 V?',
      mcq(ta + ' s', [(2 * ta) + ' s', (ta / 2) + ' s', 'It depends on how long it was charging first']),
      ['Discharging follows $V = V_0e^{-t/RC}$. Halving means $e^{-t/RC} = \\tfrac{1}{2}$, so $t_{1/2} = RC\\ln 2$, with no $V_0$ in it.', 'More charge means a bigger current at the start ($V_0/R$), so it drains faster in proportion: the half time is the same, ' + ta + ' s.'],
      'Does V₀ appear in the half time?', { kind: 'mc', ta: ta }); }
    var setup = 'A ' + $(gu(Cu, 'μF')) + ' capacitor charged to ' + $(gu(V0, 'V')) + ' starts discharging through a ' + $(gu(Rk, 'kΩ')) + ' resistor at $t = 0$. ';
    var de = ['Loop rule: $\\dfrac{q}{C} - IR = 0$ with the current draining the charge, $I = -\\dfrac{dq}{dt}$, so $\\dfrac{dq}{dt} = -\\dfrac{q}{RC}$, whose solution is $q = Q_0e^{-t/RC}$.', '$\\tau = RC = ' + nu(tau, 's') + '$.'];
    if (k === 'half') return P(setup + 'How long does it take for the charge to drop to half its starting value?', num(tau * M.LN2, 's'), de.concat(['$e^{-t/RC} = \\tfrac{1}{2}$ gives $t_{1/2} = RC\\ln 2 = (' + sf(tau) + ')(0.693) = ' + nu(tau * M.LN2, 's') + '$. The starting voltage does not matter.']), 't½ = RC ln 2.', { kind: k, R: Rk, C: Cu });
    var tt = Number((tau * by(ctx, 1, R.pick([0.5, 1, 2]), R.pick([0.5, 1.5, 2.5]))).toPrecision(2)), ex = M.exp(-tt / tau);
    if (k === 'q') return P(setup + 'How much charge, in μC, is left at $t = ' + gu(tt, 's') + '$?', num(Q0 * ex, 'μC'), de.concat(['$Q_0 = CV_0 = ' + gu(Q0, 'μC') + '$.', $('q = ' + gv(Q0) + 'e^{-' + gv(tt) + '/' + sf(tau) + '} = ' + nu(Q0 * ex, 'μC'))]), 'q = Q₀e^(−t/RC), with Q₀ = CV₀.', { kind: k, R: Rk, C: Cu, V0: V0, t: tt });
    if (k === 'I') return P(setup + 'What is the current, in mA, at $t = ' + gu(tt, 's') + '$?', num(V0 / Rk * ex, 'mA'), de.concat(['At the start $I_0 = V_0/R = ' + nu(V0 / Rk, 'mA') + '$, and the current dies away with the charge: $I = I_0e^{-t/RC}$.', $('I = ' + sf(V0 / Rk) + 'e^{-' + gv(tt) + '/' + sf(tau) + '} = ' + nu(V0 / Rk * ex, 'mA'))]), 'I = (V₀/R)e^(−t/RC).', { kind: k, R: Rk, C: Cu, V0: V0, t: tt });
    if (k === 'time') { var f = R.pick([0.5, 0.25, 0.1, 0.01, 0.2]), tf = -tau * M.log(f);
      return P(setup + 'How long until the capacitor\'s voltage has fallen to ' + $(gu(+(V0 * f).toPrecision(3), 'V')) + '?', num(tf, 's'), de.concat(['$V = V_0e^{-t/RC}$, so $e^{-t/RC} = \\dfrac{' + gv(+(V0 * f).toPrecision(3)) + '}{' + gv(V0) + '} = ' + gv(f) + '$ and $t = -RC\\ln(' + gv(f) + ')$.', $('t = -(' + sf(tau) + ')\\ln(' + gv(f) + ') = ' + nu(tf, 's'))]), 'Solve V₀e^(−t/τ) = V for t with a logarithm.', { kind: k, R: Rk, C: Cu, f: f }); }
    if (k === 'heat') { var U = 0.5 * Cu * 1e-6 * V0 * V0 * 1000;
      return P(setup + 'How much energy, in mJ, turns into heat in the resistor over the whole discharge?', num(U, 'mJ'), ['The power in the resistor is $I^2R$ with $I = \\dfrac{V_0}{R}e^{-t/RC}$.', '$$\\int_0^\\infty \\frac{V_0^2}{R}e^{-2t/RC}\\,dt = \\frac{V_0^2}{R}\\cdot\\frac{RC}{2} = \\tfrac{1}{2}CV_0^2$$ every bit of the stored energy.', $('\\tfrac{1}{2}(' + gv(Cu * 1e-6) + ')(' + gv(V0) + ')^2 = ' + nu(U, 'mJ'))], 'Integrate I²R from 0 to ∞, or think about where the stored energy goes.', { kind: k, C: Cu, V0: V0, R: Rk }); }
    if (k === 'energyHalf') return P(setup + 'How long until the energy stored in the capacitor has dropped to half its starting value?', num(tau * M.LN2 / 2, 's'),
      de.concat(['$U = \\dfrac{q^2}{2C} = U_0e^{-2t/RC}$: energy goes as the square of the charge, so it dies twice as fast.', '$e^{-2t/RC} = \\tfrac{1}{2}$ gives $t = \\dfrac{RC\\ln 2}{2} = ' + nu(tau * M.LN2 / 2, 's') + '$, half the time for the charge to halve.']), 'Stored energy goes as q², so it decays as e^(−2t/RC).', { kind: k, R: Rk, C: Cu });
    // twoTimes: from two readings, find RC
    var t1 = Number((tau * 0.5).toPrecision(2)), t2 = Number((tau * 2).toPrecision(2)), V1 = Number((V0 * M.exp(-t1 / tau)).toPrecision(3)), V2 = Number((V0 * M.exp(-t2 / tau)).toPrecision(3)), tauM = (t2 - t1) / M.log(V1 / V2);
    return P('A discharging capacitor reads ' + $(gu(V1, 'V')) + ' at $t = ' + gu(t1, 's') + '$ and ' + $(gu(V2, 'V')) + ' at $t = ' + gu(t2, 's') + '$. Find the time constant $RC$.', num(tauM, 's', 0.02),
      ['$V = V_0e^{-t/RC}$, so the ratio of two readings cancels $V_0$: $\\dfrac{V_1}{V_2} = e^{(t_2 - t_1)/RC}$.', $('RC = \\dfrac{t_2 - t_1}{\\ln(V_1/V_2)} = \\dfrac{' + gv(+(t2 - t1).toPrecision(3)) + '}{\\ln(' + gv(V1) + '/' + gv(V2) + ')} = ' + nu(tauM, 's'))],
      'Divide the two readings: V₀ cancels.', { kind: 'twoTimes', t1: t1, t2: t2, V1: V1, V2: V2 });
  });


  // ================================================================ Unit 5: Magnetic Fields

  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  var AX = { '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], '+z': [0, 0, 1], '-z': [0, 0, -1] };
  var AXNAME = { '+x': '$+x$', '-x': '$-x$', '+y': '$+y$', '-y': '$-y$', '+z': '$+z$ (out of the page)', '-z': '$-z$ (into the page)' };
  function axOf(v) { for (var k in AX) if (AX[k][0] === v[0] && AX[k][1] === v[1] && AX[k][2] === v[2]) return k; return null; }
  function tv(v, s) { return '(' + v.map(function (x) { return T.num(s ? x * s : x); }).join(',\\ ') + ')'; }
  function small(R) { var v = [0, 0, 0], n = R.pick([1, 2, 2, 3]); R.sample([0, 1, 2], n).forEach(function (i) { v[i] = R.nz(-4, 4); }); return v; }

  G('em.lorentz-force', function (R, ctx) {
    var k = kind(R, ctx, ['dir', 'mag', 'vec'], ['vec', 'vec', 'mag', 'dir', 'zero'], ['withE', 'vec', 'withE']);
    if (k === 'dir') {
      var axes = Object.keys(AX), vA = R.pick(axes), bA = R.pick(axes.filter(function (a) { return a[1] !== vA[1]; })), sg = R.pick([1, -1]);
      var Fv = cross(AX[vA], AX[bA]).map(function (x) { return x * sg; }), fA = axOf(Fv), opp = axOf(Fv.map(function (x) { return -x; }));
      return P((sg > 0 ? 'A proton' : 'An electron') + ' moves in the ' + AXNAME[vA] + ' direction through a magnetic field pointing in the ' + AXNAME[bA] + ' direction. Which way does the magnetic force on it point?',
        mcq(AXNAME[fA], [AXNAME[opp], AXNAME[bA], AXNAME[vA]]), ['$\\vec{F} = q\\,\\vec{v} \\times \\vec{B}$, so first find $\\vec{v}\\times\\vec{B}$: ' + AXNAME[vA] + ' $\\times$ ' + AXNAME[bA] + ' = ' + AXNAME[axOf(cross(AX[vA], AX[bA]))] + ' (right-hand rule: fingers along $\\vec{v}$, curl toward $\\vec{B}$, thumb gives $\\vec{v}\\times\\vec{B}$).', sg > 0 ? 'The proton is positive, so the force points the same way: ' + AXNAME[fA] + '.' : 'The electron is negative, so the force points the opposite way: ' + AXNAME[fA] + '.', 'The force is perpendicular to both $\\vec{v}$ and $\\vec{B}$, never along either.'],
        'Find v × B first, then flip it if the charge is negative.', { kind: k, vA: vA, bA: bA, sg: sg });
    }
    if (k === 'mag') {
      var v = R.pick([1, 2, 3, 4, 5]) * 1e6, B = R.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1.2]), th = R.pick([30, 45, 60, 90, 120, 150]), F = QE * v * B * M.sin(deg(th)), who = R.pick(['proton', 'electron']);
      return P('A' + (who === 'electron' ? 'n electron' : ' proton') + ' moves at ' + $(gu(v, 'm/s')) + ' at an angle of $' + th + '^\\circ$ to a ' + $(gu(B, 'T')) + ' magnetic field. How big is the magnetic force on it?', num(F, 'N'),
        ['$|\\vec{F}| = |q|vB\\sin\\theta$, where $\\theta$ is the angle between $\\vec{v}$ and $\\vec{B}$ (the size of a cross product).', $('F = (1.60 \\times 10^{-19})(' + gv(v) + ')(' + gv(B) + ')\\sin ' + th + '^\\circ = ' + nu(F, 'N'))],
        'F = |q|vB sin θ.', { kind: k, v: v, B: B, th: th });
    }
    if (k === 'zero') {
      var Bz = small(R); while (Bz.every(function (x) { return x === 0; })) Bz = small(R); var par = Bz.map(function (x) { return 2 * x; }), wr1 = cross(Bz, [1, 0, 0]), wr2 = cross(Bz, [0, 0, 1]), wr3 = [Bz[1] || 1, -(Bz[0]) || 0, Bz[2] + 1];
      if (wr1.every(function (x) { return x === 0; })) wr1 = cross(Bz, [0, 1, 0]); if (wr2.every(function (x) { return x === 0; })) wr2 = cross(Bz, [0, 1, 0]);
      var all = [par, wr1, wr2, wr3].map(function (x) { return '$' + tv(x, 1e3) + '$ m/s'; });
      if (all[3] === all[0] || all[3] === all[1] || all[3] === all[2]) all[3] = '$' + tv([Bz[0] + 1, Bz[1] - 1, Bz[2] + 2], 1e3) + '$ m/s';
      return P('A uniform field $\\vec{B} = ' + tv(Bz, 0.1) + '\\ \\text{T}$. For which velocity does a moving charge feel <b>no</b> magnetic force?', mcq(all[0], all.slice(1)),
        ['$\\vec{F} = q\\,\\vec{v}\\times\\vec{B}$ is zero only when $\\vec{v}$ is parallel (or antiparallel) to $\\vec{B}$, since then $\\sin\\theta = 0$.', 'The velocity $' + tv(par, 1e3) + '$ m/s is a multiple of $' + tv(Bz, 0.1) + '$, so it is parallel to $\\vec{B}$. The others have parts perpendicular to $\\vec{B}$.'],
        'Which velocity points along the field?', { kind: k, B: Bz, choices: [par, wr1, wr2, wr3] });
    }
    var q = R.pick([2, -2, 3, -1, 4, 1, -3]), vv = small(R), Bv = small(R), c = cross(vv, Bv);
    while (c.every(function (x) { return x === 0; })) { Bv = small(R); c = cross(vv, Bv); }
    if (k === 'vec') {
      var Fm = c.map(function (x) { return q * x / 10; });
      return P('A particle with charge $q = ' + gu(q, 'μC') + '$ moves with $\\vec{v} = ' + tv(vv, 1e3) + '\\ \\text{m/s}$ through a field $\\vec{B} = ' + tv(Bv, 0.1) + '\\ \\text{T}$. Find the magnetic force $\\vec{F}$ as components, in mN.',
        { a: { t: 'tuple', v: Fm.map(function (x) { return String(x || 0); }) }, unit: 'mN' },
        ['$\\vec{F} = q\\,\\vec{v}\\times\\vec{B}$. Work with $\\vec{v} = 10^3' + tv(vv) + '$ and $\\vec{B} = 0.1' + tv(Bv) + '$.', '$' + tv(vv) + '\\times' + tv(Bv) + ' = (' + T.num(vv[1]) + '\\cdot' + T.p(Bv[2]) + ' - ' + T.p(vv[2]) + '\\cdot' + T.p(Bv[1]) + ',\\ ' + T.p(vv[2]) + '\\cdot' + T.p(Bv[0]) + ' - ' + T.p(vv[0]) + '\\cdot' + T.p(Bv[2]) + ',\\ ' + T.p(vv[0]) + '\\cdot' + T.p(Bv[1]) + ' - ' + T.p(vv[1]) + '\\cdot' + T.p(Bv[0]) + ') = ' + tv(c) + '$.',
          'Scale: $q \\times 10^3 \\times 0.1 = (' + gv(q) + ' \\times 10^{-6})(100) = ' + gv(q * 1e-4) + '\\ \\text{N}$ per unit, that is $' + T.num(q / 10) + '\\ \\text{mN}$.', '$\\vec{F} = ' + T.num(q / 10) + tv(c) + ' = ' + tv(Fm) + '\\ \\text{mN}$.' + (q < 0 ? ' The negative charge reverses every component.' : '')],
        'Compute v × B with the components (keep the order!), then multiply by q.', { kind: k, q: q, v: vv, B: Bv }, { nolint: ['1x', '+ -', '--', '+ 0'] });
    }
    var E = small(R), Ft = c.map(function (x, i) { return q * (x + E[i]) / 10; });
    return P('A particle with charge $q = ' + gu(q, 'μC') + '$ moves with $\\vec{v} = ' + tv(vv, 1e3) + '\\ \\text{m/s}$ through crossed fields $\\vec{E} = ' + tv(E, 100) + '\\ \\text{V/m}$ and $\\vec{B} = ' + tv(Bv, 0.1) + '\\ \\text{T}$. Find the total force $\\vec{F} = q(\\vec{E} + \\vec{v}\\times\\vec{B})$ as components, in mN.',
      { a: { t: 'tuple', v: Ft.map(function (x) { return String(x || 0); }) }, unit: 'mN' },
      ['$\\vec{v}\\times\\vec{B} = (10^3)(0.1)\\,' + tv(vv) + '\\times' + tv(Bv) + ' = 100' + tv(c) + '\\ \\text{V/m}$ (the same units as $\\vec{E}$).', '$\\vec{E} + \\vec{v}\\times\\vec{B} = 100\\left[' + tv(E) + ' + ' + tv(c) + '\\right] = 100' + tv(c.map(function (x, i) { return x + E[i]; })) + '\\ \\text{V/m}$.', '$\\vec{F} = (' + gv(q) + ' \\times 10^{-6})(100)' + tv(c.map(function (x, i) { return x + E[i]; })) + '\\ \\text{N} = ' + tv(Ft) + '\\ \\text{mN}$.'],
      'Add E and v × B as vectors first, then multiply by q.', { kind: k, q: q, v: vv, B: Bv, E: E }, { nolint: ['1x', '+ -', '--', '+ 0'] });
  });

  G('em.crossed-fields', function (R, ctx) {
    var k = kind(R, ctx, ['v', 'v', 'mc'], ['plates', 'r', 'v', 'mc'], ['sep', 'mass', 'r']);
    var E = R.pick([10, 20, 25, 40, 50, 80]) * 1e3, B = R.pick([0.1, 0.2, 0.25, 0.4, 0.5]), v = E / B;
    if (k === 'v') return P('In a velocity selector, an electric field of ' + $(gu(E / 1000, 'kV/m')) + ' and a magnetic field of ' + $(gu(B, 'T')) + ' are at right angles to each other and to the beam. What speed passes straight through?', num(v, 'm/s'),
      ['Straight through means the electric force $qE$ and the magnetic force $qvB$ cancel: $qE = qvB$.', $('v = \\dfrac{E}{B} = \\dfrac{' + gv(E) + '}{' + gv(B) + '} = ' + nu(v, 'm/s')), 'The charge cancels: protons, electrons and ions of any mass are selected at the same speed.'],
      'Set the electric and magnetic forces equal.', { kind: k, E: E, B: B });
    if (k === 'plates') { var Vp = R.pick([100, 200, 300, 500, 1000]), d = R.pick([0.5, 1, 2, 2.5]), Ep = Vp / (d / 100), vp = Ep / B;
      return P('The electric field in a velocity selector comes from plates ' + $(gu(d, 'cm')) + ' apart held at ' + $(gu(Vp, 'V')) + '. The magnetic field is ' + $(gu(B, 'T')) + '. Which speed passes straight through?', num(vp, 'm/s'),
        ['$E = V/d = ' + gv(Vp) + '/' + gv(d / 100) + ' = ' + nu(Ep, 'V/m') + '$.', $('v = E/B = ' + sf(Ep) + '/' + gv(B) + ' = ' + nu(vp, 'm/s'))], 'Find E = V/d, then v = E/B.', { kind: k, V: Vp, d: d, B: B }); }
    var ions = [['carbon-12', 12], ['carbon-13', 13], ['carbon-14', 14], ['neon-20', 20], ['neon-22', 22], ['chlorine-35', 35], ['chlorine-37', 37], ['uranium-235', 235], ['uranium-238', 238]];
    var B2 = R.pick([0.2, 0.4, 0.5, 0.8, 1.0]), vs = R.pick([2, 4, 5]) * 1e4;
    if (k === 'r') { var ion = R.pick(ions), rr = ion[1] * AMU * vs / (QE * B2);
      return P('Singly charged ' + ion[0] + ' ions ($m = ' + ion[1] + '\\ \\text{u}$, $1\\ \\text{u} = 1.66 \\times 10^{-27}\\ \\text{kg}$) leave a velocity selector at ' + $(gu(vs, 'm/s')) + ' and enter a ' + $(gu(B2, 'T')) + ' field at right angles. What is the radius of their path, in cm?', num(rr * 100, 'cm'),
        ['The magnetic force supplies the centripetal force: $qvB = \\dfrac{mv^2}{r}$, so $r = \\dfrac{mv}{qB}$.', $('r = \\dfrac{(' + ion[1] + ')(1.66 \\times 10^{-27})(' + gv(vs) + ')}{(1.60 \\times 10^{-19})(' + gv(B2) + ')} = ' + nu(rr, 'm') + ' = ' + nu(rr * 100, 'cm'))],
        'r = mv/(qB), with the mass in kilograms.', { kind: k, m: ion[1], v: vs, B: B2 }); }
    if (k === 'sep') { var pair = R.pick([[12, 13], [12, 14], [20, 22], [35, 37], [235, 238]]), r1 = pair[0] * AMU * vs / (QE * B2), r2 = pair[1] * AMU * vs / (QE * B2), sep = 2 * (r2 - r1);
      return P('In a mass spectrometer, singly charged ions all leave the velocity selector at ' + $(gu(vs, 'm/s')) + ', enter a ' + $(gu(B2, 'T')) + ' field, travel a half circle and land on a detector. How far apart, in mm, do ions of mass ' + pair[0] + ' u and ' + pair[1] + ' u land? ($1\\ \\text{u} = 1.66 \\times 10^{-27}\\ \\text{kg}$)', num(sep * 1000, 'mm'),
        ['Each ion lands a diameter, $2r = \\dfrac{2mv}{qB}$, from where it entered.', 'The difference: $\\Delta(2r) = \\dfrac{2v\\,\\Delta m}{qB} = \\dfrac{2(' + gv(vs) + ')(' + (pair[1] - pair[0]) + ' \\times 1.66 \\times 10^{-27})}{(1.60 \\times 10^{-19})(' + gv(B2) + ')}$.', $('\\Delta(2r) = ' + nu(sep, 'm') + ' = ' + nu(sep * 1000, 'mm'))],
        'Each lands a full diameter 2mv/(qB) from the entrance.', { kind: k, m1: pair[0], m2: pair[1], v: vs, B: B2 }); }
    if (k === 'mass') { var mt = R.pick([7, 16, 24, 27, 40, 56]), rm = mt * AMU * vs / (QE * B2), rms = Number((rm * 100).toPrecision(3)), mu = QE * B2 * (rms / 100) / (vs * AMU);
      return P('Singly charged ions moving at ' + $(gu(vs, 'm/s')) + ' enter a ' + $(gu(B2, 'T')) + ' field and follow a circle of radius ' + $(gu(rms, 'cm')) + '. What is their mass in atomic mass units? ($1\\ \\text{u} = 1.66 \\times 10^{-27}\\ \\text{kg}$)', num(mu, 'u', 0.02),
        ['$r = \\dfrac{mv}{qB}$, so $m = \\dfrac{qBr}{v}$.', $('m = \\dfrac{(1.60 \\times 10^{-19})(' + gv(B2) + ')(' + gv(rms / 100) + ')}{' + gv(vs) + '} = ' + nu(mu * AMU, 'kg')), 'Divide by $1.66 \\times 10^{-27}$: $m = ' + nu(mu, 'u') + '$.'],
        'Solve r = mv/(qB) for m, then convert to u.', { kind: k, v: vs, B: B2, r: rms }); }
    return P('A velocity selector is set so that protons at a certain speed pass straight through. Which of these, moving at the same speed, also pass straight through?',
      mcq('Electrons, alpha particles and heavy ions alike', ['Only particles with the same charge as a proton', 'Only particles with the same mass as a proton', 'Only particles with the same charge-to-mass ratio as a proton']),
      ['Straight through requires $qE = qvB$. The charge appears on both sides and cancels, leaving $v = E/B$.', 'Mass never enters, since the forces balance and nothing accelerates. A negative charge has both forces reversed, so they still cancel.', 'So any charged particle at $v = E/B$ goes straight. Charge-to-mass ratio only matters later, in the spectrometer\'s curve, $r = mv/(qB)$.'],
      'Write the balance qE = qvB. What cancels?', { kind: 'mc' });
  });

  G('em.hall-effect', function (R, ctx) {
    var k = kind(R, ctx, ['VH', 'sign'], ['VH', 'n', 'vd', 'sign'], ['n', 'semi', 'vd', 'sign']);
    var I = R.pick([2, 5, 10, 15, 20]), B = R.pick([0.5, 1.0, 1.5, 2.0]), tmm = R.pick([0.1, 0.2, 0.5, 1.0]), n = 8.5e28, VH;
    if (k === 'VH') { VH = I * B / (n * QE * tmm * 1e-3);
      return P('A copper strip ' + $(gu(tmm, 'mm')) + ' thick (measured along the field) carries ' + $(gu(I, 'A')) + ' across a ' + $(gu(B, 'T')) + ' magnetic field. Copper has $8.5 \\times 10^{28}$ free electrons per m³. Find the Hall voltage, in μV.', num(VH * 1e6, 'μV'),
        ['Carriers pile up on one edge until the sideways electric force balances the magnetic one: $qE_H = qv_dB$, so $E_H = v_dB$.', 'With $v_d = \\dfrac{I}{nqA}$ and $A = wt$, the voltage across the width is $V_H = E_Hw = \\dfrac{IB}{nqt}$.', $('V_H = \\dfrac{(' + gv(I) + ')(' + gv(B) + ')}{(8.5 \\times 10^{28})(1.60 \\times 10^{-19})(' + gv(tmm * 1e-3) + ')} = ' + nu(VH, 'V') + ' = ' + nu(VH * 1e6, 'μV'))],
        'V_H = IB/(nqt), with t the thickness along B.', { kind: k, I: I, B: B, t: tmm }); }
    if (k === 'n' || k === 'semi') {
      var ns = R.pick([1e21, 2e21, 5e21, 1e22, 4e22]); VH = I / 1000 * B / (ns * QE * tmm * 1e-3); var VHs = Number((VH * 1000).toPrecision(3)), nf = (I / 1000) * B / (VHs / 1000 * QE * tmm * 1e-3);
      if (k === 'n') return P('A semiconductor strip ' + $(gu(tmm, 'mm')) + ' thick carries ' + $(gu(I, 'mA')) + ' in a ' + $(gu(B, 'T')) + ' field and shows a Hall voltage of ' + $(gu(VHs, 'mV')) + '. Assuming each carrier has charge $e$, how many carriers are there per cubic meter?', num(nf, 'm⁻³'),
        ['$V_H = \\dfrac{IB}{nqt}$, so $n = \\dfrac{IB}{qtV_H}$.', $('n = \\dfrac{(' + gv(I / 1000) + ')(' + gv(B) + ')}{(1.60 \\times 10^{-19})(' + gv(tmm * 1e-3) + ')(' + gv(VHs / 1000) + ')} = ' + nu(nf, 'm⁻³')), 'Far fewer carriers than in copper, which is why semiconductors show large Hall voltages and make good field sensors.'],
        'Solve V_H = IB/(nqt) for n.', { kind: k, I: I, B: B, t: tmm, VH: VHs });
      var ratio = n / ns;
      return P('The same current and field are applied to a copper strip ($8.5 \\times 10^{28}$ carriers per m³) and to a semiconductor strip of the same thickness with ' + $(gu(ns, 'm⁻³')) + ' carriers. How many times larger is the semiconductor\'s Hall voltage?', { t: 'num', v: pl(ratio), rtol: 0.02 },
        ['$V_H = \\dfrac{IB}{nqt}$: with the same $I$, $B$, $q$ and $t$, $V_H \\propto 1/n$.', $('\\dfrac{V_{\\text{semi}}}{V_{\\text{Cu}}} = \\dfrac{8.5 \\times 10^{28}}{' + gv(ns) + '} = ' + sf(ratio))], 'V_H goes as 1/n.', { kind: k, ns: ns });
    }
    if (k === 'vd') { var w = R.pick([1, 2, 5]), Vh = R.pick([2, 5, 10, 20]) * 1e-6, vd = Vh / (B * w * 1e-2);
      return P('A conducting strip ' + $(gu(w, 'cm')) + ' wide sits in a ' + $(gu(B, 'T')) + ' field, and the Hall voltage across its width is ' + $(gu(Vh * 1e6, 'μV')) + '. Find the carriers\' drift speed, in mm/s.', num(vd * 1000, 'mm/s'),
        ['In steady state $qE_H = qv_dB$, so $v_d = E_H/B$, and $E_H = V_H/w$.', $('v_d = \\dfrac{V_H}{Bw} = \\dfrac{' + gv(Vh) + '}{(' + gv(B) + ')(' + gv(w / 100) + ')} = ' + nu(vd, 'm/s') + ' = ' + nu(vd * 1000, 'mm/s'))],
        'Balance qE_H = qv_dB with E_H = V_H/w.', { kind: k, w: w, B: B, Vh: Vh }); }
    var hi = R.coin();
    return P('Current flows to the right (+x) along a flat strip lying in the page, and a magnetic field points out of the page (+z). A voltmeter shows that the strip\'s ' + (hi ? 'bottom edge (the −y side)' : 'top edge (the +y side)') + ' is at the <b>higher</b> potential. What sign are the charge carriers?',
      mcq(hi ? 'Positive' : 'Negative', [hi ? 'Negative' : 'Positive', 'You cannot tell from the Hall voltage', 'Neutral; the field pushes the whole strip']),
      ['Positive carriers moving right: $\\vec{F} = q\\,\\vec{v}\\times\\vec{B} = q(v\\hat{\\imath})\\times(B\\hat{k}) = -qvB\\,\\hat{\\jmath}$: pushed toward the bottom edge.', 'Negative carriers move left to make the same current: $\\vec{F} = (-q)(-v\\hat{\\imath})\\times(B\\hat{k}) = -qvB\\,\\hat{\\jmath}$: also pushed toward the bottom edge.', 'So both kinds pile up at the bottom; what differs is the sign of the charge that piles up. The bottom edge is ' + (hi ? 'higher, so the piled-up charge is positive: the carriers are positive (as in some semiconductors).' : 'lower (the top is higher), so the piled-up charge is negative: the carriers are electrons, as in copper.')],
      'Both kinds of carrier are pushed to the same edge. Which sign of charge would make that edge higher?', { kind: 'sign', hi: hi });
  });

  G('em.force-on-wire-integral', function (R, ctx) {
    var k = kind(R, ctx, ['angle', 'loop', 'semi'], ['semi', 'bent', 'loop', 'angle'], ['nonuni', 'bent', 'semi']);
    var I = R.pick([2, 3, 4, 5, 6, 8, 10]), B = R.pick([0.1, 0.2, 0.25, 0.4, 0.5]), F;
    if (k === 'angle') { var Lw = R.pick([0.2, 0.3, 0.5, 1.0]), th = R.pick([30, 45, 60, 90]); F = I * Lw * B * M.sin(deg(th));
      return P('A straight wire ' + $(gu(Lw, 'm')) + ' long carries ' + $(gu(I, 'A')) + ' at $' + th + '^\\circ$ to a uniform ' + $(gu(B, 'T')) + ' field. Find the magnetic force on it.', num(F, 'N'),
        ['For a straight wire in a uniform field, $d\\vec{F} = I\\,d\\vec{\\ell}\\times\\vec{B}$ is the same for every piece, so $F = ILB\\sin\\theta$.', $('F = (' + gv(I) + ')(' + gv(Lw) + ')(' + gv(B) + ')\\sin ' + th + '^\\circ = ' + nu(F, 'N'))], 'F = ILB sin θ.', { kind: k, I: I, L: Lw, B: B, th: th }); }
    if (k === 'loop') return P('A closed loop of wire of any shape lies flat in a uniform ' + $(gu(B, 'T')) + ' magnetic field and carries ' + $(gu(I, 'A')) + '. What is the net magnetic force on the loop?', num(0, 'N'),
      ['$\\vec{F} = I\\left(\\oint d\\vec{\\ell}\\right)\\times\\vec{B}$ when $\\vec{B}$ is uniform, because $I$ and $\\vec{B}$ come out of the integral.', 'Adding up all the little steps $d\\vec{\\ell}$ around a closed loop brings you back to the start: $\\oint d\\vec{\\ell} = \\vec{0}$.', 'So the net force is zero. (The loop can still feel a <i>torque</i>, which is how motors work.)'],
      'In a uniform field, the force depends only on the vector sum of the steps along the wire.', { kind: k });
    var Rr = R.pick([0.05, 0.10, 0.15, 0.20]);
    if (k === 'semi') { F = 2 * I * Rr * B;
      return P('A wire bent into a half circle of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(I, 'A')) + ' in a uniform ' + $(gu(B, 'T')) + ' field perpendicular to the plane of the half circle. Find the net force on the curved wire.', num(F, 'N'),
        ['Each piece feels $dF = IB\\,d\\ell$, pointing outward from the center (perpendicular to both the wire and $\\vec{B}$).', 'Sideways parts cancel in pairs; the parts along the symmetry axis add: $$F = \\int_0^\\pi IBR\\sin\\phi\\,d\\phi = 2IRB$$', 'Same as a straight wire across the diameter, $I(2R)B$. ' + $('F = 2(' + gv(I) + ')(' + gv(Rr) + ')(' + gv(B) + ') = ' + nu(F, 'N'))],
        'Integrate the components of dF = IB dℓ around the half circle, or use the straight chord.', { kind: k, I: I, R: Rr, B: B }); }
    if (k === 'bent') { var a = R.pick([0.3, 0.4, 0.6]), b = R.pick([0.4, 0.8, 0.45]), ch = M.hypot(a, b); F = I * ch * B;
      return P('A wire carrying ' + $(gu(I, 'A')) + ' runs along a wiggly path in the $xy$-plane from the point $(0, 0)$ to $(' + gv(a) + ',\\ ' + gv(b) + ')$ m. A uniform ' + $(gu(B, 'T')) + ' field points along $+z$. Find the size of the net force on the wire.', num(F, 'N'),
        ['With uniform $\\vec{B}$: $\\vec{F} = I\\left(\\int d\\vec{\\ell}\\right)\\times\\vec{B}$, and $\\int d\\vec{\\ell}$ is just the displacement from start to end, whatever the path.', 'That displacement is $(' + gv(a) + ', ' + gv(b) + ', 0)$ m, of length $\\sqrt{' + gv(a) + '^2 + ' + gv(b) + '^2} = ' + gu(+ch.toPrecision(3), 'm') + '$, perpendicular to $\\vec{B}$.', $('F = (' + gv(I) + ')(' + sf(ch) + ')(' + gv(B) + ') = ' + nu(F, 'N'))],
        'Only the straight-line displacement from start to end matters in a uniform field.', { kind: k, I: I, a: a, b: b, B: B }); }
    // nonuniform: rod perpendicular to a long wire
    var I1 = R.pick([10, 20, 30, 50]), I2 = R.pick([2, 4, 5]), aa = R.pick([0.01, 0.02, 0.05]), bb = aa * R.pick([2, 3, 5, 10]);
    F = MU0 * I1 * I2 * M.log(bb / aa) / (2 * PI);
    return P('A long straight wire carries ' + $(gu(I1, 'A')) + '. A short rod carrying ' + $(gu(I2, 'A')) + ' lies in the same plane, perpendicular to the wire, running from ' + $(gu(aa * 100, 'cm')) + ' to ' + $(gu(bb * 100, 'cm')) + ' from it. Find the size of the magnetic force on the rod, in μN.', num(F * 1e6, 'μN'),
      ['The wire\'s field is $B = \\dfrac{\\mu_0 I_1}{2\\pi r}$, weaker farther out, and perpendicular to the rod everywhere along it.', '$$F = \\int_a^b I_2\\frac{\\mu_0I_1}{2\\pi r}\\,dr = \\frac{\\mu_0I_1I_2}{2\\pi}\\ln\\frac{b}{a}$$', $('F = \\dfrac{' + tMU + '(' + gv(I1) + ')(' + gv(I2) + ')}{2\\pi}\\ln ' + gv(bb / aa) + ' = ' + nu(F, 'N') + ' = ' + nu(F * 1e6, 'μN'))],
      'B changes along the rod: integrate I₂B(r) dr.', { kind: k, I1: I1, I2: I2, a: aa, b: bb });
  });

  G('em.loop-torque', function (R, ctx) {
    var k = kind(R, ctx, ['mu', 'tau', 'mc'], ['tau', 'tauPlane', 'max', 'mc'], ['work', 'tauPlane', 'tau']);
    var N = R.pick([1, 10, 20, 50, 100]), I = R.pick([0.5, 1, 2, 3, 5]), s = R.pick([2, 4, 5, 8, 10]), A = sq(s / 100), B = R.pick([0.1, 0.2, 0.3, 0.5]), mu = N * I * A;
    var coil = (N === 1 ? 'A square loop' : 'A square coil of ' + N + ' turns') + ', ' + $(gu(s, 'cm')) + ' on a side, carrying ' + $(gu(I, 'A')) + ',';
    if (k === 'mu') return P(coil + ' has what magnetic moment?', num(mu, 'A·m²'), ['$\\mu = NIA$, pointing along the loop\'s normal by the right-hand rule.', $('\\mu = (' + N + ')(' + gv(I) + ')(' + gv(s / 100) + ')^2 = ' + nu(mu, 'A·m²'))], 'μ = NIA, with the area in m².', { kind: k, N: N, I: I, s: s });
    if (k === 'tau' || k === 'tauPlane' || k === 'max') {
      var th = R.pick([20, 30, 45, 60, 75]), thN = k === 'tauPlane' ? 90 - th : k === 'max' ? 90 : th, tau = mu * B * M.sin(deg(thN));
      var where = k === 'tau' ? 'with its normal at $' + th + '^\\circ$ to the field' : k === 'tauPlane' ? 'with its plane at $' + th + '^\\circ$ to the field' : 'turned to the position of greatest torque';
      return P(coil + ' sits in a ' + $(gu(B, 'T')) + ' field, ' + where + '. Find the torque on it, in N·m.', num(tau, 'N·m'),
        ['$\\mu = NIA = ' + nu(mu, 'A·m²') + '$ and $\\tau = \\mu B\\sin\\theta$, with $\\theta$ the angle between $\\vec{\\mu}$ (the normal) and $\\vec{B}$.', k === 'tauPlane' ? 'The angle given is to the plane; the normal is $90^\\circ$ from the plane, so $\\theta = 90^\\circ - ' + th + '^\\circ = ' + thN + '^\\circ$.' : k === 'max' ? 'The torque is greatest when $\\theta = 90^\\circ$: the field lies in the plane of the coil.' : '$\\theta = ' + th + '^\\circ$.', $('\\tau = (' + sf(mu) + ')(' + gv(B) + ')\\sin ' + thN + '^\\circ = ' + nu(tau, 'N·m'))],
        'τ = NIAB sin θ, with θ measured from the normal.', { kind: k, N: N, I: I, s: s, B: B, th: thN });
    }
    if (k === 'work') { var t1 = R.pick([0, 30, 60]), t2 = R.pick([90, 120, 180]), W = mu * B * (M.cos(deg(t1)) - M.cos(deg(t2)));
      return P(coil + ' sits in a ' + $(gu(B, 'T')) + ' field. How much work, in mJ, does it take to turn it from $\\theta = ' + t1 + '^\\circ$ to $\\theta = ' + t2 + '^\\circ$ (angles between its normal and the field)?', num(W * 1000, 'mJ'),
        ['The magnetic potential energy is $U = -\\vec{\\mu}\\cdot\\vec{B} = -\\mu B\\cos\\theta$ (lowest when $\\vec{\\mu}$ lines up with $\\vec{B}$).', 'The work needed is the rise in $U$: $W = \\mu B(\\cos\\theta_1 - \\cos\\theta_2)$, the same as $\\int_{\\theta_1}^{\\theta_2}\\mu B\\sin\\theta\\,d\\theta$.', $('W = (' + sf(mu) + ')(' + gv(B) + ')(\\cos ' + t1 + '^\\circ - \\cos ' + t2 + '^\\circ) = ' + nu(W * 1000, 'mJ'))],
        'W = ΔU with U = −μB cos θ.', { kind: k, N: N, I: I, s: s, B: B, t1: t1, t2: t2 }); }
    return P('A current loop sits in a uniform magnetic field. In which position is the torque on it <b>zero</b>?', mcq('With the field passing straight through the loop (normal along the field)', ['With the field lying in the plane of the loop', 'With the loop\'s normal at 45° to the field', 'The torque is never zero in a field']),
      ['$\\tau = \\mu B\\sin\\theta$, with $\\theta$ between the loop\'s normal and $\\vec{B}$.', 'When the field passes straight through, $\\theta = 0$ (or $180^\\circ$) and $\\sin\\theta = 0$: the forces on opposite sides pull straight outward along one line, and there is no twist.', 'The torque is largest when the field lies in the loop\'s plane ($\\theta = 90^\\circ$).'],
      'Torque goes as sin θ, with θ measured from the normal.', { kind: 'mc' });
  });

  G('em.biot-savart', function (R, ctx) {
    var k = kind(R, ctx, ['element', 'inline'], ['segment', 'element', 'square', 'inline'], ['segEnd', 'square', 'segment']);
    var I = R.pick([2, 3, 5, 8, 10, 15, 20]), B;
    if (k === 'element') { var dl = R.pick([1, 2, 5]), r = R.pick([0.05, 0.1, 0.2]), th = R.pick([30, 45, 60, 90, 120]); B = 1e-7 * I * dl * 1e-3 * M.sin(deg(th)) / (r * r);
      return P('A short piece of wire ' + $(gu(dl, 'mm')) + ' long carries ' + $(gu(I, 'A')) + '. Find the size of its field $dB$, in nT, at a point ' + $(gu(r * 100, 'cm')) + ' away along a line that makes a $' + th + '^\\circ$ angle with the current\'s direction.', num(B * 1e9, 'nT'),
        ['Biot–Savart: $dB = \\dfrac{\\mu_0}{4\\pi}\\dfrac{I\\,d\\ell\\,\\sin\\theta}{r^2}$, with $\\mu_0/4\\pi = 10^{-7}\\ \\text{T·m/A}$.', $('dB = (10^{-7})\\dfrac{(' + gv(I) + ')(' + gv(dl / 1000) + ')\\sin ' + th + '^\\circ}{(' + gv(r) + ')^2} = ' + nu(B, 'T') + ' = ' + nu(B * 1e9, 'nT'))],
        'dB = (μ₀/4π) I dℓ sin θ / r².', { kind: k, I: I, dl: dl, r: r, th: th }); }
    if (k === 'inline') return P('A straight segment of wire carries ' + $(gu(I, 'A')) + '. Point P lies on the line of the wire, ' + $(gu(R.pick([5, 10, 20]), 'cm')) + ' beyond one end. How strong is the field the segment makes at P?', num(0, 'T'),
      ['For every piece, the direction to P is along the current itself, so $d\\vec{\\ell}\\times\\hat{r} = 0$ ($\\sin 0^\\circ = 0$).', 'No piece contributes, so $B = 0$ at P. A current makes no field straight ahead of itself.'],
      'What is the angle between dℓ and the line to P?', { kind: k });
    var d = R.pick([0.02, 0.05, 0.10]), a = R.pick([0.05, 0.10, 0.20]);
    if (k === 'segment') { B = MU0 * I * a / (2 * PI * d * M.sqrt(a * a + d * d));
      return P('A straight segment of wire ' + $(gu(2 * a * 100, 'cm')) + ' long carries ' + $(gu(I, 'A')) + '. Find the field, in μT, at a point ' + $(gu(d * 100, 'cm')) + ' from the segment\'s midpoint, on its perpendicular bisector.', num(B * 1e6, 'μT'),
        ['A piece at $x$ (measured from the midpoint) is $r = \\sqrt{x^2 + d^2}$ away, and $\\sin\\theta = d/r$. Every piece\'s field points the same way (circling the wire), so the sizes add.', '$$B = \\frac{\\mu_0 I}{4\\pi}\\int_{-a}^{a}\\frac{d\\,dx}{(x^2 + d^2)^{3/2}} = \\frac{\\mu_0 I}{2\\pi d}\\cdot\\frac{a}{\\sqrt{a^2 + d^2}}$$', $('B = \\dfrac{' + tMU + '(' + gv(I) + ')}{2\\pi(' + gv(d) + ')}\\cdot\\dfrac{' + gv(a) + '}{\\sqrt{(' + gv(a) + ')^2 + (' + gv(d) + ')^2}} = ' + nu(B * 1e6, 'μT'))],
        'Integrate (μ₀I/4π) d dx/(x² + d²)^(3/2) from −a to a.', { kind: k, I: I, a: a, d: d }); }
    if (k === 'segEnd') { var Ls = 2 * a; B = MU0 * I * Ls / (4 * PI * d * M.sqrt(Ls * Ls + d * d));
      return P('A straight segment ' + $(gu(Ls * 100, 'cm')) + ' long carries ' + $(gu(I, 'A')) + '. Find the field it makes, in μT, at a point ' + $(gu(d * 100, 'cm')) + ' from one end, on the line through that end perpendicular to the segment.', num(B * 1e6, 'μT'),
        ['Put the segment from $x = 0$ to $x = L$ and the point at $(0, d)$. A piece at $x$ is $r = \\sqrt{x^2 + d^2}$ away with $\\sin\\theta = d/r$.', '$$B = \\frac{\\mu_0 I d}{4\\pi}\\int_0^L\\frac{dx}{(x^2 + d^2)^{3/2}} = \\frac{\\mu_0 I}{4\\pi d}\\cdot\\frac{L}{\\sqrt{L^2 + d^2}}$$', $('B = \\dfrac{' + tMU + '(' + gv(I) + ')}{4\\pi(' + gv(d) + ')}\\cdot\\dfrac{' + gv(Ls) + '}{\\sqrt{(' + gv(Ls) + ')^2 + (' + gv(d) + ')^2}} = ' + nu(B * 1e6, 'μT'))],
        'Same integral as the symmetric case, but from 0 to L.', { kind: k, I: I, L: Ls, d: d }); }
    var s = R.pick([0.05, 0.10, 0.20]); B = 2 * M.SQRT2 * MU0 * I / (PI * s);
    return P('A square loop with sides of ' + $(gu(s * 100, 'cm')) + ' carries ' + $(gu(I, 'A')) + '. Find the field at its center, in μT.', num(B * 1e6, 'μT'),
      ['Each side is a segment of half-length $a = s/2$, seen from a distance $d = s/2$ on its bisector: $B_{\\text{side}} = \\dfrac{\\mu_0I}{2\\pi d}\\cdot\\dfrac{a}{\\sqrt{a^2 + d^2}} = \\dfrac{\\mu_0 I}{2\\pi(s/2)}\\cdot\\dfrac{1}{\\sqrt{2}}$.', 'All four sides make fields in the same direction at the center (the right-hand rule around the loop), so $B = 4B_{\\text{side}} = \\dfrac{2\\sqrt{2}\\,\\mu_0 I}{\\pi s}$.', $('B = \\dfrac{2\\sqrt{2}' + tMU + '(' + gv(I) + ')}{\\pi(' + gv(s) + ')} = ' + nu(B * 1e6, 'μT'))],
      'Four finite segments, each seen from its perpendicular bisector.', { kind: 'square', I: I, s: s });
  });

  G('em.loop-field', function (R, ctx) {
    var k = kind(R, ctx, ['center', 'center', 'mc'], ['arc', 'axis', 'center', 'ratio'], ['hairpin', 'axis', 'arc']);
    var I = R.pick([1, 2, 3, 5, 10]), Rr = R.pick([0.02, 0.05, 0.10, 0.15]), B;
    if (k === 'center') { var N = R.pick([1, 10, 20, 50, 100]); B = MU0 * N * I / (2 * Rr);
      return P((N === 1 ? 'A circular loop' : 'A flat circular coil of ' + N + ' turns') + ' of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(I, 'A')) + '. Find the field at its center, in μT.', num(B * 1e6, 'μT'),
        ['Every piece $d\\ell$ is the same distance $R$ from the center and perpendicular to the line to it ($\\sin\\theta = 1$), and all the contributions point the same way.', 'So $B = \\dfrac{\\mu_0 I}{4\\pi R^2}\\oint d\\ell = \\dfrac{\\mu_0 I}{4\\pi R^2}(2\\pi R) = \\dfrac{\\mu_0 I}{2R}$ per turn.', $('B = \\dfrac{' + (N === 1 ? '' : N) + tMU + '(' + gv(I) + ')}{2(' + gv(Rr) + ')} = ' + nu(B * 1e6, 'μT'))],
        'At the center, B = μ₀NI/(2R).', { kind: k, N: N, I: I, R: Rr }); }
    if (k === 'arc') { var ph = R.pick([60, 90, 120, 180, 270]); B = MU0 * I * deg(ph) / (4 * PI * Rr);
      return P('A wire bent into a circular arc of $' + ph + '^\\circ$ with radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(I, 'A')) + '. Find the field the arc makes at its center, in μT.', num(B * 1e6, 'μT'),
        ['Every piece of the arc is $R$ from the center at right angles, so $B = \\dfrac{\\mu_0 I}{4\\pi R^2}\\times(\\text{arc length}) = \\dfrac{\\mu_0 I}{4\\pi R^2}(R\\phi) = \\dfrac{\\mu_0 I\\phi}{4\\pi R}$, with $\\phi$ in radians.', '$\\phi = ' + ph + '^\\circ = ' + sf(deg(ph)) + '\\ \\text{rad}$.', $('B = \\dfrac{' + tMU + '(' + gv(I) + ')(' + sf(deg(ph)) + ')}{4\\pi(' + gv(Rr) + ')} = ' + nu(B * 1e6, 'μT'))],
        'The arc gives the fraction φ/2π of a full loop\'s μ₀I/(2R).', { kind: k, I: I, R: Rr, ph: ph }); }
    if (k === 'axis') { var z = R.pick([0.02, 0.05, 0.10]); B = MU0 * I * Rr * Rr / (2 * M.pow(z * z + Rr * Rr, 1.5));
      return P('A circular loop of radius ' + $(gu(Rr * 100, 'cm')) + ' carries ' + $(gu(I, 'A')) + '. Find the field on its axis, ' + $(gu(z * 100, 'cm')) + ' from the center, in μT.', num(B * 1e6, 'μT'),
        ['Every piece is $r = \\sqrt{z^2 + R^2}$ away and perpendicular to the line to the point, so $dB = \\dfrac{\\mu_0 I\\,d\\ell}{4\\pi r^2}$. The parts across the axis cancel; the parts along it carry a factor $R/r$.', '$$B = \\frac{\\mu_0 I}{4\\pi r^2}\\cdot\\frac{R}{r}\\cdot 2\\pi R = \\frac{\\mu_0 IR^2}{2(z^2 + R^2)^{3/2}}$$', $('B = \\dfrac{' + tMU + '(' + gv(I) + ')(' + gv(Rr) + ')^2}{2\\left((' + gv(z) + ')^2 + (' + gv(Rr) + ')^2\\right)^{3/2}} = ' + nu(B * 1e6, 'μT'))],
        'Only the axial parts survive: B = μ₀IR²/(2(z² + R²)^(3/2)).', { kind: k, I: I, R: Rr, z: z }); }
    if (k === 'ratio') { var f = R.pick([0.5, 1, 2, 3]), rat = 1 / M.pow(1 + f * f, 1.5);
      return P('On the axis of a current loop of radius $R$, how strong is the field at a distance $z = ' + (f === 0.5 ? '\\tfrac{1}{2}' : f === 1 ? '' : f) + 'R$ from the center, as a fraction of the field at the center? (Answer as a decimal.)', { t: 'num', v: pl(rat), rtol: 0.01 },
        ['$B(z) = \\dfrac{\\mu_0 IR^2}{2(z^2 + R^2)^{3/2}}$ and $B(0) = \\dfrac{\\mu_0 I}{2R}$.', '$\\dfrac{B(z)}{B(0)} = \\dfrac{R^3}{(z^2 + R^2)^{3/2}} = \\dfrac{1}{(1 + ' + (f * f) + ')^{3/2}} = ' + sf(rat) + '$.'],
        'Divide the axial formula by μ₀I/(2R).', { kind: k, f: f }); }
    if (k === 'hairpin') { B = MU0 * I / (4 * Rr) + MU0 * I / (2 * PI * Rr);
      return P('A long wire carrying ' + $(gu(I, 'A')) + ' is bent into a hairpin: two long straight parallel stretches joined by a half circle of radius ' + $(gu(Rr * 100, 'cm')) + '. Find the field at the center of the half circle, in μT.', num(B * 1e6, 'μT'),
        ['The half circle gives half of a loop\'s field: $\\dfrac{\\mu_0 I}{4R}$.', 'Each long straight stretch starts at the end of the half circle, beside the center, and runs off to infinity: half of an infinite wire, $\\dfrac{\\mu_0 I}{4\\pi R}$ each.', 'All three point the same way at the center (the current circulates the same way around it): $$B = \\frac{\\mu_0 I}{4R} + \\frac{\\mu_0 I}{2\\pi R}$$', $('B = ' + nu(MU0 * I / (4 * Rr) * 1e6, 'μT') + ' + ' + nu(MU0 * I / (2 * PI * Rr) * 1e6, 'μT') + ' = ' + nu(B * 1e6, 'μT'))],
        'Add half a loop and two half-infinite straight wires.', { kind: k, I: I, R: Rr }); }
    return P('A circular loop of radius $R$ carries current $I$. Which gives the field at its center?', mcq('$\\dfrac{\\mu_0 I}{2R}$', ['$\\dfrac{\\mu_0 I}{2\\pi R}$', '$0$, because opposite sides cancel', '$\\dfrac{\\mu_0 I}{4\\pi R^2}$']),
      ['$\\mu_0I/(2\\pi R)$ is the field a distance $R$ from a long <i>straight</i> wire, a different shape.', 'For a loop, every piece is $R$ from the center at right angles, and every piece\'s field points the same way there (they do not cancel: opposite sides carry current in opposite directions, so their fields agree).', 'Adding $\\dfrac{\\mu_0 I\\,d\\ell}{4\\pi R^2}$ around $2\\pi R$ gives $\\dfrac{\\mu_0 I}{2R}$, larger than the straight-wire value by a factor of $\\pi$.'],
      'Add the Biot–Savart pieces around the loop.', { kind: 'mc' });
  });

  G('em.amperes-law', function (R, ctx) {
    var k = kind(R, ctx, ['enc', 'circle', 'mc'], ['enc', 'pic', 'rev', 'mc'], ['pic', 'enc', 'rev']);
    if (k === 'enc' || k === 'pic') {
      var cs = k === 'pic' ? [{ x: -0.04, y: 0.02, I: R.pick([2, 3, 4, 5]) }, { x: 0.05, y: -0.03, I: -R.pick([1, 2, 6]) }, { x: R.pick([0.16, -0.16]), y: R.pick([0.08, -0.07]), I: R.pick([3, -4, 5, 8]) }]
        : R.shuffle([{ I: R.pick([2, 3, 4, 5, 6]), ins: true }, { I: -R.pick([1, 2, 3, 7]), ins: true }, { I: R.pick([4, 5, -6, 10]), ins: false }, { I: R.pick([1, 2, -3]), ins: R.coin() }]);
      if (k === 'pic') cs.forEach(function (c) { c.ins = M.hypot(c.x, c.y) < 0.1; });
      var Ie = 0; cs.forEach(function (c) { if (c.ins) Ie += c.I; }); if (Ie === 0) { var fi = 0; while (!cs[fi].ins) fi++; var bump = cs[fi].I > 0 ? 1 : -1; cs[fi].I += bump; Ie += bump; }
      var val = MU0 * Ie;
      var list = cs.map(function (c, i) { return 'wire ' + (i + 1) + ': ' + M.abs(c.I) + ' A ' + (c.I > 0 ? 'out of' : 'into') + ' the page (' + (c.ins ? 'inside' : 'outside') + ' the path)'; }).join('; ');
      return P(k === 'pic' ? 'The picture shows long straight wires seen end-on (⊙ current out of the page, ⊗ into it) and a circular path (dashed). Going counterclockwise around the path, what is $\\oint\\vec{B}\\cdot d\\vec{\\ell}$?' : 'Long straight wires pierce the page: ' + list + '. Going counterclockwise around the path, what is $\\oint\\vec{B}\\cdot d\\vec{\\ell}$?',
        num(val, 'T·m'), ['Ampère\'s law: $\\oint\\vec{B}\\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}}$, counting only currents through the path. Going counterclockwise, the right-hand rule makes current out of the page positive.', '$I_{\\text{enc}} = ' + cs.filter(function (c) { return c.ins; }).map(function (c) { return T.p(c.I); }).join(' + ') + ' = ' + Ie + '\\ \\text{A}$. ' + (cs.some(function (c) { return !c.ins; }) ? 'The outside wire changes $\\vec{B}$ along the path, but its contributions to the integral cancel out.' : ''), $('\\oint\\vec{B}\\cdot d\\vec{\\ell} = ' + tMU + '(' + Ie + ') = ' + nu(val, 'T·m'))],
        'Add only the enclosed currents, with signs from the right-hand rule.', { kind: k, cs: cs }, k === 'pic' ? { viz: { name: 'ph-magnetism', opts: { mode: 'ampere', currents: cs.map(function (c) { return { x: c.x, y: c.y, I: c.I }; }), loopPath: { x: 0, y: 0, r: 0.1 }, interactive: false, quiet: true } } } : null);
    }
    if (k === 'rev') { var Ir = R.pick([-6, -4, -2, 2, 3, 5, 8]), shown = Number((MU0 * Ir).toPrecision(3));
      return P('Around a closed path, $\\oint\\vec{B}\\cdot d\\vec{\\ell} = ' + gu(shown, 'T·m') + '$, going counterclockwise as seen from above. What net current (in A, positive upward, out of the page) passes through the path?', num(shown / MU0, 'A'),
        ['$I_{\\text{enc}} = \\dfrac{1}{\\mu_0}\\oint\\vec{B}\\cdot d\\vec{\\ell}$.', $('I_{\\text{enc}} = \\dfrac{' + gv(shown) + '}{4\\pi \\times 10^{-7}} = ' + nu(shown / MU0, 'A')) + (Ir < 0 ? ', negative: the net current flows downward, into the page.' : '.')],
        'Divide by μ₀.', { kind: k, val: shown }); }
    if (k === 'circle') { var Ic = R.pick([2, 5, 10, 20, 50]), rc = R.pick([0.01, 0.02, 0.05, 0.10]), Bc = MU0 * Ic / (2 * PI * rc);
      return P('Use Ampère\'s law with a circular path to find the field ' + $(gu(rc * 100, 'cm')) + ' from a long straight wire carrying ' + $(gu(Ic, 'A')) + ', in μT.', num(Bc * 1e6, 'μT'),
        ['By symmetry $\\vec{B}$ circles the wire, with the same size all around a circle of radius $r$, and points along the path: $\\oint\\vec{B}\\cdot d\\vec{\\ell} = B(2\\pi r)$.', '$B(2\\pi r) = \\mu_0 I$, so $B = \\dfrac{\\mu_0 I}{2\\pi r}$.', $('B = \\dfrac{' + tMU + '(' + gv(Ic) + ')}{2\\pi(' + gv(rc) + ')} = ' + nu(Bc * 1e6, 'μT'))],
        'On a circle around the wire, B is constant and along the path.', { kind: k, I: Ic, r: rc }); }
    return P('A closed path surrounds a wire carrying 3 A. A second wire carrying 10 A runs just outside the path. What is $\\oint\\vec{B}\\cdot d\\vec{\\ell}$ around the path?', mcq('$\\mu_0(3\\ \\text{A})$', ['$\\mu_0(13\\ \\text{A})$', '$\\mu_0(7\\ \\text{A})$', 'It cannot be found without knowing exactly where the second wire is']),
      ['Ampère\'s law counts only current that passes through the path: $\\oint\\vec{B}\\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}} = \\mu_0(3\\ \\text{A})$ (with the sign from the right-hand rule).', 'The outside wire does change $\\vec{B}$ at points on the path. But going around, its field helps on one side and opposes on the other, and those parts cancel exactly in the integral.'],
      'Which currents pass through the path?', { kind: 'mc' });
  });

  G('em.ampere-applications', function (R, ctx) {
    var k = kind(R, ctx, ['sol', 'outside', 'inside', 'mc'], ['inside', 'sol', 'solI', 'tor'], ['coax', 'Jnon', 'tor', 'inside']);
    var I = R.pick([2, 5, 10, 20, 30]), B;
    if (k === 'inside' || k === 'outside') { var Rw = R.pick([1, 2, 3, 5]) * 1e-3, r = k === 'inside' ? Rw * R.pick([0.25, 0.5, 0.75]) : Rw * R.pick([2, 4, 10]);
      B = k === 'inside' ? MU0 * I * r / (2 * PI * Rw * Rw) : MU0 * I / (2 * PI * r);
      return P('A long straight wire of radius ' + $(gu(Rw * 1000, 'mm')) + ' carries ' + $(gu(I, 'A')) + ' spread evenly over its cross section. Find the field ' + $(gu(+(r * 1000).toPrecision(3), 'mm')) + ' from its axis, in mT.', num(B * 1000, 'mT'),
        ['Use a circular Ampère path of radius $r$ centered on the axis: $B(2\\pi r) = \\mu_0 I_{\\text{enc}}$.', k === 'inside' ? 'Inside, the path encloses the fraction $r^2/R^2$ of the current, so $B = \\dfrac{\\mu_0 I r}{2\\pi R^2}$, growing with $r$.' : 'Outside, it encloses all of $I$: $B = \\dfrac{\\mu_0 I}{2\\pi r}$.', k === 'inside' ? $('B = \\dfrac{' + tMU + '(' + gv(I) + ')(' + gv(r) + ')}{2\\pi(' + gv(Rw) + ')^2} = ' + nu(B * 1000, 'mT')) : $('B = \\dfrac{' + tMU + '(' + gv(I) + ')}{2\\pi(' + gv(r) + ')} = ' + nu(B * 1000, 'mT'))],
        k === 'inside' ? 'Only the current inside radius r counts: I r²/R².' : 'Outside, the wire acts like a thin line of current.', { kind: k, I: I, R: Rw, r: r }); }
    if (k === 'sol' || k === 'solI') { var Nn = R.pick([200, 400, 500, 800, 1000, 1500]), ln = R.pick([0.1, 0.2, 0.25, 0.5]), n = Nn / ln;
      if (k === 'sol') { var Is = R.pick([0.5, 1, 2, 3, 5]); B = MU0 * n * Is;
        return P('A long solenoid ' + $(gu(ln * 100, 'cm')) + ' long has ' + Nn + ' turns and carries ' + $(gu(Is, 'A')) + '. Find the field inside it, in mT.', num(B * 1000, 'mT'),
          ['Ampère\'s law with a rectangular path, one side inside along the axis: only that side contributes, $B\\ell = \\mu_0(n\\ell)I$, so $B = \\mu_0 nI$.', '$n = ' + Nn + '/' + gv(ln) + ' = ' + sf(n) + '$ turns per meter.', $('B = ' + tMU + '(' + sf(n) + ')(' + gv(Is) + ') = ' + nu(B * 1000, 'mT'))],
          'B = μ₀nI, with n in turns per meter.', { kind: k, N: Nn, l: ln, I: Is }); }
      var Bt = R.pick([5, 10, 20, 25, 50]) * 1e-3, It = Bt / (MU0 * n);
      return P('What current must flow in a solenoid with ' + Nn + ' turns over ' + $(gu(ln * 100, 'cm')) + ' to make a field of ' + $(gu(Bt * 1000, 'mT')) + ' inside?', num(It, 'A'),
        ['$B = \\mu_0 nI$, so $I = \\dfrac{B}{\\mu_0 n}$ with $n = ' + sf(n) + '\\ \\text{m}^{-1}$.', $('I = \\dfrac{' + gv(Bt) + '}{' + tMU + '(' + sf(n) + ')} = ' + nu(It, 'A'))], 'Solve B = μ₀nI for I.', { kind: k, N: Nn, l: ln, B: Bt }); }
    if (k === 'tor') { var Nt = R.pick([200, 500, 1000, 2000]), It2 = R.pick([0.5, 1, 2]), rt = R.pick([0.05, 0.08, 0.10, 0.12]); B = MU0 * Nt * It2 / (2 * PI * rt);
      return P('A toroid has ' + Nt + ' turns carrying ' + $(gu(It2, 'A')) + '. Find the field inside its windings at a distance ' + $(gu(rt * 100, 'cm')) + ' from its center, in mT.', num(B * 1000, 'mT'),
        ['A circular Ampère path of radius $r$ inside the windings links all $N$ turns: $B(2\\pi r) = \\mu_0 NI$.', $('B = \\dfrac{\\mu_0 NI}{2\\pi r} = \\dfrac{' + tMU + '(' + Nt + ')(' + gv(It2) + ')}{2\\pi(' + gv(rt) + ')} = ' + nu(B * 1000, 'mT')), 'Unlike a solenoid, the field is weaker toward the outer edge of the toroid.'],
        'An Ampère circle inside the doughnut encloses N turns.', { kind: k, N: Nt, I: It2, r: rt }); }
    if (k === 'coax') { var rr = R.pick([0.002, 0.005, 0.02]), out = rr > 0.01; B = out ? 0 : MU0 * I / (2 * PI * rr);
      return P('A coaxial cable has a thin central wire carrying ' + $(gu(I, 'A')) + ' one way and a thin outer shell of radius ' + $(gu(1, 'cm')) + ' carrying the same current back. Find the magnetic field ' + $(gu(rr * 1000, 'mm')) + ' from the axis, in mT.', num(B * 1000, 'mT'),
        [out ? 'A circular path outside the whole cable encloses $I - I = 0$, so $B(2\\pi r) = 0$ and $B = 0$. Coaxial cables keep their field inside.' : 'A circular path between the wire and the shell encloses only the central current: $B = \\dfrac{\\mu_0 I}{2\\pi r}$.', out ? 'Answer: $0$.' : $('B = \\dfrac{' + tMU + '(' + gv(I) + ')}{2\\pi(' + gv(rr) + ')} = ' + nu(B * 1000, 'mT'))],
        'What net current does a circle of that radius enclose?', { kind: k, I: I, r: rr }); }
    if (k === 'Jnon') { var J0 = R.pick([1, 2, 5]) * 1e6, Rw2 = R.pick([2, 5]) * 1e-3, r2 = Rw2 * R.pick([0.5, 0.8]); B = MU0 * J0 * r2 * r2 / (3 * Rw2);
      return P('A wire of radius ' + $(gu(Rw2 * 1000, 'mm')) + ' carries a current density that grows outward: $J = J_0 r/R$ with $J_0 = ' + gu(J0, 'A/m²') + '$. Find the field ' + $(gu(+(r2 * 1000).toPrecision(3), 'mm')) + ' from the axis, in mT.', num(B * 1000, 'mT'),
        ['Current inside radius $r$: $$I(r) = \\int_0^r J_0\\frac{s}{R}\\,2\\pi s\\,ds = \\frac{2\\pi J_0 r^3}{3R}$$', 'Ampère: $B(2\\pi r) = \\mu_0\\dfrac{2\\pi J_0 r^3}{3R}$, so $B = \\dfrac{\\mu_0 J_0 r^2}{3R}$.', $('B = \\dfrac{' + tMU + '(' + gv(J0) + ')(' + gv(r2) + ')^2}{3(' + gv(Rw2) + ')} = ' + nu(B * 1000, 'mT'))],
        'Integrate J over rings of area 2πs ds to find the enclosed current.', { kind: k, J0: J0, R: Rw2, r: r2 }); }
    return P('A thick copper wire carries a steady current. What is the magnetic field at a point inside the copper, halfway from the axis to the surface?', mcq('Half its value at the surface', ['Zero, as the electric field is inside a charged conductor', 'The same as at the surface', 'Twice its value at the surface']),
      ['An Ampère circle of radius $r$ inside the wire encloses the fraction $(r/R)^2$ of the current.', '$B(2\\pi r) = \\mu_0 I\\dfrac{r^2}{R^2}$, so $B = \\dfrac{\\mu_0 Ir}{2\\pi R^2}$: it grows in step with $r$. Halfway out, it is half the surface value.', 'The "zero inside" rule is about the <i>electric</i> field in a conductor in equilibrium, with no current. Here charge is flowing, and the current inside makes a field.'],
      'How much current does an Ampère circle inside the wire enclose?', { kind: 'mc' });
  });


  // ================================================================ Unit 6: Electromagnetic Induction

  function LH(L) { return L >= 1 ? gu(L, 'H') : gu(+(L * 1000).toPrecision(4), 'mH'); } // an inductance shown in H or mH
  G('em.changing-flux', function (R, ctx) {
    var k = kind(R, ctx, ['tilt', 'tiltPlane', 'mc'], ['rotate', 'Bt', 'area', 'tiltPlane'], ['wire', 'rotate', 'wireI']);
    var B = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.8]), s = R.pick([5, 10, 20, 30]), A = sq(s / 100), Phi;
    if (k === 'tilt' || k === 'tiltPlane') { var th = R.pick([20, 30, 40, 50, 60, 70]), thN = k === 'tilt' ? th : 90 - th; Phi = B * A * M.cos(deg(thN));
      return P('A square loop ' + $(gu(s, 'cm')) + ' on a side sits in a uniform ' + $(gu(B, 'T')) + ' field. The field makes a $' + th + '^\\circ$ angle with the loop\'s ' + (k === 'tilt' ? 'normal' : 'plane') + '. Find the magnetic flux through it, in mWb.', num(Phi * 1000, 'mWb'),
        ['$\\Phi_B = BA\\cos\\theta$ with $\\theta$ from the normal.' + (k === 'tiltPlane' ? ' The angle to the plane is ' + th + '°, so $\\theta = ' + thN + '^\\circ$.' : ''), $('\\Phi_B = (' + gv(B) + ')(' + gv(s / 100) + ')^2\\cos ' + thN + '^\\circ = ' + nu(Phi, 'Wb') + ' = ' + nu(Phi * 1000, 'mWb'))],
        'Φ = BA cos θ, θ from the normal.', { kind: k, B: B, s: s, th: thN }); }
    if (k === 'rotate') { var t1 = R.pick([0, 30, 60]), t2 = R.pick([90, 120, 180]), dP = B * A * (M.cos(deg(t2)) - M.cos(deg(t1)));
      return P('A square loop ' + $(gu(s, 'cm')) + ' on a side in a steady ' + $(gu(B, 'T')) + ' field is turned so the angle between its normal and the field goes from $' + t1 + '^\\circ$ to $' + t2 + '^\\circ$. Find the change in flux, $\\Phi_{\\text{final}} - \\Phi_{\\text{initial}}$, in mWb.', { a: { t: 'num', v: pl(dP * 1000), rtol: 0.02 }, unit: 'mWb' },
        ['The field stays the same, but turning the loop changes $\\cos\\theta$.', $('\\Delta\\Phi = BA(\\cos ' + t2 + '^\\circ - \\cos ' + t1 + '^\\circ) = (' + gv(B) + ')(' + gv(A) + ')(' + sf(M.cos(deg(t2))) + ' - ' + sf(M.cos(deg(t1))) + ') = ' + nu(dP * 1000, 'mWb'))],
        'Find BA cos θ at both angles and subtract.', { kind: k, B: B, s: s, t1: t1, t2: t2 }); }
    if (k === 'Bt') { var B0 = R.pick([0.1, 0.2, 0.5]), b = R.pick([0.02, 0.05, 0.1]), tt = R.pick([2, 3, 5, 10]), Bv = B0 + b * tt; Phi = Bv * A;
      return P('A field perpendicular to a ' + $(gu(s, 'cm')) + ' square loop grows as $B(t) = ' + gv(B0) + ' + ' + gv(b) + 't$ (tesla, $t$ in seconds). Find the flux through the loop at $t = ' + gu(tt, 's') + '$, in mWb.', num(Phi * 1000, 'mWb'),
        ['$B(' + tt + ') = ' + gv(B0) + ' + ' + gv(b) + '(' + tt + ') = ' + gu(+Bv.toFixed(3), 'T') + '$.', $('\\Phi = BA = (' + gv(+Bv.toFixed(3)) + ')(' + gv(A) + ') = ' + nu(Phi * 1000, 'mWb'))], 'Find B at that time, then multiply by the area.', { kind: k, B0: B0, b: b, t: tt, s: s }); }
    if (k === 'area') { var s0 = R.pick([10, 20]), v = R.pick([1, 2, 5]), tt2 = R.pick([2, 4, 5]), side = (s0 + v * tt2) / 100; Phi = B * side * side;
      return P('A square loop in a uniform ' + $(gu(B, 'T')) + ' field (perpendicular to the loop) is made of stretchy wire. Its side grows from ' + $(gu(s0, 'cm')) + ' at ' + $(gu(v, 'cm/s')) + '. Find the flux through it after ' + $(gu(tt2, 's')) + ', in mWb.', num(Phi * 1000, 'mWb'),
        ['Side after ' + tt2 + ' s: $' + s0 + ' + ' + v + '(' + tt2 + ') = ' + (s0 + v * tt2) + '\\ \\text{cm}$.', $('\\Phi = B s^2 = (' + gv(B) + ')(' + gv(side) + ')^2 = ' + nu(Phi * 1000, 'mWb'))], 'The field is steady but the area grows.', { kind: k, B: B, s0: s0, v: v, t: tt2 }); }
    var I = R.pick([5, 10, 20, 50]), w = R.pick([0.1, 0.2, 0.5]), a = R.pick([0.01, 0.02, 0.05]), b2 = a * R.pick([2, 3, 5, 10]);
    Phi = MU0 * I * w / (2 * PI) * M.log(b2 / a);
    if (k === 'wire' || k === 'wireI') return P('A long straight wire carries ' + $(gu(I, 'A')) + '. A rectangular loop lies in the same plane, with its two sides of length ' + $(gu(w * 100, 'cm')) + ' parallel to the wire at ' + $(gu(a * 100, 'cm')) + ' and ' + $(gu(+(b2 * 100).toPrecision(3), 'cm')) + ' from it. Find the flux through the loop, in μWb.', num(Phi * 1e6, 'μWb'),
      ['The field $B = \\dfrac{\\mu_0 I}{2\\pi r}$ changes across the loop, so use strips parallel to the wire: area $w\\,dr$, where $B$ is constant.', '$$\\Phi = \\int_a^b\\frac{\\mu_0 I}{2\\pi r}\\,w\\,dr = \\frac{\\mu_0 I w}{2\\pi}\\ln\\frac{b}{a}$$', $('\\Phi = \\dfrac{' + tMU + '(' + gv(I) + ')(' + gv(w) + ')}{2\\pi}\\ln ' + gv(b2 / a) + ' = ' + nu(Phi * 1e6, 'μWb'))],
      'B varies with distance from the wire: integrate over strips parallel to it.', { kind: k, I: I, w: w, a: a, b: b2 });
    return P('A loop of wire sits in a steady, uniform magnetic field. Which of these changes the magnetic flux through it?', mcq('Turning the loop so it tilts relative to the field', ['Sliding the loop sideways without turning it, staying inside the uniform field', 'Nothing can, since the field is steady', 'Raising the current in a nearby circuit that is switched off']),
      ['$\\Phi_B = BA\\cos\\theta$ changes if $B$, $A$ or $\\theta$ changes.', 'Turning the loop changes $\\theta$, so the flux changes even though the field is steady.', 'Sliding it within a uniform field changes none of the three.'],
      'Φ = BA cos θ: which factor changes?', { kind: 'mc' });
  });

  G('em.faraday-calculus', function (R, ctx) {
    var k = kind(R, ctx, ['Bpoly', 'Bpoly', 'mc'], ['Bpoly', 'Bexp', 'radius', 'current'], ['Bsin', 'wire', 'Bexp', 'radius']);
    var N = R.pick([1, 10, 20, 50, 100]), s = R.pick([5, 10, 20]), A = sq(s / 100), emf;
    var coil = (N === 1 ? 'A square loop' : 'A square coil of ' + N + ' turns') + ' ' + $(gu(s, 'cm')) + ' on a side';
    if (k === 'Bpoly' || k === 'current') { var a = R.pick([0.01, 0.02, 0.05, 0.1]), b = R.pick([0.01, 0.02, 0.1, 0.2]), tt = R.pick([1, 2, 3, 5]); emf = N * A * (2 * a * tt + b);
      var st = ['$\\Phi = BA$ per turn, so $|\\varepsilon| = N\\left|\\dfrac{d\\Phi}{dt}\\right| = NA\\left|\\dfrac{dB}{dt}\\right|$.', '$\\dfrac{dB}{dt} = 2(' + gv(a) + ')t + ' + gv(b) + '$, which at $t = ' + tt + '\\ \\text{s}$ is $' + gv(+(2 * a * tt + b).toFixed(4)) + '\\ \\text{T/s}$.', $('|\\varepsilon| = (' + N + ')(' + gv(A) + ')(' + gv(+(2 * a * tt + b).toFixed(4)) + ') = ' + nu(emf, 'V'))];
      if (k === 'Bpoly') return P(coil + ' sits in a field perpendicular to it that changes as $B(t) = ' + gv(a) + 't^2 + ' + gv(b) + 't$ (tesla, $t$ in seconds). Find the size of the induced emf at $t = ' + gu(tt, 's') + '$, in mV.', num(emf * 1000, 'mV'), st.slice(0, 2).concat([$('|\\varepsilon| = (' + N + ')(' + gv(A) + ')(' + gv(+(2 * a * tt + b).toFixed(4)) + ') = ' + nu(emf * 1000, 'mV'))]), 'Differentiate B(t), then ε = NA dB/dt.', { kind: k, N: N, s: s, a: a, b: b, t: tt });
      var Rl = R.pick([0.5, 1, 2, 5]); return P(coil + ' with total resistance ' + $(gu(Rl, 'Ω')) + ' sits in a perpendicular field $B(t) = ' + gv(a) + 't^2 + ' + gv(b) + 't$ (tesla, seconds). What current flows at $t = ' + gu(tt, 's') + '$, in mA?', num(emf / Rl * 1000, 'mA'), st.concat(['$I = \\varepsilon/R = ' + sf(emf) + '/' + gv(Rl) + ' = ' + nu(emf / Rl * 1000, 'mA') + '$.']), 'Find the emf from dB/dt, then I = ε/R.', { kind: k, N: N, s: s, a: a, b: b, t: tt, R: Rl }); }
    if (k === 'Bexp') { var B0 = R.pick([0.5, 1.0, 1.5, 2.0]), tau = R.pick([0.1, 0.2, 0.5, 1.0]), t2 = Number((tau * R.pick([0.5, 1, 2])).toPrecision(2)); emf = N * A * B0 / tau * M.exp(-t2 / tau);
      return P(coil + ' sits in a perpendicular field that dies away as $B = B_0e^{-t/\\tau}$ with $B_0 = ' + gu(B0, 'T') + '$ and $\\tau = ' + gu(tau, 's') + '$. Find the emf at $t = ' + gu(t2, 's') + '$, in mV.', num(emf * 1000, 'mV'),
        ['$\\dfrac{dB}{dt} = -\\dfrac{B_0}{\\tau}e^{-t/\\tau}$, so $|\\varepsilon| = NA\\dfrac{B_0}{\\tau}e^{-t/\\tau}$.', $('|\\varepsilon| = (' + N + ')(' + gv(A) + ')\\dfrac{' + gv(B0) + '}{' + gv(tau) + '}e^{-' + gv(t2) + '/' + gv(tau) + '} = ' + nu(emf * 1000, 'mV'))], 'Differentiate the exponential with the chain rule.', { kind: k, N: N, s: s, B0: B0, tau: tau, t: t2 }); }
    if (k === 'Bsin') { var B1 = R.pick([0.01, 0.02, 0.05]), f = R.pick([50, 60, 100]), w = 2 * PI * f, t3 = R.pick([1, 2, 3]) * 1e-3; emf = N * A * B1 * w * M.abs(M.cos(w * t3));
      return P(coil + ' sits in a perpendicular field $B = B_0\\sin\\omega t$ with $B_0 = ' + gu(B1, 'T') + '$ and $f = ' + gu(f, 'Hz') + '$. Find the size of the emf at $t = ' + gu(t3 * 1000, 'ms') + '$.', num(emf, 'V'),
        ['$|\\varepsilon| = NA\\left|\\dfrac{dB}{dt}\\right| = NAB_0\\omega|\\cos\\omega t|$, with $\\omega = 2\\pi f = ' + sf(w) + '\\ \\text{rad/s}$.', '$\\omega t = (' + sf(w) + ')(' + gv(t3) + ') = ' + sf(w * t3) + '\\ \\text{rad}$.', $('|\\varepsilon| = (' + N + ')(' + gv(A) + ')(' + gv(B1) + ')(' + sf(w) + ')|\\cos(' + sf(w * t3) + ')| = ' + nu(emf, 'V'))],
        'Differentiate sin ωt: the emf goes as cos ωt (radians!).', { kind: k, N: N, s: s, B0: B1, f: f, t: t3 }); }
    if (k === 'radius') { var Bf = R.pick([0.2, 0.5, 0.8]), r0 = R.pick([5, 10]), v = R.pick([2, 5, 10]), t4 = R.pick([1, 2, 3]), rr = (r0 + v * t4) / 100; emf = Bf * 2 * PI * rr * v / 100;
      return P('A circular loop of stretchy conductor lies in a uniform ' + $(gu(Bf, 'T')) + ' field perpendicular to it. Its radius grows from ' + $(gu(r0, 'cm')) + ' at a steady ' + $(gu(v, 'cm/s')) + '. Find the emf after ' + $(gu(t4, 's')) + ', in mV.', num(emf * 1000, 'mV'),
        ['$\\Phi = B\\pi r^2$, so by the chain rule $\\dfrac{d\\Phi}{dt} = B\\cdot 2\\pi r\\dfrac{dr}{dt}$.', 'At that moment $r = ' + gv(rr * 100) + '\\ \\text{cm}$ and $dr/dt = ' + gv(v / 100) + '\\ \\text{m/s}$.', $('|\\varepsilon| = (' + gv(Bf) + ')(2\\pi)(' + gv(rr) + ')(' + gv(v / 100) + ') = ' + nu(emf * 1000, 'mV'))],
        'dΦ/dt = B·2πr·dr/dt.', { kind: k, B: Bf, r0: r0, v: v, t: t4 }); }
    if (k === 'wire') { var k2 = R.pick([10, 20, 50, 100]), w2 = R.pick([0.1, 0.2]), a2 = 0.02, b2 = a2 * R.pick([3, 5, 10]); emf = MU0 * w2 / (2 * PI) * M.log(b2 / a2) * k2;
      return P('A long wire\'s current rises steadily at ' + $(gu(k2, 'A/s')) + '. A rectangular loop beside it, in the same plane, has sides of ' + $(gu(w2 * 100, 'cm')) + ' parallel to the wire at ' + $(gu(a2 * 100, 'cm')) + ' and ' + $(gu(b2 * 100, 'cm')) + ' from it. Find the emf in the loop, in μV.', num(emf * 1e6, 'μV'),
        ['The flux through the loop is $\\Phi = \\dfrac{\\mu_0 I w}{2\\pi}\\ln\\dfrac{b}{a}$ (integrating strips parallel to the wire).', 'Only $I$ changes, so $|\\varepsilon| = \\dfrac{\\mu_0 w}{2\\pi}\\ln\\dfrac{b}{a}\\cdot\\dfrac{dI}{dt}$.', $('|\\varepsilon| = (2 \\times 10^{-7})(' + gv(w2) + ')\\ln ' + gv(b2 / a2) + '\\cdot(' + gv(k2) + ') = ' + nu(emf * 1e6, 'μV'))],
        'Write the flux in terms of I, then differentiate.', { kind: k, k: k2, w: w2, a: a2, b: b2 }); }
    return P('The field through a loop rises from 0 to 0.50 T over 10 s, but not steadily: it barely changes for 9 s, then jumps in the last second. You want the emf at $t = 9.5\\ \\text{s}$. What should you use?', mcq('The slope of the flux at that instant, $d\\Phi/dt$ at $t = 9.5\\ \\text{s}$', ['The average, $\\Delta\\Phi/\\Delta t$ over the whole 10 s', 'The flux itself at $t = 9.5\\ \\text{s}$', 'The total change in flux, $\\Delta\\Phi$']),
      ['Faraday\'s law gives the emf at each moment as $\\varepsilon = -d\\Phi/dt$, the slope of the flux graph at that time.', 'The 10-second average hides the jump: the true emf is near zero for 9 s and then about ten times the average during the last second.', 'An average over an interval only gives the average emf over that interval.'],
      'ε = −dΦ/dt is a derivative, taken at one moment.', { kind: 'mc' });
  });

  G('em.generators', function (R, ctx) {
    var k = kind(R, ctx, ['peak', 'peak', 'mc'], ['rpm', 'inst', 'omega', 'peak'], ['current', 'rpm', 'inst']);
    var N = R.pick([50, 100, 200, 500]), A = R.pick([0.01, 0.02, 0.04, 0.05]), B = R.pick([0.1, 0.2, 0.25, 0.5]), f = R.pick([10, 20, 50, 60]), w = 2 * PI * f, e0 = N * B * A * w;
    var gen = 'A generator coil of ' + N + ' turns, each of area ' + $(gu(A, 'm²')) + ', spins in a ' + $(gu(B, 'T')) + ' field';
    if (k === 'peak') return P(gen + ' at ' + $(gu(f, 'Hz')) + '. Find the peak emf.', num(e0, 'V'),
      ['With $\\theta = \\omega t$ between the normal and the field, $\\Phi = NBA\\cos\\omega t$ and $\\varepsilon = -\\dfrac{d\\Phi}{dt} = NBA\\omega\\sin\\omega t$, with peak $NBA\\omega$.', '$\\omega = 2\\pi f = ' + sf(w) + '\\ \\text{rad/s}$.', $('\\varepsilon_0 = (' + N + ')(' + gv(B) + ')(' + gv(A) + ')(' + sf(w) + ') = ' + nu(e0, 'V'))], 'ε₀ = NBAω with ω = 2πf.', { kind: k, N: N, A: A, B: B, f: f });
    if (k === 'rpm') { var rpm = R.pick([600, 1200, 1800, 3000, 3600]), w2 = rpm * 2 * PI / 60, e2 = N * B * A * w2;
      return P(gen + ' at ' + rpm + ' revolutions per minute. Find the peak emf.', num(e2, 'V'), ['Convert: $\\omega = ' + rpm + '\\ \\tfrac{\\text{rev}}{\\text{min}} \\times \\dfrac{2\\pi\\ \\text{rad}}{1\\ \\text{rev}} \\times \\dfrac{1\\ \\text{min}}{60\\ \\text{s}} = ' + sf(w2) + '\\ \\text{rad/s}$.', $('\\varepsilon_0 = NBA\\omega = (' + N + ')(' + gv(B) + ')(' + gv(A) + ')(' + sf(w2) + ') = ' + nu(e2, 'V'))], 'Convert rpm to rad/s first.', { kind: k, N: N, A: A, B: B, rpm: rpm }); }
    if (k === 'inst') { var ang = R.pick([30, 45, 60, 90, 150]), ei = e0 * M.sin(deg(ang));
      return P(gen + ' at ' + $(gu(f, 'Hz')) + '. What is the emf at the moment the coil\'s normal is $' + ang + '^\\circ$ from the field?', num(ei, 'V'), ['$\\varepsilon = NBA\\omega\\sin\\theta$, with $\\theta$ the angle between the normal and the field.', '$\\varepsilon_0 = NBA\\omega = ' + nu(e0, 'V') + '$.', $('\\varepsilon = ' + sf(e0) + '\\sin ' + ang + '^\\circ = ' + nu(ei, 'V'))], 'ε = NBAω sin θ.', { kind: k, N: N, A: A, B: B, f: f, ang: ang }); }
    if (k === 'omega') { var et = R.pick([120, 170, 240, 340]), wn = et / (N * B * A);
      return P('A coil of ' + N + ' turns, each of area ' + $(gu(A, 'm²')) + ', spins in a ' + $(gu(B, 'T')) + ' field. What angular speed (in rad/s) gives a peak emf of ' + $(gu(et, 'V')) + '?', num(wn, 'rad/s'), ['$\\varepsilon_0 = NBA\\omega$, so $\\omega = \\dfrac{\\varepsilon_0}{NBA}$.', $('\\omega = \\dfrac{' + gv(et) + '}{(' + N + ')(' + gv(B) + ')(' + gv(A) + ')} = ' + nu(wn, 'rad/s'))], 'Solve ε₀ = NBAω for ω.', { kind: k, N: N, A: A, B: B, e: et }); }
    if (k === 'current') { var Rl = R.pick([10, 20, 50, 100]), I0 = e0 / Rl;
      return P(gen + ' at ' + $(gu(f, 'Hz')) + '. Its ends are connected to a ' + $(gu(Rl, 'Ω')) + ' resistor (the coil\'s own resistance is negligible). Find the peak current.', num(I0, 'A'), ['$\\varepsilon_0 = NBA\\omega = (' + N + ')(' + gv(B) + ')(' + gv(A) + ')(2\\pi \\cdot ' + f + ') = ' + nu(e0, 'V') + '$.', $('I_0 = \\varepsilon_0/R = ' + sf(e0) + '/' + gv(Rl) + ' = ' + nu(I0, 'A'))], 'Find the peak emf, then I = ε/R.', { kind: k, N: N, A: A, B: B, f: f, R: Rl }); }
    return P('A generator coil spins steadily in a uniform field. At which moment is its emf largest?', mcq('When the plane of the coil lies along the field, so no field passes through it', ['When the field passes straight through the coil, giving the most flux', 'When the coil is at 45° to the field', 'The emf is the same at every moment']),
      ['$\\Phi = NBA\\cos\\omega t$ and $\\varepsilon = NBA\\omega\\sin\\omega t$: the emf follows the <i>rate of change</i> of the flux.', 'When the flux is largest, it is momentarily flat (at the top of its cosine curve): $\\varepsilon = 0$.', 'When the coil\'s plane lies along the field, the flux is zero but changing fastest, so the emf is largest.'],
      'The emf follows the slope of Φ(t), not its size.', { kind: 'mc' });
  });

  G('em.induced-electric-field', function (R, ctx) {
    var k = kind(R, ctx, ['inside', 'inside', 'mc'], ['inside', 'outside', 'emf', 'force'], ['outside', 'sin', 'force', 'emf']);
    var Rs = R.pick([0.02, 0.03, 0.05, 0.10]), dB = R.pick([0.1, 0.2, 0.5, 1, 2, 5]), r, E;
    var sol = 'Inside a long solenoid of radius ' + $(gu(Rs * 100, 'cm')) + ', the uniform field is increasing at ' + $(gu(dB, 'T/s')) + '. ';
    if (k === 'inside' || k === 'force') { r = Rs * R.pick([0.25, 0.5, 0.8]); E = r / 2 * dB;
      if (k === 'inside') return P(sol + 'How strong is the induced electric field ' + $(gu(+(r * 100).toPrecision(3), 'cm')) + ' from the axis?', num(E * 1000, 'mV/m'),
        ['By symmetry the induced $\\vec{E}$ circles the axis, the same size all around a circle of radius $r$: $\\oint\\vec{E}\\cdot d\\vec{\\ell} = E(2\\pi r)$.', 'Faraday: $E(2\\pi r) = \\dfrac{d\\Phi}{dt} = \\pi r^2\\dfrac{dB}{dt}$ in size, so $E = \\dfrac{r}{2}\\dfrac{dB}{dt}$.', $('E = \\dfrac{' + gv(+r.toPrecision(3)) + '}{2}(' + gv(dB) + ') = ' + nu(E, 'V/m') + ' = ' + nu(E * 1000, 'mV/m'))],
        'Use a circle of radius r: E(2πr) = πr² dB/dt.', { kind: k, R: Rs, dB: dB, r: r });
      var F = QE * E; return P(sol + 'What force acts on an electron sitting at rest ' + $(gu(+(r * 100).toPrecision(3), 'cm')) + ' from the axis?', num(F, 'N'),
        ['A charge at rest feels no magnetic force, but the changing field makes an electric field: $E = \\dfrac{r}{2}\\dfrac{dB}{dt} = ' + nu(E, 'V/m') + '$.', $('F = eE = (1.60 \\times 10^{-19})(' + sf(E) + ') = ' + nu(F, 'N')), 'It pushes along the circle around the axis: no wire is needed.'],
        'Find the induced E, then F = eE.', { kind: k, R: Rs, dB: dB, r: r }); }
    if (k === 'outside') { r = Rs * R.pick([2, 3, 5]); E = Rs * Rs * dB / (2 * r);
      return P(sol + 'How strong is the induced electric field ' + $(gu(+(r * 100).toPrecision(3), 'cm')) + ' from the axis, outside the solenoid where $B$ is practically zero?', num(E * 1000, 'mV/m'),
        ['A circle of radius $r$ outside still encloses all the changing flux, $\\pi R^2 B$.', '$E(2\\pi r) = \\pi R^2\\dfrac{dB}{dt}$, so $E = \\dfrac{R^2}{2r}\\dfrac{dB}{dt}$.', $('E = \\dfrac{(' + gv(Rs) + ')^2(' + gv(dB) + ')}{2(' + gv(+r.toPrecision(3)) + ')} = ' + nu(E * 1000, 'mV/m')) + '. There is an electric field where there is no magnetic field.'],
        'The circle encloses only the flux inside the solenoid: πR² dB/dt.', { kind: k, R: Rs, dB: dB, r: r }); }
    if (k === 'emf') { r = Rs * R.pick([2, 3, 4]); var emf = PI * Rs * Rs * dB;
      return P(sol + 'A wire ring of radius ' + $(gu(+(r * 100).toPrecision(3), 'cm')) + ' encircles the solenoid outside it. What emf is induced around the ring, in mV?', num(emf * 1000, 'mV'),
        ['$|\\varepsilon| = \\dfrac{d\\Phi}{dt}$, and the flux through the ring is all inside the solenoid: $\\Phi = \\pi R^2B$.', $('|\\varepsilon| = \\pi(' + gv(Rs) + ')^2(' + gv(dB) + ') = ' + nu(emf * 1000, 'mV')), 'The ring\'s own size does not matter, as long as it goes around the solenoid.'],
        'Only the area where B is changing counts.', { kind: k, R: Rs, dB: dB, r: r }); }
    if (k === 'sin') { var B0 = R.pick([0.01, 0.02, 0.05]), f = R.pick([50, 60, 100]), w = 2 * PI * f; r = Rs * 0.5; E = r / 2 * B0 * w;
      return P('Inside a long solenoid of radius ' + $(gu(Rs * 100, 'cm')) + ', the field oscillates as $B = B_0\\sin\\omega t$ with $B_0 = ' + gu(B0, 'T') + '$ at ' + $(gu(f, 'Hz')) + '. Find the largest induced electric field at ' + $(gu(+(r * 100).toPrecision(3), 'cm')) + ' from the axis, in V/m.', num(E, 'V/m'),
        ['$E = \\dfrac{r}{2}\\left|\\dfrac{dB}{dt}\\right|$ and $\\dfrac{dB}{dt} = B_0\\omega\\cos\\omega t$, at most $B_0\\omega$.', $('E_{\\max} = \\dfrac{' + gv(+r.toPrecision(3)) + '}{2}(' + gv(B0) + ')(2\\pi \\cdot ' + f + ') = ' + nu(E, 'V/m'))],
        'The largest dB/dt is B₀ω.', { kind: k, R: Rs, B0: B0, f: f, r: r }); }
    return P('A changing magnetic field fills a region of empty space with no wires in it. Is there an induced electric field?', mcq('Yes: the changing magnetic field itself makes a curling electric field, wire or no wire', ['No: induced fields exist only inside conductors', 'Only if a charge is present to feel it', 'No: electric fields come only from charges']),
      ['Faraday\'s law in field form, $\\oint\\vec{E}\\cdot d\\vec{\\ell} = -\\dfrac{d\\Phi_B}{dt}$, holds for any closed path, in a wire or in empty space.', 'A wire, if present, simply has free charges that the field can push around, so a current flows. The field is there either way.', 'This kind of electric field is not made by charges, and its lines close on themselves.'],
      'Does Faraday\'s law mention a wire?', { kind: 'mc' });
  });

  G('em.magnetic-braking', function (R, ctx) {
    var k = kind(R, ctx, ['force', 'force', 'mc'], ['tau', 'vt', 'term', 'force'], ['dist', 'power', 'vt', 'term']);
    var B = R.pick([0.5, 0.8, 1.0, 1.2, 1.5]), L = R.pick([0.2, 0.25, 0.4, 0.5]), Rr = R.pick([0.5, 1, 2, 4]), m = R.pick([0.05, 0.1, 0.2, 0.5]), v0 = R.pick([1, 2, 3, 4, 5]);
    var rails = 'A metal rod of length ' + $(gu(L, 'm')) + ' slides on frictionless horizontal rails joined by a ' + $(gu(Rr, 'Ω')) + ' resistor, in a vertical ' + $(gu(B, 'T')) + ' field.';
    var tau = m * Rr / sq(B * L);
    if (k === 'force') { var F = sq(B * L) * v0 / Rr;
      return P(rails + ' What magnetic force acts on the rod when it moves at ' + $(gu(v0, 'm/s')) + '?', num(F, 'N'), ['Motional emf $\\varepsilon = BLv$ drives $I = \\dfrac{BLv}{R}$ around the circuit.', 'The field pushes on that current in the rod: $F = ILB = \\dfrac{B^2L^2v}{R}$, opposite the motion (Lenz).', $('F = \\dfrac{(' + gv(B) + ')^2(' + gv(L) + ')^2(' + gv(v0) + ')}{' + gv(Rr) + '} = ' + nu(F, 'N'))],
      'ε = BLv, I = ε/R, F = ILB.', { kind: k, B: B, L: L, R: Rr, v: v0 }); }
    if (k === 'tau') return P(rails + ' The rod has mass ' + $(gu(m * 1000, 'g')) + ' and is given a push. Its speed then dies away exponentially. Find the time constant.', num(tau, 's'),
      ['Newton: $m\\dfrac{dv}{dt} = -\\dfrac{B^2L^2}{R}v$, the same form as linear drag.', 'So $v = v_0e^{-t/\\tau}$ with $\\tau = \\dfrac{mR}{B^2L^2}$.', $('\\tau = \\dfrac{(' + gv(m) + ')(' + gv(Rr) + ')}{(' + gv(B) + ')^2(' + gv(L) + ')^2} = ' + nu(tau, 's'))], 'Write Newton\'s second law with F = B²L²v/R.', { kind: k, B: B, L: L, R: Rr, m: m });
    if (k === 'vt') { var tt = Number((tau * R.pick([0.5, 1, 2])).toPrecision(2)), vv = v0 * M.exp(-tt / tau);
      return P(rails + ' The rod (mass ' + $(gu(m * 1000, 'g')) + ') is moving at ' + $(gu(v0, 'm/s')) + ' at $t = 0$, with nothing pushing it. How fast is it moving at $t = ' + gu(tt, 's') + '$?', num(vv, 'm/s'),
        ['$m\\dfrac{dv}{dt} = -\\dfrac{B^2L^2}{R}v$ gives $v = v_0e^{-t/\\tau}$, $\\tau = \\dfrac{mR}{B^2L^2} = ' + nu(tau, 's') + '$.', $('v = ' + gv(v0) + 'e^{-' + gv(tt) + '/' + sf(tau) + '} = ' + nu(vv, 'm/s'))], 'Find τ = mR/(B²L²), then v = v₀e^(−t/τ).', { kind: k, B: B, L: L, R: Rr, m: m, v0: v0, t: tt }); }
    if (k === 'dist') { var dist = v0 * tau;
      return P(rails + ' The rod (mass ' + $(gu(m * 1000, 'g')) + ') is launched at ' + $(gu(v0, 'm/s')) + ' and left to coast. How far does it travel before stopping?', num(dist, 'm'),
        ['$v = v_0e^{-t/\\tau}$ with $\\tau = \\dfrac{mR}{B^2L^2} = ' + nu(tau, 's') + '$.', '$$x = \\int_0^\\infty v_0e^{-t/\\tau}\\,dt = v_0\\tau$$', $('x = (' + gv(v0) + ')(' + sf(tau) + ') = ' + nu(dist, 'm')) + '. It never quite stops, but it covers only this finite distance.'],
        'Integrate v(t) from 0 to infinity.', { kind: k, B: B, L: L, R: Rr, m: m, v0: v0 }); }
    var vt = m * 9.8 * Rr / sq(B * L);
    if (k === 'term') return P('A metal rod of mass ' + $(gu(m * 1000, 'g')) + ' and length ' + $(gu(L, 'm')) + ' slides down frictionless vertical rails joined at the top by a ' + $(gu(Rr, 'Ω')) + ' resistor. A horizontal ' + $(gu(B, 'T')) + ' field is perpendicular to the rails. What terminal speed does the rod reach?', num(vt, 'm/s'),
      ['Falling at speed $v$, the rod feels an upward magnetic force $\\dfrac{B^2L^2v}{R}$ that grows with speed, like air drag.', 'Terminal speed: that force balances the weight, $\\dfrac{B^2L^2v_T}{R} = mg$, so $v_T = \\dfrac{mgR}{B^2L^2}$.', $('v_T = \\dfrac{(' + gv(m) + ')(9.8)(' + gv(Rr) + ')}{(' + gv(B) + ')^2(' + gv(L) + ')^2} = ' + nu(vt, 'm/s'))],
      'Set the magnetic force B²L²v/R equal to mg.', { kind: k, B: B, L: L, R: Rr, m: m });
    if (k === 'power') return P('A rod of mass ' + $(gu(m * 1000, 'g')) + ' and length ' + $(gu(L, 'm')) + ' falls at its terminal speed down frictionless vertical rails joined by a ' + $(gu(Rr, 'Ω')) + ' resistor, in a perpendicular ' + $(gu(B, 'T')) + ' field. At what rate is heat produced in the resistor?', num(m * 9.8 * vt, 'W'),
      ['Terminal speed: $v_T = \\dfrac{mgR}{B^2L^2} = ' + nu(vt, 'm/s') + '$.', 'At terminal speed the kinetic energy is steady, so all the gravitational energy lost each second becomes heat: $P = mgv_T$.', $('P = (' + gv(m) + ')(9.8)(' + sf(vt) + ') = ' + nu(m * 9.8 * vt, 'W')) + '. Check: $I^2R$ with $I = BLv_T/R$ gives the same.'],
      'At terminal speed, gravity\'s power all goes into the resistor.', { kind: k, B: B, L: L, R: Rr, m: m });
    return P('A metal rod slides along rails in a magnetic field, so a current is induced around the circuit. What does the magnetic force on that induced current do to the rod?', mcq('It opposes the motion, slowing the rod', ['It pushes the rod along, speeding it up', 'Nothing, because induced currents feel no magnetic force', 'It pushes the rod sideways, off the rails']),
      ['Lenz\'s law: the induced current flows so as to oppose the change that caused it, here the growing (or shrinking) flux as the rod moves.', 'The force $I\\vec{L}\\times\\vec{B}$ on that current points against the rod\'s velocity.', 'If it pushed the rod along, the rod would speed up, inducing more current and more push: energy from nothing. Opposing the motion is what turns the rod\'s kinetic energy into heat.'],
      'Think about energy: could the force speed the rod up?', { kind: 'mc' });
  });

  G('em.inductance', function (R, ctx) {
    var k = kind(R, ctx, ['emf', 'sol', 'mc'], ['sol', 'Iexpr', 'flux', 'scale'], ['tor', 'Iexpr', 'sol']);
    if (k === 'emf') { var Lh = R.pick([0.05, 0.1, 0.2, 0.5, 2]), dI = R.pick([2, 5, 10, 20, 50]), e = Lh * dI;
      return P('The current in a ' + $(LH(Lh)) + ' inductor is increasing at ' + $(gu(dI, 'A/s')) + '. How big is the emf across it?', num(e, 'V'), ['$|\\varepsilon| = L\\dfrac{dI}{dt}$.', $('|\\varepsilon| = (' + gv(Lh) + ')(' + gv(dI) + ') = ' + nu(e, 'V')) + ', pointing to oppose the increase.'], 'ε = L dI/dt.', { kind: k, L: Lh, dI: dI }); }
    var N = R.pick([200, 300, 500, 1000]), ln = R.pick([0.1, 0.2, 0.25, 0.5]), rr = R.pick([1, 1.5, 2, 3]), A = PI * sq(rr / 100), L = MU0 * N * N * A / ln;
    if (k === 'sol') return P('A long solenoid ' + $(gu(ln * 100, 'cm')) + ' long has ' + N + ' turns and a radius of ' + $(gu(rr, 'cm')) + '. Find its self-inductance in mH.', num(L * 1000, 'mH'),
      ['With current $I$: $B = \\mu_0\\dfrac{N}{\\ell}I$, and each turn holds flux $BA$. The total flux linkage is $N\\Phi = \\mu_0\\dfrac{N^2A}{\\ell}I$.', '$L = \\dfrac{N\\Phi}{I} = \\dfrac{\\mu_0 N^2A}{\\ell}$.', $('L = \\dfrac{' + tMU + '(' + N + ')^2\\pi(' + gv(rr / 100) + ')^2}{' + gv(ln) + '} = ' + nu(L, 'H') + ' = ' + nu(L * 1000, 'mH'))],
      'L = NΦ/I = μ₀N²A/ℓ.', { kind: k, N: N, l: ln, r: rr });
    if (k === 'flux') { var I = R.pick([0.5, 1, 2, 4]), Phi = R.pick([2, 5, 10, 20]) * 1e-6, L2 = N * Phi / I;
      return P('A coil of ' + N + ' turns carries ' + $(gu(I, 'A')) + ', and its own field puts ' + $(gu(Phi * 1e6, 'μWb')) + ' of flux through each turn. Find its inductance in mH.', num(L2 * 1000, 'mH'), ['$L = \\dfrac{N\\Phi}{I}$: flux linkage per amp.', $('L = \\dfrac{(' + N + ')(' + gv(Phi) + ')}{' + gv(I) + '} = ' + nu(L2 * 1000, 'mH'))], 'L = NΦ/I.', { kind: k, N: N, I: I, Phi: Phi }); }
    if (k === 'scale') { var f = R.pick([2, 3]), g = R.pick([1, 2]), ratio = f * f / g;
      return P('A long solenoid is rewound with ' + f + ' times as many turns over ' + (g === 1 ? 'the same length' : 'twice the length') + ', with the same radius. By what factor does its inductance change?', { t: 'num', v: pl(ratio), rtol: 0.01 },
        ['$L = \\dfrac{\\mu_0N^2A}{\\ell}$: more turns give a stronger field <i>and</i> more turns for that field to thread, so $L \\propto N^2$.', 'Factor: $\\dfrac{' + f + '^2}{' + g + '} = ' + sf(ratio) + '$.'], 'L goes as N²/ℓ.', { kind: k, f: f, g: g }); }
    if (k === 'Iexpr') { var Lh2 = R.pick([0.02, 0.05, 0.1, 0.25]), I0 = R.pick([1, 2, 3]), f2 = R.pick([50, 60]), w = 2 * PI * f2, t3 = R.pick([1, 2, 4]) * 1e-3, e2 = Lh2 * I0 * w * M.abs(M.cos(w * t3));
      return P('The current in a ' + $(gu(Lh2 * 1000, 'mH')) + ' inductor is $I = ' + gv(I0) + '\\sin(\\omega t)$ amperes with $f = ' + gu(f2, 'Hz') + '$. Find the size of the emf across it at $t = ' + gu(t3 * 1000, 'ms') + '$.', num(e2, 'V'),
        ['$|\\varepsilon| = L\\left|\\dfrac{dI}{dt}\\right| = LI_0\\omega|\\cos\\omega t|$, with $\\omega = 2\\pi f = ' + sf(w) + '\\ \\text{rad/s}$.', $('|\\varepsilon| = (' + gv(Lh2) + ')(' + gv(I0) + ')(' + sf(w) + ')|\\cos(' + sf(w * t3) + ')| = ' + nu(e2, 'V'))], 'Differentiate the current; the angle is in radians.', { kind: k, L: Lh2, I0: I0, f: f2, t: t3 }); }
    if (k === 'tor') { var Nt = R.pick([500, 1000, 2000]), h = R.pick([1, 2, 3]) / 100, a = R.pick([4, 5]) / 100, b = a + R.pick([1, 2, 4]) / 100, Lt = MU0 * Nt * Nt * h * M.log(b / a) / (2 * PI);
      return P('A toroid of ' + Nt + ' turns has a rectangular cross section: height ' + $(gu(h * 100, 'cm')) + ', from inner radius ' + $(gu(a * 100, 'cm')) + ' to outer radius ' + $(gu(+(b * 100).toPrecision(3), 'cm')) + '. Find its inductance in mH.', num(Lt * 1000, 'mH'),
        ['Inside, $B = \\dfrac{\\mu_0NI}{2\\pi r}$. Flux through one turn, by strips of area $h\\,dr$: $\\Phi = \\dfrac{\\mu_0NIh}{2\\pi}\\ln\\dfrac{b}{a}$.', '$L = \\dfrac{N\\Phi}{I} = \\dfrac{\\mu_0N^2h}{2\\pi}\\ln\\dfrac{b}{a}$.', $('L = (2 \\times 10^{-7})(' + Nt + ')^2(' + gv(h) + ')\\ln ' + gv(+(b / a).toPrecision(4)) + ' = ' + nu(Lt * 1000, 'mH'))],
        'Integrate the toroid\'s field over the rectangular cross section, then L = NΦ/I.', { kind: k, N: Nt, h: h, a: a, b: b }); }
    return P('A steady current of 2 A flows through an inductor. What does the inductor do to it?', mcq('Nothing beyond its wire\'s resistance; an inductor only opposes <i>changes</i> in current', ['It pushes back with an emf of L × (2 A)', 'It gradually stops the current', 'It reverses the current every half second']),
      ['$\\varepsilon = -L\\,dI/dt$: the emf depends on how fast the current changes, not on the current itself.', 'A steady current has $dI/dt = 0$, so there is no back emf; the inductor acts like a plain piece of wire.', 'Only when the current rises or falls does the inductor push back.'],
      'Look at what the emf formula depends on.', { kind: 'mc' });
  });

  G('em.mutual-inductance', function (R, ctx) {
    var k = kind(R, ctx, ['Vs', 'emf', 'mc'], ['M', 'Is', 'ratio', 'Vs'], ['M', 'power', 'Is']);
    if (k === 'Vs' || k === 'ratio' || k === 'Is' || k === 'power') {
      var Np = R.pick([100, 200, 400, 500, 1000]), Ns = R.pick([20, 50, 100, 2000, 4000, 5000]), Vp = R.pick([120, 240, 2400]);
      if (k === 'Vs') return P('An ideal transformer has ' + Np + ' turns on its primary and ' + Ns + ' on its secondary. The primary is connected to ' + $(gu(Vp, 'V')) + ' AC. What is the secondary voltage?', num(Vp * Ns / Np, 'V'),
        ['The same changing flux threads every turn of both coils (the iron core guides it), so each turn gets the same emf: $\\dfrac{V_s}{N_s} = \\dfrac{V_p}{N_p}$.', $('V_s = V_p\\dfrac{N_s}{N_p} = ' + gv(Vp) + '\\cdot\\dfrac{' + Ns + '}{' + Np + '} = ' + nu(Vp * Ns / Np, 'V'))], 'Voltage per turn is the same in both coils.', { kind: k, Np: Np, Ns: Ns, Vp: Vp });
      if (k === 'ratio') { var pr = R.pick([[120, 12], [120, 6], [240, 12], [240, 24], [2400, 240], [120, 24], [12, 120]]), Nsr = R.pick([20, 25, 50, 100, 200]), Npr = Nsr * pr[0] / pr[1];
        return P('You need ' + $(gu(pr[1], 'V')) + ' AC from a ' + $(gu(pr[0], 'V')) + ' supply. If the primary has ' + Npr + ' turns, how many turns does the secondary need?', { a: { t: 'num', v: String(Nsr) }, unit: 'turns' },
        ['$\\dfrac{N_s}{N_p} = \\dfrac{V_s}{V_p}$.', $('N_s = ' + Npr + '\\cdot\\dfrac{' + gv(pr[1]) + '}{' + gv(pr[0]) + '} = ' + Nsr) + ' turns.'], 'Turns ratio equals voltage ratio.', { kind: k, Np: Npr, Vp: pr[0], Vs: pr[1] }); }
      var Pw = R.pick([60, 100, 500, 1200]), Vs = Vp * Ns / Np;
      if (k === 'Is') return P('An ideal transformer with ' + Np + ' primary turns and ' + Ns + ' secondary turns runs from ' + $(gu(Vp, 'V')) + ' and delivers ' + $(gu(Pw, 'W')) + ' to a load. Find the current in the secondary.', num(Pw / Vs, 'A'),
        ['$V_s = V_p\\dfrac{N_s}{N_p} = ' + nu(Vs, 'V') + '$.', 'An ideal transformer keeps the power: $I_s = \\dfrac{P}{V_s} = \\dfrac{' + gv(Pw) + '}{' + sf(Vs) + '} = ' + nu(Pw / Vs, 'A') + '$.'], 'Find V_s, then I_s = P/V_s.', { kind: k, Np: Np, Ns: Ns, Vp: Vp, P: Pw });
      return P('An ideal transformer with ' + Np + ' primary turns and ' + Ns + ' secondary turns runs from ' + $(gu(Vp, 'V')) + ' and delivers ' + $(gu(Pw, 'W')) + ' to a load. Find the current drawn by the primary.', num(Pw / Vp, 'A'),
        ['An ideal transformer loses no energy: power in = power out.', $('I_p = \\dfrac{P}{V_p} = \\dfrac{' + gv(Pw) + '}{' + gv(Vp) + '} = ' + nu(Pw / Vp, 'A')), 'Raising the voltage lowers the current in the same ratio; the power is the same on both sides.'], 'Power in equals power out.', { kind: k, Vp: Vp, P: Pw, Np: Np, Ns: Ns });
    }
    var N1 = R.pick([500, 1000, 2000]), N2 = R.pick([50, 100, 200]), ln = R.pick([0.2, 0.25, 0.5]), r1 = R.pick([1, 1.5, 2]) / 100, A = PI * r1 * r1, Mm = MU0 * N1 * N2 * A / ln;
    if (k === 'M') return P('A long solenoid of ' + N1 + ' turns over ' + $(gu(ln * 100, 'cm')) + ' with radius ' + $(gu(r1 * 100, 'cm')) + ' has a short coil of ' + N2 + ' turns wound tightly around its middle. Find their mutual inductance, in mH.', num(Mm * 1000, 'mH'),
      ['A current $I_1$ in the solenoid makes $B = \\mu_0\\dfrac{N_1}{\\ell}I_1$ inside, and the flux through each turn of the outer coil is $BA$ (the field outside the solenoid is negligible).', '$M = \\dfrac{N_2\\Phi}{I_1} = \\dfrac{\\mu_0N_1N_2A}{\\ell}$.', $('M = \\dfrac{' + tMU + '(' + N1 + ')(' + N2 + ')\\pi(' + gv(r1) + ')^2}{' + gv(ln) + '} = ' + nu(Mm * 1000, 'mH'))],
      'M = N₂Φ₂₁/I₁.', { kind: k, N1: N1, N2: N2, l: ln, r: r1 });
    if (k === 'emf') { var Mh = R.pick([1, 2, 5, 10, 20]) * 1e-3, dI = R.pick([10, 20, 50, 100, 200]), e = Mh * dI;
      return P('Two coils have a mutual inductance of ' + $(gu(Mh * 1000, 'mH')) + '. The current in the first rises at ' + $(gu(dI, 'A/s')) + '. What emf appears in the second?', num(e, 'V'), ['$|\\varepsilon_2| = M\\dfrac{dI_1}{dt}$.', $('|\\varepsilon_2| = (' + gv(Mh) + ')(' + gv(dI) + ') = ' + nu(e, 'V'))], 'ε₂ = M dI₁/dt.', { kind: k, M: Mh, dI: dI }); }
    return P('A transformer steps 120 V up to 2400 V. Compared with the power going into the primary, the power coming out of the secondary of an ideal transformer is…', mcq('the same', ['20 times larger', '20 times smaller', '400 times larger']),
      ['A transformer is not a source of energy; an ideal one loses none either. So $P_{\\text{out}} = P_{\\text{in}}$.', 'The voltage goes up 20 times, so the current goes <i>down</i> 20 times: $I_sV_s = I_pV_p$.', 'That trade is why power lines carry high voltage: the same power at a small current wastes far less as $I^2R$ heat in the wires.'],
      'Could a transformer create energy?', { kind: 'mc' });
  });

  G('em.rl-circuits', function (R, ctx) {
    var k = kind(R, ctx, ['tau', 'If', 'mc'], ['It', 'VL', 'dIdt0', 'tfrac'], ['decay', 'tfrac', 'It']);
    var e = R.pick([6, 9, 12, 24]), Rr = R.pick([2, 4, 5, 10, 20]), Lh = R.pick([0.1, 0.2, 0.5, 1, 2]), tau = Lh / Rr;
    var setup = 'A ' + $(LH(Lh)) + ' inductor and a ' + $(gu(Rr, 'Ω')) + ' resistor are connected in series to a ' + $(gu(e, 'V')) + ' battery by a switch closed at $t = 0$. ';
    var de = ['Loop rule: $\\varepsilon - IR - L\\dfrac{dI}{dt} = 0$. Separating and integrating from $I = 0$ gives $I = \\dfrac{\\varepsilon}{R}\\left(1 - e^{-t/\\tau}\\right)$ with $\\tau = L/R$.', '$\\tau = ' + gv(Lh) + '/' + gv(Rr) + ' = ' + nu(tau, 's') + '$ and $\\varepsilon/R = ' + nu(e / Rr, 'A') + '$.'];
    if (k === 'mc') return P('A switch connects a battery, a resistor and an inductor in series. What is the current the instant the switch closes?', mcq('Zero; it then rises smoothly toward $\\varepsilon/R$', ['$\\varepsilon/R$ right away, since the inductor is just a coil of wire', '$\\varepsilon/(2R)$, half the final value', 'Very large for an instant, then it settles to $\\varepsilon/R$']),
      ['A sudden jump in current would need $dI/dt$ to be infinite, and the inductor\'s back emf $L\\,dI/dt$ would be infinite too. Instead the inductor takes the whole battery voltage at first, $L\\,dI/dt = \\varepsilon$, while $I = 0$.', 'As the current grows, more of the voltage goes to the resistor and the rise slows: $I = \\dfrac{\\varepsilon}{R}\\left(1 - e^{-Rt/L}\\right)$.'],
      'Can the current through an inductor jump?', { kind: 'mc' });
    if (k === 'tau') return P(setup + 'What is the time constant, in ms?', num(tau * 1000, 'ms'), ['$\\tau = \\dfrac{L}{R} = \\dfrac{' + gv(Lh) + '}{' + gv(Rr) + '} = ' + nu(tau, 's') + ' = ' + nu(tau * 1000, 'ms') + '$.'], 'τ = L/R.', { kind: k, L: Lh, R: Rr });
    if (k === 'If') return P(setup + 'What current flows a long time later?', num(e / Rr, 'A'), ['Once the current is steady, $dI/dt = 0$ and the inductor has no emf: it acts like a plain wire.', $('I = \\varepsilon/R = ' + gv(e) + '/' + gv(Rr) + ' = ' + nu(e / Rr, 'A'))], 'In the steady state the inductor is just a wire.', { kind: k, e: e, R: Rr, L: Lh });
    var tt = Number((tau * by(ctx, 1, R.pick([0.5, 1, 2]), R.pick([0.5, 1.5, 3]))).toPrecision(2)), x = tt / tau;
    if (k === 'It') return P(setup + 'What is the current at $t = ' + gu(tt * 1000, 'ms') + '$?', num(e / Rr * (1 - M.exp(-x)), 'A'), de.concat([$('I = ' + sf(e / Rr) + '\\left(1 - e^{-' + gv(tt) + '/' + sf(tau) + '}\\right) = ' + nu(e / Rr * (1 - M.exp(-x)), 'A'))]), 'I = (ε/R)(1 − e^(−t/τ)), τ = L/R.', { kind: k, e: e, R: Rr, L: Lh, t: tt });
    if (k === 'VL') return P(setup + 'What is the voltage across the inductor at $t = ' + gu(tt * 1000, 'ms') + '$?', num(e * M.exp(-x), 'V'), de.concat(['$V_L = L\\dfrac{dI}{dt} = \\varepsilon e^{-t/\\tau}$ (it takes the whole battery voltage at first, then fades).', $('V_L = ' + gv(e) + 'e^{-' + gv(tt) + '/' + sf(tau) + '} = ' + nu(e * M.exp(-x), 'V'))]), 'V_L = εe^(−t/τ).', { kind: k, e: e, R: Rr, L: Lh, t: tt });
    if (k === 'dIdt0') return P(setup + 'How fast is the current rising the instant the switch closes?', num(e / Lh, 'A/s'), ['At $t = 0$, $I = 0$, so there is no voltage across the resistor; the whole battery voltage appears across the inductor: $L\\dfrac{dI}{dt} = \\varepsilon$.', $('\\dfrac{dI}{dt} = \\dfrac{\\varepsilon}{L} = \\dfrac{' + gv(e) + '}{' + gv(Lh) + '} = ' + nu(e / Lh, 'A/s'))], 'At t = 0, I = 0, so ε = L dI/dt.', { kind: k, e: e, L: Lh, R: Rr });
    if (k === 'tfrac') { var f = R.pick([0.5, 0.75, 0.9, 0.95, 0.99]), tf = -tau * M.log(1 - f);
      return P(setup + 'How long, in ms, until the current reaches ' + (f * 100) + '% of its final value?', num(tf * 1000, 'ms'), de.concat(['$1 - e^{-t/\\tau} = ' + f + '$ gives $t = -\\tau\\ln(' + gv(+(1 - f).toFixed(2)) + ')$.', $('t = -(' + sf(tau) + ')\\ln(' + gv(+(1 - f).toFixed(2)) + ') = ' + nu(tf * 1000, 'ms'))]), 'Solve 1 − e^(−t/τ) = fraction for t.', { kind: k, L: Lh, R: Rr, f: f }); }
    var R2 = R.pick([5, 10, 20, 50]), I0 = e / Rr, tau2 = Lh / (Rr + R2), td = Number((tau2 * R.pick([0.5, 1, 2])).toPrecision(2)), Id = I0 * M.exp(-td / tau2);
    return P('A steady ' + $(gu(I0, 'A')) + ' flows through a ' + $(LH(Lh)) + ' inductor in series with a ' + $(gu(Rr, 'Ω')) + ' resistor. At $t = 0$ the battery is removed and the loop is closed through an extra ' + $(gu(R2, 'Ω')) + ' resistor, so the current flows through both resistors. What is the current at $t = ' + gu(td * 1000, 'ms') + '$?', num(Id, 'A'),
      ['The inductor keeps the current from jumping: it starts at $I_0 = ' + gv(I0) + '\\ \\text{A}$ and dies away through the total resistance $' + Rr + ' + ' + R2 + ' = ' + (Rr + R2) + '\\ \\Omega$.', 'Loop rule without the battery: $L\\dfrac{dI}{dt} = -IR_{\\text{tot}}$, so $I = I_0e^{-t/\\tau}$ with $\\tau = \\dfrac{L}{R_{\\text{tot}}} = ' + nu(tau2, 's') + '$.', $('I = ' + gv(I0) + 'e^{-' + gv(td) + '/' + sf(tau2) + '} = ' + nu(Id, 'A'))],
      'The decay uses the total resistance in the loop the current now flows through.', { kind: 'decay', I0: I0, L: Lh, Rt: Rr + R2, t: td });
  });

  G('em.magnetic-energy', function (R, ctx) {
    var k = kind(R, ctx, ['U', 'u', 'mc'], ['sol', 'I', 'u', 'U'], ['rl', 'sol', 'compare']);
    if (k === 'U' || k === 'I') { var Lh = R.pick([0.01, 0.05, 0.1, 0.5, 2]), I = R.pick([0.5, 1, 2, 3, 5]), U = 0.5 * Lh * I * I;
      if (k === 'U') return P('How much energy is stored in a ' + $(LH(Lh)) + ' inductor carrying ' + $(gu(I, 'A')) + '?', num(U, 'J'), ['$U = \\tfrac{1}{2}LI^2$: the work done against the back emf while the current was built up.', $('U = \\tfrac{1}{2}(' + gv(Lh) + ')(' + gv(I) + ')^2 = ' + nu(U, 'J'))], 'U = ½LI².', { kind: k, L: Lh, I: I });
      var Ut = R.pick([0.1, 0.5, 1, 5, 10]), In = M.sqrt(2 * Ut / Lh); return P('What current must flow in a ' + $(LH(Lh)) + ' inductor for it to store ' + $(gu(Ut, 'J')) + '?', num(In, 'A'), ['$U = \\tfrac{1}{2}LI^2$, so $I = \\sqrt{2U/L}$.', $('I = \\sqrt{\\dfrac{2(' + gv(Ut) + ')}{' + gv(Lh) + '}} = ' + nu(In, 'A'))], 'Solve U = ½LI² for I.', { kind: k, L: Lh, U: Ut }); }
    if (k === 'u') { var B = R.pick([0.01, 0.1, 0.5, 1, 1.5, 2]), u = B * B / (2 * MU0);
      return P('What is the energy density of a ' + $(gu(B, 'T')) + ' magnetic field?', num(u, 'J/m³'), ['$u_B = \\dfrac{B^2}{2\\mu_0}$.', $('u_B = \\dfrac{(' + gv(B) + ')^2}{2' + tMU + '} = ' + nu(u, 'J/m³'))], 'u = B²/(2μ₀).', { kind: k, B: B }); }
    if (k === 'sol') { var N = R.pick([500, 1000]), ln = R.pick([0.2, 0.5]), rr = R.pick([1, 2]) / 100, I2 = R.pick([1, 2, 5]), n = N / ln, B2 = MU0 * n * I2, vol = PI * rr * rr * ln, U2 = B2 * B2 / (2 * MU0) * vol;
      return P('A solenoid ' + $(gu(ln * 100, 'cm')) + ' long with ' + N + ' turns and radius ' + $(gu(rr * 100, 'cm')) + ' carries ' + $(gu(I2, 'A')) + '. Find the energy stored in its field, in mJ, from the energy density times the volume.', num(U2 * 1000, 'mJ'),
        ['$B = \\mu_0 nI = ' + tMU + '(' + sf(n) + ')(' + gv(I2) + ') = ' + nu(B2, 'T') + '$, so $u = B^2/(2\\mu_0) = ' + nu(B2 * B2 / (2 * MU0), 'J/m³') + '$.', 'Volume inside: $\\pi r^2\\ell = ' + nu(vol, 'm³') + '$.', $('U = u\\,V = ' + nu(U2 * 1000, 'mJ')), 'Check: $\\tfrac{1}{2}LI^2$ with $L = \\mu_0N^2A/\\ell$ gives the same.'],
        'Find B, then u = B²/(2μ₀), times the volume.', { kind: k, N: N, l: ln, r: rr, I: I2 }); }
    if (k === 'rl') { var e = R.pick([6, 12, 24]), Rr = R.pick([2, 4, 6]), Lh2 = R.pick([0.5, 1, 2]), If = e / Rr, Ut2 = 0.5 * Lh2 * sq(If * (1 - M.exp(-1)));
      return P('A ' + $(gu(Lh2, 'H')) + ' inductor in series with ' + $(gu(Rr, 'Ω')) + ' is connected to ' + $(gu(e, 'V')) + ' at $t = 0$. How much energy is stored in the inductor after one time constant?', num(Ut2, 'J'),
        ['After one time constant $I = \\dfrac{\\varepsilon}{R}(1 - e^{-1}) = ' + sf(If) + '(0.632) = ' + nu(If * (1 - M.exp(-1)), 'A') + '$.', $('U = \\tfrac{1}{2}LI^2 = \\tfrac{1}{2}(' + gv(Lh2) + ')(' + sf(If * (1 - M.exp(-1))) + ')^2 = ' + nu(Ut2, 'J'))], 'Find I at t = τ first.', { kind: k, e: e, R: Rr, L: Lh2 }); }
    if (k === 'compare') { var E = R.pick([1e5, 3e5, 1e6, 3e6]), Bc = E / CL, ratio = (Bc * Bc / (2 * MU0)) / (0.5 * EPS0 * E * E);
      return P('In a light wave, $B = E/c$. Compare the magnetic energy density with the electric energy density at a point where $E = ' + gu(E, 'V/m') + '$: what is $u_B/u_E$?', { t: 'num', v: '1', rtol: 0.02 },
        ['$u_E = \\tfrac{1}{2}\\varepsilon_0E^2 = ' + nu(0.5 * EPS0 * E * E, 'J/m³') + '$.', '$B = E/c = ' + nu(Bc, 'T') + '$, so $u_B = \\dfrac{B^2}{2\\mu_0} = ' + nu(Bc * Bc / (2 * MU0), 'J/m³') + '$.', 'The ratio is $1$ (with rounded constants, $' + sf(ratio) + '$): since $c^2 = 1/(\\mu_0\\varepsilon_0)$, $\\dfrac{B^2/2\\mu_0}{\\varepsilon_0E^2/2} = \\dfrac{1}{\\mu_0\\varepsilon_0c^2} = 1$. Light carries its energy equally in both fields.'],
        'Compute both densities, or use c² = 1/(μ₀ε₀).', { kind: k, E: E }); }
    return P('An inductor $L$ carries current $I$ while a capacitor $C$ has voltage $V$ across it. Which pair of formulas gives their stored energies?', mcq('$\\tfrac{1}{2}LI^2$ for the inductor and $\\tfrac{1}{2}CV^2$ for the capacitor', ['$\\tfrac{1}{2}LV^2$ for the inductor and $\\tfrac{1}{2}CI^2$ for the capacitor', '$LI$ for the inductor and $CV$ for the capacitor', '$\\tfrac{1}{2}LI$ for the inductor and $\\tfrac{1}{2}CV$ for the capacitor']),
      ['An inductor\'s energy depends on the current in it, which builds its magnetic field: $U_L = \\tfrac{1}{2}LI^2$.', 'A capacitor\'s depends on the voltage across it, set by the charge on its plates: $U_C = \\tfrac{1}{2}CV^2$.', 'Check the units: H·A² = (V·s/A)·A² = V·A·s = J, and F·V² = (C/V)·V² = C·V = J.'],
      'Which quantity builds each device\'s field: current or voltage?', { kind: 'mc' });
  });

  G('em.lc-circuits', function (R, ctx) {
    var k = kind(R, ctx, ['f', 'f', 'mc'], ['Imax', 'T4', 'tune', 'energy'], ['qatI', 'tune', 'Imax']);
    var Lh = R.pick([0.01, 0.02, 0.05, 0.1, 0.2]), Cu = R.pick([1, 2, 5, 10, 20, 50]), C = Cu * 1e-6, w = 1 / M.sqrt(Lh * C), f = w / (2 * PI), V0 = R.pick([5, 10, 12, 20]);
    var setup = 'A ' + $(gu(Cu, 'μF')) + ' capacitor charged to ' + $(gu(V0, 'V')) + ' is connected at $t = 0$ to a ' + $(gu(Lh * 1000, 'mH')) + ' inductor (no resistance). ';
    if (k === 'mc') return P('In an LC circuit oscillating with no resistance, when is the current largest?', mcq('When the capacitor has no charge on it', ['When the capacitor holds its most charge', 'When the capacitor is half charged', 'The current is the same at every moment']),
      ['Energy moves back and forth between the capacitor ($q^2/2C$) and the inductor ($\\tfrac{1}{2}LI^2$), and the total stays the same.', 'The current, and so the inductor\'s energy, is largest when the capacitor\'s energy is zero: when it has no charge.', 'Like a mass on a spring, which moves fastest as it passes the middle, where the spring is relaxed.'],
      'Where is all the energy when the capacitor is empty?', { kind: 'mc' });
    if (k === 'f') return P('An ideal LC circuit has $L = ' + gu(Lh * 1000, 'mH') + '$ and $C = ' + gu(Cu, 'μF') + '$. At what frequency does it oscillate, in Hz?', num(f, 'Hz'),
      ['Loop rule: $L\\dfrac{d^2q}{dt^2} + \\dfrac{q}{C} = 0$, the same form as $m\\ddot{x} + kx = 0$, so $\\omega = \\dfrac{1}{\\sqrt{LC}}$.', $('\\omega = \\dfrac{1}{\\sqrt{(' + gv(Lh) + ')(' + gv(C) + ')}} = ' + nu(w, 'rad/s')), $('f = \\dfrac{\\omega}{2\\pi} = ' + nu(f, 'Hz'))], 'ω = 1/√(LC), then f = ω/2π.', { kind: k, L: Lh, C: Cu });
    var Q0 = C * V0, Im = Q0 * w;
    if (k === 'Imax') return P(setup + 'What is the largest current in the circuit, in mA?', num(Im * 1000, 'mA'),
      ['$q = Q_0\\cos\\omega t$ and $I = -dq/dt = Q_0\\omega\\sin\\omega t$, so $I_{\\max} = Q_0\\omega$.', '$Q_0 = CV_0 = ' + nu(Q0 * 1e6, 'μC') + '$ and $\\omega = 1/\\sqrt{LC} = ' + nu(w, 'rad/s') + '$.', $('I_{\\max} = (' + sf(Q0) + ')(' + sf(w) + ') = ' + nu(Im * 1000, 'mA')) + '. Check with energy: $\\tfrac{1}{2}LI_{\\max}^2 = \\tfrac{1}{2}CV_0^2$.'],
      'I_max = Q₀ω, or use ½LI² = ½CV².', { kind: k, L: Lh, C: Cu, V0: V0 });
    if (k === 'T4') { var T = 2 * PI * M.sqrt(Lh * C);
      return P(setup + 'How long, in ms, until the capacitor first has no charge on it?', num(T / 4 * 1000, 'ms'), ['$q = Q_0\\cos\\omega t$ first reaches zero at $\\omega t = \\pi/2$: a quarter period.', $('T = 2\\pi\\sqrt{LC} = ' + nu(T * 1000, 'ms') + ', so t = T/4 = ' + nu(T / 4 * 1000, 'ms')), 'At that moment all the energy is in the inductor and the current is largest.'], 'A quarter of the period T = 2π√(LC).', { kind: k, L: Lh, C: Cu }); }
    if (k === 'tune') { var ft = R.pick([0.5, 1, 1.5, 2]) * 1e6, Cp = R.pick([100, 200, 300, 500]) * 1e-12, Ln = 1 / (sq(2 * PI * ft) * Cp);
      return P('A radio tuner uses an LC circuit with a ' + $(gu(Cp * 1e12, 'pF')) + ' capacitor. What inductance, in μH, tunes it to ' + $(gu(ft / 1e6, 'MHz')) + '?', num(Ln * 1e6, 'μH'),
        ['$f = \\dfrac{1}{2\\pi\\sqrt{LC}}$, so $L = \\dfrac{1}{(2\\pi f)^2C}$.', $('L = \\dfrac{1}{(2\\pi \\cdot ' + gv(ft) + ')^2(' + gv(Cp) + ')} = ' + nu(Ln, 'H') + ' = ' + nu(Ln * 1e6, 'μH'))], 'Solve f = 1/(2π√(LC)) for L.', { kind: k, f: ft, C: Cp }); }
    if (k === 'energy') { var U = 0.5 * C * V0 * V0;
      return P(setup + 'How much energy is stored in the inductor at the moment the current is largest, in μJ?', num(U * 1e6, 'μJ'), ['With no resistance the total energy stays $\\tfrac{1}{2}CV_0^2$.', 'The current is largest when the capacitor is empty, so then all the energy is in the inductor.', $('U = \\tfrac{1}{2}(' + gv(C) + ')(' + gv(V0) + ')^2 = ' + nu(U * 1e6, 'μJ'))], 'Where is all the energy when the current peaks?', { kind: k, C: Cu, V0: V0, L: Lh }); }
    var frac = R.pick([0.5, 0.6, 0.8]), qq = Q0 * M.sqrt(1 - frac * frac);
    return P(setup + 'At the moment the current is ' + (frac * 100) + '% of its maximum, how much charge (in μC) is on the capacitor?', num(qq * 1e6, 'μC'),
      ['Energy is shared: $\\dfrac{q^2}{2C} + \\tfrac{1}{2}LI^2 = \\dfrac{Q_0^2}{2C}$, and $\\tfrac{1}{2}LI_{\\max}^2 = \\dfrac{Q_0^2}{2C}$.', 'So $q^2 = Q_0^2\\left(1 - \\dfrac{I^2}{I_{\\max}^2}\\right) = Q_0^2(1 - ' + gv(frac) + '^2)$.', $('q = Q_0\\sqrt{1 - ' + gv(frac * frac) + '} = (' + sf(Q0 * 1e6) + ')(' + sf(M.sqrt(1 - frac * frac)) + ') = ' + nu(qq * 1e6, 'μC'))],
      'Total energy stays the same: q²/2C + ½LI² = Q₀²/2C.', { kind: 'qatI', L: Lh, C: Cu, V0: V0, frac: frac });
  });

  G('em.rlc-circuits', function (R, ctx) {
    var k = kind(R, ctx, ['class', 'class', 'mc'], ['shift', 'half', 'crit'], ['energy', 'shift', 'half', 'crit']);
    var Lh = R.pick([0.05, 0.1, 0.2, 0.5]), Cu = R.pick([1, 2, 5, 10]), C = Cu * 1e-6, w0 = 1 / M.sqrt(Lh * C), Rc = 2 * M.sqrt(Lh / C);
    if (k === 'mc') return P('A small resistance is added to an LC circuit, so that it is lightly damped. What mainly changes?', mcq('The amplitude shrinks a little each cycle; the frequency hardly changes', ['The frequency drops a lot, but the amplitude stays the same', 'The oscillation stops at once', 'The frequency rises, because the resistor speeds things up']),
      ['With resistance, $\\omega\' = \\sqrt{\\dfrac{1}{LC} - \\left(\\dfrac{R}{2L}\\right)^2}$. For small $R$ the second term is tiny compared with the first, so $\\omega\'$ is almost $\\omega_0$.', 'Meanwhile the amplitude falls as $e^{-Rt/2L}$ every cycle, as the resistor turns energy into heat: the effect you notice is the dying away, not a change of pitch.', 'A lightly damped spring behaves the same way.'],
      'Compare (R/2L)² with 1/(LC) for a small R.', { kind: 'mc' });
    if (k === 'class') { var mult = R.pick([0.1, 0.5, 2, 5]), Rr = Number((Rc * mult).toPrecision(2)), under = Rr < Rc;
      return P('A series circuit has $L = ' + gu(Lh * 1000, 'mH') + '$, $C = ' + gu(Cu, 'μF') + '$ and $R = ' + gu(Rr, 'Ω') + '$. A charged capacitor is connected and left alone. How does the charge behave?', mcq(under ? 'It oscillates, with an amplitude that dies away (underdamped)' : 'It dies away without oscillating (overdamped)', [under ? 'It dies away without oscillating (overdamped)' : 'It oscillates, with an amplitude that dies away (underdamped)', 'It oscillates forever with a constant amplitude', 'It grows without limit']),
        ['Compare $R$ with the critical value $2\\sqrt{L/C} = 2\\sqrt{' + gv(Lh) + '/' + gv(C) + '} = ' + nu(Rc, 'Ω') + '$.', under ? '$R$ is smaller, so the circuit is underdamped: it rings like a lightly damped spring, with the amplitude falling as $e^{-Rt/2L}$.' : '$R$ is larger, so the circuit is overdamped: the charge drains away without swinging back.'],
        'Compare R with 2√(L/C).', { kind: k, L: Lh, C: Cu, R: Rr }); }
    var Rr2 = Number((Rc * (k === 'shift' ? R.pick([0.05, 0.1, 0.2, 0.3]) : R.pick([0.02, 0.05, 0.1]))).toPrecision(2));
    if (k === 'shift') { var w1 = M.sqrt(1 / (Lh * C) - sq(Rr2 / (2 * Lh))), pct = (w0 - w1) / w0 * 100;
      return P('A series RLC circuit has $L = ' + gu(Lh * 1000, 'mH') + '$, $C = ' + gu(Cu, 'μF') + '$ and $R = ' + gu(Rr2, 'Ω') + '$. Find its damped angular frequency $\\omega\'$ in rad/s.', num(w1, 'rad/s', 0.01),
        ['$L\\ddot{q} + R\\dot{q} + q/C = 0$, like a damped spring with $m \\to L$, $b \\to R$, $k \\to 1/C$.', '$$\\omega\' = \\sqrt{\\frac{1}{LC} - \\left(\\frac{R}{2L}\\right)^2} = \\sqrt{' + sf(1 / (Lh * C)) + ' - ' + sf(sq(Rr2 / (2 * Lh))) + '}$$', $('\\omega\' = ' + nu(w1, 'rad/s')) + ', only ' + sf(pct, 2) + '% below $\\omega_0 = ' + nu(w0, 'rad/s') + '$.'],
        'ω′ = √(1/(LC) − (R/2L)²).', { kind: k, L: Lh, C: Cu, R: Rr2 }); }
    if (k === 'half') { var th = 2 * Lh * M.LN2 / Rr2;
      return P('In a series RLC circuit with $L = ' + gu(Lh * 1000, 'mH') + '$ and $R = ' + gu(Rr2, 'Ω') + '$ (lightly damped), how long does it take the amplitude of the charge oscillation to fall to half, in ms?', num(th * 1000, 'ms'),
        ['The amplitude decays as $e^{-Rt/2L}$.', '$e^{-Rt/2L} = \\tfrac{1}{2}$ gives $t = \\dfrac{2L\\ln 2}{R}$.', $('t = \\dfrac{2(' + gv(Lh) + ')(0.693)}{' + gv(Rr2) + '} = ' + nu(th * 1000, 'ms'))], 'The amplitude goes as e^(−Rt/2L).', { kind: k, L: Lh, R: Rr2 }); }
    if (k === 'crit') return P('What resistance makes a series RLC circuit with $L = ' + gu(Lh * 1000, 'mH') + '$ and $C = ' + gu(Cu, 'μF') + '$ critically damped?', num(Rc, 'Ω'),
      ['Critical damping is where $\\omega\'$ reaches zero: $\\left(\\dfrac{R}{2L}\\right)^2 = \\dfrac{1}{LC}$.', $('R = 2\\sqrt{\\dfrac{L}{C}} = 2\\sqrt{\\dfrac{' + gv(Lh) + '}{' + gv(C) + '}} = ' + nu(Rc, 'Ω'))], 'Set the damped frequency to zero.', { kind: k, L: Lh, C: Cu });
    var tt = Number((Lh / Rr2 * R.pick([0.3, 0.7, 1, 2])).toPrecision(2)), fr = M.exp(-Rr2 * tt / Lh);
    return P('A lightly damped series RLC circuit has $L = ' + gu(Lh * 1000, 'mH') + '$ and $R = ' + gu(Rr2, 'Ω') + '$. What fraction of its energy remains after ' + $(gu(tt * 1000, 'ms')) + '? (Answer as a decimal.)', { t: 'num', v: pl(fr), rtol: 0.02 },
      ['The charge amplitude decays as $e^{-Rt/2L}$, and energy goes as amplitude squared: $e^{-Rt/L}$.', $('\\dfrac{U}{U_0} = e^{-(' + gv(Rr2) + ')(' + gv(tt) + ')/' + gv(Lh) + '} = ' + sf(fr))], 'Energy goes as the square of the amplitude.', { kind: 'energy', L: Lh, R: Rr2, t: tt });
  });


  // ================================================================ Unit 7: AC Circuits and Maxwell's Equations

  G('em.ac-rms', function (R, ctx) {
    var k = kind(R, ctx, ['rms', 'peak', 'mc'], ['P', 'I', 'peakP', 'rms'], ['tri', 'square', 'P', 'I']);
    var V0 = R.pick([10, 20, 50, 100, 170, 325]), Rr = R.pick([10, 20, 50, 100, 200]), Vr = V0 / M.SQRT2;
    if (k === 'rms') return P('An AC source has a peak voltage of ' + $(gu(V0, 'V')) + '. What is its rms voltage?', num(Vr, 'V'),
      ['For a sine wave, $\\overline{\\sin^2} = \\tfrac{1}{2}$ over a cycle, so $V_{\\text{rms}} = \\sqrt{\\overline{V^2}} = V_0/\\sqrt{2}$.', $('V_{\\text{rms}} = \\dfrac{' + gv(V0) + '}{\\sqrt{2}} = ' + nu(Vr, 'V'))], 'Divide the peak by √2.', { kind: k, V0: V0 });
    if (k === 'peak') { var Vrms = R.pick([120, 230, 240, 12, 24]); return P((Vrms > 100 ? 'A household outlet is rated ' : 'A low-voltage AC supply is rated ') + $(gu(Vrms, 'V')) + ' (rms). What is the peak voltage?', num(Vrms * M.SQRT2, 'V'),
      ['Ratings for AC are rms values; the sine wave swings to $V_0 = \\sqrt{2}\\,V_{\\text{rms}}$.', $('V_0 = \\sqrt{2}(' + gv(Vrms) + ') = ' + nu(Vrms * M.SQRT2, 'V'))], 'Multiply the rms value by √2.', { kind: k, Vrms: Vrms }); }
    if (k === 'P') return P('An AC source with peak voltage ' + $(gu(V0, 'V')) + ' drives a ' + $(gu(Rr, 'Ω')) + ' resistor. What average power does the resistor use?', num(Vr * Vr / Rr, 'W'),
      ['Power at each instant is $V^2/R = \\dfrac{V_0^2}{R}\\sin^2\\omega t$, which averages to $\\dfrac{V_0^2}{2R} = \\dfrac{V_{\\text{rms}}^2}{R}$.', $('\\bar{P} = \\dfrac{(' + gv(V0) + ')^2}{2(' + gv(Rr) + ')} = ' + nu(Vr * Vr / Rr, 'W'))], 'Average power is V_rms²/R, not zero.', { kind: k, V0: V0, R: Rr });
    if (k === 'peakP') return P('An AC source with peak voltage ' + $(gu(V0, 'V')) + ' drives a ' + $(gu(Rr, 'Ω')) + ' resistor. What is the largest instantaneous power?', num(V0 * V0 / Rr, 'W'),
      ['$P = \\dfrac{V^2}{R}$ is largest when $V = \\pm V_0$: $P_{\\max} = \\dfrac{V_0^2}{R}$, twice the average.', $('P_{\\max} = \\dfrac{(' + gv(V0) + ')^2}{' + gv(Rr) + '} = ' + nu(V0 * V0 / Rr, 'W'))], 'Use the peak voltage in V²/R.', { kind: k, V0: V0, R: Rr });
    if (k === 'I') { var Pw = R.pick([60, 100, 500, 1000, 1500]), Vrms2 = R.pick([120, 230]); return P('A ' + $(gu(Pw, 'W')) + ' heater runs on ' + $(gu(Vrms2, 'V')) + ' rms. Find the rms current and the peak current.', { t: 'multi', parts: [{ label: '$I_{\\text{rms}}$', a: { t: 'num', v: pl(Pw / Vrms2), rtol: 0.02 }, unit: 'A' }, { label: '$I_0$', a: { t: 'num', v: pl(Pw / Vrms2 * M.SQRT2), rtol: 0.02 }, unit: 'A' }] },
      ['For a resistor, $\\bar{P} = I_{\\text{rms}}V_{\\text{rms}}$, so $I_{\\text{rms}} = ' + gv(Pw) + '/' + gv(Vrms2) + ' = ' + nu(Pw / Vrms2, 'A') + '$.', 'The peak current is $\\sqrt{2}$ times larger: $I_0 = ' + nu(Pw / Vrms2 * M.SQRT2, 'A') + '$.'], 'P = I_rms V_rms for a resistor.', { kind: k, P: Pw, V: Vrms2 }); }
    if (k === 'tri' || k === 'square') { var rmsv = k === 'tri' ? V0 / M.sqrt(3) : V0;
      return P('A ' + (k === 'tri' ? 'triangle wave (rising and falling in straight lines between $-V_0$ and $+V_0$)' : 'square wave (jumping between $+V_0$ and $-V_0$ and staying at each for half a cycle)') + ' has $V_0 = ' + gu(V0, 'V') + '$. Find its rms value.', num(rmsv, 'V'),
        k === 'tri' ? ['Over a quarter cycle the voltage rises steadily, $V = V_0\\dfrac{t}{T/4}$, and the other quarters are mirror images with the same $V^2$.', '$$\\overline{V^2} = \\frac{1}{T/4}\\int_0^{T/4}V_0^2\\left(\\frac{4t}{T}\\right)^2dt = \\frac{V_0^2}{3}$$', $('V_{\\text{rms}} = \\dfrac{V_0}{\\sqrt{3}} = ' + nu(rmsv, 'V'))] : ['$V^2 = V_0^2$ at every moment, so its average is $V_0^2$.', $('V_{\\text{rms}} = V_0 = ' + nu(rmsv, 'V')) + ': a square wave heats a resistor as much as a steady $V_0$.'],
        'rms means the square root of the average of V².', { kind: k, V0: V0 }); }
    return P('An AC voltage averages to zero over each cycle. What average power does it deliver to a resistor?', mcq('A positive amount, $V_{\\text{rms}}^2/R$', ['Zero, because the voltage averages to zero', 'A negative amount half of each cycle, so zero overall', 'Only half of what the peak voltage suggests, $V_0/(2R)$']),
      ['Power is $V^2/R$, and $V^2$ is never negative: the resistor heats up whichever way the current flows.', 'Averaging $\\sin^2$ over a cycle gives $\\tfrac{1}{2}$, so $\\bar{P} = \\dfrac{V_0^2}{2R} = \\dfrac{V_{\\text{rms}}^2}{R}$.'],
      'Average V², not V.', { kind: 'mc' });
  });

  G('em.reactance', function (R, ctx) {
    var k = kind(R, ctx, ['XC', 'XL', 'mc'], ['XC', 'XL', 'I', 'scale'], ['cross', 'I', 'scale']);
    var f = R.pick([50, 60, 100, 500, 1000]), w = 2 * PI * f, Cu = R.pick([1, 2, 5, 10, 22, 47, 100]), Lh = R.pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.5]);
    if (k === 'XC') { var XC = 1 / (w * Cu * 1e-6); return P('Find the reactance of a ' + $(gu(Cu, 'μF')) + ' capacitor at ' + $(gu(f, 'Hz')) + '.', num(XC, 'Ω'), ['$X_C = \\dfrac{1}{\\omega C}$ with $\\omega = 2\\pi f = ' + sf(w) + '\\ \\text{rad/s}$.', $('X_C = \\dfrac{1}{(' + sf(w) + ')(' + gv(Cu * 1e-6) + ')} = ' + nu(XC, 'Ω'))], 'X_C = 1/(ωC), ω = 2πf.', { kind: k, f: f, C: Cu }); }
    if (k === 'XL') { var XL = w * Lh; return P('Find the reactance of a ' + $(gu(Lh * 1000, 'mH')) + ' inductor at ' + $(gu(f, 'Hz')) + '.', num(XL, 'Ω'), ['$X_L = \\omega L$ with $\\omega = 2\\pi f = ' + sf(w) + '\\ \\text{rad/s}$.', $('X_L = (' + sf(w) + ')(' + gv(Lh) + ') = ' + nu(XL, 'Ω'))], 'X_L = ωL.', { kind: k, f: f, L: Lh }); }
    if (k === 'I') { var Vr = R.pick([12, 24, 120, 230]), isC = R.coin(), X = isC ? 1 / (w * Cu * 1e-6) : w * Lh, I = Vr / X;
      return P('A ' + (isC ? $(gu(Cu, 'μF')) + ' capacitor' : $(gu(Lh * 1000, 'mH')) + ' inductor') + ' is connected alone across a ' + $(gu(Vr, 'V')) + ' rms, ' + $(gu(f, 'Hz')) + ' source. Find the rms current, in mA.', num(I * 1000, 'mA'),
        [isC ? '$X_C = \\dfrac{1}{2\\pi fC} = ' + nu(X, 'Ω') + '$.' : '$X_L = 2\\pi fL = ' + nu(X, 'Ω') + '$.', $('I_{\\text{rms}} = \\dfrac{V_{\\text{rms}}}{X} = \\dfrac{' + gv(Vr) + '}{' + sf(X) + '} = ' + nu(I * 1000, 'mA'))], 'Find the reactance, then I = V/X.', { kind: k, f: f, C: Cu, L: Lh, V: Vr, isC: isC }); }
    if (k === 'scale') { var g = R.pick([2, 3, 4, 10]), isC2 = R.coin(), ratio = isC2 ? 1 / g : g;
      return P('The frequency of the source across ' + (isC2 ? 'a capacitor' : 'an inductor') + ' is multiplied by ' + g + '. By what factor does its reactance change? (Answer as a number, such as 0.5.)', { t: 'num', v: pl(ratio, 4), rtol: 0.01 },
        [isC2 ? '$X_C = \\dfrac{1}{\\omega C}$: the reactance goes as $1/f$, so it is divided by ' + g + '.' : '$X_L = \\omega L$: the reactance grows in proportion to $f$.', 'Factor: $' + sf(ratio) + '$.'], isC2 ? 'X_C = 1/(ωC).' : 'X_L = ωL.', { kind: k, g: g, isC: isC2 }); }
    var fc = 1 / (2 * PI * M.sqrt(Lh * Cu * 1e-6));
    if (k === 'cross') return P('At what frequency do a ' + $(gu(Lh * 1000, 'mH')) + ' inductor and a ' + $(gu(Cu, 'μF')) + ' capacitor have equal reactances?', num(fc, 'Hz'),
      ['Set $\\omega L = \\dfrac{1}{\\omega C}$: $\\omega = \\dfrac{1}{\\sqrt{LC}}$.', $('f = \\dfrac{1}{2\\pi\\sqrt{(' + gv(Lh) + ')(' + gv(Cu * 1e-6) + ')}} = ' + nu(fc, 'Hz'))], 'Solve ωL = 1/(ωC).', { kind: k, L: Lh, C: Cu });
    return P('In an AC circuit with only a capacitor, how does the current compare with the voltage?', mcq('The current leads: it peaks a quarter cycle before the voltage', ['The current lags: it peaks a quarter cycle after the voltage', 'They peak together, as in a resistor', 'The current peaks half a cycle after the voltage']),
      ['$q = CV$, so $I = dq/dt = C\\,dV/dt$. The current is largest when the voltage is changing fastest, as it crosses zero on the way up.', 'That moment comes a quarter cycle <i>before</i> the voltage reaches its peak, so the current leads by $90^\\circ$.', 'In an inductor it is the reverse: $V = L\\,dI/dt$, so the current lags by $90^\\circ$.'],
      'I = C dV/dt: when is dV/dt largest?', { kind: 'mc' });
  });

  function rlc(R, ctx, minPhi) { // a series RLC circuit with friendly numbers (|φ| at least minPhi degrees when asked)
    for (var tries = 0; tries < 40; tries++) { var c = rlc1(R); if (!minPhi || M.abs(c.phi) >= minPhi) return c; } return c;
  }
  function rlc1(R) {
    var Rr = R.pick([20, 30, 40, 50, 60, 80, 100]), Lh = R.pick([0.05, 0.1, 0.2, 0.3]), Cu = R.pick([10, 20, 30, 50, 100]), f = R.pick([50, 60, 100]), w = 2 * PI * f;
    var XL = w * Lh, XC = 1 / (w * Cu * 1e-6), Z = M.sqrt(Rr * Rr + sq(XL - XC)), phi = M.atan2(XL - XC, Rr) / PI * 180;
    return { R: Rr, L: Lh, C: Cu, f: f, w: w, XL: XL, XC: XC, Z: Z, phi: phi };
  }
  G('em.impedance', function (R, ctx) {
    var k = kind(R, ctx, ['Zx', 'Zx', 'mc'], ['Z', 'I', 'phi', 'Zx'], ['VL', 'phi', 'I', 'Z']);
    if (k === 'mc') { var m = R.pick([10, 20, 30]), Rm = 3 * m, d = 4 * m, XCm = R.pick([20, 40, 60]), XLm = XCm + d, Zm = 5 * m, w3 = M.sqrt(Rm * Rm + XLm * XLm + XCm * XCm);
      return P('A series circuit has $R = ' + gu(Rm, 'Ω') + '$, $X_L = ' + gu(XLm, 'Ω') + '$ and $X_C = ' + gu(XCm, 'Ω') + '$. What is its impedance?', mcq('$' + gu(Zm, 'Ω') + '$', ['$' + gu(Rm + XLm + XCm, 'Ω') + '$', '$' + gu(Rm + XLm - XCm, 'Ω') + '$', '$' + gu(d, 'Ω') + '$']),
        ['The three voltages peak at different times: $V_L$ leads the current by $90^\\circ$, $V_C$ lags by $90^\\circ$, and $V_R$ is in step. As phasors, $X_L$ and $X_C$ point in opposite directions and $R$ at right angles to both.', '$Z = \\sqrt{R^2 + (X_L - X_C)^2} = \\sqrt{' + Rm + '^2 + ' + d + '^2} = ' + gu(Zm, 'Ω') + '$.', 'Adding them as plain numbers would treat voltages that peak at different times as if they peaked together.'],
        'Combine them as phasors: X_L and X_C cancel in part, and R adds at right angles.', { kind: 'mc', Z: Zm }); }
    if (k === 'Zx') { var Rr = R.pick([30, 40, 60, 80, 120]), XL = R.pick([50, 80, 100, 150, 200]), XC = R.pick([20, 40, 60, 90, 250]); if (XL === XC) XC += 10; var Z = M.sqrt(Rr * Rr + sq(XL - XC));
      return P('A series circuit has $R = ' + gu(Rr, 'Ω') + '$, $X_L = ' + gu(XL, 'Ω') + '$ and $X_C = ' + gu(XC, 'Ω') + '$. Find its impedance.', num(Z, 'Ω'),
        ['The voltages across $L$ and $C$ are exactly opposite in phase, so their reactances subtract; the resistor\'s voltage is $90^\\circ$ from both, so it adds at right angles (phasors).', $('Z = \\sqrt{R^2 + (X_L - X_C)^2} = \\sqrt{' + Rr + '^2 + (' + XL + ' - ' + XC + ')^2} = ' + nu(Z, 'Ω'))], 'Z = √(R² + (X_L − X_C)²).', { kind: k, R: Rr, XL: XL, XC: XC }); }
    var c = rlc(R, ctx, k === 'phi' ? 5 : 0), Vr = R.pick([12, 24, 50, 120]), I = Vr / c.Z;
    var desc = 'A series circuit has $R = ' + gu(c.R, 'Ω') + '$, $L = ' + gu(c.L * 1000, 'mH') + '$ and $C = ' + gu(c.C, 'μF') + '$, driven at ' + $(gu(c.f, 'Hz')) + ' by a ' + $(gu(Vr, 'V')) + ' rms source. ';
    var base = ['$\\omega = 2\\pi f = ' + sf(c.w) + '\\ \\text{rad/s}$; $X_L = \\omega L = ' + nu(c.XL, 'Ω') + '$; $X_C = 1/(\\omega C) = ' + nu(c.XC, 'Ω') + '$.', '$Z = \\sqrt{R^2 + (X_L - X_C)^2} = ' + nu(c.Z, 'Ω') + '$.'];
    var t = { kind: k, R: c.R, L: c.L, C: c.C, f: c.f, V: Vr };
    if (k === 'Z') return P(desc + 'Find the impedance.', num(c.Z, 'Ω'), base, 'Find both reactances first.', t);
    if (k === 'I') return P(desc + 'Find the rms current.', num(I, 'A'), base.concat([$('I_{\\text{rms}} = \\dfrac{V_{\\text{rms}}}{Z} = \\dfrac{' + gv(Vr) + '}{' + sf(c.Z) + '} = ' + nu(I, 'A'))]), 'I = V/Z.', t);
    if (k === 'phi') return P(desc + 'Find the phase angle $\\phi$ by which the voltage leads the current, in degrees (negative if it lags).', { a: { t: 'num', v: pl(c.phi), rtol: 0.02 }, unit: '°' },
      base.concat(['$\\tan\\phi = \\dfrac{X_L - X_C}{R} = \\dfrac{' + sf(c.XL - c.XC) + '}{' + gv(c.R) + '}$, so $\\phi = ' + sf(c.phi) + '^\\circ$. ' + (c.phi > 0 ? 'Positive: the circuit acts mainly like an inductor, and the voltage leads.' : 'Negative: the circuit acts mainly like a capacitor, and the voltage lags.')]), 'tan φ = (X_L − X_C)/R.', t);
    var VL = I * c.XL;
    return P(desc + 'Find the rms voltage across the inductor alone.', num(VL, 'V'), base.concat(['$I_{\\text{rms}} = ' + gv(Vr) + '/' + sf(c.Z) + ' = ' + nu(I, 'A') + '$.', $('V_L = I X_L = (' + sf(I) + ')(' + sf(c.XL) + ') = ' + nu(VL, 'V')) + (VL > Vr ? '. More than the source voltage! The capacitor\'s voltage is opposite in phase and cancels most of it.' : '.')]), 'Find the current, then V_L = I X_L.', t);
  });

  G('em.ac-resonance-power', function (R, ctx) {
    var k = kind(R, ctx, ['f0', 'Ires', 'mc'], ['P', 'pf', 'f0', 'Ires'], ['Q', 'P', 'tune']);
    var c = rlc(R, ctx), Vr = R.pick([12, 24, 50, 120]), f0 = 1 / (2 * PI * M.sqrt(c.L * c.C * 1e-6));
    var desc = 'A series circuit has $R = ' + gu(c.R, 'Ω') + '$, $L = ' + gu(c.L * 1000, 'mH') + '$ and $C = ' + gu(c.C, 'μF') + '$. ';
    var t = { kind: k, R: c.R, L: c.L, C: c.C, f: c.f, V: Vr };
    if (k === 'mc') { var ph = R.pick([30, 60, 75]), Ir = R.pick([1, 2, 3, 5]), Vm = R.pick([120, 230]), Pm = Ir * Vm * M.cos(deg(ph));
      return P('An AC circuit draws $I_{\\text{rms}} = ' + gu(Ir, 'A') + '$ from a $' + gu(Vm, 'V') + '$ rms source, with the current lagging the voltage by $' + ph + '^\\circ$. What average power does it use?', mcq('$' + nu(Pm, 'W') + '$', ['$' + nu(Ir * Vm, 'W') + '$', '$' + nu(Ir * Vm * M.sin(deg(ph)), 'W') + '$', '$0\\ \\text{W}$']),
        ['$\\bar{P} = I_{\\text{rms}}V_{\\text{rms}}\\cos\\phi$: only the part of the current in step with the voltage delivers energy on average.', $('\\bar{P} = (' + gv(Ir) + ')(' + gv(Vm) + ')\\cos ' + ph + '^\\circ = ' + nu(Pm, 'W')), 'The rest of the current sloshes energy into the inductor or capacitor and back each cycle.'],
        'Include the power factor cos φ.', { kind: 'mc', P: Pm }); }
    if (k === 'f0') return P(desc + 'At what frequency does it resonate?', num(f0, 'Hz'), ['At resonance $X_L = X_C$, so $\\omega_0 = \\dfrac{1}{\\sqrt{LC}}$.', $('f_0 = \\dfrac{1}{2\\pi\\sqrt{(' + gv(c.L) + ')(' + gv(c.C * 1e-6) + ')}} = ' + nu(f0, 'Hz'))], 'Set X_L = X_C.', t);
    if (k === 'Ires') return P(desc + 'It is driven at its resonant frequency by a ' + $(gu(Vr, 'V')) + ' rms source. Find the rms current.', num(Vr / c.R, 'A'), ['At resonance $X_L = X_C$, so they cancel and $Z = R$: the smallest impedance possible.', $('I_{\\text{rms}} = \\dfrac{V_{\\text{rms}}}{R} = \\dfrac{' + gv(Vr) + '}{' + gv(c.R) + '} = ' + nu(Vr / c.R, 'A'))], 'At resonance Z = R.', t);
    var I = Vr / c.Z, pf = c.R / c.Z, Pw = I * I * c.R;
    var base = ['$X_L = 2\\pi fL = ' + nu(c.XL, 'Ω') + '$, $X_C = \\dfrac{1}{2\\pi fC} = ' + nu(c.XC, 'Ω') + '$, $Z = ' + nu(c.Z, 'Ω') + '$.'];
    if (k === 'pf') return P(desc + 'What is its power factor, $\\cos\\phi$, at ' + $(gu(c.f, 'Hz')) + '?', { t: 'num', v: pl(pf), rtol: 0.02 }, base.concat(['$\\cos\\phi = \\dfrac{R}{Z} = \\dfrac{' + gv(c.R) + '}{' + sf(c.Z) + '} = ' + sf(pf) + '$.']), 'cos φ = R/Z.', t);
    if (k === 'P') return P(desc + 'It is driven at ' + $(gu(c.f, 'Hz')) + ' by a ' + $(gu(Vr, 'V')) + ' rms source. What average power does it use?', num(Pw, 'W'),
      base.concat(['$I_{\\text{rms}} = V_{\\text{rms}}/Z = ' + nu(I, 'A') + '$.', '$\\bar{P} = I_{\\text{rms}}V_{\\text{rms}}\\cos\\phi = I_{\\text{rms}}^2R = (' + sf(I) + ')^2(' + gv(c.R) + ') = ' + nu(Pw, 'W') + '$. Only the resistor uses energy; $L$ and $C$ store it and give it back each cycle.']), 'Only the resistor uses power: P = I_rms²R.', t);
    if (k === 'Q') { var Qf = 2 * PI * f0 * c.L / c.R; return P(desc + 'What is its quality factor $Q = \\omega_0L/R$?', { t: 'num', v: pl(Qf), rtol: 0.02 }, ['$\\omega_0 = 1/\\sqrt{LC} = ' + nu(2 * PI * f0, 'rad/s') + '$.', $('Q = \\dfrac{\\omega_0 L}{R} = \\dfrac{(' + sf(2 * PI * f0) + ')(' + gv(c.L) + ')}{' + gv(c.R) + '} = ' + sf(Qf)), 'The resonance peak has a width of about $\\omega_0/Q$: a high $Q$ means a sharp, selective peak.'], 'Find ω₀ first.', t); }
    var ft = R.pick([88, 95, 100, 104]) * 1e6, Cp = R.pick([5, 10, 20]) * 1e-12, Lt = 1 / (sq(2 * PI * ft) * Cp);
    return P('An FM radio tuner uses a ' + $(gu(Cp * 1e12, 'pF')) + ' capacitor. What inductance, in nH, tunes it to a station at ' + $(gu(ft / 1e6, 'MHz')) + '?', num(Lt * 1e9, 'nH'),
      ['Resonance: $f_0 = \\dfrac{1}{2\\pi\\sqrt{LC}}$, so $L = \\dfrac{1}{(2\\pi f_0)^2C}$.', $('L = \\dfrac{1}{(2\\pi \\cdot ' + gv(ft) + ')^2(' + gv(Cp) + ')} = ' + nu(Lt * 1e9, 'nH'))], 'Solve f₀ = 1/(2π√(LC)) for L.', { kind: 'tune', f: ft, C: Cp });
  });

  G('em.displacement-current', function (R, ctx) {
    var k = kind(R, ctx, ['Id', 'Id', 'mc'], ['B', 'dEdt', 'Bout', 'Id'], ['dVdt', 'B', 'Bout']);
    var Rp = R.pick([0.05, 0.10, 0.15]), A = PI * Rp * Rp, I = R.pick([0.5, 1, 2, 5]);
    var plates = 'A capacitor with circular plates of radius ' + $(gu(Rp * 100, 'cm')) + ' is being charged by a current of ' + $(gu(I, 'A')) + '. ';
    if (k === 'mc') return P('While a capacitor charges, current flows in the wires on both sides. What happens in the empty gap between the plates?', mcq('No charge crosses it; the growing electric field there acts as a "displacement current" equal to the current in the wires', ['Electrons jump across the gap, carrying the current over', 'Nothing: the gap breaks the circuit, so there is no magnetic field around it', 'Charge crosses the gap only once the voltage is high enough']),
      ['No charge crosses an ideal capacitor\'s gap: charge piles up on one plate and leaves the other.', 'But the electric field in the gap grows as the charge builds, and $\\varepsilon_0\\,d\\Phi_E/dt$ equals the current $I$ in the wires.', 'Maxwell added this term to Ampère\'s law, so a magnetic field circles the gap just as it circles the wires.'],
      'What changes in the gap while the plates charge up?', { kind: 'mc' });
    if (k === 'Id') { var dEdt = R.pick([1, 2, 5, 10]) * 1e12, Id = EPS0 * A * dEdt;
      return P('Between the circular plates (radius ' + $(gu(Rp * 100, 'cm')) + ') of a charging capacitor, the electric field grows at ' + $(gu(dEdt, 'V/(m·s)')) + '. What is the displacement current?', num(Id, 'A'),
        ['$I_d = \\varepsilon_0\\dfrac{d\\Phi_E}{dt} = \\varepsilon_0A\\dfrac{dE}{dt}$ (the field is uniform between the plates).', $('I_d = ' + tE0 + '\\pi(' + gv(Rp) + ')^2(' + gv(dEdt) + ') = ' + nu(Id, 'A'))], 'I_d = ε₀ A dE/dt.', { kind: k, R: Rp, dEdt: dEdt }); }
    if (k === 'dEdt') return P(plates + 'How fast is the electric field between the plates increasing?', num(I / (EPS0 * A), 'V/(m·s)'),
      ['The displacement current in the gap equals the conduction current in the wires: $\\varepsilon_0A\\dfrac{dE}{dt} = I$.', '(Directly: $E = \\dfrac{q}{\\varepsilon_0A}$, so $\\dfrac{dE}{dt} = \\dfrac{I}{\\varepsilon_0A}$.)', $('\\dfrac{dE}{dt} = \\dfrac{' + gv(I) + '}{' + tE0 + '\\pi(' + gv(Rp) + ')^2} = ' + nu(I / (EPS0 * A), 'V/(m·s)'))], 'ε₀A dE/dt equals the current in the wires.', { kind: k, R: Rp, I: I });
    if (k === 'B') { var r = Rp * R.pick([0.25, 0.5, 0.75]), B = MU0 * I * r / (2 * PI * Rp * Rp);
      return P(plates + 'Find the magnetic field between the plates, ' + $(gu(+(r * 100).toPrecision(3), 'cm')) + ' from the axis, in μT.', num(B * 1e6, 'μT'),
        ['Ampère–Maxwell around a circle of radius $r$ between the plates: no charge crosses it, but it encloses the fraction $r^2/R^2$ of the displacement current, which equals $I$ in total.', '$B(2\\pi r) = \\mu_0I\\dfrac{r^2}{R^2}$, so $B = \\dfrac{\\mu_0Ir}{2\\pi R^2}$.', $('B = \\dfrac{' + tMU + '(' + gv(I) + ')(' + gv(+r.toPrecision(3)) + ')}{2\\pi(' + gv(Rp) + ')^2} = ' + nu(B * 1e6, 'μT'))],
        'Treat the displacement current like a current spread evenly over the plates.', { kind: k, R: Rp, I: I, r: r }); }
    if (k === 'Bout') { var r2 = Rp * R.pick([1.5, 2, 3]), B2 = MU0 * I / (2 * PI * r2);
      return P(plates + 'Find the magnetic field in the plane midway between the plates, ' + $(gu(+(r2 * 100).toPrecision(3), 'cm')) + ' from the axis (outside the plates\' edge), in μT.', num(B2 * 1e6, 'μT'),
        ['A circle of radius $r > R$ encloses all of the displacement current, $I_d = I$.', $('B = \\dfrac{\\mu_0I}{2\\pi r} = \\dfrac{' + tMU + '(' + gv(I) + ')}{2\\pi(' + gv(+r2.toPrecision(3)) + ')} = ' + nu(B2 * 1e6, 'μT')), 'Exactly what the wire would make at that distance: the gap is invisible to Ampère–Maxwell.'],
        'The whole displacement current is enclosed.', { kind: k, R: Rp, I: I, r: r2 }); }
    var Cpf = R.pick([100, 200, 500, 1000]), dV = R.pick([1, 2, 5, 10]) * 1e6, Id2 = Cpf * 1e-12 * dV;
    return P('The voltage across a ' + $(gu(Cpf, 'pF')) + ' parallel-plate capacitor rises at ' + $(gu(dV, 'V/s')) + '. What displacement current flows between its plates, in mA?', num(Id2 * 1000, 'mA'),
      ['$I_d = \\varepsilon_0A\\dfrac{dE}{dt}$ with $E = V/d$: $I_d = \\dfrac{\\varepsilon_0A}{d}\\dfrac{dV}{dt} = C\\dfrac{dV}{dt}$.', $('I_d = (' + gv(Cpf * 1e-12) + ')(' + gv(dV) + ') = ' + nu(Id2 * 1000, 'mA')), 'The same as the charging current in the wires, $dq/dt = C\\,dV/dt$.'],
      'Write E = V/d and recognize ε₀A/d = C.', { kind: 'dVdt', C: Cpf, dV: dV });
  });

  var MAXW = [['Gauss\'s law', '$\\oint\\vec{E}\\cdot d\\vec{A} = q_{\\text{enc}}/\\varepsilon_0$'], ['Gauss\'s law for magnetism', '$\\oint\\vec{B}\\cdot d\\vec{A} = 0$'], ['Faraday\'s law', '$\\oint\\vec{E}\\cdot d\\vec{\\ell} = -d\\Phi_B/dt$'], ['the Ampère–Maxwell law', '$\\oint\\vec{B}\\cdot d\\vec{\\ell} = \\mu_0I_{\\text{enc}} + \\mu_0\\varepsilon_0\\,d\\Phi_E/dt$']];
  G('em.maxwells-equations', function (R, ctx) {
    var k = kind(R, ctx, ['which', 'which', 'mono'], ['which', 'gaussB', 'faraday', 'mono'], ['ampmax', 'gaussB', 'which']);
    if (k === 'which' || k === 'mono') {
      var stmts = [[1, 'There are no magnetic charges (monopoles): every magnetic field line that enters a closed surface also leaves it.'], [0, 'The electric flux out of any closed surface is set by the charge inside it.'], [2, 'A changing magnetic field makes a curling electric field, even in empty space.'], [3, 'A changing electric field makes a magnetic field, just as a current does.'], [0, 'Electric field lines begin on positive charges and end on negative ones.'], [3, 'A current makes a magnetic field that circles around it.'], [2, 'A magnet pushed into a coil drives a current around it.'], [1, 'Cut a bar magnet in half and you get two smaller magnets, never a lone north pole.']];
      var s = k === 'mono' ? stmts[R.pick([0, 7])] : R.pick(stmts);
      return P('Which of Maxwell\'s equations expresses this? "' + s[1] + '"', mcq(MAXW[s[0]][0] + ', ' + MAXW[s[0]][1], MAXW.filter(function (x, i) { return i !== s[0]; }).map(function (x) { return x[0] + ', ' + x[1]; })),
        ['Gauss (electric): flux of $\\vec{E}$ through a closed surface counts enclosed charge. Gauss (magnetic): flux of $\\vec{B}$ through a closed surface is always zero. Faraday: changing $\\Phi_B$ makes a circulating $\\vec{E}$. Ampère–Maxwell: currents and changing $\\Phi_E$ make a circulating $\\vec{B}$.', 'This statement is ' + MAXW[s[0]][0] + '.'],
        'Is it about flux through a closed surface or circulation around a loop? Of E or of B?', { kind: k, s: s[0] });
    }
    if (k === 'gaussB') { var p1 = R.pick([2, 3, 5, 8]), p2 = R.pick([-6, -4, -1, 1, 3]), side = -(p1 + p2);
      return P('A closed cylindrical surface sits in a magnetic field. The outward flux through its top end is ' + $(gu(p1, 'mWb')) + ' and through its bottom end is ' + $(gu(p2, 'mWb')) + '. What is the outward flux through its curved side?', { a: { t: 'num', v: String(side) }, unit: 'mWb' },
        ['Gauss\'s law for magnetism: the total outward flux through any closed surface is zero, because there are no magnetic charges.', '$' + p1 + ' + (' + p2 + ') + \\Phi_{\\text{side}} = 0$, so $\\Phi_{\\text{side}} = ' + side + '\\ \\text{mWb}$.'],
        'The flux through the whole closed surface must add to zero.', { kind: k, p1: p1, p2: p2 }); }
    if (k === 'faraday') { var Rs = R.pick([0.02, 0.05, 0.1]), dB = R.pick([0.5, 1, 2, 4]), circ = -PI * Rs * Rs * dB;
      return P('A uniform magnetic field fills a circular region of radius ' + $(gu(Rs * 100, 'cm')) + ' and points out of the page, growing at ' + $(gu(dB, 'T/s')) + '. Going counterclockwise around the edge of the region, what is $\\oint\\vec{E}\\cdot d\\vec{\\ell}$, in mV?', { a: { t: 'num', v: pl(circ * 1000), rtol: 0.02 }, unit: 'mV' },
        ['Faraday\'s law: $\\oint\\vec{E}\\cdot d\\vec{\\ell} = -\\dfrac{d\\Phi_B}{dt}$, with the normal (out of the page) set by the counterclockwise direction.', $('-\\pi(' + gv(Rs) + ')^2(' + gv(dB) + ') = ' + nu(circ * 1000, 'mV')), 'Negative: the induced field circulates clockwise, opposing the growing flux (Lenz).'],
        'Use Faraday\'s law with the right-hand rule for the sign.', { kind: k, R: Rs, dB: dB }); }
    var I = R.pick([1, 2, 3]), dPE = R.pick([1, 2, 5]) * 1e11, val = MU0 * (I + EPS0 * dPE);
    return P('A closed path encloses a wire carrying ' + $(gu(I, 'A')) + ' and also part of a capacitor gap, where the electric flux through the path is changing at ' + $(gu(dPE, 'V·m/s')) + '. What is $\\oint\\vec{B}\\cdot d\\vec{\\ell}$ around the path, in μT·m?', num(val * 1e6, 'μT·m'),
      ['Ampère–Maxwell: $\\oint\\vec{B}\\cdot d\\vec{\\ell} = \\mu_0\\left(I + \\varepsilon_0\\dfrac{d\\Phi_E}{dt}\\right)$.', 'Displacement current: $\\varepsilon_0\\dfrac{d\\Phi_E}{dt} = (8.85 \\times 10^{-12})(' + gv(dPE) + ') = ' + nu(EPS0 * dPE, 'A') + '$.', $('\\oint\\vec{B}\\cdot d\\vec{\\ell} = ' + tMU + '(' + gv(I) + ' + ' + sf(EPS0 * dPE) + ') = ' + nu(val * 1e6, 'μT·m'))],
      'Add the conduction current and the displacement current.', { kind: 'ampmax', I: I, dPE: dPE });
  });

  G('em.em-waves-maxwell', function (R, ctx) {
    var k = kind(R, ctx, ['B0', 'E0', 'mc'], ['dir', 'Bdir', 'lambda', 'B0'], ['medium', 'dir', 'Bdir']);
    if (k === 'B0') { var E0 = R.pick([3, 10, 30, 100, 300, 1000]), B0 = E0 / CL; return P('In a light wave the electric field has amplitude ' + $(gu(E0, 'V/m')) + '. What is the amplitude of the magnetic field, in nT?', num(B0 * 1e9, 'nT'), ['In an electromagnetic wave $E = cB$ at every point and every instant.', $('B_0 = \\dfrac{E_0}{c} = \\dfrac{' + gv(E0) + '}{3.00 \\times 10^{8}} = ' + nu(B0, 'T') + ' = ' + nu(B0 * 1e9, 'nT'))], 'B = E/c.', { kind: k, E0: E0 }); }
    if (k === 'E0') { var B1 = R.pick([1, 2, 5, 10, 50]) * 1e-9, E1 = CL * B1; return P('A radio wave\'s magnetic field has amplitude ' + $(gu(B1 * 1e9, 'nT')) + '. What is the amplitude of its electric field?', num(E1, 'V/m'), ['$E = cB$.', $('E_0 = (3.00 \\times 10^{8})(' + gv(B1) + ') = ' + nu(E1, 'V/m'))], 'E = cB.', { kind: k, B0: B1 }); }
    var AX = { '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], '+z': [0, 0, 1], '-z': [0, 0, -1] }, names = Object.keys(AX);
    function nameOf(v) { for (var n in AX) if (AX[n][0] === v[0] && AX[n][1] === v[1] && AX[n][2] === v[2]) return n; }
    if (k === 'dir' || k === 'Bdir') { var eA = R.pick(names), bA = R.pick(names.filter(function (n) { return n[1] !== eA[1]; })), sA = nameOf(cross(AX[eA], AX[bA]));
      if (k === 'dir') return P('At some point in a light wave, $\\vec{E}$ points along $' + eA + '$ and $\\vec{B}$ points along $' + bA + '$. Which way is the wave traveling?', mcq('$' + sA + '$', ['$' + nameOf(AX[sA].map(function (x) { return -x; })) + '$', '$' + eA + '$', '$' + bA + '$']),
        ['The wave travels along $\\vec{E}\\times\\vec{B}$ (the direction of the Poynting vector).', '$' + eA + ' \\times ' + bA + ' = ' + sA + '$.'], 'Travel direction = E × B.', { kind: k, eA: eA, bA: bA });
      var dA = sA, bN = nameOf(cross(AX[dA], AX[eA])); // B = (s × E) direction
      return P('A light wave travels along $' + dA + '$. At some instant its electric field points along $' + eA + '$. Which way does its magnetic field point there?', mcq('$' + bN + '$', ['$' + nameOf(AX[bN].map(function (x) { return -x; })) + '$', '$' + dA + '$', '$' + eA + '$']),
        ['$\\vec{E}$, $\\vec{B}$ and the direction of travel are mutually perpendicular, with $\\vec{E}\\times\\vec{B}$ along the travel direction.', 'That makes $\\vec{B}$ point along (travel) $\\times\\ \\vec{E}$: $' + dA + ' \\times ' + eA + ' = ' + bN + '$. Check: $' + eA + ' \\times ' + bN + ' = ' + dA + '$.'], 'E × B must point along the travel direction.', { kind: k, eA: eA, dA: dA }); }
    if (k === 'lambda') { var f = R.pick([88, 100, 2400, 5000]) * 1e6, lam = CL / f; return P('A wave of frequency ' + $(gu(f / 1e6, 'MHz')) + ' travels through empty space. What is its wavelength, in cm?', num(lam * 100, 'cm'), ['All electromagnetic waves travel at $c = 1/\\sqrt{\\mu_0\\varepsilon_0} = 3.00 \\times 10^{8}\\ \\text{m/s}$ in empty space, and $c = f\\lambda$.', $('\\lambda = \\dfrac{c}{f} = \\dfrac{3.00 \\times 10^{8}}{' + gv(f) + '} = ' + nu(lam, 'm') + ' = ' + nu(lam * 100, 'cm'))], 'λ = c/f.', { kind: k, f: f }); }
    if (k === 'medium') { var kap = R.pick([1.5, 2, 2.25, 4, 81]), v = CL / M.sqrt(kap); return P('In a nonmagnetic material with dielectric constant $\\kappa = ' + gv(kap) + '$ (so $\\varepsilon = \\kappa\\varepsilon_0$), Maxwell\'s equations give the wave speed $v = 1/\\sqrt{\\mu_0\\varepsilon}$. Find $v$.', num(v, 'm/s'),
      ['$v = \\dfrac{1}{\\sqrt{\\mu_0\\kappa\\varepsilon_0}} = \\dfrac{c}{\\sqrt{\\kappa}}$.', $('v = \\dfrac{3.00 \\times 10^{8}}{\\sqrt{' + gv(kap) + '}} = ' + nu(v, 'm/s')) + '. (At the frequencies of light, the relevant $\\kappa$ is the square of the refractive index.)'], 'Replace ε₀ with κε₀.', { kind: k, kap: kap }); }
    return P('In a traveling light wave, how do the electric and magnetic fields at one point vary in time?', mcq('They rise and fall together: both peak at the same instant', ['The magnetic field peaks a quarter cycle after the electric field', 'The magnetic field is largest when the electric field is zero', 'Only the electric field oscillates; the magnetic field stays steady']),
      ['In a traveling wave in empty space, $E = cB$ at every point and every instant, so the two fields are in phase.', 'The picture of fields "taking turns", like energy in an LC circuit, is wrong for a traveling wave. (Fields <i>are</i> a quarter cycle apart in a standing wave, which is a different situation.)'],
      'E = cB holds at every instant.', { kind: 'mc' });
  });

  G('em.em-wave-energy', function (R, ctx) {
    var k = kind(R, ctx, ['I', 'press', 'mc'], ['E0', 'press', 'force', 'B0'], ['point', 'force', 'momentum']);
    if (k === 'I') { var E0 = R.pick([5, 10, 20, 50, 80, 100, 200, 500, 800, 1000]), I = 0.5 * CL * EPS0 * E0 * E0; return P('A light wave has an electric field amplitude of ' + $(gu(E0, 'V/m')) + '. What is its intensity?', num(I, 'W/m²'), ['The average energy density is $\\bar{u} = \\tfrac{1}{2}\\varepsilon_0E_0^2$ (half electric, half magnetic), and it moves at $c$.', $('I = c\\bar{u} = \\tfrac{1}{2}c\\varepsilon_0E_0^2 = \\tfrac{1}{2}(3.00 \\times 10^{8})' + tE0 + '(' + gv(E0) + ')^2 = ' + nu(I, 'W/m²'))], 'I = ½cε₀E₀².', { kind: k, E0: E0 }); }
    if (k === 'E0' || k === 'B0') { var In = R.pick([1360, 1000, 800, 500, 200, 100, 50, 10]), E1 = M.sqrt(2 * In / (CL * EPS0));
      if (k === 'E0') return P((In === 1360 ? 'Sunlight above Earth\'s atmosphere has an intensity of about ' + $(gu(1360, 'W/m²')) + '. Treating it as a single wave, what' : 'A beam of light has an intensity of ' + $(gu(In, 'W/m²')) + '. What') + ' is its electric field amplitude?', num(E1, 'V/m'), ['$I = \\tfrac{1}{2}c\\varepsilon_0E_0^2$, so $E_0 = \\sqrt{\\dfrac{2I}{c\\varepsilon_0}}$.', $('E_0 = \\sqrt{\\dfrac{2(' + gv(In) + ')}{(3.00 \\times 10^{8})(8.85 \\times 10^{-12})}} = ' + nu(E1, 'V/m'))], 'Solve I = ½cε₀E₀² for E₀.', { kind: k, I: In });
      return P('A light beam has intensity ' + $(gu(In, 'W/m²')) + '. What is the amplitude of its magnetic field, in μT?', num(E1 / CL * 1e6, 'μT'), ['$E_0 = \\sqrt{\\dfrac{2I}{c\\varepsilon_0}} = ' + nu(E1, 'V/m') + '$.', $('B_0 = \\dfrac{E_0}{c} = ' + nu(E1 / CL * 1e6, 'μT'))], 'Find E₀, then B₀ = E₀/c.', { kind: k, I: In }); }
    if (k === 'press' || k === 'force') { var In2 = R.pick([1360, 1000, 800, 500, 2000, 300]), refl = R.coin(), Pp = (refl ? 2 : 1) * In2 / CL;
      if (k === 'press') return P('Light of intensity ' + $(gu(In2, 'W/m²')) + ' falls straight onto a surface that ' + (refl ? 'reflects all of it' : 'absorbs all of it') + '. What radiation pressure does it exert, in μPa?', num(Pp * 1e6, 'μPa'),
        ['Light carries momentum $U/c$ along with energy $U$, so the momentum arriving per second per square meter is $I/c$.', refl ? 'Reflected light leaves with its momentum reversed, so the surface must supply twice the change: $p = 2I/c$.' : 'Absorbed light simply stops: $p = I/c$.', $('p = ' + (refl ? '2' : '') + '\\dfrac{' + gv(In2) + '}{3.00 \\times 10^{8}} = ' + nu(Pp * 1e6, 'μPa'))], refl ? 'Reflection doubles the push: 2I/c.' : 'Absorption: I/c.', { kind: k, I: In2, refl: refl });
      var Asail = R.pick([100, 200, 400, 800, 1000, 5000, 10000]), Fs = Pp * Asail;
      return P('A solar sail of area ' + $(gu(Asail, 'm²')) + ' faces ' + (In2 === 1360 ? 'sunlight near Earth, of intensity ' : 'light of intensity ') + $(gu(In2, 'W/m²')) + ' head-on and ' + (refl ? 'reflects it all' : 'absorbs it all') + '. What force does the light exert, in mN?', num(Fs * 1000, 'mN'),
        ['Pressure: $' + (refl ? '2I/c' : 'I/c') + ' = ' + nu(Pp, 'Pa') + '$.', $('F = pA = (' + sf(Pp) + ')(' + gv(Asail) + ') = ' + nu(Fs * 1000, 'mN')) + '. Tiny, but it never stops pushing.'], 'Force = pressure × area.', { kind: k, I: In2, refl: refl, A: Asail }); }
    if (k === 'point') { var Pw = R.pick([1, 5, 10, 40, 60, 100]), rr = R.pick([0.5, 1, 2, 3, 5, 10]), Ip = Pw / (4 * PI * rr * rr), E2 = M.sqrt(2 * Ip / (CL * EPS0));
      return P('A small lamp radiates ' + $(gu(Pw, 'W')) + ' of light evenly in all directions. What is the electric field amplitude ' + $(gu(rr, 'm')) + ' away?', num(E2, 'V/m'),
        ['The power spreads over a sphere: $I = \\dfrac{P}{4\\pi r^2} = ' + nu(Ip, 'W/m²') + '$.', $('E_0 = \\sqrt{\\dfrac{2I}{c\\varepsilon_0}} = ' + nu(E2, 'V/m'))], 'Find the intensity on a sphere first.', { kind: k, P: Pw, r: rr }); }
    if (k === 'momentum') { var In3 = R.pick([1000, 1360]), A3 = R.pick([1, 2, 10]), tt = R.pick([60, 3600]), pm = In3 * A3 * tt / CL;
      return P('Sunlight of intensity ' + $(gu(In3, 'W/m²')) + ' is absorbed by a ' + $(gu(A3, 'm²')) + ' panel facing it for ' + (tt === 60 ? 'one minute' : 'one hour') + '. How much momentum does the light deliver?', num(pm, 'kg·m/s'),
        ['Energy absorbed: $U = IAt = ' + nu(In3 * A3 * tt, 'J') + '$.', $('p = \\dfrac{U}{c} = \\dfrac{' + sf(In3 * A3 * tt) + '}{3.00 \\times 10^{8}} = ' + nu(pm, 'kg·m/s'))], 'Light carries momentum U/c.', { kind: k, I: In3, A: A3, t: tt }); }
    return P('The same beam of light falls on a black card, which absorbs it, and then on a mirror, which reflects it straight back. How do the pushes compare?', mcq('The mirror is pushed twice as hard', ['They are pushed equally hard', 'The black card is pushed twice as hard, since it takes in the energy', 'Neither is pushed, since light has no mass']),
      ['Light carries momentum: $p = U/c$.', 'Absorbed light stops, so its momentum $p$ is transferred to the card.', 'Reflected light leaves with momentum $-p$, a change of $2p$, so the mirror must receive $2p$: twice the push, like a ball that bounces compared with one that sticks.'],
      'Compare the change in the light\'s momentum in the two cases.', { kind: 'mc' });
  });

})(window.MathLadder);
