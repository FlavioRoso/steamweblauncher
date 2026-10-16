import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  ToggleField,
} from "@decky/ui";
import { toaster } from "@decky/api";
import { useEffect, useState } from "react";
import {
  getBrowsers,
  getSettings,
  setSetting,
  type BrowserStatus,
  type Settings,
} from "../backend";
import { t } from "../i18n";
import { setQuickAccessTabVisible } from "../quickAccessTab";
import { openExternalUrl } from "../steam";

const DOCS_URL = "";

const OK_COLOR = "#59bf40";
const ERROR_COLOR = "#e5534b";

type BrowserCheck =
  | { state: "loading" }
  | { state: "error" }
  | { state: "done"; status: BrowserStatus };

function BrowserStatusLine({ check }: { check: BrowserCheck }) {
  if (check.state === "loading") {
    return <div style={{ opacity: 0.6 }}>{t("settings.checking")}</div>;
  }
  if (check.state === "error") {
    return <div style={{ color: ERROR_COLOR }}>{t("settings.browserCheckFailed")}</div>;
  }
  const [browser] = check.status.installed;
  if (browser) {
    return (
      <div style={{ color: OK_COLOR }}>
        {t("settings.browserFound", {
          name: browser.name,
          kind: t(browser.kind === "flatpak" ? "settings.kindFlatpak" : "settings.kindNative"),
        })}
      </div>
    );
  }
  const names = check.status.supported.join(", ");
  return (
    <div style={{ color: ERROR_COLOR }}>
      {t("settings.browserMissing", { browsers: names })}
    </div>
  );
}

export function SettingsView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [browserCheck, setBrowserCheck] = useState<BrowserCheck>({ state: "loading" });

  useEffect(() => {
    getSettings().then(setSettings).catch((error) => {
      console.error("steamweblauncher: failed to load settings", error);
    });
    getBrowsers()
      .then((status) => setBrowserCheck({ state: "done", status }))
      .catch((error) => {
        console.error("steamweblauncher: browser check failed", error);
        setBrowserCheck({ state: "error" });
      });
  }, []);

  const onToggle = (key: keyof Settings) => async (enabled: boolean) => {
    try {
      const updated = await setSetting(key, enabled);
      setSettings(updated);
      setQuickAccessTabVisible(updated.show_quick_access_tab);
    } catch (error) {
      console.error("steamweblauncher: failed to save setting", error);
      toaster.toast({ title: "steamweblauncher", body: t("settings.saveFailed") });
    }
  };

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <ToggleField
            label={t("settings.showTab")}
            description={t("settings.showTabDescription")}
            checked={settings?.show_quick_access_tab ?? false}
            disabled={!settings}
            onChange={onToggle("show_quick_access_tab")}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("settings.hideNewLinks")}
            description={t("settings.hideNewLinksDescription")}
            checked={settings?.hide_new_links ?? false}
            disabled={!settings}
            onChange={onToggle("hide_new_links")}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("settings.desktopLayout")}
            description={t("settings.desktopLayoutDescription")}
            checked={settings?.use_desktop_layout ?? false}
            disabled={!settings}
            onChange={onToggle("use_desktop_layout")}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("settings.browserTitle")}>
        <PanelSectionRow>
          <BrowserStatusLine check={browserCheck} />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={!DOCS_URL}
            onClick={() => openExternalUrl(DOCS_URL)}
          >
            {t("settings.docs")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}
