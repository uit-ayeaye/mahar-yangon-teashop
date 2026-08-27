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
| `app.js` | Language toggle, scroll reveals, tea picker, reels rail, lightbox |
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

**Where the display face is used:** the landing section (the EST line, the headline,
the stat labels, the scroll cue) and the tea names in the picker. Everything else —
section headings, body copy, cards, the nav, the footer — stays on `--f-my` (Padauk).
Keeping the display face to the landing is deliberate: it is the loudest voice on the
page and it stops being special if it is everywhere.

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

### Never use `scrollIntoView()` inside a horizontal rail

`element.scrollIntoView({inline: 'center'})` walks *up* the tree and scrolls every
scrollable ancestor — including the document. On a narrow phone that drags the whole
page sideways and everything looks broken, and `body { overflow-x: hidden }` does not
prevent it (a programmatic scroll still moves a hidden-overflow viewport). Both the
tea rail and the reels rail set `scrollLeft` on the rail element directly instead.
The same call on page load also used to jump the visitor straight past the hero.

### Cache versioning

`styles.css` and `app.js` are linked with a `?v=YYYYMMDDx` query. GitHub Pages
serves assets with `max-age=600`, so **bump that version whenever you edit either
file** — otherwise returning visitors can see up to ten minutes of stale styling
against fresh markup. Both links are in the `<head>` and the closing `<script>`.

## The tea picker (`#tea`)

The five `<li class="tea-card">` items inside `<ul id="teaGrid">` are the **only**
source of truth for this section. `app.js` reads them, builds the pick-your-cup
stage on top and hides the plain list; without JavaScript the list itself is the
fallback. Nothing in the JS knows how many cups there are — add or remove an `<li>`
and the stage, the token rail, the `01 / 05` counter and the taste dial all follow.

Each card carries the brew:

```html
<li class="tea-card" data-top="#E4BC85" data-mid="#C89050" data-bot="#A66E32"
                     data-foam=".30" data-sugar=".86">
```

| Attribute | What it does |
|---|---|
| `data-top` / `data-mid` / `data-bot` | The three stops of the gradient poured into the glass |
| `data-foam` | `0`–`1`; how deep the foam cap sits on top |
| `data-sugar` | `0`–`1`; how thick the sweet condensed-milk layer is at the bottom |
| `data-photo` | *Optional.* A real photo of that cup. When present it replaces the drawn glass |

The two `.meter` rows on each card are read as the sweet/rich values, and they are
what the **taste dial** matches against: move the two dials and the nearest cup is
selected automatically (Manhattan distance, sweetness weighted slightly higher).

### The glasses are drawn, not photographed

There is no photo of each individual cup in the repo, so the stage renders an SVG
glass whose colour, foam and sweet layer come from the attributes above — Cho Seint
pours pale and creamy, Kyauk Padaung pours nearly black. **If the shop sends real
photos, drop them in `assets/img/` and add `data-photo="assets/img/tea-cho-seint.jpg"`
to that card.** The photo then takes over automatically; no CSS or JS changes needed.

### Romanisation

ပေါ့ is **Paw**, not "Pauk" (ပေါက်). The five cups are Cho Seint, Paw Seint, Cho Paw,
Paw Kyan and Kyauk Padaung. ကျောက်ကျော is a jelly dessert, not a tea — it does not
belong in the laphet yay description.

## The reels rail (`#reels`)

One horizontal scroller drives everything: drag, swipe, wheel, the arrows, the dots
and the arrow keys all move the same element, so nothing can fall out of sync. Add
or remove an `<article class="reel" data-src="…">` and the arrows and keyboard follow
automatically — **the only thing to keep in step by hand is the number of
`<button class="reel-dot">` elements** in `.reels-dots`.

Only the reel nearest the centre of the rail downloads and auto-previews. On a wide
screen that shows five phones at once, that is one video instead of five — it matters
on a Yangon mobile connection. A reel the visitor has deliberately unmuted is never
interrupted by the rail scrolling past it.

### Re-encoding a reel

The clips are TikTok downloads. Re-encode them from the original download, not from
the file already in `assets/video/`:

```
ffmpeg -i source.mp4 \
  -vf "scale=576:1024:flags=lanczos,hqdn3d=2:1.5:6:6,unsharp=5:5:0.45:5:5:0,format=yuv420p" \
  -c:v libx264 -profile:v high -preset veryslow -crf 22 -maxrate 1500k -bufsize 3000k \
  -c:a aac -b:a 112k -movflags +faststart assets/video/reel-name.mp4
```

The denoise pass matters: phone footage is grainy, and without it x264 spends most of
its bitrate encoding sensor noise instead of the food. Two clips need special handling
and both are worth re-reading before touching them:

- **`reel-samusa`** — the source is a 2×2 mirrored TikTok collage. Lift the clean
  top-left quadrant with `crop=288:512:0:0` *before* scaling up.
- **`reel-invitation`** — the source is a 768×768 card letterboxed inside 768×1024.
  Crop the black bars (`crop=768:768:0:128`), then re-frame to 9:16 over a blurred
  copy of itself so nothing is cropped and there are no black bands.

Posters live in `assets/img/reel-*-poster.{jpg,webp}` at 540×960 and should be pulled
from the **re-encoded** file so they match what plays.

## Where the shop lives

The Google Business listing is wired in by place ID, not by a text search — a text
search for "Mahar Yangon" lands on one of the other, unrelated teashops of that name
around Yangon.

| | |
|---|---|
| Place ID | `ChIJ8WJFSACTwTARvBMMb4TvJlk` |
| CID (used by the keyless map embed) | `6424085270568375228` |
| Coordinates | `16.8990992, 96.1620805` |
| Plus code | `V5X6+PWC` Yangon |

These appear in `index.html` in the JSON-LD (`geo`, `hasMap`, `sameAs`), the `#visit`
address and directions cards, the map `<iframe>`, and the mobile dock. Change them
together.

> The listing is currently **unclaimed** ("Claim this business" still shows on Google).
> Claiming it would let the shop set the hours, photos and the correct name, and the
> rating would stop being two drive-by reviews.

**GrabFood** has no public merchant URL for this shop — Grab's web catalogue returns
nothing for it — so the link is a search deep-link (`?search=Mahar%20Yangon`) that opens
the Grab app on the right query. Swap it for the real merchant link the moment the shop
has one; it appears in `#visit`, the mobile dock and the JSON-LD `potentialAction`.

### Things worth keeping current

- **Opening hours** — the site currently says "Open daily, call for today's hours."
  If you want exact hours shown, edit the `🕔` card in the `#visit` section.
- **GrabFood link** — a search deep-link, not a merchant page. See above.
- **Prices** — only the verified samusa price (1,000 Ks) is shown; every other dish
  reads "ask us". Fill them in on the `.dish-price` spans in the `#menu` section.
- **Tea guide** (`#tea`) describes how Myanmar teashops are ordered from generally —
  ချိုဆိမ့်, ပေါ့ဆိမ့်, ချိုပေါ့, ပေါ့ကြမ်း, ကျောက်ပါဒေါင်. If the shop uses different
  names, edit the `.tea-card` entries.
- **Photos of each cup** — the glasses are drawn. See "The tea picker" above.

## Local preview

```
python3 -m http.server 4173
```

Then open http://localhost:4173

## Deploying

Pushing to `main` publishes automatically via GitHub Pages. If you move the site to a
custom domain, update the absolute URLs in `index.html` (`og:image`, `og:url`, `canonical`),
plus `robots.txt` and `sitemap.xml` — link previews need absolute URLs to work.
