---
title: "The double pendulum"
summary: "Two pendulums start a millionth of a radian apart. Within seconds they go their own ways."
emoji: "🎢"
gtags: [chaos]
weight: 30
ladder_links:
  - { url: "/math/differential-equations/second-order-intro/", why: "equations for things that swing" }
  - { url: "/math/differential-equations/predator-prey-pendulum/", why: "the single pendulum, the calm cousin" }
  - { url: "/math/differential-equations/numerical-methods/", why: "how a computer steps an equation forward" }
  - { url: "/math/numerical-analysis/ode-error/", why: "why small errors can matter" }
  - { url: "/math/precalculus/unit-circle-sine-cosine/", why: "sines and cosines of the angles" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "Double pendulum (Grokipedia)", url: "https://grokipedia.com/page/Double_pendulum", what: "the equations of motion and their background" }
  - { name: "Steven H. Strogatz, Nonlinear Dynamics and Chaos (2nd ed., 2015)", what: "background on chaos and sensitive dependence" }
---
## What you're seeing

Two double pendulums hang from the same pin: a rod with a weight, and a second rod with a weight hanging from the first. Pendulum B starts with its upper rod turned a tiny bit more than pendulum A, by default one millionth of a radian. That is far less than the width of a hair at this size.

At first they move as one, and you only see one. Then, after a few seconds, they split and move in completely different ways. The red line below shows the gap between them on a *log scale*, where each grid line is 100,000 times the one below it. The line climbs at a fairly steady slant, then levels off once the gap is as big as it can get.

## Why it works

**The equations are exact.** There is no randomness here. Newton's laws give two equations for the two angles $\theta_1$ and $\theta_2$. With equal rods of length 1 m, equal weights and gravity $g$, the first one is

$$\theta_1'' = \frac{-3g\sin\theta_1 - g\sin(\theta_1 - 2\theta_2) - 2\sin(\theta_1-\theta_2)\left(\omega_2^2 + \omega_1^2\cos(\theta_1-\theta_2)\right)}{3 - \cos(2\theta_1 - 2\theta_2)}$$

where $\omega_1 = \theta_1'$ and $\omega_2 = \theta_2'$ are the spinning speeds. The second is similar. Same start, same motion, every time.

**But small gaps grow.** For a chaotic system, a small gap $\delta_0$ tends to grow roughly like

$$\delta(t) \approx \delta_0\, e^{\lambda t}$$

for some rate $\lambda > 0$. Growth like this is a straight slanted line on a log scale, which is what the chart shows. Doubling your precision buys only a fixed amount of extra time. If the gap is $10^{-6}$ and it grows by a factor of 10 every second, you have about 6 seconds before the two disagree completely. Start at $10^{-9}$, a thousand times more precise, and you get only about 3 more seconds.

**Gentle swings are tame.** Start with small angles, and the pendulum behaves almost like two linked springs: regular, repeating, and predictable. Chaos needs enough energy for the rods to whip around. Try a start angle of 30° and then 150°.

**How the computer does it.** We can't solve these equations with a formula, so the page steps them forward 600 times a second of motion with the Runge–Kutta method (RK4). The method has its own tiny errors, and in a chaotic system those grow too. So the exact path shown after a minute is not the true path; what *is* reliable is the behavior: the split, its timing, and the kind of motion.

**Chaos in one sentence.** A system is called chaotic when it follows fixed rules but tiny differences in where it starts grow fast, so long-range prediction is impossible in practice. Weather is the famous example; see the Lorenz attractor in this gallery.

## Try this

- Set the start angle to 30°. Do the pendulums ever split? Now try 150°.
- Change the difference from $10^{-6}$ to $10^{-9}$. How much longer do they stay together?
- Change it to $10^{-2}$ (about half a degree). They split almost at once.
- Use the Step button to walk through the moment they part.
