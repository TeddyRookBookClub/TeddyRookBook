# The eight "Hard" entries of After the Riemann Hypothesis

Programs behind `/connections/rhythm-of-numbers/riemann-hypothesis/` for the entries that need the hypothesis for more
L-functions than the Lean library of 2026-11-20 covers. Nothing here advances any of them.

`ternary.c`: every odd number up to N tested against Ramanujan's form x^2 + y^2 + 10 z^2. `ternary-output.txt` is the
run for N = 2,000,000,000 (25 seconds): the eighteen exceptions of Ono and Soundararajan and no others. Not new
(Galway had checked further), and not a proof.

What each entry assumes, as checked from the papers or their abstracts in November 2026:

| entry | hypothesis for | follows from ERH for all number fields? |
|---|---|---|
| Artin's primitive roots (Hooley; Cooke-Weinberger, Lenstra) | zeta of K(zeta_n, W^(1/n)) | yes |
| effective Chebotarev (Lagarias-Odlyzko, Bach-Sorenson) | zeta of the field | it is ERH |
| class group generators (Bach; Belabas-Diaz y Diaz-Friedman) | L(s, kappa), kappa a class group character | yes (factors of zeta of the Hilbert class field) |
| Euclidean rings (Weinberger, Lenstra) | zeta of K(zeta_n, units^(1/n)) | yes |
| Ramanujan's ternary form (Ono-Soundararajan) | real Dirichlet L (proved) and L(E(-10N), s) | no |
| elliptic curves (Serre and others) | zeta of division fields; L(E, s) for ranks | partly |
| isogeny graphs (Jao-Miller-Venkatesan) | characters of narrow ray class groups (abstract only) | yes, as far as we can tell |
| Koiran's Nullstellensatz, 3-manifolds (Kuperberg, Zentner) | effective Chebotarev | yes |
