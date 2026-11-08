"""Shared helpers for the occasion collections written by build_lunchboxes.py, build_birthday.py and build_camping.py.

build(recipes, credits, slug)  turns the R(...) dicts into recipe records (same fields as build_thanksgiving.py)
write(slug, recipes, coll)     checks every id the page points to, then writes data/meals/recipes/<slug>.json

The collection plan (coll) holds: meta {title, url, icon, keywords, blurb}, courses [{id, title, icon, intro, items:['r:id' | 's:id']}],
scratch [ids], default_menu, goals_exclude and sources, plus whatever the page's own tool needs.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import build_recipes as B  # noqa: E402  (parse_ingredients and derive; reads the catalog)

G = lambda t, what: {'name': t.replace('_', ' ').replace('(', '').replace(')', '') + ' (Grokipedia)', 'url': 'https://grokipedia.com/page/' + t, 'what': what}  # noqa: E731


def build(lst, credits, slug):
    out, ids = [], set()
    for r in lst:
        rid = r['id']
        assert rid not in ids, rid
        ids.add(rid)
        ings = B.parse_ingredients(r['ingredients'], rid)
        allergens, diet, guides = B.derive(ings)
        inactive = r.get('inactive', 0)
        fz_ok, fz_text = r['freezer']
        lo = r.get('leftovers')
        if 'food-safety' not in guides and r['safety']:
            guides.append('food-safety')
        tags = list(r['tags'])
        total = r['prep'] + r['cook'] + inactive
        if total <= 30 and 'quick' not in tags:
            tags.append('quick')
        if total > 30 and 'quick' in tags:
            tags.remove('quick')
        if fz_ok and 'freezer-friendly' not in tags:
            tags.append('freezer-friendly')
        if not fz_ok and 'freezer-friendly' in tags:
            tags.remove('freezer-friendly')
        if lo and lo[1] and 'leftovers' not in tags:
            tags.append('leftovers')
        out.append({
            'id': rid, 'name': r['name'], 'emoji': r['emoji'], 'summary': r['summary'],
            'servings': r['servings'], 'serving_size': r['serving_size'],
            'meal': r['meal'], 'protein': r['protein'], 'method': r['method'], 'tags': tags,
            'times': {'prep': r['prep'], 'cook': r['cook'], 'inactive': inactive, 'total': total},
            'equipment': r['equipment'], 'ingredients': ings, 'steps': r['steps'],
            'safety': [{'food': f, 'temp_f': t, 'rest_min': m} for f, t, m in r['safety']],
            'make_ahead': r.get('make_ahead'),
            'freezer': {'ok': fz_ok, 'text': fz_text},
            'leftovers': {'text': lo[0], 'next_day': lo[1]} if lo else None,
            'kids': r.get('kids'), 'swaps': r.get('swaps') or {}, 'prep_day': r.get('prep_day'),
            'pairs': r.get('pairs') or [], 'allergens': allergens, 'diet': diet, 'guides': guides,
            'collection': slug, 'credits': credits.get(rid, []),
        })
    return out


def all_ids(skip):
    ids = {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes.json')))['recipes']}
    for f in os.listdir(os.path.join(SITE, 'data/meals/recipes')):
        if f.endswith('.json') and f != skip:
            ids |= {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes', f)))['recipes']}
    return ids


def write(slug, out, coll, extra_ids=()):
    """extra_ids: other recipe ids the page's tool refers to (must exist)."""
    rec_ids = all_ids(slug + '.json')
    clash = rec_ids & {r['id'] for r in out}
    if clash:
        raise SystemExit(f'ids already used elsewhere: {clash}')
    rec_ids |= {r['id'] for r in out}
    sc_ids = {s['id'] for s in json.load(open(os.path.join(SITE, 'data/meals/scratch.json')))['recipes']}
    allr = []
    for c in coll['courses']:
        for it in c['items']:
            kind, _, i = it.partition(':')
            if (kind == 'r' and i not in rec_ids) or (kind == 's' and i not in sc_ids) or kind not in 'rs':
                raise SystemExit(f'course {c["id"]}: unknown {it}')
            if kind == 'r' and i not in allr:
                allr.append(i)
    for i in coll.get('scratch', []):
        if i not in sc_ids:
            raise SystemExit(f'unknown scratch page {i}')
    for i in list(coll.get('default_menu', [])) + list(coll.get('goals_exclude', [])) + list(extra_ids):
        if i not in rec_ids:
            raise SystemExit(f'unknown recipe {i}')
    missing = {r['id'] for r in out} - set(allr)
    if missing:
        raise SystemExit(f'new recipes not on the page: {missing}')
    coll = dict(coll, all=allr, new=[r['id'] for r in out])
    path = os.path.join(SITE, 'data/meals/recipes', slug + '.json')
    with open(path, 'w') as fh:
        json.dump({'note': f'{coll["meta"]["title"]} (/{coll["meta"]["url"]}): new recipes plus the page plan, which reuses recipes from the other files by id. '
                           f'Edit scripts/meals/src/build_{slug}.py and run it; allergens, diet and guides are derived from the catalog.',
                   'collection': coll, 'recipes': out}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(f'{slug}.json', len(out), 'new recipes;', len(allr), 'recipes on the page')
