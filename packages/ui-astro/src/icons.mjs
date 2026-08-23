// @ts-check

const freezeDefinition = (definition) => Object.freeze({
  aliases: [],
  paths: [],
  circles: [],
  rects: [],
  accentPaths: [],
  ...definition,
  aliases: Object.freeze([...(definition.aliases ?? [])]),
  paths: Object.freeze([...(definition.paths ?? [])]),
  circles: Object.freeze([...(definition.circles ?? [])]),
  rects: Object.freeze([...(definition.rects ?? [])]),
  accentPaths: Object.freeze([...(definition.accentPaths ?? [])])
});

/**
 * Interface and state icons use a 24 × 24 monoline grid. All geometry is
 * original to Hara Visual Language and rendered with currentColor.
 */
export const haraIconCatalog = Object.freeze({
  home: freezeDefinition({ label: "Home", category: "navigation", paths: ["M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"] }),
  back: freezeDefinition({ label: "Back", category: "navigation", directional: true, paths: ["M15 5l-7 7 7 7", "M8 12h12"] }),
  forward: freezeDefinition({ label: "Forward", category: "navigation", directional: true, paths: ["M9 5l7 7-7 7", "M4 12h12"] }),
  up: freezeDefinition({ label: "Up", category: "navigation", directional: true, paths: ["M5 15l7-7 7 7", "M12 8v12"] }),
  menu: freezeDefinition({ label: "Menu", category: "navigation", paths: ["M4 7h16", "M4 12h16", "M4 17h16"] }),
  close: freezeDefinition({ label: "Close", category: "navigation", aliases: ["dismiss"], paths: ["M6 6l12 12", "M18 6 6 18"] }),
  search: freezeDefinition({ label: "Search", category: "navigation", paths: ["M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z", "m15.5 15.5 3.5 3.5"] }),
  filter: freezeDefinition({ label: "Filter", category: "navigation", paths: ["M4 6h16l-6 7v5l-4 2v-7z"] }),
  expand: freezeDefinition({ label: "Expand", category: "navigation", paths: ["m7 9 5 5 5-5"] }),
  collapse: freezeDefinition({ label: "Collapse", category: "navigation", paths: ["m7 15 5-5 5 5"] }),
  external: freezeDefinition({ label: "External link", category: "navigation", paths: ["M14 5h5v5", "m19 5-8 8", "M18 13v6H5V6h6"] }),
  more: freezeDefinition({ label: "More actions", category: "navigation", circles: [{ cx: 5, cy: 12, r: 1 }, { cx: 12, cy: 12, r: 1 }, { cx: 19, cy: 12, r: 1 }] }),

  add: freezeDefinition({ label: "Add", category: "action", aliases: ["create"], paths: ["M12 5v14", "M5 12h14"] }),
  remove: freezeDefinition({ label: "Remove", category: "action", paths: ["M5 12h14"] }),
  edit: freezeDefinition({ label: "Edit", category: "action", paths: ["M5 19h4L19 9l-4-4L5 15z", "m13.5 6.5 4 4"] }),
  copy: freezeDefinition({ label: "Copy", category: "action", paths: ["M9 9h10v10H9z", "M5 15V5h10"] }),
  save: freezeDefinition({ label: "Save", category: "action", paths: ["M5 4h12l2 2v14H5z", "M8 4v6h8V4", "M8 20v-6h8v6"] }),
  share: freezeDefinition({ label: "Share", category: "action", paths: ["m9 9 6-3", "m9 15 6 3"], circles: [{ cx: 6, cy: 12, r: 2.2 }, { cx: 18, cy: 5, r: 2.2 }, { cx: 18, cy: 19, r: 2.2 }] }),
  run: freezeDefinition({ label: "Run", category: "action", aliases: ["play"], paths: ["M8 5l11 7-11 7z"] }),
  stop: freezeDefinition({ label: "Stop", category: "action", rects: [{ x: 6, y: 6, width: 12, height: 12, rx: 1 }] }),
  retry: freezeDefinition({ label: "Retry", category: "action", paths: ["M6 8V4L3 7l3 3V8a7 7 0 1 1-1 7"] }),
  refresh: freezeDefinition({ label: "Refresh", category: "action", paths: ["M19 8a7 7 0 0 0-12-2L5 8", "M5 4v4h4", "M5 16a7 7 0 0 0 12 2l2-2", "M19 20v-4h-4"] }),
  download: freezeDefinition({ label: "Download", category: "action", paths: ["M12 4v11", "m8 11 4 4 4-4", "M5 19h14"] }),
  upload: freezeDefinition({ label: "Upload", category: "action", paths: ["M12 20V9", "m8 13 4-4 4 4", "M5 5h14"] }),
  publish: freezeDefinition({ label: "Publish", category: "action", paths: ["M5 12v7h14v-7", "M12 16V5", "m8 9 4-4 4 4"] }),
  inspect: freezeDefinition({ label: "Inspect", category: "action", aliases: ["view"], paths: ["M3.5 12s3.2-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3.2 5.5-8.5 5.5S3.5 12 3.5 12Z"], circles: [{ cx: 12, cy: 12, r: 2.4 }] }),
  compare: freezeDefinition({ label: "Compare", category: "action", paths: ["M7 5v14", "M17 5v14", "m4 8 3-3 3 3", "m20 16-3 3-3-3"] }),

  success: freezeDefinition({ label: "Success", category: "state", aliases: ["current"], paths: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z", "m8 12 2.7 2.7L16.5 9"] }),
  pending: freezeDefinition({ label: "Pending", category: "state", paths: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z", "M12 7v5l3 2"] }),
  warning: freezeDefinition({ label: "Warning", category: "state", paths: ["M12 3.5 21 20H3z", "M12 9v5", "M12 17h.01"] }),
  error: freezeDefinition({ label: "Error", category: "state", aliases: ["failed"], paths: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z", "m9 9 6 6", "m15 9-6 6"] }),
  unavailable: freezeDefinition({ label: "Unavailable", category: "state", paths: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z", "M6 18 18 6"] }),
  partial: freezeDefinition({ label: "Partial", category: "state", paths: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z", "M12 3.5v17", "M12 7a5 5 0 0 1 0 10"] }),
  stale: freezeDefinition({ label: "Stale", category: "state", paths: ["M12 5a7 7 0 1 0 6.5 4.5", "M18.5 5v4.5H14", "M12 8v4l-3 2"] }),
  "external-state": freezeDefinition({ label: "External authority", category: "state", paths: ["M14 5h5v5", "m19 5-8 8", "M18 13v6H5V6h6"] }),
  proposed: freezeDefinition({ label: "Proposed", category: "state", paths: ["M12 3.5 20.5 12 12 20.5 3.5 12Z", "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7", "M12 16h.01"] }),
  historical: freezeDefinition({ label: "Historical", category: "state", paths: ["M5 7h14v12H5z", "M4 4h16v3H4z", "M9 11h6", "M12 14v3"] }),
  locked: freezeDefinition({ label: "Locked", category: "state", paths: ["M6 10h12v10H6z", "M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10", "M12 14v2"] }),
  missing: freezeDefinition({ label: "Missing", category: "evidence", paths: ["M5 5h14v14H5z"], circles: [{ cx: 12, cy: 12, r: 1 }] }),
  zero: freezeDefinition({ label: "Measured zero", category: "evidence", paths: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z", "M8 12h8"] }),
  unsupported: freezeDefinition({ label: "Unsupported", category: "evidence", paths: ["M5 6h14v12H5z", "m8 9 8 6", "m16 9-8 6"] })
});

/**
 * Capability and product glyphs use a 32 × 32 identity grid. They may use one
 * functional signal accent, but they never encode live capability state.
 */
export const haraGlyphCatalog = Object.freeze({
  session: freezeDefinition({ label: "Session", category: "capability", paths: ["M5 5h22v22H5z", "M5 11h22", "M9 16h8", "M9 21h12"], accentPaths: ["M21 7h4v2h-4z"] }),
  code: freezeDefinition({ label: "Source and code", category: "capability", aliases: ["source"], paths: ["m12 8-6 8 6 8", "m20 8 6 8-6 8", "m18 6-4 20"], accentPaths: ["M14 14h4v4h-4z"] }),
  files: freezeDefinition({ label: "Files", category: "capability", paths: ["M6 8h8l3 3h9v15H6z", "M9 5h7l3 3h7v3"], accentPaths: ["M9 14h4v4H9z"] }),
  storage: freezeDefinition({ label: "Storage", category: "capability", paths: ["M6 7h20v6H6z", "M6 13h20v6H6z", "M6 19h20v6H6z"], accentPaths: ["M22 9h2v2h-2z", "M22 15h2v2h-2z", "M22 21h2v2h-2z"] }),
  canvas: freezeDefinition({ label: "Canvas", category: "capability", paths: ["M5 5h22v22H5z", "M8 22l6-6 4 4 6-8", "M8 25h16"], accentPaths: ["M9 8h4v4H9z"] }),
  "scene-3d": freezeDefinition({ label: "3D scene", category: "capability", paths: ["m16 4 10 6v12l-10 6-10-6V10z", "m6 10 10 6 10-6", "M16 16v12"], accentPaths: ["M14 6h4v4h-4z"] }),
  audio: freezeDefinition({ label: "Audio", category: "capability", paths: ["M6 14v4", "M10 10v12", "M14 6v20", "M18 9v14", "M22 12v8", "M26 14v4"], accentPaths: ["M14 4h4v4h-4z"] }),
  network: freezeDefinition({ label: "Network", category: "capability", paths: ["M8 9h16", "M8 23h16", "m9 10 5 5", "m23 10-5 5", "m9 22 5-5", "m23 22-5-5"], circles: [{ cx: 7, cy: 8, r: 3 }, { cx: 25, cy: 8, r: 3 }, { cx: 7, cy: 24, r: 3 }, { cx: 25, cy: 24, r: 3 }, { cx: 16, cy: 16, r: 3 }], accentPaths: ["M14 14h4v4h-4z"] }),
  timer: freezeDefinition({ label: "Timer", category: "capability", paths: ["M16 6a10 10 0 1 0 10 10A10 10 0 0 0 16 6Z", "M16 10v6l4 3", "M12 3h8"], accentPaths: ["M14 14h4v4h-4z"] }),
  queue: freezeDefinition({ label: "Queue", category: "capability", paths: ["M6 8h14", "M6 16h14", "M6 24h14", "m21 6 5 2-5 2", "m21 14 5 2-5 2", "m21 22 5 2-5 2"], accentPaths: ["M4 14h4v4H4z"] }),
  database: freezeDefinition({ label: "Database", category: "capability", paths: ["M6 8c0-3 20-3 20 0v16c0 3-20 3-20 0z", "M6 8c0 3 20 3 20 0", "M6 16c0 3 20 3 20 0"], accentPaths: ["M14 6h4v4h-4z"] }),
  native: freezeDefinition({ label: "Native host", category: "capability", paths: ["M8 8h16v16H8z", "M12 12h8v8h-8z", "M4 11h4", "M4 16h4", "M4 21h4", "M24 11h4", "M24 16h4", "M24 21h4", "M11 4v4", "M16 4v4", "M21 4v4", "M11 24v4", "M16 24v4", "M21 24v4"], accentPaths: ["M14 14h4v4h-4z"] }),
  wasm: freezeDefinition({ label: "Wasm and browser", category: "capability", paths: ["M5 6h22v20H5z", "M5 11h22", "M9 16l2 6 3-6 3 6 2-6"], accentPaths: ["M22 8h3v2h-3z"] }),
  package: freezeDefinition({ label: "Package", category: "capability", paths: ["m16 4 10 6v12l-10 6-10-6V10z", "m6 10 10 6 10-6", "M16 16v12", "m11 7 10 6"], accentPaths: ["M14 6h4v4h-4z"] }),
  namespace: freezeDefinition({ label: "Namespace", category: "capability", paths: ["M7 5H4v22h3", "M25 5h3v22h-3", "M11 10h10", "M11 16h6", "M11 22h10"], accentPaths: ["M9 14h4v4H9z"] }),
  agent: freezeDefinition({ label: "Agent or tool capability", category: "capability", paths: ["M16 7v5", "M16 20v5", "M7 16h5", "M20 16h5", "m9.5 9.5 3.5 3.5", "m19 19 3.5 3.5", "m22.5 9.5-3.5 3.5", "M13 19 9.5 22.5"], circles: [{ cx: 16, cy: 16, r: 4 }, { cx: 16, cy: 5, r: 2 }, { cx: 16, cy: 27, r: 2 }, { cx: 5, cy: 16, r: 2 }, { cx: 27, cy: 16, r: 2 }], accentPaths: ["M14 14h4v4h-4z"] }),

  "product-www": freezeDefinition({ label: "WWW", category: "product", paths: ["M4 6h24v20H4z", "M4 12h24", "M10 16h12", "M10 21h8"], accentPaths: ["M24 8h2v2h-2z"] }),
  "product-playground": freezeDefinition({ label: "Playground", category: "product", paths: ["M5 5h22v22H5z", "M11 10l11 6-11 6z"], accentPaths: ["M7 7h4v4H7z"] }),
  "product-specs": freezeDefinition({ label: "Specs", category: "product", paths: ["M7 5h18v22H7z", "M11 11h10", "M11 16h10", "M11 21h6", "m19 21 2 2 4-5"], accentPaths: ["M9 7h4v4H9z"] }),
  "product-packages": freezeDefinition({ label: "Packages", category: "product", paths: ["m10 5 8 4v9l-8 4-8-4V9z", "m22 10 8 4v9l-8 4-8-4v-3", "m2 9 8 4 8-4", "m14 14 8 4 8-4"], accentPaths: ["M8 7h4v4H8z"] }),
  "product-world": freezeDefinition({ label: "World", category: "product", paths: ["M16 5a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z", "M5 16h22", "M16 5c4 4 4 18 0 22", "M16 5c-4 4-4 18 0 22"], accentPaths: ["M14 14h4v4h-4z"] }),
  "product-learn": freezeDefinition({ label: "Learn", category: "product", paths: ["M4 7h10c2 0 2 2 2 2v17c0-2-2-3-4-3H4z", "M28 7H18c-2 0-2 2-2 2v17c0-2 2-3 4-3h8z"], accentPaths: ["M14 5h4v4h-4z"] })
});

export const haraIconNames = Object.freeze(Object.keys(haraIconCatalog));
export const haraGlyphNames = Object.freeze(Object.keys(haraGlyphCatalog));

export const haraIconCategories = Object.freeze([
  { id: "navigation", label: "Navigation and disclosure" },
  { id: "action", label: "Actions and editing" },
  { id: "state", label: "State" },
  { id: "evidence", label: "Evidence semantics" }
]);

export const haraGlyphCategories = Object.freeze([
  { id: "capability", label: "Runtime capabilities" },
  { id: "product", label: "Hara products" }
]);

/** @param {string} name */
export function haraIconDefinition(name) {
  return haraIconCatalog[name] ?? null;
}

/** @param {string} name */
export function haraGlyphDefinition(name) {
  return haraGlyphCatalog[name] ?? null;
}

/** @param {string} category */
export function haraIconsInCategory(category) {
  return haraIconNames.filter((name) => haraIconCatalog[name].category === category);
}

/** @param {string} category */
export function haraGlyphsInCategory(category) {
  return haraGlyphNames.filter((name) => haraGlyphCatalog[name].category === category);
}
