import assert from "node:assert/strict";
import test from "node:test";
import {
  completionItems,
  highlightHara,
  instantFormAtCursor,
  scanHara
} from "../src/index.js";

test("scanner pairs delimiters and highlights matching forms", () => {
  const source = "(def answer 42)";
  const scan = scanHara(source);
  assert.equal(scan.pairs.get(0), source.length - 1);
  assert.match(highlightHara(source, 1), /paren-match/);
});

test("InstaREPL selects a complete top-level form", () => {
  const source = "(def answer 42)\n(+ answer 1)\n";
  const candidate = instantFormAtCursor(source, { cursor: source.indexOf("answer 1") });
  assert.equal(candidate.source, "(+ answer 1)");
  assert.equal(candidate.kind, "form");
});

test("completion merges core and project symbols", () => {
  const items = completionItems({ prefix: "pri", source: "(def print-value 1)" });
  assert.deepEqual(items.map((item) => item.label), ["println", "print-value"]);
});
