/* Imperium: scenarios, names and word lists. Maps are in maps.js (generated). */
(function (W) {
  'use strict';
  // Latin place names: [nominative, accusative, form of "captured" verb]. f = capta est, n = captum est, m = captus est, fp = captae sunt, mp = capti sunt
  function la(en, nom, acc, g) { return { en: en, n: nom, a: acc, g: g || 'f' }; }
  // Greek place names with the article: [nominative, accusative, plural?]
  function gr(en, nom, acc, pl) { return { en: en, n: nom, a: acc, pl: !!pl }; }
  var NAMES = {
    italia: {
      liguria: la('Liguria', 'Liguria', 'Liguriam'), transpadana: la('Transpadane Gaul', 'Gallia Transpadana', 'Galliam Transpadanam'), venetia: la('Venetia', 'Venetia', 'Venetiam'),
      cispadana: la('Cispadane Gaul', 'Gallia Cispadana', 'Galliam Cispadanam'), agergallicus: la('The Gallic Land', 'Ager Gallicus', 'Agrum Gallicum', 'm'), etruria: la('Etruria', 'Etruria', 'Etruriam'),
      volsinii: la('Volsinii', 'Volsinii', 'Volsinios', 'mp'), umbria: la('Umbria', 'Umbria', 'Umbriam'), picenum: la('Picenum', 'Picenum', 'Picenum', 'n'), roma: la('Rome', 'Roma', 'Romam'),
      latium: la('Latium', 'Latium', 'Latium', 'n'), samnium: la('Samnium', 'Samnium', 'Samnium', 'n'), campania: la('Campania', 'Campania', 'Campaniam'), apulia: la('Apulia', 'Apulia', 'Apuliam'),
      calabria: la('Calabria (Tarentum)', 'Calabria', 'Calabriam'), lucania: la('Lucania', 'Lucania', 'Lucaniam'), bruttii: la('Bruttium', 'Bruttii', 'Bruttios', 'mp'), messana: la('Messana', 'Messana', 'Messanam'),
      syracusae: la('Syracuse', 'Syracusae', 'Syracusas', 'fp'), lilybaeum: la('Lilybaeum', 'Lilybaeum', 'Lilybaeum', 'n'), sardinia: la('Sardinia', 'Sardinia', 'Sardiniam'), corsica: la('Corsica', 'Corsica', 'Corsicam'),
      carthago: la('Carthage', 'Carthago', 'Carthaginem'), epirus: la('Epirus', 'Epirus', 'Epirum'), illyricum: la('Illyria', 'Illyricum', 'Illyricum', 'n')
    },
    mare: {
      lusitania: la('Lusitania', 'Lusitania', 'Lusitaniam'), hispaniaulterior: la('Further Spain', 'Hispania Ulterior', 'Hispaniam Ulteriorem'), hispaniaciterior: la('Nearer Spain', 'Hispania Citerior', 'Hispaniam Citeriorem'),
      aquitania: la('Aquitania', 'Aquitania', 'Aquitaniam'), narbonensis: la('Narbonese Gaul', 'Gallia Narbonensis', 'Galliam Narbonensem'), celtica: la('Celtic Gaul', 'Gallia Celtica', 'Galliam Celticam'), belgica: la('Belgic Gaul', 'Belgica', 'Belgicam'),
      britannia: la('Britain', 'Britannia', 'Britanniam'), germania: la('Germany', 'Germania', 'Germaniam'), raetia: la('Raetia', 'Raetia', 'Raetiam'), pannonia: la('Pannonia', 'Pannonia', 'Pannoniam'), illyricum: la('Illyria', 'Illyricum', 'Illyricum', 'n'),
      dacia: la('Dacia', 'Dacia', 'Daciam'), moesia: la('Moesia', 'Moesia', 'Moesiam'), thracia: la('Thrace', 'Thracia', 'Thraciam'), macedonia: la('Macedonia', 'Macedonia', 'Macedoniam'), achaia: la('Greece', 'Achaia', 'Achaiam'), creta: la('Crete', 'Creta', 'Cretam'),
      cisalpina: la('Cisalpine Gaul', 'Gallia Cisalpina', 'Galliam Cisalpinam'), italia: la('Italy (Rome)', 'Italia', 'Italiam'), magnagraecia: la('Southern Italy', 'Magna Graecia', 'Magnam Graeciam'), sicilia: la('Sicily', 'Sicilia', 'Siciliam'),
      sardinia: la('Sardinia & Corsica', 'Sardinia', 'Sardiniam'), asia: la('Asia', 'Asia', 'Asiam'), bithynia: la('Bithynia & Pontus', 'Bithynia', 'Bithyniam'), galatia: la('Galatia', 'Galatia', 'Galatiam'), cappadocia: la('Cappadocia', 'Cappadocia', 'Cappadociam'),
      cilicia: la('Cilicia', 'Cilicia', 'Ciliciam'), armenia: la('Armenia', 'Armenia', 'Armeniam'), syria: la('Syria', 'Syria', 'Syriam'), iudaea: la('Judaea', 'Iudaea', 'Iudaeam'), arabia: la('Arabia', 'Arabia', 'Arabiam'),
      mesopotamia: la('Mesopotamia', 'Mesopotamia', 'Mesopotamiam'), media: la('Media', 'Media', 'Mediam'), cyprus: la('Cyprus', 'Cyprus', 'Cyprum'), aegyptus: la('Egypt', 'Aegyptus', 'Aegyptum'), cyrenaica: la('Cyrenaica', 'Cyrenaica', 'Cyrenaicam'),
      libya: la('Libya', 'Libya', 'Libyam'), africa: la('Africa (Carthage)', 'Africa', 'Africam'), numidia: la('Numidia', 'Numidia', 'Numidiam'), mauretania: la('Mauretania', 'Mauretania', 'Mauretaniam')
    },
    aegaeum: {
      epirus: gr('Epirus', 'ἡ Ἤπειρος', 'τὴν Ἤπειρον'), macedonia: gr('Macedonia', 'ἡ Μακεδονία', 'τὴν Μακεδονίαν'), chalcidice: gr('Chalcidice', 'ἡ Χαλκιδική', 'τὴν Χαλκιδικήν'), thracia: gr('Thrace', 'ἡ Θρᾴκη', 'τὴν Θρᾴκην'),
      chersonesus: gr('The Chersonese', 'ἡ Χερρόνησος', 'τὴν Χερρόνησον'), thessalia: gr('Thessaly', 'ἡ Θεσσαλία', 'τὴν Θεσσαλίαν'), phthia: gr('Phthia', 'ἡ Φθία', 'τὴν Φθίαν'), aetolia: gr('Aetolia', 'ἡ Αἰτωλία', 'τὴν Αἰτωλίαν'),
      phocis: gr('Phocis (Delphi)', 'ἡ Φωκίς', 'τὴν Φωκίδα'), boeotia: gr('Boeotia (Thebes)', 'ἡ Βοιωτία', 'τὴν Βοιωτίαν'), attica: gr('Attica (Athens)', 'ἡ Ἀττική', 'τὴν Ἀττικήν'), corinthus: gr('Corinth', 'ἡ Κόρινθος', 'τὴν Κόρινθον'),
      euboea: gr('Euboea', 'ἡ Εὔβοια', 'τὴν Εὔβοιαν'), achaea: gr('Achaea', 'ἡ Ἀχαΐα', 'τὴν Ἀχαΐαν'), elis: gr('Elis (Olympia)', 'ἡ Ἦλις', 'τὴν Ἦλιν'), arcadia: gr('Arcadia', 'ἡ Ἀρκαδία', 'τὴν Ἀρκαδίαν'),
      argolis: gr('The Argolid (Mycenae)', 'ἡ Ἀργολίς', 'τὴν Ἀργολίδα'), laconia: gr('Laconia (Sparta)', 'ἡ Λακωνική', 'τὴν Λακωνικήν'), messenia: gr('Messenia (Pylos)', 'ἡ Μεσσηνία', 'τὴν Μεσσηνίαν'), ithaca: gr('Ithaca', 'ἡ Ἰθάκη', 'τὴν Ἰθάκην'),
      corcyra: gr('Corcyra', 'ἡ Κέρκυρα', 'τὴν Κέρκυραν'), cydonia: gr('Western Crete', 'ἡ Κυδωνία', 'τὴν Κυδωνίαν'), cnossus: gr('Knossos', 'ἡ Κνωσός', 'τὴν Κνωσόν'), cyclades: gr('The Cyclades', 'αἱ Κυκλάδες', 'τὰς Κυκλάδας', true),
      rhodus: gr('Rhodes', 'ἡ Ῥόδος', 'τὴν Ῥόδον'), lesbos: gr('Lesbos', 'ἡ Λέσβος', 'τὴν Λέσβον'), chios: gr('Chios', 'ἡ Χίος', 'τὴν Χίον'), samos: gr('Samos', 'ἡ Σάμος', 'τὴν Σάμον'), lemnos: gr('Lemnos', 'ἡ Λῆμνος', 'τὴν Λῆμνον'),
      troia: gr('Troy', 'ἡ Τροία', 'τὴν Τροίαν'), mysia: gr('Mysia', 'ἡ Μυσία', 'τὴν Μυσίαν'), bithynia: gr('Bithynia', 'ἡ Βιθυνία', 'τὴν Βιθυνίαν'), lydia: gr('Lydia (Sardis)', 'ἡ Λυδία', 'τὴν Λυδίαν'),
      ionia: gr('Ionia', 'ἡ Ἰωνία', 'τὴν Ἰωνίαν'), caria: gr('Caria', 'ἡ Καρία', 'τὴν Καρίαν'), lycia: gr('Lycia', 'ἡ Λυκία', 'τὴν Λυκίαν'), phrygia: gr('Phrygia', 'ἡ Φρυγία', 'τὴν Φρυγίαν')
    }
  };
  var REGIONS = {
    italia: [
      { en: 'Cisalpine Gaul', bonus: 3, t: ['liguria', 'transpadana', 'venetia', 'cispadana', 'agergallicus'] },
      { en: 'Central Italy', bonus: 4, t: ['etruria', 'volsinii', 'umbria', 'picenum', 'roma', 'latium'] },
      { en: 'Southern Italy', bonus: 4, t: ['samnium', 'campania', 'apulia', 'calabria', 'lucania', 'bruttii'] },
      { en: 'The Islands', bonus: 3, t: ['messana', 'syracusae', 'lilybaeum', 'sardinia', 'corsica'] },
      { en: 'Across the Sea', bonus: 2, t: ['carthago', 'epirus', 'illyricum'] }],
    mare: [
      { en: 'Spain', bonus: 2, t: ['lusitania', 'hispaniaulterior', 'hispaniaciterior'] },
      { en: 'Gaul', bonus: 3, t: ['aquitania', 'narbonensis', 'celtica', 'belgica'] },
      { en: 'The North', bonus: 3, t: ['britannia', 'germania', 'raetia', 'pannonia', 'dacia'] },
      { en: 'Italy', bonus: 4, t: ['cisalpina', 'italia', 'magnagraecia', 'sicilia', 'sardinia'] },
      { en: 'Greece & the Balkans', bonus: 4, t: ['illyricum', 'moesia', 'thracia', 'macedonia', 'achaia', 'creta'] },
      { en: 'Asia Minor', bonus: 4, t: ['asia', 'bithynia', 'galatia', 'cappadocia', 'cilicia', 'cyprus'] },
      { en: 'The East', bonus: 4, t: ['armenia', 'syria', 'iudaea', 'arabia', 'mesopotamia', 'media'] },
      { en: 'Africa', bonus: 4, t: ['aegyptus', 'cyrenaica', 'libya', 'africa', 'numidia', 'mauretania'] }],
    aegaeum: [
      { en: 'The North', bonus: 3, t: ['epirus', 'macedonia', 'chalcidice', 'thracia', 'chersonesus'] },
      { en: 'Central Greece', bonus: 4, t: ['thessalia', 'phthia', 'aetolia', 'phocis', 'boeotia', 'attica', 'euboea'] },
      { en: 'The Peloponnese', bonus: 5, t: ['corinthus', 'achaea', 'elis', 'arcadia', 'argolis', 'laconia', 'messenia'] },
      { en: 'The Islands', bonus: 5, t: ['ithaca', 'corcyra', 'cydonia', 'cnossus', 'cyclades', 'rhodus', 'lesbos', 'chios', 'samos', 'lemnos'] },
      { en: 'Asia', bonus: 5, t: ['troia', 'mysia', 'bithynia', 'lydia', 'ionia', 'caria', 'lycia', 'phrygia'] }]
  };
  // Factions. name = how the narration refers to them (Latin or Greek subject). s = singular subject, f = feminine.
  function F(id, en, name, leader, note, color, home, o) { o = o || {}; return { id: id, en: en, name: name, leader: leader, note: note, color: color, home: home, s: !!o.s, f: !!o.f }; }
  var SCENARIOS = [
    { id: 'italia', map: 'italia', lang: 'la', side: 'Rome', title: 'Italia', date: '280 BC', sub: 'Rome and Pyrrhus fight for Italy',
      blurb: 'Rome has beaten the Samnites and now presses south. The Greek city of Tarentum calls in King Pyrrhus of Epirus, who lands with 25,000 men and 20 war elephants. He wins his battles at such cost that “Pyrrhic victory” is still a saying. Carthage holds western Sicily and Sardinia; Gauls hold the Po valley.',
      factions: [
        F('rom', 'Rome', 'Romani', 'Manius Curius Dentatus', 'Consul who beat Pyrrhus at Beneventum in 275 BC.', '#b3261e', ['roma', 'latium', 'campania']),
        F('epi', 'Epirus & Tarentum', 'Epirotae', 'Pyrrhus', 'King of Epirus, cousin of Alexander the Great; fought Rome 280–275 BC.', '#2f6fb2', ['epirus', 'calabria']),
        F('sam', 'The Samnites', 'Samnites', null, 'A league of hill peoples; no single leader is recorded for 280 BC. They sided with Pyrrhus.', '#3f8f4f', ['samnium', 'lucania']),
        F('poe', 'Carthage', 'Poeni', 'Mago', 'Carthaginian admiral who brought a fleet to Ostia in 279 BC.', '#6d3fa0', ['carthago', 'lilybaeum', 'sardinia']),
        F('etr', 'The Etruscans', 'Etrusci', null, 'A league of twelve cities; Volsinii and Vulci were defeated by Rome in 280 BC.', '#c77f1a', ['etruria', 'volsinii']),
        F('gal', 'The Gauls', 'Galli', null, 'The Boii and Insubres of the Po valley; no leader is named in the sources for these years.', '#1f8a70', ['cispadana', 'transpadana']),
        F('syr', 'Syracuse', 'Syracusani', 'Hicetas', 'Tyrant of Syracuse 289–280 BC.', '#8a5a44', ['syracusae'])],
      order: ['epi', 'rom', 'sam', 'poe', 'etr', 'gal', 'syr'] },
    { id: 'hannibal', map: 'mare', lang: 'la', side: 'Rome', title: 'Bellum Punicum', date: '218 BC', sub: 'Hannibal’s war',
      blurb: 'Hannibal marches from Spain over the Alps with his elephants and destroys Roman armies at the Trebia, Lake Trasimene and Cannae. Rome refuses to give in. In the east, Philip V of Macedon allies with Hannibal while Antiochus III and Ptolemy IV fight over Syria.',
      factions: [
        F('rom', 'Rome', 'Romani', 'Scipio Africanus', 'Took command in Spain in 210 BC and beat Hannibal at Zama in 202 BC.', '#b3261e', ['italia', 'magnagraecia', 'sicilia', 'sardinia']),
        F('poe', 'Carthage', 'Poeni', 'Hannibal', 'Carthaginian general; crossed the Alps in 218 BC.', '#6d3fa0', ['africa', 'libya', 'hispaniaulterior', 'hispaniaciterior']),
        F('mac', 'Macedon', 'Macedones', 'Philip V', 'King of Macedon 221–179 BC; allied with Hannibal in 215 BC.', '#2f6fb2', ['macedonia', 'achaia']),
        F('sel', 'The Seleucid kingdom', 'Syri', 'Antiochus III', '“The Great”, king 222–187 BC.', '#c77f1a', ['syria', 'mesopotamia', 'media', 'cilicia']),
        F('aeg', 'Ptolemaic Egypt', 'Aegyptii', 'Ptolemy IV', 'King 221–204 BC; beat Antiochus at Raphia in 217 BC.', '#1f8a70', ['aegyptus', 'cyrenaica', 'cyprus', 'iudaea']),
        F('num', 'Numidia', 'Numidae', 'Syphax', 'King of the western Numidians during the war.', '#8a5a44', ['numidia']),
        F('per', 'Pergamon', 'Pergameni', 'Attalus I', 'King of Pergamon 241–197 BC, a friend of Rome.', '#3f8f4f', ['asia'])],
      order: ['poe', 'rom', 'mac', 'sel', 'aeg', 'num', 'per'] },
    { id: 'heredes', map: 'mare', lang: 'la', side: 'Rome', title: 'Heredes Caesaris', date: '43 BC', sub: 'The heirs of Caesar',
      blurb: 'Caesar is dead. His heir Octavian, Mark Antony and Lepidus divide the West between them as the Second Triumvirate. Brutus and Cassius, who call themselves the Liberators, hold the East. Sextus Pompey seizes Sicily, Cleopatra rules Egypt, and the Parthians watch from across the Euphrates. Whoever wins will be the first emperor.',
      factions: [
        F('oct', 'Octavian', 'Octavianus', 'Octavian', 'Caesar’s adopted heir, aged 19; later the emperor Augustus.', '#b3261e', ['italia', 'magnagraecia', 'sardinia', 'africa'], { s: 1 }),
        F('ant', 'Mark Antony', 'Antonius', 'Mark Antony', 'Caesar’s general; received Gaul in the Triumvirate’s division of 43 BC.', '#6d3fa0', ['cisalpina', 'celtica', 'belgica', 'aquitania'], { s: 1 }),
        F('lib', 'The Liberators', 'Liberatores', 'Brutus & Cassius', 'Caesar’s assassins; defeated at Philippi in 42 BC.', '#2f6fb2', ['macedonia', 'illyricum', 'asia', 'syria']),
        F('lep', 'Lepidus', 'Lepidus', 'Lepidus', 'Third triumvir; received Spain and Narbonese Gaul.', '#c77f1a', ['narbonensis', 'hispaniaciterior', 'hispaniaulterior', 'lusitania'], { s: 1 }),
        F('sex', 'Sextus Pompey', 'Sextus Pompeius', 'Sextus Pompey', 'Son of Pompey the Great; held Sicily with his fleet until 36 BC.', '#3f8f4f', ['sicilia'], { s: 1 }),
        F('cle', 'Cleopatra', 'Cleopatra', 'Cleopatra VII', 'Queen of Egypt 51–30 BC.', '#1f8a70', ['aegyptus', 'cyprus'], { s: 1, f: 1 }),
        F('par', 'Parthia', 'Parthi', 'Orodes II', 'King of Parthia c. 57–37 BC; his army destroyed Crassus at Carrhae.', '#8a5a44', ['mesopotamia', 'media'])],
      order: ['ant', 'oct', 'lib', 'lep', 'sex', 'cle', 'par'] },
    { id: 'troia', map: 'aegaeum', lang: 'gr', side: 'Greece', title: 'Τροία', date: 'The age of heroes', sub: 'Homer’s Trojan War',
      blurb: 'The kings of the Achaeans sail against Troy, as Homer tells it in the Iliad. Each faction is one of Homer’s kingdoms from the Catalogue of Ships, with its own hero. In this game every king fights for himself.',
      factions: [
        F('tro', 'Troy', 'οἱ Τρῶες', 'Hector', 'Son of King Priam and the Trojans’ greatest warrior.', '#b3261e', ['troia', 'mysia']),
        F('myk', 'Mycenae', 'οἱ Μυκηναῖοι', 'Agamemnon', 'King of Mycenae and commander of the Achaean host.', '#c77f1a', ['argolis', 'corinthus', 'achaea']),
        F('myr', 'The Myrmidons', 'οἱ Μυρμιδόνες', 'Achilles', 'Prince of Phthia, the best fighter of the Achaeans.', '#2f6fb2', ['phthia']),
        F('lak', 'Sparta', 'οἱ Λακεδαιμόνιοι', 'Menelaus', 'King of Sparta, husband of Helen.', '#6d3fa0', ['laconia']),
        F('ith', 'Ithaca', 'οἱ Ἰθακήσιοι', 'Odysseus', 'King of Ithaca, famous for his cunning.', '#1f8a70', ['ithaca']),
        F('pyl', 'Pylos', 'οἱ Πύλιοι', 'Nestor', 'The old king of Pylos, the Achaeans’ wisest counsellor.', '#3f8f4f', ['messenia']),
        F('kre', 'Crete', 'οἱ Κρῆτες', 'Idomeneus', 'King of Crete, grandson of Minos.', '#8a5a44', ['cnossus', 'cydonia']),
        F('lyk', 'The Lycians', 'οἱ Λύκιοι', 'Sarpedon', 'Son of Zeus and Troy’s chief ally.', '#a8327a', ['lycia'])],
      order: ['tro', 'myk', 'myr', 'lak', 'ith', 'pyl', 'kre', 'lyk'] },
    { id: 'hellas', map: 'aegaeum', lang: 'gr', side: 'Greece', title: 'Ἑλλάς', date: '431 BC', sub: 'The Peloponnesian War',
      blurb: 'Athens rules the sea and an empire of islands; Sparta leads the cities of the Peloponnese on land. Thucydides wrote that the war began because Sparta feared the growth of Athenian power. Persia, Macedon and Thrace wait at the edges.',
      factions: [
        F('ath', 'Athens', 'οἱ Ἀθηναῖοι', 'Pericles', 'Leading statesman of Athens until his death in 429 BC.', '#2f6fb2', ['attica', 'euboea', 'cyclades', 'samos', 'chios', 'lesbos', 'lemnos']),
        F('lak', 'Sparta', 'οἱ Λακεδαιμόνιοι', 'Archidamus II', 'King of Sparta; led the first invasions of Attica.', '#b3261e', ['laconia', 'messenia']),
        F('the', 'Thebes', 'οἱ Θηβαῖοι', 'Pagondas', 'Theban general who beat the Athenians at Delium in 424 BC.', '#c77f1a', ['boeotia', 'phocis']),
        F('kor', 'Corinth', 'οἱ Κορίνθιοι', null, 'Sparta’s richest ally. The sources name several Corinthian commanders but no single leader.', '#6d3fa0', ['corinthus', 'achaea']),
        F('per', 'Persia', 'οἱ Πέρσαι', 'Artaxerxes I', 'Great King 465–424 BC; his satrap Pissuthnes governed from Sardis.', '#8a5a44', ['lydia', 'phrygia', 'caria', 'mysia']),
        F('mak', 'Macedon', 'οἱ Μακεδόνες', 'Perdiccas II', 'King of Macedon c. 448–413 BC; changed sides repeatedly.', '#3f8f4f', ['macedonia']),
        F('thr', 'Thrace', 'οἱ Θρᾷκες', 'Sitalces', 'King of the Odrysian Thracians, an ally of Athens.', '#1f8a70', ['thracia', 'chersonesus'])],
      order: ['lak', 'ath', 'the', 'kor', 'per', 'mak', 'thr'] }
  ];
  // Phrases used by the narration. Kept to short classical patterns.
  var TEXT = {
    la: {
      phases: ['Supplementum', 'Oppugnatio', 'Iter'], phasesEn: ['Reinforcement', 'Assault', 'March'],
      attack: function (f, t) { return f.name + ' ' + t.a + ' ' + (f.s ? 'oppugnat' : 'oppugnant') + '.'; },
      taken: function (t) { return t.n + ' ' + { f: 'capta est', n: 'captum est', m: 'captus est', fp: 'captae sunt', mp: 'capti sunt' }[t.g] + '.'; },
      repelled: 'Hostes repulsi sunt.', reinforce: 'Milites novi veniunt.', out: function (f) { return f.name + ' ' + (f.s ? (f.f ? 'victa est' : 'victus est') : 'victi sunt') + '.'; },
      win: 'Vicisti!', winQuote: 'Veni, vidi, vici.', lose: 'Victus es.', dice: 'Alea iacta est.', diceEn: 'The die is cast.', diceName: 'tesserae', army: 'milites', roll: 'Iace!',
      langName: 'Latin'
    },
    gr: {
      phases: ['Βοήθεια', 'Μάχη', 'Πορεία'], phasesEn: ['Reinforcement', 'Battle', 'March'],
      attack: function (f, t) { return f.name + ' ἐπὶ ' + t.a + ' στρατεύουσιν.'; },
      taken: function (t) { return t.n + ' ' + (t.pl ? 'ἑάλωσαν' : 'ἑάλω') + '.'; },
      repelled: 'οἱ πολέμιοι ἔφυγον.', reinforce: 'στρατιῶται ἥκουσιν.', out: function (f) { return f.name + ' ἡττήθησαν.'; },
      win: 'νενικήκαμεν.', winQuote: '', lose: 'ἡττήθης.', dice: 'ἀνερρίφθω κύβος.', diceEn: 'Let the die be cast.', diceName: 'κύβοι', army: 'στρατιῶται', roll: 'ῥῖψον',
      langName: 'Greek'
    }
  };
  var WORDS = {
    la: [['miles', 'soldier'], ['legio', 'legion'], ['gladius', 'sword'], ['scutum', 'shield'], ['pilum', 'javelin'], ['hasta', 'spear'], ['galea', 'helmet'], ['eques', 'horseman'], ['equus', 'horse'], ['dux', 'leader'],
      ['imperator', 'commander'], ['castra', 'camp'], ['bellum', 'war'], ['pax', 'peace'], ['victoria', 'victory'], ['hostis', 'enemy'], ['socius', 'ally'], ['urbs', 'city'], ['murus', 'wall'], ['porta', 'gate'],
      ['navis', 'ship'], ['classis', 'fleet'], ['mare', 'sea'], ['terra', 'land'], ['flumen', 'river'], ['mons', 'mountain'], ['via', 'road'], ['pons', 'bridge'], ['exercitus', 'army'], ['proelium', 'battle'],
      ['arma', 'weapons'], ['signum', 'standard'], ['aquila', 'eagle'], ['centurio', 'centurion'], ['consul', 'consul'], ['senatus', 'senate'], ['populus', 'people'], ['provincia', 'province'], ['imperium', 'command, empire'], ['oppidum', 'town'],
      ['insula', 'island'], ['portus', 'harbour'], ['rex', 'king'], ['regnum', 'kingdom'], ['praeda', 'plunder'], ['obses', 'hostage'], ['captivus', 'prisoner'], ['cohors', 'cohort'], ['sagitta', 'arrow'], ['arcus', 'bow'],
      ['turris', 'tower'], ['vallum', 'rampart'], ['fossa', 'ditch'], ['agmen', 'marching column'], ['acies', 'battle line'], ['impetus', 'attack'], ['fuga', 'flight'], ['virtus', 'courage'], ['gloria', 'glory'], ['triumphus', 'triumph'],
      ['foedus', 'treaty'], ['frumentum', 'grain'], ['elephantus', 'elephant']],
    gr: [['στρατιώτης', 'soldier'], ['ὁπλίτης', 'hoplite'], ['στρατηγός', 'general'], ['στρατός', 'army'], ['πόλεμος', 'war'], ['εἰρήνη', 'peace'], ['νίκη', 'victory'], ['μάχη', 'battle'], ['ἀσπίς', 'shield'], ['δόρυ', 'spear'],
      ['ξίφος', 'sword'], ['κράνος', 'helmet'], ['θώραξ', 'breastplate'], ['ἵππος', 'horse'], ['ἱππεύς', 'horseman'], ['ναῦς', 'ship'], ['τριήρης', 'trireme'], ['θάλασσα', 'sea'], ['γῆ', 'land'], ['νῆσος', 'island'],
      ['πόλις', 'city'], ['τεῖχος', 'wall'], ['πύλη', 'gate'], ['βασιλεύς', 'king'], ['ἥρως', 'hero'], ['πολέμιος', 'enemy'], ['σύμμαχος', 'ally'], ['φάλαγξ', 'phalanx'], ['τόξον', 'bow'], ['ἅρμα', 'chariot'],
      ['λιμήν', 'harbour'], ['ὄρος', 'mountain'], ['ποταμός', 'river'], ['ὁδός', 'road'], ['στρατόπεδον', 'camp'], ['ἀνδρεία', 'courage'], ['κλέος', 'glory'], ['δῆμος', 'people'], ['ναύτης', 'sailor'], ['κῆρυξ', 'herald'],
      ['σπονδαί', 'truce'], ['φόρος', 'tribute'], ['σῖτος', 'grain'], ['ὅπλα', 'weapons'], ['τοξότης', 'archer'], ['ναύαρχος', 'admiral'], ['ἀκρόπολις', 'citadel'], ['ἀγορά', 'marketplace']]
  };
  W.IMPERIUM = { NAMES: NAMES, REGIONS: REGIONS, SCENARIOS: SCENARIOS, TEXT: TEXT, WORDS: WORDS };
})(window);
