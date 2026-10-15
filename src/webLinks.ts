import { deleteLink, getSettings, saveLink } from "./backend";
import { prepareShortcut } from "./launcher";
import * as steam from "./steam";
import { normalizeUrl, type WebLink } from "./types";

export class InvalidUrlError extends Error {}

export type WebLinkInput = { title: string; url: string };

export async function saveWebLink(
  input: WebLinkInput,
  existing?: WebLink,
): Promise<WebLink> {
  const url = normalizeUrl(input.url);
  if (!url) throw new InvalidUrlError();

  const link: WebLink = {
    id: existing?.id ?? crypto.randomUUID(),
    title: input.title.trim(),
    url,
    hidden: existing ? existing.hidden : (await getSettings()).hide_new_links,
    shortcut_app_id: existing?.shortcut_app_id ?? null,
  };

  const appId = await prepareShortcut(link);
  try {
    return await saveLink({ ...link, shortcut_app_id: appId });
  } catch (error) {
    if (appId !== link.shortcut_app_id) steam.removeShortcut(appId);
    throw error;
  }
}

export async function setWebLinkHidden(link: WebLink, hidden: boolean): Promise<WebLink> {
  const stored = await saveLink({ ...link, hidden });
  const appId = stored.shortcut_app_id;
  if (appId !== null && steam.shortcutExists(appId)) {
    steam.setShortcutHidden(appId, hidden);
  }
  return stored;
}

export async function deleteWebLink(link: WebLink): Promise<void> {
  await deleteLink(link.id);
  const appId = link.shortcut_app_id;
  if (appId !== null && steam.shortcutExists(appId)) {
    steam.removeShortcut(appId);
  }
}
