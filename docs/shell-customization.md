# Hara v2 shell customization

The shell is a shared frame, not a finished page. It owns the stable geometry,
landmarks, focus states, compact navigation contract, and visual tokens. Each
site owns its routes, product-specific controls, account integration, content,
and the slots that make the frame useful.

## The customization surface

`Shell.astro` accepts the structural options that change the frame:

| Option | Purpose |
| --- | --- |
| `sidebar` / `aside` | Enable the left rail or right inspector. |
| `embedded` | Use the shell inside a specimen or workbench card. |
| `density` | Choose `comfortable` or `compact` spacing. |
| `variant` | Add an inspectable product intent such as `document`, `product`, or `workbench`. The shared package does not attach product meaning to it; site CSS may target `[data-variant]`. |
| `class` | Add a site-owned styling hook. |
| `style` | Override shell tokens locally without copying the component. |

`Header.astro` accepts the identity and navigation composition:

| Option | Purpose |
| --- | --- |
| `section`, `label`, `showSection` | Define the product identity and accessible name. |
| `nav`, `activePath` | Supply ecosystem destinations and current state. |
| `menuMode`, `menuControls` | Choose package navigation or delegate the menu to a product-owned drawer. |
| `account`, `accountHref`, `accountLabel` | Supply the product's account state and provider destination. |
| `variant`, `compactQuery`, `class`, `style` | Add a site-owned header profile and local token overrides. |

`ContextNav.astro` is the route-local layer. It accepts its own `items`,
`sticky`, `class`, and `style`; page tabs and tool controls belong in its slot
or in the page content below it.

## Three site recipes

### Public product

The public site removes both rails, widens the reading column, and supplies a
site-owned header because its account/profile controls are different from the
simple product header:

```astro
<Shell
  sidebar={false}
  aside={false}
  variant="product"
  class="hara-www-shell"
  style="--hara-v2-page: clamp(18px, 3.8vw, 56px); --hara-v2-column: 1480px;"
>
  <WwwHeader slot="header" nav={primaryNavigation} />
  <slot />
</Shell>
```

The shell still supplies the page frame. `WwwHeader` supplies the public-site
navigation, identity surface, mobile menu, theme control, and profile area.

### Documentation product

Docs keeps the shared header contract but wraps the shell around Starlight's
sidebar and content slots. The docs product owns its context routes and search,
while the shared shell keeps the top row and sticky geometry consistent:

```astro
<Shell
  variant="document"
  style="--hara-v2-page: clamp(16px, 2.4vw, 32px); --hara-v2-rail-width: 256px;"
>
  <Header slot="header" section="Docs" variant="document" nav={ecosystemNav}>
    <Search />
    <ThemeSelect />
  </Header>
  <ContextNav slot="context" items={docsSections} />
  <StarlightSidebar slot="sidebar" />
  <StarlightContent />
</Shell>
```

The current implementation is [DocsPageFrame.astro](../../website/hara-docs/astro/src/components/DocsPageFrame.astro)
and [DocsHeader.astro](../../website/hara-docs/astro/src/components/DocsHeader.astro).

### Workbench

A tool surface uses the same shell with both supporting regions and a compact
density. Its header can delegate the hamburger to an application catalogue:

```astro
<Shell
  embedded
  sidebar
  aside
  density="compact"
  variant="workbench"
  class="tool-workbench-shell"
  style="--hara-v2-rail-width: 220px; --hara-v2-inspector-width: 264px;"
>
  <Header
    slot="header"
    section="Studio"
    variant="workbench"
    menuMode="product"
    menuControls="studio-catalogue"
  />
  <Sidebar slot="sidebar" />
  <Viewport />
  <Inspector slot="aside" />
</Shell>
```

The workbench owns the graph, viewport, timeline, inspector, and catalogue
contents. The shared shell owns their outer relationship and responsive
landmarks.

## Current site ownership map

- `hara-www`: shared `Shell` plus the product-owned `WwwHeader` and public CSS.
- `hara-docs`: shared `Header` and `ContextNav` around Starlight's document
  frame.
- `hara-learn`: shared `Shell`, `Header`, and `ContextNav`; Learn owns feed,
  lesson, and account actions.
- `hara-build`: shared `Shell`, `Header`, and `ContextNav`; Build owns registry
  workflow navigation and API controls.
- `hara-visual-language`: the reference site keeps a local Astro adapter so
  component specimens can render and inspect the visual language itself.
- `hara-benchmarks`: currently a standalone static benchmark surface; it is the
  remaining site to migrate to the shared shell contract.

This separation makes a site customizable by composition rather than by
forking the shell. If a product needs a new behaviour, add it to the shared
contract only when the behaviour is genuinely common; otherwise use a slot,
`class`, `variant`, or local token override.
