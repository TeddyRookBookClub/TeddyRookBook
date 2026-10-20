/* TRBMusic.staff: an SVG music notation renderer (Teddy Rook Book, music kit). Original drawing code; every glyph
   (clefs, noteheads, accidentals, rests, flags, C and cut time, brace) is an SVG path built here. No fonts for music.
   Needs TRBMusic.song (song.js) loaded first.

   render(el, src, opts) -> Score
     el    an element to draw into (it gets class ms-score and becomes the scroll box for long scores)
     src   a song model from TRBMusic.song.parse(), or a song object / YAML text (parsed for you), or a snippet:
           "C4/4 D4/4 E4/2" (one staff; opts.clef 'treble' | 'bass', opts.key, opts.time set it up) or an object
           { rh: "...", lh: "...", key: "G", time: "3/4", clef: "bass", fingering: { rh: "1 2 3" }, marks: {…} }
           (snippets use song.parse(…, { loose: true }): no title needed, bars may have any length; the time
           signature still sets the beaming; hide it with timeSig: false)
     opts  { letters: false | true   (letter names inside the noteheads: "C", "F♯"),
             fingering: true, barNumbers: true, sp: staff space in px (default from the width: 7.5–10.5),
             scale: 1 (multiplies sp), staves: ['rh','lh'] (which to show), timeSig: true, keySig: true,
             finalBar: true, maxBars: bars per line cap, label: aria-label for the score,
             onClick: function (measureIndex, tickInMeasure) {} (clicks on the score),
             key / time / clef: for a string snippet,
             clef8: true      a small 8 under the treble clef (guitar and banjo music sounds an octave lower),
             above / below: function (info) -> { h, svg, cursor: [y0, y1] }   extra drawing above / below each line
                              of music, in staff spaces (y = 0 at the top of that strip); info = { li, x0, x1, first,
                              bars: [{ mi, x0, x1, len, cols: [{ off, x }] }] }. Elements with class "ms-n" and
                              data-id="<note id>" are lit by highlight() like noteheads (the tab numbers use this).
                              cursor (optional) also stretches the play cursor over that strip.
             staffless: true  draw no staves, only the above / below strips (the tab-only view) }
   Note ids are the song model's: "<staff>-<bar>-<voice>-<item>-<note>", e.g. "rh-3-1-0-0" (bar numbers as printed;
   chord notes numbered low to high). model.events[i].ids lists the ids a sounding note covers (ties).
   Score methods
     highlight(noteIds, hand)  light noteheads (ids from the song model; hand 'rh' | 'lh' | 'ok' | 'bad' | 'hint')
     unhighlight(noteIds)      remove that light;  clear()  remove every light
     cursor(measureIndex, tick) show the play cursor at a time in a written measure;  cursor(null) hides it
     scrollTo(measureIndex, smooth)  scroll the score box so that bar's line is in view
     setLetters(bool), setOptions(opts), relayout(), destroy()
     measureBox(mi) -> { system, x, w, y, h } in px within the SVG;  systems -> count;  model
   Supports: treble and bass clefs (clef changes at a bar start), grand staff with brace, key signatures (sharps and
   flats placed per clef), time signatures (C and cut-C), barlines, final barline, repeat signs and 1st/2nd endings,
   whole/half/black noteheads, stems, flags, beams by beat groups (6/8 in threes; 4/4 eighths in half-bars), secondary
   and partial beams, dots, ties (across lines too), slurs, accidentals with courtesy accidentals (computed by song.js),
   ledger lines, rests of every length, whole-bar rests, chords with seconds, two voices per staff, tuplets (number,
   bracket when not beamed), fingering, dynamics and words, measure numbers at line starts, line breaks that fit
   the width (re-laid out on resize). Not supported: grace notes, cross-staff beams, ottava lines, key or time changes
   mid-piece, lyrics, hairpins (written as words: cresc. / dim.).
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var NS = 'http://www.w3.org/2000/svg';

  /* ================= geometry helpers ================= */
  function n3(v) { return Math.round(v * 1000) / 1000; }
  function cr(P, seg) { // Catmull-Rom spline through [x, y, w] points
    var out = [], n = P.length, i, s;
    for (i = 0; i < n - 1; i++) {
      var p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, n - 1)];
      for (s = 0; s < seg; s++) {
        var t = s / seg, t2 = t * t, t3 = t2 * t, q = [];
        for (var k = 0; k < 3; k++) q.push(0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
        out.push(q);
      }
    }
    out.push(P[n - 1].slice());
    return out;
  }
  function brush(P, seg) { // a variable-width stroke through [x, y, width] points, as a filled outline
    var S = cr(P, seg || 8), L = [], R = [], i;
    for (i = 0; i < S.length; i++) {
      var a = S[Math.max(i - 1, 0)], b = S[Math.min(i + 1, S.length - 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len, w = Math.max(S[i][2], 0.01) / 2;
      L.push([S[i][0] + nx * w, S[i][1] + ny * w]);
      R.push([S[i][0] - nx * w, S[i][1] - ny * w]);
    }
    return poly(L.concat(R.reverse()));
  }
  function ell(cx, cy, rx, ry, deg, rev) { // a (rotated) ellipse as two arcs; rev draws it the other way round
    var t = deg * Math.PI / 180, ax = rx * Math.cos(t), ay = rx * Math.sin(t);
    var sw = rev ? 0 : 1;
    return 'M' + n3(cx - ax) + ' ' + n3(cy - ay) + 'A' + rx + ' ' + ry + ' ' + deg + ' 1 ' + sw + ' ' + n3(cx + ax) + ' ' + n3(cy + ay) +
      'A' + rx + ' ' + ry + ' ' + deg + ' 1 ' + sw + ' ' + n3(cx - ax) + ' ' + n3(cy - ay) + 'Z';
  }
  function circ(cx, cy, r) { return ell(cx, cy, r, r, 0); }
  function rect(x, y, w, h) { return 'M' + n3(x) + ' ' + n3(y) + 'h' + n3(w) + 'v' + n3(h) + 'h' + n3(-w) + 'Z'; }
  function poly(pts) { // a closed polygon, always wound clockwise on screen so overlapping shapes fill solidly
    var a = 0, i;
    for (i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (a < 0) pts = pts.slice().reverse();
    return 'M' + pts.map(function (p) { return n3(p[0]) + ' ' + n3(p[1]); }).join('L') + 'Z';
  }
  function para(x1, y1, x2, y2, th) { return poly([[x1, y1 - th / 2], [x2, y2 - th / 2], [x2, y2 + th / 2], [x1, y1 + th / 2]]); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  /* ================= glyphs (units: staff spaces; y grows downward) ================= */
  var G = {};
  // treble clef: origin on the G line (second line from the bottom), left edge x = 0
  G.treble = {
    d: brush([[1.08, 2.32, 0.22], [1.36, 2.78, 0.2], [1.84, 2.74, 0.18], [2.1, 2.28, 0.15], [2.06, 1.6, 0.14], [1.88, 0.5, 0.14],
      [1.67, -0.6, 0.14], [1.46, -1.7, 0.15], [1.24, -2.75, 0.17], [1.15, -3.55, 0.2], [1.33, -4.18, 0.17], [1.7, -4.42, 0.13],
      [2.08, -4.12, 0.2], [2.24, -3.5, 0.3], [2.04, -2.76, 0.46], [1.55, -2.06, 0.56], [0.82, -1.36, 0.53], [0.27, -0.56, 0.44],
      [0.1, 0.12, 0.37], [0.44, 0.72, 0.3], [1.3, 1.04, 0.24], [2.24, 0.78, 0.32], [2.7, -0.04, 0.42], [2.42, -0.84, 0.3],
      [1.76, -1.12, 0.17], [1.13, -0.86, 0.19], [0.88, -0.22, 0.26], [1.04, 0.34, 0.19], [1.52, 0.56, 0.03]], 8) + circ(1.0, 2.2, 0.41),
    w: 2.85
  };
  // bass clef: origin on the F line (second line from the top)
  G.bass = {
    d: brush([[0.5, -0.12, 0.34], [0.58, -0.62, 0.2], [0.98, -1.0, 0.17], [1.56, -1.02, 0.22], [2.06, -0.68, 0.38], [2.29, -0.04, 0.48],
      [2.16, 0.76, 0.46], [1.76, 1.46, 0.38], [1.16, 2.06, 0.28], [0.52, 2.56, 0.15], [0.04, 2.86, 0.02]], 10) +
      circ(0.42, 0.02, 0.4) + circ(2.78, -0.5, 0.15) + circ(2.78, 0.5, 0.15),
    w: 2.95
  };
  // noteheads: origin at the left edge, centered on the line or space
  var HW = 1.17, WW = 1.64; // black/half head width, whole head width
  G.black = { d: ell(0.585, 0, 0.6, 0.43, -20), w: HW };
  G.half = { d: ell(0.585, 0, 0.6, 0.43, -20) + ell(0.585, 0, 0.43, 0.155, -30, true), w: HW };
  G.whole = { d: ell(0.82, 0, 0.82, 0.5, 0) + ell(0.82, 0, 0.42, 0.25, 55, true), w: WW };
  // letter-name heads (drawn 1.3 times larger): open heads are rings so a letter fits inside
  G.halfL = { d: ell(0.585, 0, 0.6, 0.43, -16) + ell(0.585, 0, 0.5, 0.335, -16, true), w: HW };
  G.wholeL = { d: ell(0.82, 0, 0.82, 0.5, 0) + ell(0.82, 0, 0.62, 0.36, 0, true), w: WW };
  // accidentals: origin at the left edge, on the note's line or space
  G['#'] = { d: rect(0.19, -1.2, 0.11, 2.65) + rect(0.69, -1.45, 0.11, 2.65) + para(0, -0.33, 1.0, -0.6, 0.36) + para(0, 0.6, 1.0, 0.33, 0.36), w: 1.0 };
  G.b = { d: rect(0.03, -1.85, 0.12, 2.38) + brush([[0.12, -0.26, 0.08], [0.45, -0.56, 0.17], [0.76, -0.52, 0.25], [0.84, -0.18, 0.27], [0.6, 0.18, 0.21], [0.14, 0.5, 0.07]], 8), w: 0.9 };
  G.n = { d: rect(0.06, -1.45, 0.11, 2.05) + rect(0.6, -0.6, 0.11, 2.05) + para(0.06, -0.24, 0.71, -0.42, 0.32) + para(0.06, 0.42, 0.71, 0.24, 0.32), w: 0.77 };
  G['##'] = { d: (function () {
    var s = '', c = [[0.17, -0.33], [0.83, -0.33], [0.17, 0.33], [0.83, 0.33]];
    c.forEach(function (p) { s += poly([[p[0] - 0.2, p[1] - 0.2], [p[0] + 0.2, p[1] - 0.2], [p[0] + 0.2, p[1] + 0.2], [p[0] - 0.2, p[1] + 0.2]]); });
    return s + para(0.17, -0.33, 0.83, 0.33, 0.13) + para(0.17, 0.33, 0.83, -0.33, 0.13);
  })(), w: 1.0 };
  G.bb = { d: G.b.d + G.b.d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, function (m, x, y) { return n3(+x + 0.72) + ' ' + y; }).replace(/h(-?\d*\.?\d+)/g, 'h$1'), w: 1.62 };
  // rests: origin at the left edge on the middle line
  G.r1 = { d: rect(0, -1, 1.25, 0.52), w: 1.25 };
  G.r2 = { d: rect(0, -0.52, 1.25, 0.52), w: 1.25 };
  G.r4 = { d: brush([[0.3, -1.56, 0.03], [0.44, -1.38, 0.3], [0.68, -1.04, 0.47], [0.9, -0.74, 0.44], [1.0, -0.6, 0.1]], 6) +
    brush([[0.99, -0.63, 0.13], [0.64, -0.27, 0.14], [0.3, 0.07, 0.12]], 6) +
    brush([[0.29, 0.03, 0.1], [0.45, 0.25, 0.43], [0.72, 0.6, 0.46], [0.97, 0.93, 0.08]], 6) +
    brush([[0.95, 0.95, 0.06], [0.56, 0.8, 0.2], [0.27, 0.93, 0.32], [0.23, 1.23, 0.33], [0.42, 1.47, 0.22], [0.63, 1.6, 0.05]], 6), w: 1.05 };
  function flaggedRest(nf) { // 8th, 16th, 32nd rests
    var s = '', topX = 1.05 + (nf - 1) * 0.18, topY = -0.62 - (nf - 1) * 0.5, slope = 0.3, bot = 1.05 + (nf - 1) * 0.55;
    s += poly([[topX - 0.07, topY - 0.08], [topX + 0.11, topY - 0.08], [topX + 0.11 - (bot - topY) * slope, bot], [topX - 0.07 - (bot - topY) * slope, bot]]);
    for (var k = 0; k < nf; k++) {
      var y = topY + 0.08 + k * 1.0, xs = topX + 0.02 - (y - topY) * slope;
      s += circ(xs - 0.68, y + 0.08, 0.25) + brush([[xs - 0.86, y + 0.22, 0.08], [xs - 0.46, y + 0.34, 0.15], [xs - 0.14, y + 0.18, 0.14], [xs + 0.02, y - 0.06, 0.1]], 6);
    }
    return { d: s, w: topX + 0.15 };
  }
  G.r8 = flaggedRest(1); G.r16 = flaggedRest(2); G.r32 = flaggedRest(3);
  // flags: origin at the stem's end (x = stem center); up flags hang down to the right, down flags rise to the right
  function flagPath(n, up) {
    var s = '';
    for (var k = 0; k < n; k++) {
      var last = k === n - 1, o = k * 0.78;
      var P = last ? [[0.06, 0, 0.12], [0.1, 0.35, 0.4], [0.32, 0.85, 0.44], [0.72, 1.4, 0.36], [0.94, 2.05, 0.22], [0.86, 2.7, 0.1], [0.64, 3.1, 0.02]]
        : [[0.06, 0, 0.12], [0.12, 0.3, 0.4], [0.4, 0.75, 0.4], [0.82, 1.25, 0.26], [0.96, 1.7, 0.1], [0.92, 1.95, 0.02]];
      P = P.map(function (p) { return [p[0], (p[1] + o) * (up ? 1 : -1), p[2]]; });
      s += brush(P, 6);
    }
    return s;
  }
  G.flags = { up: [null, flagPath(1, true), flagPath(2, true), flagPath(3, true)], down: [null, flagPath(1, false), flagPath(2, false), flagPath(3, false)] };
  // common time C and cut time; origin on the middle line, left edge
  G.common = { d: brush([[1.2, -0.58, 0.3], [1.05, -0.9, 0.15], [0.64, -0.98, 0.2], [0.22, -0.56, 0.36], [0.12, 0.06, 0.42],
    [0.36, 0.74, 0.3], [0.86, 1.0, 0.15], [1.3, 0.82, 0.08], [1.46, 0.58, 0.03]], 8) + circ(1.22, -0.5, 0.22), w: 1.6 };
  G.cut = { d: G.common.d + rect(0.76, -1.62, 0.13, 3.24), w: 1.6 };
  // fermata (above): origin at its center bottom
  G.fermata = { d: brush([[-1.15, 0, 0.04], [-1.0, -0.62, 0.14], [-0.55, -1.08, 0.22], [0, -1.22, 0.26], [0.55, -1.08, 0.22], [1.0, -0.62, 0.14], [1.15, 0, 0.04]], 8) + circ(0, -0.22, 0.2), w: 2.3 };
  // the brace of a grand staff, h staff spaces tall
  function brace(h) {
    var w = Math.min(1.35, 0.7 + h * 0.035), t = Math.min(0.62, 0.3 + h * 0.018);
    return brush([[w, 0, 0.02], [w * 0.62, h * 0.035, t * 0.45], [w * 0.4, h * 0.11, t * 0.85], [w * 0.36, h * 0.25, t], [w * 0.32, h * 0.38, t * 0.9],
      [w * 0.12, h * 0.47, t * 0.45], [0, h * 0.5, 0.05], [w * 0.12, h * 0.53, t * 0.45], [w * 0.32, h * 0.62, t * 0.9], [w * 0.36, h * 0.75, t],
      [w * 0.4, h * 0.89, t * 0.85], [w * 0.62, h * 0.965, t * 0.45], [w, h, 0.02]], 10);
  }
  function tieShape(x1, y1, x2, y2, dir, maxH) {
    var L = Math.max(0.6, x2 - x1), h = Math.min(maxH || 1.1, 0.45 + 0.12 * Math.sqrt(L * 3)), t = 0.2;
    var c1 = x1 + L * 0.22, c2 = x2 - L * 0.22;
    return 'M' + n3(x1) + ' ' + n3(y1) + 'C' + n3(c1) + ' ' + n3(y1 + dir * h) + ' ' + n3(c2) + ' ' + n3(y2 + dir * h) + ' ' + n3(x2) + ' ' + n3(y2) +
      'C' + n3(c2) + ' ' + n3(y2 + dir * (h - t)) + ' ' + n3(c1) + ' ' + n3(y1 + dir * (h - t)) + ' ' + n3(x1) + ' ' + n3(y1) + 'Z';
  }
  function slurShape(x1, y1, x2, y2, dir, h) {
    var L = x2 - x1, t = 0.22, c1 = x1 + L * 0.25, c2 = x2 - L * 0.25;
    return 'M' + n3(x1) + ' ' + n3(y1) + 'C' + n3(c1) + ' ' + n3(y1 + dir * h) + ' ' + n3(c2) + ' ' + n3(y2 + dir * h) + ' ' + n3(x2) + ' ' + n3(y2) +
      'C' + n3(c2) + ' ' + n3(y2 + dir * (h - t)) + ' ' + n3(c1) + ' ' + n3(y1 + dir * (h - t)) + ' ' + n3(x1) + ' ' + n3(y1) + 'Z';
  }

  /* ================= music helpers ================= */
  var TOP = { treble: 38, bass: 26 }; // diatonic step of each clef's top line (F5, A3)
  var KEYPOS = { // staff positions (half-spaces below the top line) of key-signature accidentals, in order
    treble: { 1: [0, 3, -1, 2, 5, 1, 4], '-1': [4, 1, 5, 2, 6, 3, 7] },
    bass: { 1: [2, 5, 1, 4, 7, 3, 6], '-1': [6, 3, 7, 4, 8, 5, 9] }
  };
  function stepY(step, clef) { return (TOP[clef] - step) / 2; }
  function spaceFor(q) { return q >= 1 ? 3.4 + 1.1 * Math.log(q) / Math.LN2 : 3.4 * Math.pow(q, 0.38); }

  /* ================= the Score ================= */
  function Score(el, src, opts) {
    this.el = el;
    this.opts = Object.assign({ letters: false, fingering: true, barNumbers: true, timeSig: true, keySig: true, finalBar: true, scale: 1 }, opts || {});
    this.model = toModel(src, this.opts);
    this.lit = {};
    this.cur = null;
    el.classList.add('ms-score');
    this.prep();
    this.render();
    var self = this, lastW = el.clientWidth;
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(function () {
        var w = el.clientWidth;
        if (Math.abs(w - lastW) < 2) return;
        lastW = w;
        clearTimeout(self._rt);
        self._rt = setTimeout(function () { self.render(); }, 80);
      });
      this.ro.observe(el);
    }
  }

  function toModel(src, opts) {
    var S = TRB.song;
    if (src && src.staves && src.measures && src.notes) return src;
    if (typeof src === 'string' && !/^\s*[a-z_]+\s*:/m.test(src)) {
      var o = { staves: {}, key: opts.key || 'C', time: opts.time || '4/4' };
      var sid = opts.clef === 'bass' ? 'lh' : 'rh';
      o.staves[sid] = src;
      if (opts.clef) { o.clefs = {}; o.clefs[sid] = opts.clef; }
      return S.parse(o, { loose: true });
    }
    if (src && typeof src === 'object' && !src.staves && (src.rh || src.lh)) {
      var o2 = { staves: {}, key: src.key || 'C', time: src.time || '4/4', clefs: src.clefs, common: src.common, cut: src.cut, pickup: src.pickup };
      if (src.rh) o2.staves.rh = src.rh;
      if (src.lh) o2.staves.lh = src.lh;
      if (src.clef && !src.clefs) { o2.clefs = {}; o2.clefs[src.rh ? 'rh' : 'lh'] = src.clef; }
      if (src.fingering) o2.fingering = src.fingering;
      if (src.marks) o2.marks = src.marks;
      return S.parse(o2, { loose: true });
    }
    return S.parse(src, {});
  }

  /* ---------- width-independent preparation ---------- */
  var HS = 1; // notehead scale for the score being laid out (1.3 with letter names)
  Score.prototype.prep = function () {
    var M = this.model, opts = this.opts, self = this;
    HS = this.hs = opts.letters ? 1.3 : 1;
    var want = opts.staves || ['rh', 'lh'];
    this.staves = M.staves.filter(function (s) { return want.indexOf(s.id) >= 0; });
    var grand = this.grand = this.staves.length > 1;
    var TPQ = M.TPQ;
    var bars = this.bars = [];
    M.measures.forEach(function (MM, mi) {
      var cols = {}, bar = { mi: mi, M: MM, cols: [], items: [], hasMR: false };
      self.staves.forEach(function (S, si) {
        var SM = S.measures[mi];
        if (!SM) return;
        var two = SM.voices.length > 1;
        SM.voices.forEach(function (v, vi) {
          v.forEach(function (it) {
            var c = cols[it.start] || (cols[it.start] = { off: it.start, items: [], lext: 0, rext: HW * HS, gap: 0 });
            var R = { it: it, si: si, vi: vi, two: two, clef: SM.clefNow, col: c };
            c.items.push(R); bar.items.push(R);
            if (it.measureRest) bar.hasMR = true;
          });
        });
      });
      var offs = Object.keys(cols).map(Number).sort(function (a, b) { return a - b; });
      offs.forEach(function (o, k) { var c = cols[o]; c.gap = (k + 1 < offs.length ? offs[k + 1] : MM.len) - o; bar.cols.push(c); });
      bars.push(bar);
    });
    // per item: heads, stems, beams
    bars.forEach(function (bar) {
      bar.items.forEach(function (R) { prepItem(R, M); });
      self.staves.forEach(function (S, si) {
        var SM = S.measures[bar.mi];
        if (!SM) return;
        SM.voices.forEach(function (v, vi) {
          var Rs = bar.items.filter(function (R) { return R.si === si && R.vi === vi; });
          beamGroups(Rs, M, SM.voices.length > 1 ? (vi === 0 ? -1 : 1) : 0);
        });
      });
      bar.items.forEach(function (R) { placeHeads(R); });
      // two voices at the same moment: move the lower voice's heads right when they clash
      bar.cols.forEach(function (c) {
        var bySt = {};
        c.items.forEach(function (R) { (bySt[R.si] = bySt[R.si] || []).push(R); });
        Object.keys(bySt).forEach(function (si) {
          var a = bySt[si].filter(function (R) { return R.vi === 0 && R.it.kind !== 'rest'; })[0];
          var b = bySt[si].filter(function (R) { return R.vi === 1 && R.it.kind !== 'rest'; })[0];
          if (!a || !b) return;
          var aLow = Math.max.apply(null, a.ys), bHigh = Math.min.apply(null, b.ys);
          var unison = a.ys.length === 1 && b.ys.length === 1 && aLow === bHigh && a.head === b.head && a.it.dots === b.it.dots && a.head !== 'whole';
          if (unison) { b.shareHead = true; return; }
          if (bHigh - aLow < 1) b.dx = a.hw + (a.displaced ? a.hw : 0) + 0.1; // a second, a unison of different values, or crossing
        });
      });
      bar.cols.forEach(function (c) {
        var l = 0.2, r = HW * HS;
        c.items.forEach(function (R) { l = Math.max(l, R.lext - (R.dx || 0)); r = Math.max(r, R.rext + (R.dx || 0)); });
        c.lext = l; c.rext = r;
      });
    });
  };

  function prepItem(R, M) {
    var it = R.it;
    R.head = it.base === 1 ? 'whole' : it.base === 2 ? 'half' : 'black';
    R.hw = (R.head === 'whole' ? WW : HW) * HS;
    R.flags = it.base === 8 ? 1 : it.base === 16 ? 2 : it.base === 32 ? 3 : 0;
    R.hasStem = it.kind !== 'rest' && it.base !== 1;
    if (it.kind === 'rest') { R.ys = []; R.lext = 0; R.rext = it.measureRest ? 1.25 : 1.2 + (it.dots ? 0.35 + 0.45 * it.dots : 0); return; }
    R.ys = it.notes.map(function (n) { return stepY(n.step, R.clef); });
    R.stemDir = 0;
  }

  // beam groups for one voice of one bar; sets R.stemDir, R.beam (group) for beamed items
  function beamGroups(Rs, M, forced) {
    var TPQ = M.TPQ, t = M.time, win;
    if (t.den === 8) win = TPQ * 1.5;
    else if (t.den === 2) win = TPQ * 2;
    else win = TPQ;
    var groups = [], cur = null;
    function flush() { if (cur && cur.length > 1) groups.push(cur); else if (cur && cur.length === 1) cur[0].single = true; cur = null; }
    var i;
    for (i = 0; i < Rs.length; i++) {
      var R = Rs[i], it = R.it;
      var beamable = it.kind !== 'rest' && it.base >= 8;
      if (!beamable) { flush(); continue; }
      // a short tuplet (a 16th triplet in 6/8) beams with its beat like other notes; a tuplet lasting a quarter or more,
      // or crossing a beat, beams on its own (triplet eighths in 4/4 or cut time: three to a beam)
      if (it.tuplet && R.tupSpan === undefined) {
        var tg = Rs.filter(function (x) { return x.it.tuplet && x.it.tuplet.id === it.tuplet.id; });
        var ts = tg[0].it.start, te = tg[tg.length - 1].it.start + tg[tg.length - 1].it.dur;
        var own = te - ts >= TPQ || Math.floor(ts / win) !== Math.floor((te - 1) / win);
        tg.forEach(function (x) { x.tupSpan = own; });
      }
      if (it.tuplet && R.tupSpan) {
        if (cur && (!cur[0].it.tuplet || cur[0].it.tuplet.id !== it.tuplet.id)) flush();
        cur = cur || [];
        cur.push(R);
        if (it.tuplet.last) flush();
        continue;
      }
      if (cur && cur[0].it.tuplet && cur[0].tupSpan) flush();
      var w = Math.floor(it.start / win);
      if (cur && (Math.floor(cur[0].it.start / win) !== w || it.start + it.dur > (w + 1) * win)) flush();
      if (it.start + it.dur > (w + 1) * win) { flush(); R.single = true; continue; }
      cur = cur || [];
      cur.push(R);
    }
    flush();
    // 4/4: join two full beats of plain eighths into a half-bar group
    if (t.num === 4 && t.den === 4) {
      for (i = 0; i < groups.length - 1; i++) {
        var a = groups[i], b = groups[i + 1];
        var allE = a.concat(b).every(function (R) { return R.it.base === 8 && !R.it.dots && !R.it.tuplet; });
        var wa = Math.floor(a[0].it.start / TPQ), wb = Math.floor(b[0].it.start / TPQ);
        if (allE && a.length === 2 && b.length === 2 && wb === wa + 1 && wa % 2 === 0) { groups.splice(i, 2, a.concat(b)); }
      }
    }
    // stem directions
    Rs.forEach(function (R) { if (R.it.kind !== 'rest') R.stemDir = forced || dirFor(R.ys); });
    groups.forEach(function (g) {
      var ys = [];
      g.forEach(function (R) { ys = ys.concat(R.ys); });
      var d = forced || dirFor(ys);
      var B = { items: g, dir: d };
      g.forEach(function (R) { R.stemDir = d; R.beam = B; R.single = false; });
    });
  }
  function dirFor(ys) { // stems up (-1) when the note farthest from the middle line is below it
    var far = 0, i;
    for (i = 0; i < ys.length; i++) if (Math.abs(ys[i] - 2) > Math.abs(far)) far = ys[i] - 2;
    var hi = Math.min.apply(null, ys), lo = Math.max.apply(null, ys);
    if (hi < 2 && lo > 2 && 2 - hi === lo - 2) return 1; // as far above the middle line as below it: stems down
    return far > 0 ? -1 : 1;
  }

  // noteheads of a chord: which go on the other side of the stem (seconds), accidental columns, extents
  function placeHeads(R) {
    var it = R.it;
    if (it.kind === 'rest') return;
    var n = it.notes.length, up = R.stemDir <= 0 && R.head !== 'whole' ? true : R.stemDir < 0;
    if (R.head === 'whole') up = true;
    R.side = new Array(n).fill(0); // 0 normal, 1 right of stem (stem up), -1 left of stem (stem down)
    var idx = it.notes.map(function (_, k) { return k; }); // notes are sorted low -> high
    if (R.stemDir < 0 || R.head === 'whole') { // up: go upward from the bottom
      for (var k = 1; k < n; k++) if (R.ys[k - 1] - R.ys[k] === 0.5 && R.side[k - 1] === 0) R.side[k] = 1;
    } else {
      for (var k2 = n - 2; k2 >= 0; k2--) if (R.ys[k2] - R.ys[k2 + 1] === 0.5 && R.side[k2 + 1] === 0) R.side[k2] = -1;
    }
    R.displaced = R.side.some(function (s) { return s !== 0; });
    var leftHeads = R.side.some(function (s) { return s === -1; }) ? R.hw : 0;
    var rightHeads = R.side.some(function (s) { return s === 1; }) ? R.hw : 0;
    // accidentals: columns from the top down, first fit
    var cols = [], accs = [];
    for (var j = n - 1; j >= 0; j--) {
      var a = it.notes[j].acc;
      if (!a) continue;
      var y = R.ys[j], c = 0;
      while (cols[c] && cols[c].some(function (yy) { return Math.abs(yy - y) < 3; })) c++;
      (cols[c] = cols[c] || []).push(y);
      accs.push({ j: j, col: c, g: a });
    }
    var colW = [];
    accs.forEach(function (A) { colW[A.col] = Math.max(colW[A.col] || 0, G[A.g].w); });
    var x = -leftHeads - 0.18, colX = [];
    for (var c2 = 0; c2 < colW.length; c2++) { x -= colW[c2]; colX[c2] = x; x -= 0.12; }
    accs.forEach(function (A) { A.x = colX[A.col]; });
    R.accs = accs;
    R.lext = accs.length ? -Math.min.apply(null, colX) : leftHeads;
    var right = R.hw + rightHeads;
    var dots = it.dots ? 0.35 + 0.48 * it.dots : 0;
    var flag = R.flags && !R.beam && R.stemDir < 0 ? 0.95 : 0;
    R.rext = right + Math.max(dots, flag - (rightHeads ? R.hw : 0));
  }

  /* ---------- layout for a width, then draw ---------- */
  Score.prototype.render = function () {
    var el = this.el, opts = this.opts, M = this.model, self = this;
    HS = this.hs;
    var W = Math.max(240, el.clientWidth || 600);
    var letters = !!opts.letters;
    var sp = opts.sp || Math.max(8, Math.min(10.5, W / 92));
    sp *= opts.scale || 1;
    if (letters) sp *= 1.12;
    this.sp = sp;
    var Wsp = (W - 2) / sp;
    var grand = this.grand, nst = this.staves.length;
    var left0 = grand ? 1.9 : 0.25; // where the staff lines begin
    var key = M.key, ksN = opts.keySig === false ? 0 : Math.abs(key.fifths);
    var ksStep = key.fifths > 0 ? 1.0 : 0.88;
    function headerW(first, clefs) {
      var w = 0.7 + 3.0 + 0.6 + (ksN ? ksN * ksStep + 0.4 : 0);
      if (first && opts.timeSig !== false) w += (M.time.common || M.time.cut ? 1.6 : 1.9) + 0.9;
      return w + 0.8;
    }
    var dens = Wsp < 45 ? 0.8 : Wsp < 70 ? 0.9 : 1; // tighter spacing on narrow screens, so two bars fit a line
    // natural widths of the bars
    this.bars.forEach(function (bar) {
      var x = 1.0, k;
      bar.colX = [];
      if (bar.hasMR && bar.cols.length === 1) { bar.nat = 7; bar.colX = [1.0]; bar.spaces = [6.0]; bar.lead = 1.0; bar.trail = 0; return; }
      bar.lead = 0.9 + (bar.cols.length ? bar.cols[0].lext : 0);
      var startRep = bar.M.marks && (bar.M.marks.repeat === 'start' || bar.M.marks.repeat === 'both');
      var clefChange = self.staves.some(function (S) { var SM = S.measures[bar.mi]; return SM && SM.clef && bar.mi > 0; });
      if (startRep) bar.lead += 1.2;
      if (clefChange) bar.lead += 2.4;
      bar.spaces = [];
      for (k = 0; k < bar.cols.length; k++) {
        var c = bar.cols[k], q = c.gap / M.TPQ;
        var want = spaceFor(q) * dens;
        var next = bar.cols[k + 1];
        var need = c.rext + (next ? next.lext : 0) + 0.35;
        if (!next) need = c.rext + 0.9;
        bar.spaces.push(Math.max(want * (next ? 1 : 0.9), need));
      }
      var endRep = bar.M.marks && (bar.M.marks.repeat === 'end' || bar.M.marks.repeat === 'both');
      bar.trail = endRep ? 1.2 : 0;
      bar.nat = bar.lead + bar.spaces.reduce(function (a, b) { return a + b; }, 0) + bar.trail;
    });
    // line breaks: minimum raggedness over the whole piece, so lines come out evenly full
    var nb = this.bars.length, bars = this.bars, lines = [];
    var availFor = function (i0) { return Wsp - left0 - headerW(i0 === 0) - 0.3; };
    var best = new Array(nb + 1), next = new Array(nb + 1);
    best[nb] = 0;
    for (var i0 = nb - 1; i0 >= 0; i0--) {
      best[i0] = Infinity;
      var av = availFor(i0), used = 0;
      for (var j0 = i0; j0 < nb; j0++) {
        used += bars[j0].nat * 1.12;
        var cnt = j0 - i0 + 1;
        if (cnt > 1 && (used > av || (opts.maxBars && cnt > opts.maxBars))) break;
        var str = av / used - 1; // how much this line would be stretched
        var cost = (j0 === nb - 1 ? 0.7 : 1) * str * str * 100 + 8 + (used > av ? 1000 : 0) + best[j0 + 1];
        if (cost < best[i0]) { best[i0] = cost; next[i0] = j0 + 1; }
      }
    }
    for (var a0 = 0; a0 < nb; a0 = next[a0]) lines.push({ bars: bars.slice(a0, next[a0]) });
    // draw
    var out = [], sysY = 0, self2 = this;
    this.measPos = {}; this.sysInfo = []; this.noteInfo = {}; this.tupRun = {};
    var tieQ = [], slurQ = [];
    var prevLineEnd = null;
    lines.forEach(function (L, li) {
      var first = li === 0;
      var hx = left0 + headerW(first);
      var nat = L.bars.reduce(function (a, b) { return a + b.nat; }, 0);
      var avail = Wsp - hx - 0.3;
      var lastLine = li === lines.length - 1;
      var stretch = avail / nat;
      if (lastLine && lines.length > 1 && nat * 1.12 < avail * 0.5) stretch = Math.min(stretch, 1.3); // a short last line stays short
      if (stretch < 1) stretch = Math.max(stretch, 0.6);
      var sys = { li: li, staves: [], x0: left0, x1: 0, bars: L.bars };
      // per staff drawing buffers
      var buf = self2.staves.map(function () { return { s: [], top: 0, bot: 4, under: [], over: [] }; });
      function ext(si, y) { var B = buf[si]; if (y < B.top) B.top = y; if (y > B.bot) B.bot = y; }
      // header: clef, key signature, time signature for each staff
      self2.staves.forEach(function (S, si) {
        var clef = clefAt(S, L.bars[0].mi);
        var B = buf[si];
        B.s.push(glyph(clef === 'treble' ? G.treble : G.bass, left0 + 0.7, clef === 'treble' ? 3 : 1));
        ext(si, clef === 'treble' ? -1.5 : 0);
        ext(si, clef === 'treble' ? 5.8 : 4);
        if (opts.clef8 && clef === 'treble') { B.s.push('<text class="ms-ts ms-c8" x="' + n3(left0 + 0.7 + 1.05) + '" y="7.15" font-size="1.25" text-anchor="middle">8</text>'); ext(si, 7.3); }
        var kx = left0 + 0.7 + 3.0 + 0.6;
        if (ksN) {
          var pos = KEYPOS[clef][key.fifths > 0 ? 1 : -1];
          for (var k = 0; k < ksN; k++) B.s.push(glyph(G[key.fifths > 0 ? '#' : 'b'], kx + k * ksStep, pos[k] / 2));
          kx += ksN * ksStep + 0.4;
        }
        if (first && opts.timeSig !== false) {
          if (M.time.common || M.time.cut) B.s.push(glyph(M.time.cut ? G.cut : G.common, kx + 0.1, 2));
          else {
            var tw = Math.max(String(M.time.num).length, String(M.time.den).length) * 1.55;
            B.s.push('<text class="ms-ts" x="' + n3(kx + tw / 2 + 0.1) + '" y="1.93" font-size="2.95" text-anchor="middle">' + M.time.num + '</text>');
            B.s.push('<text class="ms-ts" x="' + n3(kx + tw / 2 + 0.1) + '" y="3.93" font-size="2.95" text-anchor="middle">' + M.time.den + '</text>');
          }
        }
      });
      // bars
      var x = hx, barXs = [];
      L.bars.forEach(function (bar, bi) {
        var bx0 = x, cx = x + bar.lead * stretch;
        var spaces = bar.spaces.map(function (s) { return s * stretch; });
        if (bar.hasMR && bar.cols.length === 1) spaces = [bar.nat * stretch - bar.lead * stretch];
        bar.colX = [];
        var xx = cx;
        bar.cols.forEach(function (c, k) { bar.colX.push(xx); xx += spaces[k]; });
        var bx1 = xx + bar.trail * stretch;
        if (!bar.cols.length) bx1 = bx0 + bar.nat * stretch;
        barXs.push([bx0, bx1, bar]);
        self2.measPos[bar.mi] = { sys: li, x0: bx0, x1: bx1, cols: bar.cols.map(function (c, k) { return { off: c.off, x: bar.colX[k] }; }), len: bar.M.len };
        // clef change at this bar
        self2.staves.forEach(function (S, si) {
          var SM = S.measures[bar.mi];
          if (SM && SM.clef && bar.mi > 0 && bi > 0) {
            buf[si].s.push(glyph(SM.clef === 'treble' ? G.treble : G.bass, bx0 + 0.45, SM.clef === 'treble' ? 3 : 1, 0.72));
          }
        });
        drawBar(self2, bar, buf, ext, M, opts, tieQ, slurQ, li, bx0, bx1, stretch);
        x = bx1;
      });
      sys.x1 = x;
      sys.barXs = barXs;
      // beams / stems / ties need the x positions: they are drawn in drawBar. Ties and slurs in this system:
      // dynamics, words and voltas
      var dyns = [], words = [];
      L.bars.forEach(function (bar) {
        var mk = bar.M.marks || {}, mp = self2.measPos[bar.mi];
        var at = function (s) {
          var p = String(s).split('@'), off = p[1] ? (parseFloat(p[1]) - 1) * (M.TPQ * 4 / M.time.den) : 0;
          return { t: p[0].trim(), x: xAt(mp, off) };
        };
        if (mk.dyn !== undefined) [].concat(mk.dyn).forEach(function (d) { var A = at(d); dyns.push(A); });
        if (mk.text !== undefined) [].concat(mk.text).forEach(function (d) { var A = at(d); A.kind = 'text'; dyns.push(A); });
        if (mk.tempo !== undefined) [].concat(mk.tempo).forEach(function (d) { words.push({ t: String(d), x: mp.x0 + (bar === L.bars[0] ? -1.5 : 0.6), kind: 'tempo' }); });
        if (mk.above !== undefined) [].concat(mk.above).forEach(function (d) { var A = at(d); A.kind = 'above'; words.push(A); });
        if (mk.fermata) { var lc = mp.cols.length ? mp.cols[mp.cols.length - 1].x + HW * HS / 2 : (mp.x0 + mp.x1) / 2; words.push({ t: '', x: lc, kind: 'fermata' }); }
        if (mk.pedal !== undefined) [].concat(mk.pedal).forEach(function (d) { var A = at(d); A.kind = 'pedal'; buf[nst - 1].under.push(A); });
      });
      sys.dyns = dyns; sys.words = words;
      // voltas
      var voltas = [], vcur = null;
      L.bars.forEach(function (bar) {
        var e = bar.M.marks && +bar.M.marks.ending, mp = self2.measPos[bar.mi];
        if (e) {
          if (vcur && vcur.n === e) vcur.x1 = mp.x1;
          else { vcur = { n: e, x0: mp.x0, x1: mp.x1, close: false, first: true }; voltas.push(vcur); }
          vcur.close = e === 1;
        } else vcur = null;
      });
      sys.voltas = voltas;
      sys.buf = buf;
      self2.sysInfo.push(sys);
    });
    // ties and slurs (may cross systems)
    drawTies(this, tieQ, slurQ);
    // assemble: vertical placement
    var y = 0.6, svgParts = [];
    function stripInfo(sys, li) {
      return { li: li, x0: sys.x0, x1: sys.x1, first: li === 0, bars: sys.bars.map(function (b) { var mp = self.measPos[b.mi]; return { mi: b.mi, x0: mp.x0, x1: mp.x1, len: mp.len, cols: mp.cols }; }) };
    }
    this.sysInfo.forEach(function (sys, li) {
      var aboveR = opts.above ? opts.above(stripInfo(sys, li)) : null, belowR = opts.below ? opts.below(stripInfo(sys, li)) : null;
      var aH = aboveR ? aboveR.h || 0 : 0, bH = belowR ? belowR.h || 0 : 0;
      if (opts.staffless) {
        sys.y = [y + aH]; sys.top = y; sys.h = aH + bH;
        sys.cy0 = y + aH + (belowR && belowR.cursor ? belowR.cursor[0] : 0); sys.cy1 = y + aH + (belowR && belowR.cursor ? belowR.cursor[1] : bH);
        var gs = ['<g class="ms-sys" data-sys="' + li + '">'];
        if (aboveR) gs.push('<g class="ms-above" transform="translate(0 ' + n3(y) + ')">' + aboveR.svg + '</g>');
        if (belowR) gs.push('<g class="ms-below" transform="translate(0 ' + n3(y + aH) + ')">' + belowR.svg + '</g>');
        sys.barXs.forEach(function (b) { gs.push('<rect class="ms-hit" data-m="' + b[2].mi + '" x="' + n3(b[0]) + '" y="' + n3(sys.top) + '" width="' + n3(b[1] - b[0]) + '" height="' + n3(sys.h) + '"/>'); });
        gs.push('</g>');
        svgParts.push(gs.join(''));
        y += sys.h + 1.6;
        return;
      }
      y += aH;
      var buf = sys.buf, offs = [];
      var topRoom = -buf[0].top;
      if (sys.words.length) topRoom = Math.max(topRoom + 2.2, 4.2);
      if (sys.voltas.length) topRoom = Math.max(topRoom, -buf[0].top) + 2.6;
      if (opts.barNumbers !== false && li > 0) topRoom = Math.max(topRoom, 2.6);
      topRoom = Math.max(topRoom, 1.6);
      var sy = y + topRoom;
      offs.push(sy);
      var hasDyn = sys.dyns.length > 0;
      for (var si = 1; si < buf.length; si++) {
        var gap = Math.max(5.5, (buf[si - 1].bot - 4) + (-buf[si].top) + (hasDyn ? 2.8 : 1.2));
        sy += 4 + gap;
        offs.push(sy);
      }
      var last = buf[buf.length - 1];
      var bottomRoom = Math.max(last.bot - 4, 0) + (last.under.length ? 2.6 : 0) + (!grand && hasDyn ? 3.0 : 0);
      sys.y = offs; sys.top = y - aH; sys.h = sy + 4 + bottomRoom - y + aH;
      var yBelow = sy + 4 + bottomRoom;
      sys.cy0 = null; sys.cy1 = belowR ? yBelow + (belowR.cursor ? belowR.cursor[1] : bH) : null;
      sys.h += bH;
      // staff lines
      var g = ['<g class="ms-sys" data-sys="' + li + '">'];
      if (aboveR) g.push('<g class="ms-above" transform="translate(0 ' + n3(y - aH) + ')">' + aboveR.svg + '</g>');
      if (belowR) g.push('<g class="ms-below" transform="translate(0 ' + n3(yBelow) + ')">' + belowR.svg + '</g>');
      sys.buf.forEach(function (B, si) {
        var oy = offs[si], d = '';
        for (var k = 0; k < 5; k++) d += 'M' + n3(sys.x0) + ' ' + n3(oy + k) + 'H' + n3(sys.x1);
        g.push('<path class="ms-ln" d="' + d + '"/>');
        g.push('<g transform="translate(0 ' + n3(oy) + ')">' + B.s.join('') + '</g>');
      });
      // brace and system line
      if (grand) {
        var h = offs[offs.length - 1] + 4 - offs[0];
        g.push('<path class="ms-ink" d="' + brace(h) + '" transform="translate(0.15 ' + n3(offs[0]) + ')"/>');
        g.push('<path class="ms-bl" d="M' + n3(sys.x0) + ' ' + n3(offs[0]) + 'V' + n3(offs[offs.length - 1] + 4) + '" stroke-width="0.16"/>');
      }
      // barlines
      var yTop = offs[0], yBot = offs[offs.length - 1] + 4;
      sys.barXs.forEach(function (b, k) {
        var bar = b[2], mk = bar.M.marks || {}, isLastBar = bar.mi === self.bars.length - 1;
        var endRep = mk.repeat === 'end' || mk.repeat === 'both', startRep = mk.repeat === 'start' || mk.repeat === 'both';
        if (startRep) {
          var sx = b[0] + (k === 0 ? 0.2 : 0.1);
          var pm = k > 0 && (sys.barXs[k - 1][2].M.marks || {}).repeat;
          if (pm === 'end' || pm === 'both') { // :||: shares the thick line of the end repeat just before it
            g.push(thin(b[0] + 0.45, yTop, yBot));
            offs.forEach(function (oy) { g.push(dots(b[0] + 1.0, oy)); });
          } else {
            g.push(thick(sx, yTop, yBot) + thin(sx + 0.7, yTop, yBot));
            offs.forEach(function (oy) { g.push(dots(sx + 1.25, oy)); });
          }
        }
        if (endRep) {
          g.push(thin(b[1] - 0.9, yTop, yBot) + thick(b[1] - 0.25, yTop, yBot));
          offs.forEach(function (oy) { g.push(dots(b[1] - 1.45, oy)); });
        } else if (isLastBar && opts.finalBar !== false) {
          g.push(thin(b[1] - 0.9, yTop, yBot) + thick(b[1] - 0.25, yTop, yBot));
        } else g.push(thin(b[1] - 0.07, yTop, yBot));
        // click target
        g.push('<rect class="ms-hit" data-m="' + bar.mi + '" x="' + n3(b[0]) + '" y="' + n3(sys.top) + '" width="' + n3(b[1] - b[0]) + '" height="' + n3(sys.h) + '"/>');
      });
      // bar number at the line start
      if (opts.barNumbers !== false && li > 0) {
        var fb = sys.bars[0];
        g.push('<text class="ms-bn" x="' + n3(sys.x0 + 0.1) + '" y="' + n3(offs[0] - 1.4) + '" font-size="1.25">' + fb.M.bar + '</text>');
      }
      // voltas
      var vy = offs[0] + buf[0].top - 1.6;
      sys.voltas.forEach(function (V) {
        var x0 = V.x0 + 0.3, x1 = V.x1 - 0.5;
        g.push('<path class="ms-bl" d="M' + n3(x0) + ' ' + n3(vy + 1.8) + 'V' + n3(vy) + 'H' + n3(x1) + (V.close ? 'V' + n3(vy + 1.8) : '') + '" stroke-width="0.12" fill="none"/>');
        g.push('<text class="ms-vt" x="' + n3(x0 + 0.4) + '" y="' + n3(vy + 1.3) + '" font-size="1.3">' + V.n + '.</text>');
      });
      // words above the top staff
      var wy = Math.min(offs[0] + buf[0].top - 1.0, offs[0] - 1.6) - (sys.voltas.length ? 2.4 : 0);
      sys.words.forEach(function (W2) {
        if (W2.kind === 'fermata') { g.push(glyph(G.fermata, W2.x, Math.min(offs[0] + buf[0].top - 0.5, offs[0] - 0.8))); return; }
        g.push('<text class="' + (W2.kind === 'tempo' ? 'ms-tempo' : 'ms-word') + '" x="' + n3(W2.x) + '" y="' + n3(wy) + '" font-size="' + (W2.kind === 'tempo' ? 1.55 : 1.45) + '">' + esc(W2.t) + '</text>');
      });
      // dynamics: between the staves, or under a single staff
      if (sys.dyns.length) {
        var dy;
        if (grand) dy = (offs[0] + 4 + buf[0].bot - 4 + offs[1] + buf[1].top) / 2 + 0.75;
        else dy = offs[0] + Math.max(buf[0].bot, 4) + 2.3;
        sys.dyns.forEach(function (D) {
          if (D.kind === 'text') g.push('<text class="ms-word" x="' + n3(D.x + 3.0) + '" y="' + n3(dy - 0.15) + '" font-size="1.45">' + esc(D.t) + '</text>');
          else g.push('<text class="ms-dyn" x="' + n3(D.x - 0.3) + '" y="' + n3(dy) + '" font-size="2.05">' + esc(D.t) + '</text>');
        });
      }
      // pedal words under the bottom staff
      var py = offs[offs.length - 1] + Math.max(last.bot, 4) + 2.0;
      last.under.forEach(function (P) { g.push('<text class="ms-word" x="' + n3(P.x) + '" y="' + n3(py) + '" font-size="1.45">' + esc(P.t) + '</text>'); });
      g.push('</g>');
      svgParts.push(g.join(''));
      y = sys.top + sys.h + (grand ? 3.2 : 2.6);
    });
    var H = y;
    this.Wsp = Wsp; this.Hsp = H;
    var label = opts.label || ('Sheet music: ' + (M.meta.title || 'notes') + ', ' + M.key.label + ', ' + M.time.str + ' time, ' + M.measures.length + ' bars');
    var svg = '<svg xmlns="' + NS + '" class="ms-svg' + (letters ? ' ms-letters' : '') + '" viewBox="0 0 ' + n3(Wsp) + ' ' + n3(H) + '" width="' + n3(Wsp * sp) + '" height="' + n3(H * sp) + '" role="img" aria-label="' + esc(label) + '">' +
      svgParts.join('') + '<rect class="ms-cursor" x="0" y="0" width="0.6" height="1" rx="0.5" visibility="hidden"/></svg>';
    var keepScroll = this.el.scrollTop;
    this.el.innerHTML = svg;
    this.el.scrollTop = keepScroll;
    this.svg = this.el.firstChild;
    this.cursorEl = this.svg.querySelector('.ms-cursor');
    this.noteEls = {};
    var nodes = this.svg.querySelectorAll('.ms-n');
    for (var q = 0; q < nodes.length; q++) {
      var id = nodes[q].getAttribute('data-id');
      (this.noteEls[id] = this.noteEls[id] || []).push(nodes[q]);
    }
    // re-apply lights and the cursor
    var lit = this.lit; this.lit = {};
    Object.keys(lit).forEach(function (id) { self.highlight([id], lit[id]); });
    if (this.cur) this.cursor(this.cur[0], this.cur[1]);
    if (opts.onClick && !this._click) {
      this._click = function (e) {
        var t = e.target.closest && e.target.closest('.ms-hit');
        if (!t) return;
        var mi = +t.getAttribute('data-m'), mp = self.measPos[mi];
        var pt = self.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        var p = pt.matrixTransform(self.svg.getScreenCTM().inverse());
        var best = 0, bd = 1e9;
        mp.cols.forEach(function (c) { var d = Math.abs(c.x + 0.6 - p.x); if (d < bd) { bd = d; best = c.off; } });
        self.opts.onClick(mi, best);
      };
      this.el.addEventListener('click', this._click);
    }
  };

  function clefAt(S, mi) { var c = S.clef; for (var k = 0; k <= mi; k++) if (S.measures[k] && S.measures[k].clef) c = S.measures[k].clef; return c; }
  function glyph(Gl, x, y, s) { return '<path class="ms-ink" d="' + Gl.d + '" transform="translate(' + n3(x) + ' ' + n3(y) + ')' + (s ? ' scale(' + s + ')' : '') + '"/>'; }
  function thin(x, y0, y1) { return '<path class="ms-bl" d="M' + n3(x) + ' ' + n3(y0) + 'V' + n3(y1) + '" stroke-width="0.14"/>'; }
  function thick(x, y0, y1) { return '<path class="ms-bl" d="M' + n3(x) + ' ' + n3(y0) + 'V' + n3(y1) + '" stroke-width="0.5"/>'; }
  function dots(x, oy) { return '<path class="ms-ink" d="' + circ(x, oy + 1.5, 0.21) + circ(x, oy + 2.5, 0.21) + '"/>'; }
  function xAt(mp, off) {
    if (!mp) return 0;
    var cs = mp.cols, i;
    if (!cs.length) return mp.x0 + 1;
    if (off <= cs[0].off) return cs[0].x;
    for (i = 0; i < cs.length - 1; i++) if (off >= cs[i].off && off < cs[i + 1].off) return cs[i].x + (cs[i + 1].x - cs[i].x) * (off - cs[i].off) / (cs[i + 1].off - cs[i].off);
    var lc = cs[cs.length - 1];
    return lc.x + (mp.x1 - 1.2 - lc.x) * Math.min(1, (off - lc.off) / Math.max(1, mp.len - lc.off));
  }

  /* ---------- one bar: notes, rests, stems, beams, dots, accidentals, ledger lines, fingering, tuplets ---------- */
  function drawBar(self, bar, buf, ext, M, opts, tieQ, slurQ, li, bx0, bx1, stretch) {
    var letters = !!opts.letters;
    var beamsDone = [];
    bar.items.forEach(function (R) {
      var it = R.it, B = buf[R.si], x = bar.colX[bar.cols.indexOf(R.col)] + (R.dx || 0);
      R.x = x;
      if (it.kind === 'rest') {
        drawRest(R, B, ext, x, bar, bx0, bx1);
        return;
      }
      var up = R.stemDir < 0;
      // ledger lines
      var ys = R.ys, minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
      var lx0 = x - 0.36 - (R.side.indexOf(-1) >= 0 ? R.hw : 0), lx1 = x + R.hw + 0.36 + (R.side.indexOf(1) >= 0 ? R.hw : 0);
      if (R.shareHead) { /* drawn by the other voice */ }
      else {
        var ld = '';
        for (var ly = -1; ly >= minY; ly--) ld += 'M' + n3(lx0) + ' ' + n3(ly) + 'H' + n3(lx1);
        for (var ly2 = 5; ly2 <= maxY; ly2++) ld += 'M' + n3(lx0) + ' ' + n3(ly2) + 'H' + n3(lx1);
        if (ld) B.s.push('<path class="ms-led" d="' + ld + '"/>');
      }
      // heads
      it.notes.forEach(function (n, k) {
        var hx = x + (R.side[k] === 1 ? R.hw - 0.12 : R.side[k] === -1 ? -R.hw + 0.12 : 0), hy = ys[k];
        if (R.side[k] === 1 && R.head === 'whole') hx = x + R.hw;
        n._x = hx; n._y = hy; n._sys = li; n._si = R.si; n._w = R.hw; n._R = R;
        ext(R.si, hy - 0.5); ext(R.si, hy + 0.5);
        if (R.shareHead) { self.noteInfo[n.id] = { sys: li, x: hx, y: hy, si: R.si }; return; }
        var lt = '', hg = G[R.head];
        if (letters) {
          var nm = n.letter, ac = n.alter === 1 ? '♯' : n.alter === -1 ? '♭' : n.alter === 2 ? '×' : n.alter === -2 ? '♭♭' : '';
          if (R.head !== 'black') hg = G[R.head + 'L'];
          var fsz = R.head === 'whole' ? 1.0 : 0.98;
          lt = '<text class="ms-lt' + (R.head === 'black' ? ' on-black' : '') + '" x="' + n3(hx + R.hw / 2 + (ac ? -0.2 : 0)) + '" y="' + n3(hy + 0.35) + '" font-size="' + (ac ? fsz * 0.86 : fsz) + '" text-anchor="middle">' + nm +
            (ac ? '<tspan font-size="' + n3(fsz * 0.8) + '" dx="0.02" dy="-0.12">' + ac + '</tspan>' : '') + '</text>';
        }
        B.s.push('<g class="ms-n" data-id="' + n.id + '"><path class="ms-hd" d="' + hg.d + '" transform="translate(' + n3(hx) + ' ' + n3(hy) + ')' + (HS !== 1 ? ' scale(' + HS + ')' : '') + '"' + (R.head !== 'black' ? ' fill-rule="evenodd"' : '') + '/>' + lt + '</g>');
        self.noteInfo[n.id] = { sys: li, x: hx, y: hy, si: R.si };
      });
      // accidentals
      R.accs.forEach(function (A) {
        var ay = ys[A.j];
        B.s.push(glyph(G[A.g], x + A.x, ay));
        ext(R.si, ay - (A.g === 'b' || A.g === 'bb' ? 1.9 : 1.5)); ext(R.si, ay + 1.5);
      });
      // dots
      if (it.dots) {
        var dx = x + R.hw + (R.side.indexOf(1) >= 0 ? R.hw : 0) + 0.42 + (R.shareHead ? 0 : 0), used = {};
        var dd = '';
        for (var k3 = ys.length - 1; k3 >= 0; k3--) {
          var yy = ys[k3];
          var dy = (Math.round(yy * 2) % 2 === 0) ? (R.two && R.vi === 1 ? yy + 0.5 : yy - 0.5) : yy;
          while (used[dy]) dy += 1;
          used[dy] = 1;
          for (var dk = 0; dk < it.dots; dk++) dd += circ(dx + dk * 0.48, dy, 0.19);
        }
        B.s.push('<path class="ms-ink" d="' + dd + '"/>');
      }
      // stems (beamed stems wait for the beam)
      if (R.hasStem && !R.beam && !(R.shareHead && R.vi === 1 && false)) {
        var sx = up ? x + R.hw - 0.06 : x + 0.06;
        var yFar = up ? maxY : minY, yNear = up ? minY : maxY;
        var len = 3.5 + (R.flags === 2 ? 0.5 : R.flags === 3 ? 1.2 : 0);
        var yEnd = up ? Math.min(yNear - len, 2) : Math.max(yNear + len, 2);
        if (R.flags >= 2 && up) yEnd = Math.min(yEnd, yNear - len);
        if (up) yEnd = Math.min(yEnd, yNear - len); else yEnd = Math.max(yEnd, yNear + len);
        if (up && yNear - len > 2 && yNear > 5.5) yEnd = 2; // far below the staff: the stem reaches the middle line
        if (!up && yNear + len < 2 && yNear < -1.5) yEnd = 2;
        B.s.push('<path class="ms-stem" d="M' + n3(sx) + ' ' + n3(yFar + (up ? -0.1 : 0.1)) + 'V' + n3(yEnd) + '"/>');
        ext(R.si, yEnd);
        R.stemX = sx; R.stemEnd = yEnd;
        if (R.flags) {
          B.s.push('<path class="ms-ink" d="' + G.flags[up ? 'up' : 'down'][R.flags] + '" transform="translate(' + n3(sx - 0.06) + ' ' + n3(yEnd) + ')"/>');
          ext(R.si, yEnd + (up ? 3.1 : -3.1) * 0);
        }
      }
      // fingering
      if (opts.fingering !== false) {
        var fs = it.notes.filter(function (n) { return n.finger; });
        if (fs.length) R.fingers = fs;
      }
      // ties and slurs: queue
      it.notes.forEach(function (n) { if (n.tiedTo) tieQ.push(n); });
      if (it.slurStart || it.slurEnd) slurQ.push(R);
    });
    // beams
    bar.items.forEach(function (R) {
      if (!R.beam || beamsDone.indexOf(R.beam) >= 0) return;
      beamsDone.push(R.beam);
      drawBeam(R.beam, buf[R.si], function (y) { ext(R.si, y); });
    });
    // fingering (after stems are known)
    bar.items.forEach(function (R) {
      if (!R.fingers) return;
      var B = buf[R.si], above = R.it.staff === 'rh' ? true : false;
      if (!self.grand) above = R.it.staff === 'rh';
      if (R.two) above = R.vi === 0;
      var ys = R.ys, top = Math.min.apply(null, ys) - 0.6, bot = Math.max.apply(null, ys) + 0.6;
      if (R.stemDir < 0 && R.stemEnd !== undefined) top = Math.min(top, R.stemEnd - (R.beam ? 0.6 : 0.3));
      if (R.stemDir > 0 && R.stemEnd !== undefined) bot = Math.max(bot, R.stemEnd + (R.beam ? 0.6 : 0.3));
      var list = R.it.notes.filter(function (n) { return n.finger; });
      var cx = R.x + R.hw / 2;
      if (above) {
        var y0 = Math.min(top - 0.35, -0.4);
        if (top > 1) y0 = top - 0.35;
        // above the notes: the lowest note's finger nearest the note, the top note's finger on top
        list.forEach(function (n, k) { B.s.push('<text class="ms-fg" x="' + n3(cx) + '" y="' + n3(y0 - k * 1.05) + '" font-size="1.15" text-anchor="middle">' + n.finger + '</text>'); ext(R.si, y0 - k * 1.05 - 1.0); });
        R.fgTop = y0 - (list.length - 1) * 1.05 - 0.95;
      } else {
        var y1 = bot + 1.15;
        // below the notes: the top note's finger nearest the note, the lowest note's finger at the bottom
        list.slice().reverse().forEach(function (n, k) { B.s.push('<text class="ms-fg" x="' + n3(cx) + '" y="' + n3(y1 + k * 1.05) + '" font-size="1.15" text-anchor="middle">' + n.finger + '</text>'); ext(R.si, y1 + k * 1.05 + 0.2); });
        R.fgBot = y1 + (list.length - 1) * 1.05 + 0.2;
      }
    });
    // tuplets
    var tups = {}, run = self.tupRun, hadTup = {};
    bar.items.forEach(function (R) { if (R.it.tuplet) (tups[R.si + ':' + R.it.tuplet.id] = tups[R.si + ':' + R.it.tuplet.id] || []).push(R); });
    Object.keys(tups).forEach(function (k) {
      var g = tups[k], B = buf[g[0].si], n = g[0].it.tuplet.n;
      var beamed = g.every(function (R) { return R.beam && R.beam === g[0].beam; });
      var notes = g.filter(function (R) { return R.it.kind !== 'rest'; });
      var up = notes.length ? notes[0].stemDir < 0 : true;
      var x0 = g[0].x, x1 = g[g.length - 1].x + g[g.length - 1].hw, xm = (x0 + x1) / 2;
      if (beamed) hadTup[g[0].si] = true;
      if (beamed && (run[g[0].si] || 0) >= 2) return; // the pattern is clear by now: no more 3s
      if (beamed) {
        var bm = g[0].beam, y = bm.yAt((x0 + x1) / 2) + (up ? -0.75 : 1.85);
        g.forEach(function (R) { // keep clear of fingering on the same side
          if (up && R.fgTop !== undefined) y = Math.min(y, R.fgTop - 0.6);
          if (!up && R.fgBot !== undefined) y = Math.max(y, R.fgBot + 1.6);
        });
        B.s.push('<text class="ms-tup" x="' + n3(xm) + '" y="' + n3(y) + '" font-size="1.35" text-anchor="middle">' + n + '</text>');
        ext(g[0].si, up ? y - 1.1 : y + 0.2);
      } else {
        var ends = notes.map(function (R) { return R.stemEnd !== undefined ? R.stemEnd : (up ? Math.min.apply(null, R.ys) : Math.max.apply(null, R.ys)); });
        var yb = up ? Math.min.apply(null, ends.concat([-0.5])) - 1.2 : Math.max.apply(null, ends.concat([4.5])) + 1.2;
        var hk = up ? 0.6 : -0.6;
        B.s.push('<path class="ms-bl" fill="none" stroke-width="0.11" d="M' + n3(x0) + ' ' + n3(yb + hk) + 'V' + n3(yb) + 'H' + n3(xm - 0.75) + 'M' + n3(xm + 0.75) + ' ' + n3(yb) + 'H' + n3(x1) + 'V' + n3(yb + hk) + '"/>');
        B.s.push('<text class="ms-tup" x="' + n3(xm) + '" y="' + n3(yb + 0.45) + '" font-size="1.35" text-anchor="middle">' + n + '</text>');
        ext(g[0].si, yb - 1); ext(g[0].si, yb + 1);
      }
    });
    self.staves.forEach(function (S, si) { run[si] = hadTup[si] ? (run[si] || 0) + 1 : 0; });
  }

  function drawRest(R, B, ext, x, bar, bx0, bx1) {
    var it = R.it, g, yo = 2;
    if (it.measureRest) {
      var xm = (bx0 + bx1) / 2 - 0.62;
      B.s.push(glyph(G.r1, xm, 2));
      R.x = xm;
      return;
    }
    g = { 1: G.r1, 2: G.r2, 4: G.r4, 8: G.r8, 16: G.r16, 32: G.r32 }[it.base];
    if (R.two) {
      yo = R.vi === 0 ? (it.base <= 2 ? 1 : 0.5) : (it.base <= 2 ? 3 : 3.5);
      if (it.base === 1 && R.vi === 1) yo = 3;
      // how far the rest reaches above and below its own line (staff spaces)
      var EXT = { 1: [1, -0.48], 2: [0.52, 0], 4: [1.6, 1.6], 8: [0.85, 1.05], 16: [1.25, 1.6], 32: [1.75, 2.15] }[it.base];
      // the other voice's notes sounding during this rest
      var s0 = it.start, s1 = it.start + it.dur, ys = [];
      bar.items.forEach(function (O) {
        if (O.si !== R.si || O.vi === R.vi || O.it.kind === 'rest') return;
        if (O.it.start < s1 && O.it.start + O.it.dur > s0) {
          ys = ys.concat(O.ys);
          (O.accs || []).forEach(function (A) { ys.push(O.ys[A.j] - (A.g === 'b' || A.g === 'bb' ? 1.8 : 1.3), O.ys[A.j] + 1.3); }); // their accidentals too
        }
      });
      if (ys.length) {
        if (R.vi === 0) yo = Math.min(yo, Math.floor(Math.min.apply(null, ys) - 0.75 - EXT[1]));
        else yo = Math.max(yo, Math.ceil(Math.max.apply(null, ys) + 0.75 + EXT[0]));
      }
    }
    var s = glyph(g, x, yo);
    // a whole or half rest outside the staff gets a short ledger line
    if (it.base <= 2 && (yo - (it.base === 1 ? 1 : 0) < 0 || yo > 4)) s += '<path class="ms-led" d="M' + n3(x - 0.3) + ' ' + n3(it.base === 1 ? yo - 1 : yo) + 'H' + n3(x + 1.55) + '"/>';
    if (it.dots) {
      var dd = '';
      for (var k = 0; k < it.dots; k++) dd += circ(x + g.w + 0.4 + k * 0.48, yo - 0.5, 0.19);
      s += '<path class="ms-ink" d="' + dd + '"/>';
    }
    B.s.push(s);
    ext(R.si, yo - 1.6); ext(R.si, yo + 1.6);
  }

  function drawBeam(Bm, B, ext) {
    var items = Bm.items, up = Bm.dir < 0;
    var xs = items.map(function (R) { return up ? R.x + R.hw - 0.06 : R.x + 0.06; });
    var near = items.map(function (R) { return up ? Math.min.apply(null, R.ys) : Math.max.apply(null, R.ys); });
    var far = items.map(function (R) { return up ? Math.max.apply(null, R.ys) : Math.min.apply(null, R.ys); });
    var nb = Math.max.apply(null, items.map(function (R) { return R.flags; }));
    var xA = xs[0], xB = xs[xs.length - 1], n = items.length;
    var d = near[n - 1] - near[0];
    var slope = 0;
    var inner = near.slice(1, -1);
    var concave = up ? inner.some(function (y) { return y < Math.min(near[0], near[n - 1]); }) : inner.some(function (y) { return y > Math.max(near[0], near[n - 1]); });
    if (!concave && d !== 0) {
      var dd = Math.sign(d) * Math.min(Math.abs(d) * 0.5, 1.0, Math.max(0.25, (xB - xA) * 0.12));
      slope = dd / Math.max(1, xB - xA);
    }
    var L = 3.25 + 0.75 * (nb - 1);
    var c;
    if (up) {
      c = Infinity;
      items.forEach(function (R, k) { c = Math.min(c, near[k] - L - slope * (xs[k] - xA)); });
      if (Math.min.apply(null, near) > 5.5) c = Math.min(c, 2 - slope * ((xB - xA) / 2));
    } else {
      c = -Infinity;
      items.forEach(function (R, k) { c = Math.max(c, near[k] + L - slope * (xs[k] - xA)); });
      if (Math.max.apply(null, near) < -1.5) c = Math.max(c, 2 - slope * ((xB - xA) / 2));
    }
    var yAt = function (x) { return c + slope * (x - xA); };
    Bm.yAt = yAt;
    var th = 0.5, gap = 0.75 * (up ? 1 : -1), s = '';
    // stems
    items.forEach(function (R, k) {
      var ye = yAt(xs[k]);
      B.s.push('<path class="ms-stem" d="M' + n3(xs[k]) + ' ' + n3(far[k] + (up ? -0.1 : 0.1)) + 'V' + n3(ye) + '"/>');
      R.stemX = xs[k]; R.stemEnd = ye;
    });
    // primary beam
    function seg(xa, xb, level) {
      var o = level * gap;
      var ya = yAt(xa) + o, yb = yAt(xb) + o;
      var t = up ? th : -th;
      return poly([[xa - 0.06, ya], [xb + 0.06, yb], [xb + 0.06, yb + t], [xa - 0.06, ya + t]]);
    }
    s += seg(xA, xB, 0);
    for (var lev = 2; lev <= nb; lev++) {
      for (var k = 0; k < n; k++) {
        if (items[k].flags < lev) continue;
        var prevHas = k > 0 && items[k - 1].flags >= lev, nextHas = k < n - 1 && items[k + 1].flags >= lev;
        if (nextHas) { s += seg(xs[k], xs[k + 1], lev - 1); }
        else if (!prevHas) { // a partial beam
          var toRight = k === 0 || (k < n - 1 && items[k].it.dots === 0 && items[k - 1] && items[k - 1].it.dots > 0 ? false : k === 0);
          var xb2 = toRight ? xs[k] + 1.1 : xs[k] - 1.1;
          s += toRight ? seg(xs[k], xb2, lev - 1) : seg(xb2, xs[k], lev - 1);
        }
      }
    }
    B.s.push('<path class="ms-ink" d="' + s + '"/>');
    items.forEach(function (R, k) { ext(yAt(xs[k]) + (up ? -0.3 : 0.3)); ext(yAt(xs[k]) + (nb - 1) * gap + (up ? 0.6 : -0.6)); });
  }

  // ties and slurs, drawn into the systems' staff buffers (staff-local coordinates)
  function drawTies(self, tieQ, slurQ) {
    var notes = self.model.notes;
    function sysOf(li) { return self.sysInfo[li]; }
    tieQ.forEach(function (n) {
      var m = notes[n.tiedTo];
      if (!m || n._x === undefined || m._x === undefined) return;
      var R = n._R, it = n.item, dir;
      if (R.two) dir = R.vi === 0 ? -1 : 1;
      else if (it.notes.length > 1) {
        var k = it.notes.indexOf(n), half = (it.notes.length - 1) / 2;
        dir = k > half ? -1 : k < half ? 1 : (R.stemDir < 0 ? 1 : -1);
      } else dir = R.stemDir < 0 ? 1 : -1;
      var yo = dir * 0.42;
      var x1 = n._x + n._w + (it.dots ? 0.5 + 0.48 * it.dots : 0.12), x2 = m._x - 0.12;
      var B1 = sysOf(n._sys).buf[n._si];
      if (n._sys === m._sys) {
        B1.s.push('<path class="ms-ink" d="' + tieShape(x1, n._y + yo, x2, m._y + yo, dir) + '"/>');
      } else {
        var S1 = sysOf(n._sys), S2 = sysOf(m._sys);
        B1.s.push('<path class="ms-ink" d="' + tieShape(x1, n._y + yo, S1.x1 + 0.3, n._y + yo, dir) + '"/>');
        var mp = self.measPos[S2.bars[0].mi];
        S2.buf[m._si].s.push('<path class="ms-ink" d="' + tieShape(Math.max(mp.x0 - 1.4, x2 - 2.6), m._y + yo, x2, m._y + yo, dir) + '"/>');
      }
    });
    // slurs: pair starts and ends per staff and voice
    var open = {};
    slurQ.forEach(function (R) {
      var key = R.si + ':' + R.vi;
      if (R.it.slurStart && !(R.it.slurEnd && open[key])) { (open[key] = open[key] || []).push(R); if (!R.it.slurEnd) return; else return; }
      if (R.it.slurEnd && open[key] && open[key].length) {
        var A = open[key].pop();
        drawSlur(self, A, R);
      }
    });
  }
  function drawSlur(self, A, Z) {
    // all items between A and Z on that staff and voice
    var span = [], inSpan = false;
    self.bars.forEach(function (bar) { bar.items.forEach(function (R) {
      if (R.si !== A.si || R.vi !== A.vi) return;
      if (R === A) inSpan = true;
      if (inSpan) span.push(R);
      if (R === Z) inSpan = false;
    }); });
    span.sort(function (a, b) { return (a.it.m - b.it.m) || (a.it.start - b.it.start); });
    var notesOnly = span.filter(function (R) { return R.it.kind !== 'rest'; });
    var allUp = notesOnly.every(function (R) { return R.stemDir < 0 || !R.hasStem; });
    var allDown = notesOnly.every(function (R) { return R.stemDir > 0; });
    var dir = A.two ? (A.vi === 0 ? -1 : 1) : (allUp && !allDown ? 1 : -1);
    function endPt(R) {
      var x = R.x + R.hw / 2, ys = R.ys.length ? R.ys : [2];
      if (dir < 0) {
        var yt = Math.min.apply(null, ys) - 0.75;
        if (R.stemDir < 0 && R.stemEnd !== undefined && R !== A && R !== Z) yt = Math.min(yt, R.stemEnd - 0.5);
        if (R.stemDir < 0 && R.stemEnd !== undefined && (R === A || R === Z)) { x = R.stemX; yt = R.stemEnd - 0.5; }
        if (R.fgTop !== undefined) yt = Math.min(yt, R.fgTop - 0.35);
        return [x, yt];
      }
      var yb = Math.max.apply(null, ys) + 0.75;
      if (R.stemDir > 0 && R.stemEnd !== undefined && (R === A || R === Z)) { x = R.stemX; yb = R.stemEnd + 0.5; }
      if (R.fgBot !== undefined) yb = Math.max(yb, R.fgBot + 0.35);
      return [x, yb];
    }
    var sysA = A.it.notes[0] ? A.it.notes[0]._sys : null, sysZ = Z.it.notes[0] ? Z.it.notes[0]._sys : null;
    if (sysA == null || sysZ == null) return;
    var segs = [];
    if (sysA === sysZ) segs.push({ sys: sysA, a: endPt(A), z: endPt(Z), items: span });
    else {
      var S1 = self.sysInfo[sysA], S2 = self.sysInfo[sysZ];
      var a = endPt(A), z = endPt(Z);
      segs.push({ sys: sysA, a: a, z: [S1.x1 + 0.2, a[1]], items: span.filter(function (R) { return R.it.notes[0] && R.it.notes[0]._sys === sysA; }) });
      var mp = self.measPos[S2.bars[0].mi];
      segs.push({ sys: sysZ, a: [mp.x0 - 1.0, z[1]], z: z, items: span.filter(function (R) { return R.it.notes[0] && R.it.notes[0]._sys === sysZ; }) });
    }
    segs.forEach(function (sg) {
      var x1 = sg.a[0], y1 = sg.a[1], x2 = sg.z[0], y2 = sg.z[1], L = Math.max(1, x2 - x1);
      var h = Math.min(2.2, 0.7 + 0.08 * L);
      sg.items.forEach(function (R) {
        if (R === A || R === Z || !R.ys.length) return;
        var u = (R.x + R.hw / 2 - x1) / L;
        if (u <= 0.02 || u >= 0.98) return;
        var line = y1 + (y2 - y1) * u, need;
        if (dir < 0) {
          var top = Math.min.apply(null, R.ys) - 0.6;
          if (R.stemDir < 0 && R.stemEnd !== undefined) top = Math.min(top, R.stemEnd - 0.3);
          if (R.fgTop !== undefined) top = Math.min(top, R.fgTop - 0.2);
          need = (line - top) / (0.75 * 4 * u * (1 - u));
        } else {
          var bot = Math.max.apply(null, R.ys) + 0.6;
          if (R.stemDir > 0 && R.stemEnd !== undefined) bot = Math.max(bot, R.stemEnd + 0.3);
          if (R.fgBot !== undefined) bot = Math.max(bot, R.fgBot + 0.2);
          need = (bot - line) / (0.75 * 4 * u * (1 - u));
        }
        if (need > h) h = Math.min(need, 5);
      });
      var B = self.sysInfo[sg.sys].buf[A.si];
      B.s.push('<path class="ms-ink" d="' + slurShape(x1, y1, x2, y2, dir, h) + '"/>');
      var peak = (dir < 0 ? Math.min(y1, y2) - 0.75 * h : Math.max(y1, y2) + 0.75 * h);
      if (peak < B.top) B.top = peak;
      if (peak > B.bot) B.bot = peak;
    });
  }

  /* ---------- runtime API ---------- */
  Score.prototype.highlight = function (ids, hand) {
    var self = this;
    (ids || []).forEach(function (id) {
      var els = self.noteEls[id];
      if (self.lit[id]) (els || []).forEach(function (e) { e.classList.remove('hl-' + self.lit[id]); });
      self.lit[id] = hand || 'rh';
      (els || []).forEach(function (e) { e.classList.add('hl', 'hl-' + (hand || 'rh')); });
    });
  };
  Score.prototype.unhighlight = function (ids) {
    var self = this;
    (ids || []).forEach(function (id) {
      var h = self.lit[id];
      if (!h) return;
      (self.noteEls[id] || []).forEach(function (e) { e.classList.remove('hl', 'hl-' + h); });
      delete self.lit[id];
    });
  };
  Score.prototype.clear = function () { this.unhighlight(Object.keys(this.lit)); };
  Score.prototype.cursor = function (mi, tick) {
    if (mi == null) { this.cur = null; if (this.cursorEl) this.cursorEl.setAttribute('visibility', 'hidden'); return; }
    this.cur = [mi, tick || 0];
    var mp = this.measPos[mi];
    if (!mp || !this.cursorEl) return;
    var sys = this.sysInfo[mp.sys], x = xAt(mp, tick || 0);
    var y0 = sys.cy0 != null ? sys.cy0 : sys.y[0] - 1.6, y1 = sys.cy1 != null ? sys.cy1 : sys.y[sys.y.length - 1] + 5.6;
    var w = HW * this.hs + 0.7;
    this.cursorEl.setAttribute('x', n3(x + HW * this.hs / 2 - w / 2));
    this.cursorEl.setAttribute('y', n3(y0));
    this.cursorEl.setAttribute('width', n3(w));
    this.cursorEl.setAttribute('height', n3(y1 - y0));
    this.cursorEl.setAttribute('visibility', 'visible');
  };
  Score.prototype.measureBox = function (mi) {
    var mp = this.measPos[mi];
    if (!mp) return null;
    var sys = this.sysInfo[mp.sys], sp = this.sp;
    return { system: mp.sys, x: mp.x0 * sp, w: (mp.x1 - mp.x0) * sp, y: sys.top * sp, h: sys.h * sp };
  };
  Score.prototype.scrollTo = function (mi, smooth) {
    var b = this.measureBox(mi), el = this.el;
    if (!b) return;
    var top = b.y - 8, bottom = b.y + b.h + 8;
    if (el.scrollHeight > el.clientHeight + 4) {
      if (top < el.scrollTop || bottom > el.scrollTop + el.clientHeight) {
        var target = Math.max(0, top - Math.max(0, (el.clientHeight - b.h) * 0.2));
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (el.scrollTo) el.scrollTo({ top: target, behavior: smooth && !reduce ? 'smooth' : 'auto' }); else el.scrollTop = target;
      }
    }
  };
  Score.prototype.setLetters = function (on) { this.opts.letters = !!on; this.prep(); this.render(); };
  Score.prototype.setOptions = function (o) { Object.assign(this.opts, o || {}); this.prep(); this.render(); };
  Score.prototype.relayout = function () { this.render(); };
  Score.prototype.destroy = function () { if (this.ro) this.ro.disconnect(); if (this._click) this.el.removeEventListener('click', this._click); this.el.innerHTML = ''; };
  Object.defineProperty(Score.prototype, 'systems', { get: function () { return this.sysInfo ? this.sysInfo.length : 0; } });

  TRB.staff = {
    render: function (el, src, opts) { return new Score(el, src, opts); },
    Score: Score,
    glyphs: G,
    brace: brace,
    stepY: stepY,
    xAt: xAt
  };
})();
