import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  HARA_DOCUMENT_COMPATIBILITY,
  describeHaraDocumentCompatibility,
  isLegacyHaraDocument,
} from "../document-compatibility.js";
import {
  createDocument,
} from "../document-model.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Hara UI exposes an inert Hodos 2D compatibility descriptor", () => {
  const document = createDocument({
    id: "document/compatibility",
    title: "Compatibility",
  });
  const descriptor = describeHaraDocumentCompatibility(document);

  assert.equal(isLegacyHaraDocument(document), true);
  assert.equal(descriptor.legacyProfile, "greenways.rich-text/2");
  assert.equal(descriptor.targetProfile, "hodos.rich-text/2");
  assert.equal(descriptor.componentId, "hodos.2d/document");
  assert.equal(descriptor.modelProjector, "@greenways/hodos-2d/compat/hara-document");
  assert.equal(descriptor.documentId, "document/compatibility");
  assert.equal(Object.isFrozen(HARA_DOCUMENT_COMPATIBILITY), true);
  assert.equal(Object.isFrozen(descriptor), true);
});

test("Hara UI retains compatibility exports without importing Hodos", async () => {
  const packageJson = JSON.parse(await read("../package.json"));
  for (const name of [
    "./document-model",
    "./document-editor",
    "./document.css",
    "./document-hestia",
    "./document-compatibility",
  ]) {
    assert.equal(Boolean(packageJson.exports[name]), true, `missing compatibility export ${name}`);
  }

  const sources = await Promise.all([
    read("../document-model.js"),
    read("../document-editor.js"),
    read("../document-hestia.js"),
    read("../document-compatibility.js"),
  ]);
  for (const source of sources) {
    assert.equal(source.includes('from "@greenways/hodos'), false);
    assert.equal(source.includes("import(\"@greenways/hodos"), false);
  }
  assert.equal(sources[1].includes("export function createHaraDocumentEditor"), true);
});

test("compatibility descriptions reject malformed legacy documents", () => {
  assert.throws(
    () => describeHaraDocumentCompatibility({ profile: "greenways.rich-text/2" }),
    /Invalid legacy Hara document/,
  );
});
