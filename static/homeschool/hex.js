/* Hexadecimal and binary: a live converter with working shown, flippable bits, eight lessons with practice,
   an ASCII table, and the hex dial from The Martian. Progress stays in this browser only. */
(function (W, D) {
  'use strict';
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var MAX = 4294967295, HX = '0123456789ABCDEF';
  var KEY = 'trb-hex-v1', st = { pass: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) st = sv; st.pass = st.pass || {}; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function n0(x) { return x.toLocaleString('en-US'); }
  function group(s, n) { var o = ''; for (var i = s.length; i > 0; i -= n) o = s.slice(Math.max(0, i - n), i) + (o ? ' ' + o : ''); return o; }
  function hex(n) { return n.toString(16).toUpperCase(); }
  function bin(n) { return n.toString(2); }
  function pad(s, n) { while (s.length < n) s = '0' + s; return s; }

  // ---------- converter ----------
  var F = { dec: 10, hex: 16, bin: 2, oct: 8 }, cur = 255;
  function parse(v, base) {
    v = String(v).trim().replace(/[\s_,]/g, '').replace(/^0x/i, '').replace(/^#/, '');
    if (!v) return null;
    var ok = { 10: /^\d+$/, 16: /^[0-9a-f]+$/i, 2: /^[01]+$/, 8: /^[0-7]+$/ }[base];
    if (!ok.test(v)) return NaN;
    var n = parseInt(v, base); return n > MAX ? Infinity : n;
  }
  function fill(except) {
    if (except !== 'dec') $('hx-dec').value = n0(cur);
    if (except !== 'hex') $('hx-hex').value = group(hex(cur), 4);
    if (except !== 'bin') $('hx-bin').value = group(bin(cur), 4);
    if (except !== 'oct') $('hx-oct').value = cur.toString(8);
    work(); bits();
  }
  function work() {
    var h = hex(cur), parts = h.split('').map(function (d, i) { var p = h.length - 1 - i; return d + '×' + n0(Math.pow(16, p)); });
    var steps = [], n = cur;
    if (n === 0) steps.push('0 ÷ 16 = 0 remainder 0');
    while (n > 0 && steps.length < 9) { steps.push(n0(n) + ' ÷ 16 = ' + n0(Math.floor(n / 16)) + ' remainder ' + (n % 16) + (n % 16 > 9 ? ' (' + HX[n % 16] + ')' : '')); n = Math.floor(n / 16); }
    $('hx-work').innerHTML = '<div><b>Hex to decimal:</b> ' + parts.join(' + ') + ' = <b>' + n0(cur) + '</b></div>' +
      '<div><b>Decimal to hex:</b> divide by 16 and keep the remainders, then read them from the bottom up:</div><div class="hx-steps">' + steps.map(esc).join('<br>') + '</div><div>Remainders from the bottom up → <b>' + h + '</b></div>';
  }
  function bits() {
    var nb = Math.max(8, Math.ceil(bin(cur).length / 4) * 4), b = pad(bin(cur), nb), h = '';
    for (var g = 0; g < nb / 4; g++) {
      var nib = b.slice(g * 4, g * 4 + 4);
      h += '<div class="hx-nib"><div class="hx-bitrow">' + nib.split('').map(function (x, i) { var pos = nb - 1 - (g * 4 + i); return '<button type="button" class="hx-bit' + (x === '1' ? ' on' : '') + '" data-p="' + pos + '" title="' + n0(Math.pow(2, pos)) + '">' + x + '</button>'; }).join('') +
        '</div><b>' + HX[parseInt(nib, 2)] + '</b></div>';
    }
    $('hx-bits').innerHTML = h + '<p class="hs-small">Tap a bit to flip it. Each group of four bits is one hex digit.</p>';
  }
  if ($('hx-dec')) {
    Object.keys(F).forEach(function (k) {
      $('hx-' + k).addEventListener('input', function () {
        var n = parse(this.value, F[k]);
        this.classList.toggle('bad', n !== null && !isFinite(n));
        if (n === null || !isFinite(n)) return;
        cur = n; fill(k);
      });
    });
    $('hx-bits').addEventListener('click', function (e) {
      var b = e.target.closest('.hx-bit'); if (!b) return;
      var p = +b.dataset.p; cur = (cur ^ Math.pow(2, p)) >>> 0; if (cur > MAX) cur = MAX; fill();
    });
    fill();
  }

  // ---------- lessons ----------
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var LESSONS = [
    { t: 'Place value', html: '<p>In our everyday numbers, each place is worth ten times the place to its right: ones, tens, hundreds, thousands. That’s why we call it <b>base 10</b>, and why it needs ten digits, 0 to 9.</p><p class="hx-ex">4,782 = <b>4</b>×1,000 + <b>7</b>×100 + <b>8</b>×10 + <b>2</b>×1</p><p>Other bases work exactly the same way. Only the size of the jump between places changes: in base 2 each place is worth 2 times the last, in base 16 it’s 16 times.</p>',
      q: function () { var n = rnd(1000, 99999), s = String(n), i = rnd(0, s.length - 1), d = s[i]; if (d === '0') return this.q(); var v = +d * Math.pow(10, s.length - 1 - i); return { p: 'In ' + n0(n) + ', what is the ' + d + ' in the ' + ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'][s.length - 1 - i] + ' place worth?', a: String(v), show: n0(v), why: d + ' × ' + n0(Math.pow(10, s.length - 1 - i)) + ' = ' + n0(v) }; } },
    { t: 'Binary', html: '<p><b>Binary</b> is base 2. It has only two digits, 0 and 1, called <b>bits</b>. Each place is worth twice the one to its right:</p><div class="hx-places">' + [128, 64, 32, 16, 8, 4, 2, 1].map(function (v) { return '<span>' + v + '</span>'; }).join('') + '</div><p>To read a binary number, add up the places that have a 1.</p><p class="hx-ex">1011 = 8 + 0 + 2 + 1 = <b>11</b></p><p>Computers use binary because a wire is either on or off. Eight bits make a <b>byte</b>, which can hold any number from 0 to 255.</p>',
      q: function () { var n = rnd(1, 255); return { p: 'What is binary <code>' + bin(n) + '</code> in decimal?', a: String(n), why: bin(n).split('').map(function (b, i, a) { return b === '1' ? Math.pow(2, a.length - 1 - i) : null; }).filter(function (x) { return x !== null; }).join(' + ') + ' = ' + n }; } },
    { t: 'Decimal to binary', html: '<p>To turn a decimal number into binary, take away the biggest place value that fits, write a 1 there, and keep going. Places you skip get a 0.</p><p class="hx-ex">45: 32 fits (13 left), 16 doesn’t, 8 fits (5 left), 4 fits (1 left), 2 doesn’t, 1 fits → <b>101101</b></p><p>Another way: divide by 2 again and again and write down the remainders, then read them from the bottom up.</p>',
      q: function () { var n = rnd(2, 255); return { p: 'Write ' + n + ' in binary.', a: bin(n), norm: function (s) { return s.replace(/\s/g, '').replace(/^0+(?=.)/, ''); }, why: n + ' = ' + bin(n).split('').map(function (b, i, a) { return b === '1' ? Math.pow(2, a.length - 1 - i) : null; }).filter(function (x) { return x !== null; }).join(' + ') + ' → ' + bin(n) }; } },
    { t: 'Hex digits', html: '<p><b>Hexadecimal</b>, or <b>hex</b>, is base 16. It needs sixteen digits, so after 0 to 9 it borrows letters:</p><div class="hx-digits">' + HX.split('').map(function (d, i) { return '<span><b>' + d + '</b>' + i + '</span>'; }).join('') + '</div><p>So A means ten, F means fifteen, and 10 in hex means one sixteen and no ones: sixteen. People write hex numbers with <code>0x</code> in front (0x1F) or with a # for colors (#FF8800) so you can tell them apart from decimal.</p>',
      q: function () { var i = rnd(10, 15); return Math.random() < 0.5 ? { p: 'What is the hex digit ' + HX[i] + ' in decimal?', a: String(i), why: 'A=10, B=11, C=12, D=13, E=14, F=15' } : { p: 'Which hex digit means ' + i + '?', a: HX[i], why: 'A=10, B=11, C=12, D=13, E=14, F=15' }; } },
    { t: 'Hex to decimal', html: '<p>Hex places are worth 1, 16, 256, 4,096 and so on, each 16 times the last. Multiply each digit by its place and add.</p><div class="hx-places">' + [4096, 256, 16, 1].map(function (v) { return '<span>' + n0(v) + '</span>'; }).join('') + '</div><p class="hx-ex">2F = 2×16 + 15×1 = 32 + 15 = <b>47</b><br>1A0 = 1×256 + 10×16 + 0 = <b>416</b></p><p>Two hex digits always make one byte, from 00 to FF (255).</p>',
      q: function () { var n = rnd(16, 4095); var h = hex(n); return { p: 'What is hex <code>' + h + '</code> in decimal?', a: String(n), why: h.split('').map(function (d, i) { return d + '×' + n0(Math.pow(16, h.length - 1 - i)); }).join(' + ') + ' = ' + n0(n) }; } },
    { t: 'Decimal to hex', html: '<p>Divide by 16. The remainder is the last hex digit. Divide the answer by 16 again for the next digit, and keep going until you reach 0. Read the remainders from the bottom up.</p><p class="hx-ex">700 ÷ 16 = 43 remainder 12 (C)<br>43 ÷ 16 = 2 remainder 11 (B)<br>2 ÷ 16 = 0 remainder 2<br>→ <b>2BC</b></p><p>Check it: 2×256 + 11×16 + 12 = 512 + 176 + 12 = 700.</p>',
      q: function () { var n = rnd(17, 4095); return { p: 'Write ' + n0(n) + ' in hex.', a: hex(n), norm: function (s) { return s.toUpperCase().replace(/^0X/, '').replace(/\s/g, '').replace(/^0+(?=.)/, ''); }, why: (function () { var s = [], m = n; while (m > 0) { s.push(m + ' ÷ 16 = ' + Math.floor(m / 16) + ' r ' + HX[m % 16]); m = Math.floor(m / 16); } return s.join('; ') + ' → ' + hex(n); })() }; } },
    { t: 'Binary and hex', html: '<p>Here’s why programmers love hex: one hex digit is exactly four bits. To turn binary into hex, split it into groups of four from the right and change each group to one digit.</p><p class="hx-ex">1101 0110 → D 6 → <b>D6</b></p><p>Going the other way, write each hex digit as four bits: 3F → 0011 1111. It’s much easier to read FF than 11111111.</p>',
      q: function () { var n = rnd(16, 255); return Math.random() < 0.5 ? { p: 'What is binary <code>' + group(pad(bin(n), 8), 4) + '</code> in hex?', a: hex(n), norm: function (s) { return s.toUpperCase().replace(/\s/g, '').replace(/^0X/, '').replace(/^0+(?=.)/, ''); }, why: group(pad(bin(n), 8), 4) + ' → ' + group(pad(bin(n), 8), 4).split(' ').map(function (g) { return HX[parseInt(g, 2)]; }).join(' ') } :
        { p: 'Write hex <code>' + pad(hex(n), 2) + '</code> as eight bits.', a: pad(bin(n), 8), norm: function (s) { return pad(s.replace(/\s/g, ''), 8); }, why: pad(hex(n), 2).split('').map(function (d) { return d + ' = ' + pad(bin(parseInt(d, 16)), 4); }).join(', ') }; } },
    { t: 'Hex in the wild', html: '<p><b>Colors.</b> A web color like <code>#2E8B57</code> is three bytes: red 2E, green 8B, blue 57, each from 00 (none) to FF (full). Try mixing one:</p><div class="hx-mix"><div class="hx-sw" id="hx-sw"></div><div><label>Red <input type="range" min="0" max="255" value="0" data-c="0"></label><label>Green <input type="range" min="0" max="255" value="66" data-c="1"></label><label>Blue <input type="range" min="0" max="255" value="37" data-c="2"></label><p class="hx-code" id="hx-code"></p></div></div><p><b>Letters.</b> Every character has an ASCII code. Capital A is 41 in hex (65 in decimal), B is 42, and so on up to Z at 5A. Small letters start at 61, and a space is 20. That’s the trick behind the Mars dial below.</p>',
      q: function () { if (Math.random() < 0.5) { var c = rnd(65, 90); return { p: 'Which letter has the ASCII code <code>' + hex(c) + '</code>?', a: String.fromCharCode(c), why: '41 is A; ' + hex(c) + ' is ' + (c - 65) + ' after it → ' + String.fromCharCode(c) }; } var c2 = rnd(65, 90); return { p: 'What is the ASCII code of ' + String.fromCharCode(c2) + ' in hex?', a: hex(c2), why: String.fromCharCode(c2) + ' is ' + (c2 - 65) + ' letters after A (41) → ' + hex(c2) }; } }
  ];
  var L = 0;
  function tabs() {
    $('hx-ltabs').innerHTML = LESSONS.map(function (x, i) { return '<button type="button" class="hx-lt' + (i === L ? ' on' : '') + (st.pass[i] ? ' done' : '') + '" data-l="' + i + '"><span>' + (i + 1) + '</span>' + x.t + (st.pass[i] ? ' ✓' : '') + '</button>'; }).join('');
  }
  function lesson() {
    var x = LESSONS[L];
    $('hx-lesson').innerHTML = '<h3>Lesson ' + (L + 1) + ': ' + x.t + '</h3>' + x.html +
      '<div class="hx-prac"><h4>Practice</h4><p class="hx-q" id="hx-q"></p><p><input id="hx-a" class="hx-in sm" autocomplete="off" spellcheck="false" aria-label="Your answer"> <button type="button" class="hs-btn" id="hx-check">Check</button> <span id="hx-fb" aria-live="polite"></span></p><p class="hs-small" id="hx-sc"></p>' +
      '<p>' + (L > 0 ? '<button type="button" class="hs-btn ghost" data-go="' + (L - 1) + '">← Lesson ' + L + '</button> ' : '') + (L < LESSONS.length - 1 ? '<button type="button" class="hs-btn ghost" data-go="' + (L + 1) + '">Lesson ' + (L + 2) + ' →</button>' : '') + '</p></div>';
    var n = 0, ok = 0, q = null, answered = false;
    function next() { q = x.q(); answered = false; $('hx-q').innerHTML = (n + 1) + '. ' + q.p; $('hx-a').value = ''; $('hx-fb').textContent = ''; $('hx-check').textContent = 'Check'; }
    function check() {
      if (answered) { if (n >= 10) { n = 0; ok = 0; } next(); $('hx-a').focus(); return; }
      var v = $('hx-a').value.trim(); if (!v) return;
      var norm = q.norm || function (s) { return s.toUpperCase().replace(/[,\s]/g, '').replace(/^0X/, ''); };
      var right = norm(v) === norm(q.a); n++; if (right) ok++; answered = true;
      $('hx-fb').innerHTML = right ? '<b class="good">✓ Right</b>' : '<b class="bad">Not quite.</b> The answer is <b>' + esc(q.show || q.a) + '</b>' + (q.why ? ': ' + esc(q.why) : '');
      $('hx-sc').textContent = ok + ' of ' + n + ' right' + (n >= 10 ? (ok >= 8 ? ' · finished ✓' : ' · try another set') : ' · ' + (10 - n) + ' to go');
      if (n >= 10 && ok >= 8 && !st.pass[L]) { st.pass[L] = 1; save(); tabs(); }
      $('hx-check').textContent = n >= 10 ? 'New set' : 'Next';
    }
    $('hx-check').addEventListener('click', check);
    $('hx-a').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    $('hx-lesson').querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { L = +b.dataset.go; tabs(); lesson(); $('hx-lessons').scrollIntoView({ behavior: 'smooth' }); }); });
    var mix = $('hx-lesson').querySelectorAll('.hx-mix input');
    if (mix.length) {
      var upd = function () { var v = [].map.call(mix, function (i) { return +i.value; }), h = '#' + v.map(function (c) { return pad(hex(c), 2); }).join(''); $('hx-sw').style.background = h; $('hx-code').innerHTML = '<b>' + h + '</b> = red ' + v[0] + ', green ' + v[1] + ', blue ' + v[2]; };
      mix.forEach(function (i) { i.addEventListener('input', upd); }); upd();
    }
    next();
  }
  if ($('hx-ltabs')) {
    $('hx-ltabs').addEventListener('click', function (e) { var b = e.target.closest('.hx-lt'); if (!b) return; L = +b.dataset.l; tabs(); lesson(); });
    tabs(); lesson();
  }

  // ---------- ASCII table ----------
  if ($('hx-ascii')) {
    var cells = [[32, 32]].concat([[48, 57], [65, 90], [97, 122]]), h = '';
    cells.forEach(function (r) { for (var c = r[0]; c <= r[1]; c++) h += '<span><b>' + (c === 32 ? 'space' : esc(String.fromCharCode(c))) + '</b>' + hex(c) + '<small>' + c + '</small></span>'; });
    $('hx-ascii').innerHTML = h;
  }

  // ---------- the Mars dial ----------
  var dial = $('hx-dial');
  if (dial) {
    var s = '<circle r="104" class="hx-ring"/>';
    for (var i = 0; i < 16; i++) { var a = (i / 16) * Math.PI * 2 - Math.PI / 2, x = Math.cos(a) * 86, y = Math.sin(a) * 86; s += '<g class="hx-card" data-d="' + HX[i] + '"><rect x="' + (x - 11) + '" y="' + (y - 11) + '" width="22" height="22" rx="4"/><text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle">' + HX[i] + '</text></g>'; }
    s += '<g id="hx-ptr"><line x1="0" y1="0" x2="0" y2="-62"/><polygon points="0,-72 -7,-58 7,-58"/></g><circle r="18" class="hx-cam"/><circle r="7" class="hx-lens"/>';
    dial.innerHTML = s;
    var ptr = $('hx-ptr'), timers = [], ang = 0;
    function point(d) { var i = HX.indexOf(d), target = i * 22.5, diff = ((target - ang) % 360 + 540) % 360 - 180; ang += diff; ptr.style.transform = 'rotate(' + ang + 'deg)'; dial.querySelectorAll('.hx-card').forEach(function (c) { c.classList.toggle('on', c.dataset.d === d); }); }
    function stopM() { timers.forEach(clearTimeout); timers = []; dial.querySelectorAll('.hx-card.on').forEach(function (c) { c.classList.remove('on'); }); }
    // Text mode: each character is sent as its two-digit ASCII code. Number mode: the whole number's value, in hex.
    function units(text, asNum) {
      if (asNum) { var n = parse(text, 10); if (n === null || !isFinite(n)) return null; return hex(n).split('').map(function (d) { return { lab: d, code: d }; }); }
      return text.split('').filter(function (c) { return c.charCodeAt(0) < 128; }).map(function (c) { return { lab: c === ' ' ? '␣' : c, code: pad(hex(c.charCodeAt(0)), 2) }; });
    }
    function send(text, showPairs, done, asNum) {
      stopM(); var chars = units(text, asNum), t = 0, step = $('hx-slow').checked ? 1100 : 550;
      var box = $('hx-pairs');
      if (!chars) { box.innerHTML = '<p class="bad">Number mode takes a whole number, like 8675309.</p>'; return; }
      if (showPairs) box.innerHTML = asNum ? '<p class="hs-small">' + esc(n0(parse(text, 10))) + ' in hex is <b>' + hex(parse(text, 10)) + '</b>: one pointer move per hex digit.</p>' + chars.map(function (u, i) { return '<span data-i="' + i + '"><b>' + u.lab + '</b>digit ' + (i + 1) + '</span>'; }).join('') :
        chars.map(function (u, i) { return '<span data-i="' + i + '"><b>' + esc(u.lab) + '</b>' + u.code + '</span>'; }).join('');
      chars.forEach(function (u, i) {
        var h2 = u.code;
        h2.split('').forEach(function (d) { timers.push(setTimeout(function () { point(d); if (showPairs) { box.querySelectorAll('.on').forEach(function (e) { e.classList.remove('on'); }); var el = box.querySelector('[data-i="' + i + '"]'); if (el) el.classList.add('on'); } }, t)); t += step; });
        t += step / 2;
      });
      timers.push(setTimeout(function () { stopM(); if (done) done(); }, t + 200));
    }
    function asNum() { return (D.querySelector('input[name=hx-mode]:checked') || {}).value === 'num'; }
    function note() {
      var v = $('hx-msg').value.trim(), digits = /^[\d,]+$/.test(v) && /\d/.test(v), el = $('hx-mnote');
      if (asNum()) { var n = parse(v, 10); el.innerHTML = n !== null && isFinite(n) ? 'Number mode: the pointer spells the value <b>' + esc(n0(n)) + '</b> in hex, <b>' + hex(n) + '</b>, the same answer as the converter above.' : 'Number mode takes a whole number up to 4,294,967,295.'; return; }
      el.innerHTML = digits ? '⚠ Text mode sends each character, so the digit “' + esc(v[0]) + '” goes as its ASCII code <b>' + pad(hex(v.charCodeAt(0)), 2) + '</b>, not as part of a number. That’s why this won’t match the converter above. To send the number’s value instead (' + (function () { var n = parse(v, 10); return n !== null && isFinite(n) ? hex(n) : '?'; })() + ' in hex), switch to <b>Number</b>.' :
        'Text mode: each letter, digit, space or symbol is sent as its own two-digit ASCII code.';
    }
    $('hx-msg').addEventListener('input', note);
    D.querySelectorAll('input[name=hx-mode]').forEach(function (r) { r.addEventListener('change', note); });
    note();
    $('hx-send').addEventListener('click', function () { send(asNum() ? $('hx-msg').value : $('hx-msg').value.toUpperCase(), true, null, asNum()); });
    $('hx-mstop').addEventListener('click', stopM);
    var MYST = ['HELLO', 'MARS', 'HOME', 'WATER', 'ROVER', 'SPACE', 'PLANET', 'POTATO', 'ORBIT', 'EARTH', 'HAB', 'ROCKET', 'SOLAR', 'SAFE', 'DUST'], word = '';
    $('hx-mystery').addEventListener('click', function () { word = MYST[Math.floor(Math.random() * MYST.length)]; $('hx-pairs').innerHTML = ''; $('hx-gres').textContent = 'Watch the pointer…'; send(word, false, function () { $('hx-gres').textContent = 'Done. What did it say?'; }); });
    $('hx-guess').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !word) return;
      var right = this.value.trim().toUpperCase() === word;
      $('hx-gres').innerHTML = right ? '<b class="good">✓ ' + word + '</b>' : '<b class="bad">It was ' + word + ':</b> ' + word.split('').map(function (c) { return pad(hex(c.charCodeAt(0)), 2); }).join(' ');
    });
  }
})(window, document);
