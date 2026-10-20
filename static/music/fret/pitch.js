/* TRBMusic.fret.pitch: pitch detection for the tuner (Teddy Rook Book, music kit). Pure math, no DOM and no audio:
   runs in the browser and in node (module.exports) so it can be tested on synthesized plucks.

   The method is YIN (de Cheveigné & Kawahara, 2002): the squared-difference function of the signal with itself
   shifted by each lag, normalized by its running mean ("CMNDF"), the first dip below a threshold taken as the period,
   refined by parabolic interpolation. It is reliable for plucked strings, whose strong upper partials fool simple
   peak-picking, and it gives the period to a small fraction of a sample (well under one cent).

   API (TRBMusic.fret.pitch)
     detect(samples: Float32Array, sampleRate, opts) -> { freq, clarity (0..1, 1 = a clean periodic sound), rms } | null
         opts: { minHz: 30, maxHz: 1500, threshold: 0.15, minRms: 0.004 }   null = silence or no clear pitch
     tracker(opts) -> T   smoothing for a live stream: T.push(result | null, timeSec) -> { freq, stable (bool), held }
         (median of the last five readings in cents, a new note is accepted after two readings agree;
          opts: { hold: 0.6 } seconds to keep showing the last pitch after the sound stops)
     cents(f, ref) -> 1200 * log2(f / ref);   nearestNote(freq, a4) -> { midi, name ("E2"), cents, target (Hz) }
     nearestString(freq, midis[]) -> { index, midi, cents }   the open string closest to the sound, in cents
*/
(function (root) {
  'use strict';
  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function cents(f, ref) { return 1200 * Math.log(f / ref) / Math.LN2; }
  function nearestNote(f, a4) {
    a4 = a4 || 440;
    var m = Math.round(69 + 12 * Math.log(f / a4) / Math.LN2), target = a4 * Math.pow(2, (m - 69) / 12);
    return { midi: m, name: NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1), cents: cents(f, target), target: target };
  }
  function nearestString(f, midis, a4) {
    var best = null;
    (midis || []).forEach(function (m, i) {
      var c = cents(f, (a4 || 440) * Math.pow(2, (m - 69) / 12));
      if (!best || Math.abs(c) < Math.abs(best.cents)) best = { index: i, midi: m, cents: c };
    });
    return best;
  }

  var scratch = null, fftCache = {};
  function fft(re, im, inv) { // in place, radix 2
    var n = re.length, i, j, k, l;
    for (i = 1, j = 0; i < n; i++) { var bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { var tr = re[i]; re[i] = re[j]; re[j] = tr; var ti = im[i]; im[i] = im[j]; im[j] = ti; } }
    for (l = 2; l <= n; l <<= 1) {
      var ang = (inv ? 2 : -2) * Math.PI / l, wr = Math.cos(ang), wi = Math.sin(ang);
      for (i = 0; i < n; i += l) {
        var cr = 1, ci = 0;
        for (k = 0; k < l / 2; k++) {
          var a = i + k, b = a + l / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          var ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
        }
      }
    }
    if (inv) for (i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
  // r[t] = sum_{j<W} x[j] x[j+t] for t = 0..tauMax (mean removed)
  function xcorr(x, W, tauMax, mean) {
    var need = W + tauMax + 1, M = 1;
    while (M < need + W) M <<= 1;
    var C = fftCache[M] || (fftCache[M] = { ar: new Float64Array(M), ai: new Float64Array(M), br: new Float64Array(M), bi: new Float64Array(M) });
    var ar = C.ar, ai = C.ai, br = C.br, bi = C.bi, i;
    for (i = 0; i < M; i++) { ar[i] = i < W ? x[i] - mean : 0; ai[i] = 0; br[i] = i < Math.min(need, x.length) ? x[i] - mean : 0; bi[i] = 0; }
    fft(ar, ai, false); fft(br, bi, false);
    for (i = 0; i < M; i++) { var pr = ar[i] * br[i] + ai[i] * bi[i], pi = ar[i] * bi[i] - ai[i] * br[i]; ar[i] = pr; ai[i] = pi; } // conj(A) * B
    fft(ar, ai, true);
    return ar;
  }
  function detect(x, sr, opts) {
    opts = opts || {};
    var minHz = opts.minHz || 30, maxHz = opts.maxHz || 1500, thr = opts.threshold || 0.15, minRms = opts.minRms == null ? 0.004 : opts.minRms;
    var n = x.length, i, t;
    var rmsSum = 0, mean = 0;
    for (i = 0; i < n; i++) mean += x[i];
    mean /= n;
    for (i = 0; i < n; i++) { var v = x[i] - mean; rmsSum += v * v; }
    var rms = Math.sqrt(rmsSum / n);
    if (rms < minRms) return null;
    var tauMax = Math.min(Math.floor(sr / minHz), Math.floor(n / 2)), tauMin = Math.max(2, Math.floor(sr / maxHz));
    var W = n - tauMax;
    if (W < tauMax * 0.5 || tauMax <= tauMin + 2) return null;
    if (!scratch || scratch.length < tauMax + 2) scratch = new Float64Array(tauMax + 2);
    var d = scratch;
    // difference function d(tau) = sum (x[j] - x[j+tau])^2 over the window, from energies and a cross-correlation
    // computed with an FFT: d = e(0) + e(tau) - 2 r(tau)
    var r = xcorr(x, W, tauMax, mean);
    var e0 = 0, et = 0;
    for (i = 0; i < W; i++) { var q = x[i] - mean; e0 += q * q; }
    et = e0;
    d[0] = 0;
    for (t = 1; t <= tauMax; t++) {
      var outv = x[t - 1] - mean, inv = x[t - 1 + W] - mean;
      et += inv * inv - outv * outv;
      d[t] = Math.max(0, e0 + et - 2 * r[t]);
    }
    // cumulative mean normalized difference
    var run = 0;
    var dn = new Float64Array(tauMax + 1);
    dn[0] = 1;
    for (t = 1; t <= tauMax; t++) { run += d[t]; dn[t] = run > 0 ? d[t] * t / run : 1; }
    // the first dip under the threshold (then follow it down to its bottom)
    var tau = -1;
    for (t = tauMin; t < tauMax; t++) {
      if (dn[t] < thr) { while (t + 1 < tauMax && dn[t + 1] < dn[t]) t++; tau = t; break; }
    }
    if (tau < 0) { // no dip under the threshold: the lowest point, if it is clear enough
      var bestV = Infinity;
      for (t = tauMin; t < tauMax; t++) if (dn[t] < bestV) { bestV = dn[t]; tau = t; }
      if (bestV > 0.35) return null;
    }
    // parabolic interpolation on the raw difference function around the dip
    var better = tau;
    if (tau > 1 && tau < tauMax) {
      var a = d[tau - 1], b = d[tau], c = d[tau + 1], den = a - 2 * b + c;
      if (den > 0) better = tau + 0.5 * (a - c) / den;
    }
    var f = sr / better;
    if (f < minHz * 0.98 || f > maxHz * 1.02) return null;
    if (opts.refine !== false) { var f2 = refine(x, sr, f, mean); if (f2 && Math.abs(cents(f2, f)) < 40) f = f2; }
    return { freq: f, clarity: Math.max(0, Math.min(1, 1 - dn[tau])), rms: rms };
  }

  // A string's upper partials run a little sharp (inharmonicity), which pulls a period estimate up by a few cents.
  // So the first estimate is refined on the fundamental alone: two low-pass sections at 1.4 times the estimate
  // (run forward, then the filter's start-up is skipped), then the same difference function near the first period.
  var fbuf = null;
  function biquadLP(fc, sr) {
    var w = 2 * Math.PI * fc / sr, al = Math.sin(w) / (2 * 0.7071), c = Math.cos(w), a0 = 1 + al;
    return { b0: (1 - c) / 2 / a0, b1: (1 - c) / a0, b2: (1 - c) / 2 / a0, a1: -2 * c / a0, a2: (1 - al) / a0 };
  }
  function refine(x, sr, f0, mean) {
    var n = x.length, i, k;
    if (!fbuf || fbuf.length < n) fbuf = new Float64Array(n);
    var y = fbuf;
    for (i = 0; i < n; i++) y[i] = x[i] - mean;
    var B = biquadLP(Math.min(f0 * 1.4, sr * 0.45), sr);
    for (k = 0; k < 3; k++) {
      var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (i = 0; i < n; i++) { var xi = y[i], yi = B.b0 * xi + B.b1 * x1 + B.b2 * x2 - B.a1 * y1 - B.a2 * y2; x2 = x1; x1 = xi; y2 = y1; y1 = yi; y[i] = yi; }
    }
    var T0 = sr / f0, skip = Math.min(Math.floor(n * 0.3), Math.ceil(T0 * 1.5));
    var lo = Math.max(2, Math.floor(T0 * 0.94)), hi = Math.ceil(T0 * 1.06) + 1;
    var W = n - skip - hi;
    if (W < T0) return null;
    var best = -1, bv = Infinity, ds = {};
    for (var t = lo - 1; t <= hi + 1; t++) {
      var s = 0;
      for (var j = skip; j < skip + W; j++) { var df = y[j] - y[j + t]; s += df * df; }
      ds[t] = s;
      if (t >= lo && t <= hi && s < bv) { bv = s; best = t; }
    }
    if (best < 0) return null;
    var a = ds[best - 1], b = ds[best], c = ds[best + 1], den = a - 2 * b + c;
    var tt = den > 0 ? best + 0.5 * (a - c) / den : best;
    var e = 0; for (i = skip; i < skip + W; i++) e += y[i] * y[i];
    if (e / W < 1e-10) return null;
    return sr / tt;
  }

  function tracker(opts) {
    opts = opts || {};
    var hist = [], last = null, lastT = -1e9, cand = null, candN = 0, hold = opts.hold == null ? 0.6 : opts.hold;
    return {
      push: function (r, now) {
        if (!r || r.clarity < 0.6) {
          if (last && now - lastT < hold) return { freq: last, stable: false, held: true };
          hist = []; last = null; cand = null;
          return null;
        }
        var f = r.freq;
        if (last && Math.abs(cents(f, last)) > 60) { // a new note? accept after two readings agree
          if (cand && Math.abs(cents(f, cand)) < 30) candN++; else { cand = f; candN = 1; }
          if (candN < 2) return { freq: last, stable: false, held: true };
          hist = []; cand = null; candN = 0;
        }
        hist.push(f); if (hist.length > 5) hist.shift();
        var cs = hist.map(function (h) { return cents(h, hist[hist.length - 1]); }).sort(function (a, b) { return a - b; });
        var med = cs[Math.floor(cs.length / 2)];
        last = hist[hist.length - 1] * Math.pow(2, med / 1200);
        lastT = now;
        return { freq: last, stable: hist.length >= 3, held: false };
      },
      reset: function () { hist = []; last = null; cand = null; }
    };
  }

  var api = { detect: detect, tracker: tracker, cents: cents, nearestNote: nearestNote, nearestString: nearestString };
  root.TRBMusic = root.TRBMusic || {};
  root.TRBMusic.fret = root.TRBMusic.fret || {};
  root.TRBMusic.fret.pitch = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
