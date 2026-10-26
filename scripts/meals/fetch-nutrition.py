#!/usr/bin/env python3
"""Fill data/meals/catalog.json nutrition (per 100 g) from USDA FoodData Central, SR Legacy.

Two ways to get the data (standard library only):

  bulk (default)  downloads FDC's public SR Legacy CSV zip (about 7 MB) once and works offline from it:
                    python3 scripts/meals/fetch-nutrition.py
                  or, if you downloaded the zip yourself in a browser from https://fdc.nal.usda.gov/download-datasets:
                    python3 scripts/meals/fetch-nutrition.py --zip ~/Downloads/FoodData_Central_sr_legacy_food_csv_2018-04.zip
  api             uses api.nal.usda.gov. DEMO_KEY allows only about 30 requests an hour, so get a free key at
                  https://fdc.nal.usda.gov/api-key-signup and pass it (responses are cached, so you can resume):
                    FDC_API_KEY=yourkey python3 scripts/meals/fetch-nutrition.py --source api

How items are matched:
  1. item.fdc.id (ids seen in search results or earlier site data); the description is compared with item.fdc.query
     and a mismatch is reported.
  2. otherwise the exact SR Legacy description in item.fdc.query (case-insensitive);
  3. otherwise the closest description by word overlap, used only when it scores >= 0.8 and is reported as "fuzzy";
     anything weaker is left empty and listed with candidates, so you can set item.fdc.id or fix the query in
     scripts/meals/src/build_catalog.py and run again.
  Items with fdc.proxy reuse another item's numbers (labelled as an estimate).
Then run:  node scripts/meals/check-data.js --totals
"""
import argparse, csv, difflib, io, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SITE_DEFAULT = os.path.abspath(os.path.join(HERE, '..', '..'))
SR_ZIP_URL = 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip'
API = 'https://api.nal.usda.gov/fdc/v1'

# our nutrient id -> FDC nutrient numbers, in order of preference
NUTRIENTS = {
    'kcal': ['208'], 'protein': ['203'], 'fat': ['204'], 'satfat': ['606'], 'carb': ['205'], 'fiber': ['291'],
    'sugars': ['269'], 'sodium': ['307'], 'calcium': ['301'], 'iron': ['303'], 'potassium': ['306'],
    'mufa': ['645'], 'pufa': ['646'], 'la': ['618', '675'], 'ala': ['619', '851'],
}
REQUIRED = ['kcal', 'protein', 'fat', 'carb', 'sodium']
FAT_EXTRA = {'mufa', 'pufa', 'la', 'ala'}


FDP = "(includes foods for usda's food distribution program)"


def norm(s):
    s = re.sub(r'\s+', ' ', (s or '').strip().lower())
    s = s.replace(FDP, '').strip().rstrip('.').strip()
    return s


def words(s):
    return set(re.findall(r'[a-z0-9%]+', norm(s)))


def score(query, desc):
    a, b = words(query), words(desc)
    if not a or not b:
        return 0.0
    jacc = len(a & b) / len(a | b)
    ratio = difflib.SequenceMatcher(None, norm(query), norm(desc)).ratio()
    return round(0.6 * jacc + 0.4 * ratio, 3)


def http_get(url, data=None, timeout=60):
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'teddyrookbook-meal-prep/1.0',
                                                          'Content-Type': 'application/json'} if data else
                                 {'User-Agent': 'teddyrookbook-meal-prep/1.0'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def explain_network_error(e, host):
    msg = str(e)
    if 'Tunnel connection failed' in msg or '403' in msg:
        return (f'{host} is blocked by the network proxy here ({msg}). Ask for the host to be allowed, or download the '
                f'file in a browser and use --zip.')
    return f'could not reach {host}: {msg}'


# ---------------------------------------------------------------- bulk (SR Legacy CSV)
def load_bulk(zip_path, cache_dir):
    if not zip_path:
        os.makedirs(cache_dir, exist_ok=True)
        zip_path = os.path.join(cache_dir, os.path.basename(SR_ZIP_URL))
        if not os.path.exists(zip_path):
            print(f'downloading {SR_ZIP_URL} ...', flush=True)
            try:
                blob = http_get(SR_ZIP_URL, timeout=300)
            except (urllib.error.URLError, OSError) as e:
                sys.exit('ERROR: ' + explain_network_error(e, 'fdc.nal.usda.gov'))
            with open(zip_path + '.part', 'wb') as fh:
                fh.write(blob)
            os.replace(zip_path + '.part', zip_path)
    z = zipfile.ZipFile(zip_path)
    names = {os.path.basename(n): n for n in z.namelist()}
    for need in ('food.csv', 'nutrient.csv', 'food_nutrient.csv'):
        if need not in names:
            sys.exit(f'ERROR: {need} not found in {zip_path}; is this the SR Legacy CSV zip?')

    def rows(name):
        with z.open(names[name]) as fh:
            yield from csv.DictReader(io.TextIOWrapper(fh, encoding='utf-8-sig'))

    foods = {}
    for r in rows('food.csv'):
        if r.get('data_type', 'sr_legacy_food') in ('sr_legacy_food', ''):
            foods[int(r['fdc_id'])] = {'description': r['description'], 'nutrients': {}}
    nbr = {r['id']: r['nutrient_nbr'] for r in rows('nutrient.csv')}
    wanted = {n for lst in NUTRIENTS.values() for n in lst}
    for r in rows('food_nutrient.csv'):
        fid = int(r['fdc_id'])
        if fid not in foods:
            continue
        num = nbr.get(r['nutrient_id'], '')
        num = num[:-2] if num.endswith('.0') else num
        if num in wanted and r['amount'] not in ('', None):
            foods[fid]['nutrients'][num] = float(r['amount'])
    print(f'SR Legacy: {len(foods)} foods loaded from {zip_path}')
    return foods


# ---------------------------------------------------------------- api
class Api:
    def __init__(self, key, cache_dir):
        self.key = key
        self.cache_path = os.path.join(cache_dir, 'api-cache.json')
        os.makedirs(cache_dir, exist_ok=True)
        self.cache = json.load(open(self.cache_path)) if os.path.exists(self.cache_path) else {}
        self.calls = 0

    def _call(self, url, body=None):
        ck = url + (json.dumps(body, sort_keys=True) if body else '')
        if ck in self.cache:
            return self.cache[ck]
        sep = '&' if '?' in url else '?'
        full = f'{url}{sep}api_key={urllib.parse.quote(self.key)}'
        for attempt in range(4):
            try:
                self.calls += 1
                out = json.loads(http_get(full, json.dumps(body).encode() if body else None))
                self.cache[ck] = out
                json.dump(self.cache, open(self.cache_path, 'w'))
                return out
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    sys.exit('ERROR: API rate limit reached (HTTP 429). Results so far are cached; wait an hour or use '
                             'a personal key (FDC_API_KEY), then run again.')
                if attempt == 3:
                    raise
                time.sleep(2 * (attempt + 1))
            except (urllib.error.URLError, OSError) as e:
                sys.exit('ERROR: ' + explain_network_error(e, 'api.nal.usda.gov'))

    @staticmethod
    def _nutrients(food):
        out = {}
        for fn in food.get('foodNutrients', []):
            if 'nutrient' in fn:   # /foods (full format)
                num, amt = str(fn['nutrient'].get('number', '')), fn.get('amount')
            else:                  # /foods/search
                num, amt = str(fn.get('nutrientNumber', '')), fn.get('value')
            if amt is not None:
                out[num] = float(amt)
        return out

    def by_ids(self, ids):
        res = {}
        ids = sorted(set(ids))
        for i in range(0, len(ids), 20):
            for f in self._call(f'{API}/foods', {'fdcIds': ids[i:i + 20], 'format': 'full'}) or []:
                res[int(f['fdcId'])] = {'description': f.get('description', ''), 'nutrients': self._nutrients(f)}
        return res

    def search(self, query):
        q = urllib.parse.quote(query)
        out = self._call(f'{API}/foods/search?query={q}&dataType=SR%20Legacy&pageSize=25') or {}
        return {int(f['fdcId']): {'description': f.get('description', ''), 'nutrients': self._nutrients(f)}
                for f in out.get('foods', [])}


# ---------------------------------------------------------------- matching
def to_nutrition(rec, fid, match):
    n, missing = {}, []
    for key, nums in NUTRIENTS.items():
        val = next((rec['nutrients'][x] for x in nums if x in rec['nutrients']), None)
        if val is None:
            if key in FAT_EXTRA:
                continue
            missing.append(key)
        n[key] = None if val is None else round(val, 3)
    # SR Legacy leaves sugars or fiber blank for some foods with essentially no carbohydrate
    for key in ('fiber', 'sugars'):
        if n.get(key) is None and n.get('carb') is not None and n['carb'] < 0.5:
            n[key] = 0.0
            missing.remove(key)
    n['src'] = f'USDA FoodData Central {fid} (SR Legacy)'
    if missing:
        n['missing'] = missing
    return n


def choose(item, foods):
    """Return (fdc_id, match, candidates) for an item using the SR Legacy food dict."""
    f = item['fdc']
    q = f.get('query') or item['name']
    if f.get('id'):
        fid = int(f['id'])
        if fid in foods:
            sc = score(q, foods[fid]['description'])
            return fid, ('id' if sc >= 0.5 or not f.get('query') else 'id-mismatch'), []
        # the id is not in this data set: fall back to the description, but report it
        alt = choose(dict(item, fdc=dict(f, id=None)), foods)
        return alt[0], ('id-not-found' if alt[0] is None else 'id-not-found-' + alt[1]), alt[2]
    exact = [fid for fid, rec in foods.items() if norm(rec['description']) == norm(q)]
    if exact:
        return exact[0], 'exact', []
    cands = sorted(((score(q, rec['description']), fid) for fid, rec in foods.items()), reverse=True)[:3]
    if cands and cands[0][0] >= 0.8:
        return cands[0][1], 'fuzzy', cands
    return None, 'not-found', cands


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--site', default=SITE_DEFAULT)
    ap.add_argument('--source', choices=['bulk', 'api'], default='bulk')
    ap.add_argument('--zip', help='path to a downloaded SR Legacy CSV zip')
    ap.add_argument('--api-key', default=os.environ.get('FDC_API_KEY', 'DEMO_KEY'))
    ap.add_argument('--cache', default=os.path.join(os.environ.get('TMPDIR', '/tmp'), 'trb-fdc-cache'))
    ap.add_argument('--dry-run', action='store_true', help='report matches without writing catalog.json')
    ap.add_argument('--refetch', action='store_true', help='refill items that already have nutrition')
    a = ap.parse_args()

    cat_path = os.path.join(a.site, 'data', 'meals', 'catalog.json')
    doc = json.load(open(cat_path))
    items = doc['items']
    todo = [it for it in items if (a.refetch or not it.get('nutrition')) and not it['fdc'].get('proxy')
            and it['fdc'].get('status') != 'none']

    if a.source == 'bulk':
        foods = load_bulk(a.zip, a.cache)
        lookup = lambda it: (foods, choose(it, foods))
    else:
        api = Api(a.api_key, a.cache)
        ids = [it['fdc']['id'] for it in todo if it['fdc'].get('id')]
        byid = api.by_ids(ids) if ids else {}
        n_search = sum(1 for it in todo if not it['fdc'].get('id'))
        print(f'API: {len(ids)} items by id ({(len(ids) + 19) // 20} requests), {n_search} by search (1 request each).')
        if a.api_key == 'DEMO_KEY' and n_search > 25:
            print('note: DEMO_KEY allows about 30 requests an hour; cached results let you resume. A free personal key is faster.')

        def lookup(it):
            pool = dict(byid) if it['fdc'].get('id') else api.search(it['fdc'].get('query') or it['name'])
            return pool, choose(it, pool)

    report = {'id-not-found-exact': [], 'id-not-found-fuzzy': [], 'id': [], 'exact': [], 'fuzzy': [], 'id-mismatch': [], 'id-not-found': [], 'not-found': [], 'proxy': [], 'missing': []}
    for it in todo:
        pool, (fid, match, cands) = lookup(it)
        report[match].append((it, fid, cands, pool))
        if fid is None:
            continue
        rec = pool[fid]
        it['nutrition'] = to_nutrition(rec, fid, match)
        it['fdc'].update(id=fid, description=rec['description'], match=match, status='filled', dataType='SR Legacy')
        if it['nutrition'].get('missing'):
            report['missing'].append((it, fid, it['nutrition']['missing'], pool))
    byid_items = {it['id']: it for it in items}
    for it in items:
        p = it['fdc'].get('proxy')
        if p and (a.refetch or not it.get('nutrition')):
            src = byid_items.get(p, {}).get('nutrition')
            if src:
                n = dict(src)
                n['src'] = f"estimate: same as {byid_items[p]['name']} ({src.get('src', 'FDC')})"
                it['nutrition'] = n
                it['fdc'].update(status='filled', match='proxy', id=byid_items[p]['fdc'].get('id'))
                report['proxy'].append((it, p, [], None))

    lines = [f'FoodData Central fill report ({a.source})', '']
    for k, label in [('id', 'matched by FDC id'), ('exact', 'matched by exact description'), ('fuzzy', 'FUZZY matches: check these'),
                     ('id-mismatch', 'FDC id description differs from query: check'), ('id-not-found', 'FDC id not found'),
                     ('not-found', 'NOT FOUND: set fdc.id or fix the query'), ('proxy', 'filled from proxy item'),
                     ('id-not-found-exact', 'FDC id not found, matched by exact description instead'),
                     ('id-not-found-fuzzy', 'FDC id not found, FUZZY match by description: check'),
                     ('missing', 'some nutrients blank in FDC')]:
        rows = report[k]
        lines.append(f'{label}: {len(rows)}')
        if k in ('fuzzy', 'id-mismatch', 'id-not-found', 'not-found', 'missing', 'id-not-found-exact', 'id-not-found-fuzzy'):
            for it, fid, extra, pool in rows:
                if k in ('fuzzy', 'id-not-found-fuzzy', 'id-not-found-exact'):
                    lines.append(f"  {it['id']}: query '{it['fdc'].get('query')}' -> {fid} '{pool[fid]['description']}'")
                elif k == 'missing':
                    lines.append(f"  {it['id']} ({fid}): {', '.join(extra)}")
                elif k == 'id-mismatch':
                    lines.append(f"  {it['id']}: id {fid} is '{pool[fid]['description']}' but query is '{it['fdc'].get('query')}'")
                else:
                    lines.append(f"  {it['id']}: id {it['fdc'].get('id')} query '{it['fdc'].get('query')}'")
                    for sc, cf in extra or []:
                        lines.append(f"      candidate {cf} ({sc}): {pool[cf]['description']}")
    text = '\n'.join(lines)
    print(text)
    os.makedirs(a.cache, exist_ok=True)
    with open(os.path.join(a.cache, 'fdc-report.txt'), 'w') as fh:
        fh.write(text + '\n')
    if a.dry_run:
        print('dry run: catalog.json not written')
        return
    with open(cat_path, 'w') as fh:
        json.dump(doc, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    left = sum(1 for it in items if not it.get('nutrition'))
    print(f'wrote {cat_path}; {left} items still without nutrition')


if __name__ == '__main__':
    main()
