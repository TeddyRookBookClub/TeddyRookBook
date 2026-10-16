/* Math Ladder visuals made for Pre-Algebra (Grade 8): static/math/viz/g8.js
   Built on the toolkit in static/math/viz/core.js (window.MathLadder.viz). Styles are injected from this file.
   Use: <div class="ml-viz" data-viz="g8-plot" data-opts='{…}'></div>   (lessons: { "t": "viz", "name": "g8-plot", "opts": {…} })
   Every visual: label (aria-label), controls: false (a still picture, e.g. inside a problem), light and dark themes.

   g8-powers   exponents as factors you can count
     mode: "product"      a^m · a^n: two groups of factors join into one (m + n factors)
           "quotient"     a^m / a^n: matching factors on top and bottom cancel in pairs (works for m < n and m = n too)
           "power"        (inner)^n: n copies of the inner product, regrouped
           "pattern"      a ladder of powers of b from hi down to lo; each step down divides by b (zero and negative exponents)
     base: "x"            the base for product, quotient and power (a letter or a small number)
     m: 3, n: 4           the exponents (power: n is the outer exponent)
     inner: "x^2"         (power) the thing being raised: "x^2", "2x", "3x^2", "2" … (overrides base and m)
     b: 2, hi: 4, lo: -3  (pattern) the base and the highest and lowest exponents shown
     controls: true       −/+ steppers for m and n (pattern: a "Next row" button and a slider)

   g8-plot     a still coordinate picture with no answers given away (lines, paths, points, polygons, slope triangles)
     xmin, xmax, ymin, ymax   the window (−6…6)        xstep, ystep (1)   grid and label spacing on each axis
     every: 1             label every n-th grid line (both axes); everyX / everyY for one axis
     grid: true, axes: true, equal (default: true when xstep = ystep)
     xlabel, ylabel       axis names ("x", "y" by default; e.g. "time (min)")
     lines: [{m: 2, b: -1} | {p: [[x1, y1], [x2, y2]]} | {x: 3}, color, label, dash, ray: false]   infinite lines
     paths: [{pts: [[0,0],[2,4],[5,4]], color, labels: ["A","B"], dots: true}]   connected segments (labels go on segments)
     points: [{x, y, label, color, coords: false, hollow: false}]
     polys: [{pts, color, fill: true, verts: ["A","B","C"], sides: ["6","8","?"], angs: ["50°","",""], right: [0], dash}]
             sides[i] labels the side from vertex i to vertex i + 1; right lists vertices that get a right-angle mark
     tri: {p1: [x, y], p2: [x, y], rise: "4", run: "2", color}   a slope triangle (run first, then rise); or a list of them
     height               canvas height in px (default from the window's shape)

   g8-mapping  a mapping diagram: inputs on the left, outputs on the right, an arrow for each pair
     pairs: [[1, 4], [2, 5], [3, 4]]   (input, output) pairs; numbers or short words
     inLabel: "Input", outLabel: "Output"
     verdict: true        say whether it is a function (and color an input with two outputs); false for a problem

   g8-solid    cylinders, cones, spheres and boxes, drawn with their measurements
     shape: "cylinder" | "cone" | "sphere" | "box"
     r: 3, h: 5           radius and height (box: l, w, h)
     diam: false          label the diameter instead of the radius
     slant: false         (cone) also draw and label the slant height
     diag: false          (box) draw the floor diagonal and the space diagonal
     mode: "solid"        "pour": a cone and a cylinder with the same base and height; pour cones of water in
                          "archimedes": a cone, a sphere and a cylinder of the same radius and height 2r (volumes 1 : 2 : 3)
     unit: ""             a unit for labels ("cm")
     sliders: true        sliders for the measurements (with controls); readout: true shows the volume worked out

   g8-transversal   two lines cut by a transversal, angles numbered like the "angle" visual (1 upper right, counterclockwise;
                    5 to 8 the same way at the lower crossing)
     deg: 60              the angle (degrees) the transversal makes with the upper line (angle 1)
     parallel: true       false tilts the lower line, so the angle pairs no longer match
     tilt: 14             (not parallel) how far the lower line is tilted, in degrees
     given: {n: 1, v: "65°"}   write a measure on angle n;  ask: 6  puts a "?" on angle 6
     numbers: true        show the angle numbers;  marks: true shows the parallel marks when the lines are parallel
     pair: null           highlight two angles, e.g. [3, 5]                                                              */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, PI = M.PI;
  function boot() {
    var V = ML.viz;
    if (!V || boot.done) return;
    boot.done = true;

    /* ---------------------------------------------------------------- shared */
    var CSS = '.g8v{overflow:hidden}.g8v .g8v-stage{position:relative}' +
      '.g8v .g8v-ro{margin:.5rem .1rem 0;font-size:.95rem;line-height:1.55;overflow-wrap:anywhere}.g8v .g8v-ro:empty{display:none}' +
      '.g8v .ml-ctl:empty{display:none}.g8v sup{font-size:.72em}' +
      '.g8v .g8p-rows{display:flex;flex-direction:column;gap:.55rem;padding:.6rem;border-radius:10px;background:var(--mv-card)}' +
      '.g8v .g8p-row{display:flex;flex-wrap:wrap;align-items:center;gap:.3rem .35rem;min-height:2.4rem}' +
      '.g8v .g8p-grp{display:inline-flex;flex-wrap:wrap;align-items:center;gap:.25rem;padding:.25rem .45rem;border-radius:12px;border:2px dashed var(--mv-line)}' +
      '.g8v .g8p-t{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;padding:0 .3rem;box-sizing:border-box;border-radius:8px;font:italic 700 1.05rem/1 Georgia,serif;color:#fff;transition:opacity .35s,transform .35s}' +
      '.g8v .g8p-t.num{font-style:normal;font-family:system-ui,sans-serif}' +
      '.g8v .g8p-t.c0{background:#1c6fd6}.g8v .g8p-t.c1{background:#b8860b}.g8v .g8p-t.c2{background:#7048e8}.g8v .g8p-t.c3{background:#0c8599}' +
      'html[data-theme="dark"] .g8v .g8p-t{color:#0f1a14}html[data-theme="dark"] .g8v .g8p-t.c0{background:#74c0fc}html[data-theme="dark"] .g8v .g8p-t.c1{background:#ffd479}html[data-theme="dark"] .g8v .g8p-t.c2{background:#b197fc}html[data-theme="dark"] .g8v .g8p-t.c3{background:#66d9e8}' +
      '.g8v .g8p-t.gone{opacity:.28;transform:scale(.86);text-decoration:line-through;text-decoration-thickness:3px}' +
      '.g8v .g8p-op{font:600 1.2rem system-ui,sans-serif;color:var(--mv-muted);padding:0 .15rem}' +
      '.g8v .g8p-res{font:700 1.15rem Georgia,serif;color:var(--mv-ink)}' +
      '.g8v .g8p-frac{display:inline-flex;flex-direction:column;align-items:flex-start;gap:.3rem}.g8v .g8p-bar{align-self:stretch;height:3px;border-radius:2px;background:var(--mv-ink)}' +
      '.g8v .g8p-lab{font-size:.85rem;color:var(--mv-muted);min-width:5.2rem}' +
      '.g8v table.g8p-lad{display:table!important;border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;margin:0;font-size:.95rem}' +
      '.g8v table.g8p-lad td{padding:.28rem .4rem;border-bottom:1px solid var(--mv-line);vertical-align:middle;white-space:nowrap}' +
      '.g8v table.g8p-lad td.bar{width:42%;white-space:normal}.g8v .g8p-b{height:.9rem;border-radius:4px;background:#00703c;min-width:2px;transition:width .4s}' +
      'html[data-theme="dark"] .g8v .g8p-b{background:#6cc79a}.g8v tr.neg .g8p-b{background:#b8860b}html[data-theme="dark"] .g8v tr.neg .g8p-b{background:#ffd479}' +
      '.g8v tr.zero td{background:rgba(184,150,62,.14)}.g8v td.ex{font:600 1rem Georgia,serif}.g8v td.val{font-weight:700}.g8v td.how{color:var(--mv-muted);font-size:.88rem}' +
      '.g8v .g8p-wrap{max-width:100%;overflow-x:auto;border-radius:10px;background:var(--mv-card);padding:.3rem .5rem}' +
      '.g8v .g8v-step{display:inline-flex;align-items:center;gap:.3rem;padding:.15rem .25rem .15rem .6rem;border:1px solid var(--mv-line);border-radius:999px;background:var(--mv-card)}' +
      '.g8v .g8v-step span{font-size:.85rem;color:var(--mv-muted)}.g8v .g8v-step b{min-width:1.6em;text-align:center}' +
      '.g8v .g8v-step .ml-btn{min-width:36px;min-height:36px;padding:0;border-radius:50%;font-size:1.1rem;line-height:1}' +
      '@media (prefers-reduced-motion: reduce){.g8v .g8p-t,.g8v .g8p-b{transition:none}}';
    if (!D.getElementById('g8v-css')) { var st = D.createElement('style'); st.id = 'g8v-css'; st.textContent = CSS; D.head.appendChild(st); }

    function el(tag, cls, html) { return V.el(tag, cls, html); }
    function num(v, d) { if (v === undefined || v === null || v === '') return d; var x = typeof v === 'number' ? v : parseFloat(String(v).replace('−', '-')); if (typeof v === 'string' && /^-?\d+\/\d+$/.test(v.trim())) { var pr = v.split('/'); x = +pr[0] / +pr[1]; } return isFinite(x) ? x : d; }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function minus(s) { return String(s).replace(/-/g, '−'); }
    function fm(v, d) { return V.fmt(v, d === undefined ? 2 : d); }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
    function sup(n) { return String(n).split('').map(function (ch) { return SUP[ch] || ch; }).join(''); }
    function shell(e, o, name, label) {
      e.classList.add('g8v', 'g8v-' + name, 'ml-notex'); e.setAttribute('role', 'group');
      var al = e.getAttribute('aria-label'); if (!al || al === name) al = null;
      e.setAttribute('aria-label', o.label || al || label);
      var S = { el: e };
      S.stage = el('div', 'g8v-stage'); e.appendChild(S.stage);
      S.ro = el('p', 'g8v-ro'); S.ro.setAttribute('aria-live', 'polite'); e.appendChild(S.ro);
      S.ctl = el('div', 'ml-ctl'); e.appendChild(S.ctl);
      if (o.controls === false) S.ctl.hidden = true;
      S.say = function (h) { if (S._s !== h) { S._s = h; S.ro.innerHTML = h; } };
      return S;
    }
    function stepper(parent, label, val, lo, hi, fn) {
      var w = el('span', 'g8v-step'), lab = el('span', '', label), out = el('b', '', String(val));
      var bm = V.button(w, '−', function () { set(val - 1); }), bp;
      w.insertBefore(lab, bm); w.appendChild(out); bp = V.button(w, '+', function () { set(val + 1); });
      bm.setAttribute('aria-label', 'Decrease ' + label); bp.setAttribute('aria-label', 'Increase ' + label);
      function set(v) { v = clamp(v, lo, hi); if (v === val) return; val = v; out.textContent = minus(v); fn(v); upd(); }
      function upd() { bm.disabled = val <= lo; bp.disabled = val >= hi; }
      upd(); parent.appendChild(w);
      return { set: function (v) { val = v; out.textContent = minus(v); upd(); }, get: function () { return val; } };
    }
    function txt(ctx, s, x, y, o) {
      o = o || {}; var k = V.colors(); ctx.save();
      ctx.font = (o.italic ? 'italic ' : '') + (o.wt || 600) + ' ' + (o.size || 14) + 'px ' + (o.serif ? 'Georgia,serif' : 'system-ui,sans-serif');
      ctx.textAlign = o.al || 'center'; ctx.textBaseline = o.bl || 'middle';
      if (o.halo !== false) { ctx.lineWidth = 4; ctx.strokeStyle = o.halo || k.bg; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
      ctx.fillStyle = o.col || k.ink; ctx.fillText(s, x, y); ctx.restore();
    }
    function line(ctx, x1, y1, x2, y2, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
    function colOf(k, c, d) { return c ? (k[c] || c) : d; }

    /* ================================================================ g8-powers */
    function parseInner(s) { // "3x^2" -> {c: 3, v: 'x', m: 2}; "2" -> {c: 2, v: '', m: 0}; "x" -> {c: 1, v: 'x', m: 1}
      var t = String(s).replace(/\s+/g, ''), mm = /^(\d*)([a-z]?)(?:\^(\d+))?$/i.exec(t);
      if (!mm) return { c: 1, v: 'x', m: 2 };
      var c = mm[1] ? +mm[1] : 1, v = mm[2] || '', m = v ? (mm[3] ? +mm[3] : 1) : 0;
      if (!v && mm[3]) { m = +mm[3]; v = String(c); c = 1; }
      return { c: c, v: v, m: m };
    }
    V.register('g8-powers', function (e, o) {
      var mode = ['product', 'quotient', 'power', 'pattern'].indexOf(o.mode) >= 0 ? o.mode : 'product';
      var S = shell(e, o, 'powers', mode === 'pattern' ? 'A ladder of powers: each step down divides by the base' : 'Exponents as factors you can count');
      var base = String(o.base == null ? 'x' : o.base), isNum = /^\d+$/.test(base);
      var m = clamp(Math.round(num(o.m, mode === 'power' ? 2 : 3)), 0, 9), n = clamp(Math.round(num(o.n, mode === 'power' ? 3 : 4)), 1, 9), joined = false;
      var inner = mode === 'power' ? (o.inner ? parseInner(o.inner) : { c: 1, v: base, m: m }) : null;
      if (inner && !inner.v) inner = { c: 1, v: String(inner.c), m: 1 };
      var box = el('div', 'g8p-rows'); S.stage.appendChild(box);
      function tile(s, c, gone) { var t = el('span', 'g8p-t c' + c + (/^\d+$/.test(s) ? ' num' : '') + (gone ? ' gone' : ''), esc(s)); t.setAttribute('aria-hidden', 'true'); return t; }
      function pw(b, k) { if (k === 1) return esc(b); return esc(b) + '<sup>' + minus(k) + '</sup>'; }
      function pwv(b, k) { return (/^\d+$/.test(b) || b.length === 1) ? pw(b, k) : '(' + esc(b) + ')<sup>' + k + '</sup>'; }
      var bJoin, bPat, pSlider, row1;
      function draw() {
        box.innerHTML = '';
        if (mode === 'product') {
          var r = el('div', 'g8p-row');
          if (!joined) {
            var g1 = el('span', 'g8p-grp'), g2 = el('span', 'g8p-grp'), i;
            for (i = 0; i < m; i++) g1.appendChild(tile(base, 0)); for (i = 0; i < n; i++) g2.appendChild(tile(base, 1));
            r.appendChild(g1); r.appendChild(el('span', 'g8p-op', '·')); r.appendChild(g2);
            box.appendChild(el('div', 'g8p-row', '<span class="g8p-lab">' + m + ' factors and ' + n + ' factors</span>'));
          } else {
            var g = el('span', 'g8p-grp'); for (var j = 0; j < m + n; j++) g.appendChild(tile(base, j < m ? 0 : 1));
            r.appendChild(g); r.appendChild(el('span', 'g8p-op', '=')); r.appendChild(el('span', 'g8p-res', pw(base, m + n)));
            box.appendChild(el('div', 'g8p-row', '<span class="g8p-lab">' + (m + n) + ' factors in all</span>'));
          }
          box.insertBefore(r, box.firstChild);
          S.say(pw(base, m) + ' · ' + pw(base, n) + ' means ' + m + ' factors of ' + esc(base) + ' times ' + n + ' more. ' + (joined ? 'Together that is ' + m + ' + ' + n + ' = <b>' + (m + n) + '</b> factors, so the product is <b>' + pw(base, m + n) + '</b>.' : 'Press “Put them together” and count.'));
          if (bJoin) bJoin.textContent = joined ? 'Split them apart' : 'Put them together';
        } else if (mode === 'quotient') {
          var fr = el('div', 'g8p-frac'), top = el('div', 'g8p-row'), bot = el('div', 'g8p-row'), c = M.min(m, n), k2;
          for (k2 = 0; k2 < m; k2++) top.appendChild(tile(base, 0, joined && k2 < c));
          for (k2 = 0; k2 < n; k2++) bot.appendChild(tile(base, 1, joined && k2 < c));
          if (!m) top.appendChild(el('span', 'g8p-res', '1'));
          fr.appendChild(top); fr.appendChild(el('div', 'g8p-bar')); fr.appendChild(bot);
          var rr = el('div', 'g8p-row'); rr.appendChild(fr);
          var res = m === n ? '1' : m > n ? pw(base, m - n) : '1/' + pw(base, n - m);
          if (joined) { rr.appendChild(el('span', 'g8p-op', '=')); rr.appendChild(el('span', 'g8p-res', res)); }
          box.appendChild(rr);
          var msg = pw(base, m) + ' ÷ ' + pw(base, n) + ': ' + m + ' factors on top, ' + n + ' on the bottom. ';
          if (!joined) msg += 'Each ' + esc(base) + ' on top cancels one on the bottom, because ' + esc(base) + '/' + esc(base) + ' = 1. Press “Cancel pairs”.';
          else if (m > n) msg += c + ' pairs cancel, leaving ' + m + ' − ' + n + ' = <b>' + (m - n) + '</b> on top: <b>' + pw(base, m - n) + '</b>.';
          else if (m === n) msg += 'Every factor cancels, leaving <b>1</b>. The rule gives ' + pw(base, m) + '÷' + pw(base, n) + ' = ' + pw(base, 0) + ', so ' + pw(base, 0) + ' must be 1.';
          else msg += c + ' pairs cancel, leaving ' + (n - m) + ' on the bottom: <b>1/' + pw(base, n - m) + '</b>. The rule gives ' + pw(base, m - n) + ', so ' + pw(base, m - n) + ' = 1/' + pw(base, n - m) + '.';
          S.say(msg);
          if (bJoin) bJoin.textContent = joined ? 'Undo' : 'Cancel pairs';
        } else if (mode === 'power') {
          var row = el('div', 'g8p-row'), cs = String(inner.c), body = inner.c !== 1 ? cs + (inner.v ? inner.v + (inner.m > 1 ? sup(inner.m) : '') : '') : inner.v + (inner.m > 1 ? sup(inner.m) : '');
          var nn = n, q;
          if (!joined) {
            for (q = 0; q < nn; q++) {
              var gg = el('span', 'g8p-grp');
              if (inner.c !== 1) gg.appendChild(tile(cs, 2));
              for (var z = 0; z < inner.m; z++) gg.appendChild(tile(inner.v, z % 2 ? 0 : 0));
              row.appendChild(gg); if (q < nn - 1) row.appendChild(el('span', 'g8p-op', '·'));
            }
            box.appendChild(row);
            box.appendChild(el('div', 'g8p-row', '<span class="g8p-lab">' + nn + ' copies of ' + esc(body) + '</span>'));
          } else {
            if (inner.c !== 1) { var gc = el('span', 'g8p-grp'); for (q = 0; q < nn; q++) gc.appendChild(tile(cs, 2)); row.appendChild(gc); row.appendChild(el('span', 'g8p-op', '·')); }
            var gv = el('span', 'g8p-grp'); for (q = 0; q < nn * inner.m; q++) gv.appendChild(tile(inner.v, 0)); row.appendChild(gv);
            box.appendChild(row);
            var cn = M.pow(inner.c, nn), resS = (inner.c !== 1 ? String(cn) : '') + pw(inner.v, inner.m * nn);
            box.appendChild(el('div', 'g8p-row', '<span class="g8p-op">=</span> <span class="g8p-res">' + (inner.c !== 1 ? pw(cs, nn) + ' · ' : '') + pw(inner.v, inner.m * nn) + (inner.c !== 1 ? ' = ' + resS : '') + '</span>'));
          }
          var head = '(' + esc(body) + ')' + sup(nn);
          S.say(head + ' means ' + nn + ' copies of ' + esc(body) + ' multiplied together. ' + (joined ? (inner.c !== 1 ? 'Every factor inside gets used ' + nn + ' times: ' + nn + ' factors of ' + cs + ' and ' + nn + ' × ' + inner.m + ' = <b>' + nn * inner.m + '</b> factors of ' + esc(inner.v) + '.' : nn + ' groups of ' + inner.m + ' is ' + nn + ' × ' + inner.m + ' = <b>' + nn * inner.m + '</b> factors.') : 'Press “Regroup” to line up the factors.'));
          if (bJoin) bJoin.textContent = joined ? 'Back to groups' : 'Regroup';
        }
      }
      if (mode === 'pattern') {
        var b = M.max(2, M.round(num(o.b, 2))), hi = clamp(M.round(num(o.hi, 4)), 1, 6), lo = clamp(M.round(num(o.lo, -3)), -6, 0), shown = o.controls === false ? lo : M.min(0, hi);
        var wrap = el('div', 'g8p-wrap'); box.appendChild(wrap);
        var hv = M.pow(b, hi);
        var drawP = function () {
          var rows = '';
          for (var x = hi; x >= lo; x--) {
            var val = x >= 0 ? String(M.pow(b, x)) : '1/' + M.pow(b, -x), how;
            if (x > 1) how = new Array(x + 1).join(b + '·').slice(0, -1);
            else if (x === 1) how = String(b);
            else if (x === 0) how = 'divide ' + b + ' by ' + b;
            else how = '1/(' + new Array(-x + 1).join(b + '·').slice(0, -1) + ')';
            var w = M.max(0.6, 100 * M.pow(b, x) / hv), hidden = x < shown;
            rows += '<tr class="' + (x === 0 ? 'zero' : x < 0 ? 'neg' : '') + '"' + (hidden ? ' hidden' : '') + '><td class="ex">' + b + sup(x) + '</td><td class="val">= ' + val + '</td><td class="how">' + how + '</td><td class="bar"><div class="g8p-b" style="width:' + w.toFixed(2) + '%"></div></td></tr>';
          }
          wrap.innerHTML = '<table class="g8p-lad" aria-label="Powers of ' + b + '"><tbody>' + rows + '</tbody></table>';
          var msg;
          if (shown > 0) msg = 'Each step down the ladder divides by ' + b + '.';
          else if (shown === 0) msg = 'Going down from ' + b + sup(1) + ' = ' + b + ', divide by ' + b + ': <b>' + b + sup(0) + ' = 1</b>. Keep going to see the negative exponents.';
          else msg = 'Keep dividing by ' + b + ': <b>' + b + sup(shown) + ' = 1/' + M.pow(b, -shown) + '</b>. A negative exponent means “divide by the base that many times.” It is a small positive number, never a negative one.';
          S.say(msg);
          if (bPat) bPat.disabled = shown <= lo;
        };
        bPat = V.button(S.ctl, 'Next row down', function () { if (shown > lo) { shown--; drawP(); } }, 'pri');
        V.button(S.ctl, 'Start over', function () { shown = M.min(0, hi); drawP(); });
        drawP();
        return {};
      }
      bJoin = V.button(S.ctl, 'Put them together', function () { joined = !joined; draw(); }, 'pri');
      if (mode !== 'power' || !o.inner) {
        stepper(S.ctl, mode === 'power' ? 'inner exponent' : 'first exponent', m, mode === 'quotient' ? 0 : 1, 8, function (v) { m = v; if (inner) inner.m = v; draw(); });
      }
      stepper(S.ctl, mode === 'power' ? 'outer exponent' : 'second exponent', n, 1, mode === 'power' ? 5 : 8, function (v) { n = v; draw(); });
      if (o.joined) joined = true;
      draw();
      return {};
    });

    /* ================================================================ g8-plot */
    V.register('g8-plot', function (e, o) {
      var S = shell(e, o, 'plot', 'A graph on a coordinate grid');
      var xmin = num(o.xmin, -6), xmax = num(o.xmax, 6), ymin = num(o.ymin, -6), ymax = num(o.ymax, 6), xs = num(o.xstep, 1), ys = num(o.ystep, xs);
      var eq = o.equal != null ? !!o.equal : xs === ys;
      var spanX = xmax - xmin, spanY = ymax - ymin, asp = eq ? spanX / spanY : 1.35;
      var c = V.canvas(S.stage, { aspect: clamp(asp, 0.75, 1.9), max: o.height || 440, min: 200, height: o.height });
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || e.getAttribute('aria-label'));
      c.cv.style.touchAction = 'pan-y';
      var padL = 34, padB = 26, padT = 12, padR = 14, named = !!(o.xlabel || o.ylabel), tris = o.tri ? (Array.isArray(o.tri) ? o.tri : [o.tri]) : [];
      function draw() {
        var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h;
        var hasLabX = o.axes !== false, firstQ = xmin >= 0 && ymin >= 0;
        var L = firstQ ? padL + (o.ylabel ? 8 : 0) : 10, R0 = padR, T0 = padT + (firstQ && named ? 10 : 0), B0 = firstQ ? padB + (named ? 14 : 0) : 10;
        var sx = (w - L - R0) / spanX, sy = (h - T0 - B0) / spanY;
        if (eq) { var s = M.min(sx, sy); sx = sy = s; }
        var ox = L + ((w - L - R0) - spanX * sx) / 2 - xmin * sx, oy = T0 + ((h - T0 - B0) - spanY * sy) / 2 + ymax * sy;
        function X(x) { return ox + x * sx; } function Y(y) { return oy - y * sy; }
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
        var x0 = X(xmin), x1 = X(xmax), y0 = Y(ymin), y1 = Y(ymax), gx, gy;
        if (o.grid !== false) {
          ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath();
          for (gx = M.ceil(xmin / xs - 1e-9) * xs; gx <= xmax + 1e-9; gx += xs) { ctx.moveTo(M.round(X(gx)) + 0.5, y1); ctx.lineTo(M.round(X(gx)) + 0.5, y0); }
          for (gy = M.ceil(ymin / ys - 1e-9) * ys; gy <= ymax + 1e-9; gy += ys) { ctx.moveTo(x0, M.round(Y(gy)) + 0.5); ctx.lineTo(x1, M.round(Y(gy)) + 0.5); }
          ctx.stroke(); ctx.restore();
        }
        if (hasLabX) {
          var ax = firstQ ? y0 : clamp(Y(0), y1, y0), ay = firstQ ? x0 : clamp(X(0), x0, x1);
          line(ctx, x0, ax, x1, ax, k.axis, 1.6); line(ctx, ay, y0, ay, y1, k.axis, 1.6);
          var evX = M.max(1, M.round(num(o.everyX, num(o.every, 0)))), evY = M.max(1, M.round(num(o.everyY, num(o.every, 0))));
          if (!o.everyX && !o.every) evX = M.max(1, M.ceil(26 / (xs * sx)));
          if (!o.everyY && !o.every) evY = M.max(1, M.ceil(18 / (ys * sy)));
          ctx.save(); ctx.fillStyle = k.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          var i = 0;
          for (gx = M.ceil(xmin / xs - 1e-9) * xs; gx <= xmax + 1e-9; gx += xs, i++) {
            var vx = M.round(gx * 1e6) / 1e6, ix = M.round(vx / xs);
            if ((!firstQ && M.abs(vx) < 1e-9) || ix % evX) continue;
            if (firstQ && M.abs(vx) < 1e-9) { ctx.textAlign = 'right'; ctx.fillText('0', ay - 4, ax + 3); ctx.textAlign = 'center'; continue; }
            ctx.fillText(minus(fm(vx, 3)), X(vx), M.min(ax + 4, h - 15));
          }
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          for (gy = M.ceil(ymin / ys - 1e-9) * ys; gy <= ymax + 1e-9; gy += ys) {
            var vy = M.round(gy * 1e6) / 1e6, iy = M.round(vy / ys);
            if (M.abs(vy) < 1e-9 || iy % evY) continue;
            ctx.fillText(minus(fm(vy, 3)), M.max(ay - 5, 24), Y(vy));
          }
          ctx.restore();
          var xl = o.xlabel != null ? o.xlabel : 'x', yl = o.ylabel != null ? o.ylabel : 'y';
          if (firstQ && (o.xlabel || o.ylabel)) {
            if (xl) txt(ctx, xl, (x0 + x1) / 2, h - 7, { size: 12.5, wt: 600, col: k.ink, halo: false, bl: 'bottom' });
            if (yl) txt(ctx, yl, x0 + 4, 9, { size: 12.5, wt: 600, col: k.ink, halo: false, al: 'left' });
          } else if (firstQ) {
            txt(ctx, xl, x1 - 4, ax - 10, { size: 14, italic: true, serif: true, al: 'right', col: k.ink });
            txt(ctx, yl, ay + 8, y1 + 9, { size: 14, italic: true, serif: true, al: 'left', col: k.ink });
          } else {
            if (xl) txt(ctx, xl, x1 - 4, ax - 10, { size: 14, italic: true, serif: true, al: 'right', col: k.ink });
            if (yl) txt(ctx, yl, ay + 8, y1 + 9, { size: 14, italic: true, serif: true, al: 'left', col: k.ink });
          }
        }
        ctx.save(); ctx.beginPath(); ctx.rect(x0 - 1, y1 - 1, x1 - x0 + 2, y0 - y1 + 2); ctx.clip();
        // polygons
        (o.polys || []).forEach(function (pg) {
          var col = colOf(k, pg.color, k.blue), pts = pg.pts || [];
          if (!pts.length) return;
          ctx.save(); ctx.beginPath(); pts.forEach(function (p, j) { ctx[j ? 'lineTo' : 'moveTo'](X(num(p[0], 0)), Y(num(p[1], 0))); }); ctx.closePath();
          if (pg.fill !== false) { ctx.fillStyle = k[(pg.color || 'blue') + 'Soft'] || k.blueSoft; ctx.fill(); }
          ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash(pg.dash ? [7, 6] : []); ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
        });
        // lines
        (o.lines || []).forEach(function (ln, j) {
          var col = colOf(k, ln.color, [k.blue, k.red, k.green, k.purple][j % 4]), p1, p2;
          if (ln.x != null) { p1 = [num(ln.x, 0), ymin - spanY]; p2 = [num(ln.x, 0), ymax + spanY]; }
          else if (ln.p) { p1 = [num(ln.p[0][0], 0), num(ln.p[0][1], 0)]; p2 = [num(ln.p[1][0], 0), num(ln.p[1][1], 0)]; }
          else { var mm = num(ln.m, 1), bb = num(ln.b, 0); p1 = [0, bb]; p2 = [1, bb + mm]; }
          var dx = p2[0] - p1[0], dy = p2[1] - p1[1], Lg = M.hypot(dx * sx, dy * sy) || 1, big = 4 * (w + h) / Lg;
          var a = ln.ray ? p1 : [p1[0] - dx * big, p1[1] - dy * big], b2 = [p1[0] + dx * big, p1[1] + dy * big];
          line(ctx, X(a[0]), Y(a[1]), X(b2[0]), Y(b2[1]), col, ln.width || 2.8, ln.dash ? [8, 6] : null);
        });
        // paths
        (o.paths || []).forEach(function (pa) {
          var col = colOf(k, pa.color, k.blue), pts = (pa.pts || []).map(function (p) { return [num(p[0], 0), num(p[1], 0)]; });
          ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = pa.width || 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.setLineDash(pa.dash ? [8, 6] : []); ctx.beginPath();
          pts.forEach(function (p, j) { ctx[j ? 'lineTo' : 'moveTo'](X(p[0]), Y(p[1])); }); ctx.stroke(); ctx.restore();
          if (pa.dots !== false) pts.forEach(function (p) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 4, 0, 2 * PI); ctx.fill(); });
        });
        // slope triangles
        tris.forEach(function (t) {
          var A = [num(t.p1[0], 0), num(t.p1[1], 0)], B = [num(t.p2[0], 0), num(t.p2[1], 0)], Cc = [B[0], A[1]], tc = colOf(k, t.color, k.orange);
          line(ctx, X(A[0]), Y(A[1]), X(Cc[0]), Y(Cc[1]), tc, 2.6, [7, 5]); line(ctx, X(Cc[0]), Y(Cc[1]), X(B[0]), Y(B[1]), tc, 2.6, [7, 5]);
        });
        ctx.restore();
        // labels that may sit near the edges (outside the clip)
        (o.polys || []).forEach(function (pg) {
          var pts = (pg.pts || []).map(function (p) { return [X(num(p[0], 0)), Y(num(p[1], 0))]; }), n = pts.length, col = colOf(k, pg.color, k.blue);
          if (n < 2) return;
          var cx = 0, cy = 0; pts.forEach(function (p) { cx += p[0] / n; cy += p[1] / n; });
          (pg.right || []).forEach(function (vi) {
            var P0 = pts[vi], P1 = pts[(vi + 1) % n], P2 = pts[(vi + n - 1) % n], s1 = 12;
            var u = [P1[0] - P0[0], P1[1] - P0[1]], v = [P2[0] - P0[0], P2[1] - P0[1]], lu = M.hypot(u[0], u[1]) || 1, lv = M.hypot(v[0], v[1]) || 1;
            u = [u[0] / lu * s1, u[1] / lu * s1]; v = [v[0] / lv * s1, v[1] / lv * s1];
            ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(P0[0] + u[0], P0[1] + u[1]); ctx.lineTo(P0[0] + u[0] + v[0], P0[1] + u[1] + v[1]); ctx.lineTo(P0[0] + v[0], P0[1] + v[1]); ctx.stroke(); ctx.restore();
          });
          (pg.sides || []).forEach(function (sl, j) {
            if (!sl) return; var P0 = pts[j], P1 = pts[(j + 1) % n], mx = (P0[0] + P1[0]) / 2, my = (P0[1] + P1[1]) / 2, nx = -(P1[1] - P0[1]), ny = P1[0] - P0[0], ln2 = M.hypot(nx, ny) || 1;
            nx /= ln2; ny /= ln2; if ((mx + nx - cx) * nx + (my + ny - cy) * ny < (mx - cx) * nx + (my - cy) * ny) { nx = -nx; ny = -ny; }
            txt(ctx, minus(sl), mx + nx * 16, my + ny * 14, { size: 14, wt: 700, col: k.ink });
          });
          (pg.angs || []).forEach(function (al2, j) {
            if (!al2) return; var P0 = pts[j], dx2 = cx - P0[0], dy2 = cy - P0[1], d2 = M.hypot(dx2, dy2) || 1, off = M.min(30, d2 * 0.45);
            txt(ctx, al2, P0[0] + dx2 / d2 * off, P0[1] + dy2 / d2 * off, { size: 12.5, wt: 700, col: k.purple });
          });
          (pg.verts || []).forEach(function (vl, j) {
            if (!vl) return; var P0 = pts[j], dx2 = P0[0] - cx, dy2 = P0[1] - cy, d2 = M.hypot(dx2, dy2) || 1;
            txt(ctx, vl, P0[0] + dx2 / d2 * 14, P0[1] + dy2 / d2 * 14, { size: 14, wt: 700, col: col });
          });
        });
        (o.lines || []).forEach(function (ln, j) {
          if (!ln.label) return; var col = colOf(k, ln.color, [k.blue, k.red, k.green, k.purple][j % 4]), at = ln.at;
          var lx, ly;
          if (at) { lx = X(num(at[0], 0)); ly = Y(num(at[1], 0)); }
          else if (ln.x != null) { lx = X(num(ln.x, 0)) + 6; ly = Y(ymax) + 14; }
          else {
            var mm = ln.p ? (num(ln.p[1][1], 0) - num(ln.p[0][1], 0)) / (num(ln.p[1][0], 0) - num(ln.p[0][0], 0)) : num(ln.m, 1), bb = ln.p ? num(ln.p[0][1], 0) - mm * num(ln.p[0][0], 0) : num(ln.b, 0);
            var tx0 = xmax - spanX * 0.08, ty = mm * tx0 + bb;
            if (ty > ymax - spanY * 0.06 || ty < ymin + spanY * 0.06) { ty = mm > 0 ? ymax - spanY * 0.08 : ymin + spanY * 0.08; tx0 = mm ? (ty - bb) / mm : tx0; }
            lx = X(tx0) - 6; ly = Y(ty) - 12;
          }
          txt(ctx, ln.label, lx, ly, { size: 13.5, wt: 700, col: col, al: 'right', italic: !!ln.italic, serif: !!ln.italic });
        });
        (o.paths || []).forEach(function (pa) {
          var col = colOf(k, pa.color, k.blue), pts = (pa.pts || []).map(function (p) { return [X(num(p[0], 0)), Y(num(p[1], 0))]; });
          (pa.labels || []).forEach(function (lb, j) {
            if (!lb || !pts[j + 1]) return; var P0 = pts[j], P1 = pts[j + 1], mx = (P0[0] + P1[0]) / 2, my = (P0[1] + P1[1]) / 2, nx = -(P1[1] - P0[1]), ny = P1[0] - P0[0], l2 = M.hypot(nx, ny) || 1;
            nx /= l2; ny /= l2; if (ny > 0) { nx = -nx; ny = -ny; }
            txt(ctx, lb, mx + nx * 15, my + ny * 15, { size: 14, wt: 800, col: col });
          });
        });
        tris.forEach(function (t2) {
          var A2 = [X(num(t2.p1[0], 0)), Y(num(t2.p1[1], 0))], B2 = [X(num(t2.p2[0], 0)), Y(num(t2.p2[1], 0))], tc2 = colOf(k, t2.color, k.orange);
          if (t2.run) txt(ctx, minus(t2.run), (A2[0] + B2[0]) / 2, A2[1] + (B2[1] < A2[1] ? 13 : -13), { size: 13, wt: 700, col: tc2 });
          if (t2.rise) txt(ctx, minus(t2.rise), B2[0] + (B2[0] > A2[0] ? 8 : -8), (A2[1] + B2[1]) / 2, { size: 13, wt: 700, col: tc2, al: B2[0] > A2[0] ? 'left' : 'right' });
        });
        (o.points || []).forEach(function (p) {
          var px = X(num(p.x, 0)), py = Y(num(p.y, 0)), col = colOf(k, p.color, k.red);
          if (px < x0 - 2 || px > x1 + 2 || py < y1 - 2 || py > y0 + 2) return;
          ctx.save(); ctx.beginPath(); ctx.arc(px, py, p.r || 5, 0, 2 * PI);
          if (p.hollow) { ctx.fillStyle = k.bg; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = col; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); }
          ctx.restore();
          var lab = (p.label || '') + (p.coords ? (p.label ? ' ' : '') + '(' + minus(fm(num(p.x, 0), 3)) + ', ' + minus(fm(num(p.y, 0), 3)) + ')' : '');
          if (lab) { var right = px < x1 - 60; txt(ctx, lab, px + (right ? 9 : -9), py - 12, { size: 13, wt: 700, col: col, al: right ? 'left' : 'right' }); }
        });
      }
      c.onResize(draw); V.onTheme(draw); draw();
      if (o.caption) S.say(esc(o.caption));
      return { draw: draw };
    });

    /* ================================================================ g8-mapping */
    V.register('g8-mapping', function (e, o) {
      var S = shell(e, o, 'mapping', 'A mapping diagram from inputs to outputs');
      var pairs = (o.pairs || [[1, 4], [2, 5], [3, 4]]).map(function (p) { return [String(p[0]), String(p[1])]; });
      function uniq(a) { var s = {}, r = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; r.push(x); } }); return r; }
      function srt(a) { return a.slice().sort(function (p, q) { var x = parseFloat(p), y = parseFloat(q); return isFinite(x) && isFinite(y) ? x - y : p < q ? -1 : p > q ? 1 : 0; }); }
      var ins = o.keep ? uniq(pairs.map(function (p) { return p[0]; })) : srt(uniq(pairs.map(function (p) { return p[0]; }))), outs = o.keep ? uniq(pairs.map(function (p) { return p[1]; })) : srt(uniq(pairs.map(function (p) { return p[1]; })));
      var cnt = {}; uniq(pairs.map(function (p) { return p[0] + '\u0001' + p[1]; })).forEach(function (k2) { var a = k2.split('\u0001')[0]; cnt[a] = (cnt[a] || 0) + 1; });
      var bad = ins.filter(function (a) { return cnt[a] > 1; }), showV = o.verdict !== false;
      var rows = M.max(ins.length, outs.length), c = V.canvas(S.stage, { height: 64 + rows * 42 });
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', (o.label || 'Mapping diagram') + ': ' + pairs.map(function (p) { return p[0] + ' to ' + p[1]; }).join(', '));
      c.cv.style.touchAction = 'pan-y';
      function draw() {
        var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, lx = M.max(70, w * 0.22), rx = w - M.max(70, w * 0.22), top = 44;
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
        function ys(list, i) { var gap = (h - top - 18) / list.length; return top + gap * (i + 0.5); }
        [[lx, ins, o.inLabel || 'Input', k.blueSoft, k.blue], [rx, outs, o.outLabel || 'Output', k.goldSoft, k.gold]].forEach(function (s) {
          ctx.save(); ctx.fillStyle = s[3]; ctx.strokeStyle = s[4]; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(s[0], (top + h - 18) / 2 + 4, M.min(58, w * 0.16), (h - top - 6) / 2, 0, 0, 2 * PI); ctx.fill(); ctx.stroke(); ctx.restore();
          txt(ctx, s[2], s[0], 16, { size: 13.5, wt: 700, col: k.ink, halo: false });
        });
        pairs.forEach(function (p) {
          var i = ins.indexOf(p[0]), j = outs.indexOf(p[1]), y1 = ys(ins, i), y2 = ys(outs, j), isBad = showV && bad.indexOf(p[0]) >= 0;
          var col = isBad ? k.red : k.green, x1 = lx + 26, x2 = rx - 26, ang = M.atan2(y2 - y1, x2 - x1);
          line(ctx, x1, y1, x2 - 9 * M.cos(ang), y2 - 9 * M.sin(ang), col, isBad ? 3 : 2.2);
          ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 12 * M.cos(ang - 0.4), y2 - 12 * M.sin(ang - 0.4)); ctx.lineTo(x2 - 12 * M.cos(ang + 0.4), y2 - 12 * M.sin(ang + 0.4)); ctx.closePath(); ctx.fill(); ctx.restore();
        });
        ins.forEach(function (a, i) { txt(ctx, minus(a), lx, ys(ins, i), { size: 15, wt: 700, col: showV && bad.indexOf(a) >= 0 ? k.red : k.ink }); });
        outs.forEach(function (a, i) { txt(ctx, minus(a), rx, ys(outs, i), { size: 15, wt: 700, col: k.ink }); });
      }
      c.onResize(draw); V.onTheme(draw); draw();
      if (showV) {
        if (bad.length) S.say('<b>Not a function.</b> The input ' + esc(minus(bad[0])) + ' has two different outputs (' + pairs.filter(function (p) { return p[0] === bad[0]; }).map(function (p) { return esc(minus(p[1])); }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(' and ') + '), so we can’t tell which one it gives.');
        else {
          var shared = outs.filter(function (b) { return pairs.filter(function (p) { return p[1] === b; }).length > 1; });
          S.say('<b>A function:</b> every input has exactly one arrow leaving it.' + (shared.length ? ' Two inputs share the output ' + esc(minus(shared[0])) + ', and that is fine.' : ''));
        }
      }
      return { draw: draw };
    });

    /* ================================================================ g8-solid */
    V.register('g8-solid', function (e, o) {
      var mode = ['pour', 'archimedes'].indexOf(o.mode) >= 0 ? o.mode : 'solid', shape = ['cylinder', 'cone', 'sphere', 'box'].indexOf(o.shape) >= 0 ? o.shape : 'cylinder';
      var S = shell(e, o, 'solid', mode === 'pour' ? 'A cone and a cylinder with the same base and height' : mode === 'archimedes' ? 'A cone, a sphere and a cylinder of the same radius' : 'A ' + shape + ' with its measurements');
      var P = { r: num(o.r, 3), h: num(o.h, shape === 'box' ? 4 : 5), l: num(o.l, 4), w: num(o.w, 3), fill: 0 }, unit = o.unit ? ' ' + o.unit : '';
      if (mode === 'archimedes') P.h = 2 * P.r;
      var c = V.canvas(S.stage, { aspect: mode === 'solid' ? 1.45 : 1.75, max: 380, min: 220 });
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', e.getAttribute('aria-label')); c.cv.style.touchAction = 'pan-y';
      var anim = null;
      function ell(ctx, cx, cy, rx, ry, col, w, half, dash) { // half: 'front' | 'back' | null
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.beginPath();
        if (half === 'front') ctx.ellipse(cx, cy, rx, ry, 0, 0, PI); else if (half === 'back') ctx.ellipse(cx, cy, rx, ry, 0, PI, 2 * PI); else ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * PI);
        ctx.stroke(); ctx.restore();
      }
      function fillPath(ctx, fn, col) { ctx.save(); ctx.beginPath(); fn(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
      var TILT = 0.3;
      function cylinder(ctx, k, cx, yb, R, H, o2) {
        var ry = R * TILT, yt = yb - H, col = o2.col || k.blue;
        fillPath(ctx, function () { ctx.moveTo(cx - R, yt); ctx.lineTo(cx - R, yb); ctx.ellipse(cx, yb, R, ry, 0, PI, 0, true); ctx.lineTo(cx + R, yt); ctx.ellipse(cx, yt, R, ry, 0, 0, PI, false); }, o2.soft || k.blueSoft);
        if (o2.level) { var yl = yb - H * o2.level; fillPath(ctx, function () { ctx.moveTo(cx - R, yl); ctx.lineTo(cx - R, yb); ctx.ellipse(cx, yb, R, ry, 0, PI, 0, true); ctx.lineTo(cx + R, yl); ctx.ellipse(cx, yl, R, ry, 0, 0, PI, false); }, k.tealSoft); fillPath(ctx, function () { ctx.ellipse(cx, yl, R, ry, 0, 0, 2 * PI); }, k.tealSoft); ell(ctx, cx, yl, R, ry, k.teal, 1.5); }
        ell(ctx, cx, yb, R, ry, col, 2.2, 'back', [5, 5]); ell(ctx, cx, yb, R, ry, col, 2.4, 'front');
        line(ctx, cx - R, yt, cx - R, yb, col, 2.4); line(ctx, cx + R, yt, cx + R, yb, col, 2.4);
        ell(ctx, cx, yt, R, ry, col, 2.4);
      }
      function cone(ctx, k, cx, yb, R, H, o2) {
        var ry = R * TILT, ya = yb - H, col = o2.col || k.purple;
        fillPath(ctx, function () { ctx.moveTo(cx, ya); ctx.lineTo(cx - R, yb); ctx.ellipse(cx, yb, R, ry, 0, PI, 0, true); ctx.closePath(); }, o2.soft || k.purpleSoft);
        if (o2.level) { var yl = yb - H * o2.level, rl = R * (1 - o2.level); fillPath(ctx, function () { ctx.moveTo(cx - rl, yl); ctx.lineTo(cx - R, yb); ctx.ellipse(cx, yb, R, ry, 0, PI, 0, true); ctx.lineTo(cx + rl, yl); ctx.closePath(); }, k.tealSoft); }
        ell(ctx, cx, yb, R, ry, col, 2.2, 'back', [5, 5]); ell(ctx, cx, yb, R, ry, col, 2.4, 'front');
        line(ctx, cx, ya, cx - R, yb, col, 2.4); line(ctx, cx, ya, cx + R, yb, col, 2.4);
      }
      function sphere(ctx, k, cx, cy, R, o2) {
        var col = o2.col || k.green;
        ctx.save(); var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R); g.addColorStop(0, D.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.9)'); g.addColorStop(1, o2.soft || k.greenSoft); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.fill(); ctx.restore();
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * PI); ctx.stroke(); ctx.restore();
        ell(ctx, cx, cy, R, R * TILT, col, 1.8, 'back', [5, 5]); ell(ctx, cx, cy, R, R * TILT, col, 2, 'front');
      }
      function dimLabel(ctx, k, s, x, y, al) { txt(ctx, s, x, y, { size: 14, wt: 700, col: k.ink, al: al || 'center' }); }
      function rLabel(ctx, k, cx, cy, R) {
        if (o.diam) { line(ctx, cx - R, cy, cx + R, cy, k.red, 2.4); ctx.save(); ctx.fillStyle = k.red; [cx - R, cx, cx + R].forEach(function (x) { ctx.beginPath(); ctx.arc(x, cy, x === cx ? 3.5 : 0, 0, 2 * PI); ctx.fill(); }); ctx.restore(); dimLabel(ctx, k, 'd = ' + fm(2 * P.r) + unit, cx, cy - 13); }
        else { line(ctx, cx, cy, cx + R, cy, k.red, 2.4); ctx.save(); ctx.fillStyle = k.red; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 2 * PI); ctx.fill(); ctx.restore(); dimLabel(ctx, k, 'r = ' + fm(P.r) + unit, cx + R / 2, cy - 13); }
      }
      function hLabel(ctx, k, x, y1, y2, s) { line(ctx, x, y1, x, y2, k.orange, 2.2, [6, 5]); dimLabel(ctx, k, s, x + 8, (y1 + y2) / 2, 'left'); }
      function draw() {
        var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h;
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
        if (mode === 'solid' && shape === 'box') {
          var L = P.l, Wd = P.w, Hh = P.h, dxu = 0.62, dyu = 0.42, totW = L + Wd * dxu, totH = Hh + Wd * dyu, s = M.min((w - 90) / totW, (h - 60) / totH), x0 = (w - totW * s) / 2, y0 = h - 30 - (h - 60 - totH * s) / 2;
          function pt(x, y, z) { return [x0 + (x + y * dxu) * s, y0 - (z + y * dyu) * s]; }
          var Cn = { a: pt(0, 0, 0), b: pt(L, 0, 0), c: pt(L, Wd, 0), d: pt(0, Wd, 0), e: pt(0, 0, Hh), f: pt(L, 0, Hh), g: pt(L, Wd, Hh), hh: pt(0, Wd, Hh) };
          fillPath(ctx, function () { ctx.moveTo(Cn.a[0], Cn.a[1]); ctx.lineTo(Cn.b[0], Cn.b[1]); ctx.lineTo(Cn.c[0], Cn.c[1]); ctx.lineTo(Cn.g[0], Cn.g[1]); ctx.lineTo(Cn.hh[0], Cn.hh[1]); ctx.lineTo(Cn.e[0], Cn.e[1]); ctx.closePath(); }, k.blueSoft);
          var E = [['a', 'b'], ['b', 'c'], ['b', 'f'], ['c', 'g'], ['e', 'f'], ['f', 'g'], ['g', 'hh'], ['hh', 'e'], ['a', 'e']], Hd = [['a', 'd'], ['d', 'c'], ['d', 'hh']];
          Hd.forEach(function (q) { line(ctx, Cn[q[0]][0], Cn[q[0]][1], Cn[q[1]][0], Cn[q[1]][1], k.muted, 1.6, [5, 5]); });
          E.forEach(function (q) { line(ctx, Cn[q[0]][0], Cn[q[0]][1], Cn[q[1]][0], Cn[q[1]][1], k.blue, 2.4); });
          if (o.diag) { line(ctx, Cn.a[0], Cn.a[1], Cn.c[0], Cn.c[1], k.orange, 2.6, [7, 5]); line(ctx, Cn.a[0], Cn.a[1], Cn.g[0], Cn.g[1], k.red, 3); }
          dimLabel(ctx, k, fm(L) + unit, (Cn.a[0] + Cn.b[0]) / 2, Cn.a[1] + 15);
          dimLabel(ctx, k, fm(Wd) + unit, (Cn.b[0] + Cn.c[0]) / 2 + 8, (Cn.b[1] + Cn.c[1]) / 2 + 8, 'left');
          dimLabel(ctx, k, fm(Hh) + unit, Cn.a[0] - 8, (Cn.a[1] + Cn.e[1]) / 2, 'right');
          if (o.diag) { var dd = M.sqrt(L * L + Wd * Wd), DD = M.sqrt(L * L + Wd * Wd + Hh * Hh); S.say('Floor diagonal (dashed): √(' + fm(L) + '² + ' + fm(Wd) + '²) = ' + fm(dd, 2) + '. Space diagonal (red): √(floor diagonal² + ' + fm(Hh) + '²) = √(' + fm(L) + '² + ' + fm(Wd) + '² + ' + fm(Hh) + '²) ≈ <b>' + fm(DD, 2) + '</b>' + unit + '.'); }
          else S.say('V = l · w · h = ' + fm(L) + ' · ' + fm(Wd) + ' · ' + fm(Hh) + ' = <b>' + fm(L * Wd * Hh) + '</b> cubic units.');
          return;
        }
        if (mode === 'solid') {
          var maxR = shape === 'sphere' ? P.r : P.r, Hs = shape === 'sphere' ? 2 * P.r : P.h, sc = M.min((w - 120) / (2 * maxR), (h - 50) / (Hs + 2 * maxR * TILT)), R = P.r * sc, Hp = Hs * sc, cx = w / 2 - 10, yb = h - 22 - R * TILT;
          if (shape === 'cylinder') { cylinder(ctx, k, cx, yb, R, Hp, {}); rLabel(ctx, k, cx, yb - Hp, R); hLabel(ctx, k, cx + R + 18, yb - Hp, yb, 'h = ' + fm(P.h) + unit); }
          else if (shape === 'cone') {
            cone(ctx, k, cx, yb, R, Hp, {}); line(ctx, cx, yb - Hp, cx, yb, k.orange, 2.2, [6, 5]); dimLabel(ctx, k, 'h = ' + fm(P.h) + unit, cx - 8, yb - Hp * 0.55, 'right'); rLabel(ctx, k, cx, yb, R);
            if (o.slant) { var sl = M.sqrt(P.r * P.r + P.h * P.h); line(ctx, cx, yb - Hp, cx + R, yb, k.gold, 3.4); dimLabel(ctx, k, 'slant ' + (o.slantLabel || fm(sl)) + unit, cx + R / 2 + 12, yb - Hp / 2, 'left'); }
          } else { var cy = h / 2; sphere(ctx, k, cx, cy, R, {}); rLabel(ctx, k, cx, cy, R); }
          var r2 = P.r * P.r, vv;
          if (shape === 'cylinder') { vv = r2 * P.h; S.say(o.readout === false ? '' : 'V = πr²h = π · ' + fm(P.r) + '² · ' + fm(P.h) + ' = <b>' + fm(vv, 3) + 'π</b> ≈ ' + fm(vv * PI, 1) + ' cubic' + (unit || ' units') + '.'); }
          else if (shape === 'cone') { vv = r2 * P.h / 3; S.say(o.readout === false ? '' : 'V = ⅓πr²h = ⅓ · π · ' + fm(P.r) + '² · ' + fm(P.h) + ' = <b>' + fm(vv, 3) + 'π</b> ≈ ' + fm(vv * PI, 1) + ' cubic' + (unit || ' units') + '.'); }
          else { vv = 4 / 3 * r2 * P.r; S.say(o.readout === false ? '' : 'V = ⁴⁄₃πr³ = ⁴⁄₃ · π · ' + fm(P.r) + '³ = <b>' + fm(vv, 3) + 'π</b> ≈ ' + fm(vv * PI, 1) + ' cubic' + (unit || ' units') + '.'); }
          return;
        }
        if (mode === 'pour') {
          var sc2 = M.min((w - 60) / (4.6 * P.r), (h - 46) / (P.h + 2 * P.r * TILT)), R2 = P.r * sc2, H2 = P.h * sc2, yb2 = h - 20 - R2 * TILT, cx1 = w * 0.27, cx2 = w * 0.68;
          cone(ctx, k, cx1, yb2, R2, H2, { level: anim ? 1 - anim.t : 1 });
          cylinder(ctx, k, cx2, yb2, R2, H2, { level: P.fill });
          txt(ctx, 'cone', cx1, yb2 + R2 * TILT + 2 > h - 8 ? h - 8 : yb2 - H2 - 14, { size: 13, wt: 700, col: k.purple });
          txt(ctx, 'cylinder', cx2, yb2 - H2 - R2 * TILT - 12, { size: 13, wt: 700, col: k.blue });
          var pours = M.round(P.fill * 3);
          S.say(pours === 0 ? 'Same base, same height. How many cones of water fill the cylinder? Press “Pour a cone”.' : pours < 3 ? pours + ' cone' + (pours > 1 ? 's' : '') + ' poured: the cylinder is <b>' + pours + '/3</b> full.' : 'Three cones fill the cylinder exactly. So one cone holds <b>one third</b> of the cylinder: V = ⅓πr²h.');
          if (bPour) bPour.disabled = pours >= 3 || !!anim;
          return;
        }
        // archimedes
        var sc3 = M.min((w - 50) / (6.9 * P.r), (h - 60) / (2 * P.r + 2 * P.r * TILT)), R3 = P.r * sc3, H3 = 2 * R3, yb3 = h - 30 - R3 * TILT, gap = (w - 6 * R3) / 4;
        var xA = gap + R3, xB = 2 * gap + 3 * R3, xC = 3 * gap + 5 * R3;
        cone(ctx, k, xA, yb3, R3, H3, {}); sphere(ctx, k, xB, yb3 - R3, R3, {}); cylinder(ctx, k, xC, yb3, R3, H3, {});
        var r3 = P.r * P.r * P.r;
        [[xA, 'cone', k.purple, '⅔πr³'], [xB, 'sphere', k.green, '⁴⁄₃πr³'], [xC, 'cylinder', k.blue, '2πr³']].forEach(function (q) { txt(ctx, q[1] + ': ' + q[3], q[0], h - 9, { size: 12.5, wt: 700, col: q[2] }); });
        S.say('All three have radius ' + fm(P.r) + ' and height 2r = ' + fm(2 * P.r) + '. Cylinder: πr² · 2r = 2πr³ = ' + fm(2 * r3, 3) + 'π. Cone: ⅓ of that = ' + fm(2 * r3 / 3, 3) + 'π. Sphere: cylinder − cone = 2πr³ − ⅔πr³ = <b>⁴⁄₃πr³ = ' + fm(4 * r3 / 3, 3) + 'π</b>. The volumes go 1 : 2 : 3.');
      }
      var bPour = null;
      if (mode === 'pour') {
        bPour = V.button(S.ctl, 'Pour a cone', function () {
          if (anim || P.fill >= 0.999) return;
          var start = P.fill, t0 = null, dur = V.reduced ? 0 : 900;
          anim = { t: 0 };
          function step(ts) { if (t0 === null) t0 = ts; var t = dur ? M.min(1, (ts - t0) / dur) : 1; anim.t = t; P.fill = start + t / 3; draw(); if (t < 1) W.requestAnimationFrame(step); else { P.fill = M.round((start + 1 / 3) * 3) / 3; anim = null; draw(); } }
          W.requestAnimationFrame(step);
        }, 'pri');
        V.button(S.ctl, 'Empty it', function () { if (anim) return; P.fill = 0; draw(); });
      }
      if (o.sliders !== false && mode !== 'pour') {
        if (shape === 'box' && mode === 'solid') {
          V.slider(S.ctl, { label: 'length', min: 1, max: 12, step: 1, value: P.l, input: function (v) { P.l = v; draw(); } });
          V.slider(S.ctl, { label: 'width', min: 1, max: 12, step: 1, value: P.w, input: function (v) { P.w = v; draw(); } });
          V.slider(S.ctl, { label: 'height', min: 1, max: 12, step: 1, value: P.h, input: function (v) { P.h = v; draw(); } });
        } else {
          V.slider(S.ctl, { label: o.diam ? 'diameter d' : 'radius r', min: o.diam ? 2 : 1, max: o.diam ? 20 : 10, step: o.diam ? 2 : 1, value: o.diam ? 2 * P.r : P.r, input: function (v) { P.r = o.diam ? v / 2 : v; if (mode === 'archimedes') P.h = 2 * P.r; draw(); } });
          if (mode === 'solid' && shape !== 'sphere') V.slider(S.ctl, { label: 'height h', min: 1, max: 12, step: 1, value: P.h, input: function (v) { P.h = v; draw(); } });
        }
      }
      c.onResize(draw); V.onTheme(draw); draw();
      return { draw: draw };
    });

    /* ================================================================ g8-transversal */
    V.register('g8-transversal', function (e, o) {
      var par = o.parallel !== false, S = shell(e, o, 'transversal', par ? 'Two parallel lines cut by a transversal, with the angles numbered' : 'Two lines that are not parallel, cut by a transversal');
      var deg = clamp(num(o.deg, 60), 20, 160), tilt = par ? 0 : num(o.tilt, 14);
      var c = V.canvas(S.stage, { aspect: 1.55, max: 360, min: 230 });
      c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', e.getAttribute('aria-label')); c.cv.style.touchAction = 'pan-y';
      var given = o.given || null, ask = o.ask != null ? +o.ask : null, pair = o.pair || null;
      function draw() {
        var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h;
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
        var y1 = h * 0.3, y2 = h * 0.72, t = deg * PI / 180, ux = M.cos(t), uy = M.sin(t), mid = w / 2;
        var P1 = [mid + (y2 - y1) / 2 / M.tan(t), y1], P2 = [mid - (y2 - y1) / 2 / M.tan(t), y2], tt = tilt * PI / 180;
        line(ctx, 8, y1, w - 8, y1, k.ink, 2.6);
        var Lx = M.max(P2[0] - 8, w - 8 - P2[0]);
        line(ctx, P2[0] - Lx * M.cos(tt), y2 + Lx * M.sin(tt), P2[0] + Lx * M.cos(tt), y2 - Lx * M.sin(tt), k.ink, 2.6);
        if (par && o.marks !== false) {
          [[w * 0.12, y1], [w * 0.12, y2]].forEach(function (q) { ctx.save(); ctx.strokeStyle = k.orange; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(q[0] - 5, q[1] - 6); ctx.lineTo(q[0] + 3, q[1]); ctx.lineTo(q[0] - 5, q[1] + 6); ctx.stroke(); ctx.restore(); });
        }
        line(ctx, P2[0] - ux * 900, P2[1] + uy * 900, P1[0] + ux * 900, P1[1] - uy * 900, k.green, 3);
        var a1 = deg, a2 = deg - tilt; // angle 1 at the top crossing; angle 5 at the bottom crossing
        var dirsTop = [[0, a1], [a1, 180], [180, 180 + a1], [180 + a1, 360]], dirsBot = [[tilt, deg], [deg, 180 + tilt], [180 + tilt, 180 + deg], [180 + deg, 360 + tilt]];
        var meas = [a1, 180 - a1, a1, 180 - a1, a2, 180 - a2, a2, 180 - a2];
        [[P1, dirsTop], [P2, dirsBot]].forEach(function (pp, j) {
          pp[1].forEach(function (dd, i) {
            var n = j * 4 + i + 1, hl = (pair && pair.indexOf(n) >= 0) || (given && given.n === n) || ask === n, col = ask === n ? k.red : given && given.n === n ? k.blue : hl ? k.purple : k.muted;
            var rr = 24, a0 = -dd[0] * PI / 180, b0 = -dd[1] * PI / 180;
            if (hl) {
              var fillC = k[(ask === n ? 'red' : given && given.n === n ? 'blue' : 'purple') + 'Soft'];
              ctx.save(); ctx.fillStyle = fillC; ctx.beginPath(); ctx.moveTo(pp[0][0], pp[0][1]); ctx.arc(pp[0][0], pp[0][1], rr, a0, b0, true); ctx.closePath(); ctx.fill();
              ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(pp[0][0], pp[0][1], rr, a0, b0, true); ctx.stroke(); ctx.restore();
            }
            var mdeg = (dd[0] + dd[1]) / 2 * PI / 180, lab = '';
            if (o.numbers !== false) lab = String(n);
            var lx = pp[0][0] + M.cos(mdeg) * 40, ly = pp[0][1] - M.sin(mdeg) * 40;
            if (given && given.n === n) lab = (o.numbers !== false ? n + ': ' : '') + minus(given.v);
            if (ask === n) lab = (o.numbers !== false ? n + ': ' : '') + '?';
            if (o.show === 'all') lab = (o.numbers !== false ? n + ': ' : '') + M.round(meas[n - 1]) + '°';
            if (lab) txt(ctx, lab, lx, ly, { size: hl ? 14 : 12.5, wt: 800, col: col });
          });
        });
        if (o.lineNames) { txt(ctx, o.lineNames[0], w - 14, y1 - 12, { size: 14, italic: true, serif: true, al: 'right', col: k.ink }); txt(ctx, o.lineNames[1], w - 14, y2 - (w - P2[0]) * M.tan(tt) - 12, { size: 14, italic: true, serif: true, al: 'right', col: k.ink }); }
        if (o.readout !== false && o.controls !== false) S.say(par ? 'The lines are parallel, so angles in the same position match: ∠1 = ∠5 = ' + M.round(a1) + '°, ∠2 = ∠6 = ' + M.round(180 - a1) + '°.' : 'These lines are <b>not</b> parallel: ∠1 = ' + M.round(a1) + '° but ∠5 = ' + M.round(a2) + '°. The angle pairs only match when the lines are parallel.');
      }
      if (o.controls !== false && o.drag !== false) {
        V.slider(S.ctl, { label: 'Turn the transversal', min: 25, max: 155, step: 1, value: deg, fmt: function (v) { return M.round(v) + '°'; }, input: function (v) { deg = v; draw(); } });
        if (o.toggle !== false) { var tb = V.button(S.ctl, par ? 'Tilt the lower line' : 'Make them parallel', function () { par = !par; tilt = par ? 0 : num(o.tilt, 14); tb.textContent = par ? 'Tilt the lower line' : 'Make them parallel'; draw(); }); }
      }
      c.onResize(draw); V.onTheme(draw); draw();
      return { draw: draw };
    });
  }
  if (ML.viz) boot();
  else if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else W.setTimeout(boot, 0);
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
})(window, document);
