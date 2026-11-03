#!/usr/bin/env python3
"""Great Books Ladder checks (run after scripts/greatbooks/build.py).

    python3 scripts/greatbooks/check-gb.py [build dir]

  - data/greatbooks/links.yaml: every rung is a Great Books topic id; every "to" id is a topic of some ladder; no rung
    listed twice; pages have url and title (and, given a build dir, the page exists there).
  - every idea in ideas.yaml is used by at least one rung (warning), every group has ideas.
  - soon flags agree with readiness (a lesson and a generator); built rungs have at least one excerpt or say nopd
    (warning), and science rungs (vols 9-42 in the list below) have at least one cross-link (warning).
  - data/greatbooks/harvard.json refers to existing days.
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

for e in errs:
    print('ERROR', e)
for w in warns:
    print('warn ', w)
print('check-gb: %d rungs, %d built, %d with cross-links, %d with Harvard Classics days; %d error(s), %d warning(s)' % (
    len(R), nb, len(linked), len(hc), len(errs), len(warns)))
sys.exit(1 if errs else 0)
