/* The cartouche maker (/languages/hieroglyphs/cartouche/): an English name spelled with Egyptian sound signs, letter by letter,
   with the alternatives for each sound; drawn in a cartouche across or down (signs facing left or right), with an optional title
   and last sign; printable and downloadable as PNG (canvas) or SVG (with the font embedded). Then the model's royal NAMES to read,
   with a small quiz. Settings in localStorage 'trb-hiero-v1' (prefs.cart). Needs hiero.js. */
(function (W, D) {
  'use strict';
  var T = W.TRBHiero; if (!T) return;
  T.ready(function (E) {
    var $ = T.$, $$ = T.$$, esc = T.esc, S = E.SIGNS;
    var st = T.load(); st.prefs = st.prefs || {}; var P = st.prefs.cart = st.prefs.cart || {};
    if (!P.lay) P.lay = 'h'; if (!P.dir) P.dir = 'l'; if (P.grp == null) P.grp = '1'; if (P.title == null) P.title = ''; if (P.det == null) P.det = '';
    function save() { T.save(st); }

    /* ---------- spelling: letters -> segments -> choices ---------- */
    var NONE = { s: [], why: 'leave it out: Egyptian rarely wrote vowels' };
    function o(s, why) { return { s: [].concat(s), why: why }; }
    var R = {
      a: [o('G1', 'the vulture ꜣ, the usual a in Greek and Roman names (Cleopatra)'), o('D36', 'the arm ꜥ, a throaty a-like sound'), NONE],
      e: [o('M17', 'the reed j, used for e and i in foreign names (Cleopatra)'), o('D36', 'the arm ꜥ, another vowel-like sound'), NONE],
      i: [o('M17', 'the reed j, an i or y sound'), o('M17A', 'two reeds y, for a long ee'), NONE],
      o: [o('V4', 'the lasso wꜣ, used for o in Ptolemy and Cleopatra'), o('G43', 'the quail chick w, an o or u sound'), NONE],
      u: [o('G43', 'the quail chick w, used for u and o'), o('Z7', 'the coil w, a shorter form of the quail chick'), NONE],
      ee: [o('M17A', 'two reeds y, for ee'), o('M17', 'one reed j')], ea: [o('M17A', 'two reeds y, for ee'), o('M17', 'one reed j')],
      oo: [o('G43', 'the quail chick w, for oo'), o('V4', 'the lasso wꜣ')],
      b: [o('D58', 'the foot and leg b')], p: [o('Q3', 'the reed stool p')], f: [o('I9', 'the horned viper f')],
      v: [o('I9', 'the viper f: Egyptian had no v, and f is the nearest'), o('D58', 'the foot b')],
      m: [o('G17', 'the owl m'), o('Aa15', 'a second m sign, used in Ptolemy’s cartouche')],
      n: [o('N35', 'the ripple of water n')], r: [o('D21', 'the mouth r')],
      l: [o('E23', 'the lion, used for l in Ptolemy and Cleopatra'), o('D21', 'the mouth r: older Egyptian wrote l with r or n'), o('N35', 'the ripple of water n')],
      h: [o('O4', 'the reed shelter h, as in house'), o('V28', 'the twisted wick ḥ, a stronger h')],
      k: [o('V31', 'the basket k'), o('N29', 'the hill slope q, a k made farther back')],
      ck: [o('V31', 'the basket k'), o('N29', 'the hill slope q')],
      ch: [o('V13', 'the tethering rope ṯ, tch as in church'), o('Aa1', 'the round sign ḫ, ch as in loch'), o('V31', 'the basket k, ch as in Chris')],
      q: [o('N29', 'the hill slope q'), o('V31', 'the basket k')],
      qu: [o(['N29', 'G43'], 'the hill slope q and the quail chick w'), o(['V31', 'G43'], 'the basket k and the quail chick w')],
      j: [o('I10', 'the cobra ḏ, the nearest to j as in judge'), o('M17A', 'two reeds y, if the j sounds like y')],
      s: [o('S29', 'the folded cloth s'), o('O34', 'the door bolt z, said s by this time')],
      z: [o('O34', 'the door bolt z'), o('S29', 'the folded cloth s')],
      t: [o('X1', 'the loaf of bread t'), o('D46', 'the hand d: Cleopatra’s cartouche writes its t this way')],
      d: [o('D46', 'the hand d'), o('X1', 'the loaf of bread t')],
      w: [o('G43', 'the quail chick w'), o('Z7', 'the coil w')],
      x: [o(['V31', 'S29'], 'k and s, the two sounds of x')],
      sh: [o('N37', 'the pool š, sh')],
      kh: [o('Aa1', 'the round sign ḫ, kh as in loch'), o('F32', 'the animal’s belly ẖ, a softer kh')],
      th: [o('X1', 'the loaf t: Egyptian had no th sound'), o(['X1', 'O4'], 't and h')],
      ph: [o('I9', 'the viper f, for ph as in Philip'), o(['Q3', 'O4'], 'p and h')]
    };
    R.c = [o('V31', 'the basket k, for a hard c'), o('N29', 'the hill slope q')]; R.g = [o('W11', 'the jar stand g')]; R.y = [o('M17A', 'two reeds y'), o('M17', 'the reed j')];
    var VOW = /[aeiou]/;
    function clean(s) { s = String(s || ''); if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); s = s.toLowerCase().replace(/[-_.]/g, ' ').replace(/ß/g, 'ss').replace(/æ/g, 'ae').replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').replace(/^ /, '');
      var out = '', n = 0; for (var i = 0; i < s.length && n < 16; i++) { out += s[i]; if (s[i] !== ' ') n++; } return out.replace(/ $/, ''); }
    function segment(name) {
      var s = clean(name), out = [], i = 0;
      while (i < s.length) {
        var c = s[i], two = s.slice(i, i + 2), nx = s[i + 2], seg, start = i === 0 || s[i - 1] === ' ', end = i === s.length - 1 || s[i + 1] === ' ';
        var wlen = s.slice(s.lastIndexOf(' ', i) + 1).split(' ')[0].length;
        if (c === ' ') { out.push({ L: ' ', space: true, opts: [{ s: [], why: '' }], vowel: false }); i++; continue; }
        if (two === 'ch' && /[rl]/.test(nx || '')) { out.push({ L: two, opts: [R.ch[2], R.ch[1], R.ch[0]], vowel: false }); i += 2; continue; }
        if (['sh', 'ch', 'kh', 'th', 'ph', 'ck', 'qu', 'ee', 'ea', 'oo'].indexOf(two) >= 0 && R[two]) seg = { L: two, opts: R[two] };
        else if (s[i + 1] === c && !VOW.test(c)) { seg = { L: two, opts: R[c].map(function (x) { return { s: x.s, why: x.why + ' (one sign for the double letter)' }; }) }; }
        else if (c === 'c') { var soft = /[eiy]/.test(s[i + 1] || ''); seg = { L: c, opts: soft ? [o('S29', 'the folded cloth s, for a soft c'), o('O34', 'the door bolt z'), o('V31', 'the basket k')] : [o('V31', 'the basket k, for a hard c'), o('N29', 'the hill slope q'), o('S29', 'the folded cloth s')] }; }
        else if (c === 'g') { var sg = /[ey]/.test(s[i + 1] || ''); seg = { L: c, opts: sg ? [o('I10', 'the cobra ḏ, a soft g as in gem'), o('W11', 'the jar stand g, a hard g')] : [o('W11', 'the jar stand g'), o('I10', 'the cobra ḏ, for a soft g as in gem')] }; }
        else if (c === 'y') { var cons = start || VOW.test(s[i + 1] || ''); seg = { L: c, opts: cons ? [o('M17A', 'two reeds y'), o('M17', 'the reed j, also a y sound')] : [o('M17A', 'two reeds y, for the ee sound'), o('M17', 'the reed j'), o('Z4', 'two strokes y')] }; }
        else if (c === 'e' && end && wlen > 3 && !VOW.test(s[i - 1])) seg = { L: c, opts: [{ s: [], why: 'a silent e: nothing to write' }, o('M17', 'the reed j, if you say the e')] };
        else seg = { L: c, opts: R[c] || [] };
        seg.start = start; seg.end = i + seg.L.length >= s.length || s[i + seg.L.length] === ' '; seg.vowel = VOW.test(seg.L[0]) || (seg.L === 'y' && seg.opts[0].why.indexOf('ee') >= 0);
        out.push(seg); i += seg.L.length; void nx;
      }
      return out;
    }

    /* ---------- state ---------- */
    var nameIn = $('#hc-name'), segs = [], pick = [];
    if (P.name) nameIn.value = P.name;
    function setName(keep) {
      var old = segs, oldPick = pick; segs = segment(nameIn.value);
      pick = segs.map(function (sg, i) { return keep && old[i] && old[i].L === sg.L && oldPick[i] < sg.opts.length ? oldPick[i] : 0; });
      if (!keep && P.picks && P.name === nameIn.value && P.picks.length === segs.length) pick = P.picks.map(function (v, i) { return v < segs[i].opts.length ? v : 0; });
    }
    function codes() { var out = []; segs.forEach(function (sg, i) { out = out.concat(sg.opts[pick[i]] ? sg.opts[pick[i]].s : []); }); return out; }
    function wordCodes() { var ws = [[]]; segs.forEach(function (sg, i) { if (sg.space) { ws.push([]); return; } ws[ws.length - 1] = ws[ws.length - 1].concat(sg.opts[pick[i]] ? sg.opts[pick[i]].s : []); }); return ws.filter(function (w) { return w.length; }); }
    function spOf(cs) {
      var sp = wordCodes().map(function (w) { return T.group(w, P.grp === '1'); }).join(' ');
      if (P.det && cs.length) sp += (sp ? '-' : '') + P.det;
      return sp;
    }

    /* ---------- the drawing: a scene of rings and signs, rendered to SVG (screen, SVG file, print) or canvas (PNG) ---------- */
    function scene(sp, o) {
      o = o || {}; var U = o.U || 64, vert = o.vert, rtl = o.rtl, dir = vert ? (rtl ? 'colr' : 'col') : (rtl ? 'rtl' : 'ltr');
      var L = sp ? E.layout(sp, { dir: dir, gap: 0.08 }) : { w: 1.2, h: 0.84, signs: [] };
      if (!sp && vert) L = { w: 1.15, h: 1.6, signs: [] };
      var padX = vert ? 0.22 : 0.42, padY = vert ? 0.42 : 0.2, w = (L.w + 2 * padX) * U, h = (L.h + 2 * padY) * U, m = 0.2 * U, sw = Math.max(2.2, Math.min(w, h) * 0.045), bar = sw * 3.2;
      var Lt = o.title ? E.layout(o.title, { dir: dir, gap: 0.08 }) : null, gapT = 0.3 * U, out = { rings: [], signs: [] };
      var tw = Lt ? Lt.w * U : 0, th = Lt ? Lt.h * U : 0, Wd, Ht, rx, ry;
      if (!vert) {
        Ht = Math.max(h, th) + 2 * m + sw * 1.4; ry = (Ht - h) / 2;
        Wd = m + (Lt ? tw + gapT : 0) + w + bar + m;
        rx = rtl ? m + bar : m + (Lt ? tw + gapT : 0);
        if (Lt) out.signs = out.signs.concat(T.items(Lt, U, rtl ? rx + w + gapT : m, (Ht - th) / 2));
      } else {
        Wd = Math.max(w, tw) + 2 * m + sw * 1.4; rx = (Wd - w) / 2;
        Ht = m + (Lt ? th + gapT : 0) + h + bar + m; ry = m + (Lt ? th + gapT : 0);
        if (Lt) out.signs = out.signs.concat(T.items(Lt, U, (Wd - tw) / 2, m));
      }
      out.rings.push({ x: rx, y: ry, w: w, h: h, r: vert ? w / 2 : h / 2, sw: sw, vert: vert, end: vert ? 'bottom' : rtl ? 'left' : 'right' });
      out.signs = out.signs.concat(T.items(L, U, rx + padX * U, ry + padY * U));
      out.W = Wd; out.H = Ht; out.empty = !L.signs.length; return out;
    }
    function ringSVG(r, col) {
      var a = 'fill="none" stroke="' + (col || 'currentColor') + '"', i = r.sw * 1.4, s = '';
      s += '<rect x="' + f(r.x) + '" y="' + f(r.y) + '" width="' + f(r.w) + '" height="' + f(r.h) + '" rx="' + f(r.r) + '" ' + a + ' stroke-width="' + f(r.sw) + '"/>';
      s += '<rect x="' + f(r.x + i) + '" y="' + f(r.y + i) + '" width="' + f(r.w - 2 * i) + '" height="' + f(r.h - 2 * i) + '" rx="' + f(Math.max(0, r.r - i)) + '" ' + a + ' stroke-width="' + f(r.sw * 0.4) + '"/>';
      var b = barRect(r); s += '<rect x="' + f(b[0]) + '" y="' + f(b[1]) + '" width="' + f(b[2]) + '" height="' + f(b[3]) + '" rx="' + f(r.sw * 0.6) + '" fill="' + (col || 'currentColor') + '"/>';
      return s;
    }
    function barRect(r) { var sw = r.sw; return r.vert ? [r.x - sw * 0.6, r.y + r.h + sw * 0.6, r.w + sw * 1.2, sw * 2.4] : r.end === 'left' ? [r.x - sw * 3, r.y - sw * 0.6, sw * 2.4, r.h + sw * 1.2] : [r.x + r.w + sw * 0.6, r.y - sw * 0.6, sw * 2.4, r.h + sw * 1.2]; }
    function f(n) { return (+n).toFixed(2); }
    function sceneSVG(sc, o) {
      o = o || {}; var H = sc.H + (o.caption ? 92 : 0), Wd = Math.max(sc.W, o.caption ? 360 : 0), dx = (Wd - sc.W) / 2;
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + f(Wd) + ' ' + f(H) + '" width="' + f(Wd) + '" height="' + f(H) + '"' + (o.cls ? ' class="' + o.cls + '"' : '') + ' role="img" aria-label="' + esc(o.label || 'Cartouche') + '">';
      if (o.font) s += '<defs><style>@font-face{font-family:"TRB Hieroglyphs";src:url(data:font/woff;base64,' + o.font + ') format("woff")}</style></defs>';
      if (o.bg) s += '<rect width="100%" height="100%" fill="' + o.bg + '"/>';
      s += '<g transform="translate(' + f(dx) + ',0)"' + (o.ink ? ' fill="' + o.ink + '" color="' + o.ink + '"' : '') + '>';
      sc.rings.forEach(function (r) { s += ringSVG(r, o.ink); });
      sc.signs.forEach(function (it) { s += T.signText(it, 'hg-sign').replace('<text ', '<text font-family="TRB Hieroglyphs, Noto Sans Egyptian Hieroglyphs, sans-serif"' + (o.ink ? ' fill="' + o.ink + '"' : '') + ' '); });
      s += '</g>';
      if (o.caption) s += '<text x="' + f(Wd / 2) + '" y="' + f(sc.H + 44) + '" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="30" fill="' + (o.ink || 'currentColor') + '" letter-spacing="3">' + esc(o.caption) + '</text><text x="' + f(Wd / 2) + '" y="' + f(sc.H + 74) + '" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" fill="' + (o.muted || 'currentColor') + '">' + esc(o.sub || '') + '</text>';
      return s + '</svg>';
    }
    function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    function scenePNG(sc, o, cb) {
      var cap = o.caption ? 120 : 0, Wd = Math.max(sc.W, o.caption ? 520 : 0), H = sc.H + cap, k = 1, dx = (Wd - sc.W) / 2;
      var cv = D.createElement('canvas'); cv.width = Math.round(Wd * k); cv.height = Math.round(H * k); var c = cv.getContext('2d');
      c.fillStyle = o.bg; c.fillRect(0, 0, cv.width, cv.height);
      c.save(); c.translate(dx, 0); c.strokeStyle = o.ink; c.fillStyle = o.ink;
      sc.rings.forEach(function (r) {
        var i = r.sw * 1.4; c.lineWidth = r.sw; rr(c, r.x, r.y, r.w, r.h, r.r); c.stroke();
        c.lineWidth = r.sw * 0.4; rr(c, r.x + i, r.y + i, r.w - 2 * i, r.h - 2 * i, Math.max(0, r.r - i)); c.stroke();
        var b = barRect(r); rr(c, b[0], b[1], b[2], b[3], r.sw * 0.6); c.fill();
      });
      c.textBaseline = 'alphabetic'; c.textAlign = 'left';
      sc.signs.forEach(function (it) {
        c.font = it.fs.toFixed(2) + 'px "TRB Hieroglyphs", "Noto Sans Egyptian Hieroglyphs", sans-serif';
        if (it.flip) { c.save(); c.translate(2 * it.bx + it.bw, 0); c.scale(-1, 1); c.fillText(it.u, it.x, it.y); c.restore(); } else c.fillText(it.u, it.x, it.y);
      });
      c.restore();
      if (o.caption) {
        c.textAlign = 'center'; c.fillStyle = o.ink; c.font = '700 44px Georgia, serif'; c.fillText(o.caption.split('').join(String.fromCharCode(8202)), Wd / 2, sc.H + 58);
        c.fillStyle = o.muted; c.font = '22px system-ui, -apple-system, "Segoe UI", sans-serif'; c.fillText(o.sub || '', Wd / 2, sc.H + 98);
      }
      cv.toBlob(function (b) { cb(b); }, 'image/png');
    }

    /* ---------- render the maker ---------- */
    var stage = $('#hc-stage'), cap = $('#hc-cap'), segBox = $('#hc-segs');
    function titleSp() { return P.title && E.WORDS[P.title] ? E.WORDS[P.title].sp : ''; }
    function current(U) { var cs = codes(), sp = spOf(cs); return { cs: cs, sp: sp, sc: scene(sp, { U: U, vert: P.lay === 'v', rtl: P.dir === 'r', title: titleSp() }) }; }
    function displayName() { return clean(nameIn.value).toUpperCase(); }
    function draw() {
      var avail = Math.max(240, (stage.clientWidth || 600) - 8), cur = current(64), U = 64;
      if (P.lay !== 'v' && cur.sc.W > avail) { U = Math.max(22, 64 * avail / cur.sc.W); cur = current(U); }
      if (P.lay === 'v' && cur.sc.H > 640) { U = Math.max(30, 64 * 640 / cur.sc.H); cur = current(U); }
      stage.innerHTML = sceneSVG(cur.sc, { cls: 'hc-svg', label: cur.cs.length ? 'The name ' + displayName() + ' in hieroglyphs in a cartouche' : 'An empty cartouche' }) + (cur.cs.length ? '' : '<p class="hc-emptymsg">' + (clean(nameIn.value) ? 'Every letter is set to “leave it out”. Pick a sign below.' : 'Type a name to fill the cartouche.') + '</p>');
      cap.innerHTML = cur.cs.length ? '<b>' + esc(displayName()) + '</b>: ' + cur.cs.map(function (c) { return S[c].v[0] ? '<span class="eg-tl">' + esc(S[c].v[0]) + '</span>' : ''; }).filter(Boolean).join(' · ') + (P.title ? ' <small>with the title “' + esc(E.WORDS[P.title].en) + '”</small>' : '') : '';
      paintSegs(); P.name = nameIn.value; P.picks = pick; save();
    }
    function paintSegs() {
      if (!segs.length) { segBox.innerHTML = '<p class="hc-help">Type a name above.</p>'; return; }
      segBox.innerHTML = segs.map(function (sg, i) {
        if (sg.space) return '';
        var ch = sg.opts[pick[i]];
        return '<div class="hc-seg" role="group" aria-label="' + esc('Letter ' + sg.L.toUpperCase()) + '"><div class="hc-seghead"><b>' + esc(sg.L.toUpperCase()) + '</b><span class="eg-h">' + (ch && ch.s.length ? ch.s.map(function (c) { return S[c].u; }).join('') : '–') + '</span></div>' +
          '<div class="hc-alts">' + sg.opts.map(function (op, j) {
            return '<button type="button" class="hc-alt' + (j === pick[i] ? ' on' : '') + '" aria-pressed="' + (j === pick[i]) + '" data-i="' + i + '" data-j="' + j + '"><span class="eg-h">' + (op.s.length ? op.s.map(function (c) { return S[c].u; }).join('') : '∅') + '</span><small>' + (op.s.length ? op.s.map(function (c) { return '<span class="eg-tl">' + esc(S[c].v[0] || '') + '</span>'; }).join(' + ') : 'none') + '</small></button>';
          }).join('') + '</div><p class="hc-why">' + esc(ch ? ch.why : 'no sign for this letter') + '</p></div>';
      }).join('');
    }
    segBox.addEventListener('click', function (e) { var b = e.target.closest('.hc-alt'); if (!b) return; var i = +b.dataset.i, j = +b.dataset.j; pick[i] = j; draw(); var nb = segBox.querySelector('.hc-alt[data-i="' + i + '"][data-j="' + j + '"]'); if (nb) nb.focus(); });
    nameIn.addEventListener('input', function () { setName(true); draw(); });
    $('#hc-allv').addEventListener('click', function () { pick = segs.map(function () { return 0; }); draw(); });
    $('#hc-nov').addEventListener('click', function () { pick = segs.map(function (sg, i) { if (!sg.start && !sg.end && sg.vowel) { var k = -1; sg.opts.forEach(function (op, j) { if (!op.s.length && k < 0) k = j; }); if (k >= 0) return k; } return pick[i]; }); draw(); });
    function segCtl(id, key) {
      var box = $(id);
      function sync() { $$('button', box).forEach(function (b) { var on = b.dataset.v === String(P[key]); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
      box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; P[key] = b.dataset.v; sync(); draw(); });
      sync();
    }
    segCtl('#hc-lay', 'lay'); segCtl('#hc-dir', 'dir'); segCtl('#hc-grp', 'grp');
    var tSel = $('#hc-title'), dSel = $('#hc-det'); tSel.value = P.title; dSel.value = P.det;
    tSel.addEventListener('change', function () { P.title = tSel.value; draw(); }); dSel.addEventListener('change', function () { P.det = dSel.value; draw(); });

    // output
    var dark = function () { return D.documentElement.getAttribute('data-theme') === 'dark'; };
    var COL = { bg: '#fbf5e6', ink: '#2a2116', muted: '#6e5200' };
    var SUB = 'Written in Egyptian sound signs · Teddy Rook Book';
    function fileBase() { return 'cartouche-' + (clean(nameIn.value) || 'name'); }
    $('#hc-png').addEventListener('click', function () {
      var cur = current(150); if (!cur.cs.length) return;
      T.fontReady(function () { scenePNG(cur.sc, { bg: COL.bg, ink: COL.ink, muted: COL.muted, caption: displayName(), sub: SUB }, function (b) { if (b) T.download(fileBase() + '.png', b); }); });
    });
    var fontB64 = null;
    function withFont(cb) {
      if (fontB64 !== null) return cb(fontB64);
      var link = $('link[href*="hieroglyphs/hiero.css"]'), url;
      try { url = new URL('../../egypt/fonts/trb-hieroglyphs.woff', link ? link.href : W.location.href).href; } catch (e) { fontB64 = ''; return cb(''); }
      if (!W.fetch) { fontB64 = ''; return cb(''); }
      W.fetch(url).then(function (r) { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); }).then(function (buf) {
        var bytes = new Uint8Array(buf), bin = '', CH = 0x8000; for (var i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
        fontB64 = W.btoa(bin); cb(fontB64);
      }).catch(function () { fontB64 = ''; cb(''); });
    }
    $('#hc-svg').addEventListener('click', function () {
      var cur = current(100); if (!cur.cs.length) return;
      withFont(function (b64) { var svg = sceneSVG(cur.sc, { font: b64, bg: COL.bg, ink: COL.ink, muted: COL.muted, caption: displayName(), sub: SUB, label: 'The name ' + displayName() + ' in a cartouche' }); T.download(fileBase() + '.svg', new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svg], { type: 'image/svg+xml' })); });
    });
    $('#hc-print').addEventListener('click', function () {
      var cur = current(120); if (!cur.cs.length) return;
      var pa = $('#hc-printarea'); if (pa.parentNode !== D.body) D.body.appendChild(pa);
      pa.innerHTML = sceneSVG(cur.sc, { ink: '#000', muted: '#444', caption: displayName(), sub: SUB, cls: 'hc-printsvg' });
      D.documentElement.classList.add('hc-printing');
      var done = function () { D.documentElement.classList.remove('hc-printing'); W.removeEventListener('afterprint', done); };
      W.addEventListener('afterprint', done); W.print(); setTimeout(function () { if (!W.matchMedia || !W.matchMedia('print').matches) done(); }, 1500);
    });
    $('#hc-copy').addEventListener('click', function () { var cs = codes(); if (cs.length) T.copy((P.title ? E.text(titleSp()) + ' ' : '') + wordCodes().map(function (w) { return E.text(w.join('-')); }).join(' ') + (P.det ? E.text(P.det) : ''), this); });
    var lastW = 0; if ('ResizeObserver' in W) new ResizeObserver(function () { var w = stage.clientWidth; if (w && w !== lastW) { lastW = w; draw(); } }).observe(stage); else W.addEventListener('resize', draw);
    setName(false); draw(); T.fontReady(draw);

    /* ---------- real cartouches: the model's royal names ---------- */
    var rulers = $('#hc-rulers'), keys = Object.keys(E.NAMES);
    function kingOf(N) { var K = N.king && E.king ? E.king(N.king) : null; return K ? K.name + ', ' + E.span(K.from, K.to, true) : ''; }
    rulers.innerHTML = keys.map(function (k, i) {
      var N = E.NAMES[k], sc = scene(N.sp, { U: 46 });
      return '<article class="hc-ruler" id="name-' + esc(k) + '"><div class="hc-rpic">' + sceneSVG(sc, { cls: 'hc-svg', label: 'A royal cartouche, number ' + (i + 1) }) + '</div>' +
        '<button type="button" class="cbtn hc-show" aria-expanded="false" aria-controls="hc-r-' + i + '">Show the reading</button>' +
        '<div class="hc-reading" id="hc-r-' + i + '" hidden><h3>' + esc(N.en) + '</h3><p><span class="eg-tl">' + esc(E.show(N.tl)) + '</span> <small>said “' + esc(E.say(N.tl)) + '”</small></p>' +
        '<p class="hc-chips">' + N.signs.map(function (c) { return '<span class="hc-chip"><span class="eg-h">' + S[c].u + '</span> ' + (S[c].v[0] ? '<span class="eg-tl">' + esc(S[c].v[0]) + '</span>' : '<small>' + esc(c) + '</small>') + '</span>'; }).join('') + '</p>' +
        (kingOf(N) ? '<p class="hc-king">' + esc(kingOf(N)) + '</p>' : '') + (N.note ? '<p class="hc-note">' + esc(N.note) + '</p>' : '') + '</div></article>';
    }).join('');
    rulers.addEventListener('click', function (e) {
      var b = e.target.closest('.hc-show'); if (!b) return; var r = D.getElementById(b.getAttribute('aria-controls')), open = r.hidden; r.hidden = !open;
      b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Hide the reading' : 'Show the reading';
    });
    // the quiz
    var quiz = $('#hc-quiz'), qk = null, score = [0, 0];
    function ask() {
      qk = keys[Math.floor(Math.random() * keys.length)];
      var N = E.NAMES[qk], seenEn = {}, others = E.pick(keys.filter(function (k) { var en = E.NAMES[k].en; if (en === N.en || seenEn[en]) return false; seenEn[en] = 1; return true; }), 3), ch = E.pick([qk].concat(others), 4);
      quiz.innerHTML = '<div class="hc-qhead"><h3>Who is this?</h3><span class="hc-score">' + (score[1] ? score[0] + ' of ' + score[1] + ' right' : '') + '</span></div><div class="hc-qpic">' + sceneSVG(scene(N.sp, { U: 54 }), { cls: 'hc-svg', label: 'A royal cartouche to read' }) + '</div>' +
        '<div class="hc-qopts">' + ch.map(function (k) { return '<button type="button" class="hc-qopt" data-k="' + k + '">' + esc(E.NAMES[k].en) + '</button>'; }).join('') + '</div><p class="hc-qout" aria-live="polite"></p>';
    }
    quiz.addEventListener('click', function (e) {
      var b = e.target.closest('.hc-qopt'), nb = e.target.closest('.hc-qnext');
      if (nb) { ask(); var f1 = quiz.querySelector('.hc-qopt'); if (f1) f1.focus(); return; }
      if (!b || quiz.querySelector('.hc-qopt[disabled]')) return;
      var ok = b.dataset.k === qk, N = E.NAMES[qk]; score[1]++; if (ok) score[0]++;
      $$('.hc-qopt', quiz).forEach(function (x) { x.disabled = true; if (x.dataset.k === qk) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
      quiz.querySelector('.hc-qout').innerHTML = (ok ? '<b class="hc-ok">✓ Yes!</b> ' : '<b class="hc-no">Not quite.</b> It is <b>' + esc(N.en) + '</b>: ') + '<span class="eg-tl">' + esc(E.show(N.tl)) + '</span>. ' + (N.note ? esc(N.note) + ' ' : '') + '<button type="button" class="cbtn play hc-qnext">Next cartouche →</button>';
      quiz.querySelector('.hc-score').textContent = score[0] + ' of ' + score[1] + ' right';
      var nx = quiz.querySelector('.hc-qnext'); if (nx) nx.focus();
    });
    ask();
  });
})(window, document);
