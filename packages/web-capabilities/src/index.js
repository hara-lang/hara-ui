function normaliseName(value, label) {
  const name = String(value?.name ?? value ?? "").replace(/^:/, "").trim();
  if (!name) throw new TypeError(`${label} is required`);
  return name;
}

function detailEvent(type, detail) {
  if (typeof CustomEvent === "function") return new CustomEvent(type, { detail });
  const event = new Event(type);
  Object.defineProperty(event, "detail", { value: detail, enumerable: true });
  return event;
}

function normaliseError(error) {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Registry for capability-gated browser operations.
 *
 * Operations are registered independently from a Studio, Catalog or Playground
 * shell. A host may grant capabilities per registry, and callers may attach a
 * `sessionId` to invocation context so resources can be revoked together.
 */
export class WebCapabilityRegistry extends EventTarget {
  constructor({ grants = [], requestGrant = null } = {}) {
    super();
    this.operations = new Map();
    this.granted = new Set([...grants].map((value) => normaliseName(value, "capability")));
    this.requestGrant = requestGrant;
    this.sessionResources = new Map();
    this.disposed = false;
  }

  register({ operation, capability = null, handler, dispose = null }) {
    if (this.disposed) throw new Error("Capability registry disposed");
    const operationName = normaliseName(operation, "operation");
    const capabilityName = capability == null ? null : normaliseName(capability, "capability");
    if (typeof handler !== "function") throw new TypeError("capability operation handler is required");
    if (dispose != null && typeof dispose !== "function") throw new TypeError("capability operation dispose hook must be a function");

    const registration = Object.freeze({
      operation: operationName,
      capability: capabilityName,
      handler,
      dispose
    });
    this.operations.set(operationName, registration);
    this.dispatchEvent(detailEvent("operation-registered", registration));
    return () => {
      if (this.operations.get(operationName) !== registration) return false;
      this.operations.delete(operationName);
      this.dispatchEvent(detailEvent("operation-unregistered", registration));
      return true;
    };
  }

  registerHost(operation, handler, options = {}) {
    return this.register({ operation, handler, ...options });
  }

  registration(operation) {
    return this.operations.get(String(operation)) || null;
  }

  hasOperation(operation) {
    return this.operations.has(String(operation));
  }

  has(capability) {
    return this.granted.has(normaliseName(capability, "capability"));
  }

  grant(capability, detail = null) {
    if (this.disposed) throw new Error("Capability registry disposed");
    const name = normaliseName(capability, "capability");
    const added = !this.granted.has(name);
    this.granted.add(name);
    if (added) this.dispatchEvent(detailEvent("capability-granted", { capability: name, detail }));
    return added;
  }

  revoke(capability, detail = null) {
    const name = normaliseName(capability, "capability");
    const removed = this.granted.delete(name);
    if (removed) this.dispatchEvent(detailEvent("capability-revoked", { capability: name, detail }));
    return removed;
  }

  replaceGrants(capabilities = []) {
    const next = new Set([...capabilities].map((value) => normaliseName(value, "capability")));
    for (const capability of [...this.granted]) {
      if (!next.has(capability)) this.revoke(capability, { reason: "replace" });
    }
    for (const capability of next) this.grant(capability, { reason: "replace" });
    return this.listGrants();
  }

  listGrants() {
    return [...this.granted].sort();
  }

  async ensureGranted(capability, context = {}) {
    if (!capability || this.granted.has(capability)) return true;
    if (typeof this.requestGrant === "function") {
      const granted = await this.requestGrant({ capability, context, registry: this });
      if (granted) this.grant(capability, { reason: "request", context });
    }
    if (!this.granted.has(capability)) {
      throw new Error(`capability/not-granted:${capability}`);
    }
    return true;
  }

  async invoke(operation, args = [], context = {}) {
    if (this.disposed) throw new Error("Capability registry disposed");
    const name = normaliseName(operation, "operation");
    const registration = this.operations.get(name);
    if (!registration) throw new Error(`host/operation-unavailable:${name}`);
    await this.ensureGranted(registration.capability, context);
    this.dispatchEvent(detailEvent("operation-started", { operation: name, context }));
    try {
      const value = await registration.handler(...(Array.isArray(args) ? args : []), context);
      this.dispatchEvent(detailEvent("operation-completed", { operation: name, context, value }));
      return value;
    } catch (error) {
      const failure = normaliseError(error);
      this.dispatchEvent(detailEvent("operation-failed", { operation: name, context, error: failure }));
      throw failure;
    }
  }

  handlerFor(operation) {
    const name = normaliseName(operation, "operation");
    if (!this.operations.has(name)) return null;
    return (...args) => {
      const maybeContext = args.at(-1);
      const hasContext = maybeContext && typeof maybeContext === "object" && (
        "signal" in maybeContext || "sessionId" in maybeContext || "hostCallId" in maybeContext
      );
      const context = hasContext ? args.pop() : {};
      return this.invoke(name, args, context);
    };
  }

  own(sessionId, resource, dispose = null) {
    const id = normaliseName(sessionId, "sessionId");
    const disposer = dispose
      || (typeof resource?.dispose === "function" ? () => resource.dispose()
        : typeof resource?.close === "function" ? () => resource.close()
          : typeof resource?.abort === "function" ? () => resource.abort()
            : null);
    if (typeof disposer !== "function") throw new TypeError("owned resource requires a dispose, close or abort function");
    const record = { resource, dispose: disposer };
    if (!this.sessionResources.has(id)) this.sessionResources.set(id, new Set());
    this.sessionResources.get(id).add(record);
    return () => this.sessionResources.get(id)?.delete(record) || false;
  }

  async disposeSession(sessionId, reason = "session-disposed") {
    const id = normaliseName(sessionId, "sessionId");
    const records = [...(this.sessionResources.get(id) || [])];
    this.sessionResources.delete(id);
    const failures = [];
    for (const record of records.reverse()) {
      try {
        await record.dispose(reason);
      } catch (error) {
        failures.push(normaliseError(error));
      }
    }
    for (const registration of this.operations.values()) {
      if (typeof registration.dispose !== "function") continue;
      try {
        await registration.dispose({ sessionId: id, reason });
      } catch (error) {
        failures.push(normaliseError(error));
      }
    }
    this.dispatchEvent(detailEvent("session-disposed", { sessionId: id, reason, failures }));
    if (failures.length) throw new AggregateError(failures, `Unable to dispose capability resources for ${id}`);
  }

  async dispose(reason = "registry-disposed") {
    if (this.disposed) return;
    const sessionIds = [...this.sessionResources.keys()];
    const failures = [];
    for (const sessionId of sessionIds) {
      try {
        await this.disposeSession(sessionId, reason);
      } catch (error) {
        failures.push(normaliseError(error));
      }
    }
    this.operations.clear();
    this.granted.clear();
    this.disposed = true;
    this.dispatchEvent(detailEvent("disposed", { reason, failures }));
    if (failures.length) throw new AggregateError(failures, "Unable to dispose capability registry");
  }
}

export function createWebCapabilityRegistry(options) {
  return new WebCapabilityRegistry(options);
}
