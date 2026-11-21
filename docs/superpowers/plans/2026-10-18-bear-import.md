# Direct Bear Import Implementation Plan

**Goal:** Import one selected Bear note with its title, formatting, and locally available images, without a manual export.

**Architecture:** Extend the existing loopback launcher with a same-origin, token-protected read-only Bear adapter. A searchable dialog imports a chosen note into a new project or an empty open project. Dropped Bear links use the same adapter. Markdown rendering uses the locally vendored Marked parser followed by the app sanitizer.

**Tech Stack:** Python standard library SQLite/HTTP, vanilla JavaScript, Marked.

- [x] Add `bear_import.py`: read-only SQLite queries; exclude deleted/encrypted/locked notes; resolve only selected-note attachments under Bear's attachment directory; return embedded supported images and explicit warnings.
- [x] Update `start.py`: restricted loopback Host/Origin checks, session token and bounded JSON POST endpoints; preserve static serving and launcher behavior.
- [x] Add `bear-import.js` and dialog UI: search, select, import with title extraction, GFM formatting/checklists, and image embedding; allow whole-note Bear link drops; explain launcher requirement for file-based sessions.
- [x] Extend sanitizer/CSS for headings, tables, code, and strikethrough; update local help.
- [x] Verify with synthetic SQLite fixtures: title/content/image attachment mapping, missing files, locked/trash exclusion, traversal rejection, source database remains unchanged, API rejects other origins and missing tokens.
- [x] Verify browser flow: search -> choose -> import -> rendered title/headings/lists/images; close/reopen persists data; empty-note and existing-note destinations behave correctly. Run existing regression tests and Python tests.

No Git repository is present, so commits/worktrees do not apply. Execute inline within the user's existing authorization.
