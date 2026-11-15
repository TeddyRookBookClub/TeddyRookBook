#!/usr/bin/env python3
"""Recompute every number printed in Sections 7.4 and 7.5 and compare it with the text.

  python3 verify_sec74.py            everything (about four minutes; needs gcc)
  python3 verify_sec74.py --quick    skip the two long runs (10^8 ladder test, 2 x 10^7 middle test)

Each check prints PASS or FAIL. A number counts as checked only if a program here produced it AND the same
digits stand in the text (paper/ch07_tools.tex).
"""
import math, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
TEX = None
# In the paper the two sections are the end of Chapter 7 (paper/ch07_tools.tex); the draft's file name is tried too.
for cand in (os.path.join(HERE, "..", "..", "paper", "ch07_tools.tex"), os.path.join(HERE, "..", "sections-7-4-7-5.tex"), os.path.join(HERE, "sections-7-4-7-5.tex")):
    if TEX is None and os.path.exists(cand): TEX = open(cand).read()
assert TEX, "ch07_tools.tex (or sections-7-4-7-5.tex) not found"
# the paper's macros for references are written back to the draft's plain forms, so the same strings match both
for _a, _b in (("\\cref{prop:7middle}", "Proposition~\\ref{prop:7middle}"), ("\\eqref{eq:cfrac-congruence}", "(7.2)"), ("\\eqref{eq:cfrac}", "(7.1)")): TEX = TEX.replace(_a, _b)
FLAT = re.sub(r"\s+", " ", TEX.replace("{,}", ",").replace("\\,", ""))
FLATN = FLAT.replace(",", "")          # tables in the paper print 421,003 where the draft printed 421 003
QUICK = "--quick" in sys.argv
npass = nfail = 0
def check(name, ok):
    global npass, nfail
    npass += bool(ok); nfail += (not ok)
    print(("PASS  " if ok else "FAIL  ") + name, flush=True)
def in_tex(*strings):
    return all(s in FLAT or s in FLATN for s in strings)
def run(cmd):
    return subprocess.run(cmd, cwd=HERE, capture_output=True, text=True, check=True).stdout
def build(name, libs=()):
    subprocess.run(["gcc", "-O2", "-o", name, name + ".c", *libs], cwd=HERE, check=True)
def out_and_tex(out, in_out, *tex):
    return (in_out in out) and in_tex(*tex)

# ---------- 1. the middle of the period, every N up to 10^6 (Propositions 7.2, 7.3, Table 7.3) ----------
build("sqrtcf", ["-lm"]); o = run(["./sqrtcf", "1000000"])
check("Prop 7.2(i): 896,338 even periods, all with middle Q dividing 2N", out_and_tex(o, "even period: 896338 numbers; middle Q divides 2N in 896338", "896,338"))
check("Prop 7.2(ii): 102,662 odd periods, all two squares", out_and_tex(o, "odd period: 102662 numbers; N = P^2 + Q^2 at the middle in 102662", "102,662"))
check("Prop 7.3: all 78,497 odd primes carry the signature", "primes 1 mod 4: 39175; odd period: 39175" in o and "primes 3 mod 4: 39322; even period with middle Q = 2: 39322" in o and 39175 + 39322 == 78497 and in_tex("78,497", "78497"))
check("Prop 7.3(i): period mod 4 follows p mod 8 for p = 3 mod 4", "primes 3 mod 8: period mod 4 = 0,1,2,3 : 0 0 19653 0" in o and "primes 7 mod 8: period mod 4 = 0,1,2,3 : 19669 0 0 0" in o)
check("Table 7.3: 421,003 = 353,010 + 32,675 + 35,318", out_and_tex(o, "odd composite non-squares: 421003; middle shows a proper factor: 353010; odd period: 32675; middle Q = 2: 35318; other: 0", "421003", "353010", "32675", "35318"))
check("Table 7.3 shares 83.8, 7.8, 8.4 per cent", ["%.1f" % (100 * x / 421003) for x in (353010, 32675, 35318)] == ["83.8", "7.8", "8.4"] and in_tex("83.8\\%", "7.8\\%", "8.4\\%"))
check("67,993 impostors, one odd composite in six (16.15 per cent); first 27, 51, 65, 85, 119", out_and_tex(o, "full signature of a prime: 67993 (16.150%", "67,993") and "first ones: 27 51 65 85 119" in o and in_tex("$27$, $51$, $65$, $85$, $119$") and 5.5 < 421003 / 67993 < 6.5)
check("period averages 0.81 sqrt(p), reaches 2.68 sqrt(p) at p = 978,091", out_and_tex(o, "mean period / sqrt(p) = 0.8134; largest 2.6755 at p = 978091", "0.81\\sqrt p", "2.68\\sqrt p", "978,091"))

# ---------- 2. the three periods of Figure 7.2 and the worked examples ----------
def cf(N):
    a0 = math.isqrt(N); P, Q, a = 0, 1, a0; Ps, Qs, terms = [0], [1], [a0]; x0, x1, y0, y1 = 1, a0, 0, 1
    while True:
        P = a * Q - P; Q = (N - P * P) // Q; Ps.append(P); Qs.append(Q); a = (a0 + P) // Q; terms.append(a)
        if Q == 1: break
        x0, x1, y0, y1 = x1, a * x1 + x0, y1, a * y1 + y0
    return len(Qs) - 1, Ps, Qs, terms, x1, y1
k, Ps, Qs, t, T, U = cf(199); check("Figure 7.2: sqrt(199) has period 20 and middle Q = 2", k == 20 and Qs[10] == 2 and 199 % 8 == 7)
k, Ps, Qs, t, T, U = cf(193); check("Figure 7.2: sqrt(193) has period 13 and 193 = 12^2 + 7^2", k == 13 and (Ps[7], Qs[6], Qs[7]) == (12, 7, 7) and 193 % 8 == 1)
k, Ps, Qs, t, T, U = cf(217); check("sqrt(217): middle 7, and 217 = 7 x 31", k % 2 == 0 and Qs[k // 2] == 7 and 7 * 31 == 217 and in_tex("$\\sqrt{217}$ the middle is $7$"))
k, Ps, Qs, t, T, U = cf(13); check("p = 13: [3; 1,1,1,1,6], period 5, T = 18, 13 = 2^2 + 3^2, (T-a)/4 = 4", t == [3, 1, 1, 1, 1, 6] and k == 5 and T == 18 and (Ps[3], Qs[2]) == (2, 3) and (T - 2) // 4 == 4 and in_tex("$T=18$", "$(T-a)/4=4$"))
k, Ps, Qs, t, T, U = cf(61); check("p = 61: period 11, T = 29,718, 61 = 6^2 + 5^2, (T-a)/4 = 7428", k == 11 and T == 29718 and (Ps[6], Qs[5]) == (6, 5) and (T - 6) // 4 == 7428 and in_tex("$T=29,718$", "$(T-a)/4=7428$"))
check("sqrt(3) = [1; 1, 2] with Q_1 = 2", cf(3)[3] == [1, 1, 2] and cf(3)[2][1] == 2)

# ---------- 3. the square shortcut ----------
build("square", ["-lm"]); o = run(["./square"])
check("square shortcut: 1,996 of 2,000, median 1.24 N^(1/4); middle at a median 0.17 sqrt(N)", "factor found from a square: 1996 of 2000" in o and "median 1.24," in o and "median 0.171" in o and in_tex("$2,000$", "$1,996$", "$1.24N^{1/4}$", "$0.17\\sqrt N$"))

# ---------- 4. Theorems 7.4 and 7.5 ----------
sys.path.insert(0, HERE)
import exact
check("Theorem 7.4 (i)-(iv), the palindrome and Theorem 7.5, exact integers, 39,175 primes up to 10^6", exact.run(10**6) == 39175 and in_tex("$39,175$"))
o = run([sys.executable, "kw.py", "1000000", "200000"])
check("Kaplan-Williams (4.1) and our form agree on 35,917 non-squares N = 5 mod 8 (16,294 composite; 85, 125, 325 first)", "up to 1000000: 35917 cases (19623 prime, 16294 composite; first composites [85, 125, 325" in o and "hold in all of them" in o and in_tex("$35,917$", "$16,294$", "($85$, $125$, $325$"))
check("Kaplan-Williams Theorem 1: 7,699 cases N = 1 mod 8 up to 200,000, periods differ by 2 mod 4", "of them m = 1 mod 8: 7699, all with" in o and in_tex("$7,699$", "$200,000$"))
check("the two worked examples printed by Kaplan and Williams (N = 85, 325) give period 1 mod 4 by (4.1)", (9 * 2 * 378 + 85 - 5) // 4 % 4 == 1 and (1 * 18 * 18 + 325 - 5) // 4 % 4 == 1 and cf(85)[0] == 5 and cf(325)[0] == 1)
chi = lambda n: 1 if n % 8 in (1, 3) else -1
check("b + (N-5)/4 = chi(b) mod 4 for every residue of b mod 8 and a' mod 8", all((b + (4 * a * a + b * b - 5) // 4 - chi(b)) % 4 == 0 for b in range(1, 64, 2) for a in range(1, 64, 2) if (4 * a * a + b * b) % 8 == 5))
if not QUICK:
    build("mid", ["-lm"]); o = run(["./mid", "20000000"])
    check("635,170 primes = 1 mod 4 below 2 x 10^7: period 1 mod 4 for 318,210, 3 mod 4 for 316,960", out_and_tex(o, "up to 20000000: 635170; period = 1 mod 4 for 318210, = 3 mod 4 for 316960", "$635,170$", "$318,210$", "$316,960$"))
    check("Theorem 7.4 (ii), (iii) for all 635,170", "a even and b odd: 635170; U = 1 mod 4: 635170; T = s a/b (mod p): 635170" in o)
    check("Theorem 7.5 for all 317,693 primes = 5 mod 8", out_and_tex(o, "p = 5 mod 8: 317693 primes; rule s = (-1)^((T-a)/4) (-2/b) holds for 317693", "$317,693$"))
    check("p = 1 mod 8: relation without s for all 317,477", out_and_tex(o, "p = 1 mod 8: 317477 primes; (-1)^((T-a)/4) = (2/b) holds for 317477", "$317,477$"))
    check("p = 1 mod 8: every class modulo 8, 16, 32, 64 has both signs (8, 64, 512, 4,096 classes)", all(("modulo %d: %d classes occur, %d contain both signs" % (m, c, c)) in o for m, c in ((8, 8), (16, 64), (32, 512), (64, 4096))) and in_tex("$4,096$", "($8$, $64$ and $512$ classes)"))
o = run([sys.executable, "mod4b.py", "40000"])
check("Chowla's congruence and its continued-fraction form, 2,085 primes below 40,000; cube case only for p = 5 mod 8", "primes: 2085" in o and "(all p = 5 mod 8: True" in o and "Chowla's congruence ((p-1)/2)! = (-1)^((h+1)/2) t/2 holds for all: True" in o and "s = c * (-1)^((h+1)/2) * eta for all: True" in o and in_tex("$2,085$", "$40,000$"))

o = run([sys.executable, "barkan.py", "20000"])
check("Barkan (1975) formulas (6), (7) for all 1,125 primes = 1 mod 4 below 20,000; his Theorem 1 for the 569 that are 5 mod 8", "below 20000: 1125 (569 are 5 mod 8, 556 are 1 mod 8)" in o and "(6) holds for 1125, (7) for 1125; Theorem 1 holds for 569 of the 569" in o and in_tex("$1,125$", "$20,000$"))
# ---------- 5. the fast ladder (Section 7.5) ----------
def fibmod(k, n):
    a, b = 0, 1
    for bit in bin(k)[2:]:
        a, b = a * (2 * b - a) % n, (a * a + b * b) % n
        if bit == "1": a, b = b, (a + b) % n
    return a
check("323 = 17 x 19 and 377 = 13 x 29 pass the golden ladder", 17 * 19 == 323 and 13 * 29 == 377 and fibmod(324, 323) == 0 and fibmod(378, 377) == 0 and 323 % 5 == 3 and 377 % 5 == 2)
check("about 330 doublings for a hundred-digit number", round(100 * math.log2(10), -1) == 330 and in_tex("about $330$ doublings"))
if not QUICK:
    build("lucas"); o = run(["./lucas", "100000000"])
    check("Table 7.4: 5,761,453 primes pass both tests", out_and_tex(o, "primes: 5761453; primes failing either test: 0", "5761453"))
    check("Table 7.4: 1,460 and 1,854 composites, 134 pass both, none with n = +-2 mod 5", "golden-ladder test: 1460 " in o and "base-2 test: 1854 " in o and "composites passing both: 134;" in o and "composites passing both with n = +-2 mod 5: 0" in o and in_tex("& 1460", "& 1854", "& 134", "& 0\\\\"))
    check("first Fibonacci pseudoprimes 323, 377", "first: 323 377 1891" in o)
if not QUICK:
    build("psp2"); o = run(["./psp2", "100000000"])
    check("base-2 pseudoprimes up to 10^3..10^8: 3, 22, 78, 245, 750, 2057 (Table 1 of Pomerance-Selfridge-Wagstaff); 1,854 without multiples of 5", all(("up to %d: %d base-2" % (10 ** e, c)) in o for e, c in zip(range(3, 9), (3, 22, 78, 245, 750, 2057))) and "2057 base-2 pseudoprimes, 1854 of them" in o and in_tex("$2,057$"))
x = {1: 2}
for j in range(1, 8): x[2 ** j] = 2 * x[2 ** (j - 1)] ** 2 - 1
s = [4]
for j in range(7): s.append(s[-1] ** 2 - 2)
check("s_j = 2 x_(2^j); convergents 2/1, 7/4, 97/56", all(s[j] == 2 * x[2 ** j] for j in range(8)) and (x[1], x[2], x[4]) == (2, 7, 97))
def conv3(n):                                     # convergent number n of sqrt(3) = [1; 1, 2, 1, 2, ...]
    p0, p1, q0, q1 = 1, 1, 0, 1
    for i in range(1, n + 1):
        a = 1 if i % 2 else 2; p0, p1, q0, q1 = p1, a * p1 + p0, q1, a * q1 + q0
    return p1, q1
def pell(m):
    xx, yy = 1, 0
    for _ in range(m): xx, yy = 2 * xx + 3 * yy, xx + 2 * yy
    return xx, yy
check("x_m / y_m is convergent number 2m - 1 of sqrt(3), m = 1..40", all(conv3(2 * m - 1) == pell(m) for m in range(1, 41)) and (conv3(1), conv3(3), conv3(7)) == ((2, 1), (7, 4), (97, 56)))
check("p = 5: numerator of convergent 15 is 0 mod 31; p = 11: numerator of convergent 1023 is 868 mod 2047 = 23 x 89", conv3(15)[0] % 31 == 0 and conv3(1023)[0] % 2047 == 868 and 23 * 89 == 2047 and in_tex("868\\pmod{2047}"))
def ll(p):
    M = 2 ** p - 1; v = 4
    for _ in range(p - 2): v = (v * v - 2) % M
    return v == 0
odd_primes = [p for p in range(3, 130) if all(p % d for d in range(2, p))]
check("Lucas-Lehmer for odd primes below 130 returns 3, 5, 7, 13, 17, 19, 31, 61, 89, 107, 127", [p for p in odd_primes if ll(p)] == [3, 5, 7, 13, 17, 19, 31, 61, 89, 107, 127] and in_tex("p=3,5,7,13,17,19,31,61,89,107,127"))
check("Proposition 7.7 directly (numerator of convergent 2^(p-1) - 1) for odd primes up to 13", all((conv3(2 ** (p - 1) - 1)[0] % (2 ** p - 1) == 0) == ll(p) for p in (3, 5, 7, 11, 13)))

print("\n%d checks passed, %d failed%s" % (npass, nfail, " (quick mode: the two long runs were skipped)" if QUICK else ""))
sys.exit(1 if nfail else 0)
