/* TRBMusic.rhythm.ui: small pieces shared by the metronome and the rhythm trainer pages.

   API
     store.get()                 the saved object {v:1, best:{}, calib:{ms, spread, n, at}, met:{}, tr:{}} (never throws)
     store.put(key, value)       save one top-level field (localStorage key 'trb-music-rhythm-v1', wrapped in try/catch)
     calibOffset()               the saved latency correction in seconds (0 when not measured)
     calibrator(el, opts)        renders the "measure my delay" tool into el; opts.before() is called first (stop the page's
                                 own sound), opts.onChange(ms) after a new value is saved. Returns {refresh()}.
     isTyping(e)                 true when a key event belongs to a text field, a checkbox or a select (shortcuts leave it alone)
     reduced()                   prefers-reduced-motion
     fmtMs(ms)                   "12 ms late" / "8 ms early" / "on the beat"
*/
(function (root) {
  'use strict';
  var R = root.TRBMusic.rhythm, core = R.core, S = R.sound;
  var KEY = 'trb-music-rhythm-v1';
  var cache = null;

  var store = {
    get: function () {
      if (cache) return cache;
      var o = null;
      try { o = JSON.parse(root.localStorage.getItem(KEY) || 'null'); } catch (e) { o = null; }
      if (!o || typeof o !== 'object' || o.v !== 1) o = { v: 1 };
      if (!o.best || typeof o.best !== 'object') o.best = {};
      cache = o; return o;
    },
    put: function (k, v) {
      var o = store.get(); o[k] = v;
      try { root.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage blocked: keep it for this visit */ }
    }
  };
  function calibOffset() { var c = store.get().calib; return c && isFinite(c.ms) ? c.ms / 1000 : 0; }
  function reduced() { try { return root.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function isTyping(e) {
    var t = e.target, tag = t && t.tagName;
    if (!tag) return false;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return true;
    if (tag === 'INPUT') { var ty = (t.type || '').toLowerCase(); return ty !== 'range' && ty !== 'button'; }
    return false;
  }
  function fmtMs(ms) {
    var a = Math.round(Math.abs(ms));
    if (a < 3) return 'on the beat';
    return a + ' ms ' + (ms < 0 ? 'early' : 'late');
  }
  function h(tag, attrs, html) {
    var e = root.document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------- the latency calibrator ----------
     16 clicks at 100 BPM. The learner taps along (the big button, or any letter key or Space). Taps near the first
     four clicks are ignored; the median of the rest is the offset, the spread says how steady the taps were. */
  var N_CLICKS = 16, CAL_BPM = 100;
  function calibrator(el, opts) {
    opts = opts || {};
    el.innerHTML =
      '<p class="mr-cal-now">Correction now: <b data-c="val">0 ms</b> <span class="mus-small" data-c="when"></span></p>' +
      '<div class="mr-row"><button type="button" class="mus-btn pri" data-c="go">Measure my delay</button>' +
      '<button type="button" class="mus-btn" data-c="zero">Set to zero</button></div>' +
      '<div class="mr-cal-run" data-c="run" hidden>' +
      '<p class="mr-cal-msg" data-c="msg" aria-live="polite">Listen to four clicks, then tap along with the rest.</p>' +
      '<div class="mr-cal-dots" data-c="dots" aria-hidden="true"></div>' +
      '<button type="button" class="mr-cal-pad" data-c="pad" aria-label="Tap here with the clicks (or press any letter key)">Tap with the clicks</button>' +
      '<button type="button" class="mus-btn" data-c="cancel">Cancel</button></div>' +
      '<p class="mr-cal-res" data-c="res" aria-live="polite"></p>';
    function q(n) { return el.querySelector('[data-c="' + n + '"]'); }
    var dotsEl = q('dots'), pad = q('pad'), res = q('res'), msg = q('msg');
    for (var i = 0; i < N_CLICKS; i++) dotsEl.appendChild(h('span', { class: i < 4 ? 'lead' : '' }));
    var dots = dotsEl.children;
    var run = null;

    function show() {
      var c = store.get().calib;
      q('val').textContent = c && c.ms ? Math.round(c.ms) + ' ms' : '0 ms';
      q('when').textContent = c && c.ms ? '(your taps usually land ' + fmtMs(c.ms) + '; scores subtract it)' : '(not measured yet)';
    }
    function finish(cancelled) {
      if (!run) return;
      var r = run; run = null;
      r.tick.stop(); S.endBus(r.bus);
      root.removeEventListener('keydown', onKey, true);
      q('run').hidden = true; q('go').disabled = false;
      for (var i = 0; i < dots.length; i++) dots[i].className = i < 4 ? 'lead' : '';
      if (cancelled) { res.textContent = 'Stopped. Nothing was changed.'; return; }
      var cal = core.calibrate(r.taps, r.clicks, 4);
      if (!cal) { res.textContent = 'Not enough taps landed near the clicks. Try again, and tap along from the fifth click to the end.'; return; }
      var ms = Math.round(cal.offset * 1000), sp = Math.round(cal.spread * 1000);
      if (sp > 70) { res.textContent = 'Your taps varied a lot (about ±' + sp + ' ms), so the result would not be reliable. Try again, tapping as evenly as you can.'; return; }
      if (Math.abs(ms) > 500) { res.textContent = 'That came out at ' + ms + ' ms, which is more than half a second. Try again.'; return; }
      store.put('calib', { ms: ms, spread: sp, n: cal.n, at: new Date().toISOString().slice(0, 10) });
      res.textContent = 'Done. Your taps landed ' + fmtMs(ms) + ' on average (steady to about ±' + sp + ' ms, from ' + cal.n + ' taps). Scores now subtract ' + ms + ' ms.';
      show();
      if (opts.onChange) opts.onChange(ms);
    }
    function tap(perfMs) {
      if (!run) return;
      run.taps.push(S.audible(perfMs));
      pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit');
    }
    function onKey(e) {
      if (!run) return;
      if (e.key === 'Escape') { e.preventDefault(); finish(true); return; }
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === ' ' || /^[a-z]$/i.test(e.key) || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); tap(e.timeStamp); }
    }
    function frame() {
      if (!run) return;
      var now = S.audible(), k = 0;
      while (k < run.clicks.length && run.clicks[k] <= now) k++;
      for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i < k);
      if (k >= 4 && !run.said) { run.said = true; msg.textContent = 'Now tap along with every click.'; }
      if (now > run.clicks[run.clicks.length - 1] + 0.6) { finish(false); return; }
      root.requestAnimationFrame(frame);
    }
    q('go').addEventListener('click', function () {
      if (opts.before) opts.before();
      var c = S.ensure();
      if (!c) { res.textContent = 'This browser cannot play sound, so the delay cannot be measured here.'; return; }
      var bus = S.newBus(), t0 = c.currentTime + 0.5, clicks = [];
      for (var i = 0; i < N_CLICKS; i++) { var t = t0 + i * 60 / CAL_BPM; clicks.push(t); S.play(i < 4 ? 'count-hi' : 'count', t, 0.8, bus); }
      run = { bus: bus, clicks: clicks, taps: [], tick: { stop: function () {} }, said: false };
      q('run').hidden = false; q('go').disabled = true; res.textContent = '';
      msg.textContent = 'Listen to four clicks, then tap along with the rest.';
      root.addEventListener('keydown', onKey, true);
      root.requestAnimationFrame(frame);
      pad.focus({ preventScroll: true });
    });
    pad.addEventListener('pointerdown', function (e) { e.preventDefault(); tap(e.timeStamp); });
    q('cancel').addEventListener('click', function () { finish(true); });
    q('zero').addEventListener('click', function () {
      store.put('calib', { ms: 0, spread: 0, n: 0, at: new Date().toISOString().slice(0, 10) });
      res.textContent = 'The correction is back to zero.'; show();
      if (opts.onChange) opts.onChange(0);
    });
    show();
    return { refresh: show, running: function () { return !!run; }, cancel: function () { finish(true); } };
  }

  R.ui = { store: store, calibOffset: calibOffset, calibrator: calibrator, isTyping: isTyping, reduced: reduced, fmtMs: fmtMs, h: h, KEY: KEY };
})(window);
