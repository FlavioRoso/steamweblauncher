import os

import decky

from steamweblauncher.apps import AppsStore
from steamweblauncher.browsers import detect_browsers, remove_profiles
from steamweblauncher import controller_templates
from steamweblauncher.settings import SettingsStore


class Plugin:
    settings: SettingsStore
    apps: AppsStore

    async def ping(self) -> dict:
        decky.logger.info("ping received from frontend")
        return {
            "ok": True,
            "settings_dir": decky.DECKY_PLUGIN_SETTINGS_DIR,
            "user_home": decky.DECKY_USER_HOME,
        }

    async def get_user_home(self) -> str:
        return decky.DECKY_USER_HOME

    async def log_info(self, message: str) -> None:
        decky.logger.info(f"frontend: {message}")

    async def get_settings(self) -> dict:
        return dict(self.settings.values)

    async def set_setting(self, key: str, value) -> dict:
        self.settings.set(key, value)
        decky.logger.info(f"setting changed: {key}={value!r}")
        return dict(self.settings.values)

    async def get_browsers(self) -> dict:
        return await detect_browsers()

    async def list_apps(self) -> list:
        return [dict(app) for app in self.apps.apps]

    async def save_app(self, app: dict) -> dict:
        record = self.apps.save(app)
        decky.logger.info(f"web app saved: {record['id']}")
        return record

    async def delete_app(self, app_id: str):
        removed = self.apps.delete(app_id)
        if removed is None:
            return None
        for path in remove_profiles(decky.DECKY_USER_HOME, app_id):
            decky.logger.info(f"removed browser profile: {path}")
        decky.logger.info(f"web app deleted: {app_id}")
        return removed

    async def _main(self):
        os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
        self.settings = SettingsStore(
            os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")
        )
        self.settings.load()
        self.apps = AppsStore(
            os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "webapps.json")
        )
        self.apps.load()
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
