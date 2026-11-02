---
title: "The symmetry of molecules"
short: "Molecules"
sets: [math, patterns, chemistry]
weight: 240
teaser: "Turn a benzene ring by a sixth of a circle and it looks exactly the same. Chemists count these moves, and the count tells them how a molecule behaves."
golinks:
  - { url: "/chemistry/chemistry/vsepr-shapes/", why: "why molecules have the shapes they do" }
  - { url: "/chemistry/general-chemistry-1/hybridization/", why: "the bonds in a benzene ring" }
  - { url: "/math/abstract-algebra/group-axioms/", why: "what makes a set of moves a group" }
  - { url: "/math/abstract-algebra/dihedral-groups/", why: "the turns and flips of a regular polygon" }
  - { url: "/math/linear-algebra/geometric-maps/", why: "turns and mirrors as matrices" }
credits:
  - { name: "Molecular symmetry (Grokipedia)", url: "https://grokipedia.com/page/Molecular_symmetry", what: "symmetry operations, point groups and their uses" }
  - { name: "Point group (Grokipedia)", url: "https://grokipedia.com/page/Point_group", what: "the names C2v, C3v, D3h, Td and D6h" }
  - { name: "Benzene (Grokipedia)", url: "https://grokipedia.com/page/Benzene", what: "the hexagonal ring and Kekulé's 1865 structure" }
  - { name: "Our own pictures", what: "the molecule viewer was drawn by code written for this page" }
---
### Moves that change nothing

A **symmetry operation** is a move that leaves a molecule looking exactly as it did: a turn about an axis, a reflection in a mirror plane, or an inversion through the center (every atom goes straight through the middle to the opposite side). The atoms do move, but each lands where an identical atom used to be.

The set of all such moves for one molecule is a **group** in the mathematician's sense: do two moves in a row and you get another move in the set, and every move can be undone. Chemists name these groups with short labels. Water's group, $C_{2v}$, has 4 moves. Benzene's, $D_{6h}$, has 24, the same symmetries as a flat hexagonal tile.

[[viz:mpc-molsym|Choose a molecule and an operation. The numbers on the atoms are the only way to tell that anything moved.]]

This is more than tidy bookkeeping. A molecule's group predicts which of its vibrations can absorb infrared light, how its orbitals can combine into bonds, and whether it can be polar. A molecule with a center of inversion, like benzene or carbon dioxide, can never be polar, because every push one way is matched by a push the other way.
