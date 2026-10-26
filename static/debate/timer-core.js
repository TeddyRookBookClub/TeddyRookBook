/* Debate timer logic (no DOM): reads a format, builds the order of speeches, and runs the clocks.
   Used by static/debate/timer.js, drills.js and the Node tests (scripts/debate/test-timer.js). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DebateTimerCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- reading a format ---------- */

  // A time in seconds from any of the shapes a data file might use: {seconds}, {minutes}, {time:"8:00"} or a bare number of minutes.
  function toSec(o) {
    if (o == null) return 0;
    if (typeof o === 'number') return Math.round(o * 60);
    if (typeof o === 'string') return parseClock(o);
    if (o.seconds != null) return Math.round(+o.seconds);
    if (o.sec != null) return Math.round(+o.sec);
    if (o.minutes != null) return Math.round(+o.minutes * 60);
    if (o.min != null) return Math.round(+o.min * 60);
    if (o.time != null) return toSec(o.time);
    if (o.length != null) return toSec(o.length);
    return 0;
  }
  // "8:00" -> 480, "1:30" -> 90, "90s" -> 90, "4" -> 240 (minutes)
  function parseClock(s) {
    s = String(s).trim();
    var m = s.match(/^(\d+):(\d{1,2})$/);
    if (m) return +m[1] * 60 + +m[2];
    m = s.match(/^(\d+(?:\.\d+)?)\s*(s|sec|seconds?)$/i);
    if (m) return Math.round(+m[1]);
    m = s.match(/^(\d+(?:\.\d+)?)\s*(m|min|minutes?)?$/i);
    if (m) return Math.round(+m[1] * 60);
    return 0;
  }

  var KIND_WORDS = [
    ['cross', /cross|crossfire|\bcx\b|question/i],
    ['reply', /reply/i],
    ['summary', /summary/i],
    ['final', /final focus/i],
    ['rebuttal', /rebuttal|\b[12]?[ANR]R\b|whip|\bR$/i],
    ['constructive', /constructive|minister|leader|member|opening|first|second|third/i]
  ];
  function guessKind(sp) {
    var t = (sp.name || '') + ' ' + (sp.short || '');
    for (var i = 0; i < KIND_WORDS.length; i++) if (KIND_WORDS[i][1].test(t)) return KIND_WORDS[i][0];
    return 'speech';
  }

  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function normSides(raw) {
    var s = raw.sides || raw.teams;
    var out = [];
    if (Array.isArray(s)) {
      s.forEach(function (x, i) {
        if (typeof x === 'string') out.push({ id: slug(x) || 's' + i, name: x, short: x });
        else out.push({ id: String(x.id || x.key || slug(x.name) || 's' + i), name: x.name || x.id, short: x.short || x.abbr || x.name || x.id });
      });
    } else if (s && typeof s === 'object') {
      Object.keys(s).forEach(function (k) { var v = s[k]; out.push({ id: k, name: typeof v === 'string' ? v : (v.name || k), short: (v && v.short) || k }); });
    }
    if (!out.length) out = [{ id: 'aff', name: 'Affirmative', short: 'Aff' }, { id: 'neg', name: 'Negative', short: 'Neg' }];
    return out;
  }

  function normSpeech(sp, i, sides) {
    var side = sp.side != null ? sp.side : (sp.team != null ? sp.team : (sp.by != null ? sp.by : 'none'));
    side = String(side);
    var low = side.toLowerCase();
    // match a side by id, name or short name
    var found = false;
    for (var j = 0; j < sides.length; j++) {
      if (low === sides[j].id.toLowerCase() || low === String(sides[j].name).toLowerCase() || low === String(sides[j].short).toLowerCase()) { side = sides[j].id; found = true; break; }
    }
    // otherwise a shared word ("both", "any") or "A"/"B" for the first and second speaking team
    if (!found && /^(both|all|any|none|neither|chamber|alt|a|b)$/i.test(side)) side = side.length === 1 ? side.toUpperCase() : low;
    var o = {
      i: i,
      short: sp.short || sp.abbr || sp.code || ('S' + (i + 1)),
      name: sp.name || sp.title || sp.short || ('Speech ' + (i + 1)),
      side: side,
      sec: toSec(sp),
      kind: sp.kind || sp.type || guessKind(sp),
      poi: !!(sp.poi || sp.pois || sp.points_of_information)
    };
    if (sp.asker) o.asker = String(sp.asker);
    if (sp.speaker) o.speaker = sp.speaker;
    if (sp.note) o.note = sp.note;
    return o;
  }

  function prepOf(raw) {
    var p = raw.prep != null ? raw.prep : (raw.prep_time != null ? raw.prep_time : raw.prepTime);
    if (p == null || p === false) return { sec: 0, per: 'none', note: '' };
    // prep that happens before the round (World Schools, BP, parli): {per:"none", when:"before", before_seconds}
    if (typeof p === 'object' && p.before_seconds && !(+p.seconds > 0)) return { sec: Math.round(+p.before_seconds), per: 'round', note: p.note || '' };
    if (typeof p === 'number' || typeof p === 'string') return { sec: toSec(p), per: 'side', note: '' };
    var sec = toSec(p.per_side != null ? p.per_side : (p.each != null ? p.each : p));
    var per = p.per || p.scope || (p.before_round || p.round ? 'round' : 'side');
    if (p.round != null && p.per_side == null && p.seconds == null && p.minutes == null) sec = toSec(p.round);
    if (!/^(side|round|none)$/.test(per)) per = /round|before/i.test(per) ? 'round' : 'side';
    if (!sec) per = 'none';
    return { sec: sec, per: per, note: p.note || p.notes || '' };
  }

  function normalizeFormat(raw, key) {
    raw = raw || {};
    var sides = normSides(raw);
    var f = {
      key: String(raw.key || raw.id || raw.slug || key || slug(raw.name)),
      name: raw.name || raw.title || key,
      short: raw.short || raw.abbr || raw.name || key,
      sides: sides,
      speeches: [],
      cycle: null,
      firstCycle: null,
      prep: prepOf(raw),
      poi: null,
      coin: !!(raw.first_by_coin || raw.coin_flip || raw.coinFlip || raw.flip || /^(pf|public-forum)$/.test(String(raw.key || raw.slug || key))),
      speakersPerSide: +(raw.speakers_per_side || raw.speakersPerSide || 0) || 0,
      url: raw.url || '',
      varies: raw.varies || raw.varies_note || '',
      order: +(raw.order || raw.weight || 0) || 999
    };
    var list = raw.speeches || raw.order || raw.structure || [];
    f.speeches = list.map(function (sp, i) { return normSpeech(sp, i, sides); });
    var cyc = raw.cycle || (raw.repeat && raw.repeat.speeches);
    // Congress-style data: "repeat" set and speeches = [first speech, its questioning, a typical speech, its questioning]
    if (!cyc && raw.repeat && f.speeches.length >= 2 && !raw.first_cycle) {
      var from = raw.repeat.from != null ? Math.max(0, Math.min(f.speeches.length - 1, +raw.repeat.from)) : Math.max(0, f.speeches.length - 2);
      f.repeatAt = from;
      f.firstCycle = f.speeches.slice(0, from);
      f.cycle = f.speeches.slice(from);
      f.repeatNote = raw.repeat.note || '';
      f.repeatFrom = true;
    } else if (cyc) {
      f.cycle = cyc.map(function (sp, i) { return normSpeech(sp, i, sides); });
      var fc = raw.first_cycle || raw.firstCycle || (raw.repeat && raw.repeat.first);
      if (fc) f.firstCycle = fc.map(function (sp, i) { return normSpeech(sp, i, sides); });
    }
    var poi = raw.poi || raw.points_of_information;
    if (poi && typeof poi === 'object' && Array.isArray(poi.in)) {
      f.speeches.forEach(function (sp) { if (poi.in.indexOf(sp.kind) >= 0) sp.poi = true; });
    }
    if (poi && typeof poi === 'object') {
      f.poi = { start: secOrNum(poi.protected_start != null ? poi.protected_start : poi.start, 60), end: secOrNum(poi.protected_end != null ? poi.protected_end : poi.end, 60) };
    } else if (poi === true || f.speeches.some(function (s) { return s.poi; })) {
      f.poi = { start: 60, end: 60 };
    }
    if (!f.speakersPerSide) {
      var bySide = {};
      f.speeches.forEach(function (s) { if (s.kind !== 'cross' && s.kind !== 'reply') bySide[s.side] = (bySide[s.side] || 0) + 1; });
      var counts = Object.keys(bySide).filter(function (k) { return sides.some(function (s) { return s.id === k; }); }).map(function (k) { return bySide[k]; });
      f.speakersPerSide = counts.length ? Math.min(Math.max.apply(null, counts), 3) : 1;
    }
    return f;
  }

  // All formats from whatever the data holds: a list, {formats:[...]}, or a map of key -> format (one file per format).
  function normalizeAll(data) {
    var arr = [];
    if (!data) return arr;
    if (Array.isArray(data)) arr = data.map(function (x) { return [x, null]; });
    else if (Array.isArray(data.formats)) arr = data.formats.map(function (x) { return [x, null]; });
    else Object.keys(data).forEach(function (k) {
      var v = data[k];
      if (v && Array.isArray(v.formats)) v.formats.forEach(function (x) { arr.push([x, null]); });
      else if (v && typeof v === 'object') arr.push([v, k]);
    });
    var out = arr.map(function (p) { return normalizeFormat(p[0], p[1]); })
      .filter(function (f) { return f.speeches.length || f.cycle; });
    out.forEach(function (f, i) { f._i = i; });
    out.sort(function (a, b) { return (a.order - b.order) || (a._i - b._i); });
    return out;
  }
  // protected POI time: a bare number is seconds here; objects and strings go through toSec
  function secOrNum(v, d) { if (v == null) return d; if (typeof v === 'number') return v; return toSec(v) || d; }

  /* ---------- building a round ---------- */

  // opts: {first: sideId for "A" (coin-flip formats), times: {index: seconds}, prep: seconds, cycles: n (repeating formats)}
  function buildPlan(f, opts) {
    opts = opts || {};
    var sides = f.sides;
    var segs = [];
    // the format's own speeches with any time changes (opts.times: {index in format.speeches: seconds})
    var base = f.speeches.map(function (sp, i) {
      var c = copy(sp);
      c.base = sp.sec;
      if (opts.times && opts.times[i] != null && isFinite(+opts.times[i])) c.sec = Math.max(0, Math.round(+opts.times[i]));
      return c;
    });
    if (f.cycle) {
      var first = f.repeatFrom ? base.slice(0, f.repeatAt) : (f.firstCycle || f.cycle);
      var cyc = f.repeatFrom ? base.slice(f.repeatAt) : f.cycle;
      if (!first.length) first = cyc;
      // opts.cycles = how many speeches in all (the first block counts its own speeches)
      var n = Math.max(1, Math.min(60, opts.cycles || 12));
      var alt = 0, num = 0;
      first.forEach(function (sp) {
        var s = copy(sp);
        if (s.kind !== 'cross') num++;
        s.num = num;
        segs.push(s);
      });
      var guard = 0;
      while (num < n && guard++ < 200) {
        cyc.forEach(function (sp) {
          var s = copy(sp);
          if (s.side === 'alt') { s.side = sides[alt % sides.length].id; }
          if (s.kind !== 'cross') { alt++; num++; }
          s.num = num;
          s.short = (/cross/.test(s.kind) ? 'Q' : 'S') + num;
          if (s.base == null) s.base = s.sec;
          segs.push(s);
        });
      }
    } else {
      segs = base;
    }
    // coin-flip formats: "A" and "B" become real sides; opts.swap trades the first two sides (who speaks first)
    var a = opts.first || sides[0].id;
    var b = sides[0].id === a ? (sides[1] && sides[1].id) : sides[0].id;
    var s0 = sides[0].id, s1 = sides[1] ? sides[1].id : null;
    function sw(x) { return !opts.swap || !s1 ? x : (x === s0 ? s1 : (x === s1 ? s0 : x)); }
    segs.forEach(function (s, i) {
      if (s.side === 'A') s.side = a;
      else if (s.side === 'B') s.side = b;
      s.side = sw(s.side);
      if (s.asker) s.asker = sw(s.asker);
      if (opts.swap && s1) { s.name = swapWords(s.name, sides[0].name, sides[1].name); s.short = swapWords(s.short, sides[0].short, sides[1].short); }
      s.i = i;
      s.label = sideName(f, s.side);
    });
    if (opts.names) {
      sides = sides.map(function (sd) { var c = copy(sd); if (opts.names[sd.id]) c.name = opts.names[sd.id]; return c; });
      f = copy(f); f.sides = sides;
      segs.forEach(function (s) { s.label = sideName(f, s.side); });
    }
    var prepSec = opts.prep != null ? Math.max(0, Math.round(+opts.prep)) : f.prep.sec;
    var banks = {};
    if (f.prep.per === 'side' && prepSec > 0) sides.forEach(function (sd) { banks[sd.id] = prepSec; });
    return { key: f.key, name: f.name, view: f, segs: segs, prep: prepSec, prepPer: prepSec > 0 ? f.prep.per : 'none', banks: banks, sides: sides, poi: f.poi };
  }
  // trade two words in a label ("Pro Constructive" <-> "Con Constructive")
  function swapWords(t, x, y) {
    if (!x || !y || x === y) return t;
    var rx = new RegExp('\\b(' + esc(x) + '|' + esc(y) + ')\\b', 'g');
    return String(t).replace(rx, function (m) { return m === x ? y : x; });
  }
  function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function copy(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }
  function sideName(f, id) {
    for (var i = 0; i < f.sides.length; i++) if (f.sides[i].id === id) return f.sides[i].name;
    return ({ both: 'Both sides', all: 'Everyone', none: '', chamber: 'The chamber', any: 'Any member' })[id] || '';
  }
  // who is up: "Negative", or for cross-ex "Negative asks"
  function who(f, s) {
    if (!s) return '';
    if (/cross/.test(s.kind || '') && s.asker) {
      if (s.asker === 'both' || s.asker === 'all') return 'Both sides ask';
      if (s.asker === 'any') return 'Questions from the chamber';
      var n = sideName(f, s.asker);
      return n ? n + ' asks' : '';
    }
    return sideName(f, s.side);
  }
  function totalSeconds(plan) { return plan.segs.reduce(function (t, s) { return t + s.sec; }, 0); }

  /* ---------- the clock ---------- */

  // A timer for one round. Time comes from the caller (ms), so it never drifts and tests can drive it.
  function Round(plan, opts) {
    opts = opts || {};
    this.plan = plan;
    this.warn = (opts.warn || [60, 30]).slice().sort(function (a, b) { return b - a; });
    this.i = 0;
    this.left = {};               // seconds left per segment index (ms precision kept in leftMs)
    this.leftMs = plan.segs.length ? plan.segs[0].sec * 1000 : 0;
    this.done = {};
    this.running = null;          // null | 'speech' | 'prep' | 'round'
    this.prepSide = null;
    this.bankMs = {};
    for (var k in plan.banks) this.bankMs[k] = plan.banks[k] * 1000;
    this.roundPrepMs = plan.prepPer === 'round' ? plan.prep * 1000 : 0;
    this.last = null;
    this.fired = {};
  }
  Round.prototype.seg = function () { return this.plan.segs[this.i] || null; };
  Round.prototype._advance = function (now) {
    var dt = this.last == null || now == null ? 0 : Math.max(0, now - this.last);
    if (now != null) this.last = now;
    var ev = [];
    if (!this.running || !dt) return ev;
    if (this.running === 'speech') {
      var before = this.leftMs;
      this.leftMs -= dt;
      ev = ev.concat(this._crossings('s' + this.i, before, this.leftMs, this.warn));
    } else if (this.running === 'prep') {
      var b0 = this.bankMs[this.prepSide];
      this.bankMs[this.prepSide] = b0 - dt;
      ev = ev.concat(this._crossings('p' + this.prepSide, b0, this.bankMs[this.prepSide], [60, 30]));
      ev.forEach(function (e) { e.prep = true; });
      var self = this; ev.forEach(function (e) { e.side = self.prepSide; });
    } else if (this.running === 'round') {
      var r0 = this.roundPrepMs;
      this.roundPrepMs = r0 - dt;
      ev = ev.concat(this._crossings('r', r0, this.roundPrepMs, [300, 60]));
      ev.forEach(function (e) { e.prep = true; e.round = true; });
    }
    return ev;
  };
  // which thresholds were crossed going from a to b (ms); each fires once per clock
  Round.prototype._crossings = function (id, a, b, marks) {
    var ev = [];
    var f = this.fired[id] || (this.fired[id] = {});
    marks.forEach(function (s) {
      var t = s * 1000;
      if (a > t && b <= t && !f[s]) { f[s] = 1; ev.push({ type: 'warn', at: s }); }
    });
    if (a > 0 && b <= 0 && !f.zero) { f.zero = 1; ev.push({ type: 'zero' }); }
    return ev;
  };
  Round.prototype.tick = function (now) { return this._advance(now); };
  Round.prototype.start = function (now) {
    this._advance(now);
    if (!this.seg()) return [];
    this.running = 'speech'; this.prepSide = null; this.last = now;
    return [{ type: 'start' }];
  };
  Round.prototype.pause = function (now) { var ev = this._advance(now); this.running = null; this.prepSide = null; return ev; };
  Round.prototype.toggle = function (now) { return this.running === 'speech' ? this.pause(now) : this.start(now); };
  Round.prototype.go = function (i, now) {
    if (i < 0 || i >= this.plan.segs.length) return [];
    this._advance(now != null ? now : this.last);
    if (this.running === 'speech') this.running = null;
    this.left[this.i] = this.leftMs;
    if (this.leftMs < this.seg().sec * 1000) this.done[this.i] = true;
    this.i = i;
    this.leftMs = this.left[i] != null ? this.left[i] : this.plan.segs[i].sec * 1000;
    return [{ type: 'go', i: i }];
  };
  Round.prototype.next = function (now) { return this.go(this.i + 1, now); };
  Round.prototype.prev = function (now) { return this.go(this.i - 1, now); };
  Round.prototype.reset = function (now) {
    this._advance(now != null ? now : this.last);
    if (this.running === 'speech') this.running = null;
    this.leftMs = this.seg() ? this.seg().sec * 1000 : 0;
    delete this.left[this.i];
    delete this.done[this.i];
    this.fired['s' + this.i] = {};
    return [{ type: 'reset' }];
  };
  Round.prototype.adjust = function (sec, now) {
    this._advance(now != null ? now : this.last);
    if (this.running === 'prep' && this.prepSide) this.bankMs[this.prepSide] = Math.max(0, this.bankMs[this.prepSide] + sec * 1000);
    else if (this.running === 'round') this.roundPrepMs = Math.max(0, this.roundPrepMs + sec * 1000);
    else this.leftMs = Math.max(0, this.leftMs + sec * 1000);
    return [{ type: 'adjust', by: sec }];
  };
  // start or stop one side's prep bank (pauses the speech clock)
  Round.prototype.prep = function (side, now) {
    if (!(side in this.bankMs)) return [];
    var ev = this._advance(now);
    if (this.running === 'prep' && this.prepSide === side) { this.running = null; this.prepSide = null; ev.push({ type: 'prepstop', side: side }); return ev; }
    this.running = 'prep'; this.prepSide = side; this.last = now;
    ev.push({ type: 'prepstart', side: side });
    return ev;
  };
  Round.prototype.roundPrep = function (now) {
    if (this.plan.prepPer !== 'round') return [];
    var ev = this._advance(now);
    if (this.running === 'round') { this.running = null; ev.push({ type: 'prepstop' }); return ev; }
    this.running = 'round'; this.prepSide = null; this.last = now;
    ev.push({ type: 'prepstart', round: true });
    return ev;
  };
  // seconds left on the clock the big display shows (negative = over time)
  Round.prototype.shown = function () {
    if (this.running === 'prep') return this.bankMs[this.prepSide] / 1000;
    if (this.running === 'round') return this.roundPrepMs / 1000;
    return this.leftMs / 1000;
  };
  // in a format with points of information: is this moment protected time?
  Round.prototype.poiState = function () {
    var s = this.seg(), p = this.plan.poi;
    if (!s || !s.poi || !p) return null;
    var el = s.sec - this.leftMs / 1000, left = this.leftMs / 1000;
    if (left <= 0) return 'over';
    return (el < p.start || left <= p.end) ? 'protected' : 'open';
  };
  Round.prototype.snapshot = function () {
    return { i: this.i, leftMs: this.leftMs, left: this.left, done: this.done, bankMs: this.bankMs, roundPrepMs: this.roundPrepMs, fired: this.fired };
  };
  Round.prototype.restore = function (s) {
    if (!s || s.i == null || s.i >= this.plan.segs.length) return;
    this.i = s.i; this.leftMs = s.leftMs; this.left = s.left || {}; this.done = s.done || {};
    for (var k in (s.bankMs || {})) if (k in this.bankMs) this.bankMs[k] = s.bankMs[k];
    if (s.roundPrepMs != null && this.plan.prepPer === 'round') this.roundPrepMs = s.roundPrepMs;
    this.fired = s.fired || {};
  };

  /* ---------- display helpers ---------- */

  // 125 -> "2:05", -7 -> "+0:07" (over time); rounds so the clock shows 8:00 at the start and 0:00 only at the end
  function clock(sec) {
    var neg = sec < 0;
    var s = neg ? Math.floor(-sec) : Math.ceil(sec - 1e-6);
    var m = Math.floor(s / 60), r = s % 60;
    return (neg ? '+' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }
  // words for a screen reader: 125 -> "2 minutes 5 seconds"
  function spoken(sec) {
    if (sec < 0) return 'over time by ' + spoken(-sec);
    var s = Math.ceil(sec - 1e-6), m = Math.floor(s / 60), r = s % 60, out = [];
    if (m) out.push(m + (m === 1 ? ' minute' : ' minutes'));
    if (r || !m) out.push(r + (r === 1 ? ' second' : ' seconds'));
    return out.join(' ');
  }
  // what a timekeeper holds up: fingers for minutes left (the last full-minute mark passed), a bent finger at 30 seconds, a fist at time
  function handSignal(sec) {
    if (sec <= 0) return { fingers: 0, half: false, fist: true, label: 'Time' };
    if (sec <= 30) return { fingers: 0, half: true, fist: false, label: '30 seconds' };
    var m = Math.ceil(sec / 60 - 1e-9);
    return { fingers: Math.min(m, 10), half: false, fist: false, label: m + (m === 1 ? ' minute' : ' minutes'), over10: m > 10 };
  }

  return {
    toSec: toSec, parseClock: parseClock, normalizeFormat: normalizeFormat, normalizeAll: normalizeAll,
    buildPlan: buildPlan, who: who, totalSeconds: totalSeconds, Round: Round, clock: clock, spoken: spoken, handSignal: handSignal, sideName: sideName
  };
});
