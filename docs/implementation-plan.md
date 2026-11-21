# Project Canvas first draft

Build a local, buildless HTML app: `index.html`, `styles.css`, `app.js`. Each card is one project. Keep the supplied pastel-card design, replace landscape with a selectable solid background.

1. Build the shell, sidebar collection/folders, canvas, cards, reading/editor panel, and responsive layout.
2. Store each project's title, subtitle, rich HTML note, color, folder, timestamps, canvas position, dimensions, minimized state, and archive state. Save to IndexedDB with visible save/error feedback.
3. Implement creation, editing, images, dragging, resizing, minimizing, restoring, deletion with undo, z-order, tidy layout, grid reordering, search, folders, archive, and zoom/fit.
4. Add versioned JSON backup/export and validated import. Sanitize imported/pasted rich text. Include clearly marked sample projects and instructions.
5. Verify the app in a browser at desktop/mobile sizes; exercise edit/save/reload, card lifecycle, geometry changes, folders, search, and backup round trip. Compare the implementation to the visual reference.

No build tools, accounts, cloud service, or installation required. Open index.html directly or serve this directory over HTTP.
