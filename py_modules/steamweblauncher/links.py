import re
from urllib.parse import urlparse

from .storage import read_json_or_none, write_json_atomic

LINKS_VERSION = 1

ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
MAX_TITLE_LENGTH = 200
MAX_URL_LENGTH = 2048


def _validate(link) -> dict:
    if not isinstance(link, dict):
        raise ValueError("link must be an object")

    link_id = link.get("id")
    if not isinstance(link_id, str) or not ID_PATTERN.match(link_id):
        raise ValueError("invalid id")

    title = link.get("title", "")
    if not isinstance(title, str) or len(title) > MAX_TITLE_LENGTH:
        raise ValueError("invalid title")

    url = link.get("url")
    if not isinstance(url, str) or len(url) > MAX_URL_LENGTH:
        raise ValueError("invalid url")
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("url must be http(s)")

    hidden = link.get("hidden", False)
    if type(hidden) is not bool:
        raise ValueError("invalid hidden")

    shortcut_app_id = link.get("shortcut_app_id")
    if shortcut_app_id is not None and (
        type(shortcut_app_id) is not int or shortcut_app_id <= 0
    ):
        raise ValueError("invalid shortcut_app_id")

    return {
        "id": link_id,
        "title": title.strip(),
        "url": url.strip(),
        "hidden": hidden,
        "shortcut_app_id": shortcut_app_id,
    }


class LinksStore:
    def __init__(self, path: str):
        self.path = path
        self.links: list = []

    def load(self) -> None:
        data = read_json_or_none(self.path)
        if not isinstance(data, dict) or not isinstance(data.get("links"), list):
            return
        for link in data["links"]:
            try:
                self.links.append(_validate(link))
            except ValueError:
                continue

    def save(self, link) -> dict:
        record = _validate(link)
        for index, existing in enumerate(self.links):
            if existing["id"] == record["id"]:
                self.links[index] = record
                break
        else:
            self.links.append(record)
        self._write()
        return record

    def delete(self, link_id: str):
        for index, existing in enumerate(self.links):
            if existing["id"] == link_id:
                removed = self.links.pop(index)
                self._write()
                return removed
        return None

    def _write(self) -> None:
        write_json_atomic(self.path, {"version": LINKS_VERSION, "links": self.links})
