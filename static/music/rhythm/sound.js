/* TRBMusic.rhythm.sound: the sound and clock for the metronome and the rhythm trainer.
   Every sound is synthesized here into short AudioBuffers (no samples, no network). Nothing is created until
   ensure() is called from a user gesture (a click, a tap or a key press).

   API
     ensure()                    create or resume the AudioContext (call inside a gesture); returns it, or null
     ctx                         the AudioContext once created
     names                       the sound names: wood-acc wood-beat wood-sub, beep-…, soft-…, hand-L, hand-L-acc, hand-R, hand-R-acc, shaker, count, count-hi
     setVolume(v)                master volume 0…1
     newBus()                    a fresh gain node for one run; endBus(bus) fades it out and disconnects it, silencing anything still scheduled
     play(name, when, gain, bus) schedule a sound at AudioContext time `when`
     audible(perfMs)             the AudioContext time you were hearing at performance.now() = perfMs (uses getOutputTimestamp; falls back to the reported latency)
     ticker(fn)                  calls fn about every 25 ms from a worker timer (keeps going when the tab is busy or hidden); returns {stop()}
     log                         the last scheduled sounds [{name, when, gain, at}] (for tests)
     synth(name, sampleRate)     the raw samples of a sound (Float32Array); works in node
*/
(function (root) {
  'use strict';

  function prng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 * 2 - 1; }; }
  var TAU = Math.PI * 2;
  function resume(c) { try { var p = c.resume(); if (p && p.catch) p.catch(function () { /* waits for a gesture */ }); } catch (e) { /* ignore */ } }

  function fill(sr, dur, fn, peak) {
    var n = Math.ceil(sr * dur), a = new Float32Array(n), mx = 0, i;
    for (i = 0; i < n; i++) { a[i] = fn(i / sr, i); if (Math.abs(a[i]) > mx) mx = Math.abs(a[i]); }
    var k = mx ? peak / mx : 0, fadeN = Math.min(n, Math.round(sr * 0.004));
    for (i = 0; i < n; i++) a[i] *= k;
    for (i = 0; i < fadeN; i++) a[n - 1 - i] *= i / fadeN; // no click at the end
    return a;
  }
  // a wood block: two inharmonic modes and a tiny noise strike
  function wood(sr, f, peak, decay) {
    var r = prng(11); decay = decay || 0.02;
    return fill(sr, 0.11, function (t) {
      var a = Math.min(1, t / 0.0004);
      return a * (0.85 * Math.exp(-t / decay) * Math.sin(TAU * f * t) + 0.3 * Math.exp(-t / (decay * 0.4)) * Math.sin(TAU * 2.76 * f * t + 0.4) + 0.08 * Math.exp(-t / 0.004) * Math.sin(TAU * 5.4 * f * t)) + 0.3 * r() * Math.exp(-t / 0.0012);
    }, peak);
  }
  function beep(sr, f, peak) {
    return fill(sr, 0.075, function (t) {
      var env = t < 0.002 ? t / 0.002 : t < 0.04 ? 1 : Math.exp(-(t - 0.04) / 0.012);
      return env * (Math.sin(TAU * f * t) + 0.12 * Math.sin(TAU * 2 * f * t));
    }, peak);
  }
  // a soft, rounded tock (marimba-like: the fundamental plus a quick overtone near 4x)
  function soft(sr, f, peak) {
    return fill(sr, 0.2, function (t) {
      var a = Math.min(1, t / 0.004);
      return a * (Math.exp(-t / 0.05) * Math.sin(TAU * f * t) + 0.18 * Math.exp(-t / 0.012) * Math.sin(TAU * 3.93 * f * t));
    }, peak);
  }
  function marimba(sr, f, peak, bright) {
    var r = prng(5);
    return fill(sr, 0.36, function (t) {
      var a = Math.min(1, t / 0.0008);
      return a * (Math.exp(-t / 0.11) * Math.sin(TAU * f * t) + (0.3 + bright) * Math.exp(-t / 0.025) * Math.sin(TAU * 3.93 * f * t) + 0.07 * Math.exp(-t / 0.01) * Math.sin(TAU * 9.2 * f * t)) + 0.1 * r() * Math.exp(-t / 0.0015);
    }, peak);
  }
  // a short shaker: high-passed noise
  function shaker(sr, peak) {
    var r = prng(3), y = 0, xp = 0, al = 0.86;
    return fill(sr, 0.07, function (t) {
      var x = r(); y = al * (y + x - xp); xp = x;
      var env = t < 0.003 ? t / 0.003 : Math.exp(-(t - 0.003) / 0.016);
      return env * y;
    }, peak);
  }

  var RECIPES = {
    'wood-acc': function (sr) { return wood(sr, 1250, 0.9); },
    'wood-beat': function (sr) { return wood(sr, 880, 0.9); },
    'wood-sub': function (sr) { return wood(sr, 660, 0.9, 0.016); },
    'beep-acc': function (sr) { return beep(sr, 1568, 0.8); },
    'beep-beat': function (sr) { return beep(sr, 1047, 0.8); },
    'beep-sub': function (sr) { return beep(sr, 784, 0.8); },
    'soft-acc': function (sr) { return soft(sr, 784, 0.9); },
    'soft-beat': function (sr) { return soft(sr, 523.25, 0.9); },
    'soft-sub': function (sr) { return soft(sr, 392, 0.9); },
    'hand-L': function (sr) { return marimba(sr, 392, 0.9, 0); },
    'hand-L-acc': function (sr) { return marimba(sr, 392, 0.9, 0.25); },
    'hand-R': function (sr) { return wood(sr, 1100, 0.9, 0.028); },
    'hand-R-acc': function (sr) { return wood(sr, 1100, 0.9, 0.04); },
    'shaker': function (sr) { return shaker(sr, 0.7); },
    'count': function (sr) { return beep(sr, 880, 0.7); },
    'count-hi': function (sr) { return beep(sr, 1320, 0.7); }
  };
  function synth(name, sr) { return RECIPES[name](sr || 48000); }

  var S = {
    ctx: null, master: null, buffers: {}, log: [], vol: 0.8, names: Object.keys(RECIPES), synth: synth, failed: false,
    ensure: function () {
      if (S.ctx) { if (S.ctx.state === 'suspended') { resume(S.ctx); } return S.ctx; }
      var AC = root && (root.AudioContext || root.webkitAudioContext);
      if (!AC) { S.failed = true; return null; }
      try { S.ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { try { S.ctx = new AC(); } catch (e2) { S.failed = true; return null; } }
      var c = S.ctx;
      S.master = c.createGain(); S.master.gain.value = S.vol * S.vol; S.master.connect(c.destination);
      S.names.forEach(function (n) {
        var data = synth(n, c.sampleRate), b = c.createBuffer(1, data.length, c.sampleRate);
        if (b.copyToChannel) b.copyToChannel(data, 0); else b.getChannelData(0).set(data);
        S.buffers[n] = b;
      });
      // iOS: play one silent buffer inside the gesture to unlock output
      try { var sb = c.createBufferSource(); sb.buffer = c.createBuffer(1, 1, c.sampleRate); sb.connect(c.destination); sb.start(0); } catch (e) { /* ignore */ }
      if (c.state === 'suspended') resume(c);
      return c;
    },
    setVolume: function (v) {
      S.vol = Math.max(0, Math.min(1, v));
      if (S.master) S.master.gain.setTargetAtTime(S.vol * S.vol, S.ctx.currentTime, 0.015);
    },
    newBus: function () {
      var g = S.ctx.createGain(); g.gain.value = 1; g.connect(S.master); return g;
    },
    endBus: function (g) {
      if (!g || !S.ctx) return;
      var t = S.ctx.currentTime;
      try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.03); } catch (e) { /* ignore */ }
      setTimeout(function () { try { g.disconnect(); } catch (e) { /* ignore */ } }, 120);
    },
    play: function (name, when, gain, bus) {
      if (!S.ctx || !S.buffers[name]) return;
      var c = S.ctx, src = c.createBufferSource(), g = c.createGain();
      src.buffer = S.buffers[name];
      g.gain.value = gain == null ? 1 : gain;
      src.connect(g); g.connect(bus || S.master);
      var w = Math.max(when, c.currentTime);
      src.start(w);
      src.onended = function () { try { g.disconnect(); } catch (e) { /* ignore */ } };
      S.log.push({ name: name, when: w, gain: g.gain.value, at: c.currentTime });
      if (S.log.length > 4000) S.log.splice(0, 1000);
    },
    // the AudioContext time that is reaching your ears at performance time perfMs
    audible: function (perfMs) {
      var c = S.ctx; if (!c) return 0;
      var pnow = root.performance.now();
      if (perfMs == null) perfMs = pnow;
      var fb = c.currentTime - (c.outputLatency || 0) - (c.baseLatency || 0) + (perfMs - pnow) / 1000;
      if (c.getOutputTimestamp) {
        var ts = c.getOutputTimestamp();
        if (ts && ts.contextTime > 0 && ts.performanceTime > 0) {
          var v = ts.contextTime + (perfMs - ts.performanceTime) / 1000;
          if (Math.abs(v - fb) < 0.5) return v;
        }
      }
      return fb;
    },
    ticker: function (fn) {
      var stopped = false, w = null, iv = null;
      try {
        var url = URL.createObjectURL(new Blob(['var i=setInterval(function(){postMessage(0)},25);onmessage=function(){clearInterval(i)}'], { type: 'text/javascript' }));
        w = new Worker(url);
        w.onmessage = function () { if (!stopped) fn(); };
        w.onerror = function () { if (w) { w.terminate(); w = null; } if (!iv && !stopped) iv = setInterval(fn, 25); };
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      } catch (e) { w = null; iv = setInterval(fn, 25); }
      return { stop: function () { stopped = true; if (w) { w.postMessage(0); w.terminate(); w = null; } if (iv) { clearInterval(iv); iv = null; } } };
    }
  };

  // On touch screens a pointerdown is not yet a "user activation", so a context made then may start suspended:
  // resume it on the next gesture that counts.
  if (root && root.document) {
    var wake = function () { if (S.ctx && S.ctx.state === 'suspended') { resume(S.ctx); } };
    ['pointerup', 'touchend', 'keydown', 'click'].forEach(function (n) { root.document.addEventListener(n, wake, true); });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = S;
  if (root) { root.TRBMusic = root.TRBMusic || {}; root.TRBMusic.rhythm = root.TRBMusic.rhythm || {}; root.TRBMusic.rhythm.sound = S; }
})(typeof window !== 'undefined' ? window : null);
