---
title: "The numbers behind the periodic table"
short: "2n²"
sets: [math, chemistry]
weight: 150
teaser: "Why the table's rows hold 2, 8, 18 and 32 elements, and how balancing a chemical equation is a problem in linear algebra."
golinks:
  - { url: "/chemistry/general-chemistry-1/quantum-numbers/", why: "the numbers n, l, m and spin" }
  - { url: "/chemistry/chemistry/orbitals-sublevels/", why: "s, p, d and f sublevels" }
  - { url: "/chemistry/chemistry/electron-configuration/", why: "writing electron configurations" }
  - { url: "/chemistry/chemistry/balancing-equations/", why: "balancing by inspection" }
  - { url: "/math/linear-algebra/null-column-spaces/", why: "the null space that holds the answer" }
  - { url: "/math/linear-algebra/echelon-form/", why: "row reduction, step by step" }
  - { url: "/chemistry/chemistry/half-life/", why: "exponential decay in the nucleus" }
credits:
  - { name: "Electron configuration (Grokipedia)", url: "https://grokipedia.com/page/Electron_configuration", what: "shells, subshells and 2n²" }
  - { name: "Aufbau principle (Grokipedia)", url: "https://grokipedia.com/page/Aufbau_principle", what: "the n + l (Madelung) filling order and its exceptions" }
  - { name: "Chemical equation (Grokipedia)", url: "https://grokipedia.com/page/Chemical_equation", what: "balancing equations, including the matrix method" }
  - { name: "Kernel (linear algebra) (Grokipedia)", url: "https://grokipedia.com/page/Kernel_(linear_algebra)", what: "null spaces" }
  - { name: "Our own pictures", what: "the shell squares, the filling chart and the equation balancer were drawn by code written for this page" }
---
### Why 2, 8, 18, 32?

An electron in an atom is described by whole numbers. The shell number $n$ is 1, 2, 3, … Inside shell $n$, the subshell number $l$ runs from 0 to $n-1$ (chemists call these s, p, d and f). Subshell $l$ has $2l + 1$ orbitals: 1, 3, 5, 7. Each orbital holds two electrons, one of each spin.

So shell $n$ holds two times a sum of odd numbers, and odd numbers always add up to a square:

$$1 + 3 + 5 + \dots + (2n-1) = n^2, \qquad \text{so shell } n \text{ holds } 2n^2 \text{ electrons}.$$

That gives 2, 8, 18 and 32. The same numbers set the widths of the table's blocks: the s block is 2 columns wide, p is 6, d is 10 and f is 14.

Why do the rows go 2, 8, 8, 18, 18, 32, 32, with repeats? Because subshells don't fill shell by shell. They fill in order of $n + l$, smallest first, so 4s fills before 3d. A new row of the table starts each time a new s subshell begins.

[[viz:mc-shells|Left: tap a layer of a square to see its subshell. Right: fill the subshells in order and watch the rows of the table appear.]]

### Balancing an equation is linear algebra

When propane burns, $a\,\mathrm{C_3H_8} + b\,\mathrm{O_2} \rightarrow c\,\mathrm{CO_2} + d\,\mathrm{H_2O}$. Atoms are never created or destroyed, so each element gives one equation:

$$\text{C: } 3a = c, \qquad \text{H: } 8a = 2d, \qquad \text{O: } 2b = 2c + d.$$

That is a matrix equation $M\mathbf{x} = \mathbf{0}$. Its solutions (the matrix's **null space**) form a line through zero, and the smallest whole-number point on it, $a = 1, b = 5, c = 3, d = 4$, is the balanced equation. Big reactions with dozens of molecules are balanced this way by computer.

[[viz:mc-balance|Try to balance each reaction with + and −, then open "Show the algebra" to see the matrix.]]

The same math shows up in the nucleus. A radioactive sample loses half of what is left in each **half-life**, so the amount after $t$ half-lives is $N = N_0 \left(\tfrac{1}{2}\right)^t$, an exponential decay.
