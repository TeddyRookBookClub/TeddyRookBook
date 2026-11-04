/* Chaucer, The Canterbury Tales (gbe4). Families: the road in order and its distances (computed), who tells which
   tale, kinds of tale, the Host's plan (computed), couplets and syllables, Middle English glosses, Becket, dates. */
/* shared helpers for the gbmiddle rungs (gbe4); each gen.js carries its own copy, since each is wrapped on its own. */
var LETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* a sequence family: seq = [label, ...] in order; what = "the circles of Hell, from the top"; it = noun for one item */
function famSeq(seq, what, it) {
  return function (R, lv) {
    var r = R.next();
    if (r < 0.4) {
      var k = lv === 1 ? 3 : 4, idx = R.sample(seq.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
      var right = idx.map(function (i) { return seq[i]; }).join(' → '), w = [];
      for (var t = 0; t < 8 && w.length < 3; t++) { var sh = R.shuffle(idx.slice()).map(function (i) { return seq[i]; }).join(' → '); if (sh !== right && w.indexOf(sh) < 0) w.push(sh); }
      return H.mc('Which list puts these in the right order (' + what + ')?', right, w, ['In order: ' + right + '.'], { hint: 'Find the first one, then work forward.' });
    }
    if (r < 0.7 || lv === 1) {
      var i = R.int(0, seq.length - 2), wr = R.sample(seq.filter(function (_, j) { return j !== i + 1 && j !== i; }), lv === 1 ? 2 : 3);
      return H.mc('In ' + what + ', which ' + it + ' comes right after <b>' + seq[i] + '</b>?', seq[i + 1], wr, [seq[i] + ' is followed by ' + seq[i + 1] + '.']);
    }
    var j = R.int(0, seq.length - 1);
    return H.num('Counting ' + what + ', what number is <b>' + seq[j] + '</b>? (The first is 1.)', j + 1, ['The order is: ' + seq.map(function (x, n) { return (n + 1) + '. ' + x; }).join('; ') + '.'], { hint: 'Count from the start.' });
  };
}
/* a matching family: pairs = [[a, b], ...]; qa(a) asks for b; qb(b) asks for a (optional) */
function famPairs(pairs, qa, qb) {
  return function (R, lv) {
    var p = R.pick(pairs), k = lv === 1 ? 2 : 3;
    if (qb && R.coin()) {
      var wa = H.uniq(pairs.filter(function (x) { return x[1] !== p[1] && x[0] !== p[0]; }).map(function (x) { return x[0]; }));
      return H.mc(qb(p[1]), p[0], R.sample(wa, Math.min(k, wa.length)), [p[0] + ': ' + p[1] + '.']);
    }
    var wb = H.uniq(pairs.filter(function (x) { return x[1] !== p[1]; }).map(function (x) { return x[1]; }));
    return H.mc(qa(p[0]), p[1], R.sample(wb, Math.min(k, wb.length)), [p[0] + ': ' + p[1] + '.']);
  };
}
var ID = 'gbmiddle.chaucer-canterbury-tales';
var ROAD = [['Southwark', 0], ['Deptford', 5], ['Greenwich', 6], ['Rochester', 30], ['Sittingbourne', 41], ['Boughton under Blean', 50], ['Harbledown', 54], ['Canterbury', 56]];
function famRoad(R, lv) {
  var r = R.next();
  if (r < 0.45 || lv === 1) return famSeq(ROAD.map(function (x) { return x[0]; }), 'the places named on the pilgrims\' road, from London', 'place')(R, lv);
  if (r < 0.75) { var i = R.int(0, ROAD.length - 2), j = R.int(i + 1, ROAD.length - 1); return H.num('Using our map\'s rough distances, Southwark is mile 0, ' + ROAD[i][0] + ' is about mile ' + ROAD[i][1] + ' and ' + ROAD[j][0] + ' about mile ' + ROAD[j][1] + '. About how many miles is it from ' + ROAD[i][0] + ' to ' + ROAD[j][0] + '?', ROAD[j][1] - ROAD[i][1], ['$' + ROAD[j][1] + ' - ' + ROAD[i][1] + ' = ' + (ROAD[j][1] - ROAD[i][1]) + '$ miles.']); }
  var per = R.pick([14, 16, 19, 20, 28]), d = Math.ceil(56 / per);
  return H.num('The road from Southwark to Canterbury is about 56 miles. If the pilgrims rode about ' + per + ' miles a day, on how many days would they be riding?', d, ['$56 \\div ' + per + ' \\approx ' + (56 / per).toFixed(1) + '$, so ' + d + ' days (the last one shorter, if it does not divide evenly).']);
}
var TELL = [['the Knight', 'two cousins in love with the same lady, and a great tournament'], ['the Nun\'s Priest', 'the rooster Chauntecleer and the flattering fox'], ['the Pardoner', 'three young men who set out to kill Death and find gold'], ['the Franklin', 'a rash promise, a magician and a contest of generosity'], ['the Parson', 'a sermon on repentance'], ['Chaucer himself', 'the jingling "Sir Thopas," which the Host stops'], ['the Canon\'s Yeoman', 'his master\'s years of failed attempts to make gold']];
var KIND = [['the Knight\'s Tale', 'a romance of knights and love'], ['the Nun\'s Priest\'s Tale', 'a beast fable'], ['the Parson\'s Tale', 'a sermon'], ['the Pardoner\'s Tale', 'a moral example against greed'], ['the Franklin\'s Tale', 'a Breton lay']];
function famPlan(R, lv) {
  var r = R.next();
  if (r < 0.4) { var p = R.int(20, 34), t = lv === 1 ? 2 : 4; return H.num('The Host proposes that each pilgrim tell ' + (t === 2 ? 'two tales on the way to Canterbury' : 'two tales on the way and two on the way back') + '. With ' + p + ' pilgrims, how many tales is that?', p * t, ['$' + p + ' \\times ' + t + ' = ' + p * t + '$.']); }
  if (r < 0.7) { var c = R.int(lv === 1 ? 2 : 50, lv === 1 ? 9 : 430); return H.num('Most of the Tales are in rhymed couplets: pairs of lines that rhyme. How many lines are in ' + c + ' couplets?', 2 * c, ['$2 \\times ' + c + ' = ' + 2 * c + '$.']); }
  var n = R.int(2, lv === 1 ? 4 : 12);
  return H.num('A typical line of Chaucer\'s couplets has 10 syllables. About how many syllables are in ' + n + ' couplets?', 20 * n, [n + ' couplets = ' + 2 * n + ' lines; $' + 2 * n + ' \\times 10 = ' + 20 * n + '$.']);
}
var GL = [['sote', 'sweet'], ['droghte', 'dryness, drought'], ['rote', 'root'], ['longen', 'long, yearn'], ['wende', 'go'], ['seke', 'seek (and also sick)'], ['holpen', 'helped'], ['trouthe', 'faithfulness'], ['fredom', 'generosity'], ['verray parfit gentil', 'true, perfect, noble'], ['smale fowles', 'little birds'], ['strondes', 'shores']];
var B = {
  facts: [
    ['The pilgrims meet at the Tabard Inn in Southwark.', true, 'Across the Thames from London.'],
    ['The pilgrims are going to the shrine of Saint Thomas Becket.', true, 'In Canterbury Cathedral.'],
    ['Chaucer finished every tale the Host planned.', false, 'He finished about 24 of a planned 120 or so.'],
    ['The Knight tells the first tale.', true, 'He draws the shortest straw.'],
    ['Chaucer wrote the Tales in Latin.', false, 'In the English of London, called Middle English.'],
    ['The Host, Harry Bailly, will judge the best story.', true, 'The prize is a supper paid for by the others.'],
    ['Becket was killed in Canterbury Cathedral in 1170.', true, 'After a quarrel with King Henry II.'],
    ['In the Nun\'s Priest\'s Tale, the fox eats the rooster.', false, 'Chauntecleer talks his way free.'],
    ['Chaucer is buried in Westminster Abbey.', true, 'The first poet in Poets\' Corner.'],
    ['Every pilgrim in the General Prologue is shown as wholly good.', false, 'Many portraits are quietly satirical; a few, like the Parson\'s, are plainly good.']
  ],
  items: [
    { q: 'What season opens the General Prologue?', r: 'April, with its sweet showers', w: ['Winter snow', 'Late autumn', 'Midsummer heat'], why: '"Whan that Aprille with his shoures sote."' },
    { q: 'Which pilgrim "gladly wolde ... lerne, and gladly teche"?', r: 'The Clerk, a poor Oxford student', w: ['The Miller', 'The Monk', 'The Host'], why: 'General Prologue, line 308.' },
    { q: 'What does the Pardoner preach about, while selling pardons?', r: 'That greed is the root of evils', w: ['That money is good', 'That pilgrimages are useless', 'That dreams come true'], why: '<i>Radix malorum est cupiditas.</i>' },
    { q: 'What happens when Chaucer the pilgrim tells his tale of Sir Thopas?', r: 'The Host stops him because the rhymes are so bad', w: ['Everyone cheers', 'He wins the prize', 'The Knight joins in'], why: 'Then he tells a prose tale instead.' },
    { q: 'Which earlier book also frames many stories told by a group?', r: 'Boccaccio\'s Decameron', w: ['Homer\'s Odyssey', 'Euclid\'s Elements', 'Aquinas\'s Summa'], why: 'Ten young Florentines tell a hundred tales.' },
    { q: 'Who first printed the Canterbury Tales, around 1476?', r: 'William Caxton', w: ['Johannes Gutenberg', 'Geoffrey Chaucer', 'Harry Bailly'], why: 'One of the first books printed in England.' }
  ]
};
H.T(ID, B, [famRoad, famRoad, famPairs(TELL, function (a) { return 'What tale does <b>' + a + '</b> tell?'; }, function (b) { return 'Who tells the tale of <b>' + b + '</b>?'; }), famPairs(TELL, function (a) { return 'What tale does <b>' + a + '</b> tell?'; }, function (b) { return 'Who tells the tale of <b>' + b + '</b>?'; }), famPairs(KIND, function (a) { return 'What kind of story is <b>' + a + '</b>?'; }), famPlan, famPairs(GL, function (a) { return 'In Chaucer\'s Middle English, what does <b><i>' + a + '</i></b> mean?'; })].concat(dateFams(ID)), 0.64);
