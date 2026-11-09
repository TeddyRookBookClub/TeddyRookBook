---
title: "Mild wishes, strong patterns"
summary: "Red and blue agents each want only a few neighbors like themselves, yet the board sorts itself into big blocks. Thomas Schelling's famous model, run live."
emoji: "🏘️"
gtags: [probability, famous-problems]
weight: 350
ladder_links:
  - { url: "/business/game-theory/", why: "the field Schelling's Nobel was for: strategy, conflict and cooperation" }
  - { url: "/business/game-theory/evolutionary-games/", why: "another way simple rules for many players add up to a pattern" }
  - { url: "/business/econometrics/what-is-econometrics/", why: "why a pattern in data doesn't tell you its cause by itself" }
  - { url: "/math/grade-6/percent-meaning/", why: "30% means 30 out of every 100" }
  - { url: "/math/grade-6/mean/", why: "the average share of like neighbors" }
  - { url: "/math/grade-7/simulations/", why: "using a simulation to learn what chance does" }
  - { url: "/math/probability-and-statistics/simulation-models/", why: "checking a model against what you see, by running it many times" }
credits:
  - { name: "Grokipedia, “Schelling's model of segregation”", url: "https://grokipedia.com/page/Schelling%27s_model_of_segregation", what: "an overview of the model, its history and its limits" }
  - { name: "Grokipedia, “Thomas Schelling”", url: "https://grokipedia.com/page/Thomas_Schelling", what: "his life and work" }
  - { name: "Our own simulation", what: "the board, the charts and every number on this page come from code written for this site; the 50-run averages were made with the same code and fixed seeds" }
  - { name: "Thomas C. Schelling, “Models of Segregation,” American Economic Review 59(2), 1969, 488–493", what: "the first published version of the model" }
  - { name: "Thomas C. Schelling, “Dynamic Models of Segregation,” Journal of Mathematical Sociology 1(2), 1971, 143–186", url: "https://doi.org/10.1080/0022250X.1971.9989794", what: "the full model: the 13 × 16 board, pennies and nickels, the eight-square neighborhood, and the results at one-third and one-half" }
  - { name: "Thomas C. Schelling, Micromotives and Macrobehavior (New York: W. W. Norton, 1978)", what: "the book version, chapter “Sorting and Mixing”" }
  - { name: "The Nobel Prize, “Press release: The Prize in Economic Sciences 2005”", url: "https://www.nobelprize.org/prizes/economic-sciences/2005/press-release/", what: "the prize and its citation" }
  - { name: "Royal Swedish Academy of Sciences, “Robert Aumann's and Thomas Schelling's Contributions to Game Theory: Analyses of Conflict and Cooperation” (scientific background, 2005)", url: "https://www.nobelprize.org/uploads/2018/06/advanced-economicsciences2005-2.pdf", what: "where the segregation model appears among Schelling's “other contributions”" }
  - { name: "Rainer Hegselmann, “Thomas C. Schelling and James M. Sakoda: The Intellectual, Technical, and Social History of a Model,” Journal of Artificial Societies and Social Simulation 20(3), 2017, 15", url: "https://www.jasss.org/20/3/15.html", what: "the history of the model, and James Sakoda's earlier checkerboard model" }
  - { name: "Uri Wilensky, NetLogo Segregation model (1997), Center for Connected Learning and Computer-Based Modeling, Northwestern University", url: "https://ccl.northwestern.edu/netlogo/models/Segregation", what: "a widely used version; its notes report about 70% like neighbors at a 30% wish" }
  - { name: "Dejan Vinković and Alan Kirman, “A physical analogue of the Schelling model,” PNAS 103 (2006), 19261–19265", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1748214/", what: "why the blocks grow like droplets with surface tension" }
---
## What you're seeing

Each cell of the board is a home. Some are empty. The rest hold an agent: a red circle, a blue square or (if you add a third color) a gold triangle. Colors and shapes are all they are. They stand for any two kinds of anything that notice each other's kind.

Every agent follows one rule. Look at your neighbors. If fewer than 30% of them are like you, you're unhappy, and you move to an empty home where you'd be happy. That's all. Nobody wants to live only with their own kind. A red agent with 2 red and 5 blue neighbors is perfectly content.

Press **Play** and watch. Unhappy agents wear a dark outline. They hop around, and within a few rounds the outlines are gone and the board has split into large red and blue patches. The first chart tracks the average share of like neighbors. It starts near 50%, because the board starts mixed at random, and climbs to about 75%. The dashed line is what each agent asked for. What they got is far more.

## Why it works

**Moves cause moves.** When a red agent leaves a mostly blue spot, it makes that spot a little more blue, and the reds left behind there may now drop below 30%. They move too. When the red agent lands, it makes its new spot a little more red, which can tip a blue neighbor there. Each move is sensible on its own, and each one nudges a few others. The nudges keep running in the same direction until the patches are big enough that almost everyone is comfortable.

**Edges are where the trouble is.** An agent in the middle of a patch has plenty of like neighbors. Agents on the border between patches are the ones at risk. So the system keeps trimming its borders, a bit like a soap bubble pulling itself round. Vinković and Kirman showed in 2006 that the math of this is close to the physics of surface tension, which is why the patches grow and smooth out.

**What "30%" means here.** With 8 neighbors and no empty cells nearby, 2 like neighbors is 25%, which is too few, and 3 is 37.5%, which is enough. So "at least 30%" works out to "at least 3 of my 8." The rule counts only occupied neighbors, so an agent with 6 neighbors and 2 empty cells beside it needs 2 like neighbors (33%). A phrase like "3 in 10" would fit a neighborhood of exactly 10 cells, but the usual grid neighborhoods have 4, 8 or 24.

**The three measures.**

- *Like neighbors:* for each agent, the share of its occupied neighboring cells that hold its own color, averaged over all agents. On a random board with half red and half blue, it's about 50%.
- *Unhappy agents:* the share of agents whose like share is below the wish (or above the upper limit, if you turn that on).
- *Block index:* cut the board into 5 × 5 blocks, and ask how far each block's mix is from the whole board's mix. It's 0 when every block has the board's mix and 1 when every block holds one color. (It's the dissimilarity index that sociologists use, in the form that works for three groups too.) Small blocks are never perfectly mixed by chance, so a random board already scores about 0.17.

**Our numbers.** We ran each setting 50 times with fixed seeds (1 to 50) on a 60 × 60 board with 10% empty, half red and half blue, edges wrapping around, each unhappy agent moving to a random empty spot it likes, until a round passed with no moves.

| Setting | Like neighbors at the end (average, lowest–highest) | Block index |
|---|---|---|
| Wants 30%, 8 neighbors | 74.6% (72.4–76.2%) | 0.40 |
| Wants 50%, 8 neighbors | 86.3% (84.7–87.8%) | 0.56 |
| Wants 30%, 4 neighbors | 76.1% (74.8–78.1%) | 0.34 |
| Wants 50%, 4 neighbors | 81.2% (79.8–82.4%) | 0.39 |
| Wants 30%, 24 neighbors | 56.6% (53.3–62.6%) | 0.27 |
| Wants 50%, 24 neighbors | 88.9% (86.8–91.6%) | 0.77 |
| Wants 30%, move to the nearest spot it likes | 69.5% (67.0–71.5%) | 0.30 |
| Wants 50%, move to the nearest spot it likes | 81.9% (80.3–83.0%) | 0.45 |

So at 30% with 8 neighbors, the average agent ends with about 3 like neighbors in 4, and every run settled within 9 rounds. Moving to the *nearest* good spot gives a bit less sorting, about 70%, close to what the NetLogo model's notes report. With 24 neighbors, a 30% wish is easy to meet without moving far, and the sorting is much milder. Wanting 50% gives sharper, larger blocks in every version.

**What Schelling saw by hand.** Schelling's own board had 13 rows and 16 columns, about 30% empty, and he moved each unhappy coin to the nearest spot it liked. He called the result "slight" when each wanted about one-third alike and "striking" at one-half. Computer runs on bigger boards, like ours and NetLogo's, show more clustering at 30% than his small hand-moved boards did. The main point holds in every version: the patterns come out stronger than the wishes that made them.

## Checking a popular post

A post going around online shows this model and makes six claims. Here's how they hold up.

**What the post gets right**

- *The rule.* Agents need at least 30% like neighbors, and unhappy ones move to a spot where that's true. That's the classic setup. (Its "3 in 10" wording fits a 10-cell neighborhood; on a grid with 8 neighbors, 30% means 3 of 8.)
- *About 3 in 4.* In our 50 runs at 30%, the average was 74.6%, and every run landed between 72% and 76%.
- *Sharper blocks at 50%.* Yes: 86% like neighbors and bigger blocks.
- *The lesson.* "A pattern in the whole does not prove a wish in the parts" is Schelling's own point. His 1971 paper says that inferences about individual motives can usually not be drawn from aggregate patterns.

**What needs a correction**

- *"Pennies and dimes on graph paper."* Close. In the 1971 paper, Schelling suggests "a roll of pennies, a roll of nickels," and a sheet ruled into one-inch squares, laid out like a checkerboard. He did the work "by hand and eye." He first described the model in 1969. (Other retellings say dimes; his own paper says nickels.)
- *The Nobel.* Schelling did share the 2005 Prize in Economic Sciences, with Robert Aumann. But the citation reads "for having enhanced our understanding of conflict and cooperation through game-theory analysis." The prize was for his body of work on strategy: bargaining, threats, promises and commitment, mostly from *The Strategy of Conflict* (1960). The committee's background report does mention the segregation model, but under "other contributions." So it isn't right to say a segregation paper won the Nobel.

## What it shows, and what it doesn't

The model shows that mild wishes are *enough* to produce strong separation. It does not show that real separation always comes from mild wishes. In real towns, historians and economists also point to laws, lending rules, income and other forces, and they disagree about how much each one matters. The model is a warning about reasoning backward: seeing a strong pattern, you can't tell from the pattern alone how strong the wishes behind it were.

Schelling liked this kind of puzzle. His 1978 book *Micromotives and Macrobehavior* opens with people choosing seats in an auditorium, and it is full of cases where what each person does adds up to something nobody planned. The title names the gap: small motives on one side, the behavior of the whole on the other.

## Who was Schelling?

Thomas Crombie Schelling (1921–2016) was an American economist, born in Oakland, California. He worked on the Marshall Plan after World War II, then taught at Yale, Harvard and the University of Maryland. His book *The Strategy of Conflict* (1960) used game theory to study bargaining and deterrence. He built the segregation model in the late 1960s with coins on a tabletop board, before personal computers. In the same year, 1971, and in the same journal, the sociologist James Sakoda published a checkerboard model of his own, which he had first worked out in 1949.

## Try this

- Press **Play** at 30%. How many rounds until nobody is unhappy? Then press **50%** and keep going.
- Turn on **Compare 30% and 50% side by side**. Both boards start from the same random mix.
- Slide the wish down to 20%, then to 10%. Is there a wish so mild that the board stays mixed?
- Try 70%. The agents get stuck: there's no spot left that would make them happy, so the board freezes with most of them still unhappy.
- Open **More settings** and pick **24 (two rings)**. Why does a 30% wish cause so little sorting now?
- Turn on **Also wants some difference** with the limit at 80%. Agents now leave spots that are too much like them, too. What happens to the blocks?
- Make red only 20% of people. Watch where the red agents end up.
- Tap any agent to see its neighbors counted.
