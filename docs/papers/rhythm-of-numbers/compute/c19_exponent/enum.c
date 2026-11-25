/* enum.c -- discriminants above L whose class group could have exponent e (e = 4 or 5).
   If p is the least split prime of D = -n and the class group has exponent e, the e-th power of a
   prime ideal above p is principal and is not rational, so 4p^e = x^2 + n y^2 with y >= 1.
   For every prime p in (PLO, PHI] and every x we take N = 4p^e - x^2 and every y with y^2 | N and
   N/y^2 > L, and keep n = N/y^2 when no prime below p splits in Q(sqrt(-n)).
   A prime q not dividing N cannot divide y, so then (-N/q) = (-n/q): that test needs no factoring
   and removes almost every x; a wheel on x modulo 3*5*7*11*13*17 does the first six primes.
   usage: enum E PLO PHI L   (prints "p x y n")                                              */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <math.h>
typedef unsigned __int128 u128;
#define M 255255
#define PMAX 20000
static int pr[3000], np; static unsigned char *qr[PMAX];
static uint64_t mp(uint64_t a, uint64_t e, uint64_t m){ uint64_t r = 1; a %= m; while(e){ if(e & 1) r = r*a % m; a = a*a % m; e >>= 1; } return r; }
static void p128(u128 v){ char b[50]; int i = 49; b[i] = 0; if(!v) b[--i] = '0'; while(v){ b[--i] = '0' + (int)(v % 10); v /= 10; } fputs(b + i, stdout); }
int main(int argc, char **argv){
  int e = atoi(argv[1]); int plo = atoi(argv[2]), phi = atoi(argv[3]); u128 L = (u128)strtoull(argv[4],0,10);
  for(int q = 3; q < PMAX; q += 2){ int ok = 1; for(int d = 3; d*d <= q; d += 2) if(q % d == 0){ ok = 0; break; } if(ok) pr[np++] = q; }
  for(int i = 0; i < np; i++){ int q = pr[i]; qr[q] = calloc(q, 1); for(long a = 1; a < q; a++) qr[q][(a*a) % q] = 1; }
  static int allowed[M]; static unsigned char okq[64][256]; uint64_t tested = 0, kept = 0;
  for(int ip = 0; ip < np; ip++){ int p = pr[ip]; if(p <= plo) continue; if(p > phi) break;
    u128 c = 4; for(int k = 0; k < e; k++) c *= p; if(c <= L) continue;
    /* per-prime tables: okq[i][r]=1 when x = r (mod q) is allowed, q = pr[i] */
    int nq = 0; while(nq < 60 && pr[nq] < p && pr[nq] < 256) nq++;
    for(int i = 0; i < nq; i++){ int q = pr[i]; int cq = (int)(c % q);
      for(int r = 0; r < q; r++){ int t = ((cq - r*r) % q + q) % q; okq[i][r] = (t == 0) || !qr[q][(q - t) % q]; } }
    int na = 0; for(int r = 0; r < M; r++){ int ok = 1; for(int i = 0; i < 6 && ok; i++) ok = okq[i][r % pr[i]]; if(ok) allowed[na++] = r; }
    uint64_t X = (uint64_t)sqrtl((long double)c); while((u128)X*X >= c) X--; while((u128)(X+1)*(X+1) < c) X++;
    for(uint64_t base = 0; base <= X; base += M){
      for(int j = 0; j < na; j++){ uint64_t x = base + allowed[j]; if(x > X) break; tested++;
        int ok = 1; for(int i = 6; i < nq; i++){ if(!okq[i][x % pr[i]]){ ok = 0; break; } }
        if(!ok) continue;
        u128 N = c - (u128)x*x;
        for(int i = nq; i < np && pr[i] < p && ok; i++){ int q = pr[i]; int t = (int)(N % q); if(t && qr[q][q - t]) ok = 0; }
        if(!ok) continue;
        for(uint64_t y = 1; (u128)y*y*L < N; y++){ if(N % ((u128)y*y)) continue; u128 n = N / ((u128)y*y);
          int a = (int)(n & 15); if(!((n & 7) == 3 || a == 4 || a == 8)) continue;       /* fundamental at 2, and 2 not split */
          int good = 1; for(int i = 0; i < np && pr[i] < p; i++){ int q = pr[i]; int t = (int)(n % q); if(t && qr[q][q - t]){ good = 0; break; } }
          if(!good) continue; kept++;
          printf("%d %llu %llu ", p, (unsigned long long)x, (unsigned long long)y); p128(n); printf("\n"); fflush(stdout);
        }
      }
    }
  }
  fprintf(stderr, "e=%d primes (%d,%d]: x values past the wheel %llu, kept %llu\n", e, plo, phi, (unsigned long long)tested, (unsigned long long)kept);
  return 0;
}
