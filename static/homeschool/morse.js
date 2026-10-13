/* Morse code: sound and light player, translator, a lesson-by-lesson course (learn by ear, copy, words, send) and
   playable charts. Timing follows the PARIS standard (a dot is 1.2/wpm seconds) with optional Farnsworth spacing
   (ARRL formula). Progress and settings stay in this browser only. */
(function (W, D) {
  'use strict';
  var CODE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
    N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '\'': '.----.', '(': '-.--.', ')': '-.--.-',
    ':': '---...', '"': '.-..-.', '@': '.--.-.', '&': '.-...'
  };
  var PRO = { AR: '.-.-.', SK: '...-.-', BT: '-...-', KN: '-.--.', SOS: '...---...' };
  var PRONOTE = { AR: 'end of message', SK: 'end of contact', BT: 'break, a new paragraph', KN: 'go ahead, only the station called', SOS: 'distress: sent as one run, no gaps' };
  var DEC = {}; Object.keys(CODE).forEach(function (k) { DEC[CODE[k]] = k; }); Object.keys(PRO).forEach(function (k) { if (!DEC[PRO[k]]) DEC[PRO[k]] = '<' + k + '>'; }); DEC['...---...'] = '<SOS>';
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pretty(code) { return code.replace(/\./g, '·').replace(/-/g, '–').split('').join(' '); }
  function sayit(code) { var p = code.split(''); return p.map(function (c, i) { return c === '-' ? 'dah' : (i === p.length - 1 ? 'dit' : 'di'); }).join('-'); }

  // ---------- settings ----------
  var KEY = 'trb-morse-v1', st = { wpm: 15, eff: 8, hz: 600, vol: 0.5, light: true, pass: {}, best: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function timing() {
    var c = +st.wpm || 15, s = Math.min(+st.eff || c, c), u = 1.2 / c, cg = 3 * u, wg = 7 * u;
    if (s < c) { var ta = (60 * c - 37.2 * s) / (c * s); cg = 3 * ta / 19; wg = 7 * ta / 19; } // ARRL Farnsworth timing
    return { u: u, cg: cg, wg: wg };
  }

  // ---------- text to code ----------
  function tokens(text) { // [{ch, code}] with {sp:true} for word gaps; <AR> style prosigns allowed
    var out = [], t = String(text).toUpperCase(), i = 0;
    while (i < t.length) {
      var m = t.slice(i).match(/^<([A-Z]{2,3})>/);
      if (m && PRO[m[1]]) { out.push({ ch: '<' + m[1] + '>', code: PRO[m[1]] }); i += m[0].length; continue; }
      var c = t[i];
      if (/\s/.test(c)) { if (out.length && !out[out.length - 1].sp) out.push({ sp: true }); }
      else if (CODE[c]) out.push({ ch: c, code: CODE[c] });
      else out.push({ ch: c, code: '', skip: true });
      i++;
    }
    return out;
  }

  // ---------- audio and light ----------
  var ctx = null, gainNode = null, timers = [], playing = null;
  function audio() {
    if (!ctx) { var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function stop() {
    timers.forEach(clearTimeout); timers = [];
    if (playing) { try { playing.forEach(function (o) { o.stop(); }); } catch (e) { } playing = null; }
    lamps(false); D.querySelectorAll('.mc-on').forEach(function (e) { e.classList.remove('mc-on'); });
  }
  function lamps(on) { D.querySelectorAll('.mc-lamp').forEach(function (l) { l.classList.toggle('lit', !!on && st.light); }); }
  // play a token list; onChar(index) is called as each character starts; returns total seconds
  function play(toks, onChar, done) {
    stop();
    var a = audio(), T = timing(), t0 = a ? a.currentTime + 0.08 : 0, t = 0, oscs = [];
    toks.forEach(function (tk, idx) {
      if (tk.sp) { t += T.wg - T.cg; return; }
      if (tk.skip) return;
      (function (start, i) { timers.push(setTimeout(function () { if (onChar) onChar(i); }, start * 1000 + 80)); })(t, idx);
      tk.code.split('').forEach(function (s, j) {
        var len = (s === '-' ? 3 : 1) * T.u;
        if (a) {
          var o = a.createOscillator(), g = a.createGain(); o.frequency.value = +st.hz || 600; o.type = 'sine';
          g.gain.setValueAtTime(0, t0 + t); g.gain.linearRampToValueAtTime(+st.vol, t0 + t + 0.005);
          g.gain.setValueAtTime(+st.vol, t0 + t + len - 0.005); g.gain.linearRampToValueAtTime(0, t0 + t + len);
          o.connect(g); g.connect(a.destination); o.start(t0 + t); o.stop(t0 + t + len + 0.01); oscs.push(o);
        }
        (function (s0, l0) { timers.push(setTimeout(function () { lamps(true); }, s0 * 1000 + 80)); timers.push(setTimeout(function () { lamps(false); }, (s0 + l0) * 1000 + 80)); })(t, len);
        t += len + (j < tk.code.length - 1 ? T.u : 0);
      });
      t += T.cg;
    });
    playing = oscs;
    timers.push(setTimeout(function () { playing = null; if (onChar) onChar(-1); if (done) done(); }, t * 1000 + 120));
    return t;
  }
  function playText(text, done) { return play(tokens(text), null, done); }
  W.TRBMorse = { play: playText, stop: stop, code: CODE };

  // ---------- small helpers for UI ----------
  function lampHTML() { return '<span class="mc-lamp" aria-hidden="true"></span>'; }
  function btn(label, cls, attrs) { return '<button type="button" class="hs-btn ' + (cls || '') + '" ' + (attrs || '') + '>' + label + '</button>'; }

  // ---------- playable charts anywhere: [data-morse-chart] or the Outdoor Skills Morse table ----------
  function wireChips(root) {
    root.querySelectorAll('.os-chips span').forEach(function (s) {
      var b = s.querySelector('b'); if (!b) return; var ch = b.textContent.trim().toUpperCase(); if (!CODE[ch]) return;
      s.classList.add('mc-chip'); s.setAttribute('role', 'button'); s.tabIndex = 0; s.title = 'Hear ' + ch;
      function go() { root.querySelectorAll('.mc-chip.mc-on').forEach(function (x) { x.classList.remove('mc-on'); }); play([{ ch: ch, code: CODE[ch] }], function (i) { if (i < 0) s.classList.remove('mc-on'); }); s.classList.add('mc-on'); }
      s.addEventListener('click', go); s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }
  D.querySelectorAll('[data-morse-chips]').forEach(wireChips);

  // ---------- settings bar ----------
  function settingsBar(el) {
    el.innerHTML = '<label>Letter speed <input type="range" min="5" max="35" step="1" data-s="wpm"> <output data-o="wpm"></output> wpm</label>' +
      '<label>Spacing speed <input type="range" min="3" max="35" step="1" data-s="eff"> <output data-o="eff"></output> wpm</label>' +
      '<label>Pitch <input type="range" min="400" max="900" step="10" data-s="hz"> <output data-o="hz"></output> Hz</label>' +
      '<label>Volume <input type="range" min="0.05" max="1" step="0.05" data-s="vol"></label>' +
      '<label class="mc-cb"><input type="checkbox" data-s="light"> Flash a light too</label>';
    function show() {
      el.querySelectorAll('[data-s]').forEach(function (i) { if (i.type === 'checkbox') i.checked = !!st[i.dataset.s]; else i.value = st[i.dataset.s]; });
      el.querySelectorAll('[data-o]').forEach(function (o) { o.textContent = st[o.dataset.o]; });
    }
    el.addEventListener('input', function (e) {
      var i = e.target, k = i.dataset.s; if (!k) return;
      st[k] = i.type === 'checkbox' ? i.checked : +i.value;
      if (k === 'wpm' && st.eff > st.wpm) st.eff = st.wpm;
      if (k === 'eff' && st.eff > st.wpm) st.wpm = st.eff;
      show(); save();
    });
    show();
  }
  D.querySelectorAll('.mc-settings').forEach(settingsBar);

  // ---------- translator ----------
  var tr = $('mc-tr');
  if (tr) {
    var inp = $('mc-in'), out = $('mc-out'), dec = $('mc-dec'), decOut = $('mc-decout');
    function render() {
      var tk = tokens(inp.value);
      out.innerHTML = tk.map(function (t, i) { return t.sp ? '<span class="mc-sp">/</span>' : '<span class="mc-ch' + (t.skip ? ' mc-skip' : '') + '" data-i="' + i + '"><b>' + esc(t.ch) + '</b><i>' + (t.skip ? '?' : pretty(t.code)) + '</i></span>'; }).join('');
      var bad = tk.filter(function (t) { return t.skip; }).map(function (t) { return t.ch; });
      $('mc-skip').textContent = bad.length ? 'No Morse for: ' + bad.filter(function (c, i, a) { return a.indexOf(c) === i; }).join(' ') + ' (skipped)' : '';
    }
    inp.addEventListener('input', render); render();
    $('mc-play').addEventListener('click', function () {
      var tk = tokens(inp.value), secs;
      secs = play(tk, function (i) { out.querySelectorAll('.mc-on').forEach(function (x) { x.classList.remove('mc-on'); }); if (i >= 0) { var e = out.querySelector('[data-i="' + i + '"]'); if (e) { e.classList.add('mc-on'); } } });
      $('mc-time').textContent = 'About ' + (secs < 60 ? Math.round(secs) + ' seconds' : Math.round(secs / 6) / 10 + ' minutes') + ' at these speeds.';
    });
    $('mc-stop').addEventListener('click', stop);
    $('mc-copy').addEventListener('click', function () {
      var txt = tokens(inp.value).map(function (t) { return t.sp ? '/' : t.code; }).join(' ');
      try { navigator.clipboard.writeText(txt); $('mc-copy').textContent = 'Copied'; setTimeout(function () { $('mc-copy').textContent = 'Copy the dots and dashes'; }, 1500); } catch (e) { }
    });
    dec.addEventListener('input', function () {
      var words = dec.value.trim().replace(/[·•]/g, '.').replace(/[–—_−]/g, '-').split(/\s*[\/|]\s*|\s{3,}/);
      decOut.textContent = words.map(function (w) { return w.split(/\s+/).filter(Boolean).map(function (c) { return DEC[c] || '?'; }).join(''); }).join(' ');
    });
  }

  // ---------- full chart ----------
  var chart = $('mc-chart');
  if (chart) {
    var groups = [['Letters', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')], ['Numbers', '1234567890'.split('')], ['Punctuation', ['.', ',', '?', '/', '=', '+', '-', '\'', '(', ')', ':', '"', '@', '&']]];
    var h = groups.map(function (g) {
      return '<h3>' + g[0] + '</h3><div class="mc-grid">' + g[1].map(function (c) { return '<button type="button" class="mc-key' + (CODE[c].length > 5 ? ' long' : '') + '" data-c="' + esc(c) + '"><b>' + esc(c) + '</b><i>' + pretty(CODE[c]) + '</i><small>' + sayit(CODE[c]) + '</small></button>'; }).join('') + '</div>';
    }).join('');
    h += '<h3>Procedure signals</h3><div class="mc-grid">' + Object.keys(PRO).map(function (p) { return '<button type="button" class="mc-key' + (PRO[p].length > 5 ? ' long' : '') + '" data-c="<' + p + '>"><b>' + p + '</b><i>' + pretty(PRO[p]) + '</i><small>' + PRONOTE[p] + '</small></button>'; }).join('') + '</div>';
    chart.innerHTML = h;
    chart.addEventListener('click', function (e) {
      var b = e.target.closest('.mc-key'); if (!b) return;
      chart.querySelectorAll('.mc-on').forEach(function (x) { x.classList.remove('mc-on'); }); play(tokens(b.dataset.c), function (i) { if (i < 0) b.classList.remove('mc-on'); }); b.classList.add('mc-on');
    });
  }

  // ---------- the course ----------
  var LESSONS = [
    { n: 'E and T', c: 'ET', tip: 'The two shortest signals: one dit, one dah. Every other character is built from these.' },
    { n: 'A and N', c: 'AN', tip: 'Mirror images: A is di-dah, N is dah-dit.' },
    { n: 'I and M', c: 'IM', tip: 'Two of the same: I is two dits, M is two dahs.' },
    { n: 'S and O', c: 'SO', tip: 'Three dits and three dahs. Together they make SOS.' },
    { n: 'R and K', c: 'RK', tip: 'Another mirror pair: R is di-dah-dit, K is dah-di-dah.' },
    { n: 'D and U', c: 'DU', tip: 'D is dah-di-dit; U is di-di-dah.' },
    { n: 'H and W', c: 'HW', tip: 'H is four dits (E, I, S, H climb one dit at a time). W is di-dah-dah.' },
    { n: 'G and P', c: 'GP', tip: 'G is dah-dah-dit; P is di-dah-dah-dit.' },
    { n: 'L and F', c: 'LF', tip: 'L is di-dah-di-dit; F is di-di-dah-dit.' },
    { n: 'C and Y', c: 'CY', tip: 'C has a bouncing rhythm, dah-di-dah-dit; Y is dah-di-dah-dah.' },
    { n: 'B and V', c: 'BV', tip: 'B is dah-di-di-dit; V is di-di-di-dah, like the opening of Beethoven’s Fifth.' },
    { n: 'J and Q', c: 'JQ', tip: 'J is di-dah-dah-dah; Q is dah-dah-di-dah.' },
    { n: 'X and Z', c: 'XZ', tip: 'The last two letters: X is dah-di-di-dah, Z is dah-dah-di-dit.' },
    { n: 'Numbers 1 to 5', c: '12345', tip: 'Every number has five signals. 1 to 5 start with dits: the number of dits tells you the number.' },
    { n: 'Numbers 6 to 0', c: '67890', tip: '6 to 9 start with dahs; count the dits at the end to get past 5. Zero is five dahs.' },
    { n: 'Punctuation', c: '.,?/', tip: 'Period, comma, question mark and slash, the punctuation used most.' },
    { n: 'Signals', c: '', pro: ['AR', 'SK', 'BT', 'SOS'], tip: 'Procedure signals are sent as one run, with no gaps between the letters. SOS is the distress signal: ...---... with no gaps.' }
  ];
  var WORDS = ('a an at it in is me am to tea eat ate ten net tan man men mat met mit time tame mine name team meat neat tent tint ant aim main mean mane mint mitt item stem seat east sea see set sit sat site stone tone note one none moon soon toast notes mist nest test seen sent son sun into omit tomato ' +
    'red ran run rain rose rest risk kit kite knee kind milk mark park dark dust duck under used sure trust rust ' +
    'he she the then them this that with what when where who how why wish wash show home horse hot hat hand head heart hear here word work water wait ' +
    'go good got get give gap pig pan pen pet pot top stop step map pass page pup peg ' +
    'let left lift life fit fat fun fish fire full fall field flag fog leaf feel fill fell gold old ' +
    'can cat cot cup car city yes you your yet year young eye easy every candy ' +
    'bed bag big bus box but best book boat brave seven very vast vote love live give ' +
    'jam jet job joy just quiz quit queen quick zero zone zoo fox six mix next wax ' +
    'radio signal morse code light lamp sound beep tap send copy learn letter number help safe ship sail port north south').split(/\s+/);
  var course = $('mc-course');
  if (course) {
    var cur = 0, mode = 'learn', run = null;
    function known(i) { var s = ''; for (var j = 0; j <= i; j++) s += LESSONS[j].c; return s.split(''); }
    function lessonList() {
      $('mc-lessons').innerHTML = LESSONS.map(function (L, i) {
        return '<button type="button" class="mc-les' + (i === cur ? ' on' : '') + (st.pass[i] ? ' done' : '') + '" data-l="' + i + '"><span>' + (i + 1) + '</span><b>' + L.n + '</b>' + (st.pass[i] ? '<i>✓</i>' : '') + '</button>';
      }).join('');
    }
    $('mc-lessons').addEventListener('click', function (e) { var b = e.target.closest('.mc-les'); if (!b) return; cur = +b.dataset.l; mode = 'learn'; stop(); run = null; lessonList(); panel(); D.getElementById('mc-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    D.querySelectorAll('#mc-tabs button').forEach(function (b) { b.addEventListener('click', function () { mode = b.dataset.m; stop(); run = null; panel(); }); });
    function chars(L) { return L.pro ? L.pro.map(function (p) { return '<' + p + '>'; }) : L.c.split(''); }
    function codeOf(c) { return c[0] === '<' ? PRO[c.slice(1, -1)] : CODE[c]; }
    function panel() {
      var L = LESSONS[cur], P = $('mc-pbody');
      D.querySelectorAll('#mc-tabs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === mode); });
      $('mc-ptitle').textContent = 'Lesson ' + (cur + 1) + ': ' + L.n;
      if (mode === 'learn') {
        P.innerHTML = '<p>' + esc(L.tip) + '</p><p class="hs-small">Listen to each one several times and say its sound out loud. Try not to picture dots and dashes: the goal is to know each one by its rhythm.</p>' +
          '<div class="mc-grid big">' + chars(L).map(function (c) { var cd = codeOf(c); return '<button type="button" class="mc-key" data-c="' + esc(c) + '"><b>' + esc(c.replace(/[<>]/g, '')) + '</b><i>' + pretty(cd) + '</i><small>' + sayit(cd) + '</small></button>'; }).join('') + '</div>' +
          '<p>' + btn('▶ Play them all, three times each', 'mc-all') + ' ' + btn('Next: copy by ear →', 'ghost mc-go', 'data-m="copy"') + '</p>';
        P.querySelector('.mc-all').addEventListener('click', function () { var t = []; chars(L).forEach(function (c) { for (var r = 0; r < 3; r++) t.push({ ch: c, code: codeOf(c) }); t.push({ sp: true }); }); play(t, function (i) { P.querySelectorAll('.mc-on').forEach(function (x) { x.classList.remove('mc-on'); }); if (i >= 0) { var b = P.querySelector('[data-c="' + t[i].ch + '"]'); if (b) b.classList.add('mc-on'); } }); });
        P.querySelectorAll('.mc-key').forEach(function (b) { b.addEventListener('click', function () { P.querySelectorAll('.mc-on').forEach(function (x) { x.classList.remove('mc-on'); }); play(tokens(b.dataset.c), function (i) { if (i < 0) b.classList.remove('mc-on'); }); b.classList.add('mc-on'); }); });
      } else if (mode === 'copy') copyDrill(P, L);
      else if (mode === 'words') wordDrill(P, L);
      else sendDrill(P, L);
      P.querySelectorAll('.mc-go').forEach(function (b) { b.addEventListener('click', function () { mode = b.dataset.m; stop(); panel(); }); });
    }
    // copy drill: hear a character, press or tap it; 25 per round; 90% passes
    function copyDrill(P, L) {
      var pool = cur === LESSONS.length - 1 ? chars(L) : known(cur).filter(function (c) { return CODE[c]; }), fresh = chars(L);
      if (cur === LESSONS.length - 1) pool = pool.concat(['S', 'O', 'E', 'T']);
      P.innerHTML = '<p>You’ll hear 25 characters, one at a time, mostly the new ones mixed with ones you already know. Type the character on your keyboard, or tap it below. Aim for 90 percent before moving on.</p>' +
        '<div class="mc-drill"><div class="mc-big" id="mc-q" aria-live="polite">Ready</div>' + lampHTML() + '<div class="mc-score" id="mc-score"></div></div>' +
        '<div class="mc-pad">' + pool.filter(function (c, i, a) { return a.indexOf(c) === i; }).map(function (c) { return '<button type="button" class="mc-padk" data-c="' + esc(c) + '">' + esc(c.replace(/[<>]/g, '')) + '</button>'; }).join('') + '</div>' +
        '<p>' + btn('▶ Start a round', 'mc-start') + ' ' + btn('↻ Hear it again', 'ghost mc-rep') + '</p><div id="mc-hist" class="mc-hist"></div>';
      var n = 0, ok = 0, ans = null, wrong = {}, hist = [];
      function next() {
        if (n >= 25) return finish();
        ans = Math.random() < 0.5 ? fresh[Math.floor(Math.random() * fresh.length)] : pool[Math.floor(Math.random() * pool.length)];
        $('mc-q').textContent = '?'; $('mc-q').className = 'mc-big';
        var a0 = ans; setTimeout(function () { if (ans === a0) play([{ ch: a0, code: codeOf(a0) }]); }, 350);
        score();
      }
      function score() { $('mc-score').textContent = n ? ok + ' of ' + n + ' right · ' + Math.round(ok / n * 100) + '%' : '25 to go'; }
      function guess(c) {
        if (!ans) return;
        var right = c === ans || c === ans.replace(/[<>]/g, '');
        n++; if (right) ok++; else wrong[ans] = (wrong[ans] || 0) + 1;
        $('mc-q').textContent = ans.replace(/[<>]/g, ''); $('mc-q').className = 'mc-big ' + (right ? 'good' : 'bad');
        hist.push('<span class="' + (right ? 'good' : 'bad') + '">' + esc(ans.replace(/[<>]/g, '')) + '</span>');
        $('mc-hist').innerHTML = hist.join('');
        var a = ans; ans = null; score();
        if (!right) { setTimeout(function () { play([{ ch: a, code: codeOf(a) }], null, function () { setTimeout(next, 500); }); }, 400); }
        else setTimeout(next, 700);
      }
      function finish() {
        var pct = Math.round(ok / 25 * 100), miss = Object.keys(wrong).sort(function (a, b) { return wrong[b] - wrong[a]; });
        if (pct >= 90) { st.pass[cur] = 1; save(); lessonList(); }
        st.best[cur] = Math.max(st.best[cur] || 0, pct); save();
        $('mc-q').textContent = pct + '%'; $('mc-q').className = 'mc-big ' + (pct >= 90 ? 'good' : '');
        $('mc-score').innerHTML = (pct >= 90 ? 'Well done: on to words, or the next lesson.' : 'Keep going: try another round.') + (miss.length ? ' Practice: ' + miss.map(function (c) { return '<b>' + esc(c.replace(/[<>]/g, '')) + '</b>'; }).join(', ') : '');
        run = null;
      }
      P.querySelector('.mc-start').addEventListener('click', function () { n = 0; ok = 0; wrong = {}; hist = []; $('mc-hist').innerHTML = ''; run = { guess: guess }; next(); });
      P.querySelector('.mc-rep').addEventListener('click', function () { if (ans) play([{ ch: ans, code: codeOf(ans) }]); });
      P.querySelectorAll('.mc-padk').forEach(function (b) { b.addEventListener('click', function () { guess(b.dataset.c); }); });
      run = null;
    }
    // words drill: hear a word made only from letters learned so far, type it
    function wordDrill(P, L) {
      var k = known(Math.min(cur, 12)).join(''), list = WORDS.filter(function (w) { return w.toUpperCase().split('').every(function (c) { return k.indexOf(c) >= 0; }); });
      if (cur >= 13) list = list.concat(['SOS', '73', 'CQ', 'QTH', '5NN', '599', '1776', '2026']);
      if (list.length < 3) { P.innerHTML = '<p>There aren’t enough words with just these letters yet. Words start after a few more lessons; try copying letters for now.</p>'; return; }
      P.innerHTML = '<p>Ten words made only from letters you’ve learned (' + list.length + ' to choose from). Listen, then type the word and press Enter. Don’t worry about each letter: let the word build in your head.</p>' +
        '<div class="mc-drill"><div class="mc-big" id="mc-wq" aria-live="polite">Ready</div>' + lampHTML() + '<div class="mc-score" id="mc-wscore"></div></div>' +
        '<p><input type="text" id="mc-win" class="mc-in1" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Type the word you hear" placeholder="Type the word"> ' +
        btn('▶ Start', 'mc-wstart') + ' ' + btn('↻ Again', 'ghost mc-wrep') + '</p><div id="mc-whist" class="mc-hist"></div>';
      var n = 0, ok = 0, ans = null, h = [];
      function next() { if (n >= 10) { $('mc-wq').textContent = ok + ' / 10'; $('mc-wscore').textContent = ok >= 9 ? 'Excellent. Try a faster spacing speed.' : 'Good practice. Go again, or slow the spacing down.'; ans = null; return; } ans = list[Math.floor(Math.random() * list.length)].toUpperCase(); $('mc-wq').textContent = '…'; $('mc-wq').className = 'mc-big'; $('mc-win').value = ''; $('mc-win').focus(); setTimeout(function () { playText(ans); }, 300); }
      $('mc-win').addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || !ans) return; e.preventDefault();
        var g = this.value.trim().toUpperCase(), right = g === ans; n++; if (right) ok++;
        $('mc-wq').textContent = ans; $('mc-wq').className = 'mc-big ' + (right ? 'good' : 'bad');
        h.push('<span class="' + (right ? 'good' : 'bad') + '">' + esc(ans) + (right ? '' : ' <s>' + esc(g || '—') + '</s>') + '</span>'); $('mc-whist').innerHTML = h.join('');
        $('mc-wscore').textContent = ok + ' of ' + n; var a = ans; ans = null;
        if (!right) setTimeout(function () { playText(a, function () { setTimeout(next, 600); }); }, 400); else setTimeout(next, 900);
      });
      P.querySelector('.mc-wstart').addEventListener('click', function () { n = 0; ok = 0; h = []; $('mc-whist').innerHTML = ''; next(); });
      P.querySelector('.mc-wrep').addEventListener('click', function () { if (ans) playText(ans); });
    }
    // send drill: tap a key; the page decodes your timing
    function sendDrill(P, L) {
      var target = chars(L).map(function (c) { return c.replace(/[<>]/g, ''); });
      var ex = cur >= 3 ? 'SOS' : chars(L).join(' ').replace(/[<>]/g, '');
      P.innerHTML = '<p>Now send. Press and hold the key (or the space bar) for each dit and dah. Keep dits short and dahs three times as long, and pause between letters. The page writes down what it hears.</p>' +
        '<p>Try sending: <b>' + esc(ex) + '</b>' + (target.length ? ', then each new letter: <b>' + esc(target.join(' ')) + '</b>' : '') + '.</p>' +
        '<label class="mc-cb">Your sending speed <input type="range" min="5" max="30" id="mc-sspd" value="' + (st.send || 12) + '"> <output id="mc-sspdo">' + (st.send || 12) + '</output> wpm</label>' +
        '<div class="mc-send"><button type="button" class="mc-keyer" id="mc-keyer" aria-label="Morse key: hold to send">Press<br>and hold</button>' + lampHTML() + '</div>' +
        '<div class="mc-sent"><span id="mc-cur" class="mc-curcode"></span><div id="mc-text" class="mc-text" aria-live="polite"></div></div>' +
        '<p>' + btn('Clear', 'ghost mc-clear') + '</p>';
      var key = $('mc-keyer'), down = 0, sym = '', text = '', gapT = null, osc = null, g = null;
      function u() { return 1.2 / (st.send || 12); }
      function on() {
        if (down) return; down = performance.now(); clearTimeout(gapT); lamps(true); key.classList.add('down');
        var a = audio(); if (a) { osc = a.createOscillator(); g = a.createGain(); osc.frequency.value = +st.hz || 600; g.gain.setValueAtTime(0, a.currentTime); g.gain.linearRampToValueAtTime(+st.vol, a.currentTime + 0.005); osc.connect(g); g.connect(a.destination); osc.start(); }
      }
      function off() {
        if (!down) return; var d = (performance.now() - down) / 1000; down = 0; lamps(false); key.classList.remove('down');
        if (osc) { var a = ctx; g.gain.setValueAtTime(g.gain.value, a.currentTime); g.gain.linearRampToValueAtTime(0, a.currentTime + 0.006); osc.stop(a.currentTime + 0.02); osc = null; }
        sym += d < 2 * u() ? '.' : '-'; $('mc-cur').textContent = pretty(sym);
        gapT = setTimeout(function () {
          text += DEC[sym] ? DEC[sym].replace(/[<>]/g, '') : '?'; sym = ''; $('mc-cur').textContent = ''; $('mc-text').textContent = text;
          gapT = setTimeout(function () { if (text && text.slice(-1) !== ' ') { text += ' '; $('mc-text').textContent = text; } }, 4 * u() * 1000);
        }, 2.5 * u() * 1000);
      }
      key.addEventListener('pointerdown', function (e) { e.preventDefault(); key.setPointerCapture && key.setPointerCapture(e.pointerId); on(); });
      key.addEventListener('pointerup', off); key.addEventListener('pointercancel', off); key.addEventListener('pointerleave', off);
      run = { down: on, up: off };
      $('mc-sspd').addEventListener('input', function () { st.send = +this.value; $('mc-sspdo').textContent = this.value; save(); });
      P.querySelector('.mc-clear').addEventListener('click', function () { text = ''; sym = ''; $('mc-text').textContent = ''; $('mc-cur').textContent = ''; });
    }
    D.addEventListener('keydown', function (e) {
      if (!run || e.target.closest('input, textarea, select')) return;
      if (run.guess && e.key.length === 1) { var c = e.key.toUpperCase(); if (CODE[c]) { e.preventDefault(); run.guess(c); } }
      if (run.down && e.code === 'Space') { e.preventDefault(); if (!e.repeat) run.down(); }
    });
    D.addEventListener('keyup', function (e) { if (run && run.up && e.code === 'Space') { e.preventDefault(); run.up(); } });
    lessonList(); panel();
  }
})(window, document);
