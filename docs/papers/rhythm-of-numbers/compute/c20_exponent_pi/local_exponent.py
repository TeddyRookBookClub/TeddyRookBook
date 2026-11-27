"""How well do pi's own fractions approximate it, measured by the exponent?

For a fraction p/q write |pi - p/q| = q^(-e).  The irrationality exponent of pi is the limsup of e over
all fractions; it is at least 2 for every irrational number, and a preprint of 24 September 2026 claims
that for pi it is exactly 2.  The best fractions are the convergents p_k/q_k, for which
    1/(q_k (q_k + q_{k+1})) < |pi - p_k/q_k| < 1/(q_k q_{k+1}),
so  1 + ln q_{k+1}/ln q_k  <  e_k  <  1 + ln(q_k + q_{k+1})/ln q_k.
This script uses the 12,000,001 terms in out/picf.npy (Chapter 15) and prints the upper bound's maximum
over all k >= N for several N, and the exact e_k for the first convergents (mpmath).
"""
import math, numpy as np, mpmath as mp
a = np.load('out/picf.npy').tolist(); n = len(a)
lq = [0.0] * n; r = 0.0; s = 0.0
for k in range(1, n):
    r = a[k] + (1.0 / r if k > 1 else 0.0); s += math.log(r); lq[k] = s          # ln q_k
lq = np.array(lq)
up = 1 + (lq[2:] + np.log1p(np.exp(lq[1:-1] - lq[2:]))) / lq[1:-1]                # upper bound for e_k, k = 1 .. n-2
suf = np.maximum.accumulate(up[::-1])[::-1]
mp.mp.dps = 80; p0, q0, p1, q1 = 1, 0, 3, 1
print('k  p_k/q_k  next term  exact exponent')
for k in range(1, 9):
    p0, q0, p1, q1 = p1, q1, a[k] * p1 + p0, a[k] * q1 + q0
    print(k, '%d/%d' % (p1, q1), a[k + 1], mp.nstr(-mp.log(abs(mp.pi - mp.mpf(p1) / q1)) / mp.log(q1), 6))
print('\nN   largest exponent among convergents k >= N (upper bound)   where   next term   digits of q_k')
for N in (1, 3, 5, 30, 100, 1000, 10**4, 10**5, 10**6, 10**7):
    j = N - 1 + int(np.argmax(up[N - 1:])); print(N, '%.7f' % suf[N - 1], j + 1, a[j + 2], int(lq[j + 1] / math.log(10)) + 1)
