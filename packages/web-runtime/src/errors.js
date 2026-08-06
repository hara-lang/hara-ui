export function normaliseError(error) {
  return error instanceof Error ? error : new Error(String(error));
}

export function abortError(message) {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

export function timeoutError(message) {
  const error = new Error(message);
  error.name = "TimeoutError";
  return error;
}

export function hostException(id, error) {
  const failure = normaliseError(error);
  return {
    type: "host-exception",
    id,
    error: {
      name: failure.name || "Error",
      message: failure.message || String(failure),
      data: failure.data || null,
      stack: failure.stack || null
    }
  };
}

export function normaliseTimeout(value, fallback = 15_000) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}
