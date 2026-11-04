"""Thread (a): prime numerators and denominators among the convergents.
Heuristic: P(q_n prime) ~ zeta(2)/ln q_n (pairs (q_{n-1}, q_n) mod p equidistribute over the p^2-1 nonzero
pairs, so p | q_n with density 1/(p+1) instead of 1/p), and ln q_n ~ n*pi^2/(12 ln 2) (Levy), so
E[# prime q_n, n <= N] ~ 2 ln 2 * ln N.  Tested on pi, e, sqrt2, phi, log2(3/2) and on random reals."""
import math, sys, random, time
import gmpy2
from gmpy2 import mpz
from common import *
sys.set_int_max_str_digits(0)

terms = load('terms.json')
PRIMORIAL = mpz(1)
for p in range(2, 3000):
    if gmpy2.is_prime(p): PRIMORIAL *= p
SMALL = [p for p in range(2, 3000) if gmpy2.is_prime(p)]

def isprp(n):
    n = mpz(n)
    if n < 2: return False
    if n < 3000: return n in SMALL
    if gmpy2.gcd(n, PRIMORIAL) != 1: return False
    return gmpy2.is_bpsw_prp(n)

def conv_mpz(t):
    p0, q0, p1, q1 = mpz(1), mpz(0), mpz(t[0]), mpz(1)
    P, Q = [p1], [q1]
    for a in t[1:]:
        p0, p1 = p1, a * p1 + p0
        q0, q1 = q1, a * q1 + q0
        P.append(p1); Q.append(q1)
    return P, Q

ZETA2 = math.pi ** 2 / 6
LEVY = math.pi ** 2 / (12 * math.log(2))
C = 2 * math.log(2)

def analyse(t, N, frac_part=False):
    """Count prime p_n, q_n for n = 1..N (n=0 is the whole part); expected sum zeta2/ln."""
    P, Q = conv_mpz(t[:N + 1])
    res = {'q_prime_idx': [], 'p_prime_idx': [], 'exp_q': [], 'exp_p': [], 'even_q': 0, 'three_q': 0}
    eq = ep = 0.0
    for n in range(1, N + 1):
        q, p = Q[n], P[n]
        if q > 1: eq += ZETA2 / float(gmpy2.log(q))
        if p > 1: ep += ZETA2 / float(gmpy2.log(p))
        res['exp_q'].append(eq); res['exp_p'].append(ep)
        if isprp(q): res['q_prime_idx'].append(n)
        if isprp(p): res['p_prime_idx'].append(n)
        res['even_q'] += (q % 2 == 0); res['three_q'] += (q % 3 == 0)
    res['lnqN_over_N'] = float(gmpy2.log(Q[N])) / N
    return res

out = {}
NC = {'pi': 5000, 'e': 3000, 'sqrt2': 3000, 'phi': 3000, 'fifth': 3000}
for k, N in NC.items():
    t0 = time.time()
    r = analyse(terms[k], N)
    r['N'] = N
    out[k] = r
    print(k, N, 'q primes', len(r['q_prime_idx']), r['q_prime_idx'][:30], 'p primes', len(r['p_prime_idx']),
          r['p_prime_idx'][:30], 'exp', round(r['exp_q'][-1], 2), round(time.time() - t0, 1), 's', flush=True)

# random reals: x = r / 10^D, D digits, keep the first N terms (all exact for any real in the cell, by Lochs' bound)
def rand_terms(N, rng):
    D = int(1.6 * N) + 20
    a, b = rng.randrange(1, 10 ** D), 10 ** D
    t = [0]
    while b and len(t) < N + 1:
        a, b = b, a % b  # first step gives a0 = 0 for a < b
        if b:
            t.append(a // b)
    # recompute properly: continued fraction of r/10^D
    num, den = rng.randrange(1, 10 ** D), 10 ** D
    t = []
    while den and len(t) < N + 1:
        t.append(num // den); num, den = den, num % den
    return t

rng = random.Random(20261104)
M, NR = int(sys.argv[1]) if len(sys.argv) > 1 else 400, 1000
rq, rp, rexp = [], [], []
curves = []
for i in range(M):
    t = rand_terms(NR, rng)
    assert len(t) == NR + 1
    r = analyse(t, NR)
    rq.append(len(r['q_prime_idx'])); rp.append(len(r['p_prime_idx'])); rexp.append(r['exp_q'][-1])
    # cumulative count at checkpoints
    cps = [10, 20, 50, 100, 200, 500, 1000]
    curves.append([sum(1 for j in r['q_prime_idx'] if j <= c) for c in cps])
    if i % 50 == 0: print('random', i, rq[-1], rp[-1], round(rexp[-1], 2), flush=True)
out['random'] = {'M': M, 'N': NR, 'q': rq, 'p': rp, 'exp': rexp, 'checkpoints': [10, 20, 50, 100, 200, 500, 1000],
                 'curves': curves}
save('primeconv.json', out)
