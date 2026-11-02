---
title: "The bridges of Königsberg"
summary: "Can you walk across all seven bridges, crossing each one exactly once? Euler showed why you can't, and invented graph theory doing it."
emoji: "🌉"
gtags: [famous-problems, geometry]
weight: 280
ladder_links:
  - { url: "/math/discrete-math/euler-circuits/", why: "the full theorem and how to find the route" }
  - { url: "/math/discrete-math/graph-basics/", why: "degrees and the handshake lemma" }
  - { url: "/math/discrete-math/connectivity/", why: "walks, paths and connected graphs" }
  - { url: "/math/discrete-math/hamilton-paths/", why: "the cousin problem: visit every place once" }
  - { url: "/math/discrete-math/contradiction-proof/", why: "the style of Euler's argument" }
credits:
  - { name: "Our own picture", what: "a simplified map, not to scale, drawn in your browser by code written for this page" }
  - { name: "Seven Bridges of Königsberg (Grokipedia)", url: "https://grokipedia.com/page/Seven_Bridges_of_K%C3%B6nigsberg", what: "the history and the layout of the bridges" }
  - { name: "Eulerian path (Grokipedia)", url: "https://grokipedia.com/page/Eulerian_path", what: "the theorem and Hierholzer's proof" }
  - { name: "Leonhard Euler, Solutio problematis ad geometriam situs pertinentis (presented 1735, printed 1741)", what: "Euler's paper on the problem" }
---
## What you're seeing

The city of Königsberg sat on both banks of a river, with an island in the middle and a second piece of land to the east, between two branches of the river. Seven bridges joined them. People liked to ask: could you take a walk that crosses every bridge **exactly once**?

Try it. Tap a piece of land to start, then tap bridges to cross them. A bridge glows green when you can take it next and turns gold once you've crossed. You'll always get stuck with a bridge or more left over.

On the right, the same problem is drawn the way Euler saw it: each piece of land is a dot, each bridge is a line. The number on each dot is how many bridges touch that land. Then tick **Add an eighth bridge** and try again.

## Why it works

**Only the connections matter.** The shape of the island, the length of the streets and the width of the river make no difference. All that counts is which land each bridge joins. A picture of dots and lines like this is called a **graph**, and Euler's 1736 solution is the start of graph theory.

**Count the ends.** Follow any walk. Every time you come into a land by one bridge, you leave by another, so a land you pass through uses up bridges **in pairs**. Only two lands are different: the one where you start (you leave without arriving first) and the one where you finish. So in a walk that uses every bridge once:

- every land except the start and the finish touches an **even** number of bridges;
- if the start and finish are the same land, *every* land is even.

The number of bridges at a land is called its **degree**. Königsberg's degrees are 5, 3, 3 and 3. All four are odd, but at most two lands may be odd. So no such walk exists, however you try.

**Euler's theorem.** For a connected graph,

$$\text{a walk using every edge once exists} \iff \text{the number of odd-degree dots is } 0 \text{ or } 2.$$

If there are 2 odd dots, the walk must start at one and end at the other. If there are none, you can start anywhere, and you'll end where you began. Euler proved the "only if" direction. The "if" direction, that a walk always exists when the count is right, was proved by Carl Hierholzer, published in 1873.

**Why there can't be exactly one odd dot.** Add up all the degrees. Each line has two ends, so the total is twice the number of lines, an even number. So the number of odd degrees is always even: 0, 2, 4, …, never 1 or 3.

**The eighth bridge.** A bridge between the north and south banks raises both of them to 4. Now only the island (5) and the east land (3) are odd, so a walk exists, and it must start on one of those two.

## Try this

- With seven bridges, how many bridges can you cross before getting stuck? Can you get to 6?
- Add the eighth bridge. Start on the North bank. What happens? Now start on the Island.
- Which single bridge could you *remove* from the original seven to make a walk possible? Is there more than one answer?
- Draw a house shape (a square with a triangle roof) on paper. Can you trace it without lifting your pencil or redrawing a line? Count the degrees to check.
