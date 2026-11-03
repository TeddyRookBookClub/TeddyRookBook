---
title: "The Hopf fibration"
summary: "A sphere in four dimensions made entirely of circles, every one linked with every other. Pick points and watch their circles appear."
emoji: "🔗"
gtags: [geometry]
weight: 330
ladder_links:
  - { url: "/math/precalculus/complex-plane/", why: "complex numbers as points of a plane" }
  - { url: "/math/complex-analysis/modulus-conjugate/", why: "the size |z| of a complex number" }
  - { url: "/math/complex-analysis/exponential-form/", why: "multiplying by e^(it) turns a point around a circle" }
  - { url: "/math/complex-analysis/mobius/", why: "maps of the complex numbers plus a point at infinity" }
  - { url: "/math/linear-algebra/orthogonal-matrices/", why: "rotations of space that keep lengths" }
  - { url: "/math/abstract-algebra/group-actions/", why: "the circle acting on the 3-sphere; each fiber is one orbit" }
  - { url: "/math/calculus-4/curl-divergence-meaning/", why: "the curl behind magnetic helicity" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page, from the formulas below" }
  - { name: "Heinz Hopf, Über die Abbildungen der dreidimensionalen Sphäre auf die Kugelfläche, Mathematische Annalen 104 (1931), 637–665", url: "https://eudml.org/doc/159489", what: "the original paper" }
  - { name: "A. M. Kamchatnov, Topological soliton in magnetohydrodynamics, Sov. Phys. JETP 55 (1982), 69 (English text on arXiv)", url: "https://arxiv.org/abs/physics/0409093", what: "the magnetic field whose lines are Hopf fibers" }
  - { name: "Antonio F. Rañada, A topological theory of the electromagnetic field, Letters in Mathematical Physics 18 (1989), 97–106", url: "https://doi.org/10.1007/BF00401864", what: "knotted light built on the Hopf map" }
  - { name: "H. K. Moffatt, The degree of knottedness of tangled vortex lines, Journal of Fluid Mechanics 35 (1969), 117–129", url: "https://www.keithmoffatt.com/1960s", what: "helicity and how it counts linking" }
  - { name: "M. A. Berger and G. B. Field, The topological properties of magnetic helicity, Journal of Fluid Mechanics 147 (1984), 133–148", url: "https://www.cambridge.org/core/journals/journal-of-fluid-mechanics/article/topological-properties-of-magnetic-helicity/CBF3020A84DF9DFA4894162430595777", what: "magnetic helicity as twist, writhe and linking" }
  - { name: "L. Faddeev and A. J. Niemi, Stable knot-like structures in classical field theory, Nature 387 (1997), 58–61", url: "https://doi.org/10.1038/387058a0", what: "knotted solitons (hopfions) in a field theory" }
  - { name: "C. B. Smiet and others, Self-organizing knotted magnetic structures in plasma, Physical Review Letters 115 (2015), 095001", url: "https://arxiv.org/abs/1507.08780", what: "simulations of a plasma started as a Hopf field" }
  - { name: "Physicists tie light into knots (Physics World, 2013)", url: "https://physicsworld.com/a/physicists-tie-light-into-knots/", what: "the 2013 knotted-light solutions of Kedia and colleagues" }
  - { name: "Hopf fibration (Grokipedia)", url: "https://grokipedia.com/page/Hopf_fibration", what: "the map, the fibers and the nested tori" }
  - { name: "3-sphere (Grokipedia)", url: "https://grokipedia.com/page/3-sphere", what: "the sphere in four dimensions" }
  - { name: "Stereographic projection (Grokipedia)", url: "https://grokipedia.com/page/Stereographic_projection", what: "how the picture flattens a sphere" }
  - { name: "Linking number (Grokipedia)", url: "https://grokipedia.com/page/Linking_number", what: "Gauss's integral for how two loops link" }
  - { name: "Spheromak (Grokipedia)", url: "https://grokipedia.com/page/Spheromak", what: "the compact torus in fusion research" }
  - { name: "Hopfion (Grokipedia)", url: "https://grokipedia.com/page/Hopfion", what: "hopfions in field theory and in magnets" }
  - { name: "Villarceau circles (Wikipedia)", url: "https://en.wikipedia.org/wiki/Villarceau_circles", what: "the tilted circles on a torus" }
  - { name: "Magnetic helicity (Wikipedia)", url: "https://en.wikipedia.org/wiki/Magnetic_helicity", what: "the helicity integral" }
  - { name: "Niles Johnson, a talk on the Hopf fibration (video)", url: "https://www.youtube.com/watch?v=QXDQsmL-8Us", what: "further watching; our picture is our own design" }
  - { name: "3Blue1Brown, Visualizing quaternions with stereographic projection (video lesson)", url: "https://www.3blue1brown.com/lessons/quaternions", what: "further watching on seeing the 3-sphere; our picture is our own design" }
---
## What you're seeing

On the left is an ordinary globe, the sphere $S^2$. On the right are circles in space. Every point you pick on the globe has a whole circle that belongs to it, called its **fiber**. Each fiber gets the color of its point.

- Tap the globe to add a point. Its fiber appears on the right.
- Switch "Tapping the sphere adds" to a latitude circle. A ring of points on the globe gives a ring of fibers, and together they sweep out a **torus**, a donut.
- Pick "Nested tori" for three latitudes: three donuts, one inside the next.
- Drag a point on the globe toward the south pole (or use the slider) and watch its fiber grow. At the south pole itself, the fiber becomes a straight line through the middle of everything.
- Turn on the Villarceau view to see the grid of the donut you picked last. One of its fibers is drawn bold. Follow it: it goes once around the hole and once through it, then closes up.
- The beads ride along the fibers. Every bead stays on its own circle forever.

Drag either picture, or use the arrow keys, to turn it. The readout uses Gauss's formula to compute, from the drawing itself, how many times two of the circles link. It always comes out 1.

## Why it works

**Circles and spheres.** A circle, $S^1$, is all the points at distance 1 from a center in a plane. The globe, $S^2$, is all the points at distance 1 from a center in space. Go up one more dimension and you get the **3-sphere**, $S^3$: all points at distance 1 from the origin in four dimensions. With complex numbers it has a neat description. Use two complex numbers $z_1$ and $z_2$ (that is four real numbers), and keep the pairs with

$$|z_1|^2 + |z_2|^2 = 1.$$

**The Hopf map.** In 1931 Heinz Hopf found a way to send each point of $S^3$ to a point of the globe:

$$(z_1, z_2) \mapsto \big(2 z_1 \bar z_2,\; |z_1|^2 - |z_2|^2\big).$$

The first part is a complex number (two real numbers), the second is real, so the result is a point in space. Its length is $|z_1|^2 + |z_2|^2 = 1$, so it lands on the globe. Another way to say the same thing: send the pair to the fraction $z_1 / z_2$, a complex number or $\infty$, and place it on the globe (with $0$ at the south pole and $\infty$ at the north pole).

Now turn both numbers by the same angle $t$: $(e^{it} z_1, e^{it} z_2)$. The fraction $z_1/z_2$ does not change. So as $t$ goes from $0$ to $2\pi$, a whole circle of points of $S^3$ lands on the same spot of the globe. That circle is the fiber. Every point of $S^3$ lies on exactly one fiber, so $S^3$ is made entirely of circles, one for each point of the globe.

**Seeing $S^3$.** Write $z_1 = x_1 + i x_2$ and $z_2 = x_3 + i x_4$. *Stereographic projection* sends a point of $S^3$ to ordinary space by

$$(x_1, x_2, x_3, x_4) \mapsto \frac{(x_1, x_2, x_3)}{1 - x_4}.$$

It is the same trick a map maker uses to flatten a globe onto paper from one pole, done one dimension up. It keeps circles as circles, except that a circle through the point $(0, 0, 0, 1)$ goes off to infinity and comes back as a straight line. That is the fiber over the south pole, where $z_1 = 0$: it becomes the vertical axis. The fiber over the north pole, where $z_2 = 0$, is the flat unit circle around that axis.

**Donuts inside donuts.** The points at angle $\theta$ from the north pole have $|z_1| = \cos\tfrac{\theta}{2}$ and $|z_2| = \sin\tfrac{\theta}{2}$. Their fibers fill a torus. Small $\theta$ gives a thin donut hugging the unit circle. As $\theta$ grows the donut gets fatter, and near the south pole it fills almost all of space around the axis. Every fiber on a donut is a tilted circle, a *Villarceau circle*, that winds once the long way and once the short way.

**Linked once.** The unit circle and the vertical axis are linked: the axis passes through the circle. Now slide the two points on the globe anywhere you like, keeping them apart. The fibers move but never touch, so they can't come unlinked. Any two fibers link exactly once. The readout checks this with Gauss's *linking integral* for two loops:

$$\mathrm{Lk} = \frac{1}{4\pi} \oint \oint \frac{(\mathbf{r}_1 - \mathbf{r}_2) \cdot (d\mathbf{r}_1 \times d\mathbf{r}_2)}{|\mathbf{r}_1 - \mathbf{r}_2|^3}.$$

## Where it shows up

**Magnetic fields.** In a magnetic field, *helicity*, $H = \int \mathbf{A} \cdot \mathbf{B}\, dV$, measures how linked the field lines are. Keith Moffatt showed in 1969 that for two thin, untwisted tubes of flux $\Phi_1$ and $\Phi_2$ that link once, $H = \pm 2\Phi_1 \Phi_2$. In an ideal (perfectly conducting) fluid, helicity is conserved, because field lines can't cross.

**Hopfions in plasma.** In 1982 A. M. Kamchatnov wrote down a magnetic field whose lines are exactly the Hopf fibers, so every line is a closed circle linked once with every other. With the fluid flowing along the lines at the right speed, it is an exact steady solution of the equations of ideal magnetohydrodynamics. It is often called the Kamchatnov–Hopf soliton, or a hopfion. In computer simulations (Smiet and colleagues, 2015), a plasma started in this shape relaxed into nested donuts that held together for a long time. It is a solution on paper and in simulations, not a fusion device.

**Knotted light.** In 1989 Antonio Rañada used the Hopf map to build exact solutions of Maxwell's equations in empty space in which the field lines are closed loops, each linked with the others. In 2013 Kedia and colleagues found whole families of such solutions, including knotted ones.

**Hopfions in field theory.** In 1997 Ludvig Faddeev and Antti Niemi showed that a field theory with a field taking values on a sphere has stable, knot-shaped solutions. The number that counts how they wrap is the Hopf number, which is the linking number of two fibers. Hopfion textures have since been reported in magnetic materials.

**The fusion donut.** A tokamak's field also lies on nested donuts, and its lines also wind the long way and the short way. But it is a cousin, not a twin. In the Hopf picture every line closes after one turn each way, on every donut. In a tokamak the amount of winding changes from one donut to the next, and most field lines never close at all. A spheromak, a compact ball of plasma studied for fusion, also has nested donuts of linked field lines, made by currents in the plasma itself. See [The geometry of the donut](/science-lab/magnetic-bottles/#mb-geo) on the Magnetic Bottles page.

## Try this

- Pick "Two points". Drag one of them to the north pole, then close to the south pole. Where is its fiber a flat circle, and where does it start to look like a straight line?
- Pick "A latitude" and slide its angle from small to large. When is the donut thin, and when is it fat?
- Turn on the Villarceau view and follow the bold fiber with your finger. Count how many times it goes around the hole and how many times through it.
- Pick "Random points" and turn the view until you can see that each circle is linked with every other one.
- Take two rubber bands and link them like two fibers. Can you add a third that links each of the first two exactly once?
