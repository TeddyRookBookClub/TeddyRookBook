/* Dewey, Experience and Education (gbx1). No excerpts (1938). Families: continuity or interaction, educative or
   mis-educative (our examples), traditional or progressive (as Dewey describes them), terms, who said what, dates. Uses H.k20. */
var ID = 'gb20.dewey-experience-and-education';
var PRIN = [['each experience takes from earlier ones and changes later ones', 'continuity'], ['an experience is a meeting of the learner and the situation', 'interaction'], ['a good lesson opens the way to further growth', 'continuity'], ['the teacher fits materials to what students bring', 'interaction'], ['a bad experience can make later learning harder', 'continuity'], ['the same lesson can work for one child and fail for another', 'interaction']];
var EDU = [['a cooking project that leads on to measuring and fractions', 'educative: it opens the way to further growth'], ['memorizing a list for a test and then forgetting it', 'mis-educative: it leads nowhere and may teach a dislike of the subject'], ['an exciting game that teaches a habit of cheating', 'mis-educative: lively, but it builds a bad habit'], ['a science club whose questions grow week by week', 'educative: it opens the way to further growth'], ['busy activity with no aim that goes nowhere', 'mis-educative: activity is not enough without direction']];
var CAMP = [['knowledge handed down from above in textbooks', 'traditional education'], ['beginning from the child\'s interests and activity', 'progressive education'], ['silent rows of desks and drills', 'traditional education'], ['rejecting the old ways without a plan of its own', 'progressive education, at its weakest'], ['order kept by rules imposed from outside', 'traditional education']];
var TERMS = [['collateral learning', 'attitudes picked up alongside a lesson, which can last longer than the facts'], ['freedom of intelligence', 'the power to form purposes and judge how to reach them'], ['growth', 'Dewey\'s test of good education: does it lead to further growth?'], ['social control', 'order that comes from the group\'s shared activity, as in a game'], ['the Laboratory School', 'Dewey\'s school at the University of Chicago, opened in 1896']];
var WHO = [
  ['Education should grow out of experience, but not every experience educates.', 'John Dewey', 'Experience and Education (our summary).'],
  ['Children need a large shared core of knowledge to read and think well.', 'E. D. Hirsch', 'A later critic of progressive methods.'],
  ['The meaning of an idea is the practical difference it makes.', 'William James', 'Pragmatism, 1907.'],
  ['A child should learn from things and nature before books.', 'Jean-Jacques Rousseau', 'Emile, 1762 (our summary).'],
  ['The mind at birth is like white paper, written on by experience.', 'John Locke', 'An Essay Concerning Human Understanding (our summary).']
];
var B = {
  facts: [
    ['Experience and Education was published in 1938.', true, 'From a lecture series for Kappa Delta Pi.'],
    ['In this book Dewey criticizes both traditional and progressive schools.', true, 'Rejecting the old is not enough, he says.'],
    ['Dewey thought every experience is equally educational.', false, 'Some are mis-educative.'],
    ['Dewey thought the teacher should step back and do nothing.', false, 'The teacher must plan, select and guide.'],
    ['Dewey opened a Laboratory School at the University of Chicago.', true, 'In 1896.'],
    ['Dewey compared good classroom order to the rules of a game.', true, 'The rules are part of the activity.']
  ],
  items: [
    { q: 'What are Dewey\'s two principles of experience?', r: 'Continuity and interaction', w: ['Speed and size', 'Reward and punishment', 'Reading and writing'], why: 'The heart of the book.' },
    { q: 'What does Dewey call an experience that blocks later growth?', r: 'Mis-educative', w: ['Progressive', 'Collateral', 'Continuous'], why: 'For example, one that leaves a student bored or careless.' },
    { q: 'What kind of freedom matters most, for Dewey?', r: 'Freedom of intelligence: forming and judging purposes', w: ['Freedom to leave school', 'Freedom from all rules', 'Freedom to talk in class'], why: 'Not mere freedom of movement.' },
    { q: 'Why does the book have no excerpts on this page?', r: 'It was published in 1938 and is under copyright', w: ['It was never printed', 'It was in Latin', 'It was too long'], why: 'Library editions are easy to find.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(PRIN, function (a) { return 'Which of Dewey\'s principles is this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(EDU, function (a) { return 'Using Dewey\'s test, how would you judge <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(CAMP, function (a) { return 'As Dewey describes the two camps, which goes with <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
