export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object"
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

export function buildUrl(baseUrl, path, query = {}) {
  let base;
  try { base = new URL(baseUrl); } catch { throw new TypeError("Нужен абсолютный baseUrl."); }
  if (!["http:", "https:"].includes(base.protocol) || base.search || base.hash) {
    throw new TypeError("baseUrl должен быть HTTP(S)-адресом без query и hash.");
  }
  if (typeof path !== "string" || !path.replace(/^\/+|\/+$/g, "")
    || /[?#:]/.test(path) || path.startsWith("//")
    || path.split("/").some((part) => part === "." || part === "..")) {
    throw new TypeError("Нужен непустой относительный путь без query и hash.");
  }
  if (!isPlainObject(query)) throw new TypeError("query должен быть объектом.");
  const url = new URL(base.href.replace(/\/+$/, "") + "/" + path.replace(/^\/+|\/+$/g, ""));
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(name, value);
  }
  return url.href;
}

export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 2000 } = {}) {
  buildUrl(baseUrl, "tasks");
  if (typeof fetchFn !== "function") throw new TypeError("fetchFn должен быть функцией.");
  function validateTimeout(value) {
    if (!Number.isSafeInteger(value) || value <= 0 || value > 2147483647) {
      throw new TypeError("timeoutMs должен быть положительным целым числом.");
    }
  }
  validateTimeout(timeoutMs);

  async function requestJson(path, { query = {}, signal, timeoutMs: requestTimeout = timeoutMs } = {}) {
    validateTimeout(requestTimeout);
    if (signal !== undefined && !(signal instanceof AbortSignal)) throw new TypeError("Нужен AbortSignal.");
    const url = buildUrl(baseUrl, path, query);
    const timerController = new AbortController();
    const combinedSignal = signal === undefined ? timerController.signal
      : AbortSignal.any([signal, timerController.signal]);
    const timer = setTimeout(() => timerController.abort(new DOMException("Время ожидания истекло", "TimeoutError")), requestTimeout);
    function requestError(cause) {
      const kind = combinedSignal.aborted
        ? (combinedSignal.reason === timerController.signal.reason && timerController.signal.aborted ? "timeout" : "aborted")
        : "network";
      const message = { timeout: "Превышено время ожидания ответа.", aborted: "Запрос отменён.", network: "Не удалось связаться с сервером." }[kind];
      return new ApiError(message, { kind, url, cause });
    }
    try {
      let response;
      try {
        combinedSignal.throwIfAborted();
        response = await fetchFn(url, { method: "GET", headers: { Accept: "application/json" }, signal: combinedSignal });
      } catch (cause) { throw requestError(cause); }
      if (!(response instanceof Response)) {
        throw new ApiError("Сервер не вернул Response.", { kind: "invalid-response", url });
      }
      if (!response.ok) {
        let payload;
        try { payload = await response.json(); } catch { /* Статус HTTP важнее неверного тела ошибки. */ }
        const error = payload?.error;
        throw new ApiError(typeof error?.message === "string" ? error.message : `Ошибка HTTP ${response.status}.`, {
          kind: "http", status: response.status, code: error?.code ?? null,
          details: error?.details ?? null, url,
        });
      }
      if (response.status === 204) return null;
      const contentType = response.headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase();
      if (contentType !== "application/json") {
        throw new ApiError("Ожидался Content-Type application/json.", { kind: "invalid-response", url });
      }
      try { return await response.json(); }
      catch (cause) {
        if (combinedSignal.aborted) throw requestError(cause);
        throw new ApiError("Ответ содержит некорректный JSON.", { kind: "invalid-response", url, cause });
      }
    } finally { clearTimeout(timer); }
  }
  return { requestJson };
}
