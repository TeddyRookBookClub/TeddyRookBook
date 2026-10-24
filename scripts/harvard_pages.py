#!/usr/bin/env python3
"""Harvard Classics, fifteen minutes a day: writes one small content file per day of the Reading Guide (1930 edition).

    python3 scripts/harvard_pages.py [path/to/guide.json]

Reads data/harvard/guide.json (the guide's days, titles and assignments) and writes
content/harvard-classics/days/MM-DD.md for every day in it (front matter only: the page
template, layouts/harvard-classics/single.html, reads the text from data/harvard/days/MM-DD.json).
Files for days no longer in the guide are removed. Run it again whenever guide.json changes
(a title, an assignment, or February 29).

The day pages are real files (not a content adapter) so the Lesson Planner's `section:` course
kind can list them by weight, one session per day.
"""
import json, os, sys

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
CUM = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]  # days before each month in a leap year


def q(s):
    return json.dumps(s, ensure_ascii=False)  # a JSON string is a valid YAML string


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SITE, 'data', 'harvard', 'guide.json')
    guide = json.load(open(src, encoding='utf-8'))
    out = os.path.join(SITE, 'content', 'harvard-classics', 'days')
    os.makedirs(out, exist_ok=True)
    keep = set()
    for d in guide['days']:
        m, n = int(d['month']), int(d['day'])
        did = d.get('id') or f'{m:02d}-{n:02d}'
        slug = d.get('slug') or f'{MONTHS[m - 1].lower()}-{n}'
        date = f'{MONTHS[m - 1]} {n}'
        title = ' '.join(str(d.get('title') or '').split()) or 'Reading'
        reads = []
        for r in d.get('readings') or []:
            bit = ', '.join(x for x in (r.get('author'), r.get('work')) if x)
            if r.get('volume'):
                bit += f" (Volume {r['volume']}, pages {r.get('start')}–{r.get('end')})"
            reads.append(bit)
        desc = f'The Harvard Classics reading for {date}'
        desc += (': ' + ' and '.join(reads)) if reads else ''
        desc += ', with the introduction from the 1930 Reading Guide. Fifteen minutes a day.'
        fm = ['---',
              f'title: {q(date + ": " + title)}',
              f'linkTitle: {q(date)}',
              f'description: {q(desc)}',
              f'url: /harvard-classics/{slug}/',
              f'weight: {CUM[m - 1] + n}',
              f'hcid: {q(did)}',
              'outputs: [html, json]',
              '---', '']
        name = did + '.md'
        keep.add(name)
        path = os.path.join(out, name)
        text = '\n'.join(fm)
        old = open(path, encoding='utf-8').read() if os.path.exists(path) else None
        if old != text:
            open(path, 'w', encoding='utf-8').write(text)
    gone = [f for f in os.listdir(out) if f.endswith('.md') and f != '_index.md' and f not in keep]
    for f in gone:
        os.remove(os.path.join(out, f))
    print(f'{len(keep)} day pages in {out}' + (f'; removed {len(gone)}' if gone else ''))


if __name__ == '__main__':
    main()
