---
title: "Whole numbers a laboratory can measure"
short: "Hall steps"
sets: [math, patterns, chemistry, physics]
weight: 340
teaser: "Electrons in a thin layer of crystal, in a strong magnetic field, conduct electricity in exact whole-number steps. The whole numbers come from Euclid's algorithm, and the picture behind them is a fractal butterfly."
golinks:
  - { url: "/connections/rhythm-of-numbers/butterfly/", title: "Butterfly of a Number", why: "the full instrument: any number, its bands and their sound" }
  - { url: "/connections/rhythm-of-numbers/large-and-small/#butterfly", title: "Large and small: the butterfly of a number", why: "in plain words" }
  - { url: "/physics/electricity-and-magnetism/hall-effect/", why: "the ordinary Hall effect" }
  - { url: "/physics/waves-optics-modern-physics/band-theory/", why: "energy bands in a crystal" }
credits:
  - { name: "Douglas R. Hofstadter", what: "Physical Review B 14 (1976): the butterfly" }
  - { name: "D. J. Thouless, M. Kohmoto, M. P. Nightingale and M. den Nijs", what: "Physical Review Letters 49 (1982): the whole numbers in the gaps" }
  - { name: "C. R. Dean and others", what: "Nature 497 (2013): the butterfly measured in graphene on boron nitride" }
  - { name: "Quantum Hall effect (Grokipedia)", url: "https://grokipedia.com/page/Quantum_Hall_effect", what: "Klaus von Klitzing's 1980 discovery and its precision" }
  - { name: "Teddy Rook, The Rhythm of Numbers, Chapter 18", url: "/connections/rhythm-of-numbers/paper/", what: "the bands at the fractions of pi and other numbers" }
---
### Steps instead of a slope

Pass a current through a thin sheet in a magnetic field and a voltage appears across the sheet. Normally it grows smoothly with the field. In 1980 Klaus von Klitzing found that in a very thin, very cold layer it climbs in flat steps. On each step the conductance is a whole number times a fixed constant of nature, exact to parts in a billion.

### Bands from a fraction

Why whole numbers? Put the electron on a square lattice of atoms. Its allowed energies depend on one number: the magnetic flux through one cell of the lattice. When that number is a fraction $p/q$, the energies split into $q$ bands. Plotted for every fraction, the bands make Hofstadter's butterfly, a fractal. In 2013 it was measured in graphene laid on boron nitride, where the two honeycomb patterns of atoms overlap to make a much larger pattern.

### The whole number in each gap

Each gap between bands carries its own whole number, the size of the Hall step you would measure there. If $r$ bands lie below the gap, the number is the $t$ that solves

$$r = q\,s + p\,t$$

with whole numbers $s$ and $t$, and $t$ no larger than $q/2$ in size. Solving that is Euclid's algorithm, about 2,300 years old.

[[viz:ph-hall|Choose a fraction p/q. The picture lists its q bands and, for each gap, the whole number t that sets the Hall step. For 16/113, from pi, the six widest gaps carry 1, 2, 3, −3, −2, −1.]]
