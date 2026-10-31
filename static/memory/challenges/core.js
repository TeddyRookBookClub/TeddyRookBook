/* Memory challenges: shared logic (answer matching, chunks, the 1-3-7-21 schedule, seeded shuffle, card and digit scoring, storage).
   Used by engine.js (list pages), deck.js, pi.js and the games; also loaded by the Node tests (scripts/memory/test-memory.js). */
(function (root, factory) {
  var M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M; else root.TRBMem = M;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var M = {};

  /* ---------------- answer matching ---------------- */
  var WORDNUM = { first: '1', second: '2', third: '3', '1st': '1', '2nd': '2', '3rd': '3' };
  var ROMAN = { i: '1', ii: '2', iii: '3' };
  var ABBR = { st: 'saint', ste: 'sainte', mt: 'mount', ft: 'fort', pt: 'point', n: 'north', s: 'south', e: 'east', w: 'west' };
  var COMPASS = { n: 1, s: 1, e: 1, w: 1 };
  M.norm = function (s) {
    s = String(s == null ? '' : s);
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.toLowerCase().replace(/&/g, ' and ').replace(/[’'`´]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    if (!s) return '';
    var t = s.split(' ');
    if (t.length > 1 && t[0] === 'the') t.shift();
    t = t.map(function (w, i) {
      if (/^\d+(st|nd|rd|th)$/.test(w)) return w.replace(/\D+$/, '');
      if (i === 0 && t.length > 1 && (WORDNUM[w] || ROMAN[w])) return WORDNUM[w] || ROMAN[w];
      if (COMPASS[w]) return t.length > 1 && i === 0 ? ABBR[w] : w;   // "N Dakota" -> north dakota; a lone letter stays
      return ABBR[w] && !COMPASS[w] ? ABBR[w] : w;
    });
    return t.join(' ');
  };
  // the same, with single-letter initials dropped ("ulysses s grant" -> "ulysses grant")
  M.noInit = function (n) { return n.split(' ').filter(function (w) { return !/^[a-z]$/.test(w); }).join(' '); };
  M.lev = function (a, b) {
    if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
    var p = [], i, j; for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) {
      var prev = p[0]; p[0] = i;
      for (j = 1; j <= b.length; j++) { var tmp = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp; }
    }
    return p[b.length];
  };
  /* Does `typed` match one of `answers`? `pool` holds the field's other values in the list, so that a surname
     or a near-spelling counts only when it can't be confused with another item.
     Returns {ok, how: 'exact'|'surname'|'spelling', ambiguous}. */
  /* Math answers (formulas, powers, roots) keep their symbols: a^(m+n) and a^(m−n) must stay different. Such answers
     are compared strictly after a light rewrite (² -> ^2, − -> -, × -> *, √ -> sqrt, subscripts -> digits, no spaces). */
  var MATH = /[\^\u00b2\u00b3\u00b9\u2070-\u209f\u221a\u00b1\u00d7\u00f7\u2212=<>\u2264\u2265\u221e\u03b1-\u03c9\u0394\u03a3\u03a9\u2220\u00b0]/;
  M.isMath = function (s) { return MATH.test(String(s == null ? '' : s)); };
  var SUP = { '\u00b2': '^2', '\u00b3': '^3', '\u00b9': '^1', '\u2070': '^0', '\u2074': '^4', '\u2075': '^5', '\u2076': '^6', '\u2077': '^7', '\u2078': '^8', '\u2079': '^9', '\u207b': '^-', '\u207a': '^+' };
  var GREEK = { '\u03c0': 'pi', '\u03b8': 'theta', '\u0394': 'delta', '\u03a3': 'sigma', '\u03b1': 'alpha', '\u03b2': 'beta', '\u03bb': 'lambda', '\u03bc': 'mu', '\u03c1': 'rho', '\u03c9': 'omega', '\u03a9': 'omega' };
  M.strict = function (s) {
    s = String(s == null ? '' : s).toLowerCase();
    s = s.replace(/[\u00b2\u00b3\u00b9\u2070\u2074-\u2079\u207a\u207b]/g, function (c) { return SUP[c]; })
      .replace(/\^\^/g, '^')
      .replace(/[\u2080-\u2089]/g, function (c) { return String(c.charCodeAt(0) - 0x2080); })
      .replace(/[\u2212\u2013\u2014]/g, '-').replace(/[\u00d7\u00b7\u22c5]/g, '*').replace(/\u00f7/g, '/').replace(/\u221a/g, 'sqrt')
      .replace(/[\u03b1-\u03c9\u0394\u03a3\u03a9]/g, function (c) { return GREEK[c] || c; })
      .replace(/\s+/g, '');
    return s;
  };
  M.match = function (typed, answers, pool) {
    if ((answers || []).some(M.isMath)) {      // strict for math: exact after the rewrite, no surname or spelling leniency
      var ts = M.strict(typed); if (!ts) return { ok: false };
      return (answers || []).some(function (a) { return M.strict(a) === ts; }) ? { ok: true, how: 'exact' } : { ok: false };
    }
    var n = M.norm(typed); if (!n) return { ok: false };
    var A = [], seen = {};
    (answers || []).forEach(function (a) { var x = M.norm(a); if (x && !seen[x]) { seen[x] = 1; A.push(x); } });
    var others = [];
    (pool || []).forEach(function (o) { var x = M.norm(o); if (x && !seen[x] && others.indexOf(x) < 0) others.push(x); });
    var ni = M.noInit(n), i;
    for (i = 0; i < A.length; i++) if (A[i] === n || (ni.indexOf(' ') > 0 && M.noInit(A[i]) === ni)) return { ok: true, how: 'exact' };
    // surname alone ("lincoln"), when no other item ends in the same word
    if (n.indexOf(' ') < 0 && n.length >= 3 && !/^\d+$/.test(n)) {
      var hit = A.some(function (a) { var w = a.split(' '); return w.length > 1 && w[w.length - 1] === n; });
      if (hit) {
        var clash = others.some(function (o) { var w = o.split(' '); return w[w.length - 1] === n || o === n; });
        return clash ? { ok: false, ambiguous: true } : { ok: true, how: 'surname' };
      }
    }
    // a small misspelling of a longer answer (never for numbers)
    if (!/\d/.test(n)) for (i = 0; i < A.length; i++) {
      var a = A[i]; if (a.length < 5 || /\d/.test(a)) continue;
      var lim = a.length >= 10 ? 2 : 1, d = M.lev(n, a);
      if (d <= lim && !others.some(function (o) { return M.lev(n, o) <= d; })) return { ok: true, how: 'spelling' };
    }
    return { ok: false };
  };
  // the spellings that count for item.field: the value itself plus `accept` (a list for the main field, or {field: [...]})
  // a field the list marks as never asked for this item (noquiz: [field, ...]; e.g. a disputed capital)
  M.noquiz = function (item, k) { return !!(item && item.noquiz && [].concat(item.noquiz).map(String).indexOf(String(k)) >= 0); };
  M.usable = function (p, item) { return !M.noquiz(item, p.ask) && !(p.from || []).some(function (k) { return M.noquiz(item, k); }); };
  M.answersFor = function (item, field, main) {
    var out = [item[field]], acc = item.accept;
    if (acc) {
      if (Array.isArray(acc)) { if (field === main) out = out.concat(acc); }
      else if (acc[field]) out = out.concat(acc[field]);
    }
    return out.filter(function (x) { return x != null && x !== ''; }).map(String);
  };

  /* YAML 1.1 reads a bare key like n, y, no or on as true/false; Hugo then stores the item keys as "false"/"true".
     Field references are made into strings so they line up with the item keys either way. */
  M.normList = function (L) {
    var S = function (k) { return k == null ? k : String(k); };
    (L.fields || []).forEach(function (f) { f.key = S(f.key); });
    if (L.show) L.show = L.show.map(S);
    (L.prompts || []).forEach(function (p) { p.ask = S(p.ask); p.from = (p.from || []).map(S); });
    if (L.main != null) L.main = S(L.main);
    L.items = (L.items || []).filter(function (it) { return it && typeof it === 'object'; });
    return L;
  };

  /* ---------------- chunks ---------------- */
  // Items are learned in chunks of 3 to 6 (the mind holds about four things at once; Miller 1956, Cowan 2001).
  // Neighboring items with the same `chunk` label form a chunk; a group bigger than 6 is split into balanced parts
  // of about 5; a single leftover item joins its neighbor. Lists without labels are split the same way.
  M.MAXC = 6; M.AIM = 5;
  M.chunks = function (items) {
    var n = items.length, groups = [], i;
    var labelled = items.some(function (it) { return it && it.chunk; });
    if (labelled) {
      for (i = 0; i < n; i++) {
        var lab = items[i].chunk || '';
        var g = groups[groups.length - 1];
        if (g && g.label === lab) g.to = i + 1; else groups.push({ from: i, to: i + 1, label: lab });
      }
      // merge one-item groups into a neighbor
      for (i = 0; i < groups.length; i++) {
        if (groups[i].to - groups[i].from > 1 || groups.length < 2) continue;
        if (i > 0) { groups[i - 1].to = groups[i].to; groups[i - 1].label = groups[i - 1].label + ' · ' + groups[i].label; }
        else { groups[1].from = groups[0].from; groups[1].label = groups[0].label + ' · ' + groups[1].label; }
        groups.splice(i, 1); i--;
      }
    } else groups.push({ from: 0, to: n, label: '' });
    var out = [];
    groups.forEach(function (g) {
      var size = g.to - g.from, parts = size > M.MAXC ? Math.ceil(size / M.AIM) : 1;
      var base = Math.floor(size / parts), extra = size % parts, at = g.from;
      for (var p = 0; p < parts; p++) {
        var len = base + (p < extra ? 1 : 0);
        out.push({ from: at, to: at + len, label: g.label ? (parts > 1 ? g.label + ' (' + (p + 1) + ' of ' + parts + ')' : g.label) : '' });
        at += len;
      }
    });
    out.forEach(function (c, k) { c.i = k; if (!c.label) c.label = 'Items ' + (c.from + 1) + '–' + c.to; });
    return out;
  };

  /* ---------------- dates and the 1-3-7-21 schedule ---------------- */
  function pad(x) { return (x < 10 ? '0' : '') + x; }
  M.ymd = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  M.parse = function (s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  M.today = function () { return M.ymd(new Date()); };
  M.addDays = function (s, k) { var d = M.parse(s); d.setDate(d.getDate() + k); return M.ymd(d); };
  M.diff = function (a, b) { return Math.round((M.parse(b) - M.parse(a)) / 864e5); };   // days from a to b
  M.OFF = [1, 3, 7, 21];          // reviews on day 1, 3, 7 and 21 after learning (the infographic's schedule)
  M.KEEP = [30, 60, 120];         // then less often as it sticks, like the memory-work box's monthly tabs
  // a chunk's state: {s: reviews passed, a: day learned (anchor), d: next due day, n: reviews done}
  M.learn = function (today) { return { s: 0, a: today, d: M.addDays(today, M.OFF[0]), n: 0 }; };
  M.review = function (st, ok, today) {
    if (!st) return M.learn(today);
    if (!ok) return { s: 0, a: today, d: M.addDays(today, M.OFF[0]), n: (st.n || 0) + 1, miss: (st.miss || 0) + 1 };  // a miss starts it over: back tomorrow
    var s = st.s + 1, d;
    if (s < M.OFF.length) { d = M.addDays(st.a, M.OFF[s]); if (d <= today) d = M.addDays(today, 1); }
    else d = M.addDays(today, M.KEEP[Math.min(s - M.OFF.length, M.KEEP.length - 1)]);
    return { s: s, a: st.a, d: d, n: (st.n || 0) + 1, miss: st.miss || 0 };
  };
  M.isDue = function (st, today) { return !!st && st.d <= today; };
  M.stageName = function (st) {
    if (!st) return 'new';
    if (st.s >= M.OFF.length) return 'kept';
    return 'day ' + M.OFF[st.s];
  };
  // the planned review days for a chunk learned on `a` (for the schedule view)
  M.plan = function (a) { return M.OFF.map(function (k) { return { day: k, date: M.addDays(a, k) }; }); };

  /* ---------------- seeded shuffle ---------------- */
  M.hash = function (str) {       // xmur3
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
  M.rng = function (seed) {       // mulberry32
    var a = typeof seed === 'number' ? seed >>> 0 : M.hash(String(seed));
    return function () {
      a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  M.shuffle = function (arr, seed) {
    var a = arr.slice(), r = typeof seed === 'function' ? seed : M.rng(seed);
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  M.newSeed = function () {
    var c = 'abcdefghjkmnpqrstuvwxyz23456789', s = '', r = Math.random;
    try { var u = new Uint32Array(6); crypto.getRandomValues(u); r = null; for (var i = 0; i < 6; i++) s += c[u[i] % c.length]; return s; } catch (e) { }
    for (var k = 0; k < 6; k++) s += c[Math.floor(r() * c.length)];
    return s;
  };

  /* ---------------- cards ---------------- */
  M.SUITS = ['S', 'H', 'D', 'C'];
  M.RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  M.GLYPH = { S: '♠', H: '♥', D: '♦', C: '♣' };
  M.SUITNAME = { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' };
  M.RANKNAME = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' };
  M.sortedDeck = function () { var d = []; M.SUITS.forEach(function (s) { M.RANKS.forEach(function (r) { d.push(r + s); }); }); return d; };
  M.deal = function (seed, n) { return M.shuffle(M.sortedDeck(), 'deck:' + seed).slice(0, n || 52); };
  M.cardName = function (c) { var r = c.slice(0, -1), s = c.slice(-1); return (M.RANKNAME[r] || r) + ' of ' + M.SUITNAME[s]; };
  // "KH 7s 10d, t♣" -> ['KH','7S','10D','10C'];  bad text -> {bad: '...'}
  M.parseCards = function (txt) {
    var s = String(txt || '').toUpperCase().replace(/♠/g, 'S').replace(/♥/g, 'H').replace(/♦/g, 'D').replace(/♣/g, 'C');
    var out = [], re = /(10|[2-9TJQKA1])\s*([SHDC])/g, m, last = 0, rest = '';
    while ((m = re.exec(s))) {
      rest += s.slice(last, m.index); last = re.lastIndex;
      var r = m[1] === 'T' || m[1] === '1' ? '10' : m[1];
      out.push(r + m[2]);
    }
    rest += s.slice(last);
    if (/[^\s,;.\-]/.test(rest)) return { cards: out, bad: rest.replace(/[\s,;.\-]+/g, ' ').trim() };
    return { cards: out };
  };
  // score a recalled order against the target: cards right until the first mistake, and right in place overall
  M.score = function (target, answer) {
    var first = -1, total = 0;
    for (var i = 0; i < target.length; i++) {
      var ok = answer[i] === target[i];
      if (ok) total++; else if (first < 0) first = i;
    }
    return { first: first, until: first < 0 ? target.length : first, total: total, of: target.length, perfect: first < 0 };
  };

  /* ---------------- digits ---------------- */
  // typed digits against the true ones: index of the first wrong digit (-1 when all typed are right)
  M.digitCheck = function (truth, typed) {
    typed = String(typed).replace(/\D/g, '');
    for (var i = 0; i < typed.length; i++) if (typed[i] !== truth[i]) return { ok: false, at: i, right: i };
    return { ok: true, at: -1, right: typed.length };
  };
  M.groups = function (s, k) { var out = []; for (var i = 0; i < s.length; i += k) out.push(s.slice(i, i + k)); return out; };

  /* ---------------- Major System pegs (our own words; sounds, not letters: 0 s/z, 1 t/d, 2 n, 3 m, 4 r, 5 l,
     6 j/sh/ch/soft g, 7 k/hard g, 8 f/v, 9 p/b; vowels and w, h, y are free; silent letters don't count) ---------------- */
  var PEG = ('sauce seed sun swim zero sail sash sock sofa soap toes toad tin dome tire tail dish duck dove tub ' +
    'nose net onion gnome winner nail nacho neck knife knob mouse mat moon mime mower mule match mug movie map ' +
    'rose rat rain ram rower roll arch rock roof rope lace lid lion lime lyre lily leash lock leaf lip ' +
    'cheese sheet chain jam chair shell judge chalk chef ship goose cat coin comb car coal cage cake cave cub ' +
    'vase foot fan foam fire file fish fig fife fob bus bat bone beam bear bell bush book beehive puppy').split(' ');
  var ONE = 'zoo tie knee home hair owl shoe cow ivy bee'.split(' ');
  M.PEG = PEG; M.ONE = ONE;
  // words for a chunk of digits: one word per pair, and a single-digit word for an odd one left over
  M.majorWords = function (chunk) {
    var out = [];
    for (var i = 0; i + 1 < chunk.length; i += 2) out.push(PEG[+chunk.slice(i, i + 2)]);
    if (chunk.length % 2) out.push(ONE[+chunk[chunk.length - 1]]);
    return out;
  };

  /* ---------------- storage (trb-memory-v1; profiles swap trb-* keys) ---------------- */
  var KEY = 'trb-memory-v1', mem = null;
  M.load = function () {
    var o = null;
    try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { o = mem; }
    if (!o || typeof o !== 'object') o = {};
    o.v = 1; o.lists = o.lists || {}; o.best = o.best || {};
    return o;
  };
  M.save = function (o) { mem = o; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } };
  M.listState = function (o, slug) { var L = o.lists[slug] = o.lists[slug] || {}; L.c = L.c || {}; L.best = L.best || {}; return L; };
  // keep the better of two results; lower is better when `low` (times)
  M.better = function (o, key, val, low) {
    var b = o.best[key];
    if (b == null || (low ? val < b : val > b)) { o.best[key] = val; return true; }
    return false;
  };
  M.fmtTime = function (ms) { var s = Math.round(ms / 100) / 10, m = Math.floor(s / 60); s = (s - m * 60).toFixed(1); return m ? m + ':' + (s < 10 ? '0' : '') + s : s + 's'; };
  return M;
});
