#!/bin/sh
# Rebuild every number and figure of "The Rhythm of Numbers" (Teddy Rook, 2026).
# Run from this directory. Requires Python 3 with mpmath, sympy, gmpy2, numpy, scipy, matplotlib, pyyaml.
set -e
python3 c1_cf.py
python3 c2_music.py
python3 c3_coprime.py
python3 c4_tools.py
[ -f out/zeros.json ] && [ "$(python3 -c 'import json;print(len(json.load(open("out/zeros.json"))))')" -ge 5000 ] || python3 zeros.py
python3 c5_spacing.py
python3 c6_fractals.py
python3 c6b_gcf.py
python3 c7_primeconv.py 400
python3 c7b_primeconv_figs.py
python3 c8_suite.py
python3 c9_misc_figs.py
python3 c10_connections.py
python3 c11_openq_picf.py           # 12 million certified terms of pi (about 2 minutes)
python3 c11_openq_pisearch.py 20000 # prime convergents of pi to n = 20,000 (about 45 minutes, resumable)
python3 c11_openq_stats.py
python3 c11_openq_model.py
python3 c11_openq_matrix.py
python3 c11_openq_edo.py
python3 c11_openq_primes.py
echo "all numbers and figures rebuilt"
