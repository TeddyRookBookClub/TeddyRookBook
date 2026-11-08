#!/usr/bin/env python3
"""Shared helpers for the holiday-and-party collection generators that use the "occasion" page
(layouts/meal-prep/occasion.html, static/meal-prep/occasion.js):

  build_cookout.py   -> data/meals/recipes/cookout.json    /meal-prep/cookout/
  build_game_day.py  -> data/meals/recipes/game-day.json   /meal-prep/game-day/
  build_hanukkah.py  -> data/meals/recipes/hanukkah.json   /meal-prep/hanukkah/

Each generator lists its NEW recipes (same fields as build_recipes.py / build_thanksgiving.py) and a page plan
(collection) that reuses recipes and from-scratch pages from the rest of Meal Prep by id. This module turns the
recipe dicts into the JSON schema (allergens, diet and guides derived from the catalog), checks every id the page
points to, and writes the file.

collection keys used by the page:
  meta            {title, url, icon, blurb, keywords}: read by recipe.html (crumb, "in our collection" link) and the
                  recipe page adapter (keywords)
  courses         [{id, title, icon, intro, items:['r:<recipe id>' | 's:<from-scratch id>']}]
  menu_courses    course ids shown in the menu builder (default: all)
  full_courses    course ids served as full portions; the others can be half portions
  default_menu    recipe ids checked to start
  day             per recipe: {oven:[°F, min], grill:min, stove:min, fry:min, slow:min, chill:min, ahead:days,
                  ahead_part:'text', last:bool}: what it needs on the day, for the countdown
  howmuch         [{what, per, unit, note}]: rough amounts per guest for the "how much" table
  goals_exclude   recipe ids the goal planner (/meal-prep/goals/) never suggests (party food and desserts)
  event           {label, time, hours, hot}: defaults for the countdown
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = os.path.abspath(os.path.join(HERE, '..', '..', '..'))

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


def write(slug, out, coll, note):
    """Check every id the page uses, then write data/meals/recipes/<slug>.json."""
    fname = slug + '.json'
    rec_ids = {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes.json')))['recipes']}
    for f in os.listdir(os.path.join(SITE, 'data/meals/recipes')):
        if f.endswith('.json') and f != fname:
            rec_ids |= {r['id'] for r in json.load(open(os.path.join(SITE, 'data/meals/recipes', f)))['recipes']}
    clash = rec_ids & {r['id'] for r in out}
    if clash:
        raise SystemExit(f'{slug}: ids already used elsewhere: {clash}')
    rec_ids |= {r['id'] for r in out}
    sc_ids = {s['id'] for s in json.load(open(os.path.join(SITE, 'data/meals/scratch.json')))['recipes']}
    allr = []
    for c in coll['courses']:
        for it in c['items']:
            kind, _, i = it.partition(':')
            if (kind == 'r' and i not in rec_ids) or (kind == 's' and i not in sc_ids) or kind not in ('r', 's'):
                raise SystemExit(f'{slug}: course {c["id"]}: unknown {it}')
            if kind == 'r' and i not in allr:
                allr.append(i)
    for i in coll.get('scratch', []):
        if i not in sc_ids:
            raise SystemExit(f'{slug}: unknown scratch page {i}')
    for i in list(coll['default_menu']) + list(coll['day']) + list(coll.get('goals_exclude', [])):
        if i not in rec_ids:
            raise SystemExit(f'{slug}: unknown recipe {i}')
    for i in coll['default_menu']:
        if i not in allr:
            raise SystemExit(f'{slug}: default menu dish {i} is not on the page')
    cids = {c['id'] for c in coll['courses']}
    for k in ('menu_courses', 'full_courses'):
        for c in coll.get(k, []):
            if c not in cids:
                raise SystemExit(f'{slug}: {k} names unknown course {c}')
    new_ids = {r['id'] for r in out}
    missing = new_ids - set(allr)
    if missing:
        raise SystemExit(f'{slug}: new recipes not on the page: {missing}')
    coll = dict(coll, all=allr, new=[r['id'] for r in out])
    path = os.path.join(SITE, 'data/meals/recipes', fname)
    with open(path, 'w') as fh:
        json.dump({'note': note, 'collection': coll, 'recipes': out}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(fname, len(out), 'new recipes;', len(allr), 'recipes on the page;', len(allr) - len(out), 'reused')
