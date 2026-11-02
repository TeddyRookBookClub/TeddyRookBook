---
title: "Julia sets"
summary: "Every point of the Mandelbrot set has a Julia set of its own. Move the point and watch the shape change."
emoji: "🐇"
gtags: [chaos, numbers, geometry]
weight: 20
ladder_links:
  - { url: "/math/precalculus/complex-plane/", why: "points as complex numbers" }
  - { url: "/math/precalculus/complex-polar-form/", why: "squaring doubles the angle" }
  - { url: "/math/complex-analysis/complex-functions/", why: "functions that move points of the plane" }
  - { url: "/math/numerical-analysis/fixed-point-iteration/", why: "what happens when you repeat a function" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Julia set (Grokipedia)", url: "https://grokipedia.com/page/Julia_set", what: "definitions and history" }
  - { name: "Gaston Julia, Mémoire sur l'itération des fonctions rationnelles (1918)", what: "the paper that started the subject, together with Pierre Fatou's work of the same years" }
---
## What you're seeing

On the left is a map of the Mandelbrot set with a red point on it: that point is a complex number $c$. On the right is the *Julia set* for that same $c$.

The rule is the same as for the Mandelbrot set, $z \to z^2 + c$, but now $c$ stays fixed and the starting point changes. Each pixel on the right is a starting value $z_0$. If repeating the rule keeps it close to the center, it is painted dark. If it runs away, it gets a color for how fast.

Move $c$ around. Inside the Mandelbrot set the dark shape is one connected piece: a rabbit, a tree, a chain of bubbles. Step outside, and it shatters into a fine dust.

## Why it works

**One map, many pictures.** The Mandelbrot set asks a question about every $c$ at once: starting from $z_0 = 0$, does the orbit stay bounded? The Julia set is a picture for one $c$: which starting points stay bounded? (Strictly, the Julia set is the edge of the dark region; the dark region with its edge is the *filled* Julia set.)

**The easy case.** For $c = 0$ the rule is $z \to z^2$. Squaring a complex number squares its size. If $|z_0| < 1$, the sizes shrink toward 0; if $|z_0| > 1$, they grow without limit; if $|z_0| = 1$, they stay on the circle. So the Julia set is the unit circle. Small changes to $c$ bend that circle into a wrinkled loop.

**Why the Mandelbrot set is the switch.** In the 1910s Gaston Julia and Pierre Fatou found a rule that ties the two pictures together. The orbit of the starting point $0$ (the point where $z^2 + c$ has zero derivative, called the *critical point*) decides everything:

- if the orbit of $0$ stays bounded, the Julia set is connected (one piece);
- if it escapes, the Julia set is a *Cantor set*: infinitely many separate points, like dust.

"The orbit of $0$ stays bounded" is exactly the test for $c$ being in the Mandelbrot set. So the Mandelbrot set is a catalog: it marks which $c$ give one-piece Julia sets.

**Symmetry.** Replacing $z$ by $-z$ does not change $z^2$, so every Julia set looks the same after a half turn about the center.

**Near the edge, they look alike.** Zoom into the Mandelbrot set near a point $c$, and the shapes you see often resemble the Julia set for that $c$. Tan Lei proved this for a special family of edge points (the Misiurewicz points) in 1990.

## Try this

- Start at $c = 0$ (the circle). Drag the point slowly toward the rabbit. When do the "ears" appear?
- Put $c$ just outside the edge, then just inside. Watch the shape break apart.
- Try $c = -1$ by hand: $0 \to -1 \to 0 \to -1$. The orbit of 0 is a cycle of two, so the basilica is one piece.
- Press Play: $c$ travels around just inside the big heart shape of the Mandelbrot set, and the Julia set turns and twists with it.
