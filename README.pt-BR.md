# SteamWeb Launcher

[English](README.md) | **Português (Brasil)**

Plugin do [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) para abrir sites no **Game Mode** como se fossem jogos.

Cada link que você cadastra vira um atalho não-Steam que abre o site numa janela própria do navegador, em tela cheia e sem barra de endereço. Assim, Discord, YouTube, Twitch ou qualquer outro site ganham um lugar na biblioteca, recebem o foco certo do gamescope e podem ficar abertos junto com outros apps.

- **Perfil isolado por link:** cada site guarda os próprios logins e cookies, e vários podem ficar abertos ao mesmo tempo.
- **Aba "Web" no menu de acesso rápido (botão `...`):** adicionar, editar, excluir e abrir links sem sair do jogo.
- **Biblioteca:** cada link pode ficar visível ou oculto (botão de olho). Ocultos continuam abrindo pela aba Web.
- **Controle:** links sem disposição escolhida recebem a disposição de controle do modo desktop (touchpad e analógico como mouse). O plugin também instala templates "SteamWeb Launcher – Desktop" no seletor de disposições do Steam.
- **Escala:** a página segue a escala da interface do Game Mode.
- **Idiomas:** português (Brasil) e inglês, conforme o idioma do Steam.

Testado num ROG Xbox Ally X com Bazzite. O plugin depende só do Game Mode do Steam, do gamescope e do Decky Loader, então deve funcionar no SteamOS (Steam Deck), Bazzite, CachyOS, ChimeraOS, Nobara, PikaOS e outros sistemas com sessão de Game Mode.

## Instalação

### 1. Decky Loader

Se ainda não tem, siga as instruções em [decky.xyz](https://decky.xyz). No Bazzite, o Decky já pode vir instalado. Se não vier, rode `ujust setup-decky` num terminal.

### 2. Um navegador da família Chromium

O plugin usa um destes navegadores, instalado como pacote do sistema (**nativo**) ou como **Flatpak**:

| Navegador | Comando nativo | ID Flatpak |
|---|---|---|
| Google Chrome | `google-chrome-stable` | `com.google.Chrome` |
| Chromium | `chromium` ou `chromium-browser` | `org.chromium.Chromium` |
| Brave | `brave-browser` | `com.brave.Browser` |
| Microsoft Edge | `microsoft-edge-stable` | `com.microsoft.Edge` |
| Vivaldi | `vivaldi-stable` | `com.vivaldi.Vivaldi` |

Se houver mais de um instalado, os nativos vêm primeiro, depois os Flatpaks, cada grupo na ordem da tabela.

Como instalar depende do sistema:

- **SteamOS (Steam Deck):** no Game Mode, Biblioteca > aba **Não-Steam**, o SteamOS oferece instalar o Google Chrome. Ou procure "Chrome" ou "Chromium" no **Discover**, no Modo Desktop.
- **Bazzite, ChimeraOS e outros sistemas baseados em imagem:** use Flatpak, porque a imagem do sistema é somente leitura. Pela loja (**Bazaar** no Bazzite) ou pelo terminal:
  ```bash
  flatpak install --system flathub com.google.Chrome
  ```
- **CachyOS e outros baseados em Arch:** `sudo pacman -S chromium`
- **Nobara e outros baseados em Fedora:** `sudo dnf install chromium`
- **PikaOS e outros baseados em Debian:** `sudo apt install chromium`

Qualquer navegador da tabela também funciona como Flatpak nesses sistemas, se o Flatpak estiver configurado.

Para conferir: na página do plugin no Decky, a seção **Navegador** mostra qual foi encontrado e se é nativo ou Flatpak.

### 3. O plugin

O plugin ainda não está na loja do Decky, então a instalação é manual, a partir deste repositório. Faça isso no Modo Desktop (Konsole ou outro terminal) ou por SSH.

1. Instale as ferramentas de build: git, Node.js 22+, pnpm e Python 3. No Bazzite: `brew install node pnpm`.
2. Pegue o código, clonando o repositório:
   ```bash
   git clone https://github.com/FlavioRoso/steamweblauncher.git
   cd steamweblauncher
   ```
   ou baixando em **Code > Download ZIP** no GitHub, extraindo e abrindo um terminal na pasta extraída.
3. Compile e instale no Decky:
   ```bash
   pnpm install
   pnpm dev:deploy
   ```
   O `dev:deploy` pede sua senha (sudo) para linkar o plugin no Decky e reiniciá-lo.
4. De volta ao Game Mode, o plugin aparece na lista do Decky como **steamweblauncher**, e a aba **Web** aparece no menu de acesso rápido.

O Decky carrega o plugin direto desta pasta, então não a mova nem apague. Para atualizar, rode `git pull` (ou baixe o ZIP de novo na mesma pasta) e depois `pnpm dev:deploy`. Para remover o plugin, rode `pnpm dev:uninstall`.

## Uso

1. Abra o menu de acesso rápido (botão `...`) e vá na aba **Web** (ícone de globo).
2. Toque em **Adicionar link**, digite o endereço (por exemplo, `discord.com/app`) e, se quiser, um título.
3. Toque no link para abrir. Na primeira vez, faça login normalmente: o perfil fica salvo para as próximas.

Para fechar, use o menu Steam > **Sair do jogo**, como em qualquer jogo. Excluir um link remove o atalho da biblioteca e os logins salvos dele.

### Configurações

Na página do plugin no Decky:

| Opção | O que faz |
|---|---|
| Aba Web | mostra ou esconde a aba Web no menu de acesso rápido |
| Ocultar novos links | links novos começam ocultos na biblioteca |
| Disposição de controle do desktop | aplica a disposição do modo desktop aos links que ainda usam a padrão do Steam |

### Microfone e câmera

Navegadores nativos acessam microfone e câmera diretamente. Os Flatpaks de Chrome e Chromium já acessam áudio pelo PipeWire; se o microfone ou a câmera não aparecerem no Discord ou no Meet, confira as permissões do navegador no **Flatseal** (`com.github.tchx84.Flatseal`).

## Limitações conhecidas

- Só navegadores da família Chromium são suportados (nativos ou Flatpak).
- No Game Mode, o gamescope trata a tela de toque como mouse: arrastar o dedo seleciona e arrasta em vez de rolar a página.

## Onde ficam os dados

| O quê | Onde |
|---|---|
| Lista de links e configurações | `~/homebrew/settings/steamweblauncher/` |
| Logins e cache de cada link (navegador nativo) | `~/.local/share/steamweblauncher/profiles/<comando do navegador>/` |
| Logins e cache de cada link (navegador Flatpak) | `~/.var/app/<id Flatpak>/steamweblauncher/` |
| Logs | `~/homebrew/logs/steamweblauncher/` |

Ao desinstalar pelo Decky, os templates de controle são removidos. As pastas acima ficam e podem ser apagadas à mão.

## Desenvolvimento

Usa os mesmos requisitos da [instalação do plugin](#3-o-plugin).

```bash
pnpm install
pnpm build          # gera dist/index.js (pnpm watch recompila a cada mudança)
pnpm dev:deploy     # build + instala ou recarrega o plugin no Decky
pnpm dev:uninstall  # remove o plugin do Decky; o projeto não é tocado
```

- **`dev:deploy`:** na primeira vez, ou depois de editar o `plugin.json`, cria `~/homebrew/plugins/steamweblauncher/` com links para `main.py`, `package.json`, `dist/`, `py_modules/` e `defaults/`, mais uma cópia do `plugin.json` (o Decky passa as pastas dos plugins para o root), e reinicia o Decky (pede sudo). Depois disso, só recarrega este plugin, sem sudo, se o **Allow Remote CEF Debugging** estiver ativado em Configurações > Desenvolvedor do Decky; senão, reinicia o Decky.
- **Backend fora do Decky:** `python3 dev/run_backend.py <método> ['<arg JSON>' ...]` usa o stub `dev/decky.py`, com os dados em `dev/.sandbox/`.
- **Logs:** o log do plugin fica em `~/homebrew/logs/steamweblauncher/`, e o do Decky em `journalctl -u plugin_loader -f`. O console do frontend fica em `http://localhost:8080`, aba **SharedJSContext** (precisa do **Allow Remote CEF Debugging**).

Convenções: código e logs em inglês, sem comentários: nomes e funções pequenas carregam a intenção. Os textos da interface ficam só em `src/i18n/locales/` (`en.ts` define as chaves, `pt-BR.ts` é tipado a partir dele, e o build falha se faltar tradução).

```
plugin.json                    identidade do plugin para o Decky (nome, flags, dados da loja)
main.py                        entrada do backend (classe Plugin chamada pelo frontend)
py_modules/steamweblauncher/
  links.py                     lista de links, gravada em links.json
  settings.py                  configurações do plugin, gravadas em settings.json
  storage.py                   leitura de JSON e gravação atômica
  browsers.py                  detecção de navegadores nativos e Flatpak, pastas de perfil
  controller_templates.py      templates de controle "SteamWeb Launcher – Desktop"
src/
  index.tsx                    entrada do frontend
  backend.ts                   chamadas tipadas ao backend
  launcher.ts                  monta o atalho não-Steam e abre o link
  webLinks.ts                  criar, editar, ocultar e excluir links
  steam.ts                     wrappers das APIs internas do SteamClient
  quickAccessTab.tsx           aba Web no menu de acesso rápido
  views/, components/          telas (lista, formulário, configurações) e a linha do link
  i18n/                        traduções
dev/
  deploy.sh, uninstall.sh      instalam ou removem o plugin no Decky
  reload.mjs                   recarrega o plugin pelo depurador do Steam
  decky.py, run_backend.py     rodam métodos do backend fora do Decky
```
