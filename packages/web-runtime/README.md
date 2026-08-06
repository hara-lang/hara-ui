# @hara-lang/web-runtime

Browser-facing runtime transport shared by Hara Playground, Live, Catalog and
Studio compositions.

The package does not ship Hara WASM bytes. Hosts provide either a runtime worker
URL or the runtime archive paths they already publish.

```js
import { RuntimeClient } from "@hara-lang/web-runtime";

const runtime = new RuntimeClient(
  new URL("./runtime-worker.js", import.meta.url),
  { hostRegistry: capabilities }
);

await runtime.boot(files, "app.core");
const result = await runtime.eval("(+ 40 2)", "app.core");
runtime.dispose();
```

`RuntimeClient` preserves the existing Playground protocol:

```text
boot · eval · load-file · complete · inspect · reset
```

It also forwards reverse host calls to an injected capability registry. The
`live-kernel` export contains the shared manifest-based boot adapter used by
`@hara-lang/live`.
