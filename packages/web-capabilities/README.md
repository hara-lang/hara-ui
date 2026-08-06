# @hara-lang/web-capabilities

Framework-free capability grants and browser host-operation dispatch for Hara
web runtimes, previews, catalogs and workspaces.

```js
import { WebCapabilityRegistry } from "@hara-lang/web-capabilities";

const capabilities = new WebCapabilityRegistry({
  grants: ["studio/eval"]
});

capabilities.register({
  operation: "clipboard/write",
  capability: "clipboard/write",
  handler: (text) => navigator.clipboard.writeText(text)
});

capabilities.grant("clipboard/write");
await capabilities.invoke("clipboard/write", ["Hara"]);
```

Operations may own resources by session. `disposeSession()` revokes those
resources independently of add-on cleanup code, which is the boundary used by
Catalog previews and Studio runtime sessions.
