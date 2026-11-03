  // The Great Conversation: the history of the Great Books idea (an event timeline: order, which came first, years
  // between), the 1952 and 1990 sets, the criticisms and replies (stated fairly), and how this ladder works.
  var ID = 'gbstart.the-great-conversation';
  var EV = [
    ['Matthew Arnold calls culture knowing "the best which has been thought and said"', 1869],
    ['Charles W. Eliot publishes the Harvard Classics, the "five-foot shelf"', 1909],
    ['John Erskine begins his General Honors course at Columbia', 1920],
    ['Mortimer Adler joins Robert Hutchins at the University of Chicago', 1930],
    ['St. John’s College adopts its great-books program', 1937],
    ['The University of Chicago’s Basic Program for adults begins', 1946],
    ['Hutchins and Adler start the Great Books Foundation', 1947],
    ['Britannica publishes Great Books of the Western World in 54 volumes', 1952],
    ['St. John’s College opens its Santa Fe campus', 1964],
    ['The second edition grows to 60 volumes', 1990]
  ];
  var B = {
    facts: [
      ['John Erskine’s General Honors course at Columbia was an early great-books course.', true, 'It began in 1920; Mortimer Adler was one of his students.'],
      ['The first edition of Great Books of the Western World (1952) had 60 volumes.', false, 'It had 54; the 1990 second edition has 60.'],
      ['Robert Maynard Hutchins wrote The Great Conversation, volume 1 of the 1952 set.', true, 'He was the set’s editor-in-chief.'],
      ['The 1990 edition added 20th-century works and four women authors.', true, 'Jane Austen, George Eliot, Willa Cather and Virginia Woolf.'],
      ['St. John’s College teaches mostly by lectures and textbooks.', false, 'It teaches by seminars, tutorials and laboratories built on the great books.'],
      ['The Basic Program at the University of Chicago is a reading program for adults.', true, 'A four-year, non-credit program of weekly discussions, begun in 1946.'],
      ['Critics point out that the 1952 set included no women authors.', true, 'That is one of the main criticisms; the 1990 edition added four.'],
      ['Defenders of the great books say the books all agree with one another.', false, 'They say the opposite: the books disagree constantly, which teaches questioning.'],
      ['Matthew Arnold wrote of "the best which has been thought and said in the world."', true, 'In Culture and Anarchy (1869).'],
      ['The Harvard Classics were planned around fifteen minutes of reading a day.', true, 'Their reading guide is the basis of Harvard Classics Daily.'],
      ['Every rung of this ladder has one path, for adults only.', false, 'Every rung has three paths: young readers, teens and adults, and going deeper.'],
      ['This ladder quotes only from translations that are in the public domain.', true, 'Where there is none, it describes the work and says where to find it.'],
      ['The Great Books Foundation was started by Hutchins and Adler in 1947.', true, 'It helps people run discussion groups.']
    ],
    items: [
      { q: 'Who taught the General Honors course at Columbia, an early great-books course?', r: 'John Erskine', w: ['Robert Hutchins', 'Matthew Arnold', 'Charles W. Eliot', 'Stringfellow Barr'], why: 'Erskine began it in 1920.' },
      { q: 'Who was editor-in-chief of the 1952 Great Books of the Western World?', r: 'Robert Maynard Hutchins', w: ['John Erskine', 'Charles Van Doren', 'Charles W. Eliot', 'Scott Buchanan'], why: 'Hutchins, with Mortimer Adler as associate editor.' },
      { q: 'How many volumes does the 1990 second edition have?', r: '60', w: ['54', '50', '102', '45'], why: 'It grew from 54 to 60 volumes.' },
      { q: 'Which college built its whole four-year program on the great books in 1937?', r: 'St. John’s College', w: ['Harvard College', 'Yale College', 'Oberlin College', 'Berea College'], why: 'Under Stringfellow Barr and Scott Buchanan, in Annapolis.' },
      { q: 'Which of these was added in the 1990 edition?', r: 'Volumes of 20th-century works', w: ['The Bible', 'Apollonius on conic sections', 'Tom Jones', 'A volume of Hutchins’ letters'], why: 'Six 20th-century volumes were added; Apollonius and Tom Jones were dropped.' },
      { q: 'What is a fair statement of one main criticism of the great-books list?', r: 'Any list reflects the people who chose it', w: ['The books are too short', 'The books all say the same thing', 'Nobody has ever read them', 'They are all about science'], why: 'Critics note the 1952 list had no women and few writers from outside Europe and North America.' },
      { q: 'What is one reply defenders give to that criticism?', r: 'The list is a starting point, and the conversation can welcome more voices', w: ['The list can never change', 'Only scholars should read the books', 'Criticism of books is not allowed', 'Old books are always right'], why: 'Defenders say the test is a work’s depth, and the 1990 edition did add authors.' },
      { q: 'Why is the set called a "conversation"?', r: 'Because the books answer, argue with and build on each other', w: ['Because they are all written as dialogues', 'Because they were read on the radio', 'Because they were written in one year', 'Because they all agree'], why: 'Aristotle answers Plato, Galileo argues with the Aristotelians, and so on.' },
      { q: 'Which program at the University of Chicago, begun in 1946, still runs great-books discussions for adults?', r: 'The Basic Program of Liberal Education for Adults', w: ['The General Honors course', 'The Harvard Classics', 'The Paideia Proposal', 'The Syntopicon'], why: 'A four-year, non-credit program.' },
      { q: 'On this ladder, what are the three paths in every rung?', r: 'Young readers; teens and adults; going deeper', w: ['Easy; medium; hard', 'Reading; writing; arithmetic', 'Greek; Latin; English', 'Morning; noon; night'], why: 'Pick the one that fits, or read all three.' }
    ]
  };
  function famOrderEv(R, lv) {
    var k = lv === 1 ? 3 : 4, pick = R.sample(EV, k), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; });
    var right = srt.map(function (e) { return e[0]; }).join(' → '), w = [];
    for (var i = 0; i < 6 && w.length < 3; i++) { var s = R.shuffle(srt.slice()).map(function (e) { return e[0]; }).join(' → '); if (s !== right) w.push(s); }
    return H.mc('Which list is in order, <b>earliest first</b>?', right, H.samp(R, H.uniq(w), lv === 1 ? 2 : 3), srt.map(function (e) { return e[1] + ': ' + e[0] + '.'; }));
  }
  function famFirst(R, lv) {
    var pick = R.sample(EV, lv === 1 ? 3 : 4), srt = pick.slice().sort(function (a, b) { return a[1] - b[1]; }), late = R.next() < 0.5 && lv > 1;
    var t = late ? srt[srt.length - 1] : srt[0];
    return H.mc('Which of these happened ' + (late ? '<b>last</b>' : '<b>first</b>') + '?', t[0], pick.filter(function (e) { return e !== t; }).map(function (e) { return e[0]; }), srt.map(function (e) { return e[1] + ': ' + e[0] + '.'; }));
  }
  function famGap(R, lv) {
    var a = R.sample(EV, 2).sort(function (x, y) { return x[1] - y[1]; });
    if (a[0][1] === a[1][1]) return null;
    return H.num('How many years passed between these two events?<br>• ' + a[0][0] + ' (' + a[0][1] + ')<br>• ' + a[1][0] + ' (' + a[1][1] + ')', a[1][1] - a[0][1],
      [a[1][1] + ' − ' + a[0][1] + ' = ' + (a[1][1] - a[0][1]) + ' years.'], { hint: 'Subtract the earlier year from the later one.' });
  }
  function famYear(R, lv) {
    var e = R.pick(EV), w = [e[1] - 10, e[1] + 10, e[1] - 22, e[1] + 25, e[1] - 40].filter(function (y) { return y > 1850 && y < 2000; });
    return H.mc('In what year? ' + e[0] + '.', String(e[1]), H.samp(R, w.map(String), lv === 1 ? 2 : 3), [e[0] + ': ' + e[1] + '.']);
  }
  H.T(ID, B, [famOrderEv, famFirst, famGap, famYear], 0.5);
