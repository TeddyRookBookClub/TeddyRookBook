"""Part One (pages 9–17) → HTML blocks."""
import json, re, os
from jp import *

BEIGE = 0.9569


def cluster(xs, tol=2.5):
    xs = sorted(xs); out = []
    for x in xs:
        if out and x - out[-1][-1] <= tol: out[-1].append(x)
        else: out.append([x])
    return out


def runs(L):
    st = []; prev = None
    for s in L:
        if prev is None or s['x0'] - prev['x1'] > 3.5: st.append(s['x0'])
        prev = s
    return st


def table_html(T, sp):
    r = T['rect']; rows_y = T['rows']
    inr = lambda s: r['x0'] - 1 <= s['x0'] < r['x1'] - 1
    bands = [(r['y0'] - 0.5, r['y1'])] + list(zip(rows_y, rows_y[1:]))
    rowspans = [[s for s in sp if inr(s) and a < s['y'] + 0.5 < b + 0.5 and s['y'] < b - 1] for a, b in bands]
    starts = []
    for R in rowspans:
        for L in lines_of(R): starts += runs(L)
    cl = [c for c in cluster(starts) if len(c) >= 2]
    cols = [min(c) for c in cl]
    if not cols or cols[0] > r['x0'] + 6 and False: pass
    out = '<table>'
    for k, R in enumerate(rowspans):
        cells = []
        for i, x in enumerate(cols):
            xe = cols[i + 1] if i + 1 < len(cols) else r['x1'] + 1
            cells.append(rich([s for s in R if x - 2 <= s['x0'] < xe - 2]))
        tag = 'th' if k == 0 else 'td'
        if k == 0: out += '<thead>'
        out += '<tr>' + ''.join(f'<{tag}>{c}</{tag}>' for c in cells) + '</tr>'
        if k == 0: out += '</thead><tbody>'
    return out + '</tbody></table>', [s for R in rowspans for s in R]


def page_blocks(pg, stop_y=None):
    sp, lines, rects = page(pg)
    if stop_y: sp = [s for s in sp if s['y'] < stop_y]
    tabs = []
    for r in rects:
        if not (r['fill'] and abs(r['fill'][0] - BEIGE) < 0.01): continue
        ys = sorted({l['y'] for l in lines if abs(l['x0'] - r['x0']) < 1 and abs(l['x1'] - r['x1']) < 1 and l['y'] >= r['y1'] - 0.5})
        band = [r['y1']]
        for y in ys:
            if y - band[-1] < 0.5: continue
            if y - band[-1] > 60: break
            band.append(y)
        if stop_y and r['y0'] > stop_y: continue
        tabs.append({'rect': r, 'rows': band})
    used = set(); blocks = []
    for T in tabs:
        h, us = table_html(T, sp)
        for s in us: used.add(id(s))
        r = T['rect']
        title = [s for s in sp if col(s, GOLD) and bold(s) and r['x0'] - 2 <= s['x0'] < r['x1'] and r['y0'] - 26 < s['y'] < r['y0'] and id(s) not in used]
        for s in title: used.add(id(s))
        blocks.append({'kind': 'fig', 'x0': r['x0'], 'x1': r['x1'], 'y0': min([s['y'] for s in title] + [r['y0']]), 'y1': T['rows'][-1], 'title': plain(title), 'table': h, 'caps': []})
    rest = [s for s in sp if id(s) not in used]
    for L in lines_of(rest):
        s0 = L[0]; y = s0['y']; x = s0['x0']
        cap = ital(s0) and col(s0, GRAY) and s0['sz'] < 9
        if cap:
            figs = [b for b in blocks if b['kind'] == 'fig' and b['x0'] - 2 <= x < b['x1'] and b['y1'] - 1 <= y]
            if figs:
                f = max(figs, key=lambda b: b['y1'])
                f['caps'].append(L); f['y1'] = max(f['y1'], L[0]['b']); continue
        if col(s0, GOLD) and bold(s0):
            blocks.append({'kind': 'sub', 'x0': x, 'x1': L[-1]['x1'], 'y0': y, 'y1': L[0]['b'], 'html': rich(L)}); continue
        if bold(s0) and col(s0, BLUE) and s0['sz'] >= 14.5:
            blocks.append({'kind': 'h' + ('1' if s0['sz'] > 20 else '2'), 'x0': x, 'x1': L[-1]['x1'], 'y0': y, 'y1': L[0]['b'], 'html': plain(L)}); continue
        if bold(s0) and abs(s0['sz'] - 11.5) < 0.3:
            blocks.append({'kind': 'h3', 'x0': x, 'x1': L[-1]['x1'], 'y0': y, 'y1': L[0]['b'], 'html': plain(L)}); continue
        txt = plain(L).strip()
        kind = 'li' if txt.startswith('•') else ('cap' if cap else ('ital' if ital(s0) and all(ital(s) for s in L) else 'p'))
        h = rich(L).strip()
        if kind == 'li': h = re.sub(r'^•\s*', '', h)
        prev = blocks[-1] if blocks else None
        if prev and prev['kind'] in ('p', 'ital', 'cap') and kind == prev['kind'] and abs(prev['x0'] - x) < 3 and y - prev['y1'] < 6:
            prev['html'] += ' ' + h; prev['y1'] = L[0]['b']; continue
        if prev and prev['kind'] == 'li' and kind == 'p' and y - prev['y1'] < 6 and x > prev['x0']:
            prev['html'] += ' ' + h; prev['y1'] = L[0]['b']; continue
        blocks.append({'kind': kind, 'x0': x, 'x1': L[-1]['x1'], 'y0': y, 'y1': L[0]['b'], 'html': h})
    for b in blocks:
        if b['kind'] == 'fig':
            caps = []
            for L in b.pop('caps'):
                h = rich(L)
                if caps and not any(bold(s) for s in L[:1]) and not re.match(r'^(<[bi]>)*[=≈≠A-Z]', h): caps[-1] += ' ' + h
                else: caps.append(h)
            b['caps'] = caps
    blocks.sort(key=lambda b: (b['y0'], b['x0']))
    return blocks


def render(blocks):
    """Group side-by-side figures into rows, then emit HTML."""
    html = []; i = 0
    while i < len(blocks):
        b = blocks[i]
        if b['kind'] == 'fig':
            row = [b]; j = i + 1
            while j < len(blocks) and blocks[j]['kind'] in ('fig', 'sub') and blocks[j]['y0'] < max(x['y1'] for x in row) - 2 and blocks[j]['x0'] > row[-1]['x0'] + 30:
                row.append(blocks[j]); j += 1
            figs = []
            for f in row:
                if f['kind'] != 'fig': continue
                cap = ''.join(f'<p class="jc-cap">{c}</p>' for c in f['caps'])
                figs.append(f'<figure class="jc-fig">' + (f'<figcaption>{f["title"]}</figcaption>' if f['title'] else '') + f'<div class="jc-tw">{f["table"]}</div>{cap}</figure>')
            html.append(figs[0] if len(figs) == 1 else '<div class="jc-row">' + ''.join(figs) + '</div>')
            i = j; continue
        k = b['kind']
        if k == 'li':
            items = []
            while i < len(blocks) and blocks[i]['kind'] == 'li': items.append(blocks[i]['html']); i += 1
            html.append('<ul>' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>'); continue
        tag = {'h1': 'h2', 'h2': 'h2', 'h3': 'h3', 'sub': 'h4', 'p': 'p', 'ital': 'p', 'cap': 'p'}[k]
        cls = {'ital': ' class="jc-sub"', 'cap': ' class="jc-cap"', 'h2': '', 'sub': ' class="jc-gold"'}.get(k, '')
        html.append(f'<{tag}{cls}>{b["html"]}</{tag}>')
        i += 1
    return '\n'.join(html)


allb = []
for pg in range(9, 18):
    stop = None
    if pg == 17:
        sp, _, _ = page(17); stop = [s['y'] for s in sp if s['t'].strip() == 'Practice: Foundations'][0] - 2
    allb += page_blocks(pg, stop)
# split into sections at h2 (h1 = part title)
secs = []
for b in allb:
    if b['kind'] in ('h1',): continue
    if b['kind'] == 'h2': secs.append({'title': b['html'], 'blocks': []}); continue
    if not secs: secs.append({'title': '', 'blocks': []})
    secs[-1]['blocks'].append(b)
out = [{'title': s['title'], 'html': render(s['blocks'])} for s in secs]
for s in out: print('==', s['title'], len(s['html']))
json.dump(out, open(os.path.join(WORK, 'found.json'), 'w'), ensure_ascii=False, indent=0)
