---
title: "{{ replace .Name "-" " " | title }}"
author: "Author Name"
description: ""      # one line for search results and link previews
pages: 300
year: 1900            # negative for BC, e.g. -350
country: ""           # country the book comes from
authorCountry: ""     # country the author comes from
genre: "Fiction"
editions: []         # each copy you own, e.g.
#  - set: "Harvard Classics"          # a name from data/sets.yaml links to that set
#    vol: "22"
#    detail: "Butcher and Lang translation"
#  - set: "Penguin Classics"
notes: ""            # shown in the Library's Notes column, e.g. "2 copies in different translations"
haveRead: false
owned: true          # do you own a copy?
format: ""          # Hardcover, Paperback, Ebook, Audiobook
shelf: ""           # where it lives, e.g. "Living room, shelf 2"
isbn: ""
publisher: ""
cover: ""           # optional image path, e.g. /img/covers/name.jpg
lastUpdated: "2026-05-20"
audiobook: ""          # e.g. "12h 45m" or "14h 30m"
links: []
---

# {{ replace .Name "-" " " | title }}

**Author Name • YEAR • PAGES pages**

## Key Quotes

> Add memorable passages here.

## My Notes & Reflections

Write your thoughts, themes you noticed, connections to other books, questions to revisit...

**Status:** 📖 To Read

**External Links**
- (Add YouTube, Spotify, Substack, etc. here when you have them)

---

*Created with the `book` archetype.*