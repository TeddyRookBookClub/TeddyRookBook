---
title: "Ford circles"
summary: "A circle on every fraction, each one touching its neighbors. Zoom in anywhere and the same picture comes back: a fractal made of fractions."
emoji: "⭕"
gtags: [geometry, numbers]
weight: 125
ladder_links:
  - { url: "/connections/rhythm-of-numbers/fractals/", why: "Chapter VII of The Rhythm of Numbers: Ford circles, the Stern–Brocot tree, the devil's staircase and more fractals from continued fractions" }
  - { url: "/math/number-theory/continued-fractions/", why: "the fractions you fall through on the way to a number" }
  - { url: "/math/number-theory/irrational-continued-fractions/", why: "why pi and √2 never stop" }
  - { url: "/math/number-theory/euclidean-algorithm/", why: "the algorithm behind the terms" }
  - { url: "/math/geometry/tangent-lines/", why: "circles that just touch" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Lester R. Ford, Fractions, American Mathematical Monthly 45 (1938) 586–601", what: "the original circles" }
  - { name: "Ford circle (Grokipedia)", url: "https://grokipedia.com/page/Ford_circle", what: "radius, tangency and the Farey sequence" }
---
## What you're seeing

Every fraction $\tfrac{p}{q}$ between 0 and 1, written in lowest terms, gets a circle. The circle sits on the number line at $\tfrac{p}{q}$, and its radius is $\tfrac{1}{2q^2}$. So $\tfrac12$ gets a big circle, $\tfrac13$ and $\tfrac23$ smaller ones, and fractions with big bottoms get tiny ones. Lester R. Ford described these circles in 1938.

Look closely: no two circles overlap. Many of them touch. And in the curved gap between two touching circles there is always a smaller circle that touches both. Zoom in on any gap, and the same pattern of circles and gaps appears again, as far as you care to look.

## Why it works

**When do two circles touch?** Take the circles for $\tfrac{p}{q}$ and $\tfrac{r}{s}$. Their centers are at $\left(\tfrac{p}{q}, \tfrac{1}{2q^2}\right)$ and $\left(\tfrac{r}{s}, \tfrac{1}{2s^2}\right)$. Work out the square of the distance between the centers and subtract the square of the sum of the radii. Everything cancels except

$$\frac{(ps - qr)^2 - 1}{q^2 s^2}.$$

So the circles touch when $|ps - qr| = 1$, and they are apart when $|ps - qr| \ge 2$. Because the fractions are different, $ps - qr$ is never 0, so the circles can never overlap.

**The circle in the gap.** If $\tfrac{p}{q}$ and $\tfrac{r}{s}$ touch, try the fraction $\tfrac{p + r}{q + s}$ (add the tops and add the bottoms, the *mediant*). Check: $p(q + s) - q(p + r) = ps - qr = \pm 1$, and the same for the other side. So the new circle touches both. This is why the gaps never run out, and why the picture repeats at every zoom.

**Falling toward a number.** Draw a straight line down to a number, such as $\pi - 3 = 0.14159\ldots$ The circles the line passes through are some of the best fractions for that number: its continued-fraction *convergents*, $\tfrac17$ and $\tfrac{16}{113}$ (that is $\tfrac{22}{7}$ and $\tfrac{355}{113}$ for pi). A circle is pierced exactly when the fraction is within $\tfrac{1}{2q^2}$ of the number, and Legendre proved that any fraction that close must be a convergent.

## Try this

- Find the circle that touches both $\tfrac12$ and $\tfrac13$. Check your answer with the mediant rule.
- Zoom in toward pi. Which circles does the dashed line go through? Which convergent does it skip?
- Choose the golden ratio. Its convergents are ratios of Fibonacci numbers, and after $\tfrac01$ the line goes through the circle of every one of them.
- The circles of $\tfrac01$ and $\tfrac11$ have radius $\tfrac12$. How big is the circle of $\tfrac{1}{10}$ compared with them?
