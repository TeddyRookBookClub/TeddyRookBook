/* Vocabulary for Panegyris / Ludi. g = Koine Greek, l = Latin, e = English help. */
(function (W) {
  'use strict';
  var V = {
    title: { g: 'Πανήγυρις', l: 'Ludi', e: 'The Festival' },
    greece: { g: 'Ἑλλάς', l: 'Graecia', e: 'Greece' },
    rome: { g: 'Ῥώμη', l: 'Roma', e: 'Rome' },
    newGame: { g: 'Νέα πανήγυρις', l: 'Novi ludi', e: 'New festival' },
    resume: { g: 'Πρόβαινε', l: 'Perge', e: 'Continue' },
    choose: { g: 'Ἔκλεξαι τὸν τόπον', l: 'Elige locum', e: 'Choose a place' },
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
    entryFee: { g: 'τέλος εἰσόδου', l: 'pretium introitus', e: 'entrance fee' },
    inside: { g: 'ἔνδον', l: 'intus', e: 'inside now' },
    served: { g: 'πάντες οἱ ἐλθόντες', l: 'omnes qui venerunt', e: 'total guests' },
    free: { g: 'δωρεάν', l: 'gratis', e: 'free' },
    noMoney: { g: 'Οὐκ ἔστιν ἀργύριον.', l: 'Pecunia deest.', e: 'Not enough money.' },
    needPath: { g: 'Δεῖ ὁδοῦ πλησίον.', l: 'Via prope opus est.', e: 'It must touch a path.' },
    blocked: { g: 'Ὁ τόπος οὐκ ἔστιν ἐλεύθερος.', l: 'Locus non vacat.', e: 'That spot is taken.' },
    thoughts: { g: 'Τί λέγουσιν οἱ θεαταί', l: 'Quid dicunt spectatores', e: 'What the visitors are saying' },
    goals: { g: 'Ἆθλα', l: 'Praemia', e: 'Goals' },
    saved: { g: 'Ἐνθάδε μόνον σῴζεται.', l: 'Hic tantum servatur.', e: 'Saved in this browser only.' },
    close: { g: 'Κλεῖσον', l: 'Claude', e: 'Close' },
    open: { g: 'ἀνοικτόν', l: 'apertum', e: 'open' },
    closed: { g: 'κεκλεισμένον', l: 'clausum', e: 'closed' },
    toggleOpen: { g: 'Ἄνοιξον / Κλεῖσον', l: 'Aperi / Claude', e: 'Open / Close' },
    // needs
    hunger: { g: 'πεῖνα', l: 'fames', e: 'hunger' },
    thirst: { g: 'δίψα', l: 'sitis', e: 'thirst' },
    energy: { g: 'ἰσχύς', l: 'vires', e: 'energy' },
    fun: { g: 'τέρψις', l: 'oblectatio', e: 'fun' },
    toilet: { g: 'ἀνάγκη', l: 'necessitas', e: 'bathroom' },
    purse: { g: 'βαλλάντιον', l: 'crumena', e: 'purse' },
    // groups
    gWays: { g: 'Ὁδοί', l: 'Viae', e: 'Paths' },
    gShows: { g: 'Θεάματα', l: 'Spectacula', e: 'Attractions' },
    gFood: { g: 'Βρώματα καὶ ποτά', l: 'Cibus et potus', e: 'Food & drink' },
    gCare: { g: 'Ἀνάπαυσις', l: 'Requies', e: 'Rest & needs' },
    gDecor: { g: 'Κόσμος', l: 'Ornamenta', e: 'Scenery' }
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
    flowers: { g: 'ἄνθη', l: 'flores', e: 'flower bed' }
  };

  // Visitor thoughts, first person, short and useful.
  var T = {
    hungry: { g: 'Πεινῶ.', l: 'Esurio.', e: 'I’m hungry.' },
    thirsty: { g: 'Διψῶ.', l: 'Sitio.', e: 'I’m thirsty.' },
    tired: { g: 'Κεκοπίακα.', l: 'Fessus sum.', e: 'I’m worn out.' },
    toilet: { g: 'Ποῦ ἐστιν ὁ ἀφεδρών;', l: 'Ubi est latrina?', e: 'Where is the latrine?' },
    bored: { g: 'Θέλω θεάσασθαί τι.', l: 'Aliquid spectare volo.', e: 'I want to see something.' },
    happy: { g: 'Χαίρω!', l: 'Gaudeo!', e: 'I’m happy!' },
    pricey: { g: 'Λίαν τίμιον.', l: 'Nimis carum.', e: 'Too expensive.' },
    broke: { g: 'Οὐκ ἔχω ἀργύριον.', l: 'Pecuniam non habeo.', e: 'I have no money.' },
    lost: { g: 'Πλανῶμαι.', l: 'Erro.', e: 'I’m lost.' },
    noFood: { g: 'Ἄρτον οὐχ εὑρίσκω.', l: 'Panem non invenio.', e: 'I can’t find bread.' },
    noDrink: { g: 'Ὕδωρ οὐχ εὑρίσκω.', l: 'Aquam non invenio.', e: 'I can’t find water.' },
    noToilet: { g: 'Ἀφεδρῶνα οὐχ εὑρίσκω!', l: 'Latrinam non invenio!', e: 'I can’t find a latrine!' },
    noSeat: { g: 'Οὐκ ἔστιν ποῦ καθίσαι.', l: 'Nusquam sedere possum.', e: 'Nowhere to sit.' },
    pretty: { g: 'Καλὸς ὁ τόπος.', l: 'Pulcher est locus.', e: 'What a lovely place.' },
    home: { g: 'Ἀπέρχομαι οἴκαδε.', l: 'Domum eo.', e: 'I’m going home.' },
    homeHappy: { g: 'Αὔριον πάλιν ἐλεύσομαι!', l: 'Cras iterum veniam!', e: 'I’ll come again tomorrow!' },
    homeSad: { g: 'Οὐκέτι ἐλεύσομαι.', l: 'Numquam redibo.', e: 'I’m never coming back.' },
    arrive: { g: 'Ἰδοὺ ἡ πανήγυρις!', l: 'Ecce ludi!', e: 'Here’s the festival!' },
    closed: { g: 'Κέκλεισται.', l: 'Clausum est.', e: 'It’s closed.' },
    // after visiting
    theater: { g: 'Γελῶ! Ἡ κωμῳδία ἀστεία.', l: 'Rideo! Comoedia lepida est.', e: 'Ha! The comedy is witty.' },
    hippodrome: { g: 'Νίκα, ὦ ἡνίοχε!', l: 'Vince, auriga!', e: 'Win, charioteer!' },
    temple: { g: 'Εὔχομαι τοῖς θεοῖς.', l: 'Deos precor.', e: 'I pray to the gods.' },
    palaestra: { g: 'Ἰσχυρός εἰμι!', l: 'Fortis sum!', e: 'I am strong!' },
    odeum: { g: 'Ἡδεῖα ἡ μουσική.', l: 'Dulcis est musica.', e: 'The music is sweet.' },
    bakery: { g: 'Ἡδὺς ὁ ἄρτος.', l: 'Panis bonus est.', e: 'The bread is good.' },
    tavern: { g: 'Καλὸς ὁ οἶνος.', l: 'Vinum bonum est.', e: 'The wine is good.' },
    fountain: { g: 'Ψυχρὸν τὸ ὕδωρ!', l: 'Aqua frigida!', e: 'The water is cold!' },
    baths: { g: 'Λούομαι. Ὡς ἡδύ!', l: 'Lavor. Quam iucundum!', e: 'Bathing. How pleasant!' },
    latrine: { g: 'Ἄμεινον νῦν.', l: 'Melius nunc.', e: 'Better now.' },
    bench: { g: 'Ἀναπαύομαι.', l: 'Quiesco.', e: 'I’m resting.' }
  };

  var NAMES = {
    greece: ['Νικίας', 'Δημήτριος', 'Ἀγάθων', 'Φίλων', 'Ἀρτεμισία', 'Λυδία', 'Θεοδώρα', 'Καλλίας', 'Μέλισσα', 'Ἀριστεύς', 'Εὔνικη', 'Στέφανος', 'Χλόη', 'Ξένων', 'Φοίβη', 'Τιμόθεος'],
    rome: ['Marcus', 'Lucius', 'Gaius', 'Iulia', 'Claudia', 'Titus', 'Livia', 'Quintus', 'Cornelia', 'Sextus', 'Aurelia', 'Publius', 'Tullia', 'Decimus', 'Octavia', 'Gnaeus']
  };

  var GOALS = [
    { id: 'v25', test: function (s) { return s.totalVisitors >= 25; }, g: 'Εἰκοσιπέντε θεαταί', l: 'Viginti quinque spectatores', e: '25 visitors' },
    { id: 'm5k', test: function (s) { return s.coins >= 5000; }, g: 'Πεντακισχίλιαι δραχμαί', l: 'Quinque milia denariorum', e: '5,000 coins' },
    { id: 'f70', test: function (s) { return s.fame >= 70 && s.totalVisitors >= 20; }, g: 'Δόξα ἑβδομήκοντα', l: 'Fama septuaginta', e: 'Fame of 70' },
    { id: 'b4', test: function (s) { return s.showCount >= 4; }, g: 'Τέσσαρα θεάματα', l: 'Quattuor spectacula', e: '4 attractions' },
    { id: 'v150', test: function (s) { return s.totalVisitors >= 150; }, g: 'Ἑκατὸν πεντήκοντα θεαταί', l: 'Centum quinquaginta spectatores', e: '150 visitors' },
    { id: 'd7', test: function (s) { return s.day >= 7 && s.coins > 0; }, g: 'Ἑπτὰ ἡμέραι', l: 'Septem dies', e: 'Last 7 days' }
  ];

  W.FestVocab = { V: V, B: B, T: T, NAMES: NAMES, GOALS: GOALS };
})(window);
