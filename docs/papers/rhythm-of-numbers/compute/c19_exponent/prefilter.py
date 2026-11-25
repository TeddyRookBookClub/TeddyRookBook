# prefilter.py -- drop the sieve survivors in which the form of the least split prime has order above 5.
# Forms (a, b, c) of discriminant D = b^2 - 4ac < 0, composed by the usual Gauss/Dirichlet rule and reduced.
import sys
def xg(a, b):
    x0, x1, y0, y1 = 1, 0, 0, 1
    while b: q = a // b; a, b = b, a - q * b; x0, x1 = x1, x0 - q * x1; y0, y1 = y1, y0 - q * y1
    return a, x0, y0
def red(a, b, D):
    while True:
        b = ((b + a) % (2 * a)) - a
        if b == -a: b = a
        c = (b * b - D) // (4 * a)
        if a > c: a, b = c, -b; continue
        if a == c and b < 0: b = -b
        return a, b
def comp(f, g, D):
    a1, b1 = f; a2, b2 = g
    s = (b1 + b2) // 2
    d, u, v = xg(a1, a2); e, w, t = xg(d, s)          # e = gcd(a1, a2, s) = w*(u a1 + v a2) + t s
    u, v = u * w, v * w
    c2 = (b2 * b2 - D) // (4 * a2)
    a3 = a1 * a2 // (e * e)
    b3 = b2 + 2 * (a2 // e) * ((v * (b1 - b2) // 2 - t * c2) % (a1 // e))
    return red(a3, b3 % (2 * a3), D)
def primeform(D, p):
    if p == 2: b = 1 if D % 8 == 1 else (0 if D % 8 == 0 else 2)
    else:
        b = next(r for r in range(p) if (r * r - D) % p == 0)
        if (b - D) % 2: b = p - b if b else p
    return red(p, b, D)
out = open('pre.txt', 'w'); kept = total = 0
for line in open('/tmp/sv.txt'):
    n, l = map(int, line.split()); D = -n; total += 1
    one = (1, D % 2)
    if l == 999: out.write('%d\n' % n); kept += 1; continue
    f = primeform(D, l); g = f; k = 1
    while g != one and k <= 5: g = comp(g, f, D); k += 1
    if k <= 5: out.write('%d\n' % n); kept += 1
print(total, 'survivors of the sieve;', kept, 'in which the least split prime has order at most 5')
