#!/usr/bin/env python3
"""Check Life Planner calendar files against RFC 5545: python3 scripts/lifeplan/check-ics.py FILE.ics ...
Parses each file with the icalendar package (pip install icalendar), then checks what calendars rely on:
CRLF line ends, lines folded at 75 octets, VERSION and PRODID, and a UID, DTSTAMP and DTSTART on every event,
unique UIDs, DTEND after DTSTART, and RRULE expansion with no error."""
import sys
from icalendar import Calendar

bad = 0
for fn in sys.argv[1:]:
    raw = open(fn, 'rb').read()
    errs = []
    if b'\n' in raw.replace(b'\r\n', b''):
        errs.append('a line ends without CRLF')
    for i, line in enumerate(raw.split(b'\r\n')):
        if len(line) > 75:
            errs.append('line %d is %d octets' % (i + 1, len(line)))
            break
    cal = Calendar.from_ical(raw.decode('utf-8'))
    if str(cal.get('VERSION')) != '2.0' or not cal.get('PRODID'):
        errs.append('VERSION or PRODID missing')
    uids, n, rules = set(), 0, 0
    for ev in cal.walk('VEVENT'):
        n += 1
        for k in ('UID', 'DTSTAMP', 'DTSTART'):
            if ev.get(k) is None:
                errs.append('event without ' + k)
        u = str(ev.get('UID'))
        if u in uids:
            errs.append('repeated UID ' + u)
        uids.add(u)
        s, e = ev.decoded('DTSTART'), ev.decoded('DTEND') if ev.get('DTEND') else None
        if e is not None and not e > s:
            errs.append('DTEND not after DTSTART in ' + u)
        if ev.get('RRULE'):
            rules += 1
            from dateutil.rrule import rrulestr
            rrulestr(ev.get('RRULE').to_ical().decode(), dtstart=s if hasattr(s, 'hour') else __import__('datetime').datetime(s.year, s.month, s.day))
    print('%s: %d events, %d with repeat rules, %s' % (fn, n, rules, 'OK' if not errs else 'ERRORS: ' + '; '.join(errs[:5])))
    bad += bool(errs)
sys.exit(1 if bad else 0)
