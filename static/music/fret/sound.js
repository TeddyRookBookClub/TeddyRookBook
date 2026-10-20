/* TRBMusic.fret.sound: plucked-string sound for guitar, ukulele and banjo (Teddy Rook Book, music kit). No samples:
   every note is made by Karplus–Strong synthesis (a burst of noise circulating in a tuned delay line that loses a
   little of its brightness on every trip, the way a real string's vibration dies away), rendered once per pitch into
   a buffer and then played through Web Audio. Sound goes through the kit's audio.js (unlocked on the first gesture,
   same master volume, silenced by TRBMusic.audio.stopAll()).

   render(midi, opts) -> Float32Array          pure function, also in node: { sr: 44100, inst: 'guitar' | 'ukulele' |
       'banjo', voice: 'steel' | 'nylon', vel: 0..1, soft: false (hammer-on / pull-off: no pick attack), dead: false
       (a muted, unpitched thump), secs }       tuned with an all-pass fraction, so the pitch is exact (the tests check)
   TONES[inst + '-' + voice] -> { t60, bright, pos, body:[[Hz, gain dB, Q]], pick, lo }   the voices' settings
   play(n, when) -> voice   n = { midi, dur (s), vel, inst, voice, string, group, soft, dead, bendTo, slideFrom }
       when = AudioContext time (0 = now). A new note on the same string (and group) stops the one ringing there.
   strum(notes, when, opts) -> [voice]   notes = [{ midi, string }] in strum order (first = struck first);
       opts { dur, vel, dir: 'down' | 'up', spread (s, default from vel), inst, voice, group, mute (a muted "chuck") }
   chuck(when, opts)                      a percussive muted strum (no pitch)
   tone(midi, opts) -> { stop() }         a steady reference tone (for tuning by ear), opts { vol, secs }
   pluck(midi, opts)                      play one note now (for clicks on diagrams and fretboards)
   stopAll()                              silence every fretted voice (also called by TRBMusic.audio.stopAll)
   debug(true)                            record every note in sound.log: { midi, when, dur, vel, string, group, kind }
*/
(function (root) {
  'use strict';
  var TONES = {
    'guitar-steel': { t60: 5.5, bright: 0.85, pos: 0.16, pick: 0.35, lo: 0.0, body: [[105, 5, 1.6], [220, 3, 1.4], [2600, 2, 1.0]], tilt: 0 },
    'guitar-nylon': { t60: 3.6, bright: 0.45, pos: 0.2, pick: 0.12, lo: 0.25, body: [[100, 5, 1.6], [205, 4, 1.4], [420, 1.5, 1.2]], tilt: -3 },
    'ukulele-': { t60: 2.4, bright: 0.5, pos: 0.22, pick: 0.1, lo: 0.2, body: [[380, 5, 1.4], [800, 2, 1.2]], tilt: -2 },
    'banjo-': { t60: 2.2, bright: 1.0, pos: 0.1, pick: 0.6, lo: 0.0, body: [[550, 3, 1.2], [2400, 5, 0.9], [4200, 2, 1.2]], tilt: 2 }
  };
  function toneFor(inst, voice) { return TONES[(inst || 'guitar') + '-' + (inst === 'guitar' ? (voice || 'steel') : '')] || TONES['guitar-steel']; }

  // a small deterministic noise source, so a rendered note is always the same
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function render(midi, opts) {
    opts = opts || {};
    var sr = opts.sr || 44100, T = toneFor(opts.inst, opts.voice), vel = opts.vel == null ? 0.7 : opts.vel;
    var f = 440 * Math.pow(2, (midi - 69) / 12);
    var t60 = opts.dead ? 0.05 : T.t60 * Math.pow(2, -(midi - 52) / 30); // higher notes die sooner
    t60 = Math.max(opts.dead ? 0.03 : 0.25, Math.min(t60, 9));
    var secs = opts.secs || Math.min(t60 * 0.85 + 0.2, 6);
    var n = Math.floor(secs * sr), out = new Float32Array(n);
    // loop filter: the two-point average (delay 0.5 sample) and a one-pole low-pass for darker voices
    var damp = Math.max(0, Math.min(0.6, T.lo + (opts.soft ? 0.15 : 0) + (1 - vel) * 0.1 + (opts.dead ? 0.4 : 0)));
    var w = 2 * Math.PI * f / sr;
    var lpDelay = damp > 0 ? Math.atan2(damp * Math.sin(w), 1 - damp * Math.cos(w)) / w : 0;
    var L = sr / f - 0.5 - lpDelay;              // what the integer delay and the all-pass must make up
    var N = Math.floor(L - 0.1), frac = L - N;     // keep the all-pass fraction in (0.1, 1.1) for stability
    if (N < 2) { N = 2; frac = Math.max(0.1, L - 2); }
    var C = (1 - frac) / (1 + frac);              // first-order all-pass: delay ≈ frac at low frequency
    // exact phase delay of that all-pass at f, then correct C once (keeps tuning within a tiny fraction of a cent)
    var apDelay = function (c) { return -Math.atan2(-Math.sin(w) * (1 - c * c), (1 + c * c) * Math.cos(w) + 2 * c) / w; };
    for (var it = 0; it < 3; it++) { var err = apDelay(C) - frac; C = (1 - (frac - err)) / (1 + (frac - err)); if (!(C > -1 && C < 1)) { C = (1 - frac) / (1 + frac); break; } }
    var gAvg = Math.cos(w / 2), gLp = damp > 0 ? (1 - damp) / Math.sqrt(1 - 2 * damp * Math.cos(w) + damp * damp) : 1;
    var rho = Math.pow(10, -3 / (t60 * f)) / (gAvg * gLp);
    if (rho > 0.99995) rho = 0.99995;
    // excitation: noise, low-passed by brightness and velocity, combed by the pluck position
    var R = rng(midi * 7919 + Math.round(vel * 10) * 31 + (opts.soft ? 7 : 0) + (opts.dead ? 3 : 0));
    // the string's shape when it is let go: a pulse of width "pos" (the velocity of a string plucked at that point)
    // with a little noise for the finger or pick, smoothed by the brightness
    var pk = Math.max(1, Math.round(T.pos * N)), ex2 = new Float32Array(N + 2), lp = 0, i;
    var a = Math.max(0.05, Math.min(0.95, T.bright * (0.45 + 0.55 * vel) * (opts.soft ? 0.5 : 1)));
    for (i = 0; i < ex2.length; i++) {
      var shape = (i % (N + 1)) < pk ? (1 - T.pos) : -T.pos;
      lp += a * (shape * 1.6 + (R() * 2 - 1) * (opts.dead ? 1 : 0.25) - lp);
      ex2[i] = lp;
    }
    var m0 = 0; for (i = 0; i < ex2.length; i++) m0 += ex2[i]; m0 /= ex2.length;
    var peak = 1e-9; for (i = 0; i < ex2.length; i++) { ex2[i] -= m0; peak = Math.max(peak, Math.abs(ex2[i])); }
    // the delay line
    var size = N + 4, buf = new Float32Array(size), wp = 0, apX = 0, apY = 0, lpY = 0, prev = 0;
    for (i = 0; i < n; i++) {
      var rd = (wp - N + size) % size;
      var y0 = buf[rd];
      var avg = 0.5 * (y0 + prev); prev = y0;
      lpY = damp > 0 ? (1 - damp) * avg + damp * lpY : avg;
      var ap = C * lpY + apX - C * apY; apX = lpY; apY = ap;
      var v = rho * ap + (i < ex2.length ? ex2[i] / peak * 0.5 : 0);
      buf[wp] = v; wp = (wp + 1) % size;
      out[i] = v;
    }
    // the pick's click (steel and banjo), a tiny bright tick
    if (!opts.soft && !opts.dead && T.pick > 0) {
      var R2 = rng(midi + 99), hp = 0, pl = Math.floor(sr * 0.004);
      for (i = 0; i < pl && i < n; i++) { var z = R2() * 2 - 1; var h = z - hp; hp = z; out[i] += h * T.pick * 0.12 * vel * (1 - i / pl); }
    }
    // a soft start and a fade at the end
    var fi = Math.min(n, Math.floor(sr * 0.0015)), fo = Math.min(n, Math.floor(sr * 0.05));
    for (i = 0; i < fi; i++) out[i] *= i / fi;
    for (i = 0; i < fo; i++) out[n - 1 - i] *= i / fo;
    var mx = 1e-9; for (i = 0; i < n; i++) mx = Math.max(mx, Math.abs(out[i]));
    var lvl = 0.5 / mx;
    for (i = 0; i < n; i++) out[i] *= lvl;
    return out;
  }

  /* ---------------- browser playback ---------------- */
  var api = { TONES: TONES, render: render, log: [] };
  var isBrowser = typeof window !== 'undefined' && root === window;
  if (isBrowser) {
    var TRB = window.TRBMusic = window.TRBMusic || {};
    var cache = {}, cacheKeys = [], voices = [], byString = {}, logOn = false, chains = {}, steady = [];
    var A = function () { return TRB.audio; };
    function ctx() { return A() && A().ctx(); }
    function outNode() { var a = A(); return a && a.output ? a.output() : ctx().destination; }
    function chain(inst, voice) { // body resonance per instrument
      var c = ctx(), k = inst + '-' + (voice || '');
      if (chains[k] && chains[k].c === c) return chains[k].input;
      var T = toneFor(inst, voice), input = c.createGain(), node = input;
      input.gain.value = 1;
      var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = inst === 'banjo' ? 140 : inst === 'ukulele' ? 120 : 60; hp.Q.value = 0.6;
      node.connect(hp); node = hp;
      T.body.forEach(function (b) { var f = c.createBiquadFilter(); f.type = 'peaking'; f.frequency.value = b[0]; f.gain.value = b[1]; f.Q.value = b[2]; node.connect(f); node = f; });
      var sh = c.createBiquadFilter(); sh.type = 'highshelf'; sh.frequency.value = 3500; sh.gain.value = T.tilt; node.connect(sh); node = sh;
      var g = c.createGain(); g.gain.value = 0.9; node.connect(g); g.connect(outNode());
      chains[k] = { c: c, input: input };
      return input;
    }
    function bufferFor(midi, o) {
      var c = ctx(), vb = o.vel < 0.45 ? 0.35 : o.vel < 0.75 ? 0.65 : 0.9;
      var key = [o.inst, o.voice || '', midi, vb, o.soft ? 1 : 0, o.dead ? 1 : 0, c.sampleRate].join('|');
      if (cache[key]) return cache[key];
      var data = render(midi, { sr: c.sampleRate, inst: o.inst, voice: o.voice, vel: vb, soft: o.soft, dead: o.dead });
      var b = c.createBuffer(1, data.length, c.sampleRate);
      if (b.copyToChannel) b.copyToChannel(data, 0); else b.getChannelData(0).set(data);
      cache[key] = b; cacheKeys.push(key);
      if (cacheKeys.length > 160) delete cache[cacheKeys.shift()];
      return b;
    }
    function stopVoice(v, t, fast) {
      if (!v || v.stopped) return;
      var c = ctx(), now = c.currentTime; t = Math.max(t || now, now);
      v.stopped = true;
      var tr = fast ? 0.012 : 0.06;
      try { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); } catch (e) {}
      try { v.g.gain.setTargetAtTime(0, t, tr); v.src.stop(t + tr * 8); } catch (e) {}
    }
    function play(n, when) {
      var a = A(); if (!a) return null;
      var c = ctx(); if (!c) return null;
      var now = c.currentTime, t = Math.max(when || now, now);
      var inst = n.inst || 'guitar', vel = Math.max(0.05, Math.min(1, n.vel == null ? 0.7 : n.vel));
      if (logOn) api.log.push({ midi: n.midi, when: t, dur: n.dur, vel: vel, string: n.string, group: n.group, kind: n.dead ? 'dead' : n.soft ? 'legato' : 'pluck' });
      var b = bufferFor(n.midi, { inst: inst, voice: n.voice, vel: vel, soft: n.soft, dead: n.dead });
      var src = c.createBufferSource(), g = c.createGain();
      src.buffer = b;
      var lvl = 0.55 * Math.pow(vel, 1.2) * (inst === 'banjo' ? 0.8 : 1) * (n.soft ? 0.8 : 1);
      g.gain.setValueAtTime(lvl, t);
      if (n.slideFrom != null) { // slide: start at the old pitch and glide to the new one
        src.playbackRate.setValueAtTime(Math.pow(2, (n.slideFrom - n.midi) / 12), t);
        src.playbackRate.linearRampToValueAtTime(1, t + Math.min(0.12, (n.dur || 0.3) * 0.5));
      }
      if (n.bendTo != null) { // bend: rise to the target pitch and hold
        src.playbackRate.setValueAtTime(1, t + 0.04);
        src.playbackRate.linearRampToValueAtTime(Math.pow(2, (n.bendTo - n.midi) / 12), t + 0.04 + Math.min(0.2, (n.dur || 0.4) * 0.4));
      }
      src.connect(g); g.connect(chain(inst, n.voice));
      src.start(t);
      var v = { src: src, g: g, t: t, midi: n.midi, string: n.string, group: n.group || '' };
      var sk = n.string != null ? v.group + ':' + n.string : null;
      if (sk && byString[sk] && !byString[sk].stopped) stopVoice(byString[sk], t, true);
      if (sk) byString[sk] = v;
      var dur = n.dur == null ? b.duration : n.dur;
      if (dur < b.duration) { g.gain.setValueAtTime(lvl, t + dur); g.gain.setTargetAtTime(0, t + dur, n.dead ? 0.01 : 0.07); src.stop(t + dur + 0.6); }
      else src.stop(t + b.duration);
      voices.push(v);
      src.onended = function () { var i = voices.indexOf(v); if (i >= 0) voices.splice(i, 1); try { g.disconnect(); } catch (e) {} };
      return v;
    }
    function chuck(when, o) {
      o = o || {};
      var c = ctx(); if (!c) return;
      var t = Math.max(when || 0, c.currentTime), len = 0.06, b = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate), d = b.getChannelData(0), R = rng(1234);
      for (var i = 0; i < d.length; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      var s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
      s.buffer = b; bp.type = 'bandpass'; bp.frequency.value = o.inst === 'ukulele' ? 1500 : o.inst === 'banjo' ? 2200 : 1100; bp.Q.value = 0.9;
      g.gain.value = 0.5 * (o.vel == null ? 0.7 : o.vel);
      s.connect(bp); bp.connect(g); g.connect(chain(o.inst || 'guitar', o.voice));
      s.start(t);
      if (logOn) api.log.push({ midi: null, when: t, dur: len, vel: o.vel, kind: 'chuck', group: o.group });
      var v = { src: s, g: g, t: t }; voices.push(v);
      s.onended = function () { var i = voices.indexOf(v); if (i >= 0) voices.splice(i, 1); };
      // a muted strum also stops the strings that were ringing
      Object.keys(byString).forEach(function (k) { if (!o.group || k.indexOf(o.group + ':') === 0) stopVoice(byString[k], t, true); });
    }
    function strum(notes, when, o) {
      o = o || {};
      var c = ctx(); if (!c) return [];
      if (o.mute) { chuck(when, o); return []; }
      var vel = o.vel == null ? 0.7 : o.vel, k = notes.length;
      var spread = o.spread != null ? o.spread : (0.035 - 0.02 * vel) * (o.dir === 'up' ? 0.8 : 1);
      return notes.map(function (n, i) {
        var dt = k > 1 ? spread * i / (k - 1) : 0;
        var v2 = vel * (o.dir === 'up' ? (0.75 + 0.25 * (i / Math.max(1, k - 1))) : (1 - 0.15 * (i / Math.max(1, k - 1))));
        return play({ midi: n.midi, string: n.string, dur: o.dur == null ? null : Math.max(0.05, o.dur - dt), vel: v2, inst: o.inst, voice: o.voice, group: o.group }, (when || c.currentTime) + dt);
      });
    }
    function tone(midi, o) { // a steady tone made of a few harmonics: exact pitch, easy to tune to
      o = o || {};
      var a = A(); if (!a) return { stop: function () {} };
      a.unlock();
      var c = ctx(), t = c.currentTime + 0.02, f = 440 * Math.pow(2, (midi - 69) / 12), g = c.createGain(), oscs = [];
      [[1, 1], [2, 0.45], [3, 0.22], [4, 0.1]].forEach(function (h) {
        if (f * h[0] > c.sampleRate * 0.45) return;
        var osc = c.createOscillator(), og = c.createGain();
        osc.frequency.value = f * h[0]; og.gain.value = h[1];
        osc.connect(og); og.connect(g); osc.start(t); oscs.push(osc);
      });
      var lvl = (o.vol == null ? 0.18 : o.vol);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.08);
      g.connect(outNode());
      var secs = o.secs || 4;
      g.gain.setValueAtTime(lvl, t + secs - 0.4); g.gain.linearRampToValueAtTime(0, t + secs);
      oscs.forEach(function (x) { x.stop(t + secs + 0.05); });
      if (logOn) api.log.push({ midi: midi, when: t, dur: secs, kind: 'tone' });
      var h = { stop: function () { var n2 = c.currentTime; try { g.gain.cancelScheduledValues(n2); g.gain.setValueAtTime(g.gain.value, n2); g.gain.linearRampToValueAtTime(0, n2 + 0.05); oscs.forEach(function (x) { x.stop(n2 + 0.08); }); } catch (e) {} var i = steady.indexOf(h); if (i >= 0) steady.splice(i, 1); }, oscs: oscs };
      steady.push(h);
      return h;
    }
    function stopAll() {
      var c = ctx(); if (!c) return;
      voices.slice().forEach(function (v) { if (v.src.stop) { v.stopped = false; stopVoice(v, c.currentTime, true); } });
      voices = []; byString = {};
      steady.slice().forEach(function (h) { h.stop(); });
    }
    api.play = play; api.strum = strum; api.chuck = chuck; api.tone = tone; api.stopAll = stopAll;
    api.pluck = function (midi, o) { o = o || {}; var a = A(); if (!a) return null; a.unlock(); return play({ midi: midi, inst: o.inst, voice: o.voice, vel: o.vel == null ? 0.75 : o.vel, string: o.string, group: o.group || 'ui', dur: o.dur }, 0); };
    api.voices = function () { return voices.length; };
    api.debug = function (on) { logOn = on !== false; api.log = []; };
    // TRBMusic.audio.stopAll() silences these voices too
    (function hook() {
      var a = A();
      if (!a) { setTimeout(hook, 50); return; }
      if (a.onStopAll) a.onStopAll(stopAll);
      else if (!a._fretHooked) { var orig = a.stopAll; a.stopAll = function () { orig.apply(a, arguments); stopAll(); }; a._fretHooked = true; }
    })();
    TRB.fret = TRB.fret || {};
    TRB.fret.sound = api;
  } else {
    root.TRBMusic = root.TRBMusic || {};
    root.TRBMusic.fret = root.TRBMusic.fret || {};
    root.TRBMusic.fret.sound = api;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
