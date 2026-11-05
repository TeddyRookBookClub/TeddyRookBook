/* Read aloud (Teddy Rook Book): a speaker button beside the section headings of lessons and guides reads that one section
   with the browser's own voices (speechSynthesis; no audio files). Loaded, minified and fingerprinted, by the small stub in
   assets/js/site-shell.js, only on pages that have one of the ROOTS below and only where the browser can speak.
   Styles: assets/css/read-aloud.css (prefix trb-say-).
   - Sections: h2 (and h3 when its h2 section is long, or when a page uses h3 as its main headings) inside ROOTS. A section runs
     from its heading to the next heading of the same or higher level. The text before the first heading gets a button on the
     page's h1. Skipped: SKIP below (credits, practice, code, figures that are interactives, buttons, forms, menus) and
     anything not shown (closed <details>, hidden answers).
   - Math: the TeX source kept in data-tex by static/math/core/tex.js, turned into words by tex() below.
   - Greek (lang="grc"/"el" and Greek-script runs) and Latin (lang="la"): a voice for that language if the device has one,
     otherwise "Greek passage" / "Latin passage".
   - One utterance per sentence. Pause is a cancel that keeps the place, because pause() is unreliable on phones.
   - Background music: 'trb:sound-start' when speech starts and every 3 seconds while it goes on; the player
     (static/music/suite/player/) ducks for 4 seconds after each, so the music comes back by itself after speech stops.
   - Setting (voice and speed): localStorage 'trb-voice-v1' {v: voiceURI, r: rate}, device-wide (SHARED in static/js/profiles.js).
     Shown in the "Aa" panel of the header.
   - Highlight: the CSS Custom Highlight API where there is one, otherwise a class on the block being read. Nothing in the
     page is rewritten; both are removed on stop. */
(function (W, D) {
  'use strict';
  var SS = W.speechSynthesis;
  if (!SS || !W.SpeechSynthesisUtterance || W.TRBSay) return;
  var KEY = 'trb-voice-v1', RATES = [0.75, 1, 1.25, 1.5];
  var ROOTS = 'article.mlp-lesson,.gbi,article.sh,article.rn,.cx-regions,article.wh,div[class="hs"],.hs-lesson,article.cp,article.gx';
  var SKIP = 'script,style,pre,code,kbd,canvas,svg,img,picture,iframe,video,audio,button,form,input,select,' +
    'textarea,label,nav,header.header,footer,aside.trb-cr,.trb-cr,.mlp-sources,.mlp-practice,.mlp-try,.mlp-rel,.gb-rel,.mlp-crumbs,' +
    '.xa-bar,.trb-say-b,[aria-hidden="true"],[hidden],.ml-viz,[data-viz],.sr-only,[role="toolbar"],[role="tablist"],' +
    '[role="img"],.hs-cards,.trb-video-play,.ml-rkey,figure:has(canvas,svg,.ml-viz,[data-viz],iframe)';
  var BLOCK = /^(P|LI|DIV|SECTION|ARTICLE|ASIDE|BLOCKQUOTE|H[1-6]|DT|DD|TD|TH|TR|FIGCAPTION|FIGURE|UL|OL|DL|TABLE|BR|HR|DETAILS|SUMMARY|HEADER)$/;
  var BR = '\u2029', AT = '\uFFFC';
  try { D.querySelector('figure:has(p)'); } catch (e) { SKIP = SKIP.replace(/,figure:has\([^)]*\)/, ''); }

  /* ---------- TeX to words (table-driven; unknown commands are read by name) ---------- */
  var T = {}, BB = { R: 'the real numbers', N: 'the natural numbers', Z: 'the integers', Q: 'the rationals', C: 'the complex numbers' };
  ('cdot,times:times|div:divided by|pm:plus or minus|mp:minus or plus|le,leq:~less than or equal to|ge,geq:~greater than or equal to|' +
    'ne,neq:~not equal to|approx:~about|equiv:~equivalent to|sim:~similar to|cong:~congruent to|propto:~proportional to|to,rightarrow:goes to|' +
    'mapsto:maps to|Rightarrow,implies:implies|Leftrightarrow,iff:if and only if|infty:infinity|nabla:del|sum:the sum of|prod:the product of|' +
    'int:the integral of|lim:the limit as|in:~in|notin:~not in|subset,subseteq:~a subset of|cup:union|cap:intersection|' +
    'emptyset,varnothing:the empty set|parallel:~parallel to|perp:~perpendicular to|circ:composed with|degree:degrees|' +
    'ldots,cdots,dots:and so on|sin:sine|cos:cosine|tan:tangent|sec:secant|csc:cosecant|cot:cotangent|ln:natural log|exp:e to the|' +
    'gcd:the greatest common divisor of|det:the determinant of|%:percent|$:dollars|neg:not|land:and|lor:or|forall:for all|' +
    'exists:there is|hbar:h bar|ell:l').split('|').forEach(function (e) {
    e = e.split(':'); e[0].split(',').forEach(function (k) { T[k] = e[1].replace('~', 'is '); });
  });
  var GN = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega'.split(' '), GK = {};
  GN.forEach(function (g, n) {
    var C = g.charAt(0).toUpperCase() + g.slice(1);
    T[g] = T['var' + g] = g; T[C] = 'capital ' + g;
    GK['αβγδεζηθικλμνξοπρστυφχψω'.charAt(n)] = g; GK['ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.charAt(n)] = T[C];
  });
  GK['ς'] = 'sigma';
  var CH = { '+': 'plus', '-': 'minus', '=': 'equals', '<': 'is less than', '>': 'is greater than', '/': 'over', '!': 'factorial',
    '\'': 'prime', '*': 'times', '|': '', '(': '', ')': '', '[': '', ']': '', '&': '', '~': ' ' };
  var WRAP = /^(text|textbf|textit|mbox|mathrm|mathbf|mathit|mathsf|mathtt|mathcal|mathfrak|boldsymbol|bm|operatorname|displaystyle|textstyle|boxed|underline|overbrace|underbrace)$/;
  var ACC = { vec: 'vector', hat: 'hat', bar: 'bar', overline: 'bar', dot: 'dot', ddot: 'double dot', tilde: 'tilde', widehat: 'hat', widetilde: 'tilde', overrightarrow: 'vector' };
  function tex(src) {
    var s = String(src || '').replace(/\{,\}/g, ''), i = 0;
    if (/\\begin\b/.test(s)) return 'formula';
    function ws() { while (i < s.length && /\s/.test(s[i])) i++; }
    function tok() {
      ws(); if (i >= s.length) return null;
      var c = s[i++];
      if (c === '\\') { var m = /^[a-zA-Z]+|^./.exec(s.slice(i)); i += m ? m[0].length : 0; return { c: m ? m[0] : '' }; }
      if (/[0-9.]/.test(c)) { var n = c; while (i < s.length && /[0-9.,]/.test(s[i]) && !(s[i] === ',' && !/[0-9]/.test(s[i + 1] || ''))) n += s[i++]; return { t: n.replace(/,/g, '') }; }
      return { t: c };
    }
    function arg() { // one argument: {group} or a single token, as words
      ws(); if (s[i] === '{') { i++; return seq('}'); }
      var k = tok(); return k ? one(k) : '';
    }
    function raw() { ws(); if (s[i] === '{') { var d = 1, a = ++i; while (i < s.length && d) { if (s[i] === '{') d++; else if (s[i] === '}') d--; i++; } return s.slice(a, i - 1); } return s[i++] || ''; }
    function simple(w) { return !/\s/.test(w.trim()); }
    function one(k) {
      if (k.t != null) { if (k.t === '{') return seq('}'); return CH[k.t] != null ? CH[k.t] : k.t; }
      var c = k.c;
      if (/^[dtc]?frac$/.test(c)) { var a = arg(), b = arg(); return simple(a) && simple(b) ? a + ' over ' + b : 'the fraction ' + a + ', over ' + b + ','; }
      if (c === 'binom') { var n = arg(); return n + ' choose ' + arg(); }
      if (c === 'sqrt') { ws(); var r = ''; if (s[i] === '[') { var e = s.indexOf(']', i); r = tex(s.slice(i + 1, e)); i = e + 1; } var x = arg();
        return (r === '' || r === '2' ? 'the square root of ' : r === '3' ? 'the cube root of ' : 'the ' + r + 'th root of ') + x + (simple(x) ? '' : ','); }
      if (c === 'mathbb') { var z = raw(); return BB[z] || z; }
      if (c === 'text' || c === 'mbox' || c === 'textrm') return raw();
      if (WRAP.test(c)) return arg();
      if (ACC[c]) return arg() + ' ' + ACC[c];
      if (/^(left|right|middle|[bB]igg?[lrm]?|limits|nolimits|q?quad|[,!;: ])$/.test(c)) return ' ';
      if (c === '{' || c === '}') return '';
      if (/^(hspace|vspace|label|tag)$/.test(c)) { raw(); return ' '; }
      return T[c] || BB[c] || c;
    }
    function sup(w) {
      w = w.trim();
      if (w === '2') return ' squared'; if (w === '3') return ' cubed'; if (/^(composed with|degrees)$/.test(w)) return ' degrees';
      if (/^(prime ?)+$/.test(w)) return ' ' + w; if (w === 'minus 1') return ' inverse';
      return simple(w) ? ' to the ' + w : ' to the power ' + w + ',';
    }
    function seq(end) {
      var out = '', cl = 0;
      for (;;) {
        ws(); if (i >= s.length) break;
        if (end && s[i] === end) { i++; break; }
        if (s[i] === '^') { i++; out += (cl ? ', all' : '') + sup(arg()); cl = 0; continue; }
        if (s[i] === '_') { i++; out += ' sub ' + arg(); continue; }
        var k = tok(); if (!k) break;
        var w = one(k);
        cl = k.t === ')' || k.t === ']' || k.c === '}';
        if (k.c === 'lim' && /^\s*_/.test(s.slice(i))) { ws(); i++; w += ' ' + arg() + ','; }
        if (/^(sum|prod|int|iint|oint)$/.test(k.c)) {
          w = w.replace(/ of$/, ''); ws();
          if (s[i] === '_') { i++; w += ' from ' + arg(); ws(); }
          if (s[i] === '^') { i++; w += ' to ' + arg(); }
          w += ' of';
        }
        out += ' ' + w;
      }
      return out;
    }
    try { return seq('').replace(/\s+/g, ' ').replace(/ ,/g, ',').replace(/,+$/, '').trim() || 'formula'; } catch (e) { return 'formula'; }
  }

  /* ---------- plain text to what is said ---------- */
  var SYM = [[/≤/g, ' is less than or equal to '], [/≥/g, ' is greater than or equal to '], [/≠/g, ' is not equal to '],
    [/±/g, ' plus or minus '], [/≈/g, ' is about '], [/√/g, ' the square root of '], [/∞/g, ' infinity '], [/°/g, ' degrees '],
    [/²/g, ' squared'], [/³/g, ' cubed'], [/×/g, ' times '], [/÷/g, ' divided by '], [/−/g, ' minus '], [/[→←↔⟶›»«‹·•|]/g, ' '],
    [/\be\.\s?g\.(,)?/gi, 'for example$1'], [/\bi\.\s?e\.(,)?/gi, 'that is$1'], [/\b(c|ca)\.\s?(?=\d)/g, 'about '],
    [/\bB\.?C\.?(?=[\s,.;:)]|$)/g, 'B C '], [/\bA\.?D\.?(?=\s\d)/g, 'A D'], [/(\d\s?)AD\b/g, '$1A D'], [/\bBCE\b/g, 'B C E'], [/(\d)\s?[–—-]\s?(\d)/g, '$1 to $2'],
    [/[–—]/g, ', '], [/(^|\s)-(?=[a-z])|([a-z])-(?=\s)/gi, '$1$2 ']];
  var EMO = null; try { EMO = new RegExp('[\\p{Extended_Pictographic}\\u{FE0F}\\u{200D}\\u{20E3}]', 'gu'); } catch (e) { }
  function say(t) {
    t = String(t || '').replace(/\$\$?([^$]+)\$\$?/g, function (m, x) { return ' ' + tex(x) + ' '; });
    SYM.forEach(function (p) { t = t.replace(p[0], p[1]); });
    t = t.replace(/[\u0391-\u03c9]/g, function (c) { return GK[c] ? ' ' + GK[c] + ' ' : c; });
    if (EMO) t = t.replace(EMO, ' ');
    return t.replace(/\s+([,.;:!?])/g, '$1').replace(/\s+/g, ' ').trim();
  }

  /* ---------- reading a section ---------- */
  function lvl(h) { return +h.tagName.charAt(1); }
  function isH(n) { return /^H[1-6]$/.test(n.tagName); }
  function skip(el, fast) {
    try { if (el.matches(SKIP)) return true; } catch (e) { }
    return !fast && !el.getClientRects().length;
  }
  function nextNode(n, kids, root, exits) {
    if (kids && n.firstChild) return n.firstChild;
    while (n && n !== root) { if (n.nextSibling) return n.nextSibling; n = n.parentNode; if (n && n.nodeType === 1 && exits) exits(n); }
    return null;
  }
  // pieces of the section: text nodes, atoms (math, other-language passages) and breaks between blocks
  function collect(sec, fast) {
    var out = [], root = sec.root, n = sec.from, L = sec.level, first = true, stopSel = 'h1,h2,h3,h4,h5,h6'.slice(0, 3 * L - 1);
    if (sec.h1 && sec.from !== sec.h1) { out = collect({ root: sec.h1, from: sec.h1, level: 1 }, fast); out.push({ k: 'b' }); }
    function br() { if (out.length && out[out.length - 1].k !== 'b') out.push({ k: 'b' }); }
    function ex(el) { if (BLOCK.test(el.tagName)) br(); }
    while (n) {
      var kids = true;
      if (n.nodeType === 3) { if (n.nodeValue) out.push({ k: 't', node: n, t: n.nodeValue }); }
      else if (n.nodeType === 1) {
        if (!first && isH(n) && lvl(n) <= L) break;
        if (n.classList.contains('ml-m') || n.classList.contains('ml-md') || n.hasAttribute('data-tex')) {
          if (!fast && !n.getClientRects().length) { kids = false; }
          else {
            // punctuation that tex.js glued to the formula, so the sentence still ends there
            var tx = n.getAttribute('data-tex'), mt = n.textContent.trim(), pu = '', w = D.createTreeWalker(n, 4), x;
            while ((x = w.nextNode())) if (!x.parentNode.closest('math')) pu += x.nodeValue;
            pu = pu.replace(/[^.,;:!?)\]"'”’]/g, '');
            out.push({ k: 'a', el: n, t: tx != null ? tex(tx) : mt.length < 8 ? mt : 'formula', pu: pu }); kids = false;
          }
        } else if (n.tagName === 'MATH' || n.tagName === 'math') {
          out.push({ k: 'a', el: n, t: n.getAttribute('alttext') || n.getAttribute('aria-label') || 'formula' }); kids = false;
        } else if (skip(n, fast)) { if (n.querySelector(stopSel)) break; kids = false; }
        else if (/^(grc|el|la)\b/i.test(n.getAttribute('lang') || '')) {
          out.push({ k: 'a', el: n, t: n.textContent, lang: /^la/i.test(n.getAttribute('lang')) ? 'la' : 'el' }); kids = false;
        } else if (BLOCK.test(n.tagName)) br();
      }
      first = false;
      n = nextNode(n, kids, root, ex);
    }
    return out;
  }
  // how much there is to read, and how much of it is link text (a list of links gets no button)
  function textLen(sec) {
    var n = 0, a = 0;
    collect(sec, true).forEach(function (p) { if (p.k === 'b') return; var l = p.t.trim().length; n += l; if (p.node && p.node.parentNode.closest('a')) a += l; });
    return a > n * 0.6 ? 0 : n;
  }
  function abbr(w) { return /^(e\.g|i\.e|c|ca|cf|vs|Mr|Mrs|Ms|Dr|St|Jr|Sr|Mt|Vol|Fig|fig|pp?|ch|approx|no|No|[A-Z]|[A-Z]\.[A-Z])$/.test(w); }
  // split the pieces into sentences: {a, b} offsets into the joined string, with its pieces
  function sentences(ps) {
    var S = '', at = [];
    ps.forEach(function (p) { at.push(S.length); S += p.k === 't' ? p.t : p.k === 'a' ? AT + (p.pu || '') : BR; });
    var cuts = [], i;
    for (i = 0; i < S.length; i++) {
      var c = S[i];
      if (c === BR) { cuts.push([i, i + 1]); continue; }
      if (c !== '.' && c !== '!' && c !== '?') continue;
      var j = i + 1; while (j < S.length && /["'”’)\]]/.test(S[j])) j++;
      if (j < S.length && !/\s/.test(S[j]) && S[j] !== BR) continue;
      var k = j; while (k < S.length && /[ \t\n\r]/.test(S[k])) k++;
      if (k < S.length && /[a-z]/.test(S[k])) continue;
      if (c === '.') { var m = /([A-Za-z.]+)$/.exec(S.slice(Math.max(0, i - 10), i)); if (m && abbr(m[1])) continue; }
      cuts.push([j, j]);
    }
    cuts.push([S.length, S.length]);
    var out = [], a = 0;
    cuts.forEach(function (cu) {
      var b = cu[0], x = a, y = b;
      while (x < y && /[\s\u2029]/.test(S[x])) x++;
      while (y > x && /[\s\u2029]/.test(S[y - 1])) y--;
      if (y > x && /[\wÀ-ɏͰ-Ͽἀ-῿\uFFFC]/.test(S.slice(x, y))) out.push(build(ps, at, x, y));
      a = cu[1];
    });
    return out;
  }
  var GR = /[Ͱ-Ͽἀ-῿][Ͱ-Ͽἀ-῿̀-ͯ\s,.;:·'’]*[Ͱ-Ͽἀ-῿]/g;
  function build(ps, at, x, y) {
    var r = { ch: [], s: null, e: null }, txt = '';
    function flush() { if (txt.trim()) r.ch.push({ t: txt }); txt = ''; }
    for (var q = 0; q < ps.length; q++) {
      var p = ps[q], ps0 = at[q], len = p.k === 't' ? p.t.length : 1 + (p.pu || '').length;
      if (ps0 + len <= x || ps0 >= y || p.k === 'b') continue;
      if (p.k === 't') {
        var s0 = Math.max(x - ps0, 0), e0 = Math.min(y - ps0, len);
        if (!r.s) r.s = [p.node, s0]; r.e = [p.node, e0];
        var part = p.t.slice(s0, e0), last = 0, m; GR.lastIndex = 0;
        while ((m = GR.exec(part))) {
          if (!/[\u1f00-\u1fff\u03ac-\u03ce\u0390\u03b0\u0300-\u036f]|[\u03b1-\u03c9]{5}/.test(m[0])) continue;
          txt += part.slice(last, m.index); flush(); r.ch.push({ t: m[0], lang: 'el' }); last = m.index + m[0].length; }
        txt += part.slice(last);
      } else {
        if (!r.s) r.s = [p.el]; r.e = [p.el];
        if (p.lang) { flush(); r.ch.push({ t: p.t, lang: p.lang }); } else txt += ' ' + p.t + (p.pu || '') + ' ';
      }
    }
    flush();
    return r;
  }
  function range(snt) {
    try {
      var rg = D.createRange();
      if (snt.s.length > 1) rg.setStart(snt.s[0], snt.s[1]); else rg.setStartBefore(snt.s[0]);
      if (snt.e.length > 1) rg.setEnd(snt.e[0], snt.e[1]); else rg.setEndAfter(snt.e[0]);
      return rg;
    } catch (e) { return null; }
  }

  /* ---------- voices and setting ---------- */
  var set = { v: '', r: 1 };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv) { set.v = sv.v || ''; if (RATES.indexOf(+sv.r) >= 0) set.r = +sv.r; } } catch (e) { }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(set)); } catch (e) { } }
  function voices() {
    var vs = []; try { vs = SS.getVoices() || []; } catch (e) { }
    return vs.slice().sort(function (a, b) { var x = /^en/i.test(a.lang) ? 0 : 1, y = /^en/i.test(b.lang) ? 0 : 1; return x - y || (a.lang + a.name).localeCompare(b.lang + b.name); });
  }
  function voice() {
    var vs = voices(), nl = (navigator.language || 'en-US').toLowerCase(), i;
    for (i = 0; i < vs.length; i++) if (vs[i].voiceURI === set.v) return vs[i];
    var en = vs.filter(function (v) { return /^en/i.test(v.lang); });
    return en.filter(function (v) { return v.default; })[0] || en.filter(function (v) { return v.lang.toLowerCase().replace('_', '-') === nl; })[0] || en[0] || null;
  }
  function langVoice(l) { return voices().filter(function (v) { return v.lang.toLowerCase().indexOf(l) === 0; })[0] || null; }

  /* ---------- player ---------- */
  var cur = null, gen = 0, duckT = 0, bar = null, HL = W.CSS && CSS.highlights && W.Highlight, hlEl = null;
  var ICON = {
    say: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    prev: '<path d="M6 5v14M19 5l-10 7 10 7z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    next: '<path d="M18 5v14M5 5l10 7-10 7z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>',
    play: '<path d="M7 4.5l13 7.5-13 7.5z" fill="currentColor"/>',
    stop: '<path d="M6 6h12v12H6z" fill="currentColor"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICON[k] + '</svg>'; }
  function duck() { try { W.dispatchEvent(new Event('trb:sound-start')); } catch (e) { } }
  function chunks(snt) {
    var out = [];
    snt.ch.forEach(function (c) {
      var v = null, t = c.t;
      if (c.lang) { v = langVoice(c.lang); if (!v) t = (c.lang === 'la' ? 'Latin ' : 'Greek ') + (/\s/.test(c.t.trim()) ? 'passage' : 'word'); else t = t.trim(); }
      else t = say(t);
      if (!t) return;
      var last = out[out.length - 1];
      if (!v && last && !last.v) { last.t = (last.t + ' ' + t).replace(/\s+([,.;:!?])/g, '$1'); return; }
      out.push({ t: t, v: v });
    });
    var res = []; // keep each utterance short (Chrome stops long ones)
    out.forEach(function (c) {
      var t = c.t;
      while (t.length > 220) { var cut = Math.max(t.lastIndexOf(', ', 200), t.lastIndexOf('; ', 200)); if (cut < 60) cut = t.lastIndexOf(' ', 200); if (cut < 60) cut = 200; res.push({ t: t.slice(0, cut + 1), v: c.v }); t = t.slice(cut + 1); }
      res.push({ t: t, v: c.v });
    });
    return res;
  }
  function hl(snt) {
    unhl();
    var rg = range(snt); if (!rg) return;
    if (HL) { try { CSS.highlights.set('trb-say', new Highlight(rg)); } catch (e) { } }
    else { var b = snt.s[0]; b = b.nodeType === 3 ? b.parentNode : b; while (b && b.parentNode && !BLOCK.test(b.tagName)) b = b.parentNode; if (b) { hlEl = b; b.classList.add('trb-say-hl'); } }
    var r = rg.getBoundingClientRect(), bh = bar ? bar.offsetHeight + 16 : 80;
    if (r.height && (r.top < 60 || r.bottom > innerHeight - bh)) {
      var red = W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      W.scrollBy({ top: r.top - innerHeight / 3, behavior: red ? 'auto' : 'smooth' });
    }
  }
  function unhl() { if (HL) { try { CSS.highlights.delete('trb-say'); } catch (e) { } } if (hlEl) { hlEl.classList.remove('trb-say-hl'); hlEl = null; } }
  function speak(t, v, done, g) {
    var u = new SpeechSynthesisUtterance(t), dv = v || voice();
    if (dv) { u.voice = dv; u.lang = dv.lang; } else u.lang = 'en-US';
    u.rate = set.r;
    u.onstart = duck;
    u.onend = function () { if (g === gen) done(); };
    u.onerror = function (e) { if (g === gen && e.error !== 'interrupted' && e.error !== 'canceled') done(); };
    SS.speak(u);
  }
  function play(i) {
    if (!cur) return;
    var g = ++gen; SS.cancel();
    if (i < 0) i = 0;
    if (i >= cur.list.length) { stop(); return; }
    cur.i = i; cur.paused = false; ui();
    var snt = cur.list[i], cs = chunks(snt), k = 0;
    hl(snt);
    (function go() {
      if (g !== gen) return;
      if (k >= cs.length) { play(cur.i + 1); return; }
      var c = cs[k++]; speak(c.t, c.v, go, g);
    })();
  }
  function start(sec, btn) {
    if (cur && cur.btn === btn) { stop(); return; }
    stop(true);
    var list = sentences(collect(sec));
    if (!list.length) return;
    cur = { list: list, i: 0, btn: btn, title: sec.title };
    btn.setAttribute('aria-pressed', 'true');
    openBar();
    clearInterval(duckT); duckT = setInterval(function () { if (cur && !cur.paused) duck(); }, 3000);
    play(0);
  }
  function pause() { if (!cur) return; if (cur.paused) { play(cur.i); return; } gen++; SS.cancel(); cur.paused = true; ui(); }
  function stop(keepBar) {
    gen++; try { SS.cancel(); } catch (e) { }
    clearInterval(duckT); unhl();
    if (cur) cur.btn.setAttribute('aria-pressed', 'false');
    cur = null;
    if (bar && !keepBar) { bar.hidden = true; D.documentElement.classList.remove('trb-say-on'); }
  }
  function openBar() {
    if (!bar) {
      bar = D.createElement('div'); bar.className = 'trb-say-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Read aloud');
      bar.innerHTML = '<button type="button" data-a="prev" aria-label="Previous sentence">' + svg('prev') + '</button>' +
        '<button type="button" data-a="play" class="trb-say-pp"></button>' +
        '<button type="button" data-a="next" aria-label="Next sentence">' + svg('next') + '</button>' +
        '<button type="button" data-a="rate" class="trb-say-rt"></button>' +
        '<span class="trb-say-t"></span>' +
        '<button type="button" data-a="stop" aria-label="Stop reading">' + svg('stop') + '</button>';
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !cur) return; var a = b.getAttribute('data-a');
        if (a === 'prev') play(cur.i - 1); else if (a === 'next') play(cur.i + 1); else if (a === 'play') pause();
        else if (a === 'stop') { var f = cur.btn; stop(); f.focus(); }
        else if (a === 'rate') { set.r = RATES[(RATES.indexOf(set.r) + 1) % RATES.length]; save(); syncSet(); if (!cur.paused) play(cur.i); else ui(); }
      });
      D.body.appendChild(bar);
    }
    bar.hidden = false; D.documentElement.classList.add('trb-say-on');
  }
  function ui() {
    if (!bar || !cur) return;
    var pp = bar.querySelector('.trb-say-pp');
    pp.innerHTML = svg(cur.paused ? 'play' : 'pause'); pp.setAttribute('aria-label', cur.paused ? 'Resume' : 'Pause');
    var rt = bar.querySelector('.trb-say-rt'); rt.textContent = set.r + '×'; rt.setAttribute('aria-label', 'Reading speed ' + set.r + '×, change');
    bar.querySelector('.trb-say-t').textContent = (cur.paused ? 'Paused: ' : 'Reading: ') + cur.title;
  }

  /* ---------- the buttons ---------- */
  var done = new WeakSet();
  function title(h) { var t = h.textContent; if (EMO) t = t.replace(EMO, ''); return t.replace(/\s+/g, ' ').trim(); }
  function addBtn(h, sec) {
    if (done.has(h)) return; done.add(h);
    var b = D.createElement('button'); b.type = 'button'; b.className = 'trb-say-b'; b.setAttribute('aria-label', 'Read this section aloud');
    b.setAttribute('aria-pressed', 'false'); b.title = 'Read this section aloud'; b.innerHTML = svg('say');
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); start(sec, b); });
    h.appendChild(b);
  }
  function scan() {
    var roots = [].slice.call(D.querySelectorAll(ROOTS)).filter(function (r, i, a) { return !r.closest('header.header,footer') && !a.some(function (o) { return o !== r && o.contains(r); }); });
    var todo = [];
    roots.forEach(function (root) {
      var hs = [].slice.call(root.querySelectorAll('h2,h3')).filter(function (h) {
        if (h.closest('a,summary,button,nav') || /^(sources|credits|references|bibliography)$/i.test(h.textContent.trim())) return false;
        for (var p = h; p && p !== root; p = p.parentElement) if (!p.hasAttribute('hidden') && skip(p, true)) return false;
        return true;
      });
      var hasH2 = hs.some(function (h) { return h.tagName === 'H2'; }), lastH2 = null;
      hs.forEach(function (h) {
        var sec = { root: root, from: h, level: lvl(h), title: title(h) }, n = textLen(sec);
        var ok = n - sec.title.length >= 60;
        if (h.tagName === 'H2') lastH2 = ok ? n : null; // h3s get their own buttons when their h2 has none, or a long one
        else if (lastH2 != null && lastH2 < 2500) return;
        if (ok) todo.push([h, sec]);
      });
      // the text before the first heading: a button on the page's title (it reads the title, then that text)
      var h1 = D.querySelector('main h1');
      if (h1 && !introDone) {
        var sec = { root: root, from: root.contains(h1) ? h1 : root, level: 6, title: title(h1), h1: h1 };
        if (textLen(sec) - (sec.from === h1 ? sec.title.length : 0) >= 120) { introDone = true; todo.push([h1, sec]); }
      }
    });
    todo.forEach(function (x) { addBtn(x[0], x[1]); });
  }
  var introDone = false;

  /* ---------- the setting, in the "Aa" panel ---------- */
  var setBox = null;
  function syncSet() {
    if (!setBox) return;
    var sel = setBox.querySelector('.trb-say-v'), vs = voices(), cv = voice(), html = '', en = true;
    vs.forEach(function (v, i) {
      if (en && !/^en/i.test(v.lang)) { en = false; if (i) html += '<option disabled>──────</option>'; }
      html += '<option value="' + i + '"' + (cv && v.voiceURI === cv.voiceURI ? ' selected' : '') + '>' + v.name.replace(/[<&]/g, '') + ' (' + v.lang + ')</option>';
    });
    sel.innerHTML = html || '<option>Your device default</option>'; sel._vs = vs;
    setBox.querySelector('.trb-say-r').value = String(set.r);
  }
  function settings() {
    var pop = D.querySelector('.trb-fs-pop'); if (!pop || setBox) return;
    setBox = D.createElement('div'); setBox.className = 'trb-say-set'; setBox.setAttribute('role', 'group'); setBox.setAttribute('aria-label', 'Read aloud');
    setBox.innerHTML = '<b>Read aloud</b><label>Voice <select class="trb-say-v"></select></label>' +
      '<label>Speed <select class="trb-say-r">' + RATES.map(function (r) { return '<option value="' + r + '">' + r + '×</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="trb-say-test">Test</button><small>Voices come from your device, so they differ between phones and computers.</small>';
    pop.appendChild(setBox);
    setBox.querySelector('.trb-say-v').addEventListener('change', function () { var v = this._vs && this._vs[+this.value]; if (v) { set.v = v.voiceURI; save(); } });
    setBox.querySelector('.trb-say-r').addEventListener('change', function () { set.r = +this.value; save(); if (cur) ui(); });
    setBox.querySelector('.trb-say-test').addEventListener('click', function () { stop(); var g = ++gen; SS.cancel(); speak('This is the voice that will read each section aloud.', null, function () { }, g); });
    syncSet();
  }
  if (SS.addEventListener) SS.addEventListener('voiceschanged', syncSet); else SS.onvoiceschanged = syncSet;

  D.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !cur) return;
    var s = D.querySelector('.trb-search'); if (s && !s.hidden) return;
    stop();
  });
  W.addEventListener('pagehide', function () { stop(); });
  try { SS.cancel(); } catch (e) { }
  scan(); settings();
  if (D.readyState !== 'complete') W.addEventListener('load', scan);
  W.TRBSay = { tex: tex, say: say, stop: stop, scan: scan };
})(window, document);
