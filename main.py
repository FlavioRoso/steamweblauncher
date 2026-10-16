import os

import decky

from steamweblauncher.links import LinksStore
from steamweblauncher.browsers import detect_browsers, remove_profiles
from steamweblauncher import controller_templates
from steamweblauncher.settings import SettingsStore


class Plugin:
    settings: SettingsStore
    links: LinksStore

    async def ping(self) -> dict:
        decky.logger.info("ping received from frontend")
        return {
            "ok": True,
            "settings_dir": decky.DECKY_PLUGIN_SETTINGS_DIR,
            "user_home": decky.DECKY_USER_HOME,
        }

    async def log_info(self, message: str) -> None:
        decky.logger.info(f"frontend: {message}")

    async def get_settings(self) -> dict:
        return dict(self.settings.values)

    async def set_setting(self, key: str, value) -> dict:
        self.settings.set(key, value)
        decky.logger.info(f"setting changed: {key}={value!r}")
        return dict(self.settings.values)

    async def get_browsers(self) -> dict:
        return await detect_browsers(decky.DECKY_USER_HOME)

    async def list_links(self) -> list:
        return [dict(link) for link in self.links.links]

    async def save_link(self, link: dict) -> dict:
        record = self.links.save(link)
        decky.logger.info(f"link saved: {record['id']}")
        return record

    async def delete_link(self, link_id: str):
        removed = self.links.delete(link_id)
        if removed is None:
            return None
        for path in remove_profiles(decky.DECKY_USER_HOME, link_id):
            decky.logger.info(f"removed browser profile: {path}")
        decky.logger.info(f"link deleted: {link_id}")
        return removed

    async def _main(self):
        os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
        self.settings = SettingsStore(
            os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")
        )
        self.settings.load()
        self.links = LinksStore(
            os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "links.json")
        )
        self.links.load()
        try:
            for path in controller_templates.install(decky.DECKY_USER_HOME):
                decky.logger.info(f"controller template installed: {path}")
        except OSError as error:
            decky.logger.error(f"failed to install controller templates: {error}")
        decky.logger.info("steamweblauncher loaded")

    async def _unload(self):
        decky.logger.info("steamweblauncher unloaded")

    async def _uninstall(self):
        try:
            for path in controller_templates.uninstall(decky.DECKY_USER_HOME):
                decky.logger.info(f"controller template removed: {path}")
        except OSError as error:
            decky.logger.error(f"failed to remove controller templates: {error}")
        decky.logger.info("steamweblauncher uninstalled")

    async def _migration(self):
        pass
