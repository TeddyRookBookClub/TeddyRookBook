/* The Continued-Fraction Suite: the left-hand accent player on each piano lesson (Teddy Rook Book).
   Markup: layouts/music/suite-lesson.html (inline/sx-play.html), one <div class="sx-play"> with
     data-rate     the accent rate r: eighth note n (n = 0 at the first bar) is accented when floor((n+1)r) > floor(nr)
     data-eighths  eighth notes per bar (6 in 3/4, 8 in 4/4);  data-bpm the marked tempo;  data-first the first bar number
   It shows eight bars at a time, with the accented eighths filled in, the same pattern as the accents (>) printed under
   the left hand in the score. Pressing play sounds a low piano note on each accent and, if chosen, a soft click on every
   eighth note. Needs TRBMusic.audio (static/music/kit/audio.js); nothing sounds before the press. */
(function () {
  'use strict';
  var ROWS = 8;
  function hit(n, r) { return Math.floor((n + 1) * r + 1e-9) > Math.floor(n * r + 1e-9); }
  function fmt(n) { return n.toLocaleString('en-US'); }

  function mount(el) {
    var r = +el.dataset.rate, E = +el.dataset.eighths || 8, bpm0 = +el.dataset.bpm || 80, first = +el.dataset.first || 1;
    var grid = el.querySelector('.sx-grid'), go = el.querySelector('.sx-go-btn'), tempo = el.querySelector('.sx-tempo'),
      tv = el.querySelector('.sx-tv'), tick = el.querySelector('.sx-tick'), now = el.querySelector('.sx-now');
    var A = window.TRBMusic && window.TRBMusic.audio;
    var cells = [], win = -1, timer = null, playing = false, nextN = 0, nextT = 0, shown = -1, lit = null;

    function draw(w) { // bars w*ROWS … w*ROWS+ROWS-1 (0-based from the first bar)
      if (w === win) return; win = w; grid.innerHTML = ''; cells = [];
      grid.style.setProperty('--e', E);
      for (var b = 0; b < ROWS; b++) {
        var bar = w * ROWS + b, row = document.createElement('div'); row.className = 'sx-row';
        var lab = document.createElement('span'); lab.className = 'sx-bn'; lab.textContent = fmt(first + bar); row.appendChild(lab);
        for (var e = 0; e < E; e++) {
          var n = bar * E + e, c = document.createElement('span');
          c.className = 'sx-c' + (hit(n, r) ? ' sx-acc' : '') + (e === 0 ? ' sx-down' : '') + (e % 2 === 0 ? ' sx-beat' : '');
          row.appendChild(c); cells.push(c);
        }
        grid.appendChild(row);
      }
      var cnt = 0; for (var i = 0; i < ROWS * E; i++) if (hit(w * ROWS * E + i, r)) cnt++;
      grid.setAttribute('data-count', cnt);
    }
    function show(n) {
      var w = Math.floor(n / (ROWS * E)); draw(w);
      if (lit) lit.classList.remove('sx-on');
      lit = cells[n - w * ROWS * E] || null; if (lit) lit.classList.add('sx-on');
      var bar = Math.floor(n / E);
      if (bar !== shown) { shown = bar; now.textContent = 'Bar ' + fmt(first + bar) + ' · beat ' + (Math.floor((n % E) / 2) + 1); }
    }
    function bpm() { return +tempo.value || bpm0; }
    function sched() {
      var t = A.now(), step = 30 / bpm();
      while (nextT < t + 0.15) {
        var n = nextN, when = nextT, acc = hit(n, r);
        if (acc) A.play(43, when, step * 0.9, 0.85);
        if (tick.checked || n % E === 0) A.click(when, n % E === 0, n % E === 0 ? 0.5 : 0.28);
        (function (n, when) { setTimeout(function () { if (playing) show(n); }, Math.max(0, (when - A.now() - A.latency()) * 1000)); })(n, when);
        nextN++; nextT += step;
      }
    }
    function start() {
      if (!A) { now.textContent = 'Sound is not available in this browser.'; return; }
      A.unlock && A.unlock();
      playing = true; nextN = 0; nextT = A.now() + 0.12; shown = -1;
      go.textContent = '■ Stop'; go.setAttribute('aria-pressed', 'true');
      timer = setInterval(sched, 40); sched();
    }
    function stop() {
      playing = false; clearInterval(timer); timer = null; if (A) A.stopAll();
      go.textContent = '▶ Play the accents'; go.setAttribute('aria-pressed', 'false');
      if (lit) lit.classList.remove('sx-on'); lit = null; draw(0);
      now.textContent = 'Stopped. Press play to start again from bar ' + fmt(first) + '.';
    }
    go.addEventListener('click', function () { if (playing) stop(); else start(); });
    tempo.addEventListener('input', function () { tv.textContent = '♩ = ' + tempo.value; });
    document.addEventListener('visibilitychange', function () { if (document.hidden && playing) stop(); });
    draw(0);
  }
  function init() { Array.prototype.forEach.call(document.querySelectorAll('.sx-play'), mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
