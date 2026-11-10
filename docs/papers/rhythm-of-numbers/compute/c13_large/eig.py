import numpy as np, scipy.sparse as sp, scipy.sparse.linalg as sla, math, sys, time
def sieve_phi_mu(m):
    phi=np.arange(m+1,dtype=np.int64); mu=np.ones(m+1,dtype=np.int64); isp=np.ones(m+1,dtype=bool); isp[:2]=False
    for p in range(2,m+1):
        if isp[p]:
            isp[2*p::p]=False
            phi[p::p]-=phi[p::p]//p
            mu[p::p]*=-1
            if p*p<=m: mu[p*p::p*p]=0
    return phi,mu
def build(m, phi, mu):
    # indices 2..m -> 0..m-2
    rows=[];cols=[];mus=[]
    for d in range(2,m+1):
        a=np.arange(d,m+1,d)
        rows.append(a-2); cols.append(np.full(len(a),d-2)); mus.append(mu[a//d])
    rows=np.concatenate(rows);cols=np.concatenate(cols);mus=np.concatenate(mus).astype(float)
    V=sp.csr_matrix((np.ones(len(rows)),(rows,cols)),shape=(m-1,m-1))
    nz=mus!=0
    Vi=sp.csr_matrix((mus[nz],(rows[nz],cols[nz])),shape=(m-1,m-1))
    return V,Vi
def run(m):
    phi,mu=sieve_phi_mu(m)
    V,Vi=build(m,phi,mu)
    a=np.arange(2,m+1); D=1/np.sqrt(a-1.0); ph=phi[2:].astype(float)
    VT=V.T.tocsr(); ViT=Vi.T.tocsr()
    C=sla.LinearOperator((m-1,m-1),matvec=lambda x: D*(V@(ph*(VT@(D*x)))),dtype=float)
    Ci=sla.LinearOperator((m-1,m-1),matvec=lambda x: (ViT@((Vi@(x/D))/ph))/D,dtype=float)
    lmax=sla.eigsh(C,k=1,which='LA',tol=1e-10,return_eigenvectors=False)[0]
    imax=sla.eigsh(Ci,k=1,which='LA',tol=1e-10,return_eigenvectors=False)[0]
    # trace of inverse: sum_a (a-1) sum_{d: a|d} mu(d/a)^2/phi(d)
    Vi2=Vi.multiply(Vi)  # mu^2 ; (Vi2)[d,a]
    trinv=float(((Vi2.T@(1/ph))*(a-1.0)).sum())
    return lmax, imax, trinv/(m-1)
if __name__=="__main__":
    for m in [int(s) for s in sys.argv[1:]]:
        t=time.time(); lmax,imax,ti=run(m)
        pred=math.exp(2*math.sqrt(math.log(m)/math.log(math.log(m))))
        print(f"m={m} lmax={lmax:.4f} 1/lmin={imax:.4f} lmin={1/imax:.6f} ratio={imax/lmax:.4f} trCinv/(m-1)={ti:.5f} exp(2sqrt)={pred:.2f}  t={time.time()-t:.1f}s",flush=True)
