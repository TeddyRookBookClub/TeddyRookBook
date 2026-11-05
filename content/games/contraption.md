---
title: "Contraption Workshop"
description: "Build a chain-reaction machine from ramps, dominoes, levers, pulleys, springs and a screw lift, then press Run and watch it ring the bell. Ten challenges, a sandbox, and a counter that names the simple machines you used."
layout: contraption
credits:
  - { name: "Our own parts and physics", what: "every part, drawing and level is made in your browser by code written for this site, including the small physics engine" }
  - { name: "“Declarative Dragging”", url: "https://declarative-dragging.github.io/", what: "the paper by Joshua Horowitz, Andrew Blinn and Jeffrey Heer (UIST 2026) whose idea inspired the way parts snap only to allowed spots; none of its code is used" }
  - { name: "Rube Goldberg", url: "https://www.britannica.com/biography/Rube-Goldberg", what: "the facts about the cartoonist, from Encyclopaedia Britannica" }
  - { name: "OpenStax, College Physics 2e, 9.5 Simple Machines", url: "https://openstax.org/books/college-physics-2e/pages/9-5-simple-machines", what: "the simple machines and mechanical advantage" }
---

## About the workshop

A chain-reaction machine does something simple in as many steps as it can. A ball rolls down a ramp, knocks over a row of dominoes, tips a lever, drops into a bucket, and at last a bell rings. Each step hands its motion to the next one.

Machines like these are often named after **Rube Goldberg** (1883–1970), an American cartoonist born in San Francisco. He studied engineering at the University of California, then became famous for drawing silly inventions that took a dozen steps to do one small job. His name became a word for any simple task done the long way. He also won a Pulitzer Prize in 1948 for an editorial cartoon. ([Britannica](https://www.britannica.com/biography/Rube-Goldberg))

### The six simple machines

Six devices are known as the classical simple machines. Every part in the workshop that counts as one lights up in the panel under the stage when it moves.

- **Inclined plane:** a ramp. Rolling a ball down a slope trades height for speed. Pushing a load up a slope takes less force than lifting it, over a longer distance.
- **Lever:** a bar that turns on a point called the fulcrum. A seesaw is a lever.
- **Wheel and axle:** a wheel fixed to a rod so they turn together. Here it is a paddle wheel.
- **Pulley:** a wheel with a rope over it. Weight on one side lifts the other.
- **Wedge:** two ramps back to back. It splits or pushes things apart; here it turns a falling ball sideways.
- **Screw:** a ramp wrapped around a post. As it turns, it carries the ball up, like the water screw credited to Archimedes.

None of them gives you something for nothing: a smaller force always means a longer distance. The [simple machines lesson](/physics/physical-science/simple-machines/) shows the numbers, and [Levers and Balance](/physics/physical-science/levers/) explains why a long arm helps.

### How the dragging works

When you drag a part, it doesn't just follow your finger. The workshop works out every spot where the part is allowed (it must fit, and dominoes, levers, springs, cups, wedges and the screw lift must stand on the floor, a level ramp or a wall) and shows the allowed spot nearest your finger. Everywhere else turns gray. Gold dots mark spots where the part would catch motion from a neighbor, and the dotted line shows where the balls would roll, worked out by running the physics a few seconds ahead. The idea of dragging only between allowed states comes from a research paper, “Declarative Dragging” by Joshua Horowitz, Andrew Blinn and Jeffrey Heer (2026); the workshop's code is our own.

### The physics

Balls fall with gravity, bounce a little and roll with a little friction. Levers, dominoes and the paddle wheel turn about their pivots, and the pulley's two buckets move together on one rope, so a heavier bucket sinks and lifts the other. The motion is worked out 480 times a second, and slow motion plays exactly the same steps, only slower. Real balls also spin and lose more energy, so a real machine built the same way would need some adjusting.
