/* Debate timer page (layouts/debate/timer.html). Logic in timer-core.js; saved state in TRBDebate part "timer". */
(function () {
  'use strict';
  var D = window.TRBDebate, T = window.DebateTimerCore, $ = D.$, esc = D.esc;
  var root = $('#dbt');
  if (!root || !T) return;

  var formats = T.normalizeAll(D.json('db-formats') || []);
  var raw = D.json('db-formats') || [];
  var urls = {}, rawBy = {}; raw.forEach(function (r) { urls[String(r.key)] = r.url; rawBy[String(r.key)] = r; });
  var st = D.part('timer', {});
  st.times = st.times || {}; st.snap = st.snap || {};
  if (!st.warn) st.warn = [60, 30];
  if (st.sound == null) st.sound = true;
  if (st.vib == null) st.vib = true;

  var el = {
    fmt: $('#dbt-fmt'), swap: $('#dbt-swap'), swapW: $('#dbt-swap-w'), swapT: $('#dbt-swap-t'), cyc: $('#dbt-cyc'), cycW: $('#dbt-cyc-w'), note: $('#dbt-fmt-note'),
    stage: $('#dbt-stage'), side: $('#dbt-side'), name: $('#dbt-name'), mode: $('#dbt-mode'), clock: $('#dbt-clock'), time: $('#dbt-time'), hand: $('#dbt-hand'),
    bar: $('#dbt-bar'), poi: $('#dbt-poi'), next: $('#dbt-next'), go: $('#dbt-go'), prev: $('#dbt-prev'), nextb: $('#dbt-nextb'), minus: $('#dbt-minus'), plus: $('#dbt-plus'),
    reset: $('#dbt-reset'), handb: $('#dbt-handb'), sound: $('#dbt-sound'), full: $('#dbt-full'), banks: $('#dbt-banks'), live: $('#dbt-live'),
    order: $('#dbt-order'), src: $('#dbt-src'), warns: $('#dbt-warns'), vib: $('#dbt-vib'), times: $('#dbt-times'), timesReset: $('#dbt-times-reset')
  };

  var fmt = null, plan = null, round = null, raf = 0, iv = 0, lastSig = '', wake = null;

  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function fmtByKey(k) { for (var i = 0; i < formats.length; i++) if (formats[i].key === k) return formats[i]; return formats[0]; }

  /* ---------- setting up a round ---------- */
  function choose(key, keepSnap) {
    stop();
    fmt = fmtByKey(key);
    if (!fmt) return;
    st.fmt = fmt.key;
    el.fmt.value = fmt.key;
    el.swapW.hidden = !(fmt.coin && fmt.sides.length === 2);
    el.swap.value = (st.first && st.first[fmt.key]) || '';
    el.cycW.hidden = !fmt.cycle;
    el.cyc.value = (st.cycles && st.cycles[fmt.key]) || 12;
    build(keepSnap);
    renderTimes();
    D.save();
  }
  function build(keepSnap) {
    plan = T.buildPlan(fmt, { names: names(), times: st.times[fmt.key], cycles: +el.cyc.value || 12, prep: st.prepOv ? st.prepOv[fmt.key] : null });
    round = new T.Round(plan, { warn: st.warn });
    if (keepSnap && st.snap[fmt.key]) round.restore(st.snap[fmt.key]);
    var tot = T.totalSeconds(plan);
    var bits = [];
    if (!fmt.cycle) bits.push(plan.segs.length + ' speeches and periods, ' + Math.round(tot / 60) + ' minutes of speaking');
    else bits.push('Each speech is followed by questioning; ' + (+el.cyc.value || 12) + ' speeches are set up');
    if (plan.prepPer === 'side') bits.push(T.clock(plan.prep) + ' prep for each side');
    if (plan.prepPer === 'round') bits.push(T.clock(plan.prep) + ' prep before the round');
    el.note.textContent = bits.join(' · ') + '.';
    var u = urls[fmt.key];
    var r = rawBy[fmt.key] || {}, notes = [];
    if (r.sample && r.speechesNote) notes.push(esc(r.speechesNote));
    if (r.sidesNote) notes.push(esc(r.sidesNote));
    if (r.repeat && r.repeat.note) notes.push(esc(r.repeat.note));
    if (r.grace && r.grace.note) notes.push(esc(r.grace.note));
    if (r.prep && r.prep.note) notes.push('<b>Prep:</b> ' + esc(r.prep.note));
    if (r.poi && r.poi.note) notes.push('<b>Points of information:</b> ' + esc(r.poi.note));
    el.src.innerHTML = notes.map(function (n) { return n + ' '; }).join('') + (u ? '<br>' + (r.sample ? 'More about this format' : 'Times follow the published rules') + ' on the <a href="' + esc(u) + '">' + esc(fmt.name) + ' page</a>, where the sources are listed. Your league may differ: change times under “Warnings and times.”' : '');
    renderOrder();
    renderBanks();
    lastSig = '';
    draw();
  }
  // coin-flip formats (Public Forum): which side the first-speaking team argues
  function names() {
    var v = fmt.coin && fmt.sides.length === 2 ? el.swap.value : '';
    if (!v) return null;
    var o = {}; o[fmt.sides[0].id] = v === 'pro' ? 'Pro' : 'Con'; o[fmt.sides[1].id] = v === 'pro' ? 'Con' : 'Pro';
    return o;
  }
  function snap() { if (fmt && round) { st.snap[fmt.key] = round.snapshot(); D.save(); } }

  /* ---------- drawing ---------- */
  function isCx(s) { return /cross/.test(s.kind || ''); }
  function sideClass(id) {
    var i = -1;
    plan.sides.forEach(function (s, j) { if (s.id === id) i = j; });
    return i >= 0 ? 'dbx-s' + i : 'dbx-sx';
  }
  function renderOrder() {
    var h = '';
    plan.segs.forEach(function (s, i) {
      var who = T.who(plan.view, s);
      h += '<li><button type="button" class="dbt-oi ' + sideClass(isCx(s) && s.asker ? s.asker : s.side) + '" data-i="' + i + '">' +
        '<span class="dbt-os">' + esc(s.short) + '</span><span class="dbt-on">' + esc(s.name) + (who ? ' <small>' + esc(who) + '</small>' : '') + '</span>' +
        '<span class="dbt-ot">' + T.clock(s.sec) + (s.sec !== s.base ? ' <small title="changed from ' + T.clock(s.base) + '">*</small>' : '') + '</span></button></li>';
    });
    el.order.innerHTML = h;
  }
  function renderBanks() {
    var h = '';
    if (plan.prepPer === 'side') {
      plan.sides.forEach(function (s, j) {
        if (!(s.id in plan.banks)) return;
        h += '<button type="button" class="dbt-bank ' + sideClass(s.id) + '" data-side="' + esc(s.id) + '" aria-pressed="false"><span class="dbt-bn">' + esc(s.name) + ' prep <kbd>' + (j + 1) + '</kbd></span><span class="dbt-bt" data-bt="' + esc(s.id) + '"></span></button>';
      });
    } else if (plan.prepPer === 'round') {
      h += '<button type="button" class="dbt-bank dbx-sx" data-round="1" aria-pressed="false"><span class="dbt-bn">Prep before the round</span><span class="dbt-bt" data-bt="_round"></span></button>';
    }
    el.banks.innerHTML = h;
    el.banks.hidden = !h;
  }
  function draw() {
    if (!round) return;
    var s = round.seg();
    var shown = round.shown();
    var inPrep = round.running === 'prep' || round.running === 'round';
    var total = inPrep ? (plan.prep || 1) : (s ? s.sec || 1 : 1);
    el.time.textContent = T.clock(shown);
    var pct = Math.max(0, Math.min(1, 1 - shown / total));
    el.bar.style.width = (pct * 100).toFixed(1) + '%';
    var lvl = shown <= 0 ? 'over' : (shown <= 30 ? 'close' : (shown <= 60 ? 'warn' : ''));
    el.stage.dataset.level = lvl;
    el.stage.dataset.state = round.running || 'paused';
    if (inPrep) {
      el.side.textContent = round.running === 'round' ? 'Prep' : T.sideName(plan.view, round.prepSide);
      el.side.className = 'dbt-side ' + (round.running === 'round' ? 'dbx-sx' : sideClass(round.prepSide));
      el.name.textContent = round.running === 'round' ? 'Prep before the round' : 'Prep time';
      el.mode.textContent = 'Speech clock paused at ' + T.clock(round.leftMs / 1000);
    } else if (s) {
      el.side.textContent = T.who(plan.view, s);
      el.side.className = 'dbt-side ' + sideClass(isCx(s) && s.asker ? s.asker : s.side);
      el.name.textContent = s.name;
      el.mode.textContent = (round.i + 1) + ' of ' + plan.segs.length;
    }
    var n = plan.segs[round.i + 1];
    el.next.textContent = n ? 'Next: ' + n.name + ' (' + T.clock(n.sec) + ')' : 'Last speech of the round';
    // points of information
    var p = inPrep ? null : round.poiState();
    el.poi.hidden = !p;
    if (p) {
      el.poi.textContent = p === 'open' ? 'Points of information may be offered' : (p === 'protected' ? 'Protected time: no points of information' : 'Time');
      el.poi.dataset.state = p;
    }
    // buttons
    var running = round.running === 'speech';
    el.go.innerHTML = running ? '⏸ Pause' : (s && round.leftMs !== s.sec * 1000 ? '▶ Resume' : '▶ Start');
    el.go.setAttribute('aria-label', running ? 'Pause' : 'Start');
    el.clock.setAttribute('aria-label', (running ? 'Pause. ' : 'Start. ') + T.spoken(shown) + ' left');
    el.prev.disabled = round.i === 0;
    el.nextb.disabled = round.i >= plan.segs.length - 1;
    // banks
    Array.prototype.forEach.call(el.banks.querySelectorAll('[data-bt]'), function (b) {
      var k = b.dataset.bt;
      var v = k === '_round' ? round.roundPrepMs / 1000 : round.bankMs[k] / 1000;
      b.textContent = T.clock(v);
      var btn = b.parentNode;
      var on = (k === '_round' && round.running === 'round') || (round.running === 'prep' && round.prepSide === k);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('is-low', v <= 30);
    });
    // order list
    Array.prototype.forEach.call(el.order.querySelectorAll('.dbt-oi'), function (b) {
      var i = +b.dataset.i;
      b.classList.toggle('is-now', i === round.i);
      b.classList.toggle('is-done', !!round.done[i] && i !== round.i);
      if (i === round.i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    // hand signals
    var handOn = !!st.hand;
    el.hand.hidden = !handOn;
    el.stage.classList.toggle('is-hand', handOn);
    if (handOn) {
      var sig = T.handSignal(shown);
      var key = sig.fingers + '|' + sig.half + '|' + sig.fist;
      if (key !== lastSig) {
        lastSig = key;
        el.hand.innerHTML = window.DebateHand ? window.DebateHand.svg(sig) + '<span class="dbt-hl">' + esc(sig.label) + '</span>' : esc(sig.label);
      }
    }
  }

  /* ---------- running ---------- */
  function loop() {
    raf = 0;
    if (!round || !round.running) return;
    handle(round.tick(now()));
    draw();
    raf = requestAnimationFrame(loop);
  }
  function startLoop() {
    if (!raf) raf = requestAnimationFrame(loop);
    // rAF sleeps in background tabs; this keeps warnings coming
    if (!iv) iv = setInterval(function () { if (round && round.running) { handle(round.tick(now())); draw(); } }, 250);
    lockScreen(true);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf); raf = 0;
    if (iv) clearInterval(iv); iv = 0;
    lockScreen(false);
  }
  function after(ev) {
    handle(ev);
    if (round.running) startLoop(); else stop();
    snap();
    draw();
  }
  function handle(ev) {
    (ev || []).forEach(function (e) {
      if (e.type === 'warn') { beep(1); buzz([120]); flash('warn'); announce(T.spoken(e.at) + ' left' + (e.prep ? ' of prep' : '')); }
      else if (e.type === 'zero') { beep(3); buzz([200, 100, 200, 100, 200]); flash('over'); announce(e.prep ? 'Prep time is used up' : 'Time'); }
    });
  }
  function announce(t) { el.live.textContent = ''; setTimeout(function () { el.live.textContent = t; }, 30); }
  function flash(kind) {
    el.stage.classList.remove('flash-warn', 'flash-over');
    void el.stage.offsetWidth;
    el.stage.classList.add('flash-' + kind);
    setTimeout(function () { el.stage.classList.remove('flash-' + kind); }, 1300);
  }
  var ac = null;
  function audio() {
    if (ac) return ac;
    try { var A = window.AudioContext || window.webkitAudioContext; if (A) ac = new A(); } catch (e) { ac = null; }
    return ac;
  }
  function beep(n) {
    if (!st.sound) return;
    var a = audio(); if (!a) return;
    try {
      if (a.state === 'suspended') a.resume();
      for (var i = 0; i < n; i++) {
        var o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + i * 0.28;
        o.type = 'sine'; o.frequency.value = n > 1 ? 660 : 880;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
        o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + 0.22);
      }
    } catch (e) { }
  }
  function buzz(p) { if (st.vib && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { } } }
  function lockScreen(on) {
    try {
      if (on && !wake && navigator.wakeLock && document.visibilityState === 'visible') navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }).catch(function () { });
      else if (!on && wake) { wake.release(); wake = null; }
    } catch (e) { }
  }

  /* ---------- actions ---------- */
  function act(name, arg) {
    if (!round) return;
    var t = now();
    if (name !== 'toggle') audio(); // unlock sound on any tap
    var ev = [];
    switch (name) {
      case 'toggle': audio(); ev = round.toggle(t); break;
      case 'next': ev = round.next(t); lastSig = ''; break;
      case 'prev': ev = round.prev(t); lastSig = ''; break;
      case 'reset': ev = round.reset(t); lastSig = ''; break;
      case 'plus': ev = round.adjust(10, t); break;
      case 'minus': ev = round.adjust(-10, t); break;
      case 'go': ev = round.go(arg, t); lastSig = ''; break;
      case 'prep': ev = round.prep(arg, t); lastSig = ''; break;
      case 'round': ev = round.roundPrep(t); lastSig = ''; break;
    }
    after(ev);
  }
  function setHand(on) { st.hand = on; el.handb.setAttribute('aria-pressed', on ? 'true' : 'false'); lastSig = ''; D.save(); draw(); }
  function setSound(on) { st.sound = on; el.sound.setAttribute('aria-pressed', on ? 'true' : 'false'); el.sound.textContent = on ? '🔔 Sound on' : '🔕 Sound off'; D.save(); }
  function setFull(on) {
    el.stage.classList.toggle('is-full', on);
    document.documentElement.classList.toggle('dbt-noscroll', on);
    el.full.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.full.textContent = on ? '✕ Leave full screen' : '⛶ Full screen';
    try {
      if (on && el.stage.requestFullscreen && !document.fullscreenElement) el.stage.requestFullscreen().catch(function () { });
      else if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () { });
    } catch (e) { }
  }
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && el.stage.classList.contains('is-full')) setFull(false); });

  el.go.addEventListener('click', function () { act('toggle'); });
  el.clock.addEventListener('click', function () { if (!swiped) act('toggle'); });
  el.prev.addEventListener('click', function () { act('prev'); });
  el.nextb.addEventListener('click', function () { act('next'); });
  el.reset.addEventListener('click', function () { act('reset'); });
  el.plus.addEventListener('click', function () { act('plus'); });
  el.minus.addEventListener('click', function () { act('minus'); });
  el.handb.addEventListener('click', function () { setHand(!st.hand); });
  el.sound.addEventListener('click', function () { setSound(!st.sound); if (st.sound) beep(1); });
  el.full.addEventListener('click', function () { setFull(!el.stage.classList.contains('is-full')); });
  el.order.addEventListener('click', function (e) { var b = e.target.closest('.dbt-oi'); if (b) act('go', +b.dataset.i); });
  el.banks.addEventListener('click', function (e) {
    var b = e.target.closest('.dbt-bank'); if (!b) return;
    if (b.dataset.round) act('round'); else act('prep', b.dataset.side);
  });
  el.fmt.addEventListener('change', function () { snap(); choose(el.fmt.value, true); });
  el.swap.addEventListener('change', function () { st.first = st.first || {}; st.first[fmt.key] = el.swap.value; stop(); build(true); D.save(); });
  el.cyc.addEventListener('change', function () { var n = Math.max(1, Math.min(60, Math.round(+el.cyc.value) || 12)); el.cyc.value = n; st.cycles = st.cycles || {}; st.cycles[fmt.key] = n; stop(); build(true); D.save(); });

  // swipe on the clock area: left = next, right = back
  var sx = null, sy = null, swiped = false;
  el.stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; swiped = false; });
  el.stage.addEventListener('pointerup', function (e) {
    if (sx == null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; act(dx < 0 ? 'next' : 'prev'); setTimeout(function () { swiped = false; }, 400); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    var k = e.key;
    if (k === ' ' || k === 'Spacebar') { if (tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY') return; e.preventDefault(); act('toggle'); }
    else if (k === 'ArrowRight' || k === 'n' || k === 'N') { e.preventDefault(); act('next'); }
    else if (k === 'ArrowLeft' || k === 'p' || k === 'P') { e.preventDefault(); act('prev'); }
    else if (k === 'r' || k === 'R') act('reset');
    else if (k === '+' || k === '=') act('plus');
    else if (k === '-' || k === '_' || k === '−') act('minus');
    else if (k === 'h' || k === 'H') setHand(!st.hand);
    else if (k === 'm' || k === 'M') setSound(!st.sound);
    else if (k === 'f' || k === 'F') setFull(!el.stage.classList.contains('is-full'));
    else if (k === 'Escape' && el.stage.classList.contains('is-full')) setFull(false);
    else if (/^[1-4]$/.test(k)) {
      if (plan.prepPer === 'side') { var s = plan.sides[+k - 1]; if (s && s.id in plan.banks) act('prep', s.id); }
      else if (plan.prepPer === 'round' && k === '1') act('round');
    }
  });

  /* ---------- settings ---------- */
  Array.prototype.forEach.call(el.warns.querySelectorAll('input'), function (c) {
    c.checked = st.warn.indexOf(+c.value) >= 0;
    c.addEventListener('change', function () {
      st.warn = Array.prototype.filter.call(el.warns.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return +x.value; });
      round.warn = st.warn.slice().sort(function (a, b) { return b - a; });
      D.save();
    });
  });
  el.vib.checked = !!st.vib;
  el.vib.addEventListener('change', function () { st.vib = el.vib.checked; D.save(); });

  function renderTimes() {
    var h = '<table class="dbt-tt"><thead><tr><th scope="col">Speech</th><th scope="col">Time</th></tr></thead><tbody>';
    var ov = st.times[fmt.key] || {};
    fmt.speeches.forEach(function (s, i) {
      var v = ov[i] != null ? ov[i] : s.sec;
      h += '<tr><td><b>' + esc(s.short) + '</b> ' + esc(s.name) + '</td><td><input type="text" inputmode="numeric" class="dbt-ti" data-i="' + i + '" value="' + T.clock(v) + '" aria-label="Time for ' + esc(s.name) + ' (minutes:seconds)"></td></tr>';
    });
    if (fmt.prep.per !== 'none') {
      var pv = st.prepOv && st.prepOv[fmt.key] != null ? st.prepOv[fmt.key] : fmt.prep.sec;
      h += '<tr><td><b>Prep</b> ' + (fmt.prep.per === 'side' ? 'for each side' : 'before the round') + '</td><td><input type="text" inputmode="numeric" class="dbt-ti" data-i="prep" value="' + T.clock(pv) + '" aria-label="Prep time (minutes:seconds)"></td></tr>';
    }
    h += '</tbody></table>';
    el.times.innerHTML = h;
  }
  el.times.addEventListener('change', function (e) {
    var inp = e.target.closest('.dbt-ti'); if (!inp) return;
    var sec = T.parseClock(inp.value);
    if (!(sec >= 0) || sec > 3 * 3600) { inp.value = '0:00'; return; }
    if (inp.dataset.i === 'prep') { st.prepOv = st.prepOv || {}; st.prepOv[fmt.key] = sec; }
    else { st.times[fmt.key] = st.times[fmt.key] || {}; st.times[fmt.key][inp.dataset.i] = sec; }
    inp.value = T.clock(sec);
    delete st.snap[fmt.key];
    stop(); build(false); D.save();
  });
  el.timesReset.addEventListener('click', function () {
    delete st.times[fmt.key]; if (st.prepOv) delete st.prepOv[fmt.key]; delete st.snap[fmt.key];
    stop(); build(false); renderTimes(); D.save();
  });
  window.addEventListener('pagehide', snap);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') snap(); else if (round && round.running) lockScreen(true); });

  if (!formats.length) { el.name.textContent = 'No formats found'; return; }
  setSound(!!st.sound); setHand(!!st.hand);
  var want = (location.hash || '').slice(1);
  choose(formats.some(function (f) { return f.key === want; }) ? want : (st.fmt || formats[0].key), true);
  // test hook
  window.__dbt = { round: function () { return round; }, plan: function () { return plan; }, act: act };
})();
