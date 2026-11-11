---
title: "Newton: the rhythm of gravity"
linkTitle: "Newton"
description: "Why gravity's inverse-square law is the one that closes an orbit, how the slow turning of Mercury's orbit weighed the law, why calendars and eclipse cycles are continued fractions, why the tide is a chord, and what a model solar system shows. Chapter 19 of the paper in plain words, with three instruments."
layout: rhythm-large
h1: "Newton"
h1em: "the rhythm of gravity"
try_title: "Three instruments to play with"
chapter: "19"
more:
  - { url: "connections/rhythm-of-numbers/large-and-small/", label: "Large and small: Kepler, atoms and orbits" }
# Plain-words summary of Chapter 19 of the paper (docs/papers/rhythm-of-numbers/paper/ch19_newton.tex). Keep every claim
# as the paper states it: none of the physics is ours, and nothing here is a new theory of gravity.
added: "2026-11-11b"
lede: "The last chapter followed Kepler, who found the shapes of the orbits. This one follows Newton, who found the cause. It asks the same question of his law of gravity that the Rhythm of Numbers asks of pi: where does a continued fraction decide what happens? None of the physics here is ours, and none of it is a new theory of gravity. What is new is the way of reading it, one small exact rule, and an experiment on a model solar system."
short:
  - "**One law closes the orbit.** Make gravity weaken a little faster or slower than the square of the distance and no orbit closes. Each lap, the closest point steps round the Sun, and the path draws a flower whose petals come from a continued fraction."
  - "**The step weighs the law.** Mercury's orbit turns a tiny bit more than Newton's law predicts. In 1894 an astronomer tried changing the power in the law from 2 to 2.00000016. It failed on the Moon. Einstein explained the turn in 1915."
  - "**Calendars are continued fractions.** 19 years are almost exactly 235 months, and eclipses repeat after 223 months. Both are rungs of a continued fraction. The leap-year rule we use is not."
  - "**The tide is a chord.** The Moon's tide and the Sun's tide have slightly different periods, so they beat, like two notes almost in tune. The beat is the spring and neap tides."
  - "**Mercury keeps perfect time.** It spins three times for every two trips round the Sun, the cleanest lock in the solar system by the paper's own test."
  - "**The planets push each other in long, slow swings.** We ran a model solar system for 200,000 years and found them without being told where to look. The biggest are the ones a continued fraction predicts."
  - "**One correction** to the Kepler chapter came out of this, about a period of 883 years."
try:
  - { url: "connections/rhythm-of-numbers/newtons-rosette/", icon: "🌸", title: "Newton’s Rosette", text: "Change the law of gravity and watch the orbit stop closing and start drawing a flower." }
  - { url: "connections/rhythm-of-numbers/tide-machine/", icon: "🌊", title: "The Tide Machine", text: "Mix the Moon's tide and the Sun's, see a month of tides, and hear the spring tides as beats." }
  - { url: "connections/rhythm-of-numbers/huygens-gears/", icon: "⚙️", title: "Huygens’s Gears", text: "Pick two periods in the sky and get the best pairs of gear wheels to copy them." }
sections:
  - id: "caution"
    h: "A caution first"
    paras:
      - "People have tried to improve on Newton's gravity for three hundred years, and it is a good thing to wonder about. But nothing on this page is a new theory, and nothing here could be one. Newton's law has been tested from the width of a hair to the size of the solar system. Where it falls short, Einstein's general relativity takes over, and it has no spare numbers to adjust. The last section lists the tests, because they are the exam any new idea about gravity has to pass."
  - id: "closes"
    h: "The orbit that closes"
    paras:
      - "Kepler found that a planet's orbit is a closed ellipse: after one trip round, the planet is back where it started, heading the same way. Newton asked what kind of pull would do that."
      - "He found a rule for orbits that are nearly circles. Suppose the pull weakens as some power of the distance. Then the angle from the planet's closest point to its next farthest point is 180° divided by the square root of 3 minus that power. For Newton's own law the power is 2, the angle is exactly 180°, and closest and farthest points sit opposite each other for ever. The orbit closes."
      - "For any other power the angle is not 180°. Each lap, the closest point lands a fixed step further round, and the orbit draws a rosette. In 1873 Joseph Bertrand proved that only two laws close **every** orbit: the inverse square, and the pull of a spring."
      - "**Here is what the continued fraction adds.** The step from one closest point to the next is a fraction of a turn. Write that number as a continued fraction, and its rungs are the flowers the orbit almost draws: so many petals in so many turns. A big term means a flower that nearly closes before it starts to turn. It is the same rule as Kepler's triangle of Jupiter and Saturn, with the same proof. Try it in [Newton’s Rosette](/connections/rhythm-of-numbers/newtons-rosette/)."
  - id: "weighing"
    h: "Weighing the law by how an orbit turns"
    paras:
      - "Turn the rule round, and the slow turning of an orbit becomes a way to measure the power in the law of gravity."
      - "**The Moon.** The Sun's pull makes the Moon's orbit turn. Newton worked out how fast with his rule and got 1° 31′ each month. The real figure is 3° 3′, twice as much, and he said so. For sixty years people wondered if the law itself was wrong. In 1749 Alexis Clairaut carried the same sum one step further and found the missing half. The law was right. The arithmetic had stopped too soon."
      - "**Mercury.** Mercury's closest point creeps forward by about 574 seconds of arc a century. (A second of arc is 1/3600 of a degree.) The pulls of the other planets explain about 532. That leaves 43. In 1894 the American astronomer Asaph Hall suggested changing the power in Newton's law from 2 to 2.00000016, which would give exactly 43. The idea was taken seriously. It failed because the same change would have turned the Moon's orbit too much. In 1915 Einstein's new theory gave the 43 with nothing to adjust."
      - "Put in this page's terms: the part of Mercury's turning that Newton cannot explain would take 3 million years to carry the orbit once round. A theory of gravity was tested by a flower that takes 3 million years to draw."
  - id: "cycles"
    h: "Sun, Moon and the wheels of the calendar"
    paras:
      - "The length of the year and the length of the month are set by gravity, and neither divides evenly into the other. So every calendar is an approximation by a fraction, and the good ones are the rungs of a continued fraction."
    table:
      caption: "Famous cycles, tested"
      head: ["Cycle", "Fraction", "A rung?", "How good"]
      rows:
        - ["19 years = 235 months (Meton, 432 BC)", "235/19", "yes; the next term is 17", "off by a day in 219 years"]
        - ["Eclipses repeat after 223 months (the Saros)", "242/223", "yes", "off by an hour in 18 years"]
        - ["Leap year every 4 years (Julian)", "1/4", "yes", "off by a day in 128 years"]
        - ["8 leap years in 33", "8/33", "yes", "off by a day in about 4,300 years"]
        - ["97 leap years in 400 (ours)", "97/400", "no", "off by a day in about 3,200 years"]
      note: "The year is 365.2421897 days and the month of the Moon's phases 29.530588853 days. The 8-in-33 rule is the one linked with the Persian calendar reform of Omar Khayyam's time."
    after:
      - "**The 19-year cycle works for the same reason 355/113 works for pi.** The number of months in a year has a 17 in its continued fraction, and the rung just before a big term is always a bargain."
      - "**The eclipse cycle is two rhythms landing together.** An eclipse needs a new or full moon, and it needs the Moon to be crossing the Sun's path. 223 months bring both round again. They also bring the Moon back to nearly the same distance, so the next eclipse looks like the last. The first match is a rung of a continued fraction. The second is a near miss, one step short of a rung."
      - "**Our own leap-year rule is not a rung.** It was chosen so that you can tell a leap year from the number of the year. A rule of 31 leap years in 128 would be shorter and far more accurate, but nobody could remember it."
      - "**Wheels.** A clockwork model of the sky needs gear wheels with tooth counts in these ratios. Christiaan Huygens used continued fractions to choose them in the 1680s. The Antikythera mechanism, a Greek machine about 2,100 years old, has the 235 and the 223 cut into its bronze wheels. See [Huygens’s Gears](/connections/rhythm-of-numbers/huygens-gears/)."
  - id: "tides"
    h: "The tide is a chord"
    paras:
      - "Newton explained the tides. The Moon pulls harder on the near side of the Earth than on the far side, and the difference stretches the sea into two bulges. The Sun does the same, less strongly."
      - "The Moon's tide comes round every 12 hours 25 minutes. The Sun's comes round every 12 hours. Two waves that are almost in step drift apart and back together, exactly as two notes almost in tune do. Here the beat takes 14.77 days, half a month of the Moon's phases. When the two tides arrive together, at new and full moon, the tide is big: a spring tide. When they work against each other the tide is small: a neap tide."
      - "Lord Kelvin took this all the way. The tide at any port is a sum of a few steady waves whose periods are fixed by the Sun and Moon. In 1872 he built a machine of pulleys and gear wheels that added them and drew the tides for a year ahead. A tide table is the score of a chord. Hear it in [The Tide Machine](/connections/rhythm-of-numbers/tide-machine/)."
  - id: "spin"
    h: "Mercury keeps perfect time"
    paras:
      - "Tides also slow a planet's spin until spin and orbit keep step. The Moon turns once for each trip round the Earth, which is why we always see the same face. Mercury was expected to do the same with the Sun. In 1965 radar showed that it turns three times for every two orbits instead."
      - "The paper has a test for locked pairs: write the ratio as a continued fraction and look for a huge term right after a simple fraction. For Mercury the ratio is 1.499997, and the term after 3/2 is in the tens of thousands, as big as the measurements allow. By that test it is the cleanest lock in the solar system."
  - id: "swings"
    h: "The long, slow swings of the planets"
    paras:
      - "Newton solved the motion of two bodies. With more, the planets tug on each other, and most of the tugs cancel out. The ones that do not cancel are the ones that keep time: when five trips of Jupiter take almost exactly as long as two of Saturn, each meets the other's pull at the same places again and again, and a small push adds up for centuries."
      - "**A small exact rule (new here).** Take the ratio of two planets' periods and its continued fraction. The slow swing that belongs to one rung lasts between q and q + q′ trips of the outer planet, where q is the bottom number of the **next** rung and q′ the bottom number of this one. For Jupiter and Saturn the rung is 5/2 and the next bottom number is 29, so the swing lasts between 29 and 31 of Saturn's years: 854 to 913 years."
      - "**The experiment.** We set the Sun and eight planets going under Newton's law alone and followed them for 200,000 years. Then we looked for slow swings, without telling the search what to expect."
      - "It found Jupiter and Saturn's great swing: Jupiter pushed about 1,060 seconds of arc ahead and behind, Saturn about 2,600. The real planets do about 1,200 and 2,900, so a model tuned only to the average orbits comes close. It found a still larger and slower swing of Uranus and Neptune, whose periods are almost exactly 1 to 2. And it found a swing of Mars, about 65 seconds of arc over some 1,800 years, that needs **three** planets to explain: Mars, the Earth and Jupiter. Astronomers know that one. The search was not told about it."
      - "**A correction to the Kepler chapter.** That chapter said the triangle of Jupiter's and Saturn's meetings turns once in 883 years, and that this is exactly the period of their great swing. The triangle does turn in 883 years. The swing runs a little slower, about 940 years in our model, because the orbits themselves are slowly turning. Laplace, who explained the swing in 1785, got 929. They are still one beat seen two ways, but not at exactly the same tempo."
  - id: "exam"
    h: "The exam a theory of gravity must pass"
    paras:
      - "If you have ever tried to think up your own theory of gravity, this is the list to hold it against. Any new idea has to get all of these right at once."
      - "**Closed orbits.** Change the law even slightly and every orbit turns. Mercury's orbit pins the power to within a ten-millionth of 2, and the Moon, tracked by laser to within centimeters, pins it far more tightly."
      - "**Every orbit together.** Hall's change fitted Mercury and failed on the Moon. One law has to fit them all."
      - "**Everything falls alike.** The Earth and the Moon fall toward the Sun at the same rate to about one part in ten trillion."
      - "**Short distances.** The inverse-square law has been checked in the laboratory down to gaps of about a twentieth of a millimeter."
      - "**The long swings.** The sizes and periods of the swings above follow from the planets' masses and the law, with nothing left to choose."
      - "**What Einstein added.** Mercury's 43, the bending of starlight and the slowing of clocks all come out of general relativity with no numbers to adjust."
      - "One thing about gravity is poorly known: its strength. The constant G is measured to only about two parts in 100,000, far worse than any other constant in physics, because gravity is weak and cannot be shut out. That is a difficulty of weighing things, not a hole in the law."
ours_intro: "The paper’s Section 19.9 sorts every idea in the chapter. A short version:"
ours:
  known:
    - "Newton's rule for how an orbit turns, and Bertrand's theorem that only two laws close every orbit."
    - "The Moon's turning, Hall's changed power and Mercury's 43 (Newton, Clairaut, Hall, Einstein)."
    - "The calendar and eclipse cycles, and Huygens's use of continued fractions for gear wheels."
    - "Tides as a sum of steady waves, and Kelvin's machine."
    - "Mercury's three spins for two orbits, and the long swings of the planets (Laplace)."
  new:
    - "Reading the rosette's flowers as rungs of a continued fraction (a new presentation)."
    - "Sorting the famous cycles into rungs, near misses and neither, with the Saros as both at once (a new presentation)."
    - "The rule that the next rung sets how long a slow swing lasts (two lines of proof)."
    - "The model solar system and the swings found in it (a new computation of known effects)."
    - "The correction about the 883 years."
    - "The three instruments."
  not:
    - "Nothing here changes or extends the law of gravity."
    - "The model is a solar system like ours, tuned to the average orbits. It is not a table of where the real planets are."
    - "The rule gives how long a swing lasts, not how big it is. Ranking the swings by size from the fractions alone is still open, and Mars's three-planet swing shows it would take more than pairs."
notes:
  - "Everything here is a summary of Chapter 19 of [the paper](/connections/rhythm-of-numbers/paper/), which gives the tables, the proof and the sources. Where this page and the paper differ, the paper is right."
  - "The model follows the Sun and eight planets under Newton's law only: no relativity, no Moon, no asteroids. Its starting orbits are JPL's published average orbits, adjusted so that the average periods over the run match the real long-term averages."
  - "Lengths of the year and the months are modern average values. Planet periods are from JPL (Standish and Williams)."
credits:
  - { name: "Teddy Rook", what: "the chapter this page summarizes" }
  - { name: "Isaac Newton", what: "Philosophiae Naturalis Principia Mathematica (1687): the law, the rule for turning orbits, the Moon and the tides" }
  - { name: "JPL Solar System Dynamics", url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html", what: "E. M. Standish and J. G. Williams, “Approximate positions of the planets”: the average orbits and periods" }
  - { name: "G. M. Clemence", what: "“The relativity effect in planetary motions”, Reviews of Modern Physics 19 (1947): Mercury's 574, 532 and 43 seconds of arc" }
  - { name: "Curtis Wilson", what: "“The great inequality of Jupiter and Saturn: from Kepler to Laplace”, Archive for History of Exact Sciences 33 (1985)" }
  - { name: "Our own code", what: "the model solar system, the search for its slow swings, and the three instruments" }
---
