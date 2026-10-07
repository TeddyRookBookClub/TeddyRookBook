/* Backgammon rules and a simple evaluator. A position is always written from the side of the player about to move ("me"):
   pts[i] > 0 are my checkers on point i+1 (I move toward point 1 and bear off below it), pts[i] < 0 are the opponent's.
   A step is {f, t, d, hit}: f = 24 means from the bar, t = -1 means borne off. */
(function (root) {
  'use strict';
  function start() { var p = []; for (var i = 0; i < 24; i++) p.push(0); p[23] = 2; p[12] = 5; p[7] = 3; p[5] = 5; p[0] = -2; p[11] = -5; p[16] = -3; p[18] = -5; return { pts: p, bar: 0, obar: 0, off: 0, ooff: 0 }; }
  function flip(s) { var p = []; for (var i = 0; i < 24; i++) p.push(-s.pts[23 - i] || 0); return { pts: p, bar: s.obar, obar: s.bar, off: s.ooff, ooff: s.off }; }
  function key(s) { return s.pts.join(',') + '|' + s.bar + '|' + s.obar + '|' + s.off; }
  function canOff(s) { if (s.bar) return false; for (var i = 6; i < 24; i++) if (s.pts[i] > 0) return false; return true; }
  function stepsFor(s, d) { // every single-checker move with one die
    var out = [], p = s.pts, i, t;
    if (s.bar) { t = 24 - d; if (p[t] >= -1) out.push({ f: 24, t: t, d: d, hit: p[t] === -1 }); return out; }
    var off = canOff(s), hi = -1; if (off) for (i = 5; i >= 0; i--) if (p[i] > 0) { hi = i; break; }
    for (i = 0; i < 24; i++) {
      if (p[i] <= 0) continue; t = i - d;
      if (t >= 0) { if (p[t] >= -1) out.push({ f: i, t: t, d: d, hit: p[t] === -1 }); }
      else if (off && (t === -1 || i === hi)) out.push({ f: i, t: -1, d: d, hit: false });
    }
    return out;
  }
  function apply(s, st) {
    var n = { pts: s.pts.slice(), bar: s.bar, obar: s.obar, off: s.off, ooff: s.ooff };
    if (st.f === 24) n.bar--; else n.pts[st.f]--;
    if (st.t === -1) n.off++; else { if (n.pts[st.t] === -1) { n.pts[st.t] = 0; n.obar++; } n.pts[st.t]++; }
    return n;
  }
  // All complete turns for a roll: you must use as many dice as you can, and the larger die if only one can be played.
  function turns(s, d1, d2) {
    var dice = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2], all = [], seen = {}, max = 0;
    function rec(cur, left, steps) {
      var moved = false, tried = {};
      left.forEach(function (d, i) {
        if (tried[d]) return; tried[d] = 1;
        stepsFor(cur, d).forEach(function (st) { moved = true; var rest = left.slice(); rest.splice(i, 1); rec(apply(cur, st), rest, steps.concat([st])); });
      });
      if (!moved || !left.length) { if (steps.length > max) max = steps.length; var k = steps.length + ':' + key(cur) ; if (!seen[k]) { seen[k] = 1; all.push({ steps: steps, s: cur }); } }
    }
    rec(s, dice, []);
    all = all.filter(function (x) { return x.steps.length === max; });
    if (max === 1 && d1 !== d2) { var big = Math.max(d1, d2); if (all.some(function (x) { return x.steps[0].d === big; })) all = all.filter(function (x) { return x.steps[0].d === big; }); }
    return all;
  }
  function pips(s) { var a = s.bar * 25, b = s.obar * 25, i; for (i = 0; i < 24; i++) { if (s.pts[i] > 0) a += s.pts[i] * (i + 1); else if (s.pts[i] < 0) b += -s.pts[i] * (24 - i); } return [a, b]; }
  function contact(s) { if (s.bar || s.obar) return true; var lo = -1, i; for (i = 0; i < 24; i++) if (s.pts[i] < 0) { lo = i; break; } if (lo < 0) return false; for (i = 23; i > lo; i--) if (s.pts[i] > 0) return true; return false; }
  // How many of the 36 rolls let the opponent hit my blot on point index i (blocks on the way are checked for two-dice shots).
  function shots(s, i) {
    var p = s.pts, hit = 0, a, b, j, src = [];
    for (j = 0; j < i; j++) if (p[j] < 0) src.push(j);
    if (s.obar) src = [-1];                       // a checker on the bar must enter first
    for (a = 1; a <= 6; a++) for (b = 1; b <= 6; b++) {
      var ok = false;
      for (var k = 0; k < src.length && !ok; k++) {
        j = src[k]; var dist = i - j;
        if (a === dist || b === dist) ok = true;
        else if (a + b === dist && ((p[j + a] !== undefined && p[j + a] < 2) || (p[j + b] !== undefined && p[j + b] < 2))) ok = true;
        else if (a === b && (dist === 3 * a || dist === 4 * a)) { ok = true; for (var m = 1; m * a < dist; m++) if (p[j + m * a] >= 2) ok = false; }
      }
      if (ok) hit++;
    }
    return hit;
  }
  // Score for me after I have moved (the opponent rolls next). Bigger is better. Roughly in pips.
  function evaluate(s) {
    var pp = pips(s), sc = pp[1] - pp[0], p = s.pts, i;
    if (s.off === 15) return 1000;
    // Every play of the same dice moves the same number of pips, so these terms decide which checkers to move:
    // bring men home, bear them off, and run for home once the opponent is close to finishing.
    var outside = s.bar, back = 0, oppHome = !s.obar, oppLate;
    for (i = 6; i < 24; i++) if (p[i] > 0) { outside += p[i]; if (i >= 18) back += p[i]; }
    for (i = 0; i < 18; i++) if (p[i] < 0) { oppHome = false; break; }
    oppLate = Math.max(0, Math.min(1, (130 - pp[1]) / 90));
    sc += s.off * 3 - outside * (0.4 + 1.2 * oppLate) - back * (pp[0] < pp[1] ? 1.5 : 0.3) - back * 2.5 * oppLate;
    if (oppHome && s.off === 0) sc -= outside * 4 + back * 4;      // the opponent is bearing off: avoid the double loss
    if (!contact(s)) return sc - 4;              // a pure race: only the count matters (and it is the opponent's turn: about 8 pips)
    var closed = 0; for (i = 0; i < 6; i++) if (p[i] >= 2) closed++;
    for (i = 0; i < 24; i++) {
      if (p[i] === 1) { var pr = shots(s, i) / 36; sc -= pr * ((24 - i) * 1.2 + 8 + closedOpp(s) * 4); }
      else if (p[i] >= 2) { sc += i < 6 ? 5 : i < 12 ? 3.5 : 1.5; if (i > 0 && p[i - 1] >= 2) sc += 2.5; if (p[i] > 4) sc -= (p[i] - 4) * 1.5; }
    }
    sc += s.obar * (6 + closed * 3.5);
    if (p[23] > 0) sc -= p[23] * 2.5; if (p[22] > 0) sc -= p[22];   // stragglers far back
    return sc - 10;
  }
  function closedOpp(s) { var n = 0; for (var i = 18; i < 24; i++) if (s.pts[i] <= -2) n++; return n; }
  function winChance(score) { return 1 / (1 + Math.exp(-score / 24)); }
  // Rank every complete turn for a roll, best first.
  function rank(s, d1, d2) { var ts = turns(s, d1, d2); ts.forEach(function (x) { x.sc = evaluate(x.s); x.w = winChance(x.sc); }); ts.sort(function (a, b) { return b.sc - a.sc; }); return ts; }
  // Chance (out of 36 rolls) that the opponent, rolling now, can hit at least one of my checkers. Exact.
  function riskNow(s) {
    var f = flip(s), n = 0, a, b;
    for (a = 1; a <= 6; a++) for (b = a; b <= 6; b++) { if (turns(f, a, b).some(function (x) { return x.steps.some(function (st) { return st.hit; }); })) n += a === b ? 1 : 2; }
    return n;
  }
  var api = { start: start, flip: flip, turns: turns, apply: apply, pips: pips, evaluate: evaluate, winChance: winChance, rank: rank, riskNow: riskNow, key: key, contact: contact };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TabulaEngine = api;
})(typeof window !== 'undefined' ? window : this);
