/* Math Gallery: the Monty Hall problem. Play it with real buttons for doors (3 or 10), then let the computer play 1,000
   games each way. The chart shows the running share of wins for "always stay" and "always switch". */
Gallery.piece('monty-hall', function (g) {
  var nD = 3, car, pick, opened, phase, me = { stay: [0, 0], sw: [0, 0] }, rnd = g.rng(1975), sims = null;
  var box = g.el('div', 'gx-mh'), msg = g.el('p', 'gx-mh-msg'), doors = g.el('div', 'gx-mh-doors'), act = g.el('div', 'gx-mh-act');
  box.appendChild(msg); box.appendChild(doors); box.appendChild(act); g.stage.appendChild(box);
  var cv = g.canvas({ aspect: 0.42, max: 260, min: 190, label: 'Chart of win rates for staying and switching over many games' });
  function int(n) { return Math.floor(rnd() * n); }
  function newGame() {
    car = int(nD); pick = -1; opened = []; phase = 0; act.innerHTML = '';
    msg.textContent = nD === 3 ? 'A car is behind one door and goats are behind the other two. Pick a door.' : 'A car is behind one of these ' + nD + ' doors. Pick a door.';
    paint(); g.say(msg.textContent);
  }
  function paint() {
    doors.innerHTML = '';
    for (var i = 0; i < nD; i++) (function (i) {
      var b = g.el('button', 'gx-mh-door'), open = opened.indexOf(i) >= 0 || phase === 2;
      b.type = 'button';
      b.innerHTML = '<span class="gx-mh-n">' + (i + 1) + '</span><span class="gx-mh-in" aria-hidden="true">' + (open ? (i === car ? '🚗' : '🐐') : '') + '</span>';
      b.setAttribute('aria-label', 'Door ' + (i + 1) + (open ? (i === car ? ', open: the car' : ', open: a goat') : ', closed') + (i === pick ? ', your pick' : ''));
      if (open) b.classList.add('open'); if (i === pick) b.classList.add('mine'); if (phase === 2 && i === car) b.classList.add('car');
      b.disabled = phase !== 0 || open;
      b.addEventListener('click', function () { choose(i); });
      doors.appendChild(b);
    })(i);
  }
  function choose(i) {
    pick = i; phase = 1;
    // the host opens every other door except one, never the car and never your pick
    var keep = i === car ? (function () { var k; do { k = int(nD); } while (k === i); return k; })() : car;
    opened = []; for (var k = 0; k < nD; k++) if (k !== i && k !== keep) opened.push(k);
    msg.textContent = 'You picked door ' + (i + 1) + '. The host, who knows where the car is, opens ' + (opened.length === 1 ? 'door ' + (opened[0] + 1) : opened.length + ' other doors') + ': ' + (opened.length === 1 ? 'a goat' : 'all goats') + '. Stay with door ' + (i + 1) + ', or switch to door ' + (keep + 1) + '?';
    act.innerHTML = '';
    g.button('Stay with door ' + (i + 1), function () { finish(i, 'stay'); }, { parent: act, pri: true });
    g.button('Switch to door ' + (keep + 1), function () { finish(keep, 'sw'); }, { parent: act, pri: true });
    paint(); g.say(msg.textContent); act.querySelector('button').focus();
  }
  function finish(f, how) {
    var win = f === car; pick = f; phase = 2; me[how][0] += win ? 1 : 0; me[how][1]++;
    msg.textContent = (win ? 'You win the car! ' : 'A goat. ') + 'You ' + (how === 'stay' ? 'stayed' : 'switched') + '. The car was behind door ' + (car + 1) + '.';
    act.innerHTML = ''; var b = g.button('Play again', newGame, { parent: act, pri: true });
    paint(); show(); g.say(msg.textContent); b.focus();
  }
  function show() {
    function r(a) { return a[1] ? a[0] + ' of ' + a[1] + ' (' + Math.round(100 * a[0] / a[1]) + '%)' : 'none yet'; }
    you.innerHTML = 'Your games: staying won <b>' + r(me.stay) + '</b> · switching won <b>' + r(me.sw) + '</b>';
  }
  function simulate(n) {
    var s = 0, w = 0, ps = [], pw = [];
    for (var i = 1; i <= n; i++) { var c = int(nD), p = int(nD); if (p === c) s++; else w++; ps.push(s / i); pw.push(w / i); }
    sims = { n: n, ps: ps, pw: pw }; g.redraw();
    g.say('In ' + n + ' games, staying won ' + s + ' and switching won ' + w + '.');
    simOut.innerHTML = 'Computer, ' + g.fmt(n) + ' games: stay won <b>' + g.fmt(s) + '</b> (' + (100 * s / n).toFixed(1) + '%) · switch won <b>' + g.fmt(w) + '</b> (' + (100 * w / n).toFixed(1) + '%)';
  }
  var you = g.out(), simOut = g.out();
  g.button('Run 1,000 games each way', function () { simulate(1000); }, { pri: true });
  g.select({ label: 'Doors', options: [['3', '3 doors'], ['10', '10 doors'], ['100', '100 doors']], value: '3', change: function (v) { nD = +v; sims = null; newGame(); g.redraw(); simOut.textContent = ''; } });
  g.draw(function (col) {
    var x = cv.ctx, W = cv.w, H = cv.h, l = 44, b = H - 26, t = 12, w = W - l - 12;
    cv.clear(col.panel);
    x.font = '12px system-ui,sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'right'; x.lineWidth = 1;
    [0, 0.5, 1].forEach(function (v) { var y = b - v * (b - t); x.strokeStyle = col.grid; x.beginPath(); x.moveTo(l, y); x.lineTo(W - 12, y); x.stroke(); x.fillStyle = col.muted; x.fillText(v * 100 + '%', l - 6, y); });
    var th = [1 / nD, 1 - 1 / nD];
    th.forEach(function (v, k) { var y = b - v * (b - t); x.strokeStyle = k ? col.accent : col.orange; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(l, y); x.lineTo(W - 12, y); x.stroke(); x.setLineDash([]); });
    x.textAlign = 'left';
    if (!sims) { x.fillStyle = col.muted; x.fillText(W < 480 ? 'Run the computer games.' : 'Run the computer games to fill this chart.', l + 8, (t + b) / 2 + 14); }
    else [[sims.ps, col.orange, 'stay'], [sims.pw, col.accent, 'switch']].forEach(function (s) {
      x.strokeStyle = s[1]; x.lineWidth = 2.2; x.beginPath();
      for (var i = 0; i < s[0].length; i++) { var px = l + i / (s[0].length - 1) * w, py = b - s[0][i] * (b - t); if (i) x.lineTo(px, py); else x.moveTo(px, py); }
      x.stroke(); x.fillStyle = s[1]; x.font = '600 13px system-ui,sans-serif';
      x.fillText(s[2], W - 60, b - s[0][s[0].length - 1] * (b - t) + (s[2] === 'stay' ? -12 : 12)); x.font = '12px system-ui,sans-serif';
    });
    x.fillStyle = col.muted; x.fillText(W < 480 ? 'Games won (dashed: theory)' : 'Share of games won, game 1 to ' + (sims ? g.fmt(sims.n) : '1,000') + ' (dashed: the theory)', l, H - 10);
  });
  newGame(); show();
});
