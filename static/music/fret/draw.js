/* TRBMusic.fret.draw (+ .prefs): the fretted-instrument pictures of the music kit (Teddy Rook Book). SVG, colored by
   CSS (static/music/fret/fret.css, light and dark), scaled to their box. Needs fret/core.js; the tab and the combined
   view also need song.js and staff.js; sounds (optional) come from fret/sound.js.

   LEFT-HANDED VIEW (TRBMusic.fret.prefs)
     lefty() -> bool, setLefty(bool)   a site-wide music preference in localStorage 'trb-music-v1' ({ lefty: true });
                                       chord diagrams and fretboards are drawn mirrored, as a left-handed player sees
                                       their own instrument. Tab is not mirrored (tab reads the same for everyone).
     onLefty(fn) -> unsubscribe        fn(bool) whenever it changes (on this page or in another tab)
     toggle(el)                        a visible switch button ("Left-handed view") inside el
   DRAWINGS (TRBMusic.fret.draw)
     diagram(v, opts) -> SVG markup    a chord diagram. v = a voicing from core (frets, fingers, barre, base) or a shape
         text "x32010". opts { inst, tuning, name (title above), lefty (default: the preference), notes: false (note
         names under the strings), fingers: true, frets: 4 (rows; more when the shape needs them), cls, label,
         interactive: false (adds clickable cells .fd-cell[data-s][data-f] and nut cells for the reverse lookup),
         focus: { s, f } (a keyboard focus ring), small: false }
         Banjo diagrams show strings 4 to 1 (the 5th string is played open) unless opts.five.
     chordBox(el, v, opts) -> { el, play() }   a diagram in a button that strums it when pressed (sound.js)
     fretboard(el, opts) -> Board        a horizontal neck. opts { inst, tuning, capo, from: 0, to: 12, lefty,
         names: 'marks' | 'all' | 'none', label, onNote(fn({ s, fret, midi })), sound: true, voice }
         Board: set(marks) (marks = [{ s, fret, label, cls: 'root' | 'scale' | 'chord' | 'lit' | 'muted' | 'hint',
         finger }]), light(list, cls) / unlight(cls), clear(), setLefty(b), setRange(from, to), destroy(), el.
         Keyboard: Tab into the neck, arrows move along strings and frets, Enter or Space plays the note there.
     scaleMarks(root, type, inst, tuning, from, to) -> marks   (type: a key of core SCALES; labels are intervals)
     tabStrip(model, info, opts) -> { h, svg, cursor }   one line of tab for staff.js's below hook
         (opts { rhythm: true, picks: true, strum: true }); chordStrip(model, info) -> { h, svg } the chord names
     view(el, model, opts) -> View        notation (staff.js) with tab under it, chord names above, strum arrows and
         counts under the tab. A View has the staff Score's methods (cursor, scrollTo, highlight, unhighlight, clear,
         measureBox, setLetters, relayout, destroy) and setParts({ notation, tab, rhythm, strum }).
         opts { notation: true, letters: false, onClick(mi, tick), label }. Tab numbers are lit with the notes.
     pattern(p, opts) -> SVG markup       a right-hand pattern on its own: strums as arrows (accent >, X for a muted
         chuck, a gap for a miss), picking as a little tab with the finger letters (T I M, p i m a, S for the
         clawhammer strike) and the beat counts under it. p = a pattern name, text, or parsePattern() result.
         opts { inst, chord: 'G', tuning, lit: strokeIndex, label, syllables: true (clawhammer: bum-dit-ty) }
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var F = TRB.fret = TRB.fret || {};
  var NS = 'http://www.w3.org/2000/svg';
  function n3(v) { return Math.round(v * 1000) / 1000; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function pretty(s) { return String(s).replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭'); }
  var uid = 0;

  /* ================= left-handed preference ================= */
  var KEY = 'trb-music-v1', fns = [];
  function sget() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  var prefs = {
    lefty: function () { return !!sget().lefty; },
    setLefty: function (on) {
      on = !!on;
      try { var o = sget(); o.lefty = on; localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
      fns.slice().forEach(function (fn) { try { fn(on); } catch (e) {} });
    },
    onLefty: function (fn) { fns.push(fn); return function () { var i = fns.indexOf(fn); if (i >= 0) fns.splice(i, 1); }; },
    toggle: function (el) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mus-btn fl-toggle';
      var paint = function (on) { b.setAttribute('aria-pressed', String(on)); b.innerHTML = '<span aria-hidden="true">🫲</span> Left-handed view: <b>' + (on ? 'on' : 'off') + '</b>'; b.title = on ? 'Diagrams and fretboards are mirrored for a left-handed player. Press to switch back.' : 'Mirror the chord diagrams and fretboards for a left-handed player'; };
      paint(prefs.lefty());
      b.addEventListener('click', function () { prefs.setLefty(!prefs.lefty()); });
      prefs.onLefty(paint);
      el.appendChild(b);
      return b;
    }
  };
  window.addEventListener('storage', function (e) { if (e.key === KEY) { var on = prefs.lefty(); fns.slice().forEach(function (fn) { try { fn(on); } catch (er) {} }); } });
  F.prefs = prefs;

  /* ================= chord diagram ================= */
  function asVoicing(v, inst) {
    if (typeof v === 'string') {
      var fr = F.parseShape(v, inst), fg = F.fingersFor(fr, inst);
      return { frets: fr, fingers: fg.fingers, barre: fg.barre };
    }
    return v;
  }
  function diagram(v0, o) {
    o = o || {};
    var inst = o.inst || 'guitar', I = F.instrument(inst), v = asVoicing(v0, inst);
    if (!v || !v.frets) return '';
    var lefty = o.lefty == null ? prefs.lefty() : !!o.lefty;
    var strs = []; // string numbers drawn left to right (right-handed: lowest-pitched string on the left)
    for (var s = I.strings; s >= 1; s--) if (!(I.short && s === I.short.string && !o.five)) strs.push(s);
    if (lefty) strs.reverse();
    var fr = function (s) { return v.frets[I.strings - s]; };
    var fretted = strs.map(fr).filter(function (f) { return f > 0; });
    var lo = fretted.length ? Math.min.apply(null, fretted) : 1, hi = fretted.length ? Math.max.apply(null, fretted) : 1;
    var base = v.base || (hi <= (o.frets || 4) ? 1 : lo);
    var rows = Math.max(o.frets || 4, hi - base + 1);
    var sw = 2.0, fh = 2.4, padL = 2.6, padR = 1.2, top = (o.name ? 3.4 : 0.6) + 2.0, n = strs.length;
    var W = padL + (n - 1) * sw + padR, H = top + rows * fh + (o.notes ? 2.4 : 0.9) + (o.interactive ? 0 : 0);
    var X = function (k) { return padL + k * sw; }, Y = function (f) { return top + (f - base + 0.5) * fh; };
    var p = [];
    var label = o.label || ((o.name ? pretty(o.name) + ' chord: ' : 'Chord shape: ') + strs.slice().sort(function (a, b) { return b - a; }).map(function (s) { var f = fr(s); return 'string ' + s + (f < 0 ? ' muted' : f === 0 ? ' open' : ' fret ' + f); }).join(', ') + (lefty ? ' (drawn left-handed)' : ''));
    p.push('<svg xmlns="' + NS + '" class="fd' + (o.small ? ' fd-sm' : '') + (lefty ? ' fd-lefty' : '') + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 ' + n3(W) + ' ' + n3(H) + '" role="img" aria-label="' + esc(label) + '">');
    if (o.name) p.push('<text class="fd-name" x="' + n3(W / 2 + (padL - padR) / 2 - 0.6) + '" y="2.3" text-anchor="middle">' + esc(pretty(o.name)) + '</text>');
    // frets and strings
    for (var f = 0; f <= rows; f++) {
      var y = top + f * fh;
      p.push('<path class="' + (f === 0 && base === 1 ? 'fd-nut' : 'fd-fret') + '" d="M' + n3(X(0)) + ' ' + n3(y) + 'H' + n3(X(n - 1)) + '"/>');
    }
    strs.forEach(function (s, k) { p.push('<path class="fd-str" d="M' + n3(X(k)) + ' ' + n3(top) + 'V' + n3(top + rows * fh) + '"/>'); });
    if (base > 1) p.push('<text class="fd-base" x="' + n3(lefty ? X(n - 1) + 0.6 : X(0) - 0.6) + '" y="' + n3(Y(base) + 0.45) + '" text-anchor="' + (lefty ? 'start' : 'end') + '">' + base + 'fr</text>');
    // barre
    if (v.barre && o.fingers !== false) {
      var ks = strs.map(function (s, k) { return (s <= Math.max(v.barre.from, v.barre.to) && s >= Math.min(v.barre.from, v.barre.to)) ? k : -1; }).filter(function (k) { return k >= 0; });
      if (ks.length > 1) {
        var a = Math.min.apply(null, ks), b = Math.max.apply(null, ks);
        p.push('<rect class="fd-barre" x="' + n3(X(a) - 0.75) + '" y="' + n3(Y(v.barre.fret) - 0.75) + '" width="' + n3(X(b) - X(a) + 1.5) + '" height="1.5" rx="0.75"/>');
      }
    }
    // open / muted marks and dots
    strs.forEach(function (s, k) {
      var f2 = fr(s), x = X(k), fing = v.fingers ? v.fingers[I.strings - s] : '';
      if (f2 < 0) p.push('<path class="fd-x" d="M' + n3(x - 0.55) + ' ' + n3(top - 1.75) + 'l1.1 1.1M' + n3(x + 0.55) + ' ' + n3(top - 1.75) + 'l-1.1 1.1"/>');
      else if (f2 === 0) p.push('<circle class="fd-o" cx="' + n3(x) + '" cy="' + n3(top - 1.2) + '" r="0.55"/>');
      else {
        var inBarre = v.barre && fing === '1' && f2 === v.barre.fret && o.fingers !== false;
        p.push('<g class="fd-dot' + (o.root && v.pitches && v.pitches.some(function (q) { return q.s === s && ((q.midi % 12) + 12) % 12 === o.root; }) ? ' fd-root' : '') + '"><circle cx="' + n3(x) + '" cy="' + n3(Y(f2)) + '" r="0.85"' + (inBarre ? ' class="fd-inbarre"' : '') + '/>' +
          (o.fingers !== false && fing ? '<text x="' + n3(x) + '" y="' + n3(Y(f2) + 0.42) + '" text-anchor="middle">' + esc(fing) + '</text>' : '') + '</g>');
      }
      if (o.notes && f2 >= 0) {
        var m = F.stringMidi(inst, o.tuning, s, f2, 0);
        if (m != null) p.push('<text class="fd-nn" x="' + n3(x) + '" y="' + n3(top + rows * fh + 1.7) + '" text-anchor="middle">' + esc(pretty(F.pcName(m % 12, /b/.test(o.name || '') && !/#/.test(o.name || '')))) + '</text>');
      }
    });
    if (o.interactive) {
      strs.forEach(function (s, k) {
        p.push('<rect class="fd-cell fd-open" data-s="' + s + '" data-f="0" x="' + n3(X(k) - sw / 2) + '" y="' + n3(top - 2.2) + '" width="' + sw + '" height="2.1"/>');
        for (var ff = base; ff < base + rows; ff++) p.push('<rect class="fd-cell" data-s="' + s + '" data-f="' + ff + '" x="' + n3(X(k) - sw / 2) + '" y="' + n3(top + (ff - base) * fh) + '" width="' + sw + '" height="' + fh + '"/>');
      });
      if (o.focus) {
        var fk = strs.indexOf(o.focus.s);
        if (fk >= 0) p.push('<rect class="fd-focus" x="' + n3(X(fk) - sw / 2 + 0.15) + '" y="' + n3(o.focus.f === 0 ? top - 2.1 : top + (o.focus.f - base) * fh + 0.1) + '" width="' + n3(sw - 0.3) + '" height="' + n3(o.focus.f === 0 ? 1.9 : fh - 0.2) + '" rx="0.4"/>');
      }
    }
    p.push('</svg>');
    return p.join('');
  }
  function chordBox(el, v, o) {
    o = o || {};
    var inst = o.inst || 'guitar', voice = asVoicing(v, inst);
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'fd-box' + (o.cls ? ' ' + o.cls : '');
    b.setAttribute('aria-label', 'Play ' + (o.name ? pretty(o.name) : 'this chord') + (o.title ? ': ' + o.title : ''));
    var draw = function () { b.innerHTML = diagram(voice, o) + (o.caption ? '<span class="fd-cap">' + o.caption + '</span>' : ''); };
    draw();
    var off = prefs.onLefty(draw);
    var play = function () {
      if (!F.sound || !F.sound.strum || !voice.frets) return;
      TRB.audio && TRB.audio.unlock();
      var I = F.instrument(inst), notes = [];
      voice.frets.forEach(function (f, i) { var s = I.strings - i; if (f < 0) return; if (I.short && s === I.short.string && !o.five) return; var m = F.stringMidi(inst, o.tuning, s, f, o.capo || 0); if (m != null) notes.push({ midi: m, string: s }); });
      F.sound.strum(notes, 0, { inst: inst, voice: o.voice, vel: 0.7, dir: 'down', group: 'ui' });
      b.classList.add('fd-playing'); setTimeout(function () { b.classList.remove('fd-playing'); }, 450);
    };
    b.addEventListener('click', play);
    el.appendChild(b);
    return { el: b, play: play, redraw: draw, destroy: function () { off(); b.remove(); } };
  }

  /* ================= fretboard ================= */
  var INLAY = [3, 5, 7, 9, 15, 17, 19, 21];
  function Board(el, o) {
    var self = this;
    this.el = el; this.o = Object.assign({ from: 0, to: 12, names: 'marks', sound: true }, o || {});
    this.inst = this.o.inst || 'guitar'; this.I = F.instrument(this.inst);
    this.marks = []; this.lit = {}; this.focus = { s: this.I.strings === 6 ? 6 : this.I.strings, f: 0 };
    this.lefty = this.o.lefty == null ? prefs.lefty() : this.o.lefty;
    el.classList.add('fb-wrap');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'application');
    el.setAttribute('aria-roledescription', 'fretboard');
    this.live = document.createElement('span'); this.live.className = 'fl-sr'; this.live.setAttribute('aria-live', 'polite');
    this._off = this.o.lefty == null ? prefs.onLefty(function (on) { self.lefty = on; self.render(); }) : function () {};
    this._click = function (e) {
      var c = e.target.closest && e.target.closest('.fb-cell'); if (!c) return;
      self.focus = { s: +c.getAttribute('data-s'), f: +c.getAttribute('data-f') };
      self.hit(self.focus.s, self.focus.f);
    };
    this._key = function (e) {
      var k = e.key, s = self.focus.s, f = self.focus.f, I = self.I, d = self.lefty ? -1 : 1;
      if (k === 'ArrowUp') s = Math.min(I.strings, s + 1); // toward the bass string (drawn lower) is ArrowDown
      else if (k === 'ArrowDown') s = Math.max(1, s - 1);
      else if (k === 'ArrowRight') f = Math.max(self.o.from, Math.min(self.o.to, f + d));
      else if (k === 'ArrowLeft') f = Math.max(self.o.from, Math.min(self.o.to, f - d));
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); self.el.classList.add('fb-kbd'); self.hit(s, f); return; }
      else return;
      e.preventDefault();
      self.el.classList.add('fb-kbd');
      if (I.short && s === I.short.string && f > 0 && f <= I.short.at) f = k === 'ArrowLeft' || k === 'ArrowRight' ? (f > self.focus.f ? I.short.at + 1 : 0) : 0;
      self.focus = { s: s, f: f };
      self.render();
      var m = F.stringMidi(self.inst, self.o.tuning, s, f, self.o.capo || 0);
      self.live.textContent = 'String ' + s + ', ' + (f === 0 ? 'open' : 'fret ' + f) + (m != null ? ': ' + pretty(F.noteName(m)) : '');
    };
    el.addEventListener('click', this._click);
    el.addEventListener('keydown', this._key);
    var ptr = false; // focus from a pointer must not redraw the board before the click lands
    el.addEventListener('pointerdown', function () { ptr = true; });
    el.addEventListener('focus', function () { if (ptr) { ptr = false; return; } el.classList.add('fb-kbd'); self.render(); });
    el.addEventListener('blur', function () { ptr = false; if (el.classList.contains('fb-kbd')) { el.classList.remove('fb-kbd'); self.render(); } });
    this.render();
  }
  Board.prototype.hit = function (s, f) {
    var m = F.stringMidi(this.inst, this.o.tuning, s, f, this.o.capo || 0);
    if (m == null) return;
    if (this.o.sound && F.sound && F.sound.pluck) F.sound.pluck(m, { inst: this.inst, voice: this.o.voice, string: s, group: 'fb' + (this._id || '') });
    this.flash = { s: s, f: f }; this.render();
    var self = this; clearTimeout(this._ft); this._ft = setTimeout(function () { self.flash = null; self.render(); }, 380);
    this.live.textContent = 'String ' + s + ', ' + (f === 0 ? 'open' : 'fret ' + f) + ': ' + pretty(F.noteName(m));
    if (this.o.onNote) this.o.onNote({ s: s, fret: f, midi: m });
  };
  Board.prototype.render = function () {
    var I = this.I, o = this.o, inst = this.inst, from = o.from, to = o.to, lefty = this.lefty;
    var n = I.strings, sp = 1.6, nutW = from === 0 ? 3.2 : 1.2, fw = 4.6, left = 3.6;
    var cols = to - from + (from === 0 ? 0 : 1), W = left + nutW + cols * fw + 1.0, top = 1.4, H = top + (n - 1) * sp + 3.2;
    var xf = function (f) { // center of fret f's space; f = 0 the open-string spot left of the nut
      var x = f === 0 ? left + nutW / 2 - 0.6 : left + nutW + (f - Math.max(1, from) + 0.5) * fw;
      return lefty ? W - x : x;
    };
    var xw = function (f) { var x = left + nutW + (f - Math.max(1, from) + 1) * fw; return lefty ? W - x : x; }; // fret wire after space f
    var ys = function (s) { return top + (s - 1) * sp; }; // string 1 on top
    var p = [];
    var lbl = o.label || (I.name + ' fretboard, frets ' + from + ' to ' + to + (lefty ? ', drawn left-handed' : '') + '. Use the arrow keys to move, Enter to hear a note.');
    p.push('<svg xmlns="' + NS + '" class="fb' + (lefty ? ' fb-lefty' : '') + '" viewBox="0 0 ' + n3(W) + ' ' + n3(H) + '" role="img" aria-label="' + esc(lbl) + '">');
    var x0 = lefty ? W - (left + nutW) : left + nutW, x1 = lefty ? W - (left + nutW + cols * fw) : left + nutW + cols * fw;
    p.push('<rect class="fb-wood" x="' + n3(Math.min(x0, x1)) + '" y="' + n3(top - 0.7) + '" width="' + n3(Math.abs(x1 - x0)) + '" height="' + n3((n - 1) * sp + 1.4) + '" rx="0.3"/>');
    // inlays
    for (var f = Math.max(1, from); f <= to; f++) {
      var midY = top + (n - 1) * sp / 2;
      if (f === 12 || f === 24) p.push('<circle class="fb-inlay" cx="' + n3(xf(f)) + '" cy="' + n3(midY - sp) + '" r="0.45"/><circle class="fb-inlay" cx="' + n3(xf(f)) + '" cy="' + n3(midY + sp) + '" r="0.45"/>');
      else if (INLAY.indexOf(f) >= 0) p.push('<circle class="fb-inlay" cx="' + n3(xf(f)) + '" cy="' + n3(midY) + '" r="0.45"/>');
      p.push('<text class="fb-fn" x="' + n3(xf(f)) + '" y="' + n3(top + (n - 1) * sp + 2.3) + '" text-anchor="middle">' + f + '</text>');
    }
    // nut and frets
    if (from === 0) { var xn = lefty ? W - (left + nutW) : left + nutW; p.push('<path class="fb-nut" d="M' + n3(xn) + ' ' + n3(top - 0.7) + 'V' + n3(top + (n - 1) * sp + 0.7) + '"/>'); }
    for (f = Math.max(1, from); f <= to; f++) p.push('<path class="fb-wire" d="M' + n3(xw(f)) + ' ' + n3(top - 0.7) + 'V' + n3(top + (n - 1) * sp + 0.7) + '"/>');
    // strings (the banjo's 5th string starts at its peg, at the 5th fret)
    var T = F.tuning(inst, o.tuning);
    for (var s = 1; s <= n; s++) {
      var short = I.short && s === I.short.string;
      var sx0 = short ? (from <= I.short.at ? xw(I.short.at) : x0) : x0;
      p.push('<path class="fb-str" stroke-width="' + n3(0.08 + 0.035 * (T.midi[0] > T.midi[n - 1] ? 0 : (n - s)) + (inst === 'guitar' && s >= 4 ? 0.05 : 0)) + '" d="M' + n3(sx0) + ' ' + n3(ys(s)) + 'H' + n3(x1) + '"/>');
      if (short && from <= I.short.at) p.push('<circle class="fb-peg" cx="' + n3(xw(I.short.at)) + '" cy="' + n3(ys(s)) + '" r="0.42"/>');
      var openM = T.midi[n - s] + (o.capo || 0);
      p.push('<text class="fb-sn" x="' + n3(lefty ? W - 1.2 : 1.2) + '" y="' + n3(ys(s) + 0.42) + '" text-anchor="middle">' + esc(pretty(F.pcName(openM % 12))) + '</text>');
    }
    // cells (click targets) and marks
    var marks = {}, self = this;
    this.marks.forEach(function (m) { marks[m.s + ':' + m.fret] = m; });
    Object.keys(this.lit).forEach(function (cls) { self.lit[cls].forEach(function (m) { var k = m.s + ':' + m.fret; marks[k] = Object.assign({}, marks[k] || {}, m, { cls: cls + (marks[k] && marks[k].cls ? ' ' + marks[k].cls : '') }); }); });
    for (s = 1; s <= n; s++) {
      for (f = from; f <= to; f++) {
        if (I.short && s === I.short.string && f > 0 && f <= I.short.at) continue;
        if (f === 0 && from > 0) continue;
        var cx = xf(f), cy = ys(s), M = marks[s + ':' + f];
        p.push('<rect class="fb-cell" data-s="' + s + '" data-f="' + f + '" x="' + n3(cx - fw / 2) + '" y="' + n3(cy - sp / 2) + '" width="' + fw + '" height="' + sp + '"/>');
        var showName = o.names === 'all' || (M && o.names !== 'none');
        if (M) {
          var midi = F.stringMidi(inst, o.tuning, s, f, o.capo || 0);
          var txt = M.label != null ? M.label : (showName && midi != null ? pretty(F.pcName(midi % 12, M.flat)) : (M.finger || ''));
          p.push('<g class="fb-mark ' + (M.cls || 'lit') + '"><circle cx="' + n3(cx) + '" cy="' + n3(cy) + '" r="0.72"/>' + (txt ? '<text x="' + n3(cx) + '" y="' + n3(cy + 0.33) + '" text-anchor="middle"' + (String(txt).length > 2 ? ' font-size="0.72"' : '') + '>' + esc(txt) + '</text>' : '') + '</g>');
        } else if (o.names === 'all') {
          var mm = F.stringMidi(inst, o.tuning, s, f, o.capo || 0);
          if (mm != null) p.push('<text class="fb-ghost" x="' + n3(cx) + '" y="' + n3(cy + 0.3) + '" text-anchor="middle">' + esc(pretty(F.pcName(mm % 12))) + '</text>');
        }
        if (this.flash && this.flash.s === s && this.flash.f === f) p.push('<circle class="fb-flash" cx="' + n3(cx) + '" cy="' + n3(cy) + '" r="0.8"/>');
        if (this.el.classList.contains('fb-kbd') && this.focus.s === s && this.focus.f === f) p.push('<rect class="fb-focus" x="' + n3(cx - fw / 2 + 0.2) + '" y="' + n3(cy - sp / 2 + 0.1) + '" width="' + n3(fw - 0.4) + '" height="' + n3(sp - 0.2) + '" rx="0.4"/>');
      }
    }
    p.push('</svg>');
    this.el.innerHTML = p.join('');
    this.el.appendChild(this.live);
    this.el.style.setProperty('--fb-minw', Math.round(cols * 34 + 70) + 'px');
    this.el.style.setProperty('--fb-maxw', Math.round(cols * 64 + 110) + 'px');
  };
  Board.prototype.set = function (marks) { this.marks = (marks || []).slice(); this.render(); };
  Board.prototype.light = function (list, cls) { this.lit[cls || 'lit'] = (list || []).slice(); this.render(); };
  Board.prototype.unlight = function (cls) { delete this.lit[cls || 'lit']; this.render(); };
  Board.prototype.clear = function () { this.marks = []; this.lit = {}; this.render(); };
  Board.prototype.setLefty = function (b) { this.lefty = !!b; this.render(); };
  Board.prototype.setRange = function (a, b) { this.o.from = a; this.o.to = b; this.render(); };
  Board.prototype.setOptions = function (x) { Object.assign(this.o, x || {}); if (x && x.inst) { this.inst = x.inst; this.I = F.instrument(x.inst); } this.render(); };
  Board.prototype.destroy = function () { this._off(); this.el.removeEventListener('click', this._click); this.el.removeEventListener('keydown', this._key); this.el.innerHTML = ''; };

  function scaleMarks(root, type, inst, tid, from, to) {
    var I = F.instrument(inst), rp = F.parseChord(root), sc = F.SCALES[type];
    if (!rp || !sc) return [];
    var out = [];
    for (var s = 1; s <= I.strings; s++) for (var f = from || 0; f <= (to == null ? 12 : to); f++) {
      var m = F.stringMidi(inst, tid, s, f, 0); if (m == null) continue;
      var iv = ((m - rp.rootPc) % 12 + 12) % 12, k = sc.steps.indexOf(iv);
      if (k < 0) continue;
      out.push({ s: s, fret: f, label: sc.labels[k], cls: iv === 0 ? 'root' : 'scale' });
    }
    return out;
  }

  /* ================= tab strips (for staff.js's above / below hooks) ================= */
  var LS = 1.3; // space between tab lines, in staff spaces
  function barStrokes(model, mi) {
    var Fd = model.fret; if (!Fd || !Fd.pattern) return null;
    var M = model.measures[mi]; if (!M) return null;
    var bar;
    if (Fd.pattern.cycle) { if (M.pickup) return null; bar = Fd.pattern.bars[(mi - (model.pickupTicks ? 1 : 0)) % Fd.pattern.bars.length]; }
    else bar = Fd.pattern.bars[mi];
    if (!bar || bar.silent) return null;
    var any = Fd.chords.some(function (c) { return c.m === mi && c.chord; });
    return any ? bar : null;
  }
  function countLabel(model, t) {
    var beat = model.beatTicks, q = t / beat, b = Math.floor(q + 1e-9), r = q - b;
    if (model.time.den === 8 && model.time.num % 3 === 0) { // compound time: count the eighths 1 2 3 4 5 6
      return String(Math.round(t / (model.TPQ / 2)) + 1);
    }
    if (r < 1e-6) return String(b + 1);
    if (Math.abs(r - 0.5) < 1e-6) return '&';
    if (Math.abs(r - 0.25) < 1e-6) return 'e';
    if (Math.abs(r - 0.75) < 1e-6) return 'a';
    return '';
  }
  function chordStrip(model, info) {
    var Fd = model.fret; if (!Fd || !Fd.chords.length) return { h: 0, svg: '' };
    var xAt = TRB.staff.xAt, p = [];
    info.bars.forEach(function (b) {
      Fd.chords.forEach(function (c) {
        if (c.m !== b.mi || c.cont || c.name === 'NC' && c.off > 0) return;
        if (c.off > 0) { // a repeated chord inside the bar is not named again
          var prev = Fd.chords.filter(function (x) { return x.m === b.mi && x.off < c.off; }).pop();
          if (prev && prev.name === c.name) return;
        } else if (b.mi > 0) {
          var last = Fd.chords.filter(function (x) { return x.m === b.mi - 1; }).pop();
          if (last && last.name === c.name && b !== info.bars[0]) return;
        }
        var x = xAt(b, c.off);
        p.push('<text class="ft-chord" x="' + n3(x) + '" y="1.9">' + esc(pretty(c.name === 'NC' ? 'N.C.' : c.name)) + '</text>');
      });
    });
    return { h: p.length ? 2.8 : 0, svg: p.join('') };
  }
  function tabStrip(model, info, o) {
    o = o || {};
    var Fd = model.fret, I = Fd.inst, n = I.strings, xAt = TRB.staff.xAt, G = TRB.staff.glyphs;
    var St = model.staves[0], p = [], top = 1.2, bot = top + (n - 1) * LS;
    var y = function (s) { return top + (s - 1) * LS; };
    var x0 = info.x0, x1 = info.x1;
    // lines and the TAB sign
    var d = '';
    for (var s = 1; s <= n; s++) d += 'M' + n3(x0) + ' ' + n3(y(s)) + 'H' + n3(x1);
    p.push('<path class="ft-line" d="' + d + '"/>');
    var hx = info.bars.length ? info.bars[0].x0 : x0 + 4;
    var mid = (top + bot) / 2;
    p.push('<text class="ft-tab" x="' + n3(x0 + 1.8) + '" y="' + n3(mid - 1.15) + '" text-anchor="middle">T</text><text class="ft-tab" x="' + n3(x0 + 1.8) + '" y="' + n3(mid + 0.5) + '" text-anchor="middle">A</text><text class="ft-tab" x="' + n3(x0 + 1.8) + '" y="' + n3(mid + 2.15) + '" text-anchor="middle">B</text>');
    if (info.first && (Fd.capo || Fd.tuning !== I.tuning)) {
      var tl = Fd.tun.notes.map(function (nn) { return nn.replace(/-?\d$/, ''); });
      for (s = 1; s <= n; s++) p.push('<text class="ft-tun" x="' + n3(x0 - 0.3) + '" y="' + n3(y(s) + 0.35) + '" text-anchor="end">' + esc(pretty(tl[n - s])) + '</text>');
    }
    p.push('<path class="ft-bar" d="M' + n3(x0) + ' ' + n3(top) + 'V' + n3(bot) + '"/>');
    var stemTop = bot + (o.picks !== false ? 2.2 : 0.9), stemBot = stemTop + 2.4;
    var hasPicks = false;
    var lastBar = model.measures.length - 1;
    info.bars.forEach(function (b, bi) {
      var M = St.measures[b.mi], MM = model.measures[b.mi], mk = MM.marks || {};
      // barlines and repeats
      var endRep = mk.repeat === 'end' || mk.repeat === 'both', startRep = mk.repeat === 'start' || mk.repeat === 'both';
      var dotsAt = function (x) { var a = (n % 2 === 0) ? [n / 2, n / 2 + 1] : [Math.floor(n / 2), Math.ceil(n / 2) + 1]; return '<circle class="ft-rep" cx="' + n3(x) + '" cy="' + n3((y(a[0]) + y(a[0] + 1)) / 2) + '" r="0.26"/><circle class="ft-rep" cx="' + n3(x) + '" cy="' + n3((y(a[1] - 1) + y(a[1])) / 2) + '" r="0.26"/>'; };
      if (startRep) p.push('<path class="ft-thick" d="M' + n3(b.x0 + 0.3) + ' ' + n3(top) + 'V' + n3(bot) + '"/><path class="ft-bar" d="M' + n3(b.x0 + 0.95) + ' ' + n3(top) + 'V' + n3(bot) + '"/>' + dotsAt(b.x0 + 1.5));
      if (endRep) p.push('<path class="ft-bar" d="M' + n3(b.x1 - 0.95) + ' ' + n3(top) + 'V' + n3(bot) + '"/><path class="ft-thick" d="M' + n3(b.x1 - 0.3) + ' ' + n3(top) + 'V' + n3(bot) + '"/>' + dotsAt(b.x1 - 1.5));
      else if (b.mi === lastBar) p.push('<path class="ft-bar" d="M' + n3(b.x1 - 0.95) + ' ' + n3(top) + 'V' + n3(bot) + '"/><path class="ft-thick" d="M' + n3(b.x1 - 0.3) + ' ' + n3(top) + 'V' + n3(bot) + '"/>');
      else p.push('<path class="ft-bar" d="M' + n3(b.x1 - 0.07) + ' ' + n3(top) + 'V' + n3(bot) + '"/>');
      if (o.staffless && mk.ending) p.push('<text class="ft-end" x="' + n3(b.x0 + 0.6) + '" y="' + n3(top - 0.35) + '">' + mk.ending + '.</text>');
      if (!M) return;
      // notes
      var groups = [];
      M.voices.forEach(function (v, vi) {
        v.forEach(function (it, ii) {
          var x = xAt(b, it.start) + 0.585;
          if (it.kind === 'rest') { if (vi === 0) groups.push({ it: it, x: x }); return; }
          var info2 = Fd.items[it.id] || { tech: {} };
          it.notes.forEach(function (nt) {
            var dd = Fd.notes[nt.id]; if (!dd) return;
            var label = dd.dead ? 'x' : String(dd.fret);
            if (dd.tech.harm) label = '<' + dd.fret + '>';
            if (nt.tiedFrom) label = '(' + label + ')';
            var yy = y(dd.s);
            p.push('<g class="ms-n ft-n" data-id="' + nt.id + '"><text class="ft-num" x="' + n3(x) + '" y="' + n3(yy + 0.42) + '" text-anchor="middle">' + esc(label) + '</text></g>');
            // techniques: an arc with h / p from the note before on the same string, a slant for a slide, an arrow for a bend
            var t = dd.tech;
            if (t.h || t.p || t.s) {
              var prevX = null;
              for (var k = ii - 1; k >= 0 && prevX == null; k--) {
                var pit = v[k]; if (pit.kind === 'rest') continue;
                pit.notes.forEach(function (pn) { var pd = Fd.notes[pn.id]; if (pd && pd.s === dd.s) prevX = xAt(b, pit.start) + 0.585; });
              }
              if (prevX == null) prevX = x - 2.4;
              if (t.s) { var up = true; p.push('<path class="ft-tech" d="M' + n3(prevX + 0.75) + ' ' + n3(yy + (up ? 0.35 : -0.35)) + 'L' + n3(x - 0.75) + ' ' + n3(yy - (up ? 0.35 : -0.35)) + '"/>'); }
              else {
                p.push('<path class="ft-tech" d="M' + n3(prevX + 0.2) + ' ' + n3(yy - 0.75) + 'Q' + n3((prevX + x) / 2) + ' ' + n3(yy - 1.9) + ' ' + n3(x - 0.2) + ' ' + n3(yy - 0.75) + '"/>');
                p.push('<text class="ft-tl" x="' + n3((prevX + x) / 2) + '" y="' + n3(yy - 1.55) + '" text-anchor="middle">' + (t.h ? 'H' : 'P') + '</text>');
              }
            }
            if (t.si) p.push('<path class="ft-tech" d="M' + n3(x - 2.0) + ' ' + n3(yy + 0.5) + 'L' + n3(x - 0.75) + ' ' + n3(yy - 0.1) + '"/>');
            if (t.b || t.bh) p.push('<path class="ft-tech" d="M' + n3(x + 0.6) + ' ' + n3(yy) + 'Q' + n3(x + 1.6) + ' ' + n3(yy) + ' ' + n3(x + 1.6) + ' ' + n3(yy - 2.2) + '"/><path class="ft-arrow" d="M' + n3(x + 1.25) + ' ' + n3(yy - 1.75) + 'L' + n3(x + 1.6) + ' ' + n3(yy - 2.4) + 'L' + n3(x + 1.95) + ' ' + n3(yy - 1.75) + 'Z"/><text class="ft-tl" x="' + n3(x + 1.6) + '" y="' + n3(yy - 2.7) + '" text-anchor="middle">' + (t.b ? 'full' : '½') + '</text>');
            if (dd.pick && o.picks !== false) { hasPicks = true; }
          });
          if (info2.pick && o.picks !== false) p.push('<text class="ft-pick" x="' + n3(x) + '" y="' + n3(bot + 1.55) + '" text-anchor="middle">' + esc(info2.pick) + '</text>');
          if (vi === 0) groups.push({ it: it, x: x });
        });
      });
      // rhythm under the tab (voice 1)
      if (o.rhythm !== false) {
        var beatG = model.time.den === 8 && model.time.num % 3 === 0 ? model.TPQ * 1.5 : model.TPQ;
        var beams = [], cur = null;
        groups.forEach(function (g) {
          var it = g.it;
          if (it.kind === 'rest') {
            cur = null;
            var rg = G['r' + (it.measureRest ? 1 : it.base)];
            if (rg) p.push('<path class="ft-rest" d="' + rg.d + '" transform="translate(' + n3(g.x - 0.4) + ' ' + n3(stemTop + 1.2) + ') scale(0.75)"/>');
            return;
          }
          if (it.base >= 2) p.push('<path class="ft-stem" d="M' + n3(g.x) + ' ' + n3(it.base === 2 ? stemTop + 1.2 : stemTop) + 'V' + n3(stemBot) + '"/>');
          if (it.dots) p.push('<circle class="ft-dot" cx="' + n3(g.x + 0.55) + '" cy="' + n3(stemBot - 0.3) + '" r="0.18"/>');
          if (it.base >= 8) {
            var grp = Math.floor(it.start / beatG);
            if (cur && cur.grp === grp && !(it.tuplet && !cur.tup) ) cur.list.push(g); else { cur = { grp: grp, list: [g], tup: !!it.tuplet }; beams.push(cur); }
          } else cur = null;
          if (it.tuplet && it.tuplet.first) g.tupStart = true;
        });
        beams.forEach(function (B) {
          var L = B.list;
          if (L.length === 1) { // a flag
            var g = L[0], nf = { 8: 1, 16: 2, 32: 3 }[g.it.base] || 1;
            for (var k = 0; k < nf; k++) p.push('<path class="ft-stem" d="M' + n3(g.x) + ' ' + n3(stemBot - k * 0.55) + 'q0.8 -0.3 0.9 -1.0"/>');
            return;
          }
          var xa = L[0].x, xb = L[L.length - 1].x;
          p.push('<path class="ft-beam" d="M' + n3(xa) + ' ' + n3(stemBot - 0.2) + 'H' + n3(xb) + 'v0.38H' + n3(xa) + 'Z"/>');
          for (var q = 0; q < L.length; q++) if (L[q].it.base >= 16) {
            var nb = q + 1 < L.length && L[q + 1].it.base >= 16 ? L[q + 1].x : (q > 0 && L[q - 1].it.base >= 16 ? null : L[q].x + (q + 1 < L.length ? 0.9 : -0.9));
            if (nb != null) p.push('<path class="ft-beam" d="M' + n3(L[q].x) + ' ' + n3(stemBot - 0.8) + 'H' + n3(nb) + 'v0.38H' + n3(L[q].x) + 'Z"/>');
          }
          if (L[0].it.tuplet) p.push('<text class="ft-tl" x="' + n3((xa + xb) / 2) + '" y="' + n3(stemBot + 1.25) + '" text-anchor="middle">' + L[0].it.tuplet.n + '</text>');
        });
      }
    });
    var h = (o.rhythm !== false ? stemBot + 0.6 : bot + (hasPicks ? 2.3 : 1.2));
    // strum arrows and counts
    if (o.strum !== false && Fd.pattern) {
      var sy = h + 0.4, any = false;
      info.bars.forEach(function (b) {
        var strokes = barStrokes(model, b.mi);
        if (!strokes) return;
        any = true;
        strokes.forEach(function (st, k) {
          if (st.t >= b.len) return;
          var x = xAt(b, st.t) + 0.585;
          p.push('<g class="ft-st" data-m="' + b.mi + '" data-k="' + k + '">' + strokeMark(st, x, sy) + '<text class="ft-count" x="' + n3(x) + '" y="' + n3(sy + 4.1) + '" text-anchor="middle">' + countLabel(model, st.t) + '</text></g>');
        });
      });
      if (any) h = sy + 4.7;
    }
    return { h: h, svg: p.join(''), cursor: [top - 0.9, bot + 0.9] };
  }
  // one stroke of a pattern at x (center), y = top of a 3-unit tall cell
  function strokeMark(st, x, y) {
    var acc = st.accent ? '<text class="ft-acc" x="' + n3(x) + '" y="' + n3(y - 0.1) + '" text-anchor="middle">&gt;</text>' : '';
    if (st.kind === 'down' || st.kind === 'up' || st.kind === 'miss') {
      var dn = st.kind !== 'up', ya = y + 0.4, yb = y + 2.9, cls = st.kind === 'miss' ? 'ft-arw ft-miss' : 'ft-arw';
      var tipY = dn ? yb : ya, tailY = dn ? ya : yb, sgn = dn ? -1 : 1;
      return acc + '<path class="' + cls + '" d="M' + n3(x) + ' ' + n3(tailY) + 'V' + n3(tipY + sgn * 0.6) + '"/><path class="' + cls + ' ft-head" d="M' + n3(x - 0.5) + ' ' + n3(tipY + sgn * 0.75) + 'L' + n3(x) + ' ' + n3(tipY) + 'L' + n3(x + 0.5) + ' ' + n3(tipY + sgn * 0.75) + 'Z"/>';
    }
    if (st.kind === 'mute') return acc + '<path class="ft-arw" d="M' + n3(x - 0.55) + ' ' + n3(y + 1.1) + 'l1.1 1.1M' + n3(x + 0.55) + ' ' + n3(y + 1.1) + 'l-1.1 1.1"/>';
    if (st.kind === 'rest') return '<text class="ft-letter ft-dim" x="' + n3(x) + '" y="' + n3(y + 2.1) + '" text-anchor="middle">·</text>';
    var lt = st.kind === 'bass' ? (st.finger === 'p' ? 'p' : 'B' + (st.bass === 2 ? '²' : '')) : st.kind === 'pinch' ? st.parts.map(function (q) { return q.kind === 'bass' ? 'B' : q.finger; }).join('+') : st.finger;
    var sub = st.kind === 'pluck' ? '<text class="ft-sub" x="' + n3(x) + '" y="' + n3(y + 3.0) + '" text-anchor="middle">' + st.strings[0] + '</text>' : '';
    return acc + '<text class="ft-letter" x="' + n3(x) + '" y="' + n3(y + 1.9) + '" text-anchor="middle">' + esc(lt) + '</text>' + sub;
  }

  /* ================= the combined view ================= */
  function View(el, model, o) {
    var self = this;
    this.el = el; this.model = model; this.o = Object.assign({ notation: true, tab: true, rhythm: true, strum: true }, o || {});
    el.classList.add('ft-view');
    this.make();
  }
  View.prototype.make = function () {
    var self = this, o = this.o, M = this.model;
    if (this.score) this.score.destroy();
    var lit = this.score ? Object.assign({}, this.score.lit) : {}, cur = this.score ? this.score.cur : null;
    this.score = TRB.staff.render(this.el, M, {
      letters: !!o.letters, clef8: M.fret.transpose === 12, staffless: !o.notation, fingering: false,
      label: o.label || ('Music and tab: ' + (M.meta.title || 'notes') + ', ' + M.key.label + ', ' + M.time.str + ' time'),
      above: function (info) { return chordStrip(M, info); },
      below: o.tab === false ? null : function (info) { return tabStrip(M, info, { rhythm: o.rhythm, strum: o.strum, staffless: !o.notation }); },
      onClick: o.onClick
    });
    if (o.onClick) this.el.classList.add('ms-clickable');
    Object.keys(lit).forEach(function (id) { self.score.highlight([id], lit[id]); });
    if (cur) this.score.cursor(cur[0], cur[1]);
  };
  ['cursor', 'scrollTo', 'highlight', 'unhighlight', 'clear', 'measureBox', 'relayout'].forEach(function (m) {
    View.prototype[m] = function () { return this.score[m].apply(this.score, arguments); };
  });
  Object.defineProperty(View.prototype, 'lit', { get: function () { return this.score.lit; } });
  View.prototype.setLetters = function (on) { this.o.letters = !!on; this.make(); };
  View.prototype.setParts = function (p) { Object.assign(this.o, p || {}); if (!this.o.notation && this.o.tab === false) this.o.tab = true; this.make(); };
  View.prototype.litStroke = function (mi, k) {
    var old = this.el.querySelectorAll('.ft-st.on');
    for (var i = 0; i < old.length; i++) old[i].classList.remove('on');
    if (mi == null) return;
    var e = this.el.querySelector('.ft-st[data-m="' + mi + '"][data-k="' + k + '"]');
    if (e) e.classList.add('on');
  };
  View.prototype.destroy = function () { this.score.destroy(); };

  /* ================= a pattern on its own ================= */
  function pattern(p0, o) {
    o = o || {};
    var inst = o.inst || 'guitar', I = F.instrument(inst), TPQ = F.TPQ;
    var P = typeof p0 === 'string' ? F.parsePattern(p0, { instrument: inst }) : p0;
    var bars = P.bars || [], strokes = [];
    var t0 = 0;
    bars.forEach(function (b) { b.forEach(function (st) { strokes.push(Object.assign({}, st, { at: t0 + st.t })); }); t0 += b.len || 0; });
    var total = t0 || TPQ * 4, unit = 3.0 / (TPQ / 2); // 3 units per eighth note
    var picky = strokes.some(function (st) { return st.kind === 'pluck' || st.kind === 'bass' || st.kind === 'pinch'; });
    var claw = strokes.some(function (st) { return st.finger === 'S'; });
    var n = I.strings, W = 3 + total * unit + 1, p = [], top = 2.2;
    var v = null;
    if (picky) { var list = F.shapesFor(o.chord || (inst === 'banjo' ? 'G' : inst === 'ukulele' ? 'C' : 'C'), inst, o.tuning, { limit: 1 }); v = list[0]; }
    var tabH = picky ? (n - 1) * LS : 0;
    var H = top + tabH + (picky ? 2.0 : 3.6) + 4.2 + (claw && o.syllables !== false ? 1.6 : 0);
    var label = o.label || ('Right-hand pattern: ' + strokes.map(function (st) { return st.tok; }).join(' '));
    p.push('<svg xmlns="' + NS + '" class="fp" style="--fp-maxw:' + Math.round(W * 14) + 'px" viewBox="0 0 ' + n3(W) + ' ' + n3(H) + '" role="img" aria-label="' + esc(label) + '">');
    var X = function (t) { return 2.5 + t * unit + 0.6; };
    // beat grid
    var beatT = TPQ, bi = 0;
    for (var t = 0; t < total; t += beatT, bi++) p.push('<rect class="fp-beat' + (bi % 2 ? ' odd' : '') + '" x="' + n3(X(t) - 1.4) + '" y="0.2" width="' + n3(beatT * unit) + '" height="' + n3(H - 0.4) + '" rx="0.6"/>');
    var y0 = top;
    if (picky) {
      var d = '';
      for (var s = 1; s <= n; s++) d += 'M1.2 ' + n3(top + (s - 1) * LS) + 'H' + n3(W - 0.6);
      p.push('<path class="ft-line" d="' + d + '"/>');
      strokes.forEach(function (st, k) {
        var x = X(st.at), parts = st.kind === 'pinch' ? st.parts : [st], sx = [];
        parts.forEach(function (q) {
          var s2 = null;
          if (q.kind === 'pluck') s2 = q.strings[0];
          else if (q.kind === 'bass' && v) { var bs = F.bassStrings(v, F.parseChord(o.chord || (inst === 'banjo' ? 'G' : 'C')), I); s2 = (bs[q.bass === 2 ? 1 : 0] || {}).s; }
          if (s2 == null) return;
          var f = v ? v.frets[I.strings - s2] : 0;
          if (f < 0) f = 0;
          sx.push('<text class="ft-num" x="' + n3(x) + '" y="' + n3(top + (s2 - 1) * LS + 0.42) + '" text-anchor="middle">' + f + '</text>');
        });
        if (st.kind === 'down' || st.kind === 'up' || st.kind === 'mute' || st.kind === 'miss') sx.push(strokeMark(st, x, top + tabH / 2 - 1.5));
        p.push('<g class="fp-st' + (o.lit === k ? ' on' : '') + '" data-k="' + k + '">' + sx.join('') + '</g>');
      });
      y0 = top + tabH + 0.8;
    }
    strokes.forEach(function (st, k) {
      var x = X(st.at), g = '';
      if (picky) {
        var lt = st.kind === 'pinch' ? st.parts.map(function (q) { return q.kind === 'bass' ? (q.finger === 'p' ? 'p' : 'T') : q.finger; }).join('+') : st.kind === 'bass' ? (st.finger || 'T') : st.kind === 'down' ? 'D' : st.kind === 'up' ? 'U' : st.finger || '';
        g = '<text class="ft-letter" x="' + n3(x) + '" y="' + n3(y0 + 1.6) + '" text-anchor="middle">' + esc(lt) + '</text>';
      } else g = strokeMark(st, x, y0);
      var cl = countLabel({ beatTicks: TPQ, time: { den: 4, num: 4 }, TPQ: TPQ }, st.at % (TPQ * 4));
      g += '<text class="ft-count" x="' + n3(x) + '" y="' + n3(y0 + (picky ? 3.4 : 4.3)) + '" text-anchor="middle">' + cl + '</text>';
      if (claw && o.syllables !== false) {
        var syl = st.finger === 'S' ? 'bum' : st.kind === 'down' ? 'dit' : st.finger === 'T' ? 'ty' : '';
        g += '<text class="ft-syl" x="' + n3(x) + '" y="' + n3(y0 + (picky ? 4.9 : 5.8)) + '" text-anchor="middle">' + syl + '</text>';
      }
      p.push('<g class="fp-st' + (o.lit === k ? ' on' : '') + '" data-k="' + k + '">' + g + '</g>');
    });
    p.push('</svg>');
    return p.join('');
  }

  F.draw = {
    diagram: diagram, chordBox: chordBox, fretboard: function (el, o) { var b = new Board(el, o); b._id = ++uid; return b; }, Board: Board,
    scaleMarks: scaleMarks, tabStrip: tabStrip, chordStrip: chordStrip, view: function (el, m, o) { return new View(el, m, o); }, View: View,
    pattern: pattern, strokeMark: strokeMark, barStrokes: barStrokes, countLabel: countLabel
  };
})();
