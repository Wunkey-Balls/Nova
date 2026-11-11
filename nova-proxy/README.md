# Nova

A self-hosted web proxy site with games, apps, search, and an **Open in about:blank** button.
Built on [Ultraviolet](https://github.com/titaniumnetwork-dev/Ultraviolet) (not Scramjet), using
the Epoxy transport over a Wisp server.

## What's in it

- **Home**: search bar (or type a URL) plus shortcuts you can add and remove
- **Games / Apps**: tile grids that open through the proxy (edit `public/data.js` to change them)
- **Open in about:blank**: opens a new `about:blank` tab with the whole site inside it
- **Browser bar**: back, forward, reload, address bar, fullscreen
- **Settings**: search engine, tab title, optional "send the original tab to another page" after launch, panic key

## Run it locally

Requires Node 24 or newer (the version Ultraviolet-App lists).

```
npm install      # or: pnpm install
npm start
```

Open http://localhost:8080 (use Chrome/Edge; Firefox needs real HTTPS).

## Put it online (free)

This needs a real Node server because the proxy uses a WebSocket (`/wisp/`). Static hosts
(GitHub Pages, Netlify, Vercel static) will NOT work. It also needs HTTPS, which the hosts below provide.

**Render** (simplest)
1. Put this folder in a GitHub repo.
2. render.com → New → Web Service → pick the repo.
3. Build command: `npm install`  |  Start command: `npm start`  |  Plan: Free.
4. Open the `.onrender.com` URL when it finishes. The free plan sleeps when idle, so the first load can take about a minute.

Other options: Koyeb, Railway, or Replit (there's already a `.replit` file). A `Dockerfile` is included too.

## Notes

- Sites with heavy logins, anti-bot checks, or DRM (Google sign-in, Netflix, some games) may not work through any web proxy.
- Network filters block well-known proxy domains over time. If yours stops loading, deploy it again under a new name.
- Only use this where it's allowed. Check your school or workplace rules.

## Credits and license

Ultraviolet, Epoxy, bare-mux and wisp-server-node belong to their authors (TitaniumNetwork and Mercury Workshop).
This project is based on Ultraviolet-App and is licensed GPL-3.0-or-later (see `LICENSE`).
