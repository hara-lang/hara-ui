# Hara web packages

The browser-facing Hara platform is organised as independent, framework-free
ESM packages under `packages/`:

| Package | Responsibility |
|---|---|
| `@hara-lang/web-runtime` | Runtime worker requests, reverse host calls, lifecycle cancellation, and manifest-based kernel boot |
| `@hara-lang/web-editor` | Structural editing, Hara scanning/highlighting, completion, form selection, and InstaREPL helpers |
| `@hara-lang/web-workspace` | `project.edn` browser metadata and OPFS/localStorage/memory workspace storage |
| `@hara-lang/web-preview` | Sandboxed iframe hosting and safe HTA/HTML projection |
| `@hara-lang/web-capabilities` | Capability grants, operation dispatch, and per-session browser-resource disposal |

These packages are platform components rather than a Studio application. They
may be consumed independently by Playground, Catalog, Live, Studio, Hodos, or
an extension host.

## Dependency direction

```text
web-runtime       web-editor       web-workspace
      \                |                /
       \        web-capabilities       /
        \              |              /
                 web-preview
                      |
             Live / Catalog / Studio
                      |
                 host applications
```

The diagram indicates composition, not mandatory imports. In particular:

- `web-runtime` does not import a Studio or Playground shell;
- `web-preview` does not import the runtime and accepts projected values;
- `web-workspace` does not require Studio;
- capability providers are injected by a host;
- the canonical WASM runtime and its release pipeline remain in `hara-lang/hara`;
- no package in this repository ships runtime WASM bytes.

## Compatibility migration

`@hara-lang/live` keeps its current public exports while rebuilding its editor
and kernel adapters on `web-editor` and `web-runtime`. Playground consumes the
same packages through a commit-pinned Hara UI checkout until the packages are
published to npm.

The current `web-workspace` slice owns project loading and browser persistence.
Rendering Studio areas, documents, nodes, connections, and links directly from
`workspace.edn` is a later refactor and should not be conflated with this package
organisation change.
