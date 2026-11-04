"""Figures and macros for the prime-convergent thread (data from c7_primeconv.py)."""
import math, sys
import numpy as np
from common import *
sys.set_int_max_str_digits(0)
plt = style()
d = load('primeconv.json'); terms = load('terms.json')
R = d['random']; M, NR = R['M'], R['N']
q = np.array(R['q']); p = np.array(R['p']); ex = np.array(R['exp']); curves = np.array(R['curves'])
cps = R['checkpoints']
C = 2 * math.log(2)
macro('CconstVal', '%.4f' % C)
macro('RandM', M); macro('RandN', commas(NR))
macro('RandQmean', '%.2f' % q.mean()); macro('RandQsd', '%.2f' % q.std(ddof=1))
macro('RandPmean', '%.2f' % p.mean()); macro('RandPsd', '%.2f' % p.std(ddof=1))
macro('RandExpMean', '%.2f' % ex.mean())
# growth between checkpoints vs 2 ln 2 * ln ratio
mean_c = curves.mean(0)
i100, i1000, i200 = cps.index(100), cps.index(1000), cps.index(200)
macro('RandGrowthObs', '%.2f' % (mean_c[i1000] - mean_c[i100])); macro('RandGrowthPred', '%.2f' % (C * math.log(10)))
macro('RandGrowthObsB', '%.2f' % (mean_c[i1000] - mean_c[i200])); macro('RandGrowthPredB', '%.2f' % (C * math.log(5)))
# slope fit of mean count vs ln n for n >= 50
xs = np.log(np.array(cps[2:])); ys = mean_c[2:]
slope, icpt = np.polyfit(xs, ys, 1)
macro('RandSlope', '%.2f' % slope)
# standard error of the slope by bootstrap over reals
rng = np.random.default_rng(7); bs = []
for _ in range(400):
    idx = rng.integers(0, M, M); bs.append(np.polyfit(xs, curves[idx].mean(0)[2:], 1)[0])
macro('RandSlopeSE', '%.2f' % np.std(bs))
names = {'pi': r'$\pi$', 'e': '$e$', 'sqrt2': r'$\sqrt{2}$', 'phi': r'$\varphi$', 'fifth': r'$\log_2(3/2)$'}
rows = []
for k in ('pi', 'e', 'fifth', 'sqrt2', 'phi'):
    x = d[k]; N = x['N']
    q1000 = sum(1 for j in x['q_prime_idx'] if j <= 1000); p1000 = sum(1 for j in x['p_prime_idx'] if j <= 1000)
    pct = 100 * (q <= q1000).mean()
    pcts = '%.0f' % pct if k in ('pi', 'e', 'fifth') else '--'
    rows.append('%s & %s & %d & %.1f & %d & %d & %d & %.1f & %s' % (names[k], commas(N), len(x['q_prime_idx']), x['exp_q'][-1],
                                                                 len(x['p_prime_idx']), q1000, p1000, x['exp_q'][999], pcts))
    macro({'pi': 'Pi', 'e': 'E', 'fifth': 'Fifth', 'sqrt2': 'Root', 'phi': 'Phi'}[k] + 'QPrimes', len(x['q_prime_idx']))
    macro({'pi': 'Pi', 'e': 'E', 'fifth': 'Fifth', 'sqrt2': 'Root', 'phi': 'Phi'}[k] + 'PPrimes', len(x['p_prime_idx']))
    macro({'pi': 'Pi', 'e': 'E', 'fifth': 'Fifth', 'sqrt2': 'Root', 'phi': 'Phi'}[k] + 'QExp', '%.1f' % x['exp_q'][-1])
    macro({'pi': 'Pi', 'e': 'E', 'fifth': 'Fifth', 'sqrt2': 'Root', 'phi': 'Phi'}[k] + 'QThousand', q1000)
    macro({'pi': 'Pi', 'e': 'E', 'fifth': 'Fifth', 'sqrt2': 'Root', 'phi': 'Phi'}[k] + 'Pct', '%.0f' % pct)
macro('PrimeConvTable', '\\\\\n'.join(rows) + '\\\\')
pi = d['pi']
macro('PiQIdx', ', '.join(map(str, pi['q_prime_idx'])))
macro('PiPIdx', ', '.join(map(str, pi['p_prime_idx'])))
macro('PiEvenShare', '%.4f' % (pi['even_q'] / pi['N'])); macro('PiThreeShare', '%.4f' % (pi['three_q'] / pi['N']))
P, Q = convergents(terms['pi'][:5001])
macro('PiLastQDigits', commas(len(str(Q[pi['q_prime_idx'][-1]]))))
macro('PiLastPDigits', commas(len(str(P[pi['p_prime_idx'][-1]]))))
macro('PiQEightDigits', commas(len(str(Q[32]))))
assert Q[32] == 842468587426513207
assert [P[i] for i in (4, 8, 10, 15)] == [103993, 833719, 4272943, 411557987]
assert P[86] == 7809723338470423412693394150101387872685594299 and len(str(P[229])) == 123  # OEIS A086785
macro('PhiFibIdx', ', '.join(str(j + 1) for j in d['phi']['q_prime_idx']))
macro('RootPellIdx', ', '.join(str(j + 1) for j in d['sqrt2']['q_prime_idx']))
# Grantham-Granville prediction for Fibonacci primes F_n, n <= 3001
gamma = 0.5772156649015329
macro('GGFib', '%.1f' % (math.exp(gamma) * math.log(3001) / math.log((1 + 5 ** 0.5) / 2)))
# mod-p frequencies of q_n for pi's 10,000 convergents
P10, Q10 = convergents(terms['pi'][:10001])
ps = [2, 3, 5, 7, 11, 13]
obs = [sum(1 for qq in Q10[1:] if qq % pr == 0) / 10000 for pr in ps]
# for random reals too (fresh sample, 200 reals x 2000 terms, exact rational expansion)
import random
rr = random.Random(99); robs = np.zeros(len(ps)); cnt = 0
for _ in range(200):
    D = 3400; num, den = rr.randrange(1, 10 ** D), 10 ** D; t = []
    while den and len(t) < 2001: t.append(num // den); num, den = den, num % den
    _, Qr = convergents(t)
    for j, pr in enumerate(ps): robs[j] += sum(1 for qq in Qr[1:2001] if qq % pr == 0)
    cnt += 2000
robs /= cnt
fig, ax = plt.subplots(figsize=(4.6, 2.4))
xx = np.arange(len(ps))
ax.bar(xx - 0.2, obs, 0.38, color=GREEN, label=r"$\pi$, 10,000 convergents")
ax.bar(xx + 0.2, robs, 0.38, color=MINT, label='random reals, 400,000 convergents')
ax.plot(xx, [1 / (pr + 1) for pr in ps], '_', ms=16, mew=1.6, color=GOLD, label=r'$1/(p+1)$')
ax.plot(xx, [1 / pr for pr in ps], '_', ms=16, mew=1.0, color=DGREY, label=r'$1/p$ (random integers)')
ax.set_xticks(xx); ax.set_xticklabels([str(pr) for pr in ps]); ax.set_xlabel('prime $p$'); ax.set_ylabel(r'share of $q_n$ divisible by $p$')
ax.legend(fontsize=6.5)
savefig(fig, 'qn_mod_p')
macro('ModTable', '\\\\\n'.join('%d & %.4f & %.4f & %.4f & %.4f' % (pr, o, ro, 1 / (pr + 1), 1 / pr) for pr, o, ro in zip(ps, obs, robs)) + '\\\\')

# cumulative counts figure
fig, ax = plt.subplots(figsize=(5.9, 2.9))
n = np.array(cps)
sd = curves.std(0)
ax.fill_between(n, mean_c - sd, mean_c + sd, color=MINT, alpha=0.35, lw=0, label='random reals: mean $\\pm$ 1 s.d.')
ax.plot(n, mean_c, color=MINT, lw=1.2)
nn = np.logspace(math.log10(20), math.log10(5000), 100)
ax.plot(nn, mean_c[i1000] + C * np.log(nn / 1000), color=DGREY, ls=':', lw=0.9, label=r'slope $2\ln 2$ per $e$-fold')
styles = {'pi': (GREEN, '-'), 'e': (GOLD, '-'), 'fifth': (GREY, '-.')}
for k, (c, ls) in styles.items():
    idx = d[k]['q_prime_idx']; N = d[k]['N']
    xsx = [1] + [j for j in idx for _ in (0, 1)] + [N]
    ysx = [0] + [v for i, _ in enumerate(idx) for v in (i, i + 1)] + [len(idx)]
    ax.plot(xsx, ysx, color=c, ls=ls, lw=1.1, label=names[k] + ': prime $q_n$')
ax.plot(np.arange(1, pi['N'] + 1), pi['exp_q'], color=GREEN, ls='--', lw=0.7, label=r'$\pi$: $\sum \zeta(2)/\ln q_n$')
ax.set_xscale('log'); ax.set_xlim(1, 5000); ax.set_xlabel('convergent index $n$ (log scale)'); ax.set_ylabel('count')
ax.legend(fontsize=6.5, loc='upper left')
savefig(fig, 'prime_conv_counts')

fig, ax = plt.subplots(figsize=(4.6, 2.3))
bins = np.arange(-0.5, max(q.max(), p.max()) + 1.5)
ax.hist(q, bins=bins, color=MINT, ec='white', lw=0.4, label='random reals: prime $q_n$, $n\\leq 1000$')
for k, c in (('pi', GREEN), ('e', GOLD), ('fifth', GREY)):
    v = sum(1 for j in d[k]['q_prime_idx'] if j <= 1000)
    ax.axvline(v, color=c, lw=1.4, label=names[k])
ax.set_xlabel('number of prime denominators'); ax.set_ylabel('reals'); ax.legend(fontsize=6.5)
savefig(fig, 'prime_conv_hist')
write_macros('c7_primeconv.tex')
print(obs, robs, slope, np.std(bs))
