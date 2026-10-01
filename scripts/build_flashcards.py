# Usage: python3 scripts/build_flashcards.py static/lang/data
# Build static/lang/data/flash.json: frequency-ranked Gospel vocabulary (Greek + Latin),
# attested inflected forms with parsing, and Greek–Latin lemma pairs for three-way cards.
import json, collections, re, sys, unicodedata
D = sys.argv[1]
G = json.load(open(D + '/grc-lex.json')); L = json.load(open(D + '/lat-lex.json'))
BOOKS = ['MAT', 'MRK', 'LUK', 'JHN']
NG, NL = 600, 600

gt = collections.Counter(); lt = collections.Counter()
gv = collections.Counter(); lv = collections.Counter(); co = collections.Counter()
gforms = collections.defaultdict(collections.Counter); lforms = collections.defaultdict(collections.Counter)
gex = {}; lex_ = {}
def acute(s):  # a word quoted on its own takes an acute, not the grave it has before another word
    return unicodedata.normalize('NFC', unicodedata.normalize('NFD', s).replace('\u0300', '\u0301'))
def snippet(toks, i, txt, after):
    a, b = max(0, i - 3), min(len(toks), i + 4)
    out = []
    for j in range(a, b):
        w = txt(toks[j])
        out.append('[' + w + ']' if j == i else w)
    return ('… ' if a > 0 else '') + ' '.join(out) + (' …' if b < len(toks) else '')
for bk in BOOKS:
    g = json.load(open(f'{D}/grc-{bk}.json')); l = json.load(open(f'{D}/lat-{bk}.json'))
    for c in g:
        for v in g[c]:
            gtok = g[c][v]; ltok = l.get(c, {}).get(v, [])
            ref = f'{bk} {c}:{v}'
            for i, t in enumerate(gtok):
                gt[t[2]] += 1
                key = (t[2], acute(t[0].lower() if not G[t[2]]['l'][0].isupper() else t[0]), t[4])
                gforms[t[2]][key[1:]] += 1
                if key not in gex or len(gtok) < gex[key][2]:
                    gex[key] = (ref, snippet(gtok, i, lambda x: x[0], None), len(gtok))
            for i, t in enumerate(ltok):
                lt[t[3]] += 1
                key = (t[3], t[0].lower() if L[t[3]]['p'] != 'Ne' else t[0], t[5])
                lforms[t[3]][key[1:]] += 1
                if key not in lex_ or len(ltok) < lex_[key][2]:
                    lex_[key] = (ref, snippet(ltok, i, lambda x: x[0], None), len(ltok))
            gs = set(t[2] for t in gtok); ls = set(t[3] for t in ltok)
            for x in gs: gv[x] += 1
            for y in ls: lv[y] += 1
            for x in gs:
                for y in ls: co[(x, y)] += 1

# ---------- Greek–Latin pairs ----------
best = collections.defaultdict(lambda: (0, None))
for (x, y), c in co.items():
    d = 2 * c / (gv[x] + lv[y])
    if d > best[x][0]: best[x] = (d, y)
LBY = {}
for i, e in enumerate(L): LBY.setdefault(e['l'], i)
OVR = {  # reviewed by hand: Greek lemma -> Latin lemma (None = no single equivalent)
 'ὁ': None, 'αὐτός': 'is', 'σύ': 'tu', 'εἰς': 'in', 'ὅς': 'qui', 'μή': 'ne', 'ἐκ': 'ex', 'ἐπί': 'super',
 'μετά': 'cum', 'εἰ': 'si', 'τὶς': 'aliquis', 'διά': 'per', 'ἐάν': 'si', 'ἐκεῖνος': 'ille', 'περί': 'de',
 'ἑαυτοῦ': 'se', 'οὐδείς': 'nemo', 'λόγος': 'verbum', 'ἀφίημι': 'dimitto', 'ἄν': None, 'κατά': 'secundum',
 'ἕως': 'donec', 'πορεύομαι': 'eo', 'παρά': None, 'ἀποστέλλω': 'mitto', 'βάλλω': 'mitto', 'ἐγείρω': None,
 'ὅταν': 'cum', 'ὑπό': None, 'οὐδέ': 'neque', 'γεννάω': 'gigno', 'βλέπω': 'video', 'ἀπόλλυμι': 'perdo',
 'ὅπου': 'ubi', 'ὅλος': 'totus', 'οἶκος': 'domus', 'καθώς': 'sicut', 'εἶπον': 'dico', 'ὅστις': 'quicumque',
 'εὐθύς': 'statim', 'ὅτε': 'quando', 'ἀνίστημι': 'surgo', 'ἐμός': 'meus', 'ἐρωτάω': 'rogo', 'ὅσος': None,
 'πέμπω': 'mitto', 'ὧδε': None, 'παιδίον': 'puer', 'κἀγώ': None, 'ἕτερος': 'alter', 'ἴδιος': 'proprius',
 'θεωρέω': 'video', 'ῥῆμα': 'verbum', 'φωνέω': 'voco', 'μέλλω': None, 'σύν': 'cum', 'ἔμπροσθεν': 'ante',
 'φημί': 'aio', 'ὥστε': None, 'δέχομαι': 'recipio', 'ἄγω': 'duco', 'ποῦ': 'ubi', 'οὐχί': 'nonne',
 'δοκέω': 'puto', 'μικρός': 'parvus', 'οὔτε': 'neque', 'ὅπως': 'ut', 'ὀπίσω': 'post', 'καθίζω': 'sedeo',
 'μηδέ': 'neque', 'παρακαλέω': None, 'ὑπέρ': 'pro', 'οὐκέτι': None, 'μηδείς': 'nemo', 'ποῖος': None,
 'σεαυτοῦ': None, 'χρεία': None, 'σός': 'tuus', 'ἄρχων': 'princeps', 'ὑποστρέφω': 'revertor',
 'εὐθέως': 'statim', 'πόσος': None, 'ἀναβλέπω': None, 'φαίνω': None, 'ἅπας': 'omnis', 'ἐμαυτοῦ': None,
 'προσκαλέω': 'convoco', 'ναός': 'templum', 'ἐγγύς': 'prope', 'παῖς': 'puer', 'πότε': 'quando',
 'ὑπάρχω': None, 'μαρτυρία': 'testimonium', 'ἕνεκα': 'propter', 'ἰσχύω': 'valeo', 'ναί': 'etiam',
 'ἐπιγινώσκω': 'cognosco', 'ἐμβαίνω': 'ascendo', 'χρόνος': 'tempus', 'ἐπάνω': 'supra', 'κεῖμαι': None,
 'θεάομαι': 'video', 'ἐπιστρέφω': 'converto', 'ἀληθής': 'verus', 'ἱκανός': None, 'διέρχομαι': None,
 'κἀκεῖνος': None, 'τέ': 'que', 'πίμπλημι': 'impleo', 'παραγίνομαι': 'venio', 'βαστάζω': 'porto',
 'ὥσπερ': 'sicut', 'ἀνάκειμαι': 'discumbo', 'τέλος': 'finis', 'εἰσπορεύομαι': 'introeo', 'δεύτερος': 'secundus',
 'καταλείπω': 'relinquo', 'δαιμονίζομαι': None, 'ὡσεί': 'quasi', 'ἀρχιερεύς': 'pontifex', 'φέρω': 'fero',
 'ἐκπορεύομαι': 'procedo', 'τέκνον': 'filius', 'ἄρχω': 'coepi', 'πρῶτος': 'primus', 'ἐκεῖ': 'ibi',
 'ὡς': 'sicut', 'ἤ': 'aut', 'ἀπό': 'ab', 'ἐν': 'in', 'ἔρχομαι': 'venio', 'ὁράω': 'video', 'γίνομαι': 'fio',
 'πρός': 'ad', 'οἶδα': 'scio', 'λαμβάνω': 'accipio', 'εἰσέρχομαι': 'introeo', 'γινώσκω': 'cognosco',
 'γυνή': 'mulier', 'ἐσθίω': 'manduco', 'ὑπάγω': 'vado', 'σῴζω': 'salvus', 'δαιμόνιον': 'daemonium',
 'ἐμπαίζω': 'illudo', 'ὄψιος': None, 'ποτέ': None, 'ἄρτι': 'modo', 'πλήν': None, 'κρίνω': 'iudico',
 'καλός': 'bonus', 'ἀγαθός': 'bonus', 'ἱερός': 'templum', 'κράζω': 'clamo', 'κώμη': 'castellum',
 'ἀργύριον': 'pecunia', 'ἀρχή': 'initium', 'λαός': 'populus', 'ἐξέρχομαι': 'exeo', 'ἐπερωτάω': 'interrogo',
 'δοξάζω': 'clarifico', 'ἀπολύω': 'dimitto', 'πληρόω': 'impleo', 'συνάγω': 'congrego', 'ἤδη': 'iam',
 'ἔξω': 'foras', 'καιρός': 'tempus', 'αἰών': 'saeculum', 'παραλαμβάνω': 'assumo', 'θύρα': 'ostium',
 'δέω': 'ligo', 'κάθημαι': 'sedeo', 'πονηρός': 'malus', 'πλοῖον': 'navis', 'μόνος': 'solus',
 'ἐπιτιμάω': 'increpo', 'μετανοέω': None, 'ἐνώπιον': 'coram', 'πρό': 'ante', 'ἐπιτίθημι': 'impono',
 'ὅμοιος': 'similis', 'οὐρανός': 'caelum', 'δύναμαι': 'possum', 'ἐγώ': 'ego',
 'νέος': 'novus', 'οἰκοδεσπότης': None, 'εὐχαριστέω': None, 'παρρησία': None, 'ἱερεύς': 'sacerdos',
 'ἐγγύς': 'prope', 'ἕκαστος': 'unusquisque', 'δεύτερος': 'secundus', 'γαμέω': 'nubo', 'ἰσχύω': 'valeo',
 'ἐγείρω': 'suscito', 'κοιλία': 'venter', 'ἑκατόν': 'centum', 'τριάκοντα': 'triginta', 'ἰσχυρός': 'fortis',
 'σῖτος': 'triticum', 'θρίξ': 'capillus', 'πετεινός': 'volucris', 'χωλός': 'claudus', 'λεπρός': 'leprosus',
 'κλέπτης': 'fur', 'βάπτισμα': 'baptisma', 'ἀγορά': 'forum', 'θλῖψις': 'tribulatio', 'πειρασμός': 'temptatio',
 'πλησίον': 'proximus', 'κριτής': 'iudex', 'δῶρον': 'munus', 'λοιπός': 'ceterus', 'ἀναχωρέω': 'secedo',
 'βαπτιστής': 'Baptista', 'δυνατός': 'possibilis', 'ἀντί': 'pro', 'ὑγιής': 'sanus', 'ἐλάχιστος': 'minimus',
 'νόσος': 'languor', 'κάτω': 'deorsum', 'μαρτύριον': 'testimonium', 'προφητεύω': 'propheto', 'μοιχεύω': 'moechor',
 'ἀκοή': 'auditus', 'φρόνιμος': 'prudens', 'τοσοῦτος': 'tantus', 'βλασφημία': 'blasphemia', 'κλάσμα': 'fragmentum',
 'δέομαι': 'rogo', 'ἐπιτρέπω': 'permitto', 'παραγγέλλω': 'praecipio', 'ὠφελέω': 'prosum', 'τελέω': 'consummo',
 'ἥκω': 'venio', 'ἀσθενέω': 'infirmor', 'περισσεύω': 'abundo', 'ὁμοιόω': 'assimilo', 'μεριμνάω': None,
 'ἀπάγω': 'duco', 'ἐκπλήσσω': None, 'σπλαγχνίζομαι': 'misereor', 'ἀναπίπτω': 'discumbo', 'παραχρῆμα': 'confestim',
 'ἐντέλλομαι': 'mando', 'ὕστερος': None, 'δεῦτε': None, 'καταλύω': 'destruo', 'γέεννα': 'gehenna',
 'περισσός': None, 'ἀπέχω': None, 'κρυπτός': None, 'ξηραίνω': 'aresco', 'παρατίθημι': 'appono',
 'ἀπαρνέομαι': 'abnego', 'ἐπαίρω': 'elevo', 'ἐμβλέπω': 'intueor', 'προστίθημι': 'adicio', 'περιβάλλω': 'circumdo',
 'μεταβαίνω': 'transeo', 'συλλαμβάνω': None, 'ἐκλέγω': 'eligo', 'λίαν': 'valde', 'ἐπιβάλλω': 'inicio',
 'προσέχω': 'attendo', 'ὕψιστος': 'altus', 'ὅριον': 'finis',
}
def pair(i):
    lem = G[i]['l']
    if lem in OVR:
        y = OVR[lem]
        return LBY.get(y, -1) if y else -1
    d, y = best[i]
    return y if (y is not None and d >= 0.6) else -1

# ---------- glosses ----------
LG = {  # Gospel-appropriate meanings where Whitaker's first sense is misleading
 'cum': 'when, since, although', 'ut': 'so that, in order that; as', 'ab': 'from, away from; by',
 'de': 'from, down from; about', 'enim': 'for, indeed', 'aio': 'say', 'dominus': 'lord, master',
 'discipulus': 'disciple, student', 'ne': 'that not, lest; not', 'unus': 'one', 'turba': 'crowd',
 'regnum': 'kingdom, royal power', 'exeo': 'go out, come out', 'mundus': 'world', 'spiritus': 'spirit, breath',
 'bonus': 'good', 'manduco': 'eat', 'trado': 'hand over, betray', 'fio': 'become, happen, be made',
 'intro': 'enter, go in', 'propter': 'because of, on account of', 'eicio': 'cast out, throw out',
 'quod': 'that, because', 'signum': 'sign', 'monumentum': 'tomb, monument', 'peto': 'ask, seek',
 'parabola': 'parable', 'generatio': 'generation', 'nascor': 'be born', 'recipio': 'receive, take back',
 'praecipio': 'command, instruct', 'coram': 'in the presence of', 'iudicium': 'judgment', 'vae': 'woe! alas!',
 'perhibeo': 'bear (witness), present', 'senex': 'old man, elder', 'secundum': 'according to; after',
 'amicus': 'friend', 'gratia': 'grace, favor; thanks', 'publicanus': 'tax collector', 'castellum': 'village; fortress',
 'consummo': 'finish, complete', 'secus': 'beside, along (secus viam); otherwise', 'licet': 'it is permitted, it is lawful',
 'servo': 'keep, guard, observe', 'hypocrita': 'hypocrite', 'inimicus': 'enemy', 'increpo': 'rebuke',
 'clarifico': 'glorify', 'vinea': 'vineyard', 'doctrina': 'teaching, doctrine', 'Baptista': 'the Baptist',
 'credo': 'believe, trust', 'sermo': 'word, speech, saying', 'fructus': 'fruit', 'clamo': 'cry out, shout',
 'converto': 'turn, turn back', 'paenitentia': 'repentance', 'scandalizo': 'cause to stumble, offend',
 'modicus': 'a little; a little while', 'plebs': 'the people, common people', 'debeo': 'owe; ought',
 'procedo': 'go forth, proceed', 'tempto': 'test, tempt', 'dignus': 'worthy', 'virtus': 'power, mighty work; virtue',
 'opus': 'work; need', 'quam': 'than; how', 'iste': 'this, that (one)', 'vero': 'but, indeed, truly',
 'salvus': 'saved, safe', 'mandatum': 'commandment, command', 'ago': 'do, drive, lead', 'vel': 'or',
 'forte': 'perhaps, by chance', 'longe': 'far, far off', 'sanctus': 'holy', 'affero': 'bring',
 'curo': 'heal, cure; take care of', 'scriptura': 'scripture, writing', 'magister': 'teacher, master',
 'gens': 'nation, people; the Gentiles', 'adversus': 'against', 'circa': 'around, about', 'summus': 'highest, chief',
 'deus': 'God, a god', 'homo': 'man, human being', 'habeo': 'have, hold', 'facio': 'make, do',
 'tollo': 'lift, take up, take away', 'dimitto': 'send away, let go; forgive', 'quaero': 'seek, ask',
 'sedeo': 'sit', 'princeps': 'chief, leader, ruler', 'iam': 'now, already', 'vita': 'life', 'populus': 'people',
 'pontifex': 'high priest', 'primum': 'first, at first', 'tantum': 'only; so much', 'modo': 'now, just now; only',
 'met': '-self (emphatic suffix)', 'quidem': 'indeed, certainly', 'nonne': 'not? (expects "yes")',
 'numquid': 'surely not? (expects "no")', 'an': 'or; whether', 'quo': 'where (to), whither',
 'occido': 'kill', 'congrego': 'gather together', 'appr(eh)endo': 'seize, take hold of', 'statim': 'immediately',
 'ceterus': 'the rest, the other', 'munus': 'gift, offering', 'permitto': 'permit, allow', 'attendo': 'pay attention, beware',
 'mando': 'command, entrust', 'languor': 'sickness, weakness', 'inicio': 'throw in; lay (hands) on', 'secundus': 'second; following',
 'tantus': 'so great, so much', 'prudens': 'wise, prudent', 'valeo': 'be strong, be able; be well', 'seduco': 'lead astray',
 'diligo': 'love', 'impleo': 'fill, fulfill', 'ostium': 'door', 'nubo': 'marry', 'suscito': 'raise up, rouse',
 'praeses': 'governor', 'pecunia': 'money, silver', 'unusquisque': 'each one, every one', 'invicem': 'one another, in turn',
}
GG = {'ὁ': 'the', 'ἄν': '(particle: -ever; would)', 'μέν': 'indeed (often untranslated; “on the one hand”)',
      'δέ': 'but, and', 'αὐτός': 'he, she, it; self; same', 'εἶπον': 'I said, spoke (aorist of λέγω)',
      'ὅστις': 'whoever, whatever', 'ἱερός': 'temple (τὸ ἱερόν)', 'ἵνα': 'in order that, so that',
      'οὖν': 'therefore, then', 'γάρ': 'for', 'τέ': 'and', 'κἀγώ': 'and I, I also', 'κἀκεῖνος': 'and he, that one also'}
def short(s, n=46):
    s = re.sub(r'\s*\[.*?\]', '', s or '').strip()
    if len(s) <= n: return s
    cut = s[:n]; k = max(cut.rfind(','), cut.rfind(';'))
    return (cut[:k] if k > 12 else cut).rstrip(' ,;')
def ggloss(i): return GG.get(G[i]['l']) or short(G[i]['b'])
def lgloss(i):
    lem = L[i]['l']
    if lem in LG: return LG[lem]
    g = L[i]['g']; first = re.split(r';', g)[0]
    return short(first)

# ---------- morphology -> structured attributes ----------
GPOS = {'N': 'noun', 'A': 'adj', 'T': 'art', 'V': 'verb', 'P': 'pron', 'R': 'pron', 'D': 'pron', 'F': 'pron',
        'S': 'pron', 'C': 'pron', 'K': 'pron', 'I': 'pron', 'X': 'pron', 'Q': 'pron'}
def gattrs(code):
    seg = code.split('-'); h = seg[0]; pos = GPOS.get(h)
    a = {'p': pos}
    if not pos: return None
    if h == 'V':
        m = re.match(r'^2?([PIFARL])([A-Z])([A-Z])$', seg[1] if len(seg) > 1 else '')
        if not m: return None
        a.update(t=m.group(1).lower(), v=m.group(2).lower(), m=m.group(3).lower())
        rest = seg[2] if len(seg) > 2 else ''
        if a['m'] == 'p' and len(rest) >= 3: a.update(c=rest[0].lower(), n=rest[1].lower(), g=rest[2].lower())
        elif rest[:1] in '123' and len(rest) >= 2: a.update(pe=rest[0], n=rest[1].lower())
        return a
    rest = seg[-1] if len(seg) > 1 else ''
    if h in 'PF' and rest[:1] in '123': rest = rest[1:]
    if len(rest) >= 2 and rest[0] in 'NGDAV':
        a.update(c=rest[0].lower(), n=rest[1].lower())
        if len(rest) >= 3 and rest[2] in 'MFN': a['g'] = rest[2].lower()
        return a
    return None
LPOS = {'N': 'noun', 'A': 'adj', 'P': 'pron', 'V': 'verb', 'M': 'num'}
def lattrs(pos, m):
    p = LPOS.get(pos[0]);
    if pos == 'Ne': p = None
    if not p or not m or len(m) < 10: return None
    a = {'p': p}
    pe, n, t, mo, vo, g, c = m[0], m[1], m[2], m[3], m[4], m[5], m[6]
    if p == 'verb':
        if t == '-' or mo == '-': return None
        a.update(t=t, m=mo, v=vo if vo in 'ap' else '')
        if pe in '123': a['pe'] = pe
        if n in 'sp': a['n'] = n
        if c != '-': a['c'] = c
        if g != '-': a['g'] = g
        return a
    if c == '-' or n not in 'sp': return None
    a.update(c=c, n=n)
    if g in 'mfn': a['g'] = g
    return a

def pack(a):  # compact string like "p=verb t=a v=a m=i pe=3 n=s"
    return ' '.join(f'{k}={v}' for k, v in a.items() if v)

out = {'g': {'lem': [], 'forms': []}, 'l': {'lem': [], 'forms': []}}
grank = [i for i, _ in gt.most_common() if not G[i]['l'][0].isupper() and G[i]['c'] not in ('Aramaic', 'Hebrew')][:NG]
lrank = [i for i, _ in lt.most_common() if L[i]['p'] != 'Ne' and not L[i]['l'][0].isupper()][:NL]
lidx = {i: k for k, i in enumerate(lrank)}
gidx = {i: k for k, i in enumerate(grank)}
for i in grank:
    p = pair(i)
    if p != -1 and p not in lidx: lidx[p] = len(lrank); lrank.append(p)
for k, i in enumerate(grank):
    p = pair(i)
    out['g']['lem'].append([G[i]['l'].replace(' (II)', '').replace(' (I)', ''), ggloss(i), G[i]['c'], gt[i],
                            lidx.get(p, -1) if p != -1 else -1])
for k, i in enumerate(lrank):
    out['l']['lem'].append([L[i]['l'], lgloss(i), L[i]['p'], lt[i]])
# forms: [lemma index, form, attrs, count, ref, snippet]
for i in grank:
    for (form, code), n in gforms[i].most_common():
        a = gattrs(code)
        if not a: continue
        ref, snip, _ = gex[(i, form, code)]
        out['g']['forms'].append([gidx[i], form, pack(a), n, ref, snip])
for i in lrank[:NL]:
    for (form, m), n in lforms[i].most_common():
        a = lattrs(L[i]['p'], m)
        if not a: continue
        ref, snip, _ = lex_[(i, form, m)]
        out['l']['forms'].append([lidx[i], form, pack(a), n, ref, snip])
json.dump(out, open(D + '/flash.json', 'w'), ensure_ascii=False, separators=(',', ':'))
pairs = sum(1 for x in out['g']['lem'] if x[4] >= 0)
print('greek lemmas', len(out['g']['lem']), 'forms', len(out['g']['forms']), 'pairs', pairs)
print('latin lemmas', len(out['l']['lem']), 'forms', len(out['l']['forms']))
missing = [(g, l) for g, l in OVR.items() if l and l not in LBY]
print('override Latin lemmas not found:', missing)
