# Independent spot checks of Chapter 18 (written separately from the owner's scripts).
import numpy as np, math
from math import gcd
from fractions import Fraction
def cf(x,n=6):
    out=[]
    for _ in range(n):
        a=math.floor(x); out.append(a); x=x-a
        if x<1e-12: break
        x=1/x
    return out
# 18.1 Bohr numbers
a0=5.29177e-11; T1=2*math.pi*a0/ (2.18769e6)   # orbit circumference / Bohr speed
print('T1 %.4e'%T1, 'r(1009) um %.1f'%(a0*1009**2*1e6), 'T(1009) %.3e'%(T1*1009**3), 'f_orb(1011) MHz %.3f'%(1/(T1*1011**3)/1e6))
Rc=3.2898419603e15; f=Rc*(1/1009**2-1/1013**2); print('1013->1009 MHz %.2f ratio to orbital at 1011: %.4f'%(f/1e6, f*T1*1011**3))
# 18.2 period ratios (sidereal periods in days, standard values)
P=dict(Mercury=87.969,Venus=224.701,Earth=365.256,Mars=686.980,Jupiter=4332.59,Saturn=10759.22,Io=1.769138,Europa=3.551181,Ganymede=7.154553,Callisto=16.689018)
for a,b in (('Venus','Mercury'),('Earth','Venus'),('Mars','Earth'),('Saturn','Jupiter'),('Europa','Io'),('Ganymede','Europa'),('Callisto','Ganymede')):
    r=P[a]/P[b]; print(a+'/'+b,'%.4f'%r,cf(r,5))
n=[360/P[k] for k in ('Io','Europa','Ganymede')]; print('Laplace n1-3n2+2n3 = %.5f ; n1-2n2 = %.4f ; n2-2n3 = %.4f'%(n[0]-3*n[1]+2*n[2], n[0]-2*n[1], n[1]-2*n[2]))
# 18.5 conjunction step and the 883 years
r=P['Saturn']/P['Jupiter']; al=1/(r-1); syn=P['Jupiter']*P['Saturn']/(P['Saturn']-P['Jupiter'])/365.25
print('J-S alpha %.4f'%al, cf(al,5), 'synodic yr %.2f'%syn, 'triangle turn per 3: %.2f deg'%((3*al-2)*360), 'years to turn 120: %.0f'%(120/abs((3*al-2)*360)*3*syn))
r=P['Earth']/P['Venus']; al=1/(r-1); print('V-E alpha %.4f'%al, cf(al,6))
# 18.3 sign mirror and harmonic form at m=80
m=80; idx=list(range(2,m+1))
C=np.array([[(gcd(a,b)-1)/math.sqrt((a-1)*(b-1)) for b in idx] for a in idx]); Ci=np.linalg.inv(C)
def Om(n):
    c=0;p=2
    while n>1:
        while n%p==0: n//=p; c+=1
        p+=1
    return c
def phi(n): return sum(1 for k in range(1,n+1) if gcd(k,n)==1)
def sqfree(n):
    p=2
    while p*p<=n:
        if n%(p*p)==0: return False
        p+=1
    return True
lam=np.array([(-1)**Om(a) for a in idx]); S=np.outer(lam,lam)*Ci
print('min entry of S C^-1 S: %.2e'%S.min())
F=np.array([[lam[i]*lam[j]*math.sqrt((a-1)*(b-1))*sum(1/phi(d) for d in range(1,m+1) if d%a==0 and d%b==0 and sqfree(d//a) and sqfree(d//b)) for j,b in enumerate(idx)] for i,a in enumerate(idx)])
print('formula vs inverse, max diff: %.2e'%abs(F-Ci).max())
T=np.array([[math.sqrt(phi(a)*phi(b))*sum(1/(n-1) for n in range(2,m+1) if n%a==0 and n%b==0) for b in idx] for a in idx])
print('eig(T) vs eig(C) max diff: %.2e'%abs(np.sort(np.linalg.eigvalsh(T))-np.sort(np.linalg.eigvalsh(C))).max())
# Table 18.2 first row
m=100; idx=range(2,m+1); C=np.array([[(gcd(a,b)-1)/math.sqrt((a-1)*(b-1)) for b in idx] for a in idx]); ev=np.linalg.eigvalsh(C)
print('m=100: lmax %.3f 1/lmin %.3f ratio %.3f'%(ev[-1],1/ev[0],1/ev[0]/ev[-1]))
# 18.4 Harper bands at 1/7 and 16/113: total width
def width(p,q):
    tot=0; E=[]
    for nu,k in ((0,0),(math.pi/q,math.pi/q)):
        pass
    # band edges from kx=0/pi, ky=0/pi Bloch matrices
    edges=[]
    for kx in (0,math.pi/q):
        for ky in (0,math.pi/q):
            H=np.zeros((q,q),complex)
            for j in range(q):
                H[j,j]=2*math.cos(2*math.pi*p*j/q+ky)
                H[j,(j+1)%q]+=np.exp(1j*kx*q) if j==q-1 else 1
                H[(j+1)%q,j]+=np.exp(-1j*kx*q) if j==q-1 else 1
            edges.append(np.linalg.eigvalsh(H))
    edges=np.array(edges); lo=edges.min(0); hi=edges.max(0); return (hi-lo).sum()
for p,q in ((1,7),(16,113),(8,13)): print('width %d/%d = %.4f'%(p,q,width(p,q)))
