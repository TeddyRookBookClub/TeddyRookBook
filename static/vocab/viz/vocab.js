/* Vocabulary Ladder: the illustration kit and the word model (names prefixed vo-), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ vocab/viz/vocab.css). Vocabulary topic pages always load it,
   practice pages load it with a course (MathLadder.loadCourse), and the flashcard, quiz, word-list and print pages load it
   too. The model and the drawing code also run in node: global.window = global; require('…/vocab.js').
   Vanilla JS, no libraries, no network; every drawing is original SVG made here (as strings, so it works in node and prints).
   Source parts: /tmp/work_vocab/src/*.js (build: /tmp/work_vocab/build.sh). Builders' guide: /tmp/work_vocab/overview.md.

   THE VISUALS
   vo-scene   a memory-hook picture from a scene spec (below). opts: { scene: {…}, caption, quiet }
   vo-word    the word card. opts: { entry: {…} } (a full entry) or { word: 'benevolent' } (an entry already loaded),
              mode: 'card' (default) | 'print' | 'front' (picture side) | 'word' (word side) | 'mini', quiet, speak (false: no 🔊)
   vo-roots   a root tree. opts: { root: 'bene' } | { roots: ['bene', 'mal'] } | { custom: { form, means, kind, lang, words: [{ w, g }] } },
              max (words shown, default 12), words (choose which), quiet
   vo-cloze   a sentence with a blank. opts: { s: 'Her {benevolent} smile…', choices: ['benevolent', …], mode: 'show' | 'pick', why, quiet }
   QUIET MODE (quiet: true, or readout: false), for problems: vo-word hides the word, its respelling and its family and
   blanks it and its forms in the text; vo-scene hides labels that have hide: true and, given the word (opts.word), shows
   the word, its inflections and family forms as "?" in labels, bubbles and signs (sound-alike cues such as SPARE for
   sparse stay; MathLadder.vocab.wordForms / formsRe / hideForms); vo-roots hides the meanings; vo-cloze shows the
   sentence with a blank and lettered choices, with no checking.

   THE SCENE SPEC (the "scene" of a word entry). The picture is 400 x 300; x is 0-100 across; y is 0-100 up from the ground.
   { bg: backdrop, night: true (outdoor scenes at night),
     cast: [{ who, name (a label for the speaker, e.g. 'Ben'), x, y, s (size, 1 = normal), row: 'back' (smaller, farther),
              pose, mood, face: 'left' | 'right' | 'front', flip (mirror), look: 'left' | 'right' | 'up' | 'down',
              wear: [items], holds: prop, hand: 'R' | 'L' | 'both', hsize (size of the held prop), htext (words on it),
              hcolor, seat: prop under a sitting person (default chair; 'none'), color: { top, bottom, dress, shoes, hc },
              age: 'kid' | 'teen' | 'adult' | 'elder' (draw someone younger or older), robe, cape, hat, tie, sash, jacket (colors),
              say | think | shout | whisper: 'words in a bubble' }],
     animals: [{ kind, x, y, s, flip, mood, pose: 'jump' | 'lie' | 'fly' | 'swim', color, say | think | shout | whisper }],
     props: [{ kind, x, y, s, flip, rot (degrees), color, text (signs, banners, books, boxes, screens…), front: true (in front of
              people), back: true, row: 'back', open (book, chest), full (basket), steam (cup, pot), water (bucket), fruit (tree) }],
     fx: [{ kind, on: 'c0' | 'a1' | 'p2' (cast 0, animal 1, prop 2), at: 'head' | 'above' | 'face' | 'hand' | 'body' | 'feet',
            x, y (when not on something), s, dir: 1 | -1, text (boom) }],
     labels: [{ text, x, y, on, at, color, size (pixels 8-26, a scale under 3, or 'small' | 'big'), arrow: false,
               hide: true (hidden in quiet mode) }],
     alt: 'one sentence that describes the picture (for screen readers; required)', cap: 'an optional caption' }
   Names: MathLadder.vocab.NAMES = { backdrops, cast, poses, moods, animals, props, fx, wear, hair, colors, bubbles }.
   MathLadder.vocab.checkScene(spec) lists any problems; scripts/vocab/check-words.js runs it on every entry.

   THE MODEL: MathLadder.vocab
     list() every word of the 1,000 as { n, w, pos, t (topic key), g (gloss), r (root keys), level }; find(word);
     topic(key) and topics() (n, key, id, title, strand, level, words); strands(); ROOT(key) and rootKeys() (prefixes, roots,
     suffixes: { form, kind, means, lang, topic, words, ex }); rootsOf(word); wordsWithRoot(key)
     addEntries({ topicKey: [entries] }) (the generated gen/adv.js calls it), entry(word), entries(topicKey), hasEntries(topicKey)
     mark(s), blank(s), plain(s), form(s): sentences mark the word with braces, "Her {benevolent} smile"; say(respelling) as
     HTML with the stressed syllable in bold; posName(pos); esc(s); cardHTML(entry, o); rootTreeHTML(key, o); hiRoot(word, key)
     sceneSVG(spec, { quiet }) → SVG markup; personSVG, animalSVG, propSVG, backdropSVG, fxSVG (single parts, for galleries)
     gen.topic(id, R, ctx), gen.item(item, R, ctx), gen.root(keys, R, ctx), gen.kinds: problem makers (see 80-gen part)
   The word data: VO.DATA (the list, the topics and the roots table) is written into this file by scripts/vocab/build.js. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var VO = ML.vocab = ML.vocab || {};
  /* =====================================================================================================================
     THE MODEL: MathLadder.vocab (no DOM needed; runs in node for generators and tests)
     ===================================================================================================================== */
  /* @@VOCAB-DATA-START@@ (written by scripts/vocab/build.js from data/vocab/list.json and data/vocab/roots.json; do not edit by hand) */
  VO.DATA = {"strands":["Word Roots","Character","Conduct","Speech","Feelings","Mind","Time and Change","Action","People Together","Things and Amounts"],"topics":[["bene-mal","Good and Bad: bene- and mal-",1,1],["kind-cruel","Kind and Cruel",2,1],["polite-rude","Polite and Rude",3,1],["more-less","Saying More or Less",4,1],["happy","Happy",5,1],["evidence","Evidence and Proof",6,1],["fleeting","Fleeting and Lasting",7,1],["better","Making Things Better",8,1],["agreeing","Agreeing and Disagreeing",9,1],["plenty","Plenty and Scarcity",10,1],["cred-fid-ver","Belief, Trust and Truth: cred, fid and ver",1,2],["honest","Honest and Dishonest",2,2],["eager","Eager and Reluctant",3,2],["praise","Words of Praise",4,2],["sad","Sad",5,2],["belief-doubt","Belief and Doubt",6,2],["changeable","Changeable",7,2],["worse","Making Things Worse",8,2],["laws","Laws and Rules",9,2],["ordinary","Ordinary and Overused",10,2],["spec-vid","Looking and Seeing: spec and vid",1,3],["brave","Brave and Fearful",2,3],["strict","Strict and Lenient",3,3],["blame","Words of Blame",4,3],["angry","Angry and Hateful",5,3],["noticing","Noticing and Understanding",6,3],["how-often","How Often",7,3],["helping","Helping Along",8,3],["who-rules","Who Rules",9,3],["unusual","Unusual",10,3],["loqu-dict","Speaking and Saying: loqu and dict",1,4],["proud","Proud and Humble",2,4],["right-wrong","Right and Wrong",3,4],["arguing","Arguing a Case",4,4],["calm","Calm",5,4],["comparing","Comparing and Contrasting",6,4],["beginnings","Beginnings",7,4],["hindering","Getting in the Way",8,4],["guilt","Guilt and Innocence",9,4],["big-small","Big and Small",10,4],["vert-ject-tract","Turning, Throwing and Pulling: vert, ject and tract",1,5],["careful","Careful and Careless",2,5],["real-fake","Real and Fake",3,5],["tricky-twins","Tricky Twins",4,5],["fear","Fear and Worry",5,5],["learners","Learners and Experts",6,5],["peaks-endings","Peaks and Endings",7,5],["calming","Calming Things Down",8,5],["fighting","Fighting and Making Peace",9,5],["everywhere","Everywhere",10,5],["chron-temp","Words of Time: chron, temp and ann",1,6],["friendly","Friendly and Aloof",2,6],["models","Models and Examples",3,6],["clear-unclear","Clear and Unclear",4,6],["puzzled","Puzzled",5,6],["dreamers","Dreamers and Doers",6,6],["growing","Growing and Shrinking",7,6],["stirring","Stirring Things Up",8,6],["giving-in","Giving In",9,6],["important","Important and Trivial",10,6],["not","Not: in-, im- and ir-",1,7],["stubborn","Stubborn and Yielding",2,7],["self-control","Self-Control and Indulgence",3,7],["joking","Joking and Mocking",4,7],["bored","Bored and Interested",5,7],["arguments","Strong and Weak Arguments",6,7],["before-after","Before and After",7,7],["stopping","Stopping and Holding Back",8,7],["judging-fairly","Judging Fairly",9,7],["hard-easy","Hard and Easy",10,7],["path-phil","Feeling, Loving and Humankind: path, phil and anthrop",1,8],["wise","Wise and Foolish",2,8],["insults","Insults and Slights",3,8],["loud-words","Loud and Angry Words",4,8],["sleepy","Lazy and Sleepy",5,8],["inborn","Inborn and Acquired",6,8],["waiting","Waiting and Hurrying",7,8],["coaxing","Coaxing and Forcing",8,8],["insiders","Insiders and Outsiders",9,8],["too-much","Too Much",10,8],["greg-pac","Flocks, Peace and Pleasing: greg, pac and plac",1,9],["money","Spenders and Savers",2,9],["tricks","Tricks and Schemes",3,9],["slippery","Slippery Speech",4,9],["regret","Regret and Shame",5,9],["obvious","Obvious and Seeming",6,9],["luck","Luck and Chance",7,9],["destroying","Destroying",8,9],["secrets","Secret and Hidden",9,9],["showy","Showy and Plain",10,9],["omni-pan","All, Both, Good and Over: omni, pan, ambi, eu and hyper",1,10],["flatterers","Flatterers and the Bold",2,10],["leanings","Leanings and Likings",3,10],["rare-praise-blame","Rare Words for Praise and Blame",4,10],["not-what-they-seem","Not What They Seem",5,10],["deep","Deep and Shallow Thinking",6,10],["old-new","Old and New",7,10],["taking","Taking and Giving Up",8,10],["rebels","Rebels and Factions",9,10],["harmful","Harmful and Wholesome",10,10]],"words":[["benevolent","adj",0,"kind and wishing good for others","bene"],["benefactor","noun",0,"a person who gives money or help to a person or cause","bene"],["beneficial","adj",0,"helpful; producing good results","bene"],["benign","adj",0,"gentle and kind; also, not harmful","bene"],["beneficiary","noun",0,"a person who receives a benefit, such as money left in a will","bene"],["malevolent","adj",0,"wishing harm to others","mal"],["malicious","adj",0,"meaning to hurt someone on purpose","mal","ous"],["malady","noun",0,"an illness, or a deep-rooted problem","mal"],["malign","verb",0,"to say harmful and untrue things about someone","mal"],["malcontent","noun",0,"a person who is always dissatisfied and complaining","mal"],["compassionate","adj",1,"feeling for others' suffering and wanting to help","con"],["considerate","adj",1,"careful not to hurt or bother others"],["altruistic","adj",1,"helping others with no thought of reward","ic"],["humane","adj",1,"kind and merciful; causing no needless suffering"],["magnanimous","adj",1,"generous and forgiving, especially toward a rival","ous"],["solicitous","adj",1,"showing eager care and concern for someone","ous"],["callous","adj",1,"unfeeling toward others' pain","ous"],["ruthless","adj",1,"having no pity"],["vindictive","adj",1,"wanting revenge","ive"],["spiteful","adj",1,"wanting to hurt or annoy someone out of petty ill will"],["courteous","adj",2,"polite and respectful","ous"],["tactful","adj",2,"careful to say things without hurting feelings"],["discreet","adj",2,"careful in speech or action, especially in keeping things private","dis"],["urbane","adj",2,"polished, courteous and at ease in society"],["suave","adj",2,"charming and smooth in manner"],["boorish","adj",2,"rough and bad-mannered"],["brusque","adj",2,"abrupt in speech or manner"],["curt","adj",2,"rudely brief"],["uncouth","adj",2,"lacking good manners or refinement","un"],["churlish","adj",2,"rude and mean-spirited"],["concise","adj",3,"giving much information in few words","con"],["succinct","adj",3,"briefly and clearly expressed"],["terse","adj",3,"brief, sometimes to the point of rudeness"],["laconic","adj",3,"using very few words","ic"],["pithy","adj",3,"short and full of meaning"],["brevity","noun",3,"shortness of time or of words","ity"],["verbose","adj",3,"using more words than needed"],["garrulous","adj",3,"talking too much, especially about unimportant things","ous"],["taciturn","adj",3,"habitually quiet; saying little"],["voluble","adj",3,"talking easily, quickly and at length"],["elated","adj",4,"extremely happy and excited"],["jubilant","adj",4,"joyful because of success"],["ecstatic","adj",4,"overwhelmingly happy","ic"],["euphoric","adj",4,"intensely happy and excited","eu","ic"],["buoyant","adj",4,"cheerful and optimistic; also, able to float"],["blithe","adj",4,"cheerful and carefree, sometimes too carefree"],["ebullient","adj",4,"bubbling over with cheerful energy"],["exuberant","adj",4,"full of energy and joy","ex"],["mirth","noun",4,"laughter and amusement"],["sanguine","adj",4,"hopeful and confident about the future"],["empirical","adj",5,"based on observation or experiment","ic"],["anecdotal","adj",5,"based on personal stories rather than careful study","a-not"],["corroborate","verb",5,"to confirm with more evidence","con","ate"],["substantiate","verb",5,"to support with proof","sub","ate"],["validate","verb",5,"to check or prove that something is sound","ate"],["conclusive","adj",5,"settling a question beyond doubt","con","clud","ive"],["premise","noun",5,"a statement assumed true and used to reason toward a conclusion","pre","mit"],["deduce","verb",5,"to reach a conclusion by reasoning","de","duc"],["extrapolate","verb",5,"to extend known facts to predict the unknown","extra","ate"],["hypothesis","noun",5,"a proposed explanation to be tested","hypo"],["ephemeral","adj",6,"lasting a very short time"],["transient","adj",6,"lasting only a short time; passing through","trans"],["fleeting","adj",6,"passing quickly"],["transitory","adj",6,"not permanent","trans"],["evanescent","adj",6,"quickly fading away","ex"],["enduring","adj",6,"lasting a long time"],["perpetual","adj",6,"never ending or changing","per"],["indelible","adj",6,"impossible to remove or forget","in-not","ible"],["mutable","adj",6,"able to change","ible"],["immutable","adj",6,"unchanging","in-not","ible"],["ameliorate","verb",7,"to make a bad situation better","ate"],["alleviate","verb",7,"to make pain or trouble easier to bear","ad","lev","ate"],["mitigate","verb",7,"to make less severe","ate"],["remedy","verb",7,"to fix or correct"],["rectify","verb",7,"to put right","ify"],["enhance","verb",7,"to improve the quality or value of"],["bolster","verb",7,"to support or strengthen"],["rejuvenate","verb",7,"to make young or fresh again","re","ate"],["revive","verb",7,"to bring back to life or use","re","viv"],["refine","verb",7,"to improve by small changes; to purify"],["consensus","noun",8,"general agreement","con","sent"],["unanimous","adj",8,"fully agreed by everyone","uni","ous"],["concur","verb",8,"to agree","con","cur"],["accord","noun",8,"agreement; harmony","ad","cord"],["coalesce","verb",8,"to come together to form one whole","con"],["dissent","noun",8,"disagreement with an official or common view","dis","sent"],["discord","noun",8,"disagreement; lack of harmony","dis","cord"],["acrimonious","adj",8,"angry and bitter in tone","ous"],["divisive","adj",8,"causing disagreement or division","ive"],["controversy","noun",8,"a long public disagreement","contra","vert"],["abundant","adj",9,"existing in large amounts"],["copious","adj",9,"plentiful","ous"],["myriad","adj",9,"countless; very many"],["plethora","noun",9,"an excess; too many"],["profuse","adj",9,"plentiful; pouring out","pro","fund"],["sparse","adj",9,"thinly scattered"],["scant","adj",9,"barely enough"],["meager","adj",9,"lacking in quantity or quality"],["dearth","noun",9,"a lack or shortage"],["paucity","noun",9,"a small amount; scarcity","ity"],["credible","adj",10,"believable; worthy of trust","cred","ible"],["incredulous","adj",10,"unwilling or unable to believe something","in-not","cred","ous"],["credulous","adj",10,"too ready to believe things; easily fooled","cred","ous"],["credence","noun",10,"belief or acceptance that something is true","cred","ance"],["fidelity","noun",10,"faithfulness and loyalty; also, accuracy","fid","ity"],["confidant","noun",10,"a trusted friend you can share secrets with","con","fid"],["diffident","adj",10,"shy and lacking confidence in oneself","dis","fid"],["veracity","noun",10,"truthfulness; accuracy","ver","ity"],["verify","verb",10,"to check that something is true","ver","ify"],["verdict","noun",10,"a decision or judgment, especially a jury's","dict","ver"],["candid","adj",11,"open and honest in what one says"],["frank","adj",11,"direct and honest, even when it is uncomfortable"],["sincere","adj",11,"meaning what one says; free of pretense"],["forthright","adj",11,"direct and outspoken"],["integrity","noun",11,"the quality of being honest and having strong moral principles","ity"],["deceitful","adj",11,"trying to make others believe what is false"],["devious","adj",11,"sly and tricky in getting one's way","de","ous"],["duplicitous","adj",11,"deceitful; saying one thing and doing another","ous"],["disingenuous","adj",11,"pretending to know less, or to be more sincere, than one is","dis","ous"],["guileless","adj",11,"innocent and without tricks"],["zealous","adj",12,"full of eager devotion to a cause","ous"],["ardent","adj",12,"passionate and enthusiastic"],["fervent","adj",12,"showing strong, warm feeling"],["avid","adj",12,"very eager and enthusiastic"],["keen","adj",12,"eager; also, sharp"],["alacrity","noun",12,"cheerful readiness and speed","ity"],["reluctant","adj",12,"unwilling and hesitant"],["loath","adj",12,"unwilling"],["averse","adj",12,"strongly opposed or unwilling","vert"],["grudging","adj",12,"given or done unwillingly"],["commend","verb",13,"to praise formally","con","mand"],["acclaim","noun",13,"enthusiastic public praise"],["laud","verb",13,"to praise highly"],["extol","verb",13,"to praise enthusiastically","ex"],["accolade","noun",13,"an award or expression of praise","ad"],["tribute","noun",13,"an act or gift that shows respect or admiration"],["revere","verb",13,"to feel deep respect for","re"],["venerate","verb",13,"to regard with deep respect, often for age or wisdom","ate"],["exalt","verb",13,"to raise high in rank or praise","ex"],["adulation","noun",13,"excessive praise or admiration","tion"],["melancholy","noun",14,"a deep, lasting sadness"],["somber","adj",14,"dark and gloomy; serious"],["despondent","adj",14,"in low spirits from loss of hope","de"],["forlorn","adj",14,"sad and lonely; abandoned"],["morose","adj",14,"sullen and gloomy"],["poignant","adj",14,"deeply moving, causing sadness or regret"],["crestfallen","adj",14,"disappointed and downcast"],["disconsolate","adj",14,"so sad that nothing comforts","dis"],["wistful","adj",14,"sadly longing for something past or out of reach"],["lugubrious","adj",14,"mournful, often exaggeratedly so","ous"],["skeptical","adj",15,"doubting; not easily convinced","ic"],["dubious","adj",15,"doubtful; also, possibly dishonest","ous"],["plausible","adj",15,"seeming reasonable or likely","ible"],["conviction","noun",15,"a firmly held belief; also, a guilty verdict","con","tion"],["tenet","noun",15,"a principle held as true by a group","ten"],["dogmatic","adj",15,"insisting one's opinions are true without considering evidence","ic"],["presume","verb",15,"to suppose without proof","pre"],["speculate","verb",15,"to form a theory without firm evidence","ate"],["fallacy","noun",15,"a mistaken belief or a flaw in reasoning"],["cynical","adj",15,"believing people act only out of self-interest","ic"],["capricious","adj",16,"changing suddenly without reason","ous"],["fickle","adj",16,"changing loyalties or feelings often"],["erratic","adj",16,"not regular or predictable","ic"],["volatile","adj",16,"likely to change suddenly, often for the worse"],["mercurial","adj",16,"subject to sudden changes of mood"],["impulsive","adj",16,"acting without thinking first","ive"],["impetuous","adj",16,"acting quickly and without thought","ous"],["spontaneous","adj",16,"happening naturally, without planning","ous"],["vacillate","verb",16,"to waver between choices","ate"],["fluctuate","verb",16,"to rise and fall irregularly","ate"],["exacerbate","verb",17,"to make a problem worse","ex","ate"],["aggravate","verb",17,"to make worse; also, to annoy","ad","grav","ate"],["undermine","verb",17,"to weaken gradually or secretly"],["erode","verb",17,"to wear away slowly"],["deteriorate","verb",17,"to become worse","ate"],["debilitate","verb",17,"to weaken severely","ate"],["impair","verb",17,"to damage or weaken"],["jeopardize","verb",17,"to put in danger","ize"],["sabotage","verb",17,"to damage on purpose"],["compound","verb",17,"to make a problem worse by adding to it"],["enact","verb",18,"to make into law"],["statute","noun",18,"a written law"],["mandate","noun",18,"an official order; also, authority given by voters","mand"],["decree","noun",18,"an official order"],["ratify","verb",18,"to formally approve","ify"],["veto","noun",18,"the power to reject a decision or law"],["abolish","verb",18,"to end officially"],["repeal","verb",18,"to cancel a law"],["rescind","verb",18,"to take back or cancel","re"],["nullify","verb",18,"to make legally void","ify"],["mundane","adj",19,"ordinary and dull"],["commonplace","adj",19,"ordinary; not unusual"],["conventional","adj",19,"following what is usually done","con"],["banal","adj",19,"dull because overused"],["trite","adj",19,"used too often to be interesting"],["hackneyed","adj",19,"overused and unoriginal"],["cliché","noun",19,"an overused phrase or idea"],["platitude","noun",19,"a dull remark said as if it were new"],["prosaic","adj",19,"dull and unimaginative","ic"],["pedestrian","adj",19,"ordinary and dull","ped"],["circumspect","adj",20,"careful to consider all risks before acting","circum","spec"],["introspective","adj",20,"looking inward at one's own thoughts and feelings","intro","spec","ive"],["retrospect","noun",20,"a look back at the past","re","spec"],["conspicuous","adj",20,"easy to see or notice; standing out","con","spec","ous"],["auspicious","adj",20,"showing signs of future success; favorable","spec","ous"],["specious","adj",20,"seeming true or right at first but actually false","spec","ous"],["perspicacious","adj",20,"quick to notice and understand things","per","spec","ous"],["provident","adj",20,"planning wisely for the future","pro","vid"],["envision","verb",20,"to picture something in the mind, especially a future possibility","in-into","vid"],["visage","noun",20,"a person's face or expression","vid"],["valiant","adj",21,"brave and determined"],["intrepid","adj",21,"fearless; adventurous"],["audacious","adj",21,"daring and bold, sometimes rudely so","ous"],["dauntless","adj",21,"not discouraged by danger or difficulty"],["plucky","adj",21,"brave and spirited, especially against the odds"],["timid","adj",21,"easily frightened; shy"],["timorous","adj",21,"fearful and nervous","ous"],["apprehensive","adj",21,"anxious that something bad may happen","ad","ive"],["trepidation","noun",21,"nervous fear about something to come","tion"],["craven","adj",21,"cowardly"],["stringent","adj",22,"strict and precise about rules or standards"],["rigorous","adj",22,"extremely thorough and careful","ous"],["exacting","adj",22,"demanding great effort or skill","ex"],["stern","adj",22,"serious and strict"],["draconian","adj",22,"excessively harsh and severe"],["lenient","adj",22,"more merciful or tolerant than expected"],["indulgent","adj",22,"allowing others to have what they want; not strict"],["permissive","adj",22,"allowing a great deal of freedom","ive"],["lax","adj",22,"not strict or careful enough"],["forbearance","noun",22,"patient self-control; holding back from punishing","ance"],["censure","verb",23,"to express strong formal disapproval"],["rebuke","verb",23,"to scold sharply"],["reproach","verb",23,"to express disappointment or disapproval to someone"],["admonish","verb",23,"to warn or scold gently but firmly"],["reprimand","verb",23,"to scold formally, often by someone in charge","re"],["chastise","verb",23,"to scold or punish severely"],["berate","verb",23,"to scold angrily and at length"],["deride","verb",23,"to mock and make fun of","de"],["disparage","verb",23,"to speak of as unimportant or of little worth"],["denounce","verb",23,"to publicly declare to be wrong or evil","de","nounce"],["indignant","adj",24,"angry at something unfair"],["irate","adj",24,"very angry"],["livid","adj",24,"furious; also, bluish-gray in color"],["irascible","adj",24,"easily angered","ible"],["petulant","adj",24,"childishly sulky and bad-tempered"],["vex","verb",24,"to annoy or frustrate"],["wrath","noun",24,"extreme anger"],["rancor","noun",24,"bitter, long-lasting resentment"],["animosity","noun",24,"strong hostility","ity"],["enmity","noun",24,"deep-seated hatred between enemies","ity"],["perceive","verb",25,"to become aware of through the senses or the mind"],["discern","verb",25,"to notice or tell apart, often with effort","dis"],["fathom","verb",25,"to understand after much thought"],["glean","verb",25,"to gather information bit by bit"],["cognizant","adj",25,"aware; having knowledge of","con"],["vigilant","adj",25,"watchful for danger or trouble"],["wary","adj",25,"cautious about possible dangers"],["oblivious","adj",25,"unaware of what is happening","ous"],["heedless","adj",25,"paying no attention; careless"],["subtle","adj",25,"so slight or delicate it is hard to notice"],["sporadic","adj",26,"happening now and then, irregularly","ic"],["intermittent","adj",26,"stopping and starting","inter","mit"],["incessant","adj",26,"never stopping","in-not","ced"],["habitual","adj",26,"done regularly, as a habit"],["periodic","adj",26,"happening at regular intervals","ic"],["recurrent","adj",26,"happening again and again","re","cur"],["continual","adj",26,"happening often, with breaks"],["continuous","adj",26,"going on without any break","ous"],["persistent","adj",26,"continuing firmly in spite of difficulty","per"],["unremitting","adj",26,"never relaxing or slackening","un","mit"],["facilitate","verb",27,"to make easier","ate"],["expedite","verb",27,"to speed up","ex","ped"],["foster","verb",27,"to encourage growth or development"],["nurture","verb",27,"to care for and help grow"],["cultivate","verb",27,"to develop by care and effort","ate"],["champion","verb",27,"to fight for or defend a cause"],["endorse","verb",27,"to publicly approve or support"],["sustain","verb",27,"to keep going; to support","sub","ten"],["abet","verb",27,"to help or encourage, especially in wrongdoing"],["galvanize","verb",27,"to shock or excite into action","ize"],["sovereign","adj",28,"having supreme power; independent"],["autonomy","noun",28,"self-government; independence","auto"],["autocrat","noun",28,"a ruler with total power","auto","cracy"],["despot","noun",28,"a ruler who uses power cruelly"],["tyranny","noun",28,"cruel and unjust rule"],["hegemony","noun",28,"dominance of one group or nation over others"],["bureaucracy","noun",28,"government by many officials and rules","cracy"],["hierarchy","noun",28,"a system ranking people or things one above another","archy"],["oligarchy","noun",28,"rule by a small group","archy"],["anarchy","noun",28,"absence of government; disorder","a-not","archy"],["peculiar","adj",29,"strange; also, belonging only to one person or place"],["eccentric","adj",29,"unusual in behavior; slightly strange","ic"],["bizarre","adj",29,"very strange"],["outlandish","adj",29,"strikingly odd"],["unorthodox","adj",29,"not following usual practices","un"],["incongruous","adj",29,"out of place; not fitting in","in-not","ous"],["anomaly","noun",29,"something that departs from what is normal","a-not"],["aberration","noun",29,"a departure from what is normal or right","ab","tion"],["idiosyncrasy","noun",29,"a personal peculiarity"],["unprecedented","adj",29,"never done or known before","un"],["eloquent","adj",30,"speaking or writing in a fluent, moving way","ex","loqu"],["loquacious","adj",30,"very talkative","loqu","ous"],["colloquial","adj",30,"used in ordinary, informal conversation","con","loqu"],["soliloquy","noun",30,"a speech in a play in which a character speaks thoughts aloud alone","loqu"],["circumlocution","noun",30,"using many words to avoid saying something directly","circum","loqu","tion"],["elocution","noun",30,"the skill of clear, expressive speaking","ex","loqu","tion"],["diction","noun",30,"the choice of words; also, how clearly words are spoken","dict","tion"],["edict","noun",30,"an official order from an authority","ex","dict"],["indict","verb",30,"to formally charge someone with a crime","in-into","dict"],["interlocutor","noun",30,"a person taking part in a conversation","inter","loqu"],["arrogant","adj",31,"having an exaggerated sense of one's own importance","ad"],["haughty","adj",31,"proud in a way that looks down on others"],["condescending","adj",31,"acting as though others are less important or less smart","con"],["pompous","adj",31,"self-important and showy in speech or manner","ous"],["imperious","adj",31,"commanding and expecting to be obeyed","ous"],["supercilious","adj",31,"scornfully superior; looking down one's nose","super","ous"],["hubris","noun",31,"excessive pride that leads to a downfall"],["modest","adj",31,"not boasting about one's abilities or achievements"],["unassuming","adj",31,"not drawing attention to oneself","un"],["self-effacing","adj",31,"keeping oneself in the background; humble"],["ethical","adj",32,"morally right; following principles of right conduct","ic"],["virtuous","adj",32,"having high moral standards","ous"],["propriety","noun",32,"correct and proper behavior","ity"],["decorum","noun",32,"polite, dignified behavior suited to the occasion"],["probity","noun",32,"complete honesty and integrity","ity"],["rectitude","noun",32,"moral uprightness"],["corrupt","adj",32,"dishonest, especially for money or power"],["venal","adj",32,"willing to be bribed"],["nefarious","adj",32,"wicked or criminal","ous"],["reprehensible","adj",32,"deserving blame","re","ible"],["rhetoric","noun",33,"the art of persuasive speaking or writing; also, showy language without substance"],["assert","verb",33,"to state firmly","ad"],["contend","verb",33,"to argue or claim; also, to compete","con"],["allege","verb",33,"to claim without proof"],["refute","verb",33,"to prove a claim wrong"],["rebut","verb",33,"to argue against a claim"],["concede","verb",33,"to admit that something is true, often reluctantly","con","ced"],["advocate","verb",33,"to speak in favor of","ad","voc","ate"],["exhort","verb",33,"to urge strongly","ex"],["polemic","noun",33,"a strong written or spoken attack on an idea"],["serene","adj",34,"calm and peaceful"],["tranquil","adj",34,"free from disturbance"],["composed","adj",34,"having one's feelings under control"],["nonchalant","adj",34,"casually calm and unconcerned","non"],["unflappable","adj",34,"staying calm in a crisis","un","ible"],["stoic","adj",34,"enduring pain or hardship without complaint","ic"],["impassive","adj",34,"showing no emotion","in-not","ive"],["equanimity","noun",34,"evenness of temper, especially under stress","ity"],["imperturbable","adj",34,"unable to be upset","in-not","ible"],["phlegmatic","adj",34,"calm and slow to show emotion","ic"],["analogy","noun",35,"a comparison that explains one thing by its likeness to another","log"],["akin","adj",35,"similar or related"],["kindred","adj",35,"similar in nature"],["disparate","adj",35,"so different that they can hardly be compared","dis"],["discrepancy","noun",35,"a difference between things that should match","dis","ance"],["juxtapose","verb",35,"to place side by side for comparison"],["dichotomy","noun",35,"a division into two opposite parts","di"],["antithesis","noun",35,"the direct opposite","anti"],["nuance","noun",35,"a subtle difference in meaning or feeling","ance"],["paradox","noun",35,"a statement that seems to contradict itself but may be true"],["commence","verb",36,"to begin"],["initiate","verb",36,"to start; also, to admit someone into a group","ate"],["inaugurate","verb",36,"to begin formally; to install in office","ate"],["inception","noun",36,"the beginning of something","tion"],["genesis","noun",36,"the origin or coming into being","gen"],["onset","noun",36,"the beginning, especially of something unpleasant"],["nascent","adj",36,"just beginning to exist"],["incipient","adj",36,"beginning to happen or develop"],["fledgling","adj",36,"new and inexperienced"],["rudimentary","adj",36,"basic; in an early stage"],["hinder","verb",37,"to get in the way of"],["hamper","verb",37,"to slow down or block progress"],["impede","verb",37,"to delay or block","in-into","ped"],["obstruct","verb",37,"to block","ob"],["thwart","verb",37,"to stop someone from doing what they plan"],["inhibit","verb",37,"to hold back or restrain","in-into"],["encumber","verb",37,"to burden or weigh down","in-into"],["stymie","verb",37,"to block completely"],["preclude","verb",37,"to make impossible in advance","pre","clud"],["forestall","verb",37,"to prevent by acting first"],["accountable","adj",38,"required to explain one's actions; responsible","ible"],["culpable","adj",38,"deserving blame","ible"],["exculpate","verb",38,"to show to be not guilty","ex","ate"],["exonerate","verb",38,"to clear from blame","ex","ate"],["acquit","verb",38,"to declare not guilty"],["absolve","verb",38,"to free from guilt or blame","ab"],["vindicate","verb",38,"to clear from blame; to prove right","ate"],["condone","verb",38,"to accept or allow wrongdoing","con"],["punitive","adj",38,"meant as punishment","ive"],["clemency","noun",38,"mercy, especially in punishing","ance"],["immense","adj",39,"extremely large"],["colossal","adj",39,"enormous"],["monumental","adj",39,"very great in size or importance"],["prodigious","adj",39,"remarkably large or impressive","ous"],["gargantuan","adj",39,"enormous"],["minute","adj",39,"extremely small"],["minuscule","adj",39,"extremely small"],["diminutive","adj",39,"very small","ive"],["infinitesimal","adj",39,"too small to measure","in-not"],["negligible","adj",39,"so small it can be ignored","ible"],["avert","verb",40,"to turn away; to prevent something bad from happening","vert"],["adverse","adj",40,"harmful or unfavorable","ad","vert"],["versatile","adj",40,"able to do many different things well","vert"],["inadvertent","adj",40,"done by accident, without meaning to","in-not","vert"],["subvert","verb",40,"to secretly undermine or overturn something established","sub","vert"],["conjecture","noun",40,"a guess made without full evidence","con","ject"],["dejected","adj",40,"sad and discouraged","de","ject"],["interject","verb",40,"to break in with a remark","inter","ject"],["intractable","adj",40,"hard to manage, control or solve","in-not","tract","ible"],["protracted","adj",40,"lasting longer than expected or usual","pro","tract"],["meticulous","adj",41,"showing great attention to detail","ous"],["scrupulous","adj",41,"very careful to do what is right or exact","ous"],["diligent","adj",41,"hardworking and careful"],["assiduous","adj",41,"showing great care and steady effort","ad","ous"],["fastidious","adj",41,"very attentive to detail and hard to please","ous"],["punctilious","adj",41,"very careful about correct behavior and details","ous"],["negligent","adj",41,"failing to take proper care"],["remiss","adj",41,"careless about one's duties","re","mit"],["cursory","adj",41,"hasty and not thorough","cur"],["perfunctory","adj",41,"done only as a routine, with little care or interest","per"],["authentic","adj",42,"real and true to its origin","ic"],["bona fide","adj",42,"real; made or done in good faith"],["legitimate","adj",42,"lawful; also, reasonable and justifiable"],["veritable","adj",42,"truly deserving the name","ver","ible"],["spurious","adj",42,"false; not what it claims to be","ous"],["bogus","adj",42,"fake"],["counterfeit","adj",42,"made to look real in order to deceive","contra"],["apocryphal","adj",42,"widely told but probably not true"],["fictitious","adj",42,"invented; not real","ous"],["mendacious","adj",42,"lying; untruthful","ous"],["affect","verb",43,"to have an influence on"],["effect","noun",43,"a result or outcome"],["imply","verb",43,"to suggest without saying directly"],["infer","verb",43,"to reach a conclusion from evidence or hints","fer"],["elicit","verb",43,"to draw out a response","ex"],["illicit","adj",43,"not allowed by law or custom"],["ingenious","adj",43,"clever and inventive","gen","ous"],["ingenuous","adj",43,"innocent and trusting; frank","gen","ous"],["eminent","adj",43,"famous and respected","ex"],["imminent","adj",43,"about to happen"],["dread","noun",44,"great fear of something to come"],["qualm","noun",44,"a sudden uneasy feeling, especially a doubt about doing right"],["misgiving","noun",44,"a feeling of doubt or worry","mis"],["unnerve","verb",44,"to make someone lose courage or confidence"],["daunt","verb",44,"to make someone feel discouraged or afraid"],["intimidate","verb",44,"to frighten someone into doing what one wants","ate"],["foreboding","noun",44,"a feeling that something bad will happen"],["phobia","noun",44,"an intense, often unreasonable fear"],["consternation","noun",44,"anxious dismay or alarm","con","tion"],["perturb","verb",44,"to make anxious or upset","per"],["erudite","adj",45,"having great knowledge from study"],["pedantic","adj",45,"overly concerned with small details and rules of learning","ic"],["didactic","adj",45,"intended to teach, sometimes in a preachy way","ic"],["connoisseur","noun",45,"an expert judge in matters of taste"],["dilettante","noun",45,"a person who dabbles in a subject without serious study"],["novice","noun",45,"a beginner","nov"],["prodigy","noun",45,"a young person with exceptional talent"],["precocious","adj",45,"developed or advanced at an unusually early age","pre","ous"],["polymath","noun",45,"a person with expert knowledge of many subjects","poly"],["virtuoso","noun",45,"a person with outstanding skill, especially in music"],["culminate","verb",46,"to reach the highest point or final stage","ate"],["terminate","verb",46,"to bring to an end","ate"],["cessation","noun",46,"a stop; an end","ced","tion"],["demise","noun",46,"death, or the end of something","mit"],["obsolete","adj",46,"no longer used; out of date"],["defunct","adj",46,"no longer existing or working","de"],["zenith","noun",46,"the highest point"],["apex","noun",46,"the top or peak"],["pinnacle","noun",46,"the highest point of success"],["nadir","noun",46,"the lowest point"],["soothe","verb",47,"to calm or comfort"],["console","verb",47,"to comfort in sorrow","con"],["appease","verb",47,"to calm someone by giving them what they want","pac"],["mollify","verb",47,"to soften someone's anger","ify"],["assuage","verb",47,"to make an unpleasant feeling less intense","ad"],["allay","verb",47,"to lessen fear or worry"],["quell","verb",47,"to put an end to, often by force"],["conciliate","verb",47,"to win over from anger; to make peace","con","ate"],["reconcile","verb",47,"to restore friendly relations; to make agree","re"],["defuse","verb",47,"to make a situation less tense"],["hostile","adj",48,"unfriendly; ready to fight"],["belligerent","adj",48,"hostile and aggressive","bell"],["bellicose","adj",48,"eager to fight","bell"],["pugnacious","adj",48,"quick to argue or fight","ous"],["truculent","adj",48,"eager to argue or fight; defiant"],["adversary","noun",48,"an opponent","ad","vert"],["militant","adj",48,"aggressively active for a cause"],["truce","noun",48,"an agreement to stop fighting for a time"],["armistice","noun",48,"an agreement to end the fighting in a war"],["diplomacy","noun",48,"managing relations between nations; tact"],["ubiquitous","adj",49,"found everywhere","ous"],["pervasive","adj",49,"spreading through every part","per","ive"],["prevalent","adj",49,"widespread; common","pre"],["rampant","adj",49,"spreading without control"],["predominant","adj",49,"most common or strongest","pre"],["universal","adj",49,"applying to all","uni","vert"],["endemic","adj",49,"regularly found in a particular place or group","ic"],["permeate","verb",49,"to spread through","per","ate"],["saturate","verb",49,"to soak completely; to fill to capacity","ate"],["diffuse","verb",49,"to spread out","dis","fund"],["chronic","adj",50,"lasting a long time or coming back again and again","chron","ic"],["chronicle","noun",50,"a record of events in the order they happened","chron"],["chronological","adj",50,"arranged in order of time","chron","log","ic"],["anachronism","noun",50,"something placed in the wrong time period","chron","ism"],["synchronize","verb",50,"to make things happen at the same time","syn","chron","ize"],["contemporary","adj",50,"living or happening at the same time; also, modern","con","temp"],["temporal","adj",50,"having to do with time","temp"],["extemporaneous","adj",50,"spoken or done without preparation","ex","temp","ous"],["perennial","adj",50,"lasting or returning year after year","per","ann"],["annals","noun",50,"a year-by-year record of events; history","ann"],["amiable","adj",51,"friendly and pleasant","am","ible"],["affable","adj",51,"easy to talk to; good-natured","ad","ible"],["genial","adj",51,"friendly and cheerful","gen"],["jovial","adj",51,"cheerful and full of good humor"],["convivial","adj",51,"friendly and lively; fond of good company","con","viv"],["amicable","adj",51,"friendly and without quarrels","am","ible"],["charismatic","adj",51,"having a charm that draws people in","ic"],["aloof","adj",51,"distant and not friendly"],["reticent","adj",51,"not revealing one's thoughts or feelings readily","re"],["reclusive","adj",51,"avoiding the company of others","re","clud","ive"],["paradigm","noun",52,"a typical example or model; a pattern of thinking"],["paragon","noun",52,"a model of excellence"],["epitome","noun",52,"a perfect example of a quality or type"],["archetype","noun",52,"an original model; a classic example of a type"],["prototype","noun",52,"a first, trial version of something"],["exemplar","noun",52,"a person or thing serving as a model"],["quintessential","adj",52,"being the most perfect example"],["emulate","verb",52,"to imitate in order to equal or surpass","ate"],["typify","verb",52,"to be a typical example of","ify"],["benchmark","noun",52,"a standard for comparison"],["lucid","adj",53,"clear and easy to understand","luc"],["coherent","adj",53,"logical and consistent","con"],["explicit","adj",53,"stated clearly and in detail"],["implicit","adj",53,"suggested but not directly stated"],["incisive","adj",53,"sharp and direct; going to the heart of the matter","ive"],["elucidate","verb",53,"to make clear; to explain","ex","luc","ate"],["opaque","adj",53,"hard to understand; also, not letting light through"],["obscure","adj",53,"not clear; also, not well known"],["nebulous","adj",53,"vague and unclear in form or meaning","ous"],["convoluted","adj",53,"extremely complicated and hard to follow","con"],["perplex","verb",54,"to confuse and trouble"],["baffle","verb",54,"to completely confuse"],["bewilder","verb",54,"to confuse thoroughly"],["confound","verb",54,"to confuse; also, to prove wrong","con","fund"],["befuddle","verb",54,"to muddle and confuse"],["flummox","verb",54,"to bewilder completely"],["conundrum","noun",54,"a confusing and difficult problem"],["quandary","noun",54,"a state of not knowing what to do"],["dilemma","noun",54,"a hard choice between two options"],["enigma","noun",54,"a person or thing that is mysterious"],["idealistic","adj",55,"guided by ideals rather than practical concerns","ic"],["visionary","adj",55,"thinking about the future with imagination"],["utopian","adj",55,"aiming for a perfect society; unrealistically ideal"],["quixotic","adj",55,"hopelessly idealistic and impractical","ic"],["whimsical","adj",55,"playfully fanciful","ic"],["fanciful","adj",55,"imaginative but unrealistic"],["reverie","noun",55,"a daydream"],["pragmatic","adj",55,"dealing with things sensibly and practically","ic"],["feasible","adj",55,"possible to do","ible"],["viable","adj",55,"able to work or succeed","ible"],["flourish","verb",56,"to grow well; to thrive"],["thrive","verb",56,"to grow strong and healthy"],["burgeon","verb",56,"to grow or expand quickly"],["proliferate","verb",56,"to increase rapidly in number","ate"],["wane","verb",56,"to decrease gradually"],["dwindle","verb",56,"to grow smaller little by little"],["ebb","verb",56,"to flow back; to decline"],["abate","verb",56,"to become less intense"],["subside","verb",56,"to become less strong; to sink lower","sub"],["atrophy","verb",56,"to waste away from lack of use","a-not"],["provoke","verb",57,"to stir up a reaction, often anger","pro","voc"],["incite","verb",57,"to urge on, especially to violence or trouble","in-into"],["instigate","verb",57,"to start or bring about","ate"],["foment","verb",57,"to stir up trouble"],["goad","verb",57,"to drive or provoke into action"],["spur","verb",57,"to urge on"],["rouse","verb",57,"to wake or stir up"],["stoke","verb",57,"to add fuel to; to stir up feelings"],["agitate","verb",57,"to stir up; to make anxious","ate"],["engender","verb",57,"to cause or give rise to","in-into","gen"],["comply","verb",58,"to do as asked or ordered"],["yield","verb",58,"to give way"],["submit","verb",58,"to give in to authority","sub","mit"],["relent","verb",58,"to become less severe; to give in"],["succumb","verb",58,"to give way to pressure or temptation","sub"],["concession","noun",58,"something given up to reach agreement","con","ced","tion"],["acquiesce","verb",58,"to accept something reluctantly without protest","ad"],["capitulate","verb",58,"to surrender or give in","ate"],["accede","verb",58,"to agree to a request or demand","ad","ced"],["kowtow","verb",58,"to act too humbly and obediently"],["crucial","adj",59,"extremely important"],["pivotal","adj",59,"of central importance"],["paramount","adj",59,"more important than anything else"],["preeminent","adj",59,"better than all others","pre"],["salient","adj",59,"most noticeable or important"],["trivial","adj",59,"of little importance"],["trifling","adj",59,"unimportant"],["frivolous","adj",59,"not serious; silly","ous"],["peripheral","adj",59,"at the edge; of minor importance","peri"],["tangential","adj",59,"only slightly connected to the main point"],["impeccable","adj",60,"without any flaw or fault","in-not","ible"],["inept","adj",60,"lacking skill; clumsy","in-not"],["inert","adj",60,"not moving or acting; lacking energy","in-not"],["indomitable","adj",60,"impossible to defeat or discourage","in-not","ible"],["inexorable","adj",60,"impossible to stop or change","in-not","ible"],["insatiable","adj",60,"impossible to satisfy","in-not","ible"],["innocuous","adj",60,"harmless; not likely to offend","in-not","ous"],["incorrigible","adj",60,"impossible to correct or reform","in-not","ible"],["inscrutable","adj",60,"impossible to understand or read","in-not","ible"],["irrevocable","adj",60,"impossible to undo or take back","in-not","voc","ible"],["obstinate","adj",61,"stubbornly refusing to change one's mind","ob"],["tenacious","adj",61,"holding firmly to something; persistent","ten","ous"],["steadfast","adj",61,"firm and unwavering in loyalty or purpose"],["adamant","adj",61,"refusing to be persuaded"],["resolute","adj",61,"firmly determined","re"],["intransigent","adj",61,"refusing to compromise","in-not","trans"],["recalcitrant","adj",61,"stubbornly resisting authority or control","re"],["obdurate","adj",61,"stubbornly refusing to change, especially when one should","ob"],["docile","adj",61,"quiet and easy to control"],["malleable","adj",61,"easily shaped; also, easily influenced","ible"],["temperate","adj",62,"moderate; showing self-control"],["abstain","verb",62,"to choose not to do or have something","ab","ten"],["abstemious","adj",62,"eating and drinking sparingly","ab","ous"],["ascetic","adj",62,"strictly self-denying; avoiding comfort and pleasure","ic"],["restraint","noun",62,"self-control; holding back"],["hedonist","noun",62,"a person who lives for pleasure","ism"],["decadent","adj",62,"marked by too much pleasure and falling standards","de"],["sybarite","noun",62,"a person devoted to luxury and pleasure"],["epicurean","adj",62,"devoted to fine food and pleasure"],["voracious","adj",62,"wanting great amounts of food or of an activity","vor","ous"],["witty","adj",63,"cleverly funny"],["wry","adj",63,"dryly humorous, often with a touch of irony"],["droll","adj",63,"funny in an odd or quiet way"],["levity","noun",63,"lightness of manner, especially at a serious time","lev","ity"],["facetious","adj",63,"joking at an unsuitable time","ous"],["sarcastic","adj",63,"saying the opposite of what one means in order to mock","ic"],["sardonic","adj",63,"grimly mocking","ic"],["satire","noun",63,"humor that exposes foolishness or wrongdoing"],["parody","noun",63,"an imitation that exaggerates for comic effect"],["lampoon","verb",63,"to mock publicly"],["tedious","adj",64,"long and tiresome","ous"],["monotonous","adj",64,"dull because it never varies","mono","ous"],["indifferent","adj",64,"having no interest or concern","in-not"],["jaded","adj",64,"tired and bored from too much of something"],["blasé","adj",64,"unimpressed, as if one has seen it all"],["ennui","noun",64,"a weary feeling of boredom"],["engrossed","adj",64,"having all one's attention taken up"],["rapt","adj",64,"completely fascinated"],["intrigued","adj",64,"very curious and interested"],["pique","verb",64,"to stir up interest or curiosity"],["cogent","adj",65,"clear, logical and convincing"],["trenchant","adj",65,"sharp, clear and forceful"],["valid","adj",65,"logically sound; also, officially acceptable"],["irrefutable","adj",65,"impossible to prove wrong","in-not","ible"],["incontrovertible","adj",65,"beyond dispute","in-not","contra","vert","ible"],["unassailable","adj",65,"unable to be attacked or questioned","un","ible"],["tenuous","adj",65,"very weak or slight","ous"],["flimsy","adj",65,"weak and easily broken; unconvincing"],["untenable","adj",65,"not able to be defended","un","ten","ible"],["moot","adj",65,"open to debate; also, no longer relevant"],["preliminary","adj",66,"coming before the main part","pre"],["subsequent","adj",66,"coming after","sub","sequ"],["predecessor","noun",66,"a person who held a job or position before someone else","pre","ced"],["successor","noun",66,"a person who follows another in a role","ced"],["antecedent","noun",66,"something that comes before","ante","ced"],["precursor","noun",66,"something that comes before and leads to another","pre","cur"],["harbinger","noun",66,"a sign of what is to come"],["prescient","adj",66,"knowing about events before they happen","pre","sci"],["posterity","noun",66,"all future generations","post","ity"],["posthumous","adj",66,"happening after a person's death","ous"],["deter","verb",67,"to discourage from acting","de"],["dissuade","verb",67,"to persuade not to do something","dis"],["curb","verb",67,"to restrain or limit"],["curtail","verb",67,"to cut short or reduce"],["repress","verb",67,"to hold back or keep down","re"],["suppress","verb",67,"to put down by force; to keep from being seen","sub"],["stifle","verb",67,"to smother; to hold back"],["quash","verb",67,"to put down; to cancel officially"],["squelch","verb",67,"to crush or silence"],["stanch","verb",67,"to stop the flow of"],["impartial","adj",68,"treating all sides equally","in-not"],["disinterested","adj",68,"not influenced by personal advantage; impartial","dis"],["objective","adj",68,"based on facts rather than feelings","ive"],["subjective","adj",68,"based on personal feelings or opinions","sub","ject","ive"],["bias","noun",68,"a leaning that prevents fair judgment"],["prejudice","noun",68,"an opinion formed without knowledge or reason","pre"],["arbitrary","adj",68,"based on whim rather than reason"],["equitable","adj",68,"fair and just","ible"],["dispassionate","adj",68,"not influenced by strong feelings","dis"],["jaundiced","adj",68,"affected by bitterness or distrust"],["arduous","adj",69,"requiring great effort","ous"],["onerous","adj",69,"burdensome","ous"],["laborious","adj",69,"requiring much work","ous"],["grueling","adj",69,"exhausting"],["formidable","adj",69,"impressively hard or powerful","ible"],["cumbersome","adj",69,"large and awkward; slow and complicated"],["precarious","adj",69,"unstable and dangerous","ous"],["futile","adj",69,"useless; having no chance of success"],["facile","adj",69,"too easy or simple; shallow"],["effortless","adj",69,"done with no apparent effort"],["apathy","noun",70,"lack of interest or concern","a-not","path"],["empathy","noun",70,"the ability to share and understand another's feelings","path"],["antipathy","noun",70,"a strong dislike","anti","path"],["pathos","noun",70,"a quality that stirs pity or sadness","path"],["telepathy","noun",70,"the supposed sending of thoughts from one mind to another without words","path"],["philanthropist","noun",70,"a person who gives generously to help others","phil","anthrop","ism"],["bibliophile","noun",70,"a person who loves books","phil"],["misanthrope","noun",70,"a person who dislikes people in general","miso","anthrop"],["anthropology","noun",70,"the study of human beings and their cultures","anthrop","log"],["anthropomorphic","adj",70,"giving human form or traits to animals or things","anthrop","morph","ic"],["sagacious","adj",71,"wise and showing good judgment","ous"],["astute","adj",71,"quick to see how things are and to use it well"],["shrewd","adj",71,"clever in practical matters"],["canny","adj",71,"shrewd, especially with money or business"],["judicious","adj",71,"showing good judgment","ous"],["prudent","adj",71,"careful and sensible about the future"],["sage","noun",71,"a very wise person"],["gullible","adj",71,"easily tricked","ible"],["fatuous","adj",71,"silly and pointless in a self-satisfied way","ous"],["obtuse","adj",71,"slow to understand"],["belittle","verb",72,"to make someone or something seem unimportant"],["demean","verb",72,"to lower someone's dignity"],["derogatory","adj",72,"showing a low opinion; insulting","de"],["pejorative","adj",72,"expressing disapproval or contempt","ive"],["denigrate","verb",72,"to criticize unfairly; to belittle","de","ate"],["deprecate","verb",72,"to express disapproval of; to play down","de","ate"],["affront","noun",72,"an open insult"],["slight","noun",72,"an act that shows disrespect by ignoring someone"],["aspersion","noun",72,"an attack on someone's reputation","ad","tion"],["invidious","adj",72,"likely to cause resentment or seem unfair","vid","ous"],["tirade","noun",73,"a long, angry speech"],["diatribe","noun",73,"a bitter verbal attack","dia"],["harangue","noun",73,"a long, forceful lecture"],["invective","noun",73,"insulting, abusive language"],["vitriolic","adj",73,"bitterly harsh in speech","ic"],["vehement","adj",73,"showing strong, intense feeling"],["vociferous","adj",73,"loud and forceful in expressing opinions","voc","fer","ous"],["strident","adj",73,"loud and harsh; forceful in a grating way"],["clamor","noun",73,"a loud, confused noise, especially of protest"],["cacophony","noun",73,"a harsh mixture of sounds"],["indolent","adj",74,"lazy; avoiding effort"],["lethargic","adj",74,"sluggish and drowsy; lacking energy","ic"],["languid","adj",74,"slow and relaxed; without energy"],["listless","adj",74,"lacking energy or interest"],["torpid","adj",74,"inactive and sluggish"],["somnolent","adj",74,"sleepy; drowsy","somn"],["soporific","adj",74,"tending to cause sleep","somn","ic"],["dormant","adj",74,"asleep or inactive for a time"],["lassitude","noun",74,"physical or mental weariness"],["stupor","noun",74,"a dazed state in which one can hardly think or act"],["innate","adj",75,"present from birth; natural","in-into"],["inherent","adj",75,"existing as a permanent, essential part","in-into"],["intrinsic","adj",75,"belonging to the basic nature of something","ic"],["extrinsic","adj",75,"coming from outside","extra","ic"],["instinctive","adj",75,"done without thinking, by natural impulse","ive"],["intuitive","adj",75,"understood without conscious reasoning","ive"],["congenital","adj",75,"present from birth","con","gen"],["ingrained","adj",75,"firmly fixed by long habit"],["inveterate","adj",75,"having a long-standing habit that is unlikely to change"],["hereditary","adj",75,"passed down from parents to children"],["procrastinate","verb",76,"to delay doing something one should do","pro","ate"],["defer","verb",76,"to put off until later; also, to yield to another's judgment","fer"],["dawdle","verb",76,"to waste time; to move slowly"],["linger","verb",76,"to stay longer than needed"],["dilatory","adj",76,"slow to act; causing delay"],["belated","adj",76,"coming late"],["hiatus","noun",76,"a break or pause"],["respite","noun",76,"a short rest from something hard"],["hasten","verb",76,"to hurry"],["precipitate","adj",76,"done suddenly and without careful thought","pre"],["coax","verb",77,"to gently persuade"],["cajole","verb",77,"to persuade by flattery or coaxing"],["wheedle","verb",77,"to get something by flattery or sweet talk"],["entice","verb",77,"to attract by offering something pleasant"],["beguile","verb",77,"to charm, sometimes in order to deceive"],["lure","verb",77,"to tempt into doing something"],["coerce","verb",77,"to force by threats","con"],["compel","verb",77,"to force or oblige","con"],["browbeat","verb",77,"to bully with stern words"],["extort","verb",77,"to obtain by force or threats","ex"],["shun","verb",78,"to avoid on purpose"],["spurn","verb",78,"to reject with scorn"],["snub","verb",78,"to ignore or treat coldly on purpose"],["ostracize","verb",78,"to exclude from a group","ize"],["banish","verb",78,"to send away as a punishment"],["alienate","verb",78,"to make someone feel isolated or unfriendly","ate"],["relegate","verb",78,"to move to a lower rank or position","re","ate"],["insular","adj",78,"narrow in outlook; cut off from outside ideas"],["parochial","adj",78,"having a narrow, local outlook"],["cosmopolitan","adj",78,"familiar with many cultures; worldly"],["excessive","adj",79,"more than is necessary","ex","ced","ive"],["surplus","noun",79,"an amount left over","super"],["superfluous","adj",79,"more than is needed","super","ous"],["redundant","adj",79,"unnecessary because repeated"],["extraneous","adj",79,"not relevant; coming from outside","extra","ous"],["exorbitant","adj",79,"much too high","ex"],["inordinate","adj",79,"unusually large; excessive","in-not"],["gratuitous","adj",79,"done without good reason; uncalled for","ous"],["surfeit","noun",79,"an excessive amount","super"],["inundate","verb",79,"to flood; to overwhelm","in-into","ate"],["gregarious","adj",80,"fond of company; sociable","greg","ous"],["egregious","adj",80,"outstandingly bad; shocking","ex","greg","ous"],["congregate","verb",80,"to gather into a crowd or group","con","greg","ate"],["aggregate","noun",80,"a whole formed by combining many parts; a total","ad","greg"],["segregate","verb",80,"to set apart from others","greg","ate"],["placate","verb",80,"to calm someone's anger by giving in a little","plac","ate"],["placid","adj",80,"calm and peaceful","plac"],["implacable","adj",80,"impossible to calm or satisfy","in-not","plac","ible"],["complacent","adj",80,"too pleased with oneself to see dangers or the need to improve","con","plac"],["pacify","verb",80,"to calm or bring peace to","pac","ify"],["frugal","adj",81,"careful not to waste money or food"],["parsimonious","adj",81,"very unwilling to spend money; stingy","ous"],["extravagant","adj",81,"spending much more than is wise"],["prodigal","adj",81,"wastefully extravagant","pro"],["profligate","adj",81,"recklessly wasteful","pro"],["munificent","adj",81,"very generous in giving"],["largesse","noun",81,"generous giving, or the gifts given"],["avaricious","adj",81,"greedy for money","ous"],["affluent","adj",81,"wealthy","ad"],["destitute","adj",81,"without money or the basic things one needs"],["wily","adj",82,"clever at tricking others"],["charlatan","noun",82,"a person who falsely claims special knowledge or skill"],["impostor","noun",82,"a person who pretends to be someone else"],["ruse","noun",82,"a trick to deceive"],["subterfuge","noun",82,"trickery used to hide or escape something","sub","fug"],["chicanery","noun",82,"clever trickery, especially in law or business"],["machination","noun",82,"a crafty scheme or plot","tion"],["collusion","noun",82,"secret cooperation for a dishonest purpose","con","tion"],["complicit","adj",82,"involved with others in wrongdoing"],["connive","verb",82,"to secretly allow or plot wrongdoing"],["glib","adj",83,"smooth and easy but insincere or shallow"],["insinuate","verb",83,"to hint at something unpleasant indirectly","ate"],["innuendo","noun",83,"an indirect, often unkind hint"],["evasive","adj",83,"avoiding a direct answer","ex","ive"],["equivocate","verb",83,"to use unclear language to avoid committing oneself","voc","ate"],["prevaricate","verb",83,"to speak evasively; to avoid the truth","ate"],["dissemble","verb",83,"to hide one's true feelings or motives","dis"],["obfuscate","verb",83,"to make something deliberately unclear","ob","ate"],["sophistry","noun",83,"clever but misleading reasoning"],["quibble","verb",83,"to argue over trivial points"],["remorse","noun",84,"deep regret for doing wrong","re"],["contrite","adj",84,"feeling sorry for a wrong","con"],["penitent","adj",84,"feeling sorrow for having done wrong"],["rueful","adj",84,"showing regret, often in a wry way"],["compunction","noun",84,"a feeling of guilt that stops or follows a wrong act","con","tion"],["atone","verb",84,"to make amends for a wrong"],["chagrin","noun",84,"annoyance mixed with embarrassment"],["mortified","adj",84,"deeply embarrassed"],["abashed","adj",84,"embarrassed and ashamed"],["sheepish","adj",84,"embarrassed from knowing one has done something foolish"],["manifest","adj",85,"clear and obvious"],["palpable","adj",85,"so strong it can almost be touched","ible"],["overt","adj",85,"done openly, not hidden"],["blatant","adj",85,"completely obvious, often shamelessly"],["flagrant","adj",85,"shockingly obvious"],["patent","adj",85,"plainly obvious"],["ostensible","adj",85,"stated or seeming true, but perhaps not","ible"],["purported","adj",85,"claimed to be, without proof"],["tacit","adj",85,"understood without being stated"],["unmistakable","adj",85,"impossible to mistake; very clear","un","ible"],["fortuitous","adj",86,"happening by chance, often luckily","ous"],["serendipity","noun",86,"finding good things by chance","ity"],["propitious","adj",86,"favorable; likely to bring success","ous"],["fluke","noun",86,"a lucky or unlikely chance happening"],["happenstance","noun",86,"a chance happening"],["windfall","noun",86,"an unexpected gain"],["hapless","adj",86,"unlucky"],["calamity","noun",86,"a disaster","ity"],["mishap","noun",86,"an unlucky accident, usually minor","mis"],["debacle","noun",86,"a sudden, complete failure"],["demolish","verb",87,"to tear down completely","de"],["devastate","verb",87,"to destroy; to overwhelm with grief","de","ate"],["ravage","verb",87,"to cause severe damage"],["eradicate","verb",87,"to destroy completely","ex","ate"],["annihilate","verb",87,"to destroy utterly","ad","ate"],["obliterate","verb",87,"to wipe out completely","ob","ate"],["decimate","verb",87,"to kill or destroy a large part of","ate"],["raze","verb",87,"to tear down to the ground"],["expunge","verb",87,"to erase or remove completely","ex"],["dismantle","verb",87,"to take apart piece by piece"],["covert","adj",88,"secret; not openly shown"],["clandestine","adj",88,"done secretly, often because it is not allowed"],["surreptitious","adj",88,"done secretly to avoid notice","sub","ous"],["furtive","adj",88,"sly and secretive, as if guilty","ive"],["stealthy","adj",88,"moving quietly and carefully to avoid notice"],["latent","adj",88,"present but not yet active or visible"],["cryptic","adj",88,"mysterious and hard to understand","ic"],["veiled","adj",88,"partly hidden; not openly expressed"],["elusive","adj",88,"hard to find, catch or remember","ive"],["ulterior","adj",88,"hidden beyond what is stated"],["aesthetic","adj",89,"having to do with beauty","ic"],["exquisite","adj",89,"extremely beautiful and delicate","ex"],["sublime","adj",89,"so excellent or beautiful it inspires awe"],["ornate","adj",89,"elaborately decorated"],["opulent","adj",89,"rich and luxurious"],["ostentatious","adj",89,"showy in order to impress","ous"],["flamboyant","adj",89,"bold and showy"],["gaudy","adj",89,"showy in a tasteless way"],["garish","adj",89,"too bright and showy"],["austere","adj",89,"plain and without decoration; severe"],["omnipotent","adj",90,"all-powerful","omni","pot"],["omniscient","adj",90,"knowing everything","omni","sci"],["panacea","noun",90,"a cure for all problems","pan"],["pandemonium","noun",90,"wild uproar and confusion","pan"],["ambivalent","adj",90,"having mixed feelings","ambi"],["ambiguous","adj",90,"open to more than one meaning","ambi","ous"],["euphemism","noun",90,"a mild word used in place of a harsh or blunt one","eu","ism"],["eulogy","noun",90,"a speech of praise, especially for someone who has died","eu","log"],["hyperbole","noun",90,"deliberate exaggeration for effect","hyper"],["dystopia","noun",90,"an imagined society where life is miserable","dys"],["deferential","adj",91,"showing polite respect and readiness to yield to others","de","fer"],["obsequious","adj",91,"too eager to please or obey","ob","sequ","ous"],["sycophant","noun",91,"a person who flatters powerful people to gain favor"],["servile","adj",91,"too willing to serve or please others"],["fawning","adj",91,"flattering in a groveling way"],["insolent","adj",91,"boldly rude and disrespectful","in-not"],["impudent","adj",91,"rudely bold; cheeky","in-not"],["brazen","adj",91,"bold and without shame"],["temerity","noun",91,"reckless boldness; nerve","ity"],["effrontery","noun",91,"shameless boldness","ex"],["inclination","noun",92,"a natural tendency or liking","tion"],["disposition","noun",92,"a person's usual mood or nature","dis","tion"],["aptitude","noun",92,"a natural ability to learn or do something"],["affinity","noun",92,"a natural liking or sense of connection","ad","ity"],["penchant","noun",92,"a strong liking for something"],["propensity","noun",92,"a natural tendency to behave a certain way","pro","pend","ity"],["proclivity","noun",92,"a tendency, often toward something undesirable","pro","ity"],["predilection","noun",92,"a preference or special liking","pre","tion"],["predisposed","adj",92,"inclined beforehand to act or think a certain way","pre"],["wont","noun",92,"a habit or custom"],["encomium","noun",93,"a speech or piece of writing full of high praise"],["panegyric","noun",93,"a public speech or text of great praise"],["plaudit","noun",93,"an expression of praise"],["paean","noun",93,"a song or speech of praise or triumph"],["excoriate","verb",93,"to criticize severely","ate"],["castigate","verb",93,"to scold or criticize severely","ate"],["upbraid","verb",93,"to scold sharply"],["lambaste","verb",93,"to criticize harshly"],["vilify","verb",93,"to speak about someone as if they were evil","ify"],["impugn","verb",93,"to question someone's honesty or motives","in-into"],["enervate","verb",94,"to weaken; to drain energy","ex","ate"],["nonplussed","adj",94,"so puzzled that one does not know how to react","non"],["bemused","adj",94,"puzzled and confused"],["noisome","adj",94,"having an offensive smell; harmful"],["restive","adj",94,"restless and hard to control","ive"],["peruse","verb",94,"to read carefully; also, often, to look over casually"],["belie","verb",94,"to give a false impression of; to contradict"],["sanction","noun",94,"an official approval; also, a penalty","tion"],["cleave","verb",94,"to split apart; also, to cling closely"],["inflammable","adj",94,"easily set on fire (the same as flammable)","ible"],["profound","adj",95,"very deep or insightful","pro"],["superficial","adj",95,"on the surface only; shallow","super"],["cerebral","adj",95,"intellectual rather than emotional"],["contemplate","verb",95,"to think deeply about","ate"],["pensive","adj",95,"deeply thoughtful, often sadly","pend","ive"],["ruminate","verb",95,"to think over again and again","ate"],["abstruse","adj",95,"hard to understand","ab"],["esoteric","adj",95,"understood by only a small group","ic"],["arcane","adj",95,"known by few; mysterious"],["recondite","adj",95,"little known; requiring deep knowledge","re"],["archaic","adj",96,"very old or no longer in use","ic"],["antiquated","adj",96,"old-fashioned and outdated"],["antediluvian","adj",96,"extremely old-fashioned","ante"],["hoary","adj",96,"very old; gray or white with age"],["primeval","adj",96,"from the earliest ages"],["pristine","adj",96,"in original, unspoiled condition"],["nostalgia","noun",96,"a fond longing for the past"],["novel","adj",96,"new and unusual","nov"],["innovative","adj",96,"introducing new ideas","nov","ive"],["avant-garde","adj",96,"new and experimental, especially in the arts"],["usurp","verb",97,"to take power or a position without the right"],["confiscate","verb",97,"to take by authority","ate"],["appropriate","verb",97,"to take for one's own use, often without permission","ad","ate"],["commandeer","verb",97,"to take for official or military use","mand"],["wrest","verb",97,"to pull away by force"],["relinquish","verb",97,"to give up","re"],["renounce","verb",97,"to formally give up a claim or belief","re","nounce"],["repudiate","verb",97,"to refuse to accept or be associated with","ate"],["forfeit","verb",97,"to lose something as a penalty"],["abdicate","verb",97,"to give up a throne or a responsibility","ab","ate"],["dissident","noun",98,"a person who opposes official policy","dis"],["insurgent","noun",98,"a rebel fighting against a government"],["mutiny","noun",98,"a rebellion, especially by sailors or soldiers against their officers"],["insurrection","noun",98,"a violent uprising against authority","tion"],["sedition","noun",98,"speech or action urging rebellion against a government","tion"],["renegade","noun",98,"a person who deserts a group or cause"],["maverick","noun",98,"an independent person who does not follow the group"],["iconoclast","noun",98,"a person who attacks cherished beliefs"],["faction","noun",98,"a small group within a larger one, often in dispute","tion"],["partisan","adj",98,"strongly supporting one side"],["detrimental","adj",99,"causing harm","de"],["toxic","adj",99,"poisonous","ic"],["noxious","adj",99,"harmful, especially to health","ous"],["pernicious","adj",99,"harmful in a slow or hidden way","per","ous"],["deleterious","adj",99,"harmful","ous"],["insidious","adj",99,"spreading harm gradually and secretly","ous"],["virulent","adj",99,"extremely harmful or bitter"],["inimical","adj",99,"harmful; unfriendly","in-not","am","ic"],["salutary","adj",99,"producing a good effect, often after a hard lesson"],["salubrious","adj",99,"good for health","ous"]],"roots":{"in-not":["in-, im-, il-, ir-","prefix","not","Latin","roots.not",["impeccable","inept","inert","indomitable","inexorable","insatiable","innocuous","incorrigible","inscrutable","irrevocable","incredulous","inadvertent","intractable","implacable","imperturbable","incontrovertible","irrefutable","indelible","immutable","incessant","insolent","impudent","impartial","impassive","indifferent","incongruous","inordinate","infinitesimal","intransigent","inimical"],["invisible","impossible","illegal","irregular"]],"un":["un-","prefix","not","English","roots.not",["unassuming","unflappable","unprecedented","unmistakable","unremitting","unassailable","unorthodox","uncouth","untenable"],["unkind","unable","unhappy"]],"non":["non-","prefix","not","Latin","roots.not",["nonchalant","nonplussed"],["nonsense","nonstop","nonfiction"]],"a-not":["a-, an-","prefix","without, not","Greek","roots.a-an",["apathy","anarchy","anomaly","atrophy","anecdotal"],["atypical","amoral","anonymous"]],"bene":["bene-","prefix","well, good","Latin","roots.bene-mal",["benevolent","benefactor","beneficial","benign","beneficiary"],["benefit","benediction"]],"mal":["mal-","prefix","badly, bad","Latin","roots.bene-mal",["malevolent","malicious","malady","malign","malcontent"],["malfunction","malnutrition"]],"eu":["eu-","prefix","good, well","Greek","roots.eu-dys",["euphemism","eulogy","euphoric"],["euphony"]],"dys":["dys-","prefix","bad, difficult","Greek","roots.eu-dys",["dystopia"],["dysfunction"]],"mis":["mis-","prefix","wrongly, badly","English","roots.mis-dis",["misgiving","mishap"],["mistake","misread","misplace"]],"dis":["dis-, dif-","prefix","apart, away, not","Latin","roots.mis-dis",["disingenuous","discern","disparate","discord","dissent","discrepancy","dispassionate","disconsolate","disinterested","dissemble","diffident","dissuade","discreet","disposition","dissident","diffuse"],["disagree","dismiss","dissect"]],"pre":["pre-","prefix","before","Latin","roots.pre-post",["preliminary","precursor","predecessor","prescient","preclude","predominant","preeminent","predisposed","predilection","precocious","prejudice","presume","premise","prevalent","precipitate"],["preview","predict","prepare"]],"ante":["ante-","prefix","before","Latin","roots.pre-post",["antecedent","antediluvian"],["anteroom","antebellum"]],"post":["post-","prefix","after","Latin","roots.pre-post",["posterity"],["postpone","postscript","postwar"]],"sub":["sub-, suc-, sup-, sur-, sus-","prefix","under, below, secretly","Latin","roots.sub-super",["subvert","subsequent","subside","subjective","submit","succumb","surreptitious","subterfuge","substantiate","suppress","sustain"],["submarine","subway","support"]],"super":["super-, sur-","prefix","over, above, beyond","Latin","roots.sub-super",["superficial","superfluous","supercilious","surplus","surfeit"],["supervise","surpass"]],"hyper":["hyper-","prefix","over, beyond, too much","Greek","roots.sub-super",["hyperbole"],["hyperactive"]],"hypo":["hypo-","prefix","under","Greek","roots.sub-super",["hypothesis"],["hypodermic"]],"inter":["inter-","prefix","between, among","Latin","roots.inter-circum",["interject","interlocutor","intermittent"],["interrupt","international"]],"intro":["intro-, intra-","prefix","within, inward","Latin","roots.inter-circum",["introspective"],["introduce","intramural"]],"circum":["circum-","prefix","around","Latin","roots.inter-circum",["circumspect","circumlocution"],["circumference","circumnavigate"]],"peri":["peri-","prefix","around","Greek","roots.inter-circum",["peripheral"],["perimeter","periscope"]],"trans":["trans-","prefix","across, beyond, through","Latin","roots.trans-per",["transient","transitory","intransigent"],["transport","transform"]],"per":["per-","prefix","through, thoroughly","Latin","roots.trans-per",["perennial","perspicacious","permeate","perfunctory","pervasive","perturb","perpetual","persistent","pernicious"],["perfect","perforate"]],"dia":["dia-","prefix","through, across","Greek","roots.trans-per",["diatribe"],["diagonal","diameter","dialogue"]],"ex":["ex-, e-, ef-","prefix","out, out of, thoroughly","Latin","roots.ex-in",["exacerbate","exonerate","exculpate","extol","expedite","exorbitant","extort","expunge","eradicate","elucidate","elicit","eloquent","elocution","evanescent","evasive","effrontery","exhort","exalt","exuberant","exquisite","excessive","extemporaneous","exacting","eminent","enervate","edict","egregious"],["exit","export","emerge"]],"extra":["extra-, extro-","prefix","outside, beyond","Latin","roots.ex-in",["extraneous","extrapolate","extrinsic"],["extraordinary"]],"in-into":["in-, im-, en-, em-","prefix","in, into, on","Latin","roots.ex-in",["incite","inundate","impede","impugn","inhibit","inherent","innate","indict","encumber","engender","envision"],["inhale","invade","enclose"]],"re":["re-","prefix","back, again","Latin","roots.re-de",["retrospect","recalcitrant","recurrent","relinquish","renounce","rescind","reprehensible","reprimand","rejuvenate","revive","reticent","reclusive","recondite","relegate","reconcile","remiss","remorse","resolute","revere","repress"],["return","rewrite","recall"]],"de":["de-","prefix","down, away, from, completely","Latin","roots.re-de",["deter","deduce","defunct","dejected","demolish","denigrate","denounce","deprecate","deride","derogatory","despondent","detrimental","devastate","devious","decadent","deferential"],["descend","depart","deflate"]],"con":["con-, com-, col-, cor-, co-","prefix","with, together, thoroughly","Latin","roots.con-syn",["concise","coherent","colloquial","complacent","congregate","condescending","conciliate","concur","contemporary","contend","consensus","compel","compunction","confound","consternation","contrite","collusion","conjecture","corroborate","commend","coerce","coalesce","confidant","congenital","concession","conclusive","conspicuous","cognizant","convoluted","conviction","compassionate","condone","console","convivial","concede","conventional"],["connect","combine","collect"]],"syn":["syn-, sym-, syl-","prefix","together, with","Greek","roots.con-syn",["synchronize"],["synonym","sympathy","symphony"]],"contra":["contra-, contro-, counter-","prefix","against","Latin","roots.contra-anti",["controversy","incontrovertible","counterfeit"],["contradict","contrast","counteract"]],"anti":["anti-, ant-","prefix","against, opposite","Greek","roots.contra-anti",["antithesis","antipathy"],["antidote","antonym"]],"ob":["ob-, oc-, of-, op-","prefix","against, toward, in the way","Latin","roots.contra-anti",["obdurate","obstinate","obstruct","obfuscate","obsequious","obliterate"],["object","obstacle","oppose"]],"ab":["ab-, abs-","prefix","away, from","Latin","roots.ab-ad-pro",["abstain","abstemious","abstruse","absolve","abdicate","aberration"],["absent","abnormal"]],"ad":["ad-, ac-, af-, ag-, al-, an-, ap-, ar-, as-, at-","prefix","to, toward","Latin","roots.ab-ad-pro",["adversary","adverse","advocate","aggregate","alleviate","assert","assiduous","assuage","affable","affluent","affinity","accede","acquiesce","accolade","accord","annihilate","aggravate","apprehensive","arrogant","appropriate","aspersion"],["advance","attract","accept"]],"pro":["pro-","prefix","forward, forth, for","Latin","roots.ab-ad-pro",["procrastinate","proclivity","prodigal","profound","profuse","propensity","protracted","provident","provoke","profligate"],["proceed","promote","project"]],"mono":["mono-","prefix","one, alone","Greek","roots.numbers",["monotonous"],["monologue","monorail"]],"uni":["uni-","prefix","one","Latin","roots.numbers",["unanimous","universal"],["unicycle","uniform","unite"]],"di":["di-, dicho-","prefix","two, in two","Greek","roots.numbers",["dichotomy"],["dilemma","dioxide"]],"poly":["poly-","prefix","many","Greek","roots.numbers",["polymath"],["polygon","polysyllabic"]],"omni":["omni-","prefix","all","Latin","roots.omni-pan",["omnipotent","omniscient"],["omnivore","omnibus"]],"pan":["pan-","prefix","all","Greek","roots.omni-pan",["panacea","pandemonium"],["panorama","pandemic"]],"ambi":["ambi-, amb-","prefix","both, around","Latin","roots.omni-pan",["ambivalent","ambiguous"],["ambidextrous"]],"auto":["auto-","prefix","self","Greek","roots.cracy-archy",["autocrat","autonomy"],["automatic","autograph","autobiography"]],"dict":["dict","root","say, speak","Latin","roots.dict-loqu",["diction","edict","indict","verdict"],["dictate","predict","contradict"]],"loqu":["loqu, locut","root","speak, talk","Latin","roots.dict-loqu",["eloquent","loquacious","colloquial","soliloquy","circumlocution","elocution","interlocutor"],["ventriloquist"]],"voc":["voc, vok","root","call, voice","Latin","roots.dict-loqu",["advocate","provoke","vociferous","equivocate","irrevocable"],["vocal","invoke","evoke"]],"nounce":["nounce, nunci","root","announce, report","Latin","roots.dict-loqu",["denounce","renounce"],["announce","pronounce"]],"mand":["mand","root","order, entrust","Latin","roots.dict-loqu",["commend","mandate","commandeer"],["command","demand"]],"spec":["spec, spic, spect","root","look, see","Latin","roots.spec-vid",["circumspect","introspective","retrospect","conspicuous","auspicious","specious","perspicacious"],["inspect","spectator","perspective"]],"vid":["vid, vis","root","see","Latin","roots.spec-vid",["provident","envision","visage","invidious"],["video","vision","evident"]],"cred":["cred","root","believe","Latin","roots.cred-fid-ver",["credible","incredulous","credulous","credence"],["credit","incredible"]],"fid":["fid","root","trust, faith","Latin","roots.cred-fid-ver",["fidelity","confidant","diffident"],["confide","confident"]],"ver":["ver","root","true","Latin","roots.cred-fid-ver",["veracity","verify","verdict","veritable"],["very","verity"]],"sci":["sci","root","know","Latin","roots.cred-fid-ver",["omniscient","prescient"],["science","conscience","conscious"]],"ced":["ced, ceed, cess","root","go, yield","Latin","roots.ced-gress",["accede","concede","concession","antecedent","predecessor","successor","excessive","cessation","incessant"],["precede","proceed","recess"]],"gress":["gress, grad","root","step, go","Latin","roots.ced-gress",[],["progress","digress","gradual","graduate"]],"ject":["ject","root","throw","Latin","roots.ject-mit",["conjecture","dejected","interject","subjective"],["reject","project","eject"]],"mit":["mit, miss","root","send, let go","Latin","roots.ject-mit",["intermittent","remiss","premise","submit","demise","unremitting"],["transmit","mission","dismiss"]],"duc":["duc, duct","root","lead","Latin","roots.duc-tract",["deduce"],["conduct","educate","produce"]],"tract":["tract","root","pull, draw","Latin","roots.duc-tract",["intractable","protracted"],["tractor","attract","distract"]],"clud":["clud, clus","root","shut, close","Latin","roots.duc-tract",["preclude","conclusive","reclusive"],["include","exclude","conclude"]],"vert":["vert, vers","root","turn","Latin","roots.vert",["avert","adverse","versatile","inadvertent","subvert","adversary","controversy","averse","incontrovertible","universal"],["reverse","convert","divert"]],"pac":["pac, pax","root","peace","Latin","roots.pac-plac",["pacify","appease"],["pacifist","Pacific"]],"plac":["plac","root","please, calm","Latin","roots.pac-plac",["placate","placid","implacable","complacent"],["placebo"]],"bell":["bell","root","war","Latin","roots.pac-plac",["belligerent","bellicose"],["rebel","rebellion"]],"greg":["greg","root","flock, herd","Latin","roots.greg-am",["gregarious","egregious","congregate","aggregate","segregate"],["congregation"]],"am":["am, amic","root","love, friend","Latin","roots.greg-am",["amiable","amicable","inimical"],["amateur","amity"]],"cord":["cord, cor","root","heart","Latin","roots.greg-am",["accord","discord"],["cordial","courage","record"]],"sent":["sent, sens","root","feel, think","Latin","roots.greg-am",["consensus","dissent"],["sense","sentiment","consent"]],"ten":["ten, tain, tin","root","hold","Latin","roots.ten-pend",["tenacious","tenet","untenable","abstain","sustain"],["contain","retain","tenant"]],"pend":["pend, pens","root","hang, weigh, pay","Latin","roots.ten-pend",["propensity","pensive"],["pendulum","suspend","expensive"]],"fer":["fer","root","carry, bear","Latin","roots.ten-pend",["defer","deferential","vociferous","infer"],["transfer","offer","ferry"]],"fund":["fund, fus","root","pour, melt","Latin","roots.ten-pend",["profuse","diffuse","confound"],["refund","fusion","transfusion"]],"cur":["cur, curr, curs","root","run","Latin","roots.cur-sequ",["cursory","precursor","recurrent","concur"],["current","cursor","occur"]],"sequ":["sequ, secut","root","follow","Latin","roots.cur-sequ",["obsequious","subsequent"],["sequel","sequence","consequence"]],"ped":["ped","root","foot","Latin","roots.cur-sequ",["expedite","impede","pedestrian"],["pedal","pedicure"]],"fug":["fug","root","flee","Latin","roots.cur-sequ",["subterfuge"],["fugitive","refuge","centrifugal"]],"luc":["luc, lum","root","light","Latin","roots.luc-lev",["lucid","elucidate"],["lucent","illuminate"]],"lev":["lev","root","light (not heavy), raise","Latin","roots.luc-lev",["alleviate","levity"],["lever","elevate","relieve"]],"grav":["grav","root","heavy, serious","Latin","roots.luc-lev",["aggravate"],["gravity","grave","gravitate"]],"viv":["viv, vit","root","life, live","Latin","roots.viv-vor",["revive","convivial"],["vivid","survive","vital"]],"vor":["vor","root","eat","Latin","roots.viv-vor",["voracious"],["carnivore","herbivore","devour"]],"somn":["somn, sopor","root","sleep","Latin","roots.viv-vor",["somnolent","soporific"],["insomnia"]],"pot":["pot, poss","root","able, powerful","Latin","roots.omni-pan",["omnipotent"],["potent","possible","potential"]],"chron":["chron","root","time","Greek","roots.chron-temp",["chronic","chronicle","chronological","anachronism","synchronize"],["chronometer"]],"temp":["temp, tempor","root","time","Latin","roots.chron-temp",["contemporary","temporal","extemporaneous"],["temporary","tempo"]],"ann":["ann, enn","root","year","Latin","roots.chron-temp",["perennial","annals"],["annual","anniversary","centennial"]],"nov":["nov","root","new","Latin","roots.chron-temp",["novel","innovative","novice"],["renovate","nova"]],"path":["path","root","feeling, suffering","Greek","roots.path-phil",["apathy","empathy","antipathy","pathos","telepathy"],["sympathy","pathetic"]],"phil":["phil","root","love","Greek","roots.path-phil",["philanthropist","bibliophile"],["philosophy","Philadelphia"]],"miso":["mis-, miso-","root","hate","Greek","roots.path-phil",["misanthrope"],[]],"anthrop":["anthrop","root","human being","Greek","roots.path-phil",["philanthropist","misanthrope","anthropology","anthropomorphic"],[]],"log":["log, logy","root","word, reason, study","Greek","roots.log-graph",["eulogy","anthropology","chronological","analogy"],["biology","dialogue","logic"]],"graph":["graph, gram","root","write, draw","Greek","roots.log-graph",[],["autograph","biography","telegram"]],"cracy":["-cracy, -crat","root","rule, power","Greek","roots.cracy-archy",["autocrat","bureaucracy"],["democracy","aristocrat"]],"archy":["-archy, -arch","root","rule, chief, first","Greek","roots.cracy-archy",["anarchy","oligarchy","hierarchy"],["monarchy","archaeology"]],"gen":["gen","root","birth, kind, produce","Greek and Latin","roots.gen-morph",["genesis","congenital","ingenious","ingenuous","engender","genial"],["generate","gene","genre"]],"morph":["morph","root","form, shape","Greek","roots.gen-morph",["anthropomorphic"],["metamorphosis","amorphous"]],"ous":["-ous, -ious, -uous","suffix","full of, having","Latin and Greek","roots.suffix-adj",["malicious","magnanimous","solicitous","callous","courteous","garrulous","unanimous","acrimonious","copious","incredulous","credulous","devious","duplicitous","disingenuous","zealous","lugubrious","dubious","capricious","impetuous","spontaneous","conspicuous","auspicious","specious","perspicacious","audacious","timorous","rigorous","oblivious","continuous","incongruous","loquacious","pompous","imperious","supercilious","virtuous","nefarious","prodigious","meticulous","scrupulous","assiduous","fastidious","punctilious","spurious","fictitious","mendacious","ingenious","ingenuous","precocious","pugnacious","ubiquitous","extemporaneous","nebulous","frivolous","innocuous","tenacious","abstemious","voracious","facetious","tedious","monotonous","tenuous","posthumous","arduous","onerous","laborious","precarious","sagacious","judicious","fatuous","invidious","vociferous","superfluous","extraneous","gratuitous","gregarious","egregious","parsimonious","avaricious","fortuitous","propitious","surreptitious","ostentatious","ambiguous","obsequious","noxious","pernicious","deleterious","insidious","salubrious"],[]],"ive":["-ive","suffix","tending to, doing","Latin and Greek","roots.suffix-adj",["vindictive","conclusive","divisive","impulsive","introspective","apprehensive","permissive","impassive","punitive","diminutive","pervasive","reclusive","incisive","objective","subjective","pejorative","instinctive","intuitive","excessive","evasive","furtive","elusive","restive","pensive","innovative"],[]],"ible":["-ible, -able","suffix","able to be, worth being","Latin and Greek","roots.suffix-adj",["indelible","mutable","immutable","credible","plausible","irascible","reprehensible","unflappable","imperturbable","accountable","culpable","negligible","intractable","veritable","amiable","affable","amicable","feasible","viable","impeccable","indomitable","inexorable","insatiable","incorrigible","inscrutable","irrevocable","malleable","irrefutable","incontrovertible","unassailable","untenable","equitable","formidable","gullible","implacable","palpable","ostensible","unmistakable","inflammable"],[]],"ic":["-ic, -ical","suffix","having to do with, like","Latin and Greek","roots.suffix-adj",["altruistic","laconic","ecstatic","euphoric","empirical","skeptical","dogmatic","cynical","erratic","prosaic","sporadic","periodic","eccentric","ethical","stoic","phlegmatic","authentic","pedantic","didactic","endemic","chronic","chronological","charismatic","idealistic","quixotic","whimsical","pragmatic","ascetic","sarcastic","sardonic","anthropomorphic","vitriolic","lethargic","soporific","intrinsic","extrinsic","cryptic","aesthetic","esoteric","archaic","toxic","inimical"],[]],"ity":["-ity, -ty","suffix","the state or quality of being","Latin and Greek","roots.suffix-noun",["brevity","paucity","fidelity","veracity","integrity","alacrity","animosity","enmity","propriety","probity","equanimity","levity","posterity","serendipity","calamity","temerity","affinity","propensity","proclivity"],[]],"tion":["-tion, -sion","suffix","the act or result of","Latin and Greek","roots.suffix-noun",["adulation","conviction","trepidation","aberration","circumlocution","elocution","diction","inception","consternation","cessation","concession","aspersion","machination","collusion","compunction","inclination","disposition","predilection","sanction","insurrection","sedition","faction"],[]],"ance":["-ance, -ence, -ancy, -ency","suffix","the state or act of","Latin and Greek","roots.suffix-noun",["credence","forbearance","discrepancy","nuance","clemency"],[]],"ism":["-ism, -ist","suffix","a belief or practice; a person who","Latin and Greek","roots.suffix-noun",["anachronism","hedonist","philanthropist","euphemism"],[]],"ate":["-ate","suffix","to make, to act on (in verbs)","Latin and Greek","roots.suffix-verb",["corroborate","substantiate","validate","extrapolate","ameliorate","alleviate","mitigate","rejuvenate","venerate","speculate","vacillate","fluctuate","exacerbate","aggravate","deteriorate","debilitate","facilitate","cultivate","advocate","initiate","inaugurate","exculpate","exonerate","vindicate","intimidate","culminate","terminate","conciliate","permeate","saturate","emulate","elucidate","proliferate","instigate","agitate","capitulate","denigrate","deprecate","procrastinate","alienate","relegate","inundate","congregate","segregate","placate","insinuate","equivocate","prevaricate","obfuscate","devastate","eradicate","annihilate","obliterate","decimate","excoriate","castigate","enervate","contemplate","ruminate","confiscate","appropriate","repudiate","abdicate"],[]],"ify":["-ify, -fy","suffix","to make, to become","Latin and Greek","roots.suffix-verb",["rectify","verify","ratify","nullify","mollify","typify","pacify","vilify"],[]],"ize":["-ize","suffix","to make, to treat as","Latin and Greek","roots.suffix-verb",["jeopardize","galvanize","synchronize","ostracize"],[]]}};
  /* @@VOCAB-DATA-END@@ */
  var POS_NAME = { adj: 'adjective', noun: 'noun', verb: 'verb', adv: 'adverb' };
  var _list = null, _byWord = null, _topics = null, _entries = {}, _byTopic = {};
  function index() {
    if (_list) return;
    var D0 = VO.DATA; _list = []; _byWord = {}; _topics = {};
    (D0.topics || []).forEach(function (t, i) { _topics[t[0]] = { n: i + 1, key: t[0], id: 'adv.' + t[0], title: t[1], strand: t[2], level: t[3], words: [] }; });
    (D0.words || []).forEach(function (w, i) {
      var tp = (D0.topics[w[2]] || [])[0], row = { n: i + 1, w: w[0], pos: w[1], t: tp, g: w[3], r: w.slice(4), level: (D0.topics[w[2]] || [])[3] };
      _list.push(row); _byWord[w[0].toLowerCase()] = row; if (_topics[tp]) _topics[tp].words.push(row);
    });
  }
  VO.POS_NAME = POS_NAME;
  VO.list = function () { index(); return _list; };
  VO.find = function (w) { index(); return _byWord[String(w).toLowerCase()] || null; };
  VO.topic = function (key) { index(); key = String(key).replace(/^adv\./, ''); return _topics[key] || null; };
  VO.topics = function () { index(); return Object.keys(_topics).map(function (k) { return _topics[k]; }).sort(function (a, b) { return a.n - b.n; }); };
  VO.strands = function () { return (VO.DATA.strands || []).slice(); };
  VO.ROOT = function (key) { var r = VO.DATA.roots[key]; return r ? { key: key, form: r[0], kind: r[1], means: r[2], lang: r[3], topic: r[4], words: r[5] || [], ex: r[6] || [] } : null; };
  VO.rootKeys = function () { return Object.keys(VO.DATA.roots || {}); };
  VO.rootsOf = function (w) { var r = VO.find(w); return r ? r.r.slice() : []; };
  VO.wordsWithRoot = function (key) { var R0 = VO.ROOT(key); return R0 ? R0.words.slice() : []; };
  // full entries (from the generated course data, data/vocab/words/*.json): { word, say, pos, def, ex, ctx, syn, ant, family, roots, etym, mn, scene, note }
  VO.addEntries = function (byTopic) {
    Object.keys(byTopic || {}).forEach(function (tk0) {
      var list = byTopic[tk0] || [], tk = String(tk0).replace(/^adv\./, '');
      _byTopic[tk] = list;
      list.forEach(function (e) { e.topic = tk; _entries[String(e.word).toLowerCase()] = e; });
      VO.entriesVersion = (VO.entriesVersion || 0) + 1;
    });
  };
  if (ML.vocabData) ML.vocabData.forEach(function (d) { VO.addEntries(d); });
  VO.entry = function (w) { return _entries[String(w).toLowerCase()] || null; };
  VO.allEntries = function () { return Object.keys(_entries).map(function (k) { return _entries[k]; }); };
  VO.entries = function (topicKey) { return (_byTopic[String(topicKey).replace(/^adv\./, '')] || []).slice(); };
  VO.hasEntries = function (topicKey) { return !!(_byTopic[String(topicKey).replace(/^adv\./, '')] || []).length; };
  // text helpers. Sentences mark the word (in the form used) with braces: "Her {benevolent} smile …"
  function escH(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  VO.esc = escH;
  VO.mark = function (s) { return escH(s).replace(/\{([^}]+)\}/g, '<b class="vo-hl">$1</b>'); };
  VO.plain = function (s) { return String(s || '').replace(/\{([^}]+)\}/g, '$1'); };
  VO.blank = function (s, b) { return escH(s).replace(/\{([^}]+)\}/g, b || '<span class="vo-blank" aria-label="blank">______</span>'); };
  VO.form = function (s) { var m = /\{([^}]+)\}/.exec(String(s || '')); return m ? m[1] : null; };
  // respelling: "buh-NEV-uh-lunt" -> HTML with the stressed syllable in bold
  // the word and its real forms (inflections, the entry's family and their inflections, and any listed part that is the whole
  // word), for hiding the answer in quiet mode. Sound-alike cues that only share letters (SPARE for sparse) are kept.
  function inflect(w) {
    var o = [w]; function add(x) { if (o.indexOf(x) < 0) o.push(x); }
    var sp = w.lastIndexOf(' '), head = sp >= 0 ? w.slice(0, sp + 1) : '', t = w.slice(sp + 1), last = t.slice(-1);
    function a(sfx, base) { add(head + (base == null ? t : base) + sfx); }
    if (/[^aeiou]y$/.test(t)) { ['ies', 'ied', 'ier', 'iest', 'ily', 'iness'].forEach(function (x) { a(x, t.slice(0, -1)); }); a('ing'); a('s'); }
    else if (/e$/.test(t)) { ['s', 'd', 'r', 'st', 'ly', 'ness', 'ing'].forEach(function (x) { a(x); }); ['ing', 'ed', 'er', 'est', 'ion', 'ation'].forEach(function (x) { a(x, t.slice(0, -1)); }); if (/le$/.test(t)) a('y', t.slice(0, -1)); }
    else {
      ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'ness'].forEach(function (x) { a(x); });
      if (/[^aeiou][aeiou][bdgklmnprt]$/.test(t)) ['ed', 'ing', 'er', 'est'].forEach(function (x) { a(x, t + last); });
      if (/ic$/.test(t)) a('ally');
    }
    return o;
  }
  VO.wordForms = function (e) {
    e = typeof e === 'string' ? (VO.entry(e) || { word: e }) : e || {};
    var w = String(e.word || '').toLowerCase(), out = inflect(w), bare = w.replace(/[^a-z]/g, '');
    (e.family || []).forEach(function (f) { if (f && f.w) inflect(String(f.w).toLowerCase()).forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); }); });
    (e.roots || []).forEach(function (r) { var q = String(r && r.part || '').toLowerCase().replace(/^-+|-+$/g, ''); if (q && q.replace(/[^a-z]/g, '') === bare && out.indexOf(q) < 0) out.push(q); });
    return out.filter(function (x) { return x.replace(/[^a-z]/g, '').length >= 2; });
  };
  // a RegExp that finds those forms as whole words (hyphens and spaces inside a form match either); use with
  // s.replace(re, function (m, pre) { return pre + '?'; })
  VO.formsRe = function (e) {
    var f = VO.wordForms(e).sort(function (a, b) { return b.length - a.length; }).map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-\s]+/g, '[-\\s]+'); });
    return f.length ? new RegExp('(^|[^A-Za-z])(?:' + f.join('|') + ')(?![A-Za-z])', 'gi') : null;
  };
  VO.hideForms = function (s, e, by) { var re = e instanceof RegExp ? e : VO.formsRe(e); return re ? String(s).replace(re, function (m, pre) { return pre + (by == null ? '?' : by); }) : String(s); };
  VO.say = function (r) { if (!r) return ''; return '<span class="vo-say">' + String(r).split('-').map(function (s) { return /^[A-Z]{1,}$/.test(s.replace(/[^A-Za-z]/g, '')) && /[A-Z]/.test(s) ? '<b>' + escH(s) + '</b>' : escH(s); }).join('-') + '</span>'; };
  VO.posName = function (p) { return POS_NAME[p] || p || ''; };
  /* =====================================================================================================================
     THE ART: SVG markup as strings (works in node and in the browser). Scene space is 400 x 300, the ground line at GY.
     Every shape has a dark ink outline so pictures read in black-and-white print; fills are warm, mid-value colors.
     ===================================================================================================================== */
  var SW = 400, SH = 300, GY = 262, INK = '#2a2320', LW = 2.2;
  var M = Math;
  function r1(v) { return M.round(v * 10) / 10; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function at(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== false) s += ' ' + k + '="' + (typeof o[k] === 'number' ? r1(o[k]) : esc(o[k])) + '"'; return s; }
  function tag(t, o, inner) { return '<' + t + at(o) + (inner == null ? '/>' : '>' + inner + '</' + t + '>'); }
  // filled shapes with the ink outline (w: outline width, 0 for none)
  function path(d, fill, w, extra) { return tag('path', Object.assign({ d: d, fill: fill || 'none', stroke: w === 0 ? null : INK, 'stroke-width': w === 0 ? null : (w || LW), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, extra || {})); }
  function circ(x, y, r, fill, w, extra) { return tag('circle', Object.assign({ cx: x, cy: y, r: r, fill: fill || 'none', stroke: w === 0 ? null : INK, 'stroke-width': w === 0 ? null : (w || LW) }, extra || {})); }
  function ell(x, y, rx, ry, fill, w, extra) { return tag('ellipse', Object.assign({ cx: x, cy: y, rx: rx, ry: ry, fill: fill || 'none', stroke: w === 0 ? null : INK, 'stroke-width': w === 0 ? null : (w || LW) }, extra || {})); }
  function rect(x, y, w0, h0, fill, w, rx, extra) { return tag('rect', Object.assign({ x: x, y: y, width: w0, height: h0, rx: rx || 0, fill: fill || 'none', stroke: w === 0 ? null : INK, 'stroke-width': w === 0 ? null : (w || LW), 'stroke-linejoin': 'round' }, extra || {})); }
  function line(x1, y1, x2, y2, col, w, extra) { return tag('line', Object.assign({ x1: x1, y1: y1, x2: x2, y2: y2, stroke: col || INK, 'stroke-width': w || LW, 'stroke-linecap': 'round' }, extra || {})); }
  function stroke(d, col, w, extra) { return tag('path', Object.assign({ d: d, fill: 'none', stroke: col || INK, 'stroke-width': w || LW, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra || {})); }
  // a thick colored stroke with an ink outline (limbs, tails, stems): the ink stroke underneath is 2 x LW wider
  function limb(d, col, w) { return stroke(d, INK, w + 2 * LW) + stroke(d, col, w); }
  function g(inner, tr, extra) { return '<g' + at(Object.assign({ transform: tr || null }, extra || {})) + '>' + inner + '</g>'; }
  function txt(x, y, s, o) {
    o = o || {};
    return tag('text', { x: x, y: y, 'font-size': o.size || 14, 'font-weight': o.weight || 700, 'font-family': o.serif ? 'Georgia,"Times New Roman",serif' : 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',
      'text-anchor': o.anchor || 'middle', fill: o.fill || INK, 'dominant-baseline': o.base || null, 'letter-spacing': o.ls || null, transform: o.tr || null, 'font-style': o.italic ? 'italic' : null }, esc(s));
  }
  function shade(hex, f) { // f < 0 darker, f > 0 lighter
    var hs = String(hex).slice(1); if (hs.length === 3) hs = hs[0] + hs[0] + hs[1] + hs[1] + hs[2] + hs[2];
    var v = parseInt(hs, 16); if (isNaN(v) || hs.length !== 6) return hex;
    var r = v >> 16 & 255, gg = v >> 8 & 255, b = v & 255;
    function m(x) { return M.max(0, M.min(255, M.round(f < 0 ? x * (1 + f) : x + (255 - x) * f))); }
    return '#' + ((1 << 24) + (m(r) << 16) + (m(gg) << 8) + m(b)).toString(16).slice(1);
  }
  function pt(x, y) { return r1(x) + ',' + r1(y); }
  function polar(a, len) { var t = a * M.PI / 180; return [M.sin(t) * len, M.cos(t) * len]; } // a = 0: straight down; 90: right
  // approximate text width (system sans, bold) so bubbles and labels can wrap without measuring the DOM
  // (bold system sans; calibrated on a wide fallback font so text never overflows where the font is narrower)
  function textW(s, size) { var w = 0; s = String(s); for (var i = 0; i < s.length; i++) { var c = s[i]; w += /[il.,:;'!|]/.test(c) ? 0.33 : /[mwMW]/.test(c) ? 0.98 : /[A-Z]/.test(c) ? 0.76 : /[0-9]/.test(c) ? 0.68 : c === ' ' ? 0.33 : 0.64; } return w * size; }
  function wrap(s, size, maxW) {
    var words = String(s).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && textW(t, size) > maxW) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function seeded(str) { var x = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = M.imul(x, 16777619) >>> 0; } return function () { x = (M.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; }

  /* ---------------- palette ---------------- */
  var SKIN = ['#fde3cf', '#f3cdaa', '#e3ae83', '#c88c5f', '#9c6541', '#6f442b'];
  var HAIR = { black: '#1f1814', dark: '#3d2617', brown: '#7a4a26', auburn: '#a2481f', red: '#c9552a', blond: '#e3b65a', gray: '#a8a39d', white: '#ece8e0', blue: '#3c6fd1', pink: '#e27aa3' };
  var COL = { red: '#d9534a', orange: '#ef8a3c', yellow: '#f2c14e', green: '#5aa469', teal: '#3a9ea5', blue: '#4a7fd0', navy: '#2f4673', purple: '#8a62c4',
    pink: '#e27aa3', brown: '#8a5a3a', tan: '#c9a26b', gray: '#8a949c', white: '#f6f2ea', black: '#36322f', cream: '#efe2c4', gold: '#f0b429', silver: '#c5ccd3', olive: '#7d8a3a', maroon: '#8e2f3c', sky: '#8cc3ea' };
  function cc(c, dflt) { return !c ? dflt : COL[c] || HAIR[c] || c; }
  /* ---------------- the cast: original characters of all ages (front view, big heads so faces read at card size) ---------------- */
  // age: baby | kid | teen | adult | elder;  skin 0-5;  hair: style;  hc: hair color;  top, bottom, dress, shoes: colors
  var CAST = {
    // children
    pip:    { name: 'Pip', age: 'kid', skin: 0, hair: 'spiky', hc: 'red', top: 'blue', bottom: 'navy', freckles: true, desc: 'boy, red spiky hair, freckles, blue shirt' },
    zoe:    { name: 'Zoe', age: 'kid', skin: 4, hair: 'puffs', hc: 'black', dress: 'yellow', shoes: 'red', desc: 'girl, two hair puffs, yellow dress' },
    kai:    { name: 'Kai', age: 'kid', skin: 1, hair: 'bowl', hc: 'black', top: 'orange', bottom: 'gray', desc: 'boy, black bowl cut, orange shirt' },
    lila:   { name: 'Lila', age: 'kid', skin: 2, hair: 'braids', hc: 'dark', top: 'purple', bottom: 'blue', desc: 'girl, two long braids, purple shirt' },
    sami:   { name: 'Sami', age: 'kid', skin: 3, hair: 'curly', hc: 'dark', top: 'green', bottom: 'brown', glasses: true, desc: 'boy, curly hair, glasses, green shirt' },
    ivy:    { name: 'Ivy', age: 'kid', skin: 0, hair: 'pigtails', hc: 'blond', dress: 'pink', shoes: 'purple', desc: 'girl, blond pigtails, pink dress' },
    theo:   { name: 'Theo', age: 'baby', skin: 1, hair: 'tuft', hc: 'blond', top: 'sky', bottom: 'sky', desc: 'toddler, blond tuft, blue romper' },
    // teens
    maya:   { name: 'Maya', age: 'teen', skin: 3, hair: 'ponytail', hc: 'dark', top: 'teal', bottom: 'navy', desc: 'teen girl, ponytail, teal top' },
    jonah:  { name: 'Jonah', age: 'teen', skin: 1, hair: 'sidepart', hc: 'brown', top: 'red', bottom: 'gray', desc: 'teen boy, side-parted brown hair, red shirt' },
    rosa:   { name: 'Rosa', age: 'teen', skin: 2, hair: 'wavy', hc: 'brown', top: 'green', bottom: 'black', desc: 'teen girl, long wavy hair, green top' },
    dev:    { name: 'Dev', age: 'teen', skin: 4, hair: 'short', hc: 'black', top: 'yellow', bottom: 'navy', desc: 'teen boy, short black hair, yellow shirt' },
    // grown-ups
    ada:    { name: 'Ada', age: 'adult', skin: 1, hair: 'bob', hc: 'black', top: 'navy', bottom: 'gray', glasses: true, desc: 'woman, black bob, glasses, navy jacket' },
    omar:   { name: 'Omar', age: 'adult', skin: 3, hair: 'short', hc: 'black', top: 'green', bottom: 'brown', beard: true, desc: 'man, short black hair, beard, green shirt' },
    greta:  { name: 'Greta', age: 'adult', skin: 0, hair: 'bun', hc: 'blond', dress: 'red', shoes: 'maroon', desc: 'woman, blond bun, red dress' },
    marcus: { name: 'Marcus', age: 'adult', skin: 5, hair: 'buzz', hc: 'black', top: 'purple', bottom: 'navy', mustache: true, desc: 'man, buzz cut, mustache, purple sweater' },
    nell:   { name: 'Nell', age: 'adult', skin: 0, hair: 'curly-long', hc: 'auburn', top: 'cream', bottom: 'brown', freckles: true, desc: 'woman, curly auburn hair, freckles, cream top' },
    victor: { name: 'Victor', age: 'adult', skin: 2, hair: 'sidepart', hc: 'dark', top: 'white', bottom: 'black', mustache: true, vest: 'maroon', desc: 'man, slick hair, mustache, maroon vest' },
    felix:  { name: 'Felix', age: 'adult', skin: 1, hair: 'wavy-short', hc: 'brown', top: 'tan', bottom: 'olive', glasses: true, desc: 'man, wavy brown hair, glasses, tan sweater' },
    tia:    { name: 'Tia', age: 'adult', skin: 4, hair: 'braids', hc: 'black', top: 'orange', bottom: 'teal', desc: 'woman, long braids, orange top' },
    sven:   { name: 'Sven', age: 'adult', skin: 0, hair: 'short', hc: 'blond', top: 'red', bottom: 'navy', beard: true, build: 'big', pattern: 'plaid', desc: 'big man, blond beard, red plaid shirt' },
    lin:    { name: 'Lin', age: 'adult', skin: 1, hair: 'long', hc: 'black', dress: 'teal', shoes: 'navy', desc: 'woman, long black hair, teal dress' },
    jamal:  { name: 'Jamal', age: 'adult', skin: 4, hair: 'curly', hc: 'black', top: 'sky', bottom: 'gray', desc: 'man, short curly hair, light blue shirt' },
    priya:  { name: 'Priya', age: 'adult', skin: 3, hair: 'long', hc: 'dark', top: 'pink', bottom: 'navy', earrings: true, desc: 'woman, long dark hair, pink top' },
    // elders
    gus:    { name: 'Grandpa Gus', age: 'elder', skin: 1, hair: 'bald', hc: 'white', top: 'olive', bottom: 'brown', mustache: true, desc: 'grandfather, bald with white tufts, mustache, olive cardigan' },
    mae:    { name: 'Granny Mae', age: 'elder', skin: 0, hair: 'bun', hc: 'white', dress: 'purple', shoes: 'brown', glasses: true, desc: 'grandmother, white bun, glasses, purple dress' },
    lou:    { name: 'Nana Lou', age: 'elder', skin: 5, hair: 'curly', hc: 'white', top: 'teal', bottom: 'gray', earrings: true, desc: 'grandmother, short white curls, teal top' },
    edwin:  { name: 'Professor Edwin', age: 'elder', skin: 2, hair: 'balding', hc: 'gray', top: 'brown', bottom: 'gray', beard: 'long', glasses: true, desc: 'old professor, long gray beard, glasses, brown jacket' },
    rex:    { name: 'Rex', age: 'adult', skin: 2, hair: 'spiky', hc: 'black', top: 'black', bottom: 'gray', build: 'slim', desc: 'man, spiky black hair, black shirt (a handy villain or trickster)' }
  };
  var DIMS = {
    baby:  { R: 20, torso: 19, legs: 15, sh: 12, hip: 11, ua: 11, la: 10, aw: 7.5, lw: 8.5, fx: 6 },
    kid:   { R: 22, torso: 27, legs: 30, sh: 15, hip: 12, ua: 17, la: 16, aw: 8.5, lw: 9.5, fx: 7 },
    teen:  { R: 23, torso: 35, legs: 42, sh: 18, hip: 14, ua: 22, la: 21, aw: 9.5, lw: 10.5, fx: 8 },
    adult: { R: 24, torso: 40, legs: 52, sh: 21, hip: 16, ua: 26, la: 25, aw: 10.5, lw: 11.5, fx: 9 },
    elder: { R: 24, torso: 38, legs: 48, sh: 20, hip: 16, ua: 25, la: 24, aw: 10, lw: 11, fx: 9 }
  };
  // poses: limb angles in degrees (0 = straight down, positive = out to that side), [upper, lower] for arms and
  // [thigh, shin] for legs; L and R are the viewer's left and right. lean tilts the upper body; dir: the way the
  // figure faces; hold: which hand holds a prop ('R', 'L' or 'both' = between the hands)
  var POSES = {
    stand:    { aL: [10, 6], aR: [10, 6], lL: [3, 1], lR: [3, 1] },
    walk:     { aL: [-22, -10], aR: [28, 40], lL: [-24, -8], lR: [22, 6], dir: 1, lean: 3 },
    run:      { aL: [-50, 30], aR: [62, 140], lL: [-48, -10], lR: [52, -38], dir: 1, lean: 10, dy: -6 },
    jump:     { aL: [150, 165], aR: [150, 165], lL: [35, -15], lR: [35, -15], dy: -26 },
    sit:      { aL: [14, -30], aR: [14, -30], lL: [0, 2], lR: [0, 2], sit: true },
    sitfloor: { aL: [18, -10], aR: [18, -10], cross: true },
    lie:      { aL: [8, 4], aR: [8, 4], lL: [2, 0], lR: [2, 0], lie: true },
    kneel:    { aL: [16, -40], aR: [16, -40], kneel: true },
    wave:     { aL: [10, 6], aR: [140, 172], lL: [3, 1], lR: [3, 1] },
    point:    { aL: [10, 6], aR: [84, 88], lL: [3, 1], lR: [5, 2], dir: 1, hold: 'R' },
    pointup:  { aL: [10, 6], aR: [158, 176], lL: [3, 1], lR: [3, 1] },
    give:     { aL: [22, -62], aR: [22, -62], lL: [3, 1], lR: [3, 1], hold: 'both' },
    holdup:   { aL: [150, 178], aR: [150, 178], lL: [5, 2], lR: [5, 2], hold: 'up' },
    cheer:    { aL: [140, 150], aR: [140, 150], lL: [6, 2], lR: [6, 2] },
    shrug:    { aL: [48, 112], aR: [48, 112], lL: [3, 1], lR: [3, 1], shrug: 4 },
    think:    { aL: [16, -70], hR: [0.3, 1.0], lL: [3, 1], lR: [3, 1] },
    hips:     { aL: [58, -32], aR: [58, -32], lL: [7, 2], lR: [7, 2] },
    cross:    { aL: [22, -96], aR: [22, -96], lL: [5, 2], lR: [5, 2], crossArms: true },
    facepalm: { aL: [10, 6], hR: [0.25, 0.15], lL: [3, 1], lR: [3, 1], palm: true },
    shout:    { hL: [-0.42, 0.62], hR: [0.42, 0.62], lL: [6, 2], lR: [6, 2], cup: true },
    whisper:  { aL: [10, 6], hR: [0.62, 0.55], lL: [3, 1], lR: [3, 1], cup: true },
    shush:    { aL: [10, 6], hR: [0.12, 0.62], lL: [3, 1], lR: [3, 1], cup: true },
    read:     { aL: [18, -56], aR: [18, -56], lL: [3, 1], lR: [3, 1], hold: 'both' },
    carry:    { aL: [14, -34], aR: [14, -34], lL: [4, 1], lR: [4, 1], hold: 'both' },
    push:     { aL: [-62, -88], aR: [72, 86], lL: [-28, -12], lR: [26, 4], dir: 1, lean: 14 },
    pull:     { aL: [-40, -80], aR: [76, 86], lL: [-14, 4], lR: [30, 26], dir: 1, lean: -14 },
    bow:      { aL: [24, 12], aR: [4, -6], lL: [3, 1], lR: [3, 1], dir: 1, lean: 34 },
    sneak:    { aL: [-30, 70], aR: [40, 110], lL: [-26, 14], lR: [28, -20], dir: 1, lean: 8, dy: 0 },
    reach:    { aL: [10, 6], aR: [128, 140], lL: [3, 1], lR: [10, 4], dir: 1, lean: 6 },
    fall:     { aL: [150, 120], aR: [120, 160], lL: [40, 70], lR: [-30, -10], tilt: -28, dy: -10 },
    dance:    { aL: [80, 140], aR: [150, 168], lL: [3, 1], lR: [42, -24] },
    hide:     { hL: [-0.55, -1.0], hR: [0.55, -1.0], kneel: true, cup: true },
    handsup:  { aL: [118, 168], aR: [118, 168], lL: [5, 2], lR: [5, 2] },
    clap:     { aL: [26, -74], aR: [26, -74], lL: [3, 1], lR: [3, 1] },
    write:    { aL: [16, -50], aR: [22, -64], lL: [3, 1], lR: [3, 1], hold: 'R' },
    phone:    { aL: [10, 6], hR: [1.0, 0.2], lL: [3, 1], lR: [3, 1], hold: 'R', cup: true },
    eat:      { aL: [16, -60], hR: [0.3, 0.68], lL: [3, 1], lR: [3, 1], hold: 'R', cup: true },
    lift:     { aL: [8, -24], aR: [8, -24], lL: [28, -18], lR: [28, -18], hold: 'both', squat: true },
    tiptoe:   { aL: [40, 120], aR: [40, 120], lL: [4, 2], lR: [4, 2], toes: true },
    hug:      { aL: [40, -88], aR: [40, -88], lL: [3, 1], lR: [3, 1] },
    salute:   { aL: [10, 6], hR: [0.72, -0.42], lL: [3, 1], lR: [3, 1], cup: true },
    scratch:  { aL: [10, 6], hR: [0.75, -0.85], lL: [3, 1], lR: [3, 1], cup: true },
    panic:    { hL: [-1.05, -0.1], hR: [1.05, -0.1], lL: [8, 2], lR: [8, 2], cup: true },
    yawn:     { aL: [10, 6], hR: [0.2, 0.72], lL: [3, 1], lR: [3, 1], cup: true },
    stretch:  { aL: [170, 178], aR: [170, 178], lL: [3, 1], lR: [3, 1], dy: -2 }
  };
  // moods: eyes, brows, mouth and extras
  var MOODS = {
    happy:     { eyes: 'dot', mouth: 'smile', blush: 1 },
    joy:       { eyes: 'arc', mouth: 'grin', blush: 1 },
    laugh:     { eyes: 'squint', mouth: 'laugh', blush: 1 },
    neutral:   { eyes: 'dot', mouth: 'flat' },
    sad:       { eyes: 'dot', brows: 'worry', mouth: 'frown' },
    cry:       { eyes: 'shut', brows: 'worry', mouth: 'wail', tears: 1 },
    angry:     { eyes: 'dot', brows: 'angry', mouth: 'frown', flush: 1 },
    furious:   { eyes: 'squint', brows: 'angry', mouth: 'teeth', flush: 2 },
    scared:    { eyes: 'wide', brows: 'worry', mouth: 'wavy', sweat: 1 },
    surprised: { eyes: 'wide', brows: 'up', mouth: 'o' },
    shocked:   { eyes: 'wide', brows: 'up', mouth: 'drop' },
    sneaky:    { eyes: 'sly', brows: 'sly', mouth: 'smirk' },
    sleepy:    { eyes: 'sleep', mouth: 'small' },
    proud:     { eyes: 'content', brows: 'up', mouth: 'smirk', chin: -7 },
    confused:  { eyes: 'odd', brows: 'one', mouth: 'wavy' },
    bored:     { eyes: 'half', brows: 'flat', mouth: 'flat' },
    disgusted: { eyes: 'squint', brows: 'angry', mouth: 'tongue', green: 1 },
    worried:   { eyes: 'dot', brows: 'worry', mouth: 'wavy', sweat: 1 },
    shy:       { eyes: 'down', mouth: 'small', blush: 2 },
    love:      { eyes: 'heart', mouth: 'smile', blush: 2 },
    determined:{ eyes: 'dot', brows: 'firm', mouth: 'firm' },
    dizzy:     { eyes: 'spiral', mouth: 'wavy' },
    grumpy:    { eyes: 'half', brows: 'angry', mouth: 'frown' },
    wink:      { eyes: 'wink', mouth: 'grin', blush: 1 },
    thinking:  { eyes: 'up', brows: 'one', mouth: 'small' },
    sick:      { eyes: 'half', brows: 'worry', mouth: 'wavy', green: 2 },
    calm:      { eyes: 'content', mouth: 'smile' }
  };
  var HAIRS = ['short', 'spiky', 'curly', 'curly-long', 'afro', 'puffs', 'long', 'wavy', 'wavy-short', 'ponytail', 'pigtails', 'braids', 'bun', 'bob', 'bowl', 'bald', 'balding', 'buzz', 'sidepart', 'tuft', 'none'];
  var WEAR = ['crown', 'tophat', 'cap', 'chef', 'cowboy', 'beret', 'wizard', 'helmet', 'hardhat', 'party', 'strawhat', 'gradcap', 'beanie', 'bowler', 'pirate', 'viking', 'headphones', 'headband', 'laurel', 'tiara', 'hood',
    'cape', 'robe', 'apron', 'labcoat', 'armor', 'toga', 'scarf', 'tie', 'bowtie', 'vest', 'sash', 'medal', 'backpack', 'overalls', 'jacket', 'raincoat', 'judge',
    'glasses', 'sunglasses', 'monocle', 'mask', 'mustache', 'beard', 'bandage', 'necklace', 'earmuffs', 'goggles'];

  function hairTop(c, R, hy, hc, side) { // the hair drawn over the top of the head
    var s = c.hair, o = '', hcD = shade(hc, -0.25);
    function capPath(top, fringe) { return 'M' + pt(-R * 1.02, hy + R * 0.06) + 'C' + pt(-R * 1.08, hy - R * top) + ' ' + pt(R * 1.08, hy - R * top) + ' ' + pt(R * 1.02, hy + R * 0.06) + 'C' + pt(R * 0.8, hy - R * fringe) + ' ' + pt(-R * 0.4, hy - R * (fringe + 0.18)) + ' ' + pt(-R * 1.02, hy + R * 0.06) + 'Z'; }
    switch (s) {
      case 'short': case 'long': case 'wavy': case 'ponytail': case 'pigtails': case 'braids': case 'bun':
        o += path(capPath(1.42, 0.38), hc); break;
      case 'sidepart':
        o += path('M' + pt(-R * 1.02, hy + R * 0.1) + 'C' + pt(-R * 1.1, hy - R * 1.45) + ' ' + pt(R * 1.1, hy - R * 1.4) + ' ' + pt(R * 1.03, hy + R * 0.05) + 'C' + pt(R * 0.9, hy - R * 0.5) + ' ' + pt(R * 0.2, hy - R * 0.7) + ' ' + pt(-R * 0.25, hy - R * 0.62) + 'C' + pt(-R * 0.6, hy - R * 0.55) + ' ' + pt(-R * 0.9, hy - R * 0.2) + ' ' + pt(-R * 1.02, hy + R * 0.1) + 'Z', hc); break;
      case 'wavy-short':
        o += path('M' + pt(-R * 1.04, hy + R * 0.12) + 'C' + pt(-R * 1.2, hy - R * 1.5) + ' ' + pt(R * 1.2, hy - R * 1.5) + ' ' + pt(R * 1.04, hy + R * 0.12) + 'Q' + pt(R * 0.95, hy - R * 0.45) + ' ' + pt(R * 0.55, hy - R * 0.5) + 'Q' + pt(R * 0.3, hy - R * 0.25) + ' ' + pt(0, hy - R * 0.5) + 'Q' + pt(-R * 0.3, hy - R * 0.28) + ' ' + pt(-R * 0.6, hy - R * 0.5) + 'Q' + pt(-R * 0.95, hy - R * 0.4) + ' ' + pt(-R * 1.04, hy + R * 0.12) + 'Z', hc); break;
      case 'spiky':
        o += path('M' + pt(-R * 1.0, hy + R * 0.05) + 'L' + pt(-R * 1.15, hy - R * 0.75) + 'L' + pt(-R * 0.72, hy - R * 0.92) + 'L' + pt(-R * 0.62, hy - R * 1.42) + 'L' + pt(-R * 0.2, hy - R * 1.08) + 'L' + pt(R * 0.08, hy - R * 1.55) + 'L' + pt(R * 0.36, hy - R * 1.08) + 'L' + pt(R * 0.8, hy - R * 1.36) + 'L' + pt(R * 0.82, hy - R * 0.88) + 'L' + pt(R * 1.16, hy - R * 0.72) + 'L' + pt(R * 1.0, hy + R * 0.05) + 'C' + pt(R * 0.75, hy - R * 0.62) + ' ' + pt(-R * 0.5, hy - R * 0.78) + ' ' + pt(-R * 1.0, hy + R * 0.05) + 'Z', hc); break;
      case 'bowl':
        o += path('M' + pt(-R * 1.06, hy + R * 0.22) + 'C' + pt(-R * 1.15, hy - R * 1.5) + ' ' + pt(R * 1.15, hy - R * 1.5) + ' ' + pt(R * 1.06, hy + R * 0.22) + 'L' + pt(R * 0.86, hy - R * 0.28) + 'L' + pt(-R * 0.86, hy - R * 0.28) + 'Z', hc); break;
      case 'bob':
        o += path('M' + pt(-R * 1.08, hy + R * 0.45) + 'C' + pt(-R * 1.22, hy - R * 1.55) + ' ' + pt(R * 1.22, hy - R * 1.55) + ' ' + pt(R * 1.08, hy + R * 0.45) + 'L' + pt(R * 0.82, hy + R * 0.45) + 'C' + pt(R * 0.88, hy - R * 0.2) + ' ' + pt(R * 0.5, hy - R * 0.42) + ' ' + pt(-R * 0.1, hy - R * 0.4) + 'C' + pt(-R * 0.55, hy - R * 0.38) + ' ' + pt(-R * 0.85, hy - R * 0.1) + ' ' + pt(-R * 0.82, hy + R * 0.45) + 'Z', hc); break;
      case 'buzz':
        o += path(capPath(1.3, 0.62), hc); break;
      case 'curly': case 'puffs': case 'curly-long': case 'afro':
        if (s === 'puffs') { o += circ(-R * 0.82, hy - R * 0.92, R * 0.48, hc) + circ(R * 0.82, hy - R * 0.92, R * 0.48, hc); }
        var n = 9; for (var i = 0; i <= n; i++) { var a = M.PI * (1.0 + i / n); o += circ(M.cos(a) * R * 0.88, hy - R * 0.08 + M.sin(a) * R * 0.92, R * 0.3, hc, 1.6); }
        o += path(capPath(1.3, 0.55), hc, 0); break;
      case 'bald':
        o += path('M' + pt(-R * 1.0, hy + R * 0.25) + 'Q' + pt(-R * 1.12, hy - R * 0.25) + ' ' + pt(-R * 0.82, hy - R * 0.48) + 'Q' + pt(-R * 0.86, hy - R * 0.05) + ' ' + pt(-R * 0.72, hy + R * 0.2) + 'Z', hc) +
             path('M' + pt(R * 1.0, hy + R * 0.25) + 'Q' + pt(R * 1.12, hy - R * 0.25) + ' ' + pt(R * 0.82, hy - R * 0.48) + 'Q' + pt(R * 0.86, hy - R * 0.05) + ' ' + pt(R * 0.72, hy + R * 0.2) + 'Z', hc);
        o += stroke('M' + pt(-R * 0.45, hy - R * 0.62) + 'Q' + pt(-R * 0.25, hy - R * 0.7) + ' ' + pt(-R * 0.1, hy - R * 0.6), shade(SKIN[c.skin || 0], -0.18), 1.4); break;
      case 'balding':
        o += path('M' + pt(-R * 1.02, hy + R * 0.3) + 'Q' + pt(-R * 1.15, hy - R * 0.5) + ' ' + pt(-R * 0.62, hy - R * 0.78) + 'Q' + pt(-R * 0.82, hy - R * 0.2) + ' ' + pt(-R * 0.74, hy + R * 0.25) + 'Z', hc) +
             path('M' + pt(R * 1.02, hy + R * 0.3) + 'Q' + pt(R * 1.15, hy - R * 0.5) + ' ' + pt(R * 0.62, hy - R * 0.78) + 'Q' + pt(R * 0.82, hy - R * 0.2) + ' ' + pt(R * 0.74, hy + R * 0.25) + 'Z', hc) +
             stroke('M' + pt(-R * 0.2, hy - R * 0.98) + 'q' + pt(R * 0.2, -R * 0.25) + ' ' + pt(R * 0.4, 0), hc, 2.4); break;
      case 'tuft':
        o += path('M' + pt(-R * 0.25, hy - R * 0.92) + 'q' + pt(R * 0.05, -R * 0.55) + ' ' + pt(R * 0.45, -R * 0.4) + 'q' + pt(-R * 0.3, R * 0.05) + ' ' + pt(-R * 0.05, R * 0.38) + 'Z', hc, 1.6); break;
    }
    if (s === 'bun') o = circ(0, hy - R * 1.18, R * 0.42, hc) + o;
    return o;
  }
  function hairBack(c, R, hy, hc, d, side) { // the hair drawn behind the head and body
    var s = c.hair, o = '';
    if (s === 'long' || s === 'wavy') {
      var len = M.min(R * 2.3, d.torso + R * 0.9);
      if (s === 'wavy') o += path('M' + pt(-R * 1.05, hy - R * 0.2) + 'C' + pt(-R * 1.5, hy + len * 0.4) + ' ' + pt(-R * 1.0, hy + len * 0.7) + ' ' + pt(-R * 1.25, hy + len) + 'Q' + pt(0, hy + len * 1.12) + ' ' + pt(R * 1.25, hy + len) + 'C' + pt(R * 1.0, hy + len * 0.7) + ' ' + pt(R * 1.5, hy + len * 0.4) + ' ' + pt(R * 1.05, hy - R * 0.2) + 'Z', hc);
      else o += path('M' + pt(-R * 1.05, hy - R * 0.2) + 'Q' + pt(-R * 1.25, hy + len * 0.6) + ' ' + pt(-R * 1.1, hy + len) + 'L' + pt(R * 1.1, hy + len) + 'Q' + pt(R * 1.25, hy + len * 0.6) + ' ' + pt(R * 1.05, hy - R * 0.2) + 'Z', hc);
    }
    if (s === 'ponytail') o += path('M' + pt(side * R * 0.7, hy - R * 0.7) + 'C' + pt(side * R * 1.9, hy - R * 0.9) + ' ' + pt(side * R * 1.7, hy + R * 0.9) + ' ' + pt(side * R * 1.25, hy + R * 1.3) + 'C' + pt(side * R * 1.45, hy + R * 0.4) + ' ' + pt(side * R * 1.25, hy - R * 0.2) + ' ' + pt(side * R * 0.8, hy - R * 0.2) + 'Z', hc);
    if (s === 'pigtails') [-1, 1].forEach(function (k) { o += path('M' + pt(k * R * 0.85, hy - R * 0.45) + 'C' + pt(k * R * 1.75, hy - R * 0.55) + ' ' + pt(k * R * 1.8, hy + R * 0.6) + ' ' + pt(k * R * 1.4, hy + R * 0.95) + 'C' + pt(k * R * 1.45, hy + R * 0.35) + ' ' + pt(k * R * 1.2, hy + R * 0.05) + ' ' + pt(k * R * 0.9, hy + R * 0.0) + 'Z', hc) + circ(k * R * 0.98, hy - R * 0.38, R * 0.13, COL.red, 1.4); });
    if (s === 'bob') o += path('M' + pt(-R * 1.08, hy) + 'L' + pt(-R * 1.1, hy + R * 0.5) + 'L' + pt(R * 1.1, hy + R * 0.5) + 'L' + pt(R * 1.08, hy) + 'Z', hc);
    if (s === 'afro') o += circ(0, hy - R * 0.2, R * 1.3, hc);
    if (s === 'curly-long') [-1, 1].forEach(function (k) { for (var i = 0; i < 5; i++) o += circ(k * R * (1.0 + (i % 2) * 0.12), hy + R * (-0.2 + i * 0.36), R * 0.3, hc, 1.6); });
    return o;
  }
  function braidsFront(c, R, hy, hc) {
    if (c.hair !== 'braids') return '';
    var o = '';
    [-1, 1].forEach(function (k) {
      for (var i = 0; i < 5; i++) o += ell(k * R * 0.92, hy + R * 0.45 + i * R * 0.34, R * 0.2, R * 0.2, hc, 1.4);
      o += rect(k * R * 0.92 - R * 0.13, hy + R * 0.45 + 5 * R * 0.34 - R * 0.12, R * 0.26, R * 0.18, COL.yellow, 1.2, 2);
    });
    return o;
  }

  function face(c, R, hy, mood, look, fdir, isKid) {
    var m = MOODS[mood] || MOODS.happy, o = '', fx = fdir * R * 0.2, ex = R * 0.36, ey = hy + R * 0.1, er = R * 0.105;
    var lx = (look === 'left' ? -1 : look === 'right' ? 1 : 0) * R * 0.05 + fdir * R * 0.03, ly = look === 'up' ? -R * 0.05 : look === 'down' ? R * 0.05 : 0;
    var skin = SKIN[c.skin || 0];
    if (m.flush) o += ell(fx, hy + R * 0.15, R * 0.75, R * 0.45, '#e85c4a', 0, { opacity: m.flush > 1 ? 0.38 : 0.22 });
    if (m.green) o += ell(fx, hy + R * 0.1, R * 0.8, R * 0.6, '#6fbf5a', 0, { opacity: m.green > 1 ? 0.35 : 0.22 });
    if (m.blush || isKid) o += ell(fx - R * 0.6, hy + R * 0.42, R * 0.17, R * 0.11, '#ef7d7d', 0, { opacity: m.blush > 1 ? 0.7 : 0.4 }) + ell(fx + R * 0.6, hy + R * 0.42, R * 0.17, R * 0.11, '#ef7d7d', 0, { opacity: m.blush > 1 ? 0.7 : 0.4 });
    if (c.freckles) [-1, 1].forEach(function (k) { for (var i = 0; i < 3; i++) o += circ(fx + k * R * (0.5 + i * 0.1), hy + R * (0.32 + (i % 2) * 0.06), R * 0.03, shade(skin, -0.35), 0); });
    function eye(x, kind) {
      x += fx;
      switch (kind) {
        case 'wide': return circ(x, ey, R * 0.17, '#fff', 1.6) + circ(x + lx * 0.6, ey + ly, R * 0.065, INK, 0);
        case 'arc': return stroke('M' + pt(x - er * 1.3, ey + er * 0.4) + 'Q' + pt(x, ey - er * 1.6) + ' ' + pt(x + er * 1.3, ey + er * 0.4), INK, 2.2);
        case 'squint': var k = x < fx ? 1 : -1; return stroke('M' + pt(x - k * er * 1.2, ey - er * 1.1) + 'L' + pt(x + k * er * 0.9, ey) + 'L' + pt(x - k * er * 1.2, ey + er * 1.1), INK, 2.2);
        case 'shut': return stroke('M' + pt(x - er * 1.3, ey) + 'Q' + pt(x, ey + er * 1.2) + ' ' + pt(x + er * 1.3, ey), INK, 2.2);
        case 'sleep': return stroke('M' + pt(x - er * 1.3, ey + er * 0.2) + 'Q' + pt(x, ey + er * 1.3) + ' ' + pt(x + er * 1.3, ey + er * 0.2), INK, 2);
        case 'content': return stroke('M' + pt(x - er * 1.3, ey + er * 0.5) + 'Q' + pt(x, ey - er * 0.7) + ' ' + pt(x + er * 1.3, ey + er * 0.5), INK, 2);
        case 'half': return ell(x + lx * 0.4, ey + er * 0.35, er, er * 0.85, INK, 0) + line(x - er * 1.6, ey - er * 0.05, x + er * 1.6, ey - er * 0.05, INK, 2);
        case 'sly': var sx = (fdir || 1) * er * 0.55; return ell(x + sx, ey + er * 0.3, er * 0.95, er * 0.8, INK, 0) + stroke('M' + pt(x - er * 1.6, ey - er * 0.35) + 'L' + pt(x + er * 1.6, ey - er * 0.05), INK, 2);
        case 'heart': return path('M' + pt(x, ey + er * 1.3) + 'C' + pt(x - er * 2.4, ey - er * 0.4) + ' ' + pt(x - er * 0.9, ey - er * 2.0) + ' ' + pt(x, ey - er * 0.6) + 'C' + pt(x + er * 0.9, ey - er * 2.0) + ' ' + pt(x + er * 2.4, ey - er * 0.4) + ' ' + pt(x, ey + er * 1.3) + 'Z', '#e5484d', 1.2);
        case 'spiral': return stroke('M' + pt(x, ey) + 'm' + pt(-er * 0.3, 0) + 'a' + r1(er * 0.3) + ',' + r1(er * 0.3) + ' 0 1,1 ' + r1(er * 0.6) + ',0' + 'a' + r1(er * 0.7) + ',' + r1(er * 0.7) + ' 0 1,1 ' + r1(-er * 1.3) + ',0' + 'a' + r1(er * 1.1) + ',' + r1(er * 1.1) + ' 0 1,1 ' + r1(er * 2.1) + ',0', INK, 1.5);
        case 'down': return ell(x, ey + er * 0.6, er * 0.95, er * 0.8, INK, 0);
        case 'up': return ell(x + lx, ey - er * 0.5, er, er * 1.2, INK, 0) + circ(x + lx + er * 0.35, ey - er * 0.95, er * 0.32, '#fff', 0);
        default: return ell(x + lx, ey + ly, er, er * 1.25, INK, 0) + circ(x + lx + er * 0.35, ey + ly - er * 0.45, er * 0.34, '#fff', 0);
      }
    }
    var e = m.eyes;
    if (e === 'odd') o += eye(-ex, 'dot') + circ(fx + ex, ey, R * 0.15, '#fff', 1.6) + circ(fx + ex + lx * 0.5, ey, R * 0.06, INK, 0);
    else if (e === 'wink') o += eye(-ex, 'dot') + eye(ex, 'arc');
    else o += eye(-ex, e) + eye(ex, e);
    if (c.glasses) { [-1, 1].forEach(function (k) { o += circ(fx + k * ex, ey, R * 0.25, 'rgba(255,255,255,0.18)', 1.7); }); o += stroke('M' + pt(fx - ex + R * 0.25, ey) + 'Q' + pt(fx, ey - R * 0.08) + ' ' + pt(fx + ex - R * 0.25, ey), INK, 1.7); }
    // brows
    var by = ey - R * 0.3, bw = R * 0.17, br = m.brows;
    function brow(x, y1, y2) { return line(fx + x - bw, y1, fx + x + bw, y2, INK, 2.3); }
    if (br === 'worry') o += brow(-ex, by, by - R * 0.12) + brow(ex, by - R * 0.12, by);
    else if (br === 'angry') o += brow(-ex, by - R * 0.1, by + R * 0.04) + brow(ex, by + R * 0.04, by - R * 0.1);
    else if (br === 'up') o += stroke('M' + pt(fx - ex - bw, by - R * 0.06) + 'Q' + pt(fx - ex, by - R * 0.2) + ' ' + pt(fx - ex + bw, by - R * 0.06), INK, 2.2) + stroke('M' + pt(fx + ex - bw, by - R * 0.06) + 'Q' + pt(fx + ex, by - R * 0.2) + ' ' + pt(fx + ex + bw, by - R * 0.06), INK, 2.2);
    else if (br === 'one') o += brow(-ex, by, by) + stroke('M' + pt(fx + ex - bw, by - R * 0.06) + 'Q' + pt(fx + ex, by - R * 0.24) + ' ' + pt(fx + ex + bw, by - R * 0.1), INK, 2.2);
    else if (br === 'flat') o += brow(-ex, by + R * 0.02, by + R * 0.02) + brow(ex, by + R * 0.02, by + R * 0.02);
    else if (br === 'sly') o += brow(-ex, by - R * 0.06, by + R * 0.02) + brow(ex, by + R * 0.02, by - R * 0.06);
    else if (br === 'firm') o += brow(-ex, by - R * 0.04, by + R * 0.03) + brow(ex, by + R * 0.03, by - R * 0.04);
    // mouth
    var my = hy + R * 0.5, mw = R * 0.28, mx = fx * 1.1, mo = m.mouth;
    if (c.mustache && c.age !== 'kid') my += R * 0.04;
    switch (mo) {
      case 'smile': o += stroke('M' + pt(mx - mw, my - R * 0.03) + 'Q' + pt(mx, my + R * 0.25) + ' ' + pt(mx + mw, my - R * 0.03), INK, 2.2); break;
      case 'grin': o += path('M' + pt(mx - mw * 1.15, my - R * 0.06) + 'Q' + pt(mx, my - R * 0.02) + ' ' + pt(mx + mw * 1.15, my - R * 0.06) + 'Q' + pt(mx, my + R * 0.42) + ' ' + pt(mx - mw * 1.15, my - R * 0.06) + 'Z', '#8c2f2f', 1.8) + path('M' + pt(mx - mw * 0.55, my + R * 0.16) + 'Q' + pt(mx, my + R * 0.08) + ' ' + pt(mx + mw * 0.55, my + R * 0.16) + 'Q' + pt(mx, my + R * 0.27) + ' ' + pt(mx - mw * 0.55, my + R * 0.16) + 'Z', '#ef8b8b', 0); break;
      case 'laugh': o += path('M' + pt(mx - mw * 1.2, my - R * 0.08) + 'L' + pt(mx + mw * 1.2, my - R * 0.08) + 'Q' + pt(mx + mw, my + R * 0.5) + ' ' + pt(mx, my + R * 0.5) + 'Q' + pt(mx - mw, my + R * 0.5) + ' ' + pt(mx - mw * 1.2, my - R * 0.08) + 'Z', '#8c2f2f', 1.8) + ell(mx, my + R * 0.32, mw * 0.6, R * 0.1, '#ef8b8b', 0); break;
      case 'flat': o += line(mx - mw * 0.75, my + R * 0.06, mx + mw * 0.75, my + R * 0.06, INK, 2.2); break;
      case 'frown': o += stroke('M' + pt(mx - mw * 0.9, my + R * 0.16) + 'Q' + pt(mx, my - R * 0.08) + ' ' + pt(mx + mw * 0.9, my + R * 0.16), INK, 2.2); break;
      case 'wail': o += path('M' + pt(mx - mw * 0.9, my + R * 0.22) + 'Q' + pt(mx, my - R * 0.2) + ' ' + pt(mx + mw * 0.9, my + R * 0.22) + 'Q' + pt(mx, my + R * 0.32) + ' ' + pt(mx - mw * 0.9, my + R * 0.22) + 'Z', '#8c2f2f', 1.8); break;
      case 'teeth': o += rect(mx - mw * 1.0, my - R * 0.02, mw * 2.0, R * 0.24, '#fff', 1.8, 3) + line(mx - mw, my + R * 0.1, mx + mw, my + R * 0.1, INK, 1.2) + line(mx, my - R * 0.02, mx, my + R * 0.22, INK, 1); break;
      case 'wavy': o += stroke('M' + pt(mx - mw, my + R * 0.08) + 'q' + pt(mw * 0.33, -R * 0.1) + ' ' + pt(mw * 0.66, 0) + 'q' + pt(mw * 0.33, R * 0.1) + ' ' + pt(mw * 0.66, 0) + 'q' + pt(mw * 0.33, -R * 0.1) + ' ' + pt(mw * 0.66, 0), INK, 2); break;
      case 'o': o += ell(mx, my + R * 0.1, R * 0.1, R * 0.13, '#8c2f2f', 1.8); break;
      case 'drop': o += ell(mx, my + R * 0.16, R * 0.16, R * 0.24, '#8c2f2f', 1.8); break;
      case 'small': o += ell(mx, my + R * 0.08, R * 0.07, R * 0.05, '#8c2f2f', 1.4); break;
      case 'smirk': o += stroke('M' + pt(mx - mw * 0.7, my + R * 0.08) + 'Q' + pt(mx + mw * 0.2, my + R * 0.14) + ' ' + pt(mx + mw * 0.9, my - R * 0.06), INK, 2.2); break;
      case 'tongue': o += stroke('M' + pt(mx - mw * 0.9, my + R * 0.1) + 'Q' + pt(mx, my - R * 0.02) + ' ' + pt(mx + mw * 0.9, my + R * 0.1), INK, 2.1) + path('M' + pt(mx - R * 0.1, my + R * 0.06) + 'Q' + pt(mx, my + R * 0.32) + ' ' + pt(mx + R * 0.12, my + R * 0.06) + 'Z', '#ef6f7f', 1.4); break;
      case 'firm': o += stroke('M' + pt(mx - mw * 0.8, my + R * 0.06) + 'Q' + pt(mx, my + R * 0.13) + ' ' + pt(mx + mw * 0.8, my + R * 0.04), INK, 2.3); break;
    }
    if (m.tears) [-1, 1].forEach(function (k) { o += path('M' + pt(fx + k * ex, ey + R * 0.12) + 'Q' + pt(fx + k * (ex + R * 0.06), ey + R * 0.5) + ' ' + pt(fx + k * ex * 0.95, ey + R * 0.75) + 'Q' + pt(fx + k * (ex - R * 0.1), ey + R * 0.5) + ' ' + pt(fx + k * ex, ey + R * 0.12) + 'Z', '#7cc6f2', 1.2); });
    if (m.sweat) o += path('M' + pt(fx + R * 0.82, hy - R * 0.62) + 'Q' + pt(fx + R * 1.02, hy - R * 0.28) + ' ' + pt(fx + R * 0.82, hy - R * 0.22) + 'Q' + pt(fx + R * 0.64, hy - R * 0.3) + ' ' + pt(fx + R * 0.82, hy - R * 0.62) + 'Z', '#a9dcf7', 1.3);
    return o;
  }
  function facialHair(c, R, hy, fdir) {
    var o = '', fx = fdir * R * 0.2, hc = cc(c.hc, HAIR.dark);
    if (c.beard) {
      var long = c.beard === 'long', by = long ? R * 1.35 : R * 0.98;
      o += path('M' + pt(fx - R * 0.95, hy + R * 0.1) + 'Q' + pt(fx - R * 0.85, hy + by) + ' ' + pt(fx, hy + by + R * (long ? 0.3 : 0.06)) + 'Q' + pt(fx + R * 0.85, hy + by) + ' ' + pt(fx + R * 0.95, hy + R * 0.1) + 'Q' + pt(fx + R * 0.55, hy + R * 0.82) + ' ' + pt(fx, hy + R * 0.8) + 'Q' + pt(fx - R * 0.55, hy + R * 0.82) + ' ' + pt(fx - R * 0.95, hy + R * 0.1) + 'Z', hc, 1.8);
    }
    if (c.mustache || c.beard) o += path('M' + pt(fx * 1.1 - R * 0.42, hy + R * 0.52) + 'Q' + pt(fx * 1.1 - R * 0.2, hy + R * 0.3) + ' ' + pt(fx * 1.1, hy + R * 0.42) + 'Q' + pt(fx * 1.1 + R * 0.2, hy + R * 0.3) + ' ' + pt(fx * 1.1 + R * 0.42, hy + R * 0.52) + 'Q' + pt(fx * 1.1, hy + R * 0.5) + ' ' + pt(fx * 1.1 - R * 0.42, hy + R * 0.52) + 'Z', c.hc === 'white' ? '#d9d5cc' : hc, 1.6);
    return o;
  }

  // the person: returns { svg, head: [x, y], top, hands: { L, R, mid }, width } in the figure's own space (feet at y = 0)
  function person(p) {
    var c = Object.assign({}, CAST[p.who] || CAST.pip), d = DIMS[c.age] || DIMS.adult;
    if (p.age && DIMS[p.age]) { c.age = p.age; d = DIMS[p.age]; }
    if (p.color) Object.keys(p.color).forEach(function (k) { c[k] = p.color[k]; });
    if (c.build === 'big') d = Object.assign({}, d, { sh: d.sh + 5, hip: d.hip + 4, aw: d.aw + 2, lw: d.lw + 2 });
    if (c.build === 'slim') d = Object.assign({}, d, { sh: d.sh - 2, hip: d.hip - 2 });
    var pose = POSES[p.pose] || POSES.stand, R = d.R, skin = SKIN[c.skin == null ? 1 : c.skin], hc = cc(c.hc, HAIR.brown);
    var wear = [].concat(p.wear || []), has = function (w) { return wear.indexOf(w) >= 0; };
    var dress = c.dress ? cc(c.dress) : null, top = cc(c.top, dress || COL.blue), bottom = cc(c.bottom, COL.navy), shoes = cc(c.shoes, '#4a3b33');
    if (has('robe') || has('judge')) { top = has('judge') ? '#2b2b33' : cc(p.robe, COL.purple); }
    var fdir = p.face === 'left' ? -1 : p.face === 'right' ? 1 : p.face === 'front' ? 0 : (pose.dir ? 1 : 0);
    var sideTail = fdir < 0 ? 1 : -1;
    var hipY = -d.legs, shY = hipY - d.torso, hy = shY - R * 0.9;
    var thigh = d.legs * 0.52, shin = d.legs * 0.48 - 4;
    var o = '', back = '', legsS = '', body = '', armsS = '', headS = '', front = '', hands = {};
    // ---- legs (or a long skirt / robe)
    function leg(side, ang) {
      var hx = side * d.hip * 0.52, k = [hx + polar(side * ang[0], thigh)[0], hipY + polar(side * ang[0], thigh)[1]], a = [k[0] + polar(side * ang[1], shin)[0], k[1] + polar(side * ang[1], shin)[1]];
      return { hip: [hx, hipY], knee: k, ankle: a };
    }
    var Lg, Rg;
    if (pose.sit) { var th = d.lw * 0.6; Lg = { hip: [-d.hip * 0.6, hipY + th], knee: [-d.hip * 0.6, hipY + th], ankle: [-d.hip * 0.6, hipY + th + shin], lap: true }; Rg = { hip: [d.hip * 0.6, hipY + th], knee: [d.hip * 0.6, hipY + th], ankle: [d.hip * 0.6, hipY + th + shin], lap: true }; }
    else if (pose.kneel) { Lg = { hip: [-d.hip * 0.55, hipY], knee: [-d.hip * 0.6, hipY + thigh], ankle: [-d.hip * 0.6, hipY + thigh], kneel: true }; Rg = { hip: [d.hip * 0.55, hipY], knee: [d.hip * 0.6, hipY + thigh], ankle: [d.hip * 0.6, hipY + thigh], kneel: true }; }
    else if (pose.cross) { Lg = Rg = null; }
    else { Lg = leg(-1, pose.lL || [3, 1]); Rg = leg(1, pose.lR || [3, 1]); }
    var lowest = 0;
    if (Lg) lowest = M.max(Lg.ankle[1], Rg.ankle[1]) + (Lg.kneel ? 2 : 4); else lowest = hipY + d.lw * 1.1;
    var shift = -lowest + (pose.dy || 0); // move everything so the feet touch the ground
    if (pose.squat) shift += 0;
    function legSvg(L, side) {
      if (L.kneel) return limb('M' + pt(L.hip[0], L.hip[1]) + 'L' + pt(L.knee[0], L.knee[1] - d.lw * 0.3), bottom, d.lw) + ell(L.knee[0] + side * d.lw * 0.9, L.knee[1] - 2, d.lw * 0.75, d.lw * 0.4, shoes, 2);
      var dd = 'M' + pt(L.hip[0], L.hip[1]) + 'L' + pt(L.knee[0], L.knee[1]) + 'L' + pt(L.ankle[0], L.ankle[1]);
      var s = limb(dd, bottom, d.lw);
      var toe = pose.toes ? 4 : 0, fdx = (fdir || side * 0.4) * 3;
      s += ell(L.ankle[0] + fdx, L.ankle[1] + 2 - toe, d.lw * 0.8, d.lw * 0.45, shoes, 2);
      return s;
    }
    var lapS = '';
    if (Lg) { legsS += legSvg(Lg, -1) + legSvg(Rg, 1); if (Lg.lap) lapS = rect(-d.hip - 6, hipY - 3, d.hip * 2 + 12, d.lw * 1.35, dress ? top : bottom, LW, d.lw * 0.55); }
    else { // sitting cross-legged
      legsS += ell(-d.hip * 0.9, hipY + d.lw * 0.5, d.hip * 1.3, d.lw * 0.65, bottom, 2.2) + ell(d.hip * 0.9, hipY + d.lw * 0.5, d.hip * 1.3, d.lw * 0.65, bottom, 2.2);
      legsS += ell(-d.hip * 1.9, hipY + d.lw * 0.6, d.lw * 0.6, d.lw * 0.42, shoes, 2) + ell(d.hip * 1.9, hipY + d.lw * 0.6, d.lw * 0.6, d.lw * 0.42, shoes, 2);
    }
    // ---- torso
    var sh = d.sh, hw = d.hip, sy = shY - (pose.shrug || 0);
    var torsoD = 'M' + pt(-sh, sy + 9) + 'Q' + pt(-sh, sy) + ' ' + pt(-sh + 9, sy) + 'L' + pt(sh - 9, sy) + 'Q' + pt(sh, sy) + ' ' + pt(sh, sy + 9) + 'L' + pt(hw + 1, hipY + 3) + 'L' + pt(-hw - 1, hipY + 3) + 'Z';
    if (dress && !has('robe')) {
      var skirtB = pose.sit || pose.kneel || pose.cross ? hipY + d.lw : hipY + thigh * 0.95;
      torsoD = 'M' + pt(-sh, sy + 9) + 'Q' + pt(-sh, sy) + ' ' + pt(-sh + 9, sy) + 'L' + pt(sh - 9, sy) + 'Q' + pt(sh, sy) + ' ' + pt(sh, sy + 9) + 'L' + pt(hw - 2, hipY - 4) + 'L' + pt(hw + 9, skirtB) + 'Q' + pt(0, skirtB + 4) + ' ' + pt(-hw - 9, skirtB) + 'L' + pt(-hw + 2, hipY - 4) + 'Z';
    }
    if (has('robe') || has('judge') || has('toga')) {
      var rb = (pose.sit || pose.kneel) ? hipY + d.lw * 1.2 : -6;
      torsoD = 'M' + pt(-sh, sy + 9) + 'Q' + pt(-sh, sy) + ' ' + pt(-sh + 9, sy) + 'L' + pt(sh - 9, sy) + 'Q' + pt(sh, sy) + ' ' + pt(sh, sy + 9) + 'L' + pt(hw + 10, rb) + 'Q' + pt(0, rb + 4) + ' ' + pt(-hw - 10, rb) + 'Z';
      if (has('toga')) top = '#f4efe3';
    }
    body += rect(-sh * 0.24, sy - 8, sh * 0.48, 12, skin, 1.8, 2); // neck
    body += path(torsoD, top);
    if (c.pattern === 'plaid') { for (var pi = 1; pi < 4; pi++) body += line(-sh + pi * sh / 2, sy + 2, -sh + pi * sh / 2 + (pi - 2) * 2, hipY + 2, shade(top, -0.3), 1.4) + line(-sh + 2, sy + pi * d.torso / 4, sh - 2, sy + pi * d.torso / 4, shade(top, -0.3), 1.4); }
    if (c.vest) body += path('M' + pt(-sh + 3, sy + 4) + 'L' + pt(-sh * 0.2, sy + 2) + 'L' + pt(0, sy + d.torso * 0.5) + 'L' + pt(sh * 0.2, sy + 2) + 'L' + pt(sh - 3, sy + 4) + 'L' + pt(hw + 1, hipY + 3) + 'L' + pt(-hw - 1, hipY + 3) + 'Z', cc(c.vest));
    if (has('toga')) body += path('M' + pt(-sh + 2, sy + 2) + 'Q' + pt(0, sy + d.torso * 0.6) + ' ' + pt(hw + 6, hipY + 10) + 'L' + pt(hw + 2, hipY - 6) + 'Q' + pt(0, sy + d.torso * 0.3) + ' ' + pt(-sh * 0.4, sy) + 'Z', cc(p.sash, '#c0392b'), 1.6);
    // ---- arms
    function arm(side, ang) {
      var sx = side * (sh - d.aw * 0.45), syy = sy + d.aw * 0.55;
      var e = [sx + polar(side * ang[0], d.ua)[0], syy + polar(side * ang[0], d.ua)[1]], hnd = [e[0] + polar(side * ang[1], d.la)[0], e[1] + polar(side * ang[1], d.la)[1]];
      return { s: [sx, syy], e: e, h: hnd };
    }
    function armIK(side, tgt) { // two-bone reach toward a point near the head, elbow bent outward
      var sx = side * (sh - d.aw * 0.45), syy = sy + d.aw * 0.55, T = [tgt[0] * R, hy + tgt[1] * R], dx = T[0] - sx, dy = T[1] - syy;
      var dist = M.hypot(dx, dy), a = d.ua, b = d.la, dd = M.max(M.abs(a - b) + 0.5, M.min(a + b - 0.5, dist));
      var base = M.atan2(dy, dx), ang = M.acos(M.max(-1, M.min(1, (a * a + dd * dd - b * b) / (2 * a * dd))));
      var e1 = [sx + M.cos(base + ang) * a, syy + M.sin(base + ang) * a], e2 = [sx + M.cos(base - ang) * a, syy + M.sin(base - ang) * a];
      var e = side * e1[0] + e1[1] * 0.3 > side * e2[0] + e2[1] * 0.3 ? e1 : e2; // the elbow that sticks out to the side (and down)
      var h = dist > dd ? [sx + dx / dist * dd, syy + dy / dist * dd] : T;
      if (dist > dd) { var ux = (h[0] - e[0]), uy = (h[1] - e[1]); }
      return { s: [sx, syy], e: e, h: h };
    }
    var AL = pose.hL ? armIK(-1, pose.hL) : arm(-1, pose.aL || [10, 6]), AR = pose.hR ? armIK(1, pose.hR) : arm(1, pose.aR || [10, 6]);
    var sleeve = shade(top, -0.12);
    if (has('labcoat') || has('jacket') || has('raincoat')) sleeve = has('labcoat') ? '#eef1f3' : has('raincoat') ? COL.yellow : cc(p.jacket, COL.navy);
    function armSvg(A) { return limb('M' + pt(A.s[0], A.s[1]) + 'L' + pt(A.e[0], A.e[1]) + 'L' + pt(A.h[0], A.h[1]), sleeve, d.aw); }
    function handSvg(A) { return circ(A.h[0], A.h[1], d.aw * 0.58, skin, 1.9); }
    hands.L = AL.h; hands.R = AR.h; hands.mid = [(AL.h[0] + AR.h[0]) / 2, (AL.h[1] + AR.h[1]) / 2];
    // ---- wear on the body
    var cape = '', bodyWear = '';
    if (has('cape')) cape += path('M' + pt(-sh + 2, sy + 2) + 'Q' + pt(-sh - 14, -22) + ' ' + pt(-sh - 10, -4) + 'L' + pt(sh + 10, -4) + 'Q' + pt(sh + 14, -22) + ' ' + pt(sh - 2, sy + 2) + 'Z', cc(p.cape, COL.red));
    if (has('backpack')) cape += rect(-sh * 0.85, sy + 6, sh * 1.7, d.torso * 0.75, cc(p.pack, COL.orange), 2, 6);
    if (has('labcoat')) bodyWear += path('M' + pt(-sh, sy + 9) + 'Q' + pt(-sh, sy) + ' ' + pt(-sh + 9, sy) + 'L' + pt(-sh * 0.15, sy) + 'L' + pt(-sh * 0.1, hipY + d.legs * 0.45) + 'L' + pt(-hw - 8, hipY + d.legs * 0.45) + 'Z', '#eef1f3') + path('M' + pt(sh, sy + 9) + 'Q' + pt(sh, sy) + ' ' + pt(sh - 9, sy) + 'L' + pt(sh * 0.15, sy) + 'L' + pt(sh * 0.1, hipY + d.legs * 0.45) + 'L' + pt(hw + 8, hipY + d.legs * 0.45) + 'Z', '#eef1f3');
    if (has('jacket') || has('raincoat')) { var jc = has('raincoat') ? COL.yellow : cc(p.jacket, COL.navy); bodyWear += path('M' + pt(-sh, sy + 9) + 'Q' + pt(-sh, sy) + ' ' + pt(-sh + 9, sy) + 'L' + pt(-sh * 0.18, sy) + 'L' + pt(-sh * 0.08, hipY + 4) + 'L' + pt(-hw - 2, hipY + 4) + 'Z', jc) + path('M' + pt(sh, sy + 9) + 'Q' + pt(sh, sy) + ' ' + pt(sh - 9, sy) + 'L' + pt(sh * 0.18, sy) + 'L' + pt(sh * 0.08, hipY + 4) + 'L' + pt(hw + 2, hipY + 4) + 'Z', jc); }
    if (has('vest')) bodyWear += path('M' + pt(-sh + 3, sy + 4) + 'L' + pt(-sh * 0.2, sy + 2) + 'L' + pt(0, sy + d.torso * 0.5) + 'L' + pt(sh * 0.2, sy + 2) + 'L' + pt(sh - 3, sy + 4) + 'L' + pt(hw + 1, hipY + 3) + 'L' + pt(-hw - 1, hipY + 3) + 'Z', cc(p.vest, COL.brown));
    if (has('apron')) bodyWear += path('M' + pt(-sh * 0.55, sy + d.torso * 0.25) + 'L' + pt(sh * 0.55, sy + d.torso * 0.25) + 'L' + pt(hw + 2, hipY + thigh * 0.8) + 'L' + pt(-hw - 2, hipY + thigh * 0.8) + 'Z', cc(p.apron, '#ffffff')) + line(-sh * 0.55, sy + d.torso * 0.25, -sh * 0.3, sy - 2, INK, 1.6) + line(sh * 0.55, sy + d.torso * 0.25, sh * 0.3, sy - 2, INK, 1.6);
    if (has('overalls')) bodyWear += path('M' + pt(-sh * 0.6, sy + d.torso * 0.3) + 'L' + pt(sh * 0.6, sy + d.torso * 0.3) + 'L' + pt(hw + 1, hipY + 3) + 'L' + pt(-hw - 1, hipY + 3) + 'Z', COL.blue) + line(-sh * 0.55, sy + d.torso * 0.3, -sh * 0.45, sy, INK, 2.4) + line(sh * 0.55, sy + d.torso * 0.3, sh * 0.45, sy, INK, 2.4);
    if (has('armor')) bodyWear += path('M' + pt(-sh - 1, sy + 7) + 'Q' + pt(-sh, sy - 1) + ' ' + pt(-sh + 8, sy - 1) + 'L' + pt(sh - 8, sy - 1) + 'Q' + pt(sh, sy - 1) + ' ' + pt(sh + 1, sy + 7) + 'L' + pt(hw + 2, hipY + 4) + 'L' + pt(-hw - 2, hipY + 4) + 'Z', '#b9c2ca') + line(0, sy + 3, 0, hipY, '#7d8790', 1.6) + path('M' + pt(-hw - 2, hipY + 4) + 'L' + pt(hw + 2, hipY + 4) + 'L' + pt(hw + 4, hipY + 14) + 'L' + pt(-hw - 4, hipY + 14) + 'Z', '#9aa5ae');
    if (has('judge')) bodyWear += path('M' + pt(-sh * 0.3, sy) + 'L' + pt(0, sy + 12) + 'L' + pt(sh * 0.3, sy) + 'Z', '#f4f1ea', 1.4);
    if (has('sash')) bodyWear += path('M' + pt(-sh + 2, sy + 2) + 'L' + pt(-sh + 10, sy + 2) + 'L' + pt(hw + 2, hipY) + 'L' + pt(hw - 6, hipY + 2) + 'Z', cc(p.sash, COL.red), 1.6);
    if (has('tie')) bodyWear += path('M0,' + r1(sy + 1) + 'l-4,4 l4,' + r1(d.torso * 0.55) + ' l4,' + r1(-d.torso * 0.55) + ' z', cc(p.tie, COL.red), 1.4);
    if (has('bowtie')) bodyWear += path('M0,' + r1(sy + 3) + 'l-8,-5 v10 z M0,' + r1(sy + 3) + 'l8,-5 v10 z', cc(p.tie, COL.red), 1.4);
    if (has('scarf')) bodyWear += path('M' + pt(-sh * 0.6, sy - 4) + 'Q' + pt(0, sy + 6) + ' ' + pt(sh * 0.6, sy - 4) + 'L' + pt(sh * 0.6, sy + 4) + 'Q' + pt(0, sy + 14) + ' ' + pt(-sh * 0.6, sy + 4) + 'Z', cc(p.scarf, COL.red), 1.8) + rect(sh * 0.2, sy + 4, 8, d.torso * 0.5, cc(p.scarf, COL.red), 1.8, 2);
    if (has('medal')) bodyWear += line(-sh * 0.3, sy, 0, sy + d.torso * 0.35, COL.blue, 3) + line(sh * 0.3, sy, 0, sy + d.torso * 0.35, COL.blue, 3) + circ(0, sy + d.torso * 0.42, 6, COL.gold, 1.8);
    if (has('necklace')) bodyWear += stroke('M' + pt(-sh * 0.35, sy) + 'Q' + pt(0, sy + 12) + ' ' + pt(sh * 0.35, sy), '#f2f2f2', 2.6) + circ(0, sy + 7, 2.6, '#9fd3f0', 1.2);
    if (has('backpack')) bodyWear += line(-sh * 0.55, sy + 1, -sh * 0.5, sy + d.torso * 0.7, INK, 2.6) + line(sh * 0.55, sy + 1, sh * 0.5, sy + d.torso * 0.7, INK, 2.6);
    if (has('bandage')) bodyWear += '';
    // ---- head
    var headTilt = (MOODS[p.mood] || {}).chin || 0;
    var hd = '';
    var hairB = hairBack(c, R, hy, hc, d, sideTail);
    hd += circ(-R * 0.98, hy + R * 0.1, R * 0.2, skin, 1.8) + circ(R * 0.98, hy + R * 0.1, R * 0.2, skin, 1.8);
    hd += circ(0, hy, R, skin);
    if (c.earrings) hd += circ(-R * 1.0, hy + R * 0.38, 2.4, COL.gold, 1.1) + circ(R * 1.0, hy + R * 0.38, 2.4, COL.gold, 1.1);
    hd += facialHair(c, R, hy, fdir);
    hd += face(c, R, hy, p.mood || 'happy', p.look, fdir, c.age === 'kid' || c.age === 'baby');
    if (c.hair === 'bald' && c.beard === 'long') { }
    hd += hairTop(c, R, hy, hc, sideTail);
    hd += braidsFront(c, R, hy, hc);
    hd += headWear(wear, R, hy, p, fdir);
    var headG = headTilt ? g(hd, 'rotate(' + headTilt + ' 0 ' + r1(hy + R) + ')') : hd;
    var hairG = headTilt ? g(hairB, 'rotate(' + headTilt + ' 0 ' + r1(hy + R) + ')') : hairB;
    // ---- assemble: back things, legs, body, arms, head, hands and held things
    var held = '';
    if (p.holds) {
      var hk = p.hand || pose.hold || 'R', hp = hk === 'both' ? hands.mid : hk === 'up' ? [hands.mid[0], hands.mid[1] - 8] : hk === 'L' ? hands.L : hands.R;
      held = propSvg(p.holds, hp[0], hp[1], (p.hsize || 1) * (d.R / 24), { held: true, text: p.htext, color: p.hcolor, flip: hk === 'L' });
    }
    var armsFirst = pose.crossArms || pose.palm || pose.cup || AL.h[1] < sy - R * 0.4 || AR.h[1] < sy - R * 0.4;
    var upper = hairG + cape + body + lapS + bodyWear;
    var armsBelow = armSvg(AL) + armSvg(AR), handsS = handSvg(AL) + handSvg(AR);
    if (armsFirst) upper += headG + armsBelow + held + handsS;
    else upper += armsBelow + headG + held + handsS;
    if (pose.lean) upper = g(upper, 'rotate(' + pose.lean + ' 0 ' + r1(hipY) + ')');
    o = legsS + upper;
    if (pose.tilt) o = g(o, 'rotate(' + pose.tilt + ' 0 ' + r1(hipY) + ')');
    o = g(o, 'translate(0,' + r1(shift) + ')');
    // where things are, in the figure's space (for bubbles and effects)
    function lean(xy) { if (!pose.lean) return [xy[0], xy[1] + shift]; var a = pose.lean * M.PI / 180, dx = xy[0], dy = xy[1] - hipY; return [dx * M.cos(a) - dy * M.sin(a), hipY + dx * M.sin(a) + dy * M.cos(a) + shift]; }
    var headC = lean([0, hy]);
    var topY = headC[1] - R * 1.35 - (wear.some(function (w) { return /tophat|wizard|chef|crown|party|viking/.test(w); }) ? R * 0.9 : 0);
    return { svg: o, head: headC, R: R, top: topY, hipY: hipY + shift, hands: { L: lean(hands.L), R: lean(hands.R), mid: lean(hands.mid) }, width: sh * 2 + 24, feet: shift, body: lean([0, (sy + hipY) / 2]) };
  }

  function headWear(wear, R, hy, p, fdir) {
    var o = '', top = hy - R;
    wear.forEach(function (w) {
      var col = p['hat'] ? cc(p.hat) : null;
      switch (w) {
        case 'crown': o += path('M' + pt(-R * 0.75, top + R * 0.25) + 'L' + pt(-R * 0.8, top - R * 0.55) + 'L' + pt(-R * 0.4, top - R * 0.15) + 'L' + pt(0, top - R * 0.7) + 'L' + pt(R * 0.4, top - R * 0.15) + 'L' + pt(R * 0.8, top - R * 0.55) + 'L' + pt(R * 0.75, top + R * 0.25) + 'Z', col || COL.gold) + circ(0, top - R * 0.05, R * 0.1, COL.red, 1.4); break;
        case 'tiara': o += path('M' + pt(-R * 0.7, top + R * 0.35) + 'Q' + pt(0, top - R * 0.45) + ' ' + pt(R * 0.7, top + R * 0.35) + 'Q' + pt(0, top) + ' ' + pt(-R * 0.7, top + R * 0.35) + 'Z', COL.silver, 1.6) + circ(0, top - R * 0.12, R * 0.09, '#9fd3f0', 1.2); break;
        case 'laurel': for (var i = 0; i < 6; i++) { var a = M.PI * (1.08 + i * 0.14); o += ell(M.cos(a) * R * 1.0, hy + M.sin(a) * R * 0.9, R * 0.16, R * 0.08, COL.green, 1.2, { transform: 'rotate(' + r1(a * 180 / M.PI + 90) + ' ' + r1(M.cos(a) * R) + ' ' + r1(hy + M.sin(a) * R * 0.9) + ')' }); var b = M.PI * (-0.08 - i * 0.14); o += ell(M.cos(b) * R * 1.0, hy + M.sin(b) * R * 0.9, R * 0.16, R * 0.08, COL.green, 1.2, { transform: 'rotate(' + r1(b * 180 / M.PI + 90) + ' ' + r1(M.cos(b) * R) + ' ' + r1(hy + M.sin(b) * R * 0.9) + ')' }); } break;
        case 'tophat': o += rect(-R * 1.05, top + R * 0.12, R * 2.1, R * 0.22, col || COL.black, 2, 3) + rect(-R * 0.68, top - R * 1.0, R * 1.36, R * 1.15, col || COL.black, 2, 3) + rect(-R * 0.68, top - R * 0.12, R * 1.36, R * 0.2, COL.red, 0); break;
        case 'bowler': o += ell(0, top + R * 0.22, R * 1.1, R * 0.18, col || COL.black) + path('M' + pt(-R * 0.75, top + R * 0.22) + 'Q' + pt(-R * 0.75, top - R * 0.6) + ' ' + pt(0, top - R * 0.6) + 'Q' + pt(R * 0.75, top - R * 0.6) + ' ' + pt(R * 0.75, top + R * 0.22) + 'Z', col || COL.black); break;
        case 'cap': o += path('M' + pt(-R * 1.0, top + R * 0.5) + 'Q' + pt(-R * 1.0, top - R * 0.25) + ' ' + pt(0, top - R * 0.25) + 'Q' + pt(R * 1.0, top - R * 0.25) + ' ' + pt(R * 1.0, top + R * 0.5) + 'Z', col || COL.red) + path('M' + pt(fdir >= 0 ? R * 0.2 : -R * 1.5, top + R * 0.42) + 'h' + r1(R * 1.3) + 'q' + r1(fdir >= 0 ? R * 0.3 : 0) + ',' + r1(R * 0.2) + ' 0,' + r1(R * 0.22) + 'h' + r1(-R * 1.3) + 'z', shade(col || COL.red, -0.2)); break;
        case 'chef': o += rect(-R * 0.75, top - R * 0.15, R * 1.5, R * 0.55, '#fff', 2, 2) + path('M' + pt(-R * 0.75, top - R * 0.1) + 'C' + pt(-R * 1.4, top - R * 0.6) + ' ' + pt(-R * 0.8, top - R * 1.5) + ' ' + pt(-R * 0.2, top - R * 1.1) + 'C' + pt(0, top - R * 1.7) + ' ' + pt(R * 0.9, top - R * 1.5) + ' ' + pt(R * 0.6, top - R * 1.0) + 'C' + pt(R * 1.4, top - R * 0.9) + ' ' + pt(R * 1.2, top - R * 0.2) + ' ' + pt(R * 0.75, top - R * 0.1) + 'Z', '#fff'); break;
        case 'cowboy': o += path('M' + pt(-R * 1.6, top + R * 0.3) + 'Q' + pt(0, top + R * 0.7) + ' ' + pt(R * 1.6, top + R * 0.3) + 'Q' + pt(R * 1.2, top + R * 0.15) + ' ' + pt(R * 0.75, top + R * 0.25) + 'L' + pt(R * 0.6, top - R * 0.6) + 'Q' + pt(0, top - R * 0.4) + ' ' + pt(-R * 0.6, top - R * 0.6) + 'L' + pt(-R * 0.75, top + R * 0.25) + 'Q' + pt(-R * 1.2, top + R * 0.15) + ' ' + pt(-R * 1.6, top + R * 0.3) + 'Z', col || COL.tan); break;
        case 'strawhat': o += ell(0, top + R * 0.35, R * 1.55, R * 0.3, col || '#e8c86a') + path('M' + pt(-R * 0.7, top + R * 0.35) + 'Q' + pt(-R * 0.7, top - R * 0.5) + ' ' + pt(0, top - R * 0.5) + 'Q' + pt(R * 0.7, top - R * 0.5) + ' ' + pt(R * 0.7, top + R * 0.35) + 'Z', col || '#e8c86a') + rect(-R * 0.7, top + R * 0.05, R * 1.4, R * 0.2, COL.red, 0); break;
        case 'beret': o += ell(fdir * R * 0.2, top + R * 0.1, R * 1.0, R * 0.42, col || COL.maroon) + circ(fdir * R * 0.2, top - R * 0.3, R * 0.08, col || COL.maroon, 1.4); break;
        case 'wizard': o += path('M' + pt(-R * 1.3, top + R * 0.35) + 'Q' + pt(0, top + R * 0.6) + ' ' + pt(R * 1.3, top + R * 0.35) + 'Q' + pt(0, top + R * 0.05) + ' ' + pt(-R * 1.3, top + R * 0.35) + 'Z', col || COL.navy) + path('M' + pt(-R * 0.75, top + R * 0.3) + 'L' + pt(R * 0.3, top - R * 1.9) + 'L' + pt(R * 0.75, top + R * 0.3) + 'Z', col || COL.navy) + starPath(R * 0.05, top - R * 0.5, R * 0.2, COL.gold); break;
        case 'party': o += path('M' + pt(-R * 0.5, top + R * 0.15) + 'L' + pt(0, top - R * 1.4) + 'L' + pt(R * 0.5, top + R * 0.15) + 'Z', col || COL.pink) + line(-R * 0.25, top - R * 0.55, R * 0.25, top - R * 0.45, COL.yellow, 3) + circ(0, top - R * 1.45, R * 0.15, COL.yellow, 1.4); break;
        case 'gradcap': o += path('M' + pt(-R * 1.3, top - R * 0.1) + 'L' + pt(0, top - R * 0.55) + 'L' + pt(R * 1.3, top - R * 0.1) + 'L' + pt(0, top + R * 0.3) + 'Z', COL.black) + rect(-R * 0.6, top + R * 0.05, R * 1.2, R * 0.4, COL.black, 2, 2) + stroke('M' + pt(R * 0.1, top - R * 0.2) + 'L' + pt(R * 1.0, top + R * 0.1) + 'L' + pt(R * 1.0, top + R * 0.65), COL.gold, 2); break;
        case 'beanie': o += path('M' + pt(-R * 1.02, top + R * 0.62) + 'Q' + pt(-R * 1.05, top - R * 0.45) + ' ' + pt(0, top - R * 0.45) + 'Q' + pt(R * 1.05, top - R * 0.45) + ' ' + pt(R * 1.02, top + R * 0.62) + 'Z', col || COL.teal) + rect(-R * 1.04, top + R * 0.4, R * 2.08, R * 0.28, shade(col || COL.teal, -0.2), 2, 3) + circ(0, top - R * 0.55, R * 0.2, '#fff', 1.6); break;
        case 'helmet': o += path('M' + pt(-R * 1.08, hy + R * 0.25) + 'Q' + pt(-R * 1.15, top - R * 0.35) + ' ' + pt(0, top - R * 0.35) + 'Q' + pt(R * 1.15, top - R * 0.35) + ' ' + pt(R * 1.08, hy + R * 0.25) + 'L' + pt(R * 0.75, hy - R * 0.18) + 'L' + pt(-R * 0.75, hy - R * 0.18) + 'Z', '#b9c2ca') + rect(-R * 0.08 + fdir * R * 0.2, hy - R * 0.2, R * 0.16, R * 0.45, '#9aa5ae', 1.6) + circ(0, top - R * 0.4, R * 0.12, COL.red, 1.4); break;
        case 'hardhat': o += path('M' + pt(-R * 0.95, top + R * 0.42) + 'Q' + pt(-R * 0.95, top - R * 0.4) + ' ' + pt(0, top - R * 0.4) + 'Q' + pt(R * 0.95, top - R * 0.4) + ' ' + pt(R * 0.95, top + R * 0.42) + 'Z', COL.yellow) + rect(-R * 1.25, top + R * 0.35, R * 2.5, R * 0.18, COL.yellow, 2, 3); break;
        case 'pirate': o += path('M' + pt(-R * 1.4, top + R * 0.25) + 'Q' + pt(-R * 0.6, top - R * 0.9) + ' ' + pt(0, top - R * 0.3) + 'Q' + pt(R * 0.6, top - R * 0.9) + ' ' + pt(R * 1.4, top + R * 0.25) + 'Q' + pt(0, top + R * 0.5) + ' ' + pt(-R * 1.4, top + R * 0.25) + 'Z', COL.black) + circ(0, top - R * 0.05, R * 0.14, '#fff', 1.2); break;
        case 'viking': o += path('M' + pt(-R * 0.95, top + R * 0.5) + 'Q' + pt(-R * 0.95, top - R * 0.4) + ' ' + pt(0, top - R * 0.4) + 'Q' + pt(R * 0.95, top - R * 0.4) + ' ' + pt(R * 0.95, top + R * 0.5) + 'Z', '#b9c2ca') + path('M' + pt(-R * 0.85, top) + 'Q' + pt(-R * 1.6, top - R * 0.3) + ' ' + pt(-R * 1.4, top - R * 1.1) + 'Q' + pt(-R * 1.2, top - R * 0.5) + ' ' + pt(-R * 0.7, top - R * 0.3) + 'Z', COL.cream) + path('M' + pt(R * 0.85, top) + 'Q' + pt(R * 1.6, top - R * 0.3) + ' ' + pt(R * 1.4, top - R * 1.1) + 'Q' + pt(R * 1.2, top - R * 0.5) + ' ' + pt(R * 0.7, top - R * 0.3) + 'Z', COL.cream); break;
        case 'hood': o += path('M' + pt(-R * 1.2, hy + R * 0.9) + 'Q' + pt(-R * 1.4, top - R * 0.5) + ' ' + pt(0, top - R * 0.45) + 'Q' + pt(R * 1.4, top - R * 0.5) + ' ' + pt(R * 1.2, hy + R * 0.9) + 'L' + pt(R * 0.9, hy + R * 0.6) + 'Q' + pt(R * 1.0, top + R * 0.1) + ' ' + pt(0, top + R * 0.05) + 'Q' + pt(-R * 1.0, top + R * 0.1) + ' ' + pt(-R * 0.9, hy + R * 0.6) + 'Z', col || COL.gray); break;
        case 'headphones': o += stroke('M' + pt(-R * 1.05, hy) + 'Q' + pt(-R * 1.1, top - R * 0.35) + ' ' + pt(0, top - R * 0.35) + 'Q' + pt(R * 1.1, top - R * 0.35) + ' ' + pt(R * 1.05, hy), INK, 3.5) + rect(-R * 1.25, hy - R * 0.3, R * 0.4, R * 0.65, COL.red, 2, 4) + rect(R * 0.85, hy - R * 0.3, R * 0.4, R * 0.65, COL.red, 2, 4); break;
        case 'earmuffs': o += stroke('M' + pt(-R * 1.0, hy) + 'Q' + pt(0, top - R * 0.5) + ' ' + pt(R * 1.0, hy), INK, 2.6) + circ(-R * 1.02, hy + R * 0.05, R * 0.3, COL.pink, 1.8) + circ(R * 1.02, hy + R * 0.05, R * 0.3, COL.pink, 1.8); break;
        case 'headband': o += rect(-R * 1.0, top + R * 0.35, R * 2.0, R * 0.22, col || COL.red, 1.8, 2); break;
        case 'glasses': break;
        case 'sunglasses': o += path('M' + pt(-R * 0.75, hy + R * 0.0) + 'h' + r1(R * 0.62) + 'v' + r1(R * 0.22) + 'q0,' + r1(R * 0.14) + ' ' + r1(-R * 0.31) + ',' + r1(R * 0.14) + 'q' + r1(-R * 0.31) + ',0 ' + r1(-R * 0.31) + ',' + r1(-R * 0.14) + 'Z M' + pt(R * 0.13, hy) + 'h' + r1(R * 0.62) + 'v' + r1(R * 0.22) + 'q0,' + r1(R * 0.14) + ' ' + r1(-R * 0.31) + ',' + r1(R * 0.14) + 'q' + r1(-R * 0.31) + ',0 ' + r1(-R * 0.31) + ',' + r1(-R * 0.14) + 'Z', INK, 1.4) + line(-R * 0.13, hy + R * 0.04, R * 0.13, hy + R * 0.04, INK, 2); break;
        case 'monocle': o += circ(fdir * R * 0.2 + R * 0.36, hy + R * 0.1, R * 0.24, 'rgba(255,255,255,0.25)', 1.8) + stroke('M' + pt(fdir * R * 0.2 + R * 0.55, hy + R * 0.25) + 'q' + pt(R * 0.3, R * 0.5) + ' ' + pt(R * 0.1, R * 1.1), INK, 1); break;
        case 'mask': o += path('M' + pt(-R * 0.95, hy - R * 0.05) + 'Q' + pt(0, hy - R * 0.25) + ' ' + pt(R * 0.95, hy - R * 0.05) + 'L' + pt(R * 0.85, hy + R * 0.3) + 'Q' + pt(R * 0.4, hy + R * 0.35) + ' ' + pt(0, hy + R * 0.18) + 'Q' + pt(-R * 0.4, hy + R * 0.35) + ' ' + pt(-R * 0.85, hy + R * 0.3) + 'Z', COL.black, 1.6) + ell(fdir * R * 0.2 - R * 0.36, hy + R * 0.1, R * 0.13, R * 0.1, '#fff', 0) + ell(fdir * R * 0.2 + R * 0.36, hy + R * 0.1, R * 0.13, R * 0.1, '#fff', 0) + circ(fdir * R * 0.2 - R * 0.33, hy + R * 0.1, R * 0.06, INK, 0) + circ(fdir * R * 0.2 + R * 0.39, hy + R * 0.1, R * 0.06, INK, 0); break;
        case 'goggles': o += rect(-R * 1.05, hy - R * 0.1, R * 2.1, R * 0.18, '#5b4636', 0) + circ(-R * 0.38, hy + R * 0.0, R * 0.3, '#9fd3f0', 2) + circ(R * 0.38, hy + R * 0.0, R * 0.3, '#9fd3f0', 2); break;
        case 'bandage': o += rect(R * 0.15, top + R * 0.25, R * 0.6, R * 0.22, '#f2dcc4', 1.4, 2, { transform: 'rotate(-20 ' + r1(R * 0.45) + ' ' + r1(top + R * 0.36) + ')' }); break;
        case 'mustache': o += path('M' + pt(fdir * R * 0.22 - R * 0.45, hy + R * 0.52) + 'Q' + pt(fdir * R * 0.22 - R * 0.2, hy + R * 0.28) + ' ' + pt(fdir * R * 0.22, hy + R * 0.42) + 'Q' + pt(fdir * R * 0.22 + R * 0.2, hy + R * 0.28) + ' ' + pt(fdir * R * 0.22 + R * 0.45, hy + R * 0.52) + 'Q' + pt(fdir * R * 0.22, hy + R * 0.48) + ' ' + pt(fdir * R * 0.22 - R * 0.45, hy + R * 0.52) + 'Z', HAIR.dark, 1.6); break;
      }
    });
    return o;
  }
  function starPath(x, y, r, fill, w) { var d = ''; for (var i = 0; i < 10; i++) { var a = -M.PI / 2 + i * M.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + pt(x + M.cos(a) * rr, y + M.sin(a) * rr); } return path(d + 'Z', fill || COL.gold, w == null ? 1.5 : w); }
  /* ---------------- animals: simple side views facing right (flip: true faces left); feet on y = 0 ---------------- */
  function aEye(x, y, r, mood, side) {
    mood = mood || 'happy';
    var o = '';
    switch (mood) {
      case 'sleepy': return stroke('M' + pt(x - r * 1.2, y) + 'Q' + pt(x, y + r * 1.2) + ' ' + pt(x + r * 1.2, y), INK, 1.8);
      case 'joy': case 'proud': case 'calm': return stroke('M' + pt(x - r * 1.2, y + r * 0.4) + 'Q' + pt(x, y - r * 1.1) + ' ' + pt(x + r * 1.2, y + r * 0.4), INK, 1.8);
      case 'scared': case 'surprised': case 'shocked': return circ(x, y, r * 1.5, '#fff', 1.5) + circ(x + r * 0.3, y, r * 0.55, INK, 0);
      case 'sneaky': case 'bored': case 'grumpy': return ell(x + r * 0.3, y + r * 0.35, r * 0.85, r * 0.65, INK, 0) + line(x - r * 1.3, y - r * 0.15, x + r * 1.3, y - r * 0.15, INK, 1.8) + (mood === 'grumpy' ? line(x - r, y - r * 1.4, x + r * 1.2, y - r * 0.7, INK, 1.8) : '');
      case 'love': return path('M' + pt(x, y + r * 1.2) + 'C' + pt(x - r * 2.2, y - r * 0.3) + ' ' + pt(x - r * 0.8, y - r * 1.8) + ' ' + pt(x, y - r * 0.5) + 'C' + pt(x + r * 0.8, y - r * 1.8) + ' ' + pt(x + r * 2.2, y - r * 0.3) + ' ' + pt(x, y + r * 1.2) + 'Z', '#e5484d', 1);
      case 'dizzy': return stroke('M' + pt(x - r, y) + 'a' + r1(r) + ',' + r1(r) + ' 0 1,1 ' + r1(r * 1.6) + ',0' + 'a' + r1(r * 0.6) + ',' + r1(r * 0.6) + ' 0 1,1 ' + r1(-r) + ',0', INK, 1.4);
    }
    o += ell(x, y, r, r * 1.15, INK, 0) + circ(x + r * 0.35, y - r * 0.4, r * 0.35, '#fff', 0);
    if (mood === 'angry' || mood === 'furious' || mood === 'determined') o += line(x - r * 1.4, y - r * 2.1, x + r * 1.4, y - r * 1.0, INK, 2);
    if (mood === 'sad' || mood === 'worried' || mood === 'cry') o += line(x - r * 1.4, y - r * 1.2, x + r * 1.4, y - r * 2.0, INK, 2);
    if (mood === 'cry') o += path('M' + pt(x, y + r * 1.2) + 'q' + pt(r * 0.8, r * 1.6) + ' 0,' + r1(r * 2.4) + 'q' + pt(-r * 0.8, -r * 0.8) + ' 0,' + r1(-r * 2.4) + 'z', '#7cc6f2', 1);
    return o;
  }
  function aMouth(x, y, w, mood) {
    if (mood === 'sad' || mood === 'cry' || mood === 'angry' || mood === 'grumpy' || mood === 'worried') return stroke('M' + pt(x - w, y + w * 0.4) + 'Q' + pt(x, y - w * 0.3) + ' ' + pt(x + w, y + w * 0.4), INK, 1.8);
    if (mood === 'surprised' || mood === 'scared' || mood === 'shocked') return ell(x, y + w * 0.2, w * 0.4, w * 0.55, '#8c2f2f', 1.4);
    if (mood === 'neutral' || mood === 'bored' || mood === 'sleepy' || mood === 'sneaky') return line(x - w * 0.7, y, x + w * 0.7, y, INK, 1.6);
    return stroke('M' + pt(x - w, y - w * 0.1) + 'Q' + pt(x, y + w * 0.7) + ' ' + pt(x + w, y - w * 0.1), INK, 1.8);
  }
  function legs4(xs, y0, len, w, col, hoof) { var o = ''; xs.forEach(function (x) { o += limb('M' + pt(x, y0) + 'L' + pt(x, -2), col, w); if (hoof) o += rect(x - w * 0.6, -5, w * 1.2, 5, hoof, 1.6, 1); }); return o; }
  var ANIMALS = {
    dog: { h: 48, c: '#c9925a', draw: function (m, c) { var d = shade(c, -0.25); return limb('M-26,-30 Q-38,-48 -30,-54', c, 6) + legs4([-20, -10, 10, 20], -20, 18, 7, c) + ell(0, -28, 26, 13, c) + circ(25, -42, 13, c) + ell(37, -38, 8, 6, c) + circ(44, -40, 3, INK, 0) + path('M18,-52 Q8,-50 12,-30 Q20,-34 22,-46 Z', d) + aEye(28, -45, 2.4, m) + aMouth(36, -32, 4, m); } },
    cat: { h: 40, c: '#e09a4a', draw: function (m, c) { var d = shade(c, -0.2); return limb('M-22,-22 Q-40,-28 -34,-50', c, 5) + legs4([-16, -8, 8, 16], -14, 14, 6, c) + ell(0, -22, 22, 11, c) + path('M14,-46 L16,-60 L24,-50 Z M30,-50 L36,-60 L36,-45 Z', c) + circ(26, -40, 12, c) + aEye(24, -42, 2.2, m) + aEye(32, -42, 2.2, m) + path('M28,-37 l-2,2 h4 z', '#e86f7d', 1) + aMouth(28, -33, 3, m) + line(32, -36, 44, -38, INK, 1) + line(32, -34, 44, -32, INK, 1) + stroke('M-6,-30 q4,4 8,0 M4,-31 q4,4 8,0', d, 1.6); } },
    mouse: { h: 16, c: '#a7a5a8', draw: function (m, c) { return stroke('M-14,-6 Q-30,-2 -34,-12', '#d08a8a', 1.6) + ell(0, -8, 14, 8, c) + circ(12, -12, 7, c) + circ(9, -19, 5, '#e8b7b7', 1.6) + circ(20, -11, 1.6, '#e86f7d', 0) + aEye(14, -13, 1.4, m); } },
    rabbit: { h: 46, c: '#efe9e2', draw: function (m, c) { return circ(-18, -18, 6, '#fff') + ell(0, -16, 18, 14, c) + ell(14, -48, 4.5, 14, c, LW, { transform: 'rotate(10 14 -48)' }) + ell(21, -46, 4.5, 14, c, LW, { transform: 'rotate(22 21 -46)' }) + circ(18, -32, 11, c) + aEye(21, -34, 2.2, m) + circ(28, -30, 2, '#e86f7d', 0) + aMouth(25, -26, 2.5, m) + ell(8, -3, 8, 4, c); } },
    horse: { h: 112, c: '#9a6440', draw: function (m, c) { var d = shade(c, -0.35); return limb('M-40,-68 Q-56,-52 -50,-30', d, 8) + legs4([-30, -20, 24, 34], -55, 50, 9, c, '#4a3b33') + ell(0, -66, 44, 20, c) + path('M22,-74 Q30,-96 40,-104 L54,-98 Q46,-84 40,-66 Z', c) + path('M38,-108 Q46,-116 56,-110 L78,-92 Q84,-82 74,-80 Q66,-80 60,-86 L44,-94 Z', c) + path('M38,-106 Q28,-96 22,-76 L28,-74 Q34,-92 44,-102 Z', d) + path('M42,-110 l2,-10 l7,8 z', c) + aEye(54, -102, 2.6, m) + circ(75, -86, 1.6, INK, 0) + aMouth(72, -82, 3, m); } },
    cow: { h: 86, c: '#f4f0e8', draw: function (m, c) { return limb('M-42,-58 Q-50,-44 -48,-30', c, 4) + legs4([-30, -20, 22, 32], -45, 40, 9, c, '#4a3b33') + rect(-44, -76, 86, 36, c, LW, 16) + ell(-18, -64, 12, 8, INK, 0) + ell(12, -54, 9, 7, INK, 0) + ell(28, -70, 7, 5, INK, 0) + path('M38,-90 l-8,-8 l2,10 z M58,-90 l8,-8 l-2,10 z', COL.cream) + rect(36, -94, 26, 28, c, LW, 10) + rect(38, -76, 24, 14, '#f2b7b7', LW, 7) + circ(45, -69, 1.6, INK, 0) + circ(55, -69, 1.6, INK, 0) + aEye(43, -86, 2.4, m) + aEye(55, -86, 2.4, m); } },
    pig: { h: 46, c: '#f2a7b5', draw: function (m, c) { var d = shade(c, -0.15); return stroke('M-30,-28 q-8,-4 -6,-10 q4,-4 6,2', INK, 1.8) + legs4([-18, -8, 10, 20], -16, 14, 8, c) + ell(0, -26, 30, 18, c) + path('M18,-46 l4,-10 l6,8 z', d) + ell(32, -26, 6, 8, d) + circ(31, -28, 1.4, INK, 0) + circ(31, -24, 1.4, INK, 0) + aEye(20, -34, 2.2, m) + aMouth(24, -17, 3, m); } },
    sheep: { h: 52, c: '#f5f3ee', draw: function (m, c) { var o = legs4([-16, -6, 8, 18], -20, 18, 6, '#3c3532'); for (var i = 0; i < 8; i++) { var a = i / 8 * M.PI * 2; o += circ(M.cos(a) * 20, -32 + M.sin(a) * 11, 11, c, 1.8); } o += ell(0, -32, 22, 13, c, 0); return o + ell(28, -40, 9, 12, '#3c3532') + ell(21, -44, 6, 3, '#3c3532', LW, { transform: 'rotate(-30 21 -44)' }) + aEye(31, -42, 2, m === 'happy' ? 'happy' : m).replace(/fill="#2a2320"/g, 'fill="#fff"') + aMouth(31, -34, 2, m).replace(/stroke="#2a2320"/g, 'stroke="#fff"'); } },
    donkey: { h: 96, c: '#9a9590', draw: function (m, c) { var d = shade(c, -0.3); return limb('M-34,-56 Q-44,-40 -40,-28', d, 5) + legs4([-26, -16, 20, 30], -48, 44, 8, c, '#4a3b33') + ell(0, -58, 38, 17, c) + path('M20,-64 Q26,-80 34,-88 L46,-82 Q40,-70 36,-56 Z', c) + ell(40, -104, 4.5, 14, c, LW, { transform: 'rotate(-14 40 -104)' }) + ell(48, -102, 4.5, 14, c, LW, { transform: 'rotate(10 48 -102)' }) + path('M34,-92 Q42,-98 50,-94 L68,-80 Q72,-70 62,-68 Q54,-68 50,-74 L38,-80 Z', c) + ell(62, -74, 7, 6, '#d8d2cc') + aEye(47, -88, 2.4, m) + circ(65, -75, 1.4, INK, 0); } },
    goat: { h: 66, c: '#e8e0d2', draw: function (m, c) { return path('M-24,-46 l-6,-6 l2,8 z', c, 1.6) + legs4([-18, -10, 12, 20], -32, 28, 6, c, '#4a3b33') + ell(0, -40, 26, 13, c) + path('M14,-46 Q18,-58 24,-62 L32,-56 Q28,-50 26,-40 Z', c) + stroke('M26,-66 Q22,-80 32,-84 M30,-64 Q30,-76 38,-78', '#a89e8e', 3) + path('M24,-64 Q32,-68 38,-62 L46,-52 Q48,-46 42,-45 L30,-50 Z', c) + path('M22,-62 L14,-62 L20,-58 Z', c, 1.4) + path('M36,-48 l-2,10 l5,-8 z', '#a89e8e', 1.4) + aEye(33, -58, 2, m) + aMouth(42, -48, 2, m); } },
    chicken: { h: 38, c: '#fbf8f2', draw: function (m, c) { return stroke('M-4,-8 l-2,8 M4,-8 l2,8', '#e3a12f', 2.4) + path('M-20,-24 Q-24,-34 -14,-36 Q-4,-38 6,-30 Q14,-40 20,-38 Q26,-30 18,-14 Q8,-6 -6,-8 Q-18,-12 -20,-24 Z', c) + path('M14,-42 q2,-6 5,-1 q2,-5 5,0 q1,4 -4,5 z', COL.red, 1.4) + path('M24,-34 l7,2 l-7,3 z', '#f2b33d', 1.4) + path('M22,-29 q2,5 -2,6 q-2,-4 2,-6z', COL.red, 1.2) + aEye(19, -35, 1.7, m) + stroke('M-10,-24 q6,6 12,0', '#d9d3c7', 1.6); } },
    duck: { h: 32, c: '#f5f0e2', draw: function (m, c) { return path('M-22,-14 Q-26,-24 -16,-22 Q-6,-26 4,-20 Q8,-36 18,-36 Q28,-34 24,-22 Q20,-10 4,-6 Q-16,-4 -22,-14 Z', c) + path('M25,-30 l10,2 l-10,4 z', '#f2b33d', 1.4) + aEye(19, -30, 1.8, m) + stroke('M-10,-18 q8,6 14,-2', '#d9d3c7', 1.6) + stroke('M0,-5 l-2,5 M6,-5 l2,5', '#f2b33d', 2); } },
    owl: { h: 46, c: '#a07a52', draw: function (m, c) { var o = path('M-16,-4 Q-20,-30 -14,-40 L-16,-50 L-8,-44 Q0,-46 8,-44 L16,-50 L14,-40 Q20,-30 16,-4 Z', c) + ell(0, -16, 9, 11, '#e8d7b8', 1.6) + circ(-7, -34, 7, '#fff', 1.8) + circ(7, -34, 7, '#fff', 1.8) + path('M-2,-28 l2,5 l2,-5 z', '#f2b33d', 1.2) + stroke('M-6,0 v-4 M6,0 v-4', '#f2b33d', 2);
      if (m === 'sleepy') o += stroke('M-12,-34 q5,4 10,0 M2,-34 q5,4 10,0', INK, 1.8); else o += circ(-6, -34, 3.2, INK, 0) + circ(8, -34, 3.2, INK, 0) + circ(-5, -35, 1, '#fff', 0) + circ(9, -35, 1, '#fff', 0);
      return o; } },
    parrot: { h: 42, c: '#3fae5a', draw: function (m, c) { return path('M-6,-12 L-18,4 L-8,2 L-2,-10 Z', COL.blue) + path('M-10,-12 Q-14,-30 -2,-38 Q10,-42 12,-30 Q12,-16 -2,-8 Z', c) + path('M8,-36 Q18,-36 16,-26 Q14,-28 10,-28 Z', '#f2b33d', 1.4) + path('M-6,-22 Q-14,-12 -4,-10 Z', COL.red, 1.4) + aEye(4, -32, 1.8, m) + stroke('M-4,-8 v6 M2,-9 v6', '#7a6a5a', 1.6); } },
    peacock: { h: 72, c: '#2f7fd0', draw: function (m, c) { var o = ''; for (var i = -5; i <= 5; i++) { var a = (i * 15 - 0) * M.PI / 180, x = -6 + M.sin(a) * 44, y = -30 - M.cos(a) * 40; o += stroke('M-6,-26 L' + pt(x, y), '#3a7a4a', 1.4) + ell(x, y, 8, 10, '#3fae5a', 1.4) + circ(x, y, 4, COL.blue, 1.2) + circ(x, y, 1.6, INK, 0); } return o + path('M-4,-6 Q-12,-24 -2,-30 Q2,-44 10,-46 Q16,-46 14,-38 Q12,-26 10,-8 Z', c) + path('M16,-42 l6,2 l-6,2 z', '#f2b33d', 1.2) + stroke('M10,-48 l-2,-8 M12,-48 l2,-8', INK, 1.2) + aEye(12, -42, 1.5, m) + stroke('M0,-6 v6 M6,-6 v6', '#7a6a5a', 1.6); } },
    crow: { h: 30, c: '#2d2b33', draw: function (m, c) { return path('M-22,-14 L-30,-12 L-22,-8 Z', c) + path('M-20,-12 Q-18,-24 0,-24 Q8,-30 14,-26 Q18,-20 12,-14 Q4,-6 -12,-8 Z', c) + path('M16,-25 l8,2 l-8,3 z', '#555', 1.2) + circ(11, -24, 1.8, '#fff', 0) + circ(11.4, -24, 0.9, INK, 0) + stroke('M-2,-8 v8 M4,-9 v8', '#555', 1.6); } },
    fox: { h: 44, c: '#e7772e', draw: function (m, c) { return path('M-22,-24 Q-50,-30 -50,-14 Q-44,-6 -24,-16 Z', c) + path('M-50,-14 Q-48,-6 -40,-10 Q-46,-12 -44,-18 Z', '#fff', 1.4) + legs4([-14, -6, 8, 16], -14, 12, 5, '#3c3532') + ell(0, -22, 22, 10, c) + path('M14,-30 L22,-50 L26,-36 L34,-48 L34,-30 Q48,-24 34,-20 Q20,-18 14,-30 Z', c) + path('M34,-24 Q44,-24 46,-22 Q38,-18 32,-20 Z', '#fff', 1.2) + circ(46, -23, 1.8, INK, 0) + aEye(28, -32, 2, m); } },
    wolf: { h: 60, c: '#8d939b', draw: function (m, c) { return path('M-28,-34 Q-50,-36 -50,-20 Q-42,-24 -28,-26 Z', c) + legs4([-20, -10, 14, 24], -20, 18, 7, c) + ell(0, -32, 30, 14, c) + path('M20,-40 L26,-62 L32,-48 L40,-60 L40,-40 Q58,-34 42,-28 Q26,-24 20,-40 Z', c) + path('M40,-32 Q52,-32 54,-30 Q46,-26 40,-28 Z', '#e9e6e0', 1.2) + circ(54, -31, 2, INK, 0) + aEye(33, -44, 2.2, m); } },
    bear: { h: 84, c: '#8a5a3a', draw: function (m, c) { var d = shade(c, 0.35); return legs4([-26, -14, 16, 28], -26, 24, 13, c) + ell(0, -46, 38, 26, c) + circ(34, -58, 8, c) + circ(48, -58, 8, c) + circ(40, -46, 17, c) + ell(48, -40, 9, 7, d, 1.6) + ell(52, -43, 3, 2.2, INK, 0) + aEye(40, -50, 2.4, m) + aMouth(48, -35, 3, m); } },
    lion: { h: 72, c: '#e0a94e', draw: function (m, c) { var mane = '#a8571f', o = limb('M-34,-40 Q-52,-40 -50,-58', c, 5) + circ(-50, -60, 5, mane) + legs4([-24, -12, 14, 24], -26, 24, 9, c) + ell(-2, -40, 34, 16, c); for (var i = 0; i < 12; i++) { var a = i / 12 * M.PI * 2; o += circ(30 + M.cos(a) * 16, -52 + M.sin(a) * 16, 9, mane, 1.8); } return o + circ(30, -52, 16, mane, 0) + circ(32, -52, 13, c) + ell(40, -46, 6, 5, shade(c, 0.3), 1.4) + ell(43, -48, 2.4, 1.8, INK, 0) + aEye(34, -56, 2.2, m) + aMouth(40, -41, 3, m); } },
    elephant: { h: 116, c: '#9aa3ab', draw: function (m, c) { var d = shade(c, -0.15); return stroke('M-46,-70 q-8,6 -6,16', INK, 2) + legs4([-34, -18, 20, 36], -44, 40, 16, c) + ell(0, -66, 50, 30, c) + circ(46, -76, 22, c) + path('M60,-70 Q74,-52 70,-30 Q66,-26 62,-30 Q64,-50 52,-62 Z', c) + path('M36,-92 Q14,-96 16,-70 Q20,-54 38,-60 Z', d) + path('M58,-62 q10,4 14,-2 q-10,-2 -14,2 z', '#fff', 1.4) + aEye(52, -82, 2.6, m); } },
    giraffe: { h: 176, c: '#f0c25a', draw: function (m, c) { var s = '#b8742e', o = legs4([-24, -14, 16, 26], -60, 56, 7, c, '#4a3b33') + ell(0, -72, 34, 18, c) + path('M18,-84 L40,-150 L54,-146 L34,-74 Z', c) + path('M38,-150 Q40,-164 54,-164 L72,-154 Q76,-146 66,-144 L52,-142 Z', c) + stroke('M44,-162 v-10 M50,-162 v-10', s, 3) + circ(44, -173, 2.6, s, 1.2) + circ(50, -173, 2.6, s, 1.2); [[-14, -76], [6, -66], [-2, -82], [18, -74], [30, -100], [38, -126], [26, -86]].forEach(function (q) { o += ell(q[0], q[1], 5, 4, s, 1); }); return o + aEye(54, -156, 2.2, m) + circ(70, -149, 1.3, INK, 0); } },
    monkey: { h: 56, c: '#8a5a3a', draw: function (m, c) { var f = '#e7c39a'; return stroke('M-16,-14 Q-40,-10 -36,-34 Q-34,-44 -26,-40', c, 5).replace(/stroke-width="5"/, 'stroke-width="5"') + limb('M-12,-10 L-16,-1', c, 8) + limb('M12,-10 L16,-1', c, 8) + ell(0, -20, 16, 18, c) + ell(0, -16, 9, 11, f, 1.6) + circ(-17, -46, 7, f) + circ(17, -46, 7, f) + circ(0, -46, 15, c) + ell(0, -42, 11, 10, f, 1.6) + aEye(-5, -46, 2, m) + aEye(5, -46, 2, m) + aMouth(0, -37, 3.5, m); } },
    sloth: { h: 64, c: '#a08a6e', draw: function (m, c) { var f = '#e7d8c0'; return line(-40, -66, 40, -66, '#7a5a3a', 6) + limb('M-12,-40 L-18,-66', c, 7) + limb('M12,-40 L18,-66', c, 7) + stroke('M-20,-66 l-3,-4 M-17,-66 l0,-5 M16,-66 l0,-5 M19,-66 l3,-4', INK, 1.4) + ell(0, -26, 18, 22, c) + circ(0, -40, 13, c) + ell(0, -39, 10, 8, f, 1.4) + ell(-5, -39, 4.5, 3, '#5a4632', 0) + ell(5, -39, 4.5, 3, '#5a4632', 0) + aEye(-5, -39, 1.6, m === 'happy' ? 'sleepy' : m).replace(/stroke="#2a2320"/g, 'stroke="#fff"') + aEye(5, -39, 1.6, m === 'happy' ? 'sleepy' : m).replace(/stroke="#2a2320"/g, 'stroke="#fff"') + aMouth(0, -34, 2.4, m); } },
    turtle: { h: 26, c: '#5aa469', draw: function (m, c) { var s = '#8a6a3a'; return ell(-14, -5, 5, 4, c) + ell(12, -5, 5, 4, c) + circ(28, -14, 7, c) + path('M-24,-6 Q-22,-30 2,-30 Q24,-30 24,-6 Z', s) + path('M-12,-8 L-8,-20 L4,-24 L14,-18 L14,-8 M-8,-20 L-18,-12 M4,-24 L4,-30 M14,-18 L22,-14', 'none', 1.4) + aEye(30, -16, 1.6, m) + aMouth(32, -11, 2, m); } },
    snail: { h: 24, c: '#e8c99a', draw: function (m, c) { return path('M-20,0 Q-22,-6 -14,-6 L20,-6 Q24,-14 26,-20 L30,-20 Q30,-6 24,0 Z', c) + stroke('M24,-20 l-2,-8 M28,-20 l2,-8', INK, 1.4) + circ(-2, -14, 13, '#c47a3a') + stroke('M-2,-14 m-2,0 a2,2 0 1,1 4,0 a5,5 0 1,1 -9,0 a8,8 0 1,1 16,0', INK, 1.6) + circ(22, -29, 1.8, INK, 0) + circ(30, -29, 1.8, INK, 0); } },
    frog: { h: 26, c: '#6dbf4a', draw: function (m, c) { return ell(-12, -4, 9, 4, c) + ell(12, -4, 9, 4, c) + ell(0, -12, 18, 12, c) + circ(-8, -24, 6, c) + circ(8, -24, 6, c) + aEye(-8, -25, 2.4, m) + aEye(8, -25, 2.4, m) + aMouth(0, -14, 8, m); } },
    snake: { h: 26, c: '#7cb342', draw: function (m, c) { return limb('M-34,-6 Q-20,-14 -6,-6 Q8,2 20,-6 Q28,-12 28,-20', c, 9) + ell(32, -23, 9, 7, c) + aEye(34, -26, 1.8, m) + stroke('M40,-22 l6,1 l2,-2 M46,-21 l2,2', '#e5484d', 1.4); } },
    fish: { h: 22, c: '#f08a3c', draw: function (m, c) { return path('M-24,-11 L-34,-20 L-34,-2 Z', c) + ell(0, -11, 24, 11, c) + path('M-6,-20 Q0,-28 8,-20 Z', shade(c, -0.15), 1.6) + stroke('M10,-18 Q6,-11 10,-4', INK, 1.4) + aEye(14, -13, 2, m) + aMouth(21, -8, 2, m); } },
    whale: { h: 60, c: '#4f7fb0', draw: function (m, c) { return path('M-56,-30 L-74,-46 L-70,-24 L-74,-8 Z', c) + path('M-60,-28 Q-60,-58 -10,-58 Q46,-58 50,-30 Q52,-4 0,-4 Q-56,-4 -60,-28 Z', c) + path('M-40,-12 Q0,-2 46,-18 Q40,-6 0,-5 Q-36,-6 -40,-12 Z', '#d9e6f2', 1.6) + aEye(26, -34, 2.6, m) + stroke('M34,-20 Q40,-18 44,-22', INK, 1.6); } },
    octopus: { h: 52, c: '#c96bb0', draw: function (m, c) { var o = ''; for (var i = 0; i < 8; i++) { var x = -26 + i * 7.4; o += limb('M' + pt(x * 0.6, -18) + 'Q' + pt(x * 1.2, -4) + ' ' + pt(x * 1.3 + (i % 2 ? 6 : -6), -2), c, 6); } return o + path('M-20,-18 Q-24,-52 0,-52 Q24,-52 20,-18 Z', c) + aEye(-7, -32, 2.6, m) + aEye(7, -32, 2.6, m) + aMouth(0, -24, 4, m); } },
    bee: { h: 14, c: '#f2c14e', draw: function (m, c) { return ell(-4, -16, 6, 8, 'rgba(200,230,255,0.85)', 1.4, { transform: 'rotate(-20 -4 -16)' }) + ell(4, -16, 6, 8, 'rgba(200,230,255,0.85)', 1.4, { transform: 'rotate(20 4 -16)' }) + ell(0, -7, 11, 7, c) + line(-4, -13, -4, -1, INK, 2.6) + line(2, -13, 2, -1, INK, 2.6) + circ(11, -8, 4, INK, 0) + path('M-11,-7 l-4,1 l4,1 z', INK, 1); } },
    butterfly: { h: 22, c: '#8a62c4', draw: function (m, c) { return path('M0,-12 C-14,-30 -26,-18 -16,-10 C-24,-2 -12,4 0,-8 Z', c) + path('M0,-12 C14,-30 26,-18 16,-10 C24,-2 12,4 0,-8 Z', c) + circ(-12, -18, 3, COL.yellow, 1.2) + circ(12, -18, 3, COL.yellow, 1.2) + ell(0, -10, 2.4, 8, INK, 0) + stroke('M0,-17 q-3,-6 -6,-7 M0,-17 q3,-6 6,-7', INK, 1); } },
    ant: { h: 8, c: '#3a2a22', draw: function (m, c) { return stroke('M-4,-3 l-3,3 M0,-3 l0,3 M4,-3 l3,3', c, 1.2) + circ(-6, -4, 3, c, 0) + circ(0, -4, 2.4, c, 0) + circ(5, -5, 2.6, c, 0) + stroke('M6,-7 q2,-4 5,-4', c, 1); } },
    penguin: { h: 48, c: '#2f3440', draw: function (m, c) { return ell(-6, -2, 6, 3, '#f2b33d') + ell(6, -2, 6, 3, '#f2b33d') + ell(0, -22, 15, 22, c) + ell(2, -19, 10, 17, '#fff', 1.6) + path('M-14,-24 Q-22,-14 -16,-8 Z', c, 1.6) + path('M9,-34 l8,2 l-8,3 z', '#f2b33d', 1.2) + aEye(4, -36, 1.7, m); } },
    camel: { h: 110, c: '#d8a868', draw: function (m, c) { return stroke('M-36,-66 q-6,8 -4,18', INK, 2) + legs4([-28, -18, 18, 28], -56, 52, 7, c, '#4a3b33') + path('M-38,-60 Q-36,-84 -20,-86 Q-12,-104 0,-86 Q10,-104 22,-84 Q34,-80 34,-60 Q0,-48 -38,-60 Z', c) + path('M28,-72 Q44,-70 42,-96 L54,-100 Q66,-98 64,-92 L52,-90 Q50,-62 30,-60 Z', c) + aEye(52, -96, 2, m) + circ(63, -94, 1.2, INK, 0); } },
    squirrel: { h: 36, c: '#b0662c', draw: function (m, c) { return path('M-8,-8 Q-34,-6 -30,-30 Q-26,-50 -10,-44 Q-20,-40 -18,-28 Q-16,-16 -2,-14 Z', c) + ell(4, -14, 10, 12, c) + circ(10, -30, 9, c) + path('M8,-38 l2,-8 l4,7 z', c, 1.6) + ell(12, -16, 4, 4, '#8a5a3a', 1.4) + aEye(13, -32, 1.8, m) + circ(19, -28, 1.3, INK, 0) + ell(2, -1, 5, 3, c); } },
    bat: { h: 22, c: '#4a4250', draw: function (m, c) { return path('M-4,-12 Q-14,-26 -30,-20 Q-24,-14 -26,-6 Q-18,-12 -14,-4 Q-8,-10 -4,-6 Z', c) + path('M4,-12 Q14,-26 30,-20 Q24,-14 26,-6 Q18,-12 14,-4 Q8,-10 4,-6 Z', c) + ell(0, -10, 6, 8, c) + path('M-5,-16 l-1,-6 l4,4 z M5,-16 l1,-6 l-4,4 z', c, 1.2) + aEye(-2, -12, 1.4, m).replace(/fill="#2a2320"/, 'fill="#fff"') + aEye(3, -12, 1.4, m).replace(/fill="#2a2320"/, 'fill="#fff"'); } },
    hedgehog: { h: 22, c: '#8a6a4a', draw: function (m, c) { var o = '', d = shade(c, -0.35); for (var i = 0; i < 9; i++) { var a = M.PI * (1.05 + i * 0.11); o += path('M' + pt(-2 + M.cos(a) * 14, -6 + M.sin(a) * 12) + 'L' + pt(-2 + M.cos(a) * 24, -6 + M.sin(a) * 20) + 'L' + pt(-2 + M.cos(a + 0.12) * 14, -6 + M.sin(a + 0.12) * 12) + 'Z', d, 1.2); } return o + path('M-20,-2 Q-20,-20 0,-20 Q14,-20 20,-8 Q26,-4 16,-2 Z', c) + path('M8,-18 Q20,-14 26,-6 Q20,-2 8,-4 Z', '#e7c39a', 1.4) + circ(26, -6, 1.8, INK, 0) + aEye(16, -12, 1.6, m); } },
    dragon: { h: 110, c: '#5aa469', draw: function (m, c) { var d = shade(c, -0.25), b = '#f2d48a'; return path('M-30,-62 Q-60,-110 -10,-96 Q-30,-84 -18,-66 Z', '#7ccf8a') + limb('M-34,-36 Q-70,-30 -64,-8', c, 9) + path('M-64,-10 l-8,4 l10,2 z', d, 1.4) + legs4([-22, 14], -26, 24, 12, c) + ell(-2, -44, 30, 24, c) + ell(2, -38, 16, 16, b, 1.6) + path('M14,-60 Q16,-84 30,-88 L48,-84 Q58,-78 50,-70 L32,-68 Q24,-60 22,-52 Z', c) + stroke('M30,-88 l-4,-10 M36,-88 l2,-10', d, 3) + circ(48, -80, 1.5, INK, 0) + aEye(34, -80, 2.4, m) + aMouth(44, -72, 3, m) + path('M-8,-66 l4,-8 l4,7 l4,-8 l4,8', 'none', 1.6); } }
  };
  function animal(a) {
    var A = ANIMALS[a.kind] || ANIMALS.dog, col = a.color ? cc(a.color) : A.c;
    var svg = A.draw(a.mood || 'happy', col);
    return { svg: svg, h: A.h, top: -A.h - 4, head: [A.h > 80 ? 30 : 16, -A.h * 0.85] };
  }
  /* ---------------- props: common objects, drawn simply and clearly. Origin at the bottom center; up is negative y.
     h: height (for placing on the ground); grip: where a hand holds it (default the middle); text: props that carry words ---------------- */
  // words on a prop: shrink to fit the face (o.tw wide) down to 6 px; past that, squeeze the letters (keep prop words short)
  function T(o, x, y, size, def, fill) {
    var s = o.text != null ? o.text : def; if (!s) return ''; var sz = size, tw = o.tw || 1e9; while (sz > 6 && textW(s, sz) > tw) sz -= 0.5;
    var t = txt(x, y, s, { size: sz, fill: fill || INK, base: 'middle' }), over = textW(s, sz) / tw;
    if (over > T.worst) T.worst = over;
    return over > 1.04 ? t.replace('<text ', '<text textLength="' + r1(tw) + '" lengthAdjust="spacingAndGlyphs" ') : t;
  }
  T.worst = 0;
  var PROPS = {
    // money and treasure
    moneybag: { h: 40, c: COL.tan, d: function (o, c) { return path('M-14,-30 L-6,-34 L6,-34 L14,-30 L8,-26 Q22,-16 18,-4 Q14,0 0,0 Q-14,0 -18,-4 Q-22,-16 -8,-26 Z', c) + line(-8, -27, 8, -27, INK, 2.4) + txt(0, -10, '$', { size: 16 }); } },
    coins: { h: 16, c: COL.gold, d: function (o, c) { return ell(-8, -4, 9, 4, c) + ell(-8, -8, 9, 4, c) + ell(6, -4, 9, 4, c) + ell(6, -8, 9, 4, c) + ell(-1, -12, 9, 4, c); } },
    coin: { h: 18, c: COL.gold, d: function (o, c) { return circ(0, -9, 9, c) + circ(0, -9, 6, 'none', 1.2) + txt(0, -8.5, '$', { size: 9, base: 'middle' }); } },
    cash: { h: 14, c: '#9cd08a', d: function (o, c) { return rect(-16, -14, 32, 14, c, LW, 2) + circ(0, -7, 4, 'none', 1.4) + txt(0, -6.5, '$', { size: 7, base: 'middle' }); } },
    piggybank: { h: 30, c: '#f2a7b5', d: function (o, c) { return rect(-12, -8, 5, 8, c, 1.8, 1) + rect(6, -8, 5, 8, c, 1.8, 1) + ell(0, -16, 18, 13, c) + ell(18, -17, 4, 5, shade(c, -0.15)) + path('M4,-28 l3,-6 l4,6 z', c, 1.6) + line(-4, -28, 4, -28, INK, 2.4) + circ(10, -20, 1.5, INK, 0); } },
    wallet: { h: 16, c: COL.brown, d: function (o, c) { return rect(-14, -16, 28, 16, c, LW, 3) + rect(2, -12, 14, 8, shade(c, -0.2), 1.6, 2); } },
    chest: { h: 34, c: '#a0652e', d: function (o, c) { return rect(-22, -20, 44, 20, c, LW, 2) + path('M-22,-20 Q-22,-34 0,-34 Q22,-34 22,-20 Z', shade(c, 0.1)) + rect(-24, -21, 48, 4, COL.gold, 1.6, 1) + rect(-4, -24, 8, 9, COL.gold, 1.6, 1) + (o.open ? circ(-8, -34, 4, COL.gold, 1.2) + circ(4, -36, 4, COL.gold, 1.2) : ''); } },
    gem: { h: 18, c: '#5cc8e8', d: function (o, c) { return path('M-10,-12 L-5,-18 L5,-18 L10,-12 L0,0 Z', c) + path('M-10,-12 L10,-12 M-5,-18 L-2,-12 L0,0 M5,-18 L2,-12', 'none', 1.2); } },
    ring: { h: 16, c: COL.gold, d: function (o, c) { return circ(0, -6, 6, 'none', 4).replace('stroke="#2a2320"', 'stroke="' + c + '"') + circ(0, -6, 8, 'none', 1.2) + circ(0, -6, 4, 'none', 1.2) + path('M-3,-12 L0,-16 L3,-12 L0,-10 Z', '#9fd3f0', 1.2); } },
    crown: { h: 22, c: COL.gold, d: function (o, c) { return path('M-16,0 L-18,-20 L-8,-10 L0,-22 L8,-10 L18,-20 L16,0 Z', c) + circ(0, -6, 2.6, COL.red, 1.2); } },
    trophy: { h: 40, c: COL.gold, d: function (o, c) { return rect(-12, -6, 24, 6, COL.brown, LW, 1) + rect(-4, -16, 8, 10, c, 1.8) + path('M-14,-40 L14,-40 Q14,-18 0,-16 Q-14,-18 -14,-40 Z', c) + stroke('M-14,-36 q-9,2 -6,10 q2,4 8,4 M14,-36 q9,2 6,10 q-2,4 -8,4', INK, 2); } },
    medal: { h: 30, c: COL.gold, d: function (o, c) { return path('M-8,-30 L-2,-16 L2,-16 L-4,-30 Z M8,-30 L2,-16 L-2,-16 L4,-30 Z', COL.blue, 1.4) + circ(0, -9, 9, c) + starPath(0, -9, 4.5, '#fff6d0', 1); } },
    // royal, legal and civic
    throne: { h: 70, c: COL.red, d: function (o, c) { return rect(-24, -70, 48, 50, COL.gold, LW, 6) + rect(-17, -63, 34, 40, c, 1.8, 4) + rect(-26, -26, 52, 12, COL.gold, LW, 3) + rect(-22, -14, 6, 14, COL.gold, LW) + rect(16, -14, 6, 14, COL.gold, LW) + circ(-24, -72, 4, COL.gold, 1.6) + circ(24, -72, 4, COL.gold, 1.6); } },
    scepter: { h: 44, c: COL.gold, grip: [0, -14], d: function (o, c) { return line(0, 0, 0, -36, INK, 6) + line(0, 0, 0, -36, c, 3) + circ(0, -38, 6, '#9fd3f0'); } },
    gavel: { h: 30, c: COL.brown, grip: [6, -6], d: function (o, c) { return line(10, -2, -2, -20, INK, 5.5) + line(10, -2, -2, -20, c, 2.8) + rect(-16, -30, 22, 11, c, LW, 3, { transform: 'rotate(-35 -5 -24)' }); } },
    scales: { h: 50, c: COL.gold, d: function (o, c) { return rect(-12, -4, 24, 4, c, 1.8, 1) + line(0, -4, 0, -44, INK, 3) + line(-24, -40, 24, -40, INK, 2.6) + circ(0, -46, 3, c, 1.6) + stroke('M-24,-40 L-32,-20 M-24,-40 L-16,-20 M24,-40 L16,-20 M24,-40 L32,-20', INK, 1.2) + path('M-34,-20 Q-24,-12 -14,-20 Z', c, 1.6) + path('M14,-20 Q24,-12 34,-20 Z', c, 1.6); } },
    podium: { h: 50, c: '#a0652e', d: function (o, c) { return path('M-16,0 L-12,-40 L12,-40 L16,0 Z', c) + rect(-20, -48, 40, 9, shade(c, -0.15), LW, 2) + T(Object.assign({ tw: 30 }, o), 0, -22, 8, '', '#fff'); } },
    ballotbox: { h: 30, c: '#4a7fd0', d: function (o, c) { return rect(-16, -26, 32, 26, c, LW, 2) + rect(-8, -27, 16, 3, INK, 0) + rect(-6, -36, 12, 10, '#fff', 1.6) + T(Object.assign({ tw: 28 }, o), 0, -12, 8, 'VOTE', '#fff'); } },
    scroll: { h: 30, c: COL.cream, d: function (o, c) { return rect(-16, -26, 32, 22, c, LW, 1) + ell(-16, -15, 4, 12, shade(c, -0.15)) + ell(16, -15, 4, 12, shade(c, -0.15)) + (o.text ? T(Object.assign({ tw: 28 }, o), 0, -15, 7, '') : line(-9, -20, 9, -20, INK, 1.2) + line(-9, -15, 9, -15, INK, 1.2) + line(-9, -10, 5, -10, INK, 1.2)); } },
    flag: { h: 60, c: COL.red, grip: [-14, -20], d: function (o, c) { return line(-14, 0, -14, -60, INK, 4) + line(-14, 0, -14, -60, '#c9a26b', 2) + path('M-13,-58 Q2,-64 16,-58 Q30,-52 34,-58 L34,-36 Q22,-30 10,-36 Q-2,-42 -13,-36 Z', c) + T(Object.assign({ tw: 44 }, o), 10, -47, 8, ''); } },
    banner: { h: 30, c: COL.red, d: function (o, c) { var w = M.max(60, textW(o.text || 'HOORAY', 11) + 24); return path('M' + pt(-w / 2, -30) + 'L' + pt(w / 2, -30) + 'L' + pt(w / 2 - 6, -18) + 'L' + pt(w / 2, -6) + 'L' + pt(-w / 2, -6) + 'L' + pt(-w / 2 + 6, -18) + 'Z', c) + T(o, 0, -17.5, 11, 'HOORAY', '#fff'); } },
    sign: { h: 60, c: '#f6e7c1', d: function (o, c) { var s = o.text || 'SIGN', w = M.max(46, M.min(110, textW(s, 13) + 18)); return line(0, 0, 0, -34, INK, 6) + line(0, 0, 0, -34, '#a0652e', 3) + rect(-w / 2, -60, w, 28, c, LW, 3) + T(Object.assign({ tw: w - 8 }, o), 0, -45.5, 13, 'SIGN'); } },
    signpost: { h: 66, c: '#c9a26b', d: function (o, c) { return line(0, 0, 0, -66, INK, 7) + line(0, 0, 0, -66, c, 4) + path('M-4,-60 L28,-60 L36,-53 L28,-46 L-4,-46 Z', c) + path('M4,-40 L-28,-40 L-36,-33 L-28,-26 L4,-26 Z', c); } },
    placard: { h: 56, c: '#fff', grip: [0, -14], d: function (o, c) { return line(0, 0, 0, -30, INK, 5) + line(0, 0, 0, -30, '#c9a26b', 2.6) + rect(-24, -56, 48, 28, c, LW, 2) + T(Object.assign({ tw: 42 }, o), 0, -41.5, 12, 'YES!'); } },
    // books, paper and school
    book: { h: 30, c: '#2f7d4f', d: function (o, c) { if (o.open) return path('M0,-4 Q-12,-10 -24,-6 L-24,-28 Q-12,-32 0,-26 Z', '#fbf6ea') + path('M0,-4 Q12,-10 24,-6 L24,-28 Q12,-32 0,-26 Z', '#fbf6ea') + stroke('M-20,-22 q8,-3 16,0 M-20,-17 q8,-3 16,0 M4,-22 q8,-3 16,0 M4,-17 q8,-3 16,0', '#8a8a8a', 1); return rect(-12, -30, 24, 30, c, LW, 2) + rect(-12, -30, 5, 30, shade(c, -0.2), 1.6, 1) + T(Object.assign({ tw: 16 }, o), 2.5, -15, 6, '', '#fff'); } },
    books: { h: 34, d: function (o) { return rect(-18, -10, 36, 10, COL.red, LW, 2) + rect(-15, -20, 32, 10, COL.blue, LW, 2) + rect(-17, -30, 30, 10, '#2f7d4f', LW, 2) + rect(-12, -34, 26, 4, COL.yellow, 1.6, 1); } },
    bookshelf: { h: 80, c: '#a0652e', d: function (o, c) { var s = rect(-30, -80, 60, 80, c, LW, 2), cols = [COL.red, COL.blue, '#2f7d4f', COL.yellow, COL.purple, COL.orange]; for (var r = 0; r < 3; r++) { s += line(-28, -54 + r * 26 + 26 - 26, 28, -54 + r * 26, INK, 1.6); for (var i = 0; i < 6; i++) s += rect(-26 + i * 9, -76 + r * 26, 7, 20 - (i % 3) * 2, cols[(i + r) % 6], 1.2, 1, { y: -76 + r * 26 + (i % 3) * 2 }); } return s; } },
    newspaper: { h: 26, c: '#f1efe8', d: function (o, c) { return rect(-18, -26, 36, 26, c, LW, 1) + T(Object.assign({ tw: 32 }, o), 0, -20, 7, 'NEWS') + rect(-14, -15, 12, 10, '#b9b4a8', 1) + line(2, -14, 14, -14, INK, 1.2) + line(2, -10, 14, -10, INK, 1.2) + line(-14, -3, 14, -3, INK, 1.2); } },
    letter: { h: 18, c: '#fbf6ea', d: function (o, c) { return rect(-16, -18, 32, 18, c, LW, 1) + path('M-16,-18 L0,-6 L16,-18', 'none', 1.6) + (o.heart ? path('M0,-8 l-3,-3 a2,2 0 0 1 3,-2 a2,2 0 0 1 3,2 z', COL.red, 1) : ''); } },
    paper: { h: 30, c: '#fff', d: function (o, c) { return rect(-12, -30, 24, 30, c, LW, 1) + (o.text ? T(Object.assign({ tw: 20 }, o), 0, -16, 9, '') : line(-7, -24, 7, -24, INK, 1.2) + line(-7, -19, 7, -19, INK, 1.2) + line(-7, -14, 7, -14, INK, 1.2) + line(-7, -9, 3, -9, INK, 1.2)); } },
    papers: { h: 26, c: '#fff', d: function (o, c) { return rect(-16, -18, 30, 18, '#eee', LW, 1, { transform: 'rotate(-8 0 -9)' }) + rect(-14, -22, 30, 20, c, LW, 1, { transform: 'rotate(6 0 -12)' }) + line(-8, -16, 8, -14, INK, 1.2) + line(-8, -11, 8, -9, INK, 1.2); } },
    notebook: { h: 28, c: COL.blue, d: function (o, c) { var s = rect(-12, -28, 24, 28, c, LW, 2); for (var i = 0; i < 5; i++) s += circ(-12, -24 + i * 5.5, 1.8, '#ddd', 1); return s + rect(-6, -22, 14, 6, '#fff', 1.2); } },
    pencil: { h: 34, c: COL.yellow, grip: [0, -14], d: function (o, c) { return path('M-3,-26 L3,-26 L3,-4 L0,2 L-3,-4 Z', c) + path('M-3,-4 L0,2 L3,-4 Z', '#e8c99a', 1.4) + rect(-3, -32, 6, 6, '#e88', 1.6, 1); } },
    quill: { h: 36, c: '#f4f1ea', grip: [0, -8], d: function (o, c) { return path('M0,0 Q4,-20 14,-36 Q8,-18 2,-8 Z', c) + path('M0,0 Q-2,-16 8,-32 Q4,-18 2,-6 Z', shade(c, -0.1), 1.2) + line(0, 0, 4, -14, INK, 1.2); } },
    inkpot: { h: 16, c: '#2f4673', d: function (o, c) { return path('M-8,0 L-10,-10 L-4,-14 L4,-14 L10,-10 L8,0 Z', c) + rect(-4, -17, 8, 4, INK, 1); } },
    ruler: { h: 8, c: COL.yellow, d: function (o, c) { var s = rect(-26, -8, 52, 8, c, 1.8, 1); for (var i = -22; i <= 22; i += 4) s += line(i, -8, i, i % 8 === 2 ? -3 : -5, INK, 1); return s; } },
    blackboard: { h: 60, c: '#2f5d47', d: function (o, c) { return rect(-40, -60, 80, 48, '#a0652e', LW, 3) + rect(-36, -56, 72, 40, c, 1.6, 2) + T(Object.assign({ tw: 66 }, o), 0, -36, 11, 'A + B', '#fff') + line(-30, -12, -30, 0, INK, 3) + line(30, -12, 30, 0, INK, 3); } },
    diploma: { h: 14, c: '#fbf6ea', d: function (o, c) { return rect(-18, -12, 36, 10, c, LW, 4) + rect(-3, -13, 6, 12, COL.red, 1.4, 1); } },
    globe: { h: 44, c: '#6aaee0', d: function (o, c) { return rect(-10, -4, 20, 4, COL.brown, 1.6, 1) + line(0, -4, 0, -10, INK, 3) + circ(0, -26, 16, c) + path('M-10,-34 q6,-4 10,2 q2,6 -4,8 q-6,0 -6,-10 M4,-20 q6,-2 8,4 q-4,6 -8,2 z', '#7cc06a', 1.2) + stroke('M-18,-26 A18,18 0 0 0 0,-8', INK, 1.6); } },
    map: { h: 26, c: '#f1e1b8', d: function (o, c) { return path('M-20,-24 L-7,-20 L7,-24 L20,-20 L20,0 L7,-4 L-7,0 L-20,-4 Z', c) + line(-7, -20, -7, 0, INK, 1) + line(7, -24, 7, -4, INK, 1) + stroke('M-14,-16 q6,6 12,0 q4,-4 10,2', '#c0392b', 1.6, { 'stroke-dasharray': '2 2' }) + path('M10,-12 l3,3 m0,-3 l-3,3', 'none', 1.6, { stroke: '#c0392b' }); } },
    // tools and work
    hammer: { h: 34, c: '#a0652e', grip: [0, -10], d: function (o, c) { return line(0, 0, 0, -26, INK, 6) + line(0, 0, 0, -26, c, 3) + rect(-12, -34, 24, 9, '#8a949c', LW, 2); } },
    wrench: { h: 34, c: '#8a949c', grip: [0, -8], d: function (o, c) { return path('M-3,0 L3,0 L3,-24 Q10,-26 10,-32 L6,-30 L3,-34 L-3,-34 L-6,-30 L-10,-32 Q-10,-26 -3,-24 Z', c); } },
    saw: { h: 20, c: '#c5ccd3', d: function (o, c) { var s = path('M-30,-20 L14,-20 L14,-6 L-30,-12 Z', c); for (var i = -28; i < 12; i += 4) s += path('M' + i + ',-12 l2,3 l2,-3', 'none', 1); return s + rect(14, -22, 14, 16, '#a0652e', LW, 4); } },
    shovel: { h: 60, c: '#8a949c', grip: [0, -42], d: function (o, c) { return line(0, -10, 0, -56, INK, 6) + line(0, -10, 0, -56, '#c9a26b', 3) + rect(-6, -60, 12, 5, '#c9a26b', 1.6, 2) + path('M-10,-12 L10,-12 L8,2 Q0,6 -8,2 Z', c); } },
    rake: { h: 60, c: '#c9a26b', grip: [0, -40], d: function (o, c) { var s = line(0, -8, 0, -60, INK, 6) + line(0, -8, 0, -60, c, 3) + rect(-16, -10, 32, 4, '#8a949c', 1.6); for (var i = -14; i <= 14; i += 7) s += line(i, -6, i, 0, INK, 2); return s; } },
    broom: { h: 64, c: '#c9a26b', grip: [0, -44], d: function (o, c) { return line(0, -18, 0, -64, INK, 6) + line(0, -18, 0, -64, c, 3) + path('M-6,-20 L6,-20 L14,0 L-14,0 Z', '#e8c86a') + line(-6, -14, 6, -14, COL.red, 2); } },
    mop: { h: 64, c: '#c9a26b', grip: [0, -44], d: function (o, c) { return line(0, -14, 0, -64, INK, 6) + line(0, -14, 0, -64, c, 3) + path('M-12,0 Q-14,-10 -4,-16 L4,-16 Q14,-10 12,0 Z', '#ddd'); } },
    bucket: { h: 26, c: '#8a949c', d: function (o, c) { return stroke('M-12,-24 Q0,-38 12,-24', INK, 1.8) + path('M-14,-24 L14,-24 L11,0 L-11,0 Z', c) + ell(0, -24, 14, 3, shade(c, -0.25), 1.6) + (o.water ? ell(0, -24, 12, 2.4, '#7cc6f2', 0) : ''); } },
    ladder: { h: 90, c: '#c9a26b', d: function (o, c) { var s = line(-14, 0, -10, -90, INK, 6) + line(14, 0, 10, -90, INK, 6) + line(-14, 0, -10, -90, c, 3) + line(14, 0, 10, -90, c, 3); for (var i = 1; i < 6; i++) s += line(-13 + i * 0.6, -i * 15, 13 - i * 0.6, -i * 15, INK, 3); return s; } },
    toolbox: { h: 22, c: COL.red, d: function (o, c) { return stroke('M-8,-18 v-6 h16 v6', INK, 2.4) + rect(-20, -18, 40, 18, c, LW, 2) + line(-20, -10, 20, -10, INK, 1.4); } },
    axe: { h: 44, c: '#a0652e', grip: [0, -14], d: function (o, c) { return line(0, 0, 0, -44, INK, 6) + line(0, 0, 0, -44, c, 3) + path('M0,-42 Q14,-48 16,-34 Q12,-32 0,-32 Z', '#c5ccd3'); } },
    pitchfork: { h: 64, c: '#c9a26b', grip: [0, -30], d: function (o, c) { return line(0, 0, 0, -50, INK, 6) + line(0, 0, 0, -50, c, 3) + stroke('M-8,-64 L-8,-52 Q0,-46 8,-52 L8,-64 M0,-64 L0,-50', '#8a949c', 2.6); } },
    rope: { h: 20, c: '#c9a26b', d: function (o, c) { return stroke('M-18,-4 Q-24,-14 -12,-18 Q4,-22 10,-12 Q14,-2 0,-4 Q-10,-6 -6,-12 Q0,-14 4,-10', c, 4) + stroke('M4,-10 Q14,-2 22,0', c, 4); } },
    chain: { h: 12, c: '#8a949c', d: function (o, c) { var s = ''; for (var i = 0; i < 5; i++) s += ell(-20 + i * 10, -6, 6, 4, 'none', 2.4).replace('stroke="#2a2320"', 'stroke="' + c + '"') + ell(-20 + i * 10, -6, 6, 4, 'none', 0.8); return s; } },
    gear: { h: 32, c: '#8a949c', d: function (o, c) { var d = ''; for (var i = 0; i < 16; i++) { var a = i * M.PI / 8, r = i % 2 ? 12 : 16; d += (i ? 'L' : 'M') + pt(M.cos(a) * r, -16 + M.sin(a) * r); } return path(d + 'Z', c) + circ(0, -16, 5, '#fff'); } },
    magnet: { h: 26, c: COL.red, d: function (o, c) { return path('M-12,-26 L-4,-26 L-4,-10 Q0,-6 4,-10 L4,-26 L12,-26 L12,-10 Q0,4 -12,-10 Z', c) + rect(-12, -26, 8, 6, '#ddd', 1.6) + rect(4, -26, 8, 6, '#ddd', 1.6); } },
    battery: { h: 14, c: '#3fae5a', d: function (o, c) { return rect(-16, -14, 30, 14, '#ddd', LW, 2) + rect(-14, -12, 18, 10, c, 0) + rect(14, -10, 4, 6, INK, 0); } },
    lightbulb: { h: 34, c: '#ffe27a', d: function (o, c) { return path('M-8,-12 Q-14,-20 -14,-24 A14,14 0 1 1 14,-24 Q14,-20 8,-12 Z', c) + rect(-7, -12, 14, 8, '#8a949c', 1.8, 2) + stroke('M-4,-14 q-2,-8 4,-12 q6,4 4,12', '#e2a33a', 1.4); } },
    // science, looking and knowing
    magnifier: { h: 34, c: '#c9e8f5', grip: [12, -6], d: function (o, c) { return line(6, -12, 16, 0, INK, 7) + line(6, -12, 16, 0, '#a0652e', 4) + circ(-2, -22, 12, c, 3) + path('M-8,-28 q4,-4 8,-2', '#fff', 0, { stroke: '#fff', 'stroke-width': 2, fill: 'none' }); } },
    telescope: { h: 50, c: '#c5a35a', d: function (o, c) { return stroke('M-10,0 L0,-26 L10,0 M0,-26 L0,0', INK, 2) + path('M-24,-24 L22,-44 L25,-37 L-21,-17 Z', c) + rect(18, -48, 10, 14, shade(c, -0.2), 1.8, 2, { transform: 'rotate(-24 23 -41)' }); } },
    microscope: { h: 44, c: '#8a949c', d: function (o, c) { return rect(-16, -6, 32, 6, c, LW, 1) + path('M-4,-6 L-4,-14 L-10,-14 L-10,-20 L4,-20', 'none', 2.4) + path('M0,-44 L8,-44 L4,-20 L-4,-22 Z', '#eef1f3') + rect(-14, -22, 18, 4, c, 1.6); } },
    flask: { h: 34, c: '#7ee0a0', d: function (o, c) { return path('M-4,-34 L4,-34 L4,-22 L14,-4 Q16,0 10,0 L-10,0 Q-16,0 -14,-4 L-4,-22 Z', '#eef6fb') + path('M-9,-10 L9,-10 L13,-3 Q14,0 10,0 L-10,0 Q-14,0 -13,-3 Z', c, 0) + circ(2, -16, 2, c, 0) + circ(-2, -24, 1.5, c, 0); } },
    testtube: { h: 30, c: '#e57aa3', d: function (o, c) { return path('M-4,-30 L4,-30 L4,-4 Q0,2 -4,-4 Z', '#eef6fb') + path('M-4,-14 L4,-14 L4,-4 Q0,2 -4,-4 Z', c, 0); } },
    potion: { h: 30, c: '#8a62c4', d: function (o, c) { return rect(-3, -30, 6, 6, '#a0652e', 1.4, 1) + path('M-4,-24 L4,-24 L4,-18 Q14,-14 14,-6 Q14,0 0,0 Q-14,0 -14,-6 Q-14,-14 -4,-18 Z', c) + circ(-5, -10, 2, '#fff', 0, { opacity: 0.7 }); } },
    crystalball: { h: 34, c: '#c9b8f0', d: function (o, c) { return path('M-12,0 L-8,-8 L8,-8 L12,0 Z', '#a0652e') + circ(0, -20, 14, c) + path('M-8,-26 q4,-6 10,-4', 'none', 0, { stroke: '#fff', 'stroke-width': 2.4, fill: 'none' }); } },
    compass: { h: 22, c: '#c5a35a', d: function (o, c) { return circ(0, -11, 11, c) + circ(0, -11, 8, '#fff', 1.4) + path('M0,-18 L2,-11 L0,-4 L-2,-11 Z', COL.red, 1); } },
    binoculars: { h: 18, c: '#36322f', d: function (o, c) { return rect(-14, -18, 11, 18, c, LW, 4) + rect(3, -18, 11, 18, c, LW, 4) + rect(-4, -14, 8, 6, c, 1.6) + circ(-8.5, -3, 4, '#9fd3f0', 1.4) + circ(8.5, -3, 4, '#9fd3f0', 1.4); } },
    hourglass: { h: 36, c: '#a0652e', d: function (o, c) { return rect(-14, -36, 28, 5, c, LW, 1) + rect(-14, -5, 28, 5, c, LW, 1) + path('M-10,-31 L10,-31 Q10,-22 2,-18 Q10,-14 10,-5 L-10,-5 Q-10,-14 -2,-18 Q-10,-22 -10,-31 Z', 'rgba(220,240,255,0.7)', 1.6) + path('M-6,-27 L6,-27 L0,-19 Z', COL.yellow, 0) + path('M-8,-6 L8,-6 Q4,-12 0,-12 Q-4,-12 -8,-6 Z', COL.yellow, 0); } },
    clock: { h: 40, c: '#fff', d: function (o, c) { return circ(0, -20, 18, '#a0652e') + circ(0, -20, 14, c, 1.6) + line(0, -20, 0, -30, INK, 2.2) + line(0, -20, 7, -16, INK, 2.2) + circ(0, -20, 1.6, INK, 0); } },
    alarmclock: { h: 34, c: COL.red, d: function (o, c) { return line(-10, -4, -14, 0, INK, 2.6) + line(10, -4, 14, 0, INK, 2.6) + circ(-10, -28, 6, c) + circ(10, -28, 6, c) + circ(0, -16, 14, c) + circ(0, -16, 10, '#fff', 1.4) + line(0, -16, 0, -23, INK, 2) + line(0, -16, 5, -14, INK, 2); } },
    calendar: { h: 30, c: '#fff', d: function (o, c) { return rect(-14, -28, 28, 28, c, LW, 2) + rect(-14, -28, 28, 8, COL.red, LW, 2) + T(Object.assign({ tw: 24 }, o), 0, -10, 11, '31') + line(-8, -31, -8, -25, INK, 2.4) + line(8, -31, 8, -25, INK, 2.4); } },
    // home and furniture
    chair: { h: 50, c: '#a0652e', d: function (o, c) { return rect(-16, -50, 32, 6, c, LW, 2) + line(-13, -44, -13, -26, INK, 3) + line(13, -44, 13, -26, INK, 3) + rect(-18, -26, 36, 6, c, LW, 2) + line(-15, -20, -15, 0, INK, 3.5) + line(15, -20, 15, 0, INK, 3.5); } },
    stool: { h: 26, c: '#a0652e', d: function (o, c) { return rect(-14, -26, 28, 6, c, LW, 3) + line(-11, -20, -14, 0, INK, 3.5) + line(11, -20, 14, 0, INK, 3.5); } },
    table: { h: 40, c: '#a0652e', d: function (o, c) { return rect(-40, -40, 80, 7, c, LW, 2) + rect(-36, -33, 6, 33, shade(c, -0.1), LW, 1) + rect(30, -33, 6, 33, shade(c, -0.1), LW, 1); } },
    desk: { h: 40, c: '#a0652e', d: function (o, c) { return rect(-40, -40, 80, 7, c, LW, 2) + rect(-38, -33, 28, 33, shade(c, -0.1), LW, 1) + line(-24, -26, -18, -26, INK, 2) + line(-24, -14, -18, -14, INK, 2) + rect(30, -33, 6, 33, shade(c, -0.1), LW, 1); } },
    bed: { h: 44, c: COL.blue, d: function (o, c) { return rect(-46, -44, 8, 44, '#a0652e', LW, 2) + rect(-40, -24, 84, 14, '#fbf6ea', LW, 3) + rect(-36, -30, 22, 9, '#fff', 1.8, 4) + rect(-12, -28, 56, 16, c, LW, 4) + line(-40, -10, -40, 0, INK, 3) + line(42, -10, 42, 0, INK, 3); } },
    sofa: { h: 40, c: '#c0504d', d: function (o, c) { return rect(-46, -40, 92, 24, c, LW, 8) + rect(-50, -28, 14, 26, shade(c, -0.12), LW, 6) + rect(36, -28, 14, 26, shade(c, -0.12), LW, 6) + rect(-36, -22, 72, 16, shade(c, 0.1), LW, 4) + line(-40, -2, -40, 2, INK, 3) + line(40, -2, 40, 2, INK, 3); } },
    lamp: { h: 60, c: '#f2c14e', d: function (o, c) { return rect(-10, -4, 20, 4, INK, 0, 2) + line(0, -4, 0, -40, INK, 3) + path('M-14,-40 L14,-40 L8,-60 L-8,-60 Z', c); } },
    candle: { h: 30, c: '#fbf6ea', d: function (o, c) { return rect(-5, -20, 10, 20, c, 1.8, 1) + path('M0,-30 Q5,-25 0,-21 Q-5,-25 0,-30 Z', '#f6b33d', 1.2) + line(0, -20, 0, -22, INK, 1.2); } },
    lantern: { h: 34, c: '#c5a35a', d: function (o, c) { return stroke('M-6,-30 Q0,-38 6,-30', INK, 2) + rect(-9, -30, 18, 4, c, 1.6, 1) + rect(-8, -26, 16, 22, '#ffe9a8', 1.8, 2) + rect(-9, -4, 18, 4, c, 1.6, 1) + path('M0,-20 Q3,-16 0,-12 Q-3,-16 0,-20 Z', '#f6b33d', 1); } },
    torch: { h: 40, c: '#a0652e', grip: [0, -10], d: function (o, c) { return path('M-3,0 L3,0 L5,-26 L-5,-26 Z', c) + path('M0,-42 Q10,-34 5,-26 L-5,-26 Q-10,-34 0,-42 Z', '#f6943d') + path('M0,-36 Q4,-31 2,-27 L-2,-27 Q-4,-31 0,-36 Z', '#ffe27a', 0); } },
    mirror: { h: 50, c: '#c9e8f5', d: function (o, c) { return ell(0, -26, 16, 22, COL.gold) + ell(0, -26, 12, 18, c, 1.6) + stroke('M-6,-36 l8,-6', '#fff', 2.4); } },
    frame: { h: 40, c: '#fbf6ea', d: function (o, c) { return rect(-24, -40, 48, 36, COL.gold, LW, 2) + rect(-19, -35, 38, 26, c, 1.6) + (o.text ? T(Object.assign({ tw: 34 }, o), 0, -22, 9, '') : path('M-16,-12 L-6,-26 L2,-18 L8,-24 L16,-12 Z', '#7cc06a', 1.2) + circ(10, -30, 3, COL.yellow, 1)); } },
    vase: { h: 40, c: COL.blue, d: function (o, c) { return stroke('M-4,-28 l-6,-12 M0,-28 l0,-14 M4,-28 l6,-12', '#3a7a4a', 1.8) + circ(-10, -41, 4, COL.red, 1.4) + circ(0, -44, 4, COL.yellow, 1.4) + circ(10, -41, 4, COL.pink, 1.4) + path('M-6,-28 L6,-28 Q14,-16 8,0 L-8,0 Q-14,-16 -6,-28 Z', c); } },
    plant: { h: 40, c: '#5aa469', d: function (o, c) { return path('M-10,-14 L10,-14 L7,0 L-7,0 Z', '#c47a3a') + path('M0,-14 Q-16,-22 -14,-38 Q-2,-30 0,-14 Z', c) + path('M0,-14 Q14,-24 16,-36 Q2,-32 0,-14 Z', c) + path('M0,-14 Q-2,-30 4,-42 Q8,-28 0,-14 Z', shade(c, -0.15)); } },
    pillow: { h: 14, c: '#fbf6ea', d: function (o, c) { return rect(-18, -14, 36, 14, c, LW, 6); } },
    rug: { h: 6, c: COL.maroon, d: function (o, c) { return ell(0, -3, 40, 6, c) + ell(0, -3, 30, 4, 'none', 1.4); } },
    teddy: { h: 30, c: '#b0662c', d: function (o, c) { return circ(-9, -26, 4, c, 1.6) + circ(9, -26, 4, c, 1.6) + ell(0, -9, 10, 9, c) + circ(0, -21, 8, c) + ell(0, -19, 3.5, 2.6, '#e7c39a', 1) + circ(-3, -23, 1.2, INK, 0) + circ(3, -23, 1.2, INK, 0) + circ(-9, -4, 4, c, 1.6) + circ(9, -4, 4, c, 1.6); } },
    trashcan: { h: 36, c: '#8a949c', d: function (o, c) { return rect(-14, -36, 28, 5, c, LW, 2) + rect(-4, -40, 8, 4, c, 1.6, 1) + path('M-12,-31 L12,-31 L10,0 L-10,0 Z', c) + line(-5, -26, -4, -5, INK, 1.4) + line(5, -26, 4, -5, INK, 1.4); } },
    box: { h: 30, c: '#c9a26b', d: function (o, c) { return rect(-18, -30, 36, 30, c, LW, 1) + line(-18, -22, 18, -22, INK, 1.4) + rect(-4, -30, 8, 8, '#e8d7b8', 1.2) + T(Object.assign({ tw: 32 }, o), 0, -11, 9, ''); } },
    crate: { h: 30, c: '#c9a26b', d: function (o, c) { return rect(-18, -30, 36, 30, c, LW, 1) + line(-18, -30, 18, 0, INK, 1.6) + line(-18, -10, 18, -10, INK, 1.4) + line(-18, -20, 18, -20, INK, 1.4); } },
    barrel: { h: 36, c: '#a0652e', d: function (o, c) { return path('M-12,0 Q-16,-18 -12,-36 L12,-36 Q16,-18 12,0 Z', c) + stroke('M-14,-10 Q0,-8 14,-10 M-14,-26 Q0,-24 14,-26', INK, 2.2); } },
    basket: { h: 28, c: '#d8a868', d: function (o, c) { return stroke('M-14,-16 Q0,-34 14,-16', INK, 2.4) + path('M-16,-16 L16,-16 L12,0 L-12,0 Z', c) + stroke('M-14,-10 L14,-10 M-13,-5 L13,-5 M-6,-16 L-5,0 M6,-16 L5,0', shade(c, -0.3), 1.2) + (o.full ? circ(-6, -18, 4, COL.red, 1.2) + circ(3, -19, 4, COL.red, 1.2) + circ(9, -17, 3.5, COL.yellow, 1.2) : ''); } },
    bag: { h: 28, c: '#c8a06a', d: function (o, c) { return path('M-12,-20 L12,-20 L14,0 L-14,0 Z', c) + stroke('M-6,-20 q0,-10 6,-10 q6,0 6,10', '#8a6a3c', 2); } },
    shoppingbag: { h: 30, c: COL.pink, d: function (o, c) { return path('M-12,-20 L12,-20 L14,0 L-14,0 Z', c) + stroke('M-6,-20 q0,-10 6,-10 q6,0 6,10', INK, 2) + circ(-4, -13, 1.5, INK, 0); } },
    suitcase: { h: 30, c: '#8a5a3a', d: function (o, c) { return stroke('M-6,-26 v-4 h12 v4', INK, 2.4) + rect(-20, -26, 40, 26, c, LW, 4) + line(-10, -26, -10, 0, INK, 1.4) + line(10, -26, 10, 0, INK, 1.4); } },
    briefcase: { h: 24, c: '#4a3b33', d: function (o, c) { return stroke('M-6,-20 v-4 h12 v4', INK, 2.4) + rect(-18, -20, 36, 20, c, LW, 3) + rect(-3, -14, 6, 4, COL.gold, 1.2); } },
    umbrella: { h: 50, c: COL.red, grip: [0, -4], d: function (o, c) { return stroke('M0,-40 L0,-4 q0,4 -5,4', INK, 2.6) + path('M-24,-34 Q-22,-52 0,-52 Q22,-52 24,-34 Q18,-38 12,-34 Q6,-38 0,-34 Q-6,-38 -12,-34 Q-18,-38 -24,-34 Z', c); } },
    key: { h: 30, c: COL.gold, grip: [0, -24], d: function (o, c) { return circ(0, -24, 6, c) + circ(0, -24, 2.4, '#fff', 1.2) + rect(-2, -18, 4, 18, c, 1.6) + rect(2, -8, 5, 3, c, 1.2) + rect(2, -3, 4, 3, c, 1.2); } },
    lock: { h: 26, c: COL.gold, d: function (o, c) { return stroke('M-7,-14 v-6 a7,7 0 0 1 14,0 v6', '#8a949c', 3.4) + rect(-10, -16, 20, 16, c, LW, 2) + circ(0, -9, 2, INK, 0); } },
    door: { h: 90, c: '#a0652e', d: function (o, c) { return rect(-24, -90, 48, 90, c, LW, 2) + rect(-18, -82, 36, 34, shade(c, 0.12), 1.6, 2) + rect(-18, -42, 36, 34, shade(c, 0.12), 1.6, 2) + circ(14, -44, 3, COL.gold, 1.4); } },
    window: { h: 50, c: '#bfe3f5', d: function (o, c) { return rect(-24, -50, 48, 44, c, LW, 2) + line(0, -50, 0, -6, INK, 2) + line(-24, -28, 24, -28, INK, 2) + rect(-28, -8, 56, 6, '#fbf6ea', 1.8); } },
    fence: { h: 36, c: '#fbf6ea', d: function (o, c) { var s = rect(-44, -26, 88, 5, c, 1.8) + rect(-44, -12, 88, 5, c, 1.8); for (var i = -40; i <= 40; i += 16) s += path('M' + (i - 5) + ',0 L' + (i - 5) + ',-30 L' + i + ',-36 L' + (i + 5) + ',-30 L' + (i + 5) + ',0 Z', c); return s; } },
    gate: { h: 44, c: '#8a949c', d: function (o, c) { var s = rect(-30, -44, 4, 44, c, 1.8) + rect(26, -44, 4, 44, c, 1.8) + line(-26, -38, 26, -38, INK, 2.4) + line(-26, -6, 26, -6, INK, 2.4); for (var i = -20; i <= 20; i += 8) s += line(i, -38, i, -6, INK, 2); return s; } },
    bench: { h: 30, c: '#a0652e', d: function (o, c) { return rect(-34, -30, 68, 6, c, LW, 2) + rect(-34, -18, 68, 6, c, LW, 2) + line(-28, -12, -28, 0, INK, 3.5) + line(28, -12, 28, 0, INK, 3.5); } },
    mailbox: { h: 50, c: COL.blue, d: function (o, c) { return line(0, 0, 0, -26, INK, 5) + path('M-14,-26 L-14,-42 Q-14,-50 0,-50 Q14,-50 14,-42 L14,-26 Z', c) + line(14, -44, 22, -44, COL.red, 3) + line(22, -44, 22, -50, COL.red, 3); } },
    streetlamp: { h: 110, c: '#36322f', d: function (o, c) { return line(0, 0, 0, -96, INK, 5) + path('M-8,-96 L8,-96 L5,-110 L-5,-110 Z', '#ffe9a8') + rect(-9, -98, 18, 3, c, 1.4); } },
    hydrant: { h: 30, c: COL.red, d: function (o, c) { return rect(-9, -24, 18, 24, c, LW, 3) + path('M-9,-24 Q0,-34 9,-24 Z', c) + rect(-14, -18, 5, 6, c, 1.6, 1) + rect(9, -18, 5, 6, c, 1.6, 1); } },
    cone: { h: 30, c: COL.orange, d: function (o, c) { return rect(-14, -4, 28, 4, c, LW, 1) + path('M-10,-4 L-3,-30 L3,-30 L10,-4 Z', c) + path('M-7.5,-14 L7.5,-14 L6,-19 L-6,-19 Z', '#fff', 0); } },
    stopsign: { h: 60, c: COL.red, d: function (o, c) { var d = ''; for (var i = 0; i < 8; i++) { var a = (i + 0.5) * M.PI / 4; d += (i ? 'L' : 'M') + pt(M.cos(a) * 15, -46 + M.sin(a) * 15); } return line(0, 0, 0, -32, INK, 4) + path(d + 'Z', c) + T(Object.assign({ tw: 26 }, o), 0, -45.5, 8, 'STOP', '#fff'); } },
    well: { h: 60, c: '#9a9590', d: function (o, c) { return rect(-24, -24, 48, 24, c, LW, 2) + line(-20, -24, -20, -54, INK, 3) + line(20, -24, 20, -54, INK, 3) + path('M-28,-52 L0,-64 L28,-52 Z', COL.maroon) + line(-20, -38, 20, -38, INK, 2) + line(0, -38, 0, -30, INK, 1.4); } },
    // food and kitchen
    apple: { h: 18, c: COL.red, d: function (o, c) { return path('M0,-14 Q-10,-20 -9,-8 Q-8,0 0,-1 Q8,0 9,-8 Q10,-20 0,-14 Z', c) + line(0, -14, 1, -19, INK, 1.8) + ell(4, -18, 3, 1.6, '#5aa469', 1); } },
    banana: { h: 14, c: COL.yellow, d: function (o, c) { return path('M-14,-12 Q-10,0 4,-2 Q12,-4 14,-12 Q8,-6 0,-6 Q-8,-6 -14,-12 Z', c); } },
    carrot: { h: 30, c: COL.orange, d: function (o, c) { return path('M-5,-22 L5,-22 L0,0 Z', c) + stroke('M0,-22 l-4,-8 M0,-22 l0,-9 M0,-22 l4,-8', '#3a9a4a', 2); } },
    grapes: { h: 22, c: COL.purple, d: function (o, c) { var s = ''; [[0, -18], [-4, -14], [4, -14], [-6, -9], [0, -9], [6, -9], [-3, -4], [3, -4]].forEach(function (q) { s += circ(q[0], q[1], 3.6, c, 1.4); }); return s + line(0, -21, 2, -25, INK, 1.6); } },
    cheese: { h: 18, c: '#f6cf4a', d: function (o, c) { return path('M-16,0 L-16,-10 L14,-18 L16,0 Z', c) + circ(-6, -6, 2.2, shade(c, -0.15), 1) + circ(6, -8, 2, shade(c, -0.15), 1); } },
    bread: { h: 18, c: '#d8a868', d: function (o, c) { return path('M-18,0 L-18,-8 Q-18,-18 0,-18 Q18,-18 18,-8 L18,0 Z', c) + stroke('M-8,-15 l4,-3 M0,-16 l4,-3 M8,-15 l4,-3', shade(c, -0.3), 1.4); } },
    cake: { h: 34, c: '#f6dcae', d: function (o, c) { var s = rect(-20, -16, 40, 16, '#f0c987', LW, 2) + rect(-15, -28, 30, 13, c, LW, 2) + path('M-15,-28 h30 v4 q-3.75,4 -7.5,0 q-3.75,4 -7.5,0 q-3.75,4 -7.5,0 q-3.75,4 -7.5,0 z', '#f4a6c0', 0); [-8, 0, 8].forEach(function (x) { s += rect(x - 1.2, -36, 2.4, 8, '#7fb6e8', 1, 0) + path('M' + x + ',-41 q3,3 0,5 q-3,-2 0,-5z', '#f6c445', 1); }); return s; } },
    pie: { h: 12, c: '#d99a4e', d: function (o, c) { return ell(0, -6, 20, 6, c) + stroke('M-12,-7 L12,-5 M-12,-5 L12,-7 M0,-11 L0,-1', shade(c, -0.25), 1.4); } },
    cookie: { h: 16, c: '#d8a868', d: function (o, c) { return circ(0, -8, 8, c) + circ(-3, -10, 1.4, '#5a3a22', 0) + circ(3, -7, 1.4, '#5a3a22', 0) + circ(0, -4, 1.2, '#5a3a22', 0); } },
    icecream: { h: 34, c: '#f4a6c0', grip: [0, -6], d: function (o, c) { return path('M-8,-20 L8,-20 L0,0 Z', '#d8a868') + circ(0, -24, 8.5, c) + circ(-3, -32, 1.4, COL.red, 0); } },
    pizza: { h: 20, c: '#f2c14e', d: function (o, c) { return path('M-16,-18 Q0,-24 16,-18 L0,2 Z', c) + path('M-16,-18 Q0,-24 16,-18', 'none', 4, { stroke: '#d8a868' }) + circ(-4, -12, 2.4, COL.red, 1) + circ(5, -10, 2.4, COL.red, 1) + circ(0, -4, 2, COL.red, 1); } },
    sandwich: { h: 18, c: '#e8c99a', d: function (o, c) { return path('M-18,-4 L18,-4 L18,0 L-18,0 Z', c) + path('M-19,-8 Q0,-6 19,-8 L18,-4 L-18,-4 Z', '#7cc06a', 1.4) + path('M-18,-10 L18,-10 L18,-8 L-18,-8 Z', COL.red, 1.2) + path('M-18,-10 Q-18,-18 0,-18 Q18,-18 18,-10 Z', c); } },
    candy: { h: 12, c: COL.pink, d: function (o, c) { return path('M-14,-10 L-8,-6 L-14,-2 Z M14,-10 L8,-6 L14,-2 Z', c, 1.6) + ell(0, -6, 8, 5, c) + stroke('M-4,-9 l3,6 M2,-10 l3,6', '#fff', 1.4); } },
    lollipop: { h: 36, c: COL.pink, grip: [0, -8], d: function (o, c) { return line(0, 0, 0, -22, INK, 4) + line(0, 0, 0, -22, '#fff', 2) + circ(0, -28, 9, c) + stroke('M0,-28 m-4,0 a4,4 0 1,1 8,0 a6,6 0 1,1 -11,0', '#fff', 1.6); } },
    egg: { h: 16, c: '#fbf6ea', d: function (o, c) { return path('M0,-16 Q-8,-16 -8,-6 Q-8,0 0,0 Q8,0 8,-6 Q8,-16 0,-16 Z', c); } },
    nest: { h: 16, c: '#a0652e', d: function (o, c) { return ell(-6, -10, 5, 6, '#9fd3f0', 1.4) + ell(4, -10, 5, 6, '#9fd3f0', 1.4) + path('M-20,-10 Q0,-2 20,-10 Q18,0 0,0 Q-18,0 -20,-10 Z', c) + stroke('M-16,-7 l10,4 M-2,-4 l12,-2 M8,-6 l8,2', shade(c, -0.35), 1.2); } },
    bone: { h: 12, c: '#fbf6ea', d: function (o, c) { return path('M-11,-8 A4,4 0 1 1 -14,-11 A4,4 0 1 1 -11,-14 L11,-14 A4,4 0 1 1 14,-11 A4,4 0 1 1 11,-8 A4,4 0 1 1 14,-5 A4,4 0 1 1 11,-2 L-11,-2 A4,4 0 1 1 -14,-5 A4,4 0 1 1 -11,-8 Z', c).replace('M-11,-8 A4,4 0 1 1 -14,-11', 'M-11,-8 A4,4 0 0 1 -14,-11'); } },
    cup: { h: 20, c: '#fff', d: function (o, c) { return stroke('M9,-15 q8,0 7,6 q-1,5 -7,4', INK, 2.2) + path('M-9,-18 L9,-18 L7,0 L-7,0 Z', c) + (o.steam ? stroke('M-3,-22 q-3,-4 0,-8 M3,-22 q-3,-4 0,-8', '#8a949c', 1.4) : ''); } },
    mug: { h: 20, c: COL.blue, d: function (o, c) { return stroke('M10,-14 q8,0 7,6 q-1,5 -7,4', INK, 2.4) + rect(-10, -20, 20, 20, c, LW, 3); } },
    glass: { h: 24, c: '#cfeaf7', d: function (o, c) { return path('M-8,-24 L8,-24 L6,0 L-6,0 Z', 'rgba(220,240,255,0.6)') + path('M-7.2,-14 L7.2,-14 L6,0 L-6,0 Z', c, 0); } },
    bottle: { h: 34, c: '#5aa469', d: function (o, c) { return rect(-3, -34, 6, 6, '#8a949c', 1.4, 1) + path('M-3,-28 L3,-28 L3,-24 Q10,-20 10,-12 L10,0 L-10,0 L-10,-12 Q-10,-20 -3,-24 Z', c) + rect(-8, -14, 16, 8, '#fbf6ea', 1.2); } },
    jar: { h: 26, c: '#f6cf4a', d: function (o, c) { return rect(-10, -26, 20, 5, COL.red, 1.6, 1) + rect(-11, -21, 22, 21, 'rgba(255,240,200,0.6)', LW, 4) + rect(-10, -14, 20, 13, c, 0, 3) + T(Object.assign({ tw: 18 }, o), 0, -9, 7, ''); } },
    teapot: { h: 26, c: '#fff', d: function (o, c) { return stroke('M-14,-14 q-8,0 -10,-8', INK, 2.4) + stroke('M13,-16 q8,-2 6,8 q-2,4 -6,2', INK, 2.2) + ell(0, -11, 14, 11, c) + rect(-6, -24, 12, 3, c, 1.6, 1) + circ(0, -26, 2.4, c, 1.4); } },
    pot: { h: 24, c: '#8a949c', d: function (o, c) { return line(-20, -18, -14, -18, INK, 3) + line(20, -18, 14, -18, INK, 3) + rect(-15, -22, 30, 22, c, LW, 3) + rect(-17, -23, 34, 4, shade(c, -0.15), 1.6, 2) + (o.steam ? stroke('M-6,-26 q-3,-5 0,-10 M2,-26 q-3,-5 0,-10 M10,-26 q-3,-5 0,-10', '#8a949c', 1.4) : ''); } },
    pan: { h: 10, c: '#36322f', d: function (o, c) { return line(14, -6, 32, -8, INK, 4) + ell(0, -5, 16, 5, c); } },
    plate: { h: 8, c: '#fbfbfb', d: function (o, c) { return ell(0, -4, 18, 5, c, 1.8) + ell(0, -4, 11, 3, 'none', 1); } },
    bowl: { h: 14, c: '#fff', d: function (o, c) { return path('M-16,-12 L16,-12 Q14,0 0,0 Q-14,0 -16,-12 Z', c) + ell(0, -12, 16, 3, shade(c, -0.1), 1.6) + (o.soup ? ell(0, -12, 13, 2, '#e8a34a', 0) : ''); } },
    spoon: { h: 30, c: '#c5ccd3', grip: [0, -6], d: function (o, c) { return line(0, 0, 0, -18, INK, 4.6) + line(0, 0, 0, -18, c, 2.2) + ell(0, -24, 5, 7, c); } },
    fork: { h: 30, c: '#c5ccd3', grip: [0, -6], d: function (o, c) { return line(0, 0, 0, -18, INK, 4.6) + line(0, 0, 0, -18, c, 2.2) + path('M-5,-30 L-5,-20 Q0,-15 5,-20 L5,-30 M0,-30 L0,-18', 'none', 1.8); } },
    rollingpin: { h: 10, c: '#d8a868', d: function (o, c) { return rect(-22, -7, 6, 4, c, 1.4, 1) + rect(16, -7, 6, 4, c, 1.4, 1) + rect(-16, -10, 32, 10, c, LW, 4); } },
    watermelon: { h: 18, c: '#e5484d', d: function (o, c) { return path('M-18,-18 L18,-18 Q14,0 0,0 Q-14,0 -18,-18 Z', '#5aa469') + path('M-15,-18 L15,-18 Q12,-4 0,-4 Q-12,-4 -15,-18 Z', c, 0) + circ(-5, -12, 1.2, INK, 0) + circ(4, -10, 1.2, INK, 0) + circ(0, -14, 1.2, INK, 0); } },
    lemon: { h: 14, c: COL.yellow, d: function (o, c) { return path('M-12,-7 Q-8,-14 0,-14 Q8,-14 12,-7 Q8,0 0,0 Q-8,0 -12,-7 Z', c); } },
    feast: { h: 26, d: function (o) { return ell(0, -6, 30, 7, '#fbfbfb', 1.8) + path('M-14,-10 Q-14,-26 0,-26 Q14,-26 14,-10 Z', '#c9874a') + line(10, -20, 18, -28, INK, 3) + circ(-22, -12, 5, COL.red, 1.4) + circ(22, -12, 5, '#5aa469', 1.4); } },
    // play, sport and music
    ball: { h: 22, c: COL.blue, d: function (o, c) { return circ(0, -11, 11, c) + stroke('M-11,-11 Q0,-17 11,-11 M0,-22 Q-6,-11 0,0', '#fff', 2); } },
    soccerball: { h: 22, c: '#fff', d: function (o, c) { return circ(0, -11, 11, c) + path('M0,-15 L4,-12 L2.5,-7.5 L-2.5,-7.5 L-4,-12 Z', INK, 0) + path('M-11,-12 L-7,-13 M11,-12 L7,-13 M-3,-1 L-3,-6 M3,-1 L3,-6 M0,-22 L0,-16', 'none', 1.4); } },
    kite: { h: 40, c: COL.purple, d: function (o, c) { return path('M0,-40 L12,-24 L0,-8 L-12,-24 Z', c) + line(0, -40, 0, -8, COL.yellow, 1.5) + line(-12, -24, 12, -24, COL.yellow, 1.5) + stroke('M0,-8 q6,4 0,8 q-6,4 0,8', INK, 1.2); } },
    balloon: { h: 46, c: COL.red, grip: [0, 0], d: function (o, c) { return stroke('M0,-22 q4,6 0,11 q-4,6 0,11', INK, 1.2) + ell(0, -34, 10, 12, c) + path('M-2,-22 l2,3 l2,-3 z', c, 1.2) + ell(-4, -38, 2, 3.5, '#fff', 0, { opacity: 0.6 }); } },
    balloons: { h: 56, grip: [0, 0], d: function (o) { return stroke('M0,0 L-8,-30 M0,0 L0,-34 M0,0 L9,-30', INK, 1.2) + ell(-9, -40, 9, 11, COL.red) + ell(9, -40, 9, 11, COL.yellow) + ell(0, -48, 9, 11, COL.blue); } },
    gift: { h: 26, c: '#e2574c', d: function (o, c) { return rect(-14, -20, 28, 20, c, LW, 2) + rect(-16, -24, 32, 6, shade(c, 0.15), LW, 1.5) + rect(-2.5, -24, 5, 24, COL.yellow, 1.4) + path('M0,-24 q-10,-10 -12,-2 q2,4 12,2 q10,-10 12,-2 q-2,4 -12,2', COL.yellow, 1.6); } },
    blocks: { h: 26, d: function (o) { return rect(-14, -12, 13, 12, COL.red, 1.8, 1.5) + rect(1, -12, 13, 12, COL.blue, 1.8, 1.5) + rect(-6, -25, 13, 13, COL.yellow, 1.8, 1.5) + txt(-7.5, -3, 'A', { size: 9 }) + txt(7.5, -3, 'B', { size: 9 }) + txt(0.5, -15.5, 'C', { size: 9 }); } },
    puzzle: { h: 22, c: '#5aa469', d: function (o, c) { return path('M-11,-22 L-3,-22 Q-3,-28 1,-28 Q5,-28 5,-22 L11,-22 L11,-14 Q17,-14 17,-10 Q17,-6 11,-6 L11,0 L-11,0 Z', c); } },
    dice: { h: 20, c: '#fff', d: function (o, c) { return rect(-10, -20, 20, 20, c, LW, 4) + circ(-4.5, -15.5, 1.8, INK, 0) + circ(0, -10, 1.8, INK, 0) + circ(4.5, -4.5, 1.8, INK, 0); } },
    chesspiece: { h: 34, c: '#fbf6ea', d: function (o, c) { return rect(-11, -6, 22, 6, c, LW, 2) + path('M-7,-6 L-4,-20 L4,-20 L7,-6 Z', c) + rect(-7, -24, 14, 4, c, 1.6, 1) + path('M-5,-24 L-6,-30 L-2,-28 L0,-33 L2,-28 L6,-30 L5,-24 Z', c, 1.6); } },
    cards: { h: 24, c: '#fff', d: function (o, c) { return rect(-14, -22, 16, 22, c, 1.8, 2, { transform: 'rotate(-12 -6 -11)' }) + rect(-4, -24, 16, 22, c, 1.8, 2, { transform: 'rotate(10 4 -13)' }) + path('M4,-17 l-3,-3 a2,2 0 0 1 3,-2 a2,2 0 0 1 3,2 z', COL.red, 1); } },
    guitar: { h: 50, c: '#c47a3a', d: function (o, c) { return rect(-2.5, -50, 5, 30, '#5a3a22', 1.6) + circ(0, -14, 12, c) + circ(0, -24, 9, c) + circ(0, -15, 3.4, INK, 0) + rect(-4, -54, 8, 6, '#5a3a22', 1.4, 1); } },
    violin: { h: 46, c: '#a0522d', d: function (o, c) { return rect(-2, -46, 4, 20, INK, 0) + path('M-8,-28 Q-12,-22 -8,-18 Q-12,-12 -8,-4 Q0,0 8,-4 Q12,-12 8,-18 Q12,-22 8,-28 Q0,-32 -8,-28 Z', c) + line(-3, -16, -3, -12, INK, 1.2) + line(3, -16, 3, -12, INK, 1.2); } },
    drum: { h: 30, c: COL.red, d: function (o, c) { return path('M-16,-24 L-16,-4 Q0,2 16,-4 L16,-24 Z', c) + ell(0, -24, 16, 5, '#fbf6ea') + stroke('M-16,-20 L-8,-6 L0,-20 L8,-6 L16,-20', '#fff', 1.4) + line(-4, -30, -12, -40, INK, 2.4) + line(6, -30, 14, -40, INK, 2.4); } },
    trumpet: { h: 16, c: COL.gold, d: function (o, c) { return rect(-22, -10, 26, 5, c, 1.6, 2) + path('M4,-12 L18,-18 L18,2 L4,-4 Z', c) + rect(-12, -16, 3, 6, c, 1.2) + rect(-6, -16, 3, 6, c, 1.2); } },
    piano: { h: 50, c: '#36322f', d: function (o, c) { var s = rect(-36, -50, 72, 36, c, LW, 3) + rect(-34, -26, 68, 10, '#fff', 1.6); for (var i = -30; i <= 30; i += 6) s += line(i, -26, i, -16, INK, 1) + (i < 30 && (i / 6 + 5) % 7 !== 2 ? rect(i + 3, -26, 3, 6, INK, 0) : ''); return s + line(-30, -14, -30, 0, INK, 3.5) + line(30, -14, 30, 0, INK, 3.5); } },
    microphone: { h: 60, c: '#8a949c', d: function (o, c) { return stroke('M-8,0 L8,0 M0,0 L0,-46', INK, 3) + rect(-5, -60, 10, 14, c, 1.8, 5); } },
    megaphone: { h: 20, c: COL.orange, d: function (o, c) { return path('M-16,-14 L10,-22 L10,2 L-16,-6 Z', c) + rect(-20, -14, 6, 8, c, 1.6, 1) + rect(-12, -6, 5, 8, INK, 0, 1); } },
    bell: { h: 26, c: COL.gold, d: function (o, c) { return path('M-12,-6 Q-12,-24 0,-24 Q12,-24 12,-6 L15,-4 L-15,-4 Z', c) + circ(0, -2, 3, c, 1.4) + circ(0, -26, 2.4, c, 1.4); } },
    whistle: { h: 12, c: '#c5ccd3', d: function (o, c) { return rect(-10, -10, 16, 8, c, 1.8, 3) + circ(4, -6, 6, c) + rect(-14, -10, 6, 4, c, 1.4); } },
    skateboard: { h: 10, c: COL.orange, d: function (o, c) { return rect(-22, -9, 44, 4, c, 1.8, 2) + circ(-14, -2, 3, INK, 0) + circ(14, -2, 3, INK, 0); } },
    bicycle: { h: 40, c: COL.red, d: function (o, c) { return circ(-20, -14, 13, 'none', 2.6) + circ(20, -14, 13, 'none', 2.6) + stroke('M-20,-14 L-6,-34 L14,-34 L20,-14 M-6,-34 L2,-14 L14,-34 M2,-14 L-20,-14', c, 3) + line(-8, -36, -2, -36, INK, 3) + line(12, -34, 10, -40, INK, 2.4); } },
    sled: { h: 16, c: COL.red, d: function (o, c) { return rect(-22, -14, 40, 6, c, 1.8, 2) + stroke('M-20,-8 L-18,-2 L18,-2 Q26,-2 24,-10', INK, 2.2); } },
    trophycup: { alias: 'trophy' },
    mitt: { h: 26, c: '#b0662c', d: function (o, c) { return path('M-12,0 Q-16,-14 -10,-24 Q-4,-30 2,-26 Q8,-30 12,-22 Q18,-12 12,0 Z', c) + stroke('M-6,-20 q6,4 12,0 M-4,-12 q4,3 8,0', shade(c, -0.35), 1.4) + path('M10,-16 Q20,-14 18,-6 Q14,-4 10,-8 Z', c, 1.8); } },
    plank: { h: 8, c: '#c9a26b', d: function (o, c) { return rect(-40, -8, 80, 8, c, LW, 2) + line(-30, -4, -10, -4, shade(c, -0.25), 1.2) + line(6, -4, 30, -4, shade(c, -0.25), 1.2); } },
    tissue: { h: 26, c: '#7fb0d6', d: function (o, c) { return rect(-16, -14, 32, 14, c, LW, 2) + path('M-6,-14 Q-8,-26 0,-28 Q8,-26 6,-14 Z', '#fff', 1.6); } },
    fish: { h: 16, c: '#7fb6e8', grip: [0, -8], d: function (o, c) { return path('M-20,-8 L-28,-15 L-28,-1 Z', c) + ell(0, -8, 20, 8, c) + circ(11, -10, 1.8, INK, 0) + stroke('M5,-14 Q2,-8 5,-2', INK, 1.2); } },
    racket: { h: 40, c: '#c5ccd3', grip: [0, -6], d: function (o, c) { var s = line(0, 0, 0, -16, INK, 5) + ell(0, -28, 9, 12, 'none', 2.6); for (var i = -6; i <= 6; i += 3) s += line(i, -38, i, -18, INK, 0.8); return s; } },
    // travel and vehicles
    car: { h: 36, c: COL.red, d: function (o, c) { return path('M-34,-10 L-34,-20 Q-32,-24 -24,-24 L-16,-34 L14,-34 L24,-24 L32,-22 Q36,-20 36,-12 L36,-10 Z', c) + path('M-13,-30 L-6,-30 L-6,-24 L-19,-24 Z M-2,-30 L12,-30 L19,-24 L-2,-24 Z', '#bfe3f5', 1.4) + circ(-20, -8, 7, '#36322f') + circ(22, -8, 7, '#36322f') + circ(-20, -8, 2.6, '#ccc', 0) + circ(22, -8, 2.6, '#ccc', 0); } },
    bus: { h: 50, c: COL.yellow, d: function (o, c) { var s = rect(-50, -48, 100, 38, c, LW, 6); for (var i = -44; i < 30; i += 18) s += rect(i, -42, 14, 12, '#bfe3f5', 1.4, 1); return s + rect(34, -42, 12, 26, '#bfe3f5', 1.4, 1) + circ(-30, -9, 8, '#36322f') + circ(30, -9, 8, '#36322f'); } },
    train: { h: 50, c: COL.red, d: function (o, c) { return rect(-40, -36, 54, 26, c, LW, 3) + rect(-6, -50, 24, 40, shade(c, -0.15), LW, 2) + rect(-1, -46, 14, 12, '#bfe3f5', 1.4) + rect(-34, -46, 8, 12, INK, 0) + path('M14,-10 L26,-10 L30,-22 L14,-22 Z', '#8a949c') + circ(-28, -8, 7, '#36322f') + circ(-8, -8, 7, '#36322f') + circ(10, -8, 7, '#36322f'); } },
    boat: { h: 50, c: '#a0652e', d: function (o, c) { return path('M-30,-12 L30,-12 L22,0 L-22,0 Z', c) + line(0, -12, 0, -50, INK, 3) + path('M2,-48 L26,-16 L2,-16 Z', '#fbf6ea') + path('M-2,-44 L-20,-16 L-2,-16 Z', '#fbf6ea'); } },
    rowboat: { h: 16, c: '#a0652e', d: function (o, c) { return path('M-32,-14 L32,-14 L24,0 L-24,0 Z', c) + line(-10, -14, -22, 0, INK, 2.4) + line(10, -14, 22, 0, INK, 2.4); } },
    ship: { h: 90, c: '#7a4a26', d: function (o, c) { return path('M-56,-22 L56,-22 L44,0 L-44,0 Z', c) + rect(-50, -28, 100, 6, shade(c, 0.2), 1.6) + line(-12, -22, -12, -90, INK, 3.5) + line(20, -22, 20, -76, INK, 3.5) + path('M-10,-86 Q12,-70 -10,-50 Z M-14,-84 Q-40,-66 -14,-44 Z', '#fbf6ea') + path('M22,-72 Q40,-58 22,-40 Z', '#fbf6ea') + path('M-12,-90 L4,-86 L-12,-82 Z', COL.red, 1.4); } },
    plane: { h: 30, c: '#eef1f3', d: function (o, c) { return path('M-36,-16 Q-36,-24 -26,-24 L30,-24 Q40,-20 30,-14 L-26,-12 Q-36,-12 -36,-16 Z', c) + path('M-4,-20 L-14,-36 L-6,-36 L10,-20 Z M-4,-16 L-12,-2 L-4,-2 L8,-16 Z', '#9fb6cc') + path('M-30,-22 L-36,-34 L-28,-34 L-22,-22 Z', '#9fb6cc') + circ(22, -20, 2, '#4a7fd0', 1) + circ(14, -20, 2, '#4a7fd0', 1) + circ(6, -20, 2, '#4a7fd0', 1); } },
    rocket: { h: 60, c: '#eef1f3', d: function (o, c) { return path('M-8,-10 L-16,0 L-8,-4 Z M8,-10 L16,0 L8,-4 Z', COL.red) + path('M0,-60 Q12,-44 10,-10 L-10,-10 Q-12,-44 0,-60 Z', c) + circ(0, -36, 4.5, '#9fd3f0', 1.6) + path('M-6,-10 L6,-10 L0,2 Z', '#f6943d', 1.4); } },
    wagon: { h: 26, c: COL.red, d: function (o, c) { return rect(-24, -22, 46, 14, c, LW, 2) + circ(-14, -6, 6, '#36322f') + circ(12, -6, 6, '#36322f') + line(22, -14, 36, -24, INK, 2.4); } },
    cart: { h: 40, c: '#a0652e', d: function (o, c) { return path('M-30,-36 L30,-36 L26,-14 L-26,-14 Z', c) + circ(0, -10, 10, '#c9a26b') + circ(0, -10, 3, INK, 0) + line(-30, -30, -48, -26, INK, 3); } },
    wheelbarrow: { h: 30, c: COL.green, d: function (o, c) { return path('M-20,-26 L14,-26 L6,-12 L-16,-12 Z', c) + circ(16, -8, 8, '#36322f') + line(-16, -12, -30, -6, INK, 3) + line(-14, -12, -12, 0, INK, 3); } },
    tent: { h: 50, c: COL.orange, d: function (o, c) { return path('M-36,0 L0,-50 L36,0 Z', c) + path('M-8,0 L0,-30 L8,0 Z', shade(c, -0.35), 1.6); } },
    campfire: { h: 34, c: '#f6943d', d: function (o, c) { return rect(-18, -6, 36, 6, '#7a4a26', 1.8, 3, { transform: 'rotate(-12 0 -3)' }) + rect(-18, -6, 36, 6, '#8a5a3a', 1.8, 3, { transform: 'rotate(12 0 -3)' }) + path('M0,-34 Q14,-20 8,-6 L-8,-6 Q-14,-20 -4,-26 Q-2,-18 0,-34 Z', c) + path('M0,-22 Q6,-14 3,-7 L-3,-7 Q-6,-14 0,-22 Z', '#ffe27a', 0); } },
    anchor: { h: 36, c: '#5a6670', d: function (o, c) { return circ(0, -32, 4, 'none', 2.6) + line(0, -28, 0, -2, INK, 3.6) + line(-8, -22, 8, -22, INK, 3) + stroke('M-14,-12 Q-12,0 0,-1 Q12,0 14,-12', INK, 3.4); } },
    shipwheel: { h: 40, c: '#a0652e', d: function (o, c) { var s = ''; for (var i = 0; i < 8; i++) { var a = i * M.PI / 4; s += line(M.cos(a) * 6, -20 + M.sin(a) * 6, M.cos(a) * 20, -20 + M.sin(a) * 20, INK, 3.4); } return s + circ(0, -20, 14, 'none', 3.4) + circ(0, -20, 5, c, 1.8); } },
    lifering: { h: 30, c: COL.red, d: function (o, c) { return circ(0, -15, 13, 'none', 7).replace('stroke="#2a2320"', 'stroke="' + c + '"') + circ(0, -15, 16.5, 'none', 1.4) + circ(0, -15, 9.5, 'none', 1.4) + stroke('M0,-28.5 v3 M0,-4.5 v3 M-13.5,-15 h3 M10.5,-15 h3', '#fff', 7); } },
    fishingrod: { h: 60, c: '#c9a26b', grip: [-14, -6], d: function (o, c) { return line(-16, 0, 20, -60, INK, 3.2) + line(-16, 0, 20, -60, c, 1.6) + stroke('M20,-60 Q30,-40 28,-20', INK, 0.9) + circ(28, -18, 2.2, COL.red, 1); } },
    net: { h: 40, c: '#c9a26b', grip: [0, -6], d: function (o, c) { var s = line(0, 0, 0, -26, INK, 4) + ell(0, -34, 12, 8, 'none', 2.4); for (var i = -8; i <= 8; i += 4) s += line(i, -40, i * 0.6, -26, INK, 0.8); return s; } },
    // nature
    tree: { h: 120, c: '#5aa469', d: function (o, c) { return rect(-8, -50, 16, 50, '#8a5a3a', LW, 2) + circ(0, -84, 34, c) + circ(-26, -64, 22, c) + circ(26, -66, 22, c) + circ(0, -64, 24, c, 0) + (o.fruit ? circ(-12, -76, 4, COL.red, 1.2) + circ(14, -86, 4, COL.red, 1.2) + circ(4, -62, 4, COL.red, 1.2) : ''); } },
    pine: { h: 110, c: '#3d8a5a', d: function (o, c) { return rect(-6, -18, 12, 18, '#8a5a3a', LW, 1) + path('M-34,-18 L0,-58 L34,-18 Z', c) + path('M-28,-46 L0,-82 L28,-46 Z', c) + path('M-20,-72 L0,-108 L20,-72 Z', c); } },
    palm: { h: 120, c: '#5aa469', d: function (o, c) { var s = stroke('M0,0 Q-6,-50 4,-100', '#a0652e', 10).replace('stroke-width="10"', 'stroke-width="10"'); s = limb('M0,0 Q-6,-50 4,-100', '#b98a5a', 9); [[-46, -88], [-40, -112], [0, -124], [40, -112], [46, -88]].forEach(function (q) { s += path('M4,-100 Q' + pt((q[0]) / 2, q[1] - 14) + ' ' + pt(q[0], q[1]) + 'Q' + pt(q[0] / 2, q[1] - 2) + ' 4,-100 Z', c); }); return s + circ(-2, -96, 4, '#7a4a26', 1.4) + circ(8, -96, 4, '#7a4a26', 1.4); } },
    bush: { h: 34, c: '#5aa469', d: function (o, c) { return circ(-16, -14, 14, c) + circ(16, -14, 14, c) + circ(0, -22, 16, c) + rect(-26, -8, 52, 8, c, 0); } },
    flower: { h: 34, c: COL.pink, d: function (o, c) { var s = line(0, 0, 0, -24, '#3a8a4a', 2.6) + path('M0,-10 Q-10,-16 -10,-8 Z', '#5aa469', 1.4); for (var i = 0; i < 6; i++) { var a = i * M.PI / 3; s += circ(M.cos(a) * 6, -28 + M.sin(a) * 6, 4.6, c, 1.4); } return s + circ(0, -28, 4, COL.yellow, 1.4); } },
    bouquet: { h: 40, d: function (o) { return path('M-8,-14 L8,-14 L3,0 L-3,0 Z', '#5aa469') + circ(-8, -26, 7, COL.red, 1.6) + circ(8, -26, 7, COL.yellow, 1.6) + circ(0, -34, 7, COL.pink, 1.6) + circ(0, -22, 6, COL.purple, 1.6); } },
    mushroom: { h: 26, c: COL.red, d: function (o, c) { return rect(-5, -12, 10, 12, '#fbf6ea', 1.8, 3) + path('M-16,-12 Q-16,-28 0,-28 Q16,-28 16,-12 Z', c) + circ(-6, -20, 2.4, '#fff', 0) + circ(6, -22, 2.4, '#fff', 0); } },
    cactus: { h: 60, c: '#5aa469', d: function (o, c) { return path('M-8,0 L-8,-52 Q0,-62 8,-52 L8,0 Z', c) + path('M-8,-28 L-18,-28 Q-22,-28 -22,-34 L-22,-44 Q-18,-48 -14,-44 L-14,-34 L-8,-34 Z', c) + path('M8,-34 L18,-34 Q22,-34 22,-40 L22,-48 Q18,-52 14,-48 L14,-40 L8,-40 Z', c); } },
    rock: { h: 22, c: '#9a9590', d: function (o, c) { return path('M-20,0 Q-22,-14 -10,-20 Q2,-24 12,-18 Q22,-12 20,0 Z', c) + stroke('M-6,-14 q4,-2 8,0', shade(c, -0.25), 1.4); } },
    boulder: { h: 50, c: '#9a9590', d: function (o, c) { return path('M-40,0 Q-46,-30 -20,-46 Q6,-56 28,-40 Q46,-24 40,0 Z', c) + stroke('M-14,-30 q8,-6 18,-2 M10,-14 q6,-2 12,2', shade(c, -0.25), 1.6); } },
    log: { h: 18, c: '#8a5a3a', d: function (o, c) { return rect(-30, -18, 56, 18, c, LW, 3) + ell(26, -9, 6, 9, '#d8a868') + stroke('M24,-9 m-2,0 a2,2 0 1,1 4,0 a4,4 0 1,1 -7,0', shade(c, -0.25), 1); } },
    stump: { h: 22, c: '#8a5a3a', d: function (o, c) { return path('M-16,0 L-14,-18 L14,-18 L16,0 Z', c) + ell(0, -18, 14, 4, '#d8a868'); } },
    leaf: { h: 20, c: '#5aa469', d: function (o, c) { return path('M0,0 Q-14,-10 0,-20 Q14,-10 0,0 Z', c) + line(0, 0, 0, -18, shade(c, -0.3), 1.2); } },
    feather: { h: 30, c: '#fbf6ea', d: function (o, c) { return path('M0,0 Q-10,-16 2,-30 Q10,-16 0,0 Z', c) + line(0, 0, 1, -26, INK, 1.2); } },
    cloud: { h: 34, c: '#fff', d: function (o, c) { return path('M-30,0 Q-40,0 -38,-10 Q-36,-20 -24,-18 Q-22,-32 -6,-30 Q4,-40 16,-30 Q30,-32 30,-18 Q42,-16 38,-6 Q36,0 26,0 Z', c, 1.8); } },
    raincloud: { h: 46, c: '#c5ccd3', d: function (o, c) { return stroke('M-16,-6 l-4,8 M-4,-6 l-4,8 M8,-6 l-4,8 M20,-6 l-4,8', '#4a9fd8', 2.2) + g(PROPS.cloud.d({}, c), 'translate(0,-10)'); } },
    sun: { h: 50, c: '#ffd34d', d: function (o, c) { var s = ''; for (var i = 0; i < 12; i++) { var a = i * M.PI / 6; s += line(M.cos(a) * 18, -25 + M.sin(a) * 18, M.cos(a) * 25, -25 + M.sin(a) * 25, '#f2a72e', 3); } return s + circ(0, -25, 15, c); } },
    moon: { h: 36, c: '#fff3b0', d: function (o, c) { return path('M4,-36 A18,18 0 1 0 14,-6 A14,14 0 1 1 4,-36 Z', c); } },
    star: { h: 26, c: COL.gold, d: function (o, c) { return starPath(0, -13, 13, c, 1.8); } },
    rainbow: { h: 50, d: function (o) { var s = '', cols = ['#e5484d', '#f08a3c', '#f2c14e', '#5aa469', '#4a7fd0', '#8a62c4']; cols.forEach(function (c2, i) { s += stroke('M' + (-50 + i * 5) + ',0 A' + (50 - i * 5) + ',' + (50 - i * 5) + ' 0 0 1 ' + (50 - i * 5) + ',0', c2, 5.2); }); return s; } },
    lightning: { h: 40, c: COL.yellow, d: function (o, c) { return path('M4,-40 L-10,-16 L0,-16 L-6,0 L12,-24 L2,-24 Z', c); } },
    snowman: { h: 60, c: '#fff', d: function (o, c) { return circ(0, -16, 16, c) + circ(0, -40, 12, c) + circ(-4, -43, 1.6, INK, 0) + circ(4, -43, 1.6, INK, 0) + path('M0,-39 L9,-37 L0,-36 Z', COL.orange, 1) + circ(0, -18, 1.6, INK, 0) + circ(0, -10, 1.6, INK, 0) + rect(-9, -60, 18, 10, INK, 0, 1) + rect(-13, -52, 26, 3, INK, 0); } },
    snowflake: { h: 22, c: '#bfe3f5', d: function (o, c) { var s = ''; for (var i = 0; i < 3; i++) { var a = i * M.PI / 3; s += line(M.cos(a) * -10, -11 - M.sin(a) * 10, M.cos(a) * 10, -11 + M.sin(a) * 10, '#7cb6e0', 2.4); } return s; } },
    fire: { h: 40, c: '#f6943d', d: function (o, c) { return path('M0,-40 Q20,-22 12,0 L-12,0 Q-20,-22 -8,-30 Q-6,-20 0,-40 Z', c) + path('M0,-24 Q9,-12 5,0 L-5,0 Q-9,-12 0,-24 Z', '#ffe27a', 0); } },
    puddle: { h: 6, c: '#9fd3f0', d: function (o, c) { return ell(0, -3, 30, 5, c, 1.4); } },
    wave: { h: 30, c: '#4a9fd8', d: function (o, c) { return path('M-40,0 Q-40,-20 -20,-26 Q0,-30 6,-16 Q-4,-20 -10,-10 Q-14,0 0,0 Z', c) + path('M-34,-4 Q-30,-18 -16,-22', 'none', 2, { stroke: '#fff' }); } },
    shell: { h: 18, c: '#f2b7b7', d: function (o, c) { return path('M-14,0 Q-16,-18 0,-18 Q16,-18 14,0 Z', c) + stroke('M0,0 L0,-17 M0,0 L-8,-15 M0,0 L8,-15 M0,0 L-13,-8 M0,0 L13,-8', INK, 1); } },
    starfish: { h: 22, c: COL.orange, d: function (o, c) { return starPath(0, -11, 11, c, 1.8); } },
    sandcastle: { h: 40, c: '#e8c99a', d: function (o, c) { return rect(-24, -20, 48, 20, c, LW, 1) + rect(-20, -34, 12, 14, c, LW) + rect(8, -34, 12, 14, c, LW) + rect(-6, -40, 12, 20, c, LW) + path('M0,-40 L0,-48 L8,-45 L0,-42', COL.red, 1.2) + rect(-4, -10, 8, 10, shade(c, -0.2), 1.4, 4); } },
    beachball: { h: 24, d: function (o) { return circ(0, -12, 12, '#fff') + path('M0,-24 Q-10,-12 0,0 Q-14,-6 -12,-12 Q-12,-20 0,-24 Z', COL.red, 1.4) + path('M0,-24 Q10,-12 0,0 Q14,-6 12,-12 Q12,-20 0,-24 Z', COL.blue, 1.4); } },
    // places and big things
    statue: { h: 100, c: '#c5ccd3', d: function (o, c) { return rect(-22, -24, 44, 24, '#b9b4a8', LW, 2) + path('M-12,-24 L-10,-60 Q0,-66 10,-60 L12,-24 Z', c) + circ(0, -74, 11, c) + path('M10,-58 L22,-84 L26,-82 L14,-56 Z', c) + T(Object.assign({ tw: 40 }, o), 0, -11, 8, ''); } },
    column: { h: 110, c: '#efe6d2', d: function (o, c) { var s = rect(-16, -10, 32, 10, c, LW, 1) + rect(-12, -96, 24, 86, c, LW) + rect(-18, -108, 36, 12, c, LW, 2); for (var i = -6; i <= 6; i += 6) s += line(i, -94, i, -12, shade(c, -0.18), 1.4); return s; } },
    brokencolumn: { h: 60, c: '#efe6d2', d: function (o, c) { return rect(-16, -10, 32, 10, c, LW, 1) + path('M-12,-10 L-12,-52 L-4,-58 L4,-50 L12,-56 L12,-10 Z', c) + line(0, -48, 0, -12, shade(c, -0.18), 1.4); } },
    pyramid: { h: 80, c: '#e2c27a', d: function (o, c) { return path('M-60,0 L0,-80 L60,0 Z', c) + path('M0,-80 L60,0 L20,0 Z', shade(c, -0.15), 1.6); } },
    house: { h: 80, c: '#f2e6c9', d: function (o, c) { return rect(-34, -50, 68, 50, c, LW, 1) + path('M-42,-48 L0,-80 L42,-48 Z', COL.red) + rect(-8, -30, 16, 30, '#a0652e', 1.8, 1) + rect(-26, -40, 14, 12, '#bfe3f5', 1.6) + rect(12, -40, 14, 12, '#bfe3f5', 1.6); } },
    castle: { h: 100, c: '#b9b4a8', d: function (o, c) { var s = rect(-46, -60, 92, 60, c, LW) + rect(-56, -84, 24, 84, c, LW) + rect(32, -84, 24, 84, c, LW); for (var i = 0; i < 3; i++) s += rect(-56 + i * 9, -92, 6, 8, c, 1.8) + rect(32 + i * 9, -92, 6, 8, c, 1.8); return s + path('M-12,0 L-12,-24 Q0,-36 12,-24 L12,0 Z', '#5a3a22', 1.8) + path('M-44,-84 L-44,-100 L-30,-96 L-44,-92', COL.red, 1.4); } },
    bridge: { h: 40, c: '#a0652e', d: function (o, c) { var s = stroke('M-60,-14 Q0,-44 60,-14', INK, 3) + rect(-60, -16, 120, 6, c, LW, 1); for (var i = -50; i <= 50; i += 10) s += line(i, -16, i, -16 - (30 - M.abs(i) * 0.5) * 0.9 + 6, INK, 1.4); return s; } },
    lighthouse: { h: 120, c: '#fff', d: function (o, c) { return path('M-16,0 L-10,-90 L10,-90 L16,0 Z', c) + path('M-14.4,-24 L14.4,-24 L13.2,-40 L-13.2,-40 Z M-12,-56 L12,-56 L11,-72 L-11,-72 Z', COL.red, 1.4) + rect(-12, -106, 24, 16, '#ffe9a8', LW, 2) + path('M-14,-106 L0,-120 L14,-106 Z', COL.red); } },
    windmill: { h: 110, c: '#efe2c4', d: function (o, c) { return path('M-18,0 L-12,-70 L12,-70 L18,0 Z', c) + path('M-14,-70 L0,-84 L14,-70 Z', COL.red) + g(rect(-4, -40, 8, 40, '#fbf6ea', 1.8) + rect(-4, 0, 8, 40, '#fbf6ea', 1.8) + rect(-40, -4, 40, 8, '#fbf6ea', 1.8) + rect(0, -4, 40, 8, '#fbf6ea', 1.8), 'translate(0,-74) rotate(20)') + circ(0, -74, 4, INK, 0); } },
    haystack: { h: 40, c: '#e8c86a', d: function (o, c) { return path('M-30,0 Q-30,-40 0,-40 Q30,-40 30,0 Z', c) + stroke('M-20,-10 l6,-14 M-4,-8 l4,-20 M12,-10 l-4,-16 M20,-14 l-2,-10', shade(c, -0.3), 1.4); } },
    wheel: { h: 40, c: '#a0652e', d: function (o, c) { var s = circ(0, -20, 18, 'none', 3.4); for (var i = 0; i < 6; i++) { var a = i * M.PI / 3; s += line(0, -20, M.cos(a) * 18, -20 + M.sin(a) * 18, INK, 2.2); } return s + circ(0, -20, 4, c, 1.8); } },
    tv: { h: 40, c: '#36322f', d: function (o, c) { return rect(-28, -40, 56, 34, c, LW, 4) + rect(-23, -35, 46, 24, '#bfe3f5', 1.4, 2) + T(Object.assign({ tw: 42 }, o), 0, -23, 9, '') + line(-8, -6, -12, 0, INK, 3) + line(8, -6, 12, 0, INK, 3); } },
    laptop: { h: 24, c: '#8a949c', d: function (o, c) { return rect(-18, -24, 36, 20, c, LW, 2) + rect(-15, -21, 30, 14, '#bfe3f5', 1.2, 1) + path('M-22,-4 L22,-4 L24,0 L-24,0 Z', shade(c, -0.15)); } },
    phone: { h: 22, c: '#2b2f38', grip: [0, -11], d: function (o, c) { return rect(-6, -22, 12, 22, c, 1.8, 2.5) + rect(-4.5, -19, 9, 15, '#7fb6e8', 0, 1); } },
    radio: { h: 24, c: COL.teal, d: function (o, c) { return line(10, -20, 18, -34, INK, 2) + rect(-18, -20, 36, 20, c, LW, 3) + circ(-8, -10, 6, '#ddd', 1.6) + rect(4, -14, 10, 8, '#fbf6ea', 1.2); } },
    camera: { h: 22, c: '#36322f', d: function (o, c) { return rect(-16, -18, 32, 18, c, LW, 3) + rect(-6, -22, 12, 5, c, 1.6, 1) + circ(0, -9, 6.5, '#9fd3f0', 1.8) + circ(10, -14, 1.6, COL.red, 0); } },
    robot: { h: 50, c: '#c5ccd3', d: function (o, c) { return rect(-12, -14, 8, 14, c, 1.8) + rect(4, -14, 8, 14, c, 1.8) + rect(-16, -34, 32, 22, c, LW, 4) + rect(-12, -50, 24, 16, c, LW, 4) + circ(-5, -42, 3, '#7fe0f0', 1.2) + circ(5, -42, 3, '#7fe0f0', 1.2) + line(0, -50, 0, -56, INK, 1.6) + circ(0, -57, 2.2, COL.red, 1); } },
    wand: { h: 32, c: '#36322f', grip: [0, -6], d: function (o, c) { return line(0, 0, 0, -26, INK, 4) + line(0, -20, 0, -26, '#fff', 2) + starPath(0, -30, 6, COL.gold, 1.2); } },
    sword: { h: 46, c: '#c5ccd3', grip: [0, -6], d: function (o, c) { return path('M-3,-14 L-3,-42 L0,-48 L3,-42 L3,-14 Z', c) + rect(-10, -16, 20, 4, COL.gold, 1.6, 1) + rect(-2, -12, 4, 10, '#5a3a22', 1.4); } },
    shield: { h: 36, c: '#4a7fd0', d: function (o, c) { return path('M-15,-34 L15,-34 L15,-18 Q15,-4 0,0 Q-15,-4 -15,-18 Z', c) + path('M0,-30 L0,-4 M-11,-20 L11,-20', 'none', 3, { stroke: COL.gold }); } },
    bow: { h: 40, c: '#a0652e', d: function (o, c) { return stroke('M-4,-40 Q14,-20 -4,0', c, 3) + line(-4, -40, -4, 0, INK, 1); } },
    helmet: { h: 22, c: '#b9c2ca', d: function (o, c) { return path('M-14,0 Q-16,-22 0,-22 Q16,-22 14,0 Z', c) + rect(-2, -14, 4, 14, '#9aa5ae', 1.4); } },
    mask: { h: 26, d: function (o) { return path('M-20,-24 Q-10,-28 -2,-24 L-4,-8 Q-12,0 -20,-8 Z', COL.yellow) + stroke('M-16,-16 q2,-2 4,0 M-10,-16 q2,-2 4,0 M-16,-10 q5,4 10,0', INK, 1.4) + path('M2,-24 Q10,-28 20,-24 L18,-8 Q10,0 2,-8 Z', '#9fd3f0') + stroke('M6,-15 q2,2 4,0 M12,-15 q2,2 4,0 M6,-7 q5,-4 10,0', INK, 1.4); } },
    hat: { h: 22, c: COL.black, d: function (o, c) { return ell(0, -3, 20, 4, c) + rect(-12, -22, 24, 19, c, LW, 2) + rect(-12, -8, 24, 4, COL.red, 0); } },
    shoe: { h: 14, c: COL.brown, d: function (o, c) { return path('M-14,0 L-14,-12 L-4,-12 Q2,-6 12,-6 Q16,-4 16,0 Z', c); } },
    boot: { h: 26, c: COL.brown, d: function (o, c) { return path('M-10,0 L-10,-26 L2,-26 L2,-8 Q12,-8 14,-2 L14,0 Z', c); } },
    sock: { h: 22, c: COL.red, d: function (o, c) { return path('M-6,-22 L4,-22 L4,-8 Q14,-8 14,-2 Q14,0 8,0 L-4,0 Q-6,0 -6,-4 Z', c) + rect(-6, -22, 10, 4, '#fff', 1.4); } },
    glasses: { h: 10, c: INK, d: function (o, c) { return circ(-8, -5, 5.5, 'rgba(220,240,255,0.5)', 1.8) + circ(8, -5, 5.5, 'rgba(220,240,255,0.5)', 1.8) + line(-2.5, -5, 2.5, -5, INK, 1.8); } },
    toothbrush: { h: 30, c: '#4a9fd8', grip: [0, -8], d: function (o, c) { return rect(-2, -30, 4, 30, c, 1.6, 2) + rect(-4, -30, 6, 6, '#fff', 1.2, 1); } },
    soap: { h: 10, c: '#f2b7d8', d: function (o, c) { return rect(-12, -10, 24, 10, c, LW, 4) + circ(-12, -16, 3, '#eef6fb', 1) + circ(-6, -20, 2, '#eef6fb', 1); } },
    pill: { alias: 'candy' },
    bandaid: { h: 8, c: '#f2dcc4', d: function (o, c) { return rect(-12, -8, 24, 8, c, 1.6, 4) + rect(-4, -7, 8, 6, shade(c, -0.1), 1); } },
    paintbrush: { h: 36, c: '#a0652e', grip: [0, -8], d: function (o, c) { return rect(-2, -26, 4, 26, c, 1.6, 2) + rect(-3, -30, 6, 5, '#c5ccd3', 1.2) + path('M-3,-30 Q0,-42 3,-30 Z', COL.red, 1.2); } },
    easel: { h: 80, c: '#c9a26b', d: function (o, c) { return line(-20, 0, 0, -80, INK, 3.4) + line(20, 0, 0, -80, INK, 3.4) + line(0, 0, 0, -70, INK, 3) + rect(-24, -74, 48, 40, '#fff', LW, 1) + (o.text ? T(Object.assign({ tw: 44 }, o), 0, -53, 10, '') : path('M-18,-40 L-8,-58 L0,-48 L8,-56 L18,-40 Z', '#7cc06a', 1.2) + circ(10, -64, 4, COL.yellow, 1)) + line(-22, -34, 22, -34, INK, 3); } },
    palette: { h: 18, c: '#e8c99a', d: function (o, c) { return path('M-18,-8 Q-18,-20 0,-20 Q18,-20 18,-8 Q16,0 4,0 Q0,-6 -6,-2 Q-18,2 -18,-8 Z', c) + circ(-10, -12, 2.6, COL.red, 1) + circ(-2, -15, 2.6, COL.blue, 1) + circ(7, -14, 2.6, COL.yellow, 1) + circ(12, -8, 2.6, COL.green, 1); } },
    stack: { h: 50, d: function (o) { var s = '', cols = [COL.red, COL.blue, COL.yellow, COL.green, COL.purple]; for (var i = 0; i < 5; i++) s += rect(-16 + (i % 2) * 3, -10 - i * 10, 30, 10, cols[i], 1.8, 2); return s; } },
    seesaw: { h: 30, c: COL.red, d: function (o, c) { return path('M-8,0 L0,-16 L8,0 Z', '#8a949c') + rect(-50, -22, 100, 6, c, LW, 2, { transform: 'rotate(-12 0 -19)' }); } },
    swing: { h: 90, c: '#8a949c', d: function (o, c) { return line(-30, 0, -24, -90, INK, 3.4) + line(30, 0, 24, -90, INK, 3.4) + line(-30, -90, 30, -90, INK, 4) + line(-8, -90, -8, -26, INK, 1.4) + line(8, -90, 8, -26, INK, 1.4) + rect(-12, -28, 24, 5, COL.red, 1.6, 1); } },
    slide: { h: 70, c: COL.yellow, d: function (o, c) { var s = line(-30, 0, -30, -70, INK, 3.4) + line(-18, 0, -18, -70, INK, 3.4); for (var i = 1; i < 6; i++) s += line(-30, -i * 12, -18, -i * 12, INK, 2.4); return s + path('M-18,-70 L-10,-70 Q10,-30 40,-6 L40,0 L30,0 Q4,-24 -18,-62 Z', c); } }
  };
  Object.keys(PROPS).forEach(function (k) { if (PROPS[k].alias) PROPS[k] = PROPS[PROPS[k].alias]; });
  // a prop at (x, y) in scene space: y is the ground point (or the hand point when held, using the prop's grip)
  function propSvg(kind, x, y, s, o) {
    o = o || {}; var P = PROPS[kind] || PROPS.box, col = o.color ? cc(o.color) : P.c, inner = P.d(o, col);
    var gp = o.held ? (P.grip || [0, -P.h / 2]) : [0, 0];
    var flip = o.flip && o.text == null; // words on a sign always read left to right
    var tr = 'translate(' + r1(x) + ',' + r1(y) + ')' + (s && s !== 1 ? ' scale(' + r1(s * 100) / 100 + ')' : '') + (flip ? ' scale(-1,1)' : '') + (o.rot ? ' rotate(' + o.rot + ')' : '') + (gp[0] || gp[1] ? ' translate(' + r1(-gp[0]) + ',' + r1(-gp[1]) + ')' : '');
    return g(inner, tr, { class: 'vo-prop' });
  }
  /* ---------------- backdrops (400 x 300, ground at GY): quiet, light settings so the people in front stand out ---------------- */
  var BL = 1.5; // backdrop outlines are thinner than figure outlines
  function bRect(x, y, w, h, fill, rx) { return rect(x, y, w, h, fill, BL, rx); }
  function bPath(d, fill) { return path(d, fill, BL); }
  function skyBand(c) { return rect(0, 0, SW, GY, c || '#cfe8f7', 0); }
  function ground(c, y) { return rect(0, y == null ? GY - 6 : y, SW, SH - (y == null ? GY - 6 : y), c || '#a9d18e', 0) + line(0, y == null ? GY - 6 : y, SW, y == null ? GY - 6 : y, INK, 1.2); }
  function floor(c) { return rect(0, GY - 8, SW, SH - GY + 8, c || '#d9c3a0', 0) + line(0, GY - 8, SW, GY - 8, INK, 1.4); }
  function wall(c) { return rect(0, 0, SW, GY - 8, c || '#f3e8d2', 0); }
  function win(x, y, w, h, sky) { return bRect(x, y, w, h, sky || '#cfe8f7', 2) + line(x + w / 2, y, x + w / 2, y + h, INK, BL) + line(x, y + h / 2, x + w, y + h / 2, INK, BL) + bRect(x - 4, y + h, w + 8, 5, '#fbf6ea', 1); }
  function cloudAt(x, y, s) { return g(PROPS.cloud.d({}, '#ffffff'), 'translate(' + x + ',' + y + ') scale(' + (s || 1) + ')'); }
  function hills(c1, c2) { return bPath('M0,' + (GY - 40) + ' Q80,' + (GY - 90) + ' 170,' + (GY - 50) + ' Q260,' + (GY - 100) + ' 400,' + (GY - 55) + ' L400,' + GY + ' L0,' + GY + ' Z', c1 || '#bfe0a6') + bPath('M0,' + (GY - 20) + ' Q120,' + (GY - 50) + ' 230,' + (GY - 22) + ' Q320,' + (GY - 45) + ' 400,' + (GY - 25) + ' L400,' + GY + ' L0,' + GY + ' Z', c2 || '#a9d18e'); }
  function shelfRow(x, y, w, h, seed) { var r = seeded(seed), s = bRect(x, y, w, h, '#b07a48', 1), cols = ['#c0504d', '#4a7fd0', '#5aa469', '#f2c14e', '#8a62c4', '#ef8a3c']; for (var bx = x + 4; bx < x + w - 8;) { var bw = 5 + M.floor(r() * 6), bh = h * (0.6 + r() * 0.3); s += rect(bx, y + h - 3 - bh, bw, bh, cols[M.floor(r() * 6)], 1, 0.5); bx += bw + 1.5; } return s; }
  function columnAt(x, y, h, w) { w = w || 22; var s = bRect(x - w / 2, y, w, h, '#efe6d2') + bRect(x - w / 2 - 5, y - 8, w + 10, 9, '#efe6d2', 1) + bRect(x - w / 2 - 4, y + h, w + 8, 7, '#efe6d2', 1); for (var i = -1; i <= 1; i++) s += line(x + i * w / 4, y + 3, x + i * w / 4, y + h - 3, '#cfc4ab', 1.2); return s; }
  var BACKDROPS = {
    plain: function () { return rect(0, 0, SW, SH, '#fbf7ee', 0) + ell(200, GY + 2, 170, 10, '#efe6d4', 0); },
    sky: function () { return rect(0, 0, SW, SH, '#cfe8f7', 0) + cloudAt(70, 80, 1.2) + cloudAt(300, 60, 1) + cloudAt(220, 200, 1.4) + cloudAt(40, 250, 0.9); },
    park: function () { return skyBand() + cloudAt(300, 60) + hills() + ground() + g(PROPS.tree.d({}, '#5aa469'), 'translate(60,' + (GY - 4) + ') scale(0.95)') + g(PROPS.bench.d({}, '#a0652e'), 'translate(330,' + (GY - 4) + ')') + g(PROPS.bush.d({}, '#6db35a'), 'translate(370,' + (GY - 4) + ') scale(0.8)'); },
    forest: function () { var s = skyBand('#d8eedb') + ground('#8fc07a'); [[30, 1.0], [110, 0.8], [180, 1.1], [260, 0.85], [340, 1.05], [390, 0.8]].forEach(function (t, i) { s += g(PROPS.pine.d({}, i % 2 ? '#3d8a5a' : '#4f9a64'), 'translate(' + t[0] + ',' + (GY - 6) + ') scale(' + t[1] + ')'); }); return s + g(PROPS.mushroom.d({}, COL.red), 'translate(150,' + (GY - 2) + ') scale(0.7)'); },
    jungle: function () { var s = skyBand('#d5efc8') + ground('#6fb35a'); [[20, 1.1], [380, 1.0]].forEach(function (t) { s += g(PROPS.palm.d({}, '#3f9a4a'), 'translate(' + t[0] + ',' + (GY - 6) + ') scale(' + t[1] + ')'); }); for (var i = 0; i < 6; i++) s += stroke('M' + (60 + i * 55) + ',0 Q' + (70 + i * 55) + ',40 ' + (58 + i * 55) + ',' + (60 + (i % 3) * 20), '#3f8a3a', 3); s += g(PROPS.bush.d({}, '#4f9a44'), 'translate(120,' + (GY - 4) + ')') + g(PROPS.bush.d({}, '#4f9a44'), 'translate(280,' + (GY - 4) + ') scale(1.2)'); return s; },
    garden: function () { var s = skyBand() + ground('#a9d18e') + g(PROPS.fence.d({}, '#fbf6ea'), 'translate(90,' + (GY - 6) + ') scale(1.1)') + g(PROPS.fence.d({}, '#fbf6ea'), 'translate(310,' + (GY - 6) + ') scale(1.1)'); for (var i = 0; i < 7; i++) s += g(PROPS.flower.d({}, [COL.pink, COL.yellow, COL.red, COL.purple][i % 4]), 'translate(' + (30 + i * 56) + ',' + (GY + 4) + ') scale(0.8)'); return s + cloudAt(320, 50); },
    farm: function () { return skyBand() + hills('#cfe6a6', '#b9d98a') + ground('#c6dc8e') + bPath('M250,' + (GY - 6) + ' L250,120 L300,86 L350,120 L350,' + (GY - 6) + ' Z', '#c0504d') + bRect(285, 180, 30, GY - 186, '#8a3a32') + path('M285,180 L315,' + (GY - 6) + ' M315,180 L285,' + (GY - 6), 'none', 1.4) + bRect(288, 128, 24, 20, '#fbf6ea') + g(PROPS.fence.d({}, '#fbf6ea'), 'translate(70,' + (GY - 6) + ')') + g(PROPS.haystack.d({}, '#e8c86a'), 'translate(180,' + (GY - 6) + ') scale(0.8)') + cloudAt(90, 60); },
    village: function () { return skyBand() + hills() + ground('#b9d98a') + g(PROPS.house.d({}, '#f2e6c9'), 'translate(70,' + (GY - 6) + ')') + g(PROPS.house.d({}, '#e6d6f2'), 'translate(330,' + (GY - 6) + ') scale(0.9)') + g(PROPS.well.d({}, '#9a9590'), 'translate(200,' + (GY - 6) + ') scale(0.8)') + cloudAt(200, 50); },
    city: function () { var s = skyBand('#d7e9f5'), r = seeded('city'); [[0, 70, 120], [70, 80, 90], [150, 60, 140], [210, 90, 70], [300, 100, 110]].forEach(function (b, i) { s += bRect(b[0], b[2], b[1], GY - b[2], ['#d9c9b5', '#c9d3dd', '#e6d0c0', '#cfd8c6', '#dcd0e6'][i]); for (var y = b[2] + 12; y < GY - 40; y += 24) for (var x = b[0] + 10; x < b[0] + b[1] - 14; x += 20) s += rect(x, y, 10, 13, '#bfe3f5', 1, 1); }); s += rect(0, GY - 8, SW, SH - GY + 8, '#c9c4bd', 0) + line(0, GY - 8, SW, GY - 8, INK, 1.4) + line(0, GY + 18, SW, GY + 18, '#9a948c', 2) + g(PROPS.streetlamp.d({}, '#36322f'), 'translate(372,' + (GY - 6) + ') scale(0.95)'); return s; },
    store: function () { var s = wall('#f6edd8') + floor('#d6cfc4') + shelfRow(16, 40, 120, 40, 'st1') + shelfRow(16, 92, 120, 40, 'st2') + shelfRow(264, 40, 120, 40, 'st3') + shelfRow(264, 92, 120, 40, 'st4') + bRect(150, 170, 110, GY - 178, '#b07a48', 2) + bRect(205, 150, 34, 22, '#36322f', 2) + rect(209, 154, 26, 14, '#7fe0a0', 0); return s + bRect(140, 18, 120, 26, '#c0504d', 3) + txt(200, 31, 'OPEN', { size: 13, fill: '#fff', base: 'middle' }); },
    market: function () { var s = skyBand('#f4e6c8') + floor('#d8c39a'); [[10, '#c0504d'], [140, '#4a7fd0'], [270, '#5aa469']].forEach(function (m0) { var x = m0[0]; s += bRect(x + 6, 130, 6, GY - 138, '#8a5a3a') + bRect(x + 108, 130, 6, GY - 138, '#8a5a3a') + bRect(x, 176, 120, 34, '#c99a5e', 2); for (var i = 0; i < 6; i++) s += path('M' + (x + i * 20) + ',112 L' + (x + i * 20 + 20) + ',112 L' + (x + i * 20 + 20) + ',134 Q' + (x + i * 20 + 10) + ',142 ' + (x + i * 20) + ',134 Z', i % 2 ? '#fff' : m0[1]); s += circ(x + 25, 172, 7, COL.red, 1.2) + circ(x + 42, 172, 7, COL.orange, 1.2) + circ(x + 60, 172, 7, COL.yellow, 1.2) + circ(x + 78, 172, 7, '#5aa469', 1.2) + circ(x + 95, 172, 7, COL.purple, 1.2); }); return s; },
    kitchen: function () { return wall('#f4ead6') + floor('#d9c3a0') + win(160, 40, 80, 64) + bRect(0, 150, 140, GY - 158, '#e8dcc6', 2) + bRect(0, 142, 144, 10, '#bfb3a0', 1) + bRect(20, 168, 44, 40, '#e8dcc6', 1) + bRect(76, 168, 44, 40, '#e8dcc6', 1) + bRect(276, 120, 100, GY - 128, '#c5ccd3', 3) + bRect(288, 136, 76, 54, '#36322f', 2) + circ(296, 128, 3, INK, 0) + circ(310, 128, 3, INK, 0) + bRect(10, 30, 120, 56, '#e8dcc6', 2) + line(70, 30, 70, 86, INK, BL) + g(PROPS.pot.d({ steam: true }, '#8a949c'), 'translate(40,142) scale(0.9)'); },
    cafe: function () { return wall('#f3e2d0') + floor('#c9a27a') + win(30, 40, 110, 90) + win(260, 40, 110, 90) + stroke('M200,0 v40', INK, 1.4) + bPath('M180,60 Q200,30 220,60 Z', '#f2c14e') + g(PROPS.table.d({}, '#a0652e'), 'translate(90,' + (GY - 6) + ') scale(0.7)') + g(PROPS.table.d({}, '#a0652e'), 'translate(320,' + (GY - 6) + ') scale(0.7)') + g(PROPS.cup.d({ steam: true }, '#fff'), 'translate(84,' + (GY - 34) + ') scale(0.8)'); },
    home: function () { return wall('#f3e8d2') + floor('#d4b48c') + win(270, 40, 100, 80) + bRect(40, 50, 80, 60, '#fbf6ea', 2) + bPath('M48,102 L68,74 L82,88 L92,78 L112,102 Z', '#a9d18e') + g(PROPS.sofa.d({}, '#c0504d'), 'translate(90,' + (GY - 4) + ') scale(1.1)') + g(PROPS.lamp.d({}, '#f2c14e'), 'translate(190,' + (GY - 4) + ')') + g(PROPS.plant.d({}, '#5aa469'), 'translate(370,' + (GY - 4) + ') scale(1.1)') + g(PROPS.rug.d({}, '#8e2f3c'), 'translate(250,' + (GY + 14) + ') scale(1.6)'); },
    bedroom: function () { return wall('#e6e0f2') + floor('#c9a27a') + win(40, 40, 80, 70, '#2f4673') + circ(64, 60, 8, '#fff3b0', 1) + g(PROPS.bed.d({}, '#4a7fd0'), 'translate(270,' + (GY - 4) + ') scale(1.5)') + g(PROPS.lamp.d({}, '#f2c14e'), 'translate(150,' + (GY - 4) + ') scale(0.8)') + bRect(130, 70, 50, 40, '#fbf6ea', 2) + starPath(155, 90, 9, COL.gold, 1.2); },
    office: function () { var s = wall('#eef0f2') + floor('#b9c2ca') + win(250, 30, 130, 90) + bRect(30, 40, 100, 70, '#fff', 2); for (var i = 0; i < 4; i++) s += rect(42, 52 + i * 13, 50 + (i % 2) * 24, 5, '#9aa5ae', 0, 2); return s + g(PROPS.desk.d({}, '#a0652e'), 'translate(110,' + (GY - 4) + ') scale(1.2)') + g(PROPS.laptop.d({}, '#8a949c'), 'translate(110,' + (GY - 52) + ')') + g(PROPS.plant.d({}, '#5aa469'), 'translate(370,' + (GY - 4) + ')'); },
    classroom: function () { return wall('#f4ecd9') + floor('#d4b48c') + bRect(90, 30, 220, 110, '#a0652e', 4) + bRect(98, 38, 204, 94, '#2f5d47', 2) + txt(200, 74, 'A B C', { size: 18, fill: '#fff', base: 'middle' }) + txt(200, 104, '1 + 2 = 3', { size: 14, fill: '#fff', base: 'middle' }) + win(14, 50, 60, 80) + win(326, 50, 60, 80) + g(PROPS.clock.d({}, '#fff'), 'translate(200,26) scale(0.5)') + g(PROPS.desk.d({}, '#c9a27a'), 'translate(330,' + (GY - 4) + ') scale(0.8)') + g(PROPS.globe.d({}, '#6aaee0'), 'translate(318,' + (GY - 36) + ') scale(0.8)'); },
    library: function () { return wall('#efe3cc') + floor('#b48a5e') + shelfRow(10, 30, 120, 52, 'l1') + shelfRow(10, 86, 120, 52, 'l2') + shelfRow(10, 142, 120, 52, 'l3') + shelfRow(270, 30, 120, 52, 'l4') + shelfRow(270, 86, 120, 52, 'l5') + shelfRow(270, 142, 120, 52, 'l6') + win(160, 40, 80, 100) + g(PROPS.lamp.d({}, '#5aa469'), 'translate(200,' + (GY - 4) + ') scale(0.9)'); },
    museum: function () { return wall('#f1ece4') + floor('#cfc6b8') + bRect(30, 50, 80, 64, '#c5a35a', 2) + bRect(37, 57, 66, 50, '#cfe8f7', 1) + bPath('M42,100 L60,74 L72,88 L84,78 L98,100 Z', '#7cc06a') + bRect(290, 50, 80, 64, '#c5a35a', 2) + bRect(297, 57, 66, 50, '#f6e7c1', 1) + circ(330, 82, 14, '#e5a04a', 1.2) + g(PROPS.statue.d({}, '#c5ccd3'), 'translate(200,' + (GY - 4) + ') scale(0.9)') + line(150, 210, 250, 210, '#c0504d', 2) + line(150, 210, 150, GY - 4, INK, 2) + line(250, 210, 250, GY - 4, INK, 2); },
    lab: function () { var s = wall('#e8f2f2') + floor('#c5ccd3') + bRect(0, 160, SW, GY - 168, '#fbfbfb', 2) + bRect(0, 154, SW, 8, '#9aa5ae', 1) + bRect(20, 40, 100, 70, '#fff', 2); s += stroke('M30,96 L50,70 L70,84 L90,56 L110,64', '#c0504d', 2); return s + g(PROPS.flask.d({}, '#7ee0a0'), 'translate(180,154)') + g(PROPS.testtube.d({}, '#e57aa3'), 'translate(214,154)') + g(PROPS.microscope.d({}, '#8a949c'), 'translate(300,154)') + g(PROPS.flask.d({}, '#8ab8f0'), 'translate(352,154) scale(0.8)'); },
    courtroom: function () { var s = wall('#eadfcc') + floor('#a8774a'); for (var i = 0; i < 5; i++) s += bRect(18 + i * 80, 20, 44, 110, '#d8c8ae', 2); return s + bRect(120, 120, 160, 40, '#8a5a3a', 2) + bRect(110, 112, 180, 10, '#6e4630', 1) + g(PROPS.scales.d({}, '#f0b429'), 'translate(200,108) scale(0.9)') + bPath('M150,2 L250,2 L250,14 L150,14 Z', '#c5a35a') + g(PROPS.flag.d({}, '#4a7fd0'), 'translate(330,' + (GY - 8) + ') scale(1.4)'); },
    assembly: function () { var s = wall('#ece3d3') + floor('#8a5a3a'); s += bPath('M60,140 Q200,40 340,140 Z', '#d8c8ae'); for (var r = 0; r < 3; r++) s += bRect(0, 176 + r * 22, SW, 14, '#a8774a', 3); return s + g(PROPS.podium.d({}, '#8a5a3a'), 'translate(200,' + (GY - 4) + ') scale(1.1)') + columnAt(30, 30, 130, 20) + columnAt(370, 30, 130, 20); },
    throne: function () { var s = wall('#e9dcc8') + floor('#b23a3a'); for (var i = 0; i < 4; i++) s += bRect(20 + i * 110, 30, 30, GY - 40, '#d8c8ae', 2); return s + bRect(150, 10, 100, 140, '#8e2f3c', 2) + bPath('M150,10 Q200,40 250,10 Z', '#c5a35a') + g(PROPS.throne.d({}, '#c0504d'), 'translate(200,' + (GY - 8) + ') scale(1.3)') + rect(170, GY - 8, 60, SH - GY + 8, '#c5a35a', 0, 0, { opacity: 0.6 }); },
    castle: function () { return skyBand() + hills('#cfe6a6', '#b9d98a') + ground() + g(PROPS.castle.d({}, '#c9c4ba'), 'translate(200,' + (GY - 6) + ') scale(1.8)') + cloudAt(70, 50) + cloudAt(340, 70, 0.8); },
    forum: function () { var s = skyBand('#d6eaf7') + rect(0, GY - 30, SW, SH - GY + 30, '#e8dcc0', 0) + line(0, GY - 30, SW, GY - 30, INK, 1.2) + line(0, GY - 14, SW, GY - 14, '#cfc4ab', 1.4); s += bRect(30, 70, 340, 16, '#efe6d2') + bPath('M20,70 L200,22 L380,70 Z', '#efe6d2'); [60, 125, 190, 255, 320].forEach(function (x) { s += columnAt(x + 10, 94, GY - 132, 20); }); return s + g(PROPS.brokencolumn.d({}, '#efe6d2'), 'translate(390,' + (GY - 26) + ') scale(0.6)'); },
    temple: function () { var s = skyBand('#d6eaf7') + ground('#c6dc8e') + bRect(40, GY - 36, 320, 12, '#efe6d2', 1) + bRect(30, GY - 24, 340, 12, '#efe6d2', 1) + bRect(50, 64, 300, 18, '#efe6d2') + bPath('M44,64 L200,18 L356,64 Z', '#efe6d2') + circ(200, 46, 9, '#f6e7c1', 1.2); [80, 140, 200, 260, 320].forEach(function (x) { s += columnAt(x, 90, GY - 134, 22); }); return s; },
    mountains: function () { return skyBand('#d2e8f5') + bPath('M-20,' + GY + ' L90,70 L200,' + GY + ' Z', '#a8b4c0') + bPath('M60,110 L90,70 L120,110 L105,102 L90,112 L75,102 Z', '#fff') + bPath('M120,' + GY + ' L270,40 L420,' + GY + ' Z', '#97a5b3') + bPath('M236,84 L270,40 L304,84 L288,76 L270,88 L252,76 Z', '#fff') + ground('#a9d18e', GY - 16) + g(PROPS.pine.d({}, '#3d8a5a'), 'translate(40,' + (GY - 14) + ') scale(0.6)') + g(PROPS.pine.d({}, '#3d8a5a'), 'translate(360,' + (GY - 14) + ') scale(0.7)'); },
    desert: function () { return skyBand('#f7e7c4') + circ(330, 60, 26, '#ffd34d', 1.6) + bPath('M0,' + (GY - 30) + ' Q100,' + (GY - 70) + ' 200,' + (GY - 34) + ' Q300,' + (GY - 60) + ' 400,' + (GY - 30) + ' L400,300 L0,300 Z', '#ecc98a') + bPath('M0,' + (GY - 4) + ' Q150,' + (GY - 26) + ' 400,' + (GY - 6) + ' L400,300 L0,300 Z', '#e2b977') + g(PROPS.cactus.d({}, '#5aa469'), 'translate(60,' + (GY - 4) + ') scale(1.1)') + g(PROPS.pyramid.d({}, '#e2c27a'), 'translate(260,' + (GY - 40) + ') scale(0.8)'); },
    night: function () { var s = rect(0, 0, SW, GY, '#33467a', 0), r = seeded('night'); for (var i = 0; i < 26; i++) s += circ(r() * SW, r() * (GY - 60), 1 + r() * 1.6, '#fff8d6', 0); return s + g(PROPS.moon.d({}, '#fff3b0'), 'translate(320,70) scale(1.4)') + bPath('M0,' + (GY - 30) + ' Q120,' + (GY - 70) + ' 220,' + (GY - 34) + ' Q320,' + (GY - 60) + ' 400,' + (GY - 32) + ' L400,' + GY + ' L0,' + GY + ' Z', '#34506a') + rect(0, GY - 6, SW, SH - GY + 6, '#3d5f4a', 0) + line(0, GY - 6, SW, GY - 6, INK, 1.2); },
    space: function () { var s = rect(0, 0, SW, SH, '#1d2440', 0), r = seeded('space'); for (var i = 0; i < 40; i++) s += circ(r() * SW, r() * SH, 0.8 + r() * 1.6, '#fff', 0); return s + circ(320, 70, 34, '#e0a94e', 1.6) + ell(320, 70, 54, 10, 'none', 2.4, { stroke: '#f6d58a' }) + circ(60, 230, 18, '#7cb6e0', 1.6) + path('M-20,300 Q200,' + (GY - 10) + ' 420,300 Z', '#9aa3ab', 1.6) + circ(120, 290, 8, '#7d868e', 1) + circ(260, 284, 6, '#7d868e', 1); },
    sea: function () { var s = skyBand('#cfe8f7') + cloudAt(80, 60) + rect(0, 150, SW, SH - 150, '#8cc3ea', 0) + line(0, 150, SW, 150, INK, 1.2); for (var i = 0; i < 6; i++) s += stroke('M' + (i * 72 - 10) + ',' + (190 + (i % 2) * 30) + ' q12,-8 24,0 q12,8 24,0', '#d9ecf9', 2); return s + g(PROPS.ship.d({}, '#7a4a26'), 'translate(290,170) scale(0.95)'); },
    beach: function () { return skyBand('#cfe8f7') + circ(340, 54, 22, '#ffd34d', 1.6) + rect(0, 140, SW, 70, '#8cc3ea', 0) + line(0, 140, SW, 140, INK, 1.2) + stroke('M30,170 q12,-8 24,0 q12,8 24,0 M220,186 q12,-8 24,0 q12,8 24,0', '#d9ecf9', 2) + bPath('M0,210 Q200,190 400,212 L400,300 L0,300 Z', '#f1d9a6') + g(PROPS.palm.d({}, '#5aa469'), 'translate(370,' + (GY - 2) + ') scale(0.95)') + g(PROPS.shell.d({}, '#f2b7b7'), 'translate(60,' + (GY + 18) + ') scale(0.8)') + g(PROPS.umbrella.d({}, '#e5484d'), 'translate(40,' + (GY - 2) + ') scale(1.4)'); },
    island: function () { return skyBand('#cfe8f7') + rect(0, 160, SW, SH - 160, '#8cc3ea', 0) + line(0, 160, SW, 160, INK, 1.2) + bPath('M40,' + (GY + 10) + ' Q200,' + (GY - 60) + ' 360,' + (GY + 10) + ' Z', '#f1d9a6') + g(PROPS.palm.d({}, '#5aa469'), 'translate(150,' + (GY - 30) + ') scale(0.9)') + stroke('M10,200 q12,-8 24,0 q12,8 24,0 M330,190 q12,-8 24,0 q12,8 24,0', '#d9ecf9', 2) + cloudAt(310, 60); },
    underwater: function () { var s = rect(0, 0, SW, SH, '#8fc3e8', 0) + rect(0, 0, SW, 60, '#b3d8f2', 0); for (var i = 0; i < 6; i++) s += stroke('M' + (40 + i * 60) + ',' + GY + ' q-10,-30 0,-60 q10,-30 0,-60', '#3f9a5a', 5); s += bPath('M0,' + (GY - 4) + ' Q200,' + (GY - 20) + ' 400,' + (GY - 6) + ' L400,300 L0,300 Z', '#e8d3a6'); for (var j = 0; j < 8; j++) s += circ(30 + j * 47, 40 + (j % 3) * 50, 3 + (j % 2) * 2, 'none', 1.2, { stroke: '#d9ecf9' }); return s + g(PROPS.shell.d({}, '#f2b7b7'), 'translate(300,' + (GY + 6) + ')') + g(PROPS.starfish.d({}, '#ef8a3c'), 'translate(90,' + (GY + 10) + ')'); },
    river: function () { return skyBand() + hills() + ground('#a9d18e') + bPath('M150,' + (GY - 6) + ' Q120,280 160,300 L260,300 Q230,280 250,' + (GY - 6) + ' Z', '#6aaee0') + g(PROPS.bridge.d({}, '#a0652e'), 'translate(200,' + (GY - 8) + ') scale(1.4)') + g(PROPS.tree.d({}, '#5aa469'), 'translate(50,' + (GY - 4) + ') scale(0.8)') + cloudAt(320, 60); },
    harbor: function () { var s = skyBand('#d6eaf7') + rect(0, 180, SW, SH - 180, '#8cc3ea', 0) + line(0, 180, SW, 180, INK, 1.2) + bRect(0, GY - 14, 230, 18, '#a0652e'); for (var i = 10; i < 230; i += 40) s += bRect(i, GY + 4, 8, 34, '#8a5a3a'); return s + g(PROPS.boat.d({}, '#c0504d'), 'translate(320,200) scale(1.2)') + g(PROPS.lighthouse.d({}, '#fff'), 'translate(380,180) scale(0.8)') + g(PROPS.barrel.d({}, '#a0652e'), 'translate(30,' + (GY - 14) + ') scale(0.8)') + g(PROPS.anchor.d({}, '#5a6670'), 'translate(200,' + (GY - 14) + ') scale(0.8)'); },
    snow: function () { var s = skyBand('#e3edf5') + bPath('M0,' + (GY - 40) + ' Q100,' + (GY - 80) + ' 200,' + (GY - 40) + ' Q300,' + (GY - 80) + ' 400,' + (GY - 40) + ' L400,300 L0,300 Z', '#fbfdff') + ground('#f4f8fb'), r = seeded('snow'); for (var i = 0; i < 30; i++) s += circ(r() * SW, r() * GY, 1.5 + r() * 1.5, '#fff', 0.8, { stroke: '#c5d6e4' }); return s + g(PROPS.pine.d({}, '#3d7a5a'), 'translate(50,' + (GY - 6) + ') scale(0.9)') + g(PROPS.snowman.d({}, '#fff'), 'translate(350,' + (GY - 6) + ') scale(1.1)'); },
    cave: function () { return rect(0, 0, SW, SH, '#5c5048', 0) + bPath('M30,' + GY + ' Q20,60 200,40 Q380,60 370,' + GY + ' Z', '#867465') + bPath('M60,' + GY + ' Q60,100 200,84 Q340,100 340,' + GY + ' Z', '#3c332d') + rect(0, GY - 6, SW, SH - GY + 6, '#7a6a5c', 0) + line(0, GY - 6, SW, GY - 6, INK, 1.2) + bPath('M120,40 l8,26 l8,-24 Z M250,44 l6,20 l6,-20 Z', '#867465') + g(PROPS.torch.d({}, '#a0652e'), 'translate(40,170) rotate(10)'); },
    campsite: function () { return rect(0, 0, SW, GY, '#3a4d78', 0) + circ(320, 60, 18, '#fff3b0', 1.4) + g(PROPS.pine.d({}, '#2f5d47'), 'translate(40,' + (GY - 6) + ') scale(0.9)') + g(PROPS.pine.d({}, '#2f5d47'), 'translate(370,' + (GY - 6) + ')') + ground('#5f7f4a') + g(PROPS.tent.d({}, '#ef8a3c'), 'translate(110,' + (GY - 4) + ') scale(1.2)') + g(PROPS.campfire.d({}, '#f6943d'), 'translate(250,' + (GY + 4) + ') scale(0.9)'); },
    playground: function () { return skyBand() + ground('#a9d18e') + g(PROPS.swing.d({}, '#8a949c'), 'translate(70,' + (GY - 4) + ')') + g(PROPS.slide.d({}, '#f2c14e'), 'translate(330,' + (GY - 4) + ')') + bRect(150, GY - 6, 100, 12, '#f1d9a6', 2) + cloudAt(200, 60); },
    stadium: function () { var s = skyBand('#d6eaf7'); for (var r = 0; r < 4; r++) s += rect(0, 60 + r * 24, SW, 24, ['#c9c4bd', '#b9b4ad', '#c9c4bd', '#b9b4ad'][r], 0); var rr = seeded('crowd'); for (var i = 0; i < 70; i++) s += circ(6 + (i % 35) * 11.4, 70 + M.floor(i / 35) * 26 + rr() * 10, 4, ['#c0504d', '#4a7fd0', '#f2c14e', '#5aa469', '#8a62c4'][i % 5], 0.8); s += rect(0, 156, SW, SH - 156, '#6db35a', 0) + line(0, 156, SW, 156, INK, 1.2); for (var j = 0; j < 4; j++) s += line(0, 190 + j * 26, SW, 190 + j * 26, '#fff', 2); return s + bRect(186, 160, 28, 6, '#fff', 1); },
    station: function () { return wall('#e9e2d6') + bRect(0, 30, SW, 16, '#8a949c') + win(30, 60, 90, 60) + win(280, 60, 90, 60) + g(PROPS.clock.d({}, '#fff'), 'translate(200,110) scale(0.9)') + rect(0, GY - 30, SW, 30, '#c9c4bd', 0) + line(0, GY - 30, SW, GY - 30, INK, 1.4) + rect(0, GY, SW, SH - GY, '#7a6a5c', 0) + line(0, GY + 10, SW, GY + 10, '#c5ccd3', 3) + line(0, GY + 26, SW, GY + 26, '#c5ccd3', 3) + bRect(150, 140, 100, 20, '#2f4673', 2) + txt(200, 150.5, 'TRAINS', { size: 11, fill: '#fff', base: 'middle' }); },
    theater: function () { var s = rect(0, 0, SW, SH, '#3a2a3e', 0) + bRect(40, 20, 320, 200, '#d9c3a0') + bPath('M40,20 L120,20 Q100,120 120,220 L40,220 Z', '#a8323e') + bPath('M360,20 L280,20 Q300,120 280,220 L360,220 Z', '#a8323e') + bPath('M40,20 L360,20 L360,40 Q200,60 40,40 Z', '#8e2f3c') + rect(30, 220, 340, 14, '#8a5a3a', BL); for (var i = 0; i < 8; i++) s += bPath('M' + (8 + i * 50) + ',300 v-34 q22,-12 44,0 v34 z', '#6e2a3a'); return s; },
    bank: function () { var s = wall('#eae6df') + floor('#c9c0b2') + bRect(250, 40, 120, 120, '#9aa5ae', 4) + circ(310, 100, 40, '#b9c2ca', 2) + circ(310, 100, 12, '#9aa5ae', 2); for (var i = 0; i < 6; i++) { var a = i * M.PI / 3; s += line(310 + M.cos(a) * 12, 100 + M.sin(a) * 12, 310 + M.cos(a) * 30, 100 + M.sin(a) * 30, INK, 2); } return s + bRect(0, 170, 220, GY - 178, '#a8774a', 2) + bRect(0, 162, 224, 10, '#8a5a3a', 1) + columnAt(40, 30, 120, 18) + g(PROPS.coins.d({}, '#f0b429'), 'translate(150,162)') + g(PROPS.moneybag.d({}, '#c9a26b'), 'translate(100,162) scale(0.8)'); },
    hospital: function () { return wall('#eef4f4') + floor('#c5d3d3') + win(40, 40, 90, 70) + bRect(270, 40, 80, 60, '#fff', 2) + path('M302,52 h16 v14 h14 v16 h-14 v14 h-16 v-14 h-14 v-16 h14 z', '#e5484d', 1.4) + g(PROPS.bed.d({}, '#9fd3f0'), 'translate(200,' + (GY - 4) + ') scale(1.2)'); },
    stage: function () { return BACKDROPS.theater(); }
  };
  function backdrop(name, night) {
    var f = BACKDROPS[name] || BACKDROPS.plain, s = f();
    if (night && ['night', 'space', 'campsite', 'theater', 'cave'].indexOf(name) < 0) s += rect(0, 0, SW, SH, '#1d2a52', 0, 0, { opacity: 0.38 }) + g(PROPS.moon.d({}, '#fff3b0'), 'translate(350,60)');
    return s;
  }
  /* ---------------- effects, bubbles, labels ---------------- */
  function sparkle(x, y, r, c) { return path('M' + pt(x, y - r) + 'Q' + pt(x + r * 0.15, y - r * 0.15) + ' ' + pt(x + r, y) + 'Q' + pt(x + r * 0.15, y + r * 0.15) + ' ' + pt(x, y + r) + 'Q' + pt(x - r * 0.15, y + r * 0.15) + ' ' + pt(x - r, y) + 'Q' + pt(x - r * 0.15, y - r * 0.15) + ' ' + pt(x, y - r) + 'Z', c || '#ffd34d', 1.4); }
  function heart(x, y, r, c) { return path('M' + pt(x, y + r) + 'C' + pt(x - r * 2, y - r * 0.2) + ' ' + pt(x - r * 0.8, y - r * 1.6) + ' ' + pt(x, y - r * 0.5) + 'C' + pt(x + r * 0.8, y - r * 1.6) + ' ' + pt(x + r * 2, y - r * 0.2) + ' ' + pt(x, y + r) + 'Z', c || '#e5484d', 1.5); }
  function drop(x, y, r, c) { return path('M' + pt(x, y - r * 1.6) + 'Q' + pt(x + r * 1.1, y) + ' ' + pt(x, y + r) + 'Q' + pt(x - r * 1.1, y) + ' ' + pt(x, y - r * 1.6) + 'Z', c || '#a9dcf7', 1.3); }
  function puff(x, y, r, c) { return circ(x - r * 0.6, y, r * 0.7, c, 1.4) + circ(x + r * 0.6, y, r * 0.7, c, 1.4) + circ(x, y - r * 0.5, r * 0.8, c, 1.4); }
  var FX = {
    sparkle: function (x, y, s) { return sparkle(x - 14 * s, y - 6 * s, 9 * s) + sparkle(x + 12 * s, y - 16 * s, 6 * s) + sparkle(x + 4 * s, y + 10 * s, 5 * s); },
    stars: function (x, y, s) { return starPath(x - 12 * s, y, 6 * s, COL.gold, 1.3) + starPath(x + 10 * s, y - 10 * s, 5 * s, COL.gold, 1.3) + starPath(x + 14 * s, y + 8 * s, 4 * s, COL.gold, 1.3); },
    zzz: function (x, y, s) { return txt(x, y, 'Z', { size: 18 * s, fill: '#4a7fd0' }) + txt(x + 13 * s, y - 14 * s, 'z', { size: 14 * s, fill: '#4a7fd0' }) + txt(x + 23 * s, y - 25 * s, 'z', { size: 11 * s, fill: '#4a7fd0' }); },
    sweat: function (x, y, s) { return drop(x + 6 * s, y, 4 * s) + drop(x + 16 * s, y + 10 * s, 3 * s); },
    tears: function (x, y, s) { return drop(x - 8 * s, y, 3.4 * s, '#7cc6f2') + drop(x + 8 * s, y + 6 * s, 3.4 * s, '#7cc6f2') + drop(x, y + 16 * s, 3 * s, '#7cc6f2'); },
    steam: function (x, y, s) { return puff(x - 18 * s, y, 7 * s, '#f2f2f2') + puff(x + 18 * s, y - 4 * s, 7 * s, '#f2f2f2') + stroke('M' + pt(x - 10 * s, y + 8 * s) + 'l-6,-4 M' + pt(x + 10 * s, y + 8 * s) + 'l6,-4', INK, 1.4); },
    anger: function (x, y, s) { return stroke('M' + pt(x - 7 * s, y - 2 * s) + 'q4,' + r1(-3 * s) + ' 5,' + r1(-9 * s) + ' M' + pt(x + 7 * s, y - 2 * s) + 'q-4,' + r1(-3 * s) + ' -5,' + r1(-9 * s) + ' M' + pt(x - 7 * s, y + 4 * s) + 'q4,' + r1(3 * s) + ' 5,' + r1(9 * s) + ' M' + pt(x + 7 * s, y + 4 * s) + 'q-4,' + r1(3 * s) + ' -5,' + r1(9 * s), '#d63a3a', 3 * s); },
    smoke: function (x, y, s) { return puff(x, y, 10 * s, '#c9c9c9') + puff(x + 12 * s, y - 18 * s, 8 * s, '#dcdcdc') + puff(x + 4 * s, y - 34 * s, 6 * s, '#ececec'); },
    motion: function (x, y, s, dir) { var o = '', d = dir || 1; for (var i = 0; i < 3; i++) o += line(x - d * (14 + i * 4) * s, y - 14 * s + i * 14 * s, x - d * (40 + i * 6) * s, y - 14 * s + i * 14 * s, INK, 2); return o; },
    whoosh: function (x, y, s, dir) { var d = dir || 1; return stroke('M' + pt(x - d * 10 * s, y - 16 * s) + 'q' + r1(-d * 24 * s) + ',' + r1(6 * s) + ' ' + r1(-d * 36 * s) + ',' + r1(24 * s) + ' M' + pt(x - d * 10 * s, y) + 'q' + r1(-d * 20 * s) + ',' + r1(4 * s) + ' ' + r1(-d * 30 * s) + ',' + r1(18 * s), INK, 1.8); },
    shake: function (x, y, s) { return stroke('M' + pt(x - 30 * s, y - 10 * s) + 'q-6,10 0,20 M' + pt(x - 38 * s, y - 14 * s) + 'q-8,14 0,28 M' + pt(x + 30 * s, y - 10 * s) + 'q6,10 0,20 M' + pt(x + 38 * s, y - 14 * s) + 'q8,14 0,28', INK, 1.8); },
    bounce: function (x, y, s) { return stroke('M' + pt(x - 16 * s, y) + 'q4,-6 8,0 M' + pt(x + 8 * s, y) + 'q4,-6 8,0', INK, 1.6); },
    hearts: function (x, y, s) { return heart(x - 12 * s, y, 6 * s) + heart(x + 10 * s, y - 14 * s, 5 * s) + heart(x + 2 * s, y - 30 * s, 4 * s); },
    notes: function (x, y, s) { return line(x, y, x, y - 18 * s, INK, 2) + ell(x - 3 * s, y, 4.5 * s, 3.4 * s, INK, 0) + path('M' + pt(x, y - 18 * s) + 'q8,2 9,10', 'none', 2) + line(x + 18 * s, y - 14 * s, x + 18 * s, y - 32 * s, INK, 2) + line(x + 28 * s, y - 18 * s, x + 28 * s, y - 36 * s, INK, 2) + line(x + 18 * s, y - 32 * s, x + 28 * s, y - 36 * s, INK, 3.4) + ell(x + 15 * s, y - 14 * s, 4.5 * s, 3.4 * s, INK, 0) + ell(x + 25 * s, y - 18 * s, 4.5 * s, 3.4 * s, INK, 0); },
    question: function (x, y, s) { return txt(x, y, '?', { size: 34 * s, fill: '#4a7fd0' }) + txt(x + 20 * s, y - 14 * s, '?', { size: 20 * s, fill: '#4a7fd0' }); },
    exclaim: function (x, y, s) { return txt(x, y, '!', { size: 36 * s, fill: '#d63a3a' }) + txt(x + 14 * s, y - 6 * s, '!', { size: 24 * s, fill: '#d63a3a' }); },
    idea: function (x, y, s) { var o = ''; for (var i = 0; i < 7; i++) { var a = M.PI * (1.05 + i * 0.15); o += line(x + M.cos(a) * 20 * s, y - 16 * s + M.sin(a) * 20 * s, x + M.cos(a) * 28 * s, y - 16 * s + M.sin(a) * 28 * s, '#f2a72e', 2.4); } return o + g(PROPS.lightbulb.d({}, '#ffe27a'), 'translate(' + r1(x) + ',' + r1(y) + ') scale(' + r1(s * 100) / 100 + ')'); },
    dizzy: function (x, y, s) { return ell(x, y, 26 * s, 7 * s, 'none', 1.4) + starPath(x - 22 * s, y + 2 * s, 5 * s, COL.gold, 1.2) + starPath(x + 18 * s, y - 4 * s, 5 * s, COL.gold, 1.2) + starPath(x, y + 7 * s, 4 * s, COL.gold, 1.2); },
    glow: function (x, y, s) { var o = ''; for (var i = 0; i < 12; i++) { var a = i * M.PI / 6; o += line(x + M.cos(a) * 26 * s, y + M.sin(a) * 26 * s, x + M.cos(a) * 38 * s, y + M.sin(a) * 38 * s, '#f2c14e', 2.6); } return o; },
    shine: function (x, y, s) { return stroke('M' + pt(x - 8 * s, y - 8 * s) + 'l-6,-6 M' + pt(x, y - 11 * s) + 'v-8 M' + pt(x + 8 * s, y - 8 * s) + 'l6,-6', '#f2a72e', 2.2); },
    splash: function (x, y, s) { return drop(x - 16 * s, y - 10 * s, 4 * s, '#7cc6f2') + drop(x + 16 * s, y - 12 * s, 4 * s, '#7cc6f2') + drop(x, y - 22 * s, 4 * s, '#7cc6f2') + ell(x, y, 22 * s, 4 * s, '#a9dcf7', 1.2); },
    dust: function (x, y, s) { return puff(x - 18 * s, y - 4 * s, 7 * s, '#e6dccb') + puff(x + 16 * s, y - 4 * s, 6 * s, '#e6dccb'); },
    rain: function () { var o = ''; for (var i = 0; i < 26; i++) { var x = (i * 37) % SW + 8, y = 10 + ((i * 53) % 200); o += line(x, y, x - 5, y + 14, '#4a9fd8', 2); } return o; },
    snow: function () { var o = '', r = seeded('fxsnow'); for (var i = 0; i < 30; i++) o += circ(r() * SW, r() * (GY - 20), 2.6, '#fff', 1, { stroke: '#a9c3d6' }); return o; },
    wind: function (x, y, s) { return stroke('M' + pt(x - 40 * s, y) + 'h50 q12,0 12,-10 q0,-8 -8,-8 q-8,0 -8,8 M' + pt(x - 50 * s, y + 14 * s) + 'h64 q10,0 10,8 q0,7 -7,7', '#7aa8c8', 2.2); },
    lightning: function (x, y, s) { return g(PROPS.lightning.d({}, '#ffd34d'), 'translate(' + r1(x) + ',' + r1(y) + ') scale(' + r1(s * 1.4 * 100) / 100 + ')'); },
    boom: function (x, y, s, dir, text) { var d = ''; for (var i = 0; i < 16; i++) { var a = i * M.PI / 8, r = (i % 2 ? 22 : 34) * s; d += (i ? 'L' : 'M') + pt(x + M.cos(a) * r * 1.3, y + M.sin(a) * r); } return path(d + 'Z', '#ffd34d', 2) + txt(x, y + 1, text || 'BOOM!', { size: 14 * s, fill: '#c0392b', base: 'middle' }); },
    cross: function (x, y, s) { return line(x - 18 * s, y - 18 * s, x + 18 * s, y + 18 * s, '#d63a3a', 6) + line(x + 18 * s, y - 18 * s, x - 18 * s, y + 18 * s, '#d63a3a', 6); },
    check: function (x, y, s) { return stroke('M' + pt(x - 16 * s, y) + 'L' + pt(x - 4 * s, y + 12 * s) + 'L' + pt(x + 18 * s, y - 14 * s), '#2f9a4a', 6); },
    circle: function (x, y, s) { return ell(x, y, 30 * s, 22 * s, 'none', 3, { stroke: '#d63a3a' }); },
    stink: function (x, y, s) { return stroke('M' + pt(x - 10 * s, y) + 'q-6,-8 0,-16 q6,-8 0,-16 M' + pt(x + 4 * s, y - 4 * s) + 'q-6,-8 0,-16 q6,-8 0,-16 M' + pt(x + 18 * s, y) + 'q-6,-8 0,-16 q6,-8 0,-16', '#7fa83a', 2.4); },
    cold: function (x, y, s) { return stroke('M' + pt(x - 30 * s, y - 8 * s) + 'l-6,4 l6,4 l-6,4 M' + pt(x + 30 * s, y - 8 * s) + 'l6,4 l-6,4 l6,4', '#4a9fd8', 2) + g(PROPS.snowflake.d({}, '#bfe3f5'), 'translate(' + r1(x + 20 * s) + ',' + r1(y - 20 * s) + ') scale(' + r1(s * 70) / 100 + ')'); },
    heat: function (x, y, s) { return stroke('M' + pt(x - 14 * s, y) + 'q-5,-6 0,-12 q5,-6 0,-12 M' + pt(x, y - 4 * s) + 'q-5,-6 0,-12 q5,-6 0,-12 M' + pt(x + 14 * s, y) + 'q-5,-6 0,-12 q5,-6 0,-12', '#e5484d', 2); },
    confetti: function (x, y, s) { var o = '', r = seeded('conf' + x), cols = [COL.red, COL.yellow, COL.blue, COL.green, COL.purple]; for (var i = 0; i < 14; i++) o += rect(x + (r() - 0.5) * 120 * s, y + (r() - 0.5) * 70 * s, 5, 8, cols[i % 5], 1, 1, { transform: 'rotate(' + M.round(r() * 180) + ' ' + r1(x) + ' ' + r1(y) + ')' }); return o; },
    fire: function (x, y, s) { return g(PROPS.fire.d({}, '#f6943d'), 'translate(' + r1(x) + ',' + r1(y) + ') scale(' + r1(s * 100) / 100 + ')'); },
    drip: function (x, y, s) { return drop(x, y + 6 * s, 3 * s, '#7cc6f2') + drop(x + 8 * s, y + 18 * s, 2.6 * s, '#7cc6f2'); },
    dots: function (x, y, s) { return circ(x - 10 * s, y, 3 * s, INK, 0) + circ(x, y, 3 * s, INK, 0) + circ(x + 10 * s, y, 3 * s, INK, 0); },
    blush: function (x, y, s) { return ell(x - 14 * s, y, 7 * s, 4 * s, '#ef7d7d', 0, { opacity: 0.7 }) + ell(x + 14 * s, y, 7 * s, 4 * s, '#ef7d7d', 0, { opacity: 0.7 }); },
    spotlight: function (x, y, s) { return path('M' + pt(x - 14 * s, 0) + 'L' + pt(x + 14 * s, 0) + 'L' + pt(x + 60 * s, GY + 4) + 'L' + pt(x - 60 * s, GY + 4) + 'Z', '#fff7c2', 0, { opacity: 0.55 }); },
    arrow: function (x, y, s, dir) { var d = dir || 1; return path('M' + pt(x - d * 24 * s, y - 5 * s) + 'L' + pt(x, y - 5 * s) + 'L' + pt(x, y - 12 * s) + 'L' + pt(x + d * 14 * s, y) + 'L' + pt(x, y + 12 * s) + 'L' + pt(x, y + 5 * s) + 'L' + pt(x - d * 24 * s, y + 5 * s) + 'Z', '#d63a3a', 1.6); }
  };
  var BUBBLES = ['say', 'think', 'shout', 'whisper'];
  function bubbleSvg(kind, text, hx, hy, minY, taken) {
    var size = 14, lh = size * 1.18, pad = kind === 'think' ? 10 : kind === 'shout' ? 9 : 3, lines, w, h, bx, by;
    function hits(x0, y0) { return taken.filter(function (t) { return x0 - pad < t[0] + t[2] + 4 && x0 + w + pad + 4 > t[0] && y0 - pad < t[1] + t[3] + 4 && y0 + h + pad + 4 > t[1]; })[0]; }
    function clampX(x0) { return M.max(4 + pad, M.min(SW - 4 - pad - w, x0)); }
    function clampY(y0) { return M.max(4 + pad, M.min(SH - 40 - h, y0)); }
    function layout(maxW) {
      lines = wrap(text, size, maxW); w = 0; lines.forEach(function (l) { w = M.max(w, textW(l, size)); });
      w = M.max(w + 22, 38); h = lines.length * lh + 14;
      bx = clampX(hx - w / 2); by = M.max(4 + pad, hy - 16 - h);
      var hit0 = hits(bx, by); if (!hit0) return true;
      // keep bubbles off labels and other bubbles: try beside, below or above whatever is in the way
      var cands = [[clampX(hit0[0] - w - 8 - pad), by], [clampX(hit0[0] + hit0[2] + 8 + pad), by], [bx, clampY(hit0[1] + hit0[3] + 8 + pad)], [bx, clampY(hit0[1] - h - 8 - pad)]];
      for (var ci = 0; ci < cands.length; ci++) { if (!hits(cands[ci][0], cands[ci][1]) && cands[ci][1] + h < hy + 6) { bx = cands[ci][0]; by = cands[ci][1]; return true; } }
      return false;
    }
    if (!layout(150) && !layout(118) && !layout(92)) layout(150);
    taken.push([bx, by, w, h]);
    var o = '', fill = '#fff', tx = M.max(bx + 12, M.min(bx + w - 12, hx)), ty = by + h;
    if (kind === 'think') {
      var n = M.max(3, M.round(w / 24)), cr = w / n * 0.6;
      for (var i = 0; i < n; i++) o += circ(bx + (i + 0.5) * w / n, by + 3, cr, fill, LW) + circ(bx + (i + 0.5) * w / n, by + h - 3, cr, fill, LW);
      o += circ(bx + 3, by + h / 2, h * 0.42, fill, LW) + circ(bx + w - 3, by + h / 2, h * 0.42, fill, LW) + rect(bx - 2, by + 2, w + 4, h - 4, fill, 0);
      var dx = (hx - tx) * 0.35;
      o += circ(tx + dx * 0.3, ty + cr * 0.6 + 6, 4.5, fill, 1.8) + circ(tx + dx * 0.7, ty + cr * 0.6 + 14, 3, fill, 1.6);
    } else if (kind === 'shout') {
      var sp = '', cx = bx + w / 2, cy = by + h / 2, rx = w / 2 + 8, ry = h / 2 + 8, N = 18;
      for (var j = 0; j < N; j++) { var a = j / N * M.PI * 2, rr = j % 2 ? 0.86 : 1.06; sp += (j ? 'L' : 'M') + pt(cx + M.cos(a) * rx * rr, cy + M.sin(a) * ry * rr); }
      o += path(sp + 'Z', '#fff7c2', LW);
    } else {
      var tail = 'M' + pt(tx - 7, ty - 1) + 'L' + pt(tx + (hx - tx) * 0.5, M.min(hy - 4, ty + 14)) + 'L' + pt(tx + 7, ty - 1);
      o += path(tail + 'Z', fill, LW) + rect(bx, by, w, h, fill, LW, 10, kind === 'whisper' ? { 'stroke-dasharray': '5 4' } : null) + rect(tx - 6, ty - 3, 12, 5, fill, 0);
    }
    lines.forEach(function (l, i) { o += txt(bx + w / 2, by + 7 + lh * (i + 0.5) + 1, l, { size: size, base: 'middle', italic: kind === 'whisper', fill: INK }); });
    return o;
  }
  // a label's text size: a number of pixels (8-26), a scale under 3 (0.8 = a little smaller), or small / normal / big
  function labelSize(v) {
    if (typeof v === 'string') { if (/^\d+(\.\d+)?$/.test(v)) v = +v; else return { tiny: 10, small: 12, s: 12, normal: 15, medium: 15, m: 15, big: 19, large: 19, l: 19, huge: 23 }[v.toLowerCase()] || 15; }
    if (typeof v !== 'number' || !isFinite(v) || v <= 0) return 15;
    if (v < 3) v *= 15;
    return M.max(8, M.min(26, v));
  }
  function labelSvg(L, ax, ay, box) { // a tag with words; ax, ay: the point it names (or null); box gets its rectangle
    var size = labelSize(L.size), s = String(L.text == null ? '' : L.text), w = textW(s, size) + 16, h = size + 10;
    var x = L.x != null ? L.x / 100 * SW : ax, y = L.y != null ? SH - L.y / 100 * SH : (ay != null ? ay - 34 : 30);
    var bx = M.max(3, M.min(SW - 3 - w, x - w / 2)), by = M.max(3, M.min(SH - 3 - h, y - h / 2));
    var o = '', col = L.color ? cc(L.color) : '#fff6d0';
    if (L.arrow !== false && ax != null && (M.abs(ax - (bx + w / 2)) > 4 || M.abs(ay - (by + h)) > 10)) {
      var sx = bx + w / 2, sy = ay > by + h ? by + h : by;
      o += stroke('M' + pt(sx, sy) + 'L' + pt(ax, ay), INK, 1.8) + circ(ax, ay, 2.6, INK, 0);
    }
    while (w > SW - 8 && size > 9) { size -= 1; w = textW(s, size) + 16; h = size + 10; bx = M.max(3, M.min(SW - 3 - w, x - w / 2)); }
    if (box) { box.x = bx; box.y = by; box.w = w; box.h = h; }
    o += rect(bx, by, w, h, col, 2, 6) + txt(bx + w / 2, by + h / 2 + 1, s, { size: size, base: 'middle', fill: L.ink || INK });
    return o;
  }

  /* ---------------- the scene: spec → SVG ---------------- */
  var FX_BEHIND = { spotlight: 1 };
  function sceneSVG(spec, opt) {
    spec = spec || {}; opt = opt || {};
    var quiet = !!opt.quiet, out = '', fg = '', fxS = '', bub = '', labs = '', where = {};
    // in quiet mode with opt.word, words in labels and bubbles that spell the answer become "?" ("BENEFACTOR = the GIVER" → "? = the GIVER")
    // (only the word, its inflections and its family; sound-alike cues such as SPARE for sparse stay)
    var qre = quiet && (opt.entry || opt.word) ? VO.formsRe(opt.entry || opt.word) : null;
    function qt(t) { return qre && t != null ? VO.hideForms(t, qre) : t; }
    out += backdrop(spec.bg || 'plain', spec.night);
    function X(p) { return (p == null ? 50 : p) / 100 * SW; }
    function lift(p) { return (p || 0) / 100 * SH; }
    // things in order: back props, animals and people (in the order given), front props
    var items = [];
    (spec.props || []).forEach(function (p, i) { items.push({ t: 'p', i: i, o: p, z: p.front ? 3 : p.back ? 0 : 1 }); });
    (spec.animals || []).forEach(function (a, i) { items.push({ t: 'a', i: i, o: a, z: a.front ? 3 : 2 }); });
    var cast = spec.cast || [];
    cast.forEach(function (c, i) { items.push({ t: 'c', i: i, o: c, z: c.front ? 3 : 2 }); });
    items.sort(function (a, b) { var ra = a.o.row === 'back' ? 0 : 1, rb = b.o.row === 'back' ? 0 : 1; return ra - rb || a.z - b.z; });
    var nC = cast.length;
    items.forEach(function (it) {
      var o = it.o, back = o.row === 'back', sc = (o.s || 1) * (back ? 0.72 : 1), base = (back ? GY - 26 : GY) - lift(o.y);
      if (it.t === 'p') {
        var x = X(o.x != null ? o.x : 50);
        if (o.text != null && /^(sign|banner|placard)$/.test(o.kind)) { var hw0 = (M.min(110, textW(o.text, 13) + 18) / 2 + 4) * (o.s || 1); x = M.max(hw0, M.min(SW - hw0, x)); }
        fg += propSvg(o.kind, x, base + (o.dy || 0), (o.s || 1) * (back ? 0.72 : 1), { text: qt(o.text), color: o.color, flip: o.flip, rot: o.rot, open: o.open, full: o.full, steam: o.steam, water: o.water, soup: o.soup, heart: o.heart, fruit: o.fruit });
        var P = PROPS[o.kind] || PROPS.box;
        where['p' + it.i] = { x: x, top: base - P.h * sc, mid: base - P.h * sc / 2, feet: base, R: P.h * sc / 2 };
      } else if (it.t === 'a') {
        var ax = X(o.x != null ? o.x : 70), A = animal(o), flip = !!o.flip, pose = o.pose;
        var tr = 'translate(' + r1(ax) + ',' + r1(base) + ') scale(' + (flip ? -sc : sc) + ',' + sc + ')';
        if (pose === 'jump') tr = 'translate(' + r1(ax) + ',' + r1(base - 24 * sc) + ') rotate(' + (flip ? 10 : -10) + ') scale(' + (flip ? -sc : sc) + ',' + sc + ')';
        if (pose === 'lie' || pose === 'sleep') tr = 'translate(' + r1(ax) + ',' + r1(base) + ') scale(' + (flip ? -sc : sc) + ',' + r1(sc * 0.82) + ')';
        if (pose === 'fly' || pose === 'swim') tr = 'translate(' + r1(ax) + ',' + r1(base - (o.y ? 0 : 60)) + ') scale(' + (flip ? -sc : sc) + ',' + sc + ')';
        fg += g(A.svg, tr, { class: 'vo-animal' });
        var hx2 = ax + (flip ? -1 : 1) * A.head[0] * sc, hy2 = base + A.head[1] * sc - ((pose === 'fly' || pose === 'swim') && !o.y ? 60 : 0);
        where['a' + it.i] = { x: ax, top: base + A.top * sc - ((pose === 'fly' || pose === 'swim') && !o.y ? 60 : 0), head: [hx2, hy2], feet: base, mid: base - A.h * sc / 2, R: 10 * sc, flip: flip };
      } else {
        var cx = X(o.x != null ? o.x : 100 * (it.i + 1) / (nC + 1)), Pp = person(qre && o.htext != null ? Object.assign({}, o, { htext: qt(o.htext) }) : o), fl = !!o.flip;
        var trp = 'translate(' + r1(cx) + ',' + r1(base) + ') scale(' + (fl ? -sc : sc) + ',' + sc + ')';
        if (o.pose === 'lie') { var len = -Pp.top; trp = 'translate(' + r1(cx + (fl ? -1 : 1) * len * sc / 2) + ',' + r1(base - Pp.R * 0.9 * sc) + ') rotate(' + (fl ? 90 : -90) + ') scale(' + sc + ')'; }
        if (o.pose === 'sit' && o.seat !== false && o.seat !== 'none') { var seatK = o.seat || 'chair', seatTop = { chair: 26, stool: 20, bench: 18, throne: 20, sofa: 22, rock: 18, log: 14, stump: 18 }[seatK] || 26; fg += propSvg(seatK, cx, base, -Pp.hipY * sc / seatTop, {}); }
        fg += g(Pp.svg, trp, { class: 'vo-person' });
        var mapPt = function (q) { if (o.pose === 'lie') { var lx = q[1], ly = -q[0]; return [cx + (fl ? -1 : 1) * (len * sc / 2 + lx * sc), base - Pp.R * 0.9 * sc + ly * sc * (fl ? -1 : 1)]; } return [cx + (fl ? -1 : 1) * q[0] * sc, base + q[1] * sc]; };
        var hd = mapPt(Pp.head);
        where['c' + it.i] = { x: cx, head: hd, top: o.pose === 'lie' ? hd[1] - Pp.R * sc * 1.2 : base + Pp.top * sc, R: Pp.R * sc, hand: mapPt(Pp.hands.R), handL: mapPt(Pp.hands.L), hands: mapPt(Pp.hands.mid), feet: base, mid: mapPt(Pp.body)[1], flip: fl };
      }
    });
    // effects (a spotlight goes behind everyone; the rest on top)
    var behind = '';
    (spec.fx || []).forEach(function (f) {
      var w0 = f.on ? where[f.on] : null, s = f.s || 1, x, y;
      if (w0) {
        var atp = f.at || 'head';
        if (atp === 'head') { x = (w0.head || [w0.x])[0] + (w0.R || 20) * 1.15; y = (w0.head ? w0.head[1] : w0.top) - (w0.R || 20) * 0.9; }
        if (atp === 'above') { x = w0.head ? w0.head[0] : w0.x; y = w0.top - 14 * s; }
        if (atp === 'face') { x = w0.head ? w0.head[0] : w0.x; y = w0.head ? w0.head[1] + (w0.R || 20) * 0.3 : w0.mid; }
        if (atp === 'hand') { x = (w0.hand || [w0.x])[0]; y = w0.hand ? w0.hand[1] - 10 : w0.mid; }
        if (atp === 'body') { x = w0.x; y = w0.mid; }
        if (atp === 'feet') { x = w0.x; y = w0.feet - 4; }
        if (atp === 'behind') { x = w0.x; y = w0.mid; }
      } else { x = X(f.x); y = f.y != null ? SH - lift(f.y) : 80; }
      if (f.dx) x += f.dx / 100 * SW; if (f.dy) y -= f.dy / 100 * SH;
      var fn = FX[f.kind], piece = fn ? fn(x, y, s, f.dir || (w0 && w0.flip ? -1 : 1), f.text) : '';
      if (FX_BEHIND[f.kind]) behind += piece; else fxS += piece;
    });
    out += behind + fg + fxS;
    // labels are placed first so bubbles can move out of their way (drawn last, on top)
    var taken = [];
    var names = cast.map(function (c, i) { return c.name ? { text: c.name, on: 'c' + i, at: 'feet', y: 4.5, size: 12, arrow: false } : null; }).filter(Boolean);
    names.concat(spec.labels || []).forEach(function (L) {
      if (quiet && L.hide) return;
      var w0 = L.on ? where[L.on] : null, ax = null, ay = null;
      if (w0) { ax = w0.head && L.at !== 'body' && L.at !== 'feet' ? w0.head[0] : w0.x; ay = L.at === 'feet' ? w0.feet : L.at === 'body' ? w0.mid : w0.top; if (L.at === 'hand' && w0.hand) { ax = w0.hand[0]; ay = w0.hand[1]; } }
      if (qre) L = Object.assign({}, L, { text: qt(L.text) });
      var r0 = {}; labs += labelSvg(L, ax, ay, r0); taken.push([r0.x, r0.y, r0.w, r0.h]);
    });
    // speech and thought bubbles (people and animals)
    function bubblesFor(list, prefix) {
      (list || []).forEach(function (c, i) {
        var w0 = where[prefix + i]; if (!w0) return;
        BUBBLES.forEach(function (k) { if (c[k] && !(quiet && c.hideInQuiet)) { var hx = w0.head ? w0.head[0] : w0.x, hy = w0.top; bub += bubbleSvg(k, qt(c[k]), hx, hy, 0, taken); } });
      });
    }
    bubblesFor(cast, 'c'); bubblesFor(spec.animals, 'a');
    out += bub + labs;
    var alt = spec.alt || '';
    return '<svg class="vo-scene-svg" viewBox="0 0 ' + SW + ' ' + SH + '" role="img" focusable="false" xmlns="http://www.w3.org/2000/svg"' + (alt ? ' aria-label="' + esc(alt) + '"' : ' aria-hidden="true"') + '>' + out + '</svg>';
  }
  /* ---------------- the word card as HTML (used by vo-word, the flashcards, the word pages and the printable book) ---------------- */
  // entry: a full entry; o.mode: 'card' (default) | 'print' | 'front' (picture side) | 'back' | 'word' (word side) | 'mini'
  // o.quiet: hide the word (and its forms) so the card can be part of a problem; o.speak: a "Say it" button
  function cardHTML(e, o) {
    o = o || {}; if (!e) return '';
    var mode = o.mode || 'card', quiet = !!o.quiet, w = e.word, h = '', V0 = VO;
    var wre = quiet ? V0.formsRe(e) : null; // the word, its inflections and its family, blanked in quiet mode
    function hide(s) { return quiet ? V0.hideForms(V0.esc(s), wre, '______') : V0.esc(s); }
    function sent(s) { return quiet ? V0.hideForms(V0.blank(s), wre, '______') : V0.mark(s); }
    function list(a) { return (a || []).map(function (x) { return V0.esc(typeof x === 'string' ? x : x.w + (x.pos ? ' (' + (V0.posName(x.pos)) + ')' : '')); }).join(', '); }
    var head = '<header class="vo-head"><h3 class="vo-w" lang="en">' + (quiet ? '?' : V0.esc(w)) + '</h3>' + (quiet ? '' : V0.say(e.say)) + '<span class="vo-pos">' + V0.esc(V0.posName(e.pos)) + '</span>' +
      (o.speak && !quiet ? '<button type="button" class="vo-speak" data-say="' + V0.esc(w) + '" aria-label="Say ' + V0.esc(w) + '">🔊</button>' : '') + '</header>';
    var pic = e.scene ? '<div class="vo-pic">' + sceneSVG(e.scene, { quiet: quiet, word: w, entry: e }) + '</div>' : '';
    var def = '<p class="vo-def"><span class="vo-k">Meaning</span> ' + V0.esc(e.def) + '</p>';
    var mn = e.mn ? '<div class="vo-mn"><span class="vo-k">Memory hook</span> <b>' + hide(e.mn.cue) + '.</b> ' + (quiet ? hide(V0.plain(e.mn.text)) : V0.mark(e.mn.text)) + '</div>' : '';
    var ex = (e.ex ? '<p class="vo-ex">' + sent(e.ex) + '</p>' : '') + (e.ctx && mode !== 'print' && mode !== 'mini' ? '<p class="vo-ex vo-ctx"><span class="vo-k">In context</span> ' + sent(e.ctx) + '</p>' : '');
    var roots = (e.roots && e.roots.length ? '<p class="vo-rts"><span class="vo-k">Parts</span> ' + e.roots.map(function (r) { return '<span class="vo-part">' + V0.esc(r.part) + '</span> ' + V0.esc(r.means); }).join(' <span class="vo-plus">+</span> ') + '</p>' : '') + (e.etym && mode !== 'mini' && mode !== 'print' ? '<p class="vo-etym">' + hide(e.etym) + '</p>' : '');
    var more = '';
    if (e.syn && e.syn.length) more += '<div><dt>Similar</dt><dd>' + list(e.syn) + '</dd></div>';
    if (e.ant && e.ant.length) more += '<div><dt>Opposite</dt><dd>' + list(e.ant) + '</dd></div>';
    if (e.family && e.family.length && !quiet && mode !== 'print') more += '<div><dt>Family</dt><dd>' + list(e.family) + '</dd></div>';
    more = more ? '<dl class="vo-more">' + more + '</dl>' : '';
    var note = e.note && mode !== 'print' && mode !== 'mini' ? '<p class="vo-note">' + hide(e.note) + '</p>' : '';
    var cls = 'vo-card vo-card-' + mode + (quiet ? ' vo-quiet' : '');
    if (mode === 'front') h = pic + '<div class="vo-txt">' + def + (e.mn ? '<p class="vo-mn"><span class="vo-k">Hook</span> <b>' + hide(e.mn.cue) + '</b></p>' : '') + '</div>';
    else if (mode === 'word') h = '<div class="vo-txt vo-wordside">' + head + '</div>';
    else if (mode === 'mini') h = head + def + mn;
    else if (mode === 'print') h = head + pic + '<div class="vo-txt">' + def + mn + ex + roots + more + '</div>';
    else h = head + '<div class="vo-cols">' + pic + '<div class="vo-txt">' + def + mn + ex + roots + more + note + '</div></div>';
    return '<article class="' + cls + '" data-word="' + V0.esc(w) + '">' + h + '</article>';
  }
  VO.cardHTML = cardHTML;
  // a root tree as HTML: one root, its meaning, and the words built on it (with the root highlighted in each word)
  function rootParts(form) { return String(form).split(/,\s*/).map(function (f) { return f.replace(/^-|-$/g, '').replace(/[()]/g, ''); }).filter(Boolean).sort(function (a, b) { return b.length - a.length; }); }
  function hiRoot(word, R0) {
    var parts = rootParts(R0.form), lw = word.toLowerCase(), at = -1, len = 0;
    for (var i = 0; i < parts.length && at < 0; i++) {
      var p = parts[i].toLowerCase(), k;
      if (R0.kind === 'prefix') k = lw.indexOf(p) === 0 ? 0 : -1;
      else if (R0.kind === 'suffix') k = lw.lastIndexOf(p) >= 0 && lw.lastIndexOf(p) === lw.length - p.length ? lw.length - p.length : -1;
      else k = lw.indexOf(p);
      if (k >= 0) { at = k; len = p.length; }
    }
    if (at < 0 && R0.kind === 'prefix') { var p3 = parts[0].toLowerCase().slice(0, 3); if (p3.length === 3 && lw.indexOf(p3) === 0) { at = 0; len = 3; } } // bene- in benign
    if (at < 0) return VO.esc(word);
    return VO.esc(word.slice(0, at)) + '<b class="vo-rt">' + VO.esc(word.slice(at, at + len)) + '</b>' + VO.esc(word.slice(at + len));
  }
  VO.hiRoot = function (word, key) { var R0 = VO.ROOT(key); return R0 ? hiRoot(word, R0) : VO.esc(word); };
  VO.rootTreeHTML = function (key, o) {
    o = o || {}; var R0 = typeof key === 'object' ? key : VO.ROOT(key); if (!R0) return '';
    var words = (o.words || R0.words || []).slice(0, o.max || 12), quiet = !!o.quiet;
    var items = words.map(function (w0) {
      var w = typeof w0 === 'string' ? w0 : w0.w, row = VO.find(w), g0 = typeof w0 === 'object' && w0.g ? w0.g : row ? row.g : '';
      return '<li class="vo-leaf"><span class="vo-lw">' + hiRoot(w, R0) + '</span>' + (quiet ? '' : '<span class="vo-lg">' + VO.esc(g0) + '</span>') + '</li>';
    }).join('');
    var ex = !quiet && R0.ex && R0.ex.length ? '<p class="vo-tree-ex">Also: ' + R0.ex.map(function (x) { return hiRoot(x, R0); }).join(', ') + '</p>' : '';
    return '<div class="vo-tree' + (quiet ? ' vo-quiet' : '') + '"><div class="vo-trunk"><span class="vo-tform">' + VO.esc(R0.form) + '</span><span class="vo-tmean">' + (quiet ? '= ?' : '= ' + VO.esc(R0.means)) + '</span><span class="vo-tlang">' + VO.esc(R0.lang || '') + ' ' + VO.esc(R0.kind || '') + '</span></div><ul class="vo-branches">' + items + '</ul>' + ex + '</div>';
  };
  /* ---------------- problem making for the Vocabulary Ladder (generators call these; see overview.md) ----------------
     VO.gen.topic(id, R, ctx)       a problem for an adv topic, from its ten word entries (static/vocab/gen/adv.js calls it)
     VO.gen.item(item, R, ctx)      a problem from a hand-written item (the "items" list in a topic file)
     VO.gen.root(keys, R, ctx)      a problem for a roots-course topic about these roots (root keys from VO.ROOT)
     VO.gen.kinds                   the kinds of problems topic() makes at each level                                    */
  var GEN = VO.gen = {};
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { var k = String(x).toLowerCase(); if (!s[k]) { s[k] = 1; o.push(x); } }); return o; }
  function q1(s, end) { return '“' + s + (end || '') + '”'; } // American style: a closing period goes inside the quotation marks
  function mc(choices, right) { return { t: 'mc', choices: choices, v: right }; }
  function pickDistinct(R, pool, n, avoid) {
    var av = {}; (avoid || []).forEach(function (x) { av[String(x).toLowerCase()] = 1; });
    var p = uniq(pool).filter(function (x) { return !av[String(x).toLowerCase()]; });
    return R.sample(p, M.min(n, p.length));
  }
  function withAnswer(R, right, wrong) { var all = R.shuffle([right].concat(wrong)); return { choices: all, v: all.indexOf(right) }; }
  function hook(e) { return e.mn ? 'Memory hook: <b>' + VO.esc(e.mn.cue) + '.</b> ' + VO.mark(e.mn.text) : ''; }
  function meaningStep(e) { return '<b>' + VO.esc(e.word) + '</b> (' + VO.posName(e.pos) + ') means ' + q1(VO.esc(e.def), '.'); }
  function baseForm(s, w) { var f = VO.form(s); return f && f.toLowerCase() === String(w).toLowerCase(); }
  function lc(a) { return (a || []).map(function (x) { return String(x).toLowerCase(); }); }
  /* ---- meaning relations, from the entries' own data, so every problem has one best answer ----
     Each entry gives a cluster: the word, its synonyms and its family. near(w) = w and every word that shares a cluster with
     it. Two words are ALIKE when their near sets meet (rigorous ~ painstaking through meticulous; demolish ~ raze) or they
     share an opposite (elated and buoyant are both the opposite of despondent), and
     OPPOSED when an antonym listed in a cluster of one is near the other (craven ~ valiant, bold). Wrong choices are never
     alike to the right answer; in synonym questions they are not opposed either, and in antonym questions they are never
     opposed to the word or alike to its listed opposite. scripts/vocab/test-kit.js checks all 1,000 entries this way. */
  var REL = null;
  function low(x) { return String(x).toLowerCase(); }
  function rel() {
    if (REL && REL.v === VO.entriesVersion) return REL;
    var all = VO.allEntries();
    var NB = {}, AN = {};
    function add(m, a, b) { (m[a] = m[a] || {})[b] = 1; }
    all.forEach(function (e) {
      var cl = uniq([e.word].concat(e.syn || [], (e.family || []).map(function (f) { return f && f.w; }).filter(Boolean))).map(low), an = uniq(e.ant || []).map(low);
      cl.forEach(function (a) { cl.forEach(function (b) { add(NB, a, b); }); an.forEach(function (b) { add(AN, a, b); add(AN, b, a); }); });
    });
    REL = { v: VO.entriesVersion, n: all.length, NB: NB, AN: AN, near: {}, opp: {}, pools: {}, all: all };
    return REL;
  }
  // sets are { o: { word: 1 }, k: [words] } (cached per word)
  function near(w) { var r = rel(), k = low(w); if (!r.near[k]) { var o = {}; o[k] = 1; for (var x in r.NB[k] || {}) o[x] = 1; r.near[k] = { o: o, k: Object.keys(o) }; } return r.near[k]; }
  function opp(w) { var r = rel(), k = low(w); if (!r.opp[k]) { var o = {}; near(k).k.forEach(function (p) { for (var x in r.AN[p] || {}) o[x] = 1; }); r.opp[k] = { o: o, k: Object.keys(o) }; } return r.opp[k]; }
  function meets(A, B) { if (A.k.length > B.k.length) { var t = A; A = B; B = t; } for (var i = 0; i < A.k.length; i++) if (B.o[A.k[i]]) return true; return false; }
  function similar(a, b) { return meets(near(a), near(b)); } // shared synonyms or family
  function alike(a, b) { return similar(a, b) || meets(opp(a), opp(b)); } // … or a shared opposite
  function opposed(a, b) { return meets(opp(a), near(b)) || meets(opp(b), near(a)); }
  VO.alike = alike; VO.opposed = opposed; // for tests and pages
  // two entries also count as alike when their definitions share a content word (stem), or one's definition uses the
  // other's synonym: in a topic of near-synonyms (elated, exuberant: "excited", "excitement") neither can be the wrong answer
  var STOP = {}; ('and the something someone somebody that not with for also one often without way especially very person people others other ' +
    'make makes made out from what about things thing who too having done doing being time times than more less much many little great ' +
    'extremely completely usually easily again back down over into after before between this when which while your you they them their ' +
    'can could may might must able become becomes get gets take takes give gives giving use used using keep keeps act acts acting all only ' +
    'but just even such some any each else another kind sort part still well like quite rather certain really').split(' ').forEach(function (w) { STOP[w] = 1; });
  function stems(s) { var o = {}; String(s || '').toLowerCase().split(/[^a-z]+/).forEach(function (w) { if (w.length >= 4 && !STOP[w]) o[w.slice(0, 5)] = 1; }); return o; }
  function sense(e) {
    var r = rel(); r.sense = r.sense || {}; var k = low(e.word);
    if (!r.sense[k]) { var d = stems(e.def), all = stems([e.def, e.word].concat(e.syn || []).join(' ')); r.sense[k] = { d: { o: d, k: Object.keys(d) }, a: { o: all, k: Object.keys(all) } }; }
    return r.sense[k];
  }
  function defClose(a, b) { if (!a.def || !b.def) return false; var A = sense(a), B = sense(b); return meets(A.d, B.a) || meets(B.d, A.a); }
  function unlike(x, e) { return !alike(x.word, e.word) && !defClose(x, e); }
  // candidates in tiers (the first tier is used up first), each passing ok(x); none twice, none in avoid
  function fill(R, n, tiers, ok, avoid, key) {
    var out = [], seen = {}; key = key || function (x) { return low(typeof x === 'string' ? x : x.word); };
    (avoid || []).forEach(function (x) { seen[low(x)] = 1; });
    for (var t = 0; t < tiers.length && out.length < n; t++) {
      var list = (tiers[t] || []).slice(), m = list.length;
      while (m && out.length < n) { // a shuffle that stops as soon as there are enough
        var j = R.int(0, m - 1), x = list[j]; list[j] = list[--m]; list[m] = x;
        var k = key(x); if (!seen[k] && ok(x)) out.push(x); seen[k] = 1;
      }
    }
    return out;
  }
  function pool(name, make) { var r = rel(); return r.pools[name] || (r.pools[name] = make(r.all)); }
  function topicOf(e) { return VO.topic(e.topic) || { strand: 0, level: 5 }; }
  // entries to draw wrong choices from, nearest first: the same topic, then nearby levels, then everything
  function entryTiers(e, E, samePos) {
    var lv = topicOf(e).level, P = samePos ? e.pos : '', sp = function (x) { return !P || x.pos === P; };
    return [E.filter(function (x) { return x.word !== e.word && sp(x); }),
      pool('near|' + P + '|' + lv, function (all) { return all.filter(function (x) { return sp(x) && M.abs(topicOf(x).level - lv) <= 2; }); }),
      pool('pos|' + P, function (all) { return all.filter(sp); }), rel().all];
  }
  function wordsFrom(tiers) { return tiers.map(function (l) { return l.map(function (x) { return x.word; }); }); }
  function wrongWords(e, E, R, n, hard) { // headwords not alike in meaning to e (same part of speech when possible)
    var T = wordsFrom(entryTiers(e, E, true)); if (hard) T = [T[1], T[0], T[2], T[3]];
    return fill(R, n, T, function (w) { var x = VO.entry(w); return x ? unlike(x, e) : !alike(w, e.word); }, [e.word]);
  }
  function article(w) { var s = low(w); if (/^(hour|heir|honest|honor)/.test(s)) return 'an'; if (/^(u(bi|ni|s[aeiu]|t[eio]|r[aeiu]|ku)|eu|ewe|one\b|once)/.test(s)) return 'a'; return /^[aeiou]/.test(s) ? 'an' : 'a'; }
  // put w in place of a sentence's braced form, fixing "a"/"an" before it and the capital at the start of a sentence
  function swapIn(s, w) {
    return String(s).replace(/(\b[Aa]n?\s+)?\{([^}]+)\}/, function (m, art, f) {
      var x = /^[A-Z][a-z]/.test(f) || /^[A-Z]$/.test(f) ? w.charAt(0).toUpperCase() + w.slice(1) : w;
      if (art) { var a2 = article(w); art = (/^A/.test(art) ? a2.charAt(0).toUpperCase() + a2.slice(1) : a2) + ' '; }
      return (art || '') + '{' + x + '}';
    });
  }
  VO.swapIn = swapIn;
  function isPhrase(x) { return String(x).split(/\s+/).length > 2; }
  GEN.kinds = { 1: ['meaning', 'word', 'meaning', 'word', 'hook', 'tf'], 2: ['cloze', 'cloze', 'synonym', 'meaning', 'usage', 'word', 'tf'], 3: ['cloze3', 'cloze3', 'antonym', 'type', 'usage', 'roots', 'synonym'] };
  var MAKERS = {
    meaning: function (e, E, R) {
      var wrong = fill(R, 3, entryTiers(e, E, true), function (x) { return x.def && low(x.def) !== low(e.def) && unlike(x, e); }, [], function (x) { return low(x.def); });
      if (wrong.length < 3) return null;
      var A = withAnswer(R, e.def, wrong.map(function (x) { return x.def; }));
      return { q: 'What does <b>' + VO.esc(e.word) + '</b> mean?', a: mc(A.choices, A.v), steps: [meaningStep(e), hook(e)].filter(Boolean), hint: e.mn ? 'Memory hook: ' + VO.esc(e.mn.cue) + '.' : 'Think of a sentence you have seen it in.', src: wrong.map(function (x) { return x.word; }) };
    },
    word: function (e, E, R) {
      var wr = wrongWords(e, E, R, 3); if (wr.length < 3) return null;
      var A = withAnswer(R, e.word, wr);
      return { q: 'Which word means ' + q1(VO.esc(e.def)) + '?', a: mc(A.choices, A.v), steps: [meaningStep(e), hook(e)].filter(Boolean), hint: 'It is ' + article(VO.posName(e.pos)) + ' ' + VO.posName(e.pos) + '. ' + (e.mn ? 'Memory hook: ' + VO.esc(e.mn.cue) + '.' : '') };
    },
    hook: function (e, E, R) {
      if (!e.mn) return null;
      if (VO.hideForms(e.mn.cue, e) !== e.mn.cue) return null; // the hook spells the word out
      var wr = wrongWords(e, E, R, 3); if (wr.length < 3) return null;
      var A = withAnswer(R, e.word, wr);
      return { q: 'Which word does this memory hook help you remember?<br><i>' + VO.esc(e.mn.cue) + '</i>', a: mc(A.choices, A.v), steps: [hook(e), meaningStep(e)], hint: 'Say the hook out loud and listen for the word inside it.' };
    },
    tf: function (e, E, R) {
      var truth = R.coin(), other = null;
      if (!truth) { other = fill(R, 1, entryTiers(e, E, true), function (x) { return x.def && low(x.def) !== low(e.def) && unlike(x, e); })[0] || null; if (!other) truth = true; }
      var d = truth ? e.def : other.def;
      return { q: 'True or false: <b>' + VO.esc(e.word) + '</b> means ' + q1(VO.esc(d), '.'), a: { t: 'tf', v: truth }, steps: [meaningStep(e)].concat(truth ? [] : [q1(VO.esc(d)) + ' is the meaning of <b>' + VO.esc(other.word) + '</b>.']).concat([hook(e)]).filter(Boolean), hint: e.mn ? 'Memory hook: ' + VO.esc(e.mn.cue) + '.' : '', src: other ? [other.word] : [] };
    },
    cloze: function (e, E, R, hard) {
      var ss = [e.ctx, e.ex].filter(function (s) { return s && baseForm(s, e.word); });
      if (!ss.length) return null;
      var s = hard ? ss[0] : R.pick(ss);
      var wrong = wrongWords(e, E, R, 3, hard);
      if (wrong.length < 3) return null;
      var A = withAnswer(R, e.word, wrong);
      return { q: 'Which word best completes the sentence?<br><span class="vo-cl">' + VO.blank(s) + '</span>', a: mc(A.choices, A.v), steps: ['The sentence needs a word that means ' + q1(VO.esc(e.def)) + ':<br>' + VO.mark(s), meaningStep(e), hook(e)].filter(Boolean), hint: 'Find the clue in the sentence: what must the missing word mean?' };
    },
    cloze3: function (e, E, R) { return MAKERS.cloze(e, E, R, true); },
    synonym: function (e, E, R) {
      var syn = (e.syn || []).filter(function (x) { return low(x) !== low(e.word) && !opposed(x, e.word); });
      if (!syn.length) return null;
      var right = R.pick(syn), st = topicOf(e).strand, lv = topicOf(e).level;
      // wrong choices: words unrelated in meaning, from other strands (their headwords and synonyms)
      function words(name, f) { return pool(name, function (all) { var o = []; all.forEach(function (x) { if (f(x)) { o.push(x.word); (x.syn || []).forEach(function (y) { o.push(y); }); } }); return o; }); }
      var tiers = [words('sw|' + e.pos + '|' + st + '|' + lv, function (x) { return x.pos === e.pos && topicOf(x).strand !== st && M.abs(topicOf(x).level - lv) <= 2; }),
        words('sw|' + e.pos + '|' + st, function (x) { return x.pos === e.pos && topicOf(x).strand !== st; }), words('sw|' + st, function (x) { return topicOf(x).strand !== st; })];
      var wrong = fill(R, 3, tiers, function (c) { return !isPhrase(c) && !alike(c, e.word) && !alike(c, right) && !opposed(c, e.word) && !opposed(c, right); }, [e.word, right].concat(e.syn || [], e.ant || []));
      if (wrong.length < 3) return null;
      var A = withAnswer(R, right, wrong);
      return { q: 'Which word is closest in meaning to <b>' + VO.esc(e.word) + '</b>?', a: mc(A.choices, A.v), steps: [meaningStep(e), '<b>' + VO.esc(right) + '</b> is close in meaning. Other similar words: ' + VO.esc(syn.filter(function (x) { return x !== right; }).join(', ') || 'none listed') + '.'], hint: 'First recall what ' + VO.esc(e.word) + ' means, then find the word that means nearly the same.', src: [right] };
    },
    antonym: function (e, E, R) {
      var ant = (e.ant || []).filter(function (x) { return low(x) !== low(e.word) && !similar(x, e.word); });
      if (!ant.length) return null;
      var right = R.pick(ant), forms = {}; VO.wordForms(e).forEach(function (f) { forms[f] = 1; });
      // wrong choices: the word's own synonyms and near-synonyms (the classic trap), then unrelated words
      var t1 = near(e.word).k, t2 = []; (e.syn || []).forEach(function (s) { t2 = t2.concat(near(s).k); });
      var t3 = pool('aw|' + e.pos, function (all) { var o = []; all.forEach(function (x) { if (x.pos === e.pos) { o.push(x.word); (x.syn || []).forEach(function (y) { o.push(y); }); } }); return o; });
      var wrong = fill(R, 3, [t1, t2, t3], function (c) { return !forms[low(c)] && !isPhrase(c) && !opposed(c, e.word) && !similar(c, right); }, [e.word, right].concat(ant));
      if (wrong.length < 3) return null;
      var A = withAnswer(R, right, wrong);
      return { q: 'Which word is most nearly <b>opposite</b> in meaning to <b>' + VO.esc(e.word) + '</b>?', a: mc(A.choices, A.v), steps: [meaningStep(e), '<b>' + VO.esc(right) + '</b> means nearly the opposite.' + ((e.syn || []).length ? ' Words like ' + VO.esc(e.syn.slice(0, 2).join(' and ')) + ' mean nearly the same, so they are not opposites.' : '')], hint: 'Watch out: some choices mean the same thing, not the opposite.', src: [right] };
    },
    usage: function (e, E, R) {
      if (!e.ex || !baseForm(e.ex, e.word)) return null;
      var others = fill(R, 3, entryTiers(e, E, true).slice(0, 3), function (x) { return x.pos === e.pos && x.ex && baseForm(x.ex, x.word) && unlike(x, e) && VO.plain(x.ex) !== VO.plain(e.ex); });
      if (others.length < 3) return null;
      var wrongS = others.map(function (x) { return VO.plain(swapIn(x.ex, e.word)); });
      var A = withAnswer(R, VO.plain(e.ex), wrongS);
      return { q: 'Which sentence uses <b>' + VO.esc(e.word) + '</b> correctly?', a: mc(A.choices, A.v), steps: [meaningStep(e), 'Only this sentence fits that meaning: ' + VO.mark(e.ex)], hint: 'Try putting the meaning in place of the word in each sentence.', src: others.map(function (x) { return x.word; }) };
    },
    type: function (e, E, R) {
      if (/\s/.test(e.word)) return null;
      return { q: 'Type the word that means ' + q1(VO.esc(e.def)) + '. It begins with “' + VO.esc(e.word[0]) + '” and has ' + e.word.length + ' letters.', a: { t: 'text', v: [e.word] }, steps: [meaningStep(e), hook(e)].filter(Boolean), hint: e.mn ? 'Memory hook: ' + VO.esc(e.mn.cue) + '.' : 'Say the respelling: ' + VO.esc(e.say || '') + '.' };
    },
    roots: function (e, E, R) {
      var parts = (e.roots || []).filter(function (r) { return r.part && r.means && r.part.length > 1; });
      if (!parts.length) return null;
      var p = R.pick(parts), pool = VO.rootKeys().map(function (k) { return VO.ROOT(k).means; });
      var wrong = pickDistinct(R, pool, 3, [p.means]).filter(function (x) { return x.split(/,\s*/).every(function (y) { return p.means.toLowerCase().indexOf(y.toLowerCase()) < 0; }); });
      if (wrong.length < 3) return null;
      var A = withAnswer(R, p.means, wrong.slice(0, 3));
      return { q: 'In <b>' + VO.esc(e.word) + '</b>, the part <b>' + VO.esc(p.part) + '</b> means:', a: mc(A.choices, A.v), steps: ['<b>' + VO.esc(p.part) + '</b> means ' + q1(VO.esc(p.means), '.'), e.roots.map(function (r) { return VO.esc(r.part) + ' (' + VO.esc(r.means) + ')'; }).join(' + ') + ' → ' + meaningStep(e)], hint: 'Think of other words that share this part.' };
    }
  };
  // one problem of a given kind about one word (the quiz page uses this): kind is a key of GEN.makers; pool: the word's topic
  GEN.makers = Object.keys(MAKERS);
  GEN.make = function (kind, e, pool, R) { var f = MAKERS[kind]; if (!f || !e) return null; var p = f(e, pool && pool.length ? pool : VO.entries(e.topic), R); if (p) p.steps = p.steps.filter(Boolean); return p; };
  GEN.item = function (it, R, ctx) {
    var e = it.word ? VO.entry(it.word) : null, steps = (it.steps || []).slice();
    if (it.why) steps.unshift(it.why);
    if (e && !it.steps) steps.push(meaningStep(e));
    var p = { q: it.q, steps: steps.length ? steps : ['See the lesson for this word.'], hint: it.hint || '' };
    if (it.tf != null) p.a = { t: 'tf', v: !!it.tf };
    else if (it.text) p.a = { t: 'text', v: [].concat(it.text) };
    else { var right = it.choices[it.a || 0], A = withAnswer(R, right, it.choices.filter(function (c, i) { return i !== (it.a || 0); })); p.a = mc(A.choices, A.v); }
    return p;
  };
  GEN.topic = function (id, R, ctx) {
    var key = String(id).replace(/^adv\./, ''), E = VO.entries(key);
    if (!E.length) throw new Error('no word entries for ' + id);
    var lv = (ctx && ctx.level) || 2, T0 = VO.topic(key), items = (T0 && T0.items) || (VO._items && VO._items[key]) || [];
    var mine = items.filter(function (it) { return !it.lv || it.lv.indexOf(lv) >= 0; });
    if (mine.length && R.chance(lv === 3 ? 0.3 : 0.2)) return GEN.item(R.pick(mine), R, ctx);
    var kinds = GEN.kinds[lv] || GEN.kinds[2];
    for (var t = 0; t < 12; t++) {
      var e = R.pick(E), k = R.pick(kinds), p = MAKERS[k](e, E, R);
      if (p) { p.steps = p.steps.filter(Boolean); if (!p.hint) delete p.hint; return p; }
    }
    return MAKERS.meaning(R.pick(E), E, R);
  };
  VO.setItems = function (byTopic) { VO._items = VO._items || {}; Object.keys(byTopic || {}).forEach(function (k) { VO._items[k] = byTopic[k]; }); };
  // the roots course: problems about prefixes, roots and suffixes (keys: VO.ROOT keys taught by the topic)
  GEN.root = function (keys, R, ctx) {
    keys = [].concat(keys); var lv = (ctx && ctx.level) || 2, k = R.pick(keys), R0 = VO.ROOT(k);
    if (!R0) throw new Error('unknown root ' + k);
    var allMeans = VO.rootKeys().filter(function (x) { return keys.indexOf(x) < 0; }).map(function (x) { return VO.ROOT(x).means; });
    var words = R0.words.length ? R0.words : R0.ex, kind = R.pick(lv === 1 ? ['means', 'means', 'which'] : lv === 2 ? ['means', 'which', 'gloss', 'part'] : ['which', 'gloss', 'part', 'gloss']);
    var formShown = R0.form.split(/,\s*/)[0];
    if (kind === 'which' || kind === 'gloss' || kind === 'part') { if (!words.length) kind = 'means'; }
    if (kind === 'gloss' && !words.some(function (x) { return VO.find(x); })) kind = 'which'; // only example words, none on the list
    if (kind === 'means') {
      var wrong = pickDistinct(R, allMeans, 3, [R0.means]); var A = withAnswer(R, R0.means, wrong);
      return { q: 'The ' + R0.kind + ' <b>' + VO.esc(R0.form) + '</b> means:', a: mc(A.choices, A.v), steps: ['<b>' + VO.esc(R0.form) + '</b> (' + VO.esc(R0.lang) + ') means ' + q1(VO.esc(R0.means), '.'), 'You can hear it in ' + VO.esc(words.concat(R0.ex).slice(0, 3).join(', ')) + '.'], hint: 'Think of a word you know that has this part: ' + VO.esc(words.concat(R0.ex)[0] || '') + '.' };
    }
    if (kind === 'which') {
      var w = R.pick(words), noPool = VO.list().filter(function (r) { return keys.every(function (kk) { return r.r.indexOf(kk) < 0; }) && r.w.indexOf(' ') < 0; }).map(function (r) { return r.w; });
      var A2 = withAnswer(R, w, pickDistinct(R, noPool, 3, [w]));
      return { q: 'Which word contains a part that means ' + q1(VO.esc(R0.means)) + '?', a: mc(A2.choices, A2.v), steps: ['<b>' + VO.hiRoot(w, k) + '</b> contains <b>' + VO.esc(formShown) + '</b>, ' + q1(VO.esc(R0.means), '.'), VO.find(w) ? '<b>' + VO.esc(w) + '</b> means ' + q1(VO.esc(VO.find(w).g), '.') : ''].filter(Boolean), hint: 'Look for ' + VO.esc(R0.form) + ' inside the word.' };
    }
    if (kind === 'gloss') {
      var w2 = R.pick(words.filter(function (x) { return VO.find(x); }).concat([])) || words[0], row = VO.find(w2);
      if (!row) return GEN.root(keys, R, { level: 1 });
      var others = VO.list().filter(function (r) { return r.w !== w2 && r.pos === row.pos; }).map(function (r) { return r.g; });
      var A3 = withAnswer(R, row.g, pickDistinct(R, others, 3, [row.g]));
      return { q: 'Use the ' + R0.kind + ' <b>' + VO.esc(formShown) + '</b> (' + VO.esc(R0.means) + ') to choose the best meaning of <b>' + VO.esc(w2) + '</b>.', a: mc(A3.choices, A3.v), steps: ['<b>' + VO.hiRoot(w2, k) + '</b> has <b>' + VO.esc(formShown) + '</b>, ' + q1(VO.esc(R0.means), '.'), '<b>' + VO.esc(w2) + '</b> means ' + q1(VO.esc(row.g), '.')], hint: 'Which meaning has the idea of ' + q1(VO.esc(R0.means)) + ' in it?' };
    }
    var w3 = R.pick(words), forms = VO.rootKeys().filter(function (x) { return x !== k && VO.ROOT(x).kind === R0.kind; }).map(function (x) { return VO.ROOT(x).form.split(/,\s*/)[0]; });
    var A4 = withAnswer(R, formShown, pickDistinct(R, forms, 3, [formShown]).filter(function (f) { return w3.toLowerCase().indexOf(f.replace(/-/g, '').toLowerCase()) < 0; }).slice(0, 3));
    if (A4.choices.length < 4) return GEN.root(keys, R, { level: 1 });
    return { q: 'Which part of <b>' + VO.esc(w3) + '</b> means ' + q1(VO.esc(R0.means)) + '?', a: mc(A4.choices, A4.v), steps: ['<b>' + VO.hiRoot(w3, k) + '</b>: <b>' + VO.esc(formShown) + '</b> means ' + q1(VO.esc(R0.means), '.')], hint: R0.kind === 'prefix' ? 'A prefix comes at the start of the word.' : R0.kind === 'suffix' ? 'A suffix comes at the end of the word.' : 'The root is the core of the word.' };
  };
  /* ---------------- the visuals (need math/viz/core.js and a document) ---------------- */
  function registerVisuals() {
    if (!ML.viz || !D || VO._registered) return; VO._registered = true;
    var V = ML.viz;
    function frame(el, o, name, label) {
      el.classList.add('vo-v', 'vo-v-' + name);
      var al = el.getAttribute('aria-label'); if ((!al || al === 'vo-' + name || al === name) && label) el.setAttribute('aria-label', o.label || label);
      if (o.task) el.insertAdjacentHTML('beforeend', '<p class="vo-task">' + o.task + '</p>');
    }
    function speakable(root) {
      root.addEventListener('click', function (ev) {
        var b = ev.target.closest && ev.target.closest('.vo-speak'); if (!b) return;
        try { W.speechSynthesis.cancel(); var u = new W.SpeechSynthesisUtterance(b.getAttribute('data-say')); u.rate = 0.85; u.lang = 'en-US'; W.speechSynthesis.speak(u); } catch (e) { }
      });
    }
    // vo-scene: a mnemonic picture. opts: { scene: { bg, cast, animals, props, fx, labels, alt }, caption, quiet, word (in quiet mode its forms show as ?) }
    V.register('vo-scene', function (el, o) {
      var spec = o.scene || o, cap = o.caption || o.cap || (spec.cap && !o.quiet ? spec.cap : '');
      frame(el, o, 'scene', spec.alt || 'A picture');
      function draw(oo) { el.querySelectorAll('.vo-fig').forEach(function (n) { n.remove(); }); el.insertAdjacentHTML('beforeend', '<figure class="vo-fig">' + sceneSVG(oo.scene || oo, { quiet: !!oo.quiet, word: oo.word, entry: oo.entry }) + (cap ? '<figcaption class="ml-cap">' + cap + '</figcaption>' : '') + '</figure>'); }
      draw(o);
      return { update: function (n) { o = Object.assign({}, o, n); draw(o); } };
    });
    // vo-word: the word card. opts: { entry } or { word } (an entry loaded on the page), mode, quiet, speak
    V.register('vo-word', function (el, o) {
      var e = o.entry || VO.entry(o.word);
      frame(el, o, 'word', e ? (o.quiet ? 'A word card' : 'Word card: ' + e.word) : 'A word card');
      if (!e) { el.insertAdjacentHTML('beforeend', '<p class="vo-miss">This word card is being written.</p>'); return {}; }
      el.insertAdjacentHTML('beforeend', cardHTML(e, { mode: o.mode || 'card', quiet: !!(o.quiet || o.readout === false), speak: o.speak !== false && !!W.speechSynthesis }));
      speakable(el);
      return {};
    });
    // vo-roots: a root tree. opts: { root: 'bene' } or { roots: ['bene', 'mal'] } or { custom: { form, means, kind, lang, words: [{ w, g }] } }, max, quiet
    V.register('vo-roots', function (el, o) {
      var keys = o.custom ? [o.custom] : [].concat(o.roots || o.root || []);
      frame(el, o, 'roots', 'Root tree' + (o.quiet ? '' : ': ' + keys.map(function (k) { var R0 = typeof k === 'object' ? k : VO.ROOT(k); return R0 ? R0.form + ' means ' + R0.means : k; }).join('; ')));
      el.insertAdjacentHTML('beforeend', '<div class="vo-trees">' + keys.map(function (k) { return VO.rootTreeHTML(k, { quiet: !!(o.quiet || o.readout === false), max: o.max, words: o.words }); }).join('') + '</div>');
      return {};
    });
    // vo-cloze: a sentence with a blank. opts: { s: 'Her {benevolent} smile …', choices: ['…'], mode: 'show' | 'pick', why, quiet }
    V.register('vo-cloze', function (el, o) {
      frame(el, o, 'cloze', 'A sentence with a blank');
      var quiet = !!(o.quiet || o.readout === false), mode = quiet ? 'quiet' : o.mode || (o.choices ? 'pick' : 'show'), ans = VO.form(o.s) || '';
      var box = D.createElement('div'); box.className = 'vo-clz'; el.appendChild(box);
      var p = D.createElement('p'); p.className = 'vo-cl'; p.innerHTML = mode === 'show' ? VO.mark(o.s) : VO.blank(o.s); box.appendChild(p);
      if (o.choices && o.choices.length) {
        var ul = D.createElement('div'); ul.className = 'vo-bank'; box.appendChild(ul);
        var out = D.createElement('p'); out.className = 'ml-readout vo-out'; out.setAttribute('aria-live', 'polite'); out.hidden = true;
        o.choices.forEach(function (c, i) {
          var b = D.createElement(mode === 'pick' ? 'button' : 'span'); b.className = 'vo-chip'; if (mode === 'pick') b.type = 'button';
          b.innerHTML = (mode === 'quiet' ? '<span class="vo-chl">' + String.fromCharCode(65 + i) + '</span> ' : '') + VO.esc(c); ul.appendChild(b);
          if (mode === 'pick') b.addEventListener('click', function () {
            var ok = c.toLowerCase() === ans.toLowerCase();
            [].forEach.call(ul.children, function (x) { x.classList.remove('ok', 'no'); x.setAttribute('aria-pressed', 'false'); });
            b.classList.add(ok ? 'ok' : 'no'); b.setAttribute('aria-pressed', 'true');
            p.innerHTML = ok ? VO.mark(o.s) : VO.esc(VO.plain(o.s.replace(/\{[^}]+\}/, '{' + c + '}'))).replace(VO.esc(c), '<b class="vo-hl vo-bad">' + VO.esc(c) + '</b>');
            out.hidden = false; out.innerHTML = ok ? '<span class="vo-okm">✓</span> Yes. ' + (o.why || '') : '<span class="vo-nom">✗</span> Not quite: read the sentence with that word in it. Try another.';
          });
        });
        box.appendChild(out);
      }
      return {};
    });
  }
  registerVisuals();
  if (D && !VO._registered) D.addEventListener('DOMContentLoaded', registerVisuals);
  /* ---------------- exports for pages, generators and tests ---------------- */
  VO.sceneSVG = sceneSVG;
  VO.personSVG = function (p) { return person(p || {}).svg; };
  VO.animalSVG = function (a) { return animal(a || {}).svg; };
  VO.propSVG = function (kind, o) { return propSvg(kind, 0, 0, 1, o || {}); };
  VO.backdropSVG = function (name, night) { return backdrop(name, night); };
  VO.fxSVG = function (kind, x, y, s) { return (FX[kind] || function () { return ''; })(x, y, s || 1, 1); };
  VO.NAMES = { backdrops: Object.keys(BACKDROPS), cast: Object.keys(CAST), poses: Object.keys(POSES), moods: Object.keys(MOODS), animals: Object.keys(ANIMALS),
    props: Object.keys(PROPS), fx: Object.keys(FX), wear: WEAR.slice(), hair: HAIRS.slice(), colors: Object.keys(COL), bubbles: BUBBLES.slice() };
  if (ML.vocabItems) VO.setItems(ML.vocabItems);
  VO.CAST = CAST;
  VO.PROP_H = {}; Object.keys(PROPS).forEach(function (k) { VO.PROP_H[k] = PROPS[k].h; });
  VO.SIZE = { w: SW, h: SH, ground: GY };
  // checks a scene spec against the kit's names; returns a list of problems (used by scripts/vocab/check-words.js)
  // do these words fit on this prop at a readable size (6 px or more, without squeezing)?
  VO.propTextFits = function (kind, s) { if (!PROPS[kind]) return true; T.worst = 0; propSvg(kind, 0, 0, 1, { text: s }); return T.worst <= 1.15; };
  // problems start with a description; ones starting with "note:" are advice (check-words prints them as warnings)
  VO.checkScene = function (sc) {
    var errs = [], N = VO.NAMES;
    function has(list, v, what) { if (v != null && list.indexOf(v) < 0) errs.push('unknown ' + what + ' "' + v + '"'); }
    if (!sc || typeof sc !== 'object') return ['no scene'];
    if (!sc.bg) errs.push('no backdrop (bg)'); else has(N.backdrops, sc.bg, 'backdrop');
    var KN = { bg: 1, night: 1, cast: 1, animals: 1, props: 1, fx: 1, labels: 1, alt: 1, cap: 1 };
    Object.keys(sc).forEach(function (k) { if (!KN[k]) errs.push('unknown scene field "' + k + '"'); });
    var refs = {}, B = ' say think shout whisper hideInQuiet ';
    var FIELDS = { cast: ' who name x y s row pose mood face flip look wear holds hand hsize htext hcolor seat color age robe cape hat tie sash jacket scarf apron vest pack front' + B,
      animal: ' kind x y s flip mood pose color row front' + B, prop: ' kind x y s flip rot color text front back row open full steam water fruit soup heart ',
      fx: ' kind on at x y s dir text dx dy ', label: ' text x y on at color size arrow hide ' };
    function fields(o, what, where) { Object.keys(o || {}).forEach(function (k) { if (FIELDS[what].indexOf(' ' + k + ' ') < 0) errs.push(where + ': unknown field "' + k + '"'); }); }
    function num(o, k, lo, hi, where) { if (o[k] != null && (typeof o[k] !== 'number' || o[k] < lo || o[k] > hi)) errs.push(where + ': ' + k + ' should be a number from ' + lo + ' to ' + hi); }
    (sc.cast || []).forEach(function (c, i) { fields(c, 'cast', 'cast ' + i); num(c, 'x', -10, 110, 'cast ' + i); num(c, 's', 0.2, 4, 'cast ' + i); });
    (sc.animals || []).forEach(function (a, i) { fields(a, 'animal', 'animal ' + i); num(a, 'x', -10, 110, 'animal ' + i); num(a, 's', 0.1, 6, 'animal ' + i); if (a.pose && ['jump', 'lie', 'sleep', 'fly', 'swim'].indexOf(a.pose) < 0) errs.push('animal ' + i + ': unknown pose "' + a.pose + '"'); });
    (sc.props || []).forEach(function (p, i) { fields(p, 'prop', 'prop ' + i); num(p, 'x', -10, 110, 'prop ' + i); num(p, 's', 0.1, 8, 'prop ' + i); });
    (sc.fx || []).forEach(function (f, i) { fields(f, 'fx', 'effect ' + i); });
    (sc.labels || []).forEach(function (L, i) { fields(L, 'label', 'label ' + i); });
    [].concat(sc.cast || [], sc.animals || []).forEach(function (c) { BUBBLES.forEach(function (k) { if (c[k] != null && (typeof c[k] !== 'string' || !c[k].trim())) errs.push('an empty ' + k + ' bubble'); if (typeof c[k] === 'string' && c[k].length > 60) errs.push('a ' + k + ' bubble over 60 letters: "' + c[k].slice(0, 30) + '…"'); }); });
    (sc.cast || []).forEach(function (c, i) { refs['c' + i] = 1; has(N.cast, c.who, 'cast member'); if (!c.who) errs.push('cast ' + i + ' has no "who"'); has(N.poses, c.pose, 'pose'); has(N.moods, c.mood, 'mood'); [].concat(c.wear || []).forEach(function (w) { has(N.wear, w, 'wear item'); }); has(N.props, c.holds, 'held prop'); if (c.seat && c.seat !== 'none') has(N.props, c.seat, 'seat'); });
    (sc.animals || []).forEach(function (a, i) { refs['a' + i] = 1; has(N.animals, a.kind, 'animal'); if (!a.kind) errs.push('animal ' + i + ' has no "kind"'); if (a.mood) has(N.moods, a.mood, 'mood'); });
    (sc.props || []).forEach(function (p, i) { refs['p' + i] = 1; has(N.props, p.kind, 'prop'); if (!p.kind) errs.push('prop ' + i + ' has no "kind"'); });
    (sc.fx || []).forEach(function (f) { has(N.fx, f.kind, 'effect'); if (f.on && !refs[f.on]) errs.push('effect on "' + f.on + '", which is not in the scene'); });
    (sc.labels || []).forEach(function (L) { if (!L.text) errs.push('a label has no text'); if (L.on && !refs[L.on]) errs.push('label on "' + L.on + '", which is not in the scene'); });
    (sc.props || []).forEach(function (p) { if (p.text && PROPS[p.kind] && !VO.propTextFits(p.kind, p.text)) errs.push('note: "' + p.text + '" is too long for a ' + p.kind + ' and gets squeezed; use fewer letters, or a sign, banner or label'); });
    (sc.cast || []).forEach(function (c) { if (c.htext && PROPS[c.holds] && !VO.propTextFits(c.holds, c.htext)) errs.push('note: "' + c.htext + '" is too long for a ' + c.holds + ' and gets squeezed; use fewer letters, or a sign, banner or label'); });
    if (!sc.alt) errs.push('no alt text (a one-sentence description of the picture)');
    return errs;
  };
})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);
