/* Melville, Moby-Dick (gbw4). Families: the gams in order, the crew, who said what, the voyage, dates. Uses H.k19. */
var ID = 'gb19.melville-moby-dick';
var GAMS = ['the Goney', 'the Town-Ho', 'the Jeroboam', 'the Jungfrau', 'the Rose-Bud', 'the Samuel Enderby', 'the Bachelor', 'the Rachel', 'the Delight'];
var CREW = [['Ishmael', 'the narrator, a young schoolteacher turned sailor'], ['Queequeg', 'a harpooner from a South Sea island, Ishmael\'s close friend'], ['Captain Ahab', 'the captain, set on revenge against the white whale'], ['Starbuck', 'the careful first mate, from Nantucket'], ['Stubb', 'the easygoing second mate, always with his pipe'], ['Flask', 'the short, fearless third mate'], ['Pip', 'the young cabin boy who is lost at sea and comes back changed'], ['Father Mapple', 'the preacher who gives a sermon on Jonah in New Bedford']];
var WHO = [
  ['Call me Ishmael.', 'Ishmael', 'The first words of the novel.'],
  ['I will have no man in my boat who is not afraid of a whale.', 'Starbuck', 'Chapter 26.'],
  ['Ahab is for ever Ahab, man.', 'Captain Ahab', 'Chapter 134, on the second day of the chase.'],
  ['To write a mighty book, you must choose a mighty theme.', 'Ishmael', 'Our summary of Chapter 104.'],
  ['Turn back, sir: the whale wants none of us, and we have homes and families.', 'Starbuck', 'Our summary of his pleas to Ahab.']
];
var STEP = ['Ishmael meets Queequeg in New Bedford', 'Father Mapple preaches on Jonah', 'The Pequod sails from Nantucket on Christmas Day', 'Ahab nails a gold coin to the mast', 'The Grand Armada of whales near Java', 'A typhoon off Japan', 'The three-day chase of Moby Dick', 'The Rachel rescues Ishmael'];
function D(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var B = {
  facts: [
    ['Moby-Dick was published in 1851, first in London as The Whale and then in New York.', true, 'The London edition left out the epilogue.'],
    ['Melville had worked on whaling ships himself.', true, 'He sailed on the Acushnet from 1841.'],
    ['The book was a great success in Melville\'s lifetime.', false, 'It sold poorly; it was rediscovered in the 1920s.'],
    ['Moby Dick is a white sperm whale.', true, 'The "white whale" that took Ahab\'s leg.'],
    ['Ahab lost his arm to Moby Dick.', false, 'His leg; Captain Boomer of the Samuel Enderby lost an arm.'],
    ['Only Ishmael survives the sinking of the Pequod.', true, 'He floats on Queequeg\'s coffin, made into a life-buoy.'],
    ['Many chapters describe whales and whaling in detail, like an encyclopedia.', true, 'For example "Cetology."'],
    ['Melville dedicated Moby-Dick to Nathaniel Hawthorne.', true, '"In token of my admiration for his genius."']
  ],
  items: [
    { q: 'Why is Ahab hunting Moby Dick?', r: 'For revenge: the whale took his leg on an earlier voyage', w: ['For the whale\'s gold', 'To protect the crew', 'To win a race'], why: 'Ahab turns a whaling voyage into a private hunt.' },
    { q: 'How does Ishmael survive at the end?', r: 'He floats on Queequeg\'s coffin until the Rachel picks him up', w: ['He swims to Japan', 'He hides in the whale', 'He never left Nantucket'], why: 'The Epilogue.' },
    { q: 'What does Starbuck stand for in the novel?', r: 'Courage with good sense, and duty to the crew and their families', w: ['Reckless daring', 'Greed for gold', 'Laziness'], why: '"I will have no man in my boat who is not afraid of a whale."' },
    { q: 'What is a "gam"?', r: 'A friendly meeting of two whaling ships at sea', w: ['A kind of harpoon', 'A sailor\'s song', 'A whale\'s tail'], why: 'Chapter 53, "The Gam."' },
    { q: 'What is the chapter "Cetology" about?', r: 'Classifying the kinds of whales', w: ['How to cook fish', 'Ahab\'s childhood', 'A storm'], why: 'One of the book\'s many "encyclopedia" chapters.' },
    { q: 'What happens to the Rachel\'s captain\'s son?', r: 'He is lost at sea; the ship is searching for him', w: ['He becomes Ahab\'s mate', 'He finds Moby Dick', 'He is rescued by the Pequod'], why: 'Ahab refuses to help search.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k19.seq(GAMS, 'the Pequod\'s meetings with other ships', 'ship', R, lv); },
  function (R, lv) { return H.k19.seq(STEP, 'the story of Moby-Dick', 'event', R, lv); },
  function (R, lv) { return H.k19.pairs(CREW, function (a) { return 'Who is <b>' + a + '</b> in Moby-Dick?'; }, function (b) { return 'Which character is <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k19.who(WHO, R, lv); }
].concat(D(ID)), 0.6);
