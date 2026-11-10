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
openq_intro: "The paper’s Discussion ended with six open questions. We went back to them three times: Chapter 15 of the paper (added 2026-11-05), Chapter 16, a second look (added 2026-11-06) and Chapter 17, a third look (added 2026-11-10), which brought five new probable primes and the proofs in Teddy Rook’s notes. Most of them are famous unsolved problems, and they are still unsolved. Here is what we found, in plain words."
openq:
  - id: "oq-1"
    q: "Does pi have infinitely many prime fractions?"
    status: "Open"
    kind: "open"
    ask: "Pi’s best fractions are 22/7, 333/106, 355/113, and on and on. Are infinitely many of their bottom numbers (denominators) prime? Infinitely many top numbers (numerators)?"
    sec: ["15.1", "15.2", "16.2", "17.4", "17.5", "17.6"]
    chart: true
    items:
      - { date: "2026-11-05", kind: "Evidence", text: "We worked out 12,000,001 terms of pi’s continued fraction (the 3, then 12 million more), twice, at two precisions, and checked them against published records. Then we tested the first 20,000 fractions for primes. Pi has 10 prime denominators (the last at fraction number 6,925) and 15 prime numerators (the last at number 8,750). A typical number would have about 12.9 and 12.2, and both counts sit inside the range chance allows. So far only one fraction, 833,719/265,381, is prime on top and bottom." }
      - { date: "2026-11-05", kind: "Proved", text: "For e, whose terms follow a pattern, the denominators divided by any prime leave remainders that repeat forever." }
      - { date: "2026-11-06", kind: "Proved", text: "For e, those remainders, dividing by a prime ℓ, repeat with a period that divides 6ℓ." }
      - { date: "2026-11-10", kind: "Evidence", text: "Teddy Rook carried the search to fraction 50,000, top and bottom numbers, and found five new probable primes: four prime denominators, the 11th to the 14th, at fractions 25,332, 27,651, 32,394 and 37,721 (numbers with 13,017, 14,190, 16,695 and 19,465 digits), and one prime numerator, the 16th, at fraction 42,037 (21,667 digits), the first since 8,750. We rebuilt all five numbers from two different sources of pi’s digits and repeated the search ourselves to fraction 38,571 for bottom numbers and 42,037 for top numbers: there are no others there; beyond that the counts are his. All five are probable primes; a proof of the 11th is in progress, and none has been started for the others. A typical number would have about 14.1 prime denominators and 13.5 prime numerators by fraction 50,000, so 14 and 16 are ordinary. As far as we can find, no one has reported them before." }
      - { date: "2026-11-10", kind: "Evidence", text: "The search used a “rhythm sieve”: the rule that builds each bottom number, run with the remainders after division by every prime below ten million, which threw out 19 candidates in 20 before any huge number was tested (play it below, in “The rhythm sieve”). Among the in-between fractions next to pi’s largest terms, primes come in batches: 33 of the form 106 + 113k in the run of the famous 292, and 111 up to step 3,000 against 7 prime best fractions." }
      - { date: "2026-11-10", kind: "Evidence", text: "Two things stand out, and both look like chance. The four new prime denominators came close together: a typical number would put that many in that stretch less than 1% of the time, but the stretch was picked after looking, and the stretch before it ran low. And played as notes (the remainder after dividing by 12), pi’s prime fractions lean toward G: 15 of 30, top and bottom together. The bottom numbers that could be prime show no lean at all, so this is most likely luck. Even the opening guess, 3 + k/(7k + 1), belongs to a family of fractions (22k + 3)/(7k + 1) with primes on top and bottom; Archimedes’ 223/71 is the first." }
      - { date: "2026-11-10", kind: "Proved", text: "For e: the denominators flip sign every 3ℓ steps, so the period is exactly 6ℓ; a denominator of e can be prime only at n = 2 or n ≡ 1 (mod 3). In more detail, following Teddy Rook’s notes: every 3ℓ steps the denominators’ remainders flip sign and the numerators’ come back, so the remainders repeat after exactly 6ℓ and 3ℓ steps. Every whole number m divides three of the denominators (numbers 3m − 1, 3m − 3 and 3m − 7), so a denominator of e can be prime only at step 2 or at steps one more than a multiple of 3. All ten known prime denominators of e sit there. The forced divisors also account for half of a puzzle from Chapter 15: e’s denominators are divisible by small primes about twice as often as random numbers." }
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
    sec: ["15.5", "16.5", "17.7"]
    items:
      - { date: "2026-11-05", kind: "Evidence", text: "Pi’s first 12 million terms pass every test we tried: how often each value appears (41.489% are 1s, against 41.504% for the law), the very large terms, pairs of neighbors, 120 separate blocks, Khinchin’s and Lévy’s constants, and the record terms. The biggest term so far, 878,783,625 at position 11,504,930, is large but not extreme. We checked the tests themselves on random numbers first." }
      - { date: "2026-11-06", kind: "Evidence", text: "Two more tests also look typical: how closely each fraction hugs pi (the Doeblin–Lenstra law), and how neighboring terms depend on each other." }
      - { date: "2026-11-10", kind: "Evidence", text: "The new primes add two more checks, following Teddy Rook’s notes. First, the rule of thumb has a correction for the fact that a fraction’s top and bottom never share a factor. Pi’s own count of prime fractions, with the five new ones, now favors the corrected rule over the uncorrected one by about 30 to 1. Second, the “voices” of the rhythm sieve all sound at their proper rates: over two million of pi’s fractions, 2 divides a third of the bottom numbers, 3 a quarter, and so on for every prime below 1,000, just as for a typical number." }
    note: "This is good evidence. It is not a proof, and no known method could turn it into one."
  - id: "oq-5"
    q: "The correlation matrix"
    status: "Extremes answered"
    kind: "partly"
    ask: "Section 10’s matrix holds the correlation of every pair of pulse trains. What do its eigenvalues look like, and does 6/π² show up?"
    sec: ["15.6", "16.3", "17.1", "17.2", "17.3"]
    site: "/connections/rhythm-of-numbers/#corr"
    items:
      - { date: "2026-11-05", kind: "Proved", text: "Take the matrix for the periods up to m. Its eigenvalues average exactly 1, and their spread (variance) tends to 2. Its determinant has an exact formula. Its largest eigenvalue is at least (2/π²) · ln² m, which is one third of 6/π² times ln² m: that is where 6/π² appears." }
      - { date: "2026-11-05", kind: "Evidence", text: "Up close, its eigenvalues are spaced like those of a random matrix. We could see that, but not explain it." }
      - { date: "2026-11-06", kind: "Proved", text: "The largest eigenvalue grows faster than any power of ln m and slower than any power of m (the exact rate followed on 2026-11-10, below). The spectrum also holds many near-copies of the eigenvalues of small gcd matrices." }
      - { date: "2026-11-06", kind: "Evidence", text: "Those near-copies explain part of the random-matrix look. Without them the spacings are in between random-matrix and fully random." }
      - { date: "2026-11-10", kind: "Proved", text: "Following Teddy Rook’s notes: the largest eigenvalue grows like e raised to the power 2√(ln m / ln ln m), up to a factor that fades as m grows, and the smallest shrinks toward 0 at exactly the mirror rate. The whole spread of eigenvalues settles down to a fixed limiting shape as m grows, and the reciprocals of the eigenvalues average a fixed number, about 3.28. Four exact constants of the spread are now known (1, 3, 0.5599 and 3.2796), and none of them is 6/π²." }
      - { date: "2026-11-10", kind: "Known", text: "The method behind the largest eigenvalue is the “resonance method” that Soundararajan (2008) and Bondarenko and Seip used for the zeta function. We did not find the result stated for this matrix, but a specialist would regard it as a corollary of those techniques." }
    note: "Still open: the shape of the limiting law of the eigenvalues (a formula, whether it has a density, how it behaves near 0). 6/π² does not appear in any of its four known exact constants."
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
