import {
  ButtonItem,
  ConfirmModal,
  PanelSection,
  PanelSectionRow,
  showModal,
} from "@decky/ui";
import { toaster } from "@decky/api";
import { FaPlus } from "react-icons/fa";
import { WebLinkRow } from "../components/WebLinkRow";
import { t } from "../i18n";
import { launchWebLink, NoBrowserError } from "../launcher";
import { displayName, type WebLink } from "../types";
import { deleteWebLink, setWebLinkHidden } from "../webLinks";

type Props = {
  links: WebLink[] | null;
  loadFailed: boolean;
  onAdd: () => void;
  onEdit: (link: WebLink) => void;
  onLinkUpdated: (link: WebLink) => void;
  onLinkDeleted: (link: WebLink) => void;
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
  links,
  loadFailed,
  onAdd,
  onEdit,
  onLinkUpdated,
  onLinkDeleted,
}: Props) {
  const openWebLink = async (link: WebLink) => {
    try {
      const stored = await launchWebLink(link);
      if (stored !== link) onLinkUpdated(stored);
    } catch (error) {
      console.error("steamweblauncher: launch failed", error);
      const message =
        error instanceof NoBrowserError ? t("main.noBrowser") : t("main.launchFailed");
      toastError(message);
    }
  };

  const toggleHidden = async (link: WebLink) => {
    try {
      onLinkUpdated(await setWebLinkHidden(link, !link.hidden));
    } catch (error) {
      console.error("steamweblauncher: visibility change failed", error);
      toastError(t("main.updateFailed"));
    }
  };

  const confirmDelete = (link: WebLink) => {
    showModal(
      <ConfirmModal
        strTitle={t("main.deleteTitle")}
        strDescription={t("main.deleteConfirm", { name: displayName(link) })}
        strOKButtonText={t("main.delete")}
        strCancelButtonText={t("common.cancel")}
        bDestructiveWarning
        onOK={async () => {
          try {
            await deleteWebLink(link);
            onLinkDeleted(link);
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
        {!loadFailed && links === null && <Message text={t("main.loading")} />}
        {links?.length === 0 && <Message text={t("main.empty")} />}
        {links?.map((link) => (
          <PanelSectionRow key={link.id}>
            <WebLinkRow
              link={link}
              onOpen={openWebLink}
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
