ArchiveWatcher

This is the client-side defense prototyped and described in "Rewriting History:
Changing the Archived Web from the Present", by Ada Lerner, Tadayoshi Kohno,
and Franziska Roesner, which was presented at ACM CCS 2017 in Dallas, Texas,
USA. That paper can be found at:

https://rewritinghistory.cs.washington.edu

This is a Chrome extension which can be loaded as an unpacked extension via `chrome://extensions`. To do so, turn on Developer Mode by checking the box at the top of the page, then click "Load Unpacked Extension..." and select the folder where you cloned this repository.

The extension adds a button to the upper right corner of Chrome which, when clicked, will allow you to toggle blocking of archive-escapes, and will display stats about requests on the current page and globally across all browsing in your session.
