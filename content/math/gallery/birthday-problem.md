---
title: "The birthday problem"
summary: "In a room of just 23 people, it's more likely than not that two share a birthday. See why."
emoji: "🎂"
gtags: [probability, famous-problems]
weight: 100
ladder_links:
  - { url: "/math/probability/birthday-problem/", why: "the full lesson, with practice" }
  - { url: "/math/probability-and-statistics/multiplication-rule/", why: "chances of one thing after another" }
  - { url: "/math/discrete-math/pigeonhole/", why: "why 366 people guarantee a match" }
  - { url: "/math/discrete-math/complement-counting/", why: "count what you don't want, then subtract" }
credits:
  - { name: "Our own picture", what: "simulated and drawn in your browser by code written for this page" }
  - { name: "Birthday problem (Grokipedia)", url: "https://grokipedia.com/page/Birthday_problem", what: "history and the exact values" }
  - { name: "William Feller, An Introduction to Probability Theory and Its Applications, Vol. 1 (3rd ed., 1968)", what: "the classic textbook treatment" }
---
## What you're seeing

The ring is a year, January at the top, with a dot for each person's birthday. When two people share a birthday, their dots turn red. Press Play to bring people in one at a time, or fill a whole room at once.

The chart shows the exact chance that *some* pair in the room shares a birthday. It crosses 50% at 23 people, and passes 99% at 57. Press *Run 1,000 rooms* to check the curve with simulated rooms: the gold square lands close to it.

## Why it works

We'll assume 365 equally likely birthdays and ignore February 29. (Real birthdays aren't quite even, and that only makes matches a little *more* likely.)

**Count the opposite.** "At least one shared birthday" can happen in many ways. "Everyone different" happens in only one, so compute that and subtract. Bring people in one at a time:

- the 1st person can have any birthday;
- the 2nd must avoid 1 day: chance $\tfrac{364}{365}$;
- the 3rd must avoid 2 days: chance $\tfrac{363}{365}$;
- and so on, up to the $n$th, who must avoid $n - 1$ days.

Multiply:

$$P(\text{all different}) = \frac{365}{365}\cdot\frac{364}{365}\cdots\frac{365 - n + 1}{365}, \qquad P(\text{shared}) = 1 - P(\text{all different}).$$

For $n = 23$ this gives $P(\text{shared}) \approx 0.507$.

**Why it feels wrong.** We tend to think about *our own* birthday. The chance that someone among 22 others shares yours is only about 6%. But the question is about *any* pair, and 23 people make

$$\binom{23}{2} = \frac{23 \cdot 22}{2} = 253$$

pairs. Each pair matches with chance $\tfrac1{365}$. With 253 chances, a match is no longer surprising.

**A quick estimate.** Using $1 - x \approx e^{-x}$ for small $x$,

$$P(\text{all different}) \approx e^{-(1 + 2 + \cdots + (n-1))/365} = e^{-n(n-1)/730}.$$

This equals $\tfrac12$ when $n(n-1) \approx 730 \ln 2 \approx 506$, so $n \approx 23$. In general, with $N$ equally likely days, a match becomes likely after about $\sqrt{2N\ln 2} \approx 1.18\sqrt N$ people.

**Where it's used.** The same square-root rule tells programmers how soon random ID numbers or "hash" codes start to collide, and it's behind the "birthday attack" in cryptography.

**A sure thing.** With 366 people, a shared birthday is certain (ignoring February 29). There are only 365 days, so two people must land on the same one. That's the pigeonhole principle.

## Try this

- Set the room to 23 and fill it a few times. About half the rooms should have a red pair.
- Set it to 50 and run 1,000 rooms. The chance is about 97%.
- How many people do you need before the chance someone shares *your* birthday passes 50%? (Solve $1 - (364/365)^n > \tfrac12$: it's 253.)
- Use the quick estimate for a year of $N = 100$ days. About how many people make a match likely?
