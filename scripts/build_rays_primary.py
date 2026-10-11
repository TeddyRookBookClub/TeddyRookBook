# Builds data/rays_primary.yaml: teaching guides for all 89 lessons of Ray's New Primary Arithmetic (1877). Run: python3 scripts/build_rays_primary.py data/rays_primary.yaml
# Lesson facts (topics, page positions, sample problems) come from the Internet Archive scan raysnewprimarya00raygoog;
# the teaching steps are written for this site. Each step: [title, body]; body lines starting "Say:" are things to say aloud.
import json, sys

def roman(n):
    out = ''
    for v, s in [(50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v: out += s; n -= v
    return out

UNITS = [
    {'id': 1, 'name': 'Counting and writing numbers', 'from': 1, 'to': 6, 'text': 'Count real things to 10, then read and write every number to 100.'},
    {'id': 2, 'name': 'First number facts with counters', 'from': 7, 'to': 10, 'text': 'Put small groups together and take them apart with beans or buttons, before any tables.'},
    {'id': 3, 'name': 'Addition', 'from': 11, 'to': 23, 'text': 'The addition tables, one number at a time, each with short story problems.'},
    {'id': 4, 'name': 'Subtraction', 'from': 24, 'to': 37, 'text': 'Taking away: the subtraction tables, then adding and subtracting together.'},
    {'id': 5, 'name': 'Multiplication', 'from': 38, 'to': 51, 'text': 'Equal groups, then the times tables from 1 to 10, with reviews.'},
    {'id': 6, 'name': 'Division', 'from': 52, 'to': 63, 'text': 'Sharing and grouping: how many times one number is contained in another.'},
    {'id': 7, 'name': 'Signs, bigger numbers and mixed problems', 'from': 64, 'to': 78, 'text': 'The signs + − × ÷ =, adding and subtracting past 20, and story problems that use every operation.'},
    {'id': 8, 'name': 'Money, weights and measures', 'from': 79, 'to': 89, 'text': 'The old tables of money, weight, length, area and time. Some are history now; each guide says which still matter.'},
]

IDX = {1: 11, 2: 12, 3: 12, 4: 13, 5: 13, 6: 14, 7: 15, 8: 16, 9: 17, 10: 18}
for i, n in enumerate(range(11, 22)): IDX[n] = 19 + i          # XI..XXI -> 19..29
IDX.update({22: 30, 23: 32, 24: 33})
for i, n in enumerate(range(25, 38)): IDX[n] = 34 + i          # XXV..XXXVII -> 34..46
IDX[38] = 47
for i, n in enumerate(range(39, 50)): IDX[n] = 48 + i          # XXXIX..XLIX -> 48..58
for i, n in enumerate(range(50, 90)): IDX[n] = 60 + i          # L..LXXXIX -> 60..99 (+1 below)
for n in range(50, 90): IDX[n] = 60 + (n - 50)
# check against anchors found in the scan
for n, i in {51: 61, 57: 67, 60: 70, 61: 71, 62: 72, 63: 74}.items(): pass
# from LXIII on the review lesson LXII takes two pages, so later lessons shift by one
for n in range(63, 90): IDX[n] = 74 + (n - 63)
assert IDX[63] == 74 and IDX[64] == 75 and IDX[68] == 79 and IDX[79] == 90 and IDX[89] == 100 and IDX[87] == 98
assert IDX[42] == 51 and IDX[46] == 55 and IDX[49] == 58 and IDX[50] == 60 and IDX[62] == 72

L = {}
def add(n, **k):
    k['num'] = n; k['roman'] = roman(n); k['idx'] = IDX[n]
    k.setdefault('mins', 15)
    L[n] = k

COUNTERS = 'About 20 small counters: dried beans, buttons, pennies or pebbles (the book suggests marbles, beans or pebbles)'
SLATE = 'A slate, small whiteboard or paper and pencil'

# ---------------- Unit 1: counting and writing ----------------
add(1, title='Counting to ten and the figures 1 to 10', mins=15,
    goal='Your child counts up to ten real objects, touching each one once, and writes the figure for each number.',
    materials=[COUNTERS, SLATE],
    book='Ten rows of balls, from one ball to ten, with the word and the figure beside each row. The note to the teacher says the child should point to each ball while counting, then write the figure for each number.',
    steps=[
        ['Count real things first', 'Put 3 beans in a row. Touch each one as you count.\nSay: One, two, three. There are three beans.\nNow let your child do it, touching each bean once. Repeat with 5, then 2, then 7.'],
        ['Watch for skipping and double counting', 'Young children often say a number without touching anything, or touch one bean twice. If that happens, slow down and move each bean to the side as it is counted.'],
        ['Count the balls in the book', 'Open the book page. Have your child point to each ball in a row and count aloud, row by row, from one ball to ten.'],
        ['Match the figure', 'Point to the figure at the end of each row.\nSay: This is how we write three.\nAsk your child to find the figure for 4, for 7, for 10.'],
        ['Write the figures', 'Say a number from 1 to 10 and have your child write its figure. Start in order, then mix them up. Show 10 as "a one and a naught".'],
        ['Finish with something real', 'Ask your child to count something around the house: the chairs at the table, the windows in a room, the spoons in a drawer.'],
    ],
    practice='Count objects to 10 every day this week, then write the figures 1 to 10 from memory.',
    tip='The book says to teach one thing at a time, and teach it thoroughly. If counting is shaky, stay here for a few days before writing numbers.')
add(2, title='Numbers from 11 to 40', mins=15,
    goal='Your child reads and writes the numbers from eleven to forty, and sees that twenty-one means two tens and one more.',
    materials=[COUNTERS + ', at least 40 of them', SLATE],
    book='A table of the number words from eleven to forty with their figures. The note says counting objects is now carried to 40, and that one column, or less, is enough for one lesson.',
    steps=[
        ['Review 1 to 10', 'Have your child count ten beans and write the figures 1 to 10 quickly.'],
        ['Make a ten', 'Count out ten beans and push them together into a pile, or put them in a small cup.\nSay: This is a ten.\nPut 1 more bean beside it. Say: Ten and one is eleven. We write it 1 and 1: one ten and one more.'],
        ['Build the teens', 'Add one bean at a time beside the ten and name each number: twelve, thirteen ... up to twenty. At twenty, make a second ten.'],
        ['Read the table', 'Open the book page. Read one column together: the word and the figure. Then let your child read it alone.'],
        ['Twenty-one, thirty-one', 'Show two tens and one: twenty-one, written 21. Three tens and one: thirty-one, 31. Ask: How many tens in 34? How many ones?'],
        ['Write a few', 'Say five numbers from the column you read and have your child write them.'],
    ],
    practice='Read and write the next column of the table tomorrow, until all of 11 to 40 is easy. Don\'t do it all in one sitting.',
    tip='Eleven and twelve sound nothing like "ten-one" and "ten-two", so children find them hardest. Point that out, and practise them on their own.')
add(3, title='Numbers from 41 to 70', mins=15,
    goal='Your child reads and writes the numbers from forty-one to seventy, and keeps the earlier numbers fresh.',
    materials=[COUNTERS + ', or bundles of ten (sticks with a rubber band, or cups of ten beans)', SLATE],
    book='The number words from forty-one to seventy with their figures, on the same page as Lesson II. The note says each lesson should include a review of the ones before it.',
    steps=[
        ['Quick review', 'Ask your child to read five numbers from Lesson II and write three more from your dictation.'],
        ['Count by tens', 'Line up bundles or cups of ten and count them together: ten, twenty, thirty, forty, fifty, sixty, seventy.'],
        ['Build a number', 'Make 4 tens and 3 ones. Ask: How many tens? How many ones? So it is forty-three, written 43.\nDo the same for 56 and 68.'],
        ['Read the table', 'Read the new table together, then alone. Stop now and then to ask how many tens and ones.'],
        ['Write from dictation', 'Say six numbers between 41 and 70 and have your child write them. Include one or two from the earlier lesson.'],
    ],
    practice='Review tomorrow: count by tens to 70, then read the table without help.',
    tip='Fifty and sixty end in "-ty" just like the others, but fifty does not sound like "five-ty". Mention it.')
add(4, title='Numbers from 71 to 100', mins=15,
    goal='Your child reads and writes every number up to one hundred.',
    materials=['Bundles or cups of ten (ten of them)', SLATE],
    book='The number words from seventy-one to one hundred with their figures.',
    steps=[
        ['Count by tens to 100', 'Lay out ten bundles of ten and count by tens to one hundred.\nSay: Ten tens make one hundred. We write it 100: a one and two naughts.'],
        ['Read the table', 'Read the new table together, then alone.'],
        ['Tens and ones', 'Ask: How many tens in 85? How many ones? Then the other way: What number has 9 tens and 2 ones?'],
        ['Write from dictation', 'Dictate six numbers between 71 and 100, then two older ones.'],
    ],
    practice='Count aloud from 1 to 100 over the next few days, a little each day.')
add(5, title='Reading figures from 1 to 100', mins=10,
    goal='Your child reads any number up to 100 at a glance, in any order.',
    materials=[SLATE],
    book='A table of figures from naught to one hundred, mixed out of order, for reading aloud. The note says pupils should learn to read figures readily from 1 to 100, and that the figures should be copied on the blackboard.',
    steps=[
        ['Read across a row', 'Open the book page. Point to the figures one at a time and have your child read them aloud. Help with any that stick.'],
        ['Copy some out', 'As the book suggests, copy a few rows onto a whiteboard or paper so you can point at them, cross them out and add your own.'],
        ['Tricky pairs', 'Write 12 and 21, 31 and 13, 68 and 86 side by side. Ask your child to read each and say which is bigger.'],
        ['Speed round', 'Point to ten figures quickly. Count how many your child reads without a pause, and try to beat it next time.'],
    ],
    practice='A one-minute reading round each day until it is easy.')
add(6, title='Writing numbers from dictation', mins=15,
    goal='Your child writes any number up to 100 when you say it.',
    materials=[SLATE],
    book='Writing exercises: the teacher reads number words and the pupil writes the figures, from naught up to one hundred, at the blackboard or on a slate.',
    steps=[
        ['Naught', 'Show 0 and call it "naught", as the book does (we usually say zero). Ask: How many beans are in an empty cup?'],
        ['Pairs that sound alike', 'Dictate pairs from the book: one, ten; two, twenty; three, thirty; and so on to nine, ninety. Talk about how they differ.'],
        ['Dictation', 'Read about ten numbers from the book\'s lists. Your child writes each one. Check them together.'],
        ['Fix mistakes kindly', 'If your child writes 41 for "fourteen", build it with bundles: one ten and four ones.'],
    ],
    practice='Write five dictated numbers each day this week. Unit 1 is done when reading and writing to 100 are easy.')

# ---------------- Unit 2: combinations with counters ----------------
add(7, title='Putting small groups together', mins=15,
    goal='Your child finds the total of two small groups up to 10 using counters, and begins to say the facts aloud.',
    materials=[COUNTERS],
    book='Questions to answer with counters or bits of card, such as "How many are 4 and 1? How many are 3 and 2?" The note says the counters should be set out in separate groups, one for each number.',
    steps=[
        ['Two groups', 'Put out 3 beans and, a little apart, 2 beans.\nSay: Here are 3 beans and here are 2. How many are 3 and 2?\nLet your child push them together and count.'],
        ['Say the fact', 'Have your child say the whole sentence: "3 and 2 are 5." This is how Ray\'s writes every fact.'],
        ['Work through the book\'s questions', 'Read the questions from the book page one at a time. Your child sets out each group, then answers.'],
        ['Same answer, different way', 'Ask: How many are 4 and 1? How many are 1 and 4? Show that the groups are the same, just swapped.'],
    ],
    practice='Do a few counter questions every day this week, using different small objects.')
add(8, title='Facts up to 8: together, apart and in groups', mins=15,
    goal='Using counters, your child adds to 8, takes away from 8, and counts equal groups.',
    materials=[COUNTERS],
    book='Spoken questions on the numbers to 8, putting together ("How many are 5 and 3?"), taking away ("One from 6 leaves how many?") and equal groups ("How many are 2 times 3?").',
    steps=[
        ['Warm up', 'Ask three questions from Lesson VII with counters.'],
        ['Taking away', 'Put out 6 beans. Take 1 away and hide it in your hand.\nSay: One from 6 leaves how many?\nLet your child count what is left. Then 2 from 6, 3 from 6.'],
        ['Equal groups', 'Make 2 piles of 3 beans.\nSay: Two times three. How many altogether?\nThis is a first look at multiplying; there is no need to name it yet.'],
        ['Book questions', 'Work through the questions on the book page, with counters for every one.'],
    ],
    practice='A few counter questions every day. Let your child make up a question for you to answer too.')
add(9, title='Facts up to 10', mins=15,
    goal='Your child answers spoken questions on the numbers to 10, using counters only when needed.',
    materials=[COUNTERS],
    book='Spoken questions on all the facts to 10, such as "How many are 9 and 1? How many are 8 and 2? How many are 7 and 3?"',
    steps=[
        ['Make ten in every way', 'Put out 10 beans. Split them into two groups in different ways: 9 and 1, 8 and 2, 7 and 3, 6 and 4, 5 and 5. Say each fact aloud.'],
        ['Book questions, counters first', 'Ask the questions from the book page. Let your child use counters for the first few.'],
        ['Hands off', 'For the rest, ask your child to answer without touching the counters, then check with them.'],
        ['Taking away from 10', 'Ask: 3 from 10 leaves how many? Use the pairs you made in the first step.'],
    ],
    practice='Ask "What goes with 7 to make 10?" and similar questions in the car or at meals.',
    tip='The pairs that make 10 are worth learning by heart. They make later adding much easier.')
add(10, title='Counting the birds: adding with a picture', mins=15,
    goal='Your child solves short story problems by looking at a picture, then without one.',
    materials=['The book page (it has a picture of birds)', COUNTERS],
    book='A picture of birds on a bush and two flocks in the distance, with story questions about the birds, such as "How many birds are two birds and five birds?"',
    steps=[
        ['Talk about the picture', 'Look at the picture together. Ask: How many birds are on the bush? How many in each flock?'],
        ['Story questions', 'Read the book\'s questions. Your child answers by counting in the picture.'],
        ['Without the picture', 'Ask a similar question with no picture: "Seven birds sat on a fence and four more came. How many birds?" Use counters if needed.'],
        ['Your own story', 'Ask your child to make up a bird story for you to answer.'],
    ],
    practice='Make up one "how many" story a day from real life: ducks at the pond, cars in the drive.')

# ---------------- Unit 3: addition tables ----------------
ADD_SAMPLES = {
    11: ['Francis had 2 cents, and his mother gave him 1 cent more: how many had he then?', 'John had 1 raisin, and his sister gave him 3 raisins more: how many had he then?'],
    12: ['Mary had two birds, and a friend gave her 2 more: how many birds had she then?', 'Daniel has 3 tops, and Francis has 2: how many tops have they both?'],
    13: ['Julius had 3 cents, and he found 2 more: how many cents had he then?', 'Francis has 3 dimes in his hand, and 3 in his pocket: how many dimes has he?'],
    14: ['James had 4 pens, and he found 2 more: how many had he then?', 'Mary has 3 pins in one hand, and 4 in the other: how many pins has she in both?'],
    15: ['A hen has 5 black chickens and 2 white ones: how many chickens has she?', 'I gave 5 cents for a whistle, and 4 cents for a top: how much did I give for both?'],
    16: ['A farmer has 6 cows in one field, and 2 in another: how many cows in both fields?', 'Lucy gave 7 cents to one poor man, and 6 cents to another: how many cents did she give to both?'],
    17: ['If you place 7 marbles by the side of 2 marbles, how many will there be altogether?', 'Thomas had 7 apples, and his mother gave him 6 more: how many had he then?'],
    18: ['James has 8 nuts in his pocket, and 2 in his hand: how many nuts has he?', 'Harvey found 8 eggs, and Thomas 6: how many eggs did both find?'],
    19: ['A cat caught 9 mice one day, and 2 the next: how many did she catch in both days?', 'George and Henry have 9 cents each: how many cents have both?'],
    20: ['I paid 10 cents for ink, and 2 cents for paper: how much did I pay for both?', 'There are 10 trees in one row, and 4 in another: how many trees in both rows?'],
}
ADD_TIPS = {
    1: 'Adding 1 is just saying the next number. Make that connection out loud.',
    2: 'Adding 2 is counting on two: "7 ... 8, 9".',
    3: 'If a fact is slow, count on from the bigger number: for 3 and 8, start at 8 and say "9, 10, 11".',
    4: 'Use the pairs that make 10: 4 and 6 are 10, so 4 and 7 are one more, 11.',
    5: 'Five is half of ten. Show 5 and 5 on two hands: 10.',
    6: 'Doubles help: 6 and 6 are 12, so 6 and 7 are 13.',
    7: '7 and 3 make 10, so 7 and 5 are 10 and 2 more: 12.',
    8: 'Adding 8 is like adding 10 and taking 2 away: 8 and 6 are 16 less 2, 14.',
    9: 'Adding 9 is adding 10, then one less: 9 and 5 are 14.',
    10: 'Adding 10 just changes the tens: 10 and 4 are fourteen, one ten and four.',
}
for k in range(1, 11):
    n = 10 + k
    s = ADD_SAMPLES[n]
    add(n, title='Adding %d (sums to %d)' % (k, k + 10), mins=15,
        goal='Your child knows by heart every fact that adds %d to a number from 1 to 10, and uses them in story problems.' % k,
        materials=[COUNTERS, SLATE],
        book='The table of facts with %d, from "%d and 1 are %d" to "%d and 10 are %d", with the turned-around facts, then about nine short story problems. The first problem has a worked solution.' % (k, k, k + 1, k, k + 10),
        steps=[
            ['Warm up', ('Ask five quick facts from the earlier tables, out of order.' if k > 1 else 'Ask a few facts to 10 from Lesson IX.') + ' Note any that are slow; they go in tomorrow\'s warm-up.'],
            ['Build it with counters', 'Put out a group of %d. Add 1 more and ask how many. Then start again with %d and add 2, then 3, and so on.\nSay each one as a full sentence: "%d and 1 are %d. %d and 2 are %d."' % (k, k, k, k + 1, k, k + 2)],
            ['Read the table', 'Open the book page and read the table together. Then your child reads it alone.'],
            ['Cover and recall', 'Cover the answers with a card. Ask the facts out of order. Include the turned-around ones: "%d and %d" is the same as "%d and %d".' % (3, k, k, 3)],
            ['Story problems', 'Read the problems on the page aloud, one at a time. They go like this:\n~ %s\n~ %s\nYour child answers in a full sentence, the way the worked solution does.' % (s[0], s[1])],
            ['Write a few', 'Your child writes five facts from this table on the slate from memory.'],
            ['Wrap up', 'One last quick round of the three facts that were hardest today.'],
        ],
        practice='Two minutes on this table each day until all its facts come instantly, then move on.',
        tip=ADD_TIPS[k])
add(21, title='Review of addition, and counting by 2s, 3s, 4s and 5s', mins=15,
    goal='Your child answers mixed addition facts quickly and counts on by 2s, 3s, 4s and 5s.',
    materials=[SLATE],
    book='Mixed facts with two and then three numbers, such as "How many are 2 and 2 and 2?", and counting exercises such as "Begin with 1 and count by 2\'s to 19."',
    steps=[
        ['Mixed facts', 'Ask the two-number facts from the page, out of order. Keep the pace brisk.'],
        ['Three numbers', 'Ask: How many are 2 and 2 and 2? Show how to add the first two, then add the third.'],
        ['Count by 2s', 'Count together from 2 by 2s to 20, then from 1 by 2s to 19, as the book asks.'],
        ['Count by 3s, 4s, 5s', 'Do the other counting exercises on the page. Clap on each number to keep the rhythm.'],
    ],
    practice='Counting by 2s, 5s and 10s on walks or in the car.',
    tip='Counting by a number is the first step towards the times tables.')
add(22, title='Adding three numbers', mins=15,
    goal='Your child adds three small numbers in their head.',
    materials=[COUNTERS],
    book='Facts with three numbers, such as "How many are 4 and 5 and 7?" and "How many are 2 and 4 and 2?". The lesson takes two pages.',
    steps=[
        ['Show the method', 'Say: For 4 and 5 and 7: 4 and 5 are 9; 9 and 7 are 16.\nUse counters in three groups the first time.'],
        ['Look for a ten', 'For 3 and 6 and 7, notice that 3 and 7 make 10, so the answer is 16. Adding in a different order is allowed.'],
        ['Book questions', 'Work through the questions on the pages, aloud.'],
    ],
    practice='Ask one three-number question at every meal for a week.')
add(23, title='Story problems with addition', mins=15,
    goal='Your child solves story problems that add three or more amounts.',
    materials=[SLATE],
    book='Story problems such as "Mary paid 5 cents for ribbon, 4 cents for thread, and 3 cents for tape: how much did she pay for all?" and "Joseph caught 6 fishes, Samuel 3, and Henry 5: how many fishes did they all catch?"',
    steps=[
        ['Read slowly', 'Read the first problem aloud. Ask: What are we finding? What numbers do we need?'],
        ['Answer in a sentence', 'Your child answers in a full sentence: "Mary paid 12 cents for all."'],
        ['Work through the page', 'Do the rest of the problems the same way.'],
        ['Act one out', 'Act one problem out with coins or toys, letting your child be the shopkeeper.'],
    ],
    practice='Unit 3 is done. Spend a day reviewing any addition table that is still slow before starting subtraction.')

# ---------------- Unit 4: subtraction ----------------
add(24, title='Taking away: the owls and the bats', mins=15,
    goal='Your child understands taking away, and uses the word "less", in stories and with a picture.',
    materials=['The book page (it has a picture of owls and bats)', COUNTERS],
    book='A picture of owls and bats, then questions such as "There were three owls sitting on a tree; two of them flew away, how many were left?" and "Seven less 4 are how many?"',
    steps=[
        ['Talk about the picture', 'Count the owls and the bats together.'],
        ['Act it out', 'Put 3 beans on the table as owls. Two fly away (move them off).\nSay: How many are left? So 3 less 2 are 1.'],
        ['The word "less"', 'Ray\'s says "7 less 4 are 3" where we might say "7 minus 4 is 3". Use the book\'s way for now.'],
        ['Book questions', 'Work through the questions on the page with counters.'],
    ],
    practice='Make up one "flew away" or "ate up" story a day.')
SUB_SAMPLES = {
    25: ['If 1 melon be taken from 4 melons, how many melons will remain?', 'Ella had 10 plums, and she gave 1 to her sister: how many plums had she left?'],
    26: ['Frank had 3 apples, and gave 1 to his brother: how many had he left?', 'William had 4 cents: after spending 2 cents for nuts, how many had he left?'],
    27: ['Mary had 4 oranges; after eating 3, how many did she have left?', 'Six persons are in a carriage: if 3 of them get out, how many will remain?'],
    28: ['Henry has 5 apples: if he eat 4 of them, how many will he have left?', 'Eliza had 6 birds in a cage: she let 2 of them out: how many remained in the cage?'],
    29: ['Francis had 6 oranges, and gave 5 of them away: how many had he left?', 'Of 8 ships that went to sea, 5 were lost in a storm: how many remained?'],
    30: ['If James makes 7 marks on a slate, and then rubs out 1 of them, how many remain?', 'I bought 10 eggs in market, and broke 4 of them coming home: how many whole eggs remained?'],
    31: ['Thomas had 12 marbles, and lost 5 of them: how many had he left?', 'Seven and how many make 15?'],
    32: ['Jane has 10 cents: if she give 8 cents for a hook, how many cents will she still have?', 'Frank had 13 oranges, and gave 5 to Charles: how many did Frank then have?'],
    33: ['Thomas has 10 walnuts: after eating 9, how many will he have left?', 'I bought a kite for 9 cents, and sold it for 18 cents: how much did I make?'],
    34: ['There are 13 pupils in school: if 3 of them leave, how many will remain?', 'Charles had 15 marbles, and lost all but 5: how many did he lose?'],
}
for k in range(1, 11):
    n = 24 + k
    s = SUB_SAMPLES[n]
    add(n, title='Subtracting %d' % k, mins=15,
        goal='Your child knows by heart every fact that takes %d from a number up to %d, and uses them in story problems.' % (k, k + 10),
        materials=[COUNTERS, SLATE],
        book='The table of facts that take %d away, up to "%d from %d leaves 10", then story problems. The first has a worked solution.' % (k, k, k + 10),
        steps=[
            ['Warm up', 'Five quick facts from the earlier subtraction tables (or, for this first one, from the addition tables).'],
            ['Build it with counters', 'Put out %d beans and take %d away. How many are left? Then start with %d and take %d away, and so on.\nSay each fact in full: "%d from %d leaves %d."' % (k + 1, k, k + 2, k, k, k + 2, 2)],
            ['Link to adding', 'Show that %d and 3 are %d, so %d from %d leaves 3. Every subtraction fact has an addition fact behind it.' % (k, k + 3, k, k + 3)],
            ['Read the table', 'Read the table on the book page together, then alone.'],
            ['Cover and recall', 'Cover the answers and ask the facts out of order.'],
            ['Story problems', 'Read the problems aloud. They go like this:\n~ %s\n~ %s\nYour child answers in a full sentence.' % (s[0], s[1])],
            ['Wrap up', 'Your child writes three facts from today\'s table from memory.'],
        ],
        practice='Two minutes a day on this table, mixed with the earlier ones.',
        tip='If a fact is slow, count up from the smaller number: for %d from %d, count from %d up to %d.' % (k, k + 6, k, k + 6) if k < 10 else 'Taking 10 away just removes the ten: 10 from 17 leaves 7.')
add(35, title='Review of subtraction', mins=15,
    goal='Your child answers mixed "less" facts up to 19 quickly.',
    materials=[SLATE],
    book='A long drill of mixed facts in the book\'s wording, such as "How many are 12 less 4? 12 less 8? 13 less 6?". The first has a worked solution.',
    steps=[
        ['Drill in short bursts', 'Ask five facts from the page, then stop and praise. Then five more.'],
        ['Sort the slow ones', 'Write any slow facts on cards. They become the warm-up for the next few days.'],
        ['Check with adding', 'For 13 less 6, ask: 6 and what make 13?'],
    ],
    practice='Keep the cards of slow facts and run through them each day.')
add(36, title='Adding and subtracting together', mins=15,
    goal='Your child adds two numbers, then subtracts a third, in their head.',
    materials=[COUNTERS],
    book='Questions such as "How many are 2 and 5, less 3?" and "How many are 8 and 9, less 7?". The first has a worked solution.',
    steps=[
        ['Show the order', 'Say: For "2 and 5, less 3": first 2 and 5 are 7; then 7 less 3 are 4.\nUse counters for the first one.'],
        ['Say each step aloud', 'Your child says the middle answer aloud each time, the way the book does.'],
        ['Book questions', 'Work through the questions on the page.'],
    ],
    practice='Ask one of these "and ... less" questions a day.')
add(37, title='Counting back, and story problems with two steps', mins=15,
    goal='Your child counts backward by 2s, 3s, 4s and 5s, and solves stories that take away twice.',
    materials=[COUNTERS],
    book='Exercises such as "Begin with 20, and subtract by 2\'s to 0", then story problems like "Mary had 11 apples: she gave 4 to Lucy, and 5 to Nancy: how many had she left?"',
    steps=[
        ['Count back', 'Count back together from 20 by 2s to 0. Then do the other counting-back exercises on the page.'],
        ['Two-step stories', 'Read Mary\'s apples problem. Act it out with counters: 11, give 4 away, give 5 away. How many left?'],
        ['Another way', 'Show that she gave away 4 and 5, that is 9 in all, and 11 less 9 are 2. Both ways give the same answer.'],
        ['Book problems', 'Work through the rest of the problems.'],
    ],
    practice='Unit 4 is done. Review the subtraction cards before moving on to multiplication.')

# ---------------- Unit 5: multiplication ----------------
add(38, title='Equal groups: the swallows', mins=15,
    goal='Your child sees multiplying as adding equal groups, and uses the word "times".',
    materials=['The book page (it has a picture of swallows)', COUNTERS],
    book='A picture of swallows, with questions such as "How many birds are three times four birds?" and "Each swallow has two wings: how many wings have eight swallows?"',
    steps=[
        ['Talk about the picture', 'Count the swallows flying and the swallows resting.'],
        ['Make equal groups', 'Make 3 piles of 4 beans.\nSay: Three times four. How many? It is 4 and 4 and 4: twelve.'],
        ['Wings and legs', 'Each swallow has 2 wings. For 3 swallows, count 2, 4, 6. Counting by 2s is multiplying by 2.'],
        ['Book questions', 'Work through the questions on the page with counters.'],
    ],
    practice='Look for equal groups at home: eggs in a carton, wheels on cars, legs on chairs.')
MUL_SAMPLES = {
    39: ['If apples cost 1 cent apiece, what will be the cost of 4 apples?', 'If one toy book cost 1 cent, how much must Mary pay for 8 toy books?'],
    40: ['When peaches are selling at 2 cents each, how much will 2 peaches cost?', 'Frank bought 2 plums, at 3 cents each: how much did they cost?'],
    41: ['If a pint of chestnuts cost 3 cents, how much will 2 pints cost?', 'James bought 3 tops, at 3 cents each: what did he pay for them?'],
    42: ['Lucy has 2 kittens, and each one has 4 feet: how many feet have both?', 'Daniel bought 4 tops, at 4 cents each: what did they cost?'],
    43: ['Francis bought 5 tops, at 2 cents each: how many cents did they cost?', 'If 1 pound of flour cost 5 cents, what will 9 pounds cost?'],
    44: ['If 1 dress can be made from 6 yards of calico, how many yards will it take to make 2 dresses?', 'Mary has 3 hens, and each hen has 6 chickens: how many chickens are there in all?'],
    45: ['Sarah bought 2 thimbles at 7 cents each: how much did both cost?', 'There are 7 days in a week: how many days are in 4 weeks?'],
    46: ['James bought 2 melons, at 8 cents each: how many cents did they cost?', 'Nancy has 4 hens, and each hen has 8 chickens: how many chickens are there?'],
    47: ['Francis bought 2 knives, at 9 cents each: how many cents did they cost?', 'If a boy travel 8 miles in 1 hour, how far will he travel in 9 hours?'],
    48: ['I bought 10 pencils, at 2 cents each: how much did they cost?', 'If 10 marbles are given for 1 cent, how many must be given for 7 cents?'],
}
MUL_ANS = {
    46: '1. 16 cents. 2. 24 fishes. 3. 32 chickens. 4. 40 windows. 5. 48 pints. 6. 56 cents. 7. 64 quarts. 8. 72 cents. 9. 80 cents.',
    47: '1. 18 cents. 2. 27 cents. 3. 36 panes. 4. 45 cents. 5. 54 cents. 6. 63 cents. 7. 72 miles. 8. 81 cents.',
    45: '1. 14 cents. 2. 21 marbles. 3. 28 days. 4. 35 peaches. 5. 42 miles. 6. 49 boys. 7. 56 marbles. 8. 63 cents. 9. 70 cents.',
    48: '1. 20 cents. 2. 30 dollars. 3. 40 pecks. 4. 50 pounds. 5. 60 dollars. 6. 70 marbles. 7. 80 cents. 8. 90 dollars. 9. 100 dollars.',
}
MUL_TIPS = {
    1: 'One times anything is itself. Children find it funny that a table can be so easy.',
    2: 'Times 2 is the same as doubling, and the same as counting by 2s.',
    3: 'Count by 3s with a clap: 3, 6, 9, 12 ...',
    4: 'Times 4 is doubling twice: 4 times 6 is double 12, which is 24.',
    5: 'Every answer ends in 5 or 0, like the minutes on a clock.',
    6: 'Six times an even number ends in the same digit: 6 times 4 is 24, 6 times 8 is 48.',
    7: '7 is the hardest table. Learn the turned-around facts first; your child already knows 7 times 2, 3, 4, 5 and 6 from earlier tables.',
    8: 'Times 8 is doubling three times: 8 times 3 is double 6, double 12, which is 24.',
    9: 'Hold up 10 fingers and fold down the 4th: 3 fingers and 6 fingers, so 9 times 4 is 36. The digits of each answer add up to 9.',
    10: 'Times 10 puts a naught on the end.',
}
for k in range(1, 11):
    n = 38 + k
    s = MUL_SAMPLES[n]
    add(n, title='Multiplying by %d' % k, mins=15,
        goal='Your child knows the %d times table by heart, both ways round, and uses it in story problems.' % k,
        materials=[COUNTERS, SLATE],
        book='The table from "%s" to "%s", with each fact also turned around, then about nine story problems on prices and quantities. The first has a worked solution.' % ('1 times %d is %d' % (k, k) if k > 1 else '1 times 1 is 1', '10 times %d are %d' % (k, 10 * k)),
        steps=[
            ['Warm up', 'Count by %ds as far as your child can go. Then ask three facts from the earlier tables.' % k if k > 1 else 'Count out 4 single beans: four times one bean is four beans.'],
            ['Build a few facts', 'Make 3 groups of %d beans: "3 times %d are %d." Then 4 groups, then 5.' % (k, k, 3 * k)],
            ['Both ways round', 'Show that 3 times %d and %d times 3 give the same total: turn the rows of beans sideways.' % (k, k)],
            ['Read the table', 'Read the table on the book page together, then alone.'],
            ['Cover and recall', 'Cover the answers and ask the facts out of order.'],
            ['Story problems', 'Read the problems aloud. They go like this:\n~ %s\n~ %s\nYour child answers in a full sentence, as the worked solution does: "The melons cost 2 times 8 cents, which are 16 cents."' % (s[0], s[1])],
            ['Wrap up', 'Your child writes the table from memory, as far as they can.'],
        ],
        practice='Say the table aloud each day, then answer five facts out of order. Move on when it comes instantly.',
        tip=MUL_TIPS[k],
        answers=MUL_ANS.get(n))
add(49, title='Review of multiplication, and three numbers', mins=20,
    goal='Your child answers any times-table fact to 10 × 10 and multiplies three small numbers.',
    materials=[SLATE],
    book='A two-page review: first pairs of facts such as "How many are 2 times 5?", then three numbers, such as "How many are 2 times 3 times 3?" (worked: 3 times 3 are 9; 2 times 9 are 18).',
    steps=[
        ['First page in short rounds', 'Ask the facts in rounds of five. Put any slow fact on a card.'],
        ['Three numbers', 'Show the worked example: 3 times 3 are 9; 2 times 9 are 18. Then work through the second page.'],
        ['A times-table square', 'Optional: fill in a 10 × 10 grid together. Your child will see that the patterns repeat.'],
    ],
    practice='Spread this lesson over two or three days.')
add(50, title='Adding, subtracting and multiplying in a chain', mins=15,
    goal='Your child follows a chain of three steps in their head.',
    materials=[SLATE],
    book='Questions such as "How many are 2 and 5, less 4, multiplied by 3?" (worked: 2 and 5 are 7; 7 less 4 are 3; 3 multiplied by 3 is 9).',
    steps=[
        ['Show one slowly', 'Work the example aloud, saying each middle answer.'],
        ['Write the middle answers', 'At first, let your child jot each middle answer on the slate. Later, do it all in their head.'],
        ['Book questions', 'Work through the page.'],
    ],
    practice='One chain question a day, made longer as your child gets faster.')
add(51, title='Mixed story problems', mins=20,
    goal='Your child decides which operation each story needs.',
    materials=[SLATE],
    book='Ten mixed problems ("promiscuous questions" meant mixed-up questions), such as "Joseph had 14 cents, and bought 2 oranges, at 5 cents each: how much money had he left?"',
    steps=[
        ['What is happening?', 'For each problem, ask first: Are we putting together, taking away, or making equal groups? Then solve it.'],
        ['Worked example', 'Joseph paid 2 times 5 cents, which are 10 cents; he had left 14 cents less 10 cents, which are 4 cents.'],
        ['Work through the page', 'Do the problems over one or two days.'],
    ],
    answers='1. 4 cents. 2. 20 dollars. 3. 9 cents. 4. 14 dollars. 5. 9 dollars. 6. 72 bushels. 7. 50 dollars. 8. 15 cents. 9. 28 shoes. 10. Kate\'s father gave her 54 cents.',
    practice='Unit 5 is done. Keep the times-table cards in the daily warm-up.')

# ---------------- Unit 6: division ----------------
add(52, title='Sharing: the geese and the ducks', mins=15,
    goal='Your child shares a group equally and finds how many groups of a size can be made.',
    materials=['The book page (it has a picture of geese and ducks)', COUNTERS],
    book='A picture of five wild geese and twenty ducks, with questions such as "If twenty ducks were divided into four flocks, each having the same number, how many ducks would there be in each flock?"',
    steps=[
        ['Talk about the picture', 'Count the geese and the ducks.'],
        ['Share out', 'Put 20 beans down. Deal them into 4 piles, one at a time, like cards. How many in each pile?'],
        ['How many groups?', 'Ask: How many groups of 5 can you make from 20? Make them and count the groups.'],
        ['Book questions', 'Answer the five questions on the page with counters.'],
    ],
    answers='1. 5 ducks. 2. 4 times. 3. 2 wings. 4. 2 times. 5. 2 flowers.',
    practice='Share snacks out equally at home and ask how many each person gets.')
DIV_SAMPLES = {
    53: ['How many apples, at 2 cents each, can you buy for 4 cents?', 'How many yards of ribbon, at 2 cents a yard, can you buy for 12 cents?'],
    54: ['If you have 6 balls, how many groups, of 3 balls each, can you make out of them?', 'If 9 peaches cost 27 cents, what does one cost?'],
    55: ['How many oranges, at 4 cents each, can you buy for 8 cents?', 'If 4 quarts make 1 gallon, how many gallons are in 12 quarts?'],
    56: ['How many oranges, at 5 cents each, can you buy for 10 cents?', 'In one week there are 7 days: how many weeks in 35 days?'],
    57: ['How many quarts of milk, at 6 cents a quart, can you buy for 12 cents?', 'There are 24 trees in 6 rows: how many trees in each row?'],
    58: ['If you divide 14 apples into piles, containing 7 apples each, how many piles will there be?', 'If a man travels 42 miles in 6 hours, how far does he go in 1 hour?'],
    59: ['If in one peck there are 8 quarts, how many pecks are there in 16 quarts?', 'Harry paid 72 cents for 9 pears: how much did he pay for each?'],
    60: ['How many pencils, at 9 cents each, can you buy for 18 cents?', 'If 81 blocks are placed in 9 rows, how many are in each row?'],
    61: ['How many melons, at 10 cents each, can you buy for 20 cents?', 'If a quince is worth 10 apples, how many quinces can you get for 30 apples?'],
}
DIV_ANS = {
    53: '1. 2 apples. 2. 3 marbles. 3. 2 lemons. 4. 2 peaches. 5. 6 yards. 6. 2 oranges. 7. 8 tops. 8. 2 kites.',
    54: '1. 2 groups. 2. 3 yards. 3. 3 pears. 4. 5 yards. 5. 6 oranges. 6. 3 groups. 7. 3 yards. 8. 3 cents.',
    55: '1. 2 oranges. 2. 3 gallons. 3. 4 apples each. 4. 5 scholars on each bench. 5. 6 copy-books. 6. 4 tops. 7. 8 peaches. 8. 4 cakes. 9. 4 spelling-books.',
    56: '1. 2 oranges. 2. 5 pencils. 3. 5 toy-books. 4. 5 pears. 5. 5 melons. 6. 5 weeks. 7. 5 cakes. 8. 9 tops.',
    57: '1. 2 quarts. 2. 3 oranges. 3. 4 trees. 4. 6 pears. 5. 6 pounds. 6. 6 lemons. 7. 6 pencils. 8. 9 rings. 9. 10 dollars a load.',
    58: '1. 2 piles. 2. 3 pineapples. 3. 4 melons. 4. 5 peaches each. 5. 7 miles. 6. 7 cents a quart. 7. 7 trees in each row. 8. 7 yards. 9. 10 dollars.',
    60: '1. 2 pencils. 2. 9 cents a pound. 3. 9 cents each. 4. 9 cents. 5. 6 cents a spool. 6. 9 miles an hour. 7. 8 yards. 8. 9 blocks.',
    61: '1. 2 melons. 2. 3 quinces. 3. 10 pears. 4. 5 oranges. 5. 6 dozen. 6. 7 coats. 7. 10 kites. 8. 9 balls. 9. 10 dimes.',
}
for k in range(2, 11):
    n = 51 + k
    s = DIV_SAMPLES[n]
    add(n, title='Dividing by %d' % k, mins=15,
        goal='Your child knows how many times %d is contained in each number up to %d, and uses it in story problems.' % (k, 10 * k),
        materials=[COUNTERS, SLATE],
        book='The table from "%d in %d, 1 time" to "%d in %d, 10 times", with the matching facts the other way round, then story problems on buying, sharing and measures. The first has a worked solution.' % (k, k, k, 10 * k),
        steps=[
            ['Warm up', 'Ask five facts from the %d times table. Division is the times table backwards.' % k],
            ['Build it with counters', 'Put out %d beans. Ask: How many groups of %d can you make? Make them and count the groups.\nSay it the book\'s way: "%d in %d, %d times."' % (3 * k, k, k, 3 * k, 3)],
            ['Link to multiplying', 'Ask: 3 times %d are how many? So %d is contained in %d three times.' % (k, k, 3 * k)],
            ['Read the table', 'Read the table on the book page together, then alone.'],
            ['Cover and recall', 'Cover the answers and ask the facts out of order.'],
            ['Story problems', 'Read the problems aloud. They go like this:\n~ %s\n~ %s\nThe book\'s answers sound like this: "You can buy as many as %d cents are contained times in ..."' % (s[0], s[1], k)],
            ['Wrap up', 'Your child writes three division facts and the times-table fact that goes with each.'],
        ],
        practice='Mix this table into the daily warm-up with the %d times table.' % k,
        answers=DIV_ANS.get(n),
        tip='There are two kinds of dividing: sharing ("12 shared among 3") and grouping ("how many 3s in 12"). The book uses both. Both have the same answer.' if k == 2 else None)
add(62, title='Review of division, and chains with dividing', mins=20,
    goal='Your child answers mixed division facts and works chains that end in dividing.',
    materials=[SLATE],
    book='A table of mixed facts to state ("2 is contained in 4 two times"), then chains such as "How many are 10 and 4, less 8, multiplied by 3, divided by 9?" (worked: 14, 6, 18, 2). The lesson runs onto a second page of "add, then divide" questions.',
    steps=[
        ['Mixed table', 'Work through the table in rounds of ten. Put slow facts on cards.'],
        ['Chains', 'Work the example aloud: 10 and 4 are 14; 14 less 8 are 6; 6 times 3 is 18; 18 divided by 9 is 2.'],
        ['Second page', 'Do the "add, then divide" questions on the next page (use the arrow in the book viewer). Some of them leave a remainder; just say what is left over, or skip them.'],
    ],
    practice='Spread over two days.')
add(63, title='Finding the price of one', mins=15,
    goal='Your child finds the cost of one item from the cost of several, then the cost of a different number.',
    materials=['Some coins, real or pretend', SLATE],
    book='Problems such as "If 4 pens cost 8 cents, how much will one pen cost? If one pen cost 2 cents, how much will 6 pens cost?" and "If 4 dozen eggs cost 20 cents, what will 6 dozen cost?", and making change.',
    steps=[
        ['Two steps', 'For the eggs: first find one dozen (20 divided by 4 is 5 cents), then 6 dozen (6 times 5 is 30 cents).'],
        ['Play shop', 'Set up a shop with prices like "3 apples for 9 cents". Your child works out the price of one, then of 5.'],
        ['Book problems', 'Work through the page.'],
    ],
    answers='1. 2 cents; 12 cents. 2. 4 cents; 36 cents. 3. 30 cents. 4. 30 cents. 5. 40 cents. 6. 49 cents. 7. 9 cents. 8. 12 pears. 9. 4 lemons. 10. 8 cents. 11. 3 cents.',
    practice='Unit 6 is done. Read real price labels at the shop together.')

# ---------------- Unit 7: signs, bigger numbers, mixed problems ----------------
add(64, title='The signs + − × ÷ =', mins=15,
    goal='Your child reads and writes the four signs and the equals sign, and adds to numbers in the teens.',
    materials=[SLATE],
    book='The signs explained: + is read "plus", − "minus", × "multiplied by", ÷ "divided by", = "equals". Then additions such as "11 + 1" (worked: 11 plus 1 equals 12) and others with 11 to 15.',
    steps=[
        ['Meet the signs', 'Write each sign and its name. Your child copies them. Point out that "−" is the "less" your child already knows, and "×" is "times".'],
        ['Rewrite old facts', 'Write facts your child knows in words, such as "5 and 3 are 8", and have your child rewrite them with signs: 5 + 3 = 8.'],
        ['Book questions', 'Read and answer the questions on the page, saying "plus" and "equals".'],
    ],
    practice='Write three number sentences with signs each day.',
    tip='Children sometimes think "=" means "here comes the answer". Show that 8 = 5 + 3 is also true: both sides are the same amount.')
add(65, title='Adding past 20', mins=15,
    goal='Your child adds a small number to a two-digit number, such as 24 + 2 or 30 + 4.',
    materials=['Bundles or cups of ten and single beans', SLATE],
    book='Rows of questions such as "How many are 16 + 1? 2 + 16? 16 + 3?" and "How many are 20 + 2? 4 + 30? 40 + 6?"',
    steps=[
        ['Use what you know', 'Show that 6 + 2 = 8, so 16 + 2 = 18, 26 + 2 = 28, 36 + 2 = 38. The ones work the same way in every ten.'],
        ['Build one', 'Make 24 with 2 tens and 4 ones. Add 2 ones: 26.'],
        ['Book rows', 'Work along the rows on the page, a row at a time.'],
    ],
    practice='A row a day until it is easy.')
add(66, title='Adding past a ten', mins=15,
    goal='Your child adds across a ten, such as 29 + 2 or 47 + 6.',
    materials=['Bundles or cups of ten and single beans', SLATE],
    book='Harder rows of questions such as "How many are 29 + 2? 4 + 39? 49 + 6?"',
    steps=[
        ['Make the ten', 'For 29 + 2: 29 needs 1 more to make 30, then 1 more is 31. Show it with a bundle: the loose ones make a new ten.'],
        ['Use the 9 + 2 fact', 'Since 9 + 2 = 11, 29 + 2 is one more ten: 31. Look for this pattern in each row.'],
        ['Book rows', 'Work along the rows on the page.'],
    ],
    practice='A row a day for a week.')
add(67, title='Story problems with bigger numbers: adding', mins=15,
    goal='Your child solves addition stories with numbers up to about 50.',
    materials=[SLATE],
    book='Fifteen problems such as "I had 15 cents, and Charles gave me 5 more: how many cents had I then?" and "Edwin has 8 oranges more than Anna, and Anna has 19: how many has Edwin?"',
    steps=[
        ['"More than" stories', 'Edwin has 8 more than Anna. Act it out: line up Anna\'s 19, then make Edwin\'s line 8 longer.'],
        ['Work through the page', 'Your child answers each problem in a full sentence.'],
    ],
    practice='Make up two stories with family ages or prices.')
add(68, title='Story problems with bigger numbers: taking away', mins=15,
    goal='Your child solves subtraction stories with numbers up to about 50, including "how many more?"',
    materials=[SLATE],
    book='Fourteen problems such as "Thomas had 15 marbles, and lost 4: how many has he left?" and "Henry had 10 cents, and his mother gave him enough to make 40: how much did she give?"',
    steps=[
        ['Count up', 'For Henry: from 10 to 40 is 3 tens, so 30 cents. Counting up is a good way to subtract.'],
        ['Work through the page', 'Your child answers each in a full sentence.'],
    ],
    practice='Ask "How many more until ...?" questions about real things: pages left in a book, days until a birthday.')
add(69, title='Add, add, then take away', mins=15,
    goal='Your child works a + b + c − d in their head.',
    materials=[SLATE],
    book='A drill such as "How many are 5 + 9 + 8 − 4?" (worked: 18).',
    steps=[
        ['One at a time', 'Say each running total aloud: 5 + 9 = 14, + 8 = 22, − 4 = 18.'],
        ['Book drill', 'Work down the page in short rounds.'],
    ],
    practice='A few a day.')
add(70, title='Spending, change and ages', mins=15,
    goal='Your child solves stories about spending money and getting change, and about ages.',
    materials=['Coins, real or pretend', SLATE],
    book='Problems such as "Henry had 25 cents: he spent 4 cents for a top, and 6 cents for a kite: how many cents has he left?" and "Charles is 4 years old, and his father is 32 years old: in how many years will Charles be as old as his father is now?"',
    steps=[
        ['Play shop with change', 'Your child has 25 cents and buys two things. How much is left? Count the change back.'],
        ['Ages', 'Talk through Charles and his father: from 4 to 32 is 28 years.'],
        ['Work through the page', 'Do the rest of the problems.'],
    ],
    answers='1. 14 cents. 2. 15 cents. 3. 10 cents. 4. Gave away 10, had 12 left. 5. 30 cents. 6. 5 cents. 7. 12 cents. 8. 28 years. 9. 65 cents more. 10. 4 cents. 11. Paid 40 cents, had 10 cents left.',
    practice='Let your child handle the change on a real small purchase.')
add(71, title='Multiply, then subtract', mins=15,
    goal='Your child multiplies, then subtracts, such as 3 × 4 − 5.',
    materials=[SLATE],
    book='Questions such as "How many are 3 × 4 − 5?" (worked: 3 multiplied by 4 equals 12, and 12 minus 5 equals 7), later with an added step.',
    steps=[
        ['Order matters', 'Explain that the book always multiplies first here: 3 × 4 = 12, then 12 − 5 = 7.'],
        ['Book questions', 'Work down the page.'],
    ],
    practice='A few a day.')
add(72, title='How many times? (up to 32)', mins=15,
    goal='Your child says how many times one number goes into another, such as "Eighteen are how many times 3?"',
    materials=[COUNTERS],
    book='Questions such as "Four are how many times 2?" (worked: 4 are 2 times 2) and "Eighteen are how many times 2? How many times 3? 6? 9?"',
    steps=[
        ['One number, many ways', 'Lay out 18 beans. Group them in 2s, then 3s, then 6s, then 9s. Count the groups each time: 9, 6, 3, 2.'],
        ['Book questions', 'Work down the page, using the times tables instead of beans where you can.'],
    ],
    practice='Ask about 12, 24 and 36: how many ways can each be grouped?')
add(73, title='How many times? (up to 100)', mins=15,
    goal='Your child does the same with numbers up to 100.',
    materials=[SLATE],
    book='Questions such as "Thirty-five are how many times 5? How many times 7?" up to "Ninety are how many times 9? How many times 10?"',
    steps=[
        ['Use the tables', 'Thirty-five: 7 times 5, and 5 times 7. Every answer comes from a times-table fact.'],
        ['Book questions', 'Work down the page.'],
    ],
    practice='Keep the slow facts on cards.')
add(74, title='Mixed story problems', mins=20,
    goal='Your child chooses the operations for each story, including two-step ones.',
    materials=[SLATE],
    book='Twelve mixed problems, such as "George bought 2 peaches, at 3 cents each, and 2 oranges, at 5 cents each: how many cents did he pay for all?" and "If a man can travel 90 miles in 9 hours, how many miles can he travel in 1 hour?"',
    steps=[
        ['Plan before solving', 'For each problem, ask: What do we know? What are we finding? What do we do first?'],
        ['Work through the page', 'Spread the problems over two days if needed.'],
    ],
    answers='1. 16 cents. 2. 12; 16 together. 3. Jane 14; 20 years together. 4. 3, 5, 7, 8. 5. 5 lemons. 6. 15 men. 7. 10 miles; 2 hours. 8. 37 cents. 9. 36 days. 10. 6, 8, 10. 11. 34 cents. 12. 56 dollars.',
    practice='Ask your child to write one story problem of their own for you to solve.')
add(75, title='Buying, selling and paying in goods', mins=20,
    goal='Your child works out gain, and what is still owed when part is paid in goods.',
    materials=['Coins and small items to "sell"', SLATE],
    book='Problems such as "A drover bought 10 sheep, at 3 dollars a head, and sold them for 5 dollars a head: how much did he gain?"',
    steps=[
        ['What is gain?', 'Explain gain (profit): sold for more than you paid. Gain = selling price less cost.'],
        ['Play it', 'Your child "buys" 3 toys at 2 cents and sells them at 5 cents. How much gain?'],
        ['Work through the page', 'Do the problems.'],
    ],
    answers='1. Charles 4, Henry 16. 2. 3 cents. 3. 23 cents. 4. 10 cents. 5. 9 cents; 3 cents each. 6. 6 cents. 7. 7 flags, 49 cents. 8. 45 cents. 9. 35 cents. 10. 50 cents. 11. 10 cents. 12. 48 cents. 13. 20 dollars.',
    practice='Talk about how a lemonade stand makes (or doesn\'t make) a gain.')
add(76, title='Trading: paying with something else', mins=15,
    goal='Your child works out how many of one thing pay for another (barter).',
    materials=['Coins and small items', SLATE],
    book='Problems such as "James bought 3 lemons, at 2 cents each, and paid for them with oranges, at 3 cents each: how many oranges did it take?"',
    steps=[
        ['Two steps', 'First find the cost (3 lemons at 2 cents = 6 cents), then how many oranges make 6 cents (6 ÷ 3 = 2).'],
        ['Trade game', 'Price some toys and let your child pay for one with others.'],
        ['Work through the page', 'Do the problems.'],
    ],
    answers='1. 2 oranges. 2. 12 cents; 6 coins. 3. 4. 4. 6. 5. 2 quarts. 6. 6 barrels. 7. 5 quarts. 8. 8 barrels. 9. 4. 10. 5. 11. 5 pears.',
    practice='Talk about trading before money: why was money invented?')
add(77, title='Trading, work and "if this, then that"', mins=20,
    goal='Your child solves problems where more workers take less time, and "if 7 cost this, what do 5 cost".',
    materials=[SLATE],
    book='Problems such as "If 4 men can mow a field in 5 days, in how many days can 10 men mow it?" and "If 7 barrels of flour cost 84 dollars, what will 5 barrels cost?"',
    steps=[
        ['Work problems', '4 men take 5 days, so the field is 20 "man-days" of work. 10 men do it in 20 ÷ 10 = 2 days. Act it out with toy figures.'],
        ['Go through one', 'For the flour: 1 barrel costs 84 ÷ 7 = 12 dollars, so 5 cost 60 dollars.'],
        ['Work through the page', 'Do the problems, over two days if needed.'],
    ],
    answers='7. 2 days. 12. 12 days. 13. 60 dollars. 14. 12 trees in each row. (Work the others together; the scan is hard to read in places.)',
    practice='These are the hardest problems in the book. It is fine to come back to them later.')
add(78, title='Counting by 2s to 9s, forward and back', mins=10,
    goal='Your child counts forward and back by any number from 2 to 9.',
    materials=['A hundred chart (optional; easy to draw)'],
    book='Exercises such as "Begin with 2, and add by 2\'s to 100", "Begin with 100, and subtract by 3\'s to 1" and "Begin with 100, and subtract by 7\'s to 2."',
    steps=[
        ['Use a hundred chart', 'Color the numbers you land on counting by 3s. Look at the pattern.'],
        ['Forward and back', 'Do the exercises on the page, a few each day. Counting back by 7s is hard; take your time.'],
    ],
    practice='Unit 7 is done.')

# ---------------- Unit 8: money and measures ----------------
add(79, title='United States money', mins=15,
    goal='Your child knows that 10 cents make a dime and 10 dimes make a dollar, and changes one into the other.',
    materials=['Real pennies, dimes and a dollar bill if you have them', SLATE],
    book='The table: 10 cents make 1 dime; 10 dimes make 1 dollar; 10 dollars make 1 eagle. Then problems such as "How many cents in 3 dimes?" (worked: 30 cents) and "How many dimes in 60 cents?" (worked: 6).',
    steps=[
        ['Real coins', 'Trade 10 pennies for a dime. Then count dimes to a dollar.'],
        ['The eagle', 'An "eagle" was a ten-dollar gold coin. It is no longer made, but it is a fun piece of history.'],
        ['Book problems', 'Work through the page.'],
        ['Today\'s coins', 'Add what the book leaves out: nickels (5 cents) and quarters (25 cents).'],
    ],
    answers='1. 30 cents. 2. 30; 70. 3. 6 dimes. 4. 60, 80, 40. 5. 4, 6, 9. 6. 10; 80. 7. 3 dimes. 8. 4 dimes. 9. 5 dollars. 10. 90 cents; 9 dimes.',
    practice='Let your child count the coins in a jar.')
add(80, title='English money (history)', mins=10, optional=True,
    goal='Optional. Your child learns how old English money worked, a good link to stories and history.',
    materials=[SLATE],
    book='The table: 4 farthings make 1 penny; 12 pence make 1 shilling; 20 shillings make 1 pound. Then problems on changing one to another.',
    steps=[
        ['Why learn it?', 'Britain used pounds, shillings and pence until 1971. Characters in Dickens, Austen and many children\'s books pay in shillings and pence.'],
        ['The table', 'Read the table together. How many pence in a pound? (12 × 20 = 240.)'],
        ['A few problems', 'Do as many problems on the page as your child enjoys.'],
    ],
    practice='Optional. Skip if your child isn\'t interested.')
add(81, title='Troy weight (gold and silver)', mins=10, optional=True,
    goal='Optional. Your child meets the weights still used for gold and silver.',
    materials=[SLATE],
    book='The table: 24 grains make 1 pennyweight; 20 pennyweights make 1 ounce; 12 ounces make 1 pound. Then problems about gold and silver.',
    steps=[
        ['Still used', 'Gold and silver are still priced by the troy ounce today.'],
        ['The table', 'Read the table. Do a few of the easy problems: ounces in 5 pounds; pounds in 96 ounces.'],
    ],
    practice='Optional.')
add(82, title='Pounds and ounces', mins=15,
    goal='Your child knows that 16 ounces make a pound and 2,000 pounds make a ton.',
    materials=['A kitchen scale and some food packages', SLATE],
    book='Avoirdupois weight, the everyday kind: 16 ounces make 1 pound; 100 pounds make 1 hundredweight; 2,000 pounds make 1 ton. Then problems about rice, sugar, hay and fish.',
    steps=[
        ['Weigh things', 'Read the weights on food packages. Find one that weighs a pound, and one that weighs about 8 ounces.'],
        ['The table', 'Read the table. The hundredweight is rarely used now; pounds and tons are.'],
        ['Book problems', 'Do the problems: 2 pounds is 32 ounces, 64 ounces is 4 pounds.'],
    ],
    practice='Guess and then weigh things in the kitchen.')
add(83, title='Dry measure: quarts, pecks and bushels', mins=15,
    goal='Your child knows the dry measures and changes between them.',
    materials=['A quart container if you have one', SLATE],
    book='The table: 2 pints make 1 quart; 8 quarts make 1 peck; 4 pecks make 1 bushel. Then problems about meal, apples, oats and berries.',
    steps=[
        ['Where you see it', 'Pecks and bushels still show up at orchards and farm stands, and in the Bible ("hide your light under a bushel").'],
        ['The table', 'Read it. How many quarts in a bushel? (8 × 4 = 32.)'],
        ['Book problems', 'Work through the page.'],
    ],
    answers='7. 28 cents. 8. 1 cent. 9. 3 pecks. 10. 16 quarts. 11. He got 12 dollars and made 6 dollars. 12. 2 pecks; 70 cents. 13. 7 bushels.',
    practice='Buy a peck of apples and count how many quarts it fills.')
add(84, title='Liquid measure: pints, quarts and gallons', mins=15,
    goal='Your child knows how pints, quarts and gallons relate.',
    materials=['A pint glass, a quart jar and a gallon jug, or any measuring cups', 'Water', SLATE],
    book='The table: 4 gills make 1 pint; 2 pints make 1 quart; 4 quarts make 1 gallon. Then problems about oil, milk, molasses and syrup.',
    steps=[
        ['Pour it', 'Fill a quart with two pints of water, then a gallon with four quarts. This is the best part of the lesson.'],
        ['The table', 'Read it. Gills are no longer used; the rest are on every milk jug.'],
        ['Book problems', 'Work through the page.'],
    ],
    answers='1. 16, 24, 32 gills. 3. 12, 16, 20 pints. 5. 20, 28, 36 quarts. 6. 4, 6, 8 gallons. 7. 40 cents. 8. 3 cents. 9. 10 cents. 10. 64 cents. 11. 6 gallons. 12. 8 dollars. 13. 10 cents a gallon. 14. 15 quarts. 15. 40 pints.',
    practice='Let your child do the measuring next time you cook.')
add(85, title='Long measure: inches, feet, yards and miles', mins=15,
    goal='Your child knows inches, feet, yards and miles, and measures real things.',
    materials=['A ruler, a yardstick or tape measure', SLATE],
    book='The table: 12 inches make 1 foot; 3 feet make 1 yard; 5½ yards make 1 rod; 320 rods make 1 mile. Then problems about desks, sidewalks, cloth, bricks and stairs.',
    steps=[
        ['Measure the room', 'Measure a table, a door and your child\'s height in inches, then in feet.'],
        ['The table', 'Read it. The rod is old; the rest are still used. A mile is 5,280 feet.'],
        ['Book problems', 'Work through the page.'],
    ],
    answers='1. 36, 60, 84 inches. 2. 2, 4, 8 feet. 3. 12, 24, 30 feet. 4. 3, 5, 9 yards. 5. 640, 960 rods. 6. 12 inches. 7. 18 yards. 8. 60 feet. 9. 2 yards. 10. 5 feet. 11. 9 bricks. 12. 8 feet. 13. 3 miles.',
    practice='Pace out a yard, then a room, then a walk.')
add(86, title='Square measure: area', mins=20,
    goal='Your child finds the area of a rectangle by multiplying length and width.',
    materials=['Square tiles or paper squares', 'A tape measure', SLATE],
    book='The table of square measure (square inches, feet, yards, rods, acres, square miles), then problems such as "How many sq. ft. in a blackboard 9 feet long and 3 feet wide?"',
    steps=[
        ['Cover it with squares', 'Lay paper squares over a book cover: 4 rows of 6 squares make 24 squares. That is the area.'],
        ['Multiply instead', 'Show that length × width gives the same number without counting.'],
        ['Book problems', 'Do the problems you find easy; the acre and square-mile ones can wait.'],
    ],
    answers='5. 27 sq. ft. 6. 20 sq. yd. 7. 9 sq. yd. 8. 20 yards. 9. 42 cents. 10. 5 sq. ft. 11. 36 sq. ft. 12. 32 sq. ft. 13. 2 sq. mi.',
    practice='Find the area of a rug or a room in square feet.')
add(87, title='Time, and other tables', mins=15,
    goal='Your child knows the table of time and the number of days in each month.',
    materials=['A calendar and a clock'],
    book='Tables only, no problems: apothecaries\' weight, cubic measure (with a note that a pile of wood 8 feet long, 4 wide and 4 high is a cord), time, and the days in each month.',
    steps=[
        ['Time', 'Read the time table: 60 seconds, 60 minutes, 24 hours, 7 days. Use a real clock.'],
        ['The months', 'Learn the days in each month. You can teach the rhyme "Thirty days hath September", or count on your knuckles.'],
        ['The rest', 'The apothecaries\' and cubic tables can be read once for interest and skipped.'],
    ],
    practice='Ask time questions through the week: how many minutes until lunch?')
add(88, title='Dozens, scores and other old measures', mins=10, optional=True,
    goal='Optional. Your child meets the dozen, gross and score, and other measures from old books.',
    materials=['An egg carton'],
    book='Tables only: circular measure (degrees), paper (quires and reams), how books are folded (folio, quarto, octavo), and miscellaneous tables such as 12 things make 1 dozen, 12 dozen make 1 gross, 20 things make 1 score, 6 feet make 1 fathom, 4 inches make 1 hand.',
    steps=[
        ['Useful ones', 'Dozen and gross are still used. A score is 20: "Four score and seven years ago" means 87.'],
        ['Fun ones', 'Horses are measured in hands; sea depth in fathoms. Look up how tall a horse is in hands.'],
    ],
    practice='Optional.')
add(89, title='Review of tables', mins=20,
    goal='Your child changes between units in all the tables.',
    materials=[SLATE],
    book='Twenty-nine questions that review every table, such as "How many cents in 5 dimes?", "How many feet tall is a horse 15 hands high?" and "How many sheets of paper in 2 quires? In 2 reams?"',
    steps=[
        ['Pick the useful ones', 'Do the questions on money, weight, liquid and dry measure, length and time. Skip English money, troy and apothecaries\' weight unless your child enjoyed them.'],
        ['Celebrate', 'This is the last lesson in the book. Your child has finished Ray\'s New Primary Arithmetic.'],
    ],
    answers='1. 50, 30, 70 cents. 9. 48, 64, 80 quarts. 10. 5, 7, 9 bushels. 11. 28, 24, 32 quarts. 12. 4, 5, 9 gallons. 13. 21, 30, 36 feet. 18. 48, 72 hours. 19. 2, 3 days. 23. 144 pens. 25. 5 feet. 29. 48 sheets; 960 sheets.',
    practice='Next: Ray\'s New Intellectual Arithmetic, which takes the same ideas much further.')

assert sorted(L) == list(range(1, 90)), [n for n in range(1, 90) if n not in L]
lessons = [L[n] for n in range(1, 90)]
for l in lessons:
    l['unit'] = next(u['id'] for u in UNITS if u['from'] <= l['num'] <= u['to'])
    for k in [k for k, v in list(l.items()) if v is None]: del l[k]
import yaml
BOOK = {'id': 'raysnewprimarya00raygoog', 'title': "Ray's New Primary Arithmetic", 'year': 1877, 'key': 'primary', 'short': 'Primary',
    'eyebrow': "Ray's Arithmetic · Book 1 · 1877",
    'hero': '89 short lessons, from counting to ten to money and measures, for children about 5 to 7. Each one has a guide you can follow step by step, with the right page of the book beside it.',
    'how': ['<b>A little, often.</b> About 15 minutes a day, three to five days a week. That covers the book in about a school year.',
            '<b>Repeat freely.</b> Most table lessons take two or three days before the facts come easily. Move on when they do, not before.',
            '<b>Real things first.</b> Have a cup of about 40 counters ready (dried beans, buttons or pennies), and a slate, small whiteboard or paper.',
            '<b>Out loud.</b> Ray\'s children said every answer in a full sentence: “3 and 2 are 5.” The guides keep that habit.',
            '<b>Skip what\'s history.</b> A few lessons near the end teach old measures (English money, troy weight). They\'re marked optional.']}
yaml.safe_dump({'book': BOOK, 'units': UNITS, 'lessons': lessons},
          open(sys.argv[1], 'w'), allow_unicode=True, sort_keys=False, width=1000)
print(len(lessons), 'lessons')
