/* First Writing (Writing & Grammar Ladder, course key fwr): problem generators.
   All 46 topics. The first six (what-is-a-sentence … exclamations) are the designer's model; the other forty follow them in
   the same style (conventions: /tmp/work_writing/overview.md; sources and tests: /tmp/work_fwr/).
   Children of 6 to 9 answer by choosing, not typing: mc with two or three choices at level 1 (keep: true when the order
   matters, as for end marks), three at level 2, and level 3 asks for the same idea in a harder shape (the one mistake in a
   longer piece, a choice that matches the trouble note, a numbered gap in a quiet wr-punct). Questions put the words to
   judge in <span class="wr-big">…</span>; level 1 adds a note for the grown-up (class wr-readme). Pictures come from the
   kit's quiet wr-picture, built from the same data as the sentence, so the picture and the answer agree. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function W() { return ML.writing; } // the kit's model (loaded on every Writing page and by check-gen)

  /* ---------------------------------------------------------------- shared helpers */
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function low(s) { s = String(s); return s.charAt(0).toLowerCase() + s.slice(1); }
  function big(s) { return '<span class="wr-big">' + s + '</span>'; }
  function readme(level, text) { return level === 1 ? '<p class="wr-readme"><b>For the grown-up</b> ' + (text || 'Read the question and the choices aloud.') + '</p>' : ''; }
  function q(lines) { return lines.filter(Boolean).join(''); }
  function para(s) { return '<p>' + s + '</p>'; }
  // a multiple-choice answer: right first, then the wrong ones; keep: true keeps the order shown
  function mc(right, wrong, keep) { var ch = [right].concat(wrong); return keep ? { t: 'mc', choices: ch, v: 0, keep: true } : { t: 'mc', choices: ch, v: 0 }; }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  var YESNO = ['Yes', 'No'];
  function pic(place, items) { return { name: 'wr-picture', opts: { place: place, items: items, quiet: true, interactive: false } }; }

  /* ---------------------------------------------------------------- sentence banks (original sentences) */
  // telling sentences, each with a picture made from the same parts: subject, verb, where, the picture's place and items
  var TELL = [
    { s: 'The dog', v: 'digs', w: 'in the yard', place: 'yard', items: [{ k: 'dog', x: 40, y: 88 }, { k: 'bone', x: 62, y: 92, s: 0.6 }] },
    { s: 'The cat', v: 'sleeps', w: 'on the bed', place: 'room', items: [{ k: 'bed', x: 50, y: 92, s: 1.8 }, { k: 'cat', x: 50, y: 72, s: 0.8 }] },
    { s: 'A frog', v: 'jumps', w: 'into the pond', place: 'pond', items: [{ k: 'frog', x: 45, y: 80 }] },
    { s: 'The girl', v: 'reads', w: 'under a tree', place: 'park', items: [{ k: 'tree', x: 30, y: 78, s: 1.8 }, { k: 'girl', x: 52, y: 90 }, { k: 'book', x: 64, y: 92, s: 0.5 }] },
    { s: 'The boy', v: 'kicks', w: 'the ball', place: 'park', items: [{ k: 'boy', x: 40, y: 88 }, { k: 'ball', x: 62, y: 92, s: 0.6 }] },
    { s: 'Grandma', v: 'bakes', w: 'a cake', place: 'kitchen', items: [{ k: 'grandma', x: 38, y: 86 }, { k: 'cake', x: 66, y: 62, s: 0.8 }] },
    { s: 'The duck', v: 'swims', w: 'on the pond', place: 'pond', items: [{ k: 'duck', x: 55, y: 84 }] },
    { s: 'A bird', v: 'sings', w: 'in the tree', place: 'park', items: [{ k: 'tree', x: 45, y: 80, s: 2.2 }, { k: 'bird', x: 52, y: 40, s: 0.6 }] },
    { s: 'The horse', v: 'eats', w: 'on the farm', place: 'farm', items: [{ k: 'horse', x: 40, y: 88 }, { k: 'carrot', x: 60, y: 92, s: 0.5 }] },
    { s: 'The rabbit', v: 'hops', w: 'in the snow', place: 'snow', items: [{ k: 'rabbit', x: 45, y: 88 }, { k: 'snowman', x: 72, y: 86, s: 1.2 }] },
    { s: 'Grandpa', v: 'fishes', w: 'by the pond', place: 'pond', items: [{ k: 'grandpa', x: 25, y: 76 }, { k: 'fish', x: 60, y: 92, s: 0.6 }] },
    { s: 'The bear', v: 'naps', w: 'at night', place: 'night', items: [{ k: 'moon', x: 80, y: 28, s: 0.8 }, { k: 'bear', x: 45, y: 90 }] },
    { s: 'A boat', v: 'sails', w: 'on the sea', place: 'beach', items: [{ k: 'boat', x: 55, y: 58, s: 1.2 }] },
    { s: 'The cow', v: 'sleeps', w: 'in the field', place: 'farm', items: [{ k: 'cow', x: 40, y: 90 }] },
    { s: 'The boy', v: 'paints', w: 'a picture', place: 'classroom', items: [{ k: 'boy', x: 40, y: 92 }, { k: 'paint', x: 62, y: 90, s: 0.7 }] },
    { s: 'The girl', v: 'flies', w: 'a kite', place: 'park', items: [{ k: 'girl', x: 40, y: 90 }, { k: 'kite', x: 68, y: 30, s: 0.9 }] }
  ];
  function full(t) { return t.s + ' ' + t.v + ' ' + t.w + '.'; }
  // pieces that are not sentences: only the who (a naming part), only the action, only the where
  var ADJ = ['big', 'little', 'happy', 'sleepy', 'brown', 'tiny', 'funny', 'old'];
  function fragments(t, R) {
    var who = t.s.split(' '), adj = R.pick(ADJ);
    var named = who.length > 1 ? who[0] + ' ' + adj + ' ' + who[1] + '.' : t.s + ' and ' + R.pick(['Grandpa', 'Mom', 'the dog', 'Sam']) + '.';
    return { who: named, does: cap(t.v + ' ' + t.w) + '.', where: cap(t.w) + '.' };
  }
  var ASK = ['Where is my red hat', 'Can we go to the park', 'Do you like apples', 'What is your name', 'Who ate the last cookie', 'Is it raining outside',
    'May I have some milk', 'How old is your dog', 'When will the bus come', 'Did you see the moon', 'Will you play with me', 'Why is the baby crying',
    'Which book do you want', 'Are the ducks hungry', 'Have you fed the cat'];
  // telling sentences that contain a question word (the trouble spot: they end with a period)
  var TELL_QWORD = ['I know where the ball is', 'Mom asked who was at the door', 'I wonder what is in the box', 'We saw how the bird built its nest',
    'Dad told us when the bus would come', 'I know why the dog is barking', 'She asked which way to go'];
  var EXCL = [
    { t: 'Wow, the cake is huge', place: 'kitchen', items: [{ k: 'cake', x: 50, y: 70, s: 1.6 }] },
    { t: 'Look out, a bee is coming', place: 'park', items: [{ e: '🐝', x: 60, y: 45, s: 0.9 }, { k: 'boy', x: 30, y: 90 }] },
    { t: 'We won the game', place: 'park', items: [{ e: '🏆', x: 50, y: 70, s: 1.2 }] },
    { t: 'Ouch, that pan is hot', place: 'kitchen', items: [{ e: '🍳', x: 55, y: 66, s: 1.1 }] },
    { t: 'Hooray, it snowed', place: 'snow', items: [{ k: 'girl', x: 40, y: 88 }, { k: 'snowman', x: 68, y: 86, s: 1.2 }] },
    { t: 'Yikes, the milk spilled', place: 'kitchen', items: [{ k: 'milk', x: 50, y: 66, s: 1 }] },
    { t: 'Help, my kite is stuck in the tree', place: 'park', items: [{ k: 'tree', x: 55, y: 80, s: 2.2 }, { k: 'kite', x: 58, y: 36, s: 0.6 }, { k: 'boy', x: 25, y: 90 }] },
    { t: 'What a big fish', place: 'pond', items: [{ k: 'fish', x: 50, y: 80, s: 1.6 }] },
    { t: 'What a funny hat', place: 'room', items: [{ k: 'hat', x: 50, y: 70, s: 1.4 }] },
    { t: 'I love this song', place: 'room', items: [{ k: 'guitar', x: 50, y: 78, s: 1.2 }] },
    { t: 'Our puppy is so cute', place: 'yard', items: [{ k: 'dog', x: 50, y: 88, s: 1.2 }] },
    { t: 'Watch out for the puddle', place: 'park', items: [{ k: 'rain', x: 50, y: 40, s: 1 }] }
  ];
  var KIND_NAMES = ['telling sentence', 'asking sentence', 'exclamation'];

  /* ---------------------------------------------------------------- fwr.what-is-a-sentence */
  G('fwr.what-is-a-sentence', function (R, ctx) {
    var t = R.pick(TELL), F = fragments(t, R), L = ctx.level;
    var kinds = [['who', 'It tells who or what, but not what happens.'], ['does', 'It tells what happens, but not who or what does it.'], ['where', 'It tells where, but not who or what, and not what happens.']];
    var shape = ML.byLevel(ctx, R.pick(['yesno', 'pick2']), R.pick(['pick3', 'yesno']), R.pick(['missing', 'finish', 'pick3']));
    if (shape === 'yesno') {
      var isFull = R.coin(), k = R.pick(kinds), text = isFull ? full(t) : F[k[0]];
      return { q: q([readme(L), para(big('Is this a sentence?')), para(big(text))]), a: mcKeep(YESNO, isFull ? 0 : 1), viz: pic(t.place, t.items),
        hint: 'Ask two questions: Who or what? What happens?',
        steps: isFull ? ['Who or what? ' + t.s + '.', 'What happens? It ' + t.v + ' ' + t.w + '.', 'It tells a whole idea, so yes, it is a sentence.'] : ['Who or what? What happens?', k[1], 'It is only part of an idea, so it is not a sentence.'] };
    }
    if (shape === 'pick2' || shape === 'pick3') {
      var wrong = shape === 'pick2' ? [F[R.pick(['who', 'does'])]] : R.sample([F.who, F.does, F.where], 2);
      return { q: q([readme(L), para(big('Which one is a sentence?'))]), a: mc(full(t), wrong), viz: pic(t.place, t.items),
        hint: 'A sentence tells who or what, and what happens.',
        steps: ['Check each one: does it tell who or what, and what happens?', '“' + full(t) + '” tells who (' + low(t.s) + ') and what happens (' + t.v + ').', 'The others are only parts of an idea.'] };
    }
    if (shape === 'missing') {
      var which = R.pick(['who', 'does']);
      return { q: q([para('This is not a sentence yet:'), para(big(F[which])), para('What is missing?')]),
        a: mcKeep(['who or what', 'what happens'], which === 'who' ? 1 : 0),
        hint: 'Does it name someone or something? Does it say what happens?',
        steps: which === 'who' ? ['“' + F.who + '” names who or what.', 'It never says what happens.', 'So the missing part is what happens: “' + t.s + ' ' + t.v + ' ' + t.w + '.”'] : ['“' + F.does + '” tells what happens.', 'It never says who or what does it.', 'So the missing part is who or what: “' + full(t) + '”'] };
    }
    // finish: choose the words that make the start a sentence (the wrong ones add words but no action)
    var where = R.pick(TELL.filter(function (x) { return /^(in|on|under|by|at|into) /.test(x.w) && x.w !== t.w; })).w;
    var wrongs = [where + '.', 'and ' + R.pick(['the cat', 'a duck', 'my sister', 'his friend']) + '.'];
    return { q: q([para('Which words finish this sentence?'), para(big(t.s + ' …')), para('Choose the words that tell what happens.')]), a: mc(t.v + ' ' + t.w + '.', wrongs), viz: pic(t.place, t.items),
      hint: 'The sentence already says who. It still needs what happens.',
      steps: ['“' + t.s + '” tells who or what.', 'It still needs what happens.', '“' + t.v + ' ' + t.w + '” tells what happens: ' + full(t), '“' + t.s + ' ' + wrongs[0] + '” and “' + t.s + ' ' + wrongs[1] + '” still don’t say what happens.'] };
  });

  /* ---------------------------------------------------------------- fwr.word-order */
  // scramble a sentence's words (no end mark), never in the right order
  function scramble(words, R) { for (var i = 0; i < 12; i++) { var s = R.shuffle(words); if (s.join(' ') !== words.join(' ')) return s; } return words.slice(1).concat(words[0]); }
  function sentenceOf(words) { var s = words.join(' '); return cap(s) + '.'; }
  G('fwr.word-order', function (R, ctx) {
    var t = R.pick(TELL), words = (low(t.s) + ' ' + t.v + ' ' + t.w).split(' '), right = sentenceOf(words), L = ctx.level;
    var wrong = [];
    while (wrong.length < (L === 1 ? 1 : 3)) { var sc = sentenceOf(scramble(words, R)); if (sc !== right && wrong.indexOf(sc) < 0) wrong.push(sc); }
    if (L < 3) {
      // a common mistake as one choice: the action first ("Digs the dog in the yard.")
      if (L === 2) { var actFirst = sentenceOf([t.v].concat(low(t.s).split(' '), t.w.split(' '))); if (wrong.indexOf(actFirst) < 0 && actFirst !== right) wrong[0] = actFirst; }
      return { q: q([readme(L), para(big('Which words are in the right order?'))]), a: mc(right, wrong.slice(0, L === 1 ? 1 : 2)), viz: pic(t.place, t.items),
        hint: 'Read each one aloud. Which one sounds like talking?',
        steps: ['Start with who or what: ' + low(t.s) + '.', 'Then what happens: ' + t.v + '.', 'Then where or what: ' + t.w + '.', 'So: ' + right] };
    }
    // level 3: word cards lettered A, B, C… in a jumbled order; choose the order that makes the sentence.
    // Only sentences with no repeated word, so exactly one order of letters is right.
    var u = R.pick(TELL.filter(function (x) { var ws = (x.s + ' ' + x.v + ' ' + x.w).toLowerCase().split(' '); return ws.every(function (w, i) { return ws.indexOf(w) === i; }); }));
    var uw = (low(u.s) + ' ' + u.v + ' ' + u.w).split(' '), idx = uw.map(function (w, i) { return i; }), perm = scramble(idx, R);
    var code = uw.map(function (w, j) { return String.fromCharCode(65 + perm.indexOf(j)); });
    var rightCode = code.join(' '), wrongCodes = [];
    while (wrongCodes.length < 3) { var c = R.shuffle(code).join(' '); if (c !== rightCode && wrongCodes.indexOf(c) < 0) wrongCodes.push(c); }
    return { q: q([para('Put the word cards in order to make a sentence. Which order is right?')]), a: mc(rightCode, wrongCodes),
      viz: { name: 'wr-order', opts: { items: uw, start: perm, quiet: true, interactive: false } },
      hint: 'Find who or what first. Then find what happens.',
      steps: ['Who or what? “' + low(u.s) + '”.', 'What happens? “' + u.v + '”, then “' + u.w + '”.', 'The sentence is “' + sentenceOf(uw) + '”', 'In card letters: ' + rightCode + '.'] };
  });

  /* ---------------------------------------------------------------- fwr.capital-start */
  G('fwr.capital-start', function (R, ctx) {
    var t = R.pick(TELL), s = full(t), L = ctx.level;
    var shape = ML.byLevel(ctx, R.pick(['pick', 'yesno']), R.pick(['pick3', 'yesno']), R.pick(['second', 'second', 'yesno2']));
    var lower = low(s);
    if (shape === 'yesno') {
      var ok = R.coin(), shown = ok ? s : lower;
      return { q: q([readme(L), para(big('Does this sentence start the right way?')), para(big(shown))]), a: mcKeep(YESNO, ok ? 0 : 1),
        hint: 'Look at the very first letter.', steps: ['The first word is “' + shown.split(' ')[0] + '”.', ok ? 'It starts with a capital letter, so yes.' : 'It starts with a small letter. It should be “' + s.split(' ')[0] + '”.'] };
    }
    if (shape === 'pick' || shape === 'pick3') {
      var wrong = [lower];
      if (shape === 'pick3') { var ws = s.split(' '), j = R.int(1, ws.length - 1); ws[j] = cap(ws[j]); wrong.push(low(ws.join(' '))); }
      return { q: q([readme(L), para(big('Which sentence starts with a capital letter?'))]), a: mc(s, wrong),
        hint: 'Check the first letter of each sentence.', steps: ['The first word of a sentence gets a capital letter.', '“' + s + '” starts with a capital ' + s.charAt(0) + '.'] };
    }
    // two sentences in a row: the second one is missing its capital (the trouble spot)
    var u = R.pick(TELL.filter(function (x) { return x !== t; })), s2 = full(u);
    if (shape === 'yesno2') {
      var good = R.coin(), text = s + ' ' + (good ? s2 : low(s2));
      return { q: q([para('Do both sentences start the right way?'), para(big(text))]), a: mcKeep(YESNO, good ? 0 : 1),
        hint: 'Find each period. The word after it starts a new sentence.', steps: ['The first sentence starts with “' + s.split(' ')[0] + '”: a capital.', 'After the period, the next sentence starts with “' + (good ? s2 : low(s2)).split(' ')[0] + '”.', good ? 'That is a capital too, so yes.' : 'That needs a capital: “' + s2.split(' ')[0] + '”. So no.'] };
    }
    var words2 = low(s2).split(' '), firstWrong = words2[0], textW = s + ' ' + low(s2);
    var pool = s.split(' ').slice(1, 3).concat(words2.slice(1, 3)).map(function (w) { return w.replace(/[.]$/, ''); }).filter(function (w) { return w.toLowerCase() !== firstWrong; });
    var wrongW = R.sample(pool.filter(function (w, i, a) { return a.indexOf(w) === i; }), 2);
    return { q: q([para('Which word needs a capital letter?'), para(big(textW))]), a: mc(firstWrong, wrongW),
      hint: 'Find the period. Which word starts the next sentence?',
      steps: ['The period after “' + t.w.split(' ').pop() + '” ends the first sentence.', '“' + firstWrong + '” starts the second sentence.', 'So it needs a capital letter: “' + cap(firstWrong) + '”.'] };
  });

  /* ---------------------------------------------------------------- fwr.telling-sentences */
  G('fwr.telling-sentences', function (R, ctx) {
    var t = R.pick(TELL), base = t.s + ' ' + t.v + ' ' + t.w, L = ctx.level;
    var shape = ML.byLevel(ctx, 'mark', R.pick(['which', 'mark3']), R.pick(['where', 'where', 'which']));
    if (shape === 'mark' || shape === 'mark3') {
      var ch = shape === 'mark' ? ['.', '?'] : ['.', '?', '!'];
      return { q: q([readme(L), para('This sentence tells something. Which mark goes at the end?'), para(big(base + ' ___'))]), a: mcKeep(ch, 0), viz: pic(t.place, t.items),
        hint: 'A telling sentence ends with a period.', steps: ['The sentence tells something: ' + low(t.s) + ' ' + t.v + ' ' + t.w + '.', 'A telling sentence ends with a period: ' + full(t)] };
    }
    if (shape === 'which') {
      var qq = R.pick(ASK) + '?', frag = fragments(t, R).where;
      return { q: q([readme(L), para(big('Which one is a telling sentence?'))]), a: mc(full(t), [qq, frag]),
        hint: 'A telling sentence tells something and ends with a period.',
        steps: ['“' + qq + '” asks something.', '“' + frag + '” is only part of an idea.', '“' + full(t) + '” tells something, so it is the telling sentence.'] };
    }
    // where: two sentences run together; which numbered gap needs the period?
    var u = R.pick(TELL.filter(function (x) { return x !== t; }));
    var w1 = (t.s + ' ' + t.v + ' ' + t.w).split(' '), w2 = (low(u.s) + ' ' + u.v + ' ' + u.w).split(' ');
    var all = w1.concat(w2), endAt = w1.length - 1, cand = [endAt - 1, endAt, endAt + 1].filter(function (i) { return i >= 0 && i < all.length - 1; });
    var gaps = R.shuffle(cand).slice(0, 3).sort(function (a, b) { return a - b; }), num = gaps.indexOf(endAt) + 1;
    return { q: q([para('These words hold two telling sentences. After which number does the first sentence end?')]),
      a: mcKeep(gaps.map(function (g, i) { return String(i + 1); }), num - 1),
      viz: { name: 'wr-punct', opts: { text: all.join(' '), gaps: gaps, quiet: true, interactive: false, big: true } },
      hint: 'Read it aloud. Where does the first idea stop?',
      steps: ['The first idea: “' + full(t) + '”', 'It ends after “' + t.w.split(' ').pop() + '”, at number ' + num + '.', 'Put a period there, and start the next sentence with a capital: “' + cap(w2.join(' ')) + '.”'] };
  });

  /* ---------------------------------------------------------------- fwr.asking-sentences */
  G('fwr.asking-sentences', function (R, ctx) {
    var a = R.pick(ASK), L = ctx.level;
    var shape = ML.byLevel(ctx, 'mark', R.pick(['which', 'mark']), R.pick(['qword', 'right', 'qword']));
    if (shape === 'mark') {
      var asking = L === 1 ? true : R.coin(), text = asking ? a : R.pick(TELL_QWORD);
      return { q: q([readme(L), para('Which mark goes at the end?'), para(big(text + ' ___'))]), a: mcKeep(['.', '?'], asking ? 1 : 0),
        hint: 'Does it ask something? Then it needs a question mark.',
        steps: asking ? ['“' + text + '” asks something. You could answer it.', 'An asking sentence ends with a question mark: ' + text + '?'] : ['“' + text + '” has a question word in it, but it tells something.', 'Nobody needs to answer it, so it ends with a period: ' + text + '.'] };
    }
    if (shape === 'which') {
      var t = R.pick(TELL);
      return { q: q([para(big('Which one is an asking sentence?'))]), a: mc(a + '?', [full(t), R.pick(TELL_QWORD) + '.']),
        hint: 'An asking sentence asks something, and you could answer it.',
        steps: ['“' + a + '?” asks something. Someone could answer it.', 'The other two tell something, even the one with a question word in it.'] };
    }
    if (shape === 'qword') {
      var tq = R.pick(TELL_QWORD);
      return { q: q([para('Is this an asking sentence?'), para(big(tq + '?'))]), a: mcKeep(['Yes, it asks something.', 'No, it tells something.'], 1),
        hint: 'A question word inside does not make it a question. Does it ask?',
        steps: ['“' + tq + '” has a question word in it.', 'But it tells what someone knows, saw or asked. Nobody needs to answer it.', 'So it is a telling sentence. It should end with a period: ' + tq + '.'] };
    }
    var tq2 = R.pick(TELL_QWORD);
    return { q: q([para(big('Which sentence has the right end mark?'))]), a: mc(a + '?', [a + '.', tq2 + '?']),
      hint: 'Ask: does it ask something? Then check its mark.',
      steps: ['“' + a + '” asks something, so it needs a question mark.', '“' + tq2 + '” tells something, so it needs a period, not a question mark.', 'The right one is “' + a + '?”'] };
  });

  /* ---------------------------------------------------------------- fwr.exclamations */
  G('fwr.exclamations', function (R, ctx) {
    var e = R.pick(EXCL), L = ctx.level, t = R.pick(TELL);
    var shape = ML.byLevel(ctx, 'feel', R.pick(['mark3', 'feel3']), R.pick(['kind', 'kind', 'right']));
    if (shape === 'feel' || shape === 'feel3') {
      var wrong = [full(t)]; if (shape === 'feel3') wrong.push(R.pick(ASK) + '?');
      return { q: q([readme(L), para(big('Which sentence shows strong feeling?'))]), a: mc(e.t + '!', wrong), viz: pic(e.place, e.items),
        hint: 'Which one would you say in a loud, surprised or happy voice?',
        steps: ['“' + e.t + '!” shows strong feeling, like surprise, joy or fear.', 'It ends with an exclamation point.', 'The other ' + (wrong.length > 1 ? 'ones tell or ask' : 'one tells something') + ' in a calm voice.'] };
    }
    if (shape === 'mark3') {
      return { q: q([para('This sentence shows strong feeling. Which mark goes at the end?'), para(big(e.t + ' ___'))]), a: mcKeep(['.', '?', '!'], 2), viz: pic(e.place, e.items),
        hint: 'Strong feeling gets an exclamation point.', steps: ['“' + e.t + '” is said with strong feeling.', 'It ends with one exclamation point: ' + e.t + '!'] };
    }
    if (shape === 'kind') {
      var what = EXCL.filter(function (x) { return /^What a/.test(x.t); }), pickE = R.coin() ? R.pick(what) : e;
      return { q: q([para('What kind of sentence is this?'), para(big(pickE.t + '!'))]), a: mcKeep(KIND_NAMES, 2),
        hint: 'Don’t look only at the first word. What does the whole sentence do?',
        steps: /^What a/.test(pickE.t) ? ['It starts with “What,” like many questions.', 'But it does not ask anything. Nobody answers “What a big fish!”', 'It shows surprise, so it is an exclamation.'] : ['“' + pickE.t + '!” does not ask anything.', 'It shows strong feeling.', 'So it is an exclamation, and it ends with an exclamation point.'] };
    }
    return { q: q([para(big('Which one is written the best way?'))]), a: mc(e.t + '!', [e.t + '!!!', full(t).replace(/\.$/, '!!')]),
      hint: 'One exclamation point is enough. Save it for strong feeling.',
      steps: ['“' + e.t + '!” shows strong feeling with one exclamation point.', 'Three in a row (“!!!”) is too many.', '“' + full(t).replace(/\.$/, '') + '” is a calm telling sentence; it needs a period, not exclamation points.'] };
  });

  /* ================================================================ the rest of the course (course builder, fwr) */
  // more shared helpers: a multiple-choice answer with the wrong choices made unique and never equal to the right one
  function uniq(list) { var out = []; list.forEach(function (x) { if (x != null && x !== '' && out.indexOf(x) < 0) out.push(x); }); return out; }
  function mcU(right, wrong, n, keep) {
    var w = uniq(wrong).filter(function (x) { return x !== right; });
    if (n != null) w = w.slice(0, n);
    return mc(right, w, keep);
  }
  function subjLow(s) { return /^(I|Leo|Mia|Ana|Sam|Grandma|Grandpa|Mom|Dad)\b/.test(s) ? s : low(s); }
  function quote(s) { return '“' + s + '”'; }
  function lettersOf(n) { var o = []; for (var i = 0; i < n; i++) o.push(String.fromCharCode(65 + i)); return o; }
  function numbersOf(n) { var o = []; for (var i = 1; i <= n; i++) o.push(String(i)); return o; }
  // an ordering problem: items in the right order, shown shuffled and lettered; returns { viz, right, wrong }
  function orderProblem(R, items, nWrong) {
    var idx = items.map(function (x, i) { return i; }), perm = scramble(idx, R);
    var code = items.map(function (x, j) { return String.fromCharCode(65 + perm.indexOf(j)); });
    var right = code.join(' '), wrong = [], guard = 0;
    while (wrong.length < (nWrong || 3) && guard++ < 200) { var c = R.shuffle(code).join(' '); if (c !== right && wrong.indexOf(c) < 0) wrong.push(c); }
    return { viz: { name: 'wr-order', opts: { items: items, start: perm, quiet: true, interactive: false } }, right: right, wrong: wrong, perm: perm };
  }

  /* ---------------------------------------------------------------- fwr.commands */
  // polite and everyday commands (the person spoken to is the one who does it); all end with a period
  var CMD = ['Please shut the door', 'Feed the fish', 'Put on your coat', 'Wash your hands', 'Pass the peas, please', 'Close the gate',
    'Hold my hand', 'Please clean up your room', 'Line up at the door', 'Water the plants', 'Bring your library book', 'Turn off the light',
    'Please sit next to me', 'Hang up your jacket', 'Brush your teeth', 'Take out the trash', 'Please read me a story', 'Put the blocks in the box'];
  // the action word that starts each command (after Please), for steps
  function cmdVerb(c) { return low(c.replace(/^Please /, '').replace(/, please$/, '')); }
  G('fwr.commands', function (R, ctx) {
    var c = R.pick(CMD), t = R.pick(TELL), L = ctx.level;
    var shape = ML.byLevel(ctx, 'boss', R.pick(['which', 'mark']), R.pick(['who', 'isit', 'which']));
    if (shape === 'boss') {
      var isCmd = R.coin(), text = isCmd ? c + '.' : full(t);
      return { q: q([readme(L), para(big('Does this sentence tell someone to do something?')), para(big(text))]), a: mcKeep(YESNO, isCmd ? 0 : 1),
        hint: 'Is someone being told to do something? Or does it just tell what happens?',
        steps: isCmd ? ['“' + text + '” tells someone to ' + cmdVerb(c) + '.', 'It is a bossy sentence, a command.'] : ['“' + text + '” tells what ' + low(t.s) + ' does.', 'Nobody is being told to do anything, so it is a telling sentence, not a command.'] };
    }
    if (shape === 'which') {
      return { q: q([readme(L), para(big('Which one is a bossy sentence?'))]), a: mcU(c + '.', [full(t), R.pick(ASK) + '?']),
        hint: 'A bossy sentence tells someone to do something.',
        steps: ['“' + c + '.” tells someone to ' + cmdVerb(c) + '.', 'The other sentences tell or ask something.', 'So “' + c + '.” is the bossy sentence, a command.'] };
    }
    if (shape === 'mark') {
      return { q: q([para('This sentence tells someone to do something. Which mark goes at the end?'), para(big(c + ' ___'))]), a: mcKeep(['.', '?'], 0),
        hint: 'A command does not ask. Most commands end like telling sentences.',
        steps: ['“' + c + '” tells someone to ' + cmdVerb(c) + '. It does not ask anything.', 'A command usually ends with a period: ' + c + '.'] };
    }
    if (shape === 'who') {
      return { q: q([para('Who is told to do it?'), para(big(c + '.'))]),
        a: mcKeep(['the person you are talking to', 'nobody, so it is not a sentence', 'the one writing it'], 0),
        hint: 'Imagine saying it to a friend. Who would do it?',
        steps: ['“' + c + '.” is a command.', 'It does not name who will ' + cmdVerb(c) + ', but we know: the person you are talking to.', 'It is as if it said “You, ' + low(c) + '.”'] };
    }
    return { q: q([para('Is this a whole sentence?'), para(big(c + '.'))]),
      a: mcKeep(['Yes, it is a command.', 'No, nobody is named.'], 0),
      hint: 'In a command, the one who does it is the person you are talking to.',
      steps: ['“' + c + '.” tells someone to ' + cmdVerb(c) + '.', 'The person you are talking to is the one who does it, even though the sentence does not say “you.”', 'So yes, it is a whole sentence: a command.'] };
  });

  /* ---------------------------------------------------------------- fwr.choose-end-mark */
  // exclamations with a clear signal of strong feeling (an interjection, What a, a warning)
  var EXCL_CLEAR = EXCL.filter(function (x) { return /^(Wow|Look out|Ouch|Hooray|Yikes|Help|What a)/.test(x.t); });
  var MARK_NAMES = { '.': 'a period', '?': 'a question mark', '!': 'an exclamation point' };
  function anySentence(R, kind) {
    if (kind === 'tell') { var t = R.pick(TELL); return { text: t.s + ' ' + t.v + ' ' + t.w, mark: '.', why: 'It tells something.' }; }
    if (kind === 'qw') return { text: R.pick(TELL_QWORD), mark: '.', why: 'It has a question word in it, but it tells something. Nobody needs to answer it.' };
    if (kind === 'ask') return { text: R.pick(ASK), mark: '?', why: 'It asks something. Someone could answer it.' };
    if (kind === 'cmd') { var c = R.pick(CMD); return { text: c, mark: '.', why: 'It tells someone to ' + cmdVerb(c) + '. A calm command ends with a period.' }; }
    var e = R.pick(EXCL_CLEAR); return { text: e.t, mark: '!', why: /^What a/.test(e.t) ? 'It starts with What, but it does not ask. It shows surprise.' : 'It shows strong feeling.' };
  }
  G('fwr.choose-end-mark', function (R, ctx) {
    var L = ctx.level;
    var shape = ML.byLevel(ctx, 'mark', 'mark', R.pick(['trick', 'wrong', 'trick']));
    if (shape === 'mark') {
      var kind = L === 1 ? R.pick(['tell', 'ask', 'excl']) : R.pick(['tell', 'ask', 'excl', 'cmd', 'qw']), s = anySentence(R, kind);
      return { q: q([readme(L), para('Which mark goes at the end?'), para(big(s.text + ' ___'))]), a: mcKeep(['.', '?', '!'], ['.', '?', '!'].indexOf(s.mark)),
        hint: 'Read the whole sentence. Does it tell, ask or show strong feeling?',
        steps: [s.why, 'So it ends with ' + MARK_NAMES[s.mark] + ': ' + s.text + s.mark] };
    }
    if (shape === 'trick') {
      var s2 = anySentence(R, R.pick(['qw', 'excl'])); if (s2.mark === '!' && !/^What a/.test(s2.text)) s2 = { text: R.pick(EXCL_CLEAR.filter(function (x) { return /^What a/.test(x.t); })).t, mark: '!', why: 'It starts with What, but it does not ask. It shows surprise.' };
      return { q: q([para('Careful: look at the whole sentence, not just the first word. Which mark goes at the end?'), para(big(s2.text + ' ___'))]), a: mcKeep(['.', '?', '!'], ['.', '?', '!'].indexOf(s2.mark)),
        hint: 'A question word does not make a question. Does the sentence ask?',
        steps: [s2.why, 'So it ends with ' + MARK_NAMES[s2.mark] + ': ' + s2.text + s2.mark] };
    }
    // wrong: three sentences, one with the wrong end mark
    var kinds = R.sample(['tell', 'ask', 'excl', 'cmd', 'qw'], 3), S = kinds.map(function (k) { return anySentence(R, k); }), bad = R.int(0, 2);
    var shown = S.map(function (s, i) { if (i !== bad) return s.text + s.mark; var w = s.mark === '.' ? '?' : s.mark === '?' ? '.' : '?'; return s.text + w; });
    return { q: q([para(big('Which sentence has the wrong end mark?'))]), a: mcU(shown[bad], shown.filter(function (x, i) { return i !== bad; })),
      hint: 'Check each sentence: does it tell, ask or show strong feeling?',
      steps: ['“' + shown[bad] + '”: ' + S[bad].why, 'It should end with ' + MARK_NAMES[S[bad].mark] + ': ' + S[bad].text + S[bad].mark, 'The other two have the right marks.'] };
  });

  /* ---------------------------------------------------------------- naming and action words: a tagged sentence bank */
  // n = noun (kind: p person, pl place, a animal, t thing), v = verb, adj = describing word; untagged words are left out of choices
  var NS = [
    'The teacher|n:p reads|v a funny|adj story|n:t.', 'My sister|n:p swims|v in the cold|adj lake|n:pl.', 'The baker|n:p makes|v bread|n:t in the kitchen|n:pl.',
    'A tiny|adj puppy|n:a sleeps|v on the rug|n:t.', 'Grandpa|n:p digs|v holes|n:t in the garden|n:pl.', 'The farmer|n:p feeds|v the hungry|adj pigs|n:a.',
    'The nurse|n:p visits|v the school|n:pl.', 'The pilot|n:p flies|v a big|adj plane|n:t.', 'Mom|n:p drives|v to the city|n:pl.', 'The bird|n:a builds|v a nest|n:t.',
    'Children|n:p play|v at the park|n:pl.', 'The doctor|n:p helps|v the sick|adj boy|n:p.', 'A brown|adj horse|n:a eats|v hay|n:t on the farm|n:pl.',
    'The librarian|n:p stacks|v books|n:t at the library|n:pl.', 'My friend|n:p kicks|v a red|adj ball|n:t.', 'The cat|n:a naps|v in the warm|adj sun|n:t.'
  ];
  function nsParse(s) {
    return s.replace(/\.$/, '').split(' ').map(function (tok) { var m = tok.split('|'), tag = m[1] || '', parts = tag.split(':'); return { w: m[0], tag: parts[0], kind: parts[1] || '' }; });
  }
  function nsText(words) { return cap(words.map(function (x) { return x.w; }).join(' ')) + '.'; }
  function ofTag(words, tag) { return words.filter(function (x) { return x.tag === tag; }).map(function (x) { return x.w; }); }
  var KIND_WORD = { p: 'a person', pl: 'a place', a: 'an animal', t: 'a thing' };
  var NOUN_POOL = { p: ['teacher', 'baker', 'doctor', 'farmer', 'sister', 'grandma', 'pilot', 'friend', 'nurse', 'coach'], pl: ['kitchen', 'park', 'city', 'school', 'library', 'farm', 'beach', 'zoo', 'store', 'garden'],
    a: ['puppy', 'horse', 'bird', 'frog', 'kitten', 'duck', 'rabbit', 'cow'], t: ['cup', 'ball', 'book', 'chair', 'kite', 'hat', 'drum', 'spoon'] };
  // words that are only verbs or only describing words in everyday use (not wish, paint or run, which can name things too)
  var VERB_POOL = ['sing', 'eat', 'think', 'sit', 'grow', 'bring', 'give', 'ran', 'went', 'jumped', 'laughed', 'slept'];
  var ADJ_POOL = ['big', 'happy', 'soft', 'tall', 'tiny', 'shiny', 'funny', 'loud', 'sleepy', 'wet'];

  /* ---------------------------------------------------------------- fwr.nouns */
  G('fwr.nouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'word', R.pick(['word', 'insent']), R.pick(['all', 'kind', 'all']));
    if (shape === 'word') {
      var kind = L === 1 ? R.pick(['a', 't']) : R.pick(['p', 'pl']), n = R.pick(NOUN_POOL[kind]);
      var wrong = L === 1 ? [R.pick(VERB_POOL)] : [R.pick(VERB_POOL), R.pick(ADJ_POOL)];
      return { q: q([readme(L), para(big('Which word is a noun, a naming word?'))]), a: mcU(n, wrong),
        hint: 'A noun names a person, a place, an animal or a thing.',
        steps: ['“' + n + '” names ' + KIND_WORD[kind] + '.', 'So “' + n + '” is a noun.', wrong.map(function (w) { return '“' + w + '”'; }).join(' and ') + (wrong.length > 1 ? ' do not name anything.' : ' does not name anything; it tells an action.')] };
    }
    var words = nsParse(R.pick(shape === 'kind' ? NS.filter(function (s) { return /:(p|pl)\b/.test(s); }) : NS)), text = nsText(words), nouns = ofTag(words, 'n'), verbs = ofTag(words, 'v'), adjs = ofTag(words, 'adj');
    if (shape === 'insent') {
      var nn = R.pick(nouns), wr = verbs.concat(adjs, words.filter(function (x) { return !x.tag && !/^(a|an|the|my|our)$/i.test(x.w); }).map(function (x) { return x.w; }));
      return { q: q([para('Which word in this sentence is a noun?'), para(big(text))]), a: mcU(nn, wr, 2),
        hint: 'Look for a word that names a person, a place, an animal or a thing.',
        steps: ['“' + nn + '” names ' + KIND_WORD[words.filter(function (x) { return x.w === nn; })[0].kind] + ', so it is a noun.', '“' + verbs[0] + '” tells an action, so it is a verb, not a noun.'] };
    }
    if (shape === 'kind') {
      var withK = words.filter(function (x) { return x.tag === 'n' && (x.kind === 'p' || x.kind === 'pl'); }), target = R.pick(withK);
      var others = words.filter(function (x) { return x.w !== target.w && (x.tag === 'n' || x.tag === 'v'); }).map(function (x) { return x.w; });
      var askK = target.kind === 'p' ? 'a person' : 'a place';
      var wrongK = others.filter(function (w) { var x = words.filter(function (y) { return y.w === w; })[0]; return !(x.tag === 'n' && x.kind === target.kind); });
      return { q: q([para('Which noun in this sentence names ' + askK + '?'), para(big(text))]), a: mcU(target.w, wrongK, 2),
        hint: 'Nouns are not only things you can touch. People and places are nouns too.',
        steps: ['“' + target.w + '” names ' + askK + '.', 'Nouns name people and places too, not only things you can touch.'] };
    }
    // all: choose every noun in the sentence (select all)
    var content = words.filter(function (x) { return x.tag; }), choices = content.map(function (x) { return x.w; });
    var v = []; content.forEach(function (x, i) { if (x.tag === 'n') v.push(i); });
    return { q: q([para('Choose every noun in this sentence.'), para(big(text))]), a: { t: 'mc', choices: choices, v: v, keep: true },
      hint: 'Check each word: does it name a person, a place, an animal or a thing?',
      steps: content.map(function (x) { return '“' + x.w + '”: ' + (x.tag === 'n' ? 'names ' + KIND_WORD[x.kind] + ', so it is a noun.' : x.tag === 'v' ? 'an action word, not a noun.' : 'a describing word, not a noun.'); }) };
  });

  /* ---------------------------------------------------------------- fwr.plural-nouns */
  var PL_S = ['cat', 'dog', 'cup', 'book', 'frog', 'hat', 'tree', 'bike', 'kite', 'bell', 'apple', 'egg', 'duck', 'sock', 'star', 'shell'];
  var PL_ES = ['box', 'fox', 'dish', 'brush', 'bus', 'dress', 'glass', 'lunch', 'bench', 'peach', 'watch', 'match', 'wish', 'class'];
  var PL_IRR = ['child', 'mouse', 'foot', 'tooth', 'man', 'woman', 'goose', 'sheep', 'deer'];
  var PIC_E = { cat: '🐈', dog: '🐕', cup: '☕', book: '📕', frog: '🐸', hat: '🎩', tree: '🌳', bike: '🚲', kite: '🪁', bell: '🔔', apple: '🍎', egg: '🥚', duck: '🦆', sock: '🧦', star: '⭐', shell: '🐚',
    box: '📦', fox: '🦊', bus: '🚌', glass: '🥛', peach: '🍑', watch: '⌚', mouse: '🐭', foot: '🦶', tooth: '🦷', goose: '🪿', sheep: '🐑', deer: '🦌' };
  var NUMW = ['two', 'three', 'four', 'five'];
  function manyPic(n, k) { var e = PIC_E[n], items = []; if (!e) return null; for (var i = 0; i < k; i++) items.push({ e: e, x: 20 + i * (60 / Math.max(1, k - 1)), y: 70 }); return { name: 'wr-picture', opts: { place: 'plain', items: items, quiet: true, interactive: false } }; }
  G('fwr.plural-nouns', function (R, ctx) {
    var L = ctx.level, set = ML.byLevel(ctx, 'S', R.pick(['ES', 'ES', 'S']), R.pick(['IRR', 'ES', 'IRR']));
    var n = R.pick(set === 'S' ? PL_S : set === 'ES' ? PL_ES : PL_IRR), right = W().pluralOf(n), k = R.int(2, 4), nw = NUMW[k - 2];
    var wrong = set === 'S' ? [n, n + 'es'] : set === 'ES' ? [n + 's', n] : [n + 's', /(s|x|ch|sh)$/.test(n) ? n + 'es' : n + 'es'];
    if (set === 'IRR') wrong = right === n ? [n + 's', n + 'es'] : [n + 's', right + 's'];
    var shape = L === 3 && R.coin() ? 'sentence' : 'fill';
    var pic = manyPic(n, k);
    var why = set === 'S' ? 'Most nouns add -s to mean more than one.' : set === 'ES' ? '“' + n + '” ends in ' + (n.match(/(ch|sh|s|x|z)$/) || [''])[0] + ', so it adds -es. Say it: ' + right + ' has an extra beat.' : '“' + n + '” changes in its own way: one ' + n + ', many ' + right + '.';
    if (shape === 'fill') {
      var p = { q: q([readme(L), para('Choose the word that means more than one.'), para(big('one ' + n + ', ' + nw + ' ___'))]), a: mcU(right, wrong, L === 1 ? 1 : 2),
        hint: set === 'ES' ? 'Say the word aloud. Does the ending need an extra beat?' : set === 'IRR' ? 'Some nouns change in their own way. Which word do you say?' : 'Most nouns just add -s.',
        steps: [why, 'One ' + n + ', ' + nw + ' ' + right + '.'] };
      if (pic) p.viz = pic;
      return p;
    }
    var nouns = R.sample(PL_IRR.concat(PL_ES), 2), rightS = 'The ' + W().pluralOf(nouns[0]) + ' and the ' + W().pluralOf(nouns[1]) + ' are here.';
    var bad1 = 'The ' + nouns[0] + 's and the ' + W().pluralOf(nouns[1]) + ' are here.', bad2 = 'The ' + W().pluralOf(nouns[0]) + ' and the ' + nouns[1] + 's are here.';
    return { q: q([para(big('Which sentence spells both naming words the right way?'))]), a: mcU(rightS, [bad1, bad2]),
      hint: 'Check each word that means more than one.',
      steps: ['One ' + nouns[0] + ', many ' + W().pluralOf(nouns[0]) + '.', 'One ' + nouns[1] + ', many ' + W().pluralOf(nouns[1]) + '.', 'So: ' + rightS] };
  });

  /* ---------------------------------------------------------------- fwr.verbs */
  var QUIET_VERBS = [['The baby', 'sleeps', 'in her crib'], ['I', 'wish', 'for a puppy'], ['Leo', 'knows', 'the answer'], ['We', 'listen', 'to the rain'], ['Grandma', 'rests', 'on the couch'],
    ['The girl', 'thinks', 'about her trip'], ['My dad', 'waits', 'for the bus'], ['The cat', 'watches', 'the birds'], ['Mia', 'smiles', 'at her friend'], ['They', 'hope', 'for snow']];
  G('fwr.verbs', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'pic', R.pick(['quiet', 'insent']), R.pick(['quiet', 'two']));
    if (shape === 'pic') {
      var t = R.pick(TELL), last = t.w.split(' ').pop();
      return { q: q([readme(L), para('Which word is the action word, the verb?'), para(big(full(t)))]), a: mcU(t.v, [t.s.split(' ').pop(), last], 2), viz: pic(t.place, t.items),
        hint: 'Which word tells what ' + subjLow(t.s) + ' does?',
        steps: ['What does ' + subjLow(t.s) + ' do? It ' + t.v + '.', 'So “' + t.v + '” is the verb.', '“' + t.s.split(' ').pop() + '” and “' + last + '” name things; they are nouns.'] };
    }
    if (shape === 'quiet') {
      var qv = R.pick(QUIET_VERBS), sent = qv[0] + ' ' + qv[1] + ' ' + qv[2] + '.', nounW = qv[2].split(' ').pop(), subW = qv[0].split(' ').pop();
      return { q: q([para('Which word is the verb?'), para(big(sent))]), a: mcU(qv[1], [subW, nounW], 2),
        hint: 'Some verbs are quiet. Which word tells what someone does, even without moving much?',
        steps: ['What does the sentence say ' + subjLow(qv[0]) + ' ' + (/^(I|We|They)$/.test(qv[0]) ? 'do' : 'does') + '? ' + cap(qv[1]) + '.', '“' + qv[1] + '” is a verb, even though it is not a big movement.', 'Verbs can be quiet: sleep, wish, know, think and listen are verbs too.'] };
    }
    var words = nsParse(R.pick(NS));
    if (shape === 'insent') {
      var vb = ofTag(words, 'v')[0];
      return { q: q([para('Which word in this sentence is the verb?'), para(big(nsText(words)))]), a: mcU(vb, ofTag(words, 'n').concat(ofTag(words, 'adj')), 2),
        hint: 'Find who or what the sentence is about. Then ask: what does it do?',
        steps: ['The sentence is about ' + (ofTag(words, 'n')[0] === 'Mom' || ofTag(words, 'n')[0] === 'Grandpa' ? ofTag(words, 'n')[0] : 'the ' + ofTag(words, 'n')[0].toLowerCase()) + '.', 'What does it do? It ' + vb + '. So “' + vb + '” is the verb.'] };
    }
    // two verbs: select all
    var V2 = { 'The dog': ['runs', 'barks'], 'The cat': ['stretches', 'yawns'], 'The girl': ['sings', 'dances'], 'The boy': ['jumps', 'claps'],
      'A frog': ['hops', 'croaks'], 'The duck': ['swims', 'quacks'], 'A bird': ['flies', 'sings'], 'Grandma': ['laughs', 'waves'], 'The rabbit': ['sniffs', 'hops'] };
    var subj = R.pick(Object.keys(V2)), vv = V2[subj], extra = R.pick(['happily', 'all day', 'in the sun', 'at the park']);
    var sent2 = subj + ' ' + vv[0] + ' and ' + vv[1] + ' ' + extra + '.', noun2 = subj.split(' ').pop();
    var ch = R.shuffle([vv[0], vv[1], noun2, extra.split(' ').pop()]), v2 = []; ch.forEach(function (c, i) { if (vv.indexOf(c) >= 0) v2.push(i); });
    return { q: q([para('This sentence has two verbs. Choose both.'), para(big(sent2))]), a: { t: 'mc', choices: ch, v: v2 },
      hint: 'What two things does ' + low(subj) + ' do?',
      steps: [cap(low(subj)) + ' ' + vv[0] + ', and ' + low(subj) + ' ' + vv[1] + '.', 'So the verbs are “' + vv[0] + '” and “' + vv[1] + '”.'] };
  });

  /* ---------------------------------------------------------------- fwr.past-present-future */
  var REG_VERBS = ['walk', 'jump', 'play', 'help', 'look', 'cook', 'paint', 'kick', 'pick', 'wash', 'clean', 'climb', 'fix', 'bake', 'dance', 'plant'];
  var IRR_VERBS = { run: 'runned', go: 'goed', eat: 'eated', see: 'seed', come: 'comed', make: 'maked', sit: 'sitted', swim: 'swimmed', sing: 'singed', write: 'writed', ride: 'rided', give: 'gived', take: 'taked', find: 'finded', dig: 'digged' };
  var REST = { walk: 'to school', jump: 'in the puddles', play: 'with my friends', help: 'in the garden', look: 'at the stars', cook: 'dinner', paint: 'a picture', kick: 'the ball', pick: 'apples', wash: 'the dishes', clean: 'my room', climb: 'the hill', fix: 'my bike', bake: 'muffins', dance: 'at the party', plant: 'a seed',
    run: 'to the park', go: 'to the store', eat: 'pancakes', see: 'a rainbow', come: 'home early', make: 'a card', sit: 'by the window', swim: 'in the lake', sing: 'a song', write: 'a letter', ride: 'my bike', give: 'Mom a hug', take: 'the bus', find: 'a shell', dig: 'a hole' };
  var WHEN = { past: 'Yesterday', present: 'Every day', future: 'Tomorrow' };
  G('fwr.past-present-future', function (R, ctx) {
    var L = ctx.level, irr = L === 3 || (L === 2 && R.chance(0.4));
    var v = irr ? R.pick(Object.keys(IRR_VERBS)) : R.pick(REG_VERBS), subj = R.pick(['I', 'we', 'they']), time = L === 1 ? R.pick(['past', 'future']) : R.pick(['past', 'present', 'future']);
    if (irr && L === 3) time = 'past';
    var forms = { past: W().conj(v, 'past', subj), present: W().conj(v, 'present', subj), future: W().conj(v, 'future', subj) };
    var right = forms[time], wrong = ['past', 'present', 'future'].filter(function (x) { return x !== time; }).map(function (x) { return forms[x]; });
    if (irr && time === 'past') wrong = [IRR_VERBS[v], forms.present];
    var before = WHEN[time] + ' ' + (subj === 'I' ? 'I' : subj) + ' ___ ' + REST[v] + '.';
    var P = { q: q([readme(L), para('Choose the verb that fits the time.'), para(big(before))]), a: mcU(right, wrong, L === 1 ? 1 : 2),
      hint: 'Look at the time word: ' + WHEN[time].toLowerCase() + '. Did it happen already, does it happen now, or will it happen later?',
      steps: ['“' + WHEN[time] + '” tells ' + (time === 'past' ? 'that it already happened: the past.' : time === 'present' ? 'that it happens now, again and again: the present.' : 'that it will happen later: the future.'),
        irr && time === 'past' ? '“' + v + '” does not add -ed. Its past form is “' + right + '”, not “' + IRR_VERBS[v] + '”.' : (time === 'past' ? 'Most verbs add -ed for the past.' : time === 'future' ? 'For the future, put will before the verb.' : 'For now, use the plain verb.'),
        WHEN[time] + ' ' + (subj === 'I' ? 'I' : subj) + ' ' + right + ' ' + REST[v] + '.'] };
    if (L === 1) P.viz = { name: 'wr-tense', opts: { verb: v, subject: subj, tense: time, rest: REST[v], quiet: true, interactive: false, pick: false } };
    return P;
  });

  /* ---------------------------------------------------------------- fwr.is-are-was-were */
  var ONE = ['The dog', 'My sister', 'The cake', 'Grandpa', 'The bus', 'That kitten', 'The sun', 'My hat'], MANY = ['The dogs', 'My sisters', 'The cakes', 'The kids', 'Ana and Leo', 'The buses', 'These kittens', 'My boots'];
  var PRED = { 'The dog': 'hungry', 'My sister': 'at school', 'The cake': 'too hot', 'Grandpa': 'in the garden', 'The bus': 'late', 'That kitten': 'sleepy', 'The sun': 'bright', 'My hat': 'wet',
    'The dogs': 'hungry', 'My sisters': 'at school', 'The cakes': 'too hot', 'The kids': 'in the garden', 'Ana and Leo': 'late', 'The buses': 'late', 'These kittens': 'sleepy', 'My boots': 'wet' };
  var HOP = [['hop', 'hops'], ['run', 'runs'], ['sing', 'sings'], ['jump', 'jumps'], ['read', 'reads'], ['swim', 'swims'], ['play', 'plays'], ['eat', 'eats']];
  G('fwr.is-are-was-were', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'now', R.pick(['then', 'now', 'you']), R.pick(['hop', 'written', 'then']));
    if (shape === 'now' || shape === 'then') {
      var many = R.coin(), s = R.pick(many ? MANY : ONE), now = shape === 'now', right = now ? (many ? 'are' : 'is') : (many ? 'were' : 'was'), wrong = now ? (many ? 'is' : 'are') : (many ? 'was' : 'were');
      var lead = now ? '' : R.pick(['Yesterday ', 'Last night ', 'This morning ']);
      var sent = lead + (lead ? low(s) : s) + ' ___ ' + PRED[s] + '.';
      if (/^(Ana|Grandpa)/.test(s) && lead) sent = lead + s + ' ___ ' + PRED[s] + '.';
      return { q: q([readme(L), para('Choose the word that fits.'), para(big(sent))]), a: mcKeep(now ? ['is', 'are'] : ['was', 'were'], (now ? ['is', 'are'] : ['was', 'were']).indexOf(right)),
        hint: 'Is it about one, or more than one?',
        steps: ['“' + s + '” means ' + (many ? 'more than one' : 'one') + '.', 'With ' + (many ? 'more than one' : 'one') + ', use “' + right + '”' + (now ? '.' : ' for the past.'), sent.replace('___', right)] };
    }
    if (shape === 'you') {
      var tm = R.coin(), right2 = tm ? 'are' : 'were', sent2 = tm ? 'You ___ my best friend.' : 'You ___ at the park yesterday.';
      return { q: q([para('Choose the word that fits.'), para(big(sent2))]), a: mcKeep(tm ? ['is', 'are'] : ['was', 'were'], 1),
        hint: 'The word you always goes with are or were.',
        steps: ['“You” always takes “are” and “were,” even when you means one person.', sent2.replace('___', right2)] };
    }
    if (shape === 'hop') {
      var hv = R.pick(HOP), one = R.coin(), subj = one ? R.pick(['He', 'She', 'The frog', 'My brother', 'Grandma']) : R.pick(['We', 'They', 'The frogs', 'My brothers', 'I']);
      var r = one ? hv[1] : hv[0], w = one ? hv[0] : hv[1];
      return { q: q([para('Choose the verb that matches.'), para(big(subj + ' ___ every day.'))]), a: mcKeep([hv[0], hv[1]], one ? 1 : 0),
        hint: 'One person or thing (he, she, it): the verb ends in -s. More than one, or I: no -s.',
        steps: [subj === 'I' ? 'With I, the verb has no -s.' : '“' + subj + '” means ' + (one ? 'one' : 'more than one') + '.', one ? 'With one (he, she, it), the verb adds -s: ' + r + '.' : 'With more than one, the verb has no -s: ' + r + '.', subj + ' ' + r + ' every day.'] };
    }
    // written: which sentence uses written standard English?
    var pairs = [['We were late.', 'We was late.'], ['They are my cousins.', 'They is my cousins.'], ['The boys were happy.', 'The boys was happy.'], ['You were right.', 'You was right.'],
      ['The cookies are gone.', 'The cookies is gone.'], ['My friends were here.', 'My friends was here.']];
    var pr = R.pick(pairs), other = R.pick(pairs.filter(function (x) { return x !== pr; }));
    return { q: q([para(big('Which sentence uses the written standard form?'))]), a: mcU(pr[0], [pr[1], other[1]]),
      hint: 'More than one, and you, go with are and were.',
      steps: ['In everyday talk, many people say “' + pr[1] + '”', 'Written standard English uses are and were with more than one, and with you.', 'So in writing: “' + pr[0] + '”'] };
  });

  /* ---------------------------------------------------------------- fwr.pronouns */
  var PRON_SUBJ = [['Grandma', 'She'], ['Grandpa', 'He'], ['Mom', 'She'], ['Dad', 'He'], ['My aunt', 'She'], ['My uncle', 'He'], ['The dog', 'It'], ['The kite', 'It'], ['The kids', 'They'], ['Mia and Leo', 'They'], ['The ducks', 'They'], ['My brother and I', 'We']];
  var PRON_MORE = { She: 'likes to sing.', He: 'likes to fish.', It: 'is very fast.', They: 'are having fun.', We: 'are best friends.' };
  G('fwr.pronouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'replace', 'replace', R.pick(['heandi', 'replace2', 'heandi']));
    if (shape === 'replace' || shape === 'replace2') {
      var p = R.pick(PRON_SUBJ), all = ['He', 'She', 'It', 'They', 'We'], wrong = all.filter(function (x) { return x !== p[1]; });
      wrong = L === 1 ? [p[1] === 'They' || p[1] === 'We' ? 'It' : 'They'] : R.sample(wrong, 2);
      var first = p[0] + (/\band\b|kids|ducks/.test(p[0]) ? ' are' : ' is') + ' ' + R.pick(['in the yard', 'at the park', 'here', 'outside']) + '.';
      if (p[0] === 'My brother and I') first = 'My brother and I are outside.';
      return { q: q([readme(L), para('Which word can take the place of ' + quote(p[0]) + ' in the second sentence?'), para(big(first + ' ___ ' + PRON_MORE[p[1]]))]), a: mcU(p[1], wrong),
        hint: 'Is it a boy or man, a girl or woman, a thing or animal, or more than one? Does it include you?',
        steps: ['“' + p[0] + '” is ' + ({ He: 'one man or boy', She: 'one woman or girl', It: 'one thing or animal', They: 'more than one', We: 'a group that includes me' })[p[1]] + '.', 'So the pronoun is “' + p[1] + '”: ' + p[1] + ' ' + PRON_MORE[p[1]]] };
    }
    var acts = ['played tag', 'built a fort', 'rode bikes', 'made a card', 'baked cookies', 'fed the ducks'], a = R.pick(acts), who = R.pick([['He', 'him'], ['She', 'her']]);
    var right = who[0] + ' and I ' + a + '.';
    return { q: q([para(big('Which sentence is written in standard English?'))]), a: mcU(right, ['Me and ' + who[1] + ' ' + a + '.', cap(who[1]) + ' and me ' + a + '.']),
      hint: 'Try each person alone: “I ' + a + '.” or “Me ' + a + '.”?',
      steps: ['In everyday talk, many people say “Me and ' + who[1] + ' ' + a + '.”', 'In writing, the ones who do the action are ' + who[0].toLowerCase() + ' and I: try each alone: “' + who[0] + ' ' + a + '.” “I ' + a + '.”', 'So: ' + right + ' (Polite writers name themselves last.)'] };
  });


  /* ---------------------------------------------------------------- fwr.adjectives */
  // sentences with describing words tagged: [text with *adj* marks, the noun each describes]
  var ADJS = [
    ['The *red* ball rolls away.', 'ball'], ['A *tiny* ant carries a crumb.', 'ant'], ['We saw a *tall* giraffe.', 'giraffe'], ['The *soft* kitten purrs.', 'kitten'],
    ['I ate a *crunchy* apple.', 'apple'], ['The *loud* drum woke the baby.', 'drum'], ['Mia has *three* fish.', 'fish'], ['The *round* moon is bright tonight.', 'moon'],
    ['A *green* frog sits on a log.', 'frog'], ['Dad wore a *funny* hat.', 'hat'], ['The *cold* water felt good.', 'water'], ['Leo found a *smooth* rock.', 'rock'],
    ['The *happy* puppy wags its tail.', 'puppy'], ['We built a *huge* snowman.', 'snowman'], ['Grandma baked *warm* bread.', 'bread'], ['A *striped* cat sleeps here.', 'cat']
  ];
  // select-all sentences: describing words marked with *, other words to offer as choices marked with +
  var ADJS3 = ['The *big* *brown* +dog +ate a *tiny* +bone.', 'A *little* +bird +sang a *sweet* +song.', 'Two *fluffy* +sheep +ate the *green* +grass.',
    'My *new* *blue* +bike +has a *shiny* +bell.', 'The *old* +man +wore a *warm* *red* +coat.', 'Five *yellow* +ducks +swam in the *cool* +pond.'];
  function adjParse(s) { return s.replace(/\.$/, '').split(' ').map(function (w) { return { w: w.replace(/^[*+]/, '').replace(/\*$/, ''), adj: /^\*/.test(w), choice: /^[*+]/.test(w) }; }); }
  function adjText(ws) { return ws.map(function (x) { return x.w; }).join(' ') + '.'; }
  G('fwr.adjectives', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'which', R.pick(['which', 'describes']), R.pick(['all', 'all', 'tired']));
    if (shape === 'which' || shape === 'describes') {
      var it = R.pick(ADJS), ws = adjParse(it[0].replace(/\*([a-z]+)\*/, '*$1')), adj = ws.filter(function (x) { return x.adj; })[0].w, text = adjText(ws);
      var verbW = ws.filter(function (x) { return /(s|ed|ate|saw|wore|built|found|has|felt|woke|sits|baked)$/.test(x.w) && !x.adj && x.w !== it[1] && !/^(is|this)$/.test(x.w); }).map(function (x) { return x.w; });
      if (shape === 'which') {
        return { q: q([readme(L), para('Which word describes the ' + it[1] + '?'), para(big(text))]), a: mcU(adj, [it[1]].concat(L === 1 ? [] : verbW.slice(0, 1)), L === 1 ? 1 : 2),
          hint: 'What kind of ' + it[1] + '? Which word tells about it?',
          steps: ['What kind of ' + it[1] + ' is it? A ' + adj + ' ' + it[1] + (adj === 'three' ? 's… three of them.' : '.'), '“' + adj + '” describes the ' + it[1] + ', so it is an adjective.', '“' + it[1] + '” is the noun it describes.'] };
      }
      return { q: q([para('In this sentence, which word does ' + quote(adj) + ' describe?'), para(big(text))]), a: mcU(it[1], ws.filter(function (x) { return !x.adj && x.w.length > 2 && x.w !== it[1] && !/^(The|the|and|Two|has)$/.test(x.w); }).map(function (x) { return x.w; }), 2),
        hint: 'A describing word usually comes right before the noun it tells about.',
        steps: ['Ask: ' + adj + ' what?', 'A ' + adj + ' ' + it[1] + '. So “' + adj + '” describes the ' + it[1] + '.'] };
    }
    if (shape === 'tired') {
      var pairs = [['The cake was good.', 'The cake was sweet and sticky.'], ['We had a nice day.', 'We had a sunny, happy day.'], ['It was a big dog.', 'It was a huge, shaggy dog.'],
        ['The soup was good.', 'The soup was hot and salty.'], ['I have a nice coat.', 'I have a warm, puffy coat.'], ['The song was nice.', 'The song was loud and bouncy.']];
      var pr = R.pick(pairs), other = R.pick(pairs.filter(function (x) { return x !== pr; }));
      return { q: q([para(big('Which sentence paints a clearer picture?'))]), a: mcU(pr[1], [pr[0], other[0]]),
        hint: 'Which one helps you see, hear, taste or feel it?',
        steps: ['“' + pr[0] + '” uses a tired word that does not say much.', '“' + pr[1] + '” tells what it was like, so the reader can picture it.'] };
    }
    // all: choose every describing word
    var ws3 = adjParse(R.pick(ADJS3)), ch = ws3.filter(function (x) { return x.choice; }), v = [];
    ch.forEach(function (x, i) { if (x.adj) v.push(i); });
    return { q: q([para('Choose every describing word (adjective) in this sentence.'), para(big(cap(adjText(ws3))))]), a: { t: 'mc', choices: ch.map(function (x) { return x.w; }), v: v, keep: true },
      hint: 'Find each noun. Then look for the words that tell what kind or how many.',
      steps: ch.map(function (x) { return '“' + x.w + '”: ' + (x.adj ? 'tells what kind, so it is a describing word.' : 'not a describing word.'); }) };
  });

  /* ---------------------------------------------------------------- fwr.five-senses */
  // sense words, each with the senses it can fit (so a wrong choice never fits the sense asked)
  var SENSE_W = {
    shiny: ['see'], sparkly: ['see'], striped: ['see'], purple: ['see'], spotted: ['see'], bright: ['see'],
    loud: ['hear'], squeaky: ['hear'], buzzing: ['hear'], booming: ['hear'], quiet: ['hear'], ringing: ['hear'],
    stinky: ['smell'], smelly: ['smell'], smoky: ['smell', 'see', 'taste'], fresh: ['smell', 'taste', 'see', 'touch'],
    sour: ['taste', 'smell'], salty: ['taste'], sweet: ['taste', 'smell', 'hear'], spicy: ['taste', 'smell'], juicy: ['taste', 'touch'],
    fuzzy: ['touch', 'see'], bumpy: ['touch', 'see'], prickly: ['touch'], sticky: ['touch'], soft: ['touch', 'hear'], scratchy: ['touch', 'hear'], slimy: ['touch', 'see']
  };
  var SENSE_Q = [
    ['see', 'the fire truck', 'shiny'], ['see', 'the zebra', 'striped'], ['see', 'the grapes', 'purple'], ['see', 'the ladybug', 'spotted'], ['see', 'the star', 'sparkly'],
    ['hear', 'the drum', 'booming'], ['hear', 'the mouse', 'squeaky'], ['hear', 'the bee', 'buzzing'], ['hear', 'the bell', 'ringing'], ['hear', 'the library', 'quiet'],
    ['smell', 'the old sock', 'stinky'], ['smell', 'the garbage can', 'smelly'], ['smell', 'the campfire', 'smoky'],
    ['taste', 'the lemon', 'sour'], ['taste', 'the pretzel', 'salty'], ['taste', 'the honey', 'sweet'], ['taste', 'the peach', 'juicy'],
    ['touch', 'the cactus', 'prickly'], ['touch', 'the peach', 'fuzzy'], ['touch', 'the gum', 'sticky'], ['touch', 'the road', 'bumpy'], ['touch', 'the blanket', 'soft']
  ];
  var SENSE_VERB = { see: 'looks', hear: 'sounds', smell: 'smells', taste: 'tastes', touch: 'feels' };
  var SENSE_NAME = { see: 'seeing (eyes)', hear: 'hearing (ears)', smell: 'smelling (nose)', taste: 'tasting (tongue)', touch: 'touching (skin)' };
  function notSense(sense) { return Object.keys(SENSE_W).filter(function (w) { return SENSE_W[w].indexOf(sense) < 0 && SENSE_W[w].length === 1; }); }
  G('fwr.five-senses', function (R, ctx) {
    var L = ctx.level, it = R.pick(SENSE_Q), sense = it[0], word = it[2];
    var shape = ML.byLevel(ctx, 'how', 'how', R.pick(['which', 'how']));
    if (shape === 'how') {
      var wrong = R.sample(notSense(sense), L === 1 ? 1 : 2);
      return { q: q([readme(L), para('Which word tells how ' + it[1] + ' ' + SENSE_VERB[sense] + '?'), para(big(cap(it[1]) + ' ' + SENSE_VERB[sense] + ' ___.'))]), a: mcU(word, wrong),
        hint: 'Think about ' + SENSE_NAME[sense].replace(/ \(.*/, '') + '. Which word fits?',
        steps: ['The sentence is about how ' + it[1] + ' ' + SENSE_VERB[sense] + ', the sense of ' + SENSE_NAME[sense] + '.', cap(it[1]) + ' ' + SENSE_VERB[sense] + ' ' + word + '.',
          wrong.map(quote).join(' and ') + ' ' + (wrong.length > 1 ? 'go' : 'goes') + ' with a different sense.'] };
    }
    // which sense does the word go with? only words that fit one sense
    var one = R.pick(Object.keys(SENSE_W).filter(function (w) { return SENSE_W[w].length === 1; })), s = SENSE_W[one][0];
    var names = ['seeing', 'hearing', 'smelling', 'tasting', 'touching'], keys = ['see', 'hear', 'smell', 'taste', 'touch'];
    var opts = R.sample(keys.filter(function (k) { return k !== s; }), 2).concat([s]).sort(function (a, b) { return keys.indexOf(a) - keys.indexOf(b); });
    return { q: q([para('Which sense does this word tell about?'), para(big(one))]), a: mcKeep(opts.map(function (k) { return names[keys.indexOf(k)]; }), opts.indexOf(s)),
      hint: 'Would you notice it with your eyes, ears, nose, tongue or skin?',
      steps: ['You notice something ' + one + ' with ' + ({ see: 'your eyes', hear: 'your ears', smell: 'your nose', taste: 'your tongue', touch: 'your skin (by touching)' })[s] + '.', 'So “' + one + '” is a ' + names[keys.indexOf(s)] + ' word.'] };
  });

  /* ---------------------------------------------------------------- fwr.expand-sentences */
  // plain sentences that grow: who, does, where, the picture, a describing word that fits any picture of it
  var GROW = [
    { s: 'dog', v: 'digs', w: 'in the yard', a: 'happy', place: 'yard', items: [{ k: 'dog', x: 40, y: 88 }, { k: 'bone', x: 62, y: 92, s: 0.6 }] },
    { s: 'frog', v: 'jumps', w: 'into the pond', a: 'little', place: 'pond', items: [{ k: 'frog', x: 45, y: 80 }] },
    { s: 'girl', v: 'reads', w: 'under a tree', a: 'quiet', place: 'park', items: [{ k: 'tree', x: 30, y: 78, s: 1.8 }, { k: 'girl', x: 52, y: 90 }, { k: 'book', x: 64, y: 92, s: 0.5 }] },
    { s: 'duck', v: 'swims', w: 'on the pond', a: 'busy', place: 'pond', items: [{ k: 'duck', x: 55, y: 84 }] },
    { s: 'rabbit', v: 'hops', w: 'in the snow', a: 'fluffy', place: 'snow', items: [{ k: 'rabbit', x: 45, y: 88 }, { k: 'snowman', x: 72, y: 86, s: 1.2 }] },
    { s: 'bear', v: 'naps', w: 'under the moon', a: 'sleepy', place: 'night', items: [{ k: 'moon', x: 80, y: 28, s: 0.8 }, { k: 'bear', x: 45, y: 90 }] },
    { s: 'cow', v: 'sleeps', w: 'on the farm', a: 'big', place: 'farm', items: [{ k: 'cow', x: 40, y: 90 }] },
    { s: 'boy', v: 'kicks', w: 'the ball at the park', a: 'fast', place: 'park', items: [{ k: 'boy', x: 40, y: 88 }, { k: 'ball', x: 62, y: 92, s: 0.6 }] }
  ];
  var OTHER_W = { yard: 'at the beach', pond: 'in the kitchen', park: 'at the beach', snow: 'on a sunny beach', night: 'in the kitchen', farm: 'in the classroom' };
  G('fwr.expand-sentences', function (R, ctx) {
    var L = ctx.level, g = R.pick(GROW), plain = 'The ' + g.s + ' ' + g.v + '.', grown = 'The ' + g.a + ' ' + g.s + ' ' + g.v + ' ' + g.w + '.';
    var shape = ML.byLevel(ctx, 'more', R.pick(['match', 'more']), R.pick(['match', 'runon']));
    if (shape === 'more') {
      var half = 'The ' + g.a + ' ' + g.s + ' ' + g.v + '.';
      return { q: q([readme(L), para('This sentence is plain:'), para(big(plain)), para('Which sentence grows it with a describing word <b>and</b> a where word?')]), a: mcU(grown, L === 1 ? [plain] : [plain, half]), viz: pic(g.place, g.items),
        hint: 'Look for a word that tells what kind, and words that tell where.',
        steps: ['“' + g.a + '” tells what kind of ' + g.s + '.', '“' + g.w + '” tells more about where or what.', 'So the sentence that grew is “' + grown + '”'] };
    }
    if (shape === 'match') {
      var wrongPlace = 'The ' + g.a + ' ' + g.s + ' ' + g.v + ' ' + OTHER_W[g.place] + '.';
      return { q: q([para('Look at the picture. Which sentence grows ' + quote(plain) + ' and still matches the picture?')]), a: mcU(grown, [wrongPlace, plain]), viz: pic(g.place, g.items),
        hint: 'A good detail tells something that is really in the picture.',
        steps: ['The picture shows the ' + g.s + ' ' + W().PLACES[g.place].at + '.', '“' + wrongPlace + '” adds a place that is not in the picture.', '“' + grown + '” adds details that match.'] };
    }
    var runon = 'The ' + g.a + ' ' + g.s + ' ' + g.v + ' ' + g.w + ' and the sky is big and the grass is green and it is a nice day and everyone is happy and that is all.';
    return { q: q([para(big('Which sentence grew the best way?'))]), a: mcU(grown, [runon, plain]),
      hint: 'A good sentence adds a few details that help. It does not run on and on.',
      steps: ['“' + plain + '” is plain. It could grow.', 'The long one keeps adding “and… and… and…” until it runs on and on.', '“' + grown + '” adds a describing word and where, and then it stops.'] };
  });

  /* ---------------------------------------------------------------- capital letters: shared bank */
  var I_SENT = ['Mom and i baked bread.', 'Can i have a turn?', 'Dad and i went fishing.', 'Today i lost a tooth.', 'After lunch i read a book.', 'My friend and i ride bikes.',
    'May i pet your dog?', 'On Saturday i helped Grandpa.', 'Sam and i built a fort.', 'At the zoo i saw a lion.'];
  // wrong-word choices: other words in the sentence (not the first word, not i)
  function wordsOf(s) { return s.replace(/[.?!]$/, '').split(' '); }
  G('fwr.capital-i', function (R, ctx) {
    var L = ctx.level, s = R.pick(I_SENT), right = s.replace(/\bi\b/, 'I');
    var shape = ML.byLevel(ctx, 'pick', R.pick(['pick', 'which']), R.pick(['which', 'two']));
    if (shape === 'pick') {
      var wrong = L === 1 ? [s] : [s, right.replace(/^(\w)/, function (c) { return c.toLowerCase(); })];
      return { q: q([readme(L), para(big('Which sentence is written correctly?'))]), a: mcU(right, wrong),
        hint: 'Look at the word I. Is it a capital letter?',
        steps: ['When you write about yourself, I is always a capital letter.', 'The sentence also starts with a capital letter.', 'So: ' + right] };
    }
    if (shape === 'which') {
      var others = wordsOf(s).slice(1).filter(function (w) { return w !== 'i' && /^[a-z]/.test(w); });
      return { q: q([para('Which word needs a capital letter?'), para(big(s))]), a: mcU('i', R.sample(others, Math.min(2, others.length))),
        hint: 'Which little word means you, the writer?',
        steps: ['The word “i” means the writer.', 'I is always a capital letter, even in the middle of a sentence.', right] };
    }
    var s2 = R.pick(I_SENT.filter(function (x) { return x !== s; })), lowStart = low(s2), text = s.replace(/\bi\b/, 'I') + ' ' + lowStart;
    var firstW = wordsOf(lowStart)[0];
    var ch = [firstW, 'i', wordsOf(s)[1]].filter(function (x, i, a) { return a.indexOf(x) === i; });
    return { q: q([para('Two words in these sentences need a capital letter. Choose both.'), para(big(text))]), a: { t: 'mc', choices: ch, v: [0, 1] },
      hint: 'Check the start of each sentence, and the word I.',
      steps: ['“' + firstW + '” starts the second sentence, so it needs a capital: ' + cap(firstW) + '.', 'The word i means the writer, so it is always a capital: I.', right + ' ' + s2.replace(/\bi\b/, 'I')] };
  });

  /* ---------------------------------------------------------------- fwr.capital-names */
  var NAMES = [['Our puppy is named', 'biscuit', 'puppy'], ['My best friend is', 'maya', 'friend'], ['We visited', 'aunt rosa', 'aunt'], ['Our cat', 'pepper', 'cat'],
    ['My teacher is', 'mr. lopez', 'teacher'], ['The new girl is', 'hana', 'girl'], ['I gave the carrot to', 'daisy', 'horse'], ['Our dentist is', 'dr. bell', 'dentist']];
  var NAME_END = { 'Our cat': ' sleeps all day.' };
  function nameCap(n) { return n.split(' ').map(cap).join(' '); }
  function nameSent(nm, right) { var who = right ? nameCap(nm[1]) : nm[1]; return nm[0] + ' ' + who + (NAME_END[nm[0]] || '.'); }
  G('fwr.capital-names', function (R, ctx) {
    var L = ctx.level, nm = R.pick(NAMES), shape = ML.byLevel(ctx, 'pick', R.pick(['pick3', 'which']), R.pick(['grandma', 'pick3', 'grandma']));
    var right = nameSent(nm, true);
    if (shape === 'pick' || shape === 'pick3') {
      var noun = nm[2], allCap = right.replace(new RegExp('\\b' + noun + '\\b'), cap(noun));
      if (allCap === right) allCap = right.replace(/\b(is|named|to|visited)\b/, function (w) { return cap(w); });
      var wrong = L === 1 ? [nameSent(nm, false)] : [nameSent(nm, false), allCap];
      return { q: q([readme(L), para(big('Which sentence is written correctly?'))]), a: mcU(right, wrong),
        hint: 'A name begins with a capital letter. Words that are not names do not.',
        steps: ['“' + nameCap(nm[1]) + '” is a name, so it begins with ' + (nm[1].indexOf(' ') > 0 ? 'capitals.' : 'a capital.'), shape === 'pick3' ? '“' + noun + '” is not a name, so it stays small.' : 'So: ' + right, right] };
    }
    if (shape === 'which') {
      var text = nameSent(nm, false), name1 = nm[1].split(' ').pop(), others = wordsOf(nm[0]).slice(1).filter(function (w) { return /^[a-z]/.test(w); });
      return { q: q([para('Which word needs a capital letter?'), para(big(text))]), a: mcU(name1.replace(/\.$/, ''), R.sample(others, Math.min(2, others.length))),
        hint: 'Find the name.',
        steps: ['“' + nameCap(nm[1]) + '” is a name.', 'Names begin with capital letters: ' + right] };
    }
    // grandma: a name in “Hi, Grandma!” but not in “my grandma”
    var kin = R.pick(['grandma', 'grandpa', 'mom', 'dad']), asName = R.coin();
    var sent = asName ? R.pick(['Thank you, ', 'Look, ', 'Hi, ']) + kin + '!' : R.pick(['I baked cookies with my ', 'We visited my ', 'I made a card for my ']) + kin + '.';
    return { q: q([para('Does ' + quote(kin) + ' need a capital letter here?'), para(big(sent))]), a: mcKeep(['Yes, it is used as a name.', 'No, it is not used as a name.'], asName ? 0 : 1),
      hint: 'Could you put a name like Rosa in its place? Is there a word like my or our in front of it?',
      steps: asName ? ['Here you are talking to ' + kin + ', so it is used as a name.', 'It needs a capital: ' + sent.replace(kin, cap(kin))] : ['“my ' + kin + '” tells whose ' + kin + '. It is not used as a name here.', 'So it stays small: ' + sent] };
  });

  /* ---------------------------------------------------------------- fwr.days-months */
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var HOLIDAYS = [['Thanksgiving', 'November'], ['Halloween', 'October'], ['New Year’s Day', 'January'], ['Valentine’s Day', 'February'], ['Independence Day', 'July'], ['Labor Day', 'September']];
  var SEASONS = ['spring', 'summer', 'fall', 'winter'];
  var SEASON_OF = { January: 'winter', February: 'winter', March: 'spring', April: 'spring', June: 'summer', July: 'summer', August: 'summer', September: 'fall', October: 'fall', November: 'fall', December: 'winter' };
  G('fwr.days-months', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['day', 'month']), R.pick(['season', 'holiday', 'day']), R.pick(['all', 'all', 'season']));
    if (shape === 'day' || shape === 'month') {
      var w = shape === 'day' ? R.pick(DAYS) : R.pick(MONTHS), frame = shape === 'day' ? R.pick(['We go swimming on ', 'Our library day is ', 'I see Grandma every ']) : R.pick(['My birthday is in ', 'It snowed a lot in ', 'We planted seeds in ']);
      var right = frame + w + '.', wrong = [frame + w.toLowerCase() + '.'];
      if (L > 1) wrong.push(cap(frame.split(' ')[0]) + ' ' + frame.split(' ').slice(1).map(cap).join(' ') + w + '.');
      return { q: q([readme(L), para(big('Which sentence is written correctly?'))]), a: mcU(right, wrong),
        hint: 'Names of days and months begin with capital letters.',
        steps: ['“' + w + '” is the name of a ' + (shape === 'day' ? 'day of the week' : 'month') + '.', 'Days and months begin with capital letters: ' + right] };
    }
    if (shape === 'holiday') {
      var hd = R.pick(HOLIDAYS), r2 = 'We love ' + hd[0] + '.', w2 = 'We love ' + hd[0].toLowerCase() + '.', w3 = hd[0].indexOf(' ') > 0 ? 'We love ' + hd[0].replace(/ Day$/, ' day') + '.' : 'We Love ' + hd[0] + '.';
      return { q: q([para(big('Which sentence is written correctly?'))]), a: mcU(r2, [w2, w3]),
        hint: 'Every big word in a holiday’s name begins with a capital letter.',
        steps: ['“' + hd[0] + '” is the name of a holiday.', 'Each main word in it begins with a capital letter.', r2] };
    }
    if (shape === 'season') {
      var m = R.pick(MONTHS), se = SEASON_OF[m], r3 = 'In ' + m + ' it is ' + se + '.', ws = ['In ' + m + ' it is ' + cap(se) + '.', 'In ' + m.toLowerCase() + ' it is ' + se + '.'];
      return { q: q([para(big('Which sentence is written correctly?'))]), a: mcU(r3, ws),
        hint: 'Months begin with capital letters. Do seasons?',
        steps: ['“' + m + '” is a month, so it begins with a capital letter.', '“' + se + '” is a season. Seasons do not begin with capital letters.', r3] };
    }
    // all: choose every word that needs a capital
    var d = R.pick(DAYS), mo = R.pick(MONTHS.filter(function (x) { return x !== 'August'; })), se2 = SEASON_OF[mo];
    var text = 'On ' + d.toLowerCase() + ' in ' + mo.toLowerCase() + ', we had a ' + se2 + ' picnic.';
    var ch = [d.toLowerCase(), mo.toLowerCase(), se2, 'picnic'];
    return { q: q([para('Which words need a capital letter? Choose all of them.'), para(big(text))]), a: { t: 'mc', choices: ch, v: [0, 1], keep: true },
      hint: 'Days and months, yes. Seasons, no.',
      steps: ['“' + d + '” is a day and “' + mo + '” is a month: both need capitals.', '“' + se2 + '” is a season, so it stays small. “picnic” is not a name.', 'On ' + d + ' in ' + mo + ', we had a ' + se2 + ' picnic.'] };
  });

  /* ---------------------------------------------------------------- fwr.capital-places */
  var PLACE_NAMES = [['Oak Street', 'street'], ['Lincoln Park', 'park'], ['Texas', 'state'], ['Ohio', 'state'], ['Chicago', 'city'], ['the Pacific Ocean', 'ocean'],
    ['Lake Michigan', 'lake'], ['the Mississippi River', 'river'], ['Maple Road', 'road'], ['Pine School', 'school'], ['Green Valley Library', 'library'], ['the Rocky Mountains', 'mountains']];
  var PLACE_FRAMES = ['We drove to ', 'My cousin lives near ', 'We had a picnic by ', 'Have you been to '];
  var PLACE_FRAMES_BIG = ['We drove to ', 'My cousin lives in ', 'Have you been to '];
  function placeLow(p) { return p.toLowerCase().replace(/^the /, 'the '); }
  G('fwr.capital-places', function (R, ctx) {
    var L = ctx.level, pl = R.pick(PLACE_NAMES), fr = R.pick(/^(state|city)$/.test(pl[1]) ? PLACE_FRAMES_BIG : PLACE_FRAMES), end = /^Have/.test(fr) ? '?' : '.';
    var shape = ML.byLevel(ctx, 'pick', R.pick(['pick3', 'which']), R.pick(['common', 'common', 'pick3']));
    var right = fr + pl[0] + end;
    if (shape === 'pick' || shape === 'pick3') {
      var wrong = [fr + placeLow(pl[0]) + end];
      if (L > 1) wrong.push(/^the /.test(pl[0]) ? fr + 'The ' + pl[0].slice(4) + end : fr + pl[0].split(' ')[0] + (pl[0].indexOf(' ') > 0 ? ' ' + pl[0].split(' ').slice(1).join(' ').toLowerCase() : '') + end);
      return { q: q([readme(L), para(big('Which sentence is written correctly?'))]), a: mcU(right, wrong),
        hint: 'The name of one special place begins with capital letters.',
        steps: ['“' + pl[0].replace(/^the /, '') + '” is the name of one special ' + pl[1] + '.', 'Each main word of its name begins with a capital letter' + (/^the /.test(pl[0]) ? '; the little word the stays small.' : '.'), right] };
    }
    if (shape === 'which') {
      var one = R.pick(PLACE_NAMES.filter(function (x) { return x[0].indexOf(' ') < 0; })); fr = R.pick(PLACE_FRAMES_BIG); end = /^Have/.test(fr) ? '?' : '.';
      var t = fr + one[0].toLowerCase() + end;
      var others = wordsOf(fr).slice(1).filter(function (w) { return /^[a-z]/.test(w); });
      return { q: q([para('Which word needs a capital letter?'), para(big(t))]), a: mcU(one[0].toLowerCase(), R.sample(others, Math.min(2, others.length))),
        hint: 'Find the name of a place.',
        steps: ['“' + one[0] + '” is the name of a ' + one[1] + '.', 'A place’s name begins with a capital: ' + fr + one[0] + end] };
    }
    // common: “the park” stays small; “Lincoln Park” gets capitals
    var common = pl[1], useName = R.coin(), sent = useName ? fr + pl[0] + end : fr + 'the ' + common + end, wrongS = useName ? fr + placeLow(pl[0]) + end : fr + 'the ' + cap(common) + end;
    if (common === 'state' || common === 'city') { common = 'park'; sent = useName ? fr + 'Lincoln Park' + end : fr + 'the park' + end; wrongS = useName ? fr + 'lincoln park' + end : fr + 'the Park' + end; }
    return { q: q([para(big('Which sentence is written correctly?'))]), a: mcU(sent, [wrongS, useName ? fr + 'the ' + cap(common) + end : fr + 'The ' + common + end]),
      hint: 'Is it the name of one special place, or just a word for a kind of place?',
      steps: useName ? ['“' + sent.replace(fr, '').replace(/[.?]$/, '') + '” is the name of one special place, so it gets capitals.', sent] : ['“the ' + common + '” is a word for a kind of place, not its name.', 'So it stays small: ' + sent] };
  });

  /* ---------------------------------------------------------------- spelling: picture words */
  function picWord(e) { return { name: 'wr-picture', opts: { place: 'plain', items: [{ e: e, x: 50, y: 78, s: 2.2 }], quiet: true, interactive: false } }; }
  function blankOut(word, from, len) { return word.slice(0, from) + '_'.repeat(len) + word.slice(from + len); }
  /* ---------------------------------------------------------------- fwr.short-vowels */
  var SHORT = [['cat', '🐈'], ['hat', '🎩'], ['bat', '🦇'], ['van', '🚐'], ['can', '🥫'], ['bed', '🛏️'], ['web', '🕸️'], ['ten', '🔟'], ['pen', '🖊️'], ['pig', '🐖'], ['pin', '📌'],
    ['six', '6️⃣'], ['dog', '🐕'], ['fox', '🦊'], ['box', '📦'], ['log', '🪵'], ['sun', '☀️'], ['bus', '🚌'], ['bug', '🐞'], ['cup', '☕'], ['nut', '🥜']];
  var VOWELS = ['a', 'e', 'i', 'o', 'u'];
  G('fwr.short-vowels', function (R, ctx) {
    var L = ctx.level, sw = R.pick(SHORT), w = sw[0], v = w.charAt(1);
    var shape = ML.byLevel(ctx, 'vowel', 'vowel', R.pick(['spell', 'spell', 'vowel']));
    if (shape === 'vowel') {
      var opts = L === 1 ? [v, R.pick(VOWELS.filter(function (x) { return x !== v; }))].sort() : VOWELS.slice();
      // level 2: the e/i mix-up is the trouble spot, so those words come up more
      return { q: q([readme(L, 'Say the picture’s name slowly with your child, and listen for the middle sound.'), para('Say the word. Which letter goes in the middle?'), para(big(blankOut(w, 1, 1)))]),
        a: mcKeep(opts, opts.indexOf(v)), viz: picWord(sw[1]),
        hint: 'Say it slowly: ' + w.split('').join('-') + '. What sound is in the middle?',
        steps: ['Say it slowly: ' + w.charAt(0) + ' - ' + v + ' - ' + w.charAt(2) + '.', 'The middle sound is short ' + v + '.', 'The word is ' + w + '.'] };
    }
    var pair = { e: 'i', i: 'e', a: 'e', o: 'u', u: 'o' }[v], near = w.charAt(0) + pair + w.charAt(2), noV = w.charAt(0) + w.charAt(2);
    return { q: q([para(big('Which word names the picture?'))]), a: mcU(w, [near, noV]), viz: picWord(sw[1]),
      hint: 'Say the word slowly. Listen for the vowel in the middle, and make sure there is one.',
      steps: ['Say it slowly: ' + w.split('').join(' - ') + '.', 'The middle sound is short ' + v + ', so the word is ' + w + '.', '“' + noV + '” leaves the vowel out; every word needs one.'] };
  });

  /* ---------------------------------------------------------------- fwr.digraphs */
  // [word, picture, the digraph, where it starts]
  var DIG = [['ship', '🚢', 'sh', 0], ['shell', '🐚', 'sh', 0], ['fish', '🐟', 'sh', 2], ['cheese', '🧀', 'ch', 0], ['chair', '🪑', 'ch', 0], ['peach', '🍑', 'ch', 3],
    ['thumb', '👍', 'th', 0], ['tooth', '🦷', 'th', 3], ['whale', '🐋', 'wh', 0], ['wheel', '🛞', 'wh', 0], ['duck', '🦆', 'ck', 2],
    ['sock', '🧦', 'ck', 2], ['clock', '⏰', 'ck', 3], ['truck', '🚚', 'ck', 3], ['rock', '🪨', 'ck', 2], ['chick', '🐤', 'ch', 0]];
  var DIG_ONE = { sh: 's', ch: 'c', th: 't', wh: 'w', ck: 'k' };
  G('fwr.digraphs', function (R, ctx) {
    var L = ctx.level, d = R.pick(DIG), w = d[0], dg = d[2];
    var shape = ML.byLevel(ctx, 'fill', 'fill', R.pick(['spell', 'fill']));
    if (shape === 'fill') {
      var others = ['sh', 'ch', 'th', 'wh', 'ck'].filter(function (x) { return x !== dg && !(d[3] === 0 && x === 'ck') && !(d[3] > 0 && x === 'wh'); });
      var opts = L === 1 ? [dg, DIG_ONE[dg]] : [dg, DIG_ONE[dg], R.pick(others)];
      return { q: q([readme(L, 'Say the picture’s name with your child. Listen for the sound the two letters make together.'), para('Which letters finish the word?'), para(big(blankOut(w, d[3], 2)))]),
        a: mcU(dg, opts.slice(1)), viz: picWord(d[1]),
        hint: 'Two letters can spell one sound. Say the word and listen.',
        steps: ['Say it: ' + w + '.', 'The sound is spelled with two letters together: ' + dg + '.', 'The word is ' + w + '.'] };
    }
    var one = w.slice(0, d[3]) + DIG_ONE[dg] + w.slice(d[3] + 2), swapped = w.slice(0, d[3]) + dg.charAt(1) + dg.charAt(0) + w.slice(d[3] + 2);
    if (dg === 'ck') swapped = 'ck' + w.slice(1, d[3]) + w.charAt(0);
    if (dg === 'ck') swapped = w.slice(0, d[3]) + 'kc';
    return { q: q([para(big('Which word is spelled right?'))]), a: mcU(w, [one, swapped]), viz: picWord(d[1]),
      hint: 'Look for the two letters that spell one sound together, in the right order.',
      steps: ['Say it: ' + w + '.', 'The sound is spelled ' + dg + (dg === 'ck' ? ', which comes at the end of a short word, right after the short vowel.' : ', two letters for one sound.'), 'So the word is ' + w + '.'] };
  });

  /* ---------------------------------------------------------------- fwr.silent-e */
  // [the e-word, its short partner, picture of the e-word or null]; [short word, its e-partner, picture of the short word]
  var LONGE = [['kite', 'kit', '🪁'], ['cube', 'cub', '🧊'], ['plane', 'plan', '✈️'], ['cake', 'cak', '🎂'], ['bone', 'bon', '🦴'], ['rose', 'ros', '🌹'], ['nose', 'nos', '👃'], ['five', 'fiv', '5️⃣'], ['nine', 'nin', '9️⃣'], ['bike', 'bik', '🚲'], ['cone', 'con', '🍦']];
  var SHORTE = [['hat', 'hate', '🎩'], ['cap', 'cape', '🧢'], ['pin', 'pine', '📌'], ['tub', 'tube', '🛁'], ['can', 'cane', '🥫'], ['kit', 'kite', null]];
  var MAKE_E = [['cap', 'cape'], ['kit', 'kite'], ['hop', 'hope'], ['tap', 'tape'], ['cub', 'cube'], ['pin', 'pine'], ['rob', 'robe'], ['not', 'note'], ['man', 'mane'], ['tub', 'tube'], ['dim', 'dime'], ['rid', 'ride']];
  function vname(w) { var v = w.replace(/[^aeiou]/g, '').charAt(0); return v; }
  G('fwr.silent-e', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'pic', R.pick(['make', 'pic']), R.pick(['mixed', 'mixed', 'make']));
    if (shape === 'pic') {
      var le = R.pick(LONGE);
      return { q: q([readme(L, 'Say the picture’s name with your child. Does the vowel say its name?'), para(big('Which word names the picture?'))]), a: mcU(le[0], [le[1]]), viz: picWord(le[2]),
        hint: 'Does the vowel say its name? Then the word needs a silent e at the end.',
        steps: ['Say it: ' + le[0] + '. The ' + vname(le[0]) + ' says its name.', 'The silent e at the end makes the vowel say its name.', 'So the word is ' + le[0] + '.'] };
    }
    if (shape === 'make') {
      var m = R.pick(MAKE_E), v = vname(m[0]);
      var wrong = [m[0] + m[0].slice(-1), m[0].slice(0, 1) + v + v + m[0].slice(2)];
      return { q: q([para('Add a silent e to the end of this word. What new word do you get?'), para(big(m[0]))]), a: mcU(m[1], wrong),
        hint: 'Just add an e at the very end.',
        steps: [m[0] + ' + e = ' + m[1] + '.', 'The e is silent, and it makes the ' + v + ' say its name: ' + m[0] + ' → ' + m[1] + '.'] };
    }
    var mixLong = R.coin(), it = mixLong ? R.pick(LONGE) : R.pick(SHORTE.filter(function (x) { return x[2]; }));
    var right = mixLong ? it[0] : it[0], wrongW = mixLong ? it[1] : it[1];
    return { q: q([para(big('Which word names the picture?'))]), a: mcU(right, [wrongW]), viz: picWord(it[2]),
      hint: 'Say it slowly. Does the vowel say its name, or make its short sound?',
      steps: mixLong ? ['Say it: ' + it[0] + '. The vowel says its name.', 'So it needs the silent e: ' + it[0] + '.'] : ['Say it: ' + it[0] + '. The vowel makes its short sound.', 'So there is no silent e: ' + it[0] + '. (“' + it[1] + '” is a different word.)'] };
  });

  /* ---------------------------------------------------------------- fwr.vowel-teams */
  // [word, picture, the team, where the team starts, teams that make the same sound (the trouble)]
  var TEAMS = [['rain', '🌧️', 'ai', 1], ['train', '🚆', 'ai', 2], ['snail', '🐌', 'ai', 2], ['tree', '🌳', 'ee', 2], ['bee', '🐝', 'ee', 1], ['sheep', '🐑', 'ee', 2],
    ['seed', '🌱', 'ee', 1], ['leaf', '🍃', 'ea', 1], ['peach', '🍑', 'ea', 1], ['seal', '🦭', 'ea', 1], ['boat', '⛵', 'oa', 1], ['goat', '🐐', 'oa', 1], ['coat', '🧥', 'oa', 1],
    ['soap', '🧼', 'oa', 1], ['snow', '❄️', 'ow', 2], ['bowl', '🥣', 'ow', 1]];
  var SAME = { ai: ['ay', 'a'], ee: ['ea', 'e'], ea: ['ee', 'e'], oa: ['ow', 'o'], ow: ['oa', 'o'] };
  var AY_WORDS = [['play', 'plai'], ['day', 'dai'], ['hay', 'hai'], ['say', 'sai'], ['stay', 'stai'], ['tray', 'trai']];
  G('fwr.vowel-teams', function (R, ctx) {
    var L = ctx.level, tm = R.pick(TEAMS), w = tm[0], team = tm[2];
    var shape = ML.byLevel(ctx, 'fill', 'fill', R.pick(['spell', 'ay', 'fill']));
    if (shape === 'fill') {
      var opts = L === 1 ? [team, SAME[team][1]] : [team, SAME[team][0], SAME[team][1]];
      var blank = w.slice(0, tm[3]) + '__' + w.slice(tm[3] + 2);
      return { q: q([readme(L, 'Say the picture’s name with your child. Which two letters spell the long vowel sound?'), para('Which letters finish the word?'), para(big(blank))]), a: mcU(team, opts.slice(1)), viz: picWord(tm[1]),
        hint: 'Two vowels together often spell one long sound. Which team does this word use?',
        steps: ['Say it: ' + w + '. You hear a long vowel sound.', 'In this word, the team ' + team + ' spells it: ' + w + '.', SAME[team][0] + ' can make the same sound in other words, so it helps to remember how this one looks.'] };
    }
    if (shape === 'ay') {
      var ay = R.pick(AY_WORDS), ai2 = R.pick(['rain', 'train', 'snail', 'paint', 'wait']);
      return { q: q([para(big('Which word is spelled right?'))]), a: mcU(ay[0], [ay[1], ay[0].replace('ay', 'a')]),
        hint: 'At the end of a word, the long a sound is usually spelled ay.',
        steps: ['The long a sound at the end of a word is usually spelled ay: ' + ay[0] + '.', 'In the middle of a word it is often ai, as in ' + ai2 + '.'] };
    }
    var wrong1 = w.slice(0, tm[3]) + SAME[team][0] + w.slice(tm[3] + 2), wrong2 = w.slice(0, tm[3]) + SAME[team][1] + w.slice(tm[3] + 2);
    return { q: q([para(big('Which word names the picture?'))]), a: mcU(w, [wrong1, wrong2]), viz: picWord(tm[1]),
      hint: 'Picture the word in a book. Which spelling looks right?',
      steps: ['Say it: ' + w + '.', 'This word uses the team ' + team + ': ' + w + '.', '“' + wrong1 + '” uses a team that can make the same sound, but not in this word.'] };
  });

  /* ---------------------------------------------------------------- fwr.word-endings */
  var END_DOUBLE = ['hop', 'stop', 'clap', 'skip', 'hug', 'wag', 'drop', 'plan', 'shop', 'nap', 'rub', 'pat'];
  var END_E = ['hope', 'bake', 'smile', 'wave', 'joke', 'dance', 'skate', 'race', 'hike', 'rake']; // regular verbs only (not ride: rode)
  var END_PLAIN = ['jump', 'play', 'help', 'look', 'kick', 'pick', 'rest', 'paint', 'call', 'fish'];
  G('fwr.word-endings', function (R, ctx) {
    var L = ctx.level, kind = ML.byLevel(ctx, 'plain', R.pick(['double', 'e']), R.pick(['pair', 'double', 'e']));
    var ending = kind === 'plain' ? R.pick(['ed', 'ing', 's']) : R.pick(['ed', 'ing']);
    if (kind === 'pair') {
      var pr = R.pick([['hop', 'hope'], ['tap', 'tape'], ['plan', 'plane'], ['rob', 'robe'], ['scrap', 'scrape']]), useE = R.coin(), base = useE ? pr[1] : pr[0], other = useE ? pr[0] : pr[1];
      var r = W().ing(base), w1 = W().ing(other), w2 = useE ? base + 'ing' : base + 'eing';
      return { q: q([para('Add -ing to ' + quote(base) + '. Which word is right?')]), a: mcU(r, [w1, w2]),
        hint: useE ? 'Does the word end in a silent e? Drop it before -ing.' : 'Short word, short vowel, one last consonant: double it before -ing.',
        steps: useE ? ['“' + base + '” ends in a silent e.', 'Drop the e and add -ing: ' + r + '.', '“' + w1 + '” comes from ' + other + ', a different word.'] : ['“' + base + '” is a short word with a short vowel and one consonant at the end.', 'Double the last letter and add -ing: ' + r + '.', '“' + w1 + '” comes from ' + other + ', a different word.'] };
    }
    var v = R.pick(kind === 'plain' ? END_PLAIN : kind === 'double' ? END_DOUBLE : END_E);
    var right = ending === 'ed' ? W().past(v) : ending === 'ing' ? W().ing(v) : W().s3(v);
    // wrong choices from real mistakes: no double (hoping for hopping), a spelling by sound (hopt), keeping the e (hopeing)
    var wrong = kind === 'plain' ? (ending === 's' ? [v + 'es', v] : [v + v.slice(-1) + ending, v]) : kind === 'double' ? (ending === 'ing' ? [v + ending, v + 'eing'] : [v + ending, v + (/[gbnm]$/.test(v) ? 'd' : 't')]) : (ending === 'ing' ? [v + 'ing', v.slice(0, -1) + v.slice(-2, -1) + 'ing'] : [v + 'ed', v.slice(0, -1) + v.slice(-2, -1) + 'ed']);
    var why = kind === 'plain' ? 'Just add the ending: ' + v + ' + ' + ending + ' = ' + right + '.' : kind === 'double' ? '“' + v + '” is short, with a short vowel and one consonant at the end. Double the last letter, then add -' + ending + ': ' + right + '.' : '“' + v + '” ends in a silent e. ' + (ending === 'ing' ? 'Drop the e, then add -ing: ' + right + '.' : 'It already has an e, so just add -d: ' + right + '.');
    return { q: q([readme(L), para('Add -' + ending + ' to ' + quote(v) + '. Which word is right?')]), a: mcU(right, wrong, L === 1 ? 1 : 2),
      hint: kind === 'plain' ? 'Does the word need any change, or just the ending?' : kind === 'double' ? 'Short vowel, one last consonant: what happens before -' + ending + '?' : 'What happens to a silent e before an ending?',
      steps: [why] };
  });

  /* ---------------------------------------------------------------- fwr.tricky-words */
  var TRICKY = [['said', ['sed', 'sayd'], 'Mom ___ we could go.'], ['was', ['wuz', 'woz'], 'It ___ a sunny day.'], ['of', ['uv', 'ov'], 'I ate a bowl ___ soup.'],
    ['they', ['thay', 'thei'], 'Are ___ coming too?'], ['could', ['cud', 'coud'], 'I ___ not find my shoe.'], ['because', ['becuz', 'becaus'], 'I smiled ___ I was happy.'],
    ['friend', ['frend', 'freind'], 'My ___ came over.'], ['does', ['duz', 'dus'], 'What ___ the fox say?'], ['people', ['peeple', 'pepole'], 'Many ___ came to the fair.'],
    ['again', ['agen', 'agin'], 'Please read it ___.'], ['would', ['wud', 'woud'], 'I ___ like some milk.'], ['were', ['wer', 'wur'], 'We ___ late for school.'],
    ['what', ['wut', 'whut'], '___ is your name?'], ['there', ['thair', 'ther'], 'Look over ___!']];
  G('fwr.tricky-words', function (R, ctx) {
    var L = ctx.level, tw = R.pick(TRICKY), shape = ML.byLevel(ctx, 'fill', 'fill', R.pick(['find', 'find', 'fill']));
    if (shape === 'fill') {
      var sent = tw[2], start = /^___/.test(sent);
      return { q: q([readme(L), para('Which spelling is right?'), para(big(sent))]), a: mcU(start ? cap(tw[0]) : tw[0], tw[1].slice(0, L === 1 ? 1 : 2).map(function (x) { return start ? cap(x) : x; })),
        hint: 'This word does not follow the usual pattern. Which one looks right?',
        steps: ['“' + tw[0] + '” is a tricky word: it is not spelled the way it sounds.', 'Learn it by heart: ' + tw[0].split('').join('-') + '.', sent.replace('___', start ? cap(tw[0]) : tw[0])] };
    }
    var bad = R.pick(tw[1]), sent2 = tw[2].replace('___', /^___/.test(tw[2]) ? cap(bad) : bad);
    var otherWords = wordsOf(tw[2]).filter(function (w) { return w !== '___' && w.replace(/[^a-z]/gi, '').length > 2; }).map(function (w) { return w.replace(/[^a-zA-Z]/g, ''); });
    var badShown = /^___/.test(tw[2]) ? cap(bad) : bad;
    return { q: q([para('One word is spelled wrong. Which one?'), para(big(sent2))]), a: mcU(badShown, R.sample(otherWords, Math.min(2, otherWords.length))),
      hint: 'Look for a word you know by heart that looks different.',
      steps: ['“' + badShown + '” is spelled the way it sounds, but that is not how this word is spelled.', 'The right spelling is “' + tw[0] + '”.', tw[2].replace('___', /^___/.test(tw[2]) ? cap(tw[0]) : tw[0])] };
  });


  /* ---------------------------------------------------------------- joining ideas: sentence pairs */
  // the second part is written as it appears after a joining word (lowercase unless it starts with I or a name)
  var AND_P = [['I have a cat', 'she is gray'], ['We went to the beach', 'we built a sandcastle'], ['Dad made soup', 'Mom baked bread'], ['The sun came out', 'the birds sang'],
    ['Mia plays the drum', 'Leo plays the guitar'], ['I fed the fish', 'I watered the plants'], ['The bus stopped', 'the kids got on'], ['Grandma knits hats', 'she gives them away']];
  var BUT_P = [['I like snow', 'my dog does not'], ['The box was big', 'it was light'], ['We wanted to swim', 'the pool was closed'], ['Leo is little', 'he runs fast'],
    ['It was sunny', 'the wind was cold'], ['I looked for my hat', 'I could not find it'], ['The soup smelled good', 'it was too hot to eat'], ['Our dog is old', 'he still loves to play']];
  // [reason, result]: “result because reason” and “reason, so result”
  // no pronoun in one part points to a noun in the other, so both orders read well
  var WHY_P = [['I was cold', 'I put on a coat'], ['It started to rain', 'we went inside'], ['I was sleepy', 'I went to bed early'], ['I was hungry', 'I ate an apple'],
    ['The road was icy', 'Dad drove slowly'], ['The lights went out', 'we used a flashlight'], ['The ice was thin', 'we stayed off the pond'], ['My shoe was untied', 'I tripped'],
    ['The soil was dry', 'I watered the plant'], ['It was my birthday', 'we had a party']];
  function sent1(x) { return W().cap(x) + '.'; }
  function low2(x) { return /^(I|Mom|Dad|Leo|Mia|Grandma|Grandpa)\b/.test(x) ? x : low(x); }
  function joinS(a, b, word) { return W().cap(a) + ', ' + word + ' ' + low2(b) + '.'; }
  function becauseS(reason, result) { return W().cap(result) + ' because ' + low2(reason) + '.'; }

  /* ---------------------------------------------------------------- fwr.join-with-and */
  G('fwr.join-with-and', function (R, ctx) {
    var L = ctx.level, p = R.pick(AND_P), right = joinS(p[0], p[1], 'and'), two = sent1(p[0]) + ' ' + sent1(p[1]);
    var shape = ML.byLevel(ctx, 'join', R.pick(['join', 'pair']), R.pick(['andthen', 'pair', 'andthen']));
    var combine = { name: 'wr-combine', opts: { parts: [sent1(p[0]), sent1(p[1])], quiet: true, interactive: false } };
    if (shape === 'join') {
      var runTogether = W().cap(p[0]) + ' ' + low2(p[1]) + '.', withBut = joinS(p[0], p[1], 'but');
      return { q: q([readme(L), para('Join the two sentences with <b>and</b>. Which is right?'), para(big(two))]), a: mcU(right, L === 1 ? [runTogether] : [runTogether, withBut]), viz: combine,
        hint: 'Keep both ideas, and put and between them.',
        steps: ['Both ideas go together, so and can join them.', 'Put a comma and the word and between them.', right] };
    }
    if (shape === 'pair') {
      var bb = R.sample(BUT_P, 2), b = bb[0], w2 = bb[1], choices = [joinS(p[0], p[1], 'and'), joinS(b[0], b[1], 'and'), joinS(w2[0], w2[1], 'and')];
      return { q: q([para(big('Which sentence uses and the best way?'))]), a: mcU(choices[0], choices.slice(1)),
        hint: 'And joins two ideas that go together the same way. Does the second idea surprise you?',
        steps: ['“' + choices[0] + '” joins two ideas that simply go together.', '“' + sent1(b[0]) + ' ' + sent1(b[1]) + '” has a surprise: but fits better.', '“' + sent1(w2[0]) + ' ' + sent1(w2[1]) + '” has a surprise too.'] };
    }
    var t = R.pick(['the zoo', 'the farm', 'the fair', 'the park']), andThen = 'We went to ' + t + ' and then we saw the animals and then we ate lunch and then we went home.';
    var better = 'We went to ' + t + '. First we saw the animals. Then we ate lunch. Last, we went home.';
    var also = 'We went to ' + t + ', and then we saw the animals, and then we ate lunch, and then we went home.';
    return { q: q([para(big('Which one is easier to read?'))]), a: mcU(better, [andThen, also]),
      hint: 'Does every idea need to be hooked on with and then?',
      steps: ['The other two hook every idea on with “and then,” so they make one long string.', 'Short sentences with time words let the reader take a breath.', better] };
  });

  /* ---------------------------------------------------------------- fwr.join-with-but */
  G('fwr.join-with-but', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'word', 'word', R.pick(['right', 'right', 'word']));
    if (shape === 'word') {
      var isBut = R.coin(), p = isBut ? R.pick(BUT_P) : R.pick(AND_P), word = isBut ? 'but' : 'and';
      return { q: q([readme(L), para('Which word joins these ideas best?'), para(big(W().cap(p[0]) + ', ___ ' + low2(p[1]) + '.'))]), a: mcKeep(['and', 'but'], isBut ? 1 : 0),
        viz: { name: 'wr-combine', opts: { parts: [sent1(p[0]), sent1(p[1])], quiet: true, interactive: false } },
        hint: 'Are the two ideas different, or is the second one a surprise? Then use but.',
        steps: isBut ? ['“' + sent1(p[0]) + '” and “' + sent1(p[1]) + '” do not go the same way. The second is a surprise.', 'So but joins them: ' + joinS(p[0], p[1], 'but')] : ['The two ideas go together the same way. Nothing is a surprise.', 'So and joins them: ' + joinS(p[0], p[1], 'and')] };
    }
    var b = R.pick(BUT_P), a2 = R.sample(AND_P, 2), right = joinS(b[0], b[1], 'but');
    return { q: q([para(big('Which sentence uses but the right way?'))]), a: mcU(right, [joinS(a2[0][0], a2[0][1], 'but'), joinS(a2[1][0], a2[1][1], 'but')]),
      hint: 'But needs two ideas that are different, or a surprise.',
      steps: ['In “' + right + '” the second idea is a surprise after the first. But fits.', 'In the other two, the ideas go together. They need and, not but.'] };
  });

  /* ---------------------------------------------------------------- fwr.because-so */
  G('fwr.because-so', function (R, ctx) {
    var L = ctx.level, p = R.pick(WHY_P), shape = ML.byLevel(ctx, 'word', 'word', R.pick(['sense', 'sense', 'word']));
    if (shape === 'word') {
      var useSo = R.coin(), text = useSo ? W().cap(p[0]) + ', ___ ' + low2(p[1]) + '.' : W().cap(p[1]) + ' ___ ' + low2(p[0]) + '.';
      return { q: q([readme(L), para('Which word fits?'), para(big(text))]), a: mcKeep(['because', 'so'], useSo ? 1 : 0),
        hint: 'Because comes right before the reason. So comes right before what happened as a result.',
        steps: useSo ? ['First comes the reason: ' + low2(p[0]) + '.', 'Then what happened as a result: ' + low2(p[1]) + '.', 'So goes before the result: ' + joinS(p[0], p[1], 'so')] : ['First comes what happened: ' + low2(p[1]) + '.', 'Then the reason: ' + low2(p[0]) + '.', 'Because goes before the reason: ' + becauseS(p[0], p[1])] };
    }
    var useB = R.coin(), right = useB ? becauseS(p[0], p[1]) : joinS(p[0], p[1], 'so');
    var swapB = becauseS(p[1], p[0]), swapS = joinS(p[1], p[0], 'so');
    return { q: q([para(big('Which sentence makes sense?'))]), a: mcU(right, [swapB, swapS]),
      hint: 'Which idea is the reason? It goes right after because, or right before so.',
      steps: ['The reason is “' + low2(p[0]) + '”. What happened is “' + low2(p[1]) + '”.', 'Because goes right before the reason, and so goes right before the result.', 'So “' + right + '” makes sense. The other two have the reason and the result switched.'] };
  });

  /* ---------------------------------------------------------------- fwr.commas-in-lists */
  var LISTS = [['We packed', ['apples', 'grapes', 'cheese']], ['I saw', ['a duck', 'a frog', 'a turtle']], ['My favorite colors are', ['red', 'blue', 'green']],
    ['Grandma grows', ['beans', 'corn', 'squash']], ['We need', ['eggs', 'milk', 'bread']], ['Leo has', ['a cat', 'a dog', 'two fish']],
    ['On the beach we found', ['shells', 'rocks', 'a crab']], ['I can hop', ['skip', 'jump']], ['Bring your hat', ['your mittens', 'your scarf']], ['We sang', ['danced', 'clapped']]];
  function listS(start, items, serial) { var n = items.length; return start + ' ' + items.slice(0, n - 1).join(', ') + (serial ? ',' : '') + ' and ' + items[n - 1] + '.'; }
  // the lists for “hop, skip and jump” style entries: the first word belongs to the list
  function listOf(L0) { if (L0[1].length === 2) { var w = L0[0].split(' '); return { start: w.slice(0, -1).join(' '), items: [w[w.length - 1]].concat(L0[1]) }; } return { start: L0[0], items: L0[1] }; }
  G('fwr.commas-in-lists', function (R, ctx) {
    var L = ctx.level, li = listOf(R.pick(LISTS)), serial = R.coin(), right = listS(li.start, li.items, serial);
    var none = li.start + ' ' + li.items.slice(0, -1).join(' ') + ' and ' + li.items[li.items.length - 1] + '.';
    var every = (li.start + ' ' + li.items.slice(0, -1).join(' ') + ' and ' + li.items[li.items.length - 1]).split(' ').join(', ') + '.';
    var shape = ML.byLevel(ctx, 'pick', R.pick(['pick3', 'gap']), R.pick(['all', 'gap', 'all']));
    var bothNote = 'Some writers put a comma before and in a list (' + listS(li.start, li.items, true) + '), and some leave it out (' + listS(li.start, li.items, false) + '). Both ways are used.';
    if (shape === 'pick' || shape === 'pick3') {
      return { q: q([readme(L), para(big('Which sentence has commas in the right places?'))]), a: mcU(right, L === 1 ? [none] : [none, every]),
        hint: 'A list of three things needs commas to keep the things apart.',
        steps: ['The list has three things: ' + li.items.join(', ') + '.', 'Commas go between the things in the list, not after every word.', bothNote] };
    }
    if (shape === 'gap') {
      var text = (li.start + ' ' + li.items.slice(0, -1).join(' ') + ' and ' + li.items[li.items.length - 1]), words = text.split(' ');
      var startN = li.start.split(' ').length, firstEnd = startN + li.items[0].split(' ').length - 1;
      var andAt = words.lastIndexOf('and'), gaps = [startN - 1, firstEnd, andAt].sort(function (a, b) { return a - b; });
      var num = gaps.indexOf(firstEnd);
      return { q: q([para('Which numbered space needs a comma?')]), a: mcKeep(numbersOf(3), num),
        viz: { name: 'wr-punct', opts: { text: text + '.', gaps: gaps, quiet: true, interactive: false, big: true } },
        hint: 'Find the first thing in the list. The comma goes right after it.',
        steps: ['The list is ' + li.items.join(', ') + '.', 'A comma goes after “' + li.items[0] + '”, at space ' + (num + 1) + ', to keep it apart from the next thing.', 'No comma goes after “' + li.start.split(' ').pop() + '” or after “and.”'] };
    }
    var ch = [listS(li.start, li.items, true), listS(li.start, li.items, false), none, every];
    return { q: q([para('Which sentences use commas correctly? Choose all that are right.')]), a: { t: 'mc', choices: ch, v: [0, 1] },
      hint: 'Is there more than one right way?',
      steps: ['Commas go between the things in a list.', bothNote, 'A list with no commas runs together, and a comma after every word breaks it into pieces.'] };
  });

  /* ---------------------------------------------------------------- writing about a picture */
  function whereOf(t) { return /^(in|on|under|by|at|into) /.test(t.w) ? t.w : W().PLACES[t.place].at; }
  function wwwSentence(t) { return /^(in|on|under|by|at|into) /.test(t.w) ? full(t) : t.s + ' ' + t.v + ' ' + t.w + ' ' + W().PLACES[t.place].at + '.'; }
  function itemName(it) { var k = it.k; return k ? ((W().ACTORS[k] || W().THINGS[k] || {}).n || k) : ''; }
  /* ---------------------------------------------------------------- fwr.who-what-where */
  G('fwr.who-what-where', function (R, ctx) {
    var L = ctx.level, t = R.pick(TELL.filter(function (x) { return W().PLACES[x.place].at && x.place !== 'night'; })), s = wwwSentence(t), where = whereOf(t);
    var shape = ML.byLevel(ctx, 'tells', R.pick(['missing', 'tells']), R.pick(['where', 'missing', 'where']));
    if (shape === 'tells') {
      var list = t.items.map(function (it) { return W().cap(W().article(itemName(it))) + ' ' + itemName(it) + '.'; }).join(' ');
      var half = t.s + ' ' + t.v + (/^(in|on|under|by|at|into) /.test(t.w) ? '' : ' ' + t.w) + '.';
      return { q: q([readme(L), para(big('Which sentence tells who, what they are doing, and where?'))]), a: mcU(s, L === 1 ? [list] : [list, half]), viz: pic(t.place, t.items),
        hint: 'Look for who, what they are doing, and where.',
        steps: ['Who? ' + t.s + '. What are they doing? ' + cap(t.v) + (/^(in|on|under|by|at|into) /.test(t.w) ? '' : ' ' + t.w) + '. Where? ' + cap(where) + '.', '“' + s + '” tells all three.', '“' + list + '” only lists things. It does not tell what is happening.'] };
    }
    if (shape === 'missing') {
      var miss = R.pick(['who', 'doing', 'where']), verbPart = t.v + (/^(in|on|under|by|at|into) /.test(t.w) ? '' : ' ' + t.w);
      var text = miss === 'who' ? cap(verbPart) + ' ' + where + '.' : miss === 'doing' ? t.s + ' ' + where + '.' : t.s + ' ' + verbPart + '.';
      return { q: q([para('Look at the picture. What is this sentence missing?'), para(big(text))]), a: mcKeep(['who', 'what they are doing', 'where'], ['who', 'doing', 'where'].indexOf(miss)), viz: pic(t.place, t.items),
        hint: 'Ask all three: Who? What are they doing? Where?',
        steps: ['Who? ' + (miss === 'who' ? 'It does not say.' : t.s + '.'), 'What are they doing? ' + (miss === 'doing' ? 'It does not say.' : cap(verbPart) + '.'), 'Where? ' + (miss === 'where' ? 'It does not say.' : cap(where) + '.'), 'A sentence that tells all three: ' + s] };
    }
    var verbP = t.v + (/^(in|on|under|by|at|into) /.test(t.w) ? '' : ' ' + t.w);
    return { q: q([para('Which words in this sentence tell <b>where</b>?'), para(big(s))]), a: mcU(where, [t.s, verbP]), viz: pic(t.place, t.items),
      hint: 'Where words often start with in, on, at, by or under.',
      steps: ['Who? ' + t.s + '. What are they doing? ' + cap(verbP) + '.', 'Where? ' + cap(where) + '.'] };
  });

  /* ---------------------------------------------------------------- fwr.match-picture */
  G('fwr.match-picture', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'other', 'place', R.pick(['extra', 'extra', 'place']));
    var t = R.pick(TELL.filter(function (x) { return W().PLACES[x.place].at && (shape !== 'place' || x.place !== 'night'); })), s = wwwSentence(t);
    if (shape === 'other') {
      var o = R.pick(TELL.filter(function (x) { return x.place !== t.place && x.s !== t.s && W().PLACES[x.place].at; }));
      return { q: q([readme(L), para(big('Which sentence matches the picture?'))]), a: mcU(s, [wwwSentence(o)]), viz: pic(t.place, t.items),
        hint: 'Look at the picture first. Who is in it? Where are they?',
        steps: ['The picture shows ' + subjLow(t.s) + ' ' + W().PLACES[t.place].at + '.', '“' + s + '” tells what the picture shows.', '“' + wwwSentence(o) + '” is about a different picture.'] };
    }
    if (shape === 'place') {
      var places = ['park', 'beach', 'pond', 'farm', 'snow', 'kitchen', 'classroom'].filter(function (p) { return p !== t.place && !(t.place === 'yard' && p === 'park') && !(t.place === 'park' && p === 'yard'); });
      var p2 = R.sample(places, 2), stem = t.s + ' ' + t.v + (/^(in|on|under|by|at|into) /.test(t.w) ? '' : ' ' + t.w);
      var wrong = p2.map(function (p) { return stem + ' ' + W().PLACES[p].at + '.'; });
      return { q: q([readme(L), para(big('Which sentence matches the picture?'))]), a: mcU(s, wrong), viz: pic(t.place, t.items),
        hint: 'All three tell who and what. Look closely: where are they?',
        steps: ['The picture shows ' + subjLow(t.s) + ' ' + W().PLACES[t.place].at + '.', 'The other sentences put them somewhere the picture does not show.', 'So: ' + s] };
    }
    var inPic = t.items.map(function (it) { return it.k; }), extra = R.pick(['cat', 'dog', 'duck', 'horse', 'bear', 'cow', 'rabbit', 'frog'].filter(function (k) { return inPic.indexOf(k) < 0; }));
    var nm = W().ACTORS[extra].n, withExtra = s + ' ' + W().cap(W().article(nm)) + ' ' + nm + ' watches.';
    var o2 = R.pick(TELL.filter(function (x) { return x.place !== t.place && x.s !== t.s && W().PLACES[x.place].at; }));
    return { q: q([para(big('Which one tells only what the picture shows?'))]), a: mcU(s, [withExtra, wwwSentence(o2)]), viz: pic(t.place, t.items),
      hint: 'A sentence can sound nice and still add something that is not there. Check every thing it names.',
      steps: ['The picture shows ' + subjLow(t.s) + ' ' + W().PLACES[t.place].at + '.', 'There is no ' + nm + ' in the picture, so “' + W().cap(W().article(nm)) + ' ' + nm + ' watches.” does not match.', 'So: ' + s] };
  });

  /* ---------------------------------------------------------------- paragraphs: one topic, details, an ending */
  var PARAS = [
    { topic: 'Our class has a pet fish named Bubbles.', sup: ['Bubbles is orange with a white stripe.', 'Our teacher feeds him a pinch of food every morning.', 'He likes to hide behind a green plant.'], end: 'Bubbles is a fun class pet.', no: [] },
    { topic: 'Fall is a busy time on our street.', sup: ['Red and yellow leaves fall from the maple trees.', 'Everyone rakes the leaves into big piles.', 'Kids jump in the piles before they get bagged.'], end: 'Our street is never busier than in the fall.', no: [] },
    { topic: 'Apples make a good snack.', sup: ['They are sweet and crunchy.', 'You can carry one in your lunch box.', 'Some apples are red, and some are green or yellow.'], end: 'That is why I pack an apple every day.', no: ['I like pizza.'] },
    { topic: 'Snow days are fun.', sup: ['We build snowmen in the yard.', 'We slide down the hill on sleds.', 'Then we drink warm cocoa inside.'], end: 'I hope we get a snow day soon.', no: [] },
    { topic: 'My grandma has a big garden.', sup: ['She grows tomatoes and beans.', 'I help her pull the weeds.', 'We pick the beans when they are long and green.'], end: 'Her garden is my favorite place.', no: [] },
    { topic: 'Our library is a great place to visit.', sup: ['It has shelves full of picture books.', 'On Tuesdays, a librarian reads stories aloud.', 'You can borrow books for free with a library card.'], end: 'I go to the library every week.', no: [] },
    { topic: 'A dog needs care every day.', sup: ['It needs fresh water and food.', 'It needs a walk outside.', 'It needs someone to play with it.'], end: 'Taking care of a dog is a big job.', no: [] },
    { topic: 'Spiders are good at building webs.', sup: ['They spin silk thread from their bodies.', 'They make sticky webs to catch bugs.', 'Some spiders build a new web every day.'], end: 'A spider’s web is a clever trap.', no: [] }
  ];
  var OFF = ['My cousin lives in Ohio.', 'I like pizza.', 'My shoes are blue.', 'The bus was late today.', 'My brother has a red bike.', 'It is my turn to set the table.', 'I lost a mitten.'];
  function offFor(P, R) { return R.pick(OFF.filter(function (o) { return P.no.indexOf(o) < 0; })); }
  /* ---------------------------------------------------------------- fwr.stay-on-topic */
  G('fwr.stay-on-topic', function (R, ctx) {
    var L = ctx.level, P = R.pick(PARAS), off = offFor(P, R), nSup = L === 1 ? 2 : 3;
    var body = [P.topic].concat(P.sup.slice(0, nSup)), at = R.int(1, body.length);
    body.splice(at, 0, off);
    if (L === 3) body.push(P.end);
    var shape = L === 2 && R.coin() ? 'fits' : 'odd';
    if (shape === 'fits') {
      var other = R.pick(PARAS.filter(function (x) { return x !== P; })), good = R.pick(P.sup.slice(nSup).concat([P.end]));
      if (good === P.end) good = P.sup[nSup] || P.end;
      var shown = [P.topic].concat(P.sup.slice(0, 2));
      return { q: q([para('These sentences are about one topic:'), para(big(shown.join(' '))), para('Which sentence would stay on topic if you added it?')]), a: mcU(good, [off, R.pick(other.sup)]),
        hint: 'What are all the sentences about? Choose the one about that too.',
        steps: ['The topic is in the first sentence: “' + P.topic + '”', '“' + good + '” is about the same thing.', 'The others are about something else.'] };
    }
    return { q: q([readme(L), para('Which sentence does not belong?')]), a: mcKeep(numbersOf(body.length), at),
      viz: { name: 'wr-para', opts: { sentences: body.map(function (s) { return { text: s }; }), quiet: true, interactive: false, big: true } },
      hint: 'What are most of the sentences about? Find the one about something else.',
      steps: ['The topic is in sentence 1: “' + P.topic + '”', 'Sentence ' + (at + 1) + ', “' + off + '”, is about something else.', 'Take it out, and every sentence is about one idea.'] };
  });

  /* ---------------------------------------------------------------- fwr.name-the-topic */
  G('fwr.name-the-topic', function (R, ctx) {
    var L = ctx.level, P = R.pick(PARAS), shape = ML.byLevel(ctx, 'first', R.pick(['first', 'end']), R.pick(['order', 'end', 'order']));
    if (shape === 'first') {
      return { q: q([readme(L), para('These sentences tell about one thing:'), para(big(P.sup.join(' '))), para('Which sentence should come first, to tell what they are about?')]), a: mcU(P.topic, [offFor(P, R), P.sup[0]].slice(0, L === 1 ? 1 : 2)),
        hint: 'The first sentence names the topic: what all the sentences are about.',
        steps: ['All three sentences tell about the same thing.', '“' + P.topic + '” names that topic, so it goes first.', 'A detail like “' + P.sup[0] + '” belongs after it.'] };
    }
    if (shape === 'end') {
      return { q: q([para('Here is the start of a paragraph:'), para(big([P.topic].concat(P.sup).join(' '))), para('Which sentence would make the best ending?')]), a: mcU(P.end, [offFor(P, R), 'And then.']),
        hint: 'A good ending sentence wraps up the same topic.',
        steps: ['The topic: “' + P.topic + '”', '“' + P.end + '” wraps up that topic, so it makes a good ending.', '“And then.” is not a whole sentence, and the other one is about something else.'] };
    }
    var all = [P.topic].concat(P.sup), order = R.shuffle(all.map(function (x, i) { return i; }));
    if (order[0] === 0) order.push(order.shift());
    var shown = order.map(function (i) { return all[i]; }), num = shown.indexOf(P.topic);
    return { q: q([para('These sentences are mixed up. Which one should come first?')]), a: mcKeep(numbersOf(shown.length), num),
      viz: { name: 'wr-para', opts: { sentences: shown.map(function (s) { return { text: s }; }), quiet: true, interactive: false, big: true } },
      hint: 'Which sentence tells what all the others are about?',
      steps: ['Sentence ' + (num + 1) + ', “' + P.topic + '”, names the topic.', 'The other sentences give details about it, so they come after.'] };
  });


  /* ---------------------------------------------------------------- letters and notes */
  var PARTS = ['date', 'greeting', 'body', 'closing', 'signature'];
  var LETTERS = [
    { date: 'October 3', greeting: 'Dear Grandma Rose,', body: 'We went apple picking on Saturday. I picked a whole bag by myself, and Dad made a pie. I saved you the biggest apple. Can you come visit soon?', closing: 'Love,', signature: 'Ava' },
    { date: 'May 14', greeting: 'Dear Kai,', body: 'Our class hatched six chicks this week! They peep all day long. I named the smallest one Pip. Do you have a class pet at your school?', closing: 'Your friend,', signature: 'Sam' },
    { date: 'January 20', greeting: 'Dear Aunt Rosa,', body: 'It snowed all night, and school was closed. Dad and I built a snow fort in the yard. I wish you could see it. Please write back soon.', closing: 'Love,', signature: 'Nora' },
    { date: 'March 9', greeting: 'Dear Grandpa Joe,', body: 'I lost my first tooth today! It was the one in the front. Now I can whistle through the gap. How is your garden doing?', closing: 'Hugs,', signature: 'Maya' },
    { date: 'June 30', greeting: 'Dear Mrs. Lee,', body: 'Thank you for watering our plants while we were away. The tomatoes grew so tall! Mom says we will bring you some when they turn red.', closing: 'Your neighbor,', signature: 'Kai' },
    { date: 'August 2', greeting: 'Dear Uncle Ben,', body: 'I learned to ride my bike without training wheels! I rode all the way to the end of our street, and Mom cheered.', closing: 'Your nephew,', signature: 'Leo' }
  ];
  var PART_WHY = { date: 'The date goes at the top. It tells when the letter was written.', greeting: 'The greeting says hello to the person, like “Dear Kai,”.', body: 'The body is the main part: your news and questions.',
    closing: 'The closing says goodbye, like “Love,” or “Your friend,”.', signature: 'The signature is your name, at the very end.' };
  G('fwr.letter-parts', function (R, ctx) {
    var L = ctx.level, lt = R.pick(LETTERS), shape = ML.byLevel(ctx, 'missing', R.pick(['ask', 'missing']), R.pick(['after', 'ask', 'after']));
    if (shape === 'missing') {
      var om = R.pick(['date', 'greeting', 'closing', 'signature']), names = L === 1 ? R.sample(PARTS.filter(function (p) { return p !== om && p !== 'body'; }), 1).concat([om]) : PARTS.slice();
      names = PARTS.filter(function (p) { return names.indexOf(p) >= 0; });
      return { q: q([readme(L), para('One part of this letter is missing. Which part?')]), a: mcKeep(names, names.indexOf(om)),
        viz: { name: 'wr-note', opts: { kind: 'friendly', parts: lt, omit: om, quiet: true, interactive: false } },
        hint: 'Read it from top to bottom: date, greeting, body, closing, signature.',
        steps: ['Check each part from top to bottom.', 'The ' + om + ' is missing. ' + PART_WHY[om]] };
    }
    if (shape === 'ask') {
      var ask = R.pick(PARTS);
      return { q: q([para('What is the outlined part of this letter called?')]), a: mcKeep(PARTS, PARTS.indexOf(ask)),
        viz: { name: 'wr-note', opts: { kind: 'friendly', parts: lt, ask: ask, quiet: true, interactive: false } },
        hint: 'Where is it in the letter: top, start, middle or end?',
        steps: ['The outlined part is “' + lt[ask].split(' ').slice(0, 6).join(' ') + (lt[ask].split(' ').length > 6 ? '…' : '') + '”.', PART_WHY[ask]] };
    }
    var before = R.coin(), k = before ? R.int(1, 4) : R.int(0, 3), nxt = PARTS[before ? k - 1 : k + 1], rest = PARTS.filter(function (p) { return p !== PARTS[k]; });
    if (before) return { q: q([para('In a friendly letter, which part comes right before the ' + PARTS[k] + '?')]), a: mcKeep(rest, rest.indexOf(nxt)),
      hint: 'Top to bottom: date, greeting, body, closing, signature.',
      steps: ['The parts go: date, greeting, body, closing, signature.', 'Right before the ' + PARTS[k] + ' comes the ' + nxt + '.'] };
    return { q: q([para('In a friendly letter, which part comes right after the ' + PARTS[k] + '?')]), a: mcKeep(PARTS.filter(function (p) { return p !== PARTS[k]; }), PARTS.filter(function (p) { return p !== PARTS[k]; }).indexOf(nxt)),
      hint: 'Top to bottom: date, greeting, body, closing, signature.',
      steps: ['The parts go: date, greeting, body, closing, signature.', 'Right after the ' + PARTS[k] + ' comes the ' + nxt + '.'] };
  });

  /* ---------------------------------------------------------------- fwr.greeting-closing */
  var GREET = ['Grandma', 'Kai', 'Aunt Rosa', 'Mr. Lopez', 'Uncle Ben', 'Maya', 'Grandpa Joe'];
  var CLOSE = ['Love', 'Your friend', 'Your pen pal', 'Your grandson', 'Your granddaughter', 'With love', 'Thank you again'];
  G('fwr.greeting-closing', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'greet', R.pick(['greet', 'close']), R.pick(['close', 'close', 'both']));
    if (shape === 'greet') {
      var g = R.pick(GREET), right = 'Dear ' + g + ',', wrong = ['Dear ' + g, 'dear ' + g + ',', 'Dear ' + g.toLowerCase() + ','];
      return { q: q([readme(L), para(big('Which greeting is written correctly?'))]), a: mcU(right, L === 1 ? [wrong[0]] : [wrong[0], R.pick(wrong.slice(1))]),
        hint: 'A greeting starts with a capital letter, uses capitals for the name, and ends with a comma.',
        steps: ['Dear starts with a capital letter.', '“' + g + '” is a name, so it has ' + (g.indexOf(' ') > 0 ? 'capitals' : 'a capital') + '.', 'A comma goes after the greeting: ' + right] };
    }
    if (shape === 'close') {
      var c = R.pick(CLOSE), rightC = c + ',', ws = c.indexOf(' ') > 0 ? [c, c.split(' ')[0] + ' ' + c.split(' ').slice(1).map(cap).join(' ') + ',', low(c) + ','] : [c, low(c) + ',', c.toUpperCase() + ','];
      return { q: q([readme(L), para(big('Which closing is written correctly?'))]), a: mcU(rightC, [ws[0], ws[1]]),
        hint: 'Only the first word of a closing gets a capital letter. A comma goes after it.',
        steps: ['The first word, “' + c.split(' ')[0] + '”, starts with a capital letter.', c.indexOf(' ') > 0 ? 'The other words stay small: ' + c + '.' : 'It is one word.', 'A comma goes after the closing: ' + rightC] };
    }
    var g2 = R.pick(GREET), c2 = R.pick(CLOSE), sig = R.pick(['Ava', 'Sam', 'Nora', 'Leo']);
    var right2 = 'Dear ' + g2 + ', … ' + c2 + ', ' + sig;
    return { q: q([para(big('Which letter has the greeting and the closing written correctly?'))]),
      a: mcU(right2, ['Dear ' + g2 + ' … ' + c2 + ' ' + sig, 'dear ' + g2 + ', … ' + c2 + ', ' + sig, 'Dear ' + g2 + ', … ' + c2.split(' ').map(cap).join(' ') + ', ' + sig]),
      hint: 'Check both: capital letters and the comma after each.',
      steps: ['Greeting: “Dear ' + g2 + ',” with a capital and a comma.', 'Closing: “' + c2 + ',” with a capital on the first word only, and a comma.', 'The signature is the name: ' + sig + '.'] };
  });

  /* ---------------------------------------------------------------- fwr.thank-you-note */
  var GIFTS = [
    { g: 'the red kite', to: 'Uncle Ben', thanks: 'Thank you for the red kite you sent for my birthday.', detail: 'I flew it at the park on Saturday, and it went higher than the trees.', personal: 'I hope you can fly it with me this summer.', sig: 'Leo' },
    { g: 'the purple mittens', to: 'Aunt May', thanks: 'Thank you for the purple mittens.', detail: 'They kept my hands warm when we went sledding.', personal: 'I will wear them all winter.', sig: 'Ava' },
    { g: 'the paint set', to: 'Grandma', thanks: 'Thank you for the paint set.', detail: 'I already painted a picture of our cat with it.', personal: 'I will mail you the picture next week.', sig: 'Sam' },
    { g: 'the book about whales', to: 'Grandpa', thanks: 'Thank you for the book about whales.', detail: 'I read it every night, and my favorite page shows a whale jumping out of the sea.', personal: 'Can we go see the ocean together someday?', sig: 'Nora' },
    { g: 'the jump rope', to: 'Kai', thanks: 'Thank you for the jump rope.', detail: 'I can already jump twenty times in a row without stopping.', personal: 'Let’s jump rope together at recess.', sig: 'Maya' }
  ];
  var THANK_PARTS = ['thanks', 'detail', 'personal', 'closing'];
  G('fwr.thank-you-note', function (R, ctx) {
    var L = ctx.level, gf = R.pick(GIFTS), other = R.pick(GIFTS.filter(function (x) { return x !== gf; }));
    var shape = ML.byLevel(ctx, 'better', R.pick(['ask', 'better']), R.pick(['detail', 'detail', 'ask']));
    if (shape === 'better') {
      var good = gf.thanks + ' ' + gf.detail, plain = 'Thanks for the gift.', vague = 'Thank you for the present. Bye.';
      return { q: q([readme(L), para(big('Which thank-you note is better?'))]), a: mcU(good, L === 1 ? [plain] : [plain, vague]),
        hint: 'A good note names the gift and says one thing about it.',
        steps: ['“' + gf.thanks + '” names the gift.', '“' + gf.detail + '” tells something about it, so the giver knows you liked it.', '“Thanks for the gift.” does not say which gift or anything about it.'] };
    }
    if (shape === 'ask') {
      var ask = R.pick(THANK_PARTS), nm = W().LETTER_NAMES || { thanks: 'thank you', detail: 'detail about the gift', personal: 'personal note', closing: 'closing' };
      var names = THANK_PARTS.map(function (p) { return nm[p]; });
      return { q: q([para('What does the outlined part of this note do?')]), a: mcKeep(names, THANK_PARTS.indexOf(ask)),
        viz: { name: 'wr-note', opts: { kind: 'thanks', parts: { date: 'June 12', greeting: 'Dear ' + gf.to + ',', thanks: gf.thanks, detail: gf.detail, personal: gf.personal, closing: 'Love,', signature: gf.sig }, ask: ask, quiet: true, interactive: false } },
        hint: 'Does it say thank you, tell about the gift, add a friendly note, or say goodbye?',
        steps: [{ thanks: 'It says thank you and names the gift.', detail: 'It tells something about the gift: how it was used or why it is liked.', personal: 'It adds a friendly, personal note for the giver.', closing: 'It says goodbye, just before the name.' }[ask], 'So it is the ' + nm[ask] + '.'] };
    }
    return { q: q([para('You are writing to thank ' + gf.to + ' for ' + gf.g + '. Which sentence is the best detail about the gift?')]), a: mcU(gf.detail, [other.detail, 'I have a lot of toys.']),
      hint: 'The detail should be about this gift.',
      steps: ['The note is about ' + gf.g + '.', '“' + gf.detail + '” tells something about that gift.', 'The other sentences are about a different gift, or not about the gift at all.'] };
  });

  /* ---------------------------------------------------------------- stories: beginning, middle, end */
  // s: the story in order (s[0] beginning: who and where; s[1] the problem; s[2] the fix; s[3] the end)
  var STORIES = [
    { s: ['On a sunny morning, Mia and her dad went to the beach.', 'A big wave knocked down their sandcastle.', 'They built a new one higher up on the sand.', 'It was still standing when they went home.'], chars: ['Mia', 'her dad'], where: 'at the beach', when: 'on a sunny morning', things: ['a sandcastle', 'a wave'] },
    { s: ['One windy afternoon, Leo took his new kite to the park.', 'The kite got stuck in a tall tree.', 'A park worker used a long pole to get it down.', 'Leo flew his kite again, far away from the trees.'], chars: ['Leo', 'a park worker'], where: 'at the park', when: 'on a windy afternoon', things: ['a kite', 'a pole'] },
    { s: ['On Saturday, Ana played in her backyard with her dog, Pepper.', 'Pepper chased a squirrel and did not come back.', 'Ana called his name and shook his food bowl.', 'Pepper ran home, wagging his tail.'], chars: ['Ana', 'Pepper'], where: 'in Ana’s backyard', when: 'on Saturday', things: ['a food bowl', 'a squirrel'] },
    { s: ['On Monday at school, Sam’s front tooth was loose.', 'At lunch, the tooth fell out and rolled under the table.', 'Sam and his friend Kai looked until they found it.', 'Sam took the tooth home in a little envelope.'], chars: ['Sam', 'Kai'], where: 'at school', when: 'on Monday', things: ['a tooth', 'an envelope'] },
    { s: ['On Grandpa’s birthday, Nora and her mom baked a cake in their kitchen.', 'When they opened the cupboard, there was no sugar left.', 'Their neighbor, Mr. Ito, lent them a cup of sugar.', 'Grandpa said it was the best cake he ever had.'], chars: ['Nora', 'her mom', 'Mr. Ito', 'Grandpa'], where: 'in the kitchen', when: 'on Grandpa’s birthday', things: ['a cake', 'a cup of sugar'] },
    { s: ['One spring evening, a little rabbit sat in a garden behind a barn.', 'A fence kept the rabbit away from the carrots.', 'The rabbit found a hole under the fence and squeezed through.', 'Soon the rabbit was munching a crunchy carrot.'], chars: ['the rabbit'], where: 'in a garden behind a barn', when: 'on a spring evening', things: ['a fence', 'carrots'] },
    { s: ['After the first snow, Ben and his sister Lily ran out to build a snowman.', 'The snow was too dry and powdery to stick together.', 'They waited for the next afternoon, when the sun made the snow wet and sticky.', 'Then they rolled three big balls and gave their snowman a carrot nose.'], chars: ['Ben', 'Lily'], where: 'outside in the snow', when: 'after the first snow', things: ['a snowman', 'a carrot'] }
  ];
  G('fwr.beginning-middle-end', function (R, ctx) {
    var L = ctx.level, st = R.pick(STORIES), s = st.s, shape = ML.byLevel(ctx, 'begin', R.pick(['end', 'begin']), R.pick(['order', 'order', 'end']));
    if (shape === 'begin') {
      return { q: q([readme(L), para(big('Which sentence is the beginning of the story?'))]), a: mcU(s[0], L === 1 ? [s[3]] : [s[1], s[3]]),
        hint: 'The beginning tells who the story is about and where it happens.',
        steps: ['“' + s[0] + '” tells who (' + st.chars.slice(0, 2).join(' and ') + ') and where or when.', 'So it is the beginning. The others tell what happens next and how it works out.'] };
    }
    if (shape === 'end') {
      var other = R.pick(STORIES.filter(function (x) { return x !== st; }));
      return { q: q([para('Here is the start of a story:'), para(big(s.slice(0, 3).join(' '))), para('Which sentence is the best ending?')]), a: mcU(s[3], ['And then I woke up.', other.s[0]]),
        hint: 'A good ending tells how things work out for the same characters.',
        steps: ['“' + s[3] + '” tells how things work out, so it wraps up the story.', '“And then I woke up.” stops the story without an ending.', 'The other sentence starts a different story.'] };
    }
    var op = orderProblem(R, s, 3);
    return { q: q([para('Put the story in order: beginning, middle and end. Which order is right?')]), a: mcU(op.right, op.wrong), viz: op.viz,
      hint: 'Find the beginning first: who and where. Then what goes wrong, how it is fixed, and how it ends.',
      steps: ['Beginning: “' + s[0] + '”', 'Middle: “' + s[1] + '” Then: “' + s[2] + '”', 'End: “' + s[3] + '”', 'In card letters: ' + op.right + '.'] };
  });

  /* ---------------------------------------------------------------- how-to steps (time words, how-to) */
  var HOWTO = [
    { t: 'plant a seed', s: ['Fill a cup with soil.', 'Push a seed into the soil.', 'Water the soil.', 'Set the cup in a sunny window.'] },
    { t: 'make a jam sandwich', s: ['Get two slices of bread.', 'Spread jam on one slice.', 'Put the other slice on top.', 'Cut the sandwich in half.'] },
    { t: 'make a card', s: ['Fold a sheet of paper in half.', 'Draw a picture on the front.', 'Write a message inside.', 'Sign your name under the message.'] },
    { t: 'build a snowman', s: ['Roll a big snowball for the bottom.', 'Set a middle-sized ball on top of it.', 'Put a small ball on top for the head.', 'Add a carrot nose and two button eyes.'] },
    { t: 'wrap a gift', s: ['Put the gift in a box.', 'Fold paper around the box.', 'Tape the paper in place.', 'Stick a bow on top.'] },
    { t: 'brush your teeth', s: ['Wet your toothbrush.', 'Squeeze a little toothpaste onto it.', 'Brush every tooth, front and back.', 'Rinse your mouth and the brush.'] },
    { t: 'water a plant', s: ['Fill a watering can.', 'Carry it to the plant.', 'Pour water on the soil around the plant.', 'Put the can away.'] },
    { t: 'mail a letter', s: ['Write your letter.', 'Fold it and put it in an envelope.', 'Write the address and stick on a stamp.', 'Drop it in the mailbox.'] },
    { t: 'feed the fish', s: ['Open the jar of fish food.', 'Shake a pinch of food onto the water.', 'Close the jar.', 'Watch the fish eat.'] }
  ];
  var TIMEW = ['First', 'Next', 'Then', 'Last'];
  function withWord(w, step) { return w + ', ' + low(step); }
  G('fwr.time-words', function (R, ctx) {
    var L = ctx.level, h = R.pick(HOWTO), shape = ML.byLevel(ctx, 'blank', 'blank', R.pick(['wrong', 'blank', 'wrong']));
    if (shape === 'blank') {
      var k = L === 1 ? R.pick([0, 3]) : R.int(0, 3), mid = k === 2 ? 'Then' : 'Next', choices = L === 1 ? ['First', 'Last'] : ['First', mid, 'Last'];
      var shown = h.s.map(function (st, i) { return i === k ? '___, ' + low(st) : withWord(TIMEW[i], st); });
      var right = k === 0 ? 'First' : k === 3 ? 'Last' : mid;
      return { q: q([readme(L), para('How to ' + h.t + '. Which time word fits the blank?'), shown.map(function (x) { return para(big(x)); }).join('')]), a: mcKeep(choices, choices.indexOf(right)),
        hint: 'Is it the first step, a step in the middle, or the last step?',
        steps: ['This is step ' + (k + 1) + ' of 4.', k === 0 ? 'The first step starts with First.' : k === 3 ? 'The last step starts with Last.' : 'A step in the middle starts with ' + mid + '.', withWord(right, h.s[k])] };
    }
    var bad = R.pick([1, 2]), badWord = R.pick(['Last', 'First']), words = ['First', 'Next', 'Then', R.pick(['Finally', 'Last'])];
    words[bad] = badWord;
    var shownW = h.s.map(function (st, i) { return (i + 1) + '. ' + withWord(words[i], st); });
    return { q: q([para('How to ' + h.t + '. One step has the wrong time word. Which step?'), shownW.map(function (x) { return para(big(x)); }).join('')]), a: mcKeep(numbersOf(4), bad),
      hint: 'First goes on the first step, and Last or Finally on the last one.',
      steps: ['Step ' + (bad + 1) + ' is in the middle, but it starts with “' + badWord + '”.', badWord === 'Last' ? 'Last belongs on the last step, or the reader will think the job is done.' : 'First belongs only on the first step.', 'It should start with ' + (bad === 1 ? 'Next' : 'Then') + ': ' + withWord(bad === 1 ? 'Next' : 'Then', h.s[bad])] };
  });

  /* ---------------------------------------------------------------- fwr.characters-setting */
  G('fwr.characters-setting', function (R, ctx) {
    var L = ctx.level, st = R.pick(STORIES), text = st.s.join(' '), shape = ML.byLevel(ctx, 'who', R.pick(['where', 'who']), R.pick(['all', 'when', 'all']));
    var thing = R.pick(st.things);
    if (shape === 'who') {
      var ch = R.pick(st.chars);
      return { q: q([readme(L), para(big(text)), para('Who is a character in this story?')]), a: mcU(cap(ch), L === 1 ? [cap(st.where)] : [cap(st.where), cap(thing)]),
        hint: 'A character is a person or animal the story is about.',
        steps: ['A character is who the story is about.', cap(ch) + ' is in the story, doing things, so ' + (/^(her|the|a) /.test(ch) ? 'that is' : ch + ' is') + ' a character.', cap(st.where) + ' is a place. A place is part of the setting, not a character.'] };
    }
    if (shape === 'where') {
      return { q: q([para(big(text)), para('Where does this story happen?')]), a: mcU(cap(st.where), [cap(st.chars[0]), cap(thing)]),
        hint: 'The setting tells where and when.',
        steps: ['The setting is where and when the story happens.', 'This story happens ' + st.where + ', ' + st.when + '.'] };
    }
    if (shape === 'when') {
      var other = R.pick(STORIES.filter(function (x) { return x.when !== st.when; }));
      return { q: q([para(big(text)), para('When does this story happen?')]), a: mcU(cap(st.when), [cap(other.when), cap(st.where)]),
        hint: 'Look for a time word: a day, a time of day or a season.',
        steps: ['The setting tells where and when.', 'This story happens ' + st.when + ', ' + st.where + '.'] };
    }
    var chars = st.chars.slice(0, 2), choices = chars.map(cap).concat([cap(st.where), cap(st.when)]);
    return { q: q([para(big(text)), para('Which of these are characters? Choose all that are.')]), a: { t: 'mc', choices: choices, v: chars.map(function (c, i) { return i; }) },
      hint: 'Characters are people or animals. Places and times are the setting.',
      steps: ['Characters: ' + chars.join(' and ') + '.', 'Setting: ' + st.where + ' (where) and ' + st.when + ' (when).'] };
  });

  /* ---------------------------------------------------------------- fwr.problem-solution */
  G('fwr.problem-solution', function (R, ctx) {
    var L = ctx.level, st = R.pick(STORIES), s = st.s, shape = ML.byLevel(ctx, 'problem', R.pick(['fix', 'problem']), R.pick(['ending', 'ending', 'fix']));
    var all = para(big(s.join(' ')));
    if (shape === 'problem') {
      return { q: q([readme(L), all, para('What is the problem in this story?')]), a: mcU(s[1], L === 1 ? [s[0]] : [s[0], s[3]]),
        hint: 'The problem is what goes wrong.',
        steps: ['“' + s[1] + '” is what goes wrong.', 'That is the problem. The rest of the story fixes it.'] };
    }
    if (shape === 'fix') {
      return { q: q([all, para('How is the problem fixed?')]), a: mcU(s[2], [s[1], s[0]]),
        hint: 'First find what goes wrong. Then look for what the characters do about it.',
        steps: ['The problem: “' + s[1] + '”', 'The fix: “' + s[2] + '”'] };
    }
    var other = R.pick(STORIES.filter(function (x) { return x !== st; }));
    return { q: q([para(big(s[0] + ' ' + s[1])), para('Which sentence would fix the problem?')]), a: mcU(s[2], [other.s[2], 'Then it was time for dinner.']),
      hint: 'A fix solves this problem, for these characters.',
      steps: ['The problem: “' + s[1] + '”', '“' + s[2] + '” solves it.', 'The other sentences do not solve this problem.'] };
  });

  /* ---------------------------------------------------------------- fwr.how-to */
  G('fwr.how-to', function (R, ctx) {
    var L = ctx.level, h = R.pick(HOWTO), shape = ML.byLevel(ctx, 'first', R.pick(['missing', 'first']), R.pick(['order', 'missing', 'order']));
    if (shape === 'first') {
      return { q: q([readme(L), para(big('How to ' + h.t + ': which step comes first?'))]), a: mcU(h.s[0], L === 1 ? [h.s[3]] : [h.s[2], h.s[3]]),
        hint: 'What do you have to do before anything else can happen?',
        steps: ['To ' + h.t + ', you start with: ' + h.s[0], 'The other steps need that one done first.'] };
    }
    if (shape === 'missing') {
      var k = R.pick([1, 2]), shown = h.s.filter(function (x, i) { return i !== k; }).map(function (x, i) { return para(big((i + 1) + '. ' + x)); }).join('');
      var others = R.sample(HOWTO.filter(function (x) { return x !== h; }), 2).map(function (x) { return x.s[R.int(1, 2)]; });
      return { q: q([para('How to ' + h.t + '. One step is missing. Which one?'), shown]), a: mcU(h.s[k], others),
        hint: 'Read the steps as if you have never done this. Where would you get stuck?',
        steps: ['After “' + h.s[k - 1] + '” the reader needs: “' + h.s[k] + '”', 'Without it, the next step does not work.', 'The other choices belong to a different job.'] };
    }
    var op = orderProblem(R, h.s, 3);
    return { q: q([para('How to ' + h.t + '. Which order are the steps in?')]), a: mcU(op.right, op.wrong), viz: op.viz,
      hint: 'Which step must happen before the others?',
      steps: h.s.map(function (x, i) { return (i + 1) + '. ' + x; }).concat(['In card letters: ' + op.right + '.']) };
  });

  /* ---------------------------------------------------------------- fwr.opinion */
  var OPIN = [['I think dogs are the best pets', 'because they love to play'], ['I think summer is the best season', 'because we can swim every day'], ['Pancakes make the best breakfast', 'because they are warm and sweet'],
    ['I think the library is the best place in town', 'because it has so many books'], ['I think rainy days are fun', 'because we can jump in puddles'], ['Soccer is the most fun game', 'because everyone gets to run'],
    ['I think cats make great pets', 'because they are soft and calm'], ['Fall is my favorite season', 'because the leaves turn red and gold']];
  var FACTS = ['Dogs have four legs.', 'A week has seven days.', 'Apples grow on trees.', 'Cats have whiskers.', 'Summer comes after spring.', 'A spider has eight legs.', 'Ice is frozen water.', 'Fish have fins.'];
  G('fwr.opinion', function (R, ctx) {
    var L = ctx.level, op = R.pick(OPIN), shape = ML.byLevel(ctx, 'which', R.pick(['reason', 'which']), R.pick(['both', 'reason', 'both']));
    if (shape === 'which') {
      var f = R.sample(FACTS, 2);
      return { q: q([readme(L), para(big('Which sentence is an opinion: what someone thinks?'))]), a: mcU(op[0] + '.', L === 1 ? [f[0]] : f),
        hint: 'A fact can be checked. An opinion is what someone thinks or feels.',
        steps: ['“' + op[0] + '.” tells what someone thinks. Other people might think something else.', 'The other ' + (L === 1 ? 'sentence is a fact' : 'sentences are facts') + ': you can check ' + (L === 1 ? 'it' : 'them') + '.'] };
    }
    if (shape === 'reason') {
      var others = R.sample(OPIN.filter(function (x) { return x !== op; }), 2).map(function (x) { return x[1]; });
      return { q: q([para('Which reason goes with this opinion?'), para(big(op[0] + ' ___.'))]), a: mcU(op[1], others),
        hint: 'The reason should explain why the writer thinks this.',
        steps: ['The opinion: ' + op[0] + '.', 'The reason that explains it: ' + op[1] + '.', op[0] + ' ' + op[1] + '.'] };
    }
    var f2 = R.pick(FACTS);
    return { q: q([para(big('Which sentence gives an opinion and a reason?'))]), a: mcU(op[0] + ' ' + op[1] + '.', [op[0] + '.', f2]),
      hint: 'Look for what the writer thinks, and a because.',
      steps: ['“' + op[0] + '” is the opinion.', '“' + op[1] + '” is the reason.', '“' + op[0] + '.” has no reason, and “' + f2 + '” is a fact, not an opinion.'] };
  });

  /* ---------------------------------------------------------------- checking: sentences with mistakes put in on purpose */
  // {Name} marks a name or day (capital letter), [right|wrong] a word with a common wrong form; sentences that use I in the middle
  var FIXS = ['Yesterday {Maya} and I [went|goed] to the zoo.', 'Mom and I [saw|seed] a deer by the road.', 'My dogs [are|is] hungry, so I fed them.',
    'Today {Leo} and I [ate|eated] lunch outside.', 'We [were|was] happy when {Aunt Rosa} came to visit.', 'After school {Sam} and I [ran|runned] home.',
    'On {Saturday} I [said|sed] hello to our new neighbor.', 'The kittens [are|is] asleep, and I am sleepy too.', 'My friend {Kai} and I [built|builded] a fort.',
    'Last night {Grandpa} and I [were|was] looking at the stars.'];
  var ERR_NAMES = { cap: 'a capital letter at the start', end: 'an end mark', name: 'a capital letter for a name or day', i: 'a capital I', word: 'the right word', space: 'a space between words' };
  function fixParse(s) {
    var names = [], word = null, clean = s.replace(/\{([^}]+)\}/g, function (m, n) { names.push(n); return n; }).replace(/\[([^|]+)\|([^\]]+)\]/, function (m, a, b) { word = [a, b]; return a; });
    return { clean: clean, names: names, word: word };
  }
  // apply mistakes (keys of ERR_NAMES) to a clean sentence
  function breakIt(P, errs) {
    var t = P.clean;
    if (errs.indexOf('word') >= 0 && P.word) t = t.replace(new RegExp('\\b' + P.word[0] + '\\b'), P.word[1]);
    if (errs.indexOf('name') >= 0 && P.names.length) t = t.replace(P.names[0], P.names[0].toLowerCase());
    if (errs.indexOf('i') >= 0) t = t.replace(/ I /, ' i ');
    if (errs.indexOf('space') >= 0) { var ws = t.split(' '), j = Math.max(1, Math.floor(ws.length / 2) - 1); ws.splice(j, 2, ws[j] + ws[j + 1]); t = ws.join(' '); }
    if (errs.indexOf('end') >= 0) t = t.replace(/[.?!]$/, '');
    if (errs.indexOf('cap') >= 0) t = t.charAt(0).toLowerCase() + t.slice(1);
    return t;
  }
  function canHave(P, e) { return e === 'name' ? P.names.length > 0 : e === 'word' ? !!P.word : e === 'i' ? / I /.test(P.clean) : true; }
  function fixWhy(P, e) {
    return { cap: 'The first word needs a capital letter: ' + P.clean.split(' ')[0] + '.', end: 'It needs an end mark: a period.', name: '“' + P.names[0] + '” is ' + (DAYS.indexOf(P.names[0]) >= 0 ? 'the name of a day' : 'a name') + ', so it needs a capital letter.',
      i: 'The word I is always a capital letter.', word: 'In writing, use “' + (P.word || [''])[0] + '”, not “' + (P.word || ['', ''])[1] + '”.', space: 'Two words are run together; they need a space between them.' }[e];
  }

  /* ---------------------------------------------------------------- fwr.check-your-work */
  G('fwr.check-your-work', function (R, ctx) {
    var L = ctx.level, P = fixParse(R.pick(FIXS)), shape = ML.byLevel(ctx, 'need', 'need', R.pick(['ready', 'need', 'ready']));
    if (shape === 'need') {
      var pool = L === 1 ? ['cap', 'end', 'space'] : ['cap', 'end', 'space', 'name', 'i'];
      pool = pool.filter(function (e) { return canHave(P, e); });
      var e = R.pick(pool), list = L === 1 ? ['cap', 'end', 'space'] : ['cap', 'end', 'space', 'name'];
      if (e === 'i') list = ['cap', 'end', 'i', 'name'];
      var shown = breakIt(P, [e]);
      return { q: q([readme(L), para('Read it back. What does this sentence need?'), para(big(shown))]), a: mcKeep(list.map(function (x) { return ERR_NAMES[x]; }), list.indexOf(e)),
        hint: 'Check the start, the end, the spaces, and the capital letters.',
        steps: [fixWhy(P, e), 'Fixed: ' + P.clean] };
    }
    var errs = ['cap', 'end', 'name', 'i', 'word'].filter(function (e) { return canHave(P, e); }), b1 = breakIt(P, [R.pick(errs)]), b2 = breakIt(P, [R.pick(errs.filter(function (x) { return breakIt(P, [x]) !== b1; }))]);
    return { q: q([para(big('Which sentence is ready to share, with no mistakes?'))]), a: mcU(P.clean, [b1, b2]),
      hint: 'Read each one slowly. Check capitals, end marks and words.',
      steps: ['“' + P.clean + '” has a capital at the start, capitals for names and I, the right words, and an end mark.', 'The other two each have a mistake.'] };
  });

  /* ---------------------------------------------------------------- fwr.fix-it */
  G('fwr.fix-it', function (R, ctx) {
    var L = ctx.level, P = fixParse(R.pick(FIXS)), errs = ['cap', 'end', 'name', 'i', 'word'].filter(function (e) { return canHave(P, e); });
    var n = ML.byLevel(ctx, 1, 2, 3), shape = L === 3 && R.coin() ? 'count' : 'fix';
    if (shape === 'count') n = R.int(1, 3);
    var E = R.sample(errs, n), shown = breakIt(P, E);
    if (shape === 'count') {
      return { q: q([para('How many mistakes are in this sentence?'), para(big(shown))]), a: mcKeep(numbersOf(4), n - 1),
        hint: 'Check one thing at a time: the start, names and I, each word, and the end.',
        steps: E.map(function (e) { return fixWhy(P, e); }).concat(['That makes ' + n + '. Fixed: ' + P.clean]) };
    }
    var partial = E.length > 1 ? E.map(function (e) { return breakIt(P, E.filter(function (x) { return x !== e; })); }) : [shown];
    if (E.length === 1) { var e2 = R.pick(errs.filter(function (x) { return x !== E[0]; })); partial.push(breakIt(P, [e2])); }
    return { q: q([readme(L), para(E.length > 1 ? 'This sentence has ' + E.length + ' mistakes. Which one fixes all of them?' : 'Which one fixes the sentence?'), para(big(shown))]),
      a: mcU(P.clean, partial, L === 1 ? 1 : 2),
      hint: E.length > 1 ? 'Don’t stop at the first fix. Check every choice for every mistake.' : 'Find the mistake first. Then find the choice that fixes it and adds no new one.',
      steps: E.map(function (e) { return fixWhy(P, e); }).concat(['All fixed: ' + P.clean]) };
  });

})(window.MathLadder);

/* ---- More forms of the same questions (round 7, "widen"): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - two at once: two different questions of the topic, answered together (short questions only, at most one of them with
     a picture, which then comes first; not in the courses for young children, whose answer box for two parts would
     also show a keypad button they don't need).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'fwr', YOUNG = true, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf')) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
