---
title: "Five new probable primes from pi: all their digits"
linkTitle: "New probable primes"
description: "The bottom numbers of pi's 25,332nd, 27,651st, 32,394th and 37,721st best fractions are probable primes of 13,017 to 19,465 digits, the 11th to 14th of their kind, and the top number of the 42,037th is a probable prime of 21,667 digits, the 16th of its kind. All found by Teddy Rook in November 2026. All the digits, downloads, SHA-256 fingerprints and Python code to check them yourself."
layout: rhythm-prime
# The URL stays /connections/rhythm-of-numbers/new-prime/ (linked from the Rhythm of Numbers page and the paper).
# The digits come from static/connections/rhythm/q<n>.txt (checked against the recomputed numbers by
# docs/papers/rhythm-of-numbers/compute/c12_third_pi.py, c12_third_newprimes.py, c12_third_fourteenth.py and c12_third_fifty.py; p<n>.txt for a top number). Chapter 17 of the paper (Sections 17.5
# and 17.6) has the details. When a primality proof is finished: change that prime's status, status_text and
# status_note below, and the paper's wording ("probable prime") in Chapter 17, Appendix D and the open-questions summaries.
added: "2026-11-10"
lede: "Pi’s best fractions are 22/7, 333/106, 355/113, and on and on, each one closer than the last. Only a few of their bottom numbers are prime. In November 2026 Teddy Rook found the 11th, far out at fraction number 25,332, then the 12th, at fraction number 27,651, only a little further on, the 13th, at fraction number 32,394, and the 14th, at fraction number 37,721. They have 13,017, 14,190, 16,695 and 19,465 digits. He also found a prime on top: the top number of fraction 42,037, with 21,667 digits, the first new prime top number since fraction 8,750. As far as we can find, no one has reported any of them before."
primes:
  - idx: 25332
    nth: "25,332nd"
    label: "The eleventh"
    status: "probable prime, proof in progress"
    status_text: "It passed the standard tests for primes, run independently twice. A full proof of primality (a certificate that anyone can check) is being computed now, and it may take a week or more."
    status_note: "This page will be updated when the proof is done. Until then, please call it a probable prime."
    found_by: "Teddy Rook, November 2026"
    place: "The 11th prime denominator of pi; the 10th is at fraction number 6,925"
    sha256: "73f98bd668e4c94394d07e7846ca7643d6ecf617317850bcbff60ac260ad7974"
  - idx: 27651
    nth: "27,651st"
    label: "The twelfth"
    status: "probable prime, no proof started"
    status_text: "It passed the same tests, run independently twice. No proof has been started yet; one would take roughly 40% longer than the proof of the eleventh."
    found_by: "Teddy Rook, November 2026"
    place: "The 12th prime denominator of pi, only 2,319 fractions after the 11th"
    sha256: "4373b2822612a676bfbbeec29a0ea3e56aac31467a99903804990469e10b659d"
  - idx: 32394
    nth: "32,394th"
    label: "The thirteenth"
    status: "probable prime, no proof started"
    status_text: "It passed the same tests, run independently twice. No proof has been started yet; one would take roughly 2.7 times as long as the proof of the eleventh."
    found_by: "Teddy Rook, November 2026"
    place: "The 13th prime denominator of pi, 4,743 fractions after the 12th"
    sha256: "08bfe3ab0ebbd69b1945ad957a2fbae729aaca5a3e26ef00a80c9650711eb4a6"
  - idx: 37721
    nth: "37,721st"
    label: "The fourteenth"
    status: "probable prime, no proof started"
    status_text: "It passed the same tests, run independently twice. No proof has been started yet; one would take roughly 5 times as long as the proof of the eleventh."
    found_by: "Teddy Rook, November 2026"
    place: "The 14th prime denominator of pi, 5,327 fractions after the 13th"
    sha256: "e400a170de02c0578e23b9d3b2e2ca73f2345ba9a4232cfee009c148d15af77d"
  - idx: 42037
    kind: p
    nth: "42,037th"
    label: "A top number: the sixteenth numerator"
    status: "probable prime, no proof started"
    status_text: "This one is a top number (numerator), not a bottom number: the 42,037th fraction is p₄₂₀₃₇/q₄₂₀₃₇, and it is p₄₂₀₃₇ that passed the tests for primes, run independently twice. Its bottom number is not prime. No proof has been started; one would take roughly 8 times as long as the proof of the eleventh."
    found_by: "Teddy Rook, November 2026"
    place: "The 16th prime numerator of pi; the 15th is at fraction number 8,750"
    sha256: "ca837a3355299394dacfb035d2b07ad092625da952405d18ef3a1b2389510098"
where:
  - "Pi’s continued fraction, [3; 7, 15, 1, 292, 1, 1, …], gives a list of fractions that close in on pi, one per step. Their bottom numbers are called q₁, q₂, q₃, …, so q₁ = 7 (from 22/7) and q₃ = 113 (from 355/113). Each is made from the two before it: multiply the last one by the next term of the continued fraction and add the one before that."
  - "The [Rhythm of Numbers paper](/connections/rhythm-of-numbers/paper/) asked whether infinitely many of these bottom numbers are prime. Up to fraction number 20,000 there were ten, the last at number 6,925. The same question can be asked of the top numbers, p₁, p₂, p₃, …: up to fraction 20,000 there were fifteen prime ones, the last at number 8,750. Teddy Rook carried the search to fraction 50,000, top and bottom numbers, with his own programs and found that the bottom numbers q₂₅₃₃₂, q₂₇₆₅₁, q₃₂₃₉₄ and q₃₇₇₂₁ and the top number p₄₂₀₃₇ pass the tests for primes. To save time he first used a “rhythm sieve”: the rule that builds each bottom number, run with the remainders after division by every prime below ten million, which throws out about 19 candidates in 20 before any huge number is touched. You can hear a small version of it on the [Rhythm of Numbers page](/connections/rhythm-of-numbers/#sieve)."
  - "We then rebuilt all five numbers from scratch, from two separate high-precision values of pi, and got the same digits. We also repeated the search ourselves, the bottom numbers to fraction 38,571 and the top numbers to fraction 42,037: these are the only new ones that pass there, and our search turned up the top number at 42,037 on its own. Beyond that, to fraction 50,000, the counts rest on his search. In each of the five fractions, the other number is not prime."
probable:
  - "Checking that a number this big is prime by trying every possible divisor would take longer than the age of the universe. Instead, there are quick tests that every prime passes and almost every non-prime fails. The strongest common one is the **Baillie–PSW test**. No one has ever found a non-prime that passes it, but no one has proved that none exists either. A number that passes is called a **probable prime**."
  - "All five numbers passed the Baillie–PSW test and 25 more rounds of the Miller–Rabin test with random bases. For a number that is not prime, each Miller–Rabin round alone would catch it at least three times out of four."
  - "A **proof** is a different kind of computation. The elliptic-curve method (ECPP) builds a chain of facts, a certificate, that shows the number is prime beyond any doubt; checking the certificate is much faster than making it. That computation is now running for the eleventh. When it finishes, “probable prime” becomes “prime”."
check:
  - "You don’t have to take our word for it. This short Python program uses only the standard library. It works out pi to about 28,000 to 45,000 digits with Machin’s formula from 1706, finds the continued fraction (keeping only terms that are certain), rebuilds the number, compares it with the downloaded file, prints its SHA-256 fingerprint, and runs the Miller–Rabin test. Everything but the last step takes from several seconds to a minute or two, depending on the number; each Miller–Rabin round takes a few minutes in plain Python. If the gmpy2 package is installed, it runs the full Baillie–PSW test instead, in under a minute."
  - "Save the program and q25332.txt, q27651.txt, q32394.txt, q37721.txt or p42037.txt in the same folder and run, for example, `python3 check_pi_prime.py 37721` for a bottom number or `python3 check_pi_prime.py 42037 p` for the top number. Python 3.8 or later is enough."
why:
  - "Five numbers cannot answer the question “are there infinitely many?”. What they can do is test the paper’s rule of thumb, which says a typical number should have about 2 ln 2 × ln n ≈ 1.39 ln n prime bottom numbers among its first n fractions. By fraction 50,000 that rule expects about 14.1 prime bottom numbers (95% of the time between 8 and 22) and 13.5 prime top numbers (between 7 and 21). Pi has 14 and 16. That is ordinary: pi keeps looking like a typical number."
  - "The long wait from fraction 6,925 to 25,332 is ordinary too, the bunch of four after it is probably luck, and so is the long wait for a top number, from 8,750 to 42,037 (about 1 chance in 9). The bottom numbers grow by about 1 digit every 2 steps, and the bigger a number is, the rarer primes are. So the expected count grows only like a logarithm: roughly one more prime each time the fraction number doubles. Primes that arrive at random like this often come in clumps, with long gaps in between. Four in the stretch from 25,000 to 40,000 would happen less than 1% of the time for a typical number, but that stretch was picked after the primes were seen, and the stretch before it ran low. The chance of a 15th prime bottom number by fraction 62,500 is about 27%, by fraction 100,000 about 62%, and by fraction 200,000 about 85%, and the same holds for a 17th prime top number."
notes:
  - "Found by Teddy Rook (November 2026) with his own search programs; checked independently for The Rhythm of Numbers. The scripts are c12_third_pisearch.py, c12_third_sieve.py, c12_third_pi.py, c12_third_newprimes.py, c12_third_fourteenth.py and c12_third_fifty.py in the paper’s source."
  - "Chapter 17 of [the paper](/connections/rhythm-of-numbers/paper/), “A third look at the open questions” (Sections 17.5 and 17.6), has the method, the checks and the comparison with the rule of thumb, and Appendix D prints all the digits."
  - "Earlier terms: [OEIS A259490](https://oeis.org/A259490) lists the first ten prime bottom numbers of pi’s fractions and notes that the next is beyond its search limit. OEIS counts from 0, so its index is one more than ours: our fractions 25,332, 27,651, 32,394 and 37,721 are its k = 25,333, 27,652, 32,395 and 37,722. [OEIS A086785](https://oeis.org/A086785) lists fifteen prime top numbers; p₄₂₀₃₇ would be the sixteenth."
  - "The tests: R. Baillie and S. S. Wagstaff, “Lucas pseudoprimes,” *Mathematics of Computation* 35 (1980); A. O. L. Atkin and F. Morain, “Elliptic curves and primality proving,” *Mathematics of Computation* 61 (1993). Background: [Probable prime (Wikipedia)](https://en.wikipedia.org/wiki/Probable_prime) and [Baillie–PSW primality test (Wikipedia)](https://en.wikipedia.org/wiki/Baillie%E2%80%93PSW_primality_test)."
credits:
  - { name: "Teddy Rook", what: "found the five probable primes with his own search programs (November 2026)" }
  - { name: "Our own code", what: "the independent checks, the page and the Python program; pi from Machin’s formula (1706) in the program, and from the mpmath and MPFR libraries in the paper’s scripts" }
---
