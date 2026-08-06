import assert from "node:assert/strict";
import test from "node:test";
import { previewDocument, renderHtaNode } from "../src/hta.js";

test("HTA rendering escapes content and event attributes", () => {
  const html = renderHtaNode([
    "button",
    { className: "primary", onclick: "alert(1)" },
    "<Continue>"
  ]);
  assert.equal(html, '<button class="primary">&lt;Continue&gt;</button>');
});

test("preview documents include the sandbox content policy", () => {
  const html = previewDocument({ type: "render", tree: ["main", "Ready"] });
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /<main>Ready<\/main>/);
});
