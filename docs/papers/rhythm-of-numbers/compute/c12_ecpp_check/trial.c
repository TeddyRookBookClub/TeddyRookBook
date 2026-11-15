// Primality of one number below 2^64 by trial division up to its square root.
#include <stdio.h>
#include <stdlib.h>
int main(int argc, char **argv) { unsigned long long n = strtoull(argv[1], 0, 10); if (n < 2) { puts("not prime"); return 0; }
  if (n % 2 == 0) { puts(n == 2 ? "prime" : "composite"); return 0; }
  for (unsigned long long d = 3; d <= 4294967295ULL && d * d <= n; d += 2) if (n % d == 0) { printf("composite\n"); return 0; }
  puts("prime"); return 0; }
