/* Phonics Practice (Teddy Rook Book): the decodability checker.
   Splits a word into sound units (graphemes) using only the units and rules taught up to a step,
   and says whether a child at that step can sound it out. Used by the practice pages (to show the
   sound boxes) and by the tests in scripts/phonics/ (every sentence and story must pass).
   It is deliberately strict: a word it can't be sure of is "not decodable yet". */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PhonicsDecode = factory();
})(this, function () {
  'use strict';
  var SHORT = { a: 1, e: 1, i: 1, o: 1, u: 1 };
  var SPLIT_C = { b: 1, d: 1, f: 1, k: 1, l: 1, m: 1, n: 1, p: 1, s: 1, t: 1, v: 1, z: 1 }; // consonants allowed inside a final-e pattern
  var MULTI = ['igh', 'sh', 'ch', 'th', 'wh', 'ck', 'ng', 'nk', 'qu', 'ff', 'll', 'ss', 'zz',
    'ai', 'ay', 'ee', 'ea', 'oa', 'ow', 'oo', 'ou', 'oi', 'oy', 'aw', 'au', 'ar', 'or', 'er', 'ir', 'ur'];
  var R_UNITS = { ar: 1, or: 1, er: 1, ir: 1, ur: 1 };
  var DOUBLE = { ff: 1, ll: 1, ss: 1, zz: 1, ck: 1, x: 1 }; // count as two consonants (they never end an open syllable)
  var ENDS = ['ing', 'ed', 'es', 's'];

  function set(a) { var o = {}; (a || []).forEach(function (x) { o[String(x).toLowerCase()] = 1; }); return o; }

  // Everything taught up to and including step index idx.
  function context(data, idx) {
    var c = { units: {}, kinds: {}, heart: {}, rules: {}, idx: idx };
    for (var i = 0; i <= idx && i < data.steps.length; i++) {
      var s = data.steps[i];
      (s.units || []).forEach(function (u) { c.units[u.id] = 1; c.kinds[u.g] = u.t; });
      (s.heart || []).forEach(function (h) { c.heart[h.w.toLowerCase()] = 1; });
      (s.rules || []).forEach(function (r) { c.rules[r] = 1; });
    }
    var k = data.check || {};
    c.exceptions = set(k.exceptions); c.owOu = set(k.owOu); c.hardG = set(k.hardG); c.names = set(data.names);
    return c;
  }

  // Which unit id a spelling needs (some spellings are taught twice, for two sounds).
  function unitId(g, word, c, isVowelY, yAlone) {
    if (g === 'y') return isVowelY ? (yAlone ? 'y-i' : 'y-e') : 'y';
    if (g === 'ow') return c.owOu[word] ? 'ow-ou' : 'ow';
    if (g === 'oo') return 'oo';
    return g;
  }
  function isVowelTok(t) { return t.t === 'v'; }
  function isConsTok(t) { return t.t === 'c'; }

  // All the ways to split a word into available units (split-e and longer units first).
  function parses(word, c) {
    var out = [], n = word.length;
    function rec(p, acc) {
      if (out.length > 40) return;
      if (p === n) { out.push(acc.slice()); return; }
      var ch = word[p];
      // final e:  vowel + one consonant + e (+ s)
      if (SHORT[ch] && c.units[ch + '_e'] && p + 2 < n && SPLIT_C[word[p + 1]] && word[p + 2] === 'e' && (p + 3 === n || (p + 4 === n && word[p + 3] === 's'))) {
        acc.push({ g: ch + '_e', t: 'v', at: p }, { g: word[p + 1], t: 'c', at: p + 1 }, { g: 'e', t: 's', at: p + 2 });
        rec(p + 3, acc); acc.length -= 3;
      }
      for (var m = 0; m < MULTI.length; m++) {
        var g = MULTI[m];
        if (word.substr(p, g.length) !== g) continue;
        var kind = c.kinds[g]; if (!kind) continue;
        acc.push({ g: g, t: kind === 'd' ? 'c' : kind, dbl: !!DOUBLE[g], at: p });
        rec(p + g.length, acc); acc.length--;
      }
      if (ch === 'q') return;
      if (ch === 'y') {
        var vy = p === n - 1 && p > 0;
        acc.push({ g: 'y', t: vy ? 'v' : 'c', at: p }); rec(p + 1, acc); acc.length--;
        return;
      }
      if (c.kinds[ch]) { acc.push({ g: ch, t: SHORT[ch] ? 'v' : 'c', dbl: ch === 'x', at: p }); rec(p + 1, acc); acc.length--; }
    }
    rec(0, []);
    return out;
  }

  // Is this split something a child at this step reads correctly? Returns '' or the reason it isn't.
  function judge(toks, word, c) {
    var vows = toks.filter(isVowelTok), n = toks.length;
    if (!vows.length) return 'no vowel sound';
    for (var i = 0; i < n; i++) {
      var t = toks[i], prev = toks[i - 1], next = toks[i + 1], after = toks[i + 2];
      if (t.t === 's') continue;
      var vy = t.g === 'y' && t.t === 'v';
      if (vy && (!prev || !isConsTok(prev))) return 'y after a vowel';
      var id = unitId(t.g, word, c, vy, vows.length === 1);
      if (!c.units[id]) return 'uses "' + t.g + '" (' + id + '), not taught yet';
      var g = t.g;
      if (isVowelTok(t)) {
        if (next && isVowelTok(next)) return 'two vowel sounds side by side';
        if (SHORT[g] && !next) return 'ends in an open vowel';
        if (next && next.g === 'r' && !R_UNITS[g] && !(after && isVowelTok(after))) return 'vowel + r';
        if (g === 'a' && next && (next.g === 'll' || (next.g === 'l' && after && isConsTok(after)))) return 'a + l (as in ball)';
        if (g === 'o' && next && (next.g === 'll' || (next.g === 'l' && after && (after.g === 'd' || after.g === 't')))) return 'o + ld/lt/ll (as in cold)';
        if (g === 'i' && next && (next.g === 'n' || next.g === 'l') && after && after.g === 'd') return 'i + nd/ld (as in find)';
        if (prev && (prev.g === 'w' || prev.g === 'qu' || prev.g === 'wh')) {
          if (g === 'a' && next && /^(s|sh|t|n|l|ll|tc|ch)$/.test(next.g)) return 'w + a (as in want)';
          if (g === 'ar' || g === 'or') return 'w + ' + g + ' (as in warm, work)';
        }
        if (SHORT[g] && vows.length > 1 && next && after && isConsTok(next) && !next.dbl && isVowelTok(after)) return 'vowel-consonant-vowel (long or short?)';
      } else if (t.t === 'c') {
        if ((g === 'c' || (g === 'g' && !c.hardG[word])) && next && next.t !== 's' && /^[eiy]/.test(next.g)) return 'soft ' + g;
        if (/^(w|h|y|j|qu|wh)$/.test(g) && !(next && isVowelTok(next))) return '"' + g + '" not before a vowel';
        if (next && isConsTok(next)) {
          var pair = g + '+' + next.g;
          if (/^(p\+h|g\+h|k\+n|w\+r|t\+ch|t\+sh)$/.test(pair)) return 'letters ' + g + next.g;
          if (pair === 'g+n' && (i === 0 || i + 2 === n)) return 'letters gn';
          if (pair === 'm+b' && i + 2 === n) return 'letters mb';
          if (!c.rules.blends) return 'consonant blend (' + g + next.g + ')';
        }
        if (g === 'x' && i === 0) return 'x at the start';
        if ((g === 'ck' || DOUBLE[g]) && g !== 'x' && !(prev && SHORT[prev.g])) return g + ' not after a short vowel';
        if ((g === 'ng' || g === 'nk') && !(prev && isVowelTok(prev))) return g + ' not after a vowel';
      }
    }
    if (vows.length > 1 && !c.rules.multi) return 'more than one syllable';
    return '';
  }

  function seg(word, c) {
    var ps = parses(word, c), why = 'letters not taught yet';
    for (var i = 0; i < ps.length; i++) { var r = judge(ps[i], word, c); if (!r) return { units: ps[i] }; why = r; }
    return { why: why };
  }

  // A base word plus an ending (-s, -es, -ed, -ing), once endings are taught.
  function withEnding(word, c) {
    for (var k = 0; k < ENDS.length; k++) {
      var e = ENDS[k];
      if (word.length <= e.length + 1 || word.slice(-e.length) !== e) continue;
      var b = word.slice(0, -e.length), cands = [], last = b[b.length - 1];
      if (e === 'ing' || e === 'ed') {
        if (SHORT[last]) continue;
        if (last === b[b.length - 2]) { if (/(ll|ss|ff|zz)$/.test(b)) cands.push(b); cands.push(b.slice(0, -1)); }
        else { cands.push(b + 'e', b); }
      } else if (e === 'es') { if (/(s|x|z|sh|ch)$/.test(b)) cands.push(b); }
      else if (!/(s|x|z|sh|ch)$/.test(b)) cands.push(b);
      for (var j = 0; j < cands.length; j++) {
        var base = cands[j];
        if (c.heart[base]) return { units: [{ g: base, t: 'h', at: 0 }, { g: e, t: 'end' }], base: base, end: e, heart: true };
        if (c.exceptions[base]) continue;
        var r = seg(base, c);
        if (r.units) return { units: r.units.concat([{ g: e, t: 'end' }]), base: base, end: e };
      }
    }
    return null;
  }

  function clean(w) { return String(w).replace(/[’]/g, "'").replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, ''); }

  // check(word, ctx) -> { ok, how: 'heart'|'decode'|'name', units, why }
  function check(raw, c, opts) {
    var w0 = clean(raw), w = w0.toLowerCase();
    if (!w) return { ok: true, how: 'none', units: [] };
    if (opts && opts.name) {
      if (c.heart[w]) return { ok: true, how: 'heart' };
    } else if (c.heart[w]) return { ok: true, how: 'heart' };
    if (/[^a-z]/.test(w)) return { ok: false, why: 'apostrophe or odd letters' };
    if (c.exceptions[w]) return { ok: false, why: 'an irregular word that has not been taught as a heart word' };
    if (c.rules.endings) { var e = withEnding(w, c); if (e) { e.ok = true; e.how = 'decode'; return e; } }
    var r = seg(w, c);
    if (r.units) return { ok: true, how: opts && opts.name ? 'name' : 'decode', units: r.units };
    return { ok: false, why: r.why };
  }

  // Words of a sentence or story line. A capitalized word in data.names is a name.
  function words(text) { return (String(text).match(/[A-Za-z][A-Za-z'’]*/g) || []); }
  function checkText(text, c) {
    var bad = [];
    words(text).forEach(function (w, i) {
      var isName = /^[A-Z]/.test(w) && c.names[w.toLowerCase()] && w !== 'I';
      var r = check(w, c, { name: isName });
      if (!r.ok) bad.push({ word: w, why: r.why });
    });
    return bad;
  }

  // Syllable breaks for display: index of tokens before which a small gap goes.
  function breaks(toks) {
    var out = {}, vi = [];
    toks.forEach(function (t, i) { if (t.t === 'v') vi.push(i); });
    for (var k = 0; k + 1 < vi.length; k++) {
      var a = vi[k], b = vi[k + 1], cons = [];
      for (var i = a + 1; i < b; i++) if (toks[i].t === 'c') cons.push(i);
      if (cons.length >= 2) out[cons[1]] = 1;
      else if (cons.length === 1) out[toks[cons[0]].dbl ? cons[0] + 1 : cons[0]] = 1;
      else out[b] = 1;
    }
    toks.forEach(function (t, i) { if (t.t === 'end') out[i] = 1; });
    return out;
  }

  return { context: context, check: check, checkText: checkText, words: words, breaks: breaks, clean: clean };
});
