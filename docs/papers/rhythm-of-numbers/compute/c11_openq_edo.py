"""Open questions, part 6 (question 6): rank the equal temperaments n = 5..200 by how well they approximate
several just intervals at once, and test whether prime n stand out.
Measures (for the 5-limit set {3/2, 5/4, 6/5} and the 7-limit set adding {7/4, 7/5, 7/6}):
  RMS     root-mean-square error in cents, each interval approximated by its nearest step;
  REL     the same in units of one step (RMS x n / 1200), the scale-free 'relative error';
  TOP     Erlich's Tenney-weighted minimax error of the patent val on primes 2,3,5(,7), octave stretched (cents);
  TOPREL  TOP in units of one step.
Prime vs composite: permutation test (two-sided, difference of means, 100,000 permutations) and Mann-Whitney.
Writes gen/c11_openq_edo.tex, out/openq_edo.json and a figure.  Runtime: under a minute."""
import math
import numpy as np
from scipy import stats
from sympy import isprime
from common import *

plt = style()
NS = np.arange(5, 201)
I5 = [(3, 2), (5, 4), (6, 5)]
I7 = I5 + [(7, 4), (7, 5), (7, 6)]
P5, P7 = [2, 3, 5], [2, 3, 5, 7]


def rms(n, ints):
    e = []
    for a, b in ints:
        x = 1200 * math.log2(a / b)
        k = round(x * n / 1200)
        e.append(1200 * k / n - x)
    return math.sqrt(sum(t * t for t in e) / len(e))


def top(n, primes):
    r = [round(n * math.log2(p)) / (n * math.log2(p)) for p in primes]  # 1 + proportional error of the patent val
    return 1200 * (max(r) - min(r)) / (max(r) + min(r))


M = {}
for lim, ints, prs in (('5', I5, P5), ('7', I7, P7)):
    M['RMS' + lim] = np.array([rms(n, ints) for n in NS])
    M['REL' + lim] = M['RMS' + lim] * NS / 1200
    M['TOP' + lim] = np.array([top(n, prs) for n in NS])
    M['TOPREL' + lim] = M['TOP' + lim] * NS / 1200
# sanity: 12-EDO fifth 1.955 cents flat, third 13.686 sharp; 53-EDO and 31-EDO known values
assert abs(rms(12, [(3, 2)]) - 1.955) < 1e-3 and abs(rms(12, [(5, 4)]) - 13.686) < 1e-3
assert abs(rms(31, [(5, 4)]) - 0.783) < 1e-3

isp = np.array([isprime(int(n)) for n in NS])
rng = np.random.default_rng(20261105)
out = {}
for k, v in M.items():
    diff = v[isp].mean() - v[~isp].mean()
    perm = np.empty(100000)
    for i in range(len(perm)):
        s = rng.permutation(isp)
        perm[i] = v[s].mean() - v[~s].mean()
    p_perm = float((np.abs(perm) >= abs(diff) - 1e-15).mean())
    p_mw = float(stats.mannwhitneyu(v[isp], v[~isp]).pvalue)
    order = NS[np.argsort(v, kind='stable')]
    top20 = order[:20].tolist()
    nprime20 = sum(isprime(int(n)) for n in top20)
    # hypergeometric: chance of at least this many primes in a random 20-set
    p_hyp = float(stats.hypergeom.sf(nprime20 - 1, len(NS), int(isp.sum()), 20))
    out[k] = {'diff': float(diff), 'mean_p': float(v[isp].mean()), 'mean_c': float(v[~isp].mean()),
              'p_perm': p_perm, 'p_mw': p_mw, 'top20': top20, 'primes_top20': nprime20, 'p_hyp': p_hyp}
    print(k, out[k])
save('openq_edo.json', out)

macro('OqEdoPrimes', int(isp.sum())); macro('OqEdoCount', len(NS))
macro('OqEdoExpTop', '%.1f' % (20 * isp.mean()))
names = {'RMS5': 'RMS, 5-limit', 'RMS7': 'RMS, 7-limit', 'REL5': 'relative, 5-limit', 'REL7': 'relative, 7-limit',
         'TOP5': 'TOP, 5-limit', 'TOP7': 'TOP, 7-limit', 'TOPREL5': 'TOP relative, 5-limit', 'TOPREL7': 'TOP relative, 7-limit'}
rows = []
for k in ('RMS5', 'RMS7', 'TOP5', 'TOP7', 'REL5', 'REL7', 'TOPREL5', 'TOPREL7'):
    x = out[k]
    tops = ', '.join(('\\textbf{%d}' % n) if isprime(n) else str(n) for n in x['top20'])
    rows.append('%s & %s \\\\' % (names[k], tops))
macro('OqEdoTopTable', '\n'.join(rows))
rows = []
for k in ('REL5', 'REL7', 'TOPREL5', 'TOPREL7', 'RMS5', 'RMS7'):
    x = out[k]
    rows.append('%s & %.3f & %.3f & %.2f & %.2f & %d & %.2f' % (names[k], x['mean_p'], x['mean_c'], x['p_perm'], x['p_mw'],
                                                              x['primes_top20'], x['p_hyp']))
macro('OqEdoTestTable', '\\\\\n'.join(rows) + '\\\\')
# zeta-function record EDOs (OEIS A117536) between 5 and 200
zeta = [5, 7, 10, 12, 19, 22, 27, 31, 41, 53, 72, 99, 118, 130, 152, 171]
macro('OqZetaEdos', ', '.join(map(str, zeta)))
macro('OqZetaInTop', sum(1 for n in zeta if n in out['RMS7']['top20']))

fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.4), gridspec_kw={'width_ratios': [1.6, 1]})
ax = axs[0]
v = M['REL7']
ax.plot(NS[~isp], v[~isp], 'o', ms=2.2, color=LGREY, label='composite $n$')
ax.plot(NS[isp], v[isp], 'o', ms=2.8, color=GREEN, label='prime $n$')
for n in (12, 31, 41, 53, 72, 99, 140, 171):
    ax.annotate(str(n), (n, v[n - 5]), xytext=(0, -8), textcoords='offset points', ha='center', fontsize=6, color=GOLD)
ax.set_xlabel('notes per octave $n$'); ax.set_ylabel('relative RMS error (steps)')
ax.set_title('7-limit, six intervals', fontsize=8); ax.legend(fontsize=6.5, loc='upper center', ncol=2, bbox_to_anchor=(0.5, 1.22))
ax.set_ylim(-0.04, 0.42)
ax = axs[1]
bins = np.linspace(0, 0.4, 17)
ax.hist(v[~isp], bins=bins, density=True, color=LGREY, label='composite')
ax.hist(v[isp], bins=bins, density=True, histtype='step', color=GREEN, lw=1.3, label='prime')
ax.set_xlabel('relative RMS error'); ax.set_ylabel('density'); ax.legend(fontsize=6.5)
savefig(fig, 'openq_edo')
write_macros('c11_openq_edo.tex')
