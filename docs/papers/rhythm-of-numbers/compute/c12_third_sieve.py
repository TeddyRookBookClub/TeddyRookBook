"""Chapter 17 ("A third look"), Section 17.6: the rhythm sieve, and the search of pi's convergents to n = 28,000.

Based on Teddy Rook's notes and search (November 2026), who found the probable primes q_25332 and q_27651.
The rhythm sieve runs the recurrence x_n = a_n x_{n-1} + x_{n-2} modulo every prime l < 10^7 at once (a numpy vector of
664,579 residues), so the small factors of every q_n (or p_n) are found without touching the huge numbers. Only the
survivors are tested: a strong Fermat test to base 2, then gmpy2.is_strong_bpsw_prp (Baillie-PSW). Probable-prime
tests, not proofs.  Terms: pi's continued fraction from mpmath at two precisions (certified common prefix).
Usage: python3 c12_third_sieve.py q|p START N   (resumable; progress in out/third_sieve_<q|p>_<START>.json)
Our runs: denominators 25,333..28,000 and 28,001..32,394, numerators 20,001..28,000 and 28,001..32,394 (Section 17.6).
Runtime: about 3 minutes for the sieve, then about 10 seconds per survivor at 13,000-14,000 digits."""
import sys, os, json, time
import numpy as np
import gmpy2
from gmpy2 import mpz
from common import OUT
from c12_third_pisearch import certified_terms

KIND = sys.argv[1]; START = int(sys.argv[2]); N = int(sys.argv[3])
assert KIND in ('q', 'p')
LIM = 10 ** 7
fn = os.path.join(OUT, 'third_sieve_%s_%d.json' % (KIND, START))


def primes_below(n):
    s = np.ones(n, dtype=bool); s[:2] = False
    for i in range(2, int(n ** .5) + 1):
        if s[i]:
            s[i * i::i] = False
    return np.nonzero(s)[0].astype(np.int64)


if __name__ == '__main__':
    T = certified_terms(N)
    P = primes_below(LIM)
    t0 = time.time()
    # residues of x_{n-1}, x_n modulo every prime; x_{-1}, x_0 = (0, 1) for q and (1, 3) for p
    x0 = np.zeros_like(P) if KIND == 'q' else np.ones_like(P)
    x1 = np.ones_like(P) if KIND == 'q' else np.full_like(P, 3)
    survivors = []; removed = 0
    for n in range(1, N + 1):
        a = T[n] % P
        x0, x1 = x1, (a * x1 + x0) % P
        if n >= START:
            if (x1 == 0).any():
                removed += 1
            else:
                survivors.append(n)
    sieve_time = time.time() - t0
    print('sieve', round(sieve_time), 's; candidates', N - START + 1, 'removed', removed, 'survivors', len(survivors),
          flush=True)
    state = json.load(open(fn)) if os.path.exists(fn) else {'kind': KIND, 'start': START, 'n': N, 'done': [],
                                                             'prp': [], 'removed': removed,
                                                             'survivors': survivors}
    assert state['survivors'] == survivors
    done = set(state['done'])
    # build the numbers once, in order
    p0, q0, p1, q1 = mpz(1), mpz(0), mpz(T[0]), mpz(1)
    si = set(survivors)
    t1 = time.time()
    for n in range(1, N + 1):
        p0, p1 = p1, T[n] * p1 + p0
        q0, q1 = q1, T[n] * q1 + q0
        if n in si and n not in done:
            x = q1 if KIND == 'q' else p1
            if gmpy2.is_strong_prp(x, 2) and gmpy2.is_strong_bpsw_prp(x):
                state['prp'].append(n)
                print('probable prime %s_%d (%d digits)' % (KIND, n, x.num_digits()), flush=True)
            state['done'].append(n)
            if len(state['done']) % 10 == 0:
                json.dump(state, open(fn, 'w'))
                print(len(state['done']), '/', len(survivors), round(time.time() - t1), 's', flush=True)
    state['sieve_seconds'] = round(sieve_time)
    json.dump(state, open(fn, 'w'))
    print('done', KIND, START, N, 'probable primes:', state['prp'])
