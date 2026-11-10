"""Extreme eigenvalues of the correlation matrix C_m (indices 2..m) and of the gcd matrix G_m (indices 1..m)
for large m, using prime-by-prime divisor transforms (compiled, tr.c)."""
import ctypes, numpy as np, scipy.sparse.linalg as sla, math, os, sys, time, json
L=ctypes.CDLL(os.path.join(os.path.dirname(os.path.abspath(__file__)),"tr.so"))
dp=np.ctypeslib.ndpointer(np.float64,flags="C"); lp=np.ctypeslib.ndpointer(np.int64,flags="C")
for f in ("zeta_mult","zeta_div","mob_div","mob_mult"):
    getattr(L,f).argtypes=[dp,ctypes.c_long,lp,ctypes.c_long]; getattr(L,f).restype=None
L.primes_phi.argtypes=[ctypes.c_long,lp,lp,ctypes.POINTER(ctypes.c_long)]
class Setup:
    def __init__(self,m,kind="C"):
        self.m=m; self.kind=kind; self.s=2 if kind=="C" else 1
        phi=np.zeros(m+1,np.int64); pr=np.zeros(int(1.3*m/max(1,math.log(m)))+100,np.int64); n=ctypes.c_long(0)
        L.primes_phi(m,phi,pr,ctypes.byref(n)); self.P=pr[:n.value].copy(); self.np=n.value
        self.phi=phi.astype(np.float64); self.phi[0]=1.0; self.iphi=phi
        a=np.arange(m+1,dtype=np.float64); self.sq=np.sqrt(np.maximum(a-(1 if kind=="C" else 0),1e-300)); self.sq[0]=1.0  # sqrt(a-1) or sqrt(a)
        if kind=="C": self.sq[1]=1.0
        self.buf=np.zeros(m+1)
    def C(self,x):      # x indexed by a = s..m
        z=self.buf; z[:self.s]=0; z[self.s:]=x/self.sq[self.s:]
        L.zeta_mult(z,self.m,self.P,self.np); z*=self.phi; z[:self.s]=0
        L.zeta_div(z,self.m,self.P,self.np); return z[self.s:]/self.sq[self.s:]
    def Cinv(self,x):
        z=self.buf; z[:self.s]=0; z[self.s:]=x*self.sq[self.s:]
        L.mob_div(z,self.m,self.P,self.np); z[:self.s]=0; z/=self.phi
        L.mob_mult(z,self.m,self.P,self.np); return z[self.s:]*self.sq[self.s:]
def extremes(m,kind="C",tol=1e-9,ncv=12,vectors=False):
    S=Setup(m,kind); n=m+1-S.s
    A=sla.LinearOperator((n,n),matvec=S.C,dtype=float); B=sla.LinearOperator((n,n),matvec=S.Cinv,dtype=float)
    v0=np.ones(n)/math.sqrt(n)
    l1,v1=sla.eigsh(A,k=1,which="LA",tol=tol,ncv=ncv,v0=v0)
    rng=np.random.default_rng(0); l2,v2=sla.eigsh(B,k=1,which="LA",tol=tol,ncv=ncv,v0=rng.standard_normal(n))
    return (float(l1[0]),float(l2[0]),v1[:,0],v2[:,0],S) if vectors else (float(l1[0]),float(l2[0]))
if __name__=="__main__":
    kind=sys.argv[1]
    for m in [int(float(s)) for s in sys.argv[2:]]:
        t=time.time(); a,b=extremes(m,kind); 
        rec=dict(kind=kind,m=m,lmax=a,inv_lmin=b,ratio=b/a,secs=round(time.time()-t,1)); print(json.dumps(rec),flush=True)
        open("ratio_results.jsonl","a").write(json.dumps(rec)+"\n")
