/* Memory Skills (Memory Ladder, course key memsk): problem generators for all 40 topics.
   Shapes by level:
     level 1  true or false, or a question with three choices; small numbers (a review date in the same month, a short chunk count)
     level 2  four choices, "which statement is true?", dates that cross a month, savings and box counts
     level 3  "which statement is false?", "choose all that are true", plans that differ in several habits, longer counts
   Computed families (dates, savings, chunk counts, box tabs, acronyms, palace walks, plan comparisons, mixed or blocked
   sequences) make most of the variety; each topic also has its own bank of statements and scenarios.
   Shared helpers: MathLadder.memgen (also used by memsys.js). No "$" anywhere: these are text problems. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;

  // ------------------------------------------------------------------ helpers (shared with memsys.js as ML.memgen)
  var H = ML.memgen = ML.memgen || {};
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { var k = String(x); if (!s[k]) { s[k] = 1; o.push(x); } }); return o; }
  function mc(q, right, wrongs, steps, o) {
    o = o || {};
    wrongs = uniq(wrongs.filter(function (w) { return String(w) !== String(right); }));
    var p = { q: q, a: { t: 'mc', choices: [right].concat(wrongs), v: 0 }, steps: steps && steps.length ? steps : ['The answer is: ' + right + '.'] };
    if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.keep) p.a.keep = true;
    return p;
  }
  function tf(stmt, val, why, o) {
    var p = { q: 'True or false? ' + stmt, a: { t: 'tf', v: !!val }, steps: [(val ? 'True. ' : 'False. ') + (why || '')] };
    if (o && o.viz) p.viz = o.viz; return p;
  }
  function num(q, v, steps, o) { var p = { q: q, a: { t: 'num', v: String(v), form: 'int' }, steps: steps }; if (o && o.viz) p.viz = o.viz; if (o && o.hint) p.hint = o.hint; return p; }
  function text(q, v, steps, o) { var p = { q: q, a: { t: 'text', v: v, strict: true }, steps: steps }; if (o && o.viz) p.viz = o.viz; if (o && o.hint) p.hint = o.hint; return p; }
  function pickV(R, x) { return Array.isArray(x) ? R.pick(x) : x; }
  function samp(R, a, k) { return R.sample(a, Math.max(0, Math.min(k, a.length))); }
  function lvN(ctx) { return ctx && ctx.level || 1; }
  function ceilDiv(a, b) { return Math.floor((a + b - 1) / b); }
  H.samp = samp; H.mc = mc; H.tf = tf; H.num = num; H.text = text; H.uniq = uniq; H.ceilDiv = ceilDiv;

  /* A topic bank D = { facts: [[statement, true|false, why]], items: [{ q, r: [right answers], w: [wrong answers], why }] }
     bankProblem(R, lv, D): level 1 true/false (a quarter) or three choices; level 2 four choices or "which is true";
     level 3 four choices, "which is false" or "choose all that are true". */
  function itemMc(R, it, k) {
    var r = pickV(R, it.r), w = R.sample(it.w, Math.min(k - 1, it.w.length));
    return mc(pickV(R, it.q), r, w, [it.why || ('The answer is: ' + r + '.')]);
  }
  function whichOne(R, facts, wantTrue, k) {
    var T = facts.filter(function (f) { return f[1]; }), F = facts.filter(function (f) { return !f[1]; });
    var odd = wantTrue ? T : F, rest = wantTrue ? F : T;
    if (!odd.length || rest.length < k - 1) return null;
    var o = R.pick(odd), others = R.sample(rest, k - 1);
    return mc(wantTrue ? 'Which statement is <b>true</b>?' : 'Which statement is <b>false</b>?', o[0], others.map(function (f) { return f[0]; }),
      [o[0] + ' ' + (wantTrue ? 'True' : 'False') + (o[2] ? ': ' + o[2] : '.')].concat(others.map(function (f) { return f[0] + ' ' + (f[1] ? 'True.' : 'False.'); })));
  }
  function chooseAll(R, facts) {
    var T = facts.filter(function (f) { return f[1]; }), F = facts.filter(function (f) { return !f[1]; });
    if (T.length < 2 || F.length < 2) return null;
    var nT = R.int(2, Math.min(3, T.length)), nF = Math.min(F.length, 5 - nT);
    var pick = R.sample(T, nT).concat(R.sample(F, nF)), ord = R.shuffle(pick.map(function (_, i) { return i; }));
    var ch = ord.map(function (i) { return pick[i][0]; }), v = [];
    ord.forEach(function (i, j) { if (i < nT) v.push(j); });
    return { q: 'Choose <b>all</b> the statements that are true.', a: { t: 'mc', choices: ch, v: v.sort(function (a, b) { return a - b; }) },
      steps: ord.map(function (i) { var f = pick[i]; return f[0] + ' ' + (f[1] ? 'True.' : 'False.') + (f[2] && !f[1] ? ' ' + f[2] : ''); }), hint: 'Decide about each statement on its own.' };
  }
  function bankProblem(R, lv, D) {
    var facts = D.facts || [], items = D.items || [], r = R.next(), p = null;
    if (lv === 1) {
      if (facts.length && (r < 0.25 || !items.length)) { var f = R.pick(facts); return tf(f[0], f[1], f[2]); }
      return itemMc(R, R.pick(items), 3);
    }
    if (lv === 2) {
      if (r < 0.35 && facts.length) p = whichOne(R, facts, true, 3);
      return p || (items.length ? itemMc(R, R.pick(items), 4) : whichOne(R, facts, true, 3));
    }
    if (r < 0.25 && facts.length) p = whichOne(R, facts, false, 4);
    else if (r < 0.5 && facts.length) p = chooseAll(R, facts);
    return p || (items.length ? itemMc(R, R.pick(items), 4) : whichOne(R, facts, false, 3));
  }
  H.bankProblem = bankProblem; H.whichOne = whichOne; H.chooseAll = chooseAll; H.itemMc = itemMc;

  // a topic = a bank plus computed families; share = how often a computed family is used (0 to 1)
  function T(id, D, fams, share) {
    G(id, function (R, ctx) {
      var lv = lvN(ctx);
      if (fams && fams.length && (R.next() < (share === undefined ? 0.6 : share) || !(D && ((D.items && D.items.length) || (D.facts && D.facts.length))))) {
        var p = R.pick(fams)(R, lv); if (p) return p;
      }
      return bankProblem(R, lv, D);
    });
  }
  H.T = T;

  // ------------------------------------------------------------------ dates
  var MONTHS = [['January', 31], ['February', 28], ['March', 31], ['April', 30], ['May', 31], ['June', 30], ['July', 31], ['August', 31], ['September', 30], ['October', 31], ['November', 30], ['December', 31]];
  function addDays(m, d, n) { d += n; while (d > MONTHS[m][1]) { d -= MONTHS[m][1]; m = (m + 1) % 12; } return [m, d]; }
  function ds(md) { return MONTHS[md[0]][0] + ' ' + md[1]; }
  var SCHED = [1, 3, 7, 21];
  var THINGS = ['a poem', 'the Great Lakes', 'a list of spelling words', 'the planets in order', 'a Bible verse', 'the times tables for 7', 'ten Spanish words', 'the parts of a cell', 'the first ten presidents', 'the bones of the arm', 'the colors of the rainbow', 'a song in Latin', 'the seven continents', 'the parts of speech'];
  function calViz(m, d0, marks, ask, quiet) {
    // a calendar of the learning month (start weekday fixed by the month and a seed-free rule: the 1st falls on (m * 3) % 7)
    var o = { start: (m * 3) % 7, len: MONTHS[m][1], title: MONTHS[m][0], marks: marks, quiet: !!quiet };
    if (ask) o.ask = ask; return { name: 'mm-calendar', opts: o };
  }
  H.MONTHS = MONTHS; H.addDays = addDays; H.ds = ds;
  function famReviewDate(R, lv) {
    var thing = R.pick(THINGS), m = R.int(0, 11), dayN, d0;
    if (lv === 1) { dayN = R.pick([1, 3, 7]); d0 = R.int(1, MONTHS[m][1] - dayN); }
    else if (lv === 2) { dayN = R.pick([7, 21]); d0 = R.int(1, MONTHS[m][1]); }
    else { dayN = 21; d0 = R.int(MONTHS[m][1] - 20, MONTHS[m][1]); }
    var t = addDays(m, d0, dayN);
    var q = 'You learn ' + thing + ' on ' + MONTHS[m][0] + ' ' + d0 + '. On the 1-3-7-21 schedule, when is the <b>day ' + dayN + '</b> review?';
    var steps = ['Count from the learning day: ' + MONTHS[m][0] + ' ' + d0 + ' + ' + dayN + ' days.'];
    if (t[0] !== m) steps.push(MONTHS[m][0] + ' has ' + MONTHS[m][1] + ' days, so the count runs into ' + MONTHS[t[0]][0] + '.');
    steps.push('The review is on ' + ds(t) + '.');
    if (t[0] === m && lv === 1) return num(q + ' Give the date in ' + MONTHS[m][0] + '.', t[1], steps, { viz: calViz(m, d0, [{ d: d0, t: 'learn' }], 0, true), hint: 'Add ' + dayN + ' to the day you learned it.' });
    var wr = [ds(addDays(m, d0, dayN - 1)), ds(addDays(m, d0, dayN + 1)), ds(addDays(m, d0, dayN === 21 ? 14 : dayN + 3)), ds(addDays(m, d0, dayN === 21 ? 28 : dayN * 2))];
    return mc(q, ds(t), samp(R, uniq(wr), 3), steps);
  }
  function famAllReviews(R, lv) {
    var m = R.int(0, 11), d0 = R.int(1, lv >= 3 ? MONTHS[m][1] : MONTHS[m][1] - 21), thing = R.pick(THINGS);
    var right = SCHED.map(function (n) { return ds(addDays(m, d0, n)); });
    var w1 = [], cur = [m, d0]; SCHED.forEach(function (n) { cur = addDays(cur[0], cur[1], n); w1.push(ds(cur)); }); // adding each number to the last review
    var w2 = [1, 2, 3, 4].map(function (n) { return ds(addDays(m, d0, n)); });
    var w3 = [1, 3, 7, 14].map(function (n) { return ds(addDays(m, d0, n)); });
    var q = 'You learn ' + thing + ' on ' + ds([m, d0]) + '. Which list shows the four reviews on the 1-3-7-21 schedule?';
    return mc(q, right.join(', '), samp(R, uniq([w1.join(', '), w2.join(', '), w3.join(', ')]).filter(function (x) { return x !== right.join(', '); }), lv === 1 ? 2 : 3),
      ['Add 1, 3, 7 and 21 to the learning day, ' + ds([m, d0]) + ', every time.', 'The reviews: ' + right.join(', ') + '.']);
  }
  function famNextReview(R, lv) {
    var m = R.int(0, 11), d0 = R.int(1, MONTHS[m][1] - (lv === 1 ? 8 : 0)), done = lv === 1 ? R.int(1, 2) : R.int(1, 3);
    var who = R.pick(['Jada', 'Omar', 'Lucy', 'Ben', 'Asha', 'Theo', 'Mia', 'Sam']), thing = R.pick(THINGS);
    var did = SCHED.slice(0, done).map(function (n) { return ds(addDays(m, d0, n)); });
    var nx = SCHED[done], t = addDays(m, d0, nx);
    var q = who + ' learned ' + thing + ' on ' + ds([m, d0]) + ' and reviewed on ' + (did.length > 1 ? did.slice(0, -1).join(', ') + ' and ' + did[did.length - 1] : did[0]) + '. When is the next review?';
    var steps = ['Those reviews are day ' + SCHED.slice(0, done).join(', day ') + '.', 'Next is day ' + nx + ': ' + ds([m, d0]) + ' + ' + nx + ' = ' + ds(t) + '.'];
    var lastRev = addDays(m, d0, SCHED[done - 1]);
    var wr = [ds(addDays(lastRev[0], lastRev[1], nx)), ds(addDays(m, d0, nx + 1)), ds(addDays(m, d0, SCHED[done - 1] + 1)), ds(addDays(m, d0, nx - 1))];
    if (lv === 1 && t[0] === m) return num(q + ' Give the date in ' + MONTHS[m][0] + '.', t[1], steps, { viz: calViz(m, d0, [{ d: d0, t: 'learn' }].concat(SCHED.slice(0, done).map(function (n) { return { d: d0 + n, t: 'review' }; })), 0, false) });
    return mc(q, ds(t), samp(R, uniq(wr), 3), steps, { hint: 'Count from the day it was learned, not from the last review.' });
  }
  function famScheduleOrder(R, lv) {
    var gaps = R.pick([[1, 3, 7, 21], [1, 2, 4, 8], [2, 5, 12, 30]]), name = gaps.join('-');
    var right = gaps.join(', '), wr = [R.shuffle(gaps).join(', '), gaps.slice().reverse().join(', '), [gaps[0], gaps[0], gaps[0], gaps[0]].join(', '), [gaps[0], gaps[2], gaps[1], gaps[3]].join(', ')];
    if (lv === 1) return mc('A review schedule should have gaps that <b>grow</b>. Which order of review days (counted from learning day 0) does that?', right, samp(R, uniq(wr).filter(function (x) { return x !== right; }), 2), ['Each gap is longer than the one before: ' + right + '.']);
    var k = R.int(1, 3), steps = ['Days: ' + right + '.', 'Review number ' + (k + 1) + ' is on day ' + gaps[k] + '.'];
    return num('On the ' + name + ' schedule (days counted from the learning day), which <b>day</b> is review number ' + (k + 1) + '?', gaps[k], steps);
  }

  // ------------------------------------------------------------------ savings, box, curve
  function famSavings(R, lv) {
    var o, r, pct;
    for (var t = 0; t < 50; t++) { o = lv === 1 ? R.pick([10, 20, 40, 50]) : R.pick([12, 15, 16, 20, 24, 25, 30, 40, 45, 50, 60]); r = R.int(1, o - 1); pct = (o - r) * 100 / o; if (pct === Math.round(pct) && (lv < 3 || pct % 10)) break; }
    if (pct !== Math.round(pct)) { o = 20; r = 5; pct = 75; }
    var thing = R.pick(['a list of syllables', 'a poem', 'a set of vocabulary words', 'the state capitals of one region', 'a chart of Latin endings']);
    if (lv === 3 && R.coin()) {
      return num('Learning ' + thing + ' first took ' + o + ' minutes. Relearning it later saved ' + pct + ' percent. How many minutes did relearning take?', r,
        ['Saved: ' + pct + '% of ' + o + ' = ' + (o - r) + ' minutes.', 'Relearning took ' + o + ' − ' + (o - r) + ' = ' + r + ' minutes.']);
    }
    return num('Learning ' + thing + ' took ' + o + ' minutes. A week later, relearning it took ' + r + ' minutes. What were the savings, in percent?', pct,
      ['Time saved: ' + o + ' − ' + r + ' = ' + (o - r) + ' minutes.', (o - r) + ' ÷ ' + o + ' × 100 = ' + pct + ' percent.'], { hint: 'Savings = (first time − relearning time) ÷ first time × 100.' });
  }
  var WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], WDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function famBox(R, lv) {
    var len = R.pick([28, 29, 30, 31]), st = R.int(0, 6), kind = lv === 1 ? R.pick(['Daily', 'Odd', 'Even', 'week', 'week', 'week', 'date']) : R.pick(['Odd', 'Even', 'week', 'week', 'date']);
    var n, steps, q, tab;
    if (kind === 'Daily') { n = len; tab = 'Daily'; steps = ['A Daily card comes up every day.', len + ' days, so ' + len + ' times.']; }
    else if (kind === 'Odd') { n = Math.ceil(len / 2); tab = 'Odd'; steps = ['Odd dates: 1, 3, 5, …, ' + (len % 2 ? len : len - 1) + '.', 'That is ' + n + ' dates.']; }
    else if (kind === 'Even') { n = Math.floor(len / 2); tab = 'Even'; steps = ['Even dates: 2, 4, 6, …, ' + (len % 2 ? len - 1 : len) + '.', 'That is ' + n + ' dates.']; }
    else if (kind === 'week') {
      var w = R.int(0, 6), first = 1 + ((w - st + 7) % 7), list = []; for (var d = first; d <= len; d += 7) list.push(d);
      n = list.length; tab = WDS[w]; steps = ['The 1st is a ' + WD[st] + ', so the first ' + WD[w] + ' is the ' + ML.util.ordinal(first) + '.', WD[w] + 's: ' + list.join(', ') + '.', 'That is ' + n + ' times.'];
    } else { var dd = R.int(1, 31); n = dd <= len ? 1 : 0; tab = String(dd); steps = ['A card behind a date tab comes up once a month, on that date.', dd <= len ? 'The ' + ML.util.ordinal(dd) + ' is in this month: once.' : 'This month has only ' + len + ' days, so the ' + ML.util.ordinal(dd) + ' never comes: 0 times.']; }
    q = 'A card is behind the <b>' + tab + '</b> tab of a memory-work box. This month has ' + len + ' days' + (kind === 'week' ? ' and starts on a ' + WD[st] : '') + '. How many times will the card come up this month?';
    return num(q, n, steps, { viz: { name: 'mm-box', opts: { mark: tab, quiet: true } } });
  }
  function famBoxMove(R, lv) {
    var steps = ['Daily', 'Odd or Even', 'a day of the week', 'a date (1 to 31)'], i = R.int(0, 2);
    if (R.coin()) return mc('A card on the <b>' + steps[i] + '</b> tab is now solid. Where does it move?', steps[i + 1], steps.filter(function (_, j) { return j !== i + 1; }).slice(0, lv === 1 ? 2 : 3), ['Solid cards move back one tab, to one that comes up less often: ' + steps[i + 1] + '.']);
    var j = R.int(1, 3);
    return mc('A card behind <b>' + steps[j] + '</b> is missed at review. What should happen?', 'Move it forward to a tab that comes up more often', samp(R, ['Move it back to a tab that comes up less often', 'Leave it where it is and skip it', 'Take it out of the box'], lv === 1 ? 2 : 3), ['A missed card needs more frequent review, so it moves forward.']);
  }
  function famCurve(R, lv) {
    var pool = [1, 2, 3, 5, 7, 10, 14, 21], k = lv === 1 ? R.int(2, 3) : R.int(3, 5), rv = samp(R, pool, k).sort(function (a, b) { return a - b; });
    var viz = { name: 'mm-curve', opts: { reviews: rv, days: 28, grid: true, quiet: true } }, kind = R.int(0, lv === 1 ? 1 : 3);
    if (kind === 0) return num('The graph shows memory over 28 days with reviews. How many reviews (jumps back up) does it show?', k, ['Count the jumps of the solid line: days ' + rv.join(', ') + '.', 'That is ' + k + ' reviews.'], { viz: viz });
    if (kind === 1) return mc('On the graph, which line shows memory with <b>no</b> reviews?', 'The dashed line that drops and stays low', samp(R, ['The solid line with the jumps', 'The line at the very top', 'The bottom axis'], lv === 1 ? 2 : 3), ['The dashed line has no jumps: nothing brings it back up.'], { viz: viz });
    if (kind === 2) return mc('On the graph, on which day is the <b>first</b> review?', 'Day ' + rv[0], samp(R, uniq([0].concat(pool).filter(function (d) { return d !== rv[0]; })).map(function (d) { return d === 0 ? 'Day 0 (the learning day)' : 'Day ' + d; }), 3), ['The first jump back to the top is on day ' + rv[0] + '.'], { viz: viz });
    var a = R.int(0, k - 2);
    return mc('On the graph, the line falls after the review on day ' + rv[a] + ' and after the review on day ' + rv[k - 1] + '. Which fall is slower?', 'The fall after day ' + rv[k - 1], ['The fall after day ' + rv[a], 'They fall at the same speed', 'Neither one falls'], ['Each review makes the next fall slower, so the later review, day ' + rv[k - 1] + ', is followed by the slower fall.'], { viz: viz });
  }
  function famCurveRead(R, lv) {
    var viz = { name: 'mm-curve', opts: { reviews: [], days: 28, only: 'none', grid: true, quiet: true } };
    var qs = [
      ['When is forgetting fastest on a forgetting curve?', 'Right after learning', ['After about a month', 'At the same speed all the time', 'Only after a review'], 'The curve is steepest at the start.'],
      ['On a forgetting curve with no reviews, what happens after the first few days?', 'Forgetting slows down and the line flattens', ['Memory climbs back up on its own', 'Everything is forgotten by day 3', 'The line drops faster and faster'], 'The steep drop is early; later the line flattens.'],
      ['What does the side axis of a forgetting-curve graph show?', 'How much you remember', ['How many days have passed', 'How long you studied', 'How many reviews you did'], 'Up means more remembered.'],
      ['What does the bottom axis of a forgetting-curve graph show?', 'Time since learning', ['How much you remember', 'How hard the material is', 'Your test score'], 'Time runs left to right.']];
    var it = R.pick(qs); return mc(it[0], it[1], samp(R, it[2], lv === 1 ? 2 : 3), [it[3]], { viz: viz });
  }

  // ------------------------------------------------------------------ chunks
  var YEARS = ['1066', '1215', '1492', '1607', '1620', '1776', '1787', '1803', '1812', '1848', '1863', '1865', '1903', '1914', '1918', '1929', '1945', '1969', '1989'];
  function famChunkYears(R, lv) {
    var k = lv === 1 ? 2 : 3, ys = samp(R, YEARS, k), d = ys.join(''), right = ys.join(' · ');
    var pairs = d.match(/.{1,2}/g).join(' · '), threes = d.match(/.{1,3}/g).join(' · '), odd = d.slice(0, 3) + ' · ' + d.slice(3, 8) + ' · ' + d.slice(8);
    var viz = { name: 'mm-chunks', opts: { digits: d, groups: [d.length], quiet: true } };
    return mc('Which way of chunking ' + d + ' makes the fewest, most meaningful chunks?', right, samp(R, uniq([pairs, threes, odd, d.split('').join(' ')]), lv === 1 ? 2 : 3),
      ['Look for familiar patterns: ' + ys.join(', ') + ' are all years.', right + ' is ' + k + ' chunks, each one a year you can picture.'], { viz: viz });
  }
  function famChunkCount(R, lv) {
    var n = lv === 1 ? R.pick([6, 8, 9, 10, 12]) : R.int(9, lv === 2 ? 20 : 40), s = lv === 1 ? R.pick([2, 3, 4]) : R.pick([3, 4, 5]), c = ceilDiv(n, s);
    var thing = R.pick(['digits', 'letters', 'digits', 'items']);
    var steps = [n + ' ÷ ' + s + ' = ' + (n % s ? (n / s).toFixed(2).replace(/0$/, '') : n / s) + '.'];
    if (n % s) steps.push('Round up: the leftover ' + (n % s) + ' make one more chunk.');
    steps.push(c + ' chunks.');
    return num('How many chunks of ' + s + ' does a string of ' + n + ' ' + thing + ' make? (A leftover group counts as a chunk.)', c, steps, thing === 'digits' && n <= 16 ? { viz: { name: 'mm-chunks', opts: { digits: R.ints(n, 0, 9).join(''), groups: [n], quiet: true } } } : {});
  }
  function famPhone(R, lv) {
    var d = String(R.int(200, 989)) + String(R.int(200, 999)) + String(R.int(1000, 9999));
    var right = d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    var w = [d.slice(0, 2) + '-' + d.slice(2, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8), d.slice(0, 5) + '-' + d.slice(5), d, d.slice(0, 1) + '-' + d.slice(1, 4) + '-' + d.slice(4, 9) + '-' + d.slice(9)];
    return mc('Which way of writing the phone number ' + d + ' is chunked the way U.S. numbers usually are, in groups of 3, 3 and 4?', right, samp(R, w, lv === 1 ? 2 : 3), ['Three groups: ' + right + '.']);
  }
  var CATS = { birds: ['robin', 'eagle', 'sparrow', 'owl', 'crow', 'heron'], trees: ['oak', 'maple', 'pine', 'birch', 'willow', 'cedar'], fish: ['salmon', 'trout', 'tuna', 'cod', 'perch', 'bass'],
    fruit: ['apple', 'pear', 'plum', 'banana', 'grape', 'peach'], tools: ['hammer', 'saw', 'wrench', 'drill', 'chisel', 'pliers'], instruments: ['violin', 'flute', 'drum', 'trumpet', 'harp', 'cello'],
    vegetables: ['carrot', 'pea', 'onion', 'beet', 'potato', 'leek'], clothes: ['coat', 'scarf', 'boot', 'glove', 'hat', 'sock'] };
  function famGroupList(R, lv) {
    var cats = samp(R, Object.keys(CATS), 3), per = lv === 1 ? 2 : 3, words = [], cat = {};
    cats.forEach(function (c) { samp(R, CATS[c], per).forEach(function (w) { words.push(w); cat[w] = c; }); });
    words = R.shuffle(words);
    var target = R.pick(words), c0 = cat[target];
    if (lv === 3 && R.coin()) return num('Sort this list into groups by kind: ' + words.join(', ') + '. How many groups do you get?', 3, ['The kinds are ' + cats.join(', ') + '.', 'Three groups of ' + per + '.']);
    var mates = words.filter(function (w) { return cat[w] === c0 && w !== target; });
    var others = words.filter(function (w) { return cat[w] !== c0; });
    return mc('Sort this list into groups: ' + words.join(', ') + '. Which word goes in the same group as <b>' + target + '</b>?', R.pick(mates), samp(R, others, lv === 1 ? 2 : 3), [target + ' is one of the ' + c0 + '. Its group: ' + [target].concat(mates).join(', ') + '.']);
  }

  // ------------------------------------------------------------------ mnemonics
  var LISTS = [['the colors of the rainbow', ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']], ['the planets from the Sun', ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']],
    ['the treble-staff lines, bottom to top', ['E', 'G', 'B', 'D', 'F']], ['the compass points, clockwise from north', ['North', 'East', 'South', 'West']],
    ['the levels of biological classification', ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species']], ['the first five U.S. presidents', ['Washington', 'Adams', 'Jefferson', 'Madison', 'Monroe']],
    ['the seven continents (largest first)', ['Asia', 'Africa', 'North America', 'South America', 'Antarctica', 'Europe', 'Australia']], ['the stages of the water cycle', ['evaporation', 'condensation', 'precipitation', 'collection']]];
  var WORDS = ['apple', 'bridge', 'candle', 'dragon', 'eagle', 'forest', 'garden', 'harbor', 'island', 'jacket', 'kettle', 'ladder', 'meadow', 'needle', 'orchard', 'pepper', 'quilt', 'river', 'saddle', 'tunnel', 'umbrella', 'violin', 'wagon', 'yarn', 'zebra'];
  function famAcronym(R, lv) {
    var items, title;
    if (R.chance(0.4)) { var L = R.pick(LISTS); title = L[0]; items = L[1]; }
    else { items = samp(R, WORDS, lv === 1 ? 4 : lv === 2 ? 5 : 6); title = 'this list'; }
    var ac = items.map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
    return text('Write the acronym for ' + title + ', in order: ' + items.join(', ') + '. (Type just the first letters.)', [ac], ['First letters in order: ' + items.map(function (w) { return w.charAt(0).toUpperCase() + ' (' + w + ')'; }).join(', ') + '.', 'Acronym: ' + ac + '.'], { hint: 'Take the first letter of each item, in order.' });
  }
  var ACRO = [['My Very Educated Mother Just Served Us Nachos', 'the planets from the Sun', ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']],
    ['Every Good Boy Does Fine', 'the notes on the lines of the treble staff', ['E', 'G', 'B', 'D', 'F']], ['Never Eat Soggy Waffles', 'the compass points, clockwise', ['North', 'East', 'South', 'West']],
    ['King Philip Came Over For Good Soup', 'the levels of classification', ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species']]];
  function famAcrostic(R, lv) {
    var A = R.pick(ACRO), words = A[0].split(' '), k = R.int(lv === 1 ? 0 : 1, words.length - 1);
    if (lv >= 2 && R.chance(0.4)) return mc('Which list does the sentence <b>“' + A[0] + '”</b> help you remember?', A[1], ACRO.filter(function (x) { return x !== A; }).map(function (x) { return x[1]; }).concat(['the colors of the rainbow']).slice(0, 3), ['The first letters ' + words.map(function (w) { return w[0]; }).join(', ') + ' match ' + A[2].join(', ') + '.']);
    var right = A[2][k], wr = A[2].filter(function (x) { return x !== right; });
    return mc('In the sentence “' + A[0] + '” (' + A[1] + '), which item does the word <b>“' + words[k] + '”</b> stand for?', right, samp(R, wr, Math.min(wr.length, lv === 1 ? 2 : 3)), ['“' + words[k] + '” is word ' + (k + 1) + ', so it stands for item ' + (k + 1) + ': ' + right + '.']);
  }
  function famMakeAcrostic(R, lv) {
    var items = samp(R, WORDS, lv === 1 ? 3 : 4), letters = items.map(function (w) { return w[0].toUpperCase(); });
    var BANK = { A: 'Aunt', B: 'Bears', C: 'Can', D: 'Dance', E: 'Every', F: 'Fine', G: 'Giant', H: 'Happy', I: 'In', J: 'Jolly', K: 'Kind', L: 'Little', M: 'Mice', N: 'Never', O: 'Over', P: 'Purple', Q: 'Quietly', R: 'Run', S: 'Seven', T: 'Tall', U: 'Under', V: 'Very', W: 'Wise', Y: 'Yellow', Z: 'Zebras' };
    var right = letters.map(function (l) { return BANK[l]; }).join(' ');
    var sh = R.shuffle(letters); if (sh.join('') === letters.join('')) sh = letters.slice().reverse();
    var w1 = sh.map(function (l) { return BANK[l]; }).join(' ');
    var w2 = ['Big', 'Old', 'Red', 'Dogs', 'Sing'].slice(0, letters.length).join(' ');
    var w3 = letters.slice(1).concat(letters[0]).map(function (l) { return BANK[l]; }).join(' ');
    return mc('Which sentence is an acrostic for this list, in order: ' + items.join(', ') + '?', right, samp(R, uniq([w1, w2, w3]).filter(function (x) { return x !== right; }), Math.min(2 + (lv > 1 ? 1 : 0), 3)), ['The first letters must be ' + letters.join(', ') + ', in that order.', right + ' fits.']);
  }
  function famRhyme(R, lv) {
    var m = R.pick([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), n = MONTHS[m][1];
    if (lv >= 2 && R.chance(0.3)) return num('“In fourteen hundred ninety-two, Columbus sailed the ocean blue.” In what year did Columbus first sail west across the Atlantic?', 1492, ['“Fourteen hundred ninety-two” is 1492.']);
    return num('“Thirty days hath September, April, June, and November. All the rest have thirty-one, except February alone.” How many days are in <b>' + MONTHS[m][0] + '</b>?', n,
      [n === 30 ? MONTHS[m][0] + ' is named in the list of thirty-day months.' : MONTHS[m][0] + ' is not in the thirty-day list and is not February, so it has thirty-one.']);
  }
  var KW = [['gato', 'Spanish', 'cat', 'gate', 'A cat swinging on a garden gate'], ['pato', 'Spanish', 'duck', 'pot', 'A duck sitting in a cooking pot'], ['mesa', 'Spanish', 'table', 'messy', 'A table piled with a messy heap of dishes'],
    ['libro', 'Spanish', 'book', 'library', 'A library where every book has legs'], ['perro', 'Spanish', 'dog', 'pear', 'A dog chewing a giant pear'], ['sol', 'Spanish', 'sun', 'soul', 'A sun with a happy face singing a soul song'],
    ['agua', 'Spanish', 'water', 'iguana', 'An iguana splashing in a glass of water'], ['pan', 'Spanish', 'bread', 'pan', 'A loaf of bread baking in a frying pan'], ['mano', 'Spanish', 'hand', 'man', 'A man waving a giant hand'],
    ['lune', 'French', 'moon', 'loon', 'A loon bird flying across the full moon'], ['chat', 'French', 'cat', 'chat', 'A cat chatting on a telephone'], ['arbre', 'French', 'tree', 'harbor', 'A tree growing out of the water in a harbor']];
  function famKeyword(R, lv) {
    var k = R.pick(KW), others = samp(R, KW.filter(function (x) { return x !== k; }), 3);
    if (lv === 1 || R.coin()) return mc('The ' + k[1] + ' word <b>' + k[0] + '</b> means “' + k[2] + '.” Which keyword picture links the sound to the meaning?', k[4], others.map(function (o) { return o[4]; }).slice(0, lv === 1 ? 2 : 3), ['Sound link: ' + k[0] + ' sounds like “' + k[3] + '.”', 'Picture link: ' + k[4].toLowerCase() + ', which joins “' + k[3] + '” with “' + k[2] + '.”']);
    return mc('Keyword picture: “' + k[4] + '.” The ' + k[1] + ' word sounds like “' + k[3] + '.” What does <b>' + k[0] + '</b> mean?', k[2], uniq(others.map(function (o) { return o[2]; }).filter(function (x) { return x !== k[2]; })).slice(0, 3), ['The picture joins the sound “' + k[3] + '” with the meaning: ' + k[2] + '.']);
  }

  // ------------------------------------------------------------------ palace
  var SPOTS = ['front door', 'mat', 'coat hook', 'mirror', 'stairs', 'sofa', 'fireplace', 'bookshelf', 'kitchen table', 'stove', 'sink', 'fridge', 'back door', 'bathtub', 'bed', 'window'];
  var ITEMS = ['milk', 'eggs', 'bread', 'apples', 'cheese', 'rice', 'a kite', 'a drum', 'a lamp', 'a rope', 'a bell', 'a boat', 'a trumpet', 'a pumpkin', 'a ladder', 'a clock', 'a hat', 'a whale', 'a cactus', 'a robot'];
  function famPalace(R, lv) {
    var n = lv === 1 ? R.int(4, 5) : lv === 2 ? R.int(5, 7) : R.int(7, 9), sp = samp(R, SPOTS, n), it = samp(R, ITEMS, n), k = R.int(0, n - 1), kind = R.int(0, lv === 1 ? 1 : 3);
    var listing = sp.map(function (s, i) { return (i + 1) + ' ' + s + ' (' + it[i] + ')'; }).join(', ');
    var viz = { name: 'mm-palace', opts: { spots: sp, items: it, quiet: true } }, q, right, steps, wr;
    if (kind === 0) { q = 'Your route and images: ' + listing + '. What is item number ' + (k + 1) + '?'; right = it[k]; steps = ['Walk to spot ' + (k + 1) + ', the ' + sp[k] + '.', 'It holds ' + it[k] + '.']; }
    else if (kind === 1) { k = R.int(0, n - 1); q = 'Your route and images: ' + listing + '. At which spot did you place <b>' + it[k] + '</b>?'; right = 'The ' + sp[k]; steps = [it[k] + ' is item ' + (k + 1) + ', at the ' + sp[k] + '.']; wr = sp.filter(function (_, i) { return i !== k; }).map(function (s) { return 'The ' + s; }); return mc(q, right, samp(R, wr, lv === 1 ? 2 : 3), steps, { viz: viz }); }
    else if (kind === 2) { k = R.int(0, n - 2); q = 'Your route and images: ' + listing + '. Which item comes right <b>after</b> ' + it[k] + '?'; right = it[k + 1]; steps = [it[k] + ' is at spot ' + (k + 1) + ' (' + sp[k] + ').', 'Spot ' + (k + 2) + ', the ' + sp[k + 1] + ', holds ' + it[k + 1] + '.']; }
    else { k = R.int(1, Math.min(3, n - 1)); q = 'Your route and images: ' + listing + '. Walking the route <b>backward</b> from the last spot, what is the ' + ML.util.ordinal(k + 1) + ' item you meet?'; right = it[n - 1 - k]; steps = ['Backward: ' + it.slice().reverse().slice(0, k + 1).join(', ') + '.', 'The ' + ML.util.ordinal(k + 1) + ' is ' + right + '.']; }
    wr = it.filter(function (x) { return x !== right; });
    return mc(q, right, samp(R, wr, lv === 1 ? 2 : 3), steps, { viz: viz });
  }
  function famRoute(R, lv) {
    var good = samp(R, ['front door', 'coat hook', 'mirror', 'stairs', 'fireplace', 'bathtub', 'stove', 'piano', 'bed', 'bookshelf'], lv === 1 ? 4 : 5);
    var bad = R.pick([['tile 1', 'tile 2', 'tile 3', 'tile 4', 'tile 5'], ['chair 1', 'chair 2', 'chair 3', 'chair 4', 'chair 5'], ['a blank wall', 'another blank wall', 'a third blank wall', 'a fourth blank wall', 'one more blank wall'], ['a room in a museum you saw once', 'a hall in a hotel you visited', 'a shop you have never entered', 'a friend’s attic you never saw', 'a castle in a book']]).slice(0, good.length);
    var mid = good.slice(0, 2).concat(bad.slice(2));
    return mc('Which set of spots makes the best memory-palace route?', good.join(', '), samp(R, [bad.join(', '), mid.join(', ')], lv === 1 ? 1 : 2).concat(lv === 3 ? [R.shuffle(good).slice(0, 2).concat(['the ceiling', 'the ceiling again', 'the same ceiling']).join(', ')] : []),
      ['A good route uses distinct spots you know well, in a fixed order.', 'Look-alike spots, blank walls or places you hardly know blur together.']);
  }

  // ------------------------------------------------------------------ plans and mixing
  var HAB = [['spread over four short sessions on different days', 'all in one long session the night before', 'spacing'], ['closed-book recall, then checking', 'rereading and highlighting', 'retrieval'],
    ['kinds of problems shuffled together in review', 'all of one kind, then all of the next', 'mixing'], ['a full night’s sleep before the test', 'staying up late to cram', 'sleep'], ['ending each session with a recall', 'ending each session with a reread', 'ending']];
  var NAMES = ['Ana', 'Ben', 'Cora', 'Dev', 'Eli', 'Faith', 'Gus', 'Hope', 'Ivan', 'June', 'Kai', 'Lena'];
  function famPlans(R, lv) {
    var hs = samp(R, HAB, lv === 1 ? 2 : 3), diff = lv === 1 ? 1 : lv === 2 ? R.int(1, 2) : R.int(2, 3), di = samp(R, [0, 1, 2].slice(0, hs.length), diff);
    var nm = samp(R, NAMES, 2), A = [], B = [];
    hs.forEach(function (h, i) { var d = di.indexOf(i) >= 0; A.push(h[0]); B.push(d ? h[1] : h[0]); });
    var swap = R.coin(), P1 = swap ? B : A, P2 = swap ? A : B, strong = swap ? nm[1] : nm[0];
    var q = 'Two students study the same amount. <b>' + nm[0] + '</b>: ' + P1.join('; ') + '. <b>' + nm[1] + '</b>: ' + P2.join('; ') + '. Whose plan is stronger?';
    var steps = di.map(function (i) { return 'On ' + hs[i][2] + ': “' + hs[i][0] + '” beats “' + hs[i][1] + '.”'; });
    steps.push('Where the plans differ, ' + strong + '’s plan uses the better habit every time.');
    return mc(q, strong + '’s plan', [(strong === nm[0] ? nm[1] : nm[0]) + '’s plan', 'They are equally strong'], steps, { keep: true });
  }
  var SUBJ = [['A', 'B', 'C'], ['add', 'sub', 'mul'], ['map', 'date', 'word'], ['cube', 'cone', 'wedge']];
  function seqBlocked(R, s, n) { var o = []; s.forEach(function (x) { for (var i = 0; i < n; i++) o.push(x); }); return o; }
  function seqMixed(R, s, n) { var o = seqBlocked(R, s, n); for (var t = 0; t < 20; t++) { o = R.shuffle(o); var runs = 0; for (var i = 1; i < o.length; i++) if (o[i] === o[i - 1]) runs++; if (runs <= 1) break; } return o; }
  function famInterleave(R, lv) {
    var s = R.pick(SUBJ).slice(0, lv === 1 ? 2 : 3), n = lv === 1 ? 3 : R.int(3, 4);
    var mix = seqMixed(R, s, n).join(' '), blk = seqBlocked(R, s, n).join(' ');
    var blk2 = seqBlocked(R, R.shuffle(s), n).join(' ');
    if (R.chance(0.5)) return mc('Which practice order is <b>interleaved</b> (mixed)?', mix, uniq([blk, blk2]).slice(0, lv === 1 ? 1 : 2), ['Interleaved practice switches between kinds: ' + mix + '.', 'Blocked practice does all of one kind first.']);
    return mc('Which practice order is <b>blocked</b>?', blk, [mix, seqMixed(R, s, n).join(' ')].filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, lv === 1 ? 1 : 2), ['Blocked: all of one kind, then the next: ' + blk + '.']);
  }
  function famRT(R, lv) {
    var qs = [['In Rohrer and Taylor’s 2007 study, which group scored higher <b>during practice</b>?', 'The blocked group', ['The mixed group', 'Both scored the same'], 'Blocked practice felt easier: about 89 percent against 60.'],
      ['In Rohrer and Taylor’s 2007 study, which group scored higher on the test <b>a week later</b>?', 'The mixed group', ['The blocked group', 'Both scored the same'], 'Mixed 63 percent, blocked 20 percent.'],
      ['A week after practice, the mixed group scored 63 percent and the blocked group 20 percent. How many percentage points higher was the mixed group?', '43', ['23', '83', '40'], '63 − 20 = 43.']];
    var it = R.pick(qs); return mc(it[0], it[1], it[2].slice(0, lv === 1 ? 2 : 3), [it[3]]);
  }
  var TECH = [['the order of the 13 original colonies', 'A memory palace', 'A long list where order matters fits a route.'], ['a 12-digit library card number', 'Chunking', 'A long number fits in groups of 3 or 4.'],
    ['the parts of a flower and where they are', 'Picture + words (a labeled sketch)', 'A structure is best learned as a labeled drawing.'], ['the five Great Lakes', 'An acronym (HOMES)', 'Five items, and first letters are enough.'],
    ['Latin verb endings, said exactly', 'A song or chant', 'Exact wording in order fits rhythm and tune.'], ['a chapter about the Pilgrims', 'Narration', 'A story is best kept by telling it back.'],
    ['a shopping list of 15 things in no order', 'Chunking into groups by kind', 'Grouping by kind turns 15 items into a few chunks.'], ['the bones of the hand', 'Picture + words (a labeled sketch)', 'Parts in place fit a sketch with labels.'],
    ['a 20-item list you must recall in order', 'A memory palace', 'A route keeps a long order.'], ['the notes on the treble staff lines', 'An acrostic sentence (Every Good Boy Does Fine)', 'First letters in order fit an acrostic.'],
    ['the alphabet, for a four-year-old', 'A song or chant', 'Young children learn sequences well in song.'], ['a history lesson about the Romans', 'Narration', 'Telling it back keeps the story and its meaning.']];
  var TECHN = ['A memory palace', 'Chunking', 'Picture + words (a labeled sketch)', 'An acronym (HOMES)', 'A song or chant', 'Narration'];
  function famTech(R, lv) {
    var t = R.pick(TECH), w = TECHN.filter(function (x) { return x.split(' (')[0] !== t[1].split(' (')[0] && !(t[1].indexOf('Chunking') === 0 && x === 'Chunking'); });
    return mc('Which technique fits best for learning <b>' + t[0] + '</b>?', t[1], samp(R, w, lv === 1 ? 2 : 3), [t[2]]);
  }
  var AGE = [['songs, chants and hand motions', '4 to 7'], ['short daily recitation', '4 to 7'], ['narration of a short story, aloud', '4 to 7'], ['picture cards', '4 to 7'],
    ['chunking and acronyms', '8 to 11'], ['a memory-work box with tabs', '8 to 11'], ['narration in writing', '8 to 11'], ['a memory palace at home', '8 to 11'],
    ['self-testing and blank-page recall', '12 and up'], ['memory palaces with silly images', '12 and up'], ['sketch-and-label notes', '12 and up'], ['their own spaced-review schedule', '12 and up']];
  function famAge(R, lv) {
    var a = R.pick(AGE);
    if (lv === 3 && R.coin()) {
      var same = AGE.filter(function (x) { return x[1] === a[1] && x !== a; }), diff = AGE.filter(function (x) { return x[1] !== a[1]; });
      return mc('On the infographic’s age guide, which tool is listed in the <b>same</b> age band as “' + a[0] + '”?', R.pick(same)[0], samp(R, diff, 3).map(function (x) { return x[0]; }), ['“' + a[0] + '” is in the ' + a[1] + ' band.']);
    }
    return mc('On the infographic’s age guide (a guide, not a rule), which age band lists <b>' + a[0] + '</b>?', 'Ages ' + a[1], ['Ages 4 to 7', 'Ages 8 to 11', 'Ages 12 and up'].filter(function (x) { return x !== 'Ages ' + a[1]; }), ['The guide puts ' + a[0] + ' at ages ' + a[1] + '.'], { keep: true });
  }
  var STEPS4 = ['Choose', 'Encode', 'Retrieve', 'Space'], STEPD = ['one poem, one list or one set of terms', 'one tool: a palace, chunks, a sketch or a song', 'close the book, tell it back, check, fix the misses', 'mark days 1, 3, 7 and 21, or file the card in the box'];
  function famSession(R, lv) {
    var k = R.int(0, 3), kind = R.int(0, lv === 1 ? 1 : 2);
    if (kind === 0) return mc('In the first session (Choose, Encode, Retrieve, Space), which step is “' + STEPD[k] + '”?', STEPS4[k], STEPS4.filter(function (_, i) { return i !== k; }).slice(0, lv === 1 ? 2 : 3), ['That is step ' + (k + 1) + ', ' + STEPS4[k] + '.']);
    if (kind === 1) { var j = R.int(0, 2); return mc('In the first session, which step comes right after <b>' + STEPS4[j] + '</b>?', STEPS4[j + 1], STEPS4.filter(function (_, i) { return i !== j + 1; }).slice(0, lv === 1 ? 2 : 3), ['The order is Choose, Encode, Retrieve, Space.']); }
    var right = STEPS4.join(', '), wr = [];
    for (var t = 0; t < 10 && wr.length < 3; t++) { var s = R.shuffle(STEPS4).join(', '); if (s !== right && wr.indexOf(s) < 0) wr.push(s); }
    return mc('Which is the right order for a first memory session?', right, wr, ['Choose what to learn, encode it with one tool, retrieve it with the book closed, then space the reviews.']);
  }


  // ------------------------------------------------------------------ scenario templates (names, subjects and numbers vary)
  var SUBJS = ['the water cycle', 'the parts of a cell', 'the Roman emperors', 'the states and capitals', 'fractions', 'the bones of the arm', 'French verbs', 'the planets', 'the causes of the seasons', 'the life cycle of a frog', 'the parts of speech', 'the kings of England', 'the rivers of Africa', 'the times tables'];
  var DISTS = ['with a video playing', 'while texting friends', 'with the TV on', 'while chatting on the phone', 'while playing a game'];
  function fill(t, v) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; }); }
  function tplFam(list) {
    return function (R, lv) {
      var t = R.pick(list), nm = R.sample(NAMES, 2), n = R.int(2, 9), v = { A: nm[0], B: nm[1], S: R.pick(SUBJS), D: R.pick(DISTS), N: R.pick([10, 15, 20, 25, 30]), K: n, K2: n + R.int(2, 5) };
      if (t.v) t.v(R, v);
      var r = fill(pickV(R, t.r), v), w = t.w.map(function (x) { return fill(x, v); }).filter(function (x) { return x !== r; });
      return mc(fill(t.q, v), r, samp(R, uniq(w), lv === 1 ? 2 : 3), [fill(t.why, v)], t.keep ? { keep: true } : null);
    };
  }
  var TPL = {
    ltm: [{ q: '{A} already knows a lot about {S}. {B} knows almost nothing about it. Both read the same new article about {S}. Who will probably remember more a week later?', r: '{A}', w: ['{B}', 'Both the same', 'Neither of them'], why: 'New facts link to what {A} already knows, so they are easier to store and find.' },
      { q: '{A} learns a new fact about {S} and asks, “What does this remind me of?” Why does that help?', r: 'It links the new fact to things {A} already knows', w: ['It makes the fact shorter', 'It keeps the fact out of long-term memory', 'It doesn’t help at all'], why: 'Links give a memory more ways to be found.' }],
    att: [{ q: '{A} studies {S} {D}. {B} studies {S} for {N} focused minutes at a quiet table. Who will likely encode more?', r: '{B}', w: ['{A}', 'They will remember the same'], why: 'Full attention is the doorway to encoding; split attention lets little in.', keep: true },
      { q: '{A} reads about {S} {D} and remembers almost nothing the next day. Which stage most likely failed?', r: 'Encoding', w: ['Retrieval', 'Storage', 'None: this is normal forgetting'], why: 'With attention split, the facts never got in well.' }],
    mean: [{ q: '{A} wants to remember a fact about {S}. Which habit adds meaning?', r: ['Asking why it is true and how it connects to what {A} knows', 'Explaining it in {A}’s own words, with an example'], w: ['Saying it {K2} times', 'Copying it {K} times', 'Highlighting it in three colors', 'Reading it faster'], why: 'Asking why and explaining connect the fact to other knowledge.' }],
    test: [{ q: '{A} has {N} minutes to study {S}. Which use of the time builds memory best?', r: ['Read it once, then close the book, recall it and check', 'Answer practice questions before looking at the answers'], w: ['Read it {K} times', 'Highlight every line', 'Copy the notes out neatly', 'Watch the same video twice'], why: 'Retrieval practice beats rereading for remembering later.' },
      { q: '{A} rereads notes on {S} {K} times. {B} reads them once and then recalls them {K} times without looking. A week later, who likely remembers more?', r: '{B}', w: ['{A}', 'They will remember the same'], why: 'In studies like Roediger and Karpicke (2006), recall beat rereading a week later.', keep: true }],
    narr: [{ q: 'After reading about {S}, {A} closes the book and tells it back but leaves out one part. What should happen next?', r: 'Reread only the missed part, then tell it back again', w: ['Reread the whole thing {K} times', 'Skip it and move on', 'Start the book over'], why: 'Fix only the misses.' },
      { q: '{A} is about to narrate a section about {S}. What should {A} do with the book?', r: 'Close it until the telling is done', w: ['Keep it open to read from', 'Peek every few sentences', 'Read it again first'], why: 'No peeking: the effort of recall strengthens the memory.' }],
    blank: [{ q: '{A} does a blank-page recall on {S} and gets {K} of the {K2} key points. What should the next review start with?', r: 'The points {A} missed', w: ['All {K2} points equally', 'The {K} points {A} already got', 'Nothing: {A} is done'], why: 'The missed points, added in a second color, are the study list.' }],
    flash: [{ q: '{A} has {N} flashcards on {S}. Which way of using them builds memory?', r: 'Say each answer before flipping, and let missed cards come back sooner', w: ['Flip each card right away and read the back', 'Read both sides of every card twice', 'Throw out each card after one right answer'], why: 'Recall first; sort by how well you knew it.' }],
    teach: [{ q: '{A} explains {S} to a younger sibling and gets stuck on one question. What does that show?', r: 'A gap that {A} should review', w: ['That {A} knows it all', 'That the sibling is wrong', 'That teaching never helps'], why: 'Teaching from memory shows exactly where the gaps are.' },
      { q: '{A} wants to teach {S} to {B}. Which way also helps {A} remember it?', r: 'Explain it with the book closed, then check it together', w: ['Read the chapter aloud to {B}', 'Hand {B} the notes', 'Show {B} a video'], why: 'Explaining from memory is retrieval practice.' }],
    ls: [{ q: '{A} says, “I’m a visual learner, so I never practice saying things aloud.” What does the evidence say?', r: 'Matching a “style” hasn’t been shown to help; pictures plus words help everyone', w: ['{A} is right: visual learners should avoid words', 'Everyone should use only words', 'Learning styles are proven to double test scores'], why: 'The 2008 review found little support for matching lessons to styles.' }],
    first: [{ q: '{A} wants to start memory work on {S}. What should the first session choose?', r: 'One small piece, like one list or one set of terms', w: ['The whole chapter', 'Everything due this month', 'Three subjects at once'], why: 'Step 1, Choose: one poem, one list or one set of terms.' }]
  };
  var CONC = ['apple', 'elephant', 'bicycle', 'candle', 'tiger', 'teapot', 'ladder', 'pumpkin', 'kite', 'drum', 'castle', 'banana', 'whale', 'umbrella', 'rocket', 'cactus'];
  var ABST = ['justice', 'idea', 'freedom', 'truth', 'reason', 'theory', 'honor', 'patience', 'value', 'concept', 'method', 'duty'];
  function famConcrete(R, lv) {
    var c = R.pick(CONC), a = samp(R, ABST, lv === 1 ? 2 : 3);
    return mc('Which word is easiest to picture, so it gets both a word path and a picture path?', c, a, ['“' + c + '” is concrete: you can see it in your mind.', 'Abstract words like “' + a[0] + '” usually have only the word path.']);
  }
  function famVivid(R, lv) {
    var x = R.pick(['a pumpkin', 'a whale', 'a trumpet', 'a cactus', 'a robot', 'a clock', 'a pineapple', 'a bicycle']), p = R.pick(['front door', 'mat', 'mirror', 'stairs', 'sofa', 'stove', 'bathtub', 'bed']);
    var X = x.replace(/^an? /, '');
    var vivid = R.pick(['A giant ' + X + ' bouncing on the ' + p + ', knocking everything over', 'A ' + X + ' as big as a car, dancing on the ' + p, 'Hundreds of tiny ' + X + 's pouring out of the ' + p]);
    return mc('You want to place <b>' + x + '</b> at the ' + p + ' in your memory palace. Which image will stick best?', vivid, samp(R, ['A small ' + X + ' sitting still on the ' + p, 'The word “' + X + '” written near the ' + p, 'Something somewhere near the ' + p, 'A gray ' + X + ' you can hardly see by the ' + p], lv === 1 ? 2 : 3), ['Big, strange and moving images stick; plain, still ones fade.']);
  }
  var MAT = [['a map of Europe', 'Looking at it and sketching it'], ['a folk song', 'Listening to it and singing it'], ['a dance step', 'Doing it, step by step'], ['a poem to recite', 'Saying it aloud from memory'], ['the shape of a leaf', 'Looking closely and sketching it']];
  function famMaterial(R, lv) {
    var m = R.pick(MAT);
    return mc('For <b>anyone</b>, whatever their preferred style, what is a good way to learn ' + m[0] + '?', m[1], samp(R, MAT.filter(function (x) { return x !== m; }).map(function (x) { return x[1]; }), lv === 1 ? 2 : 3), ['The material decides: ' + m[0] + ' is learned by ' + m[1].charAt(0).toLowerCase() + m[1].slice(1) + '.']);
  }
  function famSkip(R, lv) {
    var k = R.int(lv === 1 ? 2 : 3, lv === 1 ? 10 : 12), j = R.int(2, 9);
    return num('A skip-counting song goes by ' + k + 's: ' + [1, 2, 3].map(function (i) { return k * i; }).join(', ') + ', … In the song, what number comes right after ' + (k * j) + '?', k * (j + 1), [(k * j) + ' + ' + k + ' = ' + (k * (j + 1)) + '.']);
  }
  function famAlpha(R, lv) {
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i = R.int(lv === 1 ? 0 : 6, 24), next = A[i + 1];
    if (lv >= 2 && R.coin()) {
      var t = samp(R, ['April', 'June', 'September', 'November'], 1)[0], w = samp(R, ['January', 'March', 'May', 'July', 'August', 'October', 'December'], 3);
      return mc('Using “Thirty days hath September, April, June, and November,” which month has <b>30</b> days?', t, w, [t + ' is one of the four months named in the rhyme.']);
    }
    return mc('Sing the alphabet song in your head. Which letter comes right after <b>' + A[i] + '</b>?', next, samp(R, uniq([A[i - 1] || 'Z', A[i + 2] || 'A', A[(i + 5) % 26], A[(i + 13) % 26]]).filter(function (x) { return x !== next; }), lv === 1 ? 2 : 3), ['The song runs … ' + A.slice(Math.max(0, i - 2), i + 3).split('').join(', ') + ' …', 'After ' + A[i] + ' comes ' + next + '.']);
  }
  function famAgeTool(R, lv) {
    var age = R.int(4, 16), band = age <= 7 ? '4 to 7' : age <= 11 ? '8 to 11' : '12 and up', thing = R.pick(THINGS);
    var ok = AGE.filter(function (x) { return x[1] === band; }), no = AGE.filter(function (x) { return x[1] !== band; });
    return mc('Using the infographic’s age guide, which tool fits a <b>' + age + '-year-old</b> learning ' + thing + '?', R.pick(ok)[0], samp(R, no, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), ['Age ' + age + ' is in the ' + band + ' band.', 'That band lists: ' + ok.map(function (x) { return x[0]; }).join('; ') + '.']);
  }

  // ------------------------------------------------------------------ the banks (statements and scenarios), by topic
  var B = {};
  B['three-stages'] = { facts: [['Encoding is taking information in and making sense of it.', true], ['Retrieval is pulling a memory back out when you need it.', true], ['Storage is keeping information over time.', true], ['A memory can fail at any of the three stages.', true],
      ['If you can’t recall something right now, it was never stored.', false, 'It may be stored but hard to find; a cue can bring it back.'], ['Retrieval happens before encoding.', false, 'You must take it in first.'], ['Memory is one single thing you either have or don’t.', false, 'It is a process with three stages.'], ['Encoding means forgetting on purpose.', false, 'Encoding means taking it in.']],
    items: [{ q: 'Which stage is “taking the information in”?', r: 'Encoding', w: ['Storage', 'Retrieval', 'Forgetting'] }, { q: 'Which stage is “pulling it back out when you need it”?', r: 'Retrieval', w: ['Encoding', 'Storage', 'Chunking'] }, { q: 'Which stage is “keeping it over time”?', r: 'Storage', w: ['Encoding', 'Retrieval', 'Narration'] },
      { q: ['Max read a page while texting and remembers nothing of it. Which stage most likely failed?', 'Lily skimmed a list while the TV was on and can’t recall any of it. Which stage most likely failed?'], r: 'Encoding', w: ['Retrieval', 'Storage', 'All three equally'], why: 'With attention split, the information never got in well.' },
      { q: ['Ben can’t recall a capital until a friend says the first letter. Which stage was the trouble?', 'Rosa blanks on a word until she sees a picture of it. Which stage was the trouble?'], r: 'Retrieval', w: ['Encoding', 'Storage', 'None of them'], why: 'The memory was there; a cue helped find it.' },
      { q: 'Which order do the stages come in?', r: 'Encode, store, retrieve', w: ['Retrieve, store, encode', 'Store, encode, retrieve', 'Encode, retrieve, store'], why: 'In, kept, out.' }] };
  B['working-memory'] = { facts: [['Working memory holds only a few things at once.', true], ['Cowan (2001) put the limit at about four chunks.', true], ['Miller (1956) described a span of about seven, plus or minus two.', true], ['A familiar year like 1776 can count as one chunk.', true],
      ['Working memory can hold about 50 items if you try hard.', false, 'It holds about four chunks for everyone.'], ['Working memory is the same as long-term memory.', false, 'It is the small, short-term workbench.'], ['Each digit of a year must take its own slot, even if you know the year.', false, 'A known year is one chunk.'], ['Trying harder makes working memory much bigger.', false, 'Chunking helps; effort alone doesn’t.']],
    items: [{ q: 'About how many chunks can working memory hold at once?', r: 'About 4', w: ['About 1', 'About 20', 'About 100'] }, { q: 'What is the best way to fit more into working memory?', r: 'Group items into bigger, meaningful chunks', w: ['Read the items faster', 'Say each item louder', 'Look away more often'] },
      { q: 'Someone reads you a 10-digit number once. What helps you hold it?', r: 'Grouping it as 3, 3 and 4 digits', w: ['Holding all ten digits separately', 'Thinking of something else', 'Writing it backward in your head'] }] };
  B['long-term-memory'] = { facts: [['Long-term memory holds a very large amount.', true], ['New facts are easier to learn when you can connect them to what you know.', true], ['The hard part of long-term memory is often finding a memory again.', true],
      ['Learning more fills up your memory so there is less room.', false, 'No limit we can reach; more knowledge gives more hooks.'], ['Long-term memory lasts only a few seconds.', false, 'That is working memory.'], ['Knowing a lot about a subject makes it harder to learn more about it.', false, 'It makes it easier.']],
    items: [{ q: ['Two children read about a new dinosaur. One knows a lot about dinosaurs. Who will probably remember more?', 'Two adults hear a talk about gardens. One gardens every week. Who will probably remember more?'], r: 'The one who already knows a lot', w: ['The one who knows little', 'Both the same', 'Neither will remember anything'], why: 'New facts link to old ones.' },
      { q: 'Why is a memory with many connections easier to find?', r: 'It has more ways in, like a book listed under several subjects', w: ['It takes up less space', 'It is stored in working memory', 'It never fades at all'] }] };
  B['attention'] = { facts: [['Attention is the doorway to encoding.', true], ['Most people can’t draw the back of a coin they use every day.', true], ['Short, focused study blocks help encoding.', true], ['Asking a question before you read helps you notice the answer.', true],
      ['You can study well with a video playing because your brain does two thinking jobs at once.', false, 'You switch back and forth, and each switch costs attention.'], ['Seeing something many times guarantees you will remember it.', false, 'Not if you never paid attention to it.'], ['Long, drifting study sessions encode best.', false, 'Short focused blocks are better.']],
    items: [{ q: 'Which setup gives the best chance to encode spelling words?', r: 'Ten focused minutes at a quiet table, saying and writing each word', w: ['An hour with a video playing', 'Glancing at the list during a game', 'Reading the list while chatting'] },
      { q: 'Why can’t most people draw a coin they see every day?', r: 'They never paid attention to its details', w: ['Coins are too small to see', 'Coins change every week', 'Memory can’t store pictures'] },
      { q: 'What helps you notice what matters while you read?', r: 'Asking a question first, then reading to find the answer', w: ['Reading as fast as possible', 'Having music with words on', 'Reading only the pictures'] }] };
  B['meaning'] = { facts: [['Asking why and how helps you remember.', true], ['Connecting a new fact to what you already know helps encoding.', true], ['Elaboration means adding details and links to a new fact.', true],
      ['Saying a definition ten times is the best way to understand it.', false, 'Repetition without meaning encodes poorly.'], ['A memory trick can always replace understanding.', false, 'A trick holds a fact in place; understanding gives it roots.'], ['Meaning has nothing to do with memory.', false, 'Meaning makes it stick.']],
    items: [{ q: 'Which question helps you remember that the heart has four chambers?', r: 'Why would two pumps each need a room to receive and a room to push?', w: ['How many times can I say “four chambers”?', 'What color is the textbook?', 'Who wrote the chapter?'] },
      { q: 'Which question helps you remember that the Nile flows north?', r: 'Where is the high ground, and where is the sea?', w: ['How long is the word “Nile”?', 'How many times can I write it?', 'What page is it on?'] },
      { q: 'Which study habit uses meaning?', r: 'Explaining the idea in your own words and giving an example', w: ['Copying the sentence five times', 'Highlighting every line', 'Reading the page aloud quickly'] }] };
  B['cues'] = { facts: [['A cue is a hint that leads back to a memory.', true], ['The tip-of-the-tongue feeling often means the memory is stored but hard to find.', true], ['Building several cues gives several ways back in.', true], ['A flashcard’s front side is a cue for its back.', true],
      ['If a word won’t come at once, it is gone for good.', false, 'A cue often brings it back.'], ['One cue is always enough.', false, 'More cues, more roads in.'], ['Cues only work for pictures.', false, 'Letters, places, questions and sounds are cues too.']],
    items: [{ q: 'In HOMES for the Great Lakes, what kind of cue is H?', r: 'A first-letter cue', w: ['A place cue', 'A picture cue', 'A sound-alike cue'] }, { q: 'In a memory palace, what are the cues?', r: 'The spots along the route', w: ['The first letters', 'The colors of the walls only', 'There are no cues'] },
      { q: 'A word is on the tip of your tongue. What is most likely to help?', r: 'A cue, like its first sound', w: ['Giving up', 'Reading a different book', 'Waiting a year'] }] };
  B['forgetting-curve'] = { facts: [['Hermann Ebbinghaus measured forgetting in the 1880s.', true], ['Forgetting is fastest right after learning.', true], ['Ebbinghaus used made-up syllables so meaning would not help some items more than others.', true], ['After each review, the forgetting curve falls more slowly.', true],
      ['Forgetting happens at the same speed every day.', false, 'Fast at first, then slower.'], ['Forgetting means you did something wrong.', false, 'Forgetting is normal.'], ['The forgetting curve gives exact numbers that apply to everyone.', false, 'It is a shape; numbers vary.'], ['Ebbinghaus published his results in the 1950s.', false, 'He published in 1885.']],
    items: [{ q: 'Who first measured the forgetting curve?', r: 'Hermann Ebbinghaus', w: ['George Miller', 'Allan Paivio', 'Charlotte Mason'] }, { q: 'When does memory fade fastest?', r: 'Right after learning', w: ['After a month', 'Only after reviews', 'Never: it fades evenly'] },
      { q: 'What did Ebbinghaus find about relearning?', r: 'Each time he relearned a list, it was forgotten more slowly', w: ['Relearning took longer each time', 'He forgot faster after each review', 'He could never relearn a list'] }] };
  B['reading-the-curve'] = { facts: [['On a forgetting-curve graph, time runs along the bottom.', true], ['Each jump up on the solid line is a review.', true], ['A flatter line means slower forgetting.', true],
      ['A jump up means you learned a brand-new fact.', false, 'It is a review of the same material.'], ['The dashed no-review line rises over time.', false, 'It drops and stays low.'], ['The side axis shows the number of days.', false, 'It shows how much you remember.']], items: [] };
  B['savings'] = { facts: [['Relearning is usually faster than the first learning.', true], ['Ebbinghaus called the time saved in relearning “savings.”', true], ['0 percent savings means relearning took as long as the first learning.', true],
      ['If you can’t recall something, none of it is left at all.', false, 'Savings show part of it is often still stored.'], ['Savings are measured by how fast you read.', false, 'By how much less time relearning takes.']], items: [] };
  B['spacing-effect'] = { facts: [['The same study time spread over several days is remembered longer than when it is crammed.', true], ['Cepeda and colleagues (2006) reviewed hundreds of experiments on spacing.', true], ['The longer you want to remember, the longer the gaps should be.', true], ['Cramming can look good the next morning and still fade fast.', true],
      ['Cramming is best for remembering things months later.', false, 'Spacing is.'], ['Spacing only works for math.', false, 'It has been found for many kinds of material.'], ['A review works best when you remember it perfectly with no effort.', false, 'A little fading makes the review stronger.']],
    items: [{ q: ['Sam studies 60 minutes on Sunday. Tess studies 15 minutes on four different days. The test is in three weeks. Who likely remembers more?', 'Leo studies two hours the night before. Maya studies 30 minutes on four days. Same test in a month. Who likely remembers more?'], r: 'The one who spread it out', w: ['The one who crammed', 'They will remember the same', 'Neither will remember anything'], why: 'Same time, but spacing wins on later tests.' },
      { q: 'Why does a review work best once a memory has started to fade?', r: 'Pulling up a fading memory takes effort, and the effort strengthens it', w: ['Faded memories are easier to read', 'The brain stops forgetting after one review', 'It doesn’t: reviews should be back to back'] }] };
  B['review-schedule'] = { facts: [['On 1-3-7-21, every day is counted from the learning day.', true], ['Each gap in 1-3-7-21 is longer than the one before.', true], ['At each review you should recall first, then check.', true], ['1-3-7-21 is a starter schedule, not a law.', true],
      ['On 1-3-7-21, day 7 is seven days after the day-3 review.', false, 'Day 7 is seven days after learning.'], ['At a review you should reread everything before trying to recall.', false, 'Recall first; reread only misses.'], ['Research proves 1, 3, 7 and 21 are the best numbers for everything.', false, 'It supports growing gaps; the numbers are a handy start.']], items: [] };
  B['next-review'] = { facts: [['To find the next review, add the next schedule number to the learning date.', true], ['If you miss a review, do it as soon as you can and carry on.', true],
      ['If you miss a review, you must start over from day 0.', false, 'Do it soon and carry on.'], ['The next review is always one week after the last one.', false, 'Count from the learning day.']], items: [] };
  B['memory-box'] = { facts: [['A new card starts on the Daily tab.', true], ['A solid card moves back to a tab that comes up less often.', true], ['A card behind a date tab comes up once a month.', true], ['A memory-work box is spaced review on paper.', true],
      ['A card behind a weekday tab comes up every day.', false, 'Once a week.'], ['Cards should stay on Daily forever.', false, 'Then daily review grows too long.'], ['A missed card should move further back.', false, 'It should move forward, to a tab that comes up more often.']], items: [] };
  B['testing-effect'] = { facts: [['Trying to recall something strengthens the memory more than rereading it.', true], ['In Roediger and Karpicke (2006), rereaders did better after 5 minutes.', true], ['In Roediger and Karpicke (2006), the recall group did better after a week.', true], ['A quiz can be a way to learn, not only a way to check.', true],
      ['Tests only measure learning; they never help it.', false, 'Taking a test helps memory.'], ['In the 2006 study, rereading four times won after a week.', false, 'Recalling won after a week: 61 percent against 40.'], ['Retrieval practice means reading the answers first.', false, 'It means recalling before you look.']],
    items: [{ q: 'Which plan uses the testing effect to learn ten science words?', r: 'Read the list once, then cover the meanings and try to say each one', w: ['Read the list five times', 'Copy the list into a notebook', 'Highlight the list in three colors'] },
      { q: 'In Roediger and Karpicke (2006), after one week, about how much did the group that read four times recall?', r: 'About 40 percent', w: ['About 61 percent', 'About 83 percent', 'About 10 percent'] },
      { q: 'In Roediger and Karpicke (2006), after one week, about how much did the group that practiced recall remember?', r: 'About 61 percent', w: ['About 40 percent', 'About 20 percent', 'About 95 percent'] }] };
  B['retrieval-not-rereading'] = { facts: [['Rereading feels easy because the text looks familiar.', true], ['Recognizing a page is not the same as being able to recall it.', true], ['In Karpicke and Roediger (2008), students kept on tests remembered about 80 percent a week later.', true], ['Students in the 2008 study did not predict which method worked best.', true],
      ['If notes look familiar, you can surely recall them with the book closed.', false, 'Familiarity is not recall.'], ['Once you get an item right, you should drop it from practice.', false, 'Dropping it from testing hurt recall in 2008.'], ['Feeling sure is a reliable sign you know it.', false, 'Feelings of knowing are a poor guide.']],
    items: [{ q: 'Zoe rereads her notes three times and feels sure. Kai reads once, then writes what he remembers and finds two gaps. Who has the more accurate picture of what they know?', r: 'Kai', w: ['Zoe', 'Both the same', 'Neither: only a teacher can tell'], why: 'Kai tested himself; Zoe’s confidence came from familiarity.' },
      { q: 'In Karpicke and Roediger (2008), what made the biggest difference a week later?', r: 'Whether items kept being tested', w: ['Whether items kept being studied', 'How fast students read', 'What color the cards were'] },
      { q: 'What is the honest check of whether you know something?', r: 'Close the book and try to recall it', w: ['See whether the page looks familiar', 'Ask whether it feels easy', 'Count how many times you read it'] }] };
  B['narration'] = { facts: [['Narration means telling back what you read, with the book closed.', true], ['Charlotte Mason made narration central to her way of teaching.', true], ['After a narration, you reread only what was missed.', true], ['Narration can be spoken, written or drawn.', true],
      ['During narration you may look at the book whenever you like.', false, 'No peeking: the effort is what helps.'], ['A child should narrate a whole long chapter at once.', false, 'Start with a short section.'], ['After narration, reread the whole chapter.', false, 'Reread only the gaps.']],
    items: [{ q: 'After a narration, a child left out the first winter. What happens next?', r: 'Reread only that part, then tell it back again', w: ['Reread the whole chapter twice', 'Move on and never mention it', 'Start the book over'] }, { q: 'What is step 2 of narration?', r: 'Close the book and tell it back', w: ['Read it three more times', 'Copy it word for word', 'Highlight the key lines'] },
      { q: 'How much should a young child read before narrating?', r: 'One short section', w: ['A whole book', 'Three chapters', 'Nothing at all'] }] };
  B['blank-page'] = { facts: [['A blank-page recall is writing down everything you remember on a blank sheet.', true], ['Gaps added in a second color show what to review first.', true], ['When stuck, asking yourself who, when and why can help.', true],
      ['You should check your notes after a few seconds.', false, 'Give recall a real try first.'], ['A blank-page recall works only once.', false, 'Repeat it at each review.'], ['Missed points should be ignored.', false, 'They are your study list.']],
    items: [{ q: 'Rosa’s blank page on the water cycle has evaporation, condensation and precipitation. What should her next review focus on?', r: 'Collection, the stage she missed', w: ['Evaporation again', 'All four equally', 'Nothing: she is done'] }, { q: 'Why add missed points in a different color?', r: 'So the next review can start with them', w: ['To make the page prettier', 'So the teacher can grade it', 'It doesn’t matter'] }] };
  B['flashcards'] = { facts: [['Say the answer before you flip the card.', true], ['One fact per card works best.', true], ['Cards you missed should come back sooner.', true], ['Practicing in both directions can help, like word to meaning and meaning to word.', true],
      ['Flip first, then decide whether you knew it.', false, 'That is recognizing, not recalling.'], ['A card you got right once can be thrown away.', false, 'It still needs spaced reviews.'], ['Big cards with whole paragraphs work best.', false, 'Split them up.']],
    items: [{ q: 'Ivy flips each card right away and says, “Oh yes, I knew that.” What should she change?', r: 'Say or write the answer first, then flip', w: ['Flip faster', 'Use bigger cards', 'Read each card twice'] }, { q: 'You got a card right easily. What happens to it?', r: 'It waits longer before its next review', w: ['It is thrown away', 'It comes back tomorrow', 'It moves to the front of the stack'] }] };
  B['chunking'] = { facts: [['A chunk is a group you already know as one thing.', true], ['FBI, CIA and USA are three chunks instead of nine letters.', true], ['Chunks work best when each group means something.', true],
      ['Any random grouping helps as much as a meaningful one.', false, 'Random groups don’t help much.'], ['Chunking makes working memory hold fewer things.', false, 'It makes each slot carry more.'], ['Splitting a number into many pairs always helps.', false, 'Many random pairs can be worse.']],
    items: [{ q: 'Which chunking of the letters T V P C D V D helps most?', r: 'TV · PC · DVD', w: ['TVP · CDV · D', 'T · V · P · C · D · V · D', 'TVPC · DVD'] }, { q: 'Which is the best chunking of F B I C I A U S A?', r: 'FBI · CIA · USA', w: ['FB · IC · IA · US · A', 'FBIC · IAUSA', 'F · B · I · C · I · A · U · S · A'] }] };
  B['chunk-numbers'] = { facts: [['U.S. phone numbers are usually grouped 3, 3 and 4.', true], ['Groups of 3 or 4 digits are easier to hold than one long string.', true], ['A group that is a known year makes a strong chunk.', true],
      ['Chunks of one digit help the most.', false, 'Each digit is still its own thing to hold.'], ['Long numbers are easiest as one unbroken string.', false, 'Group them.']], items: [] };
  B['chunk-lists'] = { facts: [['Sorting a list by kind turns it into a few chunks.', true], ['A group name is a cue for the items in the group.', true], ['Three or four groups work better than many tiny groups.', true],
      ['A shopping list is easiest in the order it was written.', false, 'Grouping by kind helps.'], ['Nine groups of one item is a good chunking.', false, 'Aim for three or four groups.']], items: [] };
  B['chunk-count'] = { facts: [['Chunks = items ÷ chunk size, rounded up.', true], ['A leftover group counts as one more chunk.', true],
      ['A leftover group of digits can be ignored.', false, 'It is still a chunk to remember.'], ['A 14-digit number in chunks of 4 makes 3 chunks.', false, 'It makes 4: three of 4 and one of 2.']], items: [] };
  B['dual-coding'] = { facts: [['Allan Paivio described dual coding in 1971.', true], ['Words that bring a picture to mind are usually easier to remember.', true], ['A simple sketch you can redraw from memory is a strong study tool.', true], ['Picture plus words helps every learner.', true],
      ['Dual coding only helps people who are good at art.', false, 'Stick figures are enough.'], ['Copying a textbook diagram line by line is the best kind of sketch.', false, 'A simple sketch you can redraw works better.'], ['Abstract words like “justice” are easier to picture than “apple.”', false, 'Concrete words are easier to picture.']],
    items: [{ q: 'Which note helps more for the parts of a plant?', r: 'A quick sketch with each part labeled and one line on what it does', w: ['A list of definitions only', 'A photo pasted in with no labels', 'The paragraph copied out twice'] }, { q: 'What does “dual” in dual coding mean?', r: 'Two paths: words and images', w: ['Studying twice a day', 'Two people studying together', 'Two colors of ink'] },
      { q: 'Which word gives you the most direct picture?', r: ['apple', 'elephant', 'bicycle'], w: ['justice', 'idea', 'freedom', 'truth', 'reason'], why: 'Concrete words bring a picture to mind, so they have two paths back.' }] };
  B['make-it-vivid'] = { facts: [['Vivid images are concrete, exaggerated and moving.', true], ['Action beats a still picture.', true], ['A vivid image must also link to the fact.', true],
      ['The plainest image is the easiest to remember.', false, 'Strange and big images stick better.'], ['If the image comes back but the fact doesn’t, the image is fine.', false, 'Change the image: test the fact, not the joke.']],
    items: [{ q: ['You need to remember to buy eggs. Which image is more vivid?', 'You need to remember eggs on a list. Which picture will stick best?'], r: 'Eggs hatching on your pillow, the chicks marching to the store', w: ['A carton of eggs on a counter', 'The word “eggs” in small print', 'A plain white egg'] },
      { q: 'Which image best stands for Washington at the front door?', r: 'A giant washing machine blocking the door, sloshing suds on your shoes', w: ['A small washing machine somewhere in the house', 'The word “Washington” on a sticky note', 'A picture of a door'] },
      { q: 'Which makes an image more memorable?', r: ['Making it move', 'Making it huge or strange'], w: ['Making it gray and small', 'Making it still and ordinary', 'Leaving out the link to the fact'] }] };
  B['learning-styles'] = { facts: [['There is little evidence that teaching to a preferred “learning style” improves learning.', true], ['Pashler and colleagues reviewed the learning-styles research in 2008.', true], ['People can have preferences without those preferences changing how well they learn.', true], ['Combining pictures and words helps everyone.', true],
      ['Visual learners should never study with words.', false, 'Everyone benefits from both.'], ['Studies clearly show that matching lessons to learning styles raises scores.', false, 'The review found little support.'], ['Dual coding helps only “visual learners.”', false, 'It helps every learner.']],
    items: [{ q: 'A teacher wants her class to learn the parts of the eye. Which plan fits the evidence?', r: 'Everyone sketches and labels it, explains it aloud, then redraws it from memory', w: ['Drawings for “visual learners,” a reading for “auditory learners”', 'Only a lecture for everyone', 'Each student picks whatever feels easiest'] },
      { q: 'What should decide the method, according to the evidence?', r: 'The material: maps by looking, songs by listening', w: ['A learner’s style label', 'The day of the week', 'Whatever is quickest'] }] };
  B['acronyms'] = { facts: [['HOMES stands for the five Great Lakes.', true], ['ROY G. BIV gives the colors of the rainbow in order.', true], ['If order doesn’t matter, you may rearrange letters to make a word.', true],
      ['An acronym works even if you don’t know what each letter stands for.', false, 'You must know the items.'], ['HOMES lists the Great Lakes from west to east.', false, 'HOMES is a rearranged word; it is not in map order.']],
    items: [{ q: 'What does the H in HOMES stand for?', r: 'Huron', w: ['Hudson', 'Houston', 'Helena'] }, { q: 'In ROY G. BIV, what does the I stand for?', r: 'Indigo', w: ['Ivory', 'Iris', 'Ice blue'] }, { q: 'When is an acronym a good choice?', r: 'When the first letters are enough to bring back each item', w: ['When each item is a long sentence', 'When you don’t know the items yet', 'Never: acronyms don’t help'] }] };
  B['acrostics'] = { facts: [['An acrostic is a sentence whose words start with the items’ first letters.', true], ['Every Good Boy Does Fine gives the treble-staff lines.', true], ['Never Eat Soggy Waffles goes clockwise around the compass.', true],
      ['An acrostic can put the items in any order.', false, 'It keeps them in order.'], ['A long, odd sentence is easier than the list itself.', false, 'Keep it short.']], items: [] };
  B['rhymes-songs'] = { items: [{ q: '“Spring forward, fall back.” In the fall, which way do clocks move?', r: 'Back one hour', w: ['Forward one hour', 'They don’t change', 'Back one day'] }, { q: '“Righty tighty, lefty loosey.” Which way do you turn a screw to tighten it?', r: 'To the right (clockwise)', w: ['To the left (counterclockwise)', 'Either way', 'Push it straight in'] }], facts: [['Rhythm and rhyme give words a fixed shape.', true], ['Songs and chants are the most common kind of memory work for young children.', true], ['A missing word in a rhyme sounds wrong, which helps you find it.', true],
      ['Songs work only for music lessons.', false, 'Times tables, endings and dates work too.'], ['Once you know the song, you never need to use the facts without it.', false, 'Practice using the facts on their own.']], items: [] };
  B['keyword-method'] = { facts: [['The keyword method links a sound-alike English word to the meaning with a picture.', true], ['The keyword is a bridge; you still learn the real pronunciation.', true],
      ['Any keyword works, even one you can’t picture.', false, 'The keyword must be easy to picture.'], ['The keyword method replaces learning to say the word.', false, 'It is a bridge to the meaning.']], items: [] };
  B['palace-basics'] = { facts: [['The memory palace is also called the method of loci.', true], ['Loci is Latin for “places.”', true], ['The route keeps the items in order.', true], ['Roman writers like Cicero and Quintilian taught the method.', true],
      ['A memory palace works best in a place you have never seen.', false, 'Use a place you know by heart.'], ['A memory palace can’t keep things in order.', false, 'Keeping order is its strength.'], ['Each spot should hold as many images as possible.', false, 'Start with one vivid image per spot.']],
    items: [{ q: 'What does “loci” mean?', r: 'Places', w: ['Pictures', 'Numbers', 'Letters'] }, { q: 'Why does a memory palace keep items in order?', r: 'The route through the place has a fixed order', w: ['The items are in alphabetical order', 'You write them down', 'Palaces are always small'] },
      { q: 'Which place is best for your first memory palace?', r: 'Your own home', w: ['A city you have never visited', 'A building from a movie you saw once', 'An empty field'] }] };
  B['palace-route'] = { facts: [['A good route uses spots you can tell apart.', true], ['Walk the route in the same direction every time.', true], ['It is fine to reuse a few routes you know well.', true],
      ['Six identical chairs make good spots.', false, 'Look-alike spots blur.'], ['You need a brand-new palace for every list.', false, 'Reuse a few routes.'], ['A blank wall is a good spot.', false, 'There is nothing to hang an image on.']], items: [] };
  B['palace-walk'] = { facts: [['To recall, walk the route spot by spot.', true], ['A palace can be walked backward.', true], ['The spot’s number tells you the item’s position.', true],
      ['You should skip the walk and just try to remember the list.', false, 'The walk keeps the order.'], ['At review, rebuild every spot even if it was clear.', false, 'Rebuild only the blank spots.']], items: [] };
  B['sleep'] = { facts: [['Sleep helps the brain keep what it practiced.', true], ['Diekelmann and Born (2010) reviewed evidence that sleep supports memory consolidation.', true], ['A short review before bed and a check in the morning fit how sleep helps.', true],
      ['Staying up late to cram usually helps memory.', false, 'Losing sleep weakens what you studied.'], ['You can learn new material by playing a recording while you sleep.', false, 'Sleep helps keep what you practiced awake.'], ['Sleep is time off for memory.', false, 'The brain strengthens memories during sleep.']],
    items: [{ q: 'Which plan is better the night before a recitation?', r: 'One run after supper, a full night’s sleep, one run at breakfast', w: ['Practice until 1 a.m.', 'Skip sleep and practice all night', 'Play a recording while sleeping instead of practicing'] }, { q: 'What is consolidation?', r: 'The process that makes a new memory more stable', w: ['Forgetting on purpose', 'Reading something twice', 'A kind of acronym'] }] };
  B['interleaving'] = { facts: [['Interleaved practice mixes kinds of problems together.', true], ['Blocked practice often feels easier while you do it.', true], ['Mixing teaches you to tell which kind a problem is.', true], ['A new skill can be learned first, then mixed into review.', true],
      ['Blocked practice gives better results on later tests.', false, 'Mixed practice did far better a week later.'], ['If practice feels harder, it must be working worse.', false, 'Mixed practice feels harder but sticks better.']], items: [] };
  B['teach-it'] = { facts: [['Explaining from memory is a form of retrieval practice.', true], ['A question you can’t answer while teaching shows a gap.', true], ['Teaching works best with the book closed.', true],
      ['Reading the lesson aloud to someone is the same as teaching from memory.', false, 'Without recall it is rereading.'], ['Teaching helps only the person being taught.', false, 'The teacher learns too.']],
    items: [{ q: 'Eli explains the water cycle to his sister and gets stuck on why clouds form. What has he found?', r: 'A gap to review', w: ['Proof that he knows it all', 'That his sister is wrong', 'That teaching doesn’t work'] }, { q: 'Which is teaching that builds memory?', r: 'Explaining with the book closed, then checking together', w: ['Reading the chapter aloud', 'Handing over your notes', 'Showing a video'] }] };
  B['by-age'] = { facts: [['Narration and spaced review work at every age.', true], ['The age guide is a guide, not a rule.', true], ['Young children do well with songs and chants.', true],
      ['A five-year-old should start with a 50-spot memory palace.', false, 'Songs, chants and picture cards fit that age.'], ['Teenagers should only use songs.', false, 'Self-testing and palaces fit well.']], items: [] };
  B['first-session'] = { facts: [['A first session starts by choosing one small thing to learn.', true], ['A session should end with a closed-book recall.', true], ['Put the next review on the calendar before you close the books.', true],
      ['A first session should cover a whole chapter.', false, 'Choose one poem, list or set of terms.'], ['End the session with a reread.', false, 'End with a recall.']], items: [] };
  B['weaker-plan'] = { facts: [['More hours don’t make a better plan; better habits do.', true], ['Short sessions over several days beat one long session.', true], ['Closed-book recall beats highlighting.', true],
      ['The plan with the most hours is always stronger.', false, 'Habits matter more than hours.'], ['Late-night cramming is the strongest habit.', false, 'Sleep helps memory.']], items: [] };
  B['choose-technique'] = { facts: [['A memory palace fits a long list in order.', true], ['Chunking fits a long number.', true], ['A labeled sketch fits the parts of a structure.', true],
      ['One favorite trick fits every kind of material.', false, 'Match the tool to the material.'], ['A song is the best tool for a map.', false, 'A map is best learned by looking and sketching.']], items: [] };
  B['plan-session'] = { facts: [['A good plan says what, which tool, how to recall, when to review, and what else helps.', true], ['A plan without scheduled reviews is missing a key step.', true],
      ['If the encoding is vivid, reviews are not needed.', false, 'Spaced retrieval is always part of the recipe.'], ['The best plan uses every technique at once.', false, 'Pick one encode tool that fits.']], items: [] };

  // ------------------------------------------------------------------ register every topic
  T('memsk.three-stages', B['three-stages'], [], 0);
  T('memsk.working-memory', B['working-memory'], [famChunkCount, famPhone], 0.45);
  T('memsk.long-term-memory', B['long-term-memory'], [tplFam(TPL.ltm)], 0.5);
  T('memsk.attention', B['attention'], [tplFam(TPL.att)], 0.5);
  T('memsk.meaning', B['meaning'], [tplFam(TPL.mean)], 0.5);
  T('memsk.cues', B['cues'], [famAcrostic], 0.3);
  T('memsk.forgetting-curve', B['forgetting-curve'], [famCurveRead, famCurve], 0.45);
  T('memsk.reading-the-curve', B['reading-the-curve'], [famCurve, famCurve, famCurveRead], 0.8);
  T('memsk.savings', B['savings'], [famSavings], 0.8);
  T('memsk.spacing-effect', B['spacing-effect'], [famPlans, famScheduleOrder], 0.45);
  T('memsk.review-schedule', B['review-schedule'], [famReviewDate, famAllReviews, famScheduleOrder], 0.8);
  T('memsk.next-review', B['next-review'], [famNextReview, famReviewDate], 0.85);
  T('memsk.memory-box', B['memory-box'], [famBox, famBox, famBox, famBoxMove], 0.85);
  T('memsk.testing-effect', B['testing-effect'], [tplFam(TPL.test)], 0.5);
  T('memsk.retrieval-not-rereading', B['retrieval-not-rereading'], [tplFam(TPL.test), famPlans], 0.5);
  T('memsk.narration', B['narration'], [tplFam(TPL.narr)], 0.5);
  T('memsk.blank-page', B['blank-page'], [tplFam(TPL.blank)], 0.5);
  T('memsk.flashcards', B['flashcards'], [famBoxMove, tplFam(TPL.flash)], 0.5);
  T('memsk.chunking', B['chunking'], [famChunkYears, famPhone], 0.5);
  T('memsk.chunk-numbers', B['chunk-numbers'], [famChunkYears, famPhone, famChunkYears], 0.8);
  T('memsk.chunk-lists', B['chunk-lists'], [famGroupList], 0.8);
  T('memsk.chunk-count', B['chunk-count'], [famChunkCount], 0.85);
  T('memsk.dual-coding', B['dual-coding'], [famConcrete], 0.5);
  T('memsk.make-it-vivid', B['make-it-vivid'], [famVivid], 0.55);
  T('memsk.learning-styles', B['learning-styles'], [tplFam(TPL.ls), famMaterial], 0.55);
  T('memsk.acronyms', B['acronyms'], [famAcronym], 0.6);
  T('memsk.acrostics', B['acrostics'], [famAcrostic, famMakeAcrostic], 0.8);
  T('memsk.rhymes-songs', B['rhymes-songs'], [famRhyme, famSkip, famAlpha], 0.85);
  T('memsk.keyword-method', B['keyword-method'], [famKeyword], 0.8);
  T('memsk.palace-basics', B['palace-basics'], [famPalace], 0.35);
  T('memsk.palace-route', B['palace-route'], [famRoute], 0.65);
  T('memsk.palace-walk', B['palace-walk'], [famPalace], 0.85);
  T('memsk.sleep', B['sleep'], [famPlans], 0.3);
  T('memsk.interleaving', B['interleaving'], [famInterleave, famInterleave, famRT], 0.75);
  T('memsk.teach-it', B['teach-it'], [tplFam(TPL.teach)], 0.6);
  T('memsk.by-age', B['by-age'], [famAge, famAgeTool, famAgeTool], 0.85);
  T('memsk.first-session', B['first-session'], [famSession, tplFam(TPL.first)], 0.8);
  T('memsk.weaker-plan', B['weaker-plan'], [famPlans], 0.85);
  T('memsk.choose-technique', B['choose-technique'], [famTech], 0.85);
  T('memsk.plan-session', B['plan-session'], [famTech, famPlans, famAllReviews, famSession, famAge], 0.85);
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
