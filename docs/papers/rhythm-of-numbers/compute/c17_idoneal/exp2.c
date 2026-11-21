// Every negative discriminant D = -q, q < LIMIT, whose form class group has exponent <= 2 (one class in each genus).
//
// Step 1 (sieve). Lemma A: if the class group of discriminant -q has exponent <= 2 and p is a prime with p not dividing q
// and Kronecker(-q, p) = +1, then q <= 4 p^2.  So q is thrown out as soon as a prime p with Kronecker(-q,p) = +1 and
// 4 p^2 < q is found.  Step 2 (exact). Each survivor is tested exactly: every reduced primitive form (a, b, c) of
// discriminant -q must be ambiguous (b = 0, or |b| = a, or a = c).
//
// Usage: ./exp2 LO HI   (q in [LO, HI), q = 0 or 3 mod 4).  Prints one line per discriminant found: q, class number,
// "F" if -q is a fundamental discriminant, and n = q/4 when 4 | q (then n is one of Euler's idoneal numbers).
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
typedef unsigned long long u64;
static const int P[] = {3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293};
#define NP (int)(sizeof P / sizeof P[0])
static unsigned char QR[NP][300];          // QR[i][r] = 1 if r != 0 and -r is a nonzero square mod P[i]
static u64 gcd(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }
// exact test; returns class number if exponent <= 2, else 0
static long exact(u64 q) {
  long h = 0;
  // reduced forms: |b| <= a <= c, b^2 + q = 4ac, b = q mod 2; count (a,b,c) and (a,-b,c) separately unless ambiguous
  for (u64 b = q & 1; 3 * b * b <= q; b += 2) {
    u64 m = (b * b + q) / 4;                 // m = a c
    for (u64 a = (b > 1 ? b : 1); a * a <= m; a++) {
      if (m % a) continue; u64 c = m / a;
      if (gcd(gcd(a, b), c) != 1) continue;
      if (b == 0 || b == a || a == c) h++; else return 0;   // a non-ambiguous reduced form: an element of order > 2
    }
  }
  return h;
}
static int fundamental(u64 q) {              // is -q a fundamental discriminant?
  u64 m = q; if (q % 4 == 0) { m = q / 4; if (m % 4 == 3 || m % 4 == 0) return 0; } else if (q % 4 != 3) return 0;
  for (u64 p = (q % 4 == 0 ? 3 : 2); p * p <= m; p++) if (m % (p * p) == 0) return 0;
  return 1;
}
int main(int argc, char **argv) {
  u64 lo = strtoull(argv[1], 0, 10), hi = strtoull(argv[2], 0, 10);
  for (int i = 0; i < NP; i++) { int p = P[i]; for (int r = 1; r < p; r++) { int t = (p - r) % p, s = 0; for (int x = 1; x < p; x++) if ((x * x) % p == t) s = 1; QR[i][r] = s; } }
  for (u64 q = lo < 3 ? 3 : lo; q < hi; q++) {
    int m4 = q & 3; if (m4 != 0 && m4 != 3) continue;
    if ((q & 7) == 7 && q > 16) continue;                    // Kronecker(-q, 2) = +1 and 4 * 2^2 < q
    int dead = 0;
    for (int i = 0; i < NP; i++) { u64 p = P[i]; if (4 * p * p >= q) break; if (QR[i][q % p]) { dead = 1; break; } }
    if (dead) continue;
    long h = exact(q);
    if (h) { printf("%llu h=%ld %s", q, h, fundamental(q) ? "F" : "-"); if (m4 == 0) printf(" n=%llu", q / 4); printf("\n"); fflush(stdout); }
  }
  return 0;
}
