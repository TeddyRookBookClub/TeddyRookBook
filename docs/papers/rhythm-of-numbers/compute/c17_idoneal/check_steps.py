"""Numerical checks of Steps 1, 2 and 4 of the note on Euler's idoneal numbers (README.md here). Python 3, no packages."""
import math, os
# Step 2: LLS Corollary 1.3 lower bound vs 2^(omega-1)
g=0.5772156649015329
def L(q):
    ll=math.log(math.log(q)); return math.pi/(12*math.exp(g))*math.sqrt(q)/(ll-math.log(2)+0.5+1/ll+14*ll/math.log(q))
print('L(1e10)=%.1f L(1e11)=%.1f'%(L(1e10),L(1e11)))
pr=[p for p in range(2,600) if all(p%d for d in range(2,int(p**.5)+1))]
prim=1; ok=True
for k,p in enumerate(pr,1):
    prim*=p; q=max(1e10,float(prim)) if prim<1e300 else None
    if q is None: break
    if not L(q)>2**(k-1): ok=False; print('FAIL',k)
    if k in(10,11,12,15,16,20): print(k,'%.3g'%q,'%.4g'%L(q),2**(k-1))
print('all k ok:',ok,'checked to k =',k)
# Step 1 second branch: n <= (log 4n + 9 + 2.5 (loglog 4n)^2)^4
n=10
for n in [10**k for k in range(4,12)]:
    q=4*n; b=(math.log(q)+9+2.5*math.log(math.log(q))**2)**4; print('n=%.0e bound=%.3g'%(n,b), 'excluded' if b<n else '')
# Step 4: product of split primes below 100 for each fundamental d in the list
def kron(D,p):
    if p==2: return 0 if D%2==0 else (1 if D%8 in(1,7) else -1)
    r=pow(D%p,(p-1)//2,p); return 0 if D%p==0 else (1 if r==1 else -1)
F=[int(l.split()[0]) for l in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'exp2-output.txt')) if ' F' in l]
sm=[p for p in pr if p<200]; worst=None
for q in F:
    prod=1
    for p in sm:
        if kron(-q,p)==1: prod*=p
    need=math.sqrt(4e18/q)
    if worst is None or prod/need<worst[0]: worst=(prod/need,q,prod,need)
print('fundamental:',len(F),'max',max(F),'worst ratio product/needed: %.3g (q=%d, product %.3g, f could be at most %.3g)'%worst)
