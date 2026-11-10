---
title: "A new probable prime from pi: all 13,017 digits"
linkTitle: "A new probable prime"
description: "The bottom number of pi's 25,332nd best fraction is a 13,017-digit probable prime, found by Teddy Rook in November 2026: the 11th prime of its kind. All the digits, a download, its SHA-256 fingerprint and Python code to check it yourself."
layout: rhythm-prime
# The digits come from static/connections/rhythm/q25332.txt (checked against the recomputed number by
# docs/papers/rhythm-of-numbers/compute/c12_third_pi.py). Chapter 17 of the paper (Section 17.5) has the details.
# When the primality proof is finished: change status, status_text and status_note below, and the paper's wording
# ("probable prime") in Chapter 17, Appendix D and the open-questions summaries.
added: "2026-11-10"
status: "probable prime"
status_text: "It passed the standard tests for primes, run independently twice. A full proof of primality (a certificate that anyone can check) is being computed now, and it may take a week or more."
status_note: "This page will be updated when the proof is done. Until then, please call it a probable prime."
found_by: "Teddy Rook, November 2026"
sha256: "73f98bd668e4c94394d07e7846ca7643d6ecf617317850bcbff60ac260ad7974"
lede: "Pi’s best fractions are 22/7, 333/106, 355/113, and on and on, each one closer than the last. Only a few of their bottom numbers are prime. In November 2026 Teddy Rook found the 11th, far out at fraction number 25,332. It has 13,017 digits, and as far as we can find, no one has reported it before."
where:
  - "Pi’s continued fraction, [3; 7, 15, 1, 292, 1, 1, …], gives a list of fractions that close in on pi, one per step. Their bottom numbers are called q₁, q₂, q₃, …, so q₁ = 7 (from 22/7) and q₃ = 113 (from 355/113). Each is made from the two before it: multiply the last one by the next term of the continued fraction and add the one before that."
  - "The [Rhythm of Numbers paper](/connections/rhythm-of-numbers/paper/) asked whether infinitely many of these bottom numbers are prime. Up to fraction number 20,000 there were ten, the last at number 6,925. Teddy Rook carried the search further with his own program and found that q₂₅₃₃₂ passes the tests for primes. We then rebuilt the number from scratch, from two separate high-precision values of pi, and got the same 13,017 digits. We also tested every bottom number between fraction 20,000 and 25,332: this is the only one that passes. Teddy Rook’s own search went on to fraction 26,000 and found no other prime top or bottom number."
  - "Its neighbors in pi’s continued fraction, terms 25,330 to 25,334, are 3, 12, 2, 4, 1. The top number of the same fraction is not prime."
probable:
  - "Checking that a number this big is prime by trying every possible divisor would take longer than the age of the universe. Instead, there are quick tests that every prime passes and almost every non-prime fails. The strongest common one is the **Baillie–PSW test**. No one has ever found a non-prime that passes it, but no one has proved that none exists either. A number that passes is called a **probable prime**."
  - "q₂₅₃₃₂ passed the Baillie–PSW test and 25 more rounds of the Miller–Rabin test with random bases. For a number that is not prime, each Miller–Rabin round alone would catch it at least three times out of four."
  - "A **proof** is a different kind of computation. The elliptic-curve method (ECPP) builds a chain of facts, a certificate, that shows the number is prime beyond any doubt; checking the certificate is much faster than making it. That is the computation now running. When it finishes, “probable prime” becomes “prime”."
check:
  - "You don’t have to take our word for it. This short Python program uses only the standard library. It works out pi to 27,500 digits with Machin’s formula from 1706, finds the continued fraction (keeping only terms that are certain), rebuilds q₂₅₃₃₂, compares it with the downloaded file, prints its SHA-256 fingerprint, and runs the Miller–Rabin test. Everything but the last step takes a few seconds; each Miller–Rabin round takes a few minutes in plain Python. If the gmpy2 package is installed, it runs the full Baillie–PSW test instead, in under a minute."
  - "Save the program and q25332.txt in the same folder and run `python3 check_q25332.py`. Python 3.8 or later is enough."
why:
  - "One number cannot answer the question “are there infinitely many?”. What it can do is test the paper’s rule of thumb, which says a typical number should have about 2 ln 2 × ln n ≈ 1.39 ln n prime bottom numbers among its first n fractions. By fraction 25,332 that rule expects about 13.2, and 95% of the time between 7 and 20. Pi has 11. That is ordinary: pi keeps looking like a typical number."
  - "The long wait from fraction 6,925 to 25,332 is ordinary too. The bottom numbers grow by about 1 digit every 2 steps, and the bigger a number is, the rarer primes are. So the expected count grows only like a logarithm: roughly one more prime each time the fraction number doubles. The rule expected 1.8 primes in that stretch, and the chance of seeing none until 25,332 was about 1 in 6."
notes:
  - "Found by Teddy Rook (November 2026) with his own search program; checked independently for The Rhythm of Numbers. The scripts are c12_third_pisearch.py and c12_third_pi.py in the paper’s source."
  - "Chapter 17 of [the paper](/connections/rhythm-of-numbers/paper/), “A third look at the open questions” (Section 17.5), has the method, the checks and the comparison with the rule of thumb, and Appendix D prints all the digits."
  - "Earlier terms: [OEIS A259490](https://oeis.org/A259490) lists the first ten prime bottom numbers of pi’s fractions and notes that the next is beyond its search limit. OEIS counts from 0, so its index is one more than ours: our fraction 25,332 is its k = 25,333."
  - "The tests: R. Baillie and S. S. Wagstaff, “Lucas pseudoprimes,” *Mathematics of Computation* 35 (1980); A. O. L. Atkin and F. Morain, “Elliptic curves and primality proving,” *Mathematics of Computation* 61 (1993). Background: [Probable prime (Wikipedia)](https://en.wikipedia.org/wiki/Probable_prime) and [Baillie–PSW primality test (Wikipedia)](https://en.wikipedia.org/wiki/Baillie%E2%80%93PSW_primality_test)."
credits:
  - { name: "Teddy Rook", what: "found the probable prime with his own search program (November 2026)" }
  - { name: "Our own code", what: "the independent check, the page and the Python program; pi from Machin’s formula (1706) in the program, and from the mpmath and MPFR libraries in the paper’s scripts" }
---
