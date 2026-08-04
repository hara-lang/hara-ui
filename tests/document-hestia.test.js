import test from "node:test";
import assert from "node:assert/strict";
import {
  createArtefactBlock,
  createArtefactCommitOperation,
  createDocument,
  createOperationBatch
} from "../document-model.js";
import { createHestiaDocumentClient, prepareHestiaBatch } from "../document-hestia.js";

test("enriches artefact commits with stable node and source text ids", () => {
  const artefact = createArtefactBlock({ source: "(+ 40 2)" });
  const document = createDocument({ blocks: [artefact] });
  const operation = createArtefactCommitOperation({
    documentId: document.id,
    artefactId: artefact.attrs.artefactId,
    sourceRoot: "source-root",
    resultRoot: "result-root"
  });
  const batch = createOperationBatch(document, [operation]);
  const prepared = prepareHestiaBatch(document, batch);
  assert.equal(prepared.operations[0].artefactNodeId, artefact.id);
  assert.equal(prepared.operations[0].sourceTextId, artefact.children[0].id);
  assert.equal(batch.operations[0].artefactNodeId, undefined);
});

test("routes accepted and conflicting Hestia receipts", async () => {
  const artefact = createArtefactBlock();
  const document = createDocument({ blocks: [artefact] });
  const operation = createArtefactCommitOperation({
    documentId: document.id,
    artefactId: artefact.attrs.artefactId,
    sourceRoot: "source-root",
    resultRoot: "result-root"
  });
  const batch = createOperationBatch(document, [operation]);
  const events = [];
  const accepted = createHestiaDocumentClient({
    submit: async () => ({ outcome: "accepted" }),
    onReceipt: () => events.push("accepted"),
    onConflict: () => events.push("conflict")
  });
  await accepted.submit(document, batch);

  const conflicting = createHestiaDocumentClient({
    submit: async () => ({ outcome: "conflict" }),
    onReceipt: () => events.push("accepted"),
    onConflict: () => events.push("conflict")
  });
  await conflicting.submit(document, batch);
  assert.deepEqual(events, ["accepted", "conflict"]);
});

test("rejects commits whose artefact no longer exists", () => {
  const artefact = createArtefactBlock();
  const document = createDocument({ blocks: [] });
  const batch = createOperationBatch(document, [createArtefactCommitOperation({
    documentId: document.id,
    artefactId: artefact.attrs.artefactId,
    sourceRoot: "source-root",
    resultRoot: "result-root"
  })]);
  assert.throws(() => prepareHestiaBatch(document, batch), /missing artefact/);
});
