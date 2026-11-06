"""A second look at the open questions (Chapter 16).  Five independent parts:
  Q3  the sets E_q = {x in (0,1): q is a convergent denominator of x}: their exact measure, the fact that each
      piece's length depends only on an inverse modulo q, and the overlaps E_q n E_r for primes q < r < 3,000
      (the quasi-independence behind Theorem 16.1);
  Q1  e's convergent denominators modulo primes: the period divides 6l (checked for l < 3,000), and the trace of the
      product over one full cycle of blocks is 0 mod l (checked for every starting block, l < 400);
  Q5  the correlation matrix: near-copies of the small gcd matrices M_K in the spectrum (Proposition 16.4), the
      spacing ratio with and without them, and the two bounds for the top eigenvalue;
  Q6  why 171: the three small commas, the adjugate matrix and the error identity;
  Q4  pi's terms: the Doeblin-Lenstra law for theta_n and the serial correlation of ln a_n, calibrated on random
      reals.
Needs out/picf.npy (c11_openq_picf.py) and out/openq_matrix.json (c11_openq_matrix.py).
Writes gen/c12_openq2.tex and out/openq2.json.  Runtime: about 6 minutes on one core."""
import math, os, sys, time, random
import numpy as np
import sympy
from sympy import primerange, primepi
from scipy import stats
from common import *

T0 = time.time()
res = {}
LN2 = math.log(2)


# ----------------------------------------------------------------- Q3: the sets E_q and their overlaps
def E_sets(q):
    """The pieces of E_q, one interval per numerator a (0 < a < q, gcd(a, q) = 1), sorted; and for each piece the
    previous denominator s of the canonical expansion (a s = +-1 mod q)."""
    L, R, S = [], [], []
    for a in range(1, q):
        if math.gcd(a, q) != 1:
            continue
        x, y, c = a, q, []
        while x:
            c.append(y // x); x, y = y % x, x
        pm, p, qm, qq = 1, 0, 0, 1
        for t in c:
            pm, p = p, t * p + pm
            qm, qq = qq, t * qq + qm
        assert p == a and qq == q and ((a * qm - 1) % q == 0 or (a * qm + 1) % q == 0)
        e1 = (p + pm) / (qq + qm); e2 = (2 * p - pm) / (2 * qq - qm)
        L.append(min(e1, e2)); R.append(max(e1, e2)); S.append(qm)
    o = np.argsort(L)
    return np.array(L)[o], np.array(R)[o], np.array(S)[o]


def overlap(I, J):
    L1, R1 = I[0], I[1]; L2, R2 = J[0], J[1]
    tot = 0.0
    i0 = np.searchsorted(R1, L2, side='right')
    for k in range(len(L2)):
        i = i0[k]
        while i < len(L1) and L1[i] < R2[k]:
            tot += max(0.0, min(R1[i], R2[k]) - max(L1[i], L2[k])); i += 1
    return tot


QMAX = 3000
ps = list(primerange(2, QMAX))
E = {p: E_sets(p) for p in ps}
lam = {}
for p in ps:
    L, R, S = E[p]
    lam[p] = float((R - L).sum())
    exact = 2 / p * sum(1 / (p + r) for r in range(1, p))
    assert abs(lam[p] - exact) < 1e-12 * max(1, exact)
    # each piece has length (1/q)(1/(q+s) + 1/(2q-s)) = g(s/q)/q^2: a function of s, i.e. of the inverse of a
    assert np.allclose(R - L, (1 / p) * (1 / (p + S) + 1 / (2 * p - S)), rtol=1e-9, atol=0)
bins = {}
cov = 0.0
for i, q in enumerate(ps):
    for r in ps[i + 1:]:
        o = overlap(E[q], E[r]); pr = lam[q] * lam[r]; cov += o - pr
        b = min(int(math.log2(r / q)), 7)
        B = bins.setdefault(b, [0.0, 0.0, 0])
        B[0] += o; B[1] += pr; B[2] += 1
        # the crude bound used in the proof for r <= q^5
        assert o <= 8 / (q * r) + 1e-15
psi = sum(lam.values())
res['q3'] = {'Q': QMAX, 'nprimes': len(ps), 'psi': psi, 'cov': cov, 'bins': {k: v for k, v in bins.items()}}
labels = ['$[1, 2)$', '$[2, 4)$', '$[4, 8)$', '$[8, 16)$', '$[16, 32)$', '$[32, 64)$', '$[64, 128)$', '$\\ge 128$']
rows = []
for b in sorted(bins):
    o, pr, n = bins[b]
    rows.append('%s & %s & %.4f' % (labels[b], commas(n), o / pr))
macro('ObOvlTable', '\\\\\n'.join(rows) + '\\\\')
macro('ObOvlQ', commas(QMAX)); macro('ObOvlNp', len(ps)); macro('ObOvlPairs', commas(sum(v[2] for v in bins.values())))
macro('ObPsi', '%.3f' % psi); macro('ObCov', '%.3f' % cov)
print('Q3 overlaps', round(time.time() - T0), 's', res['q3']['psi'], cov, flush=True)


# ----------------------------------------------------------------- Q1: e modulo primes
def e_term(n):
    return 2 if n == 0 else (2 * ((n + 1) // 3) if n % 3 == 2 else 1)


def e_period(l):
    N = 12 * l + 60
    q = [1 % l, e_term(1) % l]
    for n in range(2, N):
        q.append((e_term(n) * q[-1] + q[-2]) % l)
    for P in range(1, N // 2):
        if all(q[i] == q[i + P] for i in range(N - P)):
            return P


ELIM = 3000
exact6 = True
for l in primerange(2, ELIM):
    P = e_period(l)
    assert (6 * l) % P == 0, (l, P)
    if l > 2 and P != 6 * l:
        exact6 = False
assert e_period(2) == 6
TLIM = 400
for l in primerange(3, TLIM):
    for c in range(l):
        M = [[1, 0], [0, 1]]
        for j in range(l):
            k = (c + j) % l
            B = [[2 * k + 2, 2 * k + 1], [2 * k + 1, 2 * k]]
            M = [[(M[0][0] * B[0][0] + M[0][1] * B[1][0]) % l, (M[0][0] * B[0][1] + M[0][1] * B[1][1]) % l],
                 [(M[1][0] * B[0][0] + M[1][1] * B[1][0]) % l, (M[1][0] * B[0][1] + M[1][1] * B[1][1]) % l]]
        assert (M[0][0] + M[1][1]) % l == 0
res['e'] = {'lim': ELIM, 'exact6': exact6, 'tracelim': TLIM}
macro('ObElim', commas(ELIM)); macro('ObTlim', TLIM)
assert exact6
print('e periods', round(time.time() - T0), 's', flush=True)


# ----------------------------------------------------------------- Q5: the correlation matrix
def full(m):
    a = np.arange(2, m + 1)
    g = np.gcd.outer(a, a).astype(float)
    d = 1 / np.sqrt(a - 1.0)
    return (g - 1) * np.outer(d, d)


def MK(K):
    k = np.arange(1, K + 1)
    return np.gcd.outer(k, k) / np.sqrt(np.outer(k, k))


def rmean(x):
    x = np.sort(x); lo, hi = np.quantile(x, [0.1, 0.9]); x = x[(x > lo) & (x < hi)]
    s = np.diff(x); s = s[s > 1e-12]
    r = np.minimum(s[:-1], s[1:]) / np.maximum(s[:-1], s[1:])
    return float(r.mean())


q5 = {}
crow = []
for m in (2000, 4000, 6000):
    w, V = np.linalg.eigh(full(m))
    a = np.arange(2, m + 1)
    lpf = np.array([max(sympy.primefactors(int(x))) for x in a])
    keep = np.abs(w - 1) > 1e-7
    wk, Vk = w[keep], V[:, keep]
    big = lpf > math.sqrt(m)
    loc = (Vk[big, :] ** 2).sum(0) > 0.9
    # near-copies: for K = 2..6, eigenvalues within K/(2 p_min) of each eigenvalue of M_K, against |F_K| - K
    cl = []
    for K in range(2, 7):
        F = [p for p in primerange(max(int(math.isqrt(m)) + 1, m // (K + 1) + 1), m // K + 1)]
        mu = np.linalg.eigvalsh(MK(K))
        delta = K / (2 * min(F))
        found = [int((np.abs(w - x) <= delta).sum()) for x in mu]
        cl.append((K, len(F), [round(float(x), 4) for x in mu], found, delta))
        for f in found:
            assert f >= len(F) - K
    s = np.diff(np.sort(wk))
    q5[m] = {'n': int(len(wk)), 'loc': int(loc.sum()), 'r_all': rmean(wk), 'r_rest': rmean(wk[~loc]),
             'r_loc': rmean(wk[loc]), 'tiny': int((s < 1e-6).sum()), 'clusters': cl}
    crow.append('%s & %s & %s & %.3f & %.3f & %s' % (commas(m), commas(len(wk)), commas(int(loc.sum())),
                                                    q5[m]['r_all'], q5[m]['r_rest'], commas(q5[m]['tiny'])))
    print('Q5', m, q5[m], round(time.time() - T0), 's', flush=True)
    del V, Vk
macro('ObLocTable', '\\\\\n'.join(crow) + '\\\\')
c4 = {K: (nF, mu, f) for K, nF, mu, f, d in q5[4000]['clusters']}
c4d = {K: d for K, nF, mu, f, d in q5[4000]['clusters']}
macro('ObFtwo', c4[2][0]); macro('ObFtwoFound', ' and '.join(str(x) for x in c4[2][2]))
macro('ObFthree', c4[3][0]); macro('ObFthreeFound', ', '.join(str(x) for x in c4[3][2]))
macro('ObMuThree', ', '.join('%.4f' % x for x in c4[3][1]))
macro('ObLocFour', commas(q5[4000]['loc'])); macro('ObNFour', commas(q5[4000]['n']))
macro('ObRrestFour', '%.3f' % q5[4000]['r_rest']); macro('ObRallFour', '%.3f' % q5[4000]['r_all'])
macro('ObTinyFour', q5[4000]['tiny']); macro('ObDeltaTwo', '%.5f' % c4d[2])

# top eigenvalue: the fit and the two bounds
import json
tops = json.load(open(os.path.join(OUT, 'openq_matrix.json')))['tops']
fit = []
for m, lm, R in tops:
    f = (2 / math.pi ** 2) * math.log(m) ** 2 * math.log(math.log(m))
    fit.append((m, lm, f, lm / f))
q5['fit'] = fit
macro('ObFitTable', '\\\\\n'.join('%s & %.2f & %.2f & %.3f' % (commas(m), lm, f, r) for m, lm, f, r in fit) + '\\\\')
macro('ObFitMin', '%.3f' % min(r for *_, r in fit)); macro('ObFitMax', '%.3f' % max(r for *_, r in fit))


def box_bound(m):
    """largest y with prod_{p <= y} p <= m, and prod_{p <= y} (1 + p^{-1/2})"""
    P, val, y = 1, 1.0, 1
    for p in primerange(2, 1000):
        if P * p > m:
            break
        P *= p; val *= 1 + p ** -0.5; y = p
    return y, val


def schur_bound(m):
    """(1 + ln m) * max_{a <= m} sum_{d | a} phi(d)/d  (the bound for M_m; C_m gets twice this)"""
    h = np.ones(m + 1)
    ph = np.arange(m + 1, dtype=np.int64)
    for p in range(2, m + 1):
        if ph[p] == p:
            ph[p::p] -= ph[p::p] // p
    for d in range(2, m + 1):
        h[d::d] += ph[d] / d
    return (1 + math.log(m)) * float(h[1:].max())


y6, bb6 = box_bound(10 ** 6)
sb6 = schur_bound(10 ** 6)
# check the box bound against a direct Rayleigh quotient of C_m on the divisors (>= 2) of 2*3*5*7*11*13
Pb = 2 * 3 * 5 * 7 * 11 * 13
divs = [d for d in sympy.divisors(Pb) if d >= 2]
Cd = np.array([[(math.gcd(d, e) - 1) / math.sqrt((d - 1) * (e - 1)) for e in divs] for d in divs])
ray = float(Cd.sum() / len(divs)); prod13 = float(np.prod([1 + p ** -0.5 for p in (2, 3, 5, 7, 11, 13)]))
q5['box'] = {'y': y6, 'bound': bb6, 'schur': sb6, 'ray13': ray, 'prod13': prod13}
macro('ObBoxY', y6); macro('ObBoxVal', '%.2f' % bb6); macro('ObSchur', commas(round(2 * sb6)))
macro('ObRayThirteen', '%.2f' % ray); macro('ObProdThirteen', '%.2f' % prod13)
macro('ObTopMillion', '%.2f' % tops[-1][1])
print('Q5 bounds', q5['box'], round(time.time() - T0), 's', flush=True)
res['q5'] = {str(k): v for k, v in q5.items()}

# ----------------------------------------------------------------- Q6: why 171
J = [math.log2(p) for p in (2, 3, 5, 7)]
commas_ = {'schisma': ((-15, 8, 1, 0), (32805, 32768)), 'breedsma': ((-5, -1, -2, 4), (2401, 2400)),
           'ragisma': ((-1, -7, 4, 1), (4375, 4374))}
Mc = sympy.Matrix([list(c[0]) for c in commas_.values()] + [[1, 0, 0, 0]])
assert Mc.det() == 171
adj = Mc.adjugate()
val = [int(adj[k, 3]) for k in range(4)]
assert val == [171, 271, 397, 480]
for c, (n, d) in commas_.values():
    assert sum(x * y for x, y in zip(c, val)) == 0
    assert sympy.factorint(n) == {p: e for p, e in zip((2, 3, 5, 7), c) if e > 0}
eps = [math.log2(n / d) for _, (n, d) in commas_.values()]
for k in range(4):
    err = 171 * J[k] - val[k]
    assert abs(err - sum(int(adj[k, i]) * eps[i] for i in range(3))) < 1e-12
cents = [1200 * e for e in eps]
macro('ObSchismaC', '%.3f' % cents[0]); macro('ObBreedsmaC', '%.3f' % cents[1]); macro('ObRagismaC', '%.3f' % cents[2])
errs = [171 * J[k] - val[k] for k in (1, 2, 3)]
macro('ObWThree', '%.4f' % (errs[0] / J[1])); macro('ObWFive', '%.4f' % (errs[1] / J[2])); macro('ObWSeven', '%.4f' % (errs[2] / J[3]))
macro('ObErrThree', '%.4f' % errs[0]); macro('ObErrFive', '%.4f' % errs[1]); macro('ObErrSeven', '%.4f' % errs[2])
macro('ObAdjRows', '\\\\'.join(' & '.join(str(int(adj[k, i])) for i in range(4)) for k in range(4)))
# other vals in the ennealimmal family: sums of vals
v72 = [72, 114, 167, 202]; v99 = [99, 157, 230, 278]; v27 = [27, 43, 63, 76]
for n, v in ((72, v72), (99, v99), (27, v27)):
    assert v == [round(n * j) for j in J]
assert [x + y for x, y in zip(v72, v99)] == val and [x + y for x, y in zip(v27, v72)] == v99
res['q6'] = {'cents': cents, 'errs_steps': errs, 'adj': [[int(adj[k, i]) for i in range(4)] for k in range(4)]}
print('Q6', res['q6'], flush=True)

# ----------------------------------------------------------------- Q4: Doeblin-Lenstra and serial correlation
import c11_openq_picf as cfm
from c11_openq_stats import random_terms
A = np.load(os.path.join(OUT, 'picf.npy'))[1:]


def thetas(a):
    """theta_n = q_n^2 |x - p_n/q_n| = 1/(x_{n+1} + q_{n-1}/q_n) for n = 1..len(a) - 40 (floats; the tail of the
    expansion beyond 40 further terms changes theta_n by far less than the bin widths)."""
    a = a.astype(float); n = len(a)
    s = np.empty(n); r = 0.0          # s[i] = q_{i}/q_{i+1} for the prefix a[0..i]  (i.e. q_{n-1}/q_n with n = i+1)
    for i in range(n):
        r = 1.0 / (a[i] + r); s[i] = r
    t = np.empty(n); u = 0.0          # t[i] = [0; a[i+1], a[i+2], ...]
    for i in range(n - 1, -1, -1):
        t[i] = u; u = 1.0 / (a[i] + u)
    th = 1.0 / (1.0 / t[:-1] + s[:-1])  # n = 1..len-1: x_{n+1} = 1/t, q_{n-1}/q_n = s
    return th[:-40]


def dl_cdf(x):
    x = np.asarray(x, float)
    return np.where(x <= 0.5, x / LN2, (1 - x + np.log(np.maximum(2 * x, 1.0))) / LN2)


EDG = np.linspace(0, 1, 21)
PDL = np.diff(dl_cdf(EDG))


def dl_chi(th):
    o = np.histogram(th, EDG)[0]; e = len(th) * PDL
    return float(((o - e) ** 2 / e).sum())


def lagcorr(a, lag):
    x = np.log(a.astype(float))
    return float(np.corrcoef(x[:-lag], x[lag:])[0, 1])


rng = random.Random(20261106)
NS, LS = 300, 100000
cal = {'dl': [], 'c1': [], 'c2': [], 'half': []}
for s in range(NS):
    a = random_terms(LS, rng)
    th = thetas(a)
    cal['dl'].append(dl_chi(th)); cal['half'].append(float((th < 0.5).mean()))
    cal['c1'].append(lagcorr(a, 1)); cal['c2'].append(lagcorr(a, 2))
for k in cal:
    cal[k] = np.array(cal[k])
print('Q4 calibration', round(time.time() - T0), 's', flush=True)
thp = thetas(A)
NTH = len(thp)
dlp = dl_chi(thp)
q4 = {'n': NTH, 'dl': dlp, 'dl_p': float(stats.chi2.sf(dlp, 19)), 'dl_pmc': float((cal['dl'] >= dlp).mean()),
      'half': float((thp < 0.5).mean()), 'half_law': 1 / (2 * LN2), 'cal_dl_reject': float((stats.chi2.sf(cal['dl'], 19) < 0.05).mean()),
      'mean_theta': float(thp.mean())}
sc = math.sqrt(LS / len(A))
for lag in (1, 2):
    c = lagcorr(A, lag); m0 = float(cal['c%d' % lag].mean()); sd = float(cal['c%d' % lag].std(ddof=1))
    q4['c%d' % lag] = c; q4['c%d_null' % lag] = m0; q4['c%d_null_se' % lag] = sd / math.sqrt(NS)
    q4['c%d_z' % lag] = (c - m0) / (sd * sc)
# the share theta < 1/2 in sd units of random reals
sdh = float(cal['half'].std(ddof=1)) * sc
q4['half_z'] = (q4['half'] - 1 / (2 * LN2)) / sdh
q4['mean_theta_law'] = float(sum(PDL * (EDG[:-1] + EDG[1:]) / 2))
res['q4'] = q4
print('Q4', q4, flush=True)
macro('ObThN', commas(NTH)); macro('ObDl', '%.1f' % dlp); macro('ObDlP', '%.2f' % q4['dl_p']); macro('ObDlPmc', '%.2f' % q4['dl_pmc'])
macro('ObHalf', '%.5f' % q4['half']); macro('ObHalfLaw', '%.5f' % q4['half_law']); macro('ObHalfZ', '%.2f' % q4['half_z'])
macro('ObCalDl', '%.3f' % q4['cal_dl_reject']); macro('ObCalN', NS); macro('ObCalLen', commas(LS))
for lag, nm in ((1, 'One'), (2, 'Two')):
    macro('ObC%s' % nm, '%.5f' % q4['c%d' % lag]); macro('ObC%sNull' % nm, '%.5f' % q4['c%d_null' % lag])
    macro('ObC%sNullSe' % nm, '%.5f' % q4['c%d_null_se' % lag]); macro('ObC%sZ' % nm, '%.2f' % q4['c%d_z' % lag])

save('openq2.json', res)
write_macros('c12_openq2.tex')
print('done', round(time.time() - T0), 's')
