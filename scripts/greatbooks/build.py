#!/usr/bin/env python3
"""Great Books Ladder: build the engine's files from the ladder's sources.  Format: /tmp/work_gbcore/FORMAT.md.

    python3 scripts/greatbooks/build.py            build everything (safe to run any time; output depends only on sources)
    python3 scripts/greatbooks/build.py --check    build into memory and report problems, writing nothing

Sources (edit these):
    data/greatbooks/rungs.yaml                     every rung (units and topics of all courses), in ladder order
    data/greatbooks/ideas.yaml                     our own idea index (keys used by rungs' ideas tags)
    data/greatbooks/courses.yaml                   the eras
    scripts/greatbooks/src/_common.js              helpers shared by every generator (H.mc, H.tf, H.T, ...)
    scripts/greatbooks/src/<topic id>/lesson.json  a rung's lesson: { paths: {young, full, deep}, questions, care?, sources }
    scripts/greatbooks/src/<topic id>/gen.js       its practice generator (body; G, H and ML in scope)
    scripts/greatbooks/src/<topic id>/viz.js|.css  its own visuals (optional; ML in scope)
    data/greatbooks/harvard_overrides.yaml         optional fixes to the Harvard Classics matching
Outputs (never edit by hand):
    data/greatbooks/topics/<course>.json, data/greatbooks/lessons/<course>.json,
    static/greatbooks/gen/<course>.js, static/greatbooks/viz/<course>.js and .css, data/greatbooks/harvard.json
"""
import json, os, re, sys, html, unicodedata, tempfile

import yaml

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(ROOT, 'data', 'greatbooks')
SRC = os.path.join(ROOT, 'scripts', 'greatbooks', 'src')
SG = os.path.join(ROOT, 'static', 'greatbooks')
CHECK = '--check' in sys.argv
problems = []


def err(msg):
    problems.append('ERROR ' + msg)


def warn(msg):
    problems.append('warn  ' + msg)


def load_yaml(p):
    with open(p, encoding='utf-8') as f:
        return yaml.safe_load(f)


def write(path, text):
    """write only when changed, atomically (several writers may run the build at once)"""
    if CHECK:
        return
    old = None
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            old = f.read()
    if old == text:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), prefix='.gbtmp-')
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        f.write(text)
    os.chmod(tmp, 0o644)
    os.replace(tmp, path)


def remove(path):
    if not CHECK and os.path.exists(path):
        os.remove(path)


def esc(s):
    return html.escape(str(s), quote=True)


# ------------------------------------------------------------------ sources
courses = load_yaml(os.path.join(D, 'courses.yaml'))
R = load_yaml(os.path.join(D, 'rungs.yaml'))
ideas = load_yaml(os.path.join(D, 'ideas.yaml'))
idea_keys = {i['key'] for i in ideas['ideas']}
course_keys = [c['key'] for c in courses]
units = R.get('units') or {}
rungs = R.get('rungs') or []
SLUG = re.compile(r'^[a-z0-9]+(-[a-z0-9]+)*$')

seen = set()
by_course = {k: [] for k in course_keys}
for r in rungs:
    rid = r.get('id', '')
    w = 'rungs.yaml ' + rid
    if rid in seen:
        err(w + ': duplicate id')
    seen.add(rid)
    ck, _, slug = rid.partition('.')
    if ck not in by_course:
        err(w + ': course ' + ck + ' is not in courses.yaml')
        continue
    if not SLUG.match(slug):
        err(w + ': slug must be lowercase words joined by hyphens')
    if r.get('unit') not in [u['key'] for u in units.get(ck, [])]:
        err(w + ': unit ' + str(r.get('unit')) + ' is not a unit of ' + ck)
    for f in ('title', 'short', 'author'):
        if not r.get(f):
            err(w + ': missing ' + f)
    for i in r.get('ideas') or []:
        if i not in idea_keys:
            err(w + ': idea ' + i + ' is not in ideas.yaml')
    if not r.get('ideas'):
        warn(w + ': no ideas tags')
    for p in r.get('prereqs') or []:
        if p not in seen:
            err(w + ': prerequisite ' + p + ' is not an earlier rung')
    for x in r.get('read') or []:
        if not (x.get('name') and x.get('url', '').startswith('http')):
            err(w + ': read entries need name and url')
    by_course[ck].append(r)

# ------------------------------------------------------------------ lessons
ALLOWED = {'p', 'h', 'key', 'why', 'mistake', 'note', 'list', 'table', 'ex', 'viz', 'quote', 'activity'}
PATHS = [('young', '🌱', 'For young readers', 'About ages 8 to 12. Read it together, or on your own.'),
         ('full', '📖', 'For teens and adults', 'The full lesson.'),
         ('deep', '🔭', 'Going deeper', 'Context, the big questions, and how later books answered.')]


def credit_line(q):
    tr = q.get('tr') or ''
    pub = ', '.join(str(x) for x in (q.get('ed'), q.get('year')) if x)
    s = esc(q['author']) + ', <cite>' + esc(q['work']) + '</cite>.'
    if tr:
        s += ' Translated by ' + esc(tr) + (' (' + esc(pub) + ')' if pub else '') + '.'
    elif pub:
        s += ' ' + esc(pub) + '.'
    s += ' <a href="' + esc(q['url']) + '" rel="noopener">' + esc(q.get('src') or 'Source') + '</a>.'
    if q.get('note'):
        s += ' <span class="gb-q-note">' + esc(q['note']) + '</span>'
    return s


def compile_block(b, w, viz_names):
    t = b.get('t')
    if t not in ALLOWED:
        err(w + ': unknown block type ' + str(t))
        return None
    if t == 'quote':
        for f in ('text', 'author', 'work', 'year', 'url', 'src'):
            if not b.get(f):
                err(w + ': quote needs ' + f)
                return None
        if 'tr' not in b:
            err(w + ': quote needs tr ("" for original English)')
        try:
            if int(str(b['year'])[:4]) >= 1931:
                err(w + ': quote from ' + str(b['year']) + ': only texts first published before 1931 (public domain in the U.S.)')
        except ValueError:
            err(w + ': quote year must start with a four-digit year')
        text = b['text'].strip()
        if not text.startswith('<p'):
            text = '<p>' + text + '</p>'
        return {'t': 'note', 'html': '<figure class="gb-quote"><blockquote>' + text + '</blockquote><figcaption>' + credit_line(b) + '</figcaption></figure>'}
    if t == 'activity':
        if not b.get('html'):
            err(w + ': activity needs html')
            return None
        body = b['html'].strip()
        if not body.startswith('<'):
            body = '<p>' + body + '</p>'
        lab = esc(b.get('title') or 'Try this')
        return {'t': 'note', 'html': '<div class="gb-act"><p class="gb-act-lab"><span aria-hidden="true">🧩</span> ' + lab + '</p>' + body + '</div>'}
    if t == 'viz' and b.get('name'):
        viz_names.append(b['name'])
    return {k: v for k, v in b.items()}


def quote_source(b):
    tr = b.get('tr') or ''
    name = b['author'] + ', ' + b['work'] + (', translated by ' + tr if tr else '') + ' (' + ', '.join(str(x) for x in (b.get('ed'), b.get('year')) if x) + '), ' + b.get('src', '')
    return {'name': name, 'url': b['url']}


def compile_lesson(rid, L, rung):
    w = 'src/' + rid + '/lesson.json'
    blocks, viz_names, srcs = [], [], []
    P = L.get('paths') or {}
    for k in P:
        if k not in ('young', 'full', 'deep'):
            err(w + ': unknown path ' + k + ' (use young, full, deep)')
    if not P.get('full'):
        err(w + ': the full path is required')
    present = [p for p in PATHS if P.get(p[0])]
    if L.get('care') or rung.get('care'):
        blocks.append({'t': 'note', 'html': '<p class="gb-care"><b>A note for parents:</b> ' + (L.get('care') or esc(rung['care'])) + '</p>'})
    if len(present) > 1:
        nav = ''.join('<li><a href="#path-' + k + '"><span aria-hidden="true">' + ic + '</span> ' + esc(lab) + '</a></li>' for k, ic, lab, _ in present)
        blocks.append({'t': 'note', 'html': '<nav class="gb-pathnav" aria-label="Choose a path"><p class="gb-pathnav-lab">Choose a path</p><ul>' + nav + '</ul></nav>'})
    for k, ic, lab, sub in present:
        blocks.append({'t': 'note', 'html': '<h2 class="gb-path-h gb-path-' + k + '" id="path-' + k + '"><span class="gb-path-ic" aria-hidden="true">' + ic + '</span> ' + esc(lab) + '</h2><p class="gb-path-sub">' + esc(sub) + '</p>'})
        for i, b in enumerate(P[k]):
            c = compile_block(b, w + ' ' + k + ' block ' + str(i + 1), viz_names)
            if c:
                blocks.append(c)
            if b.get('t') == 'quote' and b.get('url'):
                srcs.append(quote_source(b))
        if k == 'full':
            blocks.append({'t': 'try'})
    qs = L.get('questions') or []
    if len(qs) < 3:
        warn(w + ': fewer than 3 family discussion questions')
    if qs:
        blocks.append({'t': 'note', 'html': '<div class="gb-qs"><h2 class="gb-qs-h"><span aria-hidden="true">💬</span> Talk about it together</h2><ol>' + ''.join('<li>' + q + '</li>' for q in qs) + '</ol></div>'})
    sources = []
    seen_u = set()
    for s in srcs + (L.get('sources') or []):
        key = s.get('url') or s.get('name')
        if key in seen_u:
            continue
        seen_u.add(key)
        sources.append({k: v for k, v in s.items() if k in ('name', 'url')})
    if not sources:
        warn(w + ': no sources')
    out = {'blocks': blocks}
    if sources:
        out['sources'] = sources
    return out, viz_names


# ------------------------------------------------------------------ build per course
common_js = ''
cp = os.path.join(SRC, '_common.js')
if os.path.exists(cp):
    with open(cp, encoding='utf-8') as f:
        common_js = f.read()

def year_of(r):
    if r.get('year') is not None:
        return r['year']
    d = str(r.get('date') or '')
    m = re.search(r'(\d{1,4})', d)
    if not m:
        return None
    y = int(m.group(1))
    return -y if 'BC' in d[:m.end() + 4] or ' BC' in d else y


rungs_js = '  H.RUNGS = ' + json.dumps([{'id': r['id'], 'author': r.get('author', ''), 'title': r['title'], 'work': r.get('work', r['title']).split(' (')[0],
                                     'year': year_of(r), 'when': r.get('date', ''), 'vol': r.get('vol'), 'ideas': r.get('ideas') or []} for r in rungs], ensure_ascii=False) + ';\n'
rungs_js += '  H.IDEAS = ' + json.dumps({i['key']: i['name'] for i in ideas['ideas']}, ensure_ascii=False) + ';\n'

ready = {}
for c in courses:
    ck = c['key']
    rs = by_course[ck]
    topics, lessons, gens, vizjs, vizcss = [], {}, [], [], []
    for r in rs:
        rid = r['id']
        folder = os.path.join(SRC, rid)
        t = {'id': rid, 'slug': rid.split('.', 1)[1], 'unit': r['unit'], 'title': r['title'], 'short': r['short'],
             'prereqs': r.get('prereqs') or [], 'xp': r.get('xp', 3), 'viz': []}
        if r.get('trouble'):
            t['trouble'] = r['trouble']
        lp = os.path.join(folder, 'lesson.json')
        has_l = os.path.exists(lp)
        if has_l:
            try:
                with open(lp, encoding='utf-8') as f:
                    L = json.load(f)
                lesson, vn = compile_lesson(rid, L, r)
                lessons[rid] = lesson
                t['viz'] = sorted(set(vn))
            except json.JSONDecodeError as e:
                err('src/' + rid + '/lesson.json: not valid JSON: ' + str(e))
                has_l = False
        gp = os.path.join(folder, 'gen.js')
        has_g = os.path.exists(gp)
        if has_g:
            with open(gp, encoding='utf-8') as f:
                g = f.read()
            if ("'" + rid + "'") not in g and ('"' + rid + '"') not in g:
                err('src/' + rid + '/gen.js: does not register ' + rid + ' with its literal id')
            for other in re.findall(r"""H\.T\(\s*['"]([\w.-]+)['"]|G\(\s*['"]([\w.-]+)['"]""", g):
                o = other[0] or other[1]
                if o and o != rid:
                    err('src/' + rid + '/gen.js: registers ' + o + '; each gen.js registers only its own rung')
            gens.append('  /* ---- ' + rid + ' (scripts/greatbooks/src/' + rid + '/gen.js) ---- */\n  (function () {\n' + g.rstrip() + '\n  })();\n')
        for ext, bucket in (('js', vizjs), ('css', vizcss)):
            vp = os.path.join(folder, 'viz.' + ext)
            if os.path.exists(vp):
                with open(vp, encoding='utf-8') as f:
                    bucket.append((rid, f.read()))
        ready[rid] = has_l and has_g
        if (has_l and has_g) and r.get('soon'):
            warn('rungs.yaml ' + rid + ': built (lesson and generator) but still marked soon: true')
        if r.get('soon') is None and not (has_l and has_g):
            warn('rungs.yaml ' + rid + ': not marked soon, but ' + ('lesson' if not has_l else 'generator') + ' is missing')
        topics.append(t)
    if not rs:
        err('courses.yaml ' + ck + ': no rungs')
        continue
    used = {r['unit'] for r in rs}
    U = [{'key': u['key'], 'title': u['title'], 'blurb': u.get('blurb', '')} for u in units.get(ck, []) if u['key'] in used]
    for u in units.get(ck, []):
        if u['key'] not in used:
            warn('rungs.yaml units ' + ck + '/' + u['key'] + ': no rungs (left out)')
    write(os.path.join(D, 'topics', ck + '.json'), json.dumps({'course': ck, 'units': U, 'topics': topics}, ensure_ascii=False, indent=1) + '\n')
    lpath = os.path.join(D, 'lessons', ck + '.json')
    if lessons:
        write(lpath, json.dumps(lessons, ensure_ascii=False, indent=1) + '\n')
    else:
        remove(lpath)
    gpath = os.path.join(SG, 'gen', ck + '.js')
    if gens:
        head = ('/* GENERATED by scripts/greatbooks/build.py from scripts/greatbooks/src/_common.js and src/<topic id>/gen.js.\n'
                '   Do not edit: edit the sources and run python3 scripts/greatbooks/build.py.\n'
                '   Great Books Ladder, course ' + ck + ' (' + c['title'] + '): ' + str(len(gens)) + ' rung(s). */\n')
        body = head + "(function (ML) {\n  'use strict';\n  if (!ML || !ML.gen) return;\n  var G = ML.gen;\n" + common_js.rstrip() + '\n' + rungs_js + ''.join(gens) + "})(typeof window !== 'undefined' ? window.MathLadder : undefined);\n"
        write(gpath, body)
    else:
        remove(gpath)
    vpath = os.path.join(SG, 'viz', ck + '.js')
    if vizjs:
        parts = ''.join('  /* ---- ' + rid + ' (scripts/greatbooks/src/' + rid + '/viz.js) ---- */\n  try { (function () {\n' + s.rstrip() + '\n  })(); } catch (e) { if (W.console) console.error(e); }\n' for rid, s in vizjs)
        body = ('/* GENERATED by scripts/greatbooks/build.py from scripts/greatbooks/src/<topic id>/viz.js. Do not edit. */\n'
                "(function (W) {\n  'use strict';\n  var ML = W.MathLadder = W.MathLadder || {};\n  function boot() {\n    if (!ML.viz || !ML.viz.register) return false;\n" + parts + "    return true;\n  }\n  if (!boot() && W.document) W.document.addEventListener('DOMContentLoaded', boot);\n})(typeof window !== 'undefined' ? window : this);\n")
        write(vpath, body)
    else:
        remove(vpath)
    cpath = os.path.join(SG, 'viz', ck + '.css')
    if vizcss:
        write(cpath, '/* GENERATED by scripts/greatbooks/build.py from scripts/greatbooks/src/<topic id>/viz.css. Do not edit. */\n' + ''.join('/* ---- ' + rid + ' ---- */\n' + s.rstrip() + '\n' for rid, s in vizcss))
    else:
        remove(cpath)

# ------------------------------------------------------------------ Harvard Classics Daily
sys.path.insert(0, os.path.dirname(__file__))
import harvard  # noqa: E402
hc = harvard.build(rungs, ROOT, warn)
write(os.path.join(D, 'harvard.json'), json.dumps(hc, ensure_ascii=False, indent=1) + '\n')

# ------------------------------------------------------------------ report
n = len(rungs)
nr = sum(1 for v in ready.values() if v)
for p in problems:
    print(p)
print('greatbooks build: %d rungs in %d courses, %d built; %d Harvard Classics day links on %d rungs; %d error(s), %d warning(s)%s' % (
    n, len(courses), nr, sum(len(v) for v in hc.values()), len(hc), sum(p.startswith('ERROR') for p in problems),
    sum(p.startswith('warn') for p in problems), ' (check only: nothing written)' if CHECK else ''))
sys.exit(1 if any(p.startswith('ERROR') for p in problems) else 0)
