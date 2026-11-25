---
title: "After the Riemann Hypothesis: what it settles, and what is left"
linkTitle: "After the Riemann Hypothesis"
description: "On 21 November 2026 the Lean and Mathlib communities certified a computer-checked proof of the Riemann Hypothesis. A plain-words guide to 48 results that assumed it, each with its own page and picture: which are now theorems, which still need more, which were never within its reach, and how hard the remaining work is."
layout: rhythm-rh
# The list is data/rhythm/rh.yaml. Status text here follows the primary sources in notes: (the Lean and Mathlib communities'
# joint statement of 2026-11-21, A. Sutherland's verification log, L. Alpöge's remark). Update this page when a written
# proof appears, when the proof is extended to other L-functions, or when the expert review reports.
added: "2026-11-21"
h1: "After the Riemann Hypothesis"
h1em: "what it settles, and what is left"
lede: "For 167 years mathematicians wrote “if the Riemann Hypothesis is true, then …” and built on it anyway. On 21 November 2026 the Lean and Mathlib communities announced that a proof, written in a language a computer can check line by line, had passed every check they could give it. This page lists what was built on the hypothesis, what the proof now says about each piece, and what work is left."
short:
  - "**What was certified.** A proof by Levent Alpöge, released on 20 November 2026 as a library of about 17 million lines of Lean. The next day the Lean and Mathlib communities certified that both the statement and the proof are correct."
  - "**What it covers.** The Riemann Hypothesis for the zeta function. The same library proves it for every Dirichlet L-function, the zeta function’s cousins for primes sorted by remainder."
  - "**What it does not cover.** The zeta functions of number fields in general, and the L-functions of elliptic curves. Many famous “if” theorems need those."
  - "**What nobody has yet.** A proof a person can read. The author says the argument is very long and that he means to write it up properly."
  - "**The list.** 48 results, each with its own page: 27 are now theorems, 5 had already been proved another way, 9 still wait for a wider proof, 3 need a second assumption, and 4 famous problems were never within reach."
  - "**Our own work.** On two of the easier items we did something ourselves: a written-out proof, with its computation, that [Euler’s list of 65 convenient numbers is complete](/connections/rhythm-of-numbers/riemann-hypothesis/eulers-convenient-numbers/#ours), and a working [Miller’s test](/connections/rhythm-of-numbers/riemann-hypothesis/millers-test/) that proves a number prime in your browser. Neither has been reviewed by a specialist."
  - "**The hard ones.** We tried the eight entries marked Hard and could not advance any of them; nobody can until the proof is extended. We did find that [six of the eight wait on one and the same statement](/connections/rhythm-of-numbers/riemann-hypothesis/number-fields/#ours)."
sections:
  - id: "what"
    h: "What the hypothesis says"
    paras:
      - "The zeta function is built from all the whole numbers, ζ(s) = 1 + 1/2ˢ + 1/3ˢ + …, and Euler showed that it is also a product over all the primes. Bernhard Riemann showed in 1859 that the places where this function is zero control how the primes are spread. He guessed that every zero that matters lies on one straight line, the “critical line”."
      - "If the zeros are on the line, the primes are spread as evenly as they possibly could be: as if each number near x were prime by an honest coin toss with chance 1 in ln x. If even one zero were off the line, the primes would have a hidden lumpiness. That is why so much was built on the guess."
      - "On [the Rhythm of Numbers page](/connections/rhythm-of-numbers/#zeros) you can listen to the first zeros and see how they space themselves."
  - id: "proved"
    h: "What was checked, and by whom"
    paras:
      - "Lean is a programming language for proofs. A proof written in it is checked by a small program, the kernel, one logical step at a time. Mathlib is the shared library of mathematics written in Lean, and it contains a carefully worded statement of the Riemann Hypothesis."
      - "According to the communities’ joint statement, dozens of people compiled the library and got the same result; the finished proof was then checked by Lean’s own kernel and by several independent checkers written in other programming languages; and a separate tool confirmed that the theorem proved is exactly Mathlib’s statement and not a look-alike. The library depends only on Mathlib."
      - "The joint statement certifies the Riemann Hypothesis itself. The library’s other headline theorems, including the one for all Dirichlet L-functions, passed the same independent checkers according to the public verification log kept by Andrew Sutherland at MIT, which also reports that they use only Lean’s three standard axioms. By 24 November that log shows Lean’s own kernel, in its default and its strictest settings, accepting the whole proof (runs of 48 and 72 hours), with one last comparison run still going."
  - id: "caution"
    h: "What “certified” does and does not mean"
    list:
      - "**It means** the chain of logic has no gaps, as far as several independent programs can tell. This is a stricter test than a human referee can give a long proof."
      - "**It does not mean** anyone understands the proof yet. No paper has been posted. The author’s own short note calls the argument “incredibly long” and gives only a rough outline, built on a method Stepanov used in 1969 for a simpler relative of the problem."
      - "**It rests on** the checkers being sound and on Mathlib’s statement saying what mathematicians mean by the Riemann Hypothesis. Both have been examined by many people, and that examination is continuing."
      - "**The prize.** The Clay Mathematics Institute’s rules for its million-dollar prize ask for publication, a waiting period of two years, and general acceptance by mathematicians. That clock has not started."
      - "We report the certification as the Lean and Mathlib communities state it. If the review finds a problem, this page will say so."
  - id: "todo"
    h: "The work that is left, overall"
    list:
      - "**Write the proof for people** (a large job, and under way). Until the ideas are explained, nobody can reuse them, and reuse is what turns one theorem into a hundred."
      - "**Shorten it.** Seventeen million lines is far more than the argument should need. First proofs are usually long; later ones are short."
      - "**Extend it to number fields** (difficulty 3, hard). The author writes that he expects the extended hypothesis to follow with more time. We checked what each of the eight Hard entries assumes: six would be settled by this one step (Artin’s conjecture, the effective Chebotarev theorem, class groups by computer, Euclidean rings, isogeny graphs, shapes and equations), and the entry on elliptic curves would be half settled."
      - "**Extend it to elliptic curves, modular forms and beyond** (difficulty 3 to 4). Nobody has claimed this. Ramanujan’s form x² + y² + 10z² and the rank bounds for elliptic curves wait for it; the step to number fields would not reach them."
      - "**Go through the literature** (difficulty 1 to 2). Thousands of papers contain a line like “assume GRH”. Each has to be re-read to see which form it needs, and the tables and constants that relied on it have to be re-stated."
      - "**The questions the hypothesis never answered** (difficulty 4 to 5): the exact size of the errors, whether the zeros are simple, why they are spaced like random matrices, and the famous problems about twin primes and Goldbach."
scale_intro: "Every result below has a page of its own and a row in [the table](/connections/rhythm-of-numbers/riemann-hypothesis/list/). Each says what was known before, **what the proof means for it**, the **open work to be done**, and the **difficulty** of that work, from 0 (done) to 5."
scale_note: "The difficulty levels are our own rough estimates for a general reader, not ratings from the mathematical literature. Where we were not sure which form of the hypothesis a paper needs, the entry says so. The list is long but not complete: thousands of papers assume some form of the hypothesis."
more:
  - { url: "connections/rhythm-of-numbers/riemann-hypothesis/list/", label: "The table of all 48" }
  - { url: "connections/rhythm-of-numbers/#zeros", label: "Listen to the zeros" }
  - { url: "connections/rhythm-of-numbers/new-prime/", label: "Five new primes from pi, one proved" }
  - { url: "connections/rhythm-of-numbers/what-it-means/", label: "The Rhythm of Numbers, in plain words" }
  - { url: "connections/rhythm-of-numbers/paper/", label: "The paper" }
notes:
  - "The certification: “Lean verification of the Riemann Hypothesis”, a joint statement by the Lean and Mathlib communities, endorsed by the Lean FRO and the Mathlib Initiative, 21 November 2026, at [leanprover-community.github.io](https://leanprover-community.github.io/blog/posts/riemann-hypothesis/)."
  - "The verification log: Andrew Sutherland (MIT), at [math.mit.edu/~drew/grh](https://math.mit.edu/~drew/grh/), read in the versions of 20 November 2026, 22:05 UTC, and 24 November 2026, 05:25 UTC. It lists each check, the checks still running, and three consequences since checked in Lean (Robin’s inequality, Lagarias’s inequality, and an inequality for cyclotomic fields)."
  - "The author’s note: Levent Alpöge, “Remark”, at [alpo.ge/remark.pdf](https://alpo.ge/remark.pdf)."
  - "Background and the long lists of consequences and equivalent forms: P. Borwein, S. Choi, B. Rooney and A. Weirathmueller, *The Riemann Hypothesis: A Resource for the Afficionado and Virtuoso Alike* (Springer, 2008); K. Broughan, *Equivalents of the Riemann Hypothesis* (Cambridge, 2017); J. B. Conrey, “The Riemann Hypothesis”, *Notices of the American Mathematical Society* 50 (2003); H. Iwaniec and E. Kowalski, *Analytic Number Theory* (2004)."
  - "Each entry names the paper its statement comes from. The numbers in several entries were checked against the papers’ own abstracts or texts in November 2026: Lamzouri, Li and Soundararajan (2015); Bui and Heath-Brown (2013); Carneiro, Milinovich and Soundararajan (2019); Weinberger’s count of at most two further convenient numbers; and the eighteen exceptions of Ono and Soundararajan."
  - "This page is a summary for general readers. It is not a referee’s report on the proof, and nothing on it is our own mathematics."
---
