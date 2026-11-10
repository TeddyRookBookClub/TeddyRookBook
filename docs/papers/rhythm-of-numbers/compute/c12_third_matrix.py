"""Chapter 17 ("A third look"), part 3: the extreme eigenvalues of the correlation matrix C_m.

Based on Teddy Rook's scripts eig.py, bounds.py and lemma_check.py (November 2026).
C_m = [(gcd(a,b) - 1)/sqrt((a-1)(b-1))]_{a,b=2..m}, the matrix of Section 5.2 and Chapters 15-16, which equals
D V Phi V^T D (Proposition 15.x); its inverse is D^-1 V^-T Phi^-1 V^-1 D^-1 with (V^-1)_{da} = mu(d/a) for a | d.
Both are applied in O(m log m) operations, so the Lanczos method (scipy eigsh) gives lambda_max(C_m) and
lambda_max(C_m^-1) = 1/lambda_min(C_m).  The trace of C_m^-1 is exact: sum over d of (prod_{p|d} (p+1)/(p-1)
- 2^omega(d)/phi(d)) (Proposition 17.7).  Also:
  * the constant kappa = prod_p (1 + 2/(p(p-1))) (primes below 10^7; the tail is below 2 * 10^-7 / ln 10^7);
  * the explicit Schur-test upper bound of Lemma 17.2 for G_m = [gcd(a,b)/sqrt(ab)]_{a,b<=m}, optimized
    over sigma and y, and the Schur ratio max_a (G w)_a / w_a of its weight vector, computed directly; both bound
    lambda_max(G_m), and twice either bounds lambda_max(C_m);
  * Rayleigh quotients of the resonator test vectors of the proofs (lower bounds for lambda_max and 1/lambda_min).
  * the explicit lower bound M (1 - R2 - R3) of the proof for those vectors (negative at every m here).
  * Schur's test for the matrix N of the proof of Theorem 17.5 (upper bound for 1/lambda_min), at m = 10^4, 10^5;
  * lambda_max(G_m) at m = 10^4, and lambda_max, lambda_min, tr C^-1 also at m = 500 and 3 * 10^6.
Writes gen/c12_third_matrix.tex.  Runtime: about 4 minutes; memory about 3 GB at m = 3 * 10^6."""
import math, time
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as sla
from common import *

MS = [1000, 10000, 100000, 1000000]


def sieve(m):
    phi = np.arange(m + 1, dtype=np.int64); mu = np.ones(m + 1, dtype=np.int64); isp = np.ones(m + 1, dtype=bool)
    isp[:2] = False; omega = np.zeros(m + 1, dtype=np.int64)
    for p in range(2, m + 1):
        if isp[p]:
            isp[2 * p::p] = False
            phi[p::p] -= phi[p::p] // p
            mu[p::p] *= -1
            omega[p::p] += 1
            if p * p <= m:
                mu[p * p::p * p] = 0
    return phi, mu, omega, np.nonzero(isp)[0]


def operators(m, phi, mu):
    rows = []; cols = []; mus = []
    for d in range(2, m + 1):
        a = np.arange(d, m + 1, d)
        rows.append(a - 2); cols.append(np.full(len(a), d - 2)); mus.append(mu[a // d])
    rows = np.concatenate(rows); cols = np.concatenate(cols); mus = np.concatenate(mus).astype(float)
    V = sp.csr_matrix((np.ones(len(rows)), (rows, cols)), shape=(m - 1, m - 1))
    nz = mus != 0
    Vi = sp.csr_matrix((mus[nz], (rows[nz], cols[nz])), shape=(m - 1, m - 1))   # Vi[d, a] = mu(d/a)
    a = np.arange(2, m + 1); D = 1 / np.sqrt(a - 1.0); ph = phi[2:].astype(float)
    VT = V.T.tocsr(); ViT = Vi.T.tocsr()
    C = lambda x: D * (V @ (ph * (VT @ (D * x))))
    Ci = lambda x: (ViT @ ((Vi @ (x / D)) / ph)) / D
    return C, Ci


def resonator(m, P, mu, lo, hi, A):
    """f on square-free n <= m built from primes in (lo, hi], f_p = min(1, A/(sqrt p ln p)); index n = 2..m."""
    f = np.ones(m + 1)
    for p in P:
        if lo < p <= hi:
            f[p::p] *= min(1.0, A / (math.sqrt(p) * math.log(p)))
        else:
            f[p::p] = 0
    f[mu == 0] = 0; f[:2] = 0
    return f[2:]


res = {}
for m in MS:
    t = time.time()
    phi, mu, omega, P = sieve(m)
    C, Ci = operators(m, phi, mu)
    n = m - 1
    lmax = sla.eigsh(sla.LinearOperator((n, n), matvec=C, dtype=float), k=1, which='LA', tol=1e-10,
                     return_eigenvectors=False)[0]
    imax = sla.eigsh(sla.LinearOperator((n, n), matvec=Ci, dtype=float), k=1, which='LA', tol=1e-10,
                     return_eigenvectors=False)[0]
    d = np.arange(2, m + 1)
    h = np.ones(m + 1)
    for p in P:
        h[p::p] *= (p + 1) / (p - 1)
    tr = float((h[2:] - 2.0 ** omega[2:] / phi[2:]).sum())
    # direct check of the trace formula from the diagonal of C^-1 at the smallest size
    if m == 1000:
        Cinv = np.linalg.inv(np.array([[(math.gcd(i, j) - 1) / math.sqrt((i - 1) * (j - 1)) for j in d] for i in d]))
        assert abs(np.trace(Cinv) - tr) < 1e-6 * tr
        ev = np.linalg.eigvalsh(np.linalg.inv(Cinv))
        assert abs(ev[-1] - lmax) < 1e-6 and abs(1 / ev[0] - imax) < 1e-4
    # resonator lower bounds (Lemma 17.3, Theorem 17.5): best over a small grid
    best = (0, None); besti = (0, None); explow = -1e300
    for lo, hi in ((1, 50), (1, 200), (1, 1000), (3, 1000), (1, m)):
        for A in (0.5, 1, 1.5, 2, 3, 4, 6, 8):
            x = resonator(m, P, mu, lo, hi, A)
            if not x.any():
                continue
            R = x @ C(x) / (x @ x)
            y = mu[2:] * x * np.sqrt(d / (d - 1.0)); Ri = y @ Ci(y) / (y @ y)
            if R > best[0]:
                best = (R, (lo, hi, A))
            # the proof's explicit lower bound M (1 - R2 - R3) for this vector, best over sigma
            Ps = np.array([pp for pp in P if lo < pp <= hi], dtype=float)
            fp = np.minimum(1.0, A / (np.sqrt(Ps) * np.log(Ps)))
            Mm = float(np.prod(1 + 2 * fp / (np.sqrt(Ps) * (1 + fp ** 2))))
            R3 = float(np.prod(1 - (1 - 1 / Ps) * fp ** 2 / (1 + fp ** 2 + 2 * fp / np.sqrt(Ps))))   # Lemma 17.3
            for sg in np.arange(0.02, 3, 0.02):
                with np.errstate(over='ignore'):
                    R2 = 2 * m ** -sg * float(np.prod(1 + (Ps ** sg - 1) * (fp ** 2 + fp / np.sqrt(Ps))))
                lowb = Mm * (1 - R2 - R3)
                assert lowb <= R + 1e-9
                explow = max(explow, lowb)
            if Ri > besti[0]:
                besti = (Ri, (lo, hi, A))
    assert best[0] <= lmax * (1 + 1e-9) and besti[0] <= imax * (1 + 1e-9)
    L = math.log(m); ll = math.log(L)
    res[m] = dict(lmax=lmax, imax=imax, tr=tr / (m - 1), pred=math.exp(2 * math.sqrt(L / ll)),
                  rl=math.log(lmax) / math.sqrt(L / ll), ri=math.log(imax) / math.sqrt(L / ll),
                  res=best[0], resi=besti[0], explow=explow, t=time.time() - t)
    print(m, res[m], best, besti, flush=True)

# kappa
LIMK = 10 ** 7
s = np.ones(LIMK + 1, dtype=bool); s[:2] = False
for i in range(2, int(LIMK ** .5) + 1):
    if s[i]:
        s[i * i::i] = False
PR = np.nonzero(s)[0].astype(float)
kappa = float(np.exp(np.log1p(2 / (PR * (PR - 1))).sum()))
macro('ThKappa', '%.5f' % kappa)


# explicit Schur bound for G_m (Lemma 17.2), and the direct Schur ratio of its weights
def upper(m, sigma, y):
    small = PR[PR <= y]; big = PR[PR > y]
    x = 1 / (big * (big ** sigma - 1))
    if (x >= 1).any():
        return float('inf')
    tail = (1 / sigma) / math.log(LIMK) * LIMK ** -sigma * 1.05   # primes above 10^7 (crude, safe)
    return sigma * math.log(m) - 2 * np.log1p(-small ** -0.5).sum() - np.log1p(-x).sum() + tail   # Lemma 17.2


rows = []
for m in MS:
    best = min((upper(m, sg, y), sg, y) for sg in np.arange(0.05, 0.6, 0.01)
               for y in (1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 47))
    u, sg, y = best
    # direct Schur ratio for G_m with w(a) = prod t_p^{v_p(a)}
    phi, mu, omega, P = sieve(m)
    w = np.ones(m + 1)
    for p in P:
        tp = 1.0 if p <= y else p ** -0.5 / (1 - p ** -sg)
        pk = p
        while pk <= m:
            w[pk::pk] *= tp; pk *= p
    w = w[1:]
    rws = []; cls = []
    for dd in range(1, m + 1):
        aa = np.arange(dd, m + 1, dd); rws.append(aa - 1); cls.append(np.full(len(aa), dd - 1))
    V1 = sp.csr_matrix((np.ones(sum(len(r) for r in rws)), (np.concatenate(rws), np.concatenate(cls))), shape=(m, m))
    D1 = 1 / np.sqrt(np.arange(1, m + 1.0))
    Gw = D1 * (V1 @ (phi[1:] * (V1.T @ (D1 * w))))
    ratio = float((Gw / w).max())
    assert ratio <= math.exp(u) * (1 + 1e-9) and ratio * 2 >= res[m]['lmax']
    r = res[m]
    rows.append('%s & %.2f & %.2f & %.2f & %s & %s & %.2f & %.2f & %.5f' % (
        commas(m), r['res'], r['lmax'], r['pred'], commas(int(round(2 * ratio))), commas(int(round(2 * math.exp(u)))),
        r['rl'], r['ri'], r['tr']))
    res[m].update(schur=2 * ratio, explicit=2 * math.exp(u))
macro('ThExplowMax', '%.2f' % max(res[m]['explow'] for m in MS))
assert max(res[m]['explow'] for m in MS) < 5
macro('ThMatTable', '\\\\\n'.join(rows) + '\\\\')
rows = []
for m in MS:
    r = res[m]
    rows.append('%s & %.2f & %.2f & %.4f & %.2f & %.2f' % (commas(m), r['resi'], r['imax'], 1 / r['imax'],
                                                         r['imax'] / r['lmax'], r['tr']))
macro('ThMinTable', '\\\\\n'.join(rows) + '\\\\')
for key, m in (('Four', 10000), ('Five', 100000), ('Six', 1000000)):
    macro('ThLmax' + key, '%.2f' % res[m]['lmax']); macro('ThImax' + key, '%.2f' % res[m]['imax'])
    macro('ThPred' + key, '%.1f' % res[m]['pred']); macro('ThTr' + key, '%.4f' % res[m]['tr'])
    macro('ThSchur' + key, commas(int(round(res[m]['schur']))))
    macro('ThExplicit' + key, commas(int(round(res[m]['explicit']))))

# Theorem 17.5, upper bound: Schur's test for N_ab = sqrt(ab) sum_d mu^2(d/a) mu^2(d/b)/phi(d) (a, b = 2..m), which
# dominates |C_m^-1| entrywise.  Weights t_p = 1 (p <= y), t_p = p^(-1/2)/c_p with c_p = p^s (1 - 1/p) - 1 (p > y).
# Check: 1/lambda_min <= max_a (N w)_a / w_a <= m^sigma prod_p sup_e E_p(e), with E_p as in the proof.
def Ep_sup(p, sg, t):
    s_ = p ** -sg; x = math.sqrt(p) * t
    e0 = 1 + s_ * (1 + x) / (p - 1)
    ee = [s_ ** e * (p * (1 + 1 / x) / (p - 1) + s_ * (1 + x) / (p - 1)) for e in range(1, 40)]
    return max([e0] + ee)
for m in (10000, 100000):
    phi, mu, omega, P = sieve(m)
    best = None
    for sg in (0.15, 0.2, 0.25, 0.3, 0.35):
        for y in (2, 3, 5, 7, 11, 13):
            ok = all(p ** sg * (1 - 1 / p) - 1 > 0 for p in P if p > y)
            if not ok:
                continue
            logb = sg * math.log(m) + sum(math.log(Ep_sup(int(p), sg, 1.0 if p <= y else p ** -0.5 / (p ** sg * (1 - 1 / p) - 1))) for p in P)
            if best is None or logb < best[0]:
                best = (logb, sg, y)
    logb, sg, y = best
    w = np.ones(m + 1)
    for p in P:
        tp = 1.0 if p <= y else p ** -0.5 / (p ** sg * (1 - 1 / p) - 1)
        pk = p
        while pk <= m:
            w[pk::pk] *= tp; pk *= p
    rws = []; cls = []; vals = []
    for d in range(2, m + 1):
        aa = np.arange(d, m + 1, d); k = aa // d
        keep = mu[k] != 0
        rws.append(aa[keep] - 2); cls.append(np.full(keep.sum(), d - 2))
    S = sp.csr_matrix((np.ones(sum(len(r) for r in rws)), (np.concatenate(rws), np.concatenate(cls))), shape=(m - 1, m - 1))
    # S[d, a] = mu^2(d/a) for a | d
    sq = np.sqrt(np.arange(2, m + 1.0)); ph = phi[2:].astype(float); ww = w[2:]
    Nw = sq * (S.T @ ((S @ (sq * ww)) / ph))
    ratio = float((Nw / ww).max())
    assert res[m]['imax'] <= ratio * (1 + 1e-9) and ratio <= math.exp(logb) * (1 + 1e-9)
    macro('ThInvSchur' + ('Four' if m == 10000 else 'Five'), commas(int(round(ratio))))
    macro('ThInvBound' + ('Four' if m == 10000 else 'Five'), commas(int(round(math.exp(logb)))))
    print('inverse Schur', m, res[m]['imax'], ratio, math.exp(logb), sg, y)

# lambda_max(G_m) at m = 10^4 (for the comparison with Lemma 17.2), and two more sizes for the ratio table
from scipy.sparse.linalg import LinearOperator
m = 10000
phi, mu, omega, P = sieve(m)
rws = []; cls = []
for dd in range(1, m + 1):
    aa = np.arange(dd, m + 1, dd); rws.append(aa - 1); cls.append(np.full(len(aa), dd - 1))
V1 = sp.csr_matrix((np.ones(sum(len(r) for r in rws)), (np.concatenate(rws), np.concatenate(cls))), shape=(m, m))
D1 = 1 / np.sqrt(np.arange(1, m + 1.0))
gmax = sla.eigsh(LinearOperator((m, m), matvec=lambda x: D1 * (V1 @ (phi[1:] * (V1.T @ (D1 * x)))), dtype=float),
                 k=1, which='LA', tol=1e-10, return_eigenvectors=False)[0]
macro('ThGmaxFour', '%.1f' % gmax)
macro('ThLemmaTwoFour', commas(int(round(math.exp(min(upper(m, sg, y) for sg in np.arange(0.05, 0.6, 0.01)
                                                      for y in (1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29)))))))
for m in (500, 3000000):
    phi, mu, omega, P = sieve(m)
    C, Ci = operators(m, phi, mu); n = m - 1
    lmax = sla.eigsh(sla.LinearOperator((n, n), matvec=C, dtype=float), k=1, which='LA', tol=1e-10, return_eigenvectors=False)[0]
    imax = sla.eigsh(sla.LinearOperator((n, n), matvec=Ci, dtype=float), k=1, which='LA', tol=1e-10, return_eigenvectors=False)[0]
    h = np.ones(m + 1)
    for p in P:
        h[p::p] *= (p + 1) / (p - 1)
    tr = float((h[2:] - 2.0 ** omega[2:] / phi[2:]).sum()) / (m - 1)
    res[m] = dict(lmax=lmax, imax=imax, tr=tr)
    print(m, lmax, imax, tr, flush=True)
rows = []
for m in [500] + MS + [3000000]:
    r = res[m]
    rows.append('%s & %.3f & %.6f & %.2f & %.3f & %.5f' % (commas(m), r['lmax'], 1 / r['imax'], r['imax'],
                                                          r['imax'] / r['lmax'], r['tr']))
macro('ThRatioTable', '\\\\\n'.join(rows) + '\\\\')
macro('ThTrBig', '%.5f' % res[3000000]['tr'])
macro('ThRatioLo', '%.2f' % min(res[m]['imax'] / res[m]['lmax'] for m in res))
macro('ThRatioHi', '%.2f' % max(res[m]['imax'] / res[m]['lmax'] for m in res))
write_macros('c12_third_matrix.tex')
save('third_matrix.json', {str(k): v for k, v in res.items()})
