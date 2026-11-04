"""Chapter 8: self-similarity. Complete quotients (Teddy Rook's picture), Ford circles, the Stern-Brocot
path, Minkowski's ?(x), Cantor dust of bounded continued fractions and its Hausdorff dimension
(transfer operator), the Mandelbrot set's Farey bulbs, the Fibonacci word fractal, and the six Suite
numbers drawn as square-cutting spirals."""
import math
from fractions import Fraction
import numpy as np
import mpmath as mp
from common import *

plt = style()
mp.mp.dps = 60
terms = load('terms.json')
PI = +mp.pi

# ---------- complete quotients and nested errors ----------
x = PI; cq = []
for i in range(12):
    a = int(mp.floor(x)); cq.append(float(x)); x = 1 / (x - a)
P, Q = convergents(terms['pi'][:14])
errs = [float(abs(PI - mp.mpf(p) / q)) for p, q in zip(P, Q)]
fig, axs = plt.subplots(1, 2, figsize=(6.2, 2.3))
axs[0].bar(range(12), cq, color=[GOLD if c > 100 else GREEN for c in cq], width=0.7)
axs[0].set_yscale('log'); axs[0].set_xlabel('level $n$'); axs[0].set_ylabel('complete quotient $x_n$')
for i, c in enumerate(cq[:6]):
    axs[0].text(i, c * 1.25, '%.4g' % c, ha='center', fontsize=6)
axs[1].semilogy(range(len(errs)), errs, 'o-', color=GREEN, ms=3, lw=0.8, label=r'$|\pi - p_n/q_n|$')
axs[1].semilogy(range(len(errs)), [1 / q ** 2 for q in Q], 's--', color=GOLD, ms=2.5, lw=0.7, label=r'$1/q_n^2$')
axs[1].set_xlabel('convergent $n$'); axs[1].legend(fontsize=7)
axs[0].set_xticks(range(0, 12, 2)); axs[1].set_xticks(range(0, 14, 2))
savefig(fig, 'nested_tail')
macro('CQsix', ', '.join('%.4f' % c for c in cq[1:7]))

# ---------- Ford circles ----------
fig, axs = plt.subplots(1, 2, figsize=(6.3, 2.2))
def ford(ax, lo, hi, qmax, hl=(), xmark=None):
    for q in range(1, qmax + 1):
        for p in range(math.floor(lo * q) - 1, math.ceil(hi * q) + 2):
            if math.gcd(p, q) != 1: continue
            r = 1 / (2 * q * q); xc = p / q
            if xc + r < lo or xc - r > hi: continue
            hit = Fraction(p, q) in hl
            ax.add_patch(plt.Circle((xc, r), r, fill=hit, fc=MINT if hit else 'none', ec=GREEN if hit else GREY,
                                    lw=0.8 if hit else 0.35))
    if xmark is not None: ax.axvline(xmark, color=GOLD, lw=0.8)
    ax.set_xlim(lo, hi); ax.set_aspect('equal'); ax.set_yticks([])
conv = [Fraction(p, q) for p, q in zip(P, Q)]
convfrac = [c - 3 for c in conv]
ford(axs[0], 0.105, 0.18, 60, hl=set(convfrac[:4]), xmark=float(PI - 3))
axs[0].set_ylim(0, 0.0212); axs[0].set_xlabel(r'$x$ (gold line: $\pi-3$)')
axs[0].set_xticks([1 / 9, 1 / 7, 1 / 6]); axs[0].set_xticklabels(['1/9', '1/7', '1/6'])
ford(axs[1], 0.14143, 0.14167, 900, hl=set(convfrac[:6]), xmark=float(PI - 3))
axs[1].set_ylim(0, 9.0e-5); axs[1].set_xlabel('zoom near $15/106$ and $16/113$')
axs[1].set_xticks([15 / 106, 16 / 113]); axs[1].set_xticklabels(['15/106', '16/113'])
savefig(fig, 'ford_circles')
# which circles does the vertical line through pi-3 pierce?  |x - p/q| < 1/(2q^2)
pierced = [c for c in convfrac[:10] if abs(float(PI - 3) - c) < 1 / (2 * c.denominator ** 2)]
macro('Pierced', ', '.join('%d/%d' % (c.numerator, c.denominator) for c in pierced[:5]))

# ---------- Stern-Brocot path ----------
def sb_path(x, steps):
    a, b, c, d = 0, 1, 1, 0  # left a/b, right c/d
    path = []
    for _ in range(steps):
        m = Fraction(a + c, b + d)
        if x < m: path.append('L'); c, d = a + c, b + d
        elif x > m: path.append('R'); a, b = a + c, b + d
        else: path.append('*'); break
    return ''.join(path)
def runs(s):
    out = []; prev = None
    for ch in s:
        if ch == prev: out[-1][1] += 1
        else: out.append([ch, 1]); prev = ch
    return out
p355 = sb_path(Fraction(355, 113), 40)
assert p355 == 'R' * 3 + 'L' * 7 + 'R' * 15 + '*'
ppi = sb_path(Fraction(int(mp.floor(PI * 10 ** 40)), 10 ** 40), 330)
r = runs(ppi)
assert [n for _, n in r[:5]] == [3, 7, 15, 1, 292]
# tree figure: depth 5 with path to 22/7 / 355/113 highlighted (first 6 steps)
fig, ax = plt.subplots(figsize=(6.2, 2.7))
def draw(lo, hi, depth, xpos, w, maxd, path, node_path=''):
    m = Fraction(lo[0] + hi[0], lo[1] + hi[1])
    on = path.startswith(node_path)
    ax.text(xpos, -depth, '%d/%d' % (m.numerator, m.denominator), ha='center', va='center', fontsize=6.5 if depth < 4 else 5.2,
            color=GREEN if on else DGREY, fontweight='bold' if on else 'normal',
            bbox=dict(boxstyle='round,pad=0.15', fc=MINT if on else 'white', ec='none', alpha=0.6 if on else 0))
    if depth == maxd: return
    for side, nlo, nhi, dx in (('L', lo, (m.numerator, m.denominator), -w), ('R', (m.numerator, m.denominator), hi, w)):
        child_on = path.startswith(node_path + side)
        ax.plot([xpos, xpos + dx], [-depth - 0.18, -depth - 0.82], color=GREEN if child_on else LGREY, lw=1.1 if child_on else 0.5)
        draw(nlo, nhi, depth + 1, xpos + dx, w / 2, maxd, path, node_path + side)
draw((0, 1), (1, 0), 0, 0, 8, 4, 'RRRL')
ax.set_xlim(-16.5, 16.5); ax.set_ylim(-4.6, 0.6); ax.axis('off')
savefig(fig, 'stern_brocot')
macro('SBPiRuns', ' '.join('%s^{%d}' % (s, n) if n > 1 else s for s, n in r[:7]))

# ---------- Minkowski ? ----------
def qmark_terms(t):
    s = 0.0; acc = 0; sign = 1
    for a in t:
        acc += a; s += sign * 2.0 ** (1 - acc); sign = -sign
        if acc > 60: break
    return s
def cf_of(xv, n=40):
    t = []
    for _ in range(n):
        if xv <= 1e-15: break
        y = 1 / xv; a = int(y); t.append(a); xv = y - a
    return t
xs = np.linspace(1e-6, 1 - 1e-6, 4001)
ys = [qmark_terms(cf_of(v)) for v in xs]
fig, axs = plt.subplots(1, 2, figsize=(6.0, 2.6))
axs[0].plot(xs, ys, color=GREEN, lw=0.9); axs[0].plot([0, 1], [0, 1], ls='--', color=LGREY, lw=0.6)
axs[0].set_xlabel('$x$'); axs[0].set_ylabel('$?(x)$'); axs[0].set_aspect('equal')
xz = np.linspace(0.38, 0.42, 3001); yz = [qmark_terms(cf_of(v)) for v in xz]
axs[1].plot(xz, yz, color=GREEN, lw=0.9); axs[1].set_xlabel('$x$ (zoom)')
axs[0].add_patch(plt.Rectangle((0.38, min(yz)), 0.04, max(yz) - min(yz), fill=False, ec=GOLD, lw=0.7))
for v, lab in ((float((mp.sqrt(5) - 1) / 2), r'$\varphi-1\mapsto 2/3$'), (float(mp.sqrt(2) - 1), r'$\sqrt{2}-1\mapsto 2/5$')):
    axs[0].plot(v, qmark_terms(cf_of(v)), 'o', ms=3.5, color=GOLD)
    axs[0].annotate(lab, (v, qmark_terms(cf_of(v))), xytext=(5, -10), textcoords='offset points', fontsize=6.5)
savefig(fig, 'minkowski')
qm = {'phi': qmark_terms([1] * 80), 'sqrt2': qmark_terms([2] * 60), 'pi': qmark_terms(terms['pi'][1:40])}
assert abs(qm['phi'] - 2 / 3) < 1e-12 and abs(qm['sqrt2'] - 0.4) < 1e-12
macro('QPi', '%.8f' % qm['pi'])

# ---------- Cantor dust: dimension by the transfer operator ----------
def dim_E(A, n=40):
    """Hausdorff dimension of {x in (0,1): all CF terms in A}: s with spectral radius of L_s = 1,
    L_s f(x) = sum_a (a+x)^(-2s) f(1/(a+x)), Chebyshev collocation on [0,1] (as in Jenkinson-Pollicott)."""
    k = np.arange(n); xk = 0.5 + 0.5 * np.cos(np.pi * (2 * k + 1) / (2 * n))
    V = np.polynomial.chebyshev.chebvander(2 * xk - 1, n - 1)
    Vi = np.linalg.inv(V)
    def rho(s):
        Mx = np.zeros((n, n))
        for a in A:
            y = 1 / (a + xk)
            W = np.polynomial.chebyshev.chebvander(2 * y - 1, n - 1) @ Vi
            Mx += ((a + xk) ** (-2 * s))[:, None] * W
        return max(abs(np.linalg.eigvals(Mx)))
    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if rho(mid) > 1: lo = mid
        else: hi = mid
    return (lo + hi) / 2
d12 = dim_E([1, 2]); d12b = dim_E([1, 2], 60)
assert abs(d12 - 0.5312805062772051) < 1e-10, d12
macro('DimEtwo', '%.12f' % d12b)
dims = {s: dim_E(list(range(1, s + 1))) for s in (3, 4, 5, 6)}
d23 = dim_E([2, 3])
macro('DimEthree', '%.5f' % dims[3]); macro('DimEfour', '%.5f' % dims[4]); macro('DimEsix', '%.5f' % dims[6])
macro('DimTwoThree', '%.5f' % d23)
# Cantor dust picture: intervals of numbers whose first k terms are in {1,2}
fig, ax = plt.subplots(figsize=(5.8, 1.9))
def intervals(A, depth):
    out = []
    def rec(t, d):
        if d == depth:
            p0, q0, p1, q1 = 1, 0, 0, 1
            for a in t: p0, p1 = p1, a * p1 + p0; q0, q1 = q1, a * q1 + q0
            e1 = Fraction(p1, q1); e2 = Fraction(p1 + p0, q1 + q0)
            out.append((float(min(e1, e2)), float(max(e1, e2)))); return
        for a in A: rec(t + [a], d + 1)
    rec([], 0); return out
for d in range(1, 8):
    for (u, v) in intervals([1, 2], d):
        ax.plot([u, v], [-d, -d], color=GREEN if d < 7 else GOLD, lw=3.0, solid_capstyle='butt')
ax.set_xlim(0.25, 1.0); ax.set_yticks([-d for d in range(1, 8)]); ax.set_yticklabels(['%d' % d for d in range(1, 8)])
ax.set_ylabel('terms fixed'); ax.set_xlabel('$x$'); ax.spines['left'].set_visible(False)
savefig(fig, 'cantor_dust')

# ---------- Mandelbrot bulbs ----------
W_, H_ = 900, 760
xr = np.linspace(-2.1, 0.6, W_); yr = np.linspace(-1.15, 1.15, H_)
C = xr[None, :] + 1j * yr[:, None]
Z = np.zeros_like(C); it = np.zeros(C.shape)
alive = np.ones(C.shape, bool)
for i in range(200):
    Z[alive] = Z[alive] ** 2 + C[alive]
    esc = alive & (np.abs(Z) > 2)
    it[esc] = i; alive &= ~esc
img = np.where(alive, 1.0, 0.0)
fig, ax = plt.subplots(figsize=(4.6, 3.9))
ax.imshow(img, origin='lower', extent=[xr[0], xr[-1], yr[0], yr[-1]], cmap=plt.matplotlib.colors.ListedColormap(['white', GREEN]))
def period_at(c, n=20000):
    z = 0j
    for _ in range(n): z = z * z + c
    orb = [z]
    for k in range(1, 60):
        z = z * z + c
        if abs(z - orb[0]) < 1e-7: return k
    return None
bad = 0
for q in range(2, 13):
    for p in range(1, q):
        if math.gcd(p, q) != 1: continue
        t = 2 * np.pi * p / q
        c0 = np.exp(1j * t) / 2 - np.exp(2j * t) / 4
        # step a little outward (away from the main cardioid) into the bulb
        n_out = c0 - (np.exp(1j * (t + 1e-6)) / 2 - np.exp(2j * (t + 1e-6)) / 4)
        nrm = (np.exp(1j * t) - np.exp(2j * t)) / 2  # c'(t)/i: the outward normal of the cardioid
        cin = c0 + 0.5 * math.sin(math.pi * p / q) / q ** 2 * nrm / abs(nrm)
        if period_at(cin) != q: bad += 1
        if q <= 5 or (p, q) in ((3, 8), (5, 13), (1, 7), (2, 7)):
            off = 0.85 if q == 2 else 0.35
            ax.annotate('%d/%d' % (p, q), (c0.real, c0.imag), xytext=(c0.real + off * nrm.real / abs(nrm), c0.imag + off * nrm.imag / abs(nrm) + (0.25 if q == 2 else 0)),
                        fontsize=6.5, color=DGREY, ha='center', arrowprops=dict(arrowstyle='-', lw=0.4, color=GOLD))
macro('BulbMismatch', bad)
ax.set_xlabel('Re $c$'); ax.set_ylabel('Im $c$'); ax.set_aspect('equal')
savefig(fig, 'mandelbrot_bulbs', raster=True)

# ---------- Fibonacci word fractal and relatives ----------
def path_of(word, n):
    pts = [(0, 0)]; d = 0; xx = yy = 0
    dirs = [(1, 0), (0, 1), (-1, 0), (0, -1)]
    for k in range(1, n + 1):
        dx, dy = dirs[d]; xx += dx; yy += dy; pts.append((xx, yy))
        if word[k - 1] == '0':  # Monnerot-Dumaine: turn on a 0 at position k (left if k even, right if odd)
            d = (d + (1 if k % 2 == 0 else -1)) % 4
    return np.array(pts)
def fibword(n):
    a, b = '0', '01'
    while len(b) < n: a, b = b, b + a
    return b[:n]
fw = fibword(30000)
# the Fibonacci word is the complement of the beat word of phi-1 (hit 'x' <-> 1)
beat = rhythm_word([1] * 30)[-1][:30000]
comp = ''.join('0' if c == 'x' else '1' for c in beat)
assert comp == fw[:len(comp)], 'Fibonacci word = complemented beat word'
def word01(ft, n):
    j = 1
    while len(rhythm_word(ft[:j])[-1]) < n: j += 1
    return ''.join('0' if c == 'x' else '1' for c in rhythm_word(ft[:j])[-1][:n])
fig, axs = plt.subplots(1, 3, figsize=(6.3, 2.4))
for ax, (nm, w, n) in zip(axs, ((r'$\varphi-1$ (Fibonacci word), 10,946 steps', fw, 10946),
                                (r'$\sqrt{2}-1$, 13,860 steps', word01([2] * 30, 13860), 13860),
                                (r'$e-2$, 16,000 steps', word01(terms['e'][1:30], 16000), 16000))):
    pt = path_of(w, n)
    ax.plot(pt[:, 0], pt[:, 1], color=GREEN, lw=0.35)
    ax.set_aspect('equal'); ax.axis('off'); ax.set_title(nm, fontsize=7)
savefig(fig, 'fibonacci_word', raster=True)
macro('FibDim', '%.4f' % (3 * math.log((1 + math.sqrt(5)) / 2) / math.log(1 + math.sqrt(2))))

# ---------- six numbers as square-cutting spirals ----------
six = [('I. Golden', r'$\varphi-1$', (mp.sqrt(5) - 1) / 2), ('II. Silver', r'$\sqrt{2}-1$', mp.sqrt(2) - 1),
       ('III. The Fifth', r'$\log_2(3/2)$', mp.log(1.5, 2)), ('IV. Euler', '$e-2$', mp.e - 2),
       ('V. Pi', r'$\pi-3$', mp.pi - 3), ('VI. Pi, bar 32,996', r'$\pi-3$, zoomed', None)]
fig, axs = plt.subplots(1, 6, figsize=(6.4, 3.3))
for ax, (title, lab, val) in zip(axs, six):
    zoom = val is None
    xv = mp.pi - 3 if zoom else val
    cqs = []
    y = 1 / xv
    for _ in range(9):
        cqs.append(y); a = mp.floor(y); y = 1 / (y - a)
    rows = cqs[3:9] if zoom else cqs[:6]
    lv0 = 4 if zoom else 1
    for r_i, xn in enumerate(rows):
        a = int(mp.floor(xn)); h = 1 / float(xn)   # a rectangle 1 wide, h tall holds a squares of side h
        y0 = -r_i * 1.25
        # draw the 1 x h rectangle scaled to height 1: squares of width h/h... use width 1, height 1, squares of width h
        for i in range(a):
            ax.add_patch(plt.Rectangle((i * h, y0), h, 1, fc=GOLD if a > 50 else (GREEN if i % 2 == 0 else MINT), ec='white' if a <= 50 else 'none', lw=0.3))
        ax.add_patch(plt.Rectangle((a * h, y0), 1 - a * h, 1, fc='#d9d9d9', ec='none'))
        ax.text(-0.04, y0 + 0.5, str(a), ha='right', va='center', fontsize=6.5, color=DGREY)
    ax.set_xlim(-0.3, 1.02); ax.set_ylim(-6 * 1.25 + 0.15, 1.05)
    ax.axis('off'); ax.set_title(title.replace('. ', '.\n', 1) + '\n' + lab, fontsize=6.8)
savefig(fig, 'six_squares', raster=True)
write_macros('c6_fractals.tex')
print('dims', d12, d12b, dims, d23, 'bulb mismatches', bad, 'Qpi', qm['pi'])
