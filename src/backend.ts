import { callable } from "@decky/api";
import type { WebLink } from "./types";

export type Settings = {
  show_quick_access_tab: boolean;
  hide_new_links: boolean;
  use_desktop_layout: boolean;
};

export type Browser = { id: string; name: string };

export type BrowserStatus = {
  installed: Browser[];
  supported: Browser[];
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

const fetchUserHome = callable<[], string>("get_user_home");

let cachedUserHome: Promise<string> | null = null;

export function getUserHome(): Promise<string> {
  cachedUserHome ??= fetchUserHome().catch((error) => {
    cachedUserHome = null;
    throw error;
  });
  return cachedUserHome;
}
