"""Chapter 12: numbers for the Connections chapter (drum modes from Bessel zeros, shell capacities)."""
from scipy.special import jn_zeros
from common import *
j = sorted([(jn_zeros(m, 2)[n], m, n + 1) for m in range(4) for n in range(2)])
base = j[0][0]
r = [x[0] / base for x in j[:4]]
macro('DrumRatios', ' : '.join(['1'] + ['%.2f' % v for v in r[1:]]))
assert [(m, n) for _, m, n in j[:4]] == [(0, 1), (1, 1), (2, 1), (0, 2)]
macro('ShellCaps', ', '.join(str(2 * n * n) for n in range(1, 5)))
assert sum(2 * (2 * l + 1) for l in range(4)) == 32
write_macros('c10_connections.tex')
print(r)
