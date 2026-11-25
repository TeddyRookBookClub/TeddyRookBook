# c19_exponent: imaginary quadratic fields whose class group has exponent at most 5

A second, independent search for the lists of Elsenhans, Klüners and Nicolae, "Imaginary quadratic number
fields with class groups of small exponent", Acta Arith. 193 (2020), arXiv:1803.02056. Their lists for
exponents 1 to 5 are complete under the Riemann Hypothesis for the zeta function of a quadratic field, which
is zeta(s) times one Dirichlet L-function of a real character. That is covered by the statements certified
in Lean on 21 November 2026.

Result: 9, 56, 17, 203 and 27 fundamental discriminants with exponent 1, 2, 3, 4, 5 (312 in all), the
largest being -163, -5460, -4027, -435435 and -37363. This agrees with the 2020 paper.

## The argument

1. (Boyd and Kisilevsky 1972, Lemma 1; no hypothesis.) If p splits in the field of discriminant -d and a
   prime above p has order dividing e, then 4 p^e = x^2 + d y^2 with y >= 1, so p^e >= d/4.
2. (Bach and Sorenson 1996, Theorem 5.1, as quoted in the 2020 paper; uses the hypothesis.) For d > e^25
   some split prime p satisfies p <= (1.881 ln d + 6.18)^2.
3. Together: exponent 3 forces d <= 9.66e10, exponent 4 forces d <= 3.39e15 (p <= 5393), exponent 5
   forces d <= 2.23e20 (p <= 8894).

## The programs

- `sieve.c`: every fundamental discriminant -d with d <= 10^11 whose least split prime l has 4 l^5 >= d.
  No hypothesis. 525,937 survivors. About 4.5 minutes on two cores.
- `prefilter.py`: drops the survivors in which the form of norm l has order above 5. 2,323 remain.
- `classify.gp` (PARI/GP): the exact exponent of each of the 2,323, as the least common multiple of the
  orders of the prime forms up to sqrt(d/3), which generate the class group. No hypothesis.
- `enum.c`: for d > 10^11. For each prime p up to the bound in step 3 and each x, every d = (4 p^e - x^2)/y^2
  above 10^11 in which no prime below p splits. Run with e = 4 and e = 5. Nothing is found.
- `enum.c` must be run with PLO of 17 or more (its wheel uses the primes 3 to 17). Its output is a superset: it does
  not test that d is square-free at odd primes, so anything it printed would need `classify.gp`.
- `expo-list.txt`: the 312 fields as "exponent d".
- `run-log.txt`: the commands and their output.

Not done here: exponent 8 (the 2020 paper's proof uses the 4-rank of the class group), and exponents 6 and
7, which are open (the same argument would need searches to 2.4e25 and 3.9e30). We have not read the proof
of the Bach and Sorenson bound. This has not been reviewed by a number theorist.
