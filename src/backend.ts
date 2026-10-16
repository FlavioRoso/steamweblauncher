import { callable } from "@decky/api";
import type { WebLink } from "./types";

export type Settings = {
  show_quick_access_tab: boolean;
  hide_new_links: boolean;
  use_desktop_layout: boolean;
};

export type InstalledBrowser = {
  id: string;
  name: string;
  kind: "native" | "flatpak";
  executable: string;
  launch_prefix: string[];
  profiles_dir: string;
};

export type BrowserStatus = {
  installed: InstalledBrowser[];
  supported: string[];
};

export const getSettings = callable<[], Settings>("get_settings");

export const setSetting = callable<
  [key: keyof Settings, value: Settings[keyof Settings]],
  Settings
>("set_setting");

export const logInfo = callable<[message: string], void>("log_info");

export const getBrowsers = callable<[], BrowserStatus>("get_browsers");

export const listLinks = callable<[], WebLink[]>("list_links");

export const saveLink = callable<[link: WebLink], WebLink>("save_link");

export const deleteLink = callable<[appId: string], WebLink | null>("delete_link");

