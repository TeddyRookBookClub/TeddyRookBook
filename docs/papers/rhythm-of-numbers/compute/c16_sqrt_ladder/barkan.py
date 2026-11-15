"""Barkan (1975), C. R. Acad. Sci. Paris A 281, 825-828, checked numerically. l = period of (1 + sqrt p)/2.
  p = A^2 + 4B^2, A, B > 0;  A0 = +-A = 1 mod 4;  B0 = +-B with 2 B0 = -((p-1)/2)! A0 (mod p);  h = h(p).
  (6)  sgn(A0 B0) = (-1)^((h+l)/2)          (7)  l = sgn A0 + sgn B0 + h (mod 4)     [stated for p = 5 mod 8, said to hold for p = 1 mod 8 too]
  Theorem 1 (p = 5 mod 8):  l = A + B + h(-2p)/2 + h(p) + 1 (mod 4)."""
import math, sys
from mod4 import primes_upto, h_real
from kw import half_period
def h_imag(D):                       # class number of discriminant D < 0: count reduced forms
    n = 0; b = D % 2
    while 3 * b * b <= -D:
        q = (b * b - D) // 4; a = max(b, 1)
        while a * a <= q:
            if q % a == 0:
                c = q // a
                if math.gcd(math.gcd(a, b), c) == 1: n += 1 if (b == 0 or a == b or a == c) else 2
            a += 1
        b += 2
    return n
LIM = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
n = n5 = n1 = 0; ok6 = ok7 = okT = 0
for p in primes_upto(LIM):
    if p % 4 != 1: continue
    B = next(B for B in range(1, p) if math.isqrt(p - 4 * B * B) ** 2 == p - 4 * B * B); A = math.isqrt(p - 4 * B * B)
    A0 = A if A % 4 == 1 else -A
    f = 1
    for j in range(2, (p - 1) // 2 + 1): f = f * j % p
    B0 = B if (2 * B + f * A0) % p == 0 else -B; assert (2 * B0 + f * A0) % p == 0
    l = half_period(p); h = h_real(p); sg = lambda x: 1 if x > 0 else -1
    n += 1; ok6 += (sg(A0 * B0) == (-1) ** ((h + l) // 2)); ok7 += ((l - sg(A0) - sg(B0) - h) % 4 == 0)
    if p % 8 == 5:
        n5 += 1; hs = h_imag(-8 * p); assert hs % 2 == 0; okT += ((l - (A + B + hs // 2 + h + 1)) % 4 == 0)
    else: n1 += 1
print("primes = 1 mod 4 below %d: %d (%d are 5 mod 8, %d are 1 mod 8)" % (LIM, n, n5, n1))
print("Barkan (6) holds for %d, (7) for %d; Theorem 1 holds for %d of the %d primes = 5 mod 8" % (ok6, ok7, okT, n5))
