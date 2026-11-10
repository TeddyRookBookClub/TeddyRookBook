"""The small-to-large mirror of the correlation matrix C_m: exact statements, checked numerically."""
import numpy as np, math, scipy.sparse.linalg as sla
from math import gcd
from sympy import factorint
from eig import sieve_phi_mu, build
def liouville(n): return (-1)**sum(factorint(n).values())
# (1) S C^{-1} S is entrywise non-negative, S = diag(Liouville)
m=400
C=np.array([[(gcd(a,b)-1)/math.sqrt((a-1)*(b-1)) for b in range(2,m+1)] for a in range(2,m+1)])
Ci=np.linalg.inv(C); lam=np.array([liouville(a) for a in range(2,m+1)])
SCS=Ci*np.outer(lam,lam)
print(f"m={m}: min entry of S C^-1 S = {SCS.min():.2e} (zero up to rounding => all entries >= 0); max = {SCS.max():.3f}")
# gcd / lcm duality: (C^-1)_ab = lam(a)lam(b) sqrt((a-1)(b-1)) sum_{d<=m, lcm(a,b)|d, d/a and d/b squarefree} 1/phi(d)
phi,mu=sieve_phi_mu(m)
def N(a,b):
    l=a*b//gcd(a,b); return math.sqrt((a-1)*(b-1))*sum(1/phi[d] for d in range(l,m+1,l) if mu[d//a]!=0 and mu[d//b]!=0)
err=max(abs(SCS[a-2,b-2]-N(a,b)) for a in range(2,m+1,7) for b in range(2,m+1,5))
print("   max difference from the lcm formula:",f"{err:.2e}")
# (2) eigenvectors: top of C is positive; bottom of C is Liouville times a positive vector
w,V=np.linalg.eigh(C); vmax=V[:,-1]*np.sign(V[:,-1].sum()); vmin=V[:,0]
s=np.sign(vmin*lam); s0=1 if (s>0).sum()>(s<0).sum() else -1
agree=((vmin*lam*s0)>1e-12).mean(); print(f"   bottom eigenvector: sign equals Liouville on {agree*100:.1f}% of indices (the rest are numerically zero: {((np.abs(vmin)<=1e-12)).mean()*100:.1f}%)")
print(f"   top eigenvector all positive: {(vmax>0).all()};  cosine between top vector and |bottom vector| = {abs(vmax@np.abs(vmin)):.3f}")
print(f"   lambda_max = {w[-1]:.4f}, 1/lambda_min = {1/w[0]:.4f}")
# where do the two vectors live?
a=np.arange(2,m+1)
for name,v in (("top",vmax),("bottom",np.abs(vmin))):
    idx=np.argsort(-v)[:8]; print(f"   largest entries of the {name} vector at a =",a[idx].tolist())
# (3) one prime: K = [r^|i-j|], the correlation matrix of a chain; inverse tridiagonal; mirror map
for p in (2,3,7):
    r=p**-0.5; n=400; K=np.array([[r**abs(i-j) for j in range(n)] for i in range(n)]); Ki=np.linalg.inv(K)
    off=np.abs(Ki-np.diag(np.diag(Ki))-np.diag(np.diag(Ki,1),1)-np.diag(np.diag(Ki,-1),-1)).max()
    ev=np.linalg.eigvalsh(K); M=(1+r)/(1-r); c=(1+r*r)/(1-r*r)
    lam_=ev[::-1]; mirror=lam_/(2*c*lam_-1)
    print(f"   p={p}: inverse is tridiagonal (largest other entry {off:.1e}); eigenvalues in [{ev[0]:.4f}, {ev[-1]:.4f}], limits 1/M={1/M:.4f}, M={M:.4f}; "
          f"mirror map lam -> lam/(2c lam - 1) sends the spectrum to itself within {np.abs(np.sort(mirror)-ev).max():.1e}")
# (4) bigger m: the two extreme vectors
m=20000; phi,mu=sieve_phi_mu(m); V_,Vi=build(m,phi,mu)
a=np.arange(2,m+1); D=1/np.sqrt(a-1.0); ph=phi[2:].astype(float); VT=V_.T.tocsr(); ViT=Vi.T.tocsr()
Cop=sla.LinearOperator((m-1,m-1),matvec=lambda x: D*(V_@(ph*(VT@(D*x)))),dtype=float)
Ciop=sla.LinearOperator((m-1,m-1),matvec=lambda x: (ViT@((Vi@(x/D))/ph))/D,dtype=float)
l1,v1=sla.eigsh(Cop,k=1,which='LA'); l2,v2=sla.eigsh(Ciop,k=1,which='LA'); v1=v1[:,0]*np.sign(v1[:,0].sum()); v2=v2[:,0]
# Liouville via sieve
lio=np.ones(m+1,int)
n=np.arange(m+1)
for p in range(2,m+1):
    if phi[p]==p-1:
        pk=p
        while pk<=m: lio[pk::pk]*=-1; pk*=p
lam2=lio[2:]; t=v2*lam2; t*=np.sign(t.sum())
print(f"m={m}: lambda_max={l1[0]:.3f}, 1/lambda_min={l2[0]:.3f}; bottom vector x Liouville is >= 0 on {((t>-1e-9)).mean()*100:.2f}% of indices; cosine(top, |bottom|) = {abs(v1@np.abs(v2)):.3f}")
for name,v in (("top",v1),("bottom",np.abs(v2))):
    idx=np.argsort(-v)[:10]; print(f"   largest entries of the {name} vector at a =",a[idx].tolist())
