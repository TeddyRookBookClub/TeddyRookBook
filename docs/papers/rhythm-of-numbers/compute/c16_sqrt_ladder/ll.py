"""The Lucas-Lehmer test read on the ladder of sqrt(3).
sqrt(3) = [1; 1, 2, 1, 2, ...].  Its convergents number 1, 3, 5, ... (counting from 0) are 2/1, 7/4, 26/15, 97/56, ...,
the solutions of x^2 - 3y^2 = 1, and x_m + y_m sqrt(3) = (2 + sqrt(3))^m.
Lucas-Lehmer: s_0 = 4, s_{k+1} = s_k^2 - 2; M_p = 2^p - 1 is prime exactly when s_{p-2} = 0 (mod M_p).
Claim checked here: s_k = 2 x_{2^k}.  So M_p is prime exactly when it divides the numerator of convergent number 2^(p-1) - 1."""
from fractions import Fraction
def convergents_sqrt3(count):
    terms = [1] + [1 if i % 2 == 0 else 2 for i in range(count)]
    p0, q0, p1, q1 = 1, 0, terms[0], 1; out = [(p1, q1)]
    for a in terms[1:]:
        p0, q0, p1, q1 = p1, q1, a * p1 + p0, a * q1 + q0; out.append((p1, q1))
    return out
C = convergents_sqrt3(140)
pell = [C[i] for i in range(1, len(C), 2)]                       # convergents number 1, 3, 5, ...
assert all(x * x - 3 * y * y == 1 for x, y in pell)
s = 4; ok = True
for k in range(0, 7):
    x = pell[2 ** k - 1][0]                                      # x_m with m = 2^k is convergent number 2m - 1
    ok &= (s == 2 * x); s = s * s - 2
print("s_k = 2 x_(2^k) for k = 0..6:", ok, "| first Pell convergents:", pell[:5])
def is_prime(n):
    if n < 2: return False
    i = 2
    while i * i <= n:
        if n % i == 0: return False
        i += 1
    return True
found = []
for p in range(3, 130, 2):
    if not is_prime(p): continue
    M = 2 ** p - 1; s = 4
    for _ in range(p - 2): s = (s * s - 2) % M
    if s == 0: found.append(p)
print("odd primes p < 130 with s_(p-2) = 0 mod 2^p - 1:", found)
# the same, literally on the ladder, for small p: numerator of convergent number 2^(p-1) - 1 modulo M_p
for p in (3, 5, 7, 11, 13):
    M = 2 ** p - 1; idx = 2 ** (p - 1) - 1
    p0, q0, p1, q1 = 1, 0, 1, 1
    for i in range(1, idx + 1):
        a = 1 if i % 2 == 1 else 2
        p0, q0, p1, q1 = p1 % M, q1 % M, (a * p1 + p0) % M, (a * q1 + q0) % M
    print(f"  p = {p}: M = {M}; numerator of convergent number {idx} of sqrt(3) is {p1} mod M  ->", "prime" if p1 == 0 else "composite", "(M = 23 x 89)" if p == 11 else "")
