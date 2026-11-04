/* Dante, Purgatorio (gbe4). Families: the order of the terraces, what the souls do on each, Virgil's three ways love
   goes wrong (a classification), the regions of the mountain, the guides, the P's, terza rima counts, dates. */
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
var ID = 'gbmiddle.dante-purgatorio';
var TER = ['Pride', 'Envy', 'Anger', 'Sloth', 'Greed', 'Gluttony', 'Lust'];
var DO = [['Pride', 'walk bent under heavy stones'], ['Envy', 'sit in plain cloaks with their eyes closed'], ['Anger', 'walk through thick, dark smoke'], ['Sloth', 'run without rest'], ['Greed', 'lie face down on the ground'], ['Gluttony', 'go hungry beside trees of fruit'], ['Lust', 'walk through a wall of flame']];
function famDo(R, lv) {
  return famPairs(DO, function (a) { return 'On the terrace of <b>' + a.toLowerCase() + '</b>, what do the souls do?'; }, function (b) { return 'On which terrace do the souls <b>' + b + '</b>?'; })(R, lv);
}
var LOVE = [['Pride', 'love aimed at harm to others'], ['Envy', 'love aimed at harm to others'], ['Anger', 'love aimed at harm to others'], ['Sloth', 'love too weak for the highest good'], ['Greed', 'love too strong for lesser goods'], ['Gluttony', 'love too strong for lesser goods'], ['Lust', 'love too strong for lesser goods']];
function famLove(R, lv) {
  var r = R.next(), kinds = ['love aimed at harm to others', 'love too weak for the highest good', 'love too strong for lesser goods'];
  if (r < 0.3) { var k = R.pick([[0, 3], [1, 1], [2, 3]]); return H.num('In Virgil\'s speech (Cantos XVII and XVIII), how many terraces cure <b>' + kinds[k[0]] + '</b>?', k[1], ['Aimed at harm: pride, envy, anger (3). Too weak: sloth (1). Too strong: greed, gluttony, lust (3).']); }
  var t = R.pick(LOVE);
  return H.mc('Virgil says every wrong comes from love gone astray in one of three ways. Which way is <b>' + t[0].toLowerCase() + '</b>?', t[1], kinds.filter(function (x) { return x !== t[1]; }), ['Pride, envy and anger: aimed at harm. Sloth: too weak. Greed, gluttony and lust: too strong for lesser goods.']);
}
var REG = ['The shore', 'Ante-Purgatory', 'The gate', 'The seven terraces', 'The Earthly Paradise'];
var CURE = [['Pride', 'humility'], ['Envy', 'kindness to others'], ['Anger', 'gentleness'], ['Sloth', 'eagerness to do good'], ['Greed', 'generosity'], ['Gluttony', 'moderation'], ['Lust', 'self-control']];
function famPs(R, lv) {
  var r = R.next();
  if (r < 0.5) { var done = R.int(1, 6); return H.num('The angel at the gate marks seven P\'s on Dante\'s forehead, and one is wiped away on each terrace. After Dante has passed ' + done + ' terrace' + (done > 1 ? 's' : '') + ', how many P\'s are left?', 7 - done, ['$7 - ' + done + ' = ' + (7 - done) + '$.']); }
  return H.mc('What does the letter P on Dante\'s forehead stand for?', 'Peccatum, Latin for "sin"', ['Purgatory', 'Patience', 'Prayer'].slice(0, lv === 1 ? 2 : 3), ['P for <i>peccatum</i>, sin.']);
}
function famRima(R, lv) {
  var n = R.int(lv === 1 ? 3 : 35, lv === 1 ? 12 : 53);
  if (R.coin()) return H.num('A canto has ' + n + ' tercets plus one closing line. How many lines does it have?', 3 * n + 1, ['$3 \\times ' + n + ' + 1 = ' + (3 * n + 1) + '$.']);
  return H.num('Inferno has 34 cantos and Purgatorio 33. How many cantos has a reader finished after reading all of Inferno and ' + Math.min(n, 33) + ' cantos of Purgatorio?', 34 + Math.min(n, 33), ['$34 + ' + Math.min(n, 33) + ' = ' + (34 + Math.min(n, 33)) + '$.']);
}
var B = {
  facts: [
    ['Dante places Mount Purgatory on an island opposite Jerusalem.', true, 'In the southern ocean.'],
    ['The souls in Purgatory want to escape back to Earth.', false, 'They want to be there; their climb ends in Heaven.'],
    ['Cato guards the shore of Purgatory.', true, 'Cantos I and II.'],
    ['Virgil guides Dante all the way into Heaven.', false, 'Virgil leaves when Beatrice comes, at the top.'],
    ['The Roman poet Statius joins Dante and Virgil on the way up.', true, 'On the terrace of greed.'],
    ['Climbing gets harder the higher Dante goes.', false, 'It gets easier as each P is removed.'],
    ['At the top of the mountain is the Garden of Eden.', true, 'The Earthly Paradise.'],
    ['Dante drinks from the rivers Lethe and Eunoë.', true, 'Forgetting wrongs, remembering good.'],
    ['Purgatory in the poem has no sunlight or time.', false, 'Unlike Hell, it has days, nights and the sun.'],
    ['Virgil says every wrong act comes from love gone astray.', true, 'Canto XVII.']
  ],
  items: [
    { q: 'Why does Virgil tie a reed around Dante on the shore?', r: 'As a sign of humility, a plant that bends without breaking', w: ['To measure the mountain', 'To keep his cloak on', 'As a fishing line'], why: 'Canto I.' },
    { q: 'Why must souls in Ante-Purgatory wait?', r: 'They put off turning to God until late', w: ['The gate is broken', 'They are too heavy to climb', 'They are waiting for Virgil'], why: 'Cantos III to VIII.' },
    { q: 'What makes Dante willing to pass through the wall of fire?', r: 'Virgil tells him Beatrice is on the other side', w: ['An angel carries him', 'He cannot feel heat', 'Statius pushes him'], why: 'Canto XXVII.' },
    { q: 'What happens when Beatrice arrives in the Earthly Paradise?', r: 'Dante turns to Virgil and finds he is gone', w: ['Virgil climbs on with them', 'Dante returns to Florence', 'The mountain falls'], why: 'Canto XXX.' },
    { q: 'What does a soul on the terrace of anger say about the stars and our choices?', r: 'The stars may stir our feelings, but we are free to choose', w: ['The stars decide everything we do', 'The stars do not exist', 'Only kings are free'], why: 'Canto XVI.' },
    { q: 'Which virtue cures the sin of pride?', r: 'Humility', w: ['Generosity', 'Moderation', 'Courage'], why: 'The proud meditate on examples of humility.' }
  ]
};
H.T(ID, B, [famSeq(TER, 'the seven terraces, from the bottom', 'terrace'), famSeq(TER, 'the seven terraces, from the bottom', 'terrace'), famDo, famDo, famLove, famLove, famSeq(REG, 'the parts of the mountain, from the bottom', 'part'), famPairs(CURE, function (a) { return 'On the terrace of <b>' + a.toLowerCase() + '</b>, the souls practice which opposite virtue?'; }), famPs, famRima].concat(dateFams(ID)), 0.64);
