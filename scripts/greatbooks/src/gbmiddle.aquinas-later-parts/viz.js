/* gbmiddle.aquinas-later-parts (gbe4, our own design).
   gb-virtue-wheel  the seven virtues Aquinas treats in the Second Part of the Second Part: the three theological
                    virtues (faith, hope, charity) in the inner ring, the four cardinal virtues (prudence, justice,
                    fortitude, temperance) in the outer ring. Tap one to see what it is, where the Summa treats it, and
                    the vices Aquinas sets against it. opts: v: "charity" (first shown). Summaries in our own words. */
(function () {
  var V = ML.viz; if (!V) return;
  var NS = 'http://www.w3.org/2000/svg', M = Math;
  function s(tag, at, txt) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; }
  var VIR = {
    faith: { n: 'Faith', kind: 'theological', q: 'II-II, q. 1 to 16', t: 'Believing what God has revealed, because God reveals it. Aquinas calls it an act of the mind, moved by the will.', opp: 'unbelief, heresy, giving up the faith' },
    hope: { n: 'Hope', kind: 'theological', q: 'II-II, q. 17 to 22', t: 'Looking forward to eternal happiness with God, trusting in God\'s help to reach it.', opp: 'despair (giving up) and presumption (taking it for granted)' },
    charity: { n: 'Charity', kind: 'theological', q: 'II-II, q. 23 to 46', t: 'Friendship with God, and love of neighbor, even of enemies, for God\'s sake. Aquinas calls it the greatest virtue and the "form" of all the others, because it directs them all to their last end. Its effects are joy, peace and mercy.', opp: 'hatred, spiritual sloth, envy, discord' },
    prudence: { n: 'Prudence', kind: 'cardinal', q: 'II-II, q. 47 to 56', t: 'Practical wisdom: right reason about what to do, here and now.', opp: 'rash or careless choices, negligence' },
    justice: { n: 'Justice', kind: 'cardinal', q: 'II-II, q. 57 to 122', t: 'A steady will to give each person what is due to them.', opp: 'injustice: taking or withholding what belongs to another' },
    fortitude: { n: 'Fortitude', kind: 'cardinal', q: 'II-II, q. 123 to 140', t: 'Courage: standing firm against fear, above all in great danger, for the sake of what is good.', opp: 'cowardice on one side, reckless daring on the other' },
    temperance: { n: 'Temperance', kind: 'cardinal', q: 'II-II, q. 141 to 170', t: 'Keeping our desires for pleasure within the measure that reason sets.', opp: 'overindulgence on one side, and on the other an unreasonable refusal of all pleasure' }
  };
  function arc(cx, cy, r0, r1, a0, a1) {
    function p(r, a) { return (cx + r * M.cos(a)).toFixed(1) + ' ' + (cy + r * M.sin(a)).toFixed(1); }
    var big = a1 - a0 > M.PI ? 1 : 0;
    return 'M' + p(r1, a0) + ' A' + r1 + ' ' + r1 + ' 0 ' + big + ' 1 ' + p(r1, a1) + ' L' + p(r0, a1) + ' A' + r0 + ' ' + r0 + ' 0 ' + big + ' 0 ' + p(r0, a0) + ' Z';
  }
  V.register('gb-virtue-wheel', function (el, o) {
    o = o || {};
    var cur = VIR[o.v] ? o.v : 'charity', G = {};
    var wrap = document.createElement('div'); wrap.className = 'gb-vw'; el.appendChild(wrap);
    var svg = s('svg', { viewBox: '-26 0 372 320', role: 'img', 'aria-label': 'A wheel of seven virtues: faith, hope and charity inside; prudence, justice, fortitude and temperance outside.' }); wrap.appendChild(svg);
    var cx = 160, cy = 160;
    function seg(k, r0, r1, a0, a1, cls) {
      var g = s('g', { 'class': 'gb-vw-seg ' + cls, tabindex: '0', role: 'button', 'aria-label': VIR[k].n });
      g.appendChild(s('path', { d: arc(cx, cy, r0, r1, a0, a1) }));
      var am = (a0 + a1) / 2, rm = (r0 + r1) / 2;
      g.appendChild(s('text', { x: (cx + rm * M.cos(am)).toFixed(1), y: (cy + rm * M.sin(am) + 5).toFixed(1), 'text-anchor': 'middle' }, VIR[k].n));
      svg.appendChild(g); G[k] = g;
      function pick() { cur = k; draw(); }
      g.addEventListener('click', pick);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    }
    var q = M.PI / 2, st = -M.PI / 2;
    ['prudence', 'justice', 'fortitude', 'temperance'].forEach(function (k, i) { seg(k, 92, 152, st - q / 2 + i * q + 0.02, st + q / 2 + i * q - 0.02, 'gb-vw-card'); });
    var t3 = 2 * M.PI / 3;
    ['faith', 'hope'].forEach(function (k, i) { seg(k, 40, 88, st - t3 / 2 + (i + 1) * t3 + 0.03, st + t3 / 2 + (i + 1) * t3 - 0.03, 'gb-vw-theo'); });
    var gc = s('g', { 'class': 'gb-vw-seg gb-vw-theo gb-vw-center', tabindex: '0', role: 'button', 'aria-label': 'Charity' });
    gc.appendChild(s('path', { d: arc(cx, cy, 40, 88, st - t3 / 2 + 0.03, st + t3 / 2 - 0.03) }));
    gc.appendChild(s('circle', { cx: cx, cy: cy, r: 36 }));
    gc.appendChild(s('text', { x: cx, y: cy + 5, 'text-anchor': 'middle' }, 'Charity'));
    gc.appendChild(s('text', { x: cx, y: cy - 58, 'text-anchor': 'middle', 'class': 'gb-vw-small' }, '(love)'));
    svg.appendChild(gc); G.charity = gc;
    gc.addEventListener('click', function () { cur = 'charity'; draw(); });
    gc.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cur = 'charity'; draw(); } });
    var key = document.createElement('p'); key.className = 'gb-vw-key'; key.innerHTML = '<span class="gb-vw-k1"></span> theological virtues (inner) <span class="gb-vw-k2"></span> cardinal virtues (outer)'; wrap.appendChild(key);
    var out = V.readout(el);
    function draw() {
      Object.keys(G).forEach(function (k) { G[k].classList.toggle('gb-vw-on', k === cur); G[k].setAttribute('aria-pressed', String(k === cur)); });
      var v = VIR[cur];
      out.set('<b>' + v.n + '</b>, a ' + v.kind + ' virtue (Summa, ' + v.q + '). ' + v.t + ' <i>Set against it:</i> ' + v.opp + '.' +
        (v.kind === 'theological' ? ' Aquinas calls these "theological" because God is their object and, he holds, their giver.' : ' "Cardinal" comes from the Latin <i>cardo</i>, a hinge: the other moral virtues turn on these four.'));
    }
    draw();
  });
})();
