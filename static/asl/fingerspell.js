/* ASL fingerspelling practice: alphabet, reading game, spelling prompts and any word. Uses the public-domain handshape drawings in /asl/. */
(function (W, D) {
  'use strict';
  var BASE = JSON.parse(D.getElementById('fs-base').textContent), $ = function (id) { return D.getElementById(id); };
  var ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');
  var WORDS = {
    3: 'cat dog sun hat bed cup box red big run sit mom dad yes see fun egg bus pig hot top map pen jam leg ant bee owl fox cow zoo jet kid wet day toy',
    4: 'book fish milk tree frog bird home ball duck lamp rain snow cake game jump play blue gold farm star moon kite boat hand help word sign love park sand shoe apple bread chair happy horse house juice light music paper river smile table water zebra quiet',
    6: 'garden family pencil rabbit school summer winter friend kitchen picture morning library teacher brother sister animal yellow purple orange bridge castle dragon forest island market number planet rocket window'
  };
  function img(c, cls) { return '<img class="' + (cls || '') + '" src="' + BASE + c + '.svg" alt="ASL handshape for the letter ' + c.toUpperCase() + '">'; }
  function letters(w) { return w.toLowerCase().replace(/[^a-z]/g, '').split(''); }
  // tabs
  D.querySelectorAll('#fs [data-m]').forEach(function (b) { b.addEventListener('click', function () {
    D.querySelectorAll('#fs [data-m]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    D.querySelectorAll('.fs-pane').forEach(function (p) { p.hidden = p.dataset.p !== b.dataset.m; });
  }); });
  // alphabet
  $('fs-grid').innerHTML = ABC.map(function (c) { return '<button type="button" class="fs-card" data-c="' + c + '">' + img(c) + '<b>' + c.toUpperCase() + '</b></button>'; }).join('');
  $('fs-hide').addEventListener('change', function () { $('fs-grid').classList.toggle('hide', this.checked); });
  var big = null;
  $('fs-grid').addEventListener('click', function (e) {
    var b = e.target.closest('.fs-card'); if (!b) return;
    if (!big) { big = D.createElement('div'); big.className = 'fs-big'; big.addEventListener('click', function () { big.hidden = true; }); D.body.appendChild(big); }
    big.innerHTML = '<div>' + img(b.dataset.c) + '<b>' + b.dataset.c.toUpperCase() + '</b><span class="hs-small">Tap anywhere to close</span></div>'; big.hidden = false;
  });
  // read it
  var cur = '', timer = 0, right = 0, tries = 0;
  function pick(lvl) { var list = WORDS[lvl].split(' '), w; do { w = list[Math.floor(Math.random() * list.length)]; } while (w === cur && list.length > 1); return w; }
  function play() {
    clearTimeout(timer); var ls = letters(cur), i = 0, ms = +$('fs-speed').value, st = $('fs-stage');
    $('fs-guess').value = ''; $('fs-guess').focus({ preventScroll: true });
    (function step() {
      if (i >= ls.length) { st.innerHTML = '<p class="fs-done">What word was that?</p>'; return; }
      var gap = i > 0 && ls[i] === ls[i - 1]; // a doubled letter: a short blank so it reads as two
      st.innerHTML = gap ? '' : img(ls[i], 'fs-one');
      if (gap) { timer = setTimeout(function () { st.innerHTML = img(ls[i], 'fs-one'); i++; timer = setTimeout(step, ms); }, 180); return; }
      i++; timer = setTimeout(step, ms);
    })();
  }
  $('fs-new').addEventListener('click', function () { cur = pick($('fs-lvl').value); play(); });
  $('fs-again').addEventListener('click', function () { if (cur) play(); });
  function check() {
    if (!cur) return; var g = $('fs-guess').value.trim().toLowerCase(); if (!g) return; tries++;
    var ok = g === cur; if (ok) right++;
    $('fs-stage').innerHTML = '<p class="fs-done">' + (ok ? '✓ Yes, <b>' + cur + '</b>!' : 'It was <b>' + cur + '</b>.') + '</p><div class="fs-strip">' + letters(cur).map(function (c) { return '<span>' + img(c) + '<b>' + c.toUpperCase() + '</b></span>'; }).join('') + '</div>';
    $('fs-score').textContent = right + ' of ' + tries + ' right';
  }
  $('fs-check').addEventListener('click', check);
  $('fs-guess').addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
  // spell it
  var sw = '';
  function strip(w) { return letters(w).map(function (c) { return '<span>' + img(c) + '<b>' + c.toUpperCase() + '</b></span>'; }).join(''); }
  function snew() { var all = (WORDS[3] + ' ' + WORDS[4]).split(' '); sw = all[Math.floor(Math.random() * all.length)]; $('fs-sword').textContent = sw; $('fs-sstrip').innerHTML = ''; }
  $('fs-snew').addEventListener('click', snew); $('fs-show').addEventListener('click', function () { if (sw) $('fs-sstrip').innerHTML = strip(sw); }); snew();
  // any word
  $('fs-any').addEventListener('input', function () { $('fs-astrip').innerHTML = strip(this.value); });
})(window, document);
