/* Handwriting: Print and Cursive (course key hand): course visuals and a few marks added to the kit's letterforms.
   Loads after the Writing kit (static/writing/viz/writing.js) on hand topic pages and with the course on practice pages.
   Course builder's file; the kit itself is not changed.

   1. Punctuation for HAND.word (wr-join, wr-trace): . , ? ! and ' in print and cursive (the kit draws letters and digits
      only, so a sentence lost its period). A mark stands alone; it doesn't join.
   2. hand-strokes   the four basic cursive strokes, drawn on guide lines with an arrow and a start dot.
        show: ['under', 'over', 'down', 'slant'] (default all four, in that order); names: false hides the names;
        quiet: true letters the pictures A, B, C … and hides names (for "which stroke is this?").
   3. hand-slant     a cursive word in which one letter does not lean like the others (for "which letter?").
        text: 'little'; odd: letter index (0-based, letters only) or -1 for none; kind: 'upright' | 'back';
        numbers: true (numbers under the letters); variants: [{ text, odd, kind }, …] (lettered A, B …);
        quiet: plain writing. Choose a tall letter (d f h k l t) that does not follow b, o, v or w (their joins are high): short letters
        barely show the difference, and a short letter leaning back runs into its neighbor.
*/
(function (W) {
  'use strict';
  var ML = W.MathLadder; if (!ML || !ML.writing || !ML.writing.HAND) return;
  var H = ML.writing.HAND, M = Math;
  // 1. punctuation marks (centerline strokes on the same grid: top 0, middle 50, baseline 100)
  var MARKS = {
    '.': { w: 18, k: ['D9,96'] },
    ',': { w: 18, k: ['M11,94 C11,102 9,108 4,114'] },
    '!': { w: 20, k: ['M10,2 L10,70', 'D10,96'] },
    '?': { w: 50, k: ['M7,20 C9,7 17,0 27,0 C38,0 45,8 45,19 C45,31 35,37 28,44 C26,48 26,58 26,70', 'D26,96'] },
    "'": { w: 14, k: ['M8,2 L6,24'] }
  };
  Object.keys(MARKS).forEach(function (c) { if (!H.PRINT[c]) H.PRINT[c] = MARKS[c]; if (!H.CURSIVE[c]) H.CURSIVE[c] = { w: MARKS[c].w, k: MARKS[c].k }; });

  if (!ML.viz || !ML.viz.register || !W.document) return;
  // pictures the kit already drew before this file loaded (its register() mounts at once) lost their marks: draw them again
  W.document.querySelectorAll('.ml-viz[data-mounted][data-viz="wr-join"], .ml-viz[data-mounted][data-viz="wr-trace"]').forEach(function (e) {
    if (!/[.,?!']/.test((function () { try { var o = JSON.parse(e.dataset.opts || '{}'); return [o.text || ''].concat((o.variants || []).map(function (v) { return v.text || ''; })).join(' '); } catch (er) { return ''; } })())) return;
    e.innerHTML = ''; delete e.dataset.mounted; ML.viz.mount(e);
  });
  var D = W.document, NS = 'http://www.w3.org/2000/svg', S = H.SLANT;
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, p) { var e = D.createElementNS(NS, tag); for (var k in at) if (at[k] != null) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function guides(g, x0, x1) {
    sv('line', { x1: x0, y1: 0, x2: x1, y2: 0, class: 'wrh-top' }, g); sv('line', { x1: x0, y1: 50, x2: x1, y2: 50, class: 'wrh-mid' }, g);
    sv('line', { x1: x0, y1: 100, x2: x1, y2: 100, class: 'wrh-base' }, g); sv('line', { x1: x0, y1: 150, x2: x1, y2: 150, class: 'wrh-desc' }, g);
  }
  function box(w) { return sv('svg', { viewBox: (-20) + ' -22 ' + (w + 40) + ' 188', class: 'wrh-svg', role: 'img' }); }
  function frame(el, o, name, label) {
    el.classList.add('wrv', 'wrv-' + name); el.setAttribute('aria-label', o.label || label);
    if (o.task) el.appendChild(h('p', 'wrv-task', o.task));
    var body = h('div', 'wrv-body'); el.appendChild(body);
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return body;
  }

  // 2. the four basic cursive strokes (upright coordinates, slanted like the letters)
  var STROKES = {
    under: { name: 'undercurve', say: 'swings up like a smile', d: 'M4,100 C22,104 40,86 52,50' },
    over: { name: 'overcurve', say: 'goes up and over like a hill', d: 'M4,100 C8,72 20,50 34,50 C46,50 52,70 54,100' },
    down: { name: 'downcurve', say: 'curves down and around, like the start of c', d: 'M50,54 C44,49 34,49 26,52 C14,58 8,72 9,86 C10,95 15,100 22,100' },
    slant: { name: 'slant line', say: 'a straight line down, leaning like the letters', d: 'M38,50 L24,100' }
  };
  ML.viz.register('hand-strokes', function (el, o) {
    var show = o.show || ['under', 'over', 'down', 'slant'], quiet = !!o.quiet;
    var body = frame(el, o, 'join', quiet ? 'Cursive strokes, lettered' : 'The basic cursive strokes: ' + show.map(function (k) { return STROKES[k].name; }).join(', '));
    var row = h('div', 'wrjn-row wrjn-cmp'); body.appendChild(row);
    show.forEach(function (k, i) {
      var st = STROKES[k]; if (!st) return;
      var cell = h('figure', 'wrjn-cell'); row.appendChild(cell);
      if (quiet || show.length > 1) cell.appendChild(h('figcaption', 'wrlt-vlab', quiet ? letter(i) : ''));
      var svg = box(60); cell.appendChild(svg); guides(svg, -20, 80);
      var segs = H.parse(st.d), d = H.toD(segs, 0, 0, true);
      var p = sv('path', { d: d, class: 'wrjn-p' }, svg);
      var first = [segs[0][1] + (100 - segs[0][2]) * S, segs[0][2]];
      var g = sv('g', { class: 'wrh-start first wrhs-dot', transform: 'translate(' + first[0] + ',' + first[1] + ')' }, svg); sv('circle', { r: 7 }, g);
      try { // an arrowhead near the end of the stroke, showing which way the pencil moves
        var L = p.getTotalLength(), a = p.getPointAtLength(L * 0.72), b = p.getPointAtLength(L * 0.72 + 4), ang = M.atan2(b.y - a.y, b.x - a.x) * 180 / M.PI;
        sv('path', { d: 'M-6,-5 L4,0 L-6,5', transform: 'translate(' + b.x + ',' + b.y + ') rotate(' + ang + ')', class: 'wrh-arrow' }, svg);
      } catch (e) { }
      svg.setAttribute('aria-label', quiet ? 'Stroke ' + letter(i) : st.name + ': it ' + st.say);
      if (!quiet && o.names !== false) cell.appendChild(h('figcaption', 'wrlt-name', '<b>' + st.name + '</b><br><small>' + st.say + '</small>'));
    });
    return {};
  });

  // 3. one letter that doesn't lean like the others
  ML.viz.register('hand-slant', function (el, o) {
    var variants = o.variants || [{ text: o.text || 'little', odd: o.odd == null ? -1 : o.odd, kind: o.kind || 'upright' }];
    var body = frame(el, o, 'join', o.quiet ? 'Handwriting to read' + (o.numbers ? ' with numbered letters' : '') : 'Cursive writing and its slant');
    var row = h('div', 'wrjn-row' + (variants.length > 1 ? ' wrjn-cmp' : '')); body.appendChild(row);
    variants.forEach(function (va, vi) {
      var Wd = H.word(va.text, 'cursive'), w = M.max(Wd.w, 60), odd = va.odd == null ? -1 : va.odd;
      var k = va.kind === 'back' ? S + 0.22 : S, mtx = 'matrix(1,0,' + k + ',1,' + (-100 * k) + ',0)'; // upright: the slant undone; back: leaning the other way
      var cell = h('figure', 'wrjn-cell'); row.appendChild(cell);
      if (variants.length > 1) cell.appendChild(h('figcaption', 'wrlt-vlab', letter(vi)));
      var svg = box(w); cell.appendChild(svg); guides(svg, -20, w + 20);
      var tilt = sv('g', { transform: mtx }, null);
      Wd.parts.forEach(function (p) { sv('path', { d: p.d, class: 'wrjn-p' + (p.dot ? ' dot' : '') }, p.i === odd && !p.tail ? tilt : svg); });
      if (tilt.firstChild) svg.appendChild(tilt);
      if (o.numbers) Wd.boxes.forEach(function (b, k) { var t = sv('text', { x: (b.x0 + b.x1) / 2 + 10, y: 160, 'text-anchor': 'middle', class: 'wrjn-num' }, svg); t.textContent = k + 1; });
      svg.setAttribute('aria-label', (variants.length > 1 ? letter(vi) + ': ' : '') + (o.quiet ? 'handwriting' : 'the cursive word ' + va.text));
    });
    return {};
  });
})(typeof window !== 'undefined' ? window : global);
