"""Recompute every number quoted in the Chapter 18 draft and compare with the printed value.
Run:  python3 verify_ch18.py     (needs numpy, scipy; about a minute)"""
import math, numpy as np, scipy.sparse.linalg as sla
from math import gcd
from eig import sieve_phi_mu, build
from butterfly import bands, groups, hall
ok=0; bad=0
def check(name, got, want, tol):
    global ok,bad
    good = (got==want) if tol is None else abs(got-want)<=tol
    ok+=good; bad+=(not good)
    print(("  ok   " if good else "  FAIL ")+f"{name}: computed {got}, printed {want}")
def cf(x,n=6):
    out=[]
    for _ in range(n):
        a=math.floor(x); out.append(a); x-=a
        if x<1e-9: break
        x=1/x
    return out
def lock(x,Q=8):
    """smallest q^2*error among fractions with denominator <= Q, the same rule as resonance.py"""
    c=[]
    for q in range(1,Q+1):
        p=round(x*q); 
        if gcd(p,q)==1: c.append((q*q*abs(x-p/q),p,q))
    return min(c)
print("18.1 Kepler twice")
kC=8.9875517923e9; e=1.602176634e-19; me=9.1093837015e-31; hbar=1.054571817e-34
a0=hbar**2/(me*kC*e*e); T1=2*math.pi*math.sqrt(me*a0**3/(kC*e*e))
check("Bohr radius (1e-11 m)", round(a0*1e11,3), 5.292, None)
check("T1 (1e-16 s)", round(T1*1e16,3), 1.520, None)
check("electron T^2/r^3", round(T1**2/a0**3,5), 0.15588, None)
check("4 pi^2 m/(k e^2)", round(4*math.pi**2*me/(kC*e*e),5), 0.15588, None)
E=(365.256*86400)**2/(1.495978707e11)**3; S=4*math.pi**2/1.32712440018e20
check("Earth T^2/r^3 (1e-19)", round(E*1e19,4), 2.9747, None); check("4 pi^2/GM_sun (1e-19)", round(S*1e19,4), 2.9747, None)
check("ratio of the two constants (1e17)", round(T1**2/a0**3/E/1e17), 5, None)
n=1009; check("radius at n=1009 (micrometres)", round(a0*n*n*1e6), 54, None)
check("orbital period at n=1009 (1e-7 s)", round(T1*n**3*1e7,2), 1.56, None)
check("orbital frequency at n=1009 (MHz)", round(1/(T1*n**3)/1e6,2), 6.41, None)
R=me*(kC*e*e)**2/(2*hbar**2)/(2*math.pi*hbar)  # Rydberg frequency in Hz
f=R*(1/1009**2-1/1013**2); check("line 1013->1009 (MHz)", round(f/1e6,1), 25.5, None)
check("line / orbital frequency at n=1011", round(f*T1*1011**3,3), 4.000, None)
print("18.2 Resonance")
import periods as PER, check_numbers as CN
P=dict(PER.PLANET); P.update(PER.MOON)
T1s=[1.510826,2.421937,4.049219,6.101013,9.207540,12.352446,18.772866]; HD=PER.HD110067
rows=[("Venus","Mercury",(5,2),0.217,4),("Earth","Venus",(13,8),0.033,29),("Mars","Earth",(2,1),0.119,7),("Jupiter","Mars",(19,3),0.239,3),
 ("Saturn","Jupiter",(5,2),0.067,14),("Uranus","Saturn",(3,1),0.148,5),("Neptune","Uranus",(2,1),0.039,24),("Pluto","Neptune",(3,2),0.018,53),
 ("Europa","Io",(2,1),0.007,137),("Ganymede","Europa",(2,1),0.015,68),("Callisto","Ganymede",(7,3),0.006,160),
 ("Tethys","Mimas",(2,1),None,318),("Dione","Enceladus",(2,1),None,388),("Hyperion","Titan",(4,3),None,109)]
def after(x,p,q):
    """the continued-fraction term that follows the convergent p/q"""
    t=cf(x,8); h0,k0,h1,k1=1,0,t[0],1
    for i,a in enumerate(t[1:],1):
        if (h1,k1)==(p,q): return a
        h0,k0,h1,k1=h1,k1,a*h1+h0,a*k1+k0
    return None
def row(name,x,pq,err,term):
    e_,p,q=lock(x)
    check(f"{name} nearest", (p,q), pq, None)
    if err is not None: check(f"{name} q^2*error", round(e_,3), err, None)
    if term is not None: check(f"{name} next term", after(x,*pq), term, None)
for o,i,pq,err,term in rows: row(f"{o}/{i}",P[o]/P[i],pq,err,term)
for (nm,pq,err,term),x in zip([("c/b",(8,5),0.076,12),("d/c",(5,3),0.047,20),("e/d",(3,2),0.027,36),("f/e",(3,2),0.037,26),("g/f",(4,3),0.074,12),("h/g",(3,2),0.079,12)],[T1s[i+1]/T1s[i] for i in range(6)]):
    row("TRAPPIST-1 "+nm,x,pq,err,term)
for (nm,pq,err),x in zip([("c/b",(3,2),0.001),("d/c",(3,2),0.003),("e/d",(3,2),0.003),("f/e",(4,3),0.000),("g/f",(4,3),0.006)],[HD[i+1]/HD[i] for i in range(5)]):
    row("HD 110067 "+nm,x,pq,err,None); 
    if nm!="g/f": check("HD 110067 "+nm+" next term > 300", after(x,*pq)>300, True, None)
check("HD 110067 g/f next term", after(HD[5]/HD[4],4,3), 180, None)
check("HD 110067 largest next term over 3000", after(HD[4]/HD[3],4,3)>3000, True, None)
means=[("solar",[lock(P[o]/P[i])[0] for o,i,*_ in rows[:8]],0.110),("Jupiter moons",[lock(P[o]/P[i])[0] for o,i,*_ in rows[8:11]],0.009),
       ("TRAPPIST-1",[lock(T1s[i+1]/T1s[i])[0] for i in range(6)],0.057),("HD 110067",[lock(HD[i+1]/HD[i])[0] for i in range(5)],0.003)]
check("HD 110067 mean to four places",round(float(np.mean([lock(HD[i+1]/HD[i])[0] for i in range(5)])),4),0.0025,None)
rng=np.random.default_rng(1); sims=np.exp(rng.uniform(math.log(1.25),math.log(3),200000)); se=np.array([lock(x)[0] for x in sims[:60000]])
check("random ratios: mean q^2*error", round(se.mean(),2), 0.15, None)
for (nm,v,want),pw in zip(means,(0.14,0.0001,0.005,0.0001)):
    check(f"{nm} mean", round(float(np.mean(v)),3), want, None)
    k=len(v); sm=se[:(len(se)//k)*k].reshape(-1,k).mean(1); pv=(sm<=np.mean(v)).mean()
    print(f"         chance that {k} random ratios are this close: {pv:.4f} (printed {pw})")
n_=lambda b:360/P[b]
check("Laplace n1-3n2+2n3", round(n_("Io")-3*n_("Europa")+2*n_("Ganymede"),5), -0.00003, 2e-5)
check("n1-2n2", round(n_("Io")-2*n_("Europa"),4), 0.7395, None); check("n2-2n3", round(n_("Europa")-2*n_("Ganymede"),4), 0.7395, None)
check("TRAPPIST-1 turns per 2 of h", [round(2*T1s[-1]/t,2) for t in T1s[:-1]], [24.85,15.5,9.27,6.15,4.08,3.04], None)
check("HD 110067 turns per 9 of g", [round(9*HD[-1]/t) for t in HD], [54,36,24,16,12,9], None)
kw,aJf,aJk,mf=CN.kirkwood()
check("Kirkwood gaps from the period (AU)", [round(a,3) for _,a,_ in kw], [2.500,2.824,2.957,3.277], None)
check("Kirkwood gaps by scaling Jupiter's distance agree with the quoted set to 0.001", max(abs(b-w) for (_,_,b),w in zip(kw,[2.502,2.825,2.958,3.279]))<=0.001, True, None)
check("difference between the two (AU)", round(float(np.mean([b-a for _,a,b in kw])),4), 0.0015, 0.0002)
sat=CN.saturn(); check("Saturn: Kepler radius, with flattening, shortfall from 117,580 (km)",(round(sat[1],-1),round(sat[3],-1),117580-sat[3]<60),(116780,117530,True),None)
check("B ring edge further out by (per cent)",round((117580/sat[1]-1)*100,1),0.7,None)
gi=360/abs(5*PER.RATE["Saturn"]-2*PER.RATE["Jupiter"])*100; check("great inequality (years)",round(gi),883,None)
print("18.3 Mirror")
m=400; phi,mu=sieve_phi_mu(m)
C=np.array([[(gcd(a,b)-1)/math.sqrt((a-1)*(b-1)) for b in range(2,m+1)] for a in range(2,m+1)]); Ci=np.linalg.inv(C)
lio=np.ones(m+1,int)
for p in range(2,m+1):
    if phi[p]==p-1:
        pk=p
        while pk<=m: lio[pk::pk]*=-1; pk*=p
lam=lio[2:]; SCS=Ci*np.outer(lam,lam)
check("min entry of S C^-1 S at m=400 is zero to rounding", abs(SCS.min())<1e-12, True, None)
def N(a,b):
    l=a*b//gcd(a,b); return math.sqrt((a-1)*(b-1))*sum(1/phi[d] for d in range(l,m+1,l) if mu[d//a]!=0 and mu[d//b]!=0)
err=max(abs(SCS[a-2,b-2]-N(a,b)) for a in range(2,m+1,3) for b in range(2,m+1,5))
check("lcm formula matches the dense inverse", err<1e-12, True, None)
for p in (2,3,7):
    r=p**-0.5; n=300; K=np.array([[r**abs(i-j) for j in range(n)] for i in range(n)]); Ki=np.linalg.inv(K)
    off=np.abs(np.triu(Ki,2)).max(); ev=np.linalg.eigvalsh(K); M=(math.sqrt(p)+1)/(math.sqrt(p)-1); c=(p+1)/(p-1)
    check(f"p={p}: inverse tridiagonal", off<1e-10, True, None)
    check(f"p={p}: spectrum inside [1/M, M]", bool(ev[0]>1/M and ev[-1]<M), True, None)
    check(f"p={p}: mirror map swaps the ends (M -> 1/M)", round(M/(2*c*M-1)*M,10), 1.0, None)
    th=np.linspace(0,math.pi,7); Pk=lambda t:(1-r*r)/(1-2*r*np.cos(t)+r*r)
    check(f"p={p}: 1/P(t)+1/P(t+pi)=2c", bool(np.allclose(1/Pk(th)+1/Pk(th+math.pi),2*c)), True, None)
for m_,want in ((100,2.71),(1000,2.72),(10000,2.69),(100000,2.65)):
    phi,mu=sieve_phi_mu(m_); V,Vi=build(m_,phi,mu); a=np.arange(2,m_+1); D=1/np.sqrt(a-1.0); ph=phi[2:].astype(float); VT=V.T.tocsr(); ViT=Vi.T.tocsr()
    Co=sla.LinearOperator((m_-1,m_-1),matvec=lambda x: D*(V@(ph*(VT@(D*x)))),dtype=float)
    Cio=sla.LinearOperator((m_-1,m_-1),matvec=lambda x: (ViT@((Vi@(x/D))/ph))/D,dtype=float)
    l1,v1=sla.eigsh(Co,k=1,which='LA',tol=1e-10); l2,v2=sla.eigsh(Cio,k=1,which='LA',tol=1e-10)
    check(f"m={m_}: (1/lmin)/lmax", round(l2[0]/l1[0],2), want, None)
    if m_==10000:
        lio=np.ones(m_+1,int)
        for p in range(2,m_+1):
            if phi[p]==p-1:
                pk=p
                while pk<=m_: lio[pk::pk]*=-1; pk*=p
        t=v2[:,0]*lio[2:]; t*=np.sign(t.sum()); check("m=10000: bottom vector x Liouville >= 0 everywhere", bool((t>-1e-9).all()), True, None)
        check("m=10000: top vector has no negative entry", bool((v1[:,0]*np.sign(v1[:,0].sum())>-1e-9).all()), True, None)
print("18.4 Butterfly")
G=0.915965594177; check("32 G/pi", round(32*G/math.pi,2), 9.33, None)
tab=[(1,7,[1]*7,1.2845),(15,106,[15,15,15,16,15,15,15],0.0888),(16,113,[16,16,16,17,16,16,16],0.0825),(8,13,[5,3,5],0.7116),(13,21,[8,5,8],0.4438),
     (21,34,[13,8,13],0.2753),(12,29,[5,7,5,7,5],0.3216),(29,70,[12,17,12,17,12],0.1333),(51,71,[20,31,20],0.1314),(7,12,[2,3,2,3,2],0.7832),(31,53,[9,13,9,13,9],0.1760)]
for p,q,g,w in tab:
    lo,hi=bands(p,q); gg,big=groups(lo,hi,len(g)-1)
    check(f"{p}/{q} groups", gg, g, None); check(f"{p}/{q} total width", round(float((hi-lo).sum()),4), w, None)
lo,hi=bands(16,113); gg,big=groups(lo,hi,6); check("16/113 Hall integers", [hall(16,113,b+1) for b in big], [1,2,3,-3,-2,-1], None)
p,q=3,8; lo,hi=bands(p,q); allE=[]
for k1 in np.linspace(0,2*math.pi/q,25):
    for k2 in np.linspace(0,2*math.pi/q,25):
        H=np.zeros((q,q),complex)
        for m in range(q):
            H[m,m]+=2*math.cos(2*math.pi*p*m/q+k2); H[m,(m+1)%q]+=np.exp(1j*k1); H[(m+1)%q,m]+=np.exp(-1j*k1)
        allE.append(np.linalg.eigvalsh(H))
A=np.array(allE); check("band edges agree with a brute-force scan (3/8)", bool(max(np.abs(A.min(0)-lo).max(),np.abs(A.max(0)-hi).max())<1e-9), True, None)
print("18.3 continued: the harmonic form and the ratio of the two ends")
import os, sys, subprocess
here=os.path.dirname(os.path.abspath(__file__))
if not os.path.exists(os.path.join(here,"tr.so")): subprocess.check_call(["gcc","-O3","-shared","-fPIC","-o",os.path.join(here,"tr.so"),os.path.join(here,"tr.c")])
from fast import extremes, Setup
from ratio import smooth, median_index
m=200; phi,mu=sieve_phi_mu(m); lcm=lambda a,b:a*b//gcd(a,b)
C=np.array([[(gcd(a,b)-1)/math.sqrt((a-1)*(b-1)) for b in range(2,m+1)] for a in range(2,m+1)])
T=np.array([[math.sqrt(phi[a]*phi[b])*sum(1/(n-1) for n in range(lcm(a,b),m+1,lcm(a,b))) for b in range(2,m+1)] for a in range(2,m+1)])
check("harmonic form: T_m has the eigenvalues of C_m (m=200)", bool(np.allclose(np.linalg.eigvalsh(T),np.linalg.eigvalsh(C))), True, None)
Hn=np.concatenate([[0],np.cumsum(1/np.arange(1,m+1))])
Gm=np.array([[gcd(a,b)/math.sqrt(a*b) for b in range(1,m+1)] for a in range(1,m+1)])
TG=np.array([[math.sqrt(phi[a]*phi[b])/lcm(a,b)*Hn[m//lcm(a,b)] for b in range(1,m+1)] for a in range(1,m+1)])
check("harmonic form for the gcd matrix (m=200)", bool(np.allclose(np.linalg.eigvalsh(TG),np.linalg.eigvalsh(Gm))), True, None)
tab={10**2:(8.096,21.967,2.713,2.515),10**3:(18.773,50.976,2.715,2.550),10**4:(36.429,97.857,2.686,2.570),10**5:(63.078,167.104,2.649,2.572),
     10**6:(101.252,265.276,2.620,2.570),10**7:(154.040,400.477,2.600,2.568)}
if "--big" in sys.argv: tab[3*10**7]=(185.434,480.554,2.592,2.565)
gap={}
for m_,(c0,d0,rc,rg) in tab.items():
    kw=dict(tol=1e-10,ncv=6) if m_>10**7 else dict(tol=1e-11)
    c,d=extremes(m_,"C",**kw); a,b=extremes(m_,"G",**kw); gap[m_]=d/c-b/a
    check(f"m={m_}: lmax(C)",round(c,3),c0,None); check(f"m={m_}: 1/lmin(C)",round(d,3),d0,None)
    check(f"m={m_}: ratio C",round(d/c,3),rc,None); check(f"m={m_}: ratio G",round(b/a,3),rg,None)
check("differences between the two ratios",[round(gap[k],3) for k in (10**3,10**4,10**5,10**6,10**7)],[0.165,0.117,0.077,0.050,0.032],None)
S=Setup(10**7,"G")
for y,(n0,a0_,b0,r0) in {2:(24,5.335,5.805,1.088),3:(190,15.735,21.056,1.338),5:(768,29.841,50.513,1.693),7:(2155,45.430,94.498,2.080),13:(8289,69.097,175.848,2.545),
                         29:(37627,96.862,261.104,2.696),97:(269882,127.264,338.751,2.662),997:(2028358,150.352,391.162,2.602)}.items():
    n,a,b=smooth(S,y); check(f"primes up to {y} (m=10^7)",(n,round(a,3),round(b,3),round(b/a,3)),(n0,a0_,b0,r0),None)
check("ceilings",[round(float(np.prod([(math.sqrt(p)+1)/(math.sqrt(p)-1) for p in (2,3,5,7,11,13)[:k]])),1) for k in (1,2,3,4,6)],[5.8,21.8,56.9,126.2,415.5],None)
for m_,want in ((10**4,1.200),(10**6,1.117)):
    n,a,b=smooth(Setup(m_,"G"),2); check(f"powers of 2 only, m={m_}",round(b/a,3),want,None)
l1,l2,v1,v2,S6=extremes(10**6,"G",tol=1e-11,vectors=True)
check("median index of the top vector (m=10^6)",median_index(v1,1),47376,None); check("median index of the bottom vector",median_index(v2,1),598,None)
for n_ in (6,30,210,2310):
    ds=[d for d in range(1,n_+1) if n_%d==0]; Gd=np.array([[gcd(a,b)/math.sqrt(a*b) for b in ds] for a in ds]); e_=np.linalg.eigvalsh(Gd)
    check(f"divisors of {n_}: ratio = n/phi(n)", round(1/(e_[0]*e_[-1]),6), round(n_/float(phi[n_]) if n_<=200 else n_/float(sieve_phi_mu(n_)[0][n_]),6), None)
for p in (2,3,5):
    r=p**-0.5
    for k in (2,3):
        K=np.array([[r**abs(i-j) for j in range(k)] for i in range(k)]); e_=np.linalg.eigvalsh(K); check(f"p={p}, {k} levels: ratio = p/(p-1)", round(1/(e_[0]*e_[-1]),9), round(p/(p-1),9), None)
print("18.5 Kepler")
from kepler import cf as kcf, convergents, D, YEAR, ecc, kep, cents
def step(i,o): return (1/(D[o]/D[i]-1))%1, D[i]*D[o]/(D[o]-D[i])/YEAR
al,syn=step("Jupiter","Saturn"); check("Jupiter-Saturn step and expansion",(round(al,4),kcf(al,5)),(0.6742,[0,1,2,14,2]),None)
check("trigon: years, turn, rounds, years",(round(3*syn,1),round((3*al-2)*360,1),round(1/(9*abs(al-2/3)),1),round(3*syn/(9*abs(al-2/3)))),(59.6,8.1,14.8,883),None)
check("trigon turn = great inequality",abs(3*syn/(9*abs(al-2/3))*YEAR/36525*100-gi)<0.01,True,None)
check("40 and 43 conjunctions (years)",(round(40*syn,1),round(43*syn,1)),(794.4,853.9),None)
check("27/40 is intermediate, 29/43 a convergent",((27,40) in convergents(kcf(al,6)),(29,43) in convergents(kcf(al,6)),(1+2*13,1+3*13)),(False,True,(27,40)),None)
fs=PER.FACT_SHEET; alf=(1/(fs["Saturn"]/fs["Jupiter"]-1))%1; synf=fs["Jupiter"]*fs["Saturn"]/(fs["Saturn"]-fs["Jupiter"])/YEAR
check("with the present-orbit periods: term and turn",(kcf(alf,4)[3],round(3*synf/(9*abs(alf-2/3)))),(13,842),None)
al,syn=step("Venus","Earth"); check("Venus-Earth step and expansion",(round(al,4),kcf(al,6)),(0.5987,[0,1,1,2,29,2]),None)
check("pentagram: years, turn, rounds",(round(5*syn,2),round(abs(5*al-3)*360,1),round(1/(25*abs(al-3/5)),1)),(7.99,2.4,29.9),None)
check("147 and 152 conjunctions (years); 88/147 a convergent, 91/152 = (3+88)/(5+147)",(round(147*syn,1),round(152*syn,2),(88,147) in convergents(kcf(al,7)),(91,152) in convergents(kcf(al,7))),(235.0,243.00,True,False),None)
al,syn=step("Earth","Mars"); check("Mars",(round(al,4),kcf(al,6),[round(q*syn,2) for q in (7,15,22,37)]),(0.1353,[0,7,2,1,1,3],[14.95,32.03,46.98,79.01]),None)
al,syn=step("Earth","Jupiter"); check("Jupiter",(round(al,4),kcf(al,5),[round(q*syn,2) for q in (11,76,65)]),(0.0921,[0,10,1,6,4],[12.01,83.00,70.99]),None)
al,syn=step("Earth","Saturn"); check("Saturn",(round(al,4),kcf(al,4),[round(q*syn,2) for q in (28,57)]),(0.0351,[0,28,2,5],[28.98,59.00]),None)
al,syn=step("Mercury","Earth"); check("Mercury",(round(al,4),kcf(al,7),[round(q*syn,2) for q in (22,41,104,145)]),(0.3172,[0,3,6,1,1,2,1],[6.98,13.01,32.99,46.00]),None)
for i,o in (("Io","Europa"),("Europa","Ganymede")):
    a_=(1/(D[o]/D[i]-1))%1; s_=D[i]*D[o]/(D[o]-D[i]); check(f"{i}-{o}: conjunction line (deg/day)",round((a_-1)*360/s_,4),-0.7395,None)
check("once round (days)",round(360/0.7395),487,None)
alJS=(1/(D["Saturn"]/D["Jupiter"]-1))%1
for N in (3,10,43,100,1000):
    pts=np.sort((np.arange(N)*alJS)%1); gaps=np.round(np.diff(np.concatenate([pts,[pts[0]+1]])),9); check(f"three gaps, N={N}",len(set(gaps))<=3,True,None)
import harmonies as H
tabH=dict(Saturn=(32,7,-2,0.0555),Jupiter=(32,16,21,0.0485),Mars=(-60,-56,-53,0.0934),Earth=(13,5,4,0.0167),Venus=(-21,-22,-24,0.0068),Mercury=(-43,-72,-71,0.2056))
cols=[[],[],[]]
for pl,(p_,q_) in H.single.items():
    tgt=H.cents(p_/q_); mk=H.cents(H.K[pl][1]/H.K[pl][0])-tgt; m16=H.cents(H.ratio_of(H.ecc(pl,1600)))-tgt; m20=H.cents(H.ratio_of(H.ecc(pl,2000)))-tgt
    for c_,x in zip(cols,(mk,m16,m20)): c_.append(abs(x))
    check(f"{pl}: misses (his figures, 1600, 2000)",[abs(mk-tabH[pl][0])<0.75,abs(m16-tabH[pl][1])<0.75,abs(m20-tabH[pl][2])<0.75],[True,True,True],None)
    check(f"{pl}: e in 2000",round(H.ecc(pl,2000),4),tabH[pl][3],None)
check("mean misses",[round(float(np.mean(c_))) for c_ in cols],[33,30,29],None)
for c_,want in zip(cols,(0.22,0.15,0.14)):
    pv,rm=H.p_single(c_); check("chance of doing as well (within 0.02)",abs(pv-want)<0.02,True,None)
check("random mean miss, single planets",round(rm),47,None)
check("Saturn: drift (cents per century) and the 1800-2050 fit",(round(H.cents(H.ratio_of(H.ecc("Saturn",2100)))-H.cents(H.ratio_of(H.ecc("Saturn",2000))),1),round(H.cents(H.ratio_of(H.T1e["Saturn"]))-H.cents(5/4))),(-2.2,-13),None)
check("Saturn's slowest motion in 1600 (arcsec)",round(H.speeds("Saturn",1600)[0]),108,None)
check("Kepler's Mercury e, true e",(round(H.e_for(H.K["Mercury"][1]/H.K["Mercury"][0]),4),round(H.ecc("Mercury",1600),4)),(0.2095,0.2056),None)
dev=max(abs(H.K[pl][i]/H.speeds(pl,1600)[i]-1) for pl in ("Mars","Earth","Venus") for i in (0,1)); check("Mars, Earth, Venus speeds within a quarter of a per cent",dev<0.0025,True,None)
check("Earth: 16:15 exact in year; top of range in cents",(round(2000+100*(H.e_for(16/15)-H.T2["Earth"][0])/H.T2["Earth"][1],-2),round(H.cents(H.ratio_of(0.0679)))),(3600,471),None)
c2=[]
for o,wo,i,wi,p_,q_,kind in H.pairs:
    so=H.speeds(o,2000)[0 if wo=="a" else 1]; si=H.speeds(i,2000)[0 if wi=="a" else 1]; c2.append(abs(H.cents(so/si)-H.cents(p_/q_)))
check("ten two-planet intervals: mean, converging, diverging",(round(float(np.mean(c2))),round(float(np.mean(c2[1::2]))),round(float(np.mean(c2[0::2])))),(33,23,42),None)
pv,rm=H.p_pairs(c2); check("chance (within 0.01) and random mean",(abs(pv-0.03)<0.01,round(rm)),(True,57),None)
check("Mars-Earth converging fifth (cents)",round(c2[5]),2,None)
import itertools
pls=list(H.single); nn={p_:H.T2[p_][2]*3600/36525 for p_ in pls}
def stat(es):
    sp={p_:(nn[p_]*math.sqrt(1-e_*e_)/(1+e_)**2,nn[p_]*math.sqrt(1-e_*e_)/(1-e_)**2) for p_,e_ in zip(pls,es)}
    return np.mean([H.near_cons(H.cents(sp[o][0 if wo=="a" else 1]/sp[i][0 if wi=="a" else 1])) for o,wo,i,wi,*_ in H.pairs])
es=[H.ecc(p_,2000) for p_ in pls]; act=stat(es); res=np.array([stat(pm) for pm in itertools.permutations(es)])
check("reshuffled eccentricities: share doing as well",round(float((res<=act+1e-9).mean()),3),0.015,None)
extra=[]
for o,i in (("Saturn","Uranus"),("Uranus","Neptune")):
    so=H.speeds(o,2000); si=H.speeds(i,2000); extra+=[H.near_cons(H.cents(si[0]/so[1])),H.near_cons(H.cents(si[1]/so[0]))]
check("four new intervals",[round(x) for x in extra],[86,55,154,90],None)
pv,rm=H.p_pairs(c2+extra); check("fourteen: mean and chance (within 0.02)",(round(float(np.mean(c2+extra))),abs(pv-0.29)<0.02),(51,True),None)
later=dict(Uranus=H.ecc("Uranus",2000),Neptune=H.ecc("Neptune",2000),Ceres=0.0785,Pluto=0.2488); got=[]
for pl,e_ in later.items(): c_=H.cents(H.ratio_of(e_)); got.append(round(abs(float(np.abs(H.menu16-c_).min()))))
check("Uranus, Neptune, Ceres, Pluto: miss from the nearest interval",got,[9,9,47,62],None)
check("pi/sqrt(18)",round(math.pi/math.sqrt(18),4),0.7405,None)
hb=1.054571817e-34; check("hbar/(2 m_e) (1e-5 m^2/s)",round(hb/(2*me)*1e5,2),5.79,None)
check("Earth's areal rate (1e15 m^2/s)",round(0.5*1.495978707e11**2*2*math.pi/(YEAR*86400)/1e15,1),2.2,None)
print(f"\n{ok} checks passed, {bad} failed")
