import numpy as np, math, json, sys
from scipy import ndimage
N=500  # raster of the 1000x1000 box at half scale
ys,xs=np.mgrid[0:N,0:N]; X=(xs+.5)*1000/N; Y=(ys+.5)*1000/N
def masks(a,b,d,phi,tilt):
    code=np.zeros((N,N),int)
    for k in range(5):
        ang=math.radians(72*k-90)
        cx=500+d*math.cos(ang+math.radians(phi)); cy=500+d*math.sin(ang+math.radians(phi))
        t=ang+math.radians(tilt); c,s=math.cos(t),math.sin(t)
        u=(X-cx)*c+(Y-cy)*s; v=-(X-cx)*s+(Y-cy)*c
        code|=((u/a)**2+(v/b)**2<=1).astype(int)<<k
    return code
def score(p):
    code=masks(*p); rs={}
    for m in range(1,32):
        M=code==m
        if not M.any(): return -1,None
        lab,n=ndimage.label(M)
        if n>1:
            sizes=ndimage.sum(M,lab,range(1,n+1))
            if sorted(sizes)[-2]>6: return -1,None
            M=lab==(1+int(np.argmax(sizes)))
        dt=ndimage.distance_transform_edt(M)*1000/N
        i=np.unravel_index(np.argmax(dt),dt.shape); rs[m]=(float(X[i]),float(Y[i]),float(dt[i]))
    if code.max()==0: return -1,None
    # stay inside the box
    out=masks(*p)>0
    if out[0].any() or out[-1].any() or out[:,0].any() or out[:,-1].any(): return -1,None
    return min(r[2] for r in rs.values()),rs
rng=np.random.default_rng(int(sys.argv[1]) if len(sys.argv)>1 else 1)
best=(-1,None,None)
# start near a known good shape, then random search and local refinement
for it in range(1500):
    p=(rng.uniform(250,400),rng.uniform(140,260),rng.uniform(40,160),rng.uniform(-90,90),rng.uniform(0,180))
    s,rs=score(p)
    if s>best[0]: best=(s,p,rs)
print('random best',best[0],best[1],flush=True)
s0,p0,rs0=best; step=np.array([20,15,12,12,12.])
for it in range(900):
    p=tuple(np.array(p0)+rng.normal(0,1,5)*step*(0.985**(it/6)))
    s,rs=score(p)
    if s>s0: s0,p0,rs0=s,p,rs
print('refined',s0,p0)
json.dump({'p':p0,'s':s0,'rs':rs0},open('best%s.json'%(sys.argv[1] if len(sys.argv)>1 else ''),'w'))
