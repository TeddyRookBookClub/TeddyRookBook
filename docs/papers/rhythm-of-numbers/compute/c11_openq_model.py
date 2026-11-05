"""Open questions, part 4 (question 3, and e): the exact expected number of prime convergent denominators for
a uniformly random x, checked by simulation; and the local densities of e's denominators.
Theorem (paper, Section 15.3): for x uniform in (0,1) and q >= 2,
    E #{n >= 1 : q_n(x) = q} = (2/q) * sum_{1 <= r < q, gcd(r,q)=1} 1/(q+r),
so for a prime p it is (2/p)(H_{2p-1} - H_p), and E #{n : q_n prime <= X} = 2 ln 2 (ln ln X + M) - C1 + o(1).
Writes gen/c11_openq_model.tex, out/openq_model.json and one figure.  Runtime: about 5 minutes on one core."""
import math, random, time, json, os, sys
import numpy as np
import gmpy2
from gmpy2 import mpz
from sympy import primerange
from common import *

plt = style()
LN2 = math.log(2)
MERTENS = 0.2614972128476427837554268386  # Meissel-Mertens constant
P2 = 0.4522474200410654985065  # sum of 1/p^2 (prime zeta P(2))
LEVY = math.pi ** 2 / (12 * LN2)
T0 = time.time()

# ---------- 1. the exact formula, summed over primes up to 10^7, and its constant ----------
Y = 10 ** 7
ps = np.array(list(primerange(2, Y)), dtype=np.float64)
# H_{2p-1} - H_p = digamma(2p) - digamma(p+1), computed stably
from scipy.special import digamma
w = 2 * (digamma(2 * ps) - digamma(ps + 1)) / ps
cum_w = np.cumsum(w)
recip = np.cumsum(1 / ps)
# C1 = lim [2 ln2 sum 1/p - sum w]; tail beyond Y: w ~ 2ln2/p - (3/2)/p^2, so the tail of the difference
# is about sum_{p>Y} 1.5/p^2 ~ 1.5/(Y ln Y)
C1 = 2 * LN2 * recip[-1] - cum_w[-1] + 1.5 / (Y * math.log(Y))
B0 = 2 * LN2 * MERTENS - C1   # E(X) = 2 ln 2 ln ln X + B0 + o(1)
# exact check of the formula for small q by brute force over (r, q): equal to sum over the 2 expansions
from fractions import Fraction


def expansions_measure(q):
    tot = Fraction(0)
    for r in range(1, q):
        if math.gcd(r, q) == 1:
            tot += 2 * Fraction(1, q * (q + r))
    return tot


def brute(q):
    """Sum of cylinder lengths over all (a_1..a_n) with q_n = q, by direct search."""
    tot = Fraction(0)
    stack = [((0, 1), ())]  # (q_{n-1}, q_n) with q_{-1}=0, q_0=1
    while stack:
        (qa, qb), t = stack.pop()
        for a in range(1, q + 1):
            qc = a * qb + qa
            if qc > q:
                break
            if qc == q:
                tot += Fraction(1, qc * (qc + qb))
            else:
                stack.append(((qb, qc), t + (a,)))
    return tot


for q in range(2, 40):
    assert brute(q) == expansions_measure(q), q
H = lambda m: sum(Fraction(1, k) for k in range(1, m + 1))
for p in (2, 3, 5, 7, 11, 13):
    assert expansions_measure(p) == Fraction(2, p) * (H(2 * p - 1) - H(p))


def EX(X):
    """sum_{p <= X} (2/p)(H_{2p-1} - H_p): exact sum below 10^7, asymptotic above."""
    if X < Y:
        i = np.searchsorted(ps, X, side='right')
        return float(cum_w[i - 1]) if i else 0.0
    return 2 * LN2 * (math.log(math.log(X)) + MERTENS) - C1


def EH(X):
    """sum_{p <= X} (p-1)/p^2: expected number of n with q_n = p prime <= X and q_n^2|x - p_n/q_n| < 1/2."""
    if X < Y:
        i = np.searchsorted(ps, X, side='right')
        return float(recip[i - 1] - np.cumsum(1 / ps ** 2)[i - 1]) if i else 0.0
    return math.log(math.log(X)) + MERTENS - P2


# ---------- 2. simulation: uniform random x ----------
PR = mpz(1)
for p in range(2, 2000):
    if gmpy2.is_prime(p): PR *= p


def isprp(n):
    if n < 2000:
        return gmpy2.is_prime(n)
    return gmpy2.gcd(n, PR) == 1 and gmpy2.is_bpsw_prp(n)


KX = [5, 10, 20, 50, 100, 200]
NN = [10, 20, 50, 100, 200, 400]
rng = random.Random(20261106)
M = 20000
BITS = 2600   # x = r / 2^BITS; the cylinders used have length > 10^-420, far above 2^-2600
cntX = np.zeros((M, len(KX))); cntH = np.zeros((M, len(KX))); cntN = np.zeros((M, len(NN)))
for s in range(M):
    num, den = mpz(rng.getrandbits(BITS)), mpz(1) << BITS
    x_n, x_d = num, den
    p0, q0, p1, q1 = mpz(1), mpz(0), mpz(0), mpz(1)  # p_{-1}, q_{-1}, p_0, q_0 for x in (0,1): a_0 = 0
    # Euclid on num/den
    a_n, a_d = den, num   # 1/x
    n = 0
    while True:
        a = a_n // a_d
        a_n, a_d = a_d, a_n - a * a_d
        n += 1
        p0, p1 = p1, a * p1 + p0
        q0, q1 = q1, a * q1 + q0
        if a_d == 0:
            raise RuntimeError('expansion too short')
        if n > 400 and len(str(q1)) > 201:
            break
        if isprp(q1):
            d = len(str(q1))
            lq = math.log10(q1)
            half = 2 * q1 * abs(q1 * num - p1 * den) < den
            for j, k in enumerate(KX):
                if lq <= k:
                    cntX[s, j] += 1; cntH[s, j] += half
            for j, N in enumerate(NN):
                if n <= N:
                    cntN[s, j] += 1
print('simulation', round(time.time() - T0), 's', flush=True)
meanX = cntX.mean(0); seX = cntX.std(0, ddof=1) / math.sqrt(M)
meanH = cntH.mean(0); seH = cntH.std(0, ddof=1) / math.sqrt(M)
meanN = cntN.mean(0); seN = cntN.std(0, ddof=1) / math.sqrt(M); varN = cntN.var(0, ddof=1)
predX = [EX(10.0 ** k) for k in KX]; predH = [EH(10.0 ** k) for k in KX]
predN = [2 * LN2 * math.log(N) for N in NN]
res = {'C1': C1, 'B0': B0, 'M': M, 'KX': KX, 'meanX': meanX.tolist(), 'seX': seX.tolist(), 'predX': predX,
       'meanH': meanH.tolist(), 'seH': seH.tolist(), 'predH': predH, 'NN': NN, 'meanN': meanN.tolist(),
       'seN': seN.tolist(), 'varN': varN.tolist()}
print(json.dumps(res, indent=0)[:3000], flush=True)

# ---------- 3. Markov bound constant for the upper bound ----------
from mpmath import nsum, inf, sqrt as msqrt
mu = float(nsum(lambda k: 2 / (k * msqrt(k + 1)), [1, inf]))
res['mu'] = mu

# ---------- 4. e: local densities of q_n modulo small primes (exact, by periodicity) ----------
def e_term(n):
    if n == 0: return 2
    return 2 * ((n + 1) // 3) if n % 3 == 2 else 1


def e_zeros(l):
    """Number of n in 1..6l with l | q_n(e), and whether (q_{6l}, q_{6l+1}) == (q_0, q_1) mod l, i.e. the
    sequence q_n mod l has period dividing 6l (the terms mod l have period 3l)."""
    qa, qb = 1 % l, 1 % l   # q_0 = 1, q_1 = a_1 = 1
    z = 0
    for n in range(1, 6 * l + 1):
        z += (qb == 0)
        a = e_term(n + 1) % l
        qa, qb = qb, (a * qb + qa) % l
    return z, (qa, qb) == (1 % l, 1 % l)


ELIM = 3000
dens = {}
for l in primerange(2, ELIM):
    z, ok = e_zeros(l)
    assert ok, l
    dens[l] = Fraction(z, 6 * l)
terms = load('terms.json')
_, Qe = convergents(terms['e'][:3001])
for l in (2, 3, 5, 7, 11, 13):
    obs = sum(1 for q in Qe[1:] if q % l == 0) / 3000
    assert abs(obs - float(dens[l])) < 0.01, (l, obs, dens[l])
avg_lf = float(np.mean([float(dens[l]) * l for l in dens if l > 2]))
S_e = {}
prod = 1.0
for l in sorted(dens):
    prod *= (1 - float(dens[l])) / (1 - 1 / l)
    if l in (97, 997, 2999):
        S_e[l] = prod
# the divisibility events are far from independent across primes: compare the share of q_n (n <= 3000) with
# no prime factor below y with the product of (1 - f_l) and with random integers
Qm = [mpz(q) for q in Qe[1:]]
sieve = {}
for yv in (100, 1000):
    ls = list(primerange(2, yv)); PRy = mpz(1)
    for l in ls: PRy *= l
    emp = sum(1 for q in Qm if gmpy2.gcd(q, PRy) == 1) / len(Qm)
    ind = math.prod(1 - float(dens[l]) for l in ls)
    rnd = math.prod(1 - 1 / l for l in ls)
    sieve[yv] = (emp, ind, rnd)
lnq = [math.log(q) for q in Qe[1:]]
pc = load('primeconv.json')
eq_idx = pc['e']['q_prime_idx']
ratio = sieve[1000][0] / sieve[1000][2]
exp_e_emp = sum(ratio / x for x in lnq if x > 0)
exp_e_typ = sum(math.pi ** 2 / 6 / x for x in lnq if x > 0)
exp_e_ind = sum(S_e[97] / x for x in lnq if x > 0)
res['e'] = {'avg_lf': avg_lf, 'S_e': {str(k): v for k, v in S_e.items()}, 'sieve': {str(k): v for k, v in sieve.items()},
            'exp_emp': exp_e_emp, 'exp_typ': exp_e_typ, 'exp_ind97': exp_e_ind, 'obs': len(eq_idx),
            'last': eq_idx[-1], 'dens_small': {str(l): str(dens[l]) for l in list(dens)[:12]}}
print('e', res['e'], flush=True)
save('openq_model.json', res)

# ---------- macros ----------
macro('OqCone', '%.4f' % C1); macro('OqBzero', '%.4f' % B0); macro('OqSimM', commas(M))
macro('OqMu', '%.3f' % mu); macro('OqCbig', '%.2f' % (2 * math.log(mu) + 2))
rows = []
for k, m, se, pr, mh, sh, ph in zip(KX, meanX, seX, predX, meanH, seH, predH):
    rows.append('$10^{%d}$ & %.3f & %.3f & %.3f & %.3f & %.3f & %.3f' % (k, m, se, pr, mh, sh, ph))
macro('OqSimTable', '\\\\\n'.join(rows) + '\\\\')
rows = []
for N, m, se, v, pr in zip(NN, meanN, seN, varN, predN):
    rows.append('%d & %.3f & %.3f & %.2f & %.3f' % (N, m, se, v, pr))
macro('OqSimNTable', '\\\\\n'.join(rows) + '\\\\')
fr = lambda f: '%d/%d' % (f.numerator, f.denominator)
macro('OqEdTwo', fr(dens[2])); macro('OqEdThree', fr(dens[3])); macro('OqEdFive', fr(dens[5])); macro('OqEdSeven', fr(dens[7]))
macro('OqEdEleven', fr(dens[11])); macro('OqEdThirteen', fr(dens[13])); macro('OqEdSeventeen', fr(dens[17]))
macro('OqElim', commas(ELIM)); macro('OqEavg', '%.2f' % avg_lf)
macro('OqSeA', '%.2f' % S_e[97]); macro('OqSeB', '%.2f' % S_e[997]); macro('OqSeC', '%.2f' % S_e[2999])
macro('OqEsieveEmp', '%.3f' % sieve[1000][0]); macro('OqEsieveInd', '%.3f' % sieve[1000][1]); macro('OqEsieveRnd', '%.3f' % sieve[1000][2])
macro('OqEsieveEmpH', '%.3f' % sieve[100][0]); macro('OqEsieveIndH', '%.3f' % sieve[100][1]); macro('OqEsieveRndH', '%.3f' % sieve[100][2])
macro('OqEexpEmp', '%.1f' % exp_e_emp); macro('OqEexpTyp', '%.1f' % exp_e_typ); macro('OqEexpInd', '%.1f' % exp_e_ind)
macro('OqEobs', len(eq_idx)); macro('OqElast', eq_idx[-1]); macro('OqEratio', '%.2f' % ratio)
macro('OqPtwo', '%.4f' % P2); macro('OqMertens', '%.4f' % MERTENS)

# ---------- figure: simulation vs the exact expectation ----------
fig, ax = plt.subplots(figsize=(4.8, 2.5))
xx = np.array(KX, float)
ax.errorbar(xx, meanX, yerr=2 * seX, fmt='o', ms=3.5, color=GREEN, capsize=2, label=r'simulation: prime $q_n \leq X$')
ax.errorbar(xx, meanH, yerr=2 * seH, fmt='s', ms=3.2, color=GOLD, capsize=2, label=r'... with $q_n^2|x-p_n/q_n| < 1/2$')
kk = np.linspace(3, 210, 200)
ax.plot(kk, [EX(10.0 ** k) for k in kk], color=GREEN, lw=0.9, label=r'Theorem: $\sum_{p\leq X} \frac{2}{p}(H_{2p-1}-H_p)$')
ax.plot(kk, [EH(10.0 ** k) for k in kk], color=GOLD, lw=0.9, ls='--', label=r'$\sum_{p\leq X} (p-1)/p^2$')
ax.set_xscale('log'); ax.set_xticks(KX); ax.set_xticklabels(['$10^{%d}$' % k for k in KX])
ax.set_xlabel('$X$'); ax.set_ylabel('mean count'); ax.legend(fontsize=6.3, loc='upper left')
savefig(fig, 'openq_model')
write_macros('c11_openq_model.tex')
print('done', round(time.time() - T0), 's')
