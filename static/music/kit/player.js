/* TRBMusic.player: the song player (Teddy Rook Book, music kit). Needs audio.js, song.js, staff.js and keyboard.js.
   The score with a moving cursor, the notes being played lit on the staff and on a piano keyboard (colored by hand),
   letter names on the notes (a switch), play / pause / stop, tempo (% of the suggested tempo), right hand / left hand
   / both, loop a range of bars, count-in, a metronome click, and "wait for me": the music waits until you press the
   right key(s) on the screen, the computer keyboard or a MIDI keyboard.

   mount(root, src, opts) -> Player
     root  an empty element; the player builds its controls, score box, status line and keyboard inside it
     src   YAML text of a song, a song object, or a model from TRBMusic.song.parse()
     opts  { letters: (default: on for beginner songs), storageKey: 'trb-music-player-v1' (localStorage, for
             tempo per song, letters, count-in, click, volume), keyboard: true, maxScoreHeight: CSS length }
   Player methods: play(), pause(), stop(), toggle(), seek(measureIndex, tick), setTempo(percent), setHands('both' |
     'rh' | 'lh'), setLoop(on, fromBar, toBar), setWait(on), setLetters(on), setCountIn(on), setClick(on), destroy()
   Properties: model, score (staff.js Score), keyboard (keyboard.js Keyboard), perf (song.performance timeline),
     playing, waiting (wait mode on), test = { scheduled: [ { midi, when, dur, vel, tick } ], lit: [...] } for tests.
   Keys: Space plays / pauses (when no button or field has focus); the piano keys are on A S D F G H J K (see keyboard.js).
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var LEAD = 0.1; // seconds between pressing play and the first sound
  var activePlayer = null; // Space controls the player used last (a lesson page may have several)

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function store(key, upd) {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) { o = {}; }
    if (upd) { try { upd(o); localStorage.setItem(key, JSON.stringify(o)); } catch (e) {} }
    return o;
  }
  function noteName(n) { return n.letter + TRB.song.accSym(n.alter) + n.octave; }
  var BEAT_SYM = { '4': '♩', '8': '♪', '2': '𝅗𝅥', '4.': '♩.', '2.': '𝅗𝅥.', '8.': '♪.', '1': '𝅝' };

  function Player(root, src, opts) {
    var self = this, S = TRB.song;
    this.root = root;
    this.o = Object.assign({ storageKey: 'trb-music-player-v1', keyboard: true }, opts || {});
    var M = this.model = (src && src.staves && src.measures) ? src : S.parse(src);
    this.slug = M.meta.slug || 'song';
    var pref = store(this.o.storageKey);
    this.tempoPct = (pref.tempo && pref.tempo[this.slug]) || 100;
    this.letters = this.o.letters != null ? this.o.letters : (pref.letters != null ? pref.letters : M.meta.level === 'beginner');
    this.countIn = pref.countIn != null ? pref.countIn : true;
    this.clickOn = !!pref.click;
    this.vol = pref.volume != null ? pref.volume : 0.8;
    this.hands = 'both';
    this.loop = false; this.loopFrom = 0; this.loopTo = M.measures.length - 1;
    this.waiting = false; this.playing = false;
    this.pos = 0; // perf tick where play starts
    this.test = { scheduled: [], lit: [], waitLog: [] };
    this.hasRH = M.staves.some(function (s) { return s.id === 'rh'; });
    this.hasLH = M.staves.some(function (s) { return s.id === 'lh'; });
    root.classList.add('mp');
    root.innerHTML = '';
    this.buildControls();
    if (!M.ok) {
      var box = el('div', 'mp-err');
      box.innerHTML = '<b>This song file has problems:</b><ul>' + M.errors.slice(0, 12).map(function (e) { return '<li>' + S.formatError(e).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</li>'; }).join('') + '</ul>';
      root.appendChild(box);
    }
    var wrap = el('div', 'mp-scorewrap');
    this.scoreEl = el('div', 'mp-score');
    this.scoreEl.setAttribute('tabindex', '0');
    if (this.o.maxScoreHeight) this.scoreEl.style.maxHeight = this.o.maxScoreHeight;
    this.countEl = el('div', 'mp-count'); this.countEl.setAttribute('aria-hidden', 'true');
    wrap.appendChild(this.scoreEl); wrap.appendChild(this.countEl);
    root.appendChild(wrap);
    this.statusEl = el('p', 'mp-status');
    this.liveEl = el('p', 'mp-live'); this.liveEl.setAttribute('aria-live', 'polite');
    root.appendChild(this.statusEl); root.appendChild(this.liveEl);
    this.score = TRB.staff.render(this.scoreEl, M, {
      letters: this.letters,
      onClick: function (mi, off) { self.seek(mi, off); }
    });
    this.scoreEl.classList.add('ms-clickable');
    if (this.o.keyboard !== false) {
      var kbEl = el('div', 'mp-kb');
      root.appendChild(kbEl);
      var lo = M.range.lo, hi = M.range.hi;
      var from = Math.floor(lo / 12) * 12, to = Math.ceil((hi + 1) / 12) * 12;
      var below = true;
      while (to - from < 24) { if (below && from > 24) from -= 12; else to += 12; below = !below; }
      this.keyboard = TRB.keyboard.create(kbEl, { from: Math.max(21, from), to: Math.min(108, to), label: 'Piano keyboard for ' + (M.meta.title || 'this song') });
      this.keyboard.on('down', function (d) { self.onKey(d); });
    }
    if (TRB.audio) TRB.audio.setVolume(this.vol);
    this.buildPerf();
    this.updateStatus();
    this.score.cursor(this.perf.measures.length ? this.perf.measures[0].index : null, 0);
    this._space = function (e) {
      if (e.code !== 'Space' || e.repeat) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A' || (t && t.isContentEditable)) return;
      if (!root.isConnected || (activePlayer && activePlayer !== self && activePlayer.root.isConnected)) return;
      e.preventDefault();
      self.toggle();
    };
    document.addEventListener('keydown', this._space);
    if (!activePlayer) activePlayer = this;
    root.addEventListener('pointerdown', function () { activePlayer = self; }, true);
    root.addEventListener('focusin', function () { activePlayer = self; });
    this._vis = function () { if (document.hidden && self.playing) self.pause(); };
    document.addEventListener('visibilitychange', this._vis);
  }

  var uidN = 0;
  Player.prototype.uid = function (s) { this._uid = this._uid || ('mp' + (++uidN)); return this._uid + '-' + s; };
  /* ---------- controls ---------- */
  Player.prototype.buildControls = function () {
    var self = this, M = this.model, bars = M.measures;
    var bar = el('div', 'mp-bar');
    var tSym = BEAT_SYM[M.beat] || '♩';
    var optsBars = bars.map(function (m, i) { return '<option value="' + i + '">' + (m.pickup ? 'pickup' : m.bar) + '</option>'; }).join('');
    bar.innerHTML =
      '<div class="mp-row">' +
        '<button type="button" class="mus-btn pri mp-play" aria-label="Play">▶ <span>Play</span></button>' +
        '<button type="button" class="mus-btn mp-stop" aria-label="Stop and go back to the start">■ <span>Stop</span></button>' +
        '<div class="mp-tempo" role="group" aria-label="Tempo">' +
          '<button type="button" class="mus-btn mp-tm" aria-label="Slower">−</button>' +
          '<label class="mp-tl"><span class="mp-tv"></span><input type="range" class="mp-tr" min="25" max="150" step="5" aria-label="Tempo, percent of the suggested tempo"></label>' +
          '<button type="button" class="mus-btn mp-tp" aria-label="Faster">+</button>' +
        '</div>' +
        '<label class="mp-vol" title="Volume"><span aria-hidden="true">🔈</span><input type="range" min="0" max="100" step="5" aria-label="Volume"></label>' +
      '</div>' +
      '<div class="mp-row">' +
        '<div class="mus-seg mp-hands" role="group" aria-label="Which hand">' +
          '<button type="button" data-h="both" aria-pressed="true">Both<span class="mp-wide"> hands</span></button>' +
          '<button type="button" data-h="rh" aria-pressed="false"><i class="mp-dot rh"></i>Right</button>' +
          '<button type="button" data-h="lh" aria-pressed="false"><i class="mp-dot lh"></i>Left</button>' +
        '</div>' +
        '<button type="button" class="mus-btn mp-tog mp-wait" aria-pressed="false" title="The music waits until you press the right keys">Wait for me</button>' +
        '<button type="button" class="mus-btn mp-tog mp-lt" aria-pressed="false" title="Show the letter name in every note">Letters</button>' +
        '<button type="button" class="mus-btn mp-more" aria-expanded="false" aria-controls="' + this.uid('more') + '">More…</button>' +
      '</div>' +
      '<div class="mp-row mp-row3" id="' + this.uid('more') + '">' +
        '<button type="button" class="mus-btn mp-tog mp-ci" aria-pressed="false" title="One bar of clicks before the music starts">Count-in</button>' +
        '<button type="button" class="mus-btn mp-tog mp-ck" aria-pressed="false" title="A click on every beat while it plays">Click</button>' +
        '<span class="mp-loop"><button type="button" class="mus-btn mp-tog mp-lp" aria-pressed="false" title="Repeat a few bars over and over">Loop</button>' +
          '<label>bars <select class="mp-lf" aria-label="Loop from bar">' + optsBars + '</select></label>' +
          '<label>to <select class="mp-lto" aria-label="Loop to bar">' + optsBars + '</select></label></span>' +
      '</div>';
    this.root.appendChild(bar);
    this.bar = bar;
    var q = function (s) { return bar.querySelector(s); };
    this.ui = { play: q('.mp-play'), stop: q('.mp-stop'), tr: q('.mp-tr'), tv: q('.mp-tv'), ci: q('.mp-ci'), ck: q('.mp-ck'), wait: q('.mp-wait'), lt: q('.mp-lt'), lp: q('.mp-lp'), lf: q('.mp-lf'), lto: q('.mp-lto'), vol: q('.mp-vol input'), hands: q('.mp-hands') };
    var u = this.ui;
    if (!(this.hasRH && this.hasLH)) q('.mp-hands').hidden = true;
    var more = q('.mp-more');
    more.addEventListener('click', function () { var on = more.getAttribute('aria-expanded') !== 'true'; more.setAttribute('aria-expanded', String(on)); bar.classList.toggle('mp-open', on); });
    u.play.addEventListener('click', function () { self.toggle(); });
    u.stop.addEventListener('click', function () { self.stop(); });
    u.tr.value = this.tempoPct;
    u.tr.addEventListener('input', function () { self.setTempo(+u.tr.value); });
    q('.mp-tm').addEventListener('click', function () { self.setTempo(self.tempoPct - 5); });
    q('.mp-tp').addEventListener('click', function () { self.setTempo(self.tempoPct + 5); });
    u.ci.addEventListener('click', function () { self.setCountIn(!self.countIn); });
    u.ck.addEventListener('click', function () { self.setClick(!self.clickOn); });
    u.wait.addEventListener('click', function () { self.setWait(!self.waiting); });
    u.lt.addEventListener('click', function () { self.setLetters(!self.letters); });
    u.lp.addEventListener('click', function () { self.setLoop(!self.loop); });
    u.lf.value = '0'; u.lto.value = String(bars.length - 1);
    u.lf.addEventListener('change', function () { var a = +u.lf.value; if (a > +u.lto.value) u.lto.value = String(a); self.setLoop(true, a, +u.lto.value); });
    u.lto.addEventListener('change', function () { var b = +u.lto.value; if (b < +u.lf.value) u.lf.value = String(b); self.setLoop(true, +u.lf.value, b); });
    u.vol.value = Math.round(this.vol * 100);
    u.vol.addEventListener('input', function () {
      self.vol = +u.vol.value / 100;
      if (TRB.audio) TRB.audio.setVolume(self.vol);
      store(self.o.storageKey, function (o) { o.volume = self.vol; });
    });
    Array.prototype.forEach.call(u.hands.querySelectorAll('button'), function (b) { b.addEventListener('click', function () { self.setHands(b.getAttribute('data-h')); }); });
    this.paintControls();
  };
  Player.prototype.paintControls = function () {
    var u = this.ui, M = this.model, bpm = Math.round(M.tempo * this.tempoPct / 100);
    u.tv.textContent = this.tempoPct + '%  ' + (BEAT_SYM[M.beat] || '♩') + ' = ' + bpm;
    u.tr.value = this.tempoPct;
    u.ci.setAttribute('aria-pressed', String(this.countIn));
    u.ck.setAttribute('aria-pressed', String(this.clickOn));
    u.wait.setAttribute('aria-pressed', String(this.waiting));
    u.lt.setAttribute('aria-pressed', String(this.letters));
    u.lp.setAttribute('aria-pressed', String(this.loop));
    var on = this.playing || (this.waiting && this.waitActive);
    u.play.innerHTML = on ? '❚❚ <span>Pause</span>' : '▶ <span>' + (this.waiting ? 'Start' : 'Play') + '</span>';
    u.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
    var self = this;
    Array.prototype.forEach.call(u.hands.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-h') === self.hands)); });
    this.root.classList.toggle('mp-waiting', this.waiting);
  };

  /* ---------- timeline ---------- */
  Player.prototype.handsOn = function () { return this.hands === 'both' ? { rh: true, lh: true } : this.hands === 'rh' ? { rh: true } : { lh: true }; };
  Player.prototype.buildPerf = function () {
    var M = this.model, S = TRB.song;
    var p = this.loop ? S.performance(M, { from: this.loopFrom, to: this.loopTo }) : S.performance(M);
    this.perf = p;
    var hands = this.waiting ? { rh: true, lh: true } : this.handsOn();
    this.events = p.events.filter(function (e) { return hands[e.hand]; });
    // what is lit on the staff: each written note from its own start to its own end
    var spans = [];
    var items = {};
    M.staves.forEach(function (St) {
      St.measures.forEach(function (SM, mi) {
        SM.voices.forEach(function (v) { v.forEach(function (it) { if (it.kind !== 'rest') (items[mi] = items[mi] || []).push({ it: it, hand: St.hand }); }); });
      });
    });
    p.measures.forEach(function (pm) {
      (items[pm.index] || []).forEach(function (x) {
        if (!hands[x.hand]) return;
        x.it.notes.forEach(function (n) { spans.push({ id: n.id, hand: x.hand, s: pm.start + x.it.start, e: pm.start + x.it.start + x.it.dur }); });
      });
    });
    spans.sort(function (a, b) { return a.s - b.s; });
    this.spans = spans;
    // metronome beats (a pickup's beats line up with the end of its bar)
    var beats = [], bt = M.beatTicks;
    p.measures.forEach(function (pm) {
      var full = M.measureTicks, lead = pm.len < full && M.measures[pm.index].pickup ? full - pm.len : 0;
      for (var b = 0; b * bt < full; b++) {
        var t = b * bt - lead;
        if (t >= 0 && t < pm.len) beats.push({ t: pm.start + t, accent: b === 0 });
      }
    });
    this.beats = beats;
  };
  Player.prototype.spt = function () { return 60 / (this.model.tempo * this.tempoPct / 100) / this.model.beatTicks; };
  Player.prototype.perfMeasureAt = function (tick) {
    var ms = this.perf.measures, lo = 0, hi = ms.length - 1;
    if (!ms.length) return null;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (ms[mid].start <= tick) lo = mid; else hi = mid - 1; }
    return ms[lo];
  };

  /* ---------- playing ---------- */
  Player.prototype.toggle = function () {
    if (this.waiting) { if (this.waitActive) this.pauseWait(); else this.startWait(); return; }
    if (this.playing) this.pause(); else this.play();
  };
  Player.prototype.play = function () {
    var A = TRB.audio, self = this;
    if (this.waiting) { this.startWait(); return; }
    if (this.playing || !A) return;
    A.unlock();
    var c = A.ctx();
    if (!c) { this.say('Sound is not available in this browser.'); return; }
    if (this.pos >= this.perf.total) this.pos = 0;
    var spt = this.spt(), beatSec = this.model.beatTicks * spt;
    var t0 = c.currentTime + LEAD;
    this.countEnd = t0;
    this.countBeats = 0;
    if (this.countIn) {
      // one bar of clicks; before a pickup only the rest of the bar, so the pickup comes in on its own beat
      var M = this.model, pm = this.perfMeasureAt(this.pos), span = M.measureTicks;
      if (pm && M.measures[pm.index].pickup && this.pos === pm.start) span = M.measureTicks - pm.len;
      var n = 0;
      for (var k = 0; k * M.beatTicks < span - 1; k++) { A.click(t0 + k * beatSec, k === 0, 0.7); n++; }
      this.countStart = t0; this.countBeats = n; this.countBeatSec = beatSec;
      t0 += span * spt;
      this.countEnd = t0;
    }
    this.anchorTime = t0; this.anchorTick = this.pos;
    this.cycleBase = 0;
    this.nextEv = lowerBound(this.events, this.pos, function (e) { return e.start; });
    this.nextBeat = lowerBound(this.beats, this.pos, function (b) { return b.t; });
    this.playing = true;
    this.lastMi = -1;
    this.paintControls();
    this.sched();
    this.timer = setInterval(function () { self.sched(); }, 25);
    var loop = function () { if (!self.playing) return; self.frame(); self.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  };
  function lowerBound(arr, v, key) { var lo = 0, hi = arr.length; while (lo < hi) { var m = (lo + hi) >> 1; if (key(arr[m]) < v) lo = m + 1; else hi = m; } return lo; }
  Player.prototype.timeAt = function (tickU) { return this.anchorTime + (tickU - this.anchorTick) * this.spt(); };
  Player.prototype.sched = function () {
    var A = TRB.audio, c = A.ctx(), horizon = c.currentTime + 0.2, spt = this.spt(), total = this.perf.total, guard = 0;
    if (!total) { this.stop(); return; }
    while (guard++ < 2000) {
      if (this.nextEv >= this.events.length) {
        if (this.loop && this.events.length) { if (this.timeAt(this.cycleBase + total) > horizon) break; this.cycleBase += total; this.nextEv = 0; this.nextBeat = 0; continue; }
        break;
      }
      var e = this.events[this.nextEv], tick = this.cycleBase + e.start, t = this.timeAt(tick);
      if (t > horizon) break;
      if (t < c.currentTime + 0.005) {
        // reached late (a busy moment, a big tempo): play it now and move the rest of the music back by the same
        // amount, so no note is dropped and the rhythm after it stays even
        var late = c.currentTime + 0.02 - t;
        this.anchorTime += late; t += late;
        this.test.late = (this.test.late || 0) + 1;
      }
      {
        var dur = Math.max(0.06, e.dur * spt * 0.97 - 0.01);
        A.play(e.midi, t, dur, e.vel);
        if (this.test.scheduled.length < 20000) this.test.scheduled.push({ midi: e.midi, when: t, dur: dur, vel: e.vel, tick: tick, hand: e.hand, ids: e.ids });
      }
      this.nextEv++;
    }
    if (this.clickOn) {
      while (this.nextBeat < this.beats.length) {
        var b = this.beats[this.nextBeat], tb = this.timeAt(this.cycleBase + b.t);
        if (tb > horizon) break;
        if (tb >= c.currentTime - 0.03) A.click(tb, b.accent, 0.55);
        this.nextBeat++;
      }
    }
    if (!this.loop && this.nextEv >= this.events.length && c.currentTime > this.timeAt(total) + 0.15) this.finish();
  };
  Player.prototype.curTick = function () {
    var A = TRB.audio, c = A.ctx(), now = c.currentTime - A.latency();
    var u = this.anchorTick + (now - this.anchorTime) / this.spt();
    return { u: u, now: now };
  };
  Player.prototype.frame = function () {
    var T = this.curTick(), total = this.perf.total, tick;
    // count-in numbers
    if (this.countBeats && T.now < this.countEnd) {
      var k = Math.floor((T.now - this.countStart) / this.countBeatSec);
      this.countEl.textContent = k >= 0 ? String(k + 1) : '';
      this.countEl.classList.toggle('on', k >= 0);
      this.showAt(this.anchorTick);
      return;
    }
    this.countEl.classList.remove('on');
    tick = this.loop ? (((T.u - this.loopStartTick()) % total) + total) % total : Math.min(T.u, total - 1);
    if (tick < 0) tick = 0;
    this.showAt(tick);
  };
  Player.prototype.loopStartTick = function () { return 0; };
  // move the cursor and the lights to a perf tick
  Player.prototype.showAt = function (tick) {
    var pm = this.perfMeasureAt(tick);
    if (!pm) return;
    this.score.cursor(pm.index, tick - pm.start);
    if (pm.index !== this.lastMi) {
      this.lastMi = pm.index;
      this.score.scrollTo(pm.index, true);
      this.updateStatus(pm);
    }
    // lit notes
    var want = {}, spans = this.spans, i;
    for (i = 0; i < spans.length && spans[i].s <= tick; i++) if (spans[i].e > tick) want[spans[i].id] = spans[i].hand;
    this.applyLit(want);
    // lit keys
    var keys = {}, ev = this.events;
    for (i = 0; i < ev.length && ev[i].start <= tick; i++) if (ev[i].start + ev[i].dur > tick) keys[ev[i].midi + ':' + ev[i].hand] = [ev[i].midi, ev[i].hand];
    this.applyKeys(keys);
  };
  Player.prototype.applyLit = function (want) {
    var cur = this.litNotes || {}, self = this, on = [], off = [];
    Object.keys(cur).forEach(function (id) { if (want[id] !== cur[id]) off.push(id); });
    Object.keys(want).forEach(function (id) { if (cur[id] !== want[id]) on.push(id); });
    if (off.length) this.score.unhighlight(off);
    on.forEach(function (id) { self.score.highlight([id], want[id]); });
    this.litNotes = want;
    this.test.lit = Object.keys(want);
  };
  Player.prototype.applyKeys = function (want) {
    var kb = this.keyboard;
    if (!kb) return;
    var cur = this.litKeys || {}, ms = [];
    Object.keys(cur).forEach(function (k) { if (!want[k]) kb.unhighlight(cur[k][0], cur[k][1]); });
    Object.keys(want).forEach(function (k) { if (!cur[k]) kb.highlight(want[k][0], want[k][1]); ms.push(want[k][0]); });
    if (ms.length) kb.follow(Object.keys(want).map(function (k) { return want[k][0]; }));
    this.litKeys = want;
  };
  Player.prototype.pause = function () {
    if (!this.playing) return;
    var T = this.curTick();
    var tick = this.loop ? ((T.u % this.perf.total) + this.perf.total) % this.perf.total : Math.min(Math.max(T.u, this.anchorTick), this.perf.total);
    if (T.now < this.countEnd) tick = this.anchorTick;
    this.halt();
    this.pos = Math.max(0, tick);
    this.paintControls();
  };
  Player.prototype.halt = function () {
    this.playing = false;
    clearInterval(this.timer); this.timer = null;
    cancelAnimationFrame(this.raf);
    if (TRB.audio) TRB.audio.stopAll();
    this.countEl.classList.remove('on');
  };
  Player.prototype.stop = function () {
    this.halt();
    this.stopWait();
    this.pos = 0;
    this.applyLit({}); this.applyKeys({});
    if (this.keyboard) this.keyboard.clear();
    this.lastMi = -1;
    var pm = this.perf.measures[0];
    if (pm) { this.score.cursor(pm.index, 0); this.score.scrollTo(pm.index, false); }
    this.updateStatus();
    this.paintControls();
  };
  Player.prototype.finish = function () {
    this.halt();
    this.pos = 0;
    this.applyLit({}); this.applyKeys({});
    this.updateStatus();
    this.say('The end. Press Play to hear it again.');
    this.paintControls();
  };
  Player.prototype.restartIfPlaying = function (fn) {
    var was = this.playing;
    if (was) this.pause();
    fn();
    if (was) this.play();
  };
  Player.prototype.seek = function (mi, off) {
    var self = this;
    var pm = null;
    this.perf.measures.forEach(function (m) { if (!pm && m.index === mi) pm = m; });
    if (!pm) return;
    var tick = pm.start + (off || 0);
    if (this.waiting) {
      this.colIdx = lowerBound(this.cols, tick, function (c) { return c.t; });
      this.pos = tick;
      if (this.waitActive) this.arrive(this.colIdx); else { this.score.cursor(mi, off || 0); this.updateStatus(pm); }
      return;
    }
    this.restartIfPlaying(function () {
      self.pos = tick;
      self.lastMi = -1;
      self.showAt(tick);
    });
  };

  /* ---------- settings ---------- */
  Player.prototype.setTempo = function (pct) {
    pct = Math.max(25, Math.min(150, Math.round(pct / 5) * 5));
    if (this.playing) { // keep the music where it is (on the audio clock), change the speed from now on
      var now = TRB.audio.now();
      if (now >= this.countEnd) { this.anchorTick += (now - this.anchorTime) / this.spt(); this.anchorTime = now; }
    }
    this.tempoPct = pct;
    var slug = this.slug;
    store(this.o.storageKey, function (o) { o.tempo = o.tempo || {}; o.tempo[slug] = pct; });
    this.paintControls();
  };
  Player.prototype.setHands = function (h) {
    var self = this;
    if (h === this.hands) return;
    this.restartIfPlaying(function () { self.hands = h; self.buildPerf(); if (self.waiting) self.refreshWait(); });
    this.paintControls();
  };
  Player.prototype.setLoop = function (on, from, to) {
    var self = this;
    this.restartIfPlaying(function () {
      self.loop = on !== false;
      if (from != null) self.loopFrom = from;
      if (to != null) self.loopTo = to;
      self.buildPerf();
      self.pos = 0;
      if (self.waiting) self.refreshWait();
      else { var pm = self.perf.measures[0]; if (pm) self.score.cursor(pm.index, 0); }
    });
    this.paintControls();
  };
  Player.prototype.setLetters = function (on) {
    this.letters = !!on;
    this.score.setLetters(this.letters);
    var lit = this.litNotes || {}, self = this;
    Object.keys(lit).forEach(function (id) { self.score.highlight([id], lit[id]); });
    store(this.o.storageKey, function (o) { o.letters = self.letters; });
    this.paintControls();
  };
  Player.prototype.setCountIn = function (on) { var self = this; this.countIn = !!on; store(this.o.storageKey, function (o) { o.countIn = self.countIn; }); this.paintControls(); };
  Player.prototype.setClick = function (on) {
    var self = this; this.clickOn = !!on;
    if (this.playing) this.nextBeat = lowerBound(this.beats, Math.max(0, this.curTick().u - this.cycleBase), function (b) { return b.t; });
    store(this.o.storageKey, function (o) { o.click = self.clickOn; });
    this.paintControls();
  };

  /* ---------- wait for me ---------- */
  Player.prototype.setWait = function (on) {
    on = !!on;
    if (on === this.waiting) return;
    if (this.playing) this.pause();
    this.stopWait();
    this.waiting = on;
    this.buildPerf();
    if (on) {
      this.refreshWait();
      this.say('Wait for me is on. Press Start, then play the lit keys. The music moves on when you play the right ones' + (this.hasRH && this.hasLH && this.hands !== 'both' ? '; the computer plays the other hand.' : '.'));
    } else this.say('');
    this.paintControls();
  };
  Player.prototype.refreshWait = function () {
    var hands = this.handsOn();
    this.cols = this.perf.columns.map(function (c) {
      var req = {}, auto = [];
      c.notes.forEach(function (n) { if (n.tied) return; if (hands[n.hand]) req[n.midi] = n; else auto.push(n); });
      return { t: c.t, m: c.m, off: c.off, notes: c.notes, req: req, auto: auto };
    });
    this.colIdx = lowerBound(this.cols, this.pos, function (c) { return c.t; });
    if (this.waitActive) this.arrive(this.colIdx);
  };
  Player.prototype.startWait = function () {
    if (TRB.audio) TRB.audio.unlock();
    if (!this.cols) this.refreshWait();
    this.waitActive = true;
    this.mistakes = 0;
    if (this.colIdx >= this.cols.length) this.colIdx = 0;
    this.arrive(this.colIdx);
    this.paintControls();
  };
  Player.prototype.pauseWait = function () {
    this.waitActive = false;
    clearTimeout(this.waitTimer);
    if (this.keyboard) this.keyboard.clear('hint');
    this.paintControls();
  };
  Player.prototype.stopWait = function () {
    this.waitActive = false;
    clearTimeout(this.waitTimer);
    this.colIdx = 0;
    if (this.keyboard) this.keyboard.clear();
  };
  Player.prototype.arrive = function (i) {
    var self = this, A = TRB.audio;
    clearTimeout(this.waitTimer);
    if (this.keyboard) { this.keyboard.clear('hint'); this.keyboard.clear('rh'); this.keyboard.clear('lh'); }
    if (i >= this.cols.length) {
      if (this.loop) i = 0;
      else {
        this.waitActive = false; this.colIdx = 0; this.pos = 0;
        this.applyLit({});
        this.say(this.mistakes ? 'You reached the end! ' + this.mistakes + (this.mistakes === 1 ? ' key was' : ' keys were') + ' not the right one along the way. Try it again.' : 'You reached the end and played every note right. Well done!');
        this.statusEl.textContent = 'Finished.';
        this.paintControls();
        return;
      }
    }
    this.colIdx = i;
    var col = this.cols[i];
    this.pos = col.t;
    this.score.cursor(col.m, col.off);
    if (col.m !== this.lastMi) { this.lastMi = col.m; this.score.scrollTo(col.m, true); }
    // light what sounds now: the notes that start here
    var want = {};
    col.notes.forEach(function (n) { want[n.id] = n.hand; });
    this.applyLit(want);
    this.pressed = {};
    var req = Object.keys(col.req).map(Number);
    this.test.waitLog.push({ col: i, req: req.slice() });
    if (!req.length) { // only the other hand plays here: play it, then move on in time
      this.playAuto(col);
      var next = this.cols[i + 1], gap = next ? (next.t - col.t) * this.spt() : 0.4;
      this.waitTimer = setTimeout(function () { if (self.waitActive) self.arrive(i + 1); }, Math.max(60, gap * 1000));
      return;
    }
    if (this.keyboard) { req.forEach(function (m) { self.keyboard.highlight(m, col.req[m].hand); }); this.keyboard.follow(req); }
    var names = req.map(function (m) { var n = col.req[m], N = self.model.notes[n.id]; return noteName(N) + (self.hasRH && self.hasLH ? ' (' + (n.hand === 'rh' ? 'right' : 'left') + ' hand)' : ''); });
    var pm = this.model.measures[col.m];
    this.statusEl.textContent = 'Bar ' + pm.bar + ': play ' + names.join(' and ') + '.';
  };
  Player.prototype.playAuto = function (col) {
    var A = TRB.audio, spt = this.spt();
    if (!A) return;
    var evs = this.perf.events;
    col.auto.forEach(function (n) {
      // the sounding length includes ties
      var e = null;
      for (var k = 0; k < evs.length; k++) if (evs[k].ids[0] === n.id) { e = evs[k]; break; }
      A.play(n.midi, 0, Math.max(0.1, (e ? e.dur : n.dur) * spt * 0.97), e ? e.vel * 0.85 : 0.5);
    });
  };
  Player.prototype.onKey = function (d) {
    if (!this.waiting) return;
    if (!this.waitActive) { this.startWait(); }
    var col = this.cols[this.colIdx];
    if (!col) return;
    var self = this;
    if (col.req[d.midi]) {
      this.pressed[d.midi] = true;
      var done = Object.keys(col.req).every(function (m) { return self.pressed[m]; });
      this.test.waitLog.push({ col: this.colIdx, key: d.midi, ok: true, done: done });
      if (done) {
        this.playAuto(col);
        var i = this.colIdx;
        this.waitTimer = setTimeout(function () { if (self.waitActive) self.arrive(i + 1); }, 90);
      }
    } else {
      this.mistakes = (this.mistakes || 0) + 1;
      this.test.waitLog.push({ col: this.colIdx, key: d.midi, ok: false });
      if (this.keyboard) this.keyboard.flash(d.midi, 'bad', 380);
      var want = Object.keys(col.req).filter(function (m) { return !self.pressed[m]; }).map(function (m) { return noteName(self.model.notes[col.req[m].id]); });
      this.liveEl.textContent = 'That was ' + TRB.keyboard.name(d.midi) + '. Look for ' + want.join(' and ') + '.';
    }
  };

  /* ---------- status ---------- */
  Player.prototype.updateStatus = function (pm) {
    var M = this.model, n = M.measures.length - (M.pickupTicks ? 1 : 0);
    var bar = pm ? M.measures[pm.index].bar : (this.perf.measures[0] ? M.measures[this.perf.measures[0].index].bar : 1);
    var secs = this.perf.total * this.spt();
    var len = Math.floor(secs / 60) + ':' + ('0' + Math.round(secs % 60)).slice(-2);
    this.statusEl.textContent = (bar === 0 ? 'Pickup' : 'Bar ' + bar + ' of ' + n) + ' · ' + len + ' at this tempo' + (this.loop ? ' · looping bars ' + barLabel(M, this.loopFrom) + '–' + barLabel(M, this.loopTo) : '');
  };
  function barLabel(M, i) { return M.measures[i].pickup ? 'pickup' : M.measures[i].bar; }
  Player.prototype.say = function (s) { this.liveEl.textContent = s || ''; };
  Player.prototype.destroy = function () {
    this.halt(); this.stopWait();
    document.removeEventListener('keydown', this._space);
    document.removeEventListener('visibilitychange', this._vis);
    if (this.keyboard) this.keyboard.destroy();
    if (activePlayer === this) activePlayer = null;
    this.score.destroy();
    this.root.innerHTML = '';
  };

  TRB.player = { mount: function (root, src, opts) { return new Player(root, src, opts); }, Player: Player };
})();
