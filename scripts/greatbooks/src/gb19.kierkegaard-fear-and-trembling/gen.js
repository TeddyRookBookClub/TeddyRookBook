/* Kierkegaard, Fear and Trembling (gbw4). No excerpts (no public-domain English). Families: the stages in order, the figures,
   the three Problemata, who said what (our summaries), dates. Uses H.k19. */
var ID = 'gb19.kierkegaard-fear-and-trembling';
var STAGES = ['the aesthetic life', 'the ethical life', 'infinite resignation', 'faith'];
var FIG = [['the knight of faith', 'gives everything up and trusts he will receive it back'], ['the knight of infinite resignation', 'gives up what he loves and makes peace with the loss'], ['the tragic hero', 'gives up what he loves for a duty everyone can understand'], ['Johannes de silentio', 'the book\'s narrator, who admires faith but says he cannot understand it'], ['Abraham', 'the father in Genesis 22 whose trust the book tries to understand']];
var PROB = [['Problem I', 'Is there a "teleological suspension of the ethical"? (Can a higher purpose set duty aside?)'], ['Problem II', 'Is there an absolute duty to God?'], ['Problem III', 'Was Abraham right to keep silent about his purpose?']];
var WHO = [
  ['I can admire Abraham, but I cannot understand him.', 'Johannes de silentio', 'The pseudonymous narrator of Fear and Trembling (our summary).'],
  ['Faith begins where thinking leaves off.', 'Johannes de silentio', 'Our summary of the narrator\'s view.'],
  ['The ethical is the universal: duties that apply to all and can be explained to all.', 'Johannes de silentio', 'A view the book borrows from Hegel to test it.'],
  ['The world\'s history is the story of reason and freedom coming to know themselves.', 'Hegel', 'The thinker Kierkegaard argued against most.'],
  ['There are three stages on life\'s way: aesthetic, ethical and religious.', 'Kierkegaard', 'Developed across Either/Or and Stages on Life\'s Way.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Fear and Trembling was published in 1843 in Copenhagen.', true, 'On the same day as Repetition, October 16, 1843.'],
    ['Kierkegaard published it under his own name.', false, 'Under the pen name Johannes de silentio, "John of silence."'],
    ['The book is a meditation on the story of Abraham and Isaac in Genesis 22.', true, 'Abraham is asked to give up his son, and the son is spared.'],
    ['The narrator says he fully understands Abraham.', false, 'He says he can admire Abraham but not understand him.'],
    ['Kierkegaard wrote in Danish.', true, 'The first English translations came only in 1939 and 1941.'],
    ['Kierkegaard is often called the father of existentialism.', true, 'A label given by later thinkers.'],
    ['The book argues that faith is easy and that everyone already has it.', false, 'It argues that faith is the hardest thing, and that his age had cheapened it.'],
    ['Kierkegaard was an admirer of Hegel\'s system who wanted to finish it.', false, 'He was one of Hegel\'s sharpest critics.']
  ],
  items: [
    { q: 'Who is the "tragic hero" in the book, for example?', r: 'Agamemnon, who gives up his daughter for his people', w: ['Abraham', 'Hamlet', 'Odysseus'], why: 'The tragic hero stays within the ethical: his reason can be explained.' },
    { q: 'Why does the narrator say Abraham is not a tragic hero?', r: 'Abraham has no reason he can explain to others', w: ['Abraham fails', 'Abraham is a king', 'Abraham is a character in a play'], why: 'That is what makes him, in the book\'s words, a "knight of faith."' },
    { q: 'What does "teleological suspension of the ethical" mean?', r: 'Setting ordinary duty aside for a higher purpose', w: ['Ending a story too soon', 'A law against telescopes', 'Waiting before deciding'], why: 'Telos is Greek for end or purpose.' },
    { q: 'What did Kierkegaard think was wrong with the thinkers of his day?', r: 'They wanted to "go further" than faith without first understanding it', w: ['They read too many novels', 'They did not believe in history', 'They wrote only poetry'], why: 'The Preface and Epilogue.' },
    { q: 'What do critics most often worry about in this book?', r: 'That putting faith above ethics could seem to excuse wrongdoing', w: ['That it is too long', 'That it has no story', 'That it is about economics'], why: 'Defenders answer that the narrator insists no one can use Abraham to excuse anything.' },
    { q: 'Why does this rung have no quotations?', r: 'No English translation existed before 1939, so none is in the public domain', w: ['Kierkegaard asked that it never be quoted', 'The book is lost', 'It was written in Latin'], why: 'We describe it in our own words.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(STAGES, 'the stages, from first to highest, as Kierkegaard\'s writers describe them', 'stage', R, lv); },
  function (R, lv) { return H.k19.pairs(FIG, function (a) { return 'In Fear and Trembling, who or what is <b>' + a + '</b>?'; }, function (b) { return 'Which figure in the book <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(PROB, function (a) { return 'What question does <b>' + a + '</b> of the book ask?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
