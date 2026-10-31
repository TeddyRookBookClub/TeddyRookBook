/* Memory Ladder: the visual kit (names prefixed mm-), on window.MathLadder.viz.
   Load order: math/viz/core.js (+ viz.css), then this file (+ memory/viz/memory.css). Memory topic pages always load it,
   and practice pages load it with a course (MathLadder.loadCourse). Vanilla JS, no libraries, no network; every drawing
   is original SVG made here as a string. Colors come from CSS variables, so the pictures follow the light and dark themes.
   Drawn people use the site's one cartoon skin color (fill #ffcc4d, outline #e8a93a).

   Embed:  <div class="ml-viz" data-viz="mm-curve" data-opts='{"reviews":[1,3,7,21]}'></div>

   COMMON OPTIONS  quiet: true  hide anything that could give a problem's answer away (labels, items, verdicts)
                   caption: HTML under the picture   label: aria-label

   mm-curve     the forgetting curve. reviews: [days after learning] (default [1, 3, 7, 21]), days: last day shown (default
                28), noReview: false hides the dashed "no review" curve, grid: true adds 0-100% lines (for reading the
                graph), ask: a day to mark with "?", only: 'none' draws only the no-review curve.
   mm-palace    a memory palace walk: a house plan with numbered spots joined by a dotted route and a walker.
                spots: ['front door', 'mat', …] (3 to 10), items: ['washing machine', …] (shown at the spots unless quiet),
                ask: spot index (0-based) marked "?", order: [indexes] draw the route in this order (default 0, 1, 2, …).
   mm-chunks    a chunking strip. digits: '149217761969', groups: [4, 4, 4] (sizes; default one group = no chunking),
                names: ['1492', …] labels under the chunks (hidden when quiet), raw: true shows the raw line above.
   mm-box       the memory-work box with tabs Daily, Odd, Even, Mon to Sun and 1 to 31. card: { tab: 'Mon', text: '…' }
                (a card standing behind that tab), mark: tab name to highlight, quiet: no card text.
   mm-card      a picture-plus-words card. pic: sun | tree | cell | house | fish | apple | star | moon | book | key | boat |
                mountain | bird | flower | rainbow | heart-pump (a simple pump) | volcano, title, words: ['nucleus', …]
                (labels; hidden when quiet), side: 'both' | 'pic' | 'words'.
   mm-calendar  a month page. start: weekday of the 1st (0 = Sunday), len: days in the month (28-31), title: 'March',
                marks: [{ d: 1, t: 'learn' | 'review' | 'test' }], ask: a day to ring with "?", today: a day.          */
(function (W) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var D = W.document;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function svg(vb, body, label) { return '<svg class="mmv-svg" viewBox="' + vb + '" role="img" aria-label="' + esc(label || 'A picture') + '">' + body + '</svg>'; }
  function txt(x, y, s, cls, anchor) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'mmv-t') + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>'; }
  function cap(o) { return o.caption ? '<p class="mmv-cap">' + o.caption + '</p>' : ''; }
  function person(x, y, s, shirt) { // a small standing cartoon person, feet at (x, y)
    s = s || 1; shirt = shirt || 'var(--mm-acc)';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<rect x="-9" y="-30" width="7" height="30" rx="2" class="mmv-legs"/><rect x="2" y="-30" width="7" height="30" rx="2" class="mmv-legs"/>' +
      '<path d="M-14 -30 L-11 -62 Q0 -68 11 -62 L14 -30 Z" fill="' + shirt + '" stroke="var(--mm-ink)" stroke-width="2"/>' +
      '<circle cx="0" cy="-78" r="14" fill="#ffcc4d" stroke="#e8a93a" stroke-width="2.5"/>' +
      '<path d="M-14 -80 Q-12 -95 0 -94 Q12 -95 14 -80 Q8 -88 0 -88 Q-8 -88 -14 -80 Z" class="mmv-hair"/>' +
      '<circle cx="-5" cy="-78" r="1.8" class="mmv-eye"/><circle cx="5" cy="-78" r="1.8" class="mmv-eye"/>' +
      '<path d="M-5 -71 Q0 -67 5 -71" fill="none" stroke="var(--mm-ink)" stroke-width="1.6" stroke-linecap="round"/></g>';
  }

  // ------------------------------------------------------------------ mm-curve
  function curve(el, o) {
    var days = o.days || 28, reviews = (o.reviews || [1, 3, 7, 21]).filter(function (d) { return d > 0 && d <= days; }).sort(function (a, b) { return a - b; });
    var X0 = 92, X1 = 580, Y0 = 30, Y1 = 230, sx = (X1 - X0) / days;
    function X(d) { return X0 + d * sx; } function Y(p) { return Y1 - (Y1 - Y0) * p; }
    // a simple model: retention falls toward a floor; each review resets it and the next fall is slower
    function seg(t0, t1, S, floor) { var pts = [], n = Math.max(8, Math.round((t1 - t0) * 6)); for (var i = 0; i <= n; i++) { var t = t0 + (t1 - t0) * i / n, p = floor + (1 - floor) * Math.exp(-(t - t0) / S); pts.push(X(t).toFixed(1) + ',' + Y(p).toFixed(1)); } return pts; }
    var b = '<rect x="0" y="0" width="600" height="300" class="mmv-bg"/>';
    if (o.grid) [0, 0.25, 0.5, 0.75, 1].forEach(function (p) { b += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + Y(p) + '" y2="' + Y(p) + '" class="mmv-grid"/>' + txt(X0 - 6, Y(p) + 4, Math.round(p * 100) + '%', 'mmv-ts', 'end'); });
    b += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X0 + '" y2="' + Y1 + '" class="mmv-axis"/><line x1="' + X0 + '" y1="' + Y1 + '" x2="' + X1 + '" y2="' + Y1 + '" class="mmv-axis"/>';
    b += '<text class="mmv-ts" transform="translate(20,' + ((Y0 + Y1) / 2) + ') rotate(-90)" text-anchor="middle">how much you remember</text>';
    b += txt((X0 + X1) / 2, 292, 'days after learning', 'mmv-ts', 'middle');
    if (o.noReview !== false) b += '<polyline points="' + seg(0, days, 2.2, 0.2).join(' ') + '" class="mmv-dash"/>' + (o.quiet ? '' : txt(X(days) - 4, Y(0.2) - 8, 'no review', 'mmv-ts mmv-muted', 'end'));
    if (o.only !== 'none') {
      var pts = [], t = 0, S = 1.6, k;
      var stops = reviews.concat([days]);
      for (k = 0; k < stops.length; k++) {
        var s = seg(t, stops[k], S, 0.22 + 0.1 * k);
        if (k > 0) pts.push(X(t).toFixed(1) + ',' + Y(1).toFixed(1));
        pts = pts.concat(s); t = stops[k]; S *= 2.6;
      }
      b += '<polyline points="' + pts.join(' ') + '" class="mmv-line"/>';
      b += '<circle cx="' + X(0) + '" cy="' + Y(1) + '" r="5" class="mmv-dot0"/>';
      reviews.forEach(function (d) { b += '<circle cx="' + X(d) + '" cy="' + Y(1) + '" r="5" class="mmv-dot"/>'; });
    }
    b += txt(X(0), Y1 + 20, 'learn', 'mmv-ts mmv-acc', 'middle');
    var last = [X(0) + 10, -99]; // the label rows: "learn" sits on row 1; a label too close to the one before drops to row 2
    reviews.forEach(function (d) {
      var x = X(d), row = x - last[0] > 58 ? 0 : x - last[1] > 58 ? 1 : -1;
      if (row >= 0) { b += txt(x, Y1 + 20 + row * 20, 'day ' + d, 'mmv-ts mmv-gold', 'middle'); last[row] = x; }
      b += '<line x1="' + x + '" x2="' + x + '" y1="' + Y1 + '" y2="' + (Y1 + 5) + '" class="mmv-axis"/>';
    });
    if (o.ask != null) { var ax = X(o.ask); b += '<line x1="' + ax + '" x2="' + ax + '" y1="' + Y0 + '" y2="' + Y1 + '" class="mmv-askline"/><circle cx="' + ax + '" cy="' + (Y0 - 2) + '" r="11" class="mmv-askc"/>' + txt(ax, Y0 + 3, '?', 'mmv-askt', 'middle'); }
    el.innerHTML = svg('0 0 600 300', b, o.label || 'A forgetting curve: memory falls after learning, and each review brings it back up and makes it fall more slowly.') + (o.only === 'none' || o.quiet ? '' : '<p class="mmv-note">Illustrative shape, not exact data.</p>') + cap(o);
  }

  // ------------------------------------------------------------------ mm-palace
  function palace(el, o) {
    var spots = (o.spots && o.spots.length ? o.spots : ['front door', 'mat', 'mirror', 'stairs', 'kitchen table']).slice(0, 10), n = spots.length;
    var items = o.items || [], order = o.order || spots.map(function (_, i) { return i; });
    var cols = Math.min(5, Math.ceil(n / (n > 5 ? 2 : 1))), rows = Math.ceil(n / cols), H = 80 + rows * 130;
    var b = '<rect x="0" y="0" width="600" height="' + H + '" class="mmv-bg"/>';
    b += '<path d="M20 70 L300 18 L580 70 Z" class="mmv-roof"/><rect x="20" y="70" width="560" height="' + (H - 80) + '" rx="6" class="mmv-house"/>';
    for (var r = 1; r < rows; r++) b += '<line x1="20" x2="580" y1="' + (70 + r * 130) + '" y2="' + (70 + r * 130) + '" class="mmv-wall"/>';
    var P = []; // serpentine positions
    for (var i = 0; i < n; i++) { var row = Math.floor(i / cols), c = i % cols; if (row % 2) c = cols - 1 - c; P.push([cols > 1 ? 80 + c * (440 / (cols - 1)) : 300, 70 + row * 130 + 42]); }
    var path = order.map(function (k) { return P[k]; }).filter(Boolean), line = [];
    path.forEach(function (p, j) { // a row change runs down the side of the house, clear of the labels
      var q = path[j - 1];
      if (q && q[1] !== p[1] && q[0] === p[0]) { var ex = q[0] > 300 ? 566 : 34; line.push([ex, q[1]], [ex, p[1]]); }
      line.push(p);
    });
    b += '<polyline points="' + line.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" class="mmv-route"/>';
    order.forEach(function (k, j) {
      var p = P[k]; if (!p) return;
      var isAsk = o.ask === k;
      b += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" class="' + (isAsk ? 'mmv-askc' : 'mmv-spot') + '"/>' + txt(p[0], p[1] + 5, isAsk ? '?' : String(j + 1), isAsk ? 'mmv-askt' : 'mmv-spott', 'middle');
      b += txt(p[0], p[1] + 38, spots[k], 'mmv-tl', 'middle');
      if (items[k] && !o.quiet && !isAsk) b += txt(p[0], p[1] + 58, items[k], 'mmv-tl mmv-acc mmv-b', 'middle');
    });
    if (o.walker !== false && path.length) b += person(path[0][0] - 46, path[0][1] + 20, 0.6, 'var(--mm-gold)');
    el.innerHTML = svg('0 0 600 ' + H, b, o.label || 'A memory palace: ' + n + ' numbered spots along a route through a house.') + cap(o);
  }

  // ------------------------------------------------------------------ mm-chunks
  function chunks(el, o) {
    var d = String(o.digits || '149217761969').replace(/\s/g, ''), g = o.groups && o.groups.length ? o.groups : [d.length];
    var parts = [], i = 0; g.forEach(function (k) { parts.push(d.slice(i, i + k)); i += k; }); if (i < d.length) parts.push(d.slice(i));
    var cw = 26, gap = 22, W0 = 0; parts.forEach(function (p) { W0 += p.length * cw + 16 + gap; });
    var Wd = Math.max(320, W0 + 20), H = o.raw ? 150 : 100, x = (Wd - W0 + gap) / 2, y = o.raw ? 70 : 20;
    var b = '<rect x="0" y="0" width="' + Wd + '" height="' + H + '" class="mmv-bg"/>';
    if (o.raw) { b += txt(Wd / 2, 30, d.split('').join(' '), 'mmv-raw', 'middle') + '<path d="M' + (Wd / 2) + ' 40 v16 m-6 -6 l6 6 l6 -6" class="mmv-arrow"/>'; }
    parts.forEach(function (p, k) {
      var w = p.length * cw + 16;
      b += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="44" rx="10" class="mmv-chunk"/>';
      for (var j = 0; j < p.length; j++) b += txt(x + 8 + j * cw + cw / 2, y + 30, p[j], 'mmv-digit', 'middle');
      if (o.names && o.names[k] && !o.quiet) b += txt(x + w / 2, y + 62, o.names[k], 'mmv-ts mmv-acc', 'middle');
      x += w + gap;
    });
    el.innerHTML = svg('0 0 ' + Wd + ' ' + (H + (o.names && !o.quiet ? 10 : 0)), b, o.label || (parts.length > 1 ? d.length + ' digits in ' + parts.length + ' chunks: ' + parts.join(' ') : d.length + ' digits in one long line')) + cap(o);
  }

  // ------------------------------------------------------------------ mm-box
  function box(el, o) {
    var tabs = [['Daily', 'mmv-tab1'], ['Odd', 'mmv-tab2'], ['Even', 'mmv-tab2'], ['Mon', 'mmv-tab3'], ['Tue', 'mmv-tab3'], ['Wed', 'mmv-tab3'], ['Thu', 'mmv-tab3'], ['Fri', 'mmv-tab3'], ['Sat', 'mmv-tab3'], ['Sun', 'mmv-tab3'], ['1–31', 'mmv-tab4']];
    var b = '<rect x="0" y="0" width="600" height="330" class="mmv-bg"/>';
    var x0 = 60, w = 44;
    tabs.forEach(function (t, i) {
      var x = x0 + i * w, y = 104 + (i % 2) * 8, on = o.mark && (o.mark === t[0] || (o.mark.match && /^\d+$/.test(o.mark) && t[0] === '1–31'));
      b += '<rect x="' + x + '" y="' + (y + 18) + '" width="' + (w - 2) + '" height="90" class="mmv-divider"/>';
      b += '<rect x="' + (x + 2) + '" y="' + y + '" width="' + (w - 6) + '" height="20" rx="4" class="' + t[1] + (on ? ' mmv-tabon' : '') + '"/>' + txt(x + w / 2 - 1, y + 14, t[0], 'mmv-tabt', 'middle');
    });
    b += '<path d="M40 164 L560 164 L560 314 L40 314 Z" class="mmv-boxf"/><path d="M560 164 L585 146 L585 296 L560 314 Z" class="mmv-boxs"/>';
    b += '<rect x="215" y="220" width="170" height="40" rx="6" class="mmv-plate"/>' + txt(300, 246, 'MEMORY WORK', 'mmv-platet', 'middle');
    if (o.card) {
      b += '<g transform="rotate(3 300 46)"><rect x="200" y="6" width="200" height="80" rx="4" class="mmv-cardf"/><line x1="208" x2="392" y1="34" y2="34" class="mmv-cardr"/>' +
        txt(300, 26, 'Card: ' + (o.card.tab || ''), 'mmv-ts mmv-b', 'middle') + (o.quiet ? '' : txt(300, 62, o.card.text || '', 'mmv-ts', 'middle')) + '</g>';
    }
    el.innerHTML = svg('0 0 600 330', b, o.label || 'A memory-work box with tabs: Daily, Odd, Even, the days of the week, and 1 to 31.') + cap(o);
  }

  // ------------------------------------------------------------------ mm-card
  var PICS = {
    sun: '<circle cx="100" cy="90" r="34" class="mmp-sun"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<line x1="100" y1="90" x2="' + (100 + 58 * Math.cos(a * Math.PI / 180)).toFixed(1) + '" y2="' + (90 + 58 * Math.sin(a * Math.PI / 180)).toFixed(1) + '" class="mmp-ray"/>'; }).join('') + '<circle cx="100" cy="90" r="34" class="mmp-sun"/>',
    tree: '<rect x="90" y="100" width="20" height="60" class="mmp-trunk"/><circle cx="100" cy="80" r="45" class="mmp-leaf"/>',
    cell: '<ellipse cx="100" cy="95" rx="78" ry="56" class="mmp-cell"/><circle cx="105" cy="92" r="18" class="mmp-nuc"/><ellipse cx="55" cy="80" rx="12" ry="6" class="mmp-mito"/><ellipse cx="148" cy="112" rx="12" ry="6" class="mmp-mito"/>',
    house: '<path d="M40 90 L100 40 L160 90 Z" class="mmp-roof"/><rect x="50" y="90" width="100" height="70" class="mmp-wall"/><rect x="88" y="120" width="24" height="40" class="mmp-door"/>',
    fish: '<ellipse cx="95" cy="95" rx="55" ry="30" class="mmp-fish"/><path d="M148 95 L180 72 L180 118 Z" class="mmp-fish"/><circle cx="68" cy="88" r="5" class="mmv-eye"/>',
    apple: '<circle cx="100" cy="100" r="48" class="mmp-apple"/><rect x="97" y="40" width="6" height="18" class="mmp-trunk"/><ellipse cx="118" cy="50" rx="14" ry="7" class="mmp-leaf"/>',
    star: '<path d="M100 30 L118 78 L170 80 L129 110 L144 160 L100 131 L56 160 L71 110 L30 80 L82 78 Z" class="mmp-sun"/>',
    moon: '<path d="M120 35 A60 60 0 1 0 150 140 A48 48 0 1 1 120 35 Z" class="mmp-moon"/>',
    book: '<path d="M30 60 L100 72 L170 60 L170 150 L100 162 L30 150 Z" class="mmp-wall"/><line x1="100" y1="72" x2="100" y2="162" class="mmp-ink"/>',
    key: '<circle cx="60" cy="95" r="26" class="mmp-key"/><circle cx="60" cy="95" r="10" class="mmv-bg"/><rect x="84" y="89" width="90" height="12" class="mmp-key2"/><rect x="150" y="101" width="10" height="18" class="mmp-key2"/><rect x="164" y="101" width="10" height="12" class="mmp-key2"/>',
    boat: '<path d="M30 120 L170 120 L150 150 L50 150 Z" class="mmp-trunk"/><line x1="100" y1="40" x2="100" y2="120" class="mmp-ink"/><path d="M104 44 L104 114 L160 114 Z" class="mmp-wall"/>',
    mountain: '<path d="M10 160 L80 50 L120 110 L145 80 L190 160 Z" class="mmp-mtn"/><path d="M80 50 L65 74 L95 74 Z" class="mmp-snow"/>',
    bird: '<ellipse cx="100" cy="100" rx="40" ry="28" class="mmp-bird"/><circle cx="135" cy="80" r="18" class="mmp-bird"/><path d="M152 78 L170 84 L152 88 Z" class="mmp-sun"/><circle cx="140" cy="76" r="3" class="mmv-eye"/><path d="M80 92 L110 70 L118 100 Z" class="mmp-wing"/>',
    flower: '<line x1="100" y1="95" x2="100" y2="165" class="mmp-stem"/>' + [0, 72, 144, 216, 288].map(function (a) { return '<circle cx="' + (100 + 24 * Math.cos(a * Math.PI / 180)).toFixed(1) + '" cy="' + (75 + 24 * Math.sin(a * Math.PI / 180)).toFixed(1) + '" r="18" class="mmp-petal"/>'; }).join('') + '<circle cx="100" cy="75" r="14" class="mmp-sun"/>',
    rainbow: ['#d64545', '#f08c00', '#f2c94c', '#40a060', '#3b82c4', '#5b4bb7', '#8e44ad'].map(function (c, i) { return '<path d="M' + (20 + i * 9) + ' 150 A' + (80 - i * 9) + ' ' + (80 - i * 9) + ' 0 0 1 ' + (180 - i * 9) + ' 150" fill="none" stroke="' + c + '" stroke-width="9"/>'; }).join(''),
    volcano: '<path d="M20 160 L80 70 L120 70 L180 160 Z" class="mmp-mtn"/><path d="M80 70 Q100 30 120 70 Z" class="mmp-apple"/>',
    'heart-pump': '<rect x="60" y="60" width="80" height="90" rx="20" class="mmp-apple"/><rect x="80" y="30" width="14" height="34" class="mmp-pipe"/><rect x="106" y="30" width="14" height="34" class="mmp-pipe2"/>'
  };
  function card(el, o) {
    var pic = PICS[o.pic] ? o.pic : 'cell', words = o.words || [], side = o.side || 'both';
    var b = '<rect x="0" y="0" width="460" height="220" class="mmv-bg"/>';
    if (side !== 'words') b += '<rect x="10" y="10" width="200" height="200" rx="10" class="mmv-cardf"/><g transform="translate(10,15)">' + PICS[pic] + '</g>';
    if (side !== 'pic') {
      var x = side === 'words' ? 10 : 240;
      b += '<rect x="' + x + '" y="10" width="' + (side === 'words' ? 440 : 210) + '" height="200" rx="10" class="mmv-cardf"/>' + txt(x + 16, 40, o.title || '', 'mmv-t mmv-b');
      words.forEach(function (w, i) { b += '<line x1="' + (x + 16) + '" x2="' + (x + 190) + '" y1="' + (68 + i * 26) + '" y2="' + (68 + i * 26) + '" class="mmv-cardr"/>' + (o.quiet ? '' : txt(x + 22, 64 + i * 26, '• ' + w, 'mmv-ts')); });
    }
    if (side === 'both') b += '<text x="225" y="116" class="mmv-plus" text-anchor="middle">+</text>';
    el.innerHTML = svg('0 0 460 220', b, o.label || 'A picture-plus-words card: a simple drawing beside a few labels.') + cap(o);
  }

  // ------------------------------------------------------------------ mm-calendar
  function calendar(el, o) {
    var st = o.start || 0, len = o.len || 30, marks = {}, cw = 80, ch = 50, H = 76 + Math.ceil((st + len) / 7) * ch + 10;
    (o.marks || []).forEach(function (m) { marks[m.d] = m.t || 'review'; });
    var b = '<rect x="0" y="0" width="600" height="' + H + '" class="mmv-bg"/><rect x="20" y="8" width="560" height="34" rx="6" class="mmv-calh"/>' + txt(300, 31, o.title || 'This month', 'mmv-calht', 'middle');
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (w, i) { b += txt(20 + i * cw + cw / 2, 62, w, 'mmv-ts mmv-muted', 'middle'); });
    for (var d = 1; d <= len; d++) {
      var k = st + d - 1, x = 20 + (k % 7) * cw, y = 70 + Math.floor(k / 7) * ch, m = marks[d];
      b += '<rect x="' + (x + 2) + '" y="' + y + '" width="' + (cw - 4) + '" height="' + (ch - 4) + '" rx="5" class="mmv-day' + (o.today === d ? ' mmv-today' : '') + '"/>';
      if (m) b += '<circle cx="' + (x + cw / 2) + '" cy="' + (y + 21) + '" r="17" class="mmv-m-' + m + '"/>';
      if (o.ask === d) b += '<circle cx="' + (x + cw - 14) + '" cy="' + (y + 12) + '" r="9" class="mmv-askc"/>' + txt(x + cw - 14, y + 16, '?', 'mmv-askt mmv-small', 'middle');
      b += txt(x + cw / 2, y + 27, String(d), 'mmv-dayt' + (m ? ' mmv-b' : ''), 'middle');
      if (m && !o.quiet && o.legend !== false) b += txt(x + cw / 2, y + 43, m, 'mmv-tiny', 'middle');
    }
    el.innerHTML = svg('0 0 600 ' + H, b, o.label || 'A calendar page for ' + (o.title || 'the month') + ' with learning and review days circled.') + cap(o);
  }

  var KIT = { 'mm-curve': curve, 'mm-palace': palace, 'mm-chunks': chunks, 'mm-box': box, 'mm-card': card, 'mm-calendar': calendar };
  ML.memoryKit = { names: Object.keys(KIT), pics: Object.keys(PICS) };
  function reg() {
    if (!ML.viz || !ML.viz.register) return false;
    Object.keys(KIT).forEach(function (name) {
      ML.viz.register(name, function (el, o) {
        el.classList.add('mmv');
        var draw = function () { try { KIT[name](el, o || {}); } catch (e) { el.innerHTML = '<p class="ml-viz-err">This picture could not be drawn.</p>'; } };
        draw();
        return { update: function (n) { o = Object.assign({}, o, n || {}); draw(); } };
      });
    });
    return true;
  }
  if (D && !reg()) D.addEventListener('DOMContentLoaded', reg);
})(typeof window !== 'undefined' ? window : this);
