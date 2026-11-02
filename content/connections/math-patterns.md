---
title: "Tilings and rose windows"
short: "Tilings"
sets: [math, patterns]
weight: 140
teaser: "Every repeating wallpaper follows one of just 17 sets of rules, and a cathedral's rose window can be drawn with nothing but a compass and a straightedge."
golinks:
  - { url: "/math/geometry/polygon-symmetry/", why: "turns and mirrors that leave a shape unchanged" }
  - { url: "/math/geometry/compose-transformations/", why: "a glide is a mirror followed by a slide" }
  - { url: "/math/abstract-algebra/dihedral-groups/", why: "the groups of turns and flips behind every rosette" }
  - { url: "/math/geometry/basic-constructions/", why: "bisecting with compass and straightedge" }
  - { url: "/math/geometry/inscribed-constructions/", why: "stepping a hexagon around a circle" }
  - { url: "/art/art-history-1/gothic-architecture/", why: "where rose windows come from" }
  - { url: "/math/gallery/penrose-tiling/", why: "a tiling that never repeats at all" }
credits:
  - { name: "Wallpaper group (Grokipedia)", url: "https://grokipedia.com/page/Wallpaper_group", what: "the 17 groups, their names and history" }
  - { name: "International Tables for Crystallography, Vol. A (International Union of Crystallography)", what: "the symmetry operations of each plane group, used to build the tilings" }
  - { name: "Rose window (Grokipedia)", url: "https://grokipedia.com/page/Rose_window", what: "history of rose windows in Gothic churches" }
  - { name: "Straightedge and compass construction (Grokipedia)", url: "https://grokipedia.com/page/Straightedge_and_compass_construction", what: "which divisions of a circle can be constructed" }
  - { name: "Our own pictures", what: "the tiling explorer and the rose window were drawn by code written for this page" }
---
### Only 17 ways to repeat

Wallpaper, floor tiles and woven cloth repeat in two directions. Look closely and each design also has some mix of **turns**, **mirrors** and **glides** (a mirror followed by a slide, like footprints in snow) that leave it looking the same.

In 1891 the Russian crystallographer Evgraf Fedorov proved a surprising fact: there are exactly **17** different mixes. Every repeating flat pattern ever made, from Roman mosaics to modern wrapping paper, uses one of them. George Pólya found the same 17 again in 1924, and the artist M. C. Escher learned them from his paper.

The turns are limited too. A repeating pattern can only have turns of a half, a third, a quarter or a sixth. Five-fold turns can't tile a repeating floor, any more than regular pentagons can.

[[viz:mp-wallpaper|Pick a group and the same motif is copied by its rules. The dashed outline is one repeating cell. Drag the picture to slide the motif inside the cell and watch every copy follow.]]

### A rose window from a compass

Gothic builders in the 12th and 13th centuries filled the round windows of their cathedrals with stone tracery and colored glass. The geometry came from a compass and a straightedge, the same two tools Euclid used.

The key fact is that a compass set to a circle's radius steps around it exactly **6** times. Bisecting those arcs gives 12, and two diameters at right angles give 4, then 8, then 16. Each petal circle must touch its neighbors and the rim. If the window has radius $R$ and $n$ petals, each petal has radius

$$r = \frac{R \sin(180°/n)}{1 + \sin(180°/n)}.$$

[[viz:mp-rose|Build a rose window step by step. Try 6, 8, 12 and 16 petals.]]

> **Myth vs fact.** You may read that rose windows and other "sacred geometry" have healing powers or encode secret messages. There is no evidence for that. What is true is beautiful enough: medieval builders used simple, exact constructions to make huge designs that fit together.
