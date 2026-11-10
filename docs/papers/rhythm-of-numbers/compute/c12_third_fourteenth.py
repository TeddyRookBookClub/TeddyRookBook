"""Chapter 17 ("A third look"), Sections 17.5-17.6: the fourteenth probable prime q_37721, the counts to n = 40,000,
the cluster, the notes of the prime convergents, and the family of the opening guess.

Based on Teddy Rook's finished Chapter 17 and scripts (November 2026), who found that q_37721 is a probable prime.
  * pi's continued fraction from mpmath at two precisions and from MPFR's pi as an interval (they must agree through
    n = 40,080); q_37721 and p_37721 rebuilt; static/connections/rhythm/q37721.txt written if missing and otherwise
    checked, and compared digit for digit with the owner's copy when present; SHA-256; strong Baillie-PSW and
    25 Miller-Rabin rounds on q, strong BPSW on p (probable-prime tests, not proofs);
  * our own search coverage: out/third_search.json and out/third_sieve_q_*.json (denominators), out/third_sieve_p_*.json
    (numerators); the counts beyond our coverage are Teddy Rook's (denominators to 40,000, numerators to 28,000);
  * Heuristic 8.3 to n = 40,000 (exact Poisson-binomial law); the cluster (heuristic time from 25,000 to 40,000 and the
    Poisson chance of four or more); both versions of the Kolmogorov-Smirnov test; the gaps; the indices mod 2, 3, 4;
    the odds of a fifteenth by 50,000, 80,000 and 160,000 (ln q_n continued linearly beyond 40,000);
  * the notes (remainders mod 12) of the prime denominators and numerators, of all denominators coprime to 12 for
    n <= 33,000, of the prime intermediate denominators of levels 4..3,000 (from out/third_inter_small.json), and the
    exact expected count on each note for a typical number (Theorem 15.3: weight (2/p)(H_{2p-1} - H_p) for the prime p);
    exact multinomial tail probabilities;
  * the family (22k+3)/(7k+1) of the opening guess: which k give primes, and the Bateman-Horn prediction.
Writes gen/c12_third_fourteenth.tex, gen/c12_third_digits4.tex, out/third_fourteenth.json, and the terms a_0..a_40000 to
static/connections/rhythm/pi-terms.txt (for the rhythm sieve on the companion site).
Runtime: about 5 minutes."""
import sys, hashlib, math, time, random
import numpy as np
import gmpy2
from gmpy2 import mpz
from scipy import stats, special, integrate
import mpmath
from common import *

sys.set_int_max_str_digits(0)
NEW = 37721; NMAX = 40000; EXTRA = 80
ZETA2 = math.pi ** 2 / 6
STATIC = os.path.join(HERE, '..', '..', '..', '..', 'static', 'connections', 'rhythm')
OWNER = '/tmp/work_third/update2/numbers/q37721.txt'
NOTES = ['C', 'C$\\sharp$', 'D', 'E$\\flat$', 'E', 'F', 'F$\\sharp$', 'G', 'A$\\flat$', 'A', 'B$\\flat$', 'B']
WEB = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
RES = (1, 5, 7, 11)


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
    gmpy2.get_context().precision = bits
    m, e = gmpy2.const_pi().as_mantissa_exp()
    lo = cf_of(mpz(m) - 2, mpz(1) << (-e), n); hi = cf_of(mpz(m) + 2, mpz(1) << (-e), n)
    k = 0
    while k < min(len(lo), len(hi)) and lo[k] == hi[k]:
        k += 1
    return lo[:k]


A = mpmath_terms(43500, NMAX + 400); B = mpmath_terms(44500, NMAX + 400)
k = 0
while k < min(len(A), len(B)) and A[k] == B[k]:
    k += 1
assert k > NMAX + EXTRA, k
T2 = mpfr_terms(150000, NMAX + 400)
assert len(T2) > NMAX + EXTRA and T2[:NMAX + EXTRA + 1] == A[:NMAX + EXTRA + 1]
T = A[:NMAX + EXTRA + 1]
macro('FoCert', commas(NMAX + EXTRA))
out = {}
# the terms a_0..a_40000 for the rhythm sieve on the companion site (extends the earlier file, which must be a prefix)
fnt = os.path.join(STATIC, 'pi-terms.txt'); txt = ','.join(str(v) for v in T[:NMAX + 1])
if os.path.exists(fnt):
    assert txt.startswith(open(fnt).read().strip())
with open(fnt, 'w') as f:
    f.write(txt + '\n')

# ---- q_37721 -------------------------------------------------------------------------------------------------
p0, q0, p1, q1 = mpz(1), mpz(0), mpz(T[0]), mpz(1)
r12 = {}; pr12 = {}; cop = []          # remainders mod 12
for n in range(1, NMAX + 1):
    p0, p1 = p1, T[n] * p1 + p0
    q0, q1 = q1, T[n] * q1 + q0
    if n == NEW:
        qN, pN = q1, p1
    if n <= 33000:
        cop.append(int(q1 % 12))
    r12[n] = int(q1 % 12); pr12[n] = int(p1 % 12)
s = str(qN)
fn = os.path.join(STATIC, 'q%d.txt' % NEW)
if not os.path.exists(fn):
    with open(fn, 'w') as f:
        f.write(s + '\n')
assert open(fn).read().strip() == s
own_match = None
if os.path.exists(OWNER):
    own_match = open(OWNER).read().strip() == s
    assert own_match, 'owner file differs'
sha = hashlib.sha256(s.encode()).hexdigest()
t = time.time(); bpsw = gmpy2.is_strong_bpsw_prp(qN); tb = time.time() - t
mr = gmpy2.is_prime(qN, 25)
pp = gmpy2.is_strong_bpsw_prp(pN)
assert bpsw and mr and not pp
print('q_%d digits %d sha %s BPSW %s (%d s) MR25 %s p prime? %s owner copy matches: %s'
      % (NEW, len(s), sha, bpsw, tb, mr, pp, own_match), flush=True)
macro('FoDigits', commas(len(s))); macro('FoPdigits', commas(len(str(pN))))
macro('FoSha', sha); macro('FoFirst', s[:30]); macro('FoLast', s[-30:])
macro('FoNear', ', '.join(str(v) for v in T[NEW - 2:NEW + 3])); macro('FoBpswSec', int(round(tb)))
macro('FoNote', NOTES[int(qN % 12)])
lines = []
for i in range(0, len(s), 80):
    chunk = s[i:i + 80]
    lines.append(' '.join(chunk[j:j + 10] for j in range(0, len(chunk), 10)))
with open(os.path.join(GEN, 'c12_third_digits4.tex'), 'w') as f:
    f.write('% generated by compute/c12_third_fourteenth.py -- do not edit\n')
    f.write('\\begin{flushleft}\\ttfamily\\scriptsize\n' + '\\\\\n'.join(lines) + '\n\\end{flushleft}\n')
out[NEW] = dict(digits=len(s), sha256=sha, owner_match=own_match)
for d, name in ((14190, 'Tw'), (16695, 'Tt'), (len(s), 'Fo')):
    macro(name + 'Ecpp', '%.1f' % ((d / 13017) ** 4))

# ---- the searches: ours, and the owner's beyond them -----------------------------------------------------------
S1 = load('third_search.json')
SQ = [load(f) for f in ('third_sieve_q_25333.json', 'third_sieve_q_28001.json', 'third_sieve_q_32395.json',
                        'third_sieve_q_35001.json') if os.path.exists(os.path.join(OUT, f))]
SP = [load('third_sieve_p_20001.json'), load('third_sieve_p_28001.json')]
ourq = 25332
for S in sorted(SQ, key=lambda S: S['start']):
    if S['start'] == ourq + 1 and len(S['done']) == len(S['survivors']):
        ourq = S['n']
ourp = max(S['n'] for S in SP if len(S['done']) == len(S['survivors']))
qi = [1, 3, 8, 32, 594, 1126, 2002, 3610, 4355, 6925] + S1['q'] + sorted(j for S in SQ for j in S['prp'])
qi = sorted(set(qi + [NEW]))          # q_37721 is Teddy Rook's find; verified above whatever our coverage
pi_ = [4, 8, 10, 15, 86, 229, 333, 593, 839, 852, 1148, 2725, 3787, 7441, 8750] + [j for S in SP for j in S['prp']]
assert qi[-4:] == [25332, 27651, 32394, 37721] and len(qi) == 14, qi
assert len(pi_) == 15
macro('FoOurQ', commas(ourq)); macro('FoOurP', commas(ourp))
macro('FoQidx', ', '.join(commas(j) for j in qi)); macro('FoQn', len(qi)); macro('FoPn', len(pi_))
cand = sum(S['n'] - S['start'] + 1 for S in SQ); surv = sum(len(S['survivors']) for S in SQ)
macro('FoSieveQCand', commas(cand)); macro('FoSieveQSurv', commas(surv)); macro('FoSieveQPct', '%.1f' % (100 * surv / cand))
out['coverage'] = dict(q=ourq, p=ourp, sieve_q=[(S['start'], S['n'], len(S['survivors'])) for S in SQ])

# ---- Heuristic 8.3 to 40,000 ---------------------------------------------------------------------------------
lnq = np.empty(NMAX); r = None; acc = 0.0
for n in range(1, NMAX + 1):
    a = float(T[n]); r = a if r is None else a + 1 / r
    acc += math.log(r); lnq[n - 1] = acc
pq = ZETA2 / lnq; cum = np.cumsum(pq)
for M, tag in ((20000, 'Twenty'), (28000, 'TwentyEight'), (32394, 'Thirteenth'), (37721, 'Fourteenth'), (NMAX, 'Forty')):
    dist = np.zeros(81); dist[0] = 1
    for x in pq[:M]:
        dist[1:] = dist[1:] * (1 - x) + dist[:-1] * x; dist[0] *= (1 - x)
    cdf = np.cumsum(dist); obs = sum(1 for j in qi if j <= M)
    macro('FoExp' + tag, '%.1f' % pq[:M].sum()); macro('FoObs' + tag, obs); macro('FoShare' + tag, '%.2f' % cdf[obs])
    macro('FoRange' + tag, '%d--%d' % (int(np.searchsorted(cdf, 0.025)), int(np.searchsorted(cdf, 0.975))))
    out['exp_%d' % M] = float(pq[:M].sum())
# the cluster
lam = float(cum[NMAX - 1] - cum[25000 - 1])
tail = 1 - sum(math.exp(-lam) * lam ** j / math.factorial(j) for j in range(4))
macro('FoClusterLen', '%.2f' % lam); macro('FoClusterP', '%.4f' % tail)
macro('FoClusterN', sum(1 for j in qi if 25000 < j <= NMAX))
out['cluster'] = (lam, tail)
# Kolmogorov-Smirnov, both versions, to 40,000
u = np.array([cum[j - 1] for j in qi]) / cum[NMAX - 1]
macro('FoKsAll', '%.2f' % stats.kstest(u, 'uniform').pvalue)
sel = [j for j in qi if 30 <= j <= NMAX]; base = cum[28]; tot = cum[NMAX - 1] - base
tt = np.array([cum[j - 1] for j in sel]) - base
macro('FoKsRook', '%.2f' % stats.kstest(tt / tot, 'uniform').pvalue)
macro('FoRookN', len(sel)); macro('FoRookExp', '%.1f' % tot)
gaps = np.diff(np.concatenate([[0.0], tt]))
macro('FoGaps', ', '.join('%.2f' % g for g in gaps)); macro('FoLastGap', '%.2f' % gaps[-1])
macro('FoLongGap', '%.2f' % math.exp(-gaps[sel.index(25332)]))   # the gap before the eleventh
out['gaps'] = gaps.tolist()
rng = random.Random(17); pv = []
for mod in (2, 3, 4):
    cnt = np.bincount(np.array(qi) % mod, minlength=mod); e = len(qi) / mod
    x2 = float(((cnt - e) ** 2 / e).sum()); sims = 0
    for _ in range(20000):
        cs = np.bincount([rng.randrange(mod) for _ in qi], minlength=mod)
        if float(((cs - e) ** 2 / e).sum()) >= x2 - 1e-12:
            sims += 1
    pv.append(sims / 20000)
macro('FoModTests', '%.2f, %.2f and %.2f' % tuple(pv))
macro('FoNbBefore', ', '.join(str(T[j]) for j in qi)); macro('FoNbAfter', ', '.join(str(T[j + 1]) for j in qi))
# odds of a fifteenth
slope = (lnq[-1] - lnq[19999]) / (NMAX - 20000)
for X, name in ((50000, 'Fifty'), (80000, 'Eighty'), (160000, 'OneSixty')):
    lam2 = sum(ZETA2 / (lnq[-1] + slope * (n - NMAX)) for n in range(NMAX + 1, X + 1))
    macro('FoOdds' + name, '%d' % round(100 * (1 - math.exp(-lam2))))
    out['odds_%d' % X] = 1 - math.exp(-lam2)

# ---- the notes ------------------------------------------------------------------------------------------------
def counts(rs):
    return [sum(1 for x in rs if x == r) for r in RES]


qn = [r12[j] for j in qi]; pn = [pr12[j] for j in pi_]
assert all(x in RES for x in qn + pn)
cq, cp = counts(qn), counts(pn); call = [a + b for a, b in zip(cq, cp)]
macro('FoMotif', ' '.join(NOTES[x] for x in qn)); out['motif'] = [WEB[x] for x in qn]
macro('FoNotesQ', ' & '.join(map(str, cq))); macro('FoNotesP', ' & '.join(map(str, cp)))
macro('FoNotesAll', ' & '.join(map(str, call)))
cc = counts(cop)
macro('FoNotesCop', ' & '.join(commas(x) for x in cc)); macro('FoCopN', commas(sum(cc)))
macro('FoCopP', '%.2f' % stats.chisquare(cc).pvalue)
INTER = load('third_inter_small.json')['found_list']
ci = counts([x[2] for x in INTER if 4 <= x[0] <= 3000])
macro('FoNotesInter', ' & '.join(map(str, ci))); macro('FoInterN', sum(ci))
macro('FoInterP', '%.2f' % stats.chisquare(ci).pvalue)
out['notes'] = dict(q=cq, p=cp, all=call, coprime=cc, inter=ci)
# typical number: exact expected count on each note (Theorem 15.3), primes 5 <= p < 10^7, tail split evenly
LIM = 10 ** 7
sv = np.ones(LIM, dtype=bool); sv[:2] = False
for i in range(2, int(LIM ** .5) + 1):
    if sv[i]:
        sv[i * i::i] = False
P = np.nonzero(sv)[0].astype(np.float64)
w = 2 / P * (special.digamma(2 * P) - special.digamma(P + 1))      # (2/p)(H_{2p-1} - H_p)
MERT = 0.2614972128476428
C1 = float((2 / P * (math.log(2) - (special.digamma(2 * P) - special.digamma(P + 1)))).sum())
B0 = 2 * math.log(2) * MERT - C1
macro('FoBzero', '%.4f' % B0)
Pi = P.astype(np.int64); big = Pi >= 5
S = {r: float(w[big & (Pi % 12 == r)].sum()) for r in RES}
mean = sum(S.values()) / 4
for X, tag in ((16695, 'A'), (len(s), 'B')):
    total = 2 * math.log(2) * math.log(X * math.log(10)) + B0 - float(w[0] + w[1])
    ex = [total / 4 + S[r] - mean for r in RES]
    macro('FoTypTot' + tag, '%.1f' % total); macro('FoTyp' + tag, ' & '.join('%.2f' % x for x in ex))
    macro('FoTypList' + tag, ', '.join('%.2f' % x for x in ex[:3]) + ' and %.2f' % ex[3])
    out['typical_' + tag] = (total, ex)
wts = np.array(out['typical_B'][1]); wts = wts / wts.sum()


def multi_tail(n, pr, test):
    tot = 0.0
    for a in range(n + 1):
        for b in range(n + 1 - a):
            for c in range(n + 1 - a - b):
                d = n - a - b - c
                if test((a, b, c, d)):
                    tot += math.exp(math.lgamma(n + 1) - sum(math.lgamma(x + 1) for x in (a, b, c, d))
                                    + sum(x * math.log(p) for x, p in zip((a, b, c, d), pr)))
    return tot


eq = [0.25] * 4
n29 = sum(call); gmax = max(call)
macro('FoTailAll', '%.3f' % multi_tail(n29, eq, lambda v: max(v) >= gmax)); macro('FoAllN', n29); macro('FoAllMax', gmax)
macro('FoTailAllTyp', '%.3f' % multi_tail(n29, wts, lambda v: max(v) >= gmax))
big30 = [r12[j] for j in qi if j >= 30] + [pr12[j] for j in pi_ if j >= 30]
g30 = counts(big30)[2]
macro('FoBigN', len(big30)); macro('FoBigG', g30)
macro('FoTailBigG', '%.3f' % multi_tail(len(big30), eq, lambda v: v[2] >= g30))
macro('FoTailBigAny', '%.3f' % multi_tail(len(big30), eq, lambda v: max(v) >= g30))
cover = sum((-1) ** j * math.comb(4, j) * ((4 - j) / 4) ** 10 for j in range(5))
macro('FoMissNote', '%.2f' % (1 - cover))

# ---- the family (22k+3)/(7k+1) of the opening guess -----------------------------------------------------------
KMAX = 10 ** 6
L2 = 22 * KMAX + 4
sv2 = np.ones(L2, dtype=bool); sv2[:2] = False
for i in range(2, int(L2 ** .5) + 1):
    if sv2[i]:
        sv2[i * i::i] = False
k = np.arange(1, KMAX + 1)
den_p = sv2[7 * k + 1]; num_p = sv2[22 * k + 3]; both = k[den_p & num_p]
small = range(1, 17)
macro('FoFamDen', ', '.join(str(j) for j in small if sv2[7 * j + 1]))
macro('FoFamDenV', ', '.join(str(7 * j + 1) for j in small if sv2[7 * j + 1]))
macro('FoFamNum', ', '.join(str(j) for j in small if sv2[22 * j + 3]))
macro('FoFamNumV', ', '.join(str(22 * j + 3) for j in small if sv2[22 * j + 3]))
macro('FoFamBoth', ', '.join(str(int(j)) for j in both[:7]))
macro('FoFamBothF', ', '.join('$%d/%d$' % (22 * j + 3, 7 * j + 1) for j in both[:4]))
nu = {}
C = 1.0
for p in Pi[Pi < 10 ** 7].tolist():
    roots = {(-pow(7, -1, p)) % p if p != 7 else None, (-3 * pow(22, -1, p)) % p if p not in (2, 11) else None} - {None}
    v = len(roots)
    if p < 30:
        nu[p] = v
    C *= (1 - v / p) / (1 - 1 / p) ** 2
assert nu[2] == 1 and nu[7] == 1 and nu[11] == 1 and nu[3] == 2
macro('FoBH', '%.4f' % C)
cnts, preds = [], []
for e in range(2, 7):
    X = 10 ** e
    cnts.append(int((both <= X).sum()))
    preds.append(C * integrate.quad(lambda t: 1 / (math.log(7 * t + 1) * math.log(22 * t + 3)), 1, X, limit=400)[0])
macro('FoBHCounts', ', '.join(commas(c) for c in cnts))
macro('FoBHPred', ', '.join('{:,.1f}'.format(x).replace(',', '{,}') for x in preds))
out['family'] = dict(both=both[:20].tolist(), C=C, counts=cnts, pred=preds)

write_macros('c12_third_fourteenth.tex')
save('third_fourteenth.json', out)
print(out)
