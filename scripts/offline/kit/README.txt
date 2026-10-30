TEDDY ROOK BOOK: A COPY FOR YOUR COMPUTER
=========================================

This folder keeps the sections of teddyrookbook.com that you choose, so you can use them
without the internet. It works on Mac, Windows and Linux. There is nothing to install.

FIRST TIME
1. Double-click "Get or Update Sections".
   A list of sections appears, with their sizes. Type the numbers you want, then press Enter.
   They download into the "site" folder here.
2. Double-click "Start Teddy Rook Book".
   Your browser opens the site from this folder, at http://localhost:8317
   Keep the small window open while you use it. Close it to stop.

UPDATES
Double-click "Get or Update Sections" again and press Enter. Only the files that changed on
the website download, and files the site no longer uses are removed. You can also add or remove
sections there: type their numbers.

ON A MAC
The first time, macOS may say it cannot check the file. Right-click the file and choose Open.
If there is no Open button, go to System Settings > Privacy & Security, scroll down, and click
"Open Anyway". It uses Perl and curl, which come with macOS.

ON WINDOWS
If a blue "Windows protected your PC" box appears, click "More info", then "Run anyway".
It uses PowerShell, which comes with Windows 10 and 11.

ON LINUX
Run ./update.sh and then ./start.sh in this folder. It needs perl, curl and unzip.

GOOD TO KNOW
- Your saves (learner profiles, progress, planner notes) are kept by your browser for this copy,
  separately from the website. To move them, use My Progress: save to a file in one, load it
  in the other.
- Some things always need the internet: Markets, Free Books, Your Tax Receipt, YouTube videos,
  the recorded Greek Gospel readings, and links to other websites.
- The web fonts come from the internet. Without it, the pages use a similar font.
- You can move this whole folder, for example to a USB stick. Keep the folder structure as is.
- Advanced: "perl tools/trb.pl list" (Mac, Linux) or "tools\trb.ps1 list" (Windows) shows the
  section names; "update --add math,logic --remove music" changes sections without questions.
