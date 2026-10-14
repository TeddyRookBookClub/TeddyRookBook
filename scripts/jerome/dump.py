"""Dump every text span, rule and filled box of the PDF pages a..b to JSON: python3 dump.py book.pdf a b out.json"""
import pdfplumber, json, sys
def spans_of(page):
    chars = sorted(page.chars, key=lambda c: (round(c['top'], 1), c['x0']))
    out = []; cur = None
    for c in chars:
        col = c.get('non_stroking_color')
        col = tuple(round(v, 3) for v in col) if isinstance(col, (list, tuple)) else col
        key = (c['fontname'], round(c['size'], 2), col)
        if cur and key == cur['k'] and abs(c['top'] - cur['top']) < 1.0 and c['x0'] - cur['x1'] < c['size'] * 0.35:
            # spaces between words inside a span
            gap = c['x0'] - cur['x1']
            if gap > c['size'] * 0.15: cur['t'] += ' '
            cur['t'] += c['text']; cur['x1'] = c['x1']
        else:
            if cur: out.append(cur)
            cur = {'k': key, 't': c['text'], 'x0': c['x0'], 'x1': c['x1'], 'top': c['top'], 'bot': c['bottom']}
    if cur: out.append(cur)
    res = []
    for s in out:
        f, sz, col = s['k']
        res.append({'f': f.split('+')[-1], 'sz': sz, 'c': col, 't': s['t'], 'x0': round(s['x0'], 1), 'x1': round(s['x1'], 1), 'y': round(s['top'], 1), 'b': round(s['bot'], 1)})
    return res
pdf = pdfplumber.open(sys.argv[1])
a, b = int(sys.argv[2]), int(sys.argv[3])
allp = {}
for i in range(a, b + 1):
    p = pdf.pages[i - 1]
    lines = [{'x0': round(l['x0'], 1), 'x1': round(l['x1'], 1), 'y': round(l['top'], 1)} for l in p.lines if abs(l['top'] - l['bottom']) < 0.5]
    rects = [{'x0': round(r['x0'], 1), 'x1': round(r['x1'], 1), 'y0': round(r['top'], 1), 'y1': round(r['bottom'], 1), 'fill': r.get('non_stroking_color')} for r in p.rects]
    allp[i] = {'spans': spans_of(p), 'lines': lines, 'rects': rects}
json.dump(allp, open(sys.argv[4], 'w'), ensure_ascii=False)
