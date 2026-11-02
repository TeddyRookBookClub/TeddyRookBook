#!/usr/bin/env python3
"""
make-tiles.py: the map tiles for /earth-and-space/ocean-floor-gravity/ ("Mapping the Ocean Floor with Gravity").

What it makes (in static/earth/ocean-floor/, see OUT below):
  tiles/<layer>/<z>/<x>/<y>.png   256 px Web Mercator tiles, 8-bit grayscale. Each pixel is a CODE, not a color:
                                  0 = land or no data; 1..255 = a value, companded with asinh (see encode()) so small
                                  values keep about 0.7 E of precision and big ones still fit. The page colors them in
                                  the browser (static/earth/ocean-floor/of.js decodes them with the same formula).
  compare/<id>-swot.png, compare/<id>-v33.png
                                  the before-and-after pairs: the same box from SWOT and from the older V33 grid, same
                                  projection, same scale, same coding.
  manifest.json                   version, coding, regions, tile lists (the page asks only for tiles that exist).

Sources (cite them; the page and data/credits.yaml do):
  SWOT gravity grids, Scripps Institution of Oceanography (D. Sandwell, Y. Yu):
    https://topex.ucsd.edu/pub/global_grav_1min_SWOT/   curv_SWOT_<v>.img (VGG, Eotvos*10), grav_SWOT_<v>.img (mGal*10)
    The .img files are raw big-endian int16, 21600 columns x 17280 rows, 1 arc-minute in longitude starting at 0 E,
    spherical Mercator rows from +80.738 to -80.738 latitude (Mercator y from +144 to -144 "degrees"). That is exactly a
    piece of the Web Mercator plane at 21600 px per 360 degrees, so tiles are a plain resampling (no reprojection).
    Over land the grids still hold values; we mask land with Natural Earth.
  Older grid for the comparison: IGPP VGG V33 served by GMT as @earth_vgg_01m_p (JPEG 2000 tiles, 30 x 30 degrees,
    named by their south-west corner, pixel registered, value = (raw - 32768) * 0.03125 + 100 Eotvos):
    https://oceania.generic-mapping-tools.org/server/earth/earth_vgg/earth_vgg_01m_p/
  Land: Natural Earth 1:10m land and Antarctic ice shelves (public domain):
    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_antarctic_ice_shelves_polys.geojson

How to re-run (for a new SWOT version, change VERSION and the file names; keep the coding unless the page changes too):
  CA=<a CA bundle that includes the emSign roots, e.g. certifi's>
  mkdir -p raw && cd raw
  curl --cacert $CA -O https://topex.ucsd.edu/pub/global_grav_1min_SWOT/curv_SWOT_06.img     # ~712 MB
  curl --cacert $CA -O https://topex.ucsd.edu/pub/global_grav_1min_SWOT/grav_SWOT_06.img     # ~712 MB (optional layer)
  curl --cacert $CA -O https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
  curl --cacert $CA -O https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_antarctic_ice_shelves_polys.geojson
  for t in S30W120 S60E090; do curl --cacert $CA -O \
      https://oceania.generic-mapping-tools.org/server/earth/earth_vgg/earth_vgg_01m_p/$t.earth_vgg_01m_p.jp2; done
  cd .. && python3 /tmp/site/scripts/ocean/make-tiles.py --raw raw --out /tmp/site/static/earth/ocean-floor
  (one layer at a time works too: --layers vgg, then --layers grav; the manifest keeps the other layer's entry.)
  Then delete raw/. Needs numpy and Pillow (with JPEG 2000). Peak memory is about 4 GB.
  --check prints decoded tile values next to the raw grid at a few points (the spot check).
"""
import argparse, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw

Image.MAX_IMAGE_PIXELS = None

VERSION = "SWOT_06"            # README_SWOT_06.txt, September 15, 2026
NCOL, NROW = 21600, 17280      # .img grid
Y0 = 144.0                     # Mercator "degrees" at the top row (latitude 80.738)
TILE = 256
GLOBAL_ZMAX = 3                # whole-world tiles for z0..3
# Coding: code = 128 + 127 * asinh(v / a) / asinh(vmax / a), clamped to 1..255. 0 = land / no data.
LAYERS = {
    "vgg":  {"file": f"curv_{VERSION}.img", "scale": 0.1, "a": 25.0, "vmax": 400.0, "unit": "E",
             "name": "Vertical gravity gradient (VGG)"},
    "grav": {"file": f"grav_{VERSION}.img", "scale": 0.1, "a": 40.0, "vmax": 500.0, "unit": "mGal", "zmax": 5,
             "name": "Free-air gravity anomaly"},
}
# (grav stops at zoom 5 in the regions: it is smooth, so zoom 6 would add size, not detail; the page zooms z5 in.)
# Featured regions: [west, south, east, north] in degrees (east may pass 180 to cross the date line).
REGIONS = [
    {"id": "hawaii", "name": "Hawaiian–Emperor bend", "box": [164, 24, 184, 40], "zmax": 6,
     "view": [172.5, 32.5, 5.4]},
    {"id": "atlantic", "name": "Mid-Atlantic Ridge and fracture zones", "box": [-36, -6, -12, 6], "zmax": 6,
     "view": [-24, 0, 5.3]},
    {"id": "mariana", "name": "Mariana Trench", "box": [138, 9, 152, 22], "zmax": 6,
     "view": [145, 15.5, 5.4]},
    {"id": "epr", "name": "East Pacific Rise abyssal hills", "box": [-120, -22, -104, -8], "zmax": 6,
     "view": [-112, -15, 5.5]},
    {"id": "weddell", "name": "Weddell Sea", "box": [-58, -72, -14, -58], "zmax": 5,
     "view": [-36, -65, 4.4]},
    {"id": "seir", "name": "Southeast Indian Ridge", "box": [86, -52, 104, -40], "zmax": 6,
     "view": [95, -46, 5.4]},
    {"id": "peru", "name": "Small seamounts west of Peru", "box": [-104, -12, -88, 0], "zmax": 6,
     "view": [-96, -6, 5.5]},
    {"id": "argentina", "name": "Argentine margin", "box": [-64, -50, -48, -36], "zmax": 6,
     "view": [-56, -43, 5.3]},
]
REGION_ZMIN = 4
# Before and after: same box from both grids. v33 = the GMT tile (south-west corner) that holds the box.
COMPARE = [
    {"id": "seamounts", "name": "Small seamounts west of Peru", "box": [-99, -8, -93, -2], "v33": "S30W120"},
    {"id": "hills", "name": "Abyssal hills, Southeast Indian Ridge", "box": [92, -49, 98, -43], "v33": "S60E090"},
]


def merc(lat):
    """Mercator y in degrees (spherical), as the .img grid and Web Mercator use."""
    return math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def imerc(y):
    return math.degrees(2 * math.atan(math.exp(math.radians(y))) - math.pi / 2)


def encode(v, a, vmax):
    k = 127.0 / np.arcsinh(vmax / a)
    c = np.rint(128 + k * np.arcsinh(v / a))
    return np.clip(c, 1, 255)


def decode(c, a, vmax):
    k = np.arcsinh(vmax / a) / 127.0
    return a * np.sinh((np.asarray(c, dtype=np.float64) - 128) * k)


def read_img(path, scale):
    """The .img grid as float32 values, columns rolled so column 0 is longitude -180 (like the tiles)."""
    a = np.fromfile(path, dtype=">i2").reshape(NROW, NCOL)
    v = np.empty((NROW, NCOL), dtype=np.float32)
    v[:, :NCOL // 2] = a[:, NCOL // 2:]
    v[:, NCOL // 2:] = a[:, :NCOL // 2]
    del a
    v *= scale
    return v


def land_mask(geojsons):
    """255 where Natural Earth says land or an Antarctic ice shelf, on the .img grid (column 0 = -180). Under the ice
    shelves the grids hold only smooth fill, so we show them as land too."""
    m = Image.new("L", (NCOL, NROW), 0)
    d = ImageDraw.Draw(m)
    feats = []
    for gjp in geojsons:
        feats += json.load(open(gjp))["features"]

    def ring_xy(ring):
        out = []
        for lon, lat in ring:
            lat = max(-85.0, min(85.0, lat))
            out.append(((lon + 180.0) * 60.0, (Y0 - merc(lat)) * 60.0))
        return out

    for f in feats:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            d.polygon(ring_xy(poly[0]), fill=255)
            for hole in poly[1:]:
                d.polygon(ring_xy(hole), fill=0)
    return m


class Layer:
    def __init__(self, values, mask):
        """values: float32 array (NROW, NCOL); mask: PIL L image, 255 = land."""
        land = np.asarray(mask) != 0
        values[land] = 0.0
        del land
        self.v = Image.fromarray(values, mode="F")
        self.w = mask.point(lambda p: 0 if p else 255)     # weight: 255 = ocean

    def sample(self, box, size):
        """Average the grid over box = (x0, y0, x1, y1) in .img pixel coordinates (may run off the grid), out to size.
        Returns (value array, valid array)."""
        x0, y0, x1, y1 = box
        cx0, cy0 = int(math.floor(x0)) - 1, int(math.floor(y0)) - 1
        cx1, cy1 = int(math.ceil(x1)) + 1, int(math.ceil(y1)) + 1
        rb = (x0 - cx0, y0 - cy0, x1 - cx0, y1 - cy0)
        f = Image.BOX if (x1 - x0) >= size[0] else Image.BILINEAR
        vs = np.asarray(self.v.crop((cx0, cy0, cx1, cy1)).resize(size, f, box=rb), dtype=np.float64)
        ws = np.asarray(self.w.crop((cx0, cy0, cx1, cy1)).resize(size, f, box=rb), dtype=np.float64) / 255.0
        valid = ws >= 0.5
        out = np.where(valid, vs / np.maximum(ws, 1e-6), 0.0)
        return out, valid


def tile_box(z, x, y):
    """A Web Mercator tile's footprint in .img pixel coordinates."""
    n = TILE * (1 << z)
    s = NCOL / n
    return (x * TILE * s, y * TILE * s - (180.0 - Y0) * 60.0, (x + 1) * TILE * s, (y + 1) * TILE * s - (180.0 - Y0) * 60.0)


def lonlat_to_tile(lon, lat, z):
    n = 1 << z
    x = (lon + 180.0) / 360.0 * n
    y = (180.0 - merc(lat)) / 360.0 * n
    return x, y


def region_tiles(r, z):
    w, s, e, nn = r["box"]
    x0, y0 = lonlat_to_tile(w, nn, z)
    x1, y1 = lonlat_to_tile(e, s, z)
    out = []
    for xx in range(int(math.floor(x0)), int(math.ceil(x1))):
        for yy in range(int(math.floor(y0)), int(math.ceil(y1))):
            out.append((xx % (1 << z), yy))
    return out


def write_png(arr, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(arr.astype(np.uint8), mode="L").save(path, optimize=True)


def make_layer(key, L, out, cfg):
    old = os.path.join(out, "tiles", key)
    if os.path.isdir(old):                       # start clean, so no stale tiles stay behind
        import shutil
        shutil.rmtree(old)
    tiles = {}
    want = {}
    for z in range(GLOBAL_ZMAX + 1):
        want[z] = {(x, y) for x in range(1 << z) for y in range(1 << z)}
    for r in REGIONS:
        for z in range(REGION_ZMIN, min(r["zmax"], cfg.get("zmax", 99)) + 1):
            want.setdefault(z, set()).update(region_tiles(r, z))
    total = 0
    for z in sorted(want):
        lst = []
        for (x, y) in sorted(want[z]):
            v, ok = L.sample(tile_box(z, x, y), (TILE, TILE))
            if not ok.any():
                continue
            code = np.where(ok, encode(v, cfg["a"], cfg["vmax"]), 0)
            p = os.path.join(out, "tiles", key, str(z), str(x), f"{y}.png")
            write_png(code, p)
            total += os.path.getsize(p)
            lst.append([x, y])
        tiles[str(z)] = lst
        print(f"  {key} z{z}: {len(lst)} tiles", flush=True)
    print(f"  {key}: {total / 1e6:.2f} MB")
    return tiles


def make_compare(L, mask, rawdir, out, cfg):
    """Each pair at the grid's own 1-minute spacing, in Mercator, for SWOT (from the .img) and V33 (from GMT)."""
    res = []
    for c in COMPARE:
        w, s, e, n = c["box"]
        x0, x1 = (w + 180) * 60.0, (e + 180) * 60.0
        y0, y1 = (Y0 - merc(n)) * 60.0, (Y0 - merc(s)) * 60.0
        W, H = int(round(x1 - x0)), int(round(y1 - y0))
        v, ok = L.sample((x0, y0, x1, y1), (W, H))
        write_png(np.where(ok, encode(v, cfg["a"], cfg["vmax"]), 0), os.path.join(out, "compare", f"{c['id']}-swot.png"))
        # V33: lon-lat grid, 1800 x 1800, row 0 at the tile's north edge, pixel registered
        t = c["v33"]
        tlat = (-1 if t[0] == "S" else 1) * int(t[1:3])
        tlon = (-1 if t[3] == "W" else 1) * int(t[4:7])
        raw = np.asarray(Image.open(os.path.join(rawdir, "v33", f"{t}.earth_vgg_01m_p.jp2")), dtype=np.float64)
        g = (raw - 32768.0) * 0.03125 + 100.0
        north = tlat + 30
        vv = np.zeros((H, W))
        for i in range(H):
            lat = imerc(Y0 - (y0 + i + 0.5) / 60.0)
            rr = (north - lat) * 60.0 - 0.5
            r0 = int(math.floor(rr)); fr = rr - r0
            cols = (w - tlon) * 60.0 + np.arange(W)
            cc = cols.astype(int)
            vv[i] = g[r0, cc] * (1 - fr) + g[r0 + 1, cc] * fr
        write_png(np.where(ok, encode(vv, cfg["a"], cfg["vmax"]), 0), os.path.join(out, "compare", f"{c['id']}-v33.png"))
        d = vv[ok] - v[ok]
        print(f"  compare {c['id']}: {W}x{H}; V33 - SWOT mean {d.mean():.2f} E, rms {d.std():.2f} E, corr {np.corrcoef(vv[ok], v[ok])[0, 1]:.3f}")
        res.append({"id": c["id"], "name": c["name"], "box": c["box"], "w": W, "h": H})
    return res


def check(L, cfg, out, key, src):
    """Spot check: decode a few tile pixels and compare with the raw grid at the same place."""
    raw = np.memmap(src, dtype=">i2", mode="r", shape=(NROW, NCOL))
    pts = [(-155.6, 19.4), (172.0, 32.0), (-96.5, -5.0), (145.0, 11.3), (95.0, -46.0), (-30.0, 0.5), (-57.0, -44.0)]
    for lon, lat in pts:
        for z in (3, 6):
            tx, ty = lonlat_to_tile(lon, lat, z)
            x, y = int(tx), int(ty)
            p = os.path.join(out, "tiles", key, str(z), str(x), f"{y}.png")
            if not os.path.exists(p):
                continue
            px, py = int((tx - x) * TILE), int((ty - y) * TILE)
            c = int(np.asarray(Image.open(p))[py, px])
            col = int((lon % 360) * 60)          # the raw file starts at 0 E
            row = int((Y0 - merc(lat)) * 60)
            rv = np.asarray(raw[row - 1:row + 2, col - 1:col + 2], dtype=np.float64) * cfg["scale"]
            dec = "land" if c == 0 else f"{decode(c, cfg['a'], cfg['vmax']):8.1f}"
            print(f"  {key} z{z} ({lon:7.2f},{lat:6.2f}) code {c:3d} -> {dec}   raw 3x3 mean {rv.mean():8.1f} (min {rv.min():.1f}, max {rv.max():.1f})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--layers", default="vgg,grav")
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    man_path = os.path.join(a.out, "manifest.json")
    man = json.load(open(man_path)) if os.path.exists(man_path) else {}
    man.update({"version": VERSION, "tile": TILE, "globalZmax": GLOBAL_ZMAX, "regionZmin": REGION_ZMIN,
                "regions": REGIONS, "layers": man.get("layers", {})})
    print("land mask...", flush=True)
    mask = land_mask([os.path.join(a.raw, "ne_10m_land.geojson"),
                      os.path.join(a.raw, "ne_10m_antarctic_ice_shelves_polys.geojson")])
    for key in a.layers.split(","):
        cfg = LAYERS[key]
        src = os.path.join(a.raw, cfg["file"])
        if not os.path.exists(src):
            print(f"skip {key}: no {src}")
            continue
        print(f"{key}: reading {src}", flush=True)
        vals = read_img(src, cfg["scale"])
        L = Layer(vals, mask)
        del vals
        tiles = make_layer(key, L, a.out, cfg)
        entry = {"name": cfg["name"], "unit": cfg["unit"], "a": cfg["a"], "vmax": cfg["vmax"], "tiles": tiles,
                 "zmax": max(int(z) for z in tiles)}
        if key == "vgg":
            man["compare"] = make_compare(L, mask, a.raw, a.out, cfg)
        man["layers"][key] = entry
        if a.check:
            check(L, cfg, a.out, key, src)
        del L
    with open(man_path, "w") as f:
        json.dump(man, f, separators=(",", ":"))
    print("wrote", man_path)


if __name__ == "__main__":
    main()
