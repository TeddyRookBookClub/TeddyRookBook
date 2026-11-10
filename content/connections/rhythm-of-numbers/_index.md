---
title: "The Rhythm of Numbers"
description: "Play pi as a beat and you hear its continued fraction: gaps of 7, an 8 every 16th gap, a rare short phrase after 292. Follow that rhythm to the prime numbers through tuning, polyrhythm, crystals, nuclei and factoring, with live instruments, a drum machine and a composer that writes a piece you can download."
layout: rhythm
# The URL /connections/rhythm-of-numbers/ is printed in a YouTube video description: never move or rename this page.
#
# video_id: the YouTube id of the Continued-Fraction Suite video (the 11 characters after "watch?v=" in an individual
# video's link, never a playlist or channel). While it is empty, section 23 shows no video at all. Once it is filled in,
# the page shows a click-to-play poster; nothing loads from YouTube until it is pressed (youtube-nocookie.com).
video_id: "K0l47YsgopE"
# video_title: "The Continued-Fraction Suite, by Teddy Rook"
# video_about: "Original music built from the rhythms on this page."
#
# openq: "Working on the open questions" (#open-questions), a plain-words summary of Chapters 15 and 16 of the paper
# (docs/papers/rhythm-of-numbers/paper/ch15_openq.tex and ch16_openq2.tex). Keep every claim and label as the paper has
# it: "Proved" = proved in the paper (from cited results); "Evidence" = computation, never a proof; "Known" = already
# known to others. Dates are the UTC dates the work was added (2026-11-05 = Chapter 15, 2026-11-06 = Chapter 16,
# 2026-11-10 = Chapter 17).
# sec: the paper's section numbers; their PDF pages are in data/rhythm/paper_pages.yaml (checked by
# scripts/rhythm/check-paper-links.py). The chart under question 1 reads data/rhythm/openq_pi.json
# (scripts/rhythm/openq-chart-data.py).
openq_intro: "The paper’s Discussion ended with six open questions. We went back to them twice: Chapter 15 of the paper (added 2026-11-05, UTC) and Chapter 16, a second look (added 2026-11-06, UTC), and Chapter 17, a third look (added 2026-11-10, UTC), which brought a new probable prime. Most of them are famous unsolved problems, and they are still unsolved. Here is what we found, in plain words."
openq:
  - id: "oq-1"
    q: "Does pi have infinitely many prime fractions?"
    status: "Open"
    kind: "open"
    ask: "Pi’s best fractions are 22/7, 333/106, 355/113, and on and on. Are infinitely many of their bottom numbers (denominators) prime? Infinitely many top numbers (numerators)?"
    sec: ["15.1", "15.2", "16.2", "17.4", "17.5"]
    chart: true
    items:
      - { date: "2026-11-05", kind: "Evidence", text: "We worked out 12,000,001 terms of pi’s continued fraction (the 3, then 12 million more), twice, at two precisions, and checked them against published records. Then we tested the first 20,000 fractions for primes. Pi has 10 prime denominators (the last at fraction number 6,925) and 15 prime numerators (the last at number 8,750). A typical number would have about 12.9 and 12.2, and both counts sit inside the range chance allows. So far only one fraction, 833,719/265,381, is prime on top and bottom." }
      - { date: "2026-11-05", kind: "Proved", text: "For e, whose terms follow a pattern, the denominators divided by any prime leave remainders that repeat forever." }
      - { date: "2026-11-06", kind: "Proved", text: "For e, those remainders, dividing by a prime ℓ, repeat with a period that divides 6ℓ." }
      - { date: "2026-11-10", kind: "Evidence", text: "Teddy Rook carried the search further and found an 11th prime denominator, at fraction number 25,332: a number with 13,017 digits. His search ran to fraction 26,000 and found no other prime top or bottom number there. We checked the new prime independently, from two different sources of pi’s digits, and found no other prime denominator between fraction 20,000 and 25,332. It is a probable prime; a full proof is in progress. A typical number would have about 13.2 prime denominators by then, so 11 is ordinary. As far as we can find, no one has reported this one before." }
      - { date: "2026-11-10", kind: "Proved", text: "For e, following Teddy Rook’s notes: every 3ℓ steps the denominators’ remainders flip sign and the numerators’ come back, so the remainders repeat after exactly 6ℓ and 3ℓ steps. Every whole number m divides three of the denominators (numbers 3m − 1, 3m − 3 and 3m − 7), so a denominator of e can be prime only at step 2 or at steps one more than a multiple of 3. All ten known prime denominators of e sit there. The forced divisors also account for half of a puzzle from Chapter 15: e’s denominators are divisible by small primes about twice as often as random numbers." }
    note: "For numbers this large, “prime” means the number passed the Baillie–PSW test. No number is known to fool that test, but passing it is not a proof."
  - id: "oq-2"
    q: "Fibonacci and Pell primes"
    status: "Open"
    kind: "open"
    ask: "For the golden ratio the denominators are the Fibonacci numbers, and for √2 they are the Pell numbers. Are infinitely many of them prime?"
    sec: ["15.3"]
    items:
      - { date: "2026-11-05", kind: "Evidence", text: "We compared the known lists (the 51 Fibonacci primes with index up to 3,340,367, and the 31 Pell primes with index below 100,000) with the best current prediction, by Grantham and Granville. The Fibonacci counts run about a sixth below it, the Pell counts about a third above. For counts this small, that is as close as anyone can expect. Nothing we did touches the question itself." }
  - id: "oq-3"
    q: "Proving the guess about prime fractions"
    status: "Answered for almost every number"
    kind: "answered"
    ask: "The paper guessed that a typical number has about 2 ln 2 · ln N ≈ 1.39 ln N prime denominators among its first N fractions. Can that be proved?"
    sec: ["15.4", "16.1"]
    items:
      - { date: "2026-11-05", kind: "Proved", text: "For a number picked at random, the average count is exactly 2 ln 2 · ln N, plus an error that stays bounded. A simulation of 20,000 random numbers agrees. Using deep recent results by Koukoulopoulos, Maynard and Yang, the count for almost every single number lies between ln N and 2 ln N in the long run." }
      - { date: "2026-11-06", kind: "Proved", text: "For almost every number, the count is 2 ln 2 · ln N, with an error no bigger than about the square root of ln N (times a slowly growing factor). The same holds for numerators. The key step shows that “q is a denominator” and “r is a denominator” are nearly independent events for different primes q and r. We did not find this theorem in print, though the argument is short and experts may well know it." }
    note: "“Almost every number” leaves out a set of numbers so thin it has total length zero. Pi could be in that set, so none of this proves anything about pi."
  - id: "oq-4"
    q: "Is pi a typical number?"
    status: "Open"
    kind: "open"
    ask: "Almost every number’s terms follow the same laws: how often 1, 2, 3, … appear (the Gauss–Kuzmin law), Khinchin’s constant, Lévy’s constant. Does pi follow them?"
    sec: ["15.5", "16.5"]
    items:
      - { date: "2026-11-05", kind: "Evidence", text: "Pi’s first 12 million terms pass every test we tried: how often each value appears (41.489% are 1s, against 41.504% for the law), the very large terms, pairs of neighbors, 120 separate blocks, Khinchin’s and Lévy’s constants, and the record terms. The biggest term so far, 878,783,625 at position 11,504,930, is large but not extreme. We checked the tests themselves on random numbers first." }
      - { date: "2026-11-06", kind: "Evidence", text: "Two more tests also look typical: how closely each fraction hugs pi (the Doeblin–Lenstra law), and how neighboring terms depend on each other." }
    note: "This is good evidence. It is not a proof, and no known method could turn it into one."
  - id: "oq-5"
    q: "The correlation matrix"
    status: "Partly answered"
    kind: "partly"
    ask: "Section 10’s matrix holds the correlation of every pair of pulse trains. What do its eigenvalues look like, and does 6/π² show up?"
    sec: ["15.6", "16.3", "17.1", "17.2", "17.3"]
    site: "/connections/rhythm-of-numbers/#corr"
    items:
      - { date: "2026-11-05", kind: "Proved", text: "Take the matrix for the periods up to m. Its eigenvalues average exactly 1, and their spread (variance) tends to 2. Its determinant has an exact formula. Its largest eigenvalue is at least (2/π²) · ln² m, which is one third of 6/π² times ln² m: that is where 6/π² appears." }
      - { date: "2026-11-05", kind: "Evidence", text: "Up close, its eigenvalues are spaced like those of a random matrix. We could see that, but not explain it." }
      - { date: "2026-11-06", kind: "Proved", text: "The largest eigenvalue grows faster than any power of ln m and slower than any power of m. The spectrum also holds many near-copies of the eigenvalues of small gcd matrices." }
      - { date: "2026-11-06", kind: "Evidence", text: "Those near-copies explain part of the random-matrix look. Without them the spacings are in between random-matrix and fully random." }
      - { date: "2026-11-10", kind: "Proved", text: "Following Teddy Rook’s notes: the largest eigenvalue grows like e raised to the power 2√(ln m / ln ln m), up to a factor that fades as m grows, and the smallest shrinks toward 0 at exactly the mirror rate. The whole spread of eigenvalues settles down to a fixed limiting shape as m grows, and the reciprocals of the eigenvalues average a fixed number, about 3.28. Four exact constants of the spread are now known (1, 3, 0.5599 and 3.2796), and none of them is 6/π²." }
      - { date: "2026-11-10", kind: "Known", text: "The method behind the largest eigenvalue is the “resonance method” that Soundararajan (2008) and Bondarenko and Seip used for the zeta function. We did not find the result stated for this matrix, but a specialist would regard it as a corollary of those techniques." }
    note: "Still open: a formula for the limiting shape of the eigenvalues. 6/π² does not appear in any of its four known exact constants."
  - id: "oq-6"
    q: "Scales with a prime number of notes"
    status: "Answered: no"
    kind: "answered"
    ask: "Do equal-tempered scales with a prime number of notes (7, 31, 53, …) tune better than the rest?"
    sec: ["15.7", "16.4"]
    site: "/connections/rhythm-of-numbers/#fifths"
    items:
      - { date: "2026-11-05", kind: "Evidence", text: "We ranked every equal temperament from 5 to 200 notes by eight standard measures. The 171-note scale wins seven of them. Prime sizes do no better and no worse than the rest." }
      - { date: "2026-11-05", kind: "Proved", text: "They cannot stand out in the long run either. A theorem of Vinogradov’s shows that, for tuning accuracy, prime sizes behave like all sizes." }
      - { date: "2026-11-06", kind: "Known", text: "Why 171 wins: it is the scale fixed by three tiny musical commas (the schisma, the breedsma and the ragisma). Tuning theorists already know this; the Xenharmonic Wiki says so. What we added is a short formula for its errors." }
credits:
  - { name: "Our own instruments and sounds", what: "every picture and sound on this page is drawn or made in your browser by code written for this site; the sources for the facts are listed in “Notes and sources” above" }
---
