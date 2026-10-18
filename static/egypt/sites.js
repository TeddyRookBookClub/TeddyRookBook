/* The site atlas (/egypt/sites/ and /egypt/sites/<key>/).
   - .egat-strip[data-segs]: an inscription "as written": its segments in one line (cartouches drawn around royal names), using
     the model's layout (MathLadder.egypt.layout) and the site's font, TRB Hieroglyphs. Segments wrap onto new rows on narrow
     screens. A segment is { word: WORDS key } | { name: NAMES key } (in a cartouche) | { sp, parts, cart }.
   - details.egat-signs: on first open, an eg-glyphs visual of the same text with its sign-by-sign table.
   - .egat-cardgl[data-segs]: the first segment's signs as text, on the index cards.
   - the index filter: chips by period; cards and groups hide when nothing matches. The choice is remembered per viewer. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', KEY = 'trb-egypt-sites-v1';
  function E() { return window.MathLadder && window.MathLadder.egypt; }
  function sv(tag, a, p) { var e = document.createElementNS(NS, tag); for (var k in a) if (a[k] !== null && a[k] !== undefined) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // a segment -> { sp, parts, cart }
  function resolve(seg) {
    var EG = E();
    if (seg.word) { var w = EG.WORDS[seg.word]; return { sp: w.sp, parts: seg.parts || w.parts, cart: !!seg.cart, tl: w.tl }; }
    if (seg.name) {
      var n = EG.NAMES[seg.name];
      var parts = seg.parts || n.signs.map(function (c) { var S = EG.sign(c); return [c, S.k === 'det' ? 'det' : (S.k === 'logo' ? 'logo' : 'phon'), S.v[0] || '']; });
      return { sp: n.sp, parts: parts, cart: seg.cart !== false, tl: n.tl };
    }
    return { sp: seg.sp, parts: seg.parts || null, cart: !!seg.cart };
  }
  function segsOf(el) { try { return JSON.parse(el.getAttribute('data-segs')).map(resolve); } catch (e) { return []; } }

  /* ---------------------------------------------------------------- the strip */
  function drawStrip(el) {
    var EG = E(), segs = segsOf(el); if (!segs.length) return;
    var avail = Math.max(220, el.clientWidth - 4), U = Math.min(64, Math.max(34, avail / 7));
    var boxes = segs.map(function (s) {
      var L = EG.layout(s.sp, { dir: 'ltr' }), padX = s.cart ? 0.36 : 0.06, padY = s.cart ? 0.16 : 0.08;
      return { L: L, cart: s.cart, w: (L.w + 2 * padX) * U + (s.cart ? 0.2 * U : 0), h: (L.h + 2 * padY) * U, padX: padX, padY: padY };
    });
    // shrink a single over-wide segment to fit; then wrap segments into rows
    var widest = Math.max.apply(null, boxes.map(function (b) { return b.w; }));
    if (widest > avail) { var k = avail / widest; U *= k; boxes.forEach(function (b) { b.w *= k; b.h *= k; }); }
    var gap = 0.3 * U, rows = [[]], x = 0;
    boxes.forEach(function (b) { if (rows[rows.length - 1].length && x + b.w > avail) { rows.push([]); x = 0; } rows[rows.length - 1].push(b); x += b.w + gap; });
    var m = 0.12 * U, rowH = Math.max.apply(null, boxes.map(function (b) { return b.h; })), W = 0;
    rows.forEach(function (r) { var w = r.reduce(function (a, b) { return a + b.w; }, 0) + gap * (r.length - 1); W = Math.max(W, w); });
    var H = rows.length * rowH + (rows.length - 1) * 0.25 * U + 2 * m;
    W += 2 * m;
    el.innerHTML = '';
    var svg = sv('svg', { viewBox: '0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1), width: W.toFixed(1), height: H.toFixed(1), role: 'img', 'aria-label': el.getAttribute('data-label') || 'Hieroglyphs', class: 'egat-svg' }, el);
    var y = m;
    rows.forEach(function (r) {
      var cx = m;
      r.forEach(function (b) {
        var by = y + (rowH - b.h) / 2, g = sv('g', {}, svg);
        if (b.cart) {
          var cw = b.w - 0.2 * U, sw = Math.max(1.8, b.h * 0.045), rr = b.h / 2;
          sv('rect', { x: cx, y: by, width: cw, height: b.h, rx: rr, ry: rr, class: 'egat-cart', 'stroke-width': sw }, g);
          sv('rect', { x: cx + cw + sw * 0.6, y: by - sw * 0.6, width: sw * 2.4, height: b.h + sw * 1.2, rx: sw * 0.6, class: 'egat-cartbar' }, g);
        }
        b.L.signs.forEach(function (p) {
          var F = p.fs * U, sx = cx + b.padX * U + p.x * U, sy = by + b.padY * U + p.y * U;
          var t = sv('text', { x: (sx - 0.04 * F).toFixed(2), y: (sy + p.top * F).toFixed(2), 'font-size': F.toFixed(2), class: 'egat-sign' }, g);
          t.textContent = p.u;
        });
        cx += b.w + gap;
      });
      y += rowH + 0.25 * U;
    });
  }

  /* ---------------------------------------------------------------- sign by sign (eg-glyphs, made on first open) */
  function glyphsFor(det) {
    var host = det.querySelector('.egat-gl'); if (!host || host.getAttribute('data-made')) return;
    var segs = segsOf(host); if (!segs.length) return;
    var parts = [], ok = true;
    segs.forEach(function (s) { if (!s.parts) ok = false; else parts = parts.concat(s.parts); });
    var opts = { sp: segs.map(function (s) { return s.sp; }).join(' '), tl: host.getAttribute('data-tl') || '', en: host.getAttribute('data-en') || '', breakdown: true, lines: ['none'], note: false, size: 64 };
    if (ok) opts.parts = parts;
    var v = document.createElement('div');
    v.className = 'ml-viz'; v.setAttribute('data-viz', 'eg-glyphs'); v.setAttribute('data-opts', JSON.stringify(opts));
    v.setAttribute('aria-label', 'The signs one by one');
    host.appendChild(v); host.setAttribute('data-made', '1');
    if (window.MathLadder.viz && window.MathLadder.viz.mountAll) window.MathLadder.viz.mountAll(host);
  }

  /* ---------------------------------------------------------------- the index: card glyphs and the period filter */
  function cards() {
    var EG = E();
    document.querySelectorAll('.egat-cardgl[data-segs]').forEach(function (el) {
      var s = segsOf(el)[0]; if (!s) return; el.textContent = EG.text(s.sp);
    });
    var bar = document.getElementById('egat-filter'); if (!bar) return;
    var chips = bar.querySelectorAll('button[data-p]'), count = document.getElementById('egat-count');
    function apply(p) {
      var n = 0, all = document.querySelectorAll('.egat-card');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-p') === p ? 'true' : 'false'); });
      all.forEach(function (c) { var on = p === 'all' || (' ' + c.getAttribute('data-periods') + ' ').indexOf(' ' + p + ' ') >= 0; c.hidden = !on; if (on) n++; });
      document.querySelectorAll('.egat-group').forEach(function (g) { g.hidden = !g.querySelector('.egat-card:not([hidden])'); });
      if (count) count.textContent = p === 'all' ? 'All ' + all.length + ' sites' : n + ' of ' + all.length + ' sites';
      try { localStorage.setItem(KEY, p); } catch (e) { /* storage may be blocked */ }
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.getAttribute('data-p')); }); });
    var saved = 'all'; try { saved = localStorage.getItem(KEY) || 'all'; } catch (e) { saved = 'all'; }
    if (!bar.querySelector('button[data-p="' + saved + '"]')) saved = 'all';
    apply(saved);
  }

  function start() {
    if (!E()) { setTimeout(start, 120); return; }
    var strips = document.querySelectorAll('.egat-strip[data-segs]');
    strips.forEach(function (el) {
      try { drawStrip(el); } catch (e) { el.innerHTML = '<p class="egat-err">' + esc(e.message) + '</p>'; }
      if ('ResizeObserver' in window) { var last = el.clientWidth; new ResizeObserver(function () { var w = el.clientWidth; if (w && Math.abs(w - last) > 8) { last = w; drawStrip(el); } }).observe(el); }
    });
    document.querySelectorAll('details.egat-signs').forEach(function (d) {
      d.addEventListener('toggle', function () { if (d.open) glyphsFor(d); });
      if (d.open) glyphsFor(d);
    });
    cards();
    // redraw once the font has loaded (the layout uses the font's metrics from the model, but the text needs the font)
    if (document.fonts && document.fonts.load) document.fonts.load('40px "TRB Hieroglyphs"', '𓀀').then(function () { strips.forEach(function (el) { try { drawStrip(el); } catch (e) { /* drawn already */ } }); }, function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
