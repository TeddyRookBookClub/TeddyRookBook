/* Build an Atom: the model. Elements 1–36, every known isotope of each with its half-life and decay modes,
   natural abundances, electron configurations and the simplified shell picture, decay rules and half-life sampling.
   Data: half-lives and decay modes from the NUBASE2020 evaluation (Kondev et al., Chinese Physics C 45, 030001, 2021),
   as tabulated in the "Isotopes of …" tables; abundances from NIST (Atomic Weights and Isotopic Compositions)
   and CIAAW (Isotopic compositions of the elements 2013). Works in the browser (window.AtomModel) and in node. */
(function (root) {
  'use strict';

  // Z: [symbol, name, standard atomic weight (IUPAC abridged), group, period, category]
  var EL = [null,
    ['H', 'Hydrogen', '1.008', 1, 1, 'nonmetal'], ['He', 'Helium', '4.0026', 18, 1, 'noble'],
    ['Li', 'Lithium', '6.94', 1, 2, 'alkali'], ['Be', 'Beryllium', '9.0122', 2, 2, 'alkearth'], ['B', 'Boron', '10.81', 13, 2, 'metalloid'],
    ['C', 'Carbon', '12.011', 14, 2, 'nonmetal'], ['N', 'Nitrogen', '14.007', 15, 2, 'nonmetal'], ['O', 'Oxygen', '15.999', 16, 2, 'nonmetal'],
    ['F', 'Fluorine', '18.998', 17, 2, 'halogen'], ['Ne', 'Neon', '20.180', 18, 2, 'noble'],
    ['Na', 'Sodium', '22.990', 1, 3, 'alkali'], ['Mg', 'Magnesium', '24.305', 2, 3, 'alkearth'], ['Al', 'Aluminum', '26.982', 13, 3, 'post'],
    ['Si', 'Silicon', '28.085', 14, 3, 'metalloid'], ['P', 'Phosphorus', '30.974', 15, 3, 'nonmetal'], ['S', 'Sulfur', '32.06', 16, 3, 'nonmetal'],
    ['Cl', 'Chlorine', '35.45', 17, 3, 'halogen'], ['Ar', 'Argon', '39.95', 18, 3, 'noble'],
    ['K', 'Potassium', '39.098', 1, 4, 'alkali'], ['Ca', 'Calcium', '40.078', 2, 4, 'alkearth'], ['Sc', 'Scandium', '44.956', 3, 4, 'transition'],
    ['Ti', 'Titanium', '47.867', 4, 4, 'transition'], ['V', 'Vanadium', '50.942', 5, 4, 'transition'], ['Cr', 'Chromium', '51.996', 6, 4, 'transition'],
    ['Mn', 'Manganese', '54.938', 7, 4, 'transition'], ['Fe', 'Iron', '55.845', 8, 4, 'transition'], ['Co', 'Cobalt', '58.933', 9, 4, 'transition'],
    ['Ni', 'Nickel', '58.693', 10, 4, 'transition'], ['Cu', 'Copper', '63.546', 11, 4, 'transition'], ['Zn', 'Zinc', '65.38', 12, 4, 'transition'],
    ['Ga', 'Gallium', '69.723', 13, 4, 'post'], ['Ge', 'Germanium', '72.630', 14, 4, 'metalloid'], ['As', 'Arsenic', '74.922', 15, 4, 'metalloid'],
    ['Se', 'Selenium', '78.971', 16, 4, 'nonmetal'], ['Br', 'Bromine', '79.904', 17, 4, 'halogen'], ['Kr', 'Krypton', '83.798', 18, 4, 'noble']
  ];
  var CATS = { nonmetal: 'Nonmetal', noble: 'Noble gas', alkali: 'Alkali metal', alkearth: 'Alkaline earth metal', metalloid: 'Metalloid', halogen: 'Halogen', transition: 'Transition metal', post: 'Metal' };

  // natural abundance (mole fraction) of each isotope found in nature. NIST representative values,
  // except where NIST gives none: then CIAAW 2013 (Ti, V, Cr, Fe, Ni, Cu, Zn, Ga, Ge, Se, Kr, Ca, K, Ne).
  var AB = {
    1: { 1: 0.999885, 2: 0.000115 }, 2: { 3: 0.00000134, 4: 0.99999866 }, 3: { 6: 0.0759, 7: 0.9241 }, 4: { 9: 1 }, 5: { 10: 0.199, 11: 0.801 },
    6: { 12: 0.9893, 13: 0.0107 }, 7: { 14: 0.99636, 15: 0.00364 }, 8: { 16: 0.99757, 17: 0.00038, 18: 0.00205 }, 9: { 19: 1 },
    10: { 20: 0.9048, 21: 0.0027, 22: 0.0925 }, 11: { 23: 1 }, 12: { 24: 0.7899, 25: 0.1000, 26: 0.1101 }, 13: { 27: 1 },
    14: { 28: 0.92223, 29: 0.04685, 30: 0.03092 }, 15: { 31: 1 }, 16: { 32: 0.9499, 33: 0.0075, 34: 0.0425, 36: 0.0001 },
    17: { 35: 0.7576, 37: 0.2424 }, 18: { 36: 0.003336, 38: 0.000629, 40: 0.996035 }, 19: { 39: 0.932581, 40: 0.000117, 41: 0.067302 },
    20: { 40: 0.96941, 42: 0.00647, 43: 0.00135, 44: 0.02086, 46: 0.00004, 48: 0.00187 }, 21: { 45: 1 },
    22: { 46: 0.0825, 47: 0.0744, 48: 0.7372, 49: 0.0541, 50: 0.0518 }, 23: { 50: 0.00250, 51: 0.99750 },
    24: { 50: 0.04345, 52: 0.83789, 53: 0.09501, 54: 0.02365 }, 25: { 55: 1 }, 26: { 54: 0.05845, 56: 0.91754, 57: 0.02119, 58: 0.00282 },
    27: { 59: 1 }, 28: { 58: 0.680769, 60: 0.262231, 61: 0.011399, 62: 0.036345, 64: 0.009256 }, 29: { 63: 0.6915, 65: 0.3085 },
    30: { 64: 0.4917, 66: 0.2773, 67: 0.0404, 68: 0.1845, 70: 0.0061 }, 31: { 69: 0.60108, 71: 0.39892 },
    32: { 70: 0.2052, 72: 0.2745, 73: 0.0776, 74: 0.3652, 76: 0.0775 }, 33: { 75: 1 },
    34: { 74: 0.0086, 76: 0.0923, 77: 0.0760, 78: 0.2369, 80: 0.4980, 82: 0.0882 }, 35: { 79: 0.5069, 81: 0.4931 },
    36: { 78: 0.00355, 80: 0.02286, 82: 0.11593, 83: 0.11500, 84: 0.56987, 86: 0.17279 }
  };

  // Z blocks separated by ';'. Each nuclide "A=half-life=modes": half-life in seconds ('s' stable, '?' not measured;
  // prefix '<' or '>' a limit, '~' an estimate). Modes "code:percent,…" (percent left out when it is the only one or unknown).
  var NUC = '1=s 2=s 3=3.888e+08=b- 4=1.39e-22=n 5=8.6e-23=2n 6=2.94e-22=? 7=6.52e-22=?;2=?=p 3=s 4=s 5=6.02e-22=n 6=0.8069=b- 7=2.51e-21=n 8=0.1195=b-:83.1,b-n:16 9=2.5e-21=n 10=2.6e-22=2n;4=9.1e-23=p 5=3.7e-22=p 6=s 7=s 8=0.8387=b- 9=0.1782=b-n:50.5,b-:49.5 10=2e-21=n 11=0.00875=b-n:86.3,b-:6.0,b-2n:4.1 12=<1e-08=n 13=3.3e-21=2n;6=5e-21=2p 7=4.598e+06=ec 8=8.19e-17=a 9=s 10=4.377e+13=b- 11=13.76=b-:96.7,b-a:3.3 12=0.02146=b-:99.5 13=1e-21=n 14=0.00453=b-n:86,b-:9,b-2n:5 15=7.9e-22=n 16=6.5e-22=2n;7=5.7e-22=p 8=0.7719=b+ 9=8e-19=p 10=s 11=s 12=0.0202=b-:99.4 13=0.01716=b-:99.7 14=0.01236=b-:94,b-n:6 15=0.01018=b-n:98.7 16=>4.6e-21=n 17=0.00508=b-n:63,b-:21,b-2n:12 18=<2.6e-08=n 19=0.00292=b-n:71,b-2n:17 20=>9.12e-22=n 21=>7.6e-22=2n;8=3.5e-21=2p 9=0.1265=b+:54.1,b+a:38.4,b+p:7.5 10=19.3=b+ 11=1220=b+ 12=s 13=s 14=1.799e+11=b- 15=2.449=b- 16=0.75=b-n:99,b-:1 17=0.193=b-:71.6,b-n:28.4 18=0.092=b-:68.5,b-n:31.5 19=0.0462=b-n:47,b-:46,b-2n:7 20=0.016=b-n:70,b-2n:18.6,b-:11.4 21=<3e-08=n 22=0.0062=b-n:61,b-2n:37,b-:2;9=<1e-18=p 10=1.43e-22=p 11=5.85e-22=p 12=0.011=b+:98.07,b+a:1.93 13=597.9=b+ 14=s 15=s 16=7.13=b- 17=4.173=b-n:95.1,b-:4.9 18=0.6192=b-:80.8,b-a:12.2,b-n:7.0 19=0.336=b-:58.2,b-n:41.8 20=0.136=b-:57.1,b-n:42.9 21=0.085=b-n:87,b-:13 22=0.023=b-:54,b-n:34,b-2n:12 23=0.0139=b-:46.6,b-n:42,b-2n:8 24=<5.2e-08=n 25=<2.6e-07=n;11=1.98e-22=2p 12=8.9e-21=2p 13=0.00858=b+:89.1,b+p:10.9 14=70.62=b+ 15=122.3=b+ 16=s 17=s 18=s 19=26.47=b- 20=13.51=b- 21=3.42=b- 22=2.25=b-:78,b-n:22 23=0.097=b-:93,b-n:7 24=0.0774=b-:57,b-n:43 25=5.18e-21=n 26=4.2e-12=2n 27=>2.5e-21=n 28=>6.5e-22=2n;13=?=p 14=5e-22=p 15=1.1e-21=p 16=2.1e-20=p 17=64.37=b+ 18=6584=b+ 19=s 20=11.01=b- 21=4.158=b- 22=4.23=b-:89,b-n:11 23=2.23=b-:86,b-n:14 24=0.384=b-:94.1,b-n:5.9 25=0.08=b-:76.9,b-n:23.1 26=0.0082=b-:86.5,b-n:13.5 27=0.005=b-n:77,b-:23 28=4.6e-20=n 29=0.0025=b-n:60,b-:40 30=9.6e-22=n 31=~0.002=b-;15=7.7e-22=2p 16=>5.7e-21=2p 17=0.1092=b+p:94.4,b+a:3.51,b+:2.1 18=1.664=b+ 19=17.26=b+ 20=s 21=s 22=s 23=37.15=b- 24=202.8=b- 25=0.602=b- 26=0.197=b-:99.87 27=0.0309=b-:98,b-n:2 28=0.0188=b-:84.3,b-n:12,b-2n:3.7 29=0.0147=b-:68,b-n:28,b-2n:4 30=0.00722=b-:78.1,b-n:13,b-2n:8.9 31=0.0034=b- 32=0.0035=b- 34=~0.002=b-;17=?=p 18=1.3e-21=p 19=>1e-18=p 20=0.4479=b+:75,b+a:25 21=22.45=b+ 22=8.211e+07=b+:90.57,ec:9.43 23=s 24=5.384e+04=b- 25=59.1=b- 26=1.071=b- 27=0.301=b-:99.9 28=0.0331=b-:99.42 29=0.0432=b-:78,b-n:22 30=0.0459=b-:70.2,b-n:28.6,b-2n:1.24 31=0.0168=b-:63.2,b-n:36 32=0.0129=b-:66.4,b-n:26,b-2n:7.6 33=0.0082=b-n:47,b-:40,b-2n:13 34=0.0055=b-2n:50,b-:35,b-n:15 35=0.0015=b- 37=~0.001=b- 39=~0.001=b-n;18=4e-21=2p 19=5e-12=2p 20=0.0904=b+:69.7,b+p:30.3 21=0.12=b+:79.8,b+p:20.1 22=3.874=b+ 23=11.3=b+ 24=s 25=s 26=s 27=566.1=b- 28=7.529e+04=b- 29=1.3=b- 30=0.317=b- 31=0.27=b-:93.8,b-n:6.2 32=0.0804=b-:94.5,b-n:5.5 33=0.092=b-:86,b-n:14 34=0.0449=b-:78.9,b-n:21 35=0.0113=b-n:52,b-:48 36=0.0039=b-:52,b-n:48 37=0.008=b- 38=0.0031=b-n:81,b-:9,b-2n:9 40=~0.001=b-;20=>1.1e-21=p 21=>1.1e-21=p 22=0.0911=b+p:55,b+:44 23=0.446=b+:98.78,b+p:1.22 24=2.053=b+ 25=7.167=b+ 26=2.263e+13=b+:85,ec:15 27=s 28=134.7=b- 29=393.6=b- 30=3.62=b- 31=0.644=b-:98.4 32=0.0326=b-:99.3 33=0.04146=b-:91.5,b-n:8.5 34=0.05373=b-:74,b-n:26 35=0.03816=b-:64.2,b-n:35.8 36=0.09=b-:69,b-n:31 37=0.0114=b-n:52,b-:47 38=0.009=b-n:84,b-:16 39=0.0076=b-n:97,b-:3 40=0.0057=b-n:64,b-2n:20,b-:16 41=0.0035=b-n:86,b-2n:11,b-:3 42=~0.003=b- 43=~0.004=b-;22=0.0287=b+p:62,b+:37 23=0.0423=b+p:88,b+:8,b+2p:3.6 24=0.1432=b+:65.5,b+p:34.5 25=0.2206=b+:65,b+p:35 26=2.245=b+ 27=4.117=b+ 28=s 29=s 30=s 31=9430=b- 32=4.954e+09=b- 33=6.18=b- 34=2.77=b- 35=0.78=b- 36=0.503=b-:88,b-n:12 37=0.141=b-:83,b-n:17 38=0.063=b-:75,b-n:25 39=0.0412=b-:67,b-n:33 40=0.0312=b-:62,b-n:38 41=0.02=b-n:55,b-:45 42=0.0155=b-:51,b-n:48 43=0.013=b-n:52,b-:27,b-2n:21 44=~0.004=b- 45=~0.004=b-;26=0.0436=b+:62.9,b+p:35.1,b+2p:2 27=0.26=b+:99.93 28=0.2703=b+ 29=4.102=b+ 30=150=b+ 31=s 32=1.233e+06=b- 33=2.19e+06=b- 34=12.43=b- 35=47.3=b- 36=5.6=b- 37=2.31=b- 38=0.64=b-:88,b-n:12 39=0.282=b-:74,b-n:26 40=0.15=b-:84.2,b-n:15.8 41=0.101=b-:70,b-n:30 42=0.0485=b-:50,b-n:50 43=0.0358=b-n 44=0.0185=b-n:55,b-:24,b-2n:21 45=0.024=b-n:79,b-2n:21 46=~0.009=b- 47=~0.004=b-;27=0.0163=b+p:61,b+:36,b+2p:3 28=0.125=b+:79.3,b+p:20.7 29=0.188=b+:53.6,b+p:46.4 30=1.18=b+ 31=2.553=b+ 32=s 33=s 34=s 35=7.549e+06=b- 36=s 37=303=b- 38=1.022e+04=b- 39=11.5=b- 40=8.8=b- 41=1.99=b- 42=1.016=b- 43=0.265=b-:60,b-n:40 44=0.1=b-:82,b-n:18 45=0.068=b-n:54,b-:46 46=0.05=b- 47=~0.024=b- 48=~0.01=b- 49=~0.004=b-;28=?=p 29=5.4e-21=p 30=<5e-08=p 31=0.19=b+:97.6,b+p:2.4 32=0.298=b+:99.92 33=2.504=b+ 34=1.527=b+ 35=s 36=9.508e+12=b-:98.1,b+:1.9 37=s 38=2234=b- 39=3372=b- 40=81=b- 41=38.4=b- 42=6.8=b- 43=3.13=b- 44=0.56=b-:92 45=0.513=b-:76,b-n:24 46=0.232=b-n:60,b-:40 47=0.101=b-:97 48=~0.03=b- 49=~0.035=b- 50=~0.01=b- 51=~0.005=b- 52=~0.002=b-;29=?=2p 30=<1e-11=2p 31=0.015=b+p:68.3,b+:22.63,b+2p:9 32=0.098=b+:64.42,b+p:35.58 33=0.173=b+:61.3,b+p:38.7 34=0.8465=b+ 35=1.776=b+ 36=s 37=3.025e+06=ec 38=s 39=9.53e+09=b- 40=s 41=6577=b- 42=1.038e+09=b- 43=322.2=b- 44=712.2=b- 45=21.48=b- 46=8.4=b- 47=1.23=b- 48=0.415=b-:62,b-n:38 49=0.236=b-:71,b-n:29 50=0.106=b-:63,b-n:37 51=~0.03=b- 52=~0.04=b- 53=~0.02=b- 54=~0.005=b-;31=<1e-11=p 34=?=p 35=0.1752=b+:99.63 36=0.341=b+:99.95 37=1.237=b+ 38=459.1=b+ 39=s 40=3.938e+16=b-:89.28,ec:10.72 41=s 42=4.448e+04=b- 43=8.028e+04=b- 44=1328=b- 45=1068=b- 46=96.3=b- 47=17.38=b- 48=6.83=b-:98.86,b-n:1.14 49=1.26=b-n:86,b-:14 50=0.472=b-:71.4,b-n:28.6 51=0.365=b-n:65,b-:35 52=0.11=b-n:72.2,b-:25.5,b-2n:2.3 53=0.03=b-n:64,b-:26,b-2n:10 54=0.01=b- 55=~0.01=b- 56=~0.005=b- 57=~0.002=b- 59=~0.001=b-;35=0.0257=b+p:95.8,b+2p:4.2 36=0.1009=b+p:51.2,b+:48.8 37=0.181=b+p:76.8,b+:23.2 38=0.4437=b+ 39=0.8603=b+ 40=s 41=3.137e+12=ec 42=s 43=s 44=s 45=1.405e+07=b- 46=s 47=3.919e+05=b- 48=1.767e+27=2b- 49=523.1=b- 50=13.45=b- 51=10=b- 52=4.6=b-:98 53=0.461=b-:60,b-n:40 54=0.09=b- 55=0.022=b- 56=0.011=b- 57=~0.008=b- 58=~0.004=b- 59=~0.005=b- 60=~0.002=b- 61=~0.001=b-;37=?=p 38=?=p 39=?=p 40=0.1823=b+:99.54 41=0.5963=b+ 42=0.6807=b+ 43=1.401e+04=b+ 44=1.455e+04=b+ 45=s 46=7.237e+06=b- 47=2.894e+05=b- 48=1.572e+05=b- 49=3431=b- 50=102.5=b- 51=12.4=b- 52=8.2=b- 53=2.4=b- 54=0.526=b-:84,b-n:16 55=0.096=b-:83,b-n:17 56=0.026=b- 57=0.022=b- 58=0.012=b- 59=~0.012=b- 60=~0.01=b- 61=~0.007=b- 62=~0.002=b- 63=~0.001=b-;39=0.0285=b+p:93.7,b+:6.3 40=0.0524=b+p:95.8,b+:4.2 41=0.0819=b+p:91.1,b+:8.9 42=0.2083=b+ 43=0.509=b+ 44=1.865e+09=ec 45=1.109e+04=b+ 46=s 47=s 48=s 49=s 50=s 51=345.6=b- 52=102=b- 53=32.7=b- 54=2.1=b- 55=1.3=b- 56=0.2=b- 57=0.095=b- 58=0.055=b- 59=0.0285=b- 60=0.0222=b- 61=0.015=b- 62=~0.009=b- 63=~0.01=b- 64=~0.005=b- 65=~0.001=b- 66=?=b-;43=0.0793=b+:97.5 44=0.111=b+ 45=0.547=b+ 46=0.4226=b+ 47=1956=b+ 48=1.38e+06=b+ 49=2.851e+07=ec 50=8.552e+24=b+ 51=s 52=224.6=b- 53=92.58=b- 54=49.8=b- 55=6.54=b- 56=0.216=b- 57=0.35=b- 58=0.191=b- 59=0.095=b-:97,b-n:3 60=0.122=b- 61=0.0482=b-:85.5,b-n:14.5 62=0.0336=b- 63=0.0196=b-:65,b-n:35 64=0.015=b- 65=~0.014=b- 66=~0.01=b- 67=~0.008=b- 68=?=b-;42=0.0133=b+p 43=0.0211=b+p:79.3,b+2p:11.6,b+:8.97 44=0.0428=b+:88,b+p:12 45=0.0609=b+:65.6,b+p:34.4 46=0.2243=b+ 47=0.4616=b+ 48=7.762e+04=b+ 49=2538=b+ 50=s 51=2.393e+06=ec 52=s 53=s 54=s 55=209.8=b- 56=356.4=b- 57=21.1=b- 58=7=b- 59=1.05=b- 60=0.49=b- 61=0.243=b- 62=0.206=b- 63=0.129=b- 64=0.043=b- 65=0.0275=b- 66=0.0238=b- 67=~0.011=b- 68=~0.01=b- 69=~0.006=b- 70=~0.006=b- 72=?=b-;46=0.0362=b+p:57,b+:25,b+2p:18 47=0.088=b+ 48=0.1581=b+:99.72 49=0.382=b+ 50=0.2832=b+ 51=2749=b+ 52=4.831e+05=b+ 53=1.168e+14=ec 54=2.696e+07=ec 55=s 56=9284=b- 57=85.4=b- 58=3=b- 59=4.59=b- 60=0.28=b- 61=0.709=b- 62=0.092=b- 63=0.275=b- 64=0.0888=b-:97.3,b-n:2.7 65=0.0919=b-:92.1,b-n:7.9 66=0.0638=b-:92.6,b-n:7.4 67=0.0467=b-:90,b-n:10 68=0.0337=b-:82,b-n:18 69=0.0221=b-:60,b-n:40 70=0.0199=b- 71=~0.016=b- 72=~0.012=b- 73=~0.012=b- 74=?=b- 75=?=b-;45=0.0025=2p:70,b+p:18.9,b+2p:7.8 46=0.013=b+p:78.7,b+:21.3 47=0.0219=b+p:88.4,b+:11.6 48=0.0453=b+:84.7,b+p:15.3 49=0.0647=b+p:56.7,b+:43.3 50=0.152=b+ 51=0.3054=b+ 52=2.979e+04=b+ 53=510.6=b+ 54=s 55=8.698e+07=ec 56=s 57=s 58=s 59=3.845e+06=b- 60=8.268e+13=b- 61=358.8=b- 62=68=b- 63=6.1=b- 64=2=b- 65=0.805=b- 66=0.467=b- 67=0.394=b- 68=0.188=b- 69=0.162=b- 70=0.0614=b- 71=0.0343=b- 72=0.017=b- 73=0.0129=b- 74=0.005=b- 75=~0.009=b- 76=~0.003=b- 77=?=b-;50=0.0388=b+p:70.5,b+:29.5 51=0.0688=b+:96.2 52=0.1117=b+ 53=0.2446=b+ 54=0.1933=b+ 55=6.311e+04=b+ 56=6.673e+06=b+ 57=2.348e+07=ec 58=6.121e+06=ec:85.21,b+:14.79 59=s 60=1.663e+08=b- 61=5936=b- 62=92.4=b- 63=26.9=b- 64=0.3=b- 65=1.16=b- 66=0.194=b- 67=0.329=b- 68=0.2=b- 69=0.18=b- 70=0.508=b- 71=0.08=b-:97,b-n:3 72=0.0515=b-:96,b-n:4 73=0.042=b-:94,b-n:6 74=0.0313=b-:82,b-n:18 75=0.0265=b-:84,b-n:16 76=0.023=b- 77=0.015=b- 78=~0.011=b- 79=?=b- 80=?=b-;48=0.0028=2p:70,b+p:30 49=0.0075=b+p 50=0.0185=b+p:73,b+2p:14,b+:13 51=0.0238=b+p:87.2,b+:12.3 52=0.0418=b+:68.9,b+p:31.1 53=0.0552=b+:77.3,b+p:22.7 54=0.1141=b+ 55=0.2039=b+ 56=5.249e+05=ec 57=1.282e+05=b+ 58=s 59=2.556e+12=ec 60=s 61=s 62=s 63=3.194e+09=b- 64=s 65=9063=b- 66=1.966e+05=b- 67=21=b- 68=29=b- 69=11.4=b- 70=6=b- 71=2.56=b- 72=1.57=b- 73=0.84=b- 74=0.5077=b- 75=0.3316=b-:90,b-n:10 76=0.2346=b-:86,b-n:14 77=0.1589=b-:74,b-n:26 78=0.1222=b- 79=0.044=b- 80=0.03=b- 81=~0.03=b- 82=~0.016=b-;55=0.0559=b+ 56=0.0808=b+:99.6 57=0.1964=b+ 58=3.204=b+ 59=81.5=b+ 60=1422=b+ 61=1.203e+04=b+ 62=580.3=b+ 63=s 64=4.572e+04=b+:61.52,b-:38.48 65=s 66=307.2=b- 67=2.226e+05=b- 68=30.9=b- 69=171=b- 70=44.5=b- 71=19.4=b- 72=6.63=b- 73=4.2=b-:99.71 74=1.606=b-:99.93 75=1.224=b-:97.3,b-n:2.7 76=0.656=b- 77=0.4703=b-:69.9,b-n:30.1 78=0.3307=b-n:50.6,b-:49.4 79=0.2413=b-n:66,b-:34 80=0.1133=b-n:59,b-:41 81=0.0732=b-n:81,b-:19 82=0.034=b- 83=~0.021=b- 84=?=b- 85=?=b-;54=0.0018=2p 55=0.0198=b+p:91,b+:9 56=0.0324=b+p:88,b+:12 57=0.0457=b+p:87,b+:13 58=0.086=b+:99.3 59=0.1787=b+:99.9 60=142.8=b+ 61=89.1=b+ 62=3.309e+04=b+ 63=2308=b+ 64=s 65=2.108e+07=ec:98.579,b+:1.421 66=s 67=s 68=s 69=3384=b- 70=s 71=144=b- 72=1.674e+05=b- 73=24.5=b- 74=95.6=b- 75=10.2=b- 76=5.7=b- 77=2.08=b- 78=1.47=b- 79=0.746=b-:98.3,b-n:1.7 80=0.5622=b-:98.64,b-n:1.36 81=0.2994=b-:77,b-n:23 82=0.1779=b-n:69,b-:31 83=0.1=b-n:71,b-:29 84=0.054=b-n:73,b-:27 85=~0.04=b- 86=?=b- 87=?=b-;60=0.0694=b+:98.4,b+p:1.6 61=0.1659=b+ 62=0.1161=b+ 63=32.4=b+ 64=157.6=b+ 65=908=b+ 66=3.349e+04=b+ 67=2.818e+05=ec 68=4071=b+ 69=s 70=1268=b-:99.59,ec:0.41 71=s 72=5.049e+04=b- 73=1.75e+04=b- 74=487.2=b- 75=126=b- 76=30.6=b- 77=13.2=b- 78=5.09=b- 79=2.848=b-:99.911 80=1.9=b-:99.14 81=1.217=b-:87.5,b-n:12.5 82=0.6=b-:78.8,b-n:21.2 83=0.31=b-n:85,b-:15 84=0.0976=b-:55,b-n:43 85=0.0953=b-n:77,b-:22 86=0.049=b-n:69,b-2n:16.2,b-:15 87=0.029=b-n:81,b-2n:10.2,b-:9 88=?=b- 89=?=b- 90=?=b-;59=0.0133=b+p 60=0.025=b+p:67,b+:33 61=0.0407=b+p:87,b+:13 62=0.0735=b+ 63=0.1536=b+ 64=63.7=b+ 65=30.9=b+ 66=8136=b+ 67=1134=b+ 68=2.342e+07=ec 69=1.406e+05=b+ 70=s 71=9.908e+05=ec 72=s 73=s 74=s 75=4967=b- 76=6.381e+28=2b- 77=4.036e+04=b- 78=5280=b- 79=18.98=b- 80=29.5=b- 81=9=b- 82=4.31=b- 83=1.85=b- 84=0.951=b-:89.4,b-n:10.6 85=0.495=b-:82.8,b-n:17.2 86=0.2216=b-:55,b-n:45 87=0.103=b- 88=0.061=b- 89=~0.06=b- 90=~0.03=b- 91=?=b- 92=?=b-;64=0.069=b+ 65=0.1303=b+ 66=0.09577=b+ 67=42.5=b+ 68=151.6=b+ 69=912=b+ 70=3156=b+ 71=2.351e+05=b+ 72=9.36e+04=b+ 73=6.938e+06=ec 74=1.535e+06=b+:66,b-:34 75=s 76=9.446e+04=b- 77=1.396e+05=b- 78=5442=b- 79=540.6=b- 80=15.2=b- 81=33.3=b- 82=19.1=b- 83=13.4=b- 84=3.16=b-:99.72 85=2.022=b-n:62.6,b-:37.4 86=0.945=b-:64.5,b-n:35.5 87=0.492=b-:84.6,b-n:15.4 88=0.27=b- 89=~0.22=b- 90=~0.07=b- 91=~0.1=b- 92=~0.045=b- 93=?=b- 94=?=b- 95=?=b-;63=0.0132=b+p 64=0.0226=b+ 65=0.0342=b+p:87,b+:13 66=0.054=b+ 67=0.133=b+:99.5 68=35.5=b+ 69=27.4=b+ 70=2466=b+ 71=284.4=b+ 72=7.258e+05=ec 73=2.574e+04=b+ 74=s 75=1.035e+07=ec 76=s 77=s 78=s 79=1.032e+13=b- 80=s 81=1107=b- 82=2.764e+27=2b- 83=1335=b- 84=195.6=b- 85=32.9=b- 86=14.3=b- 87=5.5=b-:99.5 88=1.53=b-:99.01 89=0.43=b-:92.2,b-n:7.8 90=0.21=b- 91=0.27=b-:79,b-n:21 92=~0.09=b- 93=~0.13=b- 94=~0.05=b- 95=~0.07=b- 96=?=b- 97=?=b-;68=3.5e-08=p 69=<1.9e-08=p 70=0.0788=b+ 71=21.4=b+ 72=78.6=b+ 73=204=b+ 74=1524=b+ 75=5802=b+:76,ec:24 76=5.832e+04=b+:57,ec:43 77=2.053e+05=ec:99.3,b+:0.7 78=387=b+ 79=s 80=1061=b-:91.7,b+:8.3 81=s 82=1.27e+05=b- 83=8546=b- 84=1906=b- 85=174=b- 86=55.1=b- 87=55.68=b-:97.4,b-n:2.6 88=16.34=b-:93.42,b-n:6.58 89=4.357=b-:86.2,b-n:13.8 90=1.91=b-:74.7,b-n:25.3 91=0.543=b-:70.5,b-n:29.5 92=0.314=b-:66.9,b-n:33.1 93=0.152=b-n:64,b-:36 94=0.07=b-n:68,b-:32 95=~0.08=b- 96=~0.02=b- 97=~0.04=b- 98=~0.015=b- 99=?=b- 100=?=b- 101=?=b-;67=0.0074=b+p:63,2p:37 68=0.0216=b+p 69=0.0279=b+p:94,b+:6 70=0.045=b+:98.7 71=0.0988=b+:97.9 72=17.16=b+ 73=27.3=b+ 74=690=b+ 75=276=b+ 76=5.328e+04=b+ 77=4356=b+ 78=2.903e+29=2ec 79=1.261e+05=b+ 80=s 81=7.227e+12=ec 82=s 83=s 84=s 85=3.385e+08=b- 86=s 87=4578=b- 88=1.017e+04=b- 89=189=b- 90=32.32=b- 91=8.57=b- 92=1.84=b- 93=1.287=b-:98.05,b-n:1.95 94=0.212=b-:98.89 95=0.114=b-:97.13 96=0.08=b-:96.3 97=0.0622=b-:93.3,b-n:6.7 98=0.0428=b-:93,b-n:7 99=0.04=b-:89,b-n:11 100=0.012=b- 101=~0.009=b- 102=?=b- 103=?=b-';

  var YEAR = 365.2422 * 86400, AGE_UNIVERSE_Y = 13.8e9;
  // what each decay mode does to the nucleus: [change in Z, change in N, short label, words]
  var MODES = {
    'b-': [1, -1, 'β⁻', 'beta-minus decay: a neutron turns into a proton and shoots out an electron (and an antineutrino)'],
    'b-n': [1, -2, 'β⁻ then n', 'beta-minus decay, then a neutron flies out'],
    'b-2n': [1, -3, 'β⁻ then 2n', 'beta-minus decay, then two neutrons fly out'],
    'b-a': [-1, -3, 'β⁻ then α', 'beta-minus decay, then an alpha particle flies out'],
    'b+': [-1, 1, 'β⁺/EC', 'beta-plus decay or electron capture: a proton turns into a neutron'],
    'ec': [-1, 1, 'EC', 'electron capture: the nucleus swallows one of its own electrons, and a proton turns into a neutron'],
    'b+p': [-2, 1, 'β⁺ then p', 'beta-plus decay, then a proton flies out'],
    'b+2p': [-3, 1, 'β⁺ then 2p', 'beta-plus decay, then two protons fly out'],
    'b+a': [-3, -1, 'β⁺ then α', 'beta-plus decay, then an alpha particle flies out'],
    'a': [-2, -2, 'α', 'alpha decay: a helium-4 nucleus (2 protons, 2 neutrons) flies out'],
    'p': [-1, 0, 'p', 'a proton flies straight out'],
    '2p': [-2, 0, '2p', 'two protons fly straight out'],
    'n': [0, -1, 'n', 'a neutron flies straight out'],
    '2n': [0, -2, '2n', 'two neutrons fly straight out'],
    '2b-': [2, -2, '2β⁻', 'double beta decay: two neutrons turn into protons at the same moment'],
    '2ec': [-2, 2, '2EC', 'double electron capture: two protons turn into neutrons at the same moment']
  };
  var PARTICLE = { n: 1, '2n': 1, p: 1, '2p': 1, a: 1 };

  var nuc = {}, range = [];
  NUC.split(';').forEach(function (blk, i) {
    var z = i + 1, lo = 999, hi = 0;
    blk.split(' ').forEach(function (tok) {
      var p = tok.split('='), a = +p[0], hl = p[1], flag = '', sec = null, stable = false;
      if (hl === 's') stable = true;
      else if (hl !== '?') { if ('<>~'.indexOf(hl[0]) >= 0) { flag = hl[0]; hl = hl.slice(1); } sec = +hl; }
      var modes = [];
      if (p[2]) p[2].split(',').forEach(function (m) { var q = m.split(':'); if (MODES[q[0]]) modes.push({ m: q[0], pct: q.length > 1 ? +q[1] : null }); });
      modes.sort(function (x, y) { return (y.pct === null ? 100 : y.pct) - (x.pct === null ? 100 : x.pct); });
      nuc[z * 1000 + a] = { z: z, a: a, n: a - z, stable: stable, sec: sec, flag: flag, modes: modes };
      if (a < lo) lo = a; if (a > hi) hi = a;
    });
    range[z] = [lo, hi];
  });

  function el(z) { var e = EL[z]; return e ? { z: z, sym: e[0], name: e[1], weight: e[2], group: e[3], period: e[4], cat: e[5], catName: CATS[e[5]] } : null; }
  function nuclide(z, n) { return nuc[z * 1000 + z + n] || null; }
  function abundance(z, a) { return (AB[z] && AB[z][a]) || 0; }
  function stableIsotopes(z) { var out = []; for (var a = range[z][0]; a <= range[z][1]; a++) { var x = nuc[z * 1000 + a]; if (x && x.stable) out.push(a); } return out; }
  function commonIsotope(z) { var best = 0, ba = 0, ab = AB[z]; for (var a in ab) if (ab[a] > best) { best = ab[a]; ba = +a; } return ba; }

  // what the nucleus is: kind = empty | neutron | neutrons | stable | slow | radio | gone | unseen | beyond
  function nucleus(z, n) {
    var a = z + n;
    if (z === 0) {
      if (n === 0) return { kind: 'empty', a: 0 };
      if (n === 1) return { kind: 'neutron', a: 1, sec: 608.9, modes: [{ m: 'b-', pct: null }] };
      return { kind: 'neutrons', a: a };
    }
    if (z > 36) return { kind: 'beyond', a: a };
    var x = nuclide(z, n);
    if (!x) return { kind: (a < range[z][0] || a > range[z][1]) ? 'beyond' : 'unseen', a: a };
    var out = { kind: 'radio', a: a, sec: x.sec, flag: x.flag, modes: x.modes, abundance: abundance(z, a) };
    if (x.stable) out.kind = 'stable';
    else {
      var m0 = x.modes.length ? x.modes[0].m : (n > z ? 'n' : 'p');
      if (!x.modes.length) out.modes = [{ m: m0, pct: null }];
      if (PARTICLE[m0] && (x.sec === null || x.sec < 1e-6)) out.kind = 'gone';
      else if (x.sec !== null && x.sec > 1e22) out.kind = 'slow';
    }
    return out;
  }
  // the nucleus left after the main decay mode (or a given one)
  function daughter(z, n, mode) {
    var d = MODES[mode]; if (!d) return null;
    return { z: z + d[0], n: n + d[1] };
  }

  // electrons. Subshells in filling (Madelung) order
  var SUB = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1]];
  var LLET = 'spdf', CAP = [2, 6, 10, 14];
  function neutralConfig(z) {
    var occ = SUB.map(function () { return 0; }), left = z;
    for (var i = 0; i < SUB.length && left > 0; i++) { var c = Math.min(left, CAP[SUB[i][1]]); occ[i] = c; left -= c; }
    if (z === 24 || z === 29) { occ[5] -= 1; occ[6] += 1; } // Cr [Ar]3d⁵4s¹, Cu [Ar]3d¹⁰4s¹
    return occ;
  }
  // electron configuration of an atom or ion with z protons and e electrons
  function config(z, e) {
    var occ = neutralConfig(Math.max(0, z)), have = Math.max(0, z), i;
    while (have > e) { // take electrons from the outermost shell first (4s before 3d), and the highest l within a shell
      var best = -1;
      for (i = 0; i < SUB.length; i++) if (occ[i] > 0 && (best < 0 || SUB[i][0] > SUB[best][0] || (SUB[i][0] === SUB[best][0] && SUB[i][1] > SUB[best][1]))) best = i;
      occ[best]--; have--;
    }
    while (have < e) { // extra electrons go into the first subshell with room, in filling order
      for (i = 0; i < SUB.length; i++) if (occ[i] < CAP[SUB[i][1]]) break;
      if (i >= SUB.length) break;
      occ[i]++; have++;
    }
    return occ;
  }
  var SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sup(v) { return String(v).split('').map(function (c) { return SUP[c] || c; }).join(''); }
  function configText(z, e) {
    var occ = config(z, e), parts = [], order = SUB.map(function (s, i) { return i; });
    order.sort(function (a, b) { return SUB[a][0] - SUB[b][0] || SUB[a][1] - SUB[b][1]; }); // written in shell order: 1s 2s 2p 3s 3p 3d 4s 4p
    order.forEach(function (i) { if (occ[i] > 0) parts.push(SUB[i][0] + LLET[SUB[i][1]] + sup(occ[i])); });
    return parts.join(' ');
  }
  function shells(z, e) { // electrons in each shell n = 1, 2, 3 … (the Bohr-style picture)
    var occ = config(z, e), out = [];
    for (var i = 0; i < SUB.length; i++) if (occ[i]) { var n = SUB[i][0]; while (out.length < n) out.push(0); out[n - 1] += occ[i]; }
    return out;
  }

  // common ions (OpenStax Chemistry 2e, section 2.6) by Z: charges
  var IONS = { 1: [1, -1], 3: [1], 4: [2], 7: [-3], 8: [-2], 9: [-1], 11: [1], 12: [2], 13: [3], 15: [-3], 16: [-2], 17: [-1], 19: [1], 20: [2], 26: [2, 3], 29: [1, 2], 30: [2], 34: [-2], 35: [-1] };

  // half-life in words
  function sig(v, d) { var s = Number(v.toPrecision(d)); return s >= 1000 ? s.toLocaleString('en-US') : String(s); }
  function sci(v, unit) { var ex = Math.floor(Math.log10(v)), m = v / Math.pow(10, ex); m = Number(m.toPrecision(2)); if (m >= 10) { m /= 10; ex++; } return (m === 1 ? '' : m + ' × ') + '10' + sup(ex).replace('-', '⁻') + ' ' + unit; }
  function halfLifeText(sec) {
    if (sec === null || sec === undefined) return 'not measured';
    var y = sec / YEAR;
    if (sec < 1e-9) return sci(sec, 's');
    if (sec < 1e-6) return sig(sec * 1e9, 3) + ' ns';
    if (sec < 1e-3) return sig(sec * 1e6, 3) + ' µs';
    if (sec < 1) return sig(sec * 1e3, 3) + ' ms';
    if (sec < 120) return sig(sec, 3) + ' s';
    if (sec < 7200) return sig(sec / 60, 3) + ' minutes';
    if (sec < 2 * 86400) return sig(sec / 3600, 3) + ' hours';
    if (y < 1) return sig(sec / 86400, 3) + ' days';
    if (y < 1e6) return sig(y, 3) + ' years';
    if (y < 1e9) return sig(y / 1e6, 3) + ' million years';
    if (y < 1e12) return sig(y / 1e9, 3) + ' billion years';
    return sci(y, 'years');
  }
  function modeLabel(m) { return MODES[m] ? MODES[m][2] : m; }
  function modeWords(m) { return MODES[m] ? MODES[m][3] : m; }
  function modesText(modes) {
    return modes.filter(function (x, i) { return i === 0 || (x.pct !== null && x.pct >= 1); }).map(function (x) {
      return modeLabel(x.m) + (x.pct !== null && modes.length > 1 ? ' ' + (x.pct >= 99.5 ? Math.round(x.pct * 10) / 10 : Math.round(x.pct)) + '%' : '');
    }).join(', ');
  }

  // radioactive samples: each nucleus gets an exponential lifetime t = −T½·log₂(u)
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; }
  function lifetimes(count, half, rand) { var t = new Float64Array(count); for (var i = 0; i < count; i++) { var u = rand(); t[i] = -half * Math.log2(u > 0 ? u : 1e-12); } return t; }
  function remaining(times, t) { var k = 0; for (var i = 0; i < times.length; i++) if (times[i] > t) k++; return k; }
  function expected(count, half, t) { return count * Math.pow(2, -t / half); }
  function ageFromFraction(f, half) { return half * Math.log2(1 / f); }
  function fractionAtAge(t, half) { return Math.pow(2, -t / half); }

  // isotopes for the Half-life scene (half-lives from NUBASE2020)
  var SAMPLES = [
    { id: 'c14', z: 6, a: 14, half: 5700, unit: 'y', to: 'nitrogen-14', mode: 'b-', use: 'In every living thing. Used to date wood, bone and cloth up to about 50,000 years old.' },
    { id: 'h3', z: 1, a: 3, half: 12.32, unit: 'y', to: 'helium-3', mode: 'b-', use: 'Makes the glow in some exit signs and watch dials that need no battery.' },
    { id: 'f18', z: 9, a: 18, half: 109.734, unit: 'min', to: 'oxygen-18', mode: 'b+', use: 'Used in PET scans in hospitals. It has to be made close by, because half of it is gone in under two hours.' },
    { id: 'i131', z: 53, a: 131, half: 8.0249, unit: 'd', to: 'xenon-131', mode: 'b-', use: 'Used by doctors to treat an overactive thyroid gland.' },
    { id: 'co60', z: 27, a: 60, half: 5.2714, unit: 'y', to: 'nickel-60', mode: 'b-', use: 'Its gamma rays are used to kill germs on medical supplies and to treat cancer.' },
    { id: 'rn222', z: 86, a: 222, half: 3.8215, unit: 'd', to: 'polonium-218', mode: 'a', use: 'A gas that seeps out of the ground, made by the slow decay of uranium in rocks.' },
    { id: 'k40', z: 19, a: 40, half: 1.248e9, unit: 'y', to: 'calcium-40 (89%) or argon-40 (11%)', mode: 'b-', branch: { to2: 'argon-40', p2: 0.1072 }, use: 'In bananas, in soil and in you. Rocks are dated from the argon-40 it leaves behind.' },
    { id: 'u238', z: 92, a: 238, half: 4.463e9, unit: 'y', to: 'thorium-234', mode: 'a', use: 'Its half-life is close to the age of Earth (4.54 billion years), so about half of Earth’s first uranium-238 is still here.' }
  ];
  var SAMPLE_NAMES = { 53: ['I', 'Iodine'], 86: ['Rn', 'Radon'], 92: ['U', 'Uranium'] };

  var api = {
    EL: EL, CATS: CATS, AB: AB, MODES: MODES, SAMPLES: SAMPLES, SAMPLE_NAMES: SAMPLE_NAMES, IONS: IONS, YEAR: YEAR, AGE_UNIVERSE_Y: AGE_UNIVERSE_Y,
    el: el, nuclide: nuclide, nucleus: nucleus, daughter: daughter, abundance: abundance, stableIsotopes: stableIsotopes, commonIsotope: commonIsotope,
    range: function (z) { return range[z]; }, all: function () { var out = []; for (var k in nuc) out.push(nuc[k]); return out; },
    config: config, configText: configText, shells: shells, sup: sup,
    halfLifeText: halfLifeText, modeLabel: modeLabel, modeWords: modeWords, modesText: modesText,
    rng: rng, lifetimes: lifetimes, remaining: remaining, expected: expected, ageFromFraction: ageFromFraction, fractionAtAge: fractionAtAge
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AtomModel = api;
})(typeof window !== 'undefined' ? window : this);
