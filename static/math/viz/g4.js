/* Math Ladder visuals made for Grade 4 (static/math/viz/g4.js). Registered with MathLadder.viz.register; the styles are
   injected by this file. The shared visuals (basic.js) come first; these cover what they can't show in Grade 4:
   the written column algorithms step by step, long division with its zeros, leftovers in division, line plots with
   fraction labels, and still figures (rays, lines, angles, protractors, shapes) that don't give away a measure.

   Use:  <div class="ml-viz" data-viz="g4-column" data-opts='{"op":"-","a":6000,"b":2347}'></div>
   Every visual: aria-label from opts.label (a good default otherwise), light and dark themes, no sideways overflow.

   g4-column   column addition, subtraction and multiplication by a one-digit number, one step at a time, with each
               carried or regrouped digit written where it belongs and a sentence saying what happened.
     op: "+" | "-" | "x"     the operation (default "+")
     a: 4562, b: 2879         whole numbers up to 9,999,999 (for "x", b is one digit; for "-", a ≥ b)
     step: 0                  steps shown at the start (a number, or "all" for the finished work)
     controls: true           "Next step", "Back" and "Start over" buttons; false makes a still picture at `step`
     places: true             place names over the columns (M, HTh, TTh, Th, H, T, O)

   g4-longdiv  long division by a one-digit number in the usual layout, one step at a time: divide, multiply and
               subtract, bring down. A place too small to share gets a 0 in the quotient (618 ÷ 6 = 103).
     n: 618, d: 6             the dividend (up to 99,999, at least d) and the divisor (2 to 9)
     step: 0, controls: true  as for g4-column

   g4-groups   division as equal groups: n counters in groups of `size`, and the ones left over. While the
               leftovers are at least the group size, another group fits, so a remainder is always less than the divisor.
     n: 23, size: 4           the total (1 to 60) and the group size (2 to 9)
     made: (all that fit)     groups already made at the start
     controls: true           "Make a group", "Undo a group" and a group-size stepper

   g4-lineplot a line plot: an X above the scale for each measurement, with fraction labels.
     data: ["1/8", "3/8", "1 1/4"]   the measurements (fractions, mixed numbers or decimals)
     d: 8                     ticks per whole (2, 4 or 8)
     min: 0, max: 1           the ends of the scale (fractions are fine: "1/2", "2")
     reduce: true             label 2/8 as 1/4; false keeps every label in eighths (or d-ths)
     label: ""                what was measured, shown under the scale ("length in inches")
     add: false               true: tap above a tick to add an X, tap the top X to take it away (keyboard: Tab to a
                              tick, + or Enter adds, − or Delete removes)
     stats: true              a line under the plot with the count, least, greatest and their difference

   g4-geo      a still figure on a dot grid (nothing to drag, no measures given away unless you label them).
     w: 10, h: 6              grid size in units (origin at the bottom left)
     grid: "dots"             "dots" or "none"
     items: [ … ]             drawn in order:
       {t: "pt", at: [x, y], name: "A", pos: "ne"}       a point and its name (pos: n ne e se s sw w nw)
       {t: "seg", a: [x, y], b: [x, y]}                   a segment (dots at both ends unless dots: false)
       {t: "ray", a: [x, y], b: [x, y]}  or  {t: "ray", a, dir: 40, len: 5}   a ray from a, arrowhead past b
       {t: "line", a, b}                                   a line, arrowheads at both ends
       {t: "poly", pts: [[x, y], …], fill: true}          a polygon
       {t: "angle", at: [x, y], a1: 0, a2: 50, r: 1, label: "50°"}   an arc from direction a1 to a2 (counterclockwise)
       {t: "right", at: [x, y], d1: 0, d2: 90, s: 0.4}    a right-angle mark between directions d1 and d2
       {t: "ticks", a, b, n: 1}                           equal-length marks on segment ab
       {t: "text", at: [x, y], s: "…", size: 15, anchor: "middle"}
       {t: "protractor", at: [x, y], r: 4, rot: 0}        a protractor: outer scale 0–180 counterclockwise from rot,
                                                          inner scale the other way
       every item may have color: ink | blue | green | red | gold | purple | orange | muted, dash: true, width: 3   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math;

  /* ---------------------------------------------------------------- small helpers */
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function int(v, d) { v = parseInt(v, 10); return isFinite(v) ? v : d; }
  function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function q(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; return { n: n / g, d: d / g, v: n / d }; }
  function parseQ(s) { // "3/8", "1 1/4", "2", "0.75" -> {n, d, v}
    if (s == null || s === '') return null;
    if (typeof s === 'number') { var k = 0, p = 1; while (k < 8 && M.abs(s * p - M.round(s * p)) > 1e-9) { k++; p *= 10; } return q(M.round(s * p), p); }
    s = String(s).trim().replace(/[−–]/g, '-');
    var m = /^(-?)(\d+)\s+(\d+)\/(\d+)$/.exec(s); if (m && +m[4]) { var r = q(+m[2] * +m[4] + +m[3], +m[4]); return m[1] ? q(-r.n, r.d) : r; }
    m = /^(-?\d+)\/(\d+)$/.exec(s); if (m && +m[2]) return q(+m[1], +m[2]);
    if (/^-?\d*\.?\d+$/.test(s)) return parseQ(+s);
    return null;
  }
  var SING = ['one', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand', 'million'];
  var ABBR = ['O', 'T', 'H', 'Th', 'TTh', 'HTh', 'M'];
  function pn(i, n) { return n === 1 ? SING[i] : SING[i] + 's'; }       // place name, singular or plural
  function Pn(i) { var s = pn(i, 2); return s.charAt(0).toUpperCase() + s.slice(1); }
  function digitsOf(x, n) { var out = [], s = String(x); for (var i = 0; i < n; i++) out.push(i < s.length ? +s[s.length - 1 - i] : 0); return out; }
  function lenOf(x) { return String(x).length; }

  /* the shared look: buttons, readout and colors follow viz.css (.ml-viz) */
  function css() {
    if (D.getElementById('g4-viz-css')) return;
    var s = el('style'); s.id = 'g4-viz-css';
    s.textContent = [
      '.g4v{--g4-ink:#1d2320;--g4-muted:#5d6862;--g4-line:#cfd9d2;--g4-card:#fff;--g4-blue:#1c6fd6;--g4-green:#00703c;--g4-red:#d6336c;--g4-gold:#b8860b;--g4-purple:#7048e8;--g4-orange:#e8590c;--g4-hi:rgba(184,150,62,.18);--g4-dot:#c4cfc8;--g4-blueS:rgba(28,111,214,.08);--g4-greenS:rgba(0,112,60,.13);--g4-redS:rgba(214,51,108,.13)}',
      'html[data-theme="dark"] .g4v{--g4-ink:#e6ece8;--g4-muted:#a9b8af;--g4-line:#3b5a48;--g4-card:#14211a;--g4-blue:#74c0fc;--g4-green:#6cc79a;--g4-red:#ff8787;--g4-gold:#ffd479;--g4-purple:#b197fc;--g4-orange:#ffa94d;--g4-hi:rgba(255,212,121,.16);--g4-dot:#3e5a4a;--g4-blueS:rgba(116,192,252,.12);--g4-greenS:rgba(108,199,154,.2);--g4-redS:rgba(255,135,135,.18)}',
      '.g4v .g4-card{background:var(--g4-card);border-radius:10px;padding:.6rem .4rem;overflow:hidden}',
      '.g4v .g4-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
      '.g4v .g4-count{font-size:.8rem;color:var(--g4-muted);margin-left:auto;align-self:center}',
      /* column arithmetic */
      '.g4c-t{display:table;width:auto;border-collapse:collapse;margin:0 auto;font:600 clamp(1.25rem,5.4vw,1.65rem)/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;color:var(--g4-ink)}',
      '.g4c-t td{width:1.35em;min-width:1.35em;height:1.45em;text-align:center;vertical-align:bottom;padding:0;position:relative}',
      '.g4c-t td.cur{background:var(--g4-hi)}',
      '.g4c-t tr.pl td{font:600 .62rem/1.2 system-ui,sans-serif;color:var(--g4-muted);height:1.2rem;vertical-align:middle}',
      '.g4c-t tr.cr td{font-size:.62em;color:var(--g4-blue);height:auto;vertical-align:bottom;padding-bottom:.1em}',
      '.g4c-t tr.cr td span{display:block;line-height:1.15}',
      '.g4c-t tr.ans td{border-top:3px solid var(--g4-ink);color:var(--g4-green);padding-top:.12em}',
      '.g4c-t .x{text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:var(--g4-red);color:var(--g4-muted)}',
      '.g4c-t .new{color:var(--g4-red)}',
      '.g4c-t td.op{color:var(--g4-ink)}',
      /* long division */
      '.g4d-g{display:grid;justify-content:center;margin:0 auto;font:600 clamp(1.2rem,5vw,1.55rem)/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;color:var(--g4-ink)}',
      '.g4d-g>span{width:1.3em;height:1.5em;display:flex;align-items:flex-end;justify-content:center;padding-bottom:.08em;box-sizing:border-box}',
      '.g4d-g .qd{color:var(--g4-green)}',
      '.g4d-g .vin{border-top:3px solid var(--g4-ink)}',
      '.g4d-g .br{position:relative}',
      '.g4d-g .br svg{position:absolute;left:-.32em;top:-1px;height:calc(100% + 2px);width:.55em;overflow:visible}',
      '.g4d-g .ul{border-bottom:2px solid var(--g4-ink)}',
      '.g4d-g .mu{color:var(--g4-muted)}',
      '.g4d-g .bd{color:var(--g4-blue)}',
      '.g4d-g .rr{justify-content:flex-start;padding-left:.2em;color:var(--g4-red);font-size:.8em;white-space:nowrap;width:auto}',
      '.g4d-g .hi{background:var(--g4-hi);border-radius:4px}',
      /* groups */
      '.g4g-wrap{display:flex;flex-wrap:wrap;gap:.5rem;align-items:flex-start;justify-content:center;min-height:3rem}',
      '.g4g-grp{display:grid;gap:4px;padding:6px;border:2px solid var(--g4-green);border-radius:12px;background:var(--g4-greenS)}',
      '.g4g-left{display:flex;flex-wrap:wrap;gap:4px;padding:6px;border:2px dashed var(--g4-red);border-radius:12px;max-width:100%;align-items:center}',
      '.g4g-left b{font:600 .75rem system-ui,sans-serif;color:var(--g4-red);width:100%}',
      '.g4g-dot{width:14px;height:14px;border-radius:50%;background:var(--g4-blue);display:inline-block}',
      '.g4g-left .g4g-dot{background:var(--g4-red)}',
      '.g4g-step{display:inline-flex;align-items:center;gap:.3rem;font:600 .85rem system-ui,sans-serif;color:var(--g4-muted)}',
      '.g4g-step output{min-width:1.4em;text-align:center;color:var(--g4-ink)}',
      /* svg figures */
      '.g4v svg{display:block;margin:0 auto;max-width:100%;height:auto;overflow:visible}',
      '.g4v svg text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
      '.g4v .s-ink{stroke:var(--g4-ink)}.g4v .s-blue{stroke:var(--g4-blue)}.g4v .s-green{stroke:var(--g4-green)}.g4v .s-red{stroke:var(--g4-red)}.g4v .s-gold{stroke:var(--g4-gold)}.g4v .s-purple{stroke:var(--g4-purple)}.g4v .s-orange{stroke:var(--g4-orange)}.g4v .s-muted{stroke:var(--g4-muted)}',
      '.g4v .f-ink{fill:var(--g4-ink)}.g4v .f-blue{fill:var(--g4-blue)}.g4v .f-green{fill:var(--g4-green)}.g4v .f-red{fill:var(--g4-red)}.g4v .f-gold{fill:var(--g4-gold)}.g4v .f-purple{fill:var(--g4-purple)}.g4v .f-orange{fill:var(--g4-orange)}.g4v .f-muted{fill:var(--g4-muted)}.g4v .f-card{fill:var(--g4-card)}',
      '.g4v .f-dot{fill:var(--g4-dot)}.g4v .f-blueS{fill:var(--g4-blueS)}.g4v .f-greenS{fill:var(--g4-greenS)}.g4v .f-redS{fill:var(--g4-redS)}.g4v .f-none{fill:none}',
      '.g4v .g4lp-hit{fill:transparent;cursor:pointer;outline:none}',
      '.g4v .g4lp-hit:focus-visible{fill:var(--g4-hi);stroke:#b8963e;stroke-width:2}'
    ].join('\n');
    D.head.appendChild(s);
  }

  /* a panel with a card, an aria-live readout and a controls row */
  function shell(e, o, V, label) {
    e.classList.add('g4v');
    if (!e.getAttribute('aria-label')) e.setAttribute('aria-label', o.label || label);
    if (o.title) e.appendChild(el('p', 'ml-cap', o.title));
    var card = el('div', 'g4-card'); e.appendChild(card);
    var ro = V.readout(e);
    var row = el('div', 'ml-ctl'); e.appendChild(row);
    return { card: card, ro: ro, row: row };
  }
  /* Next / Back / Start over for the step-by-step visuals */
  function stepper(S, o, V, n, show) {
    var at = o.step === 'all' ? n : clamp(int(o.step, 0), 0, n);
    var cnt = el('span', 'g4-count');
    function go(k) { at = clamp(k, 0, n); show(at); if (nb) { nb.disabled = at >= n; bb.disabled = at <= 0; rb.disabled = at <= 0; } cnt.textContent = 'Step ' + at + ' of ' + n; }
    var nb = null, bb = null, rb = null;
    if (o.controls !== false) {
      nb = V.button(S.row, 'Next step', function () { go(at + 1); }, 'pri');
      bb = V.button(S.row, 'Back', function () { go(at - 1); });
      rb = V.button(S.row, 'Start over', function () { go(0); });
      S.row.appendChild(cnt);
    } else S.row.hidden = true;
    go(at);
    return { go: go };
  }

  /* ================================================================ g4-column */
  function column(e, o, V) {
    var op = o.op === '-' || o.op === '−' ? '-' : (o.op === 'x' || o.op === '×' || o.op === '*') ? 'x' : '+';
    var a = M.max(0, M.floor(+o.a || 0)), b = M.max(0, M.floor(+o.b || 0));
    if (op === '-' && b > a) { var tt = a; a = b; b = tt; }
    if (op === 'x') b = clamp(b, 0, 9);
    a = M.min(a, 9999999); b = M.min(b, 9999999);
    var sym = op === '+' ? '+' : op === '-' ? '−' : '×', res = op === '+' ? a + b : op === '-' ? a - b : a * b;
    var S = shell(e, o, V, 'Column ' + (op === '+' ? 'addition' : op === '-' ? 'subtraction' : 'multiplication') + ': ' + commas(a) + ' ' + sym + ' ' + commas(b));
    var n = M.max(lenOf(a), lenOf(b), lenOf(res)), la = lenOf(a), lb = lenOf(b), lr = lenOf(res);
    var A = digitsOf(a, n), B = digitsOf(b, n);
    var st = { res: [], carry: [], stack: A.map(function (d) { return [d]; }), cur: -1 }, snaps = [], notes = [];
    function snap(note, cur) { st.cur = cur; snaps.push(JSON.parse(JSON.stringify(st))); notes.push(note); }
    var c = 0, i;
    if (op === '+') {
      for (i = 0; i < n; i++) {
        if (i >= la && i >= lb) { if (c) { st.res[i] = c; } break; }
        var s = A[i] + B[i] + c, nc = M.floor(s / 10), last = i >= M.max(la, lb) - 1;
        var terms = []; if (i < la) terms.push(A[i]); if (i < lb) terms.push(B[i]); if (c) terms.push(c + ' carried');
        var bits = terms.join(' + ') + ' = ' + s + ' ' + pn(i, s) + '.';
        st.res[i] = s % 10;
        var nt = Pn(i) + ': ' + bits;
        if (nc && !last) { st.carry[i + 1] = nc; nt += ' That is ' + nc + ' ' + pn(i + 1, nc) + ' and ' + (s % 10) + ' ' + pn(i, s % 10) + ': write ' + (s % 10) + ', carry ' + nc + ' to the ' + pn(i + 1, 2) + '.'; }
        else if (nc && last) { st.res[i + 1] = nc; nt += ' Write ' + (s % 10) + '. The ' + nc + ' ' + pn(i + 1, nc) + ' has no other digits to join, so write it in the answer.'; }
        else nt += ' Write ' + s + '.';
        c = nc; snap(nt, i);
        if (nc && last) break;
      }
    } else if (op === '-') {
      var T = A.slice();
      for (i = 0; i < la; i++) {
        if (T[i] < B[i]) {
          var j = i + 1; while (j < la && T[j] === 0) j++;
          var why = Pn(i) + ': ' + T[i] + ' − ' + B[i] + ' needs more ' + pn(i, 2) + '. ';
          if (j > i + 1) why += 'The ' + (j > i + 2 ? 'next places hold' : pn(i + 1, 2) + ' place holds') + ' 0, so go to the ' + pn(j, 2) + '. ';
          for (var k = j; k > i; k--) {
            T[k] -= 1; st.stack[k].push(T[k]); T[k - 1] += 10; st.stack[k - 1].push(T[k - 1]);
            snap((k === j ? why : '') + 'Trade 1 ' + pn(k, 1) + ' for 10 ' + pn(k - 1, 2) + ': the ' + pn(k, 2) + ' go from ' + (T[k] + 1) + ' to ' + T[k] + ', the ' + pn(k - 1, 2) + ' from ' + (T[k - 1] - 10) + ' to ' + T[k - 1] + '.', k - 1);
          }
        }
        var dgt = T[i] - B[i];
        st.res[i] = i >= lr && i > 0 ? null : dgt;
        snap(Pn(i) + ': ' + T[i] + ' − ' + (i < lb ? B[i] : 0) + ' = ' + dgt + '.' + (i >= lr && i > 0 ? ' A 0 in front is not written.' : ''), i);
      }
    } else {
      for (i = 0; i < la; i++) {
        var p = A[i] * b + c, last2 = i === la - 1, nc2 = M.floor(p / 10);
        var t2 = Pn(i) + ': ' + A[i] + ' × ' + b + ' = ' + (A[i] * b) + (c ? ', plus ' + c + ' carried = ' + p : '') + ' ' + pn(i, p) + '.';
        st.res[i] = p % 10;
        if (last2) { if (nc2) st.res[i + 1] = nc2; t2 += ' This is the last digit, so write all of ' + p + '.'; }
        else if (nc2) { st.carry[i + 1] = nc2; t2 += ' Write ' + (p % 10) + ', carry ' + nc2 + ' ' + pn(i + 1, nc2) + '.'; }
        else t2 += ' Write ' + p + '.';
        c = nc2; snap(t2, i);
      }
    }
    var lastNote = op === '+' ? commas(a) + ' + ' + commas(b) + ' = <b>' + commas(res) + '</b>.' : op === '-' ? commas(a) + ' − ' + commas(b) + ' = <b>' + commas(res) + '</b>. Check: ' + commas(res) + ' + ' + commas(b) + ' = ' + commas(a) + '.' : commas(a) + ' × ' + b + ' = <b>' + commas(res) + '</b>.';
    notes[notes.length - 1] += ' So ' + lastNote;
    var start = { res: [], carry: [], stack: A.map(function (d) { return [d]; }), cur: -1 };
    var tbl = el('table', 'g4c-t'); tbl.setAttribute('aria-hidden', 'true'); S.card.appendChild(tbl);
    var sr = el('p', 'g4-sr'); S.card.appendChild(sr);
    function draw(k) {
      var s2 = k ? snaps[k - 1] : start, h = '';
      function cls(col) { return col === s2.cur ? ' class="cur"' : ''; }
      if (o.places !== false) { h += '<tr class="pl"><td></td>'; for (var c2 = n - 1; c2 >= 0; c2--) h += '<td' + cls(c2) + ' title="' + pn(c2, 2) + '">' + ABBR[c2] + '</td>'; h += '</tr>'; }
      h += '<tr class="cr"><td></td>';
      for (c2 = n - 1; c2 >= 0; c2--) {
        var inner = '';
        if (op === '-') { var stk = s2.stack[c2]; for (var m = stk.length - 1; m >= 1; m--) inner += '<span class="' + (m < stk.length - 1 ? 'x' : 'new') + '">' + stk[m] + '</span>'; }
        else if (s2.carry[c2]) inner = '<span>' + s2.carry[c2] + '</span>';
        h += '<td' + cls(c2) + '>' + inner + '</td>';
      }
      h += '</tr><tr><td></td>';
      for (c2 = n - 1; c2 >= 0; c2--) h += '<td' + cls(c2) + '>' + (c2 < la ? '<span' + (op === '-' && s2.stack[c2].length > 1 ? ' class="x"' : '') + '>' + A[c2] + '</span>' : '') + '</td>';
      h += '</tr><tr><td class="op">' + sym + '</td>';
      for (c2 = n - 1; c2 >= 0; c2--) h += '<td' + cls(c2) + '>' + (op === 'x' ? (c2 === 0 ? b : '') : (c2 < lb ? B[c2] : '')) + '</td>';
      h += '</tr><tr class="ans"><td></td>';
      for (c2 = n - 1; c2 >= 0; c2--) h += '<td' + cls(c2) + '>' + (s2.res[c2] != null ? s2.res[c2] : '') + '</td>';
      h += '</tr>';
      tbl.innerHTML = h;
      var msg = k ? notes[k - 1] : 'Line up the digits by place value, then work one column at a time, starting with the ones.';
      S.ro.set(msg);
      sr.textContent = commas(a) + ' ' + sym + ' ' + commas(b) + '.';
    }
    stepper(S, o, V, snaps.length, draw);
    return {};
  }

  /* ================================================================ g4-longdiv */
  function longdiv(e, o, V) {
    var d = clamp(int(o.d, 6), 2, 9), n = clamp(int(o.n, 618), d, 99999);
    var S = shell(e, o, V, 'Long division: ' + commas(n) + ' divided by ' + d);
    var Dg = String(n).split('').map(Number), L = Dg.length, pl = function (c) { return L - 1 - c; };
    var s = 0, pre = Dg[0]; while (pre < d) { s++; pre = pre * 10 + Dg[s]; }
    var rows = [], steps = [], rem = 0, Q = M.floor(n / d), R = n % d;
    for (var k = s; k < L; k++) {
      var part = k === s ? pre : rem * 10 + Dg[k], qd = M.floor(part / d), prod = qd * d, j = k - s, p = pl(k);
      rows.push({ k: k, part: part, q: qd, prod: prod, rem: part - prod });
      var t = '';
      if (k === s && s > 0) t = 'There ' + (Dg[0] === 1 ? 'is only 1 ' + pn(pl(0), 1) : 'are only ' + Dg[0] + ' ' + pn(pl(0), 2)) + ': not enough to put 1 in each of ' + d + ' groups. So think of ' + part + ' ' + pn(p, 2) + '. ';
      if (qd === 0) t += 'Divide: ' + part + ' ' + pn(p, part) + ' ÷ ' + d + ' is not enough for even 1 in each group. <b>Write 0</b> in the ' + pn(p, 2) + ' place.';
      else t += 'Divide: ' + part + ' ' + pn(p, part) + ' ÷ ' + d + ' = ' + qd + ' ' + pn(p, qd) + (part - prod ? ', with some left over' : '') + '. Write ' + qd + ' above the ' + pn(p, 2) + '.';
      steps.push({ show: ['q' + k], note: t, hi: ['q' + k] });
      steps.push({ show: ['p' + k, 'r' + k], note: 'Multiply: ' + qd + ' × ' + d + ' = ' + prod + '. Subtract: ' + part + ' − ' + prod + ' = ' + (part - prod) + ' ' + pn(p, part - prod) + ' left.' + (part - prod >= d ? '' : ' (' + (part - prod) + ' is less than ' + d + ', good.)'), hi: ['p' + k, 'r' + k] });
      rem = part - prod;
      if (k < L - 1) steps.push({ show: ['b' + k], note: 'Bring down the ' + Dg[k + 1] + ' ' + pn(p - 1, Dg[k + 1]) + ': ' + rem + ' ' + pn(p, rem) + ' and ' + Dg[k + 1] + ' ' + pn(p - 1, Dg[k + 1]) + ' make ' + (rem * 10 + Dg[k + 1]) + ' ' + pn(p - 1, 2) + '.', hi: ['b' + k] });
    }
    steps.push({ show: R ? ['R'] : [], note: (R ? 'No digits are left to bring down, so ' + R + ' is the remainder: ' + commas(n) + ' ÷ ' + d + ' = <b>' + commas(Q) + ' R ' + R + '</b>. Check: ' + commas(Q) + ' × ' + d + ' + ' + R + ' = ' + commas(n) + '.' : 'Nothing is left over: ' + commas(n) + ' ÷ ' + d + ' = <b>' + commas(Q) + '</b>. Check: ' + commas(Q) + ' × ' + d + ' = ' + commas(n) + '.'), hi: R ? ['R'] : [] });
    var nCols = L + 2, nRows = 2 + 2 * rows.length;
    var grid = el('div', 'g4d-g'); grid.setAttribute('aria-hidden', 'true');
    grid.style.gridTemplateColumns = '1.3em repeat(' + L + ', 1.3em) auto';
    S.card.appendChild(grid);
    var sr = el('p', 'g4-sr', commas(n) + ' divided by ' + d + ' in long division.'); S.card.appendChild(sr);
    var BR = '<svg viewBox="0 0 10 40" preserveAspectRatio="none" aria-hidden="true"><path d="M1 0 Q 9 20 1 40" fill="none" stroke="currentColor" stroke-width="2.6" vector-effect="non-scaling-stroke"/></svg>';
    function draw(k) {
      var on = {}, hi = {};
      for (var i = 0; i < k; i++) steps[i].show.forEach(function (x) { on[x] = 1; });
      if (k) steps[k - 1].hi.forEach(function (x) { hi[x] = 1; });
      var cells = []; for (var r = 0; r < nRows; r++) { cells.push([]); for (var c = 0; c < nCols; c++) cells[r].push({ t: '', c: '' }); }
      function put(r, col, t, cl) { var x = cells[r][col + 1]; x.t = t; x.c += ' ' + (cl || ''); }
      put(1, -1, String(d));
      Dg.forEach(function (dg, c) { put(1, c, String(dg), 'vin' + (c === 0 ? ' br' : '')); });
      rows.forEach(function (rw, j) {
        if (on['q' + rw.k]) put(0, rw.k, String(rw.q), 'qd' + (hi['q' + rw.k] ? ' hi' : ''));
        var pr = String(rw.prod), rr = String(rw.rem), r1 = 2 + 2 * j, r2 = r1 + 1, h1 = hi['p' + rw.k] ? ' hi' : '';
        if (on['p' + rw.k]) {
          var st = rw.k - pr.length + 1;
          for (var c = 0; c < pr.length; c++) put(r1, st + c, pr[c], 'ul' + h1);
          put(r1, st - 1, '−', 'ul mu');
        }
        if (on['r' + rw.k]) { var st2 = rw.k - rr.length + 1; for (c = 0; c < rr.length; c++) put(r2, st2 + c, rr[c], (rw.rem === 0 && rw.k < L - 1 ? 'mu' : '') + h1); }
        if (on['b' + rw.k]) put(r2, rw.k + 1, String(Dg[rw.k + 1]), 'bd' + (hi['b' + rw.k] ? ' hi' : ''));
      });
      if (on.R) put(0, L, 'R ' + R, 'rr' + (hi.R ? ' hi' : ''));
      var h = '';
      cells.forEach(function (row) { row.forEach(function (x) { h += '<span class="' + x.c.trim() + '">' + (x.c.indexOf('br') >= 0 ? BR : '') + x.t + '</span>'; }); });
      grid.innerHTML = h;
      S.ro.set(k ? steps[k - 1].note : 'Divide ' + commas(n) + ' by ' + d + '. Work from the greatest place: divide, multiply and subtract, then bring down the next digit.');
    }
    stepper(S, o, V, steps.length, draw);
    return {};
  }

  /* ================================================================ g4-groups */
  function groups(e, o, V) {
    var n = clamp(int(o.n, 23), 1, 60), size = clamp(int(o.size, 4), 2, 9);
    var S = shell(e, o, V, n + ' counters in equal groups');
    var made = o.made != null ? clamp(int(o.made, 0), 0, M.floor(n / size)) : M.floor(n / size);
    var wrap = el('div', 'g4g-wrap'); S.card.appendChild(wrap);
    var mk, un, out;
    function dots(k) { var h = ''; for (var i = 0; i < k; i++) h += '<i class="g4g-dot"></i>'; return h; }
    function draw() {
      var left = n - made * size, cols = size <= 4 ? size : M.ceil(size / 2), h = '';
      for (var g = 0; g < made; g++) h += '<div class="g4g-grp" style="grid-template-columns:repeat(' + cols + ',14px)" aria-hidden="true">' + dots(size) + '</div>';
      if (left) h += '<div class="g4g-left" aria-hidden="true"><b>' + left + ' left over</b>' + dots(left) + '</div>';
      wrap.innerHTML = h;
      var msg = n + ' = ' + made + ' group' + (made === 1 ? '' : 's') + ' of ' + size + ' + ' + left + ' left over.';
      if (left >= size) msg += ' <b>' + left + ' left over is enough for another group of ' + size + '.</b> Make one more!';
      else msg += ' ' + (left ? left + ' is less than ' + size + ', so no more groups fit. ' : 'Nothing is left over. ') + '<b>' + n + ' ÷ ' + size + ' = ' + made + (left ? ' R ' + left : '') + '</b>.';
      S.ro.set(msg);
      if (mk) { mk.disabled = left < size; un.disabled = made === 0; out.textContent = size; }
    }
    if (o.controls !== false) {
      mk = V.button(S.row, 'Make a group', function () { if (n - made * size >= size) { made++; draw(); } }, 'pri');
      un = V.button(S.row, 'Undo a group', function () { if (made) { made--; draw(); } });
      var stp = el('span', 'g4g-step'); stp.appendChild(el('span', '', 'Group size'));
      V.button(stp, '−', function () { if (size > 2) { size--; made = M.floor(n / size); draw(); } }).setAttribute('aria-label', 'Smaller groups');
      out = el('output'); out.setAttribute('aria-live', 'polite'); stp.appendChild(out);
      V.button(stp, '+', function () { if (size < 9) { size++; made = M.floor(n / size); draw(); } }).setAttribute('aria-label', 'Bigger groups');
      S.row.appendChild(stp);
    } else S.row.hidden = true;
    draw();
    return {};
  }

  /* ================================================================ svg helpers */
  var NS = 'http://www.w3.org/2000/svg';
  function sv(tag, at, parent) { var x = D.createElementNS(NS, tag); for (var k in at) if (at[k] != null) x.setAttribute(k, at[k]); if (parent) parent.appendChild(x); return x; }
  function svText(parent, s, x, y, at) { var t = sv('text', Object.assign({ x: x, y: y, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, at || {}), parent); t.textContent = s; return t; }
  function fr2(parent, nn, dd, x, y, size, cls, whole) { // a stacked fraction (with an optional whole number) centered at x
    var fw = M.max(String(nn).length, String(dd).length) * size * 0.62 + 4, ww = whole ? String(whole).length * size * 0.66 + 3 : 0, x0 = x - (fw + ww) / 2;
    if (whole) svText(parent, String(whole), x0 + ww / 2, y, { 'font-size': size * 1.12, 'font-weight': 600, 'class': cls });
    var cx = x0 + ww + fw / 2;
    svText(parent, String(nn), cx, y - size * 0.62, { 'font-size': size, 'font-weight': 600, 'class': cls });
    svText(parent, String(dd), cx, y + size * 0.68, { 'font-size': size, 'font-weight': 600, 'class': cls });
    sv('line', { x1: cx - fw / 2 + 1, x2: cx + fw / 2 - 1, y1: y, y2: y, 'stroke-width': 1.4, 'class': cls.replace('f-', 's-') }, parent);
  }
  function qTex(nn, dd, keepD) { // TeX for a value nn/dd: whole, fraction or mixed
    if (nn % dd === 0) return String(nn / dd);
    var r = keepD ? { n: nn, d: dd } : q(nn, dd), w = M.floor(r.n / r.d), f = r.n - w * r.d;
    return (w ? w : '') + '\\frac{' + f + '}{' + r.d + '}';
  }

  /* ================================================================ g4-lineplot */
  function lineplot(e, o, V) {
    var dd = clamp(int(o.d, 8), 1, 16), lo = parseQ(o.min != null ? o.min : 0) || q(0, 1), hi = parseQ(o.max != null ? o.max : 1) || q(1, 1);
    var i0 = M.round(lo.v * dd), i1 = M.max(i0 + 1, M.round(hi.v * dd)), reduce = o.reduce !== false;
    var cnt = {}; for (var i = i0; i <= i1; i++) cnt[i] = 0;
    (o.data || []).forEach(function (x) { var v = parseQ(x); if (!v) return; var k = clamp(M.round(v.v * dd), i0, i1); cnt[k]++; });
    var S = shell(e, o, V, 'A line plot' + (o.label ? ' of ' + o.label : ''));
    var host = el('div'); S.card.appendChild(host);
    var svg = null, last = 0;
    function labelOf(k, g, x, y) {
      var w = M.floor(k / dd), f = k - w * dd;
      if (!f) { svText(g, String(w), x, y + 2, { 'font-size': 15, 'font-weight': 700, 'class': 'f-ink' }); return; }
      var r = reduce ? q(f, dd) : { n: f, d: dd };
      fr2(g, r.n, r.d, x, y + 2, 11.5, 'f-muted', w || null);
    }
    function draw() {
      var Wd = M.max(260, host.clientWidth || 320), pad = 24, span = i1 - i0, px = (Wd - 2 * pad) / span;
      var mx = 0; for (var k in cnt) mx = M.max(mx, cnt[k]);
      var xs = M.min(16, px * 0.62), gap = xs + 4, top = 14, H0 = top + M.max(3, mx + (o.add ? 1 : 0)) * gap, ay = H0 + 6, Hh = ay + 52 + (o.label ? 20 : 0);
      host.innerHTML = '';
      svg = sv('svg', { viewBox: '0 0 ' + Wd + ' ' + Hh, width: Wd, height: Hh, role: 'img', 'aria-label': summary() }, host);
      var every = 1; while (px * every < 30 && every < dd) every *= 2;
      sv('line', { x1: pad - 10, x2: Wd - pad + 10, y1: ay, y2: ay, 'stroke-width': 2, 'class': 's-ink' }, svg);
      for (var k2 = i0; k2 <= i1; k2++) {
        var x = pad + (k2 - i0) * px, major = k2 % dd === 0, lab = (k2 % every === 0) || major;
        sv('line', { x1: x, x2: x, y1: ay - (major ? 8 : 5), y2: ay + (major ? 8 : 5), 'stroke-width': major ? 2 : 1.3, 'class': major ? 's-ink' : 's-muted' }, svg);
        if (lab) labelOf(k2, svg, x, ay + 24);
        for (var m = 0; m < cnt[k2]; m++) {
          var cy = ay - 10 - m * gap - xs / 2, h2 = xs / 2;
          sv('path', { d: 'M' + (x - h2) + ' ' + (cy - h2) + 'L' + (x + h2) + ' ' + (cy + h2) + 'M' + (x + h2) + ' ' + (cy - h2) + 'L' + (x - h2) + ' ' + (cy + h2), 'stroke-width': M.max(2, xs / 6), 'stroke-linecap': 'round', 'class': 's-blue' }, svg);
        }
        if (o.add) {
          var hit = sv('rect', { x: x - px / 2, y: 2, width: px, height: ay - 2, 'class': 'g4lp-hit', tabindex: 0, role: 'button', 'aria-label': valText(k2) + ': ' + cnt[k2] + ' X' + (cnt[k2] === 1 ? '' : 's') + '. Enter or plus adds one; Delete or minus removes one.' }, svg);
          (function (kk, ytop) {
            hit.addEventListener('click', function (ev) {
              var r = svg.getBoundingClientRect(), y = (ev.clientY - r.top) * (Hh / r.height);
              if (cnt[kk] && y >= ytop - gap / 2 - 2 && y <= ytop + gap / 2 + 2) cnt[kk]--; else cnt[kk]++;
              redraw(kk);
            });
            hit.addEventListener('keydown', function (ev) {
              if (ev.key === 'Enter' || ev.key === '+' || ev.key === ' ') { ev.preventDefault(); cnt[kk]++; redraw(kk); }
              else if ((ev.key === 'Delete' || ev.key === 'Backspace' || ev.key === '-') && cnt[kk]) { ev.preventDefault(); cnt[kk]--; redraw(kk); }
            });
          })(k2, ay - 10 - (cnt[k2] - 1) * gap - xs / 2);
        }
      }
      if (o.label) svText(svg, o.label, Wd / 2, ay + 56, { 'font-size': 13, 'class': 'f-muted' });
      say();
    }
    function redraw(k) { draw(); var f = svg.querySelectorAll('.g4lp-hit')[k - i0]; if (f) f.focus(); }
    function valText(k) { var w = M.floor(k / dd), f = k - w * dd; if (!f) return String(w); var r = reduce ? q(f, dd) : { n: f, d: dd }; return (w ? w + ' and ' : '') + r.n + '/' + r.d; }
    function summary() { var parts = []; for (var k = i0; k <= i1; k++) if (cnt[k]) parts.push(valText(k) + ': ' + cnt[k]); return 'Line plot' + (o.label ? ' of ' + o.label : '') + '. ' + (parts.length ? parts.join('; ') : 'no marks yet'); }
    function say() {
      var N = 0, mn = null, mxv = null; for (var k = i0; k <= i1; k++) if (cnt[k]) { N += cnt[k]; if (mn === null) mn = k; mxv = k; }
      if (o.stats === false) { S.ro.set(''); S.ro.el.hidden = true; return; }
      if (!N) { S.ro.set(o.add ? 'Tap above a mark on the scale to put an X there.' : 'No measurements yet.'); return; }
      S.ro.set(N + ' measurement' + (N === 1 ? '' : 's') + '. Least: $' + qTex(mn, dd, !reduce) + '$, greatest: $' + qTex(mxv, dd, !reduce) + '$. Difference: $' + qTex(mxv, dd, !reduce) + ' - ' + qTex(mn, dd, !reduce) + ' = ' + qTex(mxv - mn, dd, true) + '$.');
    }
    if (o.add) V.button(S.row, 'Clear', function () { for (var k in cnt) cnt[k] = 0; draw(); }); else S.row.hidden = true;
    draw();
    var t0 = 0;
    if ('ResizeObserver' in W) new ResizeObserver(function () { var w = host.clientWidth; if (w && M.abs(w - last) > 4) { last = w; clearTimeout(t0); t0 = setTimeout(draw, 30); } }).observe(host);
    return {};
  }

  /* ================================================================ g4-geo */
  function geo(e, o, V) {
    var gw = M.max(2, +o.w || 10), gh = M.max(2, +o.h || 6), U = 40, pad = 26;
    var S = shell(e, o, V, o.label || 'A figure');
    S.row.hidden = true; S.ro.el.hidden = !o.say; if (o.say) S.ro.set(o.say);
    var vx = -pad, vy = -pad, vbW = gw * U + 2 * pad, vbH = gh * U + 2 * pad;
    if (Array.isArray(o.crop) && o.crop.length === 4) { // show only part of the board: [x0, y0, x1, y1] in grid units
      var cr = o.crop.map(Number); pad = 8; vx = cr[0] * U - pad; vy = (gh - cr[3]) * U - pad; vbW = (cr[2] - cr[0]) * U + 2 * pad; vbH = (cr[3] - cr[1]) * U + 2 * pad;
    }
    var svg = sv('svg', { viewBox: vx + ' ' + vy + ' ' + vbW + ' ' + vbH, width: vbW, role: 'img', 'aria-label': e.getAttribute('aria-label') }, null);
    svg.style.width = M.min(vbW * 1.25, 640) + 'px';
    S.card.appendChild(svg);
    function X(p) { return p[0] * U; } function Y(p) { return (gh - p[1]) * U; }
    function dirPt(p, deg, len) { return [p[0] + len * M.cos(deg * M.PI / 180), p[1] + len * M.sin(deg * M.PI / 180)]; }
    function col(it, d) { return it.color || d; }
    function arrowHead(p, deg, c, size) { // tip at p pointing in direction deg (math degrees)
      var s = size || 12, a = deg * M.PI / 180, tx = X(p), ty = Y(p), ux = M.cos(a), uy = -M.sin(a);
      var b1 = [tx - s * ux - s * 0.45 * uy, ty - s * uy + s * 0.45 * ux], b2 = [tx - s * ux + s * 0.45 * uy, ty - s * uy - s * 0.45 * ux];
      sv('path', { d: 'M' + tx + ' ' + ty + 'L' + b1[0] + ' ' + b1[1] + 'L' + b2[0] + ' ' + b2[1] + 'Z', 'class': 'f-' + c }, svg);
    }
    function line(p1, p2, it, c) { sv('line', { x1: X(p1), y1: Y(p1), x2: X(p2), y2: Y(p2), 'stroke-width': it.width || 3, 'stroke-linecap': 'round', 'stroke-dasharray': it.dash ? '8 7' : null, 'class': 's-' + c }, svg); }
    function dot(p, c, r) { sv('circle', { cx: X(p), cy: Y(p), r: r || 5, 'class': 'f-' + c }, svg); }
    function angOf(a, b) { return M.atan2(b[1] - a[1], b[0] - a[0]) * 180 / M.PI; }
  function render(B) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (o.grid !== 'none') for (var gx = 0; gx <= gw; gx++) for (var gy = 0; gy <= gh; gy++) sv('circle', { cx: gx * U, cy: gy * U, r: 2.3, 'class': 'f-dot' }, svg);
    (o.items || []).forEach(function (it) {
      var c, a, b, dg;
      switch (it.t) {
        case 'seg':
          c = col(it, 'blue'); line(it.a, it.b, it, c); if (it.dots !== false) { dot(it.a, c); dot(it.b, c); } break;
        case 'ray':
          c = col(it, 'blue'); a = it.a; dg = it.b ? angOf(a, it.b) : +it.dir || 0;
          b = it.b ? dirPt(it.b, dg, it.ext != null ? it.ext : 0.8) : dirPt(a, dg, +it.len || 4);
          line(a, dirPt(b, dg, -0.25), it, c); arrowHead(b, dg, c); if (it.dots !== false) dot(a, c); if (it.b && it.dots !== false) dot(it.b, c); break;
        case 'line':
          c = col(it, 'blue'); dg = angOf(it.a, it.b); var ex = it.ext != null ? it.ext : 0.8;
          a = dirPt(it.a, dg, -ex); b = dirPt(it.b, dg, ex);
          line(dirPt(a, dg, 0.25), dirPt(b, dg, -0.25), it, c); arrowHead(b, dg, c); arrowHead(a, dg + 180, c);
          if (it.dots) { dot(it.a, c); dot(it.b, c); } break;
        case 'poly':
          c = col(it, 'green');
          sv('polygon', { points: it.pts.map(function (p) { return X(p) + ',' + Y(p); }).join(' '), 'stroke-width': it.width || 3, 'stroke-linejoin': 'round', 'stroke-dasharray': it.dash ? '8 7' : null, 'class': 's-' + c + ' ' + (it.fill === false ? 'f-none' : 'f-' + (c === 'blue' ? 'blueS' : c === 'red' ? 'redS' : 'greenS')) }, svg);
          if (it.dots) it.pts.forEach(function (p) { dot(p, c, 4); }); break;
        case 'angle':
          c = col(it, 'red'); var r = (+it.r || 1) * U, a1 = +it.a1 || 0, a2 = +it.a2, sw = ((a2 - a1) % 360 + 360) % 360;
          var P1 = [X(it.at) + r * M.cos(a1 * M.PI / 180), Y(it.at) - r * M.sin(a1 * M.PI / 180)], P2 = [X(it.at) + r * M.cos(a2 * M.PI / 180), Y(it.at) - r * M.sin(a2 * M.PI / 180)];
          sv('path', { d: 'M' + X(it.at) + ' ' + Y(it.at) + 'L' + P1[0] + ' ' + P1[1] + 'A' + r + ' ' + r + ' 0 ' + (sw > 180 ? 1 : 0) + ' 0 ' + P2[0] + ' ' + P2[1] + 'Z', 'class': 'f-' + (c === 'blue' ? 'blueS' : c === 'green' ? 'greenS' : 'redS') }, svg);
          sv('path', { d: 'M' + P1[0] + ' ' + P1[1] + 'A' + r + ' ' + r + ' 0 ' + (sw > 180 ? 1 : 0) + ' 0 ' + P2[0] + ' ' + P2[1], 'stroke-width': 2.2, 'class': 's-' + c + ' f-none' }, svg);
          if (it.label) { var mid = (a1 + sw / 2) * M.PI / 180, lr = r + (+it.lr || 18) * M.min(B, 1.4); svText(svg, it.label, X(it.at) + lr * M.cos(mid), Y(it.at) - lr * M.sin(mid), { 'font-size': (it.size || 15) * B, 'font-weight': 700, 'class': 'f-' + c }); }
          break;
        case 'right':
          c = col(it, 'red'); var s = (+it.s || 0.4) * U, u1 = [M.cos(it.d1 * M.PI / 180), -M.sin(it.d1 * M.PI / 180)], u2 = [M.cos(it.d2 * M.PI / 180), -M.sin(it.d2 * M.PI / 180)], cx0 = X(it.at), cy0 = Y(it.at);
          sv('path', { d: 'M' + (cx0 + s * u1[0]) + ' ' + (cy0 + s * u1[1]) + 'L' + (cx0 + s * (u1[0] + u2[0])) + ' ' + (cy0 + s * (u1[1] + u2[1])) + 'L' + (cx0 + s * u2[0]) + ' ' + (cy0 + s * u2[1]), 'stroke-width': 2, 'class': 's-' + c + ' f-none' }, svg);
          break;
        case 'ticks':
          c = col(it, 'ink'); var mx = (it.a[0] + it.b[0]) / 2, my = (it.a[1] + it.b[1]) / 2, ag = angOf(it.a, it.b) * M.PI / 180, nx = -M.sin(ag), ny = M.cos(ag), cnt = it.n || 1;
          for (var k = 0; k < cnt; k++) { var off = (k - (cnt - 1) / 2) * 0.16, px = mx + off * M.cos(ag), py = my + off * M.sin(ag); line([px - 0.18 * nx, py - 0.18 * ny], [px + 0.18 * nx, py + 0.18 * ny], { width: 2 }, c); }
          break;
        case 'pt':
          c = col(it, 'ink'); dot(it.at, c, 5.5);
          if (it.name) { var dirs = { n: [0, -1], ne: [1, -1], e: [1, 0], se: [1, 1], s: [0, 1], sw: [-1, 1], w: [-1, 0], nw: [-1, -1] }, dv = dirs[it.pos || 'ne'] || dirs.ne; svText(svg, it.name, X(it.at) + dv[0] * 15 * B, Y(it.at) + dv[1] * 15 * B, { 'font-size': 17 * B, 'font-weight': 700, 'font-style': 'italic', 'class': 'f-ink' }); }
          break;
        case 'text':
          svText(svg, it.s, X(it.at), Y(it.at), { 'font-size': (it.size || 15) * B, 'font-weight': it.bold === false ? 400 : 700, 'text-anchor': it.anchor || 'middle', 'class': 'f-' + col(it, 'ink') });
          break;
        case 'protractor':
          var pr = (+it.r || 4) * U, rot = +it.rot || 0, cxp = X(it.at), cyp = Y(it.at);
          var pp = function (deg, rr) { var t = (rot + deg) * M.PI / 180; return [cxp + rr * M.cos(t), cyp - rr * M.sin(t)]; };
          var e0 = pp(0, pr), e1 = pp(180, pr);
          sv('path', { d: 'M' + e0[0] + ' ' + e0[1] + 'A' + pr + ' ' + pr + ' 0 0 0 ' + e1[0] + ' ' + e1[1] + 'Z', 'stroke-width': 1.5, 'class': 's-blue f-blueS' }, svg);
          for (var dd2 = 0; dd2 <= 180; dd2++) { var Lt = dd2 % 10 === 0 ? 13 : dd2 % 5 === 0 ? 9 : 5, t1 = pp(dd2, pr), t2 = pp(dd2, pr - Lt); sv('line', { x1: t1[0], y1: t1[1], x2: t2[0], y2: t2[1], 'stroke-width': dd2 % 10 ? 0.9 : 1.4, 'class': 's-blue' }, svg); }
          for (dd2 = 0; dd2 <= 180; dd2 += 10) { var Bp, nudge = dd2 === 0 ? 4 : dd2 === 180 ? -4 : 0, Bp = M.min(B, 1.2), lo1 = pp(dd2 + nudge, pr - 15 - 8 * Bp), lo2 = pp(dd2 + nudge, pr - 22 - 18 * Bp); svText(svg, String(dd2), lo1[0], lo1[1], { 'font-size': 10.5 * Bp, 'font-weight': 700, 'class': 'f-blue' }); svText(svg, String(180 - dd2), lo2[0], lo2[1], { 'font-size': 9.5 * Bp, 'class': 'f-muted' }); }
          sv('line', { x1: e0[0], y1: e0[1], x2: e1[0], y2: e1[1], 'stroke-width': 1.5, 'class': 's-blue' }, svg);
          sv('circle', { cx: cxp, cy: cyp, r: 3.5, 'class': 'f-blue' }, svg);
          break;
      }
    });
  }
    /* the picture is drawn in viewBox units; when it is shown small (a phone), make the words bigger so they stay readable */
    var lastB = 0;
    function fit() {
      var avail = S.card.clientWidth || 600, shown = M.min(avail - 8, vbW * 1.25, 640), B = M.round(M.max(1, M.min(1.7, 0.95 * vbW / shown)) * 10) / 10;
      if (B !== lastB) { lastB = B; render(B); }
    }
    fit();
    if ('ResizeObserver' in W) new ResizeObserver(fit).observe(S.card);
    return {};
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    var V = ML.viz; if (!V || !V.register || !D.head) return false;
    css();
    function wrap(fn) { return function (e, o) { return fn(e, o || {}, V); }; }
    V.register('g4-column', wrap(column));
    V.register('g4-longdiv', wrap(longdiv));
    V.register('g4-groups', wrap(groups));
    V.register('g4-lineplot', wrap(lineplot));
    V.register('g4-geo', wrap(geo));
    return true;
  }
  if (!boot()) { var tries = 0, tm = setInterval(function () { if (boot() || ++tries > 200) clearInterval(tm); }, 50); }
})(window, document);
