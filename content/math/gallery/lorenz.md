---
title: "The Lorenz attractor"
summary: "Three simple equations from a weather model trace a looping, never-repeating path. Turn it around in 3D."
emoji: "🦋"
gtags: [chaos, famous-problems]
weight: 40
ladder_links:
  - { url: "/math/differential-equations/systems-matrix-form/", why: "systems of differential equations" }
  - { url: "/math/differential-equations/linearization/", why: "how the two centers become unstable" }
  - { url: "/math/differential-equations/phase-portraits/", why: "drawing paths instead of formulas" }
  - { url: "/math/differential-equations/numerical-methods/", why: "stepping an equation forward" }
  - { url: "/math/calculus-3/", title: "Calculus 3", why: "curves in three dimensions" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "Edward N. Lorenz, Deterministic Nonperiodic Flow, Journal of the Atmospheric Sciences 20 (1963)", url: "https://doi.org/10.1175/1520-0469(1963)020%3C0130:DNF%3E2.0.CO;2", what: "the original equations and values" }
  - { name: "Warwick Tucker, A Rigorous ODE Solver and Smale's 14th Problem, Foundations of Computational Mathematics 2 (2002)", url: "https://doi.org/10.1007/s002080010018", what: "the proof that the strange attractor exists" }
  - { name: "Lorenz system (Grokipedia)", url: "https://grokipedia.com/page/Lorenz_system", what: "background and the critical values of ρ" }
---
## What you're seeing

A point moves through space following three rules. It circles one center, then jumps to circle the other, then back, with no pattern to how many loops it makes on each side. The path never crosses itself and never repeats, yet it stays on a thin, two-winged shape: the *Lorenz attractor*.

There are two points, starting only $0.001$ apart. For a while their trails overlap. Then they drift apart, and soon one is on the left wing while the other is on the right. They still trace the same shape.

## Why it works

**The equations.** In 1963 the meteorologist Edward Lorenz cut a model of air rising in a heated layer down to three numbers $x, y, z$ that change in time:

$$\frac{dx}{dt} = \sigma (y - x), \qquad \frac{dy}{dt} = x(\rho - z) - y, \qquad \frac{dz}{dt} = xy - \beta z$$

He used $\sigma = 10$, $\beta = \tfrac83$ and $\rho = 28$, as we do here. Roughly, $x$ is how fast the air turns over, and $y$ and $z$ describe the temperature pattern.

**The two centers.** Set all three rates to zero and solve. Besides the origin, you get two points

$$C_\pm = \left(\pm\sqrt{\beta(\rho - 1)},\ \pm\sqrt{\beta(\rho - 1)},\ \rho - 1\right),$$

marked with small crosses. For small $\rho$ they are stable: a path spirals into one of them and stops there, like a ball settling in a bowl. Above about $\rho \approx 24.74$ they become unstable. The path is pushed away from one center, swings over to the other, is pushed away again, and never settles.

**Stretch and fold.** Why doesn't it fly off? The equations shrink volumes: a small blob of starting points loses volume at the rate $\sigma + 1 + \beta$ (about 13.7) per unit of time. So every path is squeezed onto a set with no volume at all. But within that thin set, nearby paths are stretched apart. Stretching plus folding back is the recipe for chaos, and it is why tiny differences grow.

**Lorenz's discovery.** Lorenz found this by accident. He restarted a computer run using numbers rounded to three decimal places, and the new forecast soon looked nothing like the old one. He later asked, in the title of a 1972 talk, whether the flap of a butterfly's wings in Brazil could set off a tornado in Texas. That is where the name "butterfly effect" comes from.

**A computer-assisted proof.** For decades nobody could prove that the shape on the screen was a true *strange attractor* and not an artifact of rounding. Stephen Smale put the question on his 1998 list of problems for the new century. Warwick Tucker settled it in 2002, using a computer to bound every rounding error rigorously.

## Try this

- Watch the stats line: how long until the two points are more than 1 apart?
- Set $\rho = 14$ and restart. Where does the path end up?
- Set $\rho = 24$. It wanders for a while before it settles. Then try $\rho = 26$.
- Turn the view so you look straight down the $z$ axis. Then turn it to look from the side: the wings are thin.
