/* The two-hand rhythm trainer (/music/rhythm/). Needs core.js, sound.js and ui.js (TRBMusic.rhythm).
   Timing: the same lookahead Scheduler as the metronome (200 ms ahead, so every target is known before a tap can
   arrive early). Taps carry their event timestamp, which sound.audible() turns into "the audio time you were
   hearing", so a tap made exactly with the sound you hear scores 0 ms. The saved delay correction is subtracted.
   Inputs: the two pads (pointer events, multi-touch), keys F/D (left) and J/K (right), and a MIDI keyboard
   (below middle C = left hand). Space start/stop, arrows tempo, Esc stop.
   Test hook: TRBMusic.rhythm.tr (state, start, stop, select, tap, scorer, scheduler, pattern, events). */
(function () {
  'use strict';
  var R = window.TRBMusic.rhythm, core = R.core, S = R.sound, ui = R.ui;
  var LOOK = 0.2;
  var COL = { R: '#5cb8f0', L: '#f39a55', on: '#6cc79a', near: '#e0c070', off: '#f28b9b', ink: '#f3ead2', muted: '#a9c2b3' };

  function $(id) { return document.getElementById(id); }
  function clampInt(v, a, b, d) { v = Math.round(+v); return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; }
  function swapLR(s) { return s.replace(/\b(left|right|Left|Right)\b/g, function (w) { return { left: 'right', right: 'left', Left: 'Right', Right: 'Left' }[w]; }); }
  function stepsTxt(a) { return (a.length > 1 ? 'steps ' : 'step ') + list(a); }
  function list(a) { a = a.map(function (x) { return x + 1; }); return a.length < 2 ? String(a[0]) : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  function init() {
    var root = $('mr-tr');
    if (!root) return;
    var reduced = ui.reduced();

    /* ---------- state ---------- */
    var sv = ui.store.get().tr || {};
    var st = {
      ex: core.exerciseById(sv.ex) ? sv.ex : 'together', swap: !!sv.swap,
      bpmBy: sv.bpmBy && typeof sv.bpmBy === 'object' ? sv.bpmBy : {},
      countIn: sv.countIn !== false, cycles: [4, 8, 16, 0].indexOf(sv.cycles) >= 0 ? sv.cycles : 8,
      guide: isFinite(sv.guide) ? Math.max(0, Math.min(1, sv.guide)) : 0.8, fade: !!sv.fade, beat: sv.beat !== false, tapSound: sv.tapSound !== false,
      vol: isFinite(sv.vol) ? Math.max(0, Math.min(1, sv.vol)) : 0.8,
      free: { R: clampInt(sv.free && sv.free.R, 1, 9, 3), L: clampInt(sv.free && sv.free.L, 1, 9, 2), cycleBeats: clampInt(sv.free && sv.free.cycleBeats, 1, 8, 2) }
    };
    var saveT = 0;
    function save() {
      clearTimeout(saveT);
      saveT = setTimeout(function () {
        ui.store.put('tr', { ex: st.ex, swap: st.swap, bpmBy: st.bpmBy, countIn: st.countIn, cycles: st.cycles, guide: st.guide, fade: st.fade, beat: st.beat, tapSound: st.tapSound, vol: st.vol, free: st.free });
      }, 300);
    }
    var ex = core.exerciseById(st.ex), pat = null, bpm = 60;
    var running = false, sched = null, src = null, scorer = null, bus = null, tick = null, vq = [], countIn = 0, endAt = 0;
    var tmap = {}, flash = {}, countShow = { n: 0, t: -9 }, guideMul = 1, judged = {}, lastSummary = null, frozen = null, runBpm = 0;

    var el = {
      sel: $('tr-ex'), prev: $('tr-prev'), next: $('tr-next'), title: $('tr-title'), best: $('tr-best'), how: $('tr-how'), free: $('tr-free'),
      cv: $('tr-cv'), status: $('tr-status'), go: $('tr-go'), goT: root.querySelector('#tr-go .mr-go-t'), range: $('tr-range'), minus: $('tr-minus'), plus: $('tr-plus'), bpmO: $('tr-bpm'),
      score: $('tr-score'), countin: $('tr-countin'), len: $('tr-len'), guide: $('tr-guide'), guideO: $('tr-guide-o'), fade: $('tr-fade'), beat: $('tr-beat'), tapsnd: $('tr-tapsnd'),
      swap: $('tr-swap'), vol: $('tr-vol'), volO: $('tr-vol-o'), midiRow: $('tr-midi-row'), midi: $('tr-midi'), midiMsg: $('tr-midi-msg'), math: $('tr-math'), prog: $('tr-prog'),
      pad: { L: $('tr-pad-L'), R: $('tr-pad-R') }, fb: { L: $('tr-fb-L'), R: $('tr-fb-R') }
    };
    function status(t) { el.status.textContent = t; }

    /* ---------- best scores ---------- */
    function keyFor(e, swap) { return e.id + (swap ? '~swap' : '') + (e.free ? ':' + st.free.R + '-' + st.free.L + '-' + st.free.cycleBeats : ''); }
    function bestOf(k) { var b = ui.store.get().best[k]; return b && isFinite(b.pct) ? b : null; }
    function saveBest(k, rec) {
      var all = ui.store.get().best, old = all[k];
      if (old && (old.pct > rec.pct || (old.pct === rec.pct && old.bpm >= rec.bpm))) return false;
      var nb = {}; for (var x in all) nb[x] = all[x];
      nb[k] = rec; ui.store.put('best', nb);
      return true;
    }

    /* ---------- exercise selection ---------- */
    function fillSelect() {
      el.sel.innerHTML = '';
      core.LEVELS.forEach(function (lv) {
        var og = document.createElement('optgroup'); og.label = lv.n + '. ' + lv.name;
        core.EXERCISES.forEach(function (e, i) {
          if (e.level !== lv.n) return;
          var o = document.createElement('option'); o.value = e.id;
          var b = bestOf(keyFor(e, false));
          o.textContent = (i + 1) + '. ' + e.title + (b ? '  (best ' + b.pct + '%)' : '');
          og.appendChild(o);
        });
        el.sel.appendChild(og);
      });
      el.sel.value = st.ex;
    }
    function fillProgress() {
      el.prog.innerHTML = '';
      core.LEVELS.forEach(function (lv) {
        var h = document.createElement('h3'); h.textContent = lv.name; el.prog.appendChild(h);
        var ol = document.createElement('ol');
        core.EXERCISES.forEach(function (e, i) {
          if (e.level !== lv.n) return;
          var li = document.createElement('li'), b = document.createElement('button');
          b.type = 'button'; b.dataset.ex = e.id;
          if (e.id === st.ex) b.setAttribute('aria-current', 'true');
          var best = e.free ? null : bestOf(keyFor(e, false)), bs = e.free ? null : bestOf(keyFor(e, true));
          b.innerHTML = '<span>' + (i + 1) + '. ' + e.title + (bs ? ' <span class="mus-small">(swapped ' + bs.pct + '%)</span>' : '') + '</span><span class="bs' + (best ? ' has' : '') + '">' + (best ? best.pct + '%' : e.free ? 'free' : '–') + '</span>';
          b.setAttribute('aria-label', e.title + (best ? ', best ' + best.pct + ' percent at ' + best.bpm + ' BPM' : ', not played yet'));
          li.appendChild(b); ol.appendChild(li);
        });
        el.prog.appendChild(ol);
      });
    }
    el.prog.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-ex]'); if (!b) return;
      select(b.dataset.ex);
      $('tr-stage').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });

    function select(id, keepScore) {
      if (running) stopRun(true);
      var e = core.exerciseById(id); if (!e) return;
      ex = e; st.ex = id;
      bpm = clampInt(st.bpmBy[id], 20, 200, e.bpm);
      el.range.value = bpm; showBpm();
      frozen = null;
      rebuild();
      if (!keepScore) el.score.innerHTML = '<p class="mus-small">Press Start, wait for the count-in, then tap with the sounds. Your timing shows here as you play.</p>';
      save();
    }
    function rebuild() {
      pat = core.buildPattern(ex, st.swap, st.free);
      el.sel.value = st.ex;
      el.title.textContent = ex.title + (st.swap ? ' (hands swapped)' : '');
      var how = ex.free ? 'Right hand: ' + st.free.R + ' even tap' + (st.free.R > 1 ? 's' : '') + ' per cycle. Left hand: ' + st.free.L + '. The cycle lasts ' + st.free.cycleBeats + ' beat' + (st.free.cycleBeats > 1 ? 's' : '') + ' (the soft click). Change the numbers below.' : ex.how;
      el.how.textContent = st.swap ? swapLR(how) : how;
      el.free.hidden = !ex.free;
      ['R', 'L', 'cycleBeats'].forEach(function (k) { $('tr-f-' + k).textContent = st.free[k]; });
      var b = bestOf(keyFor(ex, st.swap));
      el.best.textContent = b ? 'Best ' + b.pct + '% at ' + b.bpm + ' BPM' : '';
      buildMath(); fillProgress(); sizeCanvas(); draw();
      status('Press Start (or the space bar). ' + (st.countIn ? 'You will hear a count-in first.' : ''));
    }
    el.sel.addEventListener('change', function () { select(el.sel.value); });
    function step(d) {
      var i = 0; for (; i < core.EXERCISES.length; i++) if (core.EXERCISES[i].id === st.ex) break;
      i = (i + d + core.EXERCISES.length) % core.EXERCISES.length;
      select(core.EXERCISES[i].id);
    }
    el.prev.addEventListener('click', function () { step(-1); });
    el.next.addEventListener('click', function () { step(1); });
    el.free.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-f]'); if (!b) return;
      var k = b.dataset.f, lim = k === 'cycleBeats' ? 8 : 9;
      st.free[k] = Math.max(1, Math.min(lim, st.free[k] + +b.dataset.d));
      if (running) stopRun(true);
      frozen = null; rebuild(); save();
    });

    /* ---------- the math ---------- */
    var mathCols = [];
    function buildMath() {
      var p = pat, N = p.steps, nR = p.R.hits.length, nL = p.L.hits.length, txt = '';
      var perBeat = N / p.cycleBeats;
      if (p.poly) {
        var a = nR, b = nL, l = core.lcm(a, b), g = core.gcd(a, b), mx = Math.max(a, b), mn = Math.min(a, b), fast = a > b ? 'right' : 'left', slow = a > b ? 'left' : 'right';
        if (a === b) txt = 'Both hands make ' + a + ' even taps in the cycle, so they always land together.';
        else if (mn === 1) txt = 'The cycle splits into <b>' + mx + '</b> equal steps. The ' + fast + ' hand plays every step; the ' + slow + ' hand plays only step 1, together with it.';
        else {
          txt = 'The right hand makes <b>' + a + '</b> even taps in the cycle, the left hand <b>' + b + '</b>. ';
          txt += mx % mn === 0 ? 'Since ' + mx + ' is a multiple of ' + mn + ', the cycle splits into <b>' + mx + '</b> equal steps. ' :
            'The smallest number that both ' + a + ' and ' + b + ' divide into evenly is <b>' + l + '</b> (their <i>least common multiple</i>), so the cycle splits into ' + l + ' equal steps. ';
          txt += 'The right hand lands every ' + (l / a) + ' steps (' + stepsTxt(p.R.hits) + '), the left hand every ' + (l / b) + ' steps (' + stepsTxt(p.L.hits) + '). Step 1 is together.';
          if (g > 1 && mx % mn !== 0) txt += ' Both numbers share a factor of ' + g + ', so this is really ' + (a / g) + ' against ' + (b / g) + ', played ' + g + ' times in a row.';
        }
      } else {
        txt = 'This pattern sits on a grid of <b>' + N + '</b> steps over ' + p.cycleBeats + ' beat' + (p.cycleBeats > 1 ? 's' : '') +
          (perBeat === 2 ? ' (two steps per beat: eighth notes)' : perBeat === 1 ? ' (one step per beat)' : '') +
          '. Right hand: ' + stepsTxt(p.R.hits) + '. Left hand: ' + stepsTxt(p.L.hits) + '.';
        var acc = [];
        if (p.R.acc.length) acc.push('right hand on ' + stepsTxt(p.R.acc));
        if (p.L.acc.length) acc.push('left hand on ' + stepsTxt(p.L.acc));
        if (acc.length) txt += ' Stronger notes (marked &gt;): ' + acc.join(', ') + '.';
      }
      if (st.swap) txt += ' (Hands are swapped.)';
      var h = '<p>' + txt + '</p><div class="mr-gridwrap"><div class="mr-mgrid" style="grid-template-columns:auto repeat(' + N + ',minmax(26px,1fr))" aria-hidden="true">';
      h += '<div class="lbl hd">Step</div>';
      for (var i = 0; i < N; i++) h += '<div class="hd' + (i % perBeat === 0 ? ' beat' : '') + '" data-col="' + i + '">' + (i + 1) + '</div>';
      ['R', 'L'].forEach(function (hand) {
        var H = p[hand];
        h += '<div class="lbl"><span class="' + (hand === 'R' ? 'mr-rh' : 'mr-lh') + '">' + (hand === 'R' ? 'Right' : 'Left') + '</span> (' + H.hits.length + ')</div>';
        for (var j = 0; j < N; j++) {
          var on = H.hits.indexOf(j) >= 0;
          h += '<div class="c' + (on ? (hand === 'R' ? ' r' : ' l') : '') + (j % perBeat === 0 && j ? ' bs' : '') + '" data-col="' + j + '">' + (on && H.acc.indexOf(j) >= 0 ? '&gt;' : '') + '</div>';
        }
      });
      if (p.saying) {
        h += '<div class="lbl">Say</div>';
        for (var k = 0; k < N; k++) { var wi = p.saying.steps.indexOf(k); h += '<div class="w" data-col="' + k + '">' + (wi >= 0 ? p.saying.words[wi] : '') + '</div>'; }
      }
      h += '</div></div><p class="mus-small">Bold numbers are the beats (the soft click). Each step is ' + (Math.round(60000 / bpm * p.cycleBeats / N)) + ' ms at ' + bpm + ' BPM.</p>';
      el.math.innerHTML = h;
      mathCols = [];
      var cells = el.math.querySelectorAll('[data-col]');
      for (var c = 0; c < cells.length; c++) { var ci = +cells[c].dataset.col; (mathCols[ci] = mathCols[ci] || []).push(cells[c]); }
    }
    var mathNow = -1;
    function markMath(i) {
      if (i === mathNow) return;
      if (mathCols[mathNow]) mathCols[mathNow].forEach(function (c) { c.classList.remove('now'); });
      mathNow = i;
      if (mathCols[i]) mathCols[i].forEach(function (c) { c.classList.add('now'); });
    }

    /* ---------- tempo ---------- */
    function showBpm() { el.bpmO.textContent = bpm + ' BPM'; }
    function setBpm(v) {
      v = clampInt(v, 20, 200, bpm);
      bpm = v; el.range.value = v; showBpm();
      st.bpmBy[st.ex] = v; save();
      if (running) sched.setTempo(v, S.ctx.currentTime);
      var ms = el.math.querySelector('p.mus-small:last-child');
      if (ms) ms.textContent = 'Bold numbers are the beats (the soft click). Each step is ' + Math.round(60000 / bpm * pat.cycleBeats / pat.steps) + ' ms at ' + bpm + ' BPM.';
    }
    el.range.addEventListener('input', function () { setBpm(el.range.value); });
    function holdRepeat(btn, delta) {
      var t1 = 0, t2 = 0;
      function end() { clearTimeout(t1); clearInterval(t2); }
      btn.addEventListener('pointerdown', function (e) {
        if (e.button) return; e.preventDefault(); setBpm(bpm + delta);
        end(); t1 = setTimeout(function () { t2 = setInterval(function () { setBpm(bpm + delta); }, 80); }, 420);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { btn.addEventListener(n, end); });
      btn.addEventListener('click', function (e) { if (e.detail === 0) setBpm(bpm + delta); });
    }
    holdRepeat(el.minus, -1); holdRepeat(el.plus, 1);

    /* ---------- running ---------- */
    function onEvent(ev) {
      var g;
      if (ev.kind === 'count') S.play(ev.n === 1 ? 'count-hi' : 'count', ev.t, 0.55, bus);
      else if (ev.kind === 'beat') { if (st.beat) S.play('shaker', ev.t, ev.beat === 0 ? 0.42 : 0.28, bus); }
      else if (ev.kind === 'hit') {
        g = st.guide * guideMul * (ev.accent ? 0.62 : 0.4);
        if (g > 0.004) S.play(ev.accent ? 'hand-' + ev.hand + '-acc' : 'hand-' + ev.hand, ev.t, g, bus);
        var tg = scorer.addTarget(ev, 60 / sched.bpm);
        tg.accent = ev.accent;
        tmap[ev.hand + ev.cycle + ':' + ev.step] = tg;
      }
      vq.push(ev);
      api.events.push({ kind: ev.kind, hand: ev.hand, step: ev.step, cycle: ev.cycle, t: ev.t, ph: ev.ph, bpm: sched.bpm, at: S.ctx.currentTime, guide: g });
      if (api.events.length > 4000) api.events.splice(0, 1000);
    }
    function pump() {
      if (!running || !sched.running) return;
      sched.lookahead = document.hidden ? 1.0 : LOOK;
      sched.pump(S.ctx.currentTime);
    }
    function startRun() {
      var c = S.ensure();
      if (!c) { status('This browser cannot play sound, so the trainer cannot run here.'); return; }
      if (cal && cal.running()) cal.cancel();
      S.setVolume(st.vol);
      bus = S.newBus();
      countIn = st.countIn ? (pat.cycleBeats >= 3 ? pat.cycleBeats : 4) : 0;
      src = new core.TrainerSource(pat, { countIn: countIn, cycles: st.cycles || Infinity });
      scorer = new core.Scorer({ offset: ui.calibOffset() });
      sched = new core.Scheduler({ lookahead: LOOK, onEvent: onEvent });
      vq = []; tmap = {}; flash = {}; judged = {}; guideMul = 1; endAt = 0; frozen = null; countShow = { n: 0, t: -9 }; runBpm = bpm;
      running = true;
      sched.start(src, c.currentTime + 0.15, bpm);
      pump();
      tick = S.ticker(pump);
      el.go.setAttribute('aria-pressed', 'true'); el.goT.textContent = 'Stop'; el.go.setAttribute('aria-label', 'Stop (space bar)');
      status(countIn ? 'Count-in: listen…' : 'Go!');
      el.score.innerHTML = '<div class="mr-score-big"><b id="tr-live">–</b><span>so far</span></div><p class="mus-small" id="tr-live2">Tap with the sounds.</p>';
      requestAnimationFrame(frame);
    }
    function cyclesDone(now) {
      if (!sched) return 0;
      var ph = sched.phaseAt(now - scorer.offset) - countIn;
      return Math.max(0, Math.floor(ph / pat.cycleBeats + 1e-9));
    }
    function stopRun(silent) {
      if (!running) return;
      var now = S.audible();
      running = false;
      sched.stop(); tick.stop(); S.endBus(bus); vq = [];
      el.go.setAttribute('aria-pressed', 'false'); el.goT.textContent = 'Start'; el.go.setAttribute('aria-label', 'Start the exercise (space bar)');
      markMath(-1);
      var done = Math.min(cyclesDone(now), st.cycles || Infinity), complete = st.cycles && done >= st.cycles;
      scorer.expire(Infinity);
      // targets that were scheduled but never reached do not count
      scorer.targets = scorer.targets.filter(function (g) { return g.hit || g.t + g.w < now - scorer.offset; });
      // keep showing the last page that was played
      var phEnd = sched.phaseAt(now) - countIn, lastCyc = Math.max(0, Math.ceil(phEnd / pat.cycleBeats - 1e-9) - 1);
      if (st.cycles) lastCyc = Math.min(lastCyc, st.cycles - 1);
      frozen = { now: now, page: Math.floor(lastCyc / winCycles()) };
      if (silent) { draw(); return; }
      showResult(done, complete);
      draw();
    }
    function toggle() { if (running) stopRun(false); else startRun(); }

    function showResult(done, complete) {
      var s = scorer.summary(); lastSummary = s;
      var tapped = scorer.taps.length;
      if (!s.due || !tapped) {
        el.score.innerHTML = '<p>' + (tapped ? 'Stopped before the first target.' : 'No taps this time.') + ' Press Start and tap the pads (or <kbd>F</kbd> and <kbd>J</kbd>) with the sounds.</p>';
        status('Stopped.'); return;
      }
      var k = keyFor(ex, st.swap), saved = false, savable = complete || (!st.cycles && done >= 4);
      if (savable && s.due >= 4) saved = saveBest(k, { pct: s.pct, ms: Math.round(s.meanAbs), bpm: runBpm, at: new Date().toISOString().slice(0, 10) });
      var h = '<div class="mr-score-big"><b>' + s.pct + '%</b><span>' + s.rating + '</span></div>';
      if (saved) h += '<span class="mr-newbest">New best for this exercise</span>';
      h += '<ul class="mr-score-list">';
      h += '<li>Timing: <b>' + Math.round(s.meanAbs) + ' ms</b> off on average' + (s.hits > 2 ? ', steady to about ±' + Math.round(s.sd) + ' ms' : '') + '.</li>';
      if (s.R.n) h += '<li><span class="mr-rh">Right hand</span>: ' + ui.fmtMs(s.R.mean) + ' on average.</li>';
      if (s.L.n) h += '<li><span class="mr-lh">Left hand</span>: ' + ui.fmtMs(s.L.mean) + ' on average.</li>';
      h += '<li>Hit <b>' + s.hits + '</b> of ' + s.due + (s.misses ? ', missed ' + s.misses : '') + (s.extras ? ', ' + s.extras + ' extra tap' + (s.extras > 1 ? 's' : '') : '') + '.</li>';
      h += '<li>' + runBpm + ' BPM, ' + done + ' cycle' + (done === 1 ? '' : 's') + (scorer.offset ? ', delay correction ' + Math.round(scorer.offset * 1000) + ' ms' : '') + '.</li>';
      h += '</ul><p class="mus-small">' + tip(s) + (savable ? '' : st.cycles ? ' Play all ' + st.cycles + ' cycles to save a best score.' : ' Play at least 4 cycles to save a best score.') + '</p>';
      el.score.innerHTML = h;
      status((complete ? 'Done: ' : 'Stopped: ') + s.pct + '%, ' + s.rating.toLowerCase() + '.');
      if (saved) { var b = bestOf(k); el.best.textContent = 'Best ' + b.pct + '% at ' + b.bpm + ' BPM'; fillSelect(); fillProgress(); }
    }
    function tip(s) {
      if (s.misses > s.due / 3) return 'Many taps were missed. Try 10 BPM slower and say the pattern out loud.';
      if (Math.abs(s.R.mean - s.L.mean) > 35 && s.R.n && s.L.n) return 'One hand runs ahead of the other. Practice the two hands alone for a few cycles, then together again.';
      if (s.mean > 30) return 'Your taps tend to be late. Listen a little ahead, or measure your delay below if you use Bluetooth headphones.';
      if (s.mean < -30) return 'Your taps tend to be early (most people rush a little). Let each sound come to you.';
      if (s.pct >= 90) return 'Lovely. Try it 5 BPM faster, or turn the guide sounds down and keep it steady on your own.';
      if (s.pct >= 75) return 'Good and steady. Play it a few more times at this tempo before speeding up.';
      return 'Slow it down until every tap feels easy, then build up again.';
    }

    /* ---------- taps ---------- */
    function padDown(hand) { var p = el.pad[hand]; p.classList.add('down'); clearTimeout(p._t); p._t = setTimeout(function () { p.classList.remove('down'); }, 110); }
    function feedback(hand, cls, text) {
      var f = el.fb[hand]; f.className = 'mr-pad-fb ' + cls; f.textContent = text; f.style.opacity = 1;
      clearTimeout(f._t); f._t = setTimeout(function () { f.style.opacity = 0; }, 1300);
    }
    function tap(hand, perfMs, viaMidi) {
      padDown(hand);
      if (!S.ctx && viaMidi) return;
      var c = S.ensure(); if (!c) return;
      if (st.tapSound) S.play('hand-' + hand, c.currentTime, 0.3);
      if (!running) return null;
      var t = S.audible(perfMs);
      return tapAt(hand, t);
    }
    function tapAt(hand, t) {
      var tc = t - scorer.offset, ph = sched.phaseAt(tc);
      if (ph < countIn && (countIn - ph) * 60 / sched.bpm > 0.16) { feedback(hand, 'extra', 'wait for the count-in'); return null; }
      var rec = scorer.tap(hand, t);
      if (rec.extra) feedback(hand, 'extra', 'extra tap');
      else { feedback(hand, rec.cat, ui.fmtMs(rec.err)); flash[hand + rec.target.cycle + ':' + rec.target.step] = rec.t; }
      updateLive();
      return rec;
    }
    function updateLive() {
      var b = $('tr-live'), b2 = $('tr-live2'); if (!b) return;
      var s = scorer.summary();
      if (!s.due) return;
      b.textContent = s.pct + '%';
      b2.textContent = 'Timing ' + Math.round(s.meanAbs) + ' ms off on average · hit ' + s.hits + ' of ' + s.due + (s.extras ? ' · ' + s.extras + ' extra' : '') + (st.fade && guideMul < 0.999 ? ' · guide ' + Math.round(guideMul * 100) + '%' : '');
    }
    ['L', 'R'].forEach(function (hand) {
      var p = el.pad[hand];
      p.addEventListener('pointerdown', function (e) { if (e.button > 0) return; e.preventDefault(); tap(hand, e.timeStamp); });
      p.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      p.addEventListener('click', function (e) { if (e.detail === 0) tap(hand, performance.now()); });
    });
    var KEYS = { KeyF: 'L', KeyD: 'L', KeyJ: 'R', KeyK: 'R' }, swallowUp = false;
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (cal && cal.running()) return;
      if (e.key === 'Escape') { if (running) { stopRun(false); e.preventDefault(); } return; }
      if (ui.isTyping(e)) return;
      if (KEYS[e.code]) { e.preventDefault(); if (!e.repeat) tap(KEYS[e.code], e.timeStamp); return; }
      if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); swallowUp = true; if (!e.repeat) toggle(); return; }
      if (e.target && e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowUp') { e.preventDefault(); setBpm(bpm + (e.shiftKey ? 5 : 1)); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setBpm(bpm - (e.shiftKey ? 5 : 1)); }
    });
    document.addEventListener('keyup', function (e) { if (swallowUp && (e.key === ' ' || e.code === 'Space')) { e.preventDefault(); swallowUp = false; } });
    document.addEventListener('visibilitychange', pump);

    // MIDI keyboard: below middle C (MIDI 60) is the left hand
    if (navigator.requestMIDIAccess) {
      el.midiRow.hidden = false;
      el.midi.addEventListener('click', function () {
        S.ensure();
        navigator.requestMIDIAccess().then(function (acc) {
          function hook() {
            var n = 0;
            acc.inputs.forEach(function (inp) { inp.onmidimessage = onMidi; n++; });
            el.midiMsg.textContent = n ? 'MIDI keyboard connected. Keys below middle C are the left hand; middle C and above, the right hand.' : 'No MIDI keyboard found yet. Plug one in and it will be picked up.';
          }
          hook(); acc.onstatechange = hook;
          el.midi.disabled = true;
        }, function () { el.midiMsg.textContent = 'The browser did not allow MIDI access. You can still use the pads and the keys.'; });
      });
    }
    function onMidi(e) {
      var d = e.data; if (!d || d.length < 3) return;
      if ((d[0] & 0xf0) === 0x90 && d[2] > 0) tap(d[1] < 60 ? 'L' : 'R', e.timeStamp, true);
    }

    /* ---------- timeline drawing ---------- */
    var g2 = el.cv.getContext('2d'), W = 0, H = 0, dpr = 1;
    function sizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      var r = el.cv.getBoundingClientRect();
      W = Math.max(200, r.width); H = Math.max(120, r.height);
      el.cv.width = Math.round(W * dpr); el.cv.height = Math.round(H * dpr);
      g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function winCycles() { return Math.max(1, Math.round(4 / pat.cycleBeats)); }
    function draw(now) {
      if (!g2) return;
      var p = pat, wc = winCycles(), wb = wc * p.cycleBeats, narrow = W < 520;
      var x0 = narrow ? 30 : 64, x1 = W - (narrow ? 12 : 18), ruleY = 18, laneH = narrow ? 44 : 50;
      var yR = ruleY + 16 + laneH / 2, yL = yR + laneH + 6, ySay = yL + laneH / 2 + 18;
      function X(beats) { return x0 + (x1 - x0) * beats / wb; }
      g2.clearRect(0, 0, W, H);
      var live = running && sched, t = live ? now : frozen ? frozen.now : 0;
      var exPh = live || frozen ? sched.phaseAt(t) - countIn : -1;
      var page = live ? Math.max(0, Math.floor(Math.max(0, exPh) / wb)) : frozen ? frozen.page : 0;
      var local = exPh - page * wb;
      if (frozen && !live && local > wb) local = wb;

      // lanes
      [['R', yR], ['L', yL]].forEach(function (a) {
        g2.fillStyle = rgba(COL[a[0]], 0.06); g2.fillRect(x0 - 6, a[1] - laneH / 2, x1 - x0 + 12, laneH);
        g2.fillStyle = COL[a[0]]; g2.font = '700 ' + (narrow ? 12 : 13) + 'px system-ui,sans-serif'; g2.textAlign = 'left'; g2.textBaseline = 'middle';
        g2.fillText(narrow ? a[0] : a[0] === 'R' ? 'Right' : 'Left', 8, a[1]);
      });
      // grid: steps, beats, cycles
      var stepsTotal = p.steps * wc;
      for (var s = 0; s <= stepsTotal; s++) {
        var bx = X(s * p.cycleBeats / p.steps), isCycle = s % p.steps === 0, isBeat = Math.abs((s * p.cycleBeats / p.steps) % 1) < 1e-9;
        if (!isBeat && stepsTotal > 72) continue;
        g2.strokeStyle = isCycle ? 'rgba(243,234,210,.42)' : isBeat ? 'rgba(243,234,210,.2)' : 'rgba(243,234,210,.07)';
        g2.lineWidth = isCycle ? 1.5 : 1;
        g2.beginPath(); g2.moveTo(Math.round(bx) + 0.5, ruleY + 8); g2.lineTo(Math.round(bx) + 0.5, yL + laneH / 2); g2.stroke();
      }
      g2.fillStyle = COL.muted; g2.font = '600 11px system-ui,sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'alphabetic';
      for (var b = 0; b < wb; b++) g2.fillText(String(b % p.cycleBeats + 1), X(b) + (b === 0 ? 4 : 0), ruleY + 2);

      // saying
      var sayIdx = -1;
      if (p.saying) {
        g2.font = 'italic 600 ' + (narrow ? 12 : 13) + 'px Georgia,serif'; g2.textBaseline = 'middle';
        var rowEnd = [-1e9, -1e9]; // words that would touch go on a second line
        for (var c0 = 0; c0 < wc; c0++) {
          for (var w = 0; w < p.saying.steps.length; w++) {
            var sb = c0 * p.cycleBeats + p.saying.steps[w] * p.cycleBeats / p.steps, nb = w + 1 < p.saying.steps.length ? c0 * p.cycleBeats + p.saying.steps[w + 1] * p.cycleBeats / p.steps : (c0 + 1) * p.cycleBeats;
            var act = (live || frozen) && local >= sb - 0.02 && local < nb - 0.02 && exPh >= 0;
            g2.fillStyle = act ? COL.near : 'rgba(243,234,210,.55)';
            var first = w === 0 && c0 === 0, tw = g2.measureText(p.saying.words[w]).width, wx = X(sb) - (first ? 4 : 0);
            var left = first ? wx : wx - tw / 2, row = left > rowEnd[0] + 5 ? 0 : left > rowEnd[1] + 5 ? 1 : 0;
            rowEnd[row] = left + tw;
            g2.textAlign = first ? 'left' : 'center';
            g2.fillText(p.saying.words[w], wx, ySay + row * 15);
          }
        }
      }

      // targets
      var tauF = reduced ? 0.12 : 0.18;
      for (var c = 0; c < wc; c++) {
        var cyc = page * wc + c;
        ['R', 'L'].forEach(function (hand) {
          var Hh = p[hand], y = hand === 'R' ? yR : yL;
          for (var i = 0; i < Hh.hits.length; i++) {
            var stp = Hh.hits[i], x = X(c * p.cycleBeats + stp * p.cycleBeats / p.steps);
            var acc = Hh.acc.indexOf(stp) >= 0, r = (acc ? 11 : 9) * (narrow ? 0.85 : 1);
            var tg = (live || frozen) ? tmap[hand + cyc + ':' + stp] : null;
            var beyond = st.cycles && cyc >= st.cycles;
            g2.globalAlpha = beyond ? 0.25 : 1;
            // a soft halo as the guide sound plays
            if (tg && live && t >= tg.t && t - tg.t < 0.6) {
              var a = reduced ? (t - tg.t < tauF ? 0.6 : 0) : 0.6 * Math.exp(-(t - tg.t) / tauF);
              if (a > 0.02) { g2.fillStyle = rgba(COL[hand], a * 0.5); g2.beginPath(); g2.arc(x, y, r + 9, 0, 6.2832); g2.fill(); }
            }
            g2.lineWidth = 2;
            if (tg && tg.hit) {
              g2.fillStyle = COL[hand]; g2.beginPath(); g2.arc(x, y, r, 0, 6.2832); g2.fill();
              g2.strokeStyle = COL[tg.hit.cat]; g2.lineWidth = 2.5; g2.beginPath(); g2.arc(x, y, r + 3.5, 0, 6.2832); g2.stroke();
            } else if (tg && tg.missed) {
              g2.strokeStyle = rgba(COL[hand], 0.45); g2.beginPath(); g2.arc(x, y, r, 0, 6.2832); g2.stroke();
              g2.strokeStyle = rgba(COL.off, 0.8); g2.beginPath(); g2.moveTo(x - r * 0.55, y - r * 0.55); g2.lineTo(x + r * 0.55, y + r * 0.55); g2.stroke();
            } else {
              g2.fillStyle = '#0a2117'; g2.strokeStyle = COL[hand];
              g2.beginPath(); g2.arc(x, y, r, 0, 6.2832); g2.fill(); g2.stroke();
            }
            if (acc) { g2.fillStyle = COL.ink; g2.font = '800 11px system-ui,sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'alphabetic'; g2.fillText('>', x, y - r - 5); }
            g2.globalAlpha = 1;
          }
        });
      }

      // taps on this page
      if ((live || frozen) && scorer) {
        var p0 = page * wb;
        for (var k = 0; k < scorer.taps.length; k++) {
          var tp = scorer.taps[k], tph = sched.phaseAt(tp.tc) - countIn - p0;
          if (tph < -0.3 || tph > wb + 0.3) continue;
          var tx = X(tph), ty = tp.hand === 'R' ? yR : yL, col = tp.extra ? 'rgba(243,234,210,.55)' : COL[tp.cat];
          if (tp.target && Math.abs(tp.err) > 6) {
            var gx = X(sched.phaseAt(tp.target.t) - countIn - p0);
            g2.strokeStyle = rgba(tp.extra ? '#f3ead2' : COL[tp.cat], 0.7); g2.lineWidth = 2;
            g2.beginPath(); g2.moveTo(gx, ty + laneH / 2 - 7); g2.lineTo(tx, ty + laneH / 2 - 7); g2.stroke();
          }
          g2.fillStyle = col;
          g2.fillRect(tx - 1.5, ty - laneH / 2 + 4, 3, laneH - 8);
          if (tp.extra) { g2.font = '700 10px system-ui,sans-serif'; g2.textAlign = 'center'; g2.fillText('×', tx, ty - laneH / 2 + 2); }
        }
      }

      // playhead
      if ((live || frozen) && exPh >= 0) {
        var px = X(Math.min(wb, local));
        g2.strokeStyle = 'rgba(255,248,225,.95)'; g2.lineWidth = 2;
        g2.shadowColor = 'rgba(255,240,200,.8)'; g2.shadowBlur = reduced ? 0 : 10;
        g2.beginPath(); g2.moveTo(px, ruleY + 6); g2.lineTo(px, yL + laneH / 2 + 2); g2.stroke();
        g2.shadowBlur = 0;
      }
      // count-in numbers
      if (live && exPh < 0 && countShow.n) {
        var ca = reduced ? 1 : Math.max(0.35, Math.exp(-(t - countShow.t) / 0.5));
        g2.fillStyle = 'rgba(8,24,16,.72)'; g2.fillRect(0, 0, W, H);
        g2.globalAlpha = ca; g2.fillStyle = COL.near; g2.font = '400 ' + (narrow ? 54 : 68) + 'px Georgia,serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
        g2.fillText(String(countShow.n), W / 2, H / 2 - 6);
        g2.globalAlpha = 1; g2.fillStyle = COL.muted; g2.font = '600 12px system-ui,sans-serif';
        g2.fillText('count-in ' + countShow.n + ' of ' + countShow.of, W / 2, H / 2 + (narrow ? 34 : 42));
      }
      if (live) {
        var ci = Math.floor(exPh / p.cycleBeats);
        if (exPh >= 0) markMath(Math.floor((exPh - ci * p.cycleBeats) / p.cycleBeats * p.steps + 1e-6));
      }
    }

    function judgeCycles(now) {
      // fade the guide after a cycle you played well; bring it back after one that went badly
      var done = cyclesDone(now) - 1;
      for (var c = 0; c <= done; c++) {
        if (judged[c]) continue;
        judged[c] = true;
        var pts = 0, n = 0;
        scorer.targets.forEach(function (g) { if (g.cycle === c) { n++; if (g.hit) pts += g.hit.pts; } });
        if (!n || !st.fade) continue;
        var acc = pts / n;
        if (acc >= 0.85) guideMul = guideMul < 0.12 ? 0 : guideMul * 0.7;
        else if (acc < 0.6) guideMul = Math.min(1, guideMul / 0.7 + 0.1);
        updateLive();
      }
    }
    function frame() {
      if (!running) return;
      var now = S.audible();
      while (vq.length && vq[0].t <= now) {
        var ev = vq.shift();
        if (ev.kind === 'count') { countShow = { n: ev.n, of: ev.of, t: ev.t }; status('Count-in: ' + ev.n + ' of ' + ev.of); }
        else if (ev.kind === 'beat' && ev.beat === 0) status((st.cycles ? 'Cycle ' + (ev.cycle + 1) + ' of ' + st.cycles : 'Cycle ' + (ev.cycle + 1)) + (ev.cycle === 0 ? ': go!' : ''));
        else if (ev.kind === 'end') endAt = ev.t + 0.25;
      }
      if (scorer.expire(now).length) updateLive();
      judgeCycles(now);
      draw(now);
      if (endAt && now >= endAt) { stopRun(false); return; }
      requestAnimationFrame(frame);
    }

    /* ---------- settings ---------- */
    function lenButtons() {
      el.len.innerHTML = '';
      [[4, '4 cycles'], [8, '8 cycles'], [16, '16 cycles'], [0, 'Keep looping']].forEach(function (o) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = o[1]; b.setAttribute('aria-pressed', String(st.cycles === o[0]));
        b.addEventListener('click', function () { st.cycles = o[0]; lenButtons(); save(); if (running) status('The new length applies next time you press Start.'); });
        el.len.appendChild(b);
      });
    }
    el.countin.checked = st.countIn; el.fade.checked = st.fade; el.beat.checked = st.beat; el.tapsnd.checked = st.tapSound; el.swap.checked = st.swap;
    el.guide.value = Math.round(st.guide * 100); el.guideO.textContent = el.guide.value + '%';
    el.vol.value = Math.round(st.vol * 100); el.volO.textContent = el.vol.value + '%';
    el.countin.addEventListener('change', function () { st.countIn = el.countin.checked; save(); });
    el.fade.addEventListener('change', function () { st.fade = el.fade.checked; if (!st.fade) guideMul = 1; save(); });
    el.beat.addEventListener('change', function () { st.beat = el.beat.checked; save(); });
    el.tapsnd.addEventListener('change', function () { st.tapSound = el.tapsnd.checked; save(); });
    el.swap.addEventListener('change', function () { st.swap = el.swap.checked; if (running) stopRun(true); frozen = null; rebuild(); save(); });
    el.guide.addEventListener('input', function () { st.guide = el.guide.value / 100; el.guideO.textContent = el.guide.value + '%'; save(); });
    el.vol.addEventListener('input', function () { st.vol = el.vol.value / 100; el.volO.textContent = el.vol.value + '%'; S.setVolume(st.vol); save(); });
    el.go.addEventListener('click', toggle);
    var rT = 0;
    window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { sizeCanvas(); draw(running ? S.audible() : 0); }, 80); });

    var cal = ui.calibrator($('tr-cal'), { before: function () { stopRun(true); }, onChange: function () { } });

    var api = R.tr = {
      events: [], state: st,
      start: startRun, stop: function () { stopRun(false); }, select: select, setBpm: setBpm,
      tap: tap, tapAt: function (hand, t) { return running ? tapAt(hand, t) : null; },
      running: function () { return running; }, scorer: function () { return scorer; }, scheduler: function () { return sched; },
      pattern: function () { return pat; }, countIn: function () { return countIn; }, summary: function () { return lastSummary; }
    };

    fillSelect(); lenButtons();
    select(st.ex, false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
