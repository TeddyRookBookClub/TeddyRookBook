/* Dante, Paradiso (gbe4). Families: the order of the heavens, who Dante meets in each, the guides in order,
   counting the spheres, Ptolemaic vs modern order, dates. */
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
var ID = 'gbmiddle.dante-paradiso';
var SPH = ['Moon', 'Mercury', 'Venus', 'Sun', 'Mars', 'Jupiter', 'Saturn', 'Fixed stars', 'Primum Mobile', 'Empyrean'];
var MEET = [['Moon', 'Piccarda, who could not keep her vows'], ['Mercury', 'the emperor Justinian, who tells the story of Rome'], ['Sun', 'Thomas Aquinas and other wise teachers in rings of light'], ['Mars', 'Cacciaguida, who foretells Dante\'s exile'], ['Jupiter', 'just rulers forming an eagle that speaks with one voice'], ['Saturn', 'souls of prayer beside a golden ladder'], ['Fixed stars', 'Saints Peter, James and John, who examine him'], ['Primum Mobile', 'God as a point of light circled by nine rings of angels'], ['Empyrean', 'the blessed seated in a great white rose']];
function famMeet(R, lv) {
  return famPairs(MEET, function (a) { return 'In the heaven of the <b>' + a + '</b>, what does Dante find?'; }, function (b) { return 'In which heaven does Dante find <b>' + b + '</b>?'; })(R, lv);
}
var GUIDES = ['Virgil', 'Beatrice', 'Saint Bernard'];
function famGuide(R, lv) {
  var r = R.next();
  if (r < 0.5) return H.mc('Who guides Dante in the <b>last</b> cantos of the Paradiso and prays to Mary for him?', 'Saint Bernard', ['Virgil', 'Beatrice', 'Statius'].slice(0, lv === 1 ? 2 : 3), ['Bernard replaces Beatrice in the Empyrean.']);
  return H.mc('Which list gives Dante\'s guides in order, from the dark wood to the end?', GUIDES.join(' → '), ['Beatrice → Virgil → Saint Bernard', 'Saint Bernard → Beatrice → Virgil', 'Virgil → Saint Bernard → Beatrice'].slice(0, lv === 1 ? 2 : 3), ['Virgil (Hell and Purgatory), Beatrice (from the top of Purgatory), Bernard (the Empyrean).']);
}
function hv(x) { return x === 'Fixed stars' ? 'the fixed stars' : x === 'Primum Mobile' || x === 'Empyrean' ? 'the ' + x : x; }
function famCount(R, lv) {
  var r = R.next();
  if (r < 0.35) return H.num('Dante\'s heavens have seven planetary spheres (counting the Moon and the Sun as planets), the fixed stars and the Primum Mobile. How many moving spheres is that?', 9, ['$7 + 1 + 1 = 9$.']);
  if (r < 0.7) { var a = R.int(0, 8), b = R.int(a + 1, 9); return H.num('Counting up from the Moon (1) to the Empyrean (10), how many heavens does Dante rise through to go from <b>' + hv(SPH[a]) + '</b> to <b>' + hv(SPH[b]) + '</b>?', b - a, [SPH[a] + ' is heaven ' + (a + 1) + ' and ' + SPH[b] + ' is heaven ' + (b + 1) + ': $' + (b + 1) + ' - ' + (a + 1) + ' = ' + (b - a) + '$.']); }
  return H.mc('Dante\'s order of the planets comes from Ptolemy, with the Earth at the center. Which body is <b>between Venus and Mars</b> in his order, but not in today\'s solar system?', 'The Sun', ['The Moon', 'Saturn', 'Jupiter'].slice(0, lv === 1 ? 2 : 3), ['Ptolemy: Moon, Mercury, Venus, Sun, Mars. Today the Sun is at the center and the Earth lies between Venus and Mars.']);
}
var B = {
  facts: [
    ['Dante rises through the heavens by looking at Beatrice.', true, 'She looks toward heaven\'s light, and they rise.'],
    ['In Dante\'s cosmos, the Sun is at the center.', false, 'The Earth is at the center, as in Aristotle and Ptolemy.'],
    ['Beatrice proposes an experiment with three mirrors.', true, 'Canto II, about the marks on the Moon.'],
    ['Piccarda wishes she had a higher place in heaven.', false, 'She says the blessed want only what God wills.'],
    ['All the blessed really live together in the Empyrean.', true, 'They appear in the spheres to show Dante their degrees of joy (Canto IV).'],
    ['Aquinas praises Saint Francis in the heaven of the Sun.', true, 'And Bonaventure praises Saint Dominic.'],
    ['The Primum Mobile is the sphere that turns all the others.', true, '"First moved."'],
    ['Dante describes God in full detail at the end of the poem.', false, 'His power to imagine fails; he says words cannot hold it.'],
    ['The Comedy\'s last line speaks of the Love that moves the sun and the stars.', true, 'Canto XXXIII.'],
    ['Galileo once lectured on the size and shape of Dante\'s Inferno.', true, 'As a young man, in Florence.']
  ],
  items: [
    { q: 'What does Piccarda say is the source of the blessed souls\' peace?', r: 'God\'s will: "in his will is our tranquillity"', w: ['Their high rank', 'Their memories of Earth', 'Their beauty'], why: 'Canto III.' },
    { q: 'What does Cacciaguida tell Dante in the heaven of Mars?', r: 'That he will be exiled, and must still write all he has seen', w: ['That he will become pope', 'That Beatrice will return to Earth', 'That Florence will crown him'], why: 'Canto XVII.' },
    { q: 'What do the souls of just rulers form in the heaven of Jupiter?', r: 'An eagle that speaks with one voice', w: ['A ladder', 'A rose', 'A cross'], why: 'Cantos XVIII to XX.' },
    { q: 'What does Dante see when he looks down from the fixed stars?', r: 'The small Earth, which makes him smile', w: ['Florence in flames', 'The gate of Hell', 'Mount Purgatory only'], why: 'Canto XXII.' },
    { q: 'In what shape are the blessed seated in the Empyrean?', r: 'A great white rose', w: ['A wheel', 'A mountain', 'A tower'], why: 'Cantos XXX to XXXII.' },
    { q: 'Who prays to Mary for Dante at the end?', r: 'Saint Bernard', w: ['Beatrice', 'Virgil', 'Aquinas'], why: 'Canto XXXIII.' }
  ]
};
H.T(ID, B, [famSeq(SPH, 'the heavens, from the Moon upward', 'heaven'), famSeq(SPH, 'the heavens, from the Moon upward', 'heaven'), famMeet, famMeet, famGuide, famCount, famCount].concat(dateFams(ID)), 0.64);
