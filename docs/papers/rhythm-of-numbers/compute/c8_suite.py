"""Chapter 9: the Continued-Fraction Suite's forms (from data/music/suite.yaml, read from the score by the
site's builders) checked against the continued fractions, and drawn as form strips."""
import os
import yaml
import mpmath as mp
from common import *

plt = style()
def _find_suite():
    d = HERE
    for _ in range(8):
        p = os.path.join(d, 'data', 'music', 'suite.yaml')
        if os.path.exists(p): return p
        d = os.path.dirname(d)
    return '/tmp/site/data/music/suite.yaml'  # the site's working copy
S = yaml.safe_load(open(_find_suite()))
mv = {m['slug']: m for m in S['movements']}
mp.mp.dps = 40
vals = {'golden': (mp.sqrt(5) - 1) / 2, 'silver': mp.sqrt(2) - 1, 'the-fifth': mp.log(1.5, 2), 'euler': mp.e - 2,
        'pi': mp.pi - 3, 'pi-bar-32996': mp.pi - 3}
info = {}
for slug, m in mv.items():
    secs = m['sections']
    total = sum(s[1] for s in secs)
    assert total == m['bars'], (slug, total)
    for s in secs:
        assert sum(s[3]) == s[1], (slug, s)
    starts = [s[0] for s in secs]
    assert all(b == a + s[1] for a, b, s in zip(starts, starts[1:], secs)), slug
    t = cf_terms(vals[slug], 20)[1:]
    _, Q = convergents([0] + t)
    info[slug] = {'terms': t[:8], 'Q': Q[:14], 'total': total, 'secs': [s[1] for s in secs]}
# the block lengths of each movement appear among the q_n
assert 89 in info['golden']['Q'] and 5 in info['golden']['Q'] and 8 in info['golden']['Q']
assert 70 in info['silver']['Q'] and 12 in info['silver']['Q'] and 29 in info['silver']['Q']
assert 53 in info['the-fifth']['Q'] and 41 in info['the-fifth']['Q'] and 12 in info['the-fifth']['Q']
assert 71 in info['euler']['Q'] and 32 in info['euler']['Q'] and 7 in info['euler']['Q']
assert 113 in info['pi']['Q'] and 7 in info['pi']['Q']
# Golden: the section sequence of 8s and 5s is the Fibonacci word (L=8, S=5)
g = ''.join('L' if x == 8 else 'S' for x in info['golden']['secs'])
fw = rhythm_word([1] * 20)[-1]
fwLS = ''.join('L' if c == '.' else 'S' for c in fw)  # complement mapping
assert g == fwLS[:len(g)] or g == ''.join('L' if c == 'x' else 'S' for c in fw)[:len(g)], g
macro('GoldenSeq', ', '.join(map(str, info['golden']['secs'])))
# Silver, Fifth, Euler decompositions
assert info['silver']['secs'] == [12, 12, 5, 12, 12, 5, 12]
assert info['the-fifth']['secs'] == [12, 12, 12, 5, 12]
assert info['euler']['secs'] == [7, 7, 7, 7, 4, 7, 7, 7, 7, 7, 4]
Pe, Qe = convergents([0] + info['euler']['terms'][:8])
assert list(zip(Pe, Qe))[4:8] == [(5, 7), (23, 32), (28, 39), (51, 71)]
pi_ = mv['pi']['sections']
assert sum(pi_[0][3]) == 105 and len(pi_[0][3]) == 15 and pi_[1][1] == 1 and pi_[2][1] == 7
assert 15 * 7 + 1 == 106 and 106 + 7 == 113
vi = mv['pi-bar-32996']
assert vi['first'] == 32968 and vi['first'] + vi['bars'] - 1 == 33017
assert 292 * 113 == 32996 and 32996 + 106 == 33102
macro('VIhours', '%.1f' % (32996 * 2.5 / 3600))
macro('SecondsPerBarPi', '%.1f' % (4 * 60 / mv['pi']['bpm']))
for slug, nm in (('golden', 'Golden'), ('silver', 'Silver'), ('the-fifth', 'Fifth'), ('euler', 'Euler'), ('pi', 'Pi'), ('pi-bar-32996', 'Six')):
    m = mv[slug]
    macro('Bars' + nm, commas(m['bars'])); macro('Key' + nm, m['key']); macro('Time' + nm, m['time'])
    macro('Tempo' + nm, m['tempo']); macro('Bpm' + nm, m['bpm'])

# form strips
fig, axs = plt.subplots(6, 1, figsize=(6.3, 4.2))
colors = {'': GREEN, 'A': GREEN, 'B': GOLD, 'rare block': MINT, 'held bar': DGREY, 'short cycle': MINT,
          'end of cycle 292': GREEN}
order = ['golden', 'silver', 'the-fifth', 'euler', 'pi', 'pi-bar-32996']
for ax, slug in zip(axs, order):
    m = mv[slug]; x = 0
    for st, ln, lab, ph in m['sections']:
        ax.add_patch(plt.Rectangle((x, 0), ln, 1, fc=colors.get(lab, GREEN), ec='white', lw=0.8))
        px = x
        for p in ph:
            ax.plot([px + p, px + p], [0.0, 0.35], color='white', lw=0.5); px += p
        x += ln
    ax.set_xlim(0, 140); ax.set_ylim(0, 1); ax.set_yticks([])
    ax.set_ylabel('%s. %s' % (m['num'], m['name']), rotation=0, ha='right', va='center', fontsize=7)
    for sp in ('left', 'bottom'): ax.spines[sp].set_visible(False)
    ax.set_xticks([]); ax.text(m['bars'] + 1, 0.5, '%d bars from bar %s' % (m['bars'], commas(m['first']).replace('{,}', ',')), va='center', fontsize=6.5, color=DGREY)
from matplotlib.patches import Patch
fig.legend(handles=[Patch(fc=GREEN, label='opening / A / long cycle'), Patch(fc=GOLD, label='B (short block)'),
                    Patch(fc=MINT, label='rare block / short cycle'), Patch(fc=DGREY, label='held bar')],
           loc='lower center', ncol=4, fontsize=6.5, bbox_to_anchor=(0.55, -0.04))
savefig(fig, 'suite_forms')
write_macros('c8_suite.tex')
print({k: (v['terms'][:6], v['Q'][:8]) for k, v in info.items()})
