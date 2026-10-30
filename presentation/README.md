# Shram Setu 2.0 — Indore Sahodaya Computer Science deck

**`Shram_Setu_2.0_Indore_Sahodaya_CS.pptx`** — 26 slides, 16:9, built for a
12-minute Sahodaya Computer Science presentation on the Shram Setu 2.0 project
reported in `../Shram_Setu_2.0_Project_Report.pdf` and the architecture notes,
reconciled against the actual application in this repository.

A quick look at every slide: [`preview/contact-sheet.jpg`](preview/contact-sheet.jpg).

---

## Presenting it

1. Open the `.pptx` in PowerPoint 2019/2021/365 (Morph needs 2019 or newer).
2. **Slide Show → From Beginning.**
3. Every slide already carries a **Morph** transition (1.4 s, *by object*), so
   it plays as designed. If you want to re-apply it yourself:
   **Transitions → Morph → Apply To All.**
4. Speaker notes are written on all 26 slides — press **View → Notes Page**, or
   use Presenter View. They contain the argument to make and the likely
   judge question on the dense slides.

## Why the Morph blends

Morph only animates objects it can recognise as "the same thing" on the next
slide. This deck is built for that rule:

| Technique | How it is used here |
| --- | --- |
| `!!` name prefix | Forces PowerPoint to match objects by name instead of by heuristic. |
| Shared frame | Every slide has `!!rail`, `!!rail-fill`, `!!rail-dot`, `!!glow-a`, `!!glow-b`, `!!eyebrow`, `!!title`, `!!rule`, `!!pageno`, `!!footer`. |
| Continuous motion | `!!rail-fill` grows downward all deck long and the brass `!!rail-dot` travels with it — a progress cue that animates on every transition. |
| Grouped objects | Cards are real PowerPoint **groups** (`!!pass-card`, `!!blk-1…5`, `!!portal-1…3`, `!!entity-1…7`, `!!rule-1…7`, `!!tech-1…6`, …). Each group flies, scales and rotates as one solid object instead of exploding into loose shapes. |
| Repeating anchors | The Smart Shram Pass group appears on slides 9 and 18 and grows between them; the ledger blocks cascade on slide 16; the three commitments on slide 7 become the pillar cards below them. |
| 3D treatment | Panels carry a subtle `a:sp3d` bevel, the ledger blocks and the closing card carry a scene-camera tilt (`a:camera/a:rot`), and every card has a soft outer shadow. Morph interpolates that geometry too, so cards feel like they lift off the slide. |

Everything stays inside the slide bounds except the two photographic title and
closing slides and the soft light blobs, which are meant to bleed.

## Design system

Palette taken from the app's own tokens in `../src/index.css`, so the deck and
the live prototype look like one product.

| Role | Colour | Hex |
| --- | --- | --- |
| Paper (light slides) | Sand 50 | `#FDFBF6` |
| Deep ground (dark slides) | Forest 950 | `#0A2219` |
| Ink / headings | Ink 900 | `#12211B` |
| Primary accent | Forest 600 / 700 | `#25704F` / `#1F5941` |
| Award accent | Brass 400 / 500 | `#D9A844` / `#C68D2F` |
| Alert accent | Coral | `#B4482F` |
| Muted text | Ink 400 / 500 | `#749084` / `#557165` |

Type: **Georgia** for display headings (the stand-in for Fraunces), **Segoe UI**
for body, **Consolas** for figures and hashes, **Nirmala UI** for the Devanagari
line on the pass card. All four ship with Windows; macOS substitutes cleanly.

The palette was chosen for projector contrast: dark ink on warm paper for body
slides (≈13:1), and forest grounds with brass and mint accents for the five
rhythm slides. Nothing relies on a colour alone to carry meaning — every accent
is paired with a label.

## Slide map

| # | Slide | Chapter |
| --- | --- | --- |
| 1 | Title — Shram Setu 2.0 | — |
| 2 | Four chapters, twelve minutes | 01 Context |
| 3 | A dispute begins where the record ends | 01 |
| 4 | This is not a hypothetical gap *(dark)* | 01 |
| 5 | One question, seven objectives | 01 |
| 6 | What exists — and what it leaves open | 01 |
| 7 | Every shift. Every wage. Every change. *(dark, core idea)* | 02 Design |
| 8 | One record, three points of view | 02 |
| 9 | From NFC cards to printed QR passes | 02 |
| 10 | Five layers, one contract | 02 |
| 11 | Six choices, each with a reason | 02 |
| 12 | Seven entities, one work record | 02 |
| 13 | The arithmetic, entirely in the open | 02 |
| 14 | Recorded is not the same as received | 02 |
| 15 | Nothing is silently overwritten | 02 |
| 16 | Every block carries the one before it *(dark)* | 02 |
| 17 | Seven rules, zero black boxes | 02 |
| 18 | Identify, authenticate, authorise | 02 |
| 19 | Twelve scenarios a judge can test | 03 Build |
| 20 | Local first, shared when connected | 03 |
| 21 | Privacy by separation, not by promise | 03 |
| 22 | Thirty-nine assertions, honestly reported | 03 |
| 23 | Zero hardware, near-zero marginal cost | 03 |
| 24 | What this prototype cannot do yet | 04 Close |
| 25 | The contribution is inspectability *(dark)* | 04 |
| 26 | Thank you *(photo)* | 04 |

## Before you present — fill these in

* Slide 1 and 26: `[Student name]`, `[Class]`, `[Roll]`, `[Guide]`, `[School]`.
* Slide 26: replace the placeholder QR with a QR of your live/offline app link
  (or delete the card).
* Slide 2: adjust "twelve minutes" if your slot differs.

## How it was built (and how to change it)

```bash
python3 build_deck.py        # regenerate the .pptx from source
python3 validate_deck.py Shram_Setu_2.0_Indore_Sahodaya_CS.pptx   # structural checks
python3 preview.py Shram_Setu_2.0_Indore_Sahodaya_CS.pptx /tmp/prev  # rough renders
```

* `deck_lib.py` — design system: palette, gradient fills, shadows, 3D, grouped
  composites (pass card, QR), text fitting, and the Morph transition injector.
* `build_deck.py` — one function per slide, in order.
* `validate_deck.py` — checks the DrawingML rules PowerPoint is strict about:
  element order inside `spPr`/`ln`, valid 3D attribute names, unique shape ids,
  and a Morph transition on every slide.
* `preview.py` — a small rasteriser used to eyeball layout (fonts are DejaVu
  stand-ins, shadows and gradients are approximate, connector lines are drawn as
  thin boxes). Use it to catch overflow, not to judge the final look.

### Content sources

* `Shram_Setu_2.0_Project_Report.pdf` — research context, e-Shram/MGNREGS/ILO
  figures, the ₹650 × 4-day worked example, the seven rules, the test results,
  limitations and planned work.
* `Shram_Setu_2_0_Architecture.md` — repository/interface boundaries, IndexedDB
  and Supabase plan, sync outbox, security and privacy principles.
* This repository — design tokens (`src/index.css`), demo copy, the seeded
  ledger, `resetToBaseline()`, the audit bench, and the two photographs.

### Kept deliberately honest

The deck repeats the report's own caveats rather than smoothing them over: the
hash chain is tamper-**evident**, not tamper-proof; the test results are
self-reported on synthetic data; Supabase, PWA and cross-device approvals are
**planned**, not shipped; the ₹5 pass cost is an estimate; and the app itself
prints `isLocalDemoMode: true` / `isSupabaseConnected: false` on slide 10 and 20.
