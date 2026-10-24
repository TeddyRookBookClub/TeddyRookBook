/* Etiquette Ladder: the shared visual kit (names prefixed et-) and a small model (MathLadder.etiquette), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ etiquette/viz/etiquette.css). Etiquette topic pages always load
   this file, and practice pages load it with the course (MathLadder.loadCourse), so generators may call MathLadder.etiquette.
   The model also runs in node: global.window = global; require('…/etiquette.js').
   Vanilla JS, no libraries, no network; every drawing is original SVG made here. Source parts: /tmp/work_etiquette/src/*.js
   (build: /tmp/work_etiquette/build.sh). Conventions for course builders: /tmp/work_etiquette/overview.md.

   Embed:  <div class="ml-viz" data-viz="et-scene" data-opts='{"place":"table","people":[{"who":"mia"}],"say":[[0,"Please pass the peas."]]}'></div>

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that could give a problem's answer away: verdicts, outcomes, labels
                  that name the answer, highlights, Check buttons. What the problem asks about stays visible.
     interactive: false   a still picture.    task: a line above the visual.    caption: HTML under it.    label: aria-label.
     big: true    large, read-aloud text (Manners for Young Children).   readme: 'a note for the grown-up' (shown above, with
                  a "Read to me" tag).   speak: true adds a Read aloud button (the browser's own speech voice, when it has one).

   THE CAST (et-scene, et-intro, et-text names; the same people grow up across the three courses; see overview.md)
     Children: mia, leo, sam, ruby, omar, hana.  Grown-ups: june (Grandma June), walt (Grandpa Walt), park (Ms. Park, a
     teacher), diaz (Mr. Diaz, a neighbor and coach), bell (Dr. Bell), rosa, kofi, nora, james, priya.
     A person is { who: 'mia', age: 'kid' | 'teen' | 'adult' (children default kid; grown-ups adult), name: 'Mom' (the label
     shown; default the cast name), mood: 'happy' | 'neutral' | 'sad' | 'surprised' | 'cross' | 'worried' | 'shy',
     pose: 'stand' | 'wave' | 'give' | 'shake' | 'hand' (raised) | 'heart' (right hand over heart) | 'phone' | 'cover'
     (cough into elbow) | 'point' | 'hips' | 'sit', holds: a prop name, x: 0–600 (default spread evenly), flip: true }.

   THE VISUALS AND THEIR OPTIONS
   et-scene      a short illustrated scene. place: 'home' | 'table' | 'kitchen' | 'classroom' | 'store' | 'library' | 'park' |
                 'doctor' | 'party' | 'restaurant' | 'office' | 'street' | 'door' | 'hall' (a quiet hall with rows of seats:
                 a concert, a ceremony or a place of worship, no symbols) | 'theater' | 'plane' | 'plain'. people: [person];
                 props: [{ kind, x, y }] (kinds: gift ball book phone cup plate cake blocks crayons kite flowers bag cart
                 tissue balloon card toy pie flag); say: [[person index, 'words'], …] (speech bubbles above the picture,
                 tails toward the speaker); think: [[i, 'words']] (thought bubbles); narr: 'narration under the picture'.
                 choices: [{ text, ok: true|false, outcome: HTML, mood: { 0: 'happy' }, say: [[i, 'reply']] }] (tap a
                 choice: the outcome is shown and faces change; wrong ones say "Try another"); prompt: the question line
                 (default "What should Mia do?"). frames: [{ place?, people?, say?, narr?, props? }] a comic strip with
                 Back/Next (each frame inherits the one before). lines: [{ who: i, text }] a numbered transcript under the
                 picture; mode: 'spot' with fault: index or [indexes]: learners tap the impolite line(s), then Check; why:
                 HTML shown after. quiet: no choices, outcomes or verdicts (the picture, bubbles, narration and numbered lines stay).
   et-setting    a place setting seen from above. level: 'basic' | 'informal' | 'formal' (default informal); courses: list in
                 serving order from soup salad fish main dessert (sets which utensils appear and their order; defaults:
                 basic [main], informal [soup, salad, main, dessert], formal [soup, fish, main, salad, dessert]); bread: true|false;
                 glasses: ['water', 'other' | 'white' | 'red']; cup: true (cup and saucer); napkin: 'left' | 'plate' (formal
                 default plate). mode: 'show' (numbers on the pieces and a legend; labels: false hides the legend;
                 highlight: [piece keys]; ask: piece key (that piece gets a "?" badge)) | 'build' (pieces in a tray: tap or drag
                 them onto the dashed spots, then Check; keyboard: Tab to a piece, Enter, then Tab to a spot, Enter) |
                 'spot' (mistake: 'swap:key1,key2' | 'blade-out' | 'bread-right' | 'glass-left' | 'fork-right'; learners tap
                 the piece that is wrong) | 'rest' (a close-up plate: style 'american' | 'continental', state 'resting' |
                 'finished' | 'gangplank' (the mistake: handles on the table); grid: true shows all four positions;
                 clock: true numbers the plate rim like a clock). Piece keys: see MathLadder.etiquette.PIECES.
                 quiet: no legend names, no verdicts (numbers stay so a problem can ask "what is piece 3?").
   et-note       a note or letter that shows its parts. kind: 'thanks' | 'condolence' | 'letter' | 'invitation' | 'reply' |
                 'apology' | 'email' | 'message' (a phone message slip) | 'picture' (a child's thank-you picture: draw:
                 a prop name); parts: { part: 'text', … } or lines: [{ part, text }] (part names: MathLadder.etiquette.NOTES);
                 mode: 'show' (colored part tags; tags: false hides them) | 'order' (shuffled; learners move parts up and
                 down, then Check) | 'build' (pick: { part: { options: ['…'], ok: index } }: learners choose a sentence for
                 each part and Check) | 'missing' (omit: part name: learners choose which part is missing, then Check).
                 quiet: no tags or verdicts; in order mode the shuffled parts are lettered A, B, C…
   et-intro      an introduction. people: [{ who, name, role (e.g. 'your grandmother'), title (e.g. 'Mrs. Hale') }] (2 or 3);
                 you: { who, name } (the person making the introduction); honored: index (whose name is said first);
                 lines: ['…'] (default made from the names); details: ['Omar plays chess too.']. mode: 'show' (the lines,
                 an arrow "presented to" the honored person, and why) | 'steps' (Back/Next through the lines) | 'choose'
                 (learners tap whose name to say first, then Check; reason: HTML). quiet: no arrow, reason or verdict.
   et-posture    a side-view figure. pose: 'stand' | 'sit' | 'table'; t: 0 (slumped) to 1 (poised); mode: 'show' |
                 'compare' (two figures A and B; good: 'A' | 'B' which one is poised (default 'B'); learners may tap the poised
                 one and Check) | 'slider' (drag from slumped to poised; cues appear: head up, shoulders relaxed, feet flat…);
                 cues: false hides the cue labels. quiet: no cues, no verdict.
   et-envelope   an envelope front. to: ['Ms. Nora Grant', '22 Maple Street', 'Fairview, OH 44120'], from: [three lines];
                 mode: 'show' (labels: return address, delivery address, stamp) | 'spot' (mistake: 'stamp-left' |
                 'return-center' | 'swap' | 'no-zip' | 'no-title'; learners tap the wrong area, then Check) | 'build' (tap a block,
                 then a spot; Check). quiet: no labels or verdicts.
   et-chart      a printable manners chart for young children. items: ['please', 'thanks', …] (MathLadder.etiquette.CHART;
                 default six); title; name: true (a line for the child's name); days: 7 | 5; stars: tap a box to give a
                 star; print: a Print button that prints only this chart. quiet or interactive: false: no stars, no button.
   et-sort       card sorter. bins: ['Polite', 'Rude'] (default); cards: [{ text, bin, why, icon (a chart icon) }] or strings;
                 shuffle: true; columns; reveal: true (a Show me button); solved: true. Tap a card, then a group; keyboard:
                 focus a card, press the group's number (0 puts it back). quiet: no Check.
   et-order      put steps in order. items: ['…'] in the right order, or [{ text, label }]; start: [indexes] (the order shown
                 first; default a fixed shuffle); title. Tap one step, then another, to swap them, or use the ▲ ▼ buttons; Check
                 marks each place. quiet: the shuffled steps, lettered A, B, C… with no controls.
   et-text       a phone screen. kind: 'text' | 'group' | 'email'; title (the contact, group or subject); to (email);
                 messages: [{ from: 'Ruby' (or me: true), text, time }]; choices: [{ text, ok, why }] (learners pick a reply;
                 it appears as a bubble with a note); mode: 'spot' with fault: index (tap the unkind message, Check).
                 quiet: no choices or verdicts.
   et-flag       the U.S. flag displayed under the Flag Code (4 U.S.C. ch. 1). show: 'wall' | 'vertical' | 'staff' |
                 'half' (half-staff) | 'crossed' (with another flag, crossed staffs) | 'platform' (beside a speaker);
                 wrong: true draws the classic mistake; compare: true draws A and B (right: 'A' | 'B' is correct; learners may
                 tap one and Check); steps: true (half: raise to the peak, then lower). quiet: no rule text or verdict.

   THE MODEL: MathLadder.etiquette (pure data and functions; no DOM; works in node)
     CAST {key: { name, full, title, pronoun ('she' | 'he'), kid: true|false, … }}; cast(key); PLACES (scene place keys);
     PIECES {key: { name, side: 'left' | 'right' | 'above' | 'center', course }}; setting(level, opts) -> { slots: [{ id,
     piece, x, y, n }], pieces: [keys] } in the drawing's order; NOTES {kind: [part names in order]} and PART_NAMES
     {part: 'label'}; CHART {key: 'label'}; DRESS {social: [...], work: [...]} most to least formal; REST (the four rest
     positions in words); FLAG (short statements of the Flag Code rules the kit draws).                                  */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  /* =====================================================================================================================
     THE MODEL: MathLadder.etiquette
     ===================================================================================================================== */
  var CAST = {
    mia:   { name: 'Mia', full: 'Mia Brooks', pronoun: 'she', kid: true, hair: 'puffs', hc: '#1f1612', shirt: '#d6453d', pants: '#3f5d9e' },
    leo:   { name: 'Leo', full: 'Leo Novak', pronoun: 'he', kid: true, hair: 'short', hc: '#8a4b22', shirt: '#3f9a5c', pants: '#4d5566' },
    sam:   { name: 'Sam', full: 'Sam Rivera', pronoun: 'he', kid: true, hair: 'curly', hc: '#2a1d15', shirt: '#2f7fd0', pants: '#5a4636', glasses: true },
    ruby:  { name: 'Ruby', full: 'Ruby Walsh', pronoun: 'she', kid: true, hair: 'ponytail', hc: '#c4542b', shirt: '#8a5cc7', pants: '#33445e' },
    omar:  { name: 'Omar', full: 'Omar Haddad', pronoun: 'he', kid: true, hair: 'short', hc: '#1d1714', shirt: '#e8742e', pants: '#3c4a3e' },
    hana:  { name: 'Hana', full: 'Hana Kim', pronoun: 'she', kid: true, hair: 'bob', hc: '#141214', shirt: '#e0628a', pants: '#2f4a6b' },
    june:  { name: 'Grandma June', short: 'Grandma', full: 'June Hale', title: 'Mrs. Hale', pronoun: 'she', hair: 'bun', hc: '#cfcfd4', shirt: '#7a9fb8', pants: '#59607a', glasses: true, cardigan: '#b5677a' },
    walt:  { name: 'Grandpa Walt', short: 'Grandpa', full: 'Walt Hale', title: 'Mr. Hale', pronoun: 'he', hair: 'bald', hc: '#d8d8dc', shirt: '#c7b07a', pants: '#5b5048', mustache: true },
    park:  { name: 'Ms. Park', full: 'Grace Park', title: 'Ms. Park', pronoun: 'she', hair: 'bun', hc: '#17141a', shirt: '#2f8f86', pants: '#3b3f52', cardigan: '#d9a441' },
    diaz:  { name: 'Mr. Diaz', full: 'Luis Diaz', title: 'Mr. Diaz', pronoun: 'he', hair: 'short', hc: '#231a15', shirt: '#c43c3c', pants: '#3a3a44', mustache: true },
    bell:  { name: 'Dr. Bell', full: 'Ada Bell', title: 'Dr. Bell', pronoun: 'she', hair: 'short-curly', hc: '#1a1210', shirt: '#7fb0d6', pants: '#3e4a5c', coat: true, glasses: true },
    rosa:  { name: 'Rosa', full: 'Rosa Lopez', title: 'Ms. Lopez', pronoun: 'she', hair: 'long', hc: '#2b1b14', shirt: '#d9704a', pants: '#3d4d6b' },
    kofi:  { name: 'Kofi', full: 'Kofi Mensah', title: 'Mr. Mensah', pronoun: 'he', hair: 'buzz', hc: '#141010', shirt: '#4a6fb5', pants: '#2f3440', beard: true },
    nora:  { name: 'Nora', full: 'Nora Grant', title: 'Ms. Grant', pronoun: 'she', hair: 'long', hc: '#d9b25c', shirt: '#2f6f73', pants: '#2c3546', blazer: true },
    james: { name: 'James', full: 'James Reed', title: 'Mr. Reed', pronoun: 'he', hair: 'short', hc: '#5b3b22', shirt: '#e9edf2', pants: '#2b3242', tie: '#9b2335', blazer: '#3a4660' },
    priya: { name: 'Priya', full: 'Priya Shah', title: 'Ms. Shah', pronoun: 'she', hair: 'braid', hc: '#16100e', shirt: '#b8478f', pants: '#34405a' }
  };
  // one cartoon skin color for everyone (the warm yellow of the standard emoji) and a slightly darker outline for it;
  // an old skin value in a cast entry or a scene is ignored
  var SKIN = '#ffcc4d', SKIN_LINE = '#e8a93a';
  var PLACES = ['home', 'table', 'kitchen', 'classroom', 'store', 'library', 'park', 'doctor', 'party', 'restaurant', 'office', 'street', 'door', 'hall', 'theater', 'plane', 'plain'];
  var PIECES = {
    'dinner-plate': { name: 'dinner plate', side: 'center' },
    'charger': { name: 'charger (service plate)', side: 'center' },
    'napkin': { name: 'napkin', side: 'left' },
    'salad-fork': { name: 'salad fork', side: 'left', course: 'salad' },
    'fish-fork': { name: 'fish fork', side: 'left', course: 'fish' },
    'dinner-fork': { name: 'dinner fork', side: 'left', course: 'main' },
    'fork': { name: 'fork', side: 'left', course: 'main' },
    'dinner-knife': { name: 'dinner knife', side: 'right', course: 'main' },
    'knife': { name: 'knife', side: 'right', course: 'main' },
    'fish-knife': { name: 'fish knife', side: 'right', course: 'fish' },
    'soup-spoon': { name: 'soup spoon', side: 'right', course: 'soup' },
    'spoon': { name: 'spoon', side: 'right', course: 'main' },
    'bread-plate': { name: 'bread plate', side: 'left' },
    'butter-knife': { name: 'butter knife', side: 'left' },
    'dessert-spoon': { name: 'dessert spoon', side: 'above', course: 'dessert' },
    'dessert-fork': { name: 'dessert fork', side: 'above', course: 'dessert' },
    'water-glass': { name: 'water glass', side: 'right' },
    'glass': { name: 'glass', side: 'right' },
    'other-glass': { name: 'glass for another drink', side: 'right' },
    'white-glass': { name: 'white wine glass', side: 'right' },
    'red-glass': { name: 'red wine glass', side: 'right' },
    'cup': { name: 'cup and saucer', side: 'right' }
  };
  var COURSE_LEFT = { salad: 'salad-fork', fish: 'fish-fork', main: 'dinner-fork' };
  var COURSE_RIGHT = { soup: 'soup-spoon', fish: 'fish-knife', main: 'dinner-knife' };
  // a place setting as slots, in the drawing's coordinates (600 x 400; plate center 300, 250)
  function setting(level, o) {
    o = o || {}; level = level || 'informal';
    var basic = level === 'basic', formal = level === 'formal';
    var courses = o.courses || (basic ? ['main'] : formal ? ['soup', 'fish', 'main', 'salad', 'dessert'] : ['soup', 'salad', 'main', 'dessert']);
    var bread = o.bread !== undefined ? !!o.bread : !basic;
    var glasses = o.glasses || (basic ? ['water'] : formal ? ['water', 'white', 'red'] : ['water', 'other']);
    var napkin = o.napkin || (formal ? 'plate' : 'left');
    var slots = [], cx = 300, cy = 250, R = formal ? 74 : 70;
    function add(piece, x, y) { slots.push({ id: 's' + slots.length, piece: piece, x: x, y: y }); }
    if (formal) add('charger', cx, cy);
    add('dinner-plate', cx, cy);
    var left = [], right = [];
    courses.forEach(function (c) { if (COURSE_LEFT[c]) left.push(COURSE_LEFT[c]); if (COURSE_RIGHT[c]) right.push(COURSE_RIGHT[c]); });
    if (basic) { left = ['fork']; right = ['spoon', 'knife']; }
    // outside in: the first course's piece is the farthest from the plate
    var lx = cx - (formal ? 98 : R + 20); left.slice().reverse().forEach(function (p, i) { add(p, lx - i * 26, cy + 4); });
    var rx = cx + (formal ? 98 : R + 20); right.slice().reverse().forEach(function (p, i) { add(p, rx + i * 26, cy + 4); });
    if (napkin === 'left') add('napkin', lx - left.length * 26 - 30, cy + 4); else add('napkin', cx, cy);
    if (bread) { add('bread-plate', lx - 18, cy - R - 54); add('butter-knife', lx - 18, cy - R - 60); }
    if (courses.indexOf('dessert') >= 0) { add('dessert-spoon', cx, cy - R - 30); add('dessert-fork', cx, cy - R - 16); }
    var gk = { water: 'water-glass', other: 'other-glass', white: 'white-glass', red: 'red-glass', glass: 'glass' };
    if (basic && glasses.length === 1 && glasses[0] === 'water') glasses = ['glass'];
    glasses.forEach(function (g, i) { add(gk[g] || 'glass', rx + i * 34, cy - R - 50 + (i % 2) * 22); });
    if (o.cup) add('cup', rx + right.length * 26 + 30, cy - 22);
    var n = 0; slots.forEach(function (s) { if (s.piece !== 'charger' || formal) s.n = ++n; });
    return { level: level, courses: courses, slots: slots, pieces: slots.map(function (s) { return s.piece; }), plate: { x: cx, y: cy, r: R } };
  }
  var PART_NAMES = { date: 'Date', greeting: 'Greeting', thanks: 'Thank you for…', detail: 'How you use or enjoy it', personal: 'A personal line',
    closing: 'Closing', signature: 'Signature', sympathy: 'Sympathy', memory: 'A memory', offer: 'An offer of help', body: 'Body',
    host: 'Who is hosting', occasion: 'The occasion', when: 'Date and time', where: 'Place', attire: 'What to wear', rsvp: 'How to reply',
    answer: 'Your answer', what: 'What you did', sorry: 'I\'m sorry', fix: 'Making it right', next: 'Next time',
    to: 'To', subject: 'Subject', from: 'From', number: 'Phone number', message: 'Message', time: 'Time', taker: 'Taken by', picture: 'A picture' };
  var NOTES = {
    thanks: ['date', 'greeting', 'thanks', 'detail', 'personal', 'closing', 'signature'],
    condolence: ['greeting', 'sympathy', 'memory', 'offer', 'closing', 'signature'],
    letter: ['date', 'greeting', 'body', 'closing', 'signature'],
    invitation: ['host', 'occasion', 'when', 'where', 'attire', 'rsvp'],
    reply: ['greeting', 'thanks', 'answer', 'closing', 'signature'],
    apology: ['greeting', 'what', 'sorry', 'fix', 'next', 'closing', 'signature'],
    email: ['to', 'subject', 'greeting', 'body', 'closing', 'signature'],
    message: ['to', 'from', 'number', 'message', 'time', 'taker'],
    picture: ['picture', 'thanks', 'signature']
  };
  var CHART = { please: 'I say please', thanks: 'I say thank you', sorry: 'I say I\'m sorry', excuse: 'I say excuse me', hello: 'I say hello and goodbye',
    wash: 'I wash my hands', napkin: 'Napkin on my lap', chew: 'I chew with my mouth closed', turns: 'I take turns', share: 'I share',
    listen: 'I listen', voice: 'I use my inside voice', tidy: 'I tidy up', help: 'I help', excused: 'I ask to be excused', cover: 'I cover my cough' };
  var DRESS = { social: ['white tie', 'black tie', 'cocktail (semiformal)', 'smart casual', 'casual'], work: ['business formal', 'business casual', 'casual'] };
  var REST = {
    'american-resting': 'Knife across the upper right of the plate, blade facing in; fork on the plate below it, tines up.',
    'american-finished': 'Fork and knife side by side, diagonally across the plate, handles toward 4 o\'clock and tips toward 10; fork tines up, knife blade facing in.',
    'continental-resting': 'Fork and knife crossed near the tips like an upside-down V, fork over knife, fork tines down; handles toward 8 and 4 o\'clock.',
    'continental-finished': 'Fork and knife side by side, diagonally, handles toward 4 o\'clock; fork tines down, knife blade facing in.'
  };
  var FLAG = {
    wall: 'On a wall, horizontal or vertical, the union (the blue field of stars) is uppermost and at the flag\'s own right: the viewer\'s left. (4 U.S.C. § 7(i))',
    staff: 'On a staff, the union is at the peak (the top), next to the staff.',
    half: 'For half-staff, hoist the flag to the peak for an instant, then lower it to half-staff; raise it to the peak again before lowering it for the day. (4 U.S.C. § 7(m))',
    crossed: 'With another flag against a wall from crossed staffs, the U.S. flag is on its own right (the viewer\'s left), its staff in front of the other flag\'s staff. (4 U.S.C. § 7(d))',
    platform: 'On a speaker\'s platform, a flag on a staff stands at the speaker\'s right as they face the audience: the audience\'s left. (4 U.S.C. § 7(k))',
    pledge: 'During the Pledge, stand at attention facing the flag with the right hand over the heart; the Code asks men not in uniform to remove headdress other than religious head coverings (today most people remove hats); people in uniform face the flag and salute. (4 U.S.C. § 4)',
    anthem: 'During the anthem, with the flag displayed, people not in uniform face the flag and stand at attention with the right hand over the heart; with no flag, face toward the music. (36 U.S.C. § 301)',
    ground: 'The flag should never touch anything beneath it, such as the ground or the floor. (4 U.S.C. § 8(b))',
    hours: 'It is the custom to fly the flag from sunrise to sunset; it may fly day and night if properly lit after dark. (4 U.S.C. § 6(a))',
    worn: 'A flag too worn to fly should be destroyed in a dignified way, preferably by burning. (4 U.S.C. § 8(k))'
  };
  ML.etiquette = {
    CAST: CAST, SKIN: SKIN, SKIN_LINE: SKIN_LINE, PLACES: PLACES, PIECES: PIECES, setting: setting, NOTES: NOTES, PART_NAMES: PART_NAMES, CHART: CHART,
    DRESS: DRESS, REST: REST, FLAG: FLAG,
    cast: function (k) { return CAST[k] || null; },
    names: function (kids) { return Object.keys(CAST).filter(function (k) { return kids === undefined || !!CAST[k].kid === !!kids; }).map(function (k) { return CAST[k].name; }); }
  };
  /* =====================================================================================================================
     THE VISUALS (need math/viz/core.js and a document)
     ===================================================================================================================== */
  if (!ML.viz || !D) return;
  var V = ML.viz, M = Math, ET = ML.etiquette;
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  var uidN = 0; function uid(p) { return 'etv-' + (p || 'x') + '-' + (++uidN); }
  function okMark(good) { return '<span class="' + (good ? 'etv-ok' : 'etv-bad') + '">' + (good ? '✓' : '✗') + '</span>'; }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  function seeded(str) { var x = 0; for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(key), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function derange(n, key) { // a fixed shuffle of 0..n-1 that is never the identity (for n > 1)
    var idx = []; for (var i = 0; i < n; i++) idx.push(i);
    for (var t = 0; t < 20; t++) { var s = shuffle(idx, key + '#' + t); if (n < 2 || s.some(function (v, j) { return v !== j; })) return s; }
    return idx.slice(1).concat([0]);
  }
  function svgRoot(w, hh, label, cls) { var s = sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'etv-svg' + (cls ? ' ' + cls : ''), role: 'img', 'aria-label': label || '', focusable: 'false' }); return s; }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function letter(i) { return String.fromCharCode(65 + i); }
  function onResize(e, fn) { if ('ResizeObserver' in W) { var last = -1; new ResizeObserver(function () { var w = e.clientWidth; if (w !== last) { last = w; fn(); } }).observe(e); } else W.addEventListener('resize', fn); }
  // svg coordinates of a pointer event
  function svgPt(svg, e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }

  // the frame every visual shares: class, aria-label, read-to-me note, task line, body, controls, readout, caption
  function frame(el, o, name, label) {
    el.classList.add('etv', 'etv-' + name); if (o.big) el.classList.add('etv-big');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.readme) el.appendChild(h('p', 'etv-readme', '<span class="etv-readme-tag">Read to me</span> ' + o.readme));
    if (o.task) el.appendChild(h('p', 'etv-task', o.task));
    F.body = h('div', 'etv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl etv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout etv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    F.speak = function (getText) { // a Read aloud button, when the browser has a speech voice
      if (!o.speak || !W.speechSynthesis || !W.SpeechSynthesisUtterance) return;
      var b = btn(null, '🔊 Read aloud', function () {
        try { W.speechSynthesis.cancel(); var u = new W.SpeechSynthesisUtterance(getText().replace(/<[^>]+>/g, ' ')); u.rate = 0.9; W.speechSynthesis.speak(u); } catch (e) { }
      }, 'etv-speak');
      F.ctl.insertBefore(b, F.ctl.firstChild);
    };
    return F;
  }

  /* ---------- people: simple original figures, front view (feet at 0, 0; up is negative y) ---------- */
  var DIMS = { adult: { leg: 80, torso: 62, sh: 29, hip: 23, head: 23, neck: 8 }, teen: { leg: 66, torso: 52, sh: 25, hip: 20, head: 22, neck: 7 }, kid: { leg: 42, torso: 38, sh: 19, hip: 16, head: 20, neck: 4 } };
  function personInfo(p) {
    var c = ET.CAST[p.who] || ET.CAST.leo, age = p.age || (c.kid ? 'kid' : 'adult');
    return { c: c, age: age, d: DIMS[age] || DIMS.adult, name: p.name || (c.short && age !== 'adult' ? c.short : c.name) };
  }
  function shade(hex, f) { var v = parseInt(hex.slice(1), 16), r = v >> 16 & 255, g = v >> 8 & 255, b = v & 255; function m(x) { return M.max(0, M.min(255, M.round(f < 0 ? x * (1 + f) : x + (255 - x) * f))); } return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1); }
  // draws a person into g; returns geometry { top, headY, handR: [x, y], handL: [x, y], width }
  function drawPerson(g, p) {
    var I = personInfo(p), c = I.c, d = I.d, skin = ET.SKIN, sl = { stroke: ET.SKIN_LINE, 'stroke-width': 1.3 }, sit = p.pose === 'sit';
    var leg = sit ? d.leg * 0.5 : d.leg, hipY = -leg, shY = hipY - d.torso, r = d.head, hy = shY - d.neck - r, dir = p.flip ? -1 : 1;
    var ink = '#2b2420', shirt = c.shirt, pants = c.pants;
    g.setAttribute('class', 'etv-person');
    // hair behind the head
    var hc = c.hair;
    if (hc === 'long' || hc === 'braid') sv('path', { d: 'M' + (-r * 1.05) + ',' + (hy - r * 0.2) + ' Q' + (-r * 1.2) + ',' + (hy + r * 1.9) + ' ' + (-r * 0.6) + ',' + (hy + r * 1.75) + ' L' + (r * 0.6) + ',' + (hy + r * 1.75) + ' Q' + (r * 1.2) + ',' + (hy + r * 1.9) + ' ' + (r * 1.05) + ',' + (hy - r * 0.2) + ' Z', fill: c.hc, transform: hc === 'braid' ? 'scale(0.86,1)' : null }, g);
    if (hc === 'bob') sv('path', { d: 'M' + (-r * 1.12) + ',' + (hy - r * 0.1) + ' Q' + (-r * 1.18) + ',' + (hy + r * 0.95) + ' ' + (-r * 0.7) + ',' + (hy + r * 0.92) + ' L' + (r * 0.7) + ',' + (hy + r * 0.92) + ' Q' + (r * 1.18) + ',' + (hy + r * 0.95) + ' ' + (r * 1.12) + ',' + (hy - r * 0.1) + ' Z', fill: c.hc }, g);
    if (hc === 'ponytail') sv('ellipse', { cx: -dir * r * 1.05, cy: hy - r * 0.15, rx: r * 0.42, ry: r * 0.8, fill: c.hc, transform: 'rotate(' + (dir * 22) + ' ' + (-dir * r * 1.05) + ' ' + (hy - r * 0.15) + ')' }, g);
    if (hc === 'puffs') { sv('circle', { cx: -r * 0.92, cy: hy - r * 0.78, r: r * 0.5, fill: c.hc }, g); sv('circle', { cx: r * 0.92, cy: hy - r * 0.78, r: r * 0.5, fill: c.hc }, g); }
    // legs and shoes
    var lw = d.hip * 0.72, lx = d.hip * 0.48;
    [-1, 1].forEach(function (s) {
      sv('rect', { x: s * lx - lw / 2, y: hipY - 2, width: lw, height: leg - 2, rx: lw * 0.35, fill: pants }, g);
      sv('ellipse', { cx: s * lx + s * 2, cy: -3, rx: lw * 0.72, ry: 4.5, fill: '#3b3330' }, g);
    });
    // long coat (doctor) behind the arms
    var body = 'M' + (-d.sh) + ',' + (shY + 8) + ' Q' + (-d.sh) + ',' + shY + ' ' + (-d.sh + 9) + ',' + shY + ' L' + (d.sh - 9) + ',' + shY + ' Q' + d.sh + ',' + shY + ' ' + d.sh + ',' + (shY + 8) + ' L' + (d.hip + 1) + ',' + (hipY + 2) + ' L' + (-d.hip - 1) + ',' + (hipY + 2) + ' Z';
    if (c.coat) sv('path', { d: 'M' + (-d.sh - 1) + ',' + (shY + 8) + ' L' + (-d.hip - 6) + ',' + (hipY + leg * 0.5) + ' L' + (d.hip + 6) + ',' + (hipY + leg * 0.5) + ' L' + (d.sh + 1) + ',' + (shY + 8) + ' Z', fill: '#f4f6f8', stroke: '#c9d2da', 'stroke-width': 1 }, g);
    sv('rect', Object.assign({ x: -d.sh * 0.22, y: shY - d.neck - 2, width: d.sh * 0.44, height: d.neck + 6, fill: skin }, sl), g);
    sv('path', { d: body, fill: shirt }, g);
    var jacket = c.blazer ? (typeof c.blazer === 'string' ? c.blazer : shade(shirt, -0.35)) : c.cardigan || (c.coat ? '#f4f6f8' : null);
    if (jacket) {
      sv('path', { d: 'M' + (-d.sh) + ',' + (shY + 8) + ' Q' + (-d.sh) + ',' + shY + ' ' + (-d.sh + 9) + ',' + shY + ' L' + (-d.sh * 0.18) + ',' + shY + ' L' + (-d.sh * 0.05) + ',' + (hipY + 2) + ' L' + (-d.hip - 1) + ',' + (hipY + 2) + ' Z', fill: jacket }, g);
      sv('path', { d: 'M' + d.sh + ',' + (shY + 8) + ' Q' + d.sh + ',' + shY + ' ' + (d.sh - 9) + ',' + shY + ' L' + (d.sh * 0.18) + ',' + shY + ' L' + (d.sh * 0.05) + ',' + (hipY + 2) + ' L' + (d.hip + 1) + ',' + (hipY + 2) + ' Z', fill: jacket }, g);
    }
    if (c.tie) sv('path', { d: 'M0,' + (shY + 2) + ' l' + (-3.5) + ',5 l3.5,' + (d.torso * 0.55) + ' l3.5,' + (-d.torso * 0.55) + ' z', fill: c.tie }, g);
    // arms
    var aw = d.sh * 0.42, hr = d.sh * 0.23, sx = d.sh - aw * 0.45, sy = shY + aw * 0.6, T = d.torso, sleeve = shade(jacket || shirt, -0.14);
    var tgt = { R: [-(d.sh + 3), hipY + 2], L: [d.sh + 3, hipY + 2] }; // R = the person's right hand (viewer's left)
    var pose = p.pose || 'stand';
    if (pose === 'wave') tgt.R = [-(d.sh + 14), shY - T * 0.55];
    if (pose === 'hand') tgt.R = [-(d.sh * 0.55), hy - r - T * 0.25];
    if (pose === 'give') { tgt.R = [-d.sh * 0.25, shY + T * 0.62]; tgt.L = [d.sh * 0.25, shY + T * 0.62]; }
    if (pose === 'shake' || pose === 'point') { var k = dir > 0 ? 'L' : 'R'; tgt[k] = [dir * (d.sh + T * (pose === 'point' ? 0.75 : 0.62)), shY + T * (pose === 'point' ? 0.18 : 0.5)]; }
    if (pose === 'heart') tgt.R = [d.sh * 0.38, shY + T * 0.28];
    if (pose === 'phone') tgt.R = [-r * 0.95, hy + r * 0.25];
    if (pose === 'cover') tgt.R = [-d.sh * 0.15, hy + r * 0.9];
    if (pose === 'hips') { tgt.R = [-(d.hip + 2), hipY - 6]; tgt.L = [d.hip + 2, hipY - 6]; }
    if (sit) { tgt.R = [-d.sh * 0.5, hipY - 4]; tgt.L = [d.sh * 0.5, hipY - 4]; }
    function arm(side, t) {
      var s = side === 'R' ? -1 : 1, x0 = s * sx, y0 = sy, x1 = t[0], y1 = t[1];
      var mx = (x0 + x1) / 2 + s * T * 0.18, my = (y0 + y1) / 2 + (y1 < y0 ? T * 0.12 : 0);
      if (pose === 'cover' && side === 'R') { mx = -d.sh - T * 0.1; my = shY + T * 0.1; }
      if (pose === 'hips') { mx = s * (d.sh + T * 0.35); my = shY + T * 0.45; }
      sv('path', { d: 'M' + x0 + ',' + y0 + ' Q' + mx + ',' + my + ' ' + x1 + ',' + y1, fill: 'none', stroke: sleeve, 'stroke-width': aw, 'stroke-linecap': 'round' }, g);
      sv('circle', Object.assign({ cx: x1, cy: y1, r: hr, fill: skin }, sl), g);
    }
    arm('R', tgt.R); arm('L', tgt.L);
    // head
    sv('ellipse', Object.assign({ cx: -r * 0.98, cy: hy + 1, rx: r * 0.16, ry: r * 0.24, fill: skin }, sl), g);
    sv('ellipse', Object.assign({ cx: r * 0.98, cy: hy + 1, rx: r * 0.16, ry: r * 0.24, fill: skin }, sl), g);
    sv('circle', Object.assign({ cx: 0, cy: hy, r: r, fill: skin }, sl), g);
    // hair in front
    function cap(top, fr) { sv('path', { d: 'M' + (-r * 1.03) + ',' + (hy + r * 0.05) + ' C' + (-r * 1.08) + ',' + (hy - r * top) + ' ' + (r * 1.08) + ',' + (hy - r * top) + ' ' + (r * 1.03) + ',' + (hy + r * 0.05) + ' C' + (r * 0.75) + ',' + (hy - r * fr) + ' ' + (-r * 0.35) + ',' + (hy - r * (fr + 0.15)) + ' ' + (-r * 1.03) + ',' + (hy + r * 0.05) + ' Z', fill: c.hc }, g); }
    if (hc === 'short' || hc === 'long' || hc === 'ponytail' || hc === 'puffs' || hc === 'braid' || hc === 'bun') cap(1.35, 0.42);
    if (hc === 'bob') sv('path', { d: 'M' + (-r * 1.06) + ',' + (hy + r * 0.2) + ' C' + (-r * 1.1) + ',' + (hy - r * 1.4) + ' ' + (r * 1.1) + ',' + (hy - r * 1.4) + ' ' + (r * 1.06) + ',' + (hy + r * 0.2) + ' L' + (r * 0.9) + ',' + (hy - r * 0.35) + ' L' + (-r * 0.9) + ',' + (hy - r * 0.35) + ' Z', fill: c.hc }, g);
    if (hc === 'buzz') cap(1.3, 0.62);
    if (hc === 'curly' || hc === 'short-curly') { var cr = r * (hc === 'curly' ? 0.36 : 0.3); for (var a = 0; a <= 8; a++) { var an = M.PI * (1.05 + a * 0.9 / 8); sv('circle', { cx: M.cos(an) * r * 0.92, cy: hy + M.sin(an) * r * 0.92, r: cr, fill: c.hc }, g); } sv('path', { d: 'M' + (-r * 0.95) + ',' + (hy - r * 0.2) + ' Q0,' + (hy - r * 1.35) + ' ' + (r * 0.95) + ',' + (hy - r * 0.2) + ' Q0,' + (hy - r * 0.62) + ' ' + (-r * 0.95) + ',' + (hy - r * 0.2) + 'Z', fill: c.hc }, g); }
    if (hc === 'bun') sv('circle', { cx: 0, cy: hy - r * 1.12, r: r * 0.4, fill: c.hc }, g);
    if (hc === 'bald') { sv('ellipse', { cx: -r * 0.9, cy: hy - r * 0.05, rx: r * 0.2, ry: r * 0.38, fill: c.hc }, g); sv('ellipse', { cx: r * 0.9, cy: hy - r * 0.05, rx: r * 0.2, ry: r * 0.38, fill: c.hc }, g); }
    // face
    var mood = p.mood || 'happy', ex = r * 0.36, ey = hy + r * 0.02, er = M.max(1.8, r * 0.1);
    if (mood === 'shy') { [-1, 1].forEach(function (s) { sv('path', { d: 'M' + (s * ex - er * 1.3) + ',' + ey + ' q' + (er * 1.3) + ',' + (er * 1.2) + ' ' + (er * 2.6) + ',0', fill: 'none', stroke: ink, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g); }); }
    else { sv('circle', { cx: -ex, cy: ey, r: er, fill: ink }, g); sv('circle', { cx: ex, cy: ey, r: er, fill: ink }, g); }
    if (I.age === 'kid' || mood === 'shy') { sv('circle', { cx: -r * 0.58, cy: hy + r * 0.38, r: r * 0.16, fill: '#ef8f8f', opacity: 0.45 }, g); sv('circle', { cx: r * 0.58, cy: hy + r * 0.38, r: r * 0.16, fill: '#ef8f8f', opacity: 0.45 }, g); }
    var my0 = hy + r * 0.45, mw = r * 0.32, brow = null;
    var mouth = { happy: 'M' + (-mw) + ',' + my0 + ' Q0,' + (my0 + r * 0.3) + ' ' + mw + ',' + my0, sad: 'M' + (-mw) + ',' + (my0 + r * 0.16) + ' Q0,' + (my0 - r * 0.12) + ' ' + mw + ',' + (my0 + r * 0.16), neutral: 'M' + (-mw * 0.8) + ',' + (my0 + 3) + ' L' + (mw * 0.8) + ',' + (my0 + 3),
      cross: 'M' + (-mw * 0.8) + ',' + (my0 + 4) + ' L' + (mw * 0.8) + ',' + (my0 + 3), worried: 'M' + (-mw) + ',' + (my0 + 5) + ' q' + (mw * 0.5) + ',-4 ' + mw + ',0 q' + (mw * 0.5) + ',4 ' + mw + ',0', shy: 'M' + (-mw * 0.6) + ',' + my0 + ' Q0,' + (my0 + r * 0.16) + ' ' + (mw * 0.6) + ',' + my0 }[mood];
    if (mood === 'surprised') sv('ellipse', { cx: 0, cy: my0 + 3, rx: r * 0.13, ry: r * 0.18, fill: ink }, g);
    else sv('path', { d: mouth || mouth, fill: 'none', stroke: ink, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    if (mood === 'sad' || mood === 'worried') brow = [[-ex - er * 2, ey - er * 2.2, -ex + er * 1.6, ey - er * 3.4], [ex + er * 2, ey - er * 2.2, ex - er * 1.6, ey - er * 3.4]];
    if (mood === 'cross') brow = [[-ex - er * 2, ey - er * 3.4, -ex + er * 1.8, ey - er * 2.0], [ex + er * 2, ey - er * 3.4, ex - er * 1.8, ey - er * 2.0]];
    if (mood === 'surprised') brow = [[-ex - er * 1.8, ey - er * 3.4, -ex + er * 1.8, ey - er * 3.8], [ex + er * 1.8, ey - er * 3.4, ex - er * 1.8, ey - er * 3.8]];
    if (brow) brow.forEach(function (b) { sv('line', { x1: b[0], y1: b[1], x2: b[2], y2: b[3], stroke: ink, 'stroke-width': 1.7, 'stroke-linecap': 'round' }, g); });
    if (c.glasses) { [-1, 1].forEach(function (s) { sv('circle', { cx: s * ex, cy: ey, r: r * 0.24, fill: 'none', stroke: ink, 'stroke-width': 1.4 }, g); }); sv('line', { x1: -ex + r * 0.24, y1: ey, x2: ex - r * 0.24, y2: ey, stroke: ink, 'stroke-width': 1.4 }, g); }
    if (c.mustache) sv('path', { d: 'M' + (-r * 0.36) + ',' + (my0 - 1) + ' Q0,' + (my0 - r * 0.28) + ' ' + (r * 0.36) + ',' + (my0 - 1) + ' Q0,' + (my0 - r * 0.08) + ' ' + (-r * 0.36) + ',' + (my0 - 1) + 'Z', fill: c.hc === '#d8d8dc' ? '#bdbdc4' : c.hc }, g);
    if (c.beard) sv('path', { d: 'M' + (-r * 0.92) + ',' + (hy + r * 0.2) + ' Q' + (-r * 0.8) + ',' + (hy + r * 1.2) + ' 0,' + (hy + r * 1.12) + ' Q' + (r * 0.8) + ',' + (hy + r * 1.2) + ' ' + (r * 0.92) + ',' + (hy + r * 0.2) + ' Q' + (r * 0.5) + ',' + (hy + r * 0.85) + ' 0,' + (hy + r * 0.8) + ' Q' + (-r * 0.5) + ',' + (hy + r * 0.85) + ' ' + (-r * 0.92) + ',' + (hy + r * 0.2) + 'Z', fill: c.hc }, g);
    if (p.holds) { var hp = pose === 'give' ? [0, shY + T * 0.55] : pose === 'phone' ? tgt.R : tgt.L; drawProp(g, p.holds, hp[0], hp[1] + (pose === 'give' || pose === 'phone' ? 0 : -4), I.age === 'kid' ? 0.75 : 0.9); }
    return { top: hy - r * (hc === 'bun' ? 1.5 : hc === 'puffs' ? 1.3 : 1.15), headY: hy, width: d.sh * 2 + 20, hand: tgt };
  }

  /* ---------- props (centered on x, y; s = size factor, 1 ≈ 30 units) ---------- */
  function drawProp(parent, kind, x, y, s) {
    s = s || 1; var g = sv('g', { class: 'etv-prop etv-prop-' + kind, transform: 'translate(' + x + ',' + y + ') scale(' + s + ')' }, parent), ink = '#2b2420';
    var P = {
      gift: function () { sv('rect', { x: -14, y: -12, width: 28, height: 22, rx: 2, fill: '#e2574c' }, g); sv('rect', { x: -16, y: -16, width: 32, height: 6, rx: 1.5, fill: '#ec7a6f' }, g); sv('rect', { x: -2.5, y: -16, width: 5, height: 26, fill: '#f6c445' }, g); sv('path', { d: 'M0,-16 q-10,-10 -12,-2 q2,4 12,2 q10,-10 12,-2 q-2,4 -12,2', fill: '#f6c445' }, g); },
      ball: function () { sv('circle', { cx: 0, cy: 0, r: 12, fill: '#3d8fe0' }, g); sv('path', { d: 'M-12,0 Q0,-6 12,0 M0,-12 Q-6,0 0,12', stroke: '#fff', 'stroke-width': 2, fill: 'none' }, g); },
      book: function () { sv('rect', { x: -12, y: -15, width: 24, height: 30, rx: 2, fill: '#2f7d4f' }, g); sv('rect', { x: -12, y: -15, width: 5, height: 30, fill: '#25603d' }, g); sv('rect', { x: -3, y: -8, width: 11, height: 3, fill: '#f3e7c9' }, g); },
      phone: function () { sv('rect', { x: -6, y: -11, width: 12, height: 22, rx: 2.5, fill: '#2b2f38' }, g); sv('rect', { x: -4.5, y: -8.5, width: 9, height: 15, rx: 1, fill: '#7fb6e8' }, g); },
      cup: function () { sv('path', { d: 'M-9,-9 L9,-9 L7,10 L-7,10 Z', fill: '#f2f2f2', stroke: '#9aa3ad', 'stroke-width': 1.2 }, g); sv('path', { d: 'M9,-5 q7,0 6,6 q-1,5 -7,4', fill: 'none', stroke: '#9aa3ad', 'stroke-width': 2 }, g); },
      plate: function () { sv('ellipse', { cx: 0, cy: 0, rx: 18, ry: 6, fill: '#fbfbfb', stroke: '#b7c0c9', 'stroke-width': 1.2 }, g); sv('ellipse', { cx: 0, cy: 0, rx: 11, ry: 3.4, fill: 'none', stroke: '#d4dae0', 'stroke-width': 1 }, g); },
      cake: function () { sv('rect', { x: -18, y: -6, width: 36, height: 16, rx: 2, fill: '#f0c987' }, g); sv('rect', { x: -14, y: -18, width: 28, height: 13, rx: 2, fill: '#f6dcae' }, g); sv('path', { d: 'M-14,-18 h28 v4 q-3.5,4 -7,0 q-3.5,4 -7,0 q-3.5,4 -7,0 q-3.5,4 -7,0 z', fill: '#f4a6c0' }, g); [-7, 0, 7].forEach(function (cx) { sv('rect', { x: cx - 1.2, y: -27, width: 2.4, height: 9, fill: '#7fb6e8' }, g); sv('ellipse', { cx: cx, cy: -29.5, rx: 1.8, ry: 2.8, fill: '#f6c445' }, g); }); },
      blocks: function () { [['#e2574c', -14, 0], ['#3d8fe0', 0, 0], ['#f6c445', -7, -13]].forEach(function (b) { sv('rect', { x: b[1], y: b[2] - 6, width: 13, height: 13, rx: 1.5, fill: b[0] }, g); }); },
      crayons: function () { ['#e2574c', '#3d8fe0', '#3f9a5c'].forEach(function (c, i) { var gg = sv('g', { transform: 'rotate(' + (-20 + i * 20) + ')' }, g); sv('rect', { x: -2.5, y: -10, width: 5, height: 18, fill: c }, gg); sv('path', { d: 'M-2.5,-10 L0,-15 L2.5,-10 Z', fill: c }, gg); }); },
      kite: function () { sv('path', { d: 'M0,-16 L11,-2 L0,12 L-11,-2 Z', fill: '#8a5cc7' }, g); sv('path', { d: 'M0,-16 L0,12 M-11,-2 L11,-2', stroke: '#f6c445', 'stroke-width': 1.5 }, g); sv('path', { d: 'M0,12 q5,6 0,10 q-5,5 0,10', stroke: ink, fill: 'none', 'stroke-width': 1 }, g); },
      flowers: function () { [[-6, '#e2574c'], [0, '#f6c445'], [6, '#e0628a']].forEach(function (f, i) { sv('line', { x1: 0, y1: 12, x2: f[0], y2: -6 - (i === 1 ? 4 : 0), stroke: '#3f9a5c', 'stroke-width': 1.6 }, g); sv('circle', { cx: f[0], cy: -8 - (i === 1 ? 4 : 0), r: 4.5, fill: f[1] }, g); }); sv('path', { d: 'M-5,6 L5,6 L3,14 L-3,14 Z', fill: '#c7b07a' }, g); },
      bag: function () { sv('path', { d: 'M-12,-6 L12,-6 L14,14 L-14,14 Z', fill: '#c8a06a' }, g); sv('path', { d: 'M-6,-6 q0,-9 6,-9 q6,0 6,9', fill: 'none', stroke: '#8a6a3c', 'stroke-width': 2 }, g); },
      cart: function () { sv('path', { d: 'M-22,-16 L-16,-16 L-11,6 L16,6 L20,-10 L-14,-10', fill: 'none', stroke: '#7c8792', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g); sv('circle', { cx: -8, cy: 12, r: 3, fill: '#4a525c' }, g); sv('circle', { cx: 13, cy: 12, r: 3, fill: '#4a525c' }, g); },
      tissue: function () { sv('rect', { x: -12, y: -4, width: 24, height: 14, rx: 2, fill: '#7fb0d6' }, g); sv('path', { d: 'M-5,-4 q-2,-9 5,-10 q7,1 5,10 z', fill: '#fff', stroke: '#c9d2da', 'stroke-width': 1 }, g); },
      balloon: function () { sv('ellipse', { cx: 0, cy: -12, rx: 10, ry: 12, fill: '#e2574c' }, g); sv('path', { d: 'M0,0 q4,8 0,14 q-4,6 0,14', stroke: ink, fill: 'none', 'stroke-width': 1 }, g); },
      card: function () { sv('rect', { x: -14, y: -9, width: 28, height: 18, rx: 1.5, fill: '#fbf6ea', stroke: '#b9ab8c', 'stroke-width': 1.2 }, g); sv('path', { d: 'M-14,-9 L0,2 L14,-9', fill: 'none', stroke: '#b9ab8c', 'stroke-width': 1.2 }, g); sv('path', { d: 'M0,1 l-2.4,-2.4 a1.6,1.6 0 0 1 2.4,-2 a1.6,1.6 0 0 1 2.4,2 z', fill: '#e2574c' }, g); },
      toy: function () { sv('rect', { x: -14, y: -8, width: 18, height: 12, rx: 2, fill: '#f6c445' }, g); sv('rect', { x: 4, y: -2, width: 10, height: 6, rx: 1.5, fill: '#e2574c' }, g); sv('circle', { cx: -8, cy: 6, r: 3.5, fill: '#33383f' }, g); sv('circle', { cx: 9, cy: 6, r: 3.5, fill: '#33383f' }, g); },
      pie: function () { sv('ellipse', { cx: 0, cy: 0, rx: 17, ry: 7, fill: '#d99a4e' }, g); sv('path', { d: 'M-10,-3 L10,3 M-10,3 L10,-3 M0,-6 L0,6', stroke: '#b9773a', 'stroke-width': 1.4 }, g); },
      flag: function () { sv('line', { x1: -12, y1: -16, x2: -12, y2: 16, stroke: '#8a6a3c', 'stroke-width': 1.6 }, g); for (var i = 0; i < 7; i++) sv('rect', { x: -12, y: -16 + i * 2.6, width: 26, height: 1.3, fill: '#b22234' }, g); sv('rect', { x: -12, y: -16 + 1.3, width: 26, height: 0, fill: 'none' }, g); sv('rect', { x: -12, y: -16, width: 11, height: 9.1, fill: '#3c3b6e' }, g); }
    };
    (P[kind] || P.gift)();
    return g;
  }

  /* ---------- places (backdrops 600 × 260, floor line at 236). Returns a function that draws the front layer ---------- */
  var PW = 600, PH = 260, GY = 236;
  function rect(g, x, y, w, hh, cls, at) { return sv('rect', Object.assign({ x: x, y: y, width: w, height: hh, class: cls }, at || {}), g); }
  function drawPlace(g, kind, n) {
    var front = null;
    function wall(cls) { rect(g, 0, 0, PW, GY, cls || 'etb-wall'); rect(g, 0, GY, PW, PH - GY, 'etb-floor'); rect(g, 0, GY - 6, PW, 6, 'etb-trim'); }
    function windowAt(x, y, w, hh) { rect(g, x, y, w, hh, 'etb-glass', { rx: 3 }); sv('path', { d: 'M' + (x + w / 2) + ',' + y + ' v' + hh + ' M' + x + ',' + (y + hh / 2) + ' h' + w, class: 'etb-frame' }, g); rect(g, x, y, w, hh, 'etb-frame-r', { rx: 3 }); }
    function shelves(x, y, w, hh, rows, colors) {
      rect(g, x, y, w, hh, 'etb-wood', { rx: 3 }); var rh = hh / rows, r = seeded('shelf' + x);
      for (var i = 0; i < rows; i++) {
        rect(g, x + 4, y + i * rh + rh - 5, w - 8, 4, 'etb-wood2');
        for (var bx = x + 7; bx < x + w - 12;) { var bw = 6 + M.floor(r() * 8), bh = rh * (0.5 + r() * 0.3); rect(g, bx, y + i * rh + rh - 5 - bh, bw, bh, '', { fill: colors[M.floor(r() * colors.length)], rx: 1 }); bx += bw + 2; }
      }
    }
    switch (kind) {
      case 'park':
        rect(g, 0, 0, PW, GY, 'etb-sky'); rect(g, 0, GY - 30, PW, PH - GY + 30, 'etb-grass');
        sv('circle', { cx: 540, cy: 40, r: 20, class: 'etb-sun' }, g);
        rect(g, 66, 110, 14, 100, 'etb-trunk'); sv('circle', { cx: 73, cy: 96, r: 42, class: 'etb-leaf' }, g); sv('circle', { cx: 45, cy: 120, r: 26, class: 'etb-leaf' }, g); sv('circle', { cx: 103, cy: 118, r: 28, class: 'etb-leaf' }, g);
        rect(g, 470, 190, 90, 8, 'etb-wood'); rect(g, 476, 198, 6, 22, 'etb-wood2'); rect(g, 548, 198, 6, 22, 'etb-wood2'); rect(g, 470, 172, 90, 7, 'etb-wood');
        break;
      case 'street':
        rect(g, 0, 0, PW, GY, 'etb-sky'); rect(g, 30, 40, 250, GY - 40, 'etb-brick'); rect(g, 320, 70, 250, GY - 70, 'etb-wall2');
        windowAt(55, 70, 80, 60); windowAt(170, 70, 80, 60); rect(g, 120, 150, 50, GY - 150, 'etb-door', { rx: 2 }); windowAt(350, 100, 190, 70);
        rect(g, 0, GY, PW, PH - GY, 'etb-walk'); for (var i = 0; i < PW; i += 60) sv('line', { x1: i, y1: GY, x2: i - 10, y2: PH, class: 'etb-line' }, g);
        break;
      case 'door':
        wall('etb-wall2'); rect(g, 230, 40, 140, GY - 40, 'etb-wood', { rx: 2 }); rect(g, 245, 55, 110, GY - 55, 'etb-door'); sv('circle', { cx: 340, cy: 150, r: 5, class: 'etb-knob' }, g);
        windowAt(80, 70, 90, 80); windowAt(430, 70, 90, 80); rect(g, 240, GY - 2, 120, 8, 'etb-mat', { rx: 2 });
        break;
      case 'classroom':
        wall(); rect(g, 150, 30, 300, 110, 'etb-board', { rx: 4 }); rect(g, 150, 136, 300, 6, 'etb-wood');
        txt(g, 300, 92, 'A B C   1 2 3', { class: 'etb-chalk', 'text-anchor': 'middle' }); windowAt(30, 50, 80, 90); windowAt(490, 50, 80, 90);
        break;
      case 'store':
        wall('etb-wall2'); shelves(20, 50, 170, 170, 4, ['#e2574c', '#f6c445', '#3f9a5c', '#3d8fe0', '#e8742e']); shelves(410, 50, 170, 170, 4, ['#8a5cc7', '#f2b33d', '#2f7fd0', '#c43c3c', '#7fb0d6']);
        rect(g, 230, 150, 140, 70, 'etb-counter', { rx: 3 }); rect(g, 330, 132, 28, 18, 'etb-screen', { rx: 2 });
        break;
      case 'library':
        wall(); shelves(20, 30, 180, 195, 5, ['#2f7d4f', '#9b2335', '#2d5596', '#b8860b', '#5a3ea6', '#7d3c78']); shelves(400, 30, 180, 195, 5, ['#1d6f7a', '#9c4a2f', '#2f7d4f', '#c0571f', '#2d5596']);
        windowAt(250, 50, 100, 90);
        break;
      case 'doctor':
        wall('etb-wall3'); windowAt(60, 50, 90, 80); rect(g, 380, 60, 70, 50, 'etb-paper', { rx: 2 }); sv('path', { d: 'M407,72 h16 v10 h10 v16 h-10 v10 h-16 v-10 h-10 v-16 h10 z', class: 'etb-plus' }, g);
        for (var c = 0; c < 3; c++) { rect(g, 470 + c * 40, 180, 34, 8, 'etb-seat', { rx: 3 }); rect(g, 470 + c * 40, 150, 34, 32, 'etb-seat2', { rx: 4 }); }
        rect(g, 30, 190, 20, 30, 'etb-pot', { rx: 3 }); sv('circle', { cx: 40, cy: 178, r: 18, class: 'etb-leaf' }, g);
        break;
      case 'party':
        wall('etb-wall2');
        for (var f = 0; f < 12; f++) sv('path', { d: 'M' + (40 + f * 45) + ',22 l22,0 l-11,24 z', fill: ['#e2574c', '#f6c445', '#3d8fe0', '#3f9a5c'][f % 4] }, g);
        sv('path', { d: 'M30,22 Q300,34 570,22', fill: 'none', class: 'etb-line' }, g);
        drawProp(g, 'balloon', 50, 100, 1.4); drawProp(g, 'balloon', 85, 90, 1.2); drawProp(g, 'balloon', 540, 96, 1.4);
        break;
      case 'restaurant':
        wall('etb-wall3'); windowAt(40, 40, 110, 90); windowAt(450, 40, 110, 90);
        sv('path', { d: 'M300,0 v30', class: 'etb-line' }, g); sv('path', { d: 'M282,46 q18,-24 36,0 z', class: 'etb-lamp' }, g);
        break;
      case 'office':
        wall('etb-wall2'); windowAt(400, 30, 170, 110); rect(g, 40, 50, 120, 70, 'etb-paper', { rx: 2 });
        for (var l = 0; l < 4; l++) rect(g, 52, 62 + l * 13, 70 + (l % 2) * 20, 5, 'etb-ink', { rx: 2 });
        rect(g, 30, 180, 160, 10, 'etb-wood'); rect(g, 80, 140, 60, 40, 'etb-screen', { rx: 3 });
        break;
      case 'hall':
        wall('etb-wall2'); [70, 210, 350, 490].forEach(function (x) { sv('path', { d: 'M' + x + ',150 v-90 q20,-30 40,0 v90 z', class: 'etb-glass' }, g); });
        for (var row = 0; row < 2; row++) rect(g, 20, 198 + row * 18, 560, 10, 'etb-wood', { rx: 2 });
        break;
      case 'theater':
        rect(g, 0, 0, PW, PH, 'etb-dark'); rect(g, 70, 18, 460, 120, 'etb-screen2', { rx: 3 });
        for (var s2 = 0; s2 < 9; s2++) sv('path', { d: 'M' + (16 + s2 * 66) + ',' + (PH) + ' v-62 q24,-14 48,0 v62 z', class: 'etb-seat3' }, g);
        break;
      case 'plane':
        rect(g, 0, 0, PW, PH, 'etb-cabin'); for (var w = 0; w < 4; w++) sv('rect', { x: 50 + w * 140, y: 40, width: 46, height: 64, rx: 22, class: 'etb-glass' }, g);
        rect(g, 0, 0, PW, 20, 'etb-bin'); rect(g, 0, 20, PW, 4, 'etb-trim');
        break;
      case 'table': case 'kitchen':
        wall(kind === 'kitchen' ? 'etb-wall3' : 'etb-wall'); windowAt(250, 30, 100, 80);
        if (kind === 'kitchen') { rect(g, 20, 120, 150, 100, 'etb-counter', { rx: 3 }); rect(g, 470, 40, 110, 70, 'etb-wood', { rx: 3 }); }
        else { sv('rect', { x: 60, y: 40, width: 70, height: 54, class: 'etb-frame-r', rx: 2 }, g); sv('path', { d: 'M68,86 l18,-22 l14,14 l10,-10 l14,18 z', class: 'etb-leaf' }, g); }
        front = function (fg, xs) {
          sv('rect', { x: 20, y: 176, width: 560, height: 16, rx: 4, class: 'etb-cloth' }, fg); sv('rect', { x: 30, y: 190, width: 540, height: PH - 190, class: 'etb-wood' }, fg);
          (xs || []).forEach(function (x) { drawProp(fg, 'plate', x, 182, 1.3); });
        };
        break;
      case 'plain':
        rect(g, 0, 0, PW, PH, 'etb-plain'); sv('ellipse', { cx: 300, cy: GY + 4, rx: 280, ry: 14, class: 'etb-floor' }, g);
        break;
      default: // home
        wall(); windowAt(420, 40, 120, 90); sv('rect', { x: 70, y: 46, width: 80, height: 60, class: 'etb-frame-r', rx: 2 }, g); sv('path', { d: 'M80,98 l20,-26 l14,16 l10,-12 l18,22 z', class: 'etb-leaf' }, g);
        rect(g, 20, 170, 170, 56, 'etb-sofa', { rx: 10 }); rect(g, 14, 160, 26, 66, 'etb-sofa2', { rx: 8 }); rect(g, 170, 160, 26, 66, 'etb-sofa2', { rx: 8 });
    }
    return front;
  }
  // people spread across the scene; sitting people behind a table
  function layoutPeople(people) { var n = people.length; return people.map(function (p, i) { return p.x != null ? p.x : M.round(PW * (i + 1) / (n + 1)); }); }

  /* ---------- speech bubbles above a picture: tails point at each speaker ---------- */
  function bubbles(host, items, xs, tops, svg) { // items: [{ i, text, think }]
    host.innerHTML = ''; host.hidden = !items.length; if (!items.length) return function () { };
    var els = items.slice().sort(function (a, b) { return xs[a.i] - xs[b.i]; }).map(function (it) {
      var b = h('div', 'etv-bub' + (it.think ? ' etv-think' : ''), '<span class="etv-bub-who">' + esc(it.who || '') + '</span>' + it.text);
      b.dataset.i = it.i; host.appendChild(b); return b;
    });
    function place() {
      var hr = host.getBoundingClientRect(), sr = svg.getBoundingClientRect(); if (!sr.width) return;
      if (els.length === 1) { var b0 = els[0]; b0.style.marginLeft = '0px'; var w0 = b0.getBoundingClientRect().width, p0 = sr.left + xs[+b0.dataset.i] / PW * sr.width; b0.style.marginLeft = M.max(0, M.min(hr.width - w0, p0 - hr.left - w0 / 2)) + 'px'; }
      els.forEach(function (b) {
        var br = b.getBoundingClientRect(), px = sr.left + xs[+b.dataset.i] / PW * sr.width;
        b.style.setProperty('--tail', M.max(14, M.min(br.width - 14, px - br.left)) + 'px');
      });
    }
    W.requestAnimationFrame(place); onResize(host, place);
    return place;
  }
  /* ---------- et-scene: a short illustrated scene with speech bubbles, a choice point and outcomes ---------- */
  var PLACE_WORDS = { home: 'at home', table: 'at the table', kitchen: 'in the kitchen', classroom: 'in a classroom', store: 'at a store', library: 'at the library', park: 'at the park',
    doctor: 'at the doctor\'s office', party: 'at a party', restaurant: 'at a restaurant', office: 'at an office', street: 'on a sidewalk', door: 'at the front door', hall: 'in a quiet hall',
    theater: 'at the movies', plane: 'on a plane', plain: '' };
  V.register('et-scene', function (el, o) {
    var F = frame(el, o, 'scene', 'A short scene');
    var raw = o.frames && o.frames.length ? o.frames : [{}], frames = [], prev = { place: o.place || 'home', people: o.people || [], props: o.props || [] };
    raw.forEach(function (f, k) {
      var r = { place: f.place || prev.place, people: (f.people || prev.people).map(function (p) { return Object.assign({}, p); }), props: f.props || prev.props,
        say: f.say || (k === 0 ? o.say : null) || [], think: f.think || (k === 0 ? o.think : null) || [], narr: f.narr != null ? f.narr : (k === 0 ? o.narr : '') };
      if (f.moods) Object.keys(f.moods).forEach(function (i) { if (r.people[i]) r.people[i].mood = f.moods[i]; });
      if (f.poses) Object.keys(f.poses).forEach(function (i) { if (r.people[i]) r.people[i].pose = f.poses[i]; });
      frames.push(r); prev = r;
    });
    var cur = 0, extra = null; // extra: the chosen choice's mood changes and replies
    var band = h('div', 'etv-bubbles'); F.body.appendChild(band);
    var pic = h('div', 'etv-pic'); F.body.appendChild(pic);
    var narr = h('p', 'etv-narr'); F.body.appendChild(narr);
    var svg = null;
    function names(fr) { return fr.people.map(function (p) { return personInfo(p).name; }); }
    function draw() {
      var fr = frames[cur], ppl = fr.people.map(function (p, i) { var q = Object.assign({}, p); if (extra && extra.mood && extra.mood[i]) q.mood = extra.mood[i]; return q; });
      var seated = fr.place === 'table';
      pic.innerHTML = ''; svg = svgRoot(PW, PH, '', 'etv-scene-svg'); pic.appendChild(svg);
      var back = sv('g', null, svg), front = drawPlace(back, fr.place), xs = layoutPeople(ppl);
      (fr.props || []).forEach(function (pr) { if (!pr.front) drawProp(svg, pr.kind, pr.x != null ? pr.x : 300, pr.y != null ? pr.y : GY - 12, pr.s || 1.2); });
      ppl.forEach(function (p, i) {
        var I = personInfo(p), sit = seated && !p.pose ? true : p.pose === 'sit', q = sit ? Object.assign({}, p, { pose: 'sit' }) : p;
        var base = sit ? (seated ? 188 + I.d.leg * 0.5 : GY - 4) : GY + 2;
        if (sit && !seated) { rect(svg, xs[i] - I.d.sh - 6, GY - 4 - I.d.leg * 0.5 - 4, I.d.sh * 2 + 12, 8, 'etb-wood', { rx: 3 }); }
        var g = sv('g', { transform: 'translate(' + xs[i] + ',' + base + ')' }, svg); drawPerson(g, q);
      });
      if (front) front(svg, seated ? xs : []);
      (fr.props || []).forEach(function (pr) { if (pr.front) drawProp(svg, pr.kind, pr.x != null ? pr.x : 300, pr.y != null ? pr.y : 200, pr.s || 1.2); });
      if (o.names !== false) ppl.forEach(function (p, i) { txt(svg, xs[i], PH - 7, personInfo(p).name, { class: 'etv-name', 'text-anchor': 'middle' }); });
      var nm = names(fr), says = (fr.say || []).map(function (s) { return { i: s[0], text: s[1], who: nm[s[0]] }; }).concat((fr.think || []).map(function (s) { return { i: s[0], text: s[1], who: nm[s[0]], think: true }; }));
      if (extra && extra.say) says = says.concat(extra.say.map(function (s) { return { i: s[0], text: s[1], who: nm[s[0]] }; }));
      svg.setAttribute('aria-label', 'A scene ' + (PLACE_WORDS[fr.place] || '') + (nm.length ? ' with ' + nm.join(', ') : '') + '.' + says.map(function (s) { return ' ' + s.who + (s.think ? ' thinks: ' : ' says: ') + s.text.replace(/<[^>]+>/g, ''); }).join(''));
      bubbles(band, says, xs, null, svg);
      narr.innerHTML = fr.narr || ''; narr.hidden = !fr.narr;
      if (nav) { nav.n.textContent = (cur + 1) + ' of ' + frames.length; nav.b.disabled = cur === 0; nav.f.disabled = cur === frames.length - 1; }
      if (chBox) chBox.hidden = cur !== frames.length - 1;
    }
    var nav = null;
    if (frames.length > 1) {
      var nb = h('div', 'etv-nav'); nav = { b: btn(nb, '◀ Back', function () { if (cur > 0) { cur--; extra = null; draw(); } }), n: h('span', 'etv-navn'), f: btn(nb, 'Next ▶', function () { if (cur < frames.length - 1) { cur++; draw(); } }, 'pri') };
      nb.insertBefore(nav.n, nav.f); F.body.appendChild(nb);
      if (!F.interactive) nb.hidden = true;
    }
    // a numbered transcript, and the spot-the-rude-line mode
    var lines = o.lines || [], spot = o.mode === 'spot' && lines.length, faults = [].concat(o.fault == null ? [] : o.fault), picked = {};
    if (lines.length) {
      var ol = h('ol', 'etv-lines'); F.body.appendChild(ol);
      var nm0 = names(frames[0]);
      lines.forEach(function (ln, i) {
        var li = h('li', 'etv-line'), who = ln.who != null ? (typeof ln.who === 'number' ? nm0[ln.who] : ln.who) : '';
        var inner = '<span class="etv-lnum">' + (i + 1) + '</span><span>' + (who ? '<b>' + esc(who) + ':</b> ' : '') + ln.text + '</span>';
        if (spot && F.interactive && !F.quiet) {
          var b = h('button', 'etv-lbtn', inner); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () { picked[i] = !picked[i]; b.setAttribute('aria-pressed', String(!!picked[i])); li.classList.remove('ok', 'no'); F.say(''); });
          li.appendChild(b);
        } else li.innerHTML = inner;
        ol.appendChild(li);
      });
      if (spot && F.interactive && !F.quiet) {
        F.body.insertBefore(h('p', 'etv-hint', faults.length > 1 ? 'Tap every line that is not polite, then Check.' : 'Tap the line that is not polite, then Check.'), ol);
        btn(F.ctl, 'Check', function () {
          var sel = Object.keys(picked).filter(function (k) { return picked[k]; }).map(Number);
          if (!sel.length) { F.say('Tap a line first.'); return; }
          var lis = ol.children, good = sel.length === faults.length && sel.every(function (k) { return faults.indexOf(k) >= 0; });
          for (var i = 0; i < lis.length; i++) { lis[i].classList.remove('ok', 'no'); if (picked[i]) lis[i].classList.add(faults.indexOf(i) >= 0 ? 'ok' : 'no'); }
          F.say(good ? okMark(true) + ' Yes. ' + (o.why || '') : okMark(false) + ' ' + (sel.some(function (k) { return faults.indexOf(k) < 0; }) ? 'Look again: a line you chose is polite.' : 'There is more to find.') + ' Try again.');
        }, 'pri');
        btn(F.ctl, 'Show me', function () { var lis = ol.children; for (var i = 0; i < lis.length; i++) { lis[i].classList.remove('ok', 'no'); if (faults.indexOf(i) >= 0) lis[i].classList.add('ok'); } F.say(o.why || ''); });
      }
    }
    // the choice point
    var chBox = null, choices = o.choices || [];
    if (choices.length && !F.quiet) {
      chBox = h('div', 'etv-choices'); F.body.appendChild(chBox);
      var lastP = frames[frames.length - 1].people[0];
      chBox.appendChild(h('p', 'etv-prompt', o.prompt || ('What should ' + (lastP ? personInfo(lastP).name : 'you') + ' do?')));
      var list = h('div', 'etv-chlist'); chBox.appendChild(list);
      var outc = h('div', 'etv-outcome'); outc.setAttribute('aria-live', 'polite'); outc.hidden = true; chBox.appendChild(outc);
      choices.forEach(function (c, i) {
        var b = h('button', 'etv-choice', '<span class="etv-chl">' + letter(i) + '</span><span>' + c.text + '</span>'); b.type = 'button';
        if (!F.interactive) b.disabled = true;
        b.addEventListener('click', function () {
          [].forEach.call(list.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true'); b.classList.add(c.ok ? 'ok' : 'no');
          extra = { mood: c.mood || null, say: c.say || null }; draw();
          outc.hidden = false; outc.className = 'etv-outcome ' + (c.ok ? 'ok' : 'no');
          outc.innerHTML = okMark(!!c.ok) + ' ' + (c.outcome || (c.ok ? 'That is a kind choice.' : 'That could hurt someone\'s feelings.')) + (c.ok ? '' : ' <b>Try another.</b>');
        });
        list.appendChild(b);
      });
    }
    F.speak(function () {
      var fr = frames[cur], nm = names(fr);
      return [fr.narr || ''].concat((fr.say || []).map(function (s) { return nm[s[0]] + ' says, ' + s[1]; })).concat(chBox ? [chBox.querySelector('.etv-prompt').textContent].concat(choices.map(function (c, i) { return letter(i) + '. ' + c.text; })) : []).join('. ');
    });
    draw();
    return { frame: function () { return cur; } };
  });
  /* ---------- et-setting: a place setting from above (show, build, spot), and the resting and finished positions ---------- */
  var UL = 128; // utensil length
  function drawPiece(parent, key, x, y, o) {
    o = o || {}; var g = sv('g', { class: 'etp etp-' + key, transform: 'translate(' + x + ',' + y + ')' + (o.rot ? ' rotate(' + o.rot + ')' : '') + (o.flipX ? ' scale(-1,1)' : '') }, parent);
    function fork(L, wide) {
      var t = -L / 2, hw = wide ? 7.5 : 6.5;
      sv('path', { d: 'M-2.6,' + (t + 30) + ' L-3.4,' + (L / 2) + ' Q0,' + (L / 2 + 4) + ' 3.4,' + (L / 2) + ' L2.6,' + (t + 30) + ' Z', class: 'etp-metal' }, g);
      sv('path', { d: 'M' + (-hw) + ',' + t + ' L' + (-hw) + ',' + (t + 18) + ' Q' + (-hw) + ',' + (t + 28) + ' 0,' + (t + 32) + ' Q' + hw + ',' + (t + 28) + ' ' + hw + ',' + (t + 18) + ' L' + hw + ',' + t + ' Z', class: 'etp-metal' }, g);
      for (var i = 1; i < 4; i++) { var tx = -hw + i * hw * 2 / 4; sv('line', { x1: tx, y1: t - 1, x2: tx, y2: t + 14, class: 'etp-gap' }, g); }
    }
    function knife(L, small) {
      var t = -L / 2, bw = small ? 5 : 6.5, bl = small ? L * 0.5 : L * 0.46;
      sv('rect', { x: -3.6, y: t + bl, width: 7.2, height: L - bl, rx: 3.4, class: 'etp-metal' }, g);
      sv('path', { d: 'M' + bw * 0.5 + ',' + (t + bl) + ' L' + bw * 0.5 + ',' + t + ' Q' + (-bw) + ',' + (t + 6) + ' ' + (-bw) + ',' + (t + bl * 0.6) + ' L' + (-bw * 0.6) + ',' + (t + bl) + ' Z', class: 'etp-metal' }, g);
      sv('line', { x1: -bw + 0.6, y1: t + 7, x2: -bw * 0.6 + 0.4, y2: t + bl - 1, class: 'etp-edge' }, g); // the cutting edge, toward the plate
    }
    function spoon(L, big) {
      var t = -L / 2, rx = big ? 9.5 : 7.5, ry = big ? 13 : 11;
      sv('path', { d: 'M-2.6,' + (t + ry * 1.7) + ' L-3.4,' + (L / 2) + ' Q0,' + (L / 2 + 4) + ' 3.4,' + (L / 2) + ' L2.6,' + (t + ry * 1.7) + ' Z', class: 'etp-metal' }, g);
      sv('ellipse', { cx: 0, cy: t + ry, rx: rx, ry: ry, class: 'etp-metal' }, g); sv('ellipse', { cx: -1.5, cy: t + ry - 2, rx: rx * 0.45, ry: ry * 0.5, class: 'etp-shine' }, g);
    }
    function glass(r, kind) { sv('circle', { cx: 0, cy: 0, r: r, class: 'etp-glass etp-g-' + kind }, g); sv('circle', { cx: 0, cy: 0, r: r - 3, class: 'etp-glass2' }, g); sv('path', { d: 'M' + (-r * 0.55) + ',' + (-r * 0.35) + ' A' + r * 0.65 + ' ' + r * 0.65 + ' 0 0 1 ' + (r * 0.1) + ',' + (-r * 0.65), class: 'etp-gshine' }, g); }
    switch (key) {
      case 'charger': sv('circle', { cx: 0, cy: 0, r: 90, class: 'etp-charger' }, g); break;
      case 'dinner-plate': sv('circle', { cx: 0, cy: 0, r: o.r || 70, class: 'etp-plate' }, g); sv('circle', { cx: 0, cy: 0, r: (o.r || 70) - 15, class: 'etp-plate2' }, g); break;
      case 'bread-plate': sv('circle', { cx: 0, cy: 0, r: 26, class: 'etp-plate' }, g); sv('circle', { cx: 0, cy: 0, r: 19, class: 'etp-plate2' }, g); break;
      case 'napkin':
        if (o.onPlate) { sv('path', { d: 'M-30,-22 L30,-22 L24,24 L-24,24 Z', class: 'etp-napkin' }, g); sv('path', { d: 'M-27,-6 L27,-6', class: 'etp-fold' }, g); }
        else { sv('rect', { x: -19, y: -40, width: 38, height: 80, rx: 2, class: 'etp-napkin' }, g); sv('path', { d: 'M-19,-40 L19,-12 M-6,-40 L-6,40', class: 'etp-fold' }, g); }
        break;
      case 'fork': case 'dinner-fork': fork(UL); break;
      case 'salad-fork': fork(UL * 0.84); break;
      case 'fish-fork': fork(UL * 0.9, true); break;
      case 'dessert-fork': fork(UL * 0.62); break;
      case 'knife': case 'dinner-knife': knife(UL); break;
      case 'fish-knife': knife(UL * 0.9, true); break;
      case 'butter-knife': knife(UL * 0.46, true); break;
      case 'spoon': spoon(UL * 0.9); break;
      case 'soup-spoon': spoon(UL * 0.95, true); break;
      case 'dessert-spoon': spoon(UL * 0.62); break;
      case 'water-glass': glass(15, 'water'); break;
      case 'glass': glass(15, 'water'); break;
      case 'other-glass': glass(13, 'other'); break;
      case 'white-glass': glass(12, 'white'); break;
      case 'red-glass': glass(13.5, 'red'); break;
      case 'cup': sv('circle', { cx: 0, cy: 0, r: 21, class: 'etp-plate' }, g); sv('circle', { cx: 0, cy: 0, r: 12.5, class: 'etp-cup' }, g); sv('path', { d: 'M9,9 q8,6 12,1', class: 'etp-handle' }, g); break;
    }
    return g;
  }
  // how each piece lies in its slot: horizontal pieces are rotated
  function pieceOpts(key, slot, plateR, napkinOnPlate) {
    if (key === 'dessert-spoon') return { rot: -90 };       // bowl on the left, handle to the right
    if (key === 'dessert-fork') return { rot: 90 };       // tines on the right, handle to the left
    if (key === 'butter-knife') return { rot: 90 + 180 };  // across the top of the bread plate, blade facing down
    if (key === 'napkin' && napkinOnPlate) return { onPlate: true };
    if (key === 'dinner-plate') return { r: plateR };
    return {};
  }
  function slotShape(parent, key, x, y) {
    var P = ET.PIECES[key] || {}, round = /plate|glass|cup|charger/.test(key), g = sv('g', { class: 'ets-slot', transform: 'translate(' + x + ',' + y + ')' }, parent);
    if (round) sv('circle', { cx: 0, cy: 0, r: key === 'bread-plate' ? 26 : key === 'cup' ? 21 : 15, class: 'ets-dash' }, g);
    else if (key === 'napkin') sv('rect', { x: -19, y: -40, width: 38, height: 80, rx: 3, class: 'ets-dash' }, g);
    else if (/dessert|butter/.test(key)) sv('rect', { x: -40, y: -7, width: 80, height: 14, rx: 6, class: 'ets-dash' }, g);
    else sv('rect', { x: -9, y: -UL / 2 - 2, width: 18, height: UL + 4, rx: 8, class: 'ets-dash' }, g);
    void P; return g;
  }
  var REST_TITLES = { 'american-resting': 'American style, resting', 'american-finished': 'American style, finished', 'continental-resting': 'Continental style, resting', 'continental-finished': 'Continental style, finished', 'gangplank': 'Not this: handles on the table' };
  function drawRest(parent, style, state, o) {
    var svg = svgRoot(300, 300, '', 'ets-rest'); parent.appendChild(svg);
    sv('rect', { x: 0, y: 0, width: 300, height: 300, class: 'ets-cloth', rx: 10 }, svg);
    sv('circle', { cx: 150, cy: 150, r: 112, class: 'etp-plate' }, svg); sv('circle', { cx: 150, cy: 150, r: 84, class: 'etp-plate2' }, svg);
    if (o.clock) for (var hr = 1; hr <= 12; hr++) { var a = hr * M.PI / 6; txt(svg, 150 + M.sin(a) * 99, 150 - M.cos(a) * 99 + 4, String(hr), { class: 'ets-clock', 'text-anchor': 'middle' }); }
    function at(hour, rad) { var a = hour * M.PI / 6; return [150 + M.sin(a) * rad, 150 - M.cos(a) * rad]; }
    function place(key, from, to, tinesDown, flip) { // handle end "from", tip end "to"
      var mx = (from[0] + to[0]) / 2, my = (from[1] + to[1]) / 2, ang = M.atan2(to[1] - from[1], to[0] - from[0]) * 180 / M.PI + 90, L = M.hypot(to[0] - from[0], to[1] - from[1]);
      var g = sv('g', { transform: 'translate(' + mx + ',' + my + ') rotate(' + ang + ') scale(' + (L / UL) * (flip ? -1 : 1) + ',' + (L / UL) + ')' }, svg);
      drawPiece(g, key, 0, 0); if (tinesDown) g.classList.add('ets-down');
      return g;
    }
    var down = style === 'continental';
    if (state === 'finished') {
      var d = [M.sin(4 * M.PI / 6), -M.cos(4 * M.PI / 6)], n = [-d[1], d[0]]; // handle direction (4 o'clock) and its normal
      var hf = at(4, 118), tf = at(10, 62);
      // the fork on the inside (toward the diner's left), the knife beside it on the right, its edge facing the fork
      place('dinner-fork', [hf[0] + n[0] * 11, hf[1] + n[1] * 11], [tf[0] + n[0] * 11, tf[1] + n[1] * 11], down);
      place('dinner-knife', [hf[0] - n[0] * 11, hf[1] - n[1] * 11], [tf[0] - n[0] * 11, tf[1] - n[1] * 11], false);
    } else if (state === 'gangplank') {
      place('dinner-fork', at(7.5, 168), at(7.5, 78), false); place('dinner-knife', at(4.5, 168), at(4.5, 78), false);
    } else if (down) { // continental resting: an upside-down V, tips near the top center, fork over the knife
      place('dinner-knife', at(4.2, 120), [158, 70], false); place('dinner-fork', at(7.8, 120), [142, 70], true);
    } else { // american resting: knife across the upper right rim, blade in; fork on the plate, tines up
      place('dinner-knife', at(3.1, 104), at(12.6, 104), false); place('dinner-fork', at(4.6, 104), at(10.2, 40), false);
    }
    if (o.side !== false && !o.quiet) { // a small side view: tines up (∪) or down (∩)
      var g2 = sv('g', { transform: 'translate(250,272)' }, svg);
      sv('path', { d: down && state !== 'gangplank' ? 'M-30,4 Q0,-10 30,4' : 'M-30,-6 Q0,8 30,-6', class: 'ets-side' }, g2);
      txt(g2, 0, -12, down && state !== 'gangplank' ? 'tines down' : 'tines up', { class: 'ets-sidet', 'text-anchor': 'middle' });
    }
    return svg;
  }
  V.register('et-setting', function (el, o) {
    var F = frame(el, o, 'setting', 'A place setting');
    var mode = o.mode || 'show';
    if (mode === 'rest') {
      var grid = h('div', 'ets-grid' + (o.grid ? ' ets-grid4' : '')); F.body.appendChild(grid);
      var list = o.grid ? [['american', 'resting'], ['american', 'finished'], ['continental', 'resting'], ['continental', 'finished']] : [[o.style || 'american', o.state || 'finished']];
      if (o.grid && o.order) list = o.order.map(function (k) { return k.split('-'); });
      list.forEach(function (sx, i) {
        var cell = h('figure', 'ets-cell'); grid.appendChild(cell);
        var key = sx[1] === 'gangplank' ? 'gangplank' : sx.join('-'), s = drawRest(cell, sx[0], sx[1], { clock: o.clock, quiet: F.quiet, side: o.side });
        s.setAttribute('aria-label', F.quiet ? 'Plate ' + letter(i) + ' with a fork and knife' : (REST_TITLES[key] + '. ' + (ET.REST[key] || 'Used utensils never go back on the table.')));
        cell.appendChild(h('figcaption', 'ets-cap', F.quiet ? (list.length > 1 ? '<b>' + letter(i) + '</b>' : '') : '<b>' + REST_TITLES[key] + '</b>' + (o.notes === false ? '' : '<br><span>' + (ET.REST[key] || 'Once used, a utensil stays on the plate.') + '</span>')));
      });
      return {};
    }
    var S = ET.setting(o.level || 'informal', o), plateR = S.plate.r, onPlate = (o.napkin || (S.level === 'formal' ? 'plate' : 'left')) === 'plate';
    var slots = S.slots.map(function (s) { return Object.assign({}, s); });
    // a mistake to spot: swap two pieces' places, turn a blade out, or trade the bread and drink sides
    var wrongKeys = [], why = '';
    if (mode === 'spot' && o.mistake) {
      var m = String(o.mistake), byKey = function (k) { return slots.filter(function (s) { return s.piece === k; })[0]; };
      if (m.indexOf('swap:') === 0 || m === 'fork-right') {
        var ks = m === 'fork-right' ? [byKey('dinner-fork') ? 'dinner-fork' : 'fork', byKey('dinner-knife') ? 'dinner-knife' : 'knife'] : m.slice(5).split(','), a = byKey(ks[0]), b = byKey(ks[1]);
        if (a && b) { var t = a.piece; a.piece = b.piece; b.piece = t; wrongKeys = ks; var sameSide = ET.PIECES[ks[0]].side === ET.PIECES[ks[1]].side;
          why = 'The ' + ET.PIECES[ks[0]].name + ' and the ' + ET.PIECES[ks[1]].name + ' have traded places. ' + (sameSide ? 'Pieces are set in the order you use them, from the outside in.' : 'Forks go on the left; knives and spoons go on the right.'); }
      } else if (m === 'blade-out') { var kn = byKey('dinner-knife') || byKey('knife'); if (kn) { kn.flip = true; wrongKeys = [kn.piece]; why = 'The knife\'s cutting edge should face the plate.'; } }
      else if (m === 'bread-right' || m === 'glass-left') {
        slots.forEach(function (s) { if (/bread-plate|butter-knife|glass/.test(s.piece)) { s.x = 600 - s.x; s.moved = true; wrongKeys.push(s.piece); } });
        why = 'Bread goes on the left and drinks on the right. Make a lowercase b with your left hand and a d with your right: bread, drinks.';
      }
    }
    var fixed = { 'dinner-plate': 1, charger: 1 };
    var build = mode === 'build' && F.interactive && !F.quiet;
    var place = {}; // slot id -> piece key placed (build mode)
    slots.forEach(function (s) { place[s.id] = build && !fixed[s.piece] ? null : s.piece; });
    var wrap = h('div', 'ets-wrap'); F.body.appendChild(wrap);
    var svg = svgRoot(440, 285, '', 'ets-svg'); svg.setAttribute('viewBox', '80 72 440 285'); wrap.appendChild(svg);
    var legend = h('ol', 'ets-legend'); var tray = null, sel = null, picked = null, checked = false;
    function nameOf(k) { return (ET.PIECES[k] || { name: k }).name; }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      sv('rect', { x: 80, y: 72, width: 440, height: 285, class: 'ets-cloth', rx: 12 }, svg);
      var order = slots.slice().sort(function (a, b) { return (fixed[b.piece] ? 1 : 0) - (fixed[a.piece] ? 1 : 0) || (a.piece === 'charger' ? -1 : 0); });
      order.sort(function (a, b) { var ra = a.piece === 'charger' ? 0 : a.piece === 'dinner-plate' ? 1 : a.piece === 'napkin' && onPlate ? 2 : a.piece === 'bread-plate' ? 1.5 : 3, rb = b.piece === 'charger' ? 0 : b.piece === 'dinner-plate' ? 1 : b.piece === 'napkin' && onPlate ? 2 : b.piece === 'bread-plate' ? 1.5 : 3; return ra - rb; });
      order.forEach(function (s) {
        var k = place[s.id];
        if (build && !fixed[s.piece]) {
          var sl = slotShape(svg, s.piece, s.x, s.y); sl.setAttribute('tabindex', '0'); sl.setAttribute('role', 'button'); sl.dataset.slot = s.id;
          sl.setAttribute('aria-label', 'Spot ' + s.n + (k ? ', holds the ' + nameOf(k) : ', empty') + (checked && k ? (k === s.piece ? ', right' : ', not right') : ''));
          sl.addEventListener('click', function () { if (dragged) return; drop(s.id); });
          sl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(s.id); } });
          if (sel !== null) sl.classList.add('target');
          if (checked && k) sl.classList.add(k === s.piece ? 'ok' : 'no');
        }
        if (!k) return;
        var g = drawPiece(svg, k, s.x, s.y, Object.assign(pieceOpts(k, s, plateR, onPlate), s.flip ? { flipX: true } : {}));
        if (k === 'butter-knife' && s.flip) g.setAttribute('transform', g.getAttribute('transform'));
        if ((o.highlight || []).indexOf(k) >= 0 && !F.quiet) g.classList.add('etp-hl');
        if (build && !fixed[s.piece]) { g.classList.add('etp-movable'); g.dataset.slot = s.id; g.addEventListener('pointerdown', function (e) { startDrag(e, k, s.id); }); g.addEventListener('click', function (e) { e.stopPropagation(); if (dragged) return; selectPiece(k, s.id); }); if (sel && sel.from === s.id) g.classList.add('etp-sel'); }
        if (mode === 'spot' && F.interactive && !F.quiet) {
          g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Piece ' + (s.n || '') + ': ' + nameOf(k)); g.classList.add('etp-tap');
          if (picked === s.id) g.classList.add('etp-sel');
          var pick = function () { picked = s.id; checked = false; F.say(''); draw(); };
          g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
          if (checked && picked === s.id) g.classList.add(wrongKeys.indexOf(k) >= 0 ? 'etp-okk' : 'etp-nok');
        }
      });
      // number badges
      if (o.numbers !== false && mode !== 'build') slots.forEach(function (s) {
        var k = place[s.id]; if (!k || (k === 'charger' && slots.length > 2)) return;
        var b = badgePos(s, k), ask = o.ask && o.ask === k;
        var g = sv('g', { class: 'ets-badge' + (ask ? ' ask' : ''), transform: 'translate(' + b[0] + ',' + b[1] + ')' }, svg);
        sv('circle', { cx: 0, cy: 0, r: 9.5 }, g); txt(g, 0, 3.6, ask ? '?' : String(s.n), { 'text-anchor': 'middle' });
      });
      var desc = slots.filter(function (s) { return place[s.id]; }).map(function (s) { return (s.n ? s.n + ' ' : '') + nameOf(place[s.id]); });
      svg.setAttribute('aria-label', 'A ' + S.level + ' place setting seen from above' + (F.quiet || o.ask ? '' : ': ' + desc.join(', ')) + '.');
      // legend
      legend.innerHTML = '';
      if (mode === 'show' && o.labels !== false && !F.quiet && !o.ask) slots.forEach(function (s) { if (s.piece === 'charger' && slots.length > 2) return; legend.appendChild(h('li', (o.highlight || []).indexOf(s.piece) >= 0 ? 'hl' : '', '<b>' + s.n + '</b> ' + esc(nameOf(s.piece)))); });
      legend.hidden = !legend.children.length;
      if (tray) paintTray();
    }
    function badgePos(s, k) {
      if (k === 'dinner-plate') return [s.x + plateR * 0.62, s.y + plateR * 0.62];
      if (k === 'charger') return [s.x - 80, s.y + 60];
      if (k === 'napkin') return onPlate ? [s.x, s.y + 34] : [s.x, s.y + 52];
      if (/glass|cup/.test(k)) return [s.x + (k === 'cup' ? 22 : 15), s.y - 16];
      if (k === 'bread-plate') return [s.x - 30, s.y + 16];
      if (k === 'butter-knife') return [s.x - 38, s.y - 10];
      if (/dessert/.test(k)) return [s.x + 52, s.y];
      return [s.x, s.y + UL / 2 + 13];
    }
    F.body.appendChild(legend);
    // build mode: the tray, tap-to-place and dragging
    var dragged = false;
    if (build) {
      F.body.insertBefore(h('p', 'etv-hint', 'Tap a piece, then tap its spot on the table, or drag it there. With a keyboard: Tab to a piece, press Enter, then Tab to a spot and press Enter.'), wrap);
      tray = h('div', 'ets-tray'); tray.setAttribute('aria-label', 'Pieces to place'); F.body.insertBefore(tray, legend);
      var trayKeys = shuffle(slots.filter(function (s) { return !fixed[s.piece]; }).map(function (s) { return s.piece; }), 'tray' + JSON.stringify(o));
      var paintTray = function () {
        tray.innerHTML = '';
        var used = {}; Object.keys(place).forEach(function (id) { if (place[id]) used[place[id]] = (used[place[id]] || 0) + 1; });
        var fixedCount = {}; slots.forEach(function (s) { if (fixed[s.piece]) fixedCount[s.piece] = 1; });
        var left = trayKeys.filter(function (k) { if (used[k] && !fixedCount[k]) { used[k]--; return false; } return true; });
        left.forEach(function (k) {
          var b = h('button', 'ets-tp'); b.type = 'button'; b.setAttribute('aria-pressed', String(!!(sel && sel.key === k && !sel.from)));
          var ic = svgRoot(40, 40, '', 'ets-ticon'); ic.setAttribute('viewBox', /plate|cup|glass/.test(k) ? '-30 -30 60 60' : /napkin/.test(k) ? '-45 -45 90 90' : '-70 -70 140 140'); drawPiece(ic, k, 0, 0, pieceOpts(k, {}, 30, false)); b.appendChild(ic);
          b.appendChild(h('span', '', esc(nameOf(k))));
          b.addEventListener('click', function () { if (dragged) return; sel = sel && sel.key === k && !sel.from ? null : { key: k, from: null }; draw(); });
          b.addEventListener('pointerdown', function (e) { startDrag(e, k, null); });
          tray.appendChild(b);
        });
        if (!left.length) tray.appendChild(h('span', 'ets-done', 'Every piece is on the table.'));
      };
      paintTray = paintTray; // eslint
      var selectPiece = function (k, from) { sel = sel && sel.from === from ? null : { key: k, from: from }; draw(); };
      var drop = function (id) {
        if (!sel) { if (place[id]) { selectPiece(place[id], id); } return; }
        var prev = place[id]; place[id] = sel.key; if (sel.from) place[sel.from] = sel.from === id ? sel.key : prev || null;
        sel = null; checked = false; F.say(''); draw();
      };
      // dragging with a ghost that follows the pointer
      var ghost = null, ds = null;
      var startDrag = function (e, k, from) {
        if (e.button > 0) return; ds = { x: e.clientX, y: e.clientY, k: k, from: from, id: e.pointerId }; dragged = false;
        W.addEventListener('pointermove', onMove); W.addEventListener('pointerup', onUp); W.addEventListener('pointercancel', onUp);
      };
      var onMove = function (e) {
        if (!ds || e.pointerId !== ds.id) return;
        if (!ghost && M.hypot(e.clientX - ds.x, e.clientY - ds.y) < 7) return;
        if (!ghost) { dragged = true; ghost = h('div', 'ets-ghost', esc(nameOf(ds.k))); D.body.appendChild(ghost); sel = { key: ds.k, from: ds.from }; }
        ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; e.preventDefault();
      };
      var onUp = function (e) {
        W.removeEventListener('pointermove', onMove); W.removeEventListener('pointerup', onUp); W.removeEventListener('pointercancel', onUp);
        if (ghost) {
          ghost.remove(); ghost = null; var p = svgPt(svg, e), best = null, bd = 46;
          slots.forEach(function (s) { if (fixed[s.piece]) return; var dd = M.hypot(s.x - p.x, s.y - p.y) - (/dessert|butter/.test(s.piece) ? 20 : 0); if (dd < bd) { bd = dd; best = s.id; } });
          if (best) drop(best); else { sel = null; draw(); }
          setTimeout(function () { dragged = false; }, 0);
        }
        ds = null;
      };
      btn(F.ctl, 'Check', function () {
        var empty = slots.filter(function (s) { return !place[s.id]; }).length;
        if (empty) { F.say('Place every piece first (' + plural(empty, 'spot') + ' empty).'); return; }
        checked = true; draw();
        var wrong = slots.filter(function (s) { return place[s.id] !== s.piece; });
        F.say(wrong.length ? okMark(false) + ' ' + (slots.length - wrong.length) + ' of ' + slots.length + ' are in the right place. ' + hintFor(wrong[0]) : okMark(true) + ' Every piece is in its place.');
      }, 'pri');
      btn(F.ctl, 'Start over', function () { slots.forEach(function (s) { place[s.id] = fixed[s.piece] ? s.piece : null; }); sel = null; checked = false; F.say(''); draw(); });
      if (o.reveal !== false) btn(F.ctl, 'Show me', function () { slots.forEach(function (s) { place[s.id] = s.piece; }); sel = null; checked = true; draw(); F.say('Here is the whole setting. Forks left, knives and spoons right, bread left, drinks right, all in order of use from the outside in.'); });
    }
    function hintFor(s) {
      var k = place[s.id], want = ET.PIECES[s.piece], got = ET.PIECES[k];
      if (!got) return '';
      if (got.side !== want.side) return 'Look at the ' + got.name + ': ' + (got.side === 'left' ? 'it belongs on the left.' : got.side === 'right' ? 'it belongs on the right.' : 'it belongs above the plate.');
      return 'Look at the ' + got.name + ': pieces go in the order you use them, from the outside in.';
    }
    if (mode === 'spot' && F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'etv-hint', 'One thing is out of place. Tap it, then Check.'), wrap);
      btn(F.ctl, 'Check', function () {
        if (!picked) { F.say('Tap a piece first.'); return; }
        checked = true; draw(); var k = place[picked];
        F.say(wrongKeys.indexOf(k) >= 0 ? okMark(true) + ' Yes. ' + why : okMark(false) + ' The ' + nameOf(k) + ' is where it belongs. Look again.');
      }, 'pri');
      btn(F.ctl, 'Show me', function () { picked = slots.filter(function (s) { return wrongKeys.indexOf(place[s.id]) >= 0; })[0].id; checked = true; draw(); F.say(why); });
    }
    draw();
    return { state: function () { var r = {}; slots.forEach(function (s) { r[s.id] = place[s.id]; }); return r; }, slots: slots };
  });
  /* ---------- an ordering list (used by et-order and et-note): tap two rows to swap them, or use ▲ ▼ ---------- */
  function orderList(parent, items, o) {
    o = o || {}; var n = items.length, cur = (o.start || derange(n, o.key || JSON.stringify(items))).slice(), sel = null, marks = null;
    var ol = h('ol', 'eto-list' + (o.quiet ? ' quiet' : '')); parent.appendChild(ol);
    function paint() {
      ol.innerHTML = '';
      cur.forEach(function (ix, pos) {
        var it = items[ix], li = h('li', 'eto-row'); li.dataset.ix = ix;
        if (marks) li.classList.add(marks[pos] ? 'ok' : 'no');
        var lab = o.quiet ? letter(pos) : String(pos + 1);
        var body = '<span class="eto-n">' + lab + '</span><span class="eto-t">' + (it.label && o.labels ? '<small>' + esc(it.label) + '</small>' : '') + it.text + '</span>';
        if (o.quiet || o.interactive === false) { li.innerHTML = body; ol.appendChild(li); return; }
        var b = h('button', 'eto-pick', body); b.type = 'button'; b.setAttribute('aria-pressed', String(sel === pos));
        b.setAttribute('aria-label', 'Step in place ' + (pos + 1) + ': ' + String(it.text).replace(/<[^>]+>/g, '') + (sel === pos ? ', chosen; choose another step to swap' : ''));
        b.addEventListener('click', function () { if (sel === null) sel = pos; else if (sel === pos) sel = null; else { swap(sel, pos); sel = null; } paint(); var f = ol.children[pos] && ol.children[pos].querySelector('.eto-pick'); if (f) f.focus(); });
        li.appendChild(b);
        var mv = h('span', 'eto-mv');
        var up = btn(mv, '▲', function () { if (pos > 0) { swap(pos, pos - 1); sel = null; paint(); focusMove(pos - 1, 0); } }, 'eto-btn'); up.setAttribute('aria-label', 'Move up'); up.disabled = pos === 0;
        var dn = btn(mv, '▼', function () { if (pos < n - 1) { swap(pos, pos + 1); sel = null; paint(); focusMove(pos + 1, 1); } }, 'eto-btn'); dn.setAttribute('aria-label', 'Move down'); dn.disabled = pos === n - 1;
        li.appendChild(mv); ol.appendChild(li);
      });
    }
    function focusMove(pos, k) { var r = ol.children[pos]; if (!r) return; var bs = r.querySelectorAll('.eto-btn'); var b = bs[k]; if (b && b.disabled) b = bs[1 - k]; if (b) b.focus(); }
    function swap(a, b) { var t = cur[a]; cur[a] = cur[b]; cur[b] = t; marks = null; if (o.onChange) o.onChange(cur); }
    paint();
    return { order: function () { return cur.slice(); }, set: function (c) { cur = c.slice(); marks = null; paint(); }, mark: function (m) { marks = m; paint(); }, el: ol };
  }

  /* ---------- et-order: put steps in order ---------- */
  V.register('et-order', function (el, o) {
    var F = frame(el, o, 'order', 'Put the steps in order');
    var items = (o.items || []).map(function (it) { return typeof it === 'string' ? { text: esc(it) } : Object.assign({}, it, { text: it.html || esc(it.text) }); });
    if (o.title) F.body.appendChild(h('p', 'eto-title', esc(o.title)));
    if (F.interactive && !F.quiet) F.body.appendChild(h('p', 'etv-hint', 'Tap a step, then tap another to swap them, or use the arrows. Then Check.'));
    var L = orderList(F.body, items, { start: o.start, key: JSON.stringify(o.items || []), quiet: F.quiet, interactive: F.interactive, labels: o.labels, onChange: function () { F.say(''); } });
    if (F.interactive && !F.quiet && o.check !== false) {
      btn(F.ctl, 'Check', function () {
        var c = L.order(), m = c.map(function (ix, pos) { return ix === pos; }), right = m.filter(Boolean).length;
        L.mark(m); F.say(right === c.length ? okMark(true) + ' All ' + c.length + ' steps are in order.' + (o.why ? ' ' + o.why : '') : okMark(false) + ' ' + right + ' of ' + c.length + ' are in the right place. Look at the ones marked in red.');
      }, 'pri');
      if (o.reveal !== false) btn(F.ctl, 'Show me', function () { L.set(items.map(function (x, i) { return i; })); L.mark(items.map(function () { return true; })); F.say(o.why || 'Here is the order.'); });
    }
    F.speak(function () { return items.map(function (it, i) { return letter(i) + '. ' + it.text; }).join('. '); });
    return { order: L.order };
  });

  /* ---------- et-sort: a card sorter (polite or rude, and other groups) ---------- */
  V.register('et-sort', function (el, o) {
    var F = frame(el, o, 'sort', 'Sort the cards into groups');
    var bins = o.bins || ['Polite', 'Rude'], cards = (o.cards || []).map(function (c, i) { return typeof c === 'string' ? { text: c, i: i } : Object.assign({ i: i }, c); });
    if (o.shuffle) cards = shuffle(cards, JSON.stringify(o.cards || []));
    var place = {}, sel = null, checked = false;
    cards.forEach(function (c) { place[c.i] = -1; });
    if (F.interactive && !F.quiet) F.body.appendChild(h('p', 'etv-hint', 'Tap a card, then tap a group. With a keyboard, focus a card and press a group\'s number (0 puts it back).'));
    var pool = h('div', 'etsr-pool'); pool.setAttribute('aria-label', 'Cards not yet sorted'); F.body.appendChild(pool);
    var grid = h('div', 'etsr-bins'); grid.style.setProperty('--cols', o.columns || M.min(bins.length, 3)); F.body.appendChild(grid);
    var binEls = bins.map(function (b, bi) {
      var d = h('div', 'etsr-bin etsr-b' + bi); d.setAttribute('role', 'group'); d.setAttribute('aria-label', b);
      d.appendChild(h('p', 'etsr-binlab', (F.interactive && !F.quiet ? '<span class="etsr-n">' + (bi + 1) + '</span>' : '') + esc(b)));
      var list = h('div', 'etsr-binlist'); d.appendChild(list); d._list = list;
      d.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.etsr-card')) move(sel, bi); });
      grid.appendChild(d); return d;
    });
    pool.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.etsr-card')) move(sel, -1); });
    var cardEls = {};
    cards.forEach(function (c) {
      var b = h('button', 'etsr-card', (c.icon ? '<span class="etsr-ic">' + chartIcon(c.icon) + '</span>' : '') + '<span>' + esc(c.text) + '</span>'); b.type = 'button';
      if (!F.interactive || F.quiet) b.disabled = true;
      b.addEventListener('click', function () { sel = sel === c.i ? null : c.i; paint(); });
      b.addEventListener('keydown', function (e) { var k = parseInt(e.key, 10); if (!isNaN(k) && k <= bins.length) { e.preventDefault(); move(c.i, k - 1); b.focus(); } else if (e.key === 'Escape') { sel = null; paint(); } });
      cardEls[c.i] = b;
    });
    function move(i, bi) { place[i] = bi; sel = null; checked = false; paint(); F.say(''); }
    function paint() {
      cards.forEach(function (c) { var b = cardEls[c.i], p = place[c.i]; (p < 0 ? pool : binEls[p]._list).appendChild(b); b.setAttribute('aria-pressed', String(sel === c.i)); b.classList.remove('ok', 'no'); if (checked && p >= 0 && c.bin !== undefined) b.classList.add(p === c.bin ? 'ok' : 'no'); b.setAttribute('aria-label', c.text + (p >= 0 ? ', in ' + bins[p] : ', not sorted') + (checked && p >= 0 && c.bin !== undefined ? (p === c.bin ? ', right' : ', not right') : '')); });
      pool.classList.toggle('empty', !cards.some(function (c) { return place[c.i] < 0; }));
      binEls.forEach(function (d) { d.classList.toggle('target', sel !== null); });
      pool.classList.toggle('target', sel !== null && place[sel] >= 0);
    }
    if (F.interactive && !F.quiet && o.check !== false && cards.some(function (c) { return c.bin !== undefined; })) {
      btn(F.ctl, 'Check', function () {
        var left = cards.filter(function (c) { return place[c.i] < 0; }).length;
        if (left) { F.say('Sort every card first (' + plural(left, 'card') + ' left).'); return; }
        checked = true; paint();
        var wrong = cards.filter(function (c) { return place[c.i] !== c.bin; });
        F.say(wrong.length ? okMark(false) + ' ' + (cards.length - wrong.length) + ' of ' + cards.length + ' are right.' + wrong.filter(function (c) { return c.why; }).slice(0, 2).map(function (c) { return '<br><b>' + esc(c.text) + '</b> ' + c.why; }).join('') : okMark(true) + ' All ' + cards.length + ' are in the right groups.');
      }, 'pri');
      btn(F.ctl, 'Start over', function () { cards.forEach(function (c) { place[c.i] = -1; }); checked = false; sel = null; paint(); F.say(''); });
      if (o.reveal) btn(F.ctl, 'Show me', function () { cards.forEach(function (c) { place[c.i] = c.bin; }); checked = true; paint(); F.say('Each card is in its group.'); });
    }
    if (o.solved) cards.forEach(function (c) { place[c.i] = c.bin; });
    paint();
    F.speak(function () { return bins.join(' or ') + '? ' + cards.map(function (c) { return c.text; }).join('. '); });
    return { state: function () { var r = {}; cards.forEach(function (c) { r[c.i] = place[c.i]; }); return r; } };
  });
  /* ---------- et-note: a note or letter that shows its parts ---------- */
  var NOTE_DEFAULTS = {
    thanks: { date: 'June 12', greeting: 'Dear Aunt Rosa,', thanks: 'Thank you so much for the blue kite you sent for my birthday.', detail: 'I flew it at the park on Saturday, and it went higher than the trees.', personal: 'I hope you can come fly it with me this summer.', closing: 'Love,', signature: 'Mia' },
    condolence: { greeting: 'Dear Mrs. Hale,', sympathy: 'I was so sorry to hear about the loss of your husband.', memory: 'I will always remember how Walt waved from his porch and asked about my garden every spring.', offer: 'I would like to bring dinner over next Tuesday, if that would help.', closing: 'With deepest sympathy,', signature: 'Nora Grant' },
    letter: { date: 'March 3', greeting: 'Dear Grandpa Walt,', body: 'Our class is learning about trains, and I remembered your stories about riding the night train to Chicago. Could you tell me more about it when you visit? I would like to share it with my class.', closing: 'Love,', signature: 'Sam' },
    invitation: { host: 'Please join Hana Kim', occasion: 'for her tenth birthday party', when: 'Saturday, May 4, from 2 to 4 in the afternoon', where: '18 Willow Lane', attire: 'Wear clothes for outdoor games', rsvp: 'Please reply to Hana\'s mom by April 27' },
    reply: { greeting: 'Dear Hana,', thanks: 'Thank you for inviting me to your birthday party.', answer: 'I would love to come, and I will be there at 2 on Saturday.', closing: 'See you soon,', signature: 'Ruby' },
    apology: { greeting: 'Dear Mr. Diaz,', what: 'I am the one who kicked the soccer ball into your flower bed on Monday and broke two of your tulips.', sorry: 'I am sorry.', fix: 'I would like to buy new bulbs with my allowance and help you plant them.', next: 'From now on, I will play ball in the park instead.', closing: 'Sincerely,', signature: 'Omar Haddad' },
    email: { to: 'Ms. Park', subject: 'Question about Friday\'s project', greeting: 'Dear Ms. Park,', body: 'I was absent on Tuesday and missed the instructions for Friday\'s project. Could you tell me where to find them? Thank you for your help.', closing: 'Best regards,', signature: 'Leo Novak' },
    message: { to: 'Mom', from: 'Mrs. Hale', number: '555-0142', message: 'Please call back about Sunday dinner.', time: '4:15 p.m., Tuesday', taker: 'Sam' },
    picture: { picture: '', thanks: 'Thank you for the kite!', signature: 'Love, Mia' }
  };
  var TAGC = ['#5a3ea6', '#1c6fd6', '#00703c', '#b8860b', '#c2255c', '#0c8599', '#e8590c'];
  V.register('et-note', function (el, o) {
    var F = frame(el, o, 'note', 'A note and its parts');
    var kind = ET.NOTES[o.kind] ? o.kind : 'thanks', order = ET.NOTES[kind];
    var parts = {};
    if (o.lines) o.lines.forEach(function (l) { parts[l.part] = l.text; });
    else { var src = o.parts || NOTE_DEFAULTS[kind]; order.forEach(function (p) { if (src[p] != null) parts[p] = src[p]; }); }
    if (o.pick) Object.keys(o.pick).forEach(function (p) { if (!(p in parts)) parts[p] = ''; });
    var present = order.filter(function (p) { return p in parts; }), mode = o.mode || 'show', tagsOn = o.tags !== false && !F.quiet && kind !== 'message';
    var omit = mode === 'missing' ? o.omit : null, choice = {};
    function color(p) { return TAGC[order.indexOf(p) % TAGC.length]; }
    var paper = h('div', 'etn-paper etn-' + kind); F.body.appendChild(paper);
    function partText(p) { if (o.pick && o.pick[p]) { var c = choice[p]; return c == null ? '<span class="etn-blank">…</span>' : o.pick[p].options[c]; } return parts[p]; }
    function render(list) {
      paper.innerHTML = '';
      if (kind === 'email') { var hd = h('div', 'etn-mailhead'); paper.appendChild(hd); }
      if (kind === 'message') paper.appendChild(h('p', 'etn-slip-title', 'While You Were Out'));
      if (kind === 'picture') { var pic = h('div', 'etn-drawing'); var s = svgRoot(160, 110, 'A drawing'); drawProp(s, o.draw || 'kite', 80, 52, 2.4); sv('path', { d: 'M10,100 q40,-12 70,0 t70,0', class: 'etn-crayon' }, s); pic.appendChild(s); paper.appendChild(pic); }
      (list || present).forEach(function (p, i) {
        if (p === omit || p === 'picture') return;
        var d = h('div', 'etn-part etn-p-' + p); d.dataset.part = p; d.style.setProperty('--tc', color(p));
        var inner = '';
        if (kind === 'email' && (p === 'to' || p === 'subject')) inner = '<span class="etn-field">' + (p === 'to' ? 'To' : 'Subject') + '</span> ' + partText(p);
        else if (kind === 'message') inner = '<span class="etn-field">' + ET.PART_NAMES[p] + ':</span> <span class="etn-hand">' + partText(p) + '</span>';
        else inner = partText(p);
        d.innerHTML = (tagsOn && mode !== 'missing' ? '<span class="etn-tag">' + esc(ET.PART_NAMES[p]) + '</span>' : '') + '<span class="etn-txt">' + inner + '</span>';
        (kind === 'email' && (p === 'to' || p === 'subject') ? paper.querySelector('.etn-mailhead') : paper).appendChild(d);
        void i;
      });
      paper.classList.toggle('tags', tagsOn && mode !== 'missing');
      paper.setAttribute('aria-label', (kind === 'email' ? 'An email' : 'A note') + ': ' + present.filter(function (p) { return p !== omit && p !== 'picture'; }).map(function (p) { return (tagsOn ? ET.PART_NAMES[p] + ': ' : '') + String(partText(p)).replace(/<[^>]+>/g, ''); }).join(' / '));
      paper.setAttribute('role', 'group');
    }
    if (mode === 'order') {
      var items = present.filter(function (p) { return p !== 'picture'; }).map(function (p) { return { text: parts[p], label: ET.PART_NAMES[p], p: p }; });
      paper.hidden = true;
      if (F.interactive && !F.quiet) F.body.insertBefore(h('p', 'etv-hint', 'Put the parts in order from top to bottom: tap one, then another to swap them, or use the arrows. Then Check.'), paper);
      var L = orderList(F.body, items, { key: 'note' + JSON.stringify(parts), quiet: F.quiet, interactive: F.interactive, labels: false, onChange: function () { F.say(''); paper.hidden = true; } });
      if (F.interactive && !F.quiet) {
        btn(F.ctl, 'Check', function () {
          var c = L.order(), m = c.map(function (ix, pos) { return ix === pos; }), right = m.filter(Boolean).length; L.mark(m);
          if (right === c.length) { render(); paper.hidden = false; F.say(okMark(true) + ' That is the order. Here is the finished ' + (kind === 'email' ? 'email' : 'note') + ', with its parts named.'); }
          else F.say(okMark(false) + ' ' + right + ' of ' + c.length + ' are in the right place.');
        }, 'pri');
        btn(F.ctl, 'Show me', function () { L.set(items.map(function (x, i) { return i; })); L.mark(items.map(function () { return true; })); render(); paper.hidden = false; });
      }
      return { order: L.order };
    }
    render();
    if (mode === 'build' && o.pick) {
      var box = h('div', 'etn-build'); F.body.insertBefore(box, paper);
      box.appendChild(h('p', 'etv-hint', 'Choose the best sentence for each part, then Check.'));
      var pk = order.filter(function (p) { return o.pick[p]; }).concat(Object.keys(o.pick).filter(function (p) { return order.indexOf(p) < 0; })); // the note's own order, not the data's key order
      pk.forEach(function (p) {
        var g = h('fieldset', 'etn-pick'); g.appendChild(h('legend', '', esc(ET.PART_NAMES[p] || p))); g.style.setProperty('--tc', color(p));
        o.pick[p].options.forEach(function (op, k) {
          var b = h('button', 'etn-opt', op); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); if (!F.interactive || F.quiet) b.disabled = true;
          b.addEventListener('click', function () { choice[p] = k; [].forEach.call(g.querySelectorAll('.etn-opt'), function (x, j) { x.setAttribute('aria-pressed', String(j === k)); x.classList.remove('ok', 'no'); }); F.say(''); render(); });
          g.appendChild(b);
        });
        box.appendChild(g);
      });
      if (F.interactive && !F.quiet) btn(F.ctl, 'Check', function () {
        var ks = pk, un = ks.filter(function (p) { return choice[p] == null; });
        if (un.length) { F.say('Choose a sentence for every part first.'); return; }
        var bad = ks.filter(function (p) { return choice[p] !== o.pick[p].ok; });
        ks.forEach(function (p) { var b = box.querySelectorAll('.etn-pick')[ks.indexOf(p)].querySelectorAll('.etn-opt')[choice[p]]; b.classList.add(bad.indexOf(p) < 0 ? 'ok' : 'no'); });
        F.say(bad.length ? okMark(false) + ' Look again at: ' + bad.map(function (p) { return ET.PART_NAMES[p]; }).join(', ') + '.' + (o.pick[bad[0]].why ? ' ' + o.pick[bad[0]].why : '') : okMark(true) + ' A warm, complete ' + (kind === 'email' ? 'email' : 'note') + '.');
      }, 'pri');
    }
    if (mode === 'missing' && omit) {
      var mb = h('div', 'etn-missing'); F.body.appendChild(mb);
      mb.appendChild(h('p', 'etn-q', 'Which part is missing?'));
      var opts = order.filter(function (p) { return p !== 'picture'; }), pickd = null;
      var row = h('div', 'etn-mopts'); mb.appendChild(row);
      if (!F.quiet) opts.forEach(function (p) {
        var b = h('button', 'etn-opt', esc(ET.PART_NAMES[p])); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); if (!F.interactive) b.disabled = true;
        b.addEventListener('click', function () { pickd = p; [].forEach.call(row.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); x.classList.remove('ok', 'no'); }); F.say(''); });
        row.appendChild(b);
      });
      else mb.hidden = true;
      if (F.interactive && !F.quiet) btn(F.ctl, 'Check', function () {
        if (!pickd) { F.say('Choose a part first.'); return; }
        var ok = pickd === omit; [].forEach.call(row.children, function (x, j) { if (opts[j] === pickd) x.classList.add(ok ? 'ok' : 'no'); });
        F.say(ok ? okMark(true) + ' Yes: the ' + ET.PART_NAMES[omit].toLowerCase() + ' is missing. ' + (parts[omit] ? 'It could say: <i>' + parts[omit] + '</i>' : '') : okMark(false) + ' That part is there. Read the note from the top again.');
      }, 'pri');
    }
    F.speak(function () { return present.filter(function (p) { return p !== omit && p !== 'picture'; }).map(function (p) { return String(partText(p)); }).join(' '); });
    return {};
  });
  /* ---------- et-intro: who is introduced to whom ---------- */
  function avatar(p, cls) {
    var s = svgRoot(100, 100, '', 'eti-av' + (cls ? ' ' + cls : '')), g = sv('g', null, s), geo = drawPerson(g, Object.assign({ mood: 'happy' }, p, { pose: 'stand', holds: null }));
    var I = personInfo(p), top = geo.top - 6, bot = geo.headY + I.d.head * 3.1, hh = bot - top;
    s.setAttribute('viewBox', (-hh / 2) + ' ' + top + ' ' + hh + ' ' + hh); s.setAttribute('aria-hidden', 'true');
    return s;
  }
  V.register('et-intro', function (el, o) {
    var F = frame(el, o, 'intro', 'An introduction');
    var ppl = (o.people || [{ who: 'june', role: 'my grandmother', call: 'Grandma', title: 'Mrs. Hale' }, { who: 'omar', role: 'my friend' }]).map(function (p) { var I = personInfo(p), c = I.c; return Object.assign({ name: I.name, title: c.title || I.name, call: p.call || c.title || I.name }, p, { _n: p.name || I.name }); });
    var hi = o.honored == null ? 0 : o.honored, mode = o.mode || 'show', you = o.you ? Object.assign({ name: 'You' }, o.you) : null;
    var Hn = ppl[hi], On = ppl[hi === 0 ? 1 : 0], dets = o.details || [];
    var lines = o.lines || [
      Hn.call + ', this is ' + (On.role ? On.role + ', ' : '') + On._n + '.' + (dets[0] ? ' ' + dets[0] : ''),
      On._n + ', this is ' + (Hn.role ? Hn.role + ', ' : '') + (Hn.title || Hn._n) + '.' + (dets[1] ? ' ' + dets[1] : '')
    ];
    var row = h('div', 'eti-row'); F.body.appendChild(row);
    var showHon = mode === 'show' && !F.quiet, chosen = null;
    var cards = ppl.map(function (p, i) {
      var c = h(mode === 'choose' && F.interactive && !F.quiet ? 'button' : 'div', 'eti-card' + (showHon && i === hi ? ' hon' : '')); if (c.tagName === 'BUTTON') { c.type = 'button'; c.setAttribute('aria-pressed', 'false'); }
      c.appendChild(avatar(p));
      c.appendChild(h('span', 'eti-name', esc(p._n)));
      if (p.tag || p.role) c.appendChild(h('span', 'eti-role', esc(p.tag || p.role.replace(/^my /, 'your '))));
      if (showHon && i === hi) c.appendChild(h('span', 'eti-first', 'Name said first'));
      if (c.tagName === 'BUTTON') c.addEventListener('click', function () { chosen = i; cards.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === i)); x.classList.remove('ok', 'no'); }); F.say(''); });
      row.appendChild(c); return c;
    });
    if (you) { var yc = h('div', 'eti-card eti-you'); yc.appendChild(avatar(you)); yc.appendChild(h('span', 'eti-name', esc(you.name === 'You' ? 'You' : you.name))); yc.appendChild(h('span', 'eti-role', 'making the introduction')); row.insertBefore(yc, row.children[1] || null); }
    if (showHon) { var arr = h('p', 'eti-arrow', '<b>' + esc(On._n) + '</b> <span aria-hidden="true">→</span> is presented to <span aria-hidden="true">→</span> <b>' + esc(Hn._n) + '</b>'); F.body.appendChild(arr); }
    var ol = h('ol', 'eti-lines'); F.body.appendChild(ol);
    var shown = mode === 'steps' ? 1 : lines.length;
    function paint() {
      ol.innerHTML = '';
      if (mode === 'choose') { ol.hidden = true; return; }
      lines.slice(0, shown).forEach(function (l) { ol.appendChild(h('li', 'eti-line', '<span class="eti-who">' + esc(you ? (you.name === 'You' ? 'You' : you.name) : 'You') + '</span> “' + l + '”')); });
      if (nav) { nav.n.textContent = shown + ' of ' + lines.length; nav.b.disabled = shown <= 1; nav.f.disabled = shown >= lines.length; }
    }
    var nav = null;
    if (mode === 'steps' && F.interactive) {
      var nb = h('div', 'etv-nav'); nav = { b: btn(nb, '◀ Back', function () { if (shown > 1) { shown--; paint(); } }), n: h('span', 'etv-navn'), f: btn(nb, 'Next ▶', function () { if (shown < lines.length) { shown++; paint(); } }, 'pri') };
      nb.insertBefore(nav.n, nav.f); F.body.appendChild(nb);
    } else if (mode === 'steps') shown = lines.length;
    if (showHon && o.reason !== false) F.body.appendChild(h('p', 'eti-why', o.reason || 'Say the name of the person you want to honor first: an older person, a guest, or someone senior at work. Then present the other person to them.'));
    if (mode === 'choose' && F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'etv-hint', o.ask || 'Whose name do you say first? Tap a person, then Check.'), row);
      btn(F.ctl, 'Check', function () {
        if (chosen === null) { F.say('Tap a person first.'); return; }
        var ok = chosen === hi; cards[chosen].classList.add(ok ? 'ok' : 'no');
        F.say((ok ? okMark(true) + ' Yes. ' : okMark(false) + ' Not quite. ') + (o.reason || 'Say the honored person\'s name first: ' + esc(Hn._n) + '.') + (ok ? '<br>“' + lines.join('” “') + '”' : ''));
      }, 'pri');
    }
    paint();
    F.speak(function () { return lines.join(' '); });
    return {};
  });
  /* ---------- et-posture: a side-view figure, slumped (t = 0) to poised (t = 1) ---------- */
  var POSE = { // joints (feet on y = 0, facing right): [slumped, poised]
    stand: { ankle: [[0, -6], [0, -6]], knee: [[7, -50], [2, -50]], hip: [[9, -92], [0, -95]], back: [[-12, -122], [-3, -124]], sh: [[10, -144], [0, -152]], head: [[27, -165], [3, -180]], elbow: [[20, -116], [3, -122]], hand: [[22, -92], [5, -92]] },
    sit: { ankle: [[34, -6], [24, -6]], knee: [[36, -50], [24, -56]], hip: [[-6, -54], [-20, -58]], back: [[-22, -84], [-22, -88]], sh: [[-8, -108], [-17, -118]], head: [[12, -128], [-14, -146]], elbow: [[2, -84], [-6, -88]], hand: [[22, -66], [18, -64]] },
    table: { ankle: [[34, -6], [24, -6]], knee: [[36, -50], [24, -56]], hip: [[-6, -54], [-20, -58]], back: [[-18, -84], [-22, -88]], sh: [[6, -106], [-17, -118]], head: [[30, -122], [-12, -146]], elbow: [[46, -80], [6, -92]], hand: [[34, -112], [36, -80]] }
  };
  var CUES = {
    stand: [['head', 'Head up, eyes forward'], ['sh', 'Shoulders relaxed and back'], ['hand', 'Hands still at your sides'], ['ankle', 'Weight on both feet']],
    sit: [['head', 'Head up'], ['back', 'Sit back in the chair'], ['hand', 'Hands in your lap'], ['ankle', 'Feet on the floor']],
    table: [['head', 'Sit up, head up'], ['back', 'Back against the chair'], ['hand', 'Wrists at the table edge, elbows off while eating'], ['ankle', 'Feet on the floor']]
  };
  function drawPosture(svg, pose, t, o) {
    var P = POSE[pose] || POSE.stand, c = ET.CAST[o.who || 'leo'] || ET.CAST.leo, skin = ET.SKIN, sl = { stroke: ET.SKIN_LINE, 'stroke-width': 1.3 };
    function J(k) { var a = P[k][0], b = P[k][1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    var g = sv('g', { transform: 'translate(' + (o.x || 0) + ',0)' }, svg);
    if (pose !== 'stand') { // chair, and the table
      sv('path', { d: 'M-34,-6 L-34,-52 M14,-6 L14,-52 M-34,-52 L18,-52 M-36,-52 L-36,-128', class: 'etpo-chair' }, g);
      if (pose === 'table') { sv('rect', { x: 30, y: -84, width: 100, height: 8, rx: 2, class: 'etpo-table' }, g); sv('path', { d: 'M120,-76 L120,-6', class: 'etpo-chair' }, g); sv('ellipse', { cx: 82, cy: -86, rx: 22, ry: 3.5, class: 'etpo-plate' }, g); }
    }
    var ank = J('ankle'), kn = J('knee'), hip = J('hip'), bk = J('back'), sh = J('sh'), hd = J('head'), el = J('elbow'), hn = J('hand');
    function line(pts, cls, w, col) { sv('path', { d: 'M' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' L'), class: cls, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); }
    line([hip, kn, ank], 'etpo-leg', 15, c.pants);
    sv('path', { d: 'M' + (ank[0] - 4) + ',' + (ank[1] + 2) + ' L' + (ank[0] + 16) + ',' + (ank[1] + 3), stroke: '#3b3330', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    sv('path', { d: 'M' + hip[0] + ',' + hip[1] + ' Q' + bk[0] + ',' + bk[1] + ' ' + sh[0] + ',' + sh[1], fill: 'none', stroke: c.shirt, 'stroke-width': 26, 'stroke-linecap': 'round' }, g);
    var nk = [(sh[0] * 0.4 + hd[0] * 0.6), (sh[1] * 0.4 + hd[1] * 0.6)];
    line([sh, nk], '', 9, skin);
    sv('circle', Object.assign({ cx: hd[0], cy: hd[1], r: 17, fill: skin }, sl), g);
    sv('path', { d: 'M' + (hd[0] - 18) + ',' + (hd[1] + 2) + ' A18 18 0 0 1 ' + (hd[0] + 10) + ',' + (hd[1] - 15) + ' Q' + (hd[0] - 4) + ',' + (hd[1] - 8) + ' ' + (hd[0] - 8) + ',' + (hd[1] + 6) + ' Z', fill: c.hc }, g);
    sv('circle', { cx: hd[0] + 8, cy: hd[1] - 3, r: 2.2, fill: '#2b2420' }, g);
    sv('path', { d: 'M' + (hd[0] + 16) + ',' + (hd[1] - 2) + ' l4,6 l-4,1 z', fill: skin }, g);
    sv('path', { d: 'M' + (hd[0] + 7) + ',' + (hd[1] + 9) + ' q4,2 7,-1', fill: 'none', stroke: '#2b2420', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, g);
    line([sh, el, hn], 'etpo-arm', 10, c.blazer && typeof c.blazer === 'string' ? c.blazer : c.shirt);
    sv('circle', Object.assign({ cx: hn[0], cy: hn[1], r: 5.5, fill: skin }, sl), g);
    return { J: J };
  }
  V.register('et-posture', function (el, o) {
    var F = frame(el, o, 'posture', 'A figure showing posture');
    var pose = POSE[o.pose] ? o.pose : 'stand', mode = o.mode || 'show', cues = o.cues !== false && !F.quiet;
    var good = (o.good || 'B').toUpperCase(), picked = null;
    var box = h('div', 'etpo-box'); F.body.appendChild(box);
    var t = o.t != null ? +o.t : 1, sl = null;
    function draw() {
      box.innerHTML = '';
      var two = mode === 'compare', vbw = two ? 480 : pose === 'table' ? 400 : 330, svg = svgRoot(vbw, 230, '', 'etpo-svg' + (two ? '' : ' one'));
      svg.setAttribute('viewBox', (two ? -80 : pose === 'table' ? -240 : -110) + ' -212 ' + vbw + ' 230'); box.appendChild(svg);
      sv('rect', { x: -400, y: -2, width: 1200, height: 30, class: 'etpo-floor' }, svg);
      if (two) {
        ['A', 'B'].forEach(function (L, i) {
          var tt = L === good ? 1 : 0, x = i * 230 + (pose === 'table' ? -10 : 40), r = drawPosture(svg, pose, tt, { x: x, who: o.who });
          var lab = sv('g', { class: 'etpo-lab' + (picked === L ? ' sel' : '') + (checked && picked === L ? (L === good ? ' ok' : ' no') : ''), transform: 'translate(' + (x - 30) + ',-196)' }, svg);
          sv('circle', { cx: 0, cy: 0, r: 13 }, lab); txt(lab, 0, 5, L, { 'text-anchor': 'middle' }); void r;
          if (mode === 'compare' && F.interactive && !F.quiet) {
            var hit = sv('rect', { x: x - 70, y: -212, width: 200, height: 214, class: 'etpo-hit', tabindex: 0, role: 'button', 'aria-label': 'Figure ' + L }, svg);
            var pick = function () { picked = L; checked = false; F.say(''); draw(); };
            hit.addEventListener('click', pick); hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
          }
        });
        if (cues && (o.cues === true || !F.interactive || checked)) box.appendChild(h('ul', 'etpo-cues', '<li class="etpo-ch">What figure ' + good + ' shows</li>' + CUES[pose].map(function (c) { return '<li>' + esc(c[1]) + '</li>'; }).join('')));
        svg.setAttribute('aria-label', 'Two figures, A and B, ' + (pose === 'stand' ? 'standing' : pose === 'sit' ? 'sitting' : 'sitting at a table') + (F.quiet ? '.' : '; figure ' + good + ' shows poise.'));
      } else {
        var r = drawPosture(svg, pose, t, { x: 0, who: o.who });
        if (cues && t > 0.6) cueLabels(svg, r, 0);
        svg.setAttribute('aria-label', 'A figure ' + (pose === 'stand' ? 'standing' : 'sitting') + (t > 0.6 ? ' with poise: ' + CUES[pose].map(function (c) { return c[1]; }).join(', ') : t < 0.4 ? ', slumped' : '') + '.');
      }
    }
    function cueLabels(svg, r, x) { // leader lines to labels beside the figure (to the left at the table)
      var left = pose === 'table';
      CUES[pose].forEach(function (cu, i) {
        var p = r.J(cu[0]), ly = -186 + i * 50, tx = left ? x - 60 : x + 74;
        sv('line', { x1: x + p[0], y1: p[1], x2: tx + (left ? 4 : -4), y2: ly - 4, class: 'etpo-lead' }, svg);
        var words = cu[1].split(' '), l1 = [], l2 = [];
        words.forEach(function (w) { (l1.join(' ').length + w.length < 22 && !l2.length ? l1 : l2).push(w); });
        txt(svg, tx, ly, l1.join(' '), { class: 'etpo-cue', 'text-anchor': left ? 'end' : 'start' });
        if (l2.length) txt(svg, tx, ly + 14, l2.join(' '), { class: 'etpo-cue', 'text-anchor': left ? 'end' : 'start' });
      });
    }
    var checked = false;
    if (mode === 'slider' && F.interactive) {
      t = o.t != null ? +o.t : 0;
      sl = V.slider(F.ctl, { label: 'Posture', min: 0, max: 1, step: 0.02, value: t, fmt: function (v) { return v < 0.34 ? 'slumped' : v < 0.67 ? 'getting there' : 'poised'; }, input: function (v) { t = v; draw(); } });
    }
    if (mode === 'compare' && F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'etv-hint', o.ask || 'Which figure shows poise? Tap it, then Check.'), box);
      btn(F.ctl, 'Check', function () {
        if (!picked) { F.say('Tap a figure first.'); return; }
        checked = true; draw();
        F.say(picked === good ? okMark(true) + ' Yes. ' + CUES[pose].map(function (c) { return c[1]; }).join('; ') + '.' : okMark(false) + ' Look again: which one looks easy and attentive, not slumped?');
      }, 'pri');
    }
    draw();
    return { set: function (v) { t = v; if (sl) sl.set(v); draw(); } };
  });
  /* ---------- et-envelope: addressing an envelope ---------- */
  var ENV_ZONES = { ret: { x: 22, y: 22, w: 200, h: 70, label: 'Return address (yours)' }, to: { x: 190, y: 140, w: 260, h: 90, label: 'Delivery address' }, stamp: { x: 486, y: 18, w: 54, h: 64, label: 'Stamp' } };
  V.register('et-envelope', function (el, o) {
    var F = frame(el, o, 'envelope', 'An addressed envelope');
    var to = o.to || ['Ms. Nora Grant', '22 Maple Street', 'Fairview, OH 44120'], from = o.from || ['Sam Rivera', '9 Birch Road', 'Lakeside, MN 55901'];
    var mode = o.mode || 'show', mis = mode === 'spot' ? o.mistake || 'stamp-left' : null, picked = null, checked = false;
    var pos = { ret: 'ret', to: 'to', stamp: 'stamp' }; // what is drawn in each zone
    var toL = to.slice(), wrongZone = null, why = '';
    if (mis === 'stamp-left') { pos = { ret: 'stamp', to: 'to', stamp: 'ret' }; wrongZone = 'ret'; why = 'The stamp goes in the upper right corner, where the post office\'s machines look for it; your return address goes in the upper left.'; }
    if (mis === 'return-center' || mis === 'swap') { pos = { ret: 'to', to: 'ret', stamp: 'stamp' }; wrongZone = 'to'; why = 'The center is for the person receiving the letter. Your own address goes small, in the upper left, so the letter can come back to you.'; }
    if (mis === 'no-zip') { toL[toL.length - 1] = toL[toL.length - 1].replace(/\s*\d{5}(-\d{4})?\s*$/, ''); wrongZone = 'to'; why = 'The last line needs the ZIP code after the state: ' + esc(to[to.length - 1]) + '.'; }
    if (mis === 'no-title') { toL[0] = toL[0].replace(/^(Mr\.|Ms\.|Mrs\.|Mx\.|Dr\.|Miss)\s+/, ''); wrongZone = 'to'; why = 'A title and full name, like ' + esc(to[0]) + ', is the courteous way to address a letter.'; }
    var build = mode === 'build' && F.interactive && !F.quiet, placed = { ret: null, to: null, stamp: null }, sel = null;
    var svg = svgRoot(560, 260, '', 'ete-svg'); F.body.appendChild(svg);
    var tray = null;
    function block(g, what, z) {
      if (what === 'stamp') {
        var s = sv('g', { transform: 'translate(' + (z === ENV_ZONES.stamp ? z.x + z.w / 2 - 24 : z.x + 4) + ',' + (z.y + 6) + ')' }, g);
        sv('rect', { x: 0, y: 0, width: 48, height: 56, class: 'ete-stamp' }, s); sv('rect', { x: 5, y: 5, width: 38, height: 46, class: 'ete-stamp2' }, s);
        sv('circle', { cx: 24, cy: 22, r: 9, class: 'ete-sun' }, s); sv('path', { d: 'M8,48 L20,32 L28,40 L34,30 L41,48 Z', class: 'ete-hill' }, s);
        return;
      }
      var L = what === 'ret' ? from : toL, big = z === ENV_ZONES.to, lh = big ? 25 : 18;
      var right = z === ENV_ZONES.stamp; L.forEach(function (line, i) { txt(g, right ? z.x + z.w : z.x + (big ? 12 : 4), z.y + (big ? 26 : 18) + i * lh, line, { class: 'ete-addr' + (big ? ' big' : ''), 'text-anchor': right ? 'end' : 'start' }); });
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      sv('rect', { x: 4, y: 4, width: 552, height: 252, rx: 6, class: 'ete-env' }, svg);
      sv('path', { d: 'M4,6 L280,140 L556,6', class: 'ete-flap' }, svg);
      Object.keys(ENV_ZONES).forEach(function (k) {
        var z = ENV_ZONES[k], what = build ? placed[k] : pos[k], zz = ENV_ZONES[what] && what !== k && !build ? z : z;
        var g = sv('g', { class: 'ete-zone' }, svg);
        if (build || (mode === 'spot' && F.interactive && !F.quiet)) {
          var hit = sv('rect', { x: z.x - 6, y: z.y - 4, width: z.w + 12, height: z.h + 8, rx: 8, class: 'ete-hit' + (build ? ' dash' : '') + (picked === k || (build && sel !== null) ? ' sel' : '') + (checked && (build ? placed[k] : picked === k) ? ((build ? placed[k] === k : k === wrongZone) ? ' ok' : ' no') : ''), tabindex: 0, role: 'button', 'aria-label': (build ? 'Spot: ' + (k === 'ret' ? 'upper left' : k === 'to' ? 'center' : 'upper right') + (placed[k] ? ', holds the ' + ENV_ZONES[placed[k]].label.toLowerCase() : ', empty') : 'The ' + (k === 'ret' ? 'upper left' : k === 'to' ? 'center' : 'upper right') + ' of the envelope') }, g);
          var act = function () { if (build) drop(k); else { picked = k; checked = false; F.say(''); draw(); } };
          hit.addEventListener('click', act); hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        }
        if (what) block(g, what, zz);
        if (mode === 'show' && !F.quiet && o.labels !== false) { var lz = ENV_ZONES[k]; txt(svg, lz.x + (k === 'stamp' ? -6 : 0), k === 'to' ? lz.y + lz.h + 12 : lz.y + lz.h + 4, lz.label, { class: 'ete-lab', 'text-anchor': k === 'stamp' ? 'end' : 'start' }); }
      });
      svg.setAttribute('aria-label', 'An envelope. ' + (build ? 'Empty spots to fill.' : 'Upper left: ' + label(pos.ret) + '. Center: ' + label(pos.to) + '. Upper right: ' + label(pos.stamp) + '.'));
      if (tray) paintTray();
    }
    function label(what) { return what === 'stamp' ? 'a stamp' : (what === 'ret' ? from : toL).join(', '); }
    if (build) {
      F.body.insertBefore(h('p', 'etv-hint', 'Tap a block, then tap where it goes on the envelope. Then Check.'), svg);
      tray = h('div', 'ete-tray'); F.body.appendChild(tray);
      var paintTray = function () {
        tray.innerHTML = '';
        shuffle(['to', 'stamp', 'ret'], 'env').forEach(function (k) {
          var at = Object.keys(placed).filter(function (z) { return placed[z] === k; })[0]; if (at) return;
          var b = h('button', 'ete-blk', k === 'stamp' ? '<b>Stamp</b>' : '<b>' + esc((k === 'ret' ? from : to)[0]) + '</b><br>' + (k === 'ret' ? from : to).slice(1).map(esc).join('<br>')); b.type = 'button';
          b.setAttribute('aria-pressed', String(sel === k)); b.addEventListener('click', function () { sel = sel === k ? null : k; draw(); }); tray.appendChild(b);
        });
        if (!tray.children.length) tray.appendChild(h('span', 'etv-hint', 'Everything is on the envelope.'));
      };
      var drop = function (z) { if (sel === null) { if (placed[z]) { sel = placed[z]; placed[z] = null; draw(); } return; } Object.keys(placed).forEach(function (q) { if (placed[q] === sel) placed[q] = null; }); placed[z] = sel; sel = null; checked = false; F.say(''); draw(); };
      btn(F.ctl, 'Check', function () {
        if (Object.keys(placed).some(function (z) { return !placed[z]; })) { F.say('Place all three blocks first.'); return; }
        checked = true; draw(); var bad = Object.keys(placed).filter(function (z) { return placed[z] !== z; }).length;
        F.say(bad ? okMark(false) + ' Not yet. The stamp goes upper right, your address upper left, and the delivery address in the center.' : okMark(true) + ' Ready to mail.');
      }, 'pri');
      btn(F.ctl, 'Start over', function () { placed = { ret: null, to: null, stamp: null }; sel = null; checked = false; F.say(''); draw(); });
    }
    if (mode === 'spot' && F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'etv-hint', 'Something is wrong on this envelope. Tap the part that needs fixing, then Check.'), svg);
      btn(F.ctl, 'Check', function () {
        if (!picked) { F.say('Tap a part of the envelope first.'); return; }
        checked = true; draw(); F.say(picked === wrongZone ? okMark(true) + ' Yes. ' + why : okMark(false) + ' That part is fine. Look again.');
      }, 'pri');
      btn(F.ctl, 'Show me', function () { picked = wrongZone; checked = true; draw(); F.say(why); });
    }
    draw();
    return {};
  });
  /* ---------- et-chart: a printable manners chart for young children (and the icons, also used by et-sort) ---------- */
  function chartIcon(k) {
    var bub = '<path d="M6 8h36a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H20l-9 8v-8H6a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#fff4d6" stroke="#b8860b" stroke-width="2"/>';
    var I = {
      please: bub + '<text x="24" y="25" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="10" fill="#5a3ea6">please</text>',
      thanks: bub + '<path d="M24 29l-7-7a4.2 4.2 0 0 1 7-4.6 4.2 4.2 0 0 1 7 4.6z" fill="#e2574c"/>',
      sorry: bub + '<g transform="rotate(-35 24 21)"><rect x="12" y="17" width="24" height="9" rx="4.5" fill="#f0c987" stroke="#c99a4d"/><rect x="20" y="17" width="8" height="9" fill="#f6dcae"/></g>',
      excuse: bub + '<text x="24" y="19" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="8.5" fill="#5a3ea6">excuse</text><text x="24" y="29" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="8.5" fill="#5a3ea6">me</text>',
      hello: '<path d="M16 40c-4-4-7-10-7-16v-3a2.5 2.5 0 0 1 5 0v5V11a2.5 2.5 0 0 1 5 0v12V8a2.5 2.5 0 0 1 5 0v15V10a2.5 2.5 0 0 1 5 0v15 0-8a2.5 2.5 0 0 1 5 0v12c0 9-5 15-12 15z" fill="#f3d1b5" stroke="#c48a5c" stroke-width="1.6"/><path d="M40 8q4 4 3 9M37 4q7 5 6 13" fill="none" stroke="#3d8fe0" stroke-width="2" stroke-linecap="round"/>',
      wash: '<rect x="8" y="30" width="24" height="12" rx="5" fill="#f4a6c0" stroke="#c2255c"/><circle cx="14" cy="26" r="3" fill="#cfe7f7" stroke="#7fb0d6"/><circle cx="22" cy="22" r="4" fill="#cfe7f7" stroke="#7fb0d6"/><path d="M36 8q6 9 0 13q-6-4 0-13zM28 14q4 6 0 9q-4-3 0-9z" fill="#3d8fe0"/>',
      napkin: '<path d="M6 14h36L24 40z" fill="#b9a4e6" stroke="#8c75c2" stroke-width="2" stroke-linejoin="round"/><path d="M15 14l9 13 9-13" fill="none" stroke="#8c75c2" stroke-width="1.6"/>',
      chew: '<circle cx="24" cy="24" r="19" fill="#f3d1b5" stroke="#c48a5c" stroke-width="1.6"/><circle cx="17" cy="20" r="2.4" fill="#2b2420"/><circle cx="31" cy="20" r="2.4" fill="#2b2420"/><path d="M15 29q9 7 18 0" fill="none" stroke="#c2255c" stroke-width="3" stroke-linecap="round"/>',
      turns: '<path d="M10 22a14 14 0 0 1 24-9" fill="none" stroke="#00703c" stroke-width="3.4" stroke-linecap="round"/><path d="M36 6v9h-9" fill="none" stroke="#00703c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 26a14 14 0 0 1-24 9" fill="none" stroke="#e8590c" stroke-width="3.4" stroke-linecap="round"/><path d="M12 42v-9h9" fill="none" stroke="#e8590c" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
      share: '<path d="M22 8a16 16 0 0 0 0 32l3-7-4-5 4-6-3-6 3-6z" fill="#d99a4e" stroke="#9c6a2f" stroke-width="1.6"/><path d="M28 8a16 16 0 0 1 0 32l3-7-4-5 4-6-3-6 3-6z" transform="translate(2 0)" fill="#d99a4e" stroke="#9c6a2f" stroke-width="1.6"/><circle cx="15" cy="18" r="2" fill="#5b3b22"/><circle cx="15" cy="30" r="2" fill="#5b3b22"/><circle cx="37" cy="22" r="2" fill="#5b3b22"/>',
      listen: '<path d="M30 40c-4 0-5-4-7-7s-8-6-8-14a11 11 0 0 1 22 0c0 5-4 7-4 10" fill="#f3d1b5" stroke="#c48a5c" stroke-width="2" stroke-linecap="round"/><path d="M21 19a5 5 0 0 1 10 0c0 3-3 4-3 6" fill="none" stroke="#c48a5c" stroke-width="2" stroke-linecap="round"/><path d="M41 12q4 7 0 14" fill="none" stroke="#3d8fe0" stroke-width="2.2" stroke-linecap="round"/>',
      voice: '<path d="M8 19h7l9-8v26l-9-8H8z" fill="#7fb0d6" stroke="#2f7fd0" stroke-width="2" stroke-linejoin="round"/><path d="M30 19q3 5 0 10" fill="none" stroke="#2f7fd0" stroke-width="2.4" stroke-linecap="round"/><text x="38" y="14" font-family="system-ui,sans-serif" font-weight="700" font-size="9" fill="#5a3ea6">shh</text>',
      tidy: '<rect x="8" y="24" width="32" height="18" rx="2" fill="#c8a06a" stroke="#8a6a3c" stroke-width="2"/><rect x="12" y="16" width="9" height="9" fill="#e2574c"/><circle cx="31" cy="18" r="6" fill="#3d8fe0"/><path d="M24 4v8m-3-3 3 3 3-3" fill="none" stroke="#5a3ea6" stroke-width="2" stroke-linecap="round"/>',
      help: '<path d="M24 26l-8-8a5 5 0 0 1 8-6 5 5 0 0 1 8 6z" fill="#e2574c"/><path d="M6 34q8-4 14 0h10a3 3 0 0 1 0 6H18m16-2 6-4a3 3 0 0 1 3 5l-8 6H8" fill="#f3d1b5" stroke="#c48a5c" stroke-width="1.8" stroke-linejoin="round"/>',
      excused: '<path d="M14 6v34M14 24h20v16M14 24v16" fill="none" stroke="#8f6440" stroke-width="3.4" stroke-linecap="round"/><rect x="12" y="21" width="24" height="5" rx="2" fill="#b7865a"/><path d="M42 30h-6m2-3 -3 3 3 3" fill="none" stroke="#5a3ea6" stroke-width="2" stroke-linecap="round"/>',
      cover: '<rect x="8" y="22" width="32" height="18" rx="3" fill="#7fb0d6" stroke="#2f7fd0" stroke-width="2"/><path d="M18 22q-4-14 6-16q10 2 6 16z" fill="#fff" stroke="#9aa3ad" stroke-width="1.6"/>'
    };
    return '<svg viewBox="0 0 48 48" class="etc-icon" aria-hidden="true" focusable="false">' + (I[k] || I.please) + '</svg>';
  }
  var DAYS7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  V.register('et-chart', function (el, o) {
    var F = frame(el, o, 'chart', 'A manners chart');
    var items = (o.items || ['please', 'thanks', 'excuse', 'turns', 'napkin', 'tidy']).filter(function (k) { return ET.CHART[k]; }), days = DAYS7.slice(0, o.days === 5 ? 5 : 7);
    var live = F.interactive && !F.quiet, stars = {};
    var card = h('div', 'etc-card'); F.body.appendChild(card);
    card.appendChild(h('p', 'etc-title', esc(o.title || 'My Manners Chart')));
    if (o.name !== false) card.appendChild(h('p', 'etc-name', 'Name: <span class="etc-blank"></span>'));
    var tb = h('table', 'etc-table'), thead = h('thead'), tr = h('tr');
    tr.appendChild(h('th', 'etc-hab', '<span class="etc-sr">Habit</span>')); days.forEach(function (d) { tr.appendChild(h('th', '', d)); }); thead.appendChild(tr); tb.appendChild(thead);
    var tbody = h('tbody'); tb.appendChild(tbody);
    items.forEach(function (k) {
      var r = h('tr'); r.appendChild(h('th', 'etc-hab', '<div class="etc-habi">' + chartIcon(k) + '<span>' + esc(ET.CHART[k]) + '</span></div>'));
      days.forEach(function (d) {
        var td = h('td');
        if (live) {
          var b = h('button', 'etc-cell', ''); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', ET.CHART[k] + ', ' + d);
          b.addEventListener('click', function () { var on = !stars[k + d]; stars[k + d] = on; b.setAttribute('aria-pressed', String(on)); b.innerHTML = on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#f6c445" stroke="#b8860b" stroke-width="1.2"/></svg>' : ''; });
          td.appendChild(b);
        } else td.appendChild(h('span', 'etc-cell etc-empty'));
        r.appendChild(td);
      });
      tbody.appendChild(r);
    });
    var sc = h('div', 'etc-scroll'); sc.appendChild(tb); card.appendChild(sc);
    card.appendChild(h('p', 'etc-foot', 'Kind words and kind habits, every day. · Teddy Rook Book'));
    if (live && o.print !== false) btn(F.ctl, '🖨 Print this chart', function () {
      var root = D.documentElement; card.classList.add('etc-print-me'); root.classList.add('etc-printing');
      var done = function () { card.classList.remove('etc-print-me'); root.classList.remove('etc-printing'); W.removeEventListener('afterprint', done); };
      W.addEventListener('afterprint', done); try { W.print(); } catch (e) { } setTimeout(function () { if (!W.matchMedia || !W.matchMedia('print').matches) done(); }, 1500);
    });
    if (live) F.body.insertBefore(h('p', 'etv-hint', 'Tap a box to give a star.'), card);
    return { stars: function () { return Object.keys(stars).filter(function (k) { return stars[k]; }); } };
  });
  /* ---------- et-text: a phone screen with texts, a group chat or an email, and a reply to choose ---------- */
  var NAMEC = ['#c2255c', '#1c6fd6', '#00703c', '#b8600b', '#7048e8', '#0c8599'];
  V.register('et-text', function (el, o) {
    var F = frame(el, o, 'text', 'Messages on a phone');
    var kind = o.kind || 'text', msgs = (o.messages || []).slice(), mode = o.mode || (o.choices ? 'reply' : 'show');
    var phone = h('div', 'etx-phone etx-' + kind); F.body.appendChild(phone);
    var head = h('div', 'etx-head'); phone.appendChild(head);
    var thread = h('div', 'etx-thread'); thread.setAttribute('role', 'log'); phone.appendChild(thread);
    var senders = []; msgs.forEach(function (m) { if (!m.me && m.from && senders.indexOf(m.from) < 0) senders.push(m.from); });
    head.innerHTML = kind === 'email' ? '<span class="etx-mail">✉</span><span><b>' + esc(o.title || 'No subject') + '</b><small>' + (o.to ? 'To: ' + esc(o.to) : '') + '</small></span>'
      : '<span class="etx-dot" style="background:' + NAMEC[0] + '">' + esc((o.title || senders[0] || '?').charAt(0)) + '</span><span><b>' + esc(o.title || senders.join(', ') || 'Messages') + '</b>' + (kind === 'group' ? '<small>' + plural(senders.length + 1, 'person', 'people') + '</small>' : '') + '</span>';
    var fault = [].concat(o.fault == null ? [] : o.fault), picked = null, checked = false, reply = null;
    function paint() {
      thread.innerHTML = '';
      var all = msgs.concat(reply ? [reply] : []);
      all.forEach(function (m, i) {
        if (kind === 'email') { var em = h('div', 'etx-email' + (m.me ? ' me' : ''), '<p class="etx-from"><b>' + esc(m.me ? 'You' : m.from || '') + '</b>' + (m.time ? ' <small>' + esc(m.time) + '</small>' : '') + '</p><div class="etx-body">' + m.text + '</div>'); thread.appendChild(em); if (m._note) thread.appendChild(m._note); return; }
        var row = h('div', 'etx-row' + (m.me ? ' me' : '')), ci = senders.indexOf(m.from);
        var spotOn = mode === 'spot' && F.interactive && !F.quiet && i < msgs.length;
        var b = h(spotOn ? 'button' : 'div', 'etx-bub' + (m.me ? ' me' : '') + (picked === i ? ' sel' : '') + (checked && picked === i ? (fault.indexOf(i) >= 0 ? ' ok' : ' no') : ''));
        if (spotOn) { b.type = 'button'; b.setAttribute('aria-pressed', String(picked === i)); b.addEventListener('click', function () { picked = i; checked = false; F.say(''); paint(); }); }
        b.innerHTML = (kind === 'group' && !m.me ? '<span class="etx-who" style="color:' + NAMEC[ci % NAMEC.length] + '">' + esc(m.from) + '</span>' : '') + m.text;
        row.appendChild(b); if (m.time) row.appendChild(h('span', 'etx-time', esc(m.time)));
        thread.appendChild(row);
        if (m._note) thread.appendChild(m._note);
      });
      if (o.typing) thread.appendChild(h('div', 'etx-row', '<div class="etx-bub etx-typing" aria-label="typing"><i></i><i></i><i></i></div>'));
      phone.setAttribute('aria-label', (kind === 'email' ? 'An email' : kind === 'group' ? 'A group chat' : 'A text conversation') + ': ' + all.map(function (m) { return (m.me ? 'You' : m.from || '') + ': ' + String(m.text).replace(/<[^>]+>/g, ''); }).join(' / '));
    }
    var choices = o.choices || [];
    if (mode === 'reply' && choices.length && !F.quiet) {
      var box = h('div', 'etx-choices'); F.body.appendChild(box);
      box.appendChild(h('p', 'etv-prompt', esc(o.prompt || 'Which reply is best?')));
      choices.forEach(function (c, i) {
        var b = h('button', 'etv-choice', '<span class="etv-chl">' + letter(i) + '</span><span>' + c.text + '</span>'); b.type = 'button'; if (!F.interactive) b.disabled = true;
        b.addEventListener('click', function () {
          [].forEach.call(box.querySelectorAll('.etv-choice'), function (x) { x.setAttribute('aria-pressed', 'false'); x.classList.remove('ok', 'no'); });
          b.setAttribute('aria-pressed', 'true'); b.classList.add(c.ok ? 'ok' : 'no');
          var note = h('p', 'etx-note ' + (c.ok ? 'ok' : 'no'), okMark(!!c.ok) + ' ' + (c.why || (c.ok ? 'Clear and kind.' : 'That could land badly.')));
          reply = { me: true, text: c.text, time: 'now', _note: note }; paint();
          thread.scrollTop = thread.scrollHeight;
        });
        box.appendChild(b);
      });
    }
    if (mode === 'spot' && F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'etv-hint', o.ask || 'Tap the message that is unkind or unwise, then Check.'), phone);
      btn(F.ctl, 'Check', function () {
        if (picked === null) { F.say('Tap a message first.'); return; }
        checked = true; paint(); F.say(fault.indexOf(picked) >= 0 ? okMark(true) + ' Yes. ' + (o.why || '') : okMark(false) + ' That message is fine. Look again.');
      }, 'pri');
    }
    paint();
    F.speak(function () { return msgs.map(function (m) { return (m.me ? 'You' : m.from) + ' wrote: ' + m.text; }).join('. '); });
    return {};
  });
  /* ---------- et-flag: the U.S. flag displayed under the Flag Code (4 U.S.C. ch. 1) ---------- */
  function star(g, cx, cy, r, cls) { var p = []; for (var i = 0; i < 10; i++) { var a = -M.PI / 2 + i * M.PI / 5, rr = i % 2 ? r * 0.382 : r; p.push((cx + M.cos(a) * rr).toFixed(2) + ',' + (cy + M.sin(a) * rr).toFixed(2)); } sv('polygon', { points: p.join(' '), class: cls || 'etf-star' }, g); }
  // the flag with its union at the top left as seen (mirror: at the top right; flipV: at the bottom, upside down)
  function usFlag(parent, x, y, w, o) {
    o = o || {}; var g = sv('g', { class: 'etf-us', transform: 'translate(' + x + ',' + y + ')' }, parent), vert = !!o.vertical;
    var A = vert ? w : w / 1.9, B = vert ? w * 1.9 : w; // A: hoist (height of a horizontal flag), B: fly
    var hoist = vert ? w : A, fly = vert ? w * 1.9 : w, W2 = vert ? hoist : fly, H2 = vert ? fly : hoist;
    var inner = sv('g', { transform: (o.mirror ? 'translate(' + W2 + ',0) scale(-1,1) ' : '') + (o.flipV ? 'translate(0,' + H2 + ') scale(1,-1)' : '') }, g);
    sv('rect', { x: 0, y: 0, width: W2, height: H2, class: 'etf-white' }, inner);
    for (var i = 0; i < 13; i += 2) { if (vert) sv('rect', { x: i * hoist / 13, y: 0, width: hoist / 13, height: fly, class: 'etf-red' }, inner); else sv('rect', { x: 0, y: i * hoist / 13, width: fly, height: hoist / 13, class: 'etf-red' }, inner); }
    var uh = hoist * 7 / 13, uf = fly * 0.76 / 1.9;
    if (vert) sv('rect', { x: 0, y: 0, width: uh, height: uf, class: 'etf-blue' }, inner); else sv('rect', { x: 0, y: 0, width: uf, height: uh, class: 'etf-blue' }, inner);
    var sr = hoist * 0.0616 / 2 * 1.15;
    for (var j = 1; j <= 9; j++) for (var k = 1; k <= 11; k++) if ((j + k) % 2 === 0) {
      var sy = j * hoist * 0.054, sx = k * hoist * 0.063; // along the hoist (j) and along the fly (k)
      if (vert) star(inner, sy, sx, sr); else star(inner, sx, sy, sr);
    }
    sv('rect', { x: 0, y: 0, width: W2, height: H2, class: 'etf-edge' }, g);
    void A; void B; return { w: W2, h: H2 };
  }
  function otherFlag(parent, x, y, w, mirror) { var g = sv('g', { transform: 'translate(' + x + ',' + y + ')' }, parent), hh = w / 1.6; sv('rect', { x: 0, y: 0, width: w, height: hh, class: 'etf-other' }, g); sv('circle', { cx: mirror ? w * 0.6 : w * 0.4, cy: hh / 2, r: hh * 0.26, class: 'etf-otherc' }, g); star(g, mirror ? w * 0.6 : w * 0.4, hh / 2, hh * 0.17, 'etf-otherst'); sv('rect', { x: 0, y: 0, width: w, height: hh, class: 'etf-edge' }, g); }
  function drawFlagScene(svg, show, wrong, step) {
    sv('rect', { x: 0, y: 0, width: 360, height: 260, class: show === 'staff' || show === 'half' ? 'etf-sky' : 'etf-wall' }, svg);
    if (show === 'wall') usFlag(svg, 60, 60, 240, { mirror: wrong });
    else if (show === 'vertical') usFlag(svg, 141, 20, 116, { mirror: wrong, vertical: true });
    else if (show === 'staff' || show === 'half') {
      sv('rect', { x: 0, y: 236, width: 360, height: 24, class: 'etf-grass' }, svg);
      sv('rect', { x: 96, y: 14, width: 6, height: 226, class: 'etf-pole' }, svg); sv('circle', { cx: 99, cy: 12, r: 6, class: 'etf-finial' }, svg);
      var top = show === 'staff' ? 22 : step === 0 ? 22 : step === 1 ? 70 : 113;
      usFlag(svg, 102, top, 150, { flipV: show === 'staff' && wrong });
      if (show === 'half') { sv('path', { d: 'M90,22 v220', class: 'etf-guide' }, svg); txt(svg, 112, top + 96, step === 0 ? '1. Up to the peak' : step === 1 ? '2. Lower it slowly' : '3. At half-staff', { class: 'etf-steplab' }); }
    } else if (show === 'crossed') { // the U.S. flag on its own right (the viewer's left), its staff in front
      var usLeft = !wrong;
      sv('line', { x1: usLeft ? 320 : 40, y1: 94, x2: usLeft ? 110 : 250, y2: 236, class: 'etf-pole2' }, svg); // the staff behind
      sv('line', { x1: usLeft ? 320 : 40, y1: 30, x2: usLeft ? 320 : 40, y2: 94, class: 'etf-pole2' }, svg);
      if (usLeft) { otherFlag(svg, 210, 36, 110, true); usFlag(svg, 40, 36, 110); }
      else { otherFlag(svg, 40, 36, 110, false); usFlag(svg, 210, 36, 110, { mirror: true }); }
      sv('line', { x1: usLeft ? 40 : 320, y1: 94, x2: usLeft ? 250 : 110, y2: 236, class: 'etf-pole2 front' }, svg);
      sv('line', { x1: usLeft ? 40 : 320, y1: 30, x2: usLeft ? 40 : 320, y2: 94, class: 'etf-pole2 front' }, svg);
      sv('circle', { cx: 40, cy: 28, r: 5, class: 'etf-finial' }, svg); sv('circle', { cx: 320, cy: 28, r: 5, class: 'etf-finial' }, svg);
    } else if (show === 'platform') {
      sv('rect', { x: 0, y: 200, width: 360, height: 60, class: 'etf-stage' }, svg);
      var fx = wrong ? 290 : 60;
      sv('rect', { x: fx, y: 26, width: 5, height: 190, class: 'etf-pole' }, svg); sv('circle', { cx: fx + 2.5, cy: 24, r: 5, class: 'etf-finial' }, svg);
      usFlag(svg, fx + 5, 30, 60);
      var pg = sv('g', { transform: 'translate(180,232)' }, svg); drawPerson(pg, { who: 'nora', mood: 'happy' });
      sv('path', { d: 'M138,138 L222,138 L212,218 L148,218 Z', class: 'etf-podium' }, svg); sv('rect', { x: 132, y: 128, width: 96, height: 12, rx: 3, class: 'etf-podtop' }, svg);
      txt(svg, 180, 252, 'Audience', { class: 'etf-steplab', 'text-anchor': 'middle' });
    }
  }
  V.register('et-flag', function (el, o) {
    var F = frame(el, o, 'flag', 'The U.S. flag');
    var show = o.show || 'wall', step = o.steps && show === 'half' ? 0 : 2, picked = null, checked = false, right = (o.right || 'A').toUpperCase();
    var box = h('div', 'etf-box' + (o.compare ? ' two' : '')); F.body.appendChild(box);
    var DESC = { wall: 'on a wall, horizontal', vertical: 'hanging vertically on a wall', staff: 'on a staff', half: 'at half-staff', crossed: 'with another flag on crossed staffs', platform: 'on a staff beside a speaker on a platform' };
    function draw() {
      box.innerHTML = '';
      (o.compare ? ['A', 'B'] : ['']).forEach(function (L) {
        var cell = h('figure', 'etf-cell'), svg = svgRoot(360, 260, '', 'etf-svg'); cell.appendChild(svg); box.appendChild(cell);
        var wrong = o.compare ? L !== right : !!o.wrong;
        drawFlagScene(svg, show, wrong, step);
        svg.setAttribute('aria-label', (L ? 'Picture ' + L + ': ' : '') + 'The U.S. flag ' + DESC[show] + (F.quiet || o.compare ? '' : wrong ? ', shown the wrong way' : ', shown the right way') + '.');
        if (L) {
          var cap = h('figcaption', 'etf-cap' + (checked && picked === L ? (L === right ? ' ok' : ' no') : ''), '<b>' + L + '</b>' + (checked && !F.quiet ? (L === right ? ' Correct' : ' Not this way') : ''));
          cell.appendChild(cap);
          if (F.interactive && !F.quiet) { cell.tabIndex = 0; cell.setAttribute('role', 'button'); cell.setAttribute('aria-pressed', String(picked === L)); var pick = function () { picked = L; checked = false; F.say(''); draw(); }; cell.addEventListener('click', pick); cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }); }
        } else if (!F.quiet && o.wrong !== undefined) cell.appendChild(h('figcaption', 'etf-cap ' + (wrong ? 'no' : 'ok'), wrong ? okMark(false) + ' Not this way.' : okMark(true) + ' The right way.'));
      });
    }
    var ruleKey = show === 'vertical' ? 'wall' : show;
    if (!F.quiet && o.rule !== false) F.body.appendChild(h('p', 'etf-rule', ET.FLAG[ruleKey] || ''));
    if (o.steps && show === 'half' && F.interactive) {
      var nb = h('div', 'etv-nav'); F.body.appendChild(nb);
      var bb = btn(nb, '◀ Back', function () { if (step > 0) { step--; draw(); upd(); } }), nn = h('span', 'etv-navn'), ff = btn(nb, 'Next ▶', function () { if (step < 2) { step++; draw(); upd(); } }, 'pri'); nb.insertBefore(nn, ff);
      var upd = function () { nn.textContent = (step + 1) + ' of 3'; bb.disabled = step === 0; ff.disabled = step === 2; }; upd();
    }
    if (o.compare && F.interactive && !F.quiet) {
      F.body.insertBefore(h('p', 'etv-hint', o.ask || 'Which picture follows the Flag Code? Tap it, then Check.'), box);
      btn(F.ctl, 'Check', function () { if (!picked) { F.say('Tap a picture first.'); return; } checked = true; draw(); F.say(picked === right ? okMark(true) + ' Yes.' : okMark(false) + ' Look at where the blue union is.'); }, 'pri');
    }
    draw();
    return {};
  });
})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);
