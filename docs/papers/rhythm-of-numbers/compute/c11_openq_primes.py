"""Open questions, part 7 (questions 1 and 2): pi's prime convergents to n = 20,000 against the heuristic,
with Poisson-binomial bands; Fibonacci and Pell primes against the Grantham-Granville heuristic.
Needs out/picf.npy, out/pisearch.json (c11_openq_pisearch.py), out/openq_model.json and out/primeconv.json.
Writes gen/c11_openq_primes.tex and a figure.  Runtime: seconds."""
import math
import numpy as np
from common import *

plt = style()
ZETA2 = math.pi ** 2 / 6
GAMMA = 0.5772156649015329
A = np.load(os.path.join(OUT, 'picf.npy'))
S = load('pisearch.json')
N = S['done']
assert N >= int(os.environ.get('OQ_MIN_N', 20000))
qi, pi_ = S['q'], S['p']
# the earlier run (n <= 5000) and OEIS A259490 (k = n + 1: 2, 4, 9, 33, 595, 1127, 2003, 3611, 4356, 6926; none
# further below 25,000)
assert qi == [1, 3, 8, 32, 594, 1126, 2002, 3610, 4355, 6925]
assert pi_[:13] == [4, 8, 10, 15, 86, 229, 333, 593, 839, 852, 1148, 2725, 3787]
# ln q_n, ln p_n (n = 1..N) by the stable float recursion q_n/q_{n-1} = [a_n; a_{n-1}, ..., a_1]
lnq = np.empty(N); r = None; s = 0.0
for n in range(1, N + 1):
    a = float(A[n]); r = a if r is None else a + 1 / r
    s += math.log(r); lnq[n - 1] = s
lnp = lnq + math.log(math.pi)   # p_n / q_n -> pi; exact enough for 1/ln p_n beyond n = 1
lnp[0] = math.log(22)
probq = ZETA2 / lnq; probp = ZETA2 / lnp
assert probq.max() < 1 and probp.max() < 1


KMAX = 80  # counts above 80 have negligible probability here (mean below 20)


def pb_walk(pr, checkpoints):
    """Distribution of a Poisson-binomial count (independent Bernoulli(pr)) at each checkpoint M (first M terms)."""
    dist = np.zeros(KMAX + 1); dist[0] = 1
    out = {}
    cps = set(checkpoints)
    for k, x in enumerate(pr, start=1):
        dist[1:] = dist[1:] * (1 - x) + dist[:-1] * x
        dist[0] *= (1 - x)
        if k in cps:
            out[k] = dist.copy()
    return out


def quant(dist, qs=(0.025, 0.975)):
    cdf = np.cumsum(dist)
    return [int(np.searchsorted(cdf, q)) for q in qs]


rows = []
res = {}
grid = np.unique(np.logspace(0, math.log10(N), 120).astype(int))
walks = {'q': pb_walk(probq, list(grid) + [1000, 5000, 20000]), 'p': pb_walk(probp, list(grid) + [1000, 5000, 20000])}
for lab, idx, pr in (('q', qi, probq), ('p', pi_, probp)):
    for M in (1000, 5000, 20000):
        obs = sum(1 for j in idx if j <= M)
        dist = walks[lab][M]; lo, hi = quant(dist)
        lam = float(pr[:M].sum())
        pct = float(np.cumsum(dist)[obs])  # P(count <= obs)
        res[(lab, M)] = (obs, lam, lo, hi, pct)
for M in (1000, 5000, 20000):
    oq, lq, loq, hiq, pq = res[('q', M)]
    op, lp, lop, hip, pp = res[(('p'), M)]
    rows.append('%s & %d & %.1f & %d--%d & %.2f & %d & %.1f & %d--%d & %.2f' % (commas(M), oq, lq, loq, hiq, pq, op, lp, lop, hip, pp))
macro('OqPiTable', '\\\\\n'.join(rows) + '\\\\')
macro('OqPiQIdx', ', '.join(commas(j) for j in qi)); macro('OqPiPIdx', ', '.join(commas(j) for j in pi_))
macro('OqPiQn', len(qi)); macro('OqPiPn', len(pi_)); macro('OqPiN', commas(N))
macro('OqPiNewP', ', '.join(commas(j) for j in pi_ if j > 5000))
macro('OqPiDigitsN', commas(int(lnq[-1] / math.log(10)) + 1))
# both prime: only n = 8 so far; heuristic expected number of further cases (joint correction zeta(2))
both = sorted(set(qi) & set(pi_))
assert both == [8]
tail = float((ZETA2 / (lnq[8:] * lnp[8:])).sum())   # n = 9..N
L = math.pi ** 2 / (12 * math.log(2))
tail_inf = tail + ZETA2 / (L * L * N)
macro('OqBothTail', '%.2f' % tail_inf)

# e
mo = load('openq_model.json')
# Fibonacci and Pell primes: OEIS A001605 (indices of Fibonacci primes, terms to 3,340,367) and A096650
FIB = [3, 4, 5, 7, 11, 13, 17, 23, 29, 43, 47, 83, 131, 137, 359, 431, 433, 449, 509, 569, 571, 2971, 4723, 5387, 9311,
       9677, 14431, 25561, 30757, 35999, 37511, 50833, 81839, 104911, 130021, 148091, 201107, 397379, 433781, 590041,
       593689, 604711, 931517, 1049897, 1285607, 1636007, 1803059, 1968721, 2904353, 3244369, 3340367]
PELL = [2, 3, 5, 11, 13, 29, 41, 53, 59, 89, 97, 101, 167, 181, 191, 523, 929, 1217, 1301, 1361, 2087, 2273, 2393, 8093,
        13339, 14033, 23747, 28183, 34429, 36749, 90197]
pc = load('primeconv.json')
assert [j + 1 for j in pc['phi']['q_prime_idx']] == [f for f in FIB if f <= 3001]
assert [j + 1 for j in pc['sqrt2']['q_prime_idx']] == [f for f in PELL if f <= 3001]
phi = (1 + 5 ** 0.5) / 2; sil = 1 + 2 ** 0.5
rows = []
for Nn in (100, 1000, 10000, 100000, 1000000, 3340367):
    f = sum(1 for x in FIB if x <= Nn)
    pf = math.exp(GAMMA) * math.log(Nn) / math.log(phi)
    if Nn <= 100000:
        pl = sum(1 for x in PELL if x <= Nn); pp = math.exp(GAMMA) * math.log(Nn) / math.log(sil)
        pells = '%d & %.1f' % (pl, pp)
    else:
        pells = '-- & --'
    rows.append('%s & %d & %.1f & %s' % (commas(Nn), f, pf, pells))
macro('OqFibTable', '\\\\\n'.join(rows) + '\\\\')
macro('OqFibCount', len(FIB)); macro('OqPellCount', len(PELL))

# figure: pi's cumulative counts with Poisson-binomial bands
fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.5), sharey=True)
for ax, idx, pr, lab, key in ((axs[0], qi, probq, 'denominators $q_n$', 'q'), (axs[1], pi_, probp, 'numerators $p_n$', 'p')):
    lo, hi, mean = [], [], []
    for M in grid:
        l, h = quant(walks[key][M])
        lo.append(l); hi.append(h); mean.append(pr[:M].sum())
    ax.fill_between(grid, lo, hi, step='post', color=MINT, alpha=0.35, lw=0, label='95\\% range of the heuristic')
    ax.plot(grid, mean, color=GOLD, lw=0.9, ls='--', label=r'expected: $\sum \zeta(2)/\ln$')
    xs = [1] + [j for j in idx for _ in (0, 1)] + [N]
    ys = [0] + [v for i, _ in enumerate(idx) for v in (i, i + 1)] + [len(idx)]
    ax.plot(xs, ys, color=GREEN, lw=1.2, label=r'$\pi$: probable primes')
    ax.set_xscale('log'); ax.set_xlim(1, N); ax.set_xlabel('index $n$ (log scale)'); ax.set_title(lab, fontsize=8)
axs[0].set_ylabel('count'); axs[0].legend(fontsize=6.3, loc='upper left')
savefig(fig, 'openq_pi_primes')
write_macros('c11_openq_primes.tex')
print({str(k): v for k, v in res.items()}, both, tail_inf)
