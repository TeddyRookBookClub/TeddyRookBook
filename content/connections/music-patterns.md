---
title: "Sand that draws sound"
short: "Chladni plates"
sets: [music, patterns]
weight: 120
teaser: "Sprinkle sand on a metal plate, make it ring, and the sand jumps into a pattern. Tunes have mirror images too: composers flip and reverse melodies the way artists flip a design."
golinks:
  - { url: "/physics/physics-2/standing-waves-strings/", why: "nodes and antinodes on a string" }
  - { url: "/math/differential-equations/wave-equation/", why: "the equation every vibrating thing obeys" }
  - { url: "/math/differential-equations/separation-of-variables/", why: "how a mode like cos(nπx)·cos(mπy) is found" }
  - { url: "/math/geometry/congruence-rigid-motions/", why: "slides, flips and turns" }
  - { url: "/math/abstract-algebra/dihedral-groups/", why: "the algebra of mirror symmetries" }
  - { url: "/music/reading-music/intervals-and-chords/", why: "reading the leaps in a tune" }
  - { url: "/art/young-artists/symmetry/", why: "symmetry in pictures" }
credits:
  - { name: "Ernst Chladni (Grokipedia)", url: "https://grokipedia.com/page/Ernst_Chladni", what: "his 1787 book and his methods" }
  - { name: "E. F. F. Chladni, Entdeckungen über die Theorie des Klanges (Leipzig, 1787)", what: "the first book of sand figures" }
  - { name: "Cymatics (Grokipedia)", url: "https://grokipedia.com/page/Cymatics", what: "the modern name, and the claims made for it" }
  - { name: "Inversion (music) (Grokipedia)", url: "https://grokipedia.com/page/Inversion_(music)", what: "melodic inversion" }
  - { name: "Retrograde inversion (Grokipedia)", url: "https://grokipedia.com/page/Retrograde_inversion", what: "the four forms of a row" }
  - { name: "Crab canon (Grokipedia)", url: "https://grokipedia.com/page/Crab_canon", what: "Bach's backwards canon in The Musical Offering (1747)" }
  - { name: "Twelve-tone technique (Grokipedia)", url: "https://grokipedia.com/page/Twelve-tone_technique", what: "rows and their mirror forms" }
---
### Chladni figures

In 1787 the German scientist Ernst Chladni published a book of strange drawings. He had clamped thin metal plates at the center, sprinkled sand on them, and stroked the edge with a violin bow. Each time the plate rang with a clear note, the sand leapt off the shaking parts and piled up along lines that stayed still. A higher note made a busier pattern.

Those still lines are **nodes**, just like the still points on a vibrating string, but now in two dimensions. The plate vibrates in a **standing wave**, and each note it can ring at has its own pattern, called a **mode**. For a square plate a good approximate formula for a mode is

$$z = \cos(n\pi x)\cos(m\pi y) \pm \cos(m\pi x)\cos(n\pi y),$$

where $x$ and $y$ run from 0 to 1 across the plate. The sand gathers where $z = 0$. Below, each grain takes random hops whose size grows with how hard the plate is shaking under it, so it wanders until it reaches a node and stays there.

[[viz:mpat-chladni|Pick a mode and let it vibrate (or press Settle now). Larger n and m mean a higher note and a finer pattern. This uses the classic approximate formula; real plates differ a little at the edges.]]

> **Myth vs fact.** Chladni patterns are sometimes shown online as proof that sound "shapes matter" in mystical ways, or that certain frequencies heal. The real explanation is plain physics: the sand is simply thrown off the moving parts and left on the still ones. The patterns depend on the plate's size, shape, thickness and material, not on any special frequency.

### A tune has mirror images

Composers treat a melody a lot like a pattern on a tile. Draw it on a grid with time running left to right and pitch going up, and four classic moves appear:

- **Transposition** slides the whole tune up or down. It still sounds like the same tune.
- **Inversion** flips it upside down: every step up becomes the same step down.
- **Retrograde** plays it backwards, a mirror across a vertical line.
- **Retrograde inversion** does both, a half turn.

Bach wrote a "crab canon" in *The Musical Offering* (1747), in which one voice plays the tune while the other plays it backwards at the same time. In the 1920s Arnold Schoenberg built his twelve-tone method on exactly these four forms of a row of notes. In math, these moves are the symmetries of the grid: slides, reflections and a rotation.

[[viz:mpat-motif|A short tune of our own, drawn on a grid. Choose a form to see its mirror line (gold), then play it.]]
