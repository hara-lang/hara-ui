import assert from "node:assert/strict";
import test from "node:test";
import { RuntimeClient } from "../src/client.js";

class FakeWorker {
  constructor() {
    this.listeners = new Map();
    this.messages = [];
    this.terminated = false;
  }

  addEventListener(type, listener) {
    const values = this.listeners.get(type) || [];
    values.push(listener);
    this.listeners.set(type, values);
  }

  postMessage(message) {
    this.messages.push(message);
    if (["boot", "reset"].includes(message.type)) {
      queueMicrotask(() => this.emit("message", {
        type: "ready",
        id: message.id,
        namespace: message.namespace || "user"
      }));
    }
  }

  emit(type, data) {
    for (const listener of this.listeners.get(type) || []) listener({ data });
  }

  terminate() {
    this.terminated = true;
  }
}

function createClient(options = {}) {
  const worker = new FakeWorker();
  const client = new RuntimeClient(new URL("file:///runtime-worker.js"), {
    workerFactory: () => worker,
    hostCallTimeout: 100,
    ...options
  });
  return { client, worker };
}

async function waitFor(predicate, timeout = 250) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  throw new Error("condition was not reached before timeout");
}

test("boot requests remain correlated", async () => {
  const { client, worker } = createClient();
  const ready = await client.boot([], "app.core");
  assert.equal(ready.namespace, "app.core");
  assert.equal(worker.messages.filter((message) => message.type === "boot").length, 1);
  client.dispose();
});

test("host operations may come from an injected registry", async () => {
  const handlers = new Map();
  const registry = {
    registerHost(operation, handler) {
      handlers.set(operation, handler);
      return () => handlers.delete(operation);
    },
    handlerFor(operation) {
      return handlers.get(operation) || null;
    }
  };
  const { client, worker } = createClient({ hostRegistry: registry });
  client.registerHost("demo/add", (left, right) => left + right);
  worker.emit("message", {
    type: "host-call",
    id: "host-1",
    requestId: "request-9",
    operation: "demo/add",
    args: [20, 22]
  });
  const response = await waitFor(() => worker.messages.find((message) => message.id === "host-1"));
  assert.deepEqual(response, { type: "host-result", id: "host-1", value: 42 });
  client.dispose();
});

test("dispose aborts host work and terminates the worker", async () => {
  const { client, worker } = createClient();
  let signal;
  client.registerHost("demo/wait", (_value, context) => new Promise((resolve, reject) => {
    signal = context.signal;
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  }));
  worker.emit("message", {
    type: "host-call",
    id: "host-2",
    operation: "demo/wait",
    args: [true]
  });
  await waitFor(() => signal);
  client.dispose();
  assert.equal(signal.aborted, true);
  assert.equal(worker.terminated, true);
});
