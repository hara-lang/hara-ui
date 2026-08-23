import {
  haraGlyphCatalog,
  haraGlyphCategories,
  haraGlyphNames,
  haraIconCatalog,
  haraIconCategories,
  haraIconNames
} from "./icons.mjs";

export {
  haraGlyphCatalog,
  haraGlyphCategories,
  haraGlyphNames,
  haraIconCatalog,
  haraIconCategories,
  haraIconNames
};

const aliasMap = (catalog) => Object.freeze(Object.fromEntries(
  Object.entries(catalog).flatMap(([name, definition]) => definition.aliases.map((alias) => [alias, name]))
));

export const haraIconAliases = aliasMap(haraIconCatalog);
export const haraGlyphAliases = aliasMap(haraGlyphCatalog);

/** @param {string} name */
export function haraIconCanonicalName(name) {
  if (haraIconCatalog[name]) return name;
  return haraIconAliases[name] ?? null;
}

/** @param {string} name */
export function haraGlyphCanonicalName(name) {
  if (haraGlyphCatalog[name]) return name;
  return haraGlyphAliases[name] ?? null;
}

/** @param {string} name */
export function haraIconDefinition(name) {
  const canonical = haraIconCanonicalName(name);
  return canonical ? haraIconCatalog[canonical] : null;
}

/** @param {string} name */
export function haraGlyphDefinition(name) {
  const canonical = haraGlyphCanonicalName(name);
  return canonical ? haraGlyphCatalog[canonical] : null;
}

/** @param {string} category */
export function haraIconsInCategory(category) {
  return haraIconNames.filter((name) => haraIconCatalog[name].category === category);
}

/** @param {string} category */
export function haraGlyphsInCategory(category) {
  return haraGlyphNames.filter((name) => haraGlyphCatalog[name].category === category);
}
