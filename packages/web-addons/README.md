# @hara-lang/web-addons

Framework-free add-on lifecycle and contribution registry for Hara browser hosts.

The package owns only neutral mechanics:

- add-on manifest validation;
- semantic-version dependency ordering;
- cycle detection;
- declared host-capability checks;
- contribution ownership;
- activation rollback;
- dependent-aware deactivation;
- deterministic listener and contribution cleanup.

It has no dependency on the DOM, the Hara VM, Workspace UI, Hodos, Greenways OS, storage, GitHub, PlayCanvas, or a particular capability implementation.

```js
import {
  createWebAddonHost,
  defineWebAddon
} from "@hara-lang/web-addons";

const previewAddon = defineWebAddon({
  manifest: {
    id: "example/preview",
    version: "1.0.0",
    requires: {},
    capabilities: ["preview/render"]
  },
  activate(context) {
    return context.contribute("workspace.component", "example/preview", {
      create() {}
    });
  }
});

const host = createWebAddonHost({
  capabilities: ["preview/render"]
});

host.register(previewAddon);
await host.activate("example/preview");
await host.deactivate("example/preview");
```

Hosts may supply either an iterable of capability IDs or an authority object with `has(capability)` and optional `values()` methods. The add-on context can observe only capabilities declared by that add-on and granted by the host.
