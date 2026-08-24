import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the shared Header supports package navigation and product-owned menu modes", async () => {
  const [header, canonicalHeader] = await Promise.all([
    read("packages/ui-astro/src/astro/v2/Header.astro"),
    read("foundation/astro/v2/Header.astro")
  ]);

  assert.equal(header, canonicalHeader, "foundation and ui-astro Header adapters must remain synchronized");
  assert.match(header, /type MenuMode = "navigation" \| "product"/);
  assert.match(header, /menuMode = "navigation" as MenuMode/);
  assert.match(header, /menuControls/);
  assert.match(header, /data-hara-menu-mode=\{menuMode\}/);
  assert.match(header, /menuMode === "product" && !menuControls/);
  assert.match(header, /product menu mode requires a menuControls target ID/);
  assert.match(header, /const menuControlsId = menuMode === "product" \? menuControls : navigationId/);
  assert.match(header, /aria-controls=\{menuControlsId\}/);
  assert.match(header, /menuMode === "navigation" && nav\.length > 0/);
  assert.match(header, /const hasMenu = nav\.length > 0 \|\| menuMode === "product"/);
});

test("the framework-neutral controller lets a product synchronize its own drawer", async () => {
  const controller = await read("foundation/v2/header.js");

  assert.match(controller, /export function setHaraHeaderMenuState/);
  assert.match(controller, /header\.dataset\.haraMenuMode === "product"/);
  assert.match(controller, /syncNavigation !== false/);
  assert.match(controller, /detail: \{ open, compact, mode:/);
  assert.match(controller, /detail: \{ open, compact, reason, restoreFocus \}/);
  assert.match(controller, /requestProductMenu\(header, requestedOpen, compact\.matches, "trigger"\)/);
  assert.match(controller, /requestProductMenu\(header, false, compact\.matches, "escape", true\)/);
  assert.match(controller, /requestProductMenu\(header, false, false, "viewport"\)/);
  assert.match(controller, /menuMode === "navigation" && !isElement\(navigation\)/);
});

test("the shared contract specifies a one-line compact secondary menu", async () => {
  const document = await read("docs/header-shell.md");

  assert.match(document, /menuMode="product"/);
  assert.match(document, /setHaraHeaderMenuState/);
  assert.match(document, /secondary\/context navigation must remain \*\*one line\*\*/);
  assert.match(document, /\[Back \/ location\] \[Current sibling route ▾\] \[Current page section ▾\]/);
  assert.match(document, /must not become a permanent stack/);
  assert.match(document, /44-pixel targets/);
});
