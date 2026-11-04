/* The Rhythm of Numbers (/connections/rhythm-of-numbers/): the shared core. Layout: layouts/connections/rhythm.html,
   styles: rn.css (prefix rn-). Every other file here is one chapter's instruments, loaded only when its first section
   comes near the screen:
     ch1.js hero, formula, levels, composer, ladder   ch2.js fifths, euclid, locking, primemusic
     ch3.js orchard, corr, hydrogen, sunflower, wrapv  ch4.js quasi, zeros   ch5.js cfrac, mersenne, reverse, hunt
     play.js poly, drums, compose (with the MIDI and WAV writers)   map.js the epilogue map
     Chapter VII has its own page (/connections/rhythm-of-numbers/fractals/, layouts/connections/rhythm-fractals.html):
     fr1.js frHero, patterns, ford   fr2.js sb, mink, stair   fr3.js dust, bulbs, fibword, gauss
   A section is <section class="rn-s" id="<id>" data-mod="<file>">. Its file calls RN.def('<id>', { init(el), redraw(),
   number(), show(visible) }). init runs once, when the section is near the screen; redraw on resize and theme change;
   number when the shared number changes; show when it scrolls in or out (players stop drawing off-screen).
   Shared pieces:
     RN.W            the shared number: terms, Q (block lengths), P, word (Uint8Array of beats), alpha, levels, …
     RN.setNum(key|{terms,name,alpha}), RN.onNumber(fn), RN.CONST (the named numbers)
     RN.ac()         the AudioContext, created only inside a tap or click. RN.out is the master gain.
     RN.voice(name, when, freq, dur, vel, ctx?, dest?)  the five voices; RN.note(when, midi, dur, vel) uses the chosen
                     voice and key; RN.drum(kind, when, vel); RN.snd = { key, scale, voice, tempo, swing, vol, mute }
     RN.degree(d, base)  scale degree d (0 = the key's root) -> MIDI note, in the chosen scale
     RN.player({...})    a step sequencer with Step, Slow and Loop controls (see below)
     RN.setup(canvas, h), RN.setupSq(canvas, max), RN.c(name) theme color, RN.dark()
     RN.gcd, RN.isP, RN.isPrimeBig, RN.factor, RN.fmtF, RN.sieve(N)
   Sound never starts by itself: every sound comes from a press of a button. */
(function (W, D) {
  'use strict';
  var RN = W.RN = W.RN || {};
  var $ = RN.$ = function (id) { return D.getElementById(id); };
  var ROOT = D.querySelector('.rn');
  if (!ROOT) return;
  RN.root = ROOT;
  RN.reduced = (function () { try { return W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  RN.dark = function () { var t = D.documentElement.getAttribute('data-theme'); if (t === 'dark') return true; if (t === 'light') return false; try { return W.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } };
  var cssCache = null;
  RN.c = function (n) { if (!cssCache) cssCache = getComputedStyle(ROOT); return cssCache.getPropertyValue(n).trim() || '#888'; };
  RN.font = function (px, mono) { return px + 'px ' + (mono ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' : 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'); };
  RN.setup = function (c, hOverride) {
    var d = W.devicePixelRatio || 1, w = c.clientWidth || 300;
    if (!c.dataset.h) c.dataset.h = c.getAttribute('height');
    var H = hOverride != null ? hOverride : +c.dataset.h;
    c.style.height = H + 'px'; c.width = Math.round(w * d); c.height = Math.round(H * d);
    var x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); return [x, w, H];
  };
  RN.setupSq = function (c, max) { var w = Math.min(c.clientWidth || 300, max || 9999); var r = RN.setup(c, w); return [r[0], r[1], w]; };

  /* ---------- number theory ---------- */
  RN.gcd = function (a, b) { while (b) { var t = a % b; a = b; b = t; } return a; };
  function modpow(b, e, m) { var r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
  var SMALLP = []; for (var i = 2; SMALLP.length < 300; i++) { if (SMALLP.every(function (p) { return i % p; })) SMALLP.push(i); }
  var SMALLB = SMALLP.map(BigInt); RN.SMALLB = SMALLB;
  RN.isPrimeBig = function (n) {
    if (n < 2n) return false;
    for (var k = 0; k < SMALLB.length; k++) { var p = SMALLB[k]; if (n === p) return true; if (n % p === 0n) return false; }
    var d = n - 1n, s = 0; while (!(d & 1n)) { d >>= 1n; s++; }
    var bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n];
    for (var j = 0; j < bases.length; j++) {
      var x = modpow(bases[j], d, n); if (x === 1n || x === n - 1n) continue;
      var ok = false; for (var r = 1; r < s; r++) { x = x * x % n; if (x === n - 1n) { ok = true; break; } }
      if (!ok) return false;
    }
    return true;
  };
  var SIEVE = null, SIEVE_N = 0;
  RN.sieve = function (N) {
    if (SIEVE && SIEVE_N >= N) return SIEVE;
    var s = new Uint8Array(N + 1); s[0] = s[1] = 1;
    for (var i = 2; i * i <= N; i++) if (!s[i]) for (var j = i * i; j <= N; j += i) s[j] = 1;
    SIEVE = s; SIEVE_N = N; return s;
  };
  RN.isP = function (n) { if (n < 2) return false; if (!SIEVE) RN.sieve(2000000); if (n <= SIEVE_N) return !SIEVE[n]; return RN.isPrimeBig(BigInt(n)); };
  RN.factor = function (n) { var f = []; for (var p = 2; p * p <= n; p++) { while (n % p === 0) { f.push(p); n /= p; } } if (n > 1) f.push(n); return f; };
  RN.fmtF = function (n) { var f = RN.factor(n); return f.length === 1 ? '<span class="rn-p">' + n + ' prime</span>' : f.join(' × '); };
  RN.cfOfFrac = function (p, q, max) { /* BigInt p/q -> continued-fraction terms */ var t = []; max = max || 60; while (q !== 0n && t.length < max) { var a = p / q; t.push(a); var r = p - a * q; p = q; q = r; } return t; };
  RN.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- the shared number ---------- */
  /* Terms are the continued fraction of the number's fractional part, a = [0; a1, a2, …]; int is the whole-number part
     the bar shows it with. Computed with mpmath to 600 digits (see /tmp/work_rhythm/CHECKS.md). */
  var CONST = RN.CONST = {
    pi: { name: 'π − 3', full: 'π', int: 3, v: Math.PI - 3, t: [7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2, 2, 2, 1, 84, 2, 1, 1, 15, 3, 13, 1, 4, 2, 6, 6, 99, 1, 2, 2, 6, 3, 5] },
    phi: { name: 'φ − 1', full: 'φ, the golden ratio', int: 1, v: (Math.sqrt(5) - 1) / 2, t: Array(39).fill(1) },
    sqrt2: { name: '√2 − 1', full: '√2', int: 1, v: Math.SQRT2 - 1, t: Array(39).fill(2) },
    sqrt3: { name: '√3 − 1', full: '√3', int: 1, v: Math.sqrt(3) - 1, t: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2] },
    sqrt5: { name: '√5 − 2', full: '√5', int: 2, v: Math.sqrt(5) - 2, t: Array(30).fill(4) },
    e: { name: 'e − 2', full: 'e', int: 2, v: Math.E - 2, t: [1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, 1, 1, 10, 1, 1, 12, 1, 1, 14, 1, 1, 16, 1, 1, 18, 1, 1, 20, 1] },
    ln2: { name: 'ln 2', full: 'ln 2', int: 0, v: Math.LN2, t: [1, 2, 3, 1, 6, 3, 1, 1, 2, 1, 1, 1, 1, 3, 10, 1, 1, 1, 2, 1, 1, 1, 1, 3, 2, 3, 1, 13, 7, 4] },
    pi4: { name: 'π/4', full: 'π/4', int: 0, v: Math.PI / 4, t: [1, 3, 1, 1, 1, 15, 2, 72, 1, 9, 1, 17, 1, 2, 1, 5, 1, 1, 10, 1, 2, 2, 20, 1, 5, 1, 1, 1, 3, 3] },
    epi: { name: 'e/π', full: 'e/π', int: 0, v: Math.E / Math.PI, t: [1, 6, 2, 2, 1, 2, 6, 8, 2, 1, 1, 1, 4, 3, 1, 1, 66, 2, 1, 1, 2, 4, 2, 7, 46, 10, 2, 1, 18, 1] },
    gamma: { name: 'γ (Euler’s constant)', full: 'γ', int: 0, v: 0.5772156649015329, t: [1, 1, 2, 1, 2, 1, 4, 3, 13, 5, 1, 1, 8, 1, 2, 4, 1, 1, 40, 1, 11, 3, 7, 1, 7, 1, 1, 5, 1, 49] },
    cbrt2: { name: '∛2 − 1', full: '∛2', int: 1, v: Math.cbrt(2) - 1, t: [3, 1, 5, 1, 1, 4, 1, 1, 8, 1, 14, 1, 10, 2, 1, 4, 12, 2, 3, 2, 1, 3, 4, 1, 1, 2, 14, 3, 12, 1] },
    fifth: { name: 'log₂(3/2), the fifth', full: 'log₂(3/2)', int: 0, v: Math.log2(1.5), t: [1, 1, 2, 2, 3, 1, 5, 2, 23, 2, 2, 1, 1, 55, 1, 4, 3, 1, 1, 15, 1, 9, 2, 5, 7, 1, 1, 4, 8, 1] },
    third: { name: 'log₂(5/4), the major third', full: 'log₂(5/4)', int: 0, v: Math.log2(1.25), t: [3, 9, 2, 2, 4, 6, 2, 1, 1, 3, 1, 18, 1, 6, 1, 2, 1, 1, 4, 1, 42, 6, 1, 4, 2, 3, 1, 2, 6, 1] },
    leapday: { name: 'leap days per year, 0.24219', full: '365.24219 days', int: 365, v: 0.24219, t: [4, 7, 1, 3, 24, 6, 2] },
    leapmonth: { name: 'leap months per year, 0.36827', full: '12.36827 months', int: 12, v: 0.36827, t: [2, 1, 2, 1, 1, 17, 1, 3, 6, 4] }
  };
  var MAXLEN = RN.MAXLEN = 140000;
  RN.W = {};
  function cfValue(terms) { var v = 0; for (var i = terms.length - 1; i >= 0; i--) v = 1 / (terms[i] + v); return v; }
  RN.cfValue = cfValue;
  /* The rhythm of [0; a1, a2, …]: level 1 is (a1 − 1) rests then a hit; each next block is (term × this block) + the
     previous block. The result is the characteristic word of the number: beat n (counting from 1) is a hit when
     ⌊(n+1)α⌋ > ⌊nα⌋. Also marks where each level's blocks start (for the Composer's voices and the ribbon). */
  function build(terms) {
    terms = terms.filter(function (t) { return isFinite(t) && t >= 1; }).map(function (t) { return Math.min(MAXLEN, Math.floor(t)); });
    if (!terms.length) terms = [7];
    var Q = [1, 1], P = [1, 0], words = [new Uint8Array([1]), new Uint8Array([0])], n = 1;
    for (; n <= terms.length; n++) {
      var a = terms[n - 1], reps = n === 1 ? a - 1 : a, A = words[n], B = words[n - 1];
      var L = A.length * reps + B.length, capL = Math.min(L, MAXLEN * 2), w = new Uint8Array(capL), o = 0;
      for (var r = 0; r < reps && o < capL; r++) { var take = Math.min(A.length, capL - o); w.set(A.subarray(0, take), o); o += take; }
      if (o < capL) w.set(B.subarray(0, Math.min(B.length, capL - o)), o);
      words.push(w); Q.push(reps * Q[n] + Q[n - 1]); P.push(reps * P[n] + P[n - 1]);
      if (Q[n + 1] >= MAXLEN) { n++; break; }
    }
    var top = words.length - 1, word = words[top];
    if (word.length < MAXLEN) { var w2 = new Uint8Array(MAXLEN); for (var k = 0; k < MAXLEN; k++) w2[k] = word[k % word.length]; word = w2; } else word = word.subarray(0, MAXLEN);
    var X = { terms: terms.slice(0, top - 1), allTerms: terms, Q: Q, P: P, word: word, levels: top - 1, topLevel: top - 1, alpha: cfValue(terms) };
    X.q = function (lv) { return Q[lv + 1]; };
    var R = Math.min(X.levels, 9), mark = new Int8Array(MAXLEN), typ = new Int8Array(MAXLEN), rowType = [null];
    function children(lv) { var a = X.terms[lv - 1], reps = lv === 1 ? a - 1 : a, out = []; for (var r = 0; r < reps; r++) out.push(lv - 1); out.push(lv - 2); return out; }
    for (var row = 1; row <= R; row++) {
      var rt = new Int8Array(MAXLEN); rowType.push(rt);
      (function expand(lv, s) {
        if (s >= MAXLEN) return;
        if (lv <= row) { rt[s] = lv === row ? 1 : 2; if (mark[s] < row) { mark[s] = row; typ[s] = rt[s]; } return; }
        var pos = s, ch = children(lv);
        for (var c = 0; c < ch.length; c++) { expand(ch[c], pos); pos += X.q(ch[c]); if (pos >= MAXLEN) break; }
      })(X.topLevel, 0);
    }
    X.mark = mark; X.typ = typ; X.rowType = rowType; X.R = R;
    return X;
  }
  RN.build = build;
  var numberListeners = [];
  RN.onNumber = function (fn) { numberListeners.push(fn); };
  RN.numKey = 'pi';
  /* spec: a key of CONST, or { terms, name, alpha, int, rational } */
  RN.setNum = function (spec, quiet) {
    var s = typeof spec === 'string' ? CONST[spec] : spec, key = typeof spec === 'string' ? spec : 'custom';
    if (!s) return;
    var X = build(s.t || s.terms);
    X.key = key; X.name = s.name; X.full = s.full || s.name; X.int = s.int || 0; X.rational = !!s.rational;
    if (s.v != null && !s.rational) X.alpha = s.v;
    if (s.exact) X.exact = s.exact;
    RN.W = X; RN.numKey = key;
    var sel = $('gNum'); if (sel && key !== 'custom' && sel.value !== key) sel.value = key;
    showNum();
    if (!quiet) numberListeners.forEach(function (f) { try { f(); } catch (e) { if (W.console) console.error(e); } });
  };
  function showNum() {
    var X = RN.W, el = $('gNumV'); if (!el) return;
    var t = X.allTerms;
    el.textContent = X.name + ' = ' + (X.exact || X.alpha.toPrecision(9)) + ' · [0; ' + t.slice(0, 7).join(', ') + (t.length > 7 ? ', …' : '') + ']';
  }
  /* "type a decimal" and "type a fraction": exact continued fractions with BigInt (a typed decimal is a fraction too) */
  RN.parseNum = function (str, mode) {
    str = String(str || '').trim();
    var p, q, m;
    if (mode === 'terms') {
      var t = str.split(/[^0-9]+/).filter(Boolean).map(Number).filter(function (v) { return v >= 1; });
      if (!t.length) return { err: 'Type whole numbers of 1 or more, with commas between them, like 7, 15, 1, 292.' };
      if (t.length > 60) t = t.slice(0, 60);
      return { terms: t, name: 'the terms [0; ' + t.slice(0, 6).join(', ') + (t.length > 6 ? ', …' : '') + ']', rational: true, v: cfValue(t) };
    }
    str = str.replace(/[\s,_]/g, '');
    if (mode === 'frac') {
      m = /^(-?\d+)\/(\d+)$/.exec(str);
      if (!m) return { err: 'Type a fraction like 22/7 or 3/8.' };
      p = BigInt(m[1]); q = BigInt(m[2]); if (q === 0n) return { err: 'The bottom of a fraction can’t be 0.' };
    } else {
      m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(str);
      if (!m || (m[2] === '' && !m[3])) return { err: 'Type a decimal like 0.14159 or 2.71828.' };
      var d = m[3] || ''; if (d.length > 40) d = d.slice(0, 40);
      p = BigInt((m[1] || '') + (m[2] || '0') + d); q = 10n ** BigInt(d.length);
    }
    if (p < 0n) p = -p;
    var g = (function (a, b) { while (b) { var t2 = a % b; a = b; b = t2; } return a; })(p, q); p /= g; q /= g;
    var ip = p / q, fr = p - ip * q;
    if (fr === 0n) return { err: 'That is a whole number, so it has no rhythm: every beat would be the same. Try one with a fractional part.' };
    var terms = RN.cfOfFrac(q, fr, 60).map(Number);
    var label = mode === 'frac' ? p + '/' + q : str.replace(/^-/, '');
    return { terms: terms, name: (ip > 0n ? label + ' − ' + ip : label), int: Number(ip), rational: true, v: Number(fr) / Number(q), exact: (Number(fr) / Number(q)).toPrecision(9) + (ip > 0n ? '' : ''), frac: [fr, q] };
  };

  /* ---------- sound ---------- */
  var snd = RN.snd = { key: 0, scale: 'major', voice: 'mallet', tempo: 1, swing: 0, vol: 0.7, mute: false };
  try { var saved = JSON.parse(localStorage.getItem('rn-snd') || 'null'); if (saved) for (var sk in saved) if (sk in snd) snd[sk] = saved[sk]; } catch (e) { }
  RN.SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], penta: [0, 2, 4, 7, 9], whole: [0, 2, 4, 6, 8, 10], chrom: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] };
  RN.KEYS = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  RN.mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  RN.keyOff = function () { return snd.key > 6 ? snd.key - 12 : snd.key; };
  RN.degree = function (d, base) { var s = RN.SCALES[snd.scale] || RN.SCALES.major, n = s.length, o = Math.floor(d / n), r = ((d % n) + n) % n; return (base == null ? 60 : base) + RN.keyOff() + 12 * o + s[r]; };
  var AC = null, OUT = null;
  RN.ac = function () {
    if (!AC) {
      var C = W.AudioContext || W.webkitAudioContext; if (!C) return null;
      AC = new C(); OUT = chain(AC); RN.out = OUT;
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  };
  // the page's instruments tell the background music player (static/music/suite/player/player.js) to duck, at most twice a second
  var ssT = 0;
  RN.soundStart = function () { var n = Date.now(); if (n - ssT < 500) return; ssT = n; try { W.dispatchEvent(new Event('trb:sound-start')); } catch (e) { } };
  function chain(ctx) {
    var g = ctx.createGain(), comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    g.gain.value = snd.mute ? 0 : snd.vol; g.connect(comp); comp.connect(ctx.destination); g._comp = comp; return g;
  }
  RN.chain = chain;
  function applyVol() { if (OUT && AC) OUT.gain.setTargetAtTime(snd.mute ? 0 : snd.vol, AC.currentTime, 0.02); }
  var NOISE = new WeakMap();
  function noiseBuf(ctx) { var b = NOISE.get(ctx); if (b) return b; var len = Math.floor(ctx.sampleRate * 1); b = ctx.createBuffer(1, len, ctx.sampleRate); var d = b.getChannelData(0), s = 22222; for (var i = 0; i < len; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = s / 0x3fffffff - 1; } NOISE.set(ctx, b); return b; }
  var WAVES = new WeakMap();
  function organWave(ctx) { var w = WAVES.get(ctx); if (w) return w; var re = new Float32Array([0, 1, 0.6, 0.35, 0.2, 0.1, 0.06]), im = new Float32Array(re.length); w = ctx.createPeriodicWave(re, im); WAVES.set(ctx, w); return w; }
  function env(ctx, g, t, a, peak, dur, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.01, dur + (rel || 0))); }
  /* noise burst through a filter */
  function noise(ctx, dest, t, dur, g, type, f, q) { var s = ctx.createBufferSource(); s.buffer = noiseBuf(ctx); var fl = ctx.createBiquadFilter(); fl.type = type || 'highpass'; fl.frequency.value = f || 3000; if (q) fl.Q.value = q; var v = ctx.createGain(); env(ctx, v, t, 0.002, g, dur); s.connect(fl); fl.connect(v); v.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); }
  RN.noise = function (t, dur, g, hp, ctx, dest) { ctx = ctx || RN.ac(); if (!ctx) return; noise(ctx, dest || OUT, t, dur, g, 'highpass', hp || 3000); };
  RN.drum = function (kind, t, vel, ctx, dest) {
    ctx = ctx || RN.ac(); if (!ctx) return; if (ctx === AC) RN.soundStart(); dest = dest || OUT; vel = vel == null ? 1 : vel;
    var o, g;
    if (kind === 'kick') { o = ctx.createOscillator(); g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); env(ctx, g, t, 0.002, 0.9 * vel, 0.32); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.4); }
    else if (kind === 'snare') { noise(ctx, dest, t, 0.16, 0.45 * vel, 'bandpass', 1800, 0.7); o = ctx.createOscillator(); g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.08); env(ctx, g, t, 0.002, 0.3 * vel, 0.1); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.15); }
    else if (kind === 'hat') { noise(ctx, dest, t, 0.05, 0.22 * vel, 'highpass', 7000); }
    else if (kind === 'clap') { for (var i = 0; i < 3; i++) noise(ctx, dest, t + i * 0.011, 0.06, 0.3 * vel, 'bandpass', 1500, 1.2); }
    else { /* bell / cowbell */ [540, 800].forEach(function (f, j) { var oo = ctx.createOscillator(), gg = ctx.createGain(); oo.type = 'square'; oo.frequency.value = f; var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; env(ctx, gg, t, 0.002, (j ? 0.09 : 0.13) * vel, 0.25); oo.connect(bp); bp.connect(gg); gg.connect(dest); oo.start(t); oo.stop(t + 0.35); }); }
  };
  RN.VOICES = [['sine', 'Soft sine'], ['mallet', 'Mallet'], ['pluck', 'Pluck'], ['organ', 'Organ'], ['kit', 'Drum kit']];
  RN.voice = function (name, t, f, dur, vel, ctx, dest) {
    ctx = ctx || RN.ac(); if (!ctx) return; if (ctx === AC) RN.soundStart(); dest = dest || OUT; vel = vel == null ? 0.3 : vel; dur = Math.max(0.03, dur || 0.3);
    var o, g;
    if (name === 'kit') { var m = Math.round(12 * Math.log2(f / 440) + 69), pc = ((m % 12) + 12) % 12; RN.drum(m < 50 ? 'kick' : pc < 3 ? 'kick' : pc < 6 ? 'snare' : pc < 9 ? 'hat' : 'bell', t, Math.min(1, vel * 2.6), ctx, dest); return; }
    if (name === 'mallet') {
      [[1, 1, dur], [3.93, 0.25, Math.min(dur, 0.12)], [9.2, 0.06, 0.05]].forEach(function (p) { if (f * p[0] > 15000) return; var oo = ctx.createOscillator(), gg = ctx.createGain(); oo.frequency.value = f * p[0]; env(ctx, gg, t, 0.003, vel * p[1], p[2]); oo.connect(gg); gg.connect(dest); oo.start(t); oo.stop(t + p[2] + 0.1); });
      return;
    }
    if (name === 'pluck') { o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(Math.min(12000, f * 8), t); lp.frequency.exponentialRampToValueAtTime(Math.max(80, f * 1.1), t + Math.min(0.5, dur)); g = ctx.createGain(); env(ctx, g, t, 0.002, vel * 0.7, Math.max(0.15, dur)); o.connect(lp); lp.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.3); return; }
    if (name === 'organ') { o = ctx.createOscillator(); o.setPeriodicWave(organWave(ctx)); o.frequency.value = f; g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel * 0.5, t + 0.02); g.gain.setValueAtTime(vel * 0.5, t + Math.max(0.03, dur - 0.04)); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.06); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.1); return; }
    o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; g = ctx.createGain(); env(ctx, g, t, 0.01, vel, dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.1);
  };
  /* a note in the chosen voice; midi numbers are written in C and moved to the chosen key */
  RN.note = function (t, midi, dur, vel, opts) { RN.voice((opts && opts.voice) || snd.voice, t, RN.mtof(midi + ((opts && opts.nokey) ? 0 : RN.keyOff())), dur, vel); };
  RN.noteF = function (t, f, dur, vel) { RN.voice(snd.voice === 'kit' ? 'mallet' : snd.voice, t, f, dur, vel); };
  /* the quiet tick on a rest, same in every voice */
  RN.tick = function (t, g) { var ctx = RN.ac(); if (!ctx) return; var o = ctx.createOscillator(), v = ctx.createGain(); o.frequency.value = 2093; env(ctx, v, t, 0.002, g || 0.012, 0.015); o.connect(v); v.connect(OUT); o.start(t); o.stop(t + 0.05); };
  var stopFn = null;
  RN.stopAll = function () { var f = stopFn; stopFn = null; if (f) f(); };
  RN.stopper = function (fn) { stopFn = fn; };
  RN.saveSnd = function () { try { localStorage.setItem('rn-snd', JSON.stringify(snd)); } catch (e) { } applyVol(); };

  /* ---------- the step player ----------
     RN.player({ sec, btn, play: '▶ Play', len()->steps, from()->first step, dur(i)->seconds at normal speed,
       step(i, when) plays step i, draw(i) shows the playhead, reset() before a fresh start, loop: true|false, swing: true,
       teach: an element to put the Step / Slow / Loop controls in, onStop() })  ->  { on, start(), stop(), stepOnce(), head } */
  RN.player = function (o) {
    var P = { on: false, head: -1, pos: null }, timer = 0, raf = 0, queue = [], t = 0, slow = false, loop = o.loop !== false;
    var label = o.play || o.btn.textContent;
    function factor() { return (snd.tempo || 1) * (slow ? 0.25 : 1); }
    function sched() {
      var ctx = AC; if (!ctx) return;
      while (t < ctx.currentTime + 0.15) {
        if (P.pos >= o.len()) { if (loop) { P.pos = o.from ? o.from() : 0; if (o.reset) o.reset(); } else { var tt = t; setTimeout(function () { if (P.on) stop(); }, Math.max(0, (tt - ctx.currentTime) * 1000 + 60)); clearInterval(timer); timer = 0; return; } }
        var d = (o.dur ? o.dur(P.pos) : 0.15) / factor();
        var sw = (o.swing !== false && snd.swing && P.pos % 2) ? snd.swing * d * 0.6 : 0;
        try { o.step(P.pos, t + sw); } catch (e) { if (W.console) console.error(e); }
        queue.push([t + sw, P.pos]); t += d; P.pos++;
      }
    }
    function frame() {
      if (!P.on) return;
      var now = AC.currentTime, h = P.head;
      while (queue.length && queue[0][0] <= now) h = queue.shift()[1];
      if (h !== P.head) { P.head = h; if (o.draw && (!o.sec || o.sec._rnVis !== false)) o.draw(h); }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      RN.stopAll(); var ctx = RN.ac(); if (!ctx) return;
      if (o.reset) o.reset();
      if (P.pos == null || !o.resume) P.pos = o.from ? o.from() : 0;
      P.on = true; queue = []; t = ctx.currentTime + 0.08; o.btn.textContent = '■ Stop'; o.btn.setAttribute('aria-pressed', 'true');
      sched(); timer = setInterval(sched, 30); raf = requestAnimationFrame(frame);
      RN.stopper(stop);
    }
    function stop() {
      if (!P.on) return; P.on = false; clearInterval(timer); timer = 0; cancelAnimationFrame(raf);
      o.btn.textContent = label; o.btn.setAttribute('aria-pressed', 'false');
      if (stopFn === stop) stopFn = null;
      if (o.onStop) o.onStop(); P.pos = null; P.head = -1; if (o.draw) o.draw(-1);
    }
    function stepOnce() {
      if (P.on) stop();
      var ctx = RN.ac(); if (!ctx) return;
      if (P.stepPos == null || P.stepPos >= o.len()) { P.stepPos = o.from ? o.from() : 0; if (o.reset) o.reset(); }
      o.step(P.stepPos, ctx.currentTime + 0.02); P.head = P.stepPos; if (o.draw) o.draw(P.stepPos); P.stepPos++;
    }
    P.start = start; P.stop = stop; P.stepOnce = stepOnce; P.resetStep = function () { P.stepPos = null; };
    o.btn.setAttribute('aria-pressed', 'false');
    o.btn.addEventListener('click', function () { if (P.on) stop(); else { P.stepPos = null; start(); } });
    if (o.teach) {
      var row = D.createElement('div'); row.className = 'rn-teach'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Teaching controls');
      var sb = D.createElement('button'); sb.type = 'button'; sb.className = 'rn-ghost'; sb.textContent = 'Step ›'; sb.title = 'Play one step at a time';
      sb.addEventListener('click', stepOnce);
      var sl = D.createElement('label'); sl.innerHTML = '<input type="checkbox"> Slow (¼ speed)';
      sl.firstChild.addEventListener('change', function () { slow = this.checked; });
      var lp = D.createElement('label'); lp.innerHTML = '<input type="checkbox"' + (loop ? ' checked' : '') + '> Loop';
      lp.firstChild.addEventListener('change', function () { loop = this.checked; });
      row.append(sb, sl, lp); o.teach.append(row); P.loopBox = lp.firstChild;
    }
    return P;
  };

  /* ---------- sections: load each chapter's file when its first section is near ---------- */
  var defs = {}, inited = {}, loading = {}, BASE = ROOT.getAttribute('data-rn-base') || '', VER = {};
  try { VER = JSON.parse(ROOT.getAttribute('data-rn-v') || '{}'); } catch (e) { }
  RN.def = function (id, obj) { defs[id] = obj; var el = $(id); if (el && el._rnNear) initSec(el); };
  function loadMod(m) {
    if (loading[m]) return; loading[m] = 1;
    var s = D.createElement('script'); s.src = BASE + m + '.js' + (VER[m] ? '?v=' + VER[m] : ''); s.async = true;
    s.onerror = function () { D.querySelectorAll('.rn-s[data-mod="' + m + '"] .rn-inst').forEach(function (el) { var p = D.createElement('p'); p.className = 'rn-err'; p.textContent = 'This instrument could not load. Check the connection and reload the page.'; el.prepend(p); }); };
    D.head.appendChild(s);
  }
  var texState = 0, texWait = [];
  function tex(el) {
    if (!el.querySelector('.rn-tex')) return;
    if (W.MathLadder && W.MathLadder.typeset) { el.querySelectorAll('.rn-tex').forEach(function (n) { W.MathLadder.typeset(n); }); return; }
    texWait.push(el);
    if (texState) return; texState = 1;
    var css = ROOT.getAttribute('data-rn-texcss'); if (css) { var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = css; D.head.appendChild(l); }
    var s = D.createElement('script'); s.src = ROOT.getAttribute('data-rn-tex'); s.async = true;
    s.onload = function () { texWait.splice(0).forEach(tex); };
    D.head.appendChild(s);
  }
  function initSec(el) {
    if (inited[el.id]) return; var d = defs[el.id]; if (!d) return; inited[el.id] = d;
    try { if (d.init) d.init(el); } catch (e) { if (W.console) console.error(e); }
    if (d.number) RN.onNumber(function () { if (el._rnNear) d.number(); else el._rnStale = 1; });
  }
  RN.inited = inited;
  var near = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      var el = en.target;
      if (en.isIntersecting) {
        el._rnNear = true; tex(el);
        var m = el.getAttribute('data-mod'); if (m) { if (defs[el.id]) initSec(el); else loadMod(m); }
        if (el._rnStale && inited[el.id]) { el._rnStale = 0; var dd = inited[el.id]; try { if (dd.number) dd.number(); else if (dd.redraw) dd.redraw(); } catch (e) { if (W.console) console.error(e); } }
      } else el._rnNear = false;
    });
  }, { rootMargin: '700px 0px' });
  var vis = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { var el = en.target; el._rnVis = en.isIntersecting; var d = inited[el.id]; if (d && d.show) d.show(en.isIntersecting); });
  }, { rootMargin: '0px' });

  /* ---------- threads (highlight the sections that share an idea) ---------- */
  var THREADS = RN.THREADS = { cf: ['Continued fractions', '--rn-g'], even: ['Even spacing', '--rn-teal'], coprime: ['Coprime', '--rn-violet'], wave: ['Waves', '--rn-rose'], rot: ['Rotation', '--rn-blue'], primes: ['Primes', '--rn-prime'], sq: ['1/n²', '--rn-muted'], self: ['Self-similar', '--rn-gold'] };
  RN.thread = null;
  function applyThread() {
    D.querySelectorAll('#rn-threads button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.t === RN.thread)); });
    D.querySelectorAll('.rn-s[data-tags]').forEach(function (s) { var t = (s.dataset.tags || '').split(' '); s.classList.toggle('rn-dim', !!RN.thread && !t.includes(RN.thread)); });
    var st = $('rn-thread-st'); if (st) st.textContent = RN.thread ? 'Showing the sections on ' + THREADS[RN.thread][0].toLowerCase() + '. The others are faded.' : '';
    if (inited.mapSec && inited.mapSec.redraw) inited.mapSec.redraw();
  }
  RN.setThread = function (k) { RN.thread = RN.thread === k ? null : k; applyThread(); };
  function initThreads() {
    var box = $('rn-threads');
    Object.keys(THREADS).forEach(function (k) {
      var b = D.createElement('button'); b.type = 'button'; b.textContent = THREADS[k][0]; b.dataset.t = k; b.style.setProperty('--tc', 'var(' + THREADS[k][1] + ')');
      b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', function () { RN.setThread(k); }); box.append(b);
    });
    D.querySelectorAll('.rn-s[data-tags]').forEach(function (s) {
      var tg = s.querySelector('.rn-tags'); if (!tg) return;
      (s.dataset.tags || '').split(' ').filter(Boolean).forEach(function (k) { var sp = D.createElement('span'); sp.textContent = THREADS[k][0]; sp.style.setProperty('--tc', 'var(' + THREADS[k][1] + ')'); tg.append(sp); });
    });
  }

  /* ---------- the bar: number, threads, sound ---------- */
  function initBar() {
    var sel = $('gNum'), inp = $('gIn'), ap = $('gApply'), msg = $('gMsg');
    function mode() { var v = sel.value; return v === 'dec' ? 'dec' : v === 'frac' ? 'frac' : v === 'terms' ? 'terms' : null; }
    function apply() {
      var m = mode(); if (!m) return;
      var r = RN.parseNum(inp.value, m);
      if (r.err) { msg.textContent = r.err; inp.setAttribute('aria-invalid', 'true'); return; }
      msg.textContent = ''; inp.removeAttribute('aria-invalid'); RN.setNum(r);
      if (r.rational) msg.textContent = m === 'terms' ? '' : 'A fraction, so its rhythm repeats every ' + RN.W.Q[RN.W.Q.length - 1].toLocaleString() + ' beats.';
    }
    sel.addEventListener('change', function () {
      var m = mode(); inp.hidden = ap.hidden = !m; msg.textContent = '';
      if (m) { inp.placeholder = m === 'dec' ? '0.14159' : m === 'frac' ? '22/7' : '7, 15, 1, 292'; inp.setAttribute('aria-label', m === 'dec' ? 'Your decimal' : m === 'frac' ? 'Your fraction' : 'Your continued-fraction terms'); if (!inp.value) inp.value = m === 'dec' ? '0.14159' : m === 'frac' ? '355/113' : '7, 15, 1, 292'; inp.focus(); apply(); }
      else RN.setNum(sel.value);
    });
    ap.addEventListener('click', apply);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    function pop(btn, id) {
      var p = $(id);
      btn.addEventListener('click', function () { var open = !p.classList.contains('rn-open'); D.querySelectorAll('.rn-pop.rn-open').forEach(function (q) { q.classList.remove('rn-open'); }); D.querySelectorAll('[aria-controls^="rn-"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); p.classList.toggle('rn-open', open); btn.setAttribute('aria-expanded', String(open)); });
    }
    pop($('gThreadsBtn'), 'rn-threads'); pop($('gSoundBtn'), 'rn-sound');
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var o = D.querySelector('.rn-pop.rn-open'); if (o) { o.classList.remove('rn-open'); var b = D.querySelector('[aria-controls="' + o.id + '"]'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); } } } });
    $('gStop').addEventListener('click', RN.stopAll);
    /* sound settings */
    var k = $('sKey'), sc = $('sScale'), vo = $('sVoice'), te = $('sTempo'), sw = $('sSwing'), vl = $('sVol'), mu = $('sMute');
    RN.KEYS.forEach(function (n, i) { var op = D.createElement('option'); op.value = i; op.textContent = n; k.append(op); });
    RN.VOICES.forEach(function (v) { var op = D.createElement('option'); op.value = v[0]; op.textContent = v[1]; vo.append(op); });
    k.value = snd.key; sc.value = snd.scale; vo.value = snd.voice; te.value = Math.round(snd.tempo * 100); sw.value = Math.round(snd.swing * 100); vl.value = Math.round(snd.vol * 100); mu.checked = snd.mute;
    function outs() { $('sTempoV').textContent = '×' + (te.value / 100).toFixed(2); $('sSwingV').textContent = sw.value + '%'; $('sVolV').textContent = vl.value + '%'; }
    outs();
    [k, sc, vo, te, sw, vl, mu].forEach(function (el) { el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', function () {
      snd.key = +k.value; snd.scale = sc.value; snd.voice = vo.value; snd.tempo = te.value / 100; snd.swing = sw.value / 100; snd.vol = vl.value / 100; snd.mute = mu.checked; outs(); RN.saveSnd();
    }); });
    $('sTest').addEventListener('click', function () { var ctx = RN.ac(); if (!ctx) return; var t = ctx.currentTime + 0.05, s = RN.SCALES[snd.scale]; for (var i = 0; i <= s.length; i++) RN.note(t + i * 0.16 / snd.tempo, RN.degree(i) - RN.keyOff(), 0.3, 0.3); });
  }

  /* ---------- "Remix" buttons: set controls to an interesting state with one tap ----------
     data-remix='{"num":"phi", "set":{"id":value,…}, "click":"id", "go":"id"}' */
  function remix(b) {
    var r; try { r = JSON.parse(b.getAttribute('data-remix')); } catch (e) { return; }
    if (r.num) { var s = $('gNum'); s.value = r.num; s.dispatchEvent(new Event('change')); }
    if (r.set) Object.keys(r.set).forEach(function (id) {
      var el = $(id); if (!el) return; var v = r.set[id];
      if (el.type === 'checkbox') el.checked = !!v; else el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (r.click) { var c = $(r.click); if (c) c.click(); }
    var go = $(r.go || ''), sec = b.closest('.rn-s'), tgt = go || (sec && sec.querySelector('.rn-inst'));
    if (tgt) tgt.scrollIntoView({ block: 'nearest', behavior: RN.reduced ? 'auto' : 'smooth' });
    var live = $('rn-live'); if (live) live.textContent = 'Set: ' + b.textContent;
  }

  /* ---------- full screen for an instrument ---------- */
  function initFS() {
    var can = D.fullscreenEnabled || D.webkitFullscreenEnabled;
    D.querySelectorAll('.rn-inst[data-fs]').forEach(function (el) {
      if (!can) return;
      var b = D.createElement('button'); b.type = 'button'; b.className = 'rn-fs rn-ghost'; b.textContent = '⛶ Full screen'; b.setAttribute('aria-label', 'Show this instrument full screen');
      b.addEventListener('click', function () {
        var fe = D.fullscreenElement || D.webkitFullscreenElement;
        if (fe) { (D.exitFullscreen || D.webkitExitFullscreen).call(D); return; }
        var rq = el.requestFullscreen || el.webkitRequestFullscreen; if (rq) rq.call(el);
      });
      el.prepend(b);
    });
    function ch() { var fe = D.fullscreenElement || D.webkitFullscreenElement; D.querySelectorAll('.rn-fs').forEach(function (b) { var on = b.parentNode === fe; b.textContent = on ? '✕ Exit full screen' : '⛶ Full screen'; }); setTimeout(redrawAll, 60); }
    D.addEventListener('fullscreenchange', ch); D.addEventListener('webkitfullscreenchange', ch);
  }

  function redrawAll() { cssCache = null; Object.keys(inited).forEach(function (id) { var d = inited[id], el = $(id); if (d.redraw && el && el._rnNear) { try { d.redraw(); } catch (e) { if (W.console) console.error(e); } } else if (el) el._rnStale = 1; }); }
  RN.redrawAll = redrawAll;

  /* ---------- boot ---------- */
  initThreads(); initBar(); initFS();
  RN.setNum('pi', true);
  D.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-remix]'); if (b) remix(b); });
  D.querySelectorAll('.rn-s').forEach(function (s) { near.observe(s); vis.observe(s); });
  var rt; W.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(redrawAll, 160); });
  try { W.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redrawAll); } catch (e) { }
  new MutationObserver(function () { setTimeout(redrawAll, 30); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
  W.addEventListener('pagehide', function () { RN.stopAll(); });
  D.addEventListener('visibilitychange', function () { if (D.hidden) RN.stopAll(); });
})(window, document);
