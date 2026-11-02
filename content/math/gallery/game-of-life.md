---
title: "Conway's Game of Life"
summary: "A grid of cells and three short rules. Out come blinkers, gliders and even a gun that fires gliders forever."
emoji: "🧬"
gtags: [chaos, famous-problems]
weight: 310
ladder_links:
  - { url: "/math/discrete-math/unrolling-recurrences/", why: "each generation comes from the one before" }
  - { url: "/math/discrete-math/big-o/", why: "how fast the work grows with the size of the grid" }
  - { url: "/math/discrete-math/proof-by-cases/", why: "checking that a pattern really repeats" }
  - { url: "/math/discrete-math/truth-tables/", why: "gliders can be made to act like logic gates" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "Conway's Game of Life (Grokipedia)", url: "https://grokipedia.com/page/Conway's_Game_of_Life", what: "the rules, the history and the famous patterns" }
  - { name: "Gun (cellular automaton) (Grokipedia)", url: "https://grokipedia.com/page/Gun_(cellular_automaton)", what: "the Gosper glider gun" }
  - { name: "Martin Gardner, Mathematical Games, Scientific American, October 1970", what: "the column that introduced the game" }
  - { name: "Elwyn Berlekamp, John Conway and Richard Guy, Winning Ways for Your Mathematical Plays (1982)", what: "the proof sketch that Life can compute anything a computer can" }
---
## What you're seeing

A grid of square cells. Each cell is either **alive** (green) or **dead**. Every tick of the clock, each cell looks at its 8 neighbors and follows three rules:

- a live cell with **2 or 3** live neighbors stays alive;
- a dead cell with **exactly 3** live neighbors comes alive;
- every other cell is dead in the next tick (from loneliness or crowding).

That's all. The page starts with the **Gosper glider gun**: a shape that pumps out a small walking pattern, a *glider*, every 30 ticks, forever. Pick other patterns from the list, or tap and drag on the grid to draw your own. With the keyboard, focus the grid, move with the arrow keys and press Space to flip a cell.

## Why it works

**Everything happens at once.** All cells update together, from the same old grid. That's why the page keeps two grids: it reads the old one and writes the new one. A cell's fate depends only on its neighborhood, the same way everywhere.

**Patterns that stay, blink or walk.**

- *Still lifes* never change. A 2 × 2 block is one: each live cell has exactly 3 live neighbors, and no dead cell has exactly 3.
- *Oscillators* repeat. A **blinker**, three cells in a row, flips between a row and a column every tick (period 2). The **pulsar** has period 3.
- *Spaceships* repeat but shifted over. The **glider** is 5 cells. After 4 ticks it is the same shape, moved one cell down and one cell across. Its speed is $c/4$, where $c$, "the speed of light," means one cell per tick, the fastest anything can spread.

**A gun.** John Conway guessed that no pattern could grow forever and offered a \$50 prize for a proof or a counterexample. In 1970 a team led by Bill Gosper at MIT found the glider gun, which grows forever by making gliders. On this page, cells that reach the edge of the world are removed, so the gliders fly off the edge.

**A chaos of small changes.** Most random starts churn for hundreds of ticks before settling into still lifes, blinkers and escaping gliders. The 5-cell **R-pentomino** takes 1,103 ticks to settle on an unlimited grid (on this page's smaller world it ends sooner). Change one cell in a starting pattern and the outcome can be completely different.

**It can compute.** Streams of gliders can carry signals, and crashes between them can act like the gates inside a computer. Conway and others showed in the early 1980s that Life can, in principle, carry out any computation a computer can. One odd consequence: there is no general method to predict whether a given pattern will ever die out.

**History.** John Horton Conway invented the game at the University of Cambridge in the late 1960s, testing rules by hand on a Go board. Martin Gardner described it in *Scientific American* in October 1970, and it spread through computer labs around the world.

## Try this

- Load the blinker and press **Step one generation**. Count the neighbors of each cell and check the rules by hand.
- Load the glider and step 4 times. Where did it move?
- Draw a 2 × 2 block. Then add one cell touching it. What happens?
- Load the R-pentomino at full speed and watch how much it grows from just 5 cells.
- Find the spot in the glider gun where a new glider breaks off. How many ticks between gliders?
