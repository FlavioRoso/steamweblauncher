import asyncio
import os
import shutil
from typing import NamedTuple

PROFILES_FOLDER = "steamweblauncher"
COMMON_BINARY_DIRECTORIES = ["/usr/bin", "/usr/local/bin", "/bin", "/opt/bin"]


class SupportedBrowser(NamedTuple):
    name: str
    flatpak_id: str
    native_commands: tuple


SUPPORTED_BROWSERS = [
    SupportedBrowser("Google Chrome", "com.google.Chrome", ("google-chrome-stable", "google-chrome")),
    SupportedBrowser("Chromium", "org.chromium.Chromium", ("chromium", "chromium-browser")),
    SupportedBrowser("Brave", "com.brave.Browser", ("brave-browser", "brave")),
    SupportedBrowser("Microsoft Edge", "com.microsoft.Edge", ("microsoft-edge-stable", "microsoft-edge")),
    SupportedBrowser("Vivaldi", "com.vivaldi.Vivaldi", ("vivaldi-stable", "vivaldi")),
]


def _env_without_decky_libraries() -> dict:
    env = dict(os.environ)
    original = env.pop("LD_LIBRARY_PATH_ORIG", None)
    env.pop("LD_LIBRARY_PATH", None)
    if original:
        env["LD_LIBRARY_PATH"] = original
    return env


def _search_path() -> str:
    directories = os.environ.get("PATH", "").split(os.pathsep) + COMMON_BINARY_DIRECTORIES
    return os.pathsep.join(dict.fromkeys(d for d in directories if d))


def _find_executable(command: str):
    return shutil.which(command, path=_search_path())


def _flatpak_profiles_base(home: str, flatpak_id: str) -> str:
    return os.path.join(home, ".var", "app", flatpak_id, PROFILES_FOLDER)


def _native_profiles_base(home: str, command: str) -> str:
    return os.path.join(home, ".local", "share", PROFILES_FOLDER, "profiles", command)


def _all_profiles_bases(home: str) -> list:
    bases = []
    for browser in SUPPORTED_BROWSERS:
        bases.append(_flatpak_profiles_base(home, browser.flatpak_id))
        bases += [_native_profiles_base(home, command) for command in browser.native_commands]
    return bases


async def _installed_flatpak_apps(flatpak: str) -> set:
    process = await asyncio.create_subprocess_exec(
        flatpak, "list", "--app", "--columns=application",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=_env_without_decky_libraries(),
    )
    stdout, stderr = await process.communicate()
    if process.returncode != 0:
        raise RuntimeError(f"flatpak list failed: {stderr.decode().strip()}")
    return {line.strip() for line in stdout.decode().splitlines() if line.strip()}


def _native_browsers(home: str) -> list:
    found = []
    for browser in SUPPORTED_BROWSERS:
        for command in browser.native_commands:
            executable = _find_executable(command)
            if executable:
                found.append({
                    "id": command,
                    "name": browser.name,
                    "kind": "native",
                    "executable": executable,
                    "launch_prefix": [],
                    "profiles_dir": _native_profiles_base(home, command),
                })
                break
    return found


async def _flatpak_browsers(home: str) -> list:
    flatpak = _find_executable("flatpak")
    if not flatpak:
        return []
    installed_apps = await _installed_flatpak_apps(flatpak)
    return [
        {
            "id": browser.flatpak_id,
            "name": browser.name,
            "kind": "flatpak",
            "executable": flatpak,
            "launch_prefix": ["run", browser.flatpak_id],
            "profiles_dir": _flatpak_profiles_base(home, browser.flatpak_id),
        }
        for browser in SUPPORTED_BROWSERS
        if browser.flatpak_id in installed_apps
    ]


async def detect_browsers(home: str) -> dict:
    return {
        "installed": _native_browsers(home) + await _flatpak_browsers(home),
        "supported": [browser.name for browser in SUPPORTED_BROWSERS],
    }


def _is_direct_child(parent: str, path: str) -> bool:
    return os.path.dirname(path) == parent


def remove_profiles(home: str, link_id: str) -> list:
    removed = []
    for base in _all_profiles_bases(home):
        base = os.path.realpath(base)
        profile = os.path.realpath(os.path.join(base, link_id))
        if not _is_direct_child(base, profile) or not os.path.isdir(profile):
            continue
        shutil.rmtree(profile)
        removed.append(profile)
    return removed
