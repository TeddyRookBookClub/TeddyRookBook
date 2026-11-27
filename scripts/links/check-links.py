#!/usr/bin/env python3
"""Check every link on the built site.

    python3 scripts/links/check-links.py public --report links-report.md

Internal links are checked against the files in the build. External links are requested once each
(HEAD, then a small GET if the server refuses HEAD), at most two at a time per host. YouTube videos
are checked through YouTube's oEmbed address, because a removed video's page still answers 200.

Results:  broken      404, 410, or the host name no longer exists
          failing     server errors and timeouts after three tries (may be temporary)
          unverified  the server refuses automated requests (401, 403, 429 and similar); not counted as broken

The script never fails the build: it writes a report and exits 0. Standard library only.
Used by .github/workflows/links.yml (weekly, and on demand).
"""
import argparse, collections, json, os, re, socket, ssl, sys, threading, time, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = 'Mozilla/5.0 (compatible; TeddyRookBook-linkcheck/1.0; +https://teddyrookbook.com/)'
ATTR = re.compile(r'''(?<![-\w])(?:href|src)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))''')
SKIP_SCHEMES = ('#', 'mailto:', 'tel:', 'javascript:', 'data:', 'blob:', 'sms:')
SKIP_HOSTS = {'localhost', '127.0.0.1', 'example.com', 'www.example.com', 'example.org'}


def collect(root, origins):
    ext, missing = collections.defaultdict(set), collections.defaultdict(set)
    pages = 0
    for d, _, files in os.walk(root):
        for f in files:
            if not f.endswith('.html'):
                continue
            p = os.path.join(d, f); rel = os.path.relpath(p, root).replace(os.sep, '/'); pages += 1
            s = open(p, encoding='utf-8', errors='ignore').read()
            s = re.sub(r'<script\b.*?</script>', '', s, flags=re.S)
            s = re.sub(r'<(pre|code)\b.*?</\1>', '', s, flags=re.S)      # addresses shown as examples are not links
            for m in ATTR.finditer(s):
                u = (m.group(1) or m.group(2) or m.group(3) or '').replace('&amp;', '&').strip()
                if not u or u.startswith(SKIP_SCHEMES) or '\\' in u or '{' in u or ' ' in u:
                    continue
                if u.startswith('//'):
                    u = 'https:' + u
                for o in origins:
                    if u.startswith(o):
                        u = '/' + u[len(o):].lstrip('/')
                if u.startswith(('http://', 'https://')):
                    if urllib.parse.urlsplit(u).hostname not in SKIP_HOSTS:
                        ext[u.split('#')[0]].add(rel)
                    continue
                if ':' in u.split('/')[0]:
                    continue
                path = urllib.parse.unquote(urllib.parse.urlsplit(urllib.parse.urljoin('/' + rel, u)).path)
                fp = os.path.join(root, path.lstrip('/'))
                if os.path.isdir(fp):
                    fp = os.path.join(fp, 'index.html')
                if not os.path.exists(fp):
                    missing[path].add(rel)
    return pages, ext, missing


def target(u):
    """The address actually requested for a link."""
    p = urllib.parse.urlsplit(u); h = (p.hostname or '').lower()
    if h in ('www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com') and (
            '/watch' in p.path or h == 'youtu.be' or '/embed/' in p.path or '/shorts/' in p.path):
        vid = urllib.parse.parse_qs(p.query).get('v', [''])[0] or p.path.rstrip('/').split('/')[-1]
        return 'https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote('https://www.youtube.com/watch?v=' + vid, safe='')
    return u


def fetch(u, method, timeout):
    q = urllib.parse.urlsplit(u)
    u = urllib.parse.urlunsplit((q.scheme, q.netloc, urllib.parse.quote(q.path, safe="/%:@!$&'()*+,;=~-._"), urllib.parse.quote(q.query, safe="=&%:@!$'()*+,;/?~-._"), ''))
    req = urllib.request.Request(u, method=method, headers={'User-Agent': UA, 'Accept': '*/*', 'Accept-Language': 'en'})
    if method == 'GET':
        req.add_header('Range', 'bytes=0-2047')
    with urllib.request.urlopen(req, timeout=timeout) as r:
        if method == 'GET':
            r.read(2048)
        return r.status


def check(u, locks, timeout):
    t = target(u); host = urllib.parse.urlsplit(t).hostname or ''
    last = 'error'
    for attempt in range(3):
        with locks[host]:
            time.sleep(0.15)
            for method in ('HEAD', 'GET'):
                try:
                    code = fetch(t, method, timeout)
                    return ('ok', code)
                except urllib.error.HTTPError as e:
                    code = e.code
                    if method == 'HEAD' and code in (400, 403, 404, 405, 406, 410, 429, 500, 501, 503):
                        continue                                  # many servers answer HEAD wrongly; ask again with GET
                    if code in (404, 410):
                        return ('broken', code)
                    if t is not u and code in (400, 401, 403):
                        return ('broken', 'video removed or private') if code != 403 else ('unverified', code)
                    if code in (401, 402, 403, 406, 429, 451, 999) or 300 <= code < 400:
                        return ('unverified', code)
                    last = code; break
                except urllib.error.URLError as e:
                    r = e.reason
                    if isinstance(r, socket.gaierror):
                        last = 'host name not found'
                    elif isinstance(r, ssl.SSLError):
                        last = 'certificate or TLS error'
                    else:
                        last = 'no answer (%s)' % (getattr(r, 'strerror', None) or type(r).__name__)
                    break
                except (socket.timeout, TimeoutError):
                    last = 'timed out'; break
                except Exception as e:                            # a malformed address or reply
                    last = type(e).__name__; break
        time.sleep(4 * (attempt + 1))
    return ('broken' if last == 'host name not found' else 'failing', last)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('root'); ap.add_argument('--report', default='links-report.md'); ap.add_argument('--json')
    ap.add_argument('--origin', action='append', default=['https://teddyrookbook.com/', 'http://teddyrookbook.com/', 'https://www.teddyrookbook.com/'])
    ap.add_argument('--only-host', action='append', help='check external links on these hosts only (for testing)')
    ap.add_argument('--workers', type=int, default=24); ap.add_argument('--timeout', type=int, default=25)
    a = ap.parse_args()
    pages, ext, missing = collect(a.root, a.origin)
    urls = sorted(ext)
    if a.only_host:
        urls = [u for u in urls if urllib.parse.urlsplit(u).hostname in a.only_host]
    locks = collections.defaultdict(lambda: threading.BoundedSemaphore(2))
    for u in urls:
        locks[urllib.parse.urlsplit(target(u)).hostname or '']                 # create before the threads start
    res = {}
    t0 = time.time()
    with ThreadPoolExecutor(a.workers) as ex:
        for u, r in zip(urls, ex.map(lambda x: check(x, locks, a.timeout), urls)):
            res[u] = r
    by = collections.defaultdict(list)
    for u, (kind, why) in res.items():
        by[kind].append((u, why))
    L = []
    L.append('# Link check')
    L.append('')
    L.append('%d pages. %d external links checked in %d minutes: **%d work, %d broken, %d failing, %d could not be verified.** Internal links missing: **%d**.' % (
        pages, len(urls), round((time.time() - t0) / 60), len(by['ok']), len(by['broken']), len(by['failing']), len(by['unverified']), len(missing)))

    def table(title, rows, note):
        if not rows:
            return
        L.extend(['', '## ' + title, '', note, '', '| Link | Result | On page |', '|---|---|---|'])
        for u, why in sorted(rows)[:400]:
            src = sorted(ext.get(u) or missing.get(u) or [])
            L.append('| %s | %s | %s%s |' % (u.replace('|', '%7C'), why, src[0] if src else '', ' and %d more' % (len(src) - 1) if len(src) > 1 else ''))
        if len(rows) > 400:
            L.append('| … and %d more | | |' % (len(rows) - 400))
    table('Broken', by['broken'], 'The page is gone (404 or 410), the video was removed, or the host name no longer exists.')
    table('Missing internal links', [(p, 'no such file') for p in missing], 'A link to a page or file of this site that is not in the build.')
    table('Failing', by['failing'], 'Server errors or no answer after three tries. These are often temporary; look at any that appear two weeks running.')
    if by['unverified']:
        hosts = collections.Counter(urllib.parse.urlsplit(u).hostname for u, _ in by['unverified'])
        L.extend(['', '## Could not be verified', '', 'These sites refuse automated requests, so their links were not judged: ' +
                  ', '.join('%s (%d)' % hc for hc in hosts.most_common(60)) + ('.' if len(hosts) <= 60 else ', and %d more hosts.' % (len(hosts) - 60))])
    open(a.report, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    if a.json:
        json.dump({'pages': pages, 'checked': len(urls), 'broken': len(by['broken']) + len(missing), 'failing': len(by['failing']), 'unverified': len(by['unverified'])}, open(a.json, 'w'))
    print(L[2])


if __name__ == '__main__':
    main()
