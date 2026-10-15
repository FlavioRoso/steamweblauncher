import { getBrowsers, getSettings, getUserHome, saveApp } from "./backend";
import * as steam from "./steam";
import { displayName, type WebApp } from "./types";

const FLATPAK_EXECUTABLE = "/usr/bin/flatpak";
const PROFILES_FOLDER = "steamweblauncher";

const SKIP_NEW_PROFILE_PROMPTS_FLAGS = ["--no-first-run", "--no-default-browser-check"];
const FILL_GAMESCOPE_WINDOW_FLAG = "--start-fullscreen";

export class NoBrowserError extends Error {}

function quoteForSteamArgumentParser(value: string): string {
  return `"${value.replace(/["\\$`]/g, "\\$&")}"`;
}

function profileSlug(webAppId: string): string {
  return webAppId.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function isolatedProfileDirectory(home: string, browserId: string, webAppId: string): string {
  return `${home}/.var/app/${browserId}/${PROFILES_FOLDER}/${profileSlug(webAppId)}`;
}

async function firstInstalledBrowserId(): Promise<string> {
  const { installed } = await getBrowsers();
  if (!installed.length) throw new NoBrowserError();
  return installed[0].id;
}

function roundToHundredths(value: number): number {
  return Math.round(value * 100) / 100;
}

function matchGameModeScaleFlags(): string[] {
  const scale = steam.getGameModeUIScale();
  if (scale === undefined) return [];
  return [`--force-device-scale-factor=${roundToHundredths(scale)}`];
}

async function buildLaunchOptions(app: WebApp): Promise<string> {
  const [home, browserId] = await Promise.all([getUserHome(), firstInstalledBrowserId()]);
  const profileDirectory = isolatedProfileDirectory(home, browserId, app.id);
  return [
    "run",
    browserId,
    `--app=${quoteForSteamArgumentParser(app.url)}`,
    `--user-data-dir=${quoteForSteamArgumentParser(profileDirectory)}`,
    ...SKIP_NEW_PROFILE_PROMPTS_FLAGS,
    FILL_GAMESCOPE_WINDOW_FLAG,
    ...matchGameModeScaleFlags(),
  ].join(" ");
}

async function existingOrNewShortcut(app: WebApp): Promise<number> {
  const existing = app.shortcut_app_id;
  if (existing !== null && steam.shortcutExists(existing)) return existing;
  return steam.addUnnamedShortcut(FLATPAK_EXECUTABLE);
}

async function updateShortcutWhereChanged(
  appId: number,
  app: WebApp,
  launchOptions: string,
): Promise<void> {
  const name = displayName(app);
  if (steam.getShortcutName(appId) !== name) {
    steam.setShortcutName(appId, name);
  }
  if ((await steam.getShortcutLaunchOptions(appId)) !== launchOptions) {
    steam.setShortcutLaunchOptions(appId, launchOptions);
  }
  if (steam.isShortcutHidden(appId) !== app.hidden) {
    steam.setShortcutHidden(appId, app.hidden);
  }
}

export async function prepareShortcut(app: WebApp): Promise<number> {
  const launchOptions = await buildLaunchOptions(app);
  const appId = await existingOrNewShortcut(app);
  await updateShortcutWhereChanged(appId, app, launchOptions);
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

async function rememberShortcut(app: WebApp, appId: number): Promise<WebApp> {
  if (appId === app.shortcut_app_id) return app;
  return saveApp({ ...app, shortcut_app_id: appId });
}

export async function launchWebApp(app: WebApp): Promise<WebApp> {
  const appId = await prepareShortcut(app);
  const stored = await rememberShortcut(app, appId);
  await applyDesktopLayoutIfEnabled(appId);
  steam.closeQuickAccessMenu();
  steam.runShortcut(appId);
  return stored;
}
