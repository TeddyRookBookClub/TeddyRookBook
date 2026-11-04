#!/usr/bin/env python3
"""Great Books in a Year: writes data/greatbooks/year.yaml, the 365-day plan behind /great-books/year/.

    python3 scripts/greatbooks/year-plan.py           write the plan (run again whenever rungs.yaml or a lesson changes)
    python3 scripts/greatbooks/year-plan.py --check   check the written plan against the rungs without writing it

Reads data/greatbooks/rungs.yaml, courses.yaml, the rung lessons (scripts/greatbooks/src/<id>/lesson.json, for their
length) and data/greatbooks/harvard.json (Harvard Classics days that read each rung's author).

THE SHAPE OF THE YEAR
  52 weeks of 7 days, then day 365. Days 1 to 6 of each week are rung days; day 7 is a review day in odd weeks and a
  catch-up day in even weeks. Day 365 closes the year. So there are 312 rung days for the rungs.
  Each rung gets two days (A: read the lesson and start the practice; B: finish the practice and talk it over) or one
  day (both at once). The rungs with the longest full lessons get two days; the shortest get one, so that the rung days
  add up to exactly 312. A two-day rung is not split across a review day: a one-day rung close by in the same era fills the gap
  or, when there is none, the rung takes one day and the next one-day rung takes two instead.

THE ORDER
  Era by era (courses.yaml order, so roughly chronological). Inside an era each rung has a kind (story, ideas, history
  and society, science; from its unit, see KIND) and each kind is sorted by the work's year. The kinds are then woven
  together (see spread): roughly by year, but with each kind spread through the era and never the same kind twice in a
  row while another is left, so a run of philosophy is broken up by stories, histories and science.

XP (the ladder engine, static/math/core/engine.js)
  A right answer earns the rung's xp (3 on this ladder) in learning, extra practice and review; passing a rung earns a
  5 XP bonus once. Each day lists how many practice questions to answer for each track; the estimate assumes 80% right:
  questions x 0.8 x 3, plus 5 on a day that first passes a rung. The engine's default daily goal is 40 XP.
"""
import json, math, os, re, sys
import yaml

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(ROOT, 'data', 'greatbooks')
SRC = os.path.join(ROOT, 'scripts', 'greatbooks', 'src')
OUT = os.path.join(D, 'year.yaml')
DAYS, WEEKS, RUNG_DAYS_PER_WEEK = 365, 52, 6

# kind of each unit (course/unit); rungs in units not listed are "ideas"; BY_ID overrides single rungs
KIND = {
    'gbstart/start': 'start',
    'gbgreeks/epic-and-drama': 'story', 'gbgreeks/history': 'history', 'gbgreeks/medicine-and-mathematics': 'science',
    'gbrome/roman-poets': 'story', 'gbrome/lives-and-histories': 'history', 'gbrome/science': 'science',
    'gbmiddle/dante-and-chaucer': 'story',
    'gbren/new-sky': 'science', 'gbren/shakespeare': 'story', 'gbren/cervantes': 'story',
    'gb17/new-science': 'science', 'gb17/poets-and-playwrights': 'story', 'gb17/newton-and-huygens': 'science',
    'gb18/satire': 'story', 'gb18/laws-and-society': 'history', 'gb18/history-and-lives': 'history', 'gb18/chemistry': 'science',
    'gb19/society': 'history', 'gb19/science': 'science', 'gb19/novels-and-plays': 'story',
    'gb20/freud': 'science', 'gb20/natural-science': 'science', 'gb20/social-science': 'history', 'gb20/literature': 'story',
}
BY_ID = {
    'gbgreeks.aristotle-physics': 'science', 'gbgreeks.aristotle-on-the-heavens': 'science', 'gbgreeks.aristotle-biology': 'science',
    'gbrome.lucretius-on-the-nature-of-things': 'science', 'gbren.rabelais-gargantua': 'story',
    'gb17.pascal-scientific-treatises': 'science', 'gb17.bacon-advancement-of-learning': 'ideas',
}

# practice questions per day kind, per track [young, teen and adult, family]: (questions on the rung, questions in a review round)
TRACKS = ['young', 'full', 'family']
Q = {
    'a':      [(12, 0), (14, 0), (14, 0)],
    'b':      [(7, 6), (10, 6), (10, 6)],
    'one':    [(12, 0), (14, 0), (14, 0)],
    'review': [(13, 0), (16, 0), (16, 0)],
    'catch':  [(13, 0), (16, 0), (16, 0)],
    'end':    [(13, 0), (16, 0), (16, 0)],
}
ACC, BONUS, RXP, GOAL = 0.8, 5, 3, 40
XP_MIN, XP_MAX = 30, 50


def load_yaml(p):
    with open(p, encoding='utf-8') as f:
        return yaml.safe_load(f)


def year_of(r, i):
    if isinstance(r.get('year'), (int, float)):
        return float(r['year'])
    s = str(r.get('date') or '')
    m = re.search(r'(\d{2,4})', s)
    if not m:
        return -9999.0 + i * 1e-3
    y = float(m.group(1))
    return -y if re.search(r'\bBC\b', s) else y


def lesson_words(rid):
    p = os.path.join(SRC, rid, 'lesson.json')
    if not os.path.exists(p):
        return 0
    with open(p, encoding='utf-8') as f:
        L = json.load(f)
    full = (L.get('paths') or {}).get('full') or []
    return len(re.sub(r'<[^>]+>', ' ', json.dumps(full, ensure_ascii=False)).split())


def xp_est(kind, t, rxp):
    q, rv = Q[kind][t]
    return int(round(q * ACC * rxp + rv * ACC * RXP + (BONUS if kind in ('a', 'one') else 0)))


def spread(groups):
    """groups: {kind: [rungs, oldest first]} -> one list. Each rung gets a key halfway between its place in its own kind
    ((i + 0.5) / n, which spreads every kind evenly through the era) and its place in the era by year (which keeps the
    order roughly chronological). Then, step by step, the next rung is the lowest key among the first rung left of each
    kind, avoiding the kind just used when another kind is left."""
    allr = sorted((r for items in groups.values() for r in items), key=lambda r: (r['_y'], r['_i']))
    N = len(allr)
    rank = {r['id']: (i + 0.5) / N for i, r in enumerate(allr)}
    key = {}
    for items in groups.values():
        n = len(items)
        for i, r in enumerate(items):
            key[r['id']] = 0.5 * (i + 0.5) / n + 0.5 * rank[r['id']]
    heads = {k: list(v) for k, v in groups.items()}
    out, last = [], None
    while any(heads.values()):
        cand = [(key[v[0]['id']], v[0]['_i'], k) for k, v in heads.items() if v]
        other = [c for c in cand if c[2] != last]
        k = min(other or cand)[2]
        out.append(heads[k].pop(0))
        last = k
    return out


def build():
    courses = load_yaml(os.path.join(D, 'courses.yaml'))
    R = load_yaml(os.path.join(D, 'rungs.yaml'))['rungs']
    hcj = os.path.join(D, 'harvard.json')
    hc = {}
    if os.path.exists(hcj):
        with open(hcj, encoding='utf-8') as f:
            hc = json.load(f)
    slugs = {}
    for c in courses:
        tp = os.path.join(D, 'topics', c['key'] + '.json')
        if os.path.exists(tp):
            with open(tp, encoding='utf-8') as f:
                for t in json.load(f).get('topics', []):
                    slugs[t['id']] = (c['slug'], t['slug'])

    # ---- order: era by era, kinds spread evenly
    order = []
    for c in courses:
        rs = [(i, r) for i, r in enumerate(R) if r['id'].split('.')[0] == c['key']]
        groups = {}
        for i, r in rs:
            k = BY_ID.get(r['id']) or KIND.get(c['key'] + '/' + r.get('unit', ''), 'ideas')
            r['_kind'] = k
            r['_y'] = year_of(r, i)
            r['_i'] = i
            groups.setdefault(k, []).append(r)
        for k in groups:
            groups[k].sort(key=lambda r: (r['_y'], r['_i']))
        if c['key'] == 'gbstart':
            order += sorted((r for _, r in rs), key=lambda r: r['_i'])
        else:
            order += spread(groups)
    if len(order) != len(R):
        sys.exit('year-plan: %d rungs are in no course' % (len(R) - len(order)))

    # ---- one or two days: the longest lessons get two
    slots = WEEKS * RUNG_DAYS_PER_WEEK
    n = len(order)
    two_n = slots - n
    if two_n < 0 or two_n > n:
        sys.exit('year-plan: %d rungs do not fit %d rung days (one or two days each)' % (n, slots))
    by_len = sorted(order, key=lambda r: (-lesson_words(r['id']), r['_i']))
    two = set(r['id'] for r in by_len[:two_n])

    return order, two, slugs, hc


def pack(order, two):
    """Days as (kind, id) for the 312 rung days, week by week, plus review, catch-up and the last day."""
    queue = list(order)
    out = []
    pending_b = None
    for w in range(1, WEEKS + 1):
        left = RUNG_DAYS_PER_WEEK
        ids = []
        if pending_b:
            out.append(('b', pending_b))
            ids.append(pending_b)
            left -= 1
            pending_b = None
        while left > 0 and queue:
            r = queue[0]
            if r['id'] in two and left == 1:
                j = next((j for j in range(1, min(5, len(queue))) if queue[j]['id'] not in two
                          and queue[j]['id'].split('.')[0] == r['id'].split('.')[0]), None)
                if j is not None:
                    r = queue.pop(j)
                    out.append(('one', r['id']))
                    ids.append(r['id'])
                    left -= 1
                    continue
                # none: this rung takes one day, and the next one-day rung in the queue takes two instead
                k = next((k for k in range(1, len(queue)) if queue[k]['id'] not in two), None)
                if k is not None:
                    two.discard(r['id'])
                    two.add(queue[k]['id'])
            queue.pop(0)
            ids.append(r['id'])
            if r['id'] in two:
                out.append(('a', r['id']))
                left -= 1
                if left == 0:
                    pending_b = r['id']
                    break
                out.append(('b', r['id']))
                left -= 1
            else:
                out.append(('one', r['id']))
                left -= 1
        out.append(('review' if w % 2 else 'catch', ids if w % 2 else []))
    if pending_b:
        out.append(('b', pending_b))
    out.append(('end', []))
    return out, queue


def main():
    check = '--check' in sys.argv
    order, two, slugs, hc = build()
    days, rest = pack(order, two)
    errs = []
    if rest:
        errs.append('%d rungs did not fit the year' % len(rest))
    if len(days) != DAYS:
        errs.append('the plan has %d days, not %d' % (len(days), DAYS))
    rx = {r['id']: int(r.get('xp') or 3) for r in order}
    plan = []
    for i, (k, x) in enumerate(days):
        d = i + 1
        e = {'d': d, 'w': (d - 1) // 7 + 1, 'k': k}
        if isinstance(x, str):
            e['id'] = x
        elif x:
            e['ids'] = x
        xr = rx.get(x, 3) if isinstance(x, str) else RXP
        e['q'] = [Q[k][t][0] for t in range(3)]
        if Q[k][0][1]:
            e['r'] = [Q[k][t][1] for t in range(3)]
        e['x'] = [xp_est(k, t, xr) for t in range(3)]
        plan.append(e)

    # ---- checks
    seen = {}
    for e in plan:
        if e.get('id'):
            seen[e['id']] = seen.get(e['id'], 0) + 1
        for t in range(3):
            if not (XP_MIN <= e['x'][t] <= XP_MAX):
                errs.append('day %d (%s): %s estimate %d XP is outside %d to %d' % (e['d'], e['k'], TRACKS[t], e['x'][t], XP_MIN, XP_MAX))
    for r in order:
        if r['id'] not in seen:
            errs.append('rung %s is not in the plan' % r['id'])
        if r['id'] not in slugs:
            errs.append('rung %s has no topic page (run build.py first)' % r['id'])
    if errs:
        print('\n'.join('year-plan: ' + s for s in errs))
        sys.exit(1)

    rungs = {}
    for r in order:
        cs, ts = slugs[r['id']]
        e = {'t': r['title'], 'u': '/great-books/%s/%s/' % (cs, ts), 'a': r.get('author', ''), 'k': r['_kind']}
        if r.get('vol'):
            e['v'] = r['vol']
        days_hc = [h['id'] for h in hc.get(r['id'], []) if not h.get('rel')]  # by the rung's author (the card says so)
        if days_hc:
            e['hc'] = days_hc
        rungs[r['id']] = e

    def j(v):
        return json.dumps(v, ensure_ascii=False)

    lines = [
        '# Great Books in a Year: the 365-day plan behind /great-books/year/ (layouts/math/gbyear.html, static/greatbooks/year.js).',
        '# GENERATED by scripts/greatbooks/year-plan.py from rungs.yaml, courses.yaml, the rung lessons and harvard.json.',
        '# Do not edit by hand: run  python3 scripts/greatbooks/year-plan.py  again after rungs change.',
        '# model: the XP estimate. q/r per track [young, full (teen and adult), family]: questions on the rung / in a review round;',
        '#   x = round((q x rung xp + r x 3) x acc, plus the pass bonus on a day A or a one-day rung). Kinds: a, b (the two days of',
        '#   a rung), one (a one-day rung), review (this week\'s rungs, ids), catch (catch-up), end (day 365).',
        'v: 1',
        'days: %d' % DAYS,
        'model: ' + j({'acc': ACC, 'xp': 3, 'bonus': BONUS, 'review': 6, 'goal': GOAL, 'tracks': TRACKS}),
        'counts: ' + j({'rungs': len(order), 'two': len(two), 'one': len(order) - len(two),
                        'review': sum(1 for e in plan if e['k'] == 'review'), 'catch': sum(1 for e in plan if e['k'] == 'catch')}),
        'rungs:',
    ]
    for rid, e in rungs.items():
        lines.append('  %s: %s' % (rid, j(e)))
    lines.append('plan:')
    for e in plan:
        lines.append('  - ' + j(e))
    text = '\n'.join(lines) + '\n'
    yaml.safe_load(text)  # must parse
    if check:
        cur = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        if cur != text:
            print('year-plan: data/greatbooks/year.yaml is out of date; run python3 scripts/greatbooks/year-plan.py')
            sys.exit(1)
        print('year-plan: OK, %d days, %d rungs (%d over two days), XP %d to %d a day' % (
            len(plan), len(order), len(two), min(min(e['x']) for e in plan), max(max(e['x']) for e in plan)))
        return
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(text)
    print('year-plan: wrote %s: %d days, %d rungs (%d over two days, %d in one), XP %d to %d a day' % (
        os.path.relpath(OUT, ROOT), len(plan), len(order), len(two), len(order) - len(two),
        min(min(e['x']) for e in plan), max(max(e['x']) for e in plan)))


if __name__ == '__main__':
    main()
