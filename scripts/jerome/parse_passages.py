import json, re, os
from jp import *

BOOKS = []  # (title, first passage n)
passages = []
pages_with = {}
cur_book = None


def markers(sp):
    m = []
    for i, s in enumerate(sp):
        if bold(s) and abs(s['sz'] - 15) < 0.3 and col(s, BLUE):
            m.append(('head', s['y'], s['t'].strip()))
        if bold(s) and abs(s['sz'] - 11.5) < 0.3 and col(s, GOLD) and re.fullmatch(r'\d+', s['t'].strip()):
            ref = [t for t in sp if abs(t['y'] - s['y']) < 1 and t['x0'] > s['x0'] and bold(t) and col(t, BLUE)]
            m.append(('psg', s['y'], (int(s['t']), ref[0]['t'].strip())))
    m.sort(key=lambda x: x[1])
    return m


def pair_words(words, prons):
    rows = lines_of(words)
    out = []
    for r in rows:
        y = r[0]['y']
        cand = [p for p in prons if 6 < p['y'] - y < 18]
        for w in r:
            cx = (w['x0'] + w['x1']) / 2
            best = min(cand, key=lambda p: abs((p['x0'] + p['x1']) / 2 - cx)) if cand else None
            pr = best['t'].strip() if best and abs((best['x0'] + best['x1']) / 2 - cx) < 40 else ''
            if best: cand.remove(best)
            out.append([w['t'].strip(), pr])
    return out


def parse_newcore(sp):
    mode = None; g = []; l = []; met = None; cur = None
    seq = [s for L in lines_of(sp) for s in L]
    for s in seq:
        t = s['t']
        if t.strip() == 'New core words.': continue
        if col(s, GOLD) and 'Met so far' in t:
            m = re.search(r'Greek (\d+)/345 · Latin (\d+)/345', t); met = [int(m.group(1)), int(m.group(2))]; continue
        if bold(s) and col(s, BLUE) and t.strip() == 'Greek': mode = g; cur = None; continue
        if bold(s) and col(s, RED) and t.strip() == 'Latin': mode = l; cur = None; continue
        if mode is None: continue
        if bold(s):
            cur = {'w': t.strip(), 'm': ''}; mode.append(cur)
        elif cur is not None:
            cur['m'] += t
    for e in g + l:
        e['m'] = re.sub(r'\s+', ' ', e['m'].replace('|', ' ')).strip(' ·').strip()
    return g, l, met


for pg in range(21, 160):
    sp, lines, rects = page(pg)
    mk = markers(sp)
    for k, (kind, y, val) in enumerate(mk):
        if kind == 'head':
            if not val.startswith('Practice') and not val.startswith('Part Two'):
                cur_book = val; BOOKS.append([val, None])
            continue
        n, ref = val
        y1 = mk[k + 1][1] if k + 1 < len(mk) else 760
        R = [s for s in sp if y - 1 <= s['y'] < y1 - 1]
        lab = {s['t'].strip(): s for s in R if 'DejaVu' in s['f'] and bold(s)}
        gy, ly, ey = lab['GREEK']['y'], lab['LATIN']['y'], lab['ENGLISH']['y']
        ctx = plain([s for s in R if ital(s) and col(s, GRAY) and y + 5 < s['y'] < gy])
        gw = [s for s in R if gy < s['y'] < ly and col(s, BLUE) and 'DejaVu' not in s['f'] and not bold(s)]
        gp = [s for s in R if gy < s['y'] < ly and 'DejaVu' in s['f'] and not bold(s)]
        lw = [s for s in R if ly < s['y'] < ey - 3 and col(s, RED) and 'DejaVu' not in s['f'] and not bold(s)]
        lp = [s for s in R if ly < s['y'] < ey - 3 and 'DejaVu' in s['f'] and not bold(s)]
        rect = [r for r in rects if y < r['y0'] < y1 and r['x1'] - r['x0'] > 400]
        rect = min(rect, key=lambda r: r['y0'])
        eng = plain([s for s in R if ey - 4 < s['y'] < rect['y0'] and col(s, INK) and 'DejaVu' not in s['f']])
        nc = [s for s in R if s['t'].strip() == 'New core words.']
        ncy = nc[0]['y'] if nc else y1
        def table_rows(R, lines, rect, end_y):
            hdr = {s['t'].strip(): s['x0'] for s in R if rect['y0'] <= s['y'] <= rect['y1']}
            c2, c3 = hdr['Latin'] - 2, hdr['Notes'] - 2
            ly_ = sorted({round(l['y'], 1) for l in lines if abs(l['x0'] - rect['x0']) < 1 and abs(l['x1'] - rect['x1']) < 1 and rect['y1'] - 1 <= l['y'] <= end_y})
            if not nc: ly_.append(745)
            rows = []
            for a, b in zip(ly_, ly_[1:]):
                C = [s for s in R if a < s['y'] < b]
                if not C: continue
                g1 = [s for s in C if s['x0'] < c2]; l1 = [s for s in C if c2 <= s['x0'] < c3]; n1 = [s for s in C if s['x0'] >= c3]
                gf = plain([s for s in g1 if bold(s)]); gl = plain([s for s in g1 if not bold(s)])
                lf = plain([s for s in l1 if bold(s)]); ll = plain([s for s in l1 if not bold(s)])
                glem, _, ggl = gl.partition(' · ')
                rows.append({'g': gf, 'gl': glem.strip(), 'gg': ggl.strip(), 'l': lf, 'll': ll, 'note': rich(n1)})
            return rows
        rows = table_rows(R, lines, rect, ncy)
        if not nc:
            sp2, lines2, rects2 = page(pg + 1)
            mk2 = markers(sp2); y2 = mk2[0][1] if mk2 else 760
            R2 = [s for s in sp2 if s['y'] < y2 - 1]
            rect2 = min([r for r in rects2 if r['x1'] - r['x0'] > 400], key=lambda r: r['y0'])
            nc = [s for s in R2 if s['t'].strip() == 'New core words.']
            ncy = nc[0]['y']
            rows += table_rows(R2, lines2, rect2, ncy)
            R = R2
        ncs = [s for s in R if s['y'] >= ncy - 0.5]
        g, l, met = parse_newcore(ncs)
        p = {'n': n, 'ref': ref, 'book': cur_book, 'ctx': ctx, 'gk': pair_words(gw, gp), 'la': pair_words(lw, lp), 'en': eng, 'rows': rows, 'ng': g, 'nl': l, 'met': met, 'page': pg}
        passages.append(p)
        if BOOKS[-1][1] is None: BOOKS[-1][1] = n

print(len(passages), 'passages'); print(BOOKS)
bad = [p['n'] for i, p in enumerate(passages) if p['n'] != i + 1]
print('numbering problems', bad)
# check counters: met increases by the number of new words
pg_ = pl_ = 0
for p in passages:
    if p['met'] is None: print('no met', p['n']); continue
    if p['met'][0] != pg_ + len(p['ng']) or p['met'][1] != pl_ + len(p['nl']): print('counter mismatch', p['n'], p['met'], pg_, len(p['ng']), pl_, len(p['nl']))
    pg_, pl_ = p['met']
    if any(not w[1] for w in p['gk'] + p['la']): print('missing pron', p['n'], [w for w in p['gk'] + p['la'] if not w[1]])
    if not p['rows']: print('no rows', p['n'])
    for r in p['rows']:
        if not r['g'] and not r['l']: print('empty row', p['n'], r)
print('final met', pg_, pl_)
for p in passages:
    if not p['gk'] or not p['la'] or not p['en'] or not p['ctx']: print('EMPTY', p['n'], len(p['gk']), len(p['la']), bool(p['en']), bool(p['ctx']))
json.dump({'books': BOOKS, 'passages': passages}, open(os.path.join(WORK, 'passages.json'), 'w'), ensure_ascii=False, indent=0)
