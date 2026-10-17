/* TRBMusic.keyboard: an on-screen piano keyboard (Teddy Rook Book, music kit). Uses TRBMusic.audio for sound when present.

   create(el, opts) -> Keyboard
     opts { from: 48 (C3), to: 84 (C6)      the full range (MIDI numbers; 60 = middle C)
            minKey: 26 (36 on touch screens) the narrowest white key in px; when the range doesn't fit, the keyboard shows
                                            whole octaves that do fit, with octave-shift buttons (phones)
            labels: 'c' | 'all' | 'none'    letter names on the white keys ('c': only the Cs, with "middle C" on C4)
            sound: true                     play the synthesized piano when a key is pressed
            computerKeys: true              the computer keyboard plays it (true = whenever the page has no text field
                                            focused; 'focus' = only while the keyboard has focus; false = off)
            midi: true                      Web MIDI input when the browser offers it (connects silently if permission
                                            was already given, otherwise shows a small "Use a MIDI keyboard" button)
            velocity: 0.7, label: 'Piano keyboard', toolbar: true }
   Computer keys (by physical position, so other layouts work too):
       white keys  A S D F G H J K L ; '   = C D E F G A B C D E F
       black keys  W E   T Y U   O P       = C♯ D♯  F♯ G♯ A♯  C♯ D♯
       Z / X       octave down / up (the A key starts at C4, middle C, at first)
   Methods
     highlight(midi, hand)      light a key ('rh' blue, 'lh' orange, 'ok', 'bad', 'hint' gold outline, or any word:
                                 adds class hl-<word>);  unhighlight(midi, hand);  clear(hand)  (no hand: all)
     flash(midi, hand, ms)      light briefly
     setRange(from, to)         change the full range;  shift(octaves) move the visible window;  follow(midis) make sure
                                 these keys are in view
     showComputerKeys(bool)     show the computer-key letters on the piano keys
     press(midi, source, vel) / release(midi, source)   act as if a key were pressed (fires events, plays sound)
     on(type, fn) / off(type, fn)  events 'down' and 'up' with { midi, source: 'mouse'|'touch'|'pen'|'key'|'midi',
                                 velocity }; also a DOM CustomEvent 'trb-key' ({ detail: { type, midi, source, velocity } })
     connectMidi()              ask for MIDI access (from a click);  isDown(midi);  destroy()
   Key elements carry data-midi and an aria-label ("C4, middle C"); the keyboard root is a focusable group.
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  var FLATS = ['', 'D♭', '', 'E♭', '', '', 'G♭', '', 'A♭', '', 'B♭', ''];
  var WHITE = { 0: 1, 2: 1, 4: 1, 5: 1, 7: 1, 9: 1, 11: 1 };
  // black key left edges within their white-key group, in white-key widths (C–E split in 5, F–B split in 7)
  var BLACK_X = { 1: 0.6, 3: 1.8, 6: 3 + 4 / 7, 8: 3 + 12 / 7, 10: 3 + 20 / 7 };
  var BLACK_W = { 1: 0.6, 3: 0.6, 6: 4 / 7, 8: 4 / 7, 10: 4 / 7 };
  var CODES = { KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16, Quote: 17 };
  var CODE_LABEL = { KeyA: 'A', KeyW: 'W', KeyS: 'S', KeyE: 'E', KeyD: 'D', KeyF: 'F', KeyT: 'T', KeyG: 'G', KeyY: 'Y', KeyH: 'H', KeyU: 'U', KeyJ: 'J', KeyK: 'K', KeyO: 'O', KeyL: 'L', KeyP: 'P', Semicolon: ';', Quote: "'" };
  var active = null; // the keyboard the computer keys play

  function isWhite(m) { return !!WHITE[((m % 12) + 12) % 12]; }
  function name(m) { var pc = ((m % 12) + 12) % 12; return NAMES[pc] + (Math.floor(m / 12) - 1); }
  function longName(m) {
    var pc = ((m % 12) + 12) % 12, o = Math.floor(m / 12) - 1;
    var s = NAMES[pc] + o + (FLATS[pc] ? ' or ' + FLATS[pc] + o : '');
    return m === 60 ? s + ', middle C' : s;
  }
  function whiteIndex(m) { // number of white keys below m (from MIDI 0)
    var o = Math.floor(m / 12), pc = m - o * 12, w = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6][pc];
    return o * 7 + w;
  }

  function Keyboard(el, opts) {
    var self = this;
    this.el = el;
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    this.o = Object.assign({ from: 48, to: 84, minKey: coarse ? 36 : 26, labels: 'c', sound: true, computerKeys: true, midi: true, velocity: 0.7, label: 'Piano keyboard', toolbar: true }, opts || {});
    this.handlers = { down: [], up: [] };
    this.down = {};      // midi -> count of sources holding it
    this.ptr = {};       // pointerId -> midi
    this.keysDown = {};  // KeyboardEvent.code -> midi
    this.lit = {};       // midi -> { hand: true }
    this.kbBase = 60;
    this.showCK = false;
    el.classList.add('mk');
    el.innerHTML = '';
    if (this.o.toolbar) {
      var bar = document.createElement('div');
      bar.className = 'mk-bar';
      bar.innerHTML = '<button type="button" class="mk-oct mk-lo" aria-label="Show lower keys">◀ <span>lower</span></button>' +
        '<span class="mk-range" aria-live="polite"></span>' +
        '<button type="button" class="mk-oct mk-hi" aria-label="Show higher keys"><span>higher</span> ▶</button>' +
        '<span class="mk-sp"></span>' +
        '<span class="mk-midi" hidden></span>' +
        '<button type="button" class="mk-ckb" aria-pressed="false" title="Play with the computer keyboard">⌨ <span>Computer keys</span></button>';
      el.appendChild(bar);
      this.bar = bar;
      bar.querySelector('.mk-lo').addEventListener('click', function () { self.shift(-1); });
      bar.querySelector('.mk-hi').addEventListener('click', function () { self.shift(1); });
      bar.querySelector('.mk-ckb').addEventListener('click', function () { self.showComputerKeys(!self.showCK); });
    }
    var keys = document.createElement('div');
    keys.className = 'mk-keys';
    keys.setAttribute('role', 'group');
    keys.setAttribute('tabindex', '0');
    keys.setAttribute('aria-label', this.o.label + '. Click or touch the keys, or use the computer keyboard: A S D F G H J K for C D E F G A B C, W E T Y U for the black keys, Z and X to change octave.');
    el.appendChild(keys);
    this.keysEl = keys;
    var help = document.createElement('p');
    help.className = 'mk-help';
    help.hidden = true;
    help.innerHTML = 'Computer keys: <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd> <kbd>G</kbd> <kbd>H</kbd> <kbd>J</kbd> <kbd>K</kbd> play C D E F G A B C; <kbd>W</kbd> <kbd>E</kbd> <kbd>T</kbd> <kbd>Y</kbd> <kbd>U</kbd> <kbd>O</kbd> <kbd>P</kbd> are the black keys; <kbd>Z</kbd> and <kbd>X</kbd> move them an octave down or up. <span class="mk-base"></span>';
    el.appendChild(help);
    this.helpEl = help;
    this.view = [this.o.from, this.o.to];
    this.build();
    // pointer input (mouse, pen, multi-touch; slide across keys for a glissando)
    keys.addEventListener('pointerdown', function (e) {
      var m = self.keyAt(e);
      if (m == null) return;
      e.preventDefault();
      try { keys.setPointerCapture(e.pointerId); } catch (er) {}
      self.ptr[e.pointerId] = m;
      active = self;
      self.press(m, e.pointerType || 'mouse', self.velFrom(e, m));
    });
    keys.addEventListener('pointermove', function (e) {
      if (!(e.pointerId in self.ptr)) return;
      var m = self.keyAt(e);
      if (m == null || m === self.ptr[e.pointerId]) return;
      self.release(self.ptr[e.pointerId], e.pointerType || 'mouse');
      self.ptr[e.pointerId] = m;
      self.press(m, e.pointerType || 'mouse', self.velFrom(e, m));
    });
    function up(e) {
      if (!(e.pointerId in self.ptr)) return;
      self.release(self.ptr[e.pointerId], e.pointerType || 'mouse');
      delete self.ptr[e.pointerId];
    }
    keys.addEventListener('pointerup', up);
    keys.addEventListener('pointercancel', up);
    keys.addEventListener('lostpointercapture', up);
    keys.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    keys.addEventListener('focus', function () { active = self; });
    // computer keys
    this._kd = function (e) { self.onKey(e, true); };
    this._ku = function (e) { self.onKey(e, false); };
    this._blur = function () { Object.keys(self.keysDown).forEach(function (c) { self.release(self.keysDown[c], 'key'); }); self.keysDown = {}; };
    if (this.o.computerKeys) {
      document.addEventListener('keydown', this._kd);
      document.addEventListener('keyup', this._ku);
      window.addEventListener('blur', this._blur);
      if (!active) active = this;
    }
    // resize: recompute the visible window
    var lastW = 0;
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(function () { var w = el.clientWidth; if (Math.abs(w - lastW) > 2) { lastW = w; self.fit(); } });
      this.ro.observe(el);
    }
    this.fit();
    if (this.o.midi) this.initMidi();
  }

  // MIDI number of the n-th white key (counting from MIDI 0)
  function whiteAt(i) { var o = Math.floor(i / 7); return o * 12 + [0, 2, 4, 5, 7, 9, 11][i - o * 7]; }
  Keyboard.prototype.fit = function () {
    var W = this.keysEl.clientWidth || this.el.clientWidth || 600;
    var from = this.o.from, to = this.o.to;
    var w0 = whiteIndex(from), w1 = whiteIndex(to), nW = w1 - w0 + 1;
    if (W / nW >= this.o.minKey) { this.view = [from, to]; this.windowed = false; }
    else {
      var fitW = Math.max(8, Math.floor(W / this.o.minKey)); // white keys that fit
      var center = this.view ? (this.view[0] + this.view[1]) / 2 : 60;
      var c0 = whiteIndex(Math.round(center)) - Math.floor(fitW / 2);
      c0 = Math.round(c0 / 7) * 7; // start on a C when possible
      c0 = Math.max(w0, Math.min(c0, w1 - fitW + 1));
      this.view = [whiteAt(c0), whiteAt(c0 + fitW - 1)];
      this.windowed = true;
    }
    this.build();
  };
  Keyboard.prototype.build = function () {
    var self = this, a = this.view[0], b = this.view[1];
    if (!isWhite(a)) a--;
    if (!isWhite(b)) b++;
    this.v0 = a; this.v1 = b;
    var w0 = whiteIndex(a), nW = whiteIndex(b) - w0 + 1, html = [];
    var wide = (this.keysEl.clientWidth || 600) / nW >= 46; // room for the words "middle C"?
    for (var m = a; m <= b; m++) {
      var pc = ((m % 12) + 12) % 12, oct = Math.floor(m / 12);
      var lit = this.lit[m] ? Object.keys(this.lit[m]).map(function (h) { return ' hl-' + h; }).join('') : '';
      var dn = this.down[m] ? ' down' : '';
      if (WHITE[pc]) {
        var i = whiteIndex(m) - w0;
        var lab = '';
        if (this.o.labels === 'all' || (this.o.labels === 'c' && pc === 0)) lab = '<span class="mk-lab">' + (pc === 0 ? 'C' + (oct - 1) : NAMES[pc]) + '</span>';
        if (m === 60 && this.o.labels !== 'none' && wide) lab = '<span class="mk-mid">middle C</span>' + lab;
        html.push('<div class="mk-w' + lit + dn + (m === 60 ? ' mk-c4' : '') + '" data-midi="' + m + '" role="button" aria-label="' + longName(m) + '" style="left:' + (i / nW * 100) + '%;width:' + (100 / nW) + '%">' + lab + '<span class="mk-ck"></span></div>');
      } else {
        var gx = (oct * 7 - w0) + BLACK_X[pc];
        html.push('<div class="mk-b' + lit + dn + '" data-midi="' + m + '" role="button" aria-label="' + longName(m) + '" style="left:' + (gx / nW * 100) + '%;width:' + (BLACK_W[pc] / nW * 100 * 0.98) + '%"><span class="mk-ck"></span></div>');
      }
    }
    this.keysEl.innerHTML = html.join('');
    this.keyEls = {};
    var els = this.keysEl.children;
    for (var k = 0; k < els.length; k++) this.keyEls[+els[k].getAttribute('data-midi')] = els[k];
    var wpx = (this.keysEl.clientWidth || 600) / nW;
    this.keysEl.style.setProperty('--mk-h', Math.round(Math.max(96, Math.min(180, wpx * 4.2, window.innerHeight * 0.2 + 30))) + 'px');
    if (this.bar) {
      this.bar.querySelector('.mk-range').textContent = name(this.v0) + ' – ' + name(this.v1);
      var lo = this.bar.querySelector('.mk-lo'), hi = this.bar.querySelector('.mk-hi');
      lo.hidden = hi.hidden = !this.windowed;
      lo.disabled = this.view[0] <= this.o.from;
      hi.disabled = this.view[1] >= this.o.to;
    }
    this.paintCK();
  };
  Keyboard.prototype.keyAt = function (e) {
    var t = document.elementFromPoint(e.clientX, e.clientY);
    var k = t && t.closest && t.closest('[data-midi]');
    if (!k || !this.keysEl.contains(k)) return null;
    return +k.getAttribute('data-midi');
  };
  Keyboard.prototype.velFrom = function (e, m) {
    var k = this.keyEls[m];
    if (!k) return this.o.velocity;
    var r = k.getBoundingClientRect(), f = (e.clientY - r.top) / Math.max(1, r.height);
    return Math.max(0.35, Math.min(0.95, 0.45 + 0.5 * f));
  };
  Keyboard.prototype.emit = function (type, d) {
    this.handlers[type].forEach(function (fn) { try { fn(d); } catch (e) { setTimeout(function () { throw e; }); } });
    try { this.el.dispatchEvent(new CustomEvent('trb-key', { detail: Object.assign({ type: type }, d) })); } catch (e) {}
  };
  Keyboard.prototype.press = function (m, source, vel) {
    vel = vel == null ? this.o.velocity : vel;
    this.down[m] = (this.down[m] || 0) + 1;
    var k = this.keyEls[m];
    if (k) k.classList.add('down');
    if (this.o.sound && TRB.audio) { TRB.audio.unlock(); TRB.audio.noteOff(m); TRB.audio.noteOn(m, vel); }
    this.emit('down', { midi: m, source: source || 'mouse', velocity: vel });
  };
  Keyboard.prototype.release = function (m, source) {
    if (!this.down[m]) return;
    this.down[m]--;
    if (this.down[m] > 0) return;
    delete this.down[m];
    var k = this.keyEls[m];
    if (k) k.classList.remove('down');
    if (this.o.sound && TRB.audio) TRB.audio.noteOff(m);
    this.emit('up', { midi: m, source: source || 'mouse' });
  };
  Keyboard.prototype.isDown = function (m) { return !!this.down[m]; };
  Keyboard.prototype.onKey = function (e, isDown) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (this.o.computerKeys === 'focus' && !this.el.contains(document.activeElement)) return;
    if (this.o.computerKeys !== 'focus' && active && active !== this) return;
    var code = e.code;
    if (isDown && (code === 'KeyZ' || code === 'KeyX')) {
      if (e.repeat) return;
      this.kbBase = Math.max(24, Math.min(96, this.kbBase + (code === 'KeyZ' ? -12 : 12)));
      this.paintCK();
      e.preventDefault();
      return;
    }
    if (!(code in CODES)) return;
    e.preventDefault();
    if (isDown) {
      if (e.repeat || this.keysDown[code] != null) return;
      var m = this.kbBase + CODES[code];
      this.keysDown[code] = m;
      this.follow([m]);
      this.press(m, 'key', this.o.velocity);
    } else if (this.keysDown[code] != null) {
      this.release(this.keysDown[code], 'key');
      delete this.keysDown[code];
    }
  };
  Keyboard.prototype.paintCK = function () {
    var self = this;
    Object.keys(this.keyEls || {}).forEach(function (m) { var s = self.keyEls[m].querySelector('.mk-ck'); if (s) s.textContent = ''; });
    if (this.showCK) Object.keys(CODES).forEach(function (c) {
      var k = self.keyEls[self.kbBase + CODES[c]];
      if (k) k.querySelector('.mk-ck').textContent = CODE_LABEL[c];
    });
    var b = this.helpEl.querySelector('.mk-base');
    if (b) b.textContent = 'Right now A plays ' + name(this.kbBase) + (this.kbBase === 60 ? ' (middle C).' : '.');
  };
  Keyboard.prototype.showComputerKeys = function (on) {
    this.showCK = !!on;
    this.helpEl.hidden = !on;
    if (this.bar) this.bar.querySelector('.mk-ckb').setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) { active = this; this.follow([this.kbBase, this.kbBase + 12]); }
    this.paintCK();
  };
  Keyboard.prototype.highlight = function (m, hand) {
    hand = hand || 'rh';
    (this.lit[m] = this.lit[m] || {})[hand] = true;
    var k = this.keyEls[m];
    if (k) k.classList.add('hl-' + hand);
  };
  Keyboard.prototype.unhighlight = function (m, hand) {
    var L = this.lit[m];
    if (!L) return;
    var k = this.keyEls[m];
    (hand ? [hand] : Object.keys(L)).forEach(function (h) { delete L[h]; if (k) k.classList.remove('hl-' + h); });
    if (!Object.keys(L).length) delete this.lit[m];
  };
  Keyboard.prototype.clear = function (hand) {
    var self = this;
    Object.keys(this.lit).forEach(function (m) { self.unhighlight(+m, hand); });
  };
  Keyboard.prototype.flash = function (m, hand, ms) {
    var self = this;
    this.highlight(m, hand);
    setTimeout(function () { self.unhighlight(m, hand); }, ms || 350);
  };
  Keyboard.prototype.setRange = function (from, to) {
    this.o.from = Math.max(21, Math.min(from, to - 12));
    this.o.to = Math.min(108, Math.max(to, from + 12));
    this.view = [this.o.from, this.o.to];
    this.fit();
  };
  Keyboard.prototype.moveTo = function (c0) {
    var w0 = whiteIndex(this.o.from), w1 = whiteIndex(this.o.to), n = whiteIndex(this.view[1]) - whiteIndex(this.view[0]) + 1;
    c0 = Math.max(w0, Math.min(c0, w1 - n + 1));
    this.view = [whiteAt(c0), whiteAt(c0 + n - 1)];
    this.build();
  };
  Keyboard.prototype.shift = function (oct) {
    if (!this.windowed) return;
    this.moveTo(whiteIndex(this.view[0]) + oct * 7);
  };
  Keyboard.prototype.follow = function (ms) {
    if (!this.windowed || !ms || !ms.length) return;
    var lo = Math.min.apply(null, ms), hi = Math.max.apply(null, ms);
    if (lo >= this.view[0] && hi <= this.view[1]) return;
    var n = whiteIndex(this.view[1]) - whiteIndex(this.view[0]) + 1;
    var c0 = whiteIndex(lo) - Math.max(1, Math.floor((n - (whiteIndex(hi) - whiteIndex(lo) + 1)) / 2));
    if (whiteIndex(hi) - whiteIndex(lo) + 1 > n) c0 = whiteIndex(lo);
    var snap = Math.round(c0 / 7) * 7;
    if (snap <= whiteIndex(lo) && snap + n - 1 >= whiteIndex(hi)) c0 = snap;
    this.moveTo(c0);
  };
  Keyboard.prototype.on = function (t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); return this; };
  Keyboard.prototype.off = function (t, fn) { var h = this.handlers[t] || []; var i = h.indexOf(fn); if (i >= 0) h.splice(i, 1); return this; };

  /* Web MIDI */
  Keyboard.prototype.initMidi = function () {
    var self = this;
    if (!navigator.requestMIDIAccess) return;
    var showBtn = function () {
      if (!self.bar || self.bar.querySelector('.mk-midibtn')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mk-midibtn'; b.innerHTML = 'MIDI<span> keyboard</span>';
      b.title = 'Play along on a MIDI keyboard plugged into this computer';
      b.addEventListener('click', function () { self.connectMidi(); });
      self.bar.insertBefore(b, self.bar.querySelector('.mk-ckb'));
    };
    try {
      navigator.permissions.query({ name: 'midi' }).then(function (p) {
        if (p.state === 'granted') self.connectMidi(); else showBtn();
      }, showBtn);
    } catch (e) { showBtn(); }
  };
  Keyboard.prototype.connectMidi = function () {
    var self = this;
    if (!navigator.requestMIDIAccess) return Promise.resolve(false);
    return navigator.requestMIDIAccess().then(function (acc) {
      self.midiAccess = acc;
      var hook = function () {
        var n = 0;
        acc.inputs.forEach(function (inp) { n++; inp.onmidimessage = function (ev) { self.onMidi(ev.data); }; });
        var st = self.bar && self.bar.querySelector('.mk-midi');
        if (st) { st.hidden = !n; st.textContent = n ? 'MIDI keyboard connected' : ''; }
        var btn = self.bar && self.bar.querySelector('.mk-midibtn');
        if (btn) btn.hidden = true;
      };
      acc.onstatechange = hook;
      hook();
      return true;
    }, function () {
      var btn = self.bar && self.bar.querySelector('.mk-midibtn');
      if (btn) btn.textContent = 'No MIDI';
      return false;
    });
  };
  Keyboard.prototype.onMidi = function (d) {
    var st = d[0] & 0xf0, m = d[1], v = d[2];
    if (st === 0x90 && v > 0) { active = this; this.follow([m]); this.press(m, 'midi', Math.max(0.15, v / 127)); }
    else if (st === 0x80 || (st === 0x90 && v === 0)) this.release(m, 'midi');
    else if (st === 0xb0 && m === 64 && TRB.audio) TRB.audio.pedal(v >= 64);
  };
  Keyboard.prototype.destroy = function () {
    document.removeEventListener('keydown', this._kd);
    document.removeEventListener('keyup', this._ku);
    window.removeEventListener('blur', this._blur);
    if (this.ro) this.ro.disconnect();
    if (this.midiAccess) this.midiAccess.inputs.forEach(function (i) { i.onmidimessage = null; });
    if (active === this) active = null;
    this.el.innerHTML = '';
  };

  TRB.keyboard = {
    create: function (el, opts) { return new Keyboard(el, opts); },
    Keyboard: Keyboard,
    name: name, longName: longName, isWhite: isWhite,
    codes: CODES
  };
})();
