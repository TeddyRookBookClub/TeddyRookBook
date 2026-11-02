---
title: "Space-filling curves"
summary: "A single line, folded again and again, that ends up passing through every point of a square."
emoji: "〰️"
gtags: [geometry, famous-problems]
weight: 210
ladder_links:
  - { url: "/math/algebra-1/geometric-sequences/", why: "the length doubles (or triples) each level" }
  - { url: "/math/calculus-2/sequences/", why: "a curve as the limit of a sequence of curves" }
  - { url: "/math/calculus-1/continuity/", why: "what it means for the limit curve to be continuous" }
  - { url: "/math/discrete-math/bijections-inverses/", why: "why the limit curve can't be one-to-one" }
  - { url: "/math/number-theory/number-bases/", why: "Peano's rule uses base 3, Hilbert's uses base 4" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Space-filling curve (Grokipedia)", url: "https://grokipedia.com/page/Space-filling_curve", what: "history and the main theorems" }
  - { name: "Hilbert curve (Grokipedia)", url: "https://grokipedia.com/page/Hilbert_curve", what: "the construction and its uses" }
  - { name: "Peano curve (Grokipedia)", url: "https://grokipedia.com/page/Peano_curve", what: "Peano's 1890 construction" }
  - { name: "Hans Sagan, Space-Filling Curves (Springer, 1994)", what: "the base-3 formula for Peano's curve and the proofs of continuity" }
---
## What you're seeing

A square is cut into a grid of small cells. One unbroken path visits the center of every cell exactly once, never crossing itself. Its color runs from green at the start to gold at the end, so you can follow where it goes.

Move up a level and each cell is cut again: into 4 smaller cells for **Hilbert's curve**, or 9 for **Peano's**. The path is redrawn through all of the new cells, keeping the same overall plan. Press **Trace it** to watch the path being drawn in order.

Notice two things. The path gets longer fast, and it gets closer and closer to every spot in the square. At level 7 of Hilbert's curve, no point of the square is more than one tiny cell away from the path.

## Why it works

**Each level is four copies of the last.** Hilbert's level-1 curve is a simple cup shape through the 4 cells of a 2 × 2 grid. To make the next level, shrink the curve to half size, put one copy in each quarter of the square, and turn the first and last copies so the four pieces join end to end. Repeat. Peano's curve does the same with 9 copies in a 3 × 3 grid, snaking up, down and up again.

**The length grows without limit.** Take a 1 × 1 square. At level $n$, Hilbert's path goes through $4^n$ cells, each of side $2^{-n}$, with one step between neighbors:

$$L_n = \frac{4^n - 1}{2^n} = 2^n - 2^{-n}.$$

So the lengths are 1.5, 3.75, 7.875, … and roughly double each level. For Peano's curve, $L_n = 3^n - 3^{-n}$.

**But the curves settle down.** Follow a point a fixed fraction $t$ of the way along the path, say $t = 0.3$. When you go up a level, that point only moves around inside the small cell where it already was. The cells shrink to nothing, so the point settles on a definite spot in the square. Call that spot $f(t)$. The limit curve $f$ is continuous: nearby values of $t$ land on nearby spots, because they share the same small cells at every level.

**It hits every point.** Pick any spot in the square. At every level it lies in some cell, and the path passes through that cell. The fractions $t$ for those visits close in on one number, and $f$ of that number is your spot. So a curve, a thing with no width at all, covers the whole square. When Giuseppe Peano published the first such curve in 1890, it shocked mathematicians, who had thought of dimension as something a continuous curve could not change. David Hilbert's simpler version came a year later, in 1891.

**It can't do it neatly.** The limit curve must visit some spots more than once. A theorem of Eugen Netto (1879) says no continuous curve can match the line to the square one-to-one. You can find one double point yourself. Each quarter of the path fills its whole quarter, corners included, and the center of the square is a corner of all four quarters. Only neighboring quarters share an end, so the limit curve passes through the center at least twice.

**Why people use them.** Hilbert's ordering keeps nearby cells mostly near each other on the path. Databases and maps use it to store points that are close together in space close together in memory, and image programs use it to visit pixels in a cache-friendly order.

## Try this

- Compare level 2 and level 3 of Hilbert's curve. Can you find four shrunken copies of level 2 inside level 3? Which two are turned?
- Use the length formula. How many levels until Hilbert's curve is over 100 units long inside a 1 × 1 square?
- Switch to Peano's curve at level 2. Where does it start and end? Why can Peano's curve end in the opposite corner while Hilbert's ends on the same side it started?
- Turn off "Show the cells" at level 7. Can you still see the four quarters?
