---
title: "Random walks: will you find your way home?"
summary: "Take steps in random directions. On a line or a flat grid you are sure to get back home. In space, you might not."
emoji: "🚶"
gtags: [probability, famous-problems]
weight: 90
ladder_links:
  - { url: "/math/probability-and-statistics/binomial-distribution/", why: "counting steps left and right" }
  - { url: "/math/probability-and-statistics/random-variable-spread/", why: "why the typical distance is √n" }
  - { url: "/math/probability/variance-of-sums/", why: "the spread of a sum of steps" }
  - { url: "/math/probability/markov-chains/", why: "walks as Markov chains" }
  - { url: "/math/calculus-2/comparison-tests/", why: "series that add up to infinity, or don't" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "George Pólya, Über eine Aufgabe der Wahrscheinlichkeitsrechnung betreffend die Irrfahrt im Straßennetz, Mathematische Annalen 84 (1921)", url: "https://doi.org/10.1007/BF01458701", what: "the theorem on returning home" }
  - { name: "Random walk (Grokipedia)", url: "https://grokipedia.com/page/Random_walk", what: "background and the 3D return chance" }
---
## What you're seeing

**On a line.** Four walkers start at home (0). Each second, each one flips a coin: heads, one step right; tails, one step left. The chart shows where they are over time. They wander far, but every so often they cross back through home. The counts in the stats line keep track.

**On a grid.** Choose "On a grid" to watch one walker on city streets: each step goes north, south, east or west, each with chance $\tfrac14$. The gold dot is home. Let it run, speed it up, and it keeps coming back, though the gaps between visits get longer and longer.

## Why it works

**How far do you get?** Write each step as $+1$ or $-1$. Each step has mean 0 and variance 1, and the steps are independent, so after $n$ steps the position $S_n$ has

$$E[S_n] = 0, \qquad \operatorname{Var}(S_n) = n, \qquad \text{typical distance} \approx \sqrt n.$$

After 10,000 steps a walker is typically about 100 steps from home, not 10,000. The walk spreads out, but slowly.

**Coming home on a line.** To be home after $2n$ steps, you need exactly $n$ right steps and $n$ left steps:

$$P(S_{2n} = 0) = \binom{2n}{n}\frac{1}{4^n} \approx \frac{1}{\sqrt{\pi n}}.$$

(The approximation comes from Stirling's formula.) The expected number of visits home is the sum of these chances over all $n$. Since $\sum \frac1{\sqrt n}$ adds up to infinity, you expect infinitely many visits, and that forces a return with probability 1. You will come home, again and again.

**In more dimensions.** On a flat grid, being home needs the walk to balance in two directions at once, and the chance after $2n$ steps is about $\frac1{\pi n}$. The sum $\sum \frac1n$ still adds up to infinity, though barely, so you still come home for sure. In three dimensions the chance is about a constant times $n^{-3/2}$, and $\sum n^{-3/2}$ is finite. So the walker can drift off and never return.

This is **Pólya's theorem** (1921): a simple random walk returns home with probability 1 on a line and on a flat grid, but not in three or more dimensions. In 3D, the chance of ever getting back is about $34\%$. The mathematician Shizuo Kakutani is often quoted as putting it this way: a drunk man will find his way home, but a drunk bird may get lost forever.

**Sure, but not soon.** Even on a line, the *average* time to come home is infinite. Most walkers return quickly, but a few wander so long that the average blows up. That's why the 2D walker's visits get rarer as it goes.

**The test.** "Test 600 walkers" lets 600 walkers in each space take up to 4,000 steps. On a line, nearly all get home. On the grid, most do, and more would with more time. In 3D, only about a third do, and waiting longer barely helps.

## Try this

- Run the line walk for 10,000 steps. Is each walker within a few times $\sqrt{10{,}000} = 100$ of home?
- Which walker has spent the most time above 0? It's common for one walker to stay on one side almost the whole time.
- Run the grid walk at top speed. Count the returns home as it goes.
- Run the test several times. Which number moves most?
