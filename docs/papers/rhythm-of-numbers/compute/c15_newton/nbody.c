/* Newtonian N-body integration of the Sun and the eight planets (Earth and Moon as one body at their barycenter).
   Fourth-order symplectic integrator (Yoshida 1990), step DT days.  Starting conditions: JPL's approximate mean elements
   at J2000 (Standish and Williams), used as osculating elements; so this is "a solar system like ours", and every
   comparison in the chapter uses the mean motions measured from this run itself.  No relativity, no Moon, no asteroids.
   Output (binary doubles): for each block of BLOCK days, the block averages of, for each planet,
     lambda - n0 t  (mean longitude less a fixed nominal rate, unwrapped, radians), varpi (unwrapped), a (AU), e.
   usage: nbody YEARS DT BLOCK OUTFILE [8 factors for the starting semi-major axes] [8 starting eccentricities]
         [8 starting longitudes of perihelion, degrees]
   tune.py chooses these so that the mean periods over the run equal JPL's long-term mean periods and the averages of
   e cos(varpi), e sin(varpi) over the first 250 years equal JPL's mean elements. */
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#define NB 9
static const double K = 0.01720209895;            /* Gauss's constant: GM_sun = K*K in AU^3/day^2 */
static const double RM[8] = {6023600.0, 408523.71, 328900.56, 3098708.0, 1047.3486, 3497.898, 22902.98, 19412.24};
/* a (AU), e, I, L, long. of perihelion, long. of node (degrees), J2000 */
static const double EL[8][6] = {
 {0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593},
 {0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255},
 {1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0},
 {1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891},
 {5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909},
 {9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448},
 {19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503},
 {30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574}};
static double m[NB], x[NB][3], v[NB][3], acc[NB][3];
static void force(void) {
  int i, j, k; for (i = 0; i < NB; i++) for (k = 0; k < 3; k++) acc[i][k] = 0;
  for (i = 0; i < NB; i++) for (j = i + 1; j < NB; j++) {
    double d[3], r2 = 0, r3i; for (k = 0; k < 3; k++) { d[k] = x[j][k] - x[i][k]; r2 += d[k] * d[k]; }
    r3i = 1.0 / (r2 * sqrt(r2));
    for (k = 0; k < 3; k++) { acc[i][k] += m[j] * d[k] * r3i; acc[j][k] -= m[i] * d[k] * r3i; }
  }
}
static void elements(int p, double *a, double *e, double *varpi, double *lam) {
  double r[3], w[3], h[3], ev[3], mu = m[0] + m[p], rr = 0, v2 = 0, rv = 0; int k;
  for (k = 0; k < 3; k++) { r[k] = x[p][k] - x[0][k]; w[k] = v[p][k] - v[0][k]; rr += r[k] * r[k]; v2 += w[k] * w[k]; rv += r[k] * w[k]; }
  rr = sqrt(rr);
  h[0] = r[1] * w[2] - r[2] * w[1]; h[1] = r[2] * w[0] - r[0] * w[2]; h[2] = r[0] * w[1] - r[1] * w[0];
  for (k = 0; k < 3; k++) ev[k] = ((v2 - mu / rr) * r[k] - rv * w[k]) / mu;
  *e = sqrt(ev[0] * ev[0] + ev[1] * ev[1] + ev[2] * ev[2]);
  *a = 1.0 / (2.0 / rr - v2 / mu);
  { double hh = sqrt(h[0] * h[0] + h[1] * h[1] + h[2] * h[2]), Om = atan2(h[0], -h[1]), nx = cos(Om), ny = sin(Om);
    /* argument of perihelion: angle from the node to the e-vector, measured in the orbit plane */
    double cw = (nx * ev[0] + ny * ev[1]) / *e;
    double sw = ((h[0] * (ny * ev[2] - 0) + h[1] * (0 - nx * ev[2]) + h[2] * (nx * ev[1] - ny * ev[0])) / hh) / *e;
    double om = atan2(sw, cw);
    double cnu = (ev[0] * r[0] + ev[1] * r[1] + ev[2] * r[2]) / (*e * rr);
    double snu = ((h[0] * (ev[1] * r[2] - ev[2] * r[1]) + h[1] * (ev[2] * r[0] - ev[0] * r[2]) + h[2] * (ev[0] * r[1] - ev[1] * r[0])) / hh) / (*e * rr);
    double nu = atan2(snu, cnu), E = 2.0 * atan2(sqrt(1 - *e) * sin(nu / 2), sqrt(1 + *e) * cos(nu / 2)), M = E - *e * sin(E);
    *varpi = Om + om; *lam = *varpi + M; }
}
int main(int argc, char **argv) {
  double years = atof(argv[1]), DT = atof(argv[2]), BLOCK = atof(argv[3]); FILE *f = fopen(argv[4], "wb");
  const double w1 = 1.0 / (2.0 - cbrt(2.0)), w0 = 1.0 - 2.0 * w1, cs[4] = {w1 / 2, (w0 + w1) / 2, (w0 + w1) / 2, w1 / 2}, ds[3] = {w1, w0, w1};
  double D = M_PI / 180, n0[8], prevL[8], prevW[8], unL[8], unW[8], sum[8][4], t = 0; int i, k, p, s;
  long nstep = (long)(years * 365.25 / DT), step, every = 16, inblock = (long)(BLOCK / (DT * every)), cnt = 0;
  m[0] = K * K;
  for (p = 0; p < 8; p++) {
    double a = EL[p][0] * (argc > 5 + p ? atof(argv[5 + p]) : 1.0), e = (argc > 13 + p ? atof(argv[13 + p]) : EL[p][1]), I = EL[p][2] * D, L = EL[p][3] * D, wb = (argc > 21 + p ? atof(argv[21 + p]) : EL[p][4]) * D, Om = EL[p][5] * D, om = wb - Om, M = L - wb, E = M, mu, xp, yp, vx, vy, n;
    m[p + 1] = K * K / RM[p]; mu = m[0] + m[p + 1];
    for (i = 0; i < 30; i++) E -= (E - e * sin(E) - M) / (1 - e * cos(E));
    n = sqrt(mu / (a * a * a)); n0[p] = n;
    xp = a * (cos(E) - e); yp = a * sqrt(1 - e * e) * sin(E); vx = -a * n * sin(E) / (1 - e * cos(E)); vy = a * n * sqrt(1 - e * e) * cos(E) / (1 - e * cos(E));
    { double c1 = cos(om), s1 = sin(om), c2 = cos(Om), s2 = sin(Om), ci = cos(I), si = sin(I);
      double R[3][2] = {{c1 * c2 - s1 * s2 * ci, -s1 * c2 - c1 * s2 * ci}, {c1 * s2 + s1 * c2 * ci, -s1 * s2 + c1 * c2 * ci}, {s1 * si, c1 * si}};
      for (k = 0; k < 3; k++) { x[p + 1][k] = R[k][0] * xp + R[k][1] * yp; v[p + 1][k] = R[k][0] * vx + R[k][1] * vy; } }
  }
  { double cm[3] = {0, 0, 0}, cv[3] = {0, 0, 0}, mt = m[0];   /* to the barycenter */
    for (k = 0; k < 3; k++) { x[0][k] = 0; v[0][k] = 0; }
    for (p = 1; p < NB; p++) { mt += m[p]; for (k = 0; k < 3; k++) { cm[k] += m[p] * x[p][k]; cv[k] += m[p] * v[p][k]; } }
    for (p = 0; p < NB; p++) for (k = 0; k < 3; k++) { x[p][k] -= cm[k] / mt; v[p][k] -= cv[k] / mt; } }
  for (p = 0; p < 8; p++) { double a, e; elements(p + 1, &a, &e, &prevW[p], &prevL[p]); unL[p] = prevL[p]; unW[p] = prevW[p]; for (k = 0; k < 4; k++) sum[p][k] = 0; }
  fwrite(n0, sizeof(double), 8, f);
  for (step = 1; step <= nstep; step++) {
    for (s = 0; s < 4; s++) {
      for (i = 0; i < NB; i++) for (k = 0; k < 3; k++) x[i][k] += cs[s] * DT * v[i][k];
      if (s < 3) { force(); for (i = 0; i < NB; i++) for (k = 0; k < 3; k++) v[i][k] += ds[s] * DT * acc[i][k]; }
    }
    t += DT;
    if (step % every == 0) {
      for (p = 0; p < 8; p++) {
        double a, e, W, L, d; elements(p + 1, &a, &e, &W, &L);
        d = L - prevL[p]; d -= 2 * M_PI * floor(d / (2 * M_PI) + 0.5); d += 2 * M_PI * floor((n0[p] * DT * every - d) / (2 * M_PI) + 0.5); unL[p] += d; prevL[p] = L;
        d = W - prevW[p]; d -= 2 * M_PI * floor(d / (2 * M_PI) + 0.5); unW[p] += d; prevW[p] = W;
        sum[p][0] += unL[p] - n0[p] * t; sum[p][1] += unW[p]; sum[p][2] += a; sum[p][3] += e;
      }
      if (++cnt == inblock) { for (p = 0; p < 8; p++) { for (k = 0; k < 4; k++) { double q = sum[p][k] / cnt; fwrite(&q, sizeof(double), 1, f); sum[p][k] = 0; } } cnt = 0; }
    }
  }
  fclose(f); return 0;
}
