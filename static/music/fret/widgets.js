/* TRBMusic.fret.widgets: interactive pieces for the guitar, ukulele and banjo lessons (Teddy Rook Book, music kit).
   Declared in a chapter's HTML with a data-fret attribute and mounted on DOMContentLoaded; nothing sounds before the
   reader presses something. Needs the kit (audio, song, staff, keyboard, player) and fret/core, sound, draw, player.
   Every page that loads this file gets the left-handed switch under its title (unless it has its own data-fret="lefty").

   data-fret="chords"   chord diagrams in a row; press one to hear it.
                        data-inst="guitar" data-chords="C G Am F" [data-tuning, data-shapes='{"F": "xx3211"}' (a shape
                        to show instead of the first common one), data-notes="1" (note names under the strings),
                        data-captions='{"F": "the small F"}', data-five="1" (banjo: draw the 5th string too)]
   data-fret="board"    a fretboard to click and hear. data-inst [data-tuning, data-from="0" data-to="12",
                        data-names="all|marks|none", data-marks='[{"s": 3, "fret": 2, "label": "A", "cls": "root"}]',
                        data-scale="G major" (root + a SCALES name: major minor pentMajor pentMinor blues mixolydian
                        dorian harmonicMinor chromatic), data-chord="C" (the chord's first shape, with fingers),
                        data-shape="x32010", data-label]
   data-fret="tab"      a short piece of tab with notation and its own player: the song format's fields as data-
                        attributes: data-inst data-tab="3:0/4 3:2/4 | …" [data-tuning, data-capo, data-key="G",
                        data-time="4/4", data-tempo="80", data-chords, data-pattern, data-pick, data-title,
                        data-notation="0|1", data-board="1" (a fretboard under it)]. Bars may be any length.
   data-fret="pattern"  a strum, roll or picking pattern with Play / Stop, the stroke being played lit.
                        data-inst data-pattern="island" (a PATTERNS name or text like "D/4 D/8 U/8 …")
                        [data-chord="C" (or "G D7" to change chord every bar), data-tempo="80", data-time="4/4",
                        data-bars="2" (bars per round; it loops until Stop), data-tuning]
   data-fret="song"     a whole song with the player: data-song="slug" (the chapter's front matter lists the slug in
                        embed_songs, so the layout puts its YAML on the page)
   data-fret="strings"  the open strings as buttons that play a steady reference note. data-inst [data-tuning]
   data-fret="lefty"    the left-handed switch, placed here instead of under the title
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var F = TRB.fret = TRB.fret || {};
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function attr(el, n, d) { var v = el.getAttribute('data-' + n); return v == null || v === '' ? d : v; }
  function jattr(el, n, d) { var v = el.getAttribute('data-' + n); if (!v) return d; try { return JSON.parse(v); } catch (e) { console.warn('fret widget: bad JSON in data-' + n, el); return d; } }
  function pretty(s) { return String(s).replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭'); }
  function btn(label, cls, aria) { var b = h('button', 'mus-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); return b; }
  function err(el, msg) { el.innerHTML = '<p class="mus-note">' + msg + '</p>'; }

  var W = {};
  W.lefty = function (el) { el.classList.add('fl-bar'); F.prefs.toggle(el); };
  W.chords = function (el) {
    var inst = attr(el, 'inst', 'guitar'), tun = attr(el, 'tuning', null), shapes = jattr(el, 'shapes', {}), caps = jattr(el, 'captions', {});
    el.classList.add('fw', 'fw-chords');
    el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Chord diagrams: press one to hear it');
    attr(el, 'chords', '').split(/\s+/).filter(Boolean).forEach(function (nm) {
      var v = null;
      if (shapes[nm]) { var fr = F.parseShape(shapes[nm], inst); if (fr) { var fg = F.fingersFor(fr, inst); v = { frets: fr, fingers: fg.fingers, barre: fg.barre }; } }
      if (!v) v = F.shapesFor(nm, inst, tun, { limit: 1 })[0];
      if (!v) { console.warn('fret widget: no shape for ' + nm); return; }
      F.draw.chordBox(el, v, { inst: inst, tuning: tun, name: nm, notes: attr(el, 'notes', '') === '1', caption: caps[nm] ? pretty(caps[nm]) : null, five: attr(el, 'five', '') === '1' });
    });
  };
  W.board = function (el) {
    var inst = attr(el, 'inst', 'guitar'), tun = attr(el, 'tuning', null), I = F.instrument(inst);
    el.classList.add('fw');
    var host = h('div'); el.appendChild(host);
    var b = F.draw.fretboard(host, { inst: inst, tuning: tun, from: +attr(el, 'from', 0), to: +attr(el, 'to', 12), names: attr(el, 'names', 'marks'), label: attr(el, 'label', null) });
    var marks = jattr(el, 'marks', null);
    if (!marks && attr(el, 'scale', '')) { var sp = attr(el, 'scale', '').split(/\s+/); marks = F.draw.scaleMarks(sp[0], sp[1] || 'major', inst, tun, +attr(el, 'from', 0), +attr(el, 'to', 12)); }
    var shape = attr(el, 'shape', '') ? F.parseShape(attr(el, 'shape', ''), inst) : null, v = null;
    if (!marks && attr(el, 'chord', '')) v = F.shapesFor(attr(el, 'chord', ''), inst, tun, { limit: 1 })[0];
    if (shape) { var fg = F.fingersFor(shape, inst); v = { frets: shape, fingers: fg.fingers }; }
    if (v) marks = v.frets.map(function (f, k) { return { s: I.strings - k, fret: f, label: v.fingers[k] || (f === 0 ? null : ''), cls: 'chord' }; }).filter(function (m) { return m.fret >= 0; }).map(function (m) { if (m.fret === 0) m.cls = 'hint'; return m; });
    if (marks) b.set(marks);
  };
  W.tab = function (el) {
    var o = { instrument: attr(el, 'inst', 'guitar'), tab: attr(el, 'tab', ''), key: attr(el, 'key', 'C'), time: attr(el, 'time', '4/4'), tempo: +attr(el, 'tempo', 80), title: attr(el, 'title', 'Tab') , slug: 'lesson-' + (attr(el, 'id', '') || Math.random().toString(36).slice(2, 7)) };
    ['tuning', 'capo', 'chords', 'pattern', 'pick', 'pickup', 'shapes', 'swing', 'beat', 'marks'].forEach(function (k) { var v = attr(el, k, null); if (v != null) o[k] = /^(capo|pickup)$/.test(k) ? +v : /^(shapes|marks)$/.test(k) ? JSON.parse(v) : v; });
    if (o.swing != null) o.swing = o.swing === 'true' ? true : o.swing === 'false' ? false : +o.swing; // "true" = the usual 2:1 swing
    var m = F.parseSong(o, { loose: true });
    el.classList.add('fw', 'fw-tab');
    if (!m.ok) { console.warn('fret widget tab:', m.errors.map(TRB.song.formatError).join('; ')); }
    var host = h('div', 'mus-box'); el.appendChild(host);
    F.player.mount(host, m, { board: attr(el, 'board', '') === '1', notation: attr(el, 'notation', null) == null ? undefined : attr(el, 'notation', '1') === '1', storageKey: 'trb-music-player-v1' });
  };
  W.song = function (el) {
    var slug = attr(el, 'song', ''), src = document.querySelector('.ml-songsrc[data-slug="' + slug + '"]');
    if (!src) { err(el, 'The song "' + slug + '" is missing from this page.'); return; }
    el.classList.add('fw', 'mus-box');
    F.player.mount(el, src.getAttribute('data-yaml'), { chordLinks: (document.querySelector('link[rel=canonical]') ? '' : '') + '/music/chords/' });
  };
  W.strings = function (el) {
    var inst = attr(el, 'inst', 'guitar'), T = F.tuning(inst, attr(el, 'tuning', null)), I = F.instrument(inst), cur = null;
    el.classList.add('fw', 'tu-strings');
    el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'The open strings: press one to hear its note');
    T.midi.forEach(function (m, i) {
      var s = I.strings - i, b = h('button', 'tu-str', '<span>' + pretty(T.notes[i].replace(/(-?\d)$/, '<sub>$1</sub>')) + '</span>' + '<small>string ' + s + '</small>');
      b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        if (cur) { cur.h.stop(); cur.b.setAttribute('aria-pressed', 'false'); cur = null; }
        if (on) return;
        TRB.audio.unlock();
        cur = { h: F.sound.tone(m, { secs: 4 }), b: b };
        b.setAttribute('aria-pressed', 'true');
        var me = cur; setTimeout(function () { if (cur === me) { b.setAttribute('aria-pressed', 'false'); cur = null; } }, 4000);
      });
      el.appendChild(b);
    });
  };
  W.pattern = function (el) {
    var inst = attr(el, 'inst', 'guitar'), pat = attr(el, 'pattern', 'down4'), named = F.PATTERNS[pat];
    var time = attr(el, 'time', named ? named.time : '4/4'), tempo = +attr(el, 'tempo', 80), bars = +attr(el, 'bars', 2);
    var chords = attr(el, 'chord', inst === 'banjo' ? 'G' : 'C').split(/\s+/);
    var chordLine = [], k;
    for (k = 0; k < bars; k++) chordLine.push(chords[k % chords.length]);
    var m = F.parseSong({ instrument: inst, tuning: attr(el, 'tuning', undefined), time: time, tempo: tempo, key: 'C', tab: new Array(bars + 1).join('R | '), chords: chordLine.join(' | '), pattern: pat, swing: attr(el, 'swing', undefined) === 'true' ? true : attr(el, 'swing', undefined) }, { loose: true });
    el.classList.add('fw', 'fw-pat');
    if (!m.ok) { err(el, 'This pattern has a problem: ' + m.errors.map(TRB.song.formatError).join('; ')); return; }
    var P = F.parsePattern(pat, { instrument: inst });
    var pic = h('div', 'fw-pic'); el.appendChild(pic);
    var draw = function (lit) { pic.innerHTML = F.draw.pattern(P, { inst: inst, chord: chords[0], tuning: attr(el, 'tuning', null), lit: lit, label: attr(el, 'label', null) || ((named ? named.name + ': ' : 'Pattern: ') + P.bars.map(function (b) { return b.map(function (s) { return s.tok; }).join(' '); }).join(' | ')) }); };
    draw(-1);
    var row = h('div', 'fw-row'), play = btn('▶ Play', 'pri'), stop = btn('■ Stop'), tv = h('span', 'mus-small');
    var minus = btn('−', '', 'Slower'), plus = btn('+', '', 'Faster');
    row.appendChild(play); row.appendChild(stop); row.appendChild(minus); row.appendChild(tv); row.appendChild(plus);
    el.appendChild(row);
    if (named && named.about && attr(el, 'about', '1') !== '0') el.appendChild(h('p', 'fw-cap', named.about));
    var perf = TRB.song.performance(m), ev = F.accompaniment(m, perf), flat = [];
    P.bars.forEach(function (b, bi) { b.forEach(function (st, si) { flat.push(bi + ':' + si); }); });
    var timer = null, raf = 0, t0 = 0, spt = 0, idx = 0, cycle = 0;
    function paintT() { tv.textContent = tempo + ' BPM'; }
    paintT();
    function halt() { clearInterval(timer); timer = null; cancelAnimationFrame(raf); if (TRB.audio) TRB.audio.stopAll(); draw(-1); play.innerHTML = '▶ Play'; }
    function sched() {
      var c = TRB.audio.ctx(), hor = c.currentTime + 0.2, total = perf.total, guard = 0;
      while (guard++ < 500) {
        if (idx >= ev.length) { idx = 0; cycle++; }
        var e = ev[idx], t = t0 + (cycle * total + e.start) * spt;
        if (t > hor) break;
        var notes = e.notes.map(function (x) { return { midi: x.midi, string: x.s }; }), dur = Math.max(0.1, e.dur * spt * 2);
        if (e.kind === 'down' || e.kind === 'up') F.sound.strum(notes, t, { dir: e.kind, vel: e.vel, inst: inst, group: 'pat', dur: dur * 2 });
        else if (e.kind === 'mute') F.sound.chuck(t, { inst: inst, vel: e.vel, group: 'pat' });
        else if (e.kind !== 'rest' && e.kind !== 'miss') notes.forEach(function (x) { F.sound.play({ midi: x.midi, string: x.string, vel: e.vel, inst: inst, group: 'pat', dur: dur * 3 }, t); });
        idx++;
      }
    }
    function frame() {
      if (!timer) return;
      var c = TRB.audio.ctx(), u = (c.currentTime - TRB.audio.latency() - t0) / spt, total = perf.total;
      if (u >= 0) {
        var tk = u % total, lit = -1;
        ev.forEach(function (e) { if (e.start <= tk && tk < e.start + e.dur) { var nb = P.bars.length, pb = e.m % nb, si = -1; P.bars[pb].forEach(function (st, j) { if (st.t === e.t) si = j; }); lit = flat.indexOf(pb + ':' + si); } });
        if (lit !== frame.last) { frame.last = lit; draw(lit); }
      }
      raf = requestAnimationFrame(frame);
    }
    play.addEventListener('click', function () {
      if (timer) { halt(); return; }
      TRB.audio.unlock();
      var c = TRB.audio.ctx(); if (!c) return;
      spt = 60 / tempo / m.beatTicks; t0 = c.currentTime + 0.12; idx = 0; cycle = 0;
      sched(); timer = setInterval(sched, 30); raf = requestAnimationFrame(frame);
      play.innerHTML = '❚❚ Pause';
    });
    stop.addEventListener('click', halt);
    minus.addEventListener('click', function () { tempo = Math.max(40, tempo - 5); paintT(); if (timer) { halt(); play.click(); } });
    plus.addEventListener('click', function () { tempo = Math.min(200, tempo + 5); paintT(); if (timer) { halt(); play.click(); } });
    F.prefs.onLefty(function () {});
    document.addEventListener('visibilitychange', function () { if (document.hidden && timer) halt(); });
  };

  function mountAll(root) {
    var els = (root || document).querySelectorAll('[data-fret]');
    Array.prototype.forEach.call(els, function (el) {
      if (el._fretMounted) return;
      var kind = el.getAttribute('data-fret');
      if (!W[kind]) { console.warn('fret widget: unknown data-fret="' + kind + '"'); return; }
      el._fretMounted = true;
      try { W[kind](el); } catch (e) { console.error('fret widget ' + kind + ':', e); err(el, 'This piece could not be shown.'); }
    });
  }
  function addLefty() {
    if (document.querySelector('[data-fret="lefty"], .fl-bar')) return;
    var hero = document.querySelector('.mus .mus-hero');
    if (!hero) return;
    var bar = h('div', 'fl-bar');
    hero.parentNode.insertBefore(bar, hero.nextSibling);
    F.prefs.toggle(bar);
  }
  F.widgets = { mount: mountAll, kinds: W, addLefty: addLefty };
  function boot() { addLefty(); mountAll(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
