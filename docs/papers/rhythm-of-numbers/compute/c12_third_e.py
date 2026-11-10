"""Chapter 17 ("A third look"), part 2: the convergents of e, completed.

Based on Teddy Rook's script e_checks.py (November 2026).  Convergents p_n/q_n of e = [2; 1, 2, 1, 1, 4, 1, ...],
our indexing: p_0/q_0 = 2/1, q_0 = q_1 = 1.  Checks, in exact integer arithmetic:
  1. the closed forms (Chapter 17, eq. th-closed) for p_{3n-2}, p_{3n-1}, p_{3n} and q_{3n-2}, q_{3n-1}, q_{3n}, n < 200;
  2. the forced divisors of Theorem 17.9, m | q_{3m-1}, q_{3m-3}, q_{3m-7} (m >= 3), p_{3m-4} (m >= 2), for m < 1000;
  3. for every odd prime l < 3000: the sign flip of Proposition 17.8, q_{n+3l} = -q_n and p_{n+3l} = p_n (mod l), the exact periods 6l
     and 3l (no smaller period), the three forced zeros among q_0..q_{3l-1}, and the number of further zeros;
  4. the case l = 2 directly (both periods are 6), and the average of l f_l.
Writes gen/c12_third_e.tex.  Runtime: a few seconds."""
from math import comb, factorial
from sympy import primerange, divisors
from common import *

LIM = 3000


def e_terms(n):
    out = [2]; k = 1
    while len(out) < n + 1:
        out += [1, 2 * k, 1]; k += 1
    return out[:n + 1]


NN = 3100
a = e_terms(NN); p = [2, 3]; q = [1, 1]
for n in range(2, NN + 1):
    p.append(a[n] * p[-1] + p[-2]); q.append(a[n] * q[-1] + q[-2])
assert q[:8] == [1, 1, 3, 4, 7, 32, 39, 71] and p[:8] == [2, 3, 8, 11, 19, 87, 106, 193]

# 1. closed forms (n >= 1)
f = factorial
for n in range(1, 200):
    assert p[3*n-2] == sum(comb(n, j) * f(n+j) // f(n) for j in range(n+1))
    assert p[3*n-1] == sum(comb(n, j) * f(n+1+j) // f(n) for j in range(n+1))
    assert p[3*n] == sum(comb(n+1, j) * f(n+j) // f(n) for j in range(n+2))
    assert q[3*n-2] == sum((-1)**(n+j) * comb(n, j) * f(n+j) // f(n) for j in range(n+1))
    assert q[3*n-1] == sum((-1)**(n+1+j) * comb(n+1, j) * f(n+j) // f(n) for j in range(n+2))
    assert q[3*n] == sum((-1)**(n+j) * comb(n, j) * f(n+1+j) // f(n) for j in range(n+1))
macro('ThEclosed', 200)

# 2. forced divisors
for m in range(1, 1000):
    assert q[3*m-1] % m == 0 and q[3*m-3] % m == 0
    if m >= 3:
        assert q[3*m-7] % m == 0
    if m >= 2:
        assert p[3*m-4] % m == 0
macro('ThEdiv', commas(1000))


def residues(l, M):
    aa = e_terms(M); qq = [1, 1]; pp = [2 % l, 3 % l]
    for n in range(2, M + 1):
        qq.append((aa[n]*qq[-1] + qq[-2]) % l); pp.append((aa[n]*pp[-1] + pp[-2]) % l)
    return qq, pp


def least_period(s, T):
    """Least period of the sequence s (known to have period T, len(s) >= 2T)."""
    for d in divisors(T):
        if all(s[i] == s[i + d] for i in range(len(s) - d)):
            return d


# 3. odd primes
extra = []; shares = {}
for l in primerange(3, LIM):
    M = 12 * l + 10
    qq, pp = residues(l, M)
    assert all((qq[n+3*l] + qq[n]) % l == 0 and (pp[n+3*l] - pp[n]) % l == 0 for n in range(M - 3*l))
    assert least_period(qq, 6*l) == 6*l and least_period(pp, 3*l) == 3*l
    z = [n for n in range(3*l) if qq[n] == 0]
    assert {3*l-1, 3*l-3, (3*l-7) % (3*l)} <= set(z)
    extra.append(len(z) - 3)
    shares[l] = len(z) / (3 * l)
# 4. l = 2: both periods are 6; l = 3 is covered above (periods 18 and 9)
qq, pp = residues(2, 100)
assert least_period(qq, 6) == 6 and least_period(pp, 6) == 6
macro('ThEextra', '%.3f' % (sum(extra) / len(extra)))
macro('ThEnprimes', len(extra))
macro('ThEmaxextra', max(extra))
macro('ThEzeroextra', sum(1 for x in extra if x == 0))
avg = sum(l * shares[l] for l in shares) / len(shares)
macro('ThEavg', '%.3f' % avg)
macro('ThElim', commas(LIM))
write_macros('c12_third_e.tex')
print('mean further zeros', sum(extra) / len(extra), 'max', max(extra), 'none', sum(1 for x in extra if x == 0),
      'avg l f_l', avg)
