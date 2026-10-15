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

Tested on a ROG Xbox Ally X running Bazzite. It should work on any device with Steam's Game Mode and Decky Loader, including the Steam Deck.

## Installation

### 1. Decky Loader

If you don't have it yet, follow the instructions at [decky.xyz](https://decky.xyz). Bazzite may already ship with Decky. If it doesn't, run `ujust setup-decky` in a terminal.

### 2. A Chromium-based browser (Flatpak)

The plugin uses one of these browsers, installed as a **Flatpak**. If more than one is installed, it uses the first one in the list:

| Browser | Flatpak ID |
|---|---|
| Google Chrome | `com.google.Chrome` |
| Chromium | `org.chromium.Chromium` |
| Brave | `com.brave.Browser` |
| Microsoft Edge | `com.microsoft.Edge` |
| Vivaldi | `com.vivaldi.Vivaldi` |

Ways to install one:

- **Steam Deck, from Game Mode:** in the Library, **Non-Steam** tab, SteamOS offers to install Google Chrome.
- **From the store, in Desktop Mode:** search for "Chrome" or "Chromium" in **Discover** (Steam Deck) or **Bazaar** (Bazzite).
- **From a terminal:**
  ```bash
  flatpak install flathub com.google.Chrome
  ```
  On Bazzite, add `--system` (`flatpak install --system flathub com.google.Chrome`). Without it, `flatpak` asks where to install.

To check: on the plugin's page in Decky, the **Browser** section shows which one was found.

### 3. The plugin

1. Download the latest `steamweblauncher.zip` from the [Releases](../../releases) page.
2. In Game Mode, open Decky (`...` button > plug icon) > **Settings** (gear) > **General** and turn on **Developer mode**.
3. In **Settings > Developer**, use **Install Plugin from ZIP File** and pick the downloaded file. You can also paste the ZIP's link into **Install Plugin from URL**.
4. The plugin shows up in Decky's list as **steamweblauncher**, and the **Web** tab appears in the Quick Access menu.

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

The Chrome and Chromium Flatpaks already have audio access through PipeWire. If the microphone or camera doesn't show up in Discord or Meet, check the browser's permissions with **Flatseal** (`com.github.tchx84.Flatseal`).

## Known limitations

- Only Chromium-based browsers installed as Flatpak are supported.
- In Game Mode, gamescope treats the touchscreen as a mouse: dragging a finger selects and drags instead of scrolling the page.

## Where data is kept

| What | Where |
|---|---|
| Link list and settings | `~/homebrew/settings/steamweblauncher/` |
| Logins and cache of each link | `~/.var/app/<browser id>/steamweblauncher/` |
| Logs | `~/homebrew/logs/steamweblauncher/` |

Uninstalling from Decky removes the controller templates. The folders above are kept and can be deleted by hand.

## Development

Requirements: Node.js 22+ and pnpm (on Bazzite: `brew install node pnpm`).

```bash
pnpm install
pnpm build         # builds dist/index.js (pnpm watch rebuilds on every change)
pnpm dev:link      # exposes the project to Decky through symlinks (asks for sudo)
pnpm dev:reload    # build + reload this plugin only, no sudo
pnpm dev:unlink    # removes the links; the project is not touched
```

- **`dev:link`:** Decky hands plugin folders over to root. So the script creates `~/homebrew/plugins/steamweblauncher/` with links to `main.py`, `package.json`, `dist/`, `py_modules/` and `defaults/`, plus a copy of `plugin.json`. Run it again after editing `plugin.json`.
- **`dev:reload`:** needs **Allow Remote CEF Debugging** turned on in Decky's Settings > Developer.
- **Backend outside Decky:** `python3 dev/run_backend.py <method> ['<JSON arg>' ...]` uses the `dev/decky.py` stub, with data in `dev/.sandbox/`.
- **Logs:** `journalctl -u plugin_loader -f`. The frontend console is at `http://localhost:8080`, **SharedJSContext** tab.

Conventions: code and logs in English, with no comments: names and small functions carry the intent. Interface text lives only in `src/i18n/locales/` (`en.ts` defines the keys, `pt-BR.ts` is typed from it, and the build fails if a translation is missing).

```
main.py               backend (Plugin class called by the frontend)
py_modules/steamweblauncher/  link list, settings, browsers, controller templates
src/index.tsx         frontend entry point
src/launcher.ts       creates/updates the non-Steam shortcut and opens the link
src/steam.ts          wrappers for SteamClient's internal APIs
src/views/            screens (list, form, settings)
src/i18n/             translations
dev/                  development scripts and tools
```
