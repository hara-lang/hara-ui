import { ARTEFACT_NODE_TYPE, TEXT_NODE_TYPE, cloneDocument, walkDocument } from "./document-model.js";

function artefactIndex(document) {
  const byId = new Map();
  walkDocument(document, (node) => {
    if (node.type !== ARTEFACT_NODE_TYPE || !node.attrs?.artefactId) return;
    const source = (node.children || []).find((child) => child.type === TEXT_NODE_TYPE) || null;
    byId.set(node.attrs.artefactId, { node, source });
  });
  return byId;
}

/**
 * Enriches UI-produced operations with stable AST targets required by Hestia's
 * operational-transformation admission path. It does not sign, sequence, hash,
 * submit or mutate the original batch.
 */
export function prepareHestiaBatch(document, batch) {
  const artefacts = artefactIndex(document);
  const prepared = cloneDocument(batch);
  prepared.operations = (prepared.operations || []).map((operation) => {
    if (operation.type !== "artefact.commit") return operation;
    const match = artefacts.get(operation.artefactId);
    if (!match) throw new Error(`Cannot prepare commit for missing artefact ${operation.artefactId}`);
    if (!match.source) throw new Error(`Artefact ${operation.artefactId} has no source text node`);
    return {
      ...operation,
      artefactNodeId: match.node.id,
      sourceTextId: match.source.id
    };
  });
  return prepared;
}

export function createHestiaDocumentClient({
  submit,
  prepare = prepareHestiaBatch,
  onReceipt = () => {},
  onConflict = () => {}
} = {}) {
  if (typeof submit !== "function") throw new Error("A Hestia submit function is required");
  return {
    async submit(document, batch) {
      const prepared = prepare(document, batch);
      const receipt = await submit(prepared);
      if (receipt?.outcome === "conflict" || receipt?.accepted === false) onConflict(receipt, prepared);
      else onReceipt(receipt, prepared);
      return receipt;
    }
  };
}
