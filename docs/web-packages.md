# Hara web packages

The browser-facing Hara platform is organised as independent, framework-free
ESM packages under `packages/`:

| Package | Responsibility |
|---|---|
| `@hara-lang/web-runtime` | Runtime worker requests, reverse host calls, lifecycle cancellation, and manifest-based kernel boot |
| `@hara-lang/web-editor` | Structural editing, Hara scanning/highlighting, completion, form selection, and InstaREPL helpers |
| `@hara-lang/web-workspace` | `project.edn` / `workspace.edn` browser metadata and OPFS/localStorage/memory workspace storage |
| `@hara-lang/web-preview` | Low-level sandboxed iframe hosting and safe HTA/HTML projection |
| `@hara-lang/web-capabilities` | Capability grants, operation dispatch, and per-session browser-resource disposal |
| `@hara-lang/web-addons` | Product-neutral add-on dependencies, capability declarations, contribution ownership, activation, rollback, and disposal |

These packages are browser services and mechanisms rather than a concrete
Workspace interface or a Greenways Studio application. They may be consumed
independently by Playground, Catalog, Live, Hodos, Greenways OS, or another host.

The terminology boundary is:

```text
Hara Workspace
    portable HAL state, events, views, effects and extension contracts

Hara web packages
    browser runtime, persistence, capability, add-on and isolation services

Hodos
    trusted Dev, 2D, 3D, audio and Greenways UI projections

Greenways Studio
    branded product composition built from Hodos packages
```

## Dependency direction

```text
web-runtime       web-editor       web-workspace
      \                |                /
       \        web-capabilities       /
        \              |              /
              web-addons     web-preview
                    \          /
                       Hodos
                         |
       Playground / Live / Catalog / Greenways Studio
                         |
                    host applications
```

The diagram indicates composition, not mandatory imports. In particular:

- `web-runtime` does not import a Workspace shell, Hodos, Studio, or Playground;
- `web-preview` does not import the runtime and accepts projected values;
- `web-workspace` owns persistence and host adaptation, not canonical Workspace semantics or visible layout;
- `web-addons` knows nothing about the DOM, the Hara VM, storage providers, Hodos, or Greenways OS;
- capability providers are injected by a host;
- Hodos and Greenways packages may depend on Hara `web-*` services, but Hara packages do not import them;
- the canonical WASM runtime and its release pipeline remain in `hara-lang/hara`;
- no package in this repository ships runtime WASM bytes.

## Add-on boundary

A web add-on declares an ID, semantic version, dependencies, and required host
capabilities. While active it may contribute packaged implementations such as
commands, services, component factories, or providers. The host activates
dependencies first, rejects cycles and missing capabilities, owns every
contribution, rolls back failed activation, and removes contributions during
deactivation.

`@hara-lang/web-addons` is not an installation or trust authority. Greenways OS
continues to decide which reviewed packages are installed and which privileged
capabilities they may receive. Hara Workspace HAL decides which installed
extension types are requested by a `workspace.edn`. Hodos supplies concrete
visible component factories.

## Compatibility migration

`@hara-lang/live` keeps its current public exports while rebuilding its editor
and kernel adapters on `web-editor` and `web-runtime`. Playground consumes the
same packages through a commit-pinned Hara UI checkout until the packages are
published to npm.

The current `web-workspace` slice owns project loading and browser persistence.
Hara will define canonical `workspace.*` semantics in HAL. Hodos will implement
the visible Workspace, Dev, 2D, 3D and audio projections instead of adding a
Hara-owned `web-studio-*` product layer.
