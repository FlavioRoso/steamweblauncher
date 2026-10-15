import { DialogButton, Focusable } from "@decky/ui";
import { FaEye, FaEyeSlash, FaPen, FaTrash } from "react-icons/fa";
import { t } from "../i18n";
import { displayName, type WebApp } from "../types";

type Props = {
  app: WebApp;
  onOpen: (app: WebApp) => void;
  onEdit: (app: WebApp) => void;
  onToggleHidden: (app: WebApp) => void;
  onDelete: (app: WebApp) => void;
};

const iconButtonStyle = {
  minWidth: 0,
  width: "36px",
  padding: "10px 0",
  flexShrink: 0,
};

const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

export function WebAppRow({ app, onOpen, onEdit, onToggleHidden, onDelete }: Props) {
  return (
    <Focusable
      flow-children="horizontal"
      style={{ display: "flex", gap: "6px", width: "100%" }}
    >
      <DialogButton
        style={{ minWidth: 0, flex: 1, padding: "6px 10px", textAlign: "left" }}
        onClick={() => onOpen(app)}
      >
        <div style={ellipsis}>{displayName(app)}</div>
        <div style={{ ...ellipsis, fontSize: "11px", opacity: 0.6 }}>
          {app.url}
        </div>
      </DialogButton>
      <DialogButton
        style={iconButtonStyle}
        aria-label={t("main.edit")}
        onClick={() => onEdit(app)}
      >
        <FaPen />
      </DialogButton>
      <DialogButton
        style={iconButtonStyle}
        aria-label={t(app.hidden ? "main.show" : "main.hide")}
        onClick={() => onToggleHidden(app)}
      >
        {app.hidden ? <FaEyeSlash /> : <FaEye />}
      </DialogButton>
      <DialogButton
        style={iconButtonStyle}
        aria-label={t("main.delete")}
        onClick={() => onDelete(app)}
      >
        <FaTrash />
      </DialogButton>
    </Focusable>
  );
}
