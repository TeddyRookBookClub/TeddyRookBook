/* Brain Puzzles: shared helpers and the family registry.
   Every generator file registers itself here with P.add({...}).
   Works in the browser (window.TRBPuzzles) and in Node tests (globalThis.TRBPuzzles). */
(function (root) {
  'use strict';
  var P = root.TRBPuzzles = root.TRBPuzzles || {};
  P.fams = P.fams || {};
  P.order = P.order || [];
  P.add = function (f) { if (!P.fams[f.key]) P.order.push(f.key); P.fams[f.key] = f; };

  /* ---------- seeded random numbers ---------- */
  function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19;
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  P.rng = function (seedStr) {
    seedStr = String(seedStr);
    var f = mulberry32(xmur3(seedStr)());
    return {
      next: f,
      int: function (a, b) { return a + Math.floor(f() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(f() * arr.length)]; },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
      },
      chance: function (p) { return f() < p; },
      fork: function (s) { return P.rng(seedStr + '/' + s); }
    };
  };

  /* Sheet codes: 5 characters with no look-alikes (no 0/O, 1/I/L, U). */
  P.CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  P.newCode = function () {
    var s = '', c = P.CODE_CHARS, buf = null;
    try { if (root.crypto && root.crypto.getRandomValues) { buf = new Uint32Array(5); root.crypto.getRandomValues(buf); } } catch (e) { buf = null; }
    for (var i = 0; i < 5; i++) s += c[(buf ? buf[i] : Math.floor(Math.random() * 1e9)) % c.length];
    return s;
  };
  P.cleanCode = function (s) {
    s = String(s || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').slice(0, 8);
    return s;
  };

  /* ---------- small helpers ---------- */
  P.esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  P.range = function (a, b) { var r = []; for (var i = a; i < b; i++) r.push(i); return r; };
  P.svg = function (w, h, widthIn, inner, label, cls) {
    return '<svg class="pz-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 ' + w + ' ' + h + '" style="width:' + widthIn +
      'in" role="img" aria-label="' + P.esc(label || 'puzzle') + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  };
  P.txt = function (x, y, s, size, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" ' + (extra || 'text-anchor="middle" dominant-baseline="central"') + '>' + P.esc(s) + '</text>';
  };
  P.line = function (x1, y1, x2, y2, w, extra) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#000" stroke-width="' + w + '"' + (extra || '') + ' stroke-linecap="square"/>';
  };
  P.blank = function (wch) { return '<span class="pz-blank" style="min-width:' + (wch || 4) + 'em"></span>'; };
  P.levels = ['easy', 'medium', 'hard'];
  P.levelName = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

  /* Retry a generator until it returns a value (generators return null when a try fails a check). */
  P.tryGen = function (rng, fn, tries) {
    for (var t = 0; t < (tries || 400); t++) { var r = fn(rng.fork('t' + t), t); if (r) return r; }
    throw new Error('generator gave up');
  };

  /* Make one puzzle. opts: {kind} (a family "kind" such as a sudoku size). */
  P.make = function (famKey, level, code, i, opts) {
    var f = P.fams[famKey];
    var rng = P.rng(code + '|' + famKey + '|' + level + '|' + ((opts && opts.kind) || '') + '|' + i + (opts && opts.retry ? '#' + opts.retry : ''));
    var o = {}; for (var k in (opts || {})) if (k !== 'retry') o[k] = opts[k];
    o.code = code;
    var it = f.gen(rng, level, o, i);
    it.fam = famKey; it.level = level;
    if (!it.cols) it.cols = (typeof f.cols === 'function' ? f.cols(level, opts || {}) : (f.cols || 1));
    return it;
  };

  /* What makes two puzzles "the same" (a family can say, e.g. the same word or message). */
  P.sig = function (famKey, it) {
    var f = P.fams[famKey], s = f && f.sig && it.data ? f.sig(it.data) : null;
    return s != null ? String(s) : (it.data ? JSON.stringify(it.data) : it.q);
  };
  /* Make n puzzles for one sheet with no repeats. A repeat is remade with a new (still seeded) try,
     so the same code always gives the same sheet. If a small pool runs out, a repeat is allowed. */
  P.sheet = function (famKey, level, code, n, opts) {
    var out = [], seen = {};
    for (var i = 0; i < n; i++) {
      var it = null;
      for (var t = 0; t < 40; t++) {
        var o = {}; for (var k in (opts || {})) o[k] = opts[k];
        if (t) o.retry = t;
        var cand = P.make(famKey, level, code, i, o), s = P.sig(famKey, cand);
        if (!it) it = cand;
        if (!seen[s]) { it = cand; break; }
      }
      seen[P.sig(famKey, it)] = 1;
      out.push(it);
    }
    return out;
  };

  /* Rotate through a list across one sheet, so a sheet gets variety instead of repeats. */
  P.cycle = function (o, i, list, salt) {
    var order = P.rng(((o && o.code) || '') + '|' + salt).shuffle(list);
    return order[(i || 0) % order.length];
  };

  /* Several small problems shown as one block (used by the mixed sampler). */
  P.bundle = function (famKey, level, code, i, k, opts) {
    var qs = [], as = [];
    P.sheet(famKey, level, code + 'b' + i, k, opts).forEach(function (it) {
      qs.push('<li>' + it.q + '</li>'); as.push('<li>' + it.a + '</li>');
    });
    return { q: '<ol class="pz-sub">' + qs.join('') + '</ol>', a: '<ol class="pz-sub">' + as.join('') + '</ol>', cols: 1, fam: famKey, level: level };
  };
})(typeof window !== 'undefined' ? window : globalThis);
