"""Kepler, continued: (1) conjunction figures read with continued fractions, (2) his planetary harmonies tested
with modern eccentricities, (3) his second law in Bohr's atom."""
import math, numpy as np
def cf(x,n=7):
    out=[]
    for _ in range(n):
        a=math.floor(x); out.append(a); x-=a
        if x<1e-10: break
        x=1/x
    return out
def convergents(t):
    p0,q0,p1,q1=1,0,t[0],1; out=[(p1,q1)]
    for a in t[1:]:
        p0,q0,p1,q1=p1,q1,a*p1+p0,a*q1+q0; out.append((p1,q1))
    return out
from periods import PLANET, MOON
D=dict(PLANET); D.update(MOON)     # planets: long-term mean periods (JPL); moons: NASA fact sheets
YEAR=365.25
def figure(inner,outer,unit="yr"):
    T1,T2=D[inner],D[outer]; r=T2/T1; syn=T1*T2/(T2-T1); adv=1/(r-1); al=adv%1.0
    t=cf(al,7); cs=convergents(t)
    u=YEAR if unit=="yr" else 1.0
    print(f"\n{inner}-{outer}: period ratio {r:.5f}; meetings every {syn/u:.4f} {unit}; each one {al*360:.2f} deg further on ({al:.6f} turn) = {t}")
    for i,(p,q) in enumerate(cs[1:6],1):
        if q<2 or i+1>=len(t): continue
        a=t[i+1]; d=q*al-p; reps=1/(q*q*abs(al-p/q))
        print(f"   {p}/{q}: every {q} meetings ({q*syn/u:.2f} {unit}) the pattern nearly closes, turned by {d*360:+.2f} deg; next term {a}; "
              f"turns one point-spacing after {reps:.2f} rounds = {reps*q*syn/u:.1f} {unit}")
    return al,t
ecc=dict(Saturn=0.05386179,Jupiter=0.04838624,Mars=0.09339410,Earth=0.01671123,Venus=0.00677672,Mercury=0.20563593)  # JPL mean elements, J2000
kep=dict(Saturn=(5,4,"major third"),Jupiter=(6,5,"minor third"),Mars=(3,2,"fifth"),Earth=(16,15,"semitone"),Venus=(25,24,"diesis"),Mercury=(12,5,"octave + minor third"))
cents=lambda x:1200*math.log2(x)
menu=[(1,1),(25,24),(16,15),(10,9),(9,8),(6,5),(5,4),(4,3),(3,2),(8,5),(5,3),(2,1),(12,5),(5,2),(8,3),(3,1)]   # Kepler's melodic and consonant intervals, to a twelfth
mc=np.array(sorted(cents(p/q) for p,q in menu))
if __name__=="__main__":
    print("=== 1. Conjunction figures ===")
    for a,b in (("Jupiter","Saturn"),("Venus","Earth"),("Earth","Mars"),("Earth","Jupiter"),("Earth","Saturn"),("Mercury","Earth")): figure(a,b)
    for a,b in (("Io","Europa"),("Europa","Ganymede")):
        al,t=figure(a,b,"d"); T1,T2=D[a],D[b]; syn=T1*T2/(T2-T1)
        print(f"   the line of conjunctions turns {(al-1)*360/syn:+.4f} deg per day")
    # three-gap check for Jupiter-Saturn conjunction longitudes
    al=1/(D["Saturn"]/D["Jupiter"]-1)%1
    for N in (3,10,40,43,100):
        pts=np.sort((np.arange(N)*al)%1); gaps=np.round(np.diff(np.concatenate([pts,[pts[0]+1]]))*360,6)
        print(f"   Jupiter-Saturn, first {N} conjunctions: distinct arc lengths (deg) {sorted(set(gaps))}")
    print("\n=== 2. Kepler's harmonies (Harmonices Mundi V), tested ===")
    devs=[]
    for pl,e in ecc.items():
        x=((1+e)/(1-e))**2; p,q,name=kep[pl]; dk=cents(x)-cents(p/q); dn=float(np.abs(mc-cents(x)).min()); devs.append(abs(dk))
        print(f"   {pl:8s} e={e:.4f}: fastest/slowest angular speed = {x:.4f} = {cents(x):6.1f} cents; Kepler: {p}:{q} ({name}, {cents(p/q):.1f}); off by {dk:+.1f} cents; nearest interval on the menu {dn:.1f} cents away")
    obs=float(np.mean(devs)); rng=np.random.default_rng(7)
    sim=np.abs(rng.uniform(0,mc.max()+50,(200000,6))[:,:,None]-mc[None,None,:]).min(2).mean(1)
    print(f"   mean distance from Kepler's own choices: {obs:.1f} cents; six random ratios vs the menu: mean {sim.mean():.1f} cents; chance of doing as well: {(sim<=obs).mean():.2f}")
    print("\n=== 3. Kepler's second law in Bohr's atom ===")
    hbar=1.054571817e-34; me=9.1093837015e-31
    print(f"   area swept per second in orbit n = n x hbar/(2 m_e) = n x {hbar/(2*me):.4e} m^2/s")
    print(f"   Earth sweeps {0.5*1.495978707e11**2*2*math.pi/(YEAR*86400):.3e} m^2/s")
    print("   Sommerfeld's ellipses: minor/major axis = k/n; eccentricities:",{f"{k}/{n}":round(math.sqrt(1-(k/n)**2),4) for n in (2,3,4) for k in range(1,n)})
    print("   planets: minor/major axis =",{p:round(math.sqrt(1-e*e),5) for p,e in ecc.items()})
    print("\n=== 4. Kepler's constants as continued fractions ===")
    for name,x in (("golden ratio",(1+5**.5)/2),("sphere packing pi/sqrt(18)",math.pi/math.sqrt(18)),("3/2 power: fifth in distance (3/2)^(2/3)",1.5**(2/3)),("octave in distance 2^(2/3)",2**(2/3))):
        print(f"   {name}: {x:.6f} = {cf(x,9)}")
