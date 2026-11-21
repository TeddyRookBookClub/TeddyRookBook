# Euler's idoneal (convenient) numbers: the list of 65 is complete

Programs and output behind the page
`/connections/rhythm-of-numbers/riemann-hypothesis/eulers-convenient-numbers/` ("What we did").
This is not part of the paper. It has not been reviewed by a number theorist.

**Claim.** The 65 idoneal numbers known since Euler (1, 2, 3, ..., 1320, 1365, 1848) are all of them.

**What it rests on.**

1. The Generalized Riemann Hypothesis for every Dirichlet L-function, as proved in the Lean library certified by the
   Lean and Mathlib communities on 2026-11-21.
2. Y. Lamzouri, X. Li, K. Soundararajan, "Conditional bounds for the least quadratic non-residue and related problems",
   Math. Comp. 84 (2015): Theorem 1.4 (least prime in a coset of a subgroup of index h, for moduli q >= 20000) and
   Corollary 1.3 (class number of an imaginary quadratic field of discriminant -q, q >= 10^10).
3. Standard facts on binary quadratic forms (D. Cox, *Primes of the Form x^2 + ny^2*): n is idoneal exactly when the
   form class group of discriminant -4n has exponent <= 2 (one class per genus); the class group of an order maps onto
   that of the maximal order; a field whose class group has exponent <= 2 has class number 2^(k-1), k = number of
   primes dividing its discriminant.

**Lemma A.** Let the form class group of discriminant D < 0 have exponent <= 2, and let p be a prime with p not
dividing D and Kronecker(D, p) = +1. Then |D| <= 4 p^2.
*Proof.* p is represented by a primitive form (p, b, c) of discriminant D. Its class has order <= 2, and since p does
not divide D its square is the class of a form (p^2, B, C). So the principal form represents p^2 with coprime x, y:
4 p^2 = X^2 + |D| y^2 with y != 0 (y = 0 would force x = +-1 and p = 1).

**Steps** (n idoneal, D = -4n = -q f^2 with -q fundamental).

1. If 4n >= 20000: Theorem 1.4 with the kernel of Kronecker(-4n, .) (index 2) gives a prime p in that kernel with
   p <= 10^9 or p <= (log 4n + 9 + 2.5 (log log 4n)^2)^2. By Lemma A, n <= p^2, so n <= 10^18.
2. The field of discriminant -q has exponent <= 2 too, so class number 2^(k-1). Corollary 1.3 gives class number
   >= 2843 at q = 10^10, increasing, and above 2^(k-1) for every q >= 10^10 with k prime factors
   (`check_steps.py`). So q < 10^10.
3. `exp2.c` finds every discriminant -q, q < 10^10, with exponent <= 2: Lemma A as a sieve, then an exact test on the
   survivors (every reduced primitive form must be ambiguous). Output `exp2-output.txt`: 101 discriminants, the
   largest -7392; 65 fundamental (largest -5460); 65 of the form -4n, which are Euler's 65.
4. For 2.5 * 10^9 <= n <= 10^18: q is one of the 65 fundamental values and f <= sqrt(4 * 10^18 / 3) < 1.2 * 10^9. By
   Lemma A every prime p < 50000 with Kronecker(-q, p) = +1 must divide f. For each of the 65 values the product of
   such primes below 200 exceeds 10^21 (`check_steps.py`). Contradiction.

**Run.**

    gcc -O2 -o exp2 exp2.c && ./exp2 0 10000000000 > exp2-output.txt     # about 90 processor-seconds
    python3 check_steps.py                                               # Steps 1, 2 and 4, numerically
    gcc -O2 -o euler euler.c && ./euler 2000000                          # independent: Euler's ab + bc + ca rule

`euler.c` is a cross-check that shares nothing with `exp2.c`: it also finds exactly the 65 below two million.

**Not checked here.** The proofs of the two theorems of the 2015 paper, the Lean library, and the quoted facts on
quadratic forms. Weinberger's 1973 proof (at most two more idoneal numbers; none under GRH) goes a different way.
