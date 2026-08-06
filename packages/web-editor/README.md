# @hara-lang/web-editor

Framework-free browser editor primitives shared by Hara Live and Playground.
The package contains:

- Hara token scanning, delimiter matching and highlighting;
- completion candidates and source-symbol collection;
- top-level form and InstaREPL selection;
- a textarea Paredit adapter used by `@hara-lang/live`.

```js
import {
  completionItems,
  highlightHara,
  instantFormAtCursor
} from "@hara-lang/web-editor";

const candidate = instantFormAtCursor(source, { cursor });
const html = highlightHara(source, cursor);
const completions = completionItems({ prefix: "pri", source });
```

The core package remains independent from CodeMirror and Monaco. Renderer
adapters can be layered on top later without changing the structural model.
