/* The Elements (Science Lab): element sounds. Artistic mappings, not sounds atoms make.
   Uses the site's Web Audio kit (static/music/kit/audio.js: TRBMusic.audio, unlocked on the first tap or key) for the
   piano voice and its room, and adds a small sine-tone synth on the same output for the spectrum modes.

   TRBElSound.modes                      [{ id, name }]
   TRBElSound.plan(element, mode, short) -> [{ t, dur, hz, gain, kind: 'sine'|'bell'|'piano', midi?, label }] (seconds from start)
   TRBElSound.play(element, mode, at)    schedule one element; returns its length in seconds
   TRBElSound.sweep(list, mode, onEach)  play a row or group one element after another; onEach(element|null) as each starts
   TRBElSound.stop()                     silence everything
   TRBElSound.log                        when debug is on, every scheduled tone (for tests; headless browsers can't listen)

   Modes
     chord   (spectrum chord) every visible line at once: light frequency ÷ 2^40 (exactly 40 octaves down, so the
             musical intervals between lines are kept), loudness from the line's relative intensity; after W. Walker
             Smith's sonified periodic table (ACS Spring 2023) and Jill Linz's Atom Music (Skidmore College)
     arp     (spectrum arpeggio) the same tones one at a time from red to violet, each a plucked tone that dies away,
             as in Linz's plucked-string atom sounds and the melodies Smith drew from the lines
     config  (electron melody) one piano note per subshell in filling order; the shell number n is the scale degree
             (1 = do … 7 = ti), after Sam Zhang, "Teaching Electron Configuration the Musical Way" (2006); notes last
             longer the more electrons a subshell holds */
(function (W) {
  'use strict';
  var C = W.TRBElCore, M = Math;
  var modes = [{ id: 'chord', name: 'Spectrum chord' }, { id: 'arp', name: 'Spectrum arpeggio' }, { id: 'config', name: 'Electron melody' }];
  var api = { modes: modes, log: null }, live = [], timers = [];
  function audio() { return W.TRBMusic && W.TRBMusic.audio; }

  function lines(e, maxN) {
    var L = (e.spectrum && e.spectrum.lines) || [];
    var top = L.slice().sort(function (a, b) { return b.i - a.i; }).slice(0, maxN);
    return top.sort(function (a, b) { return b.nm - a.nm; }); // red (low pitch) first
  }
  function plan(e, mode, short) {
    var out = [];
    if (mode === 'chord') {
      var L = lines(e, 16), sum = 0;
      L.forEach(function (l) { sum += M.pow(l.i, 0.8); });
      L.forEach(function (l, k) {
        out.push({ t: k * (short ? 0.004 : 0.012), dur: short ? 0.9 : 2.6, hz: C.lineHz(l.nm), gain: 0.5 * M.pow(l.i, 0.8) / M.max(1.6, sum), kind: 'sine', label: l.nm.toFixed(1) + ' nm' });
      });
    } else if (mode === 'arp') {
      var A = lines(e, short ? 8 : 14), step = short ? 0.09 : 0.2;
      A.forEach(function (l, k) {
        out.push({ t: k * step, dur: short ? 0.5 : 1.4, hz: C.lineHz(l.nm), gain: 0.16 + 0.22 * M.pow(l.i, 0.6), kind: 'bell', label: l.nm.toFixed(1) + ' nm' });
      });
    } else {
      var mel = C.configMelody(C.parseConfig(e.config && e.config.full)), t = 0, beat = short ? 0.1 : 0.24;
      if (short) mel = mel.slice(-4);
      mel.forEach(function (n) {
        var d = beat * (short ? 1 : n.beats);
        out.push({ t: t, dur: d * 0.95, midi: n.midi, hz: 440 * M.pow(2, (n.midi - 69) / 12), gain: 0.5 + 0.04 * M.min(10, n.count), kind: 'piano', label: n.label });
        t += d;
      });
    }
    return out;
  }
  function length(p) { var e = 0; p.forEach(function (n) { e = M.max(e, n.t + n.dur + (n.kind === 'piano' ? 0.4 : n.kind === 'bell' ? 0.3 : 1.0)); }); return e; }

  function tone(ctx, out, n, t0) {
    var o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + n.t;
    o.type = 'sine'; o.frequency.value = n.hz;
    o.connect(g); g.connect(out); o.start(t);
    g.gain.setValueAtTime(0, t);
    if (n.kind === 'sine') { // a slow swell, a steady chord, a gentle release
      g.gain.linearRampToValueAtTime(n.gain, t + 0.08);
      g.gain.setValueAtTime(n.gain, t + n.dur);
      g.gain.setTargetAtTime(0, t + n.dur, 0.3);
      o.stop(t + n.dur + 2);
    } else { // plucked: a quick start and an exponential decay
      g.gain.linearRampToValueAtTime(n.gain, t + 0.006);
      g.gain.setTargetAtTime(0, t + 0.01, n.dur / 3);
      o.stop(t + n.dur + 1.2);
    }
    var v = { o: o, g: g }; live.push(v);
    o.onended = function () { var i = live.indexOf(v); if (i >= 0) live.splice(i, 1); try { g.disconnect(); } catch (e) { } };
  }
  function schedule(e, mode, at, short) {
    var p = plan(e, mode, short), A = audio();
    if (api.log) p.forEach(function (n) { api.log.push({ z: e.z, mode: mode, t: (at || 0) + n.t, hz: n.hz, gain: n.gain, kind: n.kind, label: n.label }); });
    if (!A) return length(p);
    var ctx = A.ctx(); if (!ctx) return length(p);
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    var t0 = ctx.currentTime + 0.05 + (at || 0), out = A.output();
    p.forEach(function (n) {
      if (n.kind === 'piano') A.play(n.midi, t0 + n.t, n.dur, n.gain);
      else tone(ctx, out, n, t0);
    });
    return length(p);
  }
  api.plan = plan;
  api.length = function (e, mode, short) { return length(plan(e, mode, short)); };
  api.play = function (e, mode) { api.stop(); return schedule(e, mode, 0, false); };
  api.sweep = function (list, mode, onEach) {
    api.stop();
    var at = 0;
    list.forEach(function (e) {
      var d = M.max(0.35, schedule(e, mode, at, true) - (mode === 'chord' ? 0.6 : 0.25));
      (function (el, when) { timers.push(setTimeout(function () { if (onEach) onEach(el); }, when * 1000 + 50)); })(e, at);
      at += d;
    });
    timers.push(setTimeout(function () { if (onEach) onEach(null); }, at * 1000 + 400));
    return at;
  };
  api.stop = function () {
    timers.forEach(clearTimeout); timers = [];
    var A = audio(), ctx = A && A.ready() ? A.ctx() : null;
    live.slice().forEach(function (v) { try { v.g.gain.cancelScheduledValues(0); v.g.gain.setTargetAtTime(0, ctx ? ctx.currentTime : 0, 0.03); v.o.stop((ctx ? ctx.currentTime : 0) + 0.2); } catch (e) { } });
    live = [];
    if (A && A.ready()) A.stopAll();
  };
  api.debug = function (on) { api.log = on === false ? null : []; };
  W.TRBElSound = api;
})(window);
