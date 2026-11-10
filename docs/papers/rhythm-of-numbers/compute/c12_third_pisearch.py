"""Chapter 17 ("A third look"), part 1a: extend the search for probable-prime denominators q_n of pi's
convergents from n = 20,001 to n = 25,332.

Based on the search script pi_search.py by Teddy Rook (November 2026), who found the probable prime q_25332.
Terms: pi's continued fraction from mpmath at two precisions 400 digits apart; only the common prefix is kept
(certified terms).  Test: trial division by the primes below 2 * 10^6 (gcds with products of primes), then a strong
Fermat test to base 2, then gmpy2.is_strong_bpsw_prp (Baillie-PSW).  These are probable-prime tests, not proofs.
Resumable: progress is kept in out/third_search.json.
Usage: python3 c12_third_pisearch.py [START, default 20001] [N, default 25332]
Runtime: about an hour on one core (each strong test on a 13,000-digit number takes about 10 seconds).
Our run: no probable-prime q_n for 20,001 <= n <= 25,331, and q_25332 is one."""
import sys, os, json, time
import gmpy2
from gmpy2 import mpz
import mpmath
from common import OUT

START = int(sys.argv[1]) if len(sys.argv) > 1 else 20001
N = int(sys.argv[2]) if len(sys.argv) > 2 else 25332
fn = os.path.join(OUT, 'third_search.json')


def pi_terms(dps, n):
    """Terms of the exact binary rational that mpmath returns for pi at dps digits."""
    mpmath.mp.dps = dps
    x = +mpmath.pi
    num = mpz(int(x.man)) << max(0, x.exp); den = mpz(1) << max(0, -x.exp)
    out = []
    while den and len(out) < n + 80:
        a, r = gmpy2.f_divmod(num, den); out.append(int(a)); num, den = den, r
    return out


def certified_terms(n):
    dps = int(1.04 * n) + 2000
    A = pi_terms(dps, n); B = pi_terms(dps + 400, n)
    k = 0
    while k < min(len(A), len(B)) and A[k] == B[k]:
        k += 1
    assert k - 1 > n + 10, (k, n)
    assert A[:8] == [3, 7, 15, 1, 292, 1, 1, 1]
    return A[:k - 1]


if __name__ == '__main__':
    T = certified_terms(N)
    LIM = 2 * 10 ** 6
    sieve = bytearray([1]) * (LIM + 1); sieve[0] = sieve[1] = 0
    for i in range(2, int(LIM ** .5) + 1):
        if sieve[i]:
            sieve[i * i::i] = bytearray(len(sieve[i * i::i]))
    primes = [i for i in range(LIM + 1) if sieve[i]]
    chunks = []
    for i in range(0, len(primes), 2000):
        P = mpz(1)
        for p in primes[i:i + 2000]:
            P *= p
        chunks.append(P)

    def prp(x):
        if x <= LIM:
            return bool(sieve[int(x)])
        for P in chunks:
            if gmpy2.gcd(x, P) != 1:
                return False
        if not gmpy2.is_strong_prp(x, 2):
            return False
        return gmpy2.is_strong_bpsw_prp(x)

    state = json.load(open(fn)) if os.path.exists(fn) else {'start': START, 'done': START - 1, 'q': []}
    assert state['start'] == START
    p0, q0, p1, q1 = mpz(1), mpz(0), mpz(T[0]), mpz(1)
    for n in range(1, state['done'] + 1):
        q0, q1 = q1, T[n] * q1 + q0
    t0 = time.time()
    for n in range(state['done'] + 1, N + 1):
        q0, q1 = q1, T[n] * q1 + q0
        if prp(q1):
            state['q'].append(n)
            print('probable prime q_%d (%d digits)' % (n, q1.num_digits()), flush=True)
        state['done'] = n
        if n % 100 == 0 or n == N:
            json.dump(state, open(fn, 'w'))
            print(n, state['q'], round(time.time() - t0), 's', flush=True)
    print('done', state)
