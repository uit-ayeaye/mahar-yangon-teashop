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
| `index.html` | The whole page: markup, SEO meta, Open Graph tags, JSON-LD, icon sprite |
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

### Type

| Role | Face | Why |
|---|---|---|
| Burmese headings | **PDA18-Stone** → **Noto Serif Myanmar** | See the note below |
| Burmese body | **Padauk** | Rounder and friendlier than Noto Sans at small sizes |
| Latin display | **Fraunces** (`SOFT 100`, `WONK 1`) | Soft, slightly imperfect — reads hand-cut, not corporate |
| Latin body | **Nunito** | Rounded terminals, warm, very legible |
| Accents | **Shantell Sans** | The handwritten touches: eyebrows, tags, prices, stat labels |

Roughly 280 KB of fonts over 4 files — browsers fetch only the subsets they need.

#### About the Burmese display face

The shop's name in the logo is **brush lettering, not a font** — that's why it ships
as artwork. For the other Burmese headings we wanted something with the same
hand-drawn warmth, and there is a hard constraint worth recording:

- Google Fonts carries exactly **three** Myanmar families — Noto Sans Myanmar,
  Noto Serif Myanmar and Padauk. All three are geometric and monoline. There is
  no hand-crafted or handwriting Burmese webfont available to embed for free.
- **PDA18-Stone** (Phoenix Digital Art) is a genuinely hand-drawn Myanmar face and
  is by far the closest match to the logo — but it ships under a commercial EULA,
  so it cannot be self-hosted or served as a webfont.

So the display stack **names** PDA18-Stone first without embedding it:

```css
--f-my-dis: "PDA18-Stone", "Noto Serif Myanmar", "Padauk", "Myanmar Text", …;
```

Naming a font costs nothing and needs no licence. Anyone who already has it
installed — which includes a lot of people in Myanmar — sees the hand-drawn face.
Everyone else falls through to Noto Serif Myanmar at weight 900, the most
characterful Burmese face that is free to embed.

**To upgrade this properly:** buy a *webfont* licence for a Myanmar display face,
drop the `.woff2` into `assets/fonts/`, add an `@font-face` block, and put its
name at the front of `--f-my-dis`. Nothing else needs to change.

### The brand name is artwork, not a font

မဟာရန်ကုန် is custom lettering, so no web font reproduces it. Wherever the shop's *name*
appears it is served as an image cropped from the original logo — never typeset:

| File | What it shows |
|---|---|
| `brandtext-{cream,gold,maroon}.png` | မဟာရန်ကုန် alone — used in the nav |
| `wordmark-{cream,maroon}.png` | Diamond mark + မဟာရန်ကုန် + လက်ဖက်ရည်ဆိုင် — hero, footer, OG |
| `logo-mark-{cream,gold,maroon}.png` | The diamond monogram alone |

All are paletted PNGs (64 colours) — the full lockup is 5.8 KB, the mark 4 KB.
Taglines and body copy *are* set in Noto Sans Myanmar; only the name is artwork.

### Icons

There are no emoji anywhere. `index.html` opens with an inline `<symbol>` sprite of
20 line icons drawn on a 24px grid in the logo's own geometry — thin strokes, rounded
joins, diamond motifs. Use one with:

```html
<svg class="ico" aria-hidden="true"><use href="#i-cup"/></svg>
```

Available: `cup heart home scooter pin phone mail clock play leaf bowl samusa alms
diamond sparkle cutlery mute sound tiktok facebook`. They inherit `currentColor`, so
colour them on the parent; size them with `font-size` (the icon is `1em`).

## Editing the content

Everything is in `index.html`. Bilingual text uses two conventions:

- `.t-my` / `.t-en` — **toggled** by the language switch (body copy)
- `.b-my` / `.b-en` — **always both visible** (headings, labels)

So to change a dish description, edit both the `.t-my` and `.t-en` spans on that card.

### Cache versioning

`styles.css` and `app.js` are linked with a `?v=YYYYMMDDx` query. GitHub Pages
serves assets with `max-age=600`, so **bump that version whenever you edit either
file** — otherwise returning visitors can see up to ten minutes of stale styling
against fresh markup. Both links are in the `<head>` and the closing `<script>`.

### Things worth keeping current

- **Opening hours** — the site currently says "Open daily, call for today's hours."
  If you want exact hours shown, edit the `🕔` card in the `#visit` section.
- **GrabFood link** — points at `https://food.grab.com/mm/en/` with a "search Mahar Yangon"
  note. Replace with the real merchant deep-link once you have it (appears in `#visit`
  and in the mobile dock).
- **Prices** — only the verified samusa price (1,000 Ks) is shown; every other dish
  reads "ask us". Fill them in on the `.dish-price` spans in the `#menu` section.
- **Tea guide** (`#tea`) describes how Myanmar teashops are ordered from generally —
  ချိုဆိမ့်, ပေါ့ဆိမ့်, ချိုပေါ့, ပေါ့ကြမ်း, ကျောက်ပါဒေါင်. If the shop uses different
  names, edit the `.tea-card` entries.

## Local preview

```
python3 -m http.server 4173
```

Then open http://localhost:4173

## Deploying

Pushing to `main` publishes automatically via GitHub Pages. If you move the site to a
custom domain, update the absolute URLs in `index.html` (`og:image`, `og:url`, `canonical`),
plus `robots.txt` and `sitemap.xml` — link previews need absolute URLs to work.
