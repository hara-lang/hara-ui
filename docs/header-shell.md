# Hara v2 application header

The canonical Hara header is defined by the Figma **Header / Hara V2 Shell**
studies and implemented by two package layers:

- `@hara-lang/ui/v2.css` supplies the shell geometry and responsive states;
- `@hara-lang/ui/v2/header.js` owns framework-neutral menu state;
- `@hara-lang/ui-astro/astro/v2/Header.astro` projects the same contract for
  Astro applications.

The package owns presentation, accessible disclosure state, and viewport
reconciliation. Products continue to own routes, account state, notifications,
identity actions, catalogue data, and product drawer contents.

## Geometry

Desktop uses a 60-pixel row with 28-pixel page insets, a 130-pixel identity
cluster, a 232-pixel centred primary navigation, and a 130-pixel action rail.
The identity cluster contains the 28-pixel menu control and 84-pixel Hara brand.

At 820 pixels and below the centred primary navigation is hidden. A simple site
may move those links into the package-owned compact panel. A richer product may
instead route the same hamburger to its own catalogue or application drawer.
The visible menu icon remains the same in closed and open states. Open state is
communicated through the controlled panel, `aria-expanded`, and the accessible
label rather than an unreviewed icon transformation.

## Menu modes

### Package navigation

`menuMode="navigation"` is the default. The package renders and controls the
compact link panel from `nav`.

```astro
<Header
  section="Learn"
  nav={nav}
  account="logged-out"
  accountHref="https://id.hara-lang.org/"
  navigationId="learn-primary-navigation"
>
  <ThemeToggle label="Theme" />
</Header>
```

The package closes the compact navigation after destination selection, on
Escape with focus restoration, and whenever the viewport leaves compact mode.
The `<noscript>` projection keeps the same destinations available without
JavaScript.

### Product-owned drawer

`menuMode="product"` keeps desktop ecosystem links but delegates the hamburger
at every viewport to a product-owned target. `menuControls` is required and must
match the target element ID.

```astro
---
import Header from "@hara-lang/ui-astro/astro/v2/Header.astro";
---

<Header
  section="Visual language"
  nav={nav}
  menuMode="product"
  menuControls="visual-language-catalogue"
  menuLabel="Open catalogue"
  menuCloseLabel="Close catalogue"
/>

<section id="visual-language-catalogue" hidden>
  <!-- Product-owned routes and catalogue structure. -->
</section>
```

The application listens for `hara:header-menu-request`, opens or closes its
own drawer, then calls `setHaraHeaderMenuState()` so the shared hamburger keeps
`data-navigation-open`, `aria-expanded`, labels, events, and optional focus
restoration synchronized.

```js
import {
  initialiseHaraHeaders,
  setHaraHeaderMenuState
} from "@hara-lang/ui/v2/header.js";

const header = document.querySelector("[data-hara-shell-header]");
const drawer = document.querySelector("#visual-language-catalogue");

header.addEventListener("hara:header-menu-request", (event) => {
  const open = Boolean(event.detail.open);
  drawer.hidden = !open;
  setHaraHeaderMenuState(header, open, {
    compact: event.detail.compact,
    restoreFocus: Boolean(event.detail.restoreFocus),
    syncNavigation: false
  });
});

initialiseHaraHeaders();
```

Product mode does not render a second package-owned mobile navigation panel.
The product remains responsible for destination selection, backdrop/close
controls, focus entry, and its own no-JavaScript route fallback.

## One-line compact context navigation

The application header and secondary navigation have different jobs. At mobile
widths, the secondary/context navigation must remain **one line** beneath the
60-pixel header. It must not become a permanent stack of parent, sibling,
status, and on-page rows.

A typical one-line composition is:

```text
[Back / location] [Current sibling route ▾] [Current page section ▾]
```

The sibling-route and on-page controls open product-owned disclosure panels
below that line. A product may hide low-priority status copy inside the sibling
trigger, but it must preserve current-location semantics, 44-pixel targets,
visible focus, Escape closure, and access to all destinations without relying
on horizontal text wrapping.

This is a downstream composition rule rather than a new routing abstraction in
Hara UI. `ContextNav.astro` remains available for simple horizontally
inspectable contexts; products with sibling and on-page hierarchies should
project compact disclosure controls around their own route data.

## Other Astro details

`section` contributes to the accessible product label. The compact Figma brand
shows only the Hara identity by default. Set `showSection={true}` only for a
product that has explicitly accepted the expanded brand treatment.

`navigationId` should be supplied whenever a document contains more than one
header specimen or embedded shell. `menuControls` serves the equivalent purpose
in product mode.

## Static use

```html
<link rel="stylesheet" href="vendor/@hara-lang/ui/v2.css">
<header data-hara-shell-header data-hara-menu-mode="product" data-navigation-open="false">
  <!-- Use data-hara-header-menu and point aria-controls at a product drawer. -->
</header>
<script type="module">
  import {
    initialiseHaraHeaders,
    setHaraHeaderMenuState
  } from "./vendor/@hara-lang/ui/foundation/v2/header.js";
  initialiseHaraHeaders();
</script>
```

## Events

The controller emits:

- `hara:header-navigation` whenever synchronized header state changes;
- `hara:header-menu-request` when a product-owned menu should open or close, or
  when a navigation-mode hamburger is pressed outside the compact breakpoint.

The request detail contains `open`, `compact`, `reason`, and `restoreFocus`.
Product code must call `setHaraHeaderMenuState()` after it applies the requested
state.
