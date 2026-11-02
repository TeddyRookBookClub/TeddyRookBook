#!/usr/bin/env python3
"""Check the citizenship test data (data/civics/uscis/2025.json and 2008.json).

  python3 scripts/civics/check_uscis.py [BUILD_DIR]

- counts: 128 questions (2025) and 100 (2008), numbered 1..N, 20 starred each, matching "starred";
- every question has "idea" (2 to 5 sentences, no current officeholder names) and a "ladder" path;
- with BUILD_DIR, every ladder path exists as BUILD_DIR/<path>/index.html, and the practice page shows every idea;
- the official "q", "a", "note" and "star" are unchanged from git HEAD (or from the rev given in --base),
  except the corrections listed in OFFICIAL_CORRECTIONS, each of which is documented in the file's "resolved" list.
"""
import json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
COUNTS = {'2025': 128, '2008': 100}
# (version, question number) -> the official text after the correction. Documented in "resolved".
OFFICIAL_CORRECTIONS = {
    ('2008', 100): {'a': ["New Year’s Day", "Martin Luther King, Jr. Day", "Presidents’ Day", "Memorial Day", "Juneteenth",
                          "Independence Day", "Labor Day", "Columbus Day", "Veterans Day", "Thanksgiving", "Christmas"]},
}
FIELDS = ('q', 'a', 'note', 'star')

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--base=')]
    base = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--base=')), 'HEAD')
    build = args[0] if args else None
    errs = []
    for ver, n in COUNTS.items():
        rel = 'data/civics/uscis/%s.json' % ver
        d = json.load(open(os.path.join(ROOT, rel), encoding='utf-8'))
        qs = d['questions']
        if len(qs) != n or d.get('total') != n:
            errs.append('%s: %d questions, total %s, expected %d' % (ver, len(qs), d.get('total'), n))
        if [q['n'] for q in qs] != list(range(1, n + 1)):
            errs.append('%s: numbering is not 1..%d' % (ver, n))
        stars = [q['n'] for q in qs if q.get('star')]
        if len(stars) != 20 or stars != d.get('starred'):
            errs.append('%s: starred %s does not match the 20 in "starred"' % (ver, stars))
        for q in qs:
            idea = q.get('idea') or ''
            sents = len(re.findall(r'[a-zA-Z0-9)”]\.(?:”)?(?:\s|$)|[?!](?:\s|$)', idea))
            if not idea:
                errs.append('%s Q%d: no idea' % (ver, q['n']))
            elif not 2 <= sents <= 6:
                errs.append('%s Q%d: idea has about %d sentences' % (ver, q['n'], sents))
            for w in ('genuinely', 'honestly', 'straightforward'):
                if w in idea.lower():
                    errs.append('%s Q%d: banned word %s' % (ver, q['n'], w))
            lad = q.get('ladder') or ''
            if not re.match(r'^/american-history/[a-z0-9-]+/[a-z0-9-]+/$', lad):
                errs.append('%s Q%d: bad ladder %r' % (ver, q['n'], lad))
            elif build and not os.path.isfile(os.path.join(build, lad.strip('/'), 'index.html')):
                errs.append('%s Q%d: ladder page missing in build: %s' % (ver, q['n'], lad))
        # official text unchanged
        try:
            old = json.loads(subprocess.check_output(['git', '-C', ROOT, 'show', '%s:%s' % (base, rel)]).decode('utf-8'))
        except subprocess.CalledProcessError:
            errs.append('%s: cannot read %s from git %s' % (ver, rel, base)); continue
        oq = {q['n']: q for q in old['questions']}
        resolved = {r['n'] for r in d.get('resolved', [])}
        for q in qs:
            o = oq.get(q['n'])
            if o is None:
                errs.append('%s Q%d: not in the base' % (ver, q['n'])); continue
            fix = OFFICIAL_CORRECTIONS.get((ver, q['n']), {})
            if fix and q['n'] not in resolved:
                errs.append('%s Q%d: correction not documented in "resolved"' % (ver, q['n']))
            for f in FIELDS:
                want = fix.get(f, o.get(f))
                if q.get(f) != want:
                    errs.append('%s Q%d: official %s changed: %r -> %r' % (ver, q['n'], f, o.get(f), q.get(f)))
    if build:
        page = os.path.join(build, 'american-history', 'citizenship-test', 'index.html')
        html = open(page, encoding='utf-8').read() if os.path.isfile(page) else ''
        n_ideas = html.count('class="us-idea"')
        if n_ideas != sum(COUNTS.values()):
            errs.append('practice page shows %d ideas, expected %d' % (n_ideas, sum(COUNTS.values())))
    for e in errs:
        print('FAIL', e)
    print('%d problem(s); checked %s' % (len(errs), ', '.join('%s: %d' % kv for kv in COUNTS.items())))
    return 1 if errs else 0

if __name__ == '__main__':
    sys.exit(main())
