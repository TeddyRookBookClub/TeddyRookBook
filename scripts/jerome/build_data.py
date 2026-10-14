import json, re, os
from jp import *

OUT = os.environ.get('JEROME_OUT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data', 'jerome')
os.makedirs(OUT, exist_ok=True)

# ---------- Appendix A ----------
vocab = {'greek': [], 'latin': []}; lang = 'greek'
for pg in range(164, 179):
    sp, _, _ = page(pg)
    for L in lines_of(sp, tol=1.5):
        t0 = L[0]['t'].strip()
        if t0 == 'Latin core words': lang = 'latin'; continue
        if re.fullmatch(r'\d+', t0) and L[0]['x0'] < 60 and len(L) >= 5:
            cells = {}
            for s in L:
                x = s['x0']
                k = 'rank' if x < 70 else 'w' if x < 170 else 'pron' if x < 260 else 'mean' if x < 480 else 'nt' if x < 520 else 'ref'
                cells[k] = (cells.get(k, '') + s['t']).strip()
            vocab[lang].append({'rank': int(cells['rank']), 'w': cells['w'], 'pron': cells.get('pron', ''), 'mean': cells.get('mean', ''), 'nt': int(cells['nt'])})
        elif vocab[lang] and L[0]['x0'] > 260 and L[0]['x0'] < 480 and not bold(L[0]) and len(L) == 1 and 'Pronunciation' not in t0:
            vocab[lang][-1]['mean'] += ' ' + t0
for k in vocab: print(k, len(vocab[k]), [v['rank'] for v in vocab[k]][:3], vocab[k][-1])

# ---------- forms + slugs ----------
forms = json.load(open(os.path.join(WORK, 'forms.json')))
byrank = {(f['lang'], f['rank']): f for f in forms}
slugs = {}
for lang in ('greek', 'latin'):
    seen = {}
    for v in sorted(vocab[lang], key=lambda v: v['rank']):
        base = greek_slug(v['w']) if lang == 'greek' else latin_slug(v['w'])
        s = base if base not in seen else f'{base}-{v["rank"]}'
        seen[s] = 1; v['slug'] = s
        f = byrank.get((lang, v['rank']))
        assert f is not None, (lang, v)
        if re.sub(r'\W', '', f['w']) != re.sub(r'\W', '', v['w']): print('name differs', lang, v['rank'], v['w'], f['w'])
        f['slug'] = s; f['pron2'] = v['pron']
        slugs[(lang, v['w'])] = s

# ---------- passages ----------
P = json.load(open(os.path.join(WORK, 'passages.json')))
times = [95, 170, 286, 398, 477, 616, 812, 1019, 1156, 1287, 1373, 1482, 1570, 1681, 1846, 1962, 2054, 2143, 2239, 2443, 2538, 2654, 2748, 2878, 3068, 3142, 3233, 3313, 3396, 3508, 3564, 3625, 3747, 3906, 4028, 4104, 4289, 4406, 4520, 4591, 4779, 4902, 5033, 5168, 5279, 5375, 5526, 5587, 5673, 5784, 5889, 5979, 6114, 6196, 6319, 6407, 6497, 6658, 6740, 6809, 6927, 6993, 7063, 7243, 7321, 7399, 7506, 7606, 7705, 7784, 7834, 7917, 8002, 8118, 8231, 8321, 8430, 8483, 8619, 8710, 8785, 8872, 8951, 9042, 9127, 9242, 9302, 9445, 9557, 9645, 9794, 9902, 10052, 10128, 10198, 10253, 10360, 10550, 10730, 10865, 10949, 11061, 11136, 11273, 11389, 11458, 11532, 11637, 11738, 11794, 11917, 12037, 12222, 12321, 12393, 12597, 12663, 12815, 12939, 13010, 13094, 13237, 13368, 13510]
assert len(times) == 124
BOOKKEY = {'Matthew': 'matthew', 'Mark': 'mark', 'Luke': 'luke', 'John': 'john', 'Acts': 'acts', 'The Letters': 'letters', 'Revelation': 'revelation'}
first_seen = {}
miss = []
for p, t in zip(P['passages'], times):
    p['t'] = max(0, t - 1)
    p['bk'] = BOOKKEY[p['book']]
    p['slug'] = re.sub(r'[^a-z0-9]+', '-', p['ref'].lower().replace('–', '-')).strip('-')
    for lang, key in (('greek', 'ng'), ('latin', 'nl')):
        for e in p[key]:
            s = slugs.get((lang, e['w']))
            if s is None:
                # try without trailing punctuation / parentheses
                cand = [v for v in vocab[lang] if re.sub(r'[()]', '', v['w']) == re.sub(r'[()]', '', e['w'])]
                s = cand[0]['slug'] if cand else None
            if s is None: miss.append((p['n'], lang, e['w']))
            e['s'] = s
            if s and (lang, s) not in first_seen: first_seen[(lang, s)] = p['n']
print('unmatched new core words', len(miss), miss[:10])
for f in forms:
    f['first'] = first_seen.get((f['lang'], f['slug']))
for lang in vocab:
    for v in vocab[lang]: v['first'] = first_seen.get((lang, v['slug']))
print('words never introduced', sum(1 for f in forms if not f['first']))



# ---------- Greek verb tables in tense order (added) ----------
TENSES = ['Present', 'Imperfect', 'Future', 'Aorist', 'Perfect', 'Pluperfect']
VOICES = ['active', 'middle', 'middle/passive', 'passive']
def tkey(t):
    w = t['title'].split()
    v = w[1] if len(w) > 1 else ''
    return (TENSES.index(w[0]), VOICES.index(v) if v in VOICES else 4)
for f in forms:
    if f['tables'] and all(t['title'].split()[:1] and t['title'].split()[0] in TENSES for t in f['tables']):
        f['tables'] = sorted(f['tables'], key=tkey)

# ---------- cross-links (added) ----------
def cpath(p):
    cv = p['slug'] if p['bk'] == 'letters' else p['slug'][len(p['bk']) + 1:]
    return f"{p['bk']}/{cv}/"
seen = {}
for p in P['passages']:
    p['path'] = cpath(p)
    for r in p['rows']:
        for lang, k, sk in (('greek', 'gl', 'gs'), ('latin', 'll', 'ls')):
            s_ = slugs.get((lang, r[k]))
            if s_:
                r[sk] = s_
                L = seen.setdefault((lang, s_), [])
                if p['n'] not in L: L.append(p['n'])
    for lang, key in (('greek', 'ng'), ('latin', 'nl')):
        for e in p[key]:
            L = seen.setdefault((lang, e['s']), [])
            if p['n'] not in L: L.append(p['n'])
for lang in ('greek', 'latin'):
    vs = sorted(vocab[lang], key=lambda v: v['rank'])
    for i, v in enumerate(vs):
        f = byrank[(lang, v['rank'])]
        f['prev'] = vs[i - 1]['slug'] if i else None
        f['prevw'] = vs[i - 1]['w'] if i else None
        f['next'] = vs[i + 1]['slug'] if i + 1 < len(vs) else None
        f['nextw'] = vs[i + 1]['w'] if i + 1 < len(vs) else None
        f['seen'] = sorted(seen.get((lang, v['slug']), []))
# ---------- foundations tidy (added) ----------
FD = json.load(open(os.path.join(WORK, 'found.json')))
for sec in FD:
    h = sec['html']
    h = re.sub(r'</i>(\s*)<i>', r'\1', h)
    h = re.sub(r'(<th>)<b>(.*?)</b>(</th>)', r'\1\2\3', h)
    h = h.replace('<th>Underlined as</th>', '<th>Word order</th>')
    sec['html'] = h

books = []
for name, first in P['books']:
    k = BOOKKEY[name]
    ps = [p['n'] for p in P['passages'] if p['bk'] == k]
    books.append({'key': k, 'name': name, 'from': ps[0], 'to': ps[-1]})

json.dump({'books': books, 'passages': P['passages']}, open(f'{OUT}/passages.json', 'w'), ensure_ascii=False)
json.dump(vocab, open(f'{OUT}/vocab.json', 'w'), ensure_ascii=False)
json.dump({f['slug']: f for f in forms if f['lang'] == 'greek'}, open(f'{OUT}/forms_greek.json', 'w'), ensure_ascii=False)
json.dump({f['slug']: f for f in forms if f['lang'] == 'latin'}, open(f'{OUT}/forms_latin.json', 'w'), ensure_ascii=False)
json.dump(json.load(open(os.path.join(WORK, 'practice.json'))), open(f'{OUT}/practice.json', 'w'), ensure_ascii=False)
json.dump(FD, open(f'{OUT}/foundations.json', 'w'), ensure_ascii=False)
for f in os.listdir(OUT): print(f, os.path.getsize(f'{OUT}/{f}'))
