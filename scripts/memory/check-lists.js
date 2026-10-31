#!/usr/bin/env node
/* Memory challenge lists: validate data/memory/lists/<slug>.yaml (format in the Memory section plan;
   the engine is static/memory/challenges/engine.js and the pages come from content/memory/challenges/_content.gotmpl).
   Usage: node scripts/memory/check-lists.js [slug ...]      (no slugs: every list)
   YAML is read through python3 (PyYAML), since Node has no YAML reader here.
   Errors fail the run; warnings (W) are printed but pass. */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const DIR = path.join(ROOT, 'data', 'memory', 'lists');
const GROUPS = ['science', 'history', 'civics', 'geography', 'math', 'language', 'scripture', 'everyday'];
const BANNED = /\b(genuinely|honestly|straightforward|book club)\b/i;
const KEYRE = /^[a-z][a-z0-9_]*$/;

function readYaml(files) {
  const py = 'import sys,json,yaml,datetime\n' +
    'def fix(o):\n' +
    '  if isinstance(o,dict): return {(str(k).lower() if isinstance(k,bool) else str(k)):fix(v) for k,v in o.items()}\n' +
    '  if isinstance(o,list): return [fix(v) for v in o]\n' +
    '  if isinstance(o,(datetime.date,datetime.datetime)): return o.isoformat()\n' +
    '  return o\n' +
    'out={}\n' +
    'for f in sys.argv[1:]:\n' +
    '  try: out[f]=fix(yaml.safe_load(open(f,encoding="utf-8")))\n' +
    '  except Exception as e: out[f]={"__error":str(e)}\n' +
    'print(json.dumps(out))\n';
  return JSON.parse(execFileSync('python3', ['-I', '-c', py, ...files], { encoding: 'utf8', maxBuffer: 64 << 20 }));
}

function check(file, L) {
  const E = [], W = [], slug = path.basename(file, '.yaml');
  const err = m => E.push(m), warn = m => W.push(m);
  if (!L || typeof L !== 'object') { err('not a YAML mapping'); return { E, W }; }
  if (L.__error) { err('YAML: ' + L.__error); return { E, W }; }
  if (L.slug !== slug) err('slug "' + L.slug + '" must match the file name "' + slug + '"');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) err('file name must be lower-case words joined by hyphens');
  for (const k of ['title', 'ages', 'intro', 'technique']) if (typeof L[k] !== 'string' || !L[k].trim()) err('missing ' + k);
  if (!GROUPS.includes(L.group)) err('group "' + L.group + '" must be one of ' + GROUPS.join(', '));
  if (typeof L.order_matters !== 'boolean') err('order_matters must be true or false');
  if (L.count_note != null && typeof L.count_note !== 'string') err('count_note must be text');
  if (!L.updated) err('missing updated date');
  // fields
  const F = Array.isArray(L.fields) ? L.fields : (err('fields must be a list'), []);
  const keys = new Set();
  F.forEach((f, i) => {
    if (f && typeof f.key === 'boolean') f.key = String(f.key);   // a bare n / y / no reads as true/false; the engine copes (keys become "false")
    if (!f || !KEYRE.test(f.key || '')) err('fields[' + i + '] needs a key (lower case, letters, digits, _)');
    else if (keys.has(f.key)) err('field key "' + f.key + '" repeats');
    else keys.add(f.key);
    if (!f || typeof f.label !== 'string' || !f.label) err('fields[' + i + '] needs a label');
    if (['hook', 'accept', 'chunk', 'note'].includes(f && f.key)) err('field key "' + f.key + '" is reserved');
  });
  if (F.length < 2) err('at least two fields are needed (a prompt asks one from another)');
  if (Array.isArray(L.show)) L.show = L.show.map(String);
  (Array.isArray(L.prompts) ? L.prompts : []).forEach(p => { if (p) { if (typeof p.ask === 'boolean') p.ask = String(p.ask); if (Array.isArray(p.from)) p.from = p.from.map(String); } });
  if (typeof L.main === 'boolean') L.main = String(L.main);
  const show = Array.isArray(L.show) ? L.show : (err('show must be a list of field keys'), []);
  show.forEach(k => { if (!keys.has(k)) err('show: "' + k + '" is not a field'); });
  // prompts
  const P = Array.isArray(L.prompts) ? L.prompts : (err('prompts must be a list'), []);
  if (!P.length) err('at least one prompt is needed');
  P.forEach((p, i) => {
    if (!p || !keys.has(p.ask)) err('prompts[' + i + '].ask "' + (p && p.ask) + '" is not a field');
    if (!p || !Array.isArray(p.from) || !p.from.length) err('prompts[' + i + '].from must be a list of fields');
    else p.from.forEach(k => { if (!keys.has(k)) err('prompts[' + i + '].from: "' + k + '" is not a field'); if (k === p.ask) err('prompts[' + i + '] asks a field it shows'); });
  });
  if (L.main != null && !keys.has(L.main)) err('main "' + L.main + '" is not a field');
  if (L.recite != null && typeof L.recite !== 'boolean') err('recite must be true or false');
  if (L.recite && !L.order_matters) err('recite: true needs order_matters: true (the text is recited in order)');
  P.forEach((p, i) => { if (p && p.choice != null && typeof p.choice !== 'boolean') err('prompts[' + i + '].choice must be true or false'); });
  const main = L.main || (P[0] && P[0].ask);
  // items
  const I = Array.isArray(L.items) ? L.items : (err('items must be a list'), []);
  if (I.length < 3) err('a list needs at least 3 items');
  if (I.length > 120) warn(I.length + ' items: consider splitting the list into parts');
  const used = new Set([...show, ...P.map(p => p.ask), ...P.flatMap(p => p.from || [])]);
  const seenRow = new Map(), seenMain = new Map();
  I.forEach((it, i) => {
    const at = 'items[' + i + ']';
    if (!it || typeof it !== 'object') { err(at + ' is not a mapping'); return; }
    for (const k of Object.keys(it)) if (!keys.has(k) && !['hook', 'accept', 'chunk', 'note', 'noquiz'].includes(k)) err(at + ': unknown key "' + k + '"');
    if (it.noquiz != null && !(Array.isArray(it.noquiz) && it.noquiz.every(k => keys.has(k)))) err(at + ': noquiz must be a list of field keys (shown in Study, never asked)');
    for (const k of used) {
      const v = it[k];
      if (v == null || (typeof v === 'string' && !v.trim())) err(at + ': missing "' + k + '"');
      else if (typeof v === 'object') err(at + ': "' + k + '" must be text or a number');
      else if (typeof v === 'boolean') err(at + ': "' + k + '" was read as ' + v + ' (YAML turns bare yes/no/on/off/y/n into true/false); put it in quotes');
    }
    for (const k of ['hook', 'chunk', 'note']) if (it[k] != null && typeof it[k] !== 'string') err(at + ': ' + k + ' must be text');
    if (it.accept != null) {
      const ok = Array.isArray(it.accept) ? it.accept.every(s => typeof s === 'string' || typeof s === 'number')
        : (typeof it.accept === 'object' && Object.entries(it.accept).every(([k, v]) => keys.has(k) && Array.isArray(v)));
      if (!ok) err(at + ': accept must be a list of spellings, or a map {field: [spellings]}');
    }
    const row = [...keys].map(k => String(it[k] == null ? '' : it[k])).join('\u0001');
    if (seenRow.has(row)) err(at + ' repeats items[' + seenRow.get(row) + ']'); else seenRow.set(row, i);
    if (main && it[main] != null) {
      const m = String(it[main]).toLowerCase();
      if (seenMain.has(m)) warn(at + ': "' + it[main] + '" appears twice (fine if intended, e.g. a two-term president; say so in count_note)');
      else seenMain.set(m, i);
    }
    for (const k of Object.keys(it)) if (typeof it[k] === 'string' && BANNED.test(it[k])) err(at + '.' + k + ': banned wording "' + it[k].match(BANNED)[0] + '"');
  });
  if (L.order_matters && I.some(it => it && it.n != null) && I.some((it, i) => it && it.n != null && Number(it.n) !== i + 1))
    warn('order_matters, but the n field does not count 1, 2, 3 ... in item order');
  for (const k of ['title', 'intro', 'technique', 'count_note']) if (typeof L[k] === 'string' && BANNED.test(L[k])) err(k + ': banned wording "' + L[k].match(BANNED)[0] + '"');
  // sources
  const S = Array.isArray(L.sources) ? L.sources : [];
  if (!S.length) err('sources must list at least one source');
  S.forEach((s, i) => {
    if (!s || !s.name) err('sources[' + i + '] needs a name');
    if (!s || !/^(https?:\/\/|\/)/.test(s.url || '')) err('sources[' + i + '] needs a url (https://... or a site path)');
    else if (/wikipedia\.org/.test(s.url)) warn('sources[' + i + ']: Wikipedia; use Grokipedia where the article exists');
  });
  return { E, W };
}

if (require.main === module) {
  if (!fs.existsSync(DIR)) { console.log('no data/memory/lists'); process.exit(0); }
  const want = process.argv.slice(2);
  const files = fs.readdirSync(DIR).filter(f => /\.ya?ml$/.test(f)).filter(f => !want.length || want.includes(f.replace(/\.ya?ml$/, ''))).map(f => path.join(DIR, f)).sort();
  const data = readYaml(files);
  let bad = 0, warns = 0, items = 0;
  for (const f of files) {
    const { E, W } = check(f.replace(/\.yml$/, '.yaml'), data[f]);
    const n = data[f] && Array.isArray(data[f].items) ? data[f].items.length : 0; items += n;
    if (E.length || W.length) console.log((E.length ? 'FAIL ' : 'ok   ') + path.basename(f) + ' (' + n + ' items)');
    E.forEach(m => console.log('   E ' + m)); W.forEach(m => console.log('   W ' + m));
    if (E.length) bad++; warns += W.length;
  }
  console.log(files.length + ' lists, ' + items + ' items, ' + bad + ' with errors, ' + warns + ' warnings');
  process.exit(bad ? 1 : 0);
}
module.exports = { check, readYaml };
