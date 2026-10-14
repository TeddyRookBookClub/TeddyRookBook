"""Helpers for reading the Study Companion PDF dump (all.json from dump.py)."""
import json, re, html, os, tempfile

# Scratch folder for the dump and the parsed pieces (outside the repository).
WORK = os.environ.get('JEROME_WORK') or os.path.join(tempfile.gettempdir(), 'jerome-work')
os.makedirs(WORK, exist_ok=True)

D = json.load(open(os.path.join(WORK, 'all.json')))
BLUE = (0.122, 0.306, 0.549); RED = (0.549, 0.169, 0.122); GOLD = (0.604, 0.455, 0.125)
GRAY = (0.373, 0.388, 0.408); INK = (0.114, 0.114, 0.122)


def col(s, c):
    v = s['c']
    return isinstance(v, list) and len(v) == 3 and all(abs(a - b) < 0.02 for a, b in zip(v, c))


def bold(s): return 'Bold' in s['f']
def ital(s): return 'Italic' in s['f']


def page(n):
    """Spans of page n without the running head and the page number."""
    p = D[str(n)]
    sp = [s for s in p['spans'] if 40 < s['y'] < 745]
    sp.sort(key=lambda s: (round(s['y'] / 2.0), s['x0']))
    return sp, p['lines'], p['rects']


def lines_of(spans, tol=2.2):
    """Group spans into text lines by their top y; returns list of lists sorted by x."""
    out = []
    for s in sorted(spans, key=lambda s: (s['y'], s['x0'])):
        for L in out:
            if abs(L[0]['y'] - s['y']) < tol:
                L.append(s); break
        else:
            out.append([s])
    for L in out: L.sort(key=lambda s: s['x0'])
    out.sort(key=lambda L: L[0]['y'])
    return out


def esc(t): return html.escape(t, quote=False)


def rich(spans, keep_bold=True, keep_ital=True):
    """Spans → HTML string with <b>/<i>, lines joined by spaces."""
    parts = []
    for L in lines_of(spans):
        line = ''; prev = None
        for s in L:
            t = s['t']
            if prev is not None and s['x0'] - prev['x1'] > 1.2 and not line.endswith(' ') and not t.startswith(' '):
                line += ' '
            b, i = keep_bold and bold(s), keep_ital and ital(s)
            core = t.strip(' '); lead = t[:len(t) - len(t.lstrip(' '))]; trail = t[len(t.rstrip(' ')):]
            if not core: line += ' '; prev = s; continue
            e = esc(core)
            if i: e = '<i>' + e + '</i>'
            if b: e = '<b>' + e + '</b>'
            line += (' ' if lead else '') + e + (' ' if trail else '')
            prev = s
        parts.append(line.strip())
    h = ' '.join(p for p in parts if p)
    h = re.sub(r'\s+', ' ', h)
    h = re.sub(r'</b>(\s*)<b>', r'\1', h); h = re.sub(r'</i>(\s*)<i>', r'\1', h)
    h = re.sub(r'</i></b>(\s*)<b><i>', r'\1', h)
    return h.strip()


def plain(spans):
    return re.sub(r'<[^>]+>', '', rich(spans)).replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')


GR = 'αβγδεζηθικλμνξοπρστυφχψωςἀἁἂἃἄἅἆἇὰάᾀᾁᾂᾃᾄᾅᾆᾇᾰᾱᾲᾳᾴᾶᾷἐἑἒἓἔἕὲέἠἡἢἣἤἥἦἧὴήᾐᾑᾒᾓᾔᾕᾖᾗῂῃῄῆῇἰἱἲἳἴἵἶἷὶίῐῑῒΐῖῗὀὁὂὃὄὅὸόὐὑὒὓὔὕὖὗὺύῠῡῢΰῦῧὠὡὢὣὤὥὦὧὼώᾠᾡᾢᾣᾤᾥᾦᾧῲῳῴῶῷῤῥϊϋΐΰ'
_TR = {'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'e', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o'}


def greek_slug(w):
    import unicodedata
    w = w.lower().replace('(', '').replace(')', '')
    out = ''; nfd = unicodedata.normalize('NFD', w)
    rough = '̔' in nfd[:3]
    base = ''.join(c for c in nfd if not unicodedata.combining(c))
    for a_, b_ in (('ου', 'ou'), ('αυ', 'au'), ('ευ', 'eu'), ('ηυ', 'eu'), ('υι', 'ui')):
        base = base.replace(a_, b_)
    for c in base:
        out += _TR.get(c, c if c.isascii() and c.isalnum() else '')
    if rough: out = 'h' + out
    out = out.replace('gg', 'ng').replace('gk', 'nk').replace('gx', 'nx').replace('gch', 'nch')
    return out


def latin_slug(w):
    import unicodedata
    base = ''.join(c for c in unicodedata.normalize('NFD', w.lower()) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '-', base).strip('-')
