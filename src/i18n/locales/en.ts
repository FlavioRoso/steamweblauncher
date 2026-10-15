const en = {
  "common.confirm": "Confirm",
  "common.cancel": "Cancel",

  "main.add": "Add link",
  "main.listTitle": "Links",
  "main.empty": "No links yet.",
  "main.edit": "Edit",
  "main.delete": "Delete",
  "main.hide": "Hide from library",
  "main.show": "Show in library",
  "main.deleteTitle": "Delete link",
  "main.deleteConfirm": "Delete “{name}”? Its library entry and saved logins will be removed.",
  "main.deleteFailed": "Could not delete the link.",
  "main.updateFailed": "Could not update the link.",
  "main.launchFailed": "Could not open the link.",

  "edit.headingNew": "New link",
  "edit.headingEdit": "Edit link",
  "edit.titleLabel": "Title",
  "edit.titleHint": "Optional. Uses the URL when empty.",
  "edit.urlLabel": "URL",
  "edit.urlHint": "e.g. youtube.com",
  "edit.invalidUrl": "Enter a valid web address.",
  "edit.saving": "Saving…",
  "edit.saveFailed": "Could not save the link.",

  "main.noBrowser": "No supported browser installed.",
  "main.loading": "Loading…",
  "main.loadFailed": "Could not load links.",

  "tab.title": "Web",

  "settings.showTab": "Web tab",
  "settings.showTabDescription": "Shows the Web shortcut in the side menu.",
  "settings.hideNewLinks": "Hide new links",
  "settings.hideNewLinksDescription": "New links start hidden from the library. Use the eye button in the Web tab to change each one.",
  "settings.desktopLayout": "Desktop controller layout",
  "settings.desktopLayoutDescription": "Links still on Steam's default layout get the one Steam uses in desktop mode (touchpad and stick as mouse). Layouts you choose are kept.",
  "settings.saveFailed": "Could not save the setting.",
  "settings.browserTitle": "Browser",
  "settings.checking": "Checking…",
  "settings.browserFound": "{name} installed",
  "settings.browserMissing": "No supported browser installed: {browsers}",
  "settings.browserCheckFailed": "Could not check installed browsers.",
  "settings.docs": "Documentation",
};

export type TranslationKey = keyof typeof en;
export type Translations = Record<TranslationKey, string>;

export default en;
