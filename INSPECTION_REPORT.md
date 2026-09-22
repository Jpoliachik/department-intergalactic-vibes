<!-- Status: locked for first print (Seven Stars). Source: design/inspection-report/Main.dc.html.
     A practical artifact, not lore — it never graduates into the lore web. -->

# The Vibe Inspection Report

_A tear-off pad slip, stamped **VIBES CERTIFIED**._

The fastest interaction crew have. Walk up to someone, give them a two-second once-over, tick one or two boxes, circle a vibe type, stamp it, hand it over. Then walk off — or stay, because it just bought you the next thirty seconds.

It sits **before** the sticker → commendation card → provisional induction ladder. It asks nothing of the person and explains nothing about Vibe Corp. The depth lives on the cards; this is the laugh that gets you there.

## What's on it

**VIBE INSPECTION REPORT** — the wave glyph beside it.

- ☐ Verified human
- ☐ Frequency off the charts
- ☐ Permitted to get weird
- ☐ Suspected time traveler
- ☐ Claims this is a costume
- ☐ Too powerful. Reported to HQ.
- ☐ Your friend told me to check this
- ☐ Other:

**Vibe type** (circle one): Z-negative · 11:11 · Medium salsa · Double Gemini

Blank space bottom-right for the stamp. **vibecorp.live** under the frame.

## How the lines work

This slip is the one place the funny comes first. Its comedy is a stranger in hi-vis taking your vibes extremely seriously — the form is official, the findings are nonsense, and every finding is secretly a compliment.

- **Readable in one second, cold.** They read it after you've gone. No setup, no explaining, never confusing.
- **One inspector word per line, at most** — _verified, permitted, suspected, reported._ The rest is plain English. More jargon than that and it stops reading at a glance.
- **Observable from ten feet.** Something you can tick after one look — a costume, a move, a friend group, an energy.
- **Always a compliment.** The stamp says _certified_. Nothing is an infraction.
- **Choices, never bodies.** The costume, the commitment, the weirdness — never how someone looks.
- **Every line a different joke,** so any two ticks read as a combo.
- **"Verified human" is left unchecked.** The empty box is the joke. Tick it once a night, for someone suspiciously normal.
- **Plain characters only.** `B♭` was cut because the flat sign printed badly; no symbols a printer's fonts might not carry.
- **Eight lines, max** — seven printed plus _Other_. Any more and the pad can't be scanned with a thumb.

**The bench** — liked, not printed. Draw from these for a second pad or a refresh:
_Would inspect again · Tell no one · Suspiciously good at this · Possibly a real ____ · Spotted from space · Denied by HQ. Approved by me. · Out here DOING it · Stop it. (Don't stop.)_

## Print spec

- **Pad:** Vistaprint notepad, **4 × 5.5 in**, 50 sheets, glued top. Uncoated / matte stock — stamp ink beads and smears on gloss.
- **Ink:** black only, on white. No background tint — the paper is the colour.
- **Upload file:** PDF at **4.25 × 5.75 in** (0.125 in bleed each side), vector, fonts embedded. Rendered from the canvas in headless Chrome.
- **Margins:** readable content sits 11% of the width in from the left and right edges, and ≥7% from the top and bottom — the card layout rules in `CLAUDE.md` hold here too. Extra room at the top for the glued edge.
- **Stamp zone:** roughly 2 × 1.25 in of clear space right of the vibe types, sized for the 30mm **Vibes Certified** stamp (`STAMP` in `card-studio/lib/brand.ts`).
- **Mark:** `brand/mark/glyph.svg`, inlined.
- **Type:** Oswald 600 (title) · IBM Plex Sans Condensed 500 (lines) · IBM Plex Mono 600 (label, URL).
