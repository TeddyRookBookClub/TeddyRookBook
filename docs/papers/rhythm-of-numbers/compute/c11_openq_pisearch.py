"""Open questions, part 2: probable-prime numerators p_n and denominators q_n of pi's convergents, n <= N.
Terms from out/picf.npy (c11_openq_picf.py).  Trial division by the primes below 10^5 (one gcd with their
product), then gmpy2.is_bpsw_prp, a Baillie-PSW probable-prime test (not a proof of primality).
Resumable: progress is kept in out/pisearch.json.  Usage: python3 c11_openq_pisearch.py [N, default 20000].
Runtime: about 45 minutes for N = 20,000 on one core (most of it in the last few thousand n)."""
import sys, os, json, time
import numpy as np
import gmpy2
from gmpy2 import mpz
from common import OUT

N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
fn = os.path.join(OUT, 'pisearch.json')
a = np.load(os.path.join(OUT, 'picf.npy'))[:N + 1].tolist()
PR = mpz(1)
SMALL = []
for p in range(2, 100000):
    if gmpy2.is_prime(p):
        PR *= p; SMALL.append(p)
SMALLSET = set(SMALL)


def isprp(n):
    if n < 100000:
        return int(n) in SMALLSET
    if gmpy2.gcd(n, PR) != 1:
        return False
    return gmpy2.is_bpsw_prp(n)


state = json.load(open(fn)) if os.path.exists(fn) else {'done': 0, 'q': [], 'p': []}
p0, q0, p1, q1 = mpz(1), mpz(0), mpz(a[0]), mpz(1)
for n in range(1, state['done'] + 1):
    p0, p1 = p1, a[n] * p1 + p0
    q0, q1 = q1, a[n] * q1 + q0
t0 = time.time()
for n in range(state['done'] + 1, N + 1):
    p0, p1 = p1, a[n] * p1 + p0
    q0, q1 = q1, a[n] * q1 + q0
    if isprp(q1):
        state['q'].append(n)
    if isprp(p1):
        state['p'].append(n)
    state['done'] = n
    if n % 250 == 0 or n == N:
        json.dump(state, open(fn, 'w'))
        print(n, 'q', state['q'], 'p', state['p'], round(time.time() - t0), 's', flush=True)
