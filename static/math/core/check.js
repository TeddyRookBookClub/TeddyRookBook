/* Math Ladder core: answer checking, built on the site's CAS (window.CAS from static/homeschool/calc/cas.js) and on
   ML.parsePlain from tex.js (load cas.js, gen.js, tex.js, then this file; in Node, require() finds them).

   ML.check(spec, answer, ctx?) -> { ok: true|false, msg?, invalid?, parts? }
     ctx      optional { q: the problem's question text, unit: the problem's p.unit }: with a form ('simplified',
              'simplest', 'factored', 'expanded'), an answer that is the expression the question started from (typed back
              unchanged) is not accepted; q and unit also decide whether a unit typed after a number is the right one
     msg      a short, kind note, given only when we are sure what happened ("Right size, wrong sign.")
     invalid  true when the answer is empty or can't be read: ask the learner to fix it, don't count it as wrong
     parts    for multi: one result per part
   ML.answerValue(spec)  the canonical answer in a form ML.check accepts (string, array, index, boolean)
   ML.answerText(spec)   the canonical answer as plain text ("2 1/2", "(2, -1)", "x < 3")
   ML.answerShow(spec)   the canonical answer as text with $…$ math, ready for ML.typeset ("$\frac{3}{4}$", "No solution");
                         numbers with 4 or more digits get thousands commas (3,000), negative fractions show the sign in
                         front (-\frac{1}{4}), interval endpoints show as written in the spec (\frac{4}{3}, \sqrt{2}),
                         and factors of 1, zero terms and double signs are left out ("1*x + (-3)" shows as x - 3)
   ML.equiv(a, b, vars)  are two plain-math expressions equal for all values of vars? (for generators that verify themselves)
   ML.evalPlain(s, env)  the number a plain-math string stands for ({ x: 2 } fills in variables); NaN if it can't

   WHAT LEARNERS MAY TYPE  unicode − × · ÷ √ π ² ³ ∞ ≤ ≥ ≠, spaces anywhere, "1,000" and "3,000 g" (when the answer is one
   number), mixed numbers "2 1/2", ".5", a trailing "%" (it means /100, or is simply dropped when spec.pct is true), "\$5", a
   unit after a number ("12 cm", "24 sq cm", "24 square cm", "24 cm^2", "24 cm²", "55 mph", "3 m/s", "45°", "45 degrees"; also
   for each value of a set or tuple: "45°, 135°"), "x = 3" or "x=3" for numbers and sets, "y = …" or "f(x) = …" before an
   expression, "no solution", "all real numbers", "DNE", "inf", implicit multiplication ("2x", "x(x+1)", "2(3)", "3sqrt(2)"),
   "±" (also "+-" and "+/-" in sets; "(-1 ± sqrt(13))/2" gives both values), sin^(-1)(x) or tan^-1 x for arcsin, arctan
   (sin^2(x) is (sin x)^2). An angle in degrees where radians are expected (or the reverse) gets a note saying so.

   UNITS  A unit typed after a right number must be the problem's: ctx.unit when the problem has one ("24 cm" is not right
   for square cm, "55 km/h" not for mph; spellings match: cm² = sq cm = square centimeters, mph = mi/h, ° = degrees,
   "12 cookie" for cookies), else the one the question asks for ("How many grams …", "… in square feet?", "Convert … to
   inches."), else at least one the question uses. Count words, "units" and angle units are never held against an answer;
   a question with no units takes any. A wrong unit gets "Check the unit: …".

   NUMBER FORMS  { t: 'num', v, form, dp, tol, pct }   (the value must always be equal; the form adds a requirement)
   'any'       (default) any way of writing the exact value: 0.75, 3/4, 6/8, 75%, 1.5/2 all match 3/4
   'int'       a whole number written as digits ("-4"; not "8/2", not "4.0")
   'dec'       a decimal or a whole number, no fractions; with dp: the value rounded to dp places (trailing zeros optional)
   'frac'      one fraction a/b of whole numbers in lowest terms (improper is fine; a whole number is fine when the value is
               whole); not a decimal, not a mixed number
   'mixed'     a mixed number "w n/d" with 0 < n < d in lowest terms; a whole number when the value is whole; a proper
               fraction when the value is between -1 and 1
   'simplest'  any of the above in simplest form: fractions in lowest terms (and not over 1), no arithmetic left between
               numbers ("3+4", "2*3", "2^3", "sqrt(16)"), roots simplified (sqrt(12) -> 2sqrt(3), sqrt(3/4), cbrt(16)) and no
               root left in a denominator, unless the expected answer itself is written that way
   In every form (not with dp or tol), a sin, cos, tan, arcsin, arccos, arctan, ln or log of a number left unevaluated is
   not accepted when the expected answer has no such function: "arccos(1/2)" for pi/3, "sin(pi/6)" for 1/2, "log(1000)"
   for 3 ("Equal, but give the angle itself …"). An expected "ln(3)" accepts "ln 3" and "log_3(2)" matches ln(2)/ln(3).
   dp: n       requires a decimal rounded to n places (implies 'dec')     tol: t   accepts |answer - v| <= t
   pct: true   v is a percent: "25%" and "25" both match v '25'
   ANY VALUE THAT WORKS (Real Analysis: "find an N that works for this ε", "find a δ that works")
   { t: 'num', v, satisfies: { min, max, minOpen, maxOpen, int, msgLow, msgHigh } }   v is one value that works (it is
               the answer shown); every real number in the range the data describes is right, whatever its form.
               min, max: plain-math strings or numbers ('1/100', 'sqrt(91/10)-3'), either may be left out; the ends are
               included unless minOpen / maxOpen is true; int: true asks for a whole number. Compared exactly when both
               values are rational, otherwise numerically (equal within 1e-12, relative). Outside the range: msgLow /
               msgHigh if given, else "It has to be positive." (min 0, open) or "That one doesn't work: it is too
               small." / "… too large."; not whole: "Give a whole number." answerShow adds the range ("$101$, or any
               whole number $\ge 101$"). A range with no upper end accepts v + 1, so put it in a multi part (check-gen
               probes a lone num with v + 1). Tests: /tmp/work_ra/test/check_satisfies.js
   SCIENCE (the Ladders: physics, chemistry, …)
   Scientific notation may be typed: 3.0e8, 3.0E8, 3.0×10^8, 3.0*10^8, 3.0 x 10^8, 3.0·10^8, 3 × 10⁸, 1.6×10^-19, 1.6 x 10^(-19).
   rtol: r     relative tolerance: accepts |answer - v| <= r·|v| (use it for physical quantities: rtol 0.01 is 1%); with tol
               too, either one is enough. A miss by a power of ten gets "Check the power of ten."
   form 'sf', sf: n   the value rounded to n significant figures, written with n significant figures (3.00e8 or 3.00×10^8
               for 3 sf; trailing zeros of a whole number like 300 are ambiguous and count as fine). With rtol, any value
               within rtol written with n significant figures is accepted (rounding of intermediate steps). Notes: "Round it to
               3 significant figures.", "Equal, but give it to 3 significant figures, like 3.00 × 10^8.", "Check your rounding".
   Units of science (SI with prefixes and the common extras): N, J, W, Pa, C, V, Ω, F, T, Hz, mol, K, L, eV, atm, bar, mmHg,
               cal, AU, ly, pc, u, M (mol/L), min, h, … with products, quotients and powers (kg·m/s², m s^-2, J/(mol·K), cm3)
               and words (newtons, joules, ohms, kilometers per hour). With p.unit set (shown beside the box), a typed
               unit that is the same unit (N = kg·m/s²) is accepted; a different one is not: "Check the unit: the answer is in N."
               (and "that's the right amount in kN, but the answer should be in N" when only the unit is off).
               multi parts may carry their own unit: parts: [{ label, a, unit }] (shown beside that part's box; strict).

   EXPRESSION FORMS  { t: 'expr', v, vars, form }   (always equivalent first: CAS simplification of the difference, then a
   numeric check at random points, skipping points outside the domain, with at least 4 valid points)
   'expanded'    no parentheses left that multiply a sum (2(x+1), (x+1)^2, -(x-3), (x+1)/2 are not expanded) and like
                 terms combined
   'factored'    a product, not a sum; at least as many non-constant factors as the expected answer; no factor with a
                 common whole-number factor left inside, like (2x+4) (unless the expected answer has one)
   'factored'    also: an expected product (3(x-4), 3x(2x+1)) never accepts a sum (3x-12); no fraction or decimal
                 coefficients inside a factor when the expected answer has whole numbers (6(x+3/2) for 3(2x+3))
   'simplified'  like terms combined, numbers in simplest form, no x·x or (x^2)^3 left, no x^1, and a fraction's
   (or           denominator no bigger in degree than the expected answer's (common factors cancelled); also no power of
   'simplest')   a product or quotient ((2x^3)^4, (x^2y^3)^3, (x/y)^2, (8x^6)^(1/3)), no product of terms to multiply out
                 ((7w^12)(6w^10)), no base above and below the fraction bar (x^5/x^2), no fraction inside a fraction, one
                 fraction rather than a sum with a letter in a denominator (1 - 4/x), no a(b + c) left beside other terms,
                 no unevaluated sin/ln … of a number. Each rule applies only when the expected answer itself keeps it.
                 Exponent policy: positive exponents, so 1/x^3 is accepted and x^(-3) is not, unless the expected answer
                 uses a negative exponent (then both are). x^(1/2) and sqrt(x) are both fine; so are 2x^2, 2*x^2, 2x², x^2*2.
   With a form, an answer that is the expression the problem started with is not accepted (see ctx below and spec.from:
   an optional plain string or list of strings, the expression to simplify, factor or expand).
   An expected answer with a constant "+ C" accepts any constant name and reminds the learner when it is missing.
   An expected answer with an absolute value (ln|x| + C) needs it: ln(x) + C is not accepted ("Remember the absolute
   value: ln|x|."), because it is undefined for negative x where the answer is defined. (ln(x) expected accepts ln|x|.)

   EQUATIONS { t: 'eq', v, form }  equal when (left - right) is a nonzero constant multiple of the expected one.
   form 'solved': the left side is the single variable the expected answer solves for (y = 2x + 3).
   form 'standard': Ax + By = C with whole numbers, A > 0, no common factor.

   SETS { t: 'set', v: ['3', '-2'] | [] | 'all' } "3, -2", "{-2, 3}", "x = 3 or x = -2", "x = ±3"; order and repeats don't
   matter. spec.form applies to each element.   TUPLES { t: 'tuple', v, vars? } "(2, -1)", "2, -1", "⟨1,2,3⟩", "x=2, y=-1",
   or an array of strings from separate boxes.   MATRIX { t: 'matrix', v } an array of rows, or "[[1,0],[0,1]]".
   INTERVAL { t: 'interval', v: '(-inf, 3] U (5, inf)' }   INEQUALITY { t: 'ineq', v: 'x < 3' | '-2 <= x < 5' |
   'x < -1 or x > 2' } (interval notation is accepted too)   MC { t: 'mc', choices, v } answer: an index, an array of
   indices, or the choice text   TF { t: 'tf', v } answer: true/false or "true"/"false"/"t"/"f"/"yes"/"no"
   TEXT { t: 'text', v: ['acute'], strict?: true } case, spacing, a/an/the and a final period ignored; a plural s too unless strict
   FORMULA { t: 'formula', v: ['H2O'] or 'H2O', states?: true }   a chemical formula (several accepted forms allowed). Case
            matters (CO is not Co); spaces don't. Subscripts as plain digits or Unicode (H₂O); charges as ^2+, ^2-, ^+, ^-, ^(2-),
            Unicode (SO₄²⁻), or plain after the formula (Fe3+, SO42-, NH4+: read every way, right if any reading is); groups in
            ( ) or [ ] (Ca(OH)2, [Cu(NH3)4]^2+); hydrates with ·, •, * or . (CuSO4·5H2O, CuSO4.5H2O). State symbols (s), (l), (g),
            (aq) are optional and ignored, unless states: true (then required and checked). In the spec write charges with ^
            (SO4^2-, NH4^+, Fe^3+). Notes: wrong case ("Check capital letters: Co is cobalt, but CO is carbon monoxide."),
            same atoms in another order or grouping ("… formulas are written in a standard order"), a missing or wrong charge,
            a subscript of 1, a number in front, wrong subscripts, a symbol that is no element. Not accepted: subscripts of 1
            (H2O1). Shown with real subscripts and superscripts (answerShow); ML._check.formulaTex(s) gives the TeX.
   PROP { t: 'prop', v: 'p → (q ∧ r)' (or a list of accepted formulas), match?: 'equivalent' (default) | 'exact' }
            a formula of statement or predicate logic (the Logic Ladder), read by MathLadder.logic's parser
            (static/logic/viz/logic.js, which Logic pages load; required here in node). Learners may type ¬ ~ ! - not,
            ∧ & ^ · * and, ∨ | \/ or and a lone v, → -> > ⊃ => then implies, ↔ <-> <> ≡ iff, ∀x (x) Ax (Ax) (∀x), ∃x Ex (Ex)
            (∃x), = ≠ !=, brackets [ ] for parentheses. 'equivalent': right when it has the same truth value as an accepted
            formula in every row (statement logic) or in every small world (predicate logic: all worlds of 1 to 3 objects
            when there are few, else a fixed sample, plus a sample of 4-object worlds); 'exact': the same formula up to
            parentheses that change nothing and the names of bound variables (∀y Fy = ∀x Fx); an equivalent one gets "That
            says the same thing, but …". Notes: the converse, ∀ with ∧ / ∃ with →, De Morgan slips, a ¬ with the wrong scope,
            a free variable, a letter that isn't part of the answer. answerValue / answerText / answerShow: the formula in the
            Logic Ladder's style (show(): ¬(p ∧ q) → r, ∀x(Fx → Gx)); answerShow as TeX ($\neg(p \land q) \to r$).
            ML._check.propNorm / propParse / propEquiv / propShow / propTex.
   TRANSLIT { t: 'translit', v: 'ḥtp-dj-nsw' (or a list of accepted readings), strict?: true }   an Egyptian transliteration
            (the Egyptology Ladder). Typed in the Egyptological alphabet in Unicode (ꜣ j y ꜥ w b p f m n r h ḥ ḫ ẖ z s š q k g t ṯ d ḏ)
            or in Manuel de Codage (A i y a w b p f m n r h H x X z s S q k g t T d D), or a mix: capitals matter only where
            MdC gives them a meaning (H X S T D, A for ꜣ and a for ꜥ), so h and H are different letters; other letters ignore
            case (Jmn = jmn). Also read: 3 and ȝ for ꜣ; ʿ ‘ ` for ꜥ; i, ꞽ, ỉ, ı͗, i̯ for yod (the site writes j); ś and Z for z;
            ḳ for q; letters built with combining marks (h + ̣ = ḥ). Dots, hyphens, = signs, spaces and brackets between
            morphemes are optional (sḏm.n.f = sḏmnf = sḏm.n=f). z and s are the same letter unless strict: true (the older
            books write s for both). Notes: a plain h, t, d, s or k where a dotted or underlined letter belongs ("Check the
            marks: ḥ (MdC H) is not h."), ꜣ and ꜥ swapped. answerShow: the first accepted reading as written.
            ML._check.translitNorm(s, strict) (the comparison key) and translitShow(s) (Unicode, separators kept).
   MULTI { t: 'multi', parts: [{ label, a }] } answer: an array, one entry per part                                     */
(function (root) {
  'use strict';
  var ML = root.MathLadder = root.MathLadder || {};
  function need(p) { try { return typeof require === 'function' ? require(p) : null; } catch (e) { return null; } }
  var CAS = root.CAS || need('../../homeschool/calc/cas.js');
  if (!ML.parsePlain) need('./tex.js');
  if (!ML.util) need('./gen.js');

  // ===================================================================== small helpers
  function str(x) { return x === null || x === undefined ? '' : String(x); }
  function gcdB(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function big(s) { return BigInt(s); }
  function relEq(a, b, tol) { if (!isFinite(a) || !isFinite(b)) return a === b; return Math.abs(a - b) <= (tol || 1e-9) * Math.max(1, Math.abs(a), Math.abs(b)); }
  function cx(v) { return v && typeof v === 'object' && 're' in v ? v : { re: v, im: 0 }; }
  function valEq(a, b) { // numbers or complex
    if (typeof a === 'number' && typeof b === 'number') return relEq(a, b);
    var A = cx(a), B = cx(b); if (typeof A.re !== 'number' || typeof B.re !== 'number') return false;
    return relEq(A.re, B.re) && relEq(A.im, B.im);
  }
  var NO_SOL = /^(no( real)? solutions?|none|no real (roots|numbers)|∅|\{\s*\}|empty( set)?|the empty set|null set|ns|no answer|nothing)$/i;
  var ALL_REAL = /^(all|all real numbers?|all reals?|all numbers|every (real )?number|any (real )?number|infinitely many( solutions)?|infinite solutions|ℝ|r|reals|\(\s*-\s*(inf|infinity|∞|oo)\s*,\s*\+?\s*(inf|infinity|∞|oo)\s*\)|x\s*(∈|in)\s*(ℝ|r)|identity|true for all x)$/i;
  var DNE = /^(dne|does ?not exist|doesn'?t exist|undefined|no limit|not defined|d\.n\.e\.?)$/i;
  var INF = /^\+?\s*(inf|infinity|∞|oo)$/i, NINF = /^-\s*(inf|infinity|∞|oo)$/i;
  // a unit after a number: "12 cm", "24 square cm", "24 sq. cm", "24 cm^2", "24 cm²", "8 cubic in", "55 mph", "3 m/s", "45°"
  var UW = '(?:mm|cm|dm|km|m|in|inch(?:es)?|ft|foot|feet|yd|yards?|mi|miles?|(?:milli|centi|kilo)?met(?:er|re)s?|mg|kg|g|(?:milli|kilo)?grams?|lbs?|pounds?|oz|ounces?|tons?|' +
    'ml|l|(?:milli)?lit(?:er|re)s?|gal(?:lons?)?|qts?|quarts?|pts?|pints?|cups?|tsp|tbsp|s|secs?|seconds?|mins?|minutes?|h|hrs?|hours?|days?|weeks?|months?|years?|yrs?|' +
    'degrees?\\s+(?:celsius|fahrenheit|c|f)|degrees?|deg|rad(?:ians?)?|cents?|¢|dollars?|units?|people|persons?|students?|mph|kph)';
  var UNITS = new RegExp('\\s*(?:(?:square|sq\\.?|cubic|cu\\.?)\\s*' + UW + '\\.?|' + UW + '\\.?\\s*(?:\\^\\s*\\(?\\s*[23]\\s*\\)?|[²³])|' + UW + '\\.?(?:\\s*(?:\\/|per)\\s*' + UW + '\\.?(?:\\s*(?:\\^\\s*2|²))?)?|°\\s*[fc]?)\\.?$', 'i');
  var DEG_UNIT = /^(°|deg|degrees?)$/i;
  function commaNum(s) { // "3,000" -> "3000", "1 000 000" -> "1000000" (only when the whole text is one number)
    if (/^[-+]?\s*\d{1,3}(,\d{3})+(\.\d+)?\s*%?$/.test(s)) return s.replace(/,/g, '');
    if (/^[-+]?\s*\d{1,3}( \d{3})+(\.\d+)?$/.test(s) && !/^\d+ \d+\/\d+$/.test(s)) return s.replace(/ /g, '');
    return s;
  }
  // drop a unit typed after a number: -> { s, unit } or null when there is no unit to drop
  function dropUnit(s) {
    var u = UNITS.exec(s);
    if (!u || u.index <= 0 || !/[\d).]\s*$/.test(s.slice(0, u.index))) return null;
    var rest = commaNum(s.slice(0, u.index).trim()), r = parse(rest, { mixed: true });
    if (!r.ok || hasVarNode(r.node)) return null;
    return { s: rest, unit: u[0].trim().replace(/\.$/, ''), r: r };
  }
  // the problem's own unit word typed after the number ("12 cookies", "15 J", "3 Ω" when p.unit is that word)
  function dropExpectedUnit(s, unit) {
    var w = unitPlain(unit); if (!w) return null;
    var forms = [w, w + 's', w + 'es', w.replace(/ies$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, '')].filter(function (x, i, a) { return x && a.indexOf(x) === i; })
      .sort(function (x, y) { return y.length - x.length; }).map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s*'); });
    var m = new RegExp('\\s*(' + forms.join('|') + ')\\.?$', w.length < 3 ? '' : 'i').exec(s);
    if (!m || m.index <= 0 || !/[\d).]\s*$/.test(s.slice(0, m.index))) return null;
    var rest = commaNum(s.slice(0, m.index).trim()), r = parse(rest, { mixed: true });
    if (!r.ok || hasVarNode(r.node)) return null;
    return { s: rest, unit: m[1], r: r };
  }

  // ---- units: is the unit typed after a number the one the problem expects?
  // The expected unit is p.unit (ctx.unit) when the problem has one; otherwise it is read from the question ("How many
  // grams …", "… in square feet?", "Convert … to inches."). With neither, a typed measurement unit must at least be one
  // the question uses (a question about feet doesn't take "24 m²"). Count words (apples, students), "units" and angle
  // units are never held against an answer. Synonyms match: cm = centimeters, cm² = sq cm = square centimeters,
  // mph = miles per hour = mi/h, ° = degrees, $ = dollars.
  var UDEF = [
    [/^(mm|millimet(er|re)s?)$/, 'mm', 'len'], [/^(cm|centimet(er|re)s?)$/, 'cm', 'len'], [/^(dm|decimet(er|re)s?)$/, 'dm', 'len'], [/^(m|met(er|re)s?)$/, 'm', 'len'],
    [/^(km|kilomet(er|re)s?)$/, 'km', 'len'], [/^(in|inch(es)?)$/, 'in', 'len'], [/^(ft|foot|feet)$/, 'ft', 'len'], [/^(yd|yds|yards?)$/, 'yd', 'len'], [/^(mi|miles?)$/, 'mi', 'len'],
    [/^(mg|milligrams?)$/, 'mg', 'mass'], [/^(g|grams?)$/, 'g', 'mass'], [/^(kg|kgs|kilograms?|kilos?)$/, 'kg', 'mass'], [/^(lbs?|pounds?)$/, 'lb', 'mass'], [/^(oz|ounces?)$/, 'oz', 'mass'], [/^tons?$/, 'ton', 'mass'],
    [/^(ml|millilit(er|re)s?)$/, 'ml', 'cap'], [/^(l|lit(er|re)s?)$/, 'l', 'cap'], [/^(gal|gals|gallons?)$/, 'gal', 'cap'], [/^(qts?|quarts?)$/, 'qt', 'cap'], [/^(pts?|pints?)$/, 'pt', 'cap'],
    [/^cups?$/, 'cup', 'cap'], [/^(fl\.? ?oz|fluid ounces?)$/, 'floz', 'cap'], [/^(tsp|teaspoons?)$/, 'tsp', 'cap'], [/^(tbsp|tablespoons?)$/, 'tbsp', 'cap'],
    [/^(s|secs?|seconds?)$/, 's', 'time'], [/^(mins?|minutes?)$/, 'min', 'time'], [/^(h|hrs?|hours?)$/, 'h', 'time'], [/^days?$/, 'day', 'time'], [/^(wks?|weeks?)$/, 'week', 'time'],
    [/^months?$/, 'month', 'time'], [/^(yrs?|years?)$/, 'year', 'time'],
    [/^(°|deg|degrees?)$/, 'deg', 'angle'], [/^(rad|radians?)$/, 'rad', 'angle'],
    [/^(°c|degrees? c(elsius)?|celsius)$/, 'degc', 'temp'], [/^(°f|degrees? f(ahrenheit)?|fahrenheit)$/, 'degf', 'temp'],
    [/^(¢|cents?)$/, 'cent', 'money'], [/^(\$|dollars?)$/, 'dollar', 'money'], [/^units?$/, 'unit', 'generic']
  ];
  var MEASURE = { len: 1, mass: 1, cap: 1, time: 1, temp: 1 };
  function unitPlain(u) { // "$\text{cm}^2$" -> "cm^2"
    return str(u).replace(/\$/g, '').replace(/\\(text|mathrm)\{([^{}]*)\}/g, '$2').replace(/\^\{?\\circ\}?/g, '°').replace(/\\[,;: ]/g, ' ').replace(/\\%/g, '%')
      .replace(/\^\{(\d)\}/g, '^$1').replace(/\\Omega/g, 'Ω').replace(/\\/g, '').replace(/\s+/g, ' ').trim();
  }
  function singular(w) { return w === 'people' ? 'person' : w.replace(/(ch|sh|x|ss)es$/, '$1').replace(/ies$/, 'y').replace(/([^s])s$/, '$1'); }
  function canonUnit(u) { // -> { k, parts: [{ base, dim, pow }], measure, generic, angle } or null
    var s = unitPlain(u).toLowerCase().replace(/\.$/, '').replace(/²/g, '^2').replace(/³/g, '^3');
    if (!s) return null;
    s = { mph: 'mi/h', kph: 'km/h', 'km/hr': 'km/h', mpg: 'mi/gal' }[s] || s;
    var parts = s.split(/\s*(?:\/|\bper\b)\s*/).map(function (p) {
      var pow = 1, m; p = p.trim().replace(/\.$/, '');
      if ((m = /^(square|sq\.?)\s*(.+)$/.exec(p))) { pow = 2; p = m[2]; } else if ((m = /^(cubic|cu\.?)\s*(.+)$/.exec(p))) { pow = 3; p = m[2]; }
      if ((m = /^(.+?)\s*\^\s*\(?\s*([23])\s*\)?$/.exec(p))) { pow = +m[2]; p = m[1]; }
      p = p.trim().replace(/\.$/, '');
      for (var i = 0; i < UDEF.length; i++) if (UDEF[i][0].test(p)) return { base: UDEF[i][1], dim: UDEF[i][2], pow: pow };
      return { base: singular(p), dim: 'count', pow: pow };
    });
    if (parts.some(function (p) { return !p.base; })) return null;
    return { k: parts.map(function (p) { return p.base + (p.pow > 1 ? '^' + p.pow : ''); }).join('/'), parts: parts,
      measure: parts.some(function (p) { return MEASURE[p.dim]; }), generic: parts.length === 1 && parts[0].dim === 'generic', angle: parts.length === 1 && parts[0].dim === 'angle' };
  }
  function unitName(u) { var s = unitPlain(u); return s.replace(/\^2/g, '²').replace(/\^3/g, '³'); }
  function sameUnit(U, E) {
    if (U.k === E.k) return true;
    if (U.generic || E.generic) return U.parts[0].pow === E.parts[0].pow || E.parts.length > 1;           // "24 square units"
    if (U.angle && E.parts.length === 1 && E.parts[0].dim === 'temp') return true;                           // "20°" for °C
    return false;
  }
  // units the question uses (in its words and its math): a set of base keys; single letters and "in" only after a number
  var QUW = new RegExp('(\\d\\s*|\\b)((?:square|sq\\.?|cubic|cu\\.?)\\s+)?(' + UW.slice(3, -1) + '|°\\s*[cf]?)(?![a-zA-Z])', 'gi');
  function questionText(q) {
    return str(q).replace(/<[^>]+>/g, ' ').replace(/\\\$/g, ' dollars ').replace(/\\(text|mathrm|textbf|textit)\{([^{}]*)\}/g, ' $2 ').replace(/\^\{?\\circ\}?/g, '°')
      .replace(/\\[,;: !]|~/g, ' ').replace(/\\(cdot|times|div)/g, ' ').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}$]/g, ' ').replace(/&[a-z]+;/g, ' ');
  }
  function questionUnits(q) {
    var t = questionText(q), out = {}, m; QUW.lastIndex = 0;
    while ((m = QUW.exec(t))) {
      var w = m[3], amb = /^(m|s|h|g|l|in|t|mi|min|pt|pts|deg|rad|cups?|days?)$/i.test(w);
      if (amb && !/\d/.test(m[1])) continue;
      var c = canonUnit(w); if (c) c.parts.forEach(function (p) { out[p.base] = 1; });
      if (/^(mph|kph)$/i.test(w)) { out.h = 1; out[/^m/i.test(w) ? 'mi' : 'km'] = 1; }
    }
    return out;
  }
  function askedUnit(q) { // the unit the question asks for, from its words: "How many grams", "in square feet?", "Convert … to inches."
    var t = questionText(q).replace(/\s+/g, ' ').trim(), m;
    var U = '((?:square |sq\\.? |cubic |cu\\.? )?[a-zA-Z°]+(?: per [a-zA-Z]+)?)';
    // "in X" counts only where the question ends or asks ("…, in meters?", "… in grams." at the very end), not in a
    // definition earlier on ("x in meters and t in seconds.")
    var pats = [new RegExp('\\bhow many ' + U, 'i'), new RegExp('\\bin ' + U + '\\s*\\)?\\s*(?:\\?|\\.?\\s*$)', 'i'), new RegExp('\\b(?:convert|change|rewrite|write|express)\\b[^?.]*\\bto ' + U + '\\s*(?:[?.]|$)', 'i')];
    for (var i = 0; i < pats.length; i++) {
      if (!(m = pats[i].exec(t))) continue;
      var c = canonUnit(m[1]); if (c && c.measure && c.parts.every(function (p) { return p.dim !== 'count'; })) return { c: c, name: m[1] };
    }
    return null;
  }
  // -> null when the typed unit is fine, else a short note
  function unitProblem(typed, ctx) {
    var U = canonUnit(typed); if (!U || U.angle || !ctx) return null;
    if (ctx.unit && unitPlain(ctx.unit) && !ctx.unitLoose) {
      var E = canonUnit(ctx.unit);
      if (!E || sameUnit(U, E) || unitPlain(ctx.unit) === '%' || (U.k === 'pt' && E.k === 'point')) return null;
      if (!U.measure && !E.measure && U.parts.every(function (p) { return p.dim === 'count'; })) return null; // "12 cookie" for "cookies"
      return 'Check the unit: the answer is in ' + unitName(ctx.unit) + '.';
    }
    if (!U.measure || typeof ctx.q !== 'string') return null;
    var A = ctx.unitLoose ? null : askedUnit(ctx.q); // a multi-part question may ask for different units in its parts
    if (A) return sameUnit(U, A.c) ? null : 'Check the unit: the question asks for ' + unitName(A.name) + '.';
    var Q = questionUnits(ctx.q), cu = ctx.unit ? canonUnit(ctx.unit) : null;
    if (cu) cu.parts.forEach(function (p) { Q[p.base] = 1; });
    var have = Object.keys(Q).filter(function (k) { return UDEF.some(function (d) { return d[1] === k && MEASURE[d[2]]; }); });
    if (!have.length || U.parts.some(function (p) { return Q[p.base]; })) return null;
    return 'Check the unit: the question uses ' + listOr(have) + '.';
  }

  function cleanInput(s) {
    s = str(s).trim().replace(/ /g, ' ').replace(/[−–—]/g, '-').replace(/\s+/g, ' ');
    s = s.replace(/\.$/, function (m, off) { return /\d\.$/.test(s) && !/\d\.\d+\.$/.test(s) ? m : ''; });
    return s;
  }
  function stripLabel(s) { // "x = 3" -> "3"; "y=" , "f(x) =", "x ≈"
    var m = /^\s*([a-zA-Zθα-ω]\w*(\s*\([^()]*\))?|[a-zA-Z]_\w+)\s*(=|≈)\s*([^=<>]*)$/.exec(s);
    return m ? m[4] : s;
  }
  function parse(s, opts) { return ML.parsePlain(s, opts); }
  function MONE() { return { k: 'n', v: new CAS.Q(-1n, 1n) }; }
  function negT(T) { return { k: '*', a: [MONE(), T] }; }
  function diffT(A, B) { return { k: '+', a: [A, negT(B)] }; }
  function substVar(node, name, rep) { // copy of a plain node with a variable replaced
    if (Array.isArray(node)) return node.map(function (x) { return substVar(x, name, rep); });
    if (!node || typeof node !== 'object') return node;
    if (node.t === 'var' && node.s === name) return rep;
    var o = {}; for (var k in node) o[k] = substVar(node[k], name, rep); return o;
  }
  function casTree(node) { return CAS.parse(ML.plainToCAS(node)); }
  function casOf(plain) { var r = parse(plain); if (!r.ok) throw new Error(r.err); return casTree(r.node); }
  function freeVars(tree) { return Object.keys(CAS.freeVars(tree)).filter(function (v) { return v !== '∞'; }); }
  function exactQ(tree) { // exact rational from a CAS tree, or null
    try { var s = CAS.simp(tree); if (s.k === 'n' && s.v instanceof CAS.Q) return s.v; } catch (e) { }
    return null;
  }
  function numVal(tree, env) {
    function ev(t) { var v = CAS.evalNum(t, Object.assign({ __complex: true }, env || {})); if (v && typeof v === 'object' && 're' in v) return Math.abs(v.im) < 1e-12 * Math.max(1, Math.abs(v.re)) ? v.re : { re: v.re, im: v.im }; return v; }
    try {
      var raw = tree, s = null;
      if (!env) { try { s = CAS.simp(tree); } catch (e0) { } }
      var v = s ? ev(s) : ev(raw);
      // exact arithmetic can blow up (a fraction to a large power): fall back to floating point on the original tree
      if (s && (typeof v !== 'number' || !isFinite(v)) && !(v && typeof v === 'object')) { var v2 = ev(raw); if (typeof v2 === 'number' ? isFinite(v2) : v2 && typeof v2 === 'object') v = v2; }
      return v;
    } catch (e) { try { return raw !== undefined && !env ? ev(raw) : NaN; } catch (e2) { return NaN; } }
  }
  function withRad(fn) { var sv = CAS.STATE.deg; CAS.STATE.deg = false; try { return fn(); } finally { CAS.STATE.deg = sv; } }

  // ===================================================================== science: scientific notation, SI units, significant figures
  function sciNorm(s) { // "3.0 x 10^8", "3.0 X 10^-8", "3.0⋅10^8" -> "3.0*10^8" (only before 10^)
    return s.replace(/(\d|\))\s*[xX×·⋅*]\s*10\s*\^/g, '$1*10^');
  }
  // units -> { d: [length, mass, time, current, temperature, amount, light], f: factor to SI base units }
  var SI_U = { // symbol: [dims, factor, prefixable]
    m: [[1, 0, 0, 0, 0, 0, 0], 1, 1], g: [[0, 1, 0, 0, 0, 0, 0], 1e-3, 1], s: [[0, 0, 1, 0, 0, 0, 0], 1, 1], A: [[0, 0, 0, 1, 0, 0, 0], 1, 1],
    K: [[0, 0, 0, 0, 1, 0, 0], 1, 1], mol: [[0, 0, 0, 0, 0, 1, 0], 1, 1], cd: [[0, 0, 0, 0, 0, 0, 1], 1, 1],
    N: [[1, 1, -2, 0, 0, 0, 0], 1, 1], J: [[2, 1, -2, 0, 0, 0, 0], 1, 1], W: [[2, 1, -3, 0, 0, 0, 0], 1, 1], Pa: [[-1, 1, -2, 0, 0, 0, 0], 1, 1],
    C: [[0, 0, 1, 1, 0, 0, 0], 1, 1], V: [[2, 1, -3, -1, 0, 0, 0], 1, 1], 'Ω': [[2, 1, -3, -2, 0, 0, 0], 1, 1], F: [[-2, -1, 4, 2, 0, 0, 0], 1, 1],
    T: [[0, 1, -2, -1, 0, 0, 0], 1, 1], Wb: [[2, 1, -2, -1, 0, 0, 0], 1, 1], H: [[2, 1, -2, -2, 0, 0, 0], 1, 1], Hz: [[0, 0, -1, 0, 0, 0, 0], 1, 1],
    S: [[-2, -1, 3, 2, 0, 0, 0], 1, 1], Bq: [[0, 0, -1, 0, 0, 0, 0], 1, 1], Gy: [[2, 0, -2, 0, 0, 0, 0], 1, 1], Sv: [[2, 0, -2, 0, 0, 0, 0], 1, 1],
    L: [[3, 0, 0, 0, 0, 0, 0], 1e-3, 1], l: [[3, 0, 0, 0, 0, 0, 0], 1e-3, 1], eV: [[2, 1, -2, 0, 0, 0, 0], 1.602176634e-19, 1], Wh: [[2, 1, -2, 0, 0, 0, 0], 3600, 1],
    bar: [[-1, 1, -2, 0, 0, 0, 0], 1e5, 1], cal: [[2, 1, -2, 0, 0, 0, 0], 4.184, 1], pc: [[1, 0, 0, 0, 0, 0, 0], 3.0856775814913673e16, 1],
    M: [[-3, 0, 0, 0, 0, 1, 0], 1000, 1], u: [[0, 1, 0, 0, 0, 0, 0], 1.66053906660e-27, 0], Da: [[0, 1, 0, 0, 0, 0, 0], 1.66053906660e-27, 1],
    min: [[0, 0, 1, 0, 0, 0, 0], 60, 0], h: [[0, 0, 1, 0, 0, 0, 0], 3600, 0], hr: [[0, 0, 1, 0, 0, 0, 0], 3600, 0], d: [[0, 0, 1, 0, 0, 0, 0], 86400, 0],
    yr: [[0, 0, 1, 0, 0, 0, 0], 31557600, 0], atm: [[-1, 1, -2, 0, 0, 0, 0], 101325, 0], mmHg: [[-1, 1, -2, 0, 0, 0, 0], 133.322387415, 0],
    torr: [[-1, 1, -2, 0, 0, 0, 0], 101325 / 760, 0], Cal: [[2, 1, -2, 0, 0, 0, 0], 4184, 0], AU: [[1, 0, 0, 0, 0, 0, 0], 1.495978707e11, 0],
    ly: [[1, 0, 0, 0, 0, 0, 0], 9.4607304725808e15, 0], rad: [[0, 0, 0, 0, 0, 0, 0], 1, 0], sr: [[0, 0, 0, 0, 0, 0, 0], 1, 0]
  };
  var SI_PRE = { Y: 1e24, Z: 1e21, E: 1e18, P: 1e15, T: 1e12, G: 1e9, M: 1e6, k: 1e3, h: 1e2, da: 1e1, d: 1e-1, c: 1e-2, m: 1e-3, 'μ': 1e-6, u: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15, a: 1e-18 };
  var SI_WORD = { newton: 'N', joule: 'J', watt: 'W', pascal: 'Pa', coulomb: 'C', volt: 'V', ohm: 'Ω', farad: 'F', tesla: 'T', weber: 'Wb', henry: 'H', henries: 'H',
    hertz: 'Hz', siemens: 'S', becquerel: 'Bq', gray: 'Gy', sievert: 'Sv', ampere: 'A', amp: 'A', kelvin: 'K', mole: 'mol', meter: 'm', metre: 'm', second: 's', sec: 's',
    gram: 'g', liter: 'L', litre: 'L', electronvolt: 'eV', calorie: 'cal', atmosphere: 'atm', minute: 'min', hour: 'h', day: 'd', year: 'yr', molar: 'M',
    parsec: 'pc', 'light-year': 'ly', lightyear: 'ly' };
  var SI_WPRE = { yotta: 'Y', zetta: 'Z', exa: 'E', peta: 'P', tera: 'T', giga: 'G', mega: 'M', kilo: 'k', hecto: 'h', deca: 'da', deci: 'd', centi: 'c', milli: 'm', micro: 'μ', nano: 'n', pico: 'p', femto: 'f', atto: 'a' };
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  function siToken(tok) { // "kN", "s^-2", "cm3", "Ω" -> { d, f } or null
    var m = /^([A-Za-zμΩ]+)(?:\^?\(?(-?\d+)\)?)?$/.exec(tok); if (!m) return null;
    var sym = m[1], pw = m[2] !== undefined ? +m[2] : 1, base = null, pre = 1;
    if (SI_U[sym]) base = SI_U[sym];
    else {
      var p2 = sym.slice(0, 2) === 'da' ? 'da' : sym.charAt(0), rest = sym.slice(p2.length);
      if (SI_PRE[p2] && SI_U[rest] && SI_U[rest][2]) { base = SI_U[rest]; pre = SI_PRE[p2]; }
    }
    if (!base || !pw) return null;
    return { d: base[0].map(function (x) { return x * pw; }), f: Math.pow(base[1] * pre, pw) };
  }
  function siUnit(u) {
    var s = unitPlain(u); if (!s || s.length > 60) return null;
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function (x) { return '^' + x.split('').map(function (c) { return SUP[c]; }).join(''); })
      .replace(/µ/g, 'μ').replace(/Ω/g, 'Ω').replace(/[·⋅*×.]/g, ' ').replace(/[−–]/g, '-').replace(/\s*\^\s*/g, '^');
    // words: "kilometers per hour", "newton meters", "joules per mole kelvin", "square meters", "meters squared"
    s = s.replace(/\bper\b/gi, '/').replace(/\b(square|sq)\s+([a-zμΩ]+)/gi, '$2^2').replace(/\b(cubic|cu)\s+([a-zμΩ]+)/gi, '$2^3')
      .replace(/([a-zμΩ]+)\s+squared\b/gi, '$1^2').replace(/([a-zμΩ]+)\s+cubed\b/gi, '$1^3');
    s = s.replace(/[A-Za-z][a-z-]+/g, function (w) {
      var lw = w.toLowerCase(), pre = '';
      for (var p in SI_WPRE) if (lw.indexOf(p) === 0 && lw.length > p.length + 1) { var r = lw.slice(p.length); if (SI_WORD[r] || SI_WORD[r.replace(/s$/, '')] || SI_WORD[r.replace(/es$/, '')]) { pre = SI_WPRE[p]; lw = r; } break; }
      var sym = SI_WORD[lw] || SI_WORD[lw.replace(/s$/, '')] || (/ies$/.test(lw) ? SI_WORD[lw] : null) || SI_WORD[lw.replace(/es$/, '')];
      return sym ? pre + sym : w;
    });
    s = s.replace(/[()]/g, ' ').trim(); if (!s) return null;
    var segs = s.split('/'), out = { d: [0, 0, 0, 0, 0, 0, 0], f: 1 }, any = false;
    for (var i = 0; i < segs.length; i++) {
      var toks = segs[i].trim().split(/\s+/).filter(Boolean); if (!toks.length) { if (i === 0 && segs.length > 1 && /^1?$/.test(segs[0].trim())) continue; return null; }
      for (var j = 0; j < toks.length; j++) {
        if (i === 0 && toks[j] === '1' && segs.length > 1) continue; // "1/s"
        var t = siToken(toks[j]); if (!t) return null; any = true;
        for (var k = 0; k < 7; k++) out.d[k] += i ? -t.d[k] : t.d[k];
        out.f = i ? out.f / t.f : out.f * t.f;
      }
    }
    return any ? out : null;
  }
  function rel(a, b, t) { return Math.abs(a - b) <= t * Math.max(Math.abs(a), Math.abs(b)); } // relative (no floor at 1)
  function siSame(a, b) { return a.d.join() === b.d.join() && rel(a.f, b.f, 1e-9); }
  function oldUnitKnown(u) { var c = canonUnit(u); return !!c && c.parts.every(function (p) { return p.dim !== 'count'; }); }
  // a number followed by a science unit the word list doesn't know ("12 kN", "3.0e8 m/s", "1.6×10^-19 C", "3 ohms")
  function dropSIUnit(s) {
    for (var i = 1; i < s.length; i++) {
      if (!/[A-Za-zμµΩΩ]/.test(s.charAt(i)) || !/[\d.)\s]/.test(s.charAt(i - 1))) continue;
      var head = s.slice(0, i).trim(), tail = s.slice(i).trim(), si = siUnit(tail);
      if (!si || !head) continue;
      var r = parse(commaNum(head), { mixed: true });
      if (!r.ok || hasVarNode(r.node)) continue;
      return { s: head, unit: tail, r: r, si: si };
    }
    return null;
  }
  // the unit check for science units (null: the old word list decides)
  function siUnitProblem(typed, ctx) {
    if (!ctx || !ctx.unit || !unitPlain(ctx.unit) || ctx.unitLoose) return null;
    var X = siUnit(ctx.unit), U = siUnit(typed); if (!X || !U) return null;
    if (oldUnitKnown(typed) && oldUnitKnown(ctx.unit)) return siSame(U, X) ? { ok: true } : null; // the word list's own note (mL = cm³ too)
    if (siSame(U, X)) return { ok: true };
    return { ok: false, msg: 'Check the unit: the answer is in ' + unitName(ctx.unit) + '.', U: U, X: X };
  }
  // significant figures of a typed decimal ("3.00e8", "0.00120", "1200", "1.20*10^-3") -> { min, max, n, d (BigInt), neg } or null
  function sigInfo(text) {
    var t = str(text).replace(/\s+/g, '').replace(/[×·⋅]/g, '*'), m = /^([-+]?)(\d*\.?\d*)(?:[eE]([-+]?\d+)|\*10\^\(?([-+]?\d+)\)?)?$/.exec(t);
    if (!m || !/\d/.test(m[2])) return null;
    var mant = m[2], ex = +(m[3] || m[4] || 0), dot = mant.indexOf('.'), digits = mant.replace('.', ''), lead = digits.replace(/^0+/, '');
    var frac = dot >= 0 ? mant.length - dot - 1 : 0, min, max;
    if (!lead) { min = 1; max = Math.max(1, frac); }
    else if (dot >= 0) { min = max = lead.length; }
    else { max = lead.length; min = lead.replace(/0+$/, '').length; }
    var n = BigInt(digits || '0'), d = 1n, e = ex - frac;
    if (e >= 0) n *= 10n ** BigInt(e); else d = 10n ** BigInt(-e);
    return { min: min, max: max, n: n, d: d, neg: m[1] === '-' };
  }
  function roundSigQ(n0, d0, sf) { // the rational n0/d0 (BigInt, d0 > 0) rounded to sf significant figures -> { n, d, e } (e = power of 10 of the first digit)
    var neg = n0 < 0n, a = neg ? -n0 : n0; if (a === 0n) return { n: 0n, d: 1n, e: 0 };
    var e = String(a).length - String(d0).length;
    while (e > -400 && (e >= 0 ? 10n ** BigInt(e) * d0 > a : d0 > a * 10n ** BigInt(-e))) e--;
    while (e < 400 && (e + 1 >= 0 ? 10n ** BigInt(e + 1) * d0 <= a : d0 <= a * 10n ** BigInt(-(e + 1)))) e++;
    var k = sf - 1 - e, num = k >= 0 ? a * 10n ** BigInt(k) : a, den = k >= 0 ? d0 : d0 * 10n ** BigInt(-k);
    var r = (2n * num + den) / (2n * den); // round half away from zero
    var on = r, od = 1n; if (k >= 0) od = 10n ** BigInt(k); else on = r * 10n ** BigInt(-k);
    return { n: neg ? -on : on, d: od, e: e };
  }
  function sciText(q, sf) { // a rounded value with sf significant figures: "3.00 × 10^8", "24.5", "0.00120"
    var neg = q.n < 0n, a = neg ? -q.n : q.n, e = q.e, digits;
    // the sf digits: a/d * 10^(sf-1-e)
    var k = sf - 1 - e, v = k >= 0 ? a * 10n ** BigInt(k) / q.d : a / (q.d * 10n ** BigInt(-k)); digits = String(v);
    if (digits.length > sf) { digits = digits.slice(0, sf); e++; } // 9.99 -> 10.0
    var out;
    if (e >= 5 || e <= -4 || sf < e + 1) out = digits.charAt(0) + (sf > 1 ? '.' + digits.slice(1) : '') + ' × 10^' + e;
    else if (e >= sf - 1) out = digits + '0'.repeat(e - sf + 1);
    else if (e >= 0) out = digits.slice(0, e + 1) + '.' + digits.slice(e + 1);
    else out = '0.' + '0'.repeat(-e - 1) + digits;
    return (neg ? '-' : '') + out;
  }
  function canonQ(C) { // exact rational of a canonical number, else one from its float
    if (C.q) return { n: C.q.n, d: C.q.d };
    if (typeof C.val !== 'number' || !isFinite(C.val)) return null;
    var Q0 = ML.Q.from(Number(C.val.toPrecision(15))); return { n: Q0.n, d: Q0.d };
  }
  function pow10Off(lv, cv, rt) { // lv = cv × 10^k for a whole k ≠ 0 (within rt)
    if (!lv || !cv || typeof lv !== 'number' || typeof cv !== 'number' || (lv < 0) !== (cv < 0)) return false;
    var k = Math.round(Math.log10(lv / cv)); if (!k || Math.abs(k) > 30) return false;
    return Math.abs(lv - cv * Math.pow(10, k)) <= (rt || 1e-9) * Math.abs(cv * Math.pow(10, k));
  }

  // ===================================================================== reading a single number
  // -> { ok, node, tree, val (float or complex), q (exact Q or null), kind: int|dec|frac|mixed|expr|inf|ninf|dne, info }
  function readNumber(raw, spec, ctx) {
    spec = spec || {};
    var s = cleanInput(raw);
    if (!s) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    s = stripLabel(s);
    if (DNE.test(s)) return { ok: true, kind: 'dne' };
    if (INF.test(s)) return { ok: true, kind: 'inf', val: Infinity };
    if (NINF.test(s)) return { ok: true, kind: 'ninf', val: -Infinity };
    var pct = false;
    if (spec.pct && /%\s*$/.test(s)) { s = s.replace(/\s*%\s*$/, ''); pct = true; }
    s = s.replace(/^\s*(-?)\s*\\?\$\s*/, '$1').replace(/^(-?)\$/, '$1');            // $5.25
    s = commaNum(s);                                                                  // 1,000
    s = sciNorm(s);                                                                   // 3.0 x 10^8
    var r = parse(s, { mixed: true }), unit = '', si = null, numText = s;
    if (!r.ok || hasVarNode(r.node) || r.node.t === 'seq' || r.node.t === 'tuple') { // "12 cm", "30°", "3,000 g": drop a unit after the number
      var du = dropUnit(s) || (ctx && ctx.unit ? dropExpectedUnit(s, ctx.unit) : null) || dropSIUnit(s); if (du) { r = du.r; unit = du.unit; si = du.si || null; numText = du.s; }
    }
    if (!r.ok) return { ok: false, invalid: true, msg: r.err };
    var node = r.node;
    if (node.t === 'rel' || node.t === 'seq' || node.t === 'tuple' || node.t === 'set' || node.t === 'mat' || node.t === 'list') return { ok: false, invalid: true, msg: 'Type just one number.' };
    var tree;
    try { tree = casTree(node); } catch (e) { return { ok: false, invalid: true, msg: 'I couldn\'t read that.' }; }
    var fv = freeVars(tree);
    if (fv.length) return { ok: false, invalid: false, letters: fv, node: node, msg: 'Type a number (no letters).' };
    var val = withRad(function () { return numVal(tree); });
    var q = exactQ(tree);
    return { ok: true, node: node, tree: tree, val: val, q: q, kind: kindOf(node), pctTyped: pct, unit: unit, deg: DEG_UNIT.test(unit), text: stripLabel(numText), si: si };
  }
  function unNeg(n) { var neg = false; while (n && (n.t === 'neg' || n.t === 'paren')) { if (n.t === 'neg') neg = !neg; n = n.a; } return { n: n, neg: neg }; }
  function kindOf(node) {
    var u = unNeg(node), n = u.n;
    if (n.t === 'num') return /e/i.test(n.s) ? 'sci' : /\./.test(n.s) ? 'dec' : 'int';
    if (n.t === 'mixed') return 'mixed';
    if (n.t === 'mul' && n.f.length === 2 && n.f[1].op === '/') {
      var a = unNeg(n.f[0].x), b = unNeg(n.f[1].x);
      if (a.n.t === 'num' && b.n.t === 'num' && /^\d+$/.test(a.n.s) && /^\d+$/.test(b.n.s)) return 'frac';
    }
    if (n.t === 'pct') return 'pct';
    return 'expr';
  }
  function fracParts(node) { // for kind frac: [n, d] BigInt (unsigned)
    var u = unNeg(node), n = u.n; return [big(unNeg(n.f[0].x).n.s), big(unNeg(n.f[1].x).n.s)];
  }
  function mixedParts(node) { var n = unNeg(node).n; return [big(n.w), big(n.n), big(n.d)]; }

  // ---- "simplest" violations of a parsed number/expression (a set of codes)
  // What "simplest form" means (each rule applies only when the expected answer itself doesn't break it):
  //   numbers   fractions in lowest terms and not over 1; no arithmetic left between numbers (3+4, 2*3, 2^3, |-5|, 4!);
  //             roots simplified (sqrt(12), sqrt(16), sqrt(3/4), cbrt(16)) and none in a denominator; no sin, cos, arccos,
  //             ln, log … of a number left unevaluated (sin(pi/6), arccos(1/2), ln(e))
  //   powers    no power of a product or quotient ((2x^3)^4, (x^2y^3)^3, (x/y)^2, (8x^6)^(1/3)), no power of a power, no
  //             base used twice in a product (x^2*x^3, (7w^12)(6w^10)) or above and below the fraction bar (x^5/x^2), no
  //             exponent 0 or 1, positive exponents only (1/x^3 rather than x^(-3))
  //   fractions no fraction inside a fraction; one fraction rather than a sum with a letter in a denominator (1 - 4/x)
  //   sums      like terms combined (in exprFormMsg); no a(b + c) left beside other terms (2(x+3) + 4)
  // Ways of writing that are all fine: 2x^2 = 2*x^2 = 2x² = x^2*2, x/2 = (1/2)x, sqrt(x) = x^(1/2), 2(x^2).
  var FAMILY = { sin: 'trig', cos: 'trig', tan: 'trig', sec: 'trig', csc: 'trig', cot: 'trig', arcsin: 'inv', arccos: 'inv', arctan: 'inv', arcsec: 'inv', arccsc: 'inv',
    arccot: 'inv', asin: 'inv', acos: 'inv', atan: 'inv', sinh: 'hyp', cosh: 'hyp', tanh: 'hyp', sech: 'hyp', csch: 'hyp', coth: 'hyp', ln: 'log', log: 'log' };
  function isLit(n) { var u = unNeg(n).n; return u.t === 'num' || u.t === 'mixed' || (u.t === 'mul' && kindOf(u) === 'frac'); }
  function isIntLitNode(n) { var u = unNeg(n).n; return u.t === 'num' && /^\d+$/.test(u.s); }
  function flatFactors(n, inv, out) { // a product through parentheses and signs -> [{ x, den }]
    out = out || []; n = unNeg(n).n;
    if (n.t === 'mul' && kindOf(n) !== 'frac') { n.f.forEach(function (f) { flatFactors(f.x, f.op === '/' ? !inv : inv, out); }); return out; }
    out.push({ x: n, den: !!inv }); return out;
  }
  function expInfo(e) { // a literal exponent as p/q (signed), or null
    var u = unNeg(e), n = u.n, sg = u.neg ? -1 : 1;
    if (n.t === 'num' && /^\d+$/.test(n.s)) return { p: sg * Number(n.s), q: 1 };
    if (n.t === 'num' && /^\d*\.\d+$/.test(n.s)) { var Qd = ML.Q.from(n.s); return { p: sg * Qd.num(), q: Qd.den() }; }
    if (n.t === 'mul' && kindOf(n) === 'frac') { var fp = fracParts(n); return { p: sg * Number(fp[0]), q: Number(fp[1]) }; }
    return null;
  }
  function perfectPowFactor(k, q) { for (var d = 2; Math.pow(d, q) <= k; d++) if (k % Math.pow(d, q) === 0) return true; return false; }
  function baseKey(x) { var b = x.t === 'pow' ? unNeg(x.b).n : x; if (b.t === 'var') return 'v:' + b.s; if (b.t === 'const' && (b.s === 'pi' || b.s === 'e')) return 'c:' + b.s; return null; }
  function powOfProduct(n) { // (2x^3)^4, (x^2y^3)^3, (-x)^2, (x/y)^2, (8x^6)^(1/3)
    var bu = unNeg(n.b), b = bu.n, e = expInfo(n.e);
    if (!e || (e.p === 1 && e.q === 1)) return false;
    if (!((b.t === 'mul' && kindOf(b) !== 'frac') || (bu.neg && (b.t === 'var' || b.t === 'pow')))) return false;
    var fs = flatFactors(b);
    if (fs.some(function (f) { return f.x.t === 'sum'; }) || !fs.some(function (f) { return hasVarNode(f.x); })) return false;
    if (e.q === 1) return true;
    // a root of a product counts only when something comes out of it, as in (8x^6)^(1/3) = 2x^2
    return (bu.neg && e.q % 2 === 1) || fs.some(function (f) {
      if (isIntLitNode(f.x)) return perfectPowFactor(Number(unNeg(f.x).n.s), e.q);
      if (f.x.t === 'pow') { var ei = expInfo(f.x.e); return !!ei && ei.q === 1 && Math.abs(ei.p) >= e.q && ei.p % e.q === 0; }
      return false;
    });
  }
  function divInside(n, litToo) { // a division somewhere in n (not inside a function or an exponent)
    var f = false;
    (function w(x) {
      if (!x || f) return;
      if (x.t === 'paren' || x.t === 'neg') return w(x.a);
      if (x.t === 'sum') return x.terms.forEach(function (t) { w(t.x); });
      if (x.t === 'mul') { if (kindOf(x) === 'frac') { if (litToo) f = true; return; } if (x.f.some(function (g) { return g.op === '/'; })) { f = true; return; } x.f.forEach(function (g) { w(g.x); }); return; }
      if (x.t === 'pow') return w(x.b);
      if (x.t === 'mixed' && litToo) f = true;
    })(n);
    return f;
  }
  function violations(node) {
    var out = {};
    function walk(n, inDen) {
      if (!n || typeof n !== 'object') return;
      switch (n.t) {
        case 'mixed': if (gcdB(big(n.n), big(n.d)) !== 1n) out.lowest = 1; if (big(n.n) >= big(n.d)) out.improperMixed = 1; return;
        case 'sum': {
          if (n.terms.every(function (t) { return isLit(t.x); })) out.arith = 1;
          var ts = flatTerms(n);
          if (ts.length > 1) {
            if (ts.some(function (t) { var u = unNeg(t).n; return u.t === 'mul' && kindOf(u) !== 'frac' && u.f.some(function (g) { return g.op === '/' && hasVarNode(g.x); }); })) out.sumFrac = 1;
            if (ts.some(function (t) { var u = unNeg(t); if (u.n.t === 'sum') return true; if (u.n.t !== 'mul') return false; var nf = u.n.f.filter(function (g) { return g.op !== '/'; }); return nf.length > 1 && nf.some(function (g) { return isSumLike(g.x); }); })) out.distribute = 1;
          }
          n.terms.forEach(function (t) { walk(t.x, inDen); }); return;
        }
        case 'mul': {
          if (kindOf(n) === 'frac') { var p = fracParts(n); if (gcdB(p[0], p[1]) !== 1n) out.lowest = 1; if (p[1] === 1n) out.overOne = 1; return; }
          var fl = flatFactors(n), nl = 1n, dl = 1n, seen = {}, lits = 0, same = false;
          fl.forEach(function (f) {
            var u = unNeg(f.x).n;
            if (!f.den && isLit(f.x)) lits++;
            if (u.t === 'num' && /^\d+$/.test(u.s)) { if (f.den) { dl *= big(u.s); if (u.s === '1') out.overOne = 1; } else nl *= big(u.s); }
            var k = baseKey(f.x);
            if (k) { var side = f.den ? 'd' : 'n', other = f.den ? 'n' : 'd'; if (seen[k + side]) { out.sameBase = 1; same = true; } if (seen[k + other]) out.cancel = 1; seen[k + side] = 1; }
            if (f.den && (divInside(f.x, true) || hasRoot(f.x))) { if (hasRoot(f.x)) out.rootDen = 1; else out.nestedFrac = 1; }
            if (!f.den && n.f.some(function (g) { return g.op === '/'; }) && divInside(f.x, false)) out.nestedFrac = 1;
          });
          if (lits >= 2) out.arith = 1;
          if (lits >= 2 && same) out.monoProd = 1;
          if (dl > 1n && nl > 1n && gcdB(nl, dl) > 1n) out.lowest = 1;
          n.f.forEach(function (f) { walk(f.x, inDen || f.op === '/'); });
          if (n.f.length > 2 && n.f.filter(function (f) { return f.op === '/'; }).length && n.f.every(function (f) { return isLit(f.x); })) out.arith = 1;
          return;
        }
        case 'pow': {
          if (isLit(n.b) && isLit(n.e)) out.arith = 1;
          var eu = unNeg(n.e);
          if (eu.n.t === 'num' && ((eu.n.s === '1' && !eu.neg) || eu.n.s === '0')) out.trivialPow = 1;
          if (powOfProduct(n)) out.powProd = 1;
          var bb = unNeg(n.b).n; if (bb.t === 'pow' && expInfo(n.e) && expInfo(bb.e)) out.powPow = 1;
          var ex = expInfo(n.e); if (ex && ex.p < 0 && hasVarNode(n.b)) out.negExp = 1;
          walk(n.b, inDen); walk(n.e, false); return;
        }
        case 'fn': {
          var nm = n.name, a0 = n.args[0], a = a0 ? unNeg(a0).n : null;
          if (nm === 'sqrt' && n.args.length === 1) {
            if (a.t === 'num' && /^\d+$/.test(a.s)) { var k = Number(a.s), r = ML.util.simplifyRadical(k); if (k < 2 || r[0] > 1) out.radical = 1; }
            else if (isLit(a0)) out.radical = 1;
            if (inDen) out.rootDen = 1;
          }
          var idx = nm === 'cbrt' ? 3 : (nm === 'root' || nm === 'nthroot') && n.args.length === 2 && isIntLitNode(n.args[1]) ? Number(unNeg(n.args[1]).n.s) : 0;
          if (idx > 1 && a) { if (a.t === 'num' && /^\d+$/.test(a.s)) { if (Number(a.s) < 2 || perfectPowFactor(Number(a.s), idx)) out.radical = 1; } else if (isLit(a0)) out.radical = 1; if (inDen) out.rootDen = 1; }
          if (FAMILY[nm] && n.args.every(function (x) { return !hasVarNode(x); }) && !(n.base && hasVarNode(n.base))) {
            var pi = n.pw ? expInfo(n.pw) : null; // sin^(-1)(x) is arcsin
            out['fn:' + (pi && pi.p === -1 && pi.q === 1 && FAMILY[nm] === 'trig' ? 'inv' : FAMILY[nm])] = 1;
          }
          if (nm === 'abs' && isLit(a0)) out.arith = 1;
          n.args.forEach(function (x) { walk(x, inDen); }); return;
        }
        case 'neg': if (n.a.t === 'neg') out.arith = 1; walk(n.a, inDen); return;
        case 'paren': walk(n.a, inDen); return;
        case 'pct': walk(n.a, inDen); return;
        case 'fact': if (isLit(n.a)) out.arith = 1; return;
        case 'abs': if (isLit(n.a)) out.arith = 1; walk(n.a, inDen); return;
        default: return;
      }
    }
    walk(node, false);
    return out;
  }
  function hasRoot(n) { var f = false; (function w(x) { if (!x || typeof x !== 'object' || f) return; if (x.t === 'fn' && (x.name === 'sqrt' || x.name === 'cbrt' || x.name === 'root' || x.name === 'nthroot')) f = true; if (x.t === 'pow' && unNeg(x.e).n.t === 'mul') f = true; ['a', 'b', 'e', 'x'].forEach(function (k) { if (x[k]) w(x[k]); }); (x.terms || []).forEach(function (t) { w(t.x); }); (x.f || []).forEach(function (t) { w(t.x); }); (x.args || []).forEach(w); })(n); return f; }
  var VMSG = { lowest: 'Equal, but not in lowest terms.', overOne: 'Equal, but write it without the denominator of 1.', arith: 'Equal, but finish the arithmetic.',
    radical: 'Equal, but simplify the root.', rootDen: 'Equal, but take the root out of the denominator (rationalize it).', improperMixed: 'Equal, but the fraction part of a mixed number should be less than 1.',
    trivialPow: 'Equal, but simplify the exponent of 1 or 0.', 'fn:trig': 'Equal, but find the value: no sin, cos or tan should be left.',
    'fn:inv': 'Equal, but give the angle itself: no arcsin, arccos or arctan should be left.', 'fn:log': 'Equal, but evaluate the logarithm.', 'fn:hyp': 'Equal, but evaluate it to a number.',
    powProd: 'Equal, but use the exponent rules: raise each factor to the power.', powPow: 'Equal, but simplify the power of a power (multiply the exponents).',
    sameBase: 'Equal, but combine the powers of the same base (add the exponents).', cancel: 'Equal, but cancel the common factors.',
    negExp: 'Equal, but write it with positive exponents (like 1/x^3).', nestedFrac: 'Equal, but simplify the fraction inside the fraction.',
    sumFrac: 'Equal, but combine it into one fraction.', distribute: 'Equal, but distribute and combine like terms.',
    monoProd: 'Equal, but multiply it out into one term: multiply the numbers and add the exponents.' };
  var VORDER = ['lowest', 'improperMixed', 'fn:inv', 'fn:trig', 'fn:log', 'fn:hyp', 'radical', 'rootDen', 'overOne', 'monoProd', 'arith', 'trivialPow', 'powProd', 'powPow', 'sameBase', 'cancel', 'negExp',
    'nestedFrac', 'sumFrac', 'distribute'];
  function newViolation(learnerNode, canonNode, only) {
    var a = violations(learnerNode), b = canonNode ? violations(canonNode) : {};
    for (var i = 0; i < VORDER.length; i++) { var k = VORDER[i]; if (a[k] && !b[k] && (!only || only.indexOf(k) >= 0)) return k; }
    return null;
  }
  function fnViolation(learnerNode, canonNode) { return newViolation(learnerNode, canonNode, ['fn:inv', 'fn:trig', 'fn:log', 'fn:hyp']); }

  // ===================================================================== numbers
  function canonNum(spec) {
    var v = str(spec.v).trim();
    if (DNE.test(v)) return { kind: 'dne' };
    if (INF.test(v)) return { kind: 'inf', val: Infinity };
    if (NINF.test(v)) return { kind: 'ninf', val: -Infinity };
    var r = parse(v, { mixed: true }); if (!r.ok) throw new Error('Bad answer value "' + v + '": ' + r.err);
    var tree = casTree(r.node);
    return { kind: kindOf(r.node), node: r.node, tree: tree, val: withRad(function () { return numVal(tree); }), q: exactQ(tree) };
  }
  function roundQ(c, dp) { // canonical rounded to dp places -> { q, s }
    var Qg = ML.Q, s;
    if (c.q) s = Qg(c.q.n, c.q.d).toDec(dp);
    else s = Qg.from(Number(c.val.toFixed(Math.min(dp + 6, 20)))).toDec(dp);
    return { s: s, q: Qg.from(s) };
  }
  function sameNum(L, C) { // exact when both rational, else numeric
    if (L.q && C.q) return L.q.n * C.q.d === C.q.n * L.q.d;
    return valEq(L.val, C.val);
  }
  function negOf(C) { return { q: C.q ? new CAS.Q(-C.q.n, C.q.d) : null, val: typeof C.val === 'number' ? -C.val : { re: -cx(C.val).re, im: -cx(C.val).im } }; }
  function checkNum(spec, answer, ctx) {
    var C = canonNum(spec), L = readNumber(answer, spec, ctx);
    if (!L.ok) return L.letters ? { ok: false, msg: L.msg } : { ok: false, invalid: !!L.invalid, msg: L.msg };
    // a right number with a unit the problem doesn't use ("24 cm" for square cm, "3 g" for kg) is not right yet
    // science units (N, kPa, J/(mol·K) …): a different unit is never right; say so first, and say when only the unit is off
    var siP = L.unit ? siUnitProblem(L.unit, ctx) : null, uBad = siP ? null : L.unit ? unitProblem(L.unit, ctx) : null;
    if (siP && !siP.ok) {
      var conv = siP.U.d.join() === siP.X.d.join() && typeof L.val === 'number' && typeof C.val === 'number' && C.val !== 0 && rel(L.val * siP.U.f / siP.X.f, C.val, spec.rtol ? Math.max(Math.abs(Number(spec.rtol)), 1e-6) : 0.005);
      return { ok: false, msg: conv ? 'Check the unit: that’s the right amount in ' + unitName(L.unit) + ', but the answer should be in ' + unitName(ctx.unit) + '.' : siP.msg, form: true, unit: true };
    }
    function right() { return uBad ? { ok: false, msg: uBad, form: true, unit: true } : { ok: true }; }
    if (C.kind === 'dne' || L.kind === 'dne') return { ok: C.kind === L.kind, msg: C.kind === 'dne' ? undefined : undefined };
    if (C.kind === 'inf' || C.kind === 'ninf' || L.kind === 'inf' || L.kind === 'ninf') {
      if (C.kind === L.kind) return { ok: true };
      if ((C.kind === 'inf' && L.kind === 'ninf') || (C.kind === 'ninf' && L.kind === 'inf')) return { ok: false, msg: 'Right size, wrong sign.' };
      return { ok: false };
    }
    if (typeof L.val === 'number' && !isFinite(L.val)) return { ok: false, invalid: true, msg: 'That isn\'t a number we can use (check for dividing by 0).' };
    if (spec.satisfies) return checkSatisfies(spec.satisfies, L, right);
    var dp = spec.dp, form = spec.form || (dp !== undefined ? 'dec' : 'any');
    // percent typed where a plain number is expected: "25%" -> 0.25 already handled by the parser
    if (dp !== undefined) {
      var R = roundQ(C, dp);
      var Lq = L.q ? ML.Q(L.q.n, L.q.d) : (typeof L.val === 'number' ? ML.Q.from(Number(L.val.toPrecision(15))) : null);
      if (L.kind === 'frac' || L.kind === 'mixed') { if (Lq && Lq.eq(R.q)) return { ok: false, msg: 'Equal, but write it as a decimal.' }; }
      if (Lq && Lq.eq(R.q)) return right();
      var places = L.kind === 'dec' ? (unNeg(L.node).n.s.split('.')[1] || '').length : 0;
      if (Lq && (sameNum(L, C) || (places > dp && typeof L.val === 'number' && Math.abs(L.val - C.val) < Math.pow(10, -dp)))) return { ok: false, msg: 'Round it to ' + dp + ' decimal place' + (dp === 1 ? '' : 's') + '.' };
      var ulp = Math.pow(10, -dp);
      if (Lq && typeof L.val === 'number' && Math.abs(L.val - R.q.toNumber()) <= ulp * 1.01 + 1e-12) return { ok: false, msg: 'Check your rounding: we want ' + dp + ' decimal place' + (dp === 1 ? '' : 's') + '.' };
      if (Lq && typeof L.val === 'number' && R.q.toNumber() !== 0 && relEq(L.val, -R.q.toNumber())) return { ok: false, msg: 'Right size, wrong sign.' };
      return { ok: false };
    }
    if (form === 'sf' && spec.sf) return checkSF(spec, L, C, right);
    if (spec.rtol !== undefined) {
      var rt = Math.abs(Number(spec.rtol)), lv = L.val, cv = C.val;
      if (typeof lv === 'number' && typeof cv === 'number') {
        if (Math.abs(lv - cv) <= rt * Math.abs(cv) + 1e-300 || (spec.tol !== undefined && Math.abs(lv - cv) <= Number(spec.tol) + 1e-12)) return right();
        if (cv !== 0 && Math.abs(lv + cv) <= rt * Math.abs(cv)) return { ok: false, msg: 'Right size, wrong sign.' };
        if (pow10Off(lv, cv, rt)) return { ok: false, msg: 'Check the power of ten.' };
      }
      return { ok: false };
    }
    if (spec.tol !== undefined) {
      var tol = Number(spec.tol);
      if (typeof L.val === 'number' && typeof C.val === 'number' && Math.abs(L.val - C.val) <= tol + 1e-12) return right();
      if (typeof L.val === 'number' && typeof C.val === 'number' && C.val !== 0 && Math.abs(L.val + C.val) <= tol + 1e-12) return { ok: false, msg: 'Right size, wrong sign.' };
      return { ok: false };
    }
    if (!sameNum(L, C)) return { ok: false, msg: angleMsg(L, C) || wrongNumMsg(L, C, spec) };
    // equal value: a sin, arccos, ln … of a number left unevaluated is not an answer yet (unless the answer has one too)
    var fv = L.node && fnViolation(L.node, C.node); if (fv) return { ok: false, msg: VMSG[fv], form: true };
    // equal value: check the form
    var fm = formMsg(form, L, C);
    return fm ? { ok: false, msg: fm, form: true } : right();
  }
  // ---- satisfies: any number in a range described by data (see the header: ANY VALUE THAT WORKS)
  function satBound(x) { // a bound -> { val, q } (q exact when rational), or null when absent
    if (x === undefined || x === null || str(x).trim() === '') return null;
    var r = parse(str(x).trim(), { mixed: true }); if (!r.ok) throw new Error('Bad satisfies bound "' + x + '": ' + r.err);
    var t = casTree(r.node); return { val: withRad(function () { return numVal(t); }), q: exactQ(t) };
  }
  function satCmp(L, B) { // the sign of (learner's value − bound)
    if (L.q && B.q) { var d = L.q.n * B.q.d - B.q.n * L.q.d; return d > 0n ? 1 : d < 0n ? -1 : 0; }
    if (typeof B.val !== 'number' || !isFinite(B.val)) throw new Error('satisfies: a bound is not a real number');
    return relEq(L.val, B.val, 1e-12) ? 0 : L.val > B.val ? 1 : -1;
  }
  function satisfiesWhy(S, L) { // null when L is in the range; else 'nan', 'int', 'low' or 'high'
    if (typeof L.val !== 'number' || !isFinite(L.val)) return 'nan';
    if (S.int && !(L.q ? L.q.d === 1n : Number.isInteger(L.val))) return 'int';
    var lo = satBound(S.min), hi = satBound(S.max), c;
    if (lo) { c = satCmp(L, lo); if (c < 0 || (c === 0 && S.minOpen)) return 'low'; }
    if (hi) { c = satCmp(L, hi); if (c > 0 || (c === 0 && S.maxOpen)) return 'high'; }
    return null;
  }
  function checkSatisfies(S, L, right) {
    var why = satisfiesWhy(S, L);
    if (!why) return right();
    if (why === 'int') return { ok: false, msg: 'Give a whole number.' };
    if (why === 'low') return { ok: false, msg: S.msgLow || (S.minOpen && /^\s*0\s*$/.test(str(S.min)) && !(L.val > 0) ? 'It has to be positive.' : 'That one doesn’t work: it is too small.') };
    if (why === 'high') return { ok: false, msg: S.msgHigh || 'That one doesn’t work: it is too large.' };
    return { ok: false };
  }
  function satisfiesNote(S) { // ", or any whole number $\ge 101$" for answerShow
    var lo = S.min !== undefined && S.min !== null && str(S.min).trim() !== '', hi = S.max !== undefined && S.max !== null && str(S.max).trim() !== '';
    var what = S.int ? 'whole number' : 'number';
    if (lo && hi) return ', or any ' + what + ' in $' + (S.minOpen ? '(' : '[') + tx(str(S.min)) + ', ' + tx(str(S.max)) + (S.maxOpen ? ')' : ']') + '$';
    if (lo) return ', or any ' + what + ' $' + (S.minOpen ? '>' : '\\ge') + ' ' + tx(str(S.min)) + '$';
    if (hi) return ', or any ' + what + ' $' + (S.maxOpen ? '<' : '\\le') + ' ' + tx(str(S.max)) + '$';
    return '';
  }
  function checkSF(spec, L, C, right) { // form 'sf': n significant figures
    var n = Math.max(1, Math.min(15, Math.floor(Number(spec.sf)) || 1)), cq = canonQ(C), si = sigInfo(L.text);
    if (!cq || typeof L.val !== 'number') return { ok: false };
    var R = roundSigQ(cq.n, cq.d, n), want = sciText(R, n), s2 = n === 1 ? '' : 's';
    var lq = si ? { n: si.neg ? -si.n : si.n, d: si.d } : (L.q ? { n: L.q.n, d: L.q.d } : null);
    var same = lq && lq.n * R.d === R.n * lq.d, okSF = si && si.min <= n && n <= si.max;
    if (same) {
      if (!si) return { ok: false, msg: 'Equal, but write it as a decimal with ' + n + ' significant figure' + s2 + ', like ' + want + '.', form: true };
      if (okSF) return right();
      if (si.max < n) return { ok: false, msg: 'Equal, but give it to ' + n + ' significant figure' + s2 + ', like ' + want + '.', form: true };
      return { ok: false, msg: 'Round it to ' + n + ' significant figure' + s2 + '.', form: true };
    }
    var cv = Number(R.n) / Number(R.d), lv = L.val, ulp = Math.pow(10, R.e - n + 1);
    if (si && si.max < n && lq) { var Rk = roundSigQ(cq.n, cq.d, si.max); if (lq.n * Rk.d === Rk.n * lq.d) return { ok: false, msg: 'Close: give it to ' + n + ' significant figure' + s2 + ', like ' + want + '.', form: true }; }
    if (spec.rtol !== undefined && okSF && Math.abs(lv - C.val) <= Math.abs(Number(spec.rtol)) * Math.abs(C.val)) return right();
    if (si && si.min > n && Math.abs(lv - C.val) < ulp / 2 + 1e-12 * Math.abs(cv)) return { ok: false, msg: 'Round it to ' + n + ' significant figure' + s2 + '.', form: true };
    if (si && Math.abs(lv - cv) <= ulp * 1.01) return { ok: false, msg: 'Check your rounding: we want ' + n + ' significant figure' + s2 + ' (' + want + ').' };
    if (cv !== 0 && rel(lv, -cv, 1e-9)) return { ok: false, msg: 'Right size, wrong sign.' };
    if (pow10Off(lv, cv, Math.max(1e-9, spec.rtol ? Number(spec.rtol) : ulp / Math.abs(cv)))) return { ok: false, msg: 'Check the power of ten.' };
    return { ok: false };
  }
  function hasPi(n) { return !!n && anyNode(n, function (x) { return x.t === 'const' && x.s === 'pi'; }); }
  function angleMsg(L, C) { // the same angle in the other unit
    if (typeof L.val !== 'number' || typeof C.val !== 'number' || !C.node || C.val === 0) return undefined;
    if (hasPi(C.node) && !hasPi(L.node) && relEq(L.val * Math.PI / 180, C.val, 1e-9)) return 'That\'s the angle in degrees. Give it in radians.';
    if (!hasPi(C.node) && hasPi(L.node) && !L.deg && relEq(L.val * 180 / Math.PI, C.val, 1e-9)) return 'That\'s the angle in radians. Give it in degrees.';
    return undefined;
  }
  function wrongNumMsg(L, C, spec) {
    var lv = L.val, cv = C.val;
    if (typeof lv !== 'number' || typeof cv !== 'number') return undefined;
    if (cv !== 0 && sameNum(L, negOf(C))) return 'Right size, wrong sign.';
    if (spec.pct && relEq(lv * 100, cv)) return 'That\'s the decimal. Write it as a percent.';
    if (cv !== 0 && Math.abs(cv) !== 1 && C.q && L.q && L.q.n * C.q.n === L.q.d * C.q.d && L.kind !== 'int') return 'That\'s the reciprocal: flip it over.';
    if (cv !== 0 && lv !== 0 && (L.kind === 'dec' || L.kind === 'int') && (C.kind === 'dec' || C.kind === 'int' || C.q)) {
      for (var k = 1; k <= 3; k++) if (relEq(lv, cv * Math.pow(10, k), 1e-12) || relEq(lv, cv / Math.pow(10, k), 1e-12)) return 'Check the decimal point.';
    }
    var exactWanted = !C.q || !isTerminatingQ(C.q);
    if (L.kind === 'dec' && exactWanted && cv !== 0 && Math.abs(lv - cv) <= 0.005 * Math.abs(cv) + 1e-9) return 'Close! Give the exact value' + (C.q ? ', as a fraction.' : ' (no decimals).');
    return undefined;
  }
  function isTerminatingQ(q) { var d = q.d; while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n; return d === 1n; }
  function formMsg(form, L, C) {
    var isWhole = C.q && C.q.d === 1n;
    switch (form) {
      case 'any': return null;
      case 'int':
        if (L.kind === 'int') return null;
        return 'Equal, but write it as a whole number.';
      case 'dec':
        if (L.kind === 'dec' || L.kind === 'int') return null;
        return 'Equal, but write it as a decimal.';
      case 'frac':
        if (L.kind === 'int' && isWhole) return null;
        if (L.kind === 'frac') { var p = fracParts(L.node); return gcdB(p[0], p[1]) === 1n ? null : 'Equal, but not in lowest terms.'; }
        if (L.kind === 'mixed') return 'Equal, but write it as a single fraction (like 5/2).';
        if (L.kind === 'dec') return 'Equal, but write it as a fraction.';
        return 'Equal, but write it as one fraction, a/b.';
      case 'mixed':
        if (L.kind === 'int' && isWhole) return null;
        if (L.kind === 'mixed') { var m = mixedParts(L.node); if (m[1] >= m[2]) return 'Equal, but the fraction part should be less than 1.'; if (m[1] === 0n) return 'Equal, but write it as a whole number.'; return gcdB(m[1], m[2]) === 1n ? null : 'Equal, but not in lowest terms.'; }
        if (L.kind === 'frac') { var f = fracParts(L.node); if (f[0] < f[1]) return gcdB(f[0], f[1]) === 1n ? null : 'Equal, but not in lowest terms.'; return 'Equal, but write it as a mixed number (like 2 1/2).'; }
        if (L.kind === 'dec') return 'Equal, but write it as a mixed number.';
        return 'Equal, but write it as a mixed number.';
      case 'simplest': {
        if (L.kind === 'frac') { var g = fracParts(L.node); if (gcdB(g[0], g[1]) !== 1n) return 'Equal, but not in lowest terms.'; if (g[1] === 1n) return 'Equal, but write it as a whole number.'; return null; }
        if (L.kind === 'mixed') { var mm = mixedParts(L.node); if (mm[1] >= mm[2]) return 'Equal, but the fraction part should be less than 1.'; return gcdB(mm[1], mm[2]) === 1n ? null : 'Equal, but not in lowest terms.'; }
        if (L.kind === 'int' || L.kind === 'dec') return null;
        var v = newViolation(L.node, C.node); return v ? VMSG[v] : null;
      }
      default: return null;
    }
  }

  // ===================================================================== expressions
  var POOL = [0.37, -0.83, 1.29, -1.71, 2.13, 0.61, -2.47, 1.53, 2.91, -0.29, 0.83, 3.17, -3.07, 1.07, 0.19, 4.31, -4.93, 0.71, 1.91, -1.13, 2.57, -0.57, 0.43, -2.03];
  function points(vars, n) {
    var pts = [];
    for (var t = 0; t < n; t++) {
      var env = {};
      vars.forEach(function (v, j) { var base = POOL[(t * 5 + j * 7 + 3 * j * t) % POOL.length]; env[v] = t >= n / 2 ? Math.abs(base) + 0.05 * j : base * (1 + 0.13 * j); });
      pts.push(env);
    }
    return pts;
  }
  function compileOf(tree, vars) { var f = CAS.compile(tree, vars); return function (env) { try { var y = f.apply(null, vars.map(function (v) { return env[v]; })); return typeof y === 'number' ? y : NaN; } catch (e) { return NaN; } }; }
  // compare two CAS trees: 'eq' | 'ne' | 'unknown'
  function compareTrees(A, B, vars, mode) {
    return withRad(function () {
      if (!mode) {
        try { var d = CAS.simp(CAS.expand(diffT(A, B))); if (d.k === 'n' && CAS.num(d.v) === 0) return 'eq'; } catch (e) { }
      }
      var fa = compileOf(A, vars), fb = compileOf(B, vars), good = 0, pts = points(vars, 40), ratios = [], diffs = [];
      for (var i = 0; i < pts.length; i++) {
        var a = fa(pts[i]), b = fb(pts[i]);
        if (!isFinite(a) || !isFinite(b)) continue;
        if (mode === 'ratio') { if (Math.abs(b) < 1e-9) { if (Math.abs(a) < 1e-9) continue; return 'ne'; } ratios.push(a / b); good++; if (good >= 8) break; continue; }
        if (mode === 'const') { diffs.push(a - b); good++; if (good >= 8) break; continue; }
        if (!relEq(a, b, 1e-7)) return 'ne';
        good++; if (good >= 8) break;
      }
      if (good < 4) return 'unknown';
      if (mode === 'ratio') { if (Math.abs(ratios[0]) < 1e-12) return 'ne'; return ratios.every(function (r) { return relEq(r, ratios[0], 1e-6); }) ? 'eq' : 'ne'; }
      if (mode === 'const') return diffs.every(function (d) { return relEq(d, diffs[0], 1e-7); }) ? 'eq' : 'ne';
      return 'eq';
    });
  }
  // the learner's answer is undefined at points where the expected one is defined (ln(x) where ln|x| is expected)
  function domainLoss(A, B, vars) {
    return withRad(function () {
      var fa = compileOf(A, vars), fb = compileOf(B, vars), pts = points(vars, 40), fin = 0, lost = 0;
      pts.forEach(function (p) { var b = fb(p); if (!isFinite(b)) return; fin++; if (!isFinite(fa(p))) lost++; });
      return lost >= 2 && lost >= 0.1 * fin;
    });
  }
  function hasAbs(n) { return anyNode(n, function (x) { return x.t === 'abs' || (x.t === 'fn' && x.name === 'abs'); }); }
  function absMsg(C) {
    var inner = null;
    anyNode(C, function (x) { if (x.t === 'fn' && (x.name === 'ln' || x.name === 'log')) { var a = unNeg(x.args[0]).n; if (a.t === 'abs' || (a.t === 'fn' && a.name === 'abs')) { inner = a.t === 'abs' ? a.a : a.args[0]; return true; } } return false; });
    if (inner) return 'Remember the absolute value: ln|' + (unNeg(inner).n.t === 'var' && !unNeg(inner).neg ? unNeg(inner).n.s : '…') + '|.';
    return 'Your answer isn\'t defined for some values where it should be. Check for a missing absolute value.';
  }
  function exprVars(spec, canonTree) { return spec.vars && spec.vars.length ? spec.vars.slice() : freeVars(canonTree); }
  function readExpr(raw) {
    var s = cleanInput(raw);
    if (!s) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var r = parse(s, { mixed: true });
    if (!r.ok) return { ok: false, invalid: true, msg: r.err };
    var node = r.node;
    if (node.t === 'rel' && node.ops.length === 1 && node.ops[0] === '=') { // y = …, f(x) = …
      var lhs = node.a[0];
      if (lhs.t === 'var' || (lhs.t === 'mul' && lhs.f.length === 2 && lhs.f[0].x.t === 'var' && lhs.f[1].x.t === 'paren')) node = node.a[1];
    }
    if (node.t === 'rel' || node.t === 'seq') return { ok: false, invalid: true, msg: 'Type just the expression (no = sign).' };
    var tree; try { tree = casTree(node); } catch (e) { return { ok: false, invalid: true, msg: 'I couldn\'t read that.' }; }
    return { ok: true, node: node, tree: tree };
  }
  function checkExpr(spec, answer) {
    var cr = parse(str(spec.v)); if (!cr.ok) throw new Error('Bad expr answer "' + spec.v + '": ' + cr.err);
    var Cn = cr.node.t === 'rel' && cr.node.a[0].t === 'var' ? cr.node.a[1] : cr.node, Ct = casTree(Cn);
    var L = readExpr(answer); if (!L.ok) return L;
    var vars = exprVars(spec, Ct), lv = freeVars(L.tree), cv = freeVars(Ct);
    var hasC = cv.indexOf('C') >= 0 && (!spec.vars || spec.vars.indexOf('C') < 0);
    if (hasC) return checkAntiderivative(spec, L, Cn, vars.filter(function (v) { return v !== 'C'; }));
    var extra = lv.filter(function (v) { return vars.indexOf(v) < 0 && cv.indexOf(v) < 0; });
    var allVars = vars.concat(extra);
    if (extra.length && compareTrees(L.tree, Ct, allVars) !== 'eq') {
      var missing = cv.filter(function (v) { return lv.indexOf(v) < 0; });
      if (extra.length === 1 && missing.length === 1) {
        var swapped = casTree(substVar(L.node, extra[0], { t: 'var', s: missing[0] }));
        try { if (compareTrees(swapped, Ct, cv) === 'eq') return { ok: false, msg: 'Use the variable ' + missing[0] + '.' }; } catch (e) { }
      }
      return { ok: false, msg: vars.length ? 'Use only ' + listOr(vars) + ' in your answer.' : undefined };
    }
    var res = extra.length ? 'eq' : compareTrees(L.tree, Ct, allVars.length ? allVars : ['x']);
    if (res !== 'eq') {
      if (res === 'ne' && compareTrees(L.tree, negT(Ct), allVars.length ? allVars : ['x']) === 'eq') return { ok: false, msg: 'Right size, wrong sign.' };
      return { ok: false, msg: res === 'unknown' ? undefined : undefined };
    }
    if (hasAbs(Cn) && domainLoss(L.tree, Ct, allVars.length ? allVars : ['x'])) return { ok: false, msg: absMsg(Cn) };
    var fm = exprFormMsg(spec.form, L.node, Cn, allVars);
    return fm ? { ok: false, msg: fm, form: true } : { ok: true };
  }
  function listOr(a) { return a.length === 1 ? a[0] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function checkAntiderivative(spec, L, Cn, vars) {
    var lv = freeVars(L.tree), consts = lv.filter(function (v) { return vars.indexOf(v) < 0; });
    var ZERO = { t: 'num', s: '0' }, C0 = casTree(substVar(Cn, 'C', ZERO));
    var Lt = L.tree;
    if (consts.length > 1) return { ok: false };
    if (consts.length === 1) Lt = casTree(substVar(L.node, consts[0], ZERO));
    var r = compareTrees(Lt, C0, vars.length ? vars : ['x'], 'const');
    if (r !== 'eq') return { ok: false };
    if (hasAbs(Cn) && domainLoss(Lt, C0, vars.length ? vars : ['x'])) return { ok: false, msg: absMsg(Cn) };
    if (!consts.length) return { ok: false, msg: 'Almost! Don\'t forget the constant: + C.' };
    return { ok: true };
  }
  // ---- expression forms
  function flatTerms(n) { // top-level terms of a sum (through parens)
    var out = [];
    (function w(x, sg) { if (x.t === 'paren') return w(x.a, sg); if (x.t === 'sum') { x.terms.forEach(function (t) { w(t.x, t.op === '-' ? -sg : sg); }); return; } out.push(x); })(n, 1);
    return out;
  }
  function monoKey(node) { // like-term signature of a term: its non-numeric part
    try {
      var t = CAS.simp(casTree(node));
      if (t.k === 'n') return '#';
      if (t.k === '*' && t.a[0].k === 'n') return CAS.key({ k: '*', a: t.a.slice(1) });
      return CAS.key(t);
    } catch (e) { return Math.random() + ''; }
  }
  function likeTerms(node) { var seen = {}, dup = false; flatTerms(node).forEach(function (t) { var k = monoKey(t); if (seen[k]) dup = true; seen[k] = 1; }); return dup; }
  function anyNode(n, pred) { var f = false; (function w(x) { if (!x || typeof x !== 'object' || f) return; if (pred(x)) { f = true; return; } ['a', 'b', 'e'].forEach(function (k) { if (x[k] && typeof x[k] === 'object') w(x[k]); }); (x.terms || []).forEach(function (t) { w(t.x); }); (x.f || []).forEach(function (t) { w(t.x); }); (x.args || []).forEach(w); })(n); return f; }
  function isSumLike(x) { while (x.t === 'paren') x = x.a; return x.t === 'sum'; }
  function hasVarNode(x) { return anyNode(x, function (y) { return y.t === 'var'; }); }
  function notExpanded(node) {
    return anyNode(node, function (x) {
      if (x.t === 'mul') return x.f.some(function (f) { return isSumLike(f.x) && (f.op !== '/' || hasVarNode(f.x) && false); }) && x.f.length > 1;
      if (x.t === 'pow') return isSumLike(x.b) && !(x.e.t === 'num' && x.e.s === '1');
      if (x.t === 'neg') return isSumLike(x.a);
      return false;
    });
  }
  function countFactors(n) { // non-constant factors with multiplicity
    while (n.t === 'paren' || n.t === 'neg') n = n.a;
    if (!hasVarNode(n)) return 0;
    if (n.t === 'mul') return n.f.reduce(function (s, f) { return s + (f.op === '/' ? 0 : countFactors(f.x)); }, 0);
    if (n.t === 'pow') { var e = unNeg(n.e).n; var k = e.t === 'num' && /^\d+$/.test(e.s) ? Number(e.s) : 1; return k * countFactors(n.b); }
    return 1;
  }
  function contentGT1(n) { // a sum factor with a common whole-number factor, like (2x + 4)
    return anyNode(n, function (x) {
      if (x.t !== 'paren' || !isSumLike(x.a) || !hasVarNode(x.a)) return false;
      try { var t = CAS.expand(casTree(x.a)), vars = freeVars(t); if (vars.length !== 1) return false; var p = CAS.toPoly(t, vars[0]); if (!p) return false; var g = 0n; for (var i = 0; i < p.length; i++) { if (p[i].d !== 1n) return false; g = gcdB(g, p[i].n); } return g > 1n; } catch (e) { return false; }
    });
  }
  function denDegree(node) { // the degree of the denominator (x^(-3) counts as 3 in the denominator)
    var u = unNeg(node).n, d = 0;
    function negPow(x) { x = unNeg(x).n; if (x.t !== 'pow' || !hasVarNode(x.b)) return 0; var e = expInfo(x.e); return e && e.p < 0 && e.q === 1 ? -e.p : 0; }
    if (u.t === 'pow') return negPow(u);
    if (u.t !== 'mul') return 0;
    u.f.forEach(function (f) {
      if (f.op !== '/') { d += negPow(f.x); return; }
      try { var t = CAS.expand(casTree(f.x)), vs = freeVars(t); if (!vs.length) return; var p = CAS.toPoly(t, vs[0]); d += p ? p.length - 1 : 1; } catch (e) { d += 1; }
    });
    return d;
  }
  function repeatedBase(node) {
    return anyNode(node, function (x) {
      if (x.t === 'pow') { var b = x.b; while (b.t === 'paren') b = b.a; if (b.t === 'pow') return true; }
      if (x.t !== 'mul') return false;
      var seen = {};
      for (var i = 0; i < x.f.length; i++) { if (x.f[i].op === '/') continue; var b2 = x.f[i].x; if (b2.t === 'pow') b2 = b2.b; if (b2.t === 'var') { if (seen[b2.s]) return true; seen[b2.s] = 1; } }
      return false;
    });
  }
  function topNode(n) { while (n.t === 'paren' || n.t === 'neg') n = n.a; return n; }
  // a product or quotient of polynomials -> for each variable, the sum of the degrees of its factors above and below the
  // bar (x^2-4)/(x-2) -> { x: 3 }; null when a factor is not a polynomial. More degree than the expected answer has means
  // a common factor is left to cancel ("(x^2-x-12)/(x^2-5x+6) · (x-3)/(x+3)" typed back for (x-4)/(x-2)).
  var OTHER = [{ t: 'num', s: '7' }, { t: 'num', s: '11' }, { t: 'num', s: '13' }, { t: 'num', s: '17' }];
  function ratDeg(node, vars) {
    if (!vars.length || vars.length > 4) return null;
    var tot = {}; vars.forEach(function (v) { tot[v] = 0; });
    var fs = flatFactors(node);
    for (var i = 0; i < fs.length; i++) {
      var x = fs[i].x, mult = 1;
      if (x.t === 'pow') { var e = expInfo(x.e); if (!e || e.q !== 1) return null; mult = Math.abs(e.p); x = x.b; }
      if (!hasVarNode(x)) continue;
      for (var j = 0; j < vars.length; j++) {
        var y = x; vars.forEach(function (w, k) { if (w !== vars[j]) y = substVar(y, w, OTHER[k]); });
        var p; try { p = CAS.toPoly(CAS.expand(casTree(y)), vars[j]); } catch (er) { p = null; }
        if (!p) return null;
        tot[vars[j]] += (p.length - 1) * mult;
      }
    }
    return tot;
  }
  function moreDegree(L, C, vars) { var a = ratDeg(L, vars), b = a && ratDeg(C, vars); return !!(a && b) && vars.some(function (v) { return a[v] > b[v]; }); }
  function fracCoefs(n) { // a factor (a sum with letters) with a fraction or decimal coefficient inside, like (x + 3/2)
    return anyNode(n, function (x) {
      if (x.t !== 'paren' || !isSumLike(x.a) || !hasVarNode(x.a)) return false;
      try { var t = CAS.expand(casTree(x.a)), vars = freeVars(t); if (vars.length !== 1) return false; var p = CAS.toPoly(t, vars[0]); if (!p) return false; for (var i = 0; i < p.length; i++) if (p[i].d !== 1n) return true; return false; } catch (e) { return false; }
    });
  }
  var FACTORED_RULES = ['arith', 'lowest', 'radical', 'trivialPow', 'fn:inv', 'fn:trig', 'fn:log', 'fn:hyp', 'powProd', 'powPow', 'nestedFrac'];
  function exprFormMsg(form, L, C, vars) {
    if (!form || form === 'any') return null;
    if (form === 'expanded') {
      if (notExpanded(L) && !notExpanded(C)) return 'Equal, but write it without parentheses (expanded).';
      if (likeTerms(L) && !likeTerms(C)) return 'Equal, but combine like terms.';
      return null;
    }
    if (form === 'factored') {
      var top = topNode(L), ctop = topNode(C);
      if (top.t === 'sum' && (ctop.t !== 'sum' || countFactors(C) > 1)) return 'Equal, but write it as a product (factored).';
      if (countFactors(L) < countFactors(C)) return 'Equal, but it can be factored more.';
      if (contentGT1(L) && !contentGT1(C)) return 'Equal, but a factor still has a common factor inside. Factor completely.';
      if (fracCoefs(L) && !fracCoefs(C)) return 'Equal, but use whole numbers inside each factor.';
      var fv = newViolation(L, C, FACTORED_RULES); if (fv) return VMSG[fv];
      return null;
    }
    if (form === 'simplified' || form === 'simplest') {
      if (anyNode(L, function (x) { return x.t === 'sum' && likeTerms(x); }) && !anyNode(C, function (x) { return x.t === 'sum' && likeTerms(x); })) return 'Equal, but combine like terms.';
      var v = newViolation(L, C); if (v) return VMSG[v];
      if (repeatedBase(L) && !repeatedBase(C)) return 'Equal, but simplify using exponent rules.';
      if (denDegree(L) > denDegree(C) || moreDegree(L, C, vars || [])) return 'Equal, but it can be simplified more (cancel common factors).';
      return null;
    }
    return null;
  }

  // ===================================================================== equations
  function checkEq(spec, answer) {
    var cr = parse(str(spec.v)); if (!cr.ok || cr.node.t !== 'rel') throw new Error('Bad eq answer "' + spec.v + '"');
    var s = cleanInput(answer); if (!s) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var lr = parse(s, { mixed: true }); if (!lr.ok) return { ok: false, invalid: true, msg: lr.err };
    if (lr.node.t !== 'rel' || lr.node.ops.length !== 1 || lr.node.ops[0] !== '=') return { ok: false, invalid: true, msg: 'Write an equation, with an = sign.' };
    function diffTree(n) { return CAS.parse('(' + ML.plainToCAS(n.a[0]) + ')-(' + ML.plainToCAS(n.a[1]) + ')'); }
    var Lt = diffTree(lr.node), Ct = diffTree(cr.node), vars = Object.keys(Object.assign({}, CAS.freeVars(Lt), CAS.freeVars(Ct))).filter(function (v) { return v !== '∞'; });
    var res = compareTrees(Lt, Ct, vars.length ? vars : ['x'], 'ratio');
    if (res !== 'eq') return { ok: false };
    if (spec.form === 'solved' || spec.form === 'slope') {
      var cl = cr.node.a[0], ll = lr.node.a[0];
      var want = cl.t === 'var' ? cl.s : null;
      if (!(ll.t === 'var' && (!want || ll.s === want) && !anyNode(lr.node.a[1], function (x) { return x.t === 'var' && x.s === ll.s; }))) return { ok: false, msg: 'Equal, but solve for ' + (want || 'the variable') + ': write it as ' + (want || 'y') + ' = …', form: true };
      if (spec.form === 'slope' && likeTerms(lr.node.a[1])) return { ok: false, msg: 'Equal, but combine like terms.', form: true };
    }
    if (spec.form === 'standard') {
      try {
        var lhs = CAS.expand(casTree(lr.node.a[0])), rhs = casTree(lr.node.a[1]); var rq = exactQ(rhs);
        var vs = freeVars(lhs); if (!rq || vs.length !== 2 || hasVarNode(lr.node.a[1])) return { ok: false, msg: 'Equal, but write it in standard form, Ax + By = C.', form: true };
        var cs = vs.map(function (v) { return exactQ(CAS.deriv(lhs, v)); });
        if (cs.some(function (c) { return !c || c.d !== 1n; }) || rq.d !== 1n) return { ok: false, msg: 'Equal, but use whole numbers: Ax + By = C.', form: true };
        var g = gcdB(gcdB(cs[0].n, cs[1].n), rq.n); if (g > 1n) return { ok: false, msg: 'Equal, but divide out the common factor ' + g + '.', form: true };
        var first = vs.indexOf('x') >= 0 ? cs[vs.indexOf('x')] : cs[0]; if (first.n < 0n) return { ok: false, msg: 'Equal, but make the x coefficient positive.', form: true };
      } catch (e) { }
    }
    return { ok: true };
  }

  // ===================================================================== lists of values (sets, tuples)
  function splitPM(items) { // "±3" -> "+3", "-3"; "(-1±sqrt(13))/2" -> both roots; "+-" and "+/-" mean ±; with ∓ the signs go together
    var out = [];
    items.forEach(function (s) {
      s = s.replace(/\+\s*\/\s*-/g, '±').replace(/\+\s*-/g, '±');
      var n = (s.match(/[±∓]/g) || []).length;
      if (!n || n > 4) { out.push(s); return; }
      if (/∓/.test(s)) { out.push(s.replace(/±/g, '+').replace(/∓/g, '-'), s.replace(/±/g, '-').replace(/∓/g, '+')); return; }
      for (var mask = 0; mask < (1 << n); mask++) { var k = 0; out.push(s.replace(/±/g, function () { return (mask >> (k++)) & 1 ? '-' : '+'; })); }
    });
    return out;
  }
  function outerInner(s) { // "{1, 2}" -> "1, 2" when the first bracket closes at the very end; else null
    s = s.trim(); if (!/^[{(⟨<\[]/.test(s) || !/[})⟩>\]]$/.test(s)) return null;
    var d = 0;
    for (var i = 0; i < s.length; i++) { var c = s[i]; if ('{(⟨<['.indexOf(c) >= 0) d++; else if ('})⟩>]'.indexOf(c) >= 0) { d--; if (d === 0 && i < s.length - 1) return null; } }
    return d === 0 ? s.slice(1, -1).trim() : null;
  }
  function splitTop(s) { // split on top-level commas, semicolons, "or", "and"
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if ('([{⟨'.indexOf(c) >= 0) depth++; else if (')]}⟩'.indexOf(c) >= 0) depth--;
      if (depth === 0 && (c === ',' || c === ';')) { out.push(cur); cur = ''; continue; }
      if (depth === 0 && /\s/.test(c)) { var m = /^\s+(or|and)\s+/i.exec(s.slice(i)); if (m) { out.push(cur); cur = ''; i += m[0].length - 1; continue; } }
      cur += c;
    }
    out.push(cur);
    return out.map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
  }
  function readItems(answer, opts) {
    if (Array.isArray(answer)) return answer.map(str);
    var s = cleanInput(answer);
    if (opts && opts.strip) { var inner = outerInner(s); if (inner !== null && splitTop(inner).length >= (opts.min || 1)) s = inner; }
    return splitTop(s);
  }
  function itemCheck(spec, item, canon, ctx) { // one element of a set/tuple: number, or expression when it has letters
    var sub = { v: canon, form: spec.form, dp: spec.dp, tol: spec.tol, vars: spec.vars };
    var cr = parse(canon); var hasVars = cr.ok && hasVarNode(cr.node) && !(cr.node.t === 'const');
    if (hasVars) { sub.t = 'expr'; return checkExpr(sub, item); }
    sub.t = 'num'; return checkNum(sub, stripLabel(item), ctx);
  }
  function checkSet(spec, answer, ctx) {
    var s = Array.isArray(answer) ? answer.join(', ') : cleanInput(answer);
    if (!s) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var want = spec.v;
    var isNone = NO_SOL.test(s), isAll = ALL_REAL.test(s);
    if (want === 'all') return isAll ? { ok: true } : isNone ? { ok: false } : { ok: false, msg: readItemsOk(s) ? 'Check again: does every number work?' : undefined };
    if (isAll) return { ok: false };
    if (!want.length) return isNone ? { ok: true } : { ok: false };
    if (isNone) return { ok: false };
    var items = splitPM(readItems(s, { strip: true }));
    if (!items.length) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    for (var i = 0; i < items.length; i++) { var pr = parse(stripLabel(items[i]), { mixed: true }); if (!pr.ok && !dropUnit(stripLabel(items[i])) && !(ctx && ctx.unit && dropExpectedUnit(stripLabel(items[i]), ctx.unit))) return { ok: false, invalid: true, msg: pr.err }; }
    var matched = want.map(function () { return false; }), extra = 0, formIssue = null, angle = 0, angleText = '';
    var uniq = [];
    items.forEach(function (it) {
      var hit = -1, ang = false;
      for (var j = 0; j < want.length; j++) {
        var r = itemCheck(spec, it, want[j], ctx);
        if (r.ok) { hit = j; break; }
        if (r.form && !formIssue) { formIssue = r.msg; hit = j; break; }
        if (r.msg && /^That's the angle in/.test(r.msg)) { ang = true; angleText = r.msg; }
      }
      if (hit < 0 && ang) angle++;
      if (hit < 0) { if (!uniq.some(function (u) { return sameItem(u, it); })) extra++; }
      else matched[hit] = true;
      uniq.push(it);
    });
    var nMatch = matched.filter(Boolean).length;
    if (nMatch === want.length && !extra) return formIssue ? { ok: false, msg: formIssue, form: true } : { ok: true };
    if (angle && angle >= extra) return { ok: false, msg: angleText.replace('That\'s the angle', 'Those are the angles').replace('Give it', 'Give them') };
    if (!extra && nMatch < want.length) return { ok: false, msg: nMatch ? 'Right so far, but there ' + (want.length - nMatch === 1 ? 'is one more.' : 'are more.') : undefined };
    if (extra && nMatch === want.length) return { ok: false, msg: extra === 1 ? 'One of those isn\'t a solution.' : 'Some of those aren\'t solutions.' };
    return { ok: false };
  }
  function readItemsOk(s) { return readItems(s, { strip: true }).every(function (it) { return parse(stripLabel(it)).ok; }); }
  function itemVal(s) { s = stripLabel(s); var v = ML.evalPlain(s); if (typeof v === 'number' && isNaN(v)) { var du = dropUnit(cleanInput(s)); if (du) v = ML.evalPlain(du.s); } return v; }
  function sameItem(a, b) { try { return valEq(itemVal(a), itemVal(b)); } catch (e) { return false; } }
  function checkTuple(spec, answer, ctx) {
    var items = readItems(Array.isArray(answer) ? answer : str(answer).replace(/^\s*</, '(').replace(/>\s*$/, ')'), { strip: true, min: 2 });
    if (!items.length || items.every(function (x) { return !x.trim(); })) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    if (items.some(function (x) { return !x.trim(); })) return { ok: false, invalid: true, msg: 'Fill in every box.' };
    var want = spec.v, n = want.length;
    // named entries: x = 2, y = -1
    var named = items.map(function (it) { var m = /^\s*([a-zA-Z]\w*)\s*=\s*(.+)$/.exec(it); return m ? [m[1], m[2]] : null; });
    if (spec.vars && named.every(Boolean)) {
      var byName = {}; named.forEach(function (p) { byName[p[0]] = p[1]; });
      if (spec.vars.every(function (v) { return byName[v] !== undefined; })) items = spec.vars.map(function (v) { return byName[v]; });
    } else items = items.map(stripLabel);
    if (items.length !== n) return { ok: false, invalid: items.length < n, msg: n === 2 ? 'Give both values, like (2, -1).' : 'Give ' + n + ' values, like (' + want.map(function (_, i) { return i + 1; }).join(', ') + ').' };
    var rs = items.map(function (it, i) { return itemCheck(spec, it, want[i], ctx); });
    var bad = rs.filter(function (r) { return !r.ok; });
    if (!bad.length) return { ok: true };
    var inv = rs.filter(function (r) { return r.invalid; }); if (inv.length) return { ok: false, invalid: true, msg: inv[0].msg };
    if (bad.every(function (r) { return r.form; })) return { ok: false, msg: bad[0].msg, form: true };
    if (n === 2) { var sw = [itemCheck(spec, items[1], want[0], ctx), itemCheck(spec, items[0], want[1], ctx)]; if (sw[0].ok && sw[1].ok) return { ok: false, msg: 'Check the order' + (spec.vars ? ': (' + spec.vars.join(', ') + ').' : '.') }; }
    if (bad.length < n) return { ok: false, msg: 'Close: ' + (n - bad.length) + ' of the ' + n + ' values ' + (n - bad.length === 1 ? 'is' : 'are') + ' right.' };
    return { ok: false };
  }
  function checkMatrix(spec, answer) {
    var rows = answer;
    if (!Array.isArray(answer)) {
      var r = parse(cleanInput(answer)); if (!r.ok) return { ok: false, invalid: true, msg: r.err };
      if (r.node.t !== 'mat') return { ok: false, invalid: true, msg: 'Type the matrix row by row, like [[1, 0], [0, 1]].' };
      rows = r.node.rows.map(function (row) { return row.map(function (x) { return ML.plainToCAS(x); }); });
    }
    var want = spec.v;
    if (rows.length !== want.length || rows.some(function (row, i) { return !Array.isArray(row) || row.length !== want[0].length; })) return { ok: false, msg: 'This matrix should be ' + want.length + ' × ' + want[0].length + '.' };
    if (rows.some(function (row) { return row.some(function (x) { return !str(x).trim(); }); })) return { ok: false, invalid: true, msg: 'Fill in every box.' };
    var wrong = 0, inv = null, form = null;
    rows.forEach(function (row, i) { row.forEach(function (x, j) { var res = itemCheck(spec, str(x), want[i][j]); if (res.invalid) inv = res.msg; if (!res.ok) { wrong++; if (res.form) form = res.msg; } }); });
    if (inv) return { ok: false, invalid: true, msg: inv };
    if (!wrong) return { ok: true };
    if (form && wrong === 1) return { ok: false, msg: form, form: true };
    var sq = want.length === want[0].length;
    if (sq && wrong > 1 && rows.every(function (row, i) { return row.every(function (x, j) { return itemCheck(spec, str(x), want[j][i]).ok; }); })) return { ok: false, msg: 'That\'s the transpose: rows and columns are swapped.' };
    var total = want.length * want[0].length;
    return { ok: false, msg: wrong <= 2 && total > 2 ? (wrong === 1 ? 'Close: one entry is off.' : 'Close: two entries are off.') : undefined };
  }

  // ===================================================================== intervals and inequalities
  // an interval set: [{ lo, hi, loC, hiC }] with lo/hi numbers (±Infinity), sorted and merged
  function endVal(s) {
    s = s.trim();
    if (INF.test(s)) return Infinity; if (NINF.test(s)) return -Infinity;
    var v = ML.evalPlain(s); if (typeof v !== 'number' || isNaN(v)) throw new Error('bad endpoint');
    return v;
  }
  function normSet(list) {
    list = list.filter(function (I) { return I.lo < I.hi || (I.lo === I.hi && I.loC && I.hiC); }).sort(function (a, b) { return a.lo - b.lo || (b.loC ? 1 : 0) - (a.loC ? 1 : 0); });
    var out = [];
    list.forEach(function (I) {
      var last = out[out.length - 1];
      if (last && (I.lo < last.hi || (relEq(I.lo, last.hi) && (I.loC || last.hiC)))) {
        if (I.hi > last.hi && !relEq(I.hi, last.hi)) { last.hi = I.hi; last.hiC = I.hiC; last.hiS = I.hiS; } else if (relEq(I.hi, last.hi)) last.hiC = last.hiC || I.hiC;
        if (relEq(I.lo, last.lo)) last.loC = last.loC || I.loC;
      } else out.push({ lo: I.lo, hi: I.hi, loC: I.loC, hiC: I.hiC, loS: I.loS, hiS: I.hiS });
    });
    return out;
  }
  function parseIntervals(s) { // -> { set } or { err, msg }
    s = cleanInput(s).replace(/∞/g, 'inf').replace(/\binfinity\b/gi, 'inf');
    if (NO_SOL.test(s)) return { set: [] };
    if (ALL_REAL.test(s)) return { set: [{ lo: -Infinity, hi: Infinity, loC: false, hiC: false }] };
    var pieces = s.split(/\s*(?:∪|\bU\b|\bu\b|\bor\b)\s*/i), out = [], badInf = false;
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i].trim(); if (!p) continue;
      var m = /^([(\[])\s*(.+?)\s*,\s*(.+?)\s*([)\]])$/.exec(p);
      var pt = /^\{\s*(.+?)\s*\}$/.exec(p);
      if (pt) { try { var v0 = endVal(pt[1]); out.push({ lo: v0, hi: v0, loC: true, hiC: true, loS: pt[1], hiS: pt[1] }); continue; } catch (e) { return { err: true }; } }
      if (!m) return { err: true };
      var lo, hi; try { lo = endVal(m[2]); hi = endVal(m[3]); } catch (e) { return { err: true }; }
      if ((lo === -Infinity && m[1] === '[') || (hi === Infinity && m[4] === ']')) badInf = true;
      if (lo > hi) return { err: true, msg: 'Write the smaller number first.' };
      out.push({ lo: lo, hi: hi, loC: m[1] === '[' && isFinite(lo), hiC: m[4] === ']' && isFinite(hi), loS: m[2], hiS: m[3] });
    }
    return { set: normSet(out), badInf: badInf };
  }
  function parseIneq(s, varName) { // "x < 3", "-2 <= x < 5", "x < -1 or x > 2", "x != 3", "3 > x" -> { set } or { err, msg }
    s = cleanInput(s);
    if (NO_SOL.test(s)) return { set: [] };
    if (ALL_REAL.test(s)) return { set: [{ lo: -Infinity, hi: Infinity, loC: false, hiC: false }] };
    if (/^[\[(]/.test(s.trim()) && /[\])]$/.test(s.trim())) return parseIntervals(s);
    var ors = s.split(/\s+or\s+|\s*∪\s*/i), total = [];
    for (var i = 0; i < ors.length; i++) {
      var ands = ors[i].split(/\s+and\s+|\s*&&?\s*/i), cur = [{ lo: -Infinity, hi: Infinity, loC: false, hiC: false }];
      for (var j = 0; j < ands.length; j++) {
        var r = parse(ands[j]); if (!r.ok) return { err: true, msg: r.err };
        if (r.node.t !== 'rel') return { err: true, msg: 'Write an inequality, like x < 3.' };
        var piece = relToSet(r.node, varName); if (piece.err) return piece;
        cur = intersect(cur, piece.set);
      }
      total = total.concat(cur);
    }
    return { set: normSet(total) };
  }
  function relToSet(rel, varName) {
    var a = rel.a, ops = rel.ops, vi = -1;
    for (var i = 0; i < a.length; i++) if (a[i].t === 'var') { if (vi >= 0) return { err: true }; vi = i; }
    if (vi < 0) return { err: true, msg: 'Solve for ' + (varName || 'x') + ': get it by itself on one side.' };
    if (varName && a[vi].s !== varName) return { err: true, msg: 'Use the variable ' + varName + '.' };
    var set = [{ lo: -Infinity, hi: Infinity, loC: false, hiC: false }];
    for (var k = 0; k < ops.length; k++) {
      var L = k, R = k + 1, op = ops[k];
      if (L !== vi && R !== vi) continue;
      var other = L === vi ? a[R] : a[L], v;
      if (hasVarNode(other)) return { err: true, msg: 'Solve for ' + a[vi].s + ': get it by itself on one side.' };
      try { v = ML.evalPlain(ML.plainToCAS(other)); } catch (e) { return { err: true }; }
      if (typeof v !== 'number' || isNaN(v)) return { err: true };
      if (L !== vi) op = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '=': '=', '!=': '!=' }[op];
      var piece;
      if (op === '<') piece = [{ lo: -Infinity, hi: v, loC: false, hiC: false }];
      else if (op === '<=') piece = [{ lo: -Infinity, hi: v, loC: false, hiC: true }];
      else if (op === '>') piece = [{ lo: v, hi: Infinity, loC: false, hiC: false }];
      else if (op === '>=') piece = [{ lo: v, hi: Infinity, loC: true, hiC: false }];
      else if (op === '=') piece = [{ lo: v, hi: v, loC: true, hiC: true }];
      else piece = [{ lo: -Infinity, hi: v, loC: false, hiC: false }, { lo: v, hi: Infinity, loC: false, hiC: false }];
      set = intersect(set, piece);
    }
    return { set: set };
  }
  function intersect(A, B) {
    var out = [];
    A.forEach(function (I) { B.forEach(function (J) {
      var lo = Math.max(I.lo, J.lo), hi = Math.min(I.hi, J.hi);
      var loC = I.lo === J.lo ? I.loC && J.loC : (I.lo > J.lo ? I.loC : J.loC), hiC = I.hi === J.hi ? I.hiC && J.hiC : (I.hi < J.hi ? I.hiC : J.hiC);
      if (lo < hi || (lo === hi && loC && hiC)) out.push({ lo: lo, hi: hi, loC: loC, hiC: hiC });
    }); });
    return out;
  }
  function sameSets(A, B, ignoreClosed) {
    if (A.length !== B.length) return false;
    for (var i = 0; i < A.length; i++) {
      if (!relEq(A[i].lo, B[i].lo) || !relEq(A[i].hi, B[i].hi)) return false;
      if (!ignoreClosed && (A[i].loC !== B[i].loC || A[i].hiC !== B[i].hiC)) return false;
    }
    return true;
  }
  function endpoints(S) { var e = []; S.forEach(function (I) { if (isFinite(I.lo)) e.push(I.lo); if (isFinite(I.hi)) e.push(I.hi); }); return e.sort(function (a, b) { return a - b; }); }
  function setMsg(L, C, kind) {
    if (sameSets(L, C, true)) return kind === 'ineq' ? 'Check the endpoints: should they be included (≤ or <)?' : 'Check the brackets: is each endpoint included?';
    var a = endpoints(L), b = endpoints(C);
    if (a.length && a.length === b.length && a.every(function (x, i) { return relEq(x, b[i]); })) return kind === 'ineq' ? 'Check the direction of the inequality sign.' : 'Right endpoints, wrong part of the number line.';
    return undefined;
  }
  function checkInterval(spec, answer) {
    var s = cleanInput(answer); if (!s) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var C = parseIntervals(spec.v === 'all' ? 'all real numbers' : spec.v); if (C.err) throw new Error('Bad interval answer "' + spec.v + '"');
    if (/[<>≤≥]/.test(s) && !/^[\[(]/.test(s)) return { ok: false, invalid: true, msg: 'Write it in interval notation, like (-∞, 3].' };
    var L = parseIntervals(s);
    if (L.err) return { ok: false, invalid: true, msg: L.msg || 'Write it in interval notation, like (-∞, 3] or [2, 5).' };
    if (sameSets(L.set, C.set)) return L.badInf ? { ok: false, msg: 'Almost: ∞ always gets a parenthesis, not a bracket.', form: true } : { ok: true };
    return { ok: false, msg: setMsg(L.set, C.set, 'interval') };
  }
  function checkIneq(spec, answer) {
    var s = cleanInput(answer); if (!s) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var cv = str(spec.v), vm = /[a-zA-Z]/.exec(cv.replace(/\b(or|and|inf|all|real|numbers?|no|solution)\b/gi, '')), varName = spec.vars && spec.vars[0] || (vm ? vm[0] : 'x');
    var C = parseIneq(cv === 'all' ? 'all real numbers' : cv === 'none' ? 'no solution' : cv, varName); if (C.err) throw new Error('Bad ineq answer "' + spec.v + '"');
    var L = parseIneq(s, varName);
    if (L.err) return { ok: false, invalid: !L.msg || /Write|Use the|Solve/.test(L.msg), msg: L.msg || 'Write an inequality, like ' + varName + ' < 3.' };
    if (sameSets(L.set, C.set)) return { ok: true };
    return { ok: false, msg: setMsg(L.set, C.set, 'ineq') };
  }

  // ===================================================================== choices, words
  function checkMc(spec, answer) {
    var want = Array.isArray(spec.v) ? spec.v.slice().sort() : [spec.v];
    var got = answer;
    if (typeof got === 'string' && !/^\d+$/.test(got.trim())) { var ix = spec.choices.map(String).indexOf(got); got = ix; }
    if (got === null || got === undefined || got === -1 || (Array.isArray(got) && !got.length)) return { ok: false, invalid: true, msg: 'Pick an answer first.' };
    got = (Array.isArray(got) ? got : [got]).map(Number).sort();
    var ok = got.length === want.length && got.every(function (g, i) { return g === want[i]; });
    if (ok) return { ok: true };
    if (Array.isArray(spec.v)) {
      var right = got.filter(function (g) { return want.indexOf(g) >= 0; }).length;
      if (right === got.length && right < want.length) return { ok: false, msg: 'Those are right, but there are more.' };
      if (right === want.length && got.length > want.length) return { ok: false, msg: 'One of those doesn\'t belong.' };
    }
    return { ok: false };
  }
  function checkTf(spec, answer) {
    var a = answer;
    if (typeof a === 'string') { var s = a.trim().toLowerCase(); a = /^(t|true|yes|y)$/.test(s) ? true : /^(f|false|no|n)$/.test(s) ? false : null; }
    if (a !== true && a !== false) return { ok: false, invalid: true, msg: 'Pick True or False.' };
    return { ok: a === spec.v };
  }
  function normWord(s) { return str(s).trim().toLowerCase().replace(/[’']/g, '\'').replace(/[.!]+$/, '').replace(/^(a|an|the)\s+/, '').replace(/\s+/g, ' ').trim(); }
  // ===================================================================== chemical formulas { t: 'formula', v: ['H2O'], states? }
  var ELEMENTS = ('H hydrogen,He helium,Li lithium,Be beryllium,B boron,C carbon,N nitrogen,O oxygen,F fluorine,Ne neon,Na sodium,Mg magnesium,' +
    'Al aluminum,Si silicon,P phosphorus,S sulfur,Cl chlorine,Ar argon,K potassium,Ca calcium,Sc scandium,Ti titanium,V vanadium,Cr chromium,' +
    'Mn manganese,Fe iron,Co cobalt,Ni nickel,Cu copper,Zn zinc,Ga gallium,Ge germanium,As arsenic,Se selenium,Br bromine,Kr krypton,Rb rubidium,' +
    'Sr strontium,Y yttrium,Zr zirconium,Nb niobium,Mo molybdenum,Tc technetium,Ru ruthenium,Rh rhodium,Pd palladium,Ag silver,Cd cadmium,In indium,' +
    'Sn tin,Sb antimony,Te tellurium,I iodine,Xe xenon,Cs cesium,Ba barium,La lanthanum,Ce cerium,Pr praseodymium,Nd neodymium,Pm promethium,' +
    'Sm samarium,Eu europium,Gd gadolinium,Tb terbium,Dy dysprosium,Ho holmium,Er erbium,Tm thulium,Yb ytterbium,Lu lutetium,Hf hafnium,Ta tantalum,' +
    'W tungsten,Re rhenium,Os osmium,Ir iridium,Pt platinum,Au gold,Hg mercury,Tl thallium,Pb lead,Bi bismuth,Po polonium,At astatine,Rn radon,' +
    'Fr francium,Ra radium,Ac actinium,Th thorium,Pa protactinium,U uranium,Np neptunium,Pu plutonium,Am americium,Cm curium,Bk berkelium,' +
    'Cf californium,Es einsteinium,Fm fermium,Md mendelevium,No nobelium,Lr lawrencium,Rf rutherfordium,Db dubnium,Sg seaborgium,Bh bohrium,' +
    'Hs hassium,Mt meitnerium,Ds darmstadtium,Rg roentgenium,Cn copernicium,Nh nihonium,Fl flerovium,Mc moscovium,Lv livermorium,Ts tennessine,Og oganesson')
    .split(',').reduce(function (m, x) { var p = x.split(' '); m[p[0]] = p[1]; return m; }, {});
  var COMPOUND = { H2O: 'water', CO: 'carbon monoxide', CO2: 'carbon dioxide', NO: 'nitrogen monoxide', NO2: 'nitrogen dioxide', N2O: 'dinitrogen monoxide',
    SO2: 'sulfur dioxide', SO3: 'sulfur trioxide', NaCl: 'sodium chloride', HCl: 'hydrogen chloride', NH3: 'ammonia', CH4: 'methane', H2O2: 'hydrogen peroxide',
    O2: 'oxygen gas', N2: 'nitrogen gas', H2: 'hydrogen gas', O3: 'ozone', CaCO3: 'calcium carbonate', NaOH: 'sodium hydroxide', H2SO4: 'sulfuric acid' };
  var SUBD = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
  var SUPD = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-' };
  function fNorm(s) { // spacing, Unicode sub- and superscripts, hydrate dots, TeX-ish _ { } -> one plain string
    s = str(s).replace(/[ \s]+/g, '').replace(/[−–—]/g, '-');
    s = s.replace(/[₀-₉]/g, function (c) { return SUBD[c]; }).replace(/[⁰¹²³⁴-⁹⁺⁻]+/g, function (x) { return '^' + x.split('').map(function (c) { return SUPD[c]; }).join(''); });
    s = s.replace(/\\cdot|[·•∙⋅*]/g, '·').replace(/([A-Za-z0-9)\]])\.(?=[0-9A-Z(])/g, '$1·');
    return s.replace(/\\mathrm|\\text|[_{}$]/g, '');
  }
  // one reading of a normalized formula -> { parts: [{ coef, toks }], charge, hasCharge, state, one (an explicit subscript 1), lead (a
  // number in front) } or null. toks: ['el', sym, n] | ['grp', open, toks, n, close]. ambig: digits before a final sign with no ^
  // (Fe3+, SO42-, NH4+): k of them are the charge's size.
  function fParse(s, k) {
    var st = null, m = /\((s|l|g|aq)\)$/i.exec(s);
    if (m) { st = m[1].toLowerCase(); s = s.slice(0, m.index); }
    var charge = 0, hasCharge = false;
    if ((m = /\^\(?(\d*)([+-])\)?$/.exec(s)) || (m = /\^\(?([+-])(\d*)\)?$/.exec(s))) {
      var both = m[1] + m[2], dg = both.replace(/[+-]/g, ''), sg = both.replace(/\d/g, '');
      charge = (dg ? +dg : 1) * (sg === '-' ? -1 : 1); hasCharge = true; s = s.slice(0, m.index);
    } else if ((m = /(\d*)([+-]+)$/.exec(s)) && m.index > 0) {
      var digs = m[1], kk = Math.min(k || 0, digs.length), signs = m[2];
      if (signs.length > 1 && (digs.length || /[+]/.test(signs) && /-/.test(signs))) return null;
      charge = (signs.length > 1 ? signs.length : kk ? +digs.slice(digs.length - kk) : 1) * (signs.charAt(0) === '-' ? -1 : 1); hasCharge = true;
      s = s.slice(0, m.index) + digs.slice(0, digs.length - kk);
    }
    if (!s || /[^A-Za-z0-9()[\]·]/.test(s)) return null;
    var parts = [], one = false, lead = false;
    var pieces = s.split('·');
    for (var pi = 0; pi < pieces.length; pi++) {
      var p = pieces[pi], cm = /^(\d+)/.exec(p), coef = 1;
      if (cm) { coef = +cm[1]; p = p.slice(cm[1].length); if (pi === 0) lead = true; }
      if (!p || coef < 1) return null;
      var pos = 0;
      var seq = (function group(close) {
        var out = [];
        while (pos < p.length) {
          var c = p.charAt(pos);
          if (c === ')' || c === ']') { if (c !== close) throw 0; pos++; return out; }
          var tok;
          if (c === '(' || c === '[') { pos++; var inner = group(c === '(' ? ')' : ']'); if (!inner.length) throw 0; tok = ['grp', c, inner, 1, c === '(' ? ')' : ']']; }
          else { var em = /^[A-Za-z][a-z]?/.exec(p.slice(pos)); if (!em) throw 0; tok = ['el', em[0], 1]; pos += em[0].length; }
          var nm = /^\d+/.exec(p.slice(pos));
          if (nm) { var n = +nm[0]; if (n === 0) throw 0; if (n === 1) one = true; if (tok[0] === 'el') tok[2] = n; else tok[3] = n; pos += nm[0].length; }
          out.push(tok);
        }
        if (close) throw 0;
        return out;
      });
      try { seq = seq(null); } catch (e) { return null; }
      parts.push({ coef: coef, toks: seq });
    }
    return { parts: parts, charge: charge, hasCharge: hasCharge, state: st, one: one, lead: lead };
  }
  function fCanon(F, withState) { // the canonical string: "Ca(OH)2", "CuSO4·5H2O", "SO4^2-", "Fe^3+(aq)"
    function seq(toks) { return toks.map(function (t) { return t[0] === 'el' ? t[1] + (t[2] > 1 ? t[2] : '') : t[1] + seq(t[2]) + t[4] + (t[3] > 1 ? t[3] : ''); }).join(''); }
    var s = F.parts.map(function (p, i) { return (p.coef > 1 ? p.coef : '') + seq(p.toks); }).join('·');
    if (F.charge) s += '^' + (Math.abs(F.charge) > 1 ? Math.abs(F.charge) : '') + (F.charge > 0 ? '+' : '-');
    return s + (withState && F.state ? '(' + F.state + ')' : '');
  }
  function fValid(F) { var ok = true; (function walk(ts) { ts.forEach(function (t) { if (t[0] === 'el') { if (!ELEMENTS[t[1]]) ok = false; } else walk(t[2]); }); })([].concat.apply([], F.parts.map(function (p) { return p.toks; }))); return ok; }
  function fAtoms(F) { // element -> count (groups and hydrate coefficients multiplied out)
    var out = {};
    F.parts.forEach(function (p) { (function walk(ts, k) { ts.forEach(function (t) { if (t[0] === 'el') out[t[1]] = (out[t[1]] || 0) + t[2] * k; else walk(t[2], k * t[3]); }); })(p.toks, p.coef); });
    return out;
  }
  function fShape(F) { return F.parts.length + '|' + F.parts.map(function (p) { return JSON.stringify(p.toks.map(function (t) { return t[0] === 'grp' ? 'g' : 'e'; })); }).join(); }
  function fReadings(raw) { // every reading of a typed answer (more than one only for "Fe3+", "SO42-", "NH4+")
    var s = fNorm(raw), out = [], m = /(\d+)[+-]$/.exec(s.replace(/\((s|l|g|aq)\)$/i, '')), max = m && !/\^/.test(s) ? 1 : 0;
    for (var k = 0; k <= max; k++) { var F = fParse(s, k); if (F) out.push(F); }
    return out;
  }
  function fSpecForms(spec) {
    return (Array.isArray(spec.v) ? spec.v : [spec.v]).map(function (v) { var F = fParse(fNorm(v), 0); if (!F) throw new Error('Bad formula "' + v + '" in the answer spec'); return F; });
  }
  function fDescribe(F) { // "Co is cobalt", "CO is carbon monoxide", "NaCl is sodium and chlorine"
    var c = fCanon(F, false), els = Object.keys(fAtoms(F));
    if (COMPOUND[c]) return c + ' is ' + COMPOUND[c];
    if (!fValid(F)) return null;
    var names = els.map(function (e) { return ELEMENTS[e]; });
    return c + ' is ' + (names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]);
  }
  function checkFormula(spec, answer) {
    var raw = str(answer).trim();
    if (!raw) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var E = fSpecForms(spec), withSt = !!spec.states, T = fReadings(raw);
    var want = E.map(function (F) { return fCanon(F, withSt); });
    if (!T.length) {
      var low = fNorm(raw).toLowerCase();
      if (E.some(function (F) { return fCanon(F, false).toLowerCase() === low.replace(/\((s|l|g|aq)\)$/, ''); })) return { ok: false, msg: 'Check capital letters: each element symbol starts with a capital letter, and a second letter is lowercase.' };
      return { ok: false, invalid: true, msg: 'Type a chemical formula, like H2O, Ca(OH)2 or SO4^2- (a charge goes after the formula: Fe^3+).' };
    }
    var hit = null;
    T.forEach(function (F) { if (!hit && want.indexOf(fCanon(F, withSt)) >= 0) hit = F; });
    if (!hit && /^[a-z\s]{3,}$/.test(raw) && !E.some(function (X) { return fCanon(X, false).toLowerCase() === raw.replace(/\s+/g, ''); })) return { ok: false, invalid: true, msg: 'Type the chemical formula (like H2O), not its name.' };
    if (hit) {
      if (hit.one) return { ok: false, msg: 'Equal, but leave out subscripts of 1: write ' + fCanon(hit, withSt) + '.', form: true };
      if (!fValid(hit)) return { ok: false };
      return { ok: true };
    }
    // near misses, for the reading that comes closest
    var notes = [];
    T.forEach(function (F) {
      E.forEach(function (X) {
        var tc = fCanon(F, false), xc = fCanon(X, false), ta = fAtoms(F), xa = fAtoms(X);
        if (withSt && tc === xc && F.charge === X.charge) notes.push([1, F.state ? 'Check the state symbol.' : 'Include the state symbol: (s), (l), (g) or (aq).']);
        else if (tc.toLowerCase() === xc.toLowerCase() && tc !== xc) {
          var dt = fDescribe(F), dx = fDescribe(X);
          notes.push([2, 'Check capital letters' + (dt && dx ? ': ' + dt + ', but ' + dx + '.' : ': each element symbol starts with a capital letter, and a second letter is lowercase.')]);
        } else if (JSON.stringify(sortObj(ta)) === JSON.stringify(sortObj(xa)) && F.charge === X.charge) {
          notes.push([3, fShape(F) !== fShape(X) && (/[([]/.test(xc) || /·/.test(xc)) ? 'Those are the right atoms, but keep each group together the standard way, with parentheses' + (/·/.test(xc) ? ' or a hydrate dot' : '') + ', like ' + xc + '.' : 'Those are the right atoms in the right numbers, but formulas are written in a standard order. Check which element comes first.']);
        } else if (JSON.stringify(sortObj(ta)) === JSON.stringify(sortObj(xa))) {
          notes.push([4, !F.hasCharge ? 'Include the charge, written like ^2- or ^+ after the formula.' : !X.charge ? 'This one has no charge.' : 'Check the charge.']);
        } else if (X.parts.length > 1 && F.parts.length === 1 && JSON.stringify(sortObj(ta)) === JSON.stringify(sortObj(fAtoms({ parts: [X.parts[0]] })))) {
          notes.push([5, 'This one is a hydrate: include its water after a dot, like ·' + fCanon({ parts: X.parts.slice(1), charge: 0 }, false) + '.']);
        } else if (F.lead && F.parts.length === X.parts.length && sameMultiple(ta, xa)) {
          notes.push([5, 'Leave out the number in front: give just the formula.']);
        } else if (Object.keys(ta).sort().join() === Object.keys(xa).sort().join() && fValid(F)) notes.push([6, 'The right elements, but check the subscripts.']);
        else if (!fValid(F)) { var bad = []; (function walk(ts) { ts.forEach(function (t) { if (t[0] === 'el') { if (!ELEMENTS[t[1]] && bad.indexOf(t[1]) < 0) bad.push(t[1]); } else walk(t[2]); }); })([].concat.apply([], F.parts.map(function (p) { return p.toks; }))); notes.push([7, bad.join(', ') + (bad.length > 1 ? ' aren’t element symbols.' : ' isn’t an element symbol.')]); }
      });
    });
    notes.sort(function (a, b) { return a[0] - b[0]; });
    return notes.length ? { ok: false, msg: notes[0][1] } : { ok: false };
  }
  function sortObj(o) { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = o[k]; }); return r; }
  function sameMultiple(a, b) { var ks = Object.keys(b); if (Object.keys(a).sort().join() !== ks.sort().join()) return false; var f = a[ks[0]] / b[ks[0]]; return f > 1 && Math.round(f) === f && ks.every(function (k) { return a[k] === f * b[k]; }); }
  // a formula as TeX ("\mathrm{SO}_{4}^{2-}"); lenient, for the live preview too (letters as typed)
  function formulaTex(raw) {
    var s = fNorm(raw), st = '', m = /\((s|l|g|aq)\)$/i.exec(s), ch = '';
    if (m) { st = '\\,\\mathrm{(' + m[1] + ')}'; s = s.slice(0, m.index); }
    if ((m = /\^\(?([0-9]*[+-]|[+-][0-9]*)\)?$/.exec(s))) { ch = m[1].replace(/^([+-])(\d+)$/, '$2$1'); s = s.slice(0, m.index); }
    else if ((m = /^(.*?)(\d*)([+-])$/.exec(s))) { // no ^: Fe3+ and Cu2+ (one element: the digit is the charge), SO42- and
      var body = m[1], d = m[2], sg = m[3];   // Hg22+ (two digits: the last one is), NH4+ and H3O+ (otherwise a subscript)
      if (d.length >= 2) { ch = d.slice(-1) + sg; s = body + d.slice(0, -1); }
      else if (d.length === 1 && /^[A-Z][a-z]?$/.test(body)) { ch = d + sg; s = body; }
      else { ch = sg; s = body + d; }
    }
    if (/[^A-Za-z0-9()[\]·]/.test(s) || !s) throw new Error('not a formula');
    var out = '', i = 0, start = true;
    while (i < s.length) {
      var c = s.charAt(i), rest = s.slice(i), mm;
      if (c === '·') { out += '\\cdot '; i++; start = true; continue; }
      if (start && (mm = /^\d+/.exec(rest))) { out += mm[0]; i += mm[0].length; start = false; continue; }
      start = false;
      if ((mm = /^[A-Za-z]+/.exec(rest))) { out += '\\mathrm{' + mm[0] + '}'; i += mm[0].length; }
      else if (c === '(' || c === '[') { out += c; i++; }
      else if (c === ')' || c === ']') { out += c; i++; }
      else if ((mm = /^\d+/.exec(rest))) { out += '_{' + mm[0] + '}'; i += mm[0].length; }
      else throw new Error('not a formula');
    }
    if (ch) out += '^{' + ch + '}';
    return out + st;
  }

  // ===================================================================== logic formulas { t: 'prop', v, match }
  // Parsed and compared with MathLadder.logic (static/logic/viz/logic.js; loaded on Logic pages, required here in node).
  function LGM() { if (!ML.logic) need('../../logic/viz/logic.js'); return ML.logic || null; }
  var PVARS = 'xyzwuv';
  // typed forms -> what the logic parser reads: Ax / Ex / (Ax) / (∀x) quantifiers, a lone v for "or", iff, implies
  function propNorm(raw) {
    var s = str(raw).replace(/[​ ]/g, ' ').replace(/−|–|—/g, '-').replace(/⋀/g, '∧').replace(/⋁/g, '∨').replace(/⇔|⟺/g, '↔').replace(/⇒|⟹/g, '→').replace(/∼/g, '~').trim();
    s = s.replace(/\biff\b/gi, ' ↔ ').replace(/\bimplies\b/gi, ' → ').replace(/\bthen\b/gi, ' → ');
    var Q = '(?=\\s*(?:[(\\[A-Z¬~!∀∃]|-(?!>)))';
    s = s.replace(/\(\s*([∀∃])\s*([xyzwuv])\s*\)/g, '$1$2');
    s = s.replace(new RegExp('\\(\\s*([AE])\\s*([xyzwuv])\\s*\\)' + Q, 'g'), function (m, q, v) { return (q === 'A' ? '∀' : '∃') + v; });
    var prev;
    do { prev = s; s = s.replace(new RegExp('(^|[^A-Za-z′\']|[∀∃][xyzwuv])([AE])([xyzwuv])' + Q, 'g'), function (m, pre, q, v) { return pre + (q === 'A' ? '∀' : '∃') + v; }); } while (s !== prev);
    // a lone v is "or", unless v is used as a variable (∀v, Fv, (v))
    if (!/[∀∃]\s*v|[A-Z][a-z]*v|\(\s*v\s*\)/.test(s)) s = s.replace(/(^|[^A-Za-z∀∃])v(?=[^A-Za-z′']|$)/g, '$1∨');
    return s;
  }
  function propParse(raw) { var L = LGM(); return L.parse(propNorm(raw)); }
  function propQuant(f) { var q = false; (function go(g) { if (g.t === 'all' || g.t === 'some' || g.t === 'pred' || g.t === 'eq') q = true; else if (g.a && typeof g.a === 'object') { go(g.a); if (g.b && typeof g.b === 'object') go(g.b); } })(f); return q; }
  function propKids(g) { return g.t === 'not' || g.t === 'all' || g.t === 'some' ? [g.a] : (g.t === 'and' || g.t === 'or' || g.t === 'imp' || g.t === 'iff') ? [g.a, g.b] : []; }
  // the formula with bound variables renamed in order (so ∀y Fy and ∀x Fx have one key)
  function propAlpha(f) {
    var n = 0;
    function go(g, env) {
      function r(a) { return env[a] || a; }
      switch (g.t) {
        case 'pred': return { t: 'pred', p: g.p, args: g.args.map(r) };
        case 'eq': return { t: 'eq', a: r(g.a), b: r(g.b) };
        case 'all': case 'some': { var nv = '_' + (n++), e = Object.assign({}, env); e[g.v] = nv; return { t: g.t, v: nv, a: go(g.a, e) }; }
        case 'not': return { t: 'not', a: go(g.a, env) };
        case 'atom': case 'bot': return g;
        default: return { t: g.t, a: go(g.a, env), b: go(g.b, env) };
      }
    }
    return JSON.stringify(go(f, {}));
  }
  // what a formula uses: statement letters, predicates with their number of places, names, free variables
  function propSig(f, sig) {
    sig = sig || { atoms: {}, preds: {}, names: {}, free: {} };
    (function go(g, bound) {
      if (g.t === 'atom') sig.atoms[g.p] = 1;
      else if (g.t === 'pred') { sig.preds[g.p] = Math.max(sig.preds[g.p] || 0, g.args.length); g.args.forEach(term); }
      else if (g.t === 'eq') { term(g.a); term(g.b); }
      else if (g.t === 'all' || g.t === 'some') { var b = Object.assign({}, bound); b[g.v] = 1; go(g.a, b); }
      else propKids(g).forEach(function (k) { go(k, bound); });
      function term(a) { if (PVARS.indexOf(a.charAt(0)) >= 0) { if (!bound[a]) sig.free[a] = 1; } else sig.names[a] = 1; }
    })(f, {});
    return sig;
  }
  // equivalence: truth tables for statement logic; for predicate logic, every small world (domains of 1 to 3 objects,
  // all of them when there are few, else a fixed sample of 4000, plus a sample of 4-object worlds)
  function propEquiv(A, B) {
    var L = LGM();
    if (!propQuant(A) && !propQuant(B)) return L.equivalent(A, B);
    var sig = propSig(B, propSig(A));
    var atoms = Object.keys(sig.atoms), preds = Object.keys(sig.preds), names = Object.keys(sig.names).concat(Object.keys(sig.free));
    var seed = 12345; function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    for (var n = 1; n <= 4; n++) {
      var ids = []; for (var i = 0; i < n; i++) ids.push('o' + i);
      var slots = []; // [kind, pred, tuple] one bit each
      atoms.forEach(function (a) { slots.push(['atom', a]); });
      preds.forEach(function (P) {
        var k = sig.preds[P];
        (function tup(pre) { if (pre.length === k) { slots.push(['pred', P, pre]); return; } ids.forEach(function (o) { tup(pre.concat([o])); }); })([]);
      });
      var nBits = slots.length, nNames = Math.pow(n, names.length), total = Math.pow(2, nBits) * nNames;
      var exhaustive = total <= 4096 && n <= 3, count = exhaustive ? total : (n <= 3 ? 4000 : 1500);
      for (var w = 0; w < count; w++) {
        var bits, nameIx;
        if (exhaustive) { bits = Math.floor(w / nNames); nameIx = w % nNames; }
        else { bits = null; nameIx = Math.floor(rnd() * nNames); }
        var world = { objects: ids.map(function (o) { return { n: o, has: [] }; }), rels: {}, props: {}, names: {} };
        slots.forEach(function (sl, bi) {
          var on = bits === null ? rnd() < 0.5 : !!(Math.floor(bits / Math.pow(2, bi)) % 2);
          if (!on) return;
          if (sl[0] === 'atom') world.props[sl[1]] = true;
          else if (sl[2].length === 1) world.objects[ids.indexOf(sl[2][0])].has.push(sl[1]);
          else (world.rels[sl[1]] = world.rels[sl[1]] || []).push(sl[2]);
        });
        names.forEach(function (nm) { world.names[nm] = ids[nameIx % n]; nameIx = Math.floor(nameIx / n); });
        if (L.evalWorld(A, world) !== L.evalWorld(B, world)) return false;
      }
    }
    return true;
  }
  function propSpecForms(spec) {
    return (Array.isArray(spec.v) ? spec.v : [spec.v]).map(function (v) { try { return propParse(v); } catch (e) { throw new Error('Bad formula "' + v + '" in the answer spec'); } });
  }
  // strip the quantifiers the two formulas share at the front
  function propCore(A, B) { while ((A.t === 'all' || A.t === 'some') && A.t === B.t) { A = A.a; B = B.a; } return [A, B]; }
  function checkProp(spec, answer) {
    var L = LGM();
    if (!L) return { ok: false, invalid: true, msg: 'The logic checker hasn\'t loaded yet. Try again in a moment.' };
    var raw = str(answer).trim();
    if (!raw) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var E = propSpecForms(spec), F;
    try { F = propParse(raw); }
    catch (e) {
      if (/(^|[^A-Za-z])[a-w][A-Z]/.test(raw) && E.some(function (X) { return Object.keys(propSig(X).preds).length; })) return { ok: false, msg: 'Write the predicate letter first, then the name: Fa says that a is F.' };
      return { ok: false, invalid: true, msg: 'I can\'t read that formula' + (e && e.logic ? ': ' + e.message : '.') + ' Use ¬ ∧ ∨ → ↔ (or ~ & v -> <->) and parentheses.' };
    }
    var exact = spec.match === 'exact', fk = propAlpha(F);
    if (E.some(function (X) { return propAlpha(X) === fk; })) return { ok: true };
    var eq = E.some(function (X) { return propEquiv(X, F); });
    if (eq && !exact) return { ok: true };
    if (eq) return { ok: false, form: true, msg: 'That says the same thing, but this asks for one exact formula. Check the grouping and the order of the parts.' };
    // notes, only when we are sure what happened
    var X = E[0], fs = propSig(F), xs = propSig(X);
    var fFree = Object.keys(fs.free).filter(function (v) { return !xs.free[v]; });
    if (fFree.length) return { ok: false, msg: 'The variable ' + fFree[0] + ' is free here: every variable needs a quantifier that covers it.' };
    var cr = propCore(X, F), x = cr[0], f = cr[1];
    if (x.t === 'imp' && f.t === 'imp' && L.same(x.a, f.b) && L.same(x.b, f.a)) return { ok: false, msg: 'That\'s the converse: the arrow points the wrong way. Which part is the condition?' };
    if ((X.t === 'all' && F.t === 'all' && X.a.t === 'imp' && F.a.t === 'and' && L.same(X.a.a, F.a.a)) ) return { ok: false, msg: 'With ∀, the connective is usually →. ∀x(Sx ∧ Px) says everything is both S and P.' };
    if ((X.t === 'some' && F.t === 'some' && X.a.t === 'and' && F.a.t === 'imp' && L.same(X.a.a, F.a.a))) return { ok: false, msg: 'With ∃, the connective is usually ∧. ∃x(Sx → Px) is true as soon as anything is not S.' };
    if (x.t === 'not' && (x.a.t === 'and' || x.a.t === 'or') && (f.t === 'and' || f.t === 'or') && f.a.t === 'not' && L.same(f.a.a, x.a.a)) {
      if (f.t === x.a.t && f.b.t === 'not' && L.same(f.b.a, x.a.b)) return { ok: false, msg: 'Check the ¬: moving it inside the parentheses changes ' + (x.a.t === 'and' ? '∧ to ∨' : '∨ to ∧') + ' (De Morgan).' };
    }
    if (x.t === 'not' && f.t !== 'not') {
      var fa = f; if ((fa.t === 'and' || fa.t === 'or' || fa.t === 'imp' || fa.t === 'iff') && fa.a.t === 'not' && fa.t === x.a.t && L.same(fa.a.a, x.a.a) && L.same(fa.b, x.a.b)) return { ok: false, msg: 'Check what the ¬ covers: here it should apply to the whole ' + (x.a.t === 'and' ? 'conjunction' : x.a.t === 'or' ? 'disjunction' : x.a.t === 'imp' ? 'conditional' : 'biconditional') + '.' };
    }
    var bare = Object.keys(fs.atoms).filter(function (a) { return /[A-Z]/.test(a) && xs.preds[a]; });
    if (bare.length) return { ok: false, msg: 'The predicate ' + bare[0] + ' needs a name or variable after it, like ' + bare[0] + 'a or ' + bare[0] + 'x.' };
    var extra = Object.keys(fs.atoms).filter(function (a) { return !xs.atoms[a]; }).concat(Object.keys(fs.preds).filter(function (a) { return !xs.preds[a]; }));
    if (extra.length && !E.some(function (Y) { var ys = propSig(Y); return Object.keys(fs.atoms).every(function (a) { return ys.atoms[a]; }) && Object.keys(fs.preds).every(function (a) { return ys.preds[a]; }); })) return { ok: false, msg: 'Check your letters: ' + extra.join(', ') + (extra.length > 1 ? ' are' : ' is') + ' not part of this one.' };
    return { ok: false };
  }
  function propShow(v) { try { return LGM().show(propParse(v)); } catch (e) { return str(v); } }
  var PROP_TEX = { '¬': '\\neg ', '∧': '\\land ', '∨': '\\lor ', '→': '\\to ', '↔': '\\leftrightarrow ', '∀': '\\forall ', '∃': '\\exists ', '≠': '\\ne ', '⊥': '\\bot ', '′': "'" };
  // a formula as TeX in the Logic Ladder's style (\neg (p \land q) \to r, \forall x(Fx \to Gx)); throws if it can't be read
  function propTex(v) { return LGM().show(propParse(v)).replace(/[¬∧∨→↔∀∃≠⊥′]/g, function (c) { return PROP_TEX[c]; }).replace(/ +/g, ' ').trim(); }


  // ===================================================================== Egyptian transliteration { t: 'translit', v, strict }
  // one letter at a time (after NFD, so a base letter and its combining marks stay together), Unicode and MdC alike
  var TL_PLAIN = { A: 'ꜣ', '3': 'ꜣ', 'ȝ': 'ꜣ', 'Ȝ': 'ꜣ', 'Ꜣ': 'ꜣ', 'ꜣ': 'ꜣ', a: 'ꜥ', 'ʿ': 'ꜥ', 'ʽ': 'ꜥ', '‘': 'ꜥ', '`': 'ꜥ', 'Ꜥ': 'ꜥ', 'ꜥ': 'ꜥ',
    i: 'j', I: 'j', j: 'j', J: 'j', 'ꞽ': 'j', 'Ꞽ': 'j', 'ı': 'j', y: 'y', Y: 'y', H: 'ḥ', x: 'ḫ', X: 'ẖ', S: 'š', T: 'ṯ', D: 'ḏ', Z: 'z', z: 'z',
    Q: 'q', q: 'q', w: 'w', W: 'w', b: 'b', B: 'b', p: 'p', P: 'p', f: 'f', F: 'f', m: 'm', M: 'm', n: 'n', N: 'n', r: 'r', R: 'r',
    h: 'h', s: 's', k: 'k', K: 'k', g: 'g', G: 'g', t: 't', d: 'd', l: 'l', L: 'l', 'ꜧ': 'ḥ' };
  // base (lowercase) + combining mark -> letter
  var TL_MARK = { 'ḥ': 'ḥ', 'ḫ': 'ḫ', 'ẖ': 'ẖ', 'h̲': 'ẖ', 'š': 'š', 'ś': 'z', 'ṯ': 'ṯ', 't̲': 'ṯ',
    'ḏ': 'ḏ', 'd̲': 'ḏ', 'ḳ': 'q', 'i͗': 'j', 'i̯': 'j', 'ỉ': 'j', 'ı͗': 'j', 'j͗': 'j', 'ẓ': 'z' };
  var TL_SEP = /[\s.\-=‧·‐‑–—()[\]{}⸢⸣⟨⟩<>\/:,;'’"?!]/;
  // letters in order, null for a character that is no transliteration letter; seps: keep the separators (for display)
  function tlLetters(raw, seps) {
    var s = str(raw).normalize ? str(raw).normalize('NFD') : str(raw), out = [], bad = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (/[̀-ͯ]/.test(c)) continue; // a stray mark
      var marks = ''; while (i + 1 < s.length && /[̀-ͯ]/.test(s[i + 1])) marks += s[++i];
      if (TL_SEP.test(c)) { if (c === '’' && !seps) { out.push('ꜥ'); continue; } if (seps) out.push(c === '‐' || c === '‑' ? '-' : c); continue; }
      var hit = null;
      if (marks) { var lc = c.toLowerCase(); for (var k = 0; k < marks.length && !hit; k++) hit = TL_MARK[lc + marks[k]] || null; if (!hit && TL_PLAIN[lc] && /^[a-z]$/.test(lc) && !/[HXSTDA]/.test(c)) hit = TL_PLAIN[lc]; if (!hit) hit = TL_PLAIN[c] || null; }
      else hit = TL_PLAIN[c] || null;
      if (!hit) { var pre = c.normalize ? c.normalize('NFC') : c, lo = pre.toLowerCase(); if ('ḥḫẖšṯḏqꜣꜥ'.indexOf(lo) >= 0) hit = lo; else if (lo === 'ḳ') hit = 'q'; else if (lo === 'ś') hit = 'z'; else if (lo === 'ỉ' || lo === 'i̯') hit = 'j'; }
      if (!hit) { bad = true; out.push(null); } else out.push(hit);
    }
    return { letters: out, bad: bad };
  }
  function translitNorm(raw, strict) {
    var L = tlLetters(raw, false); if (L.bad) return null;
    var k = L.letters.join('');
    return strict ? k : k.replace(/z/g, 's');
  }
  function translitShow(raw) { var L = tlLetters(raw, true); return L.letters.map(function (c) { return c === null ? '?' : c; }).join('').replace(/\s+/g, ' ').trim(); }
  function checkTranslit(spec, answer) {
    var raw = str(answer).trim();
    if (!raw) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var strict = !!spec.strict, k = translitNorm(raw, strict);
    if (k === null) return { ok: false, invalid: true, msg: 'Use the transliteration letters: ꜣ j y ꜥ w b p f m n r h ḥ ḫ ẖ z s š q k g t ṯ d ḏ (or type A i y a … H x X … S … T D).' };
    if (!k) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var E = (Array.isArray(spec.v) ? spec.v : [spec.v]).map(function (v) { var e = translitNorm(v, strict); if (e === null) throw new Error('Bad transliteration "' + v + '" in the answer spec'); return e; });
    if (E.indexOf(k) >= 0) return { ok: true };
    if (strict && E.indexOf(k.replace(/z/g, 's')) >= 0 || strict && E.some(function (e) { return e.replace(/z/g, 's') === k.replace(/z/g, 's'); })) return { ok: false, msg: 'Close: z (the door bolt, MdC z) and s (the folded cloth) are kept apart here.' };
    var bare = function (x) { return x.replace(/[ḥḫẖ]/g, 'h').replace(/ṯ/g, 't').replace(/ḏ/g, 'd').replace(/š/g, 's').replace(/q/g, 'k'); };
    var bk = bare(k);
    for (var i = 0; i < E.length; i++) if (bare(E[i]) === bk) {
      var e = E[i], miss = '';
      for (var j = 0; j < e.length; j++) if (e[j] !== k[j]) { miss = e[j]; break; }
      var MDC = { 'ḥ': 'H', 'ḫ': 'x', 'ẖ': 'X', 'ṯ': 'T', 'ḏ': 'D', 'š': 'S', 'q': 'q', 'h': 'h', 't': 't', 'd': 'd', 's': 's', 'k': 'k' };
      return { ok: false, msg: 'Check the marks under and over the letters' + (miss ? ': this one has ' + miss + ' (MdC ' + MDC[miss] + ')' : '') + '. Plain h, t, d, s and k are different letters from ḥ ḫ ẖ, ṯ, ḏ, š and q.' };
    }
    var swap = function (x) { return x.replace(/[ꜣꜥ]/g, '\u0001'); };
    if (E.some(function (e) { return swap(e) === swap(k); })) return { ok: false, msg: 'Check ꜣ and ꜥ: ꜣ (the vulture, MdC A) and ꜥ (the forearm, MdC a) are different sounds.' };
    var yod = function (x) { return x.replace(/y/g, 'jj'); };
    if (E.some(function (e) { return yod(e) === yod(k); })) return { ok: true };
    return { ok: false };
  }

  function checkText(spec, answer) {
    var s = normWord(answer); if (!s) return { ok: false, invalid: true, msg: 'Type an answer first.' };
    var want = (Array.isArray(spec.v) ? spec.v : [spec.v]).map(normWord);
    if (want.indexOf(s) >= 0) return { ok: true };
    if (!spec.strict && (want.indexOf(s.replace(/s$/, '')) >= 0 || want.indexOf(s + 's') >= 0)) return { ok: true }; // strict: no plural leeway (transliterations)
    return { ok: false };
  }
  function checkMulti(spec, answer, ctx) {
    var arr = Array.isArray(answer) ? answer : (answer && typeof answer === 'object' ? spec.parts.map(function (_, i) { return answer[i]; }) : [answer]);
    // each part gets the question; the problem's unit is a hint for the parts (typed with it is fine), not a rule
    var pctx = ctx ? { q: ctx.q, unit: ctx.unit, unitLoose: true } : ctx;
    var parts = spec.parts.map(function (p, i) { return ML.check(p.a, arr[i], p.unit !== undefined && ctx ? { q: ctx.q, unit: p.unit } : p.unit !== undefined ? { unit: p.unit } : pctx); });
    var ok = parts.every(function (r) { return r.ok; }), inv = parts.filter(function (r) { return r.invalid; });
    var res = { ok: ok, parts: parts };
    if (!ok) {
      if (inv.length && parts.every(function (r) { return r.ok || r.invalid; })) { res.invalid = true; }
      var first = -1; for (var i = 0; i < parts.length; i++) if (!parts[i].ok && parts[i].msg) { first = i; break; }
      if (first >= 0) { var lab = str(spec.parts[first].label).replace(/\$/g, '').replace(/[=:]\s*$/, '').trim(); res.msg = (lab && parts.length > 1 ? lab + ': ' : '') + parts[first].msg; }
      else { var nOk = parts.filter(function (r) { return r.ok; }).length; if (nOk) res.msg = nOk + ' of ' + parts.length + ' parts are right.'; }
    }
    return res;
  }

  // ===================================================================== public
  // typed back the expression the problem started from ("Simplify (2x^3)^4" answered "(2x^3)^4"): compared as TeX with
  // spec.from (optional: a string or a list, in plain syntax) and with the math in the question (ctx.q), unless the
  // question also shows the expected answer itself
  function texKey(t) { return String(t).replace(/\\(left|right|displaystyle|textstyle|quad|qquad)|\\[,;:! ]/g, '').replace(/\\[dt]frac/g, '\\frac').replace(/\\cdot|\\times|\*/g, '·').replace(/[{}\s]/g, '').replace(/−/g, '-'); }
  function plainKey(s) { try { return texKey(ML.plainToTex(String(s))); } catch (e) { return null; } }
  function startedWith(spec, answer, ctx) {
    if (typeof answer !== 'string') return false;
    var lk = plainKey(stripLabel(cleanInput(answer))); if (!lk || lk.length < 3) return false;
    var ck = plainKey(spec.v); if (ck === lk) return false;
    var froms = spec.from === undefined ? [] : (Array.isArray(spec.from) ? spec.from : [spec.from]);
    if (froms.some(function (f) { return plainKey(f) === lk; })) return true;
    if (!ctx || typeof ctx.q !== 'string' || !ML.mathSegments) return false;
    var keys = ML.mathSegments(ctx.q).filter(function (sg) { return sg.math; }).map(function (sg) { return texKey(sg.tex); });
    if (ck && (keys.indexOf(ck) >= 0 || lk.length <= ck.length)) return false; // the question shows the answer; or the answer is no shorter
    return keys.indexOf(lk) >= 0;
  }
  var START_MSG = { factored: 'That\'s the expression you started with. Factor it.', expanded: 'That\'s the expression you started with. Multiply it out.' };
  ML.check = function (spec, answer, ctx) {
    if (!spec || !spec.t) return { ok: false, msg: 'This problem has no answer to check against.' };
    var res = checkAny(spec, answer, ctx);
    if (res && res.ok && (spec.t === 'expr' || spec.t === 'num') && (/^(simplified|simplest|factored|expanded)$/.test(spec.form || '') || spec.from !== undefined)) {
      try { if (startedWith(spec, answer, ctx)) return { ok: false, form: true, msg: START_MSG[spec.form] || 'That\'s the expression you started with. Simplify it.' }; } catch (e) { }
    }
    return res;
  };
  function checkAny(spec, answer, ctx) {
    try {
      switch (spec.t) {
        case 'num': return checkNum(spec, answer, ctx);
        case 'expr': return checkExpr(spec, answer);
        case 'eq': return checkEq(spec, answer);
        case 'set': return checkSet(spec, answer, ctx);
        case 'tuple': return checkTuple(spec, answer, ctx);
        case 'matrix': return checkMatrix(spec, answer);
        case 'interval': return checkInterval(spec, answer);
        case 'ineq': return checkIneq(spec, answer);
        case 'mc': return checkMc(spec, answer);
        case 'tf': return checkTf(spec, answer);
        case 'text': return checkText(spec, answer);
        case 'formula': return checkFormula(spec, answer);
        case 'prop': return checkProp(spec, answer);
        case 'translit': return checkTranslit(spec, answer);
        case 'multi': return checkMulti(spec, answer, ctx);
      }
      return { ok: false, msg: 'Unknown answer type ' + spec.t + '.' };
    } catch (e) {
      if (root.console && ML.debug) console.warn('MathLadder.check', spec, answer, e);
      return { ok: false, invalid: true, msg: 'I couldn\'t read that. Check the parentheses and signs.', error: e.message };
    }
  }
  ML.evalPlain = function (s, env) {
    var r = parse(str(s), { mixed: true }); if (!r.ok) return NaN;
    var t = casTree(r.node);
    return withRad(function () { var v = numVal(t, env); return typeof v === 'number' ? v : (v && v.re !== undefined ? v : NaN); });
  };
  ML.equiv = function (a, b, vars) {
    try {
      var A = casOf(str(a)), B = casOf(str(b));
      vars = vars || Object.keys(Object.assign({}, CAS.freeVars(A), CAS.freeVars(B))).filter(function (v) { return v !== '∞'; });
      return compareTrees(A, B, vars.length ? vars : ['x']) === 'eq';
    } catch (e) { return false; }
  };
  // ---- canonical answers
  function numText(spec) {
    var v = str(spec.v).trim();
    if (DNE.test(v) || INF.test(v) || NINF.test(v)) return v;
    var C = canonNum(spec), form = spec.form || (spec.dp !== undefined ? 'dec' : 'any');
    if (spec.dp !== undefined) return roundQ(C, spec.dp).s;
    if (form === 'sf' && spec.sf) { var cq = canonQ(C); if (cq) { var nsf = Math.max(1, Math.min(15, Math.floor(Number(spec.sf)) || 1)); return sciText(roundSigQ(cq.n, cq.d, nsf), nsf).replace(' × 10^', 'e'); } }
    var q = C.q ? ML.Q(C.q.n, C.q.d) : null;
    if (q) {
      if (form === 'dec') return q.isTerminating() ? q.toDec(20).replace(/\.?0+$/, '') : q.toDec(6);
      if (form === 'frac' || form === 'simplest' || form === 'int') return q.toString();
      if (form === 'mixed') { if (q.isInt() || q.abs().lt(1)) return q.toString(); var a = q.abs(), w = a.floor(), r = a.sub(w); return (q.sign() < 0 ? '-' : '') + w.toString() + ' ' + r.toString(); }
    }
    return v + (spec.pct ? '%' : '');
  }
  ML.answerValue = function (spec) {
    switch (spec.t) {
      case 'num': return numText(spec);
      case 'interval': return spec.v === 'all' ? '(-inf, inf)' : str(spec.v);
      case 'expr': case 'eq': case 'ineq': return str(spec.v);
      case 'set': return spec.v === 'all' ? 'all real numbers' : spec.v.length ? spec.v.join(', ') : 'no solution';
      case 'tuple': return spec.v.slice();
      case 'matrix': return spec.v.map(function (r) { return r.slice(); });
      case 'mc': return Array.isArray(spec.v) ? spec.v.slice() : spec.v;
      case 'tf': return spec.v;
      case 'text': return Array.isArray(spec.v) ? spec.v[0] : spec.v;
      case 'formula': return str(Array.isArray(spec.v) ? spec.v[0] : spec.v);
      case 'prop': return propShow(Array.isArray(spec.v) ? spec.v[0] : spec.v);
      case 'translit': return str(Array.isArray(spec.v) ? spec.v[0] : spec.v);
      case 'multi': return spec.parts.map(function (p) { return ML.answerValue(p.a); });
    }
    return '';
  };
  ML.answerText = function (spec) {
    var v = ML.answerValue(spec);
    switch (spec.t) {
      case 'tuple': return '(' + v.join(', ') + ')';
      case 'matrix': return '[' + v.map(function (r) { return '[' + r.join(', ') + ']'; }).join(', ') + ']';
      case 'mc': return (Array.isArray(v) ? v : [v]).map(function (i) { return str(spec.choices[i]); }).join('; ');
      case 'tf': return v ? 'True' : 'False';
      case 'multi': return spec.parts.map(function (p, i) { return (p.label ? str(p.label).replace(/\$/g, '') + ' ' : '') + ML.answerText(p.a); }).join(', ');
    }
    return str(v);
  };
  function tx(s) { try { return ML.plainToTex(s, { tidy: true }); } catch (e) { return '\\text{' + str(s).replace(/[{}\\$]/g, '') + '}'; } }
  function setTex(S) {
    if (!S.length) return '\\varnothing';
    return S.map(function (I) {
      // an endpoint as it was written in the answer (4/3 -> \frac{4}{3}, sqrt(2) -> \sqrt{2}); a rounded decimal if that fails
      function e(x, raw) {
        if (x === Infinity) return '\\infty'; if (x === -Infinity) return '-\\infty';
        if (raw !== undefined && !INF.test(String(raw).trim()) && !NINF.test(String(raw).trim())) { try { return ML.plainToTex(String(raw).trim(), { tidy: true }); } catch (er) { } }
        var r = ML.util.round(x, 4); return ML.util.numStr(Math.abs(r - x) < 1e-12 ? r : r);
      }
      if (I.lo === I.hi) return '\\{' + e(I.lo, I.loS) + '\\}';
      return (I.loC ? '[' : '(') + e(I.lo, I.loS) + ', ' + e(I.hi, I.hiS) + (I.hiC ? ']' : ')');
    }).join(' \\cup ');
  }
  function commaTex(t) { // "3000" -> "3{,}000": whole numbers (and decimals) with 4 or more digits before the point
    var m = /^(-?)(\d{4,})(\.\d+)?$/.exec(t); if (!m) return null;
    return m[1] + m[2].replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') + (m[3] || '');
  }
  ML.answerShow = function (spec) {
    switch (spec.t) {
      case 'num': {
        var t = numText(spec); if (DNE.test(t)) return 'Does not exist'; if (INF.test(t)) return '$\\infty$'; if (NINF.test(t)) return '$-\\infty$';
        var t0 = t.replace(/%$/, ''), ct = commaTex(t0), sm = /^(-?\d+(?:\.\d+)?)(?:[eE]|\*10\^\(?)([-+]?\d+)\)?$/.exec(t0);
        if (sm && (spec.form === 'sf' || spec.rtol !== undefined || /e|\*10\^/i.test(str(spec.v)))) return '$' + sm[1] + ' \\times 10^{' + (+sm[2]) + '}$';
        return '$' + (ct || tx(t0)) + (spec.pct || t0 !== t ? '\\%' : '') + '$' + (spec.satisfies ? satisfiesNote(spec.satisfies) : '');
      }
      case 'expr': case 'eq': return '$' + tx(spec.v) + '$';
      case 'set': return spec.v === 'all' ? 'All real numbers' : !spec.v.length ? 'No solution' : '$' + spec.v.map(function (x) { return commaTex(str(x).trim()) || tx(x); }).join(',\\ ') + '$';
      case 'tuple': { // plain parentheses unless an entry is tall, so a long tuple can break after its commas
        var it = spec.v.map(tx), tall = it.some(function (x) { return /\\frac|\\begin|\\int|\\sum|\\binom/.test(x); });
        return '$' + (tall ? '\\left(' : '(') + it.join(', ') + (tall ? '\\right)' : ')') + '$';
      }
      case 'matrix': return '$\\begin{bmatrix} ' + spec.v.map(function (r) { return r.map(tx).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}$';
      case 'interval': { var I = parseIntervals(spec.v === 'all' ? 'all real numbers' : spec.v); return I.err ? str(spec.v) : '$' + setTex(I.set) + '$'; }
      case 'ineq': return spec.v === 'all' ? 'All real numbers' : spec.v === 'none' ? 'No solution' : '$' + str(spec.v).split(/\s+or\s+/i).map(tx).join('\\ \\text{or}\\ ') + '$';
      case 'mc': return (Array.isArray(spec.v) ? spec.v : [spec.v]).map(function (i) { return str(spec.choices[i]); }).join('; ');
      case 'tf': return spec.v ? 'True' : 'False';
      case 'text': return str(Array.isArray(spec.v) ? spec.v[0] : spec.v);
      case 'translit': return translitShow(Array.isArray(spec.v) ? spec.v[0] : spec.v);
      case 'prop': { var pv0 = Array.isArray(spec.v) ? spec.v[0] : spec.v; try { return '$' + propTex(pv0) + '$'; } catch (e) { return propShow(pv0); } }
      case 'formula': { var fv = str(Array.isArray(spec.v) ? spec.v[0] : spec.v); try { var FF = fParse(fNorm(fv), 0); return '$' + formulaTex(FF ? fCanon(FF, !!spec.states) : fv) + '$'; } catch (e) { return fv; } }
      case 'multi': return spec.parts.map(function (p) { return (p.label ? p.label + ' ' : '') + ML.answerShow(p.a); }).join(', ');
    }
    return '';
  };
  ML._check = { readNumber: readNumber, parseIntervals: parseIntervals, parseIneq: parseIneq, violations: violations, compareTrees: compareTrees, kindOf: kindOf,
    dropUnit: function (s, unit) { var c = cleanInput(s), d = dropUnit(c) || (unit ? dropExpectedUnit(c, unit) : null) || (unit ? dropSIUnit(sciNorm(c)) : null); return d ? { s: d.s, unit: d.unit } : null; }, splitPM: splitPM,
    canonUnit: canonUnit, questionUnits: questionUnits, askedUnit: askedUnit, unitProblem: unitProblem,
    translitNorm: translitNorm, translitShow: translitShow, propNorm: propNorm, propParse: propParse, propEquiv: propEquiv, propShow: propShow, propTex: propTex,
    formulaTex: formulaTex, formulaReadings: fReadings, formulaCanon: function (s) { var F = fParse(fNorm(s), 0); return F ? fCanon(F, true) : null; },
    siUnit: siUnit, sigInfo: sigInfo, roundSigQ: roundSigQ, sciText: sciText, sciNorm: sciNorm, dropSIUnit: function (s) { var d = dropSIUnit(sciNorm(cleanInput(s))); return d ? { s: d.s, unit: d.unit } : null; } };

  if (typeof module !== 'undefined' && module.exports) module.exports = ML;
})(typeof window !== 'undefined' ? window : globalThis);
