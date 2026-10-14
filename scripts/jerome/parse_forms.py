import json, re, os
from jp import *


def is_head(s):
    return bold(s) and abs(s['sz'] - 13.5) < 0.3 and (col(s, BLUE) or col(s, RED))


def is_title(s):
    return bold(s) and 7.6 < s['sz'] < 8.8 and (col(s, BLUE) or col(s, RED))


entries = []
lang = 'greek'
for pg in range(179, 429):
    sp, lines, rects = page(pg)
    if any(s['t'].strip() == 'Latin word forms' for s in sp): lang = 'latin'
    heads = sorted([s for s in sp if is_head(s)], key=lambda s: s['y'])
    cuts = [h['y'] for h in heads]
    # spans before the first headword continue the previous entry
    bounds = [(-1, None)] + [(h['y'], h) for h in heads]
    for i, (y0, h) in enumerate(bounds):
        y1 = bounds[i + 1][0] if i + 1 < len(bounds) else 800
        seg = [s for s in sp if y0 - 3 <= s['y'] < y1 - 3 and s['t'].strip()]
        if h is None:
            seg = [s for s in sp if s['y'] < (cuts[0] - 3 if cuts else 800) and s['t'].strip() and s['t'].strip() not in ('Greek word forms', 'Latin word forms', 'Appendix B · Word forms')]
            if not seg or not entries: continue
            entries[-1]['segs'].append((pg, seg, lines, rects))
        else:
            entries.append({'lang': lang, 'head': h, 'segs': [(pg, seg, lines, rects)]})


def parse_entry(E):
    out = {'lang': E['lang'], 'w': E['head']['t'].strip()}
    tables = []; extra_lines = []; first = True
    for pg, seg, lines, rects in E['segs']:
        used = set()
        if first:
            h = E['head']
            hdr = [s for s in seg if abs(s['y'] - h['y']) < 4]
            for s in hdr: used.add(id(s))
            out['pron'] = ' '.join(s['t'].strip() for s in hdr if 'DejaVu' in s['f'])
            out['pos'] = ' '.join(s['t'].strip() for s in hdr if ital(s) and col(s, GRAY))
            meta = plain([s for s in hdr if col(s, GRAY) and not ital(s) and 'DejaVu' not in s['f']])
            m = re.search(r'#(\d+)\s*·\s*NT (\d+)', meta)
            out['rank'] = int(m.group(1)) if m else None; out['nt'] = int(m.group(2)) if m else None
        seg_rects = [r for r in rects if r['fill'] and abs(r['fill'][0] - 0.9569) < 0.01 and any(abs(s['y'] - r['y0']) < 14 for s in seg) and min(s['y'] for s in seg) - 2 <= r['y0'] <= max(s['y'] for s in seg) + 2]
        # tables
        for r in sorted(seg_rects, key=lambda r: (r['y0'], r['x0'])):
            inr = lambda s: r['x0'] - 1 <= s['x0'] < r['x1'] - 1
            hcells = sorted([s for s in seg if inr(s) and r['y0'] - 1 <= s['y'] <= r['y1'] - 3], key=lambda s: s['x0'])
            for s in hcells: used.add(id(s))
            ys = sorted({l['y'] for l in lines if abs(l['x0'] - r['x0']) < 1 and abs(l['x1'] - r['x1']) < 1 and l['y'] >= r['y1'] - 0.5})
            band = [r['y1']]
            for y in ys:
                if y - band[-1] < 0.5: continue
                if y - band[-1] > 30: break
                band.append(y)
            title = [s for s in seg if is_title(s) and r['x0'] - 2 <= s['x0'] < r['x1'] and r['y0'] - 26 < s['y'] < r['y0']]
            for s in title: used.add(id(s))
            hx = [s['x0'] for s in hcells]
            starts = [r['x0']] + hx if (not hx or hx[0] > r['x0'] + 6) else hx
            has_label = not hx or hx[0] > r['x0'] + 6
            head = ([''] if has_label else []) + [c['t'].strip() for c in hcells]
            rows = []
            for a, b in zip(band, band[1:]):
                C = [s for s in seg if inr(s) and a < s['y'] < b]
                for s in C: used.add(id(s))
                cells = []
                for k, x in enumerate(starts):
                    xe = starts[k + 1] if k + 1 < len(starts) else r['x1'] + 1
                    cells.append(rich([s for s in C if x - 2 <= s['x0'] < xe - 2]))
                rows.append(cells)
            tables.append({'pg': pg, 'x0': r['x0'], 'x1': r['x1'], 'y0': r['y0'], 'y1': band[-1], 'title': plain(sorted(title, key=lambda s: (s['y'], s['x0']))), 'head': head, 'rows': rows, 'foot': []})
        # everything else: dictionary line, bullets, footnotes
        rest = [s for s in seg if id(s) not in used]
        loose = []; dest = []
        for s in sorted(rest, key=lambda s: (round(s['y']), s['x0'])):
            # a span that carries on a line already placed (text running past its column) goes with that line
            colstart = any(t['pg'] == pg and abs(s['x0'] - t['x0']) < 3 and t['y1'] - 1 <= s['y'] for t in tables)
            prev = [] if colstart else [(p, d) for p, d in dest if abs(p['y'] - s['y']) < 2 and -1 <= s['x0'] - p['x1'] < 12]
            if prev:
                d = prev[-1][1]
            else:
                under = [t for t in tables if t['pg'] == pg and t['x0'] - 2 <= s['x0'] < t['x1'] and t['y1'] - 1 <= s['y']]
                # the nearest table above in the same column
                d = max(under, key=lambda t: t['y1']) if under else None
            if d is None: loose.append(s)
            else: d.setdefault('fspans', []).append(s)
            dest.append((s, d))
        for t in tables:
            if t.get('fspans'):
                t['foot'] += lines_of(t.pop('fspans'))
        extra_lines += lines_of(loose)
        first = False
    # header block: dictionary line(s) then bullets, then any other lines
    dict_spans = []; bullets = []; others = []; stage = 'dict'
    for L in extra_lines:
        txt = plain(L).strip()
        if stage == 'dict' and not txt.startswith('•') and (any(bold(s) for s in L) or '—' in txt):
            dict_spans += L; continue
        if txt.startswith('•'):
            stage = 'bul'; bullets.append(rich(L)[1:].strip() if rich(L).startswith('•') else re.sub(r'^\s*•\s*', '', rich(L))); continue
        if stage == 'bul' and bullets and not re.match(r'[A-Z]', txt):
            bullets[-1] += ' ' + rich(L); continue
        stage = 'other'; others.append(rich(L))
    out['entry'] = rich([s for s in dict_spans if bold(s)])
    mean = plain([s for s in dict_spans if not bold(s)]).strip()
    out['mean'] = re.sub(r'^—\s*', '', mean).strip()
    out['notes'] = [re.sub(r'^•\s*', '', b).strip() for b in bullets]
    out['extra'] = others
    for t in tables:
        items = []
        for L in t['foot']:
            h = rich(L); txt = plain(L).strip()
            if items and (not re.match(r'[A-Z]', txt) or items[-1].count('(') > items[-1].count(')')): items[-1] += ' ' + h
            else: items.append(h)
        t['foot'] = items
    out['tables'] = [{k: t[k] for k in ('title', 'head', 'rows', 'foot')} | {'pg': t['pg'], 'y': t['y0'], 'x': t['x0']} for t in tables]
    out['page'] = E['segs'][0][0]
    return out


res = [parse_entry(E) for E in entries]
g = [e for e in res if e['lang'] == 'greek']; l = [e for e in res if e['lang'] == 'latin']
print(len(res), 'entries', len(g), 'greek', len(l), 'latin')
print('no rank', [e['w'] for e in res if not e['rank']][:20])
print('no meaning', [e['w'] for e in res if not e['mean']][:20])
print('ragged rows', sum(1 for e in res for t in e['tables'] for r in t['rows'] if len(r) != len(t['head'])))
print('tables', sum(len(e['tables']) for e in res), 'extra lines', sum(len(e['extra']) for e in res))
json.dump(res, open(os.path.join(WORK, 'forms.json'), 'w'), ensure_ascii=False)
