# SteamWeb Launcher

**English** | [Português (Brasil)](README.pt-BR.md)

A [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) plugin that opens websites in **Game Mode** as if they were games.

Each link you add becomes a non-Steam shortcut that opens the site in its own browser window, fullscreen and without an address bar. Discord, YouTube, Twitch or any other site gets a place in your library, receives proper focus from gamescope and can stay open alongside other apps.

- **Isolated profile per link:** each site keeps its own logins and cookies, and several can be open at the same time.
- **"Web" tab in the Quick Access menu (`...` button):** add, edit, delete and open links without leaving your game.
- **Library:** each link can be shown or hidden (eye button). Hidden links still open from the Web tab.
- **Controller:** links with no layout chosen get Steam's desktop mode controller layout (touchpad and stick as mouse). The plugin also installs "SteamWeb Launcher – Desktop" templates in Steam's layout picker.
- **Scale:** pages follow the Game Mode interface scale.
- **Languages:** English and Portuguese (Brazil), following Steam's language.

Tested on a ROG Xbox Ally X running Bazzite. It only relies on Steam's Game Mode, gamescope and Decky Loader, so it should work on SteamOS (Steam Deck), Bazzite, CachyOS, ChimeraOS, Nobara, PikaOS and other systems with a Game Mode session.

## Installation

### 1. Decky Loader

If you don't have it yet, follow the instructions at [decky.xyz](https://decky.xyz). Bazzite may already ship with Decky. If it doesn't, run `ujust setup-decky` in a terminal.

### 2. A Chromium-based browser

The plugin uses one of these browsers, installed either as a regular system package (**native**) or as a **Flatpak**:

| Browser | Native command | Flatpak ID |
|---|---|---|
| Google Chrome | `google-chrome-stable` | `com.google.Chrome` |
| Chromium | `chromium` or `chromium-browser` | `org.chromium.Chromium` |
| Brave | `brave-browser` | `com.brave.Browser` |
| Microsoft Edge | `microsoft-edge-stable` | `com.microsoft.Edge` |
| Vivaldi | `vivaldi-stable` | `com.vivaldi.Vivaldi` |

If more than one is installed, native browsers come first, then Flatpaks, each in the order of the table.

How to install one depends on your system:

- **SteamOS (Steam Deck):** in Game Mode, Library > **Non-Steam** tab, SteamOS offers to install Google Chrome. Or search for "Chrome" or "Chromium" in **Discover** in Desktop Mode.
- **Bazzite, ChimeraOS and other image-based systems:** use a Flatpak, since the system image is read-only. From the store (**Bazaar** on Bazzite) or from a terminal:
  ```bash
  flatpak install --system flathub com.google.Chrome
  ```
- **CachyOS and other Arch-based systems:** `sudo pacman -S chromium`
- **Nobara and other Fedora-based systems:** `sudo dnf install chromium`
- **PikaOS and other Debian-based systems:** `sudo apt install chromium`

Any of the browsers in the table also works as a Flatpak on these systems, if Flatpak is set up.

To check: on the plugin's page in Decky, the **Browser** section shows which one was found and whether it is native or Flatpak.

### 3. The plugin

The plugin is not in the Decky store yet. Install it with one command, in Desktop Mode (Konsole or another terminal) or over SSH:

```bash
curl -fsSL https://github.com/FlavioRoso/steamweblauncher/releases/latest/download/install.sh | bash
```

It downloads the latest release, already built, into Decky's plugin folder and restarts Decky. It asks for your password (sudo) because that folder belongs to root. Nothing else needs to be installed besides Decky and the browser.

Back in Game Mode, the plugin shows up in Decky's list as **steamweblauncher**, and the **Web** tab appears in the Quick Access menu.

- **Update:** run the same command again.
- **A specific version:** `curl -fsSL https://github.com/FlavioRoso/steamweblauncher/releases/latest/download/install.sh | STEAMWEBLAUNCHER_VERSION=v0.1.0 bash`
- **Without the terminal:** download `steamweblauncher.zip` from [Releases](https://github.com/FlavioRoso/steamweblauncher/releases), turn on **Developer mode** in Decky's **Settings > General**, and use **Settings > Developer > Install Plugin from ZIP File**.
- **Uninstall:** in Decky's **Settings > Plugins**, open the menu next to **steamweblauncher** and choose **Uninstall**.

## Usage

1. Open the Quick Access menu (`...` button) and go to the **Web** tab (globe icon).
2. Tap **Add link**, type the address (for example, `discord.com/app`) and, optionally, a title.
3. Tap the link to open it. The first time, log in as usual: the profile is kept for next time.

To close it, use the Steam menu > **Exit game**, as with any game. Deleting a link removes its library shortcut and its saved logins.

### Settings

On the plugin's page in Decky:

| Option | What it does |
|---|---|
| Web tab | shows or hides the Web tab in the Quick Access menu |
| Hide new links | new links start hidden from the library |
| Desktop controller layout | gives links still on Steam's default layout the desktop mode one |

### Microphone and camera

Native browsers have direct access to the microphone and camera. The Chrome and Chromium Flatpaks already have audio access through PipeWire; if the microphone or camera doesn't show up in Discord or Meet, check the browser's permissions with **Flatseal** (`com.github.tchx84.Flatseal`).

## Known limitations

- Only Chromium-based browsers are supported (native or Flatpak).
- In Game Mode, gamescope treats the touchscreen as a mouse: dragging a finger selects and drags instead of scrolling the page.

## Where data is kept

| What | Where |
|---|---|
| Link list and settings | `~/homebrew/settings/steamweblauncher/` |
| Logins and cache of each link (native browser) | `~/.local/share/steamweblauncher/profiles/<browser command>/` |
| Logins and cache of each link (Flatpak browser) | `~/.var/app/<flatpak id>/steamweblauncher/` |
| Logs | `~/homebrew/logs/steamweblauncher/` |

Uninstalling from Decky removes the controller templates. The folders above are kept and can be deleted by hand.

## Development

Needs git, Node.js 22+, pnpm and Python 3 (on Bazzite: `brew install node pnpm`).

```bash
git clone https://github.com/FlavioRoso/steamweblauncher.git
cd steamweblauncher
pnpm install
pnpm build          # builds dist/index.js (pnpm watch rebuilds on every change)
pnpm dev:deploy     # build + install or reload the plugin in Decky
pnpm dev:uninstall  # removes the plugin from Decky; the project is not touched
```

- **`dev:deploy`:** the first time, or after editing `plugin.json`, it creates `~/homebrew/plugins/steamweblauncher/` with links to `main.py`, `package.json`, `dist/`, `py_modules/` and `defaults/`, plus a copy of `plugin.json` (Decky hands plugin folders over to root), and restarts Decky (asks for sudo). After that, it only reloads this plugin, without sudo, when **Allow Remote CEF Debugging** is on in Decky's Settings > Developer; otherwise it restarts Decky.
- **`dev:deploy` and an installed release:** `dev:deploy` stops if the plugin was installed with `install.sh` or from a ZIP. Uninstall it from Decky first.
- **Releases:** bump `version` in `package.json`, commit, then push a tag with the same version (`git tag v0.1.0 && git push origin v0.1.0`). The [Release workflow](.github/workflows/release.yml) builds the plugin and publishes `steamweblauncher.zip` and `install.sh` as a GitHub release.
- **Backend outside Decky:** `python3 dev/run_backend.py <method> ['<JSON arg>' ...]` uses the `dev/decky.py` stub, with data in `dev/.sandbox/`.
- **Logs:** the plugin log is in `~/homebrew/logs/steamweblauncher/`, and Decky's own log in `journalctl -u plugin_loader -f`. The frontend console is at `http://localhost:8080`, **SharedJSContext** tab (needs **Allow Remote CEF Debugging**).

Conventions: code and logs in English, with no comments: names and small functions carry the intent. Interface text lives only in `src/i18n/locales/` (`en.ts` defines the keys, `pt-BR.ts` is typed from it, and the build fails if a translation is missing).

```
plugin.json                    plugin identity for Decky (name, flags, store data)
install.sh                     one-command installer, published with each release
.github/workflows/release.yml  builds and publishes a release for each version tag
main.py                        backend entry point (Plugin class called by the frontend)
py_modules/steamweblauncher/
  links.py                     link list, stored in links.json
  settings.py                  plugin settings, stored in settings.json
  storage.py                   JSON read and atomic write
  browsers.py                  native and Flatpak browser detection, profile folders
  controller_templates.py      "SteamWeb Launcher – Desktop" controller templates
src/
  index.tsx                    frontend entry point
  backend.ts                   typed calls to the backend
  launcher.ts                  builds the non-Steam shortcut and opens the link
  webLinks.ts                  create, edit, hide and delete links
  steam.ts                     wrappers for SteamClient's internal APIs
  quickAccessTab.tsx           Web tab in the Quick Access menu
  views/, components/          screens (list, form, settings) and the link row
  i18n/                        translations
dev/
  deploy.sh, uninstall.sh      install or remove the plugin in Decky
  reload.mjs                   reloads the plugin through Steam's debugger
  decky.py, run_backend.py     run backend methods outside Decky
```
