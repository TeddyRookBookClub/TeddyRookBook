#!/usr/bin/env python3
"""Build the Translate in a Year data files from the Perseus TEI texts (CC BY-SA 4.0 markup; public-domain texts)
and the site's Nestle 1904 Gospel of John + the KJV (public domain).
Writes /tmp/site/static/languages/translate/<work>.json and plan.json.
usage: python3 -I scripts/translate/build.py SRC_DIR KJV_JSON SITE_DIR
SRC_DIR holds these files from https://github.com/PerseusDL (canonical-latinLit and canonical-greekLit, data/<author>/<work>/):
  phi0690.phi003.perseus-lat2.xml, -eng2 (Aeneid; Williams)   phi0448.phi001.perseus-lat2.xml, -eng2 (Caesar; McDevitte & Bohn)
  phi0474.phi013.perseus-lat2.xml, -eng2 (Cicero; Yonge)     tlg0012.tlg001.perseus-grc2.xml, -eng3 (Iliad; Murray)
  tlg0032.tlg006.perseus-grc2.xml, -eng2 (Anabasis; Brownson)
KJV_JSON is json/verses-1769.json from the npm package kjv@1.0.0. John's Greek comes from SITE_DIR/static/lang/data/grc-JHN.json."""
import sys, re, json, unicodedata, os
import xml.etree.ElementTree as ET

SRC, KJV, SITE = sys.argv[1], sys.argv[2], sys.argv[3]
OUT = os.path.join(SITE, 'static/languages/translate')
os.makedirs(OUT, exist_ok=True)
NS = '{http://www.tei-c.org/ns/1.0}'

def tag(e): return e.tag.replace(NS, '') if isinstance(e.tag, str) else ''
def nfc(s): return unicodedata.normalize('NFC', s)
def clean(s):
    s = s.replace('ʼ', '’')  # Perseus elision mark ʼ -> ’ (the usual apostrophe for Greek elision)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s+([,.;:?!·])', r'\1', s)
    s = s.replace('[ ', '[').replace(' ]', ']')
    return nfc(s)

SKIP = {'note', 'rdg', 'expan', 'bibl', 'head', 'corr', 'orig', 'label'}
def text(e, out=None, top=True):
    """text of an element, dropping notes and variants; <del> in [ ], <add> in ⟨ ⟩"""
    if out is None: out = []
    t = tag(e)
    if not top and t in SKIP:
        if e.tail: out.append(e.tail)
        return out
    if t == 'milestone' and not top:
        out.append(('MS', e.get('unit'), e.get('n')))
        if (e.get('unit') or '').lower() not in ('line', 'card'): out.append(' ')  # a new paragraph or chapter: keep the words apart
        if e.tail: out.append(e.tail)
        return out
    if t == 'q' and not top and QUOTES and e.get('_open'): out.append('“')
    if t == 'del' and not top: out.append('[')
    if t == 'add' and not top: out.append('⟨')
    if e.text: out.append(e.text)
    for c in e: text(c, out, False)
    if t == 'del' and not top: out.append(']')
    if t == 'add' and not top: out.append('⟩')
    if t == 'q' and not top and QUOTES and e.get('_close'): out.append('”')
    if t in ('l', 'p') and not top: out.append(' ')
    if not top and e.tail: out.append(e.tail)
    return out
FIX = [(' a11 ', ' all ')]  # OCR slips in the Perseus English
def plain(e):
    s = clean(''.join(x for x in text(e) if isinstance(x, str)))
    for a, b in FIX: s = s.replace(a, b)
    return s

def body(f):
    return ET.parse(os.path.join(SRC, f)).getroot().find('.//' + NS + 'body')
def divs(e, sub):
    return [d for d in e.iter(NS + 'div') if (d.get('subtype') or '').lower() == sub and d.get('type') == 'textpart']

def words(s): return len(re.findall(r"[^\s\[\]⟨⟩—–,.;:?!·“”‘’\"']+", s))

# ---------------- verse: Latin/Greek lines with card starts ----------------
QUOTES = False
def verse(f, quotes=False):
    global QUOTES
    QUOTES = quotes
    books = []
    B = body(f)
    qs = list(B.iter(NS + 'q'))
    for j, q in enumerate(qs):  # a speech runs over several <q rend="merge">: open at the first, close at the last
        if q.get('rend') != 'merge': q.set('_open', '1')
        if j + 1 == len(qs) or qs[j + 1].get('rend') != 'merge': q.set('_close', '1')
    for b in divs(B, 'book'):
        lines, cards = [], []
        for e in b.iter():
            t = tag(e)
            if t == 'milestone' and e.get('unit') == 'card': cards.append(e.get('n'))
            if t == 'l':
                if e.get('part') in ('M', 'F') and lines: lines[-1][1] += '   ' + plain(e)  # the rest of a split line
                else: lines.append([e.get('n'), plain(e)])
        books.append({'n': b.get('n'), 'lines': lines, 'cards': cards})
    return books

# translation in cards: {book: [(start line ref, text)]}
def williams(f):
    out = {}
    for b in divs(body(f), 'book'):
        cs = []
        for c in divs(b, 'card'):
            ls = [plain(l) for l in c.iter(NS + 'l')]
            cs.append((c.get('n'), '\n'.join(x for x in ls if x)))
        out[b.get('n')] = cs
    return out

def murray(f):
    """Murray's Iliad, split at its line milestones (every 5 lines or so): {book: [(start line, text)]}"""
    out = {}
    for b in divs(body(f), 'book'):
        parts, cur, curn = [], [], None
        for c in divs(b, 'card'):
            for p in c:
                seq = text(p)
                for x in seq:
                    if isinstance(x, tuple):
                        if x[1] == 'line':
                            if curn is not None and clean(''.join(cur)): parts.append((curn, clean(''.join(cur))))
                            cur, curn = [], x[2]
                    else:
                        if curn is None: curn = c.get('n')
                        cur.append(x)
                cur.append('\n')
        if curn is not None and clean(''.join(cur)): parts.append((curn, clean(''.join(cur))))
        out[b.get('n')] = parts
    return out

# ---------------- prose ----------------
def sections(f, path):
    """path: list of subtypes to descend, e.g. ['book', 'chapter', 'section']; returns [(ref, text)]"""
    out = []
    def walk(e, depth, ref):
        if depth == len(path):
            out.append(('.'.join(ref), plain(e))); return
        for d in e:
            if tag(d) == 'div' and (d.get('subtype') or '').lower() == path[depth]: walk(d, depth + 1, ref + [d.get('n')])
            elif tag(d) == 'div' and d.get('type') in ('edition', 'translation'): walk(d, depth, ref)
    walk(body(f), 0, [])
    return out

# break after a unit? sentence end
MINL = 4
END = re.compile(r'[.;?!:·]["”’\]⟩)]*$')
def chunks_of(units, verse_mode):
    """group unit indices into the smallest pacing pieces: verse = lines up to a sentence end (; : count), prose = one unit"""
    ch, start = [], 0
    for i, (ref, t) in enumerate(units):
        last = i == len(units) - 1
        bk = ref.split('.')[0]; nbk = units[i + 1][0].split('.')[0] if not last else None
        if not verse_mode or last or bk != nbk or (END.search(t.strip()) and i - start + 1 >= MINL):
            ch.append((start, i)); start = i + 1
    return ch

def write(name, obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(OUT, name), 'w', encoding='utf-8').write(s)
    return len(s.encode())

WORKS = {}
def finish(key, meta, units, tr, verse_mode, books):
    """units [(ref, text)], tr [(i0, i1, text)] over unit indices; books [(n, title, first unit index)]"""
    ch = chunks_of(units, verse_mode)
    w = [ (b - a + 1) if verse_mode else sum(words(units[k][1]) for k in range(a, b + 1)) for a, b in ch ]
    parts = [(books[j][2], (books[j + 1][2] - 1 if j + 1 < len(books) else len(units) - 1)) for j in range(len(books))] if key in ('aeneid', 'iliad') else [(0, len(units) - 1)]
    data = dict(meta, id=key, verse=verse_mode, books=[{'n': n, 't': t, 'i': i} for n, t, i in books], n=len(units),
                parts=[[a, b] for a, b in parts], ch=[a for a, b in ch], w=w)
    size = write(key + '.json', data)
    for j, (a, b) in enumerate(parts):
        size += write('%s-%d.json' % (key, j + 1), {'i': a, 'u': [[r, t] for r, t in units[a:b + 1]], 'tr': [[x, y, t] for x, y, t in tr if x <= b and y >= a]})
    WORKS[key] = dict(meta=meta, units=units, ch=ch, w=w, books=books, size=size, verse=verse_mode, tr=tr)
    print(key, 'units', len(units), 'chunks', len(ch), 'tr blocks', len(tr), 'weight', sum(w), 'bytes', size)

ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV']

def verse_work(key, meta, f_src, trans):
    bks = verse(f_src, meta['la'] == 'lat')
    units, books, tr = [], [], []
    for b in bks:
        n = b['n']; books.append((n, 'Book ' + ROMAN[int(n)], len(units)))
        idx = {}
        for ln, t in b['lines']:
            idx[ln] = len(units); units.append((n + '.' + ln, t))
        parts = trans.get(n, [])
        first = books[-1][2]; endb = len(units) - 1
        starts = []
        for ln, t in parts:
            if ln not in idx:
                # a milestone pointing at a line number the edition lacks: use the next existing line
                k = int(re.sub(r'\D.*', '', ln) or 0)
                cand = [i for l, i in idx.items() if re.sub(r'\D.*', '', l).isdigit() and int(re.sub(r'\D.*', '', l)) >= k]
                i = min(cand) if cand else endb
                print('  note:', key, n, 'translation line', ln, '-> unit', units[i][0])
            else: i = idx[ln]
            starts.append((i, t))
        starts.sort(key=lambda x: x[0])
        merged = []
        for i, t in starts:
            if merged and merged[-1][0] == i: merged[-1] = (i, merged[-1][1] + '\n' + t)
            else: merged.append((i, t))
        if merged and merged[0][0] != first: merged[0] = (first, merged[0][1])
        for j, (i, t) in enumerate(merged):
            e = merged[j + 1][0] - 1 if j + 1 < len(merged) else endb
            tr.append((i, e, t))
    finish(key, meta, units, tr, True, books)
    return bks

src = lambda f: f
# ---- Aeneid ----
aen = verse_work('aeneid', {'t': 'Aeneid', 'a': 'Virgil', 'la': 'lat', 'title': 'P. Vergili Maronis Aeneis',
    'ed': 'J. B. Greenough, The Bucolics, Aeneid, and Georgics of Virgil (Boston: Ginn, 1881)',
    'en': 'Theodore C. Williams, The Aeneid of Virgil (Boston: Houghton Mifflin, 1910)', 'trk': 'verse, in paragraphs',
    'src': 'https://github.com/PerseusDL/canonical-latinLit/tree/master/data/phi0690/phi003'},
    'phi0690.phi003.perseus-lat2.xml', williams('phi0690.phi003.perseus-eng2.xml'))
# ---- Iliad ----
il = verse_work('iliad', {'t': 'Iliad', 'a': 'Homer', 'la': 'grc', 'title': 'Ὁμήρου Ἰλιάς',
    'ed': 'D. B. Monro and T. W. Allen, Homeri Opera, 3rd ed. (Oxford: Clarendon Press, 1920)',
    'en': 'A. T. Murray, Homer: The Iliad (Loeb Classical Library, 1924–1925)', 'trk': 'prose, in five-line steps',
    'src': 'https://github.com/PerseusDL/canonical-greekLit/tree/master/data/tlg0012/tlg001'},
    'tlg0012.tlg001.perseus-grc2.xml', murray('tlg0012.tlg001.perseus-eng3.xml'))

ABBR = re.compile(r'(?:^|\s)(?:[A-Z]|[A-Z][a-z]|Ti|Cn|Sp|Ser|Sex|cos|coss|pr|tr|pl|a\.d|C|M|L|P|Q)\.$')
def sentences(t, greek):
    out, cur = [], ''
    parts = re.split(r'(?<=[.?!;])(\s+)' if greek else r'(?<=[.?!])(\s+)', t)
    for x in parts:
        if not x.strip(): cur += x; continue
        cur += x
        if (greek and re.search(r'[.;]["”’\]⟩)]*$', cur)) or (not greek and re.search(r'[.?!]["”’\]⟩)]*$', cur) and not ABBR.search(cur)):
            out.append(cur.strip()); cur = ''
    if cur.strip(): out.append(cur.strip())
    # never leave a tiny piece (under 4 words) on its own: join it to the one before
    res = []
    for x in out:
        if res and words(x) < 4: res[-1] += ' ' + x
        else: res.append(x)
    if len(res) > 1 and words(res[0]) < 4: res[1] = res[0] + ' ' + res[1]; res = res[1:]
    return res
def prose_work(key, meta, lat, eng, path, keep, tr_level, label):
    us = []
    for r, t in sections(lat, path):
        if not keep(r): continue
        for j, x in enumerate(sentences(t, meta['la'] == 'grc')):
            us.append((r + ('' if j == 0 else chr(97 + j)), x))
    en = sections(eng, path[:tr_level])
    # translation blocks: the English unit whose ref is a prefix of the Latin/Greek refs
    tr = []
    for r, t in en:
        idx = [i for i, (u, _) in enumerate(us) if re.sub(r'[a-z]$', '', u) == r or u.startswith(r + '.')]
        if idx and t: tr.append((idx[0], idx[-1], t))
    books = [(us[0][0].split('.')[0], label, 0)]
    finish(key, meta, us, tr, False, books)

prose_work('caesar', {'t': 'Gallic War, Book I', 'a': 'Caesar', 'la': 'lat', 'title': 'C. Iuli Caesaris Commentarii de Bello Gallico, Liber I',
    'ed': 'T. Rice Holmes, C. Iuli Commentarii Rerum in Gallia Gestarum VII (Oxford: Clarendon Press, 1914)',
    'en': 'W. A. McDevitte and W. S. Bohn, Caesar’s Commentaries on the Gallic and Civil Wars (New York: Harper, 1869)', 'trk': 'prose, by chapter',
    'src': 'https://github.com/PerseusDL/canonical-latinLit/tree/master/data/phi0448/phi001'},
    'phi0448.phi001.perseus-lat2.xml', 'phi0448.phi001.perseus-eng2.xml', ['book', 'chapter', 'section'], lambda r: r.split('.')[0] == '1', 2, 'Book I')
prose_work('catiline', {'t': 'First Oration against Catiline', 'a': 'Cicero', 'la': 'lat', 'title': 'M. Tulli Ciceronis in L. Catilinam Oratio Prima',
    'ed': 'A. C. Clark, M. Tulli Ciceronis Orationes, vol. 1 (Oxford: Clarendon Press, 1905; Perseus uses the 1908 printing)',
    'en': 'C. D. Yonge, The Orations of Marcus Tullius Cicero, vol. 2 (London: Bohn, 1856)', 'trk': 'prose, by section',
    'src': 'https://github.com/PerseusDL/canonical-latinLit/tree/master/data/phi0474/phi013'},
    'phi0474.phi013.perseus-lat2.xml', 'phi0474.phi013.perseus-eng2.xml', ['speech', 'section'], lambda r: r.split('.')[0] == '1', 2, 'Oration I')
prose_work('anabasis', {'t': 'Anabasis, Book I', 'a': 'Xenophon', 'la': 'grc', 'title': 'Ξενοφῶντος Κύρου Ἀνάβασις, Α',
    'ed': 'E. C. Marchant, Xenophontis Opera Omnia, vol. 3 (Oxford: Clarendon Press, 1904)',
    'en': 'Carleton L. Brownson, Xenophon: Anabasis (Loeb Classical Library, 1922)', 'trk': 'prose, by section',
    'src': 'https://github.com/PerseusDL/canonical-greekLit/tree/master/data/tlg0032/tlg006'},
    'tlg0032.tlg006.perseus-grc2.xml', 'tlg0032.tlg006.perseus-eng2.xml', ['book', 'chapter', 'section'], lambda r: r.split('.')[0] == '1', 3, 'Book I')

# ---- John: the site's Nestle 1904 text + KJV ----
jg = json.load(open(os.path.join(SITE, 'static/lang/data/grc-JHN.json'), encoding='utf-8'))
kjv = json.load(open(KJV, encoding='utf-8'))
units, tr = [], []
for c in sorted(jg, key=int):
    for v in sorted(jg[c], key=int):
        # each word is [word, what follows it]: a space or punctuation (the punctuation is followed by a space in print)
        t = clean(' '.join(w[0] + (w[1] if w[1].strip() else '') for w in jg[c][v]))
        units.append((c + '.' + v, t))
        k = kjv.get('John %s:%s' % (c, v))
        if k is None: print('  no KJV for John', c, v); k = ''
        k = re.sub(r'\s+', ' ', k.replace('#', '').replace('[', '').replace(']', '')).strip()
        tr.append((len(units) - 1, len(units) - 1, k))
books = []
for i, (r, t) in enumerate(units):
    c = r.split('.')[0]
    if not books or books[-1][0] != c: books.append((c, 'Chapter ' + c, i))
finish('john', {'t': 'Gospel of John', 'a': 'John', 'la': 'grc', 'title': 'Κατὰ Ἰωάννην',
    'ed': 'Eberhard Nestle, Η Καινη Διαθηκη (British and Foreign Bible Society, 1904), as in the site’s Gospel Reader',
    'en': 'King James Version (1769 Oxford text)', 'trk': 'by verse',
    'src': 'https://github.com/Clear-Bible/macula-greek'}, units, tr, False, books)

# ---------------- plan.json for the Life Planner ----------------
# Minutes a unit for a learner who has finished a grammar: verse 2 minutes a line, prose 0.3 minutes a word
# (about 3 words a minute), John 0.2 (the easiest Greek here). Rough; the reader says so.
MPU = {'aeneid': 2, 'iliad': 2, 'caesar': 0.3, 'catiline': 0.3, 'anabasis': 0.3, 'john': 0.2}
SLUG = {'aeneid': 'aeneid', 'iliad': 'iliad', 'caesar': 'caesar', 'catiline': 'catiline', 'anabasis': 'anabasis', 'john': 'john'}
plan = {'works': {}, 'goals': []}
SHORT = {'aeneid': 'Aeneid', 'iliad': 'Iliad', 'caesar': 'Gallic War', 'catiline': 'In Catilinam', 'anabasis': 'Anabasis', 'john': 'John'}
for k, W in WORKS.items():
    U = W['units']; c = [[U[a][0], w] for (a, b), w in zip(W['ch'], W['w'])]
    last = {}
    for r, t in U: last[r.split('.')[0]] = r
    wk = {'t': W['meta']['a'] + ', ' + W['meta']['t'] if k != 'john' else 'The Gospel of John in Greek', 's': SHORT[k], 'la': W['meta']['la'],
        'u': '/languages/translate/' + SLUG[k] + '/', 'unit': 'line' if W['verse'] else 'word', 'mpu': MPU[k], 'c': c}
    if W['verse']:
        wk['last'] = last
        # where the planner's guess at a chunk's last line (the line before the next chunk) is wrong: line-number gaps
        x = {}
        for j, (a, b) in enumerate(W['ch']):
            real = U[b][0]; nx = c[j + 1][0].split('.') if j + 1 < len(c) else None; cur = c[j][0].split('.')
            guess = (nx[0] + '.' + str(int(nx[1]) - 1)) if nx and nx[0] == cur[0] and nx[1].isdigit() else last[cur[0]]
            if guess != real: x[j] = real
        if x: wk['x'] = x
    plan['works'][k] = wk
def chunk_at_book(k, bk):  # first chunk index of book bk (string), or len
    W = WORKS[k]
    for j, (a, b) in enumerate(W['ch']):
        if W['units'][a][0].split('.')[0] == str(bk): return j
    return len(W['ch'])
G = [
    ('aeneid', 'aeneid', 'Translate the Aeneid (all 12 books)', 0, None, 'lat', 365),
    ('aeneid6', 'aeneid', 'Translate the Aeneid, Books I–VI', 0, chunk_at_book('aeneid', 7), 'lat', 182),
    ('caesar', 'caesar', 'Translate Caesar, Gallic War I', 0, None, 'lat', 120),
    ('catiline', 'catiline', 'Translate Cicero, In Catilinam I', 0, None, 'lat', 60),
    ('anabasis', 'anabasis', 'Translate Xenophon, Anabasis I', 0, None, 'grc', 180),
    ('iliad1', 'iliad', 'Translate Homer, Iliad I', 0, chunk_at_book('iliad', 2), 'grc', 30),
    ('iliad', 'iliad', 'Translate the whole Iliad', 0, None, 'grc', 365),
    ('john', 'john', 'Translate the Gospel of John in Greek', 0, None, 'grc', 365),
]
for key, w, t, a, b, la, days in G:
    n = len(WORKS[w]['ch'])
    b = b if b is not None else n
    amt = sum(WORKS[w]['w'][a:b])
    plan['goals'].append({'k': key, 'w': w, 't': t, 'a': a, 'b': b, 'la': la, 'days': days, 'amt': amt, 'mins': max(5, round(amt * MPU[w] / days))})
size = write('plan.json', plan)
print('plan.json', size)
# summary for the tests
summ = {k: {'books': [(n, sum(1 for u in W['units'] if u[0].split('.')[0] == n)) for n, _, _ in W['books']], 'units': len(W['units']), 'words': sum(words(u[1]) for u in W['units'])} for k, W in WORKS.items()}
json.dump(summ, open('/tmp/work_translate/summary.json', 'w'), ensure_ascii=False, indent=0)
