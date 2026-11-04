/* Dante, Inferno (gbe4). Families: the order of the circles, which circle holds which wrong, the three great
   divisions (incontinence, violence, fraud), terza rima (line counts and rhyme letters, computed), canto counts,
   who is who, dates. */
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
var ID = 'gbmiddle.dante-inferno';
var CIRC = ['Limbo', 'Desire', 'Gluttony', 'Greed', 'Anger', 'Heresy', 'Violence', 'Fraud', 'Treachery'];
var WHO = [['the great poets and philosophers of the ancient world', 'Limbo (circle 1)'], ['souls blown about by an endless storm', 'the circle of desire (circle 2)'], ['hoarders and wasters pushing heavy weights', 'the circle of greed (circle 4)'], ['the angry, fighting in the marsh of the Styx', 'the circle of anger (circle 5)'], ['heretics in open tombs inside the City of Dis', 'the circle of heresy (circle 6)'], ['Ulysses, wrapped in a flame among false advisers', 'the circle of fraud (circle 8)'], ['traitors held in a frozen lake', 'the circle of treachery (circle 9)']];
function famCircle(R, lv) {
  var c = R.pick(WHO);
  return H.mc('Where in Dante\'s Hell does he find <b>' + c[0] + '</b>?', c[1], R.sample(WHO.filter(function (x) { return x !== c; }).map(function (x) { return x[1]; }), lv === 1 ? 2 : 3), ['Our summary: ' + c[0] + ' are in ' + c[1] + '.']);
}
var DIV = [['Desire', 'incontinence (failing to control desire)'], ['Gluttony', 'incontinence (failing to control desire)'], ['Greed', 'incontinence (failing to control desire)'], ['Anger', 'incontinence (failing to control desire)'], ['Violence', 'violence'], ['Fraud', 'fraud'], ['Treachery', 'fraud']];
function famDiv(R, lv) {
  if (R.next() < 0.3) return H.mc('Virgil explains (Canto XI) that fraud is punished lower than violence. Why is fraud worse?', 'It misuses reason, the gift that makes us human', ['It is more common', 'It is always done in secret at night', 'It causes more physical harm'].slice(0, lv === 1 ? 2 : 3), ['Fraud is a misuse of reason, which belongs to humans alone.']);
  var d = R.pick(DIV), all = ['incontinence (failing to control desire)', 'violence', 'fraud'];
  return H.mc('Virgil\'s map of Hell has three great kinds of wrong. Which kind does the circle of <b>' + d[0].toLowerCase() + '</b> belong to?', d[1], all.filter(function (x) { return x !== d[1]; }), ['Circles 2 to 5: incontinence; circle 7: violence; circles 8 and 9: fraud.']);
}
function letterAt(k) { var t = Math.floor((k - 1) / 3), p = (k - 1) % 3; return LETS[p === 1 ? t + 1 : t]; }
function famRima(R, lv) {
  var r = R.next();
  if (r < 0.4) { var n = R.int(lv === 1 ? 3 : 20, lv === 1 ? 10 : 53); return H.num('A canto in terza rima has ' + n + ' tercets (groups of three lines) and one closing line. How many lines is it?', 3 * n + 1, ['$3 \\times ' + n + ' + 1 = ' + (3 * n + 1) + '$.']); }
  if (r < 0.7) { var L = R.pick([115, 130, 136, 142, 148, 151, 160]), m = (L - 1) / 3; if (m !== Math.floor(m)) { L = 3 * Math.round(m) + 1; m = (L - 1) / 3; } return H.num('A canto of ' + L + ' lines ends with one single line after its tercets. How many tercets does it have?', m, ['$(' + L + ' - 1) \\div 3 = ' + m + '$.']); }
  var k = R.int(2, lv === 1 ? 6 : 15), right = letterAt(k), w = H.uniq([letterAt(k + 1), letterAt(k - 1), LETS[Math.floor((k - 1) / 3) + 2], LETS[LETS.indexOf(right) + 1], LETS[LETS.indexOf(right) + 2]]).filter(function (x) { return x !== right; });
  return H.mc('Terza rima runs ABA BCB CDC DED ... Which rhyme letter does <b>line ' + k + '</b> have?', right, R.sample(w, Math.min(w.length, lv === 1 ? 2 : 3)), ['Line ' + k + ' is line ' + ((k - 1) % 3 + 1) + ' of tercet ' + (Math.floor((k - 1) / 3) + 1) + '.', ((k - 1) % 3 === 1 ? 'Middle lines bring in the next letter: ' : 'Outer lines use the tercet\'s own letter: ') + right + '.'], { hint: 'Find which tercet the line is in, then whether it is the middle line.' });
}
function famCantos(R, lv) {
  var r = R.next();
  if (r < 0.5) return H.mc('How many cantos does the Inferno have?', '34', ['33', '100', '9'].slice(0, lv === 1 ? 2 : 3), ['34: one introductory canto plus 33. Purgatorio and Paradiso have 33 each, 100 in all.']);
  var per = R.int(2, 5), d = Math.ceil(34 / per);
  return H.num('If you read ' + per + ' cantos of the Inferno a day, how many days do you need to finish all 34?', d, ['$34 \\div ' + per + ' \\approx ' + (34 / per).toFixed(1) + '$, so ' + d + ' days (the last day may be shorter).']);
}
var B = {
  facts: [
    ['Dante wrote the Comedy in Italian, not Latin.', true, 'In the language of Tuscany.'],
    ['Virgil guides Dante through Hell.', true, 'Beatrice sent him.'],
    ['The worst sinners in Dante\'s Hell are in the top circle.', false, 'The worst, the traitors, are at the bottom.'],
    ['At the center of Hell, Satan is stuck in ice.', true, 'Canto XXXIV.'],
    ['Dante\'s journey takes place at Easter in the year 1300.', true, 'When he was 35.'],
    ['Dante invented terza rima.', true, 'ABA BCB CDC ...'],
    ['Each canticle of the Comedy ends with the word "stars."', true, 'In Italian, <i>stelle</i>.'],
    ['Dante wrote the Comedy while living peacefully in Florence.', false, 'He wrote it in exile; Florence banished him in 1302.'],
    ['Cary\'s 1814 translation keeps Dante\'s rhymes.', false, 'Cary used unrhymed blank verse.'],
    ['Limbo holds great thinkers like Aristotle, without torment.', true, 'Canto IV.']
  ],
  items: [
    { q: 'What three beasts block Dante\'s way up the hill in Canto I?', r: 'A leopard, a lion and a she-wolf', w: ['A dragon, a bear and a fox', 'Three dogs', 'An eagle, a lion and a bull'], why: 'Canto I.' },
    { q: 'Who sent Virgil to help Dante?', r: 'Beatrice, from Heaven', w: ['Ulysses', 'The pope', 'Aristotle'], why: 'Canto II.' },
    { q: 'What does "contrapasso" refer to?', r: 'Each punishment fitting or mirroring its sin', w: ['A river in Hell', 'Dante\'s rhyme scheme', 'Virgil\'s home'], why: 'The word appears in Canto XXVIII.' },
    { q: 'What story does Ulysses tell in Canto XXVI?', r: 'His last voyage west past the edge of the known world', w: ['How he built the walls of Troy', 'His childhood in Ithaca', 'How he met Beatrice'], why: 'A story found in no ancient book.' },
    { q: 'Why did Dante choose Virgil as his guide?', r: 'Virgil was his master in poetry and had written of the underworld in the Aeneid', w: ['Virgil was his cousin', 'Virgil had been to Florence', 'Virgil was a saint'], why: 'Aeneid, Book VI.' },
    { q: 'Who wrote "All hope abandon, ye who enter in!" in English, in 1867?', r: 'Henry Wadsworth Longfellow, translating Dante', w: ['Geoffrey Chaucer', 'William Shakespeare', 'John Milton'], why: 'Inferno III, in Longfellow\'s translation.' },
    { q: 'How do Dante and Virgil leave Hell?', r: 'They climb past Satan and up a passage to the far side of the Earth', w: ['A boat carries them over the river', 'An angel lifts them out', 'They walk back up through the circles'], why: 'Canto XXXIV.' }
  ]
};
H.T(ID, B, [famSeq(CIRC, 'the circles of Hell, from the top', 'circle'), famSeq(CIRC, 'the circles of Hell, from the top', 'circle'), famCircle, famCircle, famDiv, famRima, famRima, famCantos].concat(dateFams(ID)), 0.62);
