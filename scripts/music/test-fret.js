#!/usr/bin/env node
/* Tests for the fretted-instrument kit (static/music/fret/: core.js, pitch.js, sound.js). No browser needed.
   usage: node scripts/music/test-fret.js [-v]      exit code 1 when a test fails

   1. chord spellings (every quality, sharps and flats, slash chords)
   2. the built-in table of first-position shapes: every shape spells its chord, is playable by the fingering rule,
      and (reported) whether the voicing finder also finds it
   3. the voicing finder: 12 roots x every quality x guitar / ukulele / banjo in their standard tunings: every shape it
      returns spells the chord, is playable (four fingers, frets at most 4 apart), guitar shapes have the root (or
      the slash bass) lowest; coverage is reported
   4. chord naming (reverse lookup) on every table shape
   5. tab parsing: string:fret, pitches placed by the position rule, @string, chords, techniques, picks, and the
      errors for things that can't be played
   6. timing: bar lengths, the chord line, the strum pattern's events
   7. pitch detection: synthesized plucks (partials with inharmonicity, noise, decay) and the kit's own
      Karplus-Strong voices on every string of every tuning of all three instruments, at 44.1 and 48 kHz, read
      early and late in the note: within ±3 cents
*/
'use strict';
const path = require('path');
const S = require(path.join(__dirname, '../../static/music/kit/song.js'));
const F = require(path.join(__dirname, '../../static/music/fret/core.js'));
const P = require(path.join(__dirname, '../../static/music/fret/pitch.js'));
const SND = require(path.join(__dirname, '../../static/music/fret/sound.js'));
const verbose = process.argv.includes('-v');
let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) passes++; else { fails++; console.log('  FAIL ' + msg); } }
function section(t) { console.log('\n' + t); }

/* 1 */
section('1. chord spellings');
const SP = {
  C: 'C E G', Cm: 'C Eb G', C7: 'C E G Bb', Cmaj7: 'C E G B', Cm7: 'C Eb G Bb', Csus2: 'C D G', Csus4: 'C F G', Cadd9: 'C E G D',
  Cdim: 'C Eb Gb', Cdim7: 'C Eb Gb Bbb', Cm7b5: 'C Eb Gb Bb', Caug: 'C E G#', C6: 'C E G A', Cm6: 'C Eb G A', C9: 'C E G Bb D', Cm9: 'C Eb G Bb D',
  C7sus4: 'C F G Bb', C5: 'C G', 'F#m': 'F# A C#', Bb7: 'Bb D F Ab', Eb: 'Eb G Bb', Abmaj7: 'Ab C Eb G', 'C#dim7': 'C# E G Bb',
  Bm7b5: 'B D F A', E5: 'E B', 'G/B': 'G B D', 'D/F#': 'D F# A', 'C/G': 'C E G', 'Am/G': 'A C E G', 'F#7': 'F# A# C# E', Gbm: 'Gb Bbb Db', 'D#aug': 'D# F## A##',
  'B°': 'B D F', 'GΔ': 'G B D F#', 'E-': 'E G B', 'Asus': 'A D E', 'A+': 'A C# E#'
};
Object.keys(SP).forEach(k => { const c = F.parseChord(k); ok(c && c.notes.join(' ') === SP[k], k + ' should be ' + SP[k] + ', got ' + (c ? c.notes.join(' ') : 'null')); });
ok(F.parseChord('H7') === null && F.parseChord('Cxyz') === null, 'unknown chords are null');
ok(F.parseChord('G/B').bassPc === 11, 'slash bass pitch class');

/* 2 */
section('2. the table of common shapes');
const STD = [['guitar', 'standard'], ['ukulele', 'standard'], ['banjo', 'openg']];
let tabN = 0, tabFound = 0; const misses = [];
STD.forEach(([inst, tun]) => {
  const tab = F.commonShapes(inst, tun);
  Object.keys(tab).forEach(name => tab[name].forEach(v => {
    tabN++;
    ok(!!F.chordCheck(v.frets, name, inst, tun, 0), inst + ' ' + name + ' ' + F.shapeText(v.frets) + ' spells its chord');
    const fg = F.fingersFor(v.frets, inst);
    ok(fg.ok, inst + ' ' + name + ' ' + F.shapeText(v.frets) + ' is playable by the fingering rule');
    const fingered = v.fingers.filter(Boolean).length, fretted = v.frets.filter((f, i) => f > 0).length;
    ok(fingered === fretted, inst + ' ' + name + ': every fretted string has a finger in the table');
    if (F.findVoicings(name, inst, tun, { limit: 0 }).some(x => x.frets.join() === v.frets.join())) tabFound++; else misses.push(inst + ' ' + name + ' ' + F.shapeText(v.frets, inst));
  }));
});
ok(tabFound === tabN, 'the finder finds every table shape');
console.log('  ' + tabN + ' shapes in the table; the finder finds ' + tabFound + (misses.length ? ' (not: ' + misses.join(', ') + ')' : ''));

/* 3 */
section('3. the voicing finder');
const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
STD.forEach(([inst, tun]) => {
  let total = 0, have = 0, shapes = 0; const none = [];
  const I = F.instrument(inst);
  ROOTS.forEach(r => Object.keys(F.QUALITIES).forEach(q => {
    const name = r + q, ch = F.parseChord(name); total++;
    const vs = F.shapesFor(ch, inst, tun, { limit: 12 });
    if (vs.length) have++; else none.push(name);
    vs.forEach(v => {
      shapes++;
      const facts = F.chordCheck(v.frets, ch, inst, tun, 0);
      ok(!!facts, inst + ' ' + name + ' ' + F.shapeText(v.frets) + ' spells the chord');
      if (!v.common) {
        const fg = F.fingersFor(v.frets, inst);
        ok(fg.ok, inst + ' ' + name + ' ' + F.shapeText(v.frets) + ' is playable');
        const fr = v.frets.filter((f, i) => f > 0 && !(I.short && i === 0));
        ok(!fr.length || Math.max(...fr) - Math.min(...fr) <= 4, inst + ' ' + name + ' ' + F.shapeText(v.frets) + ' spans at most 5 frets');
      }
      if (I.bassRoot && facts) ok(facts.bassPc === ch.bassPc, inst + ' ' + name + ' ' + F.shapeText(v.frets) + ' has the root in the bass');
    });
    // slash chords on the guitar
  }));
  console.log('  ' + I.name + ': ' + have + ' of ' + total + ' chords (12 roots x ' + Object.keys(F.QUALITIES).length + ' kinds) have shapes within 12 frets, ' + shapes + ' shapes checked' + (none.length ? '; none for: ' + none.join(' ') : ''));
  ok(have / total > 0.95, I.name + ' finder coverage above 95%');
});
['G/B', 'D/F#', 'C/G', 'Am/G', 'F/C'].forEach(n => { const vs = F.shapesFor(n, 'guitar'); ok(vs.length && vs.every(v => F.chordCheck(v.frets, n, 'guitar', 'standard', 0).bassPc === F.parseChord(n).bassPc), 'guitar ' + n + ': shapes with ' + F.parseChord(n).bass + ' in the bass'); });
ok(F.shapesFor('G', 'guitar')[0].frets.join('') === '320003', 'the first G on guitar is the common 320003');
ok(F.shapeText(F.shapesFor('C', 'ukulele')[0].frets) === '0003', 'the first C on ukulele is 0003');
ok(F.shapeText(F.shapesFor('C', 'banjo')[0].frets, 'banjo') === '2012', 'the first C on banjo is 2012');
// the standard table comes first in other tunings where it is still valid
ok(F.shapeText(F.shapesFor('Em', 'ukulele', 'lowg')[0].frets) === '0432' && F.shapeText(F.shapesFor('B7', 'ukulele', 'lowg')[0].frets) === '2322', 'low-G ukulele: Em 0432 and B7 2322 first');
ok(F.shapeText(F.shapesFor('D', 'guitar', 'dropd')[0].frets) === 'xx0232' && !F.shapesFor('G', 'guitar', 'dropd').some(v => v.common && F.shapeText(v.frets) === '320003'), 'drop D keeps D xx0232 and drops G 320003 (its 6th string is no longer G)');
ok(F.findVoicings('Bdim', 'guitar').some(v => F.shapeText(v.frets) === 'x2343x'), 'the finder can leave out the first string (Bdim x2343x)');
ok(F.findVoicings('C', 'guitar', 'standard', { limit: 0 }).filter(v => v.frets[5] < 0).length <= F.findVoicings('C', 'guitar', 'standard', { limit: 0 }).length / 2, 'shapes without the first string do not flood the results');
ok(F.parseSong({ instrument: 'guitar', key: 'C', time: '4/4', tempo: 90, tab: 'R |', swing: 'true' }, { loose: true }).fret.swing === 2 / 3, 'swing: "true" means the usual swing');
// other tunings work through the finder
[['guitar', 'dropd', 'D'], ['guitar', 'openg', 'G'], ['guitar', 'opend', 'D'], ['ukulele', 'lowg', 'C'], ['ukulele', 'baritone', 'G'], ['banjo', 'doublec', 'C'], ['banjo', 'opend', 'D']].forEach(([i, t, c]) => {
  const vs = F.shapesFor(c, i, t); ok(vs.length > 0, i + ' ' + t + ': ' + c + ' has shapes');
  ok(vs[0].frets.every(f => f <= 0) || vs[0].minFret <= 5, i + ' ' + t + ': the first ' + c + ' is near the nut (' + F.shapeText(vs[0].frets, i) + ')');
});

/* 4 */
section('4. naming a chord from a shape');
let named = 0, nN = 0;
STD.forEach(([inst, tun]) => { const tab = F.commonShapes(inst, tun); Object.keys(tab).forEach(name => tab[name].forEach(v => { nN++; const ns = F.nameChord(v.frets, inst, tun).slice(0, 3).map(x => x.name); const hit = ns.some(x => F.parseChord(x).pcs.slice().sort().join() === F.parseChord(name).pcs.slice().sort().join() && x.replace(/\/.*/, '') === name.replace(/\/.*/, '')) || ns.includes(name); if (hit) named++; else console.log('  (named ' + inst + ' ' + name + ' ' + F.shapeText(v.frets, inst) + ' as ' + ns.join(', ') + ')'); })); });
ok(named / nN >= 0.95, 'reverse lookup names at least 95% of the table right in its top three (' + named + '/' + nN + ')');
console.log('  ' + named + ' of ' + nN + ' table shapes named right in the top three');
ok(F.nameChord(F.parseShape('x32010', 'guitar'), 'guitar')[0].name === 'C', 'x32010 is C');
ok(F.nameChord(F.parseShape('320003', 'guitar'), 'guitar')[0].name === 'G', '320003 is G');
ok(F.nameChord(F.parseShape('x02210', 'guitar'), 'guitar')[0].name === 'Am', 'x02210 is Am');
ok(F.nameChord(F.parseShape('2000', 'ukulele'), 'ukulele')[0].name === 'Am', 'uke 2000 is Am');
ok(F.nameChord(F.parseShape('0000', 'banjo'), 'banjo')[0].name === 'G', 'banjo open is G');
ok(F.nameChord([40, 47, 52, 56, 59, 64])[0].name === 'E', 'E major from pitches');

/* 5 */
section('5. tab parsing');
function song(o) { return F.parseSong(Object.assign({ slug: 't', title: 'T', composer: 'x', level: 'beginner', order: 1, key: 'G', time: '4/4', tempo: 90, pickup: 0, skills: ['x'], about: 'x', source: 'x' }, o)); }
let m = song({ instrument: 'guitar', tab: '3:0/4 3:2/4!h 2:0/4 2:1/4 | G3/4 A3/4 B3@3/4 [6:3 5:2 4:0 3:0 2:0 1:3]/4 |' });
ok(m.ok, 'a guitar tab parses: ' + m.errors.map(S.formatError).join('; '));
const ids = Object.keys(m.fret.notes);
const nt = id => m.fret.notes[id];
ok(nt('rh-1-1-0-0').s === 3 && nt('rh-1-1-0-0').fret === 0 && F.noteName(nt('rh-1-1-0-0').midi) === 'G3', '3:0 on guitar is G3 on string 3');
ok(nt('rh-1-1-1-0').tech.h, 'a hammer-on mark is kept');
ok(m.notes['rh-1-1-0-0'].midi === 55 + 12, 'guitar notation is written an octave above the sound (G3 sounds, G4 written)');
ok(nt('rh-2-1-0-0').s === 3 && nt('rh-2-1-0-0').fret === 0, 'G3 written as a pitch goes to the open 3rd string (first position)');
ok(nt('rh-2-1-1-0').s === 3 && nt('rh-2-1-1-0').fret === 2, 'A3 goes to string 3 fret 2');
ok(nt('rh-2-1-2-0').s === 3 && nt('rh-2-1-2-0').fret === 4, 'B3@3 is forced onto string 3 (fret 4)');
ok(ids.filter(i => i.indexOf('rh-2-1-3-') === 0).length === 6, 'a six-string chord gives six notes');
m = song({ instrument: 'guitar', tab: 'pos:5 A4/4 G4/4 C5/4 E4/4 |' });
ok(m.ok && nt === nt && m.fret.notes['rh-1-1-0-0'].fret === 5 && m.fret.notes['rh-1-1-1-0'].s === 2 && m.fret.notes['rh-1-1-1-0'].fret === 8, 'pos:5 moves the position rule up the neck (A4 at 1:5, G4 at 2:8)');
ok(m.fret.notes['rh-1-1-3-0'].fret === 0, 'open strings always count as inside the position');
m = song({ instrument: 'banjo', key: 'G', tab: '5:0/4 5:7/4 4:0/4 G4/4 |' });
ok(m.ok && F.noteName(m.fret.notes['rh-1-1-0-0'].midi) === 'G4', 'banjo 5th string open is G4');
ok(F.noteName(m.fret.notes['rh-1-1-1-0'].midi) === 'A4', 'banjo 5th string fret 7 is A4');
ok(m.fret.notes['rh-1-1-3-0'].s === 5 && m.fret.notes['rh-1-1-3-0'].fret === 0, 'G4 as a pitch on banjo goes to the open 5th string');
m = song({ instrument: 'banjo', tab: '5:3/4 7:0/4 [3:2 3:4]/4 4:0/4 |' });
ok(!m.ok && m.errors.some(e => /5th string starts at fret 6/.test(e.msg)) && m.errors.some(e => /string 7 does not exist/.test(e.msg)) && m.errors.some(e => /two notes on string 3/.test(e.msg)), 'impossible banjo positions are errors');
m = song({ instrument: 'guitar', tab: '3:4/4 3:2/4!h 2:0/4 2:3/4!p |' });
ok(m.errors.some(e => /hammer-on goes to a higher fret/.test(e.msg)) && m.errors.some(e => /pull-off goes to a lower fret/.test(e.msg)), 'a hammer-on down and a pull-off up are errors');
m = song({ instrument: 'guitar', tab: '[6:1 5:8 1:1]/1 |' });
ok(m.errors.some(e => /more than four fingers or a stretch/.test(e.msg)), 'an impossible stretch is an error');
m = song({ instrument: 'ukulele', capo: 2, tab: '3:0/4 2:0/4 1:0/4 4:0/4 |' });
ok(m.ok && F.noteName(m.fret.notes['rh-1-1-0-0'].midi) === 'D4', 'capo 2: the open 3rd string of a ukulele sounds D4');
m = song({ instrument: 'guitar', tab: '1:12/4!harm 2:7/4!harm 3:5/4!b 4:x/4 |' });
ok(m.ok && F.noteName(m.fret.notes['rh-1-1-0-0'].midi) === 'E5' && F.noteName(m.fret.notes['rh-1-1-1-0'].midi) === 'F#5', 'natural harmonics at frets 12 and 7');
ok(m.fret.notes['rh-1-1-2-0'].bendTo === m.fret.notes['rh-1-1-2-0'].midi + 2 && m.fret.notes['rh-1-1-3-0'].dead, 'a bend aims a whole step up; x is a muted note');
m = song({ instrument: 'banjo', tab: '3:0/8 2:0/8 1:0/8 5:0/8 3:0/8 2:0/8 1:0/8 5:0/8 |', pick: 'T I M T T I M T |' });
ok(m.ok && m.fret.notes['rh-1-1-3-0'].pick === 'T' && m.fret.notes['rh-1-1-2-0'].pick === 'M', 'pick letters attach to the notes');
m = song({ instrument: 'banjo', tab: '3:0/8 2:0/8 |', pick: 'T I M |' });
ok(!m.ok, 'too many pick letters is an error');
m = song({ instrument: 'guitar', tab: '<< E4/2 G4/2 & 6:0/2 5:2/2 >> |' });
ok(m.ok && m.fret.notes['rh-1-2-0-0'].s === 6, 'two voices: melody and bass');

/* 6 */
section('6. timing, chords and patterns');
m = song({ instrument: 'guitar', tab: 'R | R | R |', chords: 'G | C / G / | D7:4. G:8 C:2 |', pattern: 'folk' });
ok(m.ok, 'chords and a named pattern parse: ' + m.errors.map(S.formatError).join('; '));
const ch = m.fret.chords.filter(c => !c.cont);
ok(ch.map(c => c.name + ':' + c.dur / S.TPQ).join(' ') === 'G:4 C:2 G:2 D7:1.5 G:0.5 C:2', 'the chord line timing: ' + ch.map(c => c.name + ':' + c.dur / S.TPQ).join(' '));
let perf = S.performance(m), ev = F.accompaniment(m, perf);
ok(ev.length === 21, '7 strokes a bar for 3 bars (' + ev.length + ')');
ok(ev.filter(e => e.kind === 'miss').length === 3, 'the folk strum misses on beat 3');
const d1 = ev.find(e => e.kind === 'down');
ok(d1.notes.map(n => n.s).join('') === '654321' && F.noteName(d1.notes[0].midi) === 'G2', 'a down strum on G goes from the 6th string to the 1st, starting on G2');
const up = ev.find(e => e.kind === 'up');
ok(up.notes.every(n => n.s <= 4) && up.notes[0].s === 1, 'an up strum on the guitar hits the top strings, first string first');
m = song({ instrument: 'guitar', tab: 'R | R |', chords: 'C | G |', pattern: 'boomchuck' });
ev = F.accompaniment(m, S.performance(m));
const bass = ev.filter(e => e.kind === 'bass').map(e => e.notes[0].s + ':' + e.notes[0].fret);
ok(bass.join(' ') === '5:3 4:2 6:3 4:0', 'boom-chuck basses alternate: C on 5 then 4, G on 6 then 4 (' + bass.join(' ') + ')');
m = song({ instrument: 'banjo', tab: 'R |', chords: 'G |', pattern: 'forward' });
ev = F.accompaniment(m, S.performance(m));
ok(ev.map(e => e.finger + e.notes[0].s).join(' ') === 'T3 I2 M1 T5 I2 M1 T5 M1', 'a banjo forward roll: T I M on strings 3 2 1 5 …');
m = song({ instrument: 'guitar', tab: 'R |', chords: 'G C |' });
ok(m.ok && m.fret.chords[1].start === 2 * S.TPQ, 'two chords share a 4/4 bar evenly');
m = song({ instrument: 'guitar', tab: 'R |', chords: 'G C D |' });
ok(!m.ok, 'three chords cannot share a 4/4 bar in whole eighth notes: an error asks for lengths');
m = song({ instrument: 'guitar', tab: 'R | R |', chords: 'G |' });
ok(!m.ok && m.errors.some(e => /chords has 1 bars but the tab has 2/.test(e.msg)), 'the chord line must have every bar');
m = song({ instrument: 'guitar', tab: 'R |', chords: 'Gzz |' });
ok(!m.ok, 'an unknown chord name is an error');
m = song({ instrument: 'guitar', tab: 'R |', chords: 'F |', shapes: { F: 'xx3211' } });
ok(m.ok && F.shapeText(m.fret.shapes.F.frets) === 'xx3211', 'a shapes: override is used');
m = song({ instrument: 'guitar', tab: 'R |', chords: 'F |', shapes: { F: 'x32010' } });
ok(!m.ok, 'a shapes: override that does not spell the chord is an error');
m = song({ instrument: 'guitar', tab: 'R |', chords: 'G |', pattern: 'D/4 D/4 D/4 |' });
ok(!m.ok && m.errors.some(e => /adds up to 3/.test(e.msg)), 'a pattern bar must fill the bar');
const fs = require('fs');
['amazing-grace-banjo', 'ode-to-joy-guitar', 'twinkle-ukulele'].forEach(sl => {
  const f = path.join(__dirname, '../../data/music/songs/' + sl + '.yaml');
  if (!fs.existsSync(f)) return;
  const mm = F.parseSong(fs.readFileSync(f, 'utf8'));
  ok(mm.ok, sl + ' parses without errors');
  const pf = S.performance(mm);
  ok(pf.total === mm.total && mm.measures.every((M, i) => i === 0 && M.pickup ? M.len === mm.pickupTicks : M.len === mm.measureTicks || (i === mm.measures.length - 1 && mm.pickupTicks && M.len === mm.measureTicks - mm.pickupTicks)), sl + ': every bar is full (the last one completes the pickup)');
});

/* 7 */
section('7. pitch detection on synthesized plucks');
function rng(s) { let a = s >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function pluck(f, sr, secs, B, R) { // partials n*f*sqrt(1+B n^2) with a pluck-position spectrum, faster decay up high, noise
  const n = Math.floor(sr * secs), x = new Float32Array(n), p = 0.13 + R() * 0.1;
  for (let k = 1; k <= 16; k++) {
    const fk = k * f * Math.sqrt(1 + B * k * k); if (fk > sr * 0.45) break;
    const a = Math.abs(Math.sin(k * Math.PI * p)) / k, tau = 1.5 / (1 + 0.4 * k), ph = R() * 6.28;
    for (let i = 0; i < n; i++) x[i] += a * Math.exp(-i / sr / tau) * Math.sin(2 * Math.PI * fk * i / sr + ph);
  }
  let mx = 0; for (let i = 0; i < n; i++) mx = Math.max(mx, Math.abs(x[i]));
  for (let i = 0; i < n; i++) x[i] = x[i] / mx * 0.5 + (R() * 2 - 1) * 0.01; // noise 34 dB below the peak
  return x;
}
let frames = 0, worst = 0, bad = 0;
const t0 = Date.now();
for (const sr of [44100, 48000]) for (const inst of Object.keys(F.INSTRUMENTS)) for (const tid of Object.keys(F.INSTRUMENTS[inst].tunings)) {
  const T = F.tuning(inst, tid), R = rng(7), lo = Math.min(...T.midi.map(mm => 440 * Math.pow(2, (mm - 69) / 12)));
  T.midi.forEach((mm, i) => {
    const B = inst === 'guitar' ? (mm < 50 ? 1.5e-4 : 8e-5) : inst === 'banjo' ? 2e-4 : 5e-5;
    const cases = [-30, -7, 0, 4, 25].map(det => ({ kind: 'pluck', det, f: 440 * Math.pow(2, (mm - 69 + det / 100) / 12) }));
    cases.push({ kind: 'ks', det: 0, f: 440 * Math.pow(2, (mm - 69) / 12) });
    cases.forEach(c => {
      const x = c.kind === 'ks' ? SND.render(mm, { sr, inst, vel: 0.8 }) : pluck(c.f, sr, 1.2, B, R);
      [0.1, 0.35].forEach(at => {
        const s0 = Math.floor(at * sr), r = P.detect(x.subarray(s0, s0 + 4096), sr, { minHz: Math.max(30, lo * 0.55), maxHz: 1500 });
        frames++;
        const cents = r ? P.cents(r.freq, c.f) : 9999;
        worst = Math.max(worst, Math.abs(cents));
        if (Math.abs(cents) > 3) { bad++; console.log('  FAIL ' + sr + ' Hz ' + inst + ' ' + tid + ' string ' + (T.midi.length - i) + ' ' + T.notes[i] + ' ' + c.kind + ' ' + c.det + 'c at ' + at + ' s: ' + (r ? cents.toFixed(2) + ' cents' : 'no pitch')); }
      });
    });
  });
}
ok(bad === 0, 'every reading within ±3 cents');
console.log('  ' + frames + ' readings (every string of ' + Object.keys(F.INSTRUMENTS).map(k => Object.keys(F.INSTRUMENTS[k].tunings).length + ' ' + k + ' tunings').join(', ') + '; 5 detunings with inharmonicity and noise plus the kit\'s own pluck; 2 sample rates; early and late in the note): worst error ' + worst.toFixed(2) + ' cents, ' + bad + ' outside ±3 (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
const tr = P.tracker(); let last = null;
for (let k = 0; k < 6; k++) last = tr.push({ freq: 110 * (1 + (k % 2 ? 0.0006 : -0.0006)), clarity: 0.95 }, k * 0.05);
ok(last && Math.abs(P.cents(last.freq, 110)) < 1.1 && last.stable, 'the tracker smooths jitter (median)');
ok(P.detect(new Float32Array(4096), 48000) === null, 'silence gives no pitch');
const ns = P.nearestString(83.0, F.tuning('guitar').midi);
ok(ns.index === 0 && ns.cents > 0, '83 Hz is the low E string, a little sharp');

console.log('\n' + passes + ' passed, ' + fails + ' failed.');
process.exit(fails ? 1 : 0);
