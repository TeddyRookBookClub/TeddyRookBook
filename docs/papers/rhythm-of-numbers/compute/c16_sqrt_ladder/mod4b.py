import math, itertools, sys
from collections import Counter, defaultdict
from mod4 import primes_upto, cf_data, h_neg, h_real
def icbrt(n):
    x = int(round(n ** (1/3))) if n < 10**40 else 1 << ((n.bit_length() + 2) // 3)
    while True:
        y = (2 * x + n // (x * x)) // 3
        if y >= x: break
        x = y
    while x ** 3 > n: x -= 1
    while (x + 1) ** 3 <= n: x += 1
    return x
LIM = int(sys.argv[1]) if len(sys.argv) > 1 else 6000
rows = []
for p in primes_upto(LIM):
    if p % 4 != 1: continue
    k, (i, a, b), T, U = cf_data(p); s = (-1) ** i
    f = 1
    for j in range(2, (p - 1) // 2 + 1): f = f * j % p
    ab = a * pow(b, -1, p) % p
    eta = 1 if f == ab else -1; assert (f - eta * ab) % p == 0
    # is T + U sqrt(p) the cube of a unit (t + u sqrt p)/2 with t, u odd?
    t = icbrt(2 * T); cube = (t ** 3 + 3 * t == 2 * T and t % 2 == 1); c = -1 if cube else 1
    half_t = (t * pow(2, -1, p)) % p if cube else T % p            # t/2 mod p for the fundamental unit of the full ring
    h = h_real(p); hm = h_neg(p)
    chowla = (f - (-1) ** ((h + 1) // 2) * half_t) % p == 0
    rows.append(dict(p=p, s=s, a=a, b=b, eta=eta, c=c, h=h, hm=hm, chowla=chowla, T=T % p, ab=ab))
print("primes:", len(rows), "| cube cases:", sum(r["c"] == -1 for r in rows), "(all p = 5 mod 8:", all(r["p"] % 8 == 5 for r in rows if r["c"] == -1), ")")
print("T = s * a/b (mod p) for all:", all((r["T"] - r["s"] * r["ab"]) % r["p"] == 0 for r in rows))
print("Chowla's congruence ((p-1)/2)! = (-1)^((h+1)/2) t/2 holds for all:", all(r["chowla"] for r in rows))
print("s = c * (-1)^((h+1)/2) * eta for all:", all(r["s"] == r["c"] * (-1) ** ((r["h"] + 1) // 2) * r["eta"] for r in rows))
# is eta (the sign in ((p-1)/2)! = eta a/b) decided by congruence data and h(-4p)?
feats = {"p16": lambda r: r["p"] % 16, "p32": lambda r: r["p"] % 32, "b4": lambda r: r["b"] % 4, "b8": lambda r: r["b"] % 8, "a8": lambda r: r["a"] % 8, "a16": lambda r: r["a"] % 16,
         "hm8": lambda r: r["hm"] % 8, "hm16": lambda r: r["hm"] % 16, "c": lambda r: r["c"]}
for target in ("eta", "s"):
    print("target", target)
    for n in (1, 2, 3):
        for combo in itertools.combinations(feats, n):
            tab = defaultdict(Counter)
            for r in rows: tab[tuple(feats[x](r) for x in combo)][r[target]] += 1
            if all(min(v[1], v[-1]) == 0 for v in tab.values()):
                print("   decided by", combo, "with", len(tab), "classes")
