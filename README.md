# NOVEX — Liquidity Protocol (protótipo)

Este projeto agora é um **PWA (Progressive Web App)**. Isso significa que ele roda
como um site normal, mas o Chrome oferece a opção **"Instalar app"** — daí ele fica
com ícone próprio, abre em tela cheia, sem barra de navegador, como se fosse um app
de verdade. É o caminho mais rápido pra testar por enquanto (sem precisar de Android
Studio, Java, ou compilar nada).

## Passo a passo (sem usar linha de comando)

1. **Crie uma conta gratuita no GitHub**, se ainda não tiver: https://github.com/signup

2. **Crie um repositório novo**, ex: `novex-app` (pode ser Public ou Private).
   NÃO marque "Add a README" ao criar.

3. **Suba os arquivos**: na página do repositório vazio, clique em
   **"uploading an existing file"**, arraste todos os arquivos e pastas deste
   projeto, e clique em **"Commit changes"**.

4. **Ative o GitHub Pages**:
   - Vá em **Settings → Pages** (barra lateral esquerda)
   - Em "Build and deployment" → "Source", escolha **"GitHub Actions"**
   - (isso só precisa ser feito uma vez)

5. **Aguarde o deploy automático**:
   - Vá na aba **"Actions"**
   - Espera o workflow **"Deploy PWA to GitHub Pages"** ficar verde ✅ (1-2 minutos)

6. **Abra o link do app**:
   - Vá em **Settings → Pages** de novo — vai aparecer um link tipo
     `https://seu-usuario.github.io/novex-app/`
   - Abra esse link no **Chrome do celular ou do computador**

7. **Instale como app**:
   - No celular (Android): toque no menu (⋮) do Chrome → **"Instalar app"** ou
     **"Adicionar à tela inicial"**
   - No computador: vai aparecer um ícone de instalação (⊕ ou monitor) do lado
     direito da barra de endereço → clique em **"Instalar"**
   - Pronto — o NOVEX abre como um app próprio, com ícone e tudo.

## Sobre este build

- Ainda é o **protótipo/demo**: pools, rendimentos e projeções são simulados.
- A conexão de carteira (MetaMask / Binance Wallet) é real via `window.ethereum`,
  mas funciona melhor no navegador do que dentro do modo instalado do PWA —
  isso é normal, e o caminho certo pra resolver isso no futuro é usar
  **WalletConnect** (conecta via QR code, funciona em qualquer contexto).
- iOS (Safari) também suporta "Adicionar à Tela de Início", mas com menos recursos
  de PWA do que o Android/Chrome.

## Rodando localmente (se você tiver Node.js instalado)

```bash
npm install
npm run dev       # roda no navegador local, pra testar rápido
npm run build     # gera a pasta dist/ com o PWA completo
npm run preview   # serve a pasta dist/ localmente pra testar a instalação
```

## Alternativa: gerar um APK Android de verdade

Esse projeto também já vem preparado com **Capacitor**, caso no futuro você
prefira gerar um `.apk`/publicar na Play Store de verdade (build automático já
configurado em `.github/workflows/build-apk.yml`, mesma lógica do Pages: sobe
os arquivos, espera o Actions rodar, baixa o `.apk` gerado). Pra isso funcionar
é só rodar o workflow "Build APK" na aba Actions.

## iOS / App Store (futuro)

Publicar na App Store exige um Mac com Xcode — não existe build de iOS "na nuvem"
gratuito tão simples quanto o do Android/Pages. O PWA já funciona parcialmente no
iOS via "Adicionar à Tela de Início"; pra loja oficial da Apple, o caminho seria
usar o mesmo projeto Capacitor com `npx cap add ios` num Mac (ou serviço de CI pago
com runner macOS, como Codemagic).
