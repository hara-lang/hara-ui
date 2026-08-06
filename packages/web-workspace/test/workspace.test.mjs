import assert from "node:assert/strict";
import test from "node:test";
import {
  MemoryBackend,
  WorkspaceStore,
  detectProjectConfiguration,
  isProjectSource
} from "../src/index.js";

test("memory workspaces retain normalized paths", async () => {
  const store = new WorkspaceStore({
    backend: new MemoryBackend(),
    workspace: "local/test",
    settingsStorage: null
  });
  await store.write("/src\\app/core.hal", "(ns app.core)");
  assert.deepEqual(await store.list(), ["src/app/core.hal"]);
  assert.equal(await store.read("src/app/core.hal"), "(ns app.core)");
});

test("project descriptors expose namespace, source paths and capabilities", () => {
  const configuration = detectProjectConfiguration([
    {
      path: "project.edn",
      content: `{:hara/type :project
                 :project/main app.core
                 :project/source-paths ["src" "modules"]
                 :project/capabilities #{:studio/eval :audio/playback}}`
    }
  ]);
  assert.equal(configuration.mainNamespace, "app.core");
  assert.deepEqual(configuration.sourcePaths, ["src", "modules"]);
  assert.deepEqual(configuration.capabilities, ["studio/eval", "audio/playback"]);
  assert.equal(isProjectSource("modules/demo.hal", configuration.sourcePaths), true);
});
