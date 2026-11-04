#!/usr/bin/env python3
"""Great Books Ladder: match rungs to Harvard Classics Daily readings (data/harvard/guide.json, the 1930 Reading Guide).

    python3 scripts/greatbooks/harvard.py        print the matches (build.py calls build() and writes data/greatbooks/harvard.json)

Rules
  - A reading matches a rung when its author is the rung's author (accents, "Æ" and hyphens ignored), or one of the names
    in the rung's hc.author ("A|B"). A rung with hc.any: true matches readings by any author whose work fits hc.works
    (e.g. the Declaration of Independence, which the Guide prints without an author).
  - When an author has several rungs, a reading goes to the rungs whose hc.works pattern (a regex) fits its work or title;
    a reading no pattern fits goes to the author's rung with hc.default: true (else the author's first rung).
  - same: true when the reading is from the rung's own work (the pattern fits, or the titles overlap); false when it is
    another work by the same author. The rung page lists "From this work" first, then "More by <author>".
  - data/greatbooks/harvard_overrides.yaml: { <rung id>: { add: [day ids], drop: [day ids] } }. An added day by the rung's
    author gets same as above; one by another author (a source, a commentary, the same historical figures) gets rel: true,
    and the rung page lists it under "Related readings".
Output: { rung id: [ { id, slug, url, date, title, author, work, same, rel } ] }, by date in the year.
"""
import json, os, re, sys, unicodedata

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def norm(s):
    s = (s or '').replace('Æ', 'Ae').replace('æ', 'ae').replace('Œ', 'Oe').replace('œ', 'oe').replace('-', ' ').replace('’', "'")
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(ch for ch in s if not unicodedata.combining(ch)).lower()
    return re.sub(r'[^a-z0-9 ]+', '', re.sub(r'\s+', ' ', s)).strip()


def build(rungs, root, warn=lambda m: None):
    with open(os.path.join(root, 'data', 'harvard', 'guide.json'), encoding='utf-8') as f:
        guide = json.load(f)
    ov = {}
    op = os.path.join(root, 'data', 'greatbooks', 'harvard_overrides.yaml')
    if os.path.exists(op):
        import yaml
        with open(op, encoding='utf-8') as f:
            ov = yaml.safe_load(f) or {}
    # author name -> rungs (in ladder order)
    names = {}
    anyw = []
    for r in rungs:
        hcf = r.get('hc') or {}
        if r.get('author') in (None, '', 'Teddy Rook Book'):
            continue
        alts = hcf.get('author', '').split('|') if hcf.get('author') else [r['author']]
        for a in alts:
            names.setdefault(norm(a), []).append(r)
        if hcf.get('any') and hcf.get('works'):
            anyw.append(r)
    out = {}

    def add(r, day, rd, same, rel=False):
        lst = out.setdefault(r['id'], [])
        if any(x['id'] == day['id'] and x['work'] == rd['work'] for x in lst):
            return
        lst.append({'id': day['id'], 'slug': day['slug'], 'url': '/harvard-classics/' + day['slug'] + '/',
                    'date': MONTHS[day['month'] - 1] + ' ' + str(day['day']), 'title': day['title'],
                    'author': rd.get('author') or '', 'work': rd.get('work') or '', 'same': bool(same), 'rel': bool(rel)})

    def fits(r, rd):
        pat = (r.get('hc') or {}).get('works')
        text = (rd.get('work') or '') + ' | ' + (rd.get('title') or '')
        return bool(pat and re.search(pat, text, re.I))

    def overlap(r, rd):
        a, b = norm(rd.get('title') or rd.get('work')), norm(r.get('work'))
        a = re.sub(r'^(the|a|an) ', '', a)
        return bool(a) and len(a) > 3 and a in b

    for day in guide['days']:
        for rd in day['readings']:
            au = norm(rd.get('author'))
            rs = names.get(au, [])
            if rs:
                hit = [r for r in rs if fits(r, rd)]
                if hit:
                    for r in hit:
                        add(r, day, rd, True)
                else:
                    d = [r for r in rs if (r.get('hc') or {}).get('default')] or rs[:1]
                    add(d[0], day, rd, overlap(d[0], rd))
            for r in anyw:
                if r not in rs and fits(r, rd):
                    add(r, day, rd, True)
    for rid, o in ov.items():
        o = o or {}
        for did in o.get('drop') or []:
            if rid in out:
                out[rid] = [x for x in out[rid] if x['id'] != did]
        for did in o.get('add') or []:
            day = next((d for d in guide['days'] if d['id'] == did), None)
            r = next((x for x in rungs if x['id'] == rid), None)
            if not day or not r:
                warn('harvard_overrides.yaml: unknown day ' + str(did) + ' or rung ' + rid)
                continue
            for rd in day['readings'][:1]:
                # same author: from this work if the pattern or title fits, else another work by the author;
                # another author (a source, a commentary, the same historical figures): a related reading
                if r in names.get(norm(rd.get('author')), []):
                    add(r, day, rd, fits(r, rd) or overlap(r, rd))
                else:
                    add(r, day, rd, False, True)
    for k in list(out):
        out[k].sort(key=lambda x: x['id'])
        if not out[k]:
            del out[k]
    return dict(sorted(out.items()))


if __name__ == '__main__':
    import yaml
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    with open(os.path.join(root, 'data', 'greatbooks', 'rungs.yaml'), encoding='utf-8') as f:
        rs = yaml.safe_load(f)['rungs']
    res = build(rs, root, print)
    for rid, days in res.items():
        print(rid)
        for d in days:
            print('   ', d['id'], ('same ' if d['same'] else 'other'), d['work'], '|', d['title'])
