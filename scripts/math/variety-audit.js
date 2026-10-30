#!/usr/bin/env node
/* The Ladders: a variety audit of every course's problem generators (all ladders), so progress can be tracked.

   node scripts/math/variety-audit.js [--out report.tsv] [--format tsv|md|json] [-j 2] [--ladder math] [--course alg1,g3]
                                      [-n 300] [--sessions 50] [--cap 40] [--below 60] [--full]

   Runs scripts/math/check-gen.js --json --variety-only on each course that has a generator file (static/<ladder>/gen/<key>.js
   with data/<ladder>/topics/<key>.json), one course per process, and writes one row per topic and level:
     ladder  course  topic  level  distinct %  first repeat (median draws before a problem comes back, the memory off; "40+" =
     none in 40)
   sorted with the least variety first (distinct %, then first repeat). Then a summary: topics, the median topic's distinct %,
   and how many topic-levels are under 30% (check-gen fails a topic under 30% overall) and under 60% (a warning).
     --out FILE       write the report there (default: stdout); the summary always goes to stderr too
     --format         tsv (default), md (a Markdown table) or json (every row, plus the summary)
     -j N             courses checked at the same time (default 1; the machine's other work shares the CPUs)
     --ladder / --course   only these ladders or courses (comma-separated)
     --below PCT      only rows under PCT distinct (the summary still counts everything)
     -n, --sessions, --cap   passed to check-gen (problems per topic, simulated sessions per level, draws per session)
     --full           run check-gen's full checks too (much slower; failures are listed in the summary)
   Exit status 0 (an audit reports; it doesn't fail), 2 for bad arguments.                                              */
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process');
var ROOT = path.resolve(__dirname, '..', '..'), CHECK = path.join(__dirname, 'check-gen.js');
var opt = { out: null, format: 'tsv', j: 1, ladders: null, courses: null, n: 300, sessions: 50, cap: 40, below: null, full: false };
var args = process.argv.slice(2);
for (var i = 0; i < args.length; i++) {
  var a = args[i];
  if (a === '--out') opt.out = args[++i];
  else if (a === '--format') opt.format = args[++i];
  else if (a === '-j') opt.j = Math.max(1, parseInt(args[++i], 10) || 1);
  else if (a === '--ladder') opt.ladders = String(args[++i]).split(',');
  else if (a === '--course') opt.courses = String(args[++i]).split(',');
  else if (a === '-n') opt.n = parseInt(args[++i], 10) || 300;
  else if (a === '--sessions') opt.sessions = parseInt(args[++i], 10) || 50;
  else if (a === '--cap') opt.cap = parseInt(args[++i], 10) || 40;
  else if (a === '--below') opt.below = Number(args[++i]);
  else if (a === '--full') opt.full = true;
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^[^]*?\/\*/, '')); process.exit(0); }
  else { console.error('Unknown argument: ' + a + ' (see --help)'); process.exit(2); }
}
if (['tsv', 'md', 'json'].indexOf(opt.format) < 0) { console.error('--format must be tsv, md or json'); process.exit(2); }

// every ladder (data/ladders.yaml) and its courses with a generator file and a skill map
var ladders = [];
fs.readFileSync(path.join(ROOT, 'data/ladders.yaml'), 'utf8').split(/\r?\n/).forEach(function (line) { var m = /^-\s+key:\s*["']?([\w-]+)/.exec(line); if (m) ladders.push(m[1]); });
if (opt.ladders) ladders = ladders.filter(function (L) { return opt.ladders.indexOf(L) >= 0; });
var jobs = [];
ladders.forEach(function (L) {
  var dir = path.join(ROOT, 'static', L, 'gen');
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(function (f) { return /\.js$/.test(f); }).sort().forEach(function (f) {
    var key = f.replace(/\.js$/, '');
    if (!fs.existsSync(path.join(ROOT, 'data', L, 'topics', key + '.json'))) return;
    if (opt.courses && opt.courses.indexOf(key) < 0) return;
    jobs.push({ ladder: L, course: key });
  });
});
if (!jobs.length) { console.error('No courses to check.'); process.exit(2); }

var rows = [], fails = [], errors = [], topicPcts = [], done = 0, t0 = Date.now();
function run(job) {
  return new Promise(function (res) {
    var a = [CHECK, job.course, '--json', '-n', String(opt.n), '--sessions', String(opt.sessions), '--cap', String(opt.cap)];
    if (!opt.full) a.push('--variety-only');
    cp.execFile(process.execPath, a, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }, function (err, stdout, stderr) {
      var line = String(stdout).trim().split('\n').pop(), o = null;
      try { o = JSON.parse(line); } catch (e) { errors.push(job.course + ': ' + (String(stderr).trim().split('\n')[0] || (err && err.message) || 'no report')); }
      if (o && !o.notWritten) o.topics.forEach(function (t) {
        if (t.missing) return;
        topicPcts.push(t.pct);
        if (opt.full && !t.ok) fails.push(t.id);
        t.levels.forEach(function (l) { rows.push({ ladder: job.ladder, course: job.course, topic: t.id, level: l.level, pct: l.pct, fr: l.firstRepeat }); });
      });
      done++;
      process.stderr.write('\r' + done + ' of ' + jobs.length + ' courses (' + Math.round((Date.now() - t0) / 1000) + ' s)   ');
      res();
    });
  });
}
function pool(list, n) {
  var k = 0;
  function next() { if (k >= list.length) return Promise.resolve(); return run(list[k++]).then(next); }
  var ws = []; for (var w = 0; w < n; w++) ws.push(next());
  return Promise.all(ws);
}
pool(jobs, opt.j).then(function () {
  process.stderr.write('\n');
  rows.sort(function (a, b) { return a.pct - b.pct || a.fr - b.fr || (a.topic < b.topic ? -1 : a.topic > b.topic ? 1 : a.level - b.level); });
  var sorted = topicPcts.slice().sort(function (a, b) { return a - b; }), mid = sorted.length >> 1;
  var median = sorted.length ? (sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2) : 0;
  var frs = rows.map(function (r) { return r.fr; }).sort(function (a, b) { return a - b; });
  var sum = {
    date: new Date().toISOString().slice(0, 10), courses: jobs.length, topics: topicPcts.length, topicLevels: rows.length,
    medianTopicPct: Math.round(median * 10) / 10,
    levelsUnder30: rows.filter(function (r) { return r.pct < 30; }).length, levelsUnder60: rows.filter(function (r) { return r.pct < 60; }).length,
    medianFirstRepeat: frs.length ? frs[frs.length >> 1] : 0, levelsAtCap: rows.filter(function (r) { return r.fr >= opt.cap; }).length,
    cap: opt.cap, sessions: opt.sessions, n: opt.n
  };
  if (opt.full) sum.failing = fails;
  if (errors.length) sum.errors = errors;
  var shown = opt.below === null || isNaN(opt.below) ? rows : rows.filter(function (r) { return r.pct < opt.below; });
  function fr(x) { return x >= opt.cap ? opt.cap + '+' : String(x); }
  var out;
  if (opt.format === 'json') out = JSON.stringify({ summary: sum, rows: shown }, null, 1);
  else if (opt.format === 'md') {
    out = '# Problem variety audit, ' + sum.date + '\n\n' + summaryText(sum).map(function (s) { return '- ' + s; }).join('\n') + '\n\n| Topic | Level | Distinct % | First repeat |\n|---|---|---|---|\n' +
      shown.map(function (r) { return '| ' + r.topic + ' | ' + r.level + ' | ' + r.pct + ' | ' + fr(r.fr) + ' |'; }).join('\n') + '\n';
  } else out = 'ladder\tcourse\ttopic\tlevel\tdistinct_pct\tfirst_repeat\n' + shown.map(function (r) { return [r.ladder, r.course, r.topic, r.level, r.pct, fr(r.fr)].join('\t'); }).join('\n') + '\n';
  if (opt.out) fs.writeFileSync(opt.out, out); else process.stdout.write(out);
  summaryText(sum).forEach(function (s) { console.error(s); });
  if (opt.out) console.error('Report: ' + opt.out + ' (' + shown.length + ' rows)');
});
function summaryText(s) {
  var t = [s.courses + ' courses, ' + s.topics + ' topics, ' + s.topicLevels + ' topic-levels (' + s.n + ' problems per topic; first repeat: median of ' + s.sessions + ' sessions per level, stopped at ' + s.cap + ')',
    'Median topic: ' + s.medianTopicPct + '% distinct. Median first repeat: ' + (s.medianFirstRepeat >= s.cap ? s.cap + '+' : s.medianFirstRepeat) + ' draws; ' + s.levelsAtCap + ' topic-levels reach ' + s.cap + ' with no repeat.',
    s.levelsUnder30 + ' topic-levels under 30% distinct, ' + s.levelsUnder60 + ' under 60%.'];
  if (s.failing) t.push(s.failing.length + ' topics fail check-gen' + (s.failing.length ? ': ' + s.failing.slice(0, 20).join(', ') + (s.failing.length > 20 ? ', …' : '') : '.'));
  if (s.errors) t.push('Errors: ' + s.errors.join('; '));
  return t;
}
