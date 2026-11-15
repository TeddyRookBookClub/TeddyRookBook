"""Exact (big-integer) check of Theorem 7.4 for every prime p = 1 mod 4 up to LIMIT."""
import math, sys
from mod4 import primes_upto
def run(LIMIT):
    n = 0
    for p in primes_upto(LIMIT):
        if p % 4 != 1: continue
        a0 = math.isqrt(p); P, Q, a = 0, 1, a0; x0, x1, y0, y1 = 1, a0, 0, 1; i = 0; mid = None; Ps = [0]; Qs = [1]
        while True:
            Pn = a * Q - P; Qn = (p - Pn * Pn) // Q
            if mid is None and Qn == Q: mid = (i, Pn, Q, x0, y0)       # x0/y0 is convergent number i-1
            P, Q = Pn, Qn; i += 1; Ps.append(P); Qs.append(Q)
            if Q == 1: break
            a = (a0 + P) // Q; x0, x1 = x1, a * x1 + x0; y0, y1 = y1, a * y1 + y0
        k, T, U = i, x1, y1; m, aa, b, A, B = mid; s = (-1) ** m
        assert k == 2 * m + 1 and T * T - p * U * U == -1 and aa * aa + b * b == p
        assert all(Ps[k + 1 - j] == Ps[j] for j in range(1, k + 1)) and all(Qs[k - j] == Qs[j] for j in range(0, k + 1))   # the palindrome
        assert A * A + p * B * B == p * U - T * aa and 2 * A * B == T - U * aa                    # (i)
        assert A * A - p * B * B == s * b                                                       # (7.2)
        assert aa % 2 == 0 and b % 2 == 1 and U % 4 == 1                                        # (ii)
        assert (T - s * aa * pow(b, -1, p)) % p == 0                                            # (iii)
        v = (p * U - T * aa + b) // 2; r = math.isqrt(v); assert (r * r == v) == (s == 1)        # (iv)
        if p % 8 == 5: assert s == (-1) ** (((T - aa) // 4) % 2) * (1 if b % 8 in (1, 3) else -1)   # Theorem 7.5
        else: assert (-1) ** (((T - aa) // 4) % 2) == (1 if b % 8 in (1, 7) else -1)
        n += 1
    return n
if __name__ == "__main__":
    L = int(sys.argv[1]) if len(sys.argv) > 1 else 100000
    print("Theorem 7.4 (i)-(iv), the palindrome and Theorem 7.5 hold exactly for all", run(L), "primes = 1 mod 4 up to", L)
