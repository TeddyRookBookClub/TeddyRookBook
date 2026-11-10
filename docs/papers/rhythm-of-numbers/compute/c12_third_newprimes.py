"""Chapter 17 ("A third look"), Sections 17.5-17.6: the twelfth and thirteenth probable primes q_27651 and q_32394,
the counts to n = 32,394, the odds of a fourteenth, tests for a pattern, the mod-12 motif, and checks of the numbers in
Teddy Rook's draft of Chapter 17.

Based on Teddy Rook's notes and draft (November 2026), who found that q_27651 and q_32394 are probable primes.
  * pi's continued fraction from mpmath at two precisions and from MPFR's pi as an interval (they must agree through
    n = 32,474); q_27651, q_32394 and their numerators rebuilt; static/connections/rhythm/q<n>.txt written if missing and
    otherwise checked (the owner's files /tmp/work_third/owner-q*.txt are compared too when present); digit counts,
    SHA-256, first and last 30 digits; strong Baillie-PSW and 25 Miller-Rabin rounds on q, strong BPSW on p (probable-prime
    tests, not proofs);
  * the searches: out/third_search.json (q, 20,001..25,332), out/third_sieve_q_25333.json, out/third_sieve_q_28001.json
    (q to 32,394), out/third_sieve_p_20001.json, out/third_sieve_p_28001.json (p to 32,394);
  * the heuristic of Chapter 8 to n = 28,000 and n = 32,394 (exact Poisson-binomial law);
  * the chance of a fourteenth prime denominator by n = 40,000, 56,000 and 100,000 (Poisson model, ln q_n continued
    linearly beyond n = 32,394), and, for the record, the chance of a thirteenth seen from n = 28,000;
  * tests for a pattern, two versions: (a) all prime convergents, positions mapped through the expected count from
    n = 1; (b) as in Teddy Rook's draft, only the primes with n >= 30 (for smaller n, 1/ln q_n is not a probability),
    heuristic time from n = 30; Kolmogorov-Smirnov against the uniform law, given the number found; the gaps in
    heuristic time; the indices modulo 2, 3, 4; the terms next to each prime denominator;
  * the remainders of the prime denominators modulo 12, read as notes (C = 0, ..., B = 11);
  * the terms 19,308 and 78,629 at positions 23,398 and 28,421, the next "veins" of intermediate fractions.
Writes gen/c12_third_newprimes.tex, gen/c12_third_digits2.tex, gen/c12_third_digits3.tex, out/third_newprimes.json.
Runtime: about 5 minutes."""
import hashlib, math, time, random
import numpy as np
import gmpy2
from gmpy2 import mpz
from scipy import stats
import mpmath
from common import *

NEW = [27651, 32394]; NMAX = 32394; EXTRA = 80
ZETA2 = math.pi ** 2 / 6
STATIC = os.path.join(HERE, '..', '..', '..', '..', 'static', 'connections', 'rhythm')


def cf_of(num, den, n):
    out = []
    while den and len(out) < n:
        a, r = gmpy2.f_divmod(num, den); out.append(int(a)); num, den = den, r
    return out


def mpmath_terms(dps, n):
    mpmath.mp.dps = dps
    x = +mpmath.pi
    return cf_of(mpz(int(x.man)) << max(0, x.exp), mpz(1) << max(0, -x.exp), n)


def mpfr_terms(bits, n):
    """Terms shared by both ends of the interval [m-2, m+2] * 2^e around MPFR's pi."""
    gmpy2.get_context().precision = bits
    m, e = gmpy2.const_pi().as_mantissa_exp()
    lo = cf_of(mpz(m) - 2, mpz(1) << (-e), n); hi = cf_of(mpz(m) + 2, mpz(1) << (-e), n)
    k = 0
    while k < min(len(lo), len(hi)) and lo[k] == hi[k]:
        k += 1
    return lo[:k]


A = mpmath_terms(35000, NMAX + 400); B = mpmath_terms(36000, NMAX + 400)
k = 0
while k < min(len(A), len(B)) and A[k] == B[k]:
    k += 1
assert k > NMAX + EXTRA, k
T2 = mpfr_terms(125000, NMAX + 400)
assert len(T2) > NMAX + EXTRA and T2[:NMAX + EXTRA + 1] == A[:NMAX + EXTRA + 1]
T = A[:NMAX + EXTRA + 1]
macro('TwCert', commas(NMAX + EXTRA))

p0, q0, p1, q1 = mpz(1), mpz(0), mpz(T[0]), mpz(1)
built = {}
for n in range(1, NMAX + 1):
    p0, p1 = p1, T[n] * p1 + p0
    q0, q1 = q1, T[n] * q1 + q0
    if n in NEW:
        built[n] = (q1, p1)
out = {}
for n in NEW:
    qN, pN = built[n]
    s = str(qN)
    fn = os.path.join(STATIC, 'q%d.txt' % n)
    if not os.path.exists(fn):
        with open(fn, 'w') as f:
            f.write(s + '\n')
    assert open(fn).read().strip() == s
    own = '/tmp/work_third/owner-q%d.txt' % n
    if os.path.exists(own):
        assert open(own).read().strip() == s, 'owner file differs'
    sha = hashlib.sha256(s.encode()).hexdigest()
    t = time.time(); bpsw = gmpy2.is_strong_bpsw_prp(qN); tb = time.time() - t
    mr = gmpy2.is_prime(qN, 25)
    pp = gmpy2.is_strong_bpsw_prp(pN)
    assert bpsw and mr and not pp
    print('q_%d digits %d sha %s BPSW %s (%d s) MR25 %s p prime? %s' % (n, len(s), sha, bpsw, tb, mr, pp), flush=True)
    pre = 'Tw' if n == 27651 else 'Tt'
    macro(pre + 'Digits', commas(len(s))); macro(pre + 'Pdigits', commas(len(str(pN))))
    macro(pre + 'Sha', sha); macro(pre + 'First', s[:30]); macro(pre + 'Last', s[-30:])
    macro(pre + 'Near', ', '.join(str(v) for v in T[n - 2:n + 3])); macro(pre + 'BpswSec', int(round(tb)))
    lines = []
    for i in range(0, len(s), 80):
        chunk = s[i:i + 80]
        lines.append(' '.join(chunk[j:j + 10] for j in range(0, len(chunk), 10)))
    with open(os.path.join(GEN, 'c12_third_digits%d.tex' % (2 if n == 27651 else 3)), 'w') as f:
        f.write('% generated by compute/c12_third_newprimes.py -- do not edit\n')
        f.write('\\begin{flushleft}\\ttfamily\\scriptsize\n' + '\\\\\n'.join(lines) + '\n\\end{flushleft}\n')
    out[n] = dict(digits=len(s), sha256=sha)

# the searches
S1 = load('third_search.json')
SQ = [load('third_sieve_q_25333.json'), load('third_sieve_q_28001.json')]
SP = [load('third_sieve_p_20001.json'), load('third_sieve_p_28001.json')]
for S in SQ + SP:
    assert len(S['done']) == len(S['survivors'])
assert S1['done'] >= 25332 and SQ[1]['n'] == NMAX and SP[1]['n'] == NMAX
qi = [1, 3, 8, 32, 594, 1126, 2002, 3610, 4355, 6925] + S1['q'] + SQ[0]['prp'] + SQ[1]['prp']
pi_ = [4, 8, 10, 15, 86, 229, 333, 593, 839, 852, 1148, 2725, 3787, 7441, 8750] + SP[0]['prp'] + SP[1]['prp']
assert qi[-3:] == [25332, 27651, 32394], qi
macro('TwQidx', ', '.join(commas(j) for j in qi)); macro('TwQn', len(qi)); macro('TwPn', len(pi_))
cand = sum(S['n'] - S['start'] + 1 for S in SQ); surv = sum(len(S['survivors']) for S in SQ)
macro('TwSieveQCand', commas(cand)); macro('TwSieveQSurv', commas(surv)); macro('TwSieveQPct', '%.1f' % (100 * surv / cand))
cand = sum(S['n'] - S['start'] + 1 for S in SP); surv = sum(len(S['survivors']) for S in SP)
macro('TwSievePCand', commas(cand)); macro('TwSievePSurv', commas(surv)); macro('TwSievePPct', '%.1f' % (100 * surv / cand))
macro('TwSieveSec', commas(max(S.get('sieve_seconds', 0) for S in SQ + SP)))
macro('TwSieveTheory', '%.1f' % (100 * ZETA2 * math.exp(-0.5772156649015329) / math.log(1e7)))

# heuristic
lnq = np.empty(NMAX); r = None; acc = 0.0
for n in range(1, NMAX + 1):
    a = float(T[n]); r = a if r is None else a + 1 / r
    acc += math.log(r); lnq[n - 1] = acc
lnp = lnq + math.log(math.pi); lnp[0] = math.log(22)
for M, tagM in ((28000, 'A'), (NMAX, 'B')):
    for lab, arr, idx in (('Q', lnq, qi), ('P', lnp, pi_)):
        pr = ZETA2 / arr[:M]
        dist = np.zeros(81); dist[0] = 1
        for x in pr:
            dist[1:] = dist[1:] * (1 - x) + dist[:-1] * x; dist[0] *= (1 - x)
        cdf = np.cumsum(dist); obs = sum(1 for j in idx if j <= M)
        macro('TwExp' + lab + tagM, '%.1f' % pr.sum())
        macro('TwRange' + lab + tagM, '%d--%d' % (int(np.searchsorted(cdf, 0.025)), int(np.searchsorted(cdf, 0.975))))
        macro('TwShare' + lab + tagM, '%.2f' % cdf[obs]); macro('TwObs' + lab + tagM, obs)
        out['exp_%s_%d' % (lab, M)] = float(pr.sum())
pq = ZETA2 / lnq
macro('TwShortGap', '%.2f' % (1 - float(np.prod(1 - pq[25332:27651]))))
macro('TwThirdGap', '%.2f' % (1 - float(np.prod(1 - pq[27651:32394]))))
# pattern tests
cum = np.cumsum(pq); cump = np.cumsum(ZETA2 / lnp)
for lab, c, idx in (('Q', cum, qi), ('P', cump, pi_)):
    u = np.array([c[j - 1] for j in idx]) / c[-1]
    macro('TwKs' + lab, '%.2f' % stats.kstest(u, 'uniform').pvalue)
    # Teddy Rook's version: n >= 30 only, time from n = 30, to n = 28,000 and to n = 32,394
    for M, tagM in ((28000, 'A'), (NMAX, 'B')):
        sel = [j for j in idx if 30 <= j <= M]
        base = c[28]; tot = c[M - 1] - base
        u2 = (np.array([c[j - 1] for j in sel]) - base) / tot
        macro('TwKsRook' + lab + tagM, '%.2f' % stats.kstest(u2, 'uniform').pvalue)
        macro('TwRookN' + lab + tagM, len(sel)); macro('TwRookExp' + lab + tagM, '%.1f' % tot)
        if lab == 'Q':
            t = (np.array([c[j - 1] for j in sel]) - base)
            gaps = np.diff(t)
            macro('TwGaps' + tagM, ', '.join('%.2f' % g for g in gaps))
            out['gaps_%d' % M] = gaps.tolist()
rng = random.Random(17)
for mod in (2, 3, 4):
    pv = []
    for lab, idx in (('Q', qi), ('P', pi_)):
        cnt = np.bincount(np.array(idx) % mod, minlength=mod); e = len(idx) / mod
        x2 = float(((cnt - e) ** 2 / e).sum()); sims = 0
        for _ in range(20000):
            cs = np.bincount([rng.randrange(mod) for _ in idx], minlength=mod)
            if float(((cs - e) ** 2 / e).sum()) >= x2 - 1e-12:
                sims += 1
        pv.append(sims / 20000)
    macro('TwMod' + ['', '', 'Two', 'Three', 'Four'][mod], '%.2f and %.2f' % tuple(pv))
macro('TwNbBefore', ', '.join(str(T[j]) for j in qi)); macro('TwNbAfter', ', '.join(str(T[j + 1]) for j in qi))
# odds
slope = (lnq[-1] - lnq[19999]) / (NMAX - 20000)
macro('TwSlope', '%.4f' % slope)
for start, tag in ((28000, 'Old'), (NMAX, '')):
    for X, name in ((40000, 'Forty'), (56000, 'FiftySix'), (100000, 'Hundred')):
        lam = sum(ZETA2 / (lnq[start - 1] + slope * (n - start)) for n in range(start + 1, X + 1))
        macro('TwOdds' + tag + name, '%d' % round(100 * (1 - math.exp(-lam))))
        out['odds_%d_%d' % (start, X)] = 1 - math.exp(-lam)
# the motif
NOTES = ['C', 'C$\\sharp$', 'D', 'E$\\flat$', 'E', 'F', 'F$\\sharp$', 'G', 'A$\\flat$', 'A', 'B$\\flat$', 'B']
WEB = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
qq0, qq1 = 0, 1; rem = {}
for n in range(1, NMAX + 1):
    qq0, qq1 = qq1, (T[n] * qq1 + qq0) % 12
    if n in qi:
        rem[n] = qq1
motif = [rem[n] for n in qi]
assert all(x in (1, 5, 7, 11) for x in motif)
macro('TwMotif', ' '.join(NOTES[x] for x in motif)); out['motif'] = [WEB[x] for x in motif]
macro('TwFirstB', next(i for i, x in enumerate(motif) if x == 11) + 1)
macro('TtNote', NOTES[motif[-1]])
cover = sum((-1) ** j * math.comb(4, j) * ((4 - j) / 4) ** 10 for j in range(5))
macro('TwMissNote', '%.2f' % (1 - cover))
# the next veins of intermediate fractions: expected primes (a-1)/ln(size), and with the local factor q/phi(q)
P5 = [p for p in range(2, 100000) if gmpy2.is_prime(p)]
vein = []
qq0, qq1, m = mpz(0), mpz(1), 0
for pos in (23398, 28421):
    a = T[pos]
    while m < pos - 1:
        m += 1
        qq0, qq1 = qq1, T[m] * qq1 + qq0
    dens = 1.0
    for p in P5:
        if qq1 % p == 0:
            dens *= p / (p - 1)
    e0 = (a - 1) / (math.log(int(qq1)) + math.log(a / 2))
    vein.append((pos, a, len(str(qq1 * a)), e0, e0 * dens))
assert vein[0][1] == 19308 and vein[1][1] == 78629, vein
macro('TwVeinOneDig', commas(vein[0][2])); macro('TwVeinOneExp', '%.1f' % vein[0][3]); macro('TwVeinOneExpL', '%.1f' % vein[0][4])
macro('TwVeinTwoDig', commas(vein[1][2])); macro('TwVeinTwoExp', '%.1f' % vein[1][3]); macro('TwVeinTwoExpL', '%.1f' % vein[1][4])
write_macros('c12_third_newprimes.tex')
out.update(q_idx=qi, p_idx=pi_, vein=vein)
save('third_newprimes.json', out)
print(out)
