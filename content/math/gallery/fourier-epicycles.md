---
title: "Fourier epicycles"
summary: "Draw any loop. A chain of spinning circles, each turning at a whole-number speed, can trace it."
emoji: "✍️"
gtags: [geometry, numbers]
weight: 270
ladder_links:
  - { url: "/math/differential-equations/fourier-series/", why: "the same idea for functions on a line" }
  - { url: "/math/complex-analysis/exponential-form/", why: "Euler's formula: a spinning arrow as a complex number" }
  - { url: "/math/precalculus/complex-polar-form/", why: "size and angle of a complex number" }
  - { url: "/math/precalculus/parametric-equations/", why: "a curve traced by a moving point" }
  - { url: "/math/linear-algebra/orthogonal-projections/", why: "each circle is a projection onto one spinning pattern" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Grant Sanderson (3Blue1Brown), But what is a Fourier series? From heat flow to drawing with circles (video, 2019)", url: "https://www.youtube.com/watch?v=r6sGWTCMz2k", what: "made drawing with circles famous and inspired the idea of this piece; our picture and code are our own design" }
  - { name: "Fourier series (Grokipedia)", url: "https://grokipedia.com/page/Fourier_series", what: "history and the formulas" }
  - { name: "Deferent and epicycle (Grokipedia)", url: "https://grokipedia.com/page/Deferent_and_epicycle", what: "circles on circles in ancient astronomy" }
---
## What you're seeing

A chain of arrows, tip to tail. Each arrow spins at its own steady speed, and its circle shows the path its tip would make alone. The last tip, the red dot, draws the green curve.

Pick a shape, or press **Clear and draw** and draw your own loop with a finger or mouse. The page measures your loop, works out the arrows, and starts them spinning. Slide **Circles** down to use fewer arrows. With only a handful, you get a blobby outline. With more, the corners get sharper, until the copy is hard to tell from the original.

## Why it works

**A point on the page as a number.** Treat the point $(x, y)$ as the complex number $z = x + iy$. Then an arrow of length $r$ spinning $k$ times per lap, starting at angle $\phi$, is

$$c\, e^{2\pi i k t}, \qquad c = r e^{i\phi},$$

as $t$ goes from 0 to 1. Here $e^{i\theta} = \cos\theta + i \sin\theta$ is Euler's formula: a point on the unit circle at angle $\theta$. Adding complex numbers puts arrows tip to tail.

**The claim.** Any reasonable closed loop $z(t)$ can be written as a sum of these spinning arrows, one for each whole-number speed $k = 0, \pm1, \pm2, \ldots$:

$$z(t) = \sum_{k} c_k\, e^{2\pi i k t}.$$

**Finding each arrow.** To get $c_k$, spin the whole drawing backward at speed $k$ and average:

$$c_k = \int_0^1 z(t)\, e^{-2\pi i k t}\, dt.$$

Spinning backward at speed $k$ stops the $k$-arrow, so it stays put. Every other arrow is still turning a whole number of times, and its average is zero. So only $c_k$ survives. The page does this with 256 points along your loop, a sum in place of the integral. That's the *discrete Fourier transform*.

**Keeping only the biggest.** The page sorts the arrows by length and uses the longest ones first. Smooth, round parts of a shape need only slow arrows. Sharp corners need fast arrows, and lots of them, which is why a square takes many more circles than a blob. The stats line shows how far, on average, the copy misses the shape you drew.

**An old idea.** Astronomers in the 2nd century AD, collected by Ptolemy, used circles riding on circles, called *epicycles*, to predict the planets. Joseph Fourier's work on heat, published in 1822, showed that this kind of sum can build almost any curve. Today the same math is inside sound files, image compression and radios.

## Try this

- Pick the square and slide **Circles** to 1, 2, 3 and 4. What shape does 1 circle make? Why?
- Find the smallest number of circles where the rook still looks like a rook.
- Draw a loop with a sharp point, then a round blob. Which needs more circles to look right?
- Draw a figure 8. What do the two biggest circles do?
