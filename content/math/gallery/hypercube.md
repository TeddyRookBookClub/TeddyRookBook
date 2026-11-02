---
title: "The 4D hypercube"
summary: "We can't build a four-dimensional cube, but we can draw its shadow, the same way a drawing of a cube is a shadow of a 3D shape."
emoji: "🧊"
gtags: [geometry]
weight: 220
ladder_links:
  - { url: "/math/calculus-3/space-coordinates/", why: "points with three coordinates; a fourth works the same way" }
  - { url: "/math/linear-algebra/linear-combinations/", why: "vectors in four (or more) dimensions" }
  - { url: "/math/linear-algebra/geometric-maps/", why: "rotations as matrices" }
  - { url: "/math/precalculus/matrix-transformations/", why: "turning points with sines and cosines" }
  - { url: "/math/discrete-math/binomial-identities/", why: "counting corners, edges and faces with binomial coefficients" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Tesseract (Grokipedia)", url: "https://grokipedia.com/page/Tesseract", what: "the counts of corners, edges, squares and cubes, and the history of the name" }
  - { name: "Hypercube (Grokipedia)", url: "https://grokipedia.com/page/Hypercube", what: "cubes in any number of dimensions" }
  - { name: "Edwin A. Abbott, Flatland (1884)", what: "the classic story of thinking one dimension up; public domain" }
---
## What you're seeing

On the left is an ordinary cube turning, drawn on a flat screen. On the right is a **tesseract**, or 4D hypercube, turning in four dimensions and drawn the same way, one step further.

Look at the cube first. Its drawing is a square inside a square, with the corners joined. The back face looks smaller because it is farther away. That's perspective.

Now look at the hypercube. It looks like a cube inside a cube, with the corners joined. The inner cube is the "far" cube in the fourth direction. As it turns in a plane that uses the fourth direction (we call it $w$), the inner cube swells and slides out while the outer one shrinks and slides in, until they trade places. Nothing is bending: every edge keeps its true length in 4D. Only the shadow changes.

The colors show direction: green edges run along $x$, blue along $y$, gold along $z$, and the thinner red edges along $w$.

## Why it works

**Building up one dimension at a time.** Start with a point. Slide it 1 unit and it sweeps out a segment (2 ends). Slide the segment sideways and it sweeps out a square (4 corners). Slide the square up and you get a cube (8 corners). Slide the cube in a fourth direction, at right angles to all three, and you get the tesseract: 16 corners. Each slide doubles the corners and joins each old corner to its copy.

**Coordinates make it exact.** Put the corners at every point whose coordinates are all $\pm 1$. A cube has corners $(\pm1, \pm1, \pm1)$: $2^3 = 8$ of them. A tesseract has corners $(\pm1, \pm1, \pm1, \pm1)$: $2^4 = 16$. Two corners share an edge when they differ in exactly one coordinate. Each corner has 4 neighbors, so there are $16 \cdot 4 / 2 = 32$ edges. Counting faces the same way, an $n$-cube has

$$\binom{n}{k}\, 2^{\,n-k}$$

pieces of dimension $k$. For $n = 4$: 16 corners, 32 edges, 24 squares and 8 cubes.

**Turning in four dimensions.** In 3D we say a turn happens "about an axis", but it is really a turn in a plane. Turning in the $x$–$y$ plane moves $x$ and $y$ and leaves the rest alone:

$$x' = x\cos\theta - y\sin\theta, \qquad y' = x\sin\theta + y\cos\theta.$$

In 4D there are six planes to turn in ($xy$, $xz$, $xw$, $yz$, $yw$, $zw$). The picture turns in the planes you tick, the ones that use $w$, because those are the turns that look strange.

**Two shadows.** To draw a 3D point $(x, y, z)$ with perspective, divide by the distance from your eye: the screen point is about $(x, y)/(d - z)$. To draw a 4D point, do it twice. First divide by $(d - w)$ to get a 3D point, then divide by the depth again to reach the screen. That is why the "far" cube in $w$ looks small and sits inside.

**Why we can't just look at it.** Our eyes and our space give us three directions at right angles. A fourth one has nowhere to fit. But nothing in the algebra above cares: a fourth coordinate works just like the other three. That is how mathematicians "see" in 4, 10 or 1,000 dimensions.

## Try this

- Turn off all three turning planes except $x$–$w$. Watch the inner cube trade places with the outer one. How long until it comes back?
- In the cube on the left, count the squares you see. Some are squashed into other shapes by perspective. Find all 6.
- In the hypercube, find all 8 cubes. Hint: the inner cube, the outer cube, and 6 "slanted" cubes that join a face of one to a face of the other.
- Using $\binom{n}{k} 2^{n-k}$, how many corners, edges and squares does a 5D cube have?
