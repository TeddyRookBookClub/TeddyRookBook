// The expensive part of checking one ECPP step, with GMP.
// Input lines:  i N a x y S R  (decimal i, the rest hex).  Curve y^2 = x^3 + a x + b mod N (b is not needed), point P = (x, y).
// Checks:  P2 = [S]P has Z coprime to N   and   [R]P2 is the point at infinity (Z = 0 mod N).
// Output per line:  i 1|0 seconds.   Stops reading when the time budget (argv[1], seconds) is used up.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <gmp.h>
typedef struct { mpz_t X, Y, Z; } pt;
static mpz_t n, a, t1, t2, t3, t4, t5, t6, t7;
static void pinit(pt *p) { mpz_inits(p->X, p->Y, p->Z, NULL); }
static void pset(pt *r, const pt *p) { mpz_set(r->X, p->X); mpz_set(r->Y, p->Y); mpz_set(r->Z, p->Z); }
static void pinf(pt *r) { mpz_set_ui(r->X, 1); mpz_set_ui(r->Y, 1); mpz_set_ui(r->Z, 0); }
#define MM(r, x, y) do { mpz_mul(r, x, y); mpz_mod(r, r, n); } while (0)
static void dbl(pt *r, const pt *p) {
  if (mpz_sgn(p->Z) == 0 || mpz_sgn(p->Y) == 0) { pinf(r); return; }
  MM(t1, p->Y, p->Y);                      // YY
  MM(t2, p->X, t1); mpz_mul_2exp(t2, t2, 2); mpz_mod(t2, t2, n);   // S = 4 X YY
  MM(t3, p->Z, p->Z);                      // ZZ
  MM(t4, t3, t3); MM(t4, t4, a);           // a ZZ^2
  MM(t5, p->X, p->X); mpz_mul_ui(t5, t5, 3); mpz_add(t5, t5, t4); mpz_mod(t5, t5, n);   // M
  MM(t6, p->Y, p->Z); mpz_mul_2exp(t6, t6, 1); mpz_mod(t6, t6, n); // Z3
  MM(t7, t5, t5); mpz_submul_ui(t7, t2, 2); mpz_mod(t7, t7, n);    // X3
  mpz_sub(t2, t2, t7); MM(t2, t2, t5); MM(t1, t1, t1); mpz_submul_ui(t2, t1, 8); mpz_mod(t2, t2, n);   // Y3
  mpz_set(r->X, t7); mpz_set(r->Y, t2); mpz_set(r->Z, t6);
}
static mpz_t u1, u2, s1, s2, h, rr, z1z1, z2z2, hh, hhh, v;
static void add(pt *r, const pt *p, const pt *q) {
  if (mpz_sgn(p->Z) == 0) { pset(r, q); return; }
  if (mpz_sgn(q->Z) == 0) { pset(r, p); return; }
  MM(z1z1, p->Z, p->Z); MM(z2z2, q->Z, q->Z);
  MM(u1, p->X, z2z2); MM(u2, q->X, z1z1);
  MM(s1, p->Y, q->Z); MM(s1, s1, z2z2); MM(s2, q->Y, p->Z); MM(s2, s2, z1z1);
  mpz_sub(h, u2, u1); mpz_mod(h, h, n); mpz_sub(rr, s2, s1); mpz_mod(rr, rr, n);
  if (mpz_sgn(h) == 0) { if (mpz_sgn(rr) == 0) dbl(r, p); else pinf(r); return; }
  MM(hh, h, h); MM(hhh, h, hh); MM(v, u1, hh);
  MM(t1, p->Z, q->Z); MM(t1, t1, h);                       // Z3
  MM(t2, rr, rr); mpz_sub(t2, t2, hhh); mpz_submul_ui(t2, v, 2); mpz_mod(t2, t2, n);   // X3
  mpz_sub(t3, v, t2); MM(t3, t3, rr); MM(t4, s1, hhh); mpz_sub(t3, t3, t4); mpz_mod(t3, t3, n);   // Y3
  mpz_set(r->X, t2); mpz_set(r->Y, t3); mpz_set(r->Z, t1);
}
static void neg(pt *r, const pt *p) { mpz_set(r->X, p->X); mpz_sub(r->Y, n, p->Y); mpz_mod(r->Y, r->Y, n); mpz_set(r->Z, p->Z); }
static void mul(pt *r, const mpz_t k, const pt *p) {         // width-5 NAF
  static pt tab[8], p2, acc, tmp; static int init = 0;
  if (!init) { for (int i = 0; i < 8; i++) pinit(&tab[i]); pinit(&p2); pinit(&acc); pinit(&tmp); init = 1; }
  pset(&tab[0], p); dbl(&p2, p); for (int i = 1; i < 8; i++) add(&tab[i], &tab[i - 1], &p2);   // 1P, 3P, ..., 15P
  size_t bits = mpz_sizeinbase(k, 2); signed char *naf = calloc(bits + 2, 1); size_t len = 0; mpz_t kk; mpz_init_set(kk, k);
  while (mpz_sgn(kk) > 0) {
    int d = 0;
    if (mpz_odd_p(kk)) { d = (int)(mpz_get_ui(kk) & 31); if (d >= 16) d -= 32; if (d >= 0) mpz_sub_ui(kk, kk, d); else mpz_add_ui(kk, kk, -d); }
    naf[len++] = (signed char)d; mpz_fdiv_q_2exp(kk, kk, 1);
  }
  pinf(&acc);
  for (long i = (long)len - 1; i >= 0; i--) {
    dbl(&acc, &acc);
    if (naf[i] > 0) add(&acc, &acc, &tab[(naf[i] - 1) / 2]);
    else if (naf[i] < 0) { neg(&tmp, &tab[(-naf[i] - 1) / 2]); add(&acc, &acc, &tmp); }
  }
  pset(r, &acc); free(naf); mpz_clear(kk);
}
int main(int argc, char **argv) {
  double budget = argc > 1 ? atof(argv[1]) : 1e18; time_t start = time(0);
  mpz_inits(n, a, t1, t2, t3, t4, t5, t6, t7, u1, u2, s1, s2, h, rr, z1z1, z2z2, hh, hhh, v, NULL);
  mpz_t S, R, g; mpz_inits(S, R, g, NULL); pt P, P2, P3; pinit(&P); pinit(&P2); pinit(&P3);
  size_t cap = 1 << 20; char *line = malloc(cap); ssize_t got;
  while ((got = getline(&line, &cap, stdin)) > 0) {
    if (difftime(time(0), start) > budget) break;
    char *tok = strtok(line, " \n"); long i = atol(tok);
    mpz_set_str(n, strtok(0, " \n"), 16); mpz_set_str(a, strtok(0, " \n"), 16); mpz_set_str(P.X, strtok(0, " \n"), 16); mpz_set_str(P.Y, strtok(0, " \n"), 16);
    mpz_set_str(S, strtok(0, " \n"), 16); mpz_set_str(R, strtok(0, " \n"), 16); mpz_set_ui(P.Z, 1);
    struct timespec c0, c1; clock_gettime(CLOCK_MONOTONIC, &c0);
    mul(&P2, S, &P); mpz_gcd(g, P2.Z, n); int ok = (mpz_cmp_ui(g, 1) == 0);
    if (ok) { mul(&P3, R, &P2); mpz_mod(g, P3.Z, n); ok = (mpz_sgn(g) == 0); }
    clock_gettime(CLOCK_MONOTONIC, &c1);
    printf("%ld %d %.1f\n", i, ok, (c1.tv_sec - c0.tv_sec) + 1e-9 * (c1.tv_nsec - c0.tv_nsec)); fflush(stdout);
  }
  return 0;
}
