import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  TextField,
} from "@decky/ui";
import { toaster } from "@decky/api";
import { useState } from "react";
import { t } from "../i18n";
import { NoBrowserError } from "../launcher";
import type { WebApp } from "../types";
import { InvalidUrlError, saveWebApp } from "../webApps";

const ERROR_COLOR = "#e5534b";

type Props = {
  app?: WebApp;
  onSaved: (app: WebApp) => void;
  onCancel: () => void;
};

export function EditView({ app, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(app?.title ?? "");
  const [url, setUrl] = useState(app?.url ?? "");
  const [urlInvalid, setUrlInvalid] = useState(false);
  const [saving, setSaving] = useState(false);

  const onConfirm = async () => {
    setSaving(true);
    setUrlInvalid(false);
    try {
      onSaved(await saveWebApp({ title, url }, app));
    } catch (error) {
      if (error instanceof InvalidUrlError) {
        setUrlInvalid(true);
      } else {
        console.error("steamweblauncher: save failed", error);
        const message =
          error instanceof NoBrowserError ? t("main.noBrowser") : t("edit.saveFailed");
        toaster.toast({ title: "steamweblauncher", body: message });
      }
      setSaving(false);
    }
  };

  return (
    <PanelSection title={t(app ? "edit.headingEdit" : "edit.headingNew")}>
      <PanelSectionRow>
        <TextField
          label={t("edit.titleLabel")}
          description={t("edit.titleHint")}
          value={title}
          disabled={saving}
          onChange={(e) => setTitle(e.target.value)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <TextField
          label={t("edit.urlLabel")}
          description={t("edit.urlHint")}
          value={url}
          disabled={saving}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlInvalid(false);
          }}
        />
      </PanelSectionRow>
      {urlInvalid && (
        <PanelSectionRow>
          <div style={{ color: ERROR_COLOR }}>{t("edit.invalidUrl")}</div>
        </PanelSectionRow>
      )}
      <PanelSectionRow>
        <ButtonItem layout="below" disabled={saving} onClick={onConfirm}>
          {saving ? t("edit.saving") : t("common.confirm")}
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" disabled={saving} onClick={onCancel}>
          {t("common.cancel")}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}
