# `@hara-lang/ui-astro`

Astro adapters for the Hara interface language. The package owns the shared
Hara v2 shell, header, context navigation, identity marks, and presentation
primitives. Foundations and styles are published by `@hara-lang/ui`.

See [`docs/shell-customization.md`](../../docs/shell-customization.md) for the
shared shell contract and the current WWW, Docs, and workbench composition
recipes.

```astro
---
import Shell from "@hara-lang/ui-astro/astro/v2/Shell.astro";
import Header from "@hara-lang/ui-astro/astro/v2/Header.astro";
import "@hara-lang/ui/v2.css";
---

<Shell sidebar={false} aside={false}>
  <Header slot="header" section="Docs" />
  <slot />
</Shell>
```
