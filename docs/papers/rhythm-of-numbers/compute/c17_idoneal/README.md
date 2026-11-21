# Euler's idoneal (convenient) numbers: the list of 65 is complete

Programs and output behind the page
`/connections/rhythm-of-numbers/riemann-hypothesis/eulers-convenient-numbers/` ("What we did").
This is not part of the paper. It has not been reviewed by a number theorist.

**Claim.** The 65 idoneal numbers known since Euler (1, 2, 3, ..., 1320, 1365, 1848) are all of them.

**What it rests on.**

1. The Generalized Riemann Hypothesis for the Dirichlet L-functions of real characters, as proved in the Lean library
   certified by the Lean and Mathlib communities on 2026-11-21.
2. Y. Lamzouri, X. Li, K. Soundararajan, "Conditional bounds for the least quadratic non-residue and related problems",
   Math. Comp. 84 (2015), Corollary 1.3: on GRH, for a fundamental discriminant -q with q >= 10^10,
   h(-q) >= (pi / (12 e^gamma)) sqrt(q) / (log log q - log 2 + 1/2 + 1/log log q + 14 log log q / log q).
   (The first version of this note, 2026-11-21, also used Theorem 1.4 of that paper. This version does not.)
3. Standard facts on binary quadratic forms (D. Cox, *Primes of the Form x^2 + ny^2*): n is idoneal exactly when the
   form class group C(-4n) has exponent <= 2, i.e. one class per genus (Thm 3.22); the number of genera of
   discriminant -4n is 2^(mu-1) with mu <= r + 2, r = number of odd primes dividing n (Prop. 3.11, Thm 6.1);
   C(f^2 d) maps onto C(d), and h(f^2 d) = h(d) f prod_{p | f} (1 - (d/p)/p) / [O_K^* : O^*] (Thm 7.24);
   a fundamental discriminant d with C(d) of exponent <= 2 has h(d) = 2^(k-1), k = number of primes dividing d.

**Lemma A (used only to make the search fast).** Let C(D) have exponent <= 2, D < 0, and let p be a prime with p not
dividing D and Kronecker(D, p) = +1. Then |D| <= 4 p^2.
*Proof.* p is represented by a primitive form (p, b, c) of discriminant D. Its class has order <= 2, and since p does
not divide D its square is the class of a form (p^2, B, C). So the principal form represents p^2 with coprime x, y:
4 p^2 = X^2 + |D| y^2 with y != 0 (y = 0 would force x = +-1 and p = 1).

**Steps** (n idoneal, -4n = -q f^2 with -q fundamental).

1. C(-q) has exponent <= 2, so h(-q) = 2^(k-1). Corollary 1.3 gives h(-q) >= 2843 at q = 10^10, increasing in q, and
   at least 5.5 times 2^(k-1) for every q >= 10^10 with k prime factors (`check_steps.py`). So q < 10^10.
2. `exp2.c` finds every discriminant -q, q < 10^10, with exponent <= 2: Lemma A as a sieve, then an exact test on the
   survivors (every reduced primitive form must be ambiguous). Output `exp2-output.txt`: 101 discriminants, the
   largest -7392; 65 fundamental (largest -5460); 65 of the form -4n, which are Euler's 65.
3. So q is one of those 65 values, with h(-q) = 2^(k-1). Then h(-4n) >= 2^(k-1) phi(f) / 3, while one class per genus
   gives h(-4n) = 2^(mu-1) <= 2^(r+1) with r <= k + (number of odd primes dividing f). Hence
   phi(f) <= 12 * 2^(number of odd primes dividing f). Exactly 79 values of f satisfy this, the largest 420
   (`check_steps.py`, by construction and by brute force to 200,000). So n = q f^2 / 4 <= 5460 * 420^2 / 4 < 2.41 * 10^8,
   inside the range of Step 2.

**Run.**

    gcc -O2 -o exp2 exp2.c && ./exp2 0 10000000000 > exp2-output.txt     # about 90 processor-seconds
    python3 check_steps.py                                               # Steps 1 and 3, numerically
    gcc -O2 -o euler euler.c && ./euler 2000000                          # independent: Euler's ab + bc + ca rule

`euler.c` is a cross-check that shares nothing with `exp2.c`: it also finds exactly the 65 below two million.

**Re-check of the 2015 paper** (`check_lls.py`, output `check_lls-log.txt`: 19 checks, all pass). We read the proofs
of Theorem 1.5 / Corollary 1.3 and of Theorem 1.4 in a text extraction of arXiv:1309.3595v3 in which some displays
were unreadable. Re-computed: the constant B; Lemmas 2.1, 2.4 and 2.6 against the primes up to 3,000,000 (largest
error 35% of the allowed error); the numerical inequalities of Section 4 for X >= 10^9; the choice x = (log q)^2 / 4
and both exponentiations in the proof of Theorem 1.5 for q from 10^10 to 10^(10^6); Lemma 5.1 (the paper's computer
step for p = 2) for six primes; Corollary 1.3 against exact class numbers (`hq.c`, `hq-output.txt`) of 40 fundamental
discriminants between 10^10 and 3.6 * 10^10, among them the 24 with the longest runs of inert or of split small primes
that `runs.c` finds there (`runs-output.txt`): smallest h / lower bound = 2.09, largest h / upper bound = 0.674.
Two observations on Theorem 1.4, which this note no longer uses: Lemma 3.1 is stated for m >= 3 and applied with
m = q / q~ that can be 2 (the bound holds for m = 2 by direct computation); and the last line of the proof gives, for
h = 2 and q = 20000, the bound 46.4 where the statement's bracket is 32.0 (the statement still holds through its
alternative p <= 10^9, and the bracket is the larger of the two wherever that alternative fails). These are readings
of an imperfect copy.

**Not checked.** Lemmas 2.2, 2.3 and 2.5 of the 2015 paper (the versions with a character), the displays we could not
read, the contour-integral derivations as such, the Lean library, and the quoted facts on quadratic forms.
Weinberger's 1973 proof (at most two more idoneal numbers; none under GRH) goes a different way.
