/* Stories from History (History & Civics Ladder, course key histstory): the course's own pictures, for ages 9 and 10.
   Original SVG drawn here; vanilla JS on top of math/viz/core.js (window.MathLadder.viz). Light and dark themes
   (html[data-theme="dark"]). Drawn people use the site's one cartoon skin color (fill #ffcc4d, outline #e8a93a).
   The world outline is simplified from Natural Earth (public domain), drawn on a plain longitude/latitude grid; coasts are
   rough and the map says so. Built from /tmp/work_kids910/tools/histstory_viz.tpl.js (the outline from worldpath.py).

   Common options: quiet: true hides anything that could give a problem's answer away; interactive: false makes a still
   picture; letters: true labels items A, B, C…; ask: the index (or key) of an item whose label shows "?".

   histstory-timeline  events on a time line. events: [[year, label, endYear?], …] (years before Christ are negative:
                       -753 is 753 BC; there is no year 0); from, to (the range; default: the events plus a margin);
                       ticks (years between marks; chosen if left out); highlight: index; ask: index (label "?");
                       askYear: index (its year shows "?"); letters: true (labels A, B, C in time order).
                       Wide boxes draw a line left to right; narrow boxes (under 520 px) a list down the page.
                       mode 'count': a number line from 'from' to 'to' for counting years across BC and AD (marks:
                       [[year, label]]); it shows that 1 BC is followed by AD 1.
   histstory-map       a simple world map. places: [key or [name, lon, lat], …] (keys: PLACES below); view: 'world' |
                       'med' (the Mediterranean) | 'europe' | 'asia' | 'americas' | 'africa' | 'mideast'; ask: index (that
                       place shows "?"); numbered: true (markers numbered, names left off); routes: [[[lon, lat], …], …]
                       (dashed journeys); letters: true.
   histstory-person    cartoon people in the clothes of their time. who: [costume, …] or [[costume, caption], …];
                       costumes: COSTUMES below. quiet: captions become A, B, C.
   histstory-pic       cards with an emoji picture and a caption. items: [[emoji, caption], …]. quiet: captions become
                       A, B, C.                                                                                             */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, V = ML && ML.viz; if (!D || !V || !V.register) return;
  var NS = 'http://www.w3.org/2000/svg', M = Math;
  if (!D.getElementById('histstory-css')) {
    var st = D.createElement('style'); st.id = 'histstory-css';
    st.textContent = [
      '.hy{--hy-ink:#1d2320;--hy-mut:#5d6862;--hy-line:#56625b;--hy-pan:#fbf8f0;--hy-card:#ffffff;--hy-bd:#d8dfd9;--hy-acc:#9c2f3f;--hy-accs:#f6e3e5;',
      '--hy-sea:#dcebf5;--hy-land:#e8dcbc;--hy-coast:#a99766;--hy-bc:#7a5a20;--hy-ad:#004225;--hy-gold:#b8963e;color:var(--hy-ink);margin:0 auto;max-width:760px}',
      'html[data-theme="dark"] .hy{--hy-ink:#e6ece8;--hy-mut:#a9b8af;--hy-line:#b6c4bb;--hy-pan:#1b2b22;--hy-card:#20322a;--hy-bd:#355044;--hy-acc:#f19aa7;--hy-accs:#3d2228;',
      '--hy-sea:#16283a;--hy-land:#4a4330;--hy-coast:#8c7d55;--hy-bc:#e0c27a;--hy-ad:#6cc79a;--hy-gold:#e0c070}',
      '.hy svg{display:block;width:100%;height:auto}.hy text{font-family:inherit}.hy text:not([fill]){fill:var(--hy-ink)}.hy .hy-mut{fill:var(--hy-mut)}',
      '.hy-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:.6rem}',
      '.hy-card{background:var(--hy-card);border:2px solid var(--hy-bd);border-radius:12px;padding:.5rem .4rem;text-align:center;line-height:1.25}',
      '.hy-card .hy-e{display:block;font-size:2.3rem;line-height:1.2}.hy-card .hy-c{display:block;font-size:.9rem;margin-top:.2rem}',
      '.hy-note{text-align:center;font-size:.85rem;color:var(--hy-mut);margin:.3rem 0 0}.hy-legend{color:var(--hy-ink);font-size:.95rem}',
      '.hy-skin{fill:#ffcc4d;stroke:#e8a93a;stroke-width:2}'
    ].join('');
    D.head.appendChild(st);
  }
  function S(tag, at, parent, text) {
    var e = D.createElementNS(NS, tag);
    for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(tag, cls, parent, text) { var e = D.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  function svg(el, vb, label) { return S('svg', { viewBox: vb, role: 'img', 'aria-label': label || '' }, el); }
  function wrap(el, o) { el.innerHTML = ''; var w = H('div', 'hy', el); if (o.task) H('p', 'hy-note', w, o.task); return w; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function width(el) { var r = el.getBoundingClientRect ? el.getBoundingClientRect().width : 0; return r || (el.parentNode && el.parentNode.getBoundingClientRect ? el.parentNode.getBoundingClientRect().width : 0) || 640; }
  // "753 BC", "AD 476" (ad: always write AD; otherwise only before 1000), "1776"
  function yr(y, ad) { y = M.round(y); if (y < 0) return (-y).toLocaleString('en-US') + ' BC'; return (ad || y < 1000) ? 'AD ' + y : String(y); }
  // years on a line with no year 0: 1 BC sits just before AD 1, so a position is y (AD) or y + 1 (BC)
  function pos(y) { return y < 0 ? y + 1 : y; }
  function wrapText(s, n) { var words = String(s).split(' '), lines = [], cur = ''; words.forEach(function (w) { if ((cur + ' ' + w).trim().length > n && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) lines.push(cur); return lines; }

  /* ---------------- histstory-timeline ---------------- */
  V.register('histstory-timeline', function (el, o) {
    var w = wrap(el, o), cw = width(el);
    if (o.mode === 'count') return countLine(w, o, cw);
    var ev = (o.events || []).map(function (e, i) { return { y: +e[0], label: e[1], end: e[2] !== undefined ? +e[2] : null, i: i }; });
    var sorted = ev.slice().sort(function (a, b) { return a.y - b.y; }); sorted.forEach(function (e, k) { e.k = k; });
    var anyBC = ev.some(function (e) { return e.y < 0; }) || (o.from !== undefined && o.from < 0);
    function lab(e) { return o.ask === e.i ? '?' : o.letters ? letter(e.k) : e.label; }
    function ylab(e) { return o.askYear === e.i ? '?' : yr(e.y, anyBC) + (e.end !== null ? '–' + yr(e.end, anyBC).replace(/^AD /, '') : ''); }
    var lo = o.from !== undefined ? +o.from : sorted.length ? sorted[0].y : -1000, hi = o.to !== undefined ? +o.to : sorted.length ? M.max.apply(null, sorted.map(function (e) { return e.end !== null ? e.end : e.y; })) : 2000;
    if (o.from === undefined || o.to === undefined) { var pad = M.max(10, (hi - lo) * 0.06); if (o.from === undefined) lo -= pad; if (o.to === undefined) hi += pad; }
    if (cw < 520) { // a list down the page
      var rowH = 58, Hh = sorted.length * rowH + 20, s = svg(w, '0 0 360 ' + Hh, o.label || 'A time line');
      S('line', { x1: 112, y1: 10, x2: 112, y2: Hh - 10, stroke: 'var(--hy-line)', 'stroke-width': 3 }, s);
      var crossed = false;
      sorted.forEach(function (e, k) {
        var y = 32 + k * rowH;
        if (anyBC && !crossed && e.y > 0 && k > 0) { crossed = true; S('line', { x1: 60, x2: 160, y1: y - rowH / 2, y2: y - rowH / 2, stroke: 'var(--hy-gold)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s); S('text', { x: 164, y: y - rowH / 2 + 4, 'font-size': 11, 'class': 'hy-mut' }, s, 'BC above · AD below'); }
        var hl = o.highlight === e.i;
        S('circle', { cx: 112, cy: y, r: hl ? 9 : 7, fill: e.y < 0 ? 'var(--hy-bc)' : 'var(--hy-ad)', stroke: hl ? 'var(--hy-acc)' : 'var(--hy-pan)', 'stroke-width': 3 }, s);
        S('text', { x: 98, y: y + 5, 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700 }, s, ylab(e));
        wrapText(lab(e), 26).slice(0, 2).forEach(function (ln, j) { S('text', { x: 126, y: y + 5 + j * 17 - (wrapText(lab(e), 26).length > 1 ? 7 : 0), 'font-size': 14, 'font-weight': hl || o.ask === e.i ? 700 : 400 }, s, ln); });
      });
      return;
    }
    var Wd = 760, x0 = 30, x1 = Wd - 30, mid = 150;
    function X(y) { return x0 + (pos(y) - pos(lo)) / (pos(hi) - pos(lo)) * (x1 - x0); }
    var s2 = svg(w, '0 0 ' + Wd + ' 300', o.label || 'A time line');
    if (anyBC && lo < 0 && hi > 0) {
      S('rect', { x: x0, y: mid - 6, width: X(1) - x0, height: 12, fill: 'var(--hy-bc)', opacity: .35, rx: 6 }, s2);
      S('rect', { x: X(1), y: mid - 6, width: x1 - X(1), height: 12, fill: 'var(--hy-ad)', opacity: .35, rx: 6 }, s2);
      S('text', { x: (x0 + X(1)) / 2, y: mid + 4, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: 'var(--hy-bc)' }, s2, 'BC');
      S('text', { x: (X(1) + x1) / 2, y: mid + 4, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: 'var(--hy-ad)' }, s2, 'AD');
    } else S('rect', { x: x0, y: mid - 4, width: x1 - x0, height: 8, fill: 'var(--hy-line)', opacity: .35, rx: 4 }, s2);
    var span = hi - lo, tk = o.ticks || [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000].filter(function (t) { return span / t <= 8; })[0] || 1000;
    for (var t = M.ceil(lo / tk) * tk; t <= hi; t += tk) {
      if (t === 0) continue; var tx = X(t);
      S('line', { x1: tx, x2: tx, y1: mid + 8, y2: mid + 16, stroke: 'var(--hy-mut)' }, s2);
      S('text', { x: tx, y: mid + 30, 'text-anchor': 'middle', 'font-size': 11, 'class': 'hy-mut' }, s2, yr(t, anyBC));
    }
    var lastX = [-1e9, -1e9];
    sorted.forEach(function (e, k) {
      var ex = X(e.y), up = k % 2 === 0, row = up ? 0 : 1, lift = M.abs(ex - lastX[row]) < 150 ? 1 : 0; lastX[row] = ex;
      var hl = o.highlight === e.i, ty = up ? mid - 30 - lift * 44 : mid + 58 + lift * 44;
      if (e.end !== null) S('rect', { x: ex, y: mid - 7, width: M.max(3, X(e.end) - ex), height: 14, rx: 7, fill: 'var(--hy-gold)', opacity: .8 }, s2);
      S('line', { x1: ex, x2: ex, y1: mid, y2: up ? ty + 8 : ty - 30, stroke: hl ? 'var(--hy-acc)' : 'var(--hy-line)', 'stroke-width': hl ? 2.5 : 1.2 }, s2);
      S('circle', { cx: ex, cy: mid, r: hl ? 8 : 6, fill: e.y < 0 ? 'var(--hy-bc)' : 'var(--hy-ad)', stroke: hl ? 'var(--hy-acc)' : 'var(--hy-pan)', 'stroke-width': 2.5 }, s2);
      var lines = wrapText(lab(e), 20).slice(0, 2), anchor = ex < 90 ? 'start' : ex > Wd - 90 ? 'end' : 'middle', lx = anchor === 'start' ? ex - 6 : anchor === 'end' ? ex + 6 : ex;
      var y0 = up ? ty - (lines.length - 1) * 16 : ty;
      S('text', { x: lx, y: up ? y0 - 18 : y0 - 16, 'text-anchor': anchor, 'font-size': 12, 'font-weight': 700, fill: e.y < 0 ? 'var(--hy-bc)' : 'var(--hy-ad)' }, s2, ylab(e));
      lines.forEach(function (ln, j) { S('text', { x: lx, y: y0 + j * 16, 'text-anchor': anchor, 'font-size': 14, 'font-weight': hl || o.ask === e.i ? 700 : 400 }, s2, ln); });
    });
  });
  function countLine(w, o, cw) {
    var lo = o.from !== undefined ? +o.from : -5, hi = o.to !== undefined ? +o.to : 5, years = [];
    for (var y = lo; y <= hi; y++) if (y !== 0) years.push(y);
    var step = o.step || 1; years = years.filter(function (y) { return step === 1 || y % step === 0 || y === -1 || y === 1; });
    var n = years.length, Wd = M.max(360, n * 64), k = M.max(1, Wd / M.max(300, M.min(cw, 760))), s = svg(w, '0 0 ' + Wd + ' ' + M.round(150 * M.min(k, 1.6) + 6), 'Counting years across BC and AD');
    var f = M.min(k, 1.6);
    function X(i) { return 30 * f + i * (Wd - 60 * f) / M.max(1, n - 1); }
    var ly = 70 * f;
    S('line', { x1: 20, x2: Wd - 20, y1: ly, y2: ly, stroke: 'var(--hy-line)', 'stroke-width': 3 * f }, s);
    var marks = {}; (o.marks || []).forEach(function (m) { marks[m[0]] = m[1]; });
    years.forEach(function (y, i) {
      var x = X(i), m = marks[y];
      S('circle', { cx: x, cy: ly, r: (m !== undefined ? 8 : 5) * f, fill: y < 0 ? 'var(--hy-bc)' : 'var(--hy-ad)' }, s);
      S('text', { x: x, y: ly + 30 * f, 'text-anchor': 'middle', 'font-size': 13 * f, 'font-weight': 700 }, s, String(M.abs(y)));
      S('text', { x: x, y: ly + 46 * f, 'text-anchor': 'middle', 'font-size': 11 * f, 'class': 'hy-mut' }, s, y < 0 ? 'BC' : 'AD');
      if (m !== undefined) S('text', { x: x, y: ly - 26 * f, 'text-anchor': 'middle', 'font-size': 13 * f, 'font-weight': 700, fill: 'var(--hy-acc)' }, s, m);
    });
    var i1 = years.indexOf(-1); if (i1 >= 0 && years[i1 + 1] === 1) S('text', { x: (X(i1) + X(i1 + 1)) / 2, y: ly + 68 * f, 'text-anchor': 'middle', 'font-size': 11 * f, 'class': 'hy-mut' }, s, 'no year 0');
    S('text', { x: 20, y: 20 * f, 'font-size': 12 * f, 'class': 'hy-mut' }, s, '← earlier'); S('text', { x: Wd - 20, y: 20 * f, 'font-size': 12 * f, 'text-anchor': 'end', 'class': 'hy-mut' }, s, 'later →');
  }

  /* ---------------- histstory-map ---------------- */
  var WORLD = 'M423 205l-4-1-3-1-5-7 3 0 4-3 3-2 5 2 0 7-3 5zM421 191l-3 2-4 3-3 0-4-1-3-2 0-7 4 0 0-4 4 2 2-1 6 4 0-3-3-1 0-5 4-2 5 3 1 2-2 6 1 1-6 2 1 1zM466 127l-9 5-9 3-2-8 1-2 7 1 4-3 6-1 2 5zM576 117l-3 1-2 4 7 7 0 8-5 3-1 0 1 1-1-1 0 1-2 2-1-4 3-1 0-1 3-2 0-4 0-3-7-7 2-1-1-1-3-1-2-3 7-2 5 4zM240 143l-3 5 2 2-5 3-4-1 3 4-4 3-3-1-2-4 1-6-9-2-3-4 4-6-1 1 1 5 1-1-1-3 3-1 0-1 4 3 6 1 6-1-2 0 4 2-1 2 3 0zM502 76l-2 1 6 1-4 2-1-2-6 3 2 3-1 2-3-1 0-1-16-10-3 3-2 0 0-7 5-1 7 4 6 0 2 1 1 3 4 2 5-3zM253 227l-3 3-6-1 0-4 1-5 7 4 1 3zM51 45l5 0-4 1-1-1zM100 48l0 2-1 0-1-2-2 1 0-1-7-7 1 2-4-1 2 1-1 1-7-3 1-1-9 0-8-2-1 0 1 1-1 1-6 2 1-2-2 0 1-1 4-1 0-1-7 2-2 3 1 0-10 6-10 2 10-4 3-4-4 1-3-1-3 1 0-4-4 1-3-1 4-1-4 0-1-2 3-2 7-1 0-3-10 1-2-1 2-1-4 0 7-2 7 1-3-2 5 1-14-4 2-1 19-5 1 1 30 3 0 18 4 0 3 3 4-2 11 8zM92 48l2-1 2 3-4-2zM48 120l0-1 2 2-1 1-1-2zM211 70l7-1 4-4 2 1 2 4-7 3-1 2 2 2-7 1-3 4-1-2 1 3-2 2 0-4-1 3-1-1 2 5-1 0 1 1-2 0 1 1-5 3-5 5 3 8-1 3-1 1-5-10-4 1-5-2-5 1 2 0 1 2-12-1-5 3 1 4-4-1-5-7-3 2-7-6-9 1-7-2-5 0-3-3-4-1-4-5 2-2-3 0-3-5 0-5 2-6-2-5 3 1 1 2-1-4 56-1 1 1 6 2 6-1 7 3 5 3 0 5 0 1-1 1 1 1 7-3 9-4zM348 47l2-4 4 0-2 2 4 0-3 3 4 1 3 3 0 2 3 0-2 3 2 1-14 2 6-3-6-1 3-1-1-1 1 0 2-1 0-1-1-2-3 0 0-2-2 1 2-3-2 1zM348 52l-4-1 2-1 3 0-1 2zM473 109l0 1-3 5-5-1-2-3 5 1 4-4 1 1zM436 66l-6 1 0 2-3-1-5-1-3 2-3 0 4-2-1-1-2-2-4-1-7 1-2-1 1-1 3-3-1-2 14 0 3-1 3-1 4 4 9 2-1 3-3 2zM428 162l-7 0-2 1 2-5 2-2-1-3 6-1 2 5-2 5zM472 77l2 0 3-3 16 10 0 1-3 1-5 4-2-1-1-2-8-3-6 1-1-5-2-1 1-1 3 0-1-2-2 2-1-2 3-1 4 2zM443 77l4 1 3 3-2 0 2 5-5 0-12 0-1 2 0-2-6 2-3-2-4 2-4-1 1-1-3-3 1 0-2-3 15-4 10 2 6-1zM416 76l2 2-6 2 2-1-2 0 1-2 3-1zM383 94l-4 6-4-8 2-6 5 0-1 1 1 3-2 2 3 2zM362 138l1 10-1 0-2-10 2 0zM610 179l0-1 5-1-5 2zM560 119l2 2 0 4 5-2 3 2 1 4-1 2-4 0-1 2 1 4-6-4-2 6 3 7 3 2-2 1-2-2-3-3 0-4 2-4-3-6 2-2-3-5 1-2 4-2zM426 179l-5-3-2-7 3-2-1-2 0-3 7 0 10 7 1 8 2 4-6 2-5 0-2-4-2 0zM496 86l1-2-2-3 6-3 1 2-3 1 8 0 1 2 1 0 1 3-7 1-1-4-3 3-3 0zM600 114l3-5-1 7-2-2zM432 88l1-2 12 0-2 1-1 4-4 2-4 2-2 0 0-1 0-1 1-1-1-1 0-3zM379 65l0 1 2 0-3 2-1-1-3 1-2-1 3-2 3 0 1 0zM383 42l3-5-2 0 0-4 4-1-1-1 2-3 5-4 7-2 6 2 1 4-3 0-3 4-7 3-1 4 4 1-6 3 2 1-2 4-6 1-3-7zM252 149l-1 6-4 1-3-4 2-3 4-1 2 1zM428 152l-6 1-7-3-7-7 2-4 6 2 2 0 2-2 2 1 3-2-1-2 2 0 2 5 0 2-2 1 5 5-2 2-1 1zM428 141l-2-5-2 0 1 2-3 2-2-1-2 2-2 0-6-2-2 4-2-5-2-4 2-5 2-1 0-7 2-1 0-4 24 0 1 6 2 2-3 2-1 5-5 10zM519 144l2-4 3 5-1 2-3 1-1-4zM356 73l7 2 3 0-5 3-2 3 1 1-4 5-7 1-4-2 1-4-1-1 3-4-6-1 0-2 3-2 11 1zM613 84l4-1 2 4-1 3-5 1 0-7zM419 204l4 1 1 7-2 0 0 2 2 0 2 0-1 3-9 9-16 4-3-2-1-5-3-6 1-1 2 2 4-1 0-7 1 4 2 0 4-3 4 0 8-7zM443 163l-1-9 2-2 6-2 6-6 2-3 0-4 5-1 0 3-5 9-15 15zM405 62l-1 1-10 1 0-1 4-2 7 1zM393 67l-2 2-4 0 0-2 5-1 1 1zM339 143l-2 3-4-4 5-2 1 3zM405 72l0 3-2 1-1-3-1 1-3-1 0-3 0-2 2 0 5 4zM335 130l2 5-4 0-6 0-1-1 6-1-5 0-2-3 2-2 1-1 3 0 4 3zM464 122l-6 1-4 3-7-1-1 2-8-10-1-5-8-8 1-3 5-1 1-1-2-2 4-1 11 6 4 0 4 1 5 7 1 1 2 3 5 1 1 1-1 4-6 2zM419 163l2-1 0 3-3 0 1-2zM0 30l0-8 9 3 3 3-1-2 2 0 7 2-6 1 2 1-2 1-11-2 0-2-3 1 1 1-1 1zM621 75l2-2-1-3 4 0 3-7-7 2-1-3-6-2-4-6-9-1-2 1 1 2-2 4-6 0-4-1-7 3-5-1-4-2-8 0-1-2-6-1-2 1 0 3-2 1-9-3-9 4-1 0-8-4-7 0-7-6 1-1-7 2 0-1-5 0-1-3-3 0-16 3 2 2-4 2 3 2-1 1-13 0-2-2-5 0-5 3-2-1-2 4 5 4-4 4 3 5-1 2-3-2-5-1-4-1-2-1-1 0-1 0-7-3 4-2-1-1 3-1-3 0 3-2 1-3-9-2-4-4-3 1-1-2 2-1-3-3 0-1-6-1-1-3 1-4 4-1-4-1 7-5-3-1 0-4-2-3 2-1-3-1 1-2 4-2 20 5 0 1-5 2-13-2 6 2 0 3 5 1 1-1-2-1 6 1 1-1-1-1 4-2 4 1 0-5-1 0 5 0 1 1-3 1 3 1 15-4 1 0-2 1 11-1 1 1 3-1-2-1 2-1 15 3 1-1-4-1 1-2-2-1 6-4 4 0 3 1-2 2 1 1 0 4 2 1-4 3-5 0 6 2 6-4-1-1 1-1 3 0 1 2 4 1-3-1 0-2-7 0 1-3-3-2 4-1 0-2 1 1 0 2 1 1 6 0-6-2 5-1 9 2-2 1 2 2 1-3-5-2-1-2 12-1-1 1 1 1-1-1 3-1-3-1 2-1 12-2 13 0-1-1 5 0-1-1 6-1 4 0-4 1 7 0-2 1 9 0 6 1-18 6 11-2 5 0 1 3 1-2 18 1 3-2 9 2 1 1-2 0 2 1-3-1 6 4 3-3 15 1-1-1 1 0-2-1 3-1 12 1-5 0 6 1-4 1 9-1-1 1 7 1 14 0 4 4 2-1 10 0 6 1 0-2 17 1 2 1 0 8-11 1 6-1 4 5-5-1-13 6-3-1-10 1-4 4 2 0 1 4-3 0 0 2-4 2 0 2-3 0-4 4-2-9 1-2 19-12-4 0 0 2-7 2 0-3-5 0-6 4 1 2-7 0 2 0-6-2-13 1-4 2-11 7 3 1-1 1 2-1-1 2 5-2 4 3-3 9-10 10-4 2-2-2-3 2zM468 12l10-4 20-2-15 3-9 4-6-1zM463 16l3-2 7 0-2 2 4 3-8-1 1 0-1-1-4-1zM543-1l7-2 6 2-13 0zM546 1l4-1 10 0-2 1 2 1-3 0-11-1zM559 4l6-3 1 0-1 1 6 1-12 1zM634 9l4-1 13 1-3 1-4-1 2 1-8 1-4-2zM643 55l2-4 1 1 3 10-3 0-1 2 2 4-3-1 0-9-1-3zM639 13l5-1 3 2-8-1zM402 49l3 1 1 1-7 0 3-2zM427 68l3 1 3 1-5 1-3-2 2-1zM416 69l3 0-2 4-12-1-5-4 6-4 7-1 3 3 0 3zM342 76l6 1-3 4 1 1-1 4-3 0-1-3 1-7zM407 57l1 2-3 3-7-1-8-3-1-5-1-1 11-1 7 0 1 1 0 5zM600 128l1 0 0-5 4 0 0 3-2 3 1 3 4 0 0 3-3-3 0 2-4-2 1-1-2-1 0-2zM594 143l5-6 0 2-5 4zM604 136l2 1-2 2 0-3zM605 140l2-2 0 3-2-1zM609 135l2 1 0 2-2-3zM604 146l3-3 1 1 3-2 0-2 2 2 0 4-1 1 0-2-1 1 0 3-3-2 0-2-4 1zM220 168l-6 2-2 5 2 4 2 1 3-1 0 3 2 0 2 3-2 10-2 2-11-8-6-13-4-4-1-3 2-2 0 2 3 1 1-3 6-4 0-3 5 5 6 0-1 3 1 0zM244 200l0 4 4 1 1 3 3 0-1 3-3 4-5 0 1-5-9-6 1-5 6 0 2 1zM661 165l5 3 0 2-5-5zM657 171l5 0 1-3 2 1-1 2-3 2-4-2zM642 178l0-13 7 3 2 3 4 1 1 1-2 2 7 6-5-1-4-4-3-1-3 2 1 1-2 1-3-1zM205 143l-1 3 0-3-2-1-3 1 0 2-5-1 1-3 2 1 4-1 4 2zM514 89l0 1-3 1-3 0 0 3 1 0 2 1-7 9-3 0-2 2 3 5-6 1-3-3-10 1 4-4-5-6 10 0 2-3 5-1 1-4 2 0 0-4 5-2 2 0 1 0 2 1 2 2zM466 127l-2-5 6-2 1-4-1-1 3-5 7 6-4 4 0 2-6 4-4 1zM401 22l-7 2-5 4-2 3 1 1-4 1 0 4 2 0-3 5-2-1-5 3-3 0-2-1 2-2-3 0 4-2-4 2 0-3 5 0-4 0-1-2 3 0-3 0 7-2 0-1 6-1-4 0 7-3-2 0 4-2-2 1 1-2 4 0-2-1 2 0-1-1 5-1-2 0 5-2 9-1 3-2 2 0-2 2 5-2 2 0-1 1 2-1 4 1-4 1 4 0-4 2 0-1-2-1-6 3-9-1zM389 24l3-3 1 2-4 1zM400 3l10 1-8 1 1-1-3-1zM396 0l18 0-6 2-12-2zM381 0l8 0 4 2-1-1 1-1 10 3-5 0-5 4-5-2 6-1-7 0 7-1-8 1-5-4zM617 83l-4 1-4 0 2-3-2-1 5-4 2 1 0-1 4-2 1 1-2 3-4 2 2 3zM387 133l1 1 1 3-5 9-2 1-2-1-3 4-5 1-3-4-4 0 2-10 3-5 9 2 8-1zM387 133l-8 1-9-2-3 5-1-2-1 1-5-6 7-1 1-7 16-9 4 2 2-1 2 5-1 7-4 7zM194 130l-1 8-4 0-4-4 5-4 4 0zM693 252l8-6 4-5 1 2 3-1-3 6-3 0-1 4-4 1-5-1zM705 229l4 1 0 4 2 0 0-1 1 2 5 0-1 3-2 1-3 4-2 0 2-2-3-3 1 0 1-4-5-5zM372 58l-4-1-1 0 2-3 5-1-2 5zM536 104l0 3-1 0-10-2-5-3 2-2 2-1 8 5 4 0zM407 195l4 1-9 1 0 7-2 0 0 6 0 7-4 1-2-2-1 1-2-2-2-10-6-11 24 1zM423 205l3-5 0-7-5-2-1-1 6-2 3 1-1 3 3 2 1-4-3-3 1-4 5 0 6-2 0 10-11 9 1 8-5 3 0 3-2 0 0-2-1-7zM356 90l1 6-5 1 1 1-10 5 0 2-6 1-7 11-4-1 7-11 1 0 5-3 3-7 4-3 2-4 8 2zM398 73l3 1-1 1-1 1-2-1 1-2zM536 62l9-4 9 3 2-1 0-3 2-1 6 1 1 2 8 0 4 2 5 1 7-3 4 1-2 4 6 0 2 3-4 0-8 4-3-1-1 1 1 2-3 1-11 3-17-2-2-4-9-1 0-4-6-4zM413 63l4 1 2 2 1 1-4 2 0-3-3-3zM126 95l5 0 7 2 9-1 7 6 3-2 5 7 4 1-2 7 4 7 9 1 2-5 7-1 0 1-3 5-1 1-4 0-1 1 2 3-2 0-1 3-5-4-7 1-14-7-2-6-7-6 0-2-9-10-2-1 1 4 10 13-1 1-4-4-1-2-5-3 2 0 0-2-3-3-3-5zM335 130l-4-3-3 0-1 1 1-8-2-2 0-1 8 0 0-3 2-1 0-1 0-4 7 0 0-3 7 5-3 0 2 19-12 0-2 1zM337 135l-2-5 2-1 12 0-2-19 3 0 16 10 0 2 2 0-1 7-7 1-8 3-3 6-5 1-2-5-3 1-2-1zM560 147l2 2 2-1 3 2 2 7-2 0-4-3-3-7zM595 152l-4 0-2 5-8 1-2-2 3 1 0-2 6-4 1 1 1-2 0 1 0-1 4-4 1 2 3 1-3 3zM426 188l-1-1 2-6-1-2 2 0 2 4-1 4 3 3-1 4-3-2 1-3-3-1zM447 205l2-5 0-8 5-1 4-7 3 7-1 1-1-1-5 19-3 1-2-1-2-5zM403 76l2-1 1 2-4 1-1-2 2 0zM406 51l-1-1-3-1 0-1 8-1 3 2-2 2-4 1-1-1zM379 100l4-6 7 1 1 2 7 2 2-1 0-2 3-2 7 3 0 19 0 4-2 1-16-8-2 1-2 1-4-2-5-5 0-8zM337 146l2-3 3 3 1-1 0 2 2 1 0 3-8-5zM414 219l3-2 2 2-3 2-2-2zM432 91l1 1-1 1-1 1-1 0 2-3zM413 49l-3-2-8 1 1-3 4 1 2-2 6 1 1 3-3 1zM564 115l2 3 3 1 1 1-2 1 7 7 0 3-3 1-2-1 1-2-1-4-3-2-5 2 0-4-2-2 2-2 1 1 0-3 1 0zM502 80l4-2-6-1 2-1 2-2 3 1 1-1 12 2-13 5-8 0 3-1zM457 103l-4-1 3-2 1 3zM401 74l1-1 1 3-2 0-1-1 1-1zM428 162l2-5-2-5 1-1 2-2 1 2 7 2 3-2 2 1-2 2 1 9-5 6-10-7zM502 76l-5 3-4-2-1-3-2-1-6 0-7-4-5 1 0 7-4-2-3 1 0-2-4-3 2 0 0-2 3 0 0-2-4-1-4 1-5-4 2-4 2 1 5-3 5 0 2 2 13 0 1-1-3-2 4-2-2-2 16-3 3 0 1 3 5 0 0 1 7-2-1 1 7 6 7 0 8 4-3 1-1 3-5 0-1 4-5 0 2 4-2 2-12-2-1 1-3-1-2 2zM432 95l2 0 4-2 0 3-4 1 2 2-1 1-5 1 1-3 0-1 0-1 0-1 1 0zM640 75l1-2 2 1 1-5 4 3 3-1 1 2-6 3-5-1 1 1-2 1 0-2zM619 94l2-2 2 1 0 4-3 0 1-2-2-1zM624 93l5-1-1 2-3 0-1-1zM622 91l4-2 5 0 3-4 1 1 2 0 3-4 1-4 2-1 1 5-3 8-1 0 0-1-4 2-2-1-2 3-3-3-5 2-2-1zM374 68l3-1 1 1 3-2 6 1 0 2-2 0 0 3 12 8-3-1 0 3-2 2-1-4-10-6-1-2-2-1-3 1-2-2 1-2zM385 84l6-1-1 4-5-3zM376 78l3 0 0 4-2 0-1-4zM432 93l0 1 0 1-1 0-1 1 0 1 1 0 0 1-1 3-2-3 1-1 1-3 1 0 1-1zM346 50l-2 1 4 1-1 4-7 1-1-1 3-1-2 0 2-1-2-1 0-2 6-1zM445 86l5 0 2 2-1 4 4 3 2 5-1 0-3 2-4 0-11-6 0-3 4-2 1-4 2-1zM468 85l6-1 8 3 1 2-2 5 1 3 2 1-2 2 5 6-4 4-8-2-2-2-6 1-4-3-3-4-3 0-2-5-4-3 1-4-2-2-2-5 2 0 2 1 1 0 3-1 2 2 4 4 6-1 0-1zM570 164l2-1 1 3-3-2zM550 149l5 1 11 10 1-1 2 6 3 1 0 5-3 1-6-6-6-10-7-7zM600 177l6-1-3 2-3-1zM594 178l2-1 0-1 2 1-4 1zM598 166l3-8 7 0 2-1-1 2-9 0 1 4 6-2-4 3 3 5-3 1-2-5 0 6-2 0-1-5zM570 174l2-2 7 2 3-1 6 2 1 3-19-4zM579 156l2 2 8-1 2-5 4 0 1 4 2 2-2 0-3 8-4 2 0-1-3-1-2 1-3-1-3-7 1-3zM615 157l1-1-1 2 2-1 0 2 1 1-2-1 1 2-2-4zM616 166l3 0 3 1-6-1zM610 178l0 1-3 2 1-2 1-1 1 0zM642 165l0 13-2-2-2 1-2-6-9-4-1 1-2-2 4-1-6-2 3-2 3 0 2 6 6-4 6 2zM496 112l6-1-3-5 2-2 3 0 7-9-2-1-1 0 0-3 3 0 3-1 1-1 1 0 2 4 0 1 0 1-1 0 0 2 5 3-2 2 5 3 10 2 1 0 0-3 2 1 6 1-1-2 6-3 3 0 1 2 2 1-1 0 0 2-4 1-5 9-1-3-1 1-1-1 3-3-5-1-1-1-2-1-1 1 2 2-2 1 1 0 1 5-4 1 0 2-13 10-1 10-5 5-8-17-1-11-2-1 0 3-3 0-3-3 3-1-3 0-2-2zM311 29l4-1-1-1 4 2 1-1 9-1 5 3-10 3-8-1 2-1-5-1 4-1-5 0zM404 63l2 1-6 4-2 0-5-1-1-1 2-2 10-1zM194 130l-4 0-5 4-1-1-3-2 3-2 6-1 4 2zM216 121l0 3-5-1 4 0-2-3 3 1zM239 150l-2-2 3-5 6 6-2 3 3 4-5 1-2-2 1-4-2-1zM327 135l6 0 0 2-3 1-1-2-2-1zM339 143l-1-3-5 2-3-4 3-1 0-2 4 0 2 1 3-1 2 5 1 3-2 2-1 1-3-3zM176 131l1-3 2 0-2-3 1-1 4 0 0 4 2 1-3 2-1 2-4-2zM413 77l-1 2-4 0 0 1-3-1 2 2-2 1 3 3-3 0 1 2-4-3 4 0-4-1-2-2 2-3 4-1 7 0zM360 138l2 10-6 2-2 0 1-9-1-3 6 0zM379 65l-1 0-3 0 1-3-3-1-1-1 0-2 2-5 5-1-2-2 2 0 3 2 3-1 4 2 1 5-6 2 4 2-2 2 0 1-7 0zM447 78l-4-1 0-2-3-2 1 0 1 0 2 1 4 1 5 1 0 2-3-1-3 1zM327 133l5 0-6 1 3-1-2 0zM387 156l0 2 2 0-1 2 1 4-1 1-3-1-2 1 1 2-2 1-5-7 3-1-1-2 4 0 0-2 4 0zM375 65l-3 2 2 1-1 2 2 2 0 1-3 1-4-1-2 2-3 0-7-2 2-4 0-2-7-4 6 0-1-2 5 0 4-3 7 3 1 0 3 1-1 3zM251 155l1-6 2 0 3 3-3 4-3-1zM408 28l-1-4-6-2 9 1 6-3 2 1 0 1-1 2 3 1-2 1 2 3 0 4 3 1-7 5-10 1-3-1 0-5 8-4 0-1-3-1zM431 149l-5-5 2-1 0-2 5-10 2 1 1-2 4 1 5 4-1 3 2 0 0 2 1 1 9 3-6 6-6 2-2-1-3 2-7-2-1-2zM415 45l-6-1-2-2 9-1-1 4zM433 131l1-5 3-2 3 6 6 5-1 0-5-4-4-1-1 2-2-1zM383 156l0 2-4 0 1-3 3 1zM181 131l3 2-4 0 1-2zM434 116l-24 0 0-19 8 1 4-1 6 0 0 1 2 3-2 3-3-3 7 11-1 2 3 2zM209 160l0 3-6 4-1 3-3-1 0-2 2-2-3-1 0-2 2-4 2-1 7 3zM216 124l0-3 4 0 3 2-7 1zM446 137l0 1-2 0 1-3 1 0-1 2 1 0zM214 4l14-2 4-2-6-1 11-1 1-2 8 1-5-1 10-1 2 2 1-2 7 1-3-1 2 0 11 1 1-1-3 0 8-1-10 0 7-1 34 0-12 1 21 1-17 1 17 0-3 2 8-1 15 0-17 3 2 2-5 2 6 2-8 1 5 1 1 2-5 0 5 1-5 0-1 1 4 0-3 1-11 0 11 1-1 2-4-2-4 1 3-1 0 1 6 2-1 1 1-1 1 2-11-2 3 1-7 1 13 1-8 3-12 0-4 4-7 2 1-2-1 0 0 2-4 0-2 1 2 1-3 0 2 2-5 2 2 1-2 3-2 0 2 1-2 0-3 0 1-1-2 0 0-1-4 1-2-2-1-1 1 0-3-1 1-1-3-1 2-2-2 1 3-1-2-1-2 2-1-3 2 0-3 0 2-2-3 1 2-2-3-1 6-1-5 1 5-2-5 0 5 0 1-3-8-1 8 0-5-1 2-1-3 0-1-2 0 2-3 0 2-3-5-2 1-1-9-3-17-1 3 0-6-1 9-1-13-1zM250 21l1-2 5 2-6 0zM382 49l3-1-1 2-2-1zM379 50l-2 0-1-3 3-1-2 0 4-1 1 2-3 2 0 1zM398 61l-4 2-6-1-4-2 6-2 8 3zM190 116l3-2 6 0 13 5-7 1 1-1-10-4-6 1zM387 69l4 0 2-2 5 1 0 2-6 0 3 4-8-5zM344 140l5-1 6 2-1 9-9 1 0-3-2-1 0-2 2-2-1-3zM195 141l-1 3-3-4-2 0 0-2 4 0 2 3zM421 176l-4 2 0 5 3 1 0 3-6-4-2 1-4-2-3 0-2-7-4-1 0 2-4 0-2-4-7 0-2 0 2-3 3 0 0 1 3-2 0-4 4-3 1-8 2-3 6 2 6-3 4 1 7 3 1 3-2 2-2 5-1 2 1 4 2 7zM382 168l2-1-1-2 2-1 3 1 1-1-1-4 1-2-2 0 0-2 5 1 0-2 1-2 4 0-1 8-4 3 0 4-3 2 0-1-3 0-2 1-2-2zM217 136l-4 6 3 4 9 2-1 6 2 4-1-2-5 1 2 2-2 0 1 3-1 6-1 0 1-3-6 0-5-5-7-3 4-5-2-6 1-3 2 1 3-6 7-3 0 1zM576 117l-5-4-7 2-1 0 0 3-1-1-4-1 0-4-3 0 2-6-2-2-2-1-1-2-3 0-6 3-3-1-2 2-2-1-4 0-8-5-2 1-5-3 0-2 1 0 0-1 0-1-2-4-1 0-1 0-2-2-2-1-1 0 1 0-1-3-1 0-1-2 13-5 2-2-2-4 5 0 1-4 5 0 1-3 3-1 1 0 6 4 0 4 9 1 2 4 17 2 11-3 3-1-1-2 1-1 3 1 8-4 4 0-2-3-6 0 2-4 6 0 2-4-1-2 2-1 9 1 4 6 6 2 1 3 7-2-3 7-4 0 1 3-2 2-1-1-4 2 0 1-2-1-5 4-7 3 3-4-3-1-6 4 0 1 3 3 3-2 3 1-7 5 6 6-4 0 4 2-3 1 3 1-1 3-5 5 1 2-6 4-4 1-1 0-1-1 0 2-6 1-1 2 0-2-4 0zM577 122l2-2 3 0-3 4-2-2zM219 197l2-2 3 11 2 0-1 2-2 1 0 5-2 3-2 5 1 6-2 6 0 3-2 8 1 5-1 0 1 0 0 3-4 6 3 5 7 1-5 1-1 2-2-1 3-1-4 0 3-1-5 0-1-1 4 0-5-3 2 1-1-2 1-1-1-3 2 0-2-1 0-1-2 0 3-3 1 2 2-4-2-1 2-4-3-2 2-4-1-4 4-9 0-7 3-15-1-6zM223 265l0 5-7-1 3 0 0-2 2 2-2-3 4-1zM408 121l0 7-2 1-2 5 2 4-8 4-1 2-6 1-3-4 3-1-2-6-1 0-1-1 4-7 1-7-2-5 2-1 16 8zM408 143l7 7-4-1-6 3-6-2-2 3-4 0-1 2-3-7 2-3 6-1 1-2 8-4 2 5zM103 59l6 0 4 4-10-4zM100 48l-11-8-4 2-3-3-4 0 0-18 11 2-1-1 3-1 10-1-6 2 9-3 5 2 2-1 0 1 5-1 13 2 3 1-2 1 10 0 5 3-1-3 4-1-5 0 5-1 9 3 11-1-1 1 2 1-2 0 2 0 0-2 4-1-2-1 2-1-6-1 1-1-1-2 3-1 4 1 3 3-3 1 5 0-1 0 2 2 1-1 3 0-1 2 2 2 5-4-1-2 6 1 2 1-2 1 2 3-4 1-3-1 2 2-5-1 1 1-3 1-8-1 9 2-6 3-7-1 6 1-5 2-3 4-1 3 1 1 3 0 1 3 4 0 10 4 6 0 1 6 6 2 1-3-2-4 6-4-1-3-3-1 2-3-1-2 1-1-1-2 8 0 9 3 0 2-2 0 2 1-1 1 3 0 0 2 5-1 3-4 4 4-1 1 2 0-1 1 2 2-2-1 4 2 0 2 6 1-6 2 5-1 4 2-1 1 2 1-9 3-13 1-8 3 1 1-1 2-8 4-9 4-7 3-1-1 1-1 0-1 0-5-5-3-7-3-6 1-6-2-1-1-56 1-4-2 0-2-5 0 2-1-2 0-1-1 2-1-2 1 0-2-2-1 1-1-2 1-2 0 2-4-1 1 0-2zM133 4l8 0-5 1-3-1zM114 8l8-3 7 0-3 2-2-1-4 2-6 0zM125 9l5 0-4 0 4-1-3 0 3-1 12 2-3-2 3-1 2 2 5 1-1 1-13 1-3-1 6-1-13 0zM122 16l9-3 1 1-1 1 3-1 3 1 3-1 4 3 1-1-1-2 2-1 3 1 3 4 6 3-5 0 3 1-2 0-7-1-13 2-8-3 11-1-12 0-2-1 6-1-7-1zM108 16l4-4-1-1 14 1 4 1-15 5-6-2zM177-3l13-2 11 1-5-1 13-1 28 1-14 2 7 0-11 2-3 1 3 0-2 0-11 1 5 1-8 0 8 1-8 2-6 0 7 1-5 2-18-2 5 0-2-1 1-1 9 1-5 0 1-2-5 1 1-2 10 0-5 0 2 0-6-3 12 2-5-2 12-1-3 0 3-1-17 2-2 0 6-1-9 1 6-2-13 0zM167 10l3-1 3 1-6 0zM155 14l5 0-3-1 2 0-1-1 7 0 1 1-3 1 4 1-4 2-8-3zM186 33l3-5 10 4-5 0-5 2-3-1zM154 9l3-1-1-1 5 1-3-1 5 0 2 0 0 2-4 1-2-1 2 0-7 0zM149 2l8 0 5 2-11-1-1 0 3 0-4-1zM166 0l5 0-3-1 4 0-3-1 4-1 17 4-13 3-5-2 5-1-7 0 1 0-5-1zM166 6l12 1 3 0-4 1 5 1 16 0 3 1-24 1-3-4-8-1zM163 2l7 1-4 1-3-2zM169 13l10-1-3 2-4 0 1 1-1 1-2 0-1-3zM161 22l3-2 5 2-8 0zM237 68l2-2-1 3 2-1-3 0zM226 70l-2-4-2-1-4 4-7 1 13-7 5-2 2 2-4 1 4 1-2 1 2 2 7 1-6 2-3 2-1-2 5-2-3 0 1-1-5 2zM241 64l7-7-2 4 2-1 2 2 3-1-1 2 2 0-2 1 2 0 1 1-1 2-2-1 0-2-4 2 2-1-9-1zM180 16l3-3 7-1-3 2 3 3-3 1 3 0 1-1-3-1 3 0-2-2 2 0-2 0 8-1 2 2-1 1 9-1 4 1-1 1 7 0-2 1 3 0-1 2 4-2 2 1-3 1 6 1-5 0 6 0-6 1 16 5-4 1 0 2-4-2 2-1-8 1 8 5-1-1 0 3-8-2 6 3-5 0-6-2-4-3-9 0 1-2 8 0-2-1 5-3-6-3-3 1 2-1-7-3 0 1-4 1-14-2-3-1 5 0-6-2zM231 67l5 0-2 1-3-1zM205 25l5-1-1 1-4 0zM198 13l10 1-7 0-3-1zM377 150l3-4 2 1 2-1 5-9-1-3 1 0 2 6-3 1 3 4-2 3 3 7 0 2-5-1-4 0-3-1-1-3-2-2zM575 131l0 4-3 2 0 1-3 1-3-2-1-4 1-2 4 0 2 1 3-1zM560 119l-4 2-1 2 3 5-2 2 3 6-2 4-2-13-1-2-3 4-3-1 1-3-2-4 1 0-3-3 0-2 5-9 4-1 0-2 1 0 2 2-2 6 3 0 0 4 4 1-2 2zM421 165l1 2-3 2-1-4 3 0zM362 138l-2 0-6 0 1 3-6-2 3-6 8-3 5 6-3 2zM416 76l-3 1-7 0-1-2 0-3 12 1-2 2 1 1zM226 158l3 1 4-3-3-4 4 1 5-3 2 1-1 4 2 2 5-1 4-1 3 1 3-4 3 6-5 5 3-1 1 2 2-1 0 2 4-4 6 2 0 3 2-1 7 1 6 4 3 0 1 6-6 10-2 0 0 9-4 9-2 2-5 0-8 5-1 6-6 7 3-3-1-1-5 7-1-3-7-4 7-6 0-3-1 0 1-3-3 0-1-3-4-1 0-4 1-3-2-4-3 0-1-5-9-4-1-5-8 3-2 0 0-3-3 1-2-1-2-4 2-5 6-2 1-6-1-3 2 0-2-2 5-1 1 2zM258 162l2-2 3 1-3 3-2-2zM411 196l5 7 3 1-8 7-4 0-4 3-2 0-1-4 0-6 2 0 0-7 9-1zM398 73l-1 2-2-1-3-4 6 0 0 3zM221 195l2-10-2-3 8-3 1 5 9 4 1 5 3 0 2 4-1 3-2-1-6 0-1 5-3 0-1 2-3-2-2 2-2 0-3-11zM543 104l1 2-6-1 2-2 3 1zM363 148l-1-10 3-2 1-1 1 2-2 10-2 1zM182 124l1-1-1 5 0-4zM368 57l4 1 0 2 0 1-7-3 2-1 1 0zM424 56l-3 1-14 0 0-5 4-1 2-2 3-1 6 1 0 1 3 3-2 1 1 2zM538 116l-1-5-1 0 2-1-2-2 1-1 2 1 1 1 5 1-3 3 1 1 1-1 1 3 0 2-4-5-1 3-2 0zM458 83l-2-2-3 1-3-5 3 1 0-2 3 2 1-2 4 3-2 1-1 3zM379 65l7 0 0-1 2-2 6 1 0 1-2 2-5 1-6-1-2 0 0-1zM586 212l1 1 0-2 1 2-1-4 1-5 0 1 5-4 9-2 3-5 1-1 1 2 0-2 2 0 3-5 3 0 1 3 3-1 2-5 4-1-1-1 8 2 1-1 1 1-3 5 10 5 4-14 3 8 3 1 2 8 4 2 2 5 2 0 5 6 1 7-7 17-7 3-3-2-3 2-6-2-2-5-3 0 0-3-2 2 2-5-5 5-3-5-6-2-10 2-6 3-14 2-2-1 1-5-5-12zM649 242l8 0-1 4-4 1-3-5zM450 81l-3-3 3-1 3 5-1 0-2-1zM245 220l-1 5-1 4 4 5-3 3-9 1 0 4-5 0 0 2 2 0 1 2-3 0 1 0-2 4-4 2 3 4-4 4-1 0-2 3 2 2-7-1-3-5 4-6 0-3-1 0 1 0-1-5 2-8 0-3 2-6-1-6 2-5 2-3 0-5 2-1 1-2 2-2 3 2 1-2 3 0 9 6-1 5 5 0 3-4 1 0 0 3-7 6zM223 270l0-5 2 3 5 1-7 1zM408 182l0 4-4 0 0 7 3 2-24-1 2-7 3-3-3-12 1 0 7 0 2 4 4 0 0-2 4 1 2 7 3 0zM377 86l-2 6 4 8 0 8 5 5-16 9-2 0 0-2-16-10-7-5 0-2 10-5-1-1 5-1-1-6 7-3 14-1zM399 76l1-1 1 1 1 2-2 3-1-5zM493 85l3 1 3 0 3-3 1 4 7-1-1 0-2 0-5 2 0 4-2 0-1 4-5 1-2 3-10 0 2-2-2-1-1-3 2-5 2 1 5-4 3-1z';
  // [name, longitude, latitude]
  var PLACES = {
    jericho: ['Jericho', 35.4, 31.9], catal: ['Çatalhöyük', 32.8, 37.7], ur: ['Ur', 46.1, 30.96], babylon: ['Babylon', 44.4, 32.5], uruk: ['Uruk', 45.6, 31.3],
    giza: ['Giza', 31.1, 30.0], thebes: ['Thebes (Luxor)', 32.6, 25.7], alexandria: ['Alexandria', 29.9, 31.2], meroe: ['Meroë', 33.7, 16.9],
    mohenjo: ['Mohenjo-daro', 68.1, 27.3], harappa: ['Harappa', 72.9, 30.6], anyang: ['Anyang', 114.3, 36.1], xian: ["Chang'an (Xi'an)", 108.9, 34.3],
    athens: ['Athens', 23.7, 38.0], sparta: ['Sparta', 22.4, 37.1], olympia: ['Olympia', 21.6, 37.6], rome: ['Rome', 12.5, 41.9], carthage: ['Carthage', 10.3, 36.9],
    pompeii: ['Pompeii', 14.5, 40.75], constantinople: ['Constantinople', 29.0, 41.0], jerusalem: ['Jerusalem', 35.2, 31.8], mecca: ['Mecca', 39.8, 21.4],
    medina: ['Medina', 39.6, 24.5], baghdad: ['Baghdad', 44.4, 33.3], cordoba: ['Córdoba', -4.8, 37.9], aachen: ['Aachen', 6.1, 50.8], paris: ['Paris', 2.35, 48.85],
    london: ['London', -0.1, 51.5], scandinavia: ['Scandinavia', 15, 62], iceland: ['Iceland', -19, 64.9], vinland: ["L'Anse aux Meadows", -55.5, 51.6],
    kyoto: ['Kyoto', 135.8, 35.0], timbuktu: ['Timbuktu', -3.0, 16.8], zimbabwe: ['Great Zimbabwe', 30.9, -20.3], aksum: ['Aksum', 38.7, 14.1],
    tikal: ['Tikal', -89.6, 17.2], tenochtitlan: ['Tenochtitlan', -99.1, 19.4], cusco: ['Cusco', -72.0, -13.5], machu: ['Machu Picchu', -72.5, -13.2],
    florence: ['Florence', 11.25, 43.77], mainz: ['Mainz', 8.27, 50.0], wittenberg: ['Wittenberg', 12.65, 51.87], lisbon: ['Lisbon', -9.1, 38.7], seville: ['Seville', -6.0, 37.4],
    sansalvador: ['San Salvador island', -74.5, 24.1], calicut: ['Calicut', 75.8, 11.25], nanjing: ['Nanjing', 118.8, 32.06], philadelphia: ['Philadelphia', -75.2, 39.95],
    boston: ['Boston', -71.06, 42.36], manchester: ['Manchester', -2.24, 53.48], washington: ['Washington, D.C.', -77.0, 38.9], kittyhawk: ['Kitty Hawk', -75.7, 36.0],
    newyork: ['New York', -74.0, 40.7], berlin: ['Berlin', 13.4, 52.5], moscow: ['Moscow', 37.6, 55.75], beijing: ['Beijing', 116.4, 39.9], delhi: ['Delhi', 77.2, 28.6],
    capecanaveral: ['Cape Canaveral', -80.6, 28.4], tokyo: ['Tokyo', 139.7, 35.7], cairo: ['Cairo', 31.2, 30.04], lumbini: ['Lumbini', 83.3, 27.5], varanasi: ['Varanasi', 83.0, 25.3],
    nile: ['Nile River', 31.5, 24.5], tigris: ['Tigris and Euphrates', 45.0, 33.5], indus: ['Indus River', 70.5, 28.5], yellow: ['Yellow River', 113.0, 35.5],
    greece: ['Greece', 22.5, 39.0], italy: ['Italy', 13.0, 42.5], egypt: ['Egypt', 30.5, 26.5], china: ['China', 104, 34], india: ['India', 79, 22], japan: ['Japan', 138.5, 36.5],
    persia: ['Persia', 53, 32], mali: ['Mali', -4, 15], spain: ['Spain', -3.7, 40.4], portugal: ['Portugal', -8.2, 39.6], england: ['England', -1.5, 52.5], france: ['France', 2.5, 46.5],
    americas: ['the Americas', -90, 15], europe: ['Europe', 15, 50], africa: ['Africa', 20, 5], asia: ['Asia', 90, 45], australia: ['Australia', 134, -25], antarctica: ['Antarctica', 0, -75]
  };
  var VIEWS = { world: [-180, 80, 180, -60], med: [-12, 50, 56, 20], europe: [-25, 66, 45, 34], asia: [55, 55, 150, 5], americas: [-130, 60, -30, -45], africa: [-20, 38, 55, -36], mideast: [20, 42, 72, 12] };
  function P(lon, lat) { return [(lon + 180) * 2, (80 - lat) * 2]; }
  V.register('histstory-map', function (el, o) {
    var w = wrap(el, o), cw = width(el), vw = VIEWS[o.view] || VIEWS.world, a = P(vw[0], vw[1]), b = P(vw[2], vw[3]);
    var vbw = b[0] - a[0], vbh = b[1] - a[1], u = vbw / M.max(300, M.min(cw, 760)); // units per screen pixel
    var s = svg(w, a[0] + ' ' + a[1] + ' ' + vbw + ' ' + vbh, o.label || 'A map');
    S('rect', { x: a[0], y: a[1], width: vbw, height: vbh, fill: 'var(--hy-sea)' }, s);
    for (var lo = -150; lo <= 180; lo += 30) { var g1 = P(lo, 0); S('line', { x1: g1[0], x2: g1[0], y1: a[1], y2: b[1], stroke: 'var(--hy-bd)', 'stroke-width': u * .7 }, s); }
    for (var la = -60; la <= 60; la += 30) { var g2 = P(0, la); S('line', { x1: a[0], x2: b[0], y1: g2[1], y2: g2[1], stroke: 'var(--hy-bd)', 'stroke-width': u * (la === 0 ? 1.4 : .7) }, s); }
    S('path', { d: WORLD, fill: 'var(--hy-land)', stroke: 'var(--hy-land)', 'stroke-width': u * .9, 'stroke-linejoin': 'round' }, s);
    (o.routes || []).forEach(function (r) {
      var d = r.map(function (p, i) { var q = P(p[0], p[1]); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('');
      S('path', { d: d, fill: 'none', stroke: 'var(--hy-acc)', 'stroke-width': u * 2.2, 'stroke-dasharray': (u * 6) + ' ' + (u * 4), 'stroke-linecap': 'round' }, s);
    });
    var fs = 13 * u, placed = [], list = (o.places || []).map(function (pl) { return typeof pl === 'string' ? PLACES[pl] : pl; });
    // places so close that their names would collide: number the markers and list the names under the map
    var crowded = !o.quiet && !o.letters && list.some(function (p, i) { return p && list.some(function (r, j) { if (!r || j <= i) return false; var a1 = P(p[1], p[2]), b1 = P(r[1], r[2]); return M.abs(a1[0] - b1[0]) < fs * 7 && M.abs(a1[1] - b1[1]) < fs * 1.6; }); });
    var numbered = o.numbered || crowded;
    (o.places || []).forEach(function (pl, i) {
      var p = list[i]; if (!p) return;
      var q = P(p[1], p[2]), label = o.ask === i || o.ask === pl ? '?' : numbered ? String(i + 1) : o.letters ? letter(i) : p[0];
      S('circle', { cx: q[0], cy: q[1], r: u * 5, fill: 'var(--hy-acc)', stroke: 'var(--hy-card)', 'stroke-width': u * 1.6 }, s);
      if (o.quiet && o.ask !== undefined && label !== '?') return; // a question map names only the asked place
      var right = q[0] < a[0] + vbw * 0.72, dy = 0;
      placed.forEach(function (pp) { if (M.abs(pp[0] - q[0]) < fs * 6 && M.abs(pp[1] - (q[1] + dy)) < fs * 1.1) dy += fs * 1.15; });
      placed.push([q[0], q[1] + dy]);
      var t = S('text', { x: q[0] + (right ? u * 8 : -u * 8), y: q[1] + fs * .35 + dy, 'font-size': fs, 'font-weight': 700, 'text-anchor': right ? 'start' : 'end', 'paint-order': 'stroke', stroke: 'var(--hy-sea)', 'stroke-width': u * 3, 'stroke-linejoin': 'round' }, s, label);
      t.setAttribute('fill', 'var(--hy-ink)');
    });
    if (crowded) H('p', 'hy-note hy-legend', w, list.map(function (p, i) { return p ? (i + 1) + ' ' + p[0] : ''; }).filter(String).join(' · '));
    H('p', 'hy-note', w, o.note || 'Coastlines are simplified.');
  });

  /* ---------------- histstory-person ---------------- */
  // costume: [robe color, robe dark, hat kind, prop, caption]
  var COSTUMES = {
    farmer: ['#9c7a4a', '#6f5532', 'none', 'sickle', 'Early farmer'], scribe: ['#f2ead7', '#bba98a', 'band', 'tablet', 'Scribe'],
    pharaoh: ['#f7f2e2', '#c9b98f', 'nemes', 'crook', 'Pharaoh'], greek: ['#e9eef7', '#9aa9c4', 'none', 'scroll', 'Ancient Greek'],
    roman: ['#f4f0e6', '#b44a3c', 'wreath', 'scroll', 'Roman'], monk: ['#7a5a3a', '#4e3a26', 'hood', 'book', 'Monk'],
    knight: ['#9aa5ad', '#5c666e', 'helmet', 'shield', 'Knight'], scholar: ['#2f5f8a', '#1d3d5a', 'cap', 'book', 'Scholar'],
    merchant: ['#5b8a3a', '#3a5c24', 'turban', 'bag', 'Merchant'], samurai: ['#3b4f8a', '#24325a', 'topknot', 'fan', 'Samurai'],
    viking: ['#8a5a3a', '#5a3a24', 'helmet2', 'oar', 'Viking sailor'], explorer: ['#3a4a6a', '#24304a', 'tricorn', 'spyglass', 'Explorer'],
    artist: ['#a03a5a', '#6a2440', 'beret', 'brush', 'Painter'], colonist: ['#4a5a7a', '#2e3a52', 'tricorn', 'quill', 'Colonist'],
    inventor: ['#4a4a4a', '#2a2a2a', 'none', 'bulb', 'Inventor'], worker: ['#3c6e91', '#264a63', 'flatcap', 'wrench', 'Factory worker'],
    astronaut: ['#f2f2f2', '#b9b9b9', 'space', 'flag', 'Astronaut'], king: ['#6a2a8a', '#45185a', 'crown', 'scepter', 'King'], queen: ['#8a2a5a', '#5a183a', 'crown', 'scepter', 'Queen']
  };
  function person(s, x, c, cap) {
    var C = COSTUMES[c] || COSTUMES.greek, g = S('g', {}, s), y = 40;
    // body: a robe, two hands, a head
    S('path', { d: 'M' + (x - 34) + ' ' + (y + 190) + 'L' + (x - 24) + ' ' + (y + 92) + 'Q' + x + ' ' + (y + 78) + ' ' + (x + 24) + ' ' + (y + 92) + 'L' + (x + 34) + ' ' + (y + 190) + 'Z', fill: C[0], stroke: C[1], 'stroke-width': 2 }, g);
    if (c === 'astronaut') S('rect', { x: x - 14, y: y + 110, width: 28, height: 20, rx: 4, fill: '#5b7db8' }, g);
    if (c === 'knight') S('path', { d: 'M' + (x - 10) + ' ' + (y + 100) + 'h20v40h-20z', fill: '#c92a2a', opacity: .8 }, g);
    S('circle', { cx: x - 30, cy: y + 140, r: 8, 'class': 'hy-skin' }, g); S('circle', { cx: x + 30, cy: y + 140, r: 8, 'class': 'hy-skin' }, g);
    S('rect', { x: x - 6, y: y + 76, width: 12, height: 12, 'class': 'hy-skin' }, g);
    S('circle', { cx: x, cy: y + 52, r: 28, 'class': 'hy-skin' }, g);
    S('circle', { cx: x - 10, cy: y + 50, r: 3, fill: '#3b2a12' }, g); S('circle', { cx: x + 10, cy: y + 50, r: 3, fill: '#3b2a12' }, g);
    S('path', { d: 'M' + (x - 9) + ' ' + (y + 63) + 'Q' + x + ' ' + (y + 70) + ' ' + (x + 9) + ' ' + (y + 63), fill: 'none', stroke: '#3b2a12', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    var h = C[2];
    if (h === 'nemes') { S('path', { d: 'M' + (x - 30) + ' ' + (y + 46) + 'Q' + x + ' ' + (y + 6) + ' ' + (x + 30) + ' ' + (y + 46) + 'L' + (x + 36) + ' ' + (y + 96) + 'L' + (x + 24) + ' ' + (y + 96) + 'L' + (x + 24) + ' ' + (y + 44) + 'Q' + x + ' ' + (y + 28) + ' ' + (x - 24) + ' ' + (y + 44) + 'L' + (x - 24) + ' ' + (y + 96) + 'L' + (x - 36) + ' ' + (y + 96) + 'Z', fill: '#e8b83a', stroke: '#2a4a8a', 'stroke-width': 2 }, g); }
    else if (h === 'wreath') { for (var i = -3; i <= 3; i++) S('ellipse', { cx: x + i * 8, cy: y + 30 + M.abs(i) * 2, rx: 5, ry: 3, fill: '#4f8a3a' }, g); }
    else if (h === 'band') S('rect', { x: x - 28, y: y + 32, width: 56, height: 7, fill: '#2a6a8a' }, g);
    else if (h === 'hood') S('path', { d: 'M' + (x - 34) + ' ' + (y + 80) + 'Q' + (x - 38) + ' ' + (y + 14) + ' ' + x + ' ' + (y + 14) + 'Q' + (x + 38) + ' ' + (y + 14) + ' ' + (x + 34) + ' ' + (y + 80) + 'L' + (x + 24) + ' ' + (y + 80) + 'Q' + (x + 28) + ' ' + (y + 30) + ' ' + x + ' ' + (y + 28) + 'Q' + (x - 28) + ' ' + (y + 30) + ' ' + (x - 24) + ' ' + (y + 80) + 'Z', fill: C[0], stroke: C[1], 'stroke-width': 2 }, g);
    else if (h === 'helmet') { S('path', { d: 'M' + (x - 30) + ' ' + (y + 52) + 'Q' + (x - 30) + ' ' + (y + 18) + ' ' + x + ' ' + (y + 18) + 'Q' + (x + 30) + ' ' + (y + 18) + ' ' + (x + 30) + ' ' + (y + 52) + 'L' + (x + 30) + ' ' + (y + 40) + 'L' + (x - 30) + ' ' + (y + 40) + 'Z', fill: '#9aa5ad', stroke: '#5c666e', 'stroke-width': 2 }, g); S('path', { d: 'M' + (x - 2) + ' ' + (y + 40) + 'v20h4v-20z', fill: '#5c666e' }, g); }
    else if (h === 'helmet2') { S('path', { d: 'M' + (x - 29) + ' ' + (y + 44) + 'Q' + x + ' ' + (y + 10) + ' ' + (x + 29) + ' ' + (y + 44) + 'Z', fill: '#9aa5ad', stroke: '#5c666e', 'stroke-width': 2 }, g); S('rect', { x: x - 30, y: y + 42, width: 60, height: 6, fill: '#7a6a3a' }, g); }
    else if (h === 'cap') { S('rect', { x: x - 30, y: y + 22, width: 60, height: 8, fill: '#1d1d1d' }, g); S('rect', { x: x - 20, y: y + 28, width: 40, height: 10, fill: '#1d1d1d' }, g); S('line', { x1: x + 26, y1: y + 26, x2: x + 32, y2: y + 46, stroke: '#e0c070', 'stroke-width': 2 }, g); }
    else if (h === 'turban') S('path', { d: 'M' + (x - 30) + ' ' + (y + 42) + 'Q' + (x - 32) + ' ' + (y + 14) + ' ' + x + ' ' + (y + 14) + 'Q' + (x + 32) + ' ' + (y + 14) + ' ' + (x + 30) + ' ' + (y + 42) + 'Q' + x + ' ' + (y + 32) + ' ' + (x - 30) + ' ' + (y + 42) + 'Z', fill: '#f2ead7', stroke: '#bba98a', 'stroke-width': 2 }, g);
    else if (h === 'topknot') { S('path', { d: 'M' + (x - 28) + ' ' + (y + 44) + 'Q' + x + ' ' + (y + 16) + ' ' + (x + 28) + ' ' + (y + 44) + 'Q' + x + ' ' + (y + 30) + ' ' + (x - 28) + ' ' + (y + 44) + 'Z', fill: '#2a2a2a' }, g); S('ellipse', { cx: x, cy: y + 20, rx: 7, ry: 5, fill: '#2a2a2a' }, g); }
    else if (h === 'tricorn') S('path', { d: 'M' + (x - 38) + ' ' + (y + 38) + 'Q' + x + ' ' + (y + 4) + ' ' + (x + 38) + ' ' + (y + 38) + 'Q' + x + ' ' + (y + 26) + ' ' + (x - 38) + ' ' + (y + 38) + 'Z', fill: '#24304a' }, g);
    else if (h === 'beret') S('ellipse', { cx: x + 4, cy: y + 28, rx: 30, ry: 10, fill: '#2a2a5a' }, g);
    else if (h === 'flatcap') S('path', { d: 'M' + (x - 28) + ' ' + (y + 36) + 'Q' + x + ' ' + (y + 14) + ' ' + (x + 28) + ' ' + (y + 36) + 'L' + (x + 40) + ' ' + (y + 40) + 'Z', fill: '#5a5a5a' }, g);
    else if (h === 'crown') S('path', { d: 'M' + (x - 24) + ' ' + (y + 30) + 'l0-18 10 10 14-14 14 14 10-10 0 18z', fill: '#e8b83a', stroke: '#a8832a', 'stroke-width': 2 }, g);
    else if (h === 'space') S('circle', { cx: x, cy: y + 52, r: 38, fill: 'none', stroke: '#b9c4cf', 'stroke-width': 5 }, g);
    var p = C[3], hx = x + 30, hy = y + 140;
    if (p === 'scroll') { S('rect', { x: hx - 4, y: hy - 30, width: 12, height: 36, rx: 3, fill: '#f2e6c4', stroke: '#b8963e', 'stroke-width': 1.5 }, g); }
    else if (p === 'tablet') S('rect', { x: hx - 2, y: hy - 30, width: 22, height: 28, rx: 4, fill: '#c9a46a', stroke: '#8a6a3a', 'stroke-width': 1.5 }, g);
    else if (p === 'book') S('rect', { x: hx - 4, y: hy - 26, width: 20, height: 26, fill: '#8a2a2a', stroke: '#5a1a1a', 'stroke-width': 1.5 }, g);
    else if (p === 'shield') S('path', { d: 'M' + (hx - 6) + ' ' + (hy - 30) + 'h30v20q0 18-15 26q-15-8-15-26z', fill: '#2a4a8a', stroke: '#e0c070', 'stroke-width': 2 }, g);
    else if (p === 'crook') S('path', { d: 'M' + hx + ' ' + (hy + 10) + 'V' + (hy - 50) + 'q0-10 8-10q8 0 8 8', fill: 'none', stroke: '#2a4a8a', 'stroke-width': 4 }, g);
    else if (p === 'sickle') S('path', { d: 'M' + hx + ' ' + (hy + 8) + 'V' + (hy - 20) + 'q14-14 18 6', fill: 'none', stroke: '#8a8a8a', 'stroke-width': 3 }, g);
    else if (p === 'bag') S('circle', { cx: hx + 6, cy: hy + 12, r: 12, fill: '#c9a46a', stroke: '#8a6a3a', 'stroke-width': 1.5 }, g);
    else if (p === 'fan') S('path', { d: 'M' + hx + ' ' + hy + 'l-6-26a22 22 0 0 1 24 4z', fill: '#e8e0c8', stroke: '#8a6a3a', 'stroke-width': 1.5 }, g);
    else if (p === 'oar') S('path', { d: 'M' + hx + ' ' + (hy + 40) + 'V' + (hy - 50), stroke: '#8a5a2a', 'stroke-width': 5 }, g);
    else if (p === 'spyglass') S('rect', { x: hx - 2, y: hy - 34, width: 8, height: 34, fill: '#b8963e', stroke: '#7a5a20', 'stroke-width': 1.5 }, g);
    else if (p === 'brush') S('path', { d: 'M' + hx + ' ' + hy + 'l10-34', stroke: '#8a5a2a', 'stroke-width': 4 }, g);
    else if (p === 'quill') S('path', { d: 'M' + hx + ' ' + hy + 'q4-30 16-40q-4 22-14 40z', fill: '#f2f2f2', stroke: '#8a8a8a', 'stroke-width': 1.5 }, g);
    else if (p === 'bulb') { S('circle', { cx: hx + 4, cy: hy - 24, r: 11, fill: '#ffe066', stroke: '#b8963e', 'stroke-width': 1.5 }, g); S('rect', { x: hx - 1, y: hy - 14, width: 10, height: 8, fill: '#8a8a8a' }, g); }
    else if (p === 'wrench') S('path', { d: 'M' + hx + ' ' + (hy + 6) + 'l12-36', stroke: '#8a8a8a', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    else if (p === 'flag') { S('line', { x1: hx, y1: hy + 10, x2: hx, y2: hy - 60, stroke: '#8a8a8a', 'stroke-width': 3 }, g); S('rect', { x: hx, y: hy - 60, width: 30, height: 18, fill: '#e9eef7', stroke: '#8a8a8a' }, g); }
    else if (p === 'scepter') { S('line', { x1: hx, y1: hy + 10, x2: hx, y2: hy - 40, stroke: '#e8b83a', 'stroke-width': 4 }, g); S('circle', { cx: hx, cy: hy - 44, r: 6, fill: '#e8b83a' }, g); }
    S('text', { x: x, y: y + 214, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }, g, cap);
  }
  V.register('histstory-person', function (el, o) {
    var w = wrap(el, o), list = (o.who || ['greek']).map(function (x) { return Array.isArray(x) ? x : [x, (COSTUMES[x] || COSTUMES.greek)[4]]; });
    var n = list.length, Wd = M.max(200, n * 150), s = svg(w, '0 0 ' + Wd + ' 268', list.map(function (x) { return x[1]; }).join(', '));
    list.forEach(function (it, i) { person(s, Wd / n * (i + .5), it[0], o.quiet || o.letters ? letter(i) : it[1]); });
  });

  /* ---------------- histstory-pic ---------------- */
  V.register('histstory-pic', function (el, o) {
    var w = wrap(el, o), g = H('div', 'hy-cards', w);
    (o.items || []).forEach(function (it, i) {
      var c = H('div', 'hy-card', g); c.setAttribute('role', 'img');
      H('span', 'hy-e', c, it[0]).setAttribute('aria-hidden', 'true');
      var cap = o.ask === i ? '?' : o.quiet || o.letters ? letter(i) : it[1];
      H('span', 'hy-c', c, cap); c.setAttribute('aria-label', o.quiet ? 'picture ' + letter(i) : cap);
    });
  });
})(window, typeof document !== 'undefined' ? document : null);
