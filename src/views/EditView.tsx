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
import type { WebLink } from "../types";
import { InvalidUrlError, saveWebLink } from "../webLinks";

const ERROR_COLOR = "#e5534b";

type Props = {
  link?: WebLink;
  onSaved: (link: WebLink) => void;
  onCancel: () => void;
};

export function EditView({ link, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(link?.title ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [urlInvalid, setUrlInvalid] = useState(false);
  const [saving, setSaving] = useState(false);

  const onConfirm = async () => {
    setSaving(true);
    setUrlInvalid(false);
    try {
      onSaved(await saveWebLink({ title, url }, link));
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
    <PanelSection title={t(link ? "edit.headingEdit" : "edit.headingNew")}>
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
