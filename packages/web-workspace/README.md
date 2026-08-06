# @hara-lang/web-workspace

Browser-facing Hara project and workspace primitives:

- canonical `project.edn` boot metadata;
- OPFS, localStorage and memory storage backends;
- active-workspace metadata;
- the default Hara Studio project.

```js
import {
  MemoryBackend,
  WorkspaceStore,
  detectProjectConfiguration
} from "@hara-lang/web-workspace";

const store = new WorkspaceStore({
  backend: new MemoryBackend(),
  workspace: "local/example",
  settingsStorage: null
});

await store.write("src/app/core.hal", "(ns app.core)");
const project = detectProjectConfiguration(await store.files());
```

The package currently owns the browser storage and project-loading layer. The
next workspace slice will make the visual Studio shell instantiate its areas,
documents, nodes, connections and links directly from `workspace.edn`.
