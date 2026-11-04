"""Chapter 7: continued-fraction factoring (the Lehmer-Powers square-form search on sqrt(N)), Mersenne
necklaces and Fermat's little theorem, and the prime hunt in rhythm prefixes."""
import math, sys
import gmpy2
from gmpy2 import mpz, isqrt
from common import *
sys.set_int_max_str_digits(0)
plt = style()

# ---------- CFRAC, simple version: look for a square Q_n at even n (Lehmer & Powers 1931) ----------
def cfrac_square(N, kmult=1, maxsteps=10 ** 6):
    """Expand sqrt(kN): P_{n+1} = a_n Q_n - P_n, Q_{n+1} = (kN - P_{n+1}^2)/Q_n, A_n = a_n A_{n-1} + A_{n-2} mod N.
    Then A_{n-1}^2 = (-1)^n Q_n (mod N). When n is even and Q_n = s^2, gcd(A_{n-1} - s, N) may split N."""
    M = kmult * N
    a0 = isqrt(M)
    if a0 * a0 == M: return None
    P, Q, a = mpz(0), mpz(1), a0
    Am2, Am1 = mpz(1), a0 % N  # A_{-1}, A_0
    trace = []
    for n in range(1, maxsteps):
        P = a * Q - P
        Q = (M - P * P) // Q
        a = (a0 + P) // Q
        trace.append((n, int(a), int(Q)))
        if n % 2 == 0:
            s = isqrt(Q)
            if s * s == Q:
                g = gmpy2.gcd(Am1 - s, N)
                if 1 < g < N:
                    return int(g), n, trace
        Am2, Am1 = Am1, (a * Am1 + Am2) % N
    return None

F5 = 2 ** 32 + 1
res = None
for k in range(1, 50):
    res = cfrac_square(F5, k)
    if res:
        g, steps, trace = res; mult = k; break
assert g in (641, 6700417) and F5 % g == 0
macro('FFiveFactor', commas(min(g, F5 // g))); macro('FFiveCofactor', commas(max(g, F5 // g)))
macro('FFiveSteps', commas(steps)); macro('FFiveMult', mult)
N2 = 999983 * 1000003
r2 = None
for k in range(1, 50):
    r2 = cfrac_square(N2, k)
    if r2: break
macro('SemiSteps', commas(r2[1])); macro('SemiMult', k)
assert r2[0] in (999983, 1000003)
# first few steps for sqrt(2^32+1) with multiplier 1: table of (n, a_n, Q_n)
t1 = cfrac_square(F5, 1, maxsteps=12)
tr = [] if t1 is None else t1[2]
# regenerate trace directly
M = mult * F5; a0 = isqrt(M); P, Q, a = mpz(0), mpz(1), a0; rows = []
for n in range(1, 9):
    P = a * Q - P; Q = (M - P * P) // Q; a = (a0 + P) // Q
    s = isqrt(Q); rows.append('%d & %s & %s & %s' % (n, commas(int(a)), commas(int(Q)), 'yes' if s * s == Q else ''))
macro('CfracRows', '\\\\\n'.join(rows) + '\\\\')

# ---------- Mersenne necklaces ----------
def orbits(p):
    m = 2 ** p - 1
    seen = set(); lens = []
    for x in range(1, m):
        if x in seen: continue
        L = 0; y = x
        while True:
            seen.add(y); L += 1; y = (2 * y) % m
            if y == x: break
        lens.append(L)
    return lens
for p in (5, 7, 11, 13):
    ol = orbits(p)
    assert all(L == p for L in ol) and len(ol) == (2 ** p - 2) // p
macro('OrbitsSeven', (2 ** 7 - 2) // 7)
ol6 = orbits(6)
from collections import Counter
macro('OrbitsSix', ', '.join('%d of length %d' % (c, L) for L, c in sorted(Counter(ol6).items())))
macro('MersenneDigits', commas(int(136279841 * math.log10(2)) + 1))
assert 2047 == 23 * 89

# ---------- the prime hunt ----------
terms = load('terms.json')
def frac_terms(k):
    t = terms[k]
    return t[1:] if k != 'phi' else t[1:]  # phi - 1 = [0;1,1,...]
words = {}
for k in ('pi', 'e', 'sqrt2', 'phi'):
    ft = frac_terms(k)
    j = 1
    while len(rhythm_word(ft[:j])[-1]) < 1500: j += 1
    w = rhythm_word(ft[:j])[-1]
    words[k] = w[:1500]
assert words['pi'][:7] == '......x'
hunt = {}
for k, w in words.items():
    v = 0; found = []; expn = 0.0; expv = 0.0; curve = []
    for n, ch in enumerate(w, start=1):
        b = 1 if ch == 'x' else 0
        v = 2 * v + b
        if b and n > 1:
            expn += 2 / (n * math.log(2))
            expv += 2 / math.log(v) if v > 2 else 0
            if gmpy2.is_bpsw_prp(v): found.append(n)
        curve.append((n, len(found), expn, expv))
    hunt[k] = {'found': found, 'exp_n': expn, 'exp_v': expv, 'curve': curve[::10]}
    print(k, len(found), found[:20], round(expn, 2), round(expv, 2))
macro('HuntPi', len(hunt['pi']['found'])); macro('HuntPiAt', hunt['pi']['found'][0] if hunt['pi']['found'] else 0)
macro('HuntPiExp', '%.1f' % hunt['pi']['exp_n']); macro('HuntPiExpV', '%.1f' % hunt['pi']['exp_v'])
for k, nm in (('e', 'E'), ('sqrt2', 'Root'), ('phi', 'Phi')):
    macro('Hunt' + nm, len(hunt[k]['found'])); macro('Hunt%sExp' % nm, '%.1f' % hunt[k]['exp_n'])
    macro('Hunt%sExpV' % nm, '%.1f' % hunt[k]['exp_v'])
save('hunt.json', hunt)
fig, ax = plt.subplots(figsize=(5.8, 2.5))
cols = {'pi': GREEN, 'e': GOLD, 'sqrt2': GREY, 'phi': MINT}
lab = {'pi': r'$\pi-3$', 'e': '$e-2$', 'sqrt2': r'$\sqrt{2}-1$', 'phi': r'$\varphi-1$'}
for k in ('pi', 'e', 'sqrt2', 'phi'):
    c = hunt[k]['curve']
    ax.step([x[0] for x in c], [x[1] for x in c], where='post', color=cols[k], lw=1.1, label=lab[k] + ' found')
    ax.plot([x[0] for x in c], [x[3] for x in c], color=cols[k], lw=0.8, ls='--')
ax.set_xlabel('beats read, $n$'); ax.set_ylabel('probable primes'); ax.legend(loc='upper left', fontsize=7, ncol=2)
ax.text(1480, 1, 'dashed: expected', ha='right', fontsize=7, color=DGREY)
savefig(fig, 'prime_hunt')

# Poisson tail probabilities for the hunt (two-sided view: P(X <= found) and P(X >= found))
from scipy import stats
import mpmath as mp
for k, nm in (('pi', 'Pi'), ('e', 'E'), ('sqrt2', 'Root'), ('phi', 'Phi')):
    lam = hunt[k]['exp_v']; f = len(hunt[k]['found'])
    macro('HuntLo' + nm, '%.2f' % stats.poisson.cdf(f, lam)); macro('HuntHi' + nm, '%.2f' % stats.poisson.sf(f - 1, lam))
tot_f = sum(len(hunt[k]['found']) for k in hunt); tot_e = sum(hunt[k]['exp_v'] for k in hunt)
macro('HuntTotFound', tot_f); macro('HuntTotExp', '%.1f' % tot_e)
mp.mp.dps = 30
g = abs(113 * mp.pi - 355)
macro('MiluGap', '%.1f \\times 10^{-5}' % float(g * 1e5))
write_macros('c4_tools.tex')
