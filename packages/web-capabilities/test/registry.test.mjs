import assert from "node:assert/strict";
import test from "node:test";
import { WebCapabilityRegistry } from "../src/index.js";

test("capability-gated operations require a grant", async () => {
  const registry = new WebCapabilityRegistry();
  registry.register({
    operation: "audio/start",
    capability: "audio/playback",
    handler: (value) => value + 1
  });

  await assert.rejects(() => registry.invoke("audio/start", [1]), /capability\/not-granted/);
  registry.grant("audio/playback");
  assert.equal(await registry.invoke("audio/start", [1]), 2);
});

test("session resources are disposed together", async () => {
  const registry = new WebCapabilityRegistry();
  const disposed = [];
  registry.own("preview/button", {}, () => disposed.push("first"));
  registry.own("preview/button", {}, () => disposed.push("second"));

  await registry.disposeSession("preview/button");
  assert.deepEqual(disposed, ["second", "first"]);
});

test("registerHost preserves the RuntimeClient compatibility shape", async () => {
  const registry = new WebCapabilityRegistry();
  registry.registerHost("test/echo", (value, context) => ({ value, id: context.hostCallId }));
  const handler = registry.handlerFor("test/echo");
  assert.deepEqual(await handler("hello", { hostCallId: "host-1" }), {
    value: "hello",
    id: "host-1"
  });
});
