import { QuickAccessTab } from "@decky/ui";
import type { ReactNode } from "react";

type SteamQamTab = {
  key: number;
  title: ReactNode;
  tab: ReactNode;
  panel: ReactNode;
};

type TabsHook = {
  render(this: TabsHook, tabs: SteamQamTab[], visible: boolean): void;
};

type DeckyWindow = { DeckyPluginLoader?: { tabsHook?: TabsHook } };

const KEY_UNUSED_BY_STEAM_AND_DECKY_TABS = 7317;

let originalRender: TabsHook["render"] | null = null;
let ourTab: SteamQamTab | null = null;
let tabVisible = false;

function getTabsHook(): TabsHook | undefined {
  return (window as unknown as DeckyWindow).DeckyPluginLoader?.tabsHook;
}

function reinsertOurTabBeforeSettings(tabs: SteamQamTab[]): void {
  const current = tabs.findIndex((tab) => tab.key === KEY_UNUSED_BY_STEAM_AND_DECKY_TABS);
  if (current >= 0) tabs.splice(current, 1);
  if (!tabVisible || !ourTab) return;

  const settings = tabs.findIndex((tab) => tab.key === QuickAccessTab.Settings);
  tabs.splice(settings >= 0 ? settings : tabs.length, 0, ourTab);
}

export function installQuickAccessTab(icon: ReactNode, panel: ReactNode): boolean {
  const hook = getTabsHook();
  if (!hook || originalRender) return Boolean(originalRender);

  ourTab = { key: KEY_UNUSED_BY_STEAM_AND_DECKY_TABS, title: null, tab: icon, panel };
  const render = hook.render;
  originalRender = render;
  hook.render = function (tabs, visible) {
    render.call(this, tabs, visible);
    reinsertOurTabBeforeSettings(tabs);
  };
  return true;
}

export function setQuickAccessTabVisible(visible: boolean): void {
  tabVisible = visible;
}

export function uninstallQuickAccessTab(): void {
  const hook = getTabsHook();
  if (hook && originalRender) hook.render = originalRender;
  originalRender = null;
  ourTab = null;
}
