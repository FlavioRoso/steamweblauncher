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

Testado num ROG Xbox Ally X com Bazzite. Deve funcionar em qualquer aparelho com Game Mode do Steam e Decky Loader, incluindo o Steam Deck.

## Instalação

### 1. Decky Loader

Se ainda não tem, siga as instruções em [decky.xyz](https://decky.xyz). No Bazzite, o Decky já pode vir instalado. Se não vier, rode `ujust setup-decky` num terminal.

### 2. Um navegador da família Chromium (Flatpak)

O plugin usa um destes navegadores, instalados como **Flatpak**. Se houver mais de um, ele usa o primeiro da lista:

| Navegador | ID Flatpak |
|---|---|
| Google Chrome | `com.google.Chrome` |
| Chromium | `org.chromium.Chromium` |
| Brave | `com.brave.Browser` |
| Microsoft Edge | `com.microsoft.Edge` |
| Vivaldi | `com.vivaldi.Vivaldi` |

Opções de instalação:

- **Steam Deck, pelo Game Mode:** na Biblioteca, aba **Não-Steam**, o SteamOS oferece instalar o Google Chrome.
- **Pela loja, no Modo Desktop:** procure "Chrome" ou "Chromium" no **Discover** (Steam Deck) ou no **Bazaar** (Bazzite).
- **Pelo terminal:**
  ```bash
  flatpak install flathub com.google.Chrome
  ```
  No Bazzite, adicione `--system` (`flatpak install --system flathub com.google.Chrome`). Sem isso, o `flatpak` pergunta onde instalar.

Para conferir: na página do plugin no Decky, a seção **Navegador** mostra qual foi encontrado.

### 3. O plugin

1. Baixe o `steamweblauncher.zip` mais recente na página de [Releases](../../releases).
2. No Game Mode, abra o Decky (botão `...` > ícone de tomada) > **Configurações** (engrenagem) > **Geral** e ative o **Modo desenvolvedor**.
3. Em **Configurações > Desenvolvedor**, use **Instalar plugin a partir de ZIP** e escolha o arquivo baixado. Outra opção é colar o link do ZIP em **Instalar plugin a partir de URL**.
4. O plugin aparece na lista do Decky como **steamweblauncher**, e a aba **Web** aparece no menu de acesso rápido.

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

Os Flatpaks de Chrome e Chromium já acessam áudio pelo PipeWire. Se o microfone ou a câmera não aparecerem no Discord ou no Meet, confira as permissões do navegador no **Flatseal** (`com.github.tchx84.Flatseal`).

## Limitações conhecidas

- Só navegadores da família Chromium em Flatpak são suportados.
- No Game Mode, o gamescope trata a tela de toque como mouse: arrastar o dedo seleciona e arrasta em vez de rolar a página.

## Onde ficam os dados

| O quê | Onde |
|---|---|
| Lista de links e configurações | `~/homebrew/settings/steamweblauncher/` |
| Logins e cache de cada link | `~/.var/app/<id do navegador>/steamweblauncher/` |
| Logs | `~/homebrew/logs/steamweblauncher/` |

Ao desinstalar pelo Decky, os templates de controle são removidos. As pastas acima ficam e podem ser apagadas à mão.

## Desenvolvimento

Requisitos: Node.js 22+ e pnpm (no Bazzite: `brew install node pnpm`).

```bash
pnpm install
pnpm build         # gera dist/index.js (pnpm watch recompila a cada mudança)
pnpm dev:link      # expõe o projeto ao Decky com links simbólicos (pede sudo)
pnpm dev:reload    # build + recarrega só este plugin, sem sudo
pnpm dev:unlink    # remove os links; o projeto não é tocado
```

- **`dev:link`:** o Decky passa as pastas dos plugins para o root. Por isso o script cria `~/homebrew/plugins/steamweblauncher/` com links para `main.py`, `package.json`, `dist/`, `py_modules/` e `defaults/`, mais uma cópia do `plugin.json`. Rode de novo depois de editar o `plugin.json`.
- **`dev:reload`:** precisa do **Allow Remote CEF Debugging** ativado em Configurações > Desenvolvedor do Decky.
- **Backend fora do Decky:** `python3 dev/run_backend.py <método> ['<arg JSON>' ...]` usa o stub `dev/decky.py`, com os dados em `dev/.sandbox/`.
- **Logs:** `journalctl -u plugin_loader -f`. O console do frontend fica em `http://localhost:8080`, aba **SharedJSContext**.

Convenções: código e logs em inglês, sem comentários: nomes e funções pequenas carregam a intenção. Os textos da interface ficam só em `src/i18n/locales/` (`en.ts` define as chaves, `pt-BR.ts` é tipado a partir dele, e o build falha se faltar tradução).

```
main.py               backend (classe Plugin chamada pelo frontend)
py_modules/steamweblauncher/  lista de links, configurações, navegadores, templates de controle
src/index.tsx         entrada do frontend
src/launcher.ts       cria/atualiza o atalho não-Steam e abre o link
src/steam.ts          wrappers das APIs internas do SteamClient
src/views/            telas (lista, formulário, configurações)
src/i18n/             traduções
dev/                  scripts e ferramentas de desenvolvimento
```
