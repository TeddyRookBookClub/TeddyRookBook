#!/usr/bin/env python3
"""
spot-check.py: compare a few tile pixels with the raw SWOT grid, reading only the rows needed with HTTP Range requests
(no big download). Run after make-tiles.py:

  python3 scripts/ocean/spot-check.py --tiles static/earth/ocean-floor --cacert <CA bundle with the emSign roots>

For each point it prints the decoded tile value and the raw grid's 3 x 3 neighborhood (tiles average a little, so expect
agreement to within a few units, not exactly).
"""
import argparse, io, json, math, os, ssl, urllib.request
import numpy as np
from PIL import Image

URL = "https://topex.ucsd.edu/pub/global_grav_1min_SWOT/{}_{}.img"
NCOL, Y0 = 21600, 144.0
POINTS = [(-155.6, 19.4), (172.0, 32.0), (-96.5, -5.0), (142.6, 11.4), (95.0, -46.0), (-30.0, 0.5), (-57.0, -44.0), (-36.0, -65.0)]


def merc(lat):
    return math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tiles", required=True)
    ap.add_argument("--cacert", required=True)
    a = ap.parse_args()
    ctx = ssl.create_default_context(cafile=a.cacert)
    man = json.load(open(os.path.join(a.tiles, "manifest.json")))
    ver = man["version"]
    for lk, fname in (("vgg", "curv"), ("grav", "grav")):
        L = man["layers"][lk]
        k = math.asinh(L["vmax"] / L["a"]) / 127
        have = {int(z): {tuple(t) for t in ts} for z, ts in L["tiles"].items()}
        for lon, lat in POINTS:
            row = int((Y0 - merc(lat)) * 60)
            col = int((lon % 360) * 60)
            req = urllib.request.Request(URL.format(fname, ver), headers={"Range": f"bytes={(row - 1) * NCOL * 2}-{(row + 2) * NCOL * 2 - 1}"})
            raw = np.frombuffer(urllib.request.urlopen(req, context=ctx).read(), dtype=">i2").reshape(3, NCOL)
            cols = [(col + d) % NCOL for d in (-1, 0, 1)]
            rv = raw[:, cols].astype(float) * 0.1
            z, tx, ty = 0, 0.0, 0.0
            for zz in sorted(have, reverse=True):
                n = 1 << zz
                tx, ty = (lon + 180) / 360 * n, (180 - merc(lat)) / 360 * n
                if (int(tx), int(ty)) in have[zz]:
                    z = zz
                    break
            c = int(np.asarray(Image.open(os.path.join(a.tiles, "tiles", lk, str(z), str(int(tx)), f"{int(ty)}.png")))[int((ty % 1) * 256), int((tx % 1) * 256)])
            dec = "land" if c == 0 else f"{L['a'] * math.sinh((c - 128) * k):8.1f}"
            print(f"{lk:4s} z{z} ({lon:7.2f},{lat:6.2f}) tile {dec:>8s}   raw center {rv[1, 1]:8.1f}  3x3 mean {rv.mean():8.1f}")


if __name__ == "__main__":
    main()
