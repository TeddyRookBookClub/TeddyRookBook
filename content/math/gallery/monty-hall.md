---
title: "The Monty Hall problem"
summary: "Three doors, one car, and a host who opens a door with a goat. Should you switch? Play it, then run 1,000 games."
emoji: "🚪"
gtags: [probability, famous-problems]
weight: 80
ladder_links:
  - { url: "/math/probability-and-statistics/conditional-probability/", why: "chance after you learn something" }
  - { url: "/math/probability-and-statistics/bayes-rule/", why: "updating with Bayes' rule" }
  - { url: "/math/probability/total-probability/", why: "splitting into cases" }
  - { url: "/math/probability-and-statistics/simulation-models/", why: "checking by simulation" }
credits:
  - { name: "Our own game and chart", what: "written for this page" }
  - { name: "Steve Selvin, A Problem in Probability (letter), The American Statistician 29 (1975)", what: "the first statement of the problem in print" }
  - { name: "Monty Hall problem (Grokipedia)", url: "https://grokipedia.com/page/Monty_Hall_problem", what: "history and the 1990 \"Ask Marilyn\" column" }
---
## What you're seeing

You're on a game show. There are three closed doors: a car is behind one, and goats are behind the other two. You pick a door. Then the host, who knows where the car is, opens one of the *other* doors and shows you a goat. Now you may stay with your door or switch to the last closed one.

Most people feel it's 50–50, so it can't matter. Play a few rounds, then press *Run 1,000 games each way*. Switching wins about two times in three.

## Why it works

**The rules matter.** The answer depends on how the host behaves. In the standard version, which the game follows:

1. the host always opens a door you didn't pick;
2. it always has a goat behind it;
3. the host always offers the switch; and if both of the other doors hide goats, he picks one of them at random.

**Look at your first pick.** Your first pick is right with chance $\tfrac13$ and wrong with chance $\tfrac23$. Nothing the host does changes which of these happened.

- If your first pick was right ($\tfrac13$), switching loses.
- If your first pick was wrong ($\tfrac23$), the car is behind one of the two other doors, and the host had to open the one with the goat. The door left closed must hide the car, so switching wins.

So

$$P(\text{switch wins}) = P(\text{first pick wrong}) = \frac23, \qquad P(\text{stay wins}) = \frac13.$$

**Why not 50–50?** The two closed doors are not alike. Yours was chosen before you knew anything. The other one *survived* a host who was forbidden to open the car. The host's choice carries information, and it all flows to the door he didn't open.

**With Bayes' rule.** Say you picked door 1 and the host opened door 3. If the car is behind door 1, he chose door 3 with chance $\tfrac12$; if it's behind door 2, he had to choose door 3. So

$$P(\text{car at 2} \mid \text{host opens 3}) = \frac{\tfrac13 \cdot 1}{\tfrac13 \cdot \tfrac12 + \tfrac13 \cdot 1} = \frac23.$$

**More doors.** With $n$ doors, where the host opens all the other doors but one, staying wins $\tfrac1n$ of the time and switching wins $1 - \tfrac1n$. With 100 doors it feels obvious: of course your first pick was probably wrong.

**A famous argument.** The statistician Steve Selvin posed the puzzle in 1975. It became famous in 1990, when Marilyn vos Savant answered it ("switch") in her magazine column, and thousands of readers, including many with math degrees, wrote in to say she was wrong. She wasn't.

**If the host is different.** If the host opens a door at random and happens to show a goat, the two closed doors really are equally likely, and switching doesn't help. That's why rule 2 matters.

## Try this

- Play 10 rounds always staying, then 10 always switching. Compare your two win counts.
- Switch to 100 doors and play one round. Do you still want to stay?
- Run the 1,000 computer games a few times. How far from $66.7\%$ does switching land?
- Write out all 6 equally likely (car, pick) pairs for 3 doors where the pick is wrong, and the 3 where it's right. Count the wins for each strategy.
