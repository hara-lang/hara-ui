# @hara-lang/web-preview

Sandboxed iframe and HTA rendering primitives shared by Hara Playground,
Catalog, Live and Studio surfaces.

```js
import { createPreviewHost } from "@hara-lang/web-preview";

const preview = createPreviewHost({
  container: document.querySelector("#preview"),
  theme: "dark",
  viewport: { id: "phone", width: 390, height: 844 }
});

preview.render({ type: "render", tree: ["main", "Ready"] });
preview.dispose();
```

The iframe is sandboxed and receives no workspace, credential or host-capability
objects. Browser effects remain in the host page.
