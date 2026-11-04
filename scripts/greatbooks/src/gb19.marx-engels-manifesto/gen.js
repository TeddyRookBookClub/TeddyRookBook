/* Marx and Engels, The Communist Manifesto (gbw4). Families: the sections in order, the epochs in the Manifesto's story, key terms,
   claims and how history judged them, who said what (our summaries), dates. Uses H.k19. Fair to the authors and to their critics. */
var ID = 'gb19.marx-engels-manifesto';
var SECT = ['the opening ("A specter is haunting Europe")', 'I. Bourgeois and Proletarians', 'II. Proletarians and Communists', 'III. Socialist and Communist Literature', 'IV. The Communists and the other opposition parties'];
var EPO = ['ancient society (free and slave)', 'feudal society (lord and serf)', 'bourgeois society (owner and wage worker)', 'the classless society the authors predicted'];
var TERMS = [['bourgeoisie', 'the class of modern capitalists, owners of the means of production'], ['proletariat', 'the class of wage workers who own no means of production'], ['class struggle', 'the conflict between classes that the authors saw as the engine of history'], ['means of production', 'land, factories, machines and materials used to make goods'], ['communism', 'in the Manifesto, a society without private property in the means of production, and in time without classes']];
var JUDGE = [['Workers in industrial countries would grow ever poorer.', 'Over the next century, wages and living standards there rose greatly.'], ['Revolution would come first in the most industrial countries.', 'Revolutions in Marx\'s name came in largely farming countries, such as Russia and China.'], ['Society would split into two great hostile classes.', 'Middle classes of professionals, managers and small owners grew.'], ['Abolishing private property would free people.', 'States that tried it set up one-party rule; their record includes famines, labor camps and the loss of basic freedoms.']];
var WHO = [
  ['The history of all hitherto existing society is the history of class struggles.', 'Marx and Engels', 'Section I.'],
  ['Workingmen of all countries, unite!', 'Marx and Engels', 'The last line.'],
  ['By pursuing his own interest, a person often promotes that of society, led as by an invisible hand.', 'Adam Smith', 'The Wealth of Nations; the economist Marx argued against most.'],
  ['History is the progress of the consciousness of freedom.', 'Hegel', 'Marx kept Hegel\'s idea of stages but put economics at the center.'],
  ['When the state owns all the means of production, it gains power over every part of a person\'s life.', 'Friedrich Hayek', 'The Road to Serfdom (1944), one of the best-known critiques.']
];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['The Manifesto was published in London in February 1848.', true, 'In German, for the Communist League.'],
    ['The Manifesto was written by Karl Marx and Friedrich Engels.', true, 'Marx did most of the final writing, from drafts by both.'],
    ['The Manifesto caused the revolutions of 1848.', false, 'The revolutions broke out almost at once, but historians agree the pamphlet had little to do with them.'],
    ['Samuel Moore\'s English translation was published in 1888, edited by Engels.', true, 'The standard English version.'],
    ['The Manifesto praises the achievements of the bourgeoisie before predicting its fall.', true, 'Section I.'],
    ['In industrial countries, workers\' living standards fell steadily after 1848, as predicted.', false, 'They rose greatly over the following century.'],
    ['Engels\'s family owned a cotton business in Manchester.', true, 'He worked there for many years and helped support Marx.'],
    ['Section II lists ten measures, including a progressive income tax and free education in public schools.', true, 'Some, like free public schooling, were later adopted in democracies through other movements.']
  ],
  items: [
    { q: 'How does the Manifesto begin?', r: 'A specter is haunting Europe: the specter of Communism', w: ['Call me Ishmael', 'In the beginning', 'It was a dark and stormy night'], why: 'The opening line, in Moore\'s 1888 translation.' },
    { q: 'What do Marx and Engels call the engine of history?', r: 'Class struggle', w: ['Great men', 'The weather', 'Religion alone'], why: 'Section I.' },
    { q: 'Which is a main criticism economists make of the Manifesto\'s predictions?', r: 'Workers\' wages and living standards rose instead of falling', w: ['It is too short', 'It praised kings', 'It had no predictions'], why: 'A central failed prediction.' },
    { q: 'Where did the first lasting revolution in Marx\'s name take place?', r: 'Russia, in 1917', w: ['Britain, in 1848', 'The United States, in 1865', 'France, in 1789'], why: 'Marx had expected revolution in industrial Britain or Germany.' },
    { q: 'Why do historians still read the Manifesto?', r: 'For its influence and its attention to economic life and social class', w: ['Because its predictions all came true', 'For its love poetry', 'Because it is a science textbook'], why: 'Many who reject its conclusions use its questions.' },
    { q: 'What happened to the Soviet Union, the largest state founded on Marx\'s ideas?', r: 'It broke up in 1991', w: ['It still rules Europe', 'It became a kingdom in 1900', 'It never existed'], why: 'After decades of one-party rule and economic decline.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(SECT, 'the parts of the Manifesto', 'part', R, lv); },
  function (R, lv) { return H.k19.seq(EPO, 'the Manifesto\'s story of history', 'stage', R, lv); },
  function (R, lv) { return H.k19.pairs(TERMS, function (a) { return 'In the Manifesto, what is the <b>' + a + '</b>?'; }, function (b) { return 'Which term means: <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.pairs(JUDGE, function (a) { return 'The Manifesto predicted: <b>' + a + '</b> What actually happened?'; }, null, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
