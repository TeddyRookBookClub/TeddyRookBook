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
   and (as warnings) hand spans wider than a tenth in one chord, and voices crossing below/above each other. */
'use strict';
const fs = require('fs');
const path = require('path');
const S = require(path.join(__dirname, '../../static/music/kit/song.js'));

const args = process.argv.slice(2);
const verbose = args.includes('-v');
const showNotes = args.includes('--notes');
const pyCheck = args.includes('--pyyaml'); // also read each file with Python's PyYAML (what Hugo-style YAML gives) and compare
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
  const m = S.parse(text);
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
  // hand spans and voice crossing
  m.staves.forEach(St => St.measures.forEach(M => {
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
  console.log(path.basename(f) + ': ' + status + (verbose ? '  [' + (m.meta.level || '?') + ', ' + m.key.label + ', ' + m.time.str + ', ' + m.measures.length + ' bars written, ' + m.events.length + ' notes, about ' + Math.round(dur) + ' s at tempo ' + m.tempo + ']' : ''));
  errs.forEach(e => console.log('  error: ' + e));
  warns.forEach(w => console.log('  warning: ' + w));
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
