// Continued fraction of sqrt(N) for every non-square N <= LIMIT, run only to the middle of its period.
// Complete quotients are (P_i + sqrt N)/Q_i.  The middle is the first i >= 1 with P_{i+1} = P_i (even period 2i)
// or the first i >= 0 with Q_{i+1} = Q_i (odd period 2i+1).
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
typedef unsigned long long u64;
int main(int argc, char **argv) {
  u64 LIMIT = argc > 1 ? strtoull(argv[1], 0, 10) : 1000000ULL;
  char *comp = calloc(LIMIT + 1, 1);
  for (u64 i = 2; i * i <= LIMIT; i++) if (!comp[i]) for (u64 j = i * i; j <= LIMIT; j += i) comp[j] = 1;
  // tallies
  u64 pr1 = 0, pr1_odd = 0, pr3 = 0, pr3_q2 = 0, k4[8][4] = {{0}};
  u64 even_n = 0, even_div = 0, odd_n = 0, odd_twosq = 0;
  u64 oc = 0, oc_factor = 0, oc_oddper = 0, oc_q2 = 0, oc_other = 0, oc_sig = 0;   // odd composite non-squares
  double sumratio_p = 0, maxratio = 0; u64 maxN = 0, np = 0; double sumsteps = 0;
  u64 firsts[40]; int nf = 0;
  u64 semi = 0, semi_factor = 0;
  for (u64 N = 2; N <= LIMIT; N++) {
    u64 a0 = (u64)sqrtl((long double)N); while (a0 * a0 > N) a0--; while ((a0 + 1) * (a0 + 1) <= N) a0++;
    if (a0 * a0 == N) continue;
    u64 P = 0, Q = 1, a = a0, i = 0, k, Qmid = 0, Pn, Qn; int odd;
    for (;;) {
      Pn = a * Q - P;
      if (i >= 1 && Pn == P) { odd = 0; k = 2 * i; Qmid = Q; break; }
      Qn = (N - Pn * Pn) / Q;
      if (Qn == Q) { odd = 1; k = 2 * i + 1; Qmid = Q; if (Pn * Pn + Q * Q == N) odd_twosq++; break; }
      P = Pn; Q = Qn; a = (a0 + P) / Q; i++;
    }
    sumsteps += i + 1;
    if (odd) odd_n++; else { even_n++; if ((2 * N) % Qmid == 0) even_div++; }
    int prime = !comp[N];
    if (prime) {
      np++; double r = k / sqrt((double)N); sumratio_p += r; if (r > maxratio) { maxratio = r; maxN = N; }
      if (N % 4 == 1) { pr1++; pr1_odd += odd; }
      if (N % 4 == 3) { pr3++; if (!odd && Qmid == 2) pr3_q2++; }
      if (N > 2) k4[N % 8][k % 4]++;
    } else if (N % 2 == 1) {
      oc++;
      int sig = 0;
      if (odd) { oc_oddper++; if (N % 4 == 1) sig = 1; }
      else if (Qmid == 2) { oc_q2++; if ((N % 8 == 7 && k % 4 == 0) || (N % 8 == 3 && k % 4 == 2)) sig = 1; }
      else { u64 g = Qmid % 2 == 0 ? Qmid / 2 : Qmid; if (N % Qmid == 0 || (Qmid % 2 == 0 && N % g == 0)) { if (g > 1 && g < N) oc_factor++; else oc_other++; } else oc_other++; }
      if (sig) { oc_sig++; if (nf < 40) firsts[nf++] = N; }
    }
  }
  printf("LIMIT %llu\n", LIMIT);
  printf("even period: %llu numbers; middle Q divides 2N in %llu of them\n", even_n, even_div);
  printf("odd period: %llu numbers; N = P^2 + Q^2 at the middle in %llu of them\n", odd_n, odd_twosq);
  printf("primes 1 mod 4: %llu; odd period: %llu\n", pr1, pr1_odd);
  printf("primes 3 mod 4: %llu; even period with middle Q = 2: %llu\n", pr3, pr3_q2);
  for (int r = 1; r < 8; r += 2) printf("  primes %d mod 8: period mod 4 = 0,1,2,3 : %llu %llu %llu %llu\n", r, k4[r][0], k4[r][1], k4[r][2], k4[r][3]);
  printf("odd composite non-squares: %llu; middle shows a proper factor: %llu; odd period: %llu; middle Q = 2: %llu; other: %llu\n", oc, oc_factor, oc_oddper, oc_q2, oc_other);
  printf("odd composites with the full signature of a prime: %llu (%.3f%% of odd composites; primes in range: %llu)\n", oc_sig, 100.0 * oc_sig / oc, np);
  printf("first ones:"); for (int j = 0; j < nf; j++) printf(" %llu", firsts[j]); printf("\n");
  printf("primes: mean period / sqrt(p) = %.4f; largest %.4f at p = %llu\n", sumratio_p / np, maxratio, maxN);
  printf("mean steps to the middle, all N: %.1f; sqrt(LIMIT) = %.1f\n", sumsteps / (even_n + odd_n), sqrt((double)LIMIT));
  return 0;
}
