/* Vocabulary for Panegyris / Ludi. g = Koine Greek, l = Latin, e = English help. */
(function (W) {
  'use strict';
  var V = {
    title: { g: 'Πανήγυρις', l: 'Ludi', e: 'The Festival' },
    greece: { g: 'Ἑλλάς', l: 'Graecia', e: 'Greece' },
    rome: { g: 'Ῥώμη', l: 'Roma', e: 'Rome' },
    newGame: { g: 'Νέα πανήγυρις', l: 'Novi ludi', e: 'New festival' },
    resume: { g: 'Πρόβαινε', l: 'Perge', e: 'Continue' },
    langs: { g: 'Γλῶσσαι', l: 'Linguae', e: 'Languages' },
    coins: { g: 'δραχμαί', l: 'denarii', e: 'coins' },
    visitors: { g: 'θεαταί', l: 'spectatores', e: 'visitors' },
    fame: { g: 'δόξα', l: 'fama', e: 'fame' },
    joy: { g: 'χαρά', l: 'laetitia', e: 'happiness' },
    day: { g: 'ἡμέρα', l: 'dies', e: 'day' },
    build: { g: 'Οἰκοδόμει', l: 'Aedifica', e: 'Build' },
    demolish: { g: 'Κατάλυε', l: 'Dirue', e: 'Demolish' },
    look: { g: 'Σκόπει', l: 'Specta', e: 'Inspect' },
    pause: { g: 'Παῦσαι', l: 'Siste', e: 'Pause' },
    slow: { g: 'Βραδέως', l: 'Lente', e: 'Slow' },
    fast: { g: 'Ταχέως', l: 'Celeriter', e: 'Fast' },
    price: { g: 'τιμή', l: 'pretium', e: 'price' },
    cost: { g: 'δαπάνη', l: 'sumptus', e: 'building cost' },
    upkeep: { g: 'δαπάνη καθ’ ἡμέραν', l: 'impensa cottidiana', e: 'daily upkeep' },
    income: { g: 'κέρδος', l: 'lucrum', e: 'income' },
    inside: { g: 'ἔνδον', l: 'intus', e: 'inside now' },
    served: { g: 'πάντες οἱ ἐλθόντες', l: 'omnes qui venerunt', e: 'total guests' },
    free: { g: 'δωρεάν', l: 'gratis', e: 'free' },
    noMoney: { g: 'Οὐκ ἔχεις ἀργύριον.', l: 'Pecuniam non habes.', e: 'You don’t have enough money.' },
    needPath: { g: 'Ποῦ ἐστιν ἡ ὁδός;', l: 'Ubi est via?', e: 'It must touch a path.' },
    blocked: { g: 'Οὐκ ἔξεστιν.', l: 'Non licet.', e: 'You can’t build there.' },
    thoughts: { g: 'Τί λέγουσιν οἱ θεαταί', l: 'Quid dicunt spectatores', e: 'What the visitors are saying' },
    goals: { g: 'Ἆθλα', l: 'Praemia', e: 'Goals' },
    saved: { g: 'Ἐνθάδε μόνον σῴζεται.', l: 'Hic tantum servatur.', e: 'Saved in this browser only.' },
    close: { g: 'Κλεῖσον', l: 'Claude', e: 'Close' },
    toggleOpen: { g: 'Ἄνοιξον / Κλεῖσον', l: 'Aperi / Claude', e: 'Open / Close' },
    // needs
    hunger: { g: 'πεῖνα', l: 'fames', e: 'hunger' },
    thirst: { g: 'δίψα', l: 'sitis', e: 'thirst' },
    energy: { g: 'ἰσχύς', l: 'vires', e: 'energy' },
    fun: { g: 'τέρψις', l: 'oblectatio', e: 'fun' },
    toilet: { g: 'ἀφεδρών', l: 'latrina', e: 'bathroom' },
    purse: { g: 'βαλλάντιον', l: 'crumena', e: 'purse' },
    // groups
    gWays: { g: 'Ὁδοί', l: 'Viae', e: 'Paths' },
    gShows: { g: 'Θεάματα', l: 'Spectacula', e: 'Attractions' },
    gFood: { g: 'Βρώματα καὶ ποτά', l: 'Cibus et potus', e: 'Food & drink' },
    gCare: { g: 'Ἀνάπαυσις', l: 'Requies', e: 'Rest & needs' },
    gDecor: { g: 'Κόσμος', l: 'Ornamenta', e: 'Scenery' },
    gCity: { g: 'Πόλις', l: 'Civitas', e: 'City & army' },
    // ranks, land, events
    rank: { g: 'τιμή', l: 'honos', e: 'rank' },
    newRank: { g: 'Νέα τιμή', l: 'Novus honos', e: 'New rank' },
    locked: { g: 'Οὔπω ἔξεστιν.', l: 'Nondum licet.', e: 'Not unlocked yet.' },
    expand: { g: 'Αὔξησον τὴν χώραν', l: 'Fines profer', e: 'Win more land' },
    marched: { g: 'Οἱ στρατιῶται ἐξῆλθον.', l: 'Milites exierunt.', e: 'The soldiers have marched out.' },
    won: { g: 'Οἱ στρατιῶται ἐνίκησαν!', l: 'Milites vicerunt!', e: 'The soldiers have won: new land!' },
    needArmy: { g: 'Ποῦ εἰσιν οἱ στρατιῶται;', l: 'Ubi sunt milites?', e: 'You need a camp (and, later, a council house).' },
    evRain: { g: 'Βρέχει.', l: 'Pluit.', e: 'It is raining: fewer visitors today.' },
    evFeast: { g: 'Ἑορτή ἐστιν σήμερον.', l: 'Dies festus est hodie.', e: 'Today is a feast day: more visitors.' },
    evAthlete: { g: 'Ἀθλητὴς ἔνδοξος ἥκει.', l: 'Athleta clarus adest.', e: 'A famous athlete is here: your fame grows.' },
    evTax: { g: 'Ὁ τελώνης ἥκει.', l: 'Publicanus adest.', e: 'The tax collector is here.' }
  };

  // Building names differ a little by setting (Greek festival vs Roman games) but every name is given in both languages.
  var B = {
    path: { g: 'ὁδός', l: 'via', e: 'path' },
    gate: { g: 'πύλη', l: 'porta', e: 'entrance gate' },
    theater: { g: 'θέατρον', l: 'theatrum', e: 'theater' },
    hippodrome: { g: 'ἱππόδρομος', l: 'circus', e: 'chariot racetrack' },
    temple: { g: 'ναός', l: 'templum', e: 'temple' },
    palaestra: { g: 'παλαίστρα', l: 'palaestra', e: 'wrestling ground' },
    odeum: { g: 'ᾠδεῖον', l: 'odeum', e: 'music hall' },
    bakery: { g: 'ἀρτοπώλιον', l: 'pistrinum', e: 'bread stall' },
    tavern: { g: 'καπηλεῖον', l: 'caupona', e: 'wine tavern' },
    fountain: { g: 'κρήνη', l: 'fons', e: 'fountain' },
    baths: { g: 'βαλανεῖον', l: 'balneum', e: 'baths' },
    latrine: { g: 'ἀφεδρών', l: 'latrina', e: 'latrine' },
    bench: { g: 'βάθρον', l: 'scamnum', e: 'bench' },
    olive: { g: 'ἐλαία', l: 'olea', e: 'olive tree' },
    cypress: { g: 'κυπάρισσος', l: 'cupressus', e: 'cypress' },
    statue: { g: 'ἄγαλμα', l: 'statua', e: 'statue' },
    flowers: { g: 'ἄνθη', l: 'flores', e: 'flower bed' },
    stadium: { g: 'στάδιον', l: 'stadium', e: 'running track' },
    library: { g: 'βιβλιοθήκη', l: 'bibliotheca', e: 'library' },
    amphitheater: { g: 'ἀμφιθέατρον', l: 'amphitheatrum', e: 'amphitheater' },
    stoa: { g: 'στοά', l: 'porticus', e: 'colonnade' },
    inn: { g: 'πανδοχεῖον', l: 'deversorium', e: 'inn' },
    altar: { g: 'βωμός', l: 'ara', e: 'altar' },
    trophy: { g: 'τρόπαιον', l: 'tropaeum', e: 'victory monument' },
    curia: { g: 'βουλευτήριον', l: 'curia', e: 'council house' },
    barracks: { g: 'παρεμβολή', l: 'castra', e: 'army camp' }
  };

  // Visitor thoughts, first person, short and useful.
  var T = {
    hungry: { g: 'Πεινῶ.', l: 'Esurio.', e: 'I’m hungry.' },
    thirsty: { g: 'Διψῶ.', l: 'Sitio.', e: 'I’m thirsty.' },
    tired: { g: 'Κεκοπίακα.', l: 'Fessus sum.', e: 'I’m worn out.' },
    toilet: { g: 'Ποῦ ἐστιν ὁ ἀφεδρών;', l: 'Ubi est latrina?', e: 'Where is the latrine?' },
    bored: { g: 'Τί ποιήσω;', l: 'Quid faciam?', e: 'What shall I do? (I’m bored.)' },
    happy: { g: 'Χαίρω!', l: 'Gaudeo!', e: 'I’m happy!' },
    pricey: { g: 'Λίαν τίμιον.', l: 'Nimis carum.', e: 'Too expensive.' },
    broke: { g: 'Οὐκ ἔχω ἀργύριον.', l: 'Pecuniam non habeo.', e: 'I have no money.' },
    lost: { g: 'Πλανῶμαι.', l: 'Erro.', e: 'I’m lost.' },
    noFood: { g: 'Ἄρτον οὐχ εὑρίσκω.', l: 'Panem non invenio.', e: 'I can’t find bread.' },
    noDrink: { g: 'Ὕδωρ οὐχ εὑρίσκω.', l: 'Aquam non invenio.', e: 'I can’t find water.' },
    noToilet: { g: 'Ἀφεδρῶνα οὐχ εὑρίσκω!', l: 'Latrinam non invenio!', e: 'I can’t find a latrine!' },
    noSeat: { g: 'Ποῦ καθίσω;', l: 'Ubi sedeam?', e: 'Where can I sit?' },
    pretty: { g: 'Καλὸς ὁ τόπος.', l: 'Pulcher est locus.', e: 'What a lovely place.' },
    home: { g: 'Ὑπάγω εἰς τὸν οἶκόν μου.', l: 'Domum eo.', e: 'I’m going home.' },
    homeHappy: { g: 'Αὔριον πάλιν ἐλεύσομαι!', l: 'Cras iterum veniam!', e: 'I’ll come again tomorrow!' },
    homeSad: { g: 'Οὐκέτι ἐλεύσομαι.', l: 'Numquam redibo.', e: 'I’m never coming back.' },
    arrive: { g: 'Ἰδοὺ ἡ πανήγυρις!', l: 'Ecce ludi!', e: 'Here’s the festival!' },
    closed: { g: 'Κέκλεισται.', l: 'Clausum est.', e: 'It’s closed.' },
    // after visiting
    theater: { g: 'Γελῶ!', l: 'Rideo!', e: 'I’m laughing! (the comedy)' },
    hippodrome: { g: 'Νίκα, ὦ ἡνίοχε!', l: 'Vince, auriga!', e: 'Win, charioteer!' },
    temple: { g: 'Εὔχομαι τοῖς θεοῖς.', l: 'Deos precor.', e: 'I pray to the gods.' },
    palaestra: { g: 'Ἰσχυρός εἰμι!', l: 'Fortis sum!', e: 'I am strong!' },
    odeum: { g: 'Ἡδεῖα ἡ μουσική.', l: 'Dulcis est musica.', e: 'The music is sweet.' },
    bakery: { g: 'Ἡδὺς ὁ ἄρτος.', l: 'Panis bonus est.', e: 'The bread is good.' },
    tavern: { g: 'Καλὸς ὁ οἶνος.', l: 'Vinum bonum est.', e: 'The wine is good.' },
    fountain: { g: 'Ψυχρὸν τὸ ὕδωρ!', l: 'Aqua frigida!', e: 'The water is cold!' },
    baths: { g: 'Λούομαι. Ὡς ἡδύ!', l: 'Lavor. Quam iucundum!', e: 'Bathing. How pleasant!' },
    latrine: { g: 'Ἄμεινον νῦν.', l: 'Melius nunc.', e: 'Better now.' },
    bench: { g: 'Ἀναπαύομαι.', l: 'Quiesco.', e: 'I’m resting.' },
    stadium: { g: 'Τρέχε ταχέως!', l: 'Curre celeriter!', e: 'Run fast!' },
    library: { g: 'Ἀναγινώσκω βιβλίον.', l: 'Librum lego.', e: 'I’m reading a book.' },
    amphitheater: { g: 'Μέγα τὸ θέαμα!', l: 'Magnum spectaculum!', e: 'What a great show!' },
    stoa: { g: 'Ἀναπαύομαι ἐν τῇ σκιᾷ.', l: 'In umbra quiesco.', e: 'I’m resting in the shade.' },
    inn: { g: 'Καλῶς ἐκοιμήθην.', l: 'Bene dormivi.', e: 'I slept well.' }
  };

  var NAMES = {
    greece: ['Νικίας', 'Δημήτριος', 'Ἀγάθων', 'Φίλων', 'Ἀρτεμισία', 'Λυδία', 'Θεοδώρα', 'Καλλίας', 'Μέλισσα', 'Ἀριστεύς', 'Εὔνικη', 'Στέφανος', 'Χλόη', 'Ξένων', 'Φοίβη', 'Τιμόθεος'],
    rome: ['Marcus', 'Lucius', 'Gaius', 'Iulia', 'Claudia', 'Titus', 'Livia', 'Quintus', 'Cornelia', 'Sextus', 'Aurelia', 'Publius', 'Tullia', 'Decimus', 'Octavia', 'Gnaeus']
  };

  var GOALS = [
    { id: 'v25', test: function (s) { return s.totalVisitors >= 25; }, g: '25 θεαταί', l: '25 spectatores', e: '25 visitors' },
    { id: 'm5k', test: function (s) { return s.coins >= 5000; }, g: '5000 δραχμαί', l: '5000 denarii', e: '5,000 coins' },
    { id: 'f70', test: function (s) { return s.fame >= 70 && s.totalVisitors >= 20; }, g: 'δόξα 70', l: 'fama 70', e: 'Fame of 70' },
    { id: 'b4', test: function (s) { return s.showCount >= 4; }, g: '4 θεάματα', l: '4 spectacula', e: '4 attractions' },
    { id: 'v150', test: function (s) { return s.totalVisitors >= 150; }, g: '150 θεαταί', l: '150 spectatores', e: '150 visitors' },
    { id: 'd7', test: function (s) { return s.day >= 7 && s.coins > 0; }, g: '7 ἡμέραι', l: '7 dies', e: 'Last 7 days' },
    { id: 'v500', test: function (s) { return s.totalVisitors >= 500; }, g: '500 θεαταί', l: '500 spectatores', e: '500 visitors' },
    { id: 'b8', test: function (s) { return s.showCount >= 8; }, g: '8 θεάματα', l: '8 spectacula', e: '8 attractions' },
    { id: 'm20k', test: function (s) { return s.coins >= 20000; }, g: '20000 δραχμαί', l: '20000 denarii', e: '20,000 coins' },
    { id: 'f85', test: function (s) { return s.fame >= 85 && s.totalVisitors >= 200; }, g: 'δόξα 85', l: 'fama 85', e: 'Fame of 85' },
    { id: 'land', test: function (s) { return s.land >= 3; }, g: 'πᾶσα ἡ χώρα', l: 'omnis regio', e: 'Win all the land' },
    { id: 'd30', test: function (s) { return s.day >= 30 && s.coins > 0; }, g: '30 ἡμέραι', l: '30 dies', e: 'Last 30 days' }
  ];
  // Ranks: an office-holder's career. Each one unlocks new buildings.
  var RANKS = [
    { g: 'πολίτης', l: 'civis', e: 'citizen', need: 'the start' },
    { g: 'ἀγορανόμος', l: 'aedilis', e: 'market overseer', v: 40, f: 0, need: '40 visitors in all' },
    { g: 'ἄρχων', l: 'praetor', e: 'magistrate', v: 150, f: 62, need: '150 visitors in all and fame of 62' },
    { g: 'στρατηγός', l: 'consul', e: 'general', v: 400, f: 72, need: '400 visitors in all and fame of 72' }
  ];

  W.FestVocab = { V: V, B: B, T: T, NAMES: NAMES, GOALS: GOALS, RANKS: RANKS };
})(window);
