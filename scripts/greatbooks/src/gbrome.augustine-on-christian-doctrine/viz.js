/* gbrome.augustine-on-christian-doctrine: visual gb-signs (gbe3, our own design). Augustine's sorting of things and
   signs (On Christian Doctrine I.2 and II.1-3): a plain thing, a natural sign, or a conventional (given) sign.
   Augustine's own examples are marked; the rest are ours, in the same spirit. */
var EX = [
  ['Smoke rising from behind a hill', 'n', 'It makes you think of fire, though no one meant it as a sign. (Augustine’s example, II.1)'],
  ['An animal’s footprint in the mud', 'n', 'It tells you an animal passed, without anyone intending it. (Augustine’s example, II.1)'],
  ['An angry look on someone’s face', 'n', 'It shows a feeling whether the person wants it to or not. (Augustine’s example, II.1)'],
  ['A spoken word', 'c', 'Words are the chief conventional signs: people use them on purpose to share what is in their minds. (II.3)'],
  ['A trumpet call telling soldiers to advance', 'c', 'Agreed on beforehand, and given on purpose. (Augustine’s example, II.1)'],
  ['A nod of the head', 'c', 'A sign given to the eyes, on purpose. (Augustine’s example, II.3)'],
  ['A military flag', 'c', 'It conveys the commander’s will through the eyes. (Augustine’s example, II.3)'],
  ['A piece of wood, just as wood', 'thing', 'A thing in the strict sense: not used as a sign of anything else. (Augustine’s example, I.2)'],
  ['A stone, just as a stone', 'thing', 'A plain thing. Though Jacob’s stone pillow was also a sign, Augustine says. (I.2)'],
  ['Cattle in a field', 'thing', 'A plain thing. (Augustine’s example, I.2)'],
  ['Dark clouds before a storm', 'n', 'A natural sign of rain: no one sends it as a message.'],
  ['A red traffic light', 'c', 'A conventional sign: people agreed what red means.'],
  ['A written letter of the alphabet', 'c', 'Letters are signs of the sounds of words, Augustine says: signs of signs. (II.4)'],
  ['A fever’s flushed cheeks', 'n', 'A natural sign of illness.'],
  ['A wave of the hand to say hello', 'c', 'A gesture given on purpose.'],
  ['A loaf of bread on a plate', 'thing', 'Just a thing, unless someone uses it to mean something else.']
];
var LAB = { n: 'Natural sign', c: 'Conventional sign', thing: 'Just a thing' };
ML.viz.register('gb-signs', function (el, opts, V) {
  var order = EX.map(function (_, i) { return i; }), pos = 0, picked = null, score = 0, tries = 0;
  var stage = document.createElement('div'); stage.className = 'gb-stage gbsg'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var ro = V.readout(el);
  function draw() {
    var e = EX[order[pos]], h = '<p class="gbsg-card"><span class="gbsg-k">' + (pos + 1) + ' of ' + EX.length + '</span>' + e[0] + '</p><div class="gbsg-btns" role="group" aria-label="Choose a kind">';
    ['thing', 'n', 'c'].forEach(function (k) { h += '<button type="button" data-k="' + k + '" class="' + (picked ? (k === e[1] ? 'right' : k === picked ? 'wrong' : '') : '') + '"' + (picked ? ' disabled' : '') + '>' + LAB[k] + '</button>'; });
    stage.innerHTML = h + '</div>';
    Array.prototype.forEach.call(stage.querySelectorAll('.gbsg-btns button'), function (b) {
      b.addEventListener('click', function () { if (picked) return; picked = b.getAttribute('data-k'); tries++; if (picked === e[1]) score++; draw(); });
    });
    ro.set(picked ? (picked === e[1] ? '<b>Yes: ' + LAB[e[1]].toLowerCase() + '.</b> ' : '<b>Augustine would say: ' + LAB[e[1]].toLowerCase() + '.</b> ') + e[2] + ' <small>(' + score + ' of ' + tries + ' so far)</small>'
      : 'Is it a plain thing, a <b>natural sign</b> (it points to something without anyone meaning it to), or a <b>conventional sign</b> (given on purpose to share a thought)?');
  }
  V.button(ctl, 'Next example ▶', function () { pos = (pos + 1) % EX.length; picked = null; draw(); }, 'pri');
  draw();
});
