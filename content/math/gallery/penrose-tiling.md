---
title: "Penrose tilings"
summary: "Two diamond-shaped tiles that cover the whole floor with a pattern that never repeats."
emoji: "🔷"
gtags: [geometry, famous-problems]
weight: 240
ladder_links:
  - { url: "/math/geometry/polygon-angle-sums/", why: "why angles of 36°, 72°, 108° and 144° fit around a point" }
  - { url: "/math/geometry/similarity-transformations/", why: "each new tile is a shrunken copy" }
  - { url: "/math/algebra-2/recursive-sequences/", why: "the tile counts follow a recursive rule" }
  - { url: "/math/pre-algebra/irrational-numbers/", why: "the golden ratio is irrational, which is why the pattern can't repeat" }
  - { url: "/math/linear-algebra/eigen-intro/", why: "the ratio φ is an eigenvalue of the cutting rule" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Penrose tiling (Grokipedia)", url: "https://grokipedia.com/page/Penrose_tiling", what: "history, the rhomb tiles, deflation and matching rules" }
  - { name: "List of aperiodic sets of tiles (Grokipedia)", url: "https://grokipedia.com/page/List_of_aperiodic_sets_of_tiles", what: "later aperiodic tiles, including the 2023 one-tile set" }
  - { name: "Branko Grünbaum and G. C. Shephard, Tilings and Patterns (1987)", what: "the half-triangle (Robinson triangle) method of cutting tiles" }
---
## What you're seeing

The floor is covered by two shapes: a **thick** diamond (gold) with angles of 72° and 108°, and a **thin** one (green) with angles of 36° and 144°. All edges are the same length.

Press **Cut once more** and every tile is cut into smaller thick and thin tiles by the same fixed rule. The new tiles are smaller by the golden ratio $\varphi \approx 1.618$. Do it again and again. The pattern spreads to fill the view, with stars, flowers and rings of ten, but it never settles into a repeating grid like bathroom tiles do.

Watch the stats line: the number of thick tiles divided by the number of thin tiles gets closer and closer to $\varphi$.

## Why it works

**Half-tiles make the rule simple.** Each diamond is cut along a diagonal into two triangles, called Robinson triangles. A thin diamond gives two triangles with angles 36°, 72°, 72°. A thick diamond gives two with angles 108°, 36°, 36°. The cutting rule (called *deflation*) is:

- a thin half-tile becomes one smaller thin half and one smaller thick half;
- a thick half-tile becomes one smaller thin half and two smaller thick halves.

The new points are placed $1/\varphi$ of the way along an edge. Since $\varphi$ is the ratio of a diagonal to a side in a regular pentagon, all the angles still fit.

**Counting the tiles.** Write $t_n$ and $T_n$ for the thin and thick half-tiles at level $n$. The rule says

$$t_{n+1} = t_n + T_n, \qquad T_{n+1} = t_n + 2T_n.$$

These are Fibonacci-style steps. The ratio $T_n / t_n$ heads to the number $r$ with $r = \frac{1 + 2r}{1 + r}$, which gives $r^2 = r + 1$, so $r = \varphi = \frac{1 + \sqrt{5}}{2}$.

**Why it can't repeat.** If the tiling repeated like wallpaper, a large enough patch would hold thick and thin tiles in a fixed ratio of whole numbers. But in this tiling the ratio is exactly $\varphi$, and $\varphi$ is irrational: it is not a fraction of whole numbers. So no repeating pattern can match it. (The same two diamonds *can* tile a floor in a repeating way if you place them freely. Penrose added *matching rules*, marks on the edges that must line up, and with those rules every tiling of the whole plane is non-repeating.)

**History.** Roger Penrose found his tilings in the 1970s. The best known use a kite and a dart, or these two diamonds. In 1982 Dan Shechtman found crystals whose atoms are ordered like this, with fivefold symmetry that a repeating crystal cannot have. These *quasicrystals* won him the 2011 Nobel Prize in Chemistry. In 2023, David Smith, Joseph Myers, Craig Kaplan and Chaim Goodman-Strauss found a single tile shape, nicknamed "the hat," that covers the plane only in non-repeating ways.

## Try this

- At level 1, find a thin and a thick diamond. Measure (by eye) their angles. Do 36° + 144° and 72° + 108° each make 180°?
- Count the tiles yourself for levels 0 to 3 using the rule above, starting from 10 thin halves. Do your numbers match the stats line?
- At level 6, look for a "star" of five thick diamonds meeting at a point. How many can you find?
- Pause the animation midway through a fade and see the old tiles behind the new ones.
