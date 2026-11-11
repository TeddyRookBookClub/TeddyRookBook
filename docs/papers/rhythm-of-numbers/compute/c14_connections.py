#!/usr/bin/env python3
"""Chapter 12, Section "The fifth subject: physics": numbers for the five-oval diagram, Sommerfeld's orbit shapes
and the break-up table.  Writes paper/gen/c14_connections.tex.

- The five-ellipse Venn diagram: the ellipse found by c14_connections_venn.py (a random search and refinement that
  maximizes the smallest region's inscribed circle; a few minutes).  Its result is stored below.
- Sommerfeld's shapes: the share of orbits k/n, n <= N, with gcd(k, n) = 1 (exact).
- Break-up of invariant curves: the values printed by c14_connections_kam.py (Greene's residue method; about ten
  minutes for all five numbers).  They are stored below; this script recomputes two of them as a check.
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))
# semi-axes, and inscribed-circle radii of the smallest and the central region, in a 1000 x 1000 box
VENN = dict(a=402.3, b=226.3, rmin=24.08, rcenter=183.0)
# kick strength at which the residue of p/q reaches 1/4 (c14_connections_kam.py, 2026-11-10)
KAM = {
    'golden': [((233, 377), 0.9716333926), ((377, 610), 0.9716353135)],
    'silver': [((70, 169), 0.9579534844), ((169, 408), 0.9576520291)],
    'fifth':  [((31, 53), 0.9494454579), ((179, 306), 0.9454037738)],
    'e':      [((51, 71), 0.8818262167), ((385, 536), 0.8754040729)],
    'pi':     [((15, 106), 0.5480419803), ((16, 113), 0.5440094475)],
}
ROW = [('pi', r'$\pi - 3$', r'$[0; 7, 15, 1, 292, \ldots]$', r'292'),
       ('e', r'$e - 2$', r'$[0; 1, 2, 1, 1, 4, 1, 1, 6, \ldots]$', r'1, then 8'),
       ('fifth', r'$\log_2(3/2)$', r'$[0; 1, 1, 2, 2, 3, 1, 5, 2, 23, \ldots]$', r'2, then 23'),
       ('silver', r'$\sqrt2 - 1$', r'$[0; 2, 2, 2, \ldots]$', '2'),
       ('golden', r'$\varphi - 1$', r'$[0; 1, 1, 1, \ldots]$', '1')]

def main():
    N = 1000
    phi = list(range(N + 1))
    for i in range(2, N + 1):
        if phi[i] == i:
            for j in range(i, N + 1, i): phi[j] -= phi[j] // i
    share = sum(phi[1:]) / (N * (N + 1) / 2)
    assert abs(share - 6 / math.pi ** 2) < 1e-3
    # spot check of two table entries (a few seconds)
    import c14_connections_kam as kam
    for (P, Q), want in (KAM['golden'][0][:1] and [((21, 34), 0.9717770852)]) + [((16, 113), KAM['pi'][1][1])]:
        got = kam.kc(P, Q); assert got is not None and abs(got - want) < 2e-6, (P, Q, got, want)
    rows = []
    for key, name, cf, nxt in ROW:
        (a, ka), (b, kb) = KAM[key]
        d = 6 if key == 'golden' else 4
        rows.append('%s & %s & $%d/%d$, $%d/%d$ & $%.*f$, $%.*f$ & %s \\\\' % (name, cf, a[0], a[1], b[0], b[1], d, ka, d, kb, nxt))
    out = ['% written by compute/c14_connections.py; do not edit',
           '\\newcommand{\\CxVennRatio}{%.2f}' % (VENN['a'] / VENN['b']),
           '\\newcommand{\\CxVennMin}{%.2f}' % (VENN['rmin'] / VENN['rcenter']),
           '\\newcommand{\\SoN}{1{,}000}', '\\newcommand{\\SoShare}{%.4f}' % share,
           '\\newcommand{\\KamGolden}{%.6f}' % KAM['golden'][1][1], '\\newcommand{\\KamSilver}{%.3f}' % (math.floor(KAM['silver'][1][1] * 1000) / 1000),
           '\\newcommand{\\KamPi}{%.2f}' % KAM['pi'][1][1],
           '\\newcommand{\\KamRows}{%\n' + '\n'.join(rows) + '\n}']
    open(os.path.join(HERE, '..', 'paper', 'gen', 'c14_connections.tex'), 'w').write('\n'.join(out) + '\n')
    print('share of new shapes to N = 1000: %.4f; 6/pi^2 = %.4f' % (share, 6 / math.pi ** 2))

if __name__ == '__main__':
    main()
