// @ts-check

/**
 * Public Hara v2 symbol inventory.
 *
 * Symbols own geometry and a stable semantic name only. Product commands,
 * capabilities, lifecycle facts, authority and permissions remain downstream
 * concerns. Every symbol is stroke-based, currentColor-compatible and framed
 * on the same 24 × 24 coordinate system.
 */

export const symbolViewBox = "0 0 24 24";
export const symbolOpticalSizes = Object.freeze([16, 20, 24, 32]);
export const symbolTones = Object.freeze(["current", "signal", "success", "warning", "danger", "muted"]);

export const symbolFamilies = Object.freeze([
  {
    id: "navigation",
    label: "Navigation and location",
    summary: "Movement, search, hierarchy and external destinations.",
    textRule: "Familiar navigation symbols may be icon-only when the control has an accessible name."
  },
  {
    id: "action",
    label: "Actions",
    summary: "Immediate commands and explicit mutations.",
    textRule: "Unfamiliar and destructive actions retain visible text; icon-only controls still require an accessible name."
  },
  {
    id: "state",
    label: "State",
    summary: "Runtime, evidence and lifecycle states expressed with words and non-colour cues.",
    textRule: "State symbols always accompany a visible state label."
  },
  {
    id: "capability",
    label: "Runtime capabilities",
    summary: "Host and provider capabilities available to a running Hara environment.",
    textRule: "Capability symbols remain text-supported because availability and authority are product facts."
  },
  {
    id: "product",
    label: "Products",
    summary: "Labelled Hara product marks for navigation and adoption guidance.",
    textRule: "Product symbols never replace the product name."
  },
  {
    id: "evidence",
    label: "Authority and evidence",
    summary: "Source, revision, registry, observation, receipt and accountable ownership.",
    textRule: "Evidence symbols remain adjacent to exact authority and revision text."
  }
]);

const record = (id, label, family, usage, options = {}) => Object.freeze({
  id,
  label,
  family,
  usage,
  text: options.text ?? "required",
  interactive: options.interactive ?? false,
  destructive: options.destructive ?? false,
  tone: options.tone ?? "current",
  shapeId: id
});

export const symbolInventory = Object.freeze([
  record("nav-home", "Home", "navigation", "Return to the product or catalogue home.", { text: "optional", interactive: true }),
  record("nav-back", "Back", "navigation", "Move to the previous location or step.", { text: "optional", interactive: true }),
  record("nav-forward", "Forward", "navigation", "Move to the next location or step.", { text: "optional", interactive: true }),
  record("nav-menu", "Menu", "navigation", "Open a bounded navigation disclosure.", { text: "optional", interactive: true }),
  record("nav-section", "Section", "navigation", "Identify a local section or outline destination.", { text: "optional", interactive: true }),
  record("nav-external", "External destination", "navigation", "Open a destination controlled outside the current product.", { text: "required", interactive: true }),
  record("nav-search", "Search", "navigation", "Find content or resources within the named scope.", { text: "optional", interactive: true }),
  record("nav-breadcrumb", "Breadcrumb context", "navigation", "Expose hierarchy and current location.", { text: "required" }),

  record("action-run", "Run", "action", "Start the selected program or work item.", { text: "optional", interactive: true, tone: "signal" }),
  record("action-stop", "Stop", "action", "Request an active operation to stop.", { text: "required", interactive: true }),
  record("action-restart", "Restart", "action", "Replace or restart the current generation.", { text: "required", interactive: true }),
  record("action-evaluate", "Evaluate", "action", "Evaluate the selected Hara form.", { text: "required", interactive: true, tone: "signal" }),
  record("action-edit", "Edit", "action", "Enter an explicit editing mode.", { text: "optional", interactive: true }),
  record("action-save", "Save", "action", "Persist the current author-owned change.", { text: "optional", interactive: true }),
  record("action-copy", "Copy", "action", "Copy an exact value, source form or revision.", { text: "optional", interactive: true }),
  record("action-inspect", "Inspect", "action", "Open evidence or properties for the selected value.", { text: "optional", interactive: true }),
  record("action-attach", "Attach", "action", "Attach an available capability or resource.", { text: "required", interactive: true }),
  record("action-detach", "Detach", "action", "Detach a capability or resource without implying disposal.", { text: "required", interactive: true }),
  record("action-publish", "Publish", "action", "Submit author intent to the controlling publication authority.", { text: "required", interactive: true, tone: "signal" }),
  record("action-approve", "Approve", "action", "Record an explicit positive review decision.", { text: "required", interactive: true, tone: "success" }),
  record("action-reject", "Reject", "action", "Record an explicit negative review decision.", { text: "required", interactive: true, destructive: true, tone: "danger" }),
  record("action-revoke", "Revoke", "action", "Remove previously granted authority or availability.", { text: "required", interactive: true, destructive: true, tone: "danger" }),

  record("state-ready", "Ready", "state", "Available and ready for the named operation.", { tone: "success" }),
  record("state-busy", "Busy", "state", "Actively processing and not yet terminal.", { tone: "signal" }),
  record("state-connecting", "Connecting", "state", "Attempting to establish a named connection.", { tone: "signal" }),
  record("state-connected", "Connected", "state", "Connection established under the named capability fence.", { tone: "success" }),
  record("state-warning", "Warning", "state", "Attention is required but the path may remain usable.", { tone: "warning" }),
  record("state-error", "Error", "state", "The named operation failed with evidence.", { tone: "danger" }),
  record("state-unavailable", "Unavailable", "state", "The capability or fact is not currently available; this is not automatically failure."),
  record("state-disabled", "Disabled", "state", "The action exists but cannot currently be invoked."),
  record("state-stale", "Stale", "state", "The fact exists but its revision or observation window is no longer current.", { tone: "warning" }),
  record("state-partial", "Partial", "state", "Only a named subset of the expected evidence or capability is present.", { tone: "warning" }),
  record("state-missing", "Missing", "state", "Required evidence is absent and must not become a zero value."),
  record("state-incomparable", "Incomparable", "state", "Values cannot be compared under the current method or evidence fence."),
  record("state-deprecated", "Deprecated", "state", "Available for compatibility but scheduled for replacement.", { tone: "warning" }),
  record("state-superseded", "Superseded", "state", "Replaced by a named newer identity or revision."),

  record("capability-session", "Session", "capability", "An isolated or shared Hara evaluation session."),
  record("capability-filesystem", "Filesystem", "capability", "File and directory access under a named mount and authority."),
  record("capability-network", "Network", "capability", "Network access under explicit host policy."),
  record("capability-process", "Process", "capability", "Process execution or supervision under an execution host."),
  record("capability-timer", "Timer", "capability", "Clock, delay or scheduling capability."),
  record("capability-message", "Message", "capability", "Message, queue or mailbox delivery capability."),
  record("capability-transaction", "Transaction", "capability", "Atomic storage or effect boundary."),
  record("capability-canvas", "Canvas", "capability", "Two-dimensional visual output and interaction surface."),
  record("capability-audio", "Audio", "capability", "Audio graph, playback or analysis capability."),
  record("capability-3d", "3D", "capability", "Three-dimensional scene or rendering capability."),
  record("capability-camera", "Camera", "capability", "Camera input under explicit device permission."),
  record("capability-microphone", "Microphone", "capability", "Microphone input under explicit device permission."),
  record("capability-provider", "External provider", "capability", "A capability implemented by a named external provider."),

  record("product-www", "WWW", "product", "Public Hara language and ecosystem site."),
  record("product-docs", "Docs", "product", "Guides, reference and executable documentation."),
  record("product-benchmarks", "Benchmarks", "product", "Reproducible performance evidence."),
  record("product-playground", "Playground", "product", "Runnable samples and live Hara workspaces."),
  record("product-specs", "Specs", "product", "Executable standards, checking and conformance."),
  record("product-packages", "Packages", "product", "Package discovery, namespace stewardship and publication."),
  record("product-world", "World", "product", "Community reading, feeds, discussion, presence and profiles."),
  record("product-learn", "Learn", "product", "Curriculum, lessons, practice and progress."),

  record("evidence-source", "Source", "evidence", "The source repository, file or content identity."),
  record("evidence-revision", "Exact revision", "evidence", "An immutable source, runtime, registry or fixture revision."),
  record("evidence-registry", "Registry", "evidence", "A registry-controlled identity or publication fact."),
  record("evidence-observation", "Runtime observation", "evidence", "A fact observed from a fenced runtime session and generation."),
  record("evidence-receipt", "Receipt", "evidence", "A durable result, publication or effect receipt."),
  record("evidence-external-authority", "External authority", "evidence", "A fact controlled outside the current product."),
  record("evidence-owned-bot", "User-owned bot", "evidence", "Automation visibly accountable to its present owner."),
  record("evidence-maintainer", "Verified maintainer", "evidence", "A maintainer identity supported by exact stewardship evidence.")
]);

const shapes = {
  "nav-home": { paths: ["M3 10.5 12 3l9 7.5", "M5.5 9.5V21h13V9.5", "M9 21v-6h6v6"] },
  "nav-back": { paths: ["M19 12H5", "m11-7-7 7 7 7"] },
  "nav-forward": { paths: ["M5 12h14", "m13-7 7 7-7 7"] },
  "nav-menu": { paths: ["M4 6h16", "M4 12h16", "M4 18h16"] },
  "nav-section": { paths: ["M5 4h14v16H5z", "M9 4v16", "M12 8h4", "M12 12h4", "M12 16h3"] },
  "nav-external": { paths: ["M14 4h6v6", "m20 4-9 9", "M18 13v7H4V6h7"] },
  "nav-search": { circles: [{ cx: 10.5, cy: 10.5, r: 6.5 }], paths: ["m15.5 15.5 4.5 4.5"] },
  "nav-breadcrumb": { paths: ["M4 7h5", "m9 4 3 3-3 3", "M13 12h5", "m18 9 3 3-3 3"] },

  "action-run": { paths: ["m8 5 11 7-11 7z"] },
  "action-stop": { rects: [{ x: 6, y: 6, width: 12, height: 12, rx: 1.5 }] },
  "action-restart": { paths: ["M20 11a8 8 0 1 0-2.3 5.7", "M20 5v6h-6"] },
  "action-evaluate": { paths: ["M5 4h8l6 6v10H5z", "M13 4v6h6", "m9 14 2 2 4-5"] },
  "action-edit": { paths: ["m4 20 4.5-1 10-10-3.5-3.5-10 10z", "m13.8 6.7 3.5 3.5"] },
  "action-save": { paths: ["M5 4h12l2 2v14H5z", "M8 4v6h8V4", "M8 20v-6h8v6"] },
  "action-copy": { rects: [{ x: 8, y: 8, width: 11, height: 11, rx: 1.5 }, { x: 5, y: 5, width: 11, height: 11, rx: 1.5 }] },
  "action-inspect": { circles: [{ cx: 12, cy: 12, r: 3 }], paths: ["M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z"] },
  "action-attach": { paths: ["M12 4v16", "M4 12h16", "M5 5h5", "M14 19h5"] },
  "action-detach": { paths: ["M5 5h5", "M14 19h5", "M5 19 19 5", "M8 12h8"] },
  "action-publish": { paths: ["M12 3v12", "m7 8 5-5 5 5", "M5 14v6h14v-6"] },
  "action-approve": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["m7.5 12 3 3 6-7"] },
  "action-reject": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["m8 8 8 8", "m16 8-8 8"] },
  "action-revoke": { paths: ["M5 5h14v14H5z", "m7 7 10 10", "m17 7-10 10"] },

  "state-ready": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["m7.5 12 3 3 6-7"] },
  "state-busy": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["M12 7v5l3 2"] },
  "state-connecting": { paths: ["M8 8a5.5 5.5 0 0 1 8 0", "M16 16a5.5 5.5 0 0 1-8 0", "M6 6h4v4", "M18 18h-4v-4"] },
  "state-connected": { paths: ["M8.5 15.5 6 18a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4 0", "m15.5 8.5 2.5-2.5a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 0", "m8 16 8-8"] },
  "state-warning": { paths: ["M12 3 22 20H2z", "M12 9v5", "M12 17h.01"] },
  "state-error": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["M12 7v6", "M12 17h.01"] },
  "state-unavailable": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["M5.6 5.6 18.4 18.4"] },
  "state-disabled": { paths: ["M6 6h12v12H6z", "M4 4l16 16"] },
  "state-stale": { paths: ["M4 8V4h4", "M4 4a9 9 0 1 1-1 10", "M12 7v5l4 2"] },
  "state-partial": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["M12 3v18", "M12 3a9 9 0 0 1 0 18"] },
  "state-missing": { paths: ["M6 3h9l3 3v15H6z", "M15 3v4h4", "M9 12h6", "M12 9v6"] },
  "state-incomparable": { paths: ["M4 7h7", "m8 4 3 3-3 3", "M20 17h-7", "m16 14-3 3 3 3"] },
  "state-deprecated": { paths: ["M5 5h14v14H5z", "M8 9h8", "M8 13h5", "M8 17h3"] },
  "state-superseded": { paths: ["M4 8h11", "m12 5 3 3-3 3", "M20 16H9", "m12 13-3 3 3 3"] },

  "capability-session": { rects: [{ x: 4, y: 4, width: 16, height: 16, rx: 2 }], paths: ["M4 8h16", "m8 12 2 2-2 2", "M12 16h4"] },
  "capability-filesystem": { paths: ["M3 7h7l2 2h9v10H3z", "M3 7V5h7l2 2"] },
  "capability-network": { circles: [{ cx: 12, cy: 12, r: 3 }, { cx: 5, cy: 5, r: 2 }, { cx: 19, cy: 5, r: 2 }, { cx: 12, cy: 20, r: 2 }], paths: ["m6.5 6.5 3.3 3.3", "m17.5 6.5-3.3 3.3", "M12 15v3"] },
  "capability-process": { rects: [{ x: 3, y: 5, width: 18, height: 14, rx: 2 }], paths: ["M7 9h4", "m8 13 2 2-2 2", "M13 16h4"] },
  "capability-timer": { circles: [{ cx: 12, cy: 13, r: 8 }], paths: ["M9 3h6", "M12 5v2", "M12 13l4-3"] },
  "capability-message": { paths: ["M4 5h16v12H9l-5 4z", "M8 9h8", "M8 13h5"] },
  "capability-transaction": { paths: ["M7 4h10v5H7z", "M5 9h14v11H5z", "M8 13h8", "M8 17h5"] },
  "capability-canvas": { rects: [{ x: 3, y: 4, width: 18, height: 16, rx: 2 }], paths: ["m6 16 4-4 3 3 3-4 3 5", "M8 8h.01"] },
  "capability-audio": { paths: ["M9 18V6l9-2v12", "M9 9l9-2"], circles: [{ cx: 6.5, cy: 18, r: 2.5 }, { cx: 15.5, cy: 16, r: 2.5 }] },
  "capability-3d": { paths: ["m12 3 8 4.5v9L12 21l-8-4.5v-9z", "m4 7.5 8 4.5 8-4.5", "M12 12v9"] },
  "capability-camera": { rects: [{ x: 3, y: 7, width: 18, height: 12, rx: 2 }], circles: [{ cx: 12, cy: 13, r: 3.5 }], paths: ["m8 7 1.5-3h5L16 7"] },
  "capability-microphone": { rects: [{ x: 9, y: 3, width: 6, height: 12, rx: 3 }], paths: ["M6 11a6 6 0 0 0 12 0", "M12 17v4", "M8 21h8"] },
  "capability-provider": { circles: [{ cx: 12, cy: 12, r: 3 }, { cx: 12, cy: 12, r: 8 }], paths: ["M12 1v3", "M12 20v3", "M1 12h3", "M20 12h3"] },

  "product-www": { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ["M3 12h18", "M12 3a14 14 0 0 1 0 18", "M12 3a14 14 0 0 0 0 18"] },
  "product-docs": { paths: ["M4 4h7a4 4 0 0 1 4 4v12H8a4 4 0 0 0-4 1z", "M20 4h-5a4 4 0 0 0-4 4v12h5a4 4 0 0 1 4 1z"] },
  "product-benchmarks": { paths: ["M4 20V10h4v10", "M10 20V5h4v15", "M16 20v-7h4v7", "M3 20h18"] },
  "product-playground": { paths: ["M7 5H4v14h3", "M17 5h3v14h-3", "m10 8 6 4-6 4z"] },
  "product-specs": { paths: ["M5 3h10l4 4v14H5z", "M15 3v5h5", "m8 14 2.5 2.5L16 10"] },
  "product-packages": { paths: ["m12 3 8 4.5v9L12 21l-8-4.5v-9z", "m4 7.5 8 4.5 8-4.5", "M12 12v9", "m8 5.2 8 4.6"] },
  "product-world": { circles: [{ cx: 12, cy: 12, r: 9 }, { cx: 8, cy: 10, r: 1.5 }, { cx: 16.5, cy: 8, r: 1.5 }, { cx: 15, cy: 16, r: 1.5 }], paths: ["m9.4 10 5.6-1.3", "m9 11.3 5 3.5", "m16 9.5-.7 5"] },
  "product-learn": { paths: ["M4 5h16v12H9l-5 4z", "M8 9h8", "M8 13h5", "M17 17v4"] },

  "evidence-source": { paths: ["M5 3h10l4 4v14H5z", "M15 3v5h5", "M8 12h8", "M8 16h5"] },
  "evidence-revision": { paths: ["M7 4h10v4H7z", "M5 8h14v12H5z", "M8 12h8", "M8 16h4"], circles: [{ cx: 17, cy: 17, r: 2 }] },
  "evidence-registry": { paths: ["M4 6h16", "M6 3h12v18H6z", "M9 10h6", "M9 14h6", "M9 18h4"] },
  "evidence-observation": { circles: [{ cx: 12, cy: 12, r: 3 }], paths: ["M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z", "M12 3V1", "M21 12h2"] },
  "evidence-receipt": { paths: ["M6 3h12v18l-3-2-3 2-3-2-3 2z", "M9 8h6", "M9 12h6", "m9 16 2 2 4-5"] },
  "evidence-external-authority": { paths: ["M5 4h9v7H5z", "M10 14h9v6h-9z", "m14 7 5-3", "m15 17-5 3"] },
  "evidence-owned-bot": { rects: [{ x: 5, y: 7, width: 14, height: 11, rx: 2 }], circles: [{ cx: 9, cy: 12, r: 1 }, { cx: 15, cy: 12, r: 1 }], paths: ["M12 3v4", "M9 18v3", "M15 18v3", "M8 15h8"] },
  "evidence-maintainer": { circles: [{ cx: 9, cy: 8, r: 3 }], paths: ["M3 20a6 6 0 0 1 12 0", "m15 13 2 2 4-5", "M16 5h5v5"] }
};

export const symbolShapes = Object.freeze(Object.fromEntries(
  Object.entries(shapes).map(([id, shape]) => [id, Object.freeze(shape)])
));

export const symbolById = (id) => symbolInventory.find((symbol) => symbol.id === id) ?? null;
export const symbolShapeById = (id) => symbolShapes[id] ?? null;
export const symbolsByFamily = (family) => symbolInventory.filter((symbol) => symbol.family === family);
export const symbolFamilyById = (id) => symbolFamilies.find((family) => family.id === id) ?? null;

export const symbolFixtureNotice = Object.freeze({
  productionAuthority: false,
  revision: "symbol-fixture:9b72d31f0a4c6e88",
  summary: "The inventory is a deterministic design-review fixture. Products, runtimes, registries, identity services and repositories remain authoritative for actions, capabilities, states, ownership and evidence."
});

export const symbolSummary = Object.freeze({
  symbols: symbolInventory.length,
  families: symbolFamilies.length,
  opticalSizes: symbolOpticalSizes.length,
  textRequired: symbolInventory.filter(({ text }) => text === "required").length,
  interactive: symbolInventory.filter(({ interactive }) => interactive).length,
  destructive: symbolInventory.filter(({ destructive }) => destructive).length
});
