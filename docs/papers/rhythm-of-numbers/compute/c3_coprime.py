"""Chapters 5-6: coprimality and 6/pi^2 (orchard, Euler product, zeta(2)), the pulse-train correlation
formula, Balmer, the residue-pair bias of consecutive primes, Dirichlet arms in the prime sunflower,
wheel sieves, diffraction of pi's rhythm and of the primes, and Riemann's explicit formula."""
import math
import numpy as np
import mpmath as mp
from sympy import primerange, primepi, totient
from common import *

plt = style()
mp.mp.dps = 30
macro('SixPiSq', '%.6f' % (6 / math.pi ** 2))
macro('ZetaTwo', '%.6f' % (math.pi ** 2 / 6))

# ---------- orchard ----------
def visible_share(N):
    a = np.arange(1, N + 1)
    g = np.gcd.outer(a, a)
    return (g == 1).mean()
vs = {N: visible_share(N) for N in (40, 120, 1000)}
macro('OrchardForty', '%.4f' % vs[40]); macro('OrchardThousand', '%.6f' % vs[1000])
prod = 1.0
for p in primerange(2, 10 ** 6): prod *= 1 - 1 / p ** 2
macro('EulerProdMillion', '%.8f' % prod); macro('SixPiSqEight', '%.8f' % (6 / math.pi ** 2))
# figure: orchard 40x40 with pi's convergent points (q, p-3q)
N = 40
fig, ax = plt.subplots(figsize=(3.2, 3.2))
a = np.arange(1, N + 1)
A, B = np.meshgrid(a, a)
vis = np.gcd(A, B) == 1
ax.scatter(A[vis], B[vis], s=4.5, c=GREEN, lw=0)
ax.scatter(A[~vis], B[~vis], s=4.5, facecolors='none', edgecolors=LGREY, lw=0.4)
ax.plot([7], [1], 'o', ms=6, mfc=GOLD, mec=DGREY, mew=0.5)
ax.annotate('(7, 1): 22/7', (7, 1), xytext=(8, 3), fontsize=7)
ax.set_xlim(0, N + 1); ax.set_ylim(0, N + 1); ax.set_aspect('equal')
ax.set_xlabel('$a$'); ax.set_ylabel('$b$')
savefig(fig, 'orchard')

# ---------- correlation of pulse trains ----------
def corr_exact(a, b):
    L = a * b // math.gcd(a, b)
    x = np.zeros(L); y = np.zeros(L)
    x[::a] = 1; y[::b] = 1
    return np.corrcoef(x, y)[0, 1]
bad = 0
for a_ in range(2, 31):
    for b_ in range(2, 31):
        if a_ == b_: continue
        f = (math.gcd(a_, b_) - 1) / math.sqrt((a_ - 1) * (b_ - 1))
        if abs(f - corr_exact(a_, b_)) > 1e-12: bad += 1
assert bad == 0
macro('CorrFourSix', '%.3f' % ((2 - 1) / math.sqrt(3 * 5)))
NC = 40
M = np.array([[1.0 if i == j else (math.gcd(i, j) - 1) / math.sqrt((i - 1) * (j - 1)) for j in range(2, NC + 1)] for i in range(2, NC + 1)])
zero_share = (M[~np.eye(NC - 1, dtype=bool)] == 0).mean()
ev = np.linalg.eigvalsh(M)
macro('CorrZeroShare', '%.3f' % zero_share)
macro('CorrEigMax', '%.2f' % ev.max()); macro('CorrEigMin', '%.3f' % ev.min())
fig, ax = plt.subplots(figsize=(3.2, 3.0))
from matplotlib.colors import LinearSegmentedColormap
cm = LinearSegmentedColormap.from_list('c', ['white', MINT, GREEN])
im = ax.imshow(M, origin='lower', extent=[1.5, NC + .5, 1.5, NC + .5], cmap=cm, vmin=0, vmax=1)
ax.set_xlabel('period $a$'); ax.set_ylabel('period $b$')
cb = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.03); cb.set_label('corr$(a,b)$', fontsize=8); cb.ax.tick_params(labelsize=7)
savefig(fig, 'corr_matrix')

# ---------- zeta(2) and the Euler product; Balmer ----------
ns = np.arange(1, 41)
partial = np.cumsum(1 / ns ** 2)
pr = list(primerange(2, 200))
eprod = np.cumprod([1 / (1 - 1 / p ** 2) for p in pr])
fig, ax = plt.subplots(figsize=(5.2, 2.2))
ax.axhline(math.pi ** 2 / 6, color=GOLD, lw=0.9)
ax.plot(ns, partial, 'o-', ms=2.5, color=GREEN, lw=0.8, label=r'$\sum_{n\leq N} 1/n^2$ (index $N$)')
ax.plot(range(1, len(pr) + 1), eprod, 's-', ms=2.5, color=GREY, lw=0.8, label=r'$\prod_{p\leq p_N}(1-p^{-2})^{-1}$ (prime number $N$)')
ax.set_xlim(0, 41); ax.set_ylim(0.95, 1.7); ax.set_xlabel('$N$'); ax.legend(loc='lower right')
ax.text(1, math.pi ** 2 / 6 + 0.015, r'$\pi^2/6$', color=GOLD, fontsize=8)
savefig(fig, 'zeta_two')
macro('BalmerAlpha', '%.1f' % (364.56 * 9 / 5))
macro('BalmerBeta', '%.1f' % (364.56 * 16 / 12))

# ---------- residue-pair bias ----------
import sympy
LIM = 10 ** 7
ps = np.array(list(primerange(7, LIM)), dtype=np.int64)
def repeat_share(mod, lim):
    q = ps[ps < lim] % mod
    return (q[1:] == q[:-1]).mean()
for mod, nm in ((10, 'Ten'), (12, 'Twelve')):
    for lim, ln in ((10 ** 5, 'A'), (10 ** 6, 'B'), (10 ** 7, 'C')):
        macro('Rep%s%s' % (nm, ln), '%.1f' % (100 * repeat_share(mod, lim)))
q = ps % 10
idx = {1: 0, 3: 1, 7: 2, 9: 3}
T = np.zeros((4, 4))
for x, y in zip(q[:-1], q[1:]): T[idx[x], idx[y]] += 1
T /= T.sum()
fig, ax = plt.subplots(figsize=(2.8, 2.5))
im = ax.imshow(T * 100, cmap=LinearSegmentedColormap.from_list('r', ['white', MINT, GREEN]), vmin=3, vmax=9)
for i in range(4):
    for j in range(4):
        ax.text(j, i, '%.2f' % (100 * T[i, j]), ha='center', va='center', fontsize=7, color='white' if T[i, j] > 0.07 else DGREY)
ax.set_xticks(range(4)); ax.set_yticks(range(4)); ax.set_xticklabels(['1', '3', '7', '9']); ax.set_yticklabels(['1', '3', '7', '9'])
ax.set_xlabel('last digit of next prime'); ax.set_ylabel('last digit of prime')
ax.spines[:].set_visible(True)
savefig(fig, 'residue_bias')
macro('PrimesToTenSeven', commas(int(primepi(LIM)) - 3))

# ---------- sunflower and wheels ----------
alpha = math.pi - 3
K = 8000
k = np.arange(1, K + 1)
isp = np.array([sympy.isprime(int(x)) for x in k])
th = 2 * np.pi * k * alpha; r = np.sqrt(k)
fig, axs = plt.subplots(1, 2, figsize=(6.0, 3.0))
for ax, Kmax, title in ((axs[0], 3000, 'all seeds, $k\\leq 3000$'), (axs[1], 8000, 'prime seeds, $k\\leq 8000$')):
    sel = k <= Kmax
    if 'prime' in title: sel = sel & isp
    ax.scatter(r[sel] * np.cos(th[sel]), r[sel] * np.sin(th[sel]), s=1.6 if 'prime' in title else 0.5,
               c=np.where((k[sel] % 113) == 0, GOLD, GREEN), lw=0)
    ax.set_aspect('equal'); ax.axis('off'); ax.set_title(title, fontsize=8)
savefig(fig, 'sunflower', raster=True)
# arms mod 113 and mod 106 occupied by primes
pr8 = [int(x) for x in k[isp]]
occ113 = len({p % 113 for p in pr8 if p > 113}); occ106 = len({p % 106 for p in pr8 if p > 106})
macro('ArmsOneThirteen', occ113); macro('ArmsOneOSix', occ106); macro('TotientOneOSix', int(totient(106)))
wheel30 = int(totient(30)); macro('WheelSkip', '%.0f' % (100 * (1 - wheel30 / 30)))
macro('WheelTwoTen', '%.1f' % (100 * (1 - int(totient(210)) / 210)))

# ---------- diffraction (structure factor) ----------
def sfactor(pos, ks, taper=False):
    pos = np.asarray(pos, float); pos = pos - pos.min()
    wts = np.sin(np.pi * pos / pos.max()) ** 2 * 2 if taper else np.ones(len(pos))  # Hann taper (mean ~1) for the plots
    out = np.empty(len(ks))
    for i in range(0, len(ks), 2000):
        out[i:i + 2000] = np.abs((wts * np.exp(2j * np.pi * np.outer(ks[i:i + 2000], pos))).sum(1)) ** 2 / len(pos)
    return out
NB = 3000
word = rhythm_word([7, 15, 1, 292])[4][:NB]
hits = [i for i, c in enumerate(word) if c == 'x']
ks = np.linspace(0.0005, 0.5, 40000)
S_pi = sfactor(hits, ks, True)
# primes in a window: positions normalized as integers; Torquato et al. use primes in [M, M+L]
pw = np.array(list(primerange(10 ** 6, 10 ** 6 + 2 * 10 ** 4)))
S_pr = sfactor(pw, ks, True)
rng = np.random.default_rng(1)
rnd = np.sort(rng.choice(np.arange(10 ** 6, 10 ** 6 + 2 * 10 ** 4), size=len(pw), replace=False))
S_rd = sfactor(rnd, ks, True)
fig, axs = plt.subplots(2, 1, figsize=(5.8, 3.6), sharex=True)
axs[0].plot(ks, S_pi, color=GREEN, lw=0.6)
for m in range(1, 8):
    f = (m * alpha) % 1; f = min(f, 1 - f)
    axs[0].plot(f, S_pi.max() * 1.05, 'v', ms=3.5, color=GOLD)
axs[0].set_ylabel(r'$S(k)$, pi rhythm'); axs[0].set_yscale('log'); axs[0].set_ylim(1e-4, S_pi.max() * 4)
axs[1].plot(ks, S_rd, color=GOLD, lw=0.4, alpha=0.7, label='random set, same density')
axs[1].plot(ks, S_pr, color=GREEN, lw=0.6, label='primes in $[10^6, 10^6+2\\cdot 10^4)$')
for d, lab in ((2, '1/2'), (3, '1/3'), (6, '1/6'), (5, '1/5'), (10, '1/10'), (15, '1/15'), (30, '1/30')):
    axs[1].annotate(lab, (1 / d, S_pr.max() * 1.6), ha='center', fontsize=6.5, color=GOLD)
axs[1].set_yscale('log'); axs[1].set_ylim(1e-4, S_pr.max() * 8); axs[1].set_ylabel(r'$S(k)$, primes')
axs[1].set_xlabel('wavenumber $k$ (cycles per unit)'); axs[1].legend(loc='upper left', bbox_to_anchor=(0.0, -0.32), ncol=2, fontsize=7)
savefig(fig, 'diffraction', raster=True)
# peak checks: primes peak at 1/2,1/3,1/6 (squarefree), weak at 1/4, 1/9
def at(S, x): return S[np.argmin(np.abs(ks - x))]
def at(S, x, _p={}):
    P = hits if S is S_pi else pw
    return sfactor(P, np.array([x]))[0]
macro('SprHalf', '%.0f' % at(S_pr, 0.5)); macro('SprThird', '%.0f' % at(S_pr, 1 / 3))
macro('SprQuarter', '%.2f' % at(S_pr, 0.25)); macro('SprNinth', '%.2f' % at(S_pr, 1 / 9))
macro('SpiAlpha', '%.0f' % at(S_pi, alpha)); macro('NprimesWindow', commas(len(pw)))

# ---------- explicit formula ----------
zeros = [mp.zetazero(n) for n in range(1, 101)]
def psi_true(x):
    s = 0.0
    for p in primerange(2, int(x) + 1):
        pk = p
        while pk <= x: s += math.log(p); pk *= p
    return s
def psi_zeros(x, nz):
    x = mp.mpf(x)
    s = x - mp.log(2 * mp.pi) - 0.5 * mp.log(1 - x ** -2)
    for rho in zeros[:nz]:
        s -= 2 * mp.re(x ** rho / rho)
    return float(s)
xs = np.linspace(2.05, 40, 900)
fig, ax = plt.subplots(figsize=(5.8, 2.6))
ax.step(xs, [psi_true(x) for x in xs], where='post', color=DGREY, lw=0.9, label=r'$\psi(x)$')
for nz, c, lw in ((3, LGREY, 0.8), (20, GOLD, 0.8), (100, GREEN, 0.9)):
    ax.plot(xs, [psi_zeros(x, nz) for x in xs], color=c, lw=lw, label='%d pairs of zeros' % nz)
ax.set_xlabel('$x$'); ax.set_ylabel(r'$\psi(x)$'); ax.legend(loc='upper left', fontsize=7)
savefig(fig, 'explicit_formula')
macro('ZeroOne', mp.nstr(zeros[0].imag, 7)); macro('ZeroTwo', mp.nstr(zeros[1].imag, 7)); macro('ZeroThree', mp.nstr(zeros[2].imag, 7))
write_macros('c3_coprime.tex')
print('done')
