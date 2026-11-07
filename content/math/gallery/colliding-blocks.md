---
title: "Colliding blocks count π"
summary: "Slide a heavy block into a light one that sits by a wall, and count the clacks: 3, 31, 314, 3141."
emoji: "🧱"
gtags: [geometry, numbers, famous-problems]
weight: 75
ladder_links:
  - { url: "/science-lab/newtons-laws/momentum/", why: "momentum, and why it is conserved in a collision" }
  - { url: "/math/geometry/circle-equation/", why: "why the energy rule draws a circle" }
  - { url: "/math/geometry/inscribed-angles/", why: "the angle at the edge is half the angle at the center" }
  - { url: "/math/precalculus/inverse-trig/", why: "the angle θ = arctan(1/√r)" }
  - { url: "/math/precalculus/radian-measure/", why: "why the answer is π and not 180" }
  - { url: "/math/pre-algebra/reflections/", why: "each clack is a reflection" }
credits:
  - { name: "Our own picture and sound", what: "computed, drawn and played in your browser by code written for this page; every collision is solved exactly, one at a time" }
  - { name: "Gregory Galperin, “Playing pool with π (the number π from a billiard point of view),” Regular and Chaotic Dynamics 8 (2003), 375–394", url: "https://doi.org/10.1070/RD2003v008n04ABEH000252", what: "the puzzle and its proof" }
  - { name: "3Blue1Brown, “The most unexpected answer to a counting puzzle” (2019)", url: "https://www.youtube.com/watch?v=HEfHFsfGXjs", what: "the video that made the puzzle famous" }
  - { name: "3Blue1Brown, “Why do colliding blocks compute pi?” (2019)", url: "https://www.youtube.com/watch?v=jsYwFizhncE", what: "the hidden-circle explanation" }
  - { name: "3Blue1Brown, “How colliding blocks act like a beam of light… to compute pi” (2019)", url: "https://www.youtube.com/watch?v=brU5yLm9DZM", what: "a second way to see it" }
  - { name: "3Blue1Brown, “There's more to those colliding blocks that compute pi” (2025)", url: "https://www.youtube.com/watch?v=6dTyOl1fmDo", what: "a newer telling of the same story" }
---
## What you're seeing

A small block sits between a wall and a big block. The big block slides toward it. There's no friction, and every bump is perfectly bouncy, so no energy is lost. The small block gets knocked into the wall, bounces back, hits the big block again, and so on, until both blocks drift away to the right and never meet again. Count every clack, block on block and block on wall.

- Equal masses: **3** clacks.
- Big block 100 times heavier: **31**.
- 10,000 times: **314**.
- 1,000,000 times: **3141**.

Those are the first digits of $\pi = 3.14159\ldots$ Each time the big block gets 100 times heavier, one more digit appears. Gregory Galperin found this and proved it in 2003, and a 2019 video by 3Blue1Brown made it famous.

The right panel is the secret. Press Play, then watch the red dot hop around a circle.

## Why it works

**Two rules.** Call the masses $m$ (small) and $M$ (big), and the speeds $v$ and $V$ (positive means moving right). Every clack between the blocks keeps two things the same:

- the energy, $\tfrac12 m v^2 + \tfrac12 M V^2$;
- the momentum, $m v + M V$.

A clack on the wall just flips the small block's speed, $v \to -v$, which keeps the energy the same too.

**Stretch the picture until energy is a circle.** Plot the point $x = \sqrt M\,V$, $y = \sqrt m\,v$. Then the energy rule says

$$x^2 + y^2 = M V^2 + m v^2 = \text{constant},$$

so the point always stays on one circle. That's the circle in the right panel (we shrank it to radius 1, so it plots $V$ across and $v \div \sqrt{M/m}$ up).

**Each clack is a straight hop.** A wall clack flips $y$, so the point jumps straight up or down. A block clack keeps the momentum $\sqrt M\,x + \sqrt m\,y$ fixed, so the point slides along a line with a fixed slope until it meets the circle again. Every hop is a chord of the circle, and the hops take turns between those two directions.

**The angle.** The two directions meet at the angle $\theta$ with

$$\tan\theta = \sqrt{\frac{m}{M}}.$$

Here's the key step. Each hop and the one after it meet on the circle at the angle $\theta$. An angle drawn from a point on a circle is half the angle at the center (the *inscribed angle theorem*). So the dot before the two hops and the dot after them are $2\theta$ apart, seen from the center. Put together, the dots march around the circle from the far left in steps of $2\theta$, along the top and the bottom at once, like mirror images.

**When does it stop?** The clacks end once both blocks move right and the big one is at least as fast: $0 \le v \le V$. On the circle that's the thin gold wedge of angle $\theta$ at the right. The dots keep marching, $2\theta$ apart, until the next one would land in the wedge. A full circle is $2\pi$, so the number of dots is about $2\pi \div 2\theta = \pi/\theta$. Count carefully and the exact answer is

$$\text{clacks } = \text{ the number of whole numbers } n \ge 1 \text{ with } n\theta < \pi.$$

That's $\pi/\theta$ rounded down, or one less when $\pi/\theta$ is exactly a whole number. Equal masses give $\theta = 45° = \pi/4$, so $\pi/\theta = 4$ exactly, and the count is 3.

**Where the digits come from.** If $M = 100^N m$, then $\tan\theta = 10^{-N}$. For a tiny angle, $\theta$ is very close to $\tan\theta$, so $\pi/\theta$ is very close to $\pi \cdot 10^N$: 3.14…, 31.4…, 314.1…, 3141.5…. Round down and you get the first $N+1$ digits of $\pi$.

**The fine print.** "Very close" isn't "equal." In fact $\pi/\theta$ is a hair bigger than $\pi \cdot 10^N$, by about $\pi/(3 \cdot 10^N)$. That hair would only matter if the digits of $\pi$ right after the first $N+1$ were a run of about $N$ nines in a row. That never happens in the trillions of digits anyone has computed, so the rule holds for every size we can check. No one has proved it holds for every $N$. Galperin points this out in his paper.

**Why not just simulate it with tiny time steps?** With a million-to-one ratio, the last thousand clacks happen in a blink, with the small block rattling in a tiny gap. Small time steps would miss clacks. Here each clack is found exactly: the code works out when the next hit happens, jumps straight to it, and uses the collision formulas. Then the playback slows down during the rattle so you can watch it.

**Not the continued-fraction story.** [The Rhythm of Numbers](/connections/rhythm-of-numbers/) builds π from its best fractions, like 22/7 and 355/113. The blocks give π's decimal digits instead, through an angle. It's a different road to the same number. For a road paved with chance instead, try [Buffon's needle](/math/gallery/buffons-needle/), where dropped sticks estimate $\pi$.

## Try this

- Start with equal masses. Use **Next clack** to step through all 3, and match each one to a hop on the circle.
- At 100 to 1, count the spokes on the circle. Do the gaps look equal? Where is the one smaller gap?
- At 1,000,000 to 1, watch how close the big block gets to the wall before it turns around.
- Why does a ratio of 100 add one digit, and not a ratio of 10? (Hint: the angle uses a square root.)
- Turn the sound on and listen to the rattle speed up as the big block pushes in.
