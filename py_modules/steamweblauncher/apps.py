import re
from urllib.parse import urlparse

from .storage import read_json_or_none, write_json_atomic

APPS_VERSION = 1

ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
MAX_TITLE_LENGTH = 200
MAX_URL_LENGTH = 2048


def _validate(app) -> dict:
    if not isinstance(app, dict):
        raise ValueError("web app must be an object")

    app_id = app.get("id")
    if not isinstance(app_id, str) or not ID_PATTERN.match(app_id):
        raise ValueError("invalid id")

    title = app.get("title", "")
    if not isinstance(title, str) or len(title) > MAX_TITLE_LENGTH:
        raise ValueError("invalid title")

    url = app.get("url")
    if not isinstance(url, str) or len(url) > MAX_URL_LENGTH:
        raise ValueError("invalid url")
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("url must be http(s)")

    hidden = app.get("hidden", False)
    if type(hidden) is not bool:
        raise ValueError("invalid hidden")

    shortcut_app_id = app.get("shortcut_app_id")
    if shortcut_app_id is not None and (
        type(shortcut_app_id) is not int or shortcut_app_id <= 0
    ):
        raise ValueError("invalid shortcut_app_id")

    return {
        "id": app_id,
        "title": title.strip(),
        "url": url.strip(),
        "hidden": hidden,
        "shortcut_app_id": shortcut_app_id,
    }


class AppsStore:
    def __init__(self, path: str):
        self.path = path
        self.apps: list = []

    def load(self) -> None:
        data = read_json_or_none(self.path)
        if not isinstance(data, dict) or not isinstance(data.get("apps"), list):
            return
        for app in data["apps"]:
            try:
                self.apps.append(_validate(app))
            except ValueError:
                continue

    def save(self, app) -> dict:
        record = _validate(app)
        for index, existing in enumerate(self.apps):
            if existing["id"] == record["id"]:
                self.apps[index] = record
                break
        else:
            self.apps.append(record)
        self._write()
        return record

    def delete(self, app_id: str):
        for index, existing in enumerate(self.apps):
            if existing["id"] == app_id:
                removed = self.apps.pop(index)
                self._write()
                return removed
        return None

    def _write(self) -> None:
        write_json_atomic(self.path, {"version": APPS_VERSION, "apps": self.apps})
