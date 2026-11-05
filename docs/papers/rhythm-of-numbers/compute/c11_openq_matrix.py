"""Open questions, part 5 (question 5): the spectrum of the pulse-train correlation matrix
C_m = [ (gcd(a,b) - 1) / sqrt((a-1)(b-1)) ]_{a,b = 2..m}  (Section 5.2 used m = 40).
Checks the Gram factorization C = D V Phi V^T D, the determinant prod phi(a)/(a-1), tr C^2 = 3m + O(log^3 m),
the exact eigenvalue 1 at primes p > m/2, the largest eigenvalue (Lanczos with an O(m log m) product, up to
m = 10^6) against the proven lower bound, and the spacing-ratio statistic against Poisson and GOE values.
Writes gen/c11_openq_matrix.tex, out/openq_matrix.json and a figure.  Runtime: about 8 minutes on one core."""
import math, time
import numpy as np
from scipy.sparse.linalg import LinearOperator, eigsh
from sympy import totient, primerange, primepi
from common import *

plt = style()
T0 = time.time()


def phi_sieve(m):
    ph = np.arange(m + 1, dtype=np.int64)
    for p in range(2, m + 1):
        if ph[p] == p:
            ph[p::p] -= ph[p::p] // p
    return ph


def full(m):
    a = np.arange(2, m + 1)
    g = np.gcd.outer(a, a).astype(float)
    d = 1 / np.sqrt(a - 1.0)
    return (g - 1) * np.outer(d, d)


res = {}
# ---- 1. exact checks on small sizes ----
for m in (10, 40, 100, 200):
    C = full(m)
    a = np.arange(2, m + 1)
    # Gram factorization
    V = (a[:, None] % a[None, :] == 0).astype(float)   # V[a, d] = 1 if d | a
    Ph = np.diag([float(totient(int(d))) for d in a])
    D = np.diag(1 / np.sqrt(a - 1.0))
    assert np.allclose(D @ V @ Ph @ V.T @ D, C, atol=1e-12)
    sign, logdet = np.linalg.slogdet(C)
    pred = sum(math.log(float(totient(int(x))) / (x - 1)) for x in a)
    assert sign > 0 and abs(logdet - pred) < 1e-8 * max(1, abs(pred)), (m, logdet, pred)
ld40 = sum(math.log(float(totient(x)) / (x - 1)) for x in range(2, 41)) / math.log(10)
ex = math.floor(ld40); macro('OqDetForty', '%.2f \\times 10^{%d}' % (10 ** (ld40 - ex), ex))

# ---- 2. full spectra ----
sizes = [500, 1000, 2000, 4000, 6000]
spec = {}
for m in sizes:
    C = full(m)
    ev = np.linalg.eigvalsh(C)
    spec[m] = ev
    tr2 = float((C * C).sum())
    ones = int((np.abs(ev - 1) < 1e-9).sum())
    lower_ones = int(primepi(m) - primepi(m // 2))
    # spacing ratios in the bulk, eigenvalue 1 removed
    e = np.sort(ev[np.abs(ev - 1) > 1e-7])
    lo, hi = np.quantile(e, [0.1, 0.9])
    b = e[(e > lo) & (e < hi)]
    s = np.diff(b)
    s = s[s > 1e-10]
    r = np.minimum(s[:-1], s[1:]) / np.maximum(s[:-1], s[1:])
    G = math.exp(np.log(ev).mean())
    res[m] = {'tr2_over_n': tr2 / (m - 1), 'ones': ones, 'ones_lower': lower_ones, 'lmin': float(ev.min()),
              'lmax': float(ev.max()), 'r': float(r.mean()), 'geo': G, 'below1': float((ev < 1 - 1e-9).mean()),
              'm3': float(np.mean(ev ** 3))}
    print(m, res[m], round(time.time() - T0), 's', flush=True)
    del C

# tr C^2 / (m-1) at a larger size, in chunks (no eigenvalues)
def tr2(m):
    a = np.arange(2, m + 1, dtype=np.int64); tot = 0.0
    for i in range(0, len(a), 2000):
        A = a[i:i + 2000]
        g = np.gcd.outer(A, a).astype(float)
        tot += (((g - 1) ** 2) / np.outer(A - 1.0, a - 1.0)).sum()
    return tot / (m - 1)
tr2big = tr2(20000)
macro('OqTrBig', '%.4f' % tr2big)

# limit of the geometric mean: exp(sum_p log(1-1/p)/p)
Gl = math.exp(sum(math.log(1 - 1 / p) / p for p in primerange(2, 10 ** 7)))

# ---- 3. largest eigenvalue for large m by Lanczos ----
def top_eig(m):
    ph = phi_sieve(m).astype(float)
    a = np.arange(m + 1, dtype=float)
    dvec = np.zeros(m + 1); dvec[2:] = 1 / np.sqrt(a[2:] - 1)

    def mv(x):
        y = np.zeros(m + 1); y[2:] = dvec[2:] * x.ravel()
        z = np.zeros(m + 1)
        for d in range(2, m + 1):
            z[d] = y[d::d].sum()
        z *= ph
        out = np.zeros(m + 1)
        for d in range(2, m + 1):
            out[d::d] += z[d]
        return (dvec * out)[2:]
    op = LinearOperator((m - 1, m - 1), matvec=mv, dtype=float)
    v0 = dvec[2:].copy()
    val = eigsh(op, k=1, which='LA', v0=v0, tol=1e-9, maxiter=400)[0][0]
    # Rayleigh quotient of the test vector x_a = 1/sqrt(a-1) (a proven lower bound)
    R = float(v0 @ mv(v0) / (v0 @ v0))
    return float(val), R


tops = []
for m in (1000, 3000, 10000, 30000, 100000, 300000, 1000000):
    t = time.time()
    lm, R = top_eig(m)
    if m in res:
        assert abs(lm - res[m]['lmax']) < 1e-6
    if m == 6000 or m == 4000:
        pass
    tops.append((m, lm, R))
    print('top', m, lm, R, (2 / math.pi ** 2) * math.log(m) ** 2, round(time.time() - t), 's', flush=True)
# check Lanczos against the dense value at m = 4000 and 6000
for m in (4000, 6000):
    lm, _ = top_eig(m)
    assert abs(lm - res[m]['lmax']) < 1e-6, (m, lm, res[m]['lmax'])
lm_arr = np.array([t[1] for t in tops]); lnm = np.log(np.array([t[0] for t in tops], float))
coef = np.polyfit(lnm, lm_arr, 2)  # lambda_max ~ c2 ln^2 m + c1 ln m + c0
coefR = np.polyfit(lnm, np.array([t[2] for t in tops]), 2)
save('openq_matrix.json', {'res': {str(k): v for k, v in res.items()}, 'tops': tops, 'coef': coef.tolist(),
                            'coefR': coefR.tolist(), 'Glim': Gl})
print('fit', coef, coefR, 'Glim', Gl, flush=True)

# ---- macros ----
rows = []
for m in sizes:
    x = res[m]
    rows.append('%s & %.3f & %.4f & %.4f & %d & %d & %.3f & %.3f' % (commas(m), x['tr2_over_n'], x['geo'], x['lmin'], x['ones'],
                                                                  x['ones_lower'], x['lmax'], x['r']))
macro('OqMatTable', '\\\\\n'.join(rows) + '\\\\')
macro('OqGeoLim', '%.4f' % Gl)
rows = []
for m, lm, R in tops:
    rows.append('%s & %.3f & %.3f & %.3f' % (commas(m), lm, R, (2 / math.pi ** 2) * math.log(m) ** 2))
macro('OqTopTable', '\\\\\n'.join(rows) + '\\\\')
macro('OqTopCtwo', '%.3f' % coef[0]); macro('OqTwoPiSq', '%.4f' % (2 / math.pi ** 2))
macro('OqRsix', '%.3f' % res[6000]['r'])

# ---- figure ----
fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.4))
ax = axs[0]
for m, c in ((1000, LGREY), (2000, MINT), (6000, GREEN)):
    ev = np.sort(spec[m])
    ax.plot(ev, np.arange(1, len(ev) + 1) / len(ev), color=c, lw=1.0, label='$m = %s$' % commas(m))
# Marchenko-Pastur with the same mean and variance (ratio y = 2): CDF has a jump 1/2 at 0
y = 2.0
xs = np.linspace(1e-4, (1 + math.sqrt(y)) ** 2, 800)
lo, hi = (1 - math.sqrt(y)) ** 2, (1 + math.sqrt(y)) ** 2
dens = np.where((xs > lo) & (xs < hi), np.sqrt(np.clip((hi - xs) * (xs - lo), 0, None)) / (2 * math.pi * y * xs), 0)
cdf = 0.5 + np.cumsum(dens) * (xs[1] - xs[0])
ax.plot(xs, cdf, color=GOLD, ls='--', lw=0.9, label='Marchenko–Pastur, same mean and variance')
ax.set_xscale('log'); ax.set_xlim(0.02, 30); ax.set_ylim(0, 1.02)
ax.set_xlabel(r'eigenvalue $\lambda$'); ax.set_ylabel(r'share of eigenvalues $\leq \lambda$'); ax.legend(fontsize=6, loc='lower right')
ax = axs[1]
mm = np.array([t[0] for t in tops], float)
ax.semilogx(mm, lm_arr, 'o', ms=3.5, color=GREEN, label=r'$\lambda_{\max}$ (Lanczos)')
ax.semilogx(mm, [t[2] for t in tops], 's', ms=3, color=GOLD, label='test-vector lower bound')
mmm = np.logspace(2.8, 6.1, 100)
ax.semilogx(mmm, (2 / math.pi ** 2) * np.log(mmm) ** 2, color=GREY, ls=':', lw=0.9, label=r'$\frac{2}{\pi^2}\ln^2 m$')
ax.set_xlabel('largest period $m$'); ax.set_ylabel('largest eigenvalue'); ax.legend(fontsize=6.3, loc='upper left')
savefig(fig, 'openq_matrix')
write_macros('c11_openq_matrix.tex')
print('done', round(time.time() - T0), 's')
