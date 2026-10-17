/* TRBMusic.lessons.core: the logic behind the music lessons' drills (Teddy Rook Book). No DOM and no audio, so it
   runs in the browser (window.TRBMusic.lessons.core) and in node (module.exports) for tests.

   Pitches use scientific names as in the song format: "C4" is middle C, "F#4", "Bb3". A pitch object is
   { name, letter, alter (-2..2), octave, step (diatonic number: octave * 7 + C..B 0..6), midi }.

   API
     pitch(name) -> pitch | null          pitchFromStep(step, alter)        midiName(midi, preferFlat) -> "C#4"
     label(p, withOctave) -> "F♯" / "F♯4" (display, with ♯ and ♭)
     staffPos(p, clef)       half-spaces above the bottom line (0 = bottom line, 8 = top line; treble E4, bass G2)
     onLine(p, clef), ledgers(p, clef)   is the note on a line; how many ledger lines it needs
     clefFor(p)              'treble' at middle C and above, 'bass' below (for the grand staff)
     notePool(lo, hi, opts)  the notes from lo to hi; opts.acc: 'sharps' | 'flats' | 'both' adds black-key notes
                             (no E♯, B♯, C♭ or F♭), opts.only: 'lines' | 'spaces' (with opts.clef)
     rng(seed)               a small seeded random generator (mulberry32), returns a function like Math.random
     picker(pool, rand, avoid)   next() draws from pool without repeating any of the last `avoid` picks
     checkLetter(p, letter), checkKey(p, midi, exact) -> { ok, octaves }   (octaves: how far off the pressed key is)
     MAJOR_KEYS              [{ key, fifths, minor }] from C♭ (7 flats) to C♯ (7 sharps)
     keySig(fifths)          the accidentals in printed order: ["F#", "C#"] or ["Bb", "Eb", "Ab"]
     majorFor(fifths), minorFor(fifths), fifthsOf(key)  ("G" -> 1, "Em" -> 1, "Bb" -> -2)
     keyLabel(key)           "B♭ major" / "F♯ minor"
     scale(key, octave)      the 8 notes of a major (or natural minor) scale, e.g. ["G4", …, "F#5", "G5"]
     STEPS_MAJOR             [2, 2, 1, 2, 2, 2, 1] half steps between the notes of a major scale
     interval(a, b) -> { number, semis, quality: 'P'|'M'|'m'|'A'|'d', name: "major 3rd", short: "M3" }
     ordinal(n)              "unison", "2nd", "3rd", … "octave"
     intervalPool(level, lo, hi)  pairs [low, high] of natural notes; level 1: 2nds to octaves; level 2: the same,
                             named with their quality
     triad(root, quality)    ["C4", "E4", "G4"] for ('C4', 'major'); 'minor', 'diminished', 'augmented'
     beatsOf(base, dots)     length in quarter-note beats (base 1 = whole, 2 = half, 4 = quarter, 8, 16)
     fmtBeats(b)             "1½", "½", "¾", "4"
     VALUES                  note and rest values for the "how many beats" drill
     parseRhythm(text)       "B4/4 B4/8 B4/8 r/4 | …" -> { notes: [{ beat, beats, rest, tie }], total } (quarter beats)
     onsets(rh)              start beats of the notes you tap (rests and tied continuations skipped)
     countLabel(beat, beatsPerBar)  "1", "&", "e", "a" (counting with "1 e & a")
     RHYTHMS                 {'4/4': [...], '3/4': [...], '2/4': [...]} two-bar rhythms by level (1–3)
     judge(errSec)           { cat: 'on' | 'close' | 'off', pts }
     scoreTaps(targets, taps, opts) -> { items: [{ t, tap, err, cat }], extras, hit, pct, meanMs }
     scoreNotes(targets, taps, opts)  the same for keys: [{ t, midi }]; a tap counts only on its own key
                             (items[].cat adds 'wrong': a different key was played there)
     record(state, id, right, total, now) -> state   (keeps best, last and number of rounds per drill)
     shuffle(arr, rand)
*/
(function (root) {
  'use strict';
  var LETTERS = 'CDEFGAB';
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var ALTER = { '': 0, n: 0, '#': 1, b: -1, '##': 2, bb: -2 };
  var ACC_TXT = { '-2': 'bb', '-1': 'b', '0': '', '1': '#', '2': '##' };
  var ACC_SYM = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };

  /* ---------- pitches ---------- */
  function pitch(name) {
    if (name && typeof name === 'object' && name.step != null) return name;
    var m = /^([A-G])(##|bb|#|b|n)?(-?\d)$/.exec(String(name || '').trim());
    if (!m) return null;
    var letter = m[1], alter = ALTER[m[2] || ''], octave = +m[3];
    return {
      name: letter + ACC_TXT[alter] + octave, letter: letter, alter: alter, octave: octave,
      step: octave * 7 + LETTERS.indexOf(letter),
      midi: (octave + 1) * 12 + PC[letter] + alter
    };
  }
  function pitchFromStep(step, alter) {
    var o = Math.floor(step / 7), l = LETTERS[step - o * 7];
    return pitch(l + ACC_TXT[alter || 0] + o);
  }
  function midiName(midi, flat) {
    var n = flat ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return n[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
  }
  function label(p, withOct) {
    p = pitch(p);
    return p ? p.letter + ACC_SYM[p.alter] + (withOct ? p.octave : '') : '';
  }
  var BOTTOM = { treble: 30, bass: 18 }; // E4 and G2 as diatonic steps
  function staffPos(p, clef) { return pitch(p).step - BOTTOM[clef === 'bass' ? 'bass' : 'treble']; }
  function onLine(p, clef) { return ((staffPos(p, clef) % 2) + 2) % 2 === 0; }
  function ledgers(p, clef) {
    var s = staffPos(p, clef);
    if (s <= -2) return Math.floor(-s / 2);
    if (s >= 10) return Math.floor((s - 8) / 2);
    return 0;
  }
  function clefFor(p) { return pitch(p).midi >= 60 ? 'treble' : 'bass'; }

  function notePool(lo, hi, opts) {
    opts = opts || {};
    var a = pitch(lo).step, b = pitch(hi).step, m0 = pitch(lo).midi, m1 = pitch(hi).midi, out = [];
    function add(q) { if (q.midi >= m0 && q.midi <= m1) out.push(q.name); }
    for (var s = a; s <= b; s++) {
      var p = pitchFromStep(s, 0);
      if (opts.only && opts.clef) {
        var line = onLine(p, opts.clef);
        if ((opts.only === 'lines') !== line) continue;
      }
      out.push(p.name);
      if (opts.acc === 'sharps' || opts.acc === 'both') if (p.letter !== 'E' && p.letter !== 'B') add(pitchFromStep(s, 1));
      if (opts.acc === 'flats' || opts.acc === 'both') if (p.letter !== 'C' && p.letter !== 'F') add(pitchFromStep(s, -1));
    }
    return out;
  }

  /* ---------- randomness ---------- */
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function picker(pool, rand, avoid) {
    rand = rand || Math.random;
    avoid = Math.min(avoid == null ? 1 : avoid, Math.max(0, pool.length - 1));
    var recent = [];
    return function next() {
      var ok = pool.filter(function (x) { return recent.indexOf(JSON.stringify(x)) < 0; });
      if (!ok.length) ok = pool;
      var x = ok[Math.floor(rand() * ok.length)];
      recent.push(JSON.stringify(x));
      while (recent.length > avoid) recent.shift();
      return x;
    };
  }
  function shuffle(arr, rand) {
    rand = rand || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- answers ---------- */
  function checkLetter(p, letter) { return pitch(p).letter === String(letter).toUpperCase(); }
  function checkKey(p, midi, exact) {
    p = pitch(p);
    var same = ((midi - p.midi) % 12 + 12) % 12 === 0;
    var oct = same ? Math.round((midi - p.midi) / 12) : null;
    return { ok: exact ? midi === p.midi : same, sameKey: midi === p.midi, octaves: oct };
  }

  /* ---------- keys and key signatures ---------- */
  var MAJ = ['Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
  var MIN = ['Abm', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm', 'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];
  var MAJOR_KEYS = MAJ.map(function (k, i) { return { key: k, fifths: i - 7, minor: MIN[i] }; });
  function keySig(fifths) {
    var n = Math.abs(fifths);
    return fifths >= 0 ? 'FCGDAEB'.slice(0, n).split('').map(function (l) { return l + '#'; }) :
      'BEADGCF'.slice(0, n).split('').map(function (l) { return l + 'b'; });
  }
  function majorFor(f) { return MAJ[f + 7]; }
  function minorFor(f) { return MIN[f + 7]; }
  function fifthsOf(key) {
    var i = MAJ.indexOf(key);
    if (i >= 0) return i - 7;
    i = MIN.indexOf(key);
    return i >= 0 ? i - 7 : null;
  }
  function keyLabel(key) {
    var minor = /m$/.test(key), t = minor ? key.slice(0, -1) : key;
    return t.replace('#', '♯').replace(/^([A-G])b/, '$1♭') + (minor ? ' minor' : ' major');
  }
  function alterIn(fifths, letter) {
    var sig = keySig(fifths);
    for (var i = 0; i < sig.length; i++) if (sig[i][0] === letter) return sig[i][1] === '#' ? 1 : -1;
    return 0;
  }
  var STEPS_MAJOR = [2, 2, 1, 2, 2, 2, 1];
  function scale(key, octave) {
    var f = fifthsOf(key), minor = /m$/.test(key), t = minor ? key.slice(0, -1) : key;
    var tp = pitch(t + (octave == null ? 4 : octave)), out = [];
    for (var i = 0; i < 8; i++) {
      var p = pitchFromStep(tp.step + i, 0);
      out.push(pitchFromStep(p.step, alterIn(f, p.letter)).name);
    }
    return out;
  }

  /* ---------- intervals and chords ---------- */
  var PERFECT = { 1: 0, 4: 5, 5: 7, 8: 12 }, MAJORI = { 2: 2, 3: 4, 6: 9, 7: 11 };
  var QNAME = { P: 'perfect', M: 'major', m: 'minor', A: 'augmented', d: 'diminished' };
  function ordinal(n) {
    if (n === 1) return 'unison';
    if (n === 8) return 'octave';
    var s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
    return n + s;
  }
  function interval(a, b) {
    a = pitch(a); b = pitch(b);
    if (b.step < a.step || (b.step === a.step && b.midi < a.midi)) { var t = a; a = b; b = t; }
    var number = b.step - a.step + 1, semis = b.midi - a.midi;
    var simple = ((number - 1) % 7) + 1, oct = Math.floor((number - 1) / 7);
    if (number === 8) { simple = 8; oct = 0; }
    var s = semis - oct * 12, q;
    if (PERFECT[simple] != null) { var d = s - PERFECT[simple]; q = d === 0 ? 'P' : d === 1 ? 'A' : d === -1 ? 'd' : null; }
    else { var e = s - MAJORI[simple]; q = e === 0 ? 'M' : e === -1 ? 'm' : e === 1 ? 'A' : e === -2 ? 'd' : null; }
    return { number: number, semis: semis, quality: q, name: (q ? QNAME[q] + ' ' : '') + ordinal(number), short: (q || '?') + (number === 8 ? 8 : number) };
  }
  function intervalPool(level, lo, hi) {
    var notes = notePool(lo || 'C4', hi || 'C5'), out = [];
    for (var i = 0; i < notes.length; i++) for (var j = i + 1; j < notes.length; j++) {
      var iv = interval(notes[i], notes[j]);
      if (iv.number < 2 || iv.number > 8) continue;
      if (level >= 2 && (iv.quality === 'A' || iv.quality === 'd') && iv.number !== 4 && iv.number !== 5) continue;
      out.push([notes[i], notes[j]]);
    }
    return out;
  }
  var TRIAD = { major: [4, 7], minor: [3, 7], diminished: [3, 6], augmented: [4, 8] };
  function triad(root, quality) {
    var r = pitch(root), want = TRIAD[quality || 'major'], out = [r.name];
    [2, 4].forEach(function (k, i) {
      var base = pitchFromStep(r.step + k, 0), alter = r.midi + want[i] - base.midi;
      out.push(pitchFromStep(base.step, alter).name);
    });
    return out;
  }

  /* ---------- rhythm ---------- */
  function beatsOf(base, dots) {
    var b = 4 / base, add = b;
    for (var i = 0; i < (dots || 0); i++) { add /= 2; b += add; }
    return b;
  }
  function fmtBeats(b) {
    var w = Math.floor(b + 1e-9), r = Math.round((b - w) * 4) / 4;
    var fr = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' }[r];
    if (fr == null) return String(Math.round(b * 1000) / 1000);
    return (w || !fr ? String(w) : '') + fr;
  }
  var VALUES = [
    { tok: 'C5/1', beats: 4, name: 'whole note' }, { tok: 'C5/2', beats: 2, name: 'half note' },
    { tok: 'C5/4', beats: 1, name: 'quarter note' }, { tok: 'C5/8', beats: 0.5, name: 'eighth note' },
    { tok: 'C5/16', beats: 0.25, name: 'sixteenth note' }, { tok: 'C5/2.', beats: 3, name: 'dotted half note', lv: 2 },
    { tok: 'C5/4.', beats: 1.5, name: 'dotted quarter note', lv: 2 }, { tok: 'C5/8.', beats: 0.75, name: 'dotted eighth note', lv: 3 },
    { tok: 'r/1', beats: 4, name: 'whole rest', rest: true }, { tok: 'r/2', beats: 2, name: 'half rest', rest: true },
    { tok: 'r/4', beats: 1, name: 'quarter rest', rest: true }, { tok: 'r/8', beats: 0.5, name: 'eighth rest', rest: true },
    { tok: 'r/16', beats: 0.25, name: 'sixteenth rest', rest: true, lv: 2 }
  ];
  function parseRhythm(text) {
    var notes = [], beat = 0, prevTie = false;
    String(text).replace(/\|/g, ' ').split(/\s+/).filter(Boolean).forEach(function (tok) {
      var m = /^(r|\[[^\]]+\]|[A-G](?:##|bb|#|b|n)?-?\d)\/(\d+)(\.*)(~?)$/.exec(tok);
      if (!m) throw new Error('bad rhythm token "' + tok + '"');
      var len = beatsOf(+m[2], m[3].length);
      notes.push({ beat: beat, beats: len, rest: m[1] === 'r', tie: !!m[4], tied: prevTie, tok: tok });
      prevTie = !!m[4];
      beat += len;
    });
    return { notes: notes, total: beat };
  }
  function onsets(rh) { return rh.notes.filter(function (n) { return !n.rest && !n.tied; }).map(function (n) { return n.beat; }); }
  function countLabel(beat, perBar) {
    var inBar = beat - Math.floor(beat / perBar + 1e-9) * perBar, b = Math.floor(inBar + 1e-9), f = Math.round((inBar - b) * 4) / 4;
    return f === 0 ? String(b + 1) : f === 0.5 ? '&' : f === 0.25 ? 'e' : f === 0.75 ? 'a' : '';
  }
  // two-bar rhythms on one pitch, by level: 1 quarters, halves and wholes; 2 adds eighths and rests; 3 dotted notes and ties
  var RHYTHMS = {
    '4/4': [
      { lv: 1, t: 'B4/4 B4/4 B4/4 B4/4 | B4/2 B4/2' }, { lv: 1, t: 'B4/2 B4/4 B4/4 | B4/1' },
      { lv: 1, t: 'B4/4 B4/4 B4/2 | B4/4 B4/4 B4/2' }, { lv: 1, t: 'B4/4 B4/2 B4/4 | B4/2 B4/2' },
      { lv: 2, t: 'B4/8 B4/8 B4/4 B4/8 B4/8 B4/4 | B4/4 B4/4 B4/2' }, { lv: 2, t: 'B4/4 r/4 B4/4 r/4 | B4/8 B4/8 B4/8 B4/8 B4/2' },
      { lv: 2, t: 'B4/4 B4/8 B4/8 B4/4 B4/4 | B4/8 B4/8 B4/8 B4/8 B4/4 r/4' }, { lv: 2, t: 'r/4 B4/4 B4/4 B4/4 | B4/8 B4/8 B4/4 B4/2' },
      { lv: 3, t: 'B4/4. B4/8 B4/4 B4/4 | B4/4. B4/8 B4/2' }, { lv: 3, t: 'B4/2. B4/4 | B4/8 B4/4 B4/8 B4/2' },
      { lv: 3, t: 'B4/4 B4/4 B4/2~ | B4/4 B4/4 B4/2' }, { lv: 3, t: 'B4/8 B4/8 B4/4. B4/8 B4/4 | B4/4. B4/8 B4/4 r/4' }
    ],
    '3/4': [
      { lv: 1, t: 'B4/4 B4/4 B4/4 | B4/2.' }, { lv: 1, t: 'B4/2 B4/4 | B4/2 B4/4' }, { lv: 1, t: 'B4/4 B4/2 | B4/4 B4/4 B4/4' },
      { lv: 2, t: 'B4/8 B4/8 B4/4 B4/4 | B4/2 r/4' }, { lv: 2, t: 'B4/4 B4/8 B4/8 B4/4 | B4/8 B4/8 B4/8 B4/8 B4/4' },
      { lv: 3, t: 'B4/4. B4/8 B4/4 | B4/2.' }, { lv: 3, t: 'B4/2 B4/4~ | B4/4 B4/4 B4/4' }
    ],
    '2/4': [
      { lv: 1, t: 'B4/4 B4/4 | B4/2' }, { lv: 1, t: 'B4/2 | B4/4 B4/4' },
      { lv: 2, t: 'B4/8 B4/8 B4/4 | B4/8 B4/8 B4/4' }, { lv: 2, t: 'B4/4 r/4 | B4/8 B4/8 B4/4' },
      { lv: 3, t: 'B4/4. B4/8 | B4/4 B4/4' }, { lv: 3, t: 'B4/8 B4/4 B4/8 | B4/2' }
    ]
  };

  /* ---------- tap scoring ---------- */
  function judge(err) {
    var a = Math.abs(err);
    if (a <= 0.06) return { cat: 'on', pts: 1 };
    if (a <= 0.12) return { cat: 'close', pts: 0.6 };
    return { cat: 'off', pts: 0.25 };
  }
  // targets and taps in seconds (same clock). Each target takes the closest free tap within its window (at most
  // opts.window, and never more than halfway to the next or previous target). Unmatched taps are extras.
  function scoreTaps(targets, taps, opts) {
    opts = opts || {};
    var W = opts.window || 0.25, used = {}, items = [], pts = 0, hit = 0, sum = 0;
    targets.forEach(function (t, i) {
      var prev = i > 0 ? targets[i - 1] : -Infinity, next = i < targets.length - 1 ? targets[i + 1] : Infinity;
      var lo = Math.max(t - W, (prev + t) / 2), hi = Math.min(t + W, (t + next) / 2);
      var best = -1, bd = Infinity;
      taps.forEach(function (x, k) { if (!used[k] && x >= lo && x <= hi && Math.abs(x - t) < bd) { bd = Math.abs(x - t); best = k; } });
      if (best < 0) { items.push({ t: t, tap: null, err: null, cat: 'miss' }); return; }
      used[best] = true;
      var err = taps[best] - t, j = judge(err);
      items.push({ t: t, tap: taps[best], err: err, cat: j.cat });
      pts += j.pts; hit++; sum += Math.abs(err);
    });
    var extras = taps.length - hit;
    var pct = targets.length ? Math.max(0, Math.round(100 * (pts - 0.25 * extras) / targets.length)) : 0;
    return { items: items, extras: extras, hit: hit, pct: Math.min(100, pct), meanMs: hit ? Math.round(1000 * sum / hit) : null };
  }

  // the same for notes on a keyboard: targets [{ t, midi }], taps [{ t, midi }]; a tap counts only on its own key
  function scoreNotes(targets, taps, opts) {
    var items = [], used = {}, pts = 0, hit = 0, sum = 0, W = (opts && opts.window) || 0.3;
    targets.forEach(function (g, i) {
      var prev = i > 0 ? targets[i - 1].t : -Infinity, next = i < targets.length - 1 ? targets[i + 1].t : Infinity;
      var lo = Math.max(g.t - W, (prev + g.t) / 2), hi = Math.min(g.t + W, (g.t + next) / 2), best = -1, bd = Infinity;
      taps.forEach(function (x, k) { if (!used[k] && x.midi === g.midi && x.t >= lo && x.t <= hi && Math.abs(x.t - g.t) < bd) { bd = Math.abs(x.t - g.t); best = k; } });
      if (best < 0) {
        var wrong = taps.some(function (x, k) { return !used[k] && x.midi !== g.midi && x.t >= lo && x.t <= hi; });
        items.push({ t: g.t, midi: g.midi, tap: null, err: null, cat: wrong ? 'wrong' : 'miss' });
        return;
      }
      used[best] = true;
      var err = taps[best].t - g.t, j = judge(err);
      items.push({ t: g.t, midi: g.midi, tap: taps[best].t, err: err, cat: j.cat });
      pts += j.pts; hit++; sum += Math.abs(err);
    });
    var extras = taps.length - hit;
    var pct = targets.length ? Math.max(0, Math.round(100 * (pts - 0.25 * extras) / targets.length)) : 0;
    return { items: items, extras: extras, hit: hit, pct: Math.min(100, pct), meanMs: hit ? Math.round(1000 * sum / hit) : null };
  }

  /* ---------- progress ---------- */
  function record(state, id, right, total, now) {
    state = state && typeof state === 'object' ? state : {};
    var d = state.drills = state.drills || {};
    var r = d[id] = d[id] || { rounds: 0 };
    r.rounds = (r.rounds || 0) + 1;
    r.last = [right, total];
    if (!r.best || right / total > r.best[0] / r.best[1] || (right / total === r.best[0] / r.best[1] && total > r.best[1])) r.best = [right, total];
    r.at = now || 0;
    return state;
  }

  var core = {
    pitch: pitch, pitchFromStep: pitchFromStep, midiName: midiName, label: label,
    staffPos: staffPos, onLine: onLine, ledgers: ledgers, clefFor: clefFor, notePool: notePool,
    rng: rng, picker: picker, shuffle: shuffle, checkLetter: checkLetter, checkKey: checkKey,
    MAJOR_KEYS: MAJOR_KEYS, keySig: keySig, majorFor: majorFor, minorFor: minorFor, fifthsOf: fifthsOf, keyLabel: keyLabel,
    scale: scale, STEPS_MAJOR: STEPS_MAJOR, interval: interval, ordinal: ordinal, intervalPool: intervalPool, triad: triad,
    beatsOf: beatsOf, fmtBeats: fmtBeats, VALUES: VALUES, parseRhythm: parseRhythm, onsets: onsets, countLabel: countLabel,
    RHYTHMS: RHYTHMS, judge: judge, scoreTaps: scoreTaps, scoreNotes: scoreNotes, record: record
  };
  if (typeof module === 'object' && module.exports) module.exports = core;
  else {
    var TRB = root.TRBMusic = root.TRBMusic || {};
    (TRB.lessons = TRB.lessons || {}).core = core;
  }
})(typeof window !== 'undefined' ? window : this);
