// Primes p = 1 mod 4: the period k of sqrt(p), the middle (p = a^2 + b^2), the least solution T^2 - p U^2 = -1.
// s = (-1)^((k-1)/2).  Checks:  T = s a/b (mod p);  for p = 5 mod 8:  s = (-1)^((T-a)/4) (-2/b);  for p = 1 mod 8: (-1)^((T-a)/4) = (2/b).
// Then, for p = 1 mod 8, looks for two primes that agree in p, T, U, a, b modulo 2^j but have different s.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
typedef unsigned long long u64; typedef unsigned __int128 u128;
typedef struct { u64 key[5]; u64 p; int s; } rec;
static int J;
static int cmp(const void *x, const void *y) { const rec *a = x, *b = y; for (int i = 0; i < 5; i++) { u64 u = a->key[i] & ((1ULL << J) - 1), v = b->key[i] & ((1ULL << J) - 1); if (u != v) return u < v ? -1 : 1; } return 0; }
static u64 inv(u64 a, u64 p) { long long t = 0, nt = 1, r = p, nr = a % p; while (nr) { long long q = r / nr, x = t - q * nt; t = nt; nt = x; x = r - q * nr; r = nr; nr = x; } return t < 0 ? t + p : t; }
int main(int argc, char **argv) {
  u64 LIMIT = argc > 1 ? strtoull(argv[1], 0, 10) : 1000000ULL;
  char *comp = calloc(LIMIT + 1, 1);
  for (u64 i = 2; i * i <= LIMIT; i++) if (!comp[i]) for (u64 j = i * i; j <= LIMIT; j += i) comp[j] = 1;
  u64 n1 = 0, n5 = 0, ok_modp = 0, ok5 = 0, ok1 = 0, aeven = 0, u14 = 0, plus = 0, tot = 0; rec *R = malloc(sizeof(rec) * (LIMIT / 30 + 1000)); u64 nr = 0;
  for (u64 p = 5; p <= LIMIT; p += 4) {
    if (comp[p]) continue;
    u64 a0 = (u64)sqrtl((long double)p); while (a0 * a0 > p) a0--; while ((a0 + 1) * (a0 + 1) <= p) a0++;
    u64 P = 0, Q = 1, a = a0, x0 = 1, x1 = a0, y0 = 0, y1 = 1, m0 = 1, m1 = a0 % p, i = 0, mi = 0, ma = 0, mb = 0; int have = 0;
    for (;;) {
      u64 Pn = a * Q - P, Qn = (p - Pn * Pn) / Q;
      if (!have && Qn == Q) { have = 1; mi = i; ma = Pn; mb = Q; }
      P = Pn; Q = Qn; i++;
      if (Q == 1) break;
      a = (a0 + P) / Q;
      u64 t = a * x1 + x0; x0 = x1; x1 = t; t = a * y1 + y0; y0 = y1; y1 = t;          // modulo 2^64
      t = (u64)(((u128)a * m1 + m0) % p); m0 = m1; m1 = t;                                // modulo p
    }
    u64 k = i, T = x1, U = y1, Tp = m1; int s = (mi % 2 == 0) ? 1 : -1;                   // k = 2 mi + 1
    if (k != 2 * mi + 1 || ma * ma + mb * mb != p) { printf("structure fails at %llu\n", p); return 1; }
    tot++; if (s == 1) plus++;
    if (ma % 2 == 0 && mb % 2 == 1) aeven++;
    if (U % 4 == 1) u14++;
    u64 ab = (u64)((u128)(ma % p) * inv(mb, p) % p); if (Tp == (s == 1 ? ab : (p - ab) % p)) ok_modp++;
    long long e4 = (long long)((T - ma) & 7ULL);                                         // T - a modulo 8
    int sign4 = (e4 == 0) ? 1 : (e4 == 4 ? -1 : 0);
    int bm = mb % 8;
    if (p % 8 == 5) { n5++; int chi = (bm == 1 || bm == 3) ? 1 : -1; if (sign4 * chi == s) ok5++; }
    else { n1++; int chi = (bm == 1 || bm == 7) ? 1 : -1; if (sign4 == chi) ok1++;
      R[nr].key[0] = p; R[nr].key[1] = T; R[nr].key[2] = U; R[nr].key[3] = ma; R[nr].key[4] = mb; R[nr].p = p; R[nr].s = s; nr++; }
  }
  printf("primes = 1 mod 4 up to %llu: %llu; period = 1 mod 4 for %llu, = 3 mod 4 for %llu\n", LIMIT, tot, plus, tot - plus);
  printf("a even and b odd: %llu; U = 1 mod 4: %llu; T = s a/b (mod p): %llu\n", aeven, u14, ok_modp);
  printf("p = 5 mod 8: %llu primes; rule s = (-1)^((T-a)/4) (-2/b) holds for %llu\n", n5, ok5);
  printf("p = 1 mod 8: %llu primes; (-1)^((T-a)/4) = (2/b) holds for %llu\n", n1, ok1);
  for (J = 3; J <= 9; J++) {
    qsort(R, nr, sizeof(rec), cmp); u64 classes = 0, mixed = 0, ex1 = 0, ex2 = 0;
    for (u64 i = 0; i < nr;) { u64 j = i; int pl = 0, mn = 0; u64 e1 = 0, e2 = 0; while (j < nr && cmp(&R[i], &R[j]) == 0) { if (R[j].s == 1) { pl++; if (!e1 || R[j].p < e1) e1 = R[j].p; } else { mn++; if (!e2 || R[j].p < e2) e2 = R[j].p; } j++; }
      classes++; if (pl && mn) { mixed++; if (!ex1 || (e1 > e2 ? e1 : e2) < (ex1 > ex2 ? ex1 : ex2)) { ex1 = e1; ex2 = e2; } } i = j; }
    printf("  p = 1 mod 8, residues of (p, T, U, a, b) modulo %d: %llu classes occur, %llu contain both signs", 1 << J, classes, mixed);
    if (mixed) printf("; e.g. p = %llu (period 1 mod 4) and p = %llu (period 3 mod 4)", ex1, ex2); printf("\n");
  }
  return 0;
}
