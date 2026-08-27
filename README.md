# မဟာရန်ကုန် လက်ဖက်ရည်ဆိုင် · Mahar Yangon Teashop (Nok)

The official website for **Mahar Yangon Teashop (Nok)** — a family-run Burmese teashop on the
corner of Thudamar Road & Tandar Street, North Okkalapa Township, Yangon. Established 2009.

**Live:** https://thomasdlynn.dev/mahar-yangon-teashop/

> This GitHub account has a custom Pages domain (`thomasdlynn.dev`), so project pages are
> served from there. `https://uit-ayeaye.github.io/mahar-yangon-teashop/` also works — it
> 301-redirects to the address above. All absolute URLs in `index.html`, `robots.txt` and
> `sitemap.xml` point at the non-redirecting address so link-preview scrapers resolve the
> Open Graph image on the first hop.

---

## What's here

A single-page, fully bilingual (မြန်မာ / English), mobile-first site built with plain
HTML, CSS and JavaScript — no build step, no framework, no dependencies.

| Path | What it is |
|---|---|
| `index.html` | The whole page: markup, SEO meta, Open Graph tags, JSON-LD |
| `styles.css` | Design tokens, layout, and every animation |
| `app.js` | Language toggle, scroll reveals, reels player, lightbox |
| `assets/img/` | Photos (JPG + WebP) and video poster frames |
| `assets/video/` | Hero montages and the six TikTok reels, re-encoded for the web |
| `assets/icons/` | Logo mark, wordmark, favicons, PWA icons |

## Brand

Colours were sampled directly from the shop's own logo artwork:

| Token | Hex | Use |
|---|---|---|
| `--maroon` | `#3F170F` | Brand ink, dark sections |
| `--cream` | `#FBEEC4` | Logo, text on dark |
| `--gold` | `#D9A441` | Accents, buttons |
| `--paper` | `#FFF8EA` | Light sections |

Type: **Noto Sans Myanmar** (Burmese), **Fraunces** (display), **Plus Jakarta Sans** (UI).

## Editing the content

Everything is in `index.html`. Bilingual text uses two conventions:

- `.t-my` / `.t-en` — **toggled** by the language switch (body copy)
- `.b-my` / `.b-en` — **always both visible** (headings, labels)

So to change a dish description, edit both the `.t-my` and `.t-en` spans on that card.

### Things worth keeping current

- **Opening hours** — the site currently says "Open daily, call for today's hours."
  If you want exact hours shown, edit the `🕔` card in the `#visit` section.
- **GrabFood link** — points at `https://food.grab.com/mm/en/` with a "search Mahar Yangon"
  note. Replace with the real merchant deep-link once you have it (appears in `#visit`
  and in the mobile dock).
- **Prices** — only the verified samusa price (1,000 Ks) is shown.

## Local preview

```
python3 -m http.server 4173
```

Then open http://localhost:4173

## Deploying

Pushing to `main` publishes automatically via GitHub Pages. If you move the site to a
custom domain, update the absolute URLs in `index.html` (`og:image`, `og:url`, `canonical`),
plus `robots.txt` and `sitemap.xml` — link previews need absolute URLs to work.
