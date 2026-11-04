---
title: "The Koch snowflake and the Sierpinski triangle"
summary: "A shape with an endless edge around a finite area, and a triangle with holes all the way down. Plus: what is a fractal dimension?"
emoji: "❄️"
gtags: [geometry, numbers]
weight: 110
ladder_links:
  - { url: "/math/algebra-2/geometric-series/", why: "adding up the bumps" }
  - { url: "/math/algebra-2/infinite-geometric-series/", why: "why the area stays finite" }
  - { url: "/math/algebra-2/logarithms/", why: "solving for the dimension" }
  - { url: "/math/geometry/scaling-solids/", why: "how length, area and volume scale" }
  - { url: "/math/calculus-2/sequences/", why: "limits of sequences" }
  - { url: "/connections/rhythm-of-numbers/fractals/", why: "fractals made from continued fractions: Ford circles, Cantor dust with dimension 0.5313, and a curve drawn by the golden ratio" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Helge von Koch, Sur une courbe continue sans tangente (1904)", what: "the original snowflake curve" }
  - { name: "Koch snowflake (Grokipedia)", url: "https://grokipedia.com/page/Koch_snowflake", what: "perimeter, area and dimension" }
  - { name: "Sierpiński triangle (Grokipedia)", url: "https://grokipedia.com/page/Sierpiński_triangle", what: "history and dimension" }
---
## What you're seeing

**The Koch snowflake.** Start with a triangle. Split every side into thirds and put a smaller triangle on the middle third, pointing out. Do it again to every new side, and again. The dashed line is the level before, so you can see what each step adds.

**The Sierpinski triangle.** Start with a filled triangle. Join the midpoints of its sides and cut out the middle triangle, leaving three corner triangles. Do the same to each of those, and again. The faint color shows what has been removed.

## Why it works

**The snowflake's edge has no end.** Each step replaces every side with 4 sides, each $\tfrac13$ as long. So the perimeter is multiplied by $\tfrac43$ every time:

$$P_n = P_0 \left(\frac43\right)^n \to \infty.$$

After 10 steps it's more than 17 times the start; after 100 steps, more than 3 trillion times.

**But its area is finite.** Let the first triangle have area $A_0$. Step $k$ adds $3 \cdot 4^{k-1}$ new small triangles, each with $\tfrac19$ the area of the ones before, since their sides are $\tfrac13$ as long. Adding it all up gives a geometric series:

$$A = A_0\left(1 + \frac13 + \frac13\cdot\frac49 + \frac13\left(\frac49\right)^2 + \cdots\right) = A_0\left(1 + \frac{1/3}{1 - 4/9}\right) = \frac85 A_0.$$

So the snowflake fits inside a circle, yet you could never paint its outline: the line around it is infinitely long.

**The Sierpinski triangle loses all its area.** Each step keeps 3 of 4 equal triangles, so the area is multiplied by $\tfrac34$ each time, and $\left(\tfrac34\right)^n \to 0$. Meanwhile the total length of the triangles' edges is multiplied by $\tfrac32$, which grows without limit. What's left is a dust of lines with no area at all.

**Fractal dimension.** Scale a line segment by $\tfrac13$ and you need 3 copies to rebuild it. A square needs $9 = 3^2$, and a cube $27 = 3^3$. The power is the dimension: if a shape is made of $N$ copies of itself, each scaled by $r$, then its *similarity dimension* $D$ solves

$$N = \left(\frac1r\right)^D \quad\Longrightarrow\quad D = \frac{\log N}{\log (1/r)}.$$

- The Koch curve (one side of the snowflake) is 4 copies scaled by $\tfrac13$: $D = \dfrac{\log 4}{\log 3} \approx 1.262$.
- The Sierpinski triangle is 3 copies scaled by $\tfrac12$: $D = \dfrac{\log 3}{\log 2} \approx 1.585$.

Both are between 1 and 2: more than a line, less than a filled area. That in-between number is one way to say "fractal".

**Where they came from.** Helge von Koch described his curve in 1904 as an example of a curve that is continuous but has no tangent line anywhere. Wacław Sierpiński described his triangle in 1915. The word *fractal* came later, from Benoit Mandelbrot in 1975.

## Try this

- Step the snowflake from level 0 to 7 and watch the area number. How close is it to 1.6 by level 5?
- Count the sides at level 2 by hand: $3 \cdot 4^2 = 48$. Check with the stats line.
- At what level does the Sierpinski triangle keep less than 10% of its area? (Solve $(3/4)^n < 0.1$.)
- Find a smaller copy of the whole Sierpinski triangle inside it. How many copies of size $\tfrac14$ are there?
