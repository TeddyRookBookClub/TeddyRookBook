"""Three numbers resolved by calculation from sourced constants (NASA fact sheets; Luque et al. 2023 periods)."""
import math
def kirkwood():
    TJ=4332.589; YR=365.256; aJ=778.479e6/149.5978707e6; mJ=1898.13; mS=1988400.0
    out=[]
    for p,q in ((3,1),(5,2),(7,3),(2,1)): out.append((f"{p}:{q}", ((TJ/YR)*q/p)**(2/3), aJ*(q/p)**(2/3)))
    return out, aJ, ((TJ/YR)**2*(1+mJ/mS))**(1/3), (1+mJ/mS)**(1/3)
def saturn():
    GM=37.931e6; J2=16298e-6; R=60268.0; nM=2*math.pi/(0.9424218*86400)
    n=lambda r: math.sqrt(GM/r**3*(1+1.5*J2*(R/r)**2)); kap=lambda r: math.sqrt(GM/r**3*(1-1.5*J2*(R/r)**2))
    def solve(f,lo=100000.0,hi=130000.0):
        for _ in range(80):
            mid=(lo+hi)/2
            if f(mid)>0: lo=mid
            else: hi=mid
        return (lo+hi)/2
    return 185520*2**(-2/3), (GM/(2*nM)**2)**(1/3), solve(lambda r:n(r)-2*nM), solve(lambda r:(2*n(r)-kap(r))-2*nM)
def cf(x,n=5):
    out=[]
    for _ in range(n):
        a=math.floor(x); out.append(a); x-=a
        if x<1e-12: break
        x=1/x
    return out
HD=[9.113678,13.673694,20.519617,30.793091,41.05854,54.76992]   # days, Luque et al. 2023
def hd():
    rows=[]
    for i in range(5):
        r=HD[i+1]/HD[i]; p,q=((3,2) if r>1.4 else (4,3)); t=cf(r,5); rows.append((r,p,q,q*q*abs(r-p/q),t))
    return rows
if __name__=="__main__":
    rows,aJ,aJk,f=kirkwood(); print("Jupiter's distance: fact sheet %.5f AU; from its period and mass %.5f AU; mass factor %.6f"%(aJ,aJk,f))
    for name,a,b in rows: print(f"  {name}: from the period {a:.4f} AU; scaling Jupiter's distance {b:.4f} AU; difference {b-a:.4f}")
    s=saturn(); print("Saturn 2:1 with Mimas (km): scaling Mimas's distance %.0f; Kepler radius for half its period %.0f; with flattening, half the period at %.0f; resonance proper at %.0f; B-ring edge 117580"%s)
    for r,p,q,e,t in hd(): print(f"  HD 110067: ratio {r:.5f} near {p}/{q}; q^2 x error {e:.4f}; expansion {t}")
    import numpy as np; print("  mean q^2 x error:",round(float(np.mean([x[3] for x in hd()])),4))
