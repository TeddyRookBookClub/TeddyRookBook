/* Shakespeare visuals shared by the gbren Shakespeare rungs (gbw1, our own designs and summaries).
   gb-acts: a play's five acts on a rising-and-falling curve; opts.play = romeo | caesar | hamlet | othello | lear | macbeth | tempest | dream.
   gb-cast: who is who in a play, as a web; opts.play = romeo | caesar | hamlet | othello | lear | macbeth | tempest.
   gb-meter: tap out the beat of famous lines; opts.lines = [indexes] (default all). */
/* gbw1 SVG helpers (each viz.js carries its own copy, since each is wrapped on its own). Styles: .gbr-* in this course's viz.css. */
var NS = 'http://www.w3.org/2000/svg';
function S(tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; }
function Tx(par, x, y, s, cls, anc) { var t = S('text', { x: x, y: y, 'class': cls || 'gbr-t', 'text-anchor': anc || 'middle' }, par); t.textContent = s; return t; }
function frame(el, w, h, label) {
  var st = document.createElement('div'); st.className = 'gbr'; el.appendChild(st);
  var sv = S('svg', { viewBox: '0 0 ' + w + ' ' + h, 'class': 'gbr-svg', role: 'img', 'aria-label': label }, st);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { svg: sv, ctl: ctl, stage: st };
}
function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
/* a clickable group: Enter/Space activate it too */
function hit(g, label, fn) {
  g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', label); g.setAttribute('class', (g.getAttribute('class') || '') + ' gbr-hit');
  g.addEventListener('click', fn);
  g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
/* a generic cartoon person, in the site's skin color */
function person(g, x, y, s, cloth) {
  S('rect', { x: x - 7 * s, y: y - 2 * s, width: 14 * s, height: 18 * s, rx: 6 * s, 'class': cloth || 'gbr-cloth' }, g);
  S('circle', { cx: x, cy: y - 9 * s, r: 7 * s, 'class': 'gbr-skin' }, g);
}
/* wrap text into lines of at most n characters */
function wrap(s, n) { var w = s.split(' '), out = [], cur = ''; w.forEach(function (x) { if ((cur + ' ' + x).trim().length > n) { if (cur) out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); }); if (cur) out.push(cur); return out; }
var ACTS = {
  romeo: { t: 'Romeo and Juliet', h: [0.35, 0.55, 0.95, 0.7, 0.3], a: [
    ['A feud and a feast', 'Servants of the Montagues and Capulets brawl in the street, and the Prince warns that the next fight will be punished by death. That night Romeo slips into the Capulets\' feast and meets Juliet. Only afterward do they learn each other\'s family.'],
    ['The balcony and the wedding', 'Under Juliet\'s window the two promise to marry. Friar Laurence agrees, hoping the match will end the feud, and marries them in secret.'],
    ['The turning point', 'Juliet\'s cousin Tybalt kills Romeo\'s friend Mercutio, and Romeo, in anger, kills Tybalt. The Prince banishes Romeo. Juliet\'s father, knowing nothing of the marriage, arranges for her to marry Count Paris.'],
    ['The friar\'s plan', 'Friar Laurence gives Juliet a potion that will make her seem dead for a time, and sends a letter to tell Romeo. On the wedding morning the family finds her, as they think, dead.'],
    ['The tomb', 'The friar\'s letter never reaches Romeo. Believing Juliet dead, he comes to her tomb, and both young people die there. The grieving families at last make peace.']] },
  caesar: { t: 'Julius Caesar', h: [0.35, 0.6, 0.95, 0.65, 0.35], a: [
    ['Caesar\'s triumph', 'Rome celebrates Caesar\'s victories. A soothsayer warns him to beware the Ides of March (the 15th). Cassius begins to persuade Brutus that Caesar\'s power is a danger to Rome.'],
    ['The plot', 'After a sleepless night Brutus joins the conspirators. Caesar\'s wife, Calpurnia, dreams of disaster and begs him to stay home, but he is talked into going to the Senate.'],
    ['The Ides of March', 'The conspirators kill Caesar. Brutus explains to the crowd that he acted for Rome\'s freedom. Then Mark Antony speaks, and turns the crowd against the conspirators.'],
    ['The quarrel', 'Brutus and Cassius, now leading an army, quarrel and make up. That night Caesar\'s ghost appears to Brutus and says they will meet again at Philippi.'],
    ['Philippi', 'The armies meet. Cassius and then Brutus take their own lives rather than be captured. Antony calls Brutus "the noblest Roman of them all."']] },
  hamlet: { t: 'Hamlet', h: [0.3, 0.5, 0.95, 0.65, 0.45], a: [
    ['The ghost', 'In Denmark, guards see the ghost of the dead King. His brother Claudius is now king and has married the widow, Queen Gertrude. The ghost tells Prince Hamlet he was murdered by Claudius and asks for revenge. Hamlet decides to act as if he were mad.'],
    ['Watching and waiting', 'The old counselor Polonius thinks Hamlet is mad with love for his daughter, Ophelia. Two school friends are sent to spy on Hamlet. A company of actors arrives, and Hamlet plans a test.'],
    ['The play and the mistake', 'Hamlet wonders aloud whether it is better "to be, or not to be." The actors stage a murder like his father\'s, and Claudius rushes out, guilty. Hamlet finds Claudius praying and holds back. Then, thinking Claudius is hiding behind a curtain, he strikes and kills Polonius instead.'],
    ['Exile and grief', 'Claudius sends Hamlet to England with orders for his death, but Hamlet escapes. Ophelia, overwhelmed with grief, drowns. Her brother Laertes returns wanting revenge, and Claudius plots with him.'],
    ['The duel', 'Hamlet holds the skull of Yorick, a jester he loved as a child. In a fencing match the plot of the poisoned sword and the poisoned cup goes wrong: the Queen, Laertes, Claudius and Hamlet all die. Hamlet asks his friend Horatio to tell his story.']] },
  othello: { t: 'Othello', h: [0.3, 0.5, 0.95, 0.75, 0.4], a: [
    ['Venice', 'Iago, an officer, hates his general, Othello, who has promoted Cassio over him. Othello has secretly married Desdemona, a senator\'s daughter. Her father objects, but the Senate sends Othello to defend Cyprus, and Desdemona goes with him.'],
    ['Cyprus', 'A storm destroys the enemy fleet. Iago gets Cassio drunk and into a fight, and Othello takes away Cassio\'s rank.'],
    ['The seed of doubt', 'Iago hints that Desdemona loves Cassio. He gets hold of a handkerchief Othello gave her and plants it where Cassio will find it. Othello, half-convinced, demands proof.'],
    ['Jealousy grows', 'Iago feeds Othello false "proof," and Othello treats Desdemona cruelly in front of others. She cannot understand what she has done.'],
    ['The truth too late', 'Othello kills Desdemona. Iago\'s wife, Emilia, reveals the truth about the handkerchief. Othello, seeing what he has done, takes his own life. Iago is arrested.']] },
  lear: { t: 'King Lear', h: [0.35, 0.6, 0.9, 0.7, 0.35], a: [
    ['The love test', 'Old King Lear will divide Britain among his three daughters by how much each says she loves him. Goneril and Regan flatter him. Cordelia, the youngest, will not, and he disowns her. In a second family, the Earl of Gloucester is tricked by his son Edmund into turning against his loyal son Edgar.'],
    ['Turned out', 'Goneril and Regan cut down Lear\'s followers and shut him out. Edgar hides as a poor madman, "Tom." Lear goes out into a terrible storm.'],
    ['The storm', 'On the open heath, with his Fool and "Poor Tom," Lear rages and begins to see the suffering of the poor. Gloucester is cruelly punished for helping the King and loses his sight.'],
    ['Reunion', 'Edgar, still in disguise, guides his blind father. Cordelia returns with an army from France and cares for Lear, who wakes and knows her.'],
    ['The end', 'Cordelia\'s army loses. Edgar defeats Edmund. Goneril and Regan destroy each other. Cordelia is killed, and Lear dies grieving over her.']] },
  macbeth: { t: 'Macbeth', h: [0.35, 0.8, 0.9, 0.65, 0.4], a: [
    ['The prophecy', 'After a battle, three witches tell the Scottish general Macbeth that he will be king. Part of the prophecy comes true at once. Lady Macbeth urges him on when King Duncan comes to stay.'],
    ['The murder', 'Macbeth kills Duncan in his sleep. Duncan\'s sons flee, and Macbeth is crowned.'],
    ['Banquo', 'Fearing the witches\' promise that his friend Banquo\'s children will be kings, Macbeth has Banquo killed, but Banquo\'s son escapes. At a feast, only Macbeth sees Banquo\'s ghost.'],
    ['New prophecies', 'The witches tell Macbeth no man born of woman can harm him, and he will not fall until Birnam Wood comes to Dunsinane. He has Macduff\'s family killed. Malcolm and Macduff gather an army in England.'],
    ['Birnam Wood', 'Lady Macbeth walks in her sleep, trying to wash away a spot of blood that is not there, and dies. Soldiers carry branches from Birnam Wood. Macduff, who was born in an unusual way, defeats Macbeth, and Malcolm becomes king.']] },
  tempest: { t: 'The Tempest', h: [0.35, 0.55, 0.7, 0.8, 0.45], a: [
    ['The storm', 'On an island, the magician Prospero raises a storm that wrecks a ship carrying the King of Naples and Prospero\'s brother, Antonio, who stole his dukedom of Milan twelve years before. Prospero tells his daughter Miranda their story. His spirit-servant Ariel has kept everyone on board safe. The King\'s son, Ferdinand, meets Miranda.'],
    ['Plots', 'Antonio tempts the King\'s brother, Sebastian, to kill the King. Caliban, the island\'s other inhabitant, joins two drunken sailors in a plot against Prospero.'],
    ['Tests', 'Ferdinand carries logs for Prospero to prove himself, and he and Miranda promise to marry. Ariel, as a fierce harpy, confronts the King, Antonio and Sebastian with their wrongs.'],
    ['The masque', 'Prospero blesses the engagement with a show of spirits, then breaks it off: "Our revels now are ended." Caliban\'s plot comes to nothing.'],
    ['Forgiveness', 'Prospero decides that "the rarer action is / In virtue than in vengeance." He forgives his enemies, gets back his dukedom, frees Ariel and gives up his magic. In the epilogue he asks the audience to set him free with their applause.']] },
  dream: { t: 'A Midsummer Night\'s Dream', h: [0.3, 0.6, 0.95, 0.55, 0.25], a: [
    ['Athens', 'Duke Theseus is about to marry. Hermia loves Lysander, but her father orders her to marry Demetrius, so she and Lysander plan to run away through the woods. Helena, who loves Demetrius, follows. A group of workmen plan a play for the wedding.'],
    ['The wood', 'The fairy king and queen, Oberon and Titania, are quarreling. Oberon sends the mischievous Puck for a flower whose juice makes a sleeper fall in love with the first creature seen. Puck puts it on the wrong young man.'],
    ['Mix-ups', 'Puck gives the weaver Bottom a donkey\'s head, and the enchanted Titania falls in love with him. Now both young men chase Helena, and the four friends quarrel. "Lord, what fools these mortals be!"'],
    ['Waking', 'Oberon sets things right. The lovers wake in pairs, Theseus lets them marry, and Bottom wakes from what he calls a most rare dream.'],
    ['The wedding play', 'Three couples marry. The workmen act their tragedy of Pyramus and Thisbe so badly that it becomes a comedy. The fairies bless the house, and Puck asks the audience to think it was all a dream.']] }
};
var STAGES = ['Setting out', 'Rising action', 'Turning point', 'Falling action', 'Ending'];
ML.viz.register('gb-acts', function (el, opts, V) {
  var D = ACTS[opts.play] || ACTS.hamlet, F = frame(el, 400, 210, D.t + ': the five acts'), sv = F.svg, ro = V.readout(el), cur = opts.act || 0, sg;
  var X = function (i) { return 48 + i * 76; }, Y = function (h) { return 170 - h * 130; };
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 210, 'class': 'gbr-bg' }, sv);
    S('line', { x1: 20, y1: 172, x2: 380, y2: 172, 'class': 'gbr-ln' }, sv);
    var d = 'M20,172 ' + D.h.map(function (h, i) { return 'L' + X(i) + ',' + Y(h); }).join(' ') + ' L380,172';
    S('path', { d: d, 'class': 'gbr-ln-acc' }, sv);
    D.h.forEach(function (h, i) {
      var g = S('g', { 'class': i === cur ? 'gbr-on' : '' }, sv);
      S('circle', { cx: X(i), cy: Y(h), r: 15, 'class': 'gbr-node' }, g);
      Tx(g, X(i), Y(h) + 4.5, ['I', 'II', 'III', 'IV', 'V'][i], 'gbr-b');
      Tx(g, X(i), 190, STAGES[i], 'gbr-m');
      hit(g, 'Act ' + (i + 1) + ': ' + D.a[i][0], function () { cur = i; sg.set(i); draw(); });
    });
    Tx(sv, 200, 22, D.t, 'gbr-h');
    ro.set('<b>Act ' + ['I', 'II', 'III', 'IV', 'V'][cur] + ': ' + D.a[cur][0] + '.</b> ' + D.a[cur][1]);
  }
  sg = V.seg(F.ctl, { label: 'Act', items: [0, 1, 2, 3, 4].map(function (i) { return [i, 'Act ' + ['I', 'II', 'III', 'IV', 'V'][i]]; }), value: cur, change: function (v) { cur = +v; draw(); } });
  draw();
});

/* the cast: x, y on a 400 x 260 board; c = clothing class (one color per side or family) */
var CAST = {
  romeo: { t: 'Romeo and Juliet', n: [
    ['Romeo', 95, 95, 'gbr-cloth', 'A young Montague, quick to fall in love and quick to act.'], ['Juliet', 305, 95, 'gbr-cloth2', 'A Capulet, not yet fourteen; braver and clearer-headed than anyone around her.'],
    ['Mercutio', 50, 190, 'gbr-cloth4', 'Romeo\'s witty friend, a relative of the Prince, belonging to neither family.'], ['Benvolio', 140, 205, 'gbr-cloth', 'Romeo\'s cousin, a peacemaker.'],
    ['Tybalt', 300, 205, 'gbr-cloth2', 'Juliet\'s hot-tempered cousin.'], ['The Nurse', 370, 175, 'gbr-cloth2', 'Juliet\'s nurse and go-between, warm and talkative.'],
    ['Friar Laurence', 200, 160, 'gbr-cloth3', 'A kindly friar who marries the two in secret, hoping to end the feud.'], ['The Prince', 200, 50, 'gbr-cloth4', 'Escalus, ruler of Verona, who wants the fighting stopped.']],
    e: [['Romeo', 'Juliet', 'secretly married'], ['Romeo', 'Mercutio', 'friends'], ['Romeo', 'Benvolio', 'cousins'], ['Juliet', 'Tybalt', 'cousins'], ['Juliet', 'The Nurse', 'nurse'], ['Friar Laurence', 'Romeo', 'advises'], ['Friar Laurence', 'Juliet', 'advises'], ['Mercutio', 'Tybalt', 'fight'], ['The Prince', 'Mercutio', 'kinsman']],
    k: 'Blue: Montagues. Red: Capulets. Green: the Church. Gold: the Prince\'s family.' },
  caesar: { t: 'Julius Caesar', n: [
    ['Caesar', 200, 55, 'gbr-cloth4', 'The great general, now close to being king in all but name.'], ['Brutus', 95, 125, 'gbr-cloth2', 'Caesar\'s friend, who joins the plot because he fears for the Republic.'],
    ['Cassius', 70, 215, 'gbr-cloth2', 'The plot\'s organizer, sharp and resentful of Caesar.'], ['Casca', 180, 215, 'gbr-cloth2', 'A blunt conspirator.'],
    ['Mark Antony', 305, 125, 'gbr-cloth', 'Caesar\'s loyal friend, whose funeral speech turns the crowd.'], ['Octavius', 345, 215, 'gbr-cloth', 'Caesar\'s young heir, who joins Antony.'],
    ['Portia', 30, 60, 'gbr-cloth3', 'Brutus\'s wife, who asks to share his secret.'], ['Calpurnia', 360, 50, 'gbr-cloth3', 'Caesar\'s wife, who dreams of his death.']],
    e: [['Brutus', 'Caesar', 'friends'], ['Cassius', 'Brutus', 'persuades'], ['Casca', 'Cassius', 'conspirators'], ['Mark Antony', 'Caesar', 'loyal friend'], ['Octavius', 'Mark Antony', 'allies'], ['Portia', 'Brutus', 'married'], ['Calpurnia', 'Caesar', 'married']],
    k: 'Red: the conspirators. Blue: Caesar\'s side after his death. Green: the wives.' },
  hamlet: { t: 'Hamlet', n: [
    ['Hamlet', 200, 120, 'gbr-cloth', 'The Prince of Denmark, a student called home by his father\'s death.'], ['The Ghost', 200, 35, 'gbr-cloth4', 'The spirit of Hamlet\'s father, the old King.'],
    ['Claudius', 80, 70, 'gbr-cloth2', 'The old King\'s brother, now king and married to Gertrude.'], ['Gertrude', 320, 70, 'gbr-cloth4', 'The Queen, Hamlet\'s mother.'],
    ['Polonius', 70, 190, 'gbr-cloth3', 'The King\'s chief counselor, full of advice.'], ['Ophelia', 165, 225, 'gbr-cloth3', 'Polonius\'s daughter, whom Hamlet once courted.'],
    ['Laertes', 260, 225, 'gbr-cloth3', 'Ophelia\'s brother, who wants revenge for his father.'], ['Horatio', 340, 175, 'gbr-cloth', 'Hamlet\'s true friend, who lives to tell the story.']],
    e: [['The Ghost', 'Hamlet', 'father'], ['Claudius', 'Gertrude', 'married'], ['Gertrude', 'Hamlet', 'mother'], ['Claudius', 'The Ghost', 'brothers'], ['Polonius', 'Ophelia', 'father'], ['Ophelia', 'Laertes', 'siblings'], ['Hamlet', 'Ophelia', 'once courted'], ['Horatio', 'Hamlet', 'friends'], ['Polonius', 'Claudius', 'serves']],
    k: 'Blue: Hamlet and his friend. Gold: the old King and Queen. Red: the new King. Green: Polonius\'s family.' },
  othello: { t: 'Othello', n: [
    ['Othello', 120, 70, 'gbr-cloth', 'A great general serving Venice, honest and trusting.'], ['Desdemona', 300, 70, 'gbr-cloth3', 'Othello\'s loyal wife.'],
    ['Iago', 200, 165, 'gbr-cloth2', 'Othello\'s officer, who smiles and lies.'], ['Cassio', 330, 180, 'gbr-cloth', 'Othello\'s lieutenant, a good man Iago uses.'],
    ['Emilia', 260, 235, 'gbr-cloth3', 'Iago\'s wife and Desdemona\'s companion, who finally tells the truth.'], ['Roderigo', 70, 200, 'gbr-cloth4', 'A foolish Venetian who pays Iago to help him win Desdemona.'],
    ['Brabantio', 370, 25, 'gbr-cloth4', 'Desdemona\'s father, a senator.']],
    e: [['Othello', 'Desdemona', 'married'], ['Iago', 'Othello', 'lies to'], ['Iago', 'Cassio', 'uses'], ['Iago', 'Emilia', 'married'], ['Emilia', 'Desdemona', 'serves'], ['Iago', 'Roderigo', 'cheats'], ['Brabantio', 'Desdemona', 'father'], ['Cassio', 'Othello', 'lieutenant']],
    k: 'Red: the liar. Follow the lines from Iago: he works on almost everyone.' },
  lear: { t: 'King Lear', n: [
    ['Lear', 200, 40, 'gbr-cloth4', 'The old King of Britain, proud and quick to anger.'], ['Goneril', 75, 115, 'gbr-cloth2', 'His eldest daughter, who flatters and then turns on him.'],
    ['Regan', 165, 125, 'gbr-cloth2', 'His second daughter, as cruel as her sister.'], ['Cordelia', 300, 115, 'gbr-cloth', 'His youngest, who loves him and will not flatter.'],
    ['The Fool', 360, 45, 'gbr-cloth3', 'Lear\'s jester, who tells him the truth in jokes and songs.'], ['Gloucester', 110, 210, 'gbr-cloth4', 'An earl, who also misjudges his children.'],
    ['Edgar', 50, 245, 'gbr-cloth', 'Gloucester\'s loyal son, who hides as "Poor Tom."'], ['Edmund', 205, 240, 'gbr-cloth2', 'Gloucester\'s younger son, who schemes to take everything.'], ['Kent', 325, 210, 'gbr-cloth', 'A loyal lord who, banished, serves Lear in disguise.']],
    e: [['Lear', 'Goneril', 'daughter'], ['Lear', 'Regan', 'daughter'], ['Lear', 'Cordelia', 'daughter'], ['The Fool', 'Lear', 'jester'], ['Kent', 'Lear', 'loyal'], ['Gloucester', 'Edgar', 'son'], ['Gloucester', 'Edmund', 'son'], ['Edmund', 'Goneril', 'schemes with']],
    k: 'Two families, the same mistake: each father trusts the child who flatters and rejects the one who loves him. Blue: the loyal.' },
  macbeth: { t: 'Macbeth', n: [
    ['Macbeth', 200, 110, 'gbr-cloth2', 'A brave Scottish general who wants to be king.'], ['Lady Macbeth', 320, 95, 'gbr-cloth2', 'His wife, who pushes him on and is later haunted by guilt.'],
    ['The witches', 200, 30, 'gbr-cloth3', 'Three strange sisters who speak in riddles about the future.'], ['Duncan', 70, 70, 'gbr-cloth4', 'The good old King of Scotland.'],
    ['Malcolm', 60, 175, 'gbr-cloth4', 'Duncan\'s son, the rightful heir.'], ['Banquo', 330, 190, 'gbr-cloth', 'Macbeth\'s friend; the witches say his children will be kings.'],
    ['Macduff', 160, 230, 'gbr-cloth', 'A lord who suspects Macbeth and finally faces him.'], ['Fleance', 380, 245, 'gbr-cloth', 'Banquo\'s son, who escapes.']],
    e: [['Macbeth', 'Lady Macbeth', 'married'], ['The witches', 'Macbeth', 'prophesy to'], ['Macbeth', 'Duncan', 'serves, then kills'], ['Duncan', 'Malcolm', 'father'], ['Banquo', 'Macbeth', 'friends'], ['Banquo', 'Fleance', 'father'], ['Macduff', 'Malcolm', 'supports'], ['Macduff', 'Macbeth', 'faces']],
    k: 'Red: the Macbeths. Gold: the royal line. Blue: those Macbeth fears.' },
  tempest: { t: 'The Tempest', n: [
    ['Prospero', 200, 95, 'gbr-cloth4', 'The rightful Duke of Milan, now a magician on an island.'], ['Miranda', 320, 120, 'gbr-cloth3', 'His daughter, who has grown up on the island.'],
    ['Ariel', 330, 35, 'gbr-cloth', 'A spirit who serves Prospero and longs to be free.'], ['Caliban', 80, 35, 'gbr-cloth3', 'The island\'s earlier inhabitant, who resents Prospero.'],
    ['Antonio', 65, 160, 'gbr-cloth2', 'Prospero\'s brother, who took his dukedom.'], ['Alonso', 160, 215, 'gbr-cloth2', 'The King of Naples, who helped Antonio.'],
    ['Ferdinand', 300, 225, 'gbr-cloth', 'Alonso\'s son, who falls in love with Miranda.'], ['Gonzalo', 45, 245, 'gbr-cloth', 'An honest old counselor who helped Prospero long ago.']],
    e: [['Prospero', 'Miranda', 'father'], ['Ariel', 'Prospero', 'serves'], ['Caliban', 'Prospero', 'serves, resents'], ['Antonio', 'Prospero', 'brother, betrayed'], ['Alonso', 'Antonio', 'helped'], ['Alonso', 'Ferdinand', 'father'], ['Ferdinand', 'Miranda', 'in love'], ['Gonzalo', 'Prospero', 'helped']],
    k: 'Red: the men who wronged Prospero. Follow the lines to see who must forgive whom.' }
};
ML.viz.register('gb-cast', function (el, opts, V) {
  var D = CAST[opts.play] || CAST.hamlet, F = frame(el, 400, 270, D.t + ': who is who'), sv = F.svg, ro = V.readout(el), cur = -1;
  var idx = {}; D.n.forEach(function (n, i) { idx[n[0]] = i; });
  function draw() {
    clear(sv);
    S('rect', { x: 0, y: 0, width: 400, height: 270, 'class': 'gbr-bg' }, sv);
    D.e.forEach(function (e) {
      var a = D.n[idx[e[0]]], b = D.n[idx[e[1]]], on = cur >= 0 && (idx[e[0]] === cur || idx[e[1]] === cur);
      S('line', { x1: a[1], y1: a[2], x2: b[1], y2: b[2], 'class': on ? 'gbr-ln-acc' : 'gbr-ln-dash' }, sv);
      if (on) { var t = Tx(sv, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2 - 3, e[2], 'gbr-i'); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', 'var(--gbr-bg)'); t.setAttribute('stroke-width', '4'); }
    });
    D.n.forEach(function (n, i) {
      var g = S('g', { 'class': i === cur ? 'gbr-on' : '' }, sv);
      S('rect', { x: n[1] - 38, y: n[2] - 22, width: 76, height: 40, rx: 10, 'class': 'gbr-node' }, g);
      person(g, n[1], n[2] - 6, 0.55, n[3]);
      Tx(g, n[1], n[2] + 14, n[0], 'gbr-b');
      hit(g, n[0] + ': ' + n[4], function () { cur = i; draw(); });
    });
    ro.set(cur < 0 ? 'Tap a name to see who it is and how they are connected. ' + D.k : '<b>' + D.n[cur][0] + ':</b> ' + D.n[cur][4] + ' <span class="gbr-mut">' + D.k + '</span>');
  }
  draw();
});

/* meter: syllables with 1 = stressed; f = 'i' (iambic, da-DUM) or 't' (trochaic, DUM-da) */
var LINES = [
  ['But soft! What light through yonder window breaks?', 'Romeo and Juliet, II.2', 'But|soft|What|light|through|yon|der|win|dow|breaks', '0101010101', 'i'],
  ['Shall I compare thee to a summer’s day?', 'Sonnet 18', 'Shall|I|com|pare|thee|to|a|sum|mer’s|day', '0101010101', 'i'],
  ['The course of true love never did run smooth.', 'A Midsummer Night’s Dream, I.1', 'The|course|of|true|love|nev|er|did|run|smooth', '0101010101', 'i'],
  ['Once more unto the breach, dear friends, once more,', 'Henry V, III.1', 'Once|more|un|to|the|breach|dear|friends|once|more', '0101010101', 'i'],
  ['To be, or not to be, that is the question:', 'Hamlet, III.1', 'To|be|or|not|to|be|that|is|the|ques|tion', '01010101010', 'i'],
  ['Is this a dagger which I see before me,', 'Macbeth, II.1', 'Is|this|a|dag|ger|which|I|see|be|fore|me', '01010101010', 'i'],
  ['Fair is foul, and foul is fair:', 'Macbeth, I.1 (the witches)', 'Fair|is|foul|and|foul|is|fair', '1010101', 't'],
  ['Lord, what fools these mortals be!', 'A Midsummer Night’s Dream, III.2 (Puck)', 'Lord|what|fools|these|mor|tals|be', '1010101', 't']
];
ML.viz.register('gb-meter', function (el, opts, V) {
  var use = (opts.lines || LINES.map(function (_, i) { return i; })).map(function (i) { return LINES[i]; }).filter(Boolean), cur = 0, show = false;
  var box = document.createElement('div'); box.className = 'gbr'; el.appendChild(box);
  var src = document.createElement('p'); src.className = 'gbr-lines'; box.appendChild(src);
  var row = document.createElement('div'); row.className = 'gbr-syl'; row.setAttribute('aria-live', 'polite'); box.appendChild(row);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var ro = V.readout(el);
  function draw() {
    var L = use[cur], sy = L[2].split('|'), st = L[3], n = sy.length, stresses = st.split('').filter(function (c) { return c === '1'; }).length;
    src.innerHTML = '<i>' + L[0] + '</i> <small class="gbr-mut">(' + L[1] + ')</small>';
    row.innerHTML = '';
    sy.forEach(function (s, i) {
      var sp = document.createElement('span'), on = show && st[i] === '1';
      if (on) sp.className = 'gbr-str';
      if (show && i % 2 === 1 && i < n - 1) sp.className += ' gbr-ft';
      sp.innerHTML = '<i>' + (show ? (st[i] === '1' ? 'DUM' : 'da') : '') + '</i>' + s;
      row.appendChild(sp);
    });
    var msg = '<b>' + n + ' syllables.</b> ';
    if (!show) msg += 'Say the line aloud and tap the table on each syllable. Which ones are louder? Then press <b>Show the beat</b>.';
    else if (L[4] === 't') msg += 'This line goes DUM-da, DUM-da (a <b>trochee</b> is DUM-da), ' + stresses + ' beats, with the last soft syllable left off. Shakespeare often gives fairies and witches this chanting beat, different from everyone else.';
    else if (n === 10) msg += 'Five da-DUMs: <b>iambic pentameter</b>, five iambs (an iamb is da-DUM), ' + stresses + ' stresses. It is the beat of most of Shakespeare\'s verse, close to the rhythm of English speech.';
    else msg += 'Iambic pentameter with one extra soft syllable at the end (' + n + ' syllables, ' + stresses + ' stresses). Actors call it a soft or "feminine" ending; it makes the line sound unfinished, like a mind still thinking.';
    ro.set(msg);
  }
  if (use.length > 1) V.seg(ctl, { label: 'Line', items: use.map(function (L, i) { return [i, L[0].split(' ').slice(0, 3).join(' ').replace(/[,:!?]$/, '') + '…']; }), value: 0, change: function (v) { cur = +v; draw(); } });
  var b = V.button(ctl, 'Show the beat', function () { show = !show; b.textContent = show ? 'Hide the beat' : 'Show the beat'; draw(); });
  draw();
});
