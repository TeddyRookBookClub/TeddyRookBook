# Greene's residue method for the standard map  p' = p - (K/2pi) sin(2pi x),  x' = x + p'.
# A periodic orbit of type P/Q (x advances by P in Q steps) with a point on the symmetry line x = 1/2 or x = 0;
# residue R = (2 - trace of the Q-step tangent map)/4.  A curve of winding number w survives while the residues of its
# convergents stay bounded; for the golden mean they pass 0.25 at K = 0.9716 (Greene 1979), which this script reproduces.
import math, sys
from fractions import Fraction
TWO=2*math.pi
def orbit(K,x0,p0,Q):
    x,p=x0,p0; a,b,c,d=1.0,0.0,0.0,1.0   # tangent map [[dx/dx0,dx/dp0],[dp/dx0,dp/dp0]]
    for _ in range(Q):
        f=-K*math.cos(TWO*x)              # d p'/d x
        c2=c+f*a; d2=d+f*b                # p' row
        a,b=a+c2,b+d2; c,d=c2,d2
        p=p-K/TWO*math.sin(TWO*x); x=x+p
    return x,p,a,b,c,d
def find(K,x0,P,Q,p0):
    # Newton on g(p0) = x_Q - x0 - P  (an orbit that starts on a symmetry line and closes in x is periodic)
    for _ in range(60):
        x,p,a,b,c,d=orbit(K,x0,p0,Q); g=x-x0-P
        if abs(g)<1e-13: break
        if b==0: return None
        step=g/b
        if abs(step)>0.05: step=0.05*math.copysign(1,step)
        p0-=step
    x,p,a,b,c,d=orbit(K,x0,p0,Q)
    if abs(x-x0-P)>1e-9 or abs(p-p0)>1e-6: return None
    return p0,(2-(a+d))/4
def conv(terms):
    # convergents p/q of [0; a1, a2, ...]
    h0,h1,k0,k1=1,0,0,1; out=[]
    for a in terms:
        h0,h1=h1,a*h1+h0; k0,k1=k1,a*k1+k0; out.append((h1,k1))
    return out
def kc(P,Q):
    """K at which the positive-residue symmetric orbit of P/Q reaches R = 0.25, by marching K upward
    with continuation (the step is halved whenever Newton loses the orbit)."""
    best=None
    for x0 in (0.0,0.5):
        K=0.0; p0=P/Q; R=0.0; dK=0.01; ok=True
        while K<3.0:
            r=find(K+dK,x0,P,Q,p0)
            if r is None or abs(r[1]-R)>0.2:
                dK/=2
                if dK<1e-7: ok=False; break
                continue
            if abs(r[1])>=0.25:
                if dK<1e-9: K+=dK; p0,R=r; break
                dK/=2; continue
            K+=dK; p0,R=r; dK=min(dK*1.5,0.01)
        if ok and K<3.0 and R>0.2: best=K
    return best
NUMS={'golden':[1]*14,'silver':[2]*8,'pi':[7,15,1,292],'e':[1,2,1,1,4,1,1,6,1,1,8],'fifth':[1,1,2,2,3,1,5,2,23,2]}   # phi-1, sqrt2-1, pi-3, e-2, log2(3/2)
if __name__=='__main__':
    for name in sys.argv[1:] or ['golden']:
        for (P,Q) in conv(NUMS[name]):
            if Q<3 or Q>1000: continue
            print(name,'%d/%d'%(P,Q),kc(P,Q),flush=True)
