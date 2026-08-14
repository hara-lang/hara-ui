/** Generalized Hara WASM kernel boot shared by browser surfaces. */

function defaultResources(runtimeBase, docsAssetsBase) {
  return {
    "studio.store": `${docsAssetsBase}/rust/studio/hal/store.hal`,
    "studio.fs": `${docsAssetsBase}/rust/studio/hal/fs.hal`,
    "studio.node": `${runtimeBase}/studio/hal/node.hal`,
    "studio.draw": `${runtimeBase}/studio/hal/draw.hal`,
    "std.substrate.core": `${runtimeBase}/std/substrate/core.hal`,
    "std.substrate.frame": `${runtimeBase}/std/substrate/frame.hal`,
    "std.substrate.json": `${runtimeBase}/std/substrate/json.hal`,
    "std.substrate.protocol": `${runtimeBase}/std/substrate/protocol.hal`,
    "std.substrate.pubsub": `${runtimeBase}/std/substrate/pubsub.hal`,
    "std.substrate.request": `${runtimeBase}/std/substrate/request.hal`,
    "std.substrate.router": `${runtimeBase}/std/substrate/router.hal`,
    "std.substrate.space": `${runtimeBase}/std/substrate/space.hal`,
    "std.substrate.transport-memory": `${runtimeBase}/std/substrate/transport_memory.hal`,
    "std.substrate.util": `${runtimeBase}/std/substrate/util.hal`,
    "std.substrate.util-handlers": `${runtimeBase}/std/substrate/util_handlers.hal`,
    "std.substrate": `${runtimeBase}/std/substrate.hal`
  };
}

export function createProgressFetch(onProgress, baseFetch = fetch) {
  if (typeof onProgress !== "function") return baseFetch;
  let loaded = 0;
  let expected = 0;
  return async (input, init) => {
    const response = await baseFetch(input, init);
    const total = Number(response.headers.get("content-length")) || 0;
    expected += total;
    if (!response.body) return response;
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        loaded += value.byteLength;
        const percent = expected ? Math.min(99, Math.round(loaded / expected * 100)) : 0;
        onProgress("Loading Hara kernel", percent);
        controller.enqueue(value);
      }
    });
    return new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  };
}

async function resolveKernelFactory({ createKernel, kernelModuleUrl }) {
  if (createKernel) return createKernel;
  const module = await import(kernelModuleUrl);
  if (typeof module.createDocsKernel !== "function") {
    throw new Error(`kernel module ${kernelModuleUrl} does not export createDocsKernel`);
  }
  return module.createDocsKernel;
}

const bootCache = new Map();

export function createLiveKernel({
  runtimeBase = "/runtime",
  docsAssetsBase = "/docs-assets",
  kernelModuleUrl = null,
  createKernel = null,
  manifestUrl = null,
  workerUrl = null,
  resources = null,
  fetchAsset = null,
  onProgress = null
} = {}) {
  const resolved = {
    runtimeBase,
    docsAssetsBase,
    kernelModuleUrl: kernelModuleUrl ?? `${docsAssetsBase}/javascripts/kernel.js`,
    manifestUrl: manifestUrl ?? `${runtimeBase}/kernel-manifest.json`,
    workerUrl: workerUrl ?? `${runtimeBase}/hta-worker.js`,
    resources: resources ?? defaultResources(runtimeBase, docsAssetsBase)
  };
  const cacheKey = createKernel ? null : JSON.stringify(resolved);
  if (cacheKey && bootCache.has(cacheKey)) return bootCache.get(cacheKey);

  const progressFetch = createProgressFetch(onProgress, fetchAsset ?? fetch);
  const boot = Promise.resolve()
    .then(() => progressFetch(resolved.manifestUrl))
    .then(async (response) => {
      if (!response.ok) throw new Error(`kernel manifest: ${response.status}`);
      const manifest = await response.json();
      const factory = await resolveKernelFactory({ createKernel, kernelModuleUrl: resolved.kernelModuleUrl });
      return factory({
        wasmUrl: manifest.variants.core.url,
        workerUrl: resolved.workerUrl,
        manifest,
        resources: resolved.resources,
        fetchAsset: progressFetch
      });
    });

  if (cacheKey) {
    bootCache.set(cacheKey, boot);
    boot.catch(() => {
      if (bootCache.get(cacheKey) === boot) bootCache.delete(cacheKey);
    });
  }
  return boot;
}

export function resetLiveKernelCache() {
  bootCache.clear();
}
