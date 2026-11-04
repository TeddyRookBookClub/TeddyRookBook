/* gb17.spinoza-ethics: visuals (gbw2, our own design). */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || '', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gbw-stage'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbw-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl gbw-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
function person(g, x, y, s, robe) { // a generic standing figure in the site's cartoon skin color
  s = s || 1;
  S('path', { d: 'M' + (x - 8 * s) + ',' + (y + 22 * s) + ' L' + (x - 6 * s) + ',' + (y + 2 * s) + ' Q' + x + ',' + (y - 2 * s) + ' ' + (x + 6 * s) + ',' + (y + 2 * s) + ' L' + (x + 8 * s) + ',' + (y + 22 * s) + ' Z', 'class': 'gbw-robe' + (robe ? ' ' + robe : '') }, g);
  S('circle', { cx: x, cy: y - 6 * s, r: 6 * s, 'class': 'gbw-skin' }, g);
}
function clickable(g, label, fn) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label); g.setAttribute('class', (g.getAttribute('class') || '') + ' gbw-click'); g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); return g; }
/* gb-affects: Spinoza's compound emotions (Ethics III, Definitions of the Emotions), in our own words.
   base (pleasure or pain) + an accompanying idea -> the named emotion. */
ML.viz.register('gb-affects', function (el, opts, V) {
  var F = frame(el, 400, 200, 'Spinoza\'s emotions: a basic feeling plus an idea gives a named emotion'), sv = F.svg, ro = V.readout(el);
  var IDEA = [['ext', 'an outside cause', 'thinking of an outside cause'], ['doubt', 'something uncertain', 'thinking of something past or future whose outcome is in doubt'], ['sure', 'something now certain', 'thinking of something past or future, with all doubt removed'], ['self', 'oneself', 'looking at oneself and one\'s own power (or weakness)']];
  var R = { 'plus-ext': ['Love', 'VI'], 'minus-ext': ['Hatred', 'VII'], 'plus-doubt': ['Hope', 'XII'], 'minus-doubt': ['Fear', 'XIII'], 'plus-sure': ['Confidence', 'XIV'], 'minus-sure': ['Despair', 'XV'], 'plus-self': ['Self-approval', 'XXV'], 'minus-self': ['Humility', 'XXVI'] };
  var YNG = { Love: 'You feel glad, and you know who or what made you glad.', Hatred: 'You feel bad, and you blame someone or something outside you.', Hope: 'Gladness about something that might happen, but you are not sure.', Fear: 'Sadness about something that might happen, but you are not sure.', Confidence: 'Hope with the doubt taken away.', Despair: 'Fear with the doubt taken away.', 'Self-approval': 'Gladness when you think about what you can do.', Humility: 'Sadness when you think about what you can\'t do.' };
  var base = opts.base || 'plus', idea = opts.idea || 'ext';
  function draw() {
    clear(sv);
    var r = R[base + '-' + idea], ii = IDEA.filter(function (x) { return x[0] === idea; })[0];
    S('rect', { x: 14, y: 60, width: 110, height: 60, rx: 10, 'class': 'gbw-box' }, sv);
    Tx(sv, 69, 86, base === 'plus' ? 'Pleasure' : 'Pain', 'b');
    Tx(sv, 69, 104, base === 'plus' ? '(joy)' : '(sadness)', 'sm mut');
    Tx(sv, 140, 96, '+', 'b');
    S('rect', { x: 156, y: 60, width: 110, height: 60, rx: 10, 'class': 'gbw-box' }, sv);
    Tx(sv, 211, 86, 'the idea of', 'sm mut'); Tx(sv, 211, 104, ii[1], 'sm b');
    S('path', { d: 'M270,90 L290,90 M284,84 L290,90 L284,96', 'class': 'gbw-hot' }, sv);
    S('rect', { x: 294, y: 54, width: 96, height: 72, rx: 12, 'class': 'gbw-on' }, sv);
    Tx(sv, 342, 94, r[0], 'b serif');
    Tx(sv, 342, 112, 'Def. ' + r[1], 'sm mut');
    Tx(sv, 200, 22, 'Desire, pleasure and pain are the three basic emotions', 'sm mut');
    Tx(sv, 200, 160, 'Change the two parts below and watch the emotion change.', 'sm mut');
    ro.set(opts.young ? '<b>' + r[0] + ':</b> ' + YNG[r[0]] : '<b>' + r[0] + '</b> (Part III, Definitions of the Emotions, ' + r[1] + '): ' + (base === 'plus' ? 'pleasure' : 'pain') + ' that comes with ' + ii[2] + '. In our words; Spinoza\'s own definitions are more exact.');
  }
  V.seg(F.ctl, { label: 'Basic feeling', items: [['plus', 'Pleasure'], ['minus', 'Pain']], value: base, change: function (v) { base = v; draw(); } });
  V.seg(F.ctl, { label: 'Joined to the idea of', items: IDEA.map(function (x) { return [x[0], x[1]]; }), value: idea, change: function (v) { idea = v; draw(); } });
  draw();
});
