---
title: "Collatz paths"
summary: "Halve it if it's even; triple it and add one if it's odd. Every number tried so far falls to 1, but no one can prove they all do."
emoji: "🪜"
gtags: [numbers, unsolved, famous-problems]
weight: 260
ladder_links:
  - { url: "/math/number-theory/divisibility/", why: "even and odd, and what divides what" }
  - { url: "/math/algebra-2/recursive-sequences/", why: "a sequence where each term comes from the one before" }
  - { url: "/math/algebra-2/log-scales/", why: "reading the path on a log scale" }
  - { url: "/math/discrete-math/strong-induction/", why: "the kind of proof that would settle it, and why it gets stuck" }
  - { url: "/math/number-theory/number-bases/", why: "halving is easy to see in base 2" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Collatz conjecture (Grokipedia)", url: "https://grokipedia.com/page/Collatz_conjecture", what: "history and known results" }
  - { name: "David Bařina, Improved verification limit for the convergence of the Collatz conjecture, Journal of Supercomputing 81 (2025)", url: "https://www.fit.vut.cz/research/publication/c197809", what: "the check of every start up to 2⁷¹" }
  - { name: "Terence Tao, Almost all orbits of the Collatz map attain almost bounded values, Forum of Mathematics, Pi 10 (2022)", url: "https://arxiv.org/abs/1909.03562v5", what: "the strongest partial result" }
  - { name: "Christian Hercher, There are no Collatz m-cycles with m ≤ 91, Journal of Integer Sequences 26 (2023)", url: "https://arxiv.org/abs/2201.00406v3", what: "the bound on other loops" }
  - { name: "Jeffrey C. Lagarias (ed.), The Ultimate Challenge: The 3x + 1 Problem (American Mathematical Society, 2010)", what: "the history of the problem and its many forms" }
---
## What you're seeing

Pick a starting number. Then follow one rule over and over:

- if the number is even, **halve it**;
- if it is odd, **triple it and add 1**.

The top chart follows the path. Even steps are green dots, odd steps are gold. Start at 6 and you go 6, 3, 10, 5, 16, 8, 4, 2, 1. Once you reach 1, you loop 1, 4, 2, 1 forever, so we stop there.

Most small starts get to 1 quickly. Then there's 27. It wanders up and down for 111 steps, climbing as high as 9,232, before it finally falls to 1. The bottom chart shows how many steps every start from 1 to 10,000 takes. Tap it to pick a start.

## Why it works

**Why it tends to fall.** An odd number $n$ becomes $3n + 1$, which is always even, so the next step halves it. Two steps together take $n$ to $\frac{3n+1}{2}$, about $1.5\,n$. An even number is simply halved. If odd and even steps came up like coin flips, a long stretch would multiply the number by about $1.5$ half the time and by $0.5$ the other half. On average, each step multiplies it by

$$\sqrt{1.5 \times 0.5} = \sqrt{0.75} \approx 0.87,$$

which is less than 1. So the "typical" path drifts down. That's a good reason to believe the conjecture, but it is not a proof. A proof must cover *every* start, including any rare one that might keep getting lucky.

**Why it's hard.** To prove all paths reach 1, you'd want to show that every number $n$ eventually drops below where it started. Then strong induction finishes the job. But no one knows how to control the mix of odd and even steps for a single given $n$. The rule mixes multiplying (which acts on the size of a number) with parity (which acts on its last binary digit), and those two are hard to study together.

## Where it stands today

The problem is often credited to Lothar Collatz, who studied it in the 1930s. As of 2026 it is **still unsolved**. What is known:

- **Checked by computer:** every start up to $2^{71}$, about $2.4 \times 10^{21}$, reaches 1 (David Bařina, 2025).
- **Almost all, almost bounded:** in 2019 Terence Tao proved that almost every start eventually goes lower than any slowly growing bound you choose, such as $\log\log\log n$. That is the strongest result so far, but it still leaves room for rare exceptions.
- **No short loops:** any loop besides 1, 4, 2 would have to be very long. Christian Hercher showed in 2023 that it would need at least 92 separate runs of climbing followed by falling.
- **Close cousins are impossible to decide:** John Conway showed in 1972 that some problems built the same way, with a few more rules, can't be settled by any general method.

There are two ways the conjecture could fail: some path could climb forever, or some path could fall into a different loop. No one has ruled out either one.

## Try this

- Do 7 by hand. How many steps does it take? How high does it go?
- Press **+ 1** a few times from 27. Why do 27 and 28 take such different routes, while 28 and 29 take the same number of steps?
- Try 871, the start under 1,000 with the most steps. How many?
- Try $2^{64} - 1$. Big starts don't always take long. Can you see why powers of 2 fall fastest of all?
- Look at the bottom chart. Does the number of steps keep growing as starts get bigger? Roughly how fast?
