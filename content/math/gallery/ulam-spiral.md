---
title: "The Ulam prime spiral"
summary: "Write the counting numbers in a spiral and mark the primes. Diagonal lines appear, and nobody can fully explain them."
emoji: "🌀"
gtags: [numbers, famous-problems]
weight: 250
ladder_links:
  - { url: "/math/grade-4/prime-composite/", why: "what a prime number is" }
  - { url: "/math/number-theory/primality-sieve/", why: "how the page finds the primes (the sieve of Eratosthenes)" }
  - { url: "/math/number-theory/prime-counting/", why: "why primes thin out like 1 / ln n" }
  - { url: "/math/number-theory/congruence/", why: "why some diagonals can never hold primes" }
  - { url: "/math/algebra-1/quadratic-graphs/", why: "each diagonal is a quadratic" }
credits:
  - { name: "Our own picture", what: "drawn in your browser by code written for this page" }
  - { name: "Ulam spiral (Grokipedia)", url: "https://grokipedia.com/page/Ulam_spiral", what: "history and the link to quadratic polynomials" }
  - { name: "M. L. Stein, S. M. Ulam and M. B. Wells, A visual display of some properties of the distribution of primes, American Mathematical Monthly 71 (1964) 516–520", what: "the first published account of the spiral" }
  - { name: "Martin Gardner, Mathematical Games, Scientific American, March 1964", what: "the column that made the spiral famous" }
---
## What you're seeing

Put 1 in the middle square. Write 2 to its right, then keep going counterclockwise in a square spiral: 3, 4, 5, and so on. Then mark only the **primes**, the numbers with no divisors except 1 and themselves.

You might expect random-looking dust. Instead, many primes line up along **diagonal streaks**, with some long horizontal and vertical lines too. Tap a square to read its number.

Now switch **Show** to "a random look-alike". These are odd numbers picked at random, each kept with the same chance a prime of that size has. The dust looks about as dense, but the diagonals are gone. The streaks in the real spiral are something about primes, not about the drawing.

## Why it works

**Diagonals are quadratics.** Walk along a diagonal of the spiral, one ring at a time. Each ring has 8 more squares than the last, so the numbers you pass go up by amounts that grow by 8 each step. Numbers that grow like that are given by a quadratic, $4n^2 + bn + c$. For example, the diagonal running down to the right from the center holds $1, 9, 25, 49, \ldots$, the odd squares $(2n+1)^2$.

**Some diagonals can't hold primes.** That odd-squares diagonal is never prime (after 1). Half the diagonals hold only even numbers, so they're empty too. A quadratic like $4n^2 + 2n + 1$ is never even, so it has a better chance. Some quadratics avoid being divisible by 3, 5, 7 and other small primes far more often than random numbers do. Those are the bright streaks.

**Euler's famous formula.** In 1772 Leonhard Euler noticed that

$$n^2 + n + 41$$

is prime for every $n$ from 0 to 39. Start the spiral at 41 and mark this formula: its values line up on one long diagonal through the center. At $n = 40$ it finally fails: $40^2 + 40 + 41 = 41^2$.

**What is known, and what isn't.** Primes thin out slowly: near $n$, about 1 number in $\ln n$ is prime. In 1923 G. H. Hardy and J. E. Littlewood made a precise guess (their "Conjecture F") for how many primes each quadratic should produce, based on how often it avoids small prime factors. Computer counts agree with the guess very well. But it is still unproved. In fact, no one has proved that *any* quadratic, even $n^2 + 1$, gives infinitely many primes. That question is one of Landau's four problems from 1912, and it is still open.

**How it was found.** Stanislaw Ulam doodled the spiral during a long talk in 1963. He and his colleagues at Los Alamos then printed large versions on one of the early computers, and the streaks held up.

## Try this

- Find the diagonal of odd squares (1, 9, 25, 49, …). Why can't any of them be prime?
- Start at 41 and tick "Mark n² + n + 41". Where does the red line stop being unbroken?
- Compare the primes and the random look-alike at size 201. Which has more long streaks?
- Tap a few numbers on a bright diagonal and find the quadratic that gives them.
