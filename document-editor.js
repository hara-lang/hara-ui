import {
  ARTEFACT_NODE_TYPE,
  TEXT_NODE_TYPE,
  applyLocalBatch,
  artefactSource,
  artefactSourceNode,
  createArtefactBlock,
  createArtefactCommitOperation,
  createDocument,
  createNodeDeleteOperation,
  createNodeInsertOperation,
  createOperationBatch,
  createTextBlock,
  createTextSpliceOperation,
  findNode,
  validateDocument
} from "./document-model.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stableJson(value) {
  if (value == null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value));
  if (!globalThis.crypto?.subtle) {
    let hash = 2166136261;
    for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619);
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function directText(block) {
  return (block.children || []).filter((child) => child.type === TEXT_NODE_TYPE).map((child) => child.text).join("");
}

function resultDisplay(result) {
  if (result == null) return "nil";
  if (typeof result === "string") return result;
  if (typeof result.display === "string") return result.display;
  if (typeof result.value === "string") return result.value;
  return stableJson(result.value ?? result);
}

function normaliseResult(result) {
  if (result && typeof result === "object" && ("value" in result || "display" in result || "html" in result || "table" in result)) {
    return {
      display: resultDisplay(result),
      value: result.value ?? result.display ?? result,
      html: result.html || null,
      table: result.table || null,
      mediaType: result.mediaType || (result.html ? "text/html" : "application/vnd.hara.value+json"),
      revision: result.revision || null,
      root: result.root || null
    };
  }
  return {
    display: resultDisplay(result),
    value: result,
    html: null,
    table: null,
    mediaType: "application/vnd.hara.value+json",
    revision: null,
    root: null
  };
}

function createButton(label, action, title = label) {
  return `<button type="button" data-document-action="${action}" title="${escapeHtml(title)}">${escapeHtml(label)}</button>`;
}

function renderTable(rows) {
  if (!Array.isArray(rows) || !rows.length) return "";
  return `<div class="hara-artefact-table-wrap"><table class="hara-artefact-table"><tbody>${rows.map((row) => `<tr>${(Array.isArray(row) ? row : [row]).map((cell) => `<td>${escapeHtml(typeof cell === "object" ? stableJson(cell) : cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderResult(result, snapshotDisplay = null) {
  if (!result && snapshotDisplay == null) return '<div class="hara-artefact-empty">Run this artefact in the Hara kernel.</div>';
  if (!result) return `<pre class="hara-artefact-value">${escapeHtml(snapshotDisplay)}</pre>`;
  if (result.html) {
    const safeDocument = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; font-src data:"><style>html,body{margin:0;min-height:100%;font-family:system-ui,sans-serif}body{padding:16px;box-sizing:border-box}</style></head><body>${result.html}</body></html>`;
    return `<iframe class="hara-artefact-frame" sandbox="" referrerpolicy="no-referrer" srcdoc="${escapeHtml(safeDocument)}"></iframe>`;
  }
  if (result.table) return renderTable(result.table);
  return `<pre class="hara-artefact-value">${escapeHtml(result.display)}</pre>`;
}

function renderTextBlock(block, readOnly) {
  const tag = block.type === "heading" ? `h${block.attrs?.level || 1}`
    : block.type === "blockquote" ? "blockquote"
      : block.type === "code-block" ? "pre" : "p";
  const textNode = (block.children || []).find((child) => child.type === TEXT_NODE_TYPE);
  return `<${tag} class="hara-document-text hara-document-${block.type}" data-block-id="${block.id}" data-text-id="${textNode?.id || ""}" contenteditable="${readOnly ? "false" : "plaintext-only"}" spellcheck="true">${escapeHtml(textNode?.text || "")}</${tag}>`;
}

function renderArtefact(block, result, readOnly) {
  const attrs = block.attrs || {};
  const sourceNode = artefactSourceNode(block);
  const snapshot = attrs.snapshotRoot ? `<span class="hara-artefact-state snapshot">snapshot ${escapeHtml(String(attrs.snapshotRoot).slice(0, 10))}</span>` : '<span class="hara-artefact-state live">live</span>';
  return `<figure class="hara-document-artefact" data-block-id="${block.id}" data-artefact-id="${escapeHtml(attrs.artefactId)}">
    <header class="hara-artefact-header">
      <div><span class="hara-artefact-mark">H</span><div><strong>${escapeHtml(attrs.title || "Hara artefact")}</strong><small>${escapeHtml(attrs.kind || "value")} · HAL</small></div></div>
      <div>${snapshot}${readOnly ? "" : createButton("Remove", "delete-block", "Remove artefact from document")}</div>
    </header>
    <div class="hara-artefact-source-wrap">
      <label>Hara source</label>
      <textarea class="hara-artefact-source" data-text-id="${sourceNode?.id || ""}" spellcheck="false" ${readOnly ? "readonly" : ""}>${escapeHtml(sourceNode?.text || "")}</textarea>
    </div>
    <div class="hara-artefact-output" aria-live="polite">${renderResult(result, attrs.snapshotDisplay)}</div>
    <figcaption>
      <span>${escapeHtml((attrs.capabilities || []).join(" · ") || "studio/eval")}</span>
      ${readOnly ? "" : `<span>${createButton("Run live", "run-artefact")}${createButton("Commit snapshot", "commit-artefact", "Commit the current source and result roots through Hestia")}</span>`}
    </figcaption>
  </figure>`;
}

export function createHaraDocumentEditor(root, options = {}) {
  if (!root) throw new Error("A root element is required for the Hara document editor");

  let document = options.document || createDocument();
  let readOnly = Boolean(options.readOnly);
  let selectedBlockId = document.children[0]?.id || null;
  let destroyed = false;
  const liveResults = new Map();
  const errors = validateDocument(document);
  if (errors.length) throw new Error(`Invalid Hara document: ${errors.join("; ")}`);

  const evaluateArtefact = options.evaluateArtefact || (async ({ source }) => ({
    display: `Kernel adapter not connected\n\n${source}`,
    value: { source, status: "unconnected" }
  }));

  function emitBatch(operations, { render = true } = {}) {
    if (!operations.length) return null;
    const batch = createOperationBatch(document, operations, {
      author: options.author || "local",
      profileRoot: options.profileRoot || null,
      delegationRoot: options.delegationRoot || null
    });
    document = applyLocalBatch(document, batch);
    root.dispatchEvent(new CustomEvent("hara-document-batch", { detail: { batch, document } }));
    options.onBatch?.(batch, document);
    options.onChange?.(document, batch);
    if (render) renderEditor();
    return batch;
  }

  function insertBlock(block) {
    const currentIndex = document.children.findIndex((child) => child.id === selectedBlockId);
    const afterId = currentIndex >= 0 ? selectedBlockId : document.children.at(-1)?.id || null;
    emitBatch([createNodeInsertOperation({
      documentId: document.id,
      parentId: document.id,
      node: block,
      afterId,
      baseRevision: document.revision
    })]);
    selectedBlockId = block.id;
    queueMicrotask(() => root.querySelector(`[data-block-id="${block.id}"]`)?.focus());
  }

  function deleteBlock(blockId) {
    if (document.children.length <= 1) return;
    const index = document.children.findIndex((child) => child.id === blockId);
    emitBatch([createNodeDeleteOperation({
      documentId: document.id,
      targetId: blockId,
      baseRevision: document.revision
    })]);
    selectedBlockId = document.children[Math.max(0, index - 1)]?.id || document.children[0]?.id || null;
  }

  async function runArtefact(blockId) {
    const block = findNode(document, blockId)?.node;
    if (!block || block.type !== ARTEFACT_NODE_TYPE) return;
    const output = root.querySelector(`[data-block-id="${blockId}"] .hara-artefact-output`);
    const state = root.querySelector(`[data-block-id="${blockId}"] .hara-artefact-state`);
    if (output) output.innerHTML = '<div class="hara-artefact-running"><i></i>Evaluating in the Hara kernel…</div>';
    if (state) state.textContent = "running";
    try {
      const result = normaliseResult(await evaluateArtefact({
        document,
        artefact: block,
        source: artefactSource(block),
        namespace: block.attrs?.entry || options.namespace || "user"
      }));
      liveResults.set(block.attrs.artefactId, result);
      if (output) output.innerHTML = renderResult(result);
      if (state) state.textContent = result.revision ? `live · ${result.revision}` : "live";
      root.dispatchEvent(new CustomEvent("hara-artefact-result", { detail: { block, result } }));
      return result;
    } catch (error) {
      const result = { display: error.message || String(error), value: null, mediaType: "application/vnd.hara.error+json" };
      liveResults.set(block.attrs.artefactId, result);
      if (output) output.innerHTML = `<pre class="hara-artefact-error">${escapeHtml(result.display)}</pre>`;
      if (state) state.textContent = "error";
      return null;
    }
  }

  async function commitArtefact(blockId) {
    const block = findNode(document, blockId)?.node;
    if (!block || block.type !== ARTEFACT_NODE_TYPE) return;
    const result = liveResults.get(block.attrs.artefactId) || await runArtefact(blockId);
    if (!result) return;
    const sourceRoot = await sha256(artefactSource(block));
    const resultRoot = result.root || await sha256(stableJson({ value: result.value, mediaType: result.mediaType }));
    emitBatch([createArtefactCommitOperation({
      documentId: document.id,
      artefactId: block.attrs.artefactId,
      sourceRoot,
      resultRoot,
      display: result.display,
      mediaType: result.mediaType,
      baseRevision: document.revision
    })]);
  }

  function updateText(textId, previous, next) {
    if (previous === next) return;
    emitBatch([createTextSpliceOperation({
      documentId: document.id,
      targetId: textId,
      previous,
      next,
      baseRevision: document.revision
    })], { render: false });
  }

  function bindEvents() {
    root.querySelectorAll("[data-block-id]").forEach((element) => element.addEventListener("focusin", () => {
      selectedBlockId = element.dataset.blockId;
      root.querySelectorAll("[data-block-id]").forEach((candidate) => candidate.classList.toggle("selected", candidate === element));
    }));

    root.querySelectorAll(".hara-document-text").forEach((element) => {
      let previous = element.textContent || "";
      element.addEventListener("input", () => {
        const next = element.textContent || "";
        updateText(element.dataset.textId, previous, next);
        previous = next;
      });
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && element.tagName !== "PRE") {
          event.preventDefault();
          const block = createTextBlock("paragraph", "");
          insertBlock(block);
        }
      });
    });

    root.querySelectorAll(".hara-artefact-source").forEach((element) => {
      let previous = element.value;
      element.addEventListener("input", () => {
        updateText(element.dataset.textId, previous, element.value);
        previous = element.value;
        const block = element.closest("[data-artefact-id]");
        liveResults.delete(block?.dataset.artefactId);
        block?.querySelector(".hara-artefact-state")?.replaceChildren("edited");
      });
    });

    root.querySelectorAll("[data-document-action]").forEach((button) => button.addEventListener("click", () => {
      const action = button.dataset.documentAction;
      const block = button.closest("[data-block-id]");
      if (action === "insert-paragraph") insertBlock(createTextBlock("paragraph", ""));
      else if (action === "insert-heading") insertBlock(createTextBlock("heading", "Heading", { level: 2 }));
      else if (action === "insert-artefact") insertBlock(createArtefactBlock({
        kind: button.dataset.artefactKind || "value",
        title: button.dataset.artefactTitle || "Hara artefact",
        source: button.dataset.artefactSource || '(str "Hello from " "Hara")'
      }));
      else if (action === "delete-block" && block) deleteBlock(block.dataset.blockId);
      else if (action === "run-artefact" && block) runArtefact(block.dataset.blockId);
      else if (action === "commit-artefact" && block) commitArtefact(block.dataset.blockId);
    }));
  }

  function renderEditor() {
    if (destroyed) return;
    root.className = `${root.className.replace(/\bhara-document-editor\b/g, "").trim()} hara-document-editor`.trim();
    root.innerHTML = `<header class="hara-document-toolbar">
      <div><strong>Hara Documents</strong><span>${escapeHtml(document.title)} · revision ${document.revision}</span></div>
      ${readOnly ? "" : `<nav aria-label="Insert document block">
        ${createButton("Paragraph", "insert-paragraph")}
        ${createButton("Heading", "insert-heading")}
        <button type="button" data-document-action="insert-artefact" data-artefact-kind="value">Hara artefact</button>
      </nav>`}
    </header>
    <main class="hara-document-page" data-document-id="${document.id}">
      ${document.children.map((block) => block.type === ARTEFACT_NODE_TYPE
        ? renderArtefact(block, liveResults.get(block.attrs.artefactId), readOnly)
        : renderTextBlock(block, readOnly)).join("")}
    </main>
    <footer class="hara-document-footer"><span>${document.children.length} blocks</span><span>${escapeHtml(document.profile)} · Hestia OT</span></footer>`;
    bindEvents();
  }

  renderEditor();

  return {
    get document() { return document; },
    getDocument() { return document; },
    setDocument(nextDocument) {
      const nextErrors = validateDocument(nextDocument);
      if (nextErrors.length) throw new Error(`Invalid Hara document: ${nextErrors.join("; ")}`);
      document = nextDocument;
      selectedBlockId = document.children[0]?.id || null;
      liveResults.clear();
      renderEditor();
    },
    setReadOnly(value) {
      readOnly = Boolean(value);
      renderEditor();
    },
    insertArtefact(config = {}) {
      const block = createArtefactBlock(config);
      insertBlock(block);
      return block;
    },
    runArtefact,
    commitArtefact,
    focus() {
      root.querySelector(`[data-block-id="${selectedBlockId}"]`)?.focus();
    },
    destroy() {
      destroyed = true;
      root.replaceChildren();
      root.classList.remove("hara-document-editor");
    }
  };
}
