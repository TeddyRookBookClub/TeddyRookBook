/* Code practice: converting between binary, octal, decimal and hex, Morse by ear and by sight, ASCII letter codes,
   and arithmetic in binary and hex. Online drills with working shown, and printable worksheets with answer keys.
   Uses the Morse player from morse.js. Best scores stay in this browser only. */
(function (W, D) {
  'use strict';
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var HX = '0123456789ABCDEF', BN = { 2: 'binary', 8: 'octal', 10: 'decimal', 16: 'hex' }, BS = { 2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆' };
  function to(n, b) { return n.toString(b).toUpperCase(); }
  function grp(s, k) { var o = ''; for (var i = s.length; i > 0; i -= k) o = s.slice(Math.max(0, i - k), i) + (o ? ' ' + o : ''); return o; }
  function show(n, b) { var s = to(n, b); return b === 2 ? grp(s.length > 4 ? s.padStart(Math.ceil(s.length / 4) * 4, '0') : s, 4) : b === 16 && s.length > 4 ? grp(s, 4) : s; }
  function clean(s) { return String(s).toUpperCase().replace(/[\s,_]/g, '').replace(/^0X/, '').replace(/^0+(?=.)/, ''); }
  var MORSE = (W.TRBMorse && W.TRBMorse.code) || {};
  var MDEC = {}; Object.keys(MORSE).forEach(function (k) { MDEC[MORSE[k]] = k; });
  function toMorse(w) { return w.toUpperCase().split('').map(function (c) { return c === ' ' ? '/' : (MORSE[c] || '?').replace(/\./g, '·').replace(/-/g, '–'); }).join('   '); }
  function normMorse(s) { return s.trim().replace(/[·•*]/g, '.').replace(/[–—_−]/g, '-').replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' '); }
  var WORDS = { easy: ['SUN', 'CAT', 'DOG', 'HAT', 'MAP', 'SOS', 'TEA', 'EGG', 'OWL', 'BEE', 'FOX', 'ICE', 'KEY', 'MOM', 'DAD', 'RUN', 'YES', 'NO', 'HI', 'GO'],
    med: ['MARS', 'MOON', 'STAR', 'SHIP', 'BOOK', 'CODE', 'HOME', 'FARM', 'BIRD', 'TREE', 'ROSE', 'LAMP', 'BEEP', 'BYTE', 'FISH', 'SNOW', 'WIND', 'GOLD', 'ROME', 'TROY'],
    hard: ['ROCKET', 'PLANET', 'GARDEN', 'SIGNAL', 'BINARY', 'POTATO', 'CASTLE', 'HELMET', 'ORBIT', 'COMET', 'RADIO', 'ATHENS', 'LATIN', 'GREEK', 'HOMER', 'TORCH', 'BRIDGE', 'JUNGLE', 'PUZZLE', 'SECRET'] };
  var LV = { easy: [0, 15], med: [16, 255], hard: [256, 65535] };

  // ---------- problem makers: each returns {q (html), a (answer), check(fn), why (working), sound (text to play)} ----------
  function workTo10(n, b) { var s = to(n, b); return s.split('').map(function (d, i) { return d + '×' + Math.pow(b, s.length - 1 - i); }).join(' + ') + ' = ' + n; }
  function workFrom10(n, b) { if (n === 0) return '0'; var st = [], m = n; while (m > 0) { st.push(m + ' ÷ ' + b + ' = ' + Math.floor(m / b) + ' r ' + HX[m % b]); m = Math.floor(m / b); } return st.join('; ') + ' → read the remainders up: ' + to(n, b); }
  function convWhy(n, a, b) {
    if (a === 2 && b === 16) return grp(to(n, 2).padStart(Math.ceil(to(n, 2).length / 4) * 4, '0'), 4) + ' → each group of four bits is one hex digit → ' + to(n, 16);
    if (a === 16 && b === 2) return to(n, 16).split('').map(function (d) { return d + ' = ' + parseInt(d, 16).toString(2).padStart(4, '0'); }).join(', ') + ' → ' + show(n, 2);
    if (a === 2 && b === 8) return grp(to(n, 2).padStart(Math.ceil(to(n, 2).length / 3) * 3, '0'), 3) + ' → each group of three bits is one octal digit → ' + to(n, 8);
    var w = a === 10 ? '' : 'To decimal: ' + workTo10(n, a) + '. ';
    return w + (b === 10 ? '' : 'To ' + BN[b] + ': ' + workFrom10(n, b));
  }
  var MAKERS = {
    conv: function (lv, opt) {
      var bases = opt.bases.length >= 2 ? opt.bases : [2, 10, 16], a = pick(bases), b; do { b = pick(bases); } while (b === a);
      var r = LV[lv], n = rnd(r[0], r[1]); if (lv === 'easy' && (a === 8 || b === 8)) n = rnd(0, 63);
      return { tag: BN[a] + ' → ' + BN[b], q: 'Write <code>' + show(n, a) + '</code>' + BS[a] + ' in ' + BN[b] + '.', a: to(n, b), disp: show(n, b), why: convWhy(n, a, b), check: function (v) { return clean(v) === to(n, b); } };
    },
    math: function (lv) {
      var b = pick([2, 16]), r = lv === 'easy' ? [1, 15] : lv === 'med' ? [8, 255] : [200, 4095], x = rnd(r[0], r[1]), y = rnd(r[0], r[1]), op = pick(['+', '+', '−']);
      if (op === '−' && y > x) { var t = x; x = y; y = t; }
      var n = op === '+' ? x + y : x - y;
      return { tag: BN[b] + ' arithmetic', q: 'In ' + BN[b] + ': <code>' + show(x, b) + ' ' + op + ' ' + show(y, b) + '</code> = ?', a: to(n, b), disp: show(n, b), why: 'In decimal that’s ' + x + ' ' + op + ' ' + y + ' = ' + n + ', which is ' + show(n, b) + ' in ' + BN[b] + (b === 2 ? '. In binary, 1 + 1 = 10: write 0 and carry 1.' : '. In hex, carry when a column passes F (15).'), check: function (v) { return clean(v) === to(n, b); } };
    },
    morseEar: function (lv) { var w = pick(WORDS[lv]); return { tag: 'Morse by ear', q: 'Listen and type the word. <button type="button" class="hs-btn ghost cp-play">▶ Play</button>', a: w, disp: w, sound: w, why: w + ' = ' + toMorse(w), check: function (v) { return clean(v) === w; } }; },
    morseRead: function (lv) { var w = pick(WORDS[lv]); return { tag: 'Morse to letters', q: 'Decode: <code class="cp-morse">' + toMorse(w) + '</code>', a: w, disp: w, why: toMorse(w).split('   ').map(function (c, i) { return c + ' = ' + w[i]; }).join(', '), check: function (v) { return clean(v) === w; }, print: 'Decode: ' + toMorse(w) }; },
    morseWrite: function (lv) {
      var w = pick(lv === 'hard' ? WORDS.med : WORDS.easy), want = w.split('').map(function (c) { return MORSE[c]; }).join(' ');
      return { tag: 'Letters to Morse', q: 'Write <b>' + w + '</b> in Morse. Use . and - with a space between letters.', a: want, disp: toMorse(w), why: toMorse(w), check: function (v) { return normMorse(v) === want; } };
    },
    ascii: function (lv) {
      var w = pick(WORDS[lv]), hx = w.split('').map(function (c) { return to(c.charCodeAt(0), 16); });
      if (Math.random() < 0.5) return { tag: 'ASCII hex → word', q: 'These are ASCII codes in hex. What word do they spell? <code>' + hx.join(' ') + '</code>', a: w, disp: w, why: hx.map(function (h, i) { return h + ' = ' + w[i]; }).join(', ') + '. Capital A is 41 and each letter adds one.', check: function (v) { return clean(v) === w; } };
      return { tag: 'Word → ASCII hex', q: 'Write <b>' + w + '</b> as ASCII codes in hex, with a space between them.', a: hx.join(' '), disp: hx.join(' '), why: w.split('').map(function (c, i) { return c + ' = ' + hx[i]; }).join(', '), check: function (v) { return v.toUpperCase().trim().split(/\s+/).join(' ') === hx.join(' '); } };
    }
  };
  var NAMES = { conv: 'Convert between bases', math: 'Add and subtract in binary and hex', morseEar: 'Morse by ear', morseRead: 'Morse to letters', morseWrite: 'Letters to Morse', ascii: 'ASCII letter codes' };

  // ---------- settings ----------
  var KEY = 'trb-codepractice-v1', st = { kinds: ['conv'], bases: [2, 10, 16], lv: 'easy', n: 10, best: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var form = $('cp-form'); if (!form) return;
  function syncForm() {
    form.querySelectorAll('[name=kind]').forEach(function (c) { c.checked = st.kinds.indexOf(c.value) >= 0; });
    form.querySelectorAll('[name=base]').forEach(function (c) { c.checked = st.bases.indexOf(+c.value) >= 0; });
    form.querySelectorAll('[name=lv]').forEach(function (c) { c.checked = c.value === st.lv; });
    $('cp-n').value = st.n;
    $('cp-bases').hidden = st.kinds.indexOf('conv') < 0;
  }
  form.addEventListener('change', function () {
    st.kinds = [].filter.call(form.querySelectorAll('[name=kind]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
    st.bases = [].filter.call(form.querySelectorAll('[name=base]'), function (c) { return c.checked; }).map(function (c) { return +c.value; });
    st.lv = (form.querySelector('[name=lv]:checked') || {}).value || 'easy'; st.n = +$('cp-n').value || 10;
    if (!st.kinds.length) st.kinds = ['conv'];
    save(); syncForm();
  });
  function preset(v, go) {
    var p = String(v).split('|'), k = p[0].split(',').filter(function (x) { return MAKERS[x]; });
    if (!k.length) return false;
    st.kinds = k;
    var bs = (p[1] || '').split(',').map(Number).filter(function (x) { return [2, 8, 10, 16].indexOf(x) >= 0; });
    if (bs.length >= 2) st.bases = bs;
    if (/^(easy|med|hard)$/.test(p[2] || '')) st.lv = p[2];
    save(); syncForm(); if (go) { start(); $('cp-run').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    return true;
  }
  D.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () { preset(b.dataset.preset, true); });
  });
  syncForm();
  function make() { var k = pick(st.kinds); return MAKERS[k](st.lv, st); }

  // ---------- online drill ----------
  var P = null, i = 0, ok = 0, streak = 0, beststreak = 0, answered = false;
  function start() {
    i = 0; ok = 0; streak = 0; beststreak = 0;
    $('cp-run').hidden = false; $('cp-done').hidden = true; next();
  }
  function next() {
    P = make(); answered = false;
    $('cp-tag').textContent = 'Question ' + (i + 1) + ' of ' + st.n + ' · ' + P.tag;
    $('cp-q').innerHTML = P.q; $('cp-a').value = ''; $('cp-fb').innerHTML = ''; $('cp-check').textContent = 'Check';
    var pb = $('cp-q').querySelector('.cp-play'); if (pb) { pb.addEventListener('click', function () { W.TRBMorse && W.TRBMorse.play(P.sound); }); setTimeout(function () { W.TRBMorse && W.TRBMorse.play(P.sound); }, 300); }
    $('cp-a').focus({ preventScroll: true }); stats();
  }
  function stats() { $('cp-stats').textContent = ok + ' right' + (i ? ' of ' + i : '') + ' · streak ' + streak + (beststreak > 1 ? ' (best ' + beststreak + ')' : ''); }
  function check() {
    if (answered) { if (i >= st.n) return finish(); next(); return; }
    var v = $('cp-a').value; if (!v.trim()) return;
    var right = P.check(v); i++; answered = true;
    if (right) { ok++; streak++; beststreak = Math.max(beststreak, streak); } else streak = 0;
    $('cp-fb').innerHTML = (right ? '<b class="good">✓ Right!</b>' : '<b class="bad">Not quite.</b> The answer is <b>' + esc(P.disp) + '</b>.') + '<div class="cp-why">' + esc(P.why) + '</div>';
    $('cp-check').textContent = i >= st.n ? 'See my score' : 'Next →'; stats();
  }
  function finish() {
    var key = st.kinds.slice().sort().join('+') + ':' + st.lv, pct = Math.round(ok / st.n * 100), prev = st.best[key] || 0;
    if (pct > prev) { st.best[key] = pct; save(); }
    $('cp-run').hidden = true; $('cp-done').hidden = false;
    $('cp-score').innerHTML = '<b>' + ok + ' of ' + st.n + '</b> right (' + pct + '%) · longest streak ' + beststreak + (pct > prev && prev ? ' · a new best!' : prev ? ' · your best here: ' + Math.max(prev, pct) + '%' : '');
    $('cp-next').textContent = pct >= 90 && st.lv !== 'hard' ? 'Try the next level up →' : 'Another round';
  }
  $('cp-start').addEventListener('click', start);
  $('cp-check').addEventListener('click', check);
  $('cp-a').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  $('cp-again').addEventListener('click', start);
  $('cp-next').addEventListener('click', function () { if (/next level/.test(this.textContent)) { st.lv = st.lv === 'easy' ? 'med' : 'hard'; save(); syncForm(); } start(); });

  // A link like ?p=conv|2,8,10|easy (from the teaching guide) sets up and starts a round.
  try { var qp = new URLSearchParams(W.location.search).get('p'); if (qp && preset(qp, false)) { start(); var lk = $('cp-linked'); if (lk) lk.hidden = false; } } catch (e) { }
  // ---------- printable worksheet ----------
  $('cp-print').addEventListener('click', function () {
    var n = Math.max(10, st.n), qs = [];
    for (var j = 0; j < n; j++) { var p = make(); if (p.sound) p = MAKERS.morseRead(st.lv); qs.push(p); }
    var lvn = { easy: 'Easy', med: 'Medium', hard: 'Hard' }[st.lv];
    $('cp-sheet').innerHTML = '<div class="cp-page"><h2>Code practice · ' + lvn + '</h2><p class="cp-name">Name ____________________ Date __________</p><p class="hs-small">' + esc(st.kinds.map(function (k) { return NAMES[k]; }).join(' · ')) + '</p><ol class="cp-ws">' +
      qs.map(function (p) { return '<li><span class="cp-tagp">' + esc(p.tag) + '</span> ' + p.q.replace(/<button[^>]*>.*?<\/button>/, '') + '<span class="cp-line"></span></li>'; }).join('') + '</ol></div>' +
      '<div class="cp-page cp-key"><h2>Answer key</h2><ol class="cp-ws">' + qs.map(function (p) { return '<li><b>' + esc(p.disp) + '</b> <span class="hs-small">' + esc(p.why) + '</span></li>'; }).join('') + '</ol></div>';
    D.body.classList.add('cp-printing'); W.print(); setTimeout(function () { D.body.classList.remove('cp-printing'); }, 500);
  });
})(window, document);
