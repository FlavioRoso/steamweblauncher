import { useEffect, useState } from "react";
import { listLinks } from "../backend";
import type { WebLink } from "../types";
import { EditView } from "./EditView";
import { MainView } from "./MainView";

type View = { name: "main" } | { name: "edit"; link?: WebLink };

export function WebLinksPanel() {
  const [view, setView] = useState<View>({ name: "main" });
  const [links, setLinks] = useState<WebLink[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    listLinks()
      .then(setLinks)
      .catch((error) => {
        console.error("steamweblauncher: failed to load web links", error);
        setLoadFailed(true);
      });
  }, []);

  const replaceOrAppend = (link: WebLink) =>
    setLinks((current) => {
      const list = current ?? [];
      return list.some((a) => a.id === link.id)
        ? list.map((a) => (a.id === link.id ? link : a))
        : [...list, link];
    });

  const goToMain = () => setView({ name: "main" });

  if (view.name === "edit") {
    return (
      <EditView
        link={view.link}
        onSaved={(link) => {
          replaceOrAppend(link);
          goToMain();
        }}
        onCancel={goToMain}
      />
    );
  }
  return (
    <MainView
      links={links}
      loadFailed={loadFailed}
      onAdd={() => setView({ name: "edit" })}
      onEdit={(link) => setView({ name: "edit", link })}
      onLinkUpdated={replaceOrAppend}
      onLinkDeleted={(link) =>
        setLinks((current) => current?.filter((a) => a.id !== link.id) ?? null)
      }
    />
  );
}
