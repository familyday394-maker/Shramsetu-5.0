# Shram Setu 2.0 — Indore Sahodaya Computer Science deck

`Shram_Setu_2.0_Sahodaya_CS.pptx` — 32 slides, 16:9, built for a projector and for
PowerPoint **Morph**.

## What it contains

| # | Slide | # | Slide |
| --- | --- | --- | --- |
| 01 | Title | 17 | SHA-256 chain |
| 02 | The core idea | 18 | What the chain does / does not prove |
| 03 | What this deck covers | 19 | Seven rules, no ML |
| 04 | Six ways a wage becomes an argument | 20 | What a flag looks like (RULE-03) |
| 05 | The gap is documented (CAG / HC / ILO) | 21 | QR identifies, does not secure |
| 06 | Research question + 7 objectives | 22 | Approval across devices (planned) |
| 07 | Where Shram Setu sits (comparison) | 23 | Offline-first, honestly bounded |
| 08 | NFC cards → printed QR | 24 | Privacy and governance |
| 09 | Four inspectable mechanisms | 25 | The demo bench and its dataset |
| 10 | Architecture: one clean seam | 26 | Reported results, honestly labelled |
| 11 | Technology choices and why | 27 | What it costs |
| 12 | Eight entities, one ledger | 28 | Limitations we will not hide |
| 13 | One wage, calculated in the open | 29 | What happens next, in order |
| 14 | One function, no surprises | 30 | Conclusion |
| 15 | Payment states are separate | 31 | References and sources |
| 16 | A correction keeps what it replaced | 32 | Thank you / live demo |

Every slide carries speaker notes.

## Design system

Palette (lifted from the app's `src/index.css` tokens and pushed one step more
saturated so it survives projector wash-out):

| Role | Hex |
| --- | --- |
| Paper ground | `#FBF7EC` |
| Deep forest (panels, dark slides) | `#0E2A20` / `#17493A` |
| Ink text / secondary | `#12211B` / `#4E6459` |
| Emerald accent | `#16A574` |
| Brass accent | `#E3B04B` / `#B9812C` |
| Clay (risk, tamper) | `#C2542D` |

Type: **Georgia** for display (stands in for Fraunces), **Calibri** for body,
**Consolas** for figures and hashes. All three ship with Office on Windows and macOS.

## How the Morph is wired

1. **A Morph transition is already applied to all 32 slides** (1500 ms, *by object*),
   with a Fade fallback for older versions. You do not need to apply anything — just
   play the slideshow. To change it: *Transitions → Morph → Effect Options*.
2. **Every recurring object is one named shape or group with a `!!` prefix.** Morph
   matches objects by name, and the `!!` prefix forces that match:

   | Name | What it is | What Morph does with it |
   | --- | --- | --- |
   | `!!HeroPanel` | dark panel | shrinks from full bleed to the left rail |
   | `!!Card` | grouped wage-slip card with a 3-D camera | travels, scales and tilts |
   | `!!Photo` | the worker pass photo | flies from hero image to sidebar chip |
   | `!!Wordmark` | brass mark + wordmark | glides between layouts |
   | `!!Rail` / `!!RailFill` / `!!Dot` | progress rail | fill grows, dot slides, page to page |
   | `!!Accent` / `!!PageNo` / `!!SecNo` | rules, folio, section numeral | reposition |

3. **3-D** is real DrawingML, not fake perspective: the card group carries
   `<a:scene3d>` with a `perspectiveRelaxed` camera whose `lat`/`lon` change on every
   slide, plus a bevel and a soft outer shadow. Morph interpolates that camera
   rotation, so the card sweeps through 3-D between slides instead of cross-fading.
4. Timeline order matters: Morph pairs slide *n* with slide *n−1*. Keep the slide order,
   and keep the `!!` names if you duplicate or add slides.

## Rebuilding

```bash
python3 -m pip install --break-system-packages python-pptx pillow segno
python3 -c "import segno; segno.make('https://example.org/verify').save('/tmp/ss_qr.png', scale=12)"
cd docs/deck-build
python3 build_deck.py            # writes docs/Shram_Setu_2.0_Sahodaya_CS.pptx
python3 build_deck.py --preview  # also rasterises /tmp/deckprev/*.png for layout QA
```

Layout lives in `build_deck.py` (one function per slide); chrome in `layouts.py`;
cards/tables/diagrams in `components.py`; the OOXML helpers (3-D, shadows, gradients,
Morph transitions, text measurement) in `deckkit.py`. The previewer is a Pillow
approximation — it checks geometry and text fit, not 3-D, gradients or shadows.

## Before you present

- Fill the three placeholders on slide 01: student name, class, guide name.
- Check the ratio of your projector (16:9 is assumed) and run the slideshow once so
  PowerPoint caches the fonts.
- If your machine is on PowerPoint 2019 or newer, use *Slide Show → From Beginning* to
  see the Morph; on older versions the deck falls back to a fade.
