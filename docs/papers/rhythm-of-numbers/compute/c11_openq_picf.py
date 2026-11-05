"""Open questions, part 1: many terms of pi's continued fraction, with a certificate.
pi is taken from mpmath (gmpy2 backend) as an interval [m-1, m+1]/2^b; a divide-and-conquer expansion keeps
only the terms shared by every real number in that interval, so every term returned is a term of pi provided
mpmath's pi is accurate to 1 ulp.  The expansion is done twice, at two precisions, and the shorter list must
be a prefix of the longer.  Checks: the record terms and positions listed in OEIS A033089/A033090 that fall
inside the range.  Output: out/picf.npy (int64 array: a_0 = 3, a_1 = 7, ...).
Usage: python3 c11_openq_picf.py [number of terms wanted, default 12,000,001].  About 3 minutes on one core."""
import sys, time
import numpy as np
import gmpy2
from gmpy2 import mpz
import mpmath as mp
from common import OUT
import os
from array import array

TERMS = array('q')  # terms are appended here in order by the base cases

BASE = 2048  # bits; below this, plain simultaneous Euclid


def base_case(ln, ld, un, ud):
    """Terms shared by L = ln/ld and U = un/ud (positive), and the matrix [[p, p1], [q, q1]] of the prefix."""
    t = []
    while ld and ud:
        a = ln // ld
        if a != un // ud:
            break
        t.append(a)
        ln, ld = ld, ln - a * ld
        un, ud = ud, un - a * ud
    p, p1, q, q1 = mpz(1), mpz(0), mpz(0), mpz(1)
    for a in t:
        p, p1 = a * p + p1, p
        q, q1 = a * q + q1, q
        TERMS.append(int(a))
    return len(t), (p, p1, q, q1)


def apply_inv(M, n, d):
    """x = (p y + p1)/(q y + q1)  =>  y = (p1 - q1 x)/(q x - p); for x = n/d return y as a positive fraction."""
    p, p1, q, q1 = M
    num = p1 * d - q1 * n
    den = q * n - p * d
    if den < 0:
        num, den = -num, -den
    return num, den


def mul(A, B):
    p, p1, q, q1 = A
    P, P1, Q, Q1 = B
    return (p * P + p1 * Q, p * P1 + p1 * Q1, q * P + q1 * Q, q * P1 + q1 * Q1)


def cf_interval(ln, ld, un, ud):
    """Terms shared by every real in [L, U] (endpoints in either order)."""
    bits = max(ln.bit_length(), ld.bit_length())
    if bits <= BASE:
        return base_case(ln, ld, un, ud)
    s = bits // 2
    # a wider interval from the top halves: [L', U'] contains [L, U]
    l_n, l_d, u_n, u_d = (ln, ld, un, ud) if ln * ud <= un * ld else (un, ud, ln, ld)
    w = cf_interval(l_n >> s, (l_d >> s) + 1, (u_n >> s) + 1, max(u_d >> s, mpz(1)))
    t1, M1 = w
    if not t1:
        return base_case(ln, ld, un, ud)
    del l_n, l_d, u_n, u_d
    xn, xd = apply_inv(M1, ln, ld)
    yn, yd = apply_inv(M1, un, ud)
    if xd == 0 or yd == 0:
        return t1, M1
    del ln, ld, un, ud
    t2, M2 = cf_interval(xn, xd, yn, yd)
    return t1 + t2, mul(M1, M2)


def pi_terms(bits):
    with mp.workprec(bits + 64):
        x = +mp.pi
        man, exp = x.man_exp
    man = mpz(man)
    sh = exp + bits  # m = floor(pi * 2^bits), within 1 of the true value since x has 64 guard bits
    m = man << sh if sh >= 0 else man >> (-sh)
    den = mpz(1) << bits
    del TERMS[:]
    lo, hi = m - 2, m + 2
    del x, man, m
    cf_interval(lo, den, hi, den)
    return np.array(TERMS, dtype=np.int64)


if __name__ == '__main__':
    sys.setrecursionlimit(10000)
    want = int(sys.argv[1]) if len(sys.argv) > 1 else 12_000_001
    # about 3.42 bits per term (2 * Levy / ln 2); take 3.6 for margin
    b1 = int(want * 3.6) + 1000
    T0 = time.time()
    tA = pi_terms(b1)
    T1 = time.time()
    tB = pi_terms(b1 + 4096)
    T2 = time.time()
    n = min(len(tA), len(tB))
    assert (tA[:n] == tB[:n]).all(), 'two precisions disagree'
    print('terms', len(tA), len(tB), 'times', round(T1 - T0, 1), round(T2 - T1, 1), flush=True)
    assert n >= want, (n, want)
    arr = tA[:want]
    del tB
    assert list(arr[:6]) == [3, 7, 15, 1, 292, 1]
    # the first 10,001 terms found by c1_cf.py with a different method (Gauss map at two precisions)
    import json
    old = json.load(open(os.path.join(OUT, 'terms.json')))['pi']
    assert [int(v) for v in arr[:len(old)]] == old and len(old) >= 10001
    # OEIS A033089/A033090 (records of pi's terms, positions in A001203 indexing a_0 = 3)
    recs = [(4, 292), (307, 436), (431, 20776), (28421, 78629), (156381, 179136), (267313, 528210),
            (453293, 12996958), (11504930, 878783625)]
    best = 0
    found = []
    for i in range(1, len(arr)):
        if arr[i] > best:
            best = int(arr[i]); found.append((i, best))
    found = [f for f in found if f[1] >= 292]
    exp_recs = [r for r in recs if r[0] < len(arr)]
    assert found == exp_recs, (found, exp_recs)
    np.save(os.path.join(OUT, 'picf.npy'), arr)
    print('saved', len(arr), 'terms; records', found, 'total', round(time.time() - T0, 1), 's')
