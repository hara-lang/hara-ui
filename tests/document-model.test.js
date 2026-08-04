import test from "node:test";
import assert from "node:assert/strict";
import {
  DOCUMENT_PROFILE,
  applyLocalBatch,
  artefactSource,
  createArtefactBlock,
  createArtefactCommitOperation,
  createDocument,
  createNodeInsertOperation,
  createOperationBatch,
  createTextBlock,
  createTextSpliceOperation,
  diffText,
  validateDocument
} from "../document-model.js";

test("creates a valid rich text document with first-class Hara artefacts", () => {
  const artefact = createArtefactBlock({
    kind: "view",
    title: "Status card",
    source: "[:article [:h1 \"Ready\"] ]"
  });
  const document = createDocument({
    title: "Quarterly review",
    blocks: [createTextBlock("heading", "Quarterly review", { level: 1 }), artefact]
  });
  assert.equal(document.profile, DOCUMENT_PROFILE);
  assert.equal(artefactSource(artefact), "[:article [:h1 \"Ready\"] ]");
  assert.deepEqual(validateDocument(document), []);
});

test("text diffs use Unicode scalar offsets", () => {
  assert.deepEqual(diffText("A😀B", "A😀 bright B"), {
    offset: 2,
    deleteCount: 0,
    insert: " bright "
  });
  assert.deepEqual(diffText("hello world", "hello Hara"), {
    offset: 6,
    deleteCount: 5,
    insert: "Hara"
  });
});

test("applies a local Hestia-compatible operation batch", () => {
  const paragraph = createTextBlock("paragraph", "Hello");
  let document = createDocument({ blocks: [paragraph] });
  const text = paragraph.children[0];
  const splice = createTextSpliceOperation({
    documentId: document.id,
    targetId: text.id,
    previous: "Hello",
    next: "Hello Hara",
    baseRevision: document.revision
  });
  const artefact = createArtefactBlock({ source: "(+ 40 2)" });
  const insert = createNodeInsertOperation({
    documentId: document.id,
    parentId: document.id,
    afterId: paragraph.id,
    node: artefact,
    baseRevision: document.revision
  });
  const batch = createOperationBatch(document, [splice, insert]);
  document = applyLocalBatch(document, batch);
  assert.equal(document.children[0].children[0].text, "Hello Hara");
  assert.equal(document.children[1].attrs.artefactId, artefact.attrs.artefactId);
});

test("commits an artefact snapshot without replacing its source", () => {
  const artefact = createArtefactBlock({ source: "(* 6 7)" });
  let document = createDocument({ blocks: [artefact] });
  const commit = createArtefactCommitOperation({
    documentId: document.id,
    artefactId: artefact.attrs.artefactId,
    sourceRoot: "source-root",
    resultRoot: "result-root",
    display: "42",
    baseRevision: document.revision
  });
  document = applyLocalBatch(document, createOperationBatch(document, [commit]));
  assert.equal(artefactSource(document.children[0]), "(* 6 7)");
  assert.equal(document.children[0].attrs.snapshotRoot, "result-root");
  assert.equal(document.children[0].attrs.snapshotDisplay, "42");
  assert.equal(document.children[0].attrs.mode, "snapshot");
});

test("rejects duplicate node ids and unsupported artefact kinds", () => {
  const paragraph = createTextBlock("paragraph", "one", {}, "same-id");
  const second = createTextBlock("paragraph", "two", {}, "same-id");
  const errors = validateDocument(createDocument({ blocks: [paragraph, second] }));
  assert.ok(errors.some((error) => error.includes("Duplicate node id")));
  assert.throws(() => createArtefactBlock({ kind: "unsafe-html" }), /Unsupported Hara artefact kind/);
});
