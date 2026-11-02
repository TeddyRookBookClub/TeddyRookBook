---
title: "The four color theorem"
summary: "Any map can be colored with just four colors so that neighbors never match. Proving it took 124 years and a computer."
emoji: "🗺️"
gtags: [famous-problems, geometry]
weight: 290
ladder_links:
  - { url: "/math/discrete-math/graph-coloring/", why: "coloring dots so that joined dots differ" }
  - { url: "/math/discrete-math/planar-graphs/", why: "graphs you can draw without crossings, and Euler's formula" }
  - { url: "/math/discrete-math/graph-basics/", why: "degrees and the handshake lemma, used in the five color proof" }
  - { url: "/math/discrete-math/proof-by-cases/", why: "the 1976 proof is a proof by (a great many) cases" }
  - { url: "/math/discrete-math/strong-induction/", why: "the shape of every proof of the theorem" }
credits:
  - { name: "Our own picture", what: "a made-up map drawn in your browser by code written for this page" }
  - { name: "Four color theorem (Grokipedia)", url: "https://grokipedia.com/page/Four_color_theorem", what: "the history, from Guthrie to the computer proofs" }
  - { name: "Computer-assisted proof (Grokipedia)", url: "https://grokipedia.com/page/Computer-assisted_proof", what: "the debate over the 1976 proof and later formal checks" }
  - { name: "Robin Wilson, Four Colors Suffice (Princeton University Press, 2002; revised 2014)", what: "the full history for general readers" }
---
## What you're seeing

A made-up map of countries. Tap a country to change its color; tap again for the next color. If two countries that share a border have the same color, that border lights up with a red dashed line.

Can you color the whole map with no red lines? Use the four colors, or try with three. **Color it for me** solves it with at most four. **Can 3 colors do it?** tells you whether three are enough for this map. Press **New map** or change the number of countries for a different puzzle.

The rules: countries that meet only at a single corner point don't count as neighbors, and each country is one connected piece.

## Why it works

**From maps to graphs.** Put a dot in each country and join two dots when their countries share a border. You get a graph that can be drawn with no lines crossing, a *planar* graph. Coloring the map is the same as coloring the dots so that joined dots differ.

**Why you need four.** Some maps need four colors. Take one country surrounded by a ring of three. All four touch each other, so all four colors are needed. Any map with a country surrounded by an odd ring of neighbors needs four, too.

**Why six is easy.** Euler's formula for planar drawings, $V - E + F = 2$, leads to $E \le 3V - 6$. The degrees add up to $2E$, so the *average* degree is less than 6, and some dot always has 5 or fewer neighbors. Remove it, color the rest (by the same argument, again and again), then put it back. It has at most 5 neighbors, so one of 6 colors is free.

**Five takes a clever swap.** In 1890 Percy Heawood proved five colors always suffice. When the removed dot has 5 neighbors using all 5 colors, swap two colors along a chain of neighbors to free one up. This "Kempe chain" trick came from Alfred Kempe, who in 1879 published a proof of four colors. It was accepted for 11 years, until Heawood found a gap.

**Four needs a computer.** Kenneth Appel and Wolfgang Haken proved the four color theorem in 1976. Their plan:

- show that every planar map must contain at least one of a list of small patterns, an *unavoidable set*;
- show that each pattern is *reducible*: if the rest of the map can be four-colored, the coloring can be fixed up to include the pattern.

Their list had nearly 2,000 patterns, and checking reducibility took over 1,000 hours of computer time. No person could check every case by hand, and this led to a long debate about what counts as a proof. In 1996, Neil Robertson, Daniel Sanders, Paul Seymour and Robin Thomas gave a simpler proof with 633 patterns, still using a computer. In 2005, Georges Gonthier and Benjamin Werner checked the whole proof with a proof assistant (Coq), a program that verifies every logical step.

**History.** Francis Guthrie noticed the pattern in 1852 while coloring a map of the counties of England, and the question passed through his brother Frederick to Augustus De Morgan. From 1852 to 1976 is 124 years.

## Try this

- Make a map with 6 countries. Color it by hand. Did you need all four colors?
- Find a country with an odd number of neighbors all around it. Can those neighbors use only two colors?
- Press **Can 3 colors do it?** on several new maps. How often is the answer yes?
- On paper, draw a map where four countries all touch each other. Can you draw one where *five* all touch? (You can't. Why not?)
