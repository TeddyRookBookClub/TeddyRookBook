"""Chapter 17 ("A third look"), part 1: the probable prime q_25332 and the heuristic count to n = 25,332.

Based on Teddy Rook's scripts pi_search.py and verify_new.py (November 2026), who found that the denominator q_25332
of pi's 25,332nd convergent is a probable prime.  This script
  * recomputes pi's continued fraction from mpmath at two precisions 1,000 digits apart and keeps the common prefix,
    and also from MPFR's pi (gmpy2) as an interval, which must agree term by term through n = 25,412;
  * rebuilds q_25332 and p_25332, compares q_25332 with static/connections/rhythm/q25332.txt (the site's copy),
    and prints its digit count, SHA-256 and first and last 30 digits;
  * runs gmpy2.is_strong_bpsw_prp (strong Baillie-PSW) and gmpy2.is_prime(q, 25) (25 Miller-Rabin rounds) on q and
    the strong BPSW test on p: probable-prime tests, not proofs;
  * computes the heuristic of Chapter 8 / Chapter 15 (q_n prime with chance zeta(2)/ln q_n, independently) to
    n = 25,332: expected counts, central 95% ranges and the share at or below the observed count;
  * writes gen/c12_third_pi.tex, gen/c12_third_digits.tex (the 13,017 digits for the appendix) and
    out/third_pi.json.
Needs out/third_search.json from c12_third_pisearch.py (the search of 20,001 <= n <= 25,332).
Runtime: about 3 minutes (most of it in the two strong tests)."""
import hashlib, math, time
import numpy as np
import gmpy2
from gmpy2 import mpz
import mpmath
from common import *

N = 25332
EXTRA = 80
ZETA2 = math.pi ** 2 / 6
SITE = os.path.join(HERE, '..', '..', '..', '..', 'static', 'connections', 'rhythm', 'q25332.txt')


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


t0 = time.time()
N2 = 26000   # Teddy Rook's search went to here
A = mpmath_terms(28500, N2 + 400); B = mpmath_terms(29500, N2 + 400)
k = 0
while k < min(len(A), len(B)) and A[k] == B[k]:
    k += 1
assert k > N2 + EXTRA, k
T2 = mpfr_terms(100000, N2 + 400)
assert len(T2) > N2 + EXTRA and T2[:N2 + EXTRA + 1] == A[:N2 + EXTRA + 1]
T = A[:N2 + EXTRA + 1]
assert T[:8] == [3, 7, 15, 1, 292, 1, 1, 1]
print('terms agree through n =', N2 + EXTRA, round(time.time() - t0, 1), 's')

p0, q0, p1, q1 = mpz(1), mpz(0), mpz(T[0]), mpz(1)
for n in range(1, N + 1):
    p0, p1 = p1, T[n] * p1 + p0
    q0, q1 = q1, T[n] * q1 + q0
s = str(q1)
site = open(SITE).read().strip()
assert s == site, 'the site copy differs from the recomputed q_25332'
sha = hashlib.sha256(s.encode()).hexdigest()
assert sha == '73f98bd668e4c94394d07e7846ca7643d6ecf617317850bcbff60ac260ad7974'
t = time.time(); bpsw = gmpy2.is_strong_bpsw_prp(q1); tb = time.time() - t
t = time.time(); mr = gmpy2.is_prime(q1, 25); tm = time.time() - t
pp = gmpy2.is_strong_bpsw_prp(p1)
assert bpsw and mr and not pp
near = T[N - 2:N + 3]
assert near == [3, 12, 2, 4, 1]
print('digits', len(s), 'sha', sha, 'BPSW', bpsw, round(tb), 's; MR25', mr, round(tm), 's; p prime?', pp)

# the search
S = load('third_search.json')
assert S['start'] == 20001 and S['done'] >= N
qi = [1, 3, 8, 32, 594, 1126, 2002, 3610, 4355, 6925] + [j for j in S['q'] if j <= N]
assert qi[-1] == N and len(qi) == 11

# heuristic: ln q_n by the stable recursion q_n/q_{n-1} = [a_n; a_{n-1}, ..., a_1]
lnq = np.empty(N); r = None; acc = 0.0
for n in range(1, N + 1):
    a = float(T[n]); r = a if r is None else a + 1 / r
    acc += math.log(r); lnq[n - 1] = acc
assert abs(lnq[-1] - (len(s) - 1 + math.log10(int(s[:15]) / 1e14)) * math.log(10)) < 1e-6
pr = ZETA2 / lnq
KMAX = 80
dist = np.zeros(KMAX + 1); dist[0] = 1
grid = sorted(set(int(round(v)) for v in np.logspace(0, math.log10(N), 75)) | {1000, 5000, 20000, N})
rows = []; table = {}; gi = 0; mean = 0.0
for kk, x in enumerate(pr, start=1):
    dist[1:] = dist[1:] * (1 - x) + dist[:-1] * x; dist[0] *= (1 - x); mean += x
    if gi < len(grid) and kk == grid[gi]:
        cdf = np.cumsum(dist)
        lo, hi = int(np.searchsorted(cdf, 0.025)), int(np.searchsorted(cdf, 0.975))
        rows.append([kk, round(mean, 3), lo, hi]); gi += 1
        obs = sum(1 for j in qi if j <= kk)
        table[kk] = (obs, mean, lo, hi, float(cdf[obs]))
trow = []
for M in (1000, 5000, 20000, N):
    o, e, lo, hi, sh = table[M]
    trow.append('%s & %d & %.1f & %d--%d & %.2f' % (commas(M), o, e, lo, hi, sh))
macro('ThPiTable', '\\\\\n'.join(trow) + '\\\\')
o, e, lo, hi, sh = table[N]
macro('ThExp', '%.1f' % e); macro('ThLo', lo); macro('ThHi', hi); macro('ThShare', '%.2f' % sh)
# the stretch with no prime: 6,926 <= n <= 25,331, and the new range 20,001 <= n <= 25,332
gap = pr[6925:N - 1]
macro('ThGapExp', '%.2f' % gap.sum()); macro('ThGapNone', '%.2f' % float(np.prod(1 - gap)))
new = pr[20000:N]
macro('ThNewExp', '%.2f' % new.sum()); macro('ThNewNone', '%.2f' % float(np.prod(1 - new)))
macro('ThOneIn', commas(int(round(1 / pr[N - 1], -1))))
macro('ThLawN', '%.1f' % (2 * math.log(2) * math.log(N)))
macro('ThDigits', commas(len(s))); macro('ThPdigits', commas(len(str(p1))))
macro('ThSha', sha); macro('ThFirst', s[:30]); macro('ThLast', s[-30:])
macro('ThNear', ', '.join(str(v) for v in near))
macro('ThBpswSec', int(round(tb))); macro('ThCert', commas(N2 + EXTRA))
macro('ThSearchStart', commas(S['start']))
# beyond n = N the expected count grows by about 2 ln 2 per e-fold of n (Lévy: ln q_n ~ n pi^2/(12 ln 2))
# the owner's row of Table 15.1 at n = 26,000 (his search: no other prime q_n or p_n for 20,000 < n <= 26,000)
lnq2 = list(lnq); r2 = r; acc2 = acc
for n in range(N + 1, N2 + 1):
    a = float(T[n]); r2 = a + 1 / r2; acc2 += math.log(r2); lnq2.append(acc2)
lnq2 = np.array(lnq2); lnp2 = lnq2 + math.log(math.pi); lnp2[0] = math.log(22)
for lab, arr in (('Q', lnq2), ('P', lnp2)):
    prb = ZETA2 / arr; dd = np.zeros(KMAX + 1); dd[0] = 1
    for x in prb:
        dd[1:] = dd[1:] * (1 - x) + dd[:-1] * x; dd[0] *= (1 - x)
    cdf = np.cumsum(dd)
    macro('ThSix' + lab + 'Exp', '%.1f' % prb.sum())
    macro('ThSix' + lab + 'Range', '%d--%d' % (int(np.searchsorted(cdf, 0.025)), int(np.searchsorted(cdf, 0.975))))
macro('ThToHundredK', '%.1f' % (2 * math.log(2) * math.log(100000 / N)))
write_macros('c12_third_pi.tex')

# the digits for the appendix: lines of 80 digits in groups of 10
lines = []
for i in range(0, len(s), 80):
    chunk = s[i:i + 80]
    lines.append(' '.join(chunk[j:j + 10] for j in range(0, len(chunk), 10)))
with open(os.path.join(GEN, 'c12_third_digits.tex'), 'w') as f:
    f.write('% generated by compute/c12_third_pi.py -- do not edit\n')
    f.write('\\begin{flushleft}\\ttfamily\\scriptsize\n')
    f.write('\\\\\n'.join(lines) + '\n\\end{flushleft}\n')
save('third_pi.json', {'N': N, 'q_idx': qi, 'rows': rows, 'digits': len(s), 'sha256': sha,
                       'table': {str(k): v for k, v in table.items() if k in (1000, 5000, 20000, N)}})
print(trow, 'gap', gap.sum(), np.prod(1 - gap), 'new', new.sum(), 'p_N', pr[N - 1])
