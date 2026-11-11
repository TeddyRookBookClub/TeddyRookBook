"""Long-period terms in the mean longitudes of the planets, from the N-body run (nbody.c).
For each planet: remove the mean motion, then repeatedly find the strongest line with period above PMIN years, fit it
by least squares (frequency refined on a fine grid), subtract it and record it.  Each line is then matched to a
combination k1 n_a - k2 n_b of two measured mean motions."""
import numpy as np, sys, math, json
NAMES=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune']
def load(fn,block=364.0):
    d=np.fromfile(fn); n0=d[:8]; X=d[8:8+((len(d)-8)//32)*32].reshape(-1,8,4); t=(np.arange(len(X))+0.5)*block
    return n0,X,t
def lines(t,y,nl=10,pmin=60.0,pmax=None):
    T=t[-1]-t[0]; yr=365.25; out=[]; r=y.copy(); dt=t[1]-t[0]
    pmax=pmax or T/yr/3
    for _ in range(nl):
        F=np.fft.rfft(r*np.hanning(len(r))); f=np.fft.rfftfreq(len(r),dt)
        ok=(f>1/(pmax*yr))&(f<1/(pmin*yr)); 
        if not ok.any(): break
        i=np.argmax(np.abs(F)*ok); f0=f[i]; best=None
        for ff in np.linspace(f0-1/T,f0+1/T,81):
            c,s=np.cos(2*np.pi*ff*t),np.sin(2*np.pi*ff*t); A=np.vstack([c,s,np.ones_like(t)]).T
            co,res,_,_=np.linalg.lstsq(A,r,rcond=None); model=A@co; err=((r-model)**2).sum()
            if best is None or err<best[0]: best=(err,ff,co,model)
        err,ff,co,model=best; amp=math.hypot(co[0],co[1]); r=r-model+co[2]
        out.append((1/ff/yr,amp))
    return out,r
_C=None
def candidates(n,pmin=50.0):
    """Combinations of two or three mean motions with long periods (years): (period, order, size, label)."""
    out=[]; yr=365.25
    for a in range(8):
        for b in range(a+1,8):
            for k2 in range(1,25):
                k1=round(k2*n[a]/n[b])
                if k1<1 or math.gcd(k1,k2)!=1: continue
                d=abs(k1*n[b]-k2*n[a])/(2*np.pi)
                if d>0 and 1/d/yr>pmin and abs(k1-k2)<=8: out.append((1/d/yr,abs(k1-k2),k1+k2,'%d %s - %d %s'%(k2,NAMES[a],k1,NAMES[b])))
    for a in range(8):
        for b in range(a+1,8):
            for c in range(b+1,8):
                for ka in range(-9,10):
                    for kb in range(-9,10):
                        if ka==0 or kb==0: continue
                        x=-(ka*n[a]+kb*n[b])/n[c]; kc=round(x)
                        if kc==0 or abs(kc)>9 or math.gcd(math.gcd(abs(ka),abs(kb)),abs(kc))!=1 or ka<0: continue
                        d=abs(ka*n[a]+kb*n[b]+kc*n[c])/(2*np.pi)
                        if d>0 and 1/d/yr>pmin and abs(ka+kb+kc)<=3:
                            out.append((1/d/yr,abs(ka+kb+kc),abs(ka)+abs(kb)+abs(kc)+3,'%+d %s %+d %s %+d %s'%(ka,NAMES[a],kb,NAMES[b],kc,NAMES[c])))
    return out
def identify(per,n,tol=0.12,planet=None):
    global _C
    if _C is None: _C=candidates(n)
    best=None
    for h in (1,2,3):                       # the line itself, or a harmonic of a combination
        for (P,o,sz,lab) in _C:
            if abs(P/h/per-1)<tol:
                # closeness first (perihelion motion shifts a line by a few per cent), then simplicity
                pen=(4 if lab[0] in '+-' else 0)+(0 if planet is None or planet in lab else 6)   # three planets; planet not involved
                cand=(100*abs(P/h/per-1)+0.25*(sz*h+o)+pen,abs(P/h/per-1),P,lab if h==1 else '%d x (%s)'%(h,lab))
                if best is None or cand<best: best=cand
    return best
def local(t,y,years,p0):
    """Amplitude and period of the strongest swing near p0 years, fitted over the first `years` years only."""
    m=t<years*365.25; tt=t[m]; yy=y[m]; best=None
    for P in np.linspace(p0*0.8,p0*1.25,181):
        w=2*np.pi/(P*365.25); u=tt/tt[-1]; A=np.vstack([np.cos(w*tt),np.sin(w*tt),np.ones_like(tt),u,u*u]).T
        co=np.linalg.lstsq(A,yy,rcond=None)[0]; err=((yy-A@co)**2).sum()
        if best is None or err<best[0]: best=(err,P,math.hypot(co[0],co[1]))
    return best[1],best[2]
if __name__=='__main__':
    n0,X,t=load(sys.argv[1]); full=t[-1]-t[0]
    n=[n0[p]+np.polyfit(t,X[:,p,0],1)[0] for p in range(8)]          # mean motions over the whole run
    # the slowest swings, over the whole run (periods above 10,000 years)
    slow={}
    for p in (4,5):
        y=(X[:,p,0]-np.polyval(np.polyfit(t,X[:,p,0],1),t))*206264.806
        slow[NAMES[p]]=lines(t,y,nl=1,pmin=10000.0)[0][0]; print('slowest swing of',NAMES[p],'%.0f yr %.0f"'%slow[NAMES[p]])
    # the table of long swings uses the first WINDOW years, where the slow drift of the orbits has not yet smeared the lines
    WINDOW=float(sys.argv[2]) if len(sys.argv)>2 else 30000.0
    m=t<WINDOW*365.25; X=X[m]; t=t[m]; span=t[-1]-t[0]; res={}
    n=[n0[p]+np.polyfit(t,X[:,p,0],1)[0] for p in range(8)]          # mean motions over the window, for the matching
    print('span %.0f yr'%(span/365.25)); print('periods',' '.join('%.4f'%(2*np.pi/x) for x in n))
    for p in range(8):
        y=(X[:,p,0]-np.polyval(np.polyfit(t,X[:,p,0],2),t))*206264.806
        L,r=lines(t,y,nl=10,pmax=7000.0); res[NAMES[p]]=[]
        print(NAMES[p],'rms %.1f"'%y.std(),'left %.1f"'%r.std())
        for per,amp in L:
            idt=identify(per,n,planet=NAMES[p])
            lab=idt[3] if idt else '?'; P0=idt[2] if idt else 0
            print('   %9.1f yr %9.2f"  %s  (from mean motions alone: %.1f yr)'%(per,amp,lab,P0)); res[NAMES[p]].append((per,amp,lab,P0))
    # two swings looked for by name, in a narrow band, because stronger lines hide them in the general search
    for p,lo,hi in ((1,225.0,255.0),(2,225.0,255.0)):
        y=(X[:,p,0]-np.polyval(np.polyfit(t,X[:,p,0],2),t))*206264.806
        for per,amp in lines(t,y,nl=1,pmin=lo,pmax=hi)[0]:
            idt=identify(per,n,planet=NAMES[p]); lab=idt[3] if idt else '?'
            print('   in a narrow band:',NAMES[p],'%.1f yr %.2f"'%(per,amp),lab); res[NAMES[p]].append((per,amp,lab,idt[2] if idt else 0))
    loc={}
    for p,p0 in ((4,900),(5,900),(6,4200),(7,4200),(3,1800)):
        y=(X[:,p,0]-np.polyval(np.polyfit(t,X[:,p,0],1),t))*206264.806
        loc[NAMES[p]]=local(t,y,3.2*p0,p0); print('near the start:',NAMES[p],'period %.0f yr amplitude %.0f"'%loc[NAMES[p]])
    # secular motion of the perihelia over the first 2,000 years (seconds of arc per century)
    peri={}
    m=t<2000*365.25
    for p in range(8):
        k=X[m,p,3]*np.cos(X[m,p,1]); h=X[m,p,3]*np.sin(X[m,p,1])
        peri[NAMES[p]]=float(np.polyfit(t[m],np.unwrap(np.arctan2(h,k)),1)[0]*206264.806*36525)
    print('perihelion advance, "/century:',' '.join('%s %.1f'%(a,b) for a,b in peri.items()))
    json.dump({'n':[float(x) for x in n],   # mean motions over the window (radians per day), Mercury to Neptune
               'lines':res,'local':loc,'peri':peri,'span_years':float(full/365.25),'window_years':float(span/365.25),'slow':slow},open(sys.argv[1]+'.json','w'))
