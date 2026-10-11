# Builds data/rays_intellectual.yaml: teaching guides for the 80 lessons of Ray's New Intellectual Arithmetic (1877).
# Run: python3 scripts/build_rays_intellectual.py data/rays_intellectual.yaml
# Lesson facts (topics, page positions, kinds of problems) come from the Internet Archive scan raysnewintellect00rayjrich.
# The teaching steps and explanations are written for this site. Answers are included only where the scan could be read clearly;
# the full answers are in Ray's own Key (keytoraysnewarit00rayj). Step bodies: lines "Say: ..." are said aloud; "~ ..." are problems.
import sys, yaml

def roman(n):
    out = ''
    for v, s in [(50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v: out += s; n -= v
    return out

# page index of each lesson in the scan (BookReader "n" numbers)
IDX = [11, 13, 15, 16, 18, 22, 24, 25, 27, 29, 30, 32, 33, 36, 38, 41, 43, 45, 47, 50, 52, 53, 55, 56, 58, 59, 60, 61, 62, 63,
       64, 65, 67, 68, 70, 72, 74, 76, 77, 79, 80, 82, 83, 84, 87, 89, 95, 96, 98, 99, 100, 101, 103, 105, 106, 108, 111, 113, 114, 116,
       118, 119, 121, 124, 125, 126, 127, 128, 130, 131, 131, 132, 133, 134, 135, 135, 136, 137, 138, 139]
assert len(IDX) == 80

UNITS = [
    {'id': 1, 'name': 'Adding and subtracting in your head', 'from': 1, 'to': 11, 'text': 'Addition and subtraction to about 100, said aloud, with the reason for every answer.'},
    {'id': 2, 'name': 'Multiplying and dividing', 'from': 12, 'to': 19, 'text': 'The tables to 12 × 12, then reasoning problems: from one thing to many, and from many to one.'},
    {'id': 3, 'name': 'What fractions are', 'from': 20, 'to': 29, 'text': 'Halves, thirds and fourths of real things, writing fractions, and changing them from one form to another.'},
    {'id': 4, 'name': 'Working with fractions', 'from': 30, 'to': 44, 'text': 'Adding, subtracting, multiplying and dividing fractions, all in the head, with story problems.'},
    {'id': 5, 'name': 'Review', 'from': 45, 'to': 46, 'text': 'Two long mixed reviews before the book turns to measures and harder reasoning.'},
    {'id': 6, 'name': 'Money, weights and measures', 'from': 47, 'to': 54, 'text': 'The tables of money, measure, weight, length and time, and problems that use them.'},
    {'id': 7, 'name': 'Reasoning puzzles, ratio and proportion', 'from': 55, 'to': 63, 'text': 'Classic puzzles: parts of a number, ages, work done together, ratio, proportion and partnership.'},
    {'id': 8, 'name': 'Percentage and interest', 'from': 64, 'to': 79, 'text': 'Per cent, gain and loss, discounts, commission, insurance, and simple interest every way round.'},
    {'id': 9, 'name': 'Miscellaneous', 'from': 80, 'to': 80, 'text': 'The book ends with sixty-one mixed problems. Spread them over several weeks.'},
]

MAT = ['The book page (press “📖 Book page”, or use a printed copy)', 'Paper for jotting, though the work is meant to be done in the head']
L = {}
def add(n, title, goal, book, model, ex, answers=None, tip=None, warm=None, mins=20, extra=None, materials=None, optional=False):
    steps = [['Warm up', warm or 'Ask three or four problems from the last lesson again, out of order. Your child answers and says why.'],
             ['Show the reasoning', model],
             ['Work the problems aloud', 'Read each problem on the page aloud. Your child answers, then explains in a full sentence, the way the book\'s model solutions do. The problems go like this:\n' + '\n'.join('~ ' + e for e in ex)]]
    if extra: steps.append(extra)
    steps += [['Ask “Why?”', 'After each answer ask “Why?” or “How do you know?” Ray\'s wants the reasoning said aloud, not just the number. If your child stalls, go back to the model and say the first half of the explanation together.'],
              ['Wrap up', 'Pick the two problems that were hardest today. Tomorrow, start with those as the warm-up.']]
    L[n] = {'num': n, 'roman': roman(n), 'idx': IDX[n - 1], 'title': title, 'goal': goal, 'mins': mins, 'materials': materials or MAT,
            'book': book, 'steps': steps, 'practice': 'Do the rest of the lesson\'s problems over the next day or two, a few at a time. Move on when your child can explain them without help.'}
    if answers: L[n]['answers'] = answers
    if tip: L[n]['tip'] = tip
    if optional: L[n]['optional'] = True

# ---------- Unit 1 ----------
add(1, 'Adding small numbers, and saying why',
    'Your child adds small numbers in story problems and explains each answer: “Because 3 and 2 are 5.”',
    'Twenty-six short addition stories about apples, cents and marbles. The first answers are modelled as “Ans. 2. Why? Because 1 and 1 are 2.” The lesson ends with the definitions of addition, sum, + (plus) and = (equals).',
    'Read the first problem aloud and answer it the book\'s way.\nSay: James had 1 apple and his brother gave him 1 more. He had 2 apples. Why? Because 1 and 1 are 2.\nThis question-answer-reason pattern is the heart of the whole book. Practise it on the first three problems together.',
    ['James had 1 apple, and his brother gave him 1 more: how many did he then have?', 'Ida had 4 cents; her mother gave her 3 cents, then 1 cent more: how many had she?', 'A lady paid 1 dollar for gloves, 3 for a shawl and 3 for a dress: how much did she spend?'],
    answers='1) 2. 2) 3. 3) 4. 4) 5. 5) 4. 6) 5. 7) 6. 8) 6. 9) 6. 10) 7. 12) 8. 13) 8. 14) 9. 15) 8. 16) 10. 17) 10. 18) $9. 19) 10. 20) $7. 21) 11. 22) 10 lb. 23) 10. 24) 7. 25) 10. 26) 8.',
    tip='If your child has finished Ray\'s New Primary Arithmetic, the book says you may start at Lesson IV. Lessons I to III are still a gentle way to learn the “Why? Because…” habit.',
    warm='Ask a few facts to 10 aloud: 4 and 3, 5 and 5, 6 and 2.')
add(2, 'Adding drills and counting on',
    'Your child adds chains of small numbers aloud, counts on by 2s and 3s, and finds pairs that make 10 and 12.',
    'Quick drills (“One and one are two”; “Two and four are six; six and one are seven”), counting by 2s and 3s, then word problems. One model solution adds dozens of eggs: 8 dozen and 4 dozen are 12 dozen; 12 dozen and 3 dozen are 15 dozen.',
    'Show how to add a chain one step at a time.\nSay: Two and four are six; six and one are seven.\nYour child says every middle total aloud. Then show that dozens add like anything else: 8 dozen and 4 dozen are 12 dozen.',
    ['I have 8 dozen eggs in one basket, 4 dozen in another and 3 dozen in another: how many in all?', 'Oliver has 4 cents in one hand, 3 in the other and 4 in his pocket: how many cents has he?', 'A girl bought tape for 3 cents and pins for 5 cents and got 2 cents change: how much had she at first?'],
    answers='13) 11. 14) 11. 15) 15 dozen. 16) 10 cents. 17) 10. 19) 10 cents. 20) $11. 21) 11 cents. 22) 16 yd. 23) 18 cents. 25) 21.')
add(3, 'The addition table',
    'Your child knows the addition facts to 10 + 12 by heart.',
    'The addition table only, from 2 + 1 up to 10 + 12. There are no story problems.',
    'Read the table together, a column at a time. Then cover the answers and ask facts out of order.\nSay: Seven and nine are sixteen.\nKeep a list of any fact that takes more than a second; those become the warm-up for the next week.',
    ['7 and 9?', '8 and 12?', '6 and 7?'], mins=15,
    tip='Facts that cross ten (8 and 5, 7 and 6) are the usual trouble. Use ten as a stepping stone: 8 and 2 are 10, and 3 more is 13.')
add(4, 'Adding to two-digit numbers',
    'Your child adds a one-digit number to any two-digit number quickly, using what they know about the ones.',
    'Twenty-nine drills. The early ones review the facts to 12 + 12; the later ones add to numbers ending in 9, 8 and 7, such as “How many are 29 and 2? 49 and 2? 69 and 2?”',
    'Show the pattern.\nSay: 9 and 2 are 11, so 29 and 2 are 31, 49 and 2 are 51, 69 and 2 are 71.\nThe ones fact is the same each time; only the tens change.',
    ['Seven and 7 are how many? 7 and 12? 7 and 9?', 'How many are 29 and 2? 49 and 2? 69 and 2?', 'How many are 17 and 7? 27 and 7? 47 and 7?'],
    tip='The book notes that pupils who have done Ray\'s New Primary Arithmetic can begin here.')
add(5, 'Adding several numbers, and counting by any number',
    'Your child adds three or more numbers in a row and counts by 2s up to 9s to about 100.',
    'Fifty-three problems: chains such as “Three and 6 and 4 are how many?” (modelled as “Three and six are nine, and four are thirteen”), word problems, then counting by 2s through 9s.',
    'Say: Three and six are nine, and four are thirteen.\nThe trick is to carry the running total and add the next number to it, saying each total aloud.',
    ['Three and 6 and 4 are how many?', 'A man gave 13 dollars for a cart, 9 for a plow and 1 for a rake: how much did he spend?', 'Begin with 3, and count to ninety-nine by adding 3 each time.'],
    answers='1) 13. 2) 16. 3) 13. 26) 15 cents. 27) $15. 28) 23 books. 29) $23. 30) 26. 31) 28 cents. 32) $23. 33) 33 cents. 34) 41 hogs. 35) 32 cents. 36) 34 cents. 37) 26 years. 38) 22.')
add(6, 'Subtraction',
    'Your child subtracts small numbers in stories and drills, and knows the words minuend, subtrahend and difference.',
    'Twenty-five word problems and drills such as “Two from 6 leaves how many? From 7?”, answered as “Ans. 1. Why? Because 1 from 2 leaves 1.” Then the definitions: subtraction, minuend, subtrahend, difference, and the sign − (minus).',
    'Say: Joseph had 3 apples and lost 1. He had 2 left. Why? Because 1 from 3 leaves 2.\nPoint out that subtraction finds the difference between two numbers. The bigger one is the minuend, the one taken away the subtrahend.',
    ['Joseph had 3 apples and lost 1: how many had he left?', 'Three from 6 leaves how many? From 7? 8?', 'A load of corn sold for 17 dollars; the seller took a barrel of flour worth 6 dollars and the rest in money: how much money?'],
    answers='1) 1. 2) 2. 3) 3. 5) 2. 6) 3. 8) 2. 10) 5. 12) 5. 14) 5. 16) 5. 18) 5. 20) 4. 22) 12. 23) 4 years. 24) $11. 25) 8.')
add(7, 'The subtraction table',
    'Your child knows the subtraction facts from 2 − 2 up to 22 − 10.',
    'The subtraction table only. There are no story problems.',
    'Read the table together, then cover the answers and ask out of order.\nSay: Seven from sixteen leaves nine. How do I know? Because seven and nine are sixteen.\nEvery subtraction fact is an addition fact backwards.',
    ['7 from 16?', '9 from 15?', '6 from 13?'], mins=15)
add(8, 'Subtraction stories: how much more, how much gained',
    'Your child solves “how much more”, gain and loss, and missing-number problems by subtraction.',
    'Twenty-five problems on difference, gain and loss, with two model solutions, then abstract ones such as “The greater of two numbers is 12, and their difference is 5: what is the less?”',
    'Say: A man bought a horse for 19 dollars and sold it for 27. He gained 8 dollars, because 27 dollars less 19 dollars are 8 dollars.\nGain is always the selling price less the cost.',
    ['A boy paid 9 cents for a slate worth 7 cents: how much more did he pay than it was worth?', 'A man bought a horse for 19 dollars and sold it for 27: how much did he gain?', 'The greater of two numbers is 12, and their difference is 5: what is the less?'],
    answers='1) 2 cents. 2) $4. 3) 5 cents. 4) 9 cents. 5) 6 cents. 6) 4. 7) 6 miles. 9) 5. 10) $8. 11) $8. 14) 4 cents. 15) 20. 16) 50 barrels. 18) 24 years. 19) 35 cents. 20) 18. 21) 28. 22) 10. 23) 20. 24) 7. 25) 13.')
add(9, 'Review: adding and subtracting together',
    'Your child solves two-step stories that add and then subtract.',
    'Fourteen mixed problems, with model solutions such as: James gave away 2 marbles and 3 marbles, which are 5 marbles; then he had left 13 marbles less 5 marbles, which are 8 marbles.',
    'Say: First, how many did he give away? 2 and 3 are 5. Then, how many were left? 13 less 5 are 8.\nTeach your child to find the middle number first and say it aloud.',
    ['A merchant had 40 barrels of flour; he sold 9 to one man and 21 to another: how many had he left?', 'A man paid 30 dollars for a horse, spent 9 keeping him and sold him for 29: how much did he lose?', 'A man owes A 5 dollars, B 6 and C 10; he has 20 in cash and goods worth 10: what is he worth after paying?'],
    answers='1) 8. 2) 10. 3) 11 cents. 4) $10. 5) $9. 6) $11. 7) cost 53 cents, change 7 cents. 8) 11. 10) 16. 11) 4 sheep. 12) $7. 13) 15 cents. 14) $9.')
add(10, 'Chains with + and −',
    'Your child reads and works chains of plus and minus signs in their head.',
    'About twenty-seven chains, starting with the model “3 minus 2 plus 1 equals 2”, up to long ones like 9 − 7 + 8 − 5 + 6 − 3 + 4 − 2 + 1.',
    'Say: 3 minus 2 is 1; plus 1 is 2. So 3 − 2 + 1 = 2.\nGo left to right, saying each running total. Have your child point along the line with a finger.',
    ['8 − 4 + 6 − 5 = ?', '1 + 2 + 3 − 4 + 5 − 6 + 7 − 5 + 9 = ?', '9 − 7 + 8 − 5 + 6 − 3 + 4 − 2 + 1 = ?'], mins=15,
    tip='Write a chain on paper and cover all but the first two numbers, sliding the card along as you go.')
add(11, 'Mixed adding and subtracting stories',
    'Your child solves longer stories that mix adding and subtracting, including gain and loss.',
    'Twenty-one word problems, with a model for one that takes a difference from a sum: 19 and 10 are 29; 17 less 10 is 7; 29 less 7 is 22.',
    'Say: From the sum of 19 and 10, take the difference between 17 and 10. The sum is 29; the difference is 7; 29 less 7 is 22.\nFind each part first, then combine them.',
    ['From the sum of 19 and 10, take the difference between 17 and 10: what is left?', 'A jeweler bought a watch for $40, a chain for $15 and a key for $3, and sold them all for $63: what did he gain?', 'Two numbers differ by 17; the greater is 85: what is the less?'],
    answers='1) 9 cents. 2) 8 gallons. 3) 11. 4) 22. 5) $15. 6) $17. 7) 2 less. 8) $15. 9) 16. 10) $5. 11) 10 sheep. 12) $3. 14) 5. 15) 38. 16) $20. 17) $80. 18) 68. 19) $40. 20) 8 gallons. 21) 8 more.')

# ---------- Unit 2 ----------
add(12, 'Multiplying: the cost of several',
    'Your child finds the cost of several things from the cost of one, and explains with “times”.',
    'Twenty-two cost and “times” problems, answered like “Ans. 4 cents. Why? Because 2 times 2 are 4.”',
    'Say: At 3 cents apiece, 4 apples cost 4 times 3 cents, which are 12 cents.\nMultiplying is a quick way of adding the same number again and again.',
    ['At 3 cents apiece, what will 4 apples cost?', 'At 6 dollars a barrel, what will 4 barrels of flour cost?', 'If 1 marble is worth 7 apples, how many apples are 5 marbles worth?'],
    answers='1) 4 cents. 2) 6. 3) 8. 4) 9. 5) 12. 6) 15. 7) 16. 8) $20. 9) $24. 10) 25. 11) 30. 12) 36. 13) 14. 14) 21. 15) 28. 16) 35 apples. 17) 16 apples. 18) 24, 32 cents. 19) 40 apples. 20) 18, 27 cents. 21) 40 cents. 22) 33 cents.')
add(13, 'The multiplication table to 12 × 12',
    'Your child knows the times tables to 12 × 12 and the words multiplicand, multiplier and product.',
    'Definitions of multiplication, multiplicand, multiplier, product and the sign ×, then the full table from 1 × 1 to 12 × 12, then drills such as “4 times 7 are how many?”',
    'Read the definitions together. Then read one table a day, aloud, and drill it out of order.\nSay: 4 times 7 are 28.\nThe 11s and 12s are new if your child came from the Primary book, which stops at 10.',
    ['8 times 6? 6 times 9? 9 times 7?', '12 times 2? 2 times 10? 3 times 6?', '11 times 9? 10 times 10? 12 times 11?'],
    answers='1) 28. 2) 16, 35, 42. 3) 48, 54, 63. 4) 72, 49, 56. 5) 24, 20, 18. 6) 50, 44, 36. 7) 64, 66, 18. 8) 70, 48, 40. 9) 6, 8, 10. 10) 12, 14, 15. 11) 20, 36, 22. 12) 24, 25, 33. 13) 60, 72, 30.',
    tip='This lesson is really a week or more of work. Do one or two tables a day and keep the slow facts on cards.', mins=15)
add(14, 'Multiplying in stories',
    'Your child uses multiplication in stories about prices, distances, rows and work.',
    'Twenty-five problems with several model solutions, such as “7 oranges will cost 7 times 2 cents, which are 14 cents”, and a note that $6 is read “6 dollars”.',
    'Say: A man travels 7 miles an hour. In 8 hours he travels 8 times 7 miles, which are 56 miles.\nLook out for the one problem that goes the other way: if 2 men take 3 days, 1 man takes 2 times 3 days, which are 6 days.',
    ['On a chess-board are 8 rows of squares, and 8 squares in each row: how many squares?', 'If 2 men can do a piece of work in 3 days, in how many days can 1 man do it?', 'An orchard has 11 rows of trees with 7 trees in each row: how many trees?'],
    answers='1) 14 cents. 2) 21. 3) 30. 4) 56. 5) $48. 6) $27. 7) $28. 8) 80 cents. 9) $42. 10) $40. 11) 56 mi. 12) 64. 13) 77. 14) $54. 15) 72 cents. 16) 96 cents. 17) 18 mi. 18) 6 days. 19) 12. 20) 24. 21) 32 days. 22) $48. 23) 63 men. 24) 88 persons. 25) $56.')
add(15, 'Review: adding, subtracting and multiplying',
    'Your child solves mixed stories that need two or three operations.',
    'Thirty-eight mixed problems, such as two travellers going different speeds, and “What is 3 times the difference between 15 and the sum of 5 and 2?”',
    'Say: Two men travel the same way, one 5 miles an hour, the other 7. Each hour they get 2 miles further apart, so in 10 hours they are 10 times 2 miles, or 20 miles, apart.\nAsk first: what changes each hour? Then multiply.',
    ['Two men travel the same way, one 5 miles an hour, the other 7: how far apart in 10 hours?', 'What is 3 times the difference between 15 and the sum of 5 and 2?', 'A miller buys 10 bushels of wheat at $1, makes 2 barrels of flour and sells them at $7 a barrel: how much more did he get than he paid?'],
    answers='1) 15 cents. 2) 20 mi. 3) 144 mi. 4) spent $12, left $3. 5) 39 cents. 6) 4. 7) 56 shillings. 8) $38. 9) $56. 10) 36 dimes. 11) 120 horses. 12) 24. 13) 60. 14) 40. 15) 20 cents. 16) $1. 18) $8. 19) $10. 20) 21 mi. 21) 48 mi.')
add(16, 'Dividing: how many can you buy?',
    'Your child solves “how many can you buy” and sharing problems, and knows divisor, dividend and quotient.',
    'Twenty-six problems answered like “Ans. 4 cakes. Why? Because 1 is contained in 4, four times.” Then the definitions of division, divisor, dividend, quotient and the sign ÷.',
    'Say: At 3 cents each, for 9 cents I can buy as many pears as 3 cents are contained times in 9 cents, which are 3 times. So 3 pears.\n“Contained in” is the book\'s way of saying “goes into”.',
    ['At 3 cents each, how many pears can you buy for 9 cents?', 'A boy has 16 marbles and puts them in piles of 2: how many piles?', 'Four quarts make 1 gallon: how many gallons in 36 quarts?'],
    answers='1) 4. 2) 2. 3) 3. 4) 4. 5) 2. 6) 3. 7) 5. 8) 7. 9) 3. 10) 8. 11) 6. 12) 4. 13) 7 yd. 14) 11 yd. 16) 5. 17) 9 hr. 18) 7. 19) 10. 20) 8. 21) 7. 22) $6. 23) 9 gal. 24) 4 hr. 25) 7. 26) 5.')
add(17, 'The division table',
    'Your child knows the division facts up to 132 ÷ 12.',
    'The division table only, from 2 ÷ 2 to 132 ÷ 12.',
    'Read it as the multiplication table backwards.\nSay: 7 is contained in 56 eight times, because 8 times 7 are 56.\nDrill out of order, a table a day.',
    ['7 in 56?', '9 in 108?', '12 in 84?'], mins=15)
add(18, 'Sharing, rates and the cost of one',
    'Your child divides to find a share, a rate or the cost of one thing.',
    'Drills (“Two is contained in 12 how many times?”), then nineteen word problems. One model: a third of 12 is 4. Another: $5 is contained in $40 eight times, so 8 weeks.',
    'Say: If 12 peaches are shared equally among 3 children, each has one-third of 12 peaches, which is 4 peaches.\nThen the step backwards: if 6 men earn $84 in 7 days, the 6 men earn $12 a day, so each earns $2 a day.',
    ['If 12 peaches are divided equally among 3 children, how many will each have?', 'If 1 pipe empties a cistern in 63 hours, in how many hours will 9 such pipes empty it?', 'Six men earn $84 in 7 days: how much does each earn a day?'],
    answers='7) 4. 8) 6. 9) 10 cents. 10) 7 cents. 11) 8 weeks. 14) 6 days. 15) 8 days. 16) 7 hr. 18) $6. 19) 8 cents. 20) $9. 21) 12 trees. 22) $12 a week, $2 a day. 23) $2. 24) $12 per man, $4 a day. 25) 5 miles a day more.')
add(19, 'From one to many, and many to one',
    'Your child solves rate and work problems by first finding the value for one.',
    'Thirty-five mixed division problems on prices, rates and work, with short model solutions. Many are “find one, then scale up”.',
    'Say: If 9 men can finish a job in 2 days, 1 man would take 9 times 2, or 18 days. So to finish in 3 days you need as many men as 3 is contained in 18, which are 6 men.\nThis “go through one” idea is the key to the rest of the book.',
    ['Nine men can finish a job in 2 days: how many men are needed to finish it in 3 days?', 'One man goes 10 miles while another goes 7: when the first has gone 90 miles, how far has the second gone?', 'How many men can do in 5 days a piece of work which takes 3 men 10 days?'],
    answers='1) 6. 2) 8. 3) 6. 4) 4 oranges. 5) 12 revolutions. 6) 12 trees. 8) 7 barrels. 9) 20 hours. 10) 4. 11) 6. 12) 36. 14) 6 men. 15) 5. 16) 34 dimes. 17) 3. 18) 3 cents. 19) 9. 20) 18. 21) 10. 22) 30 apples. 23) 63 mi. 24) 40 cents. 25) 45 lessons. 26) $56. 27) 4. 28) 6 barrels. 29) 49. 30) 9 yd. 31) $21. 32) 11 lb. 33) 10 hr. 34) 6 men. 35) 12 men.',
    tip='If your child finds this hard, act out a work problem with toy figures: each figure does one “day of work”.')

# ---------- Unit 3 ----------
add(20, 'Halves, thirds and other parts of a whole',
    'Your child knows that a unit can be cut into equal parts and finds how many halves, thirds or ninths are in several units.',
    'Definitions with pictures in words: one-half, two-halves or the whole; thirds; fourths; up to ninths. Then problems such as how many halves in 2 to 10 apples. The model: 1 apple has 2 halves, so 2 apples have 4.',
    'Cut an apple (or a paper circle) into halves, then another into thirds.\nSay: One apple has 2 halves, so 3 apples have 3 times 2 halves, or 6 halves.',
    ['How many halves in 2 apples? In 5? In 10?', 'How many thirds in 3 units? How many fifths? Sevenths? Ninths?', 'In 11 apples, how many sixths, halves, fifths, ninths?'],
    materials=['An apple and a knife, or paper circles and scissors'] + MAT,
    answers='9) 9, 15, 21, 27. 10) 20, 40, 15. 11) 66, 22, 55, 99.')
add(21, 'Writing fractions',
    'Your child reads and writes fractions and knows numerator, denominator, proper and improper fractions and mixed numbers.',
    'Definitions: a fraction is one or more equal parts of a unit; the denominator (below) tells how many parts the unit is divided into; the numerator (above) tells how many are taken. Then proper and improper fractions and mixed numbers like 2½, with exercises in writing and reading fractions.',
    'Draw a bar cut into 5 equal parts and shade 3.\nSay: The 5 below says how many parts the whole is cut into: fifths. The 3 above says how many we take. Three-fifths.\nThen show that 7/5 is more than one whole: one whole and two-fifths, 1⅖.',
    ['Write two-thirds, four-fifths, seven-tenths.', 'Read 3/8, 11/12, 9/4.', 'Which are proper fractions and which improper: 5/6, 9/7, 4/4?'], mins=15,
    materials=['Paper strips or squared paper', 'Pencils'])
add(22, 'A fraction of a number',
    'Your child finds a fraction of a number by finding one part first, and goes from many to one to some.',
    'About twenty-three problems. Model solutions: a third of 9 is 3, so two-thirds of 9 are 2 times 3, or 6; and if 3 oranges are worth 15 cents, 1 is worth a third of 15, or 5 cents, so 2 are worth 10 cents.',
    'Say: To find two-thirds of 9, first find one-third: 9 divided into 3 equal parts is 3. Two-thirds are 2 times 3, which are 6.\nAlways find one part first.',
    ['If a yard of tape is worth 2 cents, what is half a yard worth?', 'What are two-thirds of 9?', 'If 5 barrels of flour sell for $30, what would 3 barrels sell for?'],
    answers='1) 1 cent. 3) $4. 8) 6. 17) 2 cents. 18) $3. 19) 10 cents. 20) $18. 21) 50 cents.')
add(23, 'What part of one number is another?',
    'Your child says what fraction one number is of another, such as “5 is five-sevenths of 7”.',
    'Twenty-four problems: what part of an apple 1 cent buys at 2 cents, what part of a yard $2 buys at $3, and “What part of 7 is 5?” (modelled as 5 times one-seventh of 7, or five-sevenths).',
    'Say: 1 is one-seventh of 7, so 5 is five-sevenths of 7.\nIn stories: at $3 a yard, $1 buys one-third of a yard, so $2 buys two-thirds of a yard.',
    ['At $3 a yard, what part of a yard will $2 buy?', 'When clover seed is $8 a bushel, what part of a bushel can be bought for $5?', 'What part of 7 is 5?'],
    answers='1) ½. 2) ⅔ yard. 9) ⅝ bushel. 10) 5/7.')
add(24, 'Finding the whole from a part',
    'Your child finds the whole when a fraction of it is known.',
    'Twenty-five problems such as “If two-thirds of a lemon is worth 6 cents, what is a lemon worth?” The model: one-third is worth 3 cents, so the whole, three-thirds, is worth 9 cents.',
    'Say: Two-thirds are worth 6 cents, so one-third is worth half of 6 cents, or 3 cents. The whole lemon is three-thirds, 3 times 3 cents, or 9 cents.\nDivide to get one part, then multiply to get the whole.',
    ['If two-thirds of a lemon is worth 6 cents, what is a lemon worth?', '6 is two-sevenths of what number?', 'A fraction of 18 is a fraction of what number? (fractions given in the book)'],
    answers='1) 2 cents. 3) 9 cents. 8) 21. 17) 9 cents. 19) 25.')
add(25, 'Dividing with a fraction in the answer',
    'Your child shares things that do not divide evenly and gives the answer as a mixed number.',
    'Twenty-nine problems such as sharing 3 apples between 2 boys (each gets 3/2, or 1½), and “At 4 cents a yard, how much braid for 13 cents?”',
    'Say: Each boy gets half of 3 apples, which is three-halves, or 1½ apples.\nShare real things: 3 crackers between 2 people, 4 between 3.',
    ['A grocer gave 4 oranges to 3 boys to share equally: what was each one\'s share?', 'Harriet spent 13 cents for braid at 4 cents a yard: how many yards did she buy?', 'When milk is 5 cents a pint, how many pints can you get for 17 cents?'],
    answers='1) 1½. 2) 1⅓ oranges. 3) 2½ cents. 4) $1⅔. 5) 1¼ cents. 13) 2½ apples. 14) 2⅓ yd. 15) 3¼ yd. 16) 3⅖ pt. 17) 3⅚ bbl. 18) 3 4/7 yd. 19) 6½.',
    materials=['Some crackers or paper strips to share'] + MAT)
add(26, 'Mixed numbers into improper fractions',
    'Your child changes a mixed number such as 3½ into halves, thirds or other parts.',
    'Twelve problems of the form “How many halves in 3½? 4½?”. The model: in 1 there are 2 halves, so in 3 there are 6 halves, and with the other half, 7 halves.',
    'Say: In 1 there are 2 halves, so in 3 there are 3 times 2, or 6 halves. And one more half makes 7 halves. So 3½ is 7/2.',
    ['How many halves in 3½? 4½? 5½? 6½?', 'How many fourths in 3¾? 4¾? 5¾?', 'How many eighths in 2⅜?'],
    answers='2) 7, 9, 11, 13. 4) 15, 19, 23.')
add(27, 'Lowest terms',
    'Your child reduces a fraction to its lowest terms by dividing both numbers.',
    'About fourteen problems. A note says a fraction is in its lowest terms when no number greater than 1 divides both terms. The model divides both terms by 2, then by 2 again.',
    'Draw 6/8 on a bar, then show the same amount as 3/4.\nSay: Divide both terms by 2: 6/8 is 3/4. No number but 1 divides 3 and 4, so 3/4 is in lowest terms.',
    ['Reduce 6/8 to its lowest terms.', 'Reduce 10/18.', 'Reduce 12/16, dividing by 2 and then by 2 again.'], mins=15,
    answers='Only one answer could be read clearly in the scan: 10/18 is 5/9. See the Key for the rest.')
add(28, 'Changing a fraction to a new denominator',
    'Your child changes fractions to equal fractions with more parts, such as halves to fourths or sixths.',
    'Twenty-three problems changing halves, thirds and others to fourths, sixths, eighths and up. The model: in 1 there are 4 fourths, so in ½ there are 2 fourths.',
    'Say: In 1 there are 4 fourths, so in one-half there are half of 4, or 2 fourths. One-half is two-fourths.\nShow it by folding a paper strip.',
    ['Change ½ to fourths, sixths, eighths.', 'Change ⅔ to sixths, ninths, twelfths.', 'Change ¾ to eighths and twelfths.'], mins=15,
    materials=['Paper strips for folding'] + MAT)
add(29, 'Common denominators',
    'Your child gives two or more fractions the same denominator, using the least one where possible.',
    'Fifteen or more problems. The note: a common denominator can be found by multiplying the denominators; the least common denominator is the least number all of them go into. Model: ⅓ and ¾ become 4/12 and 9/12.',
    'Say: Thirds and fourths both go into twelfths. One-third is 4 twelfths; three-fourths are 9 twelfths.\nFind the smallest number both denominators go into: count up by the bigger one until the smaller one fits.',
    ['Reduce ⅓ and ¾ to a common denominator.', 'Reduce ⅔ and ⅞ to a common denominator.', 'Reduce ½, ⅓ and ¼ to their least common denominator.'],
    answers='1) 4/12 and 9/12. 2) 16/24 and 21/24.')

# ---------- Unit 4 ----------
add(30, 'Adding fractions',
    'Your child adds fractions and mixed numbers by changing them to a common denominator first.',
    'Word problems (a knife and a ball, parts of an orange, acres of corn and oats) and then abstract sums and mixed numbers, with a model solution.',
    'Say: One-third and one-fourth: change both to twelfths. 4 twelfths and 3 twelfths are 7 twelfths.\nFor mixed numbers, add the whole numbers and the fractions separately, then put them together.',
    ['Mary, Jane and William each get part of an orange: how much in all?', 'Thomas pays part of a dollar for a knife and part for a ball: how much did he spend?', 'Add 2½ and 3⅓.'],
    tip='The fractions in this part of the scan are hard to read on screen, so check them in the book and use the Key for answers.')
add(31, 'Subtracting fractions',
    'Your child subtracts fractions and mixed numbers, borrowing a 1 when needed.',
    'Fifteen problems: “how much more did one receive” stories, “take a from b”, and mixed numbers such as “Take 3¾ from 7⅝”, with a model showing how to borrow 1 from the whole number.',
    'Say: Take 3¾ from 7⅝. Change to eighths: 3 6/8 from 7 5/8. 6 eighths can\'t come from 5 eighths, so borrow 1 from the 7: 6 13/8. Now 13 less 6 is 7 eighths, and 6 less 3 is 3. The answer is 3⅞.',
    ['One boy got ¾ of an orange and another ½: how much more did the first get?', 'Take ⅓ from ⅚.', 'Take 3¾ from 7⅝.'],
    answers='15) 3⅞.')
add(32, 'Adding and subtracting together: what is left?',
    'Your child adds the parts used up, then subtracts from the whole to find what is left.',
    'Sixteen problems: parts of a field in different crops, a book read over four days, a pole partly in earth, water and air, and money spent and lost. The model adds the parts given away, then takes the sum from the whole.',
    'Say: If a boy gives away ¼ and then ⅓ of his pecans, he gives away 3/12 and 4/12, which are 7/12. He has 12/12 less 7/12, or 5/12, left.\nThe whole is always “1”, or as many parts as the denominator.',
    ['A boy gave away ¼ of his pecans and then ⅓: what part had he left?', 'A pole is ¼ in the earth and ⅓ in the water: what part is in the air?', 'A man spent and lost parts of his money and had $8 left: how much had he at first?'],
    tip='Use the Key for answers; the fractions in this part of the scan are hard to read on screen.')
add(33, 'Multiplying a fraction by a whole number',
    'Your child multiplies a fraction by a whole number and changes the answer to a mixed number.',
    'Eighteen problems on oats for horses, pineapple and chestnuts, then “What are 6 times ¾?” and so on. The model: 3 times ½ an orange is 3/2, or 1½ oranges.',
    'Say: 3 times one-half is three-halves, which is 1½.\nOnly the numerator is multiplied: 4 times 2/3 is 8/3, or 2⅔.',
    ['If a horse eats ½ a peck of oats a day, how much in 3 days?', 'What are 6 times ¾?', 'What are 7 times 2/5?'],
    answers='1) 1½ oranges.')
add(34, 'Rates with fractional answers',
    'Your child solves price and work problems where the answer comes out as a fraction.',
    'Thirty-two problems. Models: if 3 bushels cost $1, 1 bushel costs $⅓ and 2 cost $⅔; and 4 men for 8 days is 32 days for 1 man, so 5 men take a fifth of 32 days.',
    'Say: If 3 barrels of cider cost $8, 1 barrel costs one-third of $8, which is $2⅔, and 2 barrels cost twice that, $5⅓.\nIt\'s the same “through one” reasoning as before, but now the one is a fraction.',
    ['If 3 barrels of cider cost $8, what will 2 barrels cost?', 'If 1 barrel of flour feeds 8 persons 20 days, how long will it last 11 persons?', 'If 18 bushels of oats last 5 horses a week, how many will 7 horses need?'],
    answers='1) $⅔. 2) $1⅓. 3) $5⅓. 4) $4½. 5) 1⅗ cents. 6) 4⅔ cents. 7) 14⅖ cents. 8) 22½ cents. 18) 6⅖ days. 19) 14 6/11 days. 20) 4⅜ days. 21) 3 3/7 days. 22) 8⅘ days. 23) 50⅞ cents. 24) 11⅓ min. 25) 25⅕ bu. 26) 7 6/7 bu. 27) $14⅖.')
add(35, 'Multiplying mixed numbers',
    'Your child multiplies a mixed number by a whole number by doing the whole part and the fraction part separately.',
    'About forty-eight problems. The model: 12 times 3¾ is 12 times 3, which is 36, and 12 times ¾, which is 9, so 45.',
    'Say: 12 times 3 is 36; 12 times three-fourths is 9; 36 and 9 are 45.\nSplitting a mixed number into its whole and its fraction makes it easy to do in the head.',
    ['If 1 bushel of wheat costs $1½, what will 2 bushels cost?', 'What are 12 times 3¾?', 'What are 8 times 2⅝?'],
    answers='1) 3 oranges. 15) 45.')
add(36, 'Paying with something else (barter)',
    'Your child solves trading problems with fractions and does “how many times” drills.',
    'Twenty-three problems. Models: 5 boxes of raisins at $4 come to $24, which pays for 4 barrels of flour at $6; and cloth worth $14 pays for 2 hundredweight of cheese at $7.',
    'Say: First find what the first goods are worth: 5 boxes at $4 are $24. Then see how many of the second thing that buys: $6 is contained in $24 four times. So 4 barrels.',
    ['How many barrels of flour at $6 will pay for 5 boxes of raisins at $4?', 'Cloth worth $14 pays for cheese at $7 a hundredweight: how much cheese?', 'How many times is ⅔ contained in 4?'],
    answers='1) 4 barrels. 16) 2 hundredweight.')
add(37, 'A fraction of a fraction',
    'Your child finds a fraction of a fraction, such as ⅔ of ¾.',
    'Twenty-seven problems: halving part of an orange, “what single fraction equals ⅔ of ¾”, and shares of a ship or bank stock. The model takes a unit fraction of the fraction first, then multiplies.',
    'Say: One-third of three-fourths is one-fourth, so two-thirds of three-fourths are 2 times one-fourth, or two-fourths, which is one-half.\nDraw it: shade ¾ of a bar, then shade ⅔ of the shaded part.',
    ['Daniel divides part of a melon equally between his brother and sister: what part of the whole does each get?', 'What single fraction equals ⅔ of ¾?', 'A person owning part of a ship sold part of his share: what part of the ship did he sell?'],
    materials=['Squared paper and colored pencils'] + MAT)
add(38, 'Prices and amounts with fractions',
    'Your child solves cost and quantity problems where both the price and the amount are fractions.',
    'Fifteen or more problems on cider, oil and wine, a fraction times a fraction, and work done in fewer hours a day.',
    'Say: If ¾ of a yard costs 6 cents, ¼ costs 2 cents, a yard costs 8 cents, and ½ a yard costs 4 cents.\nGo to the unit fraction, then to the whole, then to what is asked.',
    ['If ¾ of a yard costs 6 cents, what will ½ a yard cost?', 'What is ⅔ of ⅚?', 'If a man works part of a day, how long will a job take?'])
add(39, 'Finding the whole, with fractions',
    'Your child finds a whole when a fractional part is known, in harder stories.',
    'About twenty-eight problems: poles partly in earth, water and air, money left after a gift, cloth cost when part is lost, a horse priced in barrels of flour.',
    'Say: If ⅖ of a pole is in the air and that part is 8 feet, then ⅕ is 4 feet, and the whole pole, 5 fifths, is 20 feet.',
    ['A pole has a fraction in the earth, a fraction in the water and 8 feet in the air: how long is it?', 'After giving away part of his money a boy had 15 cents: how much had he?', 'A horse is worth some barrels of flour: find its price.'])
add(40, 'A fraction of a number is how many times another?',
    'Your child compares a fraction of one number with another number.',
    'Thirty-two problems. Model: three-fourths of 24 is 18, and 18 is 2 times 9.',
    'Say: Three-fourths of 24 is 18. 9 is contained in 18 twice. So three-fourths of 24 is 2 times 9.',
    ['Three-fourths of 24 is how many times 9?', 'Two-thirds of 21 is how many times 7?', 'Grain divided among people: how much does each get?'],
    answers='14) 2.')
add(41, 'Dividing by a fraction',
    'Your child finds how much money buys at a fractional price, which is dividing by a fraction.',
    'Twenty-eight problems on cloth, corn, coffee and tea at fractional prices, then “Divide x by y” drills. The solutions show that dividing by a fraction is multiplying by it turned upside down.',
    'Say: At $⅔ a yard, $⅓ buys half a yard, so $1 buys three halves, or 1½ yards, and $4 buys 4 times 1½, or 6 yards.\nThe short way: 4 divided by ⅔ is 4 times 3/2, which is 6.',
    ['At $⅔ a yard, how many yards will $4 buy?', 'How many times is ¾ contained in 6?', 'Divide 5 by ⅝.'],
    tip='Check the prices in the book itself: the fractions in this part of the scan are hard to read on screen.')
add(42, 'Dividing fractions by whole numbers',
    'Your child divides a fraction or mixed number by a whole number.',
    'About seventeen problems. Model: 10 acres among 6 children is 1⅔ acres each.',
    'Say: 10 acres shared among 6 children: each gets 10/6, which is 1⅔ acres.\nTo divide a fraction by a whole number, divide the numerator if you can, or multiply the denominator: ⅔ divided by 2 is ⅓; ¾ divided by 2 is ⅜.',
    ['A man divided 10 acres equally among his 6 children: how much did each get?', 'Divide ¾ by 2.', 'If a man travels 9 miles in 1¼ hours, how far in 1 hour?'],
    answers='1) 1⅔ acres. 7) 4 cents.')
add(43, 'Dividing by fractions in stories',
    'Your child uses dividing by a fraction in stories, and finds a number from a fraction of it.',
    'Twenty-two problems: how many yards money buys, how many times one number contains another, and “x is ⅔ of what number?”',
    'Say: One bushel of rye is worth three-fourths of a bushel of wheat. So 4½ bushels of wheat buy as many bushels of rye as ¾ is contained in 4½, which is 6.',
    ['Wheat is shared among poor persons, a fraction of a bushel each: how many persons?', 'At a fraction of a dollar a gallon, how many gallons of vinegar for $2½?', 'One bushel of rye is worth ¾ of a bushel of wheat: how many bushels of rye for 4½ bushels of wheat?'],
    answers='22) 6 bushels; 11⅓ bushels.')
add(44, 'Shortcuts: parts of a dozen and of a dollar',
    'Your child uses handy fractions (12½ cents is ⅛ of a dollar, 33⅓ cents is ⅓) to work prices quickly.',
    'Two printed tables: parts of 12 (2 = ⅙, 3 = ¼, 4 = ⅓, 6 = ½, 8 = ⅔, 9 = ¾, 10 = ⅚) and parts of 100 (12½ = ⅛, 16⅔ = ⅙, 20 = ⅕, 25 = ¼, 33⅓ = ⅓, 37½ = ⅜, 50 = ½, 62½ = ⅝, 66⅔ = ⅔, 75 = ¾, 87½ = ⅞). Then thirty-one problems using them.',
    'Say: 33⅓ cents is one-third of a dollar. So $12 buys as many pounds of coffee as ⅓ is contained in 12, which is 36 pounds.\nAnd to multiply by 12½: multiply by 100 and divide by 8. 32 × 12½ = 3200 ÷ 8 = 400.',
    ['What will 24 yards of alpaca cost, at 37½ cents a yard?', 'Paid $12 for coffee at 33⅓ cents a pound: how many pounds?', 'Multiply 48 by 75; 24 by 37½; 51 by 33⅓.'],
    answers='1) $18. 14) $2. 15) $2. 16) $9. 17) $10. 18) $5. 19) $18. 20) $25. 21) 36 lb. 24) 12 yd. 25) 400. 26) 900; 2500; 5100. 27) 3600; 900; 1700. 28) 2600; 5600; 6000. 29) 12. 30) 12; 28; 10.',
    tip='These shortcuts are still useful at the shop: 25% off is a quarter off, 33% is about a third.')

# ---------- Unit 5 ----------
add(45, 'Review: mixed problems',
    'Your child solves a mixed set of whole-number problems on money, rates and work.',
    'Twenty-eight problems with no model solutions: money, unit rate (“the rule of three” done by reasoning), and horses with oats and hay.',
    'There are no new methods here. Ask your child to say which method each problem needs before solving it: add, subtract, multiply, divide, or “go through one”.',
    ['Five men bought a horse for $42; the first gave $13, the second $7, the third $5, the fourth $9: how much did the fifth give?', 'A father husks 7 rows of corn while Joseph husks 3: how many will Joseph husk while his father husks 42?', 'How many horses can eat in 9 days the hay that 12 horses eat in 6 days?'],
    answers='1) 34 cents. 2) $43. 3) 8 cents. 4) $8. 5) $64. 6) 35 cents. 7) $19. 8) $26. 9) 9 cents. 10) $24. 11) $13. 12) $78. 13) $42; $30. 14) $16; $36. 15) $49. 16) $56. 17) 12 cents. 18) 9 apples. 19) 54 cents. 20) $49. 21) 48, 64, 80 cents. 22) 21 mi. 23) 18 rows. 24) $63. 25) 20 bu. 26) 7 weeks. 27) 10 apples. 28) 8 horses.')
add(46, 'Review: the big mixed set',
    'Your child works through a long review of everything so far, including chases, cisterns and work together.',
    'About ninety-three problems over six pages: fractions, buying and selling, work, overtaking (a hound and a hare), and cisterns with two pipes.',
    'Pick one classic to model.\nSay: A hare is 90 yards ahead. The hound runs 10 feet a second, the hare 7, so the hound gains 3 feet a second. 90 yards are 270 feet, and 3 is contained in 270 ninety times. So 90 seconds.',
    ['A hare is 90 yards ahead of a hound; the hound runs 10 feet a second, the hare 7: when will the hound catch it?', 'A cistern holds 24 gallons; one pipe fills 8 gallons an hour, another empties 5: how long to fill it?', 'A can do a piece of work in 2 days, B in 4 and C in 6: how long together?'],
    answers='1) $20; $36. 3) 8 oranges. 4) 16 times. 31) $3.75. 33) $1.50 a day. 35) 20 lemons. 56) $12; $4 a day. 62) 32 yd. 63) 12 days. 64) $48. 65) 14 days. 66) 20 days. 80) 8 days. 81) 90 seconds; the hound runs 900 ft, the hare 630 ft. 82) 20 rods. 84) 8 hr. 85) 12 hr. 90) 1 1/11 days.',
    tip='This lesson is a few weeks of work. Do ten problems at a time.', mins=25)

# ---------- Unit 6 ----------
def measure(n, title, table, model, ex, answers=None, tip=None, optional=False):
    add(n, title, 'Your child knows the table by heart and changes quantities to larger and smaller units.',
        'The table: ' + table + ' Then problems that change to smaller units (multiply) and to larger units (divide).',
        model, ex, answers=answers, tip=tip, optional=optional,
        materials=['The book page', 'Real measures or coins if you have them'])
measure(47, 'United States money', '10 mills make 1 cent; 10 cents, 1 dime; 10 dimes, 1 dollar; 10 dollars, 1 eagle.',
    'Say: In 1 cent there are 10 mills, so in 2 cents there are 2 times 10, or 20 mills.\nAnd going up: 20 dimes are as many dollars as 10 is contained in 20, which are 2.\nMills and eagles are no longer used, but the reasoning is the same for any units.',
    ['How many mills are in 2 cents?', 'How many cents are in 2 dollars?', 'Two hundred cents are how many dollars?'],
    answers='1) 20 mills. 2) 30, 40 … 90 mills. 3) 20 … 90 cents. 6) 200 cents. 8) 2 dimes. 11) $2.')
measure(48, 'Dry measure', '2 pints make 1 quart; 8 quarts, 1 peck; 4 pecks, 1 bushel.',
    'Say: 3 quarts 1 pint: 3 quarts are 6 pints, and 1 pint more makes 7 pints.\nGoing up: 27 pints are 13 quarts 1 pint, which are 1 peck 5 quarts 1 pint.',
    ['Reduce 2 bu. 3 pk. 7 qt. to quarts.', 'Reduce 27 pt. to pecks.', 'Reduce 3 bu. 7 qt. 1 pt. to pints.'],
    answers='7) 7 pt. 8) 29 qt. 9) 14 pk. 10) 39 pt. 11) 95 qt. 12) 101 pt. 13) 3 qt 1 pt. 17) 1 pk 5 qt 1 pt. 23) 194 qt. 24) 129 pt. 25) 288 pt. 26) 207 pt. 27) 369 pt.')
measure(49, 'Liquid measure', 'gills, pints, quarts and gallons (4 gills make 1 pint; 2 pints, 1 quart; 4 quarts, 1 gallon).',
    'Say: In 1 gallon there are 4 quarts, and in each quart 2 pints, so a gallon is 8 pints.\nFill a quart jar from pint glasses if you can.',
    ['How many pints in 3 gallons?', 'How many gallons in 20 quarts?', 'Reduce 2 gal. 3 qt. to pints.'],
    tip='Gills are no longer used. The rest are on every milk jug.')
measure(50, 'Avoirdupois weight (pounds and ounces)', '16 drams make 1 ounce; 16 ounces, 1 pound; 100 pounds, 1 hundredweight; 20 hundredweight, 1 ton.',
    'Say: Half a pound is half of 16 ounces, which is 8 ounces.\nAnd backwards: 12 ounces are 12/16, or three-fourths, of a pound.',
    ['Forty-two ounces are how many pounds?', 'Reduce 10 lb. 10 oz. 11 dr. to drams.', 'Ten pounds are what part of a hundredweight?'],
    answers='6) 2 lb 10 oz; 3 lb 5 oz; 4 lb 11 oz; 5 lb 10 oz. 9) 8 oz. 12) 75 dr. 13) 2731 dr. 15) 9075 lb. 16) ¾. 17) ½; ⅝; ⅞. 18) 1/10; 1/5; 1/4; 2/5; 1/2; 3/5; 3/4; 4/5.')
measure(51, 'Long measure', '12 inches make 1 foot; 3 feet, 1 yard; 5½ yards, 1 rod; 40 rods, 1 furlong; 8 furlongs, 1 mile.',
    'Say: A mile is 8 furlongs of 40 rods, so 320 rods. 16 rods are 16/320, or one-twentieth, of a mile.',
    ['How many yards are in 2 rods? In 4 rods?', 'Six hundred and forty rods are how many miles?', 'Sixteen rods are what part of a mile?'],
    answers='1) 24 in. 2) 6, 9, 12, 15, 21, 27 ft. 3) 11, 22, 27½, 38½, 55 yd. 4) 120, 160, 200, 240, 280, 360 rd. 5) 72 fur. 6) 3 ft; 4 ft. 7) 5 yd; 7 yd. 8) 4 rd; 6 rd. 9) 2 mi. 15) 1/20. 16) 3/40. 17) 6/11.',
    tip='Rods and furlongs are old, but furlongs are still used in horse racing.')
measure(52, 'Time', '60 seconds make 1 minute; 60 minutes, 1 hour; 24 hours, 1 day; 7 days, 1 week; 365 days, 1 common year; 366, a leap year; 100 years, 1 century. A note gives the solar year as about 365¼ days, and the rhyme “Thirty days have September, April, June and November.”',
    'Say: Fifty minutes are fifty-sixtieths, or five-sixths, of an hour.\nFor dates: from October 27 to December 25 is 4 more days in October, 30 in November and 25 in December, 59 days.',
    ['Fifty minutes are what part of an hour?', 'How many days from October 27 to December 25?', 'How many days from March 20 to September 22?'],
    answers='6) ⅓. 7) ⅚. 9) 5/7. 10) ⅔. 12) ½. 15) 61. 16) 92. 17) 91. 18) 16. 19) 59. 20) 186. 21) 183.')
add(53, 'Problems with mixed units',
    'Your child solves costs and rates with quantities in mixed units, like 5 bushels 3 pecks.',
    'Twenty-one problems: corn by the bushel, fences by the rod, a steamer\'s distance from its time and speed.',
    'Say: 5 bushels 3 pecks at 60 cents a bushel: 3 pecks are ¾ of a bushel, so the cost is 5¾ times 60 cents, which is $3.45.\nChange to one unit first.',
    ['What is the cost of 5 bu. 3 pk. of corn at 60 cents a bushel?', 'What will a fence 5 rd. 2 yd. 2 ft. 3 in. long cost at $12 a rod?', 'A steamer averages 9 miles an hour for 9 hr. 26 min. 40 sec.: how far does it go?'],
    answers='1) $3.45. 2) $1.85. 3) 77½ cents. 4) $66. 5) 85 mi. 6) 2 gal 3 qt 1 pt. 11) 95 cents. 12) 23 yd 1 ft. 14) 25 mi an hour. 15) 3 revolutions. 16) 13 weeks. 17) 5 lb 14 oz. 18) $18. 19) 60 cents a bushel. 20) $22.50; 15 cents a bushel.')
add(54, 'Business problems with whole numbers',
    'Your child solves everyday buying, selling and sharing problems.',
    'Seventeen problems such as a shopper\'s wrong change and three men sharing the gain on a horse.',
    'Say: Three men paid $90 for a horse and $18 to keep it: $108 in all. They had its use, worth $42, and sold it for $99: $141 in all. They gained $33, which is $11 each.\nList what went out and what came in, then compare.',
    ['Having $92, I bought a watch for $73: how much had I left?', 'George bought candles 25 cents, soap 10, sugar 35 and starch 3, paid $1 and got 30 cents change: what was the mistake?', 'Three men bought a horse for $90, kept it 6 weeks at $3 a week, had its use worth $42 and sold it for $99: what did each make?'],
    answers='1) 165 gal. 2) $50. 3) $185. 4) $19. 5) $35. 6) 3 cents too much change. 7) $2. 8) $12.50. 10) $2.82. 12) 600 yd. 13) 28 mi. 14) 40 lb. 15) $11 each. 17) 100 bu.')

# ---------- Unit 7 ----------
add(55, 'Fractions of a price, and what is left',
    'Your child goes from one fraction of a quantity to another, and solves “the rest is …” problems.',
    'About thirty-four problems: “If ⅔ of a yard costs $2, what will ¾ cost?”, “⅔ of 1½ is ¾ of what number?”, and orchards and money divided into fractions with a remainder.',
    'Say: If ⅔ of a yard costs $2, ⅓ costs $1, the whole yard $3, and ¾ of a yard three-fourths of $3, which is $2.25.\nFor the orchard: ¼ + ⅓ + ⅙ is ¾, so the 32 cherry trees are the other ¼, and the orchard has 128 trees.',
    ['If ⅔ of a yard of cloth costs $2, what will ¾ of a yard cost?', 'A traveller went 30 miles in 3½ hours: how far at that rate in 7½ hours?', 'In an orchard ¼ are apple, ⅓ pear, ⅙ plum and the remaining 32 cherry: how many trees in all?'])
add(56, 'Number puzzles: sums, differences and ages',
    'Your child solves classic “two numbers” and age puzzles by reasoning, without algebra.',
    'Thirty-one problems. Models: a number added to itself is twice the number; for two numbers whose sum is 16 and difference 4, twice the greater is 20; for three boys\' ages, take away the differences first.',
    'Say: The sum of two numbers is 16 and their difference is 4. If the smaller were as big as the larger, the sum would be 16 and 4, or 20. That is twice the larger, so the larger is 10 and the smaller 6.',
    ['Divide 45 into three parts so the second is 3 times the first and the third 5 times the first.', 'The sum of two numbers is 31, and the greater exceeds the less by 7: what are they?', 'A watch, chain and ring cost $62; the chain cost $5 less than the ring, and the watch $12 more than the chain: find each price.'],
    answers='1) 7. 2) 8. 3) 4 and 12. 4) 6 and 42. 5) 4, 8, 12. 6) 5, 15, 25. 8) 5. 9) 9 and 3. 10) 12. 11) 4. 12) 13. 13) 10 and 6. 14) 15 and 10. 15) 19 and 12. 24) Henry 10, James 14, Oliver 13. 27) ring $20, chain $15, watch $27. 31) harness $25, horse $75, buggy $125.',
    tip='Drawing the numbers as bars of different lengths makes these much easier.')
add(57, 'Dividing in fractional parts, and clock puzzles',
    'Your child divides a quantity so one part is a fraction of another, and solves clock puzzles.',
    'Twenty-six problems such as dividing 15 so the smaller part is ⅔ of the larger, a broken tree, and “the time past noon is equal to half the time till midnight”.',
    'Say: If the smaller part is ⅔ of the larger, the two together are 5/3 of the larger. 5/3 of the larger is 15, so ⅓ is 3, and the larger is 9 and the smaller 6.',
    ['Divide 15 into two parts so that the less is ⅔ of the greater.', 'A tree 70 feet high broke into 3 pieces, each a fraction of the next: how long is each?', 'The time past noon is equal to half the time till midnight: what time is it?'],
    answers='1) 9 and 6. 21) 4 o\'clock in the afternoon.')
add(58, 'A number and a part of itself',
    'Your child finds a number when it is increased or decreased by a fraction of itself.',
    'Fifteen problems. The model: a number increased by its half is 3/2 of the number; 3/2 of the number is 15, so ½ is 5 and the number is 10.',
    'Say: The number and its half make three-halves of the number. Three-halves are 15, so one-half is 5, and the number is 10.',
    ['What number, increased by its half, will equal 15?', 'A father is 40 years older than his son, and the son\'s age is a fraction of the father\'s: how old is each?', 'A piece of flannel shrank by a fraction of its length and then measured 28 yards: how long was it?'],
    answers='1) 10.')
add(59, 'Working together',
    'Your child solves “how long will it take together” problems.',
    'Nineteen problems. Models: if one does ½ of a job a day and another ⅓, together they do ⅚ a day and take 1⅕ days; and finding one worker\'s time from the team\'s.',
    'Say: A digs a trench in 6 days, so he does ⅙ of it a day. B takes 12 days, so ¹⁄₁₂ a day. Together they do 2/12 and 1/12, which is 3/12 or ¼ a day. So together they take 4 days.',
    ['A can dig a trench in 6 days and B in 12 days: how long working together?', 'A man and his wife drink a keg in 12 days, the wife alone in 30: how long would the man alone take?', 'A, B and C reap a field in 4 days; A alone takes 8 days and B 12: how long would C take alone?'],
    answers='10) 1⅕ days. 11) 4 days. 12) 2 11/12 days. 13) 1 day. 14) 6 days. 15) 20 days. 16) 24 days.')
add(60, 'Ratio',
    'Your child finds the ratio of two numbers and divides a quantity in a given ratio.',
    'The definition: ratio is the relation one quantity bears to another of the same kind. Twenty-four problems, from “the ratio of 12 to 2 is 6” to sharing a pasture rent in a given ratio.',
    'Say: The ratio of 12 to 2 is 12 divided by 2, which is 6.\nTo divide 35 pupils in the ratio 2 boys to 3 girls: every group of 5 has 2 boys and 3 girls; 35 makes 7 such groups, so 14 boys and 21 girls.',
    ['The ratio of 21 to 7 equals the ratio of 36 to what number?', 'A school of 35 pupils has 2 boys to every 3 girls: how many of each?', 'A and B hire a pasture for $45; A puts in 4 cows, B 5: what should each pay?'],
    answers='3) 6. 7) 30. 8) 12. 10) 2. 11) 2½. 12) George 15 cents, John 10 cents. 13) 20 and 28. 14) A 8, B 12. 15) John 12 cents, James 16 cents. 16) 60 apple, 36 peach. 17) 14 boys, 21 girls. 18) 12. 19) 5 yd and 20 yd. 20) 12 and 16. 21) A $20, B $25. 23) A $35, B $21. 24) C loses $18, D $12.')
add(61, 'Ratio with three or more parts',
    'Your child divides a quantity into three or more parts in a given ratio.',
    'Eighteen problems, such as dividing 60 in the ratio 3, 4 and 5, and horses, cows and sheep on a farm.',
    'Say: 3 and 4 and 5 are 12 parts. 60 divided into 12 parts is 5 each. So the parts are 15, 20 and 25.',
    ['Divide 60 into three parts in the ratio of 3, 4 and 5.', 'A farm has 60 horses, cows and sheep: 3 cows to each horse and 2 sheep to each cow: how many of each?', 'Divide 35 cherries so Agnes has twice as many as Emma and Sarah twice as many as Agnes.'],
    answers='1) 10 and 12. 9) 15, 20, 25. 10) 7, 14, 21, 28. 12) 9, 12, 15 peaches. 15) A 20 cents, B 15, C 10. 16) 6 horses, 18 cows, 36 sheep. 17) 7, 14, 21. 18) Emma 5, Agnes 10, Sarah 20.')
add(62, 'Proportion by reasoning',
    'Your child solves proportion problems (more men, fewer days; higher price, smaller loaf) by reasoning through one.',
    'Twenty-three problems on men and days, a bankrupt paying cents on the dollar, loaf sizes and wages. Models: 5 men for 18 days is 90 days of work for 1 man, so 9 days needs 10 men.',
    'Say: 5 men take 18 days, so 1 man would take 5 times 18, or 90 days. To do it in 9 days needs as many men as 9 is contained in 90, which is 10 men.\nAsk each time: does the answer get bigger or smaller? More men means fewer days.',
    ['If 5 men can do a piece of work in 18 days, how many men can do it in 9 days?', 'If a loaf weighs 8 oz. when flour is $3 a barrel, what should it weigh when flour is $4?', 'If 6 men can do a piece of work in 5 days, how long will it take if 3 more men help when it is half done?'],
    answers='1) 10 men. 2) 10 men. 3) 8 days. 5) $48. 6) $12. 7) $48. 8) 4 loaves. 9) 10 loaves. 10) 15; 12 loaves. 11) 6 oz; 4⅘ oz. 12) 12 oz. 15) 4⅙ days. 16) 5½ days. 17) $56. 18) $45. 19) 7½ rd. 20) 27 bu. 22) $880. 23) 126 sheep.')
add(63, 'Partnership',
    'Your child shares rent or profit fairly when partners put in different amounts or for different times.',
    'About fifteen problems on pasture rent (oxen and sheep) and partners\' gains by capital and time. The model counts 10 sheep as 1 ox, then divides the rent in proportion.',
    'Say: 180 sheep eat as much as 18 oxen. So A has 27 oxen and B 18: 45 shares in all. $25 divided into 45 shares: A pays 27 of them, $15, and B 18, $10.',
    ['A and B rent a pasture for $25; A puts in 27 oxen and B 180 sheep; an ox eats as much as 10 sheep: what should each pay?', 'E and F were partners for a year: E put in $1000, F three times as much, but F took out $1000 after 8 months; the gain was $770: what is each share?', 'A gained $70 and B $80; A\'s money was in 10 months, B\'s 8; together they put in $1700: what did each invest?'],
    answers='1) A $15, B $10. 11) E $210, F $560. 12) A $1300, B $1100. 13) C $420, D $560. 14) A $700, B $1000. 15) E $300, F $540.')

# ---------- Unit 8 ----------
add(64, 'Per cent: what it means',
    'Your child knows that per cent means hundredths and changes common per cents to fractions.',
    'The start of percentage: per cent as so many in each hundred, with problems ending in changing per cents to fractions (37½% is ⅜; 66⅔% is ⅔).',
    'Say: Per cent means “for each hundred”. 25 per cent is 25 hundredths, which is one-fourth.\nUse the table of parts of 100 from Lesson XLIV: you already know 12½ is ⅛ of 100, so 12½% is ⅛.',
    ['What fraction is 25 per cent? 50 per cent? 75 per cent?', 'What fraction is 37½ per cent?', 'What fraction is 66⅔ per cent?'],
    answers='17–20) 3/8, 9/16, 2/3, 7/8.')
add(65, 'Finding a per cent of a number',
    'Your child finds a per cent of a number and uses it for gain and selling prices.',
    'Sixteen problems: per cent of a number, the gain on a cost, a flock\'s increase, and the price to charge for a given profit.',
    'Say: 10 per cent of $20 is one-tenth of $20, which is $2.\nTo make 25 per cent profit on cloth that cost 12 cents, add a quarter of 12 cents, 3 cents: sell at 15 cents.',
    ['A lady with $20 spends 10% on muslin, then 10% of the rest on calico: how much did she spend?', 'To make 12½% profit, what must muslin sell for that cost 8 cents a yard?', 'To make 25% profit, what must delaine sell for that cost 12, 16, 20 and 35 cents?'],
    answers='1) 2. 2) 3. 3) $8. 6) 17 bushels. 7) 7 horses. 8) $2. 9) $1. 10) 38 sheep. 11) 55 sheep. 12) $3.80. 13) 33 cents. 14) 9 cents; 18 cents. 16) 15, 20, 25, 43¾ cents.')
add(66, 'Fractions as per cents',
    'Your child changes fractions into per cents.',
    'Twenty-two problems of the form “How many per cent is ½?” The model: it is ½ of 100, which is 50 per cent.',
    'Say: One-half of a hundred is 50, so ½ is 50 per cent. One-fifth of a hundred is 20, so ⅕ is 20 per cent.',
    ['How many per cent is ½?', 'How many per cent is ¼? ⅕? ⅒?', 'How many per cent is ⅜? ⅚?'], mins=15,
    answers='1) 50%.')
add(67, 'What per cent? Gain and loss',
    'Your child finds what per cent one number is of another, and the per cent gained or lost.',
    'Fourteen problems, with models: 2 is ⅖ of 5, which is 40 per cent; and a $2 gain on a $5 cost is 40 per cent.',
    'Say: The gain is $2 on a cost of $5. $2 is two-fifths of $5, and two-fifths is 40 per cent. So the gain is 40 per cent.\nThe per cent gain is always worked on the cost.',
    ['If 9 of 36 pupils are absent, what per cent are absent?', 'A merchant buys cloth at $5 a yard and sells it at $7: what per cent does he gain?', 'Henry buys a horse for $15 and sells it for $24: what per cent does he gain?'],
    answers='1) 40%. 2) 60%; 25%. 3) 50%; 12½%. 4) 25%; 16⅔%. 5) 5%. 6) 25%. 7) 33⅓%. 8) 66⅔%. 9) 20%. 10) 40%. 11) 25%. 12) 20% loss. 13) 50%. 14) 60%.')
add(68, 'Finding the cost from the selling price',
    'Your child works backwards from a selling price and a per cent gain or loss to the cost.',
    'Twenty problems. The model: a watch sold for $12 at a 20 per cent gain cost $10, because the price is 120 hundredths, or 6/5, of the cost.',
    'Say: A 20 per cent gain means the price is the cost and one-fifth more: six-fifths of the cost. Six-fifths are $12, so one-fifth is $2, and the cost is $10.',
    ['A watch was sold for $12, at a gain of 20 per cent: what did it cost?', 'A sold a watch to B for $60, gaining 20%; B sold it at a 20% loss: how much more did B lose than A gained?', 'Apples at 4 for 3 cents give a 50% gain: what is the gain at 5 for 4 cents?'],
    answers='1) $10. 7) 3 cents. 8) $4 gain (50%). 9) 25% loss. 10) 50% gain. 11) $4.50 loss. 12) B lost $2 more. 14) 60%. 15) 16⅔% loss.')
add(69, 'Discounts: “per cent off”',
    'Your child works out prices with a discount, and with two discounts one after another.',
    'Ten problems. The book explains “10 per cent off” and “20 and 5 off” (20 per cent off, then 5 per cent off what is left).',
    'Say: $500 at 20 and 5 off: 20 per cent off leaves $400; 5 per cent of $400 is $20, which leaves $380.\nThe second discount is taken off the reduced price, not the list price.',
    ['A $500 lot of books is sold at 20 and 5 off: what is paid?', 'Goods bought at 20 and 5 off cost $133: what was the list price?', 'On a $70 bill, 20 and 5 off is allowed on the first $50 and 10 and 5 off on the rest: what is paid?'],
    answers='1) $2.40. 4) $380. 6) $6. 8) $175. 10) $55.10.',
    tip='A good one to try at a real sale: is “20% off, then 10% off” the same as 30% off? (It isn\'t: it\'s 28% off.)')
add(70, 'Commission',
    'Your child works out an agent\'s commission and what the owner receives.',
    'A definition of commission, then eight problems on agents selling houses and grain.',
    'Say: An agent sells a house for $4000 and charges 2½ per cent. 1 per cent of $4000 is $40, so 2½ per cent is $100.',
    ['An agent sells a $4000 house and charges 2½%: what is his commission?', 'A merchant sells 800 bushels of wheat at $1.25 and charges 2%: how much does the farmer get?', 'A merchant sells grain for $1000, charges 5% and buys $50 shares with the rest: how many shares?'],
    answers='1) $100. 2) $28. 3) $12.50. 4) $75; the owner gets $1425. 5) $980. 6) $2000. 7) $600. 8) 19 shares.', mins=15)
add(71, 'Insurance',
    'Your child knows what a policy and a premium are and works out premiums.',
    'Definitions of policy and premium, then problems on premiums at given rates, some with a policy fee, and one insuring a house and its furniture.',
    'Say: A house is insured for $2000 at 1 per cent. The premium is 1 per cent of $2000, which is $20, paid each year.\nTalk about why people insure things.',
    ['What is the premium on a house insured for $2000 at 1 per cent?', 'What is the premium at ¾ per cent, with a $1 policy fee?', 'A house and its furniture are insured at different rates: what is the whole premium?'], mins=15,
    tip='The numbers in this lesson are hard to read in the scan. Use the book itself or the Key for answers.')
add(72, 'Simple interest for whole years',
    'Your child finds the interest on money for whole years.',
    'Definitions of interest, principal and amount, a model (the interest on $2 for 3 years at 5 per cent is 30 cents), and ten problems.',
    'Say: 5 per cent a year for 3 years is 15 per cent. 15 per cent of $2 is 30 cents.\nThe amount is the principal and the interest together: $2.30.',
    ['Find the interest on $40 for 4 years at 5%.', 'Find the interest on $60 for 2 years at 7%.', 'Find the interest on $80 for 5 years at 9%.'],
    answers='6) $8. 7) $9. 8) $8.40. 9) $9. 10) $36.')
add(73, 'Interest for months and days',
    'Your child finds interest for parts of a year.',
    'Twenty-one problems, with models: 6 months is ½ a year, so 6 per cent a year is 3 per cent; and $120 for 6 months 15 days at 6 per cent is $3.90.',
    'Say: At 6 per cent a year, 1 month is ½ per cent. For 6 months that is 3 per cent. 3 per cent of $50 is $1.50.\nThe old shortcut: at 6 per cent, every 2 months is 1 per cent.',
    ['What is the interest on $50 for 6 months at 6 per cent?', 'Find the interest on $120 for 6 months 15 days at 6%.', 'Find the interest on $200 for 4 months 24 days at 6%.'],
    answers='1) $1.50. 2) $1. 3) $2.80. 4) $2.40. 5) $4.50. 6) $3.90. 8) $3.53. 9) $4.80.')
add(74, 'Finding the principal from the interest',
    'Your child works backwards from the interest to the money lent.',
    'Eight problems. The model: 2 years at 6 per cent is 12 per cent of the principal; 12 per cent is $3, so the principal is $25.',
    'Say: 12 per cent of the principal is $3, so 1 per cent is 25 cents, and 100 per cent, the principal, is $25.',
    ['What principal gives $3 interest in 2 years at 6%?', 'What principal gives $6 interest in 3 years at 4%?', 'What sum at 5% will give an income of $200 a year?'],
    answers='1) $25. 2) $50. 3) $60. 4) $75. 5) $140. 6) $240. 7) $350. 8) $4000.')
add(75, 'Finding the principal from the amount',
    'Your child finds the principal when the principal and interest together are known.',
    'Seven problems. The model: 10 per cent interest makes the amount 11/10 of the principal, so $55 is 11/10 of it and the principal is $50.',
    'Say: 2 years at 5 per cent is 10 per cent, so the amount is the principal and a tenth more: eleven-tenths. Eleven-tenths are $55, so one-tenth is $5, and the principal is $50.',
    ['What principal at interest for 2 years at 5 per cent will amount to $55?', 'A note at interest for 3 years 4 months at 6 per cent now amounts to $30: what was its face?', 'Two-fifths of A\'s money at 8% for 2½ years amounts to $60: what is all his money?'],
    answers='1) $50. 2) $200. 3) $500. 4) $250. 5) $300. 6) $25. 7) $125.')
add(76, 'Finding the time',
    'Your child finds how long money must be lent to earn a given interest, or to double.',
    'Ten problems. Models: one year\'s interest is $3, so $10 takes 3⅓ years; and at 4 per cent money doubles in 100 ÷ 4 = 25 years.',
    'Say: $50 at 6 per cent earns $3 a year. To earn $10 takes as many years as 3 is contained in 10: 3⅓ years, or 3 years 4 months.\nTo double, the interest must reach 100 per cent: at 5 per cent that takes 20 years.',
    ['In what time, at 6 per cent, will $50 give $10 interest?', 'In what time will money double at 2, 3, 5, 6, 8 and 10 per cent?', 'In what time will money triple at 5%?'],
    answers='1) 3 yr 4 mo. 2) 4 yr. 3) 2 yr 6 mo. 4) 2 yr 8 mo. 6) 6 yr 8 mo. 7) 25 yr. 9) 40 yr. 10) 25 yr; 20 yr.')
add(77, 'Finding the rate',
    'Your child finds the rate of interest from the principal, interest and time.',
    'Ten problems. Models: $24 in 2 years is $12 a year, which is 6 per cent of $200; and money doubling in 20 years earns 100 ÷ 20 = 5 per cent.',
    'Say: $200 earns $24 in 2 years, so $12 a year. $12 is 12 two-hundredths, or 6 hundredths, of $200: 6 per cent.',
    ['At what rate will $200 give $24 interest in 2 years?', 'At what rate will $200 amount to $240 in 4 years?', 'At what rate will money double in 12, 10, 8, 5, 4 and 2 years?'],
    answers='1) 6%. 2) 8%. 3) 5%. 4) 7%. 5) 8%. 6) 7%. 7) 5%. 8) 6%. 9) 5%. 10) 8⅓%, 10%, 12½%, 20%, 25%, 50%.')
add(78, 'Present worth and discount',
    'Your child finds what a debt due in the future is worth now.',
    'A note explaining that discount is like interest paid in advance: present worth is like the principal, and the debt due is like the amount. Twelve problems; the model finds a $72 debt due in 4 years at 5 per cent worth $60 now.',
    'Say: In 4 years at 5 per cent, $1 grows to $1.20. So a debt of $72 then is worth as many dollars now as 1.20 is contained in 72, which is $60. The discount is $12.\nIt is Lesson LXXV turned into a real question: what is a future payment worth today?',
    ['What are the present worth and discount of $72 due in 4 years at 5%?', 'What is the discount at 6% on $496 due in 4 years?', 'What is the present worth at 6% of $77 due in 6 years 8 months?'],
    answers='1) present worth $60, discount $12. 2) $400; $120. 3) $25; $5. 4) $500; $250. 5) $45. 6) $96. 7) $4. 8) $50. 9) $44. 10) $55.')
add(79, 'Interest puzzles',
    'Your child reasons about how interest, principal, rate and time relate to each other.',
    'Fourteen problems with no model solution, such as what part of the principal the interest is, and when two loans give the same interest.',
    'Say: At 6 per cent for 4 years 2 months, the interest is 25 per cent, which is one-fourth of the principal.\nThen: 4 years at 10 per cent is 40 per cent; at 5 per cent that takes 8 years.',
    ['At 6 per cent, for 4 years 2 months, what part of the principal is the interest?', 'In what time will money at 5 per cent give the same interest as in 4 years at 10 per cent?', 'The interest on A\'s and B\'s money is $40, and A has twice as much as B: what has each?'],
    answers='1) ¼. 2) ⅕ of the amount. 11) 8 years.')

# ---------- Unit 9 ----------
add(80, 'Miscellaneous problems',
    'Your child solves a final mixed set using every method in the book.',
    'Sixty-one mixed problems over seven pages: barter, unknown numbers, partnership, work and rate, chases with steps and leaps, ages, profit, wages with forfeits and mixtures. Three have model solutions. This is the last lesson.',
    'Before each problem, ask your child to name the method: through one, parts of a number, ratio, work together, per cent, or interest. Naming it is half the battle.\nSay: If 12 peaches are worth 84 apples, 1 peach is worth 7 apples, so 5 peaches are worth 35 apples. 8 apples are worth 24 plums, so 1 apple is worth 3 plums, and 35 apples are worth 105 plums.',
    ['If 12 peaches are worth 84 apples, and 8 apples are worth 24 plums, how many plums for 5 peaches?', 'If Mary gives each playmate 5 cherries she has 21 left; if 8 each, none left: how many playmates?', 'A, B and C can do a piece of work in 4 days, A and B in 8 days, B and C in 6 days: how long would each take alone?'],
    answers='1) 105 plums. 2) James 8, Lucy 11, Mary 13. 3) 8. 7) 2½ days. 8) 4 cents a dozen. 10) 8 children. 11) 10 beggars. 12) 3 children. 13) 60 leaps. 14) 140 steps. 15) $60. 16) A 13 cents, B 11 cents. 19) 10 hr. 20) 25%. 21) 7 playmates. 22) 105 steps. 25) 80 pears. 26) 9% a year. 27) 20 yd. 30) 60 leaps. 31) James 5, Thomas 15. 37) A 12 days, B 24 days, C 8 days. 39) 50 cents. 43) man 24 days, woman 40 days. 45) A 50, B 10, C 5. 47) A 24 days, B 48 days. 49) 5 days. 50) 22 days. 51) 16 yd. 52) 100 steps. 54) 10, 40 and 120 sheep. 55) 20 days. 59) 50 lb. 61) John 6 cents, James 3 cents.',
    tip='Spread these over several weeks, five at a time. When your child finishes, the next book is Ray\'s New Practical Arithmetic.', mins=25)

assert sorted(L) == list(range(1, 81))
lessons = [L[n] for n in range(1, 81)]
for l in lessons: l['unit'] = next(u['id'] for u in UNITS if u['from'] <= l['num'] <= u['to'])
BOOK = {'id': 'raysnewintellect00rayjrich', 'title': "Ray's New Intellectual Arithmetic", 'year': 1877, 'key': 'intellectual', 'short': 'Intellectual',
        'eyebrow': "Ray's Arithmetic · Book 2 · 1877",
        'hero': '80 lessons of mental arithmetic, from adding in your head to fractions, ratio, percentage and interest, for children about 7 to 10. Every problem is solved aloud and explained, and each lesson has a guide.',
        'key_id': 'keytoraysnewarit00rayj',
        'how': ['<b>Out loud, in the head.</b> “Intellectual” means mental. Children answer aloud and then say why, following the model solutions printed in the book. Paper is only for jotting.',
                '<b>A little each day.</b> About 20 minutes a day. Most lessons have 20 to 40 problems; spread them over two or three days.',
                '<b>Where to start.</b> After Ray\'s New Primary Arithmetic, the book says you may begin at Lesson IV.',
                '<b>Answers.</b> Each guide gives the answers that could be read clearly from the scan. Ray\'s own <i>Key</i> has them all, with worked solutions (see the book list).',
                '<b>Reasoning is the goal.</b> Many later problems are puzzles. Let your child struggle a little, then model the first half of the explanation together.']}
yaml.safe_dump({'book': BOOK, 'units': UNITS, 'lessons': lessons}, open(sys.argv[1], 'w'), allow_unicode=True, sort_keys=False, width=1000)
print(len(lessons), 'lessons')
