---
title: "The Galton board"
summary: "Each ball bounces left or right at random, yet together they always build the same bell-shaped pile."
emoji: "🔔"
gtags: [probability]
weight: 60
ladder_links:
  - { url: "/math/probability-and-statistics/binomial-distribution/", why: "counting rights out of N bounces" }
  - { url: "/math/discrete-math/lattice-paths/", why: "counting the paths to each bin" }
  - { url: "/math/algebra-2/binomial-theorem/", why: "Pascal's triangle and binomial coefficients" }
  - { url: "/math/probability-and-statistics/normal-curve/", why: "the bell curve" }
  - { url: "/math/probability/clt-sums/", why: "the central limit theorem" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "Francis Galton, Natural Inheritance (1889)", what: "Galton's description of his board, which he called the quincunx", licence: "public domain" }
  - { name: "Galton board (Grokipedia)", url: "https://grokipedia.com/page/Galton_board", what: "history" }
---
## What you're seeing

Balls fall through a triangle of pegs. At each peg a ball bounces left or right, with even chances. After the last row it lands in a bin. Watch one ball, and its path is anybody's guess. Watch a thousand, and the pile always takes the same shape: tall in the middle, thin at the edges. The red curve is the *bell curve*, and the pile hugs it more closely the more balls you add.

Francis Galton built a board like this in the 1870s to show how chance adds up. He called it a *quincunx*, after the pattern of five dots on a die.

## Why it works

**Count the rights.** With $N$ rows, a ball makes $N$ choices. The bin it lands in only depends on how many of them were "right": bin $k$ means $k$ rights and $N - k$ lefts. The order doesn't matter.

**Count the paths.** How many paths have exactly $k$ rights? Choose which $k$ of the $N$ rows they happen in:

$$\binom{N}{k} = \frac{N!}{k!\,(N - k)!}.$$

These are the numbers in Pascal's triangle. Every path has the same chance, $\left(\tfrac12\right)^N$, so

$$P(\text{bin } k) = \binom{N}{k}\left(\frac12\right)^N.$$

With 12 rows, the middle bin can be reached by $\binom{12}{6} = 924$ paths, and an end bin by only 1. That's the whole reason for the hump: there are many more ways to land in the middle.

**Center and spread.** The number of rights is a *binomial* count, with mean $\mu = Np$ and standard deviation $\sigma = \sqrt{Np(1-p)}$, where $p$ is the chance of bouncing right. For 12 rows and $p = \tfrac12$, that's $\mu = 6$ and $\sigma = \sqrt3 \approx 1.73$. The stats line compares your balls with these numbers.

**The bell curve.** As $N$ grows, the binomial shape gets closer and closer to the normal curve with the same $\mu$ and $\sigma$:

$$\frac{1}{\sigma\sqrt{2\pi}}\, e^{-(x - \mu)^2 / (2\sigma^2)}.$$

This is the simplest case of the *central limit theorem*: add up many small, independent random pushes, and the total is close to bell-shaped, almost whatever the pushes look like. Here each push is $0$ or $1$. The theorem is why bell curves show up for heights, measurement errors and test scores: each is the sum of many small causes.

**A lean.** If the pegs push right more often ($p > \tfrac12$), the hump moves right and becomes a little narrower. It is still close to a bell when there are enough rows, but with few rows and a strong lean you can see it go lopsided.

## Try this

- Add 1,000 balls with 12 rows. How close is the middle bin to $924/4096 \approx 22.6\%$ of them?
- Set 4 rows. The pile is still a hump, but a lumpy one. Now set 20.
- Set the chance of bouncing right to 0.8 with 6 rows. Is the pile still symmetric?
- Empty the board and watch the first 20 balls. The bell shape only appears with numbers.
