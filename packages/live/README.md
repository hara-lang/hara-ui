# @hara-lang/live

Framework-free browser components for embedding a Hara editor and kernel session.

It provides:

- tabbed examples;
- Paredit-style structural editing;
- desktop and mobile InstaREPL evaluation;
- readable Hara value printing;
- Eval, Run, Stop, and Reset controls;
- resizable editor and canvas surfaces;
- interruptible `studio.draw` canvas programs;
- optional Nav / Frontmatter / Graphics / Code section navigation; and
- an optional Sessions / Files / Canvas / 3D control pane.

## Basic live card

```js
import { mountLiveCard } from "@hara-lang/live";
import { getLiveSnippet } from "@hara-lang/live/snippets";
import "@hara-lang/live/style.css";

const snippets = ["first-eval", "collections"]
  .map(getLiveSnippet)
  .filter(Boolean);

mountLiveCard(document.querySelector("[data-hara-live]"), {
  snippets,
  kernel: kernelPromise
});
```

## Calm workbench shell

`mountLiveWorkbench` wraps the same live card. Existing snippet, kernel, runtime,
and Playground options are forwarded unchanged. Navigation and controls are
host-provided, so an embed never advertises a capability that its runtime does
not support.

```js
import { mountLiveWorkbench } from "@hara-lang/live/workbench";
import "@hara-lang/live/workbench.css";

mountLiveWorkbench(document.querySelector("[data-hara-live]"), {
  snippets,
  kernel: kernelPromise,
  activeSection: "code",
  navigation: [
    { label: "Overview", href: "#overview" },
    { label: "Rendering", href: "#rendering" }
  ],
  frontmatter: [
    { label: "Session", value: "isolated" },
    { label: "File", value: "main.hal" }
  ],
  controlPane: {
    open: false,
    sessions: [{ label: "Tutorial", value: "isolated", status: "ready" }],
    files: [{ label: "main.hal", value: "current" }],
    canvas: [
      { id: "grid", label: "Grid", type: "toggle", value: true },
      { id: "scale", label: "Scale", type: "range", min: 25, max: 200, value: 100, unit: "%" }
    ],
    threeD: [
      { id: "camera", label: "Camera", type: "select", value: "orbit", options: ["orbit", "front", "top"] }
    ],
    onControl({ group, id, value }) {
      runtimeControls.update(group, id, value);
    }
  }
});
```

The workbench follows Hara's calm-surface rule: continuous regions, quiet seams,
comfortable controls, sentence-case labels, smooth state changes, and one
functional signal. The four content sections and four control groups use
accessible tablists with keyboard navigation. The control pane becomes an
overlay on narrow screens and respects reduced motion.

Consumers provide either a kernel facade/promise through `kernel`, or the runtime
locations needed by `createLiveKernel`. Documentation-specific session
registries, filesystems, frontmatter, and course metadata remain adapters owned
by the documentation application.

## Development

```sh
npm test --workspace @hara-lang/live
npm run check --workspace @hara-lang/live
```
