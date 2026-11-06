#!/usr/bin/env python3
"""Check the links from the site into The Rhythm of Numbers paper (static/pdfs/The-Rhythm-of-Numbers-paper.pdf).

The paper page's contents (/connections/rhythm-of-numbers/paper/) and the main page's "Working on the open questions"
(/connections/rhythm-of-numbers/#open-questions) link to chapters and sections as ...paper.pdf#page=N. The page numbers
live in data/rhythm/paper_pages.yaml. This script re-derives every one of them from the PDF itself, with pdftotext
(poppler-utils):
  - a chapter starts on the page whose first line is "CHAPTER <n>" or "APPENDIX <X>";
  - a section starts on the first page, from its chapter's first page on, with a heading line "<n>.<m>  <Title>".
If pypdf is installed it also compares them with the PDF's own named destinations (chapter.15, section.15.2, ...);
a section's destination can sit at the foot of the page before its heading, so for sections that is only a note.
It also checks: the page count against data/rhythm/paper_pages.yaml and the paper page's pdf_size; each chapter title
in content/connections/rhythm-of-numbers/paper/_index.md against the PDF; and that every on-site link
(links: and site: in that file) to /connections/rhythm-of-numbers/... points at an id that exists in its layout.

Usage:  python3 scripts/rhythm/check-paper-links.py          check; exit 1 on any drift
        python3 scripts/rhythm/check-paper-links.py --fix    rewrite the page numbers in data/rhythm/paper_pages.yaml
Run it after every rebuild of the PDF.
"""
import glob, os, re, subprocess, sys, unicodedata

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PDF = os.path.join(ROOT, 'static/pdfs/The-Rhythm-of-Numbers-paper.pdf')
DATA = os.path.join(ROOT, 'data/rhythm/paper_pages.yaml')
CONTENT = os.path.join(ROOT, 'content/connections/rhythm-of-numbers/paper/_index.md')
LAYOUTS = {
    '/connections/rhythm-of-numbers/': 'layouts/connections/rhythm.html',
    '/connections/rhythm-of-numbers/fractals/': 'layouts/connections/rhythm-fractals.html',
    '/connections/rhythm-of-numbers/tree/': 'layouts/connections/rhythm-tree.html',
}
errors = []


def err(msg):
    errors.append(msg)
    print('FAIL', msg)


def read_data():
    """The small YAML file: 'pages: N' and two maps of "key": page."""
    out = {'chapters': {}, 'sections': {}}
    block = None
    for line in open(DATA, encoding='utf-8'):
        if line.startswith('#') or not line.strip():
            continue
        m = re.match(r'pages:\s*(\d+)', line)
        if m:
            out['pages'] = int(m.group(1)); continue
        m = re.match(r'(chapters|sections):\s*$', line)
        if m:
            block = m.group(1); continue
        m = re.match(r'\s+"([^"]+)":\s*(\d+)', line)
        if m and block:
            out[block][m.group(1)] = int(m.group(2))
    return out


def pdf_pages():
    txt = subprocess.run(['pdftotext', '-layout', PDF, '-'], capture_output=True, text=True, check=True).stdout
    pages = txt.split('\f')
    if pages and not pages[-1].strip():
        pages.pop()
    return pages


def norm(s):
    s = unicodedata.normalize('NFKD', s).lower()
    s = s.replace('π', 'pi').replace('pi2', 'pi')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def derive(pages):
    chapters, titles = {}, {}
    for i, p in enumerate(pages, start=1):
        lines = [l for l in p.split('\n') if l.strip()]
        if not lines:
            continue
        m = re.match(r'\s*(CHAPTER|APPENDIX)\s+([0-9A-Z]+)\s*$', lines[0])
        if m and m.group(2) not in chapters:
            chapters[m.group(2)] = i
            titles[m.group(2)] = lines[1].strip() if len(lines) > 1 else ''
    return chapters, titles


def find_section(pages, key, start):
    pat = re.compile(r'^\s*' + re.escape(key) + r'\s{2,}[A-Z][^.]{2,80}$')
    for i in range(start, len(pages) + 1):
        if any(pat.match(l) for l in pages[i - 1].split('\n')):
            return i
    return None


def named_dests():
    try:
        import pypdf
    except ImportError:
        print('note: pypdf not installed; skipping the named-destination cross-check')
        return None
    r = pypdf.PdfReader(PDF)
    out = {}
    for k, v in r.named_destinations.items():
        m = re.match(r'(chapter|appendix|section)\.(.+)$', k)
        if m:
            out[m.group(2)] = r.get_destination_page_number(v) + 1
    return out


def check_content(titles):
    text = open(CONTENT, encoding='utf-8').read()
    fm = text.split('\n---', 1)[0]
    m = re.search(r'pdf_size:\s*"(\d+) pages', fm)
    if m:
        yield ('pdf_size pages', int(m.group(1)))
    for line in fm.split('\n'):
        mm = re.match(r'\s*- \{ num: "([^"]+)",.*?\btitle: "([^"]+)"', line)
        if not mm:
            continue
        num, title = mm.group(1), mm.group(2)
        key = num.split('–')[0]
        if key in titles:
            want, got = norm(title), norm(titles[key])
            if num.startswith(('A', 'B', 'C')):
                pass  # the entry is "Appendices"; the PDF's first appendix is "Algorithms"
            elif not (want.startswith(got[:20]) or got.startswith(want[:20])):
                err('chapter %s title differs: page says %r, PDF says %r' % (num, title, titles[key]))
        else:
            err('chapter %s from the paper page was not found in the PDF' % num)
        for url in re.findall(r'(?:url|site): "([^"]+)"', line):
            check_anchor(url, 'chapter %s' % num)


ids_cache = {}


def check_anchor(url, where):
    path, _, frag = url.partition('#')
    if not frag or path not in LAYOUTS:
        return
    f = os.path.join(ROOT, LAYOUTS[path])
    if f not in ids_cache:
        # the layout and the connections partials it may include (layouts/_partials/connections/rhythm-*.html)
        files = [f] + sorted(glob.glob(os.path.join(ROOT, 'layouts/_partials/connections/rhythm-*.html')))
        ids_cache[f] = set(i for g in files for i in re.findall(r'\bid="([^"{}]+)"', open(g, encoding='utf-8').read()))
    if frag not in ids_cache[f]:
        err('%s links to %s, but %s has no id="%s"' % (where, url, LAYOUTS[path], frag))


def main():
    fix = '--fix' in sys.argv
    data = read_data()
    pages = pdf_pages()
    n = len(pages)
    print('PDF: %d pages' % n)
    chapters, titles = derive(pages)
    nd = named_dests()
    new = {'pages': n, 'chapters': {}, 'sections': {}}
    if data.get('pages') != n:
        err('page count: data says %s, PDF has %d' % (data.get('pages'), n))
    for key, page in data['chapters'].items():
        got = chapters.get(key)
        new['chapters'][key] = got if got else page
        if got != page:
            err('chapter %s: data says page %s, PDF has it on page %s' % (key, page, got))
        if nd is not None and got and nd.get(key) != got:
            err('chapter %s: text says page %s, named destination says %s' % (key, got, nd.get(key)))
    for key in sorted(set(chapters) - set(data['chapters'])):
        print('note: chapter %s (page %d) is in the PDF but not in the data' % (key, chapters[key]))
    for key, page in data['sections'].items():
        ch = key.split('.')[0]
        got = find_section(pages, key, chapters.get(ch, 1))
        new['sections'][key] = got if got else page
        if got != page:
            err('section %s: data says page %s, PDF has it on page %s' % (key, page, got))
        if nd is not None and got and nd.get(key) != got:
            # hyperref can place a section's anchor at the foot of the page before its heading; the text wins
            print('note: section %s heading is on page %s, its named destination on page %s' % (key, got, nd.get(key)))
    for what, val in check_content(titles):
        if val != n:
            err('%s: the paper page says %d, the PDF has %d' % (what, val, n))
    # on-site links from the main page's open questions (site: fields of its front matter)
    main = open(os.path.join(ROOT, 'content/connections/rhythm-of-numbers/_index.md'), encoding='utf-8').read()
    for url in re.findall(r'site: "([^"]+)"', main):
        check_anchor(url, 'the main page')
    if fix:
        body = open(DATA, encoding='utf-8').read()
        body = re.sub(r'(?m)^pages:\s*\d+', 'pages: %d' % n, body)
        for block in ('chapters', 'sections'):
            for key, page in new[block].items():
                body = re.sub(r'(?m)^(\s+"%s":\s*)\d+' % re.escape(key), lambda m: m.group(1) + str(page), body)
        open(DATA, 'w', encoding='utf-8').write(body)
        print('rewrote', DATA, '(check pdf_size in the paper page by hand if the page count changed)')
        return 0
    if errors:
        print('%d problem(s). After a PDF rebuild, run with --fix to update the page numbers.' % len(errors))
        return 1
    print('OK: %d chapters and %d sections match the PDF' % (len(data['chapters']), len(data['sections'])))
    return 0


if __name__ == '__main__':
    sys.exit(main())
