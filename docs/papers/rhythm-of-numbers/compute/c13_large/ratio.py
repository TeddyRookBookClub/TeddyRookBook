"""How far apart are the two ends of the spectrum?  (Chapter 18, Section 18.3)
   python3 ratio.py            tables up to 10^7 (a few minutes)
   python3 ratio.py big        also 3 x 10^7 (needs about 4 GB of memory)
Build the compiled helper first:  gcc -O3 -shared -fPIC -o tr.so tr.c"""
import sys, math, numpy as np, scipy.sparse.linalg as sla
from fast import extremes, Setup, L
def smooth(S,y):
    """extremes of the gcd matrix on the numbers <= m whose prime factors are all <= y"""
    m=S.m; P=S.P[S.P<=y].copy(); r=np.arange(m+1)
    for p in P:
        pk=p
        while pk<=m: r[pk::pk]//=p; pk*=p
    idx=np.nonzero(r==1)[0]; idx=idx[idx>0]; n=len(idx); sq=np.sqrt(idx.astype(float)); ph=S.phi[idx]; z=np.zeros(m+1)
    def A(x):
        z[:]=0; z[idx]=x/sq; L.zeta_mult(z,m,P,len(P)); z[idx]*=ph; L.zeta_div(z,m,P,len(P)); return z[idx]/sq
    def B(x):
        z[:]=0; z[idx]=x*sq; L.mob_div(z,m,P,len(P)); z[idx]/=ph; L.mob_mult(z,m,P,len(P)); return z[idx]*sq
    if n<400:
        Ad=np.array([A(e) for e in np.eye(n)]); ev=np.linalg.eigvalsh((Ad+Ad.T)/2); return n,ev[-1],1/ev[0]
    a=sla.eigsh(sla.LinearOperator((n,n),matvec=A,dtype=float),k=1,which="LA",tol=1e-10,v0=np.ones(n))[0][0]
    b=sla.eigsh(sla.LinearOperator((n,n),matvec=B,dtype=float),k=1,which="LA",tol=1e-10,v0=np.random.default_rng(0).standard_normal(n))[0][0]
    return n,float(a),float(b)
def median_index(v,s):
    w=v*v; return int(np.searchsorted(np.cumsum(w)/w.sum(),0.5))+s
if __name__=="__main__":
    sizes=[10**2,10**3,10**4,10**5,10**6,10**7]+([3*10**7] if "big" in sys.argv else [])
    print("      m   lmax(C)  1/lmin(C)  ratio C | ratio G")
    for m in sizes:
        kw=dict(tol=1e-10,ncv=6) if m>10**7 else dict(tol=1e-11)
        c,d=extremes(m,"C",**kw); a,b=extremes(m,"G",**kw)
        print(f"{m:>9} {c:9.3f} {d:10.3f} {d/c:8.4f} | {b/a:.4f}",flush=True)
    print("\ngcd matrix on numbers with prime factors <= y")
    for m in (10**4,10**6,10**7):
        S=Setup(m,"G")
        for y in (2,3,5,7,13,29,97,997,m):
            n,a,b=smooth(S,y); print(f"  m={m:>8} y={y:>8}: {n:>8} numbers  lmax {a:9.3f}  1/lmin {b:9.3f}  ratio {b/a:.4f}",flush=True)
    l1,l2,v1,v2,S=extremes(10**6,"G",tol=1e-11,vectors=True)
    print("\nm = 10^6, gcd matrix: half the weight of the top vector lies above a =",median_index(v1,1),"; of the bottom vector below a =",median_index(v2,1))
    print("\none prime, k levels: ratio x (1-1/p)")
    for p in (2,3,5):
        r=p**-0.5; out=[]
        for k in (2,3,4,8,64,256):
            K=np.array([[r**abs(i-j) for j in range(k)] for i in range(k)]); e=np.linalg.eigvalsh(K); out.append(round(float(1/(e[0]*e[-1])*(1-1/p)),4))
        print("  p =",p,out)
