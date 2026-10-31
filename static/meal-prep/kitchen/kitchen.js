/* Kitchen know-how pages: the "Name that tool" matching game (tools page) and the print buttons (printables page). */
(function () {
  'use strict';
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- Name that tool ---------- */
  var game = document.getElementById('k-game');
  if (game) {
    var pool = Array.prototype.slice.call(document.querySelectorAll('.k-tool[data-kid]')).map(function (el) {
      return { id: el.id, name: el.getAttribute('data-short') || el.querySelector('h3').textContent, svg: el.querySelector('svg') };
    });
    var picsCol = document.getElementById('k-gpics'), namesCol = document.getElementById('k-gnames');
    var msg = document.getElementById('k-gmsg'), scoreEl = document.getElementById('k-gscore');
    var again = document.getElementById('k-gagain'), sizeSel = document.getElementById('k-gsize'), say = document.getElementById('k-gsay');
    var canSpeak = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
    if (!canSpeak && say) say.parentNode.hidden = true;
    var picked = null, left = 0, score = 0, tries = 0, last = [];

    function speak(t) {
      if (!canSpeak || !say || !say.checked) return;
      try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(t)); } catch (e) { /* no voice */ }
    }
    function setMsg(t) { msg.textContent = t; }
    function clearPick() { if (picked) { picked.setAttribute('aria-pressed', 'false'); picked = null; } }
    function btn(kind, tool) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'k-gbtn'; b.setAttribute('aria-pressed', 'false');
      b.dataset.id = tool.id; b.dataset.kind = kind;
      if (kind === 'pic') {
        var s = tool.svg.cloneNode(true); s.removeAttribute('id'); s.setAttribute('aria-hidden', 'true'); s.removeAttribute('role'); s.removeAttribute('aria-label');
        var lab = s.querySelector('title'); if (lab) lab.remove();
        b.appendChild(s); b.setAttribute('aria-label', 'Picture ' + (tool.n + 1));
      } else { b.textContent = tool.name; }
      b.addEventListener('click', function () { choose(b, tool); });
      return b;
    }
    function choose(b, tool) {
      if (b.classList.contains('ok')) return;
      if (b.dataset.kind === 'name') speak(tool.name);
      if (!picked || picked.dataset.kind === b.dataset.kind) {
        clearPick(); picked = b; b.setAttribute('aria-pressed', 'true');
        setMsg(b.dataset.kind === 'pic' ? 'Now pick its name.' : 'Now pick its picture.');
        return;
      }
      tries++;
      var a = picked; clearPick();
      if (a.dataset.id === b.dataset.id) {
        [a, b].forEach(function (x) { x.classList.add('ok'); x.setAttribute('aria-disabled', 'true'); });
        a.dataset.kind === 'name' ? a.insertAdjacentText('afterbegin', '✓ ') : b.insertAdjacentText('afterbegin', '✓ ');
        score++; left--; scoreEl.textContent = score;
        setMsg(left ? 'Yes! That’s the ' + tool.name.toLowerCase() + '.' : 'You matched them all! Press “New tools” to play again.');
        if (!left) again.focus();
      } else {
        [a, b].forEach(function (x) { x.classList.remove('no'); void x.offsetWidth; x.classList.add('no'); });
        setMsg('Not quite. Try again!');
      }
    }
    function round() {
      var n = parseInt(sizeSel.value, 10) || 4;
      var fresh = shuffle(pool.filter(function (t) { return last.indexOf(t.id) < 0; }));
      if (fresh.length < n) fresh = shuffle(pool.slice());
      var set = fresh.slice(0, n); last = set.map(function (t) { return t.id; });
      set.forEach(function (t, i) { t.n = i; });
      picsCol.querySelectorAll('.k-gbtn').forEach(function (x) { x.remove(); });
      namesCol.querySelectorAll('.k-gbtn').forEach(function (x) { x.remove(); });
      set.forEach(function (t) { picsCol.appendChild(btn('pic', t)); });
      shuffle(set.slice()).forEach(function (t) { namesCol.appendChild(btn('name', t)); });
      picked = null; left = n; setMsg('Pick a picture, then its name.');
    }
    again.addEventListener('click', round);
    sizeSel.addEventListener('change', round);
    game.hidden = false;
    round();
  }

  /* ---------- printables ---------- */
  var cards = document.querySelectorAll('.k-pcard');
  if (cards.length) {
    document.querySelectorAll('[data-kprint]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-kprint');
        cards.forEach(function (c) { c.classList.toggle('k-on', c.id === id); });
        if (id === 'all') delete document.body.dataset.kprint; else document.body.dataset.kprint = id;
        window.print();
      });
    });
    window.addEventListener('afterprint', function () { delete document.body.dataset.kprint; cards.forEach(function (c) { c.classList.remove('k-on'); }); });
  }
})();
