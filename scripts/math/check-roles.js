#!/usr/bin/env node
/* Formula colors: check the role palette and every place \role is used (docs/formula-colors.md).

   node scripts/math/check-roles.js            check, and print usage counts
   node scripts/math/check-roles.js --write    also copy data/formula-roles.yaml into static/math/core/tex.js (between
                                               the ROLES:BEGIN and ROLES:END markers), then check
   node scripts/math/check-roles.js --quiet    print only problems and the final line

   Fails (exit 1) when:
   - data/formula-roles.yaml has a role without a label, a light or a dark color, or a color with a contrast below 4.5:1
     on the lesson backgrounds (white, the lesson boxes; dark: the page, cards and boxes);
   - the palette in tex.js is not the same as the YAML (run with --write);
   - a lesson (data/<ladder>/lessons/*.json) uses an unknown role, or its math with \role does not parse;
   - a generator (static/<ladder>/gen/*.js) puts \role in anything a learner sees before answering: the prompt, the
     choices, a hint, part labels, or anything else outside `steps`. Every generator is loaded and every topic makes
     problems at levels 1 to 3 (and the source is searched for \role as well). Steps are shown only after answering,
     or when the learner asks for them in a lesson's "Try one", so a role there is allowed and counted.          */
'use strict';
var fs = require('fs'), path = require('path');
var ROOT = path.resolve(__dirname, '..', '..');
var args = process.argv.slice(2), WRITE = args.includes('--write'), QUIET = args.includes('--quiet');
var errors = [], warns = [];
function err(m) { errors.push(m); if (!QUIET) console.log('  ERROR ' + m); }
function warn(m) { warns.push(m); if (!QUIET) console.log('  warn  ' + m); }
function log(m) { if (!QUIET) console.log(m); }

/* ---------- the palette ---------- */
var YAML = path.join(ROOT, 'data', 'formula-roles.yaml');
var ROLES = {}, order = [];
fs.readFileSync(YAML, 'utf8').split(/\r?\n/).forEach(function (line, i) {
  if (/^\s*(#|$)/.test(line)) return;
  var m = /^([a-z][a-z0-9]*):\s*\{(.*)\}\s*(#.*)?$/.exec(line);
  if (!m) { err('formula-roles.yaml line ' + (i + 1) + ': expected  name: { label: "…", light: "#…", dark: "#…", hue: …, group: … }'); return; }
  var o = {}, re = /(\w+):\s*("([^"]*)"|[^,}]+)/g, f;
  while ((f = re.exec(m[2]))) o[f[1]] = f[3] !== undefined ? f[3] : f[2].trim();
  if (ROLES[m[1]]) err('formula-roles.yaml: role "' + m[1] + '" is listed twice');
  ROLES[m[1]] = o; order.push(m[1]);
});
function hx(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16) / 255; }); }
function lum(h) { var c = hx(h).map(function (v) { return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function cr(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
var BG_LIGHT = ['#ffffff', '#fbf8f0', '#e8f5ec', '#e9f1fc', '#fcf1e8'];            // page, paper, key, why, mistake boxes
var BG_DARK = ['#1d1e20', '#15251c', '#173525', '#1a2b40', '#3a2619'];             // page, card, key, why, mistake boxes
order.forEach(function (k) {
  var r = ROLES[k];
  ['label', 'light', 'dark'].forEach(function (f) { if (!r[f]) err('role "' + k + '" has no ' + f); });
  ['light', 'dark'].forEach(function (f) {
    if (r[f] && !/^#[0-9a-fA-F]{6}$/.test(r[f])) { err('role "' + k + '": ' + f + ' must be a #rrggbb color'); return; }
    if (!r[f]) return;
    var worst = Math.min.apply(null, (f === 'light' ? BG_LIGHT : BG_DARK).map(function (b) { return cr(r[f], b); }));
    if (worst < 4.5) err('role "' + k + '": ' + f + ' color ' + r[f] + ' has a contrast of only ' + worst.toFixed(2) + ':1 on a lesson background');
  });
});

/* ---------- the copy in tex.js ---------- */
var TEX = path.join(ROOT, 'static', 'math', 'core', 'tex.js');
var texSrc = fs.readFileSync(TEX, 'utf8');
var block = '  var ROLES = {\n' + order.map(function (k, i) {
  var r = ROLES[k];
  return '    ' + k + ': ' + JSON.stringify({ label: r.label, light: r.light, dark: r.dark, hue: r.hue || '', group: r.group || '' }).replace(/"(\w+)":/g, '$1: ').replace(/,(?=\w+: )/g, ', ') + (i < order.length - 1 ? ',' : '');
}).join('\n') + '\n  };\n';
var MB = '/* ROLES:BEGIN */\n', ME = '  /* ROLES:END */';
var a = texSrc.indexOf(MB), b = texSrc.indexOf(ME);
if (a < 0 || b < a) err('static/math/core/tex.js: the ROLES:BEGIN / ROLES:END markers are missing');
else {
  var cur = texSrc.slice(a + MB.length, b);
  if (cur !== block) {
    if (WRITE) { fs.writeFileSync(TEX, texSrc.slice(0, a + MB.length) + block + texSrc.slice(b)); log('wrote the palette (' + order.length + ' roles) into static/math/core/tex.js'); }
    else err('static/math/core/tex.js: the palette differs from data/formula-roles.yaml (run node scripts/math/check-roles.js --write)');
  }
}

/* ---------- the TeX engine, for linting and for the generators ---------- */
global.window = global;
global.CAS = require(path.join(ROOT, 'static/homeschool/calc/cas.js'));
require(path.join(ROOT, 'static/math/core/gen.js'));
require(TEX);
require(path.join(ROOT, 'static/math/core/check.js'));
var ML = global.MathLadder;

/* ---------- lessons ---------- */
var RE = /\\role\s*(?:\[([^\]]*)\])?\s*\{\s*([^}]*?)\s*\}/g;
var use = {}, byCourse = {}, lessonsWith = 0, formulas = 0, linked = 0;
order.forEach(function (k) { use[k] = 0; });
function ladders() { return fs.readdirSync(path.join(ROOT, 'data')).filter(function (d) { return fs.existsSync(path.join(ROOT, 'data', d, 'lessons')); }); }
ladders().forEach(function (L) {
  fs.readdirSync(path.join(ROOT, 'data', L, 'lessons')).filter(function (f) { return /\.json$/.test(f); }).forEach(function (f) {
    var file = path.join('data', L, 'lessons', f), data;
    try { data = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8')); } catch (e) { err(file + ': ' + e.message); return; }
    Object.keys(data).forEach(function (id) {
      var n = 0, hasLink = false;
      (function walk(v, where) {
        if (typeof v === 'string') {
          if (v.indexOf('\\role') < 0) return;
          ML.mathSegments(v).forEach(function (sg) {
            if (!sg.math || sg.tex.indexOf('\\role') < 0) return;
            formulas++;
            var lint = ML.texLint(sg.tex);
            if (lint.errors.length) err(file + ' ' + id + ' (' + where + '): math does not parse: ' + lint.errors[0] + '  in  ' + sg.raw.slice(0, 90));
            var m; RE.lastIndex = 0;
            while ((m = RE.exec(sg.tex))) {
              n++;
              if (!ROLES[m[2]]) err(file + ' ' + id + ' (' + where + '): unknown role "' + m[2] + '"');
              else use[m[2]]++;
            }
          });
          var bare = v.replace(/\$\$[\s\S]*?\$\$|\$(?:\\.|[^$\\])*\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g, '');
          if (bare.indexOf('\\role') >= 0) err(file + ' ' + id + ' (' + where + '): \\role outside math');
          return;
        }
        if (Array.isArray(v)) v.forEach(function (x, i) { walk(x, where + '[' + i + ']'); });
        else if (v && typeof v === 'object') {
          if (v.t === 'viz' && v.opts && v.opts.roleLinks) {
            hasLink = true;
            Object.keys(v.opts.roleLinks).forEach(function (k) { if (!ROLES[v.opts.roleLinks[k]]) err(file + ' ' + id + ': viz roleLinks: unknown role "' + v.opts.roleLinks[k] + '"'); });
          }
          Object.keys(v).forEach(function (k) { walk(v[k], where ? where + '.' + k : k); });
        }
      })(data[id], '');
      if (n) { lessonsWith++; var c = f.replace(/\.json$/, ''); byCourse[c] = (byCourse[c] || 0) + 1; }
      if (hasLink) linked++;
    });
  });
});

/* ---------- generators ---------- */
var genWith = [], made = 0, stepUses = 0;
function genFiles() {
  var out = [];
  fs.readdirSync(path.join(ROOT, 'static')).forEach(function (d) {
    var g = path.join(ROOT, 'static', d, 'gen');
    if (fs.existsSync(g) && fs.statSync(g).isDirectory()) fs.readdirSync(g).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) { out.push({ dir: d, key: f.replace(/\.js$/, ''), file: path.join(g, f) }); });
  });
  return out;
}
function scan(p, where, bad) { // every string outside `steps`
  (function walk(v, k) {
    if (typeof v === 'string') { if (v.indexOf('\\role') >= 0) bad(k); return; }
    if (Array.isArray(v)) v.forEach(function (x, i) { walk(x, k + '[' + i + ']'); });
    else if (v && typeof v === 'object') Object.keys(v).forEach(function (kk) {
      if (kk === 'steps' && k === '') { (v[kk] || []).forEach(function (s) { if (typeof s === 'string' && s.indexOf('\\role') >= 0) stepUses++; }); return; }
      walk(v[kk], k ? k + '.' + kk : kk);
    });
  })(p, '');
}
var kitsTried = {};
genFiles().forEach(function (g) {
  var src = fs.readFileSync(g.file, 'utf8'), rel = path.relative(ROOT, g.file);
  if (/\\\\role\b/.test(src)) { genWith.push(rel); warn(rel + ': mentions \\role (allowed only in steps; the problems made below are checked)'); }
  // a ladder's kit (static/<ladder>/viz/<ladder>.js) may hold models the generators need; load it if it runs without a DOM
  if (!kitsTried[g.dir] && g.dir !== 'math') {
    kitsTried[g.dir] = 1; var kf = path.join(ROOT, 'static', g.dir, 'viz', g.dir + '.js');
    if (fs.existsSync(kf)) { try { var sb = { console: console }; sb.window = sb; sb.globalThis = sb; require('vm').runInNewContext(fs.readFileSync(kf, 'utf8'), sb, { filename: kf, timeout: 5000 }); require(kf); } catch (e) { } }
  }
  try { require(g.file); } catch (e) { warn(rel + ': could not be loaded here (' + String(e.message || e).slice(0, 80) + '); its source was searched only'); return; }
  var tf = path.join(ROOT, 'data', g.dir, 'topics', g.key + '.json'), topics = [];
  try { topics = JSON.parse(fs.readFileSync(tf, 'utf8')).topics || []; } catch (e) { }
  topics.forEach(function (t) {
    if (!ML.hasGen || !ML.hasGen(t.id)) return;
    for (var lv = 1; lv <= 3; lv++) for (var s = 1; s <= 3; s++) {
      var p; try { p = ML.makeProblem(t.id, 'roles' + s + '.' + lv, { level: lv, mode: ['learn', 'quiz', 'review'][s % 3] }); } catch (e) { continue; }
      if (!p) continue; made++;
      scan(p, t.id, function (k) { err(rel + ' ' + t.id + ' (level ' + lv + '): \\role in ' + (k || 'the problem') + ', which a learner sees before answering'); });
    }
  });
});

/* ---------- report ---------- */
log('\nFormula colors: ' + order.length + ' roles in data/formula-roles.yaml');
log('Lessons with color-coded formulas: ' + lessonsWith + '  (' + formulas + ' formulas; ' + linked + ' linked to a visual)');
log('  by course: ' + Object.keys(byCourse).sort().map(function (c) { return c + ' ' + byCourse[c]; }).join(', '));
log('  by role:   ' + order.filter(function (k) { return use[k]; }).sort(function (x, y) { return use[y] - use[x]; }).map(function (k) { return k + ' ' + use[k]; }).join(', '));
var unused = order.filter(function (k) { return !use[k]; }); if (unused.length) log('  not used yet: ' + unused.join(', '));
log('Generators: ' + made + ' problems made; \\role in steps: ' + stepUses + '; in anything shown before answering: ' + errors.filter(function (e) { return /sees before answering/.test(e); }).length);
console.log((errors.length ? 'FAIL' : 'OK') + ': check-roles, ' + errors.length + ' error' + (errors.length === 1 ? '' : 's') + ', ' + warns.length + ' warning' + (warns.length === 1 ? '' : 's'));
process.exit(errors.length ? 1 : 0);
