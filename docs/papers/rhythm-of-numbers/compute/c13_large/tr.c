// Divisor-lattice transforms on y[1..m], one prime at a time (O(m log log m)).
#include <stdlib.h>
void primes_phi(long m, long *phi, long *primes, long *np){
  for(long i=0;i<=m;i++) phi[i]=i; long c=0;
  for(long p=2;p<=m;p++) if(phi[p]==p){ primes[c++]=p; for(long k=p;k<=m;k+=p) phi[k]-=phi[k]/p; }
  *np=c;
}
void zeta_mult(double*y,long m,const long*P,long np){ for(long i=0;i<np;i++){long p=P[i]; for(long k=m/p;k>=1;k--) y[k]+=y[k*p];} }
void zeta_div (double*y,long m,const long*P,long np){ for(long i=0;i<np;i++){long p=P[i]; long K=m/p; for(long k=1;k<=K;k++) y[k*p]+=y[k];} }
void mob_div  (double*y,long m,const long*P,long np){ for(long i=0;i<np;i++){long p=P[i]; for(long k=m/p;k>=1;k--) y[k*p]-=y[k];} }
void mob_mult (double*y,long m,const long*P,long np){ for(long i=0;i<np;i++){long p=P[i]; long K=m/p; for(long k=1;k<=K;k++) y[k]-=y[k*p];} }
// sum over square divisors: y[n] <- sum_{j^2 | n} y[n/j^2]
void zeta_sq(double*y,long m,const long*P,long np){ for(long i=0;i<np;i++){long q=P[i]*P[i]; if(q>m) break; long K=m/q; for(long k=1;k<=K;k++) y[k*q]+=y[k];} }
