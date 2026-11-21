// Class number h(-q) of the fundamental discriminant -q by counting reduced forms.  Usage: ./hq q [q ...]
// Prints: q, "F" or "-" (fundamental or not), h.
#include <stdio.h>
#include <stdlib.h>
typedef unsigned long long u64;
static int fundamental(u64 q) { u64 m = q; if (q % 4 == 0) { m = q / 4; if (m % 4 == 3 || m % 4 == 0) return 0; } else if (q % 4 != 3) return 0; for (u64 p = (q % 4 == 0 ? 3 : 2); p * p <= m; p++) if (m % (p * p) == 0) return 0; return 1; }
int main(int argc, char **argv) { for (int k = 1; k < argc; k++) { u64 q = strtoull(argv[k], 0, 10), h = 0;
    for (u64 b = q & 1; 3 * b * b <= q; b += 2) { u64 m = (b * b + q) / 4; for (u64 a = (b > 1 ? b : 1); a * a <= m; a++) if (m % a == 0) h += (b == 0 || b == a || a * a == m) ? 1 : 2; }
    printf("%llu %s %llu\n", q, fundamental(q) ? "F" : "-", h); fflush(stdout); } return 0; }
