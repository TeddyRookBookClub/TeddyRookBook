---
title: "Order that survives, order that breaks"
short: "Chaos"
sets: [math, patterns, physics]
weight: 280
teaser: "Give a regular motion a small regular kick. Some of its smooth curves survive and some break into chaos. Which ones survive depends on how well a single number can be matched by fractions."
golinks:
  - { url: "/connections/rhythm-of-numbers/butterfly/", title: "Butterfly of a Number", why: "a fractal energy spectrum built from fractions" }
  - { url: "/math/gallery/double-pendulum/", why: "chaos you can watch" }
  - { url: "/math/gallery/logistic-map/", why: "another road from order to chaos" }
  - { url: "/math/gallery/golden-angle/", why: "the golden ratio" }
  - { url: "/connections/rhythm-of-numbers/#ch1", title: "The Rhythm of Numbers: continued fractions", why: "why some numbers are close to fractions" }
credits:
  - { name: "Kolmogorov–Arnold–Moser theorem (Grokipedia)", url: "https://grokipedia.com/page/Kolmogorov%E2%80%93Arnold%E2%80%93Moser_theorem", what: "the theorem and its history" }
  - { name: "Standard map (Grokipedia)", url: "https://grokipedia.com/page/Standard_map", what: "the kicked rotor and its picture" }
  - { name: "Hofstadter's butterfly (Grokipedia)", url: "https://grokipedia.com/page/Hofstadter%27s_butterfly", what: "the fractal spectrum of an electron in a lattice and a magnetic field" }
---
### A kicked wheel

Picture a wheel that spins freely and gets a small kick at regular times. The size of each kick depends on where the wheel happens to be. Physicists call this the standard map, and it is the simplest model of a planet nudged by another planet, or a particle in an accelerator.

Plot the wheel's position against its speed, one dot per kick. With no kick, each starting speed gives a level line. With a small kick, most lines bend but stay whole. As the kick grows, lines begin to break up into scattered dots. That is chaos.

[[viz:ph-kam|Each color is one starting speed, followed for many kicks. Raise the kick strength. Smooth curves survive at first, then break one by one into a chaotic sea. The last to go have speeds tied to the golden ratio.]]

### Which curves survive

The answer is a piece of number theory. Each curve has a number: turns of the wheel per kick. If that number is a simple fraction, or very close to one, the kicks add up in step and the curve breaks early. If the number is hard to approximate by fractions, the curve lasts. The golden ratio, whose continued fraction is all 1s, is the hardest number of all to approximate, and its curve is the last to break, near a kick strength of 0.97.

This is the theorem of Kolmogorov, Arnold and Moser, and it is the reason the gaps in the Music, Patterns and Physics region sit at simple fractions.

### Five numbers, tested

The Rhythm of Numbers is built on five numbers: pi, e, the musical fifth, the square root of 2 and the golden ratio. We computed how strong a kick each one's curve can take. The golden ratio's lasts longest, to 0.9716. The curve for √2 lasts to about 0.957, the fifth's to about 0.945 at most, e's to about 0.88, and pi's is gone by about 0.54. Pi's continued fraction has a 292 in it, which makes 355/113 a superb approximation and makes pi's curve the first to break. The first two values are firm. The other three are estimates. (This computation is new in [the paper](/connections/rhythm-of-numbers/paper/), Section 12.8.)

### A butterfly from the same numbers

The same split between fractions and non-fractions draws one of the most famous pictures in physics. The allowed energies of an electron in a crystal in a magnetic field form a fractal called Hofstadter's butterfly. You can explore it in [Butterfly of a Number](/connections/rhythm-of-numbers/butterfly/).
