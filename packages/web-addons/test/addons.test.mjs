import assert from "node:assert/strict";
import test from "node:test";
import {
  createWebAddonHost,
  defineWebAddon,
  satisfiesAddonVersion,
} from "../src/index.js";

test("version ranges support exact, caret, tilde and wildcard dependencies", () => {
  assert.equal(satisfiesAddonVersion("1.2.3", "1.2.3"), true);
  assert.equal(satisfiesAddonVersion("1.5.0", "^1.2.3"), true);
  assert.equal(satisfiesAddonVersion("2.0.0", "^1.2.3"), false);
  assert.equal(satisfiesAddonVersion("0.2.8", "^0.2.1"), true);
  assert.equal(satisfiesAddonVersion("0.3.0", "^0.2.1"), false);
  assert.equal(satisfiesAddonVersion("1.2.9", "~1.2.3"), true);
  assert.equal(satisfiesAddonVersion("1.3.0", "~1.2.3"), false);
  assert.equal(satisfiesAddonVersion("9.0.0", "*"), true);
});

test("dependencies activate first and owned contributions are removed", async () => {
  const calls = [];
  const base = defineWebAddon({
    manifest: { id: "example/base", version: "1.0.0", requires: {}, capabilities: [] },
    activate(context) {
      calls.push("base:activate");
      context.contribute("service", "example/base", { ready: true });
      return () => calls.push("base:cleanup");
    },
  });
  const feature = defineWebAddon({
    manifest: {
      id: "example/feature",
      version: "1.0.0",
      requires: { "example/base": "^1.0.0" },
      capabilities: ["workspace/read"],
    },
    activate(context) {
      calls.push(`feature:${context.getContribution("service", "example/base").ready}`);
      context.contribute("command", "example/run", () => "done");
    },
  });
  const host = createWebAddonHost({ capabilities: ["workspace/read"] });
  host.register(feature, base);
  await host.activate("example/feature");
  assert.deepEqual(calls, ["base:activate", "feature:true"]);
  assert.deepEqual(host.active(), ["example/base", "example/feature"]);
  assert.equal(host.getContribution("command", "example/run")(), "done");
  await assert.rejects(host.deactivate("example/base"), /active dependents/);
  await host.deactivate("example/base", { cascade: true });
  assert.deepEqual(host.active(), []);
  assert.equal(host.getContribution("command", "example/run"), undefined);
  assert.deepEqual(calls, ["base:activate", "feature:true", "base:cleanup"]);
});

test("capabilities are scoped to host grants and add-on declarations", async () => {
  let context;
  const addon = defineWebAddon({
    manifest: {
      id: "example/clipboard",
      version: "1.0.0",
      requires: {},
      capabilities: ["clipboard/write"],
    },
    activate(value) { context = value; },
  });
  const denied = createWebAddonHost();
  denied.register(addon);
  await assert.rejects(denied.activate(), /requires host capabilities/);

  const allowed = createWebAddonHost({ capabilities: { has: (value) => value === "clipboard/write" } });
  allowed.register(addon);
  await allowed.activate();
  assert.equal(context.capabilities.has("clipboard/write"), true);
  assert.throws(() => context.capabilities.require("storage/local"), /did not declare/);
});

test("activation failure rolls back contributions and dependency cycles fail closed", async () => {
  const broken = defineWebAddon({
    manifest: { id: "example/broken", version: "1.0.0", requires: {}, capabilities: [] },
    activate(context) {
      context.contribute("temporary", "example/value", 42);
      throw new Error("broken activation");
    },
  });
  const host = createWebAddonHost();
  host.register(broken);
  await assert.rejects(host.activate(), /broken activation/);
  assert.equal(host.getContribution("temporary", "example/value"), undefined);
  assert.deepEqual(host.active(), []);

  const left = defineWebAddon({
    manifest: { id: "example/left", version: "1.0.0", requires: { "example/right": "*" }, capabilities: [] },
  });
  const right = defineWebAddon({
    manifest: { id: "example/right", version: "1.0.0", requires: { "example/left": "*" }, capabilities: [] },
  });
  const cyclic = createWebAddonHost();
  cyclic.register(left, right);
  await assert.rejects(cyclic.activate("example/left"), /dependency cycle/);
});
