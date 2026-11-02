---
title: "Still unsolved"
summary: "Four questions about whole numbers that anyone can understand and no one has answered: twin primes, Goldbach, Collatz and the Riemann hypothesis."
emoji: "❓"
gtags: [unsolved, numbers, famous-problems]
weight: 320
ladder_links:
  - { url: "/math/number-theory/infinitely-many-primes/", why: "Euclid's proof, the one we do have" }
  - { url: "/math/number-theory/prime-counting/", why: "how common primes are, and the prime number theorem" }
  - { url: "/math/number-theory/pseudoprimes/", why: "how the page tests huge numbers for primality" }
  - { url: "/math/calculus-2/integral-test/", why: "the sum of 1/nˢ, which becomes the zeta function" }
  - { url: "/math/complex-analysis/exponential-form/", why: "complex powers, needed to define ζ(s)" }
  - { url: "/math/discrete-math/counterexamples/", why: "why checking many cases is not a proof" }
credits:
  - { name: "Our own picture", what: "computed and drawn in your browser by code written for this page" }
  - { name: "Twin prime (Grokipedia)", url: "https://grokipedia.com/page/Twin_prime", what: "the conjecture and its history" }
  - { name: "D. H. J. Polymath, The \"bounded gaps between primes\" Polymath project: a retrospective (2014)", url: "https://arxiv.org/abs/1409.8361", what: "the gap bound of 246" }
  - { name: "Goldbach's conjecture (Grokipedia)", url: "https://grokipedia.com/page/Goldbach's_conjecture", what: "the 1742 letter and later results" }
  - { name: "T. Oliveira e Silva, S. Herzog and S. Pardi, Empirical verification of the even Goldbach conjecture… up to 4·10¹⁸, Mathematics of Computation 83 (2014)", url: "https://www.ams.org/journals/mcom/2014-83-288/S0025-5718-2013-02787-1", what: "the computer check" }
  - { name: "H. A. Helfgott, The ternary Goldbach conjecture is true (2013)", url: "https://arxiv.org/abs/1312.7748v2", what: "the proof that every odd number above 5 is a sum of three primes" }
  - { name: "Collatz conjecture (Grokipedia)", url: "https://grokipedia.com/page/Collatz_conjecture", what: "history and known results" }
  - { name: "David Bařina, Improved verification limit for the convergence of the Collatz conjecture, Journal of Supercomputing 81 (2025)", url: "https://www.fit.vut.cz/research/publication/c197809", what: "the check up to 2⁷¹" }
  - { name: "Riemann hypothesis (Grokipedia)", url: "https://grokipedia.com/page/Riemann_hypothesis", what: "the statement and its history" }
  - { name: "D. Platt and T. Trudgian, The Riemann hypothesis is true up to 3·10¹², Bulletin of the London Mathematical Society 53 (2021)", url: "https://arxiv.org/abs/2004.09765v1", what: "the rigorous check of the zeros" }
  - { name: "L. Guth and J. Maynard, New large value estimates for Dirichlet polynomials, Annals of Mathematics 203 (2026)", url: "https://annals.math.princeton.edu/2026/203-2/p06", what: "the 2024 advance on how many zeros can be off the line" }
  - { name: "Clay Mathematics Institute, The Millennium Prize Problems (2006)", url: "https://www.claymath.org/library/monographs/MPPc.pdf", what: "the prize and the official statement of the problem" }
---
## What you're seeing

Pick one of four problems at the top. Each has a box to try your own numbers and a chart.

- **Twin primes.** Type any number, up to $10^{18}$, and the page finds the next pair of primes two apart, like 11 and 13. The chart counts all twin pairs up to 2,000,000 (green) next to a prediction made in 1923 (gold).
- **Goldbach.** Type an even number and the page splits it into two primes. The chart, often called *Goldbach's comet*, shows how many ways each even number up to 20,000 can be split. The number of ways grows, and the lowest edge of the comet never comes near zero.
- **Collatz.** Type a start and follow the halve-or-triple-plus-one rule down to 1. The Collatz page in this gallery explores this one in depth.
- **Riemann hypothesis.** Pick where to start on the line, and the page draws a wave called $Z(t)$. Each place it crosses zero (red dot) is a zero of the Riemann zeta function.

Every case you try will work. That's the point: no one has found a counterexample, and no one has a proof.

## Why it works

**Testing huge numbers.** To check whether a 15-digit number is prime, the page doesn't try dividing by everything. It uses the Miller–Rabin test, based on Fermat's little theorem: if $p$ is prime, then $a^{p-1} \equiv 1 \pmod p$. A composite number almost always fails some test of this kind. With the first 12 primes as the bases $a$, the test is known to give no wrong answers for numbers below about $3 \times 10^{24}$.

**Twin primes.** Primes near $x$ appear about once every $\ln x$ numbers. If two numbers two apart were prime independently, we'd expect about $x / (\ln x)^2$ twin pairs up to $x$. Hardy and Littlewood corrected this for the way divisibility by small primes affects neighbors, and predicted

$$\pi_2(x) \approx 2C_2 \int_2^x \frac{dt}{(\ln t)^2}, \qquad C_2 \approx 0.6601618.$$

The chart shows how closely real counts follow this.

**Goldbach.** An even number $n$ has many chances to be $p + q$: about $n / (2 \ln n)$ choices of prime $p$ below $n/2$, and each $n - p$ has about a $1/\ln n$ chance of being prime. That's roughly $n / (\ln n)^2$ ways, which grows without bound. That's why the comet rises.

**The Riemann hypothesis.** The zeta function starts as the sum

$$\zeta(s) = 1 + \frac{1}{2^s} + \frac{1}{3^s} + \cdots,$$

and Bernhard Riemann showed in 1859 that its zeros control exactly how the primes are spread out. Besides "trivial" zeros at $-2, -4, -6, \ldots$, all its zeros lie in a strip, and Riemann guessed they all lie on the middle line where $s = \tfrac12 + it$. On that line there is a real-valued wave $Z(t)$, made by Hardy, with $|Z(t)| = |\zeta(\tfrac12 + it)|$. So every sign change of $Z$ is a zero on the line. The page computes $Z(t)$ with the Riemann–Siegel formula,

$$Z(t) \approx 2\sum_{n \le \sqrt{t/2\pi}} \frac{\cos\big(\theta(t) - t\ln n\big)}{\sqrt{n}},$$

plus a small correction term. The first zero is at $t \approx 14.1347$. The page also counts the zeros it finds and compares them with the number Riemann's formula predicts. If a zero were ever *off* the line, there would be a missing sign change, and the counts would disagree.

## Where it stands today

As of 2026, all four are **unsolved**. Here is what is proved and what has been checked.

**Twin primes** (are there infinitely many pairs $p$, $p + 2$?)
- In 2013 Yitang Zhang proved that infinitely many pairs of primes differ by less than 70,000,000. James Maynard (and, separately, Terence Tao) soon cut this to 600, and a large online collaboration (Polymath) brought it down to **246** in 2014. Getting from 246 to 2 needs new ideas.
- Assuming an unproved conjecture about how primes spread (the generalized Elliott–Halberstam conjecture), the gap would come down to 6.

**Goldbach** (is every even number above 2 a sum of two primes?) Christian Goldbach raised it in a letter to Leonhard Euler in 1742.
- Checked by computer for every even number up to $4 \times 10^{18}$ (Oliveira e Silva, Herzog and Pardi, 2014).
- The "weak" version, that every odd number above 5 is a sum of three primes, was proved by Harald Helfgott in 2013.
- Chen Jingrun proved in 1973 that every large enough even number is a prime plus a number with at most two prime factors.

**Collatz** (does every start reach 1?)
- Checked for every start up to $2^{71}$ (Bařina, 2025). Terence Tao proved in 2019 that almost every start falls very low, but not that every one reaches 1.

**The Riemann hypothesis** (are all the nontrivial zeros on the line $s = \tfrac12 + it$?)
- It is one of Hilbert's 23 problems (1900) and one of the Clay Mathematics Institute's seven Millennium Prize Problems (2000), with a \$1,000,000 prize.
- G. H. Hardy proved in 1914 that infinitely many zeros lie on the line. Since 1989, at least 40% of them are known to be on it.
- Every zero with $0 < t \le 3 \times 10^{12}$ has been checked and lies on the line (Platt and Trudgian, 2021).
- In 2024 Larry Guth and James Maynard proved a new limit on how many zeros could possibly be off the line, the first big improvement of its kind since the 1940s.

## Try this

- Twin primes: search after 1,000,000,000,000. How far did you have to go? Try $10^{15}$. Do the pairs get rarer?
- Goldbach: try 100. Then try a few even numbers near 1,000,000. Is the smallest prime that works ever large?
- Goldbach: in the comet, find the stripes. Numbers divisible by 3 (like 30 or 60) sit higher. Why might that be?
- Riemann: start at 10 and find the first red dot. Then start at 1,000. Are the zeros closer together up there?
- Collatz: try any big number you like, up to 40 digits.
