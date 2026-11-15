// Watching the continued fraction of sqrt(N) for a perfect square.
// With complete quotients (P_i + sqrt N)/Q_i and convergents p_i/q_i:  p_{i-1}^2 - N q_{i-1}^2 = (-1)^i Q_i.
// So at an even step where Q_i = s^2,  p_{i-1}^2 = s^2 (mod N)  and  gcd(p_{i-1} - s, N)  is often a proper factor.
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
typedef unsigned long long u64; typedef unsigned __int128 u128;
static u64 gcd(u64 a, u64 b) { while (b) { u64 t = a % b; a = b; b = t; } return a; }
static int isprime(u64 n) { if (n < 2) return 0; for (u64 i = 2; i * i <= n; i++) if (n % i == 0) return 0; return 1; }
static u64 isqrt(u64 n) { u64 r = (u64)sqrtl((long double)n); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; }
static int cmp(const void *a, const void *b) { double x = *(double *)a, y = *(double *)b; return (x > y) - (x < y); }
int main(void) {
  srand(12345); int T = 2000, found = 0, n_mid = 0; double *ratio = malloc(T * sizeof(double)), *mid = malloc(T * sizeof(double)); double sum4 = 0;
  for (int t = 0; t < T; t++) {
    u64 p, q; do { p = 1000000 + rand() % 2000000; } while (!isprime(p)); do { q = 1000000 + rand() % 2000000; } while (!isprime(q) || q == p);
    u64 N = p * q, a0 = isqrt(N), P = 0, Q = 1, a = a0, x0 = 1, x1 = a0 % N; u64 hit = 0, midstep = 0;
    for (u64 i = 1; i < 400000000ULL; i++) {
      u64 Pn = a * Q - P, Qn = (N - Pn * Pn) / Q;
      if (!midstep && (Pn == P && i > 1 || Qn == Q)) midstep = i;                 // middle of the period
      P = Pn; Q = Qn; a = (a0 + P) / Q;                                            // now P_i, Q_i, a_i ; x1 = p_{i-1}
      if (!hit && i % 2 == 0) { u64 s = isqrt(Q); if (s * s == Q && s > 1) { u64 g = gcd((x1 + N - s % N) % N, N); if (g > 1 && g < N) hit = i; } }
      u64 x2 = (u64)(((u128)a * x1 + x0) % N); x0 = x1; x1 = x2;
      if (hit && midstep) break;
    }
    double r4 = pow((double)N, 0.25); sum4 += r4;
    if (hit) { ratio[found] = hit / r4; found++; }
    if (midstep) { mid[n_mid++] = midstep / sqrt((double)N); }
  }
  qsort(ratio, found, sizeof(double), cmp); qsort(mid, n_mid, sizeof(double), cmp);
  printf("%d random products of two primes between 1 and 3 million (N about 10^12 to 10^13; mean fourth root %.0f)\n", T, sum4 / T);
  printf("factor found from a square: %d of %d\n", found, T);
  printf("steps to the first useful square, divided by N^(1/4): median %.2f, 90th percentile %.2f, largest %.2f\n", ratio[found / 2], ratio[(int)(0.9 * found)], ratio[found - 1]);
  printf("steps to the middle of the period, divided by sqrt(N): median %.3f (%d measured)\n", mid[n_mid / 2], n_mid);
  return 0;
}
