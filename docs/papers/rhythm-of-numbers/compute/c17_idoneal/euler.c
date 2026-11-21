// An independent check with Euler's own criterion: n is idoneal exactly when n is NOT of the form ab + bc + ca with
// 0 < a < b < c.  Marks every such n below LIMIT and prints the rest.   Usage: ./euler LIMIT
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char **argv) {
  long N = atol(argv[1]); char *hit = calloc(N + 1, 1);
  for (long a = 1; 3 * a * a < N; a++) for (long b = a + 1; a * b + (a + b) * (b + 1) <= N; b++)
    for (long c = b + 1, n; (n = a * b + (a + b) * c) <= N; c++) hit[n] = 1;
  int k = 0; for (long n = 1; n <= N; n++) if (!hit[n]) { printf("%ld ", n); k++; }
  printf("\n%d idoneal numbers up to %ld\n", k, N); return 0;
}
