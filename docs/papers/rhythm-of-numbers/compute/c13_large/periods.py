"""Orbital periods in days.  Planets: long-term mean motions (JPL, Standish & Williams, formula valid 3000 BC - 3000 AD),
period = 36525 * 360 / (degrees per Julian century).  Pluto and the moons: NASA fact sheets.  Exoplanets: discovery papers."""
RATE=dict(Mercury=149472.67486623,Venus=58517.81560260,Earth=35999.37306329,Mars=19140.29934243,Jupiter=3034.90371757,Saturn=1222.11494724,Uranus=428.49512595,Neptune=218.46515314)
PLANET={k:36525*360/v for k,v in RATE.items()}; PLANET["Pluto"]=90560.0
FACT_SHEET=dict(Mercury=87.969,Venus=224.701,Earth=365.256,Mars=686.980,Jupiter=4332.589,Saturn=10755.699,Uranus=30685.400,Neptune=60189.018,Pluto=90560.0)   # current orbits, for comparison
MOON=dict(Io=1.769138,Europa=3.551181,Ganymede=7.154553,Callisto=16.689017,Mimas=0.9424218,Enceladus=1.370218,Tethys=1.887802,Dione=2.736915,Titan=15.945421,Hyperion=21.276609)
TRAPPIST1=[1.510826,2.421937,4.049219,6.101013,9.207540,12.352446,18.772866]      # Agol et al. 2021
HD110067=[9.113678,13.673694,20.519617,30.793091,41.05854,54.76992]             # Luque et al. 2023
