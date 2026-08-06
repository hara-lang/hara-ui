import {
  abortError,
  hostException,
  normaliseError,
  timeoutError
} from "./errors.js";

export class HostCallManager {
  constructor({
    worker,
    resolveHandler,
    getGeneration,
    isDisposed,
    timeout
  }) {
    this.worker = worker;
    this.resolveHandler = resolveHandler;
    this.getGeneration = getGeneration;
    this.isDisposed = isDisposed;
    this.timeout = timeout;
    this.active = new Map();
  }

  async handle(message) {
    const id = String(message.id || "");
    const operation = String(message.operation || "");
    if (!id || this.active.has(id)) {
      this.postException(id, new Error(`host/call-id-invalid:${id || "missing"}`));
      return;
    }

    const handler = this.resolveHandler(operation);
    if (!handler) {
      this.postException(id, new Error(`host/operation-unavailable:${operation}`));
      return;
    }

    const controller = new AbortController();
    const generation = this.getGeneration();
    const call = {
      id,
      operation,
      controller,
      generation,
      timer: null,
      finish: null
    };

    call.finish = (response = null) => {
      if (this.active.get(id) !== call) return false;
      this.active.delete(id);
      if (call.timer) clearTimeout(call.timer);
      call.timer = null;
      if (response && !this.isDisposed()) this.worker.postMessage(response);
      return true;
    };
    this.active.set(id, call);

    if (this.timeout > 0) {
      call.timer = setTimeout(() => {
        const error = timeoutError(`host/call-timeout:${operation}`);
        controller.abort(error);
        call.finish(hostException(id, error));
      }, this.timeout);
    }

    const context = Object.freeze({
      signal: controller.signal,
      generation,
      requestId: message.requestId || null,
      hostCallId: id,
      operation,
      sessionId: message.sessionId || null
    });

    try {
      const value = await handler(...(Array.isArray(message.args) ? message.args : []), context);
      if (controller.signal.aborted || generation !== this.getGeneration()) {
        const error = controller.signal.reason instanceof Error
          ? controller.signal.reason
          : abortError(`host/call-cancelled:${operation}`);
        call.finish(hostException(id, error));
        return;
      }
      call.finish({ type: "host-result", id, value });
    } catch (error) {
      const failure = controller.signal.aborted && controller.signal.reason instanceof Error
        ? controller.signal.reason
        : normaliseError(error);
      call.finish(hostException(id, failure));
    }
  }

  cancel(error, { notify = true } = {}) {
    for (const call of [...this.active.values()]) {
      if (!call.controller.signal.aborted) call.controller.abort(error);
      call.finish(notify ? hostException(call.id, error) : null);
    }
  }

  postException(id, error) {
    if (this.isDisposed()) return;
    this.worker.postMessage(hostException(id, error));
  }
}
