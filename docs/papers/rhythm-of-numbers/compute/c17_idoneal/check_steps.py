"""Numerical checks of Steps 1 and 3 of the note on Euler's idoneal numbers (README.md here). Python 3, no packages."""
import math, os
# Step 1: LLS Corollary 1.3 lower bound vs 2^(omega-1)
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
# Step 4 (orders): conductors f with phi(f) <= 12 * 2^(number of odd primes dividing f)
def contrib_ok():
    pp=[]   # allowed prime powers with their contribution c = phi(p^e)/2 (odd p) or phi(2^a)
    for p in [3,5,7,11,13,17,19,23,29]:
        e=1
        while p**(e-1)*(p-1)/2<=12: pp.append((p,e,p**(e-1)*(p-1)/2)); e+=1
    two=[(0,1)]+[(a,2**(a-1)) for a in range(1,6) if 2**(a-1)<=12]
    return pp,two
pp,two=contrib_ok()
primes=sorted(set(p for p,e,c in pp)); best=0; allf=[]
def rec(i,f,c):
    global best
    if i==len(primes):
        for a,ca in two:
            if c*ca<=12: allf.append(f*2**a)
        return
    rec(i+1,f,c)
    for p,e,cc in pp:
        if p==primes[i] and c*cc<=12: rec(i+1,f*p**e,c*cc)
rec(0,1,1)
print('allowed conductors:',len(allf),'largest',max(allf)); 
# brute-force confirmation of the enumeration
def phi(n):
    r=n;m=n;p=2
    while p*p<=m:
        if m%p==0:
            while m%p==0:m//=p
            r-=r//p
        p+=1
    if m>1:r-=r//m
    return r
def wodd(n):
    c=0;p=3
    while n%2==0:n//=2
    while p*p<=n:
        if n%p==0:
            c+=1
            while n%p==0:n//=p
        p+=2
    return c+(n>1)
bf=[f for f in range(1,200001) if phi(f)<=12*2**wodd(f)]
print('brute force to 200,000 agrees:',sorted(allf)==bf)
F=max(allf); print('largest n = q f^2 / 4 with q <= 5460: %.3g  (the search covered n < 2.5e9)'%(5460*F*F/4))
# the 36 non-fundamental discriminants found: their conductors
rows=[l.split() for l in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'exp2-output.txt'))]
fund={int(r[0]) for r in rows if r[2]=='F'}; mx=0
for r in rows:
    q=int(r[0])
    if r[2]=='F': continue
    f=max(f for f in range(1,200) if q%(f*f)==0 and (q//(f*f)) in fund or (q%(f*f)==0 and q//(f*f) in (3,4,7,8)) )
    assert q//(f*f) in fund, q; assert f in allf,(q,f); mx=max(mx,f)
print('all non-fundamental discriminants in the list have a conductor on the allowed list; largest conductor seen:',mx)
