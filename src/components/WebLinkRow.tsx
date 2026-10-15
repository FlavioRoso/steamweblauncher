import { DialogButton, Focusable } from "@decky/ui";
import { FaEye, FaEyeSlash, FaPen, FaTrash } from "react-icons/fa";
import { t } from "../i18n";
import { displayName, type WebLink } from "../types";

type Props = {
  link: WebLink;
  onOpen: (link: WebLink) => void;
  onEdit: (link: WebLink) => void;
  onToggleHidden: (link: WebLink) => void;
  onDelete: (link: WebLink) => void;
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

export function WebLinkRow({ link, onOpen, onEdit, onToggleHidden, onDelete }: Props) {
  return (
    <Focusable
      flow-children="horizontal"
      style={{ display: "flex", gap: "6px", width: "100%" }}
    >
      <DialogButton
        style={{ minWidth: 0, flex: 1, padding: "6px 10px", textAlign: "left" }}
        onClick={() => onOpen(link)}
      >
        <div style={ellipsis}>{displayName(link)}</div>
        <div style={{ ...ellipsis, fontSize: "11px", opacity: 0.6 }}>
          {link.url}
        </div>
      </DialogButton>
      <DialogButton
        style={iconButtonStyle}
        aria-label={t("main.edit")}
        onClick={() => onEdit(link)}
      >
        <FaPen />
      </DialogButton>
      <DialogButton
        style={iconButtonStyle}
        aria-label={t(link.hidden ? "main.show" : "main.hide")}
        onClick={() => onToggleHidden(link)}
      >
        {link.hidden ? <FaEyeSlash /> : <FaEye />}
      </DialogButton>
      <DialogButton
        style={iconButtonStyle}
        aria-label={t("main.delete")}
        onClick={() => onDelete(link)}
      >
        <FaTrash />
      </DialogButton>
    </Focusable>
  );
}
