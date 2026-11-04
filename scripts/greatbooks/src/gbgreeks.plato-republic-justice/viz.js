/* gbgreeks.plato-republic-justice: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-city-soul: the three classes of the city in words and the three parts of the soul (Republic II-IV). */
ML.viz.register('gb-city-soul', function (el, opts, V) {
  var F = frame(el, 400, 250, 'The three parts of Plato\'s city beside the three parts of the soul'), sv = F.svg, ro = V.readout(el);
  var L = [
    ['Rulers', 'Reason', 'Wisdom', 'The few who rule, trained for many years, beside <b>reason</b>, the part of you that thinks things through. Their virtue is <b>wisdom</b>.'],
    ['Soldiers', 'Spirit', 'Courage', 'The guardians who defend the city, beside <b>spirit</b>, the part that feels anger at wrong and stands firm. Their virtue is <b>courage</b>.'],
    ['Producers', 'Appetite', 'Moderation', 'Farmers, builders and traders, beside <b>appetite</b>, the part that wants food, drink and comfort. <b>Moderation</b> is all three parts agreeing about who should lead.']
  ];
  var sel = 0, just = true;
  function draw() {
    clear(sv);
    Tx(sv, 74, 20, 'THE CITY', 'b mut'); Tx(sv, 200, 20, 'THE SOUL', 'b mut'); Tx(sv, 326, 20, 'ITS VIRTUE', 'b mut');
    var order = just ? [0, 1, 2] : [2, 1, 0];
    order.forEach(function (k, row) {
      var l = L[k], y = 34 + row * 62, on = k === sel, g = S('g', { 'class': 'gbe-hit', tabindex: 0, role: 'button', 'aria-label': l[0] + ', ' + l[1] + ', ' + l[2] }, sv);
      [[14, l[0]], [140, l[1]], [266, l[2]]].forEach(function (c, j) {
        S('rect', { x: c[0], y: y, width: 120, height: 48, rx: 9, 'class': on ? 'gbe-box-on' : (j === 2 ? 'gbe-box-gold' : 'gbe-box') }, g);
        Tx(g, c[0] + 60, y + 29, c[1], 'b' + (j === 2 ? ' acc' : ''));
      });
      function pick() { sel = k; draw(); }
      g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    Tx(sv, 200, 238, just ? 'Justice: each part does its own work, with reason leading' : 'Injustice: appetite on top, giving the orders', 'b ' + (just ? 'gbe-tf' : 'gbe-tg'));
    ro.set(just ? L[sel][3] : 'When <b>appetite</b> takes charge, wanting more and more, and reason only works out how to get it, the soul is turned upside down. Plato compares it to a city run by its worst desires. ' + 'Selected: ' + L[sel][1] + '.');
  }
  V.seg(F.ctl, { label: 'Order', items: [['j', 'Just'], ['u', 'Unjust']], value: 'j', change: function (v) { just = v === 'j'; draw(); } });
  draw();
});
