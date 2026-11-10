---
title: "Large and small: the same patterns in atoms and in orbits"
linkTitle: "Large and small"
description: "Physics joins the Rhythm of Numbers. One law of periods for a planet and an electron, moons and planets that keep time in simple ratios, a number's rhythm as an energy spectrum, and Kepler's harmonies of the planets put to the test. Chapter 18 of the paper in plain words, with two instruments."
layout: rhythm-large
# Plain-words summary of Chapter 18 of the paper (docs/papers/rhythm-of-numbers/paper/ch18_largesmall.tex). Keep every
# claim as the paper states it: none of the physics is ours; say which tests failed. No hype.
added: "2026-11-10b"
lede: "The Rhythm of Numbers began with music, patterns, math and chemistry. This chapter adds physics and astronomy, and asks one question of them: where do the same structures appear both in very small things and in very large ones? None of the physics here is ours. What is new is reading it through continued fractions, some computations, and two exact facts about a table of numbers from the paper."
short:
  - "**One law, two sizes.** A planet going round the Sun and, in Bohr’s model, an electron going round a proton obey the same law of periods. Both forces weaken with the square of the distance."
  - "**The periodic table has a hidden cause in the sky.** The same symmetry that keeps planets on closed ellipses is why the electron shells hold 2, 8, 18 and 32."
  - "**Resonance is rhythm.** Moons and planets whose periods are in simple ratios show up in a continued fraction as one large term. Jupiter’s moons and two families of planets round other stars pass the test. The planets of our solar system, taken together, do not."
  - "**A number’s rhythm is also an energy spectrum.** For an electron in a crystal in a magnetic field, the allowed energies split into bands in the same counts as the bars and phrases of the number’s rhythm."
  - "**Kepler drew a continued fraction in 1595.** His triangle of the meetings of Jupiter and Saturn is one, and the next term says how slowly the triangle turns: once in about 883 years."
  - "**Kepler’s music of the planets, tested.** For single planets his musical intervals do no better than chance. For pairs of the six planets he knew they do better than chance, but the planets found after him do not continue the pattern."
  - "**Two new exact facts** about the paper’s correlation matrix, and one new open question: a ratio that stays near 2.57 at every size we could compute."
try:
  - { url: "connections/rhythm-of-numbers/keplers-figures/", icon: "🪐", title: "Kepler’s Figures", text: "Pick two planets or moons and watch their meetings draw a triangle, a star or a many-pointed figure, then see the fraction behind it." }
  - { url: "connections/rhythm-of-numbers/butterfly/", icon: "🦋", title: "Butterfly of a Number", text: "Type any continued fraction and see its levels on Hofstadter’s butterfly. Then hear its energy bands played from low to high." }
sections:
  - id: "warning"
    h: "A warning first"
    paras:
      - "This subject is full of number games that explain nothing. The old “law” of planetary distances named after Titius and Bode is the classic case. So the rule of the earlier chapters applies here too: a pattern is reported with its test, and a coincidence is called one."
  - id: "one-law"
    h: "The atom and the solar system are one problem"
    paras:
      - "Gravity and the electric force both fall off as the square of the distance. So a planet round the Sun and, in Bohr’s model of the atom, an electron round a proton follow the same rule: the square of the time for one orbit goes as the cube of the orbit’s size. That is Kepler’s third law, twice. The two constants differ by a factor of 5 × 10¹⁷, and the law is the same."
      - "**An atom a radio telescope can hear.** An electron in a very high orbit behaves almost like a tiny planet. Astronomers have detected carbon atoms in space with the electron near level 1,009. Such an atom is about a tenth of a millimeter across, a million times the size of an ordinary atom, and its electron goes round 6.4 million times a second. The radio signal that was detected, near 26 MHz, is four times that orbital frequency: the fourth harmonic of the electron’s rhythm."
      - "**The hidden symmetry.** A force that falls off as the square of the distance has an extra symmetry. In the sky it is the reason orbits are closed ellipses that do not swing round. In the hydrogen atom, Pauli (1926) and Fock (1935) showed that the same symmetry is why level n has n² states of equal energy. With two spin states each, that is 2n²: the shell sizes 2, 8, 18, 32. In bigger atoms the other electrons spoil the symmetry, and the rows of the periodic table then have lengths 2, 8, 8, 18, 18, 32, 32. The periodic table is hydrogen’s symmetry, broken."
      - "An earlier chapter of the paper called the link between hydrogen’s 1/n² and a famous sum “a shared formula, not shared physics.” This link is different: it is shared physics."
      - "**A caution.** Kepler published his third law in a book about the music of the planets, and the power in his law, 3/2, is also the ratio of a musical fifth. That is a coincidence of small numbers and nothing more."
  - id: "resonance"
    h: "Resonance as rhythm"
    paras:
      - "Two bodies whose periods are close to a simple ratio, such as 2 to 1, meet again and again in the same places. The repeated tug can lock the ratio. That is a resonance."
      - "A continued fraction detects it. Write the ratio of the two periods as a continued fraction. If the ratio is locked to a simple fraction, the term that comes right after that fraction is large, for the same reason that 292 follows 355/113 in pi."
    table:
      caption: "The big-term test on a few pairs"
      head: ["Pair", "Ratio of periods", "Nearest simple fraction", "Next term", "What it is"]
      rows:
        - ["Europa and Io", "2.0073", "2/1", "137", "locked"]
        - ["Ganymede and Europa", "2.0147", "2/1", "68", "locked"]
        - ["Pluto and Neptune", "1.5046", "3/2", "53", "locked"]
        - ["HD 110067, planets c and b", "1.5003", "3/2", "over 300", "locked"]
        - ["Callisto and Ganymede", "2.3326", "7/3", "160", "a near miss, not known to be locked"]
        - ["Earth and Venus", "1.6255", "13/8", "29", "not a resonance"]
        - ["Saturn and Jupiter", "2.4833", "5/2", "14", "a near miss"]
        - ["Venus and Mercury", "2.5543", "5/2", "4", "nothing special"]
      note: "Callisto’s 160 is a reminder that a large term is evidence and not proof. And the 137 of Io and Europa has nothing to do with the 137 of atomic physics."
    after:
      - "**What the test shows.** Jupiter’s moons stand out far beyond chance (about 1 in 10,000). So do two chains of planets round other stars: TRAPPIST-1 (about 1 in 200) and HD 110067 (less than 1 in 10,000). The planets of our solar system, taken together, are **not** much closer to simple fractions than random ratios would be: the chance of doing as well is about 1 in 7."
      - "**Three moons in step.** Io, Europa and Ganymede keep a three-way pattern, found by Laplace: while Ganymede goes round once, Europa goes round twice and Io four times, with a slow drift that all three share. As a polyrhythm it is 4 against 2 against 1. You can load it, and the two planet chains, into [the polyrhythm layerer](/connections/rhythm-of-numbers/#poly)."
      - "**Earth and Venus.** Their ratio begins like the golden ratio’s continued fraction, with the fractions 8/5 and 13/8. That is why Venus traces a five-petaled figure in our sky every eight years. It is not a resonance in the physical sense."
      - "**Where resonance empties instead of locks.** In the asteroid belt almost no asteroids have periods of 1/3, 2/5, 3/7 or 1/2 of Jupiter’s: those are the Kirkwood gaps. In Saturn’s rings, the edge of the bright B ring sits where a particle would go round twice for each turn of the moon Mimas. So simple fractions sometimes lock an orbit and sometimes clear it out. A theorem of Kolmogorov, Arnold and Moser explains the second case: an orbit survives small disturbances when its frequency ratio is hard to approximate by fractions. The golden ratio, whose terms are all 1, is the hardest number of all to approximate."
  - id: "mirror"
    h: "A mirror in the paper’s big table"
    paras:
      - "Earlier chapters studied a large table of numbers, the correlation matrix, which records how often any two steady drum beats line up. The last chapter proved that its largest value grows, and its smallest value shrinks, at mirror-image rates. This chapter finds an exact reason, in two parts."
      - "**The sign mirror (proved).** Flip the sign of each beat once for each prime factor of its period. After that flip, the inverse of the table has no negative entries. So the smallest value, like the largest, is the leading value of a table of plain counts."
      - "**Both ends count shared beats (proved).** Two rhythms with periods a and b first land together on beat number lcm(a, b), their least common multiple, and then on every multiple of it. Both ends of the table can be written as counts of those shared beats. The largest value counts every one of them. The smallest counts only some."
      - "**How far apart are the two ends? (computed, and open).** One over the smallest value is between 2.6 and 2.7 times the largest at every size we computed, up to 30 million, and the figure falls slowly as the table grows. For the table’s close cousin, the gcd matrix, the ratio is about 2.57 at every size from 20,000 up. Whether it settles on a limit is open. We did not recognize 2.57 as any known constant, and at these sizes it would be a number game to try."
      - "In physics, the one-prime version of this table is the correlation table of a simple model of a magnet (the one-dimensional Ising model). We claim only the likeness."
  - id: "butterfly"
    h: "The butterfly of a number"
    paras:
      - "Put an electron on a square crystal lattice in a magnetic field. Its allowed energies depend on one number: the magnetic flux through one cell of the lattice. In 1976 Douglas Hofstadter found that when that number is a fraction p/q, the energies split into q bands, and that the picture over all fractions is a fractal shaped like a butterfly. It was seen in the laboratory in 2013."
      - "Follow a number down its continued fraction and the bands split level by level. For pi, the 113 bands of the fraction 16/113 fall into seven groups of 16, with one of 17 in the middle: the bar of 7 and the phrase of 113 from pi’s rhythm, as an energy spectrum. For the golden ratio the groups are Fibonacci numbers."
      - "Each gap between bands carries a whole number, found by Euclid’s algorithm, the oldest method in the paper. That whole number sets a quantity, the Hall conductance, that laboratories measure to parts in a billion."
      - "Try it in [Butterfly of a Number](/connections/rhythm-of-numbers/butterfly/)."
  - id: "kepler"
    h: "Kepler, continued"
    paras:
      - "**The triangle is a continued fraction.** On 19 July 1595 Kepler drew for his class the places in the zodiac where Jupiter and Saturn meet, about every twenty years. Each meeting falls about two thirds of the way round from the last, so three of them make a triangle, and the triangle slowly turns. The drawing gave him the idea for his first book."
      - "Here is what the continued fraction adds. Each meeting falls a fixed step round the circle. The fractions closest to that step are the figures the meetings draw: 2/3 is the triangle. The term that follows says how many times the figure is drawn before it has turned by one of its own points. For Jupiter and Saturn that term is 14, and the triangle takes about 883 years to turn onto itself. Astronomers know the same 883 years as the period of a slow swing in the motions of Jupiter and Saturn, called the great inequality. They are one beat, seen two ways."
      - "For Venus and the Earth the figure is a five-pointed star, drawn every 8 years. One step further down the same continued fraction gives 243 years, the period after which transits of Venus across the Sun repeat. The same method gives the periods that astronomers in Babylon already used to predict the planets: 8 years for Venus, 46 for Mercury, 47 and 79 for Mars, 83 for Jupiter and 59 for Saturn."
      - "Watch any pair draw its figure in [Kepler’s Figures](/connections/rhythm-of-numbers/keplers-figures/)."
      - "**His harmonies, tested.** In 1619 Kepler compared each planet’s fastest speed across the sky, seen from the Sun, with its slowest, and heard a musical interval in each ratio: a major third for Saturn, a semitone for the Earth. We tested these three ways, with his own figures, with the orbits as they were in 1600 and with the orbits of today. Random ratios do as well as the planets about one time in six. So the harmonies of the single planets are not established. They also cannot last, because the shapes of the orbits slowly change."
      - "**Two planets at a time.** Kepler set more store by the intervals between neighbors. Here the test comes out differently: for the six planets he knew, his ten intervals fit better than chance, at about 1 chance in 30. But Uranus and Neptune were found after he died, and they are a test his scheme never had. The four new intervals between neighbors miss badly, worse than chance. The fair verdict: his two-planet harmonies were a real feature of the six planets he knew, and the planets he did not know do not continue it."
      - "**The second law in the atom.** Kepler’s second law says a planet sweeps equal areas in equal times. In Bohr’s atom, the electron in orbit n sweeps area at n times one fixed rate. Kepler’s second law is what Bohr made come in whole steps."
      - "**More of Kepler that belongs here.** He noticed that the ratios of neighboring Fibonacci numbers close in on the golden section, which is the golden movement of the Suite three centuries early. He drew a pattern of pentagons and stars that anticipates tilings that never repeat. And he claimed that no packing of equal spheres is denser than the grocer’s pile of oranges, a claim that stood unproved until Thomas Hales’s proof, published in 2005."
ours_intro: "The paper’s Section 18.6 sorts every idea in the chapter. A short version:"
ours:
  known:
    - "Kepler’s laws in the atom, and the shell sizes from the hidden symmetry (Bohr, Pauli, Fock, Sommerfeld)."
    - "Orbital resonances, the Kirkwood gaps and the theorem of Kolmogorov, Arnold and Moser."
    - "Hofstadter’s butterfly and the whole numbers in its gaps."
    - "The cycles of the planets, known since Babylon, and Kepler’s triangle."
  new:
    - "The big-term test on period ratios, with a test against random ratios (a new presentation and computation)."
    - "The sign mirror and the shared-beats form of the correlation matrix (proved in the chapter; they may be known to specialists and have not been refereed)."
    - "The ratio of the two ends, computed to 30 million."
    - "Reading the triangle as a fraction of a continued fraction, and its slow turn as the next term."
    - "The tests of Kepler’s harmonies: against random ratios, in 1600 against today, and on the planets found later."
    - "Reading the butterfly’s levels as a number’s musical form, and the two instruments."
  not:
    - "The planets of the solar system as a whole are not significantly close to simple ratios (about 1 chance in 7)."
    - "Kepler’s harmonies for single planets are not established by our test (about 1 chance in 5 to 1 in 7)."
    - "His two-planet intervals beat chance for the six planets he knew (about 1 in 30), but not once Uranus and Neptune are added."
    - "Whether the ratio near 2.57 has a limit is open."
notes:
  - "Everything here is a summary of Chapter 18 of [the paper](/connections/rhythm-of-numbers/paper/), which follows Teddy Rook’s text and gives the proofs, tables and sources. Where this page and the paper differ, the paper is right."
  - "Every number printed in the chapter is recomputed by his scripts (250 checks). We also checked a sample of them separately: the atom’s numbers, seven period ratios, the three-moon relation, the two meeting steps, the two new facts about the table at a small size, and three band widths."
  - "Planet periods are long-term mean values from JPL (Standish and Williams). The moons are from NASA’s planetary fact sheets, TRAPPIST-1 from Agol and others (2021), and HD 110067 from Luque and others (2023)."
credits:
  - { name: "Teddy Rook", what: "the chapter this page summarizes, its computations and the two instruments" }
  - { name: "JPL Solar System Dynamics", what: "E. M. Standish and J. G. Williams, “Approximate positions of the planets”: the periods and orbits of the planets", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" }
  - { name: "NASA Space Science Data Coordinated Archive", what: "planetary fact sheets: the periods of the moons", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/" }
  - { name: "Eric Agol and others; R. Luque and others", what: "the periods of the planets of TRAPPIST-1 (The Planetary Science Journal, 2021) and HD 110067 (Nature, 2023)" }
  - { name: "S. V. Stepkin and others", what: "“Radio recombination lines from the largest bound atoms in space”, Monthly Notices of the Royal Astronomical Society 374 (2007): the carbon atoms near level 1,009" }
  - { name: "Johannes Kepler", what: "Mysterium Cosmographicum (1596), Strena seu de nive sexangula (1611) and Harmonices Mundi (1619): the triangle, the snowflake essay and the harmonies" }
---
