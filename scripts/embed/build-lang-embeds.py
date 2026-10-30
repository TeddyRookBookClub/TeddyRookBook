#!/usr/bin/env python3
"""
Data for the language embeds (/embed/lang-word/, /embed/lang-drill/) and the toolkit's language packs.

    python3 scripts/embed/build-lang-embeds.py                       # rebuild static/embed/lang/*.json
    python3 scripts/embed/build-lang-embeds.py --kjv verses-1769.json  # also refresh static/lang/data/kjv.json

Reads static/lang/data/ (see SOURCES.md there) and writes static/embed/lang/:
  gos-grc.json, gos-lat.json   the drill's Gospel passages: Greek (Nestle 1904 + MACULA, Dodson) or Latin (PROIEL Vulgate,
                               Whitaker) tokens with the King James Version English; Greek keeps the audio timings.
  cls-grc.json, cls-lat.json   a short set of classical sentences (PROIEL and Perseus treebanks) with their public-domain
                               English, chosen evenly across the works.
  word-grc.json, word-lat.json the word of the day: common Gospel nouns, verbs and adjectives, each with a real form, its
                               parsing and a Gospel verse (Greek or Latin with the KJV).
Each file carries only the dictionary entries its words use ("lex", keyed by the index in the full dictionary).

THE ESV IS NEVER COPIED HERE. esv.json and the "en" field of drills.json are under Crossway's quotation allowance, which
does not cover embeds or downloads; the English in these files is the King James Version (public domain) from
static/lang/data/kjv.json. The script fails if any ESV verse text turns up in its output.

kjv.json holds the KJV for every verse these files use (the 499 drill verses and the word examples). Its text is the
standard 1769 Oxford text, from the public-domain "kjv" JSON package (https://www.npmjs.com/package/kjv, file
json/verses-1769.json); it was checked word by word against Wikisource's proofread transcription of the 1772 Oxford
edition (https://en.wikisource.org/wiki/Bible_(King_James)). Pass --kjv <verses-1769.json> to rebuild it.
"""
import json, os, re, sys, random, unicodedata

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'static', 'lang', 'data')
OUT = os.path.join(ROOT, 'static', 'embed', 'lang')
BOOKS = ['MAT', 'MRK', 'LUK', 'JHN']
BNAME = {'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John'}


def load(n):
    with open(os.path.join(SRC, n), encoding='utf-8') as f:
        return json.load(f)


def dump(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    return os.path.getsize(path)


def key(b, c, v):
    return '%02d%03d%03d' % (40 + BOOKS.index(b), int(c), int(v))


def strip_acc(s):
    return ''.join(ch for ch in unicodedata.normalize('NFD', s) if unicodedata.category(ch) != 'Mn').lower()


drills = load('drills.json')
glex, llex = load('grc-lex.json'), load('lat-lex.json')
flash = load('flash.json')
books = {('g', b): load('grc-%s.json' % b) for b in BOOKS}
books.update({('l', b): load('lat-%s.json' % b) for b in BOOKS})

# ---------- the word-of-the-day picks (needed first: their verses go into kjv.json) ----------
GPOS = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective'}
LPOS = {'Nb': 'noun', 'V-': 'verb', 'A-': 'adjective'}
LBL = {
    'g': {'t': {'p': 'present', 'i': 'imperfect', 'f': 'future', 'a': 'aorist', 'r': 'perfect', 'l': 'pluperfect'},
          'm': {'i': 'indicative', 's': 'subjunctive', 'o': 'optative', 'm': 'imperative', 'n': 'infinitive', 'p': 'participle'},
          'v': {'a': 'active', 'm': 'middle', 'p': 'passive', 'e': 'middle/passive', 'd': 'middle (deponent)', 'o': 'passive (deponent)', 'n': 'middle/passive (deponent)'},
          'c': {'n': 'nominative', 'g': 'genitive', 'd': 'dative', 'a': 'accusative', 'v': 'vocative'}},
    'l': {'t': {'p': 'present', 'i': 'imperfect', 'f': 'future', 'r': 'perfect', 'l': 'pluperfect', 't': 'future perfect'},
          'm': {'i': 'indicative', 's': 'subjunctive', 'm': 'imperative', 'n': 'infinitive', 'p': 'participle', 'd': 'gerund', 'g': 'gerundive', 'u': 'supine'},
          'v': {'a': 'active', 'p': 'passive'},
          'c': {'n': 'nominative', 'g': 'genitive', 'd': 'dative', 'a': 'accusative', 'b': 'ablative', 'v': 'vocative', 'l': 'locative'}}}
NUM, GEN, PERS = {'s': 'singular', 'p': 'plural', 'd': 'dual'}, {'m': 'masculine', 'f': 'feminine', 'n': 'neuter'}, {'1': '1st', '2': '2nd', '3': '3rd'}


def describe(lang, attrs):
    a = dict(kv.split('=') for kv in attrs.split() if '=' in kv)
    L = LBL[lang]
    if a.get('p') == 'verb':
        out = [' '.join(x for x in [L['t'].get(a.get('t')), L['v'].get(a.get('v')), L['m'].get(a.get('m'))] if x)]
        if a.get('pe'):
            out.append(PERS.get(a['pe'], '') + ' person ' + NUM.get(a.get('n'), ''))
        elif a.get('c'):
            out.append(' '.join(x for x in [L['c'].get(a.get('c')), NUM.get(a.get('n')), GEN.get(a.get('g'))] if x))
        return ' · '.join(x.strip() for x in out if x.strip())
    return ' '.join(x for x in [L['c'].get(a.get('c')), NUM.get(a.get('n')), GEN.get(a.get('g'))] if x)


def verse_tokens(lang, ref):
    b, cv = ref.split(' ')
    c, v = cv.split(':')
    toks = books[(lang, b)].get(c, {}).get(v)
    return b, int(c), int(v), toks


def pick_words(lang, n=365):
    F = flash[lang]
    POS = GPOS if lang == 'g' else LPOS
    forms = {}
    for f in F['forms']:
        forms.setdefault(f[0], []).append(f)
    out = []
    for i, e in enumerate(F['lem']):
        lemma, gloss, pos, count = e[0], e[1], e[2], e[3]
        if pos not in POS or count < 5 or lemma[:1] != lemma[:1].lower():
            continue
        best = None
        for f in sorted(forms.get(i, []), key=lambda f: -f[3]):
            b, c, v, toks = verse_tokens(lang, f[4])
            if not toks or len(toks) > 30:
                continue
            words = [t[0] for t in toks]
            hit = [j for j, w in enumerate(words) if strip_acc(w) == strip_acc(f[1])]
            if not hit:
                continue
            best = (f, b, c, v, toks, hit[0])
            break
        if not best:
            continue
        f, b, c, v, toks, h = best
        if lang == 'g':
            x = [[t[0], t[1] or ''] for t in toks]
        else:
            x = [[t[1] or '', t[0], t[2] or ''] for t in toks]
        out.append({'w': lemma, 'g': gloss, 'p': POS[pos], 'n': count, 'f': f[1], 'fp': describe(lang, f[2]),
                    'r': [b, c, v], 'x': x, 'h': h})
        if len(out) >= n:
            break
    return out


words = {'g': pick_words('g'), 'l': pick_words('l')}

# ---------- kjv.json ----------
need = sorted({key(x['b'], x['c'], x['v']) for x in drills['verses']} |
              {key(*w['r']) for L in words.values() for w in L})
if '--kjv' in sys.argv:
    src = json.load(open(sys.argv[sys.argv.index('--kjv') + 1], encoding='utf-8'))
    K = {}
    for k in need:
        r = '%s %d:%d' % (BNAME[BOOKS[int(k[:2]) - 40]], int(k[2:5]), int(k[5:]))
        t = src[r].replace('#', '').replace('[', '').replace(']', '')
        K[k] = re.sub(r'\s+', ' ', t).strip()
    K = dict(sorted(K.items()))
    dump(os.path.join(SRC, 'kjv.json'), K)
    print('kjv.json: %d verses' % len(K))
K = load('kjv.json')
missing = [k for k in need if k not in K]
if missing:
    sys.exit('kjv.json lacks %d verses (run with --kjv): %s' % (len(missing), missing[:5]))

# ---------- the Gospel drill sets ----------
def gospel_set(lang):
    used, verses = set(), []
    for x in drills['verses']:
        toks = x['g'] if lang == 'g' else x['l']
        if not toks:
            continue
        item = {'b': x['b'], 'c': x['c'], 'v': x['v'], 'p': x['p'], 't': toks, 'en': K[key(x['b'], x['c'], x['v'])]}
        if lang == 'g' and x.get('a'):
            item['a'] = x['a']
        for t in toks:
            used.add(t[2] if lang == 'g' else t[3])
        verses.append(item)
    lex = glex if lang == 'g' else llex
    return {'passages': drills['passages'], 'v': verses, 'lex': {str(i): lex[i] for i in sorted(used)}}


def classical_set(which, n=160):
    c = load('cls-%s.json' % which)
    lex = load('cls-%s-lex.json' % which)
    by = {}
    for s in c['s']:
        if len(s['t']) <= 16 and 20 <= len(s['en']) <= 220:
            by.setdefault(s['w'], []).append(s)
    pick, i = [], 0
    while len(pick) < n and any(i < len(v) for v in by.values()):
        for w in c['works']:
            if i < len(by.get(w, [])) and len(pick) < n:
                pick.append(by[w][i])
        i += 1
    random.Random(7).shuffle(pick)
    used = {t[3] for s in pick for t in s['t']}
    works = {k: v for k, v in c['works'].items() if any(s['w'] == k for s in pick)}
    return {'works': works, 's': pick, 'lex': {str(i): lex[i] for i in sorted(used)}}


def word_set(lang):
    L = words[lang]
    for w in L:
        w['en'] = K[key(*w['r'])]
    return {'words': L}


sizes = {}
sizes['gos-grc.json'] = dump(os.path.join(OUT, 'gos-grc.json'), gospel_set('g'))
sizes['gos-lat.json'] = dump(os.path.join(OUT, 'gos-lat.json'), gospel_set('l'))
sizes['cls-grc.json'] = dump(os.path.join(OUT, 'cls-grc.json'), classical_set('grc'))
sizes['cls-lat.json'] = dump(os.path.join(OUT, 'cls-lat.json'), classical_set('lat'))
sizes['word-grc.json'] = dump(os.path.join(OUT, 'word-grc.json'), word_set('g'))
sizes['word-lat.json'] = dump(os.path.join(OUT, 'word-lat.json'), word_set('l'))

# ---------- no ESV anywhere in the output ----------
esv = load('esv.json')
def norm(s):
    return re.sub(r'[^a-z ]', '', re.sub(r'\s+', ' ', s.lower())).strip()
kjv_all = ' | '.join(norm(t) for t in K.values())
# a verse the ESV and the KJV word the same way (Matthew 5:2) proves nothing, so those are skipped
probes = [norm(t) for t in esv.values() if len(norm(t)) >= 25 and norm(t) not in kjv_all]
for f in os.listdir(OUT):
    s = norm(open(os.path.join(OUT, f), encoding='utf-8').read().replace('","', ' ').replace('"', ' '))
    s = re.sub(r'\s+', ' ', s)
    for p in probes:
        if p in s:
            sys.exit('ESV text found in %s: %s' % (f, p[:60]))
for k, v in sizes.items():
    print('%-14s %6.0f KB' % (k, v / 1024))
print('words: %d Greek, %d Latin. No ESV text in static/embed/lang/ (%d ESV verses checked).' % (len(words['g']), len(words['l']), len(probes)))
