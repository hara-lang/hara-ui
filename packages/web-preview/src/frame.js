import { previewDocument } from "./hta.js";

const DEFAULT_SANDBOX = "";

function createFrame(documentRef, title, sandbox) {
  const frame = documentRef.createElement("iframe");
  frame.className = "hara-web-preview";
  frame.title = title;
  frame.setAttribute("sandbox", sandbox);
  frame.setAttribute("referrerpolicy", "no-referrer");
  return frame;
}

/**
 * Create a disposable sandboxed preview frame.
 *
 * The frame receives only `srcdoc`; privileged capabilities remain in the host
 * page and communicate through the runtime host-call boundary.
 */
export function createPreviewHost({
  container,
  documentRef = globalThis.document,
  title = "Hara preview",
  sandbox = DEFAULT_SANDBOX,
  theme = "system",
  viewport = null
} = {}) {
  if (!container || typeof container.append !== "function") {
    throw new TypeError("createPreviewHost requires a container element");
  }
  if (!documentRef?.createElement) throw new Error("A browser document is required");

  const frame = createFrame(documentRef, title, sandbox);
  let disposed = false;

  function assertActive() {
    if (disposed) throw new Error("Preview host disposed");
  }

  function setTheme(value) {
    assertActive();
    const next = ["light", "dark", "system"].includes(value) ? value : "system";
    frame.dataset.theme = next;
    frame.style.colorScheme = next === "system" ? "light dark" : next;
  }

  function setViewport(value) {
    assertActive();
    if (!value) {
      frame.style.removeProperty("width");
      frame.style.removeProperty("height");
      frame.dataset.viewport = "responsive";
      return;
    }
    const width = Number(value.width);
    const height = Number(value.height);
    if (Number.isFinite(width) && width > 0) frame.style.width = `${Math.round(width)}px`;
    if (Number.isFinite(height) && height > 0) frame.style.height = `${Math.round(height)}px`;
    frame.dataset.viewport = String(value.id || `${Math.round(width)}x${Math.round(height)}`);
  }

  function render(effect) {
    assertActive();
    frame.srcdoc = previewDocument(effect);
    return frame.srcdoc;
  }

  function renderDocument(source) {
    assertActive();
    frame.srcdoc = String(source || "");
    return frame.srcdoc;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    frame.srcdoc = "";
    frame.remove();
  }

  container.append(frame);
  setTheme(theme);
  setViewport(viewport);

  return Object.freeze({
    frame,
    render,
    renderDocument,
    setTheme,
    setViewport,
    dispose,
    get disposed() { return disposed; }
  });
}
