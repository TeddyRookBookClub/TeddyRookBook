/* TRBMusic.rhythm.core: the timing math behind the metronome and the two-hand rhythm trainer.
   No DOM and no audio here, so it runs in the browser (window.TRBMusic.rhythm.core) and in node (module.exports).

   Time is kept on a "phase clock": every event has a phase measured in beats (ph = 0, 1, 2.5 …).
   The Scheduler turns phases into AudioContext seconds with an anchor:  t = anchorT + (ph - anchorPh) * 60 / bpm.
   A tempo change re-anchors at the last event already scheduled, so nothing already scheduled moves and
   everything after it follows the new tempo. A short timer calls pump(now) every ~25 ms; pump schedules every
   event that falls before now + lookahead (about 100 ms), so the audio stays steady even when the page is busy.

   API
     gcd(a, b), lcm(a, b)
     TEMPO_WORDS                     [{word, from, meaning}] (approximate, commonly cited ranges)
     tempoWord(bpm)                  the entry for a tempo
     meter(num, den, opts)           {num, den, pulses, groups, starts, unit:{den,dots}, compound, eighthMode}
                                     opts.pulse: 'beat' (6/8 counted in dotted quarters) or 'eighth'; opts.grouping [2,2,3]
     groupingsFor(num)               the usual ways to group an odd /8 bar
     subdivisions(m)                 [{n, label}] choices for that meter's beat
     defaultAccents(m)               levels per pulse: 3 accent, 2 normal, 1 soft, 0 silent
     trainerTempo(cfg, bar)          speed trainer: cfg {start, step, every, target}; tempo for bar index (0-based)
     silentBar(bar, play, mute)      true when that bar is one of the silent ones
     Scheduler({onEvent, lookahead}) start(source, t0, bpm), setTempo(bpm, now), pump(now), stop(), timeAt(ph), phaseAt(t)
     MetronomeSource(get)            get() returns the live settings; events {ph, bar, pulse, sub, level, silent, bpm}
     EXERCISES, LEVELS, exerciseById(id)
     buildPattern(ex, swap, free)    {steps, cycleBeats, L:{hits, acc, n}, R:{…}, saying}
     TrainerSource(pattern, opts)    count-in, beat clicks and both hands' target hits; opts {countIn, cycles}
     Scorer({offset})                addTarget(ev), tap(hand, t), expire(now), summary()
     judge(errMs)                    {cat:'on'|'near'|'off', pts}
     rating(pct)                     a short word for an accuracy percentage
     calibrate(taps, clicks, skip)   {offset, spread, n} in seconds, or null
     TapTempo                        tap(tSeconds) returns a tempo once there are two taps
*/
(function (root) {
  'use strict';

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a && b ? Math.abs(a * b) / gcd(a, b) : 0; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* Italian tempo words. Ranges are approximate and differ between sources; each word starts at "from". */
  var TEMPO_WORDS = [
    { word: 'Larghissimo', from: 0, to: 24, meaning: 'as slow as possible' },
    { word: 'Grave', from: 25, to: 39, meaning: 'slow and solemn' },
    { word: 'Largo', from: 40, to: 59, meaning: 'broad, very slow' },
    { word: 'Larghetto', from: 60, to: 65, meaning: 'a little less slow than largo' },
    { word: 'Adagio', from: 66, to: 75, meaning: 'slow, at ease' },
    { word: 'Andante', from: 76, to: 107, meaning: 'at a walking pace' },
    { word: 'Moderato', from: 108, to: 119, meaning: 'moderate' },
    { word: 'Allegro', from: 120, to: 155, meaning: 'quick and bright' },
    { word: 'Vivace', from: 156, to: 167, meaning: 'lively and fast' },
    { word: 'Presto', from: 168, to: 199, meaning: 'very fast' },
    { word: 'Prestissimo', from: 200, to: 999, meaning: 'as fast as possible' }
  ];
  function tempoWord(bpm) {
    var w = TEMPO_WORDS[0];
    for (var i = 0; i < TEMPO_WORDS.length; i++) if (bpm >= TEMPO_WORDS[i].from) w = TEMPO_WORDS[i];
    return w;
  }

  /* ---------- meters ---------- */
  function groupingsFor(num) {
    if (num === 5) return [[2, 3], [3, 2]];
    if (num === 7) return [[2, 2, 3], [3, 2, 2], [2, 3, 2]];
    if (num === 8) return [[3, 3, 2], [2, 2, 2, 2]];
    if (num === 10) return [[3, 3, 2, 2], [2, 2, 3, 3]];
    if (num === 11) return [[2, 2, 3, 2, 2], [3, 3, 3, 2]];
    return [defaultGrouping(num)];
  }
  function defaultGrouping(num) {
    if (num <= 3) return [num];
    if (num % 3 === 0) { var g = []; for (var i = 0; i < num / 3; i++) g.push(3); return g; }
    if (num === 8) return [3, 3, 2];
    var out = [], left = num;
    while (left > 3) { out.push(2); left -= 2; }
    if (left) out.push(left);
    // keep a lone 1 out of the grouping (e.g. 5 = 2+2+1 becomes 2+3)
    if (out[out.length - 1] === 1) { out.pop(); out[out.length - 1] += 1; }
    return out;
  }
  function sameGroups(a, b) { if (!a || !b || a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }

  function meter(num, den, opts) {
    opts = opts || {};
    num = clamp(Math.round(num) || 4, 1, 16);
    den = [2, 4, 8, 16].indexOf(+den) >= 0 ? +den : 4;
    var m = { num: num, den: den, compound: false, eighthMode: false, unit: { den: den, dots: 0 } };
    var compoundOk = den >= 8 && num % 3 === 0 && num > 3;
    if (den <= 4) {
      m.pulses = num; m.groups = []; for (var i = 0; i < num; i++) m.groups.push(1);
    } else if (compoundOk && opts.pulse !== 'eighth') {
      m.compound = true; m.pulses = num / 3; m.unit = { den: den / 2, dots: 1 };
      m.groups = []; for (var j = 0; j < m.pulses; j++) m.groups.push(1);
      m.inner = 3; // eighths inside each beat
    } else {
      m.eighthMode = true; m.pulses = num;
      var g = opts.grouping, ok = false;
      if (g && g.length) { var s = 0; for (var k = 0; k < g.length; k++) s += g[k]; ok = s === num; }
      m.groups = ok ? g.slice() : defaultGrouping(num);
    }
    m.starts = []; var p = 0;
    for (var q = 0; q < m.groups.length; q++) { m.starts.push(p); p += m.groups[q]; }
    m.label = num + '/' + den;
    return m;
  }

  function subdivisions(m) {
    var d = m.unit.den, dotted = m.unit.dots > 0;
    if (dotted) return [{ n: 1, label: 'None' }, { n: 3, label: d === 4 ? 'Eighths' : 'Thirds' }, { n: 6, label: d === 4 ? 'Sixteenths' : 'Sixths' }, { n: 2, label: 'Duplets' }];
    if (d === 2) return [{ n: 1, label: 'None' }, { n: 2, label: 'Quarters' }, { n: 3, label: 'Triplets' }, { n: 4, label: 'Eighths' }];
    if (d === 4) return [{ n: 1, label: 'None' }, { n: 2, label: 'Eighths' }, { n: 3, label: 'Triplets' }, { n: 4, label: 'Sixteenths' }];
    if (d === 8) return [{ n: 1, label: 'None' }, { n: 2, label: 'Sixteenths' }, { n: 3, label: 'Triplets' }];
    return [{ n: 1, label: 'None' }, { n: 2, label: 'Halves' }];
  }

  function defaultAccents(m) {
    var a = [];
    for (var i = 0; i < m.pulses; i++) a.push(m.eighthMode ? (m.starts.indexOf(i) >= 0 ? 2 : 1) : 2);
    a[0] = 3;
    return a;
  }

  /* ---------- practice helpers ---------- */
  // Speed trainer: from cfg.start, add cfg.step BPM every cfg.every bars, never passing cfg.target.
  function trainerTempo(cfg, bar) {
    var start = cfg.start, target = cfg.target == null ? start : cfg.target;
    var step = Math.abs(cfg.step || 0), every = Math.max(1, Math.round(cfg.every || 1));
    if (!step || bar < 0) return start;
    var dir = target >= start ? 1 : -1;
    var t = start + dir * step * Math.floor(bar / every);
    return dir > 0 ? Math.min(t, target) : Math.max(t, target);
  }
  function silentBar(bar, play, mute) {
    play = Math.max(1, Math.round(play || 1)); mute = Math.max(0, Math.round(mute || 0));
    if (!mute || bar < 0) return false;
    return (bar % (play + mute)) >= play;
  }

  /* ---------- the lookahead scheduler on a phase clock ---------- */
  var MIN_AHEAD = 0.012; // never schedule closer to "now" than this (seconds)
  function Scheduler(o) {
    o = o || {};
    this.onEvent = o.onEvent || function () {};
    this.lookahead = o.lookahead || 0.1;
    this.running = false; this.source = null;
    this.bpm = 120; this.anchorT = 0; this.anchorPh = 0; this.lastT = null; this.lastPh = null;
    this.anchors = [];
  }
  Scheduler.prototype._anchor = function (t, ph, bpm) {
    this.anchorT = t; this.anchorPh = ph; this.bpm = bpm;
    this.anchors.push({ t: t, ph: ph, bpm: bpm });
    if (this.anchors.length > 64) this.anchors.splice(0, this.anchors.length - 64);
  };
  Scheduler.prototype.start = function (source, t0, bpm) {
    this.source = source; this.running = true; this.lastT = null; this.lastPh = null; this.anchors = [];
    this._anchor(t0, 0, bpm);
  };
  Scheduler.prototype.stop = function () { this.running = false; };
  Scheduler.prototype.timeAt = function (ph) { return this.anchorT + (ph - this.anchorPh) * 60 / this.bpm; };
  // phase that sounds at time t, following the tempo history (for drawing playheads)
  Scheduler.prototype.phaseAt = function (t) {
    var a = this.anchors, k = a.length - 1;
    while (k > 0 && a[k].t > t) k--;
    if (k < 0) return 0;
    return a[k].ph + (t - a[k].t) * a[k].bpm / 60;
  };
  /* A new tempo takes over from the last event already scheduled when that event is still ahead of `now`;
     when it is already in the past, from `now` itself, keeping the phase continuous (the beat in progress
     stretches or shrinks smoothly, and a playhead never jumps). */
  Scheduler.prototype.setTempo = function (bpm, now) {
    bpm = +bpm;
    if (!this.running) { this.bpm = bpm; return; }
    if (bpm === this.bpm) return;
    if (this.lastT !== null && (now == null || this.lastT >= now)) this._anchor(this.lastT, this.lastPh, bpm);
    else if (now != null && now > this.anchorT) this._anchor(now, this.anchorPh + (now - this.anchorT) * this.bpm / 60, bpm);
    else this._anchor(this.anchorT, this.anchorPh, bpm);
    var nx = this.source && this.source.peek();
    if (nx && now != null) {
      var t = this.timeAt(nx.ph);
      if (t < now + MIN_AHEAD) this._anchor(now + MIN_AHEAD, nx.ph, bpm);
    }
  };
  Scheduler.prototype.pump = function (now) {
    var n = 0;
    while (this.running && n < 2000) {
      var ev = this.source.peek();
      if (!ev) break;
      if (ev.bpm && ev.bpm !== this.bpm) this._anchor(this.timeAt(ev.ph), ev.ph, ev.bpm); // the event lands on the old grid; what follows uses the new tempo
      var t = this.timeAt(ev.ph);
      if (t >= now + this.lookahead) break;
      this.source.next();
      ev.t = t; this.lastT = t; this.lastPh = ev.ph;
      this.onEvent(ev);
      if (ev.end) { this.running = false; break; }
      n++;
    }
    return n;
  };

  /* ---------- metronome event source ----------
     get() returns live settings: {meter, accents, sub, trainer:{on,start,step,every,target,fromBar}, silent:{on,play,mute}}
     Meter and accents are latched at each bar line, the subdivision at each beat, so changes made while it plays
     take effect at the next bar (meter) or the next beat (subdivision). */
  function MetronomeSource(get) {
    this.get = get; this.pending = null;
    this.bar = 0; this.pulse = 0; this.sub = 0; this.barPh = 0;
    this.m = null; this.acc = null; this.curSub = 1; this.started = false;
  }
  MetronomeSource.prototype._latchBar = function () {
    var s = this.get();
    this.m = s.meter; this.acc = s.accents && s.accents.length === s.meter.pulses ? s.accents : defaultAccents(s.meter);
  };
  MetronomeSource.prototype.refresh = function () { this.pending = null; };
  MetronomeSource.prototype.peek = function () {
    if (this.pending) return this.pending;
    var s = this.get();
    if (!this.started) { this._latchBar(); this.curSub = s.sub || 1; this.started = true; }
    var acc = s.accents && s.accents.length === this.m.pulses ? s.accents : this.acc;
    var ev = {
      kind: 'tick', bar: this.bar, pulse: this.pulse, sub: this.sub, subN: this.curSub, pulses: this.m.pulses,
      ph: this.barPh + this.pulse + this.sub / this.curSub
    };
    ev.level = this.sub === 0 ? acc[this.pulse] : (acc[this.pulse] === 0 ? 0 : 1);
    ev.isSub = this.sub > 0;
    ev.silent = !!(s.silent && s.silent.on && silentBar(this.bar, s.silent.play, s.silent.mute));
    if (this.pulse === 0 && this.sub === 0 && s.trainer && s.trainer.on) ev.bpm = trainerTempo(s.trainer, this.bar - (s.trainer.fromBar || 0));
    this.pending = ev;
    return ev;
  };
  MetronomeSource.prototype.next = function () {
    var ev = this.peek(); this.pending = null;
    this.sub++;
    if (this.sub >= this.curSub) {
      this.sub = 0; this.pulse++;
      if (this.pulse >= this.m.pulses) { this.barPh += this.m.pulses; this.pulse = 0; this.bar++; this._latchBar(); }
      this.curSub = this.get().sub || 1;
    }
    return ev;
  };

  /* ---------- two-hand exercises ---------- */
  var LEVELS = [
    { n: 1, name: 'Start here' },
    { n: 2, name: 'One hand twice as fast' },
    { n: 3, name: 'Cross-rhythms' },
    { n: 4, name: 'Accents' },
    { n: 5, name: 'Free mode' }
  ];
  // Hands: R and L. poly: [right count, left count] spread evenly over the cycle. Or explicit steps.
  var EXERCISES = [
    { id: 'together', level: 1, title: 'Both hands together', cycleBeats: 4, steps: 4, R: [0, 1, 2, 3], L: [0, 1, 2, 3], bpm: 70,
      how: 'Tap both pads at the same moment on every beat. Listen for one sound, not two.' },
    { id: 'alternate', level: 1, title: 'Alternating hands', cycleBeats: 4, steps: 4, R: [0, 2], L: [1, 3], bpm: 70,
      how: 'Right, left, right, left: one hand on each beat, taking turns.' },
    { id: 'alternate-fast', level: 1, title: 'Alternating, twice as fast', cycleBeats: 2, steps: 4, R: [0, 2], L: [1, 3], bpm: 70,
      how: 'The same back-and-forth, now two taps on every beat. The right hand stays on the beat; the left lands halfway between.' },
    { id: 'two-one', level: 2, title: 'Right hand twice as fast', cycleBeats: 1, poly: [2, 1], bpm: 70,
      how: 'Left hand on every beat (quarter notes). Right hand twice per beat (eighth notes). This is 2 against 1.' },
    { id: 'two-one-swap', level: 2, title: 'Left hand twice as fast', cycleBeats: 1, poly: [1, 2], bpm: 70,
      how: 'The same rhythm with the hands swapped: right hand on the beat, left hand twice as fast.' },
    { id: 'three-one', level: 2, title: 'Triplets over the beat', cycleBeats: 1, poly: [3, 1], bpm: 60,
      how: 'Left hand on every beat. Right hand three even taps per beat (triplets). Say "one-trip-let, two-trip-let".' },
    { id: 'three-two', level: 3, title: '3 against 2', cycleBeats: 2, poly: [3, 2], bpm: 50,
      saying: ['Nice', 'cup', 'of', 'tea'],
      how: 'Left hand on the two beats. Right hand three even taps across the same two beats. Say "nice cup of tea": both hands on "nice", right on "cup", left on "of", right on "tea".' },
    { id: 'three-two-swap', level: 3, title: '3 against 2, hands swapped', cycleBeats: 2, poly: [2, 3], bpm: 50,
      saying: ['Nice', 'cup', 'of', 'tea'],
      how: 'Now the left hand plays the three and the right hand plays the beat. Same words, other hands.' },
    { id: 'two-three', level: 3, title: '2 against 3', cycleBeats: 3, poly: [2, 3], bpm: 75,
      saying: ['Nice', 'cup', 'of', 'tea'],
      how: 'The same rhythm felt the other way: the left hand plays three beats, the right hand two even taps across them.' },
    { id: 'four-three', level: 3, title: '4 against 3', cycleBeats: 3, poly: [4, 3], bpm: 50,
      saying: ['Pass', 'the', 'gol-', 'den', 'but-', 'ter'],
      how: 'Left hand on three beats, right hand four even taps across them. Some teachers say "pass the golden butter".' },
    { id: 'three-four', level: 3, title: '3 against 4', cycleBeats: 4, poly: [3, 4], bpm: 60,
      saying: ['Pass', 'the', 'gol-', 'den', 'but-', 'ter'],
      how: 'Left hand on four beats, right hand three even taps across them. The same pattern as 4 against 3, felt in four.' },
    { id: 'five-four', level: 3, title: '5 against 4', cycleBeats: 4, poly: [5, 4], bpm: 45,
      how: 'Left hand on four beats, right hand five even taps across them. Go slowly and use the grid below.' },
    { id: 'five-three', level: 3, title: '5 against 3', cycleBeats: 3, poly: [5, 3], bpm: 40,
      how: 'Left hand on three beats, right hand five even taps across them.' },
    { id: 'offbeats', level: 4, title: 'Accents on the off-beats', cycleBeats: 4, steps: 8, L: [0, 2, 4, 6], R: [0, 1, 2, 3, 4, 5, 6, 7], Racc: [1, 3, 5, 7], bpm: 60,
      how: 'Left hand on the beats. Right hand on every eighth note, a little stronger on the "and" between beats.' },
    { id: 'three-three-two', level: 4, title: '3 + 3 + 2 accents', cycleBeats: 4, steps: 8, L: [0, 2, 4, 6], R: [0, 1, 2, 3, 4, 5, 6, 7], Racc: [0, 3, 6], bpm: 60,
      how: 'Right hand on every eighth note, stronger on 1, 4 and 7 of the eight (count 1-2-3, 1-2-3, 1-2). The left hand keeps the beat.' },
    { id: 'paradiddle', level: 4, title: 'Paradiddle', cycleBeats: 4, steps: 8, R: [0, 2, 3, 5], L: [1, 4, 6, 7], Racc: [0], Lacc: [4], bpm: 60,
      how: 'A drummer’s pattern: right-left-right-right, left-right-left-left, stronger on the first note of each group.' },
    { id: 'free', level: 5, title: 'Free mode', free: true, bpm: 60,
      how: 'Choose how many taps each hand makes per cycle (1 to 9) and how many beats the cycle lasts.' }
  ];
  function exerciseById(id) { for (var i = 0; i < EXERCISES.length; i++) if (EXERCISES[i].id === id) return EXERCISES[i]; return null; }

  function minGap(hits, steps) {
    if (hits.length < 2) return steps;
    var g = steps;
    for (var i = 0; i < hits.length; i++) {
      var d = (i + 1 < hits.length ? hits[i + 1] : hits[0] + steps) - hits[i];
      if (d < g) g = d;
    }
    return g;
  }
  // free: {L, R, cycleBeats}
  function buildPattern(ex, swap, free) {
    var steps, R, L, Racc = ex.Racc || [], Lacc = ex.Lacc || [], cycleBeats = ex.cycleBeats || 4, nR, nL, i;
    var poly = ex.poly;
    if (ex.free) { free = free || {}; poly = [clamp(free.R || 3, 1, 9), clamp(free.L || 2, 1, 9)]; cycleBeats = clamp(free.cycleBeats || 2, 1, 8); }
    if (poly) {
      nR = poly[0]; nL = poly[1]; steps = lcm(nR, nL);
      R = []; L = [];
      for (i = 0; i < nR; i++) R.push(i * steps / nR);
      for (i = 0; i < nL; i++) L.push(i * steps / nL);
    } else {
      steps = ex.steps; R = ex.R.slice(); L = ex.L.slice(); nR = R.length; nL = L.length;
    }
    var p = {
      id: ex.id, title: ex.title, steps: steps, cycleBeats: cycleBeats, poly: !!poly,
      R: { hits: R, acc: Racc.slice(), n: nR, gap: minGap(R, steps) },
      L: { hits: L, acc: Lacc.slice(), n: nL, gap: minGap(L, steps) },
      swapped: !!swap
    };
    if (swap) { var tmp = p.R; p.R = p.L; p.L = tmp; }
    // the "saying": one syllable for every grid step where at least one hand lands
    var union = [];
    for (i = 0; i < steps; i++) if (p.R.hits.indexOf(i) >= 0 || p.L.hits.indexOf(i) >= 0) union.push(i);
    p.union = union;
    if (ex.saying && ex.saying.length === union.length) p.saying = { steps: union, words: ex.saying.slice() };
    return p;
  }

  /* ---------- rhythm trainer event source ----------
     Phases are in beats. The count-in fills phases [0, countIn); cycle c starts at countIn + c * cycleBeats.
     Events: {kind:'count', n, of}  {kind:'beat', cycle, beat}  {kind:'hit', hand, step, cycle, accent, gap}  {kind:'end'} */
  function TrainerSource(p, o) {
    o = o || {};
    this.p = p; this.countIn = o.countIn || 0; this.cycles = o.cycles || Infinity;
    this.queue = []; this.cycle = -1; this.done = false;
    for (var i = 0; i < this.countIn; i++) this.queue.push({ kind: 'count', n: i + 1, of: this.countIn, ph: i });
  }
  TrainerSource.prototype._fill = function () {
    while (!this.queue.length && !this.done) {
      this.cycle++;
      var c = this.cycle, p = this.p, base = this.countIn + c * p.cycleBeats;
      if (c >= this.cycles) { this.queue.push({ kind: 'end', ph: base, end: true }); this.done = true; break; }
      var list = [], i;
      for (i = 0; i < p.cycleBeats; i++) list.push({ kind: 'beat', cycle: c, beat: i, ph: base + i, order: 0 });
      var hands = ['L', 'R'];
      for (var h = 0; h < 2; h++) {
        var H = p[hands[h]];
        for (i = 0; i < H.hits.length; i++) {
          var st = H.hits[i];
          list.push({ kind: 'hit', hand: hands[h], step: st, cycle: c, accent: H.acc.indexOf(st) >= 0,
            gapBeats: H.gap / p.steps * p.cycleBeats, ph: base + st / p.steps * p.cycleBeats, order: 1 + h });
        }
      }
      list.sort(function (a, b) { return a.ph - b.ph || a.order - b.order; });
      this.queue = list;
    }
  };
  TrainerSource.prototype.peek = function () { this._fill(); return this.queue[0] || null; };
  TrainerSource.prototype.next = function () { this._fill(); return this.queue.shift() || null; };
  TrainerSource.prototype.refresh = function () {};

  /* ---------- scoring ----------
     Each target gets a window: 45% of the gap to that hand's next target, between 40 and 150 ms.
     A tap matches the nearest open target of its hand inside that window; otherwise it is an extra tap.
     The calibration offset (seconds, positive = your taps usually land late) is subtracted first. */
  function judge(errMs) {
    var a = Math.abs(errMs);
    if (a <= 30) return { cat: 'on', pts: 1 };
    if (a <= 60) return { cat: 'near', pts: 0.7 };
    return { cat: 'off', pts: 0.4 };
  }
  function Scorer(o) {
    o = o || {};
    this.offset = o.offset || 0;
    this.targets = []; this.extras = { L: 0, R: 0 }; this.taps = [];
  }
  Scorer.prototype.addTarget = function (ev, secPerBeat) {
    var gapSec = (ev.gapBeats || 1) * secPerBeat;
    var w = clamp(0.45 * gapSec, 0.04, 0.15);
    var tg = { t: ev.t, hand: ev.hand, w: w, hit: null, missed: false, cycle: ev.cycle, step: ev.step };
    this.targets.push(tg);
    return tg;
  };
  Scorer.prototype.tap = function (hand, t) {
    var tc = t - this.offset, best = null, bd = Infinity;
    for (var i = this.targets.length - 1; i >= 0; i--) {
      var g = this.targets[i];
      if (g.hand !== hand || g.hit || g.missed) continue;
      var d = Math.abs(tc - g.t);
      if (d <= g.w && d < bd) { bd = d; best = g; }
      if (g.t < tc - 1) break;
    }
    var rec = { hand: hand, t: t, tc: tc };
    if (best) {
      var err = (tc - best.t) * 1000, j = judge(err);
      best.hit = { err: err, cat: j.cat, pts: j.pts, t: t };
      rec.target = best; rec.err = err; rec.cat = j.cat;
    } else { this.extras[hand]++; rec.extra = true; }
    this.taps.push(rec);
    return rec;
  };
  Scorer.prototype.expire = function (now) {
    var out = [];
    for (var i = 0; i < this.targets.length; i++) {
      var g = this.targets[i];
      if (!g.hit && !g.missed && now - this.offset > g.t + g.w) { g.missed = true; out.push(g); }
    }
    return out;
  };
  Scorer.prototype.summary = function () {
    var due = 0, pts = 0, hits = 0, miss = 0, sumAbs = 0, perHand = { L: { n: 0, sum: 0, abs: 0 }, R: { n: 0, sum: 0, abs: 0 } }, errs = [];
    for (var i = 0; i < this.targets.length; i++) {
      var g = this.targets[i];
      if (g.hit) {
        due++; hits++; pts += g.hit.pts; sumAbs += Math.abs(g.hit.err); errs.push(g.hit.err);
        var H = perHand[g.hand]; H.n++; H.sum += g.hit.err; H.abs += Math.abs(g.hit.err);
      } else if (g.missed) { due++; miss++; }
    }
    var extras = this.extras.L + this.extras.R;
    var pct = due ? clamp(Math.round(100 * (pts - 0.25 * extras) / due), 0, 100) : 0;
    var mean = 0, sd = 0;
    if (errs.length) {
      for (i = 0; i < errs.length; i++) mean += errs[i]; mean /= errs.length;
      for (i = 0; i < errs.length; i++) sd += (errs[i] - mean) * (errs[i] - mean); sd = Math.sqrt(sd / errs.length);
    }
    function hs(H) { return H.n ? { n: H.n, mean: H.sum / H.n, abs: H.abs / H.n } : { n: 0, mean: 0, abs: 0 }; }
    return { due: due, hits: hits, misses: miss, extras: extras, pct: pct, meanAbs: hits ? sumAbs / hits : 0, mean: mean, sd: sd,
      L: hs(perHand.L), R: hs(perHand.R), rating: rating(pct) };
  };
  function rating(pct) {
    if (pct >= 90) return 'Excellent';
    if (pct >= 75) return 'Very good';
    if (pct >= 55) return 'Good start';
    return 'Keep at it';
  }

  /* ---------- calibration ----------
     taps and clicks are times in seconds (on the same clock). Taps near the first `skip` clicks are ignored
     (it takes a few clicks to lock in). Returns the median offset and a robust spread (1.4826 × MAD). */
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; }
  function calibrate(taps, clicks, skip) {
    skip = skip == null ? 4 : skip;
    var d = [];
    for (var i = 0; i < taps.length; i++) {
      var bi = -1, bd = Infinity;
      for (var j = 0; j < clicks.length; j++) { var x = taps[i] - clicks[j]; if (Math.abs(x) < Math.abs(bd)) { bd = x; bi = j; } }
      if (bi >= skip && Math.abs(bd) < 0.35) d.push(bd);
    }
    if (d.length < 6) return null;
    var med = median(d), dev = [];
    for (i = 0; i < d.length; i++) dev.push(Math.abs(d[i] - med));
    return { offset: med, spread: 1.4826 * median(dev), n: d.length };
  }

  /* ---------- tap tempo ---------- */
  function TapTempo() { this.times = []; }
  TapTempo.prototype.tap = function (t) {
    var ts = this.times;
    if (ts.length && (t - ts[ts.length - 1] > 2 || t <= ts[ts.length - 1])) ts.length = 0;
    ts.push(t);
    if (ts.length > 6) ts.shift();
    if (ts.length < 2) return null;
    var sum = 0;
    for (var i = 1; i < ts.length; i++) sum += ts[i] - ts[i - 1];
    return clamp(Math.round(60 / (sum / (ts.length - 1))), 20, 300);
  };
  TapTempo.prototype.reset = function () { this.times = []; };

  var core = {
    gcd: gcd, lcm: lcm, clamp: clamp, median: median,
    TEMPO_WORDS: TEMPO_WORDS, tempoWord: tempoWord,
    meter: meter, groupingsFor: groupingsFor, sameGroups: sameGroups, subdivisions: subdivisions, defaultAccents: defaultAccents,
    trainerTempo: trainerTempo, silentBar: silentBar,
    Scheduler: Scheduler, MetronomeSource: MetronomeSource,
    LEVELS: LEVELS, EXERCISES: EXERCISES, exerciseById: exerciseById, buildPattern: buildPattern, TrainerSource: TrainerSource,
    Scorer: Scorer, judge: judge, rating: rating, calibrate: calibrate, TapTempo: TapTempo
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (root) { root.TRBMusic = root.TRBMusic || {}; root.TRBMusic.rhythm = root.TRBMusic.rhythm || {}; root.TRBMusic.rhythm.core = core; }
})(typeof window !== 'undefined' ? window : null);
