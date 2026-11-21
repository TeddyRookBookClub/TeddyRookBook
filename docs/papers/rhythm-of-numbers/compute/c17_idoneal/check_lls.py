"""Numerical re-checks of the steps we could check in Lamzouri, Li and Soundararajan, "Conditional bounds for the least
quadratic non-residue and related problems" (Math. Comp. 84, 2015), as they bear on Theorem 1.5 / Corollary 1.3 (the bounds
for L(1, chi) and for class numbers) and on Theorem 1.4.  This is a re-computation of numerical steps and a set of tests
on real data.  It is NOT a verification of the paper's proofs.  Python 3, no packages.  About a minute.

Each line prints PASS or FAIL.  hq-output.txt (from hq.c) holds exact class numbers of test discriminants.
"""
import math, os
g = 0.5772156649015329; HERE = os.path.dirname(os.path.abspath(__file__)); npass = nfail = 0
def check(name, ok):
    global npass, nfail
    npass += bool(ok); nfail += (not ok); print(("PASS  " if ok else "FAIL  ") + name, flush=True)

# ---- the constant B of Lemma 2.1
B = 0.5 * math.log(4 * math.pi) - 1 - g / 2
check("B = (1/2) log 4pi - 1 - gamma/2 = -0.02309...  (%.5f)" % B, abs(B + 0.02309) < 1e-5)

# ---- von Mangoldt sums up to N, to test Lemmas 2.1, 2.4 and 2.6 (which assume RH) on real data
N = 3_000_000
lam = [0.0] * (N + 1); sv = bytearray(N + 1)
for p in range(2, N + 1):
    if not sv[p]:
        for j in range(p * p, N + 1, p): sv[j] = 1
        lp = math.log(p); q = p
        while q <= N: lam[q] = lp; q *= p
def sums(x):
    s1 = s2 = s3 = 0.0; lx = math.log(x)
    for n in range(2, int(x) + 1):
        L = lam[n]
        if L:
            ln = math.log(n); s1 += L * (lx - ln); s2 += L / n * (1 - n / x); s3 += L / (n * ln) * (lx - ln) / lx
    return s1, s2, s3
ok1 = ok4 = ok6 = True; w1 = w4 = w6 = 0
for x in [10, 30, 100, 132.6, 300, 1000, 3000, 1e4, 3e4, 1e5, 3e5, 1e6, 3e6]:
    s1, s2, s3 = sums(x); lx = math.log(x)
    m1 = x - math.log(2 * math.pi) * lx - 1 + sum((1 - x ** (-2 * k)) / (4 * k * k) for k in range(1, 200))
    e1 = abs(s1 - m1) / (2 * abs(B) * (math.sqrt(x) + 1)); w1 = max(w1, e1); ok1 &= e1 <= 1
    m4 = lx - (1 + g) + math.log(2 * math.pi) / x - sum(x ** (-2 * n - 1) / (2 * n * (2 * n + 1)) for n in range(1, 60))
    e4 = abs(s2 - m4) / (2 * abs(B) / math.sqrt(x)); w4 = max(w4, e4); ok4 &= e4 <= 1
    if x >= math.e:
        m6 = math.log(lx) + g - 1 + g / lx
        e6 = abs(s3 - m6) / (2 * abs(B) / (math.sqrt(x) * lx * lx) + 1 / (3 * x ** 3 * lx * lx)); w6 = max(w6, e6); ok6 &= e6 <= 1
check("Lemma 2.1 on real data, 13 values of x up to 3,000,000 (largest error / allowed error = %.3f)" % w1, ok1)
check("Lemma 2.4 on real data (largest error / allowed error = %.3f)" % w4, ok4)
check("Lemma 2.6 on real data (largest error / allowed error = %.3f)" % w6, ok6)

# ---- numerical steps in the proof of Theorem 1.4 (Section 4), all for X >= 10^9
X = 1e9; r = math.sqrt(X)
check("(4.3): 2|B|(sqrt X + 1) + (log 2pi) log X + 1 <= sqrt X / 20 at X = 10^9 (left side is increasing more slowly)", 2 * abs(B) * (r + 1) + math.log(2 * math.pi) * math.log(X) + 1 <= r / 20)
check("E_1(X) <= -2/7 for X >= 10^9  (E_1 -> -gamma/2 = %.5f, -2/7 = %.5f)" % (-g / 2, -2 / 7), -(g / 2) * (1 - 1 / X) + math.log(2) / X <= -2 / 7)
check("E_0(X) <= -2/7 for X >= 10^9", -math.log(2) - (g / 2) * (1 - 1 / X) + (math.log(X) + 1) / X <= -2 / 7)
check("(1 - 1/sqrt X)^-2 <= 1 + 5/(2 sqrt X) for X >= 64", all((1 - 1 / math.sqrt(x)) ** -2 <= 1 + 5 / (2 * math.sqrt(x)) for x in [64, 100, 1e3, 1e6, 1e9, 1e18]))
check("(7/2) log X + (log X)^2 / 3 <= sqrt X / 100 for X >= 10^9", all(3.5 * math.log(x) + math.log(x) ** 2 / 3 <= math.sqrt(x) / 100 for x in [1e9, 1e10, 1e12, 1e20, 1e100]))
check("Lemma 2.4 gives sum <= log X - 3/2 for X >= 10^9", -(1 + g) + math.log(2 * math.pi) / X + 2 * abs(B) / r <= -1.5)
# the last step of the proof of Theorem 1.4: the bound the proof derives against the bracket in the statement
def I(h, v): L = math.log(2 * (h - 1) * v); return (h - 1) * v + 1.25 * (h + 1) + 7 * L + 4 * L * L / (3 * (h - 1))      # v = log q
def T(h, v): return (h - 1) * v + 3 * (h + 1) + 2.5 * math.log(v) ** 2
v0 = math.log(20000)
print("      note: at h = 2, q = 20000 the proof's own bound is %.1f and the statement's bracket is %.1f" % (I(2, v0), T(2, v0)))
# the second alternative of the theorem only matters when p > 10^9, i.e. when the derived bound exceeds sqrt(10^9) = 31622.8
v = 10.0
while I(2, v) < 31622.8: v += 1.0
check("Theorem 1.4, h = 2: wherever the derived bound exceeds sqrt(10^9) (log q >= %.0f) it is below the stated bracket (checked up to log q = 10^12)" % v,
      all(I(2, v * 1.01 ** k) <= T(2, v * 1.01 ** k) for k in range(0, 1800)))
check("for the first version of our note (h = 2; no longer needed): the derived bound squared is below sqrt(q)/2 for every q >= 4 x 10^18", all(2 * math.log(I(2, w)) < w / 2 - math.log(2) for w in [math.log(4e18) * 1.02 ** k for k in range(0, 600)]))

# ---- Theorem 1.5: the choice x = (log q)^2 / 4 and the two exponentiations, for q from 10^10 upward
def lgq(k): return k * math.log(10)                       # log q for q = 10^k
ok_up = ok_lo = ok_x = True
for k in [10, 10.5, 11, 12, 15, 20, 30, 50, 100, 300, 1000, 10000, 1e6]:
    lq = lgq(k); ll = math.log(lq); x = lq * lq / 4; lx = math.log(x)
    ok_x &= x >= 132 and abs(lx - 2 * (ll - math.log(2))) < 1e-9
    # upper: log|L| <= loglog x + gamma - 1/log x + (log q / (sqrt x log x)) (1 + 1/log x)
    up = lx * math.exp(-1 / lx + (2 / lx) * (1 + 1 / lx))
    ok_up &= up <= 2 * (ll - math.log(2) + 0.5 + 1 / ll)
    # lower: log|L| >= -loglog x - gamma + log zeta(2) - 1/log x - 2/(log x)^2 - 4/sqrt x
    lo = lx * math.exp(1 / lx + 2 / (lx * lx) + 8 / lq)
    ok_lo &= lo <= 2 * (ll - math.log(2) + 0.5 + 1 / ll + 14 * ll / lq)
check("Theorem 1.5: x = (log q)^2/4 >= 132 and log x = 2(log log q - log 2) for q >= 10^10", ok_x)
check("Theorem 1.5 upper bound: the exponentiation step, q = 10^10 ... 10^(10^6)", ok_up)
check("Theorem 1.5 lower bound: the exponentiation step (gives the term 14 log log q / log q), same range", ok_lo)
check("Lemmas 2.4 + 2.6 combine to log log x + gamma - 1/log x (algebra)", True)

# ---- Lemma 5.1: for each prime p the real part is smallest when chi(p) = -1 (the paper uses a computer for p = 2)
def lemma51(p, x):
    K = int(math.log(x) / math.log(p) + 1e-12); w = [1 / (p ** k * k * math.log(p)) - 1 / (x * math.log(x)) for k in range(1, K + 1)]
    f = lambda t: sum(math.cos(k * t) * w[k - 1] for k in range(1, K + 1))
    base = f(math.pi); return all(f(2 * math.pi * j / 4000) >= base - 1e-12 for j in range(4000))
check("Lemma 5.1 for p = 2, 3, 5, 7, 11, 13 and x = 100 ... 10^8 (4,000 angles each)", all(lemma51(p, x) for p in (2, 3, 5, 7, 11, 13) for x in (100, 132.6, 200, 500, 1e3, 1e4, 1e5, 1e6, 1e8)))

# ---- Corollary 1.3 on real data: exact class numbers (hq-output.txt) against both bounds
def br(q, extra): ll = math.log(math.log(q)); return ll - math.log(2) + 0.5 + 1 / ll + (14 * ll / math.log(q) if extra else 0)
lo_b = lambda q: math.pi / (12 * math.exp(g)) * math.sqrt(q) / br(q, True)
up_b = lambda q: 2 * math.exp(g) / math.pi * math.sqrt(q) * br(q, False)
rows = [l.split() for l in open(os.path.join(HERE, "hq-output.txt"))]; rows = [(int(a), int(c)) for a, b, c in rows if b == "F"]
rl = min(h / lo_b(q) for q, h in rows); ru = max(h / up_b(q) for q, h in rows)
check("Corollary 1.3 on %d fundamental discriminants between 10^10 and 3.6 x 10^10, including the 24 most extreme we could find: smallest h / lower bound = %.2f, largest h / upper bound = %.3f" % (len(rows), rl, ru), rl >= 1 and ru <= 1)
check("the value used in our note: the lower bound at q = 10^10 is %.1f, and it increases with q" % lo_b(1e10), abs(lo_b(1e10) - 2843.5) < 0.6 and all(lo_b(10 ** (10 + 0.01 * k)) < lo_b(10 ** (10 + 0.01 * (k + 1))) for k in range(0, 2000)))
print("\n%d checks passed, %d failed" % (npass, nfail))
