'use strict';

// A preview can show one part of a scene while the image retains the entire sketch.
function drawingSelection(elements, ids) {
 const selected = new Set(ids);
 const frames = new Set(elements.filter(el => el.type === 'frame' && selected.has(el.id)).map(el => el.id));
 const included = new Set(elements.filter(el => selected.has(el.id) || frames.has(el.frameId)).map(el => el.id));
 return elements.filter(el => included.has(el.id) || included.has(el.containerId));
}

function openDrawing(image, insert) {
 const dialog = document.querySelector('#drawing-window');
 if (dialog.open) return;
 const save = dialog.querySelector('#drawing-save');
 const whole = dialog.querySelector('#drawing-whole');
 const selection = dialog.querySelector('#drawing-selection');
 const cancel = dialog.querySelector('#drawing-cancel');
 const status = dialog.querySelector('#drawing-status');
 const frame = document.createElement('iframe');
 frame.title = 'Excalidraw canvas';
 let saved;
 try {
  saved = image ? JSON.parse(image.dataset.drawing) : null;
  if (image && !Array.isArray(saved?.elements)) throw Error();
 } catch {
  toast('The editable drawing could not be read.');
  return;
 }
 let api, library, root, baseline, dirty = false, busy = false;
 const savedIds = saved?.previewIds;
 const wholeLabel = image ? 'Update preview' : 'Insert drawing';
 save.textContent = wholeLabel;
 whole.hidden = !savedIds;
 selection.textContent = image ? 'Update from selection' : 'Insert selection';
 save.disabled = whole.disabled = selection.disabled = true;
 cancel.disabled = false;
 status.textContent = 'Opening drawing…';

 function refresh(elements, state) {
  const version = library.getSceneVersion(elements) + ':' + state.viewBackgroundColor;
  if (baseline === undefined) baseline = version;
  dirty = version !== baseline;
  const live = elements.filter(el => !el.isDeleted);
  whole.disabled = busy || !live.length;
  save.disabled = whole.disabled || (savedIds && !drawingSelection(live, savedIds).length);
  selection.disabled = busy || !Object.keys(state.selectedElementIds).length;
 }

 function dismiss() {
  if (!busy && (!dirty || window.confirm('Discard changes to this drawing?'))) dialog.close();
 }
 cancel.onclick = dismiss;
 dialog.oncancel = event => { event.preventDefault(); dismiss(); };
 dialog.onclose = () => {
  if (dialog.open) return;
  root?.unmount();
  frame.remove();
  dialog.onclose = null;
 };

 async function finish(ids) {
  if (!api || busy) return;
  const elements = api.getSceneElements();
  const state = api.getAppState();
  const visible = ids ? drawingSelection(elements, ids) : elements;
  if (!visible.length) return;
  busy = true;
  save.disabled = whole.disabled = selection.disabled = cancel.disabled = true;
  status.textContent = 'Preparing preview…';
  try {
   const images = api.getFiles();
   const files = Object.fromEntries(elements.filter(el => el.fileId && images[el.fileId]).map(el => [el.fileId, images[el.fileId]]));
   const canvas = await library.exportToCanvas({
    elements: visible, files, appState: { ...state, exportBackground: true },
    getDimensions(width, height) {
     const scale = Math.min(2, 1600 / Math.max(width, height));
     return { width: Math.ceil(width * scale), height: Math.ceil(height * scale), scale };
    }
   });
   const scene = { elements, files, appState: { viewBackgroundColor: state.viewBackgroundColor }, previewIds: ids };
   const preview = canvas.toDataURL('image/png');
   // The note must be active before the browser can insert at its saved caret.
   dialog.close();
   if (!insert(preview, scene)) throw Error('The note could not accept the drawing.');
  } catch (error) {
   if (!dialog.open) dialog.showModal();
   status.textContent = error.message || 'Could not create the preview. Try again.';
   busy = false;
   cancel.disabled = false;
   refresh(elements, state);
  }
 }
 save.onclick = () => finish(savedIds || null);
 whole.onclick = () => finish(null);
 selection.onclick = () => finish(Object.keys(api.getAppState().selectedElementIds));

 frame.onload = () => {
  if (!dialog.open) return;
  const win = frame.contentWindow;
  try {
   library = win.ExcalidrawLib;
   const appState = { ...saved?.appState, selectedElementIds: Object.fromEntries((savedIds || []).map(id => [id, true])) };
   root = win.ReactDOM.createRoot(win.document.querySelector('#root'));
   root.render(win.React.createElement(library.Excalidraw, {
    langCode: 'en', validateEmbeddable: false,
    initialData: { elements: saved?.elements || [], files: saved?.files || {}, appState, scrollToContent: true },
    excalidrawAPI(instance) { api = instance; status.textContent = ''; },
    onChange: refresh,
    UIOptions: { canvasActions: { saveToActiveFile: false, loadScene: false } }
   }));
  } catch {
   status.textContent = 'Could not load Excalidraw. Close the drawing and try again.';
  }
 };
 frame.srcdoc = `<!doctype html><html lang="en"><meta charset="utf-8"><style>
 html,body,#root{height:100%;margin:0;overflow:hidden}</style><div id="root"></div>
 <script>window.EXCALIDRAW_ASSET_PATH=new URL('vendor/excalidraw/',document.baseURI).href;</script>
 <script src="vendor/excalidraw/react.js"></script><script src="vendor/excalidraw/react-dom.js"></script>
 <script src="vendor/excalidraw/excalidraw.production.min.js"></script></html>`;
 dialog.showModal();
 dialog.querySelector('#drawing-canvas').replaceChildren(frame);
}
