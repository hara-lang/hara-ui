import { abortError } from "./errors.js";

export async function bootClient(client, files, namespace = "user") {
  const generation = advanceClientGeneration(client, "host/call-cancelled:boot");
  const context = await client.bootContext.prepare({
    files,
    namespace,
    generation,
    getGeneration: () => client.hostGeneration
  });
  return client.requests.request("boot", { files, namespace, ...context });
}

export function advanceClientGeneration(client, hostReason) {
  client.hostGeneration += 1;
  const lifecycle = String(hostReason).replace(/^host\/call-cancelled:/, "");
  client.bootContext.abort(abortError(`runtime/boot-context-cancelled:${lifecycle}`));
  client.hostCalls.cancel(abortError(hostReason));
  return client.hostGeneration;
}

export function resetClient(client) {
  advanceClientGeneration(client, "host/call-cancelled:reset");
  return client.requests.request("reset");
}

export function disposeClient(client) {
  if (client.disposed) return;
  client.disposed = true;
  client.hostGeneration += 1;
  client.bootContext.abort(abortError("runtime/boot-context-cancelled:dispose"));
  client.hostCalls.cancel(abortError("host/call-cancelled:dispose"), { notify: false });
  client.worker.terminate();
  client.requests.dispose();
  client.hostHandlers.clear();
}
