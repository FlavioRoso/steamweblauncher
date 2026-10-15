import {
  ButtonItem,
  ConfirmModal,
  PanelSection,
  PanelSectionRow,
  showModal,
} from "@decky/ui";
import { toaster } from "@decky/api";
import { FaPlus } from "react-icons/fa";
import { WebAppRow } from "../components/WebAppRow";
import { t } from "../i18n";
import { launchWebApp, NoBrowserError } from "../launcher";
import { displayName, type WebApp } from "../types";
import { deleteWebApp, setWebAppHidden } from "../webApps";

type Props = {
  apps: WebApp[] | null;
  loadFailed: boolean;
  onAdd: () => void;
  onEdit: (app: WebApp) => void;
  onAppUpdated: (app: WebApp) => void;
  onAppDeleted: (app: WebApp) => void;
};

function Message({ text }: { text: string }) {
  return (
    <PanelSectionRow>
      <div style={{ opacity: 0.6 }}>{text}</div>
    </PanelSectionRow>
  );
}

function toastError(body: string) {
  toaster.toast({ title: "steamweblauncher", body });
}

export function MainView({
  apps,
  loadFailed,
  onAdd,
  onEdit,
  onAppUpdated,
  onAppDeleted,
}: Props) {
  const openWebApp = async (app: WebApp) => {
    try {
      const stored = await launchWebApp(app);
      if (stored !== app) onAppUpdated(stored);
    } catch (error) {
      console.error("steamweblauncher: launch failed", error);
      const message =
        error instanceof NoBrowserError ? t("main.noBrowser") : t("main.launchFailed");
      toastError(message);
    }
  };

  const toggleHidden = async (app: WebApp) => {
    try {
      onAppUpdated(await setWebAppHidden(app, !app.hidden));
    } catch (error) {
      console.error("steamweblauncher: visibility change failed", error);
      toastError(t("main.updateFailed"));
    }
  };

  const confirmDelete = (app: WebApp) => {
    showModal(
      <ConfirmModal
        strTitle={t("main.deleteTitle")}
        strDescription={t("main.deleteConfirm", { name: displayName(app) })}
        strOKButtonText={t("main.delete")}
        strCancelButtonText={t("common.cancel")}
        bDestructiveWarning
        onOK={async () => {
          try {
            await deleteWebApp(app);
            onAppDeleted(app);
          } catch (error) {
            console.error("steamweblauncher: delete failed", error);
            toastError(t("main.deleteFailed"));
          }
        }}
      />,
    );
  };

  return (
    <>
      <PanelSection>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={onAdd}>
            <FaPlus style={{ marginRight: "8px" }} />
            {t("main.add")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("main.listTitle")}>
        {loadFailed && <Message text={t("main.loadFailed")} />}
        {!loadFailed && apps === null && <Message text={t("main.loading")} />}
        {apps?.length === 0 && <Message text={t("main.empty")} />}
        {apps?.map((app) => (
          <PanelSectionRow key={app.id}>
            <WebAppRow
              app={app}
              onOpen={openWebApp}
              onEdit={onEdit}
              onToggleHidden={toggleHidden}
              onDelete={confirmDelete}
            />
          </PanelSectionRow>
        ))}
      </PanelSection>
    </>
  );
}
