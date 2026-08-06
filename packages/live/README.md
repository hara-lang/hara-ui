# @hara-lang/live

Framework-free browser component for embedding a Hara editor and kernel session.

It provides:

- tabbed examples;
- Paredit-style structural editing;
- desktop and mobile InstaREPL evaluation;
- readable Hara value printing;
- Eval, Run, Stop, and Reset controls;
- resizable editor and canvas surfaces; and
- interruptible `studio.draw` canvas programs.

## Use

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

Consumers provide either a kernel facade/promise through `kernel`, or the runtime locations needed by `createLiveKernel`. Documentation-specific session registries, filesystems, and course metadata remain adapters owned by the documentation application.

## Development

```sh
npm test --workspace @hara-lang/live
npm run check --workspace @hara-lang/live
```
