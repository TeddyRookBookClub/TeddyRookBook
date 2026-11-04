"""Thread (b): one spectrum of spacing statistics, crystal -> quasicrystal (Sturmian, three gaps) -> GUE
(zeta zeros, random matrices) -> Poisson (and the primes' normalized gaps).
Statistics: nearest-neighbor spacing distribution, pair correlation, number variance."""
import math
import numpy as np
import mpmath as mp
from sympy import primerange
from common import *

plt = style()
rng = np.random.default_rng(2026)
z = np.array(load('zeros.json'))
NZ = len(z)
# check a few against mpmath at higher precision
for n in (1, 2, 3, 100, NZ):
    assert abs(float(mp.zetazero(n).imag) - z[n - 1]) < 1e-8
# Riemann-von Mangoldt check: count matches N(T) = theta(T)/pi + 1 + S(T), use mpmath.nzeros at the last zero + 0.01
assert int(mp.nzeros(z[-1] + 1e-6)) == NZ
macro('NZeros', commas(NZ)); macro('ZeroLast', '%.2f' % z[-1])

def Nsmooth(t):
    return t / (2 * np.pi) * np.log(t / (2 * np.pi * np.e)) + 7 / 8
uz = Nsmooth(z)
sz = np.diff(uz)
macro('ZeroSpacingMean', '%.4f' % sz.mean())

# GUE: N x N Hermitian matrices, bulk eigenvalues unfolded with the semicircle
def gue_spacings(N=1000, reps=16):
    out = []; unf_all = []
    for _ in range(reps):
        A = rng.normal(size=(N, N)) + 1j * rng.normal(size=(N, N))
        H = (A + A.conj().T) / 2
        ev = np.linalg.eigvalsh(H) / np.sqrt(N)   # semicircle radius 2 (variance of entries 1/2, ... -> radius sqrt(2*2))
        R = 2.0 * np.sqrt(1.0)
        # empirical radius: use the semicircle with radius sqrt(2)*sqrt(2) = 2 for this normalization
        R = np.sqrt(2) * np.sqrt(2)
        x = ev
        F = lambda x: N * (0.5 + (x * np.sqrt(np.maximum(R * R - x * x, 0)) / (R * R) + np.arcsin(np.clip(x / R, -1, 1))) / np.pi)
        u = F(x)
        mid = (x > -0.5 * R) & (x < 0.5 * R)
        uu = u[mid]
        out.append(np.diff(uu)); unf_all.append(uu)
    return np.concatenate(out), unf_all
sg, gue_unf = gue_spacings()
macro('GUESpacingMean', '%.4f' % sg.mean())
sp = rng.exponential(size=len(sz))
# primes: gaps / log p near 10^9
pr = np.array(list(primerange(10 ** 9, 10 ** 9 + 3 * 10 ** 5)), dtype=float)
spr = np.diff(pr) / np.log(pr[:-1])
spr = spr / spr.mean()
macro('NprimesGap', commas(len(pr)))
# pi rhythm hits (quasicrystal) and three-gap points
alpha = float(mp.pi - 3)
word = rhythm_word([7, 15, 1, 292])[4]
hits = np.array([i for i, c in enumerate(word) if c == 'x'], float)
upi = hits * alpha     # unit mean spacing
spi = np.diff(upi)
NTG = 1000
tg = np.sort(np.mod(np.arange(1, NTG + 1) * alpha, 1.0))
stg = np.diff(np.r_[tg, tg[0] + 1]) * NTG
macro('PiGapA', '%.4f' % (7 * alpha)); macro('PiGapB', '%.4f' % (8 * alpha))
macro('TGValues', ', '.join('%.3f' % v for v in sorted(set(np.round(stg, 6)))))

wig = lambda s: 32 / np.pi ** 2 * s ** 2 * np.exp(-4 * s ** 2 / np.pi)
small = lambda s: (s < 0.25).mean()
macro('SmallZero', '%.3f' % small(sz)); macro('SmallGUE', '%.3f' % small(sg)); macro('SmallPoisson', '%.3f' % small(sp))
macro('SmallPrimes', '%.3f' % small(spr))
macro('SmallWigner', '%.3f' % float(mp.quad(lambda s: 32 / mp.pi ** 2 * s ** 2 * mp.exp(-4 * s ** 2 / mp.pi), [0, 0.25])))
# Kolmogorov-Smirnov distances
from scipy import stats
ks_zg = stats.ks_2samp(sz, sg)
ks_zp = stats.ks_2samp(sz, sp)
macro('KSZeroGUE', '%.3f' % ks_zg.statistic); macro('KSZeroGUEp', '%.2f' % ks_zg.pvalue)
macro('KSZeroPoisson', '%.3f' % ks_zp.statistic)
macro('VarZero', '%.3f' % sz.var()); macro('VarGUE', '%.3f' % sg.var()); macro('VarPrimes', '%.3f' % spr.var())

# ---------- figure: spacing distributions ----------
fig, axs = plt.subplots(1, 3, figsize=(6.4, 2.3), sharey=True)
s = np.linspace(0, 3.5, 300)
bins = np.linspace(0, 3.5, 36)
axs[0].vlines([1.0], 0, 2.2, color=DGREY, lw=2.0, label='crystal')
axs[0].vlines([7 * alpha, 8 * alpha], 0, [2.2 * (spi < 1.05).mean(), 2.2 * (spi > 1.05).mean()], color=GOLD, lw=2.0, label=r'$\pi$ rhythm (2 gaps)')
axs[0].set_title('crystal and quasicrystal', fontsize=8); axs[0].legend(fontsize=6.5, loc='upper left'); axs[0].set_xlim(0.8, 1.3); axs[0].set_xticks([0.9, 1.0, 1.1, 1.2])
axs[1].hist(sz, bins=bins, density=True, color=MINT, ec='white', lw=0.3, label='zeta zeros')
axs[1].step(bins[:-1], np.histogram(sg, bins=bins, density=True)[0], where='post', color=GREEN, lw=0.9, label='GUE matrices')
axs[1].plot(s, wig(s), color=DGREY, lw=0.7, ls='--', label='Wigner surmise')
axs[1].set_title('level repulsion', fontsize=8); axs[1].legend(fontsize=6.5)
axs[2].hist(spr, bins=bins, density=True, color=LGREY, ec='white', lw=0.3, label=r'prime gaps / $\ln p$')
axs[2].plot(s, np.exp(-s), color=GREEN, lw=0.9, label=r'Poisson $e^{-s}$')
axs[2].set_title('no repulsion', fontsize=8); axs[2].legend(fontsize=6.5)
for ax in axs: ax.set_xlabel('spacing $s$ (mean 1)')
axs[0].set_ylabel('density')
savefig(fig, 'spacing_dist')

# ---------- pair correlation ----------
def pair_corr(u, umax=3.0, nb=60, maxpts=6000):
    u = np.sort(u)[:maxpts]
    d = []
    for i in range(len(u)):
        j = i + 1
        while j < len(u) and u[j] - u[i] < umax:
            d.append(u[j] - u[i]); j += 1
    h, e = np.histogram(d, bins=nb, range=(0, umax))
    return 0.5 * (e[1:] + e[:-1]), h / (len(u) * (e[1] - e[0]))
uu, Rz = pair_corr(uz)
_, Rg = pair_corr(np.concatenate([g - g[0] + k * 10 ** 6 for k, g in enumerate(gue_unf)]))
_, Rp = pair_corr(np.cumsum(sp))
_, Rpi = pair_corr(upi)
fig, ax = plt.subplots(figsize=(5.4, 2.5))
ax.plot(uu, Rpi, color=GOLD, lw=0.5, alpha=0.6, label=r'$\pi$ rhythm (spikes)', zorder=1)
ax.plot(uu, Rp, color=LGREY, lw=0.9, label='Poisson')
ax.plot(uu, Rg, color=GREEN, lw=0.8, ls='--', label='GUE matrices')
ax.plot(uu, Rz, 'o', ms=2.4, color=GREEN, label='zeta zeros')
ax.plot(uu, 1 - (np.sinc(uu)) ** 2, color=DGREY, lw=0.8, label=r'$1-(\sin \pi u/\pi u)^2$')
ax.set_ylim(0, 2.2); ax.set_xlabel('distance $u$ (mean spacings)'); ax.set_ylabel('pair correlation $R_2(u)$'); ax.legend(fontsize=6.5, ncol=2)
savefig(fig, 'pair_correlation')
mont = 1 - np.sinc(uu) ** 2
macro('PairRMS', '%.3f' % np.sqrt(np.mean((Rz - mont) ** 2)))

# ---------- number variance ----------
def numvar(u, Ls, trials=4000):
    u = np.sort(u); lo, hi = u[0], u[-1]
    out = []
    for L in Ls:
        st = rng.uniform(lo, hi - L, trials)
        c = np.searchsorted(u, st + L) - np.searchsorted(u, st)
        out.append(c.var())
    return np.array(out)
Ls = np.logspace(-1, math.log10(30), 22)
V = {
    'crystal': numvar(np.arange(0, 20000, 1.0), Ls),
    'pi': numvar(upi, Ls),
    'zeros': numvar(uz, Ls),
    'gue': np.mean([numvar(g, Ls, 1500) for g in gue_unf[:10]], axis=0),
    'poisson': numvar(np.cumsum(rng.exponential(size=20000)), Ls),
    'primes': numvar(np.cumsum(spr), Ls),
}
gamma = 0.5772156649
gue_th = lambda L: (np.log(2 * np.pi * L) + gamma + 1) / np.pi ** 2
fig, ax = plt.subplots(figsize=(5.4, 2.8))
ax.loglog(Ls, V['poisson'], 's', ms=2.5, color=LGREY, label='Poisson')
ax.loglog(Ls, Ls, color=LGREY, lw=0.6)
ax.loglog(Ls, V['primes'], 'v', ms=2.5, color=GREY, label=r'primes (gaps$/\ln p$)')
ax.loglog(Ls, V['zeros'], 'o', ms=2.5, color=GREEN, label='zeta zeros')
ax.loglog(Ls, V['gue'], '-', color=GREEN, lw=0.8, label='GUE matrices')
Lt = Ls[Ls > 0.5]
ax.loglog(Lt, gue_th(Lt), ':', color=DGREY, lw=0.8, label=r'GUE: $\frac{1}{\pi^2}(\ln 2\pi L+\gamma+1)$')
ax.loglog(Ls, np.maximum(V['pi'], 1e-3), 'D', ms=2.5, color=GOLD, label=r'$\pi$ rhythm')
ax.loglog(Ls, np.maximum(V['crystal'], 1e-3), '^', ms=2.5, color=DGREY, label='crystal')
ax.set_xlabel('window length $L$ (mean spacings)'); ax.set_ylabel(r'number variance $\Sigma^2(L)$')
ax.set_ylim(1e-3, 50); ax.legend(fontsize=6.2, ncol=2, loc='upper left')
savefig(fig, 'number_variance')
i10 = np.argmin(np.abs(Ls - 10))
for k, nm in (('crystal', 'Crys'), ('pi', 'PiR'), ('zeros', 'Zer'), ('gue', 'Gue'), ('poisson', 'Poi'), ('primes', 'Pri')):
    macro('NV' + nm, '%.2f' % V[k][i10])
macro('NVGueTh', '%.2f' % gue_th(Ls[i10])); macro('NVL', '%.1f' % Ls[i10])
save('spacing.json', {k: list(map(float, v)) for k, v in V.items()})
print('ok', NZ, sz.mean(), sg.mean(), small(sz), small(sg), small(sp), ks_zg, V['pi'][i10], V['zeros'][i10], gue_th(Ls[i10]))

# ---------- Dyson's remark: the zeros "diffract" at logarithms of prime powers ----------
ts = np.linspace(0.2, 3.7, 7000)
Fz = np.zeros_like(ts)
for g in z:
    Fz += np.cos(g * ts) * np.exp(-(g / z[-1]) ** 2 * 2)  # smooth cutoff
fig, ax = plt.subplots(figsize=(5.8, 2.4))
ax.plot(ts, Fz / np.sqrt(len(z)), color=GREEN, lw=0.6)
from sympy import factorint
for n in range(2, 41):
    f = factorint(n)
    if len(f) == 1:
        t0 = math.log(n)
        if t0 < 3.7:
            ax.axvline(t0, color=GOLD, lw=0.6, ls=':')
            ax.text(t0, ax.get_ylim()[0] if False else 0, '', fontsize=6)
for n in (2, 3, 4, 5, 7, 8, 9, 11, 13):
    ax.annotate(str(n), (math.log(n), 0), xytext=(math.log(n), -(Fz / np.sqrt(len(z))).min() * 0.2 + 0.0), fontsize=6.5, color=GOLD, ha='center')
ax.set_xlabel(r'$t$'); ax.set_ylabel(r'$\sum_\gamma \cos(\gamma t)$ (scaled)')
savefig(fig, 'zeros_fourier')
# depth of the dips at log 2, log 3 relative to typical fluctuation
def val(t0): return Fz[np.argmin(np.abs(ts - t0))] / np.sqrt(len(z))
mask = np.ones_like(ts, bool)
for n in range(2, 41):
    if len(factorint(n)) == 1: mask &= np.abs(ts - math.log(n)) > 0.03
macro('DipTwo', '%.1f' % val(math.log(2))); macro('DipThree', '%.1f' % val(math.log(3)))
macro('FzNoise', '%.2f' % np.std((Fz / np.sqrt(len(z)))[mask]))
write_macros('c5_spacing.tex')
