/* Tocqueville, Democracy in America (gbw4). Families: the journey in order, his key ideas, what he praised and feared,
   who said what (our summaries), dates. Uses H.k19. */
var ID = 'gb19.tocqueville-democracy-in-america';
var TRIP = ['Newport', 'New York', 'Albany', 'Detroit', 'Boston', 'Philadelphia', 'Cincinnati', 'Memphis', 'New Orleans', 'Washington'];
var IDEAS = [['equality of conditions', 'the "primary fact" of American society, shaping its laws and habits'], ['tyranny of the majority', 'the danger that the many crush dissent, by law or by opinion'], ['associations', 'Americans\' habit of joining together to get things done themselves'], ['individualism', 'a quiet withdrawal into family and friends, leaving public life to others'], ['soft despotism', 'a gentle, all-providing power that keeps people in childhood'], ['township', 'the small local government where Americans learn self-rule']];
var PF = [['the habit of forming associations', 'a strength'], ['local self-government in townships', 'a strength'], ['a free press and juries', 'a strength'], ['the tyranny of the majority over opinion', 'a danger'], ['individualism, retreating from public life', 'a danger'], ['slavery', 'a danger'], ['a soft, all-providing central power', 'a danger']];
var WHO = [
  ['Nothing struck me more than the general equality of conditions.', 'Tocqueville', 'Introduction to Volume 1.'],
  ['Americans of every age and condition constantly form associations.', 'Tocqueville', 'Volume 2.'],
  ['The only purpose for which power may rightly be used over anyone is to prevent harm to others.', 'Mill', 'On Liberty; Mill admired and reviewed Tocqueville.'],
  ['A republic is better kept large, with factions checking each other.', 'Madison', 'The Federalist No. 10, which Tocqueville read closely.'],
  ['I know no country with so little true independence of mind as America.', 'Tocqueville', 'On the tyranny of the majority, Volume 1.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Tocqueville came to America in 1831 to study prisons.', true, 'With his friend Gustave de Beaumont; they published a report on prisons in 1833.'],
    ['Tocqueville spent about five years traveling in America.', false, 'About nine months, May 1831 to February 1832.'],
    ['Volume 1 appeared in 1835 and Volume 2 in 1840.', true, 'Henry Reeve translated both into English.'],
    ['Tocqueville thought equality was the great fact of the modern world, coming to Europe too.', true, 'He wrote to help France prepare for it.'],
    ['Tocqueville saw no dangers in democracy.', false, 'He warned of the tyranny of the majority and of soft despotism.'],
    ['Tocqueville judged slavery a great evil that harmed the society that kept it.', true, 'He also foresaw grave conflict over it.'],
    ['Tocqueville praised Americans\' habit of forming voluntary associations.', true, 'Volume 2, Part II.'],
    ['Tocqueville was a citizen of the United States.', false, 'He was a French aristocrat, later a member of the French parliament and foreign minister in 1849.']
  ],
  items: [
    { q: 'What "primary fact" did Tocqueville find in America?', r: 'The general equality of conditions', w: ['Great wealth', 'A powerful king', 'A single national church'], why: 'The opening of his Introduction.' },
    { q: 'What did Tocqueville mean by the "tyranny of the majority"?', r: 'The power of the many to crush minority views, through law or public opinion', w: ['A king chosen by votes', 'Too many elections', 'The rule of the rich'], why: 'Volume 1, Chapter XV in Reeve\'s translation.' },
    { q: 'What American habit did Tocqueville think helps protect freedom?', r: 'Forming associations to do things together', w: ['Living alone in the woods', 'Obeying a strong ruler', 'Avoiding newspapers'], why: 'Volume 2.' },
    { q: 'Where did Tocqueville think Americans learn self-government?', r: 'In their townships and local institutions', w: ['In the army', 'In Paris', 'At royal court'], why: 'He studied New England town meetings.' },
    { q: 'What is "soft despotism" in Tocqueville?', r: 'A gentle power that provides everything and keeps citizens dependent', w: ['A king who is kind', 'Weak laws', 'A soft drink tax'], why: 'Volume 2, Part IV.' },
    { q: 'What did Tocqueville witness at Memphis in December 1831?', r: 'Choctaw families forced from their lands crossing the Mississippi', w: ['A presidential election', 'The opening of a canal', 'A gold rush'], why: 'He wrote of it with deep sorrow.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(TRIP, 'Tocqueville\'s journey, 1831 to 1832', 'stop', R, lv); },
  function (R, lv) { return H.k19.pairs(IDEAS, function (a) { return 'What does Tocqueville mean by <b>' + a + '</b>?'; }, function (b) { return 'Which of Tocqueville\'s ideas is this: <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(PF, function (a) { return 'Did Tocqueville see <b>' + a + '</b> as a strength of American democracy, or a danger?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
