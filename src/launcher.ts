import { getBrowsers, getSettings, saveLink, type InstalledBrowser } from "./backend";
import * as steam from "./steam";
import { displayName, type WebLink } from "./types";

const SKIP_NEW_PROFILE_PROMPTS_FLAGS = ["--no-first-run", "--no-default-browser-check"];
const FILL_GAMESCOPE_WINDOW_FLAG = "--start-fullscreen";

export class NoBrowserError extends Error {}

type ShortcutCommand = { executable: string; launchOptions: string };

function quoteForSteamArgumentParser(value: string): string {
  return `"${value.replace(/["\\$`]/g, "\\$&")}"`;
}

function profileSlug(webLinkId: string): string {
  return webLinkId.replace(/[^a-zA-Z0-9_-]/g, "-");
}

async function preferredInstalledBrowser(): Promise<InstalledBrowser> {
  const { installed } = await getBrowsers();
  if (!installed.length) throw new NoBrowserError();
  return installed[0];
}

function roundToHundredths(value: number): number {
  return Math.round(value * 100) / 100;
}

function matchGameModeScaleFlags(): string[] {
  const scale = steam.getGameModeUIScale();
  if (scale === undefined) return [];
  return [`--force-device-scale-factor=${roundToHundredths(scale)}`];
}

async function buildShortcutCommand(link: WebLink): Promise<ShortcutCommand> {
  const browser = await preferredInstalledBrowser();
  const profileDirectory = `${browser.profiles_dir}/${profileSlug(link.id)}`;
  const launchOptions = [
    ...browser.launch_prefix,
    `--app=${quoteForSteamArgumentParser(link.url)}`,
    `--user-data-dir=${quoteForSteamArgumentParser(profileDirectory)}`,
    ...SKIP_NEW_PROFILE_PROMPTS_FLAGS,
    FILL_GAMESCOPE_WINDOW_FLAG,
    ...matchGameModeScaleFlags(),
  ].join(" ");
  return { executable: browser.executable, launchOptions };
}

async function existingOrNewShortcut(link: WebLink, executable: string): Promise<number> {
  const existing = link.shortcut_app_id;
  if (existing !== null && steam.shortcutExists(existing)) return existing;
  return steam.addUnnamedShortcut(executable);
}

async function updateShortcutWhereChanged(
  appId: number,
  link: WebLink,
  command: ShortcutCommand,
): Promise<void> {
  const name = displayName(link);
  if (steam.getShortcutName(appId) !== name) {
    steam.setShortcutName(appId, name);
  }
  const current = await steam.getShortcutDetails(appId);
  if (current?.executable !== command.executable) {
    steam.setShortcutExecutable(appId, command.executable);
  }
  if (current?.launchOptions !== command.launchOptions) {
    steam.setShortcutLaunchOptions(appId, command.launchOptions);
  }
  if (steam.isShortcutHidden(appId) !== link.hidden) {
    steam.setShortcutHidden(appId, link.hidden);
  }
}

export async function prepareShortcut(link: WebLink): Promise<number> {
  const command = await buildShortcutCommand(link);
  const appId = await existingOrNewShortcut(link, command.executable);
  await updateShortcutWhereChanged(appId, link, command);
  return appId;
}

async function applyDesktopLayoutWhereNeverChosen(appId: number): Promise<void> {
  for (const index of steam.getConnectedControllerIndexes()) {
    const url = await steam.getDesktopLayoutUrl(index);
    if (url && (await steam.hasNeverChosenLayout(appId, index))) {
      steam.setControllerLayout(appId, index, url);
    }
  }
}

async function applyDesktopLayoutIfEnabled(appId: number): Promise<void> {
  try {
    if ((await getSettings()).use_desktop_layout) {
      await applyDesktopLayoutWhereNeverChosen(appId);
    }
  } catch (error) {
    console.error("steamweblauncher: failed to apply desktop controller layout", error);
  }
}

async function rememberShortcut(link: WebLink, appId: number): Promise<WebLink> {
  if (appId === link.shortcut_app_id) return link;
  return saveLink({ ...link, shortcut_app_id: appId });
}

export async function launchWebLink(link: WebLink): Promise<WebLink> {
  const appId = await prepareShortcut(link);
  const stored = await rememberShortcut(link, appId);
  await applyDesktopLayoutIfEnabled(appId);
  steam.closeQuickAccessMenu();
  steam.runShortcut(appId);
  return stored;
}
