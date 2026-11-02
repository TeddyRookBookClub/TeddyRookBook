---
title: "The golden angle and sunflower seeds"
summary: "Turn by 137.5° before placing each new seed, and the seeds pack perfectly. Turn by a tidy fraction, and they don't."
emoji: "🌻"
gtags: [numbers, geometry]
weight: 120
ladder_links:
  - { url: "/math/precalculus/polar-coordinates/", why: "placing points by angle and distance" }
  - { url: "/math/precalculus/radian-measure/", why: "measuring turns" }
  - { url: "/math/discrete-math/linear-recurrences/", why: "the Fibonacci numbers and their formula" }
  - { url: "/math/algebra-1/", title: "Algebra 1", why: "the quadratic equation behind the golden ratio" }
  - { url: "/math/number-theory/", title: "Number Theory", why: "fractions and continued fractions" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Helmut Vogel, A better way to construct the sunflower head, Mathematical Biosciences 44 (1979)", url: "https://doi.org/10.1016/0025-5564(79)90080-4", what: "the seed model used here" }
  - { name: "Jonathan Swinton and others, Novel Fibonacci and non-Fibonacci structure in the sunflower, Royal Society Open Science 3 (2016)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4892450/", what: "counts of spirals in 657 real sunflowers" }
  - { name: "Golden angle (Grokipedia)", url: "https://grokipedia.com/page/Golden_angle", what: "the definition and value" }
---
## What you're seeing

A sunflower makes its seeds at the center, one after another. Each new seed sets off at a fixed angle turned from the one before, and the older seeds are pushed outward. Here seed number $k$ is placed at angle $k$ times the *turn angle*, at a distance $\sqrt k$ from the center. (The square root gives each seed the same share of area, because the area of a disk grows like the radius squared.)

At the golden angle, about $137.5°$, the seeds fill the head evenly with no gaps, and your eye picks out spirals running both ways. Nudge the angle by a tenth of a degree, and gaps and long arms appear.

## Why it works

**The golden angle.** The golden ratio is $\varphi = \frac{1 + \sqrt5}{2} \approx 1.618$. Split a full turn into two arcs in the golden ratio; the smaller arc is the golden angle:

$$360° \cdot \left(1 - \frac1\varphi\right) = 360° \cdot \frac{3 - \sqrt5}{2} \approx 137.508°.$$

That is about $0.382$ of a turn.

**Fractions make spokes.** If the turn is a simple fraction of a circle, say $\tfrac25$, then every 5th seed points in the same direction as the one 5 before it. The seeds stack into 5 straight spokes with wasted space between them. Try 120° ($\tfrac13$) or 144° ($\tfrac25$).

**Near-fractions make spirals.** If the turn is *close* to $\tfrac pq$, every $q$th seed points almost the same way, but drifts a little each time. The spokes bend into $q$ spiral arms. With any angle you choose, some fraction is close, and arms appear.

**The golden ratio is the hardest to approximate.** Every number can be written as a *continued fraction*. For $\varphi$ it is the simplest one possible:

$$\varphi = 1 + \cfrac{1}{1 + \cfrac{1}{1 + \cfrac{1}{1 + \cdots}}}$$

Its best fractions are ratios of Fibonacci numbers ($1, 1, 2, 3, 5, 8, 13, 21, 34, 55, \ldots$), and they close in on $\varphi$ more slowly than for any other number, in a precise sense. So no fraction fits the golden angle well, no spokes ever line up, and every new seed lands in one of the widest gaps left.

**Fibonacci spirals.** The arms you see are the near-fractions showing through: $\tfrac{5}{13}$, $\tfrac{8}{21}$, $\tfrac{13}{34}$, $\tfrac{21}{55}$. That's why the number of spirals in each direction is usually a pair of neighboring Fibonacci numbers, like 21 and 34 or 34 and 55. Color "every 21st seed" or "every 34th seed" to pick out one arm.

**Real sunflowers.** A large 2016 study counted spirals on 657 sunflowers grown by volunteers. Most showed Fibonacci numbers, but about one in five showed other or more complex patterns. Nature follows the rule closely, not perfectly. The model here, from Helmut Vogel (1979), is a simplified picture.

## Try this

- Pick 137.30° and then 137.70°. How do the gaps differ?
- Pick 144° and count the spokes. Then set the angle to 137.51° by hand.
- Color every 13th seed, then every 21st, then every 34th. Which shows the cleanest spiral near the edge?
- Press Play to grow the head from the center, and watch the order in which the seeds arrive.
