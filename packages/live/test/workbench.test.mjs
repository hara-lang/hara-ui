import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  LIVE_CONTROL_GROUPS,
  LIVE_WORKBENCH_SECTIONS,
  normalizeLiveWorkbenchOptions
} from "../src/workbench.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("workbench exposes the requested content and control taxonomy", () => {
  assert.deepEqual(LIVE_WORKBENCH_SECTIONS.map(({ id }) => id), [
    "nav", "frontmatter", "graphics", "code"
  ]);
  assert.deepEqual(LIVE_CONTROL_GROUPS.map(({ id }) => id), [
    "sessions", "files", "canvas", "three-d"
  ]);
});

test("workbench options remain optional and normalize host data", () => {
  const basic = normalizeLiveWorkbenchOptions();
  assert.equal(basic.activeSection, "code");
  assert.equal(basic.controlPane, null);

  const configured = normalizeLiveWorkbenchOptions({
    activeSection: "graphics",
    navigation: ["Overview"],
    frontmatter: [{ label: "File", value: "main.hal" }],
    controlPane: {
      open: true,
      activeGroup: "canvas",
      sessions: [{ label: "Tutorial", status: "ready" }],
      files: [{ label: "main.hal" }],
      canvas: [{ label: "Grid", type: "toggle", value: true }],
      threeD: [{ label: "Camera", type: "select", options: ["orbit"] }]
    }
  });
  assert.equal(configured.activeSection, "graphics");
  assert.equal(configured.navigation[0].id, "overview");
  assert.equal(configured.frontmatter[0].value, "main.hal");
  assert.equal(configured.controlPane.open, true);
  assert.equal(configured.controlPane.activeGroup, "canvas");
  assert.equal(configured.controlPane.canvas[0].type, "toggle");
  assert.equal(configured.controlPane.threeD[0].id, "camera");
});

test("workbench source provides accessible roving tabs and provider controls", async () => {
  const source = await read("../src/workbench.js");
  assert.match(source, /mountLiveCard\(liveMount, forwarded\)/);
  assert.match(source, /aria-label", "Live environment sections"/);
  assert.match(source, /role", "tablist"/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /hara:live-section-change/);
  assert.match(source, /setSessions\(entries\)/);
  assert.match(source, /setFiles\(entries\)/);
  assert.match(source, /onControl\?\./);
  assert.match(source, /MutationObserver/);
});

test("workbench stylesheet imports the live card and applies calm responsive chrome", async () => {
  const styles = await read("../src/workbench.css");
  assert.match(styles, /@import "\.\/style\.css"/);
  assert.match(styles, /--hara-live-workbench-motion:\s*185ms/);
  assert.match(styles, /border-radius:\s*var\(--hara-live-workbench-radius\)/);
  assert.match(styles, /data-control-pane="open"/);
  assert.match(styles, /data-section="frontmatter"/);
  assert.match(styles, /data-section="graphics"/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(styles, /text-transform:\s*uppercase/);
});

test("package exports the optional workbench API and stylesheet", async () => {
  const pkg = JSON.parse(await read("../package.json"));
  assert.equal(pkg.exports["./workbench"], "./src/workbench.js");
  assert.equal(pkg.exports["./workbench.css"], "./src/workbench.css");
});
