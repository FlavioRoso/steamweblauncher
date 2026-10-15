from .storage import read_json_or_none, write_json_atomic

SETTINGS_VERSION = 1

DEFAULT_SETTINGS = {
    "show_quick_access_tab": True,
    "hide_new_apps": True,
    "use_desktop_layout": True,
}


class SettingsStore:
    def __init__(self, path: str):
        self.path = path
        self.values = dict(DEFAULT_SETTINGS)

    def load(self) -> None:
        data = read_json_or_none(self.path)
        if not isinstance(data, dict):
            return
        for key, default in DEFAULT_SETTINGS.items():
            if type(data.get(key)) is type(default):
                self.values[key] = data[key]

    def set(self, key: str, value) -> None:
        if key not in DEFAULT_SETTINGS:
            raise KeyError(f"unknown setting: {key}")
        expected = type(DEFAULT_SETTINGS[key])
        if type(value) is not expected:
            raise TypeError(f"{key} must be {expected.__name__}")
        self.values[key] = value
        write_json_atomic(self.path, {"version": SETTINGS_VERSION, **self.values})
