---
title: "Buffon's needle"
summary: "Drop needles on a striped floor and count how many cross a line. Out comes π."
emoji: "🪡"
gtags: [probability, geometry, famous-problems]
weight: 70
ladder_links:
  - { url: "/math/probability/geometric-probability/", why: "chance measured by length and area" }
  - { url: "/math/probability/joint-densities/", why: "two random numbers at once" }
  - { url: "/math/calculus-1/", title: "Calculus 1", why: "the integral of the sine" }
  - { url: "/math/probability/law-large-numbers/", why: "why the estimate settles down" }
  - { url: "/math/probability-and-statistics/simulation-models/", why: "estimating by simulation" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "Buffon's needle problem (Grokipedia)", url: "https://grokipedia.com/page/Buffon's_needle_problem", what: "history and the formula" }
  - { name: "Georges-Louis Leclerc, Comte de Buffon, Essai d'arithmétique morale (1777)", what: "where Buffon published the answer, in the supplement to his Histoire naturelle", licence: "public domain" }
  - { name: "Joseph-Émile Barbier, “Note sur le problème de l'aiguille et le jeu du joint couvert,” Journal de Mathématiques Pures et Appliquées (1860)", what: "the noodle: any curve of length ℓ crosses 2ℓ/(πd) lines on average" }
  - { name: "Lee Badger, Lazzarini's Lucky Approximation of π, Mathematics Magazine 67 (1994)", what: "why Lazzarini's 1901 result is doubted" }
---
## What you're seeing

The floor has lines drawn on it, all the same distance apart. We drop needles at random: a random spot, and a random angle. Some needles cross a line (red), some don't. Count them, put the counts into a short formula, and you get an estimate of $\pi$. The strip at the bottom shows how the estimate wanders, then closes in on $\pi$ as the needles pile up. The gold shading is where a fair run lands 95% of the time.

Switch the view to **The angles** to sort every needle by how it's tilted. That view shows where $\pi$ hides: in the needles that *aren't* there.

Georges-Louis Leclerc, Comte de Buffon, asked this question in 1733 and published the answer in 1777. It's one of the first problems in *geometric probability*.

## Why it works

Let the lines be $d$ apart and the needle $\ell$ long, with $\ell \le d$ (so a needle can cross at most one line).

**Two numbers describe a drop.** Let $y$ be the distance from the needle's middle to the nearest line, from $0$ to $\tfrac d2$, and let $\theta$ be the angle between the needle and the lines, from $0$ to $\pi$. A fair random drop makes both of them uniform and independent.

**When does it cross?** The needle reaches $\tfrac\ell2 \sin\theta$ above and below its middle. So it crosses a line exactly when

$$y \le \frac{\ell}{2}\sin\theta.$$

**Measure the chance as an area.** The pairs $(\theta, y)$ fill a rectangle of area $\pi \cdot \tfrac d2$. The crossing pairs lie under the curve $y = \tfrac\ell2\sin\theta$, which has area

$$\int_0^\pi \frac{\ell}{2}\sin\theta\, d\theta = \frac{\ell}{2}\Big[-\cos\theta\Big]_0^\pi = \ell.$$

So the chance of a crossing is

$$P = \frac{\ell}{\pi d/2} = \frac{2\ell}{\pi d}.$$

**Turn it around.** If $h$ of $n$ needles cross, then $h/n \approx P$. Solve for $\pi$:

$$\pi \approx \frac{2\ell\, n}{d\, h}.$$

**Look at the angles: what's not there.** Sort the needles into bars by angle. All the needles fill the bars evenly, because every angle is equally likely. But a needle lying almost flat along the lines hardly ever crosses one, and a needle standing straight across them crosses most often. At angle $\theta$ the chance is $\tfrac{\ell}{d}\sin\theta$, so the red bars of crossing needles pile up in the shape of a sine hump (the gold curve). The pale space above the hump is the needles that missed. The hump fills $\tfrac{2\ell}{\pi d}$ of the box, so the missing part is

$$1 - \frac{2\ell}{\pi d},$$

which is about 36% when the needle is as long as the gap. Measure how much is missing, and you've measured $\pi$. It's the same count as before, seen from the side.

**Bent needles work too.** In 1860 Joseph-Émile Barbier showed that the needle doesn't have to be straight. Drop a wiggly "noodle" of length $\ell$ (any length, any shape) and the *average* number of lines it crosses is still $\tfrac{2\ell}{\pi d}$. A circle of diameter $d$ always crosses exactly twice, and its length is $\pi d$, which is one way to see where the $\pi$ comes from.

**It's slow.** By the law of large numbers, $h/n$ settles down to $P$, but the typical error shrinks only like $1/\sqrt n$. Each extra correct digit needs about 100 times as many needles. Ten thousand drops usually get you two decimal places, sometimes three. That's why no one computes $\pi$ this way, but it's a wonderful check that chance and geometry fit together.

**A story with a twist.** In 1901 Mario Lazzarini reported dropping 3,408 needles and getting $\tfrac{355}{113} = 3.1415929\ldots$, correct to six decimal places. Mathematicians have pointed out that his numbers fit that fraction too neatly: with his needle and line sizes, stopping at just the right moment makes $\tfrac{355}{113}$ come out. A fair run of that size would be very unlikely to do so well.

## Try this

- Drop 100 needles a few times (Clear in between). How much do the estimates vary?
- Drop 10,000 several times. How many digits of $\pi = 3.14159\ldots$ do you usually get?
- Make the needles short (0.2 of the gap). Fewer cross, so is the estimate better or worse after 10,000?
- Switch to the angles and drop 10,000. Is the missing share close to what the label expects?
- With needle length equal to the gap, the chance of a crossing is $2/\pi \approx 0.637$. Check it against the counts.

Another surprising way to find $\pi$, with no chance in it at all: [colliding blocks that count its digits](/math/gallery/colliding-blocks/).
