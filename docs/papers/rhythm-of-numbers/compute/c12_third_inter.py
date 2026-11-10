"""Chapter 17 ("A third look"), Section 17.6: prime intermediate fractions of pi.

Based on Teddy Rook's notes (November 2026).  Between the convergents p_{n-1}/q_{n-1} and p_{n+1}/q_{n+1} lie the
intermediate fractions with denominators q_{n-1} + k q_n, 1 <= k < a_{n+1} ("level n").  This script counts the
probable primes among them for every level n = 1..3,000, and separately at level 15,542 (term a_15543 = 19,055).
Method: the rhythm sieve again.  The residues of q_n modulo every prime l below the sieve limit are carried along by the
recurrence; for l not dividing q_n, l divides q_{n-1} + k q_n exactly when k = -q_{n-1}/q_n (mod l), so a whole run of
k is sieved at once.  Survivors below 10^12 are tested exactly (gmpy2.is_prime); larger ones by a strong test to base 2
and then gmpy2.is_strong_bpsw_prp (probable primes).  The expected count uses the chance (q_n/phi(q_n))/ln x for each
candidate x (the progression has the local density l/(l-1) at the primes dividing q_n, and 1 at the others;
q_n/phi(q_n) is computed from the primes below the sieve limit).
Usage: python3 c12_third_inter.py [small|big|all]   (small: levels 1..3,000, minutes; big: level 15,542, about
an hour, resumable in out/third_inter_big.json).  Writes gen/c12_third_inter.tex when both parts are done."""
import sys, os, json, math, time
import numpy as np
import gmpy2
from gmpy2 import mpz
from common import *
from c12_third_pisearch import certified_terms

MODE = sys.argv[1] if len(sys.argv) > 1 else 'all'
NSMALL = 3000; BIG = 15542
ZETA2 = math.pi ** 2 / 6


def primes_below(n):
    s = np.ones(n, dtype=bool); s[:2] = False
    for i in range(2, int(n ** .5) + 1):
        if s[i]:
            s[i * i::i] = False
    return np.nonzero(s)[0].astype(np.int64)


def inv_mod(x, P):
    """x^(P-2) mod P elementwise (P prime, x not 0 mod P); values below 10^7 so products fit in int64."""
    r = np.ones_like(P); b = x % P; e = P - 2
    while e.any():
        odd = (e & 1) == 1
        r = np.where(odd, (r * b) % P, r)
        b = (b * b) % P; e >>= 1
    return r


def sieve_level(qm1, q, a, Pr, rm1, r0):
    """Candidates k = 1..a-1 for x = qm1 + k q, sieved by the primes Pr with residues rm1 = qm1 mod Pr, r0 = q mod Pr."""
    alive = np.ones(a, dtype=bool); alive[0] = False
    ok = r0 != 0
    P = Pr[ok]
    res = (-rm1[ok] % P) * inv_mod(r0[ok], P) % P
    for l, k0 in zip(P[P < a].tolist(), res[P < a].tolist()):
        alive[k0::l] = False
    big = (P >= a) & (res >= 1) & (res < a)
    alive[res[big]] = False
    dens = float(np.prod(Pr[~ok] / (Pr[~ok] - 1.0)))   # q/phi(q) from the small primes
    return np.nonzero(alive)[0], dens


def isprp(x):
    if x < 10 ** 12:
        return gmpy2.is_prime(x)
    return gmpy2.is_strong_prp(x, 2) and gmpy2.is_strong_bpsw_prp(x)


def run_small():
    T = certified_terms(NSMALL + 2)
    Pr = primes_below(10 ** 6)
    rows = {}; tot = 0; found = 0; exp = 0.0; conv_exp = 0.0
    qm1, q = mpz(1), mpz(T[1])          # q_0, q_1
    rm1 = np.ones_like(Pr); r0 = np.full_like(Pr, T[1]) % Pr
    convp = []; found_list = []      # [level, k, remainder mod 12] of every probable prime found
    for n in range(1, NSMALL + 1):
        a = T[n + 1]
        if isprp(q):
            convp.append(n)
        conv_exp += ZETA2 / math.log(int(q)) if q > 1 else 0
        if a > 1:
            if q * a < 10 ** 12:
                ks = list(range(1, a))
                hit = [k for k in ks if gmpy2.is_prime(qm1 + k * q)]; cnt = len(hit)
                phi_ratio = float(np.prod(Pr[(r0 == 0)] / (Pr[(r0 == 0)] - 1.0))) if (r0 == 0).any() else 1.0
                e = sum(phi_ratio / math.log(int(qm1 + k * q)) for k in ks)
            else:
                ks, phi_ratio = sieve_level(qm1, q, a, Pr, rm1, r0)
                hit = [k for k in ks.tolist() if isprp(qm1 + k * q)]; cnt = len(hit)
                lq = math.log(int(q))
                e = sum(phi_ratio / (lq + math.log(k + float(qm1 / q))) for k in range(1, a))
            tot += a - 1; found += cnt; exp += e
            found_list.extend([n, int(k), int((qm1 + k * q) % 12)] for k in hit)
            if n in (1, 3, 430):
                rows[n] = dict(term=a, cand=a - 1, digits=(len(str(qm1 + q)), len(str(qm1 + (a - 1) * q))),
                               found=cnt, exp=e)
        # advance to level n + 1
        qm1, q = q, a * q + qm1
        rm1, r0 = r0, (a % Pr * r0 + rm1) % Pr
    res = dict(rows=rows, total_cand=tot, total_found=found, total_exp=exp, conv=convp, conv_exp=conv_exp,
               found_list=found_list)
    save('third_inter_small.json', res)
    print(res)
    return res


def run_big():
    fn = os.path.join(OUT, 'third_inter_big.json')
    T = certified_terms(BIG + 2)
    Pr = primes_below(10 ** 7)
    qm1, q = mpz(1), mpz(T[1]); rm1 = np.ones_like(Pr); r0 = np.full_like(Pr, T[1]) % Pr
    for n in range(1, BIG):
        a = T[n + 1]
        qm1, q = q, a * q + qm1
        rm1, r0 = r0, (a % Pr * r0 + rm1) % Pr
    a = T[BIG + 1]
    assert a == 19055, a
    ks, phi_ratio = sieve_level(qm1, q, a, Pr, rm1, r0)
    state = json.load(open(fn)) if os.path.exists(fn) else {'done': [], 'prp': []}
    done = set(state['done']); t0 = time.time()
    for k in ks.tolist():
        if k in done:
            continue
        if isprp(qm1 + k * q):
            state['prp'].append(k); print('prime at k =', k, flush=True)
        state['done'].append(k)
        if len(state['done']) % 20 == 0:
            json.dump(state, open(fn, 'w')); print(len(state['done']), '/', len(ks), round(time.time() - t0), flush=True)
    lq = math.log(int(q))
    state.update(term=a, cand=a - 1, survivors=len(ks), digits=(len(str(qm1 + q)), len(str(qm1 + (a - 1) * q))),
                 found=len(state['prp']), exp=sum(phi_ratio / (lq + math.log(k + float(qm1 / q))) for k in range(1, a)))
    json.dump(state, open(fn, 'w'))
    print(state['found'], state['exp'])
    return state


if __name__ == '__main__':
    if MODE in ('small', 'all'):
        run_small()
    if MODE in ('big', 'all'):
        run_big()
    if os.path.exists(os.path.join(OUT, 'third_inter_small.json')) and os.path.exists(os.path.join(OUT, 'third_inter_big.json')):
        sm = load('third_inter_small.json'); bg = load('third_inter_big.json')
        if len(bg['done']) == bg.get('survivors', -1):
            rows = []
            for n in ('1', '3', '430'):
                r = sm['rows'][n]
                rows.append('%s & %s & %s & %s--%s & %d & %.1f' % (commas(int(n)), commas(r['term']), commas(r['cand']),
                                                                 r['digits'][0], r['digits'][1], r['found'], r['exp']))
            rows.append('%s & %s & %s & %s--%s & %d & %.1f' % (commas(BIG), commas(bg['term']), commas(bg['cand']),
                                                             commas(bg['digits'][0]), commas(bg['digits'][1]),
                                                             bg['found'], bg['exp']))
            rows.append('all levels $1, \\dots, 3{,}000$ & & %s & & %d & %.1f' % (commas(sm['total_cand']),
                                                                               sm['total_found'], sm['total_exp']))
            macro('ThInterTable', '\\\\\n'.join(rows) + '\\\\')
            macro('ThInterTotal', sm['total_found']); macro('ThInterCand', commas(sm['total_cand']))
            macro('ThInterExp', '%.1f' % sm['total_exp'])
            macro('ThInterConv', len(sm['conv'])); macro('ThInterConvExp', '%.1f' % sm['conv_exp'])
            macro('ThInterThree', sm['rows']['3']['found']); macro('ThInterFourThirty', sm['rows']['430']['found'])
            macro('ThInterBig', bg['found']); macro('ThInterBigSurv', commas(bg['survivors']))
            write_macros('c12_third_inter.tex')
