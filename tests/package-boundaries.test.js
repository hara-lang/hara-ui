import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));

test("hara ui owns the foundation entrypoints", async () => {
  const packageJson = await readJson("package.json");
  assert.equal(packageJson.name, "@hara-lang/ui");
  assert.equal(packageJson.version, "0.2.2");
  assert.equal(packageJson.exports["./v2.css"], "./v2.css");
  assert.equal(packageJson.exports["./v2/header.js"], "./foundation/v2/header.js");
  assert.equal(packageJson.exports["./v2-header.css"], "./foundation/v2/header.css");
  assert.equal(packageJson.exports["./v2/symbols.js"], "./foundation/v2/symbols.mjs");
  await access(new URL("v2.css", root));
  await access(new URL("foundation/v2/header.css", root));
  await access(new URL("foundation/v2/header.js", root));
  await access(new URL("foundation/v2/shell.css", root));
  await access(new URL("foundation/v2/tokens.css", root));
  await access(new URL("docs/header-shell.md", root));
});

test("astro and tool adapters are independently packageable", async () => {
  const astro = await readJson("packages/ui-astro/package.json");
  const tool = await readJson("packages/ui-tool/package.json");
  assert.equal(astro.name, "@hara-lang/ui-astro");
  assert.equal(astro.version, "0.1.2");
  assert.equal(astro.peerDependencies["@hara-lang/ui"], "^0.2.2");
  assert.equal(astro.exports["./astro/v2/Header.astro"], "./src/astro/v2/Header.astro");
  assert.equal(astro.exports["./astro/v2/DeliveryFrame.astro"], "./src/astro/v2/DeliveryFrame.astro");
  assert.equal(astro.exports["./astro/v2/ArtifactProvenance.astro"], "./src/astro/v2/ArtifactProvenance.astro");
  assert.equal(tool.name, "@hara-lang/ui-tool");
  assert.equal(tool.peerDependencies["@hara-lang/ui"], "^0.2.0");
  assert.equal(tool.exports["./v2-tool.css"], "./src/v2-tool.css");
  await access(new URL("packages/ui-astro/src/astro/v2/Header.astro", root));
  await access(new URL("packages/ui-tool/src/astro/v2/WorkbenchShell.astro", root));
});

test("the shared shell exposes the complete mobile states from the Hara shell study", async () => {
  const [header, canonicalHeader, headerCss, controller, foundation] = await Promise.all([
    readFile(new URL("packages/ui-astro/src/astro/v2/Header.astro", root), "utf8"),
    readFile(new URL("foundation/astro/v2/Header.astro", root), "utf8"),
    readFile(new URL("foundation/v2/header.css", root), "utf8"),
    readFile(new URL("foundation/v2/header.js", root), "utf8"),
    readFile(new URL("foundation/v2.css", root), "utf8")
  ]);

  assert.equal(header, canonicalHeader, "foundation and ui-astro Header adapters must remain synchronized");
  assert.match(header, /data-hara-header-menu/);
  assert.match(header, /data-hara-mobile-navigation/);
  assert.match(header, /data-account=\{account\}/);
  assert.match(header, /account === "logged-out"/);
  assert.match(header, /navigationId: suppliedNavigationId/);
  assert.match(header, /aria-controls=\{menuControlsId\}/);
  assert.match(header, /data-hara-menu-mode=\{menuMode\}/);
  assert.match(header, /menuMode === "navigation" && nav\.length > 0/);
  assert.match(header, /hara-v2-mobile-navigation--fallback/);
  assert.match(header, /@hara-lang\/ui\/v2\/header\.js/);
  assert.match(header, /showSection = false/);
  assert.match(header, /data-hara-sign-in-trigger/);
  assert.match(header, /data-hara-sign-in-modal/);
  assert.match(header, /data-hara-header-variant=\{variant\}/);
  assert.match(header, /data-hara-compact-query=\{compactQuery\}/);
  assert.match(header, /class:list=\{\["hara-v2-header", className\]\}/);
  assert.match(header, /style=\{inlineStyle\}/);

  assert.match(foundation, /@import "\.\/v2\/header\.css";/);
  assert.match(headerCss, /grid-template-columns: minmax\(0, 130px\) minmax\(0, 1fr\) minmax\(0, 130px\)/);
  assert.match(headerCss, /width: 232px/);
  assert.match(headerCss, /grid-template-columns: minmax\(0, 116px\) minmax\(0, 1fr\) minmax\(0, 126px\)/);
  assert.match(headerCss, /height: 184px/);
  assert.match(headerCss, /background: var\(--hara-v2-panel\)/);
  assert.match(headerCss, /border-color: var\(--hara-v2-signal\)/);
  assert.match(headerCss, /\.hara-v2-account-link \{[\s\S]*?color: var\(--hara-v2-ink\);[\s\S]*?font-size: 13px;[\s\S]*?font-weight: 400;/);
  assert.match(headerCss, /\.hara-v2-sign-in-modal/);
  assert.match(headerCss, /data-navigation-open="true"[\s\S]*opacity: 1/);
  assert.doesNotMatch(headerCss, /--hara-v2-[a-z0-9-]+\s*:/i, "header CSS may consume but not redefine protected tokens");

  assert.match(controller, /export function setHaraHeaderMenuState/);
  assert.match(controller, /hara:header-navigation/);
  assert.match(controller, /hara:header-menu-request/);
  assert.match(controller, /event\.key (?:===|!==) "Escape"/);
  assert.match(controller, /compact\.addEventListener\("change"/);
  assert.match(controller, /navigation\.hidden = !open/);
  assert.match(controller, /initialiseHaraSignIns/);
  assert.match(controller, /data-hara-sign-in-close/);
});
