"""Harper / Hofstadter spectrum at the convergents of a number: bands, groups, Hall integers."""
import numpy as np, math, json
def bands(p,q):
    edges=[]
    for k1,k2 in ((0,0),(math.pi/q,math.pi/q)):
        H=np.zeros((q,q),complex)
        for m in range(q):
            H[m,m]+=2*math.cos(2*math.pi*p*m/q+k2)
            H[m,(m+1)%q]+=np.exp(1j*k1) if q>2 else 1; H[(m+1)%q,m]+=np.exp(-1j*k1) if q>2 else 1
        edges.append(np.sort(np.linalg.eigvalsh(H)))
    return np.minimum(*edges),np.maximum(*edges)
def hall(p,q,r):
    return next(t for t in sorted(range(-(q//2),q//2+1),key=abs) if (r-p*t)%q==0)
def groups(lo,hi,ncuts):
    q=len(lo); gaps=lo[1:]-hi[:-1]; big=sorted(np.argsort(gaps)[::-1][:ncuts])
    return np.diff([0]+[g+1 for g in big]+[q]).tolist(), big
def convs(terms):
    p0,q0,p1,q1=1,0,0,1; out=[]
    for a in terms:
        p0,q0,p1,q1=p1,q1,a*p1+p0,a*q1+q0; out.append((p1,q1))
    return out
numbers={"pi - 3":[7,15,1,292],"golden ratio - 1":[1]*9,"sqrt(2) - 1":[2]*5,"e - 2":[1,2,1,1,4,1,1],"the fifth, log2(3/2)":[1,1,2,2,3,1,5]}
if __name__=="__main__":
  for name,t in numbers.items():
      cs=[c for c in convs(t) if 2<c[1]<=240]; print("\n"+name,"terms",t)
      for i,(p,q) in enumerate(cs):
          lo,hi=bands(p,q); width=(hi-lo).sum()
          line=f"  {p}/{q}: {q} bands, total width {width:.4f} (9.33/q = {9.33/q:.4f})"
          for (pp,qq) in cs[:i]:
              if qq>=3 and qq<q:
                  g,big=groups(lo,hi,qq-1); line+=f"; cut at the {qq-1} widest gaps -> {g}"
          print(line)
      p,q=cs[-1]; lo,hi=bands(p,q); g,big=groups(lo,hi,min(6,q-1)); print("     Hall integers of the widest gaps:",[hall(p,q,b+1) for b in big])
  # check the band-edge method against a brute-force scan over k for a small case
  p,q=3,8; lo,hi=bands(p,q); allE=[]
  for k1 in np.linspace(0,2*math.pi/q,24):
      for k2 in np.linspace(0,2*math.pi/q,24):
          H=np.zeros((q,q),complex)
          for m in range(q):
              H[m,m]+=2*math.cos(2*math.pi*p*m/q+k2); H[m,(m+1)%q]+=np.exp(1j*k1); H[(m+1)%q,m]+=np.exp(-1j*k1)
          allE.append(np.linalg.eigvalsh(H))
  A=np.array(allE); print("\ncheck 3/8: brute-force band edges vs formula, max difference",max(np.abs(A.min(0)-lo).max(),np.abs(A.max(0)-hi).max()))
