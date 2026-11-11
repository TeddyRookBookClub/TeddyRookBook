# Tune the starting orbits of nbody.c:
#  - semi-major axes, so that the mean motions over 20,000 years equal JPL's long-term mean motions
#    (Standish and Williams, Table 2a, 3000 BC to 3000 AD; degrees per Julian century);
#  - eccentricities and perihelia, so that the averages of e cos(varpi) and e sin(varpi) over the first 250 years equal
#    the mean elements of their Table 1 (1800 to 2050).
import numpy as np, subprocess, json, math
RATE=[149472.67486623,58517.81560260,35999.37306329,19140.29934243,3034.90371757,1222.11494724,428.49512595,218.46515314]
E0=[0.20563593,0.00677672,0.01671123,0.09339410,0.04838624,0.05386179,0.04725744,0.00859048]
W0=[77.45779628,131.60246718,102.93768193,-23.94362959,14.72847983,92.59887831,170.95427630,44.96476227]
target=[360/r*36525 for r in RATE]
f=[1.0]*8; kt=[E0[p]*math.cos(math.radians(W0[p])) for p in range(8)]; ht=[E0[p]*math.sin(math.radians(W0[p])) for p in range(8)]
k=kt[:]; h=ht[:]
for it in range(10):
    e=[math.hypot(k[p],h[p]) for p in range(8)]; w=[math.degrees(math.atan2(h[p],k[p])) for p in range(8)]
    args=['%.12f'%x for x in f]+['%.12f'%x for x in e]+['%.10f'%x for x in w]
    subprocess.run(['./nbody','20000','0.1','364','tune.bin']+args,check=True)
    d=np.fromfile('tune.bin'); n0=d[:8]; X=d[8:].reshape(-1,8,4); t=(np.arange(len(X))+0.5)*364.0
    per=[2*np.pi/(n0[p]+np.polyfit(t,X[:,p,0],1)[0]) for p in range(8)]
    m=250; km=[(X[:m,p,3]*np.cos(X[:m,p,1])).mean() for p in range(8)]; hm=[(X[:m,p,3]*np.sin(X[:m,p,1])).mean() for p in range(8)]
    print(it,'period err',' '.join('%.1e'%(per[p]/target[p]-1) for p in range(8)),'| e-vector err',' '.join('%.1e'%math.hypot(km[p]-kt[p],hm[p]-ht[p]) for p in range(8)),flush=True)
    f=[f[p]*(target[p]/per[p])**(2/3) for p in range(8)]
    k=[k[p]-(km[p]-kt[p]) for p in range(8)]; h=[h[p]-(hm[p]-ht[p]) for p in range(8)]
    json.dump({'args':args,'target_days':target},open('tune.json','w'))
