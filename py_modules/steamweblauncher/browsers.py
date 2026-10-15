import asyncio
import os
import shutil

FLATPAK_EXECUTABLE = "/usr/bin/flatpak"
PROFILES_FOLDER = "steamweblauncher"

SUPPORTED_BROWSERS = [
    {"id": "com.google.Chrome", "name": "Google Chrome"},
    {"id": "org.chromium.Chromium", "name": "Chromium"},
    {"id": "com.brave.Browser", "name": "Brave"},
    {"id": "com.microsoft.Edge", "name": "Microsoft Edge"},
    {"id": "com.vivaldi.Vivaldi", "name": "Vivaldi"},
]


def _env_without_decky_libraries() -> dict:
    env = dict(os.environ)
    original = env.pop("LD_LIBRARY_PATH_ORIG", None)
    env.pop("LD_LIBRARY_PATH", None)
    if original:
        env["LD_LIBRARY_PATH"] = original
    return env


async def _installed_flatpak_apps() -> set:
    process = await asyncio.create_subprocess_exec(
        FLATPAK_EXECUTABLE, "list", "--app", "--columns=application",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=_env_without_decky_libraries(),
    )
    stdout, stderr = await process.communicate()
    if process.returncode != 0:
        raise RuntimeError(f"flatpak list failed: {stderr.decode().strip()}")
    return {line.strip() for line in stdout.decode().splitlines() if line.strip()}


async def detect_browsers() -> dict:
    installed_apps = await _installed_flatpak_apps()
    return {
        "installed": [b for b in SUPPORTED_BROWSERS if b["id"] in installed_apps],
        "supported": SUPPORTED_BROWSERS,
    }


def _is_direct_child(parent: str, path: str) -> bool:
    return os.path.dirname(path) == parent


def remove_profiles(home: str, link_id: str) -> list:
    removed = []
    for browser in SUPPORTED_BROWSERS:
        base = os.path.realpath(os.path.join(home, ".var", "app", browser["id"], PROFILES_FOLDER))
        profile = os.path.realpath(os.path.join(base, link_id))
        if not _is_direct_child(base, profile) or not os.path.isdir(profile):
            continue
        shutil.rmtree(profile)
        removed.append(profile)
    return removed
