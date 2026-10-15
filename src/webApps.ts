import { deleteApp, getSettings, saveApp } from "./backend";
import { prepareShortcut } from "./launcher";
import * as steam from "./steam";
import { normalizeUrl, type WebApp } from "./types";

export class InvalidUrlError extends Error {}

export type WebAppInput = { title: string; url: string };

export async function saveWebApp(
  input: WebAppInput,
  existing?: WebApp,
): Promise<WebApp> {
  const url = normalizeUrl(input.url);
  if (!url) throw new InvalidUrlError();

  const app: WebApp = {
    id: existing?.id ?? crypto.randomUUID(),
    title: input.title.trim(),
    url,
    hidden: existing ? existing.hidden : (await getSettings()).hide_new_apps,
    shortcut_app_id: existing?.shortcut_app_id ?? null,
  };

  const appId = await prepareShortcut(app);
  try {
    return await saveApp({ ...app, shortcut_app_id: appId });
  } catch (error) {
    if (appId !== app.shortcut_app_id) steam.removeShortcut(appId);
    throw error;
  }
}

export async function setWebAppHidden(app: WebApp, hidden: boolean): Promise<WebApp> {
  const stored = await saveApp({ ...app, hidden });
  const appId = stored.shortcut_app_id;
  if (appId !== null && steam.shortcutExists(appId)) {
    steam.setShortcutHidden(appId, hidden);
  }
  return stored;
}

export async function deleteWebApp(app: WebApp): Promise<void> {
  await deleteApp(app.id);
  const appId = app.shortcut_app_id;
  if (appId !== null && steam.shortcutExists(appId)) {
    steam.removeShortcut(appId);
  }
}
