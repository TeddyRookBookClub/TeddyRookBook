# Usage: python3 scripts/build_imperium_maps.py static/games/imperium/maps.js
# Builds the three game maps (Italy, Mediterranean, Aegean) from hand-placed coastlines and region centres.
# Coast polylines are listed with LAND ON THE LEFT (counter-clockwise round islands, in lon/lat with north up).
import sys, json, math, random
import numpy as np
from scipy.spatial import Voronoi, cKDTree

def blob(lon, lat, rx, ry, n=10):
    return [(lon + rx * math.cos(2 * math.pi * i / n), lat + ry * math.sin(2 * math.pi * i / n)) for i in range(n)] + [(lon + rx, lat)]

def build(name, bbox, coasts, terr, wild, links, d, cols=150, sea=()):
    lon0, lat0, lon1, lat1 = bbox
    k = math.cos(math.radians((lat0 + lat1) / 2)); S = 1000 / ((lon1 - lon0) * k)
    P = lambda p: ((p[0] - lon0) * k * S, (lat1 - p[1]) * S)
    W, H = 1000, (lat1 - lat0) * S
    seeds, kind = [], []   # kind: 'L' coast land, 'S' sea, or ('T', id) / 'W'
    step = d * S; off = step * 0.55
    for line in coasts:
        pts = [P(p) for p in line]
        for a, b in zip(pts, pts[1:]):
            L = math.hypot(b[0] - a[0], b[1] - a[1]); n = max(1, int(round(L / step)))
            tx, ty = (b[0] - a[0]) / L, (b[1] - a[1]) / L
            # left of travel direction; screen y points down, so left in lon/lat = (ty, -tx) on screen
            nx, ny = ty, -tx
            for i in range(n):
                t = (i + 0.5) / n; x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                seeds.append((x + nx * off, y + ny * off)); kind.append('L')
                seeds.append((x - nx * off, y - ny * off)); kind.append('S')
    for p in sea: seeds.append(P(p)); kind.append('S')
    tseeds, tid = [], []
    for t in terr:
        for p in t['pts']: tseeds.append(P(p)); tid.append(t['id']); seeds.append(P(p)); kind.append('L')
    for p in wild: tseeds.append(P(p)); tid.append('~'); seeds.append(P(p)); kind.append('L')
    T1 = cKDTree(np.array(seeds)); T2 = cKDTree(np.array(tseeds))
    rnd = random.Random(7); g = W / cols; M = 4
    pts, own = [], []
    nx_, ny_ = int(W / g) + 2 * M, int(H / g) + 2 * M
    for j in range(ny_):
        for i in range(nx_):
            x = (i - M + 0.5 + (rnd.random() - .5) * .7) * g; y = (j - M + 0.5 + (rnd.random() - .5) * .7) * g
            pts.append((x, y))
            if i < 2 or j < 2 or i >= nx_ - 2 or j >= ny_ - 2: own.append('#'); continue
            _, a = T1.query((x, y))
            if kind[a] == 'S': own.append(''); continue
            _, b = T2.query((x, y)); own.append(tid[b])
    vor = Voronoi(np.array(pts)); V = vor.vertices
    segs = {}; shared = {}
    for (p, q), (a, b) in zip(vor.ridge_points, vor.ridge_vertices):
        if a < 0 or b < 0: continue
        o1, o2 = own[p], own[q]
        if o1 == o2: continue
        for o in (o1, o2):
            if o and o != '#': segs.setdefault(o, []).append((a, b))
        if o1 and o2 and o1 not in '~#' and o2 not in '~#':
            key = tuple(sorted((o1, o2))); shared[key] = shared.get(key, 0) + math.hypot(*(V[a] - V[b]))
    def path(sg):
        nb = {}
        for a, b in sg: nb.setdefault(a, []).append(b); nb.setdefault(b, []).append(a)
        out = []
        used = set()
        for a, b in sg:
            if (a, b) in used or (b, a) in used: continue
            loop = [a]; prev, cur = a, b; used.add((a, b))
            while cur != a:
                loop.append(cur)
                nxt = [n for n in nb[cur] if (cur, n) not in used and (n, cur) not in used]
                if not nxt: break
                n = nxt[0]; used.add((cur, n)); prev, cur = cur, n
            if len(loop) < 3: continue
            m = lambda u, v: ((V[u][0] + V[v][0]) / 2, (V[u][1] + V[v][1]) / 2)
            f = lambda x: str(int(round(x)))
            s0 = m(loop[-1], loop[0]); s = 'M%s %s' % (f(s0[0]), f(s0[1]))
            for i, v in enumerate(loop):
                e = m(v, loop[(i + 1) % len(loop)])
                s += 'Q%s %s %s %s' % (f(V[v][0]), f(V[v][1]), f(e[0]), f(e[1]))
            out.append(s + 'Z')
        return ''.join(out)
    T = {}
    for t in terr:
        if t['id'] not in segs: raise SystemExit('no land for ' + t['id'])
        x, y = P(t.get('at') or t['pts'][0])
        T[t['id']] = {'d': path(segs[t['id']]), 'x': round(x, 1), 'y': round(y, 1)}
    adj = sorted([list(kk) for kk, L in shared.items() if L > g * 1.2])
    for a, b in links:
        assert a in T and b in T, (a, b)
    print(name, 'territories', len(T), 'borders', len(adj), 'links', len(links), 'size', round(H))
    deg = {t: 0 for t in T}
    for a, b in adj + [list(l) for l in links]: deg[a] += 1; deg[b] += 1
    print('  isolated:', [t for t in deg if deg[t] == 0], ' adjacency:', {a: sorted([y if x == a else x for x, y in adj + [list(l) for l in links] if a in (x, y)]) for a in T})
    return {'w': W, 'h': round(H), 'terr': T, 'wild': path(segs.get('~', [])), 'adj': adj, 'links': [list(l) for l in links]}

MAPS = {}
exec(open(__file__.replace('build_maps.py', 'mapdata.py').replace('build_imperium_maps.py', 'imperium_mapdata.py')).read())
open(sys.argv[1], 'w').write('/* Generated by scripts/build_imperium_maps.py. Do not edit by hand. */\nwindow.IMPERIUM_MAPS=' + json.dumps(MAPS, separators=(',', ':')) + ';\n')
