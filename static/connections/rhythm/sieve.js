/* The Rhythm of Numbers: "The rhythm sieve" (#sieve on /connections/rhythm-of-numbers/), from Section 17.6 of the
   paper (Teddy Rook's notes). One voice per small prime l: it sounds on beat n when l divides the denominator q_n of
   the n-th convergent. Neighboring denominators share no factor, so no voice sounds on two beats running. A beat where
   every voice is silent has no small factor; every prime denominator above 19 is such a beat (marked with a gold star).
   Only residues are computed: q_n mod l from q_n = a_n q_(n-1) + q_(n-2). The terms of pi (to n = 40,000, checked
   by the paper's scripts) are fetched from pi-terms.txt when the section first opens; e, the golden ratio and the
   square root of 2 follow their patterns. Sound only after a press (RN.voice dispatches trb:sound-start).
   Element ids (svN, svPlay, svPrev, svNext, svJump, svBack, svStart, svCan, svRead, svLive, svNote) are the contract
   with layouts/connections/rhythm.html. */
(function (RN) {
  'use strict';
  var $ = RN.$;
  var VOICES = [2, 3, 5, 7, 11, 13, 17, 19];
  var PITCH = [0, 2, 4, 7, 9, 12, 14, 16];              // a calm pentatonic, one degree per voice (C major pentatonic)
  // prime denominators (our indexing, q_1 = 7). For pi beyond n = 6,925 they are probable primes (Chapter 17).
  var PRIMES = {
    pi: [1, 3, 8, 32, 594, 1126, 2002, 3610, 4355, 6925, 25332, 27651, 32394, 37721],
    e: [2, 4, 7, 13, 19, 34, 40, 64, 238, 268],
    phi: [2, 3, 4, 6, 10, 12, 16, 22, 28, 42, 46, 82, 130, 136, 358, 430, 432, 448, 508, 568, 570, 2970],   // F_(n+1) prime (OEIS A001605)
    sqrt2: [1, 2, 4, 10, 12, 28, 40, 52, 58, 88, 96, 100, 166, 180, 190, 522, 928, 1216, 1300, 1360, 2086, 2272, 2392]   // P_(n+1) prime (OEIS A096650)
  };
  var NAMES = { pi: 'π', e: 'e', phi: 'the golden ratio', sqrt2: '√2' };
  var LIMIT = { pi: 40000, e: 4000, phi: 4000, sqrt2: 4000 };
  var piTerms = null, loadingPi = false;
  var st = { num: 'pi', start: 1, width: 24, res: null, playing: false, timer: 0, at: -1 };

  function terms(num, upto) {
    var t = [], k;
    if (num === 'pi') return piTerms;
    if (num === 'e') { t.push(2); for (k = 1; t.length <= upto; k++) t.push(1, 2 * k, 1); return t.slice(0, upto + 1); }
    if (num === 'phi') { for (k = 0; k <= upto; k++) t.push(1); return t; }
    t.push(1); for (k = 1; k <= upto; k++) t.push(2); return t;
  }
  // residues r[i][n] = q_n mod VOICES[i], n = 0..N
  function residues(num) {
    var N = LIMIT[num], a = terms(num, N); if (!a) return null;
    N = Math.min(N, a.length - 1);
    var R = VOICES.map(function (l) {
      var r = new Uint8Array(N + 1), q0 = 0, q1 = 1; r[0] = 1;
      for (var n = 1; n <= N; n++) { var q2 = ((a[n] % l) * q1 + q0) % l; q0 = q1; q1 = q2; r[n] = q2; }
      return r;
    });
    return { R: R, N: N };
  }
  function sounding(n) { var out = []; for (var i = 0; i < VOICES.length; i++) if (st.res.R[i][n] === 0) out.push(i); return out; }
  function isPrimeBeat(n) { return PRIMES[st.num].indexOf(n) >= 0; }
  function describe(n) {
    var s = sounding(n), p = isPrimeBeat(n);
    var big = st.num === 'pi' && n > 6925 ? ' (a probable prime, found by Teddy Rook)' : '';
    if (p && s.length) return 'Beat ' + n.toLocaleString('en-US') + ': the denominator is the prime ' + VOICES[s[0]] + ' itself, so only its own voice sounds.';
    if (p) return 'Beat ' + n.toLocaleString('en-US') + ': every voice is silent, and the denominator is prime' + big + '.';
    if (!s.length) return 'Beat ' + n.toLocaleString('en-US') + ': every voice is silent, so the denominator has no factor up to 19. It still has a larger one: it is not prime.';
    return 'Beat ' + n.toLocaleString('en-US') + ': the denominator is divisible by ' + s.map(function (i) { return VOICES[i]; }).join(', ').replace(/, (\d+)$/, ' and $1') + '.';
  }

  function draw() {
    var c = $('svCan'); if (!c || !st.res) return;
    var r = RN.setup(c), x = r[0], w = r[1], h = r[2];
    var padL = 34, padT = 22, padB = 22, rows = VOICES.length, cols = st.width;
    var cw = (w - padL - 6) / cols, ch = (h - padT - padB) / rows;
    var ink = RN.c('--rn-ink'), mute = RN.c('--rn-muted'), line = RN.c('--rn-line'), g = RN.c('--rn-g'), gold = RN.c('--rn-gold'), soft = RN.c('--rn-soft');
    x.clearRect(0, 0, w, h);
    x.font = RN.font(11); x.textBaseline = 'middle';
    for (var i = 0; i < rows; i++) { x.fillStyle = mute; x.textAlign = 'right'; x.fillText(String(VOICES[i]), padL - 8, padT + (i + 0.5) * ch); }
    for (var j = 0; j < cols; j++) {
      var n = st.start + j; if (n > st.res.N) break;
      var cx = padL + j * cw, s = sounding(n), silent = !s.length, pr = isPrimeBeat(n);
      if (silent) { x.fillStyle = soft; x.fillRect(cx + 1, padT, cw - 2, rows * ch); }
      if (n === st.at) { x.strokeStyle = ink; x.lineWidth = 1.5; x.strokeRect(cx + 1, padT - 2, cw - 2, rows * ch + 4); }
      for (var k = 0; k < rows; k++) {
        var cy = padT + (k + 0.5) * ch, on = st.res.R[k][n] === 0;
        x.beginPath(); x.arc(cx + cw / 2, cy, on ? Math.min(cw, ch) * 0.32 : 1.6, 0, 6.2832);
        x.fillStyle = on ? g : line; x.fill();
      }
      if (pr) {                                  // a gold star above the column
        var sx = cx + cw / 2, sy = padT - 11, R1 = 6.5, R2 = 2.8; x.beginPath();
        for (var m = 0; m < 10; m++) { var ang = -Math.PI / 2 + m * Math.PI / 5, rr = m % 2 ? R2 : R1; x[m ? 'lineTo' : 'moveTo'](sx + rr * Math.cos(ang), sy + rr * Math.sin(ang)); }
        x.closePath(); x.fillStyle = gold; x.fill();
      }
      if (j % 4 === 0 || pr) { x.fillStyle = pr ? ink : mute; x.textAlign = 'center'; x.font = RN.font(pr ? 11 : 10); x.fillText(n.toLocaleString('en-US'), cx + cw / 2, h - padB / 2); x.font = RN.font(11); }
    }
    var shown = Math.min(st.res.N, st.start + cols - 1);
    var pr2 = PRIMES[st.num].filter(function (n) { return n >= st.start && n <= shown; });
    $('svRead').textContent = 'Beats ' + st.start.toLocaleString('en-US') + ' to ' + shown.toLocaleString('en-US') + ' of ' + NAMES[st.num] + '. ' +
      (pr2.length ? 'Prime denominators here: ' + pr2.map(function (n) { return n.toLocaleString('en-US'); }).join(', ') + '.' : 'No prime denominator in this stretch.');
    c.setAttribute('aria-label', 'The rhythm sieve for ' + NAMES[st.num] + ', beats ' + st.start + ' to ' + shown + '. ' + $('svRead').textContent);
  }

  function setStart(s) { st.start = Math.max(1, Math.min(st.res.N - st.width + 1, Math.round(s))); $('svStart').value = st.start; draw(); }
  function jump(dir) {
    var list = PRIMES[st.num], mid = st.start, t = null;
    if (dir > 0) { for (var i = 0; i < list.length; i++) if (list[i] > st.start + 2 && list[i] <= st.res.N) { t = list[i]; break; } }
    else { for (var k = list.length - 1; k >= 0; k--) if (list[k] < mid + 2) { t = list[k]; if (t < st.start) break; } }
    if (t == null) { $('svLive').textContent = dir > 0 ? 'No later prime denominator in the range shown here.' : 'No earlier prime denominator.'; return; }
    setStart(t - 2); st.at = t; draw(); $('svLive').textContent = describe(t);
  }

  function stop() { st.playing = false; clearTimeout(st.timer); $('svPlay').textContent = '▶ Play'; $('svPlay').setAttribute('aria-pressed', 'false'); st.at = -1; draw(); }
  function play() {
    var ctx = RN.ac(); if (!ctx) return;
    RN.stopAll(); RN.stopper(stop);
    st.playing = true; $('svPlay').textContent = '■ Stop'; $('svPlay').setAttribute('aria-pressed', 'true');
    var j = 0, beat = 0.42;
    (function stepNext() {
      if (!st.playing) return;
      var n = st.start + j; if (j >= st.width || n > st.res.N) { stop(); return; }
      st.at = n; draw();
      var t = ctx.currentTime + 0.03, s = sounding(n);
      s.forEach(function (i) { RN.voice('sine', t, RN.mtof(60 + PITCH[i]), 0.34, 0.11); });
      if (isPrimeBeat(n)) RN.voice('mallet', t, RN.mtof(84), 0.9, 0.16);
      else if (!s.length) RN.tick(t, 0.02);
      $('svLive').textContent = describe(n);
      j++; st.timer = setTimeout(stepNext, beat * 1000);
    })();
  }

  function setNum(num) {
    stop(); st.num = num;
    if (num === 'pi' && !piTerms) { loadPi(); return; }
    st.res = residues(num); $('svStart').max = st.res.N; setStart(1);
    $('svNote').textContent = num === 'pi' ? 'Pi’s terms here run to beat 40,000; the last four stars (25,332, 27,651, 32,394 and 37,721) are probable primes found by Teddy Rook in November 2026.'
      : num === 'e' ? 'For e each voice repeats exactly: the voice of a prime l comes back every 3l beats. Two beats out of every three can never be prime.'
        : num === 'phi' ? 'For the golden ratio the denominators are Fibonacci numbers. Each voice repeats with a fixed period, and a star can only sit on a beat n where n + 1 is prime (or on beat 3).'
          : 'For √2 the denominators are Pell numbers, which also repeat in fixed periods modulo every prime.';
  }
  function loadPi() {
    if (loadingPi) return; loadingPi = true;
    $('svRead').textContent = 'Loading the terms of pi…';
    var base = RN.root.getAttribute('data-rn-base') || '';
    fetch(base + 'pi-terms.txt').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (txt) {
      piTerms = txt.trim().split(',').map(Number); loadingPi = false; if (st.num === 'pi') setNum('pi');
    }).catch(function () {
      loadingPi = false; $('svRead').textContent = 'The terms of pi could not load. Check the connection and reload the page.';
    });
  }

  function resize() { var w = ($('svCan').clientWidth || 600); st.width = w < 480 ? 12 : w < 760 ? 18 : 24; }
  RN.def('sieve', {
    init: function () {
      resize();
      $('svN').addEventListener('change', function () { setNum(this.value); });
      $('svPlay').addEventListener('click', function () { if (st.playing) stop(); else play(); });
      $('svPrev').addEventListener('click', function () { stop(); setStart(st.start - st.width); });
      $('svNext').addEventListener('click', function () { stop(); setStart(st.start + st.width); });
      $('svJump').addEventListener('click', function () { stop(); jump(1); });
      $('svBack').addEventListener('click', function () { stop(); jump(-1); });
      $('svStart').addEventListener('change', function () { stop(); var v = parseInt(this.value, 10); if (v > 0) setStart(v); });
      $('svCan').addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); stop(); setStart(st.start + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); setStart(st.start - 1); }
        else if (e.key === 'PageDown') { e.preventDefault(); stop(); setStart(st.start + st.width); }
        else if (e.key === 'PageUp') { e.preventDefault(); stop(); setStart(st.start - st.width); }
      });
      setNum('pi');
    },
    redraw: function () { if (!st.res) return; resize(); setStart(st.start); },
    show: function (v) { if (!v && st.playing) stop(); }
  });
})(window.RN);
