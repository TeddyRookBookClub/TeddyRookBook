/* Mix-and-Match Worksheet Maker: pick languages and codes, words and a puzzle type; draws the pages on canvas
   so the preview, the PNG images and the printed PDF are the same picture. */
(function (W, D) {
  'use strict';
  var $ = function (id) { return D.getElementById(id); };
  var DATA = JSON.parse($('lm-data').textContent);
  var BANK = DATA.words.map(function (r) { return { en: r[0], la: r[1], cat: r[2], pos: r[3], fq: r[4] }; });
  var BYEN = {}; BANK.forEach(function (w) { BYEN[w.en] = w; });
  var CATS = DATA.cats;

  // ---------- languages and codes ----------
  var LANGS = {
    en: { name: 'English', short: 'English' }, la: { name: 'Latin', short: 'Latin' },
    morse: { name: 'Morse code', short: 'Morse', code: 1 }, hex: { name: 'Hexadecimal', short: 'Hex', code: 1 },
    bin: { name: 'Binary', short: 'Binary', code: 1 }, asl: { name: 'ASL fingerspelling', short: 'ASL', code: 1 },
    oct: { name: 'Octal', short: 'Octal', code: 1 }, dec: { name: 'Decimal', short: 'Decimal', code: 1 },
    caesar: { name: 'Caesar shift', short: 'Caesar', code: 1 }, back: { name: 'Backwards', short: 'Backwards', code: 1 }
  };
  var ORDER = ['en', 'la', 'morse', 'hex', 'bin', 'asl', 'oct', 'dec', 'caesar', 'back'];
  var MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..' };
  function morseOf(c) { return (MORSE[c.toLowerCase()] || '').split('').map(function (x) { return x === '.' ? '•' : '–'; }).join('\u2009'); }
  function pad(s, n) { while (s.length < n) s = '0' + s; return s; }

  // ---------- settings ----------
  var DEF = { langs: ['en', 'la', 'morse', 'hex'], src: 'en', n: 25, cats: CATS.map(function (c) { return c[0]; }), pos: ['n', 'v', 'a'], minL: 2, maxL: 12, common: false,
    words: 'bank', mine: '', fmt: 'table', given: 'random', clues: 1, title: '', instr: '', nameLine: true, key: true, ref: true, big: false, caps: true,
    toVerb: false, shift: 3, paper: 'letter', seed: 0, code: true, front: 'first' };
  var KEY = 'trb-langmix-v1', st = JSON.parse(JSON.stringify(DEF));
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) if (k in DEF) st[k] = sv[k]; } catch (e) { }
  try { var hs = /[#&]s=([^&]+)/.exec(W.location.hash); if (hs) { var hv = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(hs[1]))))); for (var k2 in hv) if (k2 in DEF) st[k2] = hv[k2]; } } catch (e) { }
  if (!st.seed) st.seed = newSeed();
  function newSeed() { return 1 + Math.floor(Math.random() * 0x7ffffffe); }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function rngOf(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function seedCode(s) { return s.toString(36).toUpperCase(); }

  // ---------- choosing the words ----------
  function pool() {
    return BANK.filter(function (w) {
      var L = w.en.replace(/[^a-z]/g, '').length;
      return st.cats.indexOf(w.cat) >= 0 && L >= st.minL && L <= st.maxL && (!st.common || w.fq === 'A' || w.fq === 'B');
    });
  }
  function parseMine() {
    var out = [], bad = [], seen = {};
    st.mine.split(/[\n,;]+/).forEach(function (raw) {
      var s = raw.trim(); if (!s) return;
      var p = s.split('='), en = p[0].trim().toLowerCase().replace(/\s+/g, ' '), la = p[1] ? p[1].trim().toLowerCase() : null;
      if (!/^[a-z][a-z ]*$/.test(en) || (la !== null && !/^[a-z][a-z ]*$/.test(la))) { bad.push(s); return; }
      if (seen[en]) return; seen[en] = 1;
      var b = BYEN[en];
      out.push({ en: en, la: la || (b ? b.la : null), pos: b ? b.pos : 'n', own: !b && !la });
    });
    return { list: out, bad: bad };
  }
  function pickWords(r) {
    if (st.words === 'mine') { var m = parseMine(); return { list: shuffle(m.list, r), bad: m.bad, short: false }; }
    var p = shuffle(pool(), r), n = Math.max(1, Math.min(100, st.n | 0));
    return { list: p.slice(0, n), bad: [], short: p.length < n, avail: p.length };
  }

  // ---------- what each cell says ----------
  function srcText(w) { return (st.src === 'la' && w.la ? w.la : w.en); }
  function cell(lang, w) {
    if (lang === 'en') return { t: 'text', s: st.toVerb && w.pos === 'v' ? 'to ' + w.en : w.en, f: 'word' };
    if (lang === 'la') return { t: 'text', s: w.la || '?', f: 'latin' };
    var s = srcText(w), up = st.caps ? s.toUpperCase() : s.toLowerCase();
    if (lang === 'asl') return { t: 'asl', letters: s.toLowerCase().split('') };
    if (lang === 'caesar') return { t: 'text', s: up.replace(/[a-z]/gi, function (c) { var b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + st.shift + 26) % 26 + b); }), f: 'mono' };
    if (lang === 'back') return { t: 'text', s: up.split('').reverse().join(''), f: 'mono' };
    if (lang === 'morse') return { t: 'parts', parts: s.split(' ').map(function (wd) { return wd.split('').map(morseOf); }).reduce(function (a, wd, i) { if (i) a.push('/'); return a.concat(wd); }, []), f: 'morse', gap: '   ' };
    var parts = up.split('').map(function (c) {
      var n = c.charCodeAt(0);
      return lang === 'hex' ? pad(n.toString(16).toUpperCase(), 2) : lang === 'bin' ? pad(n.toString(2), 8) : lang === 'oct' ? pad(n.toString(8), 3) : String(n);
    });
    return { t: 'parts', parts: parts, f: 'mono', gap: ' ' };
  }

  // ---------- canvas layout ----------
  var FONTS = { word: '"Segoe UI",Roboto,Helvetica,Arial,sans-serif', latin: 'Georgia,"Times New Roman",serif', mono: 'ui-monospace,Menlo,Consolas,"Courier New",monospace', morse: 'ui-monospace,Menlo,Consolas,"Courier New",monospace', title: 'Georgia,"Times New Roman",serif' };
  var IMG = {}, imgReady = null;
  function loadASL() {
    if (imgReady) return imgReady;
    imgReady = Promise.all('abcdefghijklmnopqrstuvwxyz'.split('').map(function (c) {
      return new Promise(function (res) { var im = new Image(); im.onload = function () { IMG[c] = im; res(); }; im.onerror = function () { res(); }; im.src = DATA.asl + c + '.svg'; });
    }));
    return imgReady;
  }
  var F = 34, g0 = D.createElement('canvas').getContext('2d');
  function font(kind, size, bold) { return (kind === 'latin' ? 'italic ' : '') + (bold ? '700 ' : '400 ') + Math.round(size) + 'px ' + FONTS[kind]; }
  function sizeOf(kind) { return kind === 'mono' ? F * 0.86 : kind === 'morse' ? F * 0.95 : F; }
  // Break a cell into lines that fit maxW. Returns {lines, w, h, lh}
  function lay(c, maxW) {
    if (c.t === 'asl') {
      var iw = F * 1.2, ih = F * 1.58, gap = 5, per = Math.max(1, Math.floor((maxW + gap) / (iw + gap))), lines = [];
      for (var i = 0; i < c.letters.length; i += per) lines.push(c.letters.slice(i, i + per));
      var w = Math.min(c.letters.length, per) * (iw + gap) - gap;
      return { lines: lines, w: w, lh: ih + 6, h: lines.length * (ih + 6), iw: iw, ih: ih, gap: gap };
    }
    var sz = sizeOf(c.f); g0.font = font(c.f, sz);
    var parts = c.t === 'parts' ? c.parts : [c.s], sep = c.t === 'parts' ? c.gap : '', out = [], cur = '', mw = 0;
    parts.forEach(function (p) {
      var trial = cur ? cur + sep + p : p;
      if (cur && g0.measureText(trial).width > maxW) { out.push(cur); cur = p; } else cur = trial;
    });
    if (cur) out.push(cur);
    out.forEach(function (l) { mw = Math.max(mw, g0.measureText(l).width); });
    return { lines: out, w: mw, lh: sz * 1.32, h: out.length * sz * 1.32, sz: sz, f: c.f };
  }
  function drawLay(g, L, x, y, color, align, boxW) {
    if (L.iw) {
      L.lines.forEach(function (ln, i) {
        var lw = ln.length * (L.iw + L.gap) - L.gap, x0 = align === 'center' ? x + (boxW - lw) / 2 : x;
        ln.forEach(function (c, j) {
          var xx = x0 + j * (L.iw + L.gap), yy = y + i * L.lh;
          if (c === ' ') return;
          var im = IMG[c];
          if (im) { var r = Math.min(L.iw / im.width, L.ih / im.height), dw = im.width * r, dh = im.height * r; g.drawImage(im, xx + (L.iw - dw) / 2, yy + (L.ih - dh) / 2, dw, dh); }
          else { g.font = font('word', F * 0.8, true); g.fillStyle = color; g.textBaseline = 'middle'; g.fillText(c.toUpperCase(), xx, yy + L.ih / 2); }
        });
      });
      return;
    }
    g.font = font(L.f, L.sz, L.f === 'morse'); g.fillStyle = color; g.textBaseline = 'alphabetic';
    L.lines.forEach(function (l, i) { var lx = align === 'center' ? x + (boxW - g.measureText(l).width) / 2 : x; g.fillText(l, lx, y + i * L.lh + L.sz * 1.0); });
  }
  // Share a width between columns: each gets what it needs, long ones share what's left.
  function alloc(need, avail, minW) {
    var n = need.length, w = need.map(function (x) { return Math.max(minW, x); }), tot = w.reduce(function (a, b) { return a + b; }, 0);
    if (tot <= avail) { var extra = (avail - tot) / n; return w.map(function (x) { return x + extra; }); }
    var left = avail, open = w.map(function (_, i) { return i; }), out = new Array(n);
    for (;;) {
      var fair = left / open.length, fixed = open.filter(function (i) { return w[i] <= fair; });
      if (!fixed.length) { open.forEach(function (i) { out[i] = fair; }); break; }
      fixed.forEach(function (i) { out[i] = w[i]; left -= w[i]; });
      open = open.filter(function (i) { return fixed.indexOf(i) < 0; });
      if (!open.length) break;
    }
    return out;
  }

  // ---------- pages ----------
  var PAPER = { letter: [1700, 2200], a4: [1654, 2339] };
  function Book(title) {
    var sz = PAPER[st.paper] || PAPER.letter;
    this.W = sz[0]; this.H = sz[1]; this.M = 120; this.pages = []; this.title = title;
  }
  var MAXP = 40;
  Book.prototype.page = function (label) {
    if (this.pages.length >= MAXP) throw { tooBig: true };
    var cv = D.createElement('canvas'); cv.width = this.W; cv.height = this.H;
    var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, this.W, this.H);
    var p = { cv: cv, g: g, label: label, y: this.M }; this.pages.push(p); return p;
  };
  Book.prototype.bottom = function () { return this.H - this.M - F * 1.2; };
  function wrapText(g, text, maxW) {
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && g.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function header(bk, p, kind, first) {
    var g = p.g, M = bk.M, Wd = bk.W - 2 * M;
    g.fillStyle = '#111'; g.textBaseline = 'alphabetic';
    if (first) {
      g.font = '700 ' + Math.round(F * 1.55) + 'px ' + FONTS.title;
      wrapText(g, bk.title + (kind === 'key' ? ': answer key' : kind === 'ref' ? ': code charts' : ''), Wd).forEach(function (l) { p.y += F * 1.6; g.fillText(l, M, p.y); });
      p.y += F * 0.6;
      if (kind === 'sheet' && st.nameLine) {
        g.font = font('word', F * 0.85); p.y += F * 1.3;
        g.fillText('Name', M, p.y); g.fillText('Date', M + Wd * 0.62, p.y);
        g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath();
        g.moveTo(M + F * 2.6, p.y + 4); g.lineTo(M + Wd * 0.58, p.y + 4); g.moveTo(M + Wd * 0.62 + F * 2.2, p.y + 4); g.lineTo(M + Wd, p.y + 4); g.stroke();
        p.y += F * 0.6;
      }
      if (kind === 'sheet') {
        g.font = font('word', F * 0.86); g.fillStyle = '#222';
        wrapText(g, instructions(), Wd).forEach(function (l) { p.y += F * 1.25; g.fillText(l, M, p.y); });
      }
      p.y += F * 1.0;
    } else {
      g.font = '700 ' + Math.round(F * 0.95) + 'px ' + FONTS.title; p.y += F * 1.0;
      g.fillText(bk.title + (kind === 'key' ? ': answer key' : kind === 'ref' ? ': code charts' : '') + ' (continued)', M, p.y); p.y += F * 0.9;
    }
  }
  function footers(bk) {
    bk.pages.forEach(function (p, i) {
      var g = p.g; g.font = font('word', F * 0.6); g.fillStyle = '#777'; g.textBaseline = 'alphabetic';
      var t = 'Page ' + (i + 1) + ' of ' + bk.pages.length + (st.code ? '   ·   Sheet ' + seedCode(st.seed) : '');
      g.fillText(t, bk.M, bk.H - bk.M * 0.55);
    });
  }
  function langsOn() { return ORDER.filter(function (l) { return st.langs.indexOf(l) >= 0; }); }
  function colName(l) { var L = LANGS[l]; if (l === 'caesar') return 'Caesar +' + st.shift; return L.name; }
  function codesNote() {
    var on = langsOn(), anyCode = on.some(function (l) { return LANGS[l].code; });
    if (!anyCode) return '';
    return ' The codes spell the ' + (st.src === 'la' && on.indexOf('la') >= 0 ? 'Latin' : 'English') + ' word' + (on.indexOf('hex') >= 0 || on.indexOf('bin') >= 0 || on.indexOf('oct') >= 0 || on.indexOf('dec') >= 0 ? ', one letter at a time, using ' + (st.caps ? 'capital' : 'small') + ' letters' : '') + '.' + (st.ref ? ' The code charts at the end will help.' : '');
  }
  function instructions() {
    if (st.instr.trim()) return st.instr.trim();
    var on = langsOn(), names = on.map(colName);
    var base = st.fmt === 'match' ? 'Match each item with the same word in the other column' + (on.length > 2 ? 's' : '') + '. Write the letter in the box, or draw a line between the dots.' :
      st.fmt === 'cards' ? 'Cut out each card on the outside line, fold it in half on the dotted line, and glue or tape the halves together. Read one side, say the other, then flip to check.' :
      (on.length >= 5 ? 'Each numbered box is one word in ' + listJoin(names) + '. ' + (st.clues > 1 ? st.clues + ' lines in each box are' : 'One line in each box is') + ' filled in. Fill in the empty lines so the whole box says the same word.' :
      'Each row is one word in ' + listJoin(names) + '. ' + (st.clues > 1 ? st.clues + ' boxes in each row are' : 'One box in each row is') + ' filled in. Fill in the empty boxes so the whole row says the same word.');
    return base + codesNote();
  }
  function listJoin(a) { return a.length < 3 ? a.join(' and ') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function autoTitle() {
    if (st.title.trim()) return st.title.trim();
    var on = langsOn().map(function (l) { return LANGS[l].short; });
    return (st.fmt === 'match' ? 'Match it: ' : st.fmt === 'cards' ? 'Word cards: ' : 'Word puzzle: ') + on.join(' · ');
  }

  // ---------- many languages: one labeled block per word ----------
  function drawBlocks(bk, rows, kind) {
    var on = langsOn(), M = bk.M, avail = bk.W - 2 * M, numW = F * 1.9, labW = F * 6.4, padX = F * 0.35, padY = F * 0.3, cw = avail - numW - labW, p = bk.page(kind);
    header(bk, p, kind, true);
    rows.forEach(function (r, i) {
      var Ls = on.map(function (l) { return lay(cell(l, r.w), cw - 2 * padX); });
      var hs = Ls.map(function (L, c) { var blank = kind === 'sheet' && r.given.indexOf(on[c]) < 0; return Math.max(F * 1.5, L.h * (blank ? 1.3 : 1)) + 2 * padY; });
      var bh = hs.reduce(function (a, b) { return a + b; }, 0);
      if (p.y + bh > bk.bottom()) { p = bk.page(kind); header(bk, p, kind, false); }
      var g = p.g, y = p.y;
      g.fillStyle = '#555'; g.font = font('word', F * 0.75, true); g.textBaseline = 'middle'; g.fillText((i + 1) + '.', M + F * 0.1, y + hs[0] / 2);
      on.forEach(function (l, c) {
        var given = r.given.indexOf(l) >= 0, h = hs[c], x = M + numW;
        g.fillStyle = '#e8eee9'; g.fillRect(x, y, labW, h);
        if (kind === 'key' && given) { g.fillStyle = '#eef1ee'; g.fillRect(x + labW, y, cw, h); }
        g.fillStyle = '#123'; g.font = font('word', F * 0.66, true); g.textBaseline = 'middle'; g.fillText(colName(l), x + padX, y + h / 2);
        if (given || kind === 'key') drawLay(g, Ls[c], x + labW + padX, y + (h - Ls[c].h) / 2, given ? '#111' : '#00562f', 'left', cw - 2 * padX);
        g.strokeStyle = '#999'; g.lineWidth = 1.5; g.strokeRect(x, y, labW + cw, h);
        y += h;
      });
      g.strokeStyle = '#555'; g.lineWidth = 2.5; g.strokeRect(M + numW, p.y, labW + cw, bh);
      p.y += bh + F * 0.6;
    });
  }

  // ---------- table ----------
  function drawTable(bk, rows, kind) {
    var on = langsOn();
    if (on.length >= 5) return drawBlocks(bk, rows, kind);
    var M = bk.M, avail = bk.W - 2 * M, numW = F * 1.9, padX = F * 0.35, padY = F * 0.35;
    var cells = rows.map(function (r) { return on.map(function (l) { return cell(l, r.w); }); });
    var need = on.map(function (l, c) {
      g0.font = font('word', F * 0.72, true); var hw = g0.measureText(colName(l)).width;
      var m = cells.reduce(function (a, row) { return Math.max(a, lay(row[c], 1e9).w); }, 0);
      return Math.max(hw, m) + 2 * padX;
    });
    need = need.map(function (x, c) { return Math.max(x, on[c] === 'en' || on[c] === 'la' ? F * 5.4 : F * 4); });
    var cw = alloc(need, avail - numW, F * 3);
    var hdrH = F * 1.4, p = null;
    function newPage(first) {
      p = bk.page(kind); header(bk, p, kind, first);
      var g = p.g, x = M + numW;
      g.fillStyle = '#e8eee9'; g.fillRect(M, p.y, avail, hdrH);
      g.fillStyle = '#123'; g.font = font('word', F * 0.72, true); g.textBaseline = 'middle';
      on.forEach(function (l, c) { var t = colName(l); if (g.measureText(t).width > cw[c] - 2 * padX) t = l === 'caesar' ? 'Caesar' : LANGS[l].short; g.fillText(t, x + padX, p.y + hdrH / 2); x += cw[c]; });
      g.strokeStyle = '#888'; g.lineWidth = 2; g.strokeRect(M, p.y, avail, hdrH);
      p.y += hdrH;
    }
    newPage(true);
    rows.forEach(function (r, i) {
      var Ls = cells[i].map(function (c, j) { return lay(c, cw[j] - 2 * padX); });
      var hh = Ls.reduce(function (a, L) { return Math.max(a, L.h); }, 0), rh = Math.max(F * 2.3, hh * (kind === 'sheet' ? 1.3 : 1) + 2 * padY);
      if (p.y + rh > bk.bottom()) newPage(false);
      var g = p.g, x = M + numW;
      g.fillStyle = '#555'; g.font = font('word', F * 0.7); g.textBaseline = 'middle'; g.fillText((i + 1) + '.', M + F * 0.2, p.y + rh / 2);
      on.forEach(function (l, c) {
        var given = r.given.indexOf(l) >= 0;
        if (kind === 'key' && given) { g.fillStyle = '#eef1ee'; g.fillRect(x, p.y, cw[c], rh); }
        if (given || kind === 'key') drawLay(g, Ls[c], x + padX, p.y + (rh - Ls[c].h) / 2, given ? '#111' : '#00562f', 'left', cw[c] - 2 * padX);
        x += cw[c];
      });
      g.strokeStyle = '#999'; g.lineWidth = 1.5; g.strokeRect(M, p.y, avail, rh);
      x = M + numW; g.beginPath();
      on.forEach(function (l, c) { g.moveTo(x, p.y); g.lineTo(x, p.y + rh); x += cw[c]; }); g.stroke();
      p.y += rh;
    });
  }

  // ---------- matching ----------
  var ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi'];
  function label(col, i) { return col === 0 ? String(i + 1) : col === 1 ? String.fromCharCode(65 + i) : col === 2 ? String.fromCharCode(97 + i) : ROMAN[i]; }
  function drawMatch(bk, words, kind, r) {
    var on = langsOn().slice(0, 4), M = bk.M, avail = bk.W - 2 * M, groups = [];
    for (var s = 0; s < words.length; s += 20) groups.push(words.slice(s, s + 20));
    var p = bk.page(kind); header(bk, p, kind, true);
    groups.forEach(function (grp, gi) {
      var n = grp.length, perms = on.map(function (_, c) { return c === 0 ? grp.map(function (_, i) { return i; }) : shuffle(grp.map(function (_, i) { return i; }), r); });
      var boxW = F * 1.5, ansW = (on.length - 1) * (boxW + F * 0.3) + F * 0.4, labW = F * 1.6, dotW = F * 0.8;
      var cells = on.map(function (l, c) { return perms[c].map(function (i) { return cell(l, grp[i]); }); });
      var need = on.map(function (l, c) { return cells[c].reduce(function (a, x) { return Math.max(a, lay(x, 1e9).w); }, 0) + labW + dotW * 2; });
      var cw = alloc(need, avail - ansW, F * 4);
      var Ls = on.map(function (l, c) { return cells[c].map(function (x) { return lay(x, cw[c] - labW - dotW * 2); }); });
      var hdr = F * 1.5;
      function colHeads() {
        var g = p.g, x = M + ansW; g.font = font('word', F * 0.72, true); g.fillStyle = '#123'; g.textBaseline = 'middle';
        if (groups.length > 1) { g.fillText('Part ' + (gi + 1), M, p.y + hdr / 2); }
        else on.slice(1).forEach(function (l, j) { g.font = font('word', F * 0.5, true); g.fillText(LANGS[l].short, M + j * (boxW + F * 0.3), p.y + hdr / 2); });
        g.font = font('word', F * 0.72, true);
        on.forEach(function (l, c) { g.fillText(colName(l), x + labW, p.y + hdr / 2); x += cw[c]; });
        p.y += hdr;
      }
      if (p.y + hdr + F * 3 > bk.bottom()) { p = bk.page(kind); header(bk, p, kind, false); }
      colHeads();
      for (var row = 0; row < n; row++) {
        var rh = Math.max(F * 1.9, on.reduce(function (a, l, c) { return Math.max(a, Ls[c][row].h); }, 0) + F * 0.5);
        if (p.y + rh > bk.bottom()) { p = bk.page(kind); header(bk, p, kind, false); colHeads(); }
        var g = p.g, x = M + ansW, mid = p.y + rh / 2;
        // answer boxes for item `row` of the first column
        on.slice(1).forEach(function (l, j) {
          var bx = M + j * (boxW + F * 0.3), by = mid - boxW / 2;
          g.strokeStyle = '#666'; g.lineWidth = 2; g.strokeRect(bx, by, boxW, boxW);
          if (kind === 'key') { var at = perms[j + 1].indexOf(perms[0][row]); g.fillStyle = '#00562f'; g.font = font('word', F * 0.75, true); g.textBaseline = 'middle'; var t = label(j + 1, at); g.fillText(t, bx + (boxW - g.measureText(t).width) / 2, mid); }
        });
        on.forEach(function (l, c) {
          g.fillStyle = '#333'; g.font = font('word', F * 0.72, true); g.textBaseline = 'middle';
          g.fillText(label(c, row) + (c === 0 ? '.' : ')'), x, mid);
          var L = Ls[c][row]; drawLay(g, L, x + labW + dotW, mid - L.h / 2, '#111', 'left', cw[c] - labW - dotW * 2);
          g.fillStyle = '#444';
          if (c > 0) { g.beginPath(); g.arc(x + labW + dotW * 0.35, mid, F * 0.14, 0, 7); g.fill(); }
          if (c < on.length - 1) { g.beginPath(); g.arc(x + cw[c] - dotW * 0.4, mid, F * 0.14, 0, 7); g.fill(); }
          x += cw[c];
        });
        p.y += rh;
      }
      p.y += F * 1.2;
    });
  }

  // ---------- fold-over cards ----------
  function drawCards(bk, words) {
    var on = langsOn(), front = on[0], backs = on.slice(1), M = bk.M, avail = bk.W - 2 * M, gap = F * 0.8;
    var widest = words.reduce(function (a, w) { return Math.max(a, on.reduce(function (b, l) { return Math.max(b, lay(cell(l, w), 1e9).w); }, 0)); }, 0);
    var perRow = widest > (avail - gap) / 4 - F ? 1 : 2, cardW = (avail - gap * (perRow - 1)) / perRow, half = cardW / 2, pad = F * 0.5;
    var p = bk.page('sheet'); header(bk, p, 'sheet', true);
    for (var i = 0; i < words.length; i += perRow) {
      var set = words.slice(i, i + perRow);
      var info = set.map(function (w) {
        var fL = lay(cell(front, w), half - 2 * pad), bLs = backs.map(function (l) { return lay(cell(l, w), half - 2 * pad); });
        var bh = bLs.reduce(function (a, L) { return a + L.h + F * 0.75; }, 0);
        return { fL: fL, bLs: bLs, h: Math.max(F * 3.6, fL.h + 2 * pad + F * 0.6, bh + 2 * pad) };
      });
      var ch = info.reduce(function (a, x) { return Math.max(a, x.h); }, 0);
      if (p.y + ch > bk.bottom()) { p = bk.page('sheet'); header(bk, p, 'sheet', false); }
      var g = p.g;
      info.forEach(function (c, j) {
        var x = M + j * (cardW + gap), y = p.y;
        g.setLineDash([12, 8]); g.strokeStyle = '#777'; g.lineWidth = 2; g.strokeRect(x, y, cardW, ch);
        g.setLineDash([4, 8]); g.beginPath(); g.moveTo(x + half, y + 8); g.lineTo(x + half, y + ch - 8); g.stroke(); g.setLineDash([]);
        g.font = font('word', F * 0.45, true); g.fillStyle = '#888'; g.textBaseline = 'alphabetic';
        g.fillText(LANGS[front].short.toUpperCase(), x + pad, y + pad + F * 0.2);
        drawLay(g, c.fL, x + pad, y + (ch - c.fL.h) / 2 + F * 0.2, '#111', 'center', half - 2 * pad);
        var tot = c.bLs.reduce(function (a, L) { return a + L.h + F * 0.75; }, 0), yy = y + (ch - tot) / 2;
        c.bLs.forEach(function (L, k) {
          g.font = font('word', F * 0.45, true); g.fillStyle = '#888'; g.textBaseline = 'alphabetic';
          var lbl = LANGS[backs[k]].short.toUpperCase(); g.fillText(lbl, x + half + (half - g.measureText(lbl).width) / 2, yy + F * 0.5);
          drawLay(g, L, x + half + pad, yy + F * 0.7, '#111', 'center', half - 2 * pad); yy += L.h + F * 0.75;
        });
      });
      p.y += ch + gap;
    }
  }

  // ---------- code charts ----------
  function drawRef(bk) {
    var on = langsOn(), M = bk.M, avail = bk.W - 2 * M, p = bk.page('ref'), any = false;
    header(bk, p, 'ref', true);
    var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (c) { return st.caps ? c : c.toLowerCase(); });
    function need(h) { if (p.y + h > bk.bottom()) { p = bk.page('ref'); header(bk, p, 'ref', false); } }
    function sub(t) { need(F * 3); var g = p.g; g.font = '700 ' + Math.round(F * 1.05) + 'px ' + FONTS.title; g.fillStyle = '#123'; g.textBaseline = 'alphabetic'; p.y += F * 1.2; g.fillText(t, M, p.y); p.y += F * 0.7; any = true; }
    if (on.indexOf('morse') >= 0) {
      sub('Morse code');
      var cols = 4, cw = avail / cols, rh = F * 1.45;
      need(Math.ceil(26 / cols) * rh);
      ABC.forEach(function (c, i) {
        var g = p.g, x = M + (i % cols) * cw, y = p.y + Math.floor(i / cols) * rh;
        g.font = font('word', F * 0.85, true); g.fillStyle = '#111'; g.textBaseline = 'middle'; g.fillText(c.toUpperCase(), x, y + rh / 2);
        g.font = font('morse', F, true); g.fillText(morseOf(c), x + F * 1.3, y + rh / 2);
      });
      p.y += Math.ceil(26 / cols) * rh + F * 0.4;
    }
    var nums = ['hex', 'bin', 'oct', 'dec'].filter(function (l) { return on.indexOf(l) >= 0; });
    if (nums.length) {
      sub('Letter codes (ASCII), ' + (st.caps ? 'capital' : 'small') + ' letters');
      var per = nums.length > 2 ? 1 : 2, blockW = avail / per, colW = (blockW - F * 2.2) / nums.length, rh2 = F * 1.18, rowsN = Math.ceil(26 / per);
      need(rh2 * (rowsN + 1));
      var g = p.g;
      for (var b = 0; b < per; b++) {
        var bx = M + b * blockW; g.font = font('word', F * 0.62, true); g.fillStyle = '#123'; g.textBaseline = 'middle';
        g.fillText('Letter', bx, p.y + rh2 / 2);
        nums.forEach(function (l, j) { g.fillText(LANGS[l].short, bx + F * 2.2 + j * colW, p.y + rh2 / 2); });
      }
      ABC.forEach(function (c, i) {
        var b = Math.floor(i / rowsN), row = i % rowsN, bx = M + b * blockW, y = p.y + (row + 1) * rh2, n = c.charCodeAt(0);
        if (row % 2 === 0) { g.fillStyle = '#f2f5f2'; g.fillRect(bx - 6, y, blockW - F * 0.6, rh2); }
        g.fillStyle = '#111'; g.font = font('word', F * 0.8, true); g.textBaseline = 'middle'; g.fillText(c, bx + F * 0.3, y + rh2 / 2);
        g.font = font('mono', F * 0.78);
        nums.forEach(function (l, j) { var v = l === 'hex' ? pad(n.toString(16).toUpperCase(), 2) : l === 'bin' ? pad(n.toString(2), 8) : l === 'oct' ? pad(n.toString(8), 3) : String(n); g.fillText(v, bx + F * 2.2 + j * colW, y + rh2 / 2); });
      });
      p.y += (rowsN + 1) * rh2 + F * 0.6;
    }
    if (on.indexOf('asl') >= 0) {
      sub('ASL fingerspelling (as you see it, facing the signer)');
      var per2 = 7, cw2 = avail / per2, ih = cw2 * 0.95, rh3 = ih + F * 1.1;
      for (var i = 0; i < 26; i++) {
        if (i % per2 === 0) { need(rh3); if (i) p.y += rh3; }
        var c = 'abcdefghijklmnopqrstuvwxyz'[i], im = IMG[c], x = M + (i % per2) * cw2, gg = p.g;
        if (im) { var r2 = Math.min((cw2 - F * 0.6) / im.width, (ih - F * 0.4) / im.height); gg.drawImage(im, x + (cw2 - im.width * r2) / 2, p.y, im.width * r2, im.height * r2); }
        gg.font = font('word', F * 0.8, true); gg.fillStyle = '#111'; gg.textBaseline = 'alphabetic'; gg.fillText(c.toUpperCase(), x + cw2 / 2 - F * 0.25, p.y + ih + F * 0.8);
      }
      p.y += rh3 + F * 0.4;
    }
    if (on.indexOf('caesar') >= 0) {
      sub('Caesar shift: each letter moves ' + st.shift + ' place' + (st.shift === 1 ? '' : 's') + ' along the alphabet');
      var cw3 = avail / 26, gg2 = p.g; need(F * 3.4);
      ['Plain', 'Code'].forEach(function (lab, row) {
        ABC.forEach(function (c, i) {
          var ch = row ? String.fromCharCode((c.toUpperCase().charCodeAt(0) - 65 + st.shift) % 26 + 65) : c.toUpperCase();
          gg2.font = font('mono', F * 0.8, row === 1); gg2.fillStyle = row ? '#00562f' : '#111'; gg2.textBaseline = 'middle';
          gg2.fillText(st.caps ? ch : ch.toLowerCase(), M + i * cw3 + cw3 * 0.2, p.y + F * 0.8 + row * F * 1.3);
        });
      });
      p.y += F * 3.2;
    }
    if (on.indexOf('back') >= 0) { sub('Backwards'); var g3 = p.g; g3.font = font('word', F * 0.85); g3.fillStyle = '#111'; g3.textBaseline = 'alphabetic'; p.y += F; g3.fillText('Read the letters from right to left: TAC is CAT.', M, p.y); p.y += F; }
    if (!any) bk.pages.pop();
  }

  // ---------- build ----------
  var last = null;
  function build() {
    F = st.big ? 44 : 34;
    var r = rngOf(st.seed), pk = pickWords(r), on = langsOn();
    var words = pk.list, bk = new Book(autoTitle()), notes = [];
    if (on.length < 1) return { pages: [], notes: ['Choose at least one language or code.'] };
    if (!words.length) return { pages: [], notes: [st.words === 'mine' ? 'Type some words in “My own words” to make a sheet.' : 'No words match those choices. Try more topics or a wider length.'] };
    if (pk.short) notes.push('Only ' + pk.avail + ' words match those choices, so the sheet has ' + pk.avail + '.');
    if (pk.bad.length) notes.push('Skipped (letters and spaces only): ' + pk.bad.slice(0, 6).join(', ') + (pk.bad.length > 6 ? '…' : ''));
    var own = words.filter(function (w) { return !w.la; });
    if (own.length && on.indexOf('la') >= 0) notes.push('No Latin in the word bank for: ' + own.slice(0, 8).map(function (w) { return w.en; }).join(', ') + (own.length > 8 ? '…' : '') + '. They show “?”. Add Latin like this: cookie = crustulum.');
    if (st.fmt === 'match' && on.length > 4) notes.push('Matching uses the first four columns: ' + on.slice(0, 4).map(colName).join(', ') + '.');
    if (st.fmt !== 'cards' && on.length < 2) notes.push('Choose at least two languages or codes for a table or matching sheet.');
    try {
    if (st.fmt === 'table') {
      var clues = Math.max(1, Math.min(on.length - 1, st.clues | 0)), rows = words.map(function (w, i) {
        var given;
        if (st.given !== 'random' && on.indexOf(st.given) >= 0) { given = [st.given]; if (clues > 1) given = given.concat(shuffle(on.filter(function (l) { return l !== st.given; }), r).slice(0, clues - 1)); }
        else given = shuffle(on, r).slice(0, clues);
        return { w: w, given: given };
      });
      drawTable(bk, rows, 'sheet');
      if (st.ref) drawRef(bk);
      if (st.key) drawTable(bk, rows, 'key');
    } else if (st.fmt === 'match') {
      var mr = rngOf(st.seed ^ 0x5bd1e995);
      drawMatch(bk, words, 'sheet', mr);
      if (st.ref) drawRef(bk);
      if (st.key) { mr = rngOf(st.seed ^ 0x5bd1e995); drawMatch(bk, words, 'key', mr); }
    } else {
      drawCards(bk, words);
      if (st.ref) drawRef(bk);
    }
    } catch (e) {
      if (!e || !e.tooBig) throw e;
      bk.pages.forEach(function (p) { p.cv.width = p.cv.height = 0; });
      return { pages: [], notes: notes.concat(['That would be more than ' + MAXP + ' pages. Choose fewer words or fewer languages, or turn off the answer key or code charts.']) };
    }
    footers(bk);
    return { pages: bk.pages, notes: notes, title: bk.title, n: words.length };
  }

  // ---------- form ----------
  var form = $('lm-form');
  function syncForm() {
    form.querySelectorAll('[name=lang]').forEach(function (c) { c.checked = st.langs.indexOf(c.value) >= 0; });
    form.querySelectorAll('[name=cat]').forEach(function (c) { c.checked = st.cats.indexOf(c.value) >= 0; });
    ['fmt', 'src', 'words', 'paper'].forEach(function (n) { form.querySelectorAll('[name=' + n + ']').forEach(function (c) { c.checked = c.value === st[n]; }); });
    $('lm-n').value = st.n; $('lm-min').value = st.minL; $('lm-max').value = st.maxL; $('lm-clues').value = st.clues; $('lm-shift').value = st.shift;
    $('lm-title').value = st.title; $('lm-instr').value = st.instr; $('lm-mine').value = st.mine;
    ['nameLine', 'key', 'ref', 'big', 'caps', 'toVerb', 'common', 'code'].forEach(function (n) { var el = form.querySelector('[data-b=' + n + ']'); if (el) el.checked = !!st[n]; });
    var g = $('lm-given'), on = langsOn();
    g.innerHTML = '<option value="random">Mixed: a different one each row</option>' + on.map(function (l) { return '<option value="' + l + '">' + colName(l) + '</option>'; }).join('');
    g.value = on.indexOf(st.given) >= 0 ? st.given : 'random';
    $('lm-clues').max = Math.max(1, on.length - 1);
    form.querySelectorAll('[data-for]').forEach(function (el) { var f = el.dataset.for.split(' '); el.hidden = f.indexOf(st.fmt) < 0 && f.indexOf(st.words) < 0 && !f.some(function (x) { return st.langs.indexOf(x) >= 0; }); });
    $('lm-instr').placeholder = (function () { var t = st.instr; st.instr = ''; var a = instructions(); st.instr = t; return a; })();
    $('lm-title').placeholder = (function () { var t = st.title; st.title = ''; var a = autoTitle(); st.title = t; return a; })();
    $('lm-avail').textContent = st.words === 'bank' ? pool().length + ' words match' : '';
  }
  function readForm() {
    st.langs = [].filter.call(form.querySelectorAll('[name=lang]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
    st.cats = [].filter.call(form.querySelectorAll('[name=cat]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
    ['fmt', 'src', 'words', 'paper'].forEach(function (n) { var c = form.querySelector('[name=' + n + ']:checked'); if (c) st[n] = c.value; });
    st.n = Math.max(1, Math.min(100, +$('lm-n').value || 25)); st.minL = +$('lm-min').value || 1; st.maxL = +$('lm-max').value || 20;
    if (st.minL > st.maxL) { var t = st.minL; st.minL = st.maxL; st.maxL = t; }
    st.clues = Math.max(1, +$('lm-clues').value || 1); st.shift = Math.max(1, Math.min(25, +$('lm-shift').value || 3));
    st.title = $('lm-title').value; st.instr = $('lm-instr').value; st.mine = $('lm-mine').value; st.given = $('lm-given').value;
    form.querySelectorAll('[data-b]').forEach(function (el) { st[el.dataset.b] = el.checked; });
  }
  var timer = 0;
  function changed() { readForm(); save(); syncForm(); clearTimeout(timer); timer = setTimeout(render, 180); }
  form.addEventListener('change', changed);
  form.addEventListener('input', function (e) { if (e.target.matches('input[type=text],textarea,input[type=number]')) changed(); });
  form.querySelectorAll('[data-all]').forEach(function (b) { b.addEventListener('click', function () { var on = b.dataset.all === '1'; form.querySelectorAll('[name=' + b.dataset.name + ']').forEach(function (c) { c.checked = on; }); changed(); }); });

  // ---------- preview and export ----------
  function render() {
    loadASL().then(function () {
      if (last) last.pages.forEach(function (p) { p.cv.width = p.cv.height = 0; }); // free the old pages' memory
      last = build();
      var pv = $('lm-pages'); pv.innerHTML = '';
      $('lm-notes').innerHTML = last.notes.map(function (n) { return '<p>⚠️ ' + esc(n) + '</p>'; }).join('');
      last.pages.forEach(function (p, i) {
        var fig = D.createElement('figure'); fig.className = 'lm-page';
        p.cv.setAttribute('role', 'img'); p.cv.setAttribute('aria-label', 'Page ' + (i + 1) + ' preview');
        fig.appendChild(p.cv);
        var cap = D.createElement('figcaption');
        cap.innerHTML = '<span>Page ' + (i + 1) + ' · ' + (p.label === 'key' ? 'Answer key' : p.label === 'ref' ? 'Code charts' : 'Worksheet') + '</span> <button type="button" class="hs-btn ghost" data-png="' + i + '">⬇ PNG</button>';
        fig.appendChild(cap); pv.appendChild(fig);
      });
      $('lm-count').textContent = last.pages.length ? last.n + ' words · ' + last.pages.length + ' page' + (last.pages.length > 1 ? 's' : '') + ' · sheet ' + seedCode(st.seed) : '';
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slug() { return (last && last.title || 'worksheet').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); }
  function savePNG(i) {
    var p = last.pages[i]; if (!p) return;
    p.cv.toBlob(function (b) {
      var a = D.createElement('a'), u = URL.createObjectURL(b); a.href = u;
      a.download = slug() + '-page-' + (i + 1) + (p.label === 'key' ? '-answers' : p.label === 'ref' ? '-charts' : '') + '.png';
      D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1500);
    }, 'image/png');
  }
  $('lm-pages').addEventListener('click', function (e) { var b = e.target.closest('[data-png]'); if (b) savePNG(+b.dataset.png); });
  $('lm-png').addEventListener('click', function () { if (!last) return; last.pages.forEach(function (_, i) { setTimeout(function () { savePNG(i); }, i * 400); }); });
  $('lm-pdf').addEventListener('click', function () {
    if (!last || !last.pages.length) return;
    var box = $('lm-print'), css = $('lm-pagecss');
    box.innerHTML = last.pages.map(function (p) { return '<img src="' + p.cv.toDataURL('image/png') + '" alt="">'; }).join('');
    css.textContent = '@page{size:' + (st.paper === 'a4' ? 'A4' : 'letter') + ';margin:0}';
    D.body.classList.add('lm-printing');
    setTimeout(function () { W.print(); setTimeout(function () { D.body.classList.remove('lm-printing'); box.innerHTML = ''; }, 800); }, 120);
  });
  $('lm-shuffle').addEventListener('click', function () { st.seed = newSeed(); save(); render(); });
  $('lm-link').addEventListener('click', function () {
    var u = W.location.href.split('#')[0] + '#s=' + encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(st)))));
    var done = function () { $('lm-linkmsg').textContent = 'Link copied. Opening it makes this exact sheet again.'; };
    if (navigator.clipboard) navigator.clipboard.writeText(u).then(done, function () { W.prompt('Copy this link:', u); }); else W.prompt('Copy this link:', u);
  });
  D.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = JSON.parse(b.dataset.preset); for (var k in DEF) if (!(k in p) && k !== 'seed') st[k] = JSON.parse(JSON.stringify(DEF[k]));
      for (var k3 in p) st[k3] = p[k3]; st.seed = newSeed(); save(); syncForm(); render();
      $('lm-make').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- word bank browser ----------
  var bq = $('lm-bq'), bc = $('lm-bc'), bl = $('lm-blist');
  function listBank() {
    var q = bq.value.trim().toLowerCase(), c = bc.value;
    var hits = BANK.filter(function (w) { return (!c || w.cat === c) && (!q || w.en.indexOf(q) >= 0 || w.la.indexOf(q) >= 0); });
    $('lm-bn').textContent = hits.length + ' of ' + BANK.length + ' words';
    bl.innerHTML = hits.map(function (w) { return '<button type="button" data-w="' + w.en + '" title="Add to my own words"><b>' + w.en + '</b><i>' + w.la + '</i></button>'; }).join('');
  }
  if (bq) {
    bq.addEventListener('input', listBank); bc.addEventListener('change', listBank);
    bl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-w]'); if (!b) return;
      var cur = st.mine.trim(); st.mine = (cur ? cur + '\n' : '') + b.dataset.w; st.words = 'mine';
      save(); syncForm(); clearTimeout(timer); timer = setTimeout(render, 150);
      b.classList.add('added');
    });
    listBank();
  }

  D.body.appendChild($('lm-print')); // printed alone, as a direct child of <body>
  syncForm(); render();
})(window, document);
