import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the deployed catalogue uses the canonical Hara v2 shell", async () => {
  const page = await read("index.html");

  assert.match(page, /body class="hara-v2 ui-catalogue" data-ui-version="0\.2\.2"/);
  assert.match(page, /data-hara-shell-header/);
  assert.match(page, /data-hara-menu-mode="navigation"/);
  assert.match(page, /class="hara-v2-header-row"/);
  assert.match(page, /data-hara-header-menu/);
  assert.match(page, /id="hara-v2-ui-navigation" data-hara-mobile-navigation/);
  assert.match(page, /class="hara-v2-mobile-navigation hara-v2-mobile-navigation--fallback"/);
  assert.match(page, />Play<\/a>[\s\S]*>Learn<\/a>[\s\S]*>Build<\/a>/);
  assert.match(page, /data-hara-theme-toggle/);
  assert.match(page, /href="https:\/\/id\.hara-lang\.org\/">Sign in<\/a>/);
  assert.match(page, /@hara-lang\/ui 0\.2\.2/);
  assert.match(page, /href="https:\/\/github\.com\/hara-lang\/hara-ui">Source/);
  assert.doesNotMatch(page, /class="topbar"|class="identity"/);
  assert.equal((page.match(/<main\b/g) ?? []).length, 1, "the catalogue must retain one page-level main landmark");
});

test("the catalogue shares package-owned header and theme controllers", async () => {
  const page = await read("index.html");

  assert.match(page, /import \{ initialiseHaraHeaders \} from "\.\/foundation\/v2\/header\.js"/);
  assert.match(page, /import \{ getThemePreference, resolvedTheme, toggleTheme \} from "\.\/foundation\/theme\.js"/);
  assert.match(page, /initialiseHaraHeaders\(\)/);
  assert.match(page, /addEventListener\("hara:theme-change", syncThemeButton\)/);
  assert.doesNotMatch(page, /--hara-v2-[a-z0-9-]+\s*:/i, "the live catalogue must not redefine protected v2 tokens");
});

test("the catalogue contains compact overflow and touch safeguards", async () => {
  const page = await read("index.html");

  assert.match(page, /min-width: 320px/);
  assert.match(page, /min-height: 44px/);
  assert.match(page, /overflow-x: auto/);
  assert.match(page, /@media \(max-width: 420px\)/);
  assert.match(page, /@media \(prefers-reduced-motion: reduce\)/);
});
