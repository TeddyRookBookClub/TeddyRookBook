/* gb-mill-harm: sort cases the way Mill does in On Liberty. The cases are Mill's own examples (Chapters II, IV and V),
   retold in our words. Our own design; styles from gb19.hegel-philosophy-of-right/viz.css. */
ML.viz.register('gb-mill-harm', function (el, opts, V) {
  el.classList.add('gb19');
  var A = ['Leave it to the person', 'Society may step in', 'Warn, but do not force'];
  var C = [
    ['A man drinks too much at home, alone, and harms no one but himself.', 0, 'Mill: no one should be punished simply for being drunk. Friends may advise him, and others may choose to avoid him, but that is all.'],
    ['A police officer is drunk while on duty.', 1, 'Mill\'s own example: a soldier or policeman drunk on duty may be punished, because now others are put at risk.'],
    ['A writer prints in a newspaper that grain dealers are starving the poor.', 0, 'Mill: opinions, even wrong or unpopular ones, should be free to be published and argued against.'],
    ['Someone shouts the same claim to an angry crowd gathered outside a grain dealer\'s house.', 1, 'Mill: the same words may be punished when, in that setting, they are a spark to violence against a person.'],
    ['A traveler is about to step onto a bridge that you know is unsafe, and there is no time to warn him.', 1, 'Mill: you may seize him and turn him back. Liberty means doing what you want, and he does not want to fall into the river.'],
    ['A traveler knows a mountain path is risky and chooses to climb it anyway.', 2, 'Mill: when a person knows the danger and only they are at risk, others should warn them, not stop them.'],
    ['A person dresses, eats and lives in an unusual way that their neighbors dislike.', 0, 'Mill praises "experiments of living." Dislike is not harm.'],
    ['A shop sells a poison that also has good uses, such as killing rats.', 2, 'Mill: do not ban it; label it and keep a record of sales, so buyers know what it is and crimes can be traced.'],
    ['A man spends the money he owes for his children\'s support on drink.', 1, 'Mill: he may be blamed and made to pay, not for drinking, but for failing a duty he owes to others.'],
    ['Someone wants to sign a contract selling himself as a slave.', 1, 'Mill: the state need not enforce it. Freedom cannot mean the freedom to give up all freedom.']
  ];
  var order = C.map(function (_, i) { return i; }), k = 0, score = 0, done = false;
  var box = document.createElement('div'); box.className = 'gb19-panel'; el.appendChild(box);
  var card = document.createElement('div'); card.className = 'gb19-card'; box.appendChild(card);
  var btns = document.createElement('div'); btns.className = 'gb19-btns'; box.appendChild(btns);
  var ro = V.readout(el), nx;
  function show() {
    var c = C[order[k]]; done = false;
    card.innerHTML = '<p class="gb19-s">Case ' + (k + 1) + ' of ' + C.length + '</p><p class="gb19-big">' + c[0] + '</p>';
    ro.set('What would Mill say? Choose one.'); nx.disabled = true;
  }
  A.forEach(function (a, i) {
    V.button(btns, a, function () {
      if (done) return; var c = C[order[k]]; done = true; if (i === c[1]) score++;
      ro.set((i === c[1] ? '<span class="gb19-ok">Mill agrees.</span> ' : '<span class="gb19-no">Mill would say: ' + A[c[1]].toLowerCase() + '.</span> ') + c[2] + ' <i>Score: ' + score + ' of ' + (k + 1) + '.</i>');
      nx.disabled = k >= C.length - 1;
    });
  });
  nx = V.button(btns, 'Next case →', function () { if (k < C.length - 1) { k++; show(); } });
  V.button(btns, 'Start over', function () { k = 0; score = 0; show(); });
  show();
});
