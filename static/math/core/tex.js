/* Math Ladder core: a TeX subset -> MathML Core (rendered natively by current Chrome, Firefox and Safari), the page
   typesetter, and the plain-math (CAS syntax) parser and printer used by the answer box and the checker.

   ML.tex(src, { display })   TeX -> a <math> string. Never throws. Unknown commands show their name in a muted color.
   ML.texLint(src)            { ok, errors: [...], unknown: [...] }   (errors: unbalanced braces, \left without \right, …)
   ML.typeset(root)           render $…$ and \(…\) (inline), $$…$$ and \[…\] (display) in the text under root (default
                              document.body). \$ is a literal dollar sign and \% a literal percent sign in text. Skips
                              script, style, code, pre, textarea, input, select, option, math and .ml-notex. Idempotent,
                              never throws. Math that is unbalanced or cannot be parsed stays as visible text.
                              Inline math: <span class="ml-m">; display math: <span class="ml-md"> (a block that scrolls
                              sideways on narrow screens instead of widening the page). A long formula comes as several
                              <math> pieces with <wbr> between them, so it can break after a top-level =, + or comma.
   ML.html(s)                 the same for a trusted HTML string: returns HTML with the math rendered.
   ML.mathSegments(text)      [{ math: false, s }, { math: true, tex, display, raw }] — how typeset() splits text.
   ML.parsePlain(s, opts)     plain math ("2x^2 - 3", "sqrt(2)/2", "2 1/2", "x = 3", "(1, 2)") -> { ok, node, err }.
                              The grammar mirrors the site's CAS (cas.js): implicit multiplication binds like "*",
                              "1/2x" is (1/2)·x, "sin 2x" is sin(2x), "2 1/2" is a mixed number. opts.mixed (default true).
   ML.plainToCAS(node)        a parsed node -> a fully parenthesized string for CAS.parse (same meaning, no ambiguity).
                              (Deviation from the spec, on purpose: plainToTex uses this parser rather than CAS.parse, because
                              CAS.parse turns 0.5 into 1/2 and 2 1/2 into 2·1/2, so a preview could not show what was typed.
                              A test checks that this parser and CAS.parse give the same value on ~80 tricky inputs.)
   ML.plainToTex(s, opts?)    plain math -> TeX ("2*sqrt(3)/x^2" -> "\frac{2\sqrt{3}}{x^{2}}"); s may be a parsed node.
                              opts.tidy: drop factors of 1 and double signs ("1*x + (-3)" -> "x - 3"), for showing answers
                              Keeps what was typed: decimals stay decimals, 6/8 stays 6/8, parentheses stay.
                              Returns '' for an empty string; throws an Error with a friendly message if it can't parse.
   ML.plain(s, { display })   plain math -> MathML (a muted "…" while it can't be parsed).

   Supported TeX: numbers (1,234 and 1{,}234 group), letters (italic), Greek, \sin \cos \tan \sec \csc \cot \arcsin … \sinh
   \log \ln \exp \lim \max \min \sup \inf \det \dim \gcd \ker \deg \arg \Pr \operatorname{…}, \frac \dfrac \tfrac \cfrac,
   \binom, \sqrt \sqrt[n], ^ _ ' {}, \left \middle \right with ( ) [ ] \{ \} | \| \langle \rangle \lfloor \rfloor \lceil
   \rceil \lvert \rvert \lVert \rVert . , \big \Big \bigg \Bigg (l/r/m), operators and relations (\cdot \times \div \pm \mp
   = \ne < > \le \ge \approx \equiv \sim \cong \propto \to \mapsto \Rightarrow \Leftrightarrow \implies \iff …), sets (\in
   \notin \subset \subseteq \cup \cap \emptyset \varnothing \setminus \mathbb{R} …, also \R \N \Z \Q \C), \infty \partial
   \nabla, \sum \prod \bigcup \bigcap with limits (\limits \nolimits), \int \iint \iiint \oint, accents (\vec \hat \bar
   \dot \ddot \tilde \check \acute \grave \breve \widehat \widetilde), \overline \underline \overrightarrow
   \overleftarrow \overleftrightarrow, \overbrace{…}^{…} \underbrace{…}_{…}, \overset \underset \stackrel, \mathbf
   \mathrm \mathit \mathsf \mathtt \mathcal \mathfrak \boldsymbol \bm, \text \textbf \textit \mbox, environments
   matrix pmatrix bmatrix Bmatrix vmatrix Vmatrix smallmatrix cases dcases rcases aligned align align* gathered
   gather split array{l c r |} (with \hline) equation, \substack, spaces (\, \: \; \! \quad \qquad \  ~ \hspace),
   dots (\ldots \cdots \vdots \ddots \dots), \angle \triangle \parallel \perp \circ ^\circ \degree \prime, \boxed,
   \color{green|blue|red|gold|purple|orange|teal|pink|gray}{…} and \textcolor (site colors, light and dark), \cancel
   \bcancel \xcancel, \pmod \bmod \mod, \mid, \not, \phantom, \displaystyle \textstyle, \xrightarrow, % comments.  */
(function (root) {
  'use strict';
  var ML = root.MathLadder = root.MathLadder || {};
  var NS = 'http://www.w3.org/1998/Math/MathML';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // ===================================================================== tables
  var GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', varkappa: 'ϰ',
    lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', varpi: 'ϖ', rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ',
    chi: 'χ', psi: 'ψ', omega: 'ω', digamma: 'ϝ' };
  var GREEK_UP = { Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω' };
  var GREEK_VAR_UP = { varGamma: 'Γ', varDelta: 'Δ', varTheta: 'Θ', varLambda: 'Λ', varXi: 'Ξ', varPi: 'Π', varSigma: 'Σ', varUpsilon: 'Υ', varPhi: 'Φ', varPsi: 'Ψ', varOmega: 'Ω' };
  var SYM = {}; // name -> [char, class]; classes: bin rel ord(mi upright) sym(mo, no space) open close punct op(large, limits) int(large, side scripts) inner
  function def(cls, map) { for (var k in map) SYM[k] = [map[k], cls]; }
  def('bin', { pm: '±', mp: '∓', times: '×', div: '÷', cdot: '⋅', cdotp: '⋅', ast: '∗', star: '⋆', circ: '∘', bullet: '∙', cup: '∪', cap: '∩', setminus: '∖', smallsetminus: '∖',
    oplus: '⊕', ominus: '⊖', otimes: '⊗', oslash: '⊘', odot: '⊙', wedge: '∧', land: '∧', vee: '∨', lor: '∨', sqcup: '⊔', sqcap: '⊓', uplus: '⊎', amalg: '⨿', dagger: '†',
    ddagger: '‡', triangleleft: '◃', triangleright: '▹', bigtriangleup: '△', bigtriangledown: '▽', wr: '≀', diamond: '⋄', centerdot: '⋅', dotplus: '∔', ltimes: '⋉', rtimes: '⋊' });
  def('rel', { ne: '≠', neq: '≠', le: '≤', leq: '≤', ge: '≥', geq: '≥', leqslant: '⩽', geqslant: '⩾', lt: '<', gt: '>', ll: '≪', gg: '≫', approx: '≈', approxeq: '≊', equiv: '≡',
    sim: '∼', simeq: '≃', cong: '≅', propto: '∝', doteq: '≐', asymp: '≍', to: '→', rightarrow: '→', leftarrow: '←', gets: '←', leftrightarrow: '↔', mapsto: '↦',
    Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', implies: '⟹', impliedby: '⟸', iff: '⟺', longrightarrow: '⟶', longleftarrow: '⟵', longleftrightarrow: '⟷',
    Longrightarrow: '⟹', Longleftarrow: '⟸', Longleftrightarrow: '⟺', longmapsto: '⟼', uparrow: '↑', downarrow: '↓', updownarrow: '↕', Uparrow: '⇑', Downarrow: '⇓',
    nearrow: '↗', searrow: '↘', swarrow: '↙', nwarrow: '↖', hookrightarrow: '↪', hookleftarrow: '↩', rightleftharpoons: '⇌', leftrightharpoons: '⇋', rightharpoonup: '⇀',
    in: '∈', notin: '∉', ni: '∋', owns: '∋', subset: '⊂', subseteq: '⊆', subsetneq: '⊊', supset: '⊃', supseteq: '⊇', supsetneq: '⊋', nsubseteq: '⊈', nsupseteq: '⊉',
    parallel: '∥', nparallel: '∦', perp: '⊥', mid: '∣', nmid: '∤', models: '⊨', vdash: '⊢', dashv: '⊣', prec: '≺', succ: '≻', preceq: '⪯', succeq: '⪰', lesssim: '≲',
    gtrsim: '≳', nless: '≮', ngtr: '≯', nleq: '≰', ngeq: '≱', ncong: '≇', nsim: '≁', sqsubseteq: '⊑', sqsupseteq: '⊒', bowtie: '⋈', therefore: '∴', because: '∵',
    coloneqq: '≔', triangleq: '≜', vartriangleleft: '⊲', vartriangleright: '⊳', leftleftarrows: '⇇', rightrightarrows: '⇉', circeq: '≗', eqcirc: '≖' });
  def('ord', { infty: '∞', partial: '∂', nabla: '∇', emptyset: '∅', varnothing: '∅', ell: 'ℓ', hbar: 'ℏ', hslash: 'ℏ', forall: '∀', exists: '∃', nexists: '∄', neg: '¬', lnot: '¬',
    angle: '∠', measuredangle: '∡', sphericalangle: '∢', triangle: '△', square: '□', Box: '□', blacksquare: '■', aleph: 'ℵ', beth: 'ℶ', Re: 'ℜ', Im: 'ℑ', wp: '℘', top: '⊤',
    bot: '⊥', checkmark: '✓', S: '§', P: '¶', clubsuit: '♣', diamondsuit: '♢', heartsuit: '♡', spadesuit: '♠', flat: '♭', natural: '♮', sharp: '♯', imath: 'ı', jmath: 'ȷ',
    mho: '℧', surd: '√', backslash: '∖', cent: '¢', pounds: '£', euro: '€', yen: '¥', copyright: '©', textdegree: '°', degree: '°', $: '$', '#': '#', '&': '&', _: '_', '%': '%',
    R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', Reals: 'ℝ', Complex: 'ℂ', natnums: 'ℕ', varDelta: 'Δ', lozenge: '◊', star_: '★', bigstar: '★', diagup: '╱', diagdown: '╲' });
  def('sym', { prime: '′', backprime: '‵', '|': '‖', vert: '|', Vert: '‖' });
  def('inner', { ldots: '…', dots: '…', dotsc: '…', dotso: '…', cdots: '⋯', dotsb: '⋯', dotsm: '⋯', dotsi: '⋯', vdots: '⋮', ddots: '⋱', iddots: '⋰', colon: ':' });
  def('open', { langle: '⟨', lfloor: '⌊', lceil: '⌈', lvert: '|', lVert: '‖', lbrace: '{', '{': '{', lbrack: '[', lgroup: '⟮', ulcorner: '⌜', llcorner: '⌞' });
  def('close', { rangle: '⟩', rfloor: '⌋', rceil: '⌉', rvert: '|', rVert: '‖', rbrace: '}', '}': '}', rbrack: ']', rgroup: '⟯', urcorner: '⌝', lrcorner: '⌟' });
  def('op', { sum: '∑', prod: '∏', coprod: '∐', bigcup: '⋃', bigcap: '⋂', bigoplus: '⨁', bigotimes: '⨂', bigodot: '⨀', biguplus: '⨄', bigsqcup: '⨆', bigvee: '⋁', bigwedge: '⋀' });
  def('int', { int: '∫', iint: '∬', iiint: '∭', iiiint: '⨌', oint: '∮', oiint: '∯', oiiint: '∰', intop: '∫', smallint: '∫' });
  SYM.colon[1] = 'punct';
  var FN = {}; 'arcsin arccos arctan arcsec arccsc arccot sin cos tan sec csc cot sinh cosh tanh coth sech csch arsinh arcosh artanh log ln lg exp deg dim hom ker arg sgn'.split(' ').forEach(function (f) { FN[f] = f; });
  var FNL = { lim: 'lim', limsup: 'lim sup', liminf: 'lim inf', max: 'max', min: 'min', sup: 'sup', inf: 'inf', det: 'det', gcd: 'gcd', lcm: 'lcm', Pr: 'Pr', injlim: 'inj lim', projlim: 'proj lim', argmax: 'arg max', argmin: 'arg min' };
  var DELIM = { '(': '(', ')': ')', '[': '[', ']': ']', '\\{': '{', '\\}': '}', '|': '|', '\\|': '‖', '/': '/', '\\backslash': '∖', '\\langle': '⟨', '\\rangle': '⟩', '<': '⟨', '>': '⟩',
    '\\lfloor': '⌊', '\\rfloor': '⌋', '\\lceil': '⌈', '\\rceil': '⌉', '\\lvert': '|', '\\rvert': '|', '\\lVert': '‖', '\\rVert': '‖', '\\vert': '|', '\\Vert': '‖', '\\lbrace': '{',
    '\\rbrace': '}', '\\lbrack': '[', '\\rbrack': ']', '\\uparrow': '↑', '\\downarrow': '↓', '\\updownarrow': '↕', '\\Uparrow': '⇑', '\\Downarrow': '⇓', '\\lgroup': '⟮', '\\rgroup': '⟯',
    '\\ulcorner': '⌜', '\\urcorner': '⌝', '.': '' };
  var ACC = { hat: '^', check: 'ˇ', tilde: '~', bar: '¯', vec: '→', dot: '˙', ddot: '¨', dddot: '⃛', acute: 'ˊ', grave: 'ˋ', breve: '˘', mathring: '˚' };
  var WIDE = { widehat: ['^', 1], widetilde: ['~', 1], widecheck: ['ˇ', 1], overline: ['‾', 1], overrightarrow: ['→', 1], overleftarrow: ['←', 1], overleftrightarrow: ['↔', 1],
    underline: ['_', 0], underrightarrow: ['→', 0], underleftarrow: ['←', 0], underleftrightarrow: ['↔', 0], overgroup: ['⏠', 1], undergroup: ['⏡', 0] };
  var SPACES = { ',': 0.1667, thinspace: 0.1667, ':': 0.2222, '>': 0.2222, medspace: 0.2222, ';': 0.2778, thickspace: 0.2778, '!': -0.1667, negthinspace: -0.1667,
    negmedspace: -0.2222, negthickspace: -0.2778, ' ': 0.25, quad: 1, qquad: 2, enspace: 0.5, enskip: 0.5 };
  var BIG = { big: 1.2, Big: 1.623, bigg: 2.047, Bigg: 2.47 };
  var COLORS = { green: ['--ml-c-green', '#00703c'], blue: ['--ml-c-blue', '#1c6fd6'], red: ['--ml-c-red', '#d6336c'], gold: ['--ml-c-gold', '#9a6f00'], purple: ['--ml-c-purple', '#7048e8'],
    orange: ['--ml-c-orange', '#d9480f'], teal: ['--ml-c-teal', '#0c8599'], pink: ['--ml-c-pink', '#c2255c'], gray: ['--ml-c-gray', '#5d6862'], grey: ['--ml-c-gray', '#5d6862'],
    magenta: ['--ml-c-pink', '#c2255c'], cyan: ['--ml-c-teal', '#0c8599'], brown: ['--ml-c-orange', '#a0522d'], black: ['--ml-c-ink', 'currentColor'] };
  // character class for raw characters (built from the tables, plus ASCII)
  var CHARCLS = { '+': 'bin', '-': 'bin', '*': 'bin', '=': 'rel', '<': 'rel', '>': 'rel', ':': 'rel', ',': 'punct', ';': 'punct', '!': 'close', '?': 'close', '(': 'open',
    ')': 'close', '[': 'open', ']': 'close', '|': 'sym', '/': 'sym', '.': 'sym', '@': 'sym', '"': 'sym', '\u2212': 'bin', '·': 'bin', '°': 'sym', '′': 'sym', '″': 'sym', '‴': 'sym' };
  Object.keys(SYM).forEach(function (k) { var e = SYM[k]; if (e[0].length === 1 && !CHARCLS[e[0]] && e[1] !== 'ord') CHARCLS[e[0]] = e[1]; });
  var CHARMAP = { '-': '−', '*': '∗', '\u2019': '′' };

  function mapRange(ch, upper, lower, digits, holes) {
    if (holes && holes[ch]) return holes[ch];
    var c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90 && upper) return String.fromCodePoint(upper + c - 65);
    if (c >= 97 && c <= 122 && lower) return String.fromCodePoint(lower + c - 97);
    if (c >= 48 && c <= 57 && digits) return String.fromCodePoint(digits + c - 48);
    return ch;
  }
  var FONTMAP = {
    bb: function (ch) { return mapRange(ch, 0x1D538, 0x1D552, 0x1D7D8, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' }); },
    cal: function (ch) { return mapRange(ch, 0x1D49C, 0x1D4B6, 0, { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' }); },
    frak: function (ch) { return mapRange(ch, 0x1D504, 0x1D51E, 0, { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' }); }
  };
  var FONTCMD = { mathbb: 'bb', mathcal: 'cal', mathscr: 'cal', mathfrak: 'frak', mathbf: 'bf', mathrm: 'rm', mathit: 'it', mathsf: 'sf', mathtt: 'tt', boldsymbol: 'bi', bm: 'bi',
    mathnormal: null, mathbfit: 'bi', mathsfit: 'sf', textup: 'rm' };
  var TEXTCMD = { text: '', textrm: '', textnormal: '', mbox: '', hbox: '', textup: '', textbf: 'font-weight:bold', textit: 'font-style:italic', textsf: 'font-family:sans-serif',
    texttt: 'font-family:monospace', emph: 'font-style:italic', textmd: '', textsl: 'font-style:italic' };

  // ===================================================================== TeX parser
  function P(src) { this.s = src; this.i = 0; this.errors = []; this.unknown = []; this.font = null; this.depth = 0; }
  P.prototype.err = function (m) { if (this.errors.indexOf(m) < 0) this.errors.push(m); };
  P.prototype.ws = function () {
    var s = this.s;
    for (;;) {
      var c = s[this.i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\u00a0') { this.i++; continue; }
      if (c === '%') { while (this.i < s.length && s[this.i] !== '\n') this.i++; continue; }
      return;
    }
  };
  P.prototype.peekCmd = function () { var s = this.s, i = this.i; if (s[i] !== '\\') return null; var m = /^[a-zA-Z]+\*?/.exec(s.slice(i + 1, i + 60)); if (m) { var w = m[0]; if (w.slice(-1) === '*' && !/^(operatorname|align|gather|alignat|equation)\*$/.test(w)) w = w.slice(0, -1); return w; } return s[i + 1] === undefined ? '' : s[i + 1]; };
  P.prototype.readCmd = function () { var n = this.peekCmd(); this.i += 1 + n.length; return n; };
  P.prototype.rawGroup = function () { // contents of {...} as a raw string (or one char)
    this.ws(); var s = this.s;
    if (s[this.i] !== '{') { if (this.i >= s.length) { this.err('missing argument'); return ''; } if (s[this.i] === '\\') { return '\\' + this.readCmd(); } return s[this.i++]; }
    var d = 0, st = this.i + 1;
    for (var j = this.i; j < s.length; j++) {
      if (s[j] === '\\') { j++; continue; }
      if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) { this.i = j + 1; return s.slice(st, j); } }
    }
    this.err('missing }'); this.i = s.length; return s.slice(st);
  };
  P.prototype.optArg = function () { // [ ... ] raw, or null
    this.ws(); if (this.s[this.i] !== '[') return null;
    var d = 0, st = this.i + 1, s = this.s;
    for (var j = this.i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') d--; else if (s[j] === ']' && d === 0) { this.i = j + 1; return s.slice(st, j); } }
    return null;
  };
  P.prototype.sub = function (src) { // parse a substring with the same state
    var q = new P(src); q.font = this.font; q.depth = this.depth + 1; var r = q.list({}); var self = this;
    q.errors.forEach(function (e) { self.err(e); }); q.unknown.forEach(function (u) { if (self.unknown.indexOf(u) < 0) self.unknown.push(u); });
    return r;
  };
  P.prototype.top = function () {
    var rows = [this.list({ row: true })];
    while (this.i < this.s.length && this.peekCmd() === '\\') { this.i += 2; this.optArg(); rows.push(this.list({ row: true })); }
    if (this.i < this.s.length) { this.err('unexpected ' + this.s[this.i]); }
    if (rows.length === 1) return rows[0];
    return [{ k: 'table', rows: rows.map(function (r) { return [r]; }), align: ['c'], pad: '0.25em 0', env: 'gather' }];
  };
  P.prototype.list = function (stop) {
    var out = [];
    if (++this.depth > 200) { this.err('too deep'); this.i = this.s.length; return out; }
    for (;;) {
      this.ws();
      if (this.i >= this.s.length) {
        if (stop.brace) this.err('missing }'); if (stop.right) this.err('\\left without \\right'); if (stop.end) this.err('\\begin{' + stop.end + '} without \\end');
        break;
      }
      var c = this.s[this.i];
      if (c === '}') { if (stop.brace) break; this.err('extra }'); this.i++; continue; }
      if (c === '&') { if (stop.amp) break; this.i++; continue; }
      if (c === '\\') {
        var nm = this.peekCmd();
        if (nm === '\\' || nm === 'cr') { if (stop.row) break; this.i += 1 + nm.length; continue; }
        if (nm === 'right') { if (stop.right) break; this.err('\\right without \\left'); this.readCmd(); this.delim(); continue; }
        if (nm === 'middle' && stop.right) break;
        if (nm === 'end') { if (stop.end) break; this.err('\\end without \\begin'); this.readCmd(); this.rawGroup(); continue; }
        if (nm === 'displaystyle' || nm === 'textstyle' || nm === 'scriptstyle' || nm === 'scriptscriptstyle') {
          this.readCmd(); var rest = this.list(stop);
          out.push({ k: 'row', a: rest, attrs: nm === 'displaystyle' ? ' displaystyle="true" scriptlevel="0"' : nm === 'textstyle' ? ' displaystyle="false" scriptlevel="0"' : ' displaystyle="false" scriptlevel="' + (nm === 'scriptstyle' ? 1 : 2) + '"' });
          break;
        }
        if (nm === 'color') {
          this.readCmd(); var cname = this.rawGroup(); this.ws();
          if (this.s[this.i] === '{') { out.push(this.scripts({ k: 'row', a: this.groupList(), css: colorCss(cname) })); continue; }
          out.push({ k: 'row', a: this.list(stop), css: colorCss(cname) }); break;
        }
        if (/^(rm|bf|it|sf|tt|cal)$/.test(nm)) { this.readCmd(); var sv = this.font; this.font = { rm: 'rm', bf: 'bf', it: 'it', sf: 'sf', tt: 'tt', cal: 'cal' }[nm]; out.push({ k: 'row', a: this.list(stop) }); this.font = sv; break; }
      }
      var a = this.atom(); if (!a) continue;
      out.push(this.scripts(a));
    }
    this.depth--;
    return out;
  };
  P.prototype.groupList = function () { this.i++; var a = this.list({ brace: true }); if (this.s[this.i] === '}') this.i++; return a; };
  P.prototype.atom = function () {
    var s = this.s, c = s[this.i];
    if (c === '{') return { k: 'row', a: this.groupList() };
    if (c === '\\') return this.command();
    if (c === '^' || c === '_' || c === '\'') return { k: 'row', a: [] };
    if (c === '~') { this.i++; return { k: 'space', w: 0.333 }; }
    if (c === '#') { this.i++; return null; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[this.i + 1] || ''))) return this.number();
    var cp = s.codePointAt(this.i), ch = String.fromCodePoint(cp); this.i += ch.length;
    return this.charAtom(ch);
  };
  P.prototype.number = function () {
    var m = /^(?:\d+(?:(?:,|\{,\})\d{3}(?!\d))*(?:\.\d+)?|\.\d+)/.exec(this.s.slice(this.i));
    this.i += m[0].length;
    var str = m[0].replace(/\{,\}/g, ',');
    if (this.font === 'bf') return { k: 'mn', s: str, css: 'font-weight:bold' };
    if (this.font === 'bb') return { k: 'mn', s: str.split('').map(FONTMAP.bb).join('') };
    return { k: 'mn', s: str };
  };
  P.prototype.charAtom = function (ch) {
    if (/[A-Za-z]/.test(ch)) return this.letter(ch);
    if (/[0-9]/.test(ch)) return { k: 'mn', s: ch };
    if (/[α-ωϑϕϵϱϖς]/.test(ch)) return { k: 'mi', s: ch };
    if (/[Α-Ω]/.test(ch)) return { k: 'mi', s: ch, v: 'normal' };
    if (ch === '\'') return { k: 'mo', s: '′', cls: 'sym' };
    var cls = CHARCLS[ch];
    if (cls) return { k: 'mo', s: CHARMAP[ch] || ch, cls: cls };
    if (/[\u2200-\u22ff\u2190-\u21ff\u2a00-\u2aff\u27f0-\u27ff]/.test(ch)) return { k: 'mo', s: ch, cls: 'rel' };
    if (/\p{L}/u.test(ch)) return { k: 'mi', s: ch, v: /[ℝℕℤℚℂ∞]/.test(ch) ? 'normal' : null };
    return { k: 'mi', s: ch, v: 'normal' };
  };
  P.prototype.letter = function (ch) {
    var f = this.font;
    if (f === 'bb' || f === 'cal' || f === 'frak') return { k: 'mi', s: FONTMAP[f](ch), v: 'normal' };
    if (f === 'bf') return { k: 'mi', s: ch, v: 'normal', css: 'font-weight:bold' };
    if (f === 'bi') return { k: 'mi', s: ch, css: 'font-weight:bold' };
    if (f === 'rm') return { k: 'mi', s: ch, v: 'normal' };
    if (f === 'it') return { k: 'mi', s: ch };
    if (f === 'sf') return { k: 'mi', s: ch, v: 'normal', css: 'font-family:sans-serif' };
    if (f === 'tt') return { k: 'mi', s: ch, v: 'normal', css: 'font-family:monospace' };
    return { k: 'mi', s: ch };
  };
  P.prototype.arg = function () {
    this.ws(); var c = this.s[this.i];
    if (c === undefined || c === '}' || c === '&') { this.err('missing argument'); return { k: 'row', a: [] }; }
    if (c === '{') return { k: 'row', a: this.groupList() };
    if (c === '\\') { var nm = this.peekCmd(); if (nm === '\\' || nm === 'right' || nm === 'end') { this.err('missing argument'); return { k: 'row', a: [] }; } return this.command(); }
    if (/[0-9]/.test(c)) { this.i++; return { k: 'mn', s: c }; }
    if (c === '^' || c === '_') { this.err('missing argument'); this.i++; return { k: 'row', a: [] }; }
    return this.atom() || { k: 'row', a: [] };
  };
  P.prototype.delim = function () {
    this.ws(); var s = this.s, c = s[this.i];
    if (c === undefined) { this.err('missing delimiter'); return ''; }
    if (c === '\\') { var nm = this.peekCmd(), key = '\\' + nm; if (DELIM[key] !== undefined) { this.readCmd(); return DELIM[key]; } this.err('bad delimiter \\' + nm); this.readCmd(); return ''; }
    this.i++; if (DELIM[c] !== undefined) return DELIM[c];
    if ('↑↓⟨⟩‖⌊⌋⌈⌉'.indexOf(c) >= 0) return c;
    this.err('bad delimiter ' + c); return '';
  };
  P.prototype.scripts = function (base) {
    var sub = null, sup = null, primes = 0, limits = base.limits;
    for (;;) {
      this.ws(); var c = this.s[this.i];
      if (c === '\'' || c === '\u2019') { primes++; this.i++; continue; }
      if (c === '\\') { var nm = this.peekCmd(); if (nm === 'limits') { this.readCmd(); limits = true; continue; } if (nm === 'nolimits') { this.readCmd(); limits = false; continue; } }
      if (c === '^' && !sup) { this.i++; sup = this.arg(); continue; }
      if (c === '_' && !sub) { this.i++; sub = this.arg(); continue; }
      break;
    }
    var pr = primes ? { k: 'mo', s: ['′', '″', '‴', '⁗'][Math.min(primes, 4) - 1], cls: 'sym' } : null;
    if (sup && !sub && !pr && isCirc(sup)) return { k: 'row', a: [base, { k: 'mi', s: '°', v: 'normal' }], cls: clsOf(base) === 'op' ? 'ord' : null };
    var flat = base.k === 'mi' || base.k === 'mn' || (base.k === 'row' && base.a.length && base.a.every(function (x) { return x.k === 'mi' || x.k === 'mn'; }));
    if (pr && !sub && !sup && flat) return { k: 'row', a: [base, pr], cls: clsOf(base) === 'op' ? 'op' : null, prime: true };
    if (pr) sup = sup ? { k: 'row', a: [pr, sup] } : pr;
    if (!sub && !sup) { if (limits !== base.limits) base.limits = limits; return base; }
    return { k: 'scr', base: base, sub: sub, sup: sup, limits: limits };
  };
  function isCirc(n) { while (n && n.k === 'row' && n.a.length === 1 && !n.css) n = n.a[0]; return !!n && (n.k === 'mo' || n.k === 'mi') && (n.s === '∘' || n.s === '°'); }
  function colorCss(name) {
    name = String(name).trim(); var c = COLORS[name];
    if (c) return 'color:var(' + c[0] + ',' + c[1] + ')';
    if (/^#[0-9a-fA-F]{3,8}$|^[a-zA-Z]{3,20}$/.test(name)) return 'color:' + name;
    return '';
  }
  function txt(s) { // text-mode string: a few escapes
    return s.replace(/\\([$%&#_{}])/g, '$1').replace(/\\(,|;|:|quad|qquad| )/g, ' ').replace(/~/g, '\u00a0').replace(/\\textbackslash\b/g, '\\').replace(/---/g, '—').replace(/--/g, '–').replace(/``|''/g, '"');
  }
  P.prototype.textNode = function (raw, css) {
    // \text{… $math$ …} : allow nested math
    if (raw.indexOf('$') >= 0 && /(^|[^\\])\$/.test(raw)) {
      var parts = [], self = this;
      raw.split(/(?<!\\)\$/).forEach(function (piece, idx) { if (idx % 2) parts.push({ k: 'row', a: self.sub(piece) }); else if (piece) parts.push({ k: 'mtext', s: txt(piece), css: css }); });
      return { k: 'row', a: parts };
    }
    return { k: 'mtext', s: txt(raw), css: css };
  };
  P.prototype.command = function () {
    var name = this.readCmd(), e, a, b;
    if (name === '') { this.err('lone backslash'); return null; }
    if (SPACES[name] !== undefined) return { k: 'space', w: SPACES[name] };
    if (name === 'hspace') return { k: 'space', w: dimEm(this.rawGroup()) };
    if (name === 'hskip' || name === 'kern' || name === 'mkern' || name === 'mskip') { var dm = /^\s*(-?[\d.]+\s*(em|ex|pt|mu|px))/.exec(this.s.slice(this.i)); if (dm) this.i += dm[0].length; return { k: 'space', w: dm ? dimEm(dm[1]) : 0 }; }
    if (GREEK[name]) return this.font === 'bi' || this.font === 'bf' ? { k: 'mi', s: GREEK[name], css: 'font-weight:bold' } : { k: 'mi', s: GREEK[name] };
    if (GREEK_UP[name]) return { k: 'mi', s: GREEK_UP[name], v: this.font === 'it' ? null : 'normal', css: this.font === 'bf' || this.font === 'bi' ? 'font-weight:bold' : '' };
    if (GREEK_VAR_UP[name]) return { k: 'mi', s: GREEK_VAR_UP[name] };
    if (name === 'iff' || name === 'implies' || name === 'impliedby') return { k: 'mo', s: SYM[name][0], cls: 'rel', wide: true };
    if ((e = SYM[name])) {
      var cls = e[1];
      if (cls === 'ord') return { k: 'mi', s: e[0], v: 'normal' };
      if (cls === 'op') return { k: 'mo', s: e[0], cls: 'op', large: true, limits: undefined };
      if (cls === 'int') return { k: 'mo', s: e[0], cls: 'op', large: true, int: true, limits: false };
      return { k: 'mo', s: e[0], cls: cls };
    }
    if (FN[name]) return { k: 'fn', s: FN[name] };
    if (FNL[name]) return { k: 'fn', s: FNL[name], limits: undefined, movable: true };
    switch (name) {
      case 'frac': case 'dfrac': case 'tfrac': case 'cfrac':
        a = this.arg(); b = this.arg(); return { k: 'frac', n: a, d: b, style: name === 'dfrac' || name === 'cfrac' ? 'd' : name === 'tfrac' ? 't' : '' };
      case 'binom': case 'dbinom': case 'tbinom': case 'choose':
        a = this.arg(); b = this.arg(); return { k: 'fenced', open: '(', close: ')', a: [{ k: 'frac', n: a, d: b, thin: true, style: name === 'dbinom' ? 'd' : name === 'tbinom' ? 't' : '' }] };
      case 'sqrt': { var idx = this.optArg(); a = this.arg(); return { k: 'sqrt', a: a, idx: idx === null ? null : { k: 'row', a: this.sub(idx) } }; }
      case 'left': return this.leftRight();
      case 'middle': this.delim(); return null;
      case 'big': case 'Big': case 'bigg': case 'Bigg': case 'bigl': case 'Bigl': case 'biggl': case 'Biggl': case 'bigr': case 'Bigr': case 'biggr': case 'Biggr': case 'bigm': case 'Bigm': case 'biggm': case 'Biggm': {
        var base = name.replace(/[lrm]$/, ''), side = name.length > base.length ? name.slice(-1) : '', d = this.delim();
        return { k: 'mo', s: d || '', cls: side === 'l' ? 'open' : side === 'r' ? 'close' : side === 'm' ? 'rel' : 'sym', size: BIG[base] };
      }
      case 'operatorname': case 'operatorname*': case 'mathop': {
        var nm = this.rawGroup(); var star = name === 'operatorname*';
        if (name === 'mathop' && nm.length === 1) return { k: 'mo', s: nm, cls: 'op', large: true };
        return { k: 'fn', s: txt(nm.replace(/\\[,;: ]/g, ' ').replace(/[{}]/g, '')).trim(), limits: star ? undefined : false, movable: star };
      }
      case 'not': {
        this.ws(); var nx = this.atom();
        if (nx && nx.k === 'mo') { var NEG = { '=': '≠', '<': '≮', '>': '≯', '≤': '≰', '≥': '≱', '∈': '∉', '⊂': '⊄', '⊃': '⊅', '⊆': '⊈', '⊇': '⊉', '≡': '≢', '∼': '≁', '≅': '≇', '≈': '≉', '∣': '∤', '∥': '∦', '∃': '∄' }; nx.s = NEG[nx.s] || nx.s + '\u0338'; return nx; }
        if (nx && nx.k === 'mi') { nx.s += '\u0338'; return nx; }
        return { k: 'mo', s: '/', cls: 'rel' };
      }
      case 'pmod': a = this.arg(); return { k: 'row', a: [{ k: 'space', w: 1 }, { k: 'mo', s: '(', cls: 'open' }, { k: 'fn', s: 'mod' }, { k: 'space', w: 0.333 }, a, { k: 'mo', s: ')', cls: 'close' }] };
      case 'pod': a = this.arg(); return { k: 'row', a: [{ k: 'space', w: 1 }, { k: 'mo', s: '(', cls: 'open' }, a, { k: 'mo', s: ')', cls: 'close' }] };
      case 'bmod': return { k: 'mo', s: 'mod', cls: 'bin' };
      case 'mod': return { k: 'row', a: [{ k: 'space', w: 1 }, { k: 'fn', s: 'mod' }, { k: 'space', w: 0.333 }] };
      case 'begin': return this.env(this.rawGroup().trim());
      case 'text': case 'textrm': case 'textnormal': case 'mbox': case 'hbox': case 'textup': case 'textbf': case 'textit': case 'textsf': case 'texttt': case 'emph': case 'textmd': case 'textsl':
        return this.textNode(this.rawGroup(), TEXTCMD[name]);
      case 'textcolor': { var cn = this.rawGroup(); a = this.arg(); return { k: 'row', a: [a], css: colorCss(cn) }; }
      case 'colorbox': { var cb = this.rawGroup(); a = this.arg(); var col = COLORS[cb] ? 'var(' + COLORS[cb][0] + '-soft,rgba(0,0,0,.08))' : cb; return { k: 'row', a: [a], css: 'background:' + col + ';padding:0 0.2em;border-radius:0.2em' }; }
      case 'boxed': case 'fbox': a = name === 'fbox' ? this.textNode(this.rawGroup(), '') : this.arg(); return { k: 'row', a: [a], css: 'border:0.07em solid currentColor;padding:0.15em 0.3em;border-radius:0.12em' };
      case 'cancel': case 'bcancel': case 'xcancel': case 'sout': {
        a = this.arg(); var strike = 'var(--ml-c-red,#d6336c)', tk = '0.06em';
        function ln(dir) { return 'linear-gradient(' + dir + ',transparent calc(50% - ' + tk + '),' + strike + ' calc(50% - ' + tk + '),' + strike + ' calc(50% + ' + tk + '),transparent calc(50% + ' + tk + '))'; }
        var bg = name === 'cancel' ? ln('to top right') : name === 'bcancel' ? ln('to top left') : name === 'sout' ? ln('to bottom') : ln('to top right') + ',' + ln('to top left');
        return { k: 'row', a: [a], css: 'background:' + bg + ';padding:0 0.1em' };
      }
      case 'phantom': case 'hphantom': case 'vphantom': a = this.arg(); return { k: 'phantom', a: a };
      case 'overset': case 'stackrel': a = this.arg(); b = this.arg(); return { k: 'over', base: b, acc: a, cls: name === 'stackrel' ? 'rel' : null };
      case 'underset': a = this.arg(); b = this.arg(); return { k: 'under', base: b, acc: a };
      case 'overbrace': case 'underbrace': {
        a = this.arg(); var over = name === 'overbrace', br = { k: over ? 'over' : 'under', base: a, acc: { k: 'mo', s: over ? '⏞' : '⏟', cls: 'sym', stretchy: true } };
        this.ws(); var mark = over ? '^' : '_';
        if (this.s[this.i] === mark) { this.i++; var lab = this.arg(); return { k: over ? 'over' : 'under', base: br, acc: lab, label: true }; }
        return br;
      }
      case 'xrightarrow': case 'xleftarrow': case 'xRightarrow': case 'xleftrightarrow': case 'xLeftrightarrow': {
        var below = this.optArg(); a = this.arg();
        var ar = { k: 'mo', s: { xrightarrow: '→', xleftarrow: '←', xRightarrow: '⇒', xleftrightarrow: '↔', xLeftrightarrow: '⇔' }[name], cls: 'rel', stretchy: true, minw: true };
        var padded = { k: 'row', a: [{ k: 'space', w: 0.3 }, a, { k: 'space', w: 0.3 }] };
        var node = { k: 'over', base: ar, acc: padded, cls: 'rel', script: true };
        if (below) node = { k: 'under', base: node, acc: { k: 'row', a: this.sub(below) }, cls: 'rel', script: true };
        return node;
      }
      case 'substack': { var raw = this.rawGroup(); var self = this; return { k: 'table', rows: raw.split(/\\\\/).map(function (r) { return [self.sub(r)]; }), align: ['c'], pad: '0', small: true }; }
      case 'tag': case 'label': case 'eqref': case 'ref': this.rawGroup(); return null;
      case 'nonumber': case 'notag': case 'limits': case 'nolimits': case 'displaylimits': case 'relax': case 'strut': case 'mathstrut': case 'protect': case 'left.': case 'nobreak': case 'allowbreak': case 'hline': case 'hdashline': return null;
      case 'lt': return { k: 'mo', s: '<', cls: 'rel' };
      case 'gt': return { k: 'mo', s: '>', cls: 'rel' };
    }
    if (name === 'bar' || name === 'overline') { a = this.arg(); return { k: 'row', a: [a], css: 'border-top:0.065em solid currentColor;padding-top:0.07em' + (name === 'bar' ? ';padding-left:0.05em;padding-right:0.02em' : ''), cls: clsOf(a) === 'op' ? 'ord' : null }; }
    if (name === 'underline') { a = this.arg(); return { k: 'row', a: [a], css: 'border-bottom:0.065em solid currentColor;padding-bottom:0.08em' }; }
    if (ACC[name]) { a = this.arg(); return { k: 'over', base: a, acc: { k: 'mo', s: ACC[name], cls: 'sym', stretchy: false, small: name === 'vec' }, accent: true }; }
    if (WIDE[name]) { var w = WIDE[name]; a = this.arg(); return { k: w[1] ? 'over' : 'under', base: a, acc: { k: 'mo', s: w[0], cls: 'sym', stretchy: true }, accent: true }; }
    if (FONTCMD[name] !== undefined) { var sv = this.font; this.font = FONTCMD[name]; a = this.arg(); this.font = sv; if (name === 'mathrm' || name === 'textup' || name === 'mathsf' || name === 'mathtt') { a = mergeLetters(a, FONTCMD[name]); } return a; }
    // unknown command: show its name, muted
    if (this.unknown.indexOf(name) < 0) this.unknown.push(name);
    return { k: 'mtext', s: '\\' + name, css: 'color:var(--ml-c-gray,#8a8f8c)', unknown: true };
  };
  function mergeLetters(a, font) { // \mathrm{abc} -> one upright identifier "abc"
    var list = a.k === 'row' ? a.a : [a];
    if (list.length > 1 && list.every(function (x) { return x.k === 'mi' && x.s.length <= 2; })) {
      var css = font === 'sf' ? 'font-family:sans-serif' : font === 'tt' ? 'font-family:monospace' : '';
      return { k: 'mi', s: list.map(function (x) { return x.s; }).join(''), v: 'normal', css: css };
    }
    return a;
  }
  function dimEm(d) { var m = /(-?[\d.]+)\s*(em|ex|pt|mu|px)?/.exec(d || ''); if (!m) return 0; var v = parseFloat(m[1]); return m[2] === 'ex' ? v * 0.43 : m[2] === 'pt' ? v / 10 : m[2] === 'mu' ? v / 18 : m[2] === 'px' ? v / 16 : v; }
  P.prototype.leftRight = function () {
    var open = this.delim(), parts = [], mids = [];
    for (;;) {
      var inner = this.list({ right: true });
      parts.push(inner);
      if (this.peekCmd() === 'middle') { this.readCmd(); mids.push(this.delim()); continue; }
      break;
    }
    var close = '';
    if (this.peekCmd() === 'right') { this.readCmd(); close = this.delim(); }
    var a = [];
    parts.forEach(function (p, j) { if (j) a.push({ k: 'mo', s: mids[j - 1], cls: 'sym', stretchy: true, fence: true, mid: true }); a.push.apply(a, p); });
    return { k: 'fenced', open: open, close: close, a: a };
  };
  var ENV = {
    matrix: ['', ''], pmatrix: ['(', ')'], bmatrix: ['[', ']'], Bmatrix: ['{', '}'], vmatrix: ['|', '|'], Vmatrix: ['‖', '‖'], smallmatrix: ['', ''],
    cases: ['{', ''], dcases: ['{', ''], rcases: ['', '}'], array: ['', ''], subarray: ['', ''],
    aligned: 0, align: 0, 'align*': 0, alignat: 0, 'alignat*': 0, alignedat: 0, split: 0, eqnarray: 0, 'eqnarray*': 0, flalign: 0,
    gathered: 1, gather: 1, 'gather*': 1, multline: 1, 'multline*': 1, equation: 2, 'equation*': 2, displaymath: 2
  };
  P.prototype.env = function (name) {
    if (!(name in ENV)) { this.err('unknown environment ' + name); if (this.unknown.indexOf('begin{' + name + '}') < 0) this.unknown.push('begin{' + name + '}'); }
    var spec = null;
    if (name === 'array' || name === 'subarray') spec = this.rawGroup();
    if (/^alignat|alignedat/.test(name)) this.rawGroup();
    if (name === 'equation' || name === 'equation*' || name === 'displaymath') {
      var body = this.list({ end: name }); this.endEnv(name); return { k: 'row', a: body, attrs: ' displaystyle="true"' };
    }
    var rows = [], row = [], lines = [], hl = false;
    for (;;) {
      this.ws();
      while (this.peekCmd() === 'hline' || this.peekCmd() === 'hdashline') { this.readCmd(); hl = true; this.ws(); }
      var cell = this.list({ amp: true, row: true, end: name });
      row.push(cell);
      if (this.s[this.i] === '&') { this.i++; continue; }
      var nm = this.peekCmd();
      if (nm === '\\' || nm === 'cr') { this.i += 1 + nm.length; this.optArg(); lines.push(hl); hl = false; rows.push(row); row = []; continue; }
      lines.push(hl); hl = false;
      rows.push(row); break;
    }
    this.endEnv(name);
    // drop a trailing empty row (from a final \\)
    if (rows.length > 1) { var last = rows[rows.length - 1]; if (last.length === 1 && !last[0].length) { rows.pop(); lines.pop(); } }
    var ncol = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0);
    var t = { k: 'table', rows: rows, lines: lines, env: name };
    var kind = ENV[name];
    if (kind === 0) { // aligned: right, left, right, left …
      t.align = []; for (var j = 0; j < ncol; j++) t.align.push(j % 2 ? 'l' : 'r');
      t.aligned = true;
      return t;
    }
    if (kind === 1) { t.align = ['c']; t.pad = '0.2em 0'; return t; }
    var dl = ENV[name] || ['', ''];
    if (/cases/.test(name)) { t.align = ['l', 'l']; t.pad = name === 'dcases' ? '0.3em 1em 0.3em 0' : '0.15em 1em 0.15em 0'; t.cases = name === 'dcases' ? 'd' : ''; }
    else if (spec !== null) { var cs = parseColSpec(spec); t.align = cs.align; t.vlines = cs.lines; t.pad = '0.15em 0.5em'; }
    else { t.align = ['c']; t.pad = name === 'smallmatrix' ? '0.1em 0.3em' : '0.2em 0.55em'; if (name === 'smallmatrix') t.small = true; }
    if (dl[0] || dl[1]) return { k: 'fenced', open: dl[0], close: dl[1], a: [t] };
    return t;
  };
  P.prototype.endEnv = function (name) {
    if (this.peekCmd() === 'end') { this.readCmd(); var en = this.rawGroup().trim(); if (en !== name) this.err('\\begin{' + name + '} ended by \\end{' + en + '}'); }
    else this.err('\\begin{' + name + '} without \\end');
  };
  function parseColSpec(s) {
    var align = [], lines = [0];
    s = s.replace(/@\{[^}]*\}/g, '').replace(/[pmb]\{[^}]*\}/g, 'l');
    for (var j = 0; j < s.length; j++) {
      var c = s[j];
      if (c === '|') { lines[align.length] = (lines[align.length] || 0) + 1; continue; }
      if (/[lcr]/.test(c)) { align.push(c); lines[align.length] = lines[align.length] || 0; }
    }
    return { align: align.length ? align : ['c'], lines: lines };
  }

  // ===================================================================== spacing and serialization
  function clsOf(n) {
    if (!n) return 'ord';
    if (n.cls) return n.cls;
    switch (n.k) {
      case 'mo': return 'ord';
      case 'fn': return 'op';
      case 'scr': return clsOf(n.base);
      case 'over': case 'under': return n.accent ? clsOf(n.base) : (n.label ? 'ord' : clsOf(n.base));
      case 'space': return 'space';
      case 'fenced': return 'inner';
      case 'row': return n.a.length === 1 && !n.css ? clsOf(n.a[0]) : 'ord';
      default: return 'ord';
    }
  }
  function isFnName(n) { return n && (n.k === 'fn' || (n.k === 'scr' && n.base.k === 'fn')); }
  function startsOpen(n) { if (!n) return false; if (n.k === 'fenced') return true; var c = clsOf(n); if (c === 'open') return true; if (n.k === 'row' && n.a.length && !n.css) return startsOpen(n.a[0]); return false; }
  function unaryize(n) { if (n.k === 'mo') n.unary = true; else if (n.k === 'scr') unaryize(n.base); }
  function fin(list) {
    var out = [], prev = null;
    for (var j = 0; j < list.length; j++) {
      var n = list[j]; if (!n) continue;
      var cls = clsOf(n);
      if (cls === 'space') { out.push(n); continue; }
      var nextN = null; for (var t = j + 1; t < list.length; t++) { if (list[t] && clsOf(list[t]) !== 'space') { nextN = list[t]; break; } }
      if (cls === 'bin') {
        var nc = nextN ? clsOf(nextN) : null;
        if (prev === null || /^(bin|op|rel|open|punct)$/.test(prev) || nc === null || /^(rel|close|punct)$/.test(nc)) { unaryize(n); cls = 'ord'; }
      }
      if (isFnName(n) && (prev === 'ord' || prev === 'close' || prev === 'inner')) out.push({ k: 'space', w: 0.1667 });
      out.push(n);
      if (isFnName(n) && nextN) { var c2 = clsOf(nextN); if (!startsOpen(nextN) && !/^(bin|rel|punct|close)$/.test(c2)) out.push({ k: 'space', w: 0.1667 }); }
      prev = cls;
    }
    return out;
  }
  var S = { lvl: 0, fd: 0, display: false }; // serializer state: script level, fraction depth, display mode
  function scriptArg(n) { S.lvl++; try { return arg1(n); } finally { S.lvl--; } }
  function one(list) { // a list as exactly one MathML element
    var f = fin(list);
    if (f.length === 1) return ser(f[0]);
    return '<mrow>' + f.map(ser).join('') + '</mrow>';
  }
  function arg1(n) { return n.k === 'row' && !n.css && !n.attrs ? one(n.a) : one([n]); }
  function moAttrs(n) {
    var at = '';
    if (n.size) return ' stretchy="true" symmetric="true" minsize="' + n.size + 'em" maxsize="' + n.size + 'em"' + (n.cls === 'open' ? ' form="prefix"' : n.cls === 'close' ? ' form="postfix"' : n.cls === 'rel' ? ' form="infix"' : ' lspace="0" rspace="0"');
    var sc = S.lvl > 0;
    switch (n.cls) {
      case 'bin': at = n.unary ? ' form="prefix" lspace="0" rspace="0"' : ' form="infix"' + (sc ? ' lspace="0.04em" rspace="0.04em"' : ''); break;
      case 'rel': at = ' form="infix"' + (n.wide ? ' lspace="0.4em" rspace="0.4em"' : sc ? ' lspace="0.08em" rspace="0.08em"' : '') + (n.stretchy ? '' : ' stretchy="false"'); break;
      case 'open': at = ' form="prefix"' + (n.stretchy ? '' : ' stretchy="false"'); break;
      case 'close': at = ' form="postfix"' + (n.stretchy ? '' : ' stretchy="false"'); break;
      case 'punct': at = ' form="infix" lspace="0" rspace="' + (sc ? '0.08em' : '0.1667em') + '"'; break;
      case 'sym': at = ' lspace="0" rspace="0"' + (n.stretchy ? ' stretchy="true"' : ' stretchy="false"'); break;
      case 'op': at = n.large ? ' largeop="true"' + (n.int ? ' movablelimits="false"' : '') : ''; break;
      case 'inner': at = ''; break;
      default: at = ' lspace="0" rspace="0"';
    }
    if (n.unary && n.cls !== 'bin') at += ' lspace="0" rspace="0"';
    return at;
  }
  function styleAttr(css) { return css ? ' style="' + esc(css) + '"' : ''; }
  function ser(n) {
    switch (n.k) {
      case 'mi': return '<mi' + (n.v ? ' mathvariant="' + n.v + '"' : '') + styleAttr(n.css) + '>' + esc(n.s) + '</mi>';
      case 'mn': return '<mn' + styleAttr(n.css) + '>' + esc(n.s) + '</mn>';
      case 'mo': return '<mo' + moAttrs(n) + '>' + esc(n.s) + '</mo>';
      case 'mtext': { var t = n.s.replace(/^ +| +$/g, function (m) { return m.replace(/ /g, '\u00a0'); }); return '<mtext' + (n.unknown ? ' class="ml-unk"' : '') + styleAttr(n.css) + '>' + esc(t) + '</mtext>'; }
      case 'space': return n.w >= 0 ? '<mspace width="' + (+n.w.toFixed(4)) + 'em"></mspace>' : '<mspace width="0em" style="margin-left:' + (+n.w.toFixed(4)) + 'em"></mspace>';
      case 'fn': {
        var nm = '<mi' + (n.s.length === 1 ? ' mathvariant="normal"' : '') + '>' + esc(n.s) + '</mi>';
        if (n.movable) return '<mo form="prefix" movablelimits="true" lspace="0" rspace="0">' + esc(n.s) + '</mo>';
        return nm + '<mo>\u2061</mo>';
      }
      case 'row': {
        var inner = n.a.length ? fin(n.a).map(ser).join('') : '';
        if (!n.css && !n.attrs && n.a.length === 1) return inner;
        return '<mrow' + (n.attrs || '') + styleAttr(n.css) + '>' + inner + '</mrow>';
      }
      case 'phantom': return '<mphantom>' + arg1(n.a) + '</mphantom>';
      case 'frac': {
        var top = S.lvl === 0 && S.fd === 0, fat = '', child = S.lvl, small = false;
        if (n.style === 'd') fat = ' displaystyle="true"';
        else if (n.style === 't') { fat = ' displaystyle="false"'; child = S.lvl + 1; }
        else if (top) { if (!S.display) small = true; }
        else child = S.lvl + 1;
        var sv = S.lvl; S.lvl = child; S.fd++;
        try {
          var nu = arg1(n.n), de = arg1(n.d);
          if (small) { nu = '<mrow style="font-size:1.1em">' + nu + '</mrow>'; de = '<mrow style="font-size:1.1em">' + de + '</mrow>'; }
          return '<mfrac' + (n.thin ? ' linethickness="0"' : '') + fat + '>' + nu + de + '</mfrac>';
        } finally { S.lvl = sv; S.fd--; }
      }
      case 'sqrt': return n.idx ? '<mroot>' + arg1(n.a) + scriptArg(n.idx) + '</mroot>' : '<msqrt>' + arg1(n.a) + '</msqrt>';
      case 'scr': {
        var base = n.base, b = baseSer(base), lim = n.limits;
        var limitsMode = lim === true || (lim === undefined && ((base.k === 'mo' && base.cls === 'op' && !base.int) || (base.k === 'fn' && base.movable) || (base.k === 'over' || base.k === 'under') && !base.accent));
        var sb = n.sub ? scriptArg(n.sub) : null, sp = n.sup ? scriptArg(n.sup) : null;
        if (limitsMode) {
          if (lim === true && base.k === 'mo') b = '<mo' + moAttrs(base) + ' movablelimits="false">' + esc(base.s) + '</mo>';
          if (sb && sp) return '<munderover>' + b + sb + sp + '</munderover>';
          return sb ? '<munder>' + b + sb + '</munder>' : '<mover>' + b + sp + '</mover>';
        }
        if (sb && sp) return '<msubsup>' + b + sb + sp + '</msubsup>' + fnApply(base);
        return (sb ? '<msub>' + b + sb + '</msub>' : '<msup>' + b + sp + '</msup>') + fnApply(base);
      }
      case 'over': case 'under': {
        var tag = n.k === 'over' ? 'mover' : 'munder', att = n.accent ? (n.k === 'over' ? ' accent="true"' : ' accentunder="true"') : '';
        var acc = n.acc.k === 'mo' ? '<mo' + (n.acc.stretchy ? ' stretchy="true"' : ' stretchy="false"') + ' lspace="0" rspace="0"' + (n.acc.small ? ' style="font-size:70%"' : '') + '>' + esc(n.acc.s) + '</mo>' : scriptArg(n.acc);
        if (n.script) acc = '<mrow scriptlevel="1">' + acc + '</mrow>';
        var bs = n.base.k === 'mo' ? '<mo' + moAttrs(n.base) + (n.base.stretchy ? ' stretchy="true"' : '') + (n.base.minw ? ' style="min-width:1.6em"' : '') + '>' + esc(n.base.s) + '</mo>' : arg1(n.base);
        return '<' + tag + att + '>' + bs + acc + '</' + tag + '>';
      }
      case 'fenced': {
        var o = n.open ? '<mo fence="true" form="prefix" stretchy="true" symmetric="true">' + esc(n.open) + '</mo>' : '';
        var c = n.close ? '<mo fence="true" form="postfix" stretchy="true" symmetric="true">' + esc(n.close) + '</mo>' : '';
        var body = fin(n.a).map(function (x) { return x.mid ? '<mo fence="true" stretchy="true" symmetric="true" lspace="0.2em" rspace="0.2em">' + esc(x.s) + '</mo>' : ser(x); }).join('');
        return '<mrow>' + o + (n.a.length > 1 ? '<mrow>' + body + '</mrow>' : body) + c + '</mrow>';
      }
      case 'table': return serTable(n);
      default: return '';
    }
  }
  function fnApply(base) { return base.k === 'fn' && !base.movable ? '<mo>\u2061</mo>' : ''; }
  function baseSer(base) {
    if (base.k === 'fn') return base.movable ? ser(base) : '<mi' + (base.s.length === 1 ? ' mathvariant="normal"' : '') + '>' + esc(base.s) + '</mi>';
    return arg1(base);
  }
  function serTable(t) {
    var ncol = t.rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0), out = '';
    t.rows.forEach(function (r, i) {
      var cells = '';
      for (var j = 0; j < ncol; j++) {
        var cell = r[j] || [], al = t.align[j] !== undefined ? t.align[j] : t.align[t.align.length - 1];
        if (t.aligned) al = j % 2 ? 'l' : 'r';
        var ca = al === 'l' ? 'left' : al === 'r' ? 'right' : 'center';
        var ta = 'text-align:' + ca + ';text-align:-webkit-' + ca; // Chromium aligns block-level cell content only with the -webkit- value
        var css = ta + ';padding:' + (t.pad || '0.2em 0.5em');
        if (t.aligned) css = ta + ';padding:' + (i ? '0.3em' : '0') + ' ' + (j % 2 && j < ncol - 1 ? '2em' : '0') + ' 0 0';
        if (t.cases && j === 0) css += ';padding-right:1em';
        if (t.vlines) { if (t.vlines[j]) css += ';border-left:0.06em solid currentColor'; if (j === ncol - 1 && t.vlines[j + 1]) css += ';border-right:0.06em solid currentColor'; }
        if (t.lines && t.lines[i]) css += ';border-top:0.06em solid currentColor';
        var content = cell.length ? one(cell) : '<mrow></mrow>';
        if (t.cases === 'd' || t.aligned) content = '<mrow displaystyle="true" scriptlevel="0">' + content + '</mrow>';
        cells += '<mtd columnalign="' + ca + '" style="' + css + '">' + content + '</mtd>';
      }
      out += '<mtr>' + cells + '</mtr>';
    });
    var cols = []; for (var c = 0; c < ncol; c++) { var al2 = t.aligned ? (c % 2 ? 'l' : 'r') : (t.align[c] !== undefined ? t.align[c] : t.align[t.align.length - 1]); cols.push(al2 === 'l' ? 'left' : al2 === 'r' ? 'right' : 'center'); }
    return '<mtable columnalign="' + cols.join(' ') + '"' + (t.small ? ' style="font-size:75%"' : '') + '>' + out + '</mtable>';
  }

  // Math can't wrap inside one <math>, so long formulas are cut into several <math> elements at their top-level
  // relations (=, <, →, …), binary + − ± × ·, and commas (never inside brackets or bars, except one level inside a formula
  // that is one bracketed whole, like a long tuple), with the operator ending its piece (as TeX breaks), and <wbr> between
  // pieces: a narrow screen breaks the line there instead of scrolling. Display math gets the same treatment (its pieces
  // keep display style and each line is centered); a piece wider than the screen still scrolls inside the display box.
  function visibleLen(src) {
    return String(src).replace(/\\(left|right|big|Big|bigg|Bigg)[lmr]?/g, '').replace(/\\(,|;|:|!| |quad|qquad|displaystyle|textstyle)/g, ' ')
      .replace(/\\(text|mathrm|operatorname)\{([^{}]*)\}/g, '$2').replace(/\\[a-zA-Z]+/g, 'M').replace(/[{}^_\s]/g, '').length;
  }
  function isUnaryNode(n) { return !!(n && (n.unary || (n.k === 'scr' && n.base && n.base.unary))); }
  function breakChunks(list) { // list: the fin()ed top level -> [[nodes], …]
    var out = [], cur = [], depth = 0, bars = 0;
    // a formula that is one bracketed whole, like a tuple "(a, b, c)", may also break one level in
    var outer = 0;
    if (list.length > 2 && clsOf(list[0]) === 'open' && clsOf(list[list.length - 1]) === 'close') {
      var d0 = 0, whole = true; for (var q = 0; q < list.length; q++) { var cq = clsOf(list[q]); if (cq === 'open') d0++; else if (cq === 'close') { d0--; if (d0 === 0 && q < list.length - 1) { whole = false; break; } } }
      if (whole) outer = 1;
    }
    // commas one level inside a long bracket group (a vector ⟨a, b, c⟩ or a long list) may break too, not in f(x, y)
    var match = {}, st2 = [];
    list.forEach(function (n, i) { var c = clsOf(n); if (c === 'open') st2.push(i); else if (c === 'close' && st2.length) match[st2.pop()] = i; });
    var opens = [];
    list.forEach(function (n, i) {
      var c = clsOf(n);
      cur.push(n);
      if (c === 'open') { depth++; opens.push(i); }
      else if (c === 'close') { depth = Math.max(0, depth - 1); opens.pop(); }
      if (n.k === 'mo' && (n.s === '|' || n.s === '‖')) bars++;
      if (bars % 2 || i === list.length - 1) return;
      var g0 = opens.length ? opens[opens.length - 1] : -1, longGroup = g0 >= 0 && (list[g0].s === '⟨' || (match[g0] || g0) - g0 >= 14);
      if (depth > outer && !(c === 'punct' && depth === 1 && longGroup)) return;
      var prevN = null; for (var pi2 = i - 1; pi2 >= 0; pi2--) if (list[pi2].k !== 'space') { prevN = list[pi2]; break; }
      if (c === 'rel' || c === 'punct' || (c === 'bin' && !isUnaryNode(n) && !(prevN && prevN.k === 'mtext'))) { // "\text{ and } -5": that minus is a sign
        // keep any space nodes that follow with this piece
        out.push(cur); cur = [];
      }
    });
    if (cur.length) out.push(cur);
    // a piece made of spaces only joins the one before it
    return out.filter(function (c, k) { if (k && c.every(function (n) { return n.k === 'space'; })) { out[k - 1] = out[k - 1].concat(c); return false; } return true; });
  }
  function serList(f) { return f.length === 1 ? ser(f[0]) : '<mrow>' + f.map(ser).join('') + '</mrow>'; }
  function render(src, opts) {
    opts = opts || {};
    var p = new P(String(src == null ? '' : src)), body = '', pieces = null;
    S = { lvl: 0, fd: 0, display: !!opts.display };
    try {
      var list = p.top();
      if (opts.split && visibleLen(src) >= 12) {
        var f = fin(list), ch = breakChunks(f);
        if (ch.length > 1) pieces = ch.map(serList); else body = serList(f);
      } else body = one(list);
    }
    catch (e) { p.err('internal: ' + e.message); body = '<mtext>' + esc(src) + '</mtext>'; pieces = null; }
    var open = '<math xmlns="' + NS + '" class="ml-math"' + (opts.display ? ' display="block"' : '') + '>';
    var html = pieces ? pieces.map(function (x) { return open + x + '</math>'; }).join('<wbr>') : open + body + '</math>';
    return { html: html, errors: p.errors, unknown: p.unknown };
  }
  ML.tex = function (src, opts) { try { return render(src, opts).html; } catch (e) { return '<math xmlns="' + NS + '" class="ml-math"><mtext>' + esc(src) + '</mtext></math>'; } };
  ML.texLint = function (src) { var r = render(src, {}); return { ok: !r.errors.length && !r.unknown.length, errors: r.errors, unknown: r.unknown }; };
  ML._texRender = render;

  // ===================================================================== finding math in text
  function segments(text) {
    var out = [], buf = '', i = 0, n = text.length;
    function flush() { if (buf) { out.push({ math: false, s: buf }); buf = ''; } }
    function findClose(from, close) { // next unescaped occurrence of close
      for (var j = from; j < n; j++) { if (text[j] === '\\') { if (text.substr(j, close.length) === close) return j; j++; continue; } if (text.substr(j, close.length) === close) return j; }
      return -1;
    }
    while (i < n) {
      var c = text[i];
      if (c === '\\') {
        var nx = text[i + 1];
        if (nx === '$' || nx === '%') { buf += '\\' + nx; i += 2; continue; }
        if (nx === '(' || nx === '[') {
          var cl = nx === '(' ? '\\)' : '\\]', j = text.indexOf(cl, i + 2);
          if (j >= 0) { flush(); out.push({ math: true, tex: text.slice(i + 2, j), display: nx === '[', raw: text.slice(i, j + 2) }); i = j + 2; continue; }
        }
        buf += c; i++; continue;
      }
      if (c === '$') {
        if (text[i + 1] === '$') {
          var k = i + 2, end = -1;
          for (; k < n - 1; k++) { if (text[k] === '\\') { k++; continue; } if (text[k] === '$' && text[k + 1] === '$') { end = k; break; } }
          if (end >= 0 && !text.slice(i + 2, end).trim()) { buf += text.slice(i, end + 2); i = end + 2; continue; }
          if (end >= 0) { flush(); out.push({ math: true, tex: text.slice(i + 2, end), display: true, raw: text.slice(i, end + 2) }); i = end + 2; continue; }
          buf += '$$'; i += 2; continue;
        }
        if (text[i + 1] !== undefined && !/\s/.test(text[i + 1])) {
          var e = -1;
          for (var m = i + 1; m < n; m++) {
            if (text[m] === '\\') { m++; continue; }
            if (text[m] === '$') {
              if (!/\s/.test(text[m - 1]) && !/[0-9]/.test(text[m + 1] || '') && !(/[0-9]/.test(text[i + 1]) && /(^|[^\\a-zA-Z])[a-zA-Z]{3,}\b/.test(text.slice(i + 1, m).replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, ' ')))) e = m; // "$5 and $6 more" is money
              break;
            }
          }
          if (e > i + 1) { flush(); out.push({ math: true, tex: text.slice(i + 1, e), display: false, raw: text.slice(i, e + 1) }); i = e + 1; continue; }
        }
        buf += c; i++; continue;
      }
      buf += c; i++;
    }
    flush();
    return out;
  }
  ML.mathSegments = segments;
  function unescText(s) { return s.replace(/\\([$%])/g, '$1'); }

  var SKIP = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1, NOSCRIPT: 1, KBD: 1, SAMP: 1, TEMPLATE: 1 };
  function skipEl(el) {
    if (el.namespaceURI === NS) return true;
    if (SKIP[el.nodeName.toUpperCase()]) return true;
    var cl = el.classList; return !!(cl && (cl.contains('ml-notex') || cl.contains('ml-m') || cl.contains('ml-md')));
  }
  ML.typeset = function (rootEl) {
    try {
      var doc = root.document; if (!doc) return;
      rootEl = rootEl || doc.body; if (!rootEl) return;
      if (rootEl.nodeType === 1 && skipEl(rootEl)) return;
      var nodes = [];
      if (rootEl.nodeType === 3) nodes.push(rootEl);
      else {
        var w = doc.createTreeWalker(rootEl, 5, { acceptNode: function (nd) { if (nd.nodeType === 1) return skipEl(nd) ? 2 : 3; return /[$\\]/.test(nd.nodeValue) ? 1 : 3; } });
        var nd; while ((nd = w.nextNode())) nodes.push(nd);
      }
      nodes.forEach(function (tn) {
        try {
          var segs = segments(tn.nodeValue);
          if (!segs.some(function (s) { return s.math || /\\[$%]/.test(s.s); })) return;
          var frag = doc.createDocumentFragment();
          gluePunct(segs);
          segs.forEach(function (sg) {
            if (!sg.math) {
              var t = unescText(sg.s);
              if (t.indexOf('$') >= 0) { var sp = doc.createElement('span'); sp.className = 'ml-notex'; sp.textContent = t; frag.appendChild(sp); }
              else frag.appendChild(doc.createTextNode(t));
              return;
            }
            var r = render(sg.tex, { display: sg.display, split: true });
            if (r.errors.length) { var bad = doc.createElement('span'); bad.className = 'ml-notex ml-texerr'; bad.textContent = sg.raw; bad.title = 'This math could not be read: ' + r.errors[0]; frag.appendChild(bad); return; }
            var box = doc.createElement('span'); box.className = sg.display ? 'ml-md' : 'ml-m';
            box.innerHTML = glue(r.html, sg.punct);
            frag.appendChild(box);
          });
          if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
        } catch (e) { }
      });
    } catch (e) { }
  };
  // punctuation right after inline math ("… = 0." or "$x$,") stays on the line with the math's last piece
  var PUNCT = /^[.,;:!?)\]’”…]+/;
  function gluePunct(segs) {
    for (var i = 0; i + 1 < segs.length; i++) {
      var a = segs[i], b = segs[i + 1];
      if (!a.math || a.display || b.math) continue;
      var m = PUNCT.exec(b.s); if (!m) continue;
      a.punct = m[0]; b.s = b.s.slice(m[0].length);
    }
    return segs;
  }
  function glue(html, p) {
    if (!p) return html;
    var k = html.lastIndexOf('<wbr>'), head = k < 0 ? '' : html.slice(0, k + 5), tail = k < 0 ? html : html.slice(k + 5);
    return head + '<span class="ml-nb">' + tail + esc(p) + '</span>';
  }
  ML.html = function (s) {
    try {
      return gluePunct(segments(String(s == null ? '' : s))).map(function (sg) {
        if (!sg.math) { var t = unescText(sg.s); return t.indexOf('$') >= 0 ? '<span class="ml-notex">' + t + '</span>' : t; }
        var tex = sg.tex.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');
        var r = render(tex, { display: sg.display, split: true });
        if (r.errors.length) return '<span class="ml-notex ml-texerr">' + esc(sg.raw) + '</span>';
        return '<span class="' + (sg.display ? 'ml-md' : 'ml-m') + '">' + glue(r.html, sg.punct) + '</span>';
      }).join('');
    } catch (e) { return String(s); }
  };

  // ===================================================================== plain math (CAS syntax): parse, print as TeX, convert for the CAS
  var PFN = { sin: 1, cos: 1, tan: 1, sec: 1, csc: 1, cot: 1, asin: 1, acos: 1, atan: 1, arcsin: 1, arccos: 1, arctan: 1, arcsec: 1, arccsc: 1, arccot: 1, sinh: 1, cosh: 1, tanh: 1,
    sech: 1, csch: 1, coth: 1, ln: 1, log: 1, exp: 1, sqrt: 1, cbrt: 1, root: 1, nthroot: 1, abs: 1, floor: 1, ceil: 1, round: 1, sign: 1, sgn: 1, gcd: 1, lcm: 1, max: 1, min: 1,
    mod: 1, nCr: 1, nPr: 1, ncr: 1, npr: 1, choose: 1, factorial: 1 };
  var PGREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ',
    rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω' };
  var GREEK_TEX = {}; Object.keys(PGREEK).forEach(function (k) { GREEK_TEX[PGREEK[k]] = '\\' + k; }); GREEK_TEX['ϕ'] = '\\phi'; GREEK_TEX['ϵ'] = '\\epsilon';
  var PCONST = { pi: 'pi', 'π': 'pi', e: 'e', i: 'i', inf: 'inf', infinity: 'inf', oo: 'inf', '∞': 'inf' };
  function pknown(w) { return !!(PFN[w] || PCONST[w] || PGREEK[w]); }
  var SUPD = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  var VULGAR = { '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4', '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5', '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8' };
  function normPlain(s) {
    return String(s)
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function (m) { return '^(' + m.split('').map(function (c) { return SUPD[c]; }).join('') + ')'; })
      .replace(/(\d)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g, function (m, d, f) { return d + ' ' + VULGAR[f]; })
      .replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, function (f) { return '(' + VULGAR[f] + ')'; })
      .replace(/\*\*/g, '^').replace(/[×·∙⋅✕]/g, '*').replace(/[÷∕⁄]/g, '/').replace(/[−–—‒﹣－]/g, '-').replace(/≤|=</g, '<=').replace(/≥|=>/g, '>=').replace(/≠|<>/g, '!=')
      .replace(/∛/g, ' cbrt ').replace(/ϕ/g, 'φ').replace(/ϵ/g, 'ε').replace(/∪/g, ' U ').replace(/[“”]/g, '"').replace(/[‘’`´]/g, '\'').replace(/\u00a0/g, ' ').replace(/（/g, '(').replace(/）/g, ')');
  }
  function ptokenize(src) {
    var s = normPlain(src), out = [], i = 0, sp = false;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; sp = true; continue; }
      var m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (m) {
        var lit = m[0];
        if (m[2] && /[a-zA-Z(]/.test(s[i + lit.length] || '')) lit = m[1];
        out.push({ t: 'num', v: lit, sp: sp }); i += lit.length; sp = false; continue;
      }
      if (/[a-zA-Zα-ωΑ-Ωπ∞_ϕϵ]/.test(c)) {
        var j = i; while (j < s.length && /[a-zA-Z0-9_α-ωΑ-Ωπ∞ϕϵ]/.test(s[j])) j++;
        var word = s.slice(i, j);
        psplit(word).forEach(function (w, k) { out.push(w.num ? { t: 'num', v: w.num, sp: k === 0 && sp } : { t: w.op ? 'op' : 'id', v: w.v, sp: k === 0 && sp }); });
        i = j; sp = false; continue;
      }
      var two = s.substr(i, 2);
      if (['<=', '>=', '!=', '=='].indexOf(two) >= 0) { out.push({ t: 'op', v: two === '==' ? '=' : two, sp: sp }); i += 2; sp = false; continue; }
      if ('+-*/^()[]{},=<>!\'√|%;⟨⟩'.indexOf(c) >= 0) { out.push({ t: 'op', v: c, sp: sp }); i++; sp = false; continue; }
      throw new Error('I can\'t read the character “' + c + '”.');
    }
    return out;
  }
  function psplit(w) {
    if (w === 'or' || w === 'and') return [{ v: w, op: true }];
    var lm = /^log_(.+)$/.exec(w);
    if (lm) { return [{ v: 'log' }, { v: '_', op: true }].concat(/^\d+$/.test(lm[1]) ? [{ num: lm[1] }] : psplit(lm[1])); }
    if (pknown(w) || /^[a-zA-Zα-ω](_?\d+|_[a-zA-Z0-9]+)$/.test(w)) return [{ v: w }];
    var res = [], i = 0;
    outer: while (i < w.length) {
      for (var L = w.length - i; L > 1; L--) { var p = w.substr(i, L); if (pknown(p)) { res.push({ v: p }); i += L; continue outer; } }
      var m = /^[a-zA-Zα-ω](_?\d+)/.exec(w.slice(i)); if (m) { res.push({ v: m[0] }); i += m[0].length; continue; }
      var d = /^\d+/.exec(w.slice(i)); if (d) { res.push({ num: d[0] }); i += d[0].length; continue; }
      if (w[i] === '_') { i++; continue; }
      res.push({ v: w[i] }); i++;
    }
    return res;
  }
  function PP(toks, opts) { this.t = toks; this.i = 0; this.inAbs = 0; this.o = opts || {}; }
  PP.prototype.peek = function (k) { return this.t[this.i + (k || 0)]; };
  PP.prototype.isOp = function (v, k) { var t = this.peek(k); return !!t && t.t === 'op' && t.v === v; };
  PP.prototype.next = function () { return this.t[this.i++]; };
  PP.prototype.expect = function (v) { if (!this.isOp(v)) { var t = this.peek(); throw new Error(t ? 'Expected “' + v + '” before “' + t.v + '”.' : 'Missing “' + v + '”.'); } this.i++; };
  PP.prototype.top = function () {
    var items = [this.rel()], seps = [];
    while (this.isOp(',') || this.isOp(';') || this.isOp('or') || this.isOp('and')) { seps.push(this.next().v); items.push(this.rel()); }
    if (this.i < this.t.length) { var t = this.peek(); throw new Error(t.v === ')' || t.v === ']' || t.v === '}' ? 'There is an extra “' + t.v + '”.' : 'I didn\'t expect “' + t.v + '” there.'); }
    return items.length === 1 ? items[0] : { t: 'seq', a: items, seps: seps };
  };
  PP.prototype.rel = function () {
    var a = [this.sum()], ops = [];
    while (this.peek() && this.peek().t === 'op' && ['=', '<', '>', '<=', '>=', '!='].indexOf(this.peek().v) >= 0) { ops.push(this.next().v); a.push(this.sum()); }
    return ops.length ? { t: 'rel', ops: ops, a: a } : a[0];
  };
  PP.prototype.sum = function () {
    var terms = [{ op: '+', x: this.product() }];
    while (this.isOp('+') || this.isOp('-')) { var o = this.next().v; terms.push({ op: o, x: this.product() }); }
    return terms.length === 1 ? terms[0].x : { t: 'sum', terms: terms };
  };
  PP.prototype.startsAtom = function () {
    var t = this.peek(); if (!t) return false;
    if (t.t === 'num' || t.t === 'id') return true;
    return t.t === 'op' && (t.v === '(' || t.v === '[' || t.v === '√' || (t.v === '|' && !this.inAbs));
  };
  function isIntLit(n) { return n && n.t === 'num' && /^\d+$/.test(n.s); }
  PP.prototype.mixedAhead = function () {
    var a = this.peek(), b = this.peek(1), c = this.peek(2), d = this.peek(3);
    return this.o.mixed !== false && a && a.t === 'num' && a.sp && /^\d+$/.test(a.v) && b && b.t === 'op' && b.v === '/' && c && c.t === 'num' && /^\d+$/.test(c.v) &&
      !(d && ((d.t === 'op' && (d.v === '^' || d.v === '(' || d.v === '!' || d.v === '√')) || d.t === 'id' || d.t === 'num'));
  };
  PP.prototype.product = function () {
    var f = [{ op: '', x: this.unary() }];
    for (;;) {
      if (f.length === 1 && this.mixedAhead()) {
        var base = f[0].x, ng = base.t === 'neg' && !base.paren, w = ng ? base.a : base;
        if (isIntLit(w)) { var nn = this.next().v; this.next(); var dd = this.next().v; var mx = { t: 'mixed', w: w.s, n: nn, d: dd }; f[0].x = ng ? { t: 'neg', a: mx } : mx; continue; }
      }
      if (this.isOp('*')) { this.next(); f.push({ op: '*', x: this.unary() }); }
      else if (this.isOp('/')) { this.next(); f.push({ op: '/', x: this.unary() }); }
      else if (this.startsAtom()) f.push({ op: '', x: this.power() });
      else break;
    }
    return f.length === 1 ? f[0].x : { t: 'mul', f: f };
  };
  PP.prototype.unary = function () {
    if (this.isOp('-')) { this.next(); return { t: 'neg', a: this.unary() }; }
    if (this.isOp('+')) { this.next(); return this.unary(); }
    return this.power();
  };
  PP.prototype.power = function () {
    var b = this.postfix();
    if (this.isOp('^')) { this.next(); if (!this.peek()) throw new Error('Something should follow “^”.'); return { t: 'pow', b: b, e: this.unary() }; }
    return b;
  };
  PP.prototype.postfix = function () {
    var x = this.atom();
    for (;;) {
      if (this.isOp('!')) { this.next(); x = { t: 'fact', a: x }; }
      else if (this.isOp('%')) { this.next(); x = { t: 'pct', a: x }; }
      else if (this.isOp('\'') && x.t === 'var') { var k = 0; while (this.isOp('\'')) { this.next(); k++; } x = { t: 'var', s: x.s + '\''.repeat(k) }; }
      else break;
    }
    return x;
  };
  PP.prototype.args = function (close) {
    var a = [];
    if (this.isOp(close)) { this.next(); return a; }
    for (;;) { a.push(this.rel()); if (this.isOp(',')) { this.next(); continue; } this.expect(close); return a; }
  };
  PP.prototype.atom = function () {
    var t = this.next();
    if (!t) throw new Error('Keep going: the expression ends too soon.');
    if (t.t === 'num') return { t: 'num', s: t.v };
    if (t.t === 'op') {
      if (t.v === '(') { var save = this.inAbs; this.inAbs = 0; var a = this.args(')'); this.inAbs = save; if (!a.length) throw new Error('Empty parentheses.'); return a.length === 1 ? { t: 'paren', a: a[0], br: '(' } : { t: 'tuple', a: a }; }
      if (t.v === '⟨' ) { var av = this.args('⟩'); return { t: 'tuple', a: av, angle: true }; }
      if (t.v === '[') {
        var sv = this.inAbs; this.inAbs = 0; var it = this.args(']'); this.inAbs = sv;
        if (it.length && it.every(function (r) { return r.t === 'list'; })) return { t: 'mat', rows: it.map(function (r) { return r.a; }) };
        if (it.length === 1) return { t: 'paren', a: it[0], br: '[' };
        return { t: 'list', a: it };
      }
      if (t.v === '{') { var s2 = this.inAbs; this.inAbs = 0; var st = this.args('}'); this.inAbs = s2; return { t: 'set', a: st }; }
      if (t.v === '√') { var arg = this.isOp('(') ? this.atom() : this.power(); return { t: 'fn', name: 'sqrt', args: [arg.t === 'paren' ? arg.a : arg], paren: arg.t === 'paren' }; }
      if (t.v === '|' && !this.inAbs) { this.inAbs++; var inner = this.sum(); this.inAbs--; this.expect('|'); return { t: 'abs', a: inner }; }
      throw new Error(t.v === ')' ? 'There is an extra “)”.' : 'I didn\'t expect “' + t.v + '” there.');
    }
    var name = t.v;
    if (PCONST[name]) return { t: 'const', s: PCONST[name] };
    if (PGREEK[name]) return { t: 'var', s: PGREEK[name] };
    if (PFN[name] && (name.length > 1 || this.isOp('('))) {
      var base = null, pw = null, args;
      if (name === 'log' && this.isOp('_')) { this.next(); base = this.isOp('(') ? this.atom() : this.postfix(); if (base.t === 'paren') base = base.a; }
      if (this.isOp('^')) { this.next(); pw = this.unary(); }
      var paren = false;
      if (this.isOp('(')) { this.next(); args = this.args(')'); paren = true; if (!args.length) throw new Error('Put something inside ' + name + '( ).'); }
      else {
        if (!this.startsAtom()) throw new Error('Keep going: ' + name + ' needs something to act on.');
        var f = [this.power()];
        while (this.startsAtom() && !(this.peek().t === 'id' && PFN[this.peek().v])) f.push(this.power());
        args = [f.length === 1 ? f[0] : { t: 'mul', f: f.map(function (x, k) { return { op: '', x: x }; }) }];
      }
      var node = { t: 'fn', name: name, args: args, paren: paren };
      if (base) node.base = base;
      if (pw) node.pw = pw;
      return node;
    }
    return { t: 'var', s: name };
  };
  ML.parsePlain = function (s, opts) {
    try {
      if (s === null || s === undefined || !String(s).trim()) return { ok: false, err: 'Type an answer first.', empty: true };
      var toks = ptokenize(s);
      if (!toks.length) return { ok: false, err: 'Type an answer first.', empty: true };
      var node = new PP(toks, opts).top();
      return { ok: true, node: node };
    } catch (e) { return { ok: false, err: e.message || 'I couldn\'t read that.' }; }
  };

  // ---- plain node -> CAS string
  var CASFN = { arcsin: 'asin', arccos: 'acos', arctan: 'atan', sgn: 'sign', nCr: 'ncr', choose: 'ncr', nPr: 'npr', root: 'nthroot' };
  var INVFN = { sin: 'asin(#)', cos: 'acos(#)', tan: 'atan(#)', sec: 'acos(1/(#))', csc: 'asin(1/(#))', cot: 'atan(1/(#))', sinh: 'asinh(#)', cosh: 'acosh(#)', tanh: 'atanh(#)' };
  function toCAS(n) {
    switch (n.t) {
      case 'num': return /e/i.test(n.s) ? '(' + n.s + ')' : n.s;
      case 'mixed': return '(' + n.w + '+' + n.n + '/' + n.d + ')';
      case 'var': return n.s;
      case 'const': return n.s;
      case 'neg': return '(-(' + toCAS(n.a) + '))';
      case 'sum': return '(' + n.terms.map(function (t, k) { return (k || t.op === '-' ? t.op : '') + '(' + toCAS(t.x) + ')'; }).join('') + ')';
      case 'mul': return '(' + n.f.map(function (f, k) { return (k ? (f.op === '/' ? '/' : '*') : '') + '(' + toCAS(f.x) + ')'; }).join('') + ')';
      case 'pow': return '((' + toCAS(n.b) + ')^(' + toCAS(n.e) + '))';
      case 'paren': return '(' + toCAS(n.a) + ')';
      case 'abs': return 'abs(' + toCAS(n.a) + ')';
      case 'fact': return '((' + toCAS(n.a) + ')!)';
      case 'pct': return '((' + toCAS(n.a) + ')/100)';
      case 'fn': {
        var a = n.args.map(toCAS), nm = n.name, s;
        if (nm === 'arcsec') s = 'acos(1/(' + a[0] + '))';
        else if (nm === 'arccsc') s = 'asin(1/(' + a[0] + '))';
        else if (nm === 'arccot') s = 'atan(1/(' + a[0] + '))';
        else if (nm === 'sech') s = '(1/cosh(' + a[0] + '))';
        else if (nm === 'csch') s = '(1/sinh(' + a[0] + '))';
        else if (nm === 'coth') s = '(1/tanh(' + a[0] + '))';
        else if (nm === 'log' && n.base) s = 'log(' + a[0] + ',' + toCAS(n.base) + ')';
        else s = (CASFN[nm] || nm) + '(' + a.join(',') + ')';
        if (n.pw) {
          // sin^(-1)(x), tan^-1 x … are the inverse functions; sin^2(x) is (sin x)^2
          var pw = n.pw; while (pw.t === 'paren') pw = pw.a;
          if (pw.t === 'neg' && pw.a.t === 'num' && /^1(\.0*)?$/.test(pw.a.s) && INVFN[nm] && a.length === 1) return INVFN[nm].replace('#', a[0]);
          return '((' + s + ')^(' + toCAS(n.pw) + '))';
        }
        return s;
      }
      case 'rel': return n.a.map(toCAS).reduce(function (acc, x, k) { return k ? acc + n.ops[k - 1] + x : x; }, '');
      case 'tuple': return '(' + n.a.map(toCAS).join(',') + ')';
      case 'list': case 'set': return '{' + n.a.map(toCAS).join(',') + '}';
      case 'mat': return '[' + n.rows.map(function (r) { return '[' + r.map(toCAS).join(',') + ']'; }).join(',') + ']';
      case 'seq': return n.a.map(toCAS).join(',');
    }
    throw new Error('Unknown node ' + n.t);
  }
  ML.plainToCAS = function (n) { if (typeof n === 'string') { var r = ML.parsePlain(n); if (!r.ok) throw new Error(r.err); n = r.node; } return toCAS(n); };

  // ---- plain node -> TeX
  var TEXFN = { sin: '\\sin', cos: '\\cos', tan: '\\tan', sec: '\\sec', csc: '\\csc', cot: '\\cot', asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', arcsin: '\\arcsin',
    arccos: '\\arccos', arctan: '\\arctan', arcsec: '\\operatorname{arcsec}', arccsc: '\\operatorname{arccsc}', arccot: '\\operatorname{arccot}', sinh: '\\sinh', cosh: '\\cosh',
    tanh: '\\tanh', coth: '\\coth', sech: '\\operatorname{sech}', csch: '\\operatorname{csch}', ln: '\\ln', log: '\\log', gcd: '\\gcd', lcm: '\\operatorname{lcm}', max: '\\max',
    min: '\\min', sign: '\\operatorname{sgn}', sgn: '\\operatorname{sgn}', round: '\\operatorname{round}' };
  function varTex(s) {
    var pr = (/'+$/.exec(s) || [''])[0]; s = s.slice(0, s.length - pr.length);
    var m = /^(.)_?(\d+)$/.exec(s) || /^(.)_(.+)$/.exec(s);
    var b = m ? m[1] : s, g = GREEK_TEX[b] ? GREEK_TEX[b] + ' ' : b;
    var out = m ? g.trim() + '_{' + (GREEK_TEX[m[2]] || m[2]) + '}' : (s.length > 1 && !GREEK_TEX[s] ? '\\mathit{' + s + '}' : g.trim());
    return out + pr;
  }
  function W(s, p, tall) { return { s: s, p: p, tall: !!tall }; }
  function par(o, br) { br = br || '('; var cl = { '(': ')', '[': ']', '{': '\\}' }[br], op = br === '{' ? '\\{' : br; return o.tall ? '\\left' + op + o.s + '\\right' + (br === '{' ? '\\}' : cl) : op + o.s + cl; }
  function numTex(s) {
    var m = /^(\d*\.?\d*)[eE]([+-]?\d+)$/.exec(s); if (m) return m[1] + ' \\times 10^{' + m[2].replace('+', '') + '}';
    return s;
  }
  function tx(n) {
    switch (n.t) {
      case 'num': return W(numTex(n.s), 5);
      case 'mixed': return W(n.w + '\\frac{' + n.n + '}{' + n.d + '}', 4.5, true);
      case 'var': return W(varTex(n.s), 5);
      case 'const': return W({ pi: '\\pi', e: 'e', i: 'i', inf: '\\infty' }[n.s], 5);
      case 'neg': { var a = tx(n.a); return W('-' + (a.p < 2 || n.a.t === 'neg' ? par(a) : a.s), 2, a.tall); }
      case 'sum': {
        var s = '', tall = false;
        n.terms.forEach(function (t, k) { var o = tx(t.x); tall = tall || o.tall; var body = o.p < 1.5 ? par(o) : o.s; s += k ? (t.op === '-' ? ' - ' : ' + ') + body : (t.op === '-' ? '-' : '') + body; });
        return W(s, 1, tall);
      }
      case 'mul': {
        // -1/4 and -x/4 print as -\frac{1}{4} and -\frac{x}{4} (the sign in front, not in the numerator)
        var f0 = n.f[0];
        if (f0.x.t === 'neg' && f0.x.a.t !== 'neg' && n.f.some(function (f) { return f.op === '/'; })) {
          var rest = mulTex({ t: 'mul', f: [{ op: f0.op, x: f0.x.a }].concat(n.f.slice(1)) });
          return W('-' + (rest.p < 2 ? par(rest) : rest.s), 2, rest.tall);
        }
        return mulTex(n);
      }
      case 'pow': {
        var b = tx(n.b), e = n.e.t === 'paren' ? tx(n.e.a) : tx(n.e);
        var es = e.s;
        if (/^\\frac\{([^{}]+)\}\{([^{}]+)\}$/.test(es) && (n.e.t === 'paren' ? n.e.a : n.e).t === 'mul') es = es.replace(/^\\frac\{([^{}]+)\}\{([^{}]+)\}$/, '$1/$2');
        var bs = b.p < 5 || n.b.t === 'mixed' || n.b.t === 'pow' || (n.b.t === 'fn' && !n.b.pw && n.b.name !== 'abs') ? par(b) : b.s;
        if (n.b.t === 'fn' && n.b.name === 'sqrt' ) bs = par(b);
        return W(bs + '^{' + es + '}', 4, b.tall);
      }
      case 'paren': { var a2 = tx(n.a); return W(par(a2, n.br), 5, a2.tall); }
      case 'abs': { var a3 = tx(n.a); return W(a3.tall ? '\\left|' + a3.s + '\\right|' : '|' + a3.s + '|', 5, a3.tall); }
      case 'fact': { var a4 = tx(n.a); return W((a4.p < 5 ? par(a4) : a4.s) + '!', 5, a4.tall); }
      case 'pct': { var a5 = tx(n.a); return W((a5.p < 4 ? par(a5) : a5.s) + '\\%', 5, a5.tall); }
      case 'fn': return fnTex(n);
      case 'rel': {
        var REL = { '=': '=', '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge', '!=': '\\ne' }, tl = false;
        var parts = n.a.map(function (x) { var o = tx(x); tl = tl || o.tall; return o.s; });
        return W(parts.reduce(function (acc, x, k) { return k ? acc + ' ' + REL[n.ops[k - 1]] + ' ' + x : x; }, ''), 0, tl);
      }
      case 'tuple': { var it = n.a.map(tx), t5 = it.some(function (o) { return o.tall; }), body = it.map(function (o) { return o.s; }).join(', '); return W(n.angle ? (t5 ? '\\left\\langle ' + body + '\\right\\rangle' : '\\langle ' + body + '\\rangle') : (t5 ? '\\left(' + body + '\\right)' : '(' + body + ')'), 5, t5); }
      case 'list': { var il = n.a.map(tx), tl2 = il.some(function (o) { return o.tall; }), bl = il.map(function (o) { return o.s; }).join(', '); return W(tl2 ? '\\left[' + bl + '\\right]' : '[' + bl + ']', 5, tl2); }
      case 'set': { var is = n.a.map(tx), ts = is.some(function (o) { return o.tall; }), bset = is.map(function (o) { return o.s; }).join(', '); return W(ts ? '\\left\\{' + bset + '\\right\\}' : '\\{' + bset + '\\}', 5, ts); }
      case 'mat': return W('\\begin{bmatrix} ' + n.rows.map(function (r) { return r.map(function (x) { return tx(x).s; }).join(' & '); }).join(' \\\\ ') + ' \\end{bmatrix}', 5, true);
      case 'seq': {
        var SEP = { ',': ', ', ';': ';\\; ', or: '\\ \\text{or}\\ ', and: '\\ \\text{and}\\ ' }, tq = false;
        var ps = n.a.map(function (x) { var o = tx(x); tq = tq || o.tall; return o.s; });
        return W(ps.reduce(function (acc, x, k) { return k ? acc + SEP[n.seps[k - 1]] + x : x; }, ''), 0, tq);
      }
    }
    throw new Error('Unknown node ' + n.t);
  }
  function startsDigit(s) { return /^[0-9.]/.test(s) || /^\\frac/.test(s) || /^-/.test(s); }
  function mulTex(n) {
    var cur = null, curNodes = [], tall = false;
    n.f.forEach(function (f, k) {
      if (f.op === '/') {
        var num = curNodes.length === 1 && curNodes[0].t === 'paren' ? tx(curNodes[0].a).s : cur.s;
        var den = f.x.t === 'paren' ? tx(f.x.a).s : tx(f.x).s;
        cur = W('\\frac{' + num + '}{' + den + '}', 5, true); curNodes = [{ t: 'frac' }]; tall = true; return;
      }
      var o = tx(f.x); tall = tall || o.tall;
      var body = o.p < 2 || f.x.t === 'neg' && k > 0 ? par(o) : o.s;
      if (!cur) { cur = W(body, 2, o.tall); curNodes = [f.x]; return; }
      var prevNode = curNodes[curNodes.length - 1];
      var dot = startsDigit(body) || f.x.t === 'mixed' || (f.x.t === 'neg' && f.op === '*') || (prevNode.t === 'frac' && /^\\frac|^[0-9]/.test(body)) || (prevNode.t === 'num' && f.x.t === 'pow' && f.x.b.t === 'num') || prevNode.t === 'fact' && /^[0-9(]/.test(body) || prevNode.t === 'pct' || f.x.t === 'pct';
      cur = W(cur.s + (dot ? ' \\cdot ' : ' ') + body, 2, tall); curNodes.push(f.x);
    });
    cur.p = curNodes.length === 1 && curNodes[0].t === 'frac' ? 5 : 2; cur.tall = tall;
    return cur;
  }
  function fnTex(n) {
    var a = n.args.map(tx), nm = n.name, tall = a.some(function (o) { return o.tall; });
    var inner = a.map(function (o) { return o.s; }).join(', ');
    function wrap() { return tall ? '\\left(' + inner + '\\right)' : '(' + inner + ')'; }
    var pw = n.pw ? tx(n.pw.t === 'paren' ? n.pw.a : n.pw).s : null, s;
    switch (nm) {
      case 'sqrt': s = '\\sqrt{' + inner + '}'; return pw ? W('\\left(' + s + '\\right)^{' + pw + '}', 4, true) : W(s, 5, tall);
      case 'cbrt': s = '\\sqrt[3]{' + inner + '}'; return pw ? W('\\left(' + s + '\\right)^{' + pw + '}', 4, true) : W(s, 5, tall);
      case 'root': case 'nthroot': s = '\\sqrt[' + (a[1] ? a[1].s : 2) + ']{' + a[0].s + '}'; return W(s, 5, tall);
      case 'abs': s = tall ? '\\left|' + inner + '\\right|' : '|' + inner + '|'; return pw ? W(s + '^{' + pw + '}', 4, tall) : W(s, 5, tall);
      case 'exp': return W('e^{' + inner + '}', 4, tall);
      case 'floor': return W('\\left\\lfloor ' + inner + '\\right\\rfloor', 5, tall);
      case 'ceil': return W('\\left\\lceil ' + inner + '\\right\\rceil', 5, tall);
      case 'nCr': case 'ncr': case 'choose': return W('\\binom{' + a[0].s + '}{' + (a[1] ? a[1].s : '') + '}', 5, true);
      case 'nPr': case 'npr': return W('P' + wrap(), 5, tall);
      case 'factorial': return W((a[0].p < 5 ? '(' + a[0].s + ')' : a[0].s) + '!', 5, tall);
      case 'mod': return W(a[0].s + ' \\bmod ' + (a[1] ? a[1].s : ''), 2, tall);
    }
    var name = TEXFN[nm] || '\\operatorname{' + nm + '}';
    if (nm === 'log' && n.base) name += '_{' + tx(n.base).s + '}';
    if (pw) name += '^{' + pw + '}';
    if (n.paren || a.length > 1) return W(name + wrap(), 5, tall);
    var arg0 = n.args[0], o0 = a[0];
    return W(name + ' ' + (o0.p < 2 ? par(o0) : o0.s), 2, tall);
  }
  var WORDS = /^(no solutions?|none|all real numbers|all reals|infinitely many( solutions)?|dne|does not exist|undefined|empty( set)?|true|false|yes|no)$/i;
  // tidy (for showing a computed answer, not for echoing what a learner typed): a factor of 1 goes ("1*x" -> x,
  // "-1*x^4" -> -x^4, "cos(1 t)" -> cos t), "+ (-11)" reads "- 11", "- (-3)" reads "+ 3", and "(3) x" reads "3x"
  function isOne(x) { return !!x && x.t === 'num' && /^1(\.0*)?$/.test(x.s); }
  function isZero(x) { return !!x && x.t === 'num' && /^0*(\.0*)?$/.test(x.s); }
  function tidy(n) {
    if (Array.isArray(n)) return n.map(tidy);
    if (!n || typeof n !== 'object') return n;
    var o = {}; for (var k in n) o[k] = (k === 'f' || k === 'terms') && Array.isArray(n[k]) ? n[k].map(function (q) { var c = {}; for (var j in q) c[j] = q[j]; c.x = tidy(q.x); return c; }) : tidy(n[k]);
    if (o.t === 'mul') {
      var neg = false;
      var fs = o.f.map(function (q, i) { // (3) -> 3 as a factor; a leading -1 becomes a sign
        var x = q.x; if (x.t === 'paren' && (x.a.t === 'num' || x.a.t === 'var' || x.a.t === 'const') && q.op !== '/') x = x.a;
        if (i === 0 && x.t === 'paren' && x.a.t === 'neg' && (x.a.a.t === 'num' || x.a.a.t === 'var' || x.a.a.t === 'const') && o.f.length > 1) { neg = !neg; x = x.a.a; } // (-6) x -> -6x
        if (i === 0 && x.t === 'neg' && isOne(x.a) && o.f.length > 1 && o.f[1].op !== '/') { neg = !neg; x = { t: 'num', s: '1' }; }
        return { op: q.op, x: x };
      });
      var keep = fs.filter(function (q, i) { return !(q.op !== '/' && isOne(q.x) && fs.length > 1 && !(fs[i + 1] && fs[i + 1].op === '/' && i === 0)); });
      if (!keep.length) keep = [{ op: '*', x: { t: 'num', s: '1' } }];
      else if (keep[0].op === '/') keep = [{ op: '*', x: { t: 'num', s: '1' } }].concat(keep);
      var m = keep.length === 1 ? keep[0].x : { t: 'mul', f: keep };
      return neg ? { t: 'neg', a: m } : m;
    }
    if (o.t === 'sum') {
      // a term that is 0 (or 0 times something) goes: "42(x + 2) + 0(y + 2)" -> "42(x + 2)", "y - (0)" -> "y"
      var nz = o.terms.filter(function (q) { var x = q.x; while (x.t === 'paren' || x.t === 'neg') x = x.a; return !isZero(x) && !(x.t === 'mul' && x.f.some(function (g, j) { return g.op !== '/' && isZero(g.x.t === 'paren' ? g.x.a : g.x); })); });
      if (!nz.length) return { t: 'num', s: '0' };
      if (nz[0] !== o.terms[0] && nz[0].op === '-') nz[0] = { op: '+', x: { t: 'neg', a: nz[0].x } };
      o.terms = nz.map(function (q, i) {
        var x = q.x; while (x.t === 'paren' && x.a.t === 'neg') x = x.a;
        if (i > 0 && x.t === 'neg') return { op: q.op === '-' ? '+' : '-', x: x.a };
        return i > 0 || x === q.x ? q : { op: q.op, x: x };
      });
      if (o.terms.length === 1 && o.terms[0].op !== '-') return o.terms[0].x;
    }
    return o;
  }
  ML.plainToTex = function (s, opts) {
    var td = opts && opts.tidy;
    if (s && typeof s === 'object') return tx(td ? tidy(s) : s).s;
    if (s === null || s === undefined || !String(s).trim()) return '';
    var str = String(s).trim();
    if (WORDS.test(str)) return '\\text{' + str.replace(/[{}\\$]/g, '') + '}';
    var r = ML.parsePlain(str);
    if (!r.ok) throw new Error(r.err);
    return tx(td ? tidy(r.node) : r.node).s;
  };
  ML.plain = function (s, opts) {
    try { var t = ML.plainToTex(s); return ML.tex(t, opts); }
    catch (e) { return '<math xmlns="' + NS + '" class="ml-math ml-wait"' + ((opts && opts.display) ? ' display="block"' : '') + '><mtext>…</mtext></math>'; }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = ML;
})(typeof window !== 'undefined' ? window : globalThis);
