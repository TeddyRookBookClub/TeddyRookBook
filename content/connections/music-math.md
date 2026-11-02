---
title: "Ratios, clocks and rhythms"
short: "Ratios"
sets: [music, math]
weight: 110
teaser: "Notes that sound good together have frequencies in simple whole-number ratios. Scales are clock arithmetic, and some of the world's favorite rhythms come from an algorithm Euclid wrote down about 2,300 years ago."
golinks:
  - { url: "/physics/physics-2/standing-waves-strings/", why: "why a string makes only certain notes" }
  - { url: "/physics/waves-optics-modern-physics/standing-wave-math/", why: "the math of standing waves" }
  - { url: "/math/grade-6/equivalent-ratios/", why: "what a ratio is" }
  - { url: "/math/number-theory/modular-arithmetic/", why: "clock arithmetic, properly" }
  - { url: "/math/number-theory/euclidean-algorithm/", why: "the algorithm behind the rhythms" }
  - { url: "/math/algebra-2/logarithms/", why: "why equal steps in pitch are equal ratios" }
  - { url: "/music/reading-music/intervals-and-chords/", why: "intervals on the staff" }
  - { url: "/music/reading-music/scales-and-circle-of-fifths/", why: "the circle of fifths for players" }
  - { url: "/music/rhythm/", why: "practice keeping two rhythms at once" }
credits:
  - { name: "Pythagorean tuning (Grokipedia)", url: "https://grokipedia.com/page/Pythagorean_tuning", what: "the ratios 2:1, 3:2 and 4:3 and tuning by fifths" }
  - { name: "Harmonic series (music) (Grokipedia)", url: "https://grokipedia.com/page/Harmonic_series_(music)", what: "overtones of a string" }
  - { name: "Pythagorean comma (Grokipedia)", url: "https://grokipedia.com/page/Pythagorean_comma", what: "531441/524288, about 23.46 cents" }
  - { name: "Equal temperament (Grokipedia)", url: "https://grokipedia.com/page/Equal_temperament", what: "the twelfth root of 2" }
  - { name: "Circle of fifths (Grokipedia)", url: "https://grokipedia.com/page/Circle_of_fifths", what: "history and use" }
  - { name: "Godfried Toussaint, The Euclidean Algorithm Generates Traditional Musical Rhythms, Bridges 2005", url: "https://archive.bridgesmathart.org/2005/bridges2005-47.html", what: "Euclidean rhythms" }
  - { name: "Euclidean rhythm (Grokipedia)", url: "https://grokipedia.com/page/Euclidean_rhythm", what: "examples and Bjorklund's algorithm" }
---
### Strings and simple ratios

Pluck a string, then stop it at half its length and pluck again. The note jumps up an **octave**: the shorter string vibrates twice as fast. Stop it at two thirds of its length and you get a **fifth**, the next-sweetest sound. Three quarters gives a **fourth**.

Ancient Greek writers credited this to Pythagoras and his followers (6th and 5th centuries BC), who tested it on a one-string instrument, the monochord. The pattern is real: two notes blend smoothly when their frequencies make a simple ratio such as 2:1, 3:2 or 4:3. (A later legend says Pythagoras heard it in a blacksmith's hammers. The physics of that story doesn't work, but the string version does.)

[[viz:mm-ratios|Pick an interval. The lower string is shorter by that ratio, so it vibrates faster by the same ratio. Play them together, then try the tritone, whose ratio is not simple at all.]]

### The harmonic series: the notes hidden inside one note

A real string doesn't vibrate in just one hump. It also vibrates in 2, 3, 4 and more equal loops at the same time, at 2, 3, 4 … times the lowest frequency. These **overtones** form the **harmonic series**. You rarely hear them one by one, but their mix is a big part of why a violin and a flute playing the same note sound different.

The simple ratios hide in the series: harmonics 1 and 2 make an octave, 2 and 3 a fifth, 3 and 4 a fourth, 4 and 5 a major third. Two notes that share many overtones sound smooth together.

[[viz:mm-harmonics|Each row is one mode of the same string. Tap rows to light them, then play the lit modes together: the more you add, the richer the tone.]]

### The circle of fifths is a clock

Western music splits the octave into 12 half steps. After 12 steps you are back where you started, one octave higher, so note names work like hours on a clock: arithmetic **modulo 12**. Stepping up a fifth means adding 7 half steps. Because 7 and 12 share no common factor, stepping by 7 visits all 12 notes before coming home. That walk is the circle of fifths. Try stepping by 4 or 3 instead: you get stuck in a small loop.

There is a catch. Twelve *pure* 3:2 fifths should land exactly seven octaves up, but $(3/2)^{12} \approx 129.75$ while $2^7 = 128$. The small miss, about a quarter of a half step, is called the **Pythagorean comma**. Modern **equal temperament** shares it out by making every half step the same ratio, $2^{1/12} \approx 1.0595$. Its fifth is $2^{7/12} \approx 1.4983$, a hair under 1.5, and the circle closes.

[[viz:mm-clock|Step around the clock. Each step adds 7 half steps (mod 12). Turn on pure 3:2 fifths and watch the path miss its starting point after twelve steps.]]

### Euclidean rhythms

In 2005 the computer scientist Godfried Toussaint noticed something about rhythms from around the world. Take $n$ beats in a bar and ask for $k$ accents spread as evenly as possible. The answer, found with steps like Euclid's algorithm for the greatest common divisor (about 300 BC), is often a traditional rhythm. Three accents in eight steps gives the *tresillo*, heard across Latin American and African music. Five in eight gives the Cuban *cinquillo*. The same procedure had been used a couple of years earlier by the physicist E. Bjorklund to time pulses in a particle accelerator.

[[viz:mm-euclid|Set the number of steps and beats, then play. Rotating a rhythm starts it on a different step: the pattern is the same, but it feels different.]]
