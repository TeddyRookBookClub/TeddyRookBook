/* Code families: number bases, ciphers, Morse code. */
(function (root) {
  'use strict';
  var P = root.TRBPuzzles, esc = P.esc;

  /* ================= Number bases ================= */
  function sub(b) { return '<sub>' + b + '</sub>'; }
  function grp(s, n) { /* group binary digits in 4s from the right */
    if (s.length <= n) return s;
    var out = ''; for (var i = s.length; i > 0; i -= 4) out = s.slice(Math.max(0, i - 4), i) + (out ? ' ' + out : '');
    return out;
  }
  P.toBase = function (v, b) { return v.toString(b).toUpperCase(); };
  var BNAME = { 2: 'binary', 8: 'octal', 10: 'decimal', 16: 'hex' };
  function conv(v, from, to) {
    var s = P.toBase(v, from), shown = from === 2 ? grp(s, 8) : s, ans = P.toBase(v, to);
    return {
      q: '<span class="pz-big pz-mono">' + esc(shown) + sub(from) + '</span> = <span class="pz-blank" style="min-width:' + Math.max(4, ans.length * 0.9) + 'em"></span>' + sub(to),
      a: '<span class="pz-mono">' + esc(shown) + sub(from) + ' = <b>' + esc(to === 2 ? grp(ans, 8) : ans) + '</b>' + sub(to) + '</span>',
      ans: [{ label: BNAME[to], value: ans }], data: { type: 'conv', v: v, from: from, to: to, shown: s, ans: ans }
    };
  }
  function addProb(r, bitsN) {
    var x = r.int(2, Math.pow(2, bitsN) - 1), y = r.int(2, Math.pow(2, bitsN) - 1), z = x + y;
    var w = z.toString(2).length, xs = x.toString(2), ys = y.toString(2), zs = z.toString(2);
    function row(s, op, cls) { var cells = ''; for (var i = 0; i < w + 1; i++) { var ch = i === 0 ? op : (s[s.length - (w + 1 - i)] || ''); cells += '<td>' + ch + '</td>'; } return '<tr' + (cls ? ' class="' + cls + '"' : '') + '>' + cells + '</tr>'; }
    var carry = '<tr class="pz-carry">' + new Array(w + 2).join('<td></td>') + '</tr>';
    function tbl(ans) { return '<table class="pz-badd" aria-label="binary addition">' + carry + row(xs, '') + row(ys, '+') + row(ans ? zs : '', '', 'pz-bsum') + '</table>'; }
    return { q: tbl(false), a: '<span class="pz-mono">' + xs + ' + ' + ys + ' = <b>' + zs + '</b></span> (' + x + ' + ' + y + ' = ' + z + ')', ans: [{ label: 'Sum', value: zs }], data: { type: 'add', x: x, y: y, sum: zs } };
  }
  function pvProb(r, cols) {
    var v = r.int(3, Math.pow(2, cols) - 1), bitsS = v.toString(2), pad = new Array(cols - bitsS.length + 1).join('0') + bitsS, toDec = r.chance(0.5);
    var head = '<tr>' + P.range(0, cols).map(function (i) { return '<th>' + Math.pow(2, cols - 1 - i) + '</th>'; }).join('') + '<th class="pz-pvd">decimal</th></tr>';
    function body(fill) { return '<tr>' + pad.split('').map(function (b) { return '<td>' + (toDec || fill ? b : '') + '</td>'; }).join('') + '<td class="pz-pvd">' + (!toDec || fill ? v : '') + '</td></tr>'; }
    return { q: '<table class="pz-pv" aria-label="place-value table">' + head + body(false) + '</table>', a: '<table class="pz-pv pz-pvkey">' + head + body(true) + '</table>', ans: [{ label: toDec ? 'Decimal' : 'Binary', value: toDec ? String(v) : bitsS }], data: { type: 'pv', v: v, bits: pad, toDec: toDec } };
  }
  P.add({
    key: 'bases',
    sig: function (d) { return d.v != null ? d.type + d.v + '|' + d.from + '|' + d.to : null; },
    kinds: [['auto', 'Mixed'], ['bd', 'Binary ↔ decimal'], ['hex', 'Hexadecimal'], ['oct', 'Octal'], ['pv', 'Place-value tables'], ['add', 'Binary addition']],
    cols: function (level, o) { var k = o && o.kind; return k === 'add' ? 3 : 2; },
    top: function (level) {
      return '<p class="pz-chart"><b>Place values.</b> Binary: … 256, 128, 64, 32, 16, 8, 4, 2, 1. Octal: … 512, 64, 8, 1. Hex: … 4096, 256, 16, 1. Hex digits: 0–9, then A = 10, B = 11, C = 12, D = 13, E = 14, F = 15. The small number after a value tells its base.</p>';
    },
    gen: function (rng, level, o) {
      var k = (o && o.kind && o.kind !== 'auto') ? o.kind : null, r = rng;
      var max = level === 'easy' ? 15 : level === 'medium' ? 255 : 65535;
      if (!k) k = P.cycle(o, arguments[3], level === 'easy' ? ['bd', 'bd', 'pv'] : ['bd', 'hex', 'hex', 'oct', 'add'], 'bases' + level);
      if (k === 'pv') return pvProb(r, level === 'easy' ? 4 : level === 'medium' ? 8 : 10);
      if (k === 'add') return addProb(r, level === 'easy' ? 3 : level === 'medium' ? 5 : 8);
      var v = r.int(level === 'easy' ? 3 : 16, max), pairs;
      if (k === 'bd') pairs = [[2, 10], [10, 2]];
      else if (k === 'hex') pairs = level === 'easy' ? [[16, 10], [10, 16]] : [[16, 10], [10, 16], [2, 16], [16, 2]];
      else { pairs = level === 'hard' ? [[8, 10], [10, 8], [8, 2], [2, 8]] : [[8, 10], [10, 8]]; if (level !== 'hard') v = r.int(level === 'easy' ? 9 : 64, level === 'easy' ? 63 : 511); }
      var pr = r.pick(pairs);
      return conv(v, pr[0], pr[1]);
    }
  });

  /* ================= Ciphers ================= */
  var AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  P.caesar = function (s, k) { return s.replace(/[A-Z]/g, function (ch) { return AZ[(AZ.indexOf(ch) + k + 26) % 26]; }); };
  function cells(enc, plain, show, isNum) {
    /* each word as a row of boxes: code on top, a space to write below */
    return '<div class="pz-cipher">' + enc.split(' ').map(function (w, wi) {
      var pw = plain.split(' ')[wi];
      return '<span class="pz-cw">' + (isNum ? w.split('-') : w.split('')).map(function (ch, i) { return '<span class="pz-cc"><b>' + esc(ch) + '</b><i>' + (show ? esc(pw[i]) : '') + '</i></span>'; }).join('') + '</span>';
    }).join('') + '</div>';
  }
  function pickSentence(r, level) {
    var lim = typeof level === 'number' ? level : level === 'easy' ? 24 : level === 'medium' ? 32 : 60, lo = level === 'hard' ? 26 : 0;
    var pool = P.SENTENCES.filter(function (s) { return s.length <= lim && s.length >= lo; });
    return r.pick(pool);
  }
  P.add({
    key: 'ciphers', cols: 1,
    sig: function (d) { return d.plain; },
    kinds: [['auto', 'Mixed'], ['num', 'Number code (A = 1)'], ['caesar', 'Shift (Caesar) cipher'], ['sub', 'Substitution cipher']],
    gen: function (rng, level, o) {
      var k = (o && o.kind && o.kind !== 'auto') ? o.kind : P.cycle(o, arguments[3], level === 'easy' ? ['num', 'caesar'] : level === 'medium' ? ['caesar', 'caesar', 'num'] : ['sub', 'sub', 'caesar'], 'ci' + level);
      var r = rng, s = pickSentence(r, level), q, how;
      if (k === 'num') {
        var enc = s.split(' ').map(function (w) { return w.split('').map(function (ch) { return AZ.indexOf(ch) + 1; }).join('-'); }).join(' ');
        how = 'Each number is a letter: A = 1, B = 2, … Z = 26.';
        if (level !== 'easy') { var off = r.int(2, 5); enc = s.split(' ').map(function (w) { return w.split('').map(function (ch) { return AZ.indexOf(ch) + 1 + off; }).join('-'); }).join(' '); how = 'Each number is a letter, but this time A = ' + (1 + off) + ', B = ' + (2 + off) + ', and so on.'; }
        q = '<p class="pz-note">' + how + '</p>' + cells(enc, s, false, true);
        return { q: q, a: '<b>' + esc(s) + '</b>', sub: 'Number code', data: { type: 'num', plain: s, enc: enc } };
      }
      if (k === 'caesar') {
        var sh = r.int(level === 'easy' ? 1 : 3, level === 'easy' ? 3 : 23), e2 = P.caesar(s, sh);
        if (level === 'easy') how = 'Each letter was moved <b>' + sh + '</b> place' + (sh > 1 ? 's' : '') + ' forward in the alphabet. Move each one back ' + sh + ' to read it. (A moved back from ' + AZ[sh] + '.)';
        else if (level === 'medium') how = 'Each letter was shifted the same amount: <b>A became ' + AZ[sh] + '</b>. Shift every letter back to read it.';
        else { var first = s.split(' ')[0]; how = 'Every letter was shifted the same amount, but you have to find how far. Hint: the first word is <b>' + esc(first) + '</b>.'; }
        q = '<p class="pz-note">' + how + '</p>' + (level !== 'hard' ? strip() : '') + cells(e2, s, false);
        return { q: q, a: '<b>' + esc(s) + '</b> (shift ' + sh + ': A → ' + AZ[sh] + ')', sub: 'Shift cipher', data: { type: 'caesar', plain: s, enc: e2, shift: sh } };
      }
      /* substitution: every letter swapped for another, none for itself */
      var perm;
      do { perm = r.shuffle(AZ.split('')); } while (perm.some(function (ch, i) { return ch === AZ[i]; }));
      var e3 = s.replace(/[A-Z]/g, function (ch) { return perm[AZ.indexOf(ch)]; });
      var used = s.replace(/[^A-Z]/g, '').split('').filter(function (ch, i, a) { return a.indexOf(ch) === i; });
      var counts = {}; s.replace(/[^A-Z]/g, '').split('').forEach(function (ch) { counts[ch] = (counts[ch] || 0) + 1; });
      var nh = level === 'hard' ? 3 : 5, hints = r.shuffle(used).slice(0, nh).sort();
      how = 'Each letter stands for a different letter, the same way all through. Hints: ' + hints.map(function (ch) { return '<b>' + perm[AZ.indexOf(ch)] + ' = ' + ch + '</b>'; }).join(', ') + '. Look for short words like A, THE and IS.';
      q = '<p class="pz-note">' + how + '</p>' + cells(e3, s, false);
      return { q: q, a: '<b>' + esc(s) + '</b>', sub: 'Substitution cipher', data: { type: 'sub', plain: s, enc: e3, perm: perm.join(''), hints: hints } };
    }
  });
  function strip() {
    return '<div class="pz-strip" aria-label="alphabet">' + AZ.split('').map(function (ch) { return '<span>' + ch + '</span>'; }).join('') + '</div>';
  }

  /* ================= Morse code ================= */
  var MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.' };
  P.MORSE = MORSE;
  function pretty(code) { return code.replace(/\./g, '•').replace(/-/g, '–'); }
  P.toMorse = function (s) { return s.split(' ').map(function (w) { return w.split('').map(function (ch) { return MORSE[ch]; }).join(' '); }).join(' / '); };
  function chart() {
    return '<div class="pz-mchart" aria-label="Morse code chart">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').map(function (k) { return '<span><b>' + k + '</b> ' + pretty(MORSE[k]) + '</span>'; }).join('') + '</div>';
  }
  P.add({
    key: 'morse', cols: function (level) { return level === 'easy' ? 2 : 1; },
    sig: function (d) { return d.plain; },
    kinds: [['auto', 'Mixed'], ['decode', 'Decode (dots to letters)'], ['encode', 'Encode (letters to dots)']],
    top: function (level) { return level === 'hard' ? '<p class="pz-chart">Try these without the chart. If you get stuck, the chart is at the top of the answer key. A dot is short (•), a dash is long (–). A space comes between letters and a slash between words.</p>' : '<p class="pz-chart">A dot is short (•), a dash is long (–). A space comes between letters and a slash ( / ) between words.</p>' + chart(); },
    keyTop: function (level) { return level === 'hard' ? chart() : ''; },
    gen: function (rng, level, o) {
      var k = (o && o.kind && o.kind !== 'auto') ? o.kind : P.cycle(o, arguments[3], level === 'hard' ? ['decode', 'encode'] : ['decode', 'decode', 'encode'], 'mo' + level);
      var s = level === 'easy' ? rng.pick(P.WORDSHORT) : pickSentence(rng, level === 'medium' ? 28 : 'medium');
      var m = P.toMorse(s);
      if (k === 'decode') {
        var q = '<div class="pz-morse">' + m.split(' / ').map(function (w) { return '<span class="pz-mw">' + w.split(' ').map(function (c) { return '<span class="pz-mc"><b>' + pretty(c) + '</b><i></i></span>'; }).join('') + '</span>'; }).join('<span class="pz-msl">/</span>') + '</div>';
        return { q: q, a: '<b>' + esc(s) + '</b>', ans: [{ label: 'Message', value: s }], sub: 'Decode', data: { type: 'decode', plain: s, morse: m } };
      }
      var q2 = '<p class="pz-note">Write this in Morse code:</p><p class="pz-big">' + esc(s) + '</p><div class="pz-line"></div><div class="pz-line"></div>';
      return { q: q2, a: '<b>' + esc(s) + '</b>: <span class="pz-mono">' + esc(pretty(m)) + '</span>', sub: 'Encode', data: { type: 'encode', plain: s, morse: m } };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
