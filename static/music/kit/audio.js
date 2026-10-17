/* TRBMusic.audio: Web Audio for the music pages (Teddy Rook Book, music kit). A synthesized piano-like voice: no samples,
   no network. Equal temperament, A4 = 440 Hz (MIDI 69); MIDI 60 = C4 (middle C).
   The AudioContext is created and resumed on the first user gesture (pointer, key or touch anywhere on the page);
   nothing sounds before that.

   API (TRBMusic.audio)
     play(midi, when, dur, vel) -> voice   schedule a note: when = AudioContext time in seconds (0 or omitted = now),
                                           dur = seconds until the key lifts (then a short damper release), vel 0–1
     noteOn(midi, vel) -> voice / noteOff(midi)   for keys held by a person (released on noteOff, or on pedal up)
     pedal(down)                           sustain pedal: while down, lifted keys keep sounding
     click(when, accent, vol)              a short wood-block click (count-ins); accent = the first beat
     stopAll()                             silence everything now, including notes and clicks scheduled for later
     setVolume(0..1) / volume()            master volume (default 0.8)
     now()                                 the AudioContext clock (0 before the first gesture)
     ready()                               true once unlocked;  unlock() call inside a gesture handler to start early
     onUnlock(fn)                          run fn when sound becomes available (at once if it already is)
     latency()                             output latency estimate in seconds (for syncing visuals)
     ctx()                                 the AudioContext (creates it; call from a gesture)
     voices()                              how many voices are sounding
     debug(true)                           record every scheduled note in TRBMusic.audio.log: { midi, when, dur, vel }
                                           (for tests; headless browsers can't listen)
   The voice: 6 sine partials with slight inharmonicity (stretched like piano strings), a detuned second "string",
   a soft hammer knock, a two-stage decay that is longer for low notes, brightness that follows velocity and fades
   as the note rings, a damper release when the key lifts, a small generated room reverb, a gentle compressor.
   Polyphony is limited (24 voices, 16 on small devices): the oldest voice is faded out to make room.
*/
(function () {
  'use strict';
  var TRB = window.TRBMusic = window.TRBMusic || {};
  var ctx = null, master = null, bus = null, noiseBuf = null, vol = 0.8, unlocked = false;
  var voices = [], held = {}, sustain = false, waiting = [], logOn = false, clicks = [];
  var MAXV = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || /Mobi|Android/i.test(navigator.userAgent) ? 16 : 24;

  function freq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function make() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = vol;
    master.connect(comp); comp.connect(ctx.destination);
    bus = ctx.createGain(); bus.gain.value = 0.9;
    var conv = ctx.createConvolver(); conv.buffer = room(1.5);
    var wet = ctx.createGain(); wet.gain.value = 0.18;
    bus.connect(master); bus.connect(conv); conv.connect(wet); wet.connect(master);
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    return ctx;
  }
  function room(sec) { // a soft, dark stereo room: decaying noise smoothed by a one-pole low-pass
    var sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr);
    for (var c = 0; c < 2; c++) {
      var d = b.getChannelData(c), lp = 0, pre = Math.floor(sr * 0.012);
      for (var i = 0; i < n; i++) {
        var x = i < pre ? 0 : (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
        lp += (x - lp) * (0.18 + 0.5 * (1 - i / n) * 0.3);
        d[i] = lp * 0.9;
      }
    }
    return b;
  }
  function unlock() {
    var c = make();
    if (!c) return;
    if (c.state === 'suspended' && c.resume) c.resume();
    if (!unlocked) {
      // a silent buffer wakes up iOS
      try { var s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0); } catch (e) {}
      unlocked = true;
      var w = waiting; waiting = [];
      w.forEach(function (fn) { try { fn(); } catch (e) { setTimeout(function () { throw e; }); } });
    }
  }
  function onGesture() { unlock(); }
  ['pointerdown', 'keydown', 'touchend', 'mousedown'].forEach(function (t) { window.addEventListener(t, onGesture, { capture: true, passive: true }); });

  function startVoice(midi, t, vel) {
    var c = make();
    if (!c) return null;
    vel = Math.max(0.05, Math.min(1, vel == null ? 0.7 : vel));
    var f = freq(midi), now = c.currentTime;
    if (!t || t < now) t = now;
    if (voices.length >= MAXV) steal(t);
    var out = c.createGain(), damper = c.createGain(), tone = c.createBiquadFilter();
    tone.type = 'lowpass';
    var bright = Math.min(16000, f * (3 + 9 * vel) + 1200 * vel);
    tone.frequency.setValueAtTime(bright, t);
    tone.frequency.setTargetAtTime(Math.max(f * 2.2, 700), t + 0.02, 0.6 + 1.2 * Math.max(0, (72 - midi) / 48));
    tone.Q.value = 0.4;
    damper.gain.value = 1;
    tone.connect(out); out.connect(damper); damper.connect(bus);
    // loudness: a little softer for high notes, which sound louder; velocity curve
    var lvl = 0.16 * Math.pow(vel, 1.35) * (1 - 0.35 * Math.max(0, (midi - 60) / 48)) * (midi < 40 ? 1.15 : 1);
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(lvl, t + 0.004);
    out.gain.setTargetAtTime(lvl * 0.5, t + 0.006, 0.09 + 0.1 * Math.max(0, (60 - midi) / 40)); // the quick first decay
    var tau = Math.max(0.35, Math.min(4.2, 2.4 * Math.pow(2, -(midi - 48) / 22))); // the long ring: longer for low notes
    var B = Math.max(0.00005, Math.min(0.004, 0.00035 * Math.pow(2, (midi - 60) / 16))); // string stiffness
    var amps = [1, 0.62, 0.42, 0.27, 0.17, 0.11];
    if (midi < 45) { amps[0] = 0.62; amps[1] = 0.75; amps[2] = 0.55; }
    var oscs = [];
    for (var n = 1; n <= amps.length; n++) {
      var fn = n * f * Math.sqrt((1 + B * n * n) / (1 + B)); // the fundamental stays exactly in tune
      if (fn > Math.min(12000, c.sampleRate * 0.45)) break;
      var o = c.createOscillator(), g = c.createGain();
      o.frequency.value = fn;
      var a = amps[n - 1] * (n > 1 ? Math.pow(vel, 0.25 * (n - 1)) : 1);
      g.gain.setValueAtTime(a, t);
      g.gain.setTargetAtTime(0, t + 0.01, tau / (1 + 0.55 * (n - 1)));
      o.connect(g); g.connect(tone);
      o.start(t);
      oscs.push(o);
    }
    // a second string, very slightly out of tune with the first: the slow beating of a real unison
    var o2 = c.createOscillator(), g2 = c.createGain();
    o2.frequency.value = f * Math.pow(2, 1.1 / 1200);
    g2.gain.setValueAtTime(0.42, t);
    g2.gain.setTargetAtTime(0, t + 0.01, tau * 1.1);
    o2.connect(g2); g2.connect(tone); o2.start(t); oscs.push(o2);
    // the hammer: a tiny filtered knock
    var nz = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain();
    nz.buffer = noiseBuf; nf.type = 'bandpass'; nf.frequency.value = Math.min(4000, f * 2.5 + 300); nf.Q.value = 0.9;
    ng.gain.value = 0.35 * vel;
    nz.connect(nf); nf.connect(ng); ng.connect(out); nz.start(t);
    oscs.push(nz);
    var v = { midi: midi, t: t, end: Infinity, damper: damper, oscs: oscs, out: out, released: false };
    voices.push(v);
    o2.onended = function () { var i = voices.indexOf(v); if (i >= 0) voices.splice(i, 1); try { damper.disconnect(); } catch (e) {} };
    // nothing rings forever: stop after the decay has died away
    var life = t + Math.min(14, tau * 5 + 0.5);
    oscs.forEach(function (o) { try { o.stop(life); } catch (e) {} });
    return v;
  }
  function release(v, t, fast) {
    if (!v || v.released || !ctx) return;
    var now = ctx.currentTime;
    if (!t || t < now) t = now;
    v.released = true; v.end = t;
    var tr = fast ? 0.012 : 0.05 + 0.13 * Math.max(0, Math.min(1, (84 - v.midi) / 60));
    v.damper.gain.setTargetAtTime(0, t, tr);
    var stopAt = t + tr * 7 + 0.03;
    v.oscs.forEach(function (o) { try { o.stop(stopAt); } catch (e) {} });
  }
  function steal(t) {
    var best = null;
    voices.forEach(function (v) { if (!v.stolen && (!best || v.t < best.t)) best = v; });
    if (!best) return;
    best.stolen = true; best.released = false;
    release(best, Math.min(t, ctx.currentTime), true);
    var i = voices.indexOf(best); if (i >= 0) voices.splice(i, 1);
  }

  var api = {
    log: [],
    play: function (midi, when, dur, vel) {
      if (logOn) api.log.push({ midi: midi, when: when, dur: dur, vel: vel });
      var v = startVoice(midi, when, vel);
      if (v) release(v, v.t + Math.max(0.05, dur || 0.5));
      return v;
    },
    noteOn: function (midi, vel) {
      if (logOn) api.log.push({ midi: midi, when: api.now(), dur: null, vel: vel, live: true });
      var v = startVoice(midi, 0, vel);
      if (v) (held[midi] = held[midi] || []).push(v);
      return v;
    },
    noteOff: function (midi) {
      var hs = held[midi] || [];
      delete held[midi];
      hs.forEach(function (v) { if (sustain) v.pedalHeld = true; else release(v); });
    },
    pedal: function (down) {
      sustain = !!down;
      if (!sustain) voices.forEach(function (v) { if (v.pedalHeld) { v.pedalHeld = false; release(v); } });
    },
    click: function (when, accent, volume) {
      var c = make();
      if (!c) return;
      var t = Math.max(when || 0, c.currentTime), o = c.createOscillator(), g = c.createGain(), bp = c.createBiquadFilter();
      o.type = 'triangle'; o.frequency.setValueAtTime(accent ? 1760 : 1320, t); o.frequency.exponentialRampToValueAtTime(accent ? 1250 : 950, t + 0.03);
      bp.type = 'bandpass'; bp.frequency.value = accent ? 1600 : 1200; bp.Q.value = 2.5;
      var lv = (volume == null ? 0.5 : volume) * (accent ? 0.55 : 0.38);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
      o.connect(bp); bp.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.09);
      clicks.push(o);
      o.onended = function () { var i = clicks.indexOf(o); if (i >= 0) clicks.splice(i, 1); };
      if (logOn) api.log.push({ click: true, when: t, accent: !!accent });
    },
    stopAll: function () {
      if (!ctx) return;
      voices.slice().forEach(function (v) {
        v.released = false;
        release(v, ctx.currentTime, true);
        // notes scheduled for later: stop them before they start
        v.oscs.forEach(function (o) { try { o.stop(ctx.currentTime + 0.1); } catch (e) {} });
      });
      voices = []; held = {};
      clicks.slice().forEach(function (o) { try { o.stop(ctx.currentTime); } catch (e) {} }); // count-in clicks not yet heard
      clicks = [];
    },
    setVolume: function (x) { vol = Math.max(0, Math.min(1, +x)); if (master) master.gain.setTargetAtTime(vol, ctx.currentTime, 0.02); },
    volume: function () { return vol; },
    now: function () { return ctx ? ctx.currentTime : 0; },
    ready: function () { return unlocked && !!ctx && ctx.state !== 'closed'; },
    unlock: unlock,
    onUnlock: function (fn) { if (unlocked) fn(); else waiting.push(fn); },
    latency: function () { return ctx ? (ctx.outputLatency || 0) + (ctx.baseLatency || 0) : 0; },
    ctx: make,
    voices: function () { return voices.length; },
    debug: function (on) { logOn = on !== false; api.log = []; },
    freq: freq
  };
  TRB.audio = api;
})();
