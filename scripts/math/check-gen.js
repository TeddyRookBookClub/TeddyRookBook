#!/usr/bin/env node
/* The Ladders: check a course's problem generators (a course of ANY ladder: Math, Physics, Chemistry, …).

   node scripts/math/check-gen.js <courseKey> [topicId] [-n 300] [-v] [--lenient] [--gen file.js] [--topics file.json]

   Finds the course's ladder (data/ladders.yaml; data/<ladder>/courses.yaml), loads static/homeschool/calc/cas.js,
   static/math/core/{gen,tex,check}.js and static/<ladder>/gen/<courseKey>.js, reads data/<ladder>/topics/<courseKey>.json,
   and for every topic makes n problems (default 300) over seeds and levels 1-3:
     - the generator exists and returns a valid problem ({ q, a, steps }, a valid answer spec)
     - every $…$ in q, steps, hint, choices, part labels and the shown answer parses in tex.js (no unknown commands),
       and no lone "$" is left in the text (write \$ for money)
     - no NaN, Infinity, [object Object] or undefined (in the text or the answer spec), no float noise such as
       0.30000000000000004; no TeX artifacts in math: "+ -", "--", "1x", "-1x", "+ 0"
       (a problem may switch a check off when the text is meant that way: p.nolint = ['+ -', '--', '1x', '+ 0']);
       "1x" also covers a coefficient of 1 written other ways: "1 x", "\frac{1 x + 3}{2}", "\frac{1i}{4}", "1\cos t"
       ("1\,dx" and "1 \cdot \cos" are fine); --lenient prints those as warnings and lets the run pass
     - p.viz names a shared visual, one registered in static/<ladder>/viz/<courseKey>.js or in the ladder's kit
       static/<ladder>/viz/<ladder>.js (a typo fails; a ladder-prefixed name whose kit isn't built yet is a warning)
     - the generator is registered with its literal topic id (G('phys1.velocity', …)): pages find ready topics that way
     - outside Math: the canonical answer typed with the problem's unit ("12 N") is accepted too, and an answer with
       rtol or form 'sf' is checked with a clearly wrong value
     - the canonical answer passes its own check, and an obviously wrong answer fails (num, expr and set)
     - at least 30% of the problems are distinct (the question, the answer and the picture together), and making one
       takes under 5 ms on average
   The ladder's visual kit (static/<ladder>/viz/<ladder>.js) is loaded too when it runs without a DOM (it is tried in a
   separate node sandbox first): the Logic kit's MathLadder.logic is then available to generators and to the 'prop'
   answer type, as on the ladder's pages. Kits that need a document are skipped; generators must not need them at load.
   A 'prop' answer is also checked with a clearly wrong answer (its negation).
   Prints one line per topic and exits with status 1 if anything fails or a generator is missing. A course with a skill
   map but no generator file yet is reported as "not yet written" (exit status 0).
   -v shows every failing example (default: up to 2 per kind of problem per topic).                                   */
'use strict';
var fs = require('fs'), path = require('path');
var ROOT = path.resolve(__dirname, '..', '..');

var args = process.argv.slice(2), opt = { n: 300, v: false, gen: null, topics: null, lenient: false }, pos = [];
for (var i = 0; i < args.length; i++) {
  var a = args[i];
  if (a === '-n') opt.n = Math.max(3, parseInt(args[++i], 10) || 300);
  else if (a === '-v' || a === '--verbose') opt.v = true;
  else if (a === '--lenient') opt.lenient = true;
  else if (a === '--strict') opt.lenient = false; // the default now; kept so older commands still work
  else if (a === '--gen') opt.gen = path.resolve(args[++i]);
  else if (a === '--topics') opt.topics = path.resolve(args[++i]);
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^[^]*?\/\*/, '')); process.exit(0); }
  else pos.push(a);
}
var course = pos[0], only = pos[1];
if (!course) { console.error('Usage: node scripts/math/check-gen.js <courseKey> [topicId] [-n 300] [-v] [--gen file.js] [--topics file.json]'); process.exit(2); }

global.window = global;
global.CAS = require(path.join(ROOT, 'static/homeschool/calc/cas.js'));
require(path.join(ROOT, 'static/math/core/gen.js'));
require(path.join(ROOT, 'static/math/core/tex.js'));
require(path.join(ROOT, 'static/math/core/check.js'));
var ML = global.MathLadder;

// the course's ladder: the folder (data/<dir>/, static/<dir>/) whose courses.yaml lists it
var LADDERS = (function () {
  var f = path.join(ROOT, 'data/ladders.yaml'), out = [];
  if (fs.existsSync(f)) fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach(function (line) {
    var m = /^-\s+key:\s*["']?([\w-]+)/.exec(line); if (m) out.push({ key: m[1], viz: '' });
    m = /^  viz:\s*["']?([\w-]*)/.exec(line); if (m && out.length) out[out.length - 1].viz = m[1];
  });
  return out.length ? out : [{ key: 'math', viz: '' }];
})();
var LADDER = (function () {
  for (var i = 0; i < LADDERS.length; i++) {
    var cf = path.join(ROOT, 'data', LADDERS[i].key, 'courses.yaml');
    if (fs.existsSync(cf) && new RegExp('^-\\s+key:\\s*["\']?' + course.replace(/[^\w-]/g, '') + '["\']?\\s*$', 'm').test(fs.readFileSync(cf, 'utf8'))) return LADDERS[i].key;
    if (fs.existsSync(path.join(ROOT, 'data', LADDERS[i].key, 'topics', course + '.json'))) return LADDERS[i].key;
  }
  return 'math';
})();
// the ladder's visual kit, when it runs without a DOM (its models, e.g. MathLadder.logic, are then there for the generators
// and for check.js, as on the ladder's pages). A kit that needs a document is tried in a separate sandbox first and skipped.
var KIT_LOADED = (function () {
  if (LADDER === 'math') return null;
  var f = path.join(ROOT, 'static', LADDER, 'viz', LADDER + '.js');
  if (!fs.existsSync(f)) return null;
  try { var sb = { console: console }; sb.window = sb; sb.globalThis = sb; require('vm').runInNewContext(fs.readFileSync(f, 'utf8'), sb, { filename: f, timeout: 5000 }); }
  catch (e) { return null; }
  try { require(f); return path.relative(ROOT, f); } catch (e) { return null; }
})();
var topicsFile = opt.topics || path.join(ROOT, 'data', LADDER, 'topics', course + '.json');
var genFile = opt.gen || path.join(ROOT, 'static', LADDER, 'gen', course + '.js');
var topics;
try { topics = JSON.parse(fs.readFileSync(topicsFile, 'utf8')).topics || []; }
catch (e) { console.error('Cannot read ' + path.relative(process.cwd(), topicsFile) + ': ' + e.message); process.exit(2); }
if (!fs.existsSync(genFile)) { console.log('not yet written: ' + course + ' (' + LADDER + ') has ' + topics.length + ' topics in its skill map and no generator file yet (' + path.relative(process.cwd(), genFile) + ').'); process.exit(0); }
var GEN_SRC = fs.readFileSync(genFile, 'utf8');
var LESSONS = (function () { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', LADDER, 'lessons', course + '.json'), 'utf8')); } catch (e) { return {}; } })();
try { require(genFile); }
catch (e) { console.error('Loading ' + path.relative(process.cwd(), genFile) + ' failed:\n  ' + (e.stack || e).toString().split('\n').slice(0, 4).join('\n  ')); process.exit(1); }
if (only) topics = topics.filter(function (t) { return t.id === only || t.slug === only; });
if (!topics.length) { console.error(only ? 'No topic "' + only + '" in ' + topicsFile : 'No topics in ' + topicsFile); process.exit(2); }

var VIZ = ('tenframe counters numberline hundredchart base10 placevalue numberbond arraygrid areamodel fractionbar fractioncircle fractionline decimalgrid percentbar ratiotable ' +
  'tapediagram clock coins balance integerline shapes geoboard angle transform pythagoras circlepi areaformulas volume nets dotplot boxplot graph slope linesystem parabola ' +
  'transformfn exponential logscale unitcircle trigwave polar complexplane sequence limit secant derivgraph riemann ftc solids taylor seriespartial vectors2d vectors3d surface ' +
  'gradient vectorfield lineintegral flux param3d matrix2d span slopefield phaseplane springmass dice normal sampling scatter venn tree').split(' ');
// the course's own visuals: names registered in static/math/viz/<course>.js (register('g2-line', …), or any quoted
// '<course>-…' name in that file); topic pages load that file, so these are known too
function vizNames(f, prefix) {
  var out = [];
  if (!fs.existsSync(f)) return out;
  var src = fs.readFileSync(f, 'utf8'), re = /register\(\s*['"]([\w-]+)['"]/g, m;
  while ((m = re.exec(src))) out.push(m[1]);
  var re2 = new RegExp('[\'"](' + prefix.replace(/[^\w]/g, '') + '-[\\w-]+)[\'"]', 'g');
  while ((m = re2.exec(src))) out.push(m[1]);
  return out;
}
var COURSE_VIZ = vizNames(path.join(ROOT, 'static', LADDER, 'viz', course + '.js'), course);
// the ladders' kits (static/<ladder>/viz/<ladder>.js, names with the ladder's prefix, e.g. ph-); null when not built yet
var KITS = {}; LADDERS.forEach(function (L) { if (L.viz) { var f = path.join(ROOT, 'static', L.key, 'viz', L.key + '.js'); KITS[L.viz] = fs.existsSync(f) ? vizNames(f, L.viz.replace(/-$/, '')) : null; } });
function kitOf(name) { for (var p in KITS) if (String(name).indexOf(p) === 0) return p; return null; }
function knownViz(name) { var k = kitOf(name); return VIZ.indexOf(name) >= 0 || COURSE_VIZ.indexOf(name) >= 0 || !!(k && KITS[k] && KITS[k].indexOf(name) >= 0); }
function notBuiltViz(name) { var k = kitOf(name); return !!k && (!KITS[k] || KITS[k].indexOf(name) < 0) && COURSE_VIZ.indexOf(name) < 0; }

// ---------------------------------------------------------------- text checks
function texts(p) { // [label, text] pairs a learner will see
  var out = [['q', p.q]];
  if (p.hint) out.push(['hint', p.hint]);
  (p.steps || []).forEach(function (s, k) { out.push(['steps[' + k + ']', s]); });
  (function walk(a, pre) {
    if (!a) return;
    if (a.t === 'mc') (a.choices || []).forEach(function (c, k) { out.push([pre + 'choices[' + k + ']', String(c)]); });
    if (a.t === 'multi') (a.parts || []).forEach(function (pt, k) { if (pt.label) out.push([pre + 'parts[' + k + '].label', pt.label]); walk(pt.a, pre + 'parts[' + k + '].'); });
  })(p.a, 'a.');
  if (p.unit) out.push(['unit', String(p.unit)]);
  try { out.push(['answer shown', ML.answerShow(p.a)]); } catch (e) { out.push(['answer shown', '[error: ' + e.message + ']']); }
  return out;
}
var ARTIFACTS = [
  ['+ -', /\+\s*-/],
  ['--', /-\s*-(?!>)/],
  ['1x', /(^|[^\w.,^_{}\\'])-?1([a-zA-Z]|\\(pi|alpha|beta|gamma|delta|theta|lambda|mu|sigma|omega|phi|sqrt|left\())(?![a-zA-Z{])/],
  ['+ 0', /(([a-zA-Z}\)])\s*[+-]\s*0(?![\d.,])|[+-]\s*0\s*[a-zA-Z\\(])/]
];
// More ways a coefficient of 1 shows up: "1 x" (with a space, as plain answers print), "\frac{1 x + 3}{2}", "1\cos t".
// They count as problems (like "1x" above); --lenient prints them as warnings instead; p.nolint = ['1x'] switches them
// off for one problem. A "1 dx" or "1\,d\theta" (integrating 1) is fine and not flagged.
var WARN_ARTIFACTS = [
  ['1x', /(^|[^\w.,^_{}\\'&|])-?1(?:\s|\\[,;:! ]|~)+(?!d(?:[a-zA-Z]|\\))([a-zA-Z]|\\(?:pi|sqrt|alpha|beta|theta|lambda|mu|sigma|omega|phi|sin|cos|tan|sec|csc|cot|ln|log|left\())(?![a-zA-Z{])/],
  ['1x', /\\[dt]?frac\s*\{\s*-?1\s*(?:(?!d(?:[a-zA-Z]|\\))[a-zA-Z](?![a-zA-Z])|\\(?:pi|sqrt|alpha|theta|sin|cos|tan|ln|log)(?![a-zA-Z]))/],
  ['1x', /(^|[^\w.,^_{}\\'])-?1\\(sin|cos|tan|sec|csc|cot|ln|log|exp)(?![a-zA-Z])/]
];
function lintText(label, text, nolint, issue, warnIssue) {
  warnIssue = warnIssue || issue;
  if (typeof text !== 'string') { issue('shape', label + ' is not a string'); return; }
  if (/\bNaN\b|\bInfinity\b|\[object Object\]|\bfunction\s*\(|=>/.test(text)) issue('bad value', label + ': "' + clip(text, /NaN|Infinity|\[object Object\]|function|=>/) + '"');
  var segs = ML.mathSegments(text);
  segs.forEach(function (sg) {
    if (!sg.math) {
      var t = sg.s.replace(/\\\$/g, '');
      if (t.indexOf('$') >= 0) issue('lone $', label + ': a "$" that doesn\'t start math (write \\$ for money): "' + clip(sg.s, /\$/) + '"');
      if (/\bundefined\b\s*[=+\-*/)]|[=(+\-*/]\s*undefined\b/.test(t)) issue('bad value', label + ': "' + clip(t, /undefined/) + '"');
      return;
    }
    var L = ML.texLint(sg.tex);
    if (L.errors.length) issue('TeX error', label + ': ' + L.errors[0] + ' in $' + sg.tex + '$');
    if (L.unknown.length) issue('TeX unknown', label + ': unknown \\' + L.unknown.join(', \\') + ' in $' + clip(sg.tex, new RegExp('\\\\' + L.unknown[0].replace(/[{}]/g, '.'))) + '$');
    if (/\b(undefined|null)\b/.test(sg.tex.replace(/\\text\{[^}]*\}/g, ''))) issue('bad value', label + ': $' + sg.tex + '$');
    var plain = sg.tex.replace(/\\text\{[^}]*\}/g, ' § ');
    var hit = {};
    ARTIFACTS.forEach(function (ar) {
      if (nolint.indexOf(ar[0]) >= 0) return;
      if (ar[1].test(plain)) { hit[ar[0]] = 1; issue('"' + ar[0] + '"', label + ': $' + clip(sg.tex, ar[1]) + '$'); }
    });
    WARN_ARTIFACTS.forEach(function (ar) {
      if (nolint.indexOf(ar[0]) >= 0 || hit[ar[0]]) return;
      var m = ar[1].exec(plain);
      if (m) { hit[ar[0]] = 1; (opt.lenient ? warnIssue : issue)('"' + ar[0] + '"', label + ': $' + clip(sg.tex, ar[1]) + '$'); }
    });
  });
}
function clip(s, re) { s = String(s); var m = re ? re.exec(s) : null, at = m ? m.index : 0; var a = Math.max(0, at - 30), b = Math.min(s.length, at + 40); return (a ? '…' : '') + s.slice(a, b) + (b < s.length ? '…' : ''); }

// ---------------------------------------------------------------- answer checks
function wrongAnswer(a) {
  var v = ML.answerValue(a);
  if (a.t === 'num') {
    if (/^(dne|does not exist|undefined)$/i.test(String(a.v))) return '0';
    if (/inf/i.test(String(a.v))) return '0';
    var base = String(v).replace(/%$/, '');
    if (a.dp !== undefined) { var x = ML.evalPlain(base); return ML.util.numStr(ML.util.round(x + Math.max(1, 3 * Math.pow(10, -a.dp)), a.dp)); }
    if (a.form === 'sf' || a.rtol !== undefined) { var y = ML.evalPlain(base); if (isFinite(y) && y !== 0) return String(y * (1.5 + 10 * Math.abs(Number(a.rtol) || 0))); return '1'; }
    if (a.tol !== undefined) return '(' + base + ')+' + (10 * Number(a.tol) + 1);
    return '(' + base + ')+1';
  }
  if (a.t === 'expr') {
    var vars = a.vars && a.vars.length ? a.vars : ['x'];
    return /\bC\b/.test(a.v) ? '(' + a.v + ')+' + vars[0] : '(' + a.v + ')+1';
  }
  if (a.t === 'prop') return '¬(' + ML.answerValue(a) + ')';
  if (a.t === 'formula') { var f0 = String(Array.isArray(a.v) ? a.v[0] : a.v); return f0.toLowerCase() !== f0 ? f0.toLowerCase() : f0 + '2'; }
  if (a.t === 'set') {
    if (a.v === 'all' || !a.v.length) return '0';
    var items = a.v.slice(); items[0] = '(' + items[0] + ')+1'; return items.join(', ');
  }
  return null;
}

// ---------------------------------------------------------------- run
var MODES = ['learn', 'review', 'quiz', 'place'];
var ids = ML.genIds(), topicIds = topics.map(function (t) { return t.id; });
var results = [], nOk = 0, nBad = 0, nMissing = 0, nWarn = 0, width = Math.min(46, Math.max.apply(null, topicIds.map(function (s) { return s.length; })) + 2);
console.log((LADDER === 'math' ? 'Math Ladder' : LADDER.charAt(0).toUpperCase() + LADDER.slice(1) + ' Ladder') + ' generators: ' + course + ' — ' + topics.length + ' topic' + (topics.length === 1 ? '' : 's') + ', ' + opt.n + ' problems each');
var noLesson = topics.filter(function (t) { return !LESSONS[t.id]; }).length;
topics.forEach(function (topic) {
  var id = topic.id;
  if (!ML.hasGen(id)) { nMissing++; console.log('  --  ' + pad(id, width) + 'missing generator'); return; }
  var issues = {}, count = 0, made = 0, seenQ = {}, distinct = 0, time = 0, vizWarn = {}, warns = {}, nw = 0, vizLater = {};
  function issue(kind, text, where) { if (!issues[kind]) issues[kind] = []; issues[kind].push(text + (where ? '  [' + where + ']' : '')); count++; }
  function warn(kind, text, where) { if (!warns[kind]) warns[kind] = []; warns[kind].push(text + (where ? '  [' + where + ']' : '')); nw++; }
  if (GEN_SRC.indexOf("'" + id + "'") < 0 && GEN_SRC.indexOf('"' + id + '"') < 0) issue('id not literal', 'register it with its full id as a string, G(\'' + id + '\', …), so pages can tell the topic is ready');
  var per = Math.ceil(opt.n / 3);
  for (var lv = 1; lv <= 3; lv++) {
    for (var s = 1; s <= per && made < opt.n; s++) {
      var seed = s * 7919 + lv, ctx = { level: lv, mode: MODES[(s + lv) % 4] }, p, where = 'seed ' + seed + ', level ' + lv;
      var t0 = process.hrtime.bigint();
      try { p = ML.makeProblem(id, seed, ctx); }
      catch (e) { time += Number(process.hrtime.bigint() - t0) / 1e6; made++; issue('throws', (e && e.message || String(e)).replace(/^MathLadder: generator \S+ \([^)]*\): /, ''), where); continue; }
      time += Number(process.hrtime.bigint() - t0) / 1e6; made++;
      var key = p.q + '|' + JSON.stringify(p.a) + '|' + JSON.stringify(p.viz || null); if (!seenQ[key]) { seenQ[key] = 1; distinct++; } // a different picture makes a different problem
      var nolint = Array.isArray(p.nolint) ? p.nolint : [];
      texts(p).forEach(function (pair) { lintText(pair[0], pair[1], nolint, function (k, t) { issue(k, t, where); }, function (k, t) { warn(k, t, where); }); });
      if (p.viz && !knownViz(p.viz.name)) { if (notBuiltViz(p.viz.name)) vizLater[p.viz.name] = 1; else vizWarn[p.viz.name] = 1; }
      var aj = JSON.stringify(p.a);
      if (/\d\.\d*?(\d)\1{6,}\d*|\d\.\d{12,}/.test(aj + ' ' + texts(p).map(function (x) { return x[1]; }).join(' '))) issue('float noise', 'a long decimal like 0.30000000000000004 (use ML.util.fix, T.num or ML.Q): ' + clip(aj + ' ' + p.q, /\d\.\d{9,}/), where);
      if (/\bNaN\b|\bInfinity\b|\bundefined\b|\bnull\b|\[object/.test(aj)) issue('bad value', 'answer spec: ' + clip(aj, /\bNaN\b|\bInfinity\b|\bundefined\b|\bnull\b|\[object/), where);
      try {
        var r = ML.check(p.a, ML.answerValue(p.a));
        if (!r.ok) issue('answer fails', 'its own answer ' + JSON.stringify(ML.answerValue(p.a)) + ' is marked wrong' + (r.msg ? ' ("' + r.msg + '")' : '') + ' for ' + JSON.stringify(p.a) + (r.error ? ' — ' + r.error : ''), where);
        if (LADDER !== 'math' && p.unit && p.a.t === 'num' && typeof ML.answerValue(p.a) === 'string') {
          var wu = ML.answerValue(p.a) + ' ' + String(p.unit).replace(/\$/g, '').replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\,/g, ' ');
          var ru = ML.check(p.a, wu, { q: p.q, unit: p.unit });
          if (!ru.ok) issue('unit answer fails', 'its answer typed with its unit, ' + JSON.stringify(wu) + ', is marked wrong' + (ru.msg ? ' ("' + ru.msg + '")' : '') + ' (unit ' + JSON.stringify(p.unit) + ')', where);
        }
        var w = wrongAnswer(p.a);
        if (w !== null) { var rw = ML.check(p.a, w); if (rw.ok) issue('wrong passes', 'the wrong answer "' + w + '" is accepted for ' + JSON.stringify(p.a), where); }
      } catch (e) { issue('check throws', e.message, where); }
    }
  }
  var avg = made ? time / made : 0, share = made ? distinct / made : 0;
  if (made && share < 0.3) issue('few distinct', Math.round(share * 100) + '% distinct (' + distinct + ' of ' + made + '); at least 30% needed');
  if (avg > 5) issue('slow', 'average ' + avg.toFixed(2) + ' ms per problem; keep it under 5 ms');
  var stats = pad(made + '', 5) + pad(Math.round(share * 100) + '% distinct', 15) + pad(avg.toFixed(2) + ' ms', 9);
  var vw = Object.keys(vizWarn); var note = '';
  if (vw.length) issue('unknown viz', 'p.viz names no shared visual and none registered in static/' + LADDER + '/viz/' + course + '.js' + (LADDER === 'math' ? '' : ' or the ladder\'s kit') + ': ' + vw.join(', '));
  if (Object.keys(vizLater).length) warn('viz not built yet', 'the ladder\'s kit has no ' + Object.keys(vizLater).join(', ') + ' yet (the problem shows without its picture until it does)');
  function showWarns() { Object.keys(warns).forEach(function (k) { var list = warns[k]; nWarn += list.length; console.log('        warning ' + k + (list.length > 1 ? ' (×' + list.length + ')' : '') + ':'); list.slice(0, opt.v ? list.length : 1).forEach(function (t) { console.log('          ' + t); }); }); }
  if (!count) { nOk++; console.log('  ok  ' + pad(id, width) + stats + note + (nw ? '  ' + nw + ' warning' + (nw === 1 ? '' : 's') : '')); showWarns(); return; }
  nBad++;
  console.log('  ✗   ' + pad(id, width) + stats + count + ' issue' + (count === 1 ? '' : 's') + note);
  Object.keys(issues).forEach(function (k) {
    var list = issues[k];
    console.log('        ' + k + (list.length > 1 ? ' (×' + list.length + ')' : '') + ':');
    list.slice(0, opt.v ? list.length : 2).forEach(function (t) { console.log('          ' + t); });
  });
  showWarns();
});
var extra = ids.filter(function (g) { return topicIds.indexOf(g) < 0 && g.indexOf(course + '.') === 0; });
if (extra.length && !only) console.log('  note: generators with no topic in ' + path.basename(topicsFile) + ': ' + extra.join(', '));
if (noLesson && !only) console.log('  note: ' + noLesson + ' of ' + topics.length + ' topics have no lesson yet in data/' + LADDER + '/lessons/' + course + '.json; they show "Being written" until both exist.');
console.log((nBad || nMissing ? 'FAIL' : 'PASS') + ': ' + nOk + ' ok, ' + nBad + ' with problems, ' + nMissing + ' missing.' + (nWarn ? ' ' + nWarn + ' warning' + (nWarn === 1 ? '' : 's') + ' (--lenient: without it they count as problems).' : ''));
process.exit(nBad || nMissing ? 1 : 0);

function pad(s, n) { s = String(s); return s.length >= n ? s + ' ' : s + ' '.repeat(n - s.length); }
