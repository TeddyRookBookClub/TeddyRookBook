#!/usr/bin/env python3
"""Data for the chart in "Working on the open questions" on /connections/rhythm-of-numbers/ (#open-questions).

Writes data/rhythm/openq_pi.json: pi's probable-prime convergent denominators q_n for n <= 40,000 and numerators p_n for n <= 32,394 (the indices found by docs/papers/rhythm-of-numbers/compute/c11_openq_pisearch.py and, for
20,000 < n <= 25,332, c12_third_pisearch.py, read from the paper's generated macros in paper/gen/c11_openq_primes.tex;
the new denominators q_25332, q_27651, q_32394 and q_37721, found by Teddy Rook, are probable primes with proofs pending; the
denominators from 37,722 to 40,000 were searched by him, the rest also by the paper's own scripts), and, on a log grid of N,
the expected count sum zeta(2)/ln q_n and the central 95% range of the Poisson-binomial law, the same heuristic as
Chapters 15 and 17 of the paper. It recomputes pi's first 40,000 continued-fraction terms with mpmath (two precisions
that must agree) and stops if the expected counts and ranges differ from the paper's tables (OqPiTable at N = 1,000,
5,000 and 20,000; ThPiTable at N = 25,332, in gen/c12_third_pi.tex; the Tw and Fo macros at 28,000, 32,394 and
40,000, in gen/c12_third_newprimes.tex and gen/c12_third_fourteenth.tex).
Needs Python 3 with mpmath and numpy. Runtime: about 30 seconds.
Usage: python3 scripts/rhythm/openq-chart-data.py
"""
import json, math, os, re, sys
import numpy as np
import mpmath

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
GEN = os.path.join(ROOT, 'docs/papers/rhythm-of-numbers/paper/gen/c11_openq_primes.tex')
GEN3 = os.path.join(ROOT, 'docs/papers/rhythm-of-numbers/paper/gen/c12_third_pi.tex')
GEN4 = os.path.join(ROOT, 'docs/papers/rhythm-of-numbers/paper/gen/c12_third_newprimes.tex')
GEN5 = os.path.join(ROOT, 'docs/papers/rhythm-of-numbers/paper/gen/c12_third_fourteenth.tex')
OUT = os.path.join(ROOT, 'data/rhythm/openq_pi.json')
N = 32394      # numerators searched to here (Chapter 17; Teddy Rook's own search reached 28,000)
NQ = 40000     # denominators searched to here (Chapter 17)
Q_NEW = [25332, 27651, 32394, 37721]
ZETA2 = math.pi ** 2 / 6


def macro(name, text):
    m = re.search(r'\\newcommand\{\\%s\}\{(.*?)\}\n' % name, text, re.S)
    if not m:
        sys.exit('missing macro ' + name)
    return m.group(1)


def nums(s):
    return [int(x) for x in s.replace('{,}', '').split(', ')]


def terms(digits):
    mpmath.mp.dps = digits
    x = +mpmath.pi
    out = []
    for _ in range(NQ + 1):
        a = int(mpmath.floor(x)); out.append(a); x = 1 / (x - a)
    return out


def main():
    gen = open(GEN, encoding='utf-8').read()
    qi, pi_ = nums(macro('OqPiQIdx', gen)) + Q_NEW, nums(macro('OqPiPIdx', gen))
    gen3 = open(GEN3, encoding='utf-8').read()
    gen4 = open(GEN4, encoding='utf-8').read()
    gen5 = open(GEN5, encoding='utf-8').read()
    assert nums(macro('FoQidx', gen5)) == qi and int(macro('TwPn', gen4)) == len(pi_)
    assert int(macro('OqPiN', gen).replace('{,}', '')) == 20000
    # 40,000 terms need about 41,500 digits; two precisions must agree
    A = terms(43500)
    assert A == terms(44500), 'continued fraction terms differ between precisions'
    assert A[:6] == [3, 7, 15, 1, 292, 1]
    lnq = np.empty(NQ); r = None; s = 0.0
    for n in range(1, NQ + 1):
        a = float(A[n]); r = a if r is None else a + 1 / r
        s += math.log(r); lnq[n - 1] = s
    lnp = (lnq + math.log(math.pi))[:N]; lnp[0] = math.log(22)
    grid = sorted(set(int(round(v)) for v in np.logspace(0, math.log10(NQ), 72)) | {1000, 5000, 20000, 25332, 28000, 32394, 37721, NQ})
    table = {}
    series = {}
    for key, pr in (('q', ZETA2 / lnq), ('p', ZETA2 / lnp)):
        dist = np.zeros(81); dist[0] = 1
        mean = 0.0; rows = []; gi = 0
        for k, x in enumerate(pr, start=1):
            dist[1:] = dist[1:] * (1 - x) + dist[:-1] * x; dist[0] *= (1 - x); mean += x
            if gi < len(grid) and k == grid[gi]:
                cdf = np.cumsum(dist)
                lo, hi = int(np.searchsorted(cdf, 0.025)), int(np.searchsorted(cdf, 0.975))
                rows.append([k, round(mean, 3), lo, hi]); gi += 1
                if k in (1000, 5000, 20000, 25332, 28000, 32394, 37721, NQ):
                    table[(key, k)] = ('%.1f' % mean, '%d--%d' % (lo, hi))
        series[key] = rows
    # the paper's table: N & obs & exp & range & share (q) & obs & exp & range & share (p)
    for line in macro('OqPiTable', gen).split('\\\\'):
        c = [x.strip() for x in line.split('&')]
        if len(c) < 9:
            continue
        M = int(c[0].replace('{,}', ''))
        for key, e, rg in (('q', c[2], c[3]), ('p', c[6], c[7])):
            assert table[(key, M)] == (e, rg), ('mismatch with the paper', key, M, table[(key, M)], e, rg)
    c = [x.strip() for x in macro('ThPiTable', gen3).split('\\\\')[-2].split('&')]
    assert int(c[0].replace('{,}', '')) == 25332
    assert table[('q', 25332)] == (c[2], c[3]), ('mismatch with Chapter 17', table[('q', 25332)], c)
    assert table[('q', NQ)] == (macro('FoExpForty', gen5), macro('FoRangeForty', gen5)), ('mismatch at 40,000', table[('q', NQ)])
    for key, lab in (('q', 'Q'), ('p', 'P')):
        for M, tg in ((28000, 'A'), (32394, 'B')):
            assert table[(key, M)] == (macro('TwExp' + lab + tg, gen4), macro('TwRange' + lab + tg, gen4)), ('mismatch', key, M)
    data = {
        'about': 'Pi\'s probable-prime convergent denominators to n = 40,000 and numerators to n = 32,394 against the heuristic of '
                 'Chapters 15 and 17 of The Rhythm of Numbers paper (q_25332, q_27651, q_32394 and q_37721 are probable primes; '
                 'proofs pending). Generated by scripts/rhythm/openq-chart-data.py; do not edit.',
        'N': NQ, 'Np': N, 'q_idx': qi, 'p_idx': pi_,
        'cols': ['N', 'expected', 'lo95', 'hi95'],
        'q': series['q'], 'p': series['p'],
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
        f.write('\n')
    print('wrote', OUT, os.path.getsize(OUT), 'bytes; checked against the paper table:', sorted(table.items()))


if __name__ == '__main__':
    main()
