/* Ancient Festival Tycoon: festival calendar, scenarios. Dates are BC/AD. */
(function (root, factory) {
  var D = factory();
  if (typeof module === 'object' && module.exports) module.exports = D; else root.FestData = D;
})(this, function () {
  'use strict';
  // One game day is one month. Greece uses the months of the Athenian calendar (the year began in midsummer); Rome uses the Roman months.
  var MONTHS = {
    greece: [
      { g: 'Ἑκατομβαιών', e: 'Hekatombaion (July–August)' }, { g: 'Μεταγειτνιών', e: 'Metageitnion (August–September)' },
      { g: 'Βοηδρομιών', e: 'Boedromion (September–October)' }, { g: 'Πυανεψιών', e: 'Pyanepsion (October–November)' },
      { g: 'Μαιμακτηριών', e: 'Maimakterion (November–December)' }, { g: 'Ποσειδεών', e: 'Poseideon (December–January)' },
      { g: 'Γαμηλιών', e: 'Gamelion (January–February)' }, { g: 'Ἀνθεστηριών', e: 'Anthesterion (February–March)' },
      { g: 'Ἐλαφηβολιών', e: 'Elaphebolion (March–April)' }, { g: 'Μουνιχιών', e: 'Mounichion (April–May)' },
      { g: 'Θαργηλιών', e: 'Thargelion (May–June)' }, { g: 'Σκιροφοριών', e: 'Skirophorion (June–July)' }
    ],
    rome: ['Ianuarius|January', 'Februarius|February', 'Martius|March', 'Aprilis|April', 'Maius|May', 'Iunius|June', 'Iulius|July', 'Augustus|August', 'September|September', 'October|October', 'November|November', 'December|December']
      .map(function (s) { s = s.split('|'); return { l: s[0], e: s[1] }; })
  };

  // m: month index. every/at: held only when year % every === at. crowd: visitor multiplier. feat: buildings that draw extra crowds.
  var FESTS = [
    { id: 'olympia', setting: 'greece', m: 0, every: 4, at: 2, icon: '🏅', crowd: 1.7, feat: ['stadium', 'hippodrome', 'palaestra'],
      g: 'Ὀλύμπια', e: 'Olympic Games',
      note: 'Held every four years at Olympia in honor of Zeus. Tradition dates the first Games to 776 BC. They took place in midsummer, and a sacred truce let athletes and fans travel safely. The oldest event was the stadion, a sprint of one stadium length (about 192 m). A winner was crowned with wild olive leaves.',
      src: [['Ancient Olympic Games (Grokipedia)', 'https://grokipedia.com/page/Ancient_Olympic_Games'], ['World History Encyclopedia', 'https://www.worldhistory.org/olympics/']] },
    { id: 'panathenaia', setting: 'greece', m: 0, icon: '🦉', crowd: 1.4, great: { every: 4, at: 0, crowd: 1.8 }, feat: ['temple', 'altar', 'stadium', 'odeum'],
      g: 'Παναθήναια', e: 'Panathenaia',
      note: 'Athens’ great festival for its goddess Athena, held every summer in the month Hekatombaion. A long procession climbed to the Acropolis, bringing a newly woven robe (peplos) for her statue. Every fourth year came the Great Panathenaia, with athletic, horse, music and poetry contests. Winners took home painted jars filled with olive oil.',
      src: [['Panathenaea (Grokipedia)', 'https://grokipedia.com/page/Panathenaea']] },
    { id: 'pythia', setting: 'greece', m: 1, every: 4, at: 0, icon: '🎶', crowd: 1.5, feat: ['odeum', 'theater', 'temple', 'stadium'],
      g: 'Πύθια', e: 'Pythian Games',
      note: 'Games at Delphi in honor of Apollo, held every four years, two years after each Olympics. They were organized as crown games in the early 500s BC. Music came first: singing a hymn to Apollo, singing with the kithara (a kind of lyre) and, later, playing the aulos (a double pipe). Winners received a laurel wreath.',
      src: [['Pythian Games (Grokipedia)', 'https://grokipedia.com/page/Pythian_Games']] },
    { id: 'lenaia', setting: 'greece', m: 6, icon: '🎭', crowd: 1.3, feat: ['theater', 'odeum', 'tavern'],
      g: 'Λήναια', e: 'Lenaia',
      note: 'A winter festival for Dionysus in Athens, in the month Gamelion (about January). It was one of the city’s two big times for plays, and comedies competed in the Theater of Dionysus.',
      src: [['Lenaia (Grokipedia)', 'https://grokipedia.com/page/Lenaia']] },
    { id: 'dionysia', setting: 'greece', m: 8, icon: '🎭', crowd: 1.6, feat: ['theater', 'odeum'],
      g: 'Διονύσια', e: 'City Dionysia',
      note: 'Athens’ spring festival for Dionysus, in the month Elaphebolion (about March–April). After a procession, playwrights competed for several days with tragedies, satyr plays and comedies in the Theater of Dionysus, which held many thousands of people.',
      src: [['Dionysia (Grokipedia)', 'https://grokipedia.com/page/Dionysia']] },
    { id: 'megalenses', setting: 'rome', m: 3, icon: '🎭', crowd: 1.4, feat: ['theater', 'hippodrome', 'temple'],
      l: 'Ludi Megalenses', e: 'Games of the Great Mother',
      note: 'Held April 4–10 for the Great Mother (Magna Mater), whose sacred image was brought to Rome in 204 BC. Plays were put on near her temple, and on the last day her image was carried to the Circus Maximus for chariot races.',
      src: [['Megalesia (Wikipedia)', 'https://en.wikipedia.org/wiki/Megalesia']] },
    { id: 'apollinares', setting: 'rome', m: 6, icon: '☀️', crowd: 1.4, feat: ['hippodrome', 'theater', 'temple'],
      l: 'Ludi Apollinares', e: 'Games of Apollo',
      note: 'First held in 212 BC, during the war with Hannibal, to honor Apollo. They took place in July in the Circus Maximus and on the stage, with horse races and plays.',
      src: [['Ludi Apollinares (Wikipedia)', 'https://en.wikipedia.org/wiki/Ludi_Apollinares']] },
    { id: 'romani', setting: 'rome', m: 8, icon: '🏛️', crowd: 1.7, feat: ['hippodrome', 'theater', 'amphitheater', 'temple'],
      l: 'Ludi Romani', e: 'Roman Games',
      note: 'Rome’s oldest public games, held in September for Jupiter, best and greatest. They became a yearly event by 366 BC. A grand procession went from the Capitoline Hill to the Circus Maximus, followed by days of chariot races and plays.',
      src: [['Ludi Romani (Grokipedia)', 'https://grokipedia.com/page/Ludi_Romani']] },
    { id: 'saturnalia', setting: 'rome', m: 11, icon: '🕯️', crowd: 1.6, feat: ['bakery', 'tavern', 'market', 'inn'],
      l: 'Saturnalia', e: 'Saturnalia',
      note: 'A December festival for the god Saturn. It began on December 17 and was later stretched to seven days. After a sacrifice at the Temple of Saturn came a public banquet. Families feasted, gave small gifts such as candles and clay figurines, and greeted each other with “Io Saturnalia!”',
      src: [['Saturnalia (Grokipedia)', 'https://grokipedia.com/page/Saturnalia']] }
  ];

  // Scenarios: each goal earns one star. test(st) gets a snapshot of the festival.
  var SCEN = [
    { id: 'first', setting: 'greece', icon: '🌿', e: 'A first festival', coins: 3500, days: 8, m0: 9,
      blurb: 'Lay paths, feed and water your visitors, and keep them happy for eight days.',
      goals: [
        { e: 'Welcome 60 visitors', test: function (s) { return s.totalVisitors >= 60; } },
        { e: 'Have 3 working attractions', test: function (s) { return s.shows >= 3; } },
        { e: 'Reach fame 65', test: function (s) { return s.fame >= 65; } }] },
    { id: 'dionysia', setting: 'greece', icon: '🎭', e: 'The City Dionysia', coins: 4500, days: 6, m0: 5,
      blurb: 'Plays are coming to town. The Lenaia comes first, then the great spring Dionysia.',
      goals: [
        { e: 'Build 2 working theaters', test: function (s) { return s.count.theater >= 2; } },
        { e: 'Welcome 80 visitors on festival days', test: function (s) { return s.festVisitors >= 80; } },
        { e: 'Average happiness of 70 (with 15+ visitors)', test: function (s) { return s.visitors >= 15 && s.avgHappy >= 70; } }] },
    { id: 'olympia', setting: 'greece', icon: '🏅', e: 'An Olympic summer', coins: 6000, days: 7, m0: 10, unlock: ['stadium'],
      blurb: 'The Olympic year has come. Build a running track before midsummer and draw the crowds.',
      goals: [
        { e: 'Build a working running track', test: function (s) { return s.count.stadium >= 1; } },
        { e: 'Welcome 150 visitors', test: function (s) { return s.totalVisitors >= 150; } },
        { e: 'Reach fame 72', test: function (s) { return s.fame >= 72; } }] },
    { id: 'romani', setting: 'rome', icon: '🏛️', e: 'The Roman Games', coins: 6500, days: 6, m0: 6,
      blurb: 'September brings the Ludi Romani. Get a circus ready for the chariot races.',
      goals: [
        { e: 'Build a working circus', test: function (s) { return s.count.hippodrome >= 1; } },
        { e: 'Welcome 100 visitors on festival days', test: function (s) { return s.festVisitors >= 100; } },
        { e: 'Have 8,000 coins', test: function (s) { return s.coins >= 8000; } }] },
    { id: 'saturnalia', setting: 'rome', icon: '🕯️', e: 'Saturnalia', coins: 4000, days: 5, m0: 8, unlock: ['market'],
      blurb: 'December is coming. Feed the crowds and sell small gifts at market stalls.',
      goals: [
        { e: 'Build 2 working market stalls', test: function (s) { return s.count.market >= 2; } },
        { e: 'Earn 1,500 coins from food, drink and stalls', test: function (s) { return s.shopSales >= 1500; } },
        { e: 'Average happiness of 75 (with 15+ visitors)', test: function (s) { return s.visitors >= 15 && s.avgHappy >= 75; } }] }
  ];

  return { MONTHS: MONTHS, FESTS: FESTS, SCEN: SCEN };
});
