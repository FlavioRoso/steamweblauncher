import { callable } from "@decky/api";
import type { WebApp } from "./types";

export type Settings = {
  show_quick_access_tab: boolean;
  hide_new_apps: boolean;
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

export const listApps = callable<[], WebApp[]>("list_apps");

export const saveApp = callable<[app: WebApp], WebApp>("save_app");

export const deleteApp = callable<[appId: string], WebApp | null>("delete_app");

const fetchUserHome = callable<[], string>("get_user_home");

let cachedUserHome: Promise<string> | null = null;

export function getUserHome(): Promise<string> {
  cachedUserHome ??= fetchUserHome().catch((error) => {
    cachedUserHome = null;
    throw error;
  });
  return cachedUserHome;
}
