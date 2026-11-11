# The Rhythm of Numbers: the paper (source)

"The Rhythm of Numbers: Continued Fractions, Primes, Music and Self-Similarity" by Teddy Rook (2026).
The built PDF is `static/pdfs/The-Rhythm-of-Numbers-paper.pdf`; its page is `/connections/rhythm-of-numbers/paper/`
(content/connections/rhythm-of-numbers/paper/_index.md, layouts/connections/rhythm-paper.html).

## Layout

- `paper/` – the LaTeX source: `main.tex` (preamble and chapter list), `front.tex`, `ch01_intro.tex` … `ch16_openq2.tex`, `ch17_thirdlook.tex`, `ch18_largesmall.tex`,
  `appA_algorithms.tex`, `appB_methods.tex`, `appC_repro.tex`, `appD_prime.tex`, and `refs.bib` (every entry checked against a publisher
  page, catalogue or citing source; fields that could not be confirmed were left out).
- `paper/gen/` – LaTeX macros written by the scripts. The text uses only these macros for computed values, so never edit
  them by hand: rerun the scripts.
- `compute/` – the Python scripts that compute every number and draw every figure (`common.py` has the shared helpers
  and the figure style). `run_all.sh` runs them in order. Figures go to `paper/figures/` and JSON results to
  `compute/out/` (both are build outputs and are not kept in the repo).

## Build

Requirements: Python 3 with mpmath, sympy, gmpy2, numpy, scipy, matplotlib and pyyaml; TeX Live with XeLaTeX,
latexmk, BibTeX, memoir, natbib, algorithm2e, cleveref, siunitx and the Latin Modern OpenType fonts.

    cd compute && sh run_all.sh          # every number and figure; the 5,000 zeta zeros take about an hour,
                                         # the prime-convergent sample several minutes, and the search of pi's
                                         # convergents to n = 20,000 (c11_openq_pisearch.py) about 45 minutes
    cd ../paper && latexmk -xelatex main.tex
    cp main.pdf ../../../../static/pdfs/The-Rhythm-of-Numbers-paper.pdf

The `c11_openq_*.py` scripts belong to Chapter 15 ("Working on the open questions"): 12 million certified terms of pi
(`c11_openq_picf.py`, from about 43 million bits of pi), the prime search, the calibrated statistics,
the exact expectation and its simulation, the correlation-matrix spectra and the equal-temperament ranking.
`c12_openq2.py` belongs to Chapter 16 ("A second look at the open questions"): the overlap check behind the
almost-everywhere theorem, e modulo primes, the correlation matrix's near-copies and bounds, the commas of 171, and two
more tests of pi's terms.
The `c12_third_*.py` scripts belong to Chapter 17 ("A third look"), and are cleaned versions of Teddy Rook's own
scripts (November 2026): `c12_third_pisearch.py` searches q_n for 20,000 < n <= 25,332 (about an hour, resumable);
`c12_third_pi.py` rebuilds the probable prime q_25332 from two sources of pi, checks it against
`static/connections/rhythm/q25332.txt`, tests it, extends the heuristic to n = 25,332 and writes the digits for
Appendix D (about 3 minutes); `c12_third_e.py` (closed forms, divisors and periods for e) and `c12_third_matrix.py`
(extreme eigenvalues of the correlation matrix to m = 10^6) take about a minute together.
`c12_third_sieve.py` (the rhythm sieve: the recurrence modulo every prime below 10^7, then base-2 and Baillie-PSW tests
on the survivors; our search: see Section 17.5 for how far it reaches), `c12_third_newprimes.py` (the twelfth
and thirteenth probable primes q_27651 and q_32394, the counts to 32,394, the pattern tests and the mod-12 motif),
`c12_third_inter.py` (prime intermediate fractions, with their remainders mod 12) and `c12_third_fourteenth.py` (the fourteenth
probable prime q_37721, the counts to 40,000, the cluster, the notes of the prime convergents, and the family (22k+3)/(7k+1)
of the opening guess; run it after `c12_third_inter.py small`) and `c12_third_fifty.py` (the sixteenth probable-prime
numerator p_42037 and the counts and tests to n = 50,000) belong to Sections 17.5 and 17.6;
`c12_third_rate.py` (pi's own constant with and without zeta(2), the sieve survivors to n = 50,000 and the voices test on
two million terms, after Teddy Rook's rate.py and voices.py; needs out/picf.npy) belongs to Section 17.7.

Dates of additions: the paper marks each addition with the UTC date it was published. The dates are TeX macros in
`paper/main.tex` (`\revO`, `\revA`, `\revB`, `\revC`), so a date can be corrected in one line.

`c8_suite.py` reads `data/music/suite.yaml` from this repository. Random choices use fixed seeds. Scripts stop with an
error if any asserted fact (for example 292 × 113 = 32,996, or the OEIS lists of prime convergents of pi) fails.

After rebuilding, update `pdf_size` (pages and size) in content/connections/rhythm-of-numbers/paper/_index.md and the
page and figure counts ("147 pages", "40 figures") on the hub card (layouts/connections/rhythm.html), the fractals page card
(layouts/connections/rhythm-fractals.html) and the Connections hub (content/connections/_index.md).

`compute/c13_large/` belongs to Chapter 18 ("Large and small: the same patterns in atoms and in orbits"). These are Teddy
Rook's own scripts, kept as he wrote them (November 2026): `verify_ch18.py` recomputes every number printed in the
chapter (250 checks, about two minutes; it builds `tr.so` from `tr.c` by itself; `--big` adds the 3 x 10^7 row of
Table 18.2 and needs about 4 GB of memory). Unlike the other chapters, Chapter 18's numbers are typed in its text and
not inserted from `paper/gen/`. `indep_check.py` is a separate spot check written without his scripts.

The `c14_connections*.py` scripts belong to Section 12.8 ("The fifth subject: physics"): `c14_connections_venn.py` searches
for the five-ellipse Venn diagram used on the site, `c14_connections_kam.py` runs Greene's residue method on the standard
map for the Suite's five numbers (about ten minutes), and `c14_connections.py` writes the macros (its stored values come
from the other two; it rechecks two of them).

`compute/c15_newton/` belongs to Chapter 19 ("Newton: the rhythm of gravity"). `nbody.c` integrates the Sun and the eight
planets under Newton's law (compile with `cc -O3 -o nbody nbody.c -lm`); `tune.py` tunes its starting orbits; `spec.py`
finds the long swings in the result; `c15_newton.py` writes the macros. The docstring of `c15_newton.py` gives the
commands in order. The 200,000-year run takes about an hour and a half and writes a 50 MB file, which is not kept.
