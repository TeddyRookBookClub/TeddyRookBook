/* gbgreeks.plato-trial-of-socrates: practice generator (gbe2). Bank plus computed families; shared helpers first. */
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
/* put events in order: ev = [[label, key, when]] (key sorts; when is shown in the answer) */
function famSeq(R, lv, ev, what) {
  var k = lv === 1 ? 3 : 4, pick = R.sample(ev, Math.min(k, ev.length)), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
  var lab = function (e) { return e[0]; }, right = srt.map(lab).join(' → '), w = [];
  for (var i = 0; i < 8 && w.length < 4; i++) { var s = R.shuffle(srt.slice()).map(lab).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Which list puts these ' + (what || 'events') + ' in order, <b>first to last</b>?', right, H.samp(R, w, lv === 1 ? 2 : 3), srt.map(function (e) { return e[0] + (e[2] ? ': ' + e[2] : '') + '.'; }), { hint: 'Find the one that must come first, then work forward.' });
}
function famFirst(R, lv, ev, what) {
  var pick = R.sample(ev, lv === 1 ? 3 : 4), late = R.coin(), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
  var right = late ? srt[srt.length - 1] : srt[0];
  return H.mc('Which of these ' + (what || 'events') + ' came <b>' + (late ? 'last' : 'first') + '</b>?', right[0], pick.filter(function (e) { return e !== right; }).map(function (e) { return e[0]; }), srt.map(function (e) { return e[0] + (e[2] ? ': ' + e[2] : '') + '.'; }));
}
/* key terms: tm = [[term, meaning]] */
function famTerm(R, lv, tm, ctx) {
  var t = R.pick(tm), others = tm.filter(function (x) { return x !== t; }), n = lv === 1 ? 2 : 3;
  if (R.coin()) return H.mc('In ' + ctx + ', what does <b>' + t[0] + '</b> mean?', t[1], H.samp(R, others, n).map(function (x) { return x[1]; }), [t[0] + ': ' + t[1] + '.']);
  return H.mc('In ' + ctx + ', which term means: <i>' + t[1] + '</i>?', t[0], H.samp(R, others, n).map(function (x) { return x[0]; }), [t[0] + ': ' + t[1] + '.']);
}
/* who said what (from our own summaries): sd = [[speaker, claim]] */
function famWho(R, lv, sd, ctx) {
  var s = R.pick(sd), names = H.uniq(sd.map(function (x) { return x[0]; })).filter(function (n) { return n !== s[0]; });
  return H.mc('In ' + ctx + ', who argues this (in our own summary)? <i>"' + s[1] + '"</i>', s[0], H.samp(R, names, lv === 1 ? 2 : 3), [s[0] + ' says this, in our words.']);
}
/* match two columns: pr = [[a, b]]; ask which b goes with a given a (or the reverse) */
function famMatch(R, lv, pr, qa, qb) {
  var p = R.pick(pr), others = pr.filter(function (x) { return x !== p; }), n = Math.min(others.length, lv === 1 ? 2 : 3);
  if (R.coin()) return H.mc(qa.replace('#', '<b>' + p[0] + '</b>'), p[1], H.samp(R, others, n).map(function (x) { return x[1]; }), [p[0] + ' goes with ' + p[1] + '.']);
  return H.mc(qb.replace('#', '<b>' + p[1] + '</b>'), p[0], H.samp(R, others, n).map(function (x) { return x[0]; }), [p[1] + ' goes with ' + p[0] + '.']);
}
var ID = 'gbgreeks.plato-trial-of-socrates';
var EV = [['Aristophanes\' Clouds makes fun of Socrates', -423, '423 BC'], ['Athens loses the Peloponnesian War', -404, '404 BC'], ['Socrates meets Euthyphro outside the court', -399.9, 'spring 399 BC'], ['The jury votes him guilty', -399.8, 'the trial'], ['The jury votes for the death penalty', -399.7, 'later the same day'], ['Crito urges him to escape', -399.6, 'about a month later'], ['His last conversation, about the soul', -399.5, 'the Phaedo, his last day']];
var DAYS = [['Euthyphro', 1, 'on the way to court'], ['Apology', 2, 'the trial'], ['Crito', 3, 'in prison'], ['Phaedo', 4, 'the last day']];
var WHO = [['Socrates', 'Not life, but a good life, is what matters most.'], ['Socrates', 'I know that I do not know, and that is my only wisdom.'], ['Euthyphro', 'Holiness is what the gods love.'], ['Crito', 'The guards are paid; friends in Thessaly will hide you.'], ['The Laws of Athens', 'You stayed here seventy years; by staying, you agreed to obey us.'], ['Meletus', 'Socrates corrupts the young and does not honor the city\'s gods.']];
var TERMS = [['apologia', 'a speech of defense'], ['elenchus', 'testing an idea by questions until it shows a contradiction'], ['daimonion', 'the inner voice that Socrates said warned him off wrong actions'], ['impiety', 'failing to honor the gods, the main charge against Socrates'], ['the gadfly', 'Socrates\' picture of himself, stinging a sleepy city awake'], ['the oracle at Delphi', 'Apollo\'s priestess, who said no one was wiser than Socrates']];
function famVote(R, lv) {
  var N = R.pick([500, 500, 400, 300, 600]), gap = 2 * R.int(5, 40), g = N / 2 + gap / 2, i = N / 2 - gap / 2;
  if (lv === 1) return H.num('A jury of ' + N + ' votes ' + g + ' guilty and ' + i + ' not guilty. By how many votes did "guilty" win?', gap, ['$' + g + ' - ' + i + ' = ' + gap + '$.']);
  return H.num('A jury of ' + N + ' votes ' + g + ' guilty and ' + i + ' not guilty. In Athens a tie meant the accused went free. How many jurors would have had to change their vote to free him?', gap / 2, ['Each switch closes the gap of ' + gap + ' by 2.', '$' + gap + ' \\div 2 = ' + gap / 2 + '$ switches make a tie, ' + N / 2 + ' to ' + N / 2 + ', and a tie acquits.', 'Socrates says the same about his own trial: thirty votes would have freed him.']);
}
var B = {
  facts: [
    ['Socrates wrote several books defending his ideas.', false, 'He wrote nothing; we know him from Plato, Xenophon and Aristophanes.'],
    ['The Apology is a speech in which Socrates defends himself.', true, 'Apologia means a defense.'],
    ['Socrates was charged with impiety and with corrupting the young.', true, 'The charges brought by Meletus, Anytus and Lycon in 399 BC.'],
    ['Crito persuades Socrates to escape from prison.', false, 'Socrates refuses, after imagining the Laws of Athens speaking to him.'],
    ['The oracle at Delphi said no one was wiser than Socrates.', true, 'His friend Chaerephon asked; Socrates set out to test the answer.'],
    ['Socrates first proposed that he deserved free meals at public expense.', true, 'Like an Olympic champion, he said, before offering a fine.'],
    ['Euthyphro gives Socrates a definition of holiness that survives every question.', false, 'Each answer fails, and Euthyphro hurries off.'],
    ['Plato was present at the trial.', true, 'Socrates names him among the friends offering to pay a fine.'],
    ['The jury voted unanimously for guilty.', false, 'It was close: by the usual reckoning about 280 to 220.'],
    ['In the Crito, Socrates says one must never do wrong, even in return for a wrong.', true, 'That is the principle the whole argument rests on.'],
    ['Socrates\' execution was delayed while a sacred ship was away at Delos.', true, 'No executions could take place until it returned.']
  ],
  items: [
    { q: 'What question does Socrates put to Euthyphro?', r: 'Is the holy loved by the gods because it is holy, or holy because the gods love it?', w: ['Should a son ever take his father to court?', 'How many gods are there?', 'Is it better to suffer wrong than to do it?'], why: 'Euthyphro 10a: the Euthyphro question.' },
    { q: 'Why does Socrates say he is wiser than others?', r: 'He knows that he does not know', w: ['He has read more books', 'The oracle gave him secret knowledge', 'He has traveled more widely'], why: 'Apology 21d–23b.' },
    { q: 'What does Socrates compare himself to in the Apology?', r: 'A gadfly stinging a large, sleepy horse', w: ['A lion guarding a gate', 'A ship\'s captain', 'A shepherd of sheep'], why: 'The city needs waking up, he says.' },
    { q: 'In the Crito, who does Socrates imagine speaking to him?', r: 'The Laws of Athens', w: ['The god Apollo', 'His accuser Meletus', 'The ghosts of his ancestors'], why: 'The Laws argue he agreed to obey them by staying.' },
    { q: 'Why will Socrates not escape?', r: 'Escaping would be doing wrong in return for wrong, breaking an agreement with the laws', w: ['He is too old to travel', 'The guards cannot be bribed', 'He wants to become famous'], why: 'Crito 49b–54d.' },
    { q: 'Which phrase comes from the Apology?', r: 'The unexamined life is not worth living', w: ['Know thyself, then rule others', 'Man is the measure of all things', 'All men by nature desire to know'], why: 'Apology 38a. "Man is the measure" is Protagoras; "All men by nature desire to know" opens Aristotle\'s Metaphysics.' },
    { q: 'Why do historians speak of a "Socratic problem"?', r: 'Our sources (Plato, Xenophon, Aristophanes) give different pictures of Socrates', w: ['Socrates\' writings are lost', 'Nobody knows when Socrates lived', 'Socrates wrote in a lost language'], why: 'He wrote nothing himself.' }
  ]
};
H.T(ID, B, [famVote, famVote, function (R, lv) { return famSeq(R, lv, EV); }, function (R, lv) { return famSeq(R, lv, DAYS, 'dialogues'); }, function (R, lv) { return famFirst(R, lv, EV); }, function (R, lv) { return famWho(R, lv, WHO, 'the trial dialogues'); }, function (R, lv) { return famTerm(R, lv, TERMS, 'the trial dialogues'); }].concat(dateFams(ID)), 0.55);
