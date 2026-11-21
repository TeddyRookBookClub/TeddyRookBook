// Negative discriminants -q, LO <= q < HI, for which the Kronecker symbol (-q/p) equals SIGN for a long run of the
// first primes p = 2, 3, 5, ...  (SIGN = -1: the worst case for a lower bound on L(1, chi); +1: for an upper bound).
// Prints q and the length of the run when the run has at least MIN primes.   Usage: ./runs LO HI SIGN MIN
#include <stdio.h>
#include <stdlib.h>
typedef unsigned long long u64;
static const int P[] = {3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151};
#define NP (int)(sizeof P / sizeof P[0])
static signed char K[NP][160];
int main(int argc, char **argv) {
  u64 lo = strtoull(argv[1], 0, 10), hi = strtoull(argv[2], 0, 10); int sign = atoi(argv[3]), min = atoi(argv[4]);
  for (int i = 0; i < NP; i++) { int p = P[i]; for (int r = 0; r < p; r++) { int t = (p - r) % p, s = (r == 0) ? 0 : -1; for (int x = 1; x < p; x++) if ((x * x) % p == t) s = 1; K[i][r] = s; } }
  int want8 = sign > 0 ? 7 : 3;                       // (-q/2) = +1 iff q = 7 mod 8, -1 iff q = 3 mod 8
  u64 q = lo; while ((q & 7) != (u64)want8) q++;
  for (; q < hi; q += 8) { int i = 0; while (i < NP && K[i][q % P[i]] == sign) i++; if (i + 1 >= min) printf("%llu %d\n", q, i + 1); }
  return 0;
}
