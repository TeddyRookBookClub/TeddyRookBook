---
title: "What it all means: the open questions in plain words"
linkTitle: "What it all means"
description: "A plain-words guide to the work on six open questions from The Rhythm of Numbers: what the questions are, what is new (an 11th prime fraction for pi, e's pattern pinned down, how a big matrix grows), what is proved and what is only evidence, and why it matters."
layout: rhythm-meaning
# Plain-words summary of Chapters 15-17 of the paper (docs/papers/rhythm-of-numbers/paper/). Keep every claim as the
# paper states it: "proved" only for what the paper proves; computer results are evidence. No hype.
added: "2026-11-10"
digits: "13,017"
lede: "The math behind the Rhythm of Numbers can get heavy. This page skips the formulas. It says what the questions are, what we found, which parts are proved and which are only evidence, and why anyone might care."
short:
  - "Pi’s best fractions (22/7, 355/113, …) sometimes have a prime number on the bottom. We knew of 10. In November 2026 Teddy Rook found an 11th, at fraction number 25,332: a prime (almost certainly; the proof is running) with 13,017 digits. As far as we can find, no one has reported it before."
  - "Eleven is about what a “typical” number would have by then. So pi keeps behaving like a typical number. That is evidence, not proof."
  - "For e, another famous number, the pattern of which fractions are divisible by which primes is now fully worked out and proved. One result: e’s bottom numbers can be prime only at certain steps."
  - "A big table of numbers from the paper (a “matrix”) has a largest value that grows, very slowly, at a rate we can now state exactly. Its smallest value shrinks at the mirror-image rate, and the whole crowd of values in between settles into a fixed shape."
  - "The new proofs come from Teddy Rook’s own notes; we checked each one, line by line and by computer."
  - "The hardest questions are still open, as they are for every mathematician. This is pure math: it won’t change your phone bill. It is a small, checkable addition to a long list."
questions_intro: "These are the six questions the paper ended with. Most are famous puzzles that experts have not solved; nobody expected to solve them here."
questions:
  - { q: "Does pi have infinitely many prime fractions?", status: "Open", text: "Cut pi’s continued fraction off at any step and you get a fraction that is very close to pi. Are infinitely many of the bottom numbers prime? **New:** an 11th one, at step 25,332." }
  - { q: "Fibonacci and Pell primes", status: "Open", text: "Two other famous lists of numbers come from the golden ratio and √2. Do they hold infinitely many primes? Nobody knows, and nothing here changes that." }
  - { q: "Can the rule of thumb be proved?", status: "Proved for almost every number", solved: true, text: "The paper guessed how many prime fractions a typical number has. We proved the guess is right for almost every number. The catch: “almost every” can still leave out pi." }
  - { q: "Is pi a typical number?", status: "Open", text: "Almost every number’s continued fraction follows the same statistics. Pi’s first 12 million terms pass every test we tried. Passing tests is not a proof." }
  - { q: "The correlation matrix", status: "Partly answered", text: "A big table that measures how often two drum beats line up. We proved a lot about it. **New:** how fast its largest and smallest values change as the table grows, and that its values settle into a fixed shape." }
  - { q: "Are prime-sized scales better?", status: "Answered: no", solved: true, text: "Do musical scales with a prime number of notes per octave tune better? No. The 171-note scale wins, for a reason tuning experts already knew." }
evidence:
  - "Pi’s 11 prime fractions, up to fraction 25,332, match what a typical number would have."
  - "The 11th itself is a probable prime: it passed the best quick tests, twice, independently. The proof is running."
  - "Pi’s first 12 million terms pass every statistical test we tried."
  - "For e, each prime ℓ divides about 6 out of every 3ℓ bottom numbers on average. Three of those are proved; the other three are what chance would give."
  - "At every size we computed, 1 divided by the matrix’s smallest value is about 2.6 to 2.7 times its largest value. Whether that ratio settles down is not known."
sections:
  - id: "new"
    h: "What’s new (added November 10, 2026)"
    paras:
      - "**An 11th prime fraction for pi.** Each fraction is built from the two before it, so the bottom numbers grow fast: by step 25,332 the bottom number has 13,017 digits. Teddy Rook tested them one by one with his own program and found that this one is a probable prime. We rebuilt it from scratch and got the same number, and checked every step between 20,000 and 25,332: there is no other. The [new prime’s page](/connections/rhythm-of-numbers/new-prime/) shows all the digits and a short program to check them."
      - "**e’s pattern, pinned down.** e = 2.71828… has a continued fraction with a pattern: 2; 1, 2, 1, 1, 4, 1, 1, 6, …. Divide its fractions’ bottom numbers by a prime, say 7, and look at the remainders. We already knew they repeat. Teddy Rook’s notes prove exactly how: after 3 × 7 = 21 steps the remainders come back with the opposite sign, and after 42 steps they come back exactly. The same holds for every prime. They also show that every whole number m divides three of the bottom numbers, so two steps out of every three can never give a prime. All ten prime bottom numbers of e known so far sit on the remaining steps. The tool is a set of exact formulas for every fraction of e, from integrals that Charles Hermite wrote down in 1873."
      - "**The correlation matrix’s growth.** Its largest value grows with the size of the table, but more slowly than any power of the size and faster than any power of its logarithm. Teddy Rook’s notes find the exact rate, up to a correction that fades away, and show that the smallest value shrinks toward zero at exactly the mirror-image rate. The method is a known one from the study of the zeta function, so experts may see this as a natural consequence of their tools; we did not find it written down for this table. His notes also prove that the crowd of values settles into a fixed shape as the table grows. We know four exact numbers that describe that shape (1, 3, 0.5599 and 3.2796), and the famous 6/π², which the paper asked about, is not one of them."
  - id: "proved"
    h: "What’s proved, and what is only evidence"
    paras:
      - "In math, a proof settles a question for good. Computer results, however many, can only support a guess. The paper labels every claim one way or the other, and so does this page."
    proved:
      - "For almost every number, the count of prime fractions follows the rule of thumb (Chapter 16)."
      - "For e: exact formulas for every fraction; which fractions are forced to be divisible by which numbers; and the exact repeat lengths, 6ℓ for the bottom numbers and 3ℓ for the top numbers."
      - "For e: a bottom number can be prime only at step 2 or at steps one more than a multiple of 3."
      - "For the matrix: the growth rate of its largest value, the mirror-image rate for its smallest value, a fixed limiting shape for all its values, and the long-run average of their reciprocals (about 3.28)."
  - id: "stands-out"
    h: "What stands out"
    paras:
      - "**How rare these primes are.** Big numbers are rarely prime: among numbers with 13,000 digits, only about 1 in 30,000 is prime, and pi’s bottom numbers do a little better, about 1 in 18,000. Pi’s bottom numbers grow by about one digit every two steps, so the chance keeps dropping. Add it all up and the expected number of prime fractions grows like a logarithm: roughly one more each time you double the number of steps. Think of a lottery where the tickets get worse every week: the wins keep coming, but further and further apart."
      - "**The long gap.** The 10th prime fraction is at step 6,925 and the 11th at step 25,332, almost four times as far. That looks strange, but the rule of thumb expected only about 1.8 primes in that stretch, and gave about a 1 in 6 chance of none at all. Long gaps are normal, and they will get longer. To expect about two more, you would have to search out to step 100,000, where the numbers have about 51,000 digits."
      - "**e is not typical.** e’s fractions are divisible by small primes about twice as often as random numbers. Half of that is now explained: three out of every 3ℓ of them are forced to be divisible by the prime ℓ, and chance seems to supply about three more."
  - id: "implications"
    h: "Potential implications"
    paras:
      - "Modest ones. This is pure math. No bridge or bank depends on whether pi has infinitely many prime fractions."
      - "It adds one more piece of evidence to the picture that pi behaves like a “random” or typical number, a picture that many experts believe and no one can prove."
      - "It shows how math research often works now: computer experiments suggest what is true, and then people try to prove it. The rule of thumb for prime fractions came from experiments like these, and for almost every number it is now a theorem."
      - "It is also a nice example of how someone outside a university, with a good computer and careful checks, can add a new entry to a list that mathematicians have kept for years."
  - id: "next"
    h: "What comes next"
    paras:
      - "**The proof.** A certificate that q₂₅₃₃₂ is prime is being computed. It may take a week or more. When it is done, the new prime’s page will say so."
      - "**Searching further.** Each step costs more than the last, because the numbers keep growing. The next prime fraction of pi may be tens of thousands of steps away."
      - "**Proving it for pi.** Showing that pi itself has infinitely many prime fractions, or that pi is typical, is far beyond today’s methods. The paper proves the rule for almost every number, and that is likely as far as anyone can go for now."
notes:
  - "Everything here is a summary of Chapters 15, 16 and 17 of [The Rhythm of Numbers paper](/connections/rhythm-of-numbers/paper/), which gives the proofs, the computations and the sources."
  - "The 11th prime fraction was found by Teddy Rook (November 2026). OEIS [A259490](https://oeis.org/A259490) lists the first ten."
  - "e’s formulas: H. Cohn, “A short proof of the simple continued fraction expansion of e,” *American Mathematical Monthly* 113 (2006), [arXiv:math/0601660](https://arxiv.org/abs/math/0601660), building on C. Hermite (1873)."
  - "The matrix: T. Hilberdink, “An arithmetical mapping and applications to Ω-results for the Riemann zeta function,” *Acta Arithmetica* 139 (2009), found the kind of growth for a closely related matrix. The method: K. Soundararajan, “Extreme values of zeta and L-functions,” *Mathematische Annalen* 342 (2008), and A. Bondarenko and K. Seip, “Large greatest common divisor sums and extreme values of the Riemann zeta function,” *Duke Mathematical Journal* 166 (2017)."
  - "e’s prime bottom numbers: OEIS [A094007](https://oeis.org/A094007), which counts from 0, so its index is one more than ours."
credits:
  - { name: "Teddy Rook", what: "the search that found the new probable prime, and the questions and the paper this page summarizes" }
---
