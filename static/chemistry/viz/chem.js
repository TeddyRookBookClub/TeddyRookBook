/* Course visuals for chem, merged from part files by /tmp/merge_parts.js. */
/* ---- part B ---- */
/* Course visual for Chemistry (part B): chem-activity, the activity series at the bench.
   <div class="ml-viz" data-viz="chem-activity" data-opts='{"metal":"Zn","sol":"CuSO4"}'></div>
   opts:
     metal: 'Zn'        the metal strip: 'Mg' | 'Zn' | 'Fe' | 'Cu' | 'Ag'
     sol: 'CuSO4'       the solution: 'MgSO4' | 'ZnSO4' | 'FeSO4' | 'CuSO4' | 'AgNO3' | 'HCl'
     edit: true         false hides the buttons (a fixed figure)
     quiet: false       true hides the verdict and the equation (for problems); the pictures stay
     task: ''           an instruction shown above the picture
   Two beakers, "At the start" and "Later": a metal above the dissolved metal (or above hydrogen, for HCl) gets a coating
   of the other metal (or gives off hydrogen bubbles), and the solution's color changes where the ions change (Cu²⁺ is
   blue, Fe²⁺ pale green). The ladder beside it marks both metals. Order (OpenStax Chemistry 2e, 4.2):
   Mg > Zn > Fe > H > Cu > Ag. Light and dark themes, keyboard and touch (ordinary buttons), no motion.          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder; if (!ML || !ML.viz || !ML.viz.register) return;
  var V = ML.viz;
  var css = '.chact{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}.chact-pic{flex:1 1 300px;min-width:0}.chact-pic svg{width:100%;height:auto;display:block}' +
    '.chact-lad{flex:1 1 170px;max-width:340px;list-style:none;margin:0;padding:0;font-size:.95rem}.chact-lad li{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:3px 10px;border-radius:6px;margin:2px 0;border:1px solid transparent;white-space:nowrap}' +
    '.chact-lad li.m{border-color:var(--chact-g);font-weight:700}.chact-lad li.s{border-color:var(--chact-b);font-weight:700}.chact-lad .tag{font-size:.75rem;opacity:.8;font-weight:400}' +
    '.chact-rows{display:flex;flex-wrap:wrap;gap:8px 16px;margin:6px 0}.chact-task{font-weight:600;margin:4px 0}.chact-eq{font-size:1.02rem}';
  if (!D.getElementById('chact-css')) { var st = D.createElement('style'); st.id = 'chact-css'; st.textContent = css; D.head.appendChild(st); }
  var ORDER = ['Mg', 'Zn', 'Fe', 'H', 'Cu', 'Ag'];
  var NAME = { Mg: 'magnesium', Zn: 'zinc', Fe: 'iron', Cu: 'copper', Ag: 'silver', H: 'hydrogen' };
  var SOL = { MgSO4: ['Mg', 'magnesium sulfate'], ZnSO4: ['Zn', 'zinc sulfate'], FeSO4: ['Fe', 'iron(II) sulfate'], CuSO4: ['Cu', 'copper(II) sulfate'], AgNO3: ['Ag', 'silver nitrate'], HCl: ['H', 'hydrochloric acid'] };
  var STRIP = { Mg: '#c9ced4', Zn: '#a3adb6', Fe: '#70757a', Cu: '#c4703f', Ag: '#d9dde2' };
  var COAT = { Zn: '#7d8790', Fe: '#3f4246', Cu: '#a24a22', Ag: '#8d939a' };
  // balanced equations for the pairs that react (HTML)
  function sub(s) { return s.replace(/(\d+)/g, '<sub>$1</sub>'); }
  var EQ = {
    'Mg|ZnSO4': 'Mg + ZnSO4 → MgSO4 + Zn', 'Mg|FeSO4': 'Mg + FeSO4 → MgSO4 + Fe', 'Mg|CuSO4': 'Mg + CuSO4 → MgSO4 + Cu', 'Mg|AgNO3': 'Mg + 2AgNO3 → Mg(NO3)2 + 2Ag', 'Mg|HCl': 'Mg + 2HCl → MgCl2 + H2',
    'Zn|FeSO4': 'Zn + FeSO4 → ZnSO4 + Fe', 'Zn|CuSO4': 'Zn + CuSO4 → ZnSO4 + Cu', 'Zn|AgNO3': 'Zn + 2AgNO3 → Zn(NO3)2 + 2Ag', 'Zn|HCl': 'Zn + 2HCl → ZnCl2 + H2',
    'Fe|CuSO4': 'Fe + CuSO4 → FeSO4 + Cu', 'Fe|AgNO3': 'Fe + 2AgNO3 → Fe(NO3)2 + 2Ag', 'Fe|HCl': 'Fe + 2HCl → FeCl2 + H2', 'Cu|AgNO3': 'Cu + 2AgNO3 → Cu(NO3)2 + 2Ag' };
  function eqHtml(s) { return s.split(' ').map(function (t) { var m = /^(\d*)(.*)$/.exec(t); return /^[A-Z(]/.test(m[2]) ? m[1] + sub(m[2]) : t; }).join(' '); }
  function ionColor(ion, dark) { return ion === 'Cu' ? (dark ? 'rgba(90,160,255,.55)' : 'rgba(40,120,220,.42)') : ion === 'Fe' ? (dark ? 'rgba(140,210,140,.32)' : 'rgba(110,180,110,.28)') : (dark ? 'rgba(200,220,230,.10)' : 'rgba(150,180,200,.14)'); }
  function el(tag, attrs, parent) { var e = D.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  V.register('chem-activity', function (host, o) {
    o = o || {};
    var S = { metal: STRIP[o.metal] ? o.metal : 'Zn', sol: SOL[o.sol] ? o.sol : 'CuSO4' }, quiet = !!(o.quiet || o.readout === false);
    host.setAttribute('role', 'group'); host.setAttribute('aria-label', o.label || 'Activity series: a metal strip in a solution');
    if (o.task) { var tk = D.createElement('div'); tk.className = 'chact-task'; tk.textContent = o.task; host.appendChild(tk); }
    if (o.edit !== false) {
      var rows = D.createElement('div'); rows.className = 'chact-rows'; host.appendChild(rows);
      V.seg(rows, { label: 'Metal', items: ['Mg', 'Zn', 'Fe', 'Cu', 'Ag'].map(function (m) { return [m, m]; }), value: S.metal, change: function (v) { S.metal = v; draw(); } });
      V.seg(rows, { label: 'Solution', items: Object.keys(SOL).map(function (s) { return [s, s.replace(/(\d)/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; })]; }), value: S.sol, change: function (v) { S.sol = v; draw(); } });
    }
    var wrap = D.createElement('div'); wrap.className = 'chact'; host.appendChild(wrap);
    var pic = D.createElement('div'); pic.className = 'chact-pic'; wrap.appendChild(pic);
    var lad = D.createElement('ol'); lad.className = 'chact-lad'; lad.setAttribute('aria-label', 'Activity series, most active first'); wrap.appendChild(lad);
    var out = V.readout(host);
    var svg = el('svg', { viewBox: '0 0 460 250', role: 'img' }, pic), desc = el('desc', {}, svg);
    function beaker(g, x, title, liquid, strip, coat, bubbles, C) {
      el('text', { x: x + 80, y: 22, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.ink }, g).textContent = title;
      el('rect', { x: x + 14, y: 96, width: 132, height: 132, fill: liquid, rx: 4 }, g);
      el('path', { d: 'M' + (x + 10) + ' 50 L' + (x + 10) + ' 226 Q' + (x + 10) + ' 236 ' + (x + 20) + ' 236 L' + (x + 140) + ' 236 Q' + (x + 150) + ' 236 ' + (x + 150) + ' 226 L' + (x + 150) + ' 50', fill: 'none', stroke: C.axis, 'stroke-width': 3 }, g);
      el('rect', { x: x + 66, y: 40, width: 28, height: 168, fill: strip, stroke: C.axis, 'stroke-width': 1.2, rx: 2 }, g);
      if (coat) for (var i = 0; i < 14; i++) el('circle', { cx: x + 66 + ((i * 37) % 28), cy: 104 + i * 7.6, r: 5 + (i % 3), fill: coat }, g);
      if (coat) el('rect', { x: x + 64, y: 98, width: 32, height: 110, fill: coat, opacity: 0.55, rx: 3 }, g);
      if (bubbles) for (var j = 0; j < 12; j++) el('circle', { cx: x + 58 + (j % 2 ? 44 : 0) + ((j * 13) % 9) - 4, cy: 210 - j * 9, r: 3 + (j % 3), fill: 'none', stroke: C.ink, 'stroke-width': 1.2, opacity: 0.75 }, g);
    }
    function draw() {
      var C = V.colors(), dark = D.documentElement.getAttribute('data-theme') === 'dark';
      host.style.setProperty('--chact-g', C.green); host.style.setProperty('--chact-b', C.blue);
      while (svg.lastChild && svg.lastChild !== desc) svg.removeChild(svg.lastChild);
      var ion = SOL[S.sol][0], same = ion === S.metal, reacts = !same && ORDER.indexOf(S.metal) < ORDER.indexOf(ion);
      var g = el('g', {}, svg);
      beaker(g, 0, 'At the start', ionColor(ion, dark), STRIP[S.metal], null, false, C);
      // later: the dissolved metal ion is used up and the strip's metal goes into solution
      var later = reacts ? ionColor(S.metal, dark) : ionColor(ion, dark);
      beaker(g, 300 - 0, reacts ? 'Later' : 'Later: no change', later, STRIP[S.metal], reacts && ion !== 'H' ? COAT[ion] : null, reacts && ion === 'H', C);
      el('path', { d: 'M170 130 L280 130', stroke: C.muted, 'stroke-width': 2, 'marker-end': '' }, g);
      el('path', { d: 'M270 122 L282 130 L270 138', fill: 'none', stroke: C.muted, 'stroke-width': 2 }, g);
      // ladder
      lad.innerHTML = '';
      ORDER.forEach(function (m) {
        var li = D.createElement('li'); li.innerHTML = '<span>' + (m === 'H' ? 'H (hydrogen)' : m + ' (' + NAME[m] + ')') + '</span>';
        if (m === S.metal) { li.className = 'm'; li.innerHTML += ' <span class="tag">strip</span>'; }
        else if (m === ion) { li.className = 's'; li.innerHTML += ' <span class="tag">in solution</span>'; }
        lad.appendChild(li);
      });
      var e = EQ[S.metal + '|' + S.sol], what = NAME[S.metal] + ' in ' + SOL[S.sol][1];
      desc.textContent = what + (quiet ? '' : reacts ? ': it reacts.' : ': no reaction.');
      svg.setAttribute('aria-label', desc.textContent);
      if (quiet) { out.set(NAME[S.metal][0].toUpperCase() + what.slice(1) + '.'); return; }
      if (same) out.set('The strip and the dissolved ions are the same metal, so there is nothing to swap.');
      else if (reacts) out.set('<b>Reaction.</b> ' + NAME[S.metal][0].toUpperCase() + NAME[S.metal].slice(1) + ' is above ' + NAME[ion] + ', so it gives up electrons and replaces it' + (ion === 'H' ? ': hydrogen gas bubbles off.' : ': ' + NAME[ion] + ' metal coats the strip.') + ' <span class="chact-eq">' + eqHtml(e) + '</span>');
      else out.set('<b>No reaction.</b> ' + NAME[S.metal][0].toUpperCase() + NAME[S.metal].slice(1) + ' is below ' + NAME[ion] + ', so it cannot push ' + NAME[ion] + ' out of the solution.');
    }
    draw(); V.onTheme(draw);
    return { update: function (n) { if (n && n.metal) S.metal = n.metal; if (n && n.sol) S.sol = n.sol; draw(); } };
  });
})(window, document);
