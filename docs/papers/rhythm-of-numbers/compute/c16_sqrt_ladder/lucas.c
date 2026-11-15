// The golden ladder read modulo n: is F_{n -(5|n)} = 0 (mod n)?   And the base-2 Fermat test 2^(n-1) = 1 (mod n).
#include <stdio.h>
#include <stdlib.h>
typedef unsigned long long u64; typedef unsigned __int128 u128;
static inline u64 mm(u64 a, u64 b, u64 n) { return (u64)((u128)a * b % n); }
static void fib(u64 k, u64 n, u64 *f, u64 *g) {            // (F_k, F_{k+1}) mod n by doubling
  u64 a = 0, b = 1 % n;
  for (int i = 63; i >= 0; i--) {
    u64 t = (2 * (u128)b + n - a) % n; u64 c = mm(a, t, n);            // F_2m = F_m (2F_{m+1} - F_m)
    u64 d = (mm(a, a, n) + mm(b, b, n)) % n;                              // F_2m+1 = F_m^2 + F_{m+1}^2
    a = c; b = d;
    if ((k >> i) & 1) { u64 s = (a + b) % n; a = b; b = s; }
  }
  *f = a; *g = b;
}
static u64 pw(u64 b, u64 e, u64 n) { u64 r = 1; b %= n; while (e) { if (e & 1) r = mm(r, b, n); b = mm(b, b, n); e >>= 1; } return r; }
int main(int argc, char **argv) {
  u64 LIMIT = argc > 1 ? strtoull(argv[1], 0, 10) : 1000000ULL;
  char *comp = calloc(LIMIT + 1, 1);
  for (u64 i = 2; i * i <= LIMIT; i++) if (!comp[i]) for (u64 j = i * i; j <= LIMIT; j += i) comp[j] = 1;
  u64 primes = 0, prime_fail = 0, fpsp = 0, psp2 = 0, both = 0, both_pm2 = 0, fpsp_pm2 = 0, psp2_pm2 = 0; u64 first[20]; int nf = 0; u64 bothl[12]; int nb = 0;
  for (u64 n = 3; n <= LIMIT; n += 2) {
    if (n % 5 == 0) continue;
    int r = n % 5, pm2 = (r == 2 || r == 3);
    u64 f, g; fib(pm2 ? n + 1 : n - 1, n, &f, &g);
    int passF = (f == 0), pass2 = (pw(2, n - 1, n) == 1);
    if (!comp[n]) { primes++; if (!passF || !pass2) prime_fail++; continue; }
    if (passF) { fpsp++; fpsp_pm2 += pm2; if (nf < 20) first[nf++] = n; }
    if (pass2) { psp2++; psp2_pm2 += pm2; }
    if (passF && pass2) { both++; if (nb < 12) bothl[nb++] = n; both_pm2 += pm2; }
  }
  printf("odd n up to %llu, not divisible by 5\n", LIMIT);
  printf("primes: %llu; primes failing either test: %llu\n", primes, prime_fail);
  printf("composites passing the golden-ladder test: %llu (of them n = +-2 mod 5: %llu); first:", fpsp, fpsp_pm2); for (int i = 0; i < nf; i++) printf(" %llu", first[i]); printf("\n");
  printf("composites passing the base-2 test: %llu (n = +-2 mod 5: %llu)\n", psp2, psp2_pm2);
  printf("composites passing both: %llu; first:", both); for (int i = 0; i < nb; i++) printf(" %llu", bothl[i]); printf("\n");
  printf("composites passing both with n = +-2 mod 5: %llu\n", both_pm2);
  return 0;
}
