/* TRBMusic.fret.player: the song player for guitar, ukulele and banjo songs (Teddy Rook Book, music kit).
   Built on the piano player (static/music/kit/player.js: its timing, count-in, click, loop, tempo and seek code is
   reused through the prototype), with what a fretted song needs instead of the piano keyboard:
     - the music as notation with tab under it (fret/draw.js view), the note being played lit in both, chord names
       above, strum arrows or picking letters under the tab with the current stroke lit;
     - the song's chord diagrams in a row (the current chord lit; press one to hear it);
     - a fretboard under the music showing where the notes are played and the current chord shape;
     - parts: tab + accompaniment / tab only / accompaniment only (when the song has a strum or picking pattern);
     - notation on or off (tab only), letters, count-in, click, loop, tempo 25–150% (the synth just plays slower;
       the pitch never changes), guitar voice (steel or nylon), the left-handed switch.
   Needs: audio.js, song.js, staff.js, keyboard.js and player.js from the kit; fret/core.js, sound.js, draw.js.

   mount(root, src, opts) -> FretPlayer
     src   YAML text of a fretted song, a song object, or a model from TRBMusic.fret.parseSong()
     opts  { storageKey: 'trb-music-player-v1', letters: false, notation: true (default false on phones),
             board: true, chordLinks: '/music/chords/' (adds "in the chord finder" links under the diagrams) }
   Methods (as the piano player): play(), pause(), stop(), toggle(), seek(measureIndex, tick), setTempo(percent),
     setLoop(on, fromIndex, toIndex), setLetters(on), setCountIn(on), setClick(on), destroy(), plus
     setParts('both' | 'tab' | 'acc'), setNotation(on), setVoice('steel' | 'nylon').
   Properties: model, view (draw.view), board (draw.fretboard), perf, playing, test = { scheduled: [{ kind: 'tab' |
     'acc', midi, string, fret, when, dur, tick, stroke }], lit: [note ids] } for tests.
   Keys: Space plays / pauses (when no button or field has focus).
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var F = TRB.fret = TRB.fret || {};
  var LEAD = 0.1;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function store(key, upd) {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) { o = {}; }
    if (upd) { try { upd(o); localStorage.setItem(key, JSON.stringify(o)); } catch (e) {} }
    return o;
  }
  function lowerBound(arr, v, key) { var lo = 0, hi = arr.length; while (lo < hi) { var m = (lo + hi) >> 1; if (key(arr[m]) < v) lo = m + 1; else hi = m; } return lo; }
  function pretty(s) { return String(s).replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭'); }
  var BEAT_SYM = { '4': '♩', '8': '♪', '2': '𝅗𝅥', '4.': '♩.', '2.': '𝅗𝅥.', '8.': '♪.', '1': '𝅝' };

  function FretPlayer(root, src, opts) {
    var self = this;
    var Base = TRB.player.Player.prototype;
    this.root = root;
    this.o = Object.assign({ storageKey: 'trb-music-player-v1', board: true, chordLinks: null }, opts || {});
    var M = this.model = (src && src.fret) ? src : F.parseSong(src);
    var Fd = M.fret || { chords: [], notes: {}, items: {}, inst: F.instrument('guitar'), instrument: 'guitar' };
    this.Fd = Fd;
    this.inst = Fd.instrument;
    this.slug = M.meta.slug || 'song';
    var pref = store(this.o.storageKey);
    this.tempoPct = (pref.tempo && pref.tempo[this.slug]) || 100;
    this.letters = this.o.letters != null ? this.o.letters : false;
    this.countIn = pref.countIn != null ? pref.countIn : true;
    this.clickOn = !!pref.click;
    this.vol = pref.volume != null ? pref.volume : 0.8;
    this.voice = (pref.voice && Fd.inst.voices && Fd.inst.voices[pref.voice]) ? pref.voice : (Fd.voice || null);
    this.hasAcc = !!(Fd.pattern && Fd.chords.length);
    this.parts = 'both';
    this.notation = this.o.notation != null ? this.o.notation : (pref.notation != null ? pref.notation : (window.innerWidth || 1000) >= 560);
    this.hands = 'both'; this.waiting = false;
    this.loop = false; this.loopFrom = 0; this.loopTo = M.measures.length - 1;
    this.playing = false; this.pos = 0;
    this.test = { scheduled: [], lit: [], waitLog: [] };
    root.classList.add('mp', 'fp-player');
    root.innerHTML = '';
    this.buildControls();
    if (!M.ok) {
      var box = el('div', 'mp-err');
      box.innerHTML = '<b>This song file has problems:</b><ul>' + M.errors.slice(0, 12).map(function (e) { return '<li>' + TRB.song.formatError(e).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</li>'; }).join('') + '</ul>';
      root.appendChild(box);
    }
    // the song's chords
    this.chordNames = [];
    Fd.chords.forEach(function (c) { if (c.chord && self.chordNames.indexOf(c.name) < 0) self.chordNames.push(c.name); });
    if (this.chordNames.length) {
      this.chordRow = el('div', 'fp-chords');
      this.chordRow.setAttribute('role', 'group');
      this.chordRow.setAttribute('aria-label', 'The chords in this song. Press one to hear it.');
      this.boxes = {};
      this.chordNames.forEach(function (nm) {
        var v = Fd.shapes[nm]; if (!v) return;
        var cell = el('div', 'fp-chord');
        self.boxes[nm] = F.draw.chordBox(cell, v, { inst: self.inst, tuning: Fd.tuning, name: nm, capo: Fd.capo, voice: self.voice, small: true });
        if (self.o.chordLinks) {
          var a = el('a', 'fp-clink', 'more shapes');
          a.href = self.o.chordLinks + '?i=' + encodeURIComponent(self.inst) + '&t=' + encodeURIComponent(Fd.tuning) + '&c=' + encodeURIComponent(nm);
          a.setAttribute('aria-label', 'More ways to play ' + pretty(nm) + ' in the chord finder');
          cell.appendChild(a);
        }
        self.chordRow.appendChild(cell);
      });
      root.appendChild(this.chordRow);
    }
    var wrap = el('div', 'mp-scorewrap');
    this.scoreEl = el('div', 'mp-score fp-score');
    this.scoreEl.setAttribute('tabindex', '0');
    this.countEl = el('div', 'mp-count'); this.countEl.setAttribute('aria-hidden', 'true');
    wrap.appendChild(this.scoreEl); wrap.appendChild(this.countEl);
    root.appendChild(wrap);
    this.statusEl = el('p', 'mp-status');
    this.liveEl = el('p', 'mp-live'); this.liveEl.setAttribute('aria-live', 'polite');
    root.appendChild(this.statusEl); root.appendChild(this.liveEl);
    this.view = this.score = F.draw.view(this.scoreEl, M, {
      notation: this.notation, letters: this.letters,
      onClick: function (mi, off) { self.seek(mi, off); }
    });
    if (this.o.board !== false) {
      var maxF = 0;
      Object.keys(Fd.notes).forEach(function (id) { maxF = Math.max(maxF, Fd.notes[id].fret || 0); });
      Object.keys(Fd.shapes || {}).forEach(function (k) { var v = Fd.shapes[k]; if (v) v.frets.forEach(function (f) { maxF = Math.max(maxF, f); }); });
      var to = Math.min(Fd.inst.frets, Math.max(Fd.inst.short ? 7 : 5, maxF + 1));
      var bw = el('div', 'fp-boardrow');
      var bEl = el('div', 'fp-board');
      bw.appendChild(bEl);
      this.nowEl = el('div', 'fp-now'); this.nowEl.setAttribute('aria-hidden', 'true');
      if (this.chordNames.length) bw.appendChild(this.nowEl);
      root.appendChild(bw);
      this.board = F.draw.fretboard(bEl, { inst: this.inst, tuning: Fd.tuning, capo: 0, from: 0, to: to, names: 'marks', voice: this.voice, label: Fd.inst.name + ' fretboard: the lit dots show where the notes are played' + (Fd.capo ? ' (fret numbers count from the capo)' : '') + '. Use the arrow keys to move, Enter to hear a note.' });
    }
    if (TRB.audio) TRB.audio.setVolume(this.vol);
    this.buildPerf();
    this.updateStatus();
    this.score.cursor(this.perf.measures.length ? this.perf.measures[0].index : null, 0);
    this._space = function (e) {
      if (e.code !== 'Space' || e.repeat) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A' || (t && t.isContentEditable)) return;
      if (t && t.closest && t.closest('.fb-wrap')) return;
      if (!root.isConnected) return;
      e.preventDefault();
      self.toggle();
    };
    document.addEventListener('keydown', this._space);
    this._vis = function () { if (document.hidden && self.playing) self.pause(); };
    document.addEventListener('visibilitychange', this._vis);
    this.showChord(this.perf.measures.length ? this.perf.measures[0].start : 0);
  }
  var P = FretPlayer.prototype = Object.create(TRB.player.Player.prototype);
  P.constructor = FretPlayer;
  var uidN = 0;
  P.uid = function (s) { this._uid = this._uid || ('fp' + (++uidN)); return this._uid + '-' + s; };

  /* ---------- controls ---------- */
  P.buildControls = function () {
    var self = this, M = this.model, bars = M.measures, Fd = this.Fd;
    var bar = el('div', 'mp-bar');
    var optsBars = bars.map(function (m, i) { return '<option value="' + i + '">' + (m.pickup ? 'pickup' : m.bar) + '</option>'; }).join('');
    var accName = Fd.pattern ? (/[TIMpimaSB]\d?\//.test(Fd.pattern.text) || /^(forward|backward|forwardreverse|alternating|pinch|travis|pima|pima34|bumditty|bumditty24)$/.test(Fd.pattern.text.trim()) ? 'Picking' : 'Strum') : '';
    this.accName = accName;
    var voices = Fd.inst && Fd.inst.voices ? Object.keys(Fd.inst.voices) : [];
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
        (this.hasAcc ? '<div class="mus-seg mp-hands fp-parts" role="group" aria-label="What plays">' +
          '<button type="button" data-p="both" aria-pressed="true">Tab + ' + accName.toLowerCase() + '</button>' +
          '<button type="button" data-p="tab" aria-pressed="false">Tab only</button>' +
          '<button type="button" data-p="acc" aria-pressed="false">' + accName + ' only</button>' +
        '</div>' : '') +
        '<button type="button" class="mus-btn mp-tog fp-nota" aria-pressed="false" title="Show the standard notation above the tab">Notation</button>' +
        '<button type="button" class="mus-btn mp-tog mp-lt" aria-pressed="false" title="Show the letter name in every note">Letters</button>' +
        '<span class="fp-lefty"></span>' +
        '<button type="button" class="mus-btn mp-more" aria-expanded="false" aria-controls="' + this.uid('more') + '">More…</button>' +
      '</div>' +
      '<div class="mp-row mp-row3" id="' + this.uid('more') + '">' +
        '<button type="button" class="mus-btn mp-tog mp-ci" aria-pressed="false" title="One bar of clicks before the music starts">Count-in</button>' +
        '<button type="button" class="mus-btn mp-tog mp-ck" aria-pressed="false" title="A click on every beat while it plays">Click</button>' +
        '<span class="mp-loop"><button type="button" class="mus-btn mp-tog mp-lp" aria-pressed="false" title="Repeat a few bars over and over">Loop</button>' +
          '<label>bars <select class="mp-lf" aria-label="Loop from bar">' + optsBars + '</select></label>' +
          '<label>to <select class="mp-lto" aria-label="Loop to bar">' + optsBars + '</select></label></span>' +
        (voices.length ? '<div class="mus-seg fp-voice" role="group" aria-label="Guitar sound">' + voices.map(function (v) { return '<button type="button" data-v="' + v + '" aria-pressed="false">' + Fd.inst.voices[v].replace(/ \(.*\)/, '') + '</button>'; }).join('') + '</div>' : '') +
      '</div>';
    this.root.appendChild(bar);
    this.bar = bar;
    var q = function (s) { return bar.querySelector(s); };
    this.ui = { play: q('.mp-play'), stop: q('.mp-stop'), tr: q('.mp-tr'), tv: q('.mp-tv'), ci: q('.mp-ci'), ck: q('.mp-ck'), wait: null, lt: q('.mp-lt'), lp: q('.mp-lp'), lf: q('.mp-lf'), lto: q('.mp-lto'), vol: q('.mp-vol input'), hands: q('.fp-parts'), nota: q('.fp-nota'), voice: q('.fp-voice') };
    var u = this.ui;
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
    u.lt.addEventListener('click', function () { self.setLetters(!self.letters); });
    u.nota.addEventListener('click', function () { self.setNotation(!self.notation); });
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
    if (u.hands) Array.prototype.forEach.call(u.hands.querySelectorAll('button'), function (b) { b.addEventListener('click', function () { self.setParts(b.getAttribute('data-p')); }); });
    if (u.voice) Array.prototype.forEach.call(u.voice.querySelectorAll('button'), function (b) { b.addEventListener('click', function () { self.setVoice(b.getAttribute('data-v')); }); });
    F.prefs.toggle(q('.fp-lefty'));
    this.paintControls();
  };
  P.paintControls = function () {
    var u = this.ui, M = this.model, bpm = Math.round(M.tempo * this.tempoPct / 100), self = this;
    u.tv.textContent = this.tempoPct + '%  ' + (BEAT_SYM[M.beat] || '♩') + ' = ' + bpm;
    u.tr.value = this.tempoPct;
    u.ci.setAttribute('aria-pressed', String(this.countIn));
    u.ck.setAttribute('aria-pressed', String(this.clickOn));
    u.lt.setAttribute('aria-pressed', String(this.letters));
    u.lt.disabled = !this.notation;
    u.nota.setAttribute('aria-pressed', String(this.notation));
    u.lp.setAttribute('aria-pressed', String(this.loop));
    u.play.innerHTML = this.playing ? '❚❚ <span>Pause</span>' : '▶ <span>Play</span>';
    u.play.setAttribute('aria-label', this.playing ? 'Pause' : 'Play');
    if (u.hands) Array.prototype.forEach.call(u.hands.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-p') === self.parts)); });
    if (u.voice) Array.prototype.forEach.call(u.voice.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === self.voice)); });
  };

  /* ---------- timeline ---------- */
  P.buildPerf = function () {
    var M = this.model, S = TRB.song, Fd = this.Fd, self = this;
    var p = this.loop ? S.performance(M, { from: this.loopFrom, to: this.loopTo }) : S.performance(M);
    this.perf = p;
    var ev = [];
    var wantTab = this.parts !== 'acc' || !this.hasAcc, wantAcc = this.hasAcc && this.parts !== 'tab';
    if (wantTab) p.events.forEach(function (e) {
      var d = Fd.notes[e.ids[0]]; if (!d) return;
      ev.push({ kind: 'tab', start: e.start, dur: e.dur, midi: d.midi, d: d, vel: e.vel, ids: e.ids, m: e.m });
    });
    this.accEvents = this.hasAcc ? F.accompaniment(M, p) : [];
    // each stroke rings until the chord changes (or the next stroke on that string, which the synth handles)
    var chordEnd = function (e) {
      var pm = null; p.measures.forEach(function (x) { if (x.index === e.m && e.start >= x.start && e.start < x.start + x.len) pm = x; });
      var c = null; Fd.chords.forEach(function (x) { if (x.m === e.m && x.off <= e.t && e.t < x.off + x.dur) c = x; });
      return pm && c ? pm.start + c.off + c.dur : e.start + e.dur;
    };
    if (wantAcc) this.accEvents.forEach(function (e, k) { if (e.kind === 'rest' || e.kind === 'miss') return; ev.push({ kind: 'acc', start: e.start, dur: Math.max(e.dur, chordEnd(e) - e.start), e: e, k: k }); });
    ev.sort(function (a, b) { return a.start - b.start || (a.kind === 'acc' ? -1 : 1); });
    this.events = ev;
    // lit notes: each written tab note from its start to its end
    var spans = [], items = {};
    var St = M.staves[0];
    if (St && wantTab) St.measures.forEach(function (SM, mi) { SM.voices.forEach(function (v) { v.forEach(function (it) { if (it.kind !== 'rest') (items[mi] = items[mi] || []).push(it); }); }); });
    p.measures.forEach(function (pm) {
      (items[pm.index] || []).forEach(function (it) {
        it.notes.forEach(function (n) { spans.push({ id: n.id, hand: 'rh', s: pm.start + it.start, e: pm.start + it.start + it.dur, d: Fd.notes[n.id] }); });
      });
    });
    spans.sort(function (a, b) { return a.s - b.s; });
    this.spans = spans;
    var beats = [], bt = M.beatTicks;
    p.measures.forEach(function (pm) {
      var full = M.measureTicks, lead = pm.len < full && M.measures[pm.index].pickup ? full - pm.len : 0;
      for (var b = 0; b * bt < full; b++) { var t = b * bt - lead; if (t >= 0 && t < pm.len) beats.push({ t: pm.start + t, accent: b === 0 }); }
    });
    this.beats = beats;
  };
  P.swingTick = function (tick) {
    var sw = this.Fd.swing; if (!sw) return tick;
    var TPQ = this.model.TPQ, r = ((tick % TPQ) + TPQ) % TPQ;
    if (r === 0) return tick;
    // eighths inside each beat: the second one is moved later (2/3 of the beat for a triplet swing)
    var base = tick - r, half = TPQ / 2;
    return r <= half ? base + r * (sw / 0.5) : base + sw * TPQ + (r - half) * ((1 - sw) / 0.5);
  };
  P.sched = function () {
    var A = TRB.audio, c = A.ctx(), horizon = c.currentTime + 0.2, spt = this.spt(), total = this.perf.total, guard = 0, self = this;
    var SND = F.sound, inst = this.inst, voice = this.voice;
    if (!total) { this.stop(); return; }
    this.lastOnString = this.lastOnString || {};
    while (guard++ < 2000) {
      if (this.nextEv >= this.events.length) {
        if (this.loop && this.events.length) { if (this.timeAt(this.cycleBase + total) > horizon) break; this.cycleBase += total; this.nextEv = 0; this.nextBeat = 0; continue; }
        break;
      }
      var e = this.events[this.nextEv], tick = this.cycleBase + this.swingTick(e.start), t = this.timeAt(tick);
      if (t > horizon) break;
      if (t < c.currentTime + 0.005) { var late = c.currentTime + 0.02 - t; this.anchorTime += late; t += late; this.test.late = (this.test.late || 0) + 1; }
      var dur = Math.max(0.06, e.dur * spt * 0.97 - 0.01);
      if (e.kind === 'tab') {
        var d = e.d, tech = d.tech || {}, prev = this.lastOnString[d.s];
        var note = { midi: d.midi, dur: dur, vel: Math.min(1, e.vel + (tech.acc ? 0.15 : 0)), inst: inst, voice: voice, string: d.s, group: 'tab', soft: !!(tech.h || tech.p || tech.s), dead: !!d.dead, bendTo: d.bendTo };
        if (tech.s && prev != null) note.slideFrom = prev;
        if (tech.si) note.slideFrom = d.midi - 2;
        if (SND) SND.play(note, t);
        this.lastOnString[d.s] = d.midi;
        if (this.test.scheduled.length < 20000) this.test.scheduled.push({ kind: 'tab', midi: d.midi, string: d.s, fret: d.fret, when: t, dur: dur, tick: tick, ids: e.ids });
      } else {
        var a = e.e, notes = a.notes.map(function (x) { return { midi: x.midi, string: x.s }; });
        var accVel = (a.vel || 0.6) * (this.parts === 'acc' ? 1 : 0.8);
        if (SND) {
          if (a.kind === 'down' || a.kind === 'up') SND.strum(notes, t, { dir: a.kind, vel: accVel, inst: inst, voice: voice, group: 'acc', dur: dur });
          else if (a.kind === 'mute') SND.chuck(t, { inst: inst, voice: voice, vel: accVel, group: 'acc' });
          else notes.forEach(function (x) { SND.play({ midi: x.midi, string: x.string, dur: dur, vel: accVel, inst: inst, voice: voice, group: 'acc' }, t); });
        }
        if (this.test.scheduled.length < 20000) this.test.scheduled.push({ kind: 'acc', stroke: a.kind, chord: a.chord, notes: a.notes.map(function (x) { return x.midi; }), strings: a.notes.map(function (x) { return x.s; }), when: t, dur: dur, tick: tick });
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
  P.play = function () {
    this.lastOnString = {};
    return TRB.player.Player.prototype.play.call(this);
  };

  /* ---------- what is lit ---------- */
  P.showAt = function (tick) {
    var pm = this.perfMeasureAt(tick);
    if (!pm) return;
    this.score.cursor(pm.index, tick - pm.start);
    if (pm.index !== this.lastMi) { this.lastMi = pm.index; this.score.scrollTo(pm.index, true); this.updateStatus(pm); }
    var want = {}, onBoard = [], spans = this.spans, i;
    for (i = 0; i < spans.length && spans[i].s <= tick; i++) if (spans[i].e > tick) { want[spans[i].id] = 'rh'; if (spans[i].d) onBoard.push({ s: spans[i].d.s, fret: spans[i].d.fret }); }
    this.applyLit(want);
    if (this.board) { var key = onBoard.map(function (x) { return x.s + ':' + x.fret; }).join(','); if (key !== this._boardKey) { this._boardKey = key; this.board.light(onBoard, 'lit'); } }
    this.showChord(tick, pm);
    // the current stroke of the pattern
    if (this.hasAcc && this.view.litStroke) {
      var ae = this.accEvents, k = -1;
      for (i = 0; i < ae.length && ae[i].start <= tick; i++) if (ae[i].start + ae[i].dur > tick) k = i;
      var key2 = k >= 0 ? ae[k].m + ':' + ae[k].t : '';
      if (key2 !== this._strokeKey) {
        this._strokeKey = key2;
        if (k < 0) this.view.litStroke(null);
        else {
          var bar = F.draw.barStrokes(this.model, ae[k].m), idx = -1;
          if (bar) bar.forEach(function (st, j) { if (st.t === ae[k].t) idx = j; });
          this.view.litStroke(ae[k].m, idx);
        }
      }
    }
  };
  P.showChord = function (tick, pm) {
    var Fd = this.Fd; if (!Fd.chords.length) return;
    pm = pm || this.perfMeasureAt(tick); if (!pm) return;
    var off = tick - pm.start, cur = null, next = null, list = Fd.chords;
    for (var i = 0; i < list.length; i++) { var c = list[i]; if (c.m === pm.index && c.off <= off && off < c.off + c.dur) { cur = c; break; } }
    if (cur) for (var j = i + 1; j < list.length; j++) if (list[j].chord && list[j].name !== cur.name) { next = list[j]; break; }
    var name = cur && cur.chord ? cur.name : null;
    if (name === this._chord) return;
    this._chord = name;
    var self = this;
    if (this.boxes) Object.keys(this.boxes).forEach(function (n) { self.boxes[n].el.classList.toggle('fd-now', n === name); });
    if (this.board) {
      var v = name && Fd.shapes[name];
      if (v) this.board.set(v.frets.map(function (f, k) { return { s: Fd.inst.strings - k, fret: f, cls: 'chord', label: v.fingers[k] || '' }; }).filter(function (m) { return m.fret > 0; }));
      else this.board.set([]);
    }
    if (this.nowEl) {
      var vv = name && Fd.shapes[name], nv = next && Fd.shapes[next.name];
      this.nowEl.innerHTML = vv ? '<div class="fp-nowc"><span class="fp-nowl">Now</span>' + F.draw.diagram(vv, { inst: this.inst, tuning: Fd.tuning, name: name }) + '</div>' + (nv ? '<div class="fp-nowc fp-next"><span class="fp-nowl">Next</span>' + F.draw.diagram(nv, { inst: this.inst, tuning: Fd.tuning, name: next.name, small: true }) + '</div>' : '') : '';
    }
  };
  P.applyKeys = function () {};
  P.stop = function () {
    TRB.player.Player.prototype.stop.call(this);
    if (this.board) { this.board.unlight('lit'); this._boardKey = ''; }
    if (this.view.litStroke) this.view.litStroke(null);
    this._strokeKey = ''; this._chord = undefined;
    this.showChord(this.perf.measures.length ? this.perf.measures[0].start : 0);
  };
  P.finish = function () {
    TRB.player.Player.prototype.finish.call(this);
    if (this.board) { this.board.unlight('lit'); this._boardKey = ''; }
    if (this.view.litStroke) this.view.litStroke(null);
  };
  P.updateStatus = function (pm) {
    TRB.player.Player.prototype.updateStatus.call(this, pm);
  };

  /* ---------- settings ---------- */
  P.setParts = function (p) {
    var self = this;
    if (p === this.parts) return;
    this.restartIfPlaying(function () { self.parts = p; self.buildPerf(); });
    this.paintControls();
  };
  P.setHands = P.setParts;
  P.setNotation = function (on) {
    this.notation = !!on;
    var self = this;
    store(this.o.storageKey, function (o) { o.notation = self.notation; });
    this.view.setParts({ notation: this.notation });
    this.paintControls();
  };
  P.setVoice = function (v) {
    if (!this.Fd.inst.voices || !this.Fd.inst.voices[v]) return;
    this.voice = v;
    store(this.o.storageKey, function (o) { o.voice = v; });
    if (this.board) this.board.o.voice = v;
    this.paintControls();
  };
  P.setWait = function () {};
  P.destroy = function () {
    this.halt();
    document.removeEventListener('keydown', this._space);
    document.removeEventListener('visibilitychange', this._vis);
    if (this.board) this.board.destroy();
    if (this.boxes) { var b = this.boxes; Object.keys(b).forEach(function (k) { b[k].destroy(); }); }
    this.view.destroy();
    this.root.innerHTML = '';
  };

  F.player = { mount: function (root, src, opts) { return new FretPlayer(root, src, opts); }, FretPlayer: FretPlayer };
})();
