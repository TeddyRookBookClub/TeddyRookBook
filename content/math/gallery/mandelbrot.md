---
title: "The Mandelbrot set"
summary: "One tiny rule, repeated, draws a shape with endless detail. Zoom in as far as you like."
emoji: "🌀"
gtags: [chaos, numbers, geometry]
weight: 10
ladder_links:
  - { url: "/math/precalculus/complex-plane/", why: "points as complex numbers" }
  - { url: "/math/algebra-2/complex-arithmetic/", why: "adding and multiplying complex numbers" }
  - { url: "/math/complex-analysis/modulus-conjugate/", why: "the size of a complex number" }
  - { url: "/math/algebra-2/recursive-sequences/", why: "rules that feed their answer back in" }
  - { url: "/math/calculus-2/sequences/", why: "when a sequence settles, and when it runs away" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page; the colors are our own" }
  - { name: "Mandelbrot set (Grokipedia)", url: "https://grokipedia.com/page/Mandelbrot_set", what: "history and the known facts about the set" }
  - { name: "Benoit B. Mandelbrot, The Fractal Geometry of Nature (1982)", what: "the book that made the set famous" }
  - { name: "Mitsuhiro Shishikura, The Hausdorff dimension of the boundary of the Mandelbrot set and Julia sets, Annals of Mathematics 147 (1998)", url: "https://arxiv.org/abs/math/9201282", what: "the boundary has dimension 2" }
---
## What you're seeing

Every point of the picture is a complex number $c$. For each one, we start at $z = 0$ and apply one rule again and again:

$$z \to z^2 + c$$

If $z$ stays close to the center forever, the point $c$ belongs to the Mandelbrot set, and we paint it dark. If $z$ runs off toward infinity, $c$ is outside, and its color tells how fast it escaped. Points that escape slowly sit right next to the edge.

Zoom in on the edge and you keep finding more: spirals, branches, and small copies of the whole set, each with its own fringe of detail.

## Why it works

**The rule.** Write $c = a + bi$. Squaring a complex number squares its size and doubles its angle, then adding $c$ shifts it. So the sequence for $c$ is

$$z_0 = 0,\quad z_1 = c,\quad z_2 = c^2 + c,\quad z_3 = (c^2 + c)^2 + c,\ \ldots$$

**A quick escape test.** If $|z|$ ever gets bigger than 2, it will run away for sure. Here is why. Suppose $|z| > 2$ and $|z| \ge |c|$. Then

$$|z^2 + c| \ge |z|^2 - |c| \ge |z|^2 - |z| = |z|\,(|z| - 1),$$

and $|z| - 1 > 1$, so the size grows by at least a fixed factor each step. That is why a computer can stop as soon as $|z| > 2$ and mark the point as outside. A point that has not escaped after many steps is probably inside. The "steps per point" slider sets how long we wait. Too few steps, and points near the edge get painted as inside by mistake, so the edge looks blurry.

**Two shapes you can check by hand.** For $c = 0$ the sequence is $0, 0, 0, \ldots$: inside. For $c = -1$ it is $0, -1, 0, -1, \ldots$: a cycle, still inside. For $c = 1$ it is $0, 1, 2, 5, 26, \ldots$: outside. The big heart shape (a *cardioid*) is the set of $c$ where the sequence settles down to one fixed point. The disk to its left, centered at $-1$ with radius $\tfrac14$, is where it settles into a cycle of two.

**What is known.** In 1982 Adrien Douady and John Hubbard proved that the set is *connected*: it is all one piece, even though the thin threads are too fine to see. In 1998 Mitsuhiro Shishikura proved that its boundary is so wrinkled that its fractal dimension is 2, the same as a filled-in area. Whether the set is "locally connected" (a technical way of asking whether the threads join up nicely) is still an open question, known as the MLC conjecture.

**The smooth colors.** Counting steps gives bands of color. We blend the bands using how far past 2 the last value went, which gives smooth shading. The colors are a choice; the set itself is only "inside" or "outside".

## Try this

- Pick *Seahorse valley* and zoom in on a curl. Raise the steps if the edge looks fuzzy.
- Find a tiny copy of the whole set. Where is it attached?
- Check $c = i$ by hand: $0, i, -1 + i, -i, -1 + i, \ldots$ It never escapes, so $i$ is in the set. Find it on the picture (it is the tip of a thin thread at the top).
- Move the center somewhere, then open the Julia set for that point. Inside the set, the Julia set is one piece; outside, it falls to dust.
