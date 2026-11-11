#!/usr/bin/env python3
"""Chapter 19 ("Newton: the rhythm of gravity"): writes paper/gen/c15_newton.tex.

Steps (the first three are slow and are run once; their result is a small JSON file):
    cc -O3 -o nbody nbody.c -lm
    python3 tune.py                                  # tunes the starting orbits (a few minutes); writes tune.json
    ./nbody 200000 0.05 364 main.bin $(python3 -c "import json;print(' '.join(json.load(open('tune.json'))['args']))")
    python3 spec.py main.bin                         # the long swings; writes main.bin.json
    python3 c15_newton.py main.bin.json              # this script (seconds)
Everything that does not come from the integration (the cycles, Newton's rule, the tides) is computed here."""
import math, json, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
SYN, DRA, ANO, SID, TROP = 29.530588853, 27.212220817, 27.554549878, 27.321661547, 365.2421897
def cf(x, n=12):
    t = []
    for _ in range(n):
        a = math.floor(x + 1e-12); t.append(a); x -= a
        if x < 1e-10: break
        x = 1 / x
    return t
def conv(t):
    h0, h1, k0, k1 = 0, 1, 1, 0; o = []
    for a in t: h0, h1 = h1, a * h1 + h0; k0, k1 = k1, a * k1 + k0; o.append((h1, k1))
    return o
def classify(x, p, q):
    g = math.gcd(p, q); p //= g; q //= g; t = cf(x, 14); c = conv(t)
    if (p, q) in c: i = c.index((p, q)); return 'convergent; next term %d' % t[i + 1]
    for i in range(1, len(c) - 1):
        (h0, k0), (h1, k1) = c[i - 1], c[i]
        for k in range(1, t[i + 1]):
            if (h0 + k * h1, k0 + k * k1) == (p, q): return 'intermediate, step %d of %d' % (k, t[i + 1])
    return 'neither'
def apsidal(p, s):
    """Angle (degrees) from closest to farthest point: pull r^-p, start at r = 1 with speed^2 = 1 + s."""
    L = math.sqrt(1 + s)
    V = (lambda r: math.log(r)) if abs(p - 1) < 1e-12 else (lambda r: r ** (1 - p) / (1 - p))
    E = 0.5 * (1 + s) + V(1.0); f = lambda r: 2 * (E - V(r)) - L * L / (r * r)
    hi = 1.0
    for _ in range(4000):
        hi *= 1.01
        if f(hi) < 0: break
    else: return None
    a, b = hi / 1.01, hi
    for _ in range(200):
        m = (a + b) / 2
        if f(m) > 0: a = m
        else: b = m
    r2 = (a + b) / 2; N = 4000; tot = 0
    for k in range(1, N + 1):
        x = math.cos((2 * k - 1) * math.pi / (2 * N)); r = (1 + r2) / 2 + (r2 - 1) / 2 * x
        tot += L / (r * r) * math.sqrt((r - 1) * (r2 - r) / max(f(r), 1e-300))
    return tot * math.pi / N * 180 / math.pi
def tex_cf(x, n):
    t = cf(x, n); return '$[%d; %s, \\ldots]$' % (t[0], ', '.join(map(str, t[1:])))
def num(x): return '{:,}'.format(int(round(x))).replace(',', '{,}')

def main():
    sim = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'out', 'c15_main.bin.json')))
    out = ['% written by compute/c15_newton/c15_newton.py; do not edit']
    def mac(k, v): out.append('\\newcommand{\\%s}{%s}' % (k, v))
    # --- Newton's rule
    rows = []
    for p in (-1, 0, 1, 2, 2.16, 2.5):
        cells = []
        for s in (0.001, 0.2, 0.45, 0.8):
            ok = p <= 1 or s < 0.97 * (2 / (p - 1) - 1)
            v = apsidal(p, s) if ok else None
            cells.append('$%.2f^\\circ$' % v if v else 'unbound')
        rows.append('$%s$ & $%.2f^\\circ$ & %s \\\\' % (('%g' % p).replace('-', '-'), 180 / math.sqrt(3 - p), ' & '.join(cells)))
    mac('NwApsRows', '%\n' + '\n'.join(rows) + '\n')
    assert abs(apsidal(2, 0.45) - 180) < 1e-6 and abs(apsidal(-1, 0.45) - 90) < 1e-6
    # --- the Moon and Mercury
    c = 100 / 35745; adv = 2 * (180 * math.sqrt((1 - c) / (1 - 4 * c)) - 180)
    dms = lambda x: "%d^\\circ %d' %d''" % (int(x), int(x * 60) % 60, round(x * 3600) % 60)
    assert dms(adv) == "1^\\circ 31' 28''"
    act = 360 * SID / (8.8504 * 365.25)
    mac('NwMoonNewton', dms(adv)); mac('NwMoonObs', "%d^\\circ %d'" % (int(act), round(act * 60) % 60))
    orbits = 100 * 365.25 / 87.9691; step = 43.0 / 3600 / 360 / orbits
    p_hall = 3 - (1 / (1 + step)) ** 2
    mac('NwHallStep', '%.1f \\times 10^{-8}' % (step * 1e8)); mac('NwHallP', '%.8f' % p_hall)
    assert abs(p_hall - 2.00000016) < 5e-9
    mac('NwGROrbits', '%.1f' % (1 / step / 1e6)); mac('NwGRTurn', '%.1f' % (1 / step * 87.9691 / 365.25 / 1e6))
    mac('NwMercTurn', num(round(360 * 3600 / 574.1 * 100, -3)))
    mac('NwMercPeri', '%.0f' % sim['peri']['Mercury'])
    # --- cycles
    CY = [('Eight years, 99 months (octaeteris)', TROP / SYN, 6, 99, 8, lambda e: 'a day in %d years' % round(8 / abs(99 * SYN - 8 * TROP))),
          ('Nineteen years, 235 months (Metonic)', TROP / SYN, 7, 235, 19, lambda e: 'a day in %d years' % round(19 / abs(235 * SYN - 19 * TROP))),
          ('Saros: 223 months, 242 node months', SYN / DRA, 7, 242, 223, lambda e: '%.2f days in 18 years' % abs(223 * SYN - 242 * DRA)),
          ('Saros: 223 months, 239 distance months', SYN / ANO, 6, 239, 223, lambda e: '%.2f days in 18 years' % abs(223 * SYN - 239 * ANO)),
          ('Inex: 358 months, 388.5 node months', SYN / DRA, 7, 777, 716, lambda e: '%.3f days in 29 years' % abs(358 * SYN - 388.5 * DRA)),
          ('254 trips of the Moon in 19 years', TROP / SID, 7, 254, 19, lambda e: 'a day in %d years' % round(19 / abs(254 * SID - 19 * TROP))),
          ('Julian leap years, 1 in 4', TROP - 365, 6, 1, 4, lambda e: 'a day in %d years' % round(1 / e)),
          ('Leap years, 8 in 33', TROP - 365, 6, 8, 33, lambda e: 'a day in %s years' % num(1 / e)),
          ('Leap years, 31 in 128', TROP - 365, 6, 31, 128, lambda e: 'a day in %s years' % num(round(1 / e, -3))),
          ('Gregorian leap years, 97 in 400', TROP - 365, 6, 97, 400, lambda e: 'a day in %s years' % num(1 / e))]
    rows = []
    for name, x, n, p, q, drift in CY:
        rows.append('%s & $%.5f$\\newline %s & $%d/%d$ & %s & %s \\\\' % (name, x, tex_cf(x, n), p, q, classify(x, p, q), drift(abs(p / q - x))))
    mac('NwCycleRows', '%\n' + '\n'.join(rows) + '\n')
    assert classify(TROP / SYN, 235, 19).startswith('convergent; next term 17') and classify(SYN / ANO, 239, 223) == 'intermediate, step 15 of 16' and classify(TROP - 365, 97, 400) == 'neither'
    mac('NwPersianYears', num(1 / abs(8 / 33 - (TROP - 365)))); mac('NwGregorianYears', num(1 / abs(97 / 400 - (TROP - 365)))); mac('NwBestYears', num(round(1 / abs(31 / 128 - (TROP - 365)), -3)))
    # --- tides and spin
    M2, S2, N2, K1, O1 = 12.4206012, 12.0, 12.65834751, 23.93447213, 25.81933871
    mac('NwSpringNeap', '%.2f' % (1 / (1 / S2 - 1 / M2) / 24)); mac('NwPerigeeBeat', '%.2f' % (1 / (1 / M2 - 1 / N2) / 24)); mac('NwDeclBeat', '%.2f' % (1 / (1 / K1 - 1 / O1) / 24))
    assert conv(cf(M2 / S2, 6))[3] == (59, 57)
    mac('NwSpinRatio', '%.6f' % (87.9691 / 58.6462)); assert cf(87.9691 / 58.6462, 4)[:2] == [1, 2] and cf(87.9691 / 58.6462, 4)[2] > 10000
    # --- the model
    L = sim['lines']; loc = sim['local']
    n = sim['n']; YR = 365.25
    def find(planet, lo, hi):
        c = [x for x in L[planet] if lo <= x[0] <= hi]
        return max(c, key=lambda x: x[1]) if c else None
    def per(*kn):                       # period in years of a combination: pairs (coefficient, planet index)
        return 2 * math.pi / abs(sum(k * n[i] for k, i in kn)) / YR
    mac('NwSpanKyr', '%d' % round(sim['span_years'] / 1000)); mac('NwWindowKyr', '%d' % round(sim['window_years'] / 1000))
    rows = []
    def row(lab, planet, P0, lo, hi, note):
        x = find(planet, lo, hi); assert x, (lab, planet)
        rows.append('%s & %s & %s & %s & %s & %s \\\\' % (lab, planet, num(P0), num(x[0]), ('%.0f' if x[1] >= 10 else '%.1f') % x[1], note))
        return x
    P = per((2, 4), (-5, 5)); assert 870 < P < 895
    row('$2n_J - 5n_S$', 'Jupiter', P, 850, 1000, 'the great inequality; order 3'); js = row('$2n_J - 5n_S$', 'Saturn', P, 850, 1000, '')
    P = per((1, 6), (-2, 7)); row('$n_U - 2n_N$', 'Uranus', P, 4000, 4700, 'order 1'); row('$n_U - 2n_N$', 'Neptune', P, 4000, 4700, '')
    P = per((1, 4), (-2, 5)); row('$n_J - 2n_S$', 'Jupiter', P, 58, 64, 'first convergent; order 1'); row('$n_J - 2n_S$', 'Saturn', P, 58, 64, '')
    P = per((1, 5), (-3, 6)); row('$n_S - 3n_U$', 'Uranus', P, 540, 600, 'order 2')
    P = per((4, 2), (-8, 3), (3, 4)); ma = row('$4n_E - 8n_M + 3n_J$', 'Mars', P, 1700, 1950, 'three planets'); row('$4n_E - 8n_M + 3n_J$', 'Earth', P, 1700, 1950, '')
    P = per((8, 1), (-13, 2)); ve = row('$8n_V - 13n_E$', 'Venus', P, 225, 255, 'order 5')
    mac('NwSlowPer', num(round(sim['slow']['Jupiter'][0], -3))); mac('NwSlowJ', num(round(sim['slow']['Jupiter'][1], -2))); mac('NwSlowS', num(round(sim['slow']['Saturn'][1], -2)))
    mac('NwLineRows', '%\n' + '\n'.join(rows) + '\n')
    mac('NwJSline', num(js[0])); mac('NwJSper', num(loc['Jupiter'][0])); mac('NwJSampJ', num(round(loc['Jupiter'][1], -1))); mac('NwJSampS', num(round(loc['Saturn'][1], -1)))
    mac('NwJSoff', '%d' % round(100 * abs(1 - loc['Jupiter'][1] / 1200)))
    mac('NwUNampU', num(round(loc['Uranus'][1], -1))); mac('NwUNampN', num(round(loc['Neptune'][1], -1)))
    mac('NwMarsAmp', '%.0f' % ma[1]); mac('NwMarsPer', num(round(ma[0], -1))); mac('NwVEper', num(ve[0])); mac('NwVEamp', '%.1f' % ve[1])
    open(os.path.join(HERE, '..', '..', 'paper', 'gen', 'c15_newton.tex'), 'w').write('\n'.join(out) + '\n')
    print('\n'.join(out))
if __name__ == '__main__':
    main()
