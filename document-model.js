export const DOCUMENT_PROFILE = "greenways.rich-text/2";
export const ARTEFACT_NODE_TYPE = "hara-artefact";
export const TEXT_NODE_TYPE = "text";

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "bullet-list",
  "ordered-list",
  "list-item",
  "code-block",
  "horizontal-rule",
  ARTEFACT_NODE_TYPE
]);

const ARTEFACT_KINDS = new Set([
  "value",
  "view",
  "table",
  "chart",
  "canvas",
  "query",
  "agent",
  "custom"
]);

function fallbackUuid() {
  const time = Date.now().toString(16).padStart(12, "0");
  const random = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${time.slice(0, 8)}-${time.slice(8)}-7${random.slice(0, 3)}-${((8 + Math.random() * 4) | 0).toString(16)}${random.slice(3, 6)}-${random.slice(6, 18)}`;
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() || fallbackUuid();
}

export function createTextNode(text = "", id = createId()) {
  return { id, type: TEXT_NODE_TYPE, text: String(text), marks: [] };
}

export function createTextBlock(type = "paragraph", text = "", attrs = {}, id = createId()) {
  if (!BLOCK_TYPES.has(type) || type === ARTEFACT_NODE_TYPE) throw new Error(`Unsupported text block type: ${type}`);
  return {
    id,
    type,
    attrs: type === "heading" ? { level: 1, ...attrs } : { ...attrs },
    children: [createTextNode(text)]
  };
}

export function createArtefactBlock({
  id = createId(),
  artefactId = createId(),
  sourceId = createId(),
  kind = "value",
  title = "Hara artefact",
  source = "42",
  mode = "live",
  entry = null,
  capabilities = ["studio/eval"],
  snapshotRoot = null,
  snapshotDisplay = null,
  metadata = {}
} = {}) {
  if (!ARTEFACT_KINDS.has(kind)) throw new Error(`Unsupported Hara artefact kind: ${kind}`);
  if (mode !== "live" && mode !== "snapshot") throw new Error(`Unsupported Hara artefact mode: ${mode}`);
  return {
    id,
    type: ARTEFACT_NODE_TYPE,
    attrs: {
      artefactId,
      kind,
      title,
      mode,
      entry,
      capabilities: [...new Set(capabilities.map(String))].sort(),
      snapshotRoot,
      snapshotDisplay,
      metadata: { ...metadata }
    },
    children: [createTextNode(source, sourceId)]
  };
}

export function createDocument({
  id = createId(),
  title = "Untitled document",
  blocks = null,
  revision = 0,
  metadata = {}
} = {}) {
  return {
    profile: DOCUMENT_PROFILE,
    id,
    title,
    revision,
    metadata: { ...metadata },
    children: blocks || [
      createTextBlock("heading", title, { level: 1 }),
      createTextBlock("paragraph", "Start writing…")
    ]
  };
}

export function cloneDocument(document) {
  return globalThis.structuredClone
    ? structuredClone(document)
    : JSON.parse(JSON.stringify(document));
}

export function walkDocument(document, visitor) {
  function visit(node, parent = null, index = -1) {
    visitor(node, parent, index);
    for (const [childIndex, child] of (node.children || []).entries()) visit(child, node, childIndex);
  }
  visit(document, null, -1);
}

export function findNode(document, id) {
  let found = null;
  walkDocument(document, (node, parent, index) => {
    if (!found && node.id === id) found = { node, parent, index };
  });
  return found;
}

export function artefactSourceNode(artefact) {
  if (artefact?.type !== ARTEFACT_NODE_TYPE) return null;
  return (artefact.children || []).find((child) => child.type === TEXT_NODE_TYPE) || null;
}

export function artefactSource(artefact) {
  return artefactSourceNode(artefact)?.text || "";
}

export function validateDocument(document) {
  const errors = [];
  const ids = new Set();
  if (document?.profile !== DOCUMENT_PROFILE) errors.push(`Expected profile ${DOCUMENT_PROFILE}`);
  if (!document?.id) errors.push("Document id is required");
  if (!Array.isArray(document?.children)) errors.push("Document children must be an array");

  walkDocument(document || {}, (node, parent) => {
    if (node === document) return;
    if (!node.id) errors.push(`Node of type ${node.type || "unknown"} is missing an id`);
    else if (ids.has(node.id)) errors.push(`Duplicate node id: ${node.id}`);
    else ids.add(node.id);

    if (node.type === TEXT_NODE_TYPE) {
      if (typeof node.text !== "string") errors.push(`Text node ${node.id} must contain a string`);
      if (!parent) errors.push(`Text node ${node.id} must have a parent`);
      return;
    }

    if (!BLOCK_TYPES.has(node.type)) errors.push(`Unsupported node type: ${node.type}`);
    if (!Array.isArray(node.children) && node.type !== "horizontal-rule") errors.push(`Node ${node.id} must contain children`);
    if (node.type === "heading" && (!Number.isInteger(node.attrs?.level) || node.attrs.level < 1 || node.attrs.level > 6)) {
      errors.push(`Heading ${node.id} must have a level from 1 to 6`);
    }
    if (node.type === ARTEFACT_NODE_TYPE) {
      if (!node.attrs?.artefactId) errors.push(`Artefact ${node.id} is missing artefactId`);
      if (!ARTEFACT_KINDS.has(node.attrs?.kind)) errors.push(`Artefact ${node.id} has unsupported kind ${node.attrs?.kind}`);
      if (!artefactSourceNode(node)) errors.push(`Artefact ${node.id} must have a source text child`);
    }
  });
  return errors;
}

export function diffText(previous, next) {
  const before = String(previous);
  const after = String(next);
  let prefix = 0;
  const limit = Math.min(before.length, after.length);
  while (prefix < limit && before[prefix] === after[prefix]) prefix += 1;
  let beforeSuffix = before.length;
  let afterSuffix = after.length;
  while (beforeSuffix > prefix && afterSuffix > prefix && before[beforeSuffix - 1] === after[afterSuffix - 1]) {
    beforeSuffix -= 1;
    afterSuffix -= 1;
  }
  return {
    offset: [...before.slice(0, prefix)].length,
    deleteCount: [...before.slice(prefix, beforeSuffix)].length,
    insert: after.slice(prefix, afterSuffix)
  };
}

export function createTextSpliceOperation({
  documentId,
  targetId,
  previous,
  next,
  baseRevision = 0,
  id = createId()
}) {
  const splice = diffText(previous, next);
  return {
    id,
    protocol: "gwdp/1",
    type: "text.splice",
    documentId,
    baseRevision,
    targetId,
    offset: splice.offset,
    deleteCount: splice.deleteCount,
    insert: splice.insert
  };
}

export function createNodeInsertOperation({
  documentId,
  parentId,
  node,
  beforeId = null,
  afterId = null,
  baseRevision = 0,
  id = createId()
}) {
  return {
    id,
    protocol: "gwdp/1",
    type: "node.insert",
    documentId,
    baseRevision,
    parentId,
    beforeId,
    afterId,
    node: cloneDocument(node)
  };
}

export function createNodeDeleteOperation({
  documentId,
  targetId,
  expectedRoot = null,
  baseRevision = 0,
  id = createId()
}) {
  return { id, protocol: "gwdp/1", type: "node.delete", documentId, baseRevision, targetId, expectedRoot };
}

export function createArtefactCommitOperation({
  documentId,
  artefactId,
  sourceRoot,
  resultRoot,
  display = null,
  mediaType = "application/vnd.hara.value+json",
  baseRevision = 0,
  id = createId()
}) {
  if (!sourceRoot || !resultRoot) throw new Error("Artefact commits require sourceRoot and resultRoot");
  return {
    id,
    protocol: "gwdp/1",
    type: "artefact.commit",
    documentId,
    baseRevision,
    artefactId,
    sourceRoot,
    resultRoot,
    display,
    mediaType
  };
}

export function createOperationBatch(document, operations, {
  id = createId(),
  author = "local",
  profileRoot = null,
  delegationRoot = null
} = {}) {
  if (!operations.length) throw new Error("A document operation batch cannot be empty");
  if (operations.length > 64) throw new Error("A document operation batch cannot contain more than 64 operations");
  return {
    id,
    protocol: "gwdp/1",
    type: "document.batch",
    documentId: document.id,
    baseRevision: document.revision || 0,
    author,
    profileRoot,
    delegationRoot,
    operations: operations.map((operation) => ({ ...operation }))
  };
}

export function applyLocalOperation(document, operation) {
  const next = cloneDocument(document);
  if (operation.type === "text.splice") {
    const target = findNode(next, operation.targetId)?.node;
    if (!target || target.type !== TEXT_NODE_TYPE) throw new Error(`Text target not found: ${operation.targetId}`);
    const characters = [...target.text];
    characters.splice(operation.offset, operation.deleteCount, ...[...operation.insert]);
    target.text = characters.join("");
  } else if (operation.type === "node.insert") {
    const parent = operation.parentId === next.id ? next : findNode(next, operation.parentId)?.node;
    if (!parent?.children) throw new Error(`Insert parent not found: ${operation.parentId}`);
    let index = parent.children.length;
    if (operation.beforeId) {
      const before = parent.children.findIndex((child) => child.id === operation.beforeId);
      if (before >= 0) index = before;
    } else if (operation.afterId) {
      const after = parent.children.findIndex((child) => child.id === operation.afterId);
      if (after >= 0) index = after + 1;
    }
    parent.children.splice(index, 0, cloneDocument(operation.node));
  } else if (operation.type === "node.delete") {
    const found = findNode(next, operation.targetId);
    if (!found?.parent?.children) throw new Error(`Delete target not found: ${operation.targetId}`);
    found.parent.children.splice(found.index, 1);
  } else if (operation.type === "artefact.commit") {
    let artefact = null;
    walkDocument(next, (node) => {
      if (node.type === ARTEFACT_NODE_TYPE && node.attrs?.artefactId === operation.artefactId) artefact = node;
    });
    if (!artefact) throw new Error(`Artefact not found: ${operation.artefactId}`);
    artefact.attrs.snapshotRoot = operation.resultRoot;
    artefact.attrs.snapshotDisplay = operation.display;
    artefact.attrs.snapshotMediaType = operation.mediaType;
    artefact.attrs.snapshotSourceRoot = operation.sourceRoot;
    artefact.attrs.mode = "snapshot";
  } else {
    throw new Error(`Unsupported local operation: ${operation.type}`);
  }
  next.revision = Math.max(next.revision || 0, operation.baseRevision || 0) + 1;
  return next;
}

export function applyLocalBatch(document, batch) {
  return batch.operations.reduce((current, operation) => applyLocalOperation(current, operation), document);
}
