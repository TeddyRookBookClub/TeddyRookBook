"""Open questions, part 3 (question 4): pi's first 12,000,000 terms against the Gauss-Kuzmin law, Khinchin's
and Levy's constants, and Galambos's law for the largest term.  Null distributions of the test statistics are
calibrated by simulation on random reals (exact expansions of random fractions), because the terms of a
typical number are weakly dependent and textbook chi-square p-values assume independence.
Needs out/picf.npy.  Writes gen/c11_openq_stats.tex, out/openq_stats.json and three figures.
Runtime: about 6 minutes on one core."""
import math, os, sys, time, random
import numpy as np
from scipy import stats
import gmpy2
from gmpy2 import mpz
from common import *
import c11_openq_picf as cfm

sys.setrecursionlimit(10000)
plt = style()
LN2 = math.log(2)
A = np.load(os.path.join(OUT, 'picf.npy'))[1:]  # a_1, a_2, ... (drop a_0 = 3)
NT = len(A)
K0 = 2.6854520010653064453  # Khinchin's constant
LEVY = math.pi ** 2 / (12 * LN2)


def gk(k):
    return -math.log2(1 - 1 / (k + 1) ** 2)


def gk_tail(k):  # P(a > k)
    return math.log2((k + 2) / (k + 1))


KMAX = 100
PROBS = np.array([gk(k) for k in range(1, KMAX + 1)] + [gk_tail(KMAX)])
# dyadic bins for the tail: [2^j, 2^(j+1)), j = 0..; P(a >= m) = log2((m+1)/m)
def dyadic_probs(J):
    P = [math.log2((2 ** j + 1) / 2 ** j) - math.log2((2 ** (j + 1) + 1) / 2 ** (j + 1)) for j in range(J)]
    P.append(math.log2((2 ** J + 1) / 2 ** J))
    return np.array(P)


def counts(a):
    c = np.bincount(np.minimum(a, KMAX + 1), minlength=KMAX + 2)[1:]
    return c


def chi2(a, probs=PROBS):
    o = counts(a); e = len(a) * probs
    return float(((o - e) ** 2 / e).sum())


def dyadic_chi2(a, J):
    j = np.minimum(np.floor(np.log2(a.astype(float))).astype(int), J)
    o = np.bincount(j, minlength=J + 1); e = len(a) * dyadic_probs(J)
    return float(((o - e) ** 2 / e).sum())


# pairs (a_n, a_{n+1}) with values 1..5 and 6+: Gauss measure of the cylinders
def cyl(i, j):
    # x in [0; i, j, ...]: endpoints [0;i,j] and [0;i,j+1]; j = None means a_2 >= 6: endpoints [0;i,6] and [0;i]
    f = lambda t: 1 / (i + t)
    if j is None:
        x1, x2 = f(1 / 6), f(0)
    else:
        x1, x2 = f(1 / j), f(1 / (j + 1))
    lo, hi = min(x1, x2), max(x1, x2)
    return math.log2((1 + hi) / (1 + lo))


PAIRP = np.array([[cyl(i, j) for j in (1, 2, 3, 4, 5, None)] for i in range(1, 6)])
PAIRP = np.vstack([PAIRP, np.zeros(6)])
# row for a_n >= 6: P(a_n >= 6, a_{n+1} = j) = P(a_{n+1} = j) - sum_{i<=5} P(i, j)
marg = np.array([gk(j) for j in range(1, 6)] + [gk_tail(5)])
PAIRP[5] = marg - PAIRP[:5].sum(0)
assert abs(PAIRP.sum() - 1) < 1e-12 and (PAIRP > 0).all()


def pair_chi2(a):
    b = np.minimum(a, 6) - 1
    o = np.zeros((6, 6))
    np.add.at(o, (b[:-1], b[1:]), 1)
    e = (len(a) - 1) * PAIRP
    return float(((o - e) ** 2 / e).sum())


def levy_series(a):
    """ln q_n for n = 1..len(a), by the stable float recursion r_n = a_n + 1/r_{n-1} (q_n/q_{n-1} = r_n)."""
    out = np.empty(len(a)); r = None; s = 0.0
    for n, x in enumerate(a.tolist()):
        r = float(x) if r is None else x + 1.0 / r
        s += math.log(r); out[n] = s
    return out


def random_terms(n, rng):
    bits = int(n * 4.2) + 400
    num = mpz(rng.getrandbits(bits)); den = mpz(1) << bits
    del cfm.TERMS[:]
    cfm.cf_interval(num, den, num + 1, den)
    t = np.array(cfm.TERMS, dtype=np.int64)
    return t[1:n + 1] if t[0] == 0 else t[:n]


if __name__ == '__main__':
    T0 = time.time()
    res = {'N': NT}
    # ---- calibration on random reals: 1,000 sequences of 100,000 terms ----
    rng = random.Random(20261105)
    NS, LS = 1000, 100000
    cal = {'chi': [], 'dy': [], 'pair': [], 'geo': [], 'levy': []}
    JDY = 12
    for s in range(NS):
        a = random_terms(LS, rng)
        assert len(a) == LS
        cal['chi'].append(chi2(a)); cal['dy'].append(dyadic_chi2(a, JDY)); cal['pair'].append(pair_chi2(a))
        cal['geo'].append(float(np.log(a).mean()))
        cal['levy'].append(levy_series(a)[-1] / LS)
    print('calibration', round(time.time() - T0), 's', flush=True)
    for k in cal: cal[k] = np.array(cal[k])
    sd_geo = cal['geo'].std(ddof=1) * math.sqrt(LS)   # asymptotic s.d. of sum ln a_k per sqrt(n)
    sd_levy = cal['levy'].std(ddof=1) * math.sqrt(LS)
    res['sd_geo'] = sd_geo; res['sd_levy'] = sd_levy
    # ---- pi ----
    c = counts(A)
    chiP = chi2(A); dyP = dyadic_chi2(A, 20); pairP = pair_chi2(A)
    res['chi'] = chiP; res['chi_p'] = float(stats.chi2.sf(chiP, KMAX)); res['chi_pmc'] = float((cal['chi'] >= chiP).mean())
    res['pair'] = pairP; res['pair_p'] = float(stats.chi2.sf(pairP, 35)); res['pair_pmc'] = float((cal['pair'] >= pairP).mean())
    res['dy'] = dyP; res['dy_p'] = float(stats.chi2.sf(dyP, 20))
    # dyadic bins: J = 20 for pi (textbook p); the calibration uses J = 12 (expected counts >= 35 in 10^5 terms)
    dy12 = dyadic_chi2(A, JDY); res['dy12_pmc'] = float((cal['dy'] >= dy12).mean()); res['dy12_p'] = float(stats.chi2.sf(dy12, JDY))
    # calibration check: the share of random sequences with textbook p < 0.05
    res['cal_chi_reject'] = float((stats.chi2.sf(cal['chi'], KMAX) < 0.05).mean())
    res['cal_pair_reject'] = float((stats.chi2.sf(cal['pair'], 35) < 0.05).mean())
    # blocks of 100,000 terms of pi: textbook p-values and their uniformity
    B = NT // LS
    bp = [float(stats.chi2.sf(chi2(A[i * LS:(i + 1) * LS]), KMAX)) for i in range(B)]
    res['blocks'] = B; res['block_ks_p'] = float(stats.kstest(bp, 'uniform').pvalue)
    calp = stats.chi2.sf(cal['chi'], KMAX)
    res['block_vs_random_p'] = float(stats.ks_2samp(bp, calp).pvalue)
    # Khinchin and Levy
    lnA = np.log(A.astype(float))
    geo = math.exp(lnA.mean()); res['geo'] = geo
    res['geo_z'] = (lnA.sum() - NT * math.log(K0)) / (sd_geo * math.sqrt(NT))
    L = levy_series(A); res['levy'] = L[-1] / NT
    res['levy_z'] = (L[-1] - NT * LEVY) / (sd_levy * math.sqrt(NT))
    # records and Galambos percentiles at checkpoints
    cps = [10 ** 3, 10 ** 4, 10 ** 5, 10 ** 6, 10 ** 7, NT]
    gal = []
    for n in cps:
        M = int(A[:n].max()); r = M * LN2 / n
        gal.append((n, M, int(A[:n].argmax()) + 1, math.exp(-1 / r)))
    res['galambos'] = gal
    # first missing values, and the count of distinct values
    present = np.zeros(200001, bool); present[A[A <= 200000]] = True
    res['first_missing'] = int(np.argmin(present[1:]) + 1)
    res['ones'] = int(c[0]); res['ones_share'] = float(c[0] / NT)
    save('openq_stats.json', {k: v for k, v in res.items()})
    print(res, flush=True)

    # ---- macros ----
    macro('OqNT', commas(NT)); macro('OqNTm', '12')
    macro('OqChi', '%.1f' % chiP); macro('OqChiP', '%.2f' % res['chi_p']); macro('OqChiPmc', '%.2f' % res['chi_pmc'])
    macro('OqPair', '%.1f' % pairP); macro('OqPairP', '%.2f' % res['pair_p']); macro('OqPairPmc', '%.2f' % res['pair_pmc'])
    macro('OqDy', '%.1f' % dyP); macro('OqDyP', '%.2f' % res['dy_p'])
    macro('OqCalChi', '%.3f' % res['cal_chi_reject']); macro('OqCalPair', '%.3f' % res['cal_pair_reject'])
    macro('OqBlocks', B); macro('OqBlockKS', '%.2f' % res['block_ks_p'])
    macro('OqGeo', '%.5f' % geo); macro('OqGeoZ', '%.2f' % res['geo_z'])
    macro('OqLevy', '%.6f' % res['levy']); macro('OqLevyZ', '%.2f' % res['levy_z']); macro('OqLevyConst', '%.6f' % LEVY)
    macro('OqKzero', '%.6f' % K0)
    macro('OqOnes', commas(res['ones'])); macro('OqOnesPct', '%.3f' % (100 * res['ones_share'])); macro('OqOnesLaw', '%.3f' % (100 * gk(1)))
    macro('OqFirstMissing', commas(res['first_missing']))
    macro('OqCalN', commas(NS)); macro('OqCalLen', commas(LS))
    rows = []
    for n, M, pos, F in gal:
        rows.append('%s & %s & %s & %.2f' % (commas(n), commas(M), commas(pos), F))
    macro('OqGalTable', '\\\\\n'.join(rows) + '\\\\')

    # ---- figures ----
    fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.4))
    k = np.arange(1, 31)
    ax = axs[0]
    rel = (c[:30] - NT * PROBS[:30]) / np.sqrt(NT * PROBS[:30])
    ax.bar(k, rel, color=GREEN, width=0.7)
    ax.axhline(2, color=GOLD, lw=0.7, ls='--'); ax.axhline(-2, color=GOLD, lw=0.7, ls='--'); ax.axhline(0, color=DGREY, lw=0.5)
    ax.set_xlabel('term value $k$'); ax.set_ylabel('(observed $-$ expected)/$\\sqrt{\\mathrm{expected}}$')
    ax.set_title('Gauss--Kuzmin: standardized residuals', fontsize=8)
    ax = axs[1]
    m = np.unique(np.logspace(0, 8.9, 300).astype(np.int64))
    srt = np.sort(A)
    tail = NT - np.searchsorted(srt, m, side='left')  # count of a >= m
    ax.loglog(m, tail / NT, color=GREEN, lw=1.0, label=r'$\pi$, share of terms $\geq m$')
    ax.loglog(m, np.log2((m + 1) / m), color=GOLD, lw=0.8, ls='--', label=r'law: $\log_2(1 + 1/m)$')
    ax.set_xlabel('$m$'); ax.set_ylabel('share'); ax.legend(fontsize=6.5, loc='lower left')
    ax.set_title('the tail, out to the largest term', fontsize=8)
    savefig(fig, 'openq_gk')

    fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.3))
    n = np.unique(np.logspace(1, math.log10(NT), 400).astype(np.int64))
    cg = np.cumsum(lnA)
    ax = axs[0]
    zg = (cg[n - 1] - n * math.log(K0)) / (sd_geo * np.sqrt(n))
    zl = (L[n - 1] - n * LEVY) / (sd_levy * np.sqrt(n))
    ax.semilogx(n, zg, color=GREEN, lw=0.9, label='Khinchin (geometric mean)')
    ax.semilogx(n, zl, color=GOLD, lw=0.9, label=r'Lévy ($\ln q_n/n$)')
    for y in (-2, 2): ax.axhline(y, color=GREY, lw=0.6, ls=':')
    ax.axhline(0, color=DGREY, lw=0.5)
    ax.set_xlabel('number of terms $n$'); ax.set_ylabel('standardized deviation'); ax.legend(fontsize=6.5)
    ax = axs[1]
    rec_n, rec_v = [], []
    best = 0
    for i, x in enumerate(A.tolist()):
        if x > best:
            best = x; rec_n.append(i + 1); rec_v.append(x)
    ax.loglog(rec_n, rec_v, 'o', ms=3, color=GREEN, label=r'records of $\pi$')
    nn = np.logspace(0, math.log10(NT), 100)
    ax.loglog(nn, nn / LN2 / (-np.log(0.5)), color=GOLD, lw=0.8, label='median of the maximum')
    ax.fill_between(nn, nn / LN2 / (-np.log(0.05)), nn / LN2 / (-np.log(0.95)), color=MINT, alpha=0.3, lw=0, label='5%–95% band')
    ax.set_xlabel('position $n$'); ax.set_ylabel('largest term so far'); ax.legend(fontsize=6.5, loc='upper left')
    savefig(fig, 'openq_khinchin')
    write_macros('c11_openq_stats.tex')
    print('done', round(time.time() - T0), 's')
