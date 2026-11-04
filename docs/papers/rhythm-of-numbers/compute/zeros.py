"""First 5,000 nontrivial zeta zeros (imaginary parts), mpmath.zetazero, saved incrementally."""
import mpmath as mp, json, os
mp.mp.dps = 20
fn = 'out/zeros.json'
z = json.load(open(fn)) if os.path.exists(fn) else []
for n in range(len(z) + 1, 5001):
    z.append(float(mp.zetazero(n).imag))
    if n % 250 == 0:
        json.dump(z, open(fn, 'w'))
        print(n, z[-1], flush=True)
json.dump(z, open(fn, 'w'))
