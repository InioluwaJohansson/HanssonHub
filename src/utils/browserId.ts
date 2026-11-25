const BROWSER_ID_STORAGE_KEY = 'browserId';
let cachedBrowserId: string | null = null;

function normalizeBrowserId(value: unknown): string {
  if (value === undefined || value === null) return '';
  let str = String(value).trim();
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  if (!str || str === 'null' || str === 'undefined') return '';
  return str;
}

export function extractBrowserId(resData: any): string {
  if (resData === undefined || resData === null) return '';

  if (typeof resData === 'string') {
    const trimmed = resData.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return extractBrowserId(JSON.parse(trimmed));
      } catch {
        return normalizeBrowserId(trimmed);
      }
    }
    return normalizeBrowserId(trimmed);
  }

  if (typeof resData === 'number' || typeof resData === 'boolean') {
    return normalizeBrowserId(resData);
  }

  if (typeof resData === 'object') {
    const directCandidate =
      resData.browserId ??
      resData.BrowserId ??
      resData.result ??
      resData.Result ??
      resData.data ??
      resData.Data;
    if (directCandidate !== undefined && directCandidate !== null) {
      if (typeof directCandidate === 'object') {
        const nestedCandidate =
          directCandidate.browserId ??
          directCandidate.BrowserId ??
          directCandidate.id ??
          directCandidate.Id;
        return normalizeBrowserId(nestedCandidate);
      }
      return normalizeBrowserId(directCandidate);
    }
  }

  return '';
}

export function getBrowserId(): string {
  if (cachedBrowserId) {
    return cachedBrowserId;
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const existing = normalizeBrowserId(localStorage.getItem(BROWSER_ID_STORAGE_KEY));
      if (existing) {
        cachedBrowserId = existing;
        return existing;
      }
    }
  } catch {
    // Fall back to in-memory cached ID if storage is restricted
  }

  return '';
}

export function setBrowserId(id: unknown): string {
  const normalized = normalizeBrowserId(id);
  if (!normalized) {
    clearBrowserId();
    return '';
  }

  cachedBrowserId = normalized;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(BROWSER_ID_STORAGE_KEY, normalized);
    }
  } catch {
    // Ignore storage write errors when restricted
  }
  return normalized;
}

export function clearBrowserId(): void {
  cachedBrowserId = null;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(BROWSER_ID_STORAGE_KEY);
    }
  } catch {
    // Ignore storage removal errors
  }
}
