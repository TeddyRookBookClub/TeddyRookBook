/* Word lists for Brain Puzzles. Common, family-friendly English words, chosen by hand.
   W3/W4 feed the word ladders; THEMES feed the anagrams; SENTENCES feed the ciphers and Morse code
   (old public-domain proverbs and lines written for this site). */
(function (root) {
  'use strict';
  var P = root.TRBPuzzles;
  P.W3 = ('ant ape arm art ash ask ate bad bag bat bay bed bee beg bet bib bid big bin bit bow box boy bud bug bun bus but buy ' +
    'cab can cap car cat cob cod cog cot cow cry cub cup cut dad dam day den dew did dig dim dip dog dot dry due dug ear eat egg elf elk elm end eye ' +
    'fan far fed fee few fig fin fir fit fix fly fog for fox fun fur gap gas gem get got gum had ham has hat hay hen her hid him hip his hit hog hop hot how hug hum hut ' +
    'ice ink inn ivy jam jar jaw jet jog jot joy jug keg key kid kin kit lab lad lap law lay led leg let lid lip lit log lot low man map mat may men met mix mom mop mud mug ' +
    'nap net new nod not now nut oak oar oat odd off oil old one orb our out owl own pad pal pan paw pay pea peg pen pet pie pig pin pit pod pop pot pug pup put ' +
    'rag ram ran rap rat raw ray red rib rid rig rim rip rod rot row rub rug run rut sad sag sap sat saw say sea see set sew she shy sip sir sit six ski sky sly sob son sow soy spa spy sub sum sun ' +
    'tab tag tan tap tar tax tea ten the tie tin tip toe ton too top tow toy try tub tug two urn use van vat vet wag was wax way web wed wet who why wig win wit wok won wow yak yam yap yes yet you zap zip zoo').split(' ');
  P.W4 = ('able ache acre aged aide also arch area arts aunt away baby back bake bald ball band bank barn base bath bead beak beam bean bear beat bell belt bend best bike bill bind bird bite blew blue boat body boil bold bolt bone book boot bore born both bowl bulb bull bump burn bush busy ' +
    'cake calf call calm came camp cane cape card care cart case cash cast cave cell chin chip chop city clap claw clay clip club clue coal coat code coil coin cold comb come cone cook cool cope copy cord core corn cost cozy crab crew crib crop crow cube curl cute ' +
    'dare dark dart dash date dawn deal dear deck deep deer desk dial dice dime dine dirt dish dive dock does doll dome done door dose dove down drag draw drew drip drop drum duck dull dune dust duty ' +
    'each earn ease east easy edge else even ever exit face fact fade fail fair fall fame farm fast fawn fear feed feel feet fell felt fern file fill film find fine fire firm fish five flag flap flat flew flip flow foam fold folk fond food fool foot fork form fort four fowl free frog from fuel full fund fuse ' +
    'gain game gate gave gear gift give glad glow glue goal goat gold golf gone good gown grab gray grew grid grin grip grow gulf gull hail hair half hall halt hand hang hard hare harm harp have hawk haze head heal heap hear heat heel held helm help herb herd here hero hide high hike hill hint hive hold hole home hood hook hope horn hose host hour huge hull hump hunt hush ' +
    'idea inch into iron item jade jazz jest join joke jump junk just keen keep kelp kept kick kind king kite knee knew knit knob knot know lace lack lady laid lake lamb lamp land lane last late lawn lead leaf leak lean leap left lend lens less lick lift like lily lime line link lion list live load loaf loan lock loft long look loop lose loss lost loud love luck lump lung lure lush ' +
    'mail main make male mall many mare mark mask mast mate math maze meal mean meat meet melt menu mesh mice mild mile milk mill mind mine mint miss mist mitt mode mold mole monk mood moon moor more moss most moth move much mule must name navy near neat neck need nest news next nice nine none noon nose note oath oats once only open oven over ' +
    'pace pack page paid pail pain pair pale palm pane park part pass past path peak pear peas peck peel peer pick pier pile pine pink pint pipe plan play plot plow plug plum poem poet pole poll pond pony pool poor pork port pose post pour prop pull pump pure push quiz ' +
    'race rack raft rail rain rake ramp rang rank rare rate read real rear reed reef rent rest rice rich ride ring rink ripe rise risk road roam roar robe rock rode role roll roof room root rope rose ruby rule rung rush rust ' +
    'sack safe sage said sail sale salt same sand sang sank save scan seal seam seat seed seek seem seen self sell send sent shed ship shoe shop shot show shut side sift sigh sign silk sing sink site size skip slab sled slid slim slip slot slow snap snow soak soap sock sofa soft soil sold sole some song soon sort soup sour span spin spot star stay stem step stew stir stop such suit sung sunk sure swan swim ' +
    'tack tail take tale talk tall tame tank tape task team tell tend tent term test text than that them then they thin this tide tidy tile till time tiny tire toad told toll tone took tool tore torn toss tour town tram tray tree trim trip trot true tube tuck tuna tune turn twig twin type ' +
    'unit upon used vase vast verb very vest view vine vote wade wage wait wake walk wall wand want warm warn wash wave wavy weak wear weed week well went were west what when whip wide wild will wilt wind wing wink wipe wire wise wish with woke wolf wood wool word wore work worm wrap yard yarn year yell yolk your zero zone zoom').split(' ');
  P.THEMES = {
    Animals: ['tiger', 'zebra', 'mouse', 'rabbit', 'monkey', 'turtle', 'parrot', 'donkey', 'giraffe', 'panda', 'koala', 'camel', 'moose', 'beaver', 'badger', 'kitten', 'puppy', 'lizard', 'dolphin', 'penguin', 'ostrich', 'hamster', 'gorilla', 'leopard', 'chicken', 'goose', 'eagle', 'whale', 'shark', 'squid', 'llama', 'bison', 'raccoon', 'buffalo', 'octopus', 'peacock', 'sparrow', 'walrus', 'squirrel'],
    Foods: ['bread', 'apple', 'lemon', 'mango', 'pasta', 'pizza', 'butter', 'cheese', 'carrot', 'potato', 'tomato', 'banana', 'cherry', 'peanut', 'pickle', 'noodle', 'waffle', 'pancake', 'cookie', 'muffin', 'yogurt', 'cereal', 'grapes', 'melon', 'onion', 'celery', 'raisin', 'pepper', 'walnut', 'almond', 'cabbage', 'spinach', 'pumpkin', 'popcorn', 'biscuit', 'oatmeal', 'sandwich'],
    Nature: ['cloud', 'storm', 'rainbow', 'thunder', 'breeze', 'frost', 'river', 'ocean', 'forest', 'meadow', 'island', 'valley', 'desert', 'canyon', 'pebble', 'flower', 'garden', 'branch', 'sunset', 'planet', 'comet', 'winter', 'summer', 'autumn', 'puddle', 'icicle', 'volcano', 'glacier', 'mountain'],
    School: ['pencil', 'eraser', 'ruler', 'crayon', 'paper', 'marker', 'folder', 'lesson', 'teacher', 'library', 'chalk', 'notebook', 'scissors', 'backpack', 'globe', 'recess', 'spelling', 'history', 'science'],
    Home: ['table', 'chair', 'couch', 'pillow', 'blanket', 'window', 'kettle', 'spoon', 'plate', 'mirror', 'carpet', 'basket', 'candle', 'bucket', 'ladder', 'hammer', 'closet', 'kitchen', 'curtain', 'teapot', 'bathtub', 'doorbell'],
    Music: ['piano', 'guitar', 'violin', 'flute', 'trumpet', 'cello', 'banjo', 'bugle', 'drummer', 'trombone', 'clarinet', 'melody', 'rhythm', 'harmony', 'concert']
  };
  P.SENTENCES = [
    'A STITCH IN TIME SAVES NINE', 'WELL BEGUN IS HALF DONE', 'MANY HANDS MAKE LIGHT WORK', 'THE EARLY BIRD CATCHES THE WORM', 'LOOK BEFORE YOU LEAP',
    'SLOW AND STEADY WINS THE RACE', 'WHERE THERE IS A WILL THERE IS A WAY', 'ACTIONS SPEAK LOUDER THAN WORDS', 'BIRDS OF A FEATHER FLOCK TOGETHER',
    'EVERY CLOUD HAS A SILVER LINING', 'HOME IS WHERE THE HEART IS', 'KNOWLEDGE IS POWER', 'TWO HEADS ARE BETTER THAN ONE', 'ROME WAS NOT BUILT IN A DAY',
    'HONESTY IS THE BEST POLICY', 'A ROLLING STONE GATHERS NO MOSS', 'STILL WATERS RUN DEEP', 'GREAT OAKS FROM LITTLE ACORNS GROW',
    'THE OWL READS BY THE LIGHT OF THE MOON', 'MEET ME BY THE OLD OAK TREE AT NOON', 'THE TREASURE IS UNDER THE RED BRICK', 'BRING A LANTERN AND A WARM COAT',
    'THE CAT IS ASLEEP ON THE PIANO', 'A ROOK MOVES IN STRAIGHT LINES', 'THE GARDEN GATE IS PAINTED GREEN', 'BAKE THE BREAD BEFORE THE SUN GOES DOWN',
    'THE SHIP SAILS AT FIRST LIGHT', 'COUNT THE STARS AND MAKE A WISH', 'THE KEY IS HIDDEN IN THE BLUE JAR', 'PACK A LUNCH FOR THE LONG HIKE',
    'THE FROG JUMPED OVER THE LILY PAD', 'PLANT THE BEANS IN A SUNNY ROW', 'THE LIBRARY OPENS AT NINE', 'FOLLOW THE RIVER TO THE BRIDGE', 'THE PARROT CAN SAY HELLO',
    'FEED THE GOLDFISH ON FRIDAY', 'THE SECRET WORD IS PUMPKIN', 'LOOK FOR THE MAP IN THE ATTIC', 'THE BAND PLAYS IN THE PARK TONIGHT', 'TURN LEFT AT THE BIG RED BARN',
    'THE KITE FLEW HIGHER THAN THE TREES', 'SNOW FELL ALL NIGHT LONG', 'THE BEES ARE BUSY IN THE CLOVER', 'WE WILL MEET AT THE TOP OF THE HILL',
    'THE CASTLE HAS FOUR TALL TOWERS', 'A GOOD BOOK IS A GOOD FRIEND', 'THE PUZZLE BOX OPENS WITH A TWIST', 'SAVE ME A SLICE OF APPLE PIE',
    'THE TRAIN LEAVES AT HALF PAST TWO', 'THE MOON IS FULL TONIGHT', 'HIDE THE NOTE IN THE FLOWER POT', 'THE DOG BURIED A BONE BY THE FENCE',
    'WE SAW A RAINBOW OVER THE LAKE', 'THE CLOCK STRUCK TWELVE', 'KEEP YOUR EYES ON THE NORTH STAR', 'THE BOAT IS TIED TO THE DOCK',
    'GRANDMA MAKES THE BEST SOUP', 'THE SQUIRREL HID ITS ACORNS', 'THE LETTER IS IN THE TOP DRAWER', 'BRAVE KNIGHTS RIDE AT DAWN'
  ];
  P.WORDSHORT = ['CAT', 'DOG', 'SUN', 'HAT', 'BOX', 'MAP', 'OWL', 'FOX', 'KEY', 'CUP', 'BEE', 'SKY', 'TREE', 'FISH', 'STAR', 'BOOK', 'MOON', 'BIRD', 'CAKE', 'KITE', 'BOAT', 'FROG', 'SHIP', 'BELL', 'LAMP', 'ROSE', 'WIND', 'SNOW', 'GOLD', 'NEST'];
})(typeof window !== 'undefined' ? window : globalThis);
