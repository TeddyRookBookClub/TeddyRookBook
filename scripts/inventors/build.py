#!/usr/bin/env python3
"""Inventors Ladder: build data/inventors/topics/<course>.json and data/inventors/lessons/<course>.json for the people courses.

Skill maps (units and topics) are defined here; lessons live in scripts/inventors/src/<course>.py (each defines LESSONS,
a dict topic slug -> {"blocks": [...], "sources": [...]}). Run:  python3 scripts/inventors/build.py
then:  node scripts/math/check-course.js inventors  and  node scripts/math/check-gen.js <course>
The From Scratch course (key from-scratch) is NOT built here: its files are written by hand by another builder, and this
script never touches data/inventors/{topics,lessons}/from-scratch.json.
Quotations: only public-domain texts, each with its source (the Q helper). Modern books still under copyright (Hawking,
Sagan) get our own summaries and at most a few quoted words.
"""
import json, os, sys, importlib.util, html

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRCDIR = os.path.join(os.path.dirname(__file__), 'src')

def T(slug, unit, title, short, prereqs, xp, trouble, viz=(), lab=None):
    t = {"slug": slug, "unit": unit, "title": title, "short": short, "prereqs": list(prereqs), "xp": xp, "trouble": trouble, "viz": list(viz)}
    if lab: t["lab"] = lab
    return t

COURSES = {
 "invancient": {
  "units": [
   ("greeks", "Greek Inventors", "Archimedes of Syracuse and Hero of Alexandria: levers, floating bodies, steam and clever machines."),
   ("golden-age", "Light and Experiment", "Ibn al-Haytham in Cairo, who tested ideas about light and sight in a darkened room."),
  ],
  "topics": [
   T("archimedes", "greeks", "Archimedes: The Lever and the Crown", "A Greek of Syracuse (c. 287–212 BC) who proved the law of the lever, worked out why things float, and built machines that astonished his city.", [], 2,
     "People treat the Eureka bath story as a known fact; it comes from a Roman writer two centuries later.", ["iv-lever"], "/science-lab/trebuchet/"),
   T("hero-of-alexandria", "greeks", "Hero of Alexandria: Steam, Air and Automatic Machines", "A teacher in Roman Egypt (about the 1st century AD) who described a spinning steam ball, automatic doors and a coin-operated dispenser.", ["invancient.archimedes"], 2,
     "People think Hero built a working steam engine for doing work; his aeolipile was a demonstration that did no useful work.", ["iv-aeolipile"]),
   T("ibn-al-haytham", "golden-age", "Ibn al-Haytham: Light, Sight and the Dark Room", "A scholar of Basra and Cairo (c. AD 965–c. 1040) whose Book of Optics showed that we see because light enters the eye, and tested it.", [], 2,
     "People think the eye sends out rays to see; many ancient thinkers did, and Ibn al-Haytham showed why that fails.", ["iv-camera"], "/science-lab/optics/"),
  ]},
 "invren": {
  "units": [
   ("printing", "The Printing Press", "Johannes Gutenberg in Mainz: metal type, oil-based ink and the press, about 1450."),
   ("notebooks", "Leonardo's Notebooks", "Leonardo da Vinci: thousands of pages of studies, machines and flying devices."),
  ],
  "topics": [
   T("gutenberg", "printing", "Gutenberg: Movable Type, Ink and the Press", "In Mainz around 1450, Johannes Gutenberg put together cast metal letters, an oil-based ink and a screw press, and printed a Bible.", [], 2,
     "People think Gutenberg invented printing itself; printing from blocks, and movable type in East Asia, came centuries earlier.", ["iv-mirror"]),
   T("leonardo-da-vinci", "notebooks", "Leonardo da Vinci: Notebooks and Flying Machines", "The painter and engineer (1452–1519) filled notebooks with studies of birds, water and machines; most of his designs were never built in his lifetime.", ["invren.gutenberg"], 2,
     "People think Leonardo built helicopters and tanks; they are drawings and notes, most never built or tested in his day.", ["iv-mirror", "iv-camera"]),
  ]},
 "invsci": {
  "units": [
   ("new-science", "Testing Nature with Numbers", "Galileo's telescope and inclined plane; Newton's prism, telescope and laws of motion."),
  ],
  "topics": [
   T("galileo", "new-science", "Galileo: The Telescope and the Rolling Ball", "Galileo Galilei (1564–1642) built better telescopes from a rumor, saw the moons of Jupiter, and timed balls rolling down ramps.", ["invancient.archimedes"], 2,
     "People repeat the Leaning Tower story as fact; it comes from a student's biography and may not have happened.", ["iv-incline"]),
   T("newton", "new-science", "Newton: Prisms, a New Telescope and the Laws of Motion", "Isaac Newton (1642–1727) split white light with prisms, built the first working reflecting telescope, and showed that one gravity rules apple and Moon.", ["invsci.galileo"], 3,
     "People think the prism adds colors to light; Newton showed white light is already a mixture.", ["iv-prism", "iv-cannon"]),
  ]},
 "invelec": {
  "units": [
   ("sparks", "Sparks and the First Battery", "Franklin's experiments with lightning, and Volta's pile, the first steady current."),
   ("fields", "Magnets and Motion", "Faraday turns electricity into motion, and motion into electricity."),
   ("messages", "Messages over Wires", "Morse's telegraph and Bell's telephone."),
   ("power", "Light and Power", "Edison's invention factory and light bulb, and Tesla's alternating-current motor."),
  ],
  "topics": [
   T("franklin", "sparks", "Benjamin Franklin: Lightning, the Rod, the Stove and Bifocals", "Printer, writer and experimenter (1706–1790) who showed lightning is electricity, invented the lightning rod, and never patented his inventions.", [], 2,
     "People picture lightning striking Franklin's kite; his account says only that the string became charged, and a direct strike could have killed him.", ["iv-charge"]),
   T("volta", "sparks", "Alessandro Volta: The Pile of 1800", "An Italian professor (1745–1827) who stacked zinc, copper and brine-soaked card into the first battery, after a long debate with Galvani about frogs' legs.", ["invelec.franklin"], 2,
     "People think Galvani was simply wrong; both men were partly right, since nerves and muscles do use electricity.", ["iv-pile"]),
   T("faraday", "fields", "Michael Faraday: The Motor and the Generator", "A bookbinder's apprentice (1791–1867) who became the great experimenter of the Royal Institution: the first motor in 1821, induction in 1831.", ["invelec.volta"], 2,
     "People expect a magnet sitting still in a coil to make current; only a changing magnetic field does.", ["iv-induction"]),
   T("morse", "messages", "Samuel Morse: The Telegraph and Its Code", "A painter turned inventor (1791–1872) who, with Alfred Vail and Joseph Henry's science, sent messages along a wire in dots and dashes.", ["invelec.faraday"], 2,
     "People think Morse invented the electric telegraph alone; Cooke and Wheatstone in Britain had one working too, and Vail did much of the work.", ["iv-morse"]),
   T("bell", "messages", "Alexander Graham Bell: The Telephone", "A teacher of deaf students (1847–1922) who turned the shape of a sound wave into a changing current, and patented the telephone in 1876.", ["invelec.morse"], 2,
     "People think only one person could have invented the telephone; Elisha Gray and Antonio Meucci also have claims, and historians still discuss them.", ["iv-phone"]),
   T("edison", "power", "Thomas Edison: Menlo Park and the Light Bulb", "An inventor (1847–1931) who made invention a team job at Menlo Park: the phonograph in 1877, then a long-lasting bulb after testing thousands of materials.", ["invelec.volta"], 2,
     "People say Edison invented the light bulb from nothing; many inventors had made bulbs, and his team made one that lasted and a system to power it.", ["iv-filament"]),
   T("tesla", "power", "Nikola Tesla: The Rotating Magnetic Field", "An engineer (1856–1943) who pictured a motor with no brushes, driven by a magnetic field that turns, and made alternating current practical.", ["invelec.faraday", "invelec.edison"], 3,
     "People tell the war of the currents as heroes and villains; it was a business and engineering contest with good arguments on both sides at the time.", ["iv-field"]),
  ]},
 "invflight": {
  "units": [
   ("wrights", "The Wright Brothers", "From kites and gliders at Kitty Hawk to a wind tunnel in Dayton and the first powered flights."),
  ],
  "topics": [
   T("wright-gliders", "wrights", "The Wright Brothers: Gliders and the Wind Tunnel", "Wilbur (1867–1912) and Orville (1871–1948) Wright solved control first with wing-warping, then found the tables of lift were wrong and built a wind tunnel in 1901.", [], 2,
     "People think the Wrights' big idea was the engine; their key ideas were control in three directions and better wing data.", ["iv-wing"]),
   T("wright-flyer", "wrights", "The Wright Brothers: The 1903 Flyer and After", "With their own engine and propellers, the Wrights flew four times on December 17, 1903, then spent years learning to fly in circles and for long times.", ["invflight.wright-gliders"], 2,
     "People think the first flight was long and high; it lasted 12 seconds and covered 120 feet.", ["iv-wing"]),
  ]},
 "invmodern": {
  "units": [
   ("hawking", "Stephen Hawking", "Reading guides to A Brief History of Time (1988) and The Universe in a Nutshell (2001)."),
   ("sagan", "Carl Sagan", "Reading guides to Cosmos (1980) and Sagan's other books."),
  ],
  "topics": [
   T("hawking-brief-history", "hawking", "Hawking: A Brief History of Time", "A chapter-by-chapter guide, in our own words, to Stephen Hawking's 1988 book about space, time, black holes and the beginning of the universe.", ["invsci.newton"], 2,
     "Readers think black holes suck in everything nearby; far from one, its gravity is the same as any object of the same mass.", []),
   T("hawking-nutshell", "hawking", "Hawking: The Universe in a Nutshell", "A guide to Hawking's 2001 follow-up: relativity, the shape of time, predicting the future and whether time travel is possible.", ["invmodern.hawking-brief-history"], 2,
     "Readers treat ideas Hawking calls speculative, such as branes, as settled science.", []),
   T("sagan-cosmos", "sagan", "Sagan: Cosmos", "A guide to the 13 chapters of Carl Sagan's 1980 book, written with the television series: the history of science and our place among the stars.", ["invsci.newton"], 2,
     "Readers think the Cosmic Calendar means the universe is one year old; it squeezes about 13.8 billion years into one year to show how recent people are.", ["iv-calendar"]),
   T("sagan-books", "sagan", "Sagan's Other Books", "Pale Blue Dot, The Demon-Haunted World, The Dragons of Eden, Contact and more: what each is about and how Sagan taught people to test claims.", ["invmodern.sagan-cosmos"], 2,
     "Readers think skepticism means doubting everything; Sagan meant asking for evidence and staying open to it.", []),
  ]},
}

# ---------- helpers handed to every lesson file in src/ (so each file just builds blocks)
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
def Q(text, who, work, src, url=None, note=None):
    """A public-domain quotation: text (paragraphs split on blank lines), who, the work and place in it, the edition, a link."""
    paras = ''.join('<p>%s</p>' % p.strip() for p in text.strip().split('\n\n'))
    cap = '%s, <cite>%s</cite>. %s.' % (who, work, src)
    if url: cap += ' <a href="%s" rel="noopener">Read it</a>.' % url
    if note: cap += ' <span class="iv-q-note">%s</span>' % note
    return N('<figure class="iv-quote"><blockquote>%s</blockquote><figcaption>%s</figcaption></figure>' % (paras, cap))
def TL(rows, cap=None):
    """A timeline: rows of (date, event)."""
    return TB(["When", "What happened"], rows, cap or "Timeline")
def LEGEND(h): return N('<div class="iv-legend"><p class="iv-box-lab"><span aria-hidden="true">📖</span> Story or history?</p>%s</div>' % h)
def TRYIT(items):
    """Links to From Scratch projects: items = [(topic key, text)]."""
    lis = ''.join('<li><a href="/inventors/from-scratch/%s/">%s</a></li>' % (k, t) for k, t in items)
    return N('<div class="iv-try"><p class="iv-box-lab"><span aria-hidden="true">🔧</span> Build it yourself</p><ul>%s</ul></div>' % lis)
def GB(items):
    """Great Books Ladder cross-links: items = [(url, title, text)]."""
    lis = ''.join('<li><a href="%s">%s</a>: %s</li>' % (u, t, x) for u, t, x in items)
    return N('<div class="iv-gb"><p class="iv-box-lab"><span aria-hidden="true">📚</span> Read the source on the Great Books Ladder</p><ul>%s</ul></div>' % lis)
def LIB(title, author, extra=''):
    """Library links for a book still under copyright (Open Library and WorldCat searches)."""
    import urllib.parse
    q = urllib.parse.quote_plus('%s %s' % (author, title))
    return N('<div class="iv-lib"><p class="iv-box-lab"><span aria-hidden="true">🏛️</span> Borrow the book</p><p><i>%s</i> by %s is still under copyright, so we do not reproduce it. Find it at a library: <a href="https://openlibrary.org/search?q=%s" rel="noopener">Open Library</a> or <a href="https://search.worldcat.org/search?q=%s" rel="noopener">WorldCat</a>.%s</p></div>' % (title, author, q, q, extra))
def GK(title, label=None):
    """A Grokipedia link (checked to exist before use)."""
    return '<a href="https://grokipedia.com/page/%s" rel="noopener">%s</a>' % (title, label or title.replace('_', ' '))
SRC = {
 "heath": {"name": "The Works of Archimedes, translated by T. L. Heath (Cambridge University Press, 1897), Internet Archive", "url": "https://archive.org/details/worksofarchimede00arch"},
 "vitruvius": {"name": "Vitruvius, The Ten Books on Architecture, translated by Morris Hicky Morgan (Harvard University Press, 1914), Book IX, Introduction", "url": "https://archive.org/details/thetenbooksonarc20239gut"},
 "plutarch_marc": {"name": "Plutarch, Life of Marcellus (Parallel Lives), sections 14–19"},
 "woodcroft": {"name": "The Pneumatics of Hero of Alexandria, translated by J. G. Greenwood and edited by Bennet Woodcroft (London, 1851), section 50 and others", "url": "https://areeweb.polito.it/strutture/cemed/SUST_didattica.bk/2003/2003_Storia%20della%20tecnologia/WEB%20Materials%20&%20Sources/Steam_Library/hero/index.html"},
 "g_archimedes": {"name": "Grokipedia, Archimedes", "url": "https://grokipedia.com/page/Archimedes"},
 "g_hero": {"name": "Grokipedia, Hero of Alexandria; Aeolipile", "url": "https://grokipedia.com/page/Hero_of_Alexandria"},
 "g_haytham": {"name": "Grokipedia, Ibn al-Haytham; Book of Optics", "url": "https://grokipedia.com/page/Ibn_al-Haytham"},
 "g_camera": {"name": "Grokipedia, Camera obscura", "url": "https://grokipedia.com/page/Camera_obscura"},
 "sabra": {"name": "A. I. Sabra, The Optics of Ibn al-Haytham, Books I–III: On Direct Vision (Warburg Institute, 1989): the standard English translation, still under copyright"},
 "g_gutenberg": {"name": "Grokipedia, Johannes Gutenberg; Printing press", "url": "https://grokipedia.com/page/Johannes_Gutenberg"},
 "richter": {"name": "The Literary Works of Leonardo da Vinci, compiled and edited by Jean Paul Richter (London, 1883), vols. 1 and 2, Internet Archive", "url": "https://archive.org/details/literaryworksofl01leon"},
 "g_leonardo": {"name": "Grokipedia, Leonardo da Vinci", "url": "https://grokipedia.com/page/Leonardo_da_Vinci"},
 "crew": {"name": "Galileo, Dialogues Concerning Two New Sciences, translated by Henry Crew and Alfonso de Salvio (Macmillan, 1914), Internet Archive", "url": "https://archive.org/details/dialoguesconcern00gali_0"},
 "carlos": {"name": "Galileo, The Sidereal Messenger, translated by Edward Stafford Carlos (London, 1880), Internet Archive", "url": "https://archive.org/details/thesiderealmesse46036gut"},
 "g_galileo": {"name": "Grokipedia, Galileo Galilei", "url": "https://grokipedia.com/page/Galileo_Galilei"},
 "opticks": {"name": "Isaac Newton, Opticks, 4th edition (London, 1730), Internet Archive", "url": "https://archive.org/details/bim_eighteenth-century_opticks-or-a-treatise-_newton-sir-isaac_1730"},
 "motte": {"name": "Isaac Newton, The Mathematical Principles of Natural Philosophy, translated by Andrew Motte (London, 1729), Internet Archive", "url": "https://archive.org/details/bim_eighteenth-century_principia-english-th_newton-sir-isaac_1729_1"},
 "g_newton": {"name": "Grokipedia, Isaac Newton", "url": "https://grokipedia.com/page/Isaac_Newton"},
 "franklin_auto": {"name": "Benjamin Franklin, His Autobiography, Harvard Classics vol. 1 (P. F. Collier & Son, 1909), Internet Archive", "url": "https://archive.org/details/Harvard-Classics"},
 "franklin_exp": {"name": "Benjamin Franklin, New Experiments and Observations on Electricity (London, 1754 printing), Letter X, October 19, 1752, Internet Archive", "url": "https://archive.org/details/newexperimentsob00fran"},
 "g_franklin": {"name": "Grokipedia, Benjamin Franklin; Lightning rod; Franklin stove; Bifocals", "url": "https://grokipedia.com/page/Benjamin_Franklin"},
 "volta1800": {"name": "Alessandro Volta, On the Electricity excited by the mere Contact of conducting Substances of different Kinds, letter to Sir Joseph Banks (March 20, 1800), English translation in The Philosophical Magazine, vol. 7 (1800), Internet Archive", "url": "https://archive.org/details/s2id13415780"},
 "g_volta": {"name": "Grokipedia, Alessandro Volta; Voltaic pile", "url": "https://grokipedia.com/page/Alessandro_Volta"},
 "faraday_er": {"name": "Michael Faraday, Experimental Researches in Electricity, First Series (Philosophical Transactions, 1832), Internet Archive", "url": "https://archive.org/details/philtrans01461252"},
 "faraday_candle": {"name": "Michael Faraday, The Chemical History of a Candle, ed. William Crookes (1908 impression), Internet Archive", "url": "https://archive.org/details/chemicalhistoryo00faraiala"},
 "g_faraday": {"name": "Grokipedia, Michael Faraday", "url": "https://grokipedia.com/page/Michael_Faraday"},
 "loc_morse": {"name": "Library of Congress, Samuel F. B. Morse Papers: the first telegraph message, May 24, 1844", "url": "https://www.loc.gov/collections/samuel-morse-papers/"},
 "g_morse": {"name": "Grokipedia, Samuel Morse; Electrical telegraph", "url": "https://grokipedia.com/page/Samuel_Morse"},
 "loc_bell": {"name": "Library of Congress, Alexander Graham Bell Family Papers: Bell's experimental notebook, vol. 1, p. 40, March 10, 1876", "url": "https://www.loc.gov/collections/alexander-graham-bell-papers/"},
 "g_bell": {"name": "Grokipedia, Alexander Graham Bell; Telephone", "url": "https://grokipedia.com/page/Alexander_Graham_Bell"},
 "edison_papers": {"name": "Thomas A. Edison Papers (Rutgers University): letter to Theodore Puskas, November 13, 1878, and the notebooks of the lamp tests", "url": "https://edisondigital.rutgers.edu/document/LB003487"},
 "g_edison": {"name": "Grokipedia, Thomas Edison; Incandescent light bulb; Phonograph", "url": "https://grokipedia.com/page/Thomas_Edison"},
 "tesla_mi": {"name": "Nikola Tesla, My Inventions (Electrical Experimenter, 1919), Wikisource", "url": "https://en.wikisource.org/wiki/My_Inventions"},
 "g_tesla": {"name": "Grokipedia, Nikola Tesla; Induction motor; War of the currents", "url": "https://grokipedia.com/page/Nikola_Tesla"},
 "loc_wright": {"name": "Library of Congress, The Wilbur and Orville Wright Papers: \"The Belief That Flight Is Possible to Man\"", "url": "https://www.loc.gov/collections/wilbur-and-orville-wright-papers/articles-and-essays/the-belief-that-flight-is-possible-to-man/"},
 "wbm": {"name": "The Wright Brothers Aeroplane Company: Inventing the Airplane (the 1899 letter to the Smithsonian, the wind tunnel and the 1903 flights)", "url": "https://www.wright-brothers.org/History_Wing/Wright_Story/Inventing_the_Airplane/Inkling_of_Idea/More_Info.htm"},
 "g_wright": {"name": "Grokipedia, Wright brothers; Wright Flyer", "url": "https://grokipedia.com/page/Wright_brothers"},
 "nasa_wright": {"name": "NASA Glenn Research Center, Beginner's Guide to Aeronautics: the Smeaton coefficient and the Wrights' lift equation", "url": "https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/smeaton-coefficient"},
 "g_hawking": {"name": "Grokipedia, Stephen Hawking; A Brief History of Time; The Universe in a Nutshell", "url": "https://grokipedia.com/page/Stephen_Hawking"},
 "g_bht": {"name": "Grokipedia, A Brief History of Time", "url": "https://grokipedia.com/page/A_Brief_History_of_Time"},
 "g_nutshell": {"name": "Grokipedia, The Universe in a Nutshell", "url": "https://grokipedia.com/page/The_Universe_in_a_Nutshell"},
 "g_sagan": {"name": "Grokipedia, Carl Sagan", "url": "https://grokipedia.com/page/Carl_Sagan"},
 "g_cosmos": {"name": "Grokipedia, Cosmos (Sagan book); Cosmos: A Personal Voyage", "url": "https://grokipedia.com/page/Cosmos_(Sagan_book)"},
 "g_pbd": {"name": "Grokipedia, Pale Blue Dot; The Demon-Haunted World", "url": "https://grokipedia.com/page/Pale_Blue_Dot"},
}
def LES(blocks, *src): return {"blocks": list(blocks), "sources": [SRC[s] for s in src]}
HELP = dict(P=P, K=K, W=W, M=M, N=N, H=H, EX=EX, V=V, LI=LI, TB=TB, TRY=TRY, Q=Q, TL=TL, LEGEND=LEGEND, TRYIT=TRYIT, GB=GB, LIB=LIB, GK=GK, SRC=SRC, LES=LES)

def build():
    out_t = os.path.join(ROOT, 'data', 'inventors', 'topics'); out_l = os.path.join(ROOT, 'data', 'inventors', 'lessons')
    os.makedirs(out_t, exist_ok=True); os.makedirs(out_l, exist_ok=True)
    for key, c in COURSES.items():
        assert key != 'from-scratch'
        units = [{"key": k, "title": t, "blurb": b} for k, t, b in c["units"]]
        topics = []
        for t in c["topics"]:
            d = {"id": key + "." + t["slug"]}; d.update(t); topics.append(d)
        with open(os.path.join(out_t, key + '.json'), 'w') as f:
            json.dump({"course": key, "units": units, "topics": topics}, f, ensure_ascii=False, indent=1); f.write('\n')
        src = os.path.join(SRCDIR, key + '.py')
        if os.path.exists(src):
            spec = importlib.util.spec_from_file_location('iv_' + key, src); m = importlib.util.module_from_spec(spec); m.__dict__.update(HELP); spec.loader.exec_module(m)
            les = {}
            for t in c["topics"]:
                if t["slug"] in m.LESSONS: les[key + "." + t["slug"]] = m.LESSONS[t["slug"]]
            extra = set(m.LESSONS) - {t["slug"] for t in c["topics"]}
            if extra: print('WARNING', key, 'lessons for unknown topics:', sorted(extra))
            with open(os.path.join(out_l, key + '.json'), 'w') as f:
                json.dump(les, f, ensure_ascii=False, indent=1); f.write('\n')
            print(key, len(topics), 'topics,', len(les), 'lessons')
        else:
            print(key, len(topics), 'topics, no lessons yet')

if __name__ == '__main__':
    build()
