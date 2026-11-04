# The Rhythm of Numbers: the paper (source)

"The Rhythm of Numbers: Continued Fractions, Primes, Music and Self-Similarity" by Teddy Rook (2026).
The built PDF is `static/pdfs/The-Rhythm-of-Numbers-paper.pdf`; its page is `/connections/rhythm-of-numbers/paper/`
(content/connections/rhythm-of-numbers/paper/_index.md, layouts/connections/rhythm-paper.html).

## Layout

- `paper/` – the LaTeX source: `main.tex` (preamble and chapter list), `front.tex`, `ch01_intro.tex` … `ch14_discussion.tex`,
  `appA_algorithms.tex`, `appB_methods.tex`, `appC_repro.tex`, and `refs.bib` (every entry checked against a publisher
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
                                         # the prime-convergent sample several minutes
    cd ../paper && latexmk -xelatex main.tex
    cp main.pdf ../../../../static/pdfs/The-Rhythm-of-Numbers-paper.pdf

`c8_suite.py` reads `data/music/suite.yaml` from this repository. Random choices use fixed seeds. Scripts stop with an
error if any asserted fact (for example 292 × 113 = 32,996, or the OEIS lists of prime convergents of pi) fails.

After rebuilding, update `pdf_size` (pages and size) in content/connections/rhythm-of-numbers/paper/_index.md and the
"86 pages" mentions on the hub card (layouts/connections/rhythm.html), the fractals page card
(layouts/connections/rhythm-fractals.html) and the Connections hub (content/connections/_index.md).
