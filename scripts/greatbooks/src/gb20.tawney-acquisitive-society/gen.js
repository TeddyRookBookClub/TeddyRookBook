/* Tawney, The Acquisitive Society (gbx1). Families: active or passive property in Tawney's terms, Tawney or his critics
   (who argues this), terms, chapters, dates. Presents Tawney and the replies evenhandedly. Uses H.k20. */
var ID = 'gb20.tawney-acquisitive-society';
var PROP = [['a craftsman\'s own tools', 'active property, bound up with work'], ['royalties on coal the owner neither found nor mined', 'passive property, divorced from work'], ['a family\'s home', 'active property, bound up with use'], ['a farmer\'s land that she works herself', 'active property, bound up with work'], ['rent from land the owner never uses or improves', 'passive property, divorced from work']];
var VIEW = [['rights should be tied to the service a person performs', 'Tawney'], ['no authority can know which activities serve society best; prices tell us', 'Tawney\'s free-market critics'], ['industry should be run like a profession with standards of service', 'Tawney'], ['income from capital rewards saving and risk, which are services too', 'Tawney\'s free-market critics'], ['ownership divorced from work corrupts industry', 'Tawney'], ['widely held private property protects freedom against the state', 'Tawney\'s free-market critics'], ['who decides what counts as a "function"?', 'Tawney\'s free-market critics']];
var TERMS = [['a function', 'an activity that serves a social purpose'], ['an acquisitive society', 'one where getting wealth becomes the main aim and rights stand apart from service'], ['a functional society', 'one where rights are tied to the functions people perform'], ['passive property', 'property that pays its owner without any work or service'], ['the Workers\' Educational Association', 'the adult-education movement where Tawney taught']];
var CH = ['Introductory', 'Rights and Functions', 'The Acquisitive Society', 'The Nemesis of Industrialism', 'Property and Creative Work', 'The Functional Society'];
var WHO = [
  ['An economy should serve purposes beyond getting; rights should follow function.', 'R. H. Tawney', 'The Acquisitive Society (our summary).'],
  ['Prices and profits are how a society learns what people value most.', 'Friedrich Hayek', 'A leading free-market critic of planning.'],
  ['People seeking their own gain in markets are led, as if by an invisible hand, to serve others.', 'Adam Smith', 'The Wealth of Nations (our summary).'],
  ['Property comes from mixing one\'s labor with the land.', 'John Locke', 'Second Treatise (our summary).'],
  ['Money-making for its own sake is unnatural; household management serves life.', 'Aristotle', 'Politics, Book I (our summary).'],
  ['Much spending is meant to show off wealth.', 'Thorstein Veblen', 'The Theory of the Leisure Class.']
];
var B = {
  facts: [
    ['The Acquisitive Society was published in 1920.', true, 'After the First World War.'],
    ['Tawney was wounded at the Battle of the Somme.', true, 'In 1916.'],
    ['Tawney wanted to abolish all private property.', false, 'He defended property tied to work and use.'],
    ['Tawney admired medicine as a model of a profession with standards of service.', true, 'He wanted industry run more like a profession.'],
    ['Free-market critics argued that prices, not officials, show what society values.', true, 'Hayek and Mises made this case.'],
    ['Tawney later wrote Religion and the Rise of Capitalism.', true, 'In 1926.']
  ],
  items: [
    { q: 'What does Tawney mean by an "acquisitive society"?', r: 'One where getting wealth is the main aim and rights are cut off from service', w: ['A society that collects stamps', 'A society with no money', 'A society of farmers'], why: 'Chapter III.' },
    { q: 'What kind of property did Tawney criticize?', r: 'Property that pays its owner without any work or service', w: ['A family\'s home', 'A craftsman\'s tools', 'All property of every kind'], why: 'Ownership "divorced from work."' },
    { q: 'What is a main reply of Tawney\'s critics?', r: 'Saving, risk and investment are useful services, and markets reveal what people value', w: ['Tawney was too fond of markets', 'Property does not exist', 'Work is not useful'], why: 'The free-market reply.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(PROP, function (a) { return 'In Tawney\'s terms, what kind of property is <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(VIEW, function (a) { return 'Who argues this: <b>' + a + '</b>?'; }, null, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'What is <b>' + a + '</b>?'; }, function (b) { return 'Which term means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.seq(CH, 'the chapters of The Acquisitive Society', 'chapter', R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
