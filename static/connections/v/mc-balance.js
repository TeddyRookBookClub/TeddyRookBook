/* Balancing equations as linear algebra: try coefficients by hand, then see the matrix whose null space gives the answer. */
(function () {
  var R = [
    { n: 'Burning natural gas', L: ['CH4', 'O2'], Rr: ['CO2', 'H2O'] },
    { n: 'Burning propane', L: ['C3H8', 'O2'], Rr: ['CO2', 'H2O'] },
    { n: 'Rusting iron', L: ['Fe', 'O2'], Rr: ['Fe2O3'] },
    { n: 'Making ammonia', L: ['N2', 'H2'], Rr: ['NH3'] },
    { n: 'Photosynthesis (overall)', L: ['CO2', 'H2O'], Rr: ['C6H12O6', 'O2'] },
    { n: 'Burning octane (in gasoline)', L: ['C8H18', 'O2'], Rr: ['CO2', 'H2O'] }
  ];
  function parse(f) { var o = {}, m, re = /([A-Z][a-z]?)(\d*)/g; while ((m = re.exec(f))) o[m[1]] = (o[m[1]] || 0) + (+m[2] || 1); return o; }
  function sub(f) { return f.replace(/(\d+)/g, '<sub>$1</sub>'); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  // fractions as [num, den]
  function fr(a, b) { if (b < 0) { a = -a; b = -b; } var g = gcd(a, b) || 1; return [a / g, b / g]; }
  function solve(M) { // null space of M (one dimension), via exact row reduction
    var A = M.map(function (r) { return r.map(function (v) { return [v, 1]; }); }), rows = A.length, cols = A[0].length, piv = [], r = 0, c, i, j;
    for (c = 0; c < cols && r < rows; c++) {
      var p = -1; for (i = r; i < rows; i++) if (A[i][c][0]) { p = i; break; }
      if (p < 0) continue;
      var t = A[p]; A[p] = A[r]; A[r] = t;
      var pv = A[r][c]; A[r] = A[r].map(function (x) { return fr(x[0] * pv[1], x[1] * pv[0]); });
      for (i = 0; i < rows; i++) if (i !== r && A[i][c][0]) { var f = A[i][c]; A[i] = A[i].map(function (x, k) { var y = A[r][k]; return fr(x[0] * f[1] * y[1] - f[0] * y[0] * x[1], x[1] * f[1] * y[1]); }); }
      piv.push(c); r++;
    }
    var free = -1; for (c = 0; c < cols; c++) if (piv.indexOf(c) < 0) { free = c; break; }
    var x = []; for (c = 0; c < cols; c++) x[c] = [0, 1]; x[free] = [1, 1];
    piv.forEach(function (pc, k) { x[pc] = fr(-A[k][free][0], A[k][free][1]); });
    var L = x.reduce(function (l, v) { return l * v[1] / gcd(l, v[1]); }, 1);
    var out = x.map(function (v) { return v[0] * L / v[1]; }), g = out.reduce(gcd);
    return out.map(function (v) { return v / g * (out[0] < 0 ? -1 : 1); });
  }
  Cx.viz('mc-balance', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}.vb-eq{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.5rem;font-size:1.15rem;margin:.4rem 0 .8rem}.vb-sp{display:inline-flex;flex-direction:column;align-items:center;gap:.15rem;border:1px solid rgba(127,127,127,.35);border-radius:10px;padding:.3rem .5rem}.vb-sp .cx-btn{min-height:32px;min-width:40px;padding:.1rem .5rem}.vb-co{font-weight:700;font-size:1.3rem;font-variant-numeric:tabular-nums}.vb-f{font-weight:600}.vb-arrow{font-size:1.6rem}.vb-t{border-collapse:collapse;margin:.3rem auto;font-variant-numeric:tabular-nums}.vb-t th,.vb-t td{border:1px solid rgba(127,127,127,.35);padding:.25rem .6rem;text-align:center}.vb-verdict{text-align:center;margin:.4rem 0}.vb-alg{margin-top:.6rem;font-size:.92rem}.vb-alg summary{cursor:pointer;font-weight:600;min-height:32px}.vb-alg-in{overflow-x:auto}');
    var ri = 1, co = [];
    root.innerHTML = '<div class="vb-row"><label class="cx-field"><span class="cx-lbl">Reaction</span><select class="">' + R.map(function (r, i) { return '<option value="' + i + '"' + (i === ri ? ' selected' : '') + '>' + r.n + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="vb-eq"></div><div class="vb-tally" aria-live="polite"></div>' +
      '<details class="vb-alg"><summary>Show the algebra</summary><div class="vb-alg-in"></div></details>';
    var eq = root.querySelector('.vb-eq'), tal = root.querySelector('.vb-tally'), alg = root.querySelector('.vb-alg-in');
    root.querySelector('select').onchange = function (e) { ri = +e.target.value; setup(); };
    function sp() { var r = R[ri]; return r.L.concat(r.Rr); }
    function setup() {
      var s = sp(), r = R[ri]; co = s.map(function () { return 1; });
      eq.innerHTML = s.map(function (f, i) {
        return (i === r.L.length ? '<span class="vb-arrow" aria-label="makes">→</span>' : i ? '<span class="vb-plus">+</span>' : '') +
          '<span class="vb-sp"><button type="button" class="cx-btn" data-i="' + i + '" data-d="1" aria-label="More ' + f + '">+</button>' +
          '<span class="vb-co" data-c="' + i + '">1</span><span class="vb-f">' + sub(f) + '</span>' +
          '<button type="button" class="cx-btn" data-i="' + i + '" data-d="-1" aria-label="Less ' + f + '">−</button></span>';
      }).join('');
      eq.querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; co[i] = Math.max(1, Math.min(30, co[i] + +b.dataset.d)); upd(); }; });
      algebra(); upd();
    }
    function els() { var o = []; sp().forEach(function (f) { Object.keys(parse(f)).forEach(function (e) { if (o.indexOf(e) < 0) o.push(e); }); }); return o; }
    function upd() {
      var s = sp(), r = R[ri], E = els(), ok = true;
      s.forEach(function (f, i) { eq.querySelector('[data-c="' + i + '"]').textContent = co[i]; });
      tal.innerHTML = '<table class="vb-t"><thead><tr><th>Atom</th><th>Left</th><th>Right</th><th></th></tr></thead><tbody>' + E.map(function (e) {
        var a = 0, b = 0; s.forEach(function (f, i) { var n = (parse(f)[e] || 0) * co[i]; if (i < r.L.length) a += n; else b += n; });
        if (a !== b) ok = false;
        return '<tr><td>' + e + '</td><td>' + a + '</td><td>' + b + '</td><td>' + (a === b ? '✓' : '✗') + '</td></tr>';
      }).join('') + '</tbody></table><p class="vb-verdict">' + (ok ? (co.reduce(gcd) > 1 ? 'Balanced, but every number can be divided by ' + co.reduce(gcd) + '. Chemists use the smallest whole numbers.' : '<b>Balanced!</b> Every atom on the left shows up on the right.') : 'Not balanced yet. Use + and − to change how many of each molecule there are.') + '</p>';
    }
    function algebra() {
      var s = sp(), r = R[ri], E = els(), v = 'abcdefgh'.split('');
      var M = E.map(function (e) { return s.map(function (f, i) { return (parse(f)[e] || 0) * (i < r.L.length ? 1 : -1); }); });
      var x = solve(M);
      var eqs = E.map(function (e, k) {
        var L = [], Rr = [];
        s.forEach(function (f, i) { var n = parse(f)[e] || 0; if (!n) return; var t = (n > 1 ? n : '') + v[i]; (i < r.L.length ? L : Rr).push(t); });
        return '<li>' + e + ': ' + L.join(' + ') + ' = ' + Rr.join(' + ') + '</li>';
      }).join('');
      alg.innerHTML = '<p>Call the numbers in front ' + s.map(function (f, i) { return v[i]; }).join(', ') + '. Each kind of atom gives one equation, because atoms are never made or destroyed:</p><ul>' + eqs + '</ul>' +
        '<p>Move everything to one side and you get a matrix equation <i>M</i>x = 0. Each row is an atom; each column is a molecule (products count as negative):</p>' +
        '<table class="vb-t vb-m"><thead><tr><th></th>' + s.map(function (f, i) { return '<th>' + v[i] + '</th>'; }).join('') + '</tr></thead><tbody>' +
        M.map(function (row, k) { return '<tr><th>' + E[k] + '</th>' + row.map(function (n) { return '<td>' + n + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' +
        '<p>Row reduction finds the solutions. Here they all lie on one line through zero, and the smallest whole-number point on it is <b>' +
        s.map(function (f, i) { return v[i] + ' = ' + x[i]; }).join(', ') + '</b>.</p>' +
        '<p><button type="button" class="cx-btn" data-a="use">Use these numbers</button></p>';
      alg.querySelector('[data-a=use]').onclick = function () { co = x.slice(); upd(); };
    }
    setup();
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
