#!/usr/bin/env node
/* Check every song in data/music/songs/ (or the files given) with the same parser the song pages use
   (static/music/kit/song.js). Prints errors (the file can't be played as written) and warnings (worth a look).
   Exit code 1 when any file has an error.

   usage: node scripts/music/check-songs.js [-v] [--notes] [--pyyaml] [file.yaml ...]
     -v        also list notes outside the key signature (to double-check accidentals) and each file's summary
     --notes   print every bar in letter names, staff by staff (for reading a piece back against its source)
     --pyyaml  also read each file with Python's PyYAML and make sure it agrees with the song parser

   Checks: the YAML itself, required fields (slug, title, composer, level, key, time, tempo, about, source; order,
   pickup and skills are warned about), the slug matching the file name, key / time / tempo / beat / level values,
   every token (pitch syntax, durations, chords, rests, ties, slurs, tuplets, two voices), bar lengths against the
   time signature (a pickup and its matching last bar allowed), the same number of bars in both staves, ties going to
   the same pitch, fingering counts and finger numbers, marks on bars that exist, the piano's range (A0–C8),
   and (as warnings) hand spans wider than a tenth in one chord, and voices crossing below/above each other.

   Guitar, ukulele and banjo songs (a file with `instrument:`) are read with static/music/fret/core.js (the same code
   the song pages run), which adds: the instrument, tuning and capo; every tab position exists on that instrument
   (strings, frets, the banjo's short 5th string); notes written as pitches can be played and get a position; notes
   that sound together are on different strings and one hand can fret them (at most four fingers, five frets); ties
   stay on one string; hammer-ons go up and pull-offs down on the same string; the right-hand letters (pick:) match
   the notes; the chord line has a chord for every beat of every bar, every chord name is known and has a playable
   shape (shapes: overrides must spell their chord); the strum or picking pattern adds up to a bar. With
   `melody_of: <slug>` (and melody_octave: -1 / 0 / 1) the tune is compared with that song's top staff: at every
   note of the other song, the same pitch (moved by the octaves) must start at the same moment in the tab.
     --tab     print every bar as string:fret, with the chords (to read a tab back against its source) */
'use strict';
const fs = require('fs');
const path = require('path');
const S = require(path.join(__dirname, '../../static/music/kit/song.js'));
const FR = require(path.join(__dirname, '../../static/music/fret/core.js'));

const args = process.argv.slice(2);
const verbose = args.includes('-v');
const showNotes = args.includes('--notes');
const pyCheck = args.includes('--pyyaml');
const showTab = args.includes('--tab'); // also read each file with Python's PyYAML (what Hugo-style YAML gives) and compare
let files = args.filter(a => !a.startsWith('-'));
const dir = path.join(__dirname, '../../data/music/songs');
if (!files.length) {
  if (!fs.existsSync(dir)) { console.log('No folder ' + dir); process.exit(0); }
  files = fs.readdirSync(dir).filter(f => /\.ya?ml$/.test(f)).sort().map(f => path.join(dir, f));
}
if (!files.length) { console.log('No song files yet in ' + dir); process.exit(0); }

let nErr = 0, nWarn = 0;
const ACC = { '-2': 'bb', '-1': 'b', '0': '', '1': '#', '2': '##' };
const nm = n => n.letter + ACC[n.alter] + n.octave;

for (const f of files) {
  const base = path.basename(f).replace(/\.ya?ml$/, '');
  const text = fs.readFileSync(f, 'utf8');
  let doc0 = {};
  try { doc0 = S.parseYaml(text); } catch (e) { doc0 = {}; }
  const fretted = doc0 && doc0.instrument != null;
  const m = fretted ? FR.parseSong(text) : S.parse(text);
  const errs = m.errors.map(e => S.formatError(e));
  const warns = m.warnings.map(e => S.formatError(e));
  if (m.meta.slug && m.meta.slug !== base) errs.push('slug "' + m.meta.slug + '" should match the file name "' + base + '"');
  if (/^\s*beat:\s*4\.\s*$/m.test(text)) warns.push('write beat: "4." with quotes (unquoted, other YAML readers turn it into the number 4)');
  if (/\t/.test(text)) warns.push('the file has tab characters; use spaces');
  if (pyCheck) {
    try {
      const py = require('child_process').execFileSync('python3', ['-I', '-c', 'import yaml,json,sys; print(json.dumps(yaml.safe_load(open(sys.argv[1])), default=str))', f], { encoding: 'utf8' });
      const norm = o => Array.isArray(o) ? o.map(norm) : o && typeof o === 'object' ? Object.keys(o).sort().reduce((r, k) => (r[k] = norm(o[k]), r), {}) : o;
      const a = norm(JSON.parse(py)), b = norm(S.parseYaml(text));
      if (a && typeof a.beat === 'number' && String(b.beat).indexOf('.') >= 0) a.beat = b.beat;
      if (JSON.stringify(a) !== JSON.stringify(b)) errs.push('PyYAML reads this file differently from the song parser: check quotes and indentation');
    } catch (e) { warns.push('--pyyaml: could not run python3 with PyYAML (' + e.message.split('\n')[0] + ')'); }
  }
  const extra = [];
  if (fretted && m.fret) {
    const Fd = m.fret;
    if (doc0.draft) warns.push('draft: true (checked, but no page is made until this is removed)');
    // the tune against another song
    if (doc0.melody_of) {
      const other = path.join(path.dirname(f), doc0.melody_of + '.yaml');
      if (!fs.existsSync(other)) errs.push('melody_of: no file ' + doc0.melody_of + '.yaml');
      else {
        const o = S.parse(fs.readFileSync(other, 'utf8')), shift = 12 * (+doc0.melody_octave || 0);
        const top = o.staves[0];
        const want = [];
        top.measures.forEach((M, mi) => M.voices[0].forEach(it => { if (it.kind === 'rest') return; const n = it.notes[it.notes.length - 1]; if (n.tiedFrom) return; want.push({ t: o.measures[mi].start + it.start, midi: n.midi + shift, bar: M.bar, tok: it.tok }); }));
        const have = {};
        Object.keys(Fd.notes).forEach(id => { const n = m.notes[id]; if (!n || n.tiedFrom) return; const it = n.item, t = m.measures[it.m].start + it.start; (have[t] = have[t] || []).push(Fd.notes[id].midi); });
        let bad = 0;
        if (o.total !== m.total) errs.push('melody_of ' + doc0.melody_of + ': the songs have different lengths (' + S.frac(o.total) + ' and ' + S.frac(m.total) + ')');
        want.forEach(w => { if (!(have[w.t] || []).includes(w.midi)) { bad++; if (bad <= 8) errs.push('melody_of ' + doc0.melody_of + ': bar ' + w.bar + ' (' + w.tok + ') should sound ' + S.midiToName(w.midi) + ' here, but the tab has ' + ((have[w.t] || []).map(x => S.midiToName(x)).join(' ') || 'nothing starting') + ' at that moment'); } });
        if (verbose && !bad) extra.push('  melody matches ' + doc0.melody_of + ' at all ' + want.length + ' notes' + (shift ? ' (' + (shift > 0 ? '+' : '') + shift / 12 + ' octave)' : ''));
      }
    }
    if (verbose) extra.push('  ' + Fd.inst.name + ', ' + Fd.tun.name + (Fd.capo ? ', capo ' + Fd.capo : '') + '; chords: ' + Object.keys(Fd.shapes).map(k => k + ' ' + (Fd.shapes[k] ? FR.shapeText(Fd.shapes[k].frets, Fd.instrument) : '?')).join(', ') + (Fd.pattern ? '; pattern: ' + Fd.pattern.text.trim() : ''));
    if (showTab) {
      m.staves[0].measures.forEach((M, mi) => {
        const vs = M.voices.map(v => v.map(it => {
          const d = '/' + (it.measureRest ? 'bar' : it.base + '.'.repeat(it.dots));
          if (it.kind === 'rest') return 'rest' + d;
          const ps = it.notes.map(n => { const x = Fd.notes[n.id]; return x ? x.s + ':' + (x.dead ? 'x' : x.fret) + '(' + S.midiToName(x.midi) + ')' : '?'; });
          return (ps.length > 1 ? '[' + ps.join(' ') + ']' : ps[0]) + d;
        }).join(' '));
        const ch = Fd.chords.filter(c => c.m === mi).map(c => c.name + (c.dur !== m.measures[mi].len ? ':' + S.frac(c.dur).replace(/ quarter notes?/, 'q') : '')).join(' ');
        extra.push('    bar ' + String(M.bar).padStart(3) + ': ' + vs.join('  &  ') + (ch ? '   [' + ch + ']' : ''));
      });
    }
  }
  // hand spans and voice crossing (piano only)
  if (!fretted) m.staves.forEach(St => St.measures.forEach(M => {
    M.voices.forEach(v => v.forEach(it => {
      if (it.kind === 'chord') {
        const lo = it.notes[0], hi = it.notes[it.notes.length - 1];
        const span = hi.step - lo.step + 1; // a tenth = 10 letter names
        if (span > 10) warns.push(St.id + ' bar ' + M.bar + ' (' + it.tok + '): a span of ' + span + ' letter names (' + nm(lo) + '–' + nm(hi) + ') is wider than a tenth for one hand');
      }
    }));
    if (M.voices.length === 2) {
      const a = M.voices[0], b = M.voices[1];
      a.forEach(x => b.forEach(y => {
        if (x.kind === 'rest' || y.kind === 'rest') return;
        if (x.start < y.start + y.dur && y.start < x.start + x.dur) {
          const lowA = Math.min(...x.notes.map(n => n.midi)), highB = Math.max(...y.notes.map(n => n.midi));
          if (highB > lowA) warns.push(St.id + ' bar ' + M.bar + ': voice 2 (' + y.tok + ') goes above voice 1 (' + x.tok + ')');
        }
      }));
    }
  }));
  const dur = S.performance(m).total / S.TPQ * 60 / (m.tempo * m.beatTicks / S.TPQ);
  const status = errs.length ? 'ERRORS' : warns.length ? 'ok, with warnings' : 'ok';
  console.log(path.basename(f) + ': ' + status + (verbose ? '  [' + (fretted ? (doc0.instrument + ', ') : '') + (m.meta.level || '?') + ', ' + m.key.label + ', ' + m.time.str + ', ' + m.measures.length + ' bars written, ' + m.events.length + ' notes, about ' + Math.round(dur) + ' s at tempo ' + m.tempo + ']' : ''));
  errs.forEach(e => console.log('  error: ' + e));
  warns.forEach(w => console.log('  warning: ' + w));
  extra.forEach(x => console.log(x));
  nErr += errs.length; nWarn += warns.length;
  if (verbose) {
    const out = [];
    Object.values(m.notes).forEach(n => {
      if (n.tiedFrom) return;
      const ka = m.key.alters[n.letter] || 0;
      if (n.alter !== ka) out.push(n.item.staff + ' bar ' + n.item.bar + ' ' + nm(n));
    });
    if (out.length) console.log('  outside the key of ' + m.key.label + ' (check these): ' + out.join(', '));
  }
  if (showNotes) {
    m.staves.forEach(St => {
      console.log('  ' + St.id + ':');
      St.measures.forEach(M => {
        // naturals that cancel the key signature are shown as n (Cn5 in D major), tuplets as {3 … }
        const kn = n => (n.alter === 0 && m.key.alters[n.letter] ? n.letter + 'n' + n.octave : nm(n));
        const vs = M.voices.map(v => v.map(it => {
          const d = '/' + (it.measureRest ? 'bar' : it.base + '.'.repeat(it.dots));
          let s = it.kind === 'rest' ? 'rest' + d : (it.notes.length > 1 ? '[' + it.notes.map(kn).join(' ') + ']' : kn(it.notes[0])) + d + (it.notes.some(n => n.tiedTo) ? '~' : '');
          if (it.tuplet && it.tuplet.first) s = '{' + it.tuplet.n + ' ' + s;
          if (it.tuplet && it.tuplet.last) s += '}';
          return s;
        }).join(' '));
        console.log('    bar ' + String(M.bar).padStart(3) + ': ' + vs.join('  &  '));
      });
    });
  }
}
console.log('\n' + files.length + ' file' + (files.length === 1 ? '' : 's') + ', ' + nErr + ' error' + (nErr === 1 ? '' : 's') + ', ' + nWarn + ' warning' + (nWarn === 1 ? '' : 's') + '.');
process.exit(nErr ? 1 : 0);
