# Hara document compatibility and Hodos 2D

The original Hara UI document surface remains available for existing consumers,
but new visible Workspace document integrations belong to Hodos 2D.

## Ownership

```text
Hara UI compatibility
  greenways.rich-text/2 values
  existing document operations
  existing createHaraDocumentEditor entry point
  Hestia batch enrichment compatibility

Hodos 2D
  hodos.rich-text/2 Workspace component model
  safe visible DOM host
  selection and lifecycle mechanics
  document/* semantic events

Hara/runtime and host applications
  operation application
  Hara evaluation and retained values
  persistence and collaboration
  signatures, receipts and conflict policy
  privileged capabilities
```

Hara UI does not import Hodos. The compatibility module exposes inert target
metadata so consumers and release tooling can discover the migration path
without introducing a reverse dependency.

## Model migration

```js
import { createDocument } from "@hara-lang/ui/document-model";
import {
  describeHaraDocumentCompatibility,
} from "@hara-lang/ui/document-compatibility";
import {
  createLegacyHaraDocumentArea,
} from "@greenways/hodos-2d/compat/hara-document";

const legacyDocument = createDocument({ title: "Review" });
const compatibility = describeHaraDocumentCompatibility(legacyDocument);
const area = createLegacyHaraDocumentArea({
  document: legacyDocument,
  capabilities: {
    select: true,
    editText: true,
    insertBlock: true,
    deleteBlock: true,
    activateArtefact: true,
    commitArtefact: true,
  },
});
```

The Hodos projector validates the legacy profile, changes only the profile
identity, and then runs the normal Hodos rich-document validation. It does not
mutate the source document or copy editor instances, callbacks, runtime sessions
or transport policy into the Workspace model.

## Visible host migration

```js
import { createHodosComponentRegistry } from "@greenways/hodos-web";
import { createWorkspaceAreaHost } from "@greenways/hodos-workspace-ui";
import {
  registerHodosDocumentDomUi,
} from "@greenways/hodos-2d-ui";
import "@greenways/hodos-2d-ui/document.css";

const registry = createHodosComponentRegistry();
registerHodosDocumentDomUi(registry, {
  documentDom: {
    renderArtefact: ({ container, block }) =>
      haraArtefactService.mount({ container, block }),
  },
});

const host = createWorkspaceAreaHost({
  root: document.querySelector("#document"),
  registry,
  dispatch: applyDocumentSemanticEvent,
});
host.open(area);
```

The default host emits `document/*` events. The application resolves those
events to its own document operations and supplies the resulting canonical model
back through the Workspace host. Hestia sequencing and receipts remain outside
Hodos.

## Compatibility period

The following Hara UI exports remain stable during consumer migration:

```text
@hara-lang/ui/document-model
@hara-lang/ui/document-editor
@hara-lang/ui/document.css
@hara-lang/ui/document-hestia
```

They are compatibility entry points, not the target location for new visible
Workspace UI features. Removal requires a later major-version migration after
all known consumers are pinned to Hodos 2D.
