/* Symbolic Logic (sym, /logic/symbolic-logic/): a problem generator for every topic.
   Built from /tmp/work_logic/sym/gen/*.js (build: node /tmp/work_logic/sym/build_gen.js). Every generator calls
   MathLadder.logic (static/logic/viz/logic.js, which Logic pages and ML.loadCourse load with this file) only when it
   runs, never at load. Answers come from the model: truth tables and validity from table()/validity(), proofs checked line
   by line with checkProof(), rules with rulesFor(), worlds with evalWorld(). Formulas are typed with { t: 'prop' }
   (static/math/core/check.js) and shown as TeX in the Logic Ladder's style (¬ ∧ ∨ → ↔ ∀ ∃, full parentheses). */
(function (ML) {
  'use strict';
  var G = ML.gen;
  function LG() { return ML.logic; }

  // ------------------------------------------------------------------ formulas
  function at(p) { return { t: 'atom', p: p }; }
  function N(a) { return { t: 'not', a: a }; }
  function A(a, b) { return { t: 'and', a: a, b: b }; }
  function O(a, b) { return { t: 'or', a: a, b: b }; }
  function I(a, b) { return { t: 'imp', a: a, b: b }; }
  function E(a, b) { return { t: 'iff', a: a, b: b }; }
  function P(s) { return typeof s === 'string' ? LG().parse(s) : s; }
  function sh(f) { return LG().show(P(f)); }
  var TX = { '¬': '\\neg ', '∧': '\\land ', '∨': '\\lor ', '→': '\\to ', '↔': '\\leftrightarrow ', '∀': '\\forall ', '∃': '\\exists ', '≠': '\\ne ', '⊥': '\\bot ', '′': "'" };
  function tex(f) { return sh(f).replace(/[¬∧∨→↔∀∃≠⊥′]/g, function (c) { return TX[c]; }).replace(/ +/g, ' ').trim(); }
  function m(f) { return '$' + tex(f) + '$'; }
  function same(a, b) { return LG().same(P(a), P(b)); }
  function key(f) { return LG().key(P(f)); }
  function kids(f) { return f.t === 'not' || f.t === 'all' || f.t === 'some' ? [f.a] : (f.t === 'and' || f.t === 'or' || f.t === 'imp' || f.t === 'iff') ? [f.a, f.b] : []; }
  function isBin(f) { return f.t === 'and' || f.t === 'or' || f.t === 'imp' || f.t === 'iff'; }
  function size(f) { return 1 + kids(f).reduce(function (s, k) { return s + size(k); }, 0); }
  function letters(fs) { return LG().letters(fs.map(P)); }
  // replace statement letters (or capital metavariables A, B, C, D) by formulas
  function subst(f, map) {
    f = P(f);
    if (f.t === 'atom') return map[f.p] ? P(map[f.p]) : f;
    if (f.t === 'not') return N(subst(f.a, map));
    if (f.t === 'all' || f.t === 'some') return { t: f.t, v: f.v, a: subst(f.a, map) };
    if (isBin(f)) return { t: f.t, a: subst(f.a, map), b: subst(f.b, map) };
    return f;
  }
  // a negation that does not stack: neg(¬p) is ¬¬p (we keep it, the rules need it), negx(¬p) is p
  function negx(f) { return f.t === 'not' ? f.a : N(f); }
  var CONN = { not: 'negation', and: 'conjunction', or: 'disjunction', imp: 'conditional', iff: 'biconditional' };
  var CSYM = { not: '¬', and: '∧', or: '∨', imp: '→', iff: '↔' };
  var CTEX = { not: '\\neg', and: '\\land', or: '\\lor', imp: '\\to', iff: '\\leftrightarrow' };
  var CWORD = { not: 'not', and: 'and', or: 'or', imp: 'if … then', iff: 'if and only if' };

  // a random formula of statement logic over the letters ls, of depth up to d (no p ∘ p, few double negations)
  function rform(R, ls, d, w) {
    if (d <= 0) return at(R.pick(ls));
    var k = R.pickW(['not', 'and', 'or', 'imp', 'iff'], w || [2, 3, 3, 3, 1]);
    if (k === 'not') { var s = rform(R, ls, d - 1, w); return s.t === 'not' ? s : N(s); }
    for (var t = 0; t < 8; t++) {
      var a = rform(R, ls, R.chance(0.6) ? d - 1 : Math.max(0, d - 2), w), b = rform(R, ls, R.chance(0.6) ? d - 1 : Math.max(0, d - 2), w);
      if (!same(a, b)) return { t: k, a: a, b: b };
    }
    return { t: k, a: at(ls[0]), b: at(ls[1] || 'q') };
  }
  // a random formula that uses every letter in ls and has main connective among mains (optional)
  function rformAll(R, ls, d, mains, w) {
    for (var t = 0; t < 60; t++) {
      var f = rform(R, ls, d, w);
      if (letters([f]).length !== ls.length) continue;
      if (mains && mains.indexOf(f.t) < 0) continue;
      return f;
    }
    var g = at(ls[0]); for (var i = 1; i < ls.length; i++) g = (i % 2 ? A : I)(g, at(ls[i]));
    return mains && mains.indexOf(g.t) < 0 ? N(g) : g;
  }
  // a formula for a metavariable at a level: level 1 a letter, level 2 a letter or its negation, level 3 small compounds
  function piece(R, lv, ls, used) {
    var pool = lv >= 3 ? ['p', 'q', 'r', 's', 't', 'u'] : ls;
    var taken = {}; (used || []).forEach(function (u) { letters([u]).forEach(function (l) { taken[l] = 1; }); });
    var free = pool.filter(function (l) { return !taken[l]; });
    if (!free.length) free = pool.slice();
    var f;
    if (lv <= 1) f = at(R.pick(free));
    else if (lv === 2 || free.length < 2) f = R.chance(0.35) ? N(at(R.pick(free))) : at(R.pick(free));
    else if (R.chance(0.55)) { var two = R.sample(free, 2); f = { t: R.pick(['and', 'or', 'imp']), a: R.chance(0.3) ? N(at(two[0])) : at(two[0]), b: at(two[1]) }; }
    else f = R.chance(0.5) ? N(at(R.pick(free))) : at(R.pick(free));
    if (used) used.push(f);
    return f;
  }
  function overlap(f, g) { var a = letters([f]), b = letters([g]); return a.some(function (x) { return b.indexOf(x) >= 0; }); }
  // fill metavariables A, B, C, D with different pieces that share no letters (so no line accidentally matches another rule)
  function fill(R, lv, names) {
    var used = [], map = {}, ls = ['p', 'q', 'r', 's', 't'];
    names.forEach(function (n) { map[n] = piece(R, lv, ls, used); });
    return map;
  }

  // ------------------------------------------------------------------ answers
  function prop(v, exact) { return { t: 'prop', v: Array.isArray(v) ? uniq(v.map(sh)) : sh(v), match: exact ? 'exact' : 'equivalent' }; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { var k = String(x); if (!s[k]) { s[k] = 1; o.push(x); } }); return o; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  // multiple choice: the right text and wrong texts; repeats and wrong texts equal to the right one are dropped
  function mc(right, wrongs, keep) {
    var ch = [right], seen = {}; seen[right] = 1;
    wrongs.forEach(function (w) { if (w !== undefined && w !== null && !seen[w]) { seen[w] = 1; ch.push(w); } });
    if (ch.length < 2) throw new Error('not enough choices');
    var a = { t: 'mc', choices: ch, v: 0 }; if (keep) a.keep = true; return a;
  }
  function mcKeep(choices, right) { var i = choices.indexOf(right); if (i < 0) throw new Error('answer not among choices'); return { t: 'mc', choices: choices.slice(), v: i, keep: true }; }
  function fwrong(right, wrongs) { // formula choices (TeX), dropping wrong ones that are the same formula as the right one
    var r = m(right), ws = [];
    wrongs.forEach(function (w) { if (w && !same(w, right)) ws.push(m(w)); });
    return mc(r, ws);
  }
  function TV(b) { return b ? 'T' : 'F'; }
  function ord(n) { return n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lst(a) { return a.length < 2 ? a.join('') : a.length === 2 ? a[0] + ' and ' + a[1] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function lstOr(a) { return a.length < 2 ? a.join('') : a.length === 2 ? a[0] + ' or ' + a[1] : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1]; }
  function valText(v, ls) { return lst(ls.map(function (l) { return '$' + l + '$ is ' + TV(v[l]); })); }
  function byLv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }

  // the values of every part of f in a row, inside out (for steps)
  function evalSteps(f, val) {
    var out = [];
    (function go(g) {
      kids(g).forEach(go);
      if (g.t === 'atom') return;
      var v = LG().evalProp(g, val);
      if (!out.some(function (o) { return o.k === key(g); })) out.push({ k: key(g), f: g, v: v });
    })(P(f));
    return out;
  }
  function stepsEval(f, val) {
    return evalSteps(f, val).map(function (o) {
      var g = o.f, why;
      var vv = function (x) { return TV(LG().evalProp(x, val)); };
      if (g.t === 'not') why = 'the negation of ' + vv(g.a);
      else if (g.t === 'and') why = vv(g.a) + ' and ' + vv(g.b) + (o.v ? ': both true' : ': a conjunction needs both');
      else if (g.t === 'or') why = vv(g.a) + ' or ' + vv(g.b) + (o.v ? ': at least one is true' : ': both are false');
      else if (g.t === 'imp') why = vv(g.a) + ' → ' + vv(g.b) + (o.v ? (LG().evalProp(g.a, val) ? ': the consequent is true' : ': a false antecedent makes it true') : ': true antecedent, false consequent');
      else why = vv(g.a) + ' ↔ ' + vv(g.b) + (o.v ? ': the same value' : ': different values');
      return m(g) + ' is ' + TV(o.v) + ' (' + why + ').';
    });
  }

  // ------------------------------------------------------------------ proofs
  // pr = { premises: [..], conclusion, lines: [{ f, j }] } with formulas as trees or strings
  function proofText(pr) { return { premises: pr.premises.map(sh), conclusion: sh(pr.conclusion), lines: pr.lines.map(function (l) { return { f: sh(l.f), j: l.j }; }) }; }
  function proofOk(pr) { var r = LG().checkProof(proofText(pr)); return r.ok && r.done; }
  function proofViz(pr, blanks, extra) {
    var o = proofText(pr); o.quiet = true; o.interactive = false; o.goalLine = true;
    if (blanks && blanks.length) { o.mode = 'blanks'; o.blanks = blanks; }
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return { name: 'lg-proof', opts: o };
  }
  function nPrem(pr) { return pr.premises.length; }
  function lineF(pr, n) { return n <= nPrem(pr) ? P(pr.premises[n - 1]) : P(pr.lines[n - nPrem(pr) - 1].f); }
  function lineJ(pr, n) { return n <= nPrem(pr) ? 'Pr' : pr.lines[n - nPrem(pr) - 1].j; }
  function proofSteps(pr) {
    var out = [], np = nPrem(pr);
    pr.lines.forEach(function (l, i) { out.push('Line ' + (np + i + 1) + ': ' + m(l.f) + ' by ' + LG().showJust(l.j) + '.'); });
    return out;
  }
  function instTemplate(tpl, map) {
    return { premises: tpl.p.map(function (s) { return subst(s, map); }), conclusion: subst(tpl.c, map), lines: tpl.l.map(function (l) { return { f: subst(l[0], map), j: l[1] }; }) };
  }
  // try a template with fresh pieces until the proof checks (the pieces never clash, so the first try nearly always works)
  function makeProof(R, lv, tpl) {
    for (var t = 0; t < 12; t++) {
      var names = []; (tpl.p.concat([tpl.c]).concat(tpl.l.map(function (l) { return l[0]; }))).forEach(function (s) { (s.match(/[A-H]/g) || []).forEach(function (c) { if (names.indexOf(c) < 0) names.push(c); }); });
      var pr = instTemplate(tpl, fill(R, lv, names.sort()));
      var txt = JSON.stringify(proofText(pr)), hasDN = /DN/.test(JSON.stringify(tpl.l));
      if (t < 10 && (/¬¬¬/.test(txt) || (!hasDN && /¬¬/.test(txt)))) continue;
      if (proofOk(pr)) return pr;
    }
    throw new Error('no proof for template ' + tpl.c);
  }
  var RULE_NAMES = { MP: 'Modus Ponens (MP)', MT: 'Modus Tollens (MT)', HS: 'Hypothetical Syllogism (HS)', DS: 'Disjunctive Syllogism (DS)', CD: 'Constructive Dilemma (CD)', Simp: 'Simplification (Simp)', Conj: 'Conjunction (Conj)', Add: 'Addition (Add)',
    DM: 'De Morgan (DM)', Com: 'Commutation (Com)', Assoc: 'Association (Assoc)', Dist: 'Distribution (Dist)', DN: 'Double Negation (DN)', Trans: 'Transposition (Trans)', Impl: 'Material Implication (Impl)', Equiv: 'Material Equivalence (Equiv)', Exp: 'Exportation (Exp)', Taut: 'Tautology (Taut)',
    UI: 'Universal Instantiation (UI)', EI: 'Existential Instantiation (EI)', UG: 'Universal Generalization (UG)', EG: 'Existential Generalization (EG)', QN: 'Quantifier Negation (QN)', Id: 'Identity (Id)', CP: 'Conditional Proof (CP)', IP: 'Indirect Proof (IP)' };
  // which rule justifies line n? mc of rule names (only lines whose cited lines fit exactly one of the offered rules)
  function ruleChoices(R, right, pool, cited, res) {
    var fits = LG().rulesFor(cited, res);
    var wrong = R.shuffle(pool.filter(function (r) { return r !== right && fits.indexOf(r) < 0; })).slice(0, 3);
    return mc(RULE_NAMES[right] || right, wrong.map(function (r) { return RULE_NAMES[r] || r; }));
  }
  // every formula one application of a replacement rule (or QN) can make from f, anywhere inside it, either direction
  var REPL = {
    DM: [['¬(A ∧ B)', '¬A ∨ ¬B'], ['¬(A ∨ B)', '¬A ∧ ¬B']], Com: [['A ∨ B', 'B ∨ A'], ['A ∧ B', 'B ∧ A']],
    Assoc: [['A ∨ (B ∨ C)', '(A ∨ B) ∨ C'], ['A ∧ (B ∧ C)', '(A ∧ B) ∧ C']],
    Dist: [['A ∧ (B ∨ C)', '(A ∧ B) ∨ (A ∧ C)'], ['A ∨ (B ∧ C)', '(A ∨ B) ∧ (A ∨ C)']],
    DN: [['A', '¬¬A']], Trans: [['A → B', '¬B → ¬A']], Impl: [['A → B', '¬A ∨ B']],
    Equiv: [['A ↔ B', '(A → B) ∧ (B → A)'], ['A ↔ B', '(A ∧ B) ∨ (¬A ∧ ¬B)']], Exp: [['(A ∧ B) → C', 'A → (B → C)']],
    Taut: [['A', 'A ∨ A'], ['A', 'A ∧ A']]
  };
  function pmatch(p, f, b) {
    if (p.t === 'atom' && /[A-D]/.test(p.p)) { if (b[p.p]) return same(b[p.p], f); b[p.p] = f; return true; }
    if (p.t !== f.t) return false;
    if (p.t === 'atom') return p.p === f.p;
    var pk = kids(p), fk = kids(f); for (var i = 0; i < pk.length; i++) if (!pmatch(pk[i], fk[i], b)) return false; return true;
  }
  function rewritesAt(rule, f) {
    var out = [];
    (REPL[rule] || []).forEach(function (pair) {
      [[pair[0], pair[1]], [pair[1], pair[0]]].forEach(function (d) {
        if (rule === 'DN' && d[0] === 'A') { out.push(N(N(f))); return; }
        if (rule === 'Taut' && d[0] === 'A') { out.push(subst(d[1], { A: f })); return; }
        var b = {}; if (pmatch(P(d[0]), f, b)) out.push(subst(d[1], b));
      });
    });
    return out;
  }
  function oneStep(rule, f) {
    f = P(f); var out = [];
    rewritesAt(rule, f).forEach(function (g) { out.push(g); });
    if (f.t === 'not') oneStep(rule, f.a).forEach(function (g) { out.push(N(g)); });
    else if (isBin(f)) { oneStep(rule, f.a).forEach(function (g) { out.push({ t: f.t, a: g, b: f.b }); }); oneStep(rule, f.b).forEach(function (g) { out.push({ t: f.t, a: f.a, b: g }); }); }
    else if (f.t === 'all' || f.t === 'some') oneStep(rule, f.a).forEach(function (g) { out.push({ t: f.t, v: f.v, a: g }); });
    var seen = {}; return out.filter(function (g) { var k = key(g); if (seen[k]) return false; seen[k] = 1; return true; });
  }
  // a context to put a replacement inside a larger line: X ∘ [·] or [·] ∘ X
  function wrapIn(R, f, other) {
    var k = R.pick(['and', 'or', 'imp', 'imp2']);
    if (k === 'imp2') return I(f, other);
    return R.coin() ? { t: k, a: other, b: f } : { t: k, a: f, b: other };
  }

  // ------------------------------------------------------------------ English banks (original, everyday)
  var NAMES = ['Maya', 'Leo', 'Ava', 'Ben', 'Iris', 'Omar', 'Nora', 'Sam', 'Ruth', 'Theo', 'Zoe', 'Eli', 'Gus', 'Lena', 'Hugo', 'Tess'];
  // verb phrases: [singular, plural, negative singular]
  var VP = [
    ['is at the park', 'are at the park', 'is not at the park'], ['plays the piano', 'play the piano', 'does not play the piano'],
    ['likes soup', 'like soup', 'does not like soup'], ['is on the team', 'are on the team', 'is not on the team'],
    ['has a library card', 'have library cards', 'does not have a library card'], ['finished the puzzle', 'finished the puzzle', 'did not finish the puzzle'],
    ['speaks Spanish', 'speak Spanish', 'does not speak Spanish'], ['sings in the choir', 'sing in the choir', 'does not sing in the choir'],
    ['is going to the fair', 'are going to the fair', 'is not going to the fair'], ['can swim', 'can swim', 'cannot swim'],
    ['brought a lunch', 'brought lunches', 'did not bring a lunch'], ['is reading a mystery', 'are reading mysteries', 'is not reading a mystery']
  ];
  // two-clause scenarios in "you" form: [clause, negated clause, gerund] for a condition and a result
  var SCEN = [
    [['you study', 'you do not study', 'studying'], ['you pass the quiz', 'you do not pass the quiz', 'passing the quiz']],
    [['you have a ticket', 'you do not have a ticket', 'having a ticket'], ['you get into the show', 'you do not get into the show', 'getting into the show']],
    [['you finish your chores', 'you do not finish your chores', 'finishing your chores'], ['you go to the movies', 'you do not go to the movies', 'going to the movies']],
    [['you practice every day', 'you do not practice every day', 'practicing every day'], ['you make the team', 'you do not make the team', 'making the team']],
    [['you know the password', 'you do not know the password', 'knowing the password'], ['you open the file', 'you do not open the file', 'opening the file']],
    [['you save enough money', 'you do not save enough money', 'saving enough money'], ['you buy the bike', 'you do not buy the bike', 'buying the bike']],
    [['you get a library card', 'you do not get a library card', 'getting a library card'], ['you borrow books', 'you do not borrow books', 'borrowing books']],
    [['you pay the entry fee', 'you do not pay the entry fee', 'paying the entry fee'], ['you run in the race', 'you do not run in the race', 'running in the race']],
    [['you turn in the form', 'you do not turn in the form', 'turning in the form'], ['you go on the field trip', 'you do not go on the field trip', 'going on the field trip']],
    [['you learn the rules', 'you do not learn the rules', 'learning the rules'], ['you play the game', 'you do not play the game', 'playing the game']],
    [['you water the seeds', 'you do not water the seeds', 'watering the seeds'], ['the seeds sprout', 'the seeds do not sprout', 'the seeds sprouting']],
    [['you charge the tablet', 'you do not charge the tablet', 'charging the tablet'], ['the tablet turns on', 'the tablet does not turn on', 'the tablet turning on']],
    [['you finish your homework', 'you do not finish your homework', 'finishing your homework'], ['you watch the game', 'you do not watch the game', 'watching the game']],
    [['you wear a helmet', 'you do not wear a helmet', 'wearing a helmet'], ['you ride in the bike parade', 'you do not ride in the bike parade', 'riding in the bike parade']],
    [['you sign up by Friday', 'you do not sign up by Friday', 'signing up by Friday'], ['you join the chess club', 'you do not join the chess club', 'joining the chess club']],
    [['you feed the fish every day', 'you do not feed the fish every day', 'feeding the fish every day'], ['the fish stay healthy', 'the fish do not stay healthy', 'keeping the fish healthy']],
    [['you have a passport', 'you do not have a passport', 'having a passport'], ['you travel abroad', 'you do not travel abroad', 'traveling abroad']],
    [['you return the book on time', 'you do not return the book on time', 'returning the book on time'], ['you avoid a late fee', 'you do not avoid a late fee', 'avoiding a late fee']],
    [['you bring a permission slip', 'you do not bring a permission slip', 'bringing a permission slip'], ['you visit the zoo with the class', 'you do not visit the zoo with the class', 'visiting the zoo with the class']],
    [['you plant the tulips in fall', 'you do not plant the tulips in fall', 'planting the tulips in fall'], ['the tulips bloom in spring', 'the tulips do not bloom in spring', 'the tulips blooming in spring']],
    [['you score a goal', 'you do not score a goal', 'scoring a goal'], ['the crowd cheers', 'the crowd does not cheer', 'the crowd cheering']],
    [['you preheat the oven', 'you do not preheat the oven', 'preheating the oven'], ['the bread bakes evenly', 'the bread does not bake evenly', 'the bread baking evenly']]
  ];
  // three related clauses: [clause, negated clause]
  var TRIO = [
    [['it rains', 'it does not rain'], ['the game is canceled', 'the game is not canceled'], ['we visit the museum', 'we do not visit the museum']],
    [['the oven is hot', 'the oven is not hot'], ['the dough has risen', 'the dough has not risen'], ['the bread bakes', 'the bread does not bake']],
    [['the bus is late', 'the bus is not late'], ['Maya walks to school', 'Maya does not walk to school'], ['Maya is on time', 'Maya is not on time']],
    [['the store is open', 'the store is not open'], ['we buy flour', 'we do not buy flour'], ['we make pancakes', 'we do not make pancakes']],
    [['the battery is charged', 'the battery is not charged'], ['the switch is on', 'the switch is not on'], ['the robot moves', 'the robot does not move']],
    [['Leo cleans his room', 'Leo does not clean his room'], ['Leo feeds the cat', 'Leo does not feed the cat'], ['Leo gets his allowance', 'Leo does not get his allowance']],
    [['the river freezes', 'the river does not freeze'], ['the ice is thick', 'the ice is not thick'], ['we go skating', 'we do not go skating']],
    [['the team wins', 'the team does not win'], ['the coach is happy', 'the coach is not happy'], ['practice is short', 'practice is not short']],
    [['the library is open', 'the library is not open'], ['Nora has her card', 'Nora does not have her card'], ['Nora borrows a book', 'Nora does not borrow a book']],
    [['the wind is strong', 'the wind is not strong'], ['the kite is in the air', 'the kite is not in the air'], ['the string pulls tight', 'the string does not pull tight']],
    [['the garden gets sun', 'the garden does not get sun'], ['the soil is wet', 'the soil is not wet'], ['the beans grow', 'the beans do not grow']],
    [['the lights are off', 'the lights are not off'], ['the movie starts', 'the movie does not start'], ['the room is quiet', 'the room is not quiet']],
    [['the trail is muddy', 'the trail is not muddy'], ['we wear boots', 'we do not wear boots'], ['we hike to the lake', 'we do not hike to the lake']],
    [['the printer has paper', 'the printer does not have paper'], ['the printer has ink', 'the printer does not have ink'], ['the poster prints', 'the poster does not print']]
  ];
  // classes for predicate logic: [plural noun, letter, "is a …" phrase]
  var KINDS = [
    ['dogs', 'D', 'is a dog'], ['mammals', 'M', 'is a mammal'], ['birds', 'B', 'is a bird'], ['pets', 'P', 'is a pet'], ['fish', 'F', 'is a fish'],
    ['students', 'S', 'is a student'], ['athletes', 'A', 'is an athlete'], ['musicians', 'U', 'is a musician'], ['readers', 'R', 'is a reader'],
    ['cats', 'C', 'is a cat'], ['whales', 'W', 'is a whale'], ['reptiles', 'L', 'is a reptile'], ['insects', 'I', 'is an insect'],
    ['teachers', 'T', 'is a teacher'], ['volunteers', 'V', 'is a volunteer'], ['gardeners', 'G', 'is a gardener'], ['helpers', 'H', 'is a helper'],
    ['nurses', 'N', 'is a nurse'], ['owls', 'O', 'is an owl'], ['eagles', 'E', 'is an eagle']
  ];
  // categorical pairs that read well together: [S index, P index] by noun
  var CAT_PAIRS = [['dogs', 'mammals'], ['dogs', 'pets'], ['cats', 'pets'], ['birds', 'pets'], ['whales', 'mammals'], ['whales', 'fish'], ['fish', 'pets'],
    ['students', 'athletes'], ['students', 'musicians'], ['athletes', 'readers'], ['musicians', 'readers'], ['teachers', 'volunteers'], ['volunteers', 'gardeners'],
    ['owls', 'birds'], ['eagles', 'birds'], ['reptiles', 'pets'], ['insects', 'pets'], ['nurses', 'volunteers'], ['gardeners', 'helpers'], ['cats', 'mammals']];
  function kindOf(noun) { for (var i = 0; i < KINDS.length; i++) if (KINDS[i][0] === noun) return KINDS[i]; throw new Error('no kind ' + noun); }
  function art(noun1) { return /^[aeiou]/.test(noun1) ? 'an' : 'a'; }
  function sing(k) { return k[2].replace(/^is an? /, ''); }


  // ================================================================== UNIT 1: Symbols and Translation
  var REL = ['are cousins', 'are neighbors', 'are twins', 'are pen pals', 'met at the library', 'shook hands', 'played a duet together', 'shared a pizza'];
  function twoNames(R) { return R.sample(NAMES, 2); }
  function key2(R) { var vp = R.pick(VP), nm = R.sample(NAMES, 3); return { vp: vp, n: nm }; }
  function keyLine(pairs) { return pairs.map(function (pr) { return '$' + pr[0] + '$: ' + pr[1]; }).join('; '); }

  G('sym.simple-compound', function (R, ctx) {
    var lv = ctx.level, vp = R.pick(VP), nm = R.sample(NAMES, 3), rel = R.pick(REL);
    var S = [ // [sentence, compound?, why, simple parts]
      [nm[0] + ' ' + vp[0] + '.', false, 'It makes one claim and has no other statement inside it.', 1],
      [nm[0] + ' and ' + nm[1] + ' ' + rel + '.', false, 'It states one relation between ' + nm[0] + ' and ' + nm[1] + '. It cannot be split into a claim about ' + nm[0] + ' alone and a claim about ' + nm[1] + ' alone, so the "and" joins two names, not two statements.', 1],
      [nm[0] + ' is taller than ' + nm[1] + '.', false, 'A comparison of two people is still one claim.', 1],
      [nm[0] + ' is unhappy about the rain.', false, '"Un-" is part of a word, not the connective "not".', 1],
      [nm[0] + ' ' + vp[2] + '.', true, 'It is the negation of "' + nm[0] + ' ' + vp[0] + '": a compound with one simple part.', 1],
      [nm[0] + ' and ' + nm[1] + ' ' + vp[1] + '.', true, 'It says "' + nm[0] + ' ' + vp[0] + '" and "' + nm[1] + ' ' + vp[0] + '": two statements joined by "and".', 2],
      ['Either ' + nm[0] + ' or ' + nm[1] + ' ' + vp[0] + '.', true, 'Two statements joined by "or".', 2],
      ['If ' + nm[0] + ' ' + vp[0] + ', then ' + nm[1] + ' ' + vp[0] + ' too.', true, 'Two statements joined by "if … then".', 2],
      [nm[0] + ' ' + vp[0] + ', but ' + nm[1] + ' ' + vp[2] + '.', true, '"But" joins two statements, just as "and" does.', 2],
      ['Neither ' + nm[0] + ' nor ' + nm[1] + ' ' + vp[0] + '.', true, 'It denies two statements: "' + nm[0] + ' ' + vp[0] + '" and "' + nm[1] + ' ' + vp[0] + '".', 2]
    ];
    var kind = R.pick(byLv(ctx, ['one', 'one', 'count'], ['one', 'one', 'count', 'which'], ['one', 'count', 'which', 'which']));
    if (kind === 'one') {
      var pool = lv === 1 ? [S[0], S[4], S[5], S[6], S[7]] : S;
      if (lv >= 2 && R.chance(0.5)) pool = [S[1], S[2], S[3], S[5]];
      var s = R.pick(pool);
      return { q: 'Is this statement simple or compound?<br><b>' + s[0] + '</b>', a: mcKeep(['Simple', 'Compound'], s[1] ? 'Compound' : 'Simple'),
        steps: ['A compound statement has another statement as a part, joined or changed by a word like not, and, or, if.', s[2], 'So it is ' + (s[1] ? 'compound' : 'simple') + '.'],
        hint: 'Can you split it into two statements, or find a "not" that applies to a whole statement?' };
    }
    if (kind === 'count') {
      var c = R.pick([S[4], S[5], S[6], S[7], S[8], S[9], S[0]]);
      var extra = lv >= 3 && R.coin();
      var sent = c[0], n = c[3];
      if (extra) { sent = 'If ' + nm[2] + ' ' + vp[0] + ', then ' + nm[0] + ' and ' + nm[1] + ' ' + vp[1] + '.'; n = 3; }
      var distinctN = n;
      return { q: 'How many different simple statements does this statement contain?<br><b>' + sent + '</b>', a: { t: 'num', v: String(extra ? 3 : distinctN), form: 'int' },
        steps: extra ? ['The simple statements are "' + nm[2] + ' ' + vp[0] + '", "' + nm[0] + ' ' + vp[0] + '" and "' + nm[1] + ' ' + vp[0] + '".', '"' + nm[0] + ' and ' + nm[1] + ' ' + vp[1] + '" is a conjunction of two of them.', 'So there are 3.']
          : [c[2], 'A negation contains the one statement it denies; "and", "or", "but", "neither … nor" and "if … then" join two.', 'So there ' + (distinctN === 1 ? 'is 1' : 'are ' + distinctN) + '.'],
        hint: 'List each claim that could be true or false on its own.' };
    }
    // which one is compound / simple
    var wantComp = R.coin();
    var right = wantComp ? R.pick([S[5], S[4], S[8]]) : R.pick([S[1], S[2], S[3]]);
    var wrongs = R.shuffle(S.filter(function (x) { return x[1] !== wantComp; })).slice(0, 3);
    return { q: 'Which of these statements is <b>' + (wantComp ? 'compound' : 'simple') + '</b>?', a: mc(right[0], wrongs.map(function (w) { return w[0]; })),
      steps: [right[0] + ' ' + right[2], 'Each of the others is ' + (wantComp ? 'simple' : 'compound') + '.'],
      hint: wantComp ? 'Look for two claims joined together, or a claim that is denied.' : 'Watch for "and" that joins two names in one relation rather than two statements.' };
  });

  G('sym.connectives', function (R, ctx) {
    var kind = R.pick(byLv(ctx, ['sym', 'name', 'trans'], ['trans', 'name', 'incl', 'trans'], ['trans', 'incl', 'trans']));
    var c = R.pick(['not', 'and', 'or', 'imp', 'iff']);
    if (kind === 'sym') {
      return { q: 'Which symbol stands for the connective "' + CWORD[c] + '"?', a: mcKeep(['$\\neg$', '$\\land$', '$\\lor$', '$\\to$', '$\\leftrightarrow$'], '$' + CTEX[c] + '$'),
        steps: ['$\\neg$ is not, $\\land$ is and, $\\lor$ is or, $\\to$ is if … then, $\\leftrightarrow$ is if and only if.', 'So "' + CWORD[c] + '" is $' + CTEX[c] + '$, the ' + CONN[c] + '.'], hint: 'The arrow with one head is "if … then".' };
    }
    if (kind === 'name') {
      var f = c === 'not' ? N(at('p')) : { t: c, a: at('p'), b: at('q') };
      return { q: 'What kind of compound is ' + m(f) + '?', a: mcKeep(['Negation', 'Conjunction', 'Disjunction', 'Conditional', 'Biconditional'], cap(CONN[c])),
        steps: ['The connective is $' + CTEX[c] + '$ (' + CWORD[c] + ').', 'A formula built with $' + CTEX[c] + '$ is a ' + CONN[c] + '.'], hint: '∧ joins conjuncts, ∨ joins disjuncts, → joins an antecedent to a consequent.' };
    }
    if (kind === 'incl') {
      var rows = [[true, true], [true, false], [false, true], [false, false]], r = R.pick(rows), op = R.pick(['or', 'or', 'and', 'imp', 'iff']);
      var g = { t: op, a: at('p'), b: at('q') }, v = LG().evalProp(g, { p: r[0], q: r[1] });
      return { q: 'Suppose $p$ is ' + (r[0] ? 'true' : 'false') + ' and $q$ is ' + (r[1] ? 'true' : 'false') + '. True or false: ' + m(g) + ' is true.', a: tf(v),
        steps: [op === 'or' ? 'In logic "or" is inclusive: $p \\lor q$ is true when at least one part is true, including when both are.' : op === 'and' ? '$p \\land q$ is true only when both parts are true.' : op === 'imp' ? '$p \\to q$ is false only when $p$ is true and $q$ is false.' : '$p \\leftrightarrow q$ is true when the parts have the same value.',
          'Here ' + m(g) + ' is ' + (v ? 'true' : 'false') + '.'], hint: op === 'or' ? 'Logical "or" allows both.' : 'Recall the one row where this connective is ' + (op === 'and' ? 'true' : 'false') + '.' };
    }
    // translate one connective, with a key
    var vp = R.pick(VP), nm = R.sample(NAMES, 2), sp = nm[0] + ' ' + vp[0], sq = nm[1] + ' ' + vp[0];
    var T = {
      not: [['It is not the case that ' + sp + '.', N(at('p'))], [nm[0] + ' ' + vp[2] + '.', N(at('p'))]],
      and: [[cap(sp) + ' and ' + sq + '.', A(at('p'), at('q'))], [nm[0] + ' and ' + nm[1] + ' ' + vp[1] + '.', A(at('p'), at('q'))]],
      or: [['Either ' + sp + ' or ' + sq + '.', O(at('p'), at('q'))], [cap(sp) + ', or ' + sq + '.', O(at('p'), at('q'))]],
      imp: [['If ' + sp + ', then ' + sq + '.', I(at('p'), at('q'))], [cap(sq) + ' if ' + sp + '.', I(at('p'), at('q'))]],
      iff: [[cap(sp) + ' if and only if ' + sq + '.', E(at('p'), at('q'))]]
    };
    var item = R.pick(T[c]);
    return { q: 'Let $p$: ' + sp + '; $q$: ' + sq + '. Write in symbols:<br><b>' + item[0] + '</b>', a: prop(item[1]),
      steps: ['The connective word is "' + (c === 'imp' && /if \w/.test(item[0]) && !/^If/.test(item[0]) ? 'if' : CWORD[c].replace(' … ', '…')) + '", the ' + CONN[c] + ' $' + CTEX[c] + '$.', c === 'imp' && !/^If/.test(item[0]) ? 'The part after "if" is the antecedent, so it goes first: ' + m(item[1]) + '.' : 'So the formula is ' + m(item[1]) + '.'],
      hint: 'Find the connective word, then put the letters in place.' };
  });

  G('sym.main-connective', function (R, ctx) {
    var lv = ctx.level, ls = lv === 1 ? ['p', 'q'] : ['p', 'q', 'r'];
    var kind = R.pick(byLv(ctx, ['main', 'main', 'neg'], ['main', 'main', 'neg', 'scope'], ['main', 'scope', 'neg']));
    if (kind === 'main' || (kind === 'scope' && lv < 2)) {
      var target = R.pick(['not', 'and', 'or', 'imp', 'iff']);
      var f = rformAll(R, ls, lv === 1 ? 2 : 3, [target]);
      var sub = kids(f).map(function (k) { return m(k); });
      return { q: 'What is the main connective of ' + m(f) + '?', a: mcKeep(['Negation ($\\neg$)', 'Conjunction ($\\land$)', 'Disjunction ($\\lor$)', 'Conditional ($\\to$)', 'Biconditional ($\\leftrightarrow$)'], cap(CONN[f.t]) + ' ($' + CTEX[f.t] + '$)'),
        steps: ['The main connective is the one outside every pair of parentheses: the one applied last.', f.t === 'not' ? 'Here $\\neg$ stands in front of the whole formula ' + sub[0] + '.' : 'Here $' + CTEX[f.t] + '$ joins ' + sub[0] + ' and ' + sub[1] + '.', 'So the formula is a ' + CONN[f.t] + '.'],
        hint: 'Cover up everything inside parentheses. Which connective is left?' };
    }
    if (kind === 'neg') { // write the negation of the whole formula
      var g = rformAll(R, ls, lv === 1 ? 1 : 2, ['and', 'or', 'imp']);
      return { q: 'Write the negation of the whole formula ' + m(g) + '.', a: prop(N(g), true),
        steps: ['To deny a whole compound, put $\\neg$ in front of it and keep its parentheses.', 'So the negation is ' + m(N(g)) + '.', 'Without the parentheses, ' + m({ t: g.t, a: N(g.a), b: g.b }) + ' would deny only ' + m(g.a) + '.'],
        hint: 'The ¬ has to cover everything, so the formula needs parentheses around it.' };
    }
    // scope: which formula says ...
    var a = at('p'), b = at('q'), op = R.pick(['and', 'or', 'imp']);
    var whole = N({ t: op, a: a, b: b }), part = { t: op, a: N(a), b: b };
    var askWhole = R.coin();
    var right = askWhole ? whole : part;
    var wrongs = [askWhole ? part : whole, { t: op, a: a, b: N(b) }, { t: op, a: N(a), b: N(b) }];
    return { q: askWhole ? 'Which formula denies the whole ' + CONN[op] + ' ' + m({ t: op, a: a, b: b }) + '?' : 'Which formula is a ' + CONN[op] + ' whose first part is ' + m(N(a)) + '?', a: fwrong(right, wrongs),
      steps: ['In ' + m(part) + ', the $\\neg$ covers only $p$; the main connective is $' + CTEX[op] + '$.', 'In ' + m(whole) + ', the $\\neg$ covers the whole ' + CONN[op] + '; the main connective is $\\neg$.', 'So the answer is ' + m(right) + '.'],
      hint: 'A ¬ covers only what comes right after it: one letter, or one whole pair of parentheses.' };
  });

  G('sym.translate-not-and-or', function (R, ctx) {
    var lv = ctx.level, vp = R.pick(VP), nm = R.sample(NAMES, 3);
    var p = at('p'), q = at('q'), r = at('r');
    var sp = nm[0] + ' ' + vp[0], sq = nm[1] + ' ' + vp[0], sr = nm[2] + ' ' + vp[0];
    var L1 = [
      [nm[0] + ' and ' + nm[1] + ' ' + vp[1] + '.', A(p, q), '"and" joins the two claims.'],
      ['Either ' + nm[0] + ' or ' + nm[1] + ' ' + vp[0] + '.', O(p, q), '"Either … or" is $\\lor$.'],
      [nm[0] + ' ' + vp[2] + '.', N(p), 'This denies $p$.'],
      [cap(sp) + ', and ' + nm[1] + ' ' + vp[2] + '.', A(p, N(q)), 'A conjunction of $p$ and the denial of $q$.']
    ];
    var L2 = [
      [cap(sp) + ', but ' + nm[1] + ' ' + vp[2] + '.', A(p, N(q)), '"But" is a conjunction: both parts are claimed.'],
      [nm[0] + ' ' + vp[2] + ', although ' + sq + '.', A(N(p), q), '"Although" also claims both parts, so it is $\\land$.'],
      ['Neither ' + nm[0] + ' nor ' + nm[1] + ' ' + vp[0] + '.', A(N(p), N(q)), '"Neither … nor" denies each one: not $p$ and not $q$ (or $\\neg(p \\lor q)$).'],
      ['It is not the case that both ' + nm[0] + ' and ' + nm[1] + ' ' + vp[1] + '.', N(A(p, q)), '"Not both" denies the conjunction: $\\neg(p \\land q)$ (or $\\neg p \\lor \\neg q$).'],
      ['Either ' + nm[0] + ' ' + vp[2] + ' or ' + nm[1] + ' ' + vp[2] + '.', O(N(p), N(q)), 'Each part is denied, then joined by "or".'],
      [cap(sp) + ', yet ' + nm[1] + ' ' + vp[2] + '.', A(p, N(q)), '"Yet" works like "but": $\\land$.'],
      ['It is not the case that either ' + nm[0] + ' or ' + nm[1] + ' ' + vp[0] + '.', N(O(p, q)), 'The denial covers the whole disjunction: $\\neg(p \\lor q)$, which says the same as "neither … nor".']
    ];
    var L3 = [
      [cap(sp) + ', but neither ' + nm[1] + ' nor ' + nm[2] + ' ' + vp[0] + '.', A(p, A(N(q), N(r))), '"But" joins $p$ to "neither $q$ nor $r$", which is $\\neg q \\land \\neg r$.'],
      ['Either ' + sp + ', or ' + nm[1] + ' and ' + nm[2] + ' ' + vp[1] + '.', O(p, A(q, r)), 'The comma marks the grouping: $p$, or both $q$ and $r$.'],
      ['Not both ' + nm[0] + ' and ' + nm[1] + ' ' + vp[1] + ', but ' + sr + '.', A(N(A(p, q)), r), '"Not both" is $\\neg(p \\land q)$; "but" adds $r$.'],
      ['Neither ' + nm[0] + ' nor ' + nm[1] + ' ' + vp[0] + ', yet ' + sr + '.', A(A(N(p), N(q)), r), '"Neither … nor" gives $\\neg p \\land \\neg q$; "yet" adds $r$.'],
      [nm[0] + ' and ' + nm[1] + ' ' + vp[1] + ', or else ' + nm[2] + ' ' + vp[2] + '.', O(A(p, q), N(r)), '"Or else" joins the conjunction to $\\neg r$.']
    ];
    var it = R.pick(lv === 1 ? L1 : lv === 2 ? L2 : L3.concat(R.chance(0.3) ? L2 : []));
    var three = /\br\b/.test(sh(it[1]));
    return { q: 'Let $p$: ' + sp + '; $q$: ' + sq + (three ? '; $r$: ' + sr : '') + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
      steps: [it[2], 'So: ' + m(it[1]) + '.'],
      hint: /neither/i.test(it[0]) ? 'Neither … nor denies each part.' : /both/i.test(it[0]) && /not/i.test(it[0]) ? '"Not both" denies the conjunction as a whole.' : 'Find the main connective word first.' };
  });

  G('sym.translate-conditionals', function (R, ctx) {
    var lv = ctx.level, sc = R.pick(SCEN), C = sc[0], Rs = sc[1], p = at('p'), q = at('q');
    // p: the condition clause, q: the result clause
    var F1 = [
      ['If ' + C[0] + ', then ' + Rs[0] + '.', I(p, q), 'The part after "if" is the antecedent.'],
      [cap(Rs[0]) + ' if ' + C[0] + '.', I(p, q), '"If" marks the antecedent, wherever it stands: $p$ comes first.'],
      [cap(Rs[0]) + ' provided that ' + C[0] + '.', I(p, q), '"Provided that" works like "if": it marks the antecedent.'],
      ['Whenever ' + C[0] + ', ' + Rs[0] + '.', I(p, q), '"Whenever" marks the antecedent.']
    ];
    var F2 = [
      [cap(Rs[0]) + ' only if ' + C[0] + '.', I(q, p), '"Only if" marks the consequent: the part after it is the necessary condition. So $q \\to p$.'],
      [cap(C[2]) + ' is sufficient for ' + Rs[2] + '.', I(p, q), 'A sufficient condition is the antecedent: $p \\to q$.'],
      [cap(C[2]) + ' is necessary for ' + Rs[2] + '.', I(q, p), 'A necessary condition is the consequent: whenever $q$ happens, $p$ must have. So $q \\to p$.'],
      [cap(Rs[1]) + ' unless ' + C[0] + '.', I(q, p), '"$X$ unless $Y$" means "if not $Y$, then $X$": $\\neg p \\to \\neg q$, which is equivalent to $q \\to p$ (and to $\\neg q \\lor p$).'],
      ['If ' + C[1] + ', then ' + Rs[1] + '.', I(N(p), N(q)), 'Both parts are denied: $\\neg p \\to \\neg q$.']
    ];
    var F3 = [
      [cap(Rs[0]) + ' unless ' + C[1] + '.', O(q, N(p)), '"$X$ unless $Y$" is $X \\lor Y$ here: $q \\lor \\neg p$, which is equivalent to $p \\to q$.'],
      [cap(C[2]) + ' is necessary but not sufficient for ' + Rs[2] + '.', A(I(q, p), N(I(p, q))), 'Necessary: $q \\to p$. Not sufficient: $\\neg(p \\to q)$. Join them with $\\land$.'],
      [cap(C[2]) + ' is both necessary and sufficient for ' + Rs[2] + '.', E(p, q), 'Sufficient gives $p \\to q$, necessary gives $q \\to p$; together they make $p \\leftrightarrow q$.'],
      [cap(C[0]) + ' only if ' + Rs[0] + '.', I(p, q), '"Only if" marks the consequent: $p \\to q$ (even though this one sounds backward, the form decides).'],
      [cap(Rs[2]) + ' requires ' + C[2] + '.', I(q, p), 'What is required is necessary, so it is the consequent: $q \\to p$.']
    ].concat(F2.slice(0, 4));
    var it = R.pick(lv === 1 ? F1.concat([F2[0]]) : lv === 2 ? F2.concat([F1[1]]) : F3);
    return { q: 'Let $p$: ' + C[0] + '; $q$: ' + Rs[0] + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
      steps: [it[2], 'So: ' + m(it[1]) + '.'],
      hint: /only if/.test(it[0]) ? '"Only if" introduces the consequent, not the antecedent.' : /necessary|requires/.test(it[0]) ? 'A necessary condition goes after the arrow.' : /unless/.test(it[0]) ? '"Unless" can be read as "if not".' : 'Which part is the condition?' };
  });

  G('sym.translate-biconditional', function (R, ctx) {
    var lv = ctx.level, p = at('p'), q = at('q'), r = at('r');
    if (lv === 1 || (lv === 2 && R.chance(0.3))) {
      var sc = R.pick(SCEN), C = sc[0], Rs = sc[1];
      var B = [
        [cap(Rs[0]) + ' if and only if ' + C[0] + '.', E(q, p), '"If and only if" is $\\leftrightarrow$.'],
        [cap(C[0]) + ' just in case ' + Rs[0] + '.', E(p, q), '"Just in case" means "if and only if" in logic.'],
        [cap(Rs[0]) + ' if ' + C[0] + ', and only if ' + C[0] + '.', E(q, p), '"If $p$" gives $p \\to q$ and "only if $p$" gives $q \\to p$: together $q \\leftrightarrow p$.'],
        [cap(Rs[1]) + ' if and only if ' + C[1] + '.', E(N(q), N(p)), 'Both sides are denied: $\\neg q \\leftrightarrow \\neg p$ (equivalent to $q \\leftrightarrow p$).'],
        [cap(C[2]) + ' is necessary and sufficient for ' + Rs[2] + '.', E(p, q), '"Necessary and sufficient" gives both arrows: $p \\leftrightarrow q$.'],
        [cap(C[0]) + ' exactly when ' + Rs[0] + '.', E(p, q), '"Exactly when" is another way to say "if and only if": $\\leftrightarrow$.']
      ];
      var b = R.pick(B);
      return { q: 'Let $p$: ' + C[0] + '; $q$: ' + Rs[0] + '. Write in symbols:<br><b>' + b[0] + '</b>', a: prop(b[1]), steps: [b[2], 'So: ' + m(b[1]) + '.'], hint: 'A biconditional says each side is necessary and sufficient for the other.' };
    }
    var t = R.pick(TRIO), x = t[0], y = t[1], z = t[2];
    var LONG = [
      ['If ' + x[0] + ' and ' + y[0] + ', then ' + z[0] + '.', I(A(p, q), r), 'The "if" part is the conjunction $p \\land q$; the main connective is $\\to$.'],
      ['If ' + x[0] + ', then either ' + y[0] + ' or ' + z[0] + '.', I(p, O(q, r)), '"Either … or" groups $q \\lor r$ inside the consequent.'],
      ['Either ' + x[0] + ' or ' + y[0] + ', and ' + z[1] + '.', A(O(p, q), N(r)), 'The comma before "and" makes $\\land$ the main connective: $(p \\lor q) \\land \\neg r$.'],
      [cap(z[0]) + ' if and only if both ' + x[0] + ' and ' + y[0] + '.', E(r, A(p, q)), '"Both … and" groups $p \\land q$; the main connective is $\\leftrightarrow$.'],
      ['If ' + x[0] + ', then if ' + y[0] + ', ' + z[0] + '.', I(p, I(q, r)), 'The consequent is itself a conditional: $q \\to r$.'],
      ['If either ' + x[0] + ' or ' + y[0] + ', then ' + z[0] + '.', I(O(p, q), r), '"Either … or" groups the antecedent: $(p \\lor q) \\to r$.'],
      [cap(z[0]) + ' only if both ' + x[0] + ' and ' + y[0] + '.', I(r, A(p, q)), '"Only if" marks the consequent, here the conjunction $p \\land q$.'],
      [cap(x[0]) + ', and if ' + y[0] + ' then ' + z[0] + '.', A(p, I(q, r)), 'The first comma marks the main connective $\\land$; the second part is $q \\to r$.'],
      ['It is not the case that if ' + x[0] + ' then ' + y[0] + '.', N(I(p, q)), 'The denial covers the whole conditional: $\\neg(p \\to q)$.'],
      [cap(z[0]) + ' unless ' + x[0] + ' and ' + y[0] + '.', I(N(A(p, q)), r), '"$Z$ unless $W$" is "if not $W$, then $Z$", where $W$ is $p \\land q$: $\\neg(p \\land q) \\to r$ (equivalently $(p \\land q) \\lor r$).']
    ];
    var it = R.pick(lv === 2 ? LONG.slice(0, 6) : LONG);
    return { q: 'Let $p$: ' + x[0] + '; $q$: ' + y[0] + '; $r$: ' + z[0] + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
      steps: ['Find the main connective of the English first; commas, "either" and "both" show the grouping.', it[2], 'So: ' + m(it[1]) + '.'],
      hint: 'Which connective word joins the two biggest pieces of the sentence?' };
  });

  // English for a formula, keeping its grouping ("either … or", "both … and", "it is not the case that")
  function eng(f, key, top) {
    if (f.t === 'atom') return key[f.p][0];
    if (f.t === 'not') return f.a.t === 'atom' ? key[f.a.p][1] : f.a.t === 'and' ? 'it is not the case that both ' + eng(f.a.a, key) + ' and ' + eng(f.a.b, key) : 'it is not the case that ' + eng(f.a, key);
    var a = eng(f.a, key), b = eng(f.b, key);
    if (f.t === 'and') return (top ? '' : 'both ') + a + (top ? ', and ' : ' and ') + b;
    if (f.t === 'or') return 'either ' + a + ' or ' + b;
    if (f.t === 'imp') return 'if ' + a + ', then ' + b;
    return a + ' if and only if ' + b;
  }
  G('sym.symbols-to-english', function (R, ctx) {
    var lv = ctx.level, t = R.pick(TRIO), key = { p: t[0], q: t[1], r: t[2] };
    var ls = lv === 1 ? ['p', 'q'] : ['p', 'q', 'r'];
    var f = rformAll(R, ls, lv === 1 ? 1 : 2, lv === 1 ? ['and', 'or', 'imp', 'iff'] : null, [3, 3, 3, 3, 1]);
    if (lv >= 2 && R.chance(0.5)) f = R.pick([N(A(at('p'), at('q'))), A(N(at('p')), at('q')), N(O(at('p'), at('q'))), I(at('p'), O(at('q'), at('r'))), O(I(at('p'), at('q')), at('r')), I(A(at('p'), at('q')), at('r')), A(at('p'), I(at('q'), at('r')))]);
    var used = letters([f]);
    var right = cap(eng(f, key, true)) + '.';
    var variants = [];
    if (f.t === 'imp') variants.push(I(f.b, f.a));
    if (f.t === 'not' && isBin(f.a)) variants.push({ t: f.a.t, a: N(f.a.a), b: f.a.b }, { t: f.a.t === 'and' ? 'and' : 'and', a: N(f.a.a), b: N(f.a.b) });
    if (isBin(f) && isBin(f.b)) variants.push({ t: f.b.t, a: { t: f.t, a: f.a, b: f.b.a }, b: f.b.b });
    if (isBin(f) && isBin(f.a)) variants.push({ t: f.a.t, a: f.a.a, b: { t: f.t, a: f.a.b, b: f.b } });
    if (isBin(f)) variants.push({ t: f.t === 'and' ? 'or' : f.t === 'or' ? 'and' : f.t === 'imp' ? 'iff' : 'imp', a: f.a, b: f.b });
    variants.push(N(f)); if (f.t === 'not') variants.push(f.a);
    var wrong = [];
    variants.forEach(function (v) { if (!LG().equivalent(v, f)) { var s = cap(eng(v, key, true)) + '.'; if (s !== right && wrong.indexOf(s) < 0) wrong.push(s); } });
    var keyText = used.map(function (l) { return '$' + l + '$: ' + key[l][0]; }).join('; ');
    return { q: 'Let ' + keyText + '. Which sentence says ' + m(f) + '?', a: mc(right, wrong.slice(0, 3)),
      steps: ['The main connective of ' + m(f) + ' is ' + (f.t === 'atom' ? 'none' : '$' + CTEX[f.t] + '$') + ', so the sentence is ' + (f.t === 'atom' ? 'simple' : 'a ' + CONN[f.t]) + ' as a whole.', 'Read it from the main connective inward, using "either … or", "both … and" and "it is not the case that" to keep the grouping.', 'So: ' + right],
      hint: 'Start with the main connective, then read each part.' };
  });


  // ================================================================== UNIT 2: Truth Tables
  var TFCH = ['T', 'F'];
  function rowLabel(v, ls) { return ls.map(function (l) { return '$' + l + '$ ' + TV(v[l]); }).join(', '); }
  function rowsOf(ls) { return LG().rows(ls); }

  G('sym.truth-functions', function (R, ctx) {
    var op = R.pick(['and', 'or', 'imp', 'iff', 'imp', 'or']), f = { t: op, a: at('p'), b: at('q') };
    var kind = R.pick(byLv(ctx, ['value', 'value', 'not', 'words'], ['value', 'column', 'rows', 'words'], ['column', 'rows', 'value', 'words']));
    var rows = rowsOf(['p', 'q']);
    if (kind === 'words') {
      var vp = R.pick(VP), nm = R.sample(NAMES, 2), r0 = R.pick(rows), op2 = R.pick(['and', 'or', 'imp', 'or', 'imp']);
      var said = op2 === 'and' ? nm[0] + ' and ' + nm[1] + ' ' + vp[1] : op2 === 'or' ? 'either ' + nm[0] + ' or ' + nm[1] + ' ' + vp[0] : 'if ' + nm[0] + ' ' + vp[0] + ', then ' + nm[1] + ' ' + vp[0];
      var val = LG().evalProp({ t: op2, a: at('p'), b: at('q') }, r0);
      return { q: 'Suppose "' + nm[0] + ' ' + vp[0] + '" is ' + (r0.p ? 'true' : 'false') + ' and "' + nm[1] + ' ' + vp[0] + '" is ' + (r0.q ? 'true' : 'false') + '. Is this statement true or false?<br><b>' + cap(said) + '.</b>', a: mcKeep(['True', 'False'], val ? 'True' : 'False'),
        steps: ['In symbols the statement is ' + m({ t: op2, a: at('p'), b: at('q') }) + ', with $p$ ' + TV(r0.p) + ' and $q$ ' + TV(r0.q) + '.', rule(op2), 'So it is ' + (val ? 'true' : 'false') + '.'],
        hint: op2 === 'imp' ? 'A conditional is false only when its "if" part is true and its "then" part is false.' : op2 === 'or' ? 'Logical "or" is true when at least one part is.' : 'A conjunction needs both parts.' };
    }
    function rule(o) { return o === 'and' ? '$p \\land q$ is true only when both parts are true.' : o === 'or' ? '$p \\lor q$ is false only when both parts are false (it is true when either or both are true).' : o === 'imp' ? '$p \\to q$ is false only when $p$ is true and $q$ is false; with a false antecedent it is true.' : '$p \\leftrightarrow q$ is true when $p$ and $q$ have the same value.'; }
    if (kind === 'not') {
      var b = R.coin();
      return { q: 'If $p$ is ' + (b ? 'true' : 'false') + ', what is the value of $\\neg p$?', a: mcKeep(TFCH, TV(!b)), steps: ['A negation has the opposite value of what it denies.', 'So $\\neg p$ is ' + TV(!b) + '.'], hint: 'Negation flips the value.' };
    }
    if (kind === 'value') {
      var r = op === 'imp' && R.chance(0.5) ? R.pick([rows[2], rows[3]]) : R.pick(rows), v = LG().evalProp(f, r);
      return { q: 'If $p$ is ' + TV(r.p) + ' and $q$ is ' + TV(r.q) + ', what is the value of ' + m(f) + '?', a: mcKeep(TFCH, TV(v)),
        steps: [rule(op), 'With $p$ ' + TV(r.p) + ' and $q$ ' + TV(r.q) + ', ' + m(f) + ' is ' + TV(v) + '.'],
        hint: op === 'imp' ? 'A conditional is false in one row only.' : 'Recall the one row that makes this connective different.' };
    }
    if (kind === 'column') {
      return { q: 'Fill in the column for ' + m(f) + '. Give its value in each row.', a: { t: 'multi', parts: rows.map(function (r) { return { label: '$p$ ' + TV(r.p) + ', $q$ ' + TV(r.q) + ':', a: tf(LG().evalProp(f, r)) }; }) },
        steps: [rule(op)].concat(rows.map(function (r) { return 'Row $p$ ' + TV(r.p) + ', $q$ ' + TV(r.q) + ': ' + TV(LG().evalProp(f, r)) + '.'; })),
        hint: 'Find the row (or rows) where it differs from the others.' };
    }
    // which row(s) make it false / true
    var want = op === 'and' ? true : false;
    var hits = rows.map(function (r, i) { return LG().evalProp(f, r) === want ? i : -1; }).filter(function (i) { return i >= 0; });
    var choices = rows.map(function (r) { return '$p$ ' + TV(r.p) + ', $q$ ' + TV(r.q); });
    var a = { t: 'mc', choices: choices, v: hits.length === 1 ? hits[0] : hits, keep: true };
    return { q: 'In which row' + (hits.length > 1 ? 's' : '') + ' is ' + m(f) + ' ' + (want ? 'true' : 'false') + '?' + (hits.length > 1 ? ' Choose all that apply.' : ''), a: a,
      steps: [rule(op), 'So ' + m(f) + ' is ' + (want ? 'true' : 'false') + ' when ' + hits.map(function (i) { return choices[i]; }).join('; and when ') + '.'],
      hint: 'Check each row against the rule for ' + CONN[op] + 's.' };
  });

  G('sym.compute-truth-value', function (R, ctx) {
    var lv = ctx.level, ls = lv === 1 ? ['p', 'q'] : ['p', 'q', 'r'];
    var f = rformAll(R, ls, lv === 1 ? 2 : lv === 2 ? 2 : 3);
    if (size(f) < 4) f = rformAll(R, ls, 3);
    var val = {}; ls.forEach(function (l) { val[l] = R.coin(); });
    var v = LG().evalProp(f, val);
    var kind = lv >= 2 && R.chance(0.3) ? 'part' : 'whole';
    if (kind === 'part' && isBin(f)) {
      var part = R.pick(kids(f).filter(function (k) { return k.t !== 'atom'; }).concat([f.a]));
      if (part.t !== 'atom') {
        var pv = LG().evalProp(part, val);
        return { q: 'Suppose ' + valText(val, ls) + '. In ' + m(f) + ', what is the value of the part ' + m(part) + '?', a: mcKeep(TFCH, TV(pv)), steps: stepsEval(part, val), hint: 'Work from the innermost parentheses outward.' };
      }
    }
    return { q: 'Suppose ' + valText(val, ls) + '. What is the value of ' + m(f) + '?', a: mcKeep(TFCH, TV(v)),
      steps: stepsEval(f, val).concat(['So the whole formula is ' + TV(v) + '.']),
      hint: 'Find the values of the innermost parts first; the main connective comes last.' };
  });

  G('sym.truth-tables', function (R, ctx) {
    var lv = ctx.level;
    var kind = R.pick(byLv(ctx, ['rows', 'pattern', 'column'], ['column', 'count', 'pattern', 'rows'], ['count', 'column', 'pattern']));
    if (kind === 'rows') {
      var n = R.int(2, lv === 1 ? 3 : 4), ls = ['p', 'q', 'r', 's'].slice(0, n), f = rformAll(R, ls, n === 2 ? 2 : 3);
      return { q: 'How many rows does the truth table for ' + m(f) + ' need?', a: { t: 'num', v: String(1 << n), form: 'int' },
        steps: ['The formula has ' + n + ' different letters: ' + ls.map(function (l) { return '$' + l + '$'; }).join(', ') + '.', 'Each letter can be T or F, so the number of rows doubles with each letter: $2^{' + n + '} = ' + (1 << n) + '$.'],
        hint: 'Count the different letters, not how often they appear.' };
    }
    if (kind === 'pattern') {
      var n2 = lv === 1 ? R.int(2, 3) : 3, ls2 = ['p', 'q', 'r'].slice(0, n2), rows = rowsOf(ls2), k = R.int(1, rows.length), l = R.pick(ls2);
      var half = (1 << n2) >> (ls2.indexOf(l) + 1);
      return { q: 'A truth table for the letters ' + ls2.map(function (x) { return '$' + x + '$'; }).join(', ') + ' lists its ' + rows.length + ' rows in the standard order. What is the value of $' + l + '$ in row ' + k + '?', a: mcKeep(TFCH, TV(rows[k - 1][l])),
        steps: ['In the standard order the first letter is T for the first half of the rows and F for the second half; each later letter halves the block size again.', '$' + l + '$ runs in blocks of ' + half + ': ' + rows.map(function (r) { return TV(r[l]); }).join(' ') + '.', 'Row ' + k + ' has $' + l + '$ = ' + TV(rows[k - 1][l]) + '.'],
        hint: 'Write the column for that letter: blocks of T, then blocks of F.' };
    }
    if (kind === 'column') {
      var ls3 = ['p', 'q'], f3 = rformAll(R, ls3, 2), rows3 = rowsOf(ls3);
      if (size(f3) < 4) f3 = rformAll(R, ls3, 2, ['imp', 'and', 'or', 'iff']);
      return { q: 'Complete the final column of the truth table for ' + m(f3) + '.', a: { t: 'multi', parts: rows3.map(function (r) { return { label: '$p$ ' + TV(r.p) + ', $q$ ' + TV(r.q) + ':', a: tf(LG().evalProp(f3, r)) }; }) },
        viz: lv === 1 ? { name: 'lg-truthtable', opts: { formulas: [sh(f3)], sub: true, mode: 'fill', fill: 'last', quiet: true, verdict: false } } : undefined,
        steps: rows3.map(function (r) { return 'Row $p$ ' + TV(r.p) + ', $q$ ' + TV(r.q) + ': ' + evalSteps(f3, r).map(function (o) { return m(o.f) + ' ' + TV(o.v); }).join(', ') + '.'; }),
        hint: 'Work out each part column first, then the main connective.' };
    }
    var n4 = lv >= 3 ? 3 : R.int(2, 3), ls4 = ['p', 'q', 'r'].slice(0, n4), f4 = rformAll(R, ls4, 2 + (lv >= 3 ? 1 : 0));
    var t = LG().table([f4], ls4), cnt = t.rows.filter(function (r) { return r.values[0]; }).length;
    return { q: 'In how many rows of its truth table is ' + m(f4) + ' true?', a: { t: 'num', v: String(cnt), form: 'int' },
      steps: ['The table has $2^{' + n4 + '} = ' + (1 << n4) + '$ rows.', 'The final column is ' + t.rows.map(function (r) { return TV(r.values[0]); }).join(' ') + '.', 'So it is true in ' + cnt + ' row' + (cnt === 1 ? '' : 's') + '.'],
      hint: 'Build the table, then count the T values in the main column.' };
  });

  var TAUTS = ['A ∨ ¬A', 'A → A', '(A ∧ B) → A', 'A → (A ∨ B)', '¬(A ∧ ¬A)', '(A → B) ∨ (B → A)', '((A → B) ∧ A) → B', '(A → B) ↔ (¬B → ¬A)', 'A ↔ ¬¬A', '((A → B) ∧ ¬B) → ¬A', '(A ∧ B) → (A ∨ B)', 'A → (B → A)', '((A ∨ B) ∧ ¬A) → B'];
  var CONTRAS = ['A ∧ ¬A', '¬(A → A)', '(A ∧ B) ∧ ¬A', '¬(A ∨ ¬A)', 'A ↔ ¬A', '(A → B) ∧ (A ∧ ¬B)', '¬((A ∧ B) → A)', '(A ∨ B) ∧ (¬A ∧ ¬B)', '¬(A → (B → A))'];
  var CONTS = ['A → B', '(A ∨ B) → A', 'A ↔ B', '(A → B) → (B → A)', '(A ∧ B) ∨ ¬A', 'A ∧ (B ∨ ¬B)', '¬(A ∧ B)', '(A → B) ∧ ¬A', 'A ∨ (B ∧ ¬A)'];
  var CLS = { tautology: 'Tautology', contradiction: 'Self-contradiction', contingent: 'Contingent' };
  G('sym.tautology-contradiction', function (R, ctx) {
    var lv = ctx.level, want = R.pick(['tautology', 'contradiction', 'contingent']);
    var bank = want === 'tautology' ? TAUTS : want === 'contradiction' ? CONTRAS : CONTS;
    var map = lv === 1 ? { A: at('p'), B: at('q') } : lv === 2 ? R.pick([{ A: at('p'), B: at('q') }, { A: at('q'), B: at('p') }, { A: N(at('p')), B: at('q') }, { A: at('p'), B: N(at('q')) }]) : fill(R, 3, ['A', 'B']);
    var f = subst(R.pick(bank), map);
    if (lv >= 2 && R.chance(0.25)) f = rformAll(R, ['p', 'q'], 2);
    var c = LG().classify(f), t = LG().table([f]);
    var col = t.rows.map(function (r) { return TV(r.values[0]); }).join(' ');
    if (lv >= 2 && R.chance(0.35)) {
      var claim = R.pick(['tautology', 'contradiction', 'contingent']);
      return { q: 'True or false: ' + m(f) + ' is ' + (claim === 'contingent' ? 'contingent' : claim === 'tautology' ? 'a tautology' : 'a self-contradiction') + '.', a: tf(c === claim),
        steps: ['Its main column, row by row: ' + col + '.', c === 'tautology' ? 'It is true in every row, so it is a tautology.' : c === 'contradiction' ? 'It is false in every row, so it is a self-contradiction.' : 'It is true in some rows and false in others, so it is contingent.', 'So the statement is ' + (c === claim ? 'true' : 'false') + '.'],
        hint: 'Build the whole column: one F is enough to rule out a tautology.' };
    }
    return { q: 'Classify ' + m(f) + '.', a: mcKeep(['Tautology', 'Self-contradiction', 'Contingent'], CLS[c]),
      viz: lv === 1 ? { name: 'lg-truthtable', opts: { formulas: [sh(f)], sub: true, quiet: true, verdict: false } } : undefined,
      steps: ['Build the truth table. The main column, row by row: ' + col + '.', c === 'tautology' ? 'True in every row: a tautology.' : c === 'contradiction' ? 'False in every row: a self-contradiction.' : 'True in some rows and false in others: contingent.'],
      hint: 'Check every row; a tautology has no F at all, a self-contradiction no T.' };
  });

  var EQ_PAIRS = [ // [a, b] equivalent
    ['A → B', '¬A ∨ B'], ['A → B', '¬B → ¬A'], ['¬(A ∧ B)', '¬A ∨ ¬B'], ['¬(A ∨ B)', '¬A ∧ ¬B'], ['A ∨ (B ∧ C)', '(A ∨ B) ∧ (A ∨ C)'], ['(A ∧ B) → C', 'A → (B → C)'],
    ['A ↔ B', '(A → B) ∧ (B → A)'], ['A ↔ B', '(A ∧ B) ∨ (¬A ∧ ¬B)'], ['¬(A ↔ B)', '¬A ↔ B'], ['A ∨ B', '¬A → B'], ['¬(A → B)', 'A ∧ ¬B'], ['A ∧ (B ∨ C)', '(A ∧ B) ∨ (A ∧ C)'],
    ['A ∧ B', 'B ∧ A'], ['A ∨ B', 'B ∨ A'], ['A → ¬B', 'B → ¬A'], ['¬A → ¬B', 'B → A']];
  var NEQ_PAIRS = [ // [a, b] look alike, not equivalent
    ['A → B', 'B → A'], ['A → B', '¬A → ¬B'], ['¬(A ∧ B)', '¬A ∧ ¬B'], ['¬(A ∨ B)', '¬A ∨ ¬B'], ['(A ∧ B) → C', '(A → B) → C'], ['A ∨ B', 'A → ¬B'],
    ['¬(A → B)', '¬A → ¬B'], ['A ∨ (B ∧ C)', '(A ∨ B) ∧ C'], ['A → (B → C)', '(A → B) → C'], ['A ↔ B', 'A → B'], ['¬(A ↔ B)', '¬A ↔ ¬B'],
    ['A → ¬B', '¬A → B'], ['A ∧ ¬B', '¬(A ∧ B)'], ['¬A ∨ B', 'A ∨ ¬B']];
  function pairMap(R, lv) { return lv === 1 ? R.pick([{ A: at('p'), B: at('q'), C: at('r') }, { A: at('q'), B: at('p'), C: at('r') }]) : lv === 2 ? R.pick([{ A: at('p'), B: at('q'), C: at('r') }, { A: at('q'), B: at('p'), C: at('r') }, { A: N(at('p')), B: at('q'), C: at('r') }]) : fill(R, 2, ['A', 'B', 'C']); }
  function diffRow(a, b) { var t = LG().table([a, b]); for (var i = 0; i < t.rows.length; i++) if (t.rows[i].values[0] !== t.rows[i].values[1]) return { i: i, row: t.rows[i], ls: t.letters }; return null; }
  G('sym.equivalence', function (R, ctx) {
    var lv = ctx.level, map = pairMap(R, lv), eq = R.coin();
    var pr = R.pick(eq ? EQ_PAIRS : NEQ_PAIRS), a = subst(pr[0], map), b = subst(pr[1], map);
    var isEq = LG().equivalent(a, b), d = diffRow(a, b), t = LG().table([a, b]);
    var kind = R.pick(byLv(ctx, ['tf'], ['tf', 'mc'], ['tf', 'mc', 'row']));
    if (kind === 'row' && d && t.rows.some(function (r) { return r.values[0] === r.values[1]; })) {
      return { q: 'The formulas ' + m(a) + ' and ' + m(b) + ' are not equivalent. Which row shows it?', a: mc(rowLabel(d.row.val, d.ls), t.rows.filter(function (r) { return r.values[0] === r.values[1]; }).map(function (r) { return rowLabel(r.val, d.ls); }).slice(0, 3)),
        steps: ['Two formulas are equivalent only if they match in every row.', 'In the row ' + rowLabel(d.row.val, d.ls) + ', ' + m(a) + ' is ' + TV(d.row.values[0]) + ' but ' + m(b) + ' is ' + TV(d.row.values[1]) + '.'],
        hint: 'Look for a row where one is T and the other F.' };
    }
    if (kind === 'mc') {
      var src = R.pick(EQ_PAIRS), a2 = subst(src[0], map), right = subst(src[1], map);
      var wr = NEQ_PAIRS.filter(function (np) { return np[0] === src[0]; }).map(function (np) { return subst(np[1], map); });
      wr = wr.concat([N(right), I(a2.b || a2, a2.a || a2), A(a2, N(right))]).filter(function (w) { return !LG().equivalent(w, a2); });
      return { q: 'Which formula is logically equivalent to ' + m(a2) + '?', a: fwrong(right, wr.slice(0, 3)),
        steps: ['Equivalent formulas have the same value in every row of a truth table.', m(a2) + ' and ' + m(right) + ' match in all ' + LG().table([a2, right]).rows.length + ' rows.', 'Each other choice differs from it in at least one row.'],
        hint: 'Test the choices row by row, or recall a known equivalence.' };
    }
    var cols = function (k) { return t.rows.map(function (r) { return TV(r.values[k]); }).join(' '); };
    return { q: 'Are ' + m(a) + ' and ' + m(b) + ' logically equivalent?', a: mcKeep(['Equivalent', 'Not equivalent'], isEq ? 'Equivalent' : 'Not equivalent'),
      viz: lv === 1 ? { name: 'lg-truthtable', opts: { formulas: [sh(a), sh(b)], quiet: true, verdict: false } } : undefined,
      steps: ['Column for ' + m(a) + ': ' + cols(0) + '.', 'Column for ' + m(b) + ': ' + cols(1) + '.', isEq ? 'They match in every row, so they are equivalent.' : 'They differ in the row ' + rowLabel(d.row.val, d.ls) + ', so they are not equivalent.'],
      hint: 'Compare the two columns in every row, not just the rows where they are true.' };
  });

  G('sym.de-morgan', function (R, ctx) {
    var lv = ctx.level, a = piece(R, lv, ['p', 'q', 'r'], []), used = [a], b = piece(R, lv, ['p', 'q', 'r', 's'], used);
    var op = R.pick(['and', 'or']), other = op === 'and' ? 'or' : 'and';
    var neg = N({ t: op, a: a, b: b });
    function inside(x, y) { return [{ t: other, a: N(x), b: N(y) }, { t: other, a: negx(N(x)), b: N(y) }, { t: other, a: N(x), b: negx(N(y)) }, { t: other, a: negx(N(x)), b: negx(N(y)) }, { t: other, a: N(y), b: N(x) }, { t: other, a: negx(N(y)), b: negx(N(x)) }]; }
    var kind = R.pick(byLv(ctx, ['in', 'mc'], ['in', 'out', 'mc'], ['in', 'out', 'mc', 'english']));
    var out = inside(a, b)[0];
    if (kind === 'in') {
      return { q: 'Use De Morgan\'s law to move the negation inside: rewrite ' + m(neg) + ' without a $\\neg$ in front of the parentheses.', a: prop(inside(a, b), true),
        steps: ['De Morgan: $\\neg(p \\' + (op === 'and' ? 'land' : 'lor') + ' q)$ is equivalent to $\\neg p \\' + (other === 'and' ? 'land' : 'lor') + ' \\neg q$. The negation goes onto each part, and $' + CTEX[op] + '$ turns into $' + CTEX[other] + '$.', 'Here the parts are ' + m(a) + ' and ' + m(b) + '.', 'So ' + m(neg) + ' becomes ' + m(out) + (a.t === 'not' || b.t === 'not' ? ' (a double negation like $\\neg \\neg p$ may be written as $p$).' : '.')],
        hint: 'Negate each part and switch the connective.' };
    }
    if (kind === 'out') {
      var from = { t: other, a: N(a), b: N(b) };
      return { q: 'Use De Morgan\'s law to rewrite ' + m(from) + ' as the negation of a single ' + (op === 'and' ? 'conjunction' : 'disjunction') + '.', a: prop([neg, N({ t: op, a: b, b: a })], true),
        steps: ['Read De Morgan right to left: $\\neg p \\' + (other === 'and' ? 'land' : 'lor') + ' \\neg q$ is equivalent to $\\neg(p \\' + (op === 'and' ? 'land' : 'lor') + ' q)$.', 'Take the negation off each part, switch $' + CTEX[other] + '$ to $' + CTEX[op] + '$, and negate the whole: ' + m(neg) + '.'],
        hint: 'Pull the negation out and switch the connective.' };
    }
    if (kind === 'english') {
      var vp = R.pick(VP), nm = R.sample(NAMES, 2);
      var andCase = op === 'and';
      var sent = andCase ? 'It is not the case that both ' + nm[0] + ' and ' + nm[1] + ' ' + vp[1] + '.' : 'It is not the case that either ' + nm[0] + ' or ' + nm[1] + ' ' + vp[0] + '.';
      var right = andCase ? 'Either ' + nm[0] + ' ' + vp[2] + ' or ' + nm[1] + ' ' + vp[2] + '.' : cap(nm[0]) + ' ' + vp[2] + ', and ' + nm[1] + ' ' + vp[2] + '.';
      var wrong = andCase ? [cap(nm[0]) + ' ' + vp[2] + ', and ' + nm[1] + ' ' + vp[2] + '.', 'Either ' + nm[0] + ' or ' + nm[1] + ' ' + vp[0] + '.', cap(nm[0]) + ' ' + vp[2] + ', but ' + nm[1] + ' ' + vp[0] + '.']
        : ['Either ' + nm[0] + ' ' + vp[2] + ' or ' + nm[1] + ' ' + vp[2] + '.', cap(nm[0]) + ' and ' + nm[1] + ' ' + vp[1] + '.', cap(nm[0]) + ' ' + vp[2] + ', but ' + nm[1] + ' ' + vp[0] + '.'];
      return { q: 'Which sentence says the same thing as this one?<br><b>' + sent + '</b>', a: mc(right, wrong),
        steps: ['In symbols the sentence is ' + m(neg.t ? N({ t: op, a: at('p'), b: at('q') }) : neg) + ', with $p$: ' + nm[0] + ' ' + vp[0] + ' and $q$: ' + nm[1] + ' ' + vp[0] + '.', 'De Morgan turns it into ' + m({ t: other, a: N(at('p')), b: N(at('q')) }) + '.', 'In words: ' + right],
        hint: andCase ? '"Not both" leaves room for one of them.' : '"Not either" means neither one.' };
    }
    var wrongs = [{ t: op, a: N(a), b: N(b) }, { t: other, a: N(a), b: b }, { t: other, a: a, b: N(b) }, N({ t: other, a: a, b: b })];
    return { q: 'Which formula is equivalent to ' + m(neg) + '?', a: fwrong(out, wrongs.filter(function (w) { return !LG().equivalent(w, neg); })),
      steps: ['De Morgan: negating a ' + (op === 'and' ? 'conjunction' : 'disjunction') + ' gives a ' + (other === 'and' ? 'conjunction' : 'disjunction') + ' of the negations.', 'So ' + m(neg) + ' is equivalent to ' + m(out) + '.', 'Keeping $' + CTEX[op] + '$ while moving the $\\neg$ inside is the classic slip; a truth table shows the rows where it differs.'],
      hint: 'When the negation moves inside, the connective switches.' };
  });

  G('sym.conditional-family', function (R, ctx) {
    var lv = ctx.level, a = piece(R, lv, ['p', 'q', 'r'], []), b = piece(R, lv, ['p', 'q', 'r', 's'], [a]);
    var f = I(a, b), conv = I(b, a), inv = I(N(a), N(b)), contra = I(N(b), N(a));
    var forms = { converse: conv, inverse: inv, contrapositive: contra };
    function variants(name) { // with double negations removed or kept
      if (name === 'converse') return [conv];
      if (name === 'inverse') return [inv, I(negx(N(a)), N(b)), I(N(a), negx(N(b))), I(negx(N(a)), negx(N(b)))];
      return [contra, I(negx(N(b)), N(a)), I(N(b), negx(N(a))), I(negx(N(b)), negx(N(a)))];
    }
    var kind = R.pick(byLv(ctx, ['write', 'which'], ['write', 'which', 'tf', 'english'], ['write', 'tf', 'english', 'which']));
    var name = R.pick(['converse', 'inverse', 'contrapositive', 'contrapositive']);
    if (kind === 'write') {
      return { q: 'Write the ' + name + ' of ' + m(f) + '.', a: prop(variants(name), true),
        steps: ['For $p \\to q$: the converse is $q \\to p$, the inverse is $\\neg p \\to \\neg q$, and the contrapositive is $\\neg q \\to \\neg p$.', 'Here $p$ is ' + m(a) + ' and $q$ is ' + m(b) + '.', 'So the ' + name + ' is ' + m(forms[name]) + (/¬¬/.test(sh(forms[name])) ? ' (you may cancel a double negation).' : '.')],
        hint: name === 'contrapositive' ? 'Swap the parts and negate both.' : name === 'converse' ? 'Swap the parts.' : 'Negate both parts, without swapping.' };
    }
    if (kind === 'tf') {
      var nm2 = R.pick(['converse', 'inverse', 'contrapositive']), eq = LG().equivalent(forms[nm2], f), d = diffRow(f, forms[nm2]);
      return { q: 'True or false: ' + m(f) + ' is logically equivalent to its ' + nm2 + ', ' + m(forms[nm2]) + '.', a: tf(eq),
        steps: eq ? ['A conditional and its contrapositive are true in exactly the same rows.', 'So the statement is true.'] : ['In the row ' + rowLabel(d.row.val, d.ls) + ', ' + m(f) + ' is ' + TV(d.row.values[0]) + ' but its ' + nm2 + ' is ' + TV(d.row.values[1]) + '.', 'So they are not equivalent: the statement is false.'],
        hint: 'Only one of the three relatives is equivalent to the original.' };
    }
    if (kind === 'english') {
      var sc = R.pick(SCEN), C = sc[0], Rr = sc[1], nm3 = R.pick(['converse', 'inverse', 'contrapositive']);
      var E1 = { original: 'If ' + C[0] + ', then ' + Rr[0] + '.', converse: 'If ' + Rr[0] + ', then ' + C[0] + '.', inverse: 'If ' + C[1] + ', then ' + Rr[1] + '.', contrapositive: 'If ' + Rr[1] + ', then ' + C[1] + '.' };
      return { q: 'Which sentence is the <b>' + nm3 + '</b> of this one?<br><b>' + E1.original + '</b>', a: mc(E1[nm3], ['converse', 'inverse', 'contrapositive', 'original'].filter(function (x) { return x !== nm3; }).map(function (x) { return E1[x]; })),
        steps: ['Converse: swap the parts. Inverse: negate both parts. Contrapositive: swap and negate both.', 'So the ' + nm3 + ' is: ' + E1[nm3]],
        hint: 'Which parts get swapped, and which get "not"?' };
    }
    return { q: 'Which of these is logically equivalent to ' + m(f) + '?', a: fwrong(contra, [conv, inv, I(N(a), b)]),
      steps: ['The contrapositive ' + m(contra) + ' is equivalent to the original: both are false only when ' + m(a) + ' is true and ' + m(b) + ' is false.', 'The converse and the inverse are equivalent to each other, but not to the original.'],
      hint: 'Swap and negate.' };
  });

  function pairClass(a, b) {
    var t = LG().table([a, b]);
    if (t.rows.every(function (r) { return r.values[0] !== r.values[1]; })) return 'Contradictory';
    if (t.rows.some(function (r) { return r.values[0] && r.values[1]; })) return 'Consistent';
    return 'Inconsistent but not contradictory';
  }
  var PAIRS_REL = {
    'Contradictory': [['A', '¬A'], ['A → B', 'A ∧ ¬B'], ['A ∨ B', '¬A ∧ ¬B'], ['A ↔ B', 'A ↔ ¬B'], ['A ∧ B', '¬A ∨ ¬B'], ['¬(A → B)', '¬A ∨ B'], ['A ∧ ¬B', '¬A ∨ B'], ['A ∨ ¬B', '¬A ∧ B']],
    'Inconsistent but not contradictory': [['A ∧ B', '¬A ∧ B'], ['A ∧ B', '¬B'], ['A', '¬A ∧ B'], ['A ↔ B', 'A ∧ ¬B'], ['A ∧ ¬B', 'B ∧ A'], ['¬(A ∨ B)', 'A ∧ B'], ['A ∧ B', '¬A'], ['¬A ∧ ¬B', 'A ∧ B']],
    'Consistent': [['A → B', 'B → A'], ['A ∨ B', '¬A'], ['A → B', '¬A'], ['A ∧ B', 'A ∨ ¬B'], ['¬(A ∧ B)', 'A'], ['A ↔ B', '¬A'], ['A ∨ B', 'B'], ['A → B', 'B'], ['¬A ∨ ¬B', 'A']]
  };
  G('sym.statement-relations', function (R, ctx) {
    var lv = ctx.level, cls = R.pick(Object.keys(PAIRS_REL)), pr = R.pick(PAIRS_REL[cls]), map = pairMap(R, lv);
    var a = subst(pr[0], map), b = subst(pr[1], map), c = pairClass(a, b), t = LG().table([a, b]);
    var kind = lv >= 2 && R.chance(0.3) ? 'set' : 'pair';
    if (kind === 'set') {
      var x = rformAll(R, ['p', 'q'], 1, ['or', 'imp']), y = R.pick([N(at('p')), N(at('q')), at('p'), at('q')]), z = rformAll(R, ['p', 'q'], 1, ['imp', 'or', 'and']);
      var ok = LG().consistent([x, y, z]), tt = LG().table([x, y, z]), row = tt.rows.filter(function (r) { return r.values.every(Boolean); })[0];
      return { q: 'Are these three statements consistent (can all of them be true together)?<br>' + m(x) + ', ' + m(y) + ', ' + m(z), a: mcKeep(['Consistent', 'Inconsistent'], ok ? 'Consistent' : 'Inconsistent'),
        steps: ['Statements are consistent if at least one row of their joint truth table makes all of them true.', ok ? 'The row ' + rowLabel(row.val, tt.letters) + ' makes all three true.' : 'No row makes all three true: in each of the ' + tt.rows.length + ' rows at least one is false.', 'So they are ' + (ok ? 'consistent.' : 'inconsistent.')],
        hint: 'Look for one row where all of them are T.' };
    }
    var cols = function (k) { return t.rows.map(function (r) { return TV(r.values[k]); }).join(' '); };
    return { q: 'How are ' + m(a) + ' and ' + m(b) + ' related?', a: mcKeep(['Contradictory', 'Inconsistent but not contradictory', 'Consistent'], c),
      viz: lv === 1 ? { name: 'lg-truthtable', opts: { formulas: [sh(a), sh(b)], quiet: true, verdict: false } } : undefined,
      steps: ['Columns: ' + m(a) + ' ' + cols(0) + '; ' + m(b) + ' ' + cols(1) + '.',
        c === 'Contradictory' ? 'They have opposite values in every row: contradictory.' : c === 'Consistent' ? 'At least one row makes both true: consistent.' : 'No row makes both true, so they are inconsistent; but some row makes both false, so they are not contradictory.'],
      hint: 'First look for a row where both are T; then check whether they ever share an F.' };
  });


  // arguments: valid forms and invalid look-alikes, filled with pieces
  var ARGS = [
    [['A → B', 'A'], 'B'], [['A → B', '¬B'], '¬A'], [['A → B', 'B → C'], 'A → C'], [['A ∨ B', '¬A'], 'B'], [['A ∨ B', '¬B'], 'A'],
    [['A → B', 'B'], 'A'], [['A → B', '¬A'], '¬B'], [['A ∨ B', 'A'], '¬B'], [['A → B', 'A → C'], 'B → C'], [['A → B'], 'B → A'],
    [['A ∧ B'], 'A'], [['A'], 'A ∨ B'], [['A → B', 'C → B'], 'A → C'], [['A ∨ B', 'A → C', 'B → C'], 'C'], [['A → (B ∧ C)', '¬C'], '¬A'],
    [['A ↔ B', '¬A'], '¬B'], [['A → B', '¬A → B'], 'B'], [['A ∨ B', 'B → C'], 'A ∨ C'], [['¬(A ∧ B)', 'A'], '¬B'], [['¬(A ∧ B)'], '¬A'],
    [['A → B', 'C → B', 'A ∨ C'], 'B'], [['A ∨ (B ∧ C)', '¬A'], 'C'], [['(A ∧ B) → C', 'A'], 'B → C'], [['A → B', 'B → C', 'C'], 'A']
  ];
  function argText(prem, concl) { return 'Premises: ' + prem.map(m).join('; ') + '. Conclusion: ' + m(concl) + '.'; }
  function makeArg(R, lv, want) {
    for (var t = 0; t < 40; t++) {
      var tpl = R.pick(ARGS), names = []; (tpl[0].join(' ') + tpl[1]).replace(/[A-D]/g, function (c) { if (names.indexOf(c) < 0) names.push(c); return c; });
      var map = lv === 1 ? R.pick([{ A: at('p'), B: at('q'), C: at('r') }, { A: at('q'), B: at('p'), C: at('r') }]) : lv === 2 ? R.pick([{ A: at('p'), B: at('q'), C: at('r') }, { A: at('q'), B: at('r'), C: at('p') }, { A: N(at('p')), B: at('q'), C: at('r') }, { A: at('p'), B: N(at('q')), C: at('r') }]) : fill(R, 2, names.sort());
      var prem = tpl[0].map(function (s) { return subst(s, map); }), concl = subst(tpl[1], map);
      var v = LG().validity(prem, concl);
      if (want === undefined || v.valid === want) return { prem: prem, concl: concl, v: v };
    }
    throw new Error('no argument');
  }
  G('sym.validity-truth-table', function (R, ctx) {
    var lv = ctx.level, want = R.coin(), ar = makeArg(R, lv, want), v = ar.v, t = v.table, ls = t.letters;
    var kind = R.pick(byLv(ctx, ['valid'], ['valid', 'count', 'valid'], ['valid', 'count', 'which']));
    var bad = v.counter.map(function (i) { return t.rows[i]; });
    var desc = v.valid ? 'No row makes every premise true and the conclusion false.' : 'In the row ' + rowLabel(bad[0].val, ls) + ' every premise is T and the conclusion is F.';
    if (kind === 'count') {
      return { q: 'How many rows of the truth table are counterexamples (every premise true, conclusion false) for this argument?<br>' + argText(ar.prem, ar.concl), a: { t: 'num', v: String(v.counter.length), form: 'int' },
        steps: ['The table has ' + t.rows.length + ' rows (letters ' + ls.map(function (l) { return '$' + l + '$'; }).join(', ') + ').', v.counter.length ? 'Counterexample rows: ' + bad.map(function (r) { return rowLabel(r.val, ls); }).join('; ') + '.' : 'No row has every premise T and the conclusion F.', 'So there ' + (v.counter.length === 1 ? 'is 1' : 'are ' + v.counter.length) + (v.valid ? ', and the argument is valid.' : ', and the argument is invalid.')],
        hint: 'Only rows with every premise T matter; check the conclusion there.' };
    }
    if (kind === 'which' && !v.valid) {
      var okRows = t.rows.filter(function (r, i) { return v.counter.indexOf(i) < 0; });
      return { q: 'This argument is invalid. Which row of its truth table shows that?<br>' + argText(ar.prem, ar.concl), a: mc(rowLabel(bad[0].val, ls), R.shuffle(okRows).slice(0, 3).map(function (r) { return rowLabel(r.val, ls); })),
        steps: ['A counterexample row makes every premise true and the conclusion false.', desc, 'In each of the other rows, some premise is false or the conclusion is true.'],
        hint: 'Test each row: are all the premises T and the conclusion F?' };
    }
    return { q: 'Is this argument valid?<br>' + argText(ar.prem, ar.concl), a: mcKeep(['Valid', 'Invalid'], v.valid ? 'Valid' : 'Invalid'),
      viz: lv === 1 ? { name: 'lg-truthtable', opts: { premises: ar.prem.map(sh), conclusion: sh(ar.concl), quiet: true, verdict: false } } : undefined,
      steps: ['An argument is valid when no row makes every premise true and the conclusion false.', desc, v.valid ? 'So it is valid. (Rows with a false premise do not count against it.)' : 'That one row makes it invalid, even if other rows look fine.'],
      hint: 'Look only at the rows where every premise is T.' };
  });

  // forced values for the short truth table, as readable steps
  function forceSteps(prem, concl) {
    var out = [];
    var cl = concl;
    if (cl.t === 'imp') out.push('For ' + m(cl) + ' to be F, ' + m(cl.a) + ' must be T and ' + m(cl.b) + ' must be F.');
    else if (cl.t === 'or') out.push('For ' + m(cl) + ' to be F, both ' + m(cl.a) + ' and ' + m(cl.b) + ' must be F.');
    else if (cl.t === 'atom') out.push('Make the conclusion $' + cl.p + '$ F.');
    else if (cl.t === 'not') out.push('For ' + m(cl) + ' to be F, ' + m(cl.a) + ' must be T.');
    else out.push('Make the conclusion ' + m(cl) + ' F.');
    out.push('Then use the premises, which must all be T, to force the other letters.');
    return out;
  }
  G('sym.short-truth-table', function (R, ctx) {
    var lv = ctx.level;
    for (var tries = 0; tries < 40; tries++) {
      var want = R.chance(0.55) ? false : true, ar = makeArg(R, Math.max(2, lv), want), v = ar.v, ls = v.table.letters;
      if (!v.valid && v.counter.length !== 1 && R.chance(0.8)) continue;
      break;
    }
    var kind = R.pick(byLv(ctx, ['concl', 'valid'], ['concl', 'counter', 'valid'], ['counter', 'valid', 'counter']));
    var concl = ar.concl, cr = LG().table([concl]);
    var cl = LG().letters([concl]), falseRows = LG().rows(cl).filter(function (r) { return !LG().evalProp(concl, r); });
    if (kind === 'concl' && falseRows.length === 1 && cl.length >= 2) {
      var fr = falseRows[0];
      return { q: 'In the short truth table method you start by making the conclusion false. What values must the letters of the conclusion ' + m(concl) + ' have?', a: { t: 'multi', parts: cl.map(function (l) { return { label: '$' + l + '$ is true:', a: tf(fr[l]) }; }) },
        steps: forceSteps(ar.prem, concl).slice(0, 1).concat(['So ' + rowLabel(fr, cl) + '.']),
        hint: 'There is only one way to make this conclusion false.' };
    }
    if ((kind === 'counter' || kind === 'concl') && !v.valid && v.counter.length === 1) {
      var row = v.table.rows[v.counter[0]].val;
      return { q: 'This argument is invalid. Find the one assignment that makes every premise true and the conclusion false.<br>' + argText(ar.prem, ar.concl), a: { t: 'multi', parts: ls.map(function (l) { return { label: '$' + l + '$ is true:', a: tf(row[l]) }; }) },
        viz: lv === 1 ? { name: 'lg-truthtable', opts: { premises: ar.prem.map(sh), conclusion: sh(ar.concl), mode: 'short', quiet: true } } : undefined,
        steps: forceSteps(ar.prem, concl).concat(['The values ' + rowLabel(row, ls) + ' make ' + ar.prem.map(m).join(', ') + ' all T and ' + m(concl) + ' F.']),
        hint: 'Make the conclusion F first, then make each premise T.' };
    }
    var desc = v.valid ? 'Trying to make every premise T and the conclusion F forces some letter to be both T and F, which is impossible.' : 'The values ' + rowLabel(v.table.rows[v.counter[0]].val, ls) + ' make every premise T and the conclusion F.';
    return { q: 'Use the short truth table method: is this argument valid?<br>' + argText(ar.prem, ar.concl), a: mcKeep(['Valid', 'Invalid'], v.valid ? 'Valid' : 'Invalid'),
      steps: forceSteps(ar.prem, concl).concat([desc, v.valid ? 'So no counterexample exists: valid.' : 'That is a counterexample: invalid.']),
      hint: 'Assume the premises T and the conclusion F, and follow the forced values.' };
  });

  var FORMS = [ // [name, premises, conclusion, valid]
    ['Modus ponens', ['A → B', 'A'], 'B', true], ['Modus tollens', ['A → B', '¬B'], '¬A', true], ['Hypothetical syllogism', ['A → B', 'B → C'], 'A → C', true],
    ['Disjunctive syllogism', ['A ∨ B', '¬A'], 'B', true], ['Affirming the consequent', ['A → B', 'B'], 'A', false], ['Denying the antecedent', ['A → B', '¬A'], '¬B', false]];
  var FORM_NAMES = FORMS.map(function (f) { return f[0]; });
  G('sym.argument-forms', function (R, ctx) {
    var lv = ctx.level, F = R.pick(FORMS);
    var english = lv >= 2 && R.chance(0.45) && F[0] !== 'Hypothetical syllogism' && F[0] !== 'Disjunctive syllogism';
    var map = lv === 1 ? { A: at('p'), B: at('q'), C: at('r') } : fill(R, lv === 2 ? 2 : 3, ['A', 'B', 'C']);
    var prem = F[1].map(function (s) { return subst(s, map); }), concl = subst(F[2], map);
    var v = LG().validity(prem, concl).valid;
    var text;
    if (english) {
      var sc = R.pick(SCEN), C = sc[0], Rr = sc[1];
      var E2 = { 'A → B': 'If ' + C[0] + ', then ' + Rr[0] + '.', 'A': cap(C[0]) + '.', 'B': cap(Rr[0]) + '.', '¬A': cap(C[1]) + '.', '¬B': cap(Rr[1]) + '.' };
      text = F[1].map(function (s) { return E2[s]; }).join(' ') + ' So ' + E2[F[2]].charAt(0).toLowerCase() + E2[F[2]].slice(1);
    }
    var kind = R.pick(byLv(ctx, ['name'], ['name', 'name', 'valid'], ['name', 'valid']));
    var why = F[3] ? 'It is a valid form: no row makes its premises true and its conclusion false.' : 'It is invalid: ' + (F[0] === 'Affirming the consequent' ? 'the consequent can be true for some other reason while the antecedent is false.' : 'the consequent can still be true when the antecedent is false.');
    var match = F[0] === 'Modus ponens' ? 'The second premise affirms the antecedent, and the conclusion is the consequent.' : F[0] === 'Modus tollens' ? 'The second premise denies the consequent, and the conclusion denies the antecedent.' : F[0] === 'Affirming the consequent' ? 'The second premise affirms the consequent (not the antecedent), and the conclusion is the antecedent.' : F[0] === 'Denying the antecedent' ? 'The second premise denies the antecedent, and the conclusion denies the consequent.' : F[0] === 'Hypothetical syllogism' ? 'Two conditionals chain: the consequent of the first is the antecedent of the second.' : 'One disjunct is denied, so the conclusion is the other disjunct.';
    var shown = english ? '<b>' + text + '</b>' : argText(prem, concl);
    if (kind === 'valid') {
      return { q: 'Is this argument valid?<br>' + shown, a: mcKeep(['Valid', 'Invalid'], v ? 'Valid' : 'Invalid'), steps: ['Its form is ' + F[0].toLowerCase() + '. ' + match, why], hint: 'Match the second premise to a part of the conditional: antecedent or consequent?' };
    }
    return { q: 'Which form does this argument have?<br>' + shown, a: mcKeep(FORM_NAMES, F[0]),
      steps: [match, 'So it is ' + F[0].toLowerCase() + '. ' + why], hint: 'Which part of the conditional does the second premise match?' };
  });


  // ================================================================== UNIT 3: Natural Deduction, Rules of Inference
  var INF_PAT = { // rule: [[cited patterns], result]
    MP: [['A → B', 'A'], 'B'], MT: [['A → B', '¬B'], '¬A'], HS: [['A → B', 'B → C'], 'A → C'], DS: [['A ∨ B', '¬A'], 'B'], DS2: [['A ∨ B', '¬B'], 'A'],
    Simp: [['A ∧ B'], 'A'], Simp2: [['A ∧ B'], 'B'], Conj: [['A', 'B'], 'A ∧ B'], Add: [['A'], 'A ∨ B'], CD: [['(A → B) ∧ (C → D)', 'A ∨ C'], 'B ∨ D']
  };
  var INF_RULES = ['MP', 'MT', 'HS', 'DS', 'CD', 'Simp', 'Conj', 'Add'];
  function baseRule(r) { return r.replace(/2$/, ''); }
  var PL = { A: 'p', B: 'q', C: 'r', D: 's' };
  function pl(s) { return m(subst(s, { A: at('p'), B: at('q'), C: at('r'), D: at('s') })); }
  function patText(rule) { return INF_PAT[rule][0].map(pl).join(', ') + ' give ' + pl(INF_PAT[rule][1]); }
  function matchText(rule, map) { return Object.keys(map).filter(function (k) { return (INF_PAT[rule][0].join(' ') + INF_PAT[rule][1]).indexOf(k) >= 0; }).map(function (k) { return 'the rule\'s $' + PL[k] + '$ is ' + m(map[k]); }).join(', '); }
  function instRule(R, lv, rule) {
    var pat = INF_PAT[rule], map = fill(R, lv, ['A', 'B', 'C', 'D']);
    return { cited: pat[0].map(function (s) { return subst(s, map); }), res: subst(pat[1], map), map: map };
  }
  // look-alike wrong conclusions for a rule
  function wrongResults(rule, x) {
    var c = x.cited, M = x.map, out = [];
    if (rule === 'MP') out.push(M.A, N(M.B), I(M.B, M.A));
    if (rule === 'MT') out.push(N(M.B), M.A, negx(M.A), N(N(M.B)));
    if (rule === 'HS') out.push(I(M.C, M.A), I(M.B, M.C), A(M.A, M.C));
    if (rule === 'DS' || rule === 'DS2') out.push(N(M.B), M.A, N(M.A), A(M.A, M.B));
    if (rule === 'Simp' || rule === 'Simp2') out.push(O(M.A, M.B), N(M.A), A(M.B, M.A));
    if (rule === 'Conj') out.push(O(M.A, M.B), I(M.A, M.B));
    if (rule === 'Add') out.push(A(M.A, M.B), M.B);
    if (rule === 'CD') out.push(A(M.B, M.D), O(M.A, M.C), I(M.A, M.D));
    return out.filter(function (f) { return !same(f, x.res); });
  }
  function citedText(cs) { return cs.map(m).join(' and '); }
  // problems shared by the rule topics: apply a rule, name it, judge a use, find the missing premise
  function ruleProblem(R, ctx, rules) {
    var lv = ctx.level, rule = R.pick(rules), x = instRule(R, lv, rule), b = baseRule(rule);
    var kind = R.pick(byLv(ctx, rules[0] === 'MP' ? ['apply', 'apply', 'name', 'judge'] : ['apply', 'apply', 'name'], ['apply', 'name', 'judge', 'need'], ['apply', 'judge', 'need', 'name']));
    var lines = x.cited.map(function (c, i) { return (i + 1) + '. ' + m(c); }).join('<br>');
    if (kind === 'need' && x.cited.length === 2) {
      var k = R.int(0, 1), give = x.cited[1 - k];
      return { q: 'You have ' + m(give) + ' and want to infer ' + m(x.res) + ' by ' + b + '. What other line do you need?', a: prop(x.cited[k], true),
        steps: [RULE_NAMES[b] + ': ' + patText(rule) + '.', 'Here the other line must be ' + m(x.cited[k]) + '.'],
        hint: 'Write out the rule\'s pattern and match what you have.' };
    }
    if (kind === 'judge') {
      var good = R.coin(), res = good ? x.res : R.pick(wrongResults(rule, x));
      var ok = LG().rulesFor(x.cited, res).indexOf(b) >= 0;
      return { q: 'Is this a correct use of ' + RULE_NAMES[b] + '?<br>From ' + citedText(x.cited) + ', infer ' + m(res) + '.', a: mcKeep(['Correct', 'Not correct'], ok ? 'Correct' : 'Not correct'),
        steps: [RULE_NAMES[b] + ': ' + patText(rule) + '.', ok ? 'The lines match the pattern, and ' + m(res) + ' is what it gives.' : 'From these lines ' + b + ' gives ' + m(x.res) + ', not ' + m(res) + '.'],
        hint: 'Match each cited line to the rule\'s pattern, then see what the pattern gives.' };
    }
    if (kind === 'name') {
      var pool = INF_RULES.filter(function (r) { return r === b || INF_PAT[r][0].length === x.cited.length || true; });
      return { q: 'Which rule of inference takes you from ' + citedText(x.cited) + ' to ' + m(x.res) + '?', a: ruleChoices(R, b, pool, x.cited, x.res),
        steps: ['Match the main connectives: ' + x.cited.map(function (c) { return m(c) + ' is a ' + (c.t === 'atom' ? 'simple statement' : CONN[c.t]); }).join('; ') + '.', 'This is the pattern of ' + RULE_NAMES[b] + ': ' + patText(rule) + '.'],
        hint: 'Look at the main connective of each line.' };
    }
    return { q: 'What does ' + RULE_NAMES[b] + ' give from these lines?<br>' + lines, a: prop(x.res, true),
      steps: [RULE_NAMES[b] + ': ' + patText(rule) + '.', 'Here ' + matchText(rule, x.map) + '.', 'So the result is ' + m(x.res) + '.'],
      hint: 'Write the rule\'s pattern and put the matching parts in.' };
  }
  G('sym.mp-mt', function (R, ctx) { return ruleProblem(R, ctx, ['MP', 'MT', 'MP', 'MT']); });
  G('sym.hs-ds', function (R, ctx) { return ruleProblem(R, ctx, ['HS', 'DS', 'DS2', 'HS']); });
  G('sym.simp-conj-add', function (R, ctx) { return ruleProblem(R, ctx, ['Simp', 'Simp2', 'Conj', 'Add']); });
  G('sym.cd', function (R, ctx) {
    var lv = ctx.level;
    if (R.chance(0.3)) { // the conditionals on separate lines: Conj first
      var map = fill(R, lv, ['A', 'B', 'C', 'D']), c1 = subst('A → B', map), c2 = subst('C → D', map), d = subst('A ∨ C', map);
      return { q: 'You have three separate lines: ' + m(c1) + ', ' + m(c2) + ' and ' + m(d) + '. Before you can use Constructive Dilemma, what line must you write?', a: prop([A(c1, c2), A(c2, c1)], true),
        steps: ['CD needs the two conditionals joined in one line: $(p \\to q) \\land (r \\to s)$.', 'So first use Conjunction: ' + m(A(c1, c2)) + '.', 'Then CD with ' + m(d) + ' gives ' + m(O(map.B, map.D)) + '.'],
        hint: 'In this system CD cites a conjunction of two conditionals.' };
    }
    return ruleProblem(R, ctx, ['CD']);
  });

  // ---- proofs from templates
  var TPL_INF = [
    { p: ['A → B', 'B → C', 'A'], c: 'C', l: [['B', 'MP 1, 3'], ['C', 'MP 2, 4']] },
    { p: ['A → B', 'C → ¬B', 'C'], c: '¬A', l: [['¬B', 'MP 2, 3'], ['¬A', 'MT 1, 4']] },
    { p: ['A → B', 'B → C', 'A'], c: 'C', l: [['A → C', 'HS 1, 2'], ['C', 'MP 4, 3']] },
    { p: ['A ∨ B', '¬A', 'B → C'], c: 'C', l: [['B', 'DS 1, 2'], ['C', 'MP 3, 4']] },
    { p: ['A ∧ B', 'A → C'], c: 'C', l: [['A', 'Simp 1'], ['C', 'MP 2, 3']] },
    { p: ['A', 'B', '(A ∧ B) → C'], c: 'C', l: [['A ∧ B', 'Conj 1, 2'], ['C', 'MP 3, 4']] },
    { p: ['A', '(A ∨ B) → C'], c: 'C', l: [['A ∨ B', 'Add 1'], ['C', 'MP 2, 3']] },
    { p: ['A → B', 'C → D', 'A ∨ C'], c: 'B ∨ D', l: [['(A → B) ∧ (C → D)', 'Conj 1, 2'], ['B ∨ D', 'CD 4, 3']] },
    { p: ['A → B', '¬B', 'A ∨ C'], c: 'C', l: [['¬A', 'MT 1, 2'], ['C', 'DS 3, 4']] },
    { p: ['A ∧ B'], c: 'B ∧ A', l: [['A', 'Simp 1'], ['B', 'Simp 1'], ['B ∧ A', 'Conj 3, 2']] },
    { p: ['A → (B ∧ C)', 'A'], c: 'C', l: [['B ∧ C', 'MP 1, 2'], ['C', 'Simp 3']] },
    { p: ['A ∨ B', '¬A ∧ C'], c: 'B ∧ C', l: [['¬A', 'Simp 2'], ['B', 'DS 1, 3'], ['C', 'Simp 2'], ['B ∧ C', 'Conj 4, 5']] },
    { p: ['A → B', 'B → C', '¬C'], c: '¬A', l: [['A → C', 'HS 1, 2'], ['¬A', 'MT 4, 3']] },
    { p: ['(A ∨ B) → C', 'A', 'C → D'], c: 'D', l: [['A ∨ B', 'Add 2'], ['C', 'MP 1, 4'], ['D', 'MP 3, 5']] },
    { p: ['A ∨ B', 'B → C', '¬A'], c: 'C ∨ D', l: [['B', 'DS 1, 3'], ['C', 'MP 2, 4'], ['C ∨ D', 'Add 5']] },
    { p: ['A → B', 'A ∧ C'], c: 'B ∨ D', l: [['A', 'Simp 2'], ['B', 'MP 1, 3'], ['B ∨ D', 'Add 4']] },
    { p: ['A → B', 'C ∧ A'], c: 'B ∧ C', l: [['A', 'Simp 2'], ['B', 'MP 1, 3'], ['C', 'Simp 2'], ['B ∧ C', 'Conj 4, 5']] },
    { p: ['(A → B) ∧ (C → D)', '¬B ∧ ¬D', 'A ∨ C'], c: 'B ∨ D', l: [['B ∨ D', 'CD 1, 3']] },
    { p: ['A → ¬B', 'B ∨ C', 'A'], c: 'C', l: [['¬B', 'MP 1, 3'], ['C', 'DS 2, 4']] },
    { p: ['(A ∧ B) → C', '¬C', 'D → (A ∧ B)'], c: '¬D', l: [['D → C', 'HS 3, 1'], ['¬D', 'MT 4, 2']] }
  ];
  // the lines of a proof whose rule is the only one (of the offered pool) that fits
  function uniqueLines(pr, pool) {
    var out = [], np = nPrem(pr);
    pr.lines.forEach(function (l, i) {
      var j = LG().parseJust(l.j); if (!j || !j.lines.length || j.range) return;
      var cited = j.lines.map(function (n) { return lineF(pr, n); });
      var fits = LG().rulesFor(cited, P(l.f)).filter(function (r) { return pool.indexOf(r) >= 0; });
      if (fits.length === 1 && fits[0] === j.rule) out.push({ n: np + i + 1, j: j, cited: cited, f: P(l.f) });
    });
    return out;
  }
  function pickProof(R, lv, tpls) { return makeProof(R, lv, R.pick(tpls)); }

  G('sym.proofs-intro', function (R, ctx) {
    var lv = ctx.level, pr = pickProof(R, lv === 1 ? 1 : 2, TPL_INF), np = nPrem(pr), total = np + pr.lines.length;
    var kind = R.pick(['premises', 'last', 'cite', 'tf', 'rule']);
    var viz = proofViz(pr);
    if (kind === 'premises') return { q: 'In this proof, how many lines are premises?', viz: viz, a: { t: 'num', v: String(np), form: 'int' },
      steps: ['Premises come first, above the bar, marked Pr.', 'Here lines 1 to ' + np + ' are premises: ' + pr.premises.map(m).join(', ') + '.'], hint: 'Count the lines above the bar.' };
    if (kind === 'last') return { q: 'Which line of this proof is the conclusion ' + m(pr.conclusion) + '?', viz: viz, a: { t: 'num', v: String(total), form: 'int' },
      steps: ['A proof ends with the conclusion on its last line.', 'Here that is line ' + total + '.'], hint: 'Where does a proof end?' };
    if (kind === 'rule' || kind === 'cite') {
      var n = R.int(np + 1, total), j = LG().parseJust(lineJ(pr, n));
      if (kind === 'cite' && j.lines.length) return { q: 'Line ' + n + ' of this proof is justified by "' + LG().showJust(j) + '". Which lines does it use?', viz: viz,
        a: mc(j.lines.join(' and '), [j.lines.map(function (x) { return x + 1; }).join(' and '), String(n - 1), n + ' and ' + (n - 1), j.lines.slice().reverse().map(function (x) { return x === 1 ? 2 : x - 1; }).join(' and ')].filter(function (s) { return s !== j.lines.join(' and ') && !/\b0\b/.test(s); })),
        steps: ['The numbers after the rule name are the earlier lines the rule is applied to.', 'So line ' + n + ' uses line' + (j.lines.length > 1 ? 's ' : ' ') + j.lines.join(' and ') + '.'], hint: 'Read the numbers in the justification.' };
      return { q: 'Which rule justifies line ' + n + ' of this proof?', viz: proofViz(pr, [{ n: n, part: 'j' }]), a: ruleChoices(R, j.rule, INF_RULES, j.lines.map(function (x) { return lineF(pr, x); }), lineF(pr, n)),
        steps: ['Line ' + n + ' is ' + m(lineF(pr, n)) + ', from line' + (j.lines.length > 1 ? 's ' : ' ') + j.lines.join(' and ') + '.', 'That is ' + RULE_NAMES[j.rule] + '.'], hint: 'Look at the main connectives of the cited lines.' };
    }
    var claims = [
      ['A proof must use every premise.', false, 'A proof only needs a correct chain of lines to the conclusion; an unused premise does no harm.'],
      ['Every line after the premises must follow from earlier lines by a rule.', true, 'That is what makes it a proof: each step is justified.'],
      ['A proof is correct only if it is the shortest possible proof.', false, 'Any correct chain of justified lines that ends in the conclusion is a proof, long or short.'],
      ['A line may cite a line that comes after it.', false, 'A line can only use lines already written above it.'],
      ['The justification beside a line names a rule and the lines it uses.', true, 'For example "MP 1, 3" means modus ponens applied to lines 1 and 3.'],
      ['The same line may be cited more than once in a proof.', true, 'Once a line is written, any later line may use it, as often as needed.']
    ];
    var c = R.pick(claims);
    return { q: 'True or false: ' + c[0], a: tf(c[1]), steps: [c[2]], hint: 'Think about what a proof has to show.' };
  });

  G('sym.substitution-instances', function (R, ctx) {
    var lv = Math.max(2, ctx.level), rule = R.pick(['MP', 'MT', 'HS', 'DS', 'Simp', 'Conj', 'Add', 'CD', 'MP', 'MT']), x = instRule(R, 3, rule), b = baseRule(rule);
    var kind = R.pick(['part', 'name', 'name', 'part', 'judge']);
    if (kind === 'part') { // a rule used on part of a line
      var M = fill(R, 2, ['A', 'B', 'C']), cases = [
        [[O(I(M.A, M.B), M.C), M.A], M.B, 'MP', 'The conditional ' + m(I(M.A, M.B)) + ' is only a part of line 1; its main connective is $\\lor$, so MP does not apply.'],
        [[A(I(M.A, M.B), M.C), M.A], M.B, 'MP', 'Line 1 is a conjunction. MP needs a whole line that is a conditional. (Simp first would give ' + m(I(M.A, M.B)) + '.)'],
        [[I(A(M.A, M.B), M.C)], I(M.A, M.C), 'Simp', 'Simp works on a whole conjunction. Line 1 is a conditional, so nothing can be simplified out of it.'],
        [[O(M.A, M.B)], M.A, 'Simp', 'Simp works on a conjunction; line 1 is a disjunction. From "$p$ or $q$" you cannot infer $p$.'],
        [[I(M.A, M.B), N(M.A)], N(M.B), 'MT', 'MT needs the negation of the consequent. Here the antecedent is denied, which is the fallacy of denying the antecedent.'],
        [[O(M.A, M.B), M.A], N(M.B), 'DS', 'DS needs the negation of one disjunct. "Or" is inclusive, so affirming one disjunct says nothing about the other.'],
        [[N(I(M.A, M.B)), M.A], N(M.B), 'MP', 'Line 1 is a negation, not a conditional, so MP does not apply.'],
        [[I(M.A, M.B), M.B], M.A, 'MP', 'MP needs the antecedent. Using the consequent is affirming the consequent.']
      ];
      if (R.chance(0.35)) { // a correct one with a complex instance
        var ok = R.pick([[x.cited, x.res, b]]);
        return { q: 'Is this a correct use of ' + RULE_NAMES[b] + '?<br>From ' + citedText(ok[0]) + ', infer ' + m(ok[1]) + '.', a: mcKeep(['Correct', 'Not correct'], LG().rulesFor(ok[0], ok[1]).indexOf(b) >= 0 ? 'Correct' : 'Not correct'),
          steps: ['The rule\'s letters can stand for any formulas: here ' + matchText(rule, x.map) + '.', 'The whole lines match the pattern, so it is correct.'],
          hint: 'Find the main connective of each whole line.' };
      }
      var cs = R.pick(cases), okc = LG().rulesFor(cs[0], cs[1]).indexOf(cs[2]) >= 0;
      return { q: 'Is this a correct use of ' + RULE_NAMES[cs[2]] + '?<br>From ' + citedText(cs[0]) + ', infer ' + m(cs[1]) + '.', a: mcKeep(['Correct', 'Not correct'], okc ? 'Correct' : 'Not correct'),
        steps: [cs[3], 'Rules of inference apply only to whole lines whose main connectives fit the pattern.'], hint: 'What is the main connective of each cited line?' };
    }
    if (kind === 'judge') return ruleProblem(R, { level: 3 }, [rule]);
    return { q: 'Which rule of inference justifies inferring ' + m(x.res) + ' from ' + citedText(x.cited) + '?', a: ruleChoices(R, b, INF_RULES, x.cited, x.res),
      steps: ['Look at the main connective of each whole line: ' + x.cited.map(function (c) { return m(c) + ' is a ' + (c.t === 'atom' ? 'simple statement' : CONN[c.t]); }).join('; ') + '.', 'They fit ' + RULE_NAMES[b] + ' (' + patText(rule) + '), with bigger formulas in place of the letters.'],
      hint: 'Treat each big part as a single block.' };
  });

  G('sym.justify-lines', function (R, ctx) {
    var lv = ctx.level, pr, U = [];
    for (var t = 0; t < 10 && !U.length; t++) { pr = pickProof(R, lv, TPL_INF); U = uniqueLines(pr, INF_RULES); }
    var L0 = R.pick(U), kind = R.pick(byLv(ctx, ['rule', 'rule', 'lines'], ['rule', 'lines', 'full'], ['full', 'lines', 'rule']));
    if (kind === 'rule') return { q: 'Which rule justifies line ' + L0.n + '?', viz: proofViz(pr, [{ n: L0.n, part: 'j' }]), a: ruleChoices(R, L0.j.rule, INF_RULES, L0.cited, L0.f),
      steps: ['Line ' + L0.n + ' is ' + m(L0.f) + ', from line' + (L0.j.lines.length > 1 ? 's ' : ' ') + L0.j.lines.join(' and ') + ' (' + L0.cited.map(m).join(', ') + ').', 'That is ' + RULE_NAMES[L0.j.rule] + '.'], hint: 'Which earlier lines contain the parts of line ' + L0.n + '?' };
    var right = LG().showJust(L0.j), wrong = [];
    var np = nPrem(pr);
    // other justifications that do not check
    var alts = [];
    for (var a1 = 1; a1 < L0.n; a1++) { alts.push(L0.j.rule + ' ' + a1); for (var a2 = 1; a2 < L0.n; a2++) if (a2 !== a1) alts.push(L0.j.rule + ' ' + a1 + ', ' + a2); }
    INF_RULES.forEach(function (r) { if (r !== L0.j.rule) alts.push(r + ' ' + L0.j.lines.join(', ')); });
    R.shuffle(alts).forEach(function (s) {
      if (wrong.length >= 3) return;
      var test = proofText(pr); test.lines = test.lines.slice(0, L0.n - np); test.lines[L0.n - np - 1].j = s;
      var res = LG().checkProof(test); if (!res.lines[L0.n - 1].ok && LG().showJust(s) !== right) wrong.push(LG().showJust(s));
    });
    return { q: kind === 'lines' ? 'Line ' + L0.n + ' is ' + m(L0.f) + '. Which justification is right?' : 'Give the full justification (rule and lines) for line ' + L0.n + '.', viz: proofViz(pr, [{ n: L0.n, part: 'j' }]),
      a: mc(right, wrong),
      steps: ['Line ' + L0.n + ' comes from ' + L0.cited.map(m).join(' and ') + ' (line' + (L0.j.lines.length > 1 ? 's ' : ' ') + L0.j.lines.join(' and ') + ').', 'The rule is ' + RULE_NAMES[L0.j.rule] + ', so the justification is "' + right + '".'],
      hint: 'Find the earlier lines whose parts make up line ' + L0.n + ', then name the rule.' };
  });

  G('sym.first-proofs', function (R, ctx) {
    var lv = ctx.level, pr = pickProof(R, lv, TPL_INF.filter(function (t) { return t.l.length >= (lv === 1 ? 2 : 2); })), np = nPrem(pr), total = np + pr.lines.length;
    var n = R.int(np + 1, total - (lv === 1 && total > np + 1 ? 0 : 0)), j = LG().parseJust(lineJ(pr, n)), f = lineF(pr, n);
    var proofs = [f];
    return { q: 'Supply the missing formula on line ' + n + ' (its justification is "' + LG().showJust(j) + '").', viz: proofViz(pr, [{ n: n, part: 'f' }]), a: prop(proofs, true),
      steps: ['Line ' + n + ' uses ' + RULE_NAMES[j.rule] + ' on line' + (j.lines.length > 1 ? 's ' : ' ') + j.lines.join(' and ') + ': ' + j.lines.map(function (x) { return m(lineF(pr, x)); }).join(' and ') + '.', 'That gives ' + m(f) + '.'].concat(n < total ? ['Check: the later lines cite line ' + n + ' and work with ' + m(f) + '.'] : ['It is the conclusion, so the proof is complete.']),
      hint: 'Apply the named rule to the cited lines.' };
  });

  G('sym.proof-strategy', function (R, ctx) {
    var lv = ctx.level, M = fill(R, lv, ['A', 'B', 'C', 'D']);
    var S = [
      { p: ['A → B', 'C → A', 'C'], c: 'B', need: 'A', rule: 'MP', why: 'The conclusion ' + m(M.B) + ' is the consequent of premise 1. MP gives it once you have the antecedent ' + m(M.A) + ' (which premises 2 and 3 provide).' },
      { p: ['A ∨ B', 'C → ¬A', 'C'], c: 'B', need: '¬A', rule: 'DS', why: 'The conclusion ' + m(M.B) + ' is a disjunct of premise 1. DS gives it once you have the negation of the other disjunct, ' + m(N(M.A)) + '.' },
      { p: ['A → B', 'C → ¬B', 'C'], c: '¬A', need: '¬B', rule: 'MT', why: 'The conclusion ' + m(N(M.A)) + ' denies the antecedent of premise 1. MT gives it once you have ' + m(N(M.B)) + '.' },
      { p: ['A → (B ∧ C)', 'A'], c: 'C', need: 'B ∧ C', rule: 'Simp', why: 'The conclusion ' + m(M.C) + ' is a conjunct of ' + m(A(M.B, M.C)) + ', which MP gives from the premises; then Simp.' },
      { p: ['A', 'B → C', 'B'], c: 'A ∧ C', need: 'C', rule: 'Conj', why: 'The conclusion is a conjunction; you have ' + m(M.A) + ', so you need ' + m(M.C) + ', then Conj.' }
    ];
    var kind = R.pick(byLv(ctx, ['need', 'add'], ['need', 'add', 'last'], ['need', 'last', 'add']));
    if (kind === 'add') {
      var c = O(M.B, M.D);
      return { q: 'Premises: ' + m(I(M.A, M.B)) + ', ' + m(M.A) + '. Conclusion: ' + m(c) + '. The letters of ' + m(M.D) + ' appear in no premise. Which rule will bring ' + m(M.D) + ' into the proof?',
        a: ruleChoices(R, 'Add', ['MP', 'MT', 'DS', 'Simp', 'Conj', 'Add', 'HS'], [M.B], c),
        steps: ['Work backward: the conclusion is a disjunction, and one disjunct, ' + m(M.D) + ', appears in no premise.', 'Only Addition can add a new disjunct: get ' + m(M.B) + ' by MP, then Add gives ' + m(c) + '.'],
        hint: 'Which rule can add something that was never there?' };
    }
    var s = R.pick(S), prem = s.p.map(function (x) { return subst(x, M); }), concl = subst(s.c, M);
    if (kind === 'last') {
      return { q: 'Premises: ' + prem.map(m).join(', ') + '. Conclusion: ' + m(concl) + '. Working backward, which rule will most likely give the conclusion as the last line?',
        a: mc(RULE_NAMES[s.rule], R.shuffle(['MP', 'MT', 'DS', 'Simp', 'Conj', 'Add', 'HS'].filter(function (r) { return r !== s.rule; })).slice(0, 3).map(function (r) { return RULE_NAMES[r]; })),
        steps: [s.why, 'So the last step is ' + RULE_NAMES[s.rule] + '.'], hint: 'Find the conclusion inside the premises, and ask which rule frees it.' };
    }
    return { q: 'Premises: ' + prem.map(m).join(', ') + '. Conclusion: ' + m(concl) + '. Working backward, which line do you need just before the conclusion' + (s.rule === 'Simp' ? '' : ' (to use with a premise)') + '?',
      a: prop(subst(s.need, M), true), steps: [s.why, 'So aim for ' + m(subst(s.need, M)) + ' first.'], hint: 'Where does the conclusion appear in the premises?' };
  });


  // ================================================================== UNIT 4: Rules of Replacement
  var REP_RULES = ['DM', 'Com', 'Assoc', 'Dist', 'DN', 'Trans', 'Impl', 'Equiv', 'Exp', 'Taut'];
  var REP_TEXT = {
    DM: '$\\neg(p \\land q) :: \\neg p \\lor \\neg q$ and $\\neg(p \\lor q) :: \\neg p \\land \\neg q$', DN: '$p :: \\neg \\neg p$',
    Com: '$p \\lor q :: q \\lor p$ and $p \\land q :: q \\land p$', Assoc: '$p \\lor (q \\lor r) :: (p \\lor q) \\lor r$, and the same for $\\land$',
    Dist: '$p \\land (q \\lor r) :: (p \\land q) \\lor (p \\land r)$ and $p \\lor (q \\land r) :: (p \\lor q) \\land (p \\lor r)$',
    Trans: '$p \\to q :: \\neg q \\to \\neg p$', Impl: '$p \\to q :: \\neg p \\lor q$',
    Equiv: '$p \\leftrightarrow q :: (p \\to q) \\land (q \\to p)$ and $p \\leftrightarrow q :: (p \\land q) \\lor (\\neg p \\land \\neg q)$',
    Exp: '$(p \\land q) \\to r :: p \\to (q \\to r)$', Taut: '$p :: p \\lor p$ and $p :: p \\land p$'
  };
  // an instance of a replacement rule: from -> to (one application), possibly inside a bigger line
  function repInstance(R, lv, rule, dir) {
    for (var t = 0; t < 30; t++) {
      var pairs = REPL[rule], pr = R.pick(pairs), d = dir === undefined ? R.coin() : dir;
      if (rule === 'DN' || rule === 'Taut') d = R.coin();
      var M = fill(R, lv >= 3 ? 2 : lv, ['A', 'B', 'C']);
      var from = subst(d ? pr[0] : pr[1], M), to = subst(d ? pr[1] : pr[0], M);
      if (rule === 'DN' && !d) { from = N(N(M.A)); to = M.A; }
      if (lv >= 2 && R.chance(lv === 2 ? 0.45 : 0.7)) { var other = piece(R, 1, ['p', 'q', 'r', 's', 't'], [M.A, M.B, M.C].filter(Boolean)), k = R.pick(['and', 'or', 'imp']), left = R.coin(); from = left ? { t: k, a: from, b: other } : { t: k, a: other, b: from }; to = left ? { t: k, a: to, b: other } : { t: k, a: other, b: to }; }
      if (LG().rulesFor([from], to).indexOf(rule) >= 0) return { from: from, to: to, inside: !same(from, to) && size(from) > 0 };
    }
    throw new Error('no instance for ' + rule);
  }
  // look-alike wrong rewrites
  function repWrong(R, rule, M) {
    var A1 = M.A, B1 = M.B, C1 = M.C;
    var W = {
      DM: [[N(A(A1, B1)), A(N(A1), N(B1)), 'The negation went inside, but $\\land$ must turn into $\\lor$.'], [N(O(A1, B1)), O(N(A1), N(B1)), 'The negation went inside, but $\\lor$ must turn into $\\land$.']],
      Trans: [[I(A1, B1), I(B1, A1), 'That only swaps the parts (the converse). Transposition also negates both.'], [I(A1, B1), I(N(A1), N(B1)), 'That negates without swapping (the inverse). Transposition swaps and negates.']],
      Impl: [[I(A1, B1), O(A1, N(B1)), 'Material implication negates the antecedent: $p \\to q :: \\neg p \\lor q$.'], [I(A1, B1), O(A1, B1), 'The antecedent must be negated: $\\neg p \\lor q$.']],
      Exp: [[I(A(A1, B1), C1), I(I(A1, B1), C1), 'Exportation gives $p \\to (q \\to r)$, not $(p \\to q) \\to r$.']],
      Com: [[I(A1, B1), I(B1, A1), 'Commutation works only for $\\land$ and $\\lor$. Swapping a conditional gives its converse.']],
      Assoc: [[A(A1, O(B1, C1)), O(A(A1, B1), C1), 'Association regroups three parts joined by the same connective; here $\\land$ and $\\lor$ are mixed.']],
      Dist: [[A(A1, O(B1, C1)), A(O(A1, B1), O(A1, C1)), 'Distribution of $\\land$ over $\\lor$ gives a disjunction of conjunctions: $(p \\land q) \\lor (p \\land r)$.']],
      Equiv: [[E(A1, B1), A(I(A1, B1), I(A1, B1)), 'Material equivalence needs both directions: $(p \\to q) \\land (q \\to p)$.']],
      DN: [[N(A(A1, B1)), A(N(N(A1)), B1), 'Double negation adds or removes two negations in front of the same part; this changes what the negation covers.']],
      Taut: [[O(A1, B1), A1, 'Tautology turns $p \\lor p$ into $p$, with the same part twice. $p \\lor q$ is not of that form.']]
    };
    return W[rule];
  }
  function replProblem(R, ctx, rules) {
    var lv = ctx.level, rule = R.pick(rules);
    var kind = R.pick(byLv(ctx, ['apply', 'which', 'apply'], ['apply', 'which', 'judge'], ['apply', 'which', 'judge', 'judge']));
    if (kind === 'judge') {
      var M = fill(R, lv >= 3 ? 2 : 1, ['A', 'B', 'C']), good = R.chance(0.4);
      if (good) { var gi = repInstance(R, lv, rule); return { q: 'Is this a correct use of ' + RULE_NAMES[rule] + '?<br>From ' + m(gi.from) + ', infer ' + m(gi.to) + '.', a: mcKeep(['Correct', 'Not correct'], 'Correct'), steps: [RULE_NAMES[rule] + ': ' + REP_TEXT[rule] + '.', 'The new line is the old one with one part replaced by its equivalent, so it is correct.'], hint: 'Line the result up against the rule\'s two forms.' }; }
      var w = R.pick(repWrong(R, rule, M)), okw = LG().rulesFor([w[0]], w[1]).indexOf(rule) >= 0;
      return { q: 'Is this a correct use of ' + RULE_NAMES[rule] + '?<br>From ' + m(w[0]) + ', infer ' + m(w[1]) + '.', a: mcKeep(['Correct', 'Not correct'], okw ? 'Correct' : 'Not correct'),
        steps: [RULE_NAMES[rule] + ': ' + REP_TEXT[rule] + '.', okw ? 'It matches the rule.' : w[2]], hint: 'Write out both sides of the rule and compare.' };
    }
    var x = repInstance(R, lv, rule);
    if (kind === 'which') {
      return { q: 'Which rule of replacement turns ' + m(x.from) + ' into ' + m(x.to) + '?', a: ruleChoices(R, rule, REP_RULES, [x.from], x.to),
        steps: ['Find the part that changed: compare the two lines piece by piece.', 'The change matches ' + RULE_NAMES[rule] + ': ' + REP_TEXT[rule] + '.'],
        hint: 'Cover the parts that stay the same. What happened to the rest?' };
    }
    var all = [x.to].concat(oneStep(rule, x.from).filter(function (g) { return LG().rulesFor([x.from], g).indexOf(rule) >= 0; }));
    return { q: 'Apply ' + RULE_NAMES[rule] + ' once to ' + m(x.from) + '. Write the new line' + (rule === 'DN' && /¬¬/.test(sh(x.from)) ? ' with the double negation removed' : rule === 'DN' ? ' with a double negation added in front of a single letter' : '') + '.', a: prop(rule === 'DN' ? [x.to] : all, true),
      steps: [RULE_NAMES[rule] + ': ' + REP_TEXT[rule] + '.', 'Replace one part by its equivalent' + (size(x.from) > size(x.to) + 4 || size(x.to) > size(x.from) + 4 ? '' : '') + ': ' + m(x.from) + ' becomes ' + m(x.to) + '.', 'A replacement rule may change any part of a line, and it works in either direction.'],
      hint: 'Find the part that fits one side of the rule.' };
  }
  G('sym.replacement-intro', function (R, ctx) {
    var lv = ctx.level, M = fill(R, lv >= 3 ? 2 : 1, ['A', 'B', 'C', 'D']);
    if (R.chance(0.6)) {
      var cases = [
        [I(N(A(M.A, M.B)), M.C), I(O(N(M.A), N(M.B)), M.C), 'DM', true, 'DM is a rule of replacement, so it may change a part of a line: here the antecedent.'],
        [I(A(M.A, M.B), M.C), I(M.A, M.C), 'Simp', false, 'Simp is a rule of inference: it works only on a whole line that is a conjunction. Here the conjunction is only the antecedent, and the result does not even follow.'],
        [O(N(N(M.A)), M.B), O(M.A, M.B), 'DN', true, 'DN may remove a double negation anywhere inside a line.'],
        [A(I(M.A, M.B), M.C), A(I(N(M.B), N(M.A)), M.C), 'Trans', true, 'Transposition replaces the conditional part with its equivalent.'],
        [I(M.C, O(M.A, M.B)), I(M.C, M.A), 'Simp', false, 'Simp never applies to a disjunction, and a rule of inference never works on a part of a line.'],
        [O(I(M.A, M.B), M.D), O(I(M.A, M.B), M.D), 'MP', false, 'MP is a rule of inference: it needs whole lines, a conditional and its antecedent.'],
        [A(M.A, O(M.B, M.C)), O(A(M.A, M.B), A(M.A, M.C)), 'Dist', true, 'Distribution replaces the whole line with an equivalent one.'],
        [N(I(M.A, M.B)), N(O(N(M.A), M.B)), 'Impl', true, 'Impl replaces the conditional inside the negation with its equivalent.']
      ];
      var c = R.pick(cases), ok = c[2] === 'MP' ? false : LG().rulesFor([c[0]], c[1]).indexOf(c[2]) >= 0;
      if (c[2] === 'MP') return { q: 'Line 1 is ' + m(c[0]) + ' and line 2 is ' + m(M.A) + '. Can you use Modus Ponens on lines 1 and 2 to infer ' + m(M.B) + '?', a: mcKeep(['Yes', 'No'], LG().rulesFor([c[0], M.A], M.B).indexOf('MP') >= 0 ? 'Yes' : 'No'), steps: [c[4], 'Line 1 is a disjunction; its conditional is only a part, so MP cannot use it.'], hint: 'What is the main connective of line 1?' };
      return { q: 'Is this step allowed?<br>From ' + m(c[0]) + ', infer ' + m(c[1]) + ' by ' + RULE_NAMES[c[2]] + '.', a: mcKeep(['Allowed', 'Not allowed'], ok ? 'Allowed' : 'Not allowed'),
        steps: [c[4], 'Rules of replacement work on any part of a line, in either direction; rules of inference work only on whole lines.'], hint: 'Is ' + c[2] + ' a rule of inference or a rule of replacement?' };
    }
    var rr = R.pick(REP_RULES.concat(INF_RULES)), isRep = REP_RULES.indexOf(rr) >= 0;
    return { q: 'Is ' + RULE_NAMES[rr] + ' a rule of inference or a rule of replacement?', a: mcKeep(['Rule of inference', 'Rule of replacement'], isRep ? 'Rule of replacement' : 'Rule of inference'),
      steps: ['The eight rules of inference are MP, MT, HS, DS, CD, Simp, Conj and Add; they work on whole lines, in one direction.', 'The ten rules of replacement are DM, Com, Assoc, Dist, DN, Trans, Impl, Equiv, Exp and Taut; each says two forms are equivalent.', 'So ' + rr + ' is a rule of ' + (isRep ? 'replacement' : 'inference') + '.'],
      hint: 'Does the rule say two forms are equivalent (::), or that one line follows from others?' };
  });
  G('sym.dm-dn', function (R, ctx) { return replProblem(R, ctx, ['DM', 'DM', 'DN']); });
  G('sym.com-assoc-dist', function (R, ctx) { return replProblem(R, ctx, ['Com', 'Assoc', 'Dist', 'Dist']); });
  G('sym.trans-impl', function (R, ctx) { return replProblem(R, ctx, ['Trans', 'Impl']); });
  G('sym.equiv-exp-taut', function (R, ctx) { return replProblem(R, ctx, ['Equiv', 'Exp', 'Taut', 'Exp']); });

  var TPL_REP = [
    { p: ['¬(A ∨ B)', 'C → A'], c: '¬C', l: [['¬A ∧ ¬B', 'DM 1'], ['¬A', 'Simp 3'], ['¬C', 'MT 2, 4']] },
    { p: ['¬A → B', '¬B'], c: 'A', l: [['¬¬A', 'MT 1, 2'], ['A', 'DN 3']] },
    { p: ['¬A ∨ B', 'A'], c: 'B', l: [['A → B', 'Impl 1'], ['B', 'MP 3, 2']] },
    { p: ['(A ∧ B) → C', 'A'], c: 'B → C', l: [['A → (B → C)', 'Exp 1'], ['B → C', 'MP 3, 2']] },
    { p: ['A ↔ B', 'A'], c: 'B', l: [['(A → B) ∧ (B → A)', 'Equiv 1'], ['A → B', 'Simp 3'], ['B', 'MP 4, 2']] },
    { p: ['A → (B ∨ B)', 'A'], c: 'B', l: [['B ∨ B', 'MP 1, 2'], ['B', 'Taut 3']] },
    { p: ['A ∧ (B ∨ C)', '¬(A ∧ B)'], c: 'A ∧ C', l: [['(A ∧ B) ∨ (A ∧ C)', 'Dist 1'], ['A ∧ C', 'DS 3, 2']] },
    { p: ['¬(A ∧ B)', 'A'], c: '¬B', l: [['¬A ∨ ¬B', 'DM 1'], ['¬¬A', 'DN 2'], ['¬B', 'DS 3, 4']] },
    { p: ['A → B', 'B → C'], c: '¬C → ¬A', l: [['A → C', 'HS 1, 2'], ['¬C → ¬A', 'Trans 3']] },
    { p: ['(A ∨ B) ∨ C', '¬A', '¬B'], c: 'C', l: [['A ∨ (B ∨ C)', 'Assoc 1'], ['B ∨ C', 'DS 4, 2'], ['C', 'DS 5, 3']] },
    { p: ['A → B', '¬B ∨ C'], c: 'A → C', l: [['B → C', 'Impl 2'], ['A → C', 'HS 1, 3']] },
    { p: ['¬(A → B)'], c: 'A', l: [['¬(¬A ∨ B)', 'Impl 1'], ['¬¬A ∧ ¬B', 'DM 2'], ['¬¬A', 'Simp 3'], ['A', 'DN 4']] }
  ];
  G('sym.replacement-proofs', function (R, ctx) {
    var lv = ctx.level, pr, U = [], pool = INF_RULES.concat(REP_RULES);
    for (var t = 0; t < 10 && !U.length; t++) { pr = makeProof(R, lv === 3 ? 2 : 1, R.pick(TPL_REP)); U = uniqueLines(pr, pool); }
    var L0 = R.pick(U), kind = R.pick(byLv(ctx, ['rule', 'line'], ['rule', 'line', 'line'], ['line', 'rule']));
    if (kind === 'rule') return { q: 'Which rule justifies line ' + L0.n + '?', viz: proofViz(pr, [{ n: L0.n, part: 'j' }]), a: ruleChoices(R, L0.j.rule, pool, L0.cited, L0.f),
      steps: ['Line ' + L0.n + ' is ' + m(L0.f) + ', from line' + (L0.j.lines.length > 1 ? 's ' : ' ') + L0.j.lines.join(' and ') + ' (' + L0.cited.map(m).join(', ') + ').', 'That is ' + RULE_NAMES[L0.j.rule] + (REP_RULES.indexOf(L0.j.rule) >= 0 ? ', a rule of replacement: ' + REP_TEXT[L0.j.rule] + '.' : ', a rule of inference.')],
      hint: 'If the line has the same parts rearranged, think replacement; if it drops or combines lines, think inference.' };
    return { q: 'Supply the missing formula on line ' + L0.n + ' (its justification is "' + LG().showJust(L0.j) + '").', viz: proofViz(pr, [{ n: L0.n, part: 'f' }]), a: prop(L0.f, true),
      steps: ['Apply ' + RULE_NAMES[L0.j.rule] + ' to ' + L0.cited.map(m).join(' and ') + '.', 'That gives ' + m(L0.f) + '.'],
      hint: 'Use the named rule on the cited line' + (L0.j.lines.length > 1 ? 's' : '') + '; the later lines show what shape is needed.' };
  });

  // ================================================================== UNIT 5: Conditional and Indirect Proof
  var TPL_CP = [
    { p: ['A → B', 'B → C'], c: 'A → C', l: [['A', 'ACP'], ['B', 'MP 1, 3'], ['C', 'MP 2, 4'], ['A → C', 'CP 3–5']] },
    { p: ['A → B', 'A → C'], c: 'A → (B ∧ C)', l: [['A', 'ACP'], ['B', 'MP 1, 3'], ['C', 'MP 2, 3'], ['B ∧ C', 'Conj 4, 5'], ['A → (B ∧ C)', 'CP 3–6']] },
    { p: ['(A ∨ B) → C'], c: 'A → C', l: [['A', 'ACP'], ['A ∨ B', 'Add 2'], ['C', 'MP 1, 3'], ['A → C', 'CP 2–4']] },
    { p: ['A → (B ∧ C)'], c: 'A → C', l: [['A', 'ACP'], ['B ∧ C', 'MP 1, 2'], ['C', 'Simp 3'], ['A → C', 'CP 2–4']] },
    { p: ['A ∨ B'], c: '¬A → B', l: [['¬A', 'ACP'], ['B', 'DS 1, 2'], ['¬A → B', 'CP 2–3']] },
    { p: ['A → (B → C)', 'B'], c: 'A → C', l: [['A', 'ACP'], ['B → C', 'MP 1, 3'], ['C', 'MP 4, 2'], ['A → C', 'CP 3–5']] }
  ];
  var TPL_IP = [
    { p: ['A → B', 'A → ¬B'], c: '¬A', l: [['A', 'AIP'], ['B', 'MP 1, 3'], ['¬B', 'MP 2, 3'], ['B ∧ ¬B', 'Conj 4, 5'], ['¬A', 'IP 3–6']] },
    { p: ['A ∨ B', '¬B'], c: 'A', l: [['¬A', 'AIP'], ['B', 'DS 1, 3'], ['B ∧ ¬B', 'Conj 4, 2'], ['A', 'IP 3–5']] },
    { p: ['A → (B ∧ C)', '¬C'], c: '¬A', l: [['A', 'AIP'], ['B ∧ C', 'MP 1, 3'], ['C', 'Simp 4'], ['C ∧ ¬C', 'Conj 5, 2'], ['¬A', 'IP 3–6']] },
    { p: ['¬A → B', '¬B'], c: 'A', l: [['¬A', 'AIP'], ['B', 'MP 1, 3'], ['B ∧ ¬B', 'Conj 4, 2'], ['A', 'IP 3–5']] },
    { p: ['A → B', 'B → C', '¬C'], c: '¬A', l: [['A', 'AIP'], ['B', 'MP 1, 4'], ['C', 'MP 2, 5'], ['C ∧ ¬C', 'Conj 6, 3'], ['¬A', 'IP 4–7']] }
  ];
  function subproofOf(pr) { // the first closing line and its range
    var np = nPrem(pr);
    for (var i = 0; i < pr.lines.length; i++) { var j = LG().parseJust(pr.lines[i].j); if (j && j.range) return { n: np + i + 1, a: j.lines[0], b: j.lines[1], rule: j.rule }; }
    return null;
  }
  G('sym.conditional-proof', function (R, ctx) {
    var lv = ctx.level, pr = makeProof(R, lv, R.pick(TPL_CP)), sp = subproofOf(pr), np = nPrem(pr);
    var kind = R.pick(byLv(ctx, ['assume', 'close'], ['assume', 'close', 'cite', 'fill'], ['close', 'cite', 'fill', 'assume']));
    var concl = P(pr.conclusion);
    if (kind === 'assume') return { q: 'You want to prove ' + m(concl) + ' by conditional proof. What line do you assume first (ACP)?', a: prop(concl.a, true),
      steps: ['To prove a conditional $p \\to q$ by CP, assume its antecedent $p$, then derive $q$.', 'Here the antecedent is ' + m(concl.a) + '.'], hint: 'Which part of the conclusion comes before the arrow?' };
    if (kind === 'close') {
      var A0 = lineF(pr, sp.a), B0 = lineF(pr, sp.b);
      return { q: 'In this proof the subproof runs from line ' + sp.a + ' to line ' + sp.b + '. What line does CP ' + sp.a + '–' + sp.b + ' give?', viz: proofViz(pr, [{ n: sp.n, part: 'f' }]), a: prop(I(A0, B0), true),
        steps: ['CP closes the subproof and writes the assumption $\\to$ the last line of the subproof.', 'Assumption: ' + m(A0) + '. Last line: ' + m(B0) + '.', 'So CP gives ' + m(I(A0, B0)) + '.'], hint: 'Assumption, arrow, last line.' };
    }
    if (kind === 'cite') {
      var inside = R.int(sp.a, sp.b), outsideOk = R.coin(), target = outsideOk ? R.int(1, np) : inside;
      var test = proofText(pr), after = sp.n + 1; // a line after the subproof that cites target
      var ok = target <= np;
      return { q: 'The subproof on lines ' + sp.a + '–' + sp.b + ' has been closed by CP on line ' + sp.n + '. May a later line, line ' + after + ', cite line ' + target + '?', viz: proofViz(pr),
        a: mcKeep(['Yes', 'No'], ok ? 'Yes' : 'No'),
        steps: [ok ? 'Line ' + target + ' is a premise, outside every subproof, so any later line may cite it.' : 'Line ' + target + ' is inside the closed subproof. It depended on the assumption on line ' + sp.a + ', which is no longer in force, so it cannot be cited after line ' + sp.b + '.'],
        hint: 'Is the line inside the indented part?' };
    }
    var cand = pr.lines.map(function (l, i) { return np + i + 1; }).filter(function (n) { var j = LG().parseJust(lineJ(pr, n)); return j && !j.range && j.rule !== 'ACP'; });
    var n = R.pick(cand), f = lineF(pr, n), j = LG().parseJust(lineJ(pr, n));
    return { q: 'Supply the missing formula on line ' + n + ' (its justification is "' + LG().showJust(j) + '").', viz: proofViz(pr, [{ n: n, part: 'f' }]), a: prop(f, true),
      steps: ['Apply ' + RULE_NAMES[j.rule] + ' to line' + (j.lines.length > 1 ? 's ' : ' ') + j.lines.join(' and ') + ': ' + j.lines.map(function (x) { return m(lineF(pr, x)); }).join(' and ') + '.', 'That gives ' + m(f) + '.'], hint: 'Inside a subproof you may use the assumption and every earlier open line.' };
  });

  G('sym.indirect-proof', function (R, ctx) {
    var lv = ctx.level, pr = makeProof(R, lv, R.pick(TPL_IP)), sp = subproofOf(pr), np = nPrem(pr), concl = P(pr.conclusion);
    var kind = R.pick(byLv(ctx, ['assume', 'end'], ['assume', 'end', 'close', 'fill'], ['assume', 'close', 'fill', 'end']));
    if (kind === 'assume') return { q: 'You want to prove ' + m(concl) + ' by indirect proof. What do you assume (AIP)?', a: prop(concl.t === 'not' ? [N(concl), concl.a] : [N(concl)], true),
      steps: ['IP assumes the opposite of what you want, then derives a contradiction.', 'So assume ' + m(N(concl)) + (concl.t === 'not' ? ' (or simply ' + m(concl.a) + ', whose negation is the conclusion).' : '.')], hint: 'Assume the negation of the conclusion.' };
    if (kind === 'end') {
      var last = lineF(pr, sp.b), x = last.a;
      return { q: 'An indirect proof must reach a contradiction before IP closes it. Which of these lines would let you close the subproof?', a: fwrong(last, [x, N(x), O(x, N(x)), I(x, N(x))]),
        steps: ['In this system the subproof must end in an explicit contradiction: a line of the form $q \\land \\neg q$.', 'Only ' + m(last) + ' has that form; a line that just looks false, or $q \\lor \\neg q$, is not enough.'], hint: 'Look for a conjunction of a formula and its negation.' };
    }
    if (kind === 'close') {
      var A0 = lineF(pr, sp.a), giv = A0.t === 'not' ? A0.a : N(A0);
      return { q: 'The subproof on lines ' + sp.a + '–' + sp.b + ' assumed ' + m(A0) + ' and reached ' + m(lineF(pr, sp.b)) + '. What does IP ' + sp.a + '–' + sp.b + ' give?', viz: proofViz(pr, [{ n: sp.n, part: 'f' }]),
        a: prop(A0.t === 'not' ? [A0.a, N(A0)] : [N(A0)], true),
        steps: ['IP gives the negation of the assumption, because the assumption led to a contradiction.', 'The assumption was ' + m(A0) + ', so IP gives ' + m(giv) + (A0.t === 'not' ? ' (the negation of ' + m(A0) + ', with the double negation dropped).' : '.')], hint: 'The assumption failed; write its opposite.' };
    }
    var cand = pr.lines.map(function (l, i) { return np + i + 1; }).filter(function (n) { var j = LG().parseJust(lineJ(pr, n)); return j && !j.range && j.rule !== 'AIP'; });
    var n = R.pick(cand), f = lineF(pr, n), j = LG().parseJust(lineJ(pr, n));
    return { q: 'Supply the missing formula on line ' + n + ' (its justification is "' + LG().showJust(j) + '").', viz: proofViz(pr, [{ n: n, part: 'f' }]), a: prop(f, true),
      steps: ['Apply ' + RULE_NAMES[j.rule] + ' to ' + j.lines.map(function (x) { return m(lineF(pr, x)); }).join(' and ') + '.', 'That gives ' + m(f) + '.'], hint: 'Use the cited lines; the aim is a line of the form q ∧ ¬q.' };
  });

  var TPL_NEST = [
    { p: ['A → (B → C)'], c: 'B → (A → C)', l: [['B', 'ACP'], ['A', 'ACP'], ['B → C', 'MP 1, 3'], ['C', 'MP 4, 2'], ['A → C', 'CP 3–5'], ['B → (A → C)', 'CP 2–6']] },
    { p: [], c: 'A → (B → A)', l: [['A', 'ACP'], ['B', 'ACP'], ['A ∧ B', 'Conj 1, 2'], ['A', 'Simp 3'], ['B → A', 'CP 2–4'], ['A → (B → A)', 'CP 1–5']] },
    { p: [], c: '(A → B) → (¬B → ¬A)', l: [['A → B', 'ACP'], ['¬B', 'ACP'], ['¬A', 'MT 1, 2'], ['¬B → ¬A', 'CP 2–3'], ['(A → B) → (¬B → ¬A)', 'CP 1–4']] },
    { p: [], c: '(A ∧ B) → A', l: [['A ∧ B', 'ACP'], ['A', 'Simp 1'], ['(A ∧ B) → A', 'CP 1–2']] },
    { p: ['A → B'], c: '(B → C) → (A → C)', l: [['B → C', 'ACP'], ['A', 'ACP'], ['B', 'MP 1, 3'], ['C', 'MP 2, 4'], ['A → C', 'CP 3–5'], ['(B → C) → (A → C)', 'CP 2–6']] },
    { p: [], c: 'A ∨ ¬A', l: [['¬(A ∨ ¬A)', 'AIP'], ['¬A ∧ ¬¬A', 'DM 1'], ['A ∨ ¬A', 'IP 1–2']] }
  ];
  G('sym.nested-subproofs', function (R, ctx) {
    var lv = ctx.level, tpl = R.pick(TPL_NEST), pr = makeProof(R, lv === 1 ? 1 : 2, tpl), np = nPrem(pr), res = LG().checkProof(proofText(pr));
    var kind = R.pick(byLv(ctx, ['first', 'theorem', 'cite'], ['first', 'cite', 'close', 'theorem'], ['cite', 'close', 'first']));
    var concl = P(pr.conclusion);
    var closes = pr.lines.map(function (l, i) { return { n: np + i + 1, j: LG().parseJust(l.j) }; }).filter(function (x) { return x.j && x.j.range; });
    if (kind === 'theorem') {
      var TH = [
        ['A theorem can be proved with no premises at all.', true, 'A theorem is true in every row, so it follows from nothing; its proof starts with an assumption.'],
        ['A proof of a theorem may end while a subproof is still open.', false, 'Every subproof must be closed; the last line has to stand outside all of them, resting on no assumption.'],
        ['In a proof with no premises, line 1 must be an assumption (ACP or AIP).', true, 'There are no premises to write, and every other rule needs earlier lines to cite.'],
        ['When subproofs are nested, the outer one is closed first.', false, 'The inner one is closed first, like nested parentheses.'],
        ['After an inner subproof is closed, its lines may still be cited inside the outer subproof.', false, 'Once a subproof is closed, none of its lines can be cited again, even inside the outer subproof.'],
        ['A line in the outer subproof may be cited inside the inner subproof.', true, 'The outer assumption is still in force inside the inner subproof, so its lines can be used there.']
      ];
      var th = R.pick(TH);
      return { q: 'True or false: ' + th[0], viz: proofViz(pr), a: tf(th[1]), steps: [th[2]], hint: 'Picture the subproofs as boxes inside boxes.' };
    }
    if (kind === 'first' && concl.t === 'imp') {
      return { q: 'You want to prove ' + m(concl) + (np ? ' from ' + pr.premises.map(m).join(', ') : ' from no premises') + ' by conditional proof. What is the first assumption?', a: prop(concl.a, true),
        steps: ['The conclusion is a conditional, so assume its antecedent ' + m(concl.a) + '.', concl.b.t === 'imp' ? 'Its consequent ' + m(concl.b) + ' is a conditional too, so inside the first subproof you will assume ' + m(concl.b.a) + ' as well: a nested subproof.' : 'Then derive ' + m(concl.b) + ' inside the subproof.'],
        hint: 'Which part of the conclusion comes before the main arrow?' };
    }
    if (kind === 'close' && closes.length >= 2) {
      var inner = closes[0];
      return { q: 'This proof has two subproofs, one inside the other. Which subproof must be closed first?', viz: proofViz(pr),
        a: mc('The one that starts on line ' + inner.j.lines[0], ['The one that starts on line ' + closes[1].j.lines[0], 'Either one may be closed first', 'Neither: both stay open to the end']),
        steps: ['Subproofs close innermost first: the last one opened is the first one closed.', 'The inner subproof starts on line ' + inner.j.lines[0] + ' and is closed on line ' + inner.n + '; the outer one, from line ' + closes[1].j.lines[0] + ', is closed on line ' + closes[1].n + '.'],
        hint: 'Think of nested parentheses.' };
    }
    // which line can be cited at the last line inside the inner subproof, or after it
    var lastN = np + pr.lines.length, rows = res.lines;
    var at0 = closes.length ? closes[closes.length - 1].n : lastN;
    var at1 = closes[0] ? closes[0].n + (closes.length > 1 ? 0 : 0) : lastN;
    var chosen = closes[0] ? closes[0].n : lastN; // the line right after the inner subproof closes
    var target = R.int(1, chosen - 1);
    var s0 = rows[chosen - 1], sT = rows[target - 1];
    // accessible if every assumption open at target is still open at chosen (chosen line's depth after closing)
    var openAt = function (n) { var st = []; for (var i = 1; i <= n; i++) { var j = LG().parseJust(lineJ(pr, i)); if (j && (j.rule === 'ACP' || j.rule === 'AIP')) st.push(i); if (j && j.range && i <= n) st.pop(); } return st; };
    var stT = openAt(target), stC = openAt(chosen);
    var ok = stT.every(function (a) { return stC.indexOf(a) >= 0; });
    return { q: 'Line ' + chosen + ' closes a subproof. May a line written just after line ' + chosen + ' cite line ' + target + '?', viz: proofViz(pr),
      a: mcKeep(['Yes', 'No'], ok ? 'Yes' : 'No'),
      steps: [ok ? 'Line ' + target + ' is not inside any subproof that has been closed, so it can still be cited.' : 'Line ' + target + ' lies inside the subproof that starts on line ' + stT[stT.length - 1] + ', which is closed by line ' + chosen + '. Its lines can no longer be cited.'],
      hint: 'Has the subproof containing that line been closed?' };
  });


  // ================================================================== UNIT 6: Predicate Logic, Translation and Truth
  var PEOPLE = [['Ava', 'a'], ['Ben', 'b'], ['Cleo', 'c'], ['Dev', 'd'], ['Ezra', 'e'], ['Faye', 'f'], ['Gus', 'g'], ['Hana', 'h'], ['Ines', 'i'], ['Jon', 'j'], ['Kai', 'k'], ['Lia', 'l'], ['Milo', 'm'], ['Nia', 'n']];
  var PROPS = [['is friendly', 'F'], ['is tall', 'T'], ['is happy', 'H'], ['sings', 'S'], ['runs fast', 'R'], ['is kind', 'K'], ['writes poems', 'W'], ['is curious', 'C'], ['is busy', 'B'], ['is late', 'L'], ['is quiet', 'Q'], ['plays chess', 'P']];
  var DOES_NOT = { 'sings': 'does not sing', 'runs fast': 'does not run fast', 'writes poems': 'does not write poems', 'plays chess': 'does not play chess' };
  function notP(p) { return DOES_NOT[p] || p.replace(/^is /, 'is not '); }
  function propAdj(p) { return p.replace(/^is /, ''); }
  function pf(s) { return P(s); }

  G('sym.predicates-constants', function (R, ctx) {
    var lv = ctx.level, who = R.sample(PEOPLE, 2), pr = R.sample(PROPS, 2), x = who[0], y = who[1], F = pr[0], Gp = pr[1];
    var keyT = '$' + F[1] + '$: ' + F[0] + (lv > 1 ? '; $' + Gp[1] + '$: ' + Gp[0] : '') + '; $' + x[1] + '$: ' + x[0] + '; $' + y[1] + '$: ' + y[0];
    var T1 = [
      [x[0] + ' ' + F[0] + '.', F[1] + x[1]], [y[0] + ' ' + notP(F[0]) + '.', '¬' + F[1] + y[1]],
      ['Both ' + x[0] + ' and ' + y[0] + ' ' + (F[0].indexOf('is ') === 0 ? 'are ' + propAdj(F[0]) : F[0].replace(/s\b/, '')) + '.', F[1] + x[1] + ' ∧ ' + F[1] + y[1]],
      ['Either ' + x[0] + ' or ' + y[0] + ' ' + F[0] + '.', F[1] + x[1] + ' ∨ ' + F[1] + y[1]],
      ['If ' + x[0] + ' ' + F[0] + ', then ' + y[0] + ' ' + F[0] + ' too.', F[1] + x[1] + ' → ' + F[1] + y[1]]
    ];
    var T2 = [
      [x[0] + ' ' + F[0] + ' but ' + notP(Gp[0]).replace(/^is not /, 'is not ') + '.', F[1] + x[1] + ' ∧ ¬' + Gp[1] + x[1]],
      ['If ' + x[0] + ' ' + F[0] + ', then ' + y[0] + ' ' + Gp[0] + '.', F[1] + x[1] + ' → ' + Gp[1] + y[1]],
      [y[0] + ' ' + Gp[0] + ' only if ' + x[0] + ' ' + F[0] + '.', Gp[1] + y[1] + ' → ' + F[1] + x[1]],
      ['Neither ' + x[0] + ' nor ' + y[0] + ' ' + F[0] + '.', '¬' + F[1] + x[1] + ' ∧ ¬' + F[1] + y[1]]
    ];
    var kind = lv >= 2 && R.chance(0.3) ? 'mc' : 'write';
    var it = R.pick(lv === 1 ? T1 : T1.slice(1).concat(T2));
    var f = pf(it[1]);
    if (kind === 'mc') {
      var right = F[1] + x[1];
      return { q: 'Let $' + F[1] + '$: ' + F[0] + ' and $' + x[1] + '$: ' + x[0] + '. Which formula says "' + x[0] + ' ' + F[0] + '"?', a: mc('$' + right + '$', ['$' + x[1] + F[1] + '$', '$' + F[1] + '$', '$' + x[1] + '$', '$' + F[1] + y[1] + '$']),
        steps: ['Write the predicate letter first, then the name: $' + F[1] + x[1] + '$.', 'A capital letter alone is not a sentence about anyone, and $' + x[1] + F[1] + '$ has the order backward.'], hint: 'Predicate, then name.' };
    }
    return { q: 'Let ' + keyT + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(f),
      steps: ['Each simple sentence is a predicate letter followed by a name; for example, "' + x[0] + ' ' + F[0] + '" is $' + F[1] + x[1] + '$.', 'Then join the parts with the connectives, as in statement logic: ' + m(f) + '.'],
      hint: 'Write each simple sentence as predicate + name first.' };
  });

  // a small world of shapes: objects with a shape (C, S, T), a color (R, B) and sometimes large (L)
  var SHAPE_W = { C: 'circle', S: 'square', T: 'triangle' }, COLOR_W = { R: 'red', B: 'blue' };
  var SHAPE_PRED = { C: 'is a circle', S: 'is a square', T: 'is a triangle', R: 'is red', B: 'is blue', L: 'is large' };
  function randWorld(R, n) {
    var objs = [];
    for (var i = 0; i < n; i++) { var has = [R.pick(['C', 'S', 'T']), R.pick(['R', 'B'])]; if (R.chance(0.4)) has.push('L'); objs.push({ n: 'abcdef'.charAt(i), has: has }); }
    return { objects: objs };
  }
  function objText(o) { return '$' + o.n + '$ is a ' + (o.has.indexOf('L') >= 0 ? 'large ' : 'small ') + COLOR_W[o.has.indexOf('R') >= 0 ? 'R' : 'B'] + ' ' + SHAPE_W[o.has.filter(function (h) { return SHAPE_W[h]; })[0]]; }
  function worldText(w) { return w.objects.map(objText).join('; ') + '.'; }
  function worldViz(w, extra) { var o = { preset: 'shapes', objects: w.objects.map(function (x) { return { n: x.n, has: x.has.slice() }; }), quiet: true, interactive: false }; if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; }); return { name: 'lg-quantworld', opts: o }; }
  function cats3(R) { return R.shuffle([R.pick(['C', 'S', 'T']), R.pick(['R', 'B']), 'L']); }
  function holds(f, w) { return LG().evalWorld(P(f), w); }
  function whoHas(w, f, v) { return w.objects.filter(function (o) { var e = {}; e[v || 'x'] = o.n; return LG().evalWorld(P(f), w, e); }).map(function (o) { return '$' + o.n + '$'; }); }

  G('sym.quantifiers', function (R, ctx) {
    var lv = ctx.level, k = R.pick(['C', 'S', 'T', 'R', 'B', 'L']), F = k, ph = SHAPE_PRED[k];
    var kind = R.pick(byLv(ctx, ['write', 'truth'], ['write', 'truth', 'some'], ['write', 'truth', 'some']));
    var forms = [
      ['Everything ' + ph + '.', '∀x ' + F + 'x'], ['Something ' + ph + '.', '∃x ' + F + 'x'], ['Nothing ' + ph + '.', '∀x ¬' + F + 'x'],
      ['Not everything ' + ph + '.', '¬∀x ' + F + 'x'], ['Something ' + ph.replace(/^is /, 'is not ') + '.', '∃x ¬' + F + 'x'], ['Everything ' + ph.replace(/^is /, 'is not ') + '.', '∀x ¬' + F + 'x']
    ];
    if (kind === 'write') {
      var it = R.pick(lv === 1 ? forms.slice(0, 3) : forms);
      return { q: 'Let $' + F + 'x$: $x$ ' + ph + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
        steps: ['"Everything" is $\\forall x$; "something" is $\\exists x$; "nothing" denies that something is: $\\neg \\exists x$, or $\\forall x \\neg$.', 'So: ' + m(it[1]) + '.'], hint: 'Which quantifier, and where does the ¬ go?' };
    }
    var w = randWorld(R, R.int(3, 4));
    if (kind === 'some') { // "some" stays true when all are F
      w.objects.forEach(function (o) { if (o.has.indexOf('R') < 0) { o.has = o.has.filter(function (h) { return h !== 'B'; }); o.has.push('R'); } });
      return { q: 'In this world every shape is red. ' + worldText(w) + ' Is $\\exists x Rx$ ("something is red") true?', viz: worldViz(w), a: mcKeep(['True', 'False'], 'True'),
        steps: ['$\\exists x Rx$ says at least one thing is red.', 'Here all of them are, so certainly at least one is: it is true. In logic, "some" does not mean "some but not all".'], hint: '"At least one" is satisfied when all of them are.' };
    }
    var it2 = R.pick(forms), v = holds(it2[1], w), wit = whoHas(w, F + 'x');
    return { q: 'In this world: ' + worldText(w) + ' Is ' + m(it2[1]) + ' true?', viz: worldViz(w), a: mcKeep(['True', 'False'], v ? 'True' : 'False'),
      steps: ['The things that ' + ph.replace(/^is /, 'are ') + ': ' + (wit.length ? lst(wit) : 'none') + '.', m(it2[1]) + ' says: ' + it2[0].toLowerCase().replace(/\.$/, '') + '.', 'So it is ' + (v ? 'true' : 'false') + '.'],
      hint: 'Check every object for ∀, and look for one example for ∃.' };
  });

  function catPair(R) { var pr = R.pick(CAT_PAIRS); return [kindOf(pr[0]), kindOf(pr[1])]; }
  function fwrongP(right, wrongs) { return mc(m(right), wrongs.filter(function (w) { return !equivPred(w, right); }).map(m)); }
  var CAT_EN = {
    A: [function (S, P) { return 'All ' + S[0] + ' are ' + P[0] + '.'; }, function (S, P) { return 'Every ' + sing(S) + ' is ' + art(sing(P)) + ' ' + sing(P) + '.'; }, function (S, P) { return 'Each ' + sing(S) + ' is ' + art(sing(P)) + ' ' + sing(P) + '.'; }, function (S, P) { return 'Any ' + sing(S) + ' is ' + art(sing(P)) + ' ' + sing(P) + '.'; }],
    E: [function (S, P) { return 'No ' + S[0] + ' are ' + P[0] + '.'; }, function (S, P) { return 'Not a single ' + sing(S) + ' is ' + art(sing(P)) + ' ' + sing(P) + '.'; }, function (S, P) { return 'No ' + sing(S) + ' is ' + art(sing(P)) + ' ' + sing(P) + '.'; }],
    I: [function (S, P) { return 'Some ' + S[0] + ' are ' + P[0] + '.'; }, function (S, P) { return 'There is ' + art(sing(S)) + ' ' + sing(S) + ' that is ' + art(sing(P)) + ' ' + sing(P) + '.'; }, function (S, P) { return 'At least one ' + sing(S) + ' is ' + art(sing(P)) + ' ' + sing(P) + '.'; }],
    O: [function (S, P) { return 'Some ' + S[0] + ' are not ' + P[0] + '.'; }, function (S, P) { return 'Not every ' + sing(S) + ' is ' + art(sing(P)) + ' ' + sing(P) + '.'; }, function (S, P) { return 'Not all ' + S[0] + ' are ' + P[0] + '.'; }]
  };
  function catF(form, s, p) { return form === 'A' ? '∀x(' + s + 'x → ' + p + 'x)' : form === 'E' ? '∀x(' + s + 'x → ¬' + p + 'x)' : form === 'I' ? '∃x(' + s + 'x ∧ ' + p + 'x)' : '∃x(' + s + 'x ∧ ¬' + p + 'x)'; }
  G('sym.translate-categorical', function (R, ctx) {
    var lv = ctx.level, sp = catPair(R), S = sp[0], Pk = sp[1], form = R.pick(['A', 'E', 'I', 'O']);
    var en = (lv === 1 ? CAT_EN[form][0] : R.pick(CAT_EN[form]))(S, Pk), f = catF(form, S[1], Pk[1]);
    var keyT = '$' + S[1] + 'x$: $x$ ' + S[2] + '; $' + Pk[1] + 'x$: $x$ ' + Pk[2];
    var why = { A: 'An A statement is universal: for every $x$, if $x$ is ' + art(sing(S)) + ' ' + sing(S) + ' then $x$ is ' + art(sing(Pk)) + ' ' + sing(Pk) + '. $\\forall$ goes with $\\to$.', E: 'An E statement: for every $x$, if $x$ is ' + art(sing(S)) + ' ' + sing(S) + ', then it is not ' + art(sing(Pk)) + ' ' + sing(Pk) + '.', I: 'An I statement: there is an $x$ that is both. $\\exists$ goes with $\\land$.', O: 'An O statement: there is an $x$ that is ' + art(sing(S)) + ' ' + sing(S) + ' and not ' + art(sing(Pk)) + ' ' + sing(Pk) + '.' };
    if (lv >= 2 && R.chance(0.35)) {
      var s = S[1], p = Pk[1];
      var wr = form === 'A' ? ['∀x(' + s + 'x ∧ ' + p + 'x)', '∀x(' + p + 'x → ' + s + 'x)', '∃x(' + s + 'x ∧ ' + p + 'x)'] : form === 'E' ? ['¬∀x(' + s + 'x → ' + p + 'x)', '∀x(¬' + s + 'x → ' + p + 'x)', '∃x(' + s + 'x ∧ ¬' + p + 'x)'] : form === 'I' ? ['∃x(' + s + 'x → ' + p + 'x)', '∀x(' + s + 'x → ' + p + 'x)', '∃x ' + s + 'x ∧ ' + p + 'x'] : ['¬∃x(' + s + 'x ∧ ' + p + 'x)', '∃x(' + s + 'x → ¬' + p + 'x)', '∀x(' + s + 'x → ¬' + p + 'x)'];
      return { q: 'Let ' + keyT + '. Which formula says: <b>' + en + '</b>', a: fwrongP(pf(f), wr.map(pf)),
        steps: [why[form], 'So: ' + m(f) + '.', form === 'A' ? 'With $\\land$ it would say that everything is both.' : form === 'I' ? 'With $\\to$ it would be true as soon as anything is not ' + art(sing(S)) + ' ' + sing(S) + '.' : 'Watch where the $\\neg$ goes.'],
        hint: '∀ pairs with →, ∃ pairs with ∧.' };
    }
    return { q: 'Let ' + keyT + '. Write in symbols:<br><b>' + en + '</b>', a: prop(f),
      steps: ['This is ' + (form === 'A' || form === 'E' ? 'an ' : 'an ') + form + ' statement.', why[form], 'So: ' + m(f) + '.'],
      hint: '∀ pairs with →, ∃ pairs with ∧.' };
  });

  var ADJ = [['friendly', 'F'], ['young', 'Y'], ['large', 'Z'], ['noisy', 'N'], ['spotted', 'K'], ['trained', 'J']];
  G('sym.translate-harder', function (R, ctx) {
    var lv = ctx.level, sp = catPair(R), S = sp[0], Pk = sp[1], s = S[1], p = Pk[1];
    var adj = R.pick(ADJ.filter(function (a) { return a[1] !== s && a[1] !== p; })), a = adj[1];
    var other = R.pick(KINDS.filter(function (k) { return k[1] !== s && k[1] !== p && k[1] !== a && k[0] !== S[0] && k[0] !== Pk[0]; }));
    var T = [
      ['Only ' + S[0] + ' are ' + Pk[0] + '.', '∀x(' + p + 'x → ' + s + 'x)', '"Only $S$ are $P$" says every $P$ is an $S$: the order flips.'],
      ['None but ' + S[0] + ' are ' + Pk[0] + '.', '∀x(' + p + 'x → ' + s + 'x)', '"None but" works like "only": everything that is ' + art(sing(Pk)) + ' ' + sing(Pk) + ' is ' + art(sing(S)) + ' ' + sing(S) + '.'],
      ['All ' + adj[0] + ' ' + S[0] + ' are ' + Pk[0] + '.', '∀x((' + a + 'x ∧ ' + s + 'x) → ' + p + 'x)', 'The subject is "' + adj[0] + ' ' + S[0] + '": things that are ' + adj[0] + ' and ' + S[0] + '. That conjunction is the antecedent.'],
      ['Some ' + adj[0] + ' ' + S[0] + ' are ' + Pk[0] + '.', '∃x((' + a + 'x ∧ ' + s + 'x) ∧ ' + p + 'x)', 'There is something that is ' + adj[0] + ', ' + art(sing(S)) + ' ' + sing(S) + ', and ' + art(sing(Pk)) + ' ' + sing(Pk) + '.'],
      ['Every ' + sing(S) + ' is ' + adj[0] + ' and is ' + art(sing(Pk)) + ' ' + sing(Pk) + '.', '∀x(' + s + 'x → (' + a + 'x ∧ ' + p + 'x))', 'The predicate is the conjunction "' + adj[0] + ' and ' + art(sing(Pk)) + ' ' + sing(Pk) + '"; it goes after the arrow.'],
      [cap(S[0]) + ' and ' + other[0] + ' are ' + Pk[0] + '.', '∀x((' + s + 'x ∨ ' + other[1] + 'x) → ' + p + 'x)', 'Anything that is ' + art(sing(S)) + ' ' + sing(S) + ' or ' + art(sing(other)) + ' ' + sing(other) + ' is ' + art(sing(Pk)) + ' ' + sing(Pk) + '. With $\\land$ it would talk about things that are both kinds at once.'],
      ['No ' + S[0] + ' are ' + adj[0] + ' or ' + Pk[0] + '.', '∀x(' + s + 'x → ¬(' + a + 'x ∨ ' + p + 'x))', 'Every ' + sing(S) + ' is neither ' + adj[0] + ' nor ' + art(sing(Pk)) + ' ' + sing(Pk) + '.'],
      [cap(S[0]) + ' are ' + Pk[0] + ' if they are ' + adj[0] + '.', '∀x((' + s + 'x ∧ ' + a + 'x) → ' + p + 'x)', 'For every ' + sing(S) + ': if it is ' + adj[0] + ', it is ' + art(sing(Pk)) + ' ' + sing(Pk) + '. Exporting, this is $\\forall x(' + s + 'x \\to (' + a + 'x \\to ' + p + 'x))$.'],
      ['All except ' + S[0] + ' are ' + Pk[0] + '.', '∀x(¬' + s + 'x → ' + p + 'x) ∧ ∀x(' + s + 'x → ¬' + p + 'x)', 'Two claims: everything that is not ' + art(sing(S)) + ' ' + sing(S) + ' is ' + art(sing(Pk)) + ' ' + sing(Pk) + ', and no ' + sing(S) + ' is. (Equivalently $\\forall x(\\neg ' + s + 'x \\leftrightarrow ' + p + 'x)$.)']
    ];
    var it = R.pick(lv === 1 ? T.slice(0, 4) : lv === 2 ? T.slice(0, 8) : T);
    var used = [S, Pk].concat(/\b(F|Y|Z|N|K|J)x/.test(it[1]) ? [[adj[0], a, 'is ' + adj[0]]] : []).concat(it[1].indexOf(other[1] + 'x') >= 0 ? [other] : []);
    var keyT = used.map(function (k) { return '$' + k[1] + 'x$: $x$ ' + k[2]; }).join('; ');
    if (lv >= 2 && R.chance(0.3) && /^(Only|None but)/.test(it[0])) {
      return { q: 'Let ' + keyT + '. Which formula says: <b>' + it[0] + '</b>', a: fwrongP(pf(it[1]), [pf('∀x(' + s + 'x → ' + p + 'x)'), pf('∀x(' + s + 'x ∧ ' + p + 'x)'), pf('∃x(' + p + 'x ∧ ' + s + 'x)')]),
        steps: [it[2], 'So: ' + m(it[1]) + '. Writing $\\forall x(' + s + 'x \\to ' + p + 'x)$ is the classic slip: it says every ' + sing(S) + ' is ' + art(sing(Pk)) + ' ' + sing(Pk) + ', which is a different claim.'], hint: 'After "only" comes the necessary condition.' };
    }
    return { q: 'Let ' + keyT + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
      steps: [it[2], 'So: ' + m(it[1]) + '.'], hint: /^(Only|None)/.test(it[0]) ? '"Only" introduces the consequent.' : 'Translate the subject and the predicate as whole phrases, then join them with → (all) or ∧ (some).' };
  });

  var QN_PAIRS = [['¬∀x Fx', '∃x ¬Fx'], ['¬∃x Fx', '∀x ¬Fx'], ['¬∀x(Fx → Gx)', '∃x(Fx ∧ ¬Gx)'], ['¬∃x(Fx ∧ Gx)', '∀x(Fx → ¬Gx)'], ['¬∀x(Fx ∨ Gx)', '∃x(¬Fx ∧ ¬Gx)'], ['¬∃x(Fx ∧ ¬Gx)', '∀x(Fx → Gx)']];
  function predLetters(R) { var ks = R.sample(['C', 'S', 'T', 'R', 'B', 'L'], 2); return ks; }
  function rp(s, ks) { return s.replace(/F/g, '\u0001').replace(/G/g, ks[1]).replace(/\u0001/g, ks[0]); }
  G('sym.quantifier-negation', function (R, ctx) {
    var lv = ctx.level, ks = predLetters(R), pr = R.pick(lv === 1 ? QN_PAIRS.slice(0, 2) : QN_PAIRS), a = pf(rp(pr[0], ks)), b = pf(rp(pr[1], ks));
    var kind = R.pick(byLv(ctx, ['write', 'mc'], ['write', 'mc', 'english'], ['write', 'mc', 'english']));
    var mid = a.a.t === 'all' ? { t: 'some', v: 'x', a: N(a.a.a) } : { t: 'all', v: 'x', a: N(a.a.a) };
    var stepsQ = ['Quantifier negation: $\\neg \\forall x$ becomes $\\exists x \\neg$, and $\\neg \\exists x$ becomes $\\forall x \\neg$.', 'So ' + m(a) + ' is equivalent to ' + m(mid) + (same(mid, b) ? '.' : ', and moving the $\\neg$ further in gives ' + m(b) + '.')];
    if (kind === 'write') return { q: 'Rewrite ' + m(a) + ' so that no $\\neg$ stands in front of a quantifier.', a: prop([b, mid].concat(oneStep('Com', b)).concat(oneStep('Com', mid)), true),
      steps: stepsQ, hint: 'Move the ¬ across the quantifier and switch ∀ and ∃.' };
    if (kind === 'english') {
      var c2 = R.coin() ? b : pf(rp(R.pick(['∀x ¬Fx', '∃x(Fx ∧ Gx)', '∀x(Fx → ¬Gx)', '∃x ¬Fx', '∃x(Fx → ¬Gx)']), ks));
      var isEq = equivPred(a, c2);
      return { q: 'True or false: ' + m(a) + ' is equivalent to ' + m(c2) + '.', a: tf(isEq), steps: stepsQ.concat([isEq ? 'So the statement is true.' : 'That is not equivalent to ' + m(c2) + ', so the statement is false.']), hint: 'Push the ¬ inside step by step.' };
    }
    var wr = [pf(rp('∀x ¬Fx', ks)), pf(rp('∃x ¬Fx', ks)), pf(rp('¬∃x Fx', ks)), pf(rp('∀x(Fx → ¬Gx)', ks)), pf(rp('∃x(Fx ∧ ¬Gx)', ks)), pf(rp('∃x(Fx → ¬Gx)', ks)), pf(rp('∀x(¬Fx → Gx)', ks))].filter(function (w) { return !equivPred(w, a); });
    return { q: 'Which formula is equivalent to ' + m(a) + '?', a: fwrongP(b, R.shuffle(wr).slice(0, 3)), steps: stepsQ, hint: 'Switch the quantifier as the ¬ moves past it.' };
  });
  // predicate equivalence for the generator's own choices (the same test the answer checker uses)
  function equivPred(a, b) { return ML._check && ML._check.propEquiv ? ML._check.propEquiv(P(a), P(b)) : same(a, b); }

  var WORLD_SENT = ['∀x(Fx → Gx)', '∃x(Fx ∧ Gx)', '∀x(Fx → ¬Gx)', '∃x(Fx ∧ ¬Gx)', '∀x(Fx ∨ Gx)', '¬∃x Fx', '∃x Fx ∧ ∃x Gx', '∀x Fx ∨ ∃x Gx', '∃x(Fx ∧ (Gx ∧ Hx))', '∀x((Fx ∧ Gx) → Hx)', '¬∀x(Fx → Gx)', '∀x(Fx ↔ Gx)'];
  G('sym.truth-in-world', function (R, ctx) {
    var lv = ctx.level, w = randWorld(R, R.int(lv === 1 ? 3 : 4, lv === 3 ? 5 : 4)), want = R.coin();
    var ks, f, v;
    for (var t = 0; t < 30; t++) {
      ks = cats3(R);
      var tpl = R.pick(lv === 1 ? WORLD_SENT.slice(0, 4) : WORLD_SENT);
      f = pf(tpl.replace(/F/g, '\u0001').replace(/G/g, '\u0002').replace(/H/g, ks[2]).replace(/\u0001/g, ks[0]).replace(/\u0002/g, ks[1]));
      v = holds(f, w); if (v === want) break;
    }
    var wit = LG().witness(f, w);
    var why = wit ? (wit.kind === 'counterexample' ? 'Object $' + wit.obj + '$ is a counterexample, so the universal claim fails.' : wit.kind === 'witness' ? 'Object $' + wit.obj + '$ is a witness.' : wit.kind === 'all' ? 'Every object passes the test.' : 'No object passes the test.') : 'Evaluate each part: ' + kids(f).map(function (k) { return m(k) + ' is ' + (holds(k, w) ? 'true' : 'false'); }).join('; ') + '.';
    return { q: 'In this world: ' + worldText(w) + ' Is ' + m(f) + ' true? (' + ks.filter(function (k) { return sh(f).indexOf(k + 'x') >= 0; }).map(function (k) { return '$' + k + 'x$: $x$ ' + SHAPE_PRED[k]; }).join('; ') + ')', viz: worldViz(w), a: mcKeep(['True', 'False'], v ? 'True' : 'False'),
      steps: ['For $\\forall$, check every object; for $\\exists$, one example is enough.', why, 'So the sentence is ' + (v ? 'true' : 'false') + ' in this world.'],
      hint: 'Go through the objects one at a time.' };
  });

  var CX_ARGS = [ // invalid monadic arguments: [premises, conclusion]
    [['∀x(Fx → Gx)'], '∀x(Gx → Fx)'], [['∃x Fx', '∃x Gx'], '∃x(Fx ∧ Gx)'], [['∀x(Fx ∨ Gx)'], '∀x Fx ∨ ∀x Gx'], [['∃x(Fx ∧ Gx)'], '∀x(Fx → Gx)'],
    [['∀x(Fx → Gx)', '∃x Gx'], '∃x Fx'], [['∀x(Fx → Gx)', '¬Fa'], '¬Ga'], [['∃x Fx'], '∀x Fx'], [['∀x(Fx → Gx)', '∀x(Hx → Gx)'], '∀x(Fx → Hx)']
  ];
  G('sym.counterexample-interpretation', function (R, ctx) {
    var lv = ctx.level, arg = R.pick(lv === 1 ? CX_ARGS.slice(0, 4) : CX_ARGS), ks = cats3(R);
    function sub(s) { return pf(s.replace(/F/g, '\u0001').replace(/G/g, '\u0002').replace(/H/g, ks[2]).replace(/\u0001/g, ks[0]).replace(/\u0002/g, ks[1])); }
    var prem = arg[0].map(sub), concl = sub(arg[1]), want = R.coin(), w, isCx;
    for (var t = 0; t < 200; t++) {
      w = randWorld(R, R.int(2, 3));
      isCx = prem.every(function (p) { return holds(p, w); }) && !holds(concl, w);
      if (isCx === want) break;
    }
    var keyT = ks.filter(function (k) { return [concl].concat(prem).some(function (f) { return sh(f).indexOf(k + 'x') >= 0 || sh(f).indexOf(k + 'a') >= 0; }); }).map(function (k) { return '$' + k + 'x$: $x$ ' + SHAPE_PRED[k]; }).join('; ');
    var stat = prem.map(function (p) { return m(p) + ' is ' + (holds(p, w) ? 'true' : 'false'); }).concat([m(concl) + ' (the conclusion) is ' + (holds(concl, w) ? 'true' : 'false')]);
    return { q: 'Argument: ' + prem.map(m).join('; ') + ', so ' + m(concl) + '. (' + keyT + '.) Is this world a counterexample, showing the argument invalid? ' + worldText(w), viz: worldViz(w),
      a: mcKeep(['Yes, a counterexample', 'No'], isCx ? 'Yes, a counterexample' : 'No'),
      steps: ['A counterexample world makes every premise true and the conclusion false.', 'Here: ' + stat.join('; ') + '.', isCx ? 'Every premise is true and the conclusion is false, so it is a counterexample: the argument is invalid.' : (prem.some(function (p) { return !holds(p, w); }) ? 'A premise is false here, so this world is not a counterexample (check the premises, not only the conclusion).' : 'The conclusion is true here, so this world is not a counterexample.')],
      hint: 'Check the premises too, not only the conclusion.' };
  });


  // ================================================================== UNIT 7: Predicate Logic, Proofs
  var PREDSETS = [['F', 'G', 'H'], ['D', 'M', 'P'], ['S', 'R', 'K'], ['C', 'B', 'L'], ['A', 'E', 'T'], ['W', 'N', 'Q']];
  function predMap(R) { var ps = R.chance(0.5) ? R.pick(PREDSETS) : R.sample(['F', 'G', 'H', 'D', 'M', 'P', 'S', 'R', 'K', 'C', 'B', 'L', 'W', 'N', 'T'], 3), nm = R.pick([['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'e'], ['d', 'a']]); return { F: ps[0], G: ps[1], H: ps[2], a: nm[0], b: nm[1] }; }
  function tmap(f, M) { // rename predicate letters F G H and the names a b in a formula tree
    f = P(f);
    function nm(x) { return (x === 'a' || x === 'b') ? M[x] : x; }
    switch (f.t) {
      case 'pred': return { t: 'pred', p: M[f.p] || f.p, args: f.args.map(nm) };
      case 'eq': return { t: 'eq', a: nm(f.a), b: nm(f.b) };
      case 'not': return N(tmap(f.a, M));
      case 'all': case 'some': return { t: f.t, v: f.v, a: tmap(f.a, M) };
      case 'atom': case 'bot': return f;
      default: return { t: f.t, a: tmap(f.a, M), b: tmap(f.b, M) };
    }
  }
  function qProof(R, tpl) {
    var M = predMap(R), pr = { premises: tpl.p.map(function (s) { return tmap(s, M); }), conclusion: tmap(tpl.c, M), lines: tpl.l.map(function (l) { return { f: tmap(l[0], M), j: l[1] }; }) };
    if (!proofOk(pr)) throw new Error('template does not check: ' + tpl.c);
    return pr;
  }
  var TPL_Q = [
    { p: ['∀x(Fx → Gx)', '∃x Fx'], c: '∃x Gx', l: [['Fa', 'EI 2'], ['Fa → Ga', 'UI 1'], ['Ga', 'MP 4, 3'], ['∃x Gx', 'EG 5']] },
    { p: ['∀x(Fx → Gx)', '∀x(Gx → Hx)'], c: '∀x(Fx → Hx)', l: [['Fy → Gy', 'UI 1'], ['Gy → Hy', 'UI 2'], ['Fy → Hy', 'HS 3, 4'], ['∀x(Fx → Hx)', 'UG 5']] },
    { p: ['∀x(Fx → Gx)', 'Fa'], c: 'Ga', l: [['Fa → Ga', 'UI 1'], ['Ga', 'MP 3, 2']] },
    { p: ['∀x(Fx ∧ Gx)'], c: '∀x Fx', l: [['Fy ∧ Gy', 'UI 1'], ['Fy', 'Simp 2'], ['∀x Fx', 'UG 3']] },
    { p: ['∃x(Fx ∧ Gx)'], c: '∃x Fx', l: [['Fa ∧ Ga', 'EI 1'], ['Fa', 'Simp 2'], ['∃x Fx', 'EG 3']] },
    { p: ['∀x(Fx → ¬Gx)', '∃x Gx'], c: '∃x ¬Fx', l: [['Ga', 'EI 2'], ['Fa → ¬Ga', 'UI 1'], ['¬¬Ga', 'DN 3'], ['¬Fa', 'MT 4, 5'], ['∃x ¬Fx', 'EG 6']] },
    { p: ['¬∃x Fx'], c: '∀x ¬Fx', l: [['∀x ¬Fx', 'QN 1']] },
    { p: ['∀x(Fx ∨ Gx)', '¬Ga'], c: 'Fa', l: [['Fa ∨ Ga', 'UI 1'], ['Fa', 'DS 3, 2']] },
    { p: ['∀x(Fx → Gx)', '¬∀x Gx'], c: '∃x ¬Fx', l: [['∃x ¬Gx', 'QN 2'], ['¬Ga', 'EI 3'], ['Fa → Ga', 'UI 1'], ['¬Fa', 'MT 5, 4'], ['∃x ¬Fx', 'EG 6']] },
    { p: ['∀x Fx', '∀x Gx'], c: '∀x(Fx ∧ Gx)', l: [['Fy', 'UI 1'], ['Gy', 'UI 2'], ['Fy ∧ Gy', 'Conj 3, 4'], ['∀x(Fx ∧ Gx)', 'UG 5']] }
  ];
  var Q_POOL = ['UI', 'EI', 'UG', 'EG', 'QN', 'MP', 'MT', 'HS', 'DS', 'Simp', 'Conj', 'DN'];
  // one quantifier step judged by checkProof: from premise(s) to a line with rule j
  function stepOk(prem, f, j) { var r = LG().checkProof({ premises: prem.map(sh), conclusion: sh(f), lines: [{ f: sh(f), j: j }] }); return r.lines[r.lines.length - 1].ok; }
  function stepMsg(prem, f, j) { var r = LG().checkProof({ premises: prem.map(sh), conclusion: sh(f), lines: [{ f: sh(f), j: j }] }); return r.lines[r.lines.length - 1].msg; }

  G('sym.ui-eg', function (R, ctx) {
    var lv = ctx.level, M = predMap(R), F = M.F, Gq = M.G, a = M.a, b = M.b;
    var kind = R.pick(byLv(ctx, ['ui', 'eg'], ['ui', 'eg', 'judge'], ['judge', 'eg', 'ui']));
    if (kind === 'ui') {
      var src = pf(R.pick(['∀x(' + F + 'x → ' + Gq + 'x)', '∀x(' + F + 'x ∧ ¬' + Gq + 'x)', '∀x(' + F + 'x ∨ ' + Gq + 'x)', '∀x ' + F + 'x']));
      var res = LG().subst(src.a, 'x', a);
      return { q: 'Line 1 is ' + m(src) + '. Use UI with the name $' + a + '$. What is line 2?', a: prop(res, true),
        steps: ['UI drops the $\\forall x$ and puts one name for every $x$ it covered.', 'With $' + a + '$: ' + m(res) + '.'], hint: 'Replace every x by ' + a + ', and drop the quantifier.' };
    }
    if (kind === 'eg') {
      var base = pf(R.pick([F + a + ' ∧ ' + Gq + a, F + a + ' → ' + Gq + a, '¬' + F + a, F + a + ' ∨ ' + Gq + a]));
      var good = { t: 'some', v: 'x', a: LG().parse(sh(base).split(a).join('x')) };
      var bad = [{ t: 'all', v: 'x', a: good.a }, base.t === 'and' || base.t === 'or' || base.t === 'imp' ? { t: base.t, a: { t: 'some', v: 'x', a: good.a.a }, b: good.a.b } : pf('∃x ' + Gq + 'x'), pf('∃x(' + sh(base).split(a).join(b) + ')')];
      bad = bad.filter(function (w) { try { return !stepOk([base], w, 'EG 1'); } catch (e) { return false; } });
      return { q: 'Line 1 is ' + m(base) + '. Which line follows by EG?', a: mc(m(good), bad.map(m)),
        steps: ['EG replaces a name with a variable and puts $\\exists$ in front of the whole line: "it holds of ' + a + ', so it holds of something".', 'So ' + m(good) + '.', 'EG never gives $\\forall$, and the $\\exists$ must cover the variable everywhere it appears.'], hint: 'What you know about one thing shows that something has it.' };
    }
    var cases = [
      [[pf('∀x ' + F + 'x → ' + Gq + a)], pf(F + a + ' → ' + Gq + a), 'UI 1', 'The $\\forall x$ covers only ' + m(pf('∀x ' + F + 'x')) + ': the main connective of line 1 is $\\to$, so UI cannot apply to it.'],
      [[pf('∀x(' + F + 'x → ' + Gq + 'x)')], pf(F + a + ' → ' + Gq + b), 'UI 1', 'UI must put the same name for every $x$.'],
      [[pf('∀x(' + F + 'x → ' + Gq + 'x)')], pf(F + b + ' → ' + Gq + b), 'UI 1', 'UI may use any name, as long as the same one goes everywhere.'],
      [[pf(F + a)], pf('∀x ' + F + 'x'), 'EG 1', 'EG gives $\\exists$, never $\\forall$. One example does not show that everything is ' + F + '.'],
      [[pf(F + a + ' ∧ ' + Gq + a)], pf('∃x(' + F + 'x ∧ ' + Gq + a + ')'), 'EG 1', 'EG may replace some occurrences of the name, not necessarily all.'],
      [[pf('¬∀x ' + F + 'x')], pf('¬' + F + a), 'UI 1', 'Line 1 is a negation, not a universal statement. Use QN first: $\\neg \\forall x$ becomes $\\exists x \\neg$.']
    ];
    var c = R.pick(cases), ok = stepOk(c[0], c[1], c[2]);
    return { q: 'Is this step correct? From ' + m(c[0][0]) + ', infer ' + m(c[1]) + ' by ' + c[2].split(' ')[0] + '.', a: mcKeep(['Correct', 'Not correct'], ok ? 'Correct' : 'Not correct'),
      steps: [c[3], ok ? 'So the step is correct.' : 'So the step is not correct.'], hint: 'Quantifier rules, like rules of inference, use whole lines.' };
  });

  G('sym.ei', function (R, ctx) {
    var lv = ctx.level, M = predMap(R), F = M.F, Gq = M.G, a = M.a, b = M.b;
    var kind = R.pick(byLv(ctx, ['name', 'judge'], ['name', 'judge', 'order'], ['judge', 'order', 'name']));
    var prem = [pf('∃x ' + F + 'x'), pf('∃x ' + Gq + 'x')];
    if (kind === 'name') {
      var used = R.sample(['a', 'b', 'c', 'd'], 2), fresh = ['e', 'g', 'h'].filter(function (n) { return used.indexOf(n) < 0; })[0];
      var pr = { premises: [pf(F + used[0] + ' ∧ ' + Gq + used[1]), pf('∃x ' + M.H + 'x')], conclusion: pf('∃x ' + M.H + 'x'), lines: [] };
      return { q: 'Line 1 is ' + m(pr.premises[0]) + ' and line 2 is ' + m(pr.premises[1]) + '. You use EI on line 2. Which line 3 is allowed?', a: mc(m(pf(M.H + fresh)), [m(pf(M.H + used[0])), m(pf(M.H + used[1])), m(pf(M.H + 'x'))]),
        steps: ['EI needs a new name: one that is not in any earlier line or in the conclusion.', '$' + used[0] + '$ and $' + used[1] + '$ are already used on line 1, and EI needs a name, not a variable.', 'So ' + m(pf(M.H + fresh)) + ' is the allowed step.'], hint: 'Which name has not appeared yet?' };
    }
    if (kind === 'judge') {
      var reuse = R.coin();
      var pr2 = { premises: prem.map(sh), conclusion: '∃x(' + F + 'x ∧ ' + Gq + 'x)', lines: [{ f: F + 'a', j: 'EI 1' }, { f: Gq + (reuse ? 'a' : 'b'), j: 'EI 2' }] };
      var res = LG().checkProof(pr2), ok = res.lines[3].ok;
      return { q: 'Lines 1 and 2 are ' + m(prem[0]) + ' and ' + m(prem[1]) + '. Line 3 is ' + m(pf(F + 'a')) + ' by EI 1. Is line 4, ' + m(pf(Gq + (reuse ? 'a' : 'b'))) + ' by EI 2, correct?', a: mcKeep(['Correct', 'Not correct'], ok ? 'Correct' : 'Not correct'),
        steps: [reuse ? 'No: $a$ is already used on line 3. Line 2 says something is ' + Gq + ', but not that the very same thing is ' + F + '. Reusing the name would let you "prove" that one thing has both properties.' : 'Yes: $b$ is a new name, so EI may use it.'], hint: 'Has the name appeared before?' };
    }
    // order: EI before UI
    return { q: 'Premises: ' + m(pf('∀x(' + F + 'x → ' + Gq + 'x)')) + ' and ' + m(pf('∃x ' + F + 'x')) + '. Which instantiation should come first?', a: mc('EI on the existential premise, with a new name', ['UI on the universal premise first', 'Either order works the same', 'Neither: use UG first']),
      steps: ['EI needs a name that is new. If you use UI first, say ' + m(pf(F + 'a → ' + Gq + 'a')) + ', then $a$ is no longer new and EI cannot use it.', 'UI works with any name, so do EI first (' + m(pf(F + 'a')) + '), then UI with the same name.'], hint: 'Which rule is fussy about names?' };
  });

  G('sym.ug', function (R, ctx) {
    var lv = ctx.level, M = predMap(R), F = M.F, Gq = M.G, a = M.a;
    var cases = [
      [{ premises: ['∀x(' + F + 'x ∧ ' + Gq + 'x)'], conclusion: '∀x ' + F + 'x', lines: [{ f: F + 'y ∧ ' + Gq + 'y', j: 'UI 1' }, { f: F + 'y', j: 'Simp 2' }, { f: '∀x ' + F + 'x', j: 'UG 3' }] }, 4, 'Here $y$ is a variable that came from UI, so it stands for any object at all. UG is allowed.'],
      [{ premises: [F + a], conclusion: '∀x ' + F + 'x', lines: [{ f: '∀x ' + F + 'x', j: 'UG 1' }] }, 2, 'UG cannot generalize a name. Knowing that one thing is ' + F + ' does not show that everything is.'],
      [{ premises: ['∃x ' + F + 'x'], conclusion: '∀x ' + F + 'x', lines: [{ f: F + 'a', j: 'EI 1' }, { f: '∀x ' + F + 'x', j: 'UG 2' }] }, 3, 'The $a$ came from EI: it names one particular thing, so it cannot be generalized.'],
      [{ premises: ['∀x(' + F + 'x → ' + Gq + 'x)', '∀x ' + F + 'x'], conclusion: '∀x ' + Gq + 'x', lines: [{ f: F + 'y → ' + Gq + 'y', j: 'UI 1' }, { f: F + 'y', j: 'UI 2' }, { f: Gq + 'y', j: 'MP 3, 4' }, { f: '∀x ' + Gq + 'x', j: 'UG 5' }] }, 6, '$y$ came from UI and is not in any open assumption, so UG may generalize it.'],
      [{ premises: [], conclusion: F + 'y → ∀x ' + F + 'x', lines: [{ f: F + 'y', j: 'ACP' }, { f: '∀x ' + F + 'x', j: 'UG 1' }, { f: F + 'y → ∀x ' + F + 'x', j: 'CP 1–2' }] }, 2, 'Inside the subproof, $y$ is free in the assumption ' + m(pf(F + 'y')) + ', so it is not "any object": UG is blocked there.']
    ];
    if (R.chance(0.4)) {
      var body = R.pick([F + 'y ∧ ' + Gq + 'y', F + 'y → ' + Gq + 'y', '¬' + F + 'y', F + 'y ∨ ¬' + Gq + 'y', F + 'y → (' + Gq + 'y ∨ ' + M.H + 'y)']), bf = pf(body);
      var src = { t: 'all', v: 'x', a: LG().subst(bf, 'y', 'x') };
      var prA = { premises: [src], conclusion: src, lines: [{ f: bf, j: 'UI 1' }, { f: src, j: 'UG 2' }] };
      return { q: 'Line 2, ' + m(bf) + ', came from line 1 by UI with the variable $y$. What does UG on line 2 give (use $x$)?', viz: proofViz(prA, [{ n: 3, part: 'f' }], { quantifiers: true }), a: prop(src, true),
        steps: ['$y$ came from UI, so it stands for any object: UG may generalize it.', 'Put $x$ for every $y$ and $\\forall x$ in front of the whole line: ' + m(src) + '.'], hint: 'Replace y by x everywhere and add ∀x in front.' };
    }
    var c = R.pick(lv === 1 ? cases.slice(0, 3) : cases), res = LG().checkProof(c[0]), ok = res.lines[c[1] - 1].ok;
    var pr = { premises: c[0].premises.map(P), conclusion: P(c[0].conclusion), lines: c[0].lines.map(function (l) { return { f: P(l.f), j: l.j }; }) };
    return { q: 'Is line ' + c[1] + ', ' + m(lineF(pr, c[1])) + ' by ' + LG().showJust(c[0].lines[c[1] - c[0].premises.length - 1].j) + ', a correct use of UG?', viz: proofViz(pr), a: mcKeep(['Correct', 'Not correct'], ok ? 'Correct' : 'Not correct'),
      steps: ['UG may generalize only a variable that stands for any object: never a name, never a name from EI, and not a variable free in an open assumption.', c[2]], hint: 'Where did the letter being generalized come from?' };
  });

  function qProofProblem(R, ctx, tpls, extraPool) {
    var lv = ctx.level, pr, U = [], pool = Q_POOL.concat(extraPool || []);
    for (var t = 0; t < 10 && !U.length; t++) { pr = qProof(R, R.pick(tpls)); U = uniqueLines(pr, pool).filter(function (u) { return u.j.rule !== 'ACP' && u.j.rule !== 'AIP'; }); }
    var np = nPrem(pr);
    var kind = R.pick(byLv(ctx, ['rule', 'line'], ['rule', 'line', 'line'], ['line', 'rule']));
    if (!U.length) { var cand = pr.lines.map(function (l, i) { return np + i + 1; }).filter(function (n) { var j = LG().parseJust(lineJ(pr, n)); return j && !j.range && j.rule !== 'ACP' && j.rule !== 'AIP'; }); var n0 = R.pick(cand), j0 = LG().parseJust(lineJ(pr, n0)); U = [{ n: n0, j: j0, cited: j0.lines.map(function (x) { return lineF(pr, x); }), f: lineF(pr, n0) }]; kind = 'line'; }
    var L0 = R.pick(U);
    if (kind === 'rule') return { q: 'Which rule justifies line ' + L0.n + '?', viz: proofViz(pr, [{ n: L0.n, part: 'j' }], { quantifiers: true }), a: ruleChoices(R, L0.j.rule, pool, L0.cited, L0.f),
      steps: ['Line ' + L0.n + ' is ' + m(L0.f) + ', from line' + (L0.j.lines.length > 1 ? 's ' : ' ') + L0.j.lines.join(' and ') + ' (' + L0.cited.map(m).join(', ') + ').', 'That is ' + RULE_NAMES[L0.j.rule] + '.'],
      hint: 'Did a quantifier appear, disappear, or stay?' };
    return { q: 'Supply the missing formula on line ' + L0.n + ' (its justification is "' + LG().showJust(L0.j) + '").', viz: proofViz(pr, [{ n: L0.n, part: 'f' }], { quantifiers: true }), a: prop(L0.f, true),
      steps: ['Apply ' + RULE_NAMES[L0.j.rule] + ' to ' + L0.cited.map(m).join(' and ') + '.', 'That gives ' + m(L0.f) + '.'],
      hint: 'Look at the later lines: they show which name or variable this line uses.' };
  }
  G('sym.quantifier-proofs', function (R, ctx) { return qProofProblem(R, ctx, TPL_Q); });

  var TPL_QCP = [
    { p: ['∀x(Fx → Gx)'], c: '∀x Fx → ∀x Gx', l: [['∀x Fx', 'ACP'], ['Fy', 'UI 2'], ['Fy → Gy', 'UI 1'], ['Gy', 'MP 4, 3'], ['∀x Gx', 'UG 5'], ['∀x Fx → ∀x Gx', 'CP 2–6']] },
    { p: ['∀x(Fx → Gx)', '¬∃x Gx'], c: '¬∃x Fx', l: [['∃x Fx', 'AIP'], ['Fa', 'EI 3'], ['Fa → Ga', 'UI 1'], ['Ga', 'MP 5, 4'], ['∀x ¬Gx', 'QN 2'], ['¬Ga', 'UI 7'], ['Ga ∧ ¬Ga', 'Conj 6, 8'], ['¬∃x Fx', 'IP 3–9']] },
    { p: ['∀x(Fx → Gx)'], c: '∀x(Fx → (Fx ∧ Gx))', l: [['Fy', 'ACP'], ['Fy → Gy', 'UI 1'], ['Gy', 'MP 3, 2'], ['Fy ∧ Gy', 'Conj 2, 4'], ['Fy → (Fy ∧ Gy)', 'CP 2–5'], ['∀x(Fx → (Fx ∧ Gx))', 'UG 6']] },
    { p: ['∀x(Fx → Gx)', '∀x(Fx → Hx)'], c: '∀x(Fx → (Gx ∧ Hx))', l: [['Fy', 'ACP'], ['Fy → Gy', 'UI 1'], ['Gy', 'MP 4, 3'], ['Fy → Hy', 'UI 2'], ['Hy', 'MP 6, 3'], ['Gy ∧ Hy', 'Conj 5, 7'], ['Fy → (Gy ∧ Hy)', 'CP 3–8'], ['∀x(Fx → (Gx ∧ Hx))', 'UG 9']] }
  ];
  G('sym.quantifier-cp-ip', function (R, ctx) {
    var lv = ctx.level;
    if (R.chance(0.3)) { // UG inside a subproof on a variable free in the assumption
      var M = predMap(R), F = M.F, Gq = M.G;
      var bad = R.coin();
      var c = bad ? { premises: ['∀x(' + F + 'x → ' + Gq + 'x)'], conclusion: F + 'y → ∀x ' + Gq + 'x', lines: [{ f: F + 'y', j: 'ACP' }, { f: F + 'y → ' + Gq + 'y', j: 'UI 1' }, { f: Gq + 'y', j: 'MP 3, 2' }, { f: '∀x ' + Gq + 'x', j: 'UG 4' }, { f: F + 'y → ∀x ' + Gq + 'x', j: 'CP 2–5' }] }
        : { premises: ['∀x(' + F + 'x → ' + Gq + 'x)'], conclusion: '∀x(' + F + 'x → ' + Gq + 'x)', lines: [{ f: F + 'y', j: 'ACP' }, { f: F + 'y → ' + Gq + 'y', j: 'UI 1' }, { f: Gq + 'y', j: 'MP 3, 2' }, { f: F + 'y → ' + Gq + 'y', j: 'CP 2–4' }, { f: '∀x(' + F + 'x → ' + Gq + 'x)', j: 'UG 5' }] };
      var n = bad ? 5 : 6, res = LG().checkProof(c), ok = res.lines[n - 1].ok;
      var pr = { premises: c.premises.map(P), conclusion: P(c.conclusion), lines: c.lines.map(function (l) { return { f: P(l.f), j: l.j }; }) };
      return { q: 'Is the UG on line ' + n + ' correct?', viz: proofViz(pr, null, { quantifiers: true }), a: mcKeep(['Correct', 'Not correct'], ok ? 'Correct' : 'Not correct'),
        steps: [ok ? 'The subproof that assumed ' + m(pf(F + 'y')) + ' is closed by line ' + (n - 1) + ', so $y$ is no longer tied to an assumption; UG is fine.' : 'Line ' + n + ' is inside the subproof whose assumption ' + m(pf(F + 'y')) + ' has $y$ free. There $y$ is not "any object", only one assumed to be ' + F + ', so UG is not allowed.'],
        hint: 'Is the variable free in an assumption that is still open?' };
    }
    return qProofProblem(R, ctx, TPL_QCP, ['CP', 'IP']);
  });


  // ================================================================== UNIT 8: Relations and Identity
  var RELS = [['L', 'likes', 'is liked by', 'the one who likes', 'the one who is liked'], ['H', 'helps', 'is helped by', 'the helper', 'the one who is helped'], ['A', 'admires', 'is admired by', 'the one who admires', 'the one who is admired'],
    ['T', 'texts', 'is texted by', 'the sender', 'the one who gets the text'], ['W', 'waves to', 'is waved to by', 'the one who waves', 'the one waved to'], ['K', 'knows', 'is known by', 'the one who knows', 'the one who is known']];
  var TRIO_P = [['Ava', 'a'], ['Ben', 'b'], ['Cleo', 'c'], ['Dev', 'd']];
  function relWorld(R, n, letter, dens) {
    var ids = TRIO_P.slice(0, n), pairs = [];
    ids.forEach(function (x) { ids.forEach(function (y) { if (R.chance(dens || 0.4) && (x[1] !== y[1] || R.chance(0.3))) pairs.push([x[1], y[1]]); }); });
    var w = { objects: ids.map(function (x) { return { n: x[1], has: [] }; }), rels: {} }; w.rels[letter] = pairs;
    return { w: w, ids: ids, pairs: pairs };
  }
  function relViz(rw, letter, label) {
    var rels = {}; rels[letter] = { label: label, pairs: rw.pairs.map(function (p) { return p.slice(); }) };
    return { name: 'lg-quantworld', opts: { preds: {}, objects: rw.ids.map(function (x) { return { n: x[1], label: x[0], has: [] }; }), rels: rels, quiet: true, interactive: false } };
  }
  function pairsText(rw, verb) { return rw.pairs.length ? rw.pairs.map(function (p) { var A0 = rw.ids.filter(function (x) { return x[1] === p[0]; })[0][0], B0 = rw.ids.filter(function (x) { return x[1] === p[1]; })[0][0]; return A0 + ' ' + verb + ' ' + (p[0] === p[1] ? (A0 === 'Ben' || A0 === 'Dev' ? 'himself' : 'herself') : B0); }).join('; ') + ', and nothing else.' : 'Nobody ' + verb + ' anybody.'; }
  function selfWord(name) { return name === 'Ben' || name === 'Dev' ? 'himself' : 'herself'; }

  G('sym.relations', function (R, ctx) {
    var lv = ctx.level, rel = R.pick(RELS), L = rel[0], who = R.sample(TRIO_P.slice(0, 3), 2), x = who[0], y = who[1];
    var kind = R.pick(byLv(ctx, ['write', 'order'], ['write', 'write', 'world', 'order'], ['write', 'world', 'write']));
    if (kind === 'order') {
      return { q: 'Let $' + L + 'xy$: $x$ ' + rel[1] + ' $y$; $' + x[1] + '$: ' + x[0] + '; $' + y[1] + '$: ' + y[0] + '. Which formula says "' + y[0] + ' ' + rel[1] + ' ' + x[0] + '"?', a: mc('$' + L + y[1] + x[1] + '$', ['$' + L + x[1] + y[1] + '$', '$' + L + y[1] + y[1] + '$', '$' + L + x[1] + x[1] + '$']),
        steps: ['In $' + L + 'xy$ the first place is ' + rel[3] + ', the second ' + rel[4] + '.', 'So "' + y[0] + ' ' + rel[1] + ' ' + x[0] + '" is $' + L + y[1] + x[1] + '$.'], hint: 'The order of the names follows the order in $' + L + 'xy$.' };
    }
    if (kind === 'world') {
      var rw = relWorld(R, 3, L, 0.4), sents = ['∃x ' + L + 'x' + x[1], '∀x ' + L + x[1] + 'x', '∃x ' + L + x[1] + 'x', '∀x ' + L + 'x' + x[1], L + x[1] + y[1], '¬∃x ' + L + 'x' + x[1], '∃x ' + L + 'xx'];
      var f = pf(R.pick(sents)), v = holds(f, rw.w);
      return { q: 'In this group: ' + pairsText(rw, rel[1]) + ' (' + '$' + L + 'xy$: $x$ ' + rel[1] + ' $y$.) Is ' + m(f) + ' true?', viz: relViz(rw, L, rel[1]), a: mcKeep(['True', 'False'], v ? 'True' : 'False'),
        steps: ['Read the formula: ' + m(f) + '.', 'Check it against the arrows (each arrow goes from ' + rel[3] + ' to ' + rel[4] + ').', 'It is ' + (v ? 'true' : 'false') + '.'], hint: 'Mind the order: the first name is the arrow\'s tail.' };
    }
    var T = [
      [x[0] + ' ' + rel[1] + ' ' + y[0] + '.', L + x[1] + y[1]], [y[0] + ' ' + rel[1] + ' ' + x[0] + '.', L + y[1] + x[1]], [x[0] + ' ' + rel[1] + ' ' + selfWord(x[0]) + '.', L + x[1] + x[1]],
      [x[0] + ' ' + rel[1] + ' everyone.', '∀x ' + L + x[1] + 'x'], ['Everyone ' + rel[1] + ' ' + x[0] + '.', '∀x ' + L + 'x' + x[1]], ['Someone ' + rel[1] + ' ' + y[0] + '.', '∃x ' + L + 'x' + y[1]],
      [y[0] + ' ' + rel[1] + ' someone.', '∃x ' + L + y[1] + 'x'], ['Nobody ' + rel[1] + ' ' + x[0] + '.', '¬∃x ' + L + 'x' + x[1]], [x[0] + ' ' + rel[1] + ' ' + y[0] + ', but ' + y[0] + ' does not return it.', L + x[1] + y[1] + ' ∧ ¬' + L + y[1] + x[1]]
    ];
    var it = R.pick(lv === 1 ? T.slice(0, 3) : T.slice(1));
    if (/does not return/.test(it[0])) it[0] = x[0] + ' ' + rel[1] + ' ' + y[0] + ', but ' + y[0] + ' ' + ({ likes: 'does not like', helps: 'does not help', admires: 'does not admire', texts: 'does not text', 'waves to': 'does not wave to', knows: 'does not know' })[rel[1]] + ' ' + x[0] + '.';
    return { q: 'Let $' + L + 'xy$: $x$ ' + rel[1] + ' $y$; $' + x[1] + '$: ' + x[0] + '; $' + y[1] + '$: ' + y[0] + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
      steps: [cap(rel[3]) + ' goes in the first place after $' + L + '$, ' + rel[4] + ' in the second.', 'So: ' + m(it[1]) + '.'], hint: 'Who does it, and to whom?' };
  });

  G('sym.quantifier-order', function (R, ctx) {
    var lv = ctx.level, rel = R.pick(RELS), L = rel[0];
    var S = [
      ['∀x∃y ' + L + 'xy', 'Everyone ' + rel[1] + ' someone.'], ['∃y∀x ' + L + 'xy', 'Someone ' + rel[2] + ' everyone.'],
      ['∃x∀y ' + L + 'xy', 'Someone ' + rel[1] + ' everyone.'], ['∀y∃x ' + L + 'xy', 'Everyone ' + rel[2] + ' someone.']
    ];
    var kind = R.pick(byLv(ctx, ['world', 'write'], ['world', 'write', 'implies'], ['world', 'write', 'implies']));
    if (kind === 'write') {
      var it = R.pick(S);
      return { q: 'Let $' + L + 'xy$: $x$ ' + rel[1] + ' $y$ (everyone means every person in the group). Write in symbols:<br><b>' + it[1] + '</b>', a: prop(it[0]),
        steps: ['"' + it[1] + '": ' + (it[0].indexOf('∀x∃y') === 0 ? 'for each person $x$ there is some $y$ (maybe a different one for each $x$) with $' + L + 'xy$.' : it[0].indexOf('∃y∀x') === 0 ? 'there is one person $y$ such that every $x$ has $' + L + 'xy$.' : it[0].indexOf('∃x∀y') === 0 ? 'there is one person $x$ with $' + L + 'xy$ for every $y$.' : 'for each person $y$ there is some $x$ with $' + L + 'xy$.'), 'So: ' + m(it[0]) + '. The order of the quantifiers follows the English.'],
        hint: 'Which quantifier comes first in the English: "everyone" or "someone"?' };
    }
    if (kind === 'implies') {
      var dir = R.coin();
      return { q: 'True or false: whenever ' + m(dir ? '∃y∀x ' + L + 'xy' : '∀x∃y ' + L + 'xy') + ' is true, ' + m(dir ? '∀x∃y ' + L + 'xy' : '∃y∀x ' + L + 'xy') + ' must be true too.', a: tf(dir),
        steps: dir ? ['If one person $y$ ' + rel[2] + ' everyone, then each $x$ ' + rel[1] + ' someone: that same $y$.', 'So it is true.'] : ['Each person $x$ could pick a different $y$, so there may be no single person who ' + rel[2] + ' everyone.', 'So it is false: $\\forall x\\exists y$ does not give $\\exists y\\forall x$.'],
        hint: 'Can each x pick a different y?' };
    }
    var rw, f, v, want = R.coin(), t;
    for (t = 0; t < 40; t++) {
      rw = relWorld(R, 3, L, 0.45); f = pf(R.pick(S)[0]); v = holds(f, rw.w);
      if (v === want) break;
    }
    return { q: 'In this group: ' + pairsText(rw, rel[1]) + ' Is ' + m(f) + ' true? ($' + L + 'xy$: $x$ ' + rel[1] + ' $y$.)', viz: relViz(rw, L, rel[1]), a: mcKeep(['True', 'False'], v ? 'True' : 'False'),
      steps: [sh(f).indexOf('∀x∃y') === 0 ? 'For every $x$, look for some $y$ with $' + L + 'xy$: does every person have an arrow going out?' : sh(f).indexOf('∃y∀x') === 0 ? 'Look for one $y$ that every $x$ points to: one person with an arrow coming in from everyone (including from ' + selfWord('Ava').replace('herself', 'themselves') + ').' : sh(f).indexOf('∃x∀y') === 0 ? 'Look for one $x$ with an arrow to every person (including to themselves).' : 'For every $y$, look for some $x$ with $' + L + 'xy$: does every person have an arrow coming in?', 'Here the answer is ' + (v ? 'yes' : 'no') + ', so it is ' + (v ? 'true' : 'false') + '.'],
      hint: 'Read the quantifiers left to right: ∀x∃y lets each x choose its own y.' };
  });

  var EN_RELS = [ // [phrase, domain, reflexive, symmetric, transitive]
    ['is the same height as', 'people', true, true, true], ['is taller than', 'people', false, false, true], ['is a sibling of', 'people', false, true, false],
    ['is at least as old as', 'people', true, false, true], ['lives on the same street as', 'people', true, true, true], ['is an ancestor of', 'people', false, false, true],
    ['sits right next to', 'people in one row of seats', false, true, false], ['is a factor of', 'whole numbers from 1 to 100', true, false, true], ['has the same birthday as', 'people', true, true, true],
    ['is a parent of', 'people', false, false, false]
  ];
  G('sym.relation-properties', function (R, ctx) {
    var lv = ctx.level, prop3 = R.pick(['reflexive', 'symmetric', 'transitive']);
    var DEF = { reflexive: 'Reflexive: every object bears it to itself ($\\forall x Rxx$).', symmetric: 'Symmetric: whenever $Rxy$, also $Ryx$.', transitive: 'Transitive: whenever $Rxy$ and $Ryz$, also $Rxz$.' };
    if (R.chance(lv === 1 ? 0.5 : 0.35)) {
      var e = R.pick(EN_RELS), val = { reflexive: e[2], symmetric: e[3], transitive: e[4] }[prop3];
      var why = { reflexive: e[2] ? 'Everyone ' + e[0] + ' themselves.' : 'Nobody (or not everybody) ' + e[0] + ' themselves.', symmetric: e[3] ? 'If one ' + e[0] + ' the other, the other ' + e[0] + ' the first.' : 'It can hold one way without holding the other way.', transitive: e[4] ? 'It passes along a chain: if $a$ ' + e[0] + ' $b$ and $b$ ' + e[0] + ' $c$, then $a$ ' + e[0] + ' $c$.' : 'A chain does not carry it along' + (e[0] === 'is a sibling of' ? ': Ava is a sibling of Ben and Ben of Ava, but Ava is not her own sibling.' : e[0] === 'sits right next to' ? ': the left seat is next to the middle, the middle to the right, but the left is not next to the right.' : ': a parent\'s parent is a grandparent, not a parent.') };
      return { q: 'On ' + e[1] + ', is the relation "' + e[0] + '" ' + prop3 + '?', a: mcKeep(['Yes', 'No'], val ? 'Yes' : 'No'), steps: [DEF[prop3], why[prop3]], hint: 'Test it with small examples, and look for one that breaks it.' };
    }
    var ids = ['a', 'b', 'c'], pairs = [], rw;
    for (var t = 0; t < 30; t++) {
      pairs = []; ids.forEach(function (x) { ids.forEach(function (y) { if (R.chance(x === y ? 0.5 : 0.4)) pairs.push([x, y]); }); });
      if (pairs.length >= 2) break;
    }
    var pr = LG().relProps(pairs, ids), val2 = pr[prop3];
    rw = { ids: [['a', 'a'], ['b', 'b'], ['c', 'c']], pairs: pairs };
    var listT = '$R = \\{' + pairs.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', ') + '\\}$';
    var reason;
    if (prop3 === 'reflexive') { var miss = ids.filter(function (x) { return !pairs.some(function (p) { return p[0] === x && p[1] === x; }); }); reason = miss.length ? 'The pair $(' + miss[0] + ', ' + miss[0] + ')$ is missing.' : 'Every object has its loop: $(a, a)$, $(b, b)$, $(c, c)$.'; }
    else if (prop3 === 'symmetric') { var bad = pairs.filter(function (p) { return !pairs.some(function (q) { return q[0] === p[1] && q[1] === p[0]; }); })[0]; reason = bad ? '$(' + bad[0] + ', ' + bad[1] + ')$ is in $R$ but $(' + bad[1] + ', ' + bad[0] + ')$ is not.' : 'Every pair comes with its reverse.'; }
    else { var br = null; pairs.forEach(function (p) { pairs.forEach(function (q) { if (!br && p[1] === q[0] && !pairs.some(function (r) { return r[0] === p[0] && r[1] === q[1]; })) br = [p, q]; }); }); reason = br ? '$(' + br[0][0] + ', ' + br[0][1] + ')$ and $(' + br[1][0] + ', ' + br[1][1] + ')$ are in $R$, but $(' + br[0][0] + ', ' + br[1][1] + ')$ is not.' : 'Every chain $(x, y), (y, z)$ is closed by $(x, z)$.'; }
    return { q: 'On the objects $a$, $b$, $c$, the relation is ' + listT + '. Is it ' + prop3 + '?', viz: relViz(rw, 'R', 'R'), a: mcKeep(['Yes', 'No'], val2 ? 'Yes' : 'No'),
      steps: [DEF[prop3], reason, 'So it is ' + (val2 ? '' : 'not ') + prop3 + '.' + (prop3 === 'symmetric' && !val2 && !pr.asymmetric ? ' (It is not asymmetric either: some pairs do go both ways.)' : '')],
      hint: 'Look for one pair that breaks the property.' };
  });

  G('sym.identity', function (R, ctx) {
    var lv = ctx.level, who = R.sample(PEOPLE, 2), x = who[0], y = who[1], F = R.pick(PROPS);
    var kind = R.pick(byLv(ctx, ['write', 'mean'], ['write', 'write', 'mean'], ['write', 'write', 'world']));
    if (kind === 'mean') {
      var c = R.pick([['$' + x[1] + ' = ' + y[1] + '$', 'The names $' + x[1] + '$ and $' + y[1] + '$ name one and the same person.', ['$' + x[1] + '$ and $' + y[1] + '$ are alike in every way that matters.', '$' + x[1] + '$ and $' + y[1] + '$ are two different people.', '$' + x[1] + '$ and $' + y[1] + '$ have the same name.']],
        ['$' + x[1] + ' \\ne ' + y[1] + '$', 'The names $' + x[1] + '$ and $' + y[1] + '$ name two different things.', ['$' + x[1] + '$ and $' + y[1] + '$ are not alike.', '$' + x[1] + '$ and $' + y[1] + '$ are one person.', 'Nothing is named $' + y[1] + '$.']]]);
      return { q: 'What does ' + c[0] + ' say?', a: mc(c[1], c[2]), steps: ['Identity is sameness of object: $a = b$ says one thing has two names.', 'So ' + c[0] + ' says: ' + c[1].charAt(0).toLowerCase() + c[1].slice(1)], hint: 'Identity is not similarity.' };
    }
    if (kind === 'world') {
      var w = randWorld(R, 4), k = R.pick(['R', 'B', 'L']), ph = SHAPE_PRED[k];
      var sents = ['∃x∃y((' + k + 'x ∧ ' + k + 'y) ∧ x ≠ y)', '∀x(' + k + 'x → x = a)', '∃x(' + k + 'x ∧ x ≠ a)', k + 'a ∧ ∀x(' + k + 'x → x = a)'];
      var f = pf(R.pick(sents)), v = holds(f, w), who2 = whoHas(w, k + 'x');
      return { q: 'In this world: ' + worldText(w) + ' Is ' + m(f) + ' true? ($' + k + 'x$: $x$ ' + ph + ')', viz: worldViz(w), a: mcKeep(['True', 'False'], v ? 'True' : 'False'),
        steps: ['The objects that ' + ph.replace(/^is /, 'are ') + ': ' + (who2.length ? lst(who2) : 'none') + '.', 'Read $x = a$ as "$x$ is $a$ itself" and $x \\ne y$ as "two different objects".', 'So the sentence is ' + (v ? 'true' : 'false') + '.'], hint: 'Count the objects, and remember x and y may be the same one unless x ≠ y.' };
    }
    var Fx = F[1], a = x[1], ttl = R.pick([['the team captain', 't'], ['the treasurer', 'r'], ['the new student', 's'], ['the class president', 'p'], ['the club secretary', 'q']]), b = ttl[1];
    y = [ttl[0], b];
    var T = [
      [x[0] + ' is ' + ttl[0] + '.', a + ' = ' + b], [x[0] + ' is not ' + ttl[0] + '.', a + ' ≠ ' + b],
      ['Only ' + x[0] + ' ' + F[0] + '.', F[1] + a + ' ∧ ∀x(' + Fx + 'x → x = ' + a + ')'], ['Someone other than ' + x[0] + ' ' + F[0] + '.', '∃x(' + Fx + 'x ∧ x ≠ ' + a + ')'],
      ['Everyone except ' + x[0] + ' ' + F[0] + '.', '¬' + Fx + a + ' ∧ ∀x(x ≠ ' + a + ' → ' + Fx + 'x)'], [x[0] + ' is the only one who ' + F[0] + '.', F[1] + a + ' ∧ ∀x(' + Fx + 'x → x = ' + a + ')'],
      ['If ' + x[0] + ' ' + F[0] + ' and ' + x[0] + ' is ' + ttl[0] + ', then ' + ttl[0] + ' ' + F[0] + '.', '(' + Fx + a + ' ∧ ' + a + ' = ' + b + ') → ' + Fx + b]
    ];
    var it = R.pick(lv === 1 ? T.slice(0, 4) : T.slice(2));
    var steps = { 0: 'Identity: one object, two names.', 1: '$\\ne$ says two different objects.' };
    var needF = it[1].indexOf(Fx) >= 0, needB = it[1].indexOf(b) >= 0;
    return { q: 'Let ' + (needF ? '$' + Fx + 'x$: $x$ ' + F[0] + '; ' : '') + '$' + a + '$: ' + x[0] + (needB ? '; $' + b + '$: ' + ttl[0] : '') + (/veryone|Only|only one|other than/.test(it[0]) ? ' (the group is the people in the club)' : '') + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
      steps: [/Only|only one/.test(it[0]) ? '"Only ' + x[0] + '" says two things: ' + x[0] + ' ' + F[0] + ', and anyone who ' + F[0] + ' is ' + x[0] + '.' : /other than/.test(it[0]) ? '"Someone other than ' + x[0] + '": something that ' + F[0] + ' and is not identical to $' + a + '$.' : /except/.test(it[0]) ? '"Everyone except ' + x[0] + '": ' + x[0] + ' ' + notP(F[0]) + ', and everyone who is not ' + x[0] + ' ' + F[0] + '.' : 'Identity says one object has two names; $\\ne$ says two different objects.', 'So: ' + m(it[1]) + '.'],
      hint: 'Use x = ' + a + ' to say "is ' + x[0] + '".' };
  });

  G('sym.counting-identity', function (R, ctx) {
    var lv = ctx.level, k = R.pick(['R', 'B', 'L', 'C', 'S', 'T']), ph = SHAPE_PRED[k];
    var C = {
      least1: ['At least one thing ' + ph + '.', '∃x ' + k + 'x'],
      least2: ['At least two things ' + ph.replace(/^is (a |an )?/, 'are ').replace(/^are (circle|square|triangle)$/, 'are $1s') + '.', '∃x∃y((' + k + 'x ∧ ' + k + 'y) ∧ x ≠ y)'],
      most1: ['At most one thing ' + ph + '.', '∀x∀y((' + k + 'x ∧ ' + k + 'y) → x = y)'],
      exactly1: ['Exactly one thing ' + ph + '.', '∃x(' + k + 'x ∧ ∀y(' + k + 'y → y = x))']
    };
    var kind = R.pick(byLv(ctx, ['write', 'world'], ['write', 'world', 'mc'], ['write', 'world', 'mc']));
    if (kind === 'world') {
      var w = randWorld(R, R.int(3, 5)), key0 = R.pick(['least2', 'most1', 'exactly1']), f = pf(C[key0][1]), v = holds(f, w), n = whoHas(w, k + 'x').length;
      return { q: 'In this world: ' + worldText(w) + ' Is ' + m(f) + ' true? ($' + k + 'x$: $x$ ' + ph + ')', viz: worldViz(w), a: mcKeep(['True', 'False'], v ? 'True' : 'False'),
        steps: ['This formula says: ' + C[key0][0].toLowerCase().replace(/\.$/, '') + '.', 'Here ' + n + ' object' + (n === 1 ? '' : 's') + ' ' + (n === 1 ? ph : ph.replace(/^is (a |an )?/, 'are ').replace(/^are (circle|square|triangle)$/, 'are $1s')) + '.', 'So it is ' + (v ? 'true' : 'false') + '.'],
        hint: 'Count, then compare with what the formula claims.' };
    }
    var keyN = R.pick(lv === 1 ? ['least2', 'most1'] : ['least2', 'most1', 'exactly1']), it = C[keyN];
    if (kind === 'mc') {
      var wr = keyN === 'least2' ? ['∃x∃y(' + k + 'x ∧ ' + k + 'y)', '∀x∀y((' + k + 'x ∧ ' + k + 'y) → x = y)', '∃x∃y((' + k + 'x ∧ ' + k + 'y) ∧ x = y)'] : keyN === 'most1' ? ['∃x∃y((' + k + 'x ∧ ' + k + 'y) ∧ x ≠ y)', '∃x ' + k + 'x', '∀x∀y((' + k + 'x ∧ ' + k + 'y) → x ≠ y)'] : ['∃x ' + k + 'x', '∃x(' + k + 'x ∧ ∀y(' + k + 'y → y ≠ x))', '∀x∀y((' + k + 'x ∧ ' + k + 'y) → x = y)'];
      return { q: 'Which formula says: <b>' + it[0] + '</b> ($' + k + 'x$: $x$ ' + ph + ')', a: fwrongP(pf(it[1]), wr.map(pf)),
        steps: [keyN === 'least2' ? 'Two things, and $x \\ne y$ makes sure they are different. Without it, $x$ and $y$ could be the same object.' : keyN === 'most1' ? 'Any two things that are ' + k + ' are the same thing.' : 'One thing is ' + k + ', and anything that is ' + k + ' is that thing.', 'So: ' + m(it[1]) + '.'],
        hint: 'Two variables can name the same object unless you say they don\'t.' };
    }
    return { q: 'Let $' + k + 'x$: $x$ ' + ph + '. Write in symbols:<br><b>' + it[0] + '</b>', a: prop(it[1]),
      steps: [keyN === 'least2' ? 'Say there are $x$ and $y$, both ' + k + ', and add $x \\ne y$ so they are two different things.' : keyN === 'most1' ? 'Say that any two things that are ' + k + ' are identical.' : 'Say that something is ' + k + ' and that anything that is ' + k + ' is identical to it.', 'So: ' + m(it[1]) + '.'],
      hint: keyN === 'least2' ? 'Remember x ≠ y.' : keyN === 'most1' ? 'Use x = y in the consequent.' : 'At least one, and at most one.' };
  });

  var TPL_ID = [
    { p: ['Fa', 'a = b'], c: 'Fb', l: [['Fb', 'Id 1, 2']] },
    { p: ['a = b', 'Gb → Ha', 'Ga'], c: 'Ha', l: [['Gb', 'Id 3, 1'], ['Ha', 'MP 2, 4']] },
    { p: ['a = b'], c: 'b = a', l: [['b = a', 'Id 1']] },
    { p: ['∀x(Fx → x = a)', 'Fb'], c: 'b = a', l: [['Fb → b = a', 'UI 1'], ['b = a', 'MP 3, 2']] },
    { p: ['Fa', '¬Fb'], c: 'a ≠ b', l: [['a = b', 'AIP'], ['Fb', 'Id 1, 3'], ['Fb ∧ ¬Fb', 'Conj 4, 2'], ['a ≠ b', 'IP 3–5']] },
    { p: ['Fa'], c: '∃x(Fx ∧ x = a)', l: [['a = a', 'Id'], ['Fa ∧ a = a', 'Conj 1, 2'], ['∃x(Fx ∧ x = a)', 'EG 3']] },
    { p: ['b = a', 'Ga'], c: 'Gb', l: [['Gb', 'Id 2, 1']] }
  ];
  G('sym.identity-proofs', function (R, ctx) {
    var lv = ctx.level, tpl = R.pick(TPL_ID), pr = qProof(R, tpl), np = nPrem(pr);
    var cand = pr.lines.map(function (l, i) { return np + i + 1; }).filter(function (n) { var j = LG().parseJust(lineJ(pr, n)); return j && !j.range && j.rule !== 'AIP'; });
    var n = R.pick(cand), j = LG().parseJust(lineJ(pr, n)), f = lineF(pr, n), cited = j.lines.map(function (x) { return lineF(pr, x); });
    var kind = R.pick(byLv(ctx, ['line', 'rule', 'dir'], ['line', 'rule', 'dir'], ['line', 'dir', 'rule']));
    if (kind === 'dir') {
      var M = predMap(R), a = M.a, b = M.b, Fq = M.F, back = R.coin();
      var prem = [pf(Fq + a), pf(back ? b + ' = ' + a : a + ' = ' + b)], res = pf(Fq + b), ok = stepOk(prem, res, 'Id 1, 2');
      return { q: 'From ' + m(prem[0]) + ' and ' + m(prem[1]) + ', may you infer ' + m(res) + ' by Id?', a: mcKeep(['Yes', 'No'], ok ? 'Yes' : 'No'),
        steps: ['Id lets you replace a name by another name for the same object, using an identity in either direction ($a = b$ also gives $b = a$).', 'So ' + m(res) + ' follows: yes.'], hint: 'Does it matter which side of = a name is on?' };
    }
    if (kind === 'rule' && j.rule !== 'Id' && LG().rulesFor(cited, f).length === 1) {
      return { q: 'Which rule justifies line ' + n + '?', viz: proofViz(pr, [{ n: n, part: 'j' }], { quantifiers: true }), a: ruleChoices(R, j.rule, ['Id', 'UI', 'EG', 'MP', 'Conj', 'Simp', 'EI'], cited, f),
        steps: ['Line ' + n + ' is ' + m(f) + ' from ' + cited.map(m).join(' and ') + '.', 'That is ' + RULE_NAMES[j.rule] + '.'], hint: 'Did a name change, a quantifier change, or a connective?' };
    }
    if (kind === 'rule' && j.rule === 'Id') {
      return { q: 'Which rule justifies line ' + n + '?', viz: proofViz(pr, [{ n: n, part: 'j' }], { quantifiers: true }), a: mc(RULE_NAMES.Id, [RULE_NAMES.UI, RULE_NAMES.EG, RULE_NAMES.MP]),
        steps: ['Line ' + n + ' is ' + m(f) + (cited.length ? ', from ' + cited.map(m).join(' and ') : ', with no line cited') + '.', cited.length === 2 ? 'One name was replaced by another using an identity: that is Id.' : cited.length === 1 ? 'The identity was turned around: that is Id.' : 'A line $a = a$ may be written at any time: that is Id.'], hint: 'Is there an = involved?' };
    }
    return { q: 'Supply the missing formula on line ' + n + ' (its justification is "' + LG().showJust(j) + '").', viz: proofViz(pr, [{ n: n, part: 'f' }], { quantifiers: true }), a: prop(f, true),
      steps: [j.rule === 'Id' ? (cited.length === 2 ? 'Id: in ' + m(cited.filter(function (c) { return c.t !== 'eq'; })[0] || cited[0]) + ', replace the name using the identity ' + m(cited.filter(function (c) { return c.t === 'eq'; })[0] || cited[1]) + '.' : cited.length === 1 ? 'Id turns ' + m(cited[0]) + ' around.' : 'Id with no cited line gives a self-identity.') : 'Apply ' + RULE_NAMES[j.rule] + ' to ' + cited.map(m).join(' and ') + '.', 'That gives ' + m(f) + '.'],
      hint: 'The next lines show what this one must be.' };
  });

  // ================================================================== UNIT 9: Soundness and Completeness
  G('sym.soundness-completeness', function (R, ctx) {
    var lv = ctx.level, kind = R.pick(['claim', 'arg', 'arg', 'which']);
    if (kind === 'arg') {
      var want = R.coin(), ar = makeArg(R, R.int(1, 2), want), v = ar.v.valid;
      var ask = R.pick(['provable', 'counter']);
      if (ask === 'provable') return { q: 'Our system of rules is sound and complete. Can this argument be proved in it?<br>' + argText(ar.prem, ar.concl), a: mcKeep(['Yes', 'No'], v ? 'Yes' : 'No'),
        steps: [v ? 'A truth table shows it is valid: no row makes the premises true and the conclusion false.' : 'It is invalid: the row ' + rowLabel(ar.v.table.rows[ar.v.counter[0]].val, ar.v.table.letters) + ' makes every premise true and the conclusion false.', v ? 'Completeness: every valid argument can be proved. So yes.' : 'Soundness: nothing invalid can be proved. So no proof exists, however hard you try.'], hint: 'Is it valid? Then think about which property applies.' };
      return { q: 'Someone claims to have a correct proof of this argument in our rules. ' + argText(ar.prem, ar.concl) + ' What must be true?', a: mc(v ? 'The argument is valid, as soundness guarantees.' : 'The proof has a mistake somewhere, since the argument is invalid and our rules are sound.', [v ? 'The proof must have a mistake.' : 'The argument must be valid after all.', 'Nothing follows: proofs and truth tables are unrelated.', 'The rules must be incomplete.']),
        steps: [v ? 'The argument is valid (no counterexample row).' : 'The argument is invalid (it has a counterexample row).', 'Soundness: if it is provable, it is valid. ' + (v ? 'That fits.' : 'So a correct proof of an invalid argument cannot exist: the "proof" breaks a rule somewhere.')], hint: 'Soundness links provable to valid.' };
    }
    var C = [
      ['Soundness says: every argument that can be proved is valid.', true, 'Soundness: if $\\Gamma \\vdash \\varphi$, then $\\Gamma \\models \\varphi$. The rules never lead from true premises to a false conclusion.'],
      ['Completeness says: every valid argument can be proved.', true, 'Completeness: if $\\Gamma \\models \\varphi$, then $\\Gamma \\vdash \\varphi$.'],
      ['Soundness says: every valid argument can be proved.', false, 'That is completeness. Soundness goes the other way: provable implies valid.'],
      ['Completeness says: no invalid argument can be proved.', false, 'That is soundness. Completeness says every valid argument has a proof.'],
      ['Adding the rule "from $p \\to q$ and $q$, infer $p$" would make the system unsound.', true, 'That rule is affirming the consequent: it could "prove" an invalid argument.'],
      ['Removing the rule Addition would make the system unsound.', false, 'Removing a rule can only make fewer things provable, so nothing invalid becomes provable. It might make the system incomplete instead.'],
      ['$\\Gamma \\vdash \\varphi$ is about rules: there is a proof of $\\varphi$ from $\\Gamma$.', true, 'The single turnstile $\\vdash$ means provable; the double turnstile $\\models$ means valid (true in every row or world where the premises are).'],
      ['$\\Gamma \\models \\varphi$ means there is a proof of $\\varphi$ from $\\Gamma$.', false, '$\\models$ is about truth: every row or world that makes the premises true makes $\\varphi$ true. Provable is $\\vdash$.'],
      ['If a proof attempt fails, the argument must be invalid.', false, 'Failing to find a proof shows nothing by itself; completeness only promises that a proof exists for every valid argument. Look for a counterexample instead.'],
      ['For predicate logic, our rules are both sound and complete.', true, 'Gödel proved the completeness of first-order logic in 1929: every valid argument of predicate logic has a proof.']
    ];
    if (kind === 'which') {
      var W = [['Our rules never prove an argument that has a counterexample.', 'Soundness'], ['Every argument with no counterexample has a proof in our rules.', 'Completeness'], ['If $\\Gamma \\vdash \\varphi$ then $\\Gamma \\models \\varphi$.', 'Soundness'], ['If $\\Gamma \\models \\varphi$ then $\\Gamma \\vdash \\varphi$.', 'Completeness'], ['A correct proof guarantees that the conclusion is true whenever the premises are.', 'Soundness'], ['A truth table showing validity guarantees that some proof exists.', 'Completeness']];
      var it = R.pick(W);
      return { q: 'Which property does this describe?<br><b>' + it[0] + '</b>', a: mcKeep(['Soundness', 'Completeness'], it[1]),
        steps: ['Soundness: provable $\\Rightarrow$ valid. Completeness: valid $\\Rightarrow$ provable.', 'This one goes from ' + (it[1] === 'Soundness' ? 'proof to truth' : 'truth to proof') + ', so it is ' + it[1].toLowerCase() + '.'], hint: 'Does it go from proofs to truth, or from truth to proofs?' };
    }
    var c = R.pick(C);
    return { q: 'True or false: ' + c[0], a: tf(c[1]), steps: [c[2]], hint: 'Soundness: provable implies valid. Completeness: valid implies provable.' };
  });

})(window.MathLadder);

/* ---- widen_hum: more questions from the lesson's own tables -----------------------------------------------------
   Each topic listed below also asks about the facts in its lesson's tables (copied here from the lesson, so the
   answers are the lesson's own). Forms, by level:
     match   "Which museum is in Turin?": the right cell and others from the same column (3 choices at level 1, 4 above)
     pairs   lines "A → B": which pairing is right (level 2), or which one is wrong (level 3)
     sort    a comparison table: which column does this cell describe (levels 1-2), or choose all for one column (level 3)
   How often: about a third to a half of the draws, more when the topic's own questions are few at that level.
   Generated by /tmp/work_widen_widen_hum/tabbuild.js from data/<ladder>/lessons/<course>.json. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var TABS = [{"k":"sym.argument-forms#1","h":["Name","Form","Valid?"],"r":[["Modus ponens","$p \\to q$, $p$, so $q$","valid"],["Modus tollens","$p \\to q$, $\\neg q$, so $\\neg p$","valid"],["Hypothetical syllogism","$p \\to q$, $q \\to r$, so $p \\to r$","valid"],["Disjunctive syllogism","$p \\lor q$, $\\neg p$, so $q$","valid"],["Affirming the consequent","$p \\to q$, $q$, so $p$","invalid"],["Denying the antecedent","$p \\to q$, $\\neg p$, so $\\neg q$","invalid"]],"cap":"Four valid forms and two look-alikes.","m":[[0,1,"What is the form of {a}?",0,"a name with its form"],[1,0,"Which argument form is this: {a}?",0]]},
    {"k":"sym.translate-categorical#1","h":["Form","English","Symbols"],"r":[["A","All $S$ are $P$","$\\forall x(Sx \\to Px)$"],["E","No $S$ are $P$","$\\forall x(Sx \\to \\neg Px)$"],["I","Some $S$ are $P$","$\\exists x(Sx \\land Px)$"],["O","Some $S$ are not $P$","$\\exists x(Sx \\land \\neg Px)$"]],"cap":"The four forms in predicate logic.","m":[[1,2,"How is \"{a}\" written in symbols?",0,"English with symbols"],[2,1,"How do you read {a} in English?",0,0,2]]},
    {"k":"sym.quantifier-negation#1","h":["Form","Equivalent form","In words"],"r":[["$\\neg \\forall x Fx$","$\\exists x\\neg Fx$","not everything is $F$ = something is not $F$"],["$\\neg \\exists x Fx$","$\\forall x\\neg Fx$","nothing is $F$ = everything is not $F$"],["$\\forall x Fx$","$\\neg \\exists x\\neg Fx$","everything is $F$ = nothing is not $F$"],["$\\exists x Fx$","$\\neg \\forall x\\neg Fx$","something is $F$ = not everything is not $F$"]],"cap":"Quantifier negation (QN).","m":[[0,1,"Which form is equivalent to {a}?",0,"a form with its equivalent"],[0,2,"In words, what does {a} say?",0,0,2]]}];
  var FUNS = {};
  function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function txt(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function low(s) { return txt(s).toLowerCase().replace(/[.;:,]+$/, ''); }
  function big(x) { return String(x).replace(/<span class="(sc-b|eg-cop|eg-h)">/g, '<span class="$1" style="font-size:1.6em;line-height:1">'); }
  function fill(t, x) { x = big(x); return t.replace('{a:l}', String(x).replace(/^[A-Z](?=[a-z])/, function (c) { return c.toLowerCase(); })).replace('{a}', x); }
  function dot(s) { s = String(s); return /[.!?…"”’)]$/.test(txt(s)) ? s : s + '.'; }
  function sameRow(t, i, a) { return t.r.filter(function (r) { return low(r[a]) === low(t.r[i][a]); }); }
  function partnerSteps(t, tp, right, shown) { // what each wrong choice goes with
    var out = [];
    shown.forEach(function (c) {
      if (low(c) === low(right)) return;
      var rows = t.r.filter(function (r) { return low(r[tp[1]]) === low(c); });
      if (rows.length === 1 && txt(rows[0][tp[0]]).length <= 90) out.push(dot(c + ': that goes with ' + rows[0][tp[0]]));
    });
    return out.slice(0, 3);
  }
  // match: ask for column b from a cell of column a
  function match(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][b]).length <= 130; });
    if (!ok.length) return null;
    var i = R.pick(ok), right = t.r[i][b], seen = {};
    seen[low(right)] = 1;
    var bad = {}; sameRow(t, i, a).forEach(function (r) { bad[low(r[b])] = 1; }); // never a choice that is also right
    var pool = []; t.r.forEach(function (r) { var k = low(r[b]); if (r[b] && !seen[k] && !bad[k] && txt(r[b]).length <= 130) { seen[k] = 1; pool.push(r[b]); } });
    var k = Math.min(L === 1 ? 3 : 4, pool.length + 1); if (k < 3) return null;
    var wrongs = R.shuffle(pool).slice(0, k - 1), choices = [right].concat(wrongs);
    return { q: fill(tp[2], t.r[i][a]), a: { t: 'mc', choices: choices, v: 0 },
      steps: [dot(t.r[i][a] + ' → ' + right), ].concat(partnerSteps(t, tp, right, choices)),
      hint: tp[3] || 'Think back to the lesson’s table' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 'm', a, b, i, txt(t.r[i][a])] };
  }
  // pairs: three or four lines "a → b"; one right (level 2) or one wrong (level 3)
  function pairs(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][a]).length <= 70 && txt(t.r[i][b]).length <= 70; });
    var uniq = {}; ok = ok.filter(function (i) { var k = low(t.r[i][a]); if (uniq[k]) return false; uniq[k] = 1; return true; });
    var n = Math.min(4, ok.length); if (n < 3) return null;
    var rows = R.shuffle(ok).slice(0, n), wrongOne = L >= 3, target = R.int(0, n - 1), lines = [], steps = [];
    for (var j = 0; j < n; j++) {
      var i = rows[j], right = wrongOne ? j !== target : j === target, ans = t.r[i][b];
      if (!right) {
        var good = {}; sameRow(t, i, a).forEach(function (r) { good[low(r[b])] = 1; });
        var ws = []; t.r.forEach(function (r) { if (r[b] && !good[low(r[b])] && txt(r[b]).length <= 70 && ws.map(low).indexOf(low(r[b])) < 0) ws.push(r[b]); });
        if (!ws.length) return null;
        ans = R.pick(ws);
      }
      lines.push(t.r[i][a] + ' → ' + ans);
      steps.push(dot(t.r[i][a] + ' → ' + t.r[i][b] + (right ? ': right' : ', not ' + ans)));
    }
    var what = tp[4] ? ' Each line pairs ' + tp[4] + '.' : '';
    return { q: (wrongOne ? 'Exactly one of these pairings is <b>wrong</b>. Which one?' : 'Exactly one of these pairings is right. Which one?') + what,
      a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own against what you learned.', wh: [t.k, wrongOne ? 'pw' : 'pr', a, b] };
  }
  // sort: which column of a comparison table does a cell belong to
  function sortQ(R, t, L) {
    var cols = t.h.map(function (_, j) { return j; }).filter(function (j) { return j >= (t.na ? 0 : 1) && txt(t.h[j]); });
    if (cols.length < 2) return null;
    var cells = [];
    t.r.forEach(function (r, i) { cols.forEach(function (j) {
      if (!r[j] || (!t.na && !txt(r[0]))) return;
      var dup = cols.some(function (j2) { return j2 !== j && r[j2] && (low(r[j2]) === low(r[j]) || low(r[j2]).indexOf(low(r[j])) >= 0 || low(r[j]).indexOf(low(r[j2])) >= 0); });
      if (!dup && txt(r[j]).length <= 140) cells.push([i, j]);
    }); });
    if (cells.length < 2) return null;
    var heads = cols.map(function (j) { return t.h[j]; });
    if (L >= 3 && cells.length >= 5) {
      var j0 = R.pick(cols), pick = R.shuffle(cells).slice(0, Math.min(5, cells.length));
      var hits = pick.filter(function (c) { return c[1] === j0; }).length;
      if (hits >= 1 && hits < pick.length) {
        var ch = pick.map(function (c) { return lab(t, c); });
        var v = pick.map(function (c, k) { return c[1] === j0 ? k : -1; }).filter(function (k) { return k >= 0; });
        return { q: fill(t.all, t.h[j0]), a: { t: 'mc', choices: ch, v: v },
          steps: pick.map(function (c) { return dot(lab(t, c) + ' (' + t.h[c[1]] + ')'); }),
          hint: 'Go through them one at a time.', wh: [t.k, 'sa', j0, pick] };
      }
    }
    var c = R.pick(cells);
    return { q: t.one + (t.na ? (/^["“]/.test(txt(t.r[c[0]][c[1]])) ? '<br>' + t.r[c[0]][c[1]] : '<br>“' + t.r[c[0]][c[1]] + '”') : '<br>' + asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]), a: { t: 'mc', choices: heads.slice(), v: cols.indexOf(c[1]) },
      steps: t.na ? [dot('That is ' + t.h[c[1]].replace(/^./, function (x) { return x.toLowerCase(); }))] : [dot(txt(t.r[c[0]][0]) + ' for ' + t.h[c[1]] + ': ' + t.r[c[0]][c[1]])].concat(cols.filter(function (j) { return j !== c[1] && t.r[c[0]][j]; }).map(function (j) { return dot('For ' + t.h[j] + ': ' + t.r[c[0]][j]); })),
      hint: 'Think back to the lesson’s comparison' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 's', c[0], c[1]] };
  }
  function asp(x) { return '<b>' + x + (/\?$/.test(txt(x)) ? '' : ':') + '</b> '; }
  function lab(t, c) { return t.na ? t.r[c[0]][c[1]] : asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]; }
  // extra bank items: { q, a, w: [wrong answers, more than are shown], s: [steps], h: hint, lv } or { q, tf: true|false, s, lv }
  function extra(R, t, L) {
    var its = t.x.filter(function (it) { return (it.lv || 1) <= L; }); if (!its.length) return null;
    var it = R.pick(its), p;
    if (it.f) { it = FUNS[it.f](R, L); if (!it) return null; }
    if (it.num !== undefined) {
      p = { q: it.q, a: { t: 'num', v: String(it.num) }, steps: it.s.slice() };
      if (Number.isInteger(it.num) && !it.unit && !it.pct) p.a.form = 'int';
      if (it.pct) p.a.pct = true;
      if (it.tol != null) p.a.tol = it.tol;
      if (it.unit) p.unit = it.unit;
    }
    else if (it.tf !== undefined) p = { q: it.q, a: { t: 'tf', v: it.tf }, steps: it.s.slice() };
    else {
      var k = Math.min(L === 1 ? 3 : 4, it.w.length + 1);
      p = { q: it.q, a: { t: 'mc', choices: [it.a].concat(R.shuffle(it.w).slice(0, k - 1)), v: 0 }, steps: it.s.slice() };
    }
    p.hint = it.h || 'Think back to the lesson.';
    p.wh = [t.k, 'x', its.indexOf(it) >= 0 ? t.x.indexOf(it) : -1];
    return FUNS.__wrap ? FUNS.__wrap(p, L) : p;
  }
  function make(R, list, L) {
    for (var tries = 0; tries < 8; tries++) {
      var t = R.pick(list), p = null;
      if (t.x) p = extra(R, t, L);
      else if (t.one) p = sortQ(R, t, L);
      else {
        var tps = t.m.filter(function (tp) { return (tp[5] || 1) <= L; }); if (!tps.length) continue;
        var tp = R.pick(tps);
        p = L >= 2 && tp[4] && R.chance(0.35) ? pairs(R, t, tp, L) : match(R, t, tp, L);
      }
      if (p) {
        // ladder pages show choices as plain text (only $…$ math is rendered), so choices carry no tags
        if (p.a.t === 'mc') { p.a.choices = p.a.choices.map(plain); var seen = {}; if (p.a.choices.some(function (c) { var k = seen[c]; seen[c] = 1; return k; })) continue; }
        p.nowiden = true; return p;
      }
    }
    return null;
  }
  var BY = {}; TABS.forEach(function (t) { var id = t.k.split('#')[0].split('@')[0]; (BY[id] = BY[id] || []).push(t); });
  var VAR = {};
  function baseCount(id, base, L) { // different questions (ignoring the order of choices) from 40 fixed seeds
    var key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        try { var p = base(ML.rand(id + '#whv#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; } } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  function extCount(id, L) { // different table questions from 40 fixed seeds
    var key = id + '|x|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        var p = make(ML.rand(id + '#whx#' + s + '#' + L), BY[id], L); if (!p) continue;
        var k = p.q + '|' + JSON.stringify(p.a.choices ? p.a.choices.slice().sort() : p.a.v);
        if (!seen[k]) { seen[k] = 1; n++; }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  Object.keys(BY).forEach(function (id) {
    var base = ML.getGen(id); if (!base || base._wh) return;
    var fn = function (R, ctx) {
      var L = (ctx && ctx.level) || 1, n = baseCount(id, base, L), x = extCount(id, L), share = Math.max(0.15, Math.min(0.5, x / (x + n + 1)));
      if (R.chance(share)) { var p = make(R, BY[id], L); if (p) return p; }
      return base(R, ctx);
    };
    fn._wh = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen_hum ---- */

/* ---- widen: more forms of the same questions (so practice repeats less) ----------------------------------------
   Every topic of this course keeps its own problems, and some draws are turned into other forms of the same skill,
   built only from the topic's own problems (so their answers stay the ones the topic already checks):
     check   "Ava chose X. Is Ava right?" (Yes or No) from a one-answer multiple-choice problem
     pairs   two or three lines "question → answer"; which line is right (or, at level 3, which one is wrong)
     tfpick  "Which sentence is true?" (or false) from three of the topic's true-or-false sentences
   Questions whose answer depends on the other choices (first, best, most, not …) show the choices in the check form
   and never go into pairs. Mix per level: CFG.mix[level] = [check, pairs, tfpick] shares; the rest stays as it was. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var CFG = {"prefix":"sym.","only":["connectives","main-connective","translate-conditionals","translate-biconditional","truth-functions","tautology-contradiction","equivalence","de-morgan","conditional-family","statement-relations","validity-truth-table","short-truth-table","argument-forms","mp-mt","simp-conj-add","replacement-intro","dm-dn","trans-impl","indirect-proof","quantifiers","translate-categorical","translate-harder","quantifier-negation","ug","quantifier-order","relation-properties","counting-identity","soundness-completeness"],"skip":["sym.quantifier-negation"]};
  var NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jude', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia',
    'Quinn', 'Rosa', 'Sam', 'Tess', 'Uma', 'Vic', 'Wren', 'Zoe', 'Ada', 'Leo', 'Mia', 'Theo', 'June', 'Max'];
  var REL = /\b(first|last|earliest|latest|earlier|later|before|after|older|oldest|newer|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|look|read|here|example|examples|likely|probably|mainly|main|usually|typically|other|another|which one|each|order|then|next)\b|n['’]t\b/i;
  // pairs judge each line on its own, so only questions whose answer depends on the other choices are left out
  var RELP = /\b(first|last|earliest|latest|oldest|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|which one|other|another|rank|order|more|less|fewer)\b|n['’]t\b|\w+est\b/i;
  var REF = /\b(this|these|those|shown|picture|map|table|chart|graph|diagram|passage|scene|story|above|below|here|following)\b/i;
  var BADCH = /\b(all|none|both|neither) of\b|\b(above|below)\b|^(both|neither|all|none)\b|\bchoice\b|\boption\b/i;
  function strip(s) { return String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function plainish(s) { return !/<(?!\/?(b|i|em|strong)\b)[^>]*>/.test(String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1')); }
  function add(q, html) { // inside a read-aloud big span when there is one
    var m = /<span class="[\w-]*big">/.exec(q);
    if (m) { var k = q.lastIndexOf('</span>'); if (k > m.index) return q.slice(0, k) + '<br>' + html.replace(/<\/p>\s*<p[^>]*>/g, '<br>').replace(/<\/?p[^>]*>/g, '') + q.slice(k); }
    return q + html;
  }
  function single(p) {
    return p && p.a && p.a.t === 'mc' && !Array.isArray(p.a.v) && Array.isArray(p.a.choices) && p.a.choices.length >= 2 &&
      !p.a.choices.some(function (c) { return BADCH.test(strip(c)); });
  }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function nameFor(q, key) { // the same claim always gets the same name, so a name alone never makes a "new" problem
    var t = strip(q), ok = NAMES.filter(function (n) { return t.indexOf(n) < 0 && String(key).indexOf(n) < 0; });
    return (ok.length ? ok : NAMES)[hash(t + '|' + key) % (ok.length || NAMES.length)];
  }
  function dot(s) { s = String(s); return /[.!?…"”')\]]\s*(<\/b>)?$/.test(strip(s)) || /\$$/.test(s) ? s : s + '.'; }
  function optList(ch) { return '<p class="wd-opts">The choices were:<br>' + ch.map(function (c) { return '• ' + c; }).join('<br>') + '</p>'; }
  function copyP(p, q, a, steps) { var o = {}; for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) o[k] = p[k]; o.q = q; o.a = a; o.steps = steps; delete o.choices; return o; }

  // check: show one choice (the right one half the time) and ask whether it is right
  function check(p, R) {
    var ch = p.a.choices, v = p.a.v, idx = ch.map(function (_, i) { return i; }), others = idx.filter(function (i) { return i !== v; });
    var i = R.chance(0.5) ? v : R.pick(others), ok = i === v, nm = nameFor(p.q, ch[i]), letters = ch.every(function (c) { return /^[A-Z]$/.test(String(c)); });
    var stem = strip(p.q), html = '';
    if (!letters && (REL.test(stem) || ch.length > 4 || CFG.listAll)) {
      var shown = p.a.keep ? ch.slice() : R.shuffle(ch);
      html += optList(shown);
    }
    html += '<p class="wd-check">' + nm + ' chose: <b>' + ch[i] + '</b>' + (/[.!?…"”]$/.test(strip(ch[i])) ? '' : '.') + ' Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes. ' + dot(ch[v]) + ' is the right answer.' : 'No. The right answer is: ' + dot(ch[v]);
    if (ok) first = 'Yes, that is the right answer.';
    return copyP(p, add(p.q, html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [first].concat(p.steps || []));
  }
  // check for "choose all": the whole list is shown, and one learner's picks; right only if exactly the right ones
  function checkAll(p, R) {
    var ch = p.a.choices, v = p.a.v.slice().sort(), n = ch.length, pick;
    if (R.chance(0.45)) pick = v.slice();
    else {
      var t = 0; do { var j = R.int(0, n - 1), s = v.slice(), k = s.indexOf(j); if (k >= 0) s.splice(k, 1); else s.push(j); if (R.chance(0.3)) { var j2 = R.int(0, n - 1), k2 = s.indexOf(j2); if (k2 >= 0) s.splice(k2, 1); else s.push(j2); } pick = s.sort(); t++; }
      while (t < 20 && (!pick.length || pick.join() === v.join()));
      if (!pick.length || pick.join() === v.join()) return null;
    }
    var ok = pick.join() === v.join(), nm = nameFor(p.q, pick.join());
    var html = optList(ch) + '<p class="wd-check">' + nm + ' chose ' +
      (pick.length === 1 ? 'only: <b>' + ch[pick[0]] + '</b>' : 'these: <b>' + pick.map(function (i) { return ch[i]; }).join('</b>; <b>') + '</b>') + '. Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes, those are exactly the right ones.' : 'No. The right ones are: ' + v.map(function (i) { return ch[i]; }).join('; ');
    return copyP(p, add(p.q.replace(/\s*(Choose|Select|Pick) (all|every)[^.?!<]*[.?!]?/i, ''), html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [dot(first)].concat(p.steps || []));
  }

  // items for pairs: one-answer questions that stand on their own (no picture, no passage, no "first/best/…")
  function pairItem(p) {
    if (!single(p) || p.viz) return null;
    var max = CFG.maxStem || 120, maxA = CFG.maxAns || 70, a = strip(p.a.choices[p.a.v]), stem, group = '';
    // "prompt<br><b>thing</b>" or "prompt<blockquote>thing</blockquote>": a line is "thing → answer", lines share the prompt
    var q0 = p.q.replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1').trim();
    var m = /^([^<]{6,140}?)\s*(?:<br>\s*<b>([^<]{3,140})<\/b>|<blockquote>([^<]{3,140})<\/blockquote>)\s*$/.exec(q0);
    if (m) { group = m[1].trim(); stem = (m[2] || m[3]).trim(); if (RELP.test(group.replace(/\b(this|these)\b/gi, ''))) return null; }
    else {
      if (!plainish(p.q)) return null;
      stem = strip(p.q); if (RELP.test(stem)) return null;
    }
    if (stem.length > max || stem.length < 3 || a.length > maxA || /^[A-Z]$/.test(a) || /\$/.test(stem + a + group)) return null;
    var w = p.a.choices.filter(function (_, i) { return i !== p.a.v; }).map(strip).filter(function (x) { return x.length <= maxA && x !== a; });
    if (!w.length) return null;
    return { stem: stem.replace(/\s*(Choose one|Pick one)\.?$/i, ''), a: a, w: w, why: (p.steps || [])[0] || '', group: group };
  }
  function tfItem(p) {
    if (!p || !p.a || p.a.t !== 'tf' || p.viz || !plainish(p.q)) return null;
    var s = strip(p.q).replace(/^(True or false\?|True or false:)\s*/i, '').replace(/\s*(True or false\?|Is this true or false\?|Is it true or false\?)$/i, '').trim();
    if (s.length < 8 || s.length > (CFG.maxStem || 120) + 20 || REF.test(s) || /\?$/.test(s) || /\$/.test(s)) return null;
    return { s: s, v: p.a.v, why: (p.steps || [])[0] || '' };
  }
  function harvest(base, R, ctx, make, n, distinct) {
    var out = [], keys = {};
    for (var t = 0; t < 24 && out.length < n; t++) {
      // at level 3, lines may come from level 2 questions too: three lines with one wrong is the harder form
      var c2 = ctx && ctx.level >= 3 && (t % 2) ? Object.assign({}, ctx, { level: 2 }) : ctx;
      var p; try { p = base(ML.rand(R.int(1, 2e9)), c2); } catch (e) { continue; }
      var it = make(p); if (!it) continue;
      if (out.length && it.group !== undefined && it.group !== out[0].group) continue;
      var k = distinct(it); if (k.some(function (x) { return keys[x]; })) continue;
      k.forEach(function (x) { keys[x] = 1; }); out.push(it);
    }
    return out;
  }
  function pairs(base, R, ctx, n, wrongOne) {
    var its = harvest(base, R, ctx, pairItem, n, function (it) { return it.group ? ['s:' + it.stem] : ['s:' + it.stem, 'a:' + it.a]; });
    if (its.length < n) return null;
    var answers = its.map(function (it) { return it.a; }), used = {};
    var target = R.int(0, n - 1), lines = [], steps = [];
    for (var i = 0; i < n; i++) {
      var it = its[i], right = wrongOne ? i !== target : i === target, ans = it.a;
      if (!right) {
        var ws = it.w.filter(function (x) { return (its[0].group || answers.indexOf(x) < 0) && !used[x]; });
        if (!ws.length) return null;
        ans = R.pick(ws); if (!its[0].group) used[ans] = 1;
      }
      lines.push(it.stem + ' → ' + ans); // plain text: ladder pages show choices as text
      steps.push(it.group ? dot(it.stem) + ' Answer: ' + it.a + (right ? '.' : ', not ' + ans + '.') : it.stem + ' The answer is ' + it.a + (right ? '.' : ', not ' + ans + '.'));
    }
    var g = its[0].group, q = g ? '<p class="wd-group">The question for every line: <i>' + g + '</i></p>' + (wrongOne ? 'One line has the <b>wrong</b> answer. Which line is it?' : n === 2 ? 'Which line has the <b>right</b> answer?' : 'Only one line has the right answer. Which line is it?') : wrongOne ? 'Each line is a question and an answer. One answer is <b>wrong</b>. Which line is it?'
      : (n === 2 ? 'Each line is a question and an answer. Which line has the <b>right</b> answer?' : 'Each line is a question and an answer. Only one answer is right. Which line is it?');
    if (its[target].why) steps.push(its[target].why);
    return { q: q, a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own. Does the answer fit the question?' };
  }
  function tfpick(base, R, ctx, wantFalse) {
    var its = harvest(base, R, ctx, tfItem, 6, function (it) { return ['s:' + it.s]; });
    var T = its.filter(function (x) { return x.v; }), F = its.filter(function (x) { return !x.v; });
    var odd = wantFalse ? F : T, rest = wantFalse ? T : F;
    if (!odd.length || rest.length < 2) return null;
    var pick = [odd[0], rest[0], rest[1]], order = R.shuffle([0, 1, 2]), choices = order.map(function (i) { return pick[i].s; });
    var steps = pick.map(function (x) { return x.s + ' ' + (x.v ? 'True.' : 'False.'); });
    if (odd[0].why) steps.push(odd[0].why);
    return { q: wantFalse ? 'Which sentence is <b>false</b>?' : 'Which sentence is <b>true</b>?', a: { t: 'mc', choices: choices, v: order.indexOf(0) }, steps: steps,
      hint: 'Decide about each sentence on its own.' };
  }
  var MIX = CFG.mix || { 1: [0.38, 0.25, 0.04], 2: [0.27, 0.3, 0.1], 3: [0.17, 0.4, 0.15] };
  function wrap(id, base) {
    var fn = function (R, ctx) {
      var lv = ctx && ctx.level || 1, p = base(R, ctx), m = MIX[lv] || MIX[3], r = R.next();
      if (p.nowiden || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf') || (CFG.skip && CFG.skip.indexOf(id) >= 0)) return p; // typed answers stay as they are
      var form = r < m[0] ? 0 : r < m[0] + m[1] ? 1 : r < m[0] + m[1] + m[2] ? 2 : -1;
      if (form < 0) return p;
      var tries = [form, (form + 1) % 3, (form + 2) % 3].filter(function (f) { return m[f] > 0; });
      for (var t = 0; t < tries.length; t++) {
        var f = tries[t], alt = null;
        if (f === 0) alt = single(p) ? check(p, R) : (p.a && p.a.t === 'mc' && Array.isArray(p.a.v) && !p.viz ? checkAll(p, R) : null);
        else if (f === 1) alt = pairs(base, R, ctx, lv === 1 ? 2 : 3, lv >= 3 && R.chance(0.6));
        else alt = tfpick(base, R, ctx, R.chance(0.4));
        if (alt) return alt;
      }
      return p;
    };
    fn.widened = true;
    return fn;
  }
  ML.genIds().forEach(function (id) {
    if (id.indexOf(CFG.prefix) !== 0 || (CFG.only && CFG.only.indexOf(id.slice(CFG.prefix.length)) < 0)) return;
    var g = ML.getGen(id); if (g && !g.widened) ML.gen(id, wrap(id, g));
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen ---- */
