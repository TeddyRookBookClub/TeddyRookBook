  /* ===== Great Books Ladder: helpers shared by every rung's generator (scripts/greatbooks/src/_common.js) =====
     In scope for every gen.js: G (MathLadder.gen), ML, H (these helpers) and H.RUNGS (every rung of the ladder:
     { id, author, title, work, year (negative = BC), when (as written), vol }, built from data/greatbooks/rungs.yaml).
     Problem shapes: { q, a: { t: 'mc', choices, v } | { t: 'tf', v } | { t: 'num', v, form } | { t: 'text', v }, steps, hint? }.
       H.mc(q, right, wrongs, steps, o)       choices are shuffled by the engine; o: { hint, viz, keep }
       H.tf(statement, true|false, why)
       H.num(q, value, steps, o)              o.form: 'int' (default) or 'dec'; o.rtol for rounding; o.unit
       H.text(q, value, steps, o)
       H.bankProblem(R, level, B)             from a bank B = { facts: [[statement, bool, why]], items: [{ q, r, w, why }] }
       H.T(id, B, families, share)            register a rung: bank B plus computed families fam(R, level) -> problem
     Families for any rung (use them for variety):
       H.famOrder(R, lv, ids?)                put works in order of date (ids: rung ids to draw from; default the whole ladder)
       H.famWhoWrote(R, lv, id)               who wrote this rung's work / which work is by this author
       H.famWhen(R, lv, id)                   about when was it written (century)
       H.famVolume(R, lv, id)                 which volume of the set holds it
       H.famBefore(R, lv, id)                 which of these came before / after this work                        */
  var H = {};
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
  function num(q, v, steps, o) {
    o = o || {};
    var a = { t: 'num', v: String(v), form: o.form || 'int' };
    if (o.rtol) a.rtol = o.rtol; if (o.unit) a.unit = o.unit;
    var p = { q: q, a: a, steps: steps }; if (o.viz) p.viz = o.viz; if (o.hint) p.hint = o.hint; return p;
  }
  function text(q, v, steps, o) { var p = { q: q, a: { t: 'text', v: v, strict: true }, steps: steps }; if (o && o.viz) p.viz = o.viz; if (o && o.hint) p.hint = o.hint; return p; }
  function pickV(R, x) { return Array.isArray(x) ? R.pick(x) : x; }
  function samp(R, a, k) { return R.sample(a, Math.max(0, Math.min(k, a.length))); }
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
      if (facts.length && (r < 0.3 || !items.length)) { var f = R.pick(facts); return tf(f[0], f[1], f[2]); }
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
  function T(id, D, fams, share) {
    G(id, function (R, ctx) {
      var lv = ctx && ctx.level || 1;
      var hasBank = D && ((D.items && D.items.length) || (D.facts && D.facts.length));
      if (fams && fams.length && (R.next() < (share === undefined ? 0.5 : share) || !hasBank)) {
        var p = R.pick(fams)(R, lv); if (p) return p;
      }
      return bankProblem(R, lv, D);
    });
  }
  H.uniq = uniq; H.mc = mc; H.tf = tf; H.num = num; H.text = text; H.samp = samp; H.pickV = pickV;
  H.itemMc = itemMc; H.whichOne = whichOne; H.chooseAll = chooseAll; H.bankProblem = bankProblem; H.T = T;

  /* ---- ladder-wide families, from H.RUNGS (set just below by the build) ---- */
  function yr(y) { return y < 0 ? (-y) + ' BC' : (y < 1000 ? 'AD ' + y : String(y)); }
  function cent(y) { var c = y < 0 ? Math.floor((-y - 1) / 100) + 1 : Math.floor((y - 1) / 100) + 1, s = c + (c % 10 === 1 && c !== 11 ? 'st' : c % 10 === 2 && c !== 12 ? 'nd' : c % 10 === 3 && c !== 13 ? 'rd' : 'th'); return 'the ' + s + ' century ' + (y < 0 ? 'BC' : 'AD'); }
  H.yr = yr; H.cent = cent;
  function rung(id) { for (var i = 0; i < H.RUNGS.length; i++) if (H.RUNGS[i].id === id) return H.RUNGS[i]; return null; }
  function dated() { return H.RUNGS.filter(function (r) { return r.year !== null && r.author !== 'Teddy Rook Book'; }); }
  function byAuthor() { var o = {}; dated().forEach(function (r) { if (!o[r.author]) o[r.author] = r; }); return Object.keys(o).map(function (k) { return o[k]; }); }
  H.rung = rung;
  H.famOrder = function (R, lv, ids) {
    var pool = (ids ? ids.map(rung).filter(Boolean) : byAuthor()).filter(function (r) { return r.year !== null; });
    var k = lv === 1 ? 3 : 4, tries = 0, pick;
    do { pick = R.sample(pool, k); tries++; } while (tries < 30 && uniq(pick.map(function (r) { return r.year; })).length < k);
    if (uniq(pick.map(function (r) { return r.year; })).length < k) return null;
    var srt = pick.slice().sort(function (a, b) { return a.year - b.year; }), lab = function (r) { return r.work + ' (' + r.author + ')'; };
    var right = srt.map(lab).join(' → ');
    var w = [], i;
    for (i = 0; i < 6 && w.length < 3; i++) { var s = R.shuffle(srt.slice()).map(lab).join(' → '); if (s !== right) w.push(s); }
    w.push(srt.slice().reverse().map(lab).join(' → '));
    return mc('Which list puts these works in order, <b>earliest first</b>?', right, samp(R, uniq(w), 3),
      srt.map(function (r) { return r.work + ': ' + r.when + '.'; }), { hint: 'Place the oldest one first, then work forward.' });
  };
  H.famWhoWrote = function (R, lv, id) {
    var me = rung(id); if (!me) return null;
    var others = byAuthor().filter(function (r) { return r.author !== me.author; });
    if (R.next() < 0.5) {
      return mc('Who wrote <i>' + me.work + '</i>?', me.author, samp(R, others, lv === 1 ? 2 : 3).map(function (r) { return r.author; }),
        [me.work + ' is by ' + me.author + ' (' + me.when + ').']);
    }
    return mc('Which of these is by <b>' + me.author + '</b>?', me.work, samp(R, others, lv === 1 ? 2 : 3).map(function (r) { return r.work; }),
      [me.author + ' wrote ' + me.work + '.']);
  };
  H.famWhen = function (R, lv, id) {
    var me = rung(id); if (!me || me.year === null) return null;
    var c = cent(me.year), base = me.year, alts = uniq([-400, -50, 150, 400, 1270, 1550, 1650, 1750, 1850, 1925].map(cent)).filter(function (x) { return x !== c; });
    var near = uniq([cent(base - 100), cent(base + 100), cent(base - 200), cent(base + 200)]).filter(function (x) { return x !== c && !/ 0th/.test(x); });
    return mc('About when was <i>' + me.work + '</i> written?', c, samp(R, lv === 1 ? alts : near.concat(alts), lv === 1 ? 2 : 3),
      [me.work + ': ' + me.when + ', which is in ' + c + '.'], { hint: lv > 1 ? 'The years 1601 to 1700 are the 17th century.' : '' });
  };
  H.famVolume = function (R, lv, id) {
    var me = rung(id); if (!me || !me.vol) return null;
    var v = Array.isArray(me.vol) ? me.vol[0] : me.vol, w = [];
    [v - 3, v - 1, v + 1, v + 2, v + 5, v - 6].forEach(function (x) { if (x >= 1 && x <= 60) w.push('Volume ' + x); });
    return mc('In <i>Great Books of the Western World</i> (2nd edition), which volume holds <i>' + me.work + '</i>?', 'Volume ' + (Array.isArray(me.vol) ? me.vol.join(' and ') : v),
      samp(R, w, lv === 1 ? 2 : 3), [me.work + ' is in volume ' + (Array.isArray(me.vol) ? me.vol.join(' and ') : v) + ' of the 1990 set.'], { hint: 'The set runs roughly in order of time, from Homer in volume 3 to the 20th century in 55 to 60.' });
  };
  H.famBefore = function (R, lv, id) {
    var me = rung(id); if (!me || me.year === null) return null;
    var all = byAuthor().filter(function (r) { return r.author !== me.author && Math.abs(r.year - me.year) > 40; });
    var before = all.filter(function (r) { return r.year < me.year; }), after = all.filter(function (r) { return r.year > me.year; });
    var wantBefore = before.length && (R.next() < 0.5 || !after.length);
    var good = wantBefore ? before : after, bad = wantBefore ? after : before;
    if (!good.length || bad.length < 2) return null;
    var g = R.pick(good);
    return mc('Which of these was written <b>' + (wantBefore ? 'before' : 'after') + '</b> <i>' + me.work + '</i> (' + me.when + ')?', g.work + ' (' + g.author + ')',
      samp(R, bad, lv === 1 ? 2 : 3).map(function (r) { return r.work + ' (' + r.author + ')'; }),
      [g.work + ': ' + g.when + '.', me.work + ': ' + me.when + '.']);
  };
