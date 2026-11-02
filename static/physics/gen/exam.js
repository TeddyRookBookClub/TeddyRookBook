/* Physics Ladder generators: Exam Challenge, multi-step physics problems (course key exam).
   One generator per topic in data/physics/topics/exam.json, registered with MathLadder.gen.

   Every problem is an original scene with a diagram (static/physics/viz/exam.js, quiet: no answers on screen) and
   2 to 4 linked questions in one multi-part answer (level 1: 2 parts, level 2: 3, level 3: up to 4). Later parts use
   the results of earlier ones, as in a long exam problem. Multiple-choice parts use distractors from common mistakes.
   Conventions: SI units; g = 9.8 m/s²; numeric parts carry a unit and rtol 0.02, shown to 3 significant figures.
   Each problem also carries `chk`: the setup and the expected part values, so a node test can recompute every answer
   by an independent route (the runner ignores it). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util, M = Math, PI = M.PI;
  var g0 = 9.8;
  function wideMath(s, limit) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    limit = limit || 30;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (c === '$' && s[i + 1] === '$') { var j = s.indexOf('$$', i + 2); if (j < 0) { out += s.slice(i); break; } out += s.slice(i, j + 2); i = j + 2; continue; }
      if (c === '$') {
        var k = i + 1; while (k < n && !(s[k] === '$' && s[k - 1] !== '\\')) k++;
        if (k >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, k);
        var vis = tex.replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|text|mathrm|vec|hat)\b/g, '').replace(/\\(sin|cos|tan|ln|log|sqrt)\b/g, 'xxx').replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length;
        if (vis > limit) { out += '$$' + tex + '$$'; i = k + 1; if (s[i] === '.' || s[i] === ',') i++; continue; }
        out += '$' + tex + '$'; i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var pr = fn(R, ctx);
      if (pr && typeof pr === 'object') {
        if (Array.isArray(pr.steps)) pr.steps = pr.steps.map(function (x) { return wideMath(x); });
        if (pr.hint) pr.hint = wideMath(pr.hint);
      }
      return pr;
    });
  }

  // ------------------------------------------------------------------ numbers
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function fix(x) { return Number(Number(x).toPrecision(12)) + 0; }
  function sgf(x, n) { if (x === 0 || !isFinite(x)) return x; var e = M.floor(M.log10(M.abs(x))); var f = M.pow(10, n - 1 - e); return fix(M.round(x * f) / f); }
  function rat(x) { if (!isFinite(x)) return null; for (var d = 1; d <= 60; d++) { var n = M.round(x * d); if (M.abs(n / d - x) < 1e-9 * M.max(1, M.abs(x))) return Q(n, d); } return null; }
  function longDec(x) { return /\.\d{5,}/.test(String(fix(x))); }
  function plainNum(x) { x = fix(x); var s = String(x); if (/e/.test(s)) s = Q.from(s).toDec(30).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s; }
  function sfStr(x, n) {
    n = n || 3; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(y / M.pow(10, e)); return plainNum(m) + '*10^' + e; }
    return plainNum(y);
  }
  // TeX for a computed number, 3 significant figures (×10^k outside 0.001 … 10^5)
  function fx(x, n) {
    n = n || 3; if (!isFinite(x)) return '\\infty'; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 5 || e <= -4) { var m = fix(y / M.pow(10, e)); return T.num(m) + ' \\times 10^{' + e + '}'; }
    return M.abs(y) >= 10000 ? T.commas(y) : T.num(y);
  }
  // TeX for a given (exact) number
  function gx(x) {
    x = fix(x); if (x === 0) return '0';
    var e = M.floor(M.log10(M.abs(x)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(x / M.pow(10, e)); return T.num(m) + ' \\times 10^{' + e + '}'; }
    return M.abs(x) >= 10000 ? T.commas(x) : T.num(x);
  }
  var UN = {
    m: ['m', '\\text{m}'], cm: ['cm', '\\text{cm}'], mm: ['mm', '\\text{mm}'], nm: ['nm', '\\text{nm}'], s: ['s', '\\text{s}'], ms: ['m/s', '\\text{m/s}'],
    kg: ['kg', '\\text{kg}'], N: ['N', '\\text{N}'], J: ['J', '\\text{J}'], W: ['W', '\\text{W}'], Hz: ['Hz', '\\text{Hz}'], deg: ['°', '^\\circ'],
    Pa: ['Pa', '\\text{Pa}'], K: ['K', '\\text{K}'], A: ['A', '\\text{A}'], V: ['V', '\\text{V}'], C: ['C', '\\text{C}'], uC: ['μC', '\\mu\\text{C}'],
    mA: ['mA', '\\text{mA}'], eV: ['eV', '\\text{eV}'], Vm: ['V/m', '\\text{V/m}'], T: ['T', '\\text{T}'], mJ: ['mJ', '\\text{mJ}'], ns: ['ns', '\\text{ns}'],
    gm: ['g/m', '\\text{g/m}'], m3: ['m³', '\\text{m}^3'], Ohm: ['Ω', '\\Omega'], uF: ['μF', '\\mu\\text{F}'], us: ['μs', '\\mu\\text{s}'], ms2: ['m/s²', '\\text{m/s}^2'], none: ['', '']
  };
  function ut(k) { return (UN[k] || [k, '\\text{' + k + '}'])[1]; }
  function up(k) { return (UN[k] || [k])[0]; }
  function sp(k) { return k === 'deg' || k === 'none' ? '' : '\\ '; }
  function qx(x, k, n) { return fx(x, n) + sp(k) + ut(k); }
  function qg(x, k) { return gx(x) + sp(k) + ut(k); }
  function ans(x, rtol) { return { t: 'num', v: sfStr(x, 3), rtol: rtol || 0.02 }; }
  function pctAns(x) { return { t: 'num', v: sfStr(x, 3), rtol: 0.02, pct: true }; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function deg(r) { return r * 180 / PI; }
  function rad(d) { return d * PI / 180; }
  var G9 = '9.8\\ \\text{m/s}^2';

  // One exam-style problem: a scene (intro), a diagram, and linked parts { q, lab, a, u, steps }.
  // Level 1 keeps the first 2 parts, level 2 the first 3, level 3 all of them (2 to 4).
  function CT(ctx, o) {
    var n = M.min(o.parts.length, lv(ctx, 2, 3, 4)), ps = o.parts.slice(0, n);
    var q = '<p>' + o.intro + '</p><ol class="xc-qs">' + ps.map(function (p) { return '<li>' + p.q + '</li>'; }).join('') + '</ol>';
    var a = { t: 'multi', parts: ps.map(function (p, i) { var x = { label: (i + 1) + '.' + (p.lab ? ' ' + p.lab : ''), a: p.a }; if (p.u && p.u !== 'none') x.unit = up(p.u); return x; }) };
    var steps = [];
    ps.forEach(function (p, i) { p.steps.forEach(function (s, j) { steps.push(j ? s : '<b>' + (i + 1) + '.</b> ' + s); }); });
    var chk = Object.assign({ k: o.k, want: ps.map(function (p) { return p.a.t === 'mc' ? p.a.choices[0] : +p.a.v.replace('*10^', 'e'); }), ids: ps.map(function (p) { return p.id || ''; }) }, o.chk || {});
    var vo = Object.assign({ quiet: true }, o.vo || {});
    return { q: q, a: a, steps: steps, hint: o.hint, viz: { name: o.viz, opts: vo, label: o.vlabel || 'The diagram for this problem' }, chk: chk };
  }
  function num(id, q, lab, x, u, steps) { return { id: id, q: q, lab: lab, a: ans(x), u: u, steps: steps }; }
  function pct(id, q, lab, x, steps) { return { id: id, q: q, lab: lab, a: pctAns(x), u: 'none', steps: steps }; }
  function choice(id, q, right, wrongs, steps) { return { id: id, q: q, a: mc(right, wrongs), u: 'none', steps: steps }; }

  // ================================================================== MECHANICS
  G('exam.cliff-throw', function (R, ctx) {
    var L = ctx.level;
    var place = R.pick(['cliff', 'roof', 'bridge']);
    var W = { cliff: ['stone', 'the top of a sea cliff', 'the sea'], roof: ['ball', 'the flat roof of a tall building', 'the ground'], bridge: ['pebble', 'a high footbridge', 'the river'] }[place];
    var obj = W[0];
    var h = R.pick(lv(ctx, [20, 25, 30, 40, 45], [20, 24, 30, 36, 40, 45, 50, 60], [18, 24, 28, 35, 42, 50, 56, 65, 72]));
    var v0 = lv(ctx, R.int(6, 15), R.int(6, 18), R.int(8, 20));
    var ang = L === 1 ? 0 : R.pick(L === 2 ? [0, 0, 30, 37, 45] : [0, 30, 37, 45, 53, -20, -30]);
    var mode = ang === 0 && L >= 2 && R.coin() ? 'reverse' : 'fwd';
    var th = rad(ang), vx = v0 * M.cos(th), vy = v0 * M.sin(th);
    var t = (vy + M.sqrt(vy * vy + 2 * g0 * h)) / g0, X = vx * t, vl = M.sqrt(v0 * v0 + 2 * g0 * h), vyl = vy - g0 * t, phi = deg(M.atan(-vyl / vx));
    var D = 0;
    if (mode === 'reverse') { D = M.round(X); v0 = D / t; vx = v0; X = D; vl = M.sqrt(v0 * v0 + 2 * g0 * h); vyl = -g0 * t; phi = deg(M.atan(g0 * t / v0)); }
    var dir = ang === 0 ? 'horizontally' : ang > 0 ? 'at $' + ang + '^\\circ$ above the horizontal' : 'at $' + (-ang) + '^\\circ$ below the horizontal';
    var intro = mode === 'reverse'
      ? 'A ' + obj + ' is thrown horizontally from ' + W[1] + ', $' + qg(h, 'm') + '$ above ' + W[2] + '. It lands $' + qg(D, 'm') + '$ from the foot, measured along ' + W[2] + '. Ignore air resistance and take $g = ' + G9 + '$.'
      : 'A ' + obj + ' is thrown ' + dir + ' at $' + qg(v0, 'ms') + '$ from ' + W[1] + ', $' + qg(h, 'm') + '$ above ' + W[2] + '. Ignore air resistance and take $g = ' + G9 + '$.';
    var parts = [];
    var tSteps = ang === 0
      ? ['Sideways and up-down motions are independent. Vertically the ' + obj + ' starts with no speed and falls $h$: $h = \\tfrac{1}{2}gt^2$.',
        '$t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2(' + gx(h) + ')}{9.8}} = ' + qx(t, 's') + '$.']
      : ['Take up as positive. The vertical part of the launch velocity is $v_0\\sin\\theta = ' + gx(v0) + '\\sin(' + ang + '^\\circ) = ' + qx(vy, 'ms') + '$.',
        'It lands $' + gx(h) + '\\ \\text{m}$ below the start: $-' + gx(h) + ' = (' + fx(vy) + ')t - \\tfrac{1}{2}(9.8)t^2$.',
        'The positive root of $4.9t^2 - (' + fx(vy) + ')t - ' + gx(h) + ' = 0$ is $t = \\dfrac{v_0\\sin\\theta + \\sqrt{(v_0\\sin\\theta)^2 + 2gh}}{g} = ' + qx(t, 's') + '$.'];
    parts.push(num('t', 'How long is the ' + obj + ' in the air?', '$t =$', t, 's', tSteps));
    if (mode === 'reverse') {
      parts.push(num('v0', 'At what speed was it thrown?', '$v_0 =$', v0, 'ms',
        ['Sideways there is no force, so the horizontal speed stays $v_0$ the whole time: $x = v_0 t$.', '$v_0 = \\dfrac{x}{t} = \\dfrac{' + gx(D) + '}{' + fx(t) + '} = ' + qx(v0, 'ms') + '$.']));
    } else {
      parts.push(num('x', 'How far from the foot does it land?', '$x =$', X, 'm',
        ['The horizontal velocity never changes: $v_x = v_0\\cos\\theta = ' + qx(vx, 'ms') + '$.', '$x = v_x t = (' + fx(vx) + ')(' + fx(t) + ') = ' + qx(X, 'm') + '$.']));
    }
    parts.push(num('vl', 'With what speed does it reach ' + W[2] + '?', '$v =$', vl, 'ms',
      ['Energy is the quickest route: $\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}mv_0^2 + mgh$, and the mass cancels.',
        '$v = \\sqrt{v_0^2 + 2gh} = \\sqrt{' + fx(v0 * v0, 4) + ' + 2(9.8)(' + gx(h) + ')} = ' + qx(vl, 'ms') + '$.']));
    if (mode === 'reverse' || R.coin()) {
      parts.push(num('phi', 'At what angle below the horizontal is it moving as it lands?', '$\\varphi =$', phi, 'deg',
        ['Just before landing, $v_x = ' + qx(vx, 'ms') + '$ and the vertical speed is $|v_y| = ' + qx(-vyl, 'ms') + '$ downward.',
          '$\\tan\\varphi = \\dfrac{|v_y|}{v_x} = ' + fx(-vyl / vx) + '$, so $\\varphi = ' + qx(phi, 'deg') + '$.']));
    } else {
      parts.push(choice('same', 'Suppose instead the ' + obj + ' were thrown straight down, with the same speed. Compared with your answer to 3, its speed on arrival would be', 'the same', ['greater', 'smaller', 'greater, by the amount of the launch speed'],
        ['Energy depends only on the starting speed and the drop: $v = \\sqrt{v_0^2 + 2gh}$ has no angle in it.', 'So the arrival speed is the same; only its direction differs.']));
    }
    return CT(ctx, { k: 'cliff', intro: intro, parts: parts, viz: 'exam-cliff-throw', vo: { h: h, v: fix(v0), ang: ang, place: place, D: mode === 'reverse' ? D : 0 },
      hint: 'Treat the sideways motion (steady speed) and the vertical motion (acceleration g) separately; they share only the time.',
      chk: { h: h, v0: v0, ang: ang }, vlabel: 'A ' + obj + ' thrown from a height of ' + h + ' meters, flying along a curved path' });
  });

  G('exam.wall-shot', function (R, ctx) {
    var L = ctx.level, wv = R.pick([['soccer ball', 'kicked'], ['ball', 'thrown'], ['beanbag', 'tossed']]), obj = wv[0];
    var v0, ang, d, t, y, vy, tries = 0;
    do {
      v0 = R.int(lv(ctx, 12, 12, 14), lv(ctx, 18, 22, 26)); ang = R.pick([30, 35, 40, 45, 50, 53, 55, 60]);
      var Rng = v0 * v0 * M.sin(2 * rad(ang)) / g0; d = M.round(Rng * R.real(0.25, 0.85, 2));
      t = d / (v0 * M.cos(rad(ang))); y = v0 * M.sin(rad(ang)) * t - 0.5 * g0 * t * t; vy = v0 * M.sin(rad(ang)) - g0 * t;
      tries++;
    } while ((y < 1.5 || M.abs(vy) < 0.8 || d < 4) && tries < 50);
    var H = M.max(1, M.floor(y * R.real(0.5, 0.85, 2) * 2) / 2), hmax = M.pow(v0 * M.sin(rad(ang)), 2) / (2 * g0);
    var intro = 'A ' + obj + ' is ' + wv[1] + ' from level ground at $' + qg(v0, 'ms') + '$, at $' + ang + '^\\circ$ above the horizontal, toward a wall $' + qg(d, 'm') + '$ away and $' + qg(H, 'm') + '$ tall. Ignore air resistance and the size of the ' + obj + '; take $g = ' + G9 + '$.';
    var vx = v0 * M.cos(rad(ang)), vy0 = v0 * M.sin(rad(ang));
    var parts = [
      num('t', 'How long after launch does the ' + obj + ' reach the wall?', '$t =$', t, 's',
        ['Horizontally the speed is steady: $v_x = v_0\\cos\\theta = ' + gx(v0) + '\\cos(' + ang + '^\\circ) = ' + qx(vx, 'ms') + '$.', '$t = \\dfrac{d}{v_x} = \\dfrac{' + gx(d) + '}{' + fx(vx) + '} = ' + qx(t, 's') + '$.']),
      num('y', 'How high above the ground is the ' + obj + ' as it passes the wall?', '$y =$', y, 'm',
        ['Vertically: $y = (v_0\\sin\\theta)t - \\tfrac{1}{2}gt^2$ with $v_0\\sin\\theta = ' + qx(vy0, 'ms') + '$.', '$y = (' + fx(vy0) + ')(' + fx(t) + ') - 4.9(' + fx(t) + ')^2 = ' + qx(y, 'm') + '$, so it clears the $' + gx(H) + '\\ \\text{m}$ wall by $' + qx(y - H, 'm') + '$.']),
      choice('dir', 'As it passes over the wall, the ' + obj + ' is', vy > 0 ? 'still rising' : 'already falling', [vy > 0 ? 'already falling' : 'still rising', 'exactly at the top of its path', 'moving straight sideways at its greatest speed'],
        ['The vertical velocity at that moment is $v_y = v_0\\sin\\theta - gt = ' + fx(vy0) + ' - 9.8(' + fx(t) + ') = ' + qx(vy, 'ms') + '$.', vy > 0 ? 'It is positive, so the ' + obj + ' is still rising.' : 'It is negative, so the ' + obj + ' has passed its highest point and is falling.']),
      num('hmax', 'What is the greatest height the ' + obj + ' reaches?', '$H_{\\max} =$', hmax, 'm',
        ['At the top $v_y = 0$, so $(v_0\\sin\\theta)^2 = 2gH_{\\max}$.', '$H_{\\max} = \\dfrac{(' + fx(vy0) + ')^2}{2(9.8)} = ' + qx(hmax, 'm') + '$.'])
    ];
    if (L === 3 && R.coin()) parts[3] = num('land', 'How far beyond the wall does the ' + obj + ' land?', '$s =$', v0 * v0 * M.sin(2 * rad(ang)) / g0 - d, 'm',
      ['On level ground the range is $\\dfrac{v_0^2\\sin 2\\theta}{g} = \\dfrac{' + gx(v0 * v0) + '\\sin(' + (2 * ang) + '^\\circ)}{9.8} = ' + qx(v0 * v0 * M.sin(2 * rad(ang)) / g0, 'm') + '$.', 'Beyond the wall: $' + fx(v0 * v0 * M.sin(2 * rad(ang)) / g0) + ' - ' + gx(d) + ' = ' + qx(v0 * v0 * M.sin(2 * rad(ang)) / g0 - d, 'm') + '$.']);
    return CT(ctx, { k: 'wall', intro: intro, parts: parts, viz: 'exam-wall-shot', vo: { v: v0, ang: ang, d: d, H: H },
      hint: 'The horizontal motion tells you when it reaches the wall; the vertical motion tells you where it is then.', chk: { v0: v0, ang: ang, d: d, H: H }, vlabel: 'A ball launched at an angle toward a wall' });
  });

  G('exam.cart-collision', function (R, ctx) {
    var L = ctx.level, kind = R.pick(['carts', 'clay', 'rail']);
    var m1, m2, v, intro, A, B;
    if (kind === 'carts') { m1 = R.pick([0.4, 0.5, 0.6, 0.8, 1.0, 1.2]); m2 = R.pick([0.2, 0.3, 0.4, 0.6, 0.8, 1.0]); v = R.pick([2, 2.5, 3, 3.5, 4, 4.5, 5]); A = 'cart A'; B = 'cart B';
      intro = 'On a level track, cart A ($' + qg(m1, 'kg') + '$) rolls at $' + qg(v, 'ms') + '$ toward cart B ($' + qg(m2, 'kg') + '$), which is at rest. Magnets make them lock together, and the pair rolls on and up a smooth ramp.'; }
    else if (kind === 'clay') { m1 = R.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2]); m2 = R.pick([0.4, 0.5, 0.6, 0.8, 1.0]); v = R.pick([6, 8, 10, 12, 14, 15]); A = 'the clay'; B = 'the block';
      intro = 'A lump of clay ($' + qg(m1, 'kg') + '$) slides at $' + qg(v, 'ms') + '$ across smooth ice into a block of wood ($' + qg(m2, 'kg') + '$) at rest, and sticks. The block and clay then slide up a smooth, curved ramp.'; }
    else { m1 = R.pick([800, 1000, 1200, 1500]); m2 = R.pick([400, 600, 800, 1000, 1200]); v = R.pick([1.5, 2, 2.5, 3, 3.5]); A = 'car A'; B = 'car B';
      intro = 'At a train museum, a $' + qg(m1, 'kg') + '$ rail car A rolls at $' + qg(v, 'ms') + '$ into a $' + qg(m2, 'kg') + '$ car B at rest. They couple, and the pair coasts up a gentle slope.'; }
    intro += ' Ignore friction and take $g = ' + G9 + '$.';
    var Mt = m1 + m2, V = m1 * v / Mt, K0 = 0.5 * m1 * v * v, K1 = 0.5 * Mt * V * V, dK = K0 - K1, h = V * V / (2 * g0), fr = m2 / Mt;
    var frT = T.frac(M.round(m2 * 1000), M.round(Mt * 1000));
    var parts = [
      num('V', 'What is the speed of the pair just after the collision?', '$V =$', V, 'ms',
        ['During the collision, momentum is conserved (no outside sideways force): $m_1 v = (m_1 + m_2)V$.', '$V = \\dfrac{m_1 v}{m_1 + m_2} = \\dfrac{(' + gx(m1) + ')(' + gx(v) + ')}{' + gx(Mt) + '} = ' + qx(V, 'ms') + '$.']),
      num('dK', 'How much kinetic energy is lost in the collision?', '$\\Delta K =$', dK, 'J',
        ['Before: $K_0 = \\tfrac{1}{2}m_1v^2 = ' + qx(K0, 'J') + '$. After: $K_1 = \\tfrac{1}{2}(m_1 + m_2)V^2 = ' + qx(K1, 'J') + '$.', 'Lost (to heat, sound and bending): $\\Delta K = ' + fx(K0) + ' - ' + fx(K1) + ' = ' + qx(dK, 'J') + '$.']),
      num('h', 'How high above the track does the pair rise on the ramp?', '$h =$', h, 'm',
        ['After the collision no energy is lost: $\\tfrac{1}{2}(m_1 + m_2)V^2 = (m_1 + m_2)gh$.', '$h = \\dfrac{V^2}{2g} = \\dfrac{(' + fx(V) + ')^2}{2(9.8)} = ' + qx(h, 'm') + '$.', 'Using energy across the collision itself would give $v^2/2g = ' + qx(v * v / (2 * g0), 'm') + '$, which is too high: kinetic energy is lost when they stick.']),
      choice('frac', 'What fraction of the starting kinetic energy is lost?', '$' + frT + '$', ['$' + T.frac(M.round(m1 * 1000), M.round(Mt * 1000)) + '$', '$\\frac{1}{2}$', '$0$'],
        ['$\\dfrac{\\Delta K}{K_0} = 1 - \\dfrac{\\tfrac{1}{2}(m_1+m_2)V^2}{\\tfrac{1}{2}m_1v^2} = 1 - \\dfrac{m_1}{m_1+m_2} = \\dfrac{m_2}{m_1 + m_2}$.', '$\\dfrac{' + gx(m2) + '}{' + gx(Mt) + '} = ' + frT + '$. (Check: $' + fx(dK) + '/' + fx(K0) + ' = ' + fx(fr) + '$.)'])
    ];
    if (M.abs(fr - 0.5) < 1e-9) parts[3].a = mc('$\\frac{1}{2}$', ['$\\frac{1}{4}$', '$\\frac{3}{4}$', '$0$']);
    if (L === 3 && R.coin()) parts = [parts[0], parts[2], parts[1], parts[3]];
    return CT(ctx, { k: 'cart', intro: intro, parts: parts, viz: 'exam-cart-collision', vo: { m1: m1, m2: m2, v: v, kind: kind },
      hint: 'Use momentum for the collision and energy after it. Kinetic energy is not conserved when objects stick.', chk: { m1: m1, m2: m2, v: v }, vlabel: 'One cart hits another, they stick and roll up a ramp' });
  });

  G('exam.loop-track', function (R, ctx) {
    var L = ctx.level, r = R.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0]), m = R.pick([0.05, 0.1, 0.2, 0.25, 0.3, 0.5]);
    var k = R.pick(lv(ctx, [3, 3.5, 4], [2.8, 3, 3.2, 3.5, 4], [2.6, 2.8, 3, 3.4, 3.8, 4.5]));
    var h = fix(M.round(k * r * 100) / 100);
    var who = R.pick(['A small block', 'A marble (treat it as sliding, without rolling)', 'A toy car']);
    var intro = who + ' of mass $' + qg(m, 'kg') + '$ is released from rest at height $h = ' + qg(h, 'm') + '$ on a smooth track. At the bottom the track turns into a vertical loop of radius $r = ' + qg(r, 'm') + '$. Take $g = ' + G9 + '$ and ignore friction.';
    var v2 = 2 * g0 * (h - 2 * r), vt = M.sqrt(v2), N = m * v2 / r - m * g0, hmin = 2.5 * r, vb = M.sqrt(2 * g0 * h), Nb = m * vb * vb / r + m * g0;
    var parts = [
      num('vt', 'What is its speed at the top of the loop?', '$v =$', vt, 'ms',
        ['The top of the loop is $2r = ' + qg(2 * r, 'm') + '$ high. Energy: $mgh = mg(2r) + \\tfrac{1}{2}mv^2$.', '$v = \\sqrt{2g(h - 2r)} = \\sqrt{2(9.8)(' + fx(h - 2 * r) + ')} = ' + qx(vt, 'ms') + '$.']),
      num('N', 'How hard does the track push on it at the top of the loop?', '$N =$', N, 'N',
        ['At the top both the track\'s push $N$ and gravity point down, toward the center: $N + mg = \\dfrac{mv^2}{r}$.', '$N = \\dfrac{(' + gx(m) + ')(' + fx(v2) + ')}{' + gx(r) + '} - (' + gx(m) + ')(9.8) = ' + qx(N, 'N') + '$.']),
      num('hmin', 'From what lowest height could it be released and still go around the loop without leaving the track?', '$h_{\\min} =$', hmin, 'm',
        ['Just making it means $N = 0$ at the top, so $mg = mv^2/r$ and $v^2 = gr$.', 'Energy: $mgh_{\\min} = mg(2r) + \\tfrac{1}{2}m(gr)$, so $h_{\\min} = \\tfrac{5}{2}r = ' + qx(hmin, 'm') + '$.']),
      L === 3 && R.coin()
        ? num('Nb', 'How hard does the track push on it at the bottom of the loop (released from $h$)?', '$N_{\\text{b}} =$', Nb, 'N',
          ['At the bottom $v^2 = 2gh = ' + fx(vb * vb) + '\\ \\text{m}^2\\text{/s}^2$. The push is up, gravity down: $N_{\\text{b}} - mg = \\dfrac{mv^2}{r}$.', '$N_{\\text{b}} = (' + gx(m) + ')(9.8) + \\dfrac{(' + gx(m) + ')(' + fx(vb * vb) + ')}{' + gx(r) + '} = ' + qx(Nb, 'N') + '$.'])
        : choice('Nzero', 'If it were released from exactly $h_{\\min}$, the track\'s push at the top would be', 'zero: gravity alone supplies the centripetal force', ['equal to $mg$, pointing up', 'equal to $mg$, pointing down', 'equal to $2mg$'],
          ['At $h_{\\min}$ the speed at the top is just enough that $mg = mv^2/r$.', 'Nothing else is needed, so $N = 0$. Released any lower, it would leave the track before the top.'])
    ];
    return CT(ctx, { k: 'loop', intro: intro, parts: parts, viz: 'exam-loop-track', vo: { h: h, r: r },
      hint: 'Energy gives the speed; then at the top of the loop, add the forces pointing toward the center.', chk: { m: m, h: h, r: r }, vlabel: 'An object slides down a track and around a vertical loop' });
  });

  G('exam.conical-pendulum', function (R, ctx) {
    var L = ctx.level, len = R.pick([0.5, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0]), m = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), ang = R.pick([20, 25, 30, 35, 40, 45, 50, 55, 60]);
    var th = rad(ang), Tn = m * g0 / M.cos(th), r = len * M.sin(th), v = M.sqrt(g0 * r * M.tan(th)), P = 2 * PI * M.sqrt(len * M.cos(th) / g0);
    var wv = R.pick([['ball', 'A small ball on a string'], ['weight', 'A weight on a light cord'], ['toy plane', 'A toy plane on a string']]), who = wv[1], obj = wv[0];
    var intro = who + ' (mass $' + qg(m, 'kg') + '$, string length $' + qg(len, 'm') + '$) swings in a horizontal circle, so the string sweeps out a cone. The string makes a steady angle of $' + ang + '^\\circ$ with the vertical. Take $g = ' + G9 + '$.';
    var parts = [
      num('T', 'What is the tension in the string?', '$T =$', Tn, 'N',
        ['The ' + obj + ' does not rise or fall, so the tension\'s vertical part balances gravity: $T\\cos\\theta = mg$.', '$T = \\dfrac{mg}{\\cos\\theta} = \\dfrac{(' + gx(m) + ')(9.8)}{\\cos(' + ang + '^\\circ)} = ' + qx(Tn, 'N') + '$.']),
      num('v', 'How fast does the ' + obj + ' move?', '$v =$', v, 'ms',
        ['The radius of the circle is $r = L\\sin\\theta = ' + qx(r, 'm') + '$, not the string length.', 'The sideways part of the tension turns the ' + obj + ': $T\\sin\\theta = \\dfrac{mv^2}{r}$. Dividing by $T\\cos\\theta = mg$ gives $\\tan\\theta = \\dfrac{v^2}{gr}$.', '$v = \\sqrt{gr\\tan\\theta} = \\sqrt{(9.8)(' + fx(r) + ')\\tan(' + ang + '^\\circ)} = ' + qx(v, 'ms') + '$.']),
      num('P', 'How long does one trip around the circle take?', '$P =$', P, 's',
        ['$P = \\dfrac{2\\pi r}{v} = \\dfrac{2\\pi(' + fx(r) + ')}{' + fx(v) + '} = ' + qx(P, 's') + '$.', 'The same as $2\\pi\\sqrt{\\dfrac{L\\cos\\theta}{g}}$: it does not depend on the mass.']),
      choice('faster', 'The ' + obj + ' is made to go around faster. The angle of the string from the vertical', 'increases, and the tension increases', ['decreases, and the tension increases', 'stays the same; only the tension changes', 'increases, and the tension stays the same'],
        ['From $\\tan\\theta = v^2/(gr)$ with $r = L\\sin\\theta$: a larger $v$ needs a larger angle.', 'And $T = mg/\\cos\\theta$ grows as the angle grows.'])
    ];
    return CT(ctx, { k: 'cone', intro: intro, parts: parts, viz: 'exam-conical-pendulum', vo: { L: len, ang: ang },
      hint: 'Split the tension into a vertical part (balances gravity) and a horizontal part (points to the circle\'s center).', chk: { m: m, L: len, ang: ang }, vlabel: 'A ball on a string swinging in a horizontal circle' });
  });

  G('exam.spring-oscillator', function (R, ctx) {
    var L = ctx.level, m = R.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1.0, 1.5, 2.0]), k = R.pick([20, 32, 40, 50, 80, 100, 125, 200]), w = M.sqrt(k / m), Tp = 2 * PI / w;
    var mode = L >= 2 && R.chance(0.4) ? 'kick' : 'pull';
    var A, v0, intro;
    if (mode === 'pull') { A = R.pick([0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15]); v0 = A * w;
      intro = 'A block of mass $' + qg(m, 'kg') + '$ rests on a smooth floor, fixed to a wall by a spring of spring constant $' + qg(k, 'N') + '\\text{/m}$. The block is pulled $' + qg(A * 100, 'cm') + '$ from its rest position and let go.'; }
    else { v0 = R.pick([0.4, 0.5, 0.6, 0.8, 1.0, 1.2]); A = v0 / w;
      intro = 'A block of mass $' + qg(m, 'kg') + '$ rests on a smooth floor, fixed to a wall by a spring of spring constant $' + qg(k, 'N') + '\\text{/m}$. A quick tap gives it a speed of $' + qg(v0, 'ms') + '$ at its rest position.'; }
    var half = R.coin(), tq = half ? Tp / 6 : Tp / 4;
    var parts = [num('T', 'What is the period of the oscillation?', '$T =$', Tp, 's',
      ['$T = 2\\pi\\sqrt{\\dfrac{m}{k}} = 2\\pi\\sqrt{\\dfrac{' + gx(m) + '}{' + gx(k) + '}} = ' + qx(Tp, 's') + '$.'])];
    if (mode === 'pull') parts.push(num('vmax', 'What is the block\'s greatest speed?', '$v_{\\max} =$', v0, 'ms',
      ['Energy: all the spring energy $\\tfrac{1}{2}kA^2$ turns into kinetic energy at the rest position, so $v_{\\max} = A\\sqrt{k/m} = A\\omega$.', '$\\omega = \\sqrt{' + gx(k) + '/' + gx(m) + '} = ' + fx(w) + '\\ \\text{rad/s}$, so $v_{\\max} = (' + gx(A) + ')(' + fx(w) + ') = ' + qx(v0, 'ms') + '$.']));
    else parts.push(num('A', 'How far from the rest position does the block get (the amplitude)?', '$A =$', A * 100, 'cm',
      ['The tap\'s kinetic energy all becomes spring energy at the turning point: $\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}kA^2$.', '$A = v\\sqrt{\\dfrac{m}{k}} = (' + gx(v0) + ')\\sqrt{\\dfrac{' + gx(m) + '}{' + gx(k) + '}} = ' + fx(A) + '\\ \\text{m} = ' + qx(A * 100, 'cm') + '$.']));
    var aMax = k * A / m;
    parts.push(L === 3 && R.coin()
      ? num('amax', 'What is the block\'s greatest acceleration?', '$a_{\\max} =$', aMax, 'ms2',
        ['The force is largest at the turning points, $kA$, so $a_{\\max} = \\dfrac{kA}{m} = \\dfrac{(' + gx(k) + ')(' + fx(A) + ')}{' + gx(m) + '} = ' + fx(aMax) + '\\ \\text{m/s}^2$.'])
      : mode === 'pull'
        ? num('tq', half ? 'How long after release is the block first halfway back to its rest position?' : 'How long after release does the block first pass its rest position?', '$t =$', tq, 's',
          half ? ['The position is $x = A\\cos(\\omega t)$. Halfway means $\\cos(\\omega t) = \\tfrac{1}{2}$, so $\\omega t = \\tfrac{\\pi}{3}$: one sixth of a cycle.', '$t = \\dfrac{T}{6} = \\dfrac{' + fx(Tp) + '}{6} = ' + qx(tq, 's') + '$. (Not $T/8$: the block moves slowly near the turning point.)']
            : ['From a turning point to the rest position is a quarter of a cycle.', '$t = \\dfrac{T}{4} = \\dfrac{' + fx(Tp) + '}{4} = ' + qx(tq, 's') + '$.'])
        : num('tq', 'How long after the tap does the block first stop for an instant?', '$t =$', Tp / 4, 's',
          ['From the rest position out to a turning point is a quarter of a cycle.', '$t = \\dfrac{T}{4} = \\dfrac{' + fx(Tp) + '}{4} = ' + qx(Tp / 4, 's') + '$.']));
    parts.push(choice('amp', mode === 'pull' ? 'The block is pulled out twice as far and let go. The period' : 'The tap is twice as hard, so the block starts twice as fast. The period', 'stays the same', ['doubles', 'grows by a factor of $\\sqrt{2}$', 'halves'],
      ['$T = 2\\pi\\sqrt{m/k}$ has no amplitude in it.', 'A bigger swing is covered at a higher speed, in the same time.']));
    return CT(ctx, { k: 'spring', intro: intro, parts: parts, viz: 'exam-spring-oscillator', vo: { m: m, k: k, A: fix(A) },
      hint: 'Use $T = 2\\pi\\sqrt{m/k}$, and energy between the turning points and the rest position.', chk: { m: m, kk: k, A: A, v0: v0, mode: mode }, vlabel: 'A block on a spring oscillating back and forth, with a graph of position against time' });
  });

  G('exam.rough-ramp-spring', function (R, ctx) {
    var L = ctx.level, m = R.pick([0.5, 1.0, 1.5, 2.0, 2.5, 3.0]), ang = R.pick([25, 30, 35, 37, 40]), mu = R.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
    var len = R.pick([1.5, 2.0, 2.5, 3.0, 4.0]), k = R.pick([200, 300, 400, 500, 600, 800]);
    var th = rad(ang), Wf = mu * m * g0 * M.cos(th) * len, Kb = m * g0 * len * M.sin(th) - Wf, v = M.sqrt(2 * Kb / m), x = v * M.sqrt(m / k);
    var a = g0 * (M.sin(th) - mu * M.cos(th));
    var intro = 'A $' + qg(m, 'kg') + '$ crate starts from rest and slides $' + qg(len, 'm') + '$ down a ramp tilted at $' + ang + '^\\circ$. The coefficient of kinetic friction on the ramp is $' + gx(mu) + '$. At the bottom the crate moves onto a smooth, level floor and runs into a spring ($k = ' + qg(k, 'N') + '\\text{/m}$). Take $g = ' + G9 + '$.';
    var parts = [
      num('Wf', 'How much work does friction do on the crate on the ramp? Give its size.', '$|W_f| =$', Wf, 'J',
        ['On the ramp the normal force is $mg\\cos\\theta$, not $mg$, so the friction force is $\\mu mg\\cos\\theta = ' + qx(mu * m * g0 * M.cos(th), 'N') + '$.', '$|W_f| = \\mu mg\\cos\\theta \\cdot L = (' + fx(mu * m * g0 * M.cos(th)) + ')(' + gx(len) + ') = ' + qx(Wf, 'J') + '$.']),
      num('v', 'How fast is the crate moving at the bottom of the ramp?', '$v =$', v, 'ms',
        ['It drops $L\\sin\\theta = ' + qx(len * M.sin(th), 'm') + '$, losing $mgL\\sin\\theta = ' + qx(m * g0 * len * M.sin(th), 'J') + '$ of potential energy.', 'Kinetic energy at the bottom: $\\tfrac{1}{2}mv^2 = ' + fx(m * g0 * len * M.sin(th)) + ' - ' + fx(Wf) + ' = ' + qx(Kb, 'J') + '$.', '$v = \\sqrt{\\dfrac{2(' + fx(Kb) + ')}{' + gx(m) + '}} = ' + qx(v, 'ms') + '$.']),
      num('x', 'How far does the crate squeeze the spring?', '$x =$', x * 100, 'cm',
        ['On the smooth floor all the kinetic energy goes into the spring: $\\tfrac{1}{2}kx^2 = ' + qx(Kb, 'J') + '$.', '$x = \\sqrt{\\dfrac{2(' + fx(Kb) + ')}{' + gx(k) + '}} = ' + fx(x) + '\\ \\text{m} = ' + qx(x * 100, 'cm') + '$.']),
      choice('back', 'The spring pushes the crate back, and it slides up the ramp. It comes to rest', 'lower than where it started', ['exactly where it started', 'higher than where it started', 'at the bottom of the ramp: it cannot climb'],
        ['Friction takes energy on the way up as well as on the way down.', 'With less energy than it had at the start, it stops lower. (It does climb: it reaches the bottom of the ramp with $' + qx(Kb, 'J') + '$.)'])
    ];
    if (L === 3 && R.coin()) parts.unshift(num('a', 'What is the crate\'s acceleration down the ramp?', '$a =$', a, 'ms2',
      ['Along the ramp: $ma = mg\\sin\\theta - \\mu mg\\cos\\theta$.', '$a = 9.8(\\sin ' + ang + '^\\circ - ' + gx(mu) + '\\cos ' + ang + '^\\circ) = ' + fx(a) + '\\ \\text{m/s}^2$.']));
    if (parts[0].id === 'a') parts.splice(1, 1);
    return CT(ctx, { k: 'ramp', intro: intro, parts: parts, viz: 'exam-rough-ramp-spring', vo: { ang: ang, L: len, mu: mu },
      hint: 'Energy at the bottom = potential energy lost − work done by friction. Friction uses the normal force $mg\\cos\\theta$.', chk: { m: m, ang: ang, mu: mu, L: len, kk: k }, vlabel: 'A crate slides down a rough ramp and into a spring' });
  });

  // ================================================================== HEAT AND GASES
  G('exam.piston-gas', function (R, ctx) {
    var L = ctx.level, A = R.pick([0.01, 0.02, 0.025, 0.04, 0.05]), Mp = R.pick([10, 20, 25, 30, 40, 50]), h1 = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
    var T1 = R.pick([280, 290, 300]), dT = R.pick([30, 60, 75, 90, 120, 150]), T2 = T1 + dT, p0 = 1.0e5;
    var p = p0 + Mp * g0 / A, h2 = h1 * T2 / T1, Wk = p * A * (h2 - h1), Qh = 2.5 * Wk;
    var intro = 'A vertical cylinder holds an ideal monatomic gas under a piston of mass $' + qg(Mp, 'kg') + '$ and area $' + qg(A, 'm') + '^2$ that slides without friction. The air outside is at $p_0 = 1.0 \\times 10^{5}\\ \\text{Pa}$. At first the gas is at $' + qg(T1, 'K') + '$ and the piston sits $' + qg(h1 * 100, 'cm') + '$ above the bottom. The gas is then warmed slowly to $' + qg(T2, 'K') + '$. Take $g = ' + G9 + '$.';
    var parts = [
      num('p', 'What is the pressure of the gas?', '$p =$', p, 'Pa',
        ['The piston is balanced: the gas pushes up with $pA$; the outside air ($p_0A$) and gravity ($Mg$) push down.', '$p = p_0 + \\dfrac{Mg}{A} = 1.0 \\times 10^{5} + \\dfrac{(' + gx(Mp) + ')(9.8)}{' + gx(A) + '} = ' + qx(p, 'Pa') + '$.']),
      num('h2', 'How high is the piston when the gas reaches ' + T2 + ' K?', '$h_2 =$', h2 * 100, 'cm',
        ['The piston keeps the same balance, so the pressure stays the same. At constant pressure $V \\propto T$, and $V = Ah$.', '$h_2 = h_1\\dfrac{T_2}{T_1} = (' + gx(h1 * 100) + ')\\dfrac{' + T2 + '}{' + T1 + '} = ' + qx(h2 * 100, 'cm') + '$.']),
      num('W', 'How much work does the gas do on the piston while it warms?', '$W =$', Wk, 'J',
        ['At constant pressure $W = p\\,\\Delta V = pA(h_2 - h_1)$.', '$W = (' + fx(p) + ')(' + gx(A) + ')(' + fx(h2 - h1) + ') = ' + qx(Wk, 'J') + '$.']),
      num('Q', 'How much heat does the gas take in?', '$Q =$', Qh, 'J',
        ['First law: $Q = \\Delta U + W$. For a monatomic gas $\\Delta U = \\tfrac{3}{2}nR\\,\\Delta T = \\tfrac{3}{2}p\\,\\Delta V$ at constant pressure.', 'So $Q = \\tfrac{3}{2}W + W = \\tfrac{5}{2}W = \\tfrac{5}{2}(' + fx(Wk) + ') = ' + qx(Qh, 'J') + '$.'])
    ];
    return CT(ctx, { k: 'piston', intro: intro, parts: parts, viz: 'exam-piston-gas', vo: { T1: T1, T2: T2 },
      hint: 'Start with a force balance on the piston. Remember the air pressure on top.', chk: { A: A, M: Mp, h1: h1, T1: T1, T2: T2 }, vlabel: 'Gas in a cylinder under a heavy piston, being warmed' });
  });

  G('exam.pv-cycle', function (R, ctx) {
    var L = ctx.level, shape = R.pick(['rect', 'tri']);
    var p1 = R.pick([1, 1.5, 2]) * 1e5, p2 = p1 * R.pick([2, 2.5, 3]), V1 = R.pick([1, 2, 3, 4]) * 1e-3, V2 = V1 * R.pick([2, 3]);
    var pT = function (x) { return fix(x / 1e5) + ' \\times 10^{5}\\ \\text{Pa}'; }, vT = function (x) { return fix(x * 1e3) + ' \\times 10^{-3}\\ \\text{m}^3'; };
    var dp = p2 - p1, dV = V2 - V1, parts, intro;
    if (shape === 'rect') {
      var W = dp * dV, Qab = 1.5 * V1 * dp, Qbc = 2.5 * p2 * dV, Qin = Qab + Qbc, e = W / Qin;
      intro = 'An ideal monatomic gas runs through the cycle A → B → C → D → A shown. A to B: the pressure rises from $' + pT(p1) + '$ to $' + pT(p2) + '$ at a fixed volume of $' + vT(V1) + '$. B to C: it expands at constant pressure to $' + vT(V2) + '$. C to D: the pressure falls back at constant volume. D to A: it is pressed back to A at constant pressure.';
      parts = [
        num('W', 'How much net work does the gas do in one cycle?', '$W =$', W, 'J',
          ['The net work is the area inside the loop on the $p$–$V$ graph: a rectangle.', '$W = (p_2 - p_1)(V_2 - V_1) = (' + fx(dp) + ')(' + fx(dV) + ') = ' + qx(W, 'J') + '$.']),
        num('Qin', 'How much heat does the gas take in during one cycle (on A → B and B → C)?', '$Q_{\\text{in}} =$', Qin, 'J',
          ['A → B (constant volume): $Q = \\Delta U = \\tfrac{3}{2}V\\,\\Delta p = \\tfrac{3}{2}(' + fx(V1) + ')(' + fx(dp) + ') = ' + qx(Qab, 'J') + '$.', 'B → C (constant pressure): $Q = \\tfrac{5}{2}p\\,\\Delta V = \\tfrac{5}{2}(' + fx(p2) + ')(' + fx(dV) + ') = ' + qx(Qbc, 'J') + '$.', '$Q_{\\text{in}} = ' + fx(Qab) + ' + ' + fx(Qbc) + ' = ' + qx(Qin, 'J') + '$. (On C → D and D → A heat leaves the gas.)']),
        pct('e', 'What is the efficiency of this engine, as a percentage?', '$e =$', e * 100,
          ['$e = \\dfrac{W}{Q_{\\text{in}}} = \\dfrac{' + fx(W) + '}{' + fx(Qin) + '} = ' + fx(e) + '$, which is $' + fx(e * 100) + '\\%$.', 'Divide by the heat taken in only, not by all the heat that crosses the boundary.']),
        choice('hot', 'At which corner of the cycle is the gas hottest?', 'C', ['B', 'D', 'A'],
          ['For an ideal gas $T = \\dfrac{pV}{nR}$, so the temperature is highest where $pV$ is largest.', 'C has both the higher pressure and the larger volume.'])
      ];
    } else {
      var Wt = 0.5 * dp * dV, Qab2 = 1.5 * (p2 * V2 - p1 * V1) + 0.5 * (p1 + p2) * dV, et = Wt / Qab2;
      intro = 'An ideal monatomic gas runs through a triangular cycle. A to B: a straight line on the $p$–$V$ graph from A ($' + pT(p1) + '$, $' + vT(V1) + '$) to B ($' + pT(p2) + '$, $' + vT(V2) + '$). B to C: the pressure falls back to $' + pT(p1) + '$ at constant volume. C to A: the gas is pressed back to A at constant pressure.';
      parts = [
        num('W', 'How much net work does the gas do in one cycle?', '$W =$', Wt, 'J',
          ['The net work is the area of the triangle on the $p$–$V$ graph.', '$W = \\tfrac{1}{2}(p_2 - p_1)(V_2 - V_1) = \\tfrac{1}{2}(' + fx(dp) + ')(' + fx(dV) + ') = ' + qx(Wt, 'J') + '$.']),
        num('Qab', 'How much heat does the gas take in on A → B?', '$Q_{AB} =$', Qab2, 'J',
          ['$\\Delta U = \\tfrac{3}{2}(p_BV_B - p_AV_A) = \\tfrac{3}{2}(' + fx(p2 * V2) + ' - ' + fx(p1 * V1) + ') = ' + qx(1.5 * (p2 * V2 - p1 * V1), 'J') + '$.', 'Work on A → B is the trapezoid under the line: $\\tfrac{1}{2}(p_1 + p_2)(V_2 - V_1) = ' + qx(0.5 * (p1 + p2) * dV, 'J') + '$.', '$Q_{AB} = \\Delta U + W_{AB} = ' + qx(Qab2, 'J') + '$.']),
        pct('e', 'Heat flows in only on A → B. What is the efficiency, as a percentage?', '$e =$', et * 100,
          ['$e = \\dfrac{W}{Q_{AB}} = \\dfrac{' + fx(Wt) + '}{' + fx(Qab2) + '} = ' + fx(et) + '$, which is $' + fx(et * 100) + '\\%$.']),
        choice('legs', 'On which legs does heat leave the gas?', 'B → C and C → A', ['A → B only', 'B → C only', 'C → A only'],
          ['B → C: constant volume, the pressure (so the temperature) falls, so $Q = \\Delta U < 0$.', 'C → A: compressed at constant pressure, $T$ falls and work is done on the gas, so $Q = \\tfrac{5}{2}p\\,\\Delta V < 0$.'])
      ];
    }
    return CT(ctx, { k: 'pv', intro: intro, parts: parts, viz: 'exam-pv-cycle', vo: { shape: shape, p1: p1, p2: p2, V1: V1, V2: V2 },
      hint: 'The work is the area of the loop. For a monatomic gas, $U = \\tfrac{3}{2}pV$, so heat at constant volume is $\\tfrac{3}{2}V\\Delta p$ and at constant pressure $\\tfrac{5}{2}p\\Delta V$.', chk: { shape: shape, p1: p1, p2: p2, V1: V1, V2: V2 }, vlabel: 'A pressure–volume graph of a gas cycle' });
  });

  // ================================================================== WAVES AND SOUND
  G('exam.two-speakers', function (R, ctx) {
    var L = ctx.level, tri, sc, s, x, L2, dl, v = 340, loud, mm, f, tries = 0;
    do {
      tri = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20]]); sc = R.pick(tri[2] > 15 ? [0.2, 0.25, 0.4, 0.5] : [0.4, 0.5, 0.8, 1, 1.2, 1.5, 2]);
      s = fix(tri[0] * sc); x = fix(tri[1] * sc); L2 = fix(tri[2] * sc); dl = fix(L2 - x);
      loud = R.coin(); mm = R.int(1, 3); f = fix(loud ? mm * v / dl : (mm + 0.5) * v / dl); tries++;
    } while ((f !== M.round(f) || s > 8 || x > 16) && tries < 80);
    if (f !== M.round(f)) { s = 3; x = 4; L2 = 5; dl = 1; loud = true; mm = 2; f = 680; }
    var lam = v / f, ratio = dl / lam, fq = v / (2 * dl);
    var intro = 'Two speakers, S<sub>1</sub> and S<sub>2</sub>, stand $' + qg(s, 'm') + '$ apart and play the same note in step. A listener stands at P, $' + qg(x, 'm') + '$ straight out from S<sub>1</sub>, along a line at right angles to the line joining the speakers. The speed of sound is $' + v + '\\ \\text{m/s}$.';
    var parts = [
      num('d', 'How much farther is P from S<sub>2</sub> than from S<sub>1</sub>?', '$\\Delta =$', dl, 'm',
        ['$PS_2 = \\sqrt{' + gx(x) + '^2 + ' + gx(s) + '^2} = ' + qg(L2, 'm') + '$ (a right triangle).', '$\\Delta = ' + gx(L2) + ' - ' + gx(x) + ' = ' + qg(dl, 'm') + '$.']),
      num('lam', 'The speakers play at $' + qg(f, 'Hz') + '$. What is the wavelength?', '$\\lambda =$', lam, 'm',
        ['$\\lambda = \\dfrac{v}{f} = \\dfrac{' + v + '}{' + gx(f) + '} = ' + qx(lam, 'm') + '$.']),
      choice('lq', 'At that frequency, what does the listener at P hear?', loud ? 'a loud sound: the waves arrive in step' : 'a quiet sound: the waves arrive out of step', [loud ? 'a quiet sound: the waves arrive out of step' : 'a loud sound: the waves arrive in step', 'a sound of middling loudness: the waves are a quarter cycle apart', 'no sound at all from S<sub>2</sub>'],
        ['Compare the path difference with the wavelength: $\\dfrac{\\Delta}{\\lambda} = \\dfrac{' + gx(dl) + '}{' + fx(lam) + '} = ' + fx(ratio) + '$.', loud ? 'A whole number of wavelengths: crest meets crest, so the sound is loud.' : 'A whole number plus one half: crest meets trough, so the sound is quiet.']),
      num('fq', 'What is the lowest frequency at which P is a quiet spot?', '$f_{\\min} =$', fq, 'Hz',
        ['Quiet when $\\Delta = \\tfrac{1}{2}\\lambda, \\tfrac{3}{2}\\lambda, \\dots$ The lowest frequency means the longest wavelength: $\\lambda = 2\\Delta = ' + qg(2 * dl, 'm') + '$.', '$f = \\dfrac{v}{2\\Delta} = \\dfrac{' + v + '}{' + gx(2 * dl) + '} = ' + qx(fq, 'Hz') + '$.'])
    ];
    return CT(ctx, { k: 'spk', intro: intro, parts: parts, viz: 'exam-two-speakers', vo: { s: s, x: x },
      hint: 'Only the difference in the two distances matters. Whole wavelengths: loud. Whole plus a half: quiet.', chk: { s: s, x: x, f: f, v: v }, vlabel: 'Two speakers sending out circular sound waves toward a listener' });
  });

  G('exam.doppler-wall', function (R, ctx) {
    var L = ctx.level, v = 340, f = R.pick([400, 450, 500, 600, 680, 720, 800]), u = R.pick([10, 12, 15, 17, 20, 25]);
    var who = R.pick(['An ambulance', 'A fire truck', 'A police car']), mode = R.coin() ? 'behind' : 'driver';
    var fw = f * v / (v - u), fd = f * v / (v + u), fe = f * (v + u) / (v - u), lamF = (v - u) / f;
    var intro = who + ' drives at $' + qg(u, 'ms') + '$ straight toward a large, flat cliff face, its siren sounding at $' + qg(f, 'Hz') + '$. ' + (mode === 'behind' ? 'A hiker stands still on the road far behind it.' : 'The driver hears the echo from the cliff.') + ' The speed of sound is $' + v + '\\ \\text{m/s}$ and the air is still.';
    var pw = num('fw', 'What frequency reaches the cliff?', '$f_{\\text{cliff}} =$', fw, 'Hz',
      ['The source moves toward a still listener, so the waves ahead are squeezed: $f\' = f\\dfrac{v}{v - u}$.', '$f_{\\text{cliff}} = ' + gx(f) + '\\cdot\\dfrac{' + v + '}{' + v + ' - ' + gx(u) + '} = ' + qx(fw, 'Hz') + '$.']);
    var parts;
    if (mode === 'behind') parts = [pw,
      num('fd', 'What frequency does the hiker hear coming straight from the siren?', '$f_{\\text{direct}} =$', fd, 'Hz',
        ['The source moves away from the hiker: $f\' = f\\dfrac{v}{v + u}$.', '$f_{\\text{direct}} = ' + gx(f) + '\\cdot\\dfrac{' + v + '}{' + (v + u) + '} = ' + qx(fd, 'Hz') + '$.']),
      choice('fr', 'The cliff reflects the sound back toward the hiker. What frequency does the hiker hear in the echo?', 'the same frequency that reaches the cliff', ['the siren\'s own frequency, ' + f + ' Hz', 'the same frequency as the direct sound', 'a frequency lower than the direct sound'],
        ['The cliff and the hiker are both at rest, so the cliff sends out exactly the frequency it receives, $' + qx(fw, 'Hz') + '$.', 'Nothing moves between the cliff and the hiker to change it.']),
      num('beat', 'How many beats per second does the hiker hear?', '$f_{\\text{beat}} =$', fw - fd, 'Hz',
        ['Two close frequencies beat at their difference: $f_{\\text{beat}} = f_{\\text{cliff}} - f_{\\text{direct}}$.', '$f_{\\text{beat}} = ' + fx(fw, 4) + ' - ' + fx(fd, 4) + ' = ' + qx(fw - fd, 'Hz') + '$.'])];
    else parts = [pw,
      num('lam', 'What is the wavelength of the sound in front of the vehicle?', '$\\lambda =$', lamF, 'm',
        ['Each wave is sent out from a spot $u/f$ closer to the cliff than the last, so the waves ahead are squeezed: $\\lambda = \\dfrac{v - u}{f}$.', '$\\lambda = \\dfrac{' + v + ' - ' + gx(u) + '}{' + gx(f) + '} = ' + qx(lamF, 'm') + '$ (still air: $v/\\lambda$ is the frequency at the cliff).']),
      num('fe', 'What frequency does the driver hear in the echo?', '$f_{\\text{echo}} =$', fe, 'Hz',
        ['The cliff re-sends $f_{\\text{cliff}}$ as a still source. The driver moves toward it: $f\' = f_{\\text{cliff}}\\dfrac{v + u}{v}$.', '$f_{\\text{echo}} = f\\dfrac{v + u}{v - u} = ' + gx(f) + '\\cdot\\dfrac{' + (v + u) + '}{' + (v - u) + '} = ' + qx(fe, 'Hz') + '$.']),
      num('beat', 'The driver hears the siren itself at ' + f + ' Hz. How many beats per second does the driver hear?', '$f_{\\text{beat}} =$', fe - f, 'Hz',
        ['The siren moves with the driver, so it sounds at $' + qg(f, 'Hz') + '$ to the driver.', '$f_{\\text{beat}} = ' + fx(fe, 4) + ' - ' + gx(f) + ' = ' + qx(fe - f, 'Hz') + '$.'])];
    return CT(ctx, { k: 'dop', intro: intro, parts: parts, viz: 'exam-doppler-wall', vo: { u: u, mode: mode },
      hint: 'Treat the wall as a listener first, then as a still source that sends out what it received.', chk: { f: f, u: u, v: v, mode: mode }, vlabel: 'A vehicle with a siren moving toward a cliff, its sound waves bunched up ahead' });
  });

  G('exam.string-pulley', function (R, ctx) {
    var L = ctx.level, mu = R.pick([1, 1.5, 2, 2.5, 3, 4, 5]) * 1e-3, Mh = R.pick([0.5, 0.8, 1.0, 1.2, 1.5, 2.0]), len = R.pick([0.8, 1.0, 1.2, 1.5, 1.6, 2.0]);
    var n = R.int(2, 5), n2 = n + (R.coin() || n === 2 ? 1 : -1);
    var Tn = Mh * g0, v = M.sqrt(Tn / mu), f = n * v / (2 * len), M2 = Mh * (n * n) / (n2 * n2), lam = 2 * len / n;
    var intro = 'One end of a string is tied to a vibrator; the string runs level for $' + qg(len, 'm') + '$ to a pulley and then hangs down, holding a $' + qg(Mh, 'kg') + '$ mass. The string has a mass of $' + qg(mu * 1000, 'gm') + '$ (grams per meter). The vibrator\'s frequency is adjusted until the level part of the string shows a steady pattern of $' + n + '$ loops. Take $g = ' + G9 + '$.';
    var parts = [
      num('v', 'What is the speed of waves on the string?', '$v =$', v, 'ms',
        ['The tension is the hanging weight: $T = Mg = ' + qx(Tn, 'N') + '$. And $\\mu = ' + gx(mu) + '\\ \\text{kg/m}$.', '$v = \\sqrt{\\dfrac{T}{\\mu}} = \\sqrt{\\dfrac{' + fx(Tn) + '}{' + gx(mu) + '}} = ' + qx(v, 'ms') + '$.']),
      num('f', 'What is the vibrator\'s frequency?', '$f =$', f, 'Hz',
        ['Each loop is half a wavelength, so $L = ' + n + '\\cdot\\tfrac{\\lambda}{2}$ and $\\lambda = ' + qx(lam, 'm') + '$.', '$f = \\dfrac{v}{\\lambda} = \\dfrac{' + fx(v) + '}{' + fx(lam) + '} = ' + qx(f, 'Hz') + '$.']),
      num('M2', 'Keeping that frequency, what hanging mass would give ' + n2 + ' loops instead?', '$M\' =$', M2, 'kg',
        [n2 + ' loops need $\\lambda\' = \\dfrac{2L}{' + n2 + '}$, so $v\' = f\\lambda\' = ' + qx(2 * len * f / n2, 'ms') + '$.', 'Since $v^2 = Mg/\\mu$, the mass goes as $v^2$: $M\' = M\\left(\\dfrac{' + n + '}{' + n2 + '}\\right)^2 = ' + qx(M2, 'kg') + '$.']),
      choice('x4', 'With the first setup, the hanging mass is made 4 times larger, at the same frequency. The wavelength on the string', 'doubles', ['becomes 4 times longer', 'halves', 'stays the same'],
        ['$v = \\sqrt{T/\\mu}$: 4 times the tension doubles the speed.', 'At a fixed frequency $\\lambda = v/f$ doubles too. (The string then shows half as many loops, if that is a whole number.)'])
    ];
    return CT(ctx, { k: 'str', intro: intro, parts: parts, viz: 'exam-string-pulley', vo: { n: n },
      hint: 'The tension is the weight $Mg$. Then $v = \\sqrt{T/\\mu}$, and each loop is half a wavelength.', chk: { mu: mu, M: Mh, L: len, n: n, n2: n2 }, vlabel: 'A string from a vibrator over a pulley to a hanging mass, vibrating in loops' });
  });

  // ================================================================== OPTICS
  function divisorsIn(n, lo, hi) { var o = []; for (var k = 1; k <= n; k++) if (n % k === 0 && k >= lo && k <= hi) o.push(k); return o; }
  G('exam.convex-lens', function (R, ctx) {
    var L = ctx.level, f = R.pick([10, 12, 15, 18, 20, 24, 30]), virt = L >= 2 && R.chance(0.3);
    var ks = divisorsIn(f * f, M.ceil(f / 3), 2 * f).filter(function (k) { return k !== f; }), kk = R.pick(ks.length ? ks : [f]);
    var dob = virt ? R.pick([0.4, 0.5, 0.6, 0.75]) * f : f + kk, di = 1 / (1 / f - 1 / dob), ho = R.pick([1, 1.5, 2, 2.5, 3, 4]), hi = ho * M.abs(di) / dob;
    dob = fix(dob); di = fix(di);
    var parts, intro;
    if (!virt) {
      var d2 = fix(dob + R.pick([5, 10, 15, 20])), di2 = 1 / (1 / f - 1 / d2), shift = di - di2;
      intro = 'A candle flame $' + qg(ho, 'cm') + '$ tall stands $' + qg(dob, 'cm') + '$ in front of a convex lens of focal length $' + qg(f, 'cm') + '$. A screen on the far side is moved until a sharp image appears on it.';
      parts = [
        num('di', 'How far from the lens is the screen?', '$d_i =$', di, 'cm',
          ['Lens equation: $\\dfrac{1}{d_o} + \\dfrac{1}{d_i} = \\dfrac{1}{f}$.', '$\\dfrac{1}{d_i} = \\dfrac{1}{' + gx(f) + '} - \\dfrac{1}{' + gx(dob) + '}$, so $d_i = ' + qx(di, 'cm') + '$.']),
        num('hi', 'How tall is the image of the flame?', '$h_i =$', hi, 'cm',
          ['The size ratio is $\\dfrac{d_i}{d_o} = \\dfrac{' + fx(di) + '}{' + gx(dob) + '} = ' + fx(di / dob) + '$.', '$h_i = (' + gx(ho) + ')(' + fx(di / dob) + ') = ' + qx(hi, 'cm') + '$.']),
        choice('kind', 'What kind of image is it?', 'real and upside down', ['real and upright', 'virtual and upright', 'virtual and upside down'],
          ['It forms on a screen, where the light really meets: a real image.', 'For a single lens a real image is always inverted ($m = -d_i/d_o < 0$).']),
        num('shift', 'The candle is moved back to $' + qg(d2, 'cm') + '$ from the lens. How far, and toward the lens, must the screen move to get a sharp image again?', '$\\Delta d =$', shift, 'cm',
          ['New image distance: $\\dfrac{1}{d_i\'} = \\dfrac{1}{' + gx(f) + '} - \\dfrac{1}{' + gx(d2) + '}$, so $d_i\' = ' + qx(di2, 'cm') + '$.', 'The screen moves $' + fx(di) + ' - ' + fx(di2) + ' = ' + qx(shift, 'cm') + '$ toward the lens. (A farther object makes a closer image.)'])
      ];
    } else {
      var mg = -di / dob;
      intro = 'A stamp collector holds a convex lens of focal length $' + qg(f, 'cm') + '$ $' + qg(dob, 'cm') + '$ above a stamp $' + qg(ho, 'cm') + '$ wide and looks through it.';
      parts = [
        num('di', 'How far from the lens is the image? Give the distance (as a positive number).', '$|d_i| =$', -di, 'cm',
          ['$\\dfrac{1}{d_i} = \\dfrac{1}{' + gx(f) + '} - \\dfrac{1}{' + gx(dob) + '}$ gives $d_i = ' + qx(di, 'cm') + '$.', 'The minus sign means the image is on the same side as the stamp: $' + qx(-di, 'cm') + '$ from the lens.']),
        num('m', 'How many times wider than the stamp does the image look?', '$m =$', mg, 'none',
          ['$m = -\\dfrac{d_i}{d_o} = -\\dfrac{' + fx(di) + '}{' + gx(dob) + '} = ' + fx(mg) + '$ (positive: upright).']),
        choice('kind', 'What kind of image is it?', 'virtual, upright and enlarged', ['real, inverted and enlarged', 'virtual, inverted and reduced', 'real, upright and enlarged'],
          ['The object is inside the focal length, so the rays leave the lens spreading apart and only seem to come from a point behind the stamp.', 'That is a virtual image; here $m = ' + fx(mg) + '$, so it is upright and larger.']),
        num('hi', 'How wide does the image of the stamp appear?', '$w_i =$', ho * mg, 'cm',
          ['$w_i = m \\times w = (' + fx(mg) + ')(' + gx(ho) + ') = ' + qx(ho * mg, 'cm') + '$.'])
      ];
    }
    return CT(ctx, { k: 'lens', intro: intro, parts: parts, viz: 'exam-convex-lens', vo: { f: f, d: dob, h: ho },
      hint: 'Use $\\dfrac{1}{d_o} + \\dfrac{1}{d_i} = \\dfrac{1}{f}$ and $m = -\\dfrac{d_i}{d_o}$. A negative $d_i$ means a virtual image.', chk: { f: f, d: dob, h: ho, virt: virt }, vlabel: 'An object, a convex lens and the rays forming an image' });
  });

  G('exam.pool-light', function (R, ctx) {
    var L = ctx.level, liq = R.pick([['water', 1.33], ['water', 1.33], ['a clear oil', 1.47], ['salt water', 1.34], ['a sugar syrup', 1.44]]), n = liq[1];
    var D = R.pick([1.2, 1.5, 1.8, 2.0, 2.5, 3.0]), tc = deg(M.asin(1 / n)), a1 = R.pick([15, 20, 25, 30, 35].filter(function (a) { return a < tc - 5; }));
    var a2 = deg(M.asin(n * M.sin(rad(a1)))), r = D * M.tan(rad(tc));
    var tank = liq[0] === 'water' || liq[0] === 'salt water' ? 'pool' : 'deep tank';
    var intro = 'A small lamp lies on the flat bottom of a ' + tank + ' filled with ' + liq[0] + ' (refractive index $' + gx(n) + '$) to a depth of $' + qg(D, 'm') + '$. Its light spreads in all directions. The air above has refractive index $1.00$.';
    var parts = [
      num('a2', 'A ray meets the surface at $' + a1 + '^\\circ$ from the vertical. At what angle from the vertical does it leave into the air?', '$\\theta_{\\text{air}} =$', a2, 'deg',
        ['Snell\'s law, with angles from the normal (here the vertical): $n\\sin\\theta_1 = 1.00\\sin\\theta_2$.', '$\\sin\\theta_2 = ' + gx(n) + '\\sin(' + a1 + '^\\circ) = ' + fx(n * M.sin(rad(a1))) + '$, so $\\theta_2 = ' + qx(a2, 'deg') + '$.']),
      num('tc', 'What is the critical angle at the surface?', '$\\theta_c =$', tc, 'deg',
        ['At the critical angle the ray in air would skim along the surface ($90^\\circ$): $n\\sin\\theta_c = 1$.', '$\\sin\\theta_c = \\dfrac{1}{' + gx(n) + '} = ' + fx(1 / n) + '$, so $\\theta_c = ' + qx(tc, 'deg') + '$. Steeper rays are totally reflected.']),
      num('r', 'Seen from above, light escapes only through a bright circle on the surface. What is its radius?', '$r =$', r, 'm',
        ['The edge of the circle is where rays meet the surface at exactly $\\theta_c$.', '$r = D\\tan\\theta_c = (' + gx(D) + ')\\tan(' + fx(tc) + '^\\circ) = ' + qx(r, 'm') + '$.']),
      choice('layer', 'A thin layer of a liquid with a higher refractive index is now floated on top. The radius of the circle where light leaves the ' + liq[0] + ' (at its upper boundary)', 'stays the same', ['gets larger', 'gets smaller', 'shrinks to zero: no light gets out'],
        ['With flat, parallel layers, $n\\sin\\theta$ is the same in every layer: $n_{\\text{liquid}}\\sin\\theta = n_{\\text{layer}}\\sin\\theta\' = 1.00\\sin\\theta_{\\text{air}}$.', 'So a ray gets out into the air only if $' + gx(n) + '\\sin\\theta < 1$, just as before. The layer changes the paths in between, not which rays escape.'])
    ];
    return CT(ctx, { k: 'pool', intro: intro, parts: parts, viz: 'exam-pool-light', vo: { n: n, D: D, a1: a1 },
      hint: 'Measure every angle from the normal (the vertical). Total internal reflection starts at $\\sin\\theta_c = 1/n$.', chk: { n: n, D: D, a1: a1 }, vlabel: 'A lamp under water sending rays to the surface; some escape, some reflect' });
  });

  G('exam.double-slit', function (R, ctx) {
    var L = ctx.level, lam = R.pick([450, 480, 520, 532, 589, 600, 633, 650]), d = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]), Ls = R.pick([1.0, 1.2, 1.5, 2.0, 2.5]);
    var dy = lam * 1e-9 * Ls / (d * 1e-3) * 1e3, mode = L >= 2 && R.chance(0.35) ? 'measure' : 'fwd', nW = 1.33;
    var m = R.int(2, 4), dark = R.coin(), pos = dark ? (m - 0.5) * dy : m * dy;
    var ord = ['', 'first', 'second', 'third', 'fourth'][m];
    var parts, intro;
    if (mode === 'fwd') {
      intro = 'Laser light of wavelength $' + qg(lam, 'nm') + '$ falls on two narrow slits $' + qg(d, 'mm') + '$ apart. Bright and dark bands (fringes) appear on a screen $' + qg(Ls, 'm') + '$ away.';
      parts = [num('dy', 'What is the spacing between neighboring bright fringes?', '$\\Delta y =$', dy, 'mm',
        ['For small angles, bright fringes sit at $y = m\\dfrac{\\lambda L}{d}$, so the spacing is $\\Delta y = \\dfrac{\\lambda L}{d}$.', '$\\Delta y = \\dfrac{(' + gx(lam) + ' \\times 10^{-9})(' + gx(Ls) + ')}{' + gx(d) + ' \\times 10^{-3}} = ' + fx(dy / 1000) + '\\ \\text{m} = ' + qx(dy, 'mm') + '$.'])];
    } else {
      var dyM = fix(sgf(dy, 2)); lam = dyM * 1e-3 * d * 1e-3 / Ls * 1e9; dy = dyM; pos = dark ? (m - 0.5) * dy : m * dy;
      intro = 'Light from a lamp with a color filter falls on two narrow slits $' + qg(d, 'mm') + '$ apart. On a screen $' + qg(Ls, 'm') + '$ away, the bright fringes are measured to be $' + qg(dyM, 'mm') + '$ apart.';
      parts = [num('lam', 'What is the wavelength of the light?', '$\\lambda =$', lam, 'nm',
        ['$\\Delta y = \\dfrac{\\lambda L}{d}$, so $\\lambda = \\dfrac{d\\,\\Delta y}{L}$.', '$\\lambda = \\dfrac{(' + gx(d) + ' \\times 10^{-3})(' + gx(dyM) + ' \\times 10^{-3})}{' + gx(Ls) + '} = ' + fx(lam * 1e-9) + '\\ \\text{m} = ' + qx(lam, 'nm') + '$.'])];
    }
    parts.push(num('pos', 'How far from the central bright fringe is the ' + ord + (dark ? ' dark' : ' bright') + ' fringe (counting outward on one side)?', '$y =$', pos, 'mm',
      dark ? ['Dark fringes sit halfway between bright ones: $y = (m - \\tfrac{1}{2})\\Delta y$ for the $m$th dark fringe.', '$y = (' + m + ' - \\tfrac{1}{2})(' + fx(dy) + ') = ' + qx(pos, 'mm') + '$.']
        : ['The $m$th bright fringe (not counting the center) is at $y = m\\,\\Delta y$.', '$y = ' + m + '(' + fx(dy) + ') = ' + qx(pos, 'mm') + '$.']));
    parts.push(num('wet', 'The whole setup is put under water (refractive index $' + gx(nW) + '$). What is the new fringe spacing?', '$\\Delta y\' =$', dy / nW, 'mm',
      ['In water the light\'s wavelength is shorter: $\\lambda\' = \\lambda/n$; the frequency doesn\'t change.', '$\\Delta y\' = \\dfrac{\\Delta y}{n} = \\dfrac{' + fx(dy) + '}{' + gx(nW) + '} = ' + qx(dy / nW, 'mm') + '$.']));
    parts.push(R.coin()
      ? choice('blue', 'Back in air, the light is changed to a shorter (bluer) wavelength. The fringes', 'move closer together', ['move farther apart', 'stay where they are', 'disappear'],
        ['$\\Delta y = \\lambda L/d$ is proportional to $\\lambda$.', 'A shorter wavelength gives a smaller spacing.'])
      : choice('wide', 'Back in air, the slits are replaced by a pair twice as far apart. The fringe spacing', 'halves', ['doubles', 'stays the same', 'becomes 4 times smaller'],
        ['$\\Delta y = \\lambda L/d$ is inversely proportional to $d$.', 'Doubling $d$ halves the spacing.']));
    return CT(ctx, { k: 'slit', intro: intro, parts: parts, viz: 'exam-double-slit', vo: { lam: fix(lam), d: d, L: Ls },
      hint: 'Fringe spacing $\\Delta y = \\lambda L/d$. Dark fringes are halfway between bright ones.', chk: { lam: lam, d: d, L: Ls, m: m, dark: dark }, vlabel: 'Light waves passing two slits and making bright and dark bands on a screen' });
  });

  // ================================================================== ELECTRICITY AND MAGNETISM
  G('exam.capacitor-circuit', function (R, ctx) {
    var L = ctx.level, E = R.pick([6, 9, 12, 15, 18, 24]), R1 = R.pick([10, 20, 30, 40, 50]), R2 = R.pick([20, 30, 40, 60, 80, 100]), C = R.pick([10, 20, 47, 50, 100]) * 1e-6;
    var I0 = E / R1, I = E / (R1 + R2), VC = E * R2 / (R1 + R2), Qc = C * VC, U = 0.5 * C * VC * VC;
    var intro = 'A battery of emf $' + qg(E, 'V') + '$ (no internal resistance), a switch S and a resistor $R_1 = ' + qg(R1, 'Ohm') + '$ are in series with a pair of parallel branches: a resistor $R_2 = ' + qg(R2, 'Ohm') + '$ in one, and an uncharged capacitor $C = ' + qg(C * 1e6, 'uF') + '$ in the other. Then S is closed.';
    var parts = [
      num('I0', 'What current flows through $R_1$ the moment S is closed?', '$I_0 =$', I0, 'A',
        ['An uncharged capacitor has no voltage across it, so at first it acts like a plain wire. It shorts out $R_2$.', '$I_0 = \\dfrac{E}{R_1} = \\dfrac{' + gx(E) + '}{' + gx(R1) + '} = ' + qx(I0, 'A') + '$.']),
      num('I', 'What current flows through $R_1$ a long time later?', '$I =$', I, 'A',
        ['Once the capacitor is fully charged, no current flows into it. The current goes through $R_1$ and $R_2$ in series.', '$I = \\dfrac{E}{R_1 + R_2} = \\dfrac{' + gx(E) + '}{' + gx(R1 + R2) + '} = ' + qx(I, 'A') + '$.']),
      num('Q', 'What is the charge on the capacitor then?', '$Q =$', Qc * 1e6, 'uC',
        ['The capacitor sits beside $R_2$, so it has the same voltage: $V_C = IR_2 = (' + fx(I) + ')(' + gx(R2) + ') = ' + qx(VC, 'V') + '$.', '$Q = CV_C = (' + gx(C * 1e6) + ' \\times 10^{-6})(' + fx(VC) + ') = ' + fx(Qc) + '\\ \\text{C} = ' + qx(Qc * 1e6, 'uC') + '$.']),
      num('U', 'S is now opened. How much heat is produced in $R_2$ as the capacitor discharges?', '$H =$', U * 1e3, 'mJ',
        ['With S open, the capacitor discharges only through $R_2$, so all its stored energy becomes heat there.', '$U = \\tfrac{1}{2}CV_C^2 = \\tfrac{1}{2}(' + gx(C * 1e6) + ' \\times 10^{-6})(' + fx(VC) + ')^2 = ' + fx(U) + '\\ \\text{J} = ' + qx(U * 1e3, 'mJ') + '$.'])
    ];
    if (L === 3 && R.coin()) parts[3] = choice('Vopen', 'S is now opened. Just after that, the current through $R_2$ is', 'the same size as before, $' + fx(I) + '\\ \\text{A}$, now supplied by the capacitor', ['zero, since the battery is cut off', 'twice as large as before', 'the same as $I_0$'],
      ['A capacitor\'s voltage cannot jump: just after opening it is still $' + qx(VC, 'V') + '$.', 'That voltage drives $V_C/R_2 = ' + qx(I, 'A') + '$ through $R_2$, the same size as before; the current then dies away as the capacitor empties.']);
    return CT(ctx, { k: 'cap', intro: intro, parts: parts, viz: 'exam-capacitor-circuit', vo: { E: E, R1: R1, R2: R2, C: fix(C * 1e6) },
      hint: 'At the first instant an uncharged capacitor acts like a wire; once full it acts like a break in the circuit.', chk: { E: E, R1: R1, R2: R2, C: C }, vlabel: 'A circuit with a battery, a switch, two resistors and a capacitor' });
  });

  G('exam.deflecting-plates', function (R, ctx) {
    var L = ctx.level, e = 1.6e-19, me = 9.11e-31, v0, len, d, tt, V, tries = 0;
    do {
      v0 = R.pick([1, 1.2, 1.5, 2, 2.5, 3]) * 1e7; len = R.pick([2, 3, 4, 5]) * 1e-2; d = R.pick([1, 1.5, 2, 2.5, 3]) * 1e-2; tt = len / v0;
      var Vhalf = d * d * me / (e * tt * tt); // the voltage that would push it exactly to a plate
      var Vs = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300].filter(function (x) { return x < 0.8 * Vhalf && x > 0.15 * Vhalf; });
      V = Vs.length ? R.pick(Vs) : 0; tries++;
    } while (!V && tries < 60);
    if (!V) { v0 = 2e7; len = 0.04; d = 0.02; tt = len / v0; V = 50; }
    var Ef = V / d, a = e * Ef / me, y = 0.5 * a * tt * tt, top = R.coin();
    var intro = 'An electron moving at $' + qx(v0, 'ms', 2) + '$ enters the gap between two parallel metal plates, midway between them and parallel to them. The plates are $' + qg(len * 100, 'cm') + '$ long and $' + qg(d * 100, 'cm') + '$ apart, with $' + qg(V, 'V') + '$ between them; the ' + (top ? 'upper' : 'lower') + ' plate is positive. ($e = 1.6 \\times 10^{-19}\\ \\text{C}$, $m = 9.11 \\times 10^{-31}\\ \\text{kg}$; ignore gravity.)';
    var parts = [
      num('E', 'What is the electric field between the plates?', '$E =$', Ef, 'Vm',
        ['In a uniform field between plates, $E = \\dfrac{V}{d}$, with $d$ the gap in meters.', '$E = \\dfrac{' + gx(V) + '}{' + gx(d) + '} = ' + qx(Ef, 'Vm') + '$.']),
      num('t', 'How long does the electron spend between the plates?', '$t =$', tt * 1e9, 'ns',
        ['The force is across the gap, so the speed along the plates stays $v_0$.', '$t = \\dfrac{\\ell}{v_0} = \\dfrac{' + gx(len) + '}{' + fx(v0, 2) + '} = ' + fx(tt) + '\\ \\text{s} = ' + qx(tt * 1e9, 'ns') + '$.']),
      num('y', 'How far sideways is the electron pushed by the time it leaves the plates?', '$y =$', y * 1000, 'mm',
        ['Across the gap it accelerates from rest at $a = \\dfrac{eE}{m} = ' + fx(a) + '\\ \\text{m/s}^2$, like a ball thrown sideways under gravity.', '$y = \\tfrac{1}{2}at^2 = \\tfrac{1}{2}(' + fx(a) + ')(' + fx(tt) + ')^2 = ' + fx(y) + '\\ \\text{m} = ' + qx(y * 1000, 'mm') + '$. (Less than half the gap, so it gets out.)']),
      choice('proton', 'A proton enters the same way, at the same speed. Compared with the electron, it is pushed', 'toward the other plate, and much less (about 1/1840 as far)', ['the same way, and much less', 'toward the other plate, by the same distance', 'toward the other plate, and much more'],
        ['The proton\'s charge is opposite, so the force is reversed: it bends toward the ' + (top ? 'lower' : 'upper') + ' (negative) plate.', 'The force has the same size but the mass is about 1840 times larger, so $a$ and $y = \\tfrac{1}{2}at^2$ are about 1840 times smaller.'])
    ];
    return CT(ctx, { k: 'plates', intro: intro, parts: parts, viz: 'exam-deflecting-plates', vo: { top: top, len: len * 100, d: d * 100, V: V },
      hint: 'Along the plates the speed is steady; across them the electron accelerates at $eE/m$ with $E = V/d$.', chk: { v0: v0, len: len, d: d, V: V }, vlabel: 'An electron bent along a curved path between two charged plates' });
  });

  G('exam.mass-spectrometer', function (R, ctx) {
    var L = ctx.level, e = 1.6e-19, u = 1.66e-27;
    var ion = R.pick([['neon', 20, 22], ['magnesium', 24, 26], ['chlorine', 35, 37], ['lithium', 6, 7], ['carbon', 12, 13], ['potassium', 39, 41]]);
    var A1 = ion[1], A2 = ion[2], m = A1 * u, V = R.pick([500, 1000, 1500, 2000, 2500, 3000, 4000]), B = R.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]);
    var v = M.sqrt(2 * e * V / m), r = m * v / (e * B), tHalf = PI * m / (e * B), fac = M.sqrt(A2 / A1);
    var intro = 'In a mass spectrometer, singly charged ' + ion[0] + '-' + A1 + ' ions (mass $' + A1 + '\\ \\text{u}$, with $1\\ \\text{u} = 1.66 \\times 10^{-27}\\ \\text{kg}$) start almost at rest and are sped up through a potential difference of $' + qg(V, 'V') + '$. They then enter a uniform magnetic field of $' + qg(B, 'T') + '$ at right angles, travel a half circle and strike a detector. ($e = 1.6 \\times 10^{-19}\\ \\text{C}$.)';
    var parts = [
      num('v', 'How fast are the ions moving when they enter the field?', '$v =$', v, 'ms',
        ['The field does work $qV$ on each ion: $qV = \\tfrac{1}{2}mv^2$, with $m = ' + A1 + '(1.66 \\times 10^{-27}) = ' + fx(m) + '\\ \\text{kg}$.', '$v = \\sqrt{\\dfrac{2qV}{m}} = \\sqrt{\\dfrac{2(1.6 \\times 10^{-19})(' + gx(V) + ')}{' + fx(m) + '}} = ' + qx(v, 'ms') + '$.']),
      num('r', 'What is the radius of their path in the magnetic field?', '$r =$', r * 100, 'cm',
        ['The magnetic force is the centripetal force: $qvB = \\dfrac{mv^2}{r}$, so $r = \\dfrac{mv}{qB}$.', '$r = \\dfrac{(' + fx(m) + ')(' + fx(v) + ')}{(1.6 \\times 10^{-19})(' + gx(B) + ')} = ' + fx(r) + '\\ \\text{m} = ' + qx(r * 100, 'cm') + '$.']),
      num('t', 'How long does an ion spend in the field on its half circle?', '$t =$', tHalf * 1e6, 'us',
        ['Half a circle: $t = \\dfrac{\\pi r}{v} = \\dfrac{\\pi m}{qB}$ (it does not depend on the speed).', '$t = \\dfrac{\\pi(' + fx(m) + ')}{(1.6 \\times 10^{-19})(' + gx(B) + ')} = ' + fx(tHalf) + '\\ \\text{s} = ' + fx(tHalf * 1e6) + '\\ \\mu\\text{s}$.']),
      choice('iso', ion[0][0].toUpperCase() + ion[0].slice(1) + '-' + A2 + ' ions go through the same machine. Their half circle has a radius', 'larger, by a factor of $\\sqrt{' + A2 + '/' + A1 + '} \\approx ' + fx(fac) + '$', ['larger, by a factor of $' + A2 + '/' + A1 + ' \\approx ' + fx(A2 / A1) + '$', 'the same: the charge is the same', 'smaller, by a factor of $\\sqrt{' + A2 + '/' + A1 + '}$'],
        ['Put the speed into the radius: $r = \\dfrac{m}{qB}\\sqrt{\\dfrac{2qV}{m}} = \\dfrac{1}{B}\\sqrt{\\dfrac{2mV}{q}}$, so $r \\propto \\sqrt{m}$.', 'The heavier ions move slower, which partly makes up for their mass: the factor is $\\sqrt{' + A2 + '/' + A1 + '} = ' + fx(fac) + '$, not $' + A2 + '/' + A1 + '$.'])
    ];
    if (L === 3 && R.coin()) parts[2] = num('gap', 'How far apart on the detector do the ' + ion[0] + '-' + A1 + ' and ' + ion[0] + '-' + A2 + ' ions land?', '$s =$', 2 * r * (fac - 1) * 1000, 'mm',
      ['Each lands a diameter $2r$ from where it entered, and $r \\propto \\sqrt{m}$: $r_2 = r\\sqrt{' + A2 + '/' + A1 + '} = ' + fx(r * fac * 100) + '\\ \\text{cm}$.', '$s = 2(r_2 - r) = 2(' + fx(r * fac) + ' - ' + fx(r) + ') = ' + fx(2 * r * (fac - 1)) + '\\ \\text{m} = ' + qx(2 * r * (fac - 1) * 1000, 'mm') + '$.']);
    return CT(ctx, { k: 'ms', intro: intro, parts: parts, viz: 'exam-mass-spectrometer', vo: { V: V, B: B },
      hint: 'Energy from the voltage gives the speed; then $r = \\dfrac{mv}{qB}$.', chk: { A1: A1, A2: A2, V: V, B: B }, vlabel: 'Ions sped up by a voltage, then bent into a half circle by a magnetic field' });
  });

  G('exam.sliding-rod', function (R, ctx) {
    var L = ctx.level, B = R.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8]), len = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]), Rr = R.pick([0.5, 1, 2, 2.5, 4, 5]);
    var mode = L >= 2 && R.chance(0.35) ? 'terminal' : 'steady', into = R.coin(), right = R.coin();
    var parts, intro;
    var cw = (into && !right) || (!into && right); // resistor on the left; rod on the right side
    var dirMC = choice('dir', 'Seen from above, which way does the current flow around the loop?', cw ? 'clockwise' : 'counterclockwise', [cw ? 'counterclockwise' : 'clockwise', 'no current flows: the field is uniform', 'it reverses back and forth'],
      ['As the rod moves ' + (right ? 'right' : 'left') + ', the loop\'s area ' + (right ? 'grows' : 'shrinks') + ', so the flux ' + (into ? 'into' : 'out of') + ' the page ' + (right ? 'increases' : 'decreases') + '.', 'Lenz\'s law: the current makes its own field ' + ((right) === into ? 'out of' : 'into') + ' the page inside the loop to oppose that change, which means a ' + (cw ? 'clockwise' : 'counterclockwise') + ' current.']);
    if (mode === 'steady') {
      var v = R.pick([1, 1.5, 2, 2.5, 3, 4, 5]), emf = B * len * v, I = emf / Rr, F = I * len * B, P = F * v;
      intro = 'Two long, level metal rails lie $' + qg(len, 'm') + '$ apart, joined at the left end by a $' + qg(Rr, 'Ohm') + '$ resistor. A metal rod lies across them, and a uniform magnetic field of $' + qg(B, 'T') + '$ points ' + (into ? 'into' : 'out of') + ' the page (straight ' + (into ? 'down' : 'up') + ' through the rails). The rod is pulled ' + (right ? 'to the right, away from' : 'to the left, toward') + ' the resistor, at a steady $' + qg(v, 'ms') + '$. Ignore friction and the resistance of the rails and rod.';
      parts = [
        num('emf', 'What emf is induced in the rod?', '$\\varepsilon =$', emf, 'V', ['$\\varepsilon = BLv = (' + gx(B) + ')(' + gx(len) + ')(' + gx(v) + ') = ' + qx(emf, 'V') + '$.']),
        num('I', 'What current flows through the resistor?', '$I =$', I, 'A', ['$I = \\dfrac{\\varepsilon}{R} = \\dfrac{' + fx(emf) + '}{' + gx(Rr) + '} = ' + qx(I, 'A') + '$.']),
        num('F', 'What force must the pulling hand supply to keep the speed steady?', '$F =$', F, 'N', ['The field pushes on the current in the rod with $F = ILB$, against the motion. The hand must match it.', '$F = (' + fx(I) + ')(' + gx(len) + ')(' + gx(B) + ') = ' + qx(F, 'N') + '$.']),
        R.coin() ? num('P', 'At what rate does the hand do work? (This is the power heating the resistor.)', '$P =$', P, 'W', ['$P = Fv = (' + fx(F) + ')(' + gx(v) + ') = ' + qx(P, 'W') + '$.', 'Check: $I^2R = (' + fx(I) + ')^2(' + gx(Rr) + ') = ' + qx(I * I * Rr, 'W') + '$, the same.']) : dirMC
      ];
      return CT(ctx, { k: 'rod', intro: intro, parts: parts, viz: 'exam-sliding-rod', vo: { into: into, right: right },
        hint: '$\\varepsilon = BLv$, $I = \\varepsilon/R$, and the force on the current is $ILB$, opposing the motion.', chk: { B: B, L: len, R: Rr, v: v, mode: mode, into: into, right: right }, vlabel: 'A rod sliding on rails in a magnetic field, with a resistor' });
    }
    var Fp = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.8]), vt = Fp * Rr / (B * B * len * len), It = Fp / (B * len), Pt = It * It * Rr;
    intro = 'Two long, level metal rails lie $' + qg(len, 'm') + '$ apart, joined at the left end by a $' + qg(Rr, 'Ohm') + '$ resistor. A metal rod lies across them in a uniform magnetic field of $' + qg(B, 'T') + '$ pointing ' + (into ? 'into' : 'out of') + ' the page. A steady force of $' + qg(Fp, 'N') + '$ pulls the rod ' + (right ? 'to the right' : 'to the left') + ', starting from rest. Ignore friction and the resistance of the rails and rod.';
    parts = [
      num('vt', 'The rod speeds up, then settles to a top speed. What is that speed?', '$v_t =$', vt, 'ms',
        ['At speed $v$: $I = \\dfrac{BLv}{R}$, and the backward force is $ILB = \\dfrac{B^2L^2v}{R}$.', 'Top speed when that balances the pull: $v_t = \\dfrac{FR}{B^2L^2} = \\dfrac{(' + gx(Fp) + ')(' + gx(Rr) + ')}{(' + gx(B) + ')^2(' + gx(len) + ')^2} = ' + qx(vt, 'ms') + '$.']),
      num('It', 'What current flows then?', '$I =$', It, 'A', ['At top speed $ILB = F$, so $I = \\dfrac{F}{LB} = \\dfrac{' + gx(Fp) + '}{(' + gx(len) + ')(' + gx(B) + ')} = ' + qx(It, 'A') + '$.']),
      num('Pt', 'At what rate is heat produced in the resistor then?', '$P =$', Pt, 'W', ['$P = I^2R = (' + fx(It) + ')^2(' + gx(Rr) + ') = ' + qx(Pt, 'W') + '$.', 'Check: $Fv_t = (' + gx(Fp) + ')(' + fx(vt) + ') = ' + qx(Fp * vt, 'W') + '$: all the work of the pull becomes heat.']),
      dirMC
    ];
    return CT(ctx, { k: 'rod', intro: intro, parts: parts, viz: 'exam-sliding-rod', vo: { into: into, right: right },
      hint: 'The magnetic force grows with speed. Top speed is where it matches the pull.', chk: { B: B, L: len, R: Rr, F: Fp, mode: mode, into: into, right: right }, vlabel: 'A rod sliding on rails in a magnetic field, with a resistor' });
  });

  // ================================================================== ATOMS AND LIGHT
  G('exam.photoelectric', function (R, ctx) {
    var L = ctx.level, metal = R.pick([['a cesium', 2.1], ['a potassium', 2.3], ['a sodium', 2.4], ['a calcium', 2.9], ['a zinc', 4.3], ['a test', 3.2]]);
    var phi = metal[1], lams = [200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 380, 400, 420, 440, 460].filter(function (l) { return 1240 / l > phi + 0.3; }), lam = R.pick(lams);
    var Eph = 1240 / lam, K = Eph - phi, lam0 = 1240 / phi;
    var intro = 'Light of wavelength $' + qg(lam, 'nm') + '$ shines on ' + metal[0] + ' plate whose work function is $' + qg(phi, 'eV') + '$. Electrons knocked out of the plate fly toward a collecting plate, and a voltage between the plates can be set to slow them. Use $hc = 1240\\ \\text{eV·nm}$.';
    var parts = [
      num('E', 'What is the energy of one photon of this light?', '$E =$', Eph, 'eV', ['$E = hf = \\dfrac{hc}{\\lambda} = \\dfrac{1240}{' + gx(lam) + '} = ' + qx(Eph, 'eV') + '$.']),
      num('K', 'What is the greatest kinetic energy of the electrons that leave?', '$K_{\\max} =$', K, 'eV', ['One photon gives its energy to one electron; at least the work function is spent getting out.', '$K_{\\max} = E - \\phi = ' + fx(Eph) + ' - ' + gx(phi) + ' = ' + qx(K, 'eV') + '$.']),
      num('Vs', 'What slowing voltage just stops every electron from reaching the collector?', '$V_s =$', K, 'V', ['The fastest electron must be stopped: $eV_s = K_{\\max}$.', 'In electron-volts this is direct: $V_s = ' + qx(K, 'V') + '$.']),
      R.coin()
        ? choice('bright', 'The light is made twice as bright, with the same wavelength. Then', 'twice as many electrons leave each second, with the same $K_{\\max}$', ['the same number leave, with twice the $K_{\\max}$', 'twice as many leave, with twice the $K_{\\max}$', 'the stopping voltage doubles'],
          ['Brighter light means more photons, not bigger ones. Each photon still has $' + qx(Eph, 'eV') + '$.', 'So more electrons come out, but the fastest is no faster: $K_{\\max}$ and $V_s$ stay the same.'])
        : num('lam0', 'What is the longest wavelength that can knock electrons out of this metal?', '$\\lambda_0 =$', lam0, 'nm', ['At the threshold the photon has just the work function: $\\dfrac{hc}{\\lambda_0} = \\phi$.', '$\\lambda_0 = \\dfrac{1240}{' + gx(phi) + '} = ' + qx(lam0, 'nm') + '$.'])
    ];
    return CT(ctx, { k: 'photo', intro: intro, parts: parts, viz: 'exam-photoelectric', vo: { lam: lam },
      hint: '$K_{\\max} = \\dfrac{hc}{\\lambda} - \\phi$, and the stopping voltage in volts equals $K_{\\max}$ in eV.', chk: { lam: lam, phi: phi }, vlabel: 'Light hitting a metal plate and knocking out electrons' });
  });

  G('exam.hydrogen-levels', function (R, ctx) {
    var L = ctx.level, pairs = [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [4, 3], [5, 3], [6, 3], [5, 4], [6, 4]], pr = R.pick(pairs), nu = pr[0], nl = pr[1];
    var Z = R.pick([1, 1, 1, 2]), E0 = 13.6 * Z * Z, E0t = gx(E0), En = function (n) { return -E0 / (n * n); }, dE = En(nu) - En(nl), lam = 1240 / dE, up = R.chance(0.35);
    var region = lam < 400 ? 'ultraviolet' : lam <= 700 ? 'visible light' : 'infrared';
    var N = R.int(3, 6), lines = N * (N - 1) / 2;
    var intro = (Z === 1 ? 'In a hydrogen atom' : 'In a helium ion He<sup>+</sup>, which has just one electron,') + ' the electron\'s allowed energies are $E_n = -\\dfrac{' + E0t + '}{n^2}\\ \\text{eV}$ for $n = 1, 2, 3, \\dots$ ' + (up ? 'An atom in level $n = ' + nl + '$ absorbs one photon and jumps to level $n = ' + nu + '$.' : 'An atom drops from level $n = ' + nu + '$ to level $n = ' + nl + '$ and gives out one photon.') + ' Use $hc = 1240\\ \\text{eV·nm}$.';
    var parts = [
      num('dE', 'What is the photon\'s energy?', '$E =$', dE, 'eV',
        ['$E_{' + nu + '} = -\\dfrac{' + E0t + '}{' + nu * nu + '} = ' + fx(En(nu)) + '\\ \\text{eV}$ and $E_{' + nl + '} = -\\dfrac{' + E0t + '}{' + nl * nl + '} = ' + fx(En(nl)) + '\\ \\text{eV}$.', 'The photon ' + (up ? 'must supply' : 'carries') + ' the difference: $E = ' + fx(En(nu)) + ' - (' + fx(En(nl)) + ') = ' + qx(dE, 'eV') + '$.']),
      num('lam', 'What is its wavelength?', '$\\lambda =$', lam, 'nm', ['$\\lambda = \\dfrac{hc}{E} = \\dfrac{1240}{' + fx(dE, 4) + '} = ' + qx(lam, 'nm') + '$.']),
      choice('reg', 'What kind of light is it?', region, ['ultraviolet', 'visible light', 'infrared', 'X-rays'].filter(function (x) { return x !== region; }),
        ['Visible light runs from about 400 nm (violet) to 700 nm (red).', '$' + fx(lam) + '\\ \\text{nm}$ is ' + (region === 'visible light' ? 'inside that range: visible light.' : region === 'ultraviolet' ? 'shorter than 400 nm: ultraviolet.' : 'longer than 700 nm: infrared.')]),
      R.coin()
        ? num('ion', 'How much energy would it take to remove the electron completely from level $n = ' + nl + '$?', '$E_{\\text{ion}} =$', E0 / (nl * nl), 'eV', ['Free means $E = 0$, so the energy needed is $0 - E_{' + nl + '} = \\dfrac{' + E0t + '}{' + nl * nl + '} = ' + qx(E0 / (nl * nl), 'eV') + '$.'])
        : num('lines', 'A gas of ' + (Z === 1 ? 'hydrogen atoms' : 'these ions') + ' is excited to level $n = ' + N + '$. As they fall back to $n = 1$, by every possible path, how many different photon energies can appear?', '$N_{\\text{lines}} =$', lines, 'none',
          ['Each pair of levels from 1 to ' + N + ' gives one possible jump, so one line.', 'The number of pairs is $\\dfrac{' + N + '(' + N + ' - 1)}{2} = ' + lines + '$.'])
    ];
    if (parts[3].id === 'lines') parts[3].a = { t: 'num', v: String(lines), form: 'int' };
    return CT(ctx, { k: 'hyd', intro: intro, parts: parts, viz: 'exam-hydrogen-levels', vo: { nu: nu, nl: nl, up: up, Z: Z },
      hint: 'The photon\'s energy is the difference between the two levels; then $\\lambda = 1240/E$ in nm.', chk: { nu: nu, nl: nl, N: N, Z: Z }, vlabel: 'An energy level diagram of hydrogen with a jump that gives out a photon' });
  });
})(window.MathLadder);
