#!/usr/bin/env python3
"""Great Books Ladder checks (run after scripts/greatbooks/build.py).

    python3 scripts/greatbooks/check-gb.py [build dir]

  - data/greatbooks/links.yaml: every rung is a Great Books topic id; every "to" id is a topic of some ladder; no rung
    listed twice; pages have url and title (and, given a build dir, the page exists there).
  - every idea in ideas.yaml is used by at least one rung (warning), every group has ideas.
  - soon flags agree with readiness (a lesson and a generator); built rungs have at least one excerpt or say nopd
    (warning), and science rungs (vols 9-42 in the list below) have at least one cross-link (warning).
  - data/greatbooks/harvard.json refers to existing days.
  - data/greatbooks/ideas_pages/*.yaml (the Great Ideas pages): idea keys, 4-10 stops in time order, rung ids exist, years
    present, stances known, quotes are exact parts of a rung's verified lesson excerpt with its credit, under 40 words, none
    from 1931 or later; 4-6 talk questions; see ids exist.
Exit status 1 on errors.
"""
import json, os, sys, glob
import yaml

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(ROOT, 'data', 'greatbooks')
PUB = sys.argv[1] if len(sys.argv) > 1 else None
errs, warns = [], []


def y(p):
    with open(p, encoding='utf-8') as f:
        return yaml.safe_load(f)


ladders = y(os.path.join(ROOT, 'data', 'ladders.yaml'))
all_ids = set()
for L in ladders:
    for f in glob.glob(os.path.join(ROOT, 'data', L['key'], 'topics', '*.json')):
        with open(f, encoding='utf-8') as fh:
            for t in json.load(fh).get('topics', []):
                all_ids.add(t['id'])
R = y(os.path.join(D, 'rungs.yaml'))['rungs']
rid = {r['id']: r for r in R}
links = y(os.path.join(D, 'links.yaml')) or []
seen = set()
linked = set()
for e in links:
    r = e.get('rung')
    if r not in rid:
        errs.append('links.yaml: rung %s is not a Great Books rung' % r)
    if r in seen:
        errs.append('links.yaml: rung %s is listed twice (merge the blocks)' % r)
    seen.add(r)
    for t in e.get('to') or []:
        if t not in all_ids:
            errs.append('links.yaml %s: target %s is not a topic of any ladder' % (r, t))
        elif t.split('.')[0].startswith('gb'):
            warns.append('links.yaml %s: target %s is another Great Books rung' % (r, t))
        else:
            linked.add(r)
    for p in e.get('pages') or []:
        if not (p.get('url', '').startswith('/') and p.get('title')):
            errs.append('links.yaml %s: pages need url (a site path) and title' % r)
        elif PUB and not os.path.exists(os.path.join(PUB, p['url'].split('#')[0].strip('/'), 'index.html')):
            errs.append('links.yaml %s: page %s is not in the build' % (r, p['url']))

ideas = y(os.path.join(D, 'ideas.yaml'))
used = {i for r in R for i in (r.get('ideas') or [])}
for i in ideas['ideas']:
    if i['key'] not in used:
        warns.append('ideas.yaml: %s is not used by any rung yet' % i['key'])
for g in ideas['groups']:
    if not [i for i in ideas['ideas'] if i['group'] == g['key']]:
        errs.append('ideas.yaml: group %s has no ideas' % g['key'])

lessons = {}
for f in glob.glob(os.path.join(D, 'lessons', '*.json')):
    with open(f, encoding='utf-8') as fh:
        lessons.update(json.load(fh))
gens = ''
for f in glob.glob(os.path.join(ROOT, 'static', 'greatbooks', 'gen', '*.js')):
    with open(f, encoding='utf-8') as fh:
        gens += fh.read()
SCI = {'hippocrates', 'galen', 'euclid', 'archimedes', 'nicomachus', 'aristotle-physics', 'aristotle-on-the-heavens', 'aristotle-biology',
       'lucretius', 'ptolemy', 'copernicus', 'kepler', 'gilbert', 'galileo', 'harvey', 'bacon-novum', 'descartes-geometry',
       'descartes-discourse', 'pascal-scientific', 'newton', 'huygens', 'lavoisier', 'faraday', 'darwin'}
nb = 0
for r in R:
    i = r['id']
    ready = i in lessons and ("'%s'" % i in gens or '"%s"' % i in gens)
    nb += ready
    if ready and r.get('soon'):
        warns.append('rungs.yaml %s: built, but still soon: true' % i)
    if not ready and not r.get('soon') and not i.startswith('gbstart.'):
        warns.append('rungs.yaml %s: not built, but not marked soon' % i)
    slug = i.split('.', 1)[1]
    if ready and any(slug.startswith(s) for s in SCI):
        if i not in linked:
            warns.append('%s: a science rung with no cross-links in links.yaml' % i)
        html = json.dumps(lessons[i])
        if 'gb-quote' not in html and not r.get('nopd'):
            warns.append('%s: built with no excerpt (and not nopd)' % i)

hc = {}
hp = os.path.join(D, 'harvard.json')
if os.path.exists(hp):
    with open(hp, encoding='utf-8') as fh:
        hc = json.load(fh)
days = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, 'data', 'harvard', 'days', '*.json'))}
for k, v in hc.items():
    if k not in rid:
        errs.append('harvard.json: %s is not a rung (rebuild)' % k)
    for d in v:
        if d['id'] not in days:
            errs.append('harvard.json %s: day %s does not exist' % (k, d['id']))

# ---- Great Ideas pages (data/greatbooks/ideas_pages/<key>.yaml; owner: gbideas) ----
import re as _re, html as _html


def _norm(t):
    return _re.sub(r'\s+', ' ', _html.unescape(_re.sub(r'<[^>]+>', ' ', str(t)))).strip()


def _lesson_quotes(rung):
    p = os.path.join(ROOT, 'scripts', 'greatbooks', 'src', rung, 'lesson.json')
    out = []
    if not os.path.exists(p):
        return out
    def walk(x):
        if isinstance(x, dict):
            if x.get('t') == 'quote':
                out.append(x)
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    with open(p, encoding='utf-8') as fh:
        walk(json.load(fh))
    return out


def _rung_year(r):
    if r.get('year') is not None:
        return r['year']
    d = str(r.get('date') or '')
    m = _re.search(r'(\d{1,4})', d)
    if not m:
        return None
    v = int(m.group(1))
    return -v if ' BC' in d else v


ikeys = [i['key'] for i in ideas['ideas']]
npages = nstops = 0
BANNED = _re.compile(r'\b(genuinely|honestly|straightforward|book club)\b', _re.I)
for f in sorted(glob.glob(os.path.join(D, 'ideas_pages', '*.yaml'))):
    k = os.path.basename(f)[:-5]
    w = 'ideas_pages/%s' % k
    P = y(f) or {}
    npages += 1
    if k not in ikeys:
        errs.append('%s: %s is not an idea key in ideas.yaml' % (w, k))
    if P.get('key') != k:
        errs.append('%s: key must be %s' % (w, k))
    if not str(P.get('question') or '').strip():
        errs.append('%s: no question' % w)
    sk = [s_['key'] for s_ in P.get('stances') or []]
    if len(sk) > 4:
        errs.append('%s: at most 4 stances' % w)
    stops = P.get('stops') or []
    nstops += len(stops)
    if not 4 <= len(stops) <= 10:
        errs.append('%s: %d stops (want 4-10)' % (w, len(stops)))
    last = None
    for n, st in enumerate(stops, 1):
        ws = '%s stop %d' % (w, n)
        r = rid.get(st.get('rung'))
        if not r:
            errs.append('%s: rung %s does not exist' % (ws, st.get('rung')))
            continue
        yr = st.get('year')
        if not isinstance(yr, int):
            errs.append('%s: year missing or not a number' % ws)
            continue
        if last is not None and yr < last:
            errs.append('%s: out of time order (%d after %d)' % (ws, yr, last))
        last = yr
        ry = _rung_year(r)
        if ry is not None and abs(ry - yr) > 80:
            warns.append('%s: year %d is far from the rung date %s' % (ws, yr, r.get('date')))
        if st.get('stance') and st['stance'] not in sk:
            errs.append('%s: stance %s is not in stances' % (ws, st['stance']))
        txt = str(st.get('text') or '')
        if len(txt.split()) < 15:
            errs.append('%s: text too short' % ws)
        q = st.get('quote')
        if q:
            qt = _norm(q.get('text', ''))
            if len(qt.split()) > 40:
                errs.append('%s: quote over 40 words' % ws)
            try:
                qy = int(_re.match(r'\d+', str(q.get('year'))).group())
            except Exception:
                qy = 9999
            if qy >= 1931:
                errs.append('%s: quote from %s (nothing from 1931 or later)' % (ws, q.get('year')))
            hit = [x for x in _lesson_quotes(r['id']) if qt and qt in _norm(x.get('text', ''))]
            if not hit:
                errs.append('%s: quote is not part of a verified excerpt in the rung lesson' % ws)
            elif not any(all(str(x.get(a, '')) == str(q.get(a, '')) for a in ('author', 'work', 'tr', 'ed', 'year', 'src', 'url')) for x in hit):
                errs.append('%s: quote credit does not match the lesson excerpt' % ws)
        if BANNED.search(txt):
            errs.append('%s: banned word' % ws)
    talk = P.get('talk') or []
    if not 4 <= len(talk) <= 6:
        errs.append('%s: %d talk questions (want 4-6)' % (w, len(talk)))
    if not P.get('young'):
        errs.append('%s: no young-readers part' % w)
    for t in P.get('see') or []:
        if t not in all_ids:
            errs.append('%s: see %s is not a topic of any ladder' % (w, t))
    if not (P.get('see') or P.get('pages')):
        warns.append('%s: nothing under Where else on the site' % w)
    for pg in P.get('pages') or []:
        if not (str(pg.get('url', '')).startswith('/') and pg.get('title')):
            errs.append('%s: pages need url and title' % w)
        elif PUB and not os.path.exists(os.path.join(PUB, pg['url'].split('#')[0].strip('/'), 'index.html')):
            errs.append('%s: page %s is not in the build' % (w, pg['url']))
    blob = json.dumps(P, ensure_ascii=False)
    if BANNED.search(blob):
        errs.append('%s: banned word somewhere in the file' % w)
missing = [k for k in ikeys if not os.path.exists(os.path.join(D, 'ideas_pages', k + '.yaml'))]
if missing:
    warns.append('ideas_pages: %d idea(s) without a page: %s' % (len(missing), ', '.join(missing[:8])))

for e in errs:
    print('ERROR', e)
for w in warns:
    print('warn ', w)
print('check-gb: %d rungs, %d built, %d with cross-links, %d with Harvard Classics days; %d idea pages, %d stops; %d error(s), %d warning(s)' % (
    len(R), nb, len(linked), len(hc), npages, nstops, len(errs), len(warns)))
sys.exit(1 if errs else 0)
