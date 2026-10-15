import os
import re
from typing import NamedTuple

from .storage import write_text_atomic

class TemplateSource(NamedTuple):
    desktop_layout_file: str
    controller_type: str


HANDHELD_DESKTOP_LAYOUT = "desktop_xboxone.vdf"

TEMPLATES = {
    "xboxone": TemplateSource("desktop_xboxone.vdf", "controller_xboxone"),
    "ps4": TemplateSource("desktop_ps4.vdf", "controller_ps4"),
    "neptune": TemplateSource("desktop_neptune.vdf", "controller_neptune"),
    "switch_pro": TemplateSource(HANDHELD_DESKTOP_LAYOUT, "controller_switch_pro"),
}

TEMPLATE_PREFIX = "steamweblauncher_desktop_"
TEMPLATE_TITLE = "SteamWeb Launcher – Desktop"

LOCALIZATION = {
    "english": {
        "title": TEMPLATE_TITLE,
        "description": "Steam's desktop mode layout (keyboard and mouse) for web links.",
    },
    "brazilian": {
        "title": TEMPLATE_TITLE,
        "description": "Disposição do modo desktop do Steam (teclado e mouse) para links.",
    },
}


def steam_dir(user_home: str) -> str | None:
    for path in (
        os.path.join(user_home, ".steam", "steam"),
        os.path.join(user_home, ".local", "share", "Steam"),
    ):
        if os.path.isdir(os.path.join(path, "controller_base")):
            return os.path.realpath(path)
    return None


def _localization_block() -> str:
    lines = ['\t"localization"', "\t{"]
    for language, strings in LOCALIZATION.items():
        lines += [f'\t\t"{language}"', "\t\t{"]
        lines += [f'\t\t\t"{key}"\t\t"{value}"' for key, value in strings.items()]
        lines.append("\t\t}")
    lines.append("\t}")
    return "\n".join(lines)


def _template_from_desktop_layout(source: str, file_name: str, controller_type: str) -> str:
    text = re.sub(r'^(\s*)"title"\s+"[^"]*"', r'\1"title"\t\t"#Title"', source, count=1, flags=re.M)
    text = re.sub(
        r'^(\s*)"description"\s+"[^"]*"', r'\1"description"\t\t"#Description"', text, count=1, flags=re.M
    )
    header = "\n".join(
        [
            '\t"export_type"\t\t"template"',
            f'\t"url"\t\t"template://{file_name}"',
            _localization_block(),
        ]
    )
    return re.sub(
        r'^(\s*)"controller_type"\s+"[^"]*"\n',
        lambda m: f'{m.group(1)}"controller_type"\t\t"{controller_type}"\n{header}\n',
        text,
        count=1,
        flags=re.M,
    )


def install(user_home: str) -> list:
    root = steam_dir(user_home)
    if root is None:
        return []
    written = []
    for suffix, (source_name, controller_type) in TEMPLATES.items():
        source_path = os.path.join(root, "controller_base", source_name)
        try:
            with open(source_path, encoding="utf-8") as file:
                source = file.read()
        except FileNotFoundError:
            continue
        file_name = f"{TEMPLATE_PREFIX}{suffix}.vdf"
        target = os.path.join(root, "controller_base", "templates", file_name)
        content = _template_from_desktop_layout(source, file_name, controller_type)
        try:
            with open(target, encoding="utf-8") as file:
                if file.read() == content:
                    continue
        except FileNotFoundError:
            pass
        write_text_atomic(target, content)
        written.append(target)
    return written


def uninstall(user_home: str) -> list:
    root = steam_dir(user_home)
    if root is None:
        return []
    folder = os.path.join(root, "controller_base", "templates")
    removed = []
    for suffix in TEMPLATES:
        path = os.path.join(folder, f"{TEMPLATE_PREFIX}{suffix}.vdf")
        if os.path.exists(path):
            os.remove(path)
            removed.append(path)
    return removed
