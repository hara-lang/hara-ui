import { RuntimeBootContext } from "./boot-context.js";
import {
  bootClient,
  disposeClient,
  resetClient
} from "./client-protocol.js";
import { abortError, normaliseTimeout } from "./errors.js";
import { HostCallManager } from "./host-calls.js";
import { RuntimeRequestChannel } from "./request-channel.js";

export class RuntimeClient extends EventTarget {
  constructor(workerUrl, {
    workerFactory = null,
    hostCallTimeout = 15_000,
    hostRegistry = null,
    workerName = "hara-runtime"
  } = {}) {
    super();
    if (!workerUrl) throw new TypeError("RuntimeClient requires a worker URL");
    const createWorker = workerFactory || ((url, options) => new Worker(url, options));
    this.worker = createWorker(workerUrl, { type: "module", name: workerName });
    this.requests = new RuntimeRequestChannel(this.worker);
    this.bootContext = new RuntimeBootContext();
    this.hostHandlers = new Map();
    this.hostRegistry = hostRegistry;
    this.hostGeneration = 0;
    this.disposed = false;
    this.hostCalls = new HostCallManager({
      worker: this.worker,
      timeout: normaliseTimeout(hostCallTimeout),
      getGeneration: () => this.hostGeneration,
      isDisposed: () => this.disposed,
      resolveHandler: (operation) => this.hostRegistry?.handlerFor?.(operation)
        || this.hostHandlers.get(operation)
        || null
    });
    this.worker.addEventListener("message", (event) => this.handleMessage(event.data));
    this.worker.addEventListener("error", (event) => this.handleWorkerError(event));
  }

  handleWorkerError(event) {
    const error = event.error instanceof Error
      ? event.error
      : new Error(event.message || "Runtime worker failed");
    this.bootContext.abort(abortError("runtime/boot-context-cancelled:worker-error"));
    this.hostCalls.cancel(abortError("host/call-cancelled:worker-error"), { notify: false });
    this.requests.rejectAll(error);
    this.dispatchEvent(new CustomEvent("runtime-error", { detail: error }));
  }

  handleMessage(message) {
    if (this.disposed || !message) return;
    if (message.type === "host-call") {
      void this.hostCalls.handle(message);
      return;
    }
    if (["stdout", "effect", "diagnostic"].includes(message.type)) {
      this.dispatchEvent(new CustomEvent(message.type, { detail: message }));
      return;
    }
    this.requests.settle(message);
  }

  registerHost(operation, handler, options = {}) {
    if (typeof operation !== "string" || typeof handler !== "function") {
      throw new TypeError("registerHost requires an operation and handler");
    }
    if (this.disposed) throw new Error("Runtime disposed");
    if (typeof this.hostRegistry?.registerHost === "function") {
      return this.hostRegistry.registerHost(operation, handler, options);
    }
    this.hostHandlers.set(operation, handler);
    return () => {
      if (this.hostHandlers.get(operation) === handler) this.hostHandlers.delete(operation);
    };
  }

  setBootContextProvider(provider) {
    this.bootContext.setProvider(provider);
  }

  request(type, payload = {}) {
    return this.requests.request(type, payload);
  }

  boot(files, namespace = "user") {
    return bootClient(this, files, namespace);
  }

  eval(source, namespace) {
    return this.request("eval", { source, namespace });
  }

  loadFile(path, source, namespace) {
    return this.request("load-file", { path, source, namespace });
  }

  complete(prefix, namespace, source = "") {
    return this.request("complete", { prefix, namespace, source });
  }

  inspect(valueId) {
    return this.request("inspect", { valueId });
  }

  reset() {
    return resetClient(this);
  }

  dispose() {
    return disposeClient(this);
  }
}
