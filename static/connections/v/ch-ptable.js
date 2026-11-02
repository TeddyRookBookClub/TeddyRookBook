/* The periodic table colored by block (s, p, d, f): tap an element, or use the slider, to see how its electrons fill. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var E = 'H,Hydrogen,1,1,s,1s1,0|He,Helium,1,18,s,1s2,0|Li,Lithium,2,1,s,[He] 2s1,0|Be,Beryllium,2,2,s,[He] 2s2,0|B,Boron,2,13,p,[He] 2s2 2p1,0|C,Carbon,2,14,p,[He] 2s2 2p2,0|N,Nitrogen,2,15,p,[He] 2s2 2p3,0|O,Oxygen,2,16,p,[He] 2s2 2p4,0|F,Fluorine,2,17,p,[He] 2s2 2p5,0|Ne,Neon,2,18,p,[He] 2s2 2p6,0|Na,Sodium,3,1,s,[Ne] 3s1,0|Mg,Magnesium,3,2,s,[Ne] 3s2,0|Al,Aluminum,3,13,p,[Ne] 3s2 3p1,0|Si,Silicon,3,14,p,[Ne] 3s2 3p2,0|P,Phosphorus,3,15,p,[Ne] 3s2 3p3,0|S,Sulfur,3,16,p,[Ne] 3s2 3p4,0|Cl,Chlorine,3,17,p,[Ne] 3s2 3p5,0|Ar,Argon,3,18,p,[Ne] 3s2 3p6,0|K,Potassium,4,1,s,[Ar] 4s1,0|Ca,Calcium,4,2,s,[Ar] 4s2,0|Sc,Scandium,4,3,d,[Ar] 3d1 4s2,0|Ti,Titanium,4,4,d,[Ar] 3d2 4s2,0|V,Vanadium,4,5,d,[Ar] 3d3 4s2,0|Cr,Chromium,4,6,d,[Ar] 3d5 4s1,1|Mn,Manganese,4,7,d,[Ar] 3d5 4s2,0|Fe,Iron,4,8,d,[Ar] 3d6 4s2,0|Co,Cobalt,4,9,d,[Ar] 3d7 4s2,0|Ni,Nickel,4,10,d,[Ar] 3d8 4s2,0|Cu,Copper,4,11,d,[Ar] 3d10 4s1,1|Zn,Zinc,4,12,d,[Ar] 3d10 4s2,0|Ga,Gallium,4,13,p,[Ar] 3d10 4s2 4p1,0|Ge,Germanium,4,14,p,[Ar] 3d10 4s2 4p2,0|As,Arsenic,4,15,p,[Ar] 3d10 4s2 4p3,0|Se,Selenium,4,16,p,[Ar] 3d10 4s2 4p4,0|Br,Bromine,4,17,p,[Ar] 3d10 4s2 4p5,0|Kr,Krypton,4,18,p,[Ar] 3d10 4s2 4p6,0|Rb,Rubidium,5,1,s,[Kr] 5s1,0|Sr,Strontium,5,2,s,[Kr] 5s2,0|Y,Yttrium,5,3,d,[Kr] 4d1 5s2,0|Zr,Zirconium,5,4,d,[Kr] 4d2 5s2,0|Nb,Niobium,5,5,d,[Kr] 4d4 5s1,1|Mo,Molybdenum,5,6,d,[Kr] 4d5 5s1,1|Tc,Technetium,5,7,d,[Kr] 4d5 5s2,0|Ru,Ruthenium,5,8,d,[Kr] 4d7 5s1,1|Rh,Rhodium,5,9,d,[Kr] 4d8 5s1,1|Pd,Palladium,5,10,d,[Kr] 4d10,1|Ag,Silver,5,11,d,[Kr] 4d10 5s1,1|Cd,Cadmium,5,12,d,[Kr] 4d10 5s2,0|In,Indium,5,13,p,[Kr] 4d10 5s2 5p1,0|Sn,Tin,5,14,p,[Kr] 4d10 5s2 5p2,0|Sb,Antimony,5,15,p,[Kr] 4d10 5s2 5p3,0|Te,Tellurium,5,16,p,[Kr] 4d10 5s2 5p4,0|I,Iodine,5,17,p,[Kr] 4d10 5s2 5p5,0|Xe,Xenon,5,18,p,[Kr] 4d10 5s2 5p6,0|Cs,Cesium,6,1,s,[Xe] 6s1,0|Ba,Barium,6,2,s,[Xe] 6s2,0|La,Lanthanum,6,3,d,[Xe] 5d1 6s2,1|Ce,Cerium,9,4,f,[Xe] 4f1 5d1 6s2,1|Pr,Praseodymium,9,5,f,[Xe] 4f3 6s2,0|Nd,Neodymium,9,6,f,[Xe] 4f4 6s2,0|Pm,Promethium,9,7,f,[Xe] 4f5 6s2,0|Sm,Samarium,9,8,f,[Xe] 4f6 6s2,0|Eu,Europium,9,9,f,[Xe] 4f7 6s2,0|Gd,Gadolinium,9,10,f,[Xe] 4f7 5d1 6s2,1|Tb,Terbium,9,11,f,[Xe] 4f9 6s2,0|Dy,Dysprosium,9,12,f,[Xe] 4f10 6s2,0|Ho,Holmium,9,13,f,[Xe] 4f11 6s2,0|Er,Erbium,9,14,f,[Xe] 4f12 6s2,0|Tm,Thulium,9,15,f,[Xe] 4f13 6s2,0|Yb,Ytterbium,9,16,f,[Xe] 4f14 6s2,0|Lu,Lutetium,9,17,f,[Xe] 4f14 5d1 6s2,0|Hf,Hafnium,6,4,d,[Xe] 4f14 5d2 6s2,0|Ta,Tantalum,6,5,d,[Xe] 4f14 5d3 6s2,0|W,Tungsten,6,6,d,[Xe] 4f14 5d4 6s2,0|Re,Rhenium,6,7,d,[Xe] 4f14 5d5 6s2,0|Os,Osmium,6,8,d,[Xe] 4f14 5d6 6s2,0|Ir,Iridium,6,9,d,[Xe] 4f14 5d7 6s2,0|Pt,Platinum,6,10,d,[Xe] 4f14 5d9 6s1,1|Au,Gold,6,11,d,[Xe] 4f14 5d10 6s1,1|Hg,Mercury,6,12,d,[Xe] 4f14 5d10 6s2,0|Tl,Thallium,6,13,p,[Xe] 4f14 5d10 6s2 6p1,0|Pb,Lead,6,14,p,[Xe] 4f14 5d10 6s2 6p2,0|Bi,Bismuth,6,15,p,[Xe] 4f14 5d10 6s2 6p3,0|Po,Polonium,6,16,p,[Xe] 4f14 5d10 6s2 6p4,0|At,Astatine,6,17,p,[Xe] 4f14 5d10 6s2 6p5,0|Rn,Radon,6,18,p,[Xe] 4f14 5d10 6s2 6p6,0|Fr,Francium,7,1,s,[Rn] 7s1,0|Ra,Radium,7,2,s,[Rn] 7s2,0|Ac,Actinium,7,3,d,[Rn] 6d1 7s2,1|Th,Thorium,10,4,f,[Rn] 6d2 7s2,1|Pa,Protactinium,10,5,f,[Rn] 5f2 6d1 7s2,1|U,Uranium,10,6,f,[Rn] 5f3 6d1 7s2,1|Np,Neptunium,10,7,f,[Rn] 5f4 6d1 7s2,1|Pu,Plutonium,10,8,f,[Rn] 5f6 7s2,0|Am,Americium,10,9,f,[Rn] 5f7 7s2,0|Cm,Curium,10,10,f,[Rn] 5f7 6d1 7s2,1|Bk,Berkelium,10,11,f,[Rn] 5f9 7s2,0|Cf,Californium,10,12,f,[Rn] 5f10 7s2,0|Es,Einsteinium,10,13,f,[Rn] 5f11 7s2,0|Fm,Fermium,10,14,f,[Rn] 5f12 7s2,0|Md,Mendelevium,10,15,f,[Rn] 5f13 7s2,0|No,Nobelium,10,16,f,[Rn] 5f14 7s2,0|Lr,Lawrencium,10,17,f,[Rn] 5f14 7s2 7p1,1|Rf,Rutherfordium,7,4,d,[Rn] 5f14 6d2 7s2,2|Db,Dubnium,7,5,d,[Rn] 5f14 6d3 7s2,2|Sg,Seaborgium,7,6,d,[Rn] 5f14 6d4 7s2,2|Bh,Bohrium,7,7,d,[Rn] 5f14 6d5 7s2,2|Hs,Hassium,7,8,d,[Rn] 5f14 6d6 7s2,2|Mt,Meitnerium,7,9,d,[Rn] 5f14 6d7 7s2,2|Ds,Darmstadtium,7,10,d,[Rn] 5f14 6d8 7s2,2|Rg,Roentgenium,7,11,d,[Rn] 5f14 6d9 7s2,2|Cn,Copernicium,7,12,d,[Rn] 5f14 6d10 7s2,2|Nh,Nihonium,7,13,p,[Rn] 5f14 6d10 7s2 7p1,2|Fl,Flerovium,7,14,p,[Rn] 5f14 6d10 7s2 7p2,2|Mc,Moscovium,7,15,p,[Rn] 5f14 6d10 7s2 7p3,2|Lv,Livermorium,7,16,p,[Rn] 5f14 6d10 7s2 7p4,2|Ts,Tennessine,7,17,p,[Rn] 5f14 6d10 7s2 7p5,2|Og,Oganesson,7,18,p,[Rn] 5f14 6d10 7s2 7p6,2'.split('|').map(function (r, i) { var f = r.split(','); return { z: i + 1, s: f[0], n: f[1], r: +f[2], c: +f[3], b: f[4], cf: f[5], x: +f[6] }; });
  var BL = { s: ['s block', 2, 0], p: ['p block', 6, 2], d: ['d block', 10, 1], f: ['f block', 14, 3] };
  function supa(t) { return t.replace(/([spdf])(\d+)/g, '$1<sup>$2</sup>'); }
  Cx.viz('ch-ptable', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}.vb-st .vb-svg{max-width:760px}.vb-key{display:inline-flex;align-items:center;gap:.3rem;font-size:.86rem;margin-right:.4rem}.vb-key i{width:12px;height:12px;border-radius:3px;display:inline-block}.vb-card{font-size:.92rem;line-height:1.5}.vb-card p{margin:.25rem 0}.vb-grow input{width:12rem;max-width:50vw}');
    var cur = 26, timer = 0;
    root.innerHTML = '<svg class="vb-svg vb-wide" viewBox="0 0 370 208" role="img" aria-label="Periodic table colored by block"></svg>' +
      '<div class="vb-row vb-wrap vb-leg"></div>' +
      '<div class="vb-row"><label class="cx-field vb-grow"><span class="cx-lbl">Element</span><input type="range" min="1" max="118" value="26" class="vb-rng"></label>' +
      '<button type="button" class="cx-btn" data-a="play">Fill the table in order</button></div><div class="vb-card" aria-live="polite"></div>';
    var svg = root.querySelector('svg'), card = root.querySelector('.vb-card'), rng = root.querySelector('.vb-rng'), cells = [];
    function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
    function pos(e) { var y = e.r > 7 ? e.r * 20 - 14 : e.r * 20 - 18; return [5 + (e.c - 1) * 20, y]; }
    function build() {
      var col = U.colors(); svg.innerHTML = ''; cells = [];
      E.forEach(function (e) {
        var p = pos(e), g = el('g', { transform: 'translate(' + p[0] + ' ' + p[1] + ')' });
        var r = el('rect', { width: 19, height: 19, rx: 2.5, fill: col.glass[BL[e.b][2]] }, g);
        var t = el('text', { x: 9.5, y: 13, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 700, fill: e.b === 'p' ? '#1d1a10' : '#fff' }, g); t.textContent = e.s;
        g.style.cursor = 'pointer'; g.addEventListener('click', function () { stop(); pick(e.z); });
        cells.push({ g: g, r: r });
      });
      var lb = el('text', { x: 45, y: 180, 'font-size': 7, fill: col.dim, 'text-anchor': 'end' }); lb.textContent = 'f block';
      paint();
    }
    function paint(upto) {
      var col = U.colors();
      cells.forEach(function (c, i) {
        var on = upto == null || i < upto;
        c.r.setAttribute('opacity', on ? 1 : 0.13);
        c.r.setAttribute('stroke', i === cur - 1 ? col.fg : 'none'); c.r.setAttribute('stroke-width', 2);
      });
    }
    function pick(z) {
      cur = z; rng.value = z; paint();
      var e = E[z - 1], b = BL[e.b];
      card.innerHTML = '<p><b>' + e.z + ' · ' + e.n + ' (' + e.s + ')</b> · ' + b[0] + '</p><p>Electrons: ' + supa(e.cf) + '</p><p class="vb-dim">' +
        (e.x === 1 ? 'This one breaks the usual filling order a little: in the real atom, an electron sits in a different subshell than the simple rule predicts.' : e.x === 2 ? 'Too short-lived to measure; this arrangement is predicted from theory.' :
        'Its last electron goes into ' + (e.b === 'f' ? 'an f subshell, which holds 14 electrons: the 14 columns of the f block.' : e.b === 'd' ? 'a d subshell, which holds 10 electrons: the 10 columns of the d block.' : e.b === 'p' ? 'a p subshell, which holds 6 electrons: the 6 columns of the p block.' : 'an s subshell, which holds 2 electrons: the 2 columns of the s block.')) + '</p>';
    }
    function stop() { clearInterval(timer); timer = 0; root.querySelector('[data-a=play]').textContent = 'Fill the table in order'; paint(); }
    root.querySelector('[data-a=play]').onclick = function () {
      if (timer) { stop(); return; }
      if (U.still()) { pick(118); return; }
      var z = 0; this.textContent = 'Stop';
      timer = setInterval(function () { z++; cur = z; paint(z); if (z % 3 === 0 || z === 118) pick(z), paint(z); if (z >= 118) stop(); }, 70);
    };
    rng.oninput = function () { stop(); pick(+rng.value); };
    var leg = root.querySelector('.vb-leg');
    function legend() { var col = U.colors(); leg.innerHTML = ['s', 'p', 'd', 'f'].map(function (k) { return '<span class="vb-key"><i style="background:' + col.glass[BL[k][2]] + '"></i>' + BL[k][0] + ': ' + BL[k][1] + ' wide</span>'; }).join(''); }
    build(); legend(); pick(cur); U.onTheme(function () { build(); legend(); pick(cur); });
  });
  function VU(v, css) {
    if (css && !document.getElementById('vb-css-' + v.id)) { var st = document.createElement('style'); st.id = 'vb-css-' + v.id; st.textContent = css; document.head.appendChild(st); }
    v.stage.classList.add('vb-st');
    return {
      dark: v.dark, still: function () { return v.reduced; }, onTheme: v.onTheme,
      colors: function () { var c = v.colors(), d = c.dark; return { bg2: c.bg, fg: c.ink, dim: c.muted, accent: c.green, gold: c.gold, lead: d ? '#0b0d0e' : '#2a2622',
        glass: d ? ['#4a86e8', '#e0584a', '#e6b93e', '#3faa72', '#9a6ad6', '#4fb8c8'] : ['#2d63b8', '#c0392b', '#d9a521', '#2e8b57', '#7a4bb0', '#2a9bb0'] }; },
      size: function (cv, ratio) {
        var w = cv.parentNode.clientWidth || 600, h = Math.round(w * ratio), r = Math.min(2, window.devicePixelRatio || 1);
        if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.height = h + 'px'; }
        var ctx = cv.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0); return { ctx: ctx, w: w, h: h };
      },
      onResize: function (el, f) { var t, lw = el.clientWidth; try { new ResizeObserver(function () { if (!el.clientWidth || el.clientWidth === lw) return; lw = el.clientWidth; clearTimeout(t); t = setTimeout(f, 80); }).observe(el); } catch (e) { } }
    };
  }
})();
