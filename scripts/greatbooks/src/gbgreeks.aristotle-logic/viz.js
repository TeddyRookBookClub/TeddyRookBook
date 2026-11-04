/* gbgreeks.aristotle-logic: visuals (gbe2, our own designs). SVG helpers first. */
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
/* gb-syllogism: build a categorical syllogism (four figures, forms A E I O) and test it on a three-circle diagram.
   Validity is checked by brute force over all 256 ways of filling the eight regions, assuming (as Aristotle does)
   that S, M and P each name something that exists. */
var FORMS = { A: ['All', 'are'], E: ['No', 'are'], I: ['Some', 'are'], O: ['Some', 'are not'] };
var FIG = { 1: [['M', 'P'], ['S', 'M']], 2: [['P', 'M'], ['S', 'M']], 3: [['M', 'P'], ['M', 'S']], 4: [['P', 'M'], ['M', 'S']] };
var MOODS = { '1AAA': 'Barbara', '1EAE': 'Celarent', '1AII': 'Darii', '1EIO': 'Ferio', '2EAE': 'Cesare', '2AEE': 'Camestres', '2EIO': 'Festino', '2AOO': 'Baroco', '3AAI': 'Darapti', '3EAO': 'Felapton', '3IAI': 'Disamis', '3AII': 'Datisi', '3OAO': 'Bocardo', '3EIO': 'Ferison', '4AAI': 'Bramantip', '4AEE': 'Camenes', '4IAI': 'Dimaris', '4EAO': 'Fesapo', '4EIO': 'Fresison' };
var BIT = { S: 1, M: 2, P: 4 };
function holds(f, x, y, occ) { // occ: array of 8 booleans, region r is occupied
  var X = BIT[x], Y = BIT[y], r;
  for (r = 0; r < 8; r++) { if (!occ[r] || !(r & X)) continue; if (f === 'A' && !(r & Y)) return false; if (f === 'E' && (r & Y)) return false; if (f === 'I' && (r & Y)) return true; if (f === 'O' && !(r & Y)) return true; }
  return f === 'A' || f === 'E';
}
function sylValid(fig, a, b, c) {
  var p = FIG[fig];
  for (var m = 0; m < 256; m++) {
    var occ = []; for (var r = 0; r < 8; r++) occ.push(!!(m >> r & 1));
    var ok = ['S', 'M', 'P'].every(function (t) { for (var r = 0; r < 8; r++) if (occ[r] && (r & BIT[t])) return true; return false; });
    if (!ok) continue;
    if (holds(a, p[0][0], p[0][1], occ) && holds(b, p[1][0], p[1][1], occ) && !holds(c, 'S', 'P', occ)) return false;
  }
  return true;
}
ML.gbSylValid = sylValid;
function sent(f, x, y) { return FORMS[f][0] + ' ' + x + ' ' + FORMS[f][1] + ' ' + y; }
ML.viz.register('gb-syllogism', function (el, opts, V) {
  var stage = document.createElement('div'); stage.className = 'gb-stage'; el.appendChild(stage);
  var c = V.canvas(stage, { aspect: 1.55, max: 330, min: 220 }), ro = V.readout(el), ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var st = { fig: String(opts.fig || 1), a: opts.a || 'A', b: opts.b || 'A', c: opts.c || 'A' };
  var cen = null;
  function circles(k) { var s = Math.min(c.w / 400, c.h / 258); return { s: s, ox: (c.w - 400 * s) / 2, S: [150, 160], P: [250, 160], M: [200, 92], r: 72 }; }
  function region(G, px, py) { var r = 0;['S', 'M', 'P'].forEach(function (t) { var dx = px - G[t][0], dy = py - G[t][1]; if (dx * dx + dy * dy <= G.r * G.r) r |= BIT[t]; }); return r; }
  function centers(G) { var sx = [], sy = [], n = []; for (var r = 0; r < 8; r++) { sx.push(0); sy.push(0); n.push(0); } for (var x = 100; x < 330; x += 3) for (var y = 15; y < 240; y += 3) { var r2 = region(G, x, y); sx[r2] += x; sy[r2] += y; n[r2]++; } return sx.map(function (v, i) { return n[i] ? [v / n[i], sy[i] / n[i]] : null; }); }
  function draw() {
    var k = V.colors(), ctx = c.ctx, G = circles(), p = FIG[st.fig];
    if (!cen) cen = centers(G);
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    ctx.save(); ctx.translate(G.ox, 0); ctx.scale(G.s, G.s);
    var empty = [];
    for (var r = 1; r < 8; r++) {
      var e = false;
      [[st.a, p[0]], [st.b, p[1]]].forEach(function (q) { var X = BIT[q[1][0]], Y = BIT[q[1][1]]; if (!(r & X)) return; if (q[0] === 'A' && !(r & Y)) e = true; if (q[0] === 'E' && (r & Y)) e = true; });
      empty[r] = e;
    }
    // shade emptied regions by sampling
    ctx.fillStyle = k.redSoft;
    for (var x = 76; x < 324; x += 2) for (var y = 18; y < 236; y += 2) { var rr = region(G, x + 1, y + 1); if (rr && empty[rr]) ctx.fillRect(x, y, 2, 2); }
    ctx.lineWidth = 2;
    [['S', k.blue], ['M', k.gold], ['P', k.green]].forEach(function (t) { ctx.strokeStyle = t[1]; ctx.beginPath(); ctx.arc(G[t[0]][0], G[t[0]][1], G.r, 0, 2 * Math.PI); ctx.stroke(); });
    ctx.font = '700 16px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = k.blue; ctx.fillText('S', 90, 200); ctx.fillStyle = k.green; ctx.fillText('P', 310, 200); ctx.fillStyle = k.gold; ctx.fillText('M', 200, 12);
    // particular premises: an x in each region that could hold it
    ctx.font = '700 14px system-ui,sans-serif'; ctx.fillStyle = k.ink;
    [[st.a, p[0]], [st.b, p[1]]].forEach(function (q) {
      if (q[0] !== 'I' && q[0] !== 'O') return;
      var X = BIT[q[1][0]], Y = BIT[q[1][1]], cand = [];
      for (var r = 1; r < 8; r++) if ((r & X) && (q[0] === 'I' ? (r & Y) : !(r & Y)) && !empty[r]) cand.push(r);
      cand.forEach(function (r) { var pt = cen[r]; if (pt) ctx.fillText(cand.length > 1 ? 'x?' : 'x', pt[0], pt[1] + (q === st.a ? -6 : 8)); });
    });
    ctx.restore();
    var ok = sylValid(st.fig, st.a, st.b, st.c), name = MOODS[st.fig + st.a + st.b + st.c];
    ro.set('1. ' + sent(st.a, p[0][0], p[0][1]) + '. &nbsp;2. ' + sent(st.b, p[1][0], p[1][1]) + '. &nbsp;So: <b>' + sent(st.c, 'S', 'P') + '</b>.<br>' +
      (ok ? '<b>Valid</b>' + (name ? ' (the form later called <i>' + name + '</i>)' : '') + ': whenever both premises are true, the conclusion must be true.' : '<b>Not valid</b>: the premises can be true while the conclusion is false.') +
      ' Shaded areas are empty; x marks where something must be.');
  }
  function row(lab, key, items) { V.seg(ctl, { label: lab, items: items, value: st[key], change: function (v) { st[key] = String(v); draw(); } }); var l = document.createElement('span'); l.className = 'ml-sl-lab'; l.textContent = lab; ctl.insertBefore(l, ctl.lastChild); }
  var AEIO = [['A', 'All'], ['E', 'No'], ['I', 'Some'], ['O', 'Some…not']];
  row('Figure', 'fig', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]); row('Premise 1', 'a', AEIO); row('Premise 2', 'b', AEIO); row('Conclusion', 'c', AEIO);
  c.onResize(function () { cen = null; draw(); }); V.onTheme(draw); draw();
});
