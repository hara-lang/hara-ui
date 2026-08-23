import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));

test("hara ui owns the foundation entrypoints", async () => {
  const packageJson = await readJson("package.json");
  assert.equal(packageJson.name, "@hara-lang/ui");
  assert.equal(packageJson.exports["./v2.css"], "./v2.css");
  assert.equal(packageJson.exports["./v2/symbols.js"], "./foundation/v2/symbols.mjs");
  await access(new URL("v2.css", root));
  await access(new URL("foundation/v2/shell.css", root));
  await access(new URL("foundation/v2/tokens.css", root));
});

test("astro and tool adapters are independently packageable", async () => {
  const astro = await readJson("packages/ui-astro/package.json");
  const tool = await readJson("packages/ui-tool/package.json");
  assert.equal(astro.name, "@hara-lang/ui-astro");
  assert.equal(astro.exports["./astro/v2/Header.astro"], "./src/astro/v2/Header.astro");
  assert.equal(astro.exports["./astro/v2/DeliveryFrame.astro"], "./src/astro/v2/DeliveryFrame.astro");
  assert.equal(astro.exports["./astro/v2/ArtifactProvenance.astro"], "./src/astro/v2/ArtifactProvenance.astro");
  assert.equal(tool.name, "@hara-lang/ui-tool");
  assert.equal(tool.peerDependencies["@hara-lang/ui"], "^0.2.0");
  assert.equal(tool.exports["./v2-tool.css"], "./src/v2-tool.css");
  await access(new URL("packages/ui-astro/src/astro/v2/Header.astro", root));
  await access(new URL("packages/ui-tool/src/astro/v2/WorkbenchShell.astro", root));
});

test("the shared shell exposes the mobile states from the Hara shell study", async () => {
  const header = await readFile(new URL("packages/ui-astro/src/astro/v2/Header.astro", root), "utf8");
  const responsive = await readFile(new URL("foundation/v2/responsive.css", root), "utf8");
  assert.match(header, /data-hara-header-menu/);
  assert.match(header, /data-hara-mobile-navigation/);
  assert.match(header, /aria-expanded="false"/);
  assert.match(responsive, /\.hara-v2-mobile-navigation/);
  assert.match(responsive, /max-width: 820px/);
});
