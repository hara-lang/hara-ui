# Hara v2 application header

The canonical Hara header is defined by the Figma **Header / Hara V2 Shell**
studies and implemented by two package layers:

- `@hara-lang/ui/v2.css` supplies the shell geometry and responsive states;
- `@hara-lang/ui/v2/header.js` owns framework-neutral compact-navigation state;
- `@hara-lang/ui-astro/astro/v2/Header.astro` projects the same contract for
  Astro applications.

The package owns presentation, accessible disclosure state, and viewport
reconciliation. Products continue to own routes, account state, notifications,
identity actions, and any desktop drawer opened from the menu control.

## Geometry

Desktop uses a 60-pixel row with 28-pixel page insets, a 130-pixel identity
cluster, a 232-pixel centred primary navigation, and a 130-pixel action rail.
The identity cluster contains the 28-pixel menu control and 84-pixel Hara brand.

At 820 pixels and below the primary navigation moves into the compact panel.
The top row uses 16-pixel insets, a 116-pixel identity cluster, and a 126-pixel
logged-in action rail. The compact panel contains three 46-pixel navigation
rows and follows the exact panel/current-row semantics from the Figma mobile
open state.

The visible menu icon remains the same in closed and open states. Open state is
communicated through the panel, `aria-expanded`, and the accessible label rather
than an unreviewed icon transformation.

## Astro use

```astro
---
import Header from "@hara-lang/ui-astro/astro/v2/Header.astro";
import ThemeToggle from "@hara-lang/ui-astro/astro/ThemeToggle.astro";

const nav = [
  { href: "https://play.hara-lang.org/", label: "Play", external: true },
  { href: "/", label: "Learn", current: true },
  { href: "https://build.hara-lang.org/", label: "Build", external: true }
];
---

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

`section` contributes to the accessible product label. The compact Figma brand
shows only the Hara identity by default. Set `showSection={true}` only for a
product that has explicitly accepted the expanded brand treatment.

`navigationId` should be supplied whenever a document contains more than one
header specimen or embedded shell.

## Static use

```html
<link rel="stylesheet" href="vendor/@hara-lang/ui/v2.css">
<header data-hara-shell-header data-navigation-open="false">
  <!-- use the same data-hara-header-menu and data-hara-mobile-navigation
       structure as the Astro adapter -->
</header>
<script type="module">
  import { initialiseHaraHeaders } from "./vendor/@hara-lang/ui/foundation/v2/header.js";
  initialiseHaraHeaders();
</script>
```

The compact navigation is progressive enhancement. Applications should retain
a `<noscript>` compact navigation projection when the centred desktop links are
hidden at narrow widths.

## Events

The controller emits:

- `hara:header-navigation` whenever the package-owned compact panel changes;
- `hara:header-menu-request` when the menu control is pressed outside the
  compact breakpoint. A product may listen for this cancelable event to open a
  product-owned desktop drawer.

The controller closes compact navigation after a destination is selected, on
Escape with focus restoration, and whenever the viewport leaves compact mode.
