/* Code Quest: an online puzzle trail (binary, hex, octal, ASCII and Morse) and a printable home scavenger-hunt maker
   that turns your hiding places into coded clue cards. Progress stays in this browser only. */
(function (W, D) {
  'use strict';
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clean(s) { return String(s).toUpperCase().replace(/[\s,_.!'"-]/g, '').replace(/^0X/, ''); }
  var MORSE = (W.TRBMorse && W.TRBMorse.code) || {};
  function toMorse(w) { return w.toUpperCase().split(' ').map(function (word) { return word.split('').map(function (c) { return (MORSE[c] || '').replace(/\./g, '·').replace(/-/g, '–'); }).filter(Boolean).join('  '); }).join('  /  '); }
  function hex2(c) { return c.charCodeAt(0).toString(16).toUpperCase(); }

  // ---------- the online quest ----------
  var STAGES = [
    { t: 'The hatch', s: 'Your rover has rolled to a stop beside an old supply hut. The hatch keypad blinks a pattern of lights: <code>1010 1010</code>. The keypad only takes ordinary numbers.', q: 'What number is <code>1010 1010</code> in decimal?', a: ['170'], h: ['Binary places, from the right: 1, 2, 4, 8, 16, 32, 64, 128.', 'Add the places that have a 1: 128 + 32 + 8 + 2.'], win: 'The hatch hisses open. Inside: a locker, a radio and a scratched wall.' },
    { t: 'The locker', s: 'A note taped to the locker says <b>Combination: 0x2A</b>. The 0x means the number is in hex.', q: 'What is hex 2A in decimal?', a: ['42'], h: ['Hex places are 16 and 1. A means 10.', '2 × 16 + 10 = ?'], win: 'Click. The locker holds a flashlight, a map and a card that says “Listen to the radio.”' },
    { t: 'The radio log', s: 'The radio’s screen shows one line from its log, in hex: <code>52 4F 56 45 52</code>. These are ASCII codes: every letter has a number.', q: 'What word is it?', a: ['ROVER'], h: ['Capital A is 41 in hex, B is 42, and so on. After 49 (I) comes 4A (J).', '52 is R. 4F is O.'], win: 'A rover! Then the radio crackles and starts to beep…' },
    { t: 'The beeps', s: 'The radio is sending Morse code, over and over. Turn your sound on.', q: 'Which way should you go? <button type="button" class="hs-btn ghost cq-play" data-say="NORTH">▶ Play the beeps</button>', a: ['NORTH', 'N'], h: ['It’s five letters. The first is dah-dit (N).', 'N, O (dah-dah-dah), R, T, H (four dits).'], win: 'North it is. You unfold the map.' },
    { t: 'The map', s: 'The map is a grid labeled in hex, but the old directions on the back give the square in binary: <code>1100 1010</code>.', q: 'Which square is it, in hex?', a: ['CA'], h: ['Each group of four bits is one hex digit.', '1100 is 12, which is C. 1010 is 10, which is…'], win: 'Square CA is a ridge to the north, with a cave marked at the bottom.' },
    { t: 'The riddle', s: 'At the cave mouth, someone has painted a riddle: <i>“I am the biggest number one hex digit can hold. Walk that many steps in.”</i>', q: 'How many steps, in decimal?', a: ['15', 'F'], h: ['Hex digits go 0 to 9, then A to F.', 'F is the last one. A is 10, so F is…'], win: 'Fifteen steps in, your light finds letters scratched into the rock.' },
    { t: 'The wall', s: 'Scratched into the wall: <code class="cq-morse">·––  ·–  –  ·  ·–·</code>', q: 'What does it say?', a: ['WATER'], h: ['It’s Morse code: a space between letters. ·–– is W.', 'W, A (·–), T (–), E (·), R (·–·).'], win: 'A tank of water, and a dial on the wall above it.' },
    { t: 'The dial', s: 'The tank’s dial was made for octal, base 8. It reads <code>32</code>.', q: 'How many liters is that in decimal?', a: ['26'], h: ['Octal places are 8 and 1.', '3 × 8 + 2 = ?'], win: 'Twenty-six liters. Enough to get home. Beside the tank are two crates.' },
    { t: 'The crates', s: 'The crates are labeled in binary: <code>0110</code> and <code>0111</code> ration packs.', q: 'How many packs in all? Answer in binary.', a: ['1101'], h: ['0110 is 6 and 0111 is 7.', '6 + 7 = 13. Now write 13 in binary: 8 + 4 + 1.'], win: 'Food and water. One more lock stands between you and the way out.' },
    { t: 'The last lock', s: 'The last door’s screen shows four hex codes: <code>48 4F 4D 45</code>.', q: 'Type the word to open it.', a: ['HOME'], h: ['41 is A. 48 is H.', 'H, O (4F), M (4D), E (45).'], win: 'The door slides open onto daylight. You made it HOME.' }
  ];
  var KEY = 'trb-codequest-v1', st = { at: 0, hints: 0 };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) st = sv; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var box = $('cq-stage');
  function trail() {
    $('cq-trail').innerHTML = STAGES.map(function (s, i) { return '<span class="' + (i < st.at ? 'done' : i === st.at ? 'now' : '') + '" title="' + esc(s.t) + '">' + (i < st.at ? '✓' : i + 1) + '</span>'; }).join('');
  }
  function stage() {
    trail();
    if (st.at >= STAGES.length) {
      box.innerHTML = '<div class="cq-win"><div class="cq-big">🏁</div><h3>You made it home!</h3><p>You cracked all ten codes with ' + (st.hints ? st.hints + ' hint' + (st.hints > 1 ? 's' : '') : 'no hints at all') + '. Now make a hunt of your own for someone at home, below.</p><button type="button" class="hs-btn ghost" id="cq-reset">Play again</button></div>';
      $('cq-reset').addEventListener('click', function () { st = { at: 0, hints: 0 }; save(); stage(); });
      return;
    }
    var S = STAGES[st.at], shown = 0;
    box.innerHTML = '<p class="cq-n">Clue ' + (st.at + 1) + ' of ' + STAGES.length + ' · ' + esc(S.t) + '</p><p>' + S.s + '</p><p class="cq-q">' + S.q + '</p>' +
      '<p><input id="cq-a" class="hx-in sm" autocomplete="off" spellcheck="false" aria-label="Your answer"> <button type="button" class="hs-btn" id="cq-go">Try it</button> <button type="button" class="hs-btn ghost" id="cq-hint">💡 Hint</button></p>' +
      '<div id="cq-fb" aria-live="polite"></div><div id="cq-hints"></div>';
    var pb = box.querySelector('.cq-play'); if (pb) pb.addEventListener('click', function () { W.TRBMorse && W.TRBMorse.play(pb.dataset.say); });
    function go() {
      var v = clean($('cq-a').value); if (!v) return;
      if (S.a.some(function (x) { return clean(x) === v; })) {
        $('cq-fb').innerHTML = '<p class="cq-ok">✓ ' + S.win + '</p><button type="button" class="hs-btn" id="cq-next">' + (st.at === STAGES.length - 1 ? 'Finish →' : 'Next clue →') + '</button>';
        $('cq-next').addEventListener('click', function () { st.at++; save(); stage(); });
        $('cq-next').focus();
      } else $('cq-fb').innerHTML = '<p class="bad">Not that one. Check your working and try again' + (shown < S.h.length ? ', or take a hint.' : '.') + '</p>';
    }
    $('cq-go').addEventListener('click', go);
    $('cq-a').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    $('cq-hint').addEventListener('click', function () { if (shown >= S.h.length) return; $('cq-hints').innerHTML += '<p class="cq-hint">💡 ' + S.h[shown] + '</p>'; shown++; st.hints++; save(); if (shown >= S.h.length) this.disabled = true; });
  }
  if (box) {
    stage();
    $('cq-restart').addEventListener('click', function () { st = { at: 0, hints: 0 }; save(); stage(); });
  }

  // ---------- printable scavenger hunt ----------
  var CODES = {
    morse: { n: 'Morse code', how: 'Dots and dashes. A space between letters, / between words.', enc: toMorse },
    hex: { n: 'ASCII hex', how: 'Each pair of hex digits is a letter: 41 is A, 42 is B… 20 is a space.', enc: function (t) { return t.toUpperCase().split('').map(hex2).join(' '); } },
    binary: { n: 'ASCII binary', how: 'Each group of 8 bits is a letter’s code. Turn it into hex, then look it up: 0100 0001 = 41 = A.', enc: function (t) { return t.toUpperCase().split('').map(function (c) { var b = c.charCodeAt(0).toString(2).padStart(8, '0'); return b.slice(0, 4) + ' ' + b.slice(4); }).join('  ·  '); } },
    num: { n: 'Number code', how: 'A=1, B=2, C=3… Z=26. A / is a space between words.', enc: function (t) { return t.toUpperCase().split(' ').map(function (w) { return w.split('').filter(function (c) { return /[A-Z]/.test(c); }).map(function (c) { return c.charCodeAt(0) - 64; }).join('-'); }).join('  /  '); } },
    caesar: { n: 'Shift-by-3 code', how: 'Every letter was moved 3 forward in the alphabet. Move each one 3 back: D → A, E → B.', enc: function (t) { return t.toUpperCase().replace(/[A-Z]/g, function (c) { return String.fromCharCode((c.charCodeAt(0) - 65 + 3) % 26 + 65); }); } },
    back: { n: 'Mirror writing', how: 'The letters are backward. Read from right to left.', enc: function (t) { return t.toUpperCase().split('').reverse().join(''); } }
  };
  function keyFor(k) {
    var L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    if (k === 'morse') return '<div class="cq-key">' + L.map(function (c) { return '<span><b>' + c + '</b>' + MORSE[c].replace(/\./g, '·').replace(/-/g, '–') + '</span>'; }).join('') + '</div>';
    if (k === 'hex' || k === 'binary') return '<div class="cq-key">' + L.map(function (c) { return '<span><b>' + c + '</b>' + hex2(c) + '</span>'; }).join('') + '<span><b>space</b>20</span></div>';
    if (k === 'num') return '<div class="cq-key">' + L.map(function (c, i) { return '<span><b>' + c + '</b>' + (i + 1) + '</span>'; }).join('') + '</div>';
    if (k === 'caesar') return '<div class="cq-key cq-strip"><span>' + L.join(' ') + '</span><span>' + L.slice(3).concat(L.slice(0, 3)).join(' ') + '</span></div>';
    return '';
  }
  var hb = $('cq-build');
  if (hb) {
    $('cq-make').addEventListener('click', function () {
      var places = $('cq-places').value.split('\n').map(function (s) { return s.trim().replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' '); }).filter(Boolean).slice(0, 15);
      var kinds = [].filter.call(hb.querySelectorAll('[name=cqk]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
      if (!places.length) { $('cq-out').innerHTML = '<p class="bad">Add at least one hiding place.</p>'; return; }
      if (!kinds.length) kinds = ['morse'];
      var withKey = $('cq-withkey').checked, prize = ($('cq-prize').value.trim() || 'You found the treasure!').replace(/[<>]/g, ''), title = ($('cq-title').value.trim() || 'Code Hunt').replace(/[<>]/g, '');
      var cards = [], plan = [];
      places.forEach(function (p, i) {
        var k = kinds[i % kinds.length]; if (k === 'binary' && p.length > 10) k = kinds.filter(function (x) { return x !== 'binary'; })[0] || 'hex';
        var C = CODES[k];
        cards.push('<div class="cq-card"><div class="cq-ctop"><b>' + esc(title) + '</b><span>Clue ' + (i + 1) + ' of ' + places.length + '</span></div><p class="cq-how"><b>' + C.n + ':</b> ' + C.how + '</p><p class="cq-code">' + esc(C.enc(p)) + '</p>' + (withKey ? keyFor(k) : '') + '<p class="cq-small">Decode it, then go and look there.</p></div>');
        plan.push('<li><b>Clue ' + (i + 1) + '</b> (' + C.n + ') leads to <b>' + esc(p) + '</b>. ' + (i === 0 ? 'Hand it to the hunter to start.' : 'Hide it at ' + esc(places[i - 1]) + '.') + '</li>');
      });
      cards.push('<div class="cq-card cq-final"><div class="cq-ctop"><b>' + esc(title) + '</b><span>The end</span></div><div class="cq-big">🏆</div><p class="cq-prize">' + esc(prize) + '</p></div>');
      plan.push('<li><b>The last card</b> (the prize) goes at <b>' + esc(places[places.length - 1]) + '</b>.</li>');
      $('cq-out').innerHTML = '<div class="cq-plan"><h3>For the grown-up: where each card goes</h3><ol>' + plan.join('') + '</ol><p class="hs-small">Cut the cards apart along the dashed lines. Keep this list, and don’t print it on the same page as the cards if young hunters might peek.</p><p><button type="button" class="hs-btn" id="cq-printc">🖨 Print the cards</button> <button type="button" class="hs-btn ghost" id="cq-printp">🖨 Print this list</button></p></div><div class="cq-cards" id="cq-cards">' + cards.join('') + '</div>';
      $('cq-printc').addEventListener('click', function () { D.body.classList.add('cq-print-cards'); W.print(); setTimeout(function () { D.body.classList.remove('cq-print-cards'); }, 500); });
      $('cq-printp').addEventListener('click', function () { D.body.classList.add('cq-print-plan'); W.print(); setTimeout(function () { D.body.classList.remove('cq-print-plan'); }, 500); });
      $('cq-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})(window, document);
