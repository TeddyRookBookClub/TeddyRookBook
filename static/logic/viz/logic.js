/* Logic Ladder: the shared visual kit (names prefixed lg-) and the logic model (MathLadder.logic), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ logic/viz/logic.css). The engine loads both for any visual
   whose name starts with lg- (MathLadder.needViz), and Logic topic pages always load this file, so generators may call
   MathLadder.logic when they make a problem. The model also runs in node: global.window = global; require('…/logic.js').
   Vanilla JS, no libraries, no network. Source parts: /tmp/work_logic/src/*.js (build: /tmp/work_logic/build.sh).

   Embed:  <div class="ml-viz" data-viz="lg-venn3" data-opts='{"premises":["All M are P","All S are M"],"conclusion":"All S are P"}'></div>

   NOTATION (the Logic Ladder's conventions; see /tmp/work_logic/overview.md)
     Connectives ¬ ∧ ∨ → ↔ (ASCII accepted: ~ ! -, & ^ · *, | \/, -> > ⊃, <-> <> ≡), quantifiers ∀x ∃x (also (x) for ∀x),
     identity a = b, a ≠ b (!=). Statement letters are lowercase (p, q, r, s…); predicates are capitals followed by their
     terms (Fx, Lab); variables are x y z w u v, every other lowercase letter in a term position is a name. Binding:
     ¬ tightest, then ∧, ∨, →, ↔ (→ groups to the right); a quantifier covers only what follows it directly (∃x Fx ∧ Gx is
     (∃x Fx) ∧ Gx). Shown with full parentheses around every binary part: ¬(p ∧ q) → r, ∀x(Fx → Gx).
     Categorical propositions in standard form: "All S are P", "No S are P", "Some S are P", "Some S are not P", with any
     words as terms ("Some shapes are not squares"); "non-" makes a complement ("No S are non-P").
     Truth values print as T and F (tf: '10' prints 1 and 0); rows in the standard order (first letter T T T T F F F F…).

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that could give a problem's answer away: verdicts, computed values,
                  highlights, Check buttons and "correct" marks. What the problem asks about stays visible.
     interactive: false   a still picture.     task: a line above the visual.     caption: HTML under it.     label: aria-label.

   THE VISUALS AND THEIR OPTIONS
   lg-sort        card sorter. bins: ['Argument', 'Not an argument']; cards: [{ text, bin (index), why }] (or strings);
                  shuffle: true (a fixed order made from the cards); columns; check (default true when bins are given; a
                  Check button marks each card and explains up to two wrong ones with their why); reveal: true ("Show me");
                  solved: true (start sorted). Tap a card, then a group; or focus a card and press a group's number (0 = back).
   lg-argmap      argument maps. nodes: [{ id, text, kind: 'premise' | 'conclusion' | 'sub' (intermediate conclusion) |
                  'unstated' | 'objection' | 'reply', tag (a custom small label) }]; links: [{ from: [ids], to: id,
                  kind: 'for' | 'against' }]: several ids in one link are LINKED premises (one box with +, one arrow);
                  separate links into one node are CONVERGENT. passage: the text above the map; indicators: true marks
                  indicator words (conclusion blue, premise gold; "so" and "for" only at a clause start) or a list
                  [['because', 'p'], ['so', 'c']] for exactly those words; standard: true (the standard form under the map);
                  steps: true (Back/Next from the conclusion up; step); explain: false (no linked/convergent note).
                  mode: 'label' with sentences: [{ text, kind: 'premise' | 'conclusion' | 'neither' }] (kinds: [[key, label]]
                  to change the buttons): label every sentence, then Check. quiet hides kind labels and notes.
   lg-fallacy     a passage or dialogue with the faulty step. sentences: ['…'] or [{ text, who, phrases: ['loaded word'] }];
                  fault: index or [indexes]; name: 'Straw man'; note: HTML (why it fails); fix: HTML (a fair version);
                  mode: 'show' (highlight, name and note at once; reveal: true waits for a button) | 'find' (learners tap the
                  faulty sentence(s), Check, Show me); numbers: false hides sentence numbers. quiet shows the numbered passage only.
   lg-venn3       Venn diagrams with 2 or 3 circles. terms: [S, P, M] (words or letters; circles: 2 for [S, P]); the circles
                  are labeled with the term and its role (roles: false hides "(S)"). premises: ['All M are P', 'Some S are M']
                  and conclusion; or props: one statement (2 circles), or two to compare side by side (same diagram = they
                  are equivalent: conversion, obversion, contraposition); shade: [regions], xs: [[regions]] draw exactly that.
                  Regions are bit masks: 1 = first circle (S), 2 = second (P), 4 = third (M); 0 is outside all. numbers: true
                  prints the textbook numbering (3 circles: 1 S only, 2 S∧P, 3 P only, 4 S∧M, 5 all three, 6 P∧M, 7 M only,
                  8 outside; 2 circles: 1 S only, 2 both, 3 P only, 4 outside). Universal premises are drawn first; an X goes
                  on the line when a premise allows two regions. The conclusion's region is hatched and a verdict says valid,
                  invalid, or valid if a class has members (traditional reading). steps: true (Back/Next, one premise at a
                  time); assume: 'S' (add the existential assumption for that term, with an on/off button); look: false (no
                  hatching); verdict: false. mode: 'draw': learners shade (Shade tool) and place X marks (X tool; tap near a
                  circle's edge for an X on the line; keyboard: region buttons 1–8, and with X, keys 1–3 put the X on that
                  circle's line), then Check against the premises' diagram (or shade/xs). quiet: no verdict, no hatching.
   lg-square      the square of opposition. s, p: the terms (corner statements are written out); given: { A: true } (one
                  corner; the others follow: true, false or ? undetermined); boolean: true (the modern square: only the
                  contradictory diagonals hold; the rest dashed); highlight: 'contraries' | 'subcontraries' | 'contradictories'
                  | 'subalterns'; relations: false hides relation names; mode: 'fill' (learners cycle each pill T → F → ? and
                  Check). quiet shows only the given value.
   lg-syllogism   a categorical syllogism in standard form. premises: [a, b] in any order (the major premise is the one with
                  the conclusion's predicate) and conclusion; or major, minor, conclusion; keep: true keeps the given order.
                  show: ['terms' (S orange, P blue, M green), 'mood', 'figure' (the four figures, this one outlined), 'name'
                  (Barbara…), 'dist' (distributed terms underlined), 'rules' (the six rules ✓/✗ with fallacy names, or four
                  terms), 'verdict' (modern reading, plus the traditional reading when conditionally valid), 'parts' (one
                  proposition: quantifier, subject term, copula, predicate term)]. Default ['terms', 'mood', 'figure'].
                  mode: 'dist' (learners tap the distributed terms, then Check). One proposition alone: premises: ['No S are P'].
                  quiet: plain standard form, no labels or colors.
   lg-truthtable  truth tables. formulas: ['p → q'] (one: tautology, contradiction or contingent; two: equivalent or not);
                  premises + conclusion: validity (counterexample rows red, all-true rows green); letters (order); sub: true
                  (a column for every part, in build-up order); rows: [indexes] or values: { p: true, q: false } (one row);
                  tf: '10'; labels: false (no premise/conclusion row); verdict: false. mode: 'fill' (fill: 'all' | 'last' |
                  [column indexes, counting from the first non-letter column]; tap to cycle T, F, empty or type T/F; Check) |
                  'short' (one row; learners set the letters to make the premises true and the conclusion false; start:
                  { p: false }). quiet hides verdicts, highlights, Check, and (short mode) the computed columns.
   lg-proof       Fitch-style natural deduction (line numbers, a bar under the premises, a vertical bar for each open
                  subproof, a line under each assumption, justifications at the right). premises: [...]; conclusion;
                  lines: [{ f: 'q', j: 'MP 1, 2', note: 'shown while stepping' }] (numbered after the premises).
                  Justifications: Pr, MP MT HS DS CD Simp Conj Add, DM Com Assoc Dist DN Trans Impl Equiv Exp Taut, ACP AIP
                  (assumptions), "CP 3–5", "IP 3–7", QN UI EI UG EG, Id. mode: 'show' (steps: true walks the lines with notes) |
                  'blanks' (blanks: [{ n: 5, part: 'j' | 'f' | 'both' }]: learners fill them; Check accepts any entry that
                  makes the proof check) | 'build' (learners add lines, assumptions, and Check; every line is checked by the
                  model with a message). quantifiers: true adds ∀ ∃ = to the keypad. goalLine: true writes "/∴ conclusion"
                  beside the last premise. quiet: blanks show as "?", no Check and no marks.
   lg-quantworld  a small world for predicate logic. objects: [{ n: 'a', has: ['C', 'R'], label: 'Ava' }]; preds:
                  { H: 'is happy' } and look: { shape: { C: 'circle', S: 'square', T: 'triangle' }, color: { R: 'red',
                  B: 'blue', G: 'green', Y: 'gold' }, size: { L: 1 } } (preset: 'shapes', the default without preds: C S T R B L);
                  rels: { L: { label: 'likes', pairs: [['a', 'b']] } } (arrows; up to three relations); sentences: [...]
                  (each shows true/false with a witness or counterexample); edit: true (tap an object to toggle its
                  properties and relations; add or remove objects, up to max: 6); goal: { premises, conclusion } (a live
                  readout says when the world is a counterexample). quiet hides truth values, reasons and the goal readout.

   THE MODEL: MathLadder.logic (generators and lessons may use it; all functions are pure)
     parse(s) -> tree (throws an Error with .pos and .logic); tryParse(s) -> tree | null; show(f) -> text; key(f) (compact
     canonical text); same(a, b); main(f) -> 'not' | 'and' | 'or' | 'imp' | 'iff' | 'all' | 'some' | null; letters(fs);
     subformulas(f); depth(f); evalProp(f, { p: true }); rows(letters); table(fs) -> { letters, rows: [{ val, values }] };
     classify(f) -> 'tautology' | 'contradiction' | 'contingent'; equivalent(a, b); validity(premises, conclusion) ->
     { valid, counter: [row indexes], table }; consistent(fs); shortTable(premises, conclusion) -> { valid, rows: [values] };
     freeVars(f); names(f); subst(f, v, t); evalWorld(f, world); witness(f, world); relProps(pairs, ids);
     checkProof({ premises, conclusion, lines: [{ f, j }] }) -> { ok, done, open, lines: [{ n, f, j, depth, ok, msg }] };
     parseJust('CP 3-5'); showJust(j); rulesFor(cited formulas, result) -> the rule names that justify it; RULES (names);
     INFERENCE, REPLACEMENT, QUANT (rule lists); catText(form, s, p); parseCat(text) -> { f, s, p }; distributed(form);
     regionsFor(prop, terms); diagram(props, terms) -> { shade, xs }; shows(diagram, prop, terms);
     syllogism({ premises | major, minor, conclusion }) -> { terms: { S, P, M }, major, minor, conclusion, mood, figure,
     form ('AII-3'), name, valid (modern), conditional (the term that must have members, or null), broken: [fallacies] };
     fromForm('AII-3', S, P, M) -> { major, minor, conclusion }; square(corner, value, boolean); complement(term);
     immediate(prop) -> { conversion, obversion, contraposition } with text and validity; FORM_NAMES.
   Checked in node by /tmp/work_logic/test_model.js: all 256 mood-and-figure forms (15 valid, 9 conditionally valid; the Venn
   test and the six rules agree on every one), the rules of the proof system, and the semantics of worlds.               */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  /* =====================================================================================================================
     THE MODEL: MathLadder.logic (pure functions; no DOM; works in node too)
     ===================================================================================================================== */
  var SYM = { not: '¬', and: '∧', or: '∨', imp: '→', iff: '↔', all: '∀', some: '∃' };
  var BIN = { and: 1, or: 1, imp: 1, iff: 1 };
  var VARS = 'xyzwuv';
  function isVar(c) { return VARS.indexOf(c) >= 0; }

  // ---------- parsing: ¬ ~ ! ; ∧ & ^ · * ; ∨ | \/ ; → -> > ⊃ ; ↔ <-> <> ≡ ; ∀x (x) ; ∃x ; = ≠ ; ⊥ ----------
  function tokenize(s) {
    var out = [], i = 0, m;
    s = String(s).replace(/−/g, '-');
    while (i < s.length) {
      var c = s[i], r = s.slice(i);
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^(<->|<=>|<>|↔|≡|⇔)/.exec(r))) { out.push({ k: 'iff', i: i }); i += m[0].length; continue; }
      if ((m = /^(->|=>|→|⊃|⇒|>)/.exec(r))) { out.push({ k: 'imp', i: i }); i += m[0].length; continue; }
      if ((m = /^(≠|!=|=\/=)/.exec(r))) { out.push({ k: 'neq', i: i }); i += m[0].length; continue; }
      if ((m = /^(¬|~|!|-|not\b)/.exec(r))) { out.push({ k: 'not', i: i }); i += m[0].length; continue; }
      if ((m = /^(∧|&&|&|\^|·|\*|\band\b)/.exec(r))) { out.push({ k: 'and', i: i }); i += m[0].length; continue; }
      if ((m = /^(∨|\|\||\||\\\/|\bor\b)/.exec(r))) { out.push({ k: 'or', i: i }); i += m[0].length; continue; }
      if (c === '=') { out.push({ k: 'eq', i: i }); i++; continue; }
      if (c === '∀' || c === '∃') { out.push({ k: c === '∀' ? 'all' : 'some', i: i }); i++; continue; }
      if (c === '⊥') { out.push({ k: 'bot', i: i }); i++; continue; }
      if (c === '(' || c === '[' || c === '{') { out.push({ k: '(', i: i }); i++; continue; }
      if (c === ')' || c === ']' || c === '}') { out.push({ k: ')', i: i }); i++; continue; }
      if (/[A-Za-z]/.test(c)) { out.push({ k: /[A-Z]/.test(c) ? 'U' : 'l', v: c, i: i }); i++; continue; }
      if (c === ',' ) { i++; continue; }
      if (c === "'" || c === '′') { if (out.length && out[out.length - 1].k === 'l') { out[out.length - 1].v += '′'; i++; continue; } }
      throw perr('I don\'t know the symbol "' + c + '".', i);
    }
    return out;
  }
  function perr(msg, i) { var e = new Error(msg); e.pos = i; e.logic = true; return e; }
  function parse(s) {
    if (s && typeof s === 'object') return s;
    var tk = tokenize(s), p = 0;
    if (!tk.length) throw perr('The formula is empty.', 0);
    function peek(k) { return tk[p] && tk[p].k === k; }
    function eat(k) { if (!peek(k)) throw perr(k === ')' ? 'A parenthesis is missing.' : 'Something is missing here.', tk[p] ? tk[p].i : String(s).length); return tk[p++]; }
    function iff() { var a = imp(); while (peek('iff')) { p++; a = { t: 'iff', a: a, b: imp() }; } return a; }
    function imp() { var a = or(); if (peek('imp')) { p++; return { t: 'imp', a: a, b: imp() }; } return a; } // right-associative
    function or() { var a = and(); while (peek('or')) { p++; a = { t: 'or', a: a, b: and() }; } return a; }
    function and() { var a = un(); while (peek('and')) { p++; a = { t: 'and', a: a, b: un() }; } return a; }
    function un() {
      if (peek('not')) { p++; return { t: 'not', a: un() }; }
      if (peek('all') || peek('some')) { var q = tk[p++].k, v = eat('l'); if (!isVar(v.v)) throw perr('A quantifier needs a variable (x, y, z, w, u or v).', v.i); return { t: q, v: v.v, a: un() }; }
      if (peek('(') && tk[p + 1] && tk[p + 1].k === 'l' && isVar(tk[p + 1].v) && tk[p + 2] && tk[p + 2].k === ')') { var vv = tk[p + 1].v; p += 3; return { t: 'all', v: vv, a: un() }; } // (x)Fx
      return atom();
    }
    function atom() {
      var t = tk[p];
      if (!t) throw perr('The formula ends too soon.', String(s).length);
      if (t.k === '(') { p++; var f = iff(); eat(')'); return f; }
      if (t.k === 'bot') { p++; return { t: 'bot' }; }
      if (t.k === 'U') { p++; var args = []; while (peek('l')) args.push(tk[p++].v); return args.length ? { t: 'pred', p: t.v, args: args } : { t: 'atom', p: t.v }; }
      if (t.k === 'l') {
        p++;
        if (peek('eq') || peek('neq')) { var neg = tk[p++].k === 'neq', b = eat('l'); var e = { t: 'eq', a: t.v, b: b.v }; return neg ? { t: 'not', a: e } : e; }
        return { t: 'atom', p: t.v };
      }
      throw perr('Something is missing before this symbol.', t.i);
    }
    var f = iff();
    if (p < tk.length) throw perr(tk[p].k === ')' ? 'There is an extra ")".' : 'Two parts are not joined by a connective.', tk[p].i);
    return f;
  }
  function tryParse(s) { try { return parse(s); } catch (e) { return null; } }

  // ---------- showing ----------
  function show(f, o) {
    f = parse(f); o = o || {};
    var sp = o.compact ? '' : ' ';
    function wrap(g) { return BIN[g.t] ? '(' + go(g) + ')' : go(g); }
    function go(g) {
      switch (g.t) {
        case 'atom': return g.p;
        case 'bot': return '⊥';
        case 'pred': return g.p + g.args.join('');
        case 'eq': return g.a + sp + '=' + sp + g.b;
        case 'not': return g.a.t === 'eq' && !o.plainNeq ? g.a.a + sp + '≠' + sp + g.a.b : '¬' + wrap(g.a);
        case 'all': case 'some': return SYM[g.t] + g.v + (BIN[g.a.t] || g.a.t === 'eq' ? '(' + go(g.a) + ')' : (g.a.t === 'pred' || g.a.t === 'atom' ? sp : '') + go(g.a));
        default: return wrap(g.a) + sp + SYM[g.t] + sp + wrap(g.b);
      }
    }
    return go(f);
  }
  function key(f) { return show(f, { compact: true, plainNeq: true }); }
  function same(a, b) { try { return key(a) === key(b); } catch (e) { return false; } }
  function kids(f) { return f.t === 'not' || f.t === 'all' || f.t === 'some' ? [f.a] : BIN[f.t] ? [f.a, f.b] : []; }
  function main(f) { f = parse(f); return f.t === 'atom' || f.t === 'pred' || f.t === 'eq' || f.t === 'bot' ? null : f.t; }
  function letters(fs) { var s = {}; (Array.isArray(fs) ? fs : [fs]).forEach(function (f) { (function go(g) { if (g.t === 'atom') s[g.p] = 1; kids(g).forEach(go); })(parse(f)); }); return Object.keys(s).sort(function (a, b) { var A = 'pqrstuvw'.indexOf(a), B = 'pqrstuvw'.indexOf(b); return (A < 0 ? 99 : A) - (B < 0 ? 99 : B) || (a < b ? -1 : 1); }); }
  function subformulas(f) { // in build-up order, without repeats and without atoms
    var out = [], seen = {};
    (function go(g) { kids(g).forEach(go); if (g.t !== 'atom' && g.t !== 'pred' && g.t !== 'eq') { var k = key(g); if (!seen[k]) { seen[k] = 1; out.push(g); } } })(parse(f));
    return out;
  }
  function depth(f) { f = parse(f); var k = kids(f); return k.length ? 1 + Math.max.apply(null, k.map(depth)) : 0; }

  // ---------- truth ----------
  function evalProp(f, val) {
    f = parse(f);
    switch (f.t) {
      case 'atom': if (!(f.p in val)) throw new Error('no value for ' + f.p); return !!val[f.p];
      case 'bot': return false;
      case 'not': return !evalProp(f.a, val);
      case 'and': return evalProp(f.a, val) && evalProp(f.b, val);
      case 'or': return evalProp(f.a, val) || evalProp(f.b, val);
      case 'imp': return !evalProp(f.a, val) || evalProp(f.b, val);
      case 'iff': return evalProp(f.a, val) === evalProp(f.b, val);
    }
    throw new Error('not a propositional formula');
  }
  function rows(ls) { // standard order: the first letter is T for the first half
    var n = ls.length, out = [];
    for (var r = 0; r < (1 << n); r++) { var v = {}; ls.forEach(function (l, i) { v[l] = !((r >> (n - 1 - i)) & 1); }); out.push(v); }
    return out;
  }
  function table(fs, ls) {
    fs = (Array.isArray(fs) ? fs : [fs]).map(parse); ls = ls || letters(fs);
    return { letters: ls, rows: rows(ls).map(function (v) { return { val: v, values: fs.map(function (f) { return evalProp(f, v); }) }; }) };
  }
  function classify(f) { var t = table([f]), n = t.rows.filter(function (r) { return r.values[0]; }).length; return n === t.rows.length ? 'tautology' : n === 0 ? 'contradiction' : 'contingent'; }
  function equivalent(a, b) { var t = table([a, b]); return t.rows.every(function (r) { return r.values[0] === r.values[1]; }); }
  function validity(prem, concl) {
    var fs = prem.concat([concl]), t = table(fs), bad = [];
    t.rows.forEach(function (r, i) { if (r.values.slice(0, -1).every(Boolean) && !r.values[r.values.length - 1]) bad.push(i); });
    return { valid: !bad.length, counter: bad, table: t };
  }
  function consistent(fs) { var t = table(fs); return t.rows.some(function (r) { return r.values.every(Boolean); }); }
  // short truth table: the values that are forced by making the premises true and the conclusion false (null = not forced)
  function shortTable(prem, concl) {
    var v = validity(prem, concl), ls = v.table.letters;
    if (v.valid) return { valid: true, letters: ls, rows: [] };
    return { valid: false, letters: ls, rows: v.counter.map(function (i) { return v.table.rows[i].val; }) };
  }

  // ---------- terms, substitution, free variables ----------
  function freeVars(f, bound) {
    f = parse(f); bound = bound || {}; var out = {};
    (function go(g, b) {
      if (g.t === 'pred') g.args.forEach(function (a) { if (isVar(a) && !b[a]) out[a] = 1; });
      else if (g.t === 'eq') [g.a, g.b].forEach(function (a) { if (isVar(a) && !b[a]) out[a] = 1; });
      else if (g.t === 'all' || g.t === 'some') { var nb = Object.assign({}, b); nb[g.v] = 1; go(g.a, nb); }
      else kids(g).forEach(function (k) { go(k, b); });
    })(f, bound);
    return Object.keys(out);
  }
  function names(f) { var out = {}; (function go(g) { if (g.t === 'pred') g.args.forEach(function (a) { if (!isVar(a)) out[a] = 1; }); else if (g.t === 'eq') [g.a, g.b].forEach(function (a) { if (!isVar(a)) out[a] = 1; }); kids(g).forEach(go); })(parse(f)); return Object.keys(out).sort(); }
  function terms(f) { var out = {}; (function go(g) { if (g.t === 'pred') g.args.forEach(function (a) { out[a] = 1; }); else if (g.t === 'eq') { out[g.a] = 1; out[g.b] = 1; } kids(g).forEach(go); })(parse(f)); return Object.keys(out).sort(); }
  function subst(f, v, t) { // replace free occurrences of variable v by term t
    f = parse(f);
    function r(a) { return a === v ? t : a; }
    switch (f.t) {
      case 'pred': return { t: 'pred', p: f.p, args: f.args.map(r) };
      case 'eq': return { t: 'eq', a: r(f.a), b: r(f.b) };
      case 'all': case 'some': return f.v === v ? f : { t: f.t, v: f.v, a: subst(f.a, v, t) };
      case 'not': return { t: 'not', a: subst(f.a, v, t) };
      case 'atom': case 'bot': return f;
      default: return { t: f.t, a: subst(f.a, v, t), b: subst(f.b, v, t) };
    }
  }
  // does `inst` come from `body` by putting one term t for every free occurrence of the variable v (other positions equal)?
  // returns { term: t } (t = null when v is not free in body) or false. strict (for UG): t must not already occur in body.
  function instOf(body, v, inst, strict) {
    var t = null, ok = true;
    (function go(g, h, bound) {
      if (!ok) return;
      if (g.t !== h.t) { ok = false; return; }
      function term(a, b) {
        if (a === v && !bound[v]) { if (bound[b]) ok = false; else if (t === null) t = b; else if (b !== t) ok = false; }
        else if (a !== b) ok = false;
      }
      switch (g.t) {
        case 'pred': if (g.p !== h.p || g.args.length !== h.args.length) { ok = false; return; } g.args.forEach(function (a, i) { term(a, h.args[i]); }); return;
        case 'eq': term(g.a, h.a); term(g.b, h.b); return;
        case 'atom': if (g.p !== h.p) ok = false; return;
        case 'bot': return;
        case 'all': case 'some': if (g.v !== h.v) { ok = false; return; } var nb = Object.assign({}, bound); nb[g.v] = 1; go(g.a, h.a, nb); return;
        default: kids(g).forEach(function (k, i) { go(k, kids(h)[i], bound); });
      }
    })(parse(body), parse(inst), {});
    if (!ok) return false;
    if (strict && t !== null && t !== v && terms(body).indexOf(t) >= 0) return false;
    return { term: t };
  }

  // ---------- small worlds (predicate logic semantics) ----------
  // world = { objects: [{ n: 'a', has: ['F', 'G'] }], rels: { L: [['a', 'b']] }, names: { a: 'a' } (optional: name -> object) }
  function evalWorld(f, w, env) {
    f = parse(f); env = env || {};
    var objs = w.objects || [], ids = objs.map(function (o) { return o.n; });
    function den(a) { if (a in env) return env[a]; if (w.names && a in w.names) return w.names[a]; if (ids.indexOf(a) >= 0) return a; throw new Error('The name ' + a + ' is not in this world.'); }
    function has(o, P) { var ob = objs.filter(function (x) { return x.n === o; })[0]; return !!ob && (ob.has || []).indexOf(P) >= 0; }
    switch (f.t) {
      case 'pred':
        if (f.args.length === 1) return has(den(f.args[0]), f.p);
        var tup = f.args.map(den);
        return ((w.rels || {})[f.p] || []).some(function (r) { return r.length === tup.length && r.every(function (x, i) { return x === tup[i]; }); });
      case 'eq': return den(f.a) === den(f.b);
      case 'atom': return !!(w.props || {})[f.p];
      case 'bot': return false;
      case 'not': return !evalWorld(f.a, w, env);
      case 'and': return evalWorld(f.a, w, env) && evalWorld(f.b, w, env);
      case 'or': return evalWorld(f.a, w, env) || evalWorld(f.b, w, env);
      case 'imp': return !evalWorld(f.a, w, env) || evalWorld(f.b, w, env);
      case 'iff': return evalWorld(f.a, w, env) === evalWorld(f.b, w, env);
      case 'all': return ids.every(function (o) { var e = Object.assign({}, env); e[f.v] = o; return evalWorld(f.a, w, e); });
      case 'some': return ids.some(function (o) { var e = Object.assign({}, env); e[f.v] = o; return evalWorld(f.a, w, e); });
    }
  }
  // a witness or counterexample object for a quantified sentence (its outermost quantifier), for the "why" readouts
  function witness(f, w) {
    f = parse(f); var ids = (w.objects || []).map(function (o) { return o.n; });
    var neg = false; if (f.t === 'not' && (f.a.t === 'all' || f.a.t === 'some')) { neg = true; f = f.a; }
    if (f.t !== 'all' && f.t !== 'some') return null;
    var test = function (o) { var e = {}; e[f.v] = o; return evalWorld(f.a, w, e); };
    if (f.t === 'all') { var bad = ids.filter(function (o) { return !test(o); }); return bad.length ? { kind: 'counterexample', obj: bad[0] } : { kind: 'all', obj: null }; }
    var good = ids.filter(test); return good.length ? { kind: 'witness', obj: good[0] } : { kind: 'none', obj: null };
  }
  function relProps(pairs, ids) {
    var has = function (a, b) { return pairs.some(function (p) { return p[0] === a && p[1] === b; }); };
    var refl = ids.every(function (a) { return has(a, a); }), irr = ids.every(function (a) { return !has(a, a); });
    var sym = pairs.every(function (p) { return has(p[1], p[0]); }), asym = pairs.every(function (p) { return !has(p[1], p[0]); });
    var anti = pairs.every(function (p) { return p[0] === p[1] || !has(p[1], p[0]); });
    var trans = pairs.every(function (p) { return pairs.every(function (q) { return p[1] !== q[0] || has(p[0], q[1]); }); });
    return { reflexive: refl, irreflexive: irr, symmetric: sym, asymmetric: asym, antisymmetric: anti, transitive: trans };
  }

  // ---------- natural deduction (the system of the Logic Ladder: 8 rules of inference, 10 of replacement, CP, IP,
  //            QN, UI, EI, UG, EG and identity; see the header) ----------
  function pat(s) { return parse(s); }
  function match(p, f, B) { // p: a pattern whose statement letters are metavariables; B: bindings (mutated on success only)
    var b = Object.assign({}, B);
    function go(p, f) {
      if (p.t === 'atom') { if (p.p in b) return key(b[p.p]) === key(f); b[p.p] = f; return true; }
      if (p.t !== f.t) return false;
      if (p.t === 'all' || p.t === 'some') return p.v === f.v && go(p.a, f.a);
      var pk = kids(p), fk = kids(f); return pk.every(function (k, i) { return go(k, fk[i]); });
    }
    if (!go(p, f)) return null; return b;
  }
  var INF = {
    MP: [['p → q', 'p'], 'q'], MT: [['p → q', '¬q'], '¬p'], HS: [['p → q', 'q → r'], 'p → r'],
    DS: [[['p ∨ q', '¬p'], 'q'], [['p ∨ q', '¬q'], 'p']], CD: [['(p → q) ∧ (r → s)', 'p ∨ r'], 'q ∨ s'],
    Simp: [[['p ∧ q'], 'p'], [['p ∧ q'], 'q']], Conj: [['p', 'q'], 'p ∧ q'], Add: [[['p'], 'p ∨ q'], [['p'], 'q ∨ p']]
  };
  var REP = {
    DM: [['¬(p ∧ q)', '¬p ∨ ¬q'], ['¬(p ∨ q)', '¬p ∧ ¬q']], Com: [['p ∨ q', 'q ∨ p'], ['p ∧ q', 'q ∧ p']],
    Assoc: [['p ∨ (q ∨ r)', '(p ∨ q) ∨ r'], ['p ∧ (q ∧ r)', '(p ∧ q) ∧ r']],
    Dist: [['p ∧ (q ∨ r)', '(p ∧ q) ∨ (p ∧ r)'], ['p ∨ (q ∧ r)', '(p ∨ q) ∧ (p ∨ r)']],
    DN: [['p', '¬¬p']], Trans: [['p → q', '¬q → ¬p']], Impl: [['p → q', '¬p ∨ q']],
    Equiv: [['p ↔ q', '(p → q) ∧ (q → p)'], ['p ↔ q', '(p ∧ q) ∨ (¬p ∧ ¬q)']], Exp: [['(p ∧ q) → r', 'p → (q → r)']],
    Taut: [['p', 'p ∨ p'], ['p', 'p ∧ p']]
  };
  var RULES = { // full names, for menus and messages
    MP: 'Modus Ponens', MT: 'Modus Tollens', HS: 'Hypothetical Syllogism', DS: 'Disjunctive Syllogism', CD: 'Constructive Dilemma',
    Simp: 'Simplification', Conj: 'Conjunction', Add: 'Addition', DM: 'De Morgan\'s Rule', Com: 'Commutation', Assoc: 'Association',
    Dist: 'Distribution', DN: 'Double Negation', Trans: 'Transposition', Impl: 'Material Implication', Equiv: 'Material Equivalence',
    Exp: 'Exportation', Taut: 'Tautology', CP: 'Conditional Proof', IP: 'Indirect Proof', ACP: 'Assumption for CP', AIP: 'Assumption for IP',
    QN: 'Quantifier Negation', UI: 'Universal Instantiation', EI: 'Existential Instantiation', UG: 'Universal Generalization',
    EG: 'Existential Generalization', Id: 'Identity', Pr: 'Premise'
  };
  var NCITE = { MP: 2, MT: 2, HS: 2, DS: 2, CD: 2, Simp: 1, Conj: 2, Add: 1, UI: 1, EI: 1, UG: 1, EG: 1, QN: 1 };
  ['DM', 'Com', 'Assoc', 'Dist', 'DN', 'Trans', 'Impl', 'Equiv', 'Exp', 'Taut'].forEach(function (r) { NCITE[r] = 1; });
  Object.keys(INF).forEach(function (r) { var v = INF[r]; INF[r] = (Array.isArray(v[0][0]) ? v : [v]).map(function (x) { return [x[0].map(pat), pat(x[1])]; }); });
  Object.keys(REP).forEach(function (r) { REP[r] = REP[r].map(function (x) { return [pat(x[0]), pat(x[1])]; }); });
  function perms(a) { if (a.length < 2) return [a]; var out = []; a.forEach(function (x, i) { perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(function (r) { out.push([x].concat(r)); }); }); return out; }
  function infOk(rule, cited, res) {
    return INF[rule].some(function (form) {
      if (form[0].length !== cited.length) return false;
      return perms(cited).some(function (cs) {
        var B = {};
        for (var i = 0; i < cs.length; i++) { B = match(form[0][i], cs[i], B); if (!B) return false; }
        return !!match(form[1], res, B);
      });
    });
  }
  function qnPair(a, b) { // ¬∀xφ :: ∃x¬φ, ¬∃xφ :: ∀x¬φ, ∀xφ :: ¬∃x¬φ, ∃xφ :: ¬∀x¬φ (either direction)
    function one(a, b) {
      if (a.t === 'not' && (a.a.t === 'all' || a.a.t === 'some') && (b.t === 'all' || b.t === 'some') && b.t !== a.a.t && b.v === a.a.v && b.a.t === 'not' && same(b.a.a, a.a.a)) return true;
      if ((a.t === 'all' || a.t === 'some') && b.t === 'not' && (b.a.t === 'all' || b.a.t === 'some') && b.a.t !== a.t && b.a.v === a.v && b.a.a.t === 'not' && same(b.a.a.a, a.a)) return true;
      return false;
    }
    return one(a, b) || one(b, a);
  }
  function repPair(rule, a, b) {
    if (rule === 'QN') return qnPair(a, b);
    return REP[rule].some(function (pr) { var B = match(pr[0], a, {}); if (B && match(pr[1], b, B)) return true; B = match(pr[0], b, {}); return !!(B && match(pr[1], a, B)); });
  }
  function repOk(rule, from, to) { // one application, anywhere inside the line
    function at(a, b) {
      if (repPair(rule, a, b)) return true;
      if (a.t !== b.t || ((a.t === 'all' || a.t === 'some') && a.v !== b.v)) return false;
      var ka = kids(a), kb = kids(b), diff = [];
      ka.forEach(function (k, i) { if (key(k) !== key(kb[i])) diff.push(i); });
      return diff.length === 1 && at(ka[diff[0]], kb[diff[0]]);
    }
    return at(from, to);
  }
  // justification text: "MP 1, 2", "CP 3–5", "Pr", "ACP", "Id", "Id 4, 6"
  function parseJust(s) {
    s = String(s || '').trim(); if (!s) return null;
    var m = /^([A-Za-z]+)\s*(.*)$/.exec(s); if (!m) return null;
    var r = m[1], rest = m[2], nm = null;
    Object.keys(RULES).forEach(function (k) { if (k.toLowerCase() === r.toLowerCase()) nm = k; });
    if (!nm) { var al = { premise: 'Pr', p: 'Pr', prem: 'Pr', as: 'ACP', assume: 'ACP', assumption: 'ACP', a: 'ACP', ae: 'ACP', ip: 'IP', cp: 'CP', dneg: 'DN', impl: 'Impl', imp: 'Impl', mi: 'Impl', me: 'Equiv', taut: 'Taut', exp: 'Exp', simp: 'Simp', conj: 'Conj', add: 'Add' }; nm = al[r.toLowerCase()] || null; }
    if (!nm) return { rule: r, bad: true, lines: [] };
    var range = /^(\d+)\s*[-–—]\s*(\d+)$/.exec(rest.trim());
    if (range) return { rule: nm, lines: [+range[1], +range[2]], range: true };
    var ls = (rest.match(/\d+/g) || []).map(Number);
    return { rule: nm, lines: ls };
  }
  function showJust(j) { if (!j) return ''; if (typeof j === 'string') j = parseJust(j); if (!j) return ''; return j.rule + (j.lines.length ? ' ' + (j.range ? j.lines[0] + '–' + j.lines[1] : j.lines.join(', ')) : ''); }
  /* checkProof({ premises: ['p → q', 'p'], conclusion: 'q', lines: [{ f: 'q', j: 'MP 1, 2' }] })
     Lines are numbered after the premises (premise k is line k). Returns { ok, done, lines: [{ n, f, j, depth, ok, msg }],
     open: depth at the end }. ok: every line is correct; done: also ends at depth 0 with the conclusion. */
  function checkProof(P) {
    var prem = (P.premises || []).map(function (s) { return { src: s, j: 'Pr' }; });
    var all = prem.concat(P.lines || []), out = [], stack = [], eiNames = {}, concl = null;
    try { concl = P.conclusion ? parse(P.conclusion) : null; } catch (e) { }
    var used = {}; // names in premises and conclusion
    if (concl) names(concl).forEach(function (n) { used[n] = 1; });
    all.forEach(function (L, idx) {
      var n = idx + 1, row = { n: n, f: null, j: null, depth: stack.length, ok: false, msg: '' }; out.push(row);
      var f; try { f = parse(L.f !== undefined ? L.f : L.src); row.f = f; } catch (e) { row.msg = 'Line ' + n + ' is not a well-formed formula: ' + e.message; return; }
      var j = typeof L.j === 'object' && L.j ? L.j : parseJust(L.j);
      row.j = j;
      function fail(m) { row.msg = m; }
      function scopeOf(i) { return out[i - 1] ? out[i - 1].scope : null; }
      function accessible(i) { // line i is earlier and not inside a closed subproof
        if (!(i >= 1 && i < n)) return false;
        var s = out[i - 1].scope || []; // the stack of open assumption line numbers when line i was written
        for (var k = 0; k < s.length; k++) if (stack.indexOf(s[k]) < 0) return false;
        return true;
      }
      row.scope = stack.slice();
      if (!j) return fail('Line ' + n + ' needs a justification.');
      if (j.bad) return fail('"' + j.rule + '" is not a rule of this system.');
      if (j.rule === 'Pr') {
        if (idx >= prem.length) return fail('Only the given premises can be written as premises.');
        names(f).forEach(function (x) { used[x] = 1; });
        row.ok = true; return;
      }
      if (j.rule === 'ACP' || j.rule === 'AIP') { stack.push(n); row.depth = stack.length; row.scope = stack.slice(); row.assume = j.rule; row.ok = true; return; }
      if (j.rule === 'CP' || j.rule === 'IP') {
        if (!j.range) return fail(j.rule + ' cites a whole subproof, like "' + j.rule + ' 3–5".');
        var a = j.lines[0], b = j.lines[1], top = stack[stack.length - 1];
        if (!top) return fail('There is no open subproof to close.');
        if (a !== top) return fail('The innermost open subproof starts at line ' + top + ', so ' + j.rule + ' must cite ' + top + '–' + (n - 1) + '.');
        if (b !== n - 1) return fail(j.rule + ' must close the subproof with the line just before it (' + top + '–' + (n - 1) + ').');
        var A = out[a - 1].f, Bf = out[b - 1].f;
        if (!A || !Bf) return fail('The subproof has a line that is not well formed.');
        if (out[a - 1].assume !== (j.rule === 'CP' ? 'ACP' : 'AIP') && out[a - 1].assume) { /* ACP closed by IP or the reverse: allowed, but say which */ }
        stack.pop(); row.depth = stack.length; row.scope = stack.slice();
        if (j.rule === 'CP') { if (same(f, { t: 'imp', a: A, b: Bf })) row.ok = true; else fail('CP gives the assumption → the last line: ' + show({ t: 'imp', a: A, b: Bf }) + '.'); return; }
        var contra = Bf.t === 'and' && ((Bf.b.t === 'not' && same(Bf.b.a, Bf.a)) || (Bf.a.t === 'not' && same(Bf.a.a, Bf.b)));
        if (!contra) return fail('IP needs the subproof to end in a contradiction, a line of the form q ∧ ¬q.');
        if (same(f, { t: 'not', a: A }) || (A.t === 'not' && same(f, A.a))) row.ok = true;
        else fail('IP gives the negation of the assumption: ' + (A.t === 'not' ? show(A.a) : show({ t: 'not', a: A })) + '.');
        return;
      }
      var need = NCITE[j.rule];
      if (j.rule === 'Id') need = j.lines.length;
      if (need !== undefined && j.lines.length !== need) return fail(j.rule + ' cites ' + need + ' line' + (need === 1 ? '' : 's') + '.');
      for (var c = 0; c < j.lines.length; c++) {
        var ln = j.lines[c];
        if (ln >= n) return fail('A line can only cite earlier lines.');
        if (!accessible(ln)) return fail('Line ' + ln + ' is inside a closed subproof, so it can no longer be cited.');
        if (!out[ln - 1].f) return fail('Line ' + ln + ' is not well formed.');
      }
      var cited = j.lines.map(function (x) { return out[x - 1].f; });
      if (INF[j.rule]) { if (infOk(j.rule, cited, f)) row.ok = true; else fail('This line does not follow from line' + (cited.length > 1 ? 's ' : ' ') + j.lines.join(' and ') + ' by ' + j.rule + '. Rules of inference use whole lines.'); return; }
      if (REP[j.rule] || j.rule === 'QN') { if (repOk(j.rule, cited[0], f)) row.ok = true; else fail('This line is not line ' + j.lines[0] + ' with one part replaced by ' + j.rule + '.'); return; }
      var C = cited[0];
      if (j.rule === 'UI' || j.rule === 'EI') {
        if (C.t !== (j.rule === 'UI' ? 'all' : 'some')) return fail(j.rule + ' needs a line whose main connective is ' + (j.rule === 'UI' ? '∀' : '∃') + '.');
        var r1 = instOf(C.a, C.v, f, false);
        if (!r1) return fail('This line is not line ' + j.lines[0] + ' with its quantifier removed and one letter put for ' + C.v + ' everywhere.');
        if (j.rule === 'EI') {
          var t = r1.term === null ? null : r1.term;
          if (t === null) { row.ok = true; return; }
          if (isVar(t)) return fail('EI needs a name (a, b, c, …), not a variable.');
          var earlier = {}; for (var e = 0; e < idx; e++) if (out[e].f) names(out[e].f).forEach(function (x) { earlier[x] = 1; });
          if (earlier[t] || used[t]) return fail('EI needs a new name: ' + t + ' is already used in an earlier line or in the conclusion.');
          eiNames[t] = 1; row.ei = t;
        }
        row.ok = true; return;
      }
      if (j.rule === 'EG' || j.rule === 'UG') {
        if (f.t !== (j.rule === 'EG' ? 'some' : 'all')) return fail(j.rule + ' gives a line whose main connective is ' + (j.rule === 'EG' ? '∃' : '∀') + '.');
        var r2 = instOf(f.a, f.v, C, j.rule === 'UG');
        if (!r2) return fail('Line ' + j.lines[0] + ' is not this line\'s formula with its quantifier removed.');
        if (j.rule === 'UG') {
          var y = r2.term === null ? f.v : r2.term;
          if (!isVar(y)) return fail('UG can generalize only a variable (x, y, z…), never a name like ' + y + '.');
          for (var s = 0; s < stack.length; s++) if (out[stack[s] - 1].f && freeVars(out[stack[s] - 1].f).indexOf(y) >= 0) return fail('UG cannot generalize ' + y + ' inside a subproof whose assumption has ' + y + ' free.');
          for (var e2 = 0; e2 < idx; e2++) if (out[e2].ei !== undefined && out[e2].f && freeVars(out[e2].f).indexOf(y) >= 0 && accessible(e2 + 1)) return fail('UG cannot generalize ' + y + ', which is free in a line made by EI.');
        }
        row.ok = true; return;
      }
      if (j.rule === 'Id') {
        if (j.lines.length === 0) { if (f.t === 'eq' && f.a === f.b) row.ok = true; else fail('Id with no cited line gives only a line like a = a.'); return; }
        if (j.lines.length === 1) { if (C.t === 'eq' && f.t === 'eq' && C.a === f.b && C.b === f.a) row.ok = true; else fail('Id from one line turns a = b into b = a.'); return; }
        var eqs = cited.filter(function (x) { return x.t === 'eq'; });
        var okId = [[0, 1], [1, 0]].some(function (o) {
          var E = cited[o[1]], F = cited[o[0]]; if (E.t !== 'eq') return false;
          return [[E.a, E.b], [E.b, E.a]].some(function (ab) { return substOk(F, f, ab[0], ab[1]); });
        });
        if (eqs.length && okId) row.ok = true; else fail('Id from two lines puts one name for the other, using a line like a = b.');
        return;
      }
      fail('"' + j.rule + '" is not a rule of this system.');
    });
    function substOk(F, G, a, b) { // G is F with some occurrences of name a replaced by b (at least one change, or F = G)
      var ok = true;
      (function go(g, h) {
        if (!ok) return; if (g.t !== h.t) { ok = false; return; }
        function term(x, y) { if (x !== y && !(x === a && y === b)) ok = false; }
        if (g.t === 'pred') { if (g.p !== h.p || g.args.length !== h.args.length) { ok = false; return; } g.args.forEach(function (x, i) { term(x, h.args[i]); }); }
        else if (g.t === 'eq') { term(g.a, h.a); term(g.b, h.b); }
        else if (g.t === 'atom') { if (g.p !== h.p) ok = false; }
        else if (g.t === 'all' || g.t === 'some') { if (g.v !== h.v) ok = false; else go(g.a, h.a); }
        else kids(g).forEach(function (k, i) { go(k, kids(h)[i]); });
      })(F, G);
      return ok;
    }
    var allOk = out.every(function (r) { return r.ok; }), last = out[out.length - 1];
    var done = allOk && !stack.length && !!last && !!concl && !!last.f && same(last.f, concl) && last.depth === 0;
    return { ok: allOk, done: done, open: stack.length, lines: out.map(function (r) { return { n: r.n, f: r.f ? show(r.f) : null, j: showJust(r.j), depth: r.depth, ok: r.ok, msg: r.msg, assume: r.assume || null }; }) };
  }
  // which rules justify a line (for "choose the rule" problems): every rule of the system that checks out with these cited lines
  function rulesFor(cited, res) {
    cited = cited.map(parse); res = parse(res);
    var out = [];
    Object.keys(INF).forEach(function (r) { if (INF[r][0][0].length === cited.length && infOk(r, cited, res)) out.push(r); });
    if (cited.length === 1) Object.keys(REP).concat(['QN']).forEach(function (r) { if (repOk(r, cited[0], res)) out.push(r); });
    return out;
  }

  // ---------- categorical logic ----------
  var CAT = { A: { q: 'All', neg: false, uni: true }, E: { q: 'No', neg: true, uni: true }, I: { q: 'Some', neg: false, uni: false }, O: { q: 'Some', neg: true, uni: false } };
  function catText(form, s, p) { return form === 'A' ? 'All ' + s + ' are ' + p : form === 'E' ? 'No ' + s + ' are ' + p : form === 'I' ? 'Some ' + s + ' are ' + p : 'Some ' + s + ' are not ' + p; }
  function parseCat(t) {
    if (t && typeof t === 'object') return t;
    var m = /^\s*(all|every|no|some)\s+(.+?)\s+(?:are|is)\s+(not\s+)?(.+?)\s*\.?\s*$/i.exec(String(t));
    if (!m) return null;
    var q = m[1].toLowerCase(), neg = !!m[3], f = q === 'no' ? 'E' : q === 'some' ? (neg ? 'O' : 'I') : (neg ? null : 'A');
    if (!f || (q === 'no' && neg)) return null;
    return { f: f, s: m[2].trim(), p: m[4].trim() };
  }
  function distributed(form) { return { s: form === 'A' || form === 'E', p: form === 'E' || form === 'O' }; }
  // Venn regions: bit 1 = first circle, 2 = second, 4 = third; terms[i] names circle i
  function member(term, terms) { // a term or its complement ("non-dogs") -> membership test on region numbers, or null
    var neg = false; term = String(term).trim();
    while (terms.indexOf(term) < 0 && /^non-?\s*/i.test(term)) { term = term.replace(/^non-?\s*/i, ''); neg = !neg; }
    var i = terms.indexOf(term); if (i < 0) return null;
    return function (r) { var b = !!(r & (1 << i)); return neg ? !b : b; };
  }
  function regionsFor(prop, terms) {
    prop = parseCat(prop); var ms = member(prop.s, terms), mp = member(prop.p, terms), n = terms.length, out = [];
    if (!ms || !mp) return null;
    for (var r = 0; r < (1 << n); r++) {
      if (!ms(r)) continue;
      if ((prop.f === 'A' || prop.f === 'O') ? !mp(r) : mp(r)) out.push(r);
    }
    return out; // A, E: regions to shade; I, O: regions where the X may go (region 0 is outside every circle)
  }
  function diagram(props, terms) { // universal premises first, then particular ones; returns { shade: [r], xs: [[r…]], empty: bool }
    props = props.map(parseCat); var shade = {}, xs = [], empty = false;
    props.filter(function (p) { return CAT[p.f].uni; }).forEach(function (p) { regionsFor(p, terms).forEach(function (r) { shade[r] = 1; }); });
    props.filter(function (p) { return !CAT[p.f].uni; }).forEach(function (p) { var c = regionsFor(p, terms).filter(function (r) { return !shade[r]; }); if (!c.length) empty = true; else xs.push(c); });
    return { shade: Object.keys(shade).map(Number).sort(), xs: xs, inconsistent: empty };
  }
  function shows(dg, prop, terms) { // does the diagram already show the proposition?
    prop = parseCat(prop); var rs = regionsFor(prop, terms);
    if (CAT[prop.f].uni) return rs.every(function (r) { return dg.shade.indexOf(r) >= 0; });
    return dg.xs.some(function (x) { return x.every(function (r) { return rs.indexOf(r) >= 0; }); });
  }
  /* syllogism({ major: 'All M are P', minor: 'All S are M', conclusion: 'All S are P' }) (or premises: [a, b] in any order)
     -> { terms: {S, P, M}, major, minor, conclusion, mood, figure, form ('AAA-1'), valid (modern), conditional (term whose
        existence would make it valid, or null), name, broken: [fallacy names] } */
  var NAMES = { 'AAA-1': 'Barbara', 'EAE-1': 'Celarent', 'AII-1': 'Darii', 'EIO-1': 'Ferio', 'EAE-2': 'Cesare', 'AEE-2': 'Camestres', 'EIO-2': 'Festino', 'AOO-2': 'Baroko', 'IAI-3': 'Disamis', 'AII-3': 'Datisi', 'OAO-3': 'Bokardo', 'EIO-3': 'Ferison', 'AEE-4': 'Camenes', 'IAI-4': 'Dimaris', 'EIO-4': 'Fresison',
    'AAI-1': 'Barbari', 'EAO-1': 'Celaront', 'AEO-2': 'Camestros', 'EAO-2': 'Cesaro', 'AAI-3': 'Darapti', 'EAO-3': 'Felapton', 'AEO-4': 'Camenos', 'EAO-4': 'Fesapo', 'AAI-4': 'Bramantip' };
  function syllogism(o) {
    var c = parseCat(o.conclusion), ps = o.premises ? o.premises.map(parseCat) : [parseCat(o.major), parseCat(o.minor)];
    if (!c || ps.some(function (p) { return !p; })) return null;
    var S = c.s, P = c.p, maj = null, min = null;
    ps.forEach(function (p) { if (p.s === P || p.p === P) maj = maj || p; });
    ps.forEach(function (p) { if (p !== maj && (p.s === S || p.p === S)) min = min || p; });
    if (!maj || !min) return { terms: { S: S, P: P, M: null }, error: 'The premises do not use both terms of the conclusion.' };
    var mMaj = maj.s === P ? maj.p : maj.s, mMin = min.s === S ? min.p : min.s;
    var four = mMaj !== mMin, M = mMaj;
    var mood = maj.f + min.f + c.f;
    var fig = four ? 0 : (maj.s === M && min.p === M) ? 1 : (maj.p === M && min.p === M) ? 2 : (maj.s === M && min.s === M) ? 3 : 4;
    var form = mood + '-' + fig, terms = [S, P, M];
    var res = { terms: { S: S, P: P, M: M }, major: maj, minor: min, conclusion: c, mood: mood, figure: fig, form: form, name: NAMES[form] || null, broken: [] };
    if (four) { res.valid = false; res.conditional = null; res.broken = ['four terms']; return res; }
    var dg = diagram([maj, min], terms); res.diagram = dg;
    res.valid = shows(dg, c, terms);
    res.conditional = null;
    if (!res.valid) [S, M, P].some(function (t) { // traditional reading: assume one class has members
      var i = terms.indexOf(t), circ = []; for (var r = 0; r < 8; r++) if ((r & (1 << i)) && dg.shade.indexOf(r) < 0) circ.push(r);
      if (!circ.length) return false;
      var d2 = { shade: dg.shade, xs: dg.xs.concat([circ]) };
      if (shows(d2, c, terms)) { res.conditional = t; return true; } return false;
    });
    // the rules (modern reading)
    var dM = distributed(maj.f), dm = distributed(min.f), dc = distributed(c.f);
    var midDist = (maj.s === M ? dM.s : dM.p) || (min.s === M ? dm.s : dm.p);
    if (!midDist) res.broken.push('undistributed middle');
    if (dc.p && !(maj.s === P ? dM.s : dM.p)) res.broken.push('illicit major');
    if (dc.s && !(min.s === S ? dm.s : dm.p)) res.broken.push('illicit minor');
    var negs = [maj, min].filter(function (p) { return CAT[p.f].neg; }).length;
    if (negs === 2) res.broken.push('exclusive premises');
    if (negs === 1 && !CAT[c.f].neg) res.broken.push('affirmative conclusion from a negative premise');
    if (negs === 0 && CAT[c.f].neg) res.broken.push('negative conclusion from affirmative premises');
    if (CAT[maj.f].uni && CAT[min.f].uni && !CAT[c.f].uni) res.broken.push('existential fallacy');
    return res;
  }
  function fromForm(form, S, P, M) { // 'AII-3' -> { major, minor, conclusion } as text
    S = S || 'S'; P = P || 'P'; M = M || 'M';
    var f = form.charAt(4) | 0, m = form.slice(0, 3).split('');
    var maj = f === 1 || f === 3 ? [M, P] : [P, M], min = f === 1 || f === 2 ? [S, M] : [M, S];
    return { major: catText(m[0], maj[0], maj[1]), minor: catText(m[1], min[0], min[1]), conclusion: catText(m[2], S, P) };
  }
  // the square of opposition: given one corner's value, every corner's value (true, false, or null = undetermined)
  function square(corner, value, boolean) {
    var out = { A: null, E: null, I: null, O: null }, CON = { A: 'O', O: 'A', E: 'I', I: 'E' };
    out[corner] = !!value; out[CON[corner]] = !value;
    if (!boolean) {
      var v = !!value;
      if (corner === 'A' && v) { out.I = true; out.E = false; }
      if (corner === 'E' && v) { out.O = true; out.A = false; }
      if (corner === 'I' && !v) { out.A = false; out.O = true; }
      if (corner === 'O' && !v) { out.E = false; out.I = true; }
      if (corner === 'A' && !v) { /* O true; E, I undetermined */ }
      if (corner === 'I' && v) { /* E false; A, O undetermined */ }
      // fill again from the contradictories just found
      ['A', 'E', 'I', 'O'].forEach(function (k) { if (out[k] !== null && out[CON[k]] === null) out[CON[k]] = !out[k]; });
    }
    return out;
  }
  function complement(t) { t = String(t).trim(); return /^non-/i.test(t) ? t.replace(/^non-/i, '') : 'non-' + t; }
  // immediate inferences: { conversion, obversion, contraposition } of a proposition, with validity on each reading
  function immediate(prop) {
    var p = parseCat(prop), q = p.f;
    var conv = { f: q, s: p.p, p: p.s }, obv = { f: { A: 'E', E: 'A', I: 'O', O: 'I' }[q], s: p.s, p: complement(p.p) }, cp = { f: q, s: complement(p.p), p: complement(p.s) };
    return {
      conversion: { text: catText(conv.f, conv.s, conv.p), valid: q === 'E' || q === 'I', limitation: q === 'A' ? catText('I', p.p, p.s) : q === 'E' ? catText('O', p.p, p.s) : null },
      obversion: { text: catText(obv.f, obv.s, obv.p), valid: true },
      contraposition: { text: catText(cp.f, cp.s, cp.p), valid: q === 'A' || q === 'O', limitation: q === 'E' ? catText('O', complement(p.p), complement(p.s)) : q === 'A' ? null : null }
    };
  }

  var LG = ML.logic = {
    parse: parse, tryParse: tryParse, show: show, key: key, same: same, main: main, letters: letters, subformulas: subformulas, depth: depth,
    evalProp: evalProp, rows: rows, table: table, classify: classify, equivalent: equivalent, validity: validity, consistent: consistent,
    shortTable: shortTable, freeVars: freeVars, names: names, subst: subst, instOf: instOf, evalWorld: evalWorld, witness: witness,
    relProps: relProps, checkProof: checkProof, parseJust: parseJust, showJust: showJust, rulesFor: rulesFor, RULES: RULES,
    INFERENCE: ['MP', 'MT', 'HS', 'DS', 'CD', 'Simp', 'Conj', 'Add'], REPLACEMENT: ['DM', 'Com', 'Assoc', 'Dist', 'DN', 'Trans', 'Impl', 'Equiv', 'Exp', 'Taut'],
    QUANT: ['QN', 'UI', 'EI', 'UG', 'EG'], catText: catText, parseCat: parseCat, distributed: distributed, regionsFor: regionsFor,
    diagram: diagram, shows: shows, syllogism: syllogism, fromForm: fromForm, square: square, complement: complement, immediate: immediate,
    FORM_NAMES: NAMES
  };
  /* =====================================================================================================================
     THE VISUALS (need math/viz/core.js and a document)
     ===================================================================================================================== */
  if (!ML.viz || !D) return;
  var V = ML.viz, M = Math;
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fml(s) { var f = LG.tryParse(s); return f ? LG.show(f) : String(s); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  var uidN = 0; function uid(p) { return 'lgv-' + (p || 'x') + '-' + (++uidN); }
  // the frame every visual shares: class, aria-label, task line, body, controls, readout, caption. quiet = no answer-giving readouts
  function frame(el, o, name, label) {
    el.classList.add('lgv', 'lgv-' + name);
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.task) el.appendChild(h('p', 'lgv-task', o.task));
    F.body = h('div', 'lgv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl lgv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout lgv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }
  function okMark(good) { return '<span class="' + (good ? 'lgv-ok' : 'lgv-bad') + '">' + (good ? '✓' : '✗') + '</span>'; }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  function seeded(str) { var x = 0; for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(key), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  // overlay arrows between HTML boxes: draws into an absolutely positioned SVG that covers `host`
  function overlay(host) {
    var s = sv('svg', { class: 'lgv-over', 'aria-hidden': 'true', focusable: 'false' }); host.appendChild(s);
    var defs = sv('defs', null, s);
    var id = uid('ah'), id2 = uid('ah');
    var m = sv('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0 0L10 5L0 10z', class: 'lgv-ahead' }, m);
    var m2 = sv('marker', { id: id2, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0 0L10 5L0 10z', class: 'lgv-ahead bad' }, m2);
    return { svg: s, clear: function () { while (s.childNodes.length > 1) s.removeChild(s.lastChild); }, marker: id, markerBad: id2 };
  }
  function rectIn(e, host) { var a = e.getBoundingClientRect(), b = host.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
  function onResize(e, fn) { if ('ResizeObserver' in W) { var last = -1; new ResizeObserver(function () { var w = e.clientWidth; if (w !== last) { last = w; fn(); } }).observe(e); } else W.addEventListener('resize', fn); }
  // a symbol keypad for formula inputs (inserts at the caret of the last focused input in `scope`)
  function keypad(parent, scope, extra) {
    var k = h('div', 'lgv-keys'); k.setAttribute('role', 'group'); k.setAttribute('aria-label', 'Logic symbols');
    var last = null;
    scope.addEventListener('focusin', function (e) { if (e.target.tagName === 'INPUT' && e.target.dataset.f) last = e.target; });
    ['¬', '∧', '∨', '→', '↔'].concat(extra || []).concat(['(', ')']).forEach(function (s) {
      var b = btn(k, s, null, 'lgv-key'); b.setAttribute('aria-label', { '¬': 'not', '∧': 'and', '∨': 'or', '→': 'if then', '↔': 'if and only if', '∀': 'for all', '∃': 'there is', '=': 'equals', '≠': 'not equal', '(': 'open parenthesis', ')': 'close parenthesis' }[s] || s);
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        var t = last || scope.querySelector('input[data-f]'); if (!t) return;
        var a = t.selectionStart == null ? t.value.length : t.selectionStart, z = t.selectionEnd == null ? a : t.selectionEnd;
        t.value = t.value.slice(0, a) + s + t.value.slice(z); t.focus(); try { t.setSelectionRange(a + s.length, a + s.length); } catch (e) { }
        t.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    parent.appendChild(k); return k;
  }
  function tidyInput(inp) { // ASCII to symbols as you type: -> → , <-> ↔ , ~ ¬ , & ∧ , | ∨
    inp.addEventListener('input', function () {
      var v = inp.value, n = v.replace(/<->/g, '↔').replace(/->/g, '→').replace(/~/g, '¬').replace(/&/g, '∧').replace(/\|/g, '∨');
      if (n !== v) { var c = inp.selectionStart - (v.length - n.length); inp.value = n; try { inp.setSelectionRange(c, c); } catch (e) { } }
    });
  }
  /* ---------- lg-sort: a card sorter ---------- */
  V.register('lg-sort', function (el, o) {
    var F = frame(el, o, 'sort', 'Sort the cards into groups');
    var bins = o.bins || ['Yes', 'No'], cards = (o.cards || []).map(function (c, i) { return typeof c === 'string' ? { text: c, i: i } : Object.assign({ i: i }, c); });
    if (o.shuffle) cards = shuffle(cards, JSON.stringify(o.cards || []));
    var place = {}, sel = null, checked = false;
    cards.forEach(function (c) { place[c.i] = c.start === undefined ? -1 : c.start; });
    if (F.interactive) F.body.appendChild(h('p', 'lgv-hint', 'Tap a card, then tap a group. With a keyboard, focus a card and press a group\'s number (0 puts it back).'));
    var pool = h('div', 'lgv-pool'); pool.setAttribute('aria-label', 'Cards not yet sorted'); F.body.appendChild(pool);
    var grid = h('div', 'lgv-bins'); grid.style.setProperty('--cols', o.columns || M.min(bins.length, 3)); F.body.appendChild(grid);
    var binEls = bins.map(function (b, bi) {
      var d = h('div', 'lgv-bin'); d.setAttribute('role', 'group'); d.setAttribute('aria-label', b);
      d.appendChild(h('p', 'lgv-binlab', (F.interactive ? '<span class="lgv-n">' + (bi + 1) + '</span>' : '') + esc(b)));
      var list = h('div', 'lgv-binlist'); d.appendChild(list); d._list = list;
      d.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.lgv-card')) move(sel, bi); });
      grid.appendChild(d); return d;
    });
    pool.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.lgv-card')) move(sel, -1); });
    var cardEls = {};
    cards.forEach(function (c) {
      var b = h('button', 'lgv-card', esc(c.text)); b.type = 'button'; b.dataset.i = c.i;
      if (!F.interactive) b.disabled = true;
      b.addEventListener('click', function () { if (sel === c.i) { sel = null; } else sel = c.i; paint(); });
      b.addEventListener('keydown', function (e) { var k = parseInt(e.key, 10); if (!isNaN(k) && k <= bins.length) { e.preventDefault(); move(c.i, k - 1); b.focus(); } else if (e.key === 'Escape') { sel = null; paint(); } });
      cardEls[c.i] = b;
    });
    function move(i, bi) { place[i] = bi; sel = null; checked = false; paint(); F.say(''); }
    function paint() {
      cards.forEach(function (c) { var b = cardEls[c.i], p = place[c.i]; (p < 0 ? pool : binEls[p]._list).appendChild(b); b.setAttribute('aria-pressed', String(sel === c.i)); b.classList.remove('ok', 'no'); b.removeAttribute('title'); if (checked && p >= 0 && c.bin !== undefined) { b.classList.add(p === c.bin ? 'ok' : 'no'); } b.setAttribute('aria-label', c.text + (p >= 0 ? ', in ' + bins[p] : ', not sorted') + (checked && p >= 0 && c.bin !== undefined ? (p === c.bin ? ', right' : ', not right') : '')); });
      pool.classList.toggle('empty', !cards.some(function (c) { return place[c.i] < 0; }));
      binEls.forEach(function (d) { d.classList.toggle('target', sel !== null); });
      pool.classList.toggle('target', sel !== null && place[sel] >= 0);
    }
    var canCheck = F.interactive && !F.quiet && o.check !== false && cards.some(function (c) { return c.bin !== undefined; });
    if (canCheck) {
      btn(F.ctl, 'Check', function () {
        var left = cards.filter(function (c) { return place[c.i] < 0; }).length;
        if (left) { F.say('Sort every card first (' + plural(left, 'card') + ' left).'); return; }
        checked = true; paint();
        var wrong = cards.filter(function (c) { return place[c.i] !== c.bin; });
        F.say(wrong.length ? okMark(false) + ' ' + (cards.length - wrong.length) + ' of ' + cards.length + ' are right. ' + wrong.filter(function (c) { return c.why; }).slice(0, 2).map(function (c) { return '<br><b>' + esc(c.text) + '</b>: ' + c.why; }).join('') : okMark(true) + ' All ' + cards.length + ' are in the right groups.');
      }, 'pri');
      btn(F.ctl, 'Start over', function () { cards.forEach(function (c) { place[c.i] = -1; }); checked = false; sel = null; paint(); F.say(''); });
      if (o.reveal) btn(F.ctl, 'Show me', function () { cards.forEach(function (c) { place[c.i] = c.bin; }); checked = true; paint(); F.say('Each card is in its group; tap one to move it.'); });
    }
    if (o.solved) cards.forEach(function (c) { place[c.i] = c.bin; });
    paint();
    return { state: function () { var r = {}; cards.forEach(function (c) { r[c.i] = place[c.i]; }); return r; } };
  });
  /* ---------- lg-argmap: argument maps (premises → conclusion), passages with indicator words, and labeling ---------- */
  // indicator words. "so" and "for" count only at the start of a sentence or clause ("…, so we…", "…; for it…"), since
  // "so tired" and "leave for the game" are not indicators. o.indicators may instead list the exact words: [["because", "p"], ["so", "c"]]
  var IND_C = /(^|[.;:!?,]\s+|\b)(therefore|thus|hence|consequently|accordingly|it follows that|which shows that|which means that|we can conclude that|this proves that)\b|(^|[.;:!?,]\s+)(so)\b/gi;
  var IND_P = /(^|\b)(because|since|given that|as shown by|seeing that|after all|for the reason that|inasmuch as)\b|([;,]\s+)(for)\b/gi;
  function markIndicators(t, list) {
    var s = esc(t);
    if (Array.isArray(list)) {
      list.forEach(function (w) { var re = new RegExp('\\b(' + esc(w[0]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'i'); s = s.replace(re, '<mark class="lgv-i' + (w[1] === 'c' ? 'c' : 'p') + '">$1</mark>'); });
      return s;
    }
    return s.replace(IND_C, function (m, a, w, b, w2) { return (w ? a + '<mark class="lgv-ic">' + w : b + '<mark class="lgv-ic">' + w2) + '</mark>'; })
      .replace(IND_P, function (m, a, w, b, w2) { return (w ? a + '<mark class="lgv-ip">' + w : b + '<mark class="lgv-ip">' + w2) + '</mark>'; });
  }
  V.register('lg-argmap', function (el, o) {
    var F = frame(el, o, 'argmap', 'An argument map');
    var mode = o.mode || (o.sentences ? 'label' : 'map');
    if (o.passage) { var ps = h('blockquote', 'lgv-passage', o.indicators && !F.quiet ? markIndicators(o.passage, o.indicators) : esc(o.passage)); F.body.appendChild(ps); if (o.indicators && !F.quiet) F.body.appendChild(h('p', 'lgv-legend', '<mark class="lgv-ic">conclusion indicator</mark> <mark class="lgv-ip">premise indicator</mark>')); }
    if (mode === 'label') return labelMode();
    var nodes = (o.nodes || []).map(function (n, i) { return Object.assign({ id: String(n.id === undefined ? i + 1 : n.id), kind: 'premise' }, n, { id: String(n.id === undefined ? i + 1 : n.id) }); });
    var links = (o.links || []).map(function (l) { return { from: (Array.isArray(l.from) ? l.from : [l.from]).map(String), to: String(l.to), kind: l.kind || 'for' }; });
    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    // levels: a node sits one row above the highest node it supports
    var lev = {}; nodes.forEach(function (n) { lev[n.id] = 0; });
    for (var it = 0; it < nodes.length + 2; it++) links.forEach(function (l) { l.from.forEach(function (f) { if (lev[f] < lev[l.to] + 1) lev[f] = lev[l.to] + 1; }); });
    var maxL = M.max.apply(null, nodes.map(function (n) { return lev[n.id]; }).concat([0]));
    var step = o.steps ? (o.step || 0) : 99, nSteps = maxL + 1;
    var wrap = h('div', 'lgv-map'); F.body.appendChild(wrap);
    var ov = overlay(wrap), boxes = {}, groups = [];
    var KIND = { premise: 'Premise', conclusion: 'Conclusion', sub: 'Intermediate conclusion', unstated: 'Unstated premise', objection: 'Objection', reply: 'Reply' };
    for (var L = maxL; L >= 0; L--) {
      var row = h('div', 'lgv-row'); row.dataset.level = L; wrap.appendChild(row);
      var placed = {};
      // linked premises sit together in one group
      links.forEach(function (l, li) {
        var mine = l.from.filter(function (f) { return lev[f] === L && !placed[f]; });
        if (mine.length < 2 || mine.length !== l.from.length) return;
        var g = h('div', 'lgv-group' + (l.kind === 'against' ? ' against' : '')); g.dataset.link = li; row.appendChild(g);
        mine.forEach(function (f, k) { if (k) g.appendChild(h('span', 'lgv-plus', '+')); g.appendChild(box(byId[f])); placed[f] = 1; });
        groups[li] = g;
      });
      nodes.forEach(function (n) { if (lev[n.id] === L && !placed[n.id]) { row.appendChild(box(n)); placed[n.id] = 1; } });
    }
    function box(n) {
      var b = h('div', 'lgv-node k-' + n.kind); b.dataset.id = n.id;
      var lab = n.tag || (F.quiet ? '' : KIND[n.kind] || '');
      b.innerHTML = '<span class="lgv-num" aria-hidden="true">' + esc(n.id) + '</span><span class="lgv-ntext">' + (lab ? '<small>' + esc(lab) + '</small>' : '') + esc(n.text || '') + '</span>';
      b.setAttribute('role', 'listitem'); boxes[n.id] = b; return b;
    }
    wrap.setAttribute('role', 'list');
    function draw() {
      ov.clear(); var W0 = wrap.clientWidth, H0 = wrap.scrollHeight; ov.svg.setAttribute('width', W0); ov.svg.setAttribute('height', H0); ov.svg.setAttribute('viewBox', '0 0 ' + W0 + ' ' + H0);
      nodes.forEach(function (n) { boxes[n.id].classList.toggle('lgv-hide', lev[n.id] > step); });
      groups.forEach(function (g, li) { if (g) g.classList.toggle('lgv-hide', links[li].from.every(function (f) { return lev[f] > step; })); });
      var inc = {}; // incoming arrows per target, left to right, so each ends at its own point
      links.forEach(function (l, li) { var src = groups[li] || boxes[l.from[0]]; if (!src || (!groups[li] && l.from.length > 1)) return; (inc[l.to] = inc[l.to] || []).push({ li: li, x: rectIn(src, wrap).x }); });
      Object.keys(inc).forEach(function (t) { inc[t].sort(function (a, b) { return a.x - b.x; }); });
      var endX = function (li, to, b) { var arr = inc[to] || [], k = arr.findIndex(function (q) { return q.li === li; }), n = arr.length; return n < 2 ? b.x + b.w / 2 : b.x + b.w * (0.3 + 0.4 * k / (n - 1)); };
      links.forEach(function (l, li) {
        if (l.from.some(function (f) { return lev[f] > step; }) || lev[l.to] > step) return;
        var src = groups[li] || boxes[l.from[0]], dst = boxes[l.to];
        if (!src || !dst) return;
        var a = rectIn(src, wrap), b = rectIn(dst, wrap);
        var x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = endX(li, l.to, b), y2 = b.y - 2;
        if (!groups[li] && l.from.length > 1) return;
        if (M.abs(y2 - y1) < 8) { y1 = a.y + a.h / 2; x1 = a.x + (a.x > b.x ? 0 : a.w); y2 = b.y + b.h / 2; x2 = b.x + (a.x > b.x ? b.w : 0); }
        var bad = l.kind === 'against', my = (y1 + y2) / 2;
        sv('path', { d: 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + my + ' ' + x2 + ' ' + my + ' ' + x2 + ' ' + y2, class: 'lgv-arrow' + (bad ? ' bad' : ''), 'marker-end': 'url(#' + (bad ? ov.markerBad : ov.marker) + ')' }, ov.svg);
        if (bad) { var t = sv('text', { x: (x1 + x2) / 2 + 6, y: my, class: 'lgv-alab' }, ov.svg); t.textContent = 'objects to'; }
      });
      // convergent premises: separate arrows (drawn above); linked: one arrow from the group
      links.forEach(function (l, li) {
        if (groups[li] || l.from.length < 2) return; // linked premises that could not share a row: one arrow each, joined
        l.from.forEach(function (f) { if (lev[f] > step) return; var a = rectIn(boxes[f], wrap), b = rectIn(boxes[l.to], wrap); sv('path', { d: 'M' + (a.x + a.w / 2) + ' ' + (a.y + a.h) + ' L' + (b.x + b.w / 2) + ' ' + (b.y - 2), class: 'lgv-arrow linked', 'marker-end': 'url(#' + ov.marker + ')' }, ov.svg); });
      });
      describe();
    }
    function describe() {
      var parts = [];
      links.forEach(function (l) { var fr = l.from.map(function (f) { return f; }); parts.push((fr.length > 1 ? 'Statements ' + fr.join(' and ') + ' together ' : 'Statement ' + fr[0] + ' ') + (l.kind === 'against' ? 'object to ' : 'support ') + 'statement ' + l.to + '.'); });
      wrap.setAttribute('aria-label', 'Argument map. ' + parts.join(' '));
    }
    if (o.steps && F.interactive) {
      var lab = h('span', 'lgv-steplab');
      var prev = btn(F.ctl, '◀ Back', function () { if (step > 0) { step--; upd(); } }), next = btn(F.ctl, 'Next ▶', function () { if (step < nSteps - 1) { step++; upd(); } }, 'pri');
      F.ctl.appendChild(lab);
      var upd = function () {
        prev.disabled = step === 0; next.disabled = step >= nSteps - 1;
        lab.textContent = step === 0 ? 'Start with the conclusion.' : step >= nSteps - 1 ? 'The whole argument.' : 'Then what supports it, one level up.';
        draw();
      };
      step = M.min(step, nSteps - 1); upd();
    } else { step = 99; }
    if (o.standard) {
      var ol = h('ol', 'lgv-std'); F.body.appendChild(ol);
      var prem = nodes.filter(function (n) { return n.kind !== 'conclusion' && n.kind !== 'objection' && n.kind !== 'reply'; }), concl = nodes.filter(function (n) { return n.kind === 'conclusion'; });
      prem.forEach(function (n, i) { ol.appendChild(h('li', '', '<b>P' + (i + 1) + '.</b> ' + esc(n.text) + (n.kind === 'unstated' ? ' <em>(unstated)</em>' : '') + (n.kind === 'sub' ? ' <em>(also a conclusion)</em>' : ''))); });
      concl.forEach(function (n) { ol.appendChild(h('li', 'lgv-concl', '<b>∴</b> ' + esc(n.text))); });
    }
    if (!F.quiet && o.explain !== false && links.length) {
      var lk = links.filter(function (l) { return l.from.length > 1 && l.kind !== 'against'; }).length, cv = 0, tos = {};
      links.forEach(function (l) { if (l.kind !== 'against') tos[l.to] = (tos[l.to] || 0) + 1; });
      Object.keys(tos).forEach(function (t) { if (tos[t] > 1) cv++; });
      var bits = [];
      if (lk) bits.push('Premises in one box with + are <b>linked</b>: they support the conclusion only together.');
      if (cv) bits.push('Separate arrows into one statement are <b>convergent</b>: each reason works on its own.');
      if (maxL > 1) bits.push('A statement with arrows in and out is an <b>intermediate conclusion</b>.');
      if (bits.length) el.appendChild(h('p', 'ml-cap', bits.join(' ')));
    }
    D.fonts && D.fonts.ready && D.fonts.ready.then(draw);
    onResize(wrap, draw); setTimeout(draw, 0); draw();
    return { redraw: draw };

    function labelMode() {
      var sents = (o.sentences || []).map(function (s) { return typeof s === 'string' ? { text: s } : s; });
      var KINDS = o.kinds || [['premise', 'Premise'], ['conclusion', 'Conclusion'], ['neither', 'Neither']];
      var pick = {}, list = h('ol', 'lgv-label'); F.body.appendChild(list);
      sents.forEach(function (s, i) {
        var li = h('li', 'lgv-lrow'); li.appendChild(h('span', 'lgv-ltext', o.indicators && !F.quiet ? markIndicators(s.text, o.indicators) : esc(s.text)));
        var g = h('div', 'ml-seg lgv-lseg'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Sentence ' + (i + 1));
        KINDS.forEach(function (k) {
          var b = btn(g, k[1], function () { pick[i] = k[0]; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); li.classList.remove('ok', 'no'); F.say(''); });
          b.setAttribute('aria-pressed', 'false'); if (!F.interactive) b.disabled = true;
        });
        li.appendChild(g); list.appendChild(li); s.li = li;
      });
      if (F.interactive && !F.quiet && sents.some(function (s) { return s.kind; })) {
        btn(F.ctl, 'Check', function () {
          var left = sents.filter(function (s, i) { return !pick[i]; }).length;
          if (left) { F.say('Label every sentence first (' + plural(left, 'sentence') + ' left).'); return; }
          var right = 0; sents.forEach(function (s, i) { var g = pick[i] === s.kind; s.li.classList.toggle('ok', g); s.li.classList.toggle('no', !g); if (g) right++; });
          F.say(right === sents.length ? okMark(true) + ' All right.' : okMark(false) + ' ' + right + ' of ' + sents.length + ' are right. Find the conclusion first: what is the passage trying to get you to believe?');
        }, 'pri');
      }
      return { picks: function () { return pick; } };
    }
  });
  /* ---------- lg-fallacy: a short passage or dialogue with the faulty step highlighted (or found by the learner) ---------- */
  V.register('lg-fallacy', function (el, o) {
    var F = frame(el, o, 'fallacy', 'A passage with a faulty step');
    var sents = (o.sentences || []).map(function (s) { return typeof s === 'string' ? { text: s } : s; });
    var fault = [].concat(o.fault === undefined ? [] : o.fault).map(Number);
    var mode = o.mode || 'show', shown = mode === 'show' && !o.reveal && !F.quiet, picked = {};
    var box = h('div', 'lgv-fpass' + (sents.some(function (s) { return s.who; }) ? ' dialog' : '')); F.body.appendChild(box);
    var rows = sents.map(function (s, i) {
      var r = h(mode === 'find' && F.interactive && !F.quiet ? 'button' : 'div', 'lgv-fs');
      if (r.tagName === 'BUTTON') { r.type = 'button'; r.setAttribute('aria-pressed', 'false'); }
      var txt = esc(s.text);
      (s.phrases || []).forEach(function (p) { txt = txt.replace(esc(p), '<span class="lgv-phrase">' + esc(p) + '</span>'); });
      r.innerHTML = (o.numbers !== false ? '<span class="lgv-fn" aria-hidden="true">' + (i + 1) + '</span>' : '') + (s.who ? '<b class="lgv-who">' + esc(s.who) + ':</b> ' : '') + '<span class="lgv-ft">' + txt + '</span>';
      if (o.numbers !== false) r.setAttribute('aria-label', (s.who ? s.who + ' says: ' : 'Sentence ' + (i + 1) + ': ') + s.text);
      if (r.tagName === 'BUTTON') r.addEventListener('click', function () { picked[i] = !picked[i]; r.setAttribute('aria-pressed', String(!!picked[i])); rows.forEach(function (x) { x.classList.remove('ok', 'no', 'missed'); }); F.say(''); });
      box.appendChild(r); return r;
    });
    var note = h('div', 'lgv-fnote'); note.hidden = true; F.body.appendChild(note);
    function reveal() {
      shown = true;
      rows.forEach(function (r, i) { r.classList.toggle('fault', fault.indexOf(i) >= 0); });
      if (o.name || o.note) { note.innerHTML = (o.name ? '<p class="lgv-fname"><span aria-hidden="true">⚠️</span> ' + esc(o.name) + '</p>' : '') + (o.note ? '<p>' + o.note + '</p>' : ''); note.hidden = false; }
      if (o.fix) note.innerHTML += '<p class="lgv-ffix"><b>A better way to put it:</b> ' + o.fix + '</p>';
    }
    if (F.quiet) { /* only the passage: no highlight, no name */ }
    else if (mode === 'find' && F.interactive) {
      if (fault.length) {
        F.body.insertBefore(h('p', 'lgv-hint', 'Tap the sentence' + (fault.length > 1 ? 's' : '') + ' where the reasoning goes wrong, then press Check.'), box);
        btn(F.ctl, 'Check', function () {
          var sel = Object.keys(picked).filter(function (k) { return picked[k]; }).map(Number);
          if (!sel.length) { F.say('Tap a sentence first.'); return; }
          var right = sel.filter(function (i) { return fault.indexOf(i) >= 0; }), wrong = sel.filter(function (i) { return fault.indexOf(i) < 0; });
          rows.forEach(function (r, i) { r.classList.toggle('ok', right.indexOf(i) >= 0); r.classList.toggle('no', wrong.indexOf(i) >= 0); });
          if (!wrong.length && right.length === fault.length) { F.say(okMark(true) + ' Yes, that is the faulty step.'); reveal(); }
          else F.say(okMark(false) + (wrong.length ? ' Sentence ' + wrong.map(function (i) { return i + 1; }).join(' and ') + (wrong.length > 1 ? ' are' : ' is') + ' not where it goes wrong.' : ' There is more than one faulty step.') + ' Ask which sentence the conclusion leans on that does not hold up.');
        }, 'pri');
        btn(F.ctl, 'Show me', function () { reveal(); F.say(''); });
      }
    } else if (o.reveal && F.interactive) { var rb = btn(F.ctl, 'Show the faulty step', function () { reveal(); rb.disabled = true; }, 'pri'); }
    else if (shown) reveal();
    return { reveal: reveal };
  });
  /* ---------- lg-venn3: two- and three-circle Venn diagrams for categorical propositions and syllogisms ---------- */
  var VG = { // geometry in SVG units
    3: { r: 78, c: [[112, 106], [204, 106], [158, 186]], box: [14, 2, 290, 290], lab: [[36, 19, 'start'], [280, 19, 'end'], [158, 285, 'middle']] },
    2: { r: 82, c: [[118, 112], [210, 112]], box: [14, 2, 300, 212], lab: [[38, 19, 'start'], [290, 19, 'end']] }
  };
  function vennGeo(n) {
    var G = VG[n]; if (G.pts) return G;
    var inside = function (x, y) { var r = 0; G.c.forEach(function (c, i) { if (M.hypot(x - c[0], y - c[1]) < G.r) r |= 1 << i; }); return r; };
    var bd = function (x, y) { return M.min.apply(null, G.c.map(function (c) { return M.abs(M.hypot(x - c[0], y - c[1]) - G.r); })); };
    var best = {}, bx = G.box;
    for (var x = bx[0] + 4; x < bx[0] + bx[2]; x += 2) for (var y = bx[1] + 4; y < bx[1] + bx[3]; y += 2) {
      var r = inside(x, y), d = M.min(bd(x, y), r === 0 ? M.min(x - bx[0], bx[0] + bx[2] - x, y - bx[1], bx[1] + bx[3] - y) : 1e9);
      if (!best[r] || d > best[r][2]) best[r] = [x, y, d];
    }
    G.pts = best; G.inside = inside; G.line = {};
    // the best point on the boundary between two regions that differ in one circle
    for (var k = 0; k < n; k++) for (var t = 0; t < 720; t++) {
      var a = t * M.PI / 360, px = G.c[k][0] + G.r * M.cos(a), py = G.c[k][1] + G.r * M.sin(a);
      var rin = inside(G.c[k][0] + (G.r - 4) * M.cos(a), G.c[k][1] + (G.r - 4) * M.sin(a)), rout = inside(G.c[k][0] + (G.r + 4) * M.cos(a), G.c[k][1] + (G.r + 4) * M.sin(a));
      if ((rin ^ rout) !== (1 << k)) continue;
      var others = G.c.filter(function (c, i) { return i !== k; }).map(function (c) { return M.abs(M.hypot(px - c[0], py - c[1]) - G.r); });
      var sc = others.length ? M.min.apply(null, others) : 50, key = M.min(rin, rout) + '-' + M.max(rin, rout);
      if (!G.line[key] || sc > G.line[key][2]) G.line[key] = [px, py, sc];
    }
    return G;
  }
  var REGION_NO = { 3: { 1: 1, 3: 2, 2: 3, 5: 4, 7: 5, 6: 6, 4: 7, 0: 8 }, 2: { 1: 1, 3: 2, 2: 3, 0: 4 } };
  function regionWords(r, names) { var ins = [], outs = []; names.forEach(function (t, i) { (r & (1 << i) ? ins : outs).push(t); }); return (ins.length ? 'in ' + ins.join(' and ') : 'outside every circle') + (ins.length && outs.length ? ', not ' + outs.join(' or ') : ''); }
  V.register('lg-venn3', function (el, o) {
    var terms = (o.terms || (o.circles === 2 ? ['S', 'P'] : ['S', 'P', 'M'])).slice(0, 3);
    var n = o.circles || terms.length; terms = terms.slice(0, n);
    var F = frame(el, o, 'venn', n === 3 ? 'A three-circle Venn diagram' : 'A two-circle Venn diagram');
    var G = vennGeo(n), roles = n === 3 ? ['S', 'P', 'M'] : ['S', 'P'];
    var mode = o.mode || 'show';
    var props = (o.premises || o.props || []).map(LG.parseCat).filter(Boolean);
    var concl = o.conclusion ? LG.parseCat(o.conclusion) : null;
    var compare = n === 2 && props.length === 2 && !o.premises;
    var expect = o.shade || o.xs ? { shade: o.shade || [], xs: o.xs || [] } : LG.diagram(compare ? [props[0]] : props, terms);
    var order = props.filter(function (p) { return p.f === 'A' || p.f === 'E'; }).concat(props.filter(function (p) { return p.f === 'I' || p.f === 'O'; }));
    var step = o.steps ? (o.step || 0) : order.length, assume = o.assume || null;
    var st = mode === 'draw' ? { shade: {}, xs: [] } : null, tool = 'shade', focusR = null;
    var colorOf = ['s', 'p', 'm'];
    // statements above the diagram
    if (o.list !== false && (props.length || concl)) {
      var ul = h('ul', 'lgv-vlist'); F.body.appendChild(ul);
      props.forEach(function (p, i) { ul.appendChild(h('li', '', (compare ? '<b>' + (i ? 'Second' : 'First') + ':</b> ' : props.length > 1 ? '<b>Premise ' + (i + 1) + ':</b> ' : '') + esc(LG.catText(p.f, p.s, p.p)))); });
      if (concl) ul.appendChild(h('li', 'lgv-concl', '<b>∴</b> ' + esc(LG.catText(concl.f, concl.s, concl.p))));
    }
    var row = h('div', 'lgv-vrow'); F.body.appendChild(row);
    var pics = [makePic(0)]; if (compare) pics.push(makePic(1));
    function makePic(which) {
      var box = G.box, s = sv('svg', { viewBox: box.join(' '), class: 'lgv-vsvg', role: 'img' }); row.appendChild(s);
      var defs = sv('defs', null, s), pid = uid('v');
      var hat = sv('pattern', { id: pid + 'h', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs); sv('rect', { width: 3, height: 8, class: 'lgv-look' }, hat);
      G.c.forEach(function (c, i) { var cp = sv('clipPath', { id: pid + 'c' + i }, defs); sv('circle', { cx: c[0], cy: c[1], r: G.r }, cp); });
      var regs = {};
      for (var r = 0; r < (1 << n); r++) {
        var mk = sv('mask', { id: pid + 'm' + r, maskUnits: 'userSpaceOnUse', x: box[0], y: box[1], width: box[2], height: box[3] }, defs);
        sv('rect', { x: box[0], y: box[1], width: box[2], height: box[3], fill: '#fff' }, mk);
        G.c.forEach(function (c, i) { if (!(r & (1 << i))) sv('circle', { cx: c[0], cy: c[1], r: G.r, fill: '#000' }, mk); });
        var g = sv('g', { mask: 'url(#' + pid + 'm' + r + ')' }, s), inner = g;
        G.c.forEach(function (c, i) { if (r & (1 << i)) inner = sv('g', { 'clip-path': 'url(#' + pid + 'c' + i + ')' }, inner); });
        var fill = sv('rect', { x: box[0] + 1, y: box[1] + 1, width: box[2] - 2, height: box[3] - 2, class: 'lgv-reg' }, inner);
        var look = sv('rect', { x: box[0] + 1, y: box[1] + 1, width: box[2] - 2, height: box[3] - 2, fill: 'url(#' + pid + 'h)', class: 'lgv-lookfill' }, inner); look.style.display = 'none';
        regs[r] = { fill: fill, look: look };
      }
      sv('rect', { x: box[0] + 0.5, y: box[1] + 0.5, width: box[2] - 1, height: box[3] - 1, rx: 8, class: 'lgv-universe' }, s);
      G.c.forEach(function (c, i) { sv('circle', { cx: c[0], cy: c[1], r: G.r, class: 'lgv-circ c-' + colorOf[i] }, s); });
      G.lab.forEach(function (l, i) {
        var t = sv('text', { x: l[0], y: l[1], 'text-anchor': l[2], class: 'lgv-vlab c-' + colorOf[i] }, s);
        var nm = terms[i]; t.textContent = nm.length > 16 ? nm.slice(0, 15) + '…' : nm;
        if (o.roles !== false && nm !== roles[i]) { var ts = sv('tspan', { class: 'lgv-role', dx: 3 }, t); ts.textContent = '(' + roles[i] + ')'; }
      });
      var nums = sv('g', { class: 'lgv-nums' }, s); if (o.numbers) Object.keys(REGION_NO[n]).forEach(function (r) { var p = G.pts[r]; if (!p) return; var t = sv('text', { x: p[0], y: p[1] + (r === '0' ? 0 : 14), 'text-anchor': 'middle' }, nums); t.textContent = REGION_NO[n][r]; });
      var xg = sv('g', { class: 'lgv-xs' }, s);
      return { svg: s, regs: regs, xg: xg, which: which };
    }
    function current(which) {
      if (st) return { shade: Object.keys(st.shade).filter(function (k) { return st.shade[k]; }).map(Number), xs: st.xs };
      if (compare) return LG.diagram([props[which]], terms);
      var d = LG.diagram(order.slice(0, step), terms);
      if (o.shade || o.xs) d = { shade: o.shade || [], xs: o.xs || [] };
      if (assume && step >= order.length) { var i = terms.indexOf(assume); if (i < 0) i = roles.indexOf(assume); var c = []; for (var r = 0; r < (1 << n); r++) if ((r & (1 << i)) && d.shade.indexOf(r) < 0) c.push(r); if (c.length === 1 || c.length === 2) d = { shade: d.shade, xs: d.xs.concat([c]), assumed: c }; }
      return d;
    }
    function drawX(g, x, y, cls) { var t = sv('text', { x: x, y: y, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'lgv-x' + (cls ? ' ' + cls : '') }, g); t.textContent = '✕'; }
    function paint() {
      pics.forEach(function (P) {
        var d = current(P.which);
        for (var r in P.regs) { P.regs[r].fill.classList.toggle('on', d.shade.indexOf(+r) >= 0); P.regs[r].fill.classList.toggle('focus', focusR === +r); }
        while (P.xg.firstChild) P.xg.removeChild(P.xg.firstChild);
        d.xs.forEach(function (x) {
          var cls = d.assumed === x ? 'assumed' : '';
          if (x.length === 1) { var p = G.pts[x[0]]; if (p) drawX(P.xg, p[0], p[1], cls); }
          else if (x.length === 2) { var k = G.line[M.min(x[0], x[1]) + '-' + M.max(x[0], x[1])]; if (k) drawX(P.xg, k[0], k[1], 'online ' + cls); }
        });
        var showLook = concl && !F.quiet && (o.look || (mode === 'show' && step >= order.length && o.look !== false));
        var lookR = showLook ? LG.regionsFor(concl, terms) || [] : [];
        for (r in P.regs) P.regs[r].look.style.display = lookR.indexOf(+r) >= 0 ? '' : 'none';
        P.svg.setAttribute('aria-label', describe(d));
      });
      verdict();
    }
    function describe(d) {
      var s = (n === 3 ? 'Three' : 'Two') + ' circles: ' + terms.join(', ') + '. ';
      s += d.shade.length ? 'Shaded (empty): ' + d.shade.map(function (r) { return regionWords(r, terms); }).join('; ') + '. ' : 'Nothing is shaded. ';
      d.xs.forEach(function (x) { s += 'An X ' + (x.length > 1 ? 'on the line between ' + x.map(function (r) { return regionWords(r, terms); }).join(' and ') : regionWords(x[0], terms)) + '. '; });
      return s;
    }
    function verdict() {
      if (F.quiet || st) return;
      if (compare) { var a = LG.diagram([props[0]], terms), b = LG.diagram([props[1]], terms); var same = JSON.stringify(a) === JSON.stringify(b); F.say(same ? '<b>Same diagram:</b> the two statements say exactly the same thing, so each follows from the other.' : '<b>Different diagrams:</b> the two statements do not say the same thing.'); return; }
      if (step < order.length) { var p = order[step]; F.say('Next: ' + esc(LG.catText(p.f, p.s, p.p)) + (p.f === 'A' || p.f === 'E' ? ' (universal: shade).' : ' (particular: an X).')); return; }
      if (!concl || o.verdict === false) { F.say(''); return; }
      var d = current(0), ok = LG.shows(d, concl, terms), uni = concl.f === 'A' || concl.f === 'E';
      if (ok) { F.say(okMark(true) + ' <b>Valid' + (d.assumed ? ' if there are ' + esc(assume) : '') + '.</b> Without drawing anything more, the diagram already shows that ' + esc(LG.catText(concl.f, concl.s, concl.p).replace(/^./, function (c) { return c.toLowerCase(); })) + '.'); return; }
      var msg = okMark(false) + ' <b>Invalid.</b> ' + (uni ? 'The conclusion needs the hatched area shaded, and the premises leave part of it open.' : 'The conclusion needs an X inside the hatched area, and no X is forced to be there' + (d.xs.some(function (x) { return x.length > 1; }) ? ' (an X on a line could be on either side)' : '') + '.');
      if (!assume && n === 3 && props.length === 2) { var sy = LG.syllogism({ premises: props, conclusion: concl }); if (sy && sy.conditional) msg += ' It would be valid if we assumed there are ' + esc(sy.conditional) + ' (the traditional reading).'; }
      F.say(msg);
    }
    // stepping through the premises
    if (o.steps && mode === 'show' && F.interactive && order.length) {
      var prev = btn(F.ctl, '◀ Back', function () { if (step > 0) { step--; upd(); } }), next = btn(F.ctl, 'Next ▶', function () { if (step < order.length) { step++; upd(); } }, 'pri');
      var upd = function () { prev.disabled = step === 0; next.disabled = step >= order.length; paint(); };
      upd();
    }
    if (assume && mode === 'show' && F.interactive && !F.quiet && o.toggleAssume !== false) {
      var on = true, tb = btn(F.ctl, 'Assume there are ' + assume + ': on', function () { on = !on; assume = on ? o.assume : null; tb.textContent = 'Assume there are ' + o.assume + ': ' + (on ? 'on' : 'off'); tb.setAttribute('aria-pressed', String(on)); paint(); });
      tb.setAttribute('aria-pressed', 'true');
    }
    // drawing mode: shade regions and place X marks, then check against the premises
    if (st) {
      var P0 = pics[0], svg = P0.svg;
      if (F.interactive) {
        el.insertBefore(h('p', 'lgv-hint', 'Choose Shade or X, then tap a region. Tap close to a circle\'s edge with X to put the X on the line. Keyboard: Tab to a region, Enter to mark it; with X, press ' + roles.slice(0, n).map(function (r, i) { return i + 1; }).join(', ') + ' to put the X on that circle\'s line.'), F.body);
        V.seg(F.ctl, { label: 'Tool', items: [['shade', 'Shade'], ['x', 'X']], value: 'shade', change: function (v) { tool = v; } });
        btn(F.ctl, 'Clear', function () { st.shade = {}; st.xs = []; paint(); F.say(''); });
        if (!F.quiet && (props.length || o.shade || o.xs)) btn(F.ctl, 'Check', check, 'pri');
        svg.addEventListener('click', function (e) {
          var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; var m = svg.getScreenCTM(); if (!m) return; var q = pt.matrixTransform(m.inverse());
          var near = null, nd = 7;
          if (tool === 'x') G.c.forEach(function (c, i) { var d = M.abs(M.hypot(q.x - c[0], q.y - c[1]) - G.r); if (d < nd) { nd = d; near = i; } });
          var r = G.inside(q.x, q.y);
          if (near !== null) { var a = r | (1 << near), b = r & ~(1 << near); toggleX([M.min(a, b), M.max(a, b)]); }
          else if (tool === 'x') toggleX([r]); else toggleShade(r);
          F.say('');
        });
        // keyboard: one focusable proxy per region
        var kb = h('div', 'lgv-vkeys'); kb.setAttribute('role', 'group'); kb.setAttribute('aria-label', 'Regions');
        Object.keys(REGION_NO[n]).sort(function (a, b) { return REGION_NO[n][a] - REGION_NO[n][b]; }).forEach(function (r) {
          r = +r; var b = h('button', 'lgv-vkey', String(REGION_NO[n][r])); b.type = 'button'; b.setAttribute('aria-label', 'Region ' + REGION_NO[n][r] + ': ' + regionWords(r, terms));
          b.addEventListener('focus', function () { focusR = r; paint(); }); b.addEventListener('blur', function () { focusR = null; paint(); });
          b.addEventListener('click', function () { if (tool === 'x') toggleX([r]); else toggleShade(r); F.say(''); });
          b.addEventListener('keydown', function (e) { var k = parseInt(e.key, 10); if (tool === 'x' && k >= 1 && k <= n) { e.preventDefault(); var a = r | (1 << (k - 1)), c = r & ~(1 << (k - 1)); toggleX([M.min(a, c), M.max(a, c)]); } });
          kb.appendChild(b);
        });
        F.body.appendChild(kb);
      }
    }
    function toggleShade(r) { st.shade[r] = !st.shade[r]; paint(); }
    function toggleX(x) { var k = JSON.stringify(x), i = st.xs.map(JSON.stringify).indexOf(k); if (i >= 0) st.xs.splice(i, 1); else st.xs.push(x); paint(); }
    function check() {
      var me = current(0), want = expect, ws = want.shade.slice().sort(), ms = me.shade.slice().sort();
      var missing = ws.filter(function (r) { return ms.indexOf(r) < 0; }), extra = ms.filter(function (r) { return ws.indexOf(r) < 0; });
      var wx = want.xs.map(function (x) { return JSON.stringify(x.slice().sort()); }), mx = me.xs.map(function (x) { return JSON.stringify(x.slice().sort()); });
      var xMiss = wx.filter(function (x) { return mx.indexOf(x) < 0; }), xExtra = mx.filter(function (x) { return wx.indexOf(x) < 0; });
      if (!missing.length && !extra.length && !xMiss.length && !xExtra.length) { F.say(okMark(true) + ' That is the diagram of ' + (props.length > 1 ? 'the premises' : 'the statement') + '.'); return; }
      var tips = [];
      if (missing.length) tips.push('Shade ' + plural(missing.length, 'more region') + ': what a universal statement says is empty.');
      if (extra.length) tips.push(plural(extra.length, 'shaded region') + ' should stay open.');
      if (xMiss.length || xExtra.length) tips.push(want.xs.some(function (x) { return x.length > 1; }) ? 'Check the X: when a premise allows two regions, the X goes on the line between them.' : 'Check the X: it belongs in the one open region the particular statement points to.');
      F.say(okMark(false) + ' Not yet. ' + tips.join(' '));
    }
    paint();
    return { state: function () { return current(0); }, check: check };
  });
  /* ---------- lg-square: the square of opposition (traditional or modern), with truth values to read or fill ---------- */
  function wrapText(t, max) { var words = String(t).split(/\s+/), lines = [], cur = ''; words.forEach(function (w) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) lines.push(cur); return lines; }
  V.register('lg-square', function (el, o) {
    var F = frame(el, o, 'square', 'The square of opposition');
    var S = o.s || 'S', P = o.p || 'P', boolean = !!o.boolean, mode = o.mode || 'show';
    var given = o.given || {}, gk = Object.keys(given)[0];
    var truth = gk ? LG.square(gk, given[gk], boolean) : null;
    var pos = { A: [76, 84], E: [284, 84], I: [76, 232], O: [284, 232] };
    var s = sv('svg', { viewBox: '0 0 360 306', class: 'lgv-sqsvg', role: 'img' }); F.body.appendChild(s);
    var defs = sv('defs', null, s), mid = uid('sq');
    var mk = sv('marker', { id: mid, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); sv('path', { d: 'M0 0L10 5L0 10z', class: 'lgv-ahead' }, mk);
    var REL = [
      ['contraries', 'A', 'E', boolean ? 'weak' : ''], ['subcontraries', 'I', 'O', boolean ? 'weak' : ''],
      ['contradictories', 'A', 'O', 'strong'], ['contradictories', 'E', 'I', 'strong'],
      ['subalterns', 'A', 'I', boolean ? 'weak' : ''], ['subalterns', 'E', 'O', boolean ? 'weak' : '']
    ];
    var hl = o.highlight || null;
    REL.forEach(function (r) {
      var a = pos[r[1]], b = pos[r[2]], dx = b[0] - a[0], dy = b[1] - a[1], L = M.hypot(dx, dy), ux = dx / L, uy = dy / L, pad = 24;
      var ln = sv('line', { x1: a[0] + ux * pad, y1: a[1] + uy * pad, x2: b[0] - ux * pad, y2: b[1] - uy * pad, class: 'lgv-rel ' + r[3] + (hl && hl !== r[0] ? ' dim' : '') + (hl === r[0] ? ' hl' : '') }, s);
      if (r[0] === 'subalterns' && !boolean) ln.setAttribute('marker-end', 'url(#' + mid + ')');
    });
    if (o.relations !== false) {
      var lab = function (t, x, y, rot, cls) { var e = sv('text', { x: x, y: y, 'text-anchor': 'middle', class: 'lgv-rlab' + (cls ? ' ' + cls : ''), transform: rot ? 'rotate(' + rot + ' ' + x + ' ' + y + ')' : null }, s); e.textContent = t; return e; };
      var dim = function (n) { return (hl && hl !== n ? 'dim' : '') + (boolean && n !== 'contradictories' ? ' weak' : ''); };
      lab('contraries', 180, 78, 0, dim('contraries')); lab('subcontraries', 180, 246, 0, dim('subcontraries'));
      lab('contradictories', 180, 162, 0, 'bg ' + dim('contradictories'));
      lab('subalterns', 58, 158, -90, dim('subalterns')); lab('subalterns', 302, 158, 90, dim('subalterns'));
    }
    if (boolean && o.relations !== false) F.body.appendChild(h('p', 'lgv-sqnote', 'Modern (Boolean) reading: only the contradictory diagonals always hold. The dashed relations can fail when a class is empty.'));
    var pills = {}, fill = {};
    ['A', 'E', 'I', 'O'].forEach(function (k) {
      var p = pos[k], top = k === 'A' || k === 'E', left = k === 'A' || k === 'I';
      var txt = LG.catText(k, S, P), lines = wrapText(txt, 24);
      var g = sv('g', { class: 'lgv-corner' }, s);
      sv('circle', { cx: p[0], cy: p[1], r: 19, class: 'lgv-cbadge' }, g);
      var t = sv('text', { x: p[0], y: p[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'lgv-cletter' }, g); t.textContent = k;
      var tx = sv('text', { x: left ? 10 : 350, y: top ? p[1] - 30 - (lines.length - 1) * 15 : p[1] + 36, 'text-anchor': left ? 'start' : 'end', class: 'lgv-ctext' }, g);
      lines.forEach(function (l, i) { var ts = sv('tspan', { x: left ? 10 : 350, dy: i ? 15 : 0 }, tx); ts.textContent = l; });
      // the truth-value pill, just outside the corner
      var px = p[0] + (left ? -41 : 41), pg = sv('g', { class: 'lgv-pill' }, s);
      var pr = sv('rect', { x: px - 15, y: p[1] - 12, width: 30, height: 24, rx: 12 }, pg); var pt = sv('text', { x: px, y: p[1] + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, pg);
      pills[k] = { g: pg, t: pt, r: pr };
      if (mode === 'fill' && F.interactive && !(k in given)) {
        pg.setAttribute('tabindex', '0'); pg.setAttribute('role', 'button'); pg.classList.add('edit');
        var cyc = function () { fill[k] = fill[k] === undefined ? true : fill[k] === true ? false : fill[k] === false ? null : true; F.say(''); paint(); };
        pg.addEventListener('click', cyc); pg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cyc(); } });
      }
    });
    function val(k) {
      if (k in given) return { v: !!given[k], given: true };
      if (mode === 'fill') return { v: fill[k], mine: true };
      if (truth && !F.quiet) return { v: truth[k] };
      return { v: undefined };
    }
    function paint() {
      var words = [];
      ['A', 'E', 'I', 'O'].forEach(function (k) {
        var x = val(k), P0 = pills[k], v = x.v;
        P0.g.setAttribute('data-v', v === true ? 't' : v === false ? 'f' : v === null ? 'u' : 'blank');
        P0.g.classList.toggle('given', !!x.given);
        P0.t.textContent = v === true ? 'T' : v === false ? 'F' : v === null ? '?' : (mode === 'fill' && !x.given ? '…' : '');
        P0.g.style.display = v === undefined && !(mode === 'fill' && F.interactive) ? 'none' : '';
        if (P0.g.getAttribute('role')) P0.g.setAttribute('aria-label', k + ': ' + (v === true ? 'true' : v === false ? 'false' : v === null ? 'undetermined' : 'not filled in') + '. Press to change.');
        words.push(k + ' (' + LG.catText(k, S, P) + ')' + (v === true ? ' is true' : v === false ? ' is false' : v === null ? ' is undetermined' : ''));
      });
      s.setAttribute('aria-label', (boolean ? 'The modern square of opposition. ' : 'The traditional square of opposition. ') + words.join('; ') + '.');
      if (truth && !F.quiet && mode !== 'fill' && gk) F.say('Given that <b>' + gk + '</b> is ' + (given[gk] ? 'true' : 'false') + ': ' + ['A', 'E', 'I', 'O'].filter(function (k) { return k !== gk; }).map(function (k) { return k + ' is ' + (truth[k] === null ? 'undetermined' : truth[k] ? 'true' : 'false'); }).join(', ') + '.');
    }
    if (mode === 'fill' && F.interactive && gk) {
      F.body.appendChild(h('p', 'lgv-hint', 'Tap each empty pill to cycle T (true), F (false) and ? (undetermined).'));
      if (!F.quiet) btn(F.ctl, 'Check', function () {
        var ks = ['A', 'E', 'I', 'O'].filter(function (k) { return !(k in given); });
        if (ks.some(function (k) { return fill[k] === undefined; })) { F.say('Fill every pill first.'); return; }
        var wrong = ks.filter(function (k) { return fill[k] !== truth[k]; });
        ks.forEach(function (k) { pills[k].g.classList.toggle('ok', wrong.indexOf(k) < 0); pills[k].g.classList.toggle('no', wrong.indexOf(k) >= 0); });
        F.say(wrong.length ? okMark(false) + ' Check ' + wrong.join(' and ') + '. ' + (wrong.some(function (k) { return truth[k] === null; }) ? 'Some corners are tied to the given one only loosely; then the answer is ? (undetermined).' : '') : okMark(true) + ' All right.');
      }, 'pri');
      btn(F.ctl, 'Clear', function () { fill = {}; ['A', 'E', 'I', 'O'].forEach(function (k) { pills[k].g.classList.remove('ok', 'no'); }); paint(); F.say(''); });
    }
    paint();
    return { truth: truth };
  });
  /* ---------- lg-syllogism: a categorical syllogism in standard form: terms, mood, figure, distribution and the rules ---------- */
  var RULE_TEXT = [
    ['undistributed middle', 'The middle term is distributed at least once.'],
    ['illicit major', 'If the major term is distributed in the conclusion, it is distributed in the major premise.'],
    ['illicit minor', 'If the minor term is distributed in the conclusion, it is distributed in the minor premise.'],
    ['exclusive premises', 'At least one premise is affirmative.'],
    ['affirmative conclusion from a negative premise', 'If a premise is negative, the conclusion is negative.'],
    ['negative conclusion from affirmative premises', 'If the conclusion is negative, a premise is negative.'],
    ['existential fallacy', 'If both premises are universal, the conclusion is universal (modern reading).']
  ];
  var FALLACY_NAME = { 'undistributed middle': 'Undistributed middle', 'illicit major': 'Illicit major', 'illicit minor': 'Illicit minor', 'exclusive premises': 'Exclusive premises', 'affirmative conclusion from a negative premise': 'Affirmative conclusion from a negative premise', 'negative conclusion from affirmative premises': 'Negative conclusion from affirmative premises', 'existential fallacy': 'Existential fallacy', 'four terms': 'Four terms' };
  V.register('lg-syllogism', function (el, o) {
    var F = frame(el, o, 'syl', 'A categorical syllogism');
    var input = o.premises ? { premises: o.premises, conclusion: o.conclusion } : { major: o.major, minor: o.minor, conclusion: o.conclusion };
    var props = (o.premises || [o.major, o.minor]).concat(o.conclusion ? [o.conclusion] : []).filter(Boolean);
    var single = props.length === 1;
    var Y = single ? null : LG.syllogism(input);
    var show = o.show || (F.quiet ? [] : single ? ['parts'] : ['terms', 'mood', 'figure']);
    if (F.quiet) show = show.filter(function (s) { return s === 'parts' && single; });
    var has = function (k) { return show.indexOf(k) >= 0; };
    var mode = o.mode || 'show';
    var lines = single ? [LG.parseCat(props[0])] : (o.keep || !Y || Y.error ? props.map(LG.parseCat) : [Y.major, Y.minor, Y.conclusion]);
    var roleOf = function (t) { if (!Y || Y.error) return ''; return t === Y.terms.S ? 's' : t === Y.terms.P ? 'p' : t === Y.terms.M ? 'm' : 'x'; };
    var box = h('div', 'lgv-sylbox'); F.body.appendChild(box);
    var marks = {}, termEls = [];
    lines.forEach(function (p, li) {
      if (!p) return;
      var concl = !single && li === lines.length - 1;
      if (concl) box.appendChild(h('div', 'lgv-sylbar', '<span aria-hidden="true">∴</span>'));
      var row = h('div', 'lgv-sylrow' + (concl ? ' concl' : ''));
      var lab = single ? '' : (o.keep ? (concl ? 'Conclusion' : 'Premise ' + (li + 1)) : ['Major premise', 'Minor premise', 'Conclusion'][li]);
      if (lab && !F.quiet) row.appendChild(h('span', 'lgv-syllab', lab));
      if (has('mood') || has('parts')) row.appendChild(h('span', 'lgv-mood', p.f));
      var sent = h('span', 'lgv-sent');
      var q = p.f === 'A' ? 'All' : p.f === 'E' ? 'No' : 'Some', cop = p.f === 'O' ? 'are not' : 'are';
      var dist = LG.distributed(p.f);
      function term(t, pos) {
        var r = roleOf(t), cls = 'lgv-term' + (has('terms') && r ? ' r-' + r : '') + (has('dist') && dist[pos] ? ' dist' : '');
        var e;
        if (mode === 'dist' && F.interactive) { e = h('button', cls, esc(t)); e.type = 'button'; e.setAttribute('aria-pressed', 'false'); var k = li + pos; e.addEventListener('click', function () { marks[k] = !marks[k]; e.setAttribute('aria-pressed', String(!!marks[k])); e.classList.toggle('dist', !!marks[k]); e.classList.remove('ok', 'no'); F.say(''); }); termEls.push({ e: e, want: dist[pos], k: k }); }
        else e = h('span', cls, esc(t));
        if (has('dist') && dist[pos] && mode !== 'dist') e.setAttribute('title', 'distributed');
        return e;
      }
      var parts = [h('span', 'lgv-q', q), term(p.s, 's'), h('span', 'lgv-cop', cop), term(p.p, 'p')], caps = ['quantifier', 'subject term', 'copula', 'predicate term'];
      parts.forEach(function (e, i) {
        if (i) sent.appendChild(D.createTextNode(' '));
        if (has('parts') && single) { var w = h('span', 'lgv-part'); w.appendChild(e); w.appendChild(h('small', '', caps[i])); sent.appendChild(w); } else sent.appendChild(e);
      });
      row.appendChild(sent);
      box.appendChild(row);
    });
    var side = h('div', 'lgv-sylside'); F.body.appendChild(side);
    if (has('terms') && Y && !Y.error) side.appendChild(h('p', 'lgv-legend', '<span class="lgv-term r-p">' + esc(Y.terms.P) + '</span> major term (P) · <span class="lgv-term r-s">' + esc(Y.terms.S) + '</span> minor term (S)' + (Y.terms.M && Y.figure ? ' · <span class="lgv-term r-m">' + esc(Y.terms.M) + '</span> middle term (M)' : '')));
    if (has('dist') && mode !== 'dist') side.appendChild(h('p', 'lgv-legend', '<span class="lgv-term dist">underlined</span> = distributed (the statement covers every member of that class)'));
    if (has('figure') && Y && Y.figure) {
      var fig = h('div', 'lgv-fig'); side.appendChild(fig);
      var pairs = { 1: [['M', 'P'], ['S', 'M']], 2: [['P', 'M'], ['S', 'M']], 3: [['M', 'P'], ['M', 'S']], 4: [['P', 'M'], ['M', 'S']] };
      fig.innerHTML = '<p class="lgv-figlab">Figure ' + Y.figure + '</p>' + [1, 2, 3, 4].map(function (f) {
        var pr = pairs[f]; return '<div class="lgv-figcell' + (f === Y.figure ? ' on' : '') + '" aria-hidden="' + (f === Y.figure ? 'false' : 'true') + '"><b>' + f + '</b>' + pr.map(function (x) { return '<span>' + x.map(function (t) { return '<i class="r-' + t.toLowerCase() + '">' + t + '</i>'; }).join('–') + '</span>'; }).join('') + '</div>';
      }).join('');
    }
    if (Y && !Y.error && (has('mood') || has('figure') || has('name'))) {
      side.appendChild(h('p', 'lgv-form', (has('mood') ? 'Mood <b>' + Y.mood + '</b>' : '') + (has('figure') && Y.figure ? (has('mood') ? ', figure <b>' + Y.figure + '</b>: <b>' + Y.form + '</b>' : 'Figure <b>' + Y.figure + '</b>') : '') + (has('name') && Y.name ? ' (' + Y.name + ')' : '')));
    }
    if (has('rules') && Y && !Y.error) {
      var ul = h('ul', 'lgv-rules'); side.appendChild(ul);
      if (Y.broken.indexOf('four terms') >= 0) ul.appendChild(h('li', 'no', okMark(false) + ' Exactly three terms, each used twice in the same sense. <b>(Four terms)</b>'));
      else RULE_TEXT.forEach(function (r) { var bad = Y.broken.indexOf(r[0]) >= 0; ul.appendChild(h('li', bad ? 'no' : 'ok', okMark(!bad) + ' ' + r[1] + (bad ? ' <b>(' + FALLACY_NAME[r[0]] + ')</b>' : ''))); });
    }
    if (has('verdict') && Y && !Y.error) F.say(Y.valid ? okMark(true) + ' <b>Valid</b> on the modern reading' + (Y.name ? ': ' + Y.form + ', ' + Y.name : '') + '.' : okMark(false) + ' <b>Invalid</b> on the modern reading' + (Y.broken.length ? ': ' + Y.broken.map(function (b) { return FALLACY_NAME[b].toLowerCase(); }).join(', ') : '') + '.' + (Y.conditional ? ' It is valid on the traditional reading, if there are ' + esc(Y.conditional) + (Y.name ? ' (' + Y.name + ')' : '') + '.' : ''));
    if (Y && Y.error && !F.quiet) F.say(Y.error);
    if (mode === 'dist' && F.interactive) {
      el.insertBefore(h('p', 'lgv-hint', 'Tap every term that is distributed.'), F.body);
      if (!F.quiet) {
        btn(F.ctl, 'Check', function () {
          var wrong = 0; termEls.forEach(function (t) { var good = !!marks[t.k] === t.want; t.e.classList.toggle('ok', good && t.want); t.e.classList.toggle('no', !good); if (!good) wrong++; });
          F.say(wrong ? okMark(false) + ' ' + plural(wrong, 'term') + ' to fix. A distributes its subject; E both terms; I neither; O its predicate.' : okMark(true) + ' All right.');
        }, 'pri');
      }
    }
    var desc = lines.filter(Boolean).map(function (p) { return LG.catText(p.f, p.s, p.p); }).join('. ');
    box.setAttribute('aria-label', (single ? 'Proposition: ' : 'Syllogism: ') + desc + '.' + (Y && !Y.error && has('mood') ? ' Mood ' + Y.mood + (Y.figure ? ', figure ' + Y.figure : '') + '.' : ''));
    box.setAttribute('role', 'group');
    return { syllogism: Y };
  });
  /* ---------- lg-truthtable: truth tables to read, fill and check; validity, equivalence and the short-table method ---------- */
  V.register('lg-truthtable', function (el, o) {
    var F = frame(el, o, 'tt', 'A truth table');
    var T0 = o.tf === '10' ? ['1', '0'] : ['T', 'F'];
    var prem = (o.premises || []).map(LG.parse), concl = o.conclusion ? LG.parse(o.conclusion) : null;
    var main = (o.formulas || []).map(LG.parse);
    var argMode = !!(prem.length || concl);
    var finals = argMode ? prem.concat(concl ? [concl] : []) : main;
    var ls = o.letters || LG.letters(finals);
    // the columns: letters, then (with sub) the parts in build-up order, then the formulas
    var cols = [], seen = {};
    function addCol(f, kind) { var k = LG.key(f); if (seen[k]) { cols[seen[k] - 1].kind = kind === 'part' ? cols[seen[k] - 1].kind : kind; return; } cols.push({ f: f, kind: kind }); seen[k] = cols.length; }
    if (o.sub) finals.forEach(function (f) { LG.subformulas(f).forEach(function (g) { addCol(g, 'part'); }); });
    finals.forEach(function (f, i) { addCol(f, argMode ? (concl && i === finals.length - 1 ? 'concl' : 'prem') : 'main'); });
    var mode = o.mode || 'show';
    var allRows = LG.rows(ls);
    var rowIx = o.rows || (o.values ? [allRows.findIndex(function (v) { return ls.every(function (l) { return !!v[l] === !!o.values[l]; }); })] : allRows.map(function (v, i) { return i; }));
    var fillCols = [];
    if (mode === 'fill') fillCols = o.fill === 'last' ? [cols.length - 1] : Array.isArray(o.fill) ? o.fill : cols.map(function (c, i) { return i; });
    var mine = {}, checked = false;
    // short-table mode: one row whose letter values the learner sets
    var shortVals = {}; ls.forEach(function (l) { shortVals[l] = o.start && l in o.start ? !!o.start[l] : true; });
    var wrap = h('div', 'lgv-ttwrap'); wrap.tabIndex = 0; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'Truth table (scrolls sideways if wide)'); F.body.appendChild(wrap);
    var tbl = h('table', 'lgv-tt'); wrap.appendChild(tbl);
    var thead = h('thead'), tr = h('tr'); thead.appendChild(tr); tbl.appendChild(thead);
    ls.forEach(function (l) { tr.appendChild(h('th', 'lt', esc(l))); });
    cols.forEach(function (c, i) {
      var th = h('th', 'k-' + c.kind + (i === 0 || (cols[i - 1] && cols[i - 1].kind === 'part' && c.kind !== 'part') ? ' sep' : ''), esc(LG.show(c.f)));
      if (argMode && !o.sub && c.kind !== 'part' && !F.quiet) th.title = c.kind === 'concl' ? 'conclusion' : 'premise';
      tr.appendChild(th);
    });
    if (argMode && o.labels !== false) { var tr2 = h('tr', 'lgv-ttroles'); ls.forEach(function () { tr2.appendChild(h('th', 'lt')); }); cols.forEach(function (c) { tr2.appendChild(h('th', 'k-' + c.kind, c.kind === 'prem' ? 'premise' : c.kind === 'concl' ? 'conclusion' : '')); }); thead.appendChild(tr2); }
    var tbody = h('tbody'); tbl.appendChild(tbody);
    var cells = [];
    function rowVals(ri) { return mode === 'short' ? shortVals : allRows[ri]; }
    (mode === 'short' ? [0] : rowIx).forEach(function (ri) {
      var r = h('tr'), crow = { ri: ri, tr: r, letters: [], cols: [] };
      ls.forEach(function (l) {
        var td = h('td', 'lt'), v = rowVals(ri)[l];
        if (mode === 'short' && F.interactive) { var b = h('button', 'lgv-tv', ''); b.type = 'button'; b.addEventListener('click', function () { shortVals[l] = !shortVals[l]; paint(); }); td.appendChild(b); crow.letters.push(b); }
        else td.textContent = v ? T0[0] : T0[1];
        r.appendChild(td);
      });
      cols.forEach(function (c, ci) {
        var td = h('td', 'k-' + c.kind + (ci === 0 || (cols[ci - 1].kind === 'part' && c.kind !== 'part') ? ' sep' : ''));
        if (fillCols.indexOf(ci) >= 0 && F.interactive) {
          var b = h('button', 'lgv-tv blank', '·'); b.type = 'button'; var key = ri + ':' + ci;
          b.addEventListener('click', function () { mine[key] = mine[key] === undefined ? true : mine[key] === true ? false : undefined; checked = false; F.say(''); paint(); });
          b.addEventListener('keydown', function (e) { var k = e.key.toUpperCase(); if (k === T0[0] || k === 'T' || k === '1') { mine[key] = true; paint(); } else if (k === T0[1] || k === 'F' || k === '0') { mine[key] = false; paint(); } else if (k === 'BACKSPACE' || k === 'DELETE') { mine[key] = undefined; paint(); } });
          td.appendChild(b); crow.cols.push({ b: b, key: key, ci: ci });
        } else crow.cols.push({ td: td, ci: ci });
        r.appendChild(td);
      });
      tbody.appendChild(r); cells.push(crow);
    });
    function paint() {
      cells.forEach(function (crow) {
        var v = rowVals(crow.ri), vals = cols.map(function (c) { return LG.evalProp(c.f, v); });
        crow.letters.forEach(function (b, i) { b.textContent = v[ls[i]] ? T0[0] : T0[1]; b.setAttribute('aria-label', ls[i] + ' is ' + (v[ls[i]] ? 'true' : 'false') + '. Press to change.'); });
        crow.cols.forEach(function (x) {
          var truth = vals[x.ci];
          if (x.b) {
            var m = mine[x.key]; x.b.textContent = m === undefined ? '·' : m ? T0[0] : T0[1]; x.b.classList.toggle('blank', m === undefined);
            x.b.classList.toggle('ok', checked && m === truth); x.b.classList.toggle('no', checked && m !== truth);
            x.b.setAttribute('aria-label', 'Row ' + (crow.ri + 1) + ', ' + LG.show(cols[x.ci].f) + ': ' + (m === undefined ? 'empty' : m ? 'true' : 'false') + '. Press T or F.');
          } else {
            var hide = mode === 'short' && F.quiet;
            x.td.textContent = hide ? '' : truth ? T0[0] : T0[1];
            x.td.classList.toggle('f', !truth && !hide);
          }
        });
        // highlights: a counterexample row (all premises true, conclusion false)
        if (argMode && !F.quiet && o.highlight !== false && (mode === 'show' || mode === 'short')) {
          var fv = finals.map(function (f) { return LG.evalProp(f, v); }), pr = fv.slice(0, prem.length).every(Boolean), cf = concl ? !fv[fv.length - 1] : false;
          crow.tr.classList.toggle('counter', pr && cf); crow.tr.classList.toggle('alltrue', pr && !cf && mode === 'show');
        }
      });
      verdict();
    }
    function verdict() {
      if (F.quiet || o.verdict === false) { F.say(''); return; }
      if (mode === 'short') {
        var fv = finals.map(function (f) { return LG.evalProp(f, shortVals); }), pr = fv.slice(0, prem.length).every(Boolean), cf = concl && !fv[fv.length - 1];
        F.say(pr && cf ? okMark(true) + ' These values make every premise true and the conclusion false: a counterexample, so the argument is <b>invalid</b>.' : 'Goal: make every premise true and the conclusion false. ' + (!pr ? 'A premise is false in this row.' : 'The conclusion is true in this row.'));
        return;
      }
      if (mode === 'fill') return;
      if (o.show === 'none' || rowIx.length < allRows.length) { F.say(''); return; }
      if (argMode && concl) { var va = LG.validity(prem, concl); F.say(va.valid ? okMark(true) + ' <b>Valid:</b> no row has every premise true and the conclusion false.' : okMark(false) + ' <b>Invalid:</b> the highlighted row' + (va.counter.length > 1 ? 's have' : ' has') + ' every premise true and the conclusion false.'); return; }
      if (main.length === 2 && o.compare !== false) { var eqv = LG.equivalent(main[0], main[1]); F.say(eqv ? '<b>Equivalent:</b> the two columns match in every row.' : '<b>Not equivalent:</b> the columns differ in at least one row.'); return; }
      if (main.length === 1 && o.classify !== false) { var c = LG.classify(main[0]); F.say(c === 'tautology' ? '<b>Tautology:</b> true in every row.' : c === 'contradiction' ? '<b>Self-contradiction:</b> false in every row.' : '<b>Contingent:</b> true in some rows and false in others.'); return; }
      F.say('');
    }
    if (mode === 'fill' && F.interactive) {
      el.insertBefore(h('p', 'lgv-hint', 'Tap a dot to cycle ' + T0[0] + ', ' + T0[1] + ' and empty, or focus it and type ' + T0[0] + ' or ' + T0[1] + '.'), F.body);
      if (!F.quiet) {
        btn(F.ctl, 'Check', function () {
          var empty = 0, wrong = 0; cells.forEach(function (crow) { var v = rowVals(crow.ri); crow.cols.forEach(function (x) { if (!x.b) return; var m = mine[x.key]; if (m === undefined) empty++; else if (m !== LG.evalProp(cols[x.ci].f, v)) wrong++; }); });
          if (empty) { F.say('Fill every cell first (' + plural(empty, 'cell') + ' left).'); return; }
          checked = true; paint();
          F.say(wrong ? okMark(false) + ' ' + plural(wrong, 'cell') + ' to fix. Work from the inside out: find each part\'s value before the main connective\'s.' : okMark(true) + ' Every cell is right.');
        }, 'pri');
        btn(F.ctl, 'Clear', function () { mine = {}; checked = false; paint(); F.say(''); });
      }
    }
    paint();
    return { cols: cols.map(function (c) { return LG.show(c.f); }) };
  });
  /* ---------- lg-proof: Fitch-style natural deduction: read a proof, fill its blanks, or build and check your own ---------- */
  V.register('lg-proof', function (el, o) {
    var F = frame(el, o, 'proof', 'A formal proof');
    var prem = (o.premises || []).slice(), concl = o.conclusion || '';
    var base = (o.lines || []).map(function (l) { return { f: l.f, j: l.j, note: l.note }; });
    var mode = o.mode || 'show', np = prem.length;
    var blanks = {}; (o.blanks || []).forEach(function (b) { var n = typeof b === 'object' ? b.n : b; blanks[n] = typeof b === 'object' ? (b.part || 'j') : 'j'; });
    var built = mode === 'build' ? base.slice() : null;
    var step = o.steps && mode === 'show' ? (o.step || 0) : Infinity;
    var head = h('p', 'lgv-goal', (prem.length ? '<span>Premises: ' + prem.map(function (p) { return '<b>' + esc(fml(p)) + '</b>'; }).join(', ') + '</span> ' : '<span>No premises.</span> ') + (concl ? '<span>Prove: <b>' + esc(fml(concl)) + '</b></span>' : ''));
    F.body.appendChild(head);
    var list = h('ol', 'lgv-pf'); list.setAttribute('aria-label', 'Proof lines'); F.body.appendChild(list);
    var inputs = {};
    function linesNow() { // the lines as they stand, with the learner's entries
      var src = built || base;
      return src.map(function (l, i) {
        var n = np + i + 1, x = { f: l.f, j: l.j };
        if (inputs[n]) { if (inputs[n].f) x.f = inputs[n].f.value; if (inputs[n].j) x.j = inputs[n].j.value; }
        return x;
      });
    }
    function result() { return LG.checkProof({ premises: prem, conclusion: concl, lines: linesNow() }); }
    var shown = null, pend = 0;
    function relayout() { // re-render only when a justification changed the subproof structure (depths)
      sync(); var R = result(), was = shown ? shown.lines.map(function (r) { return r.depth; }).join() : '';
      if (R.lines.map(function (r) { return r.depth; }).join() !== was) render(false);
    }
    function render(marks) {
      var R = result(), src = built || base;
      list.innerHTML = '';
      var keepFocus = D.activeElement && list.contains(D.activeElement) ? { n: D.activeElement.dataset.n, k: D.activeElement.dataset.k, s: D.activeElement.selectionStart } : null;
      var oldInputs = inputs; inputs = {};
      R.lines.forEach(function (r, i) {
        var n = i + 1, isPrem = n <= np, li0 = i - np, hide = !isPrem && li0 >= step;
        var li = h('li', 'lgv-pl' + (isPrem ? ' prem' : '') + (r.assume ? ' assume' : '') + (isPrem && n === np ? ' lastprem' : '') + (hide ? ' lgv-hide' : ''));
        li.appendChild(h('span', 'lgv-pn', String(n)));
        var body = h('span', 'lgv-pbody'); body.style.setProperty('--d', r.depth);
        for (var d = 0; d < r.depth; d++) body.appendChild(h('span', 'lgv-bar', ''));
        var fcell = h('span', 'lgv-pf-f'), jcell = h('span', 'lgv-pf-j');
        var bl = blanks[n], L = isPrem ? { f: prem[i], j: 'Pr' } : src[li0];
        var editF = (mode === 'build' && !isPrem) || (mode === 'blanks' && bl && (bl === 'f' || bl === 'both'));
        var editJ = (mode === 'build' && !isPrem) || (mode === 'blanks' && bl && (bl === 'j' || bl === 'both'));
        if (editF && F.interactive && !F.quiet) fcell.appendChild(field(n, 'f', oldInputs, mode === 'build' ? L.f : '', 'Formula for line ' + n));
        else if (editF) fcell.innerHTML = '<span class="lgv-blank">?</span>';
        else fcell.textContent = r.f || L.f || '';
        if (editJ && F.interactive && !F.quiet) jcell.appendChild(field(n, 'j', oldInputs, mode === 'build' ? L.j : '', 'Justification for line ' + n));
        else if (editJ) jcell.innerHTML = '<span class="lgv-blank">?</span>';
        else jcell.textContent = isPrem ? (n === np && concl && o.goalLine ? 'Pr   /∴ ' + fml(concl) : 'Pr') : (LG.showJust(L.j) || L.j || '');
        body.appendChild(fcell); li.appendChild(body); li.appendChild(jcell);
        if (marks && !F.quiet && !isPrem && (mode === 'build' || (mode === 'blanks' && bl))) {
          var m = h('span', 'lgv-pmark', okMark(r.ok)); li.appendChild(m); li.classList.toggle('no', !r.ok);
          if (!r.ok && r.msg) li.appendChild(h('span', 'lgv-pmsg', esc(r.msg)));
        }
        li.setAttribute('aria-label', 'Line ' + n + (r.depth ? ', inside ' + plural(r.depth, 'subproof') : '') + ': ' + (editF ? 'blank' : (r.f || L.f || '')) + ', ' + (editJ ? 'justification blank' : (isPrem ? 'premise' : (LG.showJust(L.j) || L.j))));
        list.appendChild(li);
      });
      if (keepFocus && inputs[keepFocus.n] && inputs[keepFocus.n][keepFocus.k]) { var e = inputs[keepFocus.n][keepFocus.k]; e.focus(); try { e.setSelectionRange(keepFocus.s, keepFocus.s); } catch (er) { } }
      shown = R; return R;
    }
    function field(n, k, old, val, label) {
      var inp = D.createElement('input'); inp.type = 'text'; inp.className = 'lgv-pin ' + k; inp.dataset.n = n; inp.dataset.k = k; if (k === 'f') inp.dataset.f = '1';
      inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('aria-label', label);
      inp.placeholder = k === 'f' ? 'formula' : 'rule, lines';
      inp.value = old[n] && old[n][k] ? old[n][k].value : (val || '');
      if (k === 'f') tidyInput(inp); else inp.setAttribute('list', jlist);
      inp.addEventListener('change', function () { if (k === 'j' && mode === 'build') { clearTimeout(pend); pend = setTimeout(relayout, 0); } });
      inp.addEventListener('input', function () { F.say(''); list.querySelectorAll('.lgv-pmark,.lgv-pmsg').forEach(function (x) { x.remove(); }); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (mode === 'build' && k === 'j' && n === np + built.length) addLine(); else check(); } });
      (inputs[n] = inputs[n] || {})[k] = inp; return inp;
    }
    var jlist = uid('rules'), dl = D.createElement('datalist'); dl.id = jlist;
    ['MP', 'MT', 'HS', 'DS', 'CD', 'Simp', 'Conj', 'Add', 'DM', 'Com', 'Assoc', 'Dist', 'DN', 'Trans', 'Impl', 'Equiv', 'Exp', 'Taut', 'ACP', 'AIP', 'CP', 'IP', 'QN', 'UI', 'EI', 'UG', 'EG', 'Id'].forEach(function (r) { var op = D.createElement('option'); op.value = r + ' '; op.label = LG.RULES[r]; dl.appendChild(op); });
    el.appendChild(dl);
    function sync() { if (!built) return; built = linesNow(); }
    function addLine(assume) { sync(); built.push({ f: '', j: assume ? assume : '' }); render(false); var e = inputs[np + built.length]; if (e && e.f) e.f.focus(); F.say(''); }
    function check() {
      clearTimeout(pend); sync(); var R = render(true);
      if (F.quiet) return;
      if (mode === 'blanks') {
        var bad = Object.keys(blanks).map(Number).filter(function (n) { return !R.lines[n - 1].ok; });
        var later = R.lines.filter(function (r) { return r.n > np && !r.ok && !blanks[r.n]; });
        F.say(!bad.length && !later.length ? okMark(true) + ' That works: every line now follows by its rule.' : okMark(false) + ' ' + (bad.length ? 'Line ' + bad.join(' and ') + ' does not check out yet.' : 'A later line no longer follows; check the formula you wrote.'));
        return;
      }
      var nBad = R.lines.filter(function (r) { return !r.ok; }).length;
      if (R.done) F.say(okMark(true) + ' <b>Proof complete.</b> Every line follows, and the last line is the conclusion.');
      else if (nBad) F.say(okMark(false) + ' ' + plural(nBad, 'line') + ' to fix (marked ✗).');
      else if (R.open) F.say('Every line follows so far. Close the open subproof' + (R.open > 1 ? 's' : '') + ' with CP or IP.');
      else F.say('Every line follows so far. Keep going until the last line is ' + esc(fml(concl)) + '.');
    }
    if (mode === 'build' && F.interactive) {
      if (!built.length) built.push({ f: '', j: '' });
      keypad(F.ctl, el, o.quantifiers ? ['∀', '∃', '='] : []);
      var row2 = h('div', 'lgv-pbtns'); F.ctl.appendChild(row2);
      btn(row2, '+ Line', function () { addLine(); });
      btn(row2, '+ Assume (CP)', function () { addLine('ACP'); });
      btn(row2, '+ Assume (IP)', function () { addLine('AIP'); });
      btn(row2, 'Remove last', function () { sync(); if (built.length) built.pop(); render(false); F.say(''); });
      if (!F.quiet) btn(row2, 'Check', check, 'pri');
      el.insertBefore(h('p', 'lgv-hint', 'Type a formula (-> for →, ~ for ¬, & for ∧, | for ∨, or use the keys) and its justification, like "MP 1, 2". Close a subproof with "CP 3–5" or "IP 3–7".'), F.body);
    } else if (mode === 'blanks' && F.interactive && !F.quiet && Object.keys(blanks).length) {
      if (Object.keys(blanks).some(function (n) { return blanks[n] !== 'j'; })) keypad(F.ctl, el, o.quantifiers ? ['∀', '∃', '='] : []);
      btn(F.ctl, 'Check', check, 'pri');
    }
    if (o.steps && mode === 'show' && F.interactive) {
      var prev = btn(F.ctl, '◀ Back', function () { if (step > 0) { step--; upd(); } }), next = btn(F.ctl, 'Next ▶', function () { if (step < base.length) { step++; upd(); } }, 'pri');
      var upd = function () { prev.disabled = step === 0; next.disabled = step >= base.length; render(false); var L = base[step - 1]; F.say(step === 0 ? 'Start from the premises.' : (L && L.note ? L.note : 'Line ' + (np + step) + ': ' + esc(fml(L.f)) + ' by ' + esc(LG.RULES[(LG.parseJust(L.j) || {}).rule] || L.j) + '.')); };
      upd();
    } else render(false);
    if (mode === 'show' && base.length && W.console) { var R0 = result(); R0.lines.forEach(function (r) { if (!r.ok) W.console.warn('lg-proof: line ' + r.n + ' does not check: ' + r.msg); }); }
    return { result: function () { sync(); return result(); }, check: check };
  });
  /* ---------- lg-quantworld: a small world of objects for testing quantified sentences ---------- */
  var SHAPES = { preds: { C: 'is a circle', S: 'is a square', T: 'is a triangle', R: 'is red', B: 'is blue', L: 'is large' }, look: { shape: { C: 'circle', S: 'square', T: 'triangle' }, color: { R: 'red', B: 'blue' }, size: { L: 1 } } };
  V.register('lg-quantworld', function (el, o) {
    var F = frame(el, o, 'world', 'A small world of objects');
    var preset = o.preset === 'shapes' || (!o.preds && !o.look) ? SHAPES : null;
    var preds = o.preds || (preset ? preset.preds : {}), look = o.look || (preset ? preset.look : { shape: {}, color: {}, size: {} });
    look.shape = look.shape || {}; look.color = look.color || {}; look.size = look.size || {};
    var objs = (o.objects || [{ n: 'a', has: [] }, { n: 'b', has: [] }]).map(function (x) { return { n: x.n, has: (x.has || []).slice(), label: x.label }; });
    var rels = {}; Object.keys(o.rels || {}).forEach(function (k) { var r = o.rels[k]; rels[k] = Array.isArray(r) ? { label: '', pairs: r.map(function (p) { return p.slice(); }) } : { label: r.label || '', pairs: (r.pairs || []).map(function (p) { return p.slice(); }) }; });
    var sentences = (o.sentences || []).map(function (s) { return LG.tryParse(s); }).filter(Boolean);
    var goal = o.goal ? { premises: (o.goal.premises || []).map(LG.parse), conclusion: LG.parse(o.goal.conclusion) } : null;
    var edit = !!o.edit && F.interactive, sel = null;
    var NAMES = 'abcdefgh';
    var legend = h('p', 'lgv-wlegend'); F.body.appendChild(legend);
    var s = sv('svg', { class: 'lgv-wsvg', role: 'img' }); F.body.appendChild(s);
    var defs = sv('defs', null, s), mids = {};
    var relKeys = Object.keys(rels), RC = ['r1', 'r2', 'r3'];
    relKeys.forEach(function (k, i) { var id = uid('wm'); mids[k] = id; var m = sv('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs); sv('path', { d: 'M0 0L10 5L0 10z', class: 'lgv-wah ' + RC[i % 3] }, m); });
    var panel = h('div', 'lgv-wpanel'); if (edit) F.body.appendChild(panel);
    var sl = h('ul', 'lgv-wsent'); if (sentences.length) F.body.appendChild(sl);
    function hasP(ob, p) { return ob.has.indexOf(p) >= 0; }
    function world() { return { objects: objs.map(function (x) { return { n: x.n, has: x.has }; }), rels: (function () { var r = {}; relKeys.forEach(function (k) { r[k] = rels[k].pairs; }); return r; })() }; }
    function layout() {
      var n = objs.length, W0 = 360, circ = relKeys.length > 0 && n > 2;
      var H0 = circ ? 250 : 150, pts = [];
      objs.forEach(function (x, i) {
        if (circ) { var a = -M.PI / 2 + i * 2 * M.PI / n, R = 82; pts.push([W0 / 2 + R * 1.35 * M.cos(a), 130 + R * M.sin(a)]); }
        else pts.push([W0 / 2 + (i - (n - 1) / 2) * M.min(84, (W0 - 60) / M.max(1, n - 1 || 1)), relKeys.length ? 78 : 62]);
      });
      return { W: W0, H: H0, pts: pts, circ: circ };
    }
    function draw() {
      var Lo = layout(); s.setAttribute('viewBox', '0 0 ' + Lo.W + ' ' + Lo.H);
      while (s.childNodes.length > 1) s.removeChild(s.lastChild);
      // relation arrows first
      relKeys.forEach(function (k, ri) {
        rels[k].pairs.forEach(function (p) {
          var i = objs.findIndex(function (x) { return x.n === p[0]; }), j = objs.findIndex(function (x) { return x.n === p[1]; }); if (i < 0 || j < 0) return;
          var A = Lo.pts[i], B = Lo.pts[j], cls = 'lgv-wrel ' + RC[ri % 3];
          if (i === j) { sv('path', { d: 'M' + (A[0] - 8) + ' ' + (A[1] - 22) + ' C' + (A[0] - 26) + ' ' + (A[1] - 58) + ' ' + (A[0] + 26) + ' ' + (A[1] - 58) + ' ' + (A[0] + 8) + ' ' + (A[1] - 24), class: cls, 'marker-end': 'url(#' + mids[k] + ')' }, s); return; }
          var dx = B[0] - A[0], dy = B[1] - A[1], L = M.hypot(dx, dy), ux = dx / L, uy = dy / L, off = 10 + ri * 6;
          var x1 = A[0] + ux * 26, y1 = A[1] + uy * 26, x2 = B[0] - ux * 28, y2 = B[1] - uy * 28, cx = (x1 + x2) / 2 - uy * (off + 8), cy = (y1 + y2) / 2 + ux * (off + 8);
          sv('path', { d: 'M' + x1 + ' ' + y1 + ' Q' + cx + ' ' + cy + ' ' + x2 + ' ' + y2, class: cls, 'marker-end': 'url(#' + mids[k] + ')' }, s);
        });
      });
      objs.forEach(function (x, i) {
        var p = Lo.pts[i], big = Object.keys(look.size).some(function (k) { return hasP(x, k); }), r = big ? 22 : 15;
        var shape = null; Object.keys(look.shape).forEach(function (k) { if (hasP(x, k)) shape = look.shape[k]; });
        var col = null; Object.keys(look.color).forEach(function (k) { if (hasP(x, k)) col = look.color[k]; });
        var g = sv('g', { class: 'lgv-obj' + (sel === i ? ' sel' : '') + (col ? ' col-' + col : '') }, s);
        if (shape === 'square') sv('rect', { x: p[0] - r, y: p[1] - r, width: 2 * r, height: 2 * r, rx: 3, class: 'lgv-shape' }, g);
        else if (shape === 'triangle') sv('path', { d: 'M' + p[0] + ' ' + (p[1] - r * 1.15) + ' L' + (p[0] + r * 1.15) + ' ' + (p[1] + r * 0.85) + ' L' + (p[0] - r * 1.15) + ' ' + (p[1] + r * 0.85) + 'z', class: 'lgv-shape' }, g);
        else if (shape === 'circle' || !Object.keys(look.shape).length) sv('circle', { cx: p[0], cy: p[1], r: r, class: 'lgv-shape' + (shape ? '' : ' plain') }, g);
        else sv('circle', { cx: p[0], cy: p[1], r: r, class: 'lgv-shape none' }, g);
        var t = sv('text', { x: p[0], y: p[1], 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'lgv-oname' }, g); t.textContent = x.n;
        var other = x.has.filter(function (k) { return !(k in look.shape) && !(k in look.color) && !(k in look.size); });
        var up = Lo.circ && p[1] < 110, lab = sv('text', { x: p[0], y: up ? p[1] - r - 7 : p[1] + r + 14, 'text-anchor': 'middle', class: 'lgv-olab' }, g); lab.textContent = (x.label ? x.label + (other.length ? ' · ' : '') : '') + other.join(' ');
        if (edit) {
          g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Object ' + x.n + '. Press to edit it.'); g.setAttribute('aria-pressed', String(sel === i));
          var pick = function () { sel = sel === i ? null : i; drawAll(); var f = s.querySelectorAll('.lgv-obj')[i]; if (f) f.focus(); };
          g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        }
      });
      s.setAttribute('aria-label', describe());
    }
    function describe() {
      var bits = objs.map(function (x) { var ps = x.has.map(function (k) { return preds[k] ? preds[k].replace(/^is /, '') : k; }); return x.n + (x.label ? ' (' + x.label + ')' : '') + (ps.length ? ': ' + ps.join(', ') : ': none of the properties'); });
      relKeys.forEach(function (k) { if (rels[k].pairs.length) bits.push(k + (rels[k].label ? ' (' + rels[k].label + ')' : '') + ' holds for ' + rels[k].pairs.map(function (p) { return p.join(' to '); }).join(', ')); else bits.push('no pairs for ' + k); });
      return 'A world of ' + plural(objs.length, 'object') + '. ' + bits.join('. ') + '.';
    }
    function drawLegend() {
      var parts = Object.keys(preds).map(function (k) { return '<span class="lgv-wkey"><b>' + k + 'x</b>: x ' + esc(preds[k]) + '</span>'; });
      relKeys.forEach(function (k, i) { parts.push('<span class="lgv-wkey ' + RC[i % 3] + '"><b>' + k + 'xy</b>: ' + (rels[k].label ? 'x ' + esc(rels[k].label) + ' y' : 'an arrow from x to y') + ' <i class="lgv-wsw ' + RC[i % 3] + '"></i></span>'); });
      legend.innerHTML = parts.join(' ');
    }
    function drawSentences() {
      if (!sentences.length && !goal) return;
      var w = world();
      sl.innerHTML = '';
      sentences.forEach(function (f) {
        var v = null; try { v = LG.evalWorld(f, w); } catch (e) { v = null; }
        var li = h('li', F.quiet ? '' : v ? 'on' : 'off');
        var why = '';
        if (!F.quiet && v !== null) { var wi = LG.witness(f, w); if (wi && wi.obj) why = wi.kind === 'counterexample' ? (f.t === 'not' ? 'true: ' : 'false: ') + wi.obj + ' is a counterexample' : (f.t === 'not' ? 'false: ' : 'true: ') + wi.obj + ' is a witness'; else if (wi) why = wi.kind === 'all' ? 'every object passes' : 'no object passes'; }
        li.innerHTML = '<span class="lgv-wf">' + esc(LG.show(f)) + '</span>' + (F.quiet || v === null ? '' : '<span class="lgv-wtv">' + (v ? 'true' : 'false') + '</span>' + (why ? '<small>' + esc(why) + '</small>' : ''));
        sl.appendChild(li);
      });
      if (goal && !F.quiet) {
        var pv = goal.premises.map(function (f) { return LG.evalWorld(f, w); }), cv = LG.evalWorld(goal.conclusion, w);
        var done = pv.every(Boolean) && !cv;
        F.say(done ? okMark(true) + ' <b>A counterexample world:</b> every premise is true here and the conclusion is false, so the argument is invalid.' : 'Goal: make ' + (goal.premises.length ? 'every premise true and ' : '') + 'the conclusion <b>' + esc(LG.show(goal.conclusion)) + '</b> false. ' + (pv.every(Boolean) ? 'The premises are all true; the conclusion is still true.' : plural(pv.filter(function (x) { return !x; }).length, 'premise') + ' still false.'));
      }
    }
    function drawPanel() {
      if (!edit) return;
      panel.innerHTML = '';
      var top = h('div', 'lgv-wtop'); panel.appendChild(top);
      if (objs.length < (o.max || 6)) btn(top, '+ Object', function () { var nm = NAMES.split('').filter(function (c) { return !objs.some(function (x) { return x.n === c; }); })[0]; objs.push({ n: nm, has: [] }); sel = objs.length - 1; drawAll(); });
      if (sel === null) { top.appendChild(h('span', 'lgv-hint', 'Tap an object to change it.')); return; }
      var x = objs[sel];
      if (objs.length > 1) btn(top, 'Remove ' + x.n, function () { var nm = x.n; objs.splice(sel, 1); relKeys.forEach(function (k) { rels[k].pairs = rels[k].pairs.filter(function (p) { return p[0] !== nm && p[1] !== nm; }); }); sel = null; drawAll(); });
      var g = h('div', 'lgv-wtog'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Properties of ' + x.n); panel.appendChild(g);
      g.appendChild(h('span', 'lgv-glab', x.n + ':'));
      Object.keys(preds).forEach(function (k) {
        var b = btn(g, k + ' <small>' + esc(preds[k].replace(/^is (a |an )?/, '')) + '</small>', function () {
          var i = x.has.indexOf(k); if (i >= 0) x.has.splice(i, 1); else {
            x.has.push(k);
            [look.shape, look.color].forEach(function (grp) { if (k in grp) Object.keys(grp).forEach(function (j) { if (j !== k) { var q = x.has.indexOf(j); if (q >= 0) x.has.splice(q, 1); } }); }); // one shape, one color
          }
          drawAll(); var again = panel.querySelector('[data-k="' + k + '"]'); if (again) again.focus();
        }, 'lgv-tog'); b.dataset.k = k; b.setAttribute('aria-pressed', String(hasP(x, k)));
      });
      relKeys.forEach(function (k) {
        var g2 = h('div', 'lgv-wtog'); g2.setAttribute('role', 'group'); g2.setAttribute('aria-label', k + ' from ' + x.n); panel.appendChild(g2);
        g2.appendChild(h('span', 'lgv-glab', k + x.n + '_:'));
        objs.forEach(function (y) {
          var on = rels[k].pairs.some(function (p) { return p[0] === x.n && p[1] === y.n; });
          var b = btn(g2, k + x.n + y.n, function () { if (on) rels[k].pairs = rels[k].pairs.filter(function (p) { return !(p[0] === x.n && p[1] === y.n); }); else rels[k].pairs.push([x.n, y.n]); drawAll(); var again = panel.querySelector('[data-r="' + k + x.n + y.n + '"]'); if (again) again.focus(); }, 'lgv-tog');
          b.dataset.r = k + x.n + y.n; b.setAttribute('aria-pressed', String(on));
        });
      });
    }
    function drawAll() { draw(); drawLegend(); drawSentences(); drawPanel(); }
    drawAll();
    return { world: world };
  });
})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);
