# The Rhythm of Numbers: the paper (source)

"The Rhythm of Numbers: Continued Fractions, Primes, Music and Self-Similarity" by Teddy Rook (2026).
The built PDF is `static/pdfs/The-Rhythm-of-Numbers-paper.pdf`; its page is `/connections/rhythm-of-numbers/paper/`
(content/connections/rhythm-of-numbers/paper/_index.md, layouts/connections/rhythm-paper.html).

## Layout

- `paper/` – the LaTeX source: `main.tex` (preamble and chapter list), `front.tex`, `ch01_intro.tex` … `ch16_openq2.tex`, `ch17_thirdlook.tex`,
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

Dates of additions: the paper marks each addition with the UTC date it was published. The dates are TeX macros in
`paper/main.tex` (`\revO`, `\revA`, `\revB`, `\revC`), so a date can be corrected in one line.

`c8_suite.py` reads `data/music/suite.yaml` from this repository. Random choices use fixed seeds. Scripts stop with an
error if any asserted fact (for example 292 × 113 = 32,996, or the OEIS lists of prime convergents of pi) fails.

After rebuilding, update `pdf_size` (pages and size) in content/connections/rhythm-of-numbers/paper/_index.md and the
page and figure counts ("132 pages", "40 figures") on the hub card (layouts/connections/rhythm.html), the fractals page card
(layouts/connections/rhythm-fractals.html) and the Connections hub (content/connections/_index.md).
