/* TRBMusic.fret (core): the fretted-instrument model of the music kit (Teddy Rook Book). Guitar, ukulele and 5-string
   banjo: instruments and tunings, note math, chord spelling, a voicing finder, the standard first-position shapes,
   chord naming (reverse lookup), right-hand patterns (strums, rolls, clawhammer, Travis), and the fretted song format
   (tab tokens -> a song.js model + per-note string/fret data). No DOM and no audio: it runs in the browser
   (window.TRBMusic.fret, needs song.js first) and in node (require('static/music/fret/core.js'), which loads song.js).

   CONVENTIONS
     Strings are numbered as players number them: 1 = the first string (the thinnest on guitar, A on ukulele, the high
     D on banjo). Arrays of per-string values (tunings, shapes, frets) run from the HIGHEST string number to string 1,
     the way chord shapes are written: guitar "x32010" = strings 6,5,4,3,2,1; ukulele "0003" = strings 4,3,2,1 (G C E A);
     banjo shapes are written for strings 4,3,2,1 ("2012" = C) with the 5th string open (or 5 values "0 2 0 1 2").
     Index i in such an array is string number (n - i).  frets: -1 = muted (x), 0 = open, 1.. = fretted.
     Pitches are MIDI numbers (60 = C4 = middle C, A4 = 440 Hz) or scientific names ("E2", "F#3", "Bb3").
     Pitches in the song format are written as they SOUND. Guitar and banjo music is printed an octave higher than it
     sounds (treble clef with a small 8 below); the kit does that itself (instrument.transpose = 12).
     The banjo's 5th string is short: its tuning peg sits at the 5th fret, so it has no frets 1-5. Tab numbers it from
     the full neck: open = 0, the first fret you can press is 6. pitch(5th string, fret f) = open + (f - 5).

   API (TRBMusic.fret.*)
     INSTRUMENTS, instrument(id) -> { id, name, strings, frets, scale (mm), tunings: { id: { name, notes:[...] } },
         tuning (default id), transpose, sizes (ukulele), short: { string: 5, at: 5 } (banjo) }
     tuning(instId, tuningId) -> { id, name, notes:["E2",...], midi:[40,...] }   (default tuning when id omitted)
     stringMidi(instId, tuningId, s, fret, capo) -> sounding MIDI of string s at fret (null if not playable)
     noteName(midi, preferFlat) "C#4"; pcName(pc, preferFlat) "C#"; parseNote("F#3") -> midi; freq(midi)
     parseChord("C7/G") -> { root, rootPc, quality, suffix, bass, bassPc, name, long, notes:["C","E","G","Bb"],
         pcs:[...], required:[...pcs], optional:[...pcs], intervals:[...] } or null.  QUALITIES lists them.
     spell(rootName, quality) -> ["C","E","G"] note names spelled by letter (Eb major: Eb G Bb; F#dim: F# A C)
     parseShape("x32010", instId) -> frets[] (full length; banjo 4 values get the 5th string open)
     shapeText(frets, instId) -> "x32010" (or "x 10 12 12 11 10" when a fret is 10 or more; banjo: "2012" for strings
         4 to 1 when the 5th string is open)
     shapePitches(frets, instId, tuningId, capo) -> [{ s, fret, midi }] sounding strings, lowest string number last
     fingersFor(frets, instId) -> { fingers:[...] ('' | '1'..'4'), barre: { fret, from, to } (string numbers) | null,
         count, ok }   the kit's fingering rule (see below)
     findVoicings(chord, instId, tuningId, opts) -> [voicing]   voicing = { frets, fingers, barre, common (bool),
         minFret, base (first fret shown on a diagram), pitches, score, name }
         opts: { maxFret: 12, span: 4 (frets one hand covers; 5 allowed with a penalty), limit: 40, capo: 0 }
     commonShapes(instId, tuningId) -> { chordName: [{ frets, fingers, barre }] }   the built-in first-position table
     shapesFor(chord, instId, tuningId) -> voicings: the table's shapes first, then the finder's
     nameChord(pitches[] (MIDI, any order) or frets + instId/tuningId) -> [{ name, root, quality, bass, score }]
     SCALES -> { major, minor, pentMajor, pentMinor, blues, mixolydian, dorian, harmonicMinor, chromatic:
         { name, steps: [semitones], labels: ['R', '2', '♭3', …] } }
     PATTERNS -> { id: { name, instruments:[...], time, text, about } }   named right-hand patterns
     parsePattern(text, opts) -> { bars: [[stroke]], errors }   stroke = { t (ticks in bar), dur, kind: 'down' | 'up' |
         'mute' | 'bass' | 'pluck' | 'rest' | 'miss', finger ('T','I','M','p','i','m','a','S','d','u'), strings:[s],
         bass: 1|2, accent }
     parseChordLine(text, model) -> { bars: [[{ name, chord, start, dur }]], errors }
     parseSong(yamlTextOrObject, opts) -> song.js model + model.fret = { instrument, tuning, capo, inst, tun,
         notes: { noteId: { s, fret, midi (sounding), tech: { h,p,s,si,b,bh,harm,x,acc }, pick } }, chords: [timed],
         pattern, accomp: [events], shapes: { name: voicing }, transpose, swing, voice }
         (errors and warnings use the song.js format: { msg, staff:'tab', bar, token })
     accompaniment(model, perf) -> events [{ start (tick), dur, s, fret, midi, vel, stroke, chord, strumIndex,
         strumCount, dir }] for a performance timeline from TRBMusic.song.performance()
     assignPosition(midi, instId, tuningId, capo, handPos, onString) -> { s, fret } | null   (the rule below)

   THE POSITION RULE (notes written as pitches, without a string): the kit plays each note on the string where it
     sits inside the current hand position (frets P..P+4, open strings always count as inside), choosing the lowest
     fret there; if no string has it inside the position, the lowest fret anywhere. P starts at 0 (first position) and
     changes with a `pos:N` token in the tab. `D4@3` forces string 3. Chords written as pitches get one string each,
     with the smallest stretch. Deterministic: the same text always gives the same tab.
   THE FINGERING RULE (fingersFor): fretted notes in order of fret, then from the bass string up; each gets the next
     finger, but never a lower number than (fret - lowest fret + 1). When that needs more than four fingers and two or
     more strings share the lowest fret with no open or muted string between them, finger 1 lies flat across them (a
     barre) and the rest follow the same rule. More than four fingers, or frets more than 4 apart, = not playable.
*/
(function (root) {
  'use strict';
  var S = root.TRBMusic && root.TRBMusic.song;
  if (!S && typeof require === 'function') { try { S = require('../kit/song.js'); } catch (e) { S = null; } }
  var TPQ = S ? S.TPQ : 10080;

  /* ================= notes ================= */
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var LET = 'CDEFGAB';
  var SH = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var FL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  var CHORD_ROOT = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']; // how players name chords
  function mod(a, n) { return ((a % n) + n) % n; }
  function parseNote(s) {
    if (typeof s === 'number') return s;
    var m = /^([A-G])(##|bb|#|b)?(-?\d)$/.exec(String(s).trim());
    if (!m) return null;
    var a = { '#': 1, '##': 2, b: -1, bb: -2 }[m[2]] || 0;
    return (+m[3] + 1) * 12 + PC[m[1]] + a;
  }
  function noteName(m, flat) { return (flat ? FL : SH)[mod(m, 12)] + (Math.floor(m / 12) - 1); }
  function pcName(pc, flat) { return (flat ? FL : SH)[mod(pc, 12)]; }
  function freq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function pretty(s) { return String(s).replace(/#/g, '♯').replace(/([A-G])b/g, '$1♭'); }

  /* ================= instruments ================= */
  var INSTRUMENTS = {
    guitar: {
      id: 'guitar', name: 'Guitar', strings: 6, frets: 20, scale: 645, transpose: 12, tuning: 'standard',
      voices: { steel: 'Steel-string', nylon: 'Nylon-string (classical)' }, voice: 'steel',
      tunings: {
        standard: { name: 'Standard (E A D G B E)', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
        dropd: { name: 'Drop D (D A D G B E)', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
        openg: { name: 'Open G (D G D G B D)', notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
        opend: { name: 'Open D (D A D F♯ A D)', notes: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'] }
      },
      minStrings: 4, bassRoot: true, mutes: 'bass'
    },
    ukulele: {
      id: 'ukulele', name: 'Ukulele', strings: 4, frets: 15, scale: 380, transpose: 0, tuning: 'standard',
      sizes: { soprano: { name: 'Soprano', scale: 330, frets: 12 }, concert: { name: 'Concert', scale: 380, frets: 15 },
        tenor: { name: 'Tenor', scale: 430, frets: 18 }, baritone: { name: 'Baritone', scale: 480, frets: 18 } },
      tunings: {
        standard: { name: 'Standard, high G (G C E A)', notes: ['G4', 'C4', 'E4', 'A4'] },
        lowg: { name: 'Low G (G C E A)', notes: ['G3', 'C4', 'E4', 'A4'] },
        baritone: { name: 'Baritone (D G B E)', notes: ['D3', 'G3', 'B3', 'E4'] }
      },
      minStrings: 4, bassRoot: false, mutes: 'none'
    },
    banjo: {
      id: 'banjo', name: 'Banjo', strings: 5, frets: 22, scale: 667, transpose: 12, tuning: 'openg',
      short: { string: 5, at: 5 },
      tunings: {
        openg: { name: 'Open G (g D G B D)', notes: ['G4', 'D3', 'G3', 'B3', 'D4'] },
        doublec: { name: 'Double C (g C G C D)', notes: ['G4', 'C3', 'G3', 'C4', 'D4'] },
        opend: { name: 'Open D (f♯ D F♯ A D)', notes: ['F#4', 'D3', 'F#3', 'A3', 'D4'] }
      },
      minStrings: 4, bassRoot: false, mutes: 'none'
    }
  };
  function instrument(id) { var I = INSTRUMENTS[id]; if (!I) throw new Error('fret: unknown instrument "' + id + '" (guitar, ukulele, banjo)'); return I; }
  function tuning(instId, tid) {
    var I = instrument(instId), id = tid || I.tuning, T = I.tunings[id];
    if (!T) return null;
    return { id: id, name: T.name, notes: T.notes.slice(), midi: T.notes.map(parseNote) };
  }
  function isShort(I, s) { return !!(I.short && I.short.string === s); }
  // sounding pitch of string s (1-based) at fret f; null if that fret doesn't exist on that string
  function stringMidi(instId, tid, s, f, capo) {
    var I = instrument(instId), T = tuning(instId, tid), i = I.strings - s;
    if (!T || i < 0 || i >= I.strings || f == null || f < 0) return null;
    capo = capo || 0;
    if (isShort(I, s)) {
      if (f === 0) return T.midi[i] + capo;
      if (f <= I.short.at || f > I.frets) return null;
      return T.midi[i] + capo + (f - I.short.at);
    }
    if (f > I.frets) return null;
    return T.midi[i] + capo + f;
  }

  /* ================= chords ================= */
  // each tone: [semitones above the root, degree (for spelling by letter), required]
  var QUALITIES = {
    '': { long: 'major', tones: [[0, 1, 1], [4, 3, 1], [7, 5, 0]] },
    m: { long: 'minor', tones: [[0, 1, 1], [3, 3, 1], [7, 5, 0]] },
    '7': { long: 'seventh (dominant 7th)', tones: [[0, 1, 1], [4, 3, 1], [7, 5, 0], [10, 7, 1]] },
    maj7: { long: 'major seventh', tones: [[0, 1, 1], [4, 3, 1], [7, 5, 0], [11, 7, 1]] },
    m7: { long: 'minor seventh', tones: [[0, 1, 1], [3, 3, 1], [7, 5, 0], [10, 7, 1]] },
    sus2: { long: 'suspended 2nd', tones: [[0, 1, 1], [2, 2, 1], [7, 5, 1]] },
    sus4: { long: 'suspended 4th', tones: [[0, 1, 1], [5, 4, 1], [7, 5, 1]] },
    add9: { long: 'add 9', tones: [[0, 1, 1], [4, 3, 1], [7, 5, 0], [14, 9, 1]] },
    dim: { long: 'diminished', tones: [[0, 1, 1], [3, 3, 1], [6, 5, 1]] },
    dim7: { long: 'diminished seventh', tones: [[0, 1, 1], [3, 3, 1], [6, 5, 1], [9, 7, 1]] },
    m7b5: { long: 'half-diminished (minor 7 flat 5)', tones: [[0, 1, 1], [3, 3, 1], [6, 5, 1], [10, 7, 1]] },
    aug: { long: 'augmented', tones: [[0, 1, 1], [4, 3, 1], [8, 5, 1]] },
    '6': { long: 'sixth', tones: [[0, 1, 1], [4, 3, 1], [7, 5, 0], [9, 6, 1]] },
    m6: { long: 'minor sixth', tones: [[0, 1, 1], [3, 3, 1], [7, 5, 0], [9, 6, 1]] },
    '9': { long: 'ninth', tones: [[0, 1, 1], [4, 3, 1], [7, 5, 0], [10, 7, 1], [14, 9, 1]] },
    m9: { long: 'minor ninth', tones: [[0, 1, 1], [3, 3, 1], [7, 5, 0], [10, 7, 1], [14, 9, 1]] },
    '7sus4': { long: 'seventh, suspended 4th', tones: [[0, 1, 1], [5, 4, 1], [7, 5, 0], [10, 7, 1]] },
    '5': { long: 'power chord (root and 5th)', tones: [[0, 1, 1], [7, 5, 1]] }
  };
  var ALIAS = { '': '', M: '', maj: '', major: '', m: 'm', min: 'm', '-': 'm', minor: 'm', '7': '7', dom7: '7',
    maj7: 'maj7', M7: 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7', ma7: 'maj7', m7: 'm7', min7: 'm7', '-7': 'm7',
    sus2: 'sus2', sus4: 'sus4', sus: 'sus4', add9: 'add9', add2: 'add9', dim: 'dim', '°': 'dim', o: 'dim',
    dim7: 'dim7', '°7': 'dim7', o7: 'dim7', m7b5: 'm7b5', 'ø': 'm7b5', 'ø7': 'm7b5', 'm7♭5': 'm7b5',
    aug: 'aug', '+': 'aug', '6': '6', m6: 'm6', min6: 'm6', '9': '9', m9: 'm9', '7sus4': '7sus4', '7sus': '7sus4', '5': '5' };
  var QORDER = ['', 'm', '7', 'm7', 'maj7', '5', 'sus4', 'sus2', '6', 'm6', '7sus4', 'add9', '9', 'm9', 'dim', 'aug', 'dim7', 'm7b5'];

  function spellOne(rootLetter, rootPc, semis, degree) {
    var li = LET.indexOf(rootLetter), L = LET.charAt((li + degree - 1) % 7);
    var target = mod(rootPc + semis, 12), alt = mod(target - PC[L] + 6, 12) - 6;
    return L + (alt === 1 ? '#' : alt === 2 ? '##' : alt === -1 ? 'b' : alt === -2 ? 'bb' : '');
  }
  function spell(rootName, q) {
    var r = /^([A-G])(#|b)?$/.exec(rootName), Q = QUALITIES[q];
    if (!r || !Q) return null;
    var rpc = mod(PC[r[1]] + (r[2] === '#' ? 1 : r[2] === 'b' ? -1 : 0), 12);
    return Q.tones.map(function (t) { return spellOne(r[1], rpc, t[0], t[1]); });
  }
  function parseChord(sym) {
    if (sym && typeof sym === 'object') return sym;
    var s = String(sym || '').trim().replace(/♯/g, '#').replace(/♭/g, 'b');
    var m = /^([A-G])(#|b)?([^\/]*?)(?:\/([A-G])(#|b)?)?$/.exec(s);
    if (!m) return null;
    var q = ALIAS[m[3]];
    if (q === undefined) return null;
    var root = m[1] + (m[2] || ''), rootPc = mod(PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0), 12);
    var Q = QUALITIES[q], pcs = [], req = [], opt = [];
    Q.tones.forEach(function (t) { var p = mod(rootPc + t[0], 12); if (pcs.indexOf(p) < 0) pcs.push(p); (t[2] ? req : opt).push(p); });
    var bass = m[4] ? m[4] + (m[5] || '') : null, bassPc = bass ? mod(PC[m[4]] + (m[5] === '#' ? 1 : m[5] === 'b' ? -1 : 0), 12) : rootPc;
    if (bass && pcs.indexOf(bassPc) < 0) { pcs.push(bassPc); req.push(bassPc); }
    var name = root + q + (bass ? '/' + bass : '');
    return { root: root, rootPc: rootPc, quality: q, suffix: q, bass: bass, bassPc: bassPc, name: name,
      long: pretty(root) + ' ' + Q.long + (bass ? ' over ' + pretty(bass) : ''),
      notes: spell(root, q).concat(bass && Q.tones.every(function (t) { return mod(rootPc + t[0], 12) !== bassPc; }) ? [bass] : []),
      pcs: pcs, required: req, optional: opt, intervals: Q.tones.map(function (t) { return t[0]; }) };
  }

  /* ================= shapes and fingering ================= */
  function parseShape(txt, instId) {
    var I = instrument(instId), t = String(txt).trim(), parts;
    if (/[\s,.\-]/.test(t)) parts = t.split(/[\s,.\-]+/).filter(Boolean); else parts = t.split('');
    var fr = parts.map(function (p) { return /^[xX]$/.test(p) ? -1 : /^\d+$/.test(p) ? +p : NaN; });
    if (I.short && fr.length === I.strings - 1) fr.unshift(0);
    if (fr.length !== I.strings || fr.some(function (f) { return isNaN(f); })) return null;
    return fr;
  }
  function shapeText(fr, instId) {
    var I = instId ? INSTRUMENTS[instId] : null;
    if (I && I.short && fr.length === I.strings && fr[0] === 0) fr = fr.slice(1); // banjo: the open 5th string goes without saying
    var big = fr.some(function (f) { return f >= 10; });
    return fr.map(function (f) { return f < 0 ? 'x' : String(f); }).join(big ? ' ' : '');
  }
  function shapePitches(fr, instId, tid, capo) {
    var I = instrument(instId), out = [];
    fr.forEach(function (f, i) { var s = I.strings - i; if (f < 0) return; var m = stringMidi(instId, tid, s, f, capo); if (m != null) out.push({ s: s, fret: f, midi: m }); });
    return out;
  }
  // the strings that take part in chords (the banjo's short 5th string is a drone, left open)
  function chordStrings(I) { var a = []; for (var s = I.strings; s >= 1; s--) if (!isShort(I, s)) a.push(s); return a; }

  function fingersFor(fr, instId) {
    var I = instrument(instId), n = I.strings;
    var notes = [];
    fr.forEach(function (f, i) { if (f > 0 && !(isShort(I, n - i) && f === 0)) notes.push({ i: i, f: f }); });
    var res = { fingers: fr.map(function () { return ''; }), barre: null, count: 0, ok: true };
    if (!notes.length) return res;
    var lo = Math.min.apply(null, notes.map(function (x) { return x.f; })), hi = Math.max.apply(null, notes.map(function (x) { return x.f; }));
    if (hi - lo > 4) { res.ok = false; }
    function assign(list, start, floor) { // list sorted by fret then bass->treble (i ascending)
      var prev = start, out = {};
      list.forEach(function (x) { var k = floor ? Math.max(prev + 1, x.f - lo + 1) : prev + 1; out[x.i] = k; prev = k; });
      return { map: out, max: prev };
    }
    var sorted = notes.slice().sort(function (a, b) { return a.f - b.f || a.i - b.i; });
    var A = assign(sorted, 0, true);
    if (A.max > 4) { var A2 = assign(sorted, 0, false); if (A2.max <= 4) A = A2; }
    if (A.max <= 4) {
      Object.keys(A.map).forEach(function (i) { res.fingers[i] = String(A.map[i]); });
      res.count = notes.length;
      if (hi - lo > 4) res.ok = false;
      return res;
    }
    // try a barre at the lowest fret
    var atLo = notes.filter(function (x) { return x.f === lo; }).map(function (x) { return x.i; });
    if (atLo.length >= 2) {
      var a = Math.min.apply(null, atLo), b = Math.max.apply(null, atLo), okB = true;
      for (var i = a; i <= b; i++) if (!(fr[i] >= lo)) okB = false;
      if (okB) {
        var rest = sorted.filter(function (x) { return !(x.f === lo && x.i >= a && x.i <= b); });
        var B = assign(rest, 1, false);
        if (B.max <= 4) {
          for (var j = a; j <= b; j++) if (fr[j] === lo) res.fingers[j] = '1';
          Object.keys(B.map).forEach(function (k) { res.fingers[k] = String(B.map[k]); });
          res.barre = { fret: lo, from: n - a, to: n - b };
          res.count = 1 + rest.length;
          if (hi - lo > 4) res.ok = false;
          return res;
        }
      }
    }
    res.ok = false;
    Object.keys(A.map).forEach(function (i) { res.fingers[i] = String(Math.min(4, A.map[i])); });
    res.count = notes.length;
    return res;
  }

  // the standard first-position shapes: [name, frets, fingers ('-' = none, T = thumb), (barre "fret:from-to")]
  var TABLE = {
    guitar: { standard: [
      ['C', 'x32010', '-32-1-'], ['D', 'xx0232', '---132'], ['E', '022100', '-231--'], ['F', '133211', '134211', '1:6-1'],
      ['F', 'xx3211', '--3211', '1:2-1'], ['G', '320003', '21---3'], ['G', '320033', '32--34'], ['A', 'x02220', '--123-'],
      ['B', 'x24442', '-12341', '2:5-1'], ['Am', 'x02210', '--231-'], ['Bm', 'x24432', '-13421', '2:5-1'],
      ['Cm', 'x35543', '-13421', '3:5-1'], ['Dm', 'xx0231', '---231'], ['Em', '022000', '-23---'], ['Fm', '133111', '134111', '1:6-1'],
      ['F#m', '244222', '134111', '2:6-1'], ['Gm', '355333', '134111', '3:6-1'],
      ['A7', 'x02020', '--2-3-'], ['B7', 'x21202', '-213-4'], ['C7', 'x32310', '-3241-'], ['D7', 'xx0212', '---213'],
      ['E7', '020100', '-2-1--'], ['F7', '131211', '131211', '1:6-1'], ['G7', '320001', '32---1'],
      ['Am7', 'x02010', '--2-1-'], ['Dm7', 'xx0211', '---211', '1:2-1'], ['Em7', '022030', '-12-3-'], ['Em7', '020000', '-2----'],
      ['Cmaj7', 'x32000', '-32---'], ['Fmaj7', 'xx3210', '--321-'], ['Gmaj7', '320002', '32---1'], ['Amaj7', 'x02120', '--213-'],
      ['Dmaj7', 'xx0222', '---123'], ['Dsus2', 'xx0230', '---13-'], ['Dsus4', 'xx0233', '---134'], ['Asus2', 'x02200', '--12--'],
      ['Asus4', 'x02230', '--123-'], ['Esus4', '022200', '-234--'], ['Cadd9', 'x32030', '-21-3-'],
      ['A7sus4', 'x02030', '--2-3-'], ['E7sus4', '020200', '-2-3--'], ['G6', '320000', '21----'], ['C6', 'x32210', '-4231-'],
      ['Am6', 'x02212', '--2314'], ['Dm6', 'xx0201', '---2-1'], ['E9', '020102', '-2-1-3'], ['Bdim', 'x2343x', '-1243-'],
      ['Caug', 'x32110', '-4312-'], ['E5', '022xxx', '-12---'], ['A5', 'x022xx', '--12--'], ['D/F#', '200232', 'T--132'],
      ['G/B', 'x20003', '-1---3'], ['C/G', '332010', '432-1-']
    ] },
    ukulele: { standard: [
      ['C', '0003', '---3'], ['C7', '0001', '---1'], ['Cmaj7', '0002', '---2'], ['Cm', '0333', '-111', '3:3-1'],
      ['D', '2220', '123-'], ['Dm', '2210', '231-'], ['D7', '2223', '1112', '2:4-2'], ['D6', '2222', '1111', '2:4-1'],
      ['E7', '1202', '12-3'], ['Em', '0432', '-321'], ['E', '4442', '2341'], ['F', '2010', '2-1-'], ['F7', '2313', '2314'],
      ['G', '0232', '-132'], ['G7', '0212', '-213'], ['Gm', '0231', '-231'], ['Gmaj7', '0222', '-123'],
      ['A', '2100', '21--'], ['A7', '0100', '-1--'], ['Am', '2000', '2---'], ['Am7', '0000', '----'],
      ['Bb', '3211', '3211', '1:2-1'], ['B7', '2322', '1211', '2:4-1'], ['Bm', '4222', '3111', '2:3-1'],
      ['Dm7', '2213', '2314'], ['Em7', '0202', '-1-2'], ['Csus4', '0013', '--13'], ['Asus4', '2200', '12--'],
      ['Cadd9', '0203', '-1-3'], ['Caug', '1003', '1--4'], ['C6', '0000', '----'], ['G6', '0202', '-1-2']
    ] },
    banjo: { openg: [
      ['G', '0000', '----'], ['C', '2012', '2-13'], ['D', '0234', '-123'], ['D7', '0214', '-214'], ['Em', '2002', '1--2'],
      ['Am', '2212', '2314'], ['A', '2222', '1111', '2:4-1'], ['F', '3213', '3214'], ['G7', '0003', '---3'],
      ['C7', '2312', '2413'], ['Dm', '0233', '-123'], ['E', '2102', '21-3'], ['Bm', '4434', '2314'], ['B7', '1201', '13-2'],
      ['Em7', '0002', '---2']
    ] }
  };
  function tableShape(row, instId) {
    var fr = parseShape(row[1], instId);
    var I = instrument(instId);
    var fingers = String(row[2]).split('').map(function (c) { return c === '-' ? '' : c; });
    if (I.short && fingers.length === I.strings - 1) fingers.unshift('');
    var barre = null;
    if (row[3]) { var b = /^(\d+):(\d+)-(\d+)$/.exec(row[3]); barre = { fret: +b[1], from: +b[2], to: +b[3] }; }
    return { frets: fr, fingers: fingers, barre: barre, common: true };
  }
  var tableCache = {};
  function commonShapes(instId, tid) {
    var I = instrument(instId); tid = tid || I.tuning;
    var k = instId + '/' + tid;
    if (tableCache[k]) return tableCache[k];
    var own = (TABLE[instId] || {})[tid] || [], out = {}, seen = {};
    own.forEach(function (r) { (out[r[0]] = out[r[0]] || []).push(tableShape(r, instId)); seen[r[0] + '|' + r[1]] = 1; });
    // other tunings (low-G ukulele, drop D, double C…): the standard table's shapes that still spell their chord there
    // (and, on the guitar, still have the root or slash bass lowest) come first too
    var base = (TABLE[instId] || {})[I.tuning] || [];
    if (tid !== I.tuning) base.forEach(function (r) {
      if (seen[r[0] + '|' + r[1]]) return;
      var v = tableShape(r, instId), ch = parseChord(r[0]), f = chordCheck(v.frets, ch, instId, tid, 0);
      if (!f || (I.bassRoot && f.bassPc !== ch.bassPc)) return;
      (out[r[0]] = out[r[0]] || []).push(v);
    });
    return (tableCache[k] = out);
  }

  /* ================= the voicing finder ================= */
  function chordCheck(fr, chord, instId, tid, capo) {
    // returns null when the shape does not spell the chord; otherwise facts about it
    var P = shapePitches(fr, instId, tid, capo), I = instrument(instId);
    var core = P.filter(function (p) { return !isShort(I, p.s); });
    if (!core.length) return null;
    var have = {};
    for (var i = 0; i < core.length; i++) { var pc = mod(core[i].midi, 12); if (chord.pcs.indexOf(pc) < 0) return null; have[pc] = 1; }
    for (var j = 0; j < chord.required.length; j++) if (!have[chord.required[j]]) return null;
    var low = core.reduce(function (a, b) { return b.midi < a.midi ? b : a; });
    return { pitches: P, sounding: core.length, bassPc: mod(low.midi, 12), missingOpt: chord.optional.filter(function (p) { return !have[p]; }).length };
  }
  function scoreVoicing(fr, chord, facts, F, I) {
    var fretted = fr.filter(function (f) { return f > 0; }), lo = fretted.length ? Math.min.apply(null, fretted) : 0, hi = fretted.length ? Math.max.apply(null, fretted) : 0;
    var muted = fr.filter(function (f) { return f < 0; }).length, open = fr.filter(function (f, i) { return f === 0 && !isShort(I, I.strings - i); }).length;
    var sc = lo * 1.0 + muted * 1.2 + (hi - lo >= 4 ? 3 : hi - lo === 3 && lo < 5 ? 0.8 : 0) + F.count * 0.4 + (F.barre ? 1.5 : 0) - open * 0.35 + facts.missingOpt * 0.6;
    if (I.bassRoot) sc += (I.strings - facts.sounding) * 0.4;
    else if (facts.bassPc !== chord.bassPc) sc += 0.3;
    return sc;
  }
  function findVoicings(chord, instId, tid, opts) {
    opts = opts || {};
    chord = parseChord(chord);
    if (!chord) return [];
    var I = instrument(instId); tid = tid || I.tuning;
    var T = tuning(instId, tid);
    if (!T) return [];
    var capo = opts.capo || 0, maxFret = Math.min(opts.maxFret == null ? 12 : opts.maxFret, I.frets - 1), span = opts.span || 4;
    var strs = chordStrings(I), seen = {}, out = [];
    var power = chord.quality === '5';
    var minStr = power ? 2 : Math.min(I.minStrings, strs.length);
    var idxOf = function (s) { return I.strings - s; };
    for (var base = 0; base <= maxFret; base++) {
      var w0 = Math.max(1, base), w1 = base + span; // inclusive window w0..w1 (span+1 frets with the stretch)
      var opts2 = strs.map(function (s) {
        var o = [], open = stringMidi(instId, tid, s, 0, capo);
        if (I.mutes !== 'none' || power) o.push(-1);
        if (chord.pcs.indexOf(mod(open, 12)) >= 0) o.push(0);
        for (var f = w0; f <= w1 && f <= I.frets; f++) if (chord.pcs.indexOf(mod(open + f, 12)) >= 0) o.push(f);
        return o;
      });
      var cur = new Array(strs.length);
      (function rec(k) {
        if (k === strs.length) {
          var fr = new Array(I.strings);
          for (var q = 0; q < I.strings; q++) fr[q] = 0;
          strs.forEach(function (s, j) { fr[idxOf(s)] = cur[j]; });
          var key = fr.join(',');
          if (seen[key]) return;
          var fretted = cur.filter(function (f) { return f > 0; });
          if (fretted.length && Math.min.apply(null, fretted) !== base && base > 0) return; // counted from its own lowest fret
          if (!fretted.length && base > 0) return;
          var sounding = cur.filter(function (f) { return f >= 0; }).length;
          if (sounding < minStr) return;
          // mutes: guitar only from the bass side (power chords: also from the treble side), one inner mute allowed
          var inner = 0, trebleMute = 0;
          if (cur.some(function (f) { return f < 0; })) {
            var firstS = cur.findIndex(function (f) { return f >= 0; }), lastS = cur.length - 1 - cur.slice().reverse().findIndex(function (f) { return f >= 0; });
            for (var z = firstS; z <= lastS; z++) if (cur[z] < 0) inner++;
            if (inner > 1) return;
            // the first string may be left out (x2343x) when four other strings sound; anything more only for power chords
            if (!power && lastS < cur.length - 2) return;
            if (!power && lastS === cur.length - 2) { if (inner || sounding < 4) return; trebleMute = 1; }
            if (inner && (power || fretted.length > 3)) return;
          }
          var facts = chordCheck(fr, chord, instId, tid, capo);
          if (!facts) return;
          if (I.bassRoot && facts.bassPc !== chord.bassPc) return;
          var hi = fretted.length ? Math.max.apply(null, fretted) : 0, lo = fretted.length ? Math.min.apply(null, fretted) : 0;
          if (hi - lo > span) return;
          var F = fingersFor(fr, instId);
          if (!F.ok) return;
          seen[key] = 1;
          var sc = scoreVoicing(fr, chord, facts, F, I) + inner * 3 + trebleMute * 2.5;
          out.push({ frets: fr, fingers: F.fingers, barre: F.barre, common: false, minFret: lo, base: hi <= 4 ? 1 : lo, pitches: facts.pitches, score: sc, name: chord.name });
          return;
        }
        for (var t = 0; t < opts2[k].length; t++) { cur[k] = opts2[k][t]; rec(k + 1); }
      })(0);
    }
    out.sort(function (a, b) { return a.score - b.score; });
    if (opts.limit !== 0) out = out.slice(0, opts.limit || 40);
    return out;
  }
  function decorate(v, instId, tid, capo, chord) {
    var fretted = v.frets.filter(function (f) { return f > 0; });
    var I = instrument(instId);
    var core = v.frets.filter(function (f, i) { return f > 0 && !isShort(I, I.strings - i); });
    v.minFret = core.length ? Math.min.apply(null, core) : 0;
    var hi = core.length ? Math.max.apply(null, core) : 0;
    v.base = hi <= 4 ? 1 : v.minFret;
    v.pitches = shapePitches(v.frets, instId, tid, capo);
    v.name = chord ? chord.name : v.name;
    return v;
  }
  function shapesFor(chord, instId, tid, opts) {
    chord = parseChord(chord);
    if (!chord) return [];
    var I = instrument(instId); tid = tid || I.tuning;
    var tab = commonShapes(instId, tid)[chord.name] || [];
    var res = tab.map(function (v) { return decorate({ frets: v.frets.slice(), fingers: v.fingers.slice(), barre: v.barre, common: true, score: -100 }, instId, tid, 0, chord); });
    var keys = {};
    res.forEach(function (v) { keys[v.frets.join(',')] = 1; });
    findVoicings(chord, instId, tid, opts).forEach(function (v) { if (!keys[v.frets.join(',')]) res.push(v); });
    return res;
  }

  /* ================= naming a chord (reverse lookup) ================= */
  function nameChord(pitches, instId, tid, opts) {
    var ms = pitches, useBass = true;
    if (instId && typeof instId === 'object') { opts = instId; instId = null; }
    opts = opts || {};
    if (instId) { // frets given
      var I = instrument(instId);
      useBass = !!I.bassRoot;
      ms = shapePitches(pitches, instId, tid).filter(function (p) { return !isShort(I, p.s); }).map(function (p) { return p.midi; });
    }
    ms = (ms || []).filter(function (m) { return m != null; }).slice().sort(function (a, b) { return a - b; });
    if (!ms.length) return [];
    var set = {}; ms.forEach(function (m) { set[mod(m, 12)] = 1; });
    if (opts.bass === false) useBass = false;
    var pcs = Object.keys(set).map(Number), bass = mod(ms[0], 12), out = [];
    for (var r = 0; r < 12; r++) {
      QORDER.forEach(function (q, qi) {
        var Q = QUALITIES[q], all = {}, req = {};
        Q.tones.forEach(function (t) { var p = mod(r + t[0], 12); all[p] = 1; if (t[2]) req[p] = 1; });
        var extra = pcs.filter(function (p) { return !all[p]; });
        var slashBass = useBass && extra.length === 1 && extra[0] === bass && bass !== r;
        if (extra.length && !slashBass) return;
        if (!Object.keys(req).every(function (p) { return set[p]; })) return;
        if (!set[r]) return;
        if (q === '5' && pcs.length > 2) return;
        var missing = Q.tones.filter(function (t) { return !set[mod(r + t[0], 12)]; }).length;
        var sc = qi * 0.25 + missing * 0.5 + (!useBass || bass === r ? 0 : 2.5) + (slashBass ? 1 : 0);
        var sl = useBass && bass !== r;
        var name = CHORD_ROOT[r] + q + (sl ? '/' + CHORD_ROOT[bass] : '');
        out.push({ name: name, root: CHORD_ROOT[r], quality: q, bass: sl ? CHORD_ROOT[bass] : null, score: sc, long: parseChord(name) ? parseChord(name).long : name });
      });
    }
    out.sort(function (a, b) { return a.score - b.score; });
    var seenN = {};
    return out.filter(function (o) { if (seenN[o.name]) return false; seenN[o.name] = 1; return true; });
  }

  /* ================= scales (for fretboard pictures) ================= */
  var SCALES = {
    major: { name: 'Major', steps: [0, 2, 4, 5, 7, 9, 11], labels: ['R', '2', '3', '4', '5', '6', '7'] },
    minor: { name: 'Natural minor', steps: [0, 2, 3, 5, 7, 8, 10], labels: ['R', '2', '♭3', '4', '5', '♭6', '♭7'] },
    pentMajor: { name: 'Major pentatonic', steps: [0, 2, 4, 7, 9], labels: ['R', '2', '3', '5', '6'] },
    pentMinor: { name: 'Minor pentatonic', steps: [0, 3, 5, 7, 10], labels: ['R', '♭3', '4', '5', '♭7'] },
    blues: { name: 'Blues', steps: [0, 3, 5, 6, 7, 10], labels: ['R', '♭3', '4', '♭5', '5', '♭7'] },
    mixolydian: { name: 'Mixolydian', steps: [0, 2, 4, 5, 7, 9, 10], labels: ['R', '2', '3', '4', '5', '6', '♭7'] },
    dorian: { name: 'Dorian', steps: [0, 2, 3, 5, 7, 9, 10], labels: ['R', '2', '♭3', '4', '5', '6', '♭7'] },
    harmonicMinor: { name: 'Harmonic minor', steps: [0, 2, 3, 5, 7, 8, 11], labels: ['R', '2', '♭3', '4', '5', '♭6', '7'] },
    chromatic: { name: 'Chromatic', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], labels: ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'] }
  };

  /* ================= right-hand patterns ================= */
  var PATTERNS = {
    down4: { name: 'Four down strums', instruments: ['guitar', 'ukulele'], time: '4/4', text: 'D/4 D/4 D/4 D/4', about: 'One down strum on every beat. The place to start.' },
    downup: { name: 'Down-up eighths', instruments: ['guitar', 'ukulele'], time: '4/4', text: 'D/8 U/8 D/8 U/8 D/8 U/8 D/8 U/8', about: 'Down on the beat, up on the "and". The hand never stops moving.' },
    folk: { name: 'Folk strum (D, D-U, U-D-U)', instruments: ['guitar', 'ukulele'], time: '4/4', text: 'D/4 D/8 U/8 -/8 U/8 D/8 U/8', about: 'The most-used strum of all. On beat 3 the hand still moves down but misses the strings.' },
    island: { name: 'Island strum', instruments: ['ukulele', 'guitar'], time: '4/4', text: 'D/4 D/8 U/8 -/8 U/8 D/8 U/8', about: 'The ukulele\'s easygoing strum: down, down-up, (miss), up-down-up.' },
    chunk: { name: 'Chunk (muted strum)', instruments: ['ukulele', 'guitar'], time: '4/4', text: 'D/8 U/8 X>/8 U/8 D/8 U/8 X>/8 U/8', about: 'The X is a "chunk": strum with the hand resting on the strings to mute them, on beats 2 and 4.' },
    waltz: { name: 'Waltz (bass, strum, strum)', instruments: ['guitar', 'ukulele'], time: '3/4', text: 'B/4 D/4 D/4', about: 'For songs in 3/4: a bass note on beat 1, then two light strums.' },
    waltzdu: { name: 'Waltz with up strums', instruments: ['guitar', 'ukulele'], time: '3/4', text: 'D/4 D/8 U/8 D/8 U/8', about: 'A busier 3/4 strum.' },
    boomchuck: { name: 'Boom-chuck (alternating bass)', instruments: ['guitar'], time: '4/4', text: 'B/4 D/4 B2/4 D/4', about: 'Bass note, strum, other bass note, strum. Country and cowboy songs.' },
    boomchuck24: { name: 'Boom-chuck in 2/4', instruments: ['guitar'], time: '2/4', text: 'B/4 D/4', about: 'Bass, strum, alternating bass every bar.' },
    travis: { name: 'Travis picking', instruments: ['guitar'], time: '4/4', text: 'B/8 M1/8 B2/8 I2/8 B/8 M1/8 B2/8 I2/8', about: 'The thumb keeps a steady alternating bass on every beat; the fingers pick between.' },
    pima: { name: 'Arpeggio p-i-m-a', instruments: ['guitar'], time: '4/4', text: 'p/8 i3/8 m2/8 a1/8 m2/8 i3/8 m2/8 i3/8', about: 'Classical fingers: thumb (p) on the bass, then index (i), middle (m), ring (a).' },
    pima34: { name: 'Arpeggio in 3/4', instruments: ['guitar'], time: '3/4', text: 'p/8 i3/8 m2/8 a1/8 m2/8 i3/8', about: 'A flowing 3/4 arpeggio, as in many classical studies.' },
    blues: { name: 'Blues shuffle strum', instruments: ['guitar'], time: '4/4', text: 'D/8 U/8 D/8 U/8 D/8 U/8 D/8 U/8', swing: true, about: 'Down-up eighths played long-short (swung).' },
    forward: { name: 'Forward roll', instruments: ['banjo'], time: '4/4', text: 'T3/8 I2/8 M1/8 T5/8 I2/8 M1/8 T5/8 M1/8', about: 'Thumb, index, middle, again and again: T I M T I M T M.' },
    backward: { name: 'Backward roll', instruments: ['banjo'], time: '4/4', text: 'M1/8 I2/8 T3/8 M1/8 I2/8 T3/8 M1/8 I2/8', about: 'The same three fingers the other way: M I T.' },
    forwardreverse: { name: 'Forward-reverse roll', instruments: ['banjo'], time: '4/4', text: 'T3/8 I2/8 M1/8 T5/8 M1/8 I2/8 T3/8 M1/8', about: 'Forward for half a bar, then back: T I M T M I T M.' },
    alternating: { name: 'Alternating thumb roll', instruments: ['banjo'], time: '4/4', text: 'T3/8 I2/8 T5/8 M1/8 T4/8 I2/8 T5/8 M1/8', about: 'The thumb plays every other note: T I T M T I T M.' },
    pinch: { name: 'Pinches', instruments: ['banjo'], time: '4/4', text: '[T5 M1]/4 [T4 I2]/4 [T5 M1]/4 [T3 I2]/4', about: 'Thumb and a finger together, like a pinch.' },
    bumditty: { name: 'Clawhammer bum-ditty', instruments: ['banjo'], time: '4/4', text: 'S1/4 D/8 T5/8 S1/4 D/8 T5/8', about: 'Strike a string with the nail (bum), brush down across the strings (dit), catch the 5th string with the thumb (ty).' },
    bumditty24: { name: 'Clawhammer bum-ditty in 2/4', instruments: ['banjo'], time: '2/4', text: 'S1/4 D/8 T5/8', about: 'One bum-ditty per bar of 2/4.' }
  };
  var DURS = { 1: 4 * TPQ, 2: 2 * TPQ, 4: TPQ, 8: TPQ / 2, 16: TPQ / 4, 32: TPQ / 8 };
  function durOf(base, dots) { var d = DURS[base]; if (!d) return null; return dots === 2 ? d * 7 / 4 : dots === 1 ? d * 3 / 2 : d; }
  // one stroke token (without duration) -> stroke fields; throws a message
  function parseStroke(w, I) {
    var acc = false;
    if (/>$/.test(w)) { acc = true; w = w.slice(0, -1); }
    var st = { accent: acc, strings: [], finger: '' };
    if (w === '-' ) { st.kind = 'miss'; return st; }
    if (w === 'r') { st.kind = 'rest'; return st; }
    if (w === 'D' || w === 'U' || w === 'X') { st.kind = w === 'D' ? 'down' : w === 'U' ? 'up' : 'mute'; return st; }
    var m;
    if ((m = /^(?:D|U)(\d)-(\d)$/.exec(w))) { st.kind = w.charAt(0) === 'D' ? 'down' : 'up'; st.range = [+m[1], +m[2]]; return st; }
    if ((m = /^B([12])?$/.exec(w))) { st.kind = 'bass'; st.bass = +(m[1] || 1); st.finger = 'T'; return st; }
    if (w === 'p') { st.kind = 'bass'; st.bass = 1; st.finger = 'p'; return st; }
    if ((m = /^(T|I|M|p|i|m|a|S|d|u)(\d)$/.exec(w))) {
      var s = +m[2];
      if (I && (s < 1 || s > I.strings)) throw 'plays string ' + s + ', but the ' + I.name.toLowerCase() + ' has ' + I.strings + ' strings';
      st.kind = 'pluck'; st.finger = m[1]; st.strings = [s]; return st;
    }
    throw 'is not a stroke (D U X down/up/muted strum, B B2 bass, T3 I2 M1 p i3 m2 a1 S1 d3 u3 finger+string, - miss, r rest)';
  }
  function parsePattern(text, opts) {
    opts = opts || {};
    var I = opts.instrument ? instrument(opts.instrument) : null, errors = [];
    var src = String(text || '').trim();
    if (PATTERNS[src]) src = PATTERNS[src].text;
    var bars = [], swing = false;
    src.split('|').forEach(function (b, bi) {
      b = b.trim();
      if (!b) { if (bi < src.split('|').length - 1) errors.push({ msg: 'an empty bar in the pattern', bar: bi }); return; }
      if (b === '%') { bars.push(bars.length ? bars[bars.length - 1] : []); return; }
      if (b === 'R') { bars.push([]); bars[bars.length - 1].silent = true; return; }
      var toks = b.match(/\[[^\]]*\][^\s]*|\S+/g) || [], t = 0, out = [];
      toks.forEach(function (tok) {
        var m = /^(\[[^\]]*\]|[^\/\s]+)\/(\d+)(\.{0,2})$/.exec(tok);
        if (!m) { errors.push({ msg: '"' + tok + '" needs a duration, like D/4 or T3/8', bar: bi, token: tok }); return; }
        var d = durOf(+m[2], m[3].length);
        if (!d) { errors.push({ msg: '"' + tok + '" has a duration that is not /1 /2 /4 /8 /16 /32', bar: bi, token: tok }); return; }
        var st;
        try {
          if (m[1].charAt(0) === '[') {
            var parts = m[1].slice(1, -1).trim().split(/\s+/).map(function (w) { return parseStroke(w, I); });
            if (parts.some(function (p) { return p.kind !== 'pluck' && p.kind !== 'bass'; })) throw 'mixes strums into a pinch: only finger+string or bass notes go inside [ ]';
            st = { kind: 'pinch', parts: parts, accent: false, strings: [], finger: parts.map(function (p) { return p.finger; }).join('+') };
          } else st = parseStroke(m[1], I);
        } catch (msg) { errors.push({ msg: '"' + tok + '" ' + msg, bar: bi, token: tok }); return; }
        st.t = t; st.dur = d; st.tok = tok;
        out.push(st); t += d;
      });
      out.len = t;
      bars.push(out);
    });
    return { bars: bars, errors: errors, swing: swing };
  }

  /* ================= chord lines ================= */
  function parseChordLine(text, model) {
    var errors = [], bars = [];
    var parts = String(text || '').split('|');
    while (parts.length && parts[parts.length - 1].trim() === '') parts.pop();
    var prevBar = null;
    parts.forEach(function (b, mi) {
      var M = model && model.measures[mi], len = M ? M.len : 4 * TPQ, bar = M ? M.bar : mi + 1;
      var toks = b.trim().split(/\s+/).filter(Boolean);
      if (toks.length === 1 && toks[0] === '%') { if (!prevBar) errors.push({ msg: '% (same as the bar before) in the first bar', bar: bar }); bars.push((prevBar || []).map(function (c) { return Object.assign({}, c); })); prevBar = bars[bars.length - 1]; return; }
      if (!toks.length) { errors.push({ msg: 'an empty bar in chords (write NC for no chord)', bar: bar }); bars.push([]); return; }
      var fixed = 0, free = 0, items = [];
      toks.forEach(function (tk) {
        var m = /^(.+?)(?::(\d+)(\.{0,2}))?$/.exec(tk), name = m[1], d = null;
        if (m[2]) { d = durOf(+m[2], m[3].length); if (!d) errors.push({ msg: 'chord "' + tk + '": the duration after : must be 1 2 4 8 16 (with dots)', bar: bar, token: tk }); }
        if (d) fixed += d; else free++;
        items.push({ name: name, d: d, tok: tk });
      });
      var rest = len - fixed;
      if (rest < 0 || (free && rest <= 0) || (!free && rest !== 0)) errors.push({ msg: 'the chords in this bar add up to ' + (fixed / TPQ) + ' quarter notes, but the bar holds ' + (len / TPQ), bar: bar });
      var each = free ? rest / free : 0;
      if (free && (Math.abs(each - Math.round(each)) > 1e-6 || Math.round(each) % (TPQ / 2) !== 0)) errors.push({ msg: 'the bar can\'t be shared evenly among ' + free + ' chords in whole eighth notes: give some of them a length, like G:4.', bar: bar });
      var t = 0, out = [];
      items.forEach(function (it) {
        var d = it.d || Math.round(each);
        if (it.name === '/') {
          if (out.length) out[out.length - 1].dur += d;
          else if (prevBar && prevBar.length) out.push({ name: prevBar[prevBar.length - 1].name, chord: prevBar[prevBar.length - 1].chord, start: t, dur: d, cont: true });
          else errors.push({ msg: '/ (keep the chord going) with no chord before it', bar: bar });
        } else if (it.name === 'NC' || it.name === 'N.C.') out.push({ name: 'NC', chord: null, start: t, dur: d });
        else {
          var c = parseChord(it.name);
          if (!c) errors.push({ msg: '"' + it.name + '" is not a chord name the kit knows (examples: G, Am, D7, Cmaj7, Fsus4, G/B, E5)', bar: bar, token: it.tok });
          out.push({ name: it.name, chord: c, start: t, dur: d });
        }
        t += d;
      });
      bars.push(out); prevBar = out;
    });
    return { bars: bars, errors: errors };
  }

  /* ================= positions for notes written as pitches ================= */
  function assignPosition(midi, instId, tid, capo, P, onString) {
    var I = instrument(instId), best = null, bestIn = null;
    for (var s = I.strings; s >= 1; s--) {
      if (onString && s !== onString) continue;
      for (var f = 0; f <= I.frets; f++) {
        if (stringMidi(instId, tid, s, f, capo) !== midi) continue;
        var inside = f === 0 || (f >= (P || 0) && f <= (P || 0) + 4);
        var c = { s: s, fret: f };
        if (inside && (!bestIn || f < bestIn.fret)) bestIn = c;
        if (!best || f < best.fret) best = c;
      }
    }
    return bestIn || best;
  }
  function assignChord(midis, instId, tid, capo, P, forced) {
    // one string each, smallest stretch, then lowest frets; forced[k] = string number or 0
    var I = instrument(instId), cands = midis.map(function (m, k) {
      var c = [];
      for (var s = I.strings; s >= 1; s--) {
        if (forced && forced[k] && forced[k] !== s) continue;
        for (var f = 0; f <= I.frets; f++) if (stringMidi(instId, tid, s, f, capo) === m) c.push({ s: s, fret: f });
      }
      return c;
    });
    var best = null, used = {}, cur = [];
    (function rec(k) {
      if (k === midis.length) {
        var fr = cur.filter(function (c) { return c.fret > 0; }).map(function (c) { return c.fret; });
        var span = fr.length ? Math.max.apply(null, fr) - Math.min.apply(null, fr) : 0;
        var out = cur.filter(function (c) { return c.fret > 0 && (c.fret < (P || 0) || c.fret > (P || 0) + 4); }).length;
        var cost = span * 10 + out * 4 + cur.reduce(function (a, c) { return a + c.fret; }, 0) * 0.1;
        if (!best || cost < best.cost) best = { cost: cost, list: cur.slice() };
        return;
      }
      cands[k].forEach(function (c) { if (used[c.s]) return; used[c.s] = 1; cur.push(c); rec(k + 1); cur.pop(); used[c.s] = 0; });
    })(0);
    return best ? best.list : null;
  }

  /* ================= the fretted song format ================= */
  var FRET_FIELDS = { instrument: 1, tuning: 1, capo: 1, voice: 1, style: 1, technique: 1, chords: 1, pattern: 1, shapes: 1,
    tab: 1, pick: 1, swing: 1, size: 1, draft: 1, position: 1, melody_of: 1, melody_octave: 1 };
  var PICKS = { T: 'thumb', I: 'index', M: 'middle', p: 'thumb (p)', i: 'index (i)', m: 'middle (m)', a: 'ring (a)', c: 'little finger (c)',
    d: 'pick down', u: 'pick up', S: 'strike (clawhammer)', D: 'brush down', U: 'brush up' };
  var TECH = { h: 'hammer-on', p: 'pull-off', s: 'slide', si: 'slide in', b: 'bend', bh: 'half bend', harm: 'harmonic', x: 'muted', acc: 'accent' };
  var HARM = { 12: 12, 7: 19, 19: 19, 5: 24, 24: 24, 4: 28, 9: 28, 16: 28 };

  function spellFor(midi, key) { // a MIDI number as a note name that fits the key signature
    var pc = mod(midi, 12), oct = Math.floor(midi / 12) - 1, alters = key ? key.alters : {};
    var L, a;
    for (var i = 0; i < 7; i++) { L = LET.charAt(i); a = alters[L] || 0; if (mod(PC[L] + a, 12) === pc) return L + (a === 1 ? '#' : a === -1 ? 'b' : '') + (Math.floor((midi - a) / 12) - 1); }
    var flat = key && key.fifths < 0;
    var nm = (flat ? FL : SH)[pc];
    return nm + (Math.floor((midi - (nm.length > 1 ? (nm.charAt(1) === '#' ? 1 : -1) : 0)) / 12) - 1);
  }

  function parseSong(input, opts) {
    opts = opts || {};
    if (!S) throw new Error('fret.parseSong needs TRBMusic.song (song.js)');
    var doc, yamlErr = null;
    if (typeof input === 'string') { try { doc = S.parseYaml(input); } catch (e) { yamlErr = e.message; doc = {}; } }
    else doc = input || {};
    var errs = [], warns = [];
    function E(msg, bar, token) { errs.push({ msg: msg, staff: 'tab', bar: bar, token: token }); }
    function W(msg, bar, token) { warns.push({ msg: msg, staff: 'tab', bar: bar, token: token }); }
    var instId = doc.instrument || opts.instrument;
    if (!INSTRUMENTS[instId]) {
      var mm = S.parse({ key: 'C', time: '4/4', staves: { rh: 'R' } }, { loose: true });
      mm.errors = [{ msg: yamlErr || ('instrument "' + instId + '" must be guitar, ukulele or banjo') }];
      mm.ok = false; return mm;
    }
    var I = INSTRUMENTS[instId], tid = doc.tuning || I.tuning, T = tuning(instId, tid);
    if (!T) { E('tuning "' + doc.tuning + '" is not one of ' + Object.keys(I.tunings).join(', ') + ' for the ' + I.name.toLowerCase()); tid = I.tuning; T = tuning(instId, tid); }
    var capo = doc.capo == null ? 0 : +doc.capo;
    if (!(capo >= 0 && capo <= 9 && capo === Math.floor(capo))) { E('capo ' + doc.capo + ' should be a fret number from 0 (no capo) to 9'); capo = 0; }
    var key = S.keyInfo(doc.key || 'C') || S.keyInfo('C');
    var P0 = doc.position == null ? 0 : +doc.position;
    if (!opts.loose && doc.tab == null) E('missing "tab" (the notes, as string:fret like 3:2/4 or as pitches like G3/4)');
    if (doc.voice != null && !(I.voices && I.voices[doc.voice])) W('voice "' + doc.voice + '" is not one of ' + (I.voices ? Object.keys(I.voices).join(', ') : '(none for the ' + I.name.toLowerCase() + ')'));
    if (doc.size != null && !(I.sizes && I.sizes[doc.size])) W('size "' + doc.size + '" is not one of ' + (I.sizes ? Object.keys(I.sizes).join(', ') : '(none)'));

    // 1. tab tokens -> pitches (written an octave up for guitar and banjo), keeping string/fret per note
    var toks = S.tokenize(String(doc.tab || '')), outT = [], recs = {}, mi = 0, vi = 0, ii = 0, P = P0, barHasPos = false;
    toks.forEach(function (T0) {
      if (T0.t === '|') { mi++; vi = 0; ii = 0; outT.push('|'); return; }
      if (T0.t === '<<') { vi = 0; ii = 0; outT.push('<<'); return; }
      if (T0.t === '&') { vi++; ii = 0; outT.push('&'); return; }
      if (T0.t === '>>') { outT.push('>>'); return; }
      if (T0.t === '{') { outT.push(T0.raw); return; }
      if (T0.t === '}') { outT.push('}'); return; }
      var raw = T0.raw, m;
      if ((m = /^pos:(\d+)$/.exec(raw))) { P = +m[1]; return; }
      if (/^clef:/.test(raw)) { E('clef changes are not used in tab', mi, raw); return; }
      var flags = [], body = raw.replace(/!([A-Za-z0-9]+)/g, function (_, f) { flags.push(f); return ''; });
      var pre = '', post = '';
      if (body.charAt(0) === '(') { pre = '('; body = body.slice(1); }
      var mt;
      while ((mt = /(\)|~)$/.exec(body))) { post = mt[1] + post; body = body.slice(0, -1); }
      var dm = /^(\[[^\]]*\]|[^\/]+)(\/\d+\.{0,2})?$/.exec(body);
      if (!dm) { outT.push(raw); ii++; return; } // let song.js report it
      var head = dm[1], dur = dm[2] || '';
      if (head === 'r' || head === 'R') { outT.push(pre + head + dur + post); recs[mi + ':' + vi + ':' + ii] = { rest: true, flags: flags }; ii++; return; }
      var isChord = head.charAt(0) === '[', els = isChord ? head.slice(1, -1).trim().split(/\s+/) : [head];
      var notes = [], forced = [], pitchMidis = [], bad = false;
      els.forEach(function (el, k) {
        var tie = '';
        if (/~$/.test(el)) { tie = '~'; el = el.slice(0, -1); }
        var x;
        if ((x = /^(\d):(\d+|x|X)$/.exec(el))) {
          var s = +x[1], dead = /x/i.test(x[2]), f = dead ? 0 : +x[2];
          if (s < 1 || s > I.strings) { E('"' + raw + '": string ' + s + ' does not exist (the ' + I.name.toLowerCase() + ' has strings 1 to ' + I.strings + ')', mi, raw); bad = true; return; }
          var harm = flags.indexOf('harm') >= 0;
          var midi;
          if (harm) {
            if (!HARM[f]) { E('"' + raw + '": a natural harmonic is played at fret 12, 7, 5, 19 or 24 (or 4, 9)', mi, raw); bad = true; return; }
            midi = stringMidi(instId, tid, s, 0, capo) + HARM[f];
          } else midi = stringMidi(instId, tid, s, f, capo);
          if (midi == null) { E('"' + raw + '": string ' + s + ' has no fret ' + f + (isShort(I, s) ? ' (the short 5th string starts at fret 6; open is 0)' : ' (frets go up to ' + I.frets + ')'), mi, raw); bad = true; return; }
          notes.push({ s: s, fret: f, midi: midi, dead: dead, tie: tie, given: true });
        } else if ((x = /^([A-G](?:##|bb|#|b|n)?-?\d)(?:@(\d))?$/.exec(el))) {
          var pm = S.parsePitch(x[1]);
          if (!pm) { E('"' + raw + '": can\'t read the pitch ' + x[1], mi, raw); bad = true; return; }
          notes.push({ name: x[1], midi: pm.midi, tie: tie, at: x[2] ? +x[2] : 0 });
          forced.push(x[2] ? +x[2] : 0); pitchMidis.push(notes.length - 1);
        } else { E('"' + raw + '": "' + el + '" is not string:fret (3:2) or a pitch (G3, G3@3)', mi, raw); bad = true; }
      });
      if (bad || !notes.length) { outT.push('r' + (dur || '/4')); recs[mi + ':' + vi + ':' + ii] = { rest: true, flags: [] }; ii++; return; }
      // positions for the notes written as pitches
      var need = notes.filter(function (n) { return n.s == null; });
      if (need.length) {
        if (need.length === 1 && notes.length === 1) {
          var pos = assignPosition(need[0].midi, instId, tid, capo, P, need[0].at);
          if (!pos) { E('"' + raw + '": ' + need[0].name + ' can\'t be played on the ' + I.name.toLowerCase() + ' in this tuning' + (need[0].at ? ' on string ' + need[0].at : ''), mi, raw); bad = true; }
          else { need[0].s = pos.s; need[0].fret = pos.fret; }
        } else {
          var taken = {}; notes.forEach(function (n) { if (n.s) taken[n.s] = 1; });
          var list = assignChord(need.map(function (n) { return n.midi; }), instId, tid, capo, P, need.map(function (n) { return n.at; }));
          if (list && list.every(function (c) { return !taken[c.s]; })) list.forEach(function (c, k) { need[k].s = c.s; need[k].fret = c.fret; });
          else { E('"' + raw + '": these notes can\'t all be played at once on separate strings', mi, raw); bad = true; }
        }
      }
      if (bad) { outT.push('r' + (dur || '/4')); recs[mi + ':' + vi + ':' + ii] = { rest: true, flags: [] }; ii++; return; }
      var strs = {};
      notes.forEach(function (n) { if (strs[n.s]) { E('"' + raw + '": two notes on string ' + n.s + ' at once', mi, raw); } strs[n.s] = 1; });
      var names = notes.map(function (n) {
        var written = n.midi + I.transpose;
        var nm = n.name ? (function () { var pp = S.parsePitch(n.name); return pp.letter + (n.name.match(/^[A-G](##|bb|#|b|n)?/)[1] || '') + (pp.octave + I.transpose / 12); })() : spellFor(written, key);
        n.written = nm;
        return nm + n.tie;
      });
      var tok = pre + (isChord ? '[' + names.join(' ') + ']' : names[0]) + dur + post;
      outT.push(tok);
      recs[mi + ':' + vi + ':' + ii] = { notes: notes, flags: flags, raw: raw };
      ii++;
    });
    var tabText = outT.join(' ');

    // 2. the song model, by song.js
    var doc2 = {};
    Object.keys(doc).forEach(function (k) { if (!FRET_FIELDS[k] && k !== 'staves' && k !== 'fingering') doc2[k] = doc[k]; });
    doc2.staves = { rh: tabText.trim() ? tabText : 'R' };
    doc2.clefs = { rh: 'treble' };
    if (doc.staves) E('a fretted song has "tab", not "staves"');
    var model = S.parse(doc2, { loose: !!opts.loose });
    model.errors.forEach(function (e) { if (e.staff === 'rh') e.staff = 'tab'; });
    model.warnings.forEach(function (e) { if (e.staff === 'rh') e.staff = 'tab'; });
    if (yamlErr) model.errors.unshift({ msg: yamlErr });

    // 3. attach string/fret to every note
    var F = { instrument: instId, inst: I, tuning: tid, tun: T, capo: capo, transpose: I.transpose, notes: {}, items: {},
      style: doc.style || '', technique: [].concat(doc.technique || []), voice: doc.voice || I.voice || null, size: doc.size || null,
      swing: doc.swing === true || doc.swing === 'true' ? 2 / 3 : (+doc.swing > 0.5 && +doc.swing < 0.8 ? +doc.swing : 0), draft: !!doc.draft };
    var St = model.staves[0];
    if (St) St.measures.forEach(function (M, mIdx) {
      M.voices.forEach(function (v, vIdx) {
        v.forEach(function (it, iIdx) {
          var r = recs[mIdx + ':' + (M.hasVoices ? vIdx : 0) + ':' + iIdx];
          if (!r) return;
          var tech = {};
          r.flags.forEach(function (f) { if (TECH[f]) tech[f] = true; else if (!PICKS[f]) E('"' + r.raw + '": !' + f + ' is not a technique mark (!h !p !s !si !b !bh !harm !x !acc) or a right-hand letter (!T !I !M !p !i !m !a !d !u !S)', M.bar, r.raw); });
          var pickFlag = r.flags.filter(function (f) { return PICKS[f] && !TECH[f]; })[0] || ''; // !p is a pull-off; the classical thumb p goes in pick:
          F.items[it.id] = { tech: tech, pick: pickFlag, rest: !!r.rest };
          if (r.rest) return;
          it.notes.forEach(function (n) {
            // match by written pitch
            var src = r.notes.filter(function (x) { return S.parsePitch(x.written) && S.parsePitch(x.written).midi === n.midi; })[0];
            if (!src) return;
            var d = { s: src.s, fret: src.fret, midi: src.midi, dead: !!src.dead || !!tech.x, tech: tech, pick: pickFlag, given: !!src.given };
            if (tech.b) d.bendTo = src.midi + 2; if (tech.bh) d.bendTo = src.midi + 1;
            F.notes[n.id] = d;
          });
        });
      });
    });
    // 4. right-hand letters from `pick:`
    if (doc.pick != null && St) {
      var pb = String(doc.pick).split('|').map(function (b) { return b.trim(); });
      while (pb.length && pb[pb.length - 1] === '') pb.pop();
      if (pb.length > St.measures.length) E('pick has ' + pb.length + ' bars but the tab has ' + St.measures.length);
      pb.forEach(function (b, k) {
        var M = St.measures[k]; if (!M || !b) return;
        var ls = b.split(/\s+/).filter(function (x) { return x && !/^(<<|>>|&)$/.test(x); });
        var all = [], nts = [];
        M.voices.forEach(function (v) { v.forEach(function (it) { all.push(it); if (it.kind !== 'rest') nts.push(it); }); });
        var tgt = ls.length === all.length ? all : ls.length === nts.length ? nts : null;
        if (!tgt) { E('pick has ' + ls.length + ' letters here but the bar has ' + nts.length + ' notes and chords', M.bar, b); return; }
        tgt.forEach(function (it, j) {
          var L = ls[j]; if (L === '-' || L === '0') return;
          var parts = L.split('+');
          if (!parts.every(function (p) { return PICKS[p]; })) { E('pick "' + L + '": use T I M (banjo), p i m a c (classical), d u (pick), S (strike), D U (brush), - for none; join a pinch with + (T+M)', M.bar, L); return; }
          if (it.kind === 'rest') { E('pick "' + L + '" falls on a rest', M.bar, L); return; }
          if (!F.items[it.id]) F.items[it.id] = { tech: {}, pick: '' };
          F.items[it.id].pick = L;
          var ns = it.notes.slice().sort(function (a, b2) { return (F.notes[b2.id] ? F.notes[b2.id].s : 0) - (F.notes[a.id] ? F.notes[a.id].s : 0); });
          ns.forEach(function (n, q) { if (F.notes[n.id]) F.notes[n.id].pick = parts.length === ns.length ? parts[q] : parts[0]; });
        });
      });
    }
    // 5. playability: frets, stretches, fingers, the same string twice, legato marks
    if (St) {
      var lastOnString = {}; // per voice: previous note on each string
      St.measures.forEach(function (M) {
        var byStart = {};
        M.voices.forEach(function (v, vIdx) {
          v.forEach(function (it) {
            if (it.kind === 'rest') return;
            (byStart[it.start] = byStart[it.start] || []).push(it);
            var info = F.items[it.id] || { tech: {} };
            it.notes.forEach(function (n) {
              var d = F.notes[n.id]; if (!d) return;
              var key2 = vIdx + ':' + d.s, prev = lastOnString[key2];
              ['h', 'p', 's'].forEach(function (t) {
                if (!info.tech[t]) return;
                if (!prev) E('"' + it.tok + '": a ' + TECH[t] + ' (!' + t + ') needs a note before it on the same string (string ' + d.s + ')', M.bar, it.tok);
                else if (t === 'h' && !(d.fret > prev.fret)) E('"' + it.tok + '": a hammer-on goes to a higher fret than the note before it on string ' + d.s, M.bar, it.tok);
                else if (t === 'p' && !(d.fret < prev.fret)) E('"' + it.tok + '": a pull-off goes to a lower fret than the note before it on string ' + d.s, M.bar, it.tok);
                else if (t === 's' && d.fret === prev.fret) E('"' + it.tok + '": a slide goes to a different fret', M.bar, it.tok);
              });
              if (n.tiedFrom) { var src2 = F.notes[n.tiedFrom]; if (src2 && (src2.s !== d.s || src2.fret !== d.fret)) E('a tie joins notes on different strings or frets (' + it.tok + ')', M.bar, it.tok); }
              lastOnString[key2] = d;
              if (d.tech.b || d.tech.bh) { if (d.fret === 0) W('"' + it.tok + '": bending an open string does nothing', M.bar, it.tok); }
            });
          });
        });
        // notes that sound together: different strings, one hand can fret them
        Object.keys(byStart).forEach(function (st) {
          var its = byStart[st], used = {}, fr = [];
          its.forEach(function (it) { it.notes.forEach(function (n) { var d = F.notes[n.id]; if (!d) return; if (used[d.s]) E('two notes on string ' + d.s + ' at the same moment', M.bar, it.tok); used[d.s] = 1; if (!d.tech.harm) fr.push({ s: d.s, f: d.fret }); }); });
          // anything still ringing from an earlier start in another voice on the same string?
          if (fr.length > 1) {
            var frets = new Array(I.strings).fill(-1);
            fr.forEach(function (x) { frets[I.strings - x.s] = x.f; });
            var Fg = fingersFor(frets, instId);
            if (!Fg.ok) E('the notes at this moment (' + its.map(function (i) { return i.tok; }).join(' + ') + ') need more than four fingers or a stretch wider than five frets', M.bar, its[0].tok);
          }
        });
        // overlap across voices on one string
        if (M.voices.length > 1) {
          var spans = [];
          M.voices.forEach(function (v, vIdx) { v.forEach(function (it) { if (it.kind === 'rest') return; it.notes.forEach(function (n) { var d = F.notes[n.id]; if (d) spans.push({ v: vIdx, s: d.s, a: it.start, b: it.start + it.dur, tok: it.tok }); }); }); });
          spans.forEach(function (x) { spans.forEach(function (y) { if (x.v < y.v && x.s === y.s && x.a < y.b && y.a < x.b && x.a !== y.a) W('voice 1 (' + x.tok + ') and voice 2 (' + y.tok + ') overlap on string ' + x.s + ': the second note stops the first', M.bar, y.tok); }); });
        }
      });
    }
    // 6. chords, shapes and the right-hand pattern
    F.chords = [];
    F.shapes = {};
    var shapesSrc = doc.shapes || {};
    if (doc.chords != null) {
      var CL = parseChordLine(doc.chords, model);
      CL.errors.forEach(function (e) { E('chords: ' + e.msg, e.bar, e.token); });
      if (CL.bars.length !== model.measures.length) E('chords has ' + CL.bars.length + ' bars but the tab has ' + model.measures.length + (model.pickupTicks ? ' (count the pickup bar: write NC there if no chord sounds)' : ''));
      CL.bars.forEach(function (b, k) {
        var M = model.measures[k]; if (!M) return;
        b.forEach(function (c) {
          F.chords.push({ m: k, start: M.start + c.start, off: c.start, dur: c.dur, name: c.name, chord: c.chord, cont: !!c.cont });
          if (c.chord && !F.shapes[c.name]) {
            var v = null;
            if (shapesSrc[c.name] != null) {
              var fr = parseShape(String(shapesSrc[c.name]).split(/\s+fingers?\s*/)[0], instId);
              if (!fr) E('shapes: "' + shapesSrc[c.name] + '" for ' + c.name + ' is not a shape like x32010 (' + I.strings + ' strings' + (I.short ? ', or 4 for strings 4 to 1' : '') + ')');
              else if (!chordCheck(fr, c.chord, instId, tid, 0)) E('shapes: ' + shapeText(fr) + ' does not spell ' + c.name + ' (' + c.chord.notes.join(' ') + ')');
              else { var Fg2 = fingersFor(fr, instId); v = decorate({ frets: fr, fingers: Fg2.fingers, barre: Fg2.barre, common: false }, instId, tid, 0, c.chord); if (!Fg2.ok) W('shapes: ' + shapeText(fr) + ' for ' + c.name + ' looks hard to finger'); }
            }
            if (!v) { var list = shapesFor(c.chord, instId, tid, { limit: 1 }); v = list[0] || null; }
            if (!v) E('chords: no playable shape for ' + c.name + ' on the ' + I.name.toLowerCase() + ' in ' + T.name + ' tuning');
            F.shapes[c.name] = v;
          }
        });
      });
      Object.keys(shapesSrc).forEach(function (n) { if (!F.shapes[n]) W('shapes: ' + n + ' is never used in chords'); });
    }
    if (doc.pattern != null) {
      if (doc.chords == null) E('a pattern needs chords to play');
      var PT = parsePattern(doc.pattern, { instrument: instId });
      PT.errors.forEach(function (e) { E('pattern: ' + e.msg, e.bar != null && model.measures[e.bar] ? model.measures[e.bar].bar : null, e.token); });
      var named = PATTERNS[String(doc.pattern).trim()];
      if (named && !F.swing && named.swing) F.swing = 2 / 3;
      var cyc = PT.bars.length, multi = String(doc.pattern).indexOf('|') >= 0;
      if (multi && cyc > model.measures.length) E('pattern has ' + cyc + ' bars but the song has ' + model.measures.length);
      PT.bars.forEach(function (b, k) {
        if (b.silent) return;
        var M = model.measures[k], len = multi && M ? M.len : model.measureTicks;
        if (b.len !== len) E('pattern bar ' + (k + 1) + ' adds up to ' + (b.len / TPQ) + ' quarter notes, but ' + (multi && M && M.pickup ? 'the pickup' : 'a bar') + ' holds ' + (len / TPQ), multi && M ? M.bar : null);
      });
      F.pattern = { bars: PT.bars, cycle: !multi, text: String(doc.pattern) };
      // strings in the pattern must exist; bass strokes need a shape
    }
    model.fret = F;
    model.errors = model.errors.concat(errs);
    model.warnings = model.warnings.concat(warns);
    model.ok = !model.errors.length;
    model.meta.instrument = instId;
    ['style', 'technique', 'capo', 'tuning'].forEach(function (k) { if (doc[k] !== undefined) model.meta[k] = doc[k]; });
    return model;
  }

  /* ================= accompaniment events (the pattern over the chords) ================= */
  function bassStrings(v, chord, I) {
    // B = the lowest string that plays the chord's root (or the slash bass); B2 = the alternate bass (rule in overview)
    var snd = v.pitches.filter(function (p) { return !isShort(I, p.s); }).sort(function (a, b) { return b.s - a.s; });
    if (!snd.length) return [null, null];
    var want = chord ? chord.bassPc : mod(snd[0].midi, 12);
    var b1 = snd.filter(function (p) { return mod(p.midi, 12) === want; })[0] || snd[0];
    var lower = snd.filter(function (p) { return p.s < b1.s; }); // higher-pitched strings
    var b2 = null;
    if (I.id === 'guitar') b2 = lower.filter(function (p) { return p.s === (b1.s >= 5 ? 4 : b1.s - 1); })[0] || lower[0];
    else b2 = lower.filter(function (p) { return chord && mod(p.midi, 12) === mod(chord.rootPc + 7, 12); })[0] || lower[0];
    return [b1, b2 || b1];
  }
  function accompaniment(model, perf) {
    var F = model.fret; if (!F || !F.pattern || !F.chords.length) return [];
    var I = F.inst, out = [];
    var chordAt = function (mi, off) {
      var c = null;
      F.chords.forEach(function (x) { if (x.m === mi && x.off <= off && off < x.off + x.dur) c = x; });
      return c;
    };
    var fullIdx = 0, pm0 = model.measures;
    (perf.measures || []).forEach(function (pm) {
      var M = pm0[pm.index];
      var bar;
      if (F.pattern.cycle) { if (M.pickup) return; bar = F.pattern.bars[(pm.index - (model.pickupTicks ? 1 : 0)) % F.pattern.bars.length]; }
      else bar = F.pattern.bars[pm.index];
      if (!bar || bar.silent) return;
      bar.forEach(function (st) {
        if (st.t >= M.len) return;
        var c = chordAt(pm.index, st.t);
        if (!c || !c.chord) return;
        var v = F.shapes[c.name]; if (!v) return;
        var tick = pm.start + st.t, notes = [];
        var bs = bassStrings(v, c.chord, I);
        var vel = 0.55 + (st.accent ? 0.2 : 0) + (st.t % (model.beatTicks || TPQ) === 0 ? 0.08 : -0.05);
        var add = function (s, fing) { var p = v.pitches.filter(function (q) { return q.s === s; })[0]; if (!p && isShort(I, s)) p = { s: s, fret: 0, midi: stringMidi(F.instrument, F.tuning, s, 0, 0) }; if (p) notes.push({ s: p.s, fret: p.fret, midi: p.midi + F.capo, finger: fing }); };
        // shapes are relative to the capo: pitches above already include no capo; the capo is added here
        var k = st.kind;
        if (k === 'rest' || k === 'miss') { out.push({ start: tick, dur: st.dur, kind: k, chord: c.name, m: pm.index, t: st.t, notes: [] }); return; }
        if (k === 'down' || k === 'up' || k === 'mute') {
          var strs = v.pitches.map(function (p) { return p.s; }).filter(function (s) { return !isShort(I, s) || k !== 'mute'; });
          if (I.id === 'banjo') strs = strs.filter(function (s) { return !isShort(I, s); });
          if (st.range) strs = strs.filter(function (s) { return s <= Math.max(st.range[0], st.range[1]) && s >= Math.min(st.range[0], st.range[1]); });
          else if (k === 'up' && I.id === 'guitar') strs = strs.filter(function (s) { return s <= 4; });
          strs.sort(function (a, b) { return k === 'up' ? a - b : b - a; });
          strs.forEach(function (s) { add(s, ''); });
        } else if (k === 'bass') { var b = bs[st.bass === 2 ? 1 : 0]; if (b) add(b.s, st.finger); }
        else if (k === 'pluck') add(st.strings[0], st.finger);
        else if (k === 'pinch') st.parts.forEach(function (p) { if (p.kind === 'bass') { var bb = bs[p.bass === 2 ? 1 : 0]; if (bb) add(bb.s, p.finger); } else add(p.strings[0], p.finger); });
        out.push({ start: tick, dur: st.dur, kind: k, accent: st.accent, chord: c.name, m: pm.index, t: st.t, notes: notes, vel: Math.min(1, vel), finger: st.finger });
      });
    });
    return out;
  }

  var api = {
    INSTRUMENTS: INSTRUMENTS, QUALITIES: QUALITIES, SCALES: SCALES, PATTERNS: PATTERNS, PICKS: PICKS, TECH: TECH, TABLE: TABLE, TPQ: TPQ,
    instrument: instrument, tuning: tuning, stringMidi: stringMidi, noteName: noteName, pcName: pcName, parseNote: parseNote,
    freq: freq, pretty: pretty, parseChord: parseChord, spell: spell, parseShape: parseShape, shapeText: shapeText,
    shapePitches: shapePitches, fingersFor: fingersFor, findVoicings: findVoicings, commonShapes: commonShapes,
    shapesFor: shapesFor, chordCheck: function (fr, ch, i, t, c) { return chordCheck(fr, parseChord(ch), i, t, c); },
    nameChord: nameChord, parsePattern: parsePattern, parseChordLine: parseChordLine, parseSong: parseSong,
    accompaniment: accompaniment, assignPosition: assignPosition, assignChord: assignChord, spellFor: spellFor,
    isShort: function (instId, s) { return isShort(instrument(instId), s); }, bassStrings: bassStrings, chordStrings: chordStrings,
    FRET_FIELDS: FRET_FIELDS
  };
  root.TRBMusic = root.TRBMusic || {};
  var prev = root.TRBMusic.fret || {};
  Object.keys(api).forEach(function (k) { prev[k] = api[k]; });
  root.TRBMusic.fret = prev;
  if (typeof module !== 'undefined' && module.exports) module.exports = prev;
})(typeof window !== 'undefined' ? window : globalThis);
