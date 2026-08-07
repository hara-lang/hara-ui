import {
  DOCUMENT_PROFILE,
  validateDocument,
} from "./document-model.js";

export const HARA_DOCUMENT_COMPATIBILITY = Object.freeze({
  status: "compatibility",
  legacyProfile: DOCUMENT_PROFILE,
  targetProfile: "hodos.rich-text/2",
  componentId: "hodos.2d/document",
  modelPackage: "@greenways/hodos-2d",
  modelProjector: "@greenways/hodos-2d/compat/hara-document",
  uiPackage: "@greenways/hodos-2d-ui",
  domHost: "@greenways/hodos-2d-ui/document-dom",
  stylesheet: "@greenways/hodos-2d-ui/document.css",
});

export function isLegacyHaraDocument(value) {
  return Boolean(value && typeof value === "object" && value.profile === DOCUMENT_PROFILE);
}

export function describeHaraDocumentCompatibility(document) {
  const errors = validateDocument(document);
  if (errors.length) {
    throw new Error(`Invalid legacy Hara document: ${errors.join("; ")}`);
  }
  return Object.freeze({
    ...HARA_DOCUMENT_COMPATIBILITY,
    documentId: document.id,
    revision: Number(document.revision) || 0,
    blockCount: document.children.length,
  });
}
