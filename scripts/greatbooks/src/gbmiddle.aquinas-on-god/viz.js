/* gbmiddle.aquinas-on-god (gbe4, our own designs). Two visuals, also used by the other Aquinas rungs:
   gb-summa-article  the shape of one article of the Summa: the question, the objections, "On the contrary",
                     "I answer that" and the replies, revealed one step at a time. Summaries are in our own words.
                     opts: art: "god" | "wealth" | "law" | "charity" (which article is shown first); pick: false hides the picker.
   gb-five-ways      the five ways of I, q. 2, a. 3 as chains: start from something we see, step back along the chain,
                     and reach the "first" that Aquinas argues must begin it. opts: way: 1..5. */
(function () {
  var V = ML.viz; if (!V) return;
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var ARTS = {
    god: { ref: 'First Part, Question 2, Article 3', q: 'Whether God exists?',
      obj: ['If God were infinite goodness, there could be no evil at all. But there is evil in the world. So it seems God does not exist.',
        'What nature does can be explained by nature, and what people do can be explained by human reason and will. So there seems no need to suppose God.'],
      sc: 'Aquinas quotes Scripture, where God says of himself, "I am Who am" (Exodus 3:14).',
      resp: 'God\'s existence can be shown in five ways, each starting from something we can observe: motion, causes, things that come and go, degrees of goodness, and the order in nature.',
      rep: ['Quoting Augustine: God, being the highest good, would allow no evil unless he were able to bring good even out of evil.',
        'Nature works toward ends set by something higher, and human reason and will can change and fail, so both are traced back to a first cause that cannot.'] },
    wealth: { ref: 'First Part of the Second Part, Question 2, Article 1', q: 'Whether man\'s happiness consists in wealth?',
      obj: ['Money seems to answer for everything, so it seems to be the last end that all else serves.',
        'Happiness is having all good things, and money is the means of getting them.',
        'The desire for money never ends, just as the desire for the highest good never ends.'],
      sc: 'Boethius says that riches shine more when they are spent than when they are hoarded. But happiness is something we keep, not something we give away.',
      resp: 'Natural wealth (food, clothes, a house) is sought to keep us alive, so it serves us; money is sought to buy natural wealth. Neither can be our last end, because each is wanted for the sake of something else.',
      rep: ['Money "answers" only for things that can be bought, and the best things cannot be bought.',
        'Money gets us goods of the body, not wisdom or goodness.',
        'The endless desire for money shows it never satisfies, while the highest good would satisfy completely.'] },
    law: { ref: 'First Part of the Second Part, Question 90, Article 4', q: 'Whether promulgation is essential to a law?',
      obj: ['The natural law is most of all a law, yet nobody announces it. So announcing is not needed.',
        'People who were absent when a law was announced must still keep it.',
        'A law binds people in the future, who were not there to hear it.'],
      sc: 'The Church\'s law books say that laws are established when they are made public.',
      resp: 'A law is a rule that guides people, and a rule can only guide those who know it. So a law must be made known. This gives the full definition: an ordinance of reason, for the common good, made by the one who has care of the community, and made public.',
      rep: ['The natural law is made known in another way: God places it in people\'s minds, where it can be known naturally.',
        'The absent are bound because the law can come to their notice through others.',
        'Writing a law down carries its announcement into the future.'] },
    charity: { ref: 'Second Part of the Second Part, Question 23, Article 1', q: 'Whether charity is friendship?',
      obj: ['Friends live together, but we do not live together with God.',
        'Friendship needs love returned, yet charity reaches even enemies, who do not love us back.',
        'Aristotle names three kinds of friendship (for use, for pleasure and for goodness), and charity seems to be none of them.'],
      sc: 'In the Gospel of John, Jesus tells his disciples, "I will not now call you servants ... but my friends" (John 15:15).',
      resp: 'Friendship is a love that wishes the other well, is returned, and rests on something shared. God shares his own happiness with people, and the love that rests on this sharing is charity. So charity is a friendship of man for God.',
      rep: ['We live with God now in our minds, and fully, Aquinas holds, in the life to come.',
        'We love a friend\'s whole family for the friend\'s sake; so charity loves even enemies, for God\'s sake.',
        'Charity is the third kind: friendship for the sake of goodness itself.'] }
  };
  var STEPS = [['q', 'The question', 'Each article asks one yes-or-no question, starting "Whether ..."'],
    ['obj', 'Objections', 'Aquinas first states the best arguments for the answer he will reject. They usually begin "It seems that ..."'],
    ['sc', 'On the contrary', 'Then one authority on the other side: Scripture, a Church Father, or a philosopher.'],
    ['resp', 'I answer that', 'His own answer, with his reasons. This is the heart of the article.'],
    ['rep', 'Replies to the objections', 'Last, he answers every objection one by one, often showing what was true in it.']];

  V.register('gb-summa-article', function (el, o) {
    o = o || {};
    var key = ARTS[o.art] ? o.art : 'god', shown = 1;
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    if (o.pick !== false) V.seg(ctl, { label: 'Article', items: [['god', 'God exists?'], ['wealth', 'Happiness in wealth?'], ['law', 'Must laws be made public?'], ['charity', 'Is charity friendship?']], value: key, change: function (v) { key = v; shown = 1; draw(); } });
    var box = h('div', 'gb-sa'); el.appendChild(box);
    var row = h('div', 'ml-ctl'); el.appendChild(row);
    var bPrev = V.button(row, '◀ Back', function () { if (shown > 1) { shown--; draw(); } });
    var bNext = V.button(row, 'Next part ▶', function () { if (shown < STEPS.length) { shown++; draw(); } });
    V.button(row, 'Show all', function () { shown = STEPS.length; draw(); });
    var out = V.readout(el);
    function draw() {
      var A = ARTS[key], s = '<p class="gb-sa-ref">Summa Theologica, ' + A.ref + ' (summarized in our own words)</p>';
      STEPS.forEach(function (st, i) {
        if (i >= shown) { s += '<div class="gb-sa-part gb-sa-hid" aria-hidden="true"><span class="gb-sa-lab">' + (i + 1) + '. ' + st[1] + '</span></div>'; return; }
        var v = A[st[0]], body = Array.isArray(v) ? '<ol>' + v.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' : '<p>' + v + '</p>';
        s += '<div class="gb-sa-part gb-sa-' + st[0] + (i === shown - 1 ? ' gb-sa-now' : '') + '"><span class="gb-sa-lab">' + (i + 1) + '. ' + st[1] + '</span>' + body + '</div>';
      });
      box.innerHTML = s;
      bPrev.disabled = shown <= 1; bNext.disabled = shown >= STEPS.length;
      var st = STEPS[shown - 1];
      out.set('<b>' + st[1] + ':</b> ' + st[2] + (shown === STEPS.length ? ' Every one of the Summa\'s articles follows this same plan.' : ''));
    }
    draw();
  });

  var WAYS = [
    { name: 'From motion', see: 'Things in the world are moved: a stick moves because a hand moves it.',
      chain: ['the stick', 'the hand', 'the arm', 'the person\'s will', '...'], link: 'is moved by',
      prem: 'Whatever is moved is moved by something else, and the chain of movers cannot go back forever.',
      end: 'a first mover, moved by no other' },
    { name: 'From causes', see: 'Things have causes, and nothing is the cause of itself.',
      chain: ['a picture hanging on the wall', 'the nail', 'the wall', 'the frame of the house', '...'], link: 'is held up by',
      prem: 'In a chain of causes acting together, take away the first and you take away all the rest; such a chain cannot go back forever.',
      end: 'a first cause' },
    { name: 'From things that come and go', see: 'Some things can be and not be: a flower blooms and fades.',
      chain: ['the flower', 'the seed', 'the plant before it', 'the soil, the rain, the sun', '...'], link: 'depends on',
      prem: 'If everything could fail to exist, at some time nothing would have existed, and then nothing could ever have begun. So something must exist that cannot fail to be.',
      end: 'a being that exists necessarily, of itself' },
    { name: 'From degrees', see: 'We call things more or less good, true and noble.',
      chain: ['a good deed', 'a better deed', 'a still better deed', 'better yet', '...'], link: 'falls short of',
      prem: '"More" and "less" are said by how near things come to a greatest, and the greatest in a kind is the cause of the rest in that kind.',
      end: 'something best, truest and noblest, the cause of goodness in all things' },
    { name: 'From the order of nature', see: 'Things without minds, like plants and planets, act regularly toward an end.',
      chain: ['the arrow reaching the target', 'the archer aiming it', '...'], link: 'is directed by',
      prem: 'What lacks knowledge can move toward an end only if something with knowledge directs it, as an archer directs an arrow.',
      end: 'an intelligent being who directs natural things to their ends' }
  ];
  V.register('gb-five-ways', function (el, o) {
    o = o || {};
    var w = Math.max(1, Math.min(5, +o.way || 1)) - 1, back = 1;
    var ctl = h('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'Which way', items: [['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'], ['4', '5']], value: String(w), change: function (v) { w = +v; back = 1; draw(); } });
    var box = h('div', 'gb-fw'); el.appendChild(box);
    var row = h('div', 'ml-ctl'); el.appendChild(row);
    var bBack = V.button(row, 'Step back along the chain', function () { back++; draw(); });
    V.button(row, 'Start again', function () { back = 1; draw(); });
    var out = V.readout(el);
    function draw() {
      var W = WAYS[w], ch = W.chain, n = Math.min(back, ch.length), done = back > ch.length, s = '';
      s += '<p class="gb-fw-h"><b>Way ' + (w + 1) + ': ' + W.name + '.</b> ' + W.see + '</p><ol class="gb-fw-chain">';
      for (var i = 0; i < n; i++) s += '<li class="gb-fw-link' + (i === n - 1 && !done ? ' gb-fw-now' : '') + '"><span>' + ch[i] + '</span>' + (i < n - 1 || done ? '<em>' + W.link + '</em>' : '') + '</li>';
      if (done) s += '<li class="gb-fw-link gb-fw-first"><span>' + W.end + '</span></li>';
      s += '</ol>';
      box.innerHTML = s;
      bBack.disabled = done;
      out.set(done ? '<b>Aquinas\'s step:</b> ' + W.prem + ' So there must be ' + W.end + ', and this, he says, is what people call God. (Whether the step works is what later readers argue about.)'
        : 'Press <b>Step back</b> to ask: what does this ' + (w === 3 ? 'fall short of' : 'depend on') + '? ' + (n === ch.length - 1 ? 'One more step reaches Aquinas\'s key premise.' : ''));
    }
    draw();
  });
})();
