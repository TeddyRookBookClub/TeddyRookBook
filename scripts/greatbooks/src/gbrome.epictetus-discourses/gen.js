/* gbrome.epictetus-discourses (gbe3): up to us or not, Stoic terms, argument structure, his life in order, dates. */
function seqF(evs, what) { return function (R, lv) {
  var k = Math.min(evs.length, lv === 1 ? 3 : 4), idx = R.sample(evs.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
  var ord = idx.map(function (i) { return evs[i]; }), right = ord.join(' → '), w = [];
  for (var t = 0; t < 20 && w.length < 3; t++) { var s = R.shuffle(ord.slice()).join(' → '); if (s !== right && w.indexOf(s) < 0) w.push(s); }
  return H.mc('Put these ' + what + ' in order, <b>first to last</b>.', right, w, ord.map(function (e, j) { return (j + 1) + '. ' + e; }), { hint: 'Find the one that must come first, then work forward.' });
}; }
function termF(T, ctx) { return function (R, lv) {
  var t = R.pick(T), others = T.filter(function (x) { return x !== t; }), k = lv === 1 ? 2 : 3;
  if (R.next() < 0.5) return H.mc('In ' + ctx + ', what does <b>' + t[0] + '</b> mean?', t[1], H.samp(R, others, k).map(function (x) { return x[1]; }), [t[0] + ': ' + t[1] + '.']);
  return H.mc('In ' + ctx + ', which word or name means <i>' + t[1] + '</i>?', t[0], H.samp(R, others, k).map(function (x) { return x[0]; }), [t[0] + ': ' + t[1] + '.']);
}; }
function whoF(P, pre) { return function (R, lv) {
  var p = R.pick(P), names = H.uniq(P.map(function (x) { return x[0]; }).filter(function (x) { return x !== p[0]; }));
  return H.mc(pre + ' ' + p[1] + '?', p[0], H.samp(R, names, lv === 1 ? 2 : 3), [p[0] + ' ' + (p[2] || p[1]) + '.']);
}; }
function bookF(B, work, unit) { unit = unit || 'book'; return function (R, lv) {
  var b = R.pick(B), all = H.uniq(B.map(function (x) { return x[0]; }));
  if (lv === 1) return H.mc('In which ' + unit + ' of ' + work + ' ' + b[1] + '?', unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0], H.samp(R, all.filter(function (x) { return x !== b[0]; }), 2).map(function (x) { return unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + x; }), [unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0] + ': ' + (b[2] || b[1]) + '.']);
  return H.num('In which ' + unit + ' of ' + work + ' ' + b[1] + '? Give the number.', b[0], [unit.charAt(0).toUpperCase() + unit.slice(1) + ' ' + b[0] + ': ' + (b[2] || b[1]) + '.']);
}; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbrome.epictetus-discourses';
var UP = ['my opinion about what happened', 'what I choose to do next', 'whether I tell the truth', 'what I desire', 'what I try to avoid', 'how I treat a rude neighbor', 'whether I keep my promise', 'how hard I practice', 'whether I apologize', 'what I say when I am teased'];
var NOT = ['whether it rains tomorrow', 'what other people think of me', 'whether I catch the flu', 'how much money I inherit', 'whether I am elected class president', 'whether my friend keeps her promise', 'whether the train is late', 'how tall I grow', 'whether a stranger is polite', 'whether my team wins'];
function famUp(R, lv) {
  var up = R.next() < 0.5, x = R.pick(up ? UP : NOT);
  if (lv === 1) return H.mc('By Epictetus’s rule, is this up to us? <b>' + x.charAt(0).toUpperCase() + x.slice(1) + '</b>', up ? 'Up to us' : 'Not up to us', [up ? 'Not up to us' : 'Up to us'], [up ? 'It is our own act: opinion, desire, aversion or choice.' : 'It depends on things outside our own acts: body, property, reputation, offices, other people, the world.'], { keep: true });
  var odd = R.pick(up ? NOT : UP), three = H.samp(R, up ? UP : NOT, 3);
  return H.mc('Three of these are ' + (up ? '' : '<b>not</b> ') + 'up to us, in Epictetus’s sense. Which one is the odd one out?', odd, three, ['Up to us: our own acts (opinion, desire, aversion, choice). Not up to us: body, property, reputation, offices, and whatever others do.', odd.charAt(0).toUpperCase() + odd.slice(1) + ' is ' + (up ? 'up to us' : 'not up to us') + '.']);
}
var ARGS = [
  ['Only what is up to us can be truly good or bad for us.', 'Other people’s opinions are not up to us.', 'So other people’s opinions are not truly good or bad for us.'],
  ['Whatever is our own act is up to us.', 'Our judgments are our own acts.', 'So our judgments are up to us.'],
  ['We are disturbed by our opinions about things, not by the things.', 'Opinions can be examined and changed.', 'So what disturbs us can be examined and changed.'],
  ['No one can force my will.', 'Whatever no one can force is free.', 'So my will is free.']
];
function famArg(R, lv) {
  var a = R.pick(ARGS), k = R.int(0, lv === 1 ? 0 : 2), others = ARGS.filter(function (x) { return x !== a; });
  if (k === 0) return H.mc('Here is a Stoic argument: “' + a[0] + ' ' + a[1] + ' ' + a[2] + '” Which sentence is the <b>conclusion</b>?', a[2], [a[0], a[1]], ['The conclusion is the claim the other two support; it begins with “So.”']);
  if (k === 1) return H.mc('Fill in the missing premise. Premise: “' + a[0] + '” Missing premise: ? Conclusion: “' + a[2] + '”', a[1], H.samp(R, others, 2).map(function (x) { return x[1]; }).concat([a[2]]).slice(0, 3), ['“' + a[1] + '” links the first premise to the conclusion.']);
  return H.mc('“' + a[0] + ' ' + a[1] + ' ' + a[2] + '” If both premises were true, would the conclusion have to be true?', 'Yes: the argument is valid', ['No: the conclusion could still be false', 'Only if Epictetus said so'], ['The conclusion follows from the premises. Whether the premises are true is a separate question.'], { keep: true });
}
var EV = ['Epictetus is born at Hierapolis (about AD 50)', 'He studies with Musonius Rufus in Rome', 'Domitian banishes the philosophers from Rome (about AD 93)', 'Epictetus teaches at Nicopolis; Arrian takes notes', 'Marcus Aurelius reads the notes of Epictetus’s lectures'];
var TERMS = [['eph’ hēmin', '“up to us,” what lies in our power'], ['prohairesis', 'our power of choice, the will'], ['Encheiridion', 'the Handbook, Arrian’s short summary of Epictetus'], ['Discourses', 'Arrian’s notes of Epictetus’s talks, four books surviving'], ['Stoicism', 'the school founded by Zeno in Athens, named for a painted porch'], ['aversion', 'turning away from a thing, one of the acts that are up to us'], ['Nicopolis', 'the city in western Greece where Epictetus taught'], ['Arrian', 'the student who wrote down Epictetus’s talks']];
var WHO = [['Epictetus', 'was born a slave and taught at Nicopolis', 'was a freed slave who became a famous teacher'], ['Arrian', 'wrote down Epictetus’s talks', 'was his student, later a governor and historian'], ['Musonius Rufus', 'was the Stoic teacher Epictetus studied with in Rome', 'taught him Stoicism'], ['Epaphroditus', 'was Epictetus’s master, a freedman of Nero', 'owned him in Rome'], ['Zeno of Citium', 'founded the Stoic school in Athens', 'taught in the painted porch'], ['Marcus Aurelius', 'was the emperor who read the notes of Epictetus’s lectures', 'is the next rung']];
var B = {
  facts: [
    ['Epictetus was born a slave.', true, 'In the household of Epaphroditus at Rome.'],
    ['Epictetus wrote the Discourses himself.', false, 'His student Arrian wrote them down.'],
    ['Epictetus counts our opinions among the things up to us.', true, 'Handbook, chapter 1.'],
    ['Epictetus counts our reputation among the things up to us.', false, 'Reputation is in other people’s minds.'],
    ['Epictetus taught that people are disturbed by their opinions about things.', true, 'Handbook, chapter 5.'],
    ['Stoics, as Epictetus teaches, try to feel nothing at all.', false, 'They aim to remove disturbing passions that come from false judgments, not all feeling.'],
    ['Epictetus taught at Nicopolis after Domitian banished philosophers from Rome.', true, 'Around AD 93.'],
    ['The Handbook was a short summary of Epictetus’s teaching.', true, 'Made by Arrian; Encheiridion means something kept “in hand.”'],
    ['Epictetus said the body is fully up to us.', false, 'He lists the body among things not in our power.'],
    ['Marcus Aurelius read Epictetus.', true, 'He thanks Rusticus for lending him the notes.'],
    ['Epictetus thought only rich, free men could be truly free.', false, 'He taught that freedom is in the will, open to a slave or an emperor.']
  ],
  items: [
    { q: 'What, for Epictetus, are “our own acts”?', r: 'Opinion, desire, aversion and choice', w: ['Money, fame and power', 'Health and good looks', 'The weather and the seasons'], why: 'Handbook, chapter 1.' },
    { q: 'Why does Epictetus say death is not terrible?', r: 'If it were, Socrates would have thought so; the terrible thing is our opinion of it', w: ['Because no one ever dies', 'Because the gods forbid fear', 'Because the body is up to us'], why: 'Handbook, chapter 5.' },
    { q: 'What does Epictetus advise when we are disturbed?', r: 'Blame not others but our own opinions, and examine them', w: ['Blame the gods', 'Blame other people', 'Ignore it and hope it passes'], why: 'Handbook, chapter 5.' },
    { q: 'What happens, says Epictetus, if we treat things not up to us as our own?', r: 'We will be hindered, lament, be disturbed and blame gods and men', w: ['We will become rich', 'We will be completely free', 'Nothing at all'], why: 'Handbook, chapter 1.' },
    { q: 'Which modern idea grew partly from Epictetus’s saying about opinions?', r: 'Cognitive therapy: how we interpret events shapes how we feel', w: ['The theory of evolution', 'The germ theory of disease', 'The law of gravity'], why: 'Albert Ellis and Aaron Beck named him as a source.' },
    { q: 'In Discourses I.1, what does Epictetus say no one can stop?', r: 'His going into exile with smiles and contentment', w: ['His going into exile at all', 'The tyrant’s orders', 'The weather'], why: 'The exile is not up to him; how he meets it is.' }
  ]
};
H.T(ID, B, [famUp, famUp, famArg, famArg, termF(TERMS, 'Epictetus'), whoF(WHO, 'Who'), seqF(EV, 'events')].concat(dateFams(ID).slice(0, 2)), 0.6);
