/* gbgreeks.plato-gorgias-protagoras: visuals (gbe2, our own designs). SVG helpers first. */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gb-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbe-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
/* gb-flattery: Socrates' map of arts and their imitations in the Gorgias (464b-465d). */
ML.viz.register('gb-flattery', function (el, opts, V) {
  var F = frame(el, 400, 262, 'Four true arts and the four flatteries that imitate them, from Plato\'s Gorgias'), sv = F.svg, ro = V.readout(el);
  var C = [ // [column, row, art, sham, note]
    [0, 0, 'Gymnastics', 'Cosmetics', 'Training keeps the body truly fit. Dressing up and face paint only make it <em>look</em> fit.'],
    [0, 1, 'Medicine', 'Cookery', 'Medicine knows what is good for a sick body. Cookery, in Socrates\' picture, only knows what tastes good, and pretends that is the same thing. Children choosing between a doctor and a cook would pick the cook.'],
    [1, 0, 'Lawmaking', 'Sophistry', 'Good laws shape a healthy soul and city. Sophistry, clever arguing for pay, imitates lawmaking.'],
    [1, 1, 'Justice', 'Rhetoric', 'Justice sets a wrongdoer right, as medicine heals the body. Rhetoric, as Gorgias teaches it, aims at pleasing a crowd, not making it better: so Socrates calls it a kind of flattery.']
  ];
  var mode = 'both', sel = 3;
  function draw() {
    clear(sv);
    Tx(sv, 144, 20, 'For the BODY', 'b mut'); Tx(sv, 310, 20, 'For the SOUL', 'b mut');
    Tx(sv, 33, 82, 'Keeps it', 'sm mut'); Tx(sv, 33, 96, 'well', 'sm mut'); Tx(sv, 33, 182, 'Sets it', 'sm mut'); Tx(sv, 33, 196, 'right', 'sm mut');
    C.forEach(function (c, i) {
      var x = 66 + c[0] * 166, y = 34 + c[1] * 102, g = S('g', { 'class': 'gbe-hit', tabindex: 0, role: 'button', 'aria-label': c[2] + ' and its imitation, ' + c[3] }, sv);
      S('rect', { x: x, y: y, width: 156, height: 92, rx: 10, 'class': i === sel ? 'gbe-box-on' : 'gbe-box' }, g);
      if (mode !== 'sham') Tx(g, x + 78, y + (mode === 'both' ? 36 : 52), c[2], 'b lg acc');
      if (mode !== 'art') Tx(g, x + 78, y + (mode === 'both' ? 70 : 52), (mode === 'both' ? 'imitated by ' + c[3].toLowerCase() : c[3]), mode === 'both' ? 'gbe-tg' : 'b lg gbe-tg');
      function pick() { sel = i; draw(); }
      g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    Tx(sv, 200, 240, 'cosmetics : gymnastics  =  cookery : medicine', 'sm mut'); Tx(sv, 200, 256, 'sophistry : lawmaking  =  rhetoric : justice', 'sm mut');
    var c = C[sel]; ro.set('<b>' + c[2] + '</b> and its imitation, <b>' + c[3] + '</b>. ' + c[4]);
  }
  V.seg(F.ctl, { label: 'Show', items: [['art', 'The true arts'], ['sham', 'The imitations'], ['both', 'Both']], value: mode, change: function (v) { mode = v; draw(); } });
  draw();
});
