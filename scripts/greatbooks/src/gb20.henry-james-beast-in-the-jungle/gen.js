/* Henry James, The Beast in the Jungle (gbx3). Families: the story in order, key images, who said what, the James family, dates. Uses H.k20. */
var ID = 'gb20.henry-james-beast-in-the-jungle';
var STORY = ['Marcher tells May his secret in Italy', 'they meet again at Weatherend', 'years of waiting together', 'May falls ill', 'May tells him it has already happened', 'May dies', 'Marcher sees a mourner\'s face at her grave'];
var TERMS = [['the beast in the jungle', 'Marcher\'s image for the fate he waits for'], ['Weatherend', 'the country house where Marcher and May meet again'], ['the point of view', 'everything is seen through Marcher\'s mind'], ['The Better Sort', 'the 1903 collection that first printed the story'], ['the stranger at the cemetery', 'a mourner whose grief shows Marcher what he missed']];
var SAID = [
  ['Something rare and strange is waiting to happen to me.', 'John Marcher', 'Our summary of his secret.'],
  ['I will watch with you.', 'May Bartram', 'Our summary of her promise.'],
  ['It has come; you have not missed it, and yet you have not noticed it.', 'May Bartram', 'Our summary of what she tells him when she is ill.'],
  ['He had been the man to whom nothing on earth was to have happened.', 'the narrator, telling Marcher\'s thought', 'From the last chapter.'],
  ['Our consciousness flows like a stream.', 'William James', 'Henry\'s brother, the psychologist (our summary).']
];
var B = {
  facts: [
    ['Henry James was born in New York.', true, 'In 1843.'],
    ['Henry James was the brother of the philosopher William James.', true, 'William wrote The Principles of Psychology.'],
    ['The story is set in a real jungle.', false, 'The jungle and the beast are only Marcher\'s image.'],
    ['Marcher and May marry halfway through the story.', false, 'He never asks her, thinking it would be selfish.'],
    ['The story first appeared in The Better Sort, 1903.', true, 'A collection of James\'s tales.'],
    ['Henry James became a British subject in 1915.', true, 'A year before his death.'],
    ['At the end, Marcher realizes his fate was never to have loved.', true, 'At May\'s grave.'],
    ['The story is told through May Bartram\'s thoughts.', false, 'Through Marcher\'s.']
  ],
  items: [
    { q: 'What does Marcher believe about his life?', r: 'That something rare and strange is waiting to happen to him', w: ['That he will become king', 'That he will travel to the jungle', 'That he will be rich'], why: 'He calls it the beast in the jungle.' },
    { q: 'Why doesn\'t Marcher ask May to marry him?', r: 'He thinks it would be wrong to make her share his strange fate', w: ['She is already married', 'He lives abroad', 'Her family forbids it'], why: 'His waiting gets in the way of living.' },
    { q: 'What finally shows Marcher the truth?', r: 'A grieving stranger\'s face at May\'s grave', w: ['A letter from May', 'A dream', 'A newspaper story'], why: 'He sees what real love and loss look like.' },
    { q: 'What is the "beast," in the end?', r: 'The empty life of a man who never loved', w: ['A tiger', 'A sickness', 'A lost fortune'], why: 'His fate was that nothing happened to him.' },
    { q: 'Why does the reader understand May before Marcher does?', r: 'We can guess her feelings from what he reports without seeing them', w: ['She narrates the story', 'She writes him letters we read', 'The narrator tells us at the start'], why: 'The gap between what he sees and what we guess.' },
    { q: 'Where did Henry James spend most of his adult life?', r: 'England', w: ['Italy', 'Russia', 'Ireland'], why: 'He settled there in 1876.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.seq(STORY, 'The Beast in the Jungle', 'event', R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'In The Beast in the Jungle, what is <b>' + a + '</b>?'; }, function (b) { return 'What is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.who(SAID, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
