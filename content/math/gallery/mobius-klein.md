---
title: "The Möbius strip and the Klein bottle"
summary: "A strip of paper with only one side, and its closed-up cousin, a bottle with no inside."
emoji: "♾️"
gtags: [geometry]
weight: 230
ladder_links:
  - { url: "/math/calculus-4/parametric-surfaces/", why: "describing a surface with two numbers u and v" }
  - { url: "/math/calculus-3/gradient-normals/", why: "normal arrows, the key to telling sides apart" }
  - { url: "/math/calculus-3/vector-functions/", why: "the center line of the strip as a space curve" }
  - { url: "/math/precalculus/parametric-equations/", why: "curves traced by a moving point" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Möbius strip (Grokipedia)", url: "https://grokipedia.com/page/M%C3%B6bius_strip", what: "history and the formula for the strip" }
  - { name: "Klein bottle (Grokipedia)", url: "https://grokipedia.com/page/Klein_bottle", what: "the figure-8 form and its properties" }
  - { name: "Orientability (Grokipedia)", url: "https://grokipedia.com/page/Orientability", what: "what one-sided means in math" }
---
## What you're seeing

A paint brush runs along the middle of a surface without ever lifting off or going over an edge. Pick the surface at the top.

On a **plain ring** (a strip whose ends are glued straight), the brush goes around once and stops. One side is green, the other is still bare. The brush can never reach the far side without crossing the edge.

On a **Möbius strip** (glue the ends after giving one a half twist), the brush goes around once, and keeps going, because it has come back to where it started *on the other side*. After two laps, the whole strip is painted. There was only ever one side.

The **Klein bottle** does the same thing with no edge at all. Our drawing passes through itself, because a true Klein bottle cannot fit in ordinary space without doing that.

Drag the picture, or use the arrow keys, to turn it.

## Why it works

**Making one.** Take a strip of paper, give one end a half twist, and tape the ends together. That is a Möbius strip, described by August Möbius and, independently, Johann Listing in 1858. The picture uses this formula, where $u$ goes once around (from $0$ to $2\pi$) and $v$ goes across the strip:

$$\big(x, y, z\big) = \Big( \big(1 + wv\cos\tfrac{u}{2}\big)\cos u,\; \big(1 + wv\cos\tfrac{u}{2}\big)\sin u,\; wv\sin\tfrac{u}{2} \Big),$$

with $v$ from $-1$ to $1$ and $w$ the half-width of the strip (the picture uses $w = 0.38$).

The $\tfrac{u}{2}$ is the half twist: as $u$ goes from $0$ to $2\pi$, the cross-strip line turns by only half a turn.

**What "one side" means.** At each spot on a surface, draw a little arrow sticking straight out, called a *normal*. Now slide the arrow along a loop without letting it jump. On a ring, it comes back pointing the same way. On a Möbius strip, after one trip around the middle, it comes back pointing the *opposite* way. Mathematicians call such a surface **non-orientable**. The brush in the picture is just that arrow, leaving paint on whichever side it points to.

**Cutting it.** Cut a paper Möbius strip down the middle and you don't get two pieces. You get one long loop, twice as long, with two full twists. The two halves stay joined end to end through the twist, so the cut never separates them.

**The Klein bottle.** Take two Möbius strips and glue them together along their edges. You can't do it in our space without the surface passing through itself. Felix Klein described the result in 1882. One way to build it: take a tube, and glue its ends together with a flip, so the circle at one end meets the other end mirrored. In ordinary space, one end must poke through the wall to reach the other from inside. In four dimensions, there is room to do it with no crossing. The figure-8 version in the picture uses

$$h = \cos\tfrac{u}{2}\sin v - \sin\tfrac{u}{2}\sin 2v,$$

as the distance from the center line, with $u$ going around the ring and $v$ around the figure-8 cross-section. After $u$ goes once around, the figure 8 has turned over, which is the flip.

**One edge, no edge.** A Möbius strip has one side *and* one edge: run your finger along the edge and you trace all of it before getting back. A Klein bottle has one side and no edge at all, and it has no inside or outside.

## Try this

- Make a Möbius strip from paper. Draw a line down the middle without lifting your pen. Where do you end up?
- Cut it along the line. Then make another and cut it one third of the way across instead. What do you get?
- In the picture, stop the brush halfway through the second lap on the Möbius strip. Turn the strip and find where the "first lap" paint meets the "second lap" paint.
- Compare the painted percentage on the ring and on the Möbius strip after one lap. Why are they the same at that moment?
