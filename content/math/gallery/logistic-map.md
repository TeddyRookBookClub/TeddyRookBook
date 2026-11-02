---
title: "The logistic map and the road to chaos"
summary: "A one-line population model settles down, then splits in two, then four, then turns to chaos."
emoji: "🌳"
gtags: [chaos, numbers]
weight: 50
ladder_links:
  - { url: "/math/algebra-2/recursive-sequences/", why: "feeding an answer back into a rule" }
  - { url: "/math/numerical-analysis/fixed-point-iteration/", why: "when repeating a function settles down" }
  - { url: "/math/precalculus/logistic-models/", why: "the logistic growth model" }
  - { url: "/math/calculus-2/logistic-equation/", why: "the smooth (calculus) version, which never goes chaotic" }
  - { url: "/math/calculus-1/", title: "Calculus 1", why: "the derivative test for a stable fixed point" }
credits:
  - { name: "Our own picture", what: "computed and drawn in your browser by code written for this page" }
  - { name: "Robert M. May, Simple mathematical models with very complicated dynamics, Nature 261 (1976)", url: "https://doi.org/10.1038/261459a0", what: "the paper that made the logistic map famous" }
  - { name: "Mitchell J. Feigenbaum, Quantitative universality for a class of nonlinear transformations, Journal of Statistical Physics 19 (1978)", url: "https://doi.org/10.1007/BF01020332", what: "the constant 4.669…" }
  - { name: "Logistic map (Grokipedia)", url: "https://grokipedia.com/page/Logistic_map", what: "the values where the period doubles" }
---
## What you're seeing

Start with a number $x$ between 0 and 1: think of it as the size of an animal population, as a fraction of the most the land can hold. Each year the new size is

$$x_{\text{next}} = r\,x\,(1 - x).$$

The factor $r$ is how fast the animals breed. The $(1 - x)$ part says crowding holds them back.

**Left: the cobweb.** The green hill is the rule; the dashed line is $y = x$. Start at $x_0$ on the bottom, go up to the hill (that's next year), across to the line (make it the new $x$), up or down to the hill again, and so on. The orange path is the history of the population.

**Right: the bifurcation diagram.** For each $r$ across the bottom, we run the rule for hundreds of years, throw away the start, and plot where $x$ keeps landing. One line means the population settles on one size. Two lines mean it alternates between two sizes. A gray smear means it never settles.

## Why it works

**Settling down.** A *fixed point* is a value that the rule leaves alone: $x^* = r x^*(1 - x^*)$. Besides $0$, the solution is $x^* = 1 - \frac1r$. Whether the population actually settles there depends on the slope of the hill at that point. Using calculus, the slope is $f'(x) = r(1 - 2x)$, so at $x^*$ it is $2 - r$. A fixed point attracts when the slope is between $-1$ and $1$:

$$|2 - r| < 1 \quad\Longleftrightarrow\quad 1 < r < 3.$$

On the cobweb, a gentle slope makes the path spiral in. A slope steeper than $-1$ makes it spiral out.

**Period doubling.** At $r = 3$ the fixed point stops attracting, and a cycle of two values takes over. At $r = 1 + \sqrt6 \approx 3.449$ that cycle splits into four, near $3.544$ into eight, and so on, faster and faster. The doublings pile up at $r \approx 3.5699$. Beyond that point, for most $r$, the population never repeats: this is chaos.

**A universal number.** The gaps between doublings shrink by almost the same factor each time, and in the limit the factor is

$$\delta \approx 4.6692.$$

Mitchell Feigenbaum found in 1975 that the same number appears for many other hill-shaped rules, and in real experiments with fluids and circuits. It is now called the Feigenbaum constant.

**Windows of order.** Inside the chaos are clear stripes. The widest one starts at $r = 1 + \sqrt8 \approx 3.828$, where a cycle of three appears and then doubles again: 6, 12, 24. Choose "the window near 3.83" to see that the picture inside looks like a small copy of the whole diagram.

**Why it matters.** In 1976 the biologist Robert May used this map to warn that simple rules can give wild results, so erratic data does not have to mean a complicated cause.

## Try this

- Set $r = 2.8$ and move the start $x_0$. Does the population always end at the same place? (Check: $1 - 1/2.8 \approx 0.643$.)
- Set $r = 3.2$. The cobweb settles into a square loop: a cycle of two.
- Set $r = 3.83$. The stats line should find a cycle of 3. Now nudge $r$ up to $3.86$.
- Press Play and watch the stats line as $r$ sweeps right.
