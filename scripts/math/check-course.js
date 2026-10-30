#!/usr/bin/env node
/* The Ladders: validate every ladder's data/<ladder>/courses.yaml, data/<ladder>/topics/<key>.json and
   data/<ladder>/lessons/<key>.json (the ladders and their folders come from data/ladders.yaml; Math is data/math/).

   Usage:  node scripts/math/check-course.js              check every course of every ladder
           node scripts/math/check-course.js alg1 phys1   check only these courses, from any ladder (all topic files of
                                                          all ladders are still loaded, so cross-course and cross-ladder
                                                          prerequisites and cycles are checked)
           node scripts/math/check-course.js physics      check every course of one ladder (a ladder key)
           add --quiet to print only problems and the final line.
   Courses with a skill map but no lessons or no generators yet are reported as "not yet written" (a warning, not an
   error), so a skill map can be validated before anything else exists.

   Checks (contract: /tmp/briefs/mathladder_spec.md, sections 1, 3 and 6):
   courses.yaml   required fields; course keys unique across ALL ladders, slugs unique in a ladder; band and grade
                  values (grade: Pre-K, K, 1 to 12, a range like 8–9, or College); "after" names earlier courses of the same
                  ladder or courses of other ladders; course slugs do not clash with the app's own pages.
   topics/<key>   course field matches; units have key and title, are unique, and every unit is used; topics have
                  id, slug, unit, title, short, prereqs, xp, viz; id = "<course key>.<slug>"; slugs are lowercase
                  words joined by hyphens; ids are unique across all courses; every prerequisite exists; no topic is its
                  own prerequisite; the prerequisite graph across all courses OF ALL LADDERS is acyclic; each file lists
                  its topics in an order that respects prerequisites within the file; xp is 1, 2 or 3; viz names are
                  known: a shared visual, one registered in static/<ladder>/viz/<key>.js (the course's own file) or in
                  the ladder's kit static/<ladder>/viz/<ladder>.js; a name with a ladder's prefix (ph-, ch-, ec-, es-)
                  whose kit doesn't have it yet is a warning ("not built yet"); lab is a site path like /science-lab/x/.
   lessons/<key>  (only if the file exists) keys are topic ids of that course; blocks have a known type and the
                  fields that type needs; viz blocks use known visuals (same rule); sources are {name, url}.
   Errors make the exit code 1. Warnings (such as a prerequisite in a later course, or topics without a lesson)
   do not. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const QUIET = args.includes('--quiet');
let only = args.filter(a => !a.startsWith('--'));

/* ---------- the ladders (data/ladders.yaml; Math alone when the file is missing) ---------- */
function readLadders() {
  const f = path.join(ROOT, 'data', 'ladders.yaml'), out = [];
  if (!fs.existsSync(f)) return [{ key: 'math', title: 'Math Ladder', viz: '' }];
  let cur = null;
  fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach(line => {
    let m = line.match(/^-\s+key:\s*(.*)$/);
    if (m) { cur = { key: scalar(m[1]) }; out.push(cur); return; }
    m = line.match(/^  ([A-Za-z_][\w-]*):\s*(.*)$/);
    if (m && cur && m[2] !== '') { try { cur[m[1]] = scalar(m[2]); } catch (e) { } }
  });
  out.sort((a, b) => (+a.order || 0) - (+b.order || 0));
  return out.length ? out : [{ key: 'math', title: 'Math Ladder', viz: '' }];
}

const VIZ = new Set(('tenframe counters numberline hundredchart base10 placevalue numberbond arraygrid areamodel fractionbar ' +
  'fractioncircle fractionline decimalgrid percentbar ratiotable tapediagram clock coins balance integerline shapes geoboard ' +
  'angle transform pythagoras circlepi areaformulas volume nets dotplot boxplot ' +
  'graph slope linesystem parabola transformfn exponential logscale unitcircle trigwave polar complexplane sequence limit ' +
  'secant derivgraph riemann ftc solids taylor seriespartial vectors2d vectors3d surface gradient vectorfield lineintegral ' +
  'flux param3d matrix2d span slopefield phaseplane springmass dice normal sampling scatter venn tree').split(/\s+/));
const BANDS = new Set(['Elementary', 'Middle school', 'High school', 'College']);
const RESERVED = new Set(['practice', 'placement', 'map', 'progress', 'core', 'app', 'gen', 'viz', 'lessons', 'topics']);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BLOCKS = {
  p: ['html'], h: ['text'], key: ['html'], mistake: ['html'], why: ['html'], note: ['html'],
  ex: ['q', 'steps', 'a'], viz: ['name'], list: ['items'], table: ['head', 'rows'], try: []
};

let errors = 0, warnings = 0;
const out = [];
function err(where, msg) { errors++; out.push('  ERROR ' + where + ': ' + msg); }
function warn(where, msg) { warnings++; out.push('  warn  ' + where + ': ' + msg); }
function isStr(v) { return typeof v === 'string' && v.trim() !== ''; }

/* ---------- a small reader for the YAML subset used by courses.yaml ---------- */
function scalar(v) {
  v = v.trim();
  if (v.startsWith('"')) { try { return JSON.parse(v); } catch (e) { throw new Error('bad quoted string: ' + v); } }
  if (v.startsWith("'")) return v.replace(/^'|'$/g, '').replace(/''/g, "'");
  if (v.startsWith('[')) {
    const inner = v.replace(/^\[|\]$/g, '').trim();
    return inner ? inner.split(',').map(scalar) : [];
  }
  v = v.replace(/\s+#.*$/, '');
  return v;
}
function readYamlList(file) {
  const items = [];
  let cur = null;
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    let m = line.match(/^-\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (m) { cur = {}; items.push(cur); cur[m[1]] = scalar(m[2]); return; }
    m = line.match(/^\s+([A-Za-z_][\w-]*):\s*(.*)$/);
    if (m && cur) { cur[m[1]] = scalar(m[2]); return; }
    throw new Error('courses.yaml line ' + (i + 1) + ' is not understood: ' + line);
  });
  return items;
}

/* ---------- every ladder's courses.yaml ---------- */
const LADDERS = readLadders();
const LKEYS = new Set(LADDERS.map(l => l.key));
// a ladder key as an argument means all of its courses (expanded below, once the courses are read)
const onlyLadders = only.filter(a => LKEYS.has(a));
only = only.filter(a => !LKEYS.has(a));
let courses = [];
const courseIndex = {};    // key -> global position (ladder order, then position in its courses.yaml)
const courseLadder = {};   // key -> ladder key
const ladderPos = {};      // key -> position inside its own ladder
LADDERS.forEach(L => {
  const W0 = L.key === 'math' ? '' : L.key + '/';
  const f = path.join(ROOT, 'data', L.key, 'courses.yaml');
  if (!fs.existsSync(f)) { if (L.key === 'math') err('courses.yaml', 'file is missing'); else warn(L.key + '/courses.yaml', 'not written yet (no courses for the ' + (L.title || L.key) + ')'); return; }
  let list = [];
  try { list = readYamlList(f); } catch (e) { err(W0 + 'courses.yaml', e.message); }
  const slugs = new Set();
  list.forEach((c, i) => {
    const w = W0 + 'courses.yaml[' + (c.key || i) + ']';
    ['key', 'slug', 'title', 'short', 'band', 'grade', 'icon', 'color', 'blurb'].forEach(fl => { if (!isStr(c[fl])) err(w, 'missing ' + fl); });
    if (!Array.isArray(c.after)) err(w, '"after" must be a list');
    if (c.key in courseIndex) err(w, 'duplicate key (also in the ' + courseLadder[c.key] + ' ladder); course keys are unique across all ladders');
    else { courseIndex[c.key] = courses.length; courseLadder[c.key] = L.key; ladderPos[c.key] = i; c.__ladder = L.key; courses.push(c); }
    if (slugs.has(c.slug)) err(w, 'duplicate slug ' + c.slug); slugs.add(c.slug);
    if (c.slug && !SLUG.test(c.slug)) err(w, 'slug must be lowercase words joined by hyphens');
    if (RESERVED.has(c.slug)) err(w, 'slug ' + c.slug + ' clashes with an app page');
    if (c.band && !BANDS.has(c.band)) err(w, 'band must be one of ' + [...BANDS].join(', '));
    if (c.grade && !/^((K|[1-9]|1[0-2])([–-](K|[1-9]|1[0-2]))?|Pre-K|College)$/.test(c.grade)) err(w, 'grade must be Pre-K, K, 1 to 12, a range like 8–9, or College');
    if (c.color && !/^#[0-9a-fA-F]{6}$/.test(c.color)) err(w, 'color must be #rrggbb');
  });
});
// "after": an earlier course of the same ladder, or any course of another ladder
courses.forEach(c => {
  const w = (c.__ladder === 'math' ? '' : c.__ladder + '/') + 'courses.yaml[' + c.key + ']';
  (c.after || []).forEach(a => {
    if (!(a in courseIndex)) err(w, 'after: ' + a + ' is not a course of any ladder');
    else if (courseLadder[a] === c.__ladder && ladderPos[a] >= ladderPos[c.key]) err(w, 'after: ' + a + ' is not an earlier course');
  });
});
const keys = courses.map(c => c.key);
only.forEach(k => { if (!(k in courseIndex)) err('arguments', k + ' is not a course key or a ladder key'); });
onlyLadders.forEach(L => keys.forEach(k => { if (courseLadder[k] === L && !only.includes(k)) only.push(k); }));
if (onlyLadders.length && !only.length) err('arguments', 'the ' + onlyLadders.join(', ') + ' ladder has no courses yet');
function dataDir(key) { return path.join(ROOT, 'data', courseLadder[key] || 'math'); }
function rel(key, kind) { const L = courseLadder[key] || 'math'; return (L === 'math' ? '' : L + '/') + kind + '/' + key + '.json'; }

/* ---------- load every topics file ---------- */
const files = {};          // key -> parsed json
const topicById = new Map();
keys.forEach(key => {
  const f = path.join(dataDir(key), 'topics', key + '.json');
  if (!fs.existsSync(f)) { (courseLadder[key] !== 'math' || (only.length && !only.includes(key)) ? warn : err)(rel(key, 'topics'), 'file is missing' + (courseLadder[key] !== 'math' ? ' (skill map not written yet)' : '')); return; }
  try { files[key] = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { err(rel(key, 'topics'), 'not valid JSON: ' + e.message); }
});
LADDERS.forEach(L => {
  const td = path.join(ROOT, 'data', L.key, 'topics');
  fs.existsSync(td) && fs.readdirSync(td).forEach(n => {
    if (n.endsWith('.json') && courseLadder[n.slice(0, -5)] !== L.key) warn((L.key === 'math' ? '' : L.key + '/') + 'topics/' + n, 'no course with this key in ' + L.key + '/courses.yaml');
  });
});
Object.keys(files).forEach(key => {
  (files[key].topics || []).forEach(t => {
    if (t && isStr(t.id)) {
      if (topicById.has(t.id)) err(rel(key, 'topics'), 'duplicate id ' + t.id + ' (also in ' + topicById.get(t.id).__course + ')');
      else topicById.set(t.id, Object.assign({ __course: key }, t));
    }
  });
});

/* ---------- visuals: each course's own file, and each ladder's kit (static/<ladder>/viz/<ladder>.js) ---------- */
const courseViz = {};      // key -> Set of names
const kitViz = {};         // ladder key -> Set of names (only when the kit exists)
const KIT_OF = {};         // name prefix -> ladder key ("ph-" -> "physics")
LADDERS.forEach(L => { if (isStr(L.viz)) KIT_OF[L.viz] = L.key; });
function namesIn(src, prefix) {
  const set = new Set(); let m; const re = /register\(\s*['"]([\w-]+)['"]/g;
  while ((m = re.exec(src))) set.add(m[1]);
  if (prefix) { const re2 = new RegExp('[\'"](' + prefix.replace(/[^\w]/g, '') + '-[\\w-]+)[\'"]', 'g'); while ((m = re2.exec(src))) set.add(m[1]); }
  return set;
}
LADDERS.forEach(L => {
  const vdir = path.join(ROOT, 'static', L.key, 'viz');
  if (!fs.existsSync(vdir)) return;
  fs.readdirSync(vdir).filter(n => n.endsWith('.js') && !['core.js', 'basic.js', 'adv.js'].includes(n)).forEach(n => {
    const key = n.slice(0, -3), src = fs.readFileSync(path.join(vdir, n), 'utf8');
    if (key === L.key) kitViz[L.key] = namesIn(src, isStr(L.viz) ? L.viz.replace(/-$/, '') : '');
    else courseViz[key] = namesIn(src, key);
  });
});
const notBuilt = {};       // course key -> Set of kit names used but not built yet
function vizProblem(key, name) { // null when the name is fine for this course, else the reason ('' = a warning was noted)
  if (VIZ.has(name) || (courseViz[key] && courseViz[key].has(name))) return null;
  const L = courseLadder[key] || 'math', pre = Object.keys(KIT_OF).find(p => String(name).indexOf(p) === 0);
  if (pre) {
    const kit = KIT_OF[pre];
    if (kitViz[kit] && kitViz[kit].has(name)) return kit === L || L === 'math' ? null : null;
    (notBuilt[key] = notBuilt[key] || new Set()).add(name); return '';
  }
  const other = Object.keys(courseViz).find(k => courseViz[k].has(name));
  return other ? 'visual ' + name + ' is registered in viz/' + other + '.js, which ' + key + ' pages do not load' : 'unknown visual ' + name;
}

/* ---------- per-file checks ---------- */
const checkKeys = only.length ? only : keys;
checkKeys.forEach(key => {
  const data = files[key];
  if (!data) return;
  const W = rel(key, 'topics');
  if (data.course !== key) err(W, 'course is "' + data.course + '", expected "' + key + '"');
  if (!Array.isArray(data.units) || !data.units.length) err(W, 'units must be a non-empty list');
  if (!Array.isArray(data.topics) || !data.topics.length) { err(W, 'topics must be a non-empty list'); return; }
  const unitKeys = new Set(), usedUnits = new Set(), slugs = new Set(), pos = {};
  (data.units || []).forEach((u, i) => {
    if (!u || !isStr(u.key)) { err(W, 'unit ' + i + ' has no key'); return; }
    if (unitKeys.has(u.key)) err(W, 'duplicate unit ' + u.key);
    if (!SLUG.test(u.key)) err(W, 'unit key ' + u.key + ' must be lowercase words joined by hyphens');
    if (!isStr(u.title)) err(W, 'unit ' + u.key + ' has no title');
    if (!isStr(u.blurb)) warn(W, 'unit ' + u.key + ' has no blurb');
    unitKeys.add(u.key);
  });
  data.topics.forEach((t, i) => { if (t && isStr(t.id)) pos[t.id] = i; });
  let lastUnitIdx = -1;
  data.topics.forEach((t, i) => {
    const w = W + ' #' + (i + 1) + (t && t.id ? ' ' + t.id : '');
    if (!t || typeof t !== 'object') { err(w, 'not an object'); return; }
    ['id', 'slug', 'unit', 'title', 'short'].forEach(f => { if (!isStr(t[f])) err(w, 'missing ' + f); });
    if (isStr(t.slug)) {
      if (!SLUG.test(t.slug)) err(w, 'slug must be lowercase words joined by hyphens');
      if (slugs.has(t.slug)) err(w, 'duplicate slug ' + t.slug);
      slugs.add(t.slug);
      if (t.id !== key + '.' + t.slug) err(w, 'id must be "' + key + '.' + t.slug + '"');
    }
    if (isStr(t.unit)) {
      if (!unitKeys.has(t.unit)) err(w, 'unit ' + t.unit + ' is not in units');
      usedUnits.add(t.unit);
      const ui = (data.units || []).findIndex(u => u.key === t.unit);
      if (ui < lastUnitIdx) warn(w, 'unit ' + t.unit + ' appears after a later unit (units are usually listed in order)');
      lastUnitIdx = Math.max(lastUnitIdx, ui);
    }
    if (![1, 2, 3].includes(t.xp)) err(w, 'xp must be 1, 2 or 3');
    if (!Array.isArray(t.prereqs)) err(w, 'prereqs must be a list');
    else {
      if (new Set(t.prereqs).size !== t.prereqs.length) err(w, 'a prerequisite is listed twice');
      t.prereqs.forEach(p => {
        if (p === t.id) { err(w, 'lists itself as a prerequisite'); return; }
        const pt = topicById.get(p);
        if (!pt) { err(w, 'prerequisite ' + p + ' does not exist'); return; }
        if (pt.__course === key) {
          if (pos[p] > i) err(w, 'prerequisite ' + p + ' comes later in the file (topics must be in teaching order)');
        } else if (courseLadder[pt.__course] === courseLadder[key] && courseIndex[pt.__course] > courseIndex[key]) {
          warn(w, 'prerequisite ' + p + ' is in a course higher on the ladder');
        }
      });
    }
    if (!Array.isArray(t.viz)) err(w, 'viz must be a list (it may be empty)');
    else t.viz.forEach(v => { const why = vizProblem(key, v); if (why) err(w, why); });
    if ('std' in t && !isStr(t.std)) err(w, 'std must be a non-empty string or be left out');
    if ('trouble' in t && !isStr(t.trouble)) err(w, 'trouble must be a non-empty string or be left out');
    if ('lab' in t && !(isStr(t.lab) && /^\/[\w\/.-]*(#\S*)?$/.test(t.lab))) err(w, 'lab must be a site path like /science-lab/orbits/ (a #fragment is fine)');
    const known = new Set(['id', 'slug', 'unit', 'title', 'short', 'prereqs', 'xp', 'std', 'trouble', 'viz', 'lab']);
    Object.keys(t).forEach(k => { if (!known.has(k)) warn(w, 'unknown field ' + k); });
  });
  unitKeys.forEach(u => { if (!usedUnits.has(u)) err(W, 'unit ' + u + ' has no topics'); });
});

/* ---------- global acyclicity (iterative DFS over every loaded topic) ---------- */
{
  const state = new Map(); // 1 = on stack, 2 = done
  const reported = new Set();
  for (const start of topicById.keys()) {
    if (state.get(start) === 2) continue;
    const stack = [[start, 0]], trail = [start];
    state.set(start, 1);
    while (stack.length) {
      const top = stack[stack.length - 1];
      const pre = (topicById.get(top[0]).prereqs || []).filter(p => topicById.has(p));
      if (top[1] < pre.length) {
        const nxt = pre[top[1]++];
        const s = state.get(nxt);
        if (s === 1) {
          const cyc = trail.slice(trail.indexOf(nxt)).concat(nxt);
          const sig = cyc.slice(0, -1).sort().join(',');
          if (!reported.has(sig)) { reported.add(sig); err('graph', 'cycle: ' + cyc.join(' -> ')); }
        } else if (!s) { state.set(nxt, 1); stack.push([nxt, 0]); trail.push(nxt); }
      } else { state.set(top[0], 2); stack.pop(); trail.pop(); }
    }
  }
}

/* ---------- lessons (only when the file exists) ---------- */
const notWritten = [];     // courses with a skill map but no lessons and no generators yet
checkKeys.forEach(key => {
  const f = path.join(dataDir(key), 'lessons', key + '.json');
  const L0 = courseLadder[key] || 'math', gf = path.join(ROOT, 'static', L0, 'gen', key + '.js');
  if (files[key] && !fs.existsSync(f)) {
    const nt = (files[key].topics || []).length;
    if (!fs.existsSync(gf)) { notWritten.push(key); warn(rel(key, 'lessons'), 'not yet written: no lessons and no generators (static/' + L0 + '/gen/' + key + '.js) for its ' + nt + ' topics; its pages show "Being written"'); }
    else warn(rel(key, 'lessons'), 'not yet written: no lessons for its ' + nt + ' topics (a topic needs its lesson and its generator to be ready)');
  } else if (files[key] && !fs.existsSync(gf)) warn('static/' + L0 + '/gen/' + key + '.js', 'not yet written: no generators; its topics show "Being written" until both exist');
  else if (files[key]) {
    const src = fs.readFileSync(gf, 'utf8'), lit = (files[key].topics || []).filter(t => isStr(t.id) && src.indexOf("'" + t.id + "'") < 0 && src.indexOf('"' + t.id + '"') < 0);
    if (lit.length) warn('static/' + L0 + '/gen/' + key + '.js', lit.length + ' topic id(s) not written out as a literal string, e.g. ' + lit.slice(0, 3).join(', ') + ': register each generator with its full id (G(\'' + key + '.slug\', …)) so pages know the topic is ready');
  }
  if (!fs.existsSync(f)) return;
  const W = rel(key, 'lessons');
  let L;
  try { L = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { err(W, 'not valid JSON: ' + e.message); return; }
  if (!L || typeof L !== 'object' || Array.isArray(L)) { err(W, 'must be an object keyed by topic id'); return; }
  const ids = new Set(((files[key] || {}).topics || []).map(t => t.id));
  Object.keys(L).forEach(id => {
    const w = W + ' ' + id;
    if (!ids.has(id)) err(w, 'is not a topic id of ' + key);
    const les = L[id];
    if (!les || !Array.isArray(les.blocks) || !les.blocks.length) { err(w, 'needs a non-empty blocks list'); return; }
    les.blocks.forEach((b, i) => {
      const wb = w + ' block ' + (i + 1);
      if (!b || !(b.t in BLOCKS)) { err(wb, 'unknown block type ' + (b && b.t)); return; }
      BLOCKS[b.t].forEach(field => { if (b[field] === undefined || b[field] === '') err(wb, b.t + ' block needs ' + field); });
      if (b.t === 'ex' && !Array.isArray(b.steps)) err(wb, 'ex steps must be a list');
      if (b.t === 'list' && !Array.isArray(b.items)) err(wb, 'list items must be a list');
      if (b.t === 'table' && (!Array.isArray(b.head) || !Array.isArray(b.rows) || b.rows.some(r => !Array.isArray(r)))) err(wb, 'table needs head [] and rows [[]]');
      if (b.t === 'viz' && b.name) { const why = vizProblem(key, b.name); if (why) err(wb, why); }
      if (b.t === 'viz' && b.opts !== undefined && (typeof b.opts !== 'object' || Array.isArray(b.opts))) err(wb, 'viz opts must be an object');
    });
    if (les.sources !== undefined) {
      if (!Array.isArray(les.sources)) err(w, 'sources must be a list');
      else les.sources.forEach((s, i) => { if (!s || !isStr(s.name)) err(w, 'source ' + (i + 1) + ' needs a name'); });
    }
  });
  const missing = [...ids].filter(id => !(id in L));
  if (missing.length) warn(W, missing.length + ' topic(s) have no lesson yet, e.g. ' + missing.slice(0, 3).join(', '));
});

/* ---------- visuals named but not built yet (a ladder's kit is written later) ---------- */
checkKeys.forEach(key => {
  if (notBuilt[key] && notBuilt[key].size) warn(rel(key, 'topics'), notBuilt[key].size + ' visual name(s) not built yet in the ladder\'s kit: ' + [...notBuilt[key]].slice(0, 8).join(', ') + (notBuilt[key].size > 8 ? ', …' : ''));
});

/* ---------- report ---------- */
let total = 0, lastL = null;
checkKeys.forEach(key => {
  const d = files[key];
  if (!d) return;
  const n = (d.topics || []).length; total += n;
  if (!QUIET && courseLadder[key] !== lastL && LADDERS.length > 1) { lastL = courseLadder[key]; const LL = LADDERS.find(x => x.key === lastL); console.log((LL && LL.title) || lastL); }
  if (!QUIET) console.log('  ' + key.padEnd(10) + String(n).padStart(4) + ' topics in ' + (d.units || []).length + ' units' + (notWritten.includes(key) ? '   (not yet written)' : ''));
});
out.forEach(l => console.log(l));
console.log((errors ? 'FAIL' : 'OK') + ': ' + total + ' topics checked, ' + errors + ' error(s), ' + warnings + ' warning(s)');
process.exit(errors ? 1 : 0);
