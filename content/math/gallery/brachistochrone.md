---
title: "The brachistochrone"
summary: "What is the fastest slide from A down to B? Not the straight line. The winner is a curve called a cycloid."
emoji: "🛝"
gtags: [famous-problems, geometry]
weight: 300
ladder_links:
  - { url: "/math/calculus-2/parametric-calculus/", why: "arc length along a curve given by x(θ) and y(θ)" }
  - { url: "/math/precalculus/parametric-equations/", why: "the cycloid as a parametric curve" }
  - { url: "/math/calculus-1/optimization/", why: "finding the best value, one number at a time" }
  - { url: "/math/calculus-2/arc-length/", why: "adding up small pieces of a curve" }
  - { url: "/math/precalculus/projectile-motion/", why: "motion under gravity" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "Brachistochrone curve (Grokipedia)", url: "https://grokipedia.com/page/Brachistochrone_curve", what: "the 1696 challenge and its solutions" }
  - { name: "Cycloid (Grokipedia)", url: "https://grokipedia.com/page/Cycloid", what: "the curve's formulas and the tautochrone property" }
  - { name: "Herman H. Goldstine, A History of the Calculus of Variations from the 17th through the 19th Century (Springer, 1980)", what: "the Bernoullis, Newton and Leibniz on the problem" }
---
## What you're seeing

Three beads start at A at the same moment and slide down to B with no friction. One slides along a **straight line** (blue), one along a **parabola** (gold), and one along a **cycloid** (green), the curve traced by a spot on a rolling wheel.

The straight line is the shortest path, but it loses. The cycloid dives steeply at first, picks up speed early, and wins every time. When B is far across, the cycloid even dips *below* B and climbs back up, and it still wins.

The times are worked out from the physics for a drop of 1 meter. The race is shown slowed down so you can follow it.

## Why it works

**Speed depends only on how far you've dropped.** With no friction, energy is conserved. A bead that has fallen a height $y$ has speed

$$v = \sqrt{2 g y},$$

where $g \approx 9.81\ \text{m/s}^2$. The shape of the track doesn't change the speed at a given depth. It only changes how far you have to travel and *when* you get deep.

**The time for a track.** A small piece of track of length $ds$, at depth $y$, takes time $ds / v$. Adding these up,

$$T = \int_A^B \frac{ds}{\sqrt{2 g y}}.$$

A steep start makes $y$ big early, so the rest of the trip is fast. But too steep a start makes the path long. The best curve balances the two.

**The answer is a cycloid.** Roll a wheel of radius $r$ along the underside of a ceiling. A spot on its rim traces

$$x = r(\theta - \sin\theta), \qquad y = r(1 - \cos\theta).$$

Along this curve, $ds = 2r \sin\tfrac{\theta}{2}\, d\theta$ and $y = 2r \sin^2\tfrac{\theta}{2}$, so the integrand simplifies beautifully:

$$\frac{ds}{\sqrt{2 g y}} = \sqrt{\frac{r}{g}}\, d\theta, \qquad T = \theta_B \sqrt{\frac{r}{g}}.$$

The page picks $r$ and $\theta_B$ so the curve passes through B. Proving that no other curve does better needs the *calculus of variations*, which grew out of this very problem.

**A famous challenge.** In 1696 Johann Bernoulli challenged the best mathematicians of Europe to find this curve. Answers came from Johann himself, his brother Jakob, Gottfried Leibniz, Guillaume de l'Hôpital and Isaac Newton. Newton sent his solution without a name, but Johann is said to have recognized the author "as the lion by its claw." Johann's own solution borrowed an idea from light: a light ray bends to take the quickest path through glass and air, and he treated the falling bead the same way.

**A second surprise.** On a cycloid, a bead let go from *any* point reaches the bottom in the same time. Christiaan Huygens found this in 1659 and used it to design more accurate pendulum clocks. The cycloid is also called the *tautochrone*, Greek for "same time."

## Try this

- Set B to 1 meter across, so A to B is a 45° slope. How much faster is the cycloid than the line?
- Slide B out to 4 meters. Watch the green bead go lower than B. Does it still win?
- Bring B in close to 0.5 meters. Which bead is now hardest to tell apart from the cycloid?
- Use $T = \theta_B\sqrt{r/g}$: if B is at the lowest point of the arch, so $\theta_B = \pi$, what is $T$ for $r = 1$ m? Compare it with the time to fall straight down 2 m.
