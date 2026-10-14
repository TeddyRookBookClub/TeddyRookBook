import json, re, os
from jp import *


def all_lines(p0, p1):
    out = []
    for pg in range(p0, p1 + 1):
        sp, _, _ = page(pg)
        for L in lines_of(sp, tol=1.5):
            out.append((pg, L))
    return out


def heading(L):
    s = L[0]
    return bold(s) and col(s, BLUE) and s['sz'] >= 14.5 and len(L) == 1


def key_of(title):
    t = title.replace('Practice: ', '').replace('Answers: ', '')
    return {'Foundations': 'foundations', 'The Letters': 'letters', 'Final review': 'review'}.get(t, t.lower())


def qnum(L):
    s = L[0]
    return int(s['t'].strip()[:-1]) if bold(s) and re.fullmatch(r'\d+\.', s['t'].strip()) and s['x0'] < 52 else None


sets = {}; order = []
cur = None; q = None
for pg, L in all_lines(17, 163):
    if heading(L):
        t = L[0]['t'].strip()
        if t.startswith('Practice:') or t == 'Final review':
            cur = {'key': key_of(t), 'title': t, 'intro': '', 'qs': [], 'page': pg}; sets[cur['key']] = cur; order.append(cur['key']); q = None
        else:
            cur = None
        continue
    if cur is None: continue
    txt = plain(L).strip()
    if txt == 'Answers are in Appendix C.': cur = None; continue
    if not cur['qs'] and q is None and ital(L[0]) and col(L[0], GRAY):
        cur['intro'] = (cur['intro'] + ' ' + txt).strip(); continue
    n = qnum(L)
    if n is not None:
        q = {'n': n, 'text': rich(L[1:]).strip(), 'left': [], 'right': [], 'opts': [], 'extra': []}; cur['qs'].append(q); continue
    if q is None: continue
    # matching rows: a numbered item at x≈66 and/or a lettered item at x≈281
    left = [s for s in L if 60 < s['x0'] < 75 and re.match(r'\s*\d+\.\s', s['t'])]
    right = [s for s in L if 270 < s['x0'] < 300 and re.match(r'\s*[a-j]\.\s', s['t'])]
    if left or right:
        if left: q['left'].append(re.sub(r'^\s*\d+\.\s*', '', plain([s for s in L if s['x0'] < 270])))
        if right: q['right'].append(re.sub(r'^\s*[a-j]\.\s*', '', plain([s for s in L if s['x0'] >= 270])))
        continue
    m = re.match(r'\(([a-h])\)\s*(.*)', txt)
    if m and txt.startswith('(') and not q['extra']:
        q['opts'].append(rich(L).strip()[len(m.group(1)) + 2:].strip() if False else re.sub(r'^\s*\([a-h]\)\s*', '', rich(L).strip())); continue
    if re.match(r'(Greek|Latin|Help):', txt):
        q['extra'].append(rich(L).strip()); continue
    # continuation of whatever came last
    h = rich(L).strip()
    if q['extra']: q['extra'][-1] += ' ' + h
    elif q['opts']: q['opts'][-1] += ' ' + h
    else: q['text'] = (q['text'] + ' ' + h).strip()

# answers
answers = {}; ak = None; a = None
for pg, L in all_lines(429, 438):
    if heading(L):
        t = L[0]['t'].strip(); ak = key_of(t) if t.startswith('Answers:') else None; answers.setdefault(ak, {}); a = None; continue
    if ak is None: continue
    n = qnum(L)
    rest = L[1:] if n is not None else L
    if n is not None:
        a = {'main': [], 'why': []}; answers[ak][n] = a
    if a is None: continue
    for s in rest:
        (a['why'] if ital(s) and col(s, GRAY) else a['main']).append(s)

for k, v in answers.items():
    for n, a in v.items():
        main = rich(a['main']); why = rich(a['why'], keep_ital=False)
        why = re.sub(r'^—\s*', '', why).strip()
        v[n] = {'a': main.strip(), 'why': why}

problems = []
for k in order:
    s = sets[k]
    for q in s['qs']:
        if len(q['left']) != len(q['right']): problems.append((k, q['n'], 'match lens', len(q['left']), len(q['right'])))
        if q['n'] not in answers.get(k, {}): problems.append((k, q['n'], 'no answer'))
    ns = [q['n'] for q in s['qs']]
    if ns != list(range(1, len(ns) + 1)): problems.append((k, 'numbering', ns))
    print(k, s['title'], len(s['qs']), 'answers', len(answers.get(k, {})))
print('problems', problems)
json.dump({'order': order, 'sets': sets, 'answers': answers}, open(os.path.join(WORK, 'practice.json'), 'w'), ensure_ascii=False, indent=0)
