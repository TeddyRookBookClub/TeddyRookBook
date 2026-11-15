"""Worked examples: the continued fraction of sqrt(N) up to the middle of its period."""
import math
def middle(N):
    a0 = math.isqrt(N); P, Q, a, i = 0, 1, a0, 0; terms = [a0]
    while True:
        Pn = a * Q - P
        if i >= 1 and Pn == P: return terms, 2 * i, ("even period: middle Q = %d, which divides 2N = %d" % (Q, 2 * N)) + ("" if Q in (1, 2) else "; factor %d" % math.gcd(Q, N))
        Qn = (N - Pn * Pn) // Q
        if Qn == Q: return terms, 2 * i + 1, "odd period: N = %d^2 + %d^2" % (Pn, Q)
        P, Q = Pn, Qn; a = (a0 + P) // Q; terms.append(a); i += 1
for N in (13, 23, 21, 51, 65, 1000003, 1000001):
    t, k, msg = middle(N); print(f"sqrt({N}): first terms {t[:8]}{'...' if len(t)>8 else ''}  period {k}  {msg}")
