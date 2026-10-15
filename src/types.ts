export type WebApp = {
  id: string;
  title: string;
  url: string;
  hidden: boolean;
  shortcut_app_id: number | null;
};

export function displayName(app: Pick<WebApp, "title" | "url">): string {
  return app.title.trim() || app.url;
}

const STARTS_WITH_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

function withDefaultScheme(address: string): string {
  return STARTS_WITH_SCHEME.test(address) ? address : `https://${address}`;
}

function isWebPage(url: URL): boolean {
  return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
}

function looksLikeMistypedScheme(url: URL): boolean {
  return Boolean(url.username || url.password);
}

export function normalizeUrl(input: string): string | null {
  const address = input.trim();
  if (!address) return null;
  try {
    const url = new URL(withDefaultScheme(address));
    return isWebPage(url) && !looksLikeMistypedScheme(url) ? url.href : null;
  } catch {
    return null;
  }
}
