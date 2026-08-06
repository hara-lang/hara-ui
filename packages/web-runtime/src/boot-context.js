import { abortError } from "./errors.js";

export class RuntimeBootContext {
  constructor() {
    this.provider = null;
    this.active = null;
  }

  setProvider(provider) {
    if (provider != null && typeof provider !== "function") {
      throw new TypeError("boot context provider must be a function");
    }
    this.provider = provider;
  }

  async prepare({ files, namespace, generation, getGeneration }) {
    const controller = new AbortController();
    const active = { generation, controller };
    this.active = active;
    try {
      const context = await this.provider?.({
        files,
        namespace,
        generation,
        signal: controller.signal
      }) || {};
      if (controller.signal.aborted || generation !== getGeneration()) {
        throw controller.signal.reason instanceof Error
          ? controller.signal.reason
          : abortError("runtime/boot-context-cancelled:boot-superseded");
      }
      return context;
    } finally {
      if (this.active === active) this.active = null;
    }
  }

  abort(error) {
    const active = this.active;
    if (!active || active.controller.signal.aborted) return false;
    active.controller.abort(error);
    this.active = null;
    return true;
  }
}
