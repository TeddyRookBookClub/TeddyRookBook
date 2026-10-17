/* The metronome page (/music/metronome/). Needs core.js, sound.js and ui.js (TRBMusic.rhythm).
   Timing: a Scheduler on the AudioContext clock, pumped every ~25 ms by a worker timer, schedules each click about
   100 ms ahead (1 s while the tab is hidden). The beat dots follow the audio clock: each frame shows the clicks whose
   time has reached what you are hearing now (sound.audible()).
   Keys: Space start/stop, arrows ±1 BPM (Shift ±10), T tap tempo, J or F tap the timing pad, Esc stop.
   Test hook: TRBMusic.rhythm.met (state, start, stop, setBpm, events). */
(function () {
  'use strict';
  var R = window.TRBMusic.rhythm, core = R.core, S = R.sound, ui = R.ui;

  var PRESETS = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];
  var LEVEL_NAMES = ['silent', 'soft', 'normal', 'accent'];
  var SOUNDS = { wood: 'Wood block', beep: 'Beep', soft: 'Soft' };

  function $(id) { return document.getElementById(id); }
  function clampInt(v, a, b, d) { v = Math.round(+v); return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; }

  // a small note-value glyph (quarter, eighth, half, sixteenth, dotted), drawn in SVG
  function noteSVG(den, dots) {
    var hollow = den <= 2, flags = den >= 16 ? 2 : den >= 8 ? 1 : 0;
    var s = '<svg class="mr-note" viewBox="0 0 16 26" width="13" height="22" aria-hidden="true" focusable="false">';
    s += '<ellipse cx="5.6" cy="20.6" rx="4.4" ry="3.1" transform="rotate(-22 5.6 20.6)" ' + (hollow ? 'fill="none" stroke="currentColor" stroke-width="1.5"' : 'fill="currentColor"') + '/>';
    s += '<rect x="9" y="2" width="1.4" height="18.6" fill="currentColor"/>';
    for (var f = 0; f < flags; f++) s += '<path d="M10.4 ' + (2 + f * 5) + 'c0 3.5 4.6 4.6 4.6 9.2c0-3.2-2.4-4.6-4.6-5.4z" fill="currentColor"/>';
    if (dots) s += '<circle cx="14" cy="20.4" r="1.5" fill="currentColor"/>';
    return s + '</svg>';
  }

  function init() {
    var root = $('mr-met');
    if (!root) return;
    var reduced = ui.reduced();

    /* ---------- state ---------- */
    var sv = ui.store.get().met || {};
    var st = {
      bpm: clampInt(sv.bpm, 20, 300, 100),
      ts: PRESETS.indexOf(sv.ts) >= 0 || sv.ts === 'custom' ? sv.ts : '4/4',
      cnum: clampInt(sv.cnum, 1, 16, 5), cden: [2, 4, 8, 16].indexOf(sv.cden) >= 0 ? sv.cden : 4,
      pulse: sv.pulse === 'eighth' ? 'eighth' : 'beat',
      grouping: Array.isArray(sv.grouping) ? sv.grouping : null,
      sub: clampInt(sv.sub, 1, 6, 1),
      sound: SOUNDS[sv.sound] ? sv.sound : 'wood',
      vol: isFinite(sv.vol) ? Math.max(0, Math.min(1, sv.vol)) : 0.8,
      accents: Array.isArray(sv.accents) ? sv.accents : null, accKey: sv.accKey || '',
      tr: { on: false, step: clampInt(sv.trStep, 1, 20, 5), every: clampInt(sv.trEvery, 1, 16, 4), target: clampInt(sv.trTarget, 20, 300, 140) },
      si: { on: false, play: clampInt(sv.siPlay, 1, 8, 2), mute: clampInt(sv.siMute, 1, 8, 2), show: !!sv.siShow },
      check: false
    };
    var saveT = 0;
    function save() {
      clearTimeout(saveT);
      saveT = setTimeout(function () {
        ui.store.put('met', { bpm: st.bpm, ts: st.ts, cnum: st.cnum, cden: st.cden, pulse: st.pulse, grouping: st.grouping, sub: st.sub,
          sound: st.sound, vol: st.vol, accents: st.accents, accKey: st.accKey, trStep: st.tr.step, trEvery: st.tr.every, trTarget: st.tr.target,
          siPlay: st.si.play, siMute: st.si.mute, siShow: st.si.show });
      }, 300);
    }

    var M = null; // the current meter
    var live = { meter: null, accents: null, sub: 1, trainer: { on: false }, silent: { on: false } };
    var running = false, sched = null, src = null, bus = null, tick = null, vq = [], beatsLog = [], shownBpm = st.bpm;
    var dotState = [], lampHit = { t: -9, acc: false, silent: false }, lastBar = -1, barNow = 0, beatDur = 0.6;
    var tapper = new core.TapTempo();

    /* ---------- elements ---------- */
    var el = {
      bpm: $('met-bpm'), word: $('met-word'), wordM: $('met-word-m'), unit: $('met-unit'), dots: $('met-dots'), count: $('met-count'),
      status: $('met-status'), go: $('met-go'), goT: root.querySelector('#met-go .mr-go-t'), range: $('met-range'), num: $('met-num'),
      minus: $('met-minus'), plus: $('met-plus'), tap: $('met-tap'), lamp: $('met-lamp'), stage: $('met-stage'),
      ts: $('met-ts'), custom: $('met-custom'), cnum: $('met-cnum'), cden: $('met-cden'), groupRow: $('met-group-row'), group: $('met-group'),
      pulseRow: $('met-pulse-row'), pulse: $('met-pulse'), sub: $('met-sub'), sound: $('met-sound'), vol: $('met-vol'), volO: $('met-vol-o'),
      accReset: $('met-acc-reset'), trOn: $('met-tr-on'), trStep: $('met-tr-step'), trEvery: $('met-tr-every'), trTarget: $('met-tr-target'), trInfo: $('met-tr-info'),
      siOn: $('met-si-on'), siPlay: $('met-si-play'), siMute: $('met-si-mute'), siShow: $('met-si-show'), siInfo: $('met-si-info'),
      chkOn: $('met-chk-on'), chkBox: $('met-chk'), chkPad: $('met-chk-pad'), chkLast: $('met-chk-last'), chkStrip: $('met-chk-strip'), chkStats: $('met-chk-stats'),
      words: $('met-words')
    };

    function status(t) { el.status.textContent = t; }

    /* ---------- meter, accents, subdivisions ---------- */
    function computeMeter() {
      var n, d;
      if (st.ts === 'custom') { n = st.cnum; d = st.cden; } else { var p = st.ts.split('/'); n = +p[0]; d = +p[1]; }
      M = core.meter(n, d, { pulse: st.pulse, grouping: st.grouping });
      var key = M.num + '/' + M.den + ':' + M.pulses + ':' + M.groups.join('');
      if (st.accKey !== key || !st.accents || st.accents.length !== M.pulses) { st.accents = core.defaultAccents(M); st.accKey = key; }
      var subs = core.subdivisions(M), okSub = subs.some(function (s) { return s.n === st.sub; });
      if (!okSub) st.sub = 1;
      syncLive();
    }
    function syncLive() {
      live.meter = M; live.accents = st.accents; live.sub = st.sub;
      live.silent = { on: st.si.on, play: st.si.play, mute: st.si.mute };
      if (src) src.refresh();
    }
    function segButtons(box, items, cur, onPick) {
      box.innerHTML = '';
      items.forEach(function (it) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = it.label; b.setAttribute('aria-pressed', String(it.value === cur));
        if (it.aria) b.setAttribute('aria-label', it.aria);
        b.addEventListener('click', function () { onPick(it.value); });
        box.appendChild(b);
      });
    }
    function renderMeterControls() {
      segButtons(el.ts, PRESETS.map(function (p) { return { label: p, value: p, aria: 'Time signature ' + p }; }).concat([{ label: 'Custom', value: 'custom' }]), st.ts, function (v) {
        st.ts = v; st.grouping = null; refreshMeter();
      });
      el.custom.hidden = st.ts !== 'custom';
      el.cnum.value = st.cnum; el.cden.value = String(st.cden);
      // grouping choices for odd eighth-note bars
      var gs = M.eighthMode ? core.groupingsFor(M.num) : [];
      el.groupRow.hidden = gs.length < 2;
      if (gs.length >= 2) segButtons(el.group, gs.map(function (g) { return { label: g.join('+'), value: g.join('+'), aria: 'Group the eighths ' + g.join(' plus ') }; }), M.groups.join('+'), function (v) {
        st.grouping = v.split('+').map(Number); refreshMeter();
      });
      // compound meters: count the dotted-quarter beats or every eighth
      var compoundPossible = M.den >= 8 && M.num % 3 === 0 && M.num > 3;
      el.pulseRow.hidden = !compoundPossible;
      if (compoundPossible) {
        var big = noteSVG(M.den / 2, 1), small = noteSVG(M.den, 0);
        el.pulse.innerHTML = '';
        [{ v: 'beat', h: big + ' ' + (M.num / 3) + ' beats', a: 'Count ' + (M.num / 3) + ' dotted beats per bar' }, { v: 'eighth', h: small + ' ' + M.num + ' beats', a: 'Count all ' + M.num + ' eighth notes' }].forEach(function (o) {
          var b = document.createElement('button'); b.type = 'button'; b.innerHTML = o.h; b.setAttribute('aria-label', o.a);
          b.setAttribute('aria-pressed', String(st.pulse === o.v));
          b.addEventListener('click', function () { st.pulse = o.v; refreshMeter(); });
          el.pulse.appendChild(b);
        });
      }
      segButtons(el.sub, core.subdivisions(M).map(function (s) { return { label: s.label, value: s.n, aria: 'Subdivision: ' + s.label }; }), st.sub, function (v) {
        st.sub = v; syncLive(); renderMeterControls(); buildDots(); save();
      });
    }
    function refreshMeter() { computeMeter(); renderMeterControls(); buildDots(); showTempo(); save(); }

    function buildDots() {
      el.dots.innerHTML = ''; dotState = [];
      el.dots.classList.toggle('many', M.pulses > 6);
      el.dots.classList.toggle('lots', M.pulses > 9);
      for (var gi = 0; gi < M.groups.length; gi++) {
        var g = document.createElement('div'); g.className = 'mr-group';
        for (var k = 0; k < M.groups[gi]; k++) {
          var p = M.starts[gi] + k;
          var cell = document.createElement('div'); cell.className = 'mr-beat';
          var b = document.createElement('button'); b.type = 'button'; b.className = 'mr-dot'; b.dataset.p = p;
          b.innerHTML = '<span class="mr-glow"></span><span class="mr-dnum">' + (p + 1) + '</span>';
          b.addEventListener('click', onDot);
          cell.appendChild(b);
          var subs = document.createElement('div'); subs.className = 'mr-subs'; subs.setAttribute('aria-hidden', 'true');
          var sn = st.sub > 1 ? st.sub : 0;
          for (var s = 0; s < sn; s++) subs.appendChild(document.createElement('span'));
          cell.appendChild(subs);
          g.appendChild(cell);
          dotState[p] = { btn: b, glow: b.firstChild, subs: subs.children, t: -9, subT: [], lvl: 0, op: -1 };
        }
        el.dots.appendChild(g);
      }
      paintAccents();
    }
    function paintAccents() {
      for (var p = 0; p < dotState.length; p++) {
        var lv = st.accents[p];
        dotState[p].btn.dataset.l = lv;
        dotState[p].btn.setAttribute('aria-label', 'Beat ' + (p + 1) + ' of ' + M.pulses + ': ' + LEVEL_NAMES[lv] + '. Press to change.');
      }
    }
    function onDot(e) {
      var p = +e.currentTarget.dataset.p;
      st.accents = st.accents.slice();
      st.accents[p] = (st.accents[p] + 3) % 4; // accent → normal → soft → silent → accent
      syncLive(); paintAccents(); save();
      status('Beat ' + (p + 1) + ' is now ' + LEVEL_NAMES[st.accents[p]] + '.');
    }

    /* ---------- tempo ---------- */
    function showTempo() {
      var b = running ? shownBpm : st.bpm;
      el.bpm.textContent = b;
      var w = core.tempoWord(b);
      el.word.textContent = w.word; el.wordM.textContent = w.meaning;
      el.unit.innerHTML = noteSVG(M.unit.den, M.unit.dots) + '<span> = ' + b + '</span>';
      el.unit.setAttribute('aria-label', b + ' ' + noteName(M.unit) + ' per minute');
      if (el.words) {
        var rows = el.words.querySelectorAll('tr[data-w]');
        for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('on', rows[i].dataset.w === w.word);
      }
    }
    function noteName(u) {
      var n = { 2: 'half notes', 4: 'quarter notes', 8: 'eighth notes', 16: 'sixteenth notes' }[u.den] || 'beats';
      return u.dots ? 'dotted ' + n : n;
    }
    function setBpm(v, quiet) {
      v = clampInt(v, 20, 300, st.bpm);
      st.bpm = v; shownBpm = v;
      el.range.value = v; if (document.activeElement !== el.num) el.num.value = v;
      if (running) {
        if (st.tr.on) { live.trainer.start = v; live.trainer.fromBar = src.pulse === 0 && src.sub === 0 ? src.bar : src.bar + 1; src.refresh(); }
        sched.setTempo(v, S.ctx.currentTime);
      }
      showTempo(); save();
      if (!quiet) updateTrainerInfo();
    }

    /* ---------- running ---------- */
    function soundFor(ev) {
      var b = st.sound;
      if (ev.level === 0) return null;
      if (ev.isSub) return [b + '-sub', 0.36];
      if (ev.level === 3) return [b + '-acc', 1];
      if (ev.level === 2) return [b + '-beat', 0.74];
      return [b + '-beat', 0.42];
    }
    function onEvent(ev) {
      if (!ev.silent) { var s = soundFor(ev); if (s) S.play(s[0], ev.t, s[1], bus); }
      ev.bpmNow = sched.bpm;
      vq.push(ev); if (vq.length > 600) vq.splice(0, vq.length - 600);
      if (!ev.isSub) { beatsLog.push({ t: ev.t, silent: ev.silent, dur: 60 / sched.bpm }); if (beatsLog.length > 64) beatsLog.shift(); }
      api.events.push({ t: ev.t, ph: ev.ph, bar: ev.bar, pulse: ev.pulse, sub: ev.sub, level: ev.level, silent: ev.silent, bpm: sched.bpm, at: S.ctx.currentTime });
      if (api.events.length > 3000) api.events.splice(0, 1000);
    }
    function pump() {
      if (!running) return;
      sched.lookahead = document.hidden ? 1.0 : 0.1;
      sched.pump(S.ctx.currentTime);
    }
    function start() {
      var c = S.ensure();
      if (!c) { status('This browser cannot play sound, so the metronome cannot run here.'); return; }
      if (cal && cal.running()) cal.cancel();
      S.setVolume(st.vol);
      bus = S.newBus();
      syncLive();
      live.trainer = { on: st.tr.on, start: st.bpm, step: st.tr.step, every: st.tr.every, target: st.tr.target, fromBar: 0 };
      src = new core.MetronomeSource(function () { return live; });
      sched = new core.Scheduler({ lookahead: 0.1, onEvent: onEvent });
      vq = []; beatsLog = []; lastBar = -1; shownBpm = st.bpm;
      running = true;
      sched.start(src, c.currentTime + 0.12, st.bpm);
      pump();
      tick = S.ticker(pump);
      el.go.setAttribute('aria-pressed', 'true'); el.goT.textContent = 'Stop'; el.go.setAttribute('aria-label', 'Stop the metronome (space bar)');
      root.classList.add('mr-running');
      status('Playing. Press Stop or the space bar to stop.');
      requestAnimationFrame(frame);
    }
    function stop(msg) {
      if (!running) return;
      running = false;
      sched.stop(); tick.stop(); S.endBus(bus); vq = [];
      el.go.setAttribute('aria-pressed', 'false'); el.goT.textContent = 'Start'; el.go.setAttribute('aria-label', 'Start the metronome (space bar)');
      root.classList.remove('mr-running', 'mr-silent');
      for (var p = 0; p < dotState.length; p++) { dotState[p].t = -9; dotState[p].subT = []; }
      lampHit.t = -9; paint(0);
      el.count.textContent = '';
      var reached = shownBpm !== st.bpm && st.tr.on ? ' The speed trainer reached ' + shownBpm + ' BPM.' : '';
      shownBpm = st.bpm; showTempo(); updateTrainerInfo();
      status((msg || 'Stopped.') + reached);
    }
    function toggle() { if (running) stop(); else start(); }

    function showEvent(ev) {
      var d = dotState[ev.pulse];
      beatDur = 60 / ev.bpmNow;
      var visible = !ev.silent || st.si.show;
      if (ev.bpm && ev.bpm !== shownBpm) { shownBpm = ev.bpm; showTempo(); }
      if (!ev.isSub) {
        if (d && visible && ev.level > 0) { d.t = ev.t; d.lvl = ev.level; }
        if (visible && ev.level > 0) { lampHit.t = ev.t; lampHit.acc = ev.level === 3; }
        if (ev.pulse === 0) {
          barNow = ev.bar;
          root.classList.toggle('mr-silent', ev.silent);
          if (ev.bar !== lastBar) { lastBar = ev.bar; onBar(ev); }
        }
        el.count.textContent = 'Bar ' + (ev.bar + 1) + ' · beat ' + (ev.pulse + 1) + (ev.silent ? ' · silent' : '');
      } else if (d && visible && ev.level > 0) { d.subT[ev.sub] = ev.t; }
    }
    function onBar(ev) {
      if (st.tr.on) updateTrainerInfo(ev.bar);
      if (st.si.on) {
        var was = core.silentBar(ev.bar - 1, st.si.play, st.si.mute);
        if (ev.silent && !was) status('Silent bars: keep the beat going on your own.');
        else if (!ev.silent && was) status('The click is back. Were you still with it?');
      }
    }
    function updateTrainerInfo(bar) {
      if (!el.trInfo) return;
      if (!st.tr.on) { el.trInfo.textContent = ''; return; }
      if (!running) {
        var steps = Math.ceil(Math.abs(st.tr.target - st.bpm) / st.tr.step);
        el.trInfo.textContent = st.tr.target === st.bpm ? 'The target is the same as the tempo now: choose a faster (or slower) target.' :
          'From ' + st.bpm + ' to ' + st.tr.target + ' BPM in ' + steps + ' step' + (steps === 1 ? '' : 's') + ', about ' + (steps * st.tr.every) + ' bars.';
        return;
      }
      var tr = live.trainer, b = (bar == null ? barNow : bar) - (tr.fromBar || 0);
      var cur = core.trainerTempo(tr, b), left = st.tr.every - (b % st.tr.every);
      el.trInfo.textContent = cur === tr.target ? 'Target reached: ' + cur + ' BPM. Stay here as long as you like.' :
        'Now ' + cur + ' BPM. Next step (' + (tr.target > cur ? '+' : '−') + st.tr.step + ') in ' + left + ' bar' + (left === 1 ? '' : 's') + '. Target ' + tr.target + '.';
    }

    /* ---------- the calm pulse: glows follow the audio clock ---------- */
    function glowOf(t, now, dur) {
      var dt = now - t;
      if (dt < 0 || dt > 2) return 0;
      if (reduced) return dt < Math.min(0.16, dur * 0.5) ? 1 : 0;
      var tau = Math.min(0.22, dur * 0.32);
      return Math.exp(-dt / tau);
    }
    function paint(now) {
      for (var p = 0; p < dotState.length; p++) {
        var d = dotState[p], o = glowOf(d.t, now, beatDur);
        o = Math.round(o * 50) / 50;
        if (o !== d.op) { d.op = o; d.glow.style.opacity = o; d.btn.classList.toggle('lit', o > 0.35); }
        for (var s = 1; s < d.subs.length; s++) d.subs[s].classList.toggle('on', glowOf(d.subT[s] || -9, now, beatDur / st.sub) > 0.3);
        if (d.subs.length) d.subs[0].classList.toggle('on', o > 0.3);
      }
      var lo = glowOf(lampHit.t, now, beatDur);
      el.lamp.style.setProperty('--glow', (Math.round(lo * 50) / 50).toString());
      el.lamp.classList.toggle('acc', lampHit.acc);
    }
    function frame() {
      if (!running) return;
      var now = S.audible();
      while (vq.length && vq[0].t <= now) showEvent(vq.shift());
      paint(now);
      requestAnimationFrame(frame);
    }

    /* ---------- check my timing ---------- */
    var chk = { heard: [], silent: [], marks: [] };
    function checkTap(perfMs) {
      el.chkPad.classList.remove('hit'); void el.chkPad.offsetWidth; el.chkPad.classList.add('hit');
      if (!running) { el.chkLast.textContent = 'Start the metronome first, then tap along.'; return; }
      var t = S.audible(perfMs) - ui.calibOffset(), best = null, bd = Infinity;
      for (var i = 0; i < beatsLog.length; i++) { var d = t - beatsLog[i].t; if (Math.abs(d) < Math.abs(bd)) { bd = d; best = beatsLog[i]; } }
      if (!best || Math.abs(bd) > best.dur / 2) { el.chkLast.textContent = 'That tap was far from any beat.'; return; }
      var ms = bd * 1000, list = best.silent ? chk.silent : chk.heard;
      list.push(ms); if (list.length > 32) list.shift();
      chk.marks.push({ ms: ms, silent: best.silent }); if (chk.marks.length > 12) chk.marks.shift();
      el.chkLast.textContent = 'Last tap: ' + ui.fmtMs(ms) + (best.silent ? ' (in a silent bar)' : '');
      drawStrip(); statsText();
    }
    function avg(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
    function statsText() {
      var parts = [];
      if (chk.heard.length) parts.push('With the click: ' + ui.fmtMs(avg(chk.heard)) + ' on average (' + chk.heard.length + ' taps).');
      if (chk.silent.length) parts.push('In silent bars: ' + ui.fmtMs(avg(chk.silent)) + ' on average (' + chk.silent.length + ' taps).');
      el.chkStats.textContent = parts.join(' ');
    }
    function drawStrip() {
      var box = el.chkStrip.querySelector('.mr-strip-marks');
      box.innerHTML = '';
      chk.marks.forEach(function (m, i) {
        var x = Math.max(-150, Math.min(150, m.ms));
        var s = document.createElement('span');
        s.className = 'mr-mark' + (m.silent ? ' sil' : '') + (Math.abs(m.ms) <= 30 ? ' good' : '');
        s.style.left = (50 + x / 3) + '%';
        s.style.opacity = (0.25 + 0.75 * (i + 1) / chk.marks.length).toFixed(2);
        box.appendChild(s);
      });
    }

    /* ---------- wiring ---------- */
    el.go.addEventListener('click', toggle);
    el.range.addEventListener('input', function () { setBpm(el.range.value); });
    el.num.addEventListener('change', function () { setBpm(el.num.value); el.num.value = st.bpm; });
    el.num.addEventListener('keydown', function (e) { if (e.key === 'Enter') { setBpm(el.num.value); el.num.value = st.bpm; } });
    function holdRepeat(btn, delta) {
      var t1 = 0, t2 = 0;
      function end() { clearTimeout(t1); clearInterval(t2); }
      btn.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        e.preventDefault(); setBpm(st.bpm + delta);
        end(); t1 = setTimeout(function () { t2 = setInterval(function () { setBpm(st.bpm + delta); }, 70); }, 420);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { btn.addEventListener(n, end); });
      btn.addEventListener('click', function (e) { if (e.detail === 0) setBpm(st.bpm + delta); });
    }
    holdRepeat(el.minus, -1); holdRepeat(el.plus, 1);
    function doTap(perfMs) {
      var b = tapper.tap(perfMs / 1000);
      el.tap.classList.remove('hit'); void el.tap.offsetWidth; el.tap.classList.add('hit');
      if (b) { setBpm(b); status('Tap tempo: ' + b + ' BPM.'); } else status('Keep tapping at the speed you want…');
    }
    el.tap.addEventListener('pointerdown', function (e) { if (e.button) return; e.preventDefault(); doTap(e.timeStamp); });
    el.tap.addEventListener('click', function (e) { if (e.detail === 0) doTap(performance.now()); });
    el.cnum.addEventListener('change', function () { st.cnum = clampInt(el.cnum.value, 1, 16, st.cnum); el.cnum.value = st.cnum; st.grouping = null; refreshMeter(); });
    el.cden.addEventListener('change', function () { st.cden = +el.cden.value; st.grouping = null; refreshMeter(); });
    segButtons(el.sound, Object.keys(SOUNDS).map(function (k) { return { label: SOUNDS[k], value: k }; }), st.sound, pickSound);
    function pickSound(v) {
      st.sound = v; save();
      segButtons(el.sound, Object.keys(SOUNDS).map(function (k) { return { label: SOUNDS[k], value: k }; }), st.sound, pickSound);
      if (!running && S.ensure()) { S.setVolume(st.vol); S.play(v + '-acc', S.ctx.currentTime + 0.02, 1); S.play(v + '-beat', S.ctx.currentTime + 0.42, 0.74); }
    }
    el.vol.value = Math.round(st.vol * 100); el.volO.textContent = Math.round(st.vol * 100) + '%';
    el.vol.addEventListener('input', function () { st.vol = el.vol.value / 100; el.volO.textContent = el.vol.value + '%'; S.setVolume(st.vol); save(); });
    el.accReset.addEventListener('click', function () { st.accents = core.defaultAccents(M); syncLive(); paintAccents(); save(); status('Accents are back to the usual pattern.'); });

    function trSync() {
      st.tr.on = el.trOn.checked;
      st.tr.step = clampInt(el.trStep.value, 1, 20, st.tr.step); st.tr.every = clampInt(el.trEvery.value, 1, 16, st.tr.every); st.tr.target = clampInt(el.trTarget.value, 20, 300, st.tr.target);
      if (running) {
        var nb = src.pulse === 0 && src.sub === 0 ? src.bar : src.bar + 1;
        live.trainer = { on: st.tr.on, start: shownBpm, step: st.tr.step, every: st.tr.every, target: st.tr.target, fromBar: nb };
        src.refresh();
      }
      save(); updateTrainerInfo();
    }
    el.trStep.value = st.tr.step; el.trEvery.value = st.tr.every; el.trTarget.value = st.tr.target;
    [el.trOn, el.trStep, el.trEvery, el.trTarget].forEach(function (x) { x.addEventListener('change', trSync); });
    function siSync() {
      st.si.on = el.siOn.checked; st.si.show = el.siShow.checked;
      st.si.play = clampInt(el.siPlay.value, 1, 8, st.si.play); st.si.mute = clampInt(el.siMute.value, 1, 8, st.si.mute);
      el.siPlay.value = st.si.play; el.siMute.value = st.si.mute;
      syncLive(); save();
      el.siInfo.textContent = st.si.on ? 'It plays ' + st.si.play + ' bar' + (st.si.play === 1 ? '' : 's') + ', then stays quiet for ' + st.si.mute + '. Keep counting through the quiet.' : '';
    }
    el.siPlay.value = st.si.play; el.siMute.value = st.si.mute; el.siShow.checked = st.si.show;
    [el.siOn, el.siPlay, el.siMute, el.siShow].forEach(function (x) { x.addEventListener('change', siSync); });
    el.chkOn.addEventListener('change', function () {
      st.check = el.chkOn.checked; el.chkBox.hidden = !st.check;
      if (st.check) { chk = { heard: [], silent: [], marks: [] }; drawStrip(); el.chkStats.textContent = ''; el.chkLast.textContent = 'Tap the pad (or press J) on every beat.'; }
    });
    el.chkPad.addEventListener('pointerdown', function (e) { if (e.button) return; e.preventDefault(); checkTap(e.timeStamp); });
    el.chkPad.addEventListener('click', function (e) { if (e.detail === 0) checkTap(performance.now()); });

    // keyboard
    var swallowUp = false;
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (cal && cal.running()) return;
      if (e.key === 'Escape') { if (running) { stop(); e.preventDefault(); } return; }
      if (ui.isTyping(e)) return;
      var tag = e.target && e.target.tagName;
      if (e.key === ' ' || e.code === 'Space') {
        if (e.repeat) { e.preventDefault(); return; }
        e.preventDefault(); swallowUp = true; toggle(); return;
      }
      if (tag === 'INPUT') return; // a slider uses its own arrow keys
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setBpm(st.bpm + (e.shiftKey ? 10 : 1)); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setBpm(st.bpm - (e.shiftKey ? 10 : 1)); return; }
      if (e.repeat) return;
      var k = e.key.toLowerCase();
      if (k === 't') { doTap(e.timeStamp); return; }
      if ((k === 'j' || k === 'f') && st.check) { checkTap(e.timeStamp); }
    });
    document.addEventListener('keyup', function (e) { if (swallowUp && (e.key === ' ' || e.code === 'Space')) { e.preventDefault(); swallowUp = false; } });
    document.addEventListener('visibilitychange', pump);

    // tempo words table
    if (el.words) {
      var tb = el.words.querySelector('tbody'), main = ['Largo', 'Adagio', 'Andante', 'Moderato', 'Allegro', 'Presto'];
      core.TEMPO_WORDS.forEach(function (w, i) {
        var tr = document.createElement('tr'); tr.dataset.w = w.word;
        var range = i === 0 ? 'under 25' : i === core.TEMPO_WORDS.length - 1 ? w.from + ' and up' : w.from + '–' + (w.to + 1);
        tr.innerHTML = '<td>' + (main.indexOf(w.word) >= 0 ? '<b>' + w.word + '</b>' : w.word) + '</td><td>' + w.meaning + '</td><td class="mr-tn">' + range + '</td>' +
          '<td><button type="button" class="mus-btn mr-try" data-b="' + Math.min(300, Math.max(20, Math.round((Math.max(w.from, 20) + Math.min(w.to + 1, 300)) / 2))) + '" aria-label="Set the tempo to the middle of ' + w.word + '">Try</button></td>';
        tb.appendChild(tr);
      });
      el.words.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-b]'); if (!b) return;
        setBpm(+b.dataset.b); status(core.tempoWord(st.bpm).word + ': ' + st.bpm + ' BPM.');
      });
    }

    var cal = ui.calibrator($('met-cal'), { before: function () { stop(); } });

    computeMeter(); renderMeterControls(); buildDots();
    setBpm(st.bpm, true);
    trSync(); siSync();
    status('Press Start or the space bar.');

    var api = R.met = {
      events: [], state: st, live: live,
      start: start, stop: stop, toggle: toggle, setBpm: setBpm,
      running: function () { return running; }, scheduler: function () { return sched; }, meter: function () { return M; }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
