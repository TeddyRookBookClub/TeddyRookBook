  // The Syntopicon and Mortimer Adler: his life and books, what the Syntopicon is and how its chapters work, syntopical
  // reading (put the rungs on one of OUR ideas in order of time), and finding works in the 60 volumes.
  var ID = 'gbstart.syntopicon-and-adler';
  var B = {
    facts: [
      ['Mortimer Adler left high school at fourteen to work at a newspaper.', true, 'He worked at the New York Sun.'],
      ['Adler was associate editor of the 1952 Great Books of the Western World.', true, 'Hutchins was editor-in-chief; Adler made the Syntopicon.'],
      ['The Syntopicon is an index of ideas across all the works in the set.', true, 'It lists where each great idea is discussed, by volume and page.'],
      ['The Syntopicon is an ordinary word index for one book.', false, 'It indexes ideas, not words, across the whole set.'],
      ['In the 1952 edition the Syntopicon had 102 great ideas.', true, 'About a hundred ideas, each with its own chapter.'],
      ['Each Syntopicon chapter begins with an essay by Adler on the idea.', true, 'Then come the outline of topics, references, cross-references and additional readings.'],
      ['The Syntopicon fills volumes 1 and 2 of the 1990 edition.', true, 'In 1952 it was volumes 2 and 3, after Hutchins’ The Great Conversation.'],
      ['Syntopical reading means reading one book very fast.', false, 'It means comparing several books on one question.'],
      ['Adler wrote How to Read a Book.', true, 'In 1940; revised with Charles Van Doren in 1972.'],
      ['Adler’s Paideia project was about schooling for children.', true, 'It proposed seminars and coaching along with direct teaching.'],
      ['This ladder’s Great Ideas index copies the Syntopicon’s list of ideas.', false, 'Our index is our own, with our own names and groups; it is only inspired by the Syntopicon.'],
      ['Adler wrote Aristotle for Everybody.', true, 'In 1978, for readers new to philosophy.'],
      ['Adler lived from 1902 to 2001.', true, 'He was ninety-eight when he died.']
    ],
    items: [
      { q: 'What does the Syntopicon index?', r: 'Where the great ideas are discussed across the whole set', w: ['Every word in one book', 'The prices of the volumes', 'The authors’ birthdays', 'The pictures in the set'], why: 'It is an index of ideas, by volume and page.' },
      { q: 'In the Syntopicon, what does the outline of topics do?', r: 'Breaks a great idea into narrower questions', w: ['Lists the authors alphabetically', 'Gives the history of Britannica', 'Translates the Greek words', 'Lists the prices of books'], why: 'Each topic then has its own references.' },
      { q: 'What is syntopical reading?', r: 'Comparing what several books say on one question', w: ['Reading a book backward', 'Reading only the index', 'Reading one page a day', 'Reading in Greek'], why: 'The Syntopicon was built to make it possible.' },
      { q: 'Which book did Adler write about speaking and listening, as a companion to How to Read a Book?', r: 'How to Speak, How to Listen', w: ['Six Great Ideas', 'Philosopher at Large', 'Ten Philosophical Mistakes', 'We Hold These Truths'], why: 'It appeared in 1983.' },
      { q: 'Which of Adler’s books is his autobiography?', r: 'Philosopher at Large', w: ['Aristotle for Everybody', 'The Paideia Proposal', 'Six Great Ideas', 'How to Read a Book'], why: 'Published in 1977.' },
      { q: 'Which of Adler’s books explains the ideas behind the Declaration and the Constitution?', r: 'We Hold These Truths', w: ['How to Think About God', 'Aristotle for Everybody', 'How to Speak, How to Listen', 'Philosopher at Large'], why: 'Published in 1987, the Constitution’s bicentennial.' },
      { q: 'Who invited Adler to the University of Chicago in 1930?', r: 'Robert Maynard Hutchins', w: ['John Erskine', 'Charles Van Doren', 'Matthew Arnold', 'Charles W. Eliot'], why: 'Hutchins was the university’s young president.' },
      { q: 'What does "Syntopicon" mean?', r: 'A collection of topics', w: ['A great book', 'A reading machine', 'A list of authors', 'A Greek dictionary'], why: 'The name means a collection of topics.' },
      { q: 'Why does this ladder describe Adler’s books instead of quoting them?', r: 'They are still under copyright', w: ['They are too short', 'They are in Latin', 'They are lost', 'They were never published'], why: 'We describe them in our own words and link to libraries.' }
    ]
  };
  // syntopical reading: the rungs our index lists under one idea, in order of time
  function famSyntopical(R, lv) {
    var keys = Object.keys(H.IDEAS).filter(function (k) {
      return H.RUNGS.filter(function (r) { return r.year !== null && r.ideas.indexOf(k) >= 0 && r.author !== 'Teddy Rook Book'; }).length >= 4;
    });
    var k = R.pick(keys), pool = H.RUNGS.filter(function (r) { return r.year !== null && r.ideas.indexOf(k) >= 0 && r.author !== 'Teddy Rook Book'; });
    var p = H.famOrder(R, lv, pool.map(function (r) { return r.id; }));
    if (!p) return null;
    p.q = 'You are doing a syntopical reading on <b>' + H.IDEAS[k] + '</b>, reading the rungs in order of time. ' + p.q;
    return p;
  }
  function famIdeaOf(R, lv) {
    var r = R.pick(H.RUNGS.filter(function (x) { return x.ideas.length && x.author !== 'Teddy Rook Book'; }));
    var right = H.IDEAS[R.pick(r.ideas)], others = Object.keys(H.IDEAS).filter(function (k) { return r.ideas.indexOf(k) < 0; }).map(function (k) { return H.IDEAS[k]; });
    return H.mc('In our Great Ideas index, <i>' + r.title + '</i> is listed under which idea?', right, H.samp(R, others, lv === 1 ? 2 : 3),
      [r.title + ' is tagged: ' + r.ideas.map(function (k) { return H.IDEAS[k]; }).join(', ') + '.']);
  }
  function famVol(R, lv) {
    var r = R.pick(H.RUNGS.filter(function (x) { return x.vol && x.author !== 'Teddy Rook Book' && x.id !== ID; }));
    return H.famVolume(R, lv, r.id);
  }
  function famAge(R, lv) {
    var books = [['How to Read a Book', 1940], ['the Syntopicon', 1952], ['Aristotle for Everybody', 1978], ['Six Great Ideas', 1981], ['The Paideia Proposal', 1982], ['We Hold These Truths', 1987], ['the second edition of the set', 1990]];
    var b = R.pick(books), age = b[1] - 1902;
    return H.num('Adler was born in 1902. ' + b[0].charAt(0).toUpperCase() + b[0].slice(1) + ' came out in ' + b[1] + '. How many years after his birth year was that?', age, [b[1] + ' − 1902 = ' + age + ' years.'], { hint: 'Subtract 1902 from the year it came out.' });
  }
  H.T(ID, B, [famSyntopical, famIdeaOf, famVol, famAge], 0.55);
