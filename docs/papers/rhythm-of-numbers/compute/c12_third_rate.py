"""Chapter 17 ("A third look"), Section 17.7: what the new primes say about the questions.

Based on Teddy Rook's scripts rate.py and voices.py (November 2026), rewritten and rerun for the paper.
  * Pi's own constant: the prime convergents with 30 <= n <= N (numerators and denominators together) against
    Heuristic 8.3 with and without the factor zeta(2), the Poisson estimate of c in "c ln N" with its 95% range, and
    the likelihood ratio, at N = 20,000 and 50,000 (the prime indices are those of Chapters 15 and 17; the ones beyond
    our own search are Teddy Rook's);
  * the rhythm sieve to 10^7 over every n <= 50,000 (denominators and numerators), survivors for 26,268 < n <= 50,000
    against the predictions with and without zeta(2), checked against the survivor lists of our search runs
    (out/third_sieve_*.json), and the expected number of primes among the survivors;
  * a spot check of the voices test: the share of n <= 2,000,000 with l | q_n (and l | p_n) for the 168 primes l < 1000,
    q_n mod 12 against Jager-Liardet, calibrated on random reals (R reals of 100,000 terms,
    expanded exactly; 800 by default, as in Teddy Rook's run).
Needs out/picf.npy (c11_openq_picf.py).  Writes gen/c12_third_rate.tex and out/third_rate.json.
Usage: python3 c12_third_rate.py [R, default 800].  Runtime: about 10 minutes for the sieve (its survivors are kept in
out/third_rate_sieve.json and reused), under a minute for pi's voices, about 1.5 seconds per random real."""
import sys, os, math, time, random, json
from math import gcd
import numpy as np
import gmpy2
from gmpy2 import mpz
from scipy import stats
from common import *

R = int(sys.argv[1]) if len(sys.argv) > 1 else 800
ZETA2 = math.pi ** 2 / 6; EG = math.exp(0.5772156649015329)
NMAX = 50000; LO = 26268; B = 10 ** 7
Q_IDX = [1, 3, 8, 32, 594, 1126, 2002, 3610, 4355, 6925, 25332, 27651, 32394, 37721]
P_IDX = [4, 8, 10, 15, 86, 229, 333, 593, 839, 852, 1148, 2725, 3787, 7441, 8750, 42037]
A = np.load(os.path.join(OUT, 'picf.npy'))
T = [int(v) for v in A[:NMAX + 1]]
assert T[:8] == [3, 7, 15, 1, 292, 1, 1, 1]
out = {}


def primes_upto(n):
    s = np.ones(n + 1, dtype=bool); s[:2] = False
    for i in range(2, int(n ** .5) + 1):
        if s[i]:
            s[i * i::i] = False
    return np.nonzero(s)[0].astype(np.int64)


# ---- ln q_n, ln p_n and pi's own constant -------------------------------------------------------------------------
lnq = [0.0]; lnp = [0.0]
p0, q0, p1, q1 = mpz(1), mpz(0), mpz(T[0]), mpz(1)
for n in range(1, NMAX + 1):
    p0, q0, p1, q1 = p1, q1, T[n] * p1 + p0, T[n] * q1 + q0
    lnq.append(float(gmpy2.log(q1))); lnp.append(float(gmpy2.log(p1)))
Lq = np.cumsum([0.0] + [ZETA2 / x for x in lnq[1:]]); Lp = np.cumsum([0.0] + [ZETA2 / x for x in lnp[1:]])
big = [n for n in Q_IDX if n >= 30] + [n for n in P_IDX if n >= 30]
for lim, tag in ((20000, 'Tw'), (NMAX, 'Fi')):
    obs = sum(1 for n in big if n <= lim)
    ex = (Lq[lim] - Lq[29]) + (Lp[lim] - Lp[29]); naive = ex / ZETA2
    lo, hi = stats.chi2.ppf(0.025, 2 * obs) / 2, stats.chi2.ppf(0.975, 2 * (obs + 1)) / 2
    c = 2 * math.log(2) * obs / ex
    lr = math.exp(obs * math.log(ZETA2) - (ex - naive))
    pn = 1 - stats.poisson.cdf(obs - 1, naive)
    macro('Ra' + tag + 'Obs', obs); macro('Ra' + tag + 'Exp', '%.1f' % ex); macro('Ra' + tag + 'Naive', '%.1f' % naive)
    macro('Ra' + tag + 'Pnaive', '%.3f' % pn); macro('Ra' + tag + 'C', '%.2f' % c)
    macro('Ra' + tag + 'Clo', '%.2f' % (2 * math.log(2) * lo / ex)); macro('Ra' + tag + 'Chi', '%.2f' % (2 * math.log(2) * hi / ex))
    macro('Ra' + tag + 'LR', '%d' % round(lr))
    out['rate_%d' % lim] = dict(obs=obs, exp=ex, naive=naive, p_naive=pn, c=c, c95=[2 * math.log(2) * lo / ex, 2 * math.log(2) * hi / ex], lr=lr)
    print('rate', lim, out['rate_%d' % lim], flush=True)
macro('RaNaiveC', '%.3f' % (12 * math.log(2) / math.pi ** 2))

# ---- the rhythm sieve over n <= 50,000 ----------------------------------------------------------------------------
fs = os.path.join(OUT, 'third_rate_sieve.json')   # the sieve's survivors, kept so that a rerun of the calibration skips it
P = primes_upto(B - 1)
t0 = time.time()
x0, x1 = np.zeros_like(P), np.ones_like(P)          # q_{-1}, q_0
y0, y1 = np.ones_like(P), np.full_like(P, 3)        # p_{-1}, p_0
surv = load('third_rate_sieve.json') if os.path.exists(fs) else {'q': [], 'p': []}
for n in range(1, NMAX + 1 if not surv['q'] else 0):
    a = T[n]
    x0, x1 = x1, (a * x1 + x0) % P
    y0, y1 = y1, (a * y1 + y0) % P
    if n > LO:
        if not (x1 == 0).any():
            surv['q'].append(n)
        if not (y1 == 0).any():
            surv['p'].append(n)
print('sieve', round(time.time() - t0), 's', {k: len(v) for k, v in surv.items()}, flush=True)
save('third_rate_sieve.json', surv)
# agreement with the survivor lists of our search runs, where they overlap
for f in sorted(os.listdir(OUT)):
    if f.startswith('third_sieve_'):
        S = load(f); k = S['kind']
        mine = [n for n in surv[k] if S['start'] <= n <= S['n']]
        if S['start'] > LO:
            assert mine == S['survivors'], f
        else:
            assert [n for n in S['survivors'] if n > LO] == mine, f
cand = NMAX - LO
pred = ZETA2 / EG / math.log(B); naive = 1 / EG / math.log(B)
macro('RaCand', commas(cand)); macro('RaSurvQ', commas(len(surv['q']))); macro('RaSurvP', commas(len(surv['p'])))
macro('RaPredZ', commas(round(pred * cand))); macro('RaPredNaive', commas(round(naive * cand)))
macro('RaPctZ', '%.2f' % (100 * pred)); macro('RaPctNaive', '%.2f' % (100 * naive))
eq = sum(EG * math.log(B) / lnq[n] for n in surv['q']); ep = sum(EG * math.log(B) / lnp[n] for n in surv['p'])
found = sum(1 for n in surv['q'] if n in Q_IDX) + sum(1 for n in surv['p'] if n in P_IDX)
assert found == 4
macro('RaAmongExp', '%.1f' % (eq + ep)); macro('RaAmongFound', found)
macro('RaAmongP', '%.2f' % (1 - stats.poisson.cdf(found - 1, eq + ep)))
out['sieve'] = dict(cand=cand, surv_q=len(surv['q']), surv_p=len(surv['p']), pred=pred * cand, naive=naive * cand,
                    among_exp=eq + ep, found=found)
print('sieve', out['sieve'], flush=True)

# ---- the voices, spot check ---------------------------------------------------------------------------------------
L = primes_upto(1000); P0 = 1 / (L + 1.0)
W12 = np.array([sum(1 for u in range(12) if gcd(gcd(u, v), 12) == 1) for v in range(12)], float); W12 /= W12.sum()


def voices(Tm):
    N = len(Tm) - 1
    q0, q1 = np.zeros_like(L), np.ones_like(L); p0, p1 = np.ones_like(L), np.int64(Tm[0]) % L
    Hq = np.zeros(len(L), np.int64); Hp = np.zeros(len(L), np.int64); c12 = [0] * 12; a12, b12 = 0, 1
    for n in range(1, N + 1):
        a = int(Tm[n])
        q0, q1 = q1, (a * q1 + q0) % L; p0, p1 = p1, (a * p1 + p0) % L
        Hq += (q1 == 0); Hp += (p1 == 0)
        a12, b12 = b12, (a * b12 + a12) % 12; c12[b12] += 1
    sd = np.sqrt(N * P0 * (1 - P0))
    c12 = np.array(c12, float)
    return dict(N=N, Hq=Hq, Hp=Hp, zq=(Hq - N * P0) / sd, zp=(Hp - N * P0) / sd, chi12=float(((c12 - N * W12) ** 2 / (N * W12)).sum()))


def random_terms(M, rng):
    D = int(1.04 * M) + 300; num, den = mpz(rng.randrange(1, 10 ** D)), mpz(10) ** D; o = []
    while den and len(o) < M + 1:
        a, r = gmpy2.f_divmod(num, den); o.append(int(a)); num, den = den, r
    return o


t0 = time.time()
V = voices(A[:2000001].tolist())
print('pi voices', round(time.time() - t0), 's', flush=True)
rng = random.Random(20261110); cal = []
t0 = time.time()
for i in range(R):
    cal.append(voices(random_terms(100000, rng)))
print(len(cal), 'random reals', round(time.time() - t0), 's', flush=True)
Zq = np.array([c['zq'] for c in cal]); Zp = np.array([c['zp'] for c in cal])
sdq, sdp = Zq.std(0), Zp.std(0)
zq, zp = V['zq'] / sdq, V['zp'] / sdp
calSq = ((Zq / sdq) ** 2).sum(1); calSp = ((Zp / sdp) ** 2).sum(1)
Sq, Sp = float((zq ** 2).sum()), float((zp ** 2).sum())
calchi = np.array([c['chi12'] for c in cal])
for i, l in enumerate(L[:6]):
    macro('RaShare' + 'abcdef'[i], '%.6f' % (V['Hq'][i] / V['N']))
    macro('RaZ' + 'abcdef'[i], '$%+.2f$' % zq[i])
macro('RaSdTwo', '%.2f' % sdq[0]); macro('RaCalR', R)
macro('RaSq', '%.1f' % Sq); macro('RaSqCal', '%.1f' % calSq.mean()); macro('RaSqP', '%.2f' % (calSq >= Sq).mean())
macro('RaSp', '%.1f' % Sp); macro('RaSpCal', '%.1f' % calSp.mean()); macro('RaSpP', '%.2f' % (calSp >= Sp).mean())
macro('RaMaxQ', '%.2f' % np.abs(zq).max()); macro('RaMaxQl', int(L[np.abs(zq).argmax()]))
macro('RaMaxP', '%.2f' % np.abs(zp).max()); macro('RaMaxPl', int(L[np.abs(zp).argmax()]))
macro('RaChiTwelve', '%.1f' % V['chi12']); macro('RaChiTwelveP', '%.2f' % (calchi >= V['chi12']).mean())
out['voices'] = dict(N=V['N'], share=[float(V['Hq'][i] / V['N']) for i in range(6)], z=[float(z) for z in zq[:6]],
                     sd_l2=float(sdq[0]), R=R, Sq=Sq, Sq_cal=float(calSq.mean()), Sq_p=float((calSq >= Sq).mean()),
                     Sp=Sp, Sp_cal=float(calSp.mean()), Sp_p=float((calSp >= Sp).mean()),
                     maxq=[float(np.abs(zq).max()), int(L[np.abs(zq).argmax()])], maxp=[float(np.abs(zp).max()), int(L[np.abs(zp).argmax()])],
                     chi12=V['chi12'], chi12_p=float((calchi >= V['chi12']).mean()))
print('voices', out['voices'], flush=True)
write_macros('c12_third_rate.tex')
save('third_rate.json', out)
