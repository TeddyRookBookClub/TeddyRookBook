/* TRBMusic.song: the song-format parser and timing model (Teddy Rook Book, music kit). Works in the browser and in node.

   FORMAT: see /tmp/briefs/music_spec.md (data/music/songs/<slug>.yaml). Extras this parser accepts (all optional):
     beat: 4 | 8 | 2 | "4." | "2."      the tempo's beat unit (default the quarter; quote "4." in YAML)
     common: true / cut: true            show 4/4 as C, 2/2 as cut-C
     clefs: { rh: treble, lh: bass }     starting clefs (default rh treble, lh bass)
     clef:bass / clef:treble             a staff token at the START of a measure: change clef from that measure on
     {3:2 C4/8 D4/8 E4/8}                a tuplet with an explicit ratio (N in the time of M). {N …} alone means N in the
                                         time of the largest power of two below N, except {2 …} = 2 in the time of 3 and
                                         {4 …} = 4 in the time of 3 (the duplet and quadruplet of compound time)
     [C4~ E4 G4]/2                       a tie on one note of a chord (a ~ after the chord ties every note that repeats)
     Fn4                                 F natural, with the natural sign always printed (a cautionary natural)
   Bars: bar numbers follow printed music. With a pickup the pickup is bar 0 and the first full measure is bar 1;
   without one the first measure is bar 1. `marks` keys and every error message use these bar numbers.
   marks (per bar): dyn: "mf" (also "f@3": at beat 3, counting the time signature's lower number), tempo: "Allegro"
     (bold, above), text: "dolce" (italic, below the top staff), above: "rit." (italic, above), pedal: "Ped." (below the
     bottom staff), repeat: start | end | both, ending: 1 | 2, short: true (allow an incomplete bar, e.g. before a repeat).
     Each word field may be a list for several marks in one bar.
   fingering: one token per note, chord or rest token, in staff order ("0" or "-" = none; rests may be skipped);
     a chord's fingers joined with "-" in the same order as the chord's notes ("1-3-5"). Structural tokens (<< & >> {3 })
     may be written or left out. Missing bars at the end = no fingering there.

   API (TRBMusic.song, or require('static/music/kit/song.js') in node):
     parse(yamlTextOrObject, opts) -> model. Never throws on song errors: model.errors[] / model.warnings[] hold
         { msg, staff, bar, token } objects; model.ok = !errors.length. opts.strict: throw on the first error list.
         opts.loose: a snippet for a lesson (no title etc. needed; bars may have any length; time sets the beaming)
     parseYaml(text) -> object       the small YAML subset songs use (maps, block | text, [lists], {flow maps}, comments)
     parseStaff(text, ctx)           one staff's tokens -> measures (used by parse)
     keyInfo('Bb' | 'F#m')           { name, fifths, minor, tonic, alters: { B:-1, E:-1 }, label: "B♭ major" }
     parsePitch('F#4')               { letter, alter, octave, midi, step, forceNat } or null
     midiToName(61, preferFlat)      "C#4" ; nameOf(note) "F♯" (display letter with ♯/♭)
     freq(midi)                      equal temperament, A4 = 440 Hz (MIDI 69); MIDI 60 = C4
     performance(model, opts)        timeline for playing: { measures:[{index, bar, start, len}], events:[{midi, start,
         dur, hand, ids, vel, m}], columns:[{t, m, off, notes:[{id, midi, hand, dur}]}], total } in ticks.
         opts: { from, to } written measure indices (inclusive) to loop a range (repeats inside are not expanded);
         { repeats: false } to ignore repeat marks. Velocity follows the dynamics in marks.
     playOrder(model)                written measure indices in performance order (repeats and 1st/2nd endings)
     TPQ = 10080 ticks per quarter note (divisible by 32nds, dots and tuplets of 3, 5, 6, 7, 9).
   MODEL: { meta, key, time:{num,den,common,cut}, measureTicks, beatTicks, pickupTicks, tempo, staves:[{id:'rh'|'lh',
     hand, clef, measures:[{voices:[[item…]], clef (if it changes), len}]}], measures:[{index, bar, start, len,
     pickup, marks}], notes:{id -> note}, events (written order, no repeats), total, ok, errors, warnings }
     item: { kind:'note'|'chord'|'rest', start, dur (ticks), base (1,2,4,8,16,32), dots, tuplet:{n,m,id,first,last}|null,
       measureRest, notes:[note], slurStart, slurEnd, finger, voice (0/1), staff, bar, id, tok }
     note: { id, letter, alter, octave, midi, step (diatonic number: octave*7 + C..B 0..6), tie (to next), tiedFrom,
       tiedTo, acc: null | '#','b','n','##','bb' (the accidental to print), courtesy (bool), finger, item }
*/
(function (root) {
  'use strict';
  var TPQ = 10080;
  var LETTERS = 'CDEFGAB';
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var SHARPS = 'FCGDAEB', FLATS = 'BEADGCF';
  var MAJ = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 };
  var MIN = { Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6, 'A#m': 7, Dm: -1, Gm: -2, Cm: -3, Fm: -4, Bbm: -5, Ebm: -6, Abm: -7 };
  var TIMES = { '2/4': 1, '3/4': 1, '4/4': 1, '6/8': 1, '3/8': 1, '2/2': 1, '9/8': 1, '12/8': 1, '3/2': 1, '5/4': 1, '6/4': 1 };
  var DYN = { ppp: 0.25, pp: 0.32, p: 0.42, mp: 0.52, mf: 0.62, f: 0.74, ff: 0.86, fff: 0.95, sf: 0.8, sfz: 0.82, fp: 0.6 };
  var LEVELS = { beginner: 1, intermediate: 1, advanced: 1 };
  var ACC_TXT = { '-2': 'bb', '-1': 'b', '0': 'n', '1': '#', '2': '##' };

  /* ---------- small helpers ---------- */
  function isStr(s) { return typeof s === 'string'; }
  function frac(ticks) { // ticks -> "3 1/2 quarter notes"
    var q = ticks / TPQ, w = Math.floor(q + 1e-9), r = ticks - w * TPQ, s = '';
    if (r) {
      var den = TPQ, num = r, g = gcd(num, den); num /= g; den /= g;
      s = (w ? w + ' ' : '') + num + '/' + den;
    } else s = String(w);
    return s + (q === 1 ? ' quarter note' : ' quarter notes');
  }
  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  function freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function midiToName(m, flat) {
    var n = flat ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return n[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  }
  function accSym(alter) { return alter === 1 ? '♯' : alter === -1 ? '♭' : alter === 2 ? '𝄪' : alter === -2 ? '𝄫' : ''; }
  function nameOf(n) { return n.letter + accSym(n.alter); }

  function parsePitch(s) {
    var m = /^([A-G])(##|bb|#|b|n)?(-?\d)$/.exec(s);
    if (!m) return null;
    var alter = m[2] === '#' ? 1 : m[2] === '##' ? 2 : m[2] === 'b' ? -1 : m[2] === 'bb' ? -2 : 0;
    var oct = +m[3];
    var midi = (oct + 1) * 12 + PC[m[1]] + alter;
    return { letter: m[1], alter: alter, octave: oct, midi: midi, step: oct * 7 + LETTERS.indexOf(m[1]), forceNat: m[2] === 'n' };
  }

  function keyInfo(k) {
    k = String(k == null ? '' : k).trim();
    var minor = /m$/.test(k), fifths = minor ? MIN[k] : MAJ[k];
    if (fifths === undefined) return null;
    var alters = {}, i;
    for (i = 0; i < Math.abs(fifths); i++) alters[(fifths > 0 ? SHARPS : FLATS)[i]] = fifths > 0 ? 1 : -1;
    var tonic = minor ? k.slice(0, -1) : k;
    var pretty = tonic.charAt(0) + (tonic.length > 1 ? (tonic.charAt(1) === '#' ? '♯' : '♭') : '');
    return { name: k, fifths: fifths, minor: minor, tonic: tonic, alters: alters, label: pretty + (minor ? ' minor' : ' major') };
  }

  /* ---------- a small YAML subset ---------- */
  function stripComment(line) {
    var q = null, i, c;
    for (i = 0; i < line.length; i++) {
      c = line.charAt(i);
      if (q) { if (c === q && (q === "'" || line.charAt(i - 1) !== '\\')) q = null; }
      else if (c === '"' || c === "'") { if (i === 0 || /[\s:\[{,]/.test(line.charAt(i - 1))) q = c; }
      else if (c === '#' && (i === 0 || /\s/.test(line.charAt(i - 1)))) return line.slice(0, i).replace(/\s+$/, '');
    }
    return line.replace(/\s+$/, '');
  }
  function scalar(s, ln) {
    s = s.trim();
    if (s === '') return null;
    var c = s.charAt(0);
    if (c === '"') {
      try { return JSON.parse(s); } catch (e) { throw new Error('YAML line ' + ln + ': bad double-quoted string ' + s); }
    }
    if (c === "'") {
      if (s.charAt(s.length - 1) !== "'") throw new Error('YAML line ' + ln + ': unclosed quote');
      return s.slice(1, -1).replace(/''/g, "'");
    }
    if (c === '[') return flowSeq(s, ln);
    if (c === '{') return flowMap(s, ln);
    if (s === 'true' || s === 'True') return true;
    if (s === 'false' || s === 'False') return false;
    if (s === 'null' || s === '~') return null;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    return s;
  }
  function splitFlow(inner, ln) { // split on top-level commas, respecting quotes and brackets
    var out = [], depth = 0, q = null, cur = '', i, c;
    for (i = 0; i < inner.length; i++) {
      c = inner.charAt(i);
      if (q) { cur += c; if (c === q && inner.charAt(i - 1) !== '\\') q = null; continue; }
      if (c === '"' || c === "'") { q = c; cur += c; continue; }
      if (c === '[' || c === '{') depth++;
      if (c === ']' || c === '}') depth--;
      if (c === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    if (q || depth) throw new Error('YAML line ' + ln + ': unbalanced quotes or brackets');
    if (cur.trim() !== '') out.push(cur);
    return out;
  }
  function flowSeq(s, ln) {
    if (s.charAt(s.length - 1) !== ']') throw new Error('YAML line ' + ln + ': a [list] must close on the same line');
    return splitFlow(s.slice(1, -1), ln).map(function (x) { return scalar(x, ln); });
  }
  function flowMap(s, ln) {
    if (s.charAt(s.length - 1) !== '}') throw new Error('YAML line ' + ln + ': a {map} must close on the same line');
    var o = {};
    splitFlow(s.slice(1, -1), ln).forEach(function (part) {
      var kv = splitKey(part.trim());
      if (!kv) throw new Error('YAML line ' + ln + ': expected key: value in ' + s);
      o[kv[0]] = scalar(kv[1], ln);
    });
    return o;
  }
  function splitKey(t) { // "key: value" -> [key, value]; quoted keys allowed
    var m = /^("(?:[^"\\]|\\.)*"|'[^']*'|[^:"'\s][^:]*?)\s*:(?:\s+(.*)|$)/.exec(t);
    if (!m) return null;
    var k = m[1];
    if (k.charAt(0) === '"') k = JSON.parse(k); else if (k.charAt(0) === "'") k = k.slice(1, -1);
    return [k, m[2] === undefined ? '' : m[2]];
  }
  function parseYaml(text) {
    var raw = String(text).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
    var lines = [];
    raw.forEach(function (l, i) { lines.push({ raw: /^---\s*$/.test(l) ? '' : l, ln: i + 1 }); });
    var pos = 0;
    function indentOf(l) { return l.match(/^ */)[0].length; }
    function skipBlank() { while (pos < lines.length && stripComment(lines[pos].raw).trim() === '') pos++; }
    function block(ind) { // parse a map or a list at indentation ind
      skipBlank();
      if (pos >= lines.length) return null;
      var first = stripComment(lines[pos].raw);
      if (/^\s*- /.test(first) || /^\s*-$/.test(first)) return seq(indentOf(first));
      return map(indentOf(first));
    }
    function blockScalar(style, parentInd) {
      var out = [], bi = -1;
      while (pos < lines.length) {
        var l = lines[pos].raw;
        if (l.trim() === '') { out.push(''); pos++; continue; }
        var ind = indentOf(l);
        if (ind <= parentInd) break;
        if (bi < 0) bi = ind;
        if (ind < bi) break;
        out.push(l.slice(bi)); pos++;
      }
      var chomp = style.indexOf('-') >= 0 ? 'strip' : style.indexOf('+') >= 0 ? 'keep' : 'clip';
      while (chomp !== 'keep' && out.length && out[out.length - 1] === '') out.pop();
      var s = style.charAt(0) === '>' ? out.join('\n').replace(/([^\n])\n(?=[^\n ])/g, '$1 ') : out.join('\n');
      return chomp === 'strip' ? s : s + '\n';
    }
    function closed(t) { // is a quoted scalar or a flow collection complete?
      var c = t.charAt(0), i;
      if (c === '"') { for (i = 1; i < t.length; i++) { if (t.charAt(i) === '\\') i++; else if (t.charAt(i) === '"') return true; } return false; }
      if (c === "'") { for (i = 1; i < t.length; i++) { if (t.charAt(i) === "'") { if (t.charAt(i + 1) === "'") i++; else return true; } } return false; }
      if (c === '[' || c === '{') { var d = 0, q = null; for (i = 0; i < t.length; i++) { var ch = t.charAt(i); if (q) { if (ch === q) q = null; } else if (ch === '"' || ch === "'") q = ch; else if (ch === '[' || ch === '{') d++; else if (ch === ']' || ch === '}') d--; } return d <= 0; }
      return true;
    }
    function value(rest, ind, ln) {
      rest = rest.trim();
      if (/^[|>][+-]?$/.test(rest)) { pos++; return blockScalar(rest, ind); }
      if (rest === '') { pos++; skipBlank(); if (pos < lines.length && indentOf(lines[pos].raw) > ind) return block(); if (pos < lines.length && indentOf(lines[pos].raw) === ind && /^\s*- /.test(lines[pos].raw)) return seq(ind); return null; }
      pos++;
      var c0 = rest.charAt(0);
      if ('"\'[{'.indexOf(c0) >= 0) { // a quoted string or [list] that goes on over several lines
        while (!closed(rest) && pos < lines.length) { rest += ' ' + (c0 === '[' || c0 === '{' ? stripComment(lines[pos].raw) : lines[pos].raw).trim(); pos++; }
        if (!closed(rest)) throw new Error('YAML line ' + ln + ': a ' + (c0 === '[' ? '[list' : c0 === '{' ? '{map' : 'quoted string') + ' is never closed');
      } else { // plain text continued on more-indented lines
        while (pos < lines.length && lines[pos].raw.trim() !== '' && indentOf(lines[pos].raw) > ind && !/^\s*#/.test(lines[pos].raw)) { rest += ' ' + stripComment(lines[pos].raw).trim(); pos++; }
      }
      return scalar(rest, ln);
    }
    function map(ind) {
      var o = {};
      while (true) {
        skipBlank();
        if (pos >= lines.length) break;
        var L = lines[pos], l = stripComment(L.raw), li = indentOf(l);
        if (li < ind) break;
        if (li > ind) throw new Error('YAML line ' + L.ln + ': unexpected indentation');
        var kv = splitKey(l.trim());
        if (!kv) throw new Error('YAML line ' + L.ln + ': expected "key: value", found ' + JSON.stringify(l.trim()));
        if (Object.prototype.hasOwnProperty.call(o, kv[0])) throw new Error('YAML line ' + L.ln + ': key "' + kv[0] + '" appears twice');
        o[kv[0]] = value(kv[1], ind, L.ln);
      }
      return o;
    }
    function seq(ind) {
      var a = [];
      while (true) {
        skipBlank();
        if (pos >= lines.length) break;
        var L = lines[pos], l = stripComment(L.raw), li = indentOf(l);
        if (li < ind || !/^\s*-( |$)/.test(l)) break;
        if (li > ind) throw new Error('YAML line ' + L.ln + ': unexpected indentation');
        var rest = l.trim().slice(1).trim();
        if (splitKey(rest) && !/^["'\[{]/.test(rest)) { // "- key: value" starts a map item
          lines[pos] = { raw: new Array(ind + 3).join(' ') + rest, ln: L.ln };
          a.push(map(ind + 2));
        } else a.push(value(rest, ind, L.ln));
      }
      return a;
    }
    var r = block(0);
    skipBlank();
    if (pos < lines.length) throw new Error('YAML line ' + lines[pos].ln + ': could not read this line');
    return r || {};
  }

  /* ---------- staff tokens ---------- */
  function tokenize(text) {
    var toks = [], i = 0, s = String(text || ''), n = s.length, c, j;
    while (i < n) {
      c = s.charAt(i);
      if (/\s/.test(c)) { i++; continue; }
      if (c === '|') { toks.push({ t: '|', at: i }); i++; continue; }
      if (c === '&') { toks.push({ t: '&', at: i }); i++; continue; }
      if (s.substr(i, 2) === '<<') { toks.push({ t: '<<', at: i }); i += 2; continue; }
      if (s.substr(i, 2) === '>>') { toks.push({ t: '>>', at: i }); i += 2; continue; }
      if (c === '}') { toks.push({ t: '}', at: i }); i++; continue; }
      if (c === '{' || (c === '(' && s.charAt(i + 1) === '{')) {
        var slur = c === '(';
        j = i + (slur ? 2 : 1);
        var m = /^(\d+)(?::(\d+))?/.exec(s.slice(j));
        toks.push({ t: '{', n: m ? +m[1] : 0, m: m && m[2] ? +m[2] : 0, at: i, raw: s.slice(i, j + (m ? m[0].length : 0)), slur: slur });
        i = j + (m ? m[0].length : 0);
        continue;
      }
      // a note, chord or rest token: up to whitespace or a structural character (brackets kept together)
      j = i; var depth = 0;
      while (j < n) {
        c = s.charAt(j);
        if (c === '[') depth++;
        else if (c === ']') depth--;
        else if (depth <= 0 && (/\s/.test(c) || c === '|' || c === '&' || c === '}' || s.substr(j, 2) === '>>' || s.substr(j, 2) === '<<')) break;
        j++;
      }
      toks.push({ t: 'x', raw: s.slice(i, j), at: i });
      i = j;
    }
    return toks;
  }

  var DUR_BASE = { 1: 4 * TPQ, 2: 2 * TPQ, 4: TPQ, 8: TPQ / 2, 16: TPQ / 4, 32: TPQ / 8 };
  function durTicks(base, dots) { var d = DUR_BASE[base]; return dots === 2 ? d * 7 / 4 : dots === 1 ? d * 3 / 2 : d; }

  // one note/chord/rest token -> item (or throws a message)
  function parseItem(raw) {
    var s = raw, it = { slurStart: false, slurEnd: false, tie: false };
    if (s.charAt(0) === '(') { it.slurStart = true; s = s.slice(1); }
    var changed = true;
    while (changed) {
      changed = false;
      if (s.charAt(s.length - 1) === ')' && s.charAt(s.length - 2) !== '(') { it.slurEnd = true; s = s.slice(0, -1); changed = true; }
      if (s.charAt(s.length - 1) === '~') { it.tie = true; s = s.slice(0, -1); changed = true; }
    }
    if (s === 'R') { it.kind = 'rest'; it.measureRest = true; it.notes = []; return it; }
    var m = /^(\[[^\]]*\]|r|[A-Za-z][^\/]*)(?:\/(\d+)(\.{0,2}))?$/.exec(s);
    if (!m) throw 'is not a note, chord or rest (a note looks like C4/4; a rest r/4; a chord [C4 E4 G4]/2)';
    if (m[2] === undefined) throw 'has no duration: add /1, /2, /4, /8, /16 or /32 (for example ' + (m[1] === 'r' ? 'r/4' : m[1] + '/4') + ')';
    if (!DUR_BASE[m[2]]) throw 'has the duration /' + m[2] + ', but durations are /1, /2, /4, /8, /16 or /32';
    it.base = +m[2]; it.dots = m[3].length;
    if (it.base === 32 && it.dots === 2) throw 'is a double-dotted 32nd note, which is too short to use here';
    it.written = durTicks(it.base, it.dots);
    if (m[1] === 'r') { it.kind = 'rest'; it.notes = []; return it; }
    var ps = m[1].charAt(0) === '[' ? m[1].slice(1, -1).trim().split(/\s+/) : [m[1]];
    if (m[1].charAt(0) === '[' && (ps.length < 1 || ps[0] === '')) throw 'is an empty chord';
    it.kind = m[1].charAt(0) === '[' ? 'chord' : 'note';
    it.notes = ps.map(function (p) {
      var tie = false;
      if (p.charAt(p.length - 1) === '~') { tie = true; p = p.slice(0, -1); }
      var P = parsePitch(p);
      if (!P) {
        if (/^[a-g]/.test(p)) throw 'has a lowercase letter in ' + p + ': write note letters in capitals (C4, not c4)';
        if (/^[A-G](##|bb|#|b|n)?$/.test(p)) throw 'is missing the octave number in ' + p + ' (middle C is C4)';
        if (/^[H-Z]/.test(p)) throw 'uses the letter ' + p.charAt(0) + ': note letters are A to G';
        throw 'has a pitch I can\'t read: ' + p + ' (write letter, accidental, octave: C4, F#4, Bb3, Fn4)';
      }
      if (P.midi < 21 || P.midi > 108) throw 'has ' + p + ', which is outside the piano (A0 to C8)';
      P.tie = tie || it.tie; P.ownTie = tie;
      return P;
    });
    it.origOrder = it.notes.slice();
    if (it.kind === 'chord') {
      it.notes.sort(function (a, b) { return a.step - b.step || a.midi - b.midi; });
      for (var k = 1; k < it.notes.length; k++) if (it.notes[k].midi === it.notes[k - 1].midi && it.notes[k].step === it.notes[k - 1].step) throw 'has the same note twice in a chord';
    }
    return it;
  }

  function tupletRatio(n, m) {
    if (m) return m;
    if (n === 2) return 3;
    if (n === 4) return 3;
    var p = 1; while (p * 2 < n) p *= 2; return p;
  }

  // parse one staff (text) into measures; errors go to ctx.err(msg, bar, token)
  function parseStaff(text, ctx) {
    var toks = tokenize(text), measures = [], cur = null, voice = null, tup = null, inVoices = false, vcount = 0;
    var tupId = 0, pendingSlur = false;
    function newMeasure() { cur = { voices: [[]], tokens: 0, hasVoices: false, clef: null, raw: [] }; voice = cur.voices[0]; vcount = 0; }
    function endMeasure(tok) {
      if (tup) { ctx.err('a tuplet { … } is not closed before the barline', measures.length, tup.raw); tup = null; }
      if (inVoices) { ctx.err('two voices << … >> are not closed before the barline (write << voice A & voice B >> inside one bar)', measures.length, '<<'); inVoices = false; }
      if (cur && cur.tokens > 1 && cur.voices[0].some(function (it) { return it.measureRest; })) ctx.err('R (a whole-bar rest) must be alone in its bar', measures.length, 'R');
      if (cur && (cur.tokens || cur.clef)) measures.push(cur);
      else if (cur && tok) ctx.err('an empty bar (two barlines in a row)', measures.length, '|');
      newMeasure();
    }
    newMeasure();
    for (var i = 0; i < toks.length; i++) {
      var T = toks[i], bar = measures.length;
      if (T.t === '|') { endMeasure(T); continue; }
      if (T.t === '<<') {
        if (inVoices) { ctx.err('<< inside << … >>', bar, '<<'); continue; }
        if (cur.tokens) ctx.err('a bar with two voices must be only the << voice A & voice B >> block; put the other notes inside one of the voices', bar, '<<');
        inVoices = true; cur.hasVoices = true; cur.voices = [[]]; voice = cur.voices[0]; cur.tokens++;
        continue;
      }
      if (T.t === '&') {
        if (!inVoices) { ctx.err('& is only used between two voices: << voice A & voice B >>', bar, '&'); continue; }
        if (tup) { ctx.err('a tuplet { … } is not closed before &', bar, tup.raw); tup = null; }
        if (cur.voices.length >= 2) { ctx.err('only two voices per staff are supported', bar, '&'); continue; }
        cur.voices.push([]); voice = cur.voices[cur.voices.length - 1];
        continue;
      }
      if (T.t === '>>') {
        if (!inVoices) { ctx.err('>> without <<', bar, '>>'); continue; }
        if (tup) { ctx.err('a tuplet { … } is not closed before >>', bar, tup.raw); tup = null; }
        if (cur.voices.length < 2) ctx.err('<< … >> needs two voices separated by &', bar, '<<');
        inVoices = false; voice = null;
        continue;
      }
      if (T.t === '{') {
        if (tup) { ctx.err('tuplets inside tuplets are not supported', bar, T.raw); continue; }
        if (!T.n || T.n < 2 || T.n > 12) { ctx.err('a tuplet starts with its number, like {3 C4/8 D4/8 E4/8}', bar, T.raw); continue; }
        tup = { n: T.n, m: tupletRatio(T.n, T.m), id: ++tupId, items: [], raw: T.raw };
        if (T.slur) pendingSlur = true;
        continue;
      }
      if (T.t === '}') {
        if (!tup) { ctx.err('} without a tuplet {', bar, '}'); continue; }
        if (!tup.items.length) ctx.err('an empty tuplet', bar, tup.raw);
        else { tup.items[0].tuplet.first = true; tup.items[tup.items.length - 1].tuplet.last = true; }
        tup = null;
        continue;
      }
      // x token
      if (/^clef:/.test(T.raw)) {
        var cl = T.raw.slice(5);
        if (cl !== 'treble' && cl !== 'bass') ctx.err('clef:' + cl + ' is not a clef (use clef:treble or clef:bass)', bar, T.raw);
        else if (cur.tokens) ctx.err('a clef change goes at the start of a bar', bar, T.raw);
        else cur.clef = cl;
        continue;
      }
      if (cur.hasVoices && !inVoices) { ctx.err('a bar with two voices must be only the << voice A & voice B >> block', bar, T.raw); continue; }
      var it;
      try { it = parseItem(T.raw); } catch (msg) { ctx.err('"' + T.raw + '" ' + msg, bar, T.raw); continue; }
      it.tok = T.raw;
      if (pendingSlur) { it.slurStart = true; pendingSlur = false; }
      if (it.measureRest && (cur.tokens || inVoices || tup)) { ctx.err('R (a whole-bar rest) must be alone in its bar', bar, 'R'); continue; }
      if (tup) {
        if (it.measureRest) { ctx.err('R can\'t be inside a tuplet', bar, 'R'); continue; }
        it.tuplet = { n: tup.n, m: tup.m, id: tup.id, first: false, last: false };
        tup.items.push(it);
      } else it.tuplet = null;
      if (!it.measureRest) {
        var d = it.written * (it.tuplet ? it.tuplet.m / it.tuplet.n : 1);
        if (Math.abs(d - Math.round(d)) > 1e-6) { ctx.err('"' + T.raw + '" makes a duration too fine to time exactly in this tuplet', bar, T.raw); d = Math.round(d); }
        it.dur = Math.round(d);
      }
      voice.push(it);
      cur.tokens++;
    }
    if (tup) ctx.err('a tuplet { … } is not closed', measures.length, tup.raw);
    if (inVoices) ctx.err('two voices << … >> are not closed', measures.length, '<<');
    if (cur.tokens > 1 && cur.voices[0].some(function (it) { return it.measureRest; })) ctx.err('R (a whole-bar rest) must be alone in its bar', measures.length, 'R');
    if (cur.tokens || cur.clef) measures.push(cur);
    return measures;
  }

  /* ---------- fingering ---------- */
  function parseFingering(text, staffMeasures, ctx, sid) {
    var bars = String(text || '').split('|').map(function (b) { return b.trim(); });
    while (bars.length && bars[bars.length - 1] === '') bars.pop();
    if (bars.length > staffMeasures.length) ctx.err('fingering for ' + sid + ' has ' + bars.length + ' bars but the staff has ' + staffMeasures.length, null, null, sid);
    bars.forEach(function (b, mi) {
      var M = staffMeasures[mi];
      if (!M) return;
      var fs = b.split(/\s+/).filter(function (x) { return x && !/^(<<|>>|&|\{\d+(:\d+)?|\})$/.test(x); });
      fs = fs.map(function (x) { return x.replace(/^\{\d+(:\d+)?/, '').replace(/\}$/, ''); }).filter(Boolean);
      if (!fs.length) return;
      var all = [], notes = [];
      M.voices.forEach(function (v) { v.forEach(function (it) { all.push(it); if (it.kind !== 'rest') notes.push(it); }); });
      var target = fs.length === all.length ? all : fs.length === notes.length ? notes : null;
      if (!target) { ctx.err('fingering has ' + fs.length + ' numbers here but the bar has ' + notes.length + ' notes and chords' + (all.length !== notes.length ? ' (' + all.length + ' with rests)' : ''), M.bar, b, sid); return; }
      target.forEach(function (it, k) {
        var f = fs[k];
        if (f === '0' || f === '-' || f === '_') return;
        var parts = f.split('-');
        if (!parts.every(function (p) { return /^[1-5]$/.test(p) || p === '0' || p === ''; })) { ctx.err('fingering "' + f + '": fingers are 1 (thumb) to 5 (little finger), 0 or - for none', M.bar, f, sid); return; }
        if (it.kind === 'rest') { ctx.err('fingering "' + f + '" falls on a rest', M.bar, f, sid); return; }
        if (it.kind === 'note') { if (parts.length !== 1) ctx.err('fingering "' + f + '" has several fingers for a single note', M.bar, f, sid); else it.notes[0].finger = parts[0]; it.finger = parts[0]; return; }
        if (parts.length === 1) { it.finger = parts[0]; it.notes[it.notes.length - 1].finger = parts[0]; return; }
        if (parts.length !== it.notes.length) { ctx.err('fingering "' + f + '" has ' + parts.length + ' fingers for a chord of ' + it.notes.length + ' notes', M.bar, f, sid); return; }
        // fingers are written in the chord's written order; notes were sorted low to high: map by original order
        it.origOrder.forEach(function (n, k2) { if (parts[k2] && parts[k2] !== '0') n.finger = parts[k2]; });
      });
    });
  }

  /* ---------- the whole song ---------- */
  function parse(input, opts) {
    opts = opts || {};
    var errors = [], warnings = [], doc;
    function E(msg, bar, token, staff) { errors.push({ msg: msg, bar: bar, token: token, staff: staff }); }
    function W(msg, bar, token, staff) { warnings.push({ msg: msg, bar: bar, token: token, staff: staff }); }
    var yamlBad = false;
    if (isStr(input)) { try { doc = parseYaml(input); } catch (e) { E(e.message); doc = {}; yamlBad = true; } }
    else doc = input || {};
    var meta = {};
    ['slug', 'title', 'composer', 'work', 'arranged', 'level', 'order', 'key', 'time', 'tempo', 'beat', 'pickup', 'skills', 'about', 'source', 'common', 'cut'].forEach(function (k) { if (doc[k] !== undefined) meta[k] = doc[k]; });
    var loose = !!opts.loose || yamlBad;
    if (!loose) {
      ['slug', 'title', 'composer', 'level', 'key', 'time', 'tempo', 'about', 'source'].forEach(function (k) { if (doc[k] === undefined || doc[k] === null || doc[k] === '') E('missing field "' + k + '"'); });
      if (doc.order === undefined) W('missing field "order" (its place within its level)');
      if (doc.pickup === undefined) W('missing field "pickup" (0 if none)');
      if (!Array.isArray(doc.skills) || !doc.skills.length) W('"skills" should be a list like ["right hand only", "C position"]');
    }
    if (doc.level !== undefined && !LEVELS[doc.level]) E('level "' + doc.level + '" must be beginner, intermediate or advanced');
    if (doc.slug !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(doc.slug))) E('slug "' + doc.slug + '" should be lowercase words joined by hyphens');
    var known = { slug: 1, title: 1, composer: 1, work: 1, arranged: 1, level: 1, order: 1, key: 1, time: 1, tempo: 1, beat: 1, pickup: 1, skills: 1, about: 1, source: 1, staves: 1, fingering: 1, marks: 1, common: 1, cut: 1, clefs: 1 };
    if (!loose) Object.keys(doc).forEach(function (k) { if (!known[k]) W('unknown field "' + k + '"'); });

    var key = keyInfo(doc.key);
    if (!key) { if (doc.key !== undefined) E('key "' + doc.key + '" is not one of C G D A E B F# C# F Bb Eb Ab Db Gb Cb (minor: Am Em … add m)'); key = keyInfo('C'); }
    var ts = String(doc.time || '4/4'), tm = /^(\d+)\/(\d+)$/.exec(ts);
    if (!tm || !TIMES[ts]) { if (doc.time !== undefined) E('time "' + doc.time + '" is not one of 2/4 3/4 4/4 6/8 3/8 2/2 (also 9/8 12/8 3/2 5/4 6/4)'); tm = [0, 4, 4]; ts = '4/4'; }
    var time = { num: +tm[1], den: +tm[2], common: !!doc.common, cut: !!doc.cut, str: ts };
    if (time.common && ts !== '4/4') E('common: true needs time: 4/4');
    if (time.cut && ts !== '2/2') E('cut: true needs time: 2/2');
    var measureTicks = time.num * TPQ * 4 / time.den;
    var beat = doc.beat === undefined || doc.beat === null ? '4' : String(doc.beat).trim();
    var beatTicks = { '4': TPQ, '8': TPQ / 2, '2': 2 * TPQ, '4.': TPQ * 3 / 2, '2.': TPQ * 3, '8.': TPQ * 3 / 4, '1': 4 * TPQ }[beat];
    if (!beatTicks) { E('beat "' + doc.beat + '" must be 4, 8, 2, "4." or "2."'); beatTicks = TPQ; }
    var tempo = +doc.tempo;
    if (doc.tempo !== undefined && !(tempo >= 20 && tempo <= 320)) { E('tempo ' + doc.tempo + ' should be a number of beats per minute (20 to 320)'); tempo = 100; }
    if (!tempo) tempo = 100;
    var pickupQ = doc.pickup === undefined || doc.pickup === null ? 0 : +doc.pickup;
    if (!(pickupQ >= 0)) { E('pickup "' + doc.pickup + '" should be a number of quarter notes (0 if none)'); pickupQ = 0; }
    var pickupTicks = Math.round(pickupQ * TPQ);
    if (pickupTicks >= measureTicks) { E('pickup ' + pickupQ + ' is as long as a whole bar or longer'); pickupTicks = 0; }
    var barOffset = pickupTicks ? 0 : 1; // bar number of written measure 0

    var staves = [], sv = doc.staves || {};
    if (!yamlBad && (typeof sv !== 'object' || (!sv.rh && !sv.lh))) E('missing "staves" with rh: and/or lh:');
    Object.keys(sv).forEach(function (k) { if (k !== 'rh' && k !== 'lh') E('staves: "' + k + '" should be rh or lh'); });
    var clefs = doc.clefs || {};
    ['rh', 'lh'].forEach(function (sid) {
      if (!sv[sid]) return;
      var ctx = { err: function (msg, mi, tok) { E(msg, mi == null ? null : mi + barOffset, tok, sid); } };
      var ms = parseStaff(sv[sid], ctx);
      var clef = clefs[sid] || (sid === 'rh' ? 'treble' : 'bass');
      if (clef !== 'treble' && clef !== 'bass') { E('clefs: ' + sid + ' must be treble or bass'); clef = sid === 'rh' ? 'treble' : 'bass'; }
      staves.push({ id: sid, hand: sid, clef: clef, measures: ms });
    });
    var nM = staves.length ? staves[0].measures.length : 0;
    if (staves.length === 2 && staves[0].measures.length !== staves[1].measures.length)
      E('the staves have different numbers of bars: rh has ' + staves[0].measures.length + ', lh has ' + staves[1].measures.length);
    nM = Math.max.apply(null, staves.map(function (s) { return s.measures.length; }).concat([0]));
    if (staves.length && !nM) E('the staves have no notes');

    // marks
    var marks = {}, rawMarks = doc.marks || {};
    if (typeof rawMarks !== 'object' || Array.isArray(rawMarks)) { E('marks should be a map of bar number -> { dyn: "mf" }'); rawMarks = {}; }
    Object.keys(rawMarks).forEach(function (k) {
      var b = +k, mi = b - barOffset, v = rawMarks[k];
      if (!/^\d+$/.test(String(k)) || mi < 0 || mi >= nM) { E('marks: bar ' + k + ' does not exist (bars run ' + barOffset + '–' + (nM - 1 + barOffset) + ')'); return; }
      if (!v || typeof v !== 'object') { E('marks: bar ' + k + ' should be a map like { dyn: "mf" }', b); return; }
      Object.keys(v).forEach(function (f) {
        if (!{ dyn: 1, tempo: 1, text: 1, above: 1, pedal: 1, repeat: 1, ending: 1, short: 1, fermata: 1 }[f]) W('marks: bar ' + k + ' has an unknown field "' + f + '"', b);
      });
      if (v.dyn !== undefined) [].concat(v.dyn).forEach(function (d) { var dd = String(d).split('@')[0].trim(); if (!DYN[dd] && !/^(cresc\.?|dim\.?|decresc\.?|<|>)$/.test(dd)) W('marks: bar ' + k + ' dynamic "' + d + '" is not one of ppp pp p mp mf f ff fff sf sfz fp cresc. dim.', b); });
      if (v.repeat !== undefined && !{ start: 1, end: 1, both: 1 }[v.repeat]) E('marks: bar ' + k + ' repeat must be start, end or both', b);
      if (v.ending !== undefined && !{ 1: 1, 2: 1 }[v.ending]) E('marks: bar ' + k + ' ending must be 1 or 2', b);
      marks[mi] = v;
    });

    // measures: lengths and times
    var measures = [], t = 0;
    for (var mi = 0; mi < nM; mi++) {
      var bar = mi + barOffset, mk = marks[mi] || {};
      var expect = (mi === 0 && pickupTicks) ? pickupTicks : measureTicks;
      var lens = [];
      staves.forEach(function (S) {
        var M = S.measures[mi];
        if (!M) return;
        M.bar = bar;
        M.voices.forEach(function (v, vi) {
          var len = 0;
          v.forEach(function (it) { if (!it.measureRest) len += it.dur; });
          if (v.length === 1 && v[0].measureRest) len = -1; // fills whatever the bar is
          lens.push({ S: S, vi: vi, len: len, v: v });
        });
      });
      var actual = expect;
      var isLast = mi === nM - 1;
      if (loose) { actual = Math.max.apply(null, lens.map(function (L) { return L.len; }).concat([0])); if (actual <= 0) actual = measureTicks; lens = []; }
      lens.forEach(function (L) {
        if (L.len === -1) return;
        var ok = L.len === expect;
        if (!ok && isLast && pickupTicks && L.len === measureTicks - pickupTicks) { ok = true; actual = L.len; }
        if (!ok && mk.short && L.len < measureTicks && L.len > 0) { ok = true; actual = L.len; }
        if (!ok) {
          var what = mi === 0 && pickupTicks ? 'the pickup (pickup: ' + pickupQ + ')' : 'a bar of ' + ts;
          E((L.v.length ? '' : 'an empty voice: ') + 'this bar' + (L.S.measures[mi].hasVoices ? ' (voice ' + (L.vi + 1) + ')' : '') + ' adds up to ' + frac(L.len) + ' but ' + what + ' holds ' + frac(expect) +
            (L.len > expect ? ' (too long)' : ' (too short)'), bar, L.v.length ? L.v[L.v.length - 1].tok : null, L.S.id);
        }
      });
      // if staves disagree on a legal short length, use the longest
      lens.forEach(function (L) { if (L.len > 0 && L.len !== actual && (L.len === expect || L.len === measureTicks - pickupTicks)) actual = Math.max(actual, L.len); });
      measures.push({ index: mi, bar: bar, start: t, len: actual, pickup: mi === 0 && !!pickupTicks, marks: mk });
      t += actual;
    }

    // fill in item times, ids, voices; fingering
    var notes = {};
    staves.forEach(function (S) {
      var clef = S.clef;
      S.measures.forEach(function (M, mi) {
        if (!measures[mi]) return;
        M.len = measures[mi].len;
        if (M.clef) clef = M.clef;
        M.clefNow = clef;
        M.voices.forEach(function (v, vi) {
          var pos = 0;
          v.forEach(function (it, ii) {
            if (it.measureRest) it.dur = M.len;
            it.start = pos; pos += it.dur;
            it.voice = vi; it.staff = S.id; it.bar = M.bar; it.m = mi;
            it.id = S.id + '-' + M.bar + '-' + (vi + 1) + '-' + ii;
            it.notes.forEach(function (n, k) {
              n.id = it.id + '-' + k; n.item = it; n.tiedFrom = null; n.tiedTo = null; n.acc = null; n.courtesy = false;
              notes[n.id] = n;
            });
          });
        });
      });
      // chords were sorted; keep the written order for fingering in origOrder (already set before sort? recompute)
    });
    staves.forEach(function (S) {
      var f = doc.fingering && doc.fingering[S.id];
      if (f) parseFingering(f, S.measures, { err: E }, S.id);
    });
    if (doc.fingering) Object.keys(doc.fingering).forEach(function (k) { if (!sv[k]) E('fingering for "' + k + '" but there is no ' + k + ' staff'); });

    // ties
    staves.forEach(function (S) {
      S.measures.forEach(function (M, mi) {
        M.voices.forEach(function (v, vi) {
          v.forEach(function (it, ii) {
            it.notes.forEach(function (n) {
              if (!n.tie) return;
              var next = nextItem(S, mi, vi, ii, n);
              if (!next) { E('a tie ~ on ' + n.letter + accTxt(n.alter) + n.octave + ' has no next note to tie to', M.bar, it.tok, S.id); n.tie = false; return; }
              var tgt = null;
              next.notes.forEach(function (x) { if (x.midi === n.midi) tgt = x; });
              if (!tgt) {
                if (it.kind === 'chord' && it.notes.length > 1 && !n.ownTie) { n.tie = false; return; }
                E('a tie ~ on ' + n.letter + accTxt(n.alter) + n.octave + ' must go to the same pitch, but the next note is ' + (next.kind === 'rest' ? 'a rest' : next.tok), M.bar, it.tok, S.id);
                n.tie = false; return;
              }
              if (tgt.step !== n.step) W('a tie joins ' + n.letter + accTxt(n.alter) + n.octave + ' to ' + tgt.letter + accTxt(tgt.alter) + tgt.octave + ' (same sound, different spelling)', M.bar, it.tok, S.id);
              n.tiedTo = tgt.id; tgt.tiedFrom = n.id;
            });
          });
        });
      });
    });
    function nextItem(S, mi, vi, ii, n) {
      var M = S.measures[mi], v = M.voices[vi];
      if (ii + 1 < v.length) return v[ii + 1].kind === 'rest' ? v[ii + 1] : v[ii + 1];
      var N = S.measures[mi + 1];
      if (!N) return null;
      // first item of the same voice in the next bar, or a voice whose first note has this pitch
      var cands = N.voices.map(function (vv) { return vv[0]; }).filter(Boolean);
      var match = cands.filter(function (c) { return c.notes.some(function (x) { return x.midi === n.midi; }); })[0];
      return match || N.voices[Math.min(vi, N.voices.length - 1)][0] || null;
    }
    function accTxt(a) { return a === 1 ? '#' : a === -1 ? 'b' : a === 2 ? '##' : a === -2 ? 'bb' : ''; }

    // slurs: balance check per staff
    staves.forEach(function (S) {
      var open = 0;
      S.measures.forEach(function (M) {
        M.voices.forEach(function (v) { v.forEach(function (it) {
          if (it.slurStart) { if (open > 0 && M.voices.length === 1) W('a slur ( starts before the previous one ends )', M.bar, it.tok, S.id); open++; }
          if (it.slurEnd) { if (open <= 0) W('a slur ) ends without a start (', M.bar, it.tok, S.id); else open--; }
        }); });
      });
      if (open > 0) W('a slur ( is never closed )', null, null, S.id);
    });

    computeAccidentals(staves, key);

    // events in written order (one per attack, ties merged)
    var events = [], dynAt = dynamicsMap(measures, TPQ * 4 / time.den);
    staves.forEach(function (S) {
      S.measures.forEach(function (M, mi) {
        if (!measures[mi]) return;
        M.voices.forEach(function (v) { v.forEach(function (it) {
          if (it.kind === 'rest') return;
          it.notes.forEach(function (n) {
            if (n.tiedFrom) return;
            var dur = it.dur, ids = [n.id], cur = n;
            while (cur.tiedTo) { cur = notes[cur.tiedTo]; dur += cur.item.dur; ids.push(cur.id); }
            var st = measures[mi].start + it.start;
            events.push({ midi: n.midi, start: st, dur: dur, hand: S.hand, ids: ids, vel: dynAt(mi, it.start), m: mi });
          });
        }); });
      });
    });
    events.sort(function (a, b) { return a.start - b.start || a.midi - b.midi; });

    var model = {
      meta: meta, key: key, time: time, measureTicks: measureTicks, beatTicks: beatTicks, pickupTicks: pickupTicks,
      tempo: tempo, beat: beat, staves: staves, measures: measures, notes: notes, events: events, total: t,
      barOffset: barOffset, errors: errors, warnings: warnings, ok: !errors.length, TPQ: TPQ
    };
    model.range = events.length ? { lo: Math.min.apply(null, events.map(function (e) { return e.midi; })), hi: Math.max.apply(null, events.map(function (e) { return e.midi; })) } : { lo: 60, hi: 72 };
    if (opts.strict && errors.length) throw new Error(errors.map(fmtErr).join('\n'));
    return model;
  }

  function dynamicsMap(measures, unit) {
    // velocity in effect at (measure, offset): the last dynamic at or before it ("f@3" = beat 3 in count units)
    var pts = [];
    measures.forEach(function (M) {
      var d = M.marks && M.marks.dyn;
      if (d === undefined) return;
      [].concat(d).forEach(function (x) {
        var p = String(x).split('@'), name = p[0].trim(), at = p[1] ? Math.max(0, parseFloat(p[1]) - 1) : 0;
        if (DYN[name] === undefined) return;
        pts.push({ m: M.index, off: Math.round(at * unit), v: DYN[name] });
      });
    });
    pts.sort(function (a, b) { return a.m - b.m || a.off - b.off; });
    return function (mi, off) {
      var v = DYN.mf;
      for (var i = 0; i < pts.length; i++) {
        var P = pts[i];
        if (P.m < mi || (P.m === mi && P.off <= off)) v = P.v; else break;
      }
      return v;
    };
  }

  // which accidental to print for every note: key signature, earlier notes in the bar (per staff line/space), notes
  // tied over the barline, courtesy accidentals (after an accidental in the previous bar, or in another octave this bar)
  function computeAccidentals(staves, key) {
    staves.forEach(function (S) {
      var prevBar = {}; // position ("F4") -> alteration left in effect at the end of the previous bar, when not the key's
      S.measures.forEach(function (M) {
        var items = [];
        M.voices.forEach(function (v) { v.forEach(function (it) { if (it.kind !== 'rest') items.push(it); }); });
        items.sort(function (a, b) { return a.start - b.start || a.voice - b.voice; });
        var state = {}, mustRestate = {}, i = 0;
        function keyAlt(letter) { return key.alters[letter] || 0; }
        while (i < items.length) {
          var j = i, group = [];
          while (j < items.length && items[j].start === items[i].start) { group.push(items[j]); j++; }
          var all = [], updates = [];
          group.forEach(function (it) { it.notes.forEach(function (n) { all.push(n); }); });
          all.forEach(function (n) {
            var pos = n.letter + n.octave, ka = keyAlt(n.letter);
            var inEffect = state.hasOwnProperty(pos) ? state[pos] : ka;
            n.acc = null; n.courtesy = false;
            if (n.tiedFrom) {
              if (n.item.start === 0 && n.alter !== ka) mustRestate[pos] = true; // tied over the barline: restate later
              return;
            }
            var clash = all.some(function (o) { return o !== n && o.letter === n.letter && o.octave === n.octave && o.alter !== n.alter; });
            if (n.alter !== inEffect) n.acc = ACC_TXT[n.alter];
            else if (mustRestate[pos] || clash) { n.acc = ACC_TXT[n.alter]; n.courtesy = n.alter === ka; }
            else if (n.forceNat && n.alter === 0) { n.acc = 'n'; n.courtesy = true; }
            else if (!state.hasOwnProperty(pos) && prevBar.hasOwnProperty(pos) && prevBar[pos] !== n.alter) { n.acc = ACC_TXT[n.alter]; n.courtesy = true; }
            else if (!state.hasOwnProperty(pos) && Object.keys(state).some(function (q) {
              return q.charAt(0) === n.letter && q !== pos && state[q] !== ka && state[q] !== n.alter; })) { n.acc = ACC_TXT[n.alter]; n.courtesy = true; }
            updates.push([pos, n.alter]);
          });
          updates.forEach(function (u) { state[u[0]] = u[1]; delete mustRestate[u[0]]; });
          i = j;
        }
        prevBar = {};
        Object.keys(state).forEach(function (q) { if (state[q] !== keyAlt(q.charAt(0))) prevBar[q] = state[q]; });
      });
    });
  }

  /* ---------- performance order and timeline ---------- */
  function playOrder(model) {
    var ms = model.measures, n = ms.length, out = [], i = 0, sectionStart = 0, pass = 1, used = {}, guard = 0, lastEnding = 0;
    var hasRep = ms.some(function (M) { return M.marks && (M.marks.repeat || M.marks.ending); });
    if (!hasRep) return ms.map(function (M) { return M.index; });
    while (i < n && guard++ < 100000) {
      var mk = ms[i].marks || {}, rep = mk.repeat, end = +mk.ending || 0;
      if (!end && lastEnding === 2) { pass = 1; sectionStart = i; }
      if ((rep === 'start' || rep === 'both') && i !== sectionStart) { sectionStart = i; pass = 1; }
      if (end && end !== pass) { i++; continue; }
      out.push(i); lastEnding = end;
      if (rep === 'end' || rep === 'both') {
        if (!used[i]) { used[i] = true; pass = 2; lastEnding = 0; i = sectionStart; continue; }
        pass = 1; sectionStart = i + 1;
      }
      i++;
    }
    return out;
  }

  function performance(model, opts) {
    opts = opts || {};
    var order;
    if (opts.from != null || opts.to != null) {
      var a = Math.max(0, opts.from || 0), b = Math.min(model.measures.length - 1, opts.to == null ? model.measures.length - 1 : opts.to);
      order = []; for (var k = a; k <= b; k++) order.push(k);
    } else order = opts.repeats === false ? model.measures.map(function (M) { return M.index; }) : playOrder(model);
    var hands = opts.hands || { rh: true, lh: true };
    var byM = {};
    model.events.forEach(function (e) { (byM[e.m] = byM[e.m] || []).push(e); });
    var colsByM = {};
    model.staves.forEach(function (S) {
      S.measures.forEach(function (M, mi) {
        M.voices.forEach(function (v) { v.forEach(function (it) {
          if (it.kind === 'rest') return;
          var C = (colsByM[mi] = colsByM[mi] || {});
          var c = (C[it.start] = C[it.start] || []);
          it.notes.forEach(function (n) { c.push({ id: n.id, midi: n.midi, hand: S.hand, dur: it.dur, tied: !!n.tiedFrom }); });
        }); });
      });
    });
    var t = 0, measures = [], events = [], columns = [];
    order.forEach(function (mi) {
      var M = model.measures[mi];
      measures.push({ index: mi, bar: M.bar, start: t, len: M.len });
      (byM[mi] || []).forEach(function (e) {
        if (!hands[e.hand]) return;
        events.push({ midi: e.midi, start: t + (e.start - M.start), dur: e.dur, hand: e.hand, ids: e.ids, vel: e.vel, m: mi });
      });
      var C = colsByM[mi] || {};
      Object.keys(C).map(Number).sort(function (x, y) { return x - y; }).forEach(function (off) {
        columns.push({ t: t + off, m: mi, off: off, notes: C[off] });
      });
      t += M.len;
    });
    return { order: order, measures: measures, events: events, columns: columns, total: t };
  }

  function fmtErr(e) {
    return (e.staff ? e.staff + ' ' : '') + (e.bar != null ? 'bar ' + e.bar + (e.token ? ' (' + e.token + ')' : '') + ': ' : '') + e.msg;
  }

  var api = {
    TPQ: TPQ, parse: parse, parseYaml: parseYaml, parseStaff: parseStaff, tokenize: tokenize, keyInfo: keyInfo,
    parsePitch: parsePitch, midiToName: midiToName, nameOf: nameOf, accSym: accSym, freq: freq,
    performance: performance, playOrder: playOrder, formatError: fmtErr, DYN: DYN, frac: frac
  };
  root.TRBMusic = root.TRBMusic || {};
  root.TRBMusic.song = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
