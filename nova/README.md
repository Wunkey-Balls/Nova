# Nova

A self-hosted browsing site with search, shortcuts, a Play page, and an about:blank launcher.
Built on Ultraviolet with the Epoxy transport. Licensed GPL-3.0-or-later (see `LICENSE`, and
`NOTICE-credits.html` for the credits that came with the original project).

## Run it

Needs Node 24 or newer (a version warning on older Node is usually harmless).

```
npm install
npm start
```

Then open http://localhost:8080. For a public link from a phone or computer you can use a
Cloudflare quick tunnel: `cloudflared tunnel --url http://localhost:8080`.

## What it does on load

- Tries to open an `about:blank` tab with the whole site inside it right away.
- Browsers usually block a new tab that has no click behind it. If that happens, a plain
  "Tap anywhere to continue" screen appears and the first tap or key press opens it.
  Allowing pop-ups for the site once makes it instant every time.
- After the new tab opens, the original tab is sent to a page you choose (default Google).
  Both of these are switches in Options.

## Changing text and tiles

All on-screen words and tile lists live in `content/strings.json`, which is NOT served to visitors.
After editing it, run:

```
npm run build:text
```

That encodes it into `public/c.js`. The page decodes it in the browser, so the words show up
normally on screen but aren't sitting in plain text in the page's source.

## Paths

The service pieces are on short paths: `/x/` (worker + engine files), `/e/`, `/b/`, and the
connection endpoint `/w/`. They are set in `src/index.js`, `public/x/uv.config.js`,
`public/register-sw.js`, and `public/app.js`. If you change one, change them all.

## Honest limits

- Hiding words in the page source only helps against filters that read page text. Most school
  filters judge by domain, category, and reputation, which this can't change. A tunnel or
  host address can still get blocked.
- Sites with heavy logins, anti-bot checks, or DRM may not work.
- If the original page's address gets blocked later, anything the open tab still has to load
  from it can fail.
- Use it only where it's allowed.
