import { useEffect, useState } from "react";
import { listApps } from "../backend";
import type { WebApp } from "../types";
import { EditView } from "./EditView";
import { MainView } from "./MainView";

type View = { name: "main" } | { name: "edit"; app?: WebApp };

export function WebAppsPanel() {
  const [view, setView] = useState<View>({ name: "main" });
  const [apps, setApps] = useState<WebApp[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    listApps()
      .then(setApps)
      .catch((error) => {
        console.error("steamweblauncher: failed to load web apps", error);
        setLoadFailed(true);
      });
  }, []);

  const replaceOrAppend = (app: WebApp) =>
    setApps((current) => {
      const list = current ?? [];
      return list.some((a) => a.id === app.id)
        ? list.map((a) => (a.id === app.id ? app : a))
        : [...list, app];
    });

  const goToMain = () => setView({ name: "main" });

  if (view.name === "edit") {
    return (
      <EditView
        app={view.app}
        onSaved={(app) => {
          replaceOrAppend(app);
          goToMain();
        }}
        onCancel={goToMain}
      />
    );
  }
  return (
    <MainView
      apps={apps}
      loadFailed={loadFailed}
      onAdd={() => setView({ name: "edit" })}
      onEdit={(app) => setView({ name: "edit", app })}
      onAppUpdated={replaceOrAppend}
      onAppDeleted={(app) =>
        setApps((current) => current?.filter((a) => a.id !== app.id) ?? null)
      }
    />
  );
}
