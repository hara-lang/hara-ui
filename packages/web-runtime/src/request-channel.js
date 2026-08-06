export class RuntimeRequestChannel {
  constructor(worker) {
    this.worker = worker;
    this.pending = new Map();
    this.sequence = 0;
    this.disposed = false;
  }

  request(type, payload = {}) {
    if (this.disposed) return Promise.reject(new Error("Runtime disposed"));
    const id = `request-${++this.sequence}`;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ type, id, ...payload });
    });
  }

  settle(message) {
    const pending = this.pending.get(message?.id);
    if (!pending) return false;
    this.pending.delete(message.id);
    if (message.type === "exception") {
      pending.reject(Object.assign(new Error(message.error.message), message.error));
    } else {
      pending.resolve(message);
    }
    return true;
  }

  rejectAll(error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.rejectAll(new Error("Runtime disposed"));
  }
}
