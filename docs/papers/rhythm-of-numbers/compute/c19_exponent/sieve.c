/* sieve.c -- every negative fundamental discriminant D = -n with n <= L whose least split
   prime l satisfies 4*l^5 >= n.  A field whose class group has exponent E <= 5 must pass:
   a split prime p gives an ideal of norm p whose E-th power is principal, so p^E >= n/4
   (Boyd and Kisilevsky 1972, Lemma 1).  No hypothesis is used here.
   usage: sieve LO HI   (prints "n l" per survivor)                                        */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#define M 255255                 /* 3*5*7*11*13*17 */
static int pr[64], np; static unsigned char qr[200][200]; static unsigned char wheel[M];
static int split(uint64_t n, int q){ int r = (int)(n % q); if(!r) return 0; return qr[q][(q - r) % q]; } /* (-n/q)=1 ? */
static int sqfree(uint64_t m){ for(uint64_t d = 2; d * d <= m; d++){ if(m % (d*d) == 0) return 0; if(m % d == 0){ m /= d; } } return 1; }
int main(int argc, char **argv){
  uint64_t lo = strtoull(argv[1],0,10), hi = strtoull(argv[2],0,10);
  for(int q = 3; q < 200; q += 2){ int ok = 1; for(int d = 3; d*d <= q; d += 2) if(q % d == 0) ok = 0; if(ok) pr[np++] = q; }
  for(int i = 0; i < np; i++){ int q = pr[i]; for(int a = 1; a < q; a++) qr[q][(a*a) % q] = 1; }
  for(int r = 0; r < M; r++){ int ok = 1; for(int i = 0; i < 6 && ok; i++) if(split(r, pr[i])) ok = 0; wheel[r] = ok; }
  const uint64_t W = 4ULL*17*17*17*17*17;
  uint32_t r = lo % M;
  for(uint64_t n = lo; n <= hi; n++, r = (r + 1 == M ? 0 : r + 1)){
    int a = n & 15;
    if(!((n & 7) == 3 || a == 4 || a == 8)){ if((n & 7) == 7 && n <= 128 ){ if(sqfree(n)) printf("%llu 2\n",(unsigned long long)n); } continue; }
    if(n > W && !wheel[r]) continue;
    int l = 0;
    for(int i = 0; i < np; i++){ int q = pr[i]; if(split(n, q)){ l = q; break; } }
    if(l){ uint64_t b = 4ULL*l*l*l*l*l; if(b < n) continue; }
    else { fprintf(stderr,"no split prime below 200 for n=%llu\n",(unsigned long long)n); l = 999; }
    uint64_t m = (n & 3) ? n : n / 4; if(!sqfree(m)) continue;
    printf("%llu %d\n", (unsigned long long)n, l);
  }
  return 0;
}
