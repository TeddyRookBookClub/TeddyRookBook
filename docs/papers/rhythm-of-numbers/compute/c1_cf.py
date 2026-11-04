"""Chapters 1-3: continued fractions of the constants, convergents, the starting guess, rhythm words,
nested blocks, the beats 32,996 / 33,102, the three-gap theorem, and the Gauss-Kuzmin / Khinchin /
Levy statistics of pi's first 10,000 terms."""
import math, sys
sys.set_int_max_str_digits(0)
from fractions import Fraction
import mpmath as mp
from scipy import stats
from common import *

NT = 10000
# ---------- terms ----------
pi_t = cf_exact(lambda: +mp.pi, NT + 1, 11600)
consts = {
    'pi': (lambda: +mp.pi, 'π'),
    'e': (lambda: +mp.e, 'e'),
    'sqrt2': (lambda: mp.sqrt(2), '√2'),
    'phi': (lambda: (1 + mp.sqrt(5)) / 2, 'φ'),
    'fifth': (lambda: mp.log(1.5, 2), 'log2(3/2)'),
}
terms = {'pi': pi_t}
for k, (f, _) in consts.items():
    if k != 'pi':
        terms[k] = cf_exact(f, 4001, 4600)
# e pattern check
e_t = terms['e']
assert e_t[0] == 2 and all(e_t[3 * j - 1] == 2 * j and e_t[3 * j - 2] == 1 and e_t[3 * j] == 1 for j in range(1, 1300))
assert all(a == 2 for a in terms['sqrt2'][1:]) and all(a == 1 for a in terms['phi'])
save('terms.json', terms)

mp.mp.dps = 60
PI = +mp.pi
macro('PiTermsShown', ', '.join(map(str, pi_t[1:22])))
macro('FifthTermsShown', ', '.join(map(str, terms['fifth'][1:15])))
assert pi_t[:5] == [3, 7, 15, 1, 292]

# ---------- the starting guess ----------
kstar = (PI - 3) / (1 - 7 * (PI - 3))
macro('Kstar', mp.nstr(kstar, 7))  # 15.99659
assert abs(1 / (7 + 1 / kstar) - (PI - 3)) < mp.mpf(10) ** -50
guess = {}
for k in range(1, 41):
    fr = 3 + Fraction(k, 7 * k + 1)
    guess[k] = (fr.numerator, fr.denominator, float(abs(fr - Fraction(mp.nstr(PI, 50)))))
assert guess[16][:2] == (355, 113) and guess[10][:2] == (223, 71) and guess[1][:2] == (25, 8)
best_k = min(guess, key=lambda k: guess[k][2])
assert best_k == 16
macro('ErrMilu', mp.nstr(abs(mp.mpf(355) / 113 - PI), 3))
macro('ErrTwentyTwo', mp.nstr(abs(mp.mpf(22) / 7 - PI), 3))
macro('ErrArch', mp.nstr(abs(mp.mpf(223) / 71 - PI), 3))
assert mp.mpf(223) / 71 < PI < mp.mpf(22) / 7
# the k with 7k+1 prime (k<=40)
import sympy
kp = [k for k in range(1, 41) if sympy.isprime(7 * k + 1)]
save('guess.json', {'k': list(guess.keys()), 'err': [guess[k][2] for k in guess], 'prime_k': kp})

# ---------- convergents of pi ----------
P, Q = convergents(pi_t[:30])
conv = list(zip(P, Q))
assert conv[:5] == [(3, 1), (22, 7), (333, 106), (355, 113), (103993, 33102)]
rows = []
for n in range(9):
    p, q = conv[n]
    err = abs(mp.mpf(p) / q - PI)
    rows.append((n, pi_t[n], p, q, mp.nstr(err, 3), mp.nstr(err * q * q, 4)))
macro('ConvTable', '\\\\\n'.join('%d & %d & %s & %s & \\num{%s} & %s' % (n, a, commas(p), commas(q), e, s)
                                 for n, a, p, q, e, s in rows) + '\\\\')
# Legendre: every p/q with q<=3000 and |pi - p/q| < 1/(2q^2) is a convergent
qs = set(Q)
leg_bad = 0
for q in range(1, 3001):
    p = int(mp.nint(PI * q))
    if math.gcd(p, q) == 1 and abs(PI - mp.mpf(p) / q) < 1 / (2 * mp.mpf(q) ** 2) and (p, q) not in conv:
        leg_bad += 1
assert leg_bad == 0
macro('LegendreQmax', commas(3000))
# best approximation check: for q < 113 nothing beats 355/113, and no q < 33102 beats it either
best = min(range(1, 33102), key=lambda q: abs(q * PI - mp.nint(q * PI)))
assert best == 113
# complete quotients x_1..x_4
x = PI
cq = []
for i in range(5):
    a = int(mp.floor(x)); x = 1 / (x - a); cq.append(x)
macro('CQone', mp.nstr(cq[0], 6)); macro('CQtwo', mp.nstr(cq[1], 6))
macro('CQthree', mp.nstr(cq[2], 6)); macro('CQfour', mp.nstr(cq[3], 7))
# Pell / Fibonacci denominators
Pp, Qp = convergents(terms['phi'][:20]); Ps, Qs = convergents(terms['sqrt2'][:12])
macro('PhiQs', ', '.join(map(str, Qp[:12])))
macro('SqrtQs', ', '.join(map(str, Qs[:9])))

# ---------- rhythm words and nested blocks ----------
alpha = PI - 3
fr = pi_t[1:]
levels = rhythm_word(fr[:5])
L = [len(w) for w in levels]
H = [w.count('x') for w in levels]
assert L[1:6] == [7, 106, 113, 33102, 33215] and H[1:6] == [1, 15, 16, 4687, 4703]
N = 140000
fw = floor_word(alpha, N)
big = rhythm_word(fr[:8])[-1]
assert len(big) >= N and big[:N] == fw, 'builder word = floor word'
# Theorem check for many numbers: level word length = q_n, hits = p_n, and the word is the floor word prefix
import random
random.seed(1)
checked = 0
for trial in range(200):
    tt = []
    while True:
        tt.append(random.choice([1, 1, 1, 2, 2, 3, 4, 5, 7, 12]))
        if convergents([0] + tt)[1][-1] > 4000:
            break
    with mp.workdps(50):
        a_ = mp.mpf(0)
        for a in reversed(tt + [random.randint(1, 9) for _ in range(40)]):
            a_ = 1 / (a + a_)
        lv = rhythm_word(tt)
        Pc, Qc = convergents([0] + tt)
        for k in range(1, len(tt) + 1):
            assert len(lv[k]) == Qc[k] and lv[k].count('x') == Pc[k]
        w = lv[-1]
        assert w == floor_word(a_, len(w))
    checked += 1
macro('NestedChecked', checked)
# phrases of 113 / 106 and where the short phrase starts
pos = 0; starts = []; lens = []
lvl3 = levels[3]  # 113-beat phrase
lvl2 = levels[2]  # 106
# Use the exact level structure: level4 = lvl3*292 + lvl2 ; level5 = level4 + level3 ; ...
seq = []  # phrase sequence from the level construction
def phrases(level_index):
    if level_index == 3: return [113]
    if level_index == 2: return [106]
    a = fr[level_index - 1]
    return phrases(level_index - 1) * a + phrases(level_index - 2)
ph = phrases(8)
cum = 0; short_starts = []; n113 = n106 = 0
for p in ph:
    if p == 106 and cum < 140000: short_starts.append(cum)
    if cum + p <= 80000:
        if p == 113: n113 += 1
        else: n106 += 1
    cum += p
assert short_starts[0] == 292 * 113 == 32996 and short_starts[0] + 106 == 33102
macro('ShortStart', commas(short_starts[0])); macro('BlockEnd', commas(33102))
macro('ShortStarts', ', '.join(commas(s) for s in short_starts[:4]))
macro('PhrasesLong', n113); macro('PhrasesShort', n106)
hours = 32996 * 2.5 / 3600
macro('HoursToRare', '%.1f' % hours)
save('rhythm.json', {'L': L, 'H': H, 'short_starts': short_starts[:6]})

# ---------- three-gap theorem ----------
def gaps(alpha, n):
    pts = sorted([float(mp.frac(k * alpha)) for k in range(1, n + 1)] + [0.0, 1.0])
    g = [round(b - a, 12) for a, b in zip(pts, pts[1:])]
    return sorted(set(g))
maxd = 0
with mp.workdps(40):
    for n in range(1, 1201):
        d = len(gaps(PI - 3, n)); maxd = max(maxd, d); assert d <= 3
    gp = gaps(PI - 3, 100)
macro('ThreeGapN', commas(1200))
macro('ThreeGapHundred', ', '.join('%.4f' % g for g in gp))

# ---------- Gauss-Kuzmin, Khinchin, Levy on pi's first 10,000 terms ----------
A = pi_t[1:NT + 1]
assert len(A) == NT
cnt = {k: A.count(k) for k in range(1, 21)}
big20 = sum(1 for a in A if a > 20)
def gk(k): return -math.log2(1 - 1 / (k + 1) ** 2)
def gk_tail(k): return math.log2(1 + 1 / (k + 1)) * 0 + (math.log2((k + 2) / (k + 1)))  # P(a > k) = log2((k+2)/(k+1))
assert abs(sum(gk(k) for k in range(1, 21)) + gk_tail(20) - 1) < 1e-12
obs = [cnt[k] for k in range(1, 21)] + [big20]
exp = [NT * gk(k) for k in range(1, 21)] + [NT * gk_tail(20)]
chi20 = sum((o - e) ** 2 / e for o, e in zip(obs, exp)); p20 = stats.chi2.sf(chi20, 20)
obs13 = [cnt[k] for k in range(1, 13)] + [NT - sum(cnt[k] for k in range(1, 13))]
exp13 = [NT * gk(k) for k in range(1, 13)] + [NT * gk_tail(12)]
chi13 = sum((o - e) ** 2 / e for o, e in zip(obs13, exp13)); p13 = stats.chi2.sf(chi13, 12)
# Kolmogorov-type check: largest deviation of the empirical distribution function in the Gauss measure
geo = math.exp(sum(math.log(a) for a in A) / NT)
geos = {n: math.exp(sum(math.log(a) for a in A[:n]) / n) for n in (100, 1000, 5000, 10000)}
K0 = mp.khinchin
mx = max(A); mxpos = A.index(mx) + 1
P10k, Q10k = convergents(pi_t[:NT + 1])
levy_obs = mp.log(Q10k[NT]) / NT
levy = mp.pi ** 2 / (12 * mp.log(2))
macro('GKones', commas(cnt[1])); macro('GKtwos', commas(cnt[2])); macro('GKthrees', commas(cnt[3]))
macro('GKonesPct', '%.1f' % (100 * cnt[1] / NT)); macro('GKlawOnePct', '%.1f' % (100 * gk(1)))
macro('GKlawTwoPct', '%.1f' % (100 * gk(2))); macro('GKlawThreePct', '%.1f' % (100 * gk(3)))
macro('GKbig', commas(big20))
macro('ChiTwenty', '%.1f' % chi20); macro('PTwenty', '%.2f' % p20)
macro('ChiThirteen', '%.1f' % chi13); macro('PThirteen', '%.2f' % p13)
macro('GeoMean', '%.4f' % geo); macro('GeoMeanH', '%.4f' % geos[100]); macro('GeoMeanT', '%.4f' % geos[1000])
macro('Khinchin', mp.nstr(K0, 10))
macro('MaxTerm', commas(mx)); macro('MaxTermPos', mxpos)
macro('LevyObs', mp.nstr(levy_obs, 6)); macro('LevyConst', mp.nstr(levy, 6))
macro('LevyExp', mp.nstr(mp.exp(levy), 6))
macro('QtenkDigits', commas(len(str(Q10k[NT]))))
macro('NT', commas(NT))
save('gk.json', {'counts': [cnt[k] for k in range(1, 21)], 'big': big20, 'chi20': chi20, 'p20': p20,
                  'chi13': chi13, 'p13': p13, 'geo_running': [math.exp(sum(math.log(a) for a in A[:n]) / n)
                                                               for n in range(1, NT + 1, 10)],
                  'levy_running': [float(mp.log(Q10k[n]) / n) for n in range(1, NT + 1, 10)]})
print('chi20', chi20, p20, 'chi13', chi13, p13, 'geo', geo, 'levy', levy_obs, 'max', mx, mxpos)
write_macros('c1_cf.tex')
