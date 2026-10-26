#!/usr/bin/env python3
"""Builds data/meals/recipes.json from recipes_a.py, recipes_b.py and recipes_c.py.

Run:  python3 scripts/meals/src/build_recipes.py [site_dir]
Derives allergens, diet and guide links from data/meals/catalog.json (build the catalog first).
"""
import json, os, sys
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(os.path.join(HERE, '..', '..', '..'))

import recipes_a  # noqa: E402
import recipes_b  # noqa: E402,F401
import recipes_c  # noqa: E402,F401

catalog = {i['id']: i for i in json.load(open(os.path.join(SITE, 'data/meals/catalog.json')))['items']}
meta = json.load(open(os.path.join(SITE, 'data/meals/meta.json')))
UNITS = set(meta['units']['mass']) | set(meta['units']['volume'])


def parse_amount(s):
    total = Fraction(0)
    for part in s.split():
        total += Fraction(part)
    return float(total)


def parse_ingredients(text, rid):
    out, group = [], None
    for line in text.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        if line.endswith(':') and '|' not in line:
            group = line[:-1]
            continue
        flags = ''
        while line[0] in '?~=^':
            flags += line[0]
            line = line[1:]
        main, _, prep = line.partition('|')
        toks = main.split()
        item, unit = toks[-1], toks[-2]
        amount = parse_amount(' '.join(toks[:-2]))
        if item not in catalog:
            raise SystemExit(f'{rid}: unknown item {item}')
        it = catalog[item]
        if unit not in UNITS and unit not in it['counts']:
            raise SystemExit(f'{rid}: unit {unit} not valid for {item}')
        if unit in meta['units']['volume'] and not it['g_per_cup']:
            raise SystemExit(f'{rid}: volume unit {unit} but {item} has no density')
        out.append({'item': item, 'amount': round(amount, 4), 'unit': unit, 'prep': prep.strip() or None, 'group': group,
                    'optional': '?' in flags, 'to_taste': '~' in flags, 'fixed': '=' in flags,
                    'in_nutrition': '^' not in flags})
    return out


def derive(ings):
    req = [catalog[i['item']] for i in ings if not i['optional']]
    allergens = sorted({a for it in req for a in it['allergens']}, key=[x['id'] for x in meta['allergens']].index)
    diet = [d for d in ('vegetarian', 'vegan', 'gluten-free', 'dairy-free') if all(d in it['diet'] for it in req)]
    guides = []
    for i in ings:
        for g in catalog[i['item']]['guides']:
            if g not in guides:
                guides.append(g)
    return allergens, diet, guides


def main():
    out, ids = [], set()
    for r in recipes_a.RECIPES:
        rid = r['id']
        assert rid not in ids, rid
        ids.add(rid)
        ings = parse_ingredients(r['ingredients'], rid)
        allergens, diet, guides = derive(ings)
        inactive = r.get('inactive', 0)
        fz_ok, fz_text = r['freezer']
        lo = r.get('leftovers')
        pd = r.get('prep_day')
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
        if lo and lo[1] and 'leftovers' not in tags:
            tags.append('leftovers')
        out.append({
            'id': rid, 'name': r['name'], 'emoji': r['emoji'], 'summary': r['summary'],
            'servings': r['servings'], 'serving_size': r['serving_size'],
            'meal': r['meal'], 'protein': r['protein'], 'method': r['method'], 'tags': tags,
            'times': {'prep': r['prep'], 'cook': r['cook'], 'inactive': inactive, 'total': total},
            'equipment': r['equipment'],
            'ingredients': ings,
            'steps': r['steps'],
            'safety': [{'food': f, 'temp_f': t, 'rest_min': m} for f, t, m in r['safety']],
            'make_ahead': r.get('make_ahead'),
            'freezer': {'ok': fz_ok, 'text': fz_text},
            'leftovers': {'text': lo[0], 'next_day': lo[1]} if lo else None,
            'kids': r.get('kids'),
            'swaps': r.get('swaps') or {},
            'prep_day': pd,
            'pairs': r.get('pairs') or [],
            'allergens': allergens, 'diet': diet, 'guides': guides,
        })
    for r in out:
        for p in r['pairs']:
            if p not in ids:
                raise SystemExit(f"{r['id']}: pairs with unknown recipe {p}")
    path = os.path.join(SITE, 'data/meals/recipes.json')
    with open(path, 'w') as fh:
        json.dump({'version': 1, 'note': 'Family recipes for /meal-prep/. Edit scripts/meals/src/recipes_*.py and run build_recipes.py; allergens, diet and guides are derived from the catalog.',
                   'recipes': out}, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(len(out), 'recipes')


if __name__ == '__main__':
    main()
