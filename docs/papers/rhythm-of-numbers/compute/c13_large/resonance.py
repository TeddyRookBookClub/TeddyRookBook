"""Resonance as rhythm: continued fractions of orbital period ratios."""
from periods import PLANET, HD110067
import math, json, numpy as np
def cf(x,n=5):
    out=[]
    for _ in range(n):
        a=math.floor(x+1e-12); out.append(a); x-=a
        if x<1e-7: break
        x=1/x
    return out
def best(r,qmax=8):
    b=None
    for q in range(1,qmax+1):
        p=round(r*q); e=q*q*abs(r-p/q)
        if b is None or e<b[0]-1e-12: b=(e,p,q)
    return b
def lock_term(r,p,q):
    # the partial quotient that follows the convergent p/q in the expansion of r (large = close)
    t=cf(r,8); p0,q0,p1,q1=1,0,t[0],1
    for i,a in enumerate(t[1:],1):
        if (p1,q1)==(p,q): return a
        p0,q0,p1,q1=p1,q1,a*p1+p0,a*q1+q0
    return None
systems={
 "Solar system (long-term mean periods, days)":[(k,PLANET[k]) for k in ("Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto")],
 "Jupiter's large moons":[("Io",1.769138),("Europa",3.551181),("Ganymede",7.154553),("Callisto",16.689017)],
 "TRAPPIST-1":[("b",1.510826),("c",2.421937),("d",4.049219),("e",6.101013),("f",9.207540),("g",12.352446),("h",18.772866)],
 "HD 110067":list(zip("bcdefg",HD110067)),
}
pairs_extra=[("Saturn: Tethys/Mimas",1.887802/0.9424218),("Saturn: Dione/Enceladus",2.736915/1.370218),("Saturn: Hyperion/Titan",21.276609/15.945421)]
rng=np.random.default_rng(0)
def rand_stat(k,trials=40000):
    return np.array([np.mean([best(r)[0] for r in np.exp(rng.uniform(math.log(1.25),math.log(3.0),k))]) for _ in range(trials)])
out={}
for name,bodies in systems.items():
    print("\n"+name); rows=[]
    for (a,pa),(b,pb) in zip(bodies,bodies[1:]):
        r=pb/pa; e,p,q=best(r); lt=lock_term(r,p,q)
        rows.append(dict(pair=f"{b}/{a}",ratio=round(r,4),cf=cf(r,4),frac=f"{p}/{q}",q2err=round(e,3),lock=lt))
        print(f"  {b}/{a}: {r:.4f} = {cf(r,4)}  -> {p}/{q}; q^2*error {e:.3f}; term after {p}/{q}: {lt}")
    obs=np.mean([best(pb/pa)[0] for (_,pa),(_,pb) in zip(bodies,bodies[1:])]); sim=rand_stat(len(rows))  # unrounded errors
    pv=(sim<=obs).mean(); print(f"  mean q^2*error {obs:.3f}; random ratios {sim.mean():.3f}; P(random at least as close) = {pv:.4f}")
    out[name]=dict(rows=rows,mean=obs,p=float(pv))
print()
for n,r in pairs_extra:
    e,p,q=best(r); print(f"  {n}: {r:.4f} = {cf(r,4)} -> {p}/{q}; q^2*error {e:.3f}; term after: {lock_term(r,p,q)}")
# Laplace relation for Io, Europa, Ganymede (mean motions in degrees per day)
n=[360/x for x in (1.769138,3.551181,7.154553)]
print(f"\nLaplace relation n_Io - 3 n_Europa + 2 n_Ganymede = {n[0]-3*n[1]+2*n[2]:.5f} deg/day (n_Io = {n[0]:.3f})")
print(f"   n_Io - 2 n_Europa = {n[0]-2*n[1]:.4f}, n_Europa - 2 n_Ganymede = {n[1]-2*n[2]:.4f} deg/day (equal: the two near-misses drift together)")
# TRAPPIST-1 bar: orbits completed while h makes 2
P=[x for _,x in systems["TRAPPIST-1"]]; print("TRAPPIST-1: orbits per 2 orbits of h:",[round(2*P[-1]/x,2) for x in P])
P=[x for _,x in systems["HD 110067"]]; print("HD 110067: orbits per 3 orbits of g:",[round(3*P[-1]/x,2) for x in P])
# Kirkwood gaps and the Cassini division from Kepler's third law
TJ=PLANET['Jupiter']/PLANET['Earth']  # Jupiter's period in years; a small body with period T years orbits at T^(2/3) AU
print("\nKirkwood gaps (AU):",{f"{p}:{q}":round((TJ*q/p)**(2/3),3) for p,q in ((3,1),(5,2),(7,3),(2,1))})
print("Cassini division, 2:1 with Mimas (km):",round(185520*(0.5)**(2/3)))
json.dump(out,open("resonance.json","w"),indent=1)
# Kepler in the atom
h=6.62607015e-34; hbar=h/(2*math.pi); me=9.1093837e-31; e=1.602176634e-19; k=8.9875517923e9; a0=hbar**2/(me*k*e**2)
T1=2*math.pi*math.sqrt(me*a0**3/(k*e**2)); print(f"\nBohr: a0 = {a0:.4e} m, T1 = {T1:.4e} s; T^2/r^3 = {T1**2/a0**3:.4e} = 4 pi^2 m/(k e^2) = {4*math.pi**2*me/(k*e**2):.4e}")
for nq in (1,2,100,1009):
    print(f"   n={nq}: radius {a0*nq**2:.3e} m, orbital period {T1*nq**3:.3e} s, orbital frequency {1/(T1*nq**3):.4e} Hz")
R=3.2898419603e15
f=R*(1/1009**2-1/1013**2); print(f"   transition n=1013 -> 1009 (delta n = 4): {f/1e6:.2f} MHz = {f*T1*1011**3:.3f} x orbital frequency at n=1011")
GM_SUN=1.32712440018e20  # m^3/s^2, the measured product (better known than G or M alone)
print("   solar system: T^2/a^3 for Earth (s^2/m^3) = %.5e ; 4pi^2/(GM_sun) = %.5e" % ((365.256*86400)**2/(1.495978707e11)**3, 4*math.pi**2/GM_SUN))
