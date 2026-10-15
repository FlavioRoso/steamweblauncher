import { staticClasses } from "@decky/ui";
import { definePlugin } from "@decky/api";
import { FaGlobe } from "react-icons/fa";
import { getSettings } from "./backend";
import {
  installQuickAccessTab,
  setQuickAccessTabVisible,
  uninstallQuickAccessTab,
} from "./quickAccessTab";
import { QuickAccessTabPanel } from "./views/QuickAccessTabPanel";
import { SettingsView } from "./views/SettingsView";

export default definePlugin(() => {
  if (installQuickAccessTab(<FaGlobe />, <QuickAccessTabPanel />)) {
    getSettings()
      .then((settings) => setQuickAccessTabVisible(settings.show_quick_access_tab))
      .catch((error) => console.error("steamweblauncher: failed to load settings", error));
  } else {
    console.error("steamweblauncher: Decky tabs hook not found, Web tab unavailable");
  }

  return {
    name: "steamweblauncher",
    titleView: <div className={staticClasses.Title}>steamweblauncher</div>,
    content: <SettingsView />,
    icon: <FaGlobe />,
    onDismount() {
      uninstallQuickAccessTab();
    },
  };
});
