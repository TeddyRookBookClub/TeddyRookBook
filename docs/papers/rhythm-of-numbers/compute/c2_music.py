"""Chapter 4 (music): equal divisions of the octave from log2(3/2), the Pythagorean comma, Euclidean
rhythms (Bjorklund) and their relation to Christoffel words, the circle map, Arnold tongues and the
devil's staircase, and the Farey count 3N^2/pi^2."""
import math
from fractions import Fraction
import numpy as np
import mpmath as mp
from common import *

plt = style()
mp.mp.dps = 50
L5 = mp.log(1.5, 2)
t5 = cf_terms(L5, 12)
P, Q = convergents(t5)
assert t5[:6] == [0, 1, 1, 2, 2, 3]
conv5 = list(zip(P, Q))[2:8]
macro('FifthConvs', ', '.join('%d/%d' % pq for pq in conv5))
macro('FifthValue', mp.nstr(L5, 6))
cents = lambda x: 1200 * x
e12 = cents(mp.mpf(7) / 12 - L5)
macro('TwelveFlat', '%.3f' % abs(float(e12)))
comma = 1200 * mp.log(mp.mpf(3) ** 12 / 2 ** 19, 2)
macro('CommaCents', '%.2f' % float(comma))
assert abs(float(12 * e12) + float(comma)) < 1e-9  # 12 tempered fifths = 12 pure fifths minus the comma
macro('CommaRatio', '531441/524288')
# 31-EDO major third vs 5/4
t31 = min(abs(1200 * (mp.mpf(k) / 31 - mp.log(1.25, 2))) for k in range(32))
macro('ThirtyOneThird', '%.2f' % float(t31))
t12 = abs(1200 * (mp.mpf(4) / 12 - mp.log(1.25, 2)))
macro('TwelveThird', '%.2f' % float(t12))
# fifth error per EDO
ns = np.arange(1, 73)
err = np.array([float(min(abs(1200 * (mp.mpf(k) / n - L5)) for k in range(n + 1))) for n in ns])
best_so_far = []
b = 1e9
for n, e in zip(ns, err):
    if e < b:
        b = e; best_so_far.append(int(n))
macro('BestEDOs', ', '.join(map(str, best_so_far)))
e53 = err[52]; e41 = err[40]
macro('FiftyThreeErr', '%.3f' % e53); macro('FortyOneErr', '%.3f' % e41)

fig, ax = plt.subplots(figsize=(5.6, 2.4))
ax.vlines(ns, 0, err, color=LGREY, lw=1.2)
for n in ns:
    if n in (5, 7, 12, 17, 29, 31, 41, 53):
        ax.vlines(n, 0, err[n - 1], color=GREEN, lw=1.8)
        ax.annotate(str(n), (n, err[n - 1]), xytext=(0, 3), textcoords='offset points', ha='center', fontsize=7, color=GREEN)
for (p, q) in conv5:
    if q <= 72:
        ax.plot(q, err[q - 1], 'o', ms=4, mfc=GOLD, mec=DGREY, mew=0.4, zorder=3)
ax.set_xlabel('notes per octave, $n$'); ax.set_ylabel('error of best fifth (cents)')
ax.set_xlim(0, 73); ax.set_ylim(0, 60)
savefig(fig, 'edo_fifths')

# ---------- Euclidean rhythms ----------
def bjork(k, n):
    a = [[1] for _ in range(k)]; b = [[0] for _ in range(n - k)]
    while len(b) > 1:
        m = min(len(a), len(b))
        na = [a[i] + b[i] for i in range(m)]
        rem = a[m:] if len(a) > m else b[m:]
        a, b = na, rem
    return [x for g in a + b for x in g]

def christoffel(k, n):
    """Lower Christoffel-type pattern: onset at i when floor((i+1)k/n) > floor(ik/n), i=0..n-1."""
    return [1 if ((i + 1) * k) // n > (i * k) // n else 0 for i in range(n)]

def is_rotation(a, b):
    s = ''.join(map(str, a)); t = ''.join(map(str, b))
    return len(s) == len(t) and t in s + s

def gaps(r):
    on = [i for i, x in enumerate(r) if x]
    return [(on[(j + 1) % len(on)] - on[j]) % len(r) or len(r) for j in range(len(on))]

rot_ok = 0
for n in range(2, 41):
    for k in range(1, n):
        if is_rotation(bjork(k, n), christoffel(k, n)):
            rot_ok += 1
        else:
            raise SystemExit('Bjorklund not a rotation of the Christoffel pattern at %d,%d' % (k, n))
macro('BjorkPairs', commas(rot_ok))
presets = [('tresillo', 3, 8), ('cinquillo', 5, 8), ('West African bell', 7, 12), ('ruchenitza', 3, 7),
           ('khafif-e-ramal', 2, 5), ('Venda clapping', 5, 12), ('samba', 7, 16), ('pi, level 3', 16, 113)]
ptab = []
for name, k, n in presets[:-1]:
    r = bjork(k, n)
    ptab.append('%s & $E(%d,%d)$ & \\texttt{%s} & %s' % (name, k, n, ''.join('x' if x else '.' for x in r),
                                                          ', '.join(map(str, gaps(r)))))
macro('EuclidTable', '\\\\\n'.join(ptab) + '\\\\')
# son clave is not Euclidean: gaps 3,3,4,2,4 is not a rotation of E(5,16)
clave = [0] * 16
for i in (0, 3, 6, 10, 12): clave[i] = 1
assert not is_rotation(clave, bjork(5, 16))
# Euclid's quotients for (355,113) are pi's terms
a, b, qs = 355, 113, []
while b: qs.append(a // b); a, b = b, a % b
assert qs == [3, 7, 16]
# E(16,113) equals the level-3 block of pi's rhythm, up to rotation
lv = rhythm_word([7, 15, 1])
assert is_rotation([1 if c == 'x' else 0 for c in lv[3]], bjork(16, 113))

fig, axs = plt.subplots(1, 5, figsize=(6.3, 1.6))
for ax, (name, k, n) in zip(axs, [('tresillo', 3, 8), ('cinquillo', 5, 8), ('West African bell', 7, 12),
                                   ('ruchenitza', 3, 7), ('pi: 1 in 7', 1, 7)]):
    r = bjork(k, n)
    th = np.pi / 2 - 2 * np.pi * np.arange(n) / n
    ax.plot(np.cos(np.linspace(0, 2 * np.pi, 200)), np.sin(np.linspace(0, 2 * np.pi, 200)), color=LGREY, lw=0.7)
    on = [i for i in range(n) if r[i]]
    ax.fill(np.cos(th[on]), np.sin(th[on]), color=MINT, alpha=0.35, lw=0) if len(on) > 2 else None
    ax.plot(np.r_[np.cos(th[on]), np.cos(th[on[0]])], np.r_[np.sin(th[on]), np.sin(th[on[0]])], color=GREEN, lw=0.9)
    for i in range(n):
        ax.plot(np.cos(th[i]), np.sin(th[i]), 'o', ms=5 if r[i] else 3.2,
                mfc=GREEN if r[i] else 'white', mec=GREEN if r[i] else GREY, mew=0.6)
    ax.set_title('%s\n$E(%d,%d)$' % (name, k, n), fontsize=7.5)
    ax.set_aspect('equal'); ax.axis('off'); ax.set_xlim(-1.2, 1.2); ax.set_ylim(-1.2, 1.2)
savefig(fig, 'euclid_necklaces')

# ---------- circle map ----------
def rotnum(Om, K, it=600, burn=200):
    th = np.zeros_like(Om); k = K / (2 * np.pi)
    for _ in range(burn): th = th + Om - k * np.sin(2 * np.pi * th)
    s = th.copy()
    for _ in range(it): th = th + Om - k * np.sin(2 * np.pi * th)
    return (th - s) / it

# Arnold tongues raster: for each (Omega, K) mark if rotation number is within 1e-4 of p/q with q <= 8
Om = np.linspace(0, 1, 900); Ks = np.linspace(0, 1, 320)
img = np.full((len(Ks), len(Om)), np.nan)
fr = sorted({Fraction(p, q) for q in range(1, 9) for p in range(0, q + 1)})
for i, K in enumerate(Ks):
    w = rotnum(Om, K, it=400, burn=150)
    for f in fr:
        mask = np.abs(w - float(f)) < 2e-4
        img[i, mask] = np.where(np.isnan(img[i, mask]), f.denominator, np.minimum(img[i, mask], f.denominator))
fig, ax = plt.subplots(figsize=(5.6, 2.6))
from matplotlib.colors import LinearSegmentedColormap
cm = LinearSegmentedColormap.from_list('g', [GREEN, MINT, '#e8e8e8'])
ax.imshow(img, origin='lower', extent=[0, 1, 0, 1], aspect='auto', cmap=cm, vmin=1, vmax=8, interpolation='nearest')
for f in [Fraction(0, 1), Fraction(1, 2), Fraction(1, 3), Fraction(2, 3), Fraction(1, 4), Fraction(3, 4), Fraction(2, 5), Fraction(3, 5), Fraction(1, 5), Fraction(4, 5)]:
    ax.text(float(f), 1.02, '%d/%d' % (f.numerator, f.denominator), ha='center', fontsize=6.5, transform=ax.transData)
ax.axvline(float(mp.pi - 3), color=GOLD, lw=0.9, ls='--')
ax.set_xlabel(r'natural rotation $\Omega$'); ax.set_ylabel('coupling $K$')
savefig(fig, 'arnold_tongues', raster=True)

# staircase at K=1 and widths of plateaus
OmF = np.linspace(0, 1, 40001)
W = rotnum(OmF, 1.0, it=2520, burn=400)
fig, axs = plt.subplots(1, 2, figsize=(6.0, 2.5), gridspec_kw={'width_ratios': [1.3, 1]})
axs[0].plot(OmF, W, color=GREEN, lw=0.8)
axs[0].set_xlabel(r'$\Omega$'); axs[0].set_ylabel(r'rotation number $W$')
axs[0].axvline(float(mp.pi - 3), color=GOLD, lw=0.8, ls='--')
z = (OmF > 0.33) & (OmF < 0.42)
O2 = np.linspace(0.33, 0.42, 30001); W2 = rotnum(O2, 1.0, it=2520 * 4, burn=400)
axs[1].plot(O2, W2, color=GREEN, lw=0.8)
for f in (Fraction(1, 3), Fraction(3, 8), Fraction(2, 5), Fraction(5, 13), Fraction(3, 7), Fraction(4, 11), Fraction(5, 12)):
    sel = np.abs(W2 - float(f)) < 1e-4
    if sel.any():
        x0 = O2[sel].mean()
        axs[1].annotate('%d/%d' % (f.numerator, f.denominator), (x0, float(f)), xytext=(-14, 4), textcoords='offset points', fontsize=6.5, color=DGREY)
axs[1].set_xlabel(r'$\Omega$ (zoom)'); axs[1].set_ylim(0.32, 0.44)
axs[0].add_patch(plt.Rectangle((0.33, 0.32), 0.09, 0.12, fill=False, ec=GOLD, lw=0.7))
savefig(fig, 'devils_staircase')

def width(f, K=1.0, O=OmF, Wv=W):
    sel = np.abs(Wv - float(f)) < 1e-5
    return (O[sel].max() - O[sel].min()) if sel.any() else 0.0
w0 = width(Fraction(0, 1))  # one-sided (from 0)
macro('ZeroTongueHalf', '%.4f' % w0); macro('InvTwoPi', '%.4f' % (1 / (2 * math.pi)))
macro('HalfTongue', '%.3f' % width(Fraction(1, 2))); macro('ThirdTongue', '%.3f' % width(Fraction(1, 3)))
# total width of plateaus with q <= 50 at K=1 (the staircase is complete: the sum tends to 1)
tot = sum(width(Fraction(p, q)) for q in range(1, 11) for p in range(0, q + 1) if math.gcd(p, q) == 1)
macro('PlateauSum', '%.3f' % tot)
# where pi-3 is captured by the 0/1 tongue as K grows: K_c = 2 pi Omega
macro('CaptureK', '%.4f' % float(2 * mp.pi * (mp.pi - 3)))
# Farey counts
for N in (50, 100, 200):
    c = sum(1 for q in range(1, N + 1) for p in range(0, q + 1) if math.gcd(p, q) == 1)
    macro('Farey' + {50: 'Fifty', 100: 'Hundred', 200: 'TwoHundred'}[N], commas(c))
    macro('FareyExp' + {50: 'Fifty', 100: 'Hundred', 200: 'TwoHundred'}[N], '%.0f' % (3 * N * N / math.pi ** 2))
write_macros('c2_music.tex')
print('ok', best_so_far, w0, tot)

# Farey rule on the K=1 staircase: the widest step strictly between two steps is their mediant
O3 = np.linspace(0.30, 0.45, 60001); W3 = rotnum(O3, 1.0, it=2520 * 4, burn=400)
def widest_between(f1, f2, qmax=40):
    best = None; bw = -1
    for q in range(1, qmax + 1):
        for p in range(0, q + 1):
            fr = Fraction(p, q)
            if f1 < fr < f2 and fr.denominator == q:
                w = width(fr, O=O3, Wv=W3)
                if w > bw: bw, best = w, fr
    return best
for f1, f2, want in ((Fraction(1, 3), Fraction(2, 5), Fraction(3, 8)), (Fraction(3, 8), Fraction(2, 5), Fraction(5, 13)),
                     (Fraction(2, 5), Fraction(3, 7), Fraction(5, 12)), (Fraction(1, 3), Fraction(3, 8), Fraction(4, 11))):
    got = widest_between(f1, f2)
    assert got == want, (f1, f2, got)
print('farey staircase ok')
