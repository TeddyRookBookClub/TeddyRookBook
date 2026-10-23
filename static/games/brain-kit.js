/* Brain games kit: shared helpers for Mosaic Memory, Coin Match and Numbers in Order.
   - storage under localStorage "trb-brain-v1": one entry per game slug, {best, level, plays, sessions:[{t,score,level,...}]}
     (last 30). Every write re-reads the whole object and changes only this game's entry, so games never overwrite each other.
   - level helpers (pure, tested in node), a tiny synthesized sound kit (off until switched on), an SVG progress chart,
     and a pause overlay. Works in the browser (window.TRBBrain) and in node (module.exports) for tests. */
(function (W, factory) {
  var K = factory(W);
  if (typeof module === 'object' && module.exports) module.exports = K;
  if (W) W.TRBBrain = K;
})(typeof window !== 'undefined' ? window : null, function (W) {
  'use strict';
  var KEY = 'trb-brain-v1';

  // ---------- storage ----------
  function readAll() {
    try { var o = JSON.parse(W.localStorage.getItem(KEY)); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; }
  }
  function load(slug) { var e = readAll()[slug]; return e && typeof e === 'object' ? e : {}; }
  function update(slug, fn) {
    var e = load(slug);
    fn(e);
    try { var all = readAll(); all[slug] = e; W.localStorage.setItem(KEY, JSON.stringify(all)); } catch (x) { }
    return e;
  }
  // pure: add a finished session to an entry
  function addSession(e, s, now) {
    var rec = { t: now || Date.now() };
    for (var k in s) rec[k] = s[k];
    e.sessions = (Array.isArray(e.sessions) ? e.sessions : []).concat([rec]).slice(-30);
    e.plays = (e.plays || 0) + 1;
    var isBest = !(typeof e.best === 'number' && e.best >= s.score);
    if (isBest) e.best = s.score;
    if (typeof s.next === 'number') e.level = s.next;
    return isBest;
  }
  // the sound choice is shared by all the brain games: data.sound (true = on; off by default)
  function soundPref() { return readAll().sound === true; }
  function saveSoundPref(on) { try { var all = readAll(); all.sound = !!on; W.localStorage.setItem(KEY, JSON.stringify(all)); } catch (x) { } setSound(on); return !!on; }
  function record(slug, s) { var best = false; update(slug, function (e) { best = addSession(e, s); }); return best; }

  // ---------- level helpers (pure) ----------
  // A staircase: `up` successes in a row raise the level, `down` misses in a row lower it.
  // With up=2, down=1 it settles where you succeed about 71% of the time.
  function stair(st, ok, o) {
    var lv = st.level, run = st.run || 0;
    if (ok) { run = run > 0 ? run + 1 : 1; if (run >= o.up) { lv = Math.min(o.max, lv + 1); run = 0; } }
    else { run = run < 0 ? run - 1 : -1; if (-run >= o.down) { lv = Math.max(o.min, lv - 1); run = 0; } }
    return { level: lv, run: run, moved: lv - st.level };
  }
  // Block rule: after a block of answers, go up when accuracy >= hi, down when < lo, else stay.
  function blockStep(level, correct, total, o) {
    var acc = total ? correct / total : 0;
    if (acc >= o.hi) return Math.min(o.max, level + 1);
    if (acc < o.lo) return Math.max(o.min, level - 1);
    return level;
  }
  // Where the next session starts: the level saved as `next` by the last session (games save one step below where it ended).
  function startLevel(e, min, max) { var l = typeof e.level === 'number' ? Math.round(e.level) : 1; return Math.min(max || 99, Math.max(min || 1, l)); }

  // ---------- random helpers ----------
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuffle(a, r) { r = r || rnd; for (var i = a.length - 1; i > 0; i--) { var j = r(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // pick k distinct cells out of n
  function pick(n, k, r) { var a = []; for (var i = 0; i < n; i++) a.push(i); return shuffle(a, r).slice(0, k); }

  // ---------- sound (synthesized, off by default) ----------
  var AC = null, soundOn = false;
  function setSound(on) { soundOn = !!on; }
  function tone(f, d, type, vol, when, slide) {
    if (!soundOn) return;
    if (!AC) { try { AC = new (W.AudioContext || W.webkitAudioContext)(); } catch (e) { soundOn = false; return; } }   // made on first use, after a tap
    if (AC.state === 'suspended') AC.resume();
    var t = AC.currentTime + (when || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
  }
  var SFX = {
    tap: function () { tone(660, 0.07, 'triangle', 0.08); },
    ok: function () { tone(784, 0.09, 'triangle', 0.1); tone(1175, 0.12, 'triangle', 0.08, 0.06); },
    bad: function () { tone(196, 0.22, 'sawtooth', 0.06, 0, 150); },
    flash: function () { tone(523, 0.12, 'sine', 0.07); },
    coin: function () { tone(1568, 0.05, 'square', 0.03); tone(2093, 0.12, 'triangle', 0.05, 0.04); },
    up: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.12, 'triangle', 0.09, i * 0.07); }); },
    down: function () { [440, 349].forEach(function (f, i) { tone(f, 0.16, 'triangle', 0.07, i * 0.1); }); },
    end: function () { [392, 523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.2, 'triangle', 0.08, i * 0.09); }); }
  };
  function sfx(name) { try { if (SFX[name]) SFX[name](); } catch (e) { } }

  // ---------- misc UI ----------
  function reduced() { try { return W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmtDate(t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate(); }

  // Progress chart: bars of score for the last sessions, with a text summary for screen readers.
  function chart(sessions, o) {
    o = o || {};
    var key = o.key || 'score', label = o.label || 'Score', s = (sessions || []).slice(-20);
    if (!s.length) return '<p class="bk-small">Your sessions will be charted here after your first game.</p>';
    var w = 320, h = 120, pad = 36, max = 1;
    s.forEach(function (x) { max = Math.max(max, +x[key] || 0); });
    var bw = (w - pad - 6) / Math.max(s.length, 8), bars = '', best = 0;
    s.forEach(function (x, i) {
      var v = +x[key] || 0, bh = Math.max(2, (h - pad - 8) * v / max), xx = pad + 3 + i * bw, last = i === s.length - 1;
      if (v >= s[best][key]) best = i;
      bars += '<rect x="' + xx.toFixed(1) + '" y="' + (h - pad - bh).toFixed(1) + '" width="' + Math.max(2, bw - 3).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2" class="' + (last ? 'bk-bar last' : 'bk-bar') + '"><title>' + esc(fmtDate(x.t) + ': ' + label + ' ' + v) + '</title></rect>';
    });
    var avg = Math.round(s.reduce(function (a, x) { return a + (+x[key] || 0); }, 0) / s.length);
    var sum = label + ' over your last ' + s.length + ' session' + (s.length > 1 ? 's' : '') + ': latest ' + s[s.length - 1][key] + ', best ' + s[best][key] + ', average ' + avg + '.';
    return '<figure class="bk-chart"><svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(sum) + '">' +
      '<line x1="' + pad + '" y1="' + (h - pad) + '" x2="' + w + '" y2="' + (h - pad) + '" class="bk-axis"/>' +
      '<text x="' + (pad - 4) + '" y="12" class="bk-tick" text-anchor="end">' + max + '</text><text x="' + (pad - 4) + '" y="' + (h - pad) + '" class="bk-tick" text-anchor="end">0</text>' +
      bars + '<text x="' + pad + '" y="' + (h - 6) + '" class="bk-tick">older</text><text x="' + w + '" y="' + (h - 6) + '" class="bk-tick" text-anchor="end">latest</text></svg>' +
      '<figcaption>' + esc(sum) + '</figcaption></figure>';
  }

  // Pause support: pause(rootEl, onResume, onQuit) shows an overlay; returns a function that closes it.
  function pauseOverlay(rootEl, onResume, onQuit, extra) {
    var m = W.document.createElement('div');
    m.className = 'bk-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Paused');
    m.innerHTML = '<div class="bk-box"><h2>Paused</h2>' + (extra || '') + '<div class="bk-btns"><button class="bk-btn pri" data-a="r">Resume</button><button class="bk-btn" data-a="q">End and go to menu</button></div><p class="bk-small">Press P or Escape to resume.</p></div>';
    rootEl.appendChild(m);
    var closed = false;
    function close() { if (closed) return; closed = true; m.remove(); }
    m.querySelector('[data-a="r"]').onclick = function () { close(); onResume(); };
    m.querySelector('[data-a="q"]').onclick = function () { close(); onQuit(); };
    setTimeout(function () { var b = m.querySelector('[data-a="r"]'); if (b) b.focus({ preventScroll: true }); }, 0);
    return close;
  }

  // Grid keyboard: arrow keys move focus between buttons laid out in `cols` columns.
  function gridKeys(container, sel, cols) {
    container.addEventListener('keydown', function (e) {
      var k = e.key, d = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : k === 'ArrowDown' ? cols() : k === 'ArrowUp' ? -cols() : 0;
      if (!d) return;
      var all = Array.prototype.slice.call(container.querySelectorAll(sel)), i = all.indexOf(W.document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var j = i + d; if (j >= 0 && j < all.length) all[j].focus();
    });
  }

  return {
    KEY: KEY, readAll: readAll, soundPref: soundPref, saveSoundPref: saveSoundPref, load: load, update: update, addSession: addSession, record: record,
    stair: stair, blockStep: blockStep, startLevel: startLevel,
    rnd: rnd, shuffle: shuffle, pick: pick,
    setSound: setSound, sfx: sfx, reduced: reduced, esc: esc, chart: chart, pauseOverlay: pauseOverlay, gridKeys: gridKeys
  };
});
