  // How to Read a Great Book: the advice in the lesson, Bacon and Thoreau, Adler's levels of reading (described), and
  // reading-plan arithmetic (pages a day, days to finish, minutes over a year).
  var ID = 'gbstart.how-to-read-a-great-book';
  var B = {
    facts: [
      ['A great book is one that is still worth reading long after it was written.', true, 'That is the simplest test: it keeps rewarding readers.'],
      ['You should understand every word of a great book the first time you read it.', false, 'Nobody does. Great books are meant to be read more than once.'],
      ['Reading a hard book through once, without stopping at every hard word, helps you see how its parts fit.', true, 'Mark what puzzles you and keep going; the whole makes sense of the parts.'],
      ['Telling back what you read in your own words is called narration.', true, 'It is one of the best ways to remember.'],
      ['Poems, plays and speeches are best read silently and fast.', false, 'They were written to be heard; read them aloud.'],
      ['Before disagreeing with an author, you should be able to state the author’s view fairly.', true, 'Be fair before you judge.'],
      ['How to Read a Book was written by Mortimer Adler, and later revised with Charles Van Doren.', true, 'First published in 1940, revised in 1972.'],
      ['How to Read a Book describes syntopical reading: comparing several books on one subject.', true, 'It is the highest level in Adler’s scheme.'],
      ['Francis Bacon wrote that all books should be read wholly and with attention.', false, 'He said some should be tasted, some swallowed, and only some few chewed and digested.'],
      ['Thoreau wrote that books must be read as deliberately as they were written.', true, 'In Walden, in his chapter on reading (1854).'],
      ['A commonplace book is a notebook where you copy passages you want to keep.', true, 'Many great readers kept one.'],
      ['Every translation of a great book says exactly the same thing in the same way.', false, 'Every translation is also an interpretation; comparing two is useful.'],
      ['Fifteen or twenty minutes a day is enough to read many great books in a year.', true, 'The Harvard Classics were planned around fifteen minutes a day.'],
      ['Looking over the contents and a few pages before reading is a waste of time.', false, 'A first look tells you what kind of book it is and how it is built.'],
      ['Writing questions in the margin is one way of reading actively.', true, 'Reading with a pencil keeps your mind working.']
    ],
    items: [
      { q: 'Bacon says some books are to be "chewed and digested." What does he mean?', r: 'Read wholly, with diligence and attention', w: ['Read only in parts', 'Read quickly, without much care', 'Read aloud at dinner', 'Never read at all'], why: 'He explains it himself: some few books are "to be read wholly, and with diligence and attention."' },
      { q: 'Bacon says some books are only to be "tasted." What does he mean?', r: 'Read only in parts', w: ['Read wholly and carefully', 'Read twice', 'Copied into a notebook', 'Read in the original language'], why: '"Some books are to be read only in parts."' },
      { q: 'Which of these is narration?', r: 'Closing the book and telling back what you read in your own words', w: ['Reading the last page first', 'Looking up every hard word', 'Reading as fast as you can', 'Counting the pages left'], why: 'Narration means telling it back, aloud or in writing.' },
      { q: 'You hit a hard passage in the middle of a chapter. What does the lesson suggest the first time through?', r: 'Mark it and keep reading', w: ['Stop and give up', 'Skip to the next book', 'Look up every word before going on', 'Start the book over'], why: 'Read it through once; the rest of the book often explains the hard parts.' },
      { q: 'Who wrote the classic guide How to Read a Book?', r: 'Mortimer J. Adler (revised with Charles Van Doren)', w: ['Francis Bacon', 'Henry David Thoreau', 'Charles W. Eliot', 'John Erskine'], why: 'Adler wrote it in 1940; he revised it with Charles Van Doren in 1972.' },
      { q: 'Which level of reading, in Adler’s scheme, compares several books on one subject?', r: 'Syntopical reading', w: ['Elementary reading', 'Inspectional reading', 'Speed reading', 'Silent reading'], why: 'Syntopical reading puts several books side by side on one question.' },
      { q: 'Which is the best way to be fair to an author you disagree with?', r: 'First state the author’s view in a way the author would accept', w: ['Find one mistake and stop reading', 'Read only the parts you like', 'Read a summary instead', 'Ask someone who already disagrees'], why: 'Understand first, then judge.' },
      { q: 'Which kind of work is best read aloud?', r: 'A play or a poem', w: ['A table of numbers', 'An index', 'A dictionary', 'A list of contents'], why: 'Plays and poems were written to be heard.' },
      { q: 'What is a commonplace book?', r: 'A notebook of passages you want to keep', w: ['A cheap paperback', 'A book everyone owns', 'A book of common words', 'A library catalog'], why: 'Readers copy favorite passages into it.' },
      { q: 'Who wrote "Books must be read as deliberately and reservedly as they were written"?', r: 'Henry David Thoreau', w: ['Francis Bacon', 'Mortimer Adler', 'Matthew Arnold', 'Charles Dickens'], why: 'Thoreau, in Walden (1854).' },
      { q: 'Why compare two translations of the same passage?', r: 'To see what each translator decided, and get closer to the original', w: ['To find out which is shorter', 'Because one is always wrong', 'To skip the hard parts', 'To read twice as fast'], why: 'Every translation is also an interpretation.' }
    ]
  };
  var BOOKS = [['the Odyssey', 24, 'books'], ['Plato’s Republic', 10, 'books'], ['Don Quixote, Part One', 52, 'chapters'], ['Moby-Dick', 135, 'chapters'], ['Walden', 18, 'chapters'], ['the Aeneid', 12, 'books'], ['Euclid’s Elements', 13, 'books'], ['the Origin of Species', 14, 'chapters']];
  function famDays(R, lv) {
    var pages = lv === 1 ? R.pick([60, 80, 90, 120, 150]) : R.pick([180, 240, 300, 360, 420, 480]), per = lv === 1 ? R.pick([5, 10, 15]) : R.pick([6, 8, 12, 15, 20]);
    if (lv === 1) { while (pages % per) pages += 5; }
    var days = Math.ceil(pages / per), who = R.pick(['Ada', 'Ben', 'Cora', 'Dev', 'Eli', 'Faye', 'Gus', 'Hana']);
    var q = who + ' is reading a book of <b>' + pages + '</b> pages, ' + per + ' pages a day. How many days will it take to finish?';
    var st = ['Divide the pages by the pages per day: ' + pages + ' ÷ ' + per + ' = ' + (pages % per ? (pages / per).toFixed(2) : String(pages / per)) + '.'];
    if (pages % per) st.push('A part of a day still counts as a reading day, so round up to ' + days + '.');
    return H.num(q, days, st, { hint: 'Divide, and round up if there are pages left over.' });
  }
  function famChapters(R, lv) {
    var b = R.pick(BOOKS), per = lv === 1 ? 1 : R.pick([2, 3]), n = b[1], days = Math.ceil(n / per);
    return H.num(b[0].charAt(0).toUpperCase() + b[0].slice(1) + ' has ' + n + ' ' + b[2] + '. A family reads ' + per + ' ' + (per === 1 ? b[2].slice(0, -1) : b[2]) + ' each evening. How many evenings will it take?', days,
      [n + ' ÷ ' + per + (n % per ? ' = ' + (n / per).toFixed(2) + ', so round up to ' : ' = ') + days + ' evenings.']);
  }
  function famMinutes(R, lv) {
    var m = R.pick([10, 15, 20, 30]), d = lv === 1 ? R.pick([7, 10, 30]) : R.pick([30, 100, 365]);
    var tot = m * d;
    if (lv === 1) return H.num('You read for ' + m + ' minutes a day for ' + d + ' days. How many minutes is that in all?', tot, [m + ' × ' + d + ' = ' + tot + ' minutes.']);
    return H.num('You read for ' + m + ' minutes a day for ' + d + ' days. How many <b>hours</b> is that? (Round to the nearest whole hour.)', Math.round(tot / 60),
      [m + ' × ' + d + ' = ' + tot + ' minutes.', tot + ' ÷ 60 = ' + (tot / 60).toFixed(1) + ' hours, about ' + Math.round(tot / 60) + '.'], { hint: 'Find the minutes first, then divide by 60.' });
  }
  function famSort(R, lv) {
    var good = ['Read it through once before looking everything up', 'Tell back what you read in your own words', 'Write questions in the margin or a notebook', 'Read poems and plays aloud', 'State the author’s view fairly before judging it', 'Come back to it again later', 'Look over the contents first'];
    var bad = ['Give up after the first hard page', 'Read only a summary and skip the book', 'Decide you disagree before you finish', 'Look up every single word before reading on', 'Read as fast as possible and never go back'];
    if (lv === 1) { var g = R.pick(good); return H.mc('Which of these is good advice for reading a great book?', g, H.samp(R, bad, 2), [g + ': that is in the lesson.']); }
    var b = R.pick(bad);
    return H.mc('Which of these is <b>not</b> good advice for reading a great book?', b, H.samp(R, good, 3), [b + ': that is the opposite of the lesson’s advice.']);
  }
  H.T(ID, B, [famDays, famChapters, famMinutes, famSort, famSort], 0.5);
