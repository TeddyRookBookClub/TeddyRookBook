"""Generalized (patterned) continued fractions for pi: Brouncker, Lange, and the arctangent fraction;
their errors after n levels, and their convergents compared with the Leibniz and Nilakantha series."""
from fractions import Fraction
import mpmath as mp
from common import *
mp.mp.dps = 60
PI = +mp.pi
def gcf(b0, terms):  # b0 + a1/(b1 + a2/(b2 + ...)), terms = [(a1,b1),...]
    v = mp.mpf(0)
    for a, b in reversed(terms):
        v = a / (b + v)
    return b0 + v
def brouncker(n):  # 4/pi = 1 + 1^2/(2 + 3^2/(2 + ...)), n levels
    return 4 / gcf(1, [((2 * k - 1) ** 2, 2) for k in range(1, n + 1)])
def lange(n):
    return gcf(3, [((2 * k - 1) ** 2, 6) for k in range(1, n + 1)])
def arctan_cf(n):  # pi = 4/(1 + 1^2/(3 + 2^2/(5 + ...)))
    return 4 / gcf(1, [(k * k, 2 * k + 1) for k in range(1, n + 1)])
for n, nm in ((10, 'Ten'), (100, 'Hundred'), (1000, 'Thousand')):
    macro('Brou' + nm, mp.nstr(abs(brouncker(n) - PI), 3))
    macro('Lange' + nm, mp.nstr(abs(lange(n) - PI), 3))
for n, nm in ((5, 'Five'), (10, 'Ten'), (20, 'Twenty')):
    macro('Atan' + nm, mp.nstr(abs(arctan_cf(n) - PI), 2))
ratio = abs(arctan_cf(31) - PI) / abs(arctan_cf(30) - PI)
macro('AtanRatio', mp.nstr(ratio, 4)); macro('SilverSq', mp.nstr((mp.sqrt(2) - 1) ** 2, 4))
# Brouncker's convergents equal the Leibniz partial sums; Lange's equal Nilakantha's (exact fractions)
def gcf_frac(b0, terms):
    v = Fraction(0)
    for a, b in reversed(terms): v = Fraction(a) / (b + v)
    return b0 + v
for n in range(1, 30):
    b = 4 / gcf_frac(1, [((2 * k - 1) ** 2, 2) for k in range(1, n + 1)])
    leib = 4 * sum(Fraction((-1) ** k, 2 * k + 1) for k in range(n + 1))
    assert b == leib, n
    l = gcf_frac(3, [((2 * k - 1) ** 2, 6) for k in range(1, n + 1)])
    nil = 3 + sum(Fraction(4 * (-1) ** (k + 1), (2 * k) * (2 * k + 1) * (2 * k + 2)) for k in range(1, n + 1))
    assert l == nil, n
write_macros('c6b_gcf.tex')
print('ok', ratio)
