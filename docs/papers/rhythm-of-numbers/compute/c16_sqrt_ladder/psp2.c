// Count the base-2 pseudoprimes (composite n with 2^(n-1) = 1 mod n) up to LIMIT, with and without the multiples of 5.
// Cross-check against Table 1 of Pomerance, Selfridge & Wagstaff (1980): 3, 22, 78, 245, 750, 2057 up to 10^3 ... 10^8.
#include <stdio.h>
#include <stdlib.h>
typedef unsigned long long u64; typedef unsigned __int128 u128;
static u64 pw(u64 b, u64 e, u64 n) { u64 r = 1; b %= n; while (e) { if (e & 1) r = (u64)((u128)r * b % n); b = (u64)((u128)b * b % n); e >>= 1; } return r; }
int main(int argc, char **argv) {
  u64 LIMIT = argc > 1 ? strtoull(argv[1], 0, 10) : 1000000ULL;
  char *comp = calloc(LIMIT + 1, 1);
  for (u64 i = 2; i * i <= LIMIT; i++) if (!comp[i]) for (u64 j = i * i; j <= LIMIT; j += i) comp[j] = 1;
  u64 all = 0, no5 = 0, next = 1000;
  for (u64 n = 3; n <= LIMIT; n += 2) {
    if (comp[n] && pw(2, n - 1, n) == 1) { all++; if (n % 5) no5++; }
    if (n + 1 == next || n == next) { printf("up to %llu: %llu base-2 pseudoprimes, %llu of them not divisible by 5\n", next, all, no5); next *= 10; }
  }
  return 0;
}
