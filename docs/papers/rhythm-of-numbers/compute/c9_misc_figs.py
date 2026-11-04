"""Remaining figures: the starting guess, pi's rhythm as nested blocks, the three-gap theorem, the
Gauss-Kuzmin test, Khinchin and Levy running means, a Chladni figure, and the four-subject diagram."""
import math
import numpy as np
import mpmath as mp
from common import *

plt = style()
mp.mp.dps = 40
alpha = float(mp.pi - 3)
G = load('guess.json')

# ---------- the guess ----------
fig, ax = plt.subplots(figsize=(5.6, 2.3))
k = np.array(G['k']); e = np.array(G['err'])
ax.semilogy(k, e, '-', color=LGREY, lw=0.8)
ax.semilogy(k, e, 'o', ms=3, color=GREEN)
pk = np.array(G['prime_k'])
ax.semilogy(pk, e[pk - 1], 'o', ms=5.5, mfc='none', mec=GOLD, mew=1.0, label='$7k+1$ prime')
for kk, lab in ((1, '25/8'), (10, '223/71'), (16, '355/113')):
    ax.annotate(lab, (kk, e[kk - 1]), xytext=(4, -10 if kk == 16 else 5), textcoords='offset points', fontsize=7)
ax.set_xlabel('$k$'); ax.set_ylabel(r'$|\pi - (3 + k/(7k+1))|$'); ax.legend(fontsize=7, loc='upper right')
savefig(fig, 'guess')

# ---------- pi's rhythm as nested blocks ----------
lv = rhythm_word([7, 15, 1, 292])
fig, axs = plt.subplots(4, 1, figsize=(6.3, 3.4), gridspec_kw={'height_ratios': [1, 1, 1, 1.1]})
# row 1: first 113 beats, hits
w = lv[3]
for i, c in enumerate(w):
    axs[0].add_patch(plt.Rectangle((i, 0), 0.9, 1, fc=GREEN if c == 'x' else '#e9e9e9', ec='none'))
axs[0].set_xlim(0, 113); axs[0].set_title('level 3: one 113-beat block = fifteen 7-beat bars, one extra rest, one more bar (16 hits)', fontsize=7.5)
# row 2: level 2 vs 3 blocks inside level 4 (first ~ 12 blocks)
x = 0
for j in range(12):
    axs[1].add_patch(plt.Rectangle((x, 0), 113, 1, fc=GREEN if j % 2 == 0 else MINT, ec='white', lw=0.5)); x += 113
axs[1].set_xlim(0, 12 * 113); axs[1].set_title('level 4 begins: 113-beat phrases, again and again', fontsize=7.5)
# row 3: whole level 4: 292 phrases of 113 then 106
x = 0
for j in range(292):
    axs[2].add_patch(plt.Rectangle((x, 0), 113, 1, fc=GREEN if j % 2 == 0 else MINT, ec='none')); x += 113
axs[2].add_patch(plt.Rectangle((x, 0), 106, 1, fc=GOLD, ec='none'))
axs[2].annotate('short phrase (106) starts at beat 32,996', (x, 1), xytext=(x - 15000, 1.25), fontsize=7, arrowprops=dict(arrowstyle='->', lw=0.6, color=GOLD))
axs[2].set_xlim(0, 33102); axs[2].set_title('level 4: 292 phrases of 113, then one of 106 = 33,102 beats', fontsize=7.5)
# row 4: level 5,6: 33102 + 113 etc
for (x0, L, c) in ((0, 33102, GREEN), (33102, 113, GOLD), (33215, 33102, GREEN), (66317, 33215, MINT)):
    axs[3].add_patch(plt.Rectangle((x0, 0), L, 1, fc=c, ec='white', lw=0.6))
axs[3].set_xlim(0, 99532); axs[3].set_title('levels 5-7: blocks of 33,102 and 33,215 beats (terms 1, 1, 1)', fontsize=7.5)
for ax in axs:
    ax.set_ylim(0, 1.6 if ax is axs[2] else 1); ax.set_yticks([]); ax.spines['left'].set_visible(False)
    ax.tick_params(axis='x', labelsize=6.5)
axs[3].set_xlabel('beat')
fig.tight_layout(h_pad=0.4)
savefig(fig, 'pi_blocks')

# ---------- three-gap ----------
fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.3), gridspec_kw={'width_ratios': [1.4, 1]})
for N in range(1, 121):
    pts = np.sort(np.r_[np.mod(np.arange(1, N + 1) * alpha, 1.0), 0.0])
    g = np.diff(np.r_[pts, 1.0])
    vals = sorted(set(np.round(g, 10)))
    axs[0].plot([N] * len(vals), vals, 'o', ms=1.8, color=GREEN if len(vals) == 3 else (GOLD if len(vals) == 2 else DGREY))
axs[0].set_yscale('log'); axs[0].set_xlabel('$N$ points $\\{n(\\pi-3)\\}$'); axs[0].set_ylabel('distinct gap lengths')
for q in (7, 113):
    axs[0].axvline(q, color=LGREY, lw=0.6, ls='--')
N = 20
pts = np.mod(np.arange(1, N + 1) * alpha, 1.0)
th = 2 * np.pi * pts
axs[1].plot(np.cos(np.linspace(0, 2 * np.pi, 300)), np.sin(np.linspace(0, 2 * np.pi, 300)), color=LGREY, lw=0.7)
axs[1].scatter(np.cos(th), np.sin(th), s=9, c=GREEN, zorder=3)
for n_, t_ in zip(range(1, N + 1), th):
    axs[1].text(1.16 * np.cos(t_), 1.16 * np.sin(t_), str(n_), fontsize=5.5, ha='center', va='center')
axs[1].set_aspect('equal'); axs[1].axis('off'); axs[1].set_title('$N=20$: points cluster near sevenths', fontsize=7.5)
savefig(fig, 'three_gap')

# ---------- Gauss-Kuzmin and running means ----------
D = load('gk.json')
cnt = np.array(D['counts'])
ks = np.arange(1, 21)
law = -np.log2(1 - 1 / (ks + 1) ** 2)
fig, ax = plt.subplots(figsize=(5.4, 2.4))
ax.bar(ks, cnt / 10000, color=GREEN, width=0.7, label="$\\pi$'s first 10,000 terms")
ax.plot(ks, law, '_', ms=12, mew=1.6, color=GOLD, label='Gauss-Kuzmin law')
ax.set_yscale('log'); ax.set_xlabel('term value $k$'); ax.set_ylabel('share of terms'); ax.set_xticks(ks)
ax.legend(fontsize=7)
savefig(fig, 'gauss_kuzmin')
fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.3))
n = np.arange(1, 10001, 10)
axs[0].plot(n, D['geo_running'], color=GREEN, lw=0.8)
axs[0].axhline(float(mp.khinchin), color=GOLD, lw=0.9); axs[0].set_xscale('log')
axs[0].set_xlabel('terms $n$'); axs[0].set_ylabel('geometric mean'); axs[0].set_ylim(1.5, 3.5)
axs[0].text(1.5, float(mp.khinchin) + 0.08, "Khinchin's constant", color=GOLD, fontsize=7)
axs[1].plot(n, D['levy_running'], color=GREEN, lw=0.8)
axs[1].axhline(math.pi ** 2 / (12 * math.log(2)), color=GOLD, lw=0.9); axs[1].set_xscale('log')
axs[1].set_xlabel('terms $n$'); axs[1].set_ylabel(r'$\ln q_n / n$'); axs[1].set_ylim(0.6, 1.8)
axs[1].text(1.5, 1.22, r"Lévy: $\pi^2/(12\ln 2)$", color=GOLD, fontsize=7)
savefig(fig, 'khinchin_levy')

# ---------- Chladni figure (classic approximate square-plate modes) ----------
fig, axs = plt.subplots(1, 3, figsize=(5.4, 1.9))
xg = np.linspace(0, 1, 500); X, Y = np.meshgrid(xg, xg)
for ax, (n_, m_, sg) in zip(axs, ((1, 2, -1), (2, 3, 1), (3, 5, -1))):
    Z = np.cos(n_ * np.pi * X) * np.cos(m_ * np.pi * Y) + sg * np.cos(m_ * np.pi * X) * np.cos(n_ * np.pi * Y)
    ax.contour(X, Y, Z, levels=[0], colors=[GREEN], linewidths=1.0)
    ax.set_aspect('equal'); ax.set_xticks([]); ax.set_yticks([])
    for sp in ax.spines.values(): sp.set_visible(True); sp.set_color(GREY); sp.set_linewidth(0.6)
    ax.set_title('$n=%d,\\ m=%d,\\ %s$' % (n_, m_, '-' if sg < 0 else '+'), fontsize=7.5)
savefig(fig, 'chladni')

print('ok')
