"""Kepler's harmonies, then and now.  Kepler's own figures (Harmonices Mundi V.4, Wallis translation),
the mean orbits of 1600 and 2000 (JPL, Standish & Williams, Table 2a, valid 3000 BC - 3000 AD), and the bodies found later."""
import math, numpy as np
cents=lambda x:1200*math.log2(x)
# Kepler's printed apparent daily motions seen from the Sun (arcseconds): aphelion, perihelion
K=dict(Saturn=(106,135),Jupiter=(270,330),Mars=(26*60+14,38*60+1),Earth=(57*60+3,61*60+18),Venus=(94*60+50,97*60+37),Mercury=(164*60,384*60))
single=dict(Saturn=(5,4),Jupiter=(6,5),Mars=(3,2),Earth=(16,15),Venus=(25,24),Mercury=(12,5))
# his ten intervals between neighbours: (outer, which, inner, which, p, q) meaning outer/inner = p/q ; 'a' aphelion, 'p' perihelion
pairs=[("Saturn","a","Jupiter","p",1,3,"diverging"),("Saturn","p","Jupiter","a",1,2,"converging"),
       ("Jupiter","a","Mars","p",1,8,"diverging"),("Jupiter","p","Mars","a",5,24,"converging"),
       ("Mars","a","Earth","p",5,12,"diverging"),("Mars","p","Earth","a",2,3,"converging"),
       ("Earth","a","Venus","p",3,5,"diverging"),("Earth","p","Venus","a",5,8,"converging"),
       ("Venus","a","Mercury","p",1,4,"diverging"),("Venus","p","Mercury","a",3,5,"converging")]
# JPL Table 2a: e at J2000, rate per century, mean-longitude rate (deg per century)
T2=dict(Mercury=(0.20563661,0.00002123,149472.67486623),Venus=(0.00676399,-0.00005107,58517.81560260),Earth=(0.01673163,-0.00003661,35999.37306329),
        Mars=(0.09336511,0.00009149,19140.29934243),Jupiter=(0.04853590,0.00018026,3034.90371757),Saturn=(0.05550825,-0.00032044,1222.11494724),
        Uranus=(0.04685740,-0.00001550,428.49512595),Neptune=(0.00895439,0.00000818,218.46515314))
T1e=dict(Mercury=0.20563593,Venus=0.00677672,Earth=0.01671123,Mars=0.09339410,Jupiter=0.04838624,Saturn=0.05386179,Uranus=0.04725744,Neptune=0.00859048)  # Table 1, 1800-2050
def ecc(pl,year): e0,de,_=T2[pl]; return e0+de*(year-2000)/100
def speeds(pl,year):
    e=ecc(pl,year); n=T2[pl][2]*3600/36525; f=math.sqrt(1-e*e); return n*f/(1+e)**2, n*f/(1-e)**2   # arcsec/day at aphelion, perihelion
def ratio_of(e): return ((1+e)/(1-e))**2
def e_for(R): s=math.sqrt(R); return (s-1)/(s+1)
menu16=np.array(sorted(cents(p/q) for p,q in [(1,1),(25,24),(16,15),(10,9),(9,8),(6,5),(5,4),(4,3),(3,2),(8,5),(5,3),(2,1),(12,5),(5,2),(8,3),(3,1)]))
cons=np.array([0,cents(6/5),cents(5/4),cents(4/3),cents(3/2),cents(8/5),cents(5/3),1200.0])   # Kepler's seven consonances, within one octave
def near_cons(c): return float(np.abs(cons-(c%1200)).min())
rng=np.random.default_rng(11)
def p_single(devs):
    sim=np.abs(rng.uniform(0,menu16.max()+50,(200000,len(devs)))[:,:,None]-menu16[None,None,:]).min(2).mean(1); return float((sim<=np.mean(devs)).mean()),float(sim.mean())
def p_pairs(devs):
    sim=np.abs(rng.uniform(0,1200,(200000,len(devs)))[:,:,None]-cons[None,None,:]).min(2).mean(1); return float((sim<=np.mean(devs)).mean()),float(sim.mean())
if __name__=="__main__":
    print("1. One planet at a time: fastest/slowest angular speed, miss from Kepler's interval (cents)")
    print("   planet    Kepler's interval | his own figures: ratio miss (e implied) | orbit of 1600: e, miss | orbit of 2000: e, miss | 1800-2050 fit: miss | drift cents/century")
    cols={"kepler":[], "1600":[], "2000":[], "t1":[]}
    for pl,(p,q) in single.items():
        tgt=cents(p/q); a,pe=K[pl]; rk=pe/a; mk=cents(rk)-tgt
        m16=cents(ratio_of(ecc(pl,1600)))-tgt; m20=cents(ratio_of(ecc(pl,2000)))-tgt; mt1=cents(ratio_of(T1e[pl]))-tgt
        drift=cents(ratio_of(ecc(pl,2100)))-cents(ratio_of(ecc(pl,2000)))
        for k,v in zip(cols,(mk,m16,m20,mt1)): cols[k].append(abs(v))
        e_ex=e_for(p/q); yr=2000+100*(e_ex-T2[pl][0])/T2[pl][1]
        print(f"   {pl:8s} {p}:{q:<3} | {rk:.4f} {mk:+6.1f} (e={e_for(rk):.4f}) | {ecc(pl,1600):.5f} {m16:+6.1f} | {ecc(pl,2000):.5f} {m20:+6.1f} | {mt1:+6.1f} | {drift:+.2f} | exact when e={e_ex:.5f}: year {yr:,.0f}")
    for k,v in cols.items():
        pv,rm=p_single(v); print(f"   {k:>6}: mean miss {np.mean(v):.1f} cents; random {rm:.1f}; chance of doing as well {pv:.2f}")
    print("\n2. Kepler's printed speeds against the orbit of 1600 (arcseconds per day): aphelion, perihelion")
    for pl in single: a,pe=speeds(pl,1600); print(f"   {pl:8s} Kepler {K[pl][0]:>6} {K[pl][1]:>6} | orbit of 1600 {a:8.1f} {pe:8.1f}")
    print("\n3. Two planets at a time (his ten intervals): miss in cents from his interval")
    c2={"kepler":[], "1600":[], "2000":[]}
    for o,wo,i,wi,p,q,kind in pairs:
        tgt=cents(p/q); out=[]
        for key in c2:
            if key=="kepler": so=K[o][0 if wo=="a" else 1]; si=K[i][0 if wi=="a" else 1]
            else: so=speeds(o,int(key))[0 if wo=="a" else 1]; si=speeds(i,int(key))[0 if wi=="a" else 1]
            m=cents(so/si)-tgt; out.append(m); c2[key].append(abs(m))
        print(f"   {o}-{i} {kind:10s} {p}:{q:<3} Kepler {out[0]:+6.1f} | 1600 {out[1]:+6.1f} | 2000 {out[2]:+6.1f}")
    for k,v in c2.items():
        pv,rm=p_pairs(v); print(f"   {k:>6}: mean miss {np.mean(v):.1f} cents; random interval to nearest consonance {rm:.1f}; chance {pv:.3f};  converging only: {np.mean(v[1::2]):.1f}, diverging only: {np.mean(v[0::2]):.1f}")
    pv,rm=p_pairs(c2["2000"][1::2]); print(f"   five converging intervals, 2000: chance {pv:.3f}")
    print("\n4. Bodies found after Kepler")
    later=dict(Uranus=ecc("Uranus",2000),Neptune=ecc("Neptune",2000),Ceres=0.0785,Pluto=0.2488)
    for pl,e in later.items():
        c=cents(ratio_of(e)); j=int(np.abs(menu16-c).argmin()); print(f"   {pl:8s} e={e:.4f}: ratio {ratio_of(e):.4f} = {c:.0f} cents; nearest of the sixteen intervals at {menu16[j]:.0f} cents, miss {c-menu16[j]:+.0f}")
    for o,i in (("Saturn","Uranus"),("Uranus","Neptune")):
        so=speeds(o,2000); si=speeds(i,2000)
        for kind,x in (("diverging",si[0]/so[1]),("converging",si[1]/so[0])): print(f"   {i}/{o} {kind}: ratio {x:.4f}; octave-reduced {cents(x)%1200:.0f} cents; nearest consonance misses by {near_cons(cents(x)):.0f}")
    print("\n5. The Earth's interval over the long run: e from 0 to 0.0679 gives 0 to %.0f cents (a fourth is 498)"%cents(ratio_of(0.0679)))
