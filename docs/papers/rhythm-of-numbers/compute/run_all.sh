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
python3 c12_openq2.py               # Chapter 16: a second look (about 3 minutes)
python3 c12_third_pisearch.py       # Chapter 17: q_n for 20,000 < n <= 25,332 (about an hour, resumable)
python3 c12_third_pi.py             # Chapter 17: the probable prime q_25332 and the heuristic (about 3 minutes)
python3 c12_third_e.py              # Chapter 17: e completed (seconds)
python3 c12_third_matrix.py         # Chapter 17: extreme eigenvalues of the correlation matrix (about 2 minutes)
python3 c12_third_sieve.py q 25333 28000   # Chapter 17: rhythm sieve and search, denominators (about 20 minutes, resumable)
python3 c12_third_sieve.py p 20001 28000   # Chapter 17: rhythm sieve and search, numerators (about 45 minutes, resumable)
python3 c12_third_sieve.py q 28001 32394   # Chapter 17: denominators to the thirteenth (about 45 minutes, resumable)
python3 c12_third_sieve.py p 28001 32394   # Chapter 17: numerators to n = 32,394 (about 45 minutes, resumable)
python3 c12_third_sieve.py q 32395 35000   # Chapter 17: denominators beyond the thirteenth (about 45 minutes, resumable)
python3 c12_third_sieve.py q 35001 37721   # Chapter 17: denominators to the fourteenth (about 50 minutes, resumable)
python3 c12_third_sieve.py q 37722 40000   # Chapter 17: denominators beyond the fourteenth (stopped at n = 38,571 for the paper; resumable)
python3 c12_third_sieve.py p 32395 37500   # Chapter 17: numerators beyond 32,394 (about 1.5 hours, resumable)
python3 c12_third_sieve.py p 37501 42037   # Chapter 17: numerators to the sixteenth (about 2 hours, resumable)
python3 c12_third_newprimes.py      # Chapter 17: q_27651 and q_32394, counts, odds, pattern tests, motif (about 5 minutes)
python3 c12_third_inter.py all      # Chapter 17: prime intermediate fractions (about an hour, resumable)
python3 c12_third_fourteenth.py     # Chapter 17: q_37721, counts to 40,000, cluster, notes, family of the guess (about 5 minutes)
python3 c12_third_fifty.py          # Chapter 17: p_42037, counts and tests to 50,000, notes with 16 numerators (about 6 minutes)
python3 c12_third_rate.py           # Chapter 17, Section 17.7: pi's own constant, sieve survivors, voices test (about 40 minutes)
echo "all numbers and figures rebuilt"
python3 c14_connections.py          # Chapter 12, Section 12.8: the five-oval diagram, Sommerfeld's shapes, the break-up table (seconds;
                                    # c14_connections_kam.py and c14_connections_venn.py recompute its stored values, minutes each)
