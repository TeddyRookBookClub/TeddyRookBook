#!/usr/bin/env python3
"""Build data/bibleyear.json: Teddy Rook Book's own Bible-in-a-year plan.

Usage: python3 scripts/bibleyear/build.py   (from the site root; prints the checks and the load statistics)

The plan reads every chapter of the Bible once in 365 days, in two versions:
  "73": the 73-book Catholic canon (1,334 chapters: Esther counted with its six Greek additions A-F as NABRE prints them,
        Daniel with 14 chapters), deuterocanonical readings marked "dc";
  "66": the 66-book canon (1,189 chapters), the same order with the deuterocanonical readings left out and the days
        spaced again so the plan still ends on day 365.
Each day has a main reading (a journey through the story books, with the other books placed beside their period) and a
short reading from Psalms (days 1-171: one psalm a day, Psalm 119 one stanza a day) and then Proverbs (days 172-365, a few
verses a day). The main readings are cut into days by dynamic programming, so that each day's total verse count (main +
Psalms/Proverbs) stays close to the average, with a small cost for a day that runs across two books (three times that across two periods).
Our own arrangement and our own day breaks. Verse counts: scripts/bibleyear/versecounts.json (SWORD versification data).
Psalms use the Hebrew numbering (as the NABRE, RSV-2CE, KJV and most modern Bibles do); planner links to the Douay-Rheims
are converted to its Greek/Latin numbering in the page script (static/bibleyear/by.js).
"""
import json, os, statistics, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VC = json.load(open(os.path.join(ROOT, 'scripts/bibleyear/versecounts.json')))
KJV, CAT, ADD = VC['kjv'], VC['catholic'], VC['esther_additions']

# key, name; dc = deuterocanonical (Catholic Bibles only)
BOOKS = [('Gen', 'Genesis'), ('Exod', 'Exodus'), ('Lev', 'Leviticus'), ('Num', 'Numbers'), ('Deut', 'Deuteronomy'),
  ('Josh', 'Joshua'), ('Judg', 'Judges'), ('Ruth', 'Ruth'), ('1Sam', '1 Samuel'), ('2Sam', '2 Samuel'), ('1Kgs', '1 Kings'),
  ('2Kgs', '2 Kings'), ('1Chr', '1 Chronicles'), ('2Chr', '2 Chronicles'), ('Ezra', 'Ezra'), ('Neh', 'Nehemiah'),
  ('Tob', 'Tobit'), ('Jdt', 'Judith'), ('Esth', 'Esther'), ('1Macc', '1 Maccabees'), ('2Macc', '2 Maccabees'), ('Job', 'Job'),
  ('Ps', 'Psalms'), ('Prov', 'Proverbs'), ('Eccl', 'Ecclesiastes'), ('Song', 'Song of Songs'), ('Wis', 'Wisdom'),
  ('Sir', 'Sirach'), ('Isa', 'Isaiah'), ('Jer', 'Jeremiah'), ('Lam', 'Lamentations'), ('Bar', 'Baruch'), ('Ezek', 'Ezekiel'),
  ('Dan', 'Daniel'), ('Hos', 'Hosea'), ('Joel', 'Joel'), ('Amos', 'Amos'), ('Obad', 'Obadiah'), ('Jonah', 'Jonah'),
  ('Mic', 'Micah'), ('Nah', 'Nahum'), ('Hab', 'Habakkuk'), ('Zeph', 'Zephaniah'), ('Hag', 'Haggai'), ('Zech', 'Zechariah'),
  ('Mal', 'Malachi'), ('Matt', 'Matthew'), ('Mark', 'Mark'), ('Luke', 'Luke'), ('John', 'John'), ('Acts', 'Acts'),
  ('Rom', 'Romans'), ('1Cor', '1 Corinthians'), ('2Cor', '2 Corinthians'), ('Gal', 'Galatians'), ('Eph', 'Ephesians'),
  ('Phil', 'Philippians'), ('Col', 'Colossians'), ('1Thess', '1 Thessalonians'), ('2Thess', '2 Thessalonians'),
  ('1Tim', '1 Timothy'), ('2Tim', '2 Timothy'), ('Titus', 'Titus'), ('Phlm', 'Philemon'), ('Heb', 'Hebrews'),
  ('Jas', 'James'), ('1Pet', '1 Peter'), ('2Pet', '2 Peter'), ('1John', '1 John'), ('2John', '2 John'), ('3John', '3 John'),
  ('Jude', 'Jude'), ('Rev', 'Revelation')]
DC_BOOKS = {'Tob', 'Jdt', '1Macc', '2Macc', 'Wis', 'Sir', 'Bar'}
assert len(BOOKS) == 73

# The journey: (era title, [segments]); a segment is (book, first chapter, last chapter) or ('Esth*',) for Esther in
# reading order. Our own arrangement, by period.
ERAS = [
  ('Beginnings', [('Gen', 1, 11), ('Job', 1, 42)]),
  ('The patriarchs', [('Gen', 12, 50)]),
  ('Out of Egypt', [('Exod', 1, 40)]),
  ('The Law in the wilderness', [('Lev', 1, 27), ('Num', 1, 36), ('Deut', 1, 34)]),
  ('Into the land', [('Josh', 1, 24), ('Judg', 1, 21), ('Ruth', 1, 4)]),
  ('Samuel, Saul and David', [('1Sam', 1, 31), ('2Sam', 1, 24), ('1Chr', 1, 29)]),
  ('Solomon and the wisdom books', [('1Kgs', 1, 11), ('2Chr', 1, 9), ('Eccl', 1, 12), ('Song', 1, 8), ('Wis', 1, 19)]),
  ('Two kingdoms and their prophets', [('1Kgs', 12, 22), ('2Kgs', 1, 14), ('Jonah', 1, 4), ('Amos', 1, 9), ('Hos', 1, 14),
    ('2Kgs', 15, 17), ('Tob', 1, 14), ('Isa', 1, 39), ('Mic', 1, 7), ('2Kgs', 18, 20)]),
  ('Judah’s last kings', [('2Kgs', 21, 23), ('Zeph', 1, 3), ('Nah', 1, 3), ('Hab', 1, 3), ('Jer', 1, 52), ('2Kgs', 24, 25),
    ('2Chr', 10, 36), ('Lam', 1, 5), ('Bar', 1, 6), ('Obad', 1, 1)]),
  ('Exile', [('Ezek', 1, 48), ('Dan', 1, 14), ('Isa', 40, 66), ('Jdt', 1, 16)]),
  ('Return and rebuilding', [('Ezra', 1, 6), ('Hag', 1, 2), ('Zech', 1, 14), ('Esth*',), ('Ezra', 7, 10), ('Neh', 1, 13),
    ('Mal', 1, 4), ('Joel', 1, 3)]),
  ('Between the Testaments', [('Sir', 1, 51), ('1Macc', 1, 16), ('2Macc', 1, 15)]),
  ('The Gospels', [('Mark', 1, 16), ('Matt', 1, 28), ('John', 1, 21), ('Luke', 1, 24)]),
  ('The early Church', [('Acts', 1, 12), ('Jas', 1, 5), ('Acts', 13, 14), ('Gal', 1, 6), ('Acts', 15, 18), ('1Thess', 1, 5),
    ('2Thess', 1, 3), ('Acts', 19, 20), ('1Cor', 1, 16), ('2Cor', 1, 13), ('Rom', 1, 16), ('Acts', 21, 28), ('Eph', 1, 6),
    ('Phil', 1, 4), ('Col', 1, 4), ('Phlm', 1, 1)]),
  ('Letters and Revelation', [('1Tim', 1, 6), ('Titus', 1, 3), ('2Tim', 1, 4), ('1Pet', 1, 5), ('2Pet', 1, 3), ('Heb', 1, 13),
    ('Jude', 1, 1), ('1John', 1, 5), ('2John', 1, 1), ('3John', 1, 1), ('Rev', 1, 22)]),
]
# Esther in the order the NABRE prints it: the Greek additions are lettered chapters A-F
ESTHER_ORDER = ['A', 1, 2, 3, 'B', 4, 'C', 'D', 5, 6, 7, 8, 'E', 9, 10, 'F']
DAYS, PS_DAYS = 365, 171
DC_BADGE = 'Catholic Bibles only (deuterocanonical)'


def verses(book, ch, canon):
    if book == 'Esth' and isinstance(ch, str): return ADD[ch]
    if book in CAT and (book in DC_BOOKS or canon == '73'): return CAT[book][ch - 1]
    return KJV[book][ch - 1]


def main_units(canon):
    """The main track as a list of units: dict(b, c, v=verses, dc, era)."""
    out = []
    for ei, (era, segs) in enumerate(ERAS):
        for seg in segs:
            if seg[0] == 'Esth*':
                chs = ESTHER_ORDER if canon == '73' else list(range(1, 11))
                for c in chs: out.append({'b': 'Esth', 'c': c, 'v': verses('Esth', c, canon), 'dc': isinstance(c, str), 'era': ei})
                continue
            b, c1, c2 = seg
            if b in DC_BOOKS and canon == '66': continue
            for c in range(c1, c2 + 1):
                if b == 'Dan' and c in (13, 14) and canon == '66': continue
                u = {'b': b, 'c': c, 'v': verses(b, c, canon), 'dc': b in DC_BOOKS or (b == 'Dan' and c in (13, 14)), 'era': ei}
                if b == 'Dan' and c == 3 and canon == '73': u['dcp'] = '24–90'  # Prayer of Azariah, Song of the Three
                out.append(u)
    return out


def parallel():
    """Days 1-171: Psalms (Psalm 119 by its 22 stanzas of 8 verses); days 172-365: Proverbs, a few verses a day."""
    ps = []
    for n in range(1, 151):
        if n == 119:
            for s in range(22): ps.append({'b': 'Ps', 'c': 119, 'vr': [8 * s + 1, 8 * s + 8], 'v': 8, 'st': s})
        else: ps.append({'b': 'Ps', 'c': n, 'v': KJV['Ps'][n - 1]})
    assert len(ps) == PS_DAYS
    pv = KJV['Prov']; slots = DAYS - PS_DAYS; tot = sum(pv)
    # parts per chapter: proportional to its verses (largest remainder), at least one each
    raw = [v * slots / tot for v in pv]; k = [max(1, int(r)) for r in raw]
    order = sorted(range(len(pv)), key=lambda i: raw[i] - int(raw[i]), reverse=True); i = 0
    while sum(k) < slots: k[order[i % len(order)]] += 1; i += 1
    while sum(k) > slots:
        j = max(range(len(pv)), key=lambda q: k[q] - raw[q]); k[j] -= 1
    pr = []
    for ci, (v, n) in enumerate(zip(pv, k)):
        a = 1
        for p in range(n):
            b = round(v * (p + 1) / n); pr.append({'b': 'Prov', 'c': ci + 1, 'vr': [a, b], 'v': b - a + 1}); a = b + 1
    return ps + pr


HEB = ['Aleph', 'Beth', 'Gimel', 'Daleth', 'He', 'Waw', 'Zayin', 'Heth', 'Teth', 'Yodh', 'Kaph', 'Lamedh', 'Mem', 'Nun',
       'Samekh', 'Ayin', 'Pe', 'Sadhe', 'Qoph', 'Resh', 'Shin', 'Taw']


def split(units, par):
    """Cut the main units into DAYS days. Minimize sum((main + parallel - target)^2) + a cost per extra book in a day (three times that per extra period)."""
    n, total = len(units), sum(u['v'] for u in units) + sum(p['v'] for p in par)
    T, BOOKCOST, MAXU = total / DAYS, 220.0, 14
    pre = [0]
    for u in units: pre.append(pre[-1] + u['v'])
    nb = [0]  # book changes (+2 for a change of period) before unit i
    for i in range(1, n): nb.append(nb[-1] + (units[i]['b'] != units[i - 1]['b']) + 2 * (units[i]['era'] != units[i - 1]['era']))
    INF = float('inf')
    f = [[INF] * (n + 1) for _ in range(DAYS + 1)]; g = [[0] * (n + 1) for _ in range(DAYS + 1)]
    f[0][0] = 0
    for d in range(1, DAYS + 1):
        pv = par[d - 1]['v']; fp, fd, gd = f[d - 1], f[d], g[d]
        lo = max(d, n - (DAYS - d) * MAXU)
        for i in range(lo, min(n, d * MAXU) + 1):
            best, bj = INF, 0
            for j in range(max(d - 1, i - MAXU), i):
                if fp[j] == INF: continue
                load = pre[i] - pre[j] + pv
                c = fp[j] + (load - T) ** 2 + BOOKCOST * (nb[i - 1] - nb[j])
                if c < best: best, bj = c, j
            fd[i], gd[i] = best, bj
    cuts, i = [], n
    for d in range(DAYS, 0, -1): j = g[d][i]; cuts.append((j, i)); i = j
    cuts.reverse()
    assert cuts[0][0] == 0 and all(a < b for a, b in cuts)
    return cuts, T


def items(units):
    """Group a day's units into display items: consecutive numbered chapters of one book merge; lettered chapters stand alone."""
    out = []
    for u in units:
        last = out[-1] if out else None
        if (last and last['b'] == u['b'] and isinstance(u['c'], int) and isinstance(last['t'], int) and u['c'] == last['t'] + 1
                and 'vr' not in u and 'vr' not in last and not u.get('dcp') and not last.get('dcp') and last.get('dc', 0) == int(u['dc'])):
            last['t'] = u['c']; continue
        it = {'b': u['b'], 'f': u['c'], 't': u['c']}
        if u.get('dc'): it['dc'] = 1
        if u.get('dcp'): it['dcp'] = u['dcp']
        if 'vr' in u: it['vr'] = u['vr']
        if 'st' in u: it['st'] = HEB[u['st']]
        out.append(it)
    for it in out:
        if it['f'] == it['t']: del it['t']
    return out


def build(canon):
    units, par = main_units(canon), parallel()
    cuts, T = split(units, par)
    days = []
    for d, (a, b) in enumerate(cuts):
        us = units[a:b]
        days.append({'e': us[0]['era'], 'r': items(us), 'p': items([par[d]]), 'v': sum(u['v'] for u in us) + par[d]['v']})
    return units, par, days, T


def check(canon, units, par, days):
    nb = 73 if canon == '73' else 66
    want = 1334 if canon == '73' else 1189
    seen = {}
    for d in days:
        assert d['r'] and d['p'], 'empty day'
        for it in d['r'] + d['p']:
            if isinstance(it['f'], str): chs = [it['f']]
            else: chs = list(range(it['f'], it.get('t', it['f']) + 1))
            for c in chs:
                key = (it['b'], c)
                if 'vr' in it: seen.setdefault(key, []).append(tuple(it['vr']))
                else: seen.setdefault(key, []).append('all')
    # every chapter exactly once; split chapters (Psalm 119, Proverbs) covered exactly by their verse ranges
    expect = set()
    for k, _ in BOOKS:
        if k in DC_BOOKS and canon == '66': continue
        if k == 'Esth':
            for c in (ESTHER_ORDER if canon == '73' else range(1, 11)): expect.add((k, c))
            continue
        nch = len(CAT[k]) if (k in DC_BOOKS or (k == 'Dan' and canon == '73')) else len(KJV[k])
        for c in range(1, nch + 1): expect.add((k, c))
    assert set(seen) == expect, (set(seen) ^ expect)
    for key, parts in seen.items():
        if parts == ['all']: continue
        assert 'all' not in parts, key
        parts.sort(); a = 1
        for p in parts: assert p[0] == a, (key, parts); a = p[1] + 1
        assert a - 1 == (KJV[key[0]][key[1] - 1]), (key, parts)
    assert len(expect) == want, (canon, len(expect))
    assert len({k for k, _ in expect}) == nb
    # badges exactly on the deuterocanonical readings
    for d in days:
        for it in d['r'] + d['p']:
            isdc = it['b'] in DC_BOOKS or (it['b'] == 'Esth' and isinstance(it['f'], str)) or (it['b'] == 'Dan' and it['f'] in (13, 14))
            assert bool(it.get('dc')) == isdc and (canon == '73' or not isdc), it
            assert bool(it.get('dcp')) == (canon == '73' and it['b'] == 'Dan' and it['f'] == 3), it
    assert len(days) == DAYS
    return len(expect)


def main():
    out = {'v': 1, 'days': DAYS, 'ps_days': PS_DAYS, 'badge': DC_BADGE,
           'books': [{'k': k, 'n': n, **({'dc': 1} if k in DC_BOOKS else {})} for k, n in BOOKS],
           'eras': [e for e, _ in ERAS], 'plans': {}, 'stats': {}}
    for canon in ('73', '66'):
        units, par, days, T = build(canon)
        n = check(canon, units, par, days)
        loads = [d['v'] for d in days]
        st = {'chapters': n, 'verses': sum(loads), 'min': min(loads), 'max': max(loads), 'median': statistics.median(loads), 'mean': round(T, 1)}
        out['plans'][canon] = days; out['stats'][canon] = st
        print(canon, st, 'max day', loads.index(max(loads)) + 1, 'min day', loads.index(min(loads)) + 1)
    path = os.path.join(ROOT, 'data/bibleyear.json')
    with open(path, 'w') as fh: json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    print('wrote', path, os.path.getsize(path), 'bytes')


if __name__ == '__main__':
    main()
