"""Kaplan & Williams (1986), checked numerically, for non-square m (prime or not) with odd period of sqrt(m).
  Theorem 2 (4.1):  m = 5 mod 8:  period of sqrt(m) = (a b T + m - 5)/4 (mod 4),  m = a^2 + b^2 from the middle, T^2 - m U^2 = -1 least.
  Our form:         m = 5 mod 8:  (-1)^((k-1)/2) = (-1)^((T-a)/4) chi(b),  a even, b odd.
  Theorem 1:        m = 1 mod 4:  X^2 - m Y^2 = -4 has a solution in odd X, Y  <=>  period of sqrt(m) = period of (1+sqrt(m))/2 (mod 4).
"""
import math, sys
def icbrt(n):
    x = 1 << ((n.bit_length() + 2) // 3)
    while True:
        y = (2 * x + n // (x * x)) // 3
        if y >= x: break
        x = y
    return x
def sqrt_data(m):
    a0 = math.isqrt(m); P, Q, a = 0, 1, a0; x0, x1, y0, y1 = 1, a0, 0, 1; i = 0; mid = None
    while True:
        Pn = a * Q - P; Qn = (m - Pn * Pn) // Q
        if mid is None and Qn == Q: mid = (i, Pn, Q)
        P, Q = Pn, Qn; i += 1
        if Q == 1: break
        a = (a0 + P) // Q; x0, x1 = x1, a * x1 + x0; y0, y1 = y1, a * y1 + y0
    return i, mid, x1, y1                                   # period, (m index, a, b), T, U
def half_period(m):                                         # period of (1 + sqrt m)/2, m = 1 mod 4
    r = math.isqrt(m); P, Q = 1, 2; seen = None; i = 0
    while True:
        a = (P + r) // Q; P = a * Q - P; Q = (m - P * P) // Q; i += 1
        if seen is None: seen = (P, Q); start = i
        elif (P, Q) == seen: return i - start
def run(LIMIT, LIMIT1):
    n5 = n5prime = n5comp = 0; first_comp = []
    for m in range(5, LIMIT + 1, 8):
        if math.isqrt(m) ** 2 == m: continue
        k, mid, T, U = sqrt_data(m)
        if k % 2 == 0: continue
        j, a, b = mid; assert k == 2 * j + 1 and a * a + b * b == m and T * T - m * U * U == -1 and a % 4 == 2 and b % 2 == 1 and T % 4 == 2
        s = 1 if k % 4 == 1 else -1
        assert (a * b * T + m - 5) % 4 == 0 and ((a * b * T + m - 5) // 4 - k) % 4 == 0, m                       # Kaplan-Williams (4.1)
        assert s == (-1) ** (((T - a) // 4) % 2) * (1 if b % 8 in (1, 3) else -1), m                             # our form
        n5 += 1
        if all(m % d for d in range(3, math.isqrt(m) + 1, 2)): n5prime += 1
        else:
            n5comp += 1
            if len(first_comp) < 6: first_comp.append(m)
    print("m = 5 mod 8, non-square, odd period, up to %d: %d cases (%d prime, %d composite; first composites %s)" % (LIMIT, n5, n5prime, n5comp, first_comp))
    print("   Kaplan-Williams (4.1) and the form of Theorem 7.5 hold in all of them")
    n1 = same = solv = 0; n18 = 0
    for m in range(5, LIMIT1 + 1, 4):
        if math.isqrt(m) ** 2 == m: continue
        k, mid, T, U = sqrt_data(m)
        if k % 2 == 0: continue
        kh = half_period(m); t = icbrt(2 * T); cube = (t % 2 == 1 and t ** 3 + 3 * t == 2 * T and (t * t + 4) % m == 0 and math.isqrt((t * t + 4) // m) ** 2 == (t * t + 4) // m)                    # T + U sqrt m = ((t + u sqrt m)/2)^3, t odd
        assert kh % 2 == 1 and cube == ((k - kh) % 4 == 0), m                                                    # Kaplan-Williams Theorem 1
        n1 += 1; solv += cube; same += ((k - kh) % 4 == 0)
        if m % 8 == 1: n18 += 1; assert (k - kh) % 4 == 2
    print("m = 1 mod 4, non-square, odd period, up to %d: %d cases; X^2 - mY^2 = -4 solvable in odd numbers in %d, and exactly in those the two periods agree mod 4" % (LIMIT1, n1, solv))
    print("   of them m = 1 mod 8: %d, all with period(sqrt m) = period((1+sqrt m)/2) + 2 (mod 4)" % n18)
if __name__ == "__main__":
    run(int(sys.argv[1]) if len(sys.argv) > 1 else 100000, int(sys.argv[2]) if len(sys.argv) > 2 else 100000)
