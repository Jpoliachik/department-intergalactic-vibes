"use client";

import { useState } from "react";
import { Badge, Glyph, Seal, type MarkTreatment } from "@/components/brand/mark";
import { BandField } from "@/components/brand/bands";
import { Star } from "@/components/star";
import { BAND_KEYS, PALETTE, TYPE_VOICES, type PaletteKey } from "@/lib/brand";

/**
 * BRAND EXPLORATIONS — /brand
 *
 * A page for deciding, not a style guide. Every fork in the brand root is laid
 * out here side by side so it can be looked at rather than argued about. Once
 * a fork is settled it comes OUT of this page and goes into DESIGN.md.
 */

function Section({ n, title, note, children }: { n: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-deck-mustard/20 py-14">
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-mono text-xs tracking-[0.3em] text-deck-mustard">{n}</span>
        <h2 className="text-2xl font-semibold uppercase tracking-[0.18em] text-deck-cream">{title}</h2>
      </div>
      {note && <p className="mb-8 max-w-2xl text-sm leading-relaxed text-deck-cream/55">{note}</p>}
      {children}
    </section>
  );
}

function Option({ label, caption, children }: { label: string; caption?: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="flex min-h-[150px] items-center justify-center">{children}</div>
      <figcaption className="text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-deck-mustard">{label}</div>
        {caption && <div className="mt-1 max-w-[16rem] text-xs leading-relaxed text-deck-cream/45">{caption}</div>}
      </figcaption>
    </figure>
  );
}

export default function BrandPage() {
  const [treatment, setTreatment] = useState<MarkTreatment>("flat");
  const [bottom, setBottom] = useState("Field Assignment");

  // Short is not a style preference — it is what the arc holds. The seal
  // auto-fits any label, but one that needs the floor size has lost the
  // argument and should be reworded.
  const RING_TEXTS = [
    "Field Assignment",
    "Vibes Certified",
    "Commendation",
    "Provisional Induction",
    "Grid Maintenance",
  ];

  return (
    <main className="mx-auto max-w-6xl px-8 py-16 text-deck-cream">
      <header className="mb-4 flex items-center gap-6">
        <Badge className="h-20 w-20 text-deck-cream" />
        <div>
          <h1 className="text-4xl font-semibold uppercase tracking-[0.2em]">Brand Root</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-deck-mustard">
            Explorations — nothing locked
          </p>
        </div>
      </header>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-deck-cream/55">
        Five forks to settle. Each one that gets picked leaves this page and moves into DESIGN.md,
        where it stops being a question.
      </p>

      {/* ---------------------------------------------------------------- */}
      <Section
        n="01"
        title="The mark, in three pieces"
        note="Not one logo — three nested pieces, so the mark has somewhere to go when it gets small or when the disc is in the way. The glyph is the atomic form: it is what survives embroidery, a 16px favicon, and a single-colour vinyl cut."
      >
        <div className="grid grid-cols-3 gap-8">
          <Option label="Glyph" caption="Waves alone. The atomic form. Inherits its colour from whatever it sits in.">
            <Glyph className="h-28 w-28 text-deck-cream" treatment={treatment} />
          </Option>
          <Option label="Badge" caption="Disc + hairline ring + waves. The primary mark, for anywhere the outfit signs its name.">
            <Badge className="h-32 w-32 text-deck-cream" treatment={treatment} />
          </Option>
          <Option label="Seal" caption="Badge wearing circular type. The bottom ring is swappable — that is what makes it an artifact engine.">
            <Seal className="h-32 w-32 text-deck-cream" bottom={bottom} treatment={treatment} />
          </Option>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        n="02"
        title="Fork: flat or gradient"
        note="The SVG you have is flat white. The card back wears a teal→blue→rose sweep. These cannot both be the logo. My read: the FLAT mark is canonical and the gradient is a treatment reserved for large, single-appearance moments (a card back, a page hero) — because flat is the one that survives an embroiderer, a one-colour sticker, a stamp, and a phone-sized favicon without a conversation."
      >
        <div className="mb-8 flex gap-3">
          {(["flat", "gradient"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTreatment(t)}
              className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                treatment === t
                  ? "border-deck-mustard bg-deck-mustard text-deck-plum"
                  : "border-deck-mustard/30 text-deck-cream/60 hover:border-deck-mustard/70"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="self-center pl-2 text-xs text-deck-cream/40">
            — toggles every mark on this page
          </span>
        </div>
        <div className="grid grid-cols-4 gap-8">
          <Option label="Flat / cream" caption="#f3e9d6. Warm. Matches the ink used everywhere else in the system.">
            <Badge className="h-28 w-28" style={{ color: PALETTE.cream.hex }} />
          </Option>
          <Option label="Flat / white" caption="#ffffff, as the source SVG. Crisper, colder, one more colour in the system.">
            <Badge className="h-28 w-28 text-white" />
          </Option>
          <Option label="Flat / mustard" caption="Signal colour. Reads as a stamp rather than a logo.">
            <Badge className="h-28 w-28" style={{ color: PALETTE.mustard.hex }} />
          </Option>
          <Option label="Gradient" caption="The card-back treatment. Beautiful big; mud at 20px; a fight at the printer.">
            <Badge className="h-28 w-28" treatment="gradient" />
          </Option>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        n="03"
        title="The seal as artifact engine"
        note="One component, two strings. This is the highest-leverage thing in the whole root: every future sticker, business card, patch and stamp is the same seal saying a different bottom line. Click one."
      >
        <div className="mb-8 flex flex-wrap gap-2">
          {RING_TEXTS.map((t) => (
            <button
              key={t}
              onClick={() => setBottom(t)}
              className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition ${
                bottom === t
                  ? "border-deck-mustard bg-deck-mustard text-deck-plum"
                  : "border-deck-mustard/30 text-deck-cream/60 hover:border-deck-mustard/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-10">
          {RING_TEXTS.slice(0, 3).map((t) => (
            <Option key={t} label={t}>
              <Seal className="h-40 w-40 text-deck-cream" bottom={t} treatment={treatment} />
            </Option>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        n="04"
        title="Scale — where the mark breaks"
        note="The hairline ring is the weak point. Below roughly 24px it fills in and the mark turns to mud, which is why the badge takes a ring={false} and why the glyph exists at all. Look at the bottom row: that is the favicon."
      >
        <div className="space-y-10">
          <div className="flex items-end gap-8">
            {[128, 64, 40, 24, 16].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Badge style={{ width: s, height: s, color: PALETTE.cream.hex }} treatment={treatment} />
                <span className="font-mono text-[9px] text-deck-cream/35">{s}px ring</span>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-8">
            {[128, 64, 40, 24, 16].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Badge style={{ width: s, height: s, color: PALETTE.cream.hex }} ring={false} treatment={treatment} />
                <span className="font-mono text-[9px] text-deck-cream/35">{s}px no ring</span>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-8">
            {[128, 64, 40, 24, 16].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className="grid place-items-center rounded-full bg-deck-ink" style={{ width: s, height: s }}>
                  <Glyph style={{ width: s * 0.66, height: s * 0.66, color: PALETTE.cream.hex }} treatment={treatment} />
                </div>
                <span className="font-mono text-[9px] text-deck-cream/35">{s}px glyph</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        n="05"
        title="Palette, with roles"
        note="The hex values are unchanged from the deck — the cards and the stickers have to be the same outfit. What is new is the ROLE. Mustard is the single signal colour: it marks the thing you are meant to read. The band colours never carry type."
      >
        <div className="grid grid-cols-2 gap-x-10 gap-y-1">
          {(Object.keys(PALETTE) as PaletteKey[]).map((k) => (
            <div key={k} className="flex items-center gap-4 border-b border-deck-mustard/10 py-3">
              <div
                className="h-12 w-12 shrink-0 rounded border border-deck-cream/15"
                style={{ background: PALETTE[k].hex }}
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold uppercase tracking-[0.16em]">{k}</span>
                  <span className="font-mono text-[10px] text-deck-cream/40">{PALETTE[k].hex}</span>
                </div>
                <div className="text-xs leading-snug text-deck-cream/50">{PALETTE[k].role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        n="06"
        title="Type — three voices"
        note="Already true on the cards, named here so it holds off them. The rule that matters: ONE true-voice line per surface. The moment a second serif line appears, the first stops being the point."
      >
        <div className="space-y-8">
          <div className="border-l-2 border-deck-mustard pl-6">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-deck-mustard">Plate</div>
            <div className="text-2xl font-semibold uppercase tracking-[0.18em]">The Caretaker</div>
            <div className="mt-1 text-sm uppercase tracking-[0.2em] text-deck-mustard">Resonance Steward</div>
            <p className="mt-3 text-xs text-deck-cream/45">{TYPE_VOICES[0].use}</p>
          </div>
          <div className="border-l-2 border-deck-purple pl-6">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-deck-mustard">Code</div>
            <div className="font-mono text-xl uppercase tracking-[0.3em]">VC-07-PLD</div>
            <div className="mt-1 font-mono text-sm uppercase tracking-[0.25em] text-deck-cream/60">vibecorp.live</div>
            <p className="mt-3 text-xs text-deck-cream/45">{TYPE_VOICES[1].use}</p>
          </div>
          <div className="border-l-2 border-deck-teal pl-6">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-deck-mustard">True</div>
            <div className="font-card-serif text-3xl leading-snug text-deck-mustard">
              Keeping the galaxy&rsquo;s vibrations in tune.
            </div>
            <div className="mt-3 font-card-serif text-lg font-semibold uppercase tracking-[0.09em]">
              Move toward the quiet one.
            </div>
            <p className="mt-3 text-xs text-deck-cream/45">{TYPE_VOICES[2].use}</p>
          </div>
        </div>
        <p className="mt-8 max-w-2xl rounded border border-deck-mustard/25 bg-deck-plum/60 p-4 text-xs leading-relaxed text-deck-cream/60">
          <strong className="text-deck-mustard">Open:</strong> only the serif is a named face
          (Cormorant Garamond). Plate and Code are still the system stack. Naming real faces is the
          one type decision actually blocking a website — the specimens above are set in the
          fallbacks.
        </p>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        n="07"
        title="The band field"
        note="The card back's ground, made reusable and deterministic — same seed, same field, forever, which is what lets a printed sticker be reprinted. Below: the same component at three seeds, then carrying a seal."
      >
        <div className="grid grid-cols-4 gap-6">
          {[7, 23, 88].map((s) => (
            <div key={s} className="overflow-hidden rounded-lg border border-deck-mustard/20">
              <BandField seed={s} width={300} height={420} />
            </div>
          ))}
          <div className="overflow-hidden rounded-lg border border-deck-mustard/20">
            <BandField seed={7} width={300} height={420} clearCenter={0.75}>
              <Seal className="h-[55%] w-[55%] text-deck-cream" bottom={bottom} />
            </BandField>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-44 w-44 overflow-hidden rounded-full border-4 border-deck-mustard">
              <BandField seed={3} width={200} height={200} bands={7} dust={18} stars={4} clearCenter={0.82}>
                <Seal className="h-[78%] w-[78%] text-deck-cream" bottom="Vibes Certified" />
              </BandField>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-deck-mustard">
              Round sticker, 3in
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-[198px] w-[350px] items-center gap-6 rounded-lg border border-deck-mustard/40 bg-deck-plum px-8">
              <Badge className="h-24 w-24 shrink-0 text-deck-cream" />
              <div>
                <div className="text-xl font-semibold uppercase tracking-[0.18em]">Vibe Corp</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-deck-mustard">
                  Field Crew
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Star points={7} className="h-3 w-3 text-deck-mustard" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-deck-cream/70">
                    vibecorp.live
                  </span>
                </div>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-deck-mustard">
              &ldquo;Business&rdquo; card, flat
            </span>
          </div>
        </div>
      </Section>
    </main>
  );
}
