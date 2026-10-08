/* Sentence Trees: (1) English phrase trees from the "Cows kill more people than sharks" infographic, built step by step,
   with both readings; (2) Latin and Greek dependency trees from the Perseus treebanks, to explore or to build yourself. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr'); if (!root) return;
  var Gs = W.Gospels;
  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var NS = 'http://www.w3.org/2000/svg';
  var meas = D.createElement('canvas').getContext('2d');
  function tw(t, font) { meas.font = font; return meas.measureText(t).width; }

  // ---------- Part 1: English phrase trees ----------
  // A node is [label, child, ...]; a leaf is a string. "~" before a label or a word marks words left out (ellipsis).
  function than(subj, verb, obj, which) { // the than-clause; which = 'A' (subject kept) or 'B' (object kept)
    return ['CP', ['C', 'than'], which === 'A'
      ? ['TP', subj, ['~T′', ['~T', '~-pres'], ['~VP', ['~V', '~' + verb], obj.map ? tilde(obj) : obj]]]
      : ['TP', tilde(subj), ['~T′', ['~T', '~-pres'], ['VP', ['~V', '~' + verb], obj]]]];
  }
  function tilde(n) { if (typeof n === 'string') return '~' + n.replace(/^~/, ''); return ['~' + n[0].replace(/^~/, '')].concat(n.slice(1).map(tilde)); }
  var EN = [
    { s: 'Cows kill more people than sharks.', A: 'Sharks are the killers: “than sharks (kill people)”.', B: 'Sharks are the victims: “than (cows kill) sharks”.',
      tree: function (r) { return ['TP', ['NP', 'cows'], ['T′', ['T', '-pres'], ['VP', ['V', 'kill'], ['NP', ['NP', ['Deg', 'more'], ['N', 'people']], than(r === 'A' ? ['NP', 'sharks'] : ['NP', 'cows'], 'kill', r === 'A' ? ['NP', 'people'] : ['NP', 'sharks'], r)]]]]; } },
    { s: 'I love you more than my dog.', A: 'The dog is the other one who loves you: “than my dog (loves you)”.', B: 'The dog is the other one I love: “than (I love) my dog”.',
      tree: function (r) { return ['TP', ['NP', 'I'], ['T′', ['T', '-pres'], ['VP', ['V', 'love'], ['NP', 'you'], ['DegP', ['Deg', 'more'], than(r === 'A' ? ['NP', 'my dog'] : ['NP', 'I'], r === 'A' ? 'loves' : 'love', r === 'A' ? ['NP', 'you'] : ['NP', 'my dog'], r)]]]]; } },
    { s: 'She trusts her lawyer more than her husband.', A: 'Two people trust one lawyer: “than her husband (trusts her lawyer)”.', B: 'One person trusts two people: “than (she trusts) her husband”.',
      tree: function (r) { return ['TP', ['NP', 'she'], ['T′', ['T', '-pres'], ['VP', ['V', 'trusts'], ['NP', 'her lawyer'], ['DegP', ['Deg', 'more'], than(r === 'A' ? ['NP', 'her husband'] : ['NP', 'she'], 'trusts', r === 'A' ? ['NP', 'her lawyer'] : ['NP', 'her husband'], r)]]]]; } }
  ];
  var CAT = { TP: '#6a4bc4', 'T′': '#6a4bc4', T: '#6a4bc4', NP: '#17806d', N: '#17806d', VP: '#d1542a', V: '#d1542a', CP: '#b53a7a', C: '#b53a7a', Deg: '#c9921a', DegP: '#c9921a' };
  var en = { i: 0, r: 'A', step: 99, gaps: true };
  function layoutPS(node) { // returns {lab, kids, leaf, el, x, y, w, h}
    var leaves = [];
    function build(n, depth) {
      if (typeof n === 'string') { var el = n[0] === '~', t = n.replace(/^~/, ''); var o = { leaf: true, lab: t, el: el, depth: depth, h: 0 }; leaves.push(o); return o; }
      var lab = n[0], el2 = lab[0] === '~', kids = n.slice(1).map(function (k) { return build(k, depth + 1); });
      var o2 = { lab: lab.replace(/^~/, ''), el: el2, kids: kids, depth: depth, h: 1 + Math.max.apply(null, kids.map(function (k) { return k.h; })) };
      return o2;
    }
    var t = build(node, 0), x = 10;
    leaves.forEach(function (l) { var w = tw(l.lab, '600 14px system-ui') + 22; l.w = w; l.x = x + w / 2; x += w + 10; });
    (function pos(n) { if (n.leaf) return; n.kids.forEach(pos); n.x = (n.kids[0].x + n.kids[n.kids.length - 1].x) / 2; })(t);
    var maxD = 0; (function md(n) { maxD = Math.max(maxD, n.depth); if (n.kids) n.kids.forEach(md); })(t);
    return { root: t, width: x, maxD: maxD, leaves: leaves };
  }
  function drawPS() {
    var ex = EN[en.i], L = layoutPS(ex.tree(en.r)), H = 64, height = (L.maxD + 1) * H + 40, svg = '';
    var total = L.root.h; if (en.step > total + 1) en.step = total + 1;
    var stepNow = en.step, showEl = en.gaps;
    // leaves sit on one bottom row so the words read left to right
    function y(n) { return n.leaf ? (L.maxD + 1) * H - 20 : 20 + n.depth * H * (L.maxD / (L.maxD + 0.0001)) * 0.98; }
    function visible(n) { if (n.el && !showEl && stepNow > total) return false; return n.leaf || n.h <= stepNow; }
    function faded(n) { return n.el && stepNow > total; }
    (function edges(n) {
      if (n.leaf) return;
      n.kids.forEach(function (k) { if (visible(n) && visible(k)) svg += '<line x1="' + n.x + '" y1="' + (y(n) + 11) + '" x2="' + k.x + '" y2="' + (y(k) - (k.leaf ? 12 : 11)) + '" class="' + (faded(k) || faded(n) ? 'el' : '') + '"/>'; edges(k); });
    })(L.root);
    (function nodes(n) {
      if (!visible(n)) { if (n.kids) n.kids.forEach(nodes); return; }
      var c = n.leaf ? '' : (CAT[n.lab] || '#555'), f = faded(n);
      if (n.leaf) { var w = tw(n.lab, '600 14px system-ui') + 18; svg += '<g class="lf' + (f ? ' el' : '') + '"><rect x="' + (n.x - w / 2) + '" y="' + (y(n) - 13) + '" width="' + w + '" height="26" rx="7"/><text x="' + n.x + '" y="' + (y(n) + 5) + '">' + esc(n.lab) + '</text></g>'; }
      else { var w2 = Math.max(34, tw(n.lab, '700 12px system-ui') + 16); svg += '<g class="nd' + (f ? ' el' : '') + '"><rect x="' + (n.x - w2 / 2) + '" y="' + (y(n) - 11) + '" width="' + w2 + '" height="22" rx="11" style="fill:' + (f ? 'transparent' : c) + ';stroke:' + c + '"/><text x="' + n.x + '" y="' + (y(n) + 4) + '" style="fill:' + (f ? c : '#fff') + '">' + esc(n.lab) + '</text></g>'; }
      if (n.kids) n.kids.forEach(nodes);
    })(L.root);
    $('#ps-svg').innerHTML = '<svg viewBox="0 0 ' + Math.max(L.width, 300) + ' ' + height + '" width="' + Math.max(L.width, 300) + '" height="' + height + '" role="img" aria-label="Phrase tree">' + svg + '</svg>';
    var steps = total + 1; $('#ps-step').max = steps; $('#ps-step').value = Math.min(en.step, steps);
    var msg = en.step <= 1 ? 'Step 1: line up the words. Every tree ends in its words.' : en.step <= total ? 'Step ' + en.step + ': each layer joins the pieces below it into a bigger phrase.' : 'Done. Dashed words are left out when we speak (ellipsis): the listener fills them back in.';
    $('#ps-msg').textContent = msg;
    $('#ps-reading').textContent = ex[en.r];
    root.querySelectorAll('[data-r]').forEach(function (b) { b.classList.toggle('on', b.dataset.r === en.r); });
  }
  function setupPS() {
    $('#ps-sent').innerHTML = EN.map(function (e, i) { return '<option value="' + i + '">' + esc(e.s) + '</option>'; }).join('');
    $('#ps-sent').onchange = function () { en.i = +this.value; en.step = 99; drawPS(); };
    root.querySelectorAll('[data-r]').forEach(function (b) { b.onclick = function () { en.r = b.dataset.r; drawPS(); }; });
    $('#ps-step').oninput = function () { en.step = +this.value; drawPS(); };
    $('#ps-play').onclick = function () { en.step = 1; drawPS(); var t = setInterval(function () { en.step++; drawPS(); if (en.step >= +$('#ps-step').max) clearInterval(t); }, 900); };
    $('#ps-gaps').onchange = function () { en.gaps = this.checked; drawPS(); };
    drawPS();
  }

  // ---------- Part 2: Latin and Greek dependency trees ----------
  var DATA = null, dep = { lang: 'L', i: 0, mode: 'explore', placed: null, cur: -1, tries: 0, score: 0, asked: 0, sel: -1 };
  var HINT = {
    SBJ: 'It is the subject, so it hangs from the verb whose subject it is.', OBJ: 'It completes a verb or a preposition: find that word.',
    ATR: 'It describes a noun: find the noun it goes with (same case, number and gender).', ADV: 'It says how, when, where or why: find the verb it modifies (or the preposition it follows).',
    AuxP: 'A preposition hangs from the word its phrase describes, usually the verb.', COORD: '“And” hangs from whatever the joined words belong to, usually the verb.',
    AuxY: 'A connecting word or sentence adverb hangs from the main verb.', AuxZ: 'An emphasizing word (like “not”) hangs from the word it emphasizes.',
    APOS: 'It renames another noun: find that noun.', ATV: 'It describes a noun while the action happens: find that noun.', AtvV: 'It describes a noun while the action happens: find that noun.',
    AuxV: 'A helping verb (“was”, “had”) hangs from the verb form it helps.', PNOM: 'It says what the subject is: find the verb “to be”.', PRED: 'It is the main verb: the top of the tree.'
  };
  var ABBR = { PRED: 'main verb', SBJ: 'subject', OBJ: 'object', ATR: 'describes', ADV: 'adverbial', AuxP: 'preposition', COORD: 'and', AuxY: 'connector', AuxZ: 'emphasis', APOS: 'renames', ATV: 'describes', AtvV: 'describes', AuxV: 'helper', PNOM: 'predicate', AuxC: 'conjunction' };
  function rel(t) { return t[6].replace(/_.*$/, ''); }
  function relName(t) { var r = rel(t); return (ABBR[r] || r) + (/_CO/.test(t[6]) ? ' (pair)' : ''); }
  function depth(toks, i) { var d = 0, j = i; while (toks[j][7] >= 0 && d < 20) { j = toks[j][7]; d++; } return d; }
  function drawDep() {
    var s = DATA[dep.lang][dep.i], toks = s.t, grc = dep.lang === 'G', font = (grc ? '20px' : '19px') + ' "Gentium Book Plus",Georgia,serif';
    var xs = [], x = 16, H = 78, maxD = 0;
    toks.forEach(function (t) { var w = Math.max(tw(t[0], font), tw(relName(t), '600 11px system-ui')) + 22; xs.push(x + w / 2); x += w + 8; });
    toks.forEach(function (t, i) { maxD = Math.max(maxD, depth(toks, i)); });
    var build = dep.mode === 'build', svg = '', height = (maxD + 1) * H + 30;
    function shown(i) { return !build || dep.placed[i]; }
    function Y(i) { return 26 + depth(toks, i) * H; }
    toks.forEach(function (t, i) { if (t[7] >= 0 && shown(i) && shown(t[7])) svg += '<line x1="' + xs[i] + '" y1="' + (Y(i) - 14) + '" x2="' + xs[t[7]] + '" y2="' + (Y(t[7]) + 26) + '"/>'; });
    toks.forEach(function (t, i) {
      if (!shown(i)) return;
      var cls = 'dn' + (i === dep.sel ? ' sel' : '') + (dep.sel >= 0 && (toks[dep.sel][7] === i) ? ' head' : '') + (dep.sel >= 0 && t[7] === dep.sel ? ' kid' : '');
      svg += '<g class="' + cls + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(t[0] + ', ' + relName(t)) + '"><text class="dw' + (grc ? ' grc' : '') + '" x="' + xs[i] + '" y="' + Y(i) + '">' + esc(t[0]) + '</text><text class="dr" x="' + xs[i] + '" y="' + (Y(i) + 17) + '">' + esc(relName(t)) + '</text></g>';
    });
    $('#dp-svg').innerHTML = '<svg viewBox="0 0 ' + x + ' ' + height + '" width="' + x + '" height="' + height + '" role="img" aria-label="Dependency tree">' + svg + '</svg>';
    // the sentence as a row of buttons (used for building and for picking a word)
    $('#dp-words').innerHTML = toks.map(function (t, i) {
      var c = 'dpw' + (grc ? ' grc' : '') + (build && i === dep.cur ? ' cur' : '') + (build && dep.placed[i] ? ' done' : '') + (!build && i === dep.sel ? ' sel' : '');
      return '<button type="button" class="' + c + '" data-w="' + i + '">' + esc(t[0]) + '</button>';
    }).join(' ') + (build && dep.cur === -2 ? '' : '');
    $('#dp-en').textContent = s.en; $('#dp-ref').textContent = s.ref;
  }
  function ask() {
    var toks = DATA[dep.lang][dep.i].t;
    var left = toks.map(function (t, i) { return i; }).filter(function (i) { return !dep.placed[i]; });
    if (!left.length) { $('#dp-q').innerHTML = '<b class="ok">Tree complete!</b> ' + dep.score + ' of ' + dep.asked + ' right first time. <button type="button" class="cbtn" id="dp-nextS">Next sentence →</button>'; $('#dp-nextS').onclick = function () { next(1); }; dep.cur = -1; drawDep(); return; }
    var rootI = toks.findIndex(function (t) { return t[7] < 0; });
    if (!dep.placed[rootI]) { dep.cur = rootI; $('#dp-q').innerHTML = 'First: which word is the <b>main verb</b>, the top of the tree? Tap it below.'; dep.askRoot = true; drawDep(); return; }
    dep.askRoot = false;
    // next word whose head is already placed, in sentence order
    var nx = left.filter(function (i) { return dep.placed[toks[i][7]]; })[0];
    dep.cur = nx; dep.tries = 0;
    $('#dp-q').innerHTML = 'Which word does <b class="' + (dep.lang === 'G' ? 'grc' : 'lat') + '">' + esc(toks[nx][0]) + '</b> hang from? Tap it below.';
    drawDep();
  }
  function pickBuild(i) {
    var toks = DATA[dep.lang][dep.i].t;
    if (dep.cur < 0) return;
    if (dep.askRoot) {
      if (i === dep.cur) { dep.placed[i] = true; $('#dp-q').innerHTML = '<b class="ok">Yes.</b>'; setTimeout(ask, 500); }
      else { $('#dp-q').innerHTML = 'Not that one. Look for the verb that the whole sentence is built around. <span class="dim">(' + esc(toks[i][0]) + ' is ' + esc(relName(toks[i])) + ')</span>'; }
      drawDep(); return;
    }
    if (i === dep.cur) return;
    var t = toks[dep.cur], want = t[7];
    if (dep.tries === 0) dep.asked++;
    if (i === want) {
      if (dep.tries === 0) dep.score++;
      dep.placed[dep.cur] = true;
      $('#dp-q').innerHTML = '<b class="ok">Right:</b> ' + esc(t[0]) + ' → ' + esc(toks[want][0]) + ' (' + esc(relName(t)) + ').';
      setTimeout(ask, 650);
    } else {
      dep.tries++;
      var r = rel(t), h = /_CO/.test(t[6]) ? 'This word is one of a pair joined by “and”, so in these trees it hangs from the “and”.' : (HINT[r] || 'Think about what this word does in the sentence.');
      $('#dp-q').innerHTML = 'Not ' + esc(toks[i][0]) + '. <span class="dim">Hint: ' + esc(h) + '</span>';
    }
    drawDep();
  }
  function info(i) {
    var s = DATA[dep.lang][dep.i], t = s.t[i]; dep.sel = i; drawDep();
    if (!Gs) return;
    Gs.LEX[dep.lang] = DATA['lex' + dep.lang]; Gs.LEX.note = 'in these example sentences';
    var inf = Gs.wordInfo(dep.lang, t), head = t[7] >= 0 ? s.t[t[7]][0] : null, kids = s.t.filter(function (k) { return k[7] === i; }).map(function (k) { return k[0]; });
    $('#dp-panel').innerHTML = '<p class="dp-rel">' + (head ? 'Hangs from <b>' + esc(head) + '</b> as ' + esc(relName(t)) : '<b>Top of the tree</b>: the main verb') + (kids.length ? '. Words that hang from it: ' + kids.map(esc).join(', ') + '.' : '.') + '</p>' + Gs.panelHTML(inf);
  }
  function next(d) { var n = DATA[dep.lang].length; dep.i = (dep.i + d + n) % n; startSentence(); }
  function startSentence() {
    dep.sel = -1; dep.placed = DATA[dep.lang][dep.i].t.map(function () { return false; }); dep.score = 0; dep.asked = 0;
    $('#dp-sent').value = dep.i;
    $('#dp-panel').innerHTML = '<p class="wp-empty">' + (dep.mode === 'build' ? 'Build the tree one word at a time. Every word hangs from exactly one other word; the main verb hangs from nothing.' : 'Tap a word in the tree to see what it hangs from and why.') + '</p>';
    if (dep.mode === 'build') ask(); else { $('#dp-q').innerHTML = 'Each word hangs from the word it depends on. The main verb is at the top. Tap any word.'; drawDep(); }
  }
  function fillSentences() { $('#dp-sent').innerHTML = DATA[dep.lang].map(function (s, i) { return '<option value="' + i + '">' + (i + 1) + '. ' + esc(s.t.map(function (t) { return t[0]; }).join(' ')) + '</option>'; }).join(''); }
  function setupDep() {
    root.querySelectorAll('[data-lang]').forEach(function (b) { b.onclick = function () { dep.lang = b.dataset.lang; dep.i = 0; root.querySelectorAll('[data-lang]').forEach(function (x) { x.classList.toggle('on', x === b); }); fillSentences(); startSentence(); }; });
    root.querySelectorAll('[data-mode]').forEach(function (b) { b.onclick = function () { dep.mode = b.dataset.mode; root.querySelectorAll('[data-mode]').forEach(function (x) { x.classList.toggle('on', x === b); }); startSentence(); }; });
    $('#dp-sent').onchange = function () { dep.i = +this.value; startSentence(); };
    $('#dp-prev').onclick = function () { next(-1); }; $('#dp-next').onclick = function () { next(1); };
    $('#dp-words').addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (!b) return; var i = +b.dataset.w; if (dep.mode === 'build') pickBuild(i); else info(i); });
    $('#dp-svg').addEventListener('click', function (e) { var g = e.target.closest('[data-i]'); if (!g) return; var i = +g.dataset.i; if (dep.mode === 'build') pickBuild(i); else info(i); });
    $('#dp-svg').addEventListener('keydown', function (e) { if (e.key !== 'Enter' && e.key !== ' ') return; var g = e.target.closest('[data-i]'); if (g) { e.preventDefault(); if (dep.mode === 'build') pickBuild(+g.dataset.i); else info(+g.dataset.i); } });
    fillSentences(); startSentence();
  }
  setupPS();
  var base = (D.querySelector('meta[name="lang-base"]') || {}).content || '/lang/';
  fetch(base + 'data/trees.json').then(function (r) { return r.json(); }).then(function (d) { DATA = d; setupDep(); })
    .catch(function () { $('#dp-q').textContent = 'The Latin and Greek sentences could not load. Check your connection and reload the page.'; });
  W.__trees = { en: en, dep: dep, drawPS: drawPS, get DATA() { return DATA; }, pickBuild: pickBuild, ask: ask };
})(window, document);
