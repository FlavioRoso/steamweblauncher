import { Focusable, scrollClasses, staticClasses } from "@decky/ui";
import { t } from "../i18n";
import { WebLinksPanel } from "./WebLinksPanel";

export function QuickAccessTabPanel() {
  return (
    <Focusable style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        className={staticClasses.Title}
        style={{ paddingTop: "3px", paddingRight: "16px", boxShadow: "unset" }}
      >
        {t("tab.title")}
      </div>
      <div
        className={`${scrollClasses.ScrollPanel} ${scrollClasses.ScrollY}`}
        style={{ flex: 1 }}
      >
        <WebLinksPanel />
      </div>
    </Focusable>
  );
}
