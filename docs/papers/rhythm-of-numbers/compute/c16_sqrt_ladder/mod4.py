"""Primes p = 1 mod 4: what decides whether the period of sqrt(p) is 1 or 3 mod 4?"""
import math, sys
from collections import Counter, defaultdict
def primes_upto(n):
    s = bytearray([1]) * (n + 1); s[0:2] = b"\0\0"
    for i in range(2, int(n ** .5) + 1):
        if s[i]: s[i * i::i] = bytearray(len(s[i * i::i]))
    return [i for i in range(n + 1) if s[i]]
def cf_data(p):
    """period k; middle a = P, b = Q with p = a^2 + b^2; T = numerator of the fundamental solution of x^2 - p y^2 = -1, mod p; U likewise"""
    a0 = math.isqrt(p); P, Q, a = 0, 1, a0; x0, x1 = 1, a0; y0, y1 = 0, 1; i = 0; mid = None
    while True:
        Pn = a * Q - P; Qn = (p - Pn * Pn) // Q
        if mid is None and Qn == Q: mid = (i, Pn, Q)
        P, Q = Pn, Qn; i += 1
        if Q == 1: return i, mid, x1, y1          # x1/y1 = convergent number i-1: x1^2 - p y1^2 = (-1)^i
        a = (a0 + P) // Q; x0, x1 = x1, a * x1 + x0; y0, y1 = y1, a * y1 + y0
def h_neg(p):                                   # class number of discriminant -4p: reduced forms a x^2 + 2b' ... (b even)
    D = 4 * p; h = 0; b = 0
    while 3 * b * b <= D:                        # forms (a, b, c), b^2 - 4ac = -D, |b| <= a <= c
        if (b * b + D) % 4 == 0:
            m = (b * b + D) // 4; a = max(b, 1)
            while a * a <= m:
                if m % a == 0:
                    c = m // a
                    if math.gcd(math.gcd(a, b), c) == 1: h += 1 if (b == 0 or a == b or a == c) else 2
                a += 1
        b += 1
    return h
def h_real(p):                                  # class number of discriminant p (p = 1 mod 4): cycles of reduced indefinite forms
    D = p; r = math.isqrt(D); forms = set()
    for b in range(1, r + 1):
        if (b - D) % 2: continue
        m = (D - b * b) // 4                     # a*c = -m
        for a in range(1, m + 1):
            if m % a: continue
            for A in (a, -a):
                C = -m // A
                if r - b < 2 * abs(A) <= r + b or (r - b < 2 * abs(A) and 2 * abs(A) < r + b + 1):
                    if abs(math.sqrt(D) - 2 * abs(A)) < b: forms.add((A, b, C))
    def rho(f):
        A, b, C = f; c2 = 2 * abs(C); bb = (-b) % c2
        while bb + c2 <= r: bb += c2                      # largest b' = -b mod 2|C| with b' <= floor(sqrt D)
        return (C, bb, (bb * bb - D) // (4 * C))
    seen = set(); cycles = 0
    for f in forms:
        if f in seen: continue
        cycles += 1; g = f
        while g not in seen: seen.add(g); g = rho(g)
    return cycles
if __name__ == "__main__":
    LIM = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    rows = []
    for p in primes_upto(LIM):
        if p % 4 != 1: continue
        k, (i, a, b), T, U = cf_data(p)
        assert k == 2 * i + 1 and a * a + b * b == p and T * T - p * U * U == -1
        s = (-1) ** i
        delta = 1 if (T - a * pow(b, -1, p)) % p == 0 else -1; assert (T - delta * a * pow(b, -1, p)) % p == 0
        f = 1
        for j in range(2, (p - 1) // 2 + 1): f = f * j % p
        eta = 1 if (f - a * pow(b, -1, p)) % p == 0 else -1
        rows.append(dict(p=p, k=k, s=s, a=a, b=b, delta=delta, eta=eta, hm=h_neg(p), hr=h_real(p) if p < 6000 else None, T=T % p, f=f))
    print("primes:", len(rows), " a even, b odd always:", all(r["a"] % 2 == 0 and r["b"] % 2 == 1 for r in rows))
    print("rule  (-1)^((k-1)/2) = -delta   [delta: T = delta * a/b mod p]  holds for all:", all(r["s"] == -r["delta"] for r in rows))
    for name, key in (("p mod 16", lambda r: r["p"] % 16), ("b mod 4", lambda r: r["b"] % 4), ("b mod 8", lambda r: r["b"] % 8), ("a mod 8", lambda r: r["a"] % 8),
                      ("(p mod 16, b mod 4)", lambda r: (r["p"] % 16, r["b"] % 4)), ("(p mod 16, b mod 8)", lambda r: (r["p"] % 16, r["b"] % 8)),
                      ("h(-4p) mod 8", lambda r: r["hm"] % 8), ("(p mod 8, h(-4p) mod 8)", lambda r: (r["p"] % 8, r["hm"] % 8)),
                      ("(p mod 8, h(-4p) mod 8, b mod 4)", lambda r: (r["p"] % 8, r["hm"] % 8, r["b"] % 4)),
                      ("(p mod 16, h(-4p) mod 8, b mod 4)", lambda r: (r["p"] % 16, r["hm"] % 8, r["b"] % 4)),
                      ("eta", lambda r: r["eta"]), ("(eta, h(p) mod 4)", lambda r: (r["eta"], (r["hr"] % 4) if r["hr"] else None))):
        tab = defaultdict(Counter)
        for r in rows:
            kk = key(r)
            if isinstance(kk, tuple) and None in kk: continue
            tab[kk][r["s"]] += 1
        det = all(min(c[1], c[-1]) == 0 for c in tab.values())
        print(f"{name:36s} decides: {det}   ", {kk: (c[1], c[-1]) for kk, c in sorted(tab.items())} if len(tab) <= 16 else "")
    print("real class numbers seen (p < 6000):", Counter(r["hr"] for r in rows if r["hr"]))
