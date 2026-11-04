/* Darwin, The Descent of Man (gbw4). Families: homologous bones, kinds of evidence, natural and sexual selection, what later
   science kept and rejected, who said what (our summaries), dates. Uses H.k19. */
var ID = 'gb19.darwin-descent-of-man';
var BONES = [['the upper arm', 'one bone, the humerus'], ['the forearm', 'two bones, the radius and ulna'], ['the wrist', 'a cluster of small bones'], ['the hand or fingers', 'finger bones, long in a bat\'s wing and a whale\'s flipper']];
var EVID = [['the same bone plan in a human arm, a bat\'s wing and a whale\'s flipper', 'homology (shared structure)'], ['human embryos closely resembling those of other mammals early on', 'embryology'], ['small, unused body parts, such as the muscles that move the ears', 'rudimentary organs'], ['fossil apes and, later, fossil humans', 'the fossil record']];
var SEL = [['the peacock\'s tail', 'sexual selection by female choice'], ['the stag\'s antlers', 'sexual selection by rivalry between males'], ['a bird\'s camouflage', 'natural selection'], ['a bird\'s song', 'sexual selection, as Darwin argued']];
var KEPT = [['that humans share common ancestors with the great apes', 'confirmed by fossils and DNA'], ['that humans probably first arose in Africa', 'confirmed by fossils and DNA'], ['that sexual selection shapes many animal traits', 'confirmed and much studied'], ['his ranking of human races by ability', 'rejected by modern science'], ['his claims that women are less able than men', 'rejected by modern science']];
var WHO = [
  ['Man still bears in his bodily frame the indelible stamp of his lowly origin.', 'Darwin', 'The last sentence of the Descent.'],
  ['Of all the differences between man and the lower animals, the moral sense is by far the most important.', 'Darwin', 'Chapter IV.'],
  ['Natural selection cannot explain the human mind; something more is needed.', 'Alfred Russel Wallace', 'Wallace parted from Darwin on this point.'],
  ['I would rather be descended from an ape than from a man who misuses his gifts to hide the truth.', 'T. H. Huxley', 'His reply, as later retold, in the Oxford debate of 1860.'],
  ['All human beings belong to one species.', 'Darwin', 'He argued against those who claimed separate origins for human groups.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['The Descent of Man was published in 1871, in two volumes.', true, 'By John Murray, London.'],
    ['Darwin argued that humans descended from modern chimpanzees.', false, 'He argued humans and apes share ancestors; neither descends from the other.'],
    ['Darwin guessed that humans first arose in Africa.', true, 'Fossils and DNA have since supported this.'],
    ['Most of the book is about sexual selection in animals.', true, 'From insects to birds to mammals.'],
    ['Darwin thought the moral sense could grow out of social instincts.', true, 'Chapter IV.'],
    ['All of Darwin\'s views on human groups and on women have held up.', false, 'His rankings of races and his views on women reflect Victorian prejudice and are rejected by modern science.'],
    ['Darwin opposed slavery.', true, 'He was horrified by it in Brazil during the Beagle voyage.'],
    ['Darwin argued that all humans belong to one species.', true, 'Against those who claimed separate origins.']
  ],
  items: [
    { q: 'What is sexual selection?', r: 'Traits that help an animal win mates spread, even if they do not help it survive', w: ['Choosing a pet', 'Breeding crops', 'Natural selection by weather'], why: 'The peacock\'s tail is the famous example.' },
    { q: 'What does the Descent say about humans and apes?', r: 'They share common ancestors', w: ['Humans came from modern gorillas', 'They are unrelated', 'Apes came from humans'], why: 'A branching tree, not a ladder.' },
    { q: 'Which of these did later science reject?', r: 'Darwin\'s ranking of human races by ability', w: ['Common ancestry of humans and apes', 'An African origin', 'Sexual selection'], why: 'Modern genetics shows human groups differ little and do not form a ladder.' },
    { q: 'Where did Darwin think the moral sense came from?', r: 'From social instincts and sympathy, strengthened by habit, reason and teaching', w: ['From the stars', 'From diet alone', 'It cannot exist'], why: 'Chapters III and IV.' },
    { q: 'Why did Darwin wait until 1871 to write about humans?', r: 'He knew it would be controversial and wanted the evidence ready', w: ['He forgot', 'He was at sea', 'He did not care about humans'], why: 'The Origin had only one sentence about it: "Light will be thrown on the origin of man."' },
    { q: 'What kind of evidence is a small, unused body part?', r: 'A rudimentary organ, a clue to ancestry', w: ['A new organ forming', 'A mistake by doctors', 'Proof against evolution'], why: 'Chapter I.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.pairs(BONES, function (a) { return 'In the forelimbs of humans, bats, whales and birds, what makes up <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.pairs(EVID, function (a) { return 'What kind of evidence for common descent is this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.pairs(SEL, function (a) { return 'Which kind of selection did Darwin think explains <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k19.pairs(KEPT, function (a) { return 'Darwin argued <b>' + a + '</b>. How has later science judged this?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
