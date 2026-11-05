#!/usr/bin/env python3
"""Inventors Ladder, From Scratch course (key from-scratch, builder invlab): build
data/inventors/topics/from-scratch.json and data/inventors/lessons/from-scratch.json.

The people courses are built by scripts/inventors/build.py, which never writes these two files.
Visuals: static/inventors/viz/from-scratch.js (fs-...); practice: static/inventors/gen/from-scratch.js.
Run:  python3 scripts/inventors/from_scratch.py
then: node scripts/math/check-course.js from-scratch  and  node scripts/math/check-gen.js from-scratch

Safety notes follow only widely agreed practice: low-voltage batteries only, never mains; wires and batteries get hot
when shorted, so keep connections brief; coin cells and magnets away from small children; adult help for cutting;
no lab chemicals; never near power lines; antennas down before storms. No first-aid sections.
Prices are rough U.S. figures for 2026, generic parts, no links to shops.
"""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
KEY = 'from-scratch'

def P(h): return {"t": "p", "html": h}
def K(h): return {"t": "key", "html": h}
def W(h): return {"t": "why", "html": h}
def M(h): return {"t": "mistake", "html": h}
def N(h): return {"t": "note", "html": h}
def H(x): return {"t": "h", "text": x}
def EX(title, q, steps, a): return {"t": "ex", "title": title, "q": q, "steps": list(steps), "a": a}
def V(name, opts=None, cap=None):
    b = {"t": "viz", "name": name}
    if opts: b["opts"] = opts
    if cap: b["cap"] = cap
    return b
def LI(*items): return {"t": "list", "items": list(items)}
def TB(head, rows, cap=None):
    b = {"t": "table", "head": list(head), "rows": [list(r) for r in rows]}
    if cap: b["cap"] = cap
    return b
TRY = {"t": "try"}

def PARTS(title, items):
    return N('<div class="fs-parts"><b>' + title + '</b><ul>' + ''.join('<li>' + i + '</li>' for i in items) + '</ul></div>')
def STEPS(items):
    return N('<div class="fs-steps"><b>Step by step</b><ol>' + ''.join('<li>' + i + '</li>' for i in items) + '</ol></div>')
def SAFE(items):
    return N('<div class="fs-safe"><b>Safety</b><ul>' + ''.join('<li>' + i + '</li>' for i in items) + '</ul></div>')

# Safety lines used in several projects (kept identical so they read the same everywhere)
S_BATT = 'Use only ordinary AA or AAA batteries (alkaline). Never use a wall outlet, a plug-in power supply or a lithium rechargeable pack for these projects.'
S_HOT = 'A bare wire straight across a battery is a short circuit. The wire and battery get hot within seconds, so make the connection only briefly, then let go. If anything feels hot, disconnect it and let it cool.'
S_MAG = 'Strong (neodymium) magnets snap together hard and can pinch skin. Slide them apart instead of pulling. Keep them, and any small batteries, away from small children: swallowed magnets and button or coin batteries can cause serious injury.'
S_CUT = 'A grown-up does the cutting and stripping of wire, and any work with a craft knife.'

SRC = {
 "grok_batt": {"name": "Grokipedia, History of the battery", "url": "https://grokipedia.com/page/History_of_the_battery"},
 "wiki_lemon": {"name": "Wikipedia, Lemon battery (no Grokipedia article found)", "url": "https://en.wikipedia.org/wiki/Lemon_battery"},
 "grok_galv": {"name": "Grokipedia, Galvanic cell", "url": "https://grokipedia.com/page/Galvanic_cell"},
 "grok_stur": {"name": "Grokipedia, William Sturgeon", "url": "https://grokipedia.com/page/William_Sturgeon"},
 "si_henry": {"name": "Smithsonian Institution Archives, Joseph Henry constructs large electromagnet for Yale College", "url": "https://siarchives.si.edu/collections/siris_sic_12432"},
 "grok_homo": {"name": "Grokipedia, Homopolar motor", "url": "https://grokipedia.com/page/Homopolar_motor"},
 "aps_far": {"name": "American Physical Society, APS News: This Month in Physics History, Faraday and electromagnetism", "url": "https://www.aps.org/apsnews/2001/08/faraday-electromagnetism"},
 "copper_far": {"name": "Copper Development Association, Faraday's Famous Ten Days", "url": "https://copper.org/education/history/60centuries/electrical/faradays.php"},
 "grok_gen": {"name": "Grokipedia, Electric generator", "url": "https://grokipedia.com/page/Electric_generator"},
 "grok_shake": {"name": "Grokipedia, Mechanically powered flashlight", "url": "https://grokipedia.com/page/Mechanically_powered_flashlight"},
 "loc_morse": {"name": "Library of Congress, First telegraph message, 24 May 1844", "url": "https://www.loc.gov/item/mcc.019/"},
 "grok_morse": {"name": "Grokipedia, Morse code", "url": "https://grokipedia.com/page/Morse_code"},
 "itu_morse": {"name": "International Telecommunication Union, Recommendation ITU-R M.1677: International Morse code", "url": "https://www.itu.int/dms_pubrec/itu-r/rec/m/R-REC-M.1677-0-200405-S!!PDF-E.pdf"},
 "si_light": {"name": "Smithsonian National Museum of American History, Lighting a Revolution: Edison's lamp", "url": "https://americanhistory.si.edu/lighting/scripts/s19b.htm"},
 "grok_crys": {"name": "Grokipedia, Crystal radio", "url": "https://grokipedia.com/page/Crystal_radio"},
 "grok_gut": {"name": "Grokipedia, Johannes Gutenberg", "url": "https://grokipedia.com/page/Johannes_Gutenberg"},
 "grok_type": {"name": "Grokipedia, Movable type", "url": "https://grokipedia.com/page/Movable_type"},
 "wiki_bible": {"name": "Wikipedia, Gutenberg Bible (copies printed and surviving)", "url": "https://en.wikipedia.org/wiki/Gutenberg_Bible"},
 "drupa": {"name": "drupa (Messe Düsseldorf), Gutenberg's Inventions, Part 2: Hand Mould (2023)", "url": "https://www.drupa.com/en/Media_News/drupa_blog/Print_Technologies/Pioneers_and_History_of_Printing/Gutenberg%E2%80%99s_Inventions_%E2%80%93_Part_2_Hand_Mould"},
 "hoi_press": {"name": "HistoryofInformation.com, 200 to 250 sheets per hour remains the standard for hand-press output (citing J. Moran, Printing Presses, 1973)", "url": "https://historyofinformation.com/detail.php?entryid=52"},
 "scribes": {"name": "On the transmission of texts: written cultures as complex systems (arXiv preprint, 2025), table of medieval scribes' copying rates", "url": "https://arxiv.org/pdf/2505.19246"},
 "etym": {"name": "Online Etymology Dictionary, lower-case and upper-case", "url": "https://www.etymonline.com/word/lower-case"},
 "moxon": {"name": "Joseph Moxon, Mechanick Exercises on the Whole Art of Printing (London, 1683), public domain"},
 "cpsc_mag": {"name": "U.S. Consumer Product Safety Commission, CPSC warns high-powered magnets and children make a deadly mix (2012)", "url": "https://www.cpsc.gov/Newsroom/News-Releases/2012/cpsc-warns-high-powered-magnets-and-children-make-a-deadly-mix"},
}
def LES(blocks, *src): return {"blocks": list(blocks), "sources": [SRC[s] for s in src]}

UNITS = [
 ("power", "Batteries, Magnets and Motors", "Make electricity from a lemon, turn it into magnetism, then motion, then back into electricity, the way Volta, Henry and Faraday did."),
 ("signals", "Messages, Light and Radio", "Send a message down a wire, make a wire glow, and hear a radio with no battery at all."),
 ("press", "The Printing Press", "Set type, ink it and pull the press, and see why one machine changed how the world shared ideas."),
]

def T(slug, unit, title, short, prereqs, xp, trouble, viz=(), lab=None):
    t = {"id": KEY + "." + slug, "slug": slug, "unit": unit, "title": title, "short": short, "prereqs": list(prereqs), "xp": xp, "trouble": trouble, "viz": list(viz)}
    if lab: t["lab"] = lab
    return t

TOPICS = [
 T("lemon-battery", "power", "A Lemon Battery, Like Volta's Pile", "Two different metals in a sour juice make a small voltage; cells in series add their voltages.", ["sciexp.circuits", "invelec.volta"], 2,
   "Builders use two pieces of the same metal, or let the zinc and copper touch inside the lemon, and get nothing.", ["fs-lemon"], "/science-lab/circuits/"),
 T("electromagnet", "power", "A Nail Electromagnet, Like Sturgeon's and Henry's", "Current in a coil makes a magnet; more turns and more current make it stronger, and an iron core multiplies it.", ["from-scratch.lemon-battery"], 2,
   "Builders leave the enamel on magnet-wire ends, so no current flows, or hold the connection so long the wire gets hot.", ["fs-magnet"], "/science-lab/circuit-bench/"),
 T("simple-motor", "power", "A Homopolar Motor, Faraday's 1821 Idea", "A current crossing a magnetic field feels a push, F = BIL; arranged right, the push keeps a wire spinning.", ["from-scratch.electromagnet", "invelec.faraday"], 2,
   "Builders squeeze the wire tight against the battery so it can't turn, or use a magnet narrower than the battery.", ["fs-motor"]),
 T("hand-generator", "power", "A Hand Generator, Faraday's 1831 Discovery", "A changing magnetic field through a coil makes a voltage; faster changes and more turns make more.", ["from-scratch.simple-motor"], 2,
   "Learners expect a magnet sitting still inside a coil to make current, or expect a few turns to light an LED.", ["fs-induct"]),
 T("telegraph", "signals", "A Telegraph, Like Morse's", "A key closes a circuit; an electromagnet far away clicks; dots and dashes carry letters.", ["from-scratch.electromagnet", "invelec.morse"], 2,
   "Learners send letters with no gaps between them, so the receiver can't tell where one letter ends.", ["fs-morse"], "/science-lab/circuit-bench/"),
 T("filament-bulb", "signals", "A Glowing Filament, Edison's and Swan's Problem", "Current heats a thin filament until it glows; in air it burns away, so lamps need a vacuum or a gas without oxygen.", ["from-scratch.lemon-battery", "invelec.edison"], 2,
   "Learners think the bulb's glass makes the light, or that a brighter filament in air would simply last longer.", ["fs-filament"], "/science-lab/circuit-bench/"),
 T("crystal-radio", "signals", "A Crystal Radio with No Battery", "A coil and capacitor pick one station; a diode turns its radio wave back into sound you can hear in a sensitive earphone.", ["from-scratch.hand-generator"], 3,
   "Builders use ordinary earbuds, which are far too hungry for current, or a short antenna indoors far from any AM station.", ["fs-radio"]),
 T("printing-press", "press", "A Printing Press, Gutenberg's Way", "Backward metal letters, set and justified, inked and pressed, print a page the right way round, hundreds of times a day.", ["invren.gutenberg"], 2,
   "Learners set the letters forward, so the page prints backward, or forget that every line must be filled out exactly to lock up.", ["fs-press"]),
]

LESSONS = {}

# ---------------------------------------------------------------------------------------------------------- lemon
LESSONS["lemon-battery"] = LES([
 P("In the 1780s an Italian doctor, Luigi Galvani, saw the legs of a dead frog twitch when he touched them with two different metals. He thought the frog made the electricity, and called it \"animal electricity.\" Alessandro Volta, a physics professor at Pavia, was not so sure. He suspected the two metals did the work, and the frog only showed it."),
 P("Volta tested the idea with no frog at all. He stacked discs of two different metals, such as zinc and copper or silver, with card or cloth soaked in salt water between each pair. The taller the stack, the bigger the shock. In 1800 he described his <b>pile</b> in a letter to the Royal Society of London. It was the first battery: for the first time, people had a steady flow of electricity to experiment with."),
 N('<b>Meet the inventor.</b> Read Volta\'s story, and the Galvani debate, in <a href="/inventors/age-of-electricity/volta/">Alessandro Volta: The Pile of 1800</a>.'),
 K("A <b>cell</b> needs two different metals in a liquid that conducts, such as lemon juice or salt water. The more active metal (zinc) dissolves a little and leaves electrons behind, so it is the <b>negative</b> terminal; copper is the <b>positive</b> one. A zinc and copper cell makes about <b>0.9 V</b>. Cells joined <b>in series</b>, copper of one to zinc of the next, <b>add</b> their voltages."),
 P("Inside the lemon, each zinc atom that dissolves gives up two electrons: $\\text{Zn} \\to \\text{Zn}^{2+} + 2e^-$. Those electrons travel through your wire to the copper, where hydrogen ions from the acid pick them up and become tiny bubbles of hydrogen. The energy comes from the zinc changing, not from the lemon itself. The juice is the road the ions travel."),
 V("fs-lemon", {"n": 3}, "Add lemons, switch between series and parallel, and try different metals. Watch the voltage, the current and the LED."),
 W("A lemon cell is weak for two reasons. Its voltage is small, about 0.9 V. And it has a large <b>internal resistance</b>, a few thousand ohms, because ions crawl slowly through juice. So even when the voltage is enough, only a fraction of a milliamp flows. That lights an LED dimly, and an LED is about the only light that will run on so little."),
 H("Let's think it through"),
 EX("How many lemons?", "A red LED needs a little more than 1.8 V to glow. Each lemon makes about 0.9 V. How many lemons in series?",
    ["Two lemons give $2 \\times 0.9 = 1.8$ V: right at the edge, so the LED barely glows or not at all.", "Three lemons give $2.7$ V, comfortably above 1.8 V."],
    "Three lemons, and four is even better. Look in a dark room."),
 EX("Series or parallel?", "You have four lemons. Which wiring gives the most voltage?",
    ["In series the voltages add: $4 \\times 0.9 = 3.6$ V.", "In parallel every cell pushes across the same two wires: still $0.9$ V, though they can share more current."],
    "Series, about 3.6 V."),
 M("Using two pieces of the same metal. Two copper strips, or two zinc nails, make no voltage at all. A cell needs two <i>different</i> metals. Also check that the metals are not touching inside the fruit."),
 H("Build it: a lemon battery"),
 PARTS("Parts (about \\$10 to \\$20; much of it may already be in the house)", [
   "3 or 4 lemons (about \\$3); limes, potatoes or cups of salt water work too",
   "3 or 4 zinc-coated (galvanized) nails, about 5 cm long (about \\$2 for a small box)",
   "3 or 4 pieces of thick bare copper wire, about 5 cm each, or copper pennies from before 1982 (U.S. pennies made since then are mostly zinc with a thin copper coat)",
   "5 test leads with alligator clips at both ends (about \\$5 for a pack)",
   "A red LED (under \\$1). Red needs the least voltage of the common colors.",
   "Optional: an inexpensive digital multimeter (about \\$10 to \\$20). It makes the whole project better, because you can see the numbers."]),
 STEPS([
   "Roll each lemon firmly on the table to break up the juicy parts inside.",
   "Push a zinc nail and a copper wire into each lemon, about 2 to 3 cm apart, as deep as they will go. They must not touch each other.",
   "If you have a meter, set it to DC volts and touch its leads to the copper (red lead) and zinc (black lead) of one lemon. Write down the reading.",
   "Join the lemons in a chain: a clip lead from the copper of lemon 1 to the zinc of lemon 2, copper of lemon 2 to zinc of lemon 3, and so on.",
   "Measure the whole chain, from the first zinc to the last copper. Compare it with the single lemon.",
   "Connect the LED: its longer leg goes to the free copper end (positive), its shorter leg to the free zinc end (negative). Turn off the lights and look closely."]),
 H("What to look for"),
 LI("One lemon reads roughly 0.8 to 1.0 V. Each lemon you add in series adds about the same again.",
    "The LED glows faintly, best in the dark. Pull one clip off and it goes out: the circuit is broken.",
    "Look closely at the copper: tiny bubbles of hydrogen may form there after a while."),
 H("Troubleshooting"),
 LI("<b>No glow at all?</b> Turn the LED around. LEDs only pass current one way.",
    "<b>Meter reads zero?</b> Check that each clip grips a different metal, and that no nail touches a copper wire inside the fruit.",
    "<b>Voltage fine but no glow?</b> Add another lemon, push the metals deeper, or try a darker room. A green or white LED needs more voltage than a red one.",
    "<b>Readings drift down?</b> That is normal. Pull the electrodes out, wipe them, and push them into a fresh spot."),
 H("Iterate like Volta"),
 LI("Test other fruits and vegetables. Keep the metals and spacing the same so the test is fair. Which gives the highest voltage? Which lights the LED best?",
    "Make Volta's \"crown of cups\": a row of cups of salt water, each with a zinc nail and a copper wire, joined in series. Compare it with the lemons.",
    "Build a small pile: coins or copper washers and zinc washers, with paper soaked in salt water between them, stacked zinc, paper, copper, zinc, paper, copper. Measure it as it grows.",
    "Try other pairs of metals, such as a steel paper clip with copper, or aluminum foil with copper. Which pair makes the most voltage?"),
 N('<b>Try it on the Circuit Bench.</b> Put 1 to 4 cells in the battery holder on the <a href="/science-lab/circuit-bench/">Circuit Bench</a> and watch a bulb or an LED change as the voltages add up.'),
 SAFE([
   "Do not eat or drink the lemons, potatoes or salt water afterward. Metal from the electrodes gets into them. Throw them away and wash your hands.",
   "Nail points are sharp. Push them in carefully, away from your other hand.",
   S_CUT,
   "This project uses no battery and no chemicals beyond fruit and salt water. Keep it that way: do not add acids or other chemicals."]),
 TRY,
], "grok_batt", "grok_galv", "wiki_lemon")

# ---------------------------------------------------------------------------------------------------------- electromagnet
LESSONS["electromagnet"] = LES([
 P("In 1820 the Danish scientist Hans Christian Ørsted noticed that a wire carrying current made a nearby compass needle swing. Electricity could make magnetism. Inventors raced to use it."),
 P("In England, William Sturgeon bent an iron bar into a horseshoe, varnished it so bare wire would not short against the iron, and wound about 16 loose turns of bare copper wire around it. Shown in 1825, his little magnet weighed 7 ounces and lifted 9 pounds when the current flowed, and dropped it the instant the current stopped."),
 P("In Albany, New York, a teacher named Joseph Henry had a better idea. He insulated his wire, wrapping it in silk, so the turns could touch without shorting. Now he could wind hundreds of turns, layer upon layer. Around 1831 he built a magnet for Yale College that held up more than 2,000 pounds. Henry's work also made the long-distance telegraph possible."),
 K("Current in a wire makes a magnetic field around it. Wind the wire into a <b>coil</b> and the fields of all the turns add up. The strength grows with the <b>ampere-turns</b>: current × number of turns. Put <b>iron</b> inside, and the iron becomes a magnet too, making the field hundreds of times stronger, until the iron <b>saturates</b> and can take no more."),
 P("For a long coil with no iron, the field inside is $B = \\mu_0 \\dfrac{N I}{L}$, where $N$ is the number of turns, $I$ the current, $L$ the coil's length and $\\mu_0 = 4\\pi \\times 10^{-7}$ T·m/A. Double the turns or double the current and the field doubles."),
 V("fs-magnet", {"turns": 40}, "Change the turns, the cells and the core. Watch the current, the heat and how many paper clips it lifts."),
 W("Why does the wire get hot? A meter or two of thin copper wire has only a fraction of an ohm of resistance. Connected straight to a battery, it is almost a short circuit. Several amps can flow, limited mostly by the battery itself, and a few watts of heat go into the wire. That is also why Henry's insulated, many-turn coils were the real breakthrough: lots of turns give strength without needing an enormous current."),
 H("Let's think it through"),
 EX("Which is stronger?", "Magnet A: 30 turns carrying 2 A. Magnet B: 60 turns carrying 1 A. Same nail.",
    ["A: $30 \\times 2 = 60$ ampere-turns.", "B: $60 \\times 1 = 60$ ampere-turns."],
    "About the same strength."),
 EX("How much wire?", "A nail coil is about 0.8 cm across. How much wire do 50 turns use?",
    ["One turn is a circumference: $\\pi \\times 0.8 \\approx 2.5$ cm.", "$50 \\times 2.5 = 125$ cm."], "About 1.25 m, plus some extra at each end for connecting."),
 M("Leaving the enamel on magnet wire. Magnet wire looks bare but has a thin, clear coat of insulation. Sand the last 2 cm of each end until the bright copper shows, or no current can flow."),
 H("Build it: a nail electromagnet"),
 PARTS("Parts (about \\$8 to \\$15)", [
   "A large steel or iron nail, about 8 to 10 cm long (under \\$1). A steel bolt works too.",
   "About 2 to 3 meters of thin magnet wire (enameled copper, about 26 gauge; a small spool is about \\$5 to \\$8) or thin plastic-insulated hookup wire",
   "1 or 2 AA alkaline batteries and a battery holder with wire leads (about \\$2)",
   "A pile of small steel paper clips or staples",
   "Fine sandpaper, and tape",
   "Optional: a compass, and a simple push-button or slide switch (about \\$1)"]),
 STEPS([
   "Leave about 20 cm of wire free, then wind the wire tightly around the nail, turn beside turn, all in the same direction. Count as you go: 30 turns to start.",
   "Tape the coil so it does not unwind, leaving 20 cm free at the other end.",
   "Sand the last 2 cm of each wire end until the copper is bright (skip this for plastic-insulated wire; a grown-up strips 2 cm of plastic instead).",
   "Connect one end to the battery holder. Touch the other end to the other terminal only while you test, or wire in a switch.",
   "Hold the nail's point over the paper clips, connect, and count how many it lifts. Disconnect. Do the clips drop?",
   "Add 20 more turns, in the same direction, over the top of the first layer. Test again and compare. Then try two cells."]),
 H("What to look for"),
 LI("The nail picks up clips only while the current flows, and lets them go when you disconnect. (A steel nail may keep a little magnetism afterward.)",
    "More turns lift more clips. Two cells lift more than one.",
    "A compass near the nail swings to point at one end. Turn the battery around and the compass points the other way: the poles swap."),
 H("Troubleshooting"),
 LI("<b>Nothing happens?</b> The enamel is still on the wire ends, or a clip is loose. Sand again and check every connection.",
    "<b>Weak?</b> Make sure every turn goes the same way around the nail. Turns wound backward cancel out the others.",
    "<b>Battery dies fast?</b> It will: this circuit draws a lot. Connect only while testing."),
 H("Iterate like Henry"),
 LI("Make a table of turns (20, 40, 60, 80) against clips lifted. Is it a straight line? Where does it start to level off?",
    "Compare cores: an iron nail, a steel bolt, an aluminum rod, a pencil, a plastic straw. Which ones help?",
    "Henry learned to arrange coils for different jobs: many turns of thin wire for long lines, a few turns of thick wire for heavy lifting. Try two coils on one nail, wired one after the other, then side by side."),
 SAFE([S_BATT, S_HOT, "Use a switch or touch the wire on and off, rather than taping it to the battery and leaving it.", S_CUT, "Wire ends can be sharp. Point them away from eyes."]),
 TRY,
], "grok_stur", "si_henry", "grok_batt")

# ---------------------------------------------------------------------------------------------------------- motor
LESSONS["simple-motor"] = LES([
 P("Michael Faraday began as a bookbinder's apprentice who read the science books he bound. In 1813 the chemist Humphry Davy hired him as an assistant at the Royal Institution in London. In 1821, after Ørsted's discovery, Faraday wondered: if a current pushes on a magnet, could a magnet push on a current, and keep pushing?"),
 P("On 3 September 1821 he stood a magnet upright in a dish of mercury, a metal that is liquid at room temperature. He hung a wire from above so its lower end dipped into the mercury, then sent current from a battery through the wire and the mercury. The wire swept round and round the magnet, as long as the current flowed. It was the first electric motor: electricity turned into continuous motion. Mercury is poisonous, so we never use it. The homopolar motor below shows the same push with a battery, a magnet and copper wire."),
 N('<b>Meet the inventor.</b> Faraday\'s life and his own words are in <a href="/inventors/age-of-electricity/faraday/">Michael Faraday: The Motor and the Generator</a>.'),
 K("A wire carrying current across a magnetic field feels a force, at right angles to both the wire and the field. Its size is $F = B I L$: field strength (teslas) × current (amps) × length of wire in the field (meters). <b>Reverse the current or the field and the force reverses</b>; reverse both and it stays the same."),
 P("In a homopolar motor, current flows down the copper wire, out through the magnet's edge and back into the battery. Near the magnet the current runs outward, sideways, while the magnet's field points up or down. The force on that current is sideways too, around the battery, so the wire keeps turning in one direction. No switches, no brushes: the simplest motor there is."),
 V("fs-motor", None, "Change the current and flip the magnet. The curved arrow shows which way the wire turns."),
 W("The force is small. With about 0.3 T at the magnet's edge, 3 A of current and 1 cm of wire touching the field, $F = 0.3 \\times 3 \\times 0.01 = 0.009$ N, about the weight of a paper clip. But the wire is light and balanced on a point, so that little push is enough to spin it fast."),
 H("Let's think it through"),
 EX("Flip it", "Your motor spins clockwise. You turn the magnet over. Then you also turn the battery over. Which way does it spin now?",
    ["Turning the magnet over reverses the field: counterclockwise.", "Turning the battery over reverses the current: back to clockwise."],
    "Clockwise, the same as at the start."),
 EX("How big is the push?", "A wire carries 2 A across a 0.4 T field; 1.5 cm of it is in the field. What is the force?",
    ["$L = 0.015$ m.", "$F = 0.4 \\times 2 \\times 0.015 = 0.012$ N."], "0.012 N, or 12 millinewtons."),
 M("Pressing the wire tightly against the battery so it can't move, or using a magnet narrower than the battery so the wire can't reach it. The wire must rest lightly on the top terminal like a spinning top, and just brush the side of the magnet."),
 H("Build it: a homopolar motor"),
 PARTS("Parts (about \\$8 to \\$12)", [
   "One new AA alkaline battery",
   "One or two neodymium disc magnets, about the same width as the battery or a little wider (about 12 to 15 mm across; about \\$5 for a small pack)",
   "About 25 cm of bare copper wire, fairly stiff (about 16 to 18 gauge); stripped house wire offcuts or craft wire both work",
   "Needle-nose pliers, and fine sandpaper if the wire is coated"]),
 STEPS([
   "Stand the magnet on the table and set the battery on it, flat negative end down. The magnet holds it in place.",
   "Find the middle of the wire and bend a small dip or point there. It will rest on the battery's top (positive) bump.",
   "Bend the two halves down either side of the battery, like a heart or a tall rectangle. Shape the ends so they curl in and lightly brush the sides of the magnet.",
   "Set the wire on top. Adjust until it balances and the ends just touch the magnet. It should start to spin by itself.",
   "Watch for 5 to 10 seconds, then lift the wire off. Feel the wire before you touch it again; let it cool between runs."]),
 H("What to look for"),
 LI("The wire spins steadily one way. Turn the magnet over and it spins the other way.",
    "A better balanced wire spins faster. A wire touching on only one side may jiggle instead of turning.",
    "The battery and wire get warm quickly. That is the large short-circuit current doing the work."),
 H("Troubleshooting"),
 LI("<b>Wire won't turn?</b> Make sure the wire touches both the top terminal and the magnet at the same time, lightly.",
    "<b>Jumps off?</b> Make the top dip deeper so it sits in place, and balance the two sides.",
    "<b>Nothing at all?</b> Sand any coating off the wire where it touches, and try a fresh battery."),
 H("Iterate like Faraday"),
 LI("Try different wire shapes: a heart, a spiral, a tall rectangle. Which spins fastest? Count turns in ten seconds to compare.",
    "Stack two magnets. Does it speed up?",
    "Faraday published his result in a few weeks and kept testing. Write a one-page report: what you built, what you changed, what happened. Draw it."),
 SAFE([S_BATT, S_HOT, "Run the motor for a few seconds at a time, then take the wire off. Store the battery and magnet apart.", S_MAG, "Do not try Faraday's original setup: it used mercury, which is poisonous."]),
 TRY,
], "grok_homo", "aps_far", "cpsc_mag")

# ---------------------------------------------------------------------------------------------------------- generator
LESSONS["hand-generator"] = LES([
 P("If electricity can make magnetism, can magnetism make electricity? Faraday kept a note to try. For years nothing worked. A magnet sitting beside a coil made no current at all."),
 P("On 29 August 1831 Faraday wound two separate coils of insulated wire on an iron ring about 6 inches across. One coil went to a battery, the other to a galvanometer, a needle that swings when current flows. When he connected the battery, the needle kicked, then went back to zero. When he disconnected it, the needle kicked the other way. A steady current did nothing. Only a <b>change</b> made a current. That autumn he also pushed a bar magnet into a coil and saw the needle swing, and then turned a copper disc between the poles of a strong magnet and drew a steady current from it, an early generator."),
 N('<b>Meet the inventor.</b> See how this fits Faraday\'s whole career in <a href="/inventors/age-of-electricity/faraday/">Michael Faraday: The Motor and the Generator</a>.'),
 K("A <b>changing</b> magnetic field through a coil makes a voltage in it. This is <b>Faraday's law</b>: $\\mathcal{E} = N \\dfrac{\\Delta \\Phi}{\\Delta t}$, where $N$ is the number of turns and $\\Delta\\Phi$ is how much the magnetic flux through each turn changes in the time $\\Delta t$. More turns, a stronger magnet or <b>faster</b> motion give more voltage. A magnet that is not moving gives none."),
 P("<b>Flux</b>, $\\Phi$, measures how much magnetic field passes through a loop: field strength times area, $\\Phi = BA$, in webers. When a magnet slides into a coil, the flux through it rises; when it slides out, the flux falls, and the voltage flips sign. Shake a magnet back and forth and you make <b>alternating current</b>, the kind power stations make with huge spinning magnets and coils."),
 V("fs-induct", {"turns": 500}, "Drag the magnet through the coil, or press Shake. The red and green LEDs each light for one direction, once the voltage passes about 1.8 V."),
 W("This is how almost all electricity is made, from a bicycle light dynamo to a power station. A turbine turns a magnet inside coils, or coils inside magnets, and the changing flux makes the voltage. A shake flashlight is the same idea in your hand: a magnet slides back and forth through a coil."),
 H("Let's think it through"),
 EX("Faster and more turns", "Pushing a magnet into a 200-turn coil makes 0.3 V. What do you get pushing twice as fast into a 400-turn coil?",
    ["Twice as fast: twice the rate of change, so twice the voltage.", "Twice the turns: twice again."], "$0.3 \\times 2 \\times 2 = 1.2$ V."),
 EX("Enough for an LED?", "Each turn of your coil makes about 2 mV when you shake hard. A red LED needs about 1.8 V.",
    ["$1.8 \\text{ V} = 1800$ mV.", "$1800 \\div 2 = 900$ turns."], "At least about 900 turns, with a strong magnet and a fast shake."),
 M("Expecting a still magnet inside a coil to make current. Only change makes a voltage. Move it."),
 H("Build it: a shake generator and a compass meter"),
 PARTS("Parts (about \\$15 to \\$25)", [
   "Thin magnet wire, about 30 gauge, 50 to 100 meters (a spool is about \\$8 to \\$12). More turns are better.",
   "A clear plastic tube or an empty pill bottle that a stack of magnets slides through easily, about 1.5 to 2 cm wide inside",
   "3 to 5 neodymium disc magnets that fit the tube (about \\$5 to \\$8)",
   "Two caps or tape to close the tube ends",
   "For the meter: a small compass and 1 meter of any insulated wire; or an inexpensive multimeter set to its lowest DC or AC voltage range",
   "Optional challenge: two red LEDs",
   "Sandpaper and tape"]),
 STEPS([
   "Put the magnets inside the tube and close both ends so they cannot fall out.",
   "Wind the magnet wire around the middle of the tube, all in one direction, in a band about 2 to 3 cm wide. Aim for at least 500 turns. Count in hundreds, or have a helper count. Tape the coil.",
   "Sand the two wire ends until the copper is bright.",
   "Make a compass meter: wind 10 to 20 turns of insulated wire around the compass, so the coil runs north and south over the needle. Set it on the table at least an arm's length from the magnets, so they don't pull the needle themselves.",
   "Connect the two coils together. Shake the tube hard, or slide the magnets in with one quick push. Watch the needle.",
   "Challenge: connect two LEDs side by side across the coil, facing opposite ways (long leg of one to short leg of the other). Shake hard in a dim room."]),
 H("What to look for"),
 LI("The compass needle kicks one way when the magnets rush toward the coil's center, and the other way as they leave.",
    "When the magnets stop, the needle goes back to rest. No change, no current.",
    "With enough turns and a hard shake, the LEDs flicker, taking turns: proof that the current alternates."),
 H("Troubleshooting"),
 LI("<b>Needle doesn't move?</b> Check that the enamel is sanded off and the connections are tight. Move the compass farther from the magnets.",
    "<b>Very small kick?</b> Shake faster, add turns, or use more magnets.",
    "<b>No LED glow?</b> Most homemade coils need many hundreds of turns. A multimeter shows how close you are."),
 H("Iterate like Faraday"),
 LI("Measure how the kick changes with speed: drop the magnets through the coil from different heights and compare.",
    "Count turns: make a second coil with half as many and compare the kick.",
    "Faraday kept a careful notebook and numbered every paragraph. Number yours: setup, change, result, for each try."),
 SAFE([S_MAG, "Keep the magnets well away from the compass you are using as a meter, or it will point at them instead.", S_CUT, "This project uses no battery: the coil makes all the electricity. Keep it that way."]),
 TRY,
], "aps_far", "copper_far", "grok_gen", "grok_shake")

# ---------------------------------------------------------------------------------------------------------- telegraph
LESSONS["telegraph"] = LES([
 P("Samuel Morse was a well-known American painter. In 1832, sailing home from Europe, he heard fellow passengers talk about electromagnets and imagined sending messages along a wire. With help from the chemist Leonard Gale, who knew Joseph Henry's work, and from the machinist Alfred Vail, he built and rebuilt instruments through the 1830s."),
 P("In Britain, William Cooke and Charles Wheatstone opened a working telegraph in 1837 that pointed needles at letters. Morse's system was simpler: a key that opens and closes a circuit, and at the far end an electromagnet that clicks or marks paper. Letters became patterns of short and long signals. Congress paid for a line from Washington to Baltimore, and on 24 May 1844 Morse sent the words \"What hath God wrought\" from the Supreme Court chamber in the Capitol. Within a few years telegraph wires crossed the country."),
 N('<b>Meet the inventor.</b> Morse\'s full story is in <a href="/inventors/age-of-electricity/morse/">Samuel Morse: The Telegraph and Its Code</a>.'),
 K("A <b>telegraph</b> is a battery, a <b>key</b> (a switch), a long wire, and a <b>sounder</b>: an electromagnet that pulls down an iron bar with a click while the key is pressed. <b>Morse code</b> turns each letter into dots and dashes. In International Morse code a dot is 1 unit long, a dash 3 units; the gap inside a letter is 1 unit, between letters 3 units, and between words 7 units."),
 P("Morse and Vail's first code, now called American Morse, had some odd spacings and longer dashes. A simpler version, International Morse code, became the world standard in the 1800s and is the one used by radio amateurs today. Common letters got short codes: E is a single dot, T a single dash."),
 V("fs-morse", {"wpm": 8, "msg": "SOS"}, "Tap the key for dots, hold it for dashes, and pause between letters. Or type a message and press Send it."),
 W("Telegraph operators did not read the clicks one by one. They learned to hear whole letters, even whole words, as rhythms. Practice by sound, not by counting dots."),
 TB(["Letter", "Code", "Letter", "Code", "Letter", "Code"], [
   ["A", "·–", "J", "·–––", "S", "···"], ["B", "–···", "K", "–·–", "T", "–"], ["C", "–·–·", "L", "·–··", "U", "··–"],
   ["D", "–··", "M", "––", "V", "···–"], ["E", "·", "N", "–·", "W", "·––"], ["F", "··–·", "O", "–––", "X", "–··–"],
   ["G", "––·", "P", "·––·", "Y", "–·––"], ["H", "····", "Q", "––·–", "Z", "––··"], ["I", "··", "R", "·–·", "", ""]], "International Morse code letters"),
 H("Let's think it through"),
 EX("Decode it", "·––· ·– ·–· ·· ···", ["·––· is P, ·– is A, ·–· is R, ·· is I, ··· is S."], "PARIS, the word used to time Morse speed: it is exactly 50 units long, gaps included."),
 EX("How fast is a dot?", "At 10 words per minute, how long is a dot?",
    ["10 words of 50 units is 500 units a minute.", "$60\\,000 \\text{ ms} \\div 500 = 120$ ms. The shortcut: $1200 \\div 10 = 120$ ms."], "120 milliseconds; a dash is 360 ms."),
 M("Running letters together. Without a clear 3-unit gap, ·· (I) and · (E) twice look exactly the same. Gaps carry meaning too."),
 H("Build it: a two-room telegraph"),
 PARTS("Parts (about \\$10 to \\$20)", [
   "Two AA alkaline batteries in a holder with leads (3 V; about \\$2)",
   "An active buzzer rated for 3 to 5 V (it beeps by itself when powered; about \\$1), or an LED with a resistor of about 100 Ω",
   "For the key: a wooden clothespin, two thumbtacks or brass paper fasteners, a strip of stiff card or a craft stick, and a steel paper clip",
   "About 10 meters of thin two-core speaker wire or bell wire, to reach another room",
   "Optional, for a clicking sounder: your nail electromagnet from the earlier project, a springy steel strip (a hacksaw-blade offcut with smoothed ends, or a long steel paper clip bent into an arm) and a small block of wood",
   "Tape and a piece of cardboard for a base"]),
 STEPS([
   "Make the key: tape the card or craft stick to the base so one end can be pressed down. Put a thumbtack under the free end and another on the underside of the stick, so they touch only when you press. Or squeeze a clothespin with a fastener on each jaw: they touch when pinched.",
   "Wire it up in one loop: battery + to the key, key to the long wire, long wire to the buzzer's + (red) lead, the buzzer's other lead back down the second long wire to the battery's −.",
   "Run the long wire under a door to another room, or to the far end of the house, along the floor where no one will trip.",
   "Press the key: the buzzer in the other room sounds. Send SOS: ··· ––– ···.",
   "Agree on a code sheet with your partner and send short words. Then swap rooms.",
   "Optional sounder: mount the electromagnet upright on the wood block and fix the steel strip so its free end hangs just above the nail head. Put it in place of the buzzer. Each press pulls the strip down with a click. Tap briefly: the coil draws a lot of current."]),
 H("What to look for"),
 LI("The far buzzer sounds exactly as long as you hold the key: the wire carries your timing.",
    "Signals arrive instantly, even across the house. On real lines, signals crossed whole countries in a fraction of a second.",
    "With practice you start hearing letters as rhythms: di-dah for A, dah-di-dah-dit for C."),
 H("Troubleshooting"),
 LI("<b>No sound?</b> Check the buzzer's red lead goes toward the battery's +. Check the key's two contacts really touch.",
    "<b>Buzzes all the time?</b> The key's contacts are touching when they shouldn't. Bend the stick up a little.",
    "<b>Weak over long wire?</b> Thin wire has more resistance. Use thicker wire or a shorter run."),
 H("Iterate like Morse and Vail"),
 LI("Vail made the key spring back by itself. Improve your key so it returns sharply and makes clean contact.",
    "Long lines lose strength. Henry's and Morse's answer was the <b>relay</b>: a weak current works an electromagnet that closes a second circuit with its own battery. Draw how a relay would pass a message down a very long line.",
    "Design a code of your own for the ten digits, then compare it with the real one. Which is faster to send?"),
 SAFE([S_BATT, "Never connect anything in this project to house wiring, a telephone jack or a wall outlet.", "Tape long wires down along the floor or wall so no one trips.", "If you use the electromagnet sounder, tap the key briefly; the coil gets hot if held down."]),
 TRY,
], "loc_morse", "grok_morse", "itu_morse")

# ---------------------------------------------------------------------------------------------------------- filament
LESSONS["filament-bulb"] = LES([
 P("People made wires glow with electric current long before anyone made a useful lamp. The trouble was keeping them glowing. A filament hot enough to give good light also burned away in minutes, or melted."),
 P("In England, Joseph Swan worked for years on lamps with thin carbon filaments in glass bulbs, and showed them by 1879. In America, Thomas Edison's laboratory at Menlo Park, New Jersey, began in 1878 with thin platinum wire, then turned to carbon. They baked thread, cardboard and dozens of other materials until only carbon was left, and sealed them in bulbs with the air pumped out. Thread worked; cardboard was better; carbonized bamboo, the best from near Kyoto, Japan, was best of all. By the end of 1879 Edison had a practical lamp, and his company used bamboo filaments for about ten years. Swan and Edison later joined forces in the Edison and Swan company, formed in 1883."),
 N('<b>Meet the inventor.</b> How Edison\'s team ran thousands of trials is in <a href="/inventors/age-of-electricity/edison/">Thomas Edison: Menlo Park and the Light Bulb</a>.'),
 K("Current heats a thin filament, because its resistance turns electrical energy into heat: $P = VI = I^2R$. Hot enough, it glows (<b>incandescence</b>): dull red near 500 °C, orange, then yellow-white above about 2,000 °C. In <b>air</b>, a hot carbon or metal filament combines with oxygen and burns through. In a <b>vacuum</b>, or a gas with no oxygen such as argon, it lasts. Later lamps used <b>tungsten</b>, which melts at a very high temperature and can glow whiter."),
 V("fs-filament", {"gas": "air", "mat": "bamboo"}, "Turn up the voltage in air, then try a vacuum and argon. Run a lamp above its rating and watch its life shrink."),
 W("Lamp makers learned a hard trade-off. A little more voltage gives a lot more light, but a lot less life. A common rule of thumb says that running a filament lamp 10% above its rated voltage gives about a third more light but cuts its life by more than half. The sim uses rough rules like this, not exact numbers."),
 P("An incandescent bulb makes most of its energy, around nine-tenths, into heat rather than light. That is why modern LED bulbs, which make light without a hot filament, use so much less electricity for the same brightness."),
 H("Let's think it through"),
 EX("Flashlight bulb power", "A flashlight bulb runs on 2.4 V and draws 0.5 A. What power does it use, and what is the hot filament's resistance?",
    ["$P = VI = 2.4 \\times 0.5 = 1.2$ W.", "$R = V/I = 2.4 \\div 0.5 = 4.8\\ \\Omega$."], "1.2 W and about 4.8 Ω when hot. Cold, the filament's resistance is much lower."),
 EX("Why the vacuum?", "Two identical filaments glow at the same temperature, one in air and one in a vacuum. Which lasts?",
    ["In air, oxygen reaches the hot filament and it burns away.", "In a vacuum there is almost no oxygen."], "The one in the vacuum, by a huge margin."),
 M("Thinking the glass makes the light. The glass only keeps the air out. The light comes from the hot filament inside."),
 H("Build it: see a filament up close, safely"),
 P("A common classroom demonstration heats a pencil lead in a jar until it glows. It needs large currents, the lead gets hot enough to start a fire, and glass can crack, so we leave it out. Instead, use the simulation above, and look closely at a real small filament running at a safe low voltage."),
 PARTS("Parts (about \\$8 to \\$15)", [
   "Two AA alkaline batteries in a holder with leads (3 V)",
   "A small incandescent flashlight bulb rated about 2.2 to 2.5 V (sold as a replacement bulb, under \\$2 each), and a small screw-in bulb holder with leads (about \\$2)",
   "An LED and a resistor of about 100 Ω, for comparison",
   "A magnifying glass",
   "Optional: a multimeter to measure current"]),
 STEPS([
   "Connect the bulb holder to one AA cell only (1.5 V). The filament glows a dull orange. Look at it through the magnifying glass: a tiny coil of wire.",
   "Now connect two cells (3 V). The filament glows brighter and whiter. You are running it near its rating.",
   "After a minute, bring a fingertip near the glass without gripping it. Feel the warmth: most of the energy is heat.",
   "Disconnect. Now wire the LED with its resistor to the same two cells (long leg toward +). It glows, and stays cool.",
   "If you have a meter, measure the current for each. Work out the power of each, $P = VI$, and compare."]),
 H("What to look for"),
 LI("Color shifts from orange to yellow-white as the voltage goes up: hotter filaments glow whiter.",
    "The filament is a fine coil, sometimes a coil of a coil. Coiling packs a long, thin filament into a small space.",
    "The bulb gets warm; the LED barely does."),
 H("Troubleshooting"),
 LI("<b>Bulb doesn't light?</b> Screw it firmly into the holder. Check the filament through the glass: a broken one has a gap.",
    "<b>LED doesn't light?</b> Turn it around; keep the resistor in the loop."),
 H("Iterate like Edison"),
 LI("Edison's notebooks list hundreds of trials, with results good and bad. Run the simulation as a test bench: for each filament and gas, record the temperature and life at 90%, 100% and 110% of the rating. Make a table.",
    "Edison and Swan both needed better vacuum pumps before their lamps worked. Explain in two sentences why the pump mattered as much as the filament.",
    "Compare costs: a 60 W incandescent bulb and a 9 W LED bulb, each used 4 hours a day for a year. How many kilowatt-hours does each use?"),
 SAFE([S_BATT, "Small bulbs get hot. Hold them by the holder, and let them cool before unscrewing.", "Use bulbs rated for low voltage only. Never use a household lamp bulb or socket for this project.", "We leave out pencil-lead and bare-wire glow experiments: they need high currents and get hot enough to start fires."]),
 TRY,
], "si_light", "grok_batt")

# ---------------------------------------------------------------------------------------------------------- radio
LESSONS["crystal-radio"] = LES([
 P("By 1900, inventors in several countries were sending messages by radio waves, which Heinrich Hertz had shown in the 1880s. Receiving them took a <b>detector</b>, something that could turn a fast radio wave into a current you could hear. In India in the 1890s, Jagadish Chandra Bose used crystals of galena (lead ore) touched by a fine wire. In 1906 the American engineer Greenleaf Whittier Pickard patented a detector made of silicon. Thousands of people built crystal sets at home, fiddling a fine wire, the \"cat's whisker,\" across the crystal to find a sensitive spot."),
 K("A crystal radio has no battery. A long <b>antenna</b> catches a tiny bit of a station's radio energy. A <b>coil</b> and a <b>capacitor</b> form a tuned circuit that rings at one frequency, $f = \\dfrac{1}{2\\pi\\sqrt{LC}}$, so it passes one station and rejects the others. A <b>diode</b> (the crystal) lets current through one way only, and a sensitive <b>earphone</b> follows the slow changes in the signal's strength, which are the sound."),
 P("An AM station sends a fast wave, hundreds of thousands to over a million times a second (540 to 1700 kHz in North America). The sound is carried in how its strength rises and falls. That is <b>amplitude modulation</b>. Your ear can't follow the fast wave, and an earphone fed the whole wave would hear nothing, because its pushes and pulls cancel out. The diode removes one half, and what is left rises and falls with the sound."),
 V("fs-radio", {"c": 150}, "Turn the tuning capacitor. The green curve shows what the tuned circuit lets through; the strips below show the wave before and after the diode."),
 W("Why does more capacitance mean a lower frequency? A coil and capacitor pass energy back and forth, like a swing. A bigger capacitor holds more charge and takes longer to fill and empty, so each swing takes longer: a lower frequency. Four times the capacitance halves the frequency."),
 H("Let's think it through"),
 EX("Where does it tune?", "A 240 µH coil with the capacitor at 365 pF. What frequency?",
    ["$LC = 240 \\times 10^{-6} \\times 365 \\times 10^{-12} \\approx 8.76 \\times 10^{-14}$.", "$\\sqrt{LC} \\approx 2.96 \\times 10^{-7}$ s.", "$f = 1 \\div (2\\pi \\times 2.96 \\times 10^{-7}) \\approx 538\\,000$ Hz."],
    "About 538 kHz, the bottom of the AM band. At about 40 pF the same coil tunes near 1,620 kHz, the top."),
 EX("How long is the wave?", "A station broadcasts at 1,000 kHz. What is its wavelength?",
    ["$\\lambda = c/f = 3 \\times 10^8 \\div 1\\,000\\,000$."], "300 meters. AM waves are long, which is why a long antenna wire helps."),
 M("Using ordinary earbuds. They need far more current than a crystal set can give. You need a high-impedance crystal (piezo) earphone."),
 H("Build it: a crystal radio"),
 PARTS("Parts (about \\$15 to \\$30)", [
   "A germanium diode, type 1N34A (about \\$1). Germanium works with weaker signals than ordinary silicon diodes.",
   "A high-impedance crystal (piezoelectric) earphone (about \\$3 to \\$5)",
   "A variable tuning capacitor of about 365 pF (about \\$5 to \\$15, or salvaged from an old radio by a grown-up)",
   "About 30 meters of thin magnet wire or insulated hookup wire (about 22 to 26 gauge) for the coil",
   "A cardboard tube about 4 to 5 cm across, such as a paper-towel tube",
   "For the antenna: 15 to 30 meters of insulated wire; for the ground: a metal tent stake or rod and a few meters of wire",
   "Alligator-clip leads, tape, and a board to mount it on"]),
 STEPS([
   "Wind the coil: about 90 to 100 turns side by side on the tube, all one direction, tight and neat. Tape both ends. (This gives roughly 250 to 300 µH, about right for a 365 pF capacitor.) Sand or strip the ends.",
   "Put up the antenna with a grown-up: run the wire as high and long as you can reach from the ground, for example along a fence or between two trees in your yard. Keep it well away from power lines.",
   "Push the metal stake into damp soil and attach the ground wire.",
   "Connect the coil and the capacitor side by side (in parallel). Clip the antenna to one end of this pair and the ground to the other.",
   "Connect the diode from the antenna end to one earphone lead. Connect the other earphone lead to the ground end.",
   "Put in the earphone, in a quiet room, and turn the capacitor slowly. Listen for a faint voice or music. Strong local AM stations come in best, especially at night."]),
 H("What to look for"),
 LI("A faint station that grows and fades as you tune. Nothing but the station's own power drives the earphone.",
    "A longer, higher antenna makes it louder. A good ground helps too.",
    "Near a strong station you may hear it everywhere on the dial; far from stations you may hear nothing at all. Both are normal."),
 H("Troubleshooting"),
 LI("<b>Silence?</b> Check that the earphone is a crystal (piezo) type. Check the diode connections and that coil ends are sanded or stripped.",
    "<b>One station everywhere?</b> The tuning is too broad. Try connecting the antenna to a point a few turns along the coil instead of the end (tap the coil).",
    "<b>Very faint?</b> Make the antenna longer and higher (still within reach from the ground and far from power lines), and listen at night."),
 H("Iterate like the radio pioneers"),
 LI("Add taps to the coil every 10 turns (twist a small loop and scrape it bare) and try each one. Record which tap and capacitor setting finds each station.",
    "Calculate where each station should tune with $f = 1/(2\\pi\\sqrt{LC})$, then check with your radio.",
    "Pioneers hunted for the best crystal spot with a cat's whisker. Today the 1N34A diode does that job. Find out what a germanium diode has in common with a galena crystal."),
 SAFE(["Never put an antenna anywhere near power lines, and never throw a wire toward one. Keep the antenna where a grown-up can reach it from the ground; do not climb trees or roofs to string it.",
   "Disconnect the antenna from the radio and take it down if thunderstorms are around. Never use the radio during a storm.",
   "Never connect any part of the radio to a wall outlet, house wiring or the ground pin of a plug.", S_CUT,
   "Keep the small diode, earphone and other small parts away from young children."]),
 TRY,
], "grok_crys")

# ---------------------------------------------------------------------------------------------------------- printing press
LESSONS["printing-press"] = LES([
 P("Before printing came to Europe, every book was copied by hand. A skilled scribe wrote a few pages a day. Books were rare and costly, and every copy could carry new mistakes. In China, printing from carved wooden blocks was centuries old, and movable type had been made there and in Korea. In Mainz, Germany, a goldsmith named Johannes Gutenberg worked out a whole system for printing with metal type, and by about 1450 it was working."),
 P("Gutenberg's achievement was the <b>system</b>, every part fitted to the others: a way to cast thousands of identical metal letters quickly, an ink that would stick to metal, and a press to push paper evenly onto the type. His great Bible, printed in Latin with 42 lines to most pages, was finished by about 1454 or 1455. About 180 copies were printed, roughly three-quarters on paper and the rest on vellum (calfskin). 49 survive in whole or in large part."),
 N('<b>Meet the inventor.</b> Gutenberg\'s life and work are in <a href="/inventors/renaissance-and-printing/gutenberg/">Gutenberg: Movable Type, Ink and the Press</a>.'),
 K("Each letter is a separate metal <b>sort</b> with its letter raised and <b>backward</b>. The compositor picks sorts from a type case into a <b>composing stick</b>, line by line, and fills each line out exactly with blank spaces (<b>justifying</b> it). The lines are locked tight in a frame, the <b>forme</b>, inked, covered with damp paper and squeezed in a <b>screw press</b>. The page comes out the right way round. After printing, the sorts go back in the case to be used again."),
 V("fs-press", None, "Set your own type, then ink it and pull the press. Step 3 compares a scribe's day with a press crew's day."),
 H("How the type was made"),
 LI("<b>Punch.</b> A metal-worker carved each letter, backward, on the end of a steel bar.",
    "<b>Matrix.</b> The punch was struck into a small block of softer copper, leaving a letter-shaped dent, the right way round.",
    "<b>Hand mould.</b> The matrix fitted into the bottom of a two-part metal mould that could open and close in the hand. Pour in hot metal, open the mould, and out comes a sort with its letter raised and backward. The mould could be adjusted for wide and narrow letters, so one mould cast every letter.",
    "<b>Type metal.</b> Mostly lead, with tin and antimony added. It melts at a low temperature, fills the fine lines of the matrix, and hardens almost at once, so a caster could make many sorts an hour.",
    "<b>Ink.</b> Scribes' ink was watery and would bead up on metal. Printers used a sticky ink made with oil, more like a varnish with soot in it.",
    "<b>The press.</b> Screw presses had long been used to squeeze grapes for wine and olives for oil. Gutenberg's shop adapted one to press a flat wooden platen down onto paper and type."),
 P("Historians agree on the system but not on every detail of Gutenberg's own early methods. He left no description, and close study of the letters in his earliest books has led some researchers to think his first casting method may have differed from the classic hand mould described above. The steps above are how type was cast for centuries after him."),
 H("Upper case and lower case"),
 P("Printers kept their sorts in a pair of shallow wooden trays with many compartments, set on a sloping stand. Capitals went in the upper tray, the <b>upper case</b>. Small letters, used far more often, went in the lower tray, closer to the hand: the <b>lower case</b>. The names stuck to the letters themselves. The common compartments were bigger, and the busiest letters sat nearest the compositor. Joseph Moxon described the cases and the whole craft in his <i>Mechanick Exercises on the Whole Art of Printing</i> (London, 1683)."),
 H("Let's think it through"),
 EX("Read the metal", "You look down at the face of the type for the word PRESS. What do you see, left to right?",
    ["The type is a mirror image of the page.", "So the letter order is reversed, and each letter faces backward."], "S S E R P, every letter backward."),
 EX("A scribe's Bible", "A Gutenberg Bible has about 1,288 pages. A scribe copies 4 to 6 pages a day. How long for one copy?",
    ["$1288 \\div 6 \\approx 215$ working days.", "$1288 \\div 4 = 322$ working days."], "About 215 to 322 working days, most of a year or more, for a single copy."),
 EX("Pulling the Bible", "Each copy of the Bible used about 322 sheets, printed on both sides. If a press pulled 200 impressions an hour, how many hours of pulling for one copy?",
    ["Impressions: $322 \\times 2 = 644$.", "$644 \\div 200 \\approx 3.2$ hours."], "About 3 hours of pulling per copy, once the type is set. Setting the type, about 290 different sorts and tens of thousands of letters, was the slow part."),
 M("Setting type forward. If the sorts read the right way on the metal, the page prints backward. Mirror-reversed metal makes a correct page."),
 TB(["", "Scribe with a pen", "Hand press and crew"], [
   ["Typical output", "about 2 to 3 leaves (4 to 6 pages) a day; from under 1 to about 10 leaves", "about 200 to 250 sheet sides an hour (later records; early presses were probably slower)"],
   ["In a 12-hour day", "4 to 6 pages", "about 2,400 to 3,000 sheet sides, once the type is set"],
   ["Copies", "each one written again from the start, with new chances for mistakes", "hundreds of identical copies from one setting"]],
   "Approximate rates. Scribe rates come from studies of dated medieval manuscripts; press rates from the 1573 Frankfurt printing rules and Joseph Moxon (1683), as reported by James Moran."),
 H("Build it: a potato-stamp press"),
 P("Making metal type means molten metal and lead, so we leave that out. You can feel every other step with a stamp of your own."),
 PARTS("Parts (about \\$5 to \\$10)", [
   "A large potato, or a block of craft foam and some cardboard",
   "A washable ink pad or washable poster paint on a plate",
   "Paper, a pencil, a ruler, and a heavy book",
   "A grown-up with a small kitchen knife (for potato) or scissors (for foam)"]),
 STEPS([
   "Pick a short word, three or four letters, and write it in pencil on paper.",
   "Hold the paper up to a window or a mirror and trace the word backward on the other side. That is how it must look on your stamp.",
   "A grown-up cuts the potato in half. Draw the backward letters on the cut face. The grown-up cuts away the potato around each letter, about 5 mm deep, so the letters stand up. (Foam: cut out backward letters and glue them on cardboard.)",
   "Ink the letters by dabbing, not wiping, like a printer's ink balls. Too little ink gives patchy letters; too much makes blots.",
   "Lay the stamp face up, set the paper on top, and press it evenly with the heavy book, like a press's platen. Lift the paper and read your word.",
   "Print ten copies. Time yourself. Then copy the same word by hand ten times, neatly. Compare."]),
 H("What to look for"),
 LI("Backward on the stamp, forward on the paper.",
    "Even pressure prints evenly. A slight dampening of the paper, as printers did, can help it take the ink.",
    "Once the stamp is made, each copy is quick. Making the stamp was the slow part, just as setting type was."),
 H("Iterate like Gutenberg"),
 LI("Make separate letters instead of a whole word, so you can rearrange them into new words: that is movable type.",
    "Gutenberg needed every sort the same height so they all printed evenly. Try a stamp with one letter taller than the others. What happens?",
    "Justify a line: write a sentence on squared paper and spread the spaces so both edges line up. Count how many squares each space needs."),
 SAFE([S_CUT + " Keep fingers behind the blade.", "Use washable ink or paint only.", "Do not melt metal or handle lead to make type: that is why we use potato or foam."]),
 TRY,
], "grok_gut", "grok_type", "wiki_bible", "drupa", "hoi_press", "scribes", "etym", "moxon")


def build():
    units = [{"key": k, "title": t, "blurb": b} for k, t, b in UNITS]
    with open(os.path.join(ROOT, 'data', 'inventors', 'topics', KEY + '.json'), 'w') as f:
        json.dump({"course": KEY, "units": units, "topics": TOPICS}, f, ensure_ascii=False, indent=1); f.write('\n')
    les = {KEY + '.' + t["slug"]: LESSONS[t["slug"]] for t in TOPICS if t["slug"] in LESSONS}
    with open(os.path.join(ROOT, 'data', 'inventors', 'lessons', KEY + '.json'), 'w') as f:
        json.dump(les, f, ensure_ascii=False, indent=1); f.write('\n')
    print(KEY, len(TOPICS), 'topics,', len(les), 'lessons')

if __name__ == '__main__':
    build()
