import { Navigation } from "@decky/ui";

type CollectionStore = {
  SetAppsAsHidden(appIds: number[], hidden: boolean): void;
  BIsHidden(appId: number): boolean;
};

function collectionStore(): CollectionStore {
  return (window as unknown as { collectionStore: CollectionStore }).collectionStore;
}

const NON_STEAM_APP_TYPE = 1073741824;
const NON_STEAM_GAME_ID_FLAG = 0x02000000n;
const LAUNCH_SOURCE_LIBRARY_DETAILS = 100;

const APP_STORE_REGISTRATION_TIMEOUT_MS = 5000;
const APP_STORE_POLL_INTERVAL_MS = 50;
const APP_DETAILS_TIMEOUT_MS = 2000;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitUntilAppStoreKnows(appId: number): Promise<void> {
  const start = Date.now();
  while (!window.appStore.GetAppOverviewByAppID(appId)) {
    if (Date.now() - start > APP_STORE_REGISTRATION_TIMEOUT_MS) {
      throw new Error(`shortcut ${appId} did not appear in the link store`);
    }
    await sleep(APP_STORE_POLL_INTERVAL_MS);
  }
}

export async function addUnnamedShortcut(executable: string): Promise<number> {
  const appId = await SteamClient.Apps.AddShortcut("", executable, "", "");
  await waitUntilAppStoreKnows(appId);
  return appId;
}

export function removeShortcut(appId: number): void {
  SteamClient.Apps.RemoveShortcut(appId);
}

export function isShortcutHidden(appId: number): boolean {
  return collectionStore().BIsHidden(appId);
}

export function setShortcutHidden(appId: number, hidden: boolean): void {
  collectionStore().SetAppsAsHidden([appId], hidden);
}

export function getShortcutName(appId: number): string | undefined {
  return window.appStore.GetAppOverviewByAppID(appId)?.display_name;
}

export function getShortcutLaunchOptions(
  appId: number,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: string | undefined) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscription.unregister();
      resolve(value);
    };
    const timeout = setTimeout(() => finish(undefined), APP_DETAILS_TIMEOUT_MS);
    const subscription = SteamClient.Apps.RegisterForAppDetails(appId, (details) =>
      finish(details.strShortcutLaunchOptions),
    );
  });
}

export function setShortcutName(appId: number, name: string): void {
  SteamClient.Apps.SetShortcutName(appId, name);
}

export function setShortcutLaunchOptions(appId: number, options: string): void {
  SteamClient.Apps.SetShortcutLaunchOptions(appId, options);
}

export function shortcutExists(appId: number): boolean {
  return (
    window.appStore.GetAppOverviewByAppID(appId)?.app_type === NON_STEAM_APP_TYPE
  );
}

function shortcutGameId(appId: number): string {
  return ((BigInt(appId) << 32n) | NON_STEAM_GAME_ID_FLAG).toString();
}

export function runShortcut(appId: number): void {
  SteamClient.Apps.RunGame(shortcutGameId(appId), "", -1, LAUNCH_SOURCE_LIBRARY_DETAILS);
}

const DESKTOP_CONFIGURATION_APP_ID = 413080;
const NEVER_CHOSEN_LAYOUT_SELECTION_TYPE = 0;

type ControllerConfig = { URL?: string; eSelectionType?: number };

type ControllerConfiguratorStore = {
  m_controllerList: { nControllerIndex: number }[];
  SetActiveConfigForApp(
    appId: number,
    controllerIndex: number,
    url: string,
    param3: boolean,
  ): void;
};

function controllerConfiguratorStore(): ControllerConfiguratorStore | undefined {
  return (window as unknown as { controllerConfiguratorStore?: ControllerConfiguratorStore })
    .controllerConfiguratorStore;
}

async function getControllerConfig(
  appId: number,
  controllerIndex: number,
): Promise<ControllerConfig | undefined> {
  return SteamClient.Input.GetConfigForAppAndController(appId, controllerIndex);
}

export function getConnectedControllerIndexes(): number[] {
  return controllerConfiguratorStore()?.m_controllerList.map((c) => c.nControllerIndex) ?? [];
}

export async function getDesktopLayoutUrl(controllerIndex: number): Promise<string | undefined> {
  return (await getControllerConfig(DESKTOP_CONFIGURATION_APP_ID, controllerIndex))?.URL || undefined;
}

export async function hasNeverChosenLayout(appId: number, controllerIndex: number): Promise<boolean> {
  const config = await getControllerConfig(appId, controllerIndex);
  return config?.eSelectionType === NEVER_CHOSEN_LAYOUT_SELECTION_TYPE;
}

export function setControllerLayout(appId: number, controllerIndex: number, url: string): void {
  const store = controllerConfiguratorStore();
  if (!store) throw new Error("controllerConfiguratorStore not found");
  store.SetActiveConfigForApp(appId, controllerIndex, url, false);
}

export function openExternalUrl(url: string): void {
  Navigation.CloseSideMenus();
  Navigation.NavigateToExternalWeb(url);
}

type SteamUIWindow = { m_BrowserWindow?: Window; BrowserWindow?: Window };
type SteamUIStoreWindow = {
  SteamUIStore?: { WindowStore?: { GamepadUIMainWindowInstance?: SteamUIWindow } };
};

export function getGameModeUIScale(): number | undefined {
  const instance = (window as unknown as SteamUIStoreWindow).SteamUIStore?.WindowStore
    ?.GamepadUIMainWindowInstance;
  const scale = (instance?.m_BrowserWindow ?? instance?.BrowserWindow)?.devicePixelRatio;
  return scale && Number.isFinite(scale) && scale > 0 ? scale : undefined;
}

export function closeQuickAccessMenu(): void {
  Navigation.CloseSideMenus();
}
