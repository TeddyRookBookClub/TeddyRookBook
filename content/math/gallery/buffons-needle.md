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
  - { name: "Lee Badger, Lazzarini's Lucky Approximation of π, Mathematics Magazine 67 (1994)", what: "why Lazzarini's 1901 result is doubted" }
---
## What you're seeing

The floor has lines drawn on it, all the same distance apart. We drop needles at random: a random spot, and a random angle. Some needles cross a line (red), some don't. Count them, put the counts into a short formula, and you get an estimate of $\pi$. The strip at the bottom shows how the estimate wanders, then closes in on $\pi$ as the needles pile up.

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

**It's slow.** By the law of large numbers, $h/n$ settles down to $P$, but the typical error shrinks only like $1/\sqrt n$. Each extra correct digit needs about 100 times as many needles. Ten thousand drops usually get you two decimal places, sometimes three. That's why no one computes $\pi$ this way, but it's a wonderful check that chance and geometry fit together.

**A story with a twist.** In 1901 Mario Lazzarini reported dropping 3,408 needles and getting $\tfrac{355}{113} = 3.1415929\ldots$, correct to six decimal places. Mathematicians have pointed out that his numbers fit that fraction too neatly: with his needle and line sizes, stopping at just the right moment makes $\tfrac{355}{113}$ come out. A fair run of that size would be very unlikely to do so well.

## Try this

- Drop 100 needles a few times (Clear in between). How much do the estimates vary?
- Drop 10,000 several times. How many digits of $\pi = 3.14159\ldots$ do you usually get?
- Make the needles short (0.2 of the gap). Fewer cross, so is the estimate better or worse after 10,000?
- With needle length equal to the gap, the chance of a crossing is $2/\pi \approx 0.637$. Check it against the counts.
