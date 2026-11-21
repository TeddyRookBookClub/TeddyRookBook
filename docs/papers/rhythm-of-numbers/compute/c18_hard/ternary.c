// Ramanujan's form x^2 + y^2 + 10 z^2: the odd numbers up to N that it does not represent.
// Ono and Soundararajan (1997) proved, assuming the Riemann hypothesis for Dirichlet L-functions and for the L-functions
// of a family of elliptic curves, that there are exactly eighteen (the largest is 2719).  This is a direct search; it
// proves nothing beyond N.  (W. Galway had checked far beyond this range before.)
// Method: a bit map of the sums of two squares up to N; then n is represented iff n - 10 z^2 is a sum of two squares
// for some z >= 0.   Usage: ./ternary N      (memory N/8 bytes; N = 2,000,000,000 takes about a minute)
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef unsigned long long u64;
int main(int argc, char **argv) {
  u64 N = strtoull(argv[1], 0, 10); unsigned char *S = calloc(N / 8 + 2, 1); if (!S) { puts("no memory"); return 1; }
  for (u64 x = 0; x * x <= N; x++) for (u64 y = x, s; (s = x * x + y * y) <= N; y++) S[s >> 3] |= 1 << (s & 7);
  u64 count = 0, checked = 0;
  for (u64 n = 1; n <= N; n += 2) { int ok = 0; checked++;
    for (u64 z = 0, t; (t = 10 * z * z) <= n; z++) { u64 m = n - t; if (S[m >> 3] >> (m & 7) & 1) { ok = 1; break; } }
    if (!ok) { printf("%llu ", n); count++; } }
  printf("\n%llu odd numbers up to %llu checked; %llu are not represented\n", checked, N, count); return 0; }
