# Brand assets

Generated. Do not hand-edit anything in `mark/`, `tokens.css` or `tokens.json` —
they are written from `card-studio/lib/brand.ts` by:

    cd card-studio && node scripts/export-brand.mjs

Same rule as the deck: one definition in the codebase, and the outside world
gets files.

## What's here

| File | For |
| --- | --- |
| `mark/glyph.svg` | The waves alone. Favicon, embroidery, vinyl, anywhere small or one-colour. |
| `mark/badge.svg` | Primary mark. Ring + waves take `currentColor`. |
| `mark/badge-cream.svg` | Same, fully specified — for vendors and RIPs that won't inherit colour. |
| `mark/badge-mono.svg` | One colour, no disc. Stamps, foil, screen print. |
| `mark/badge-small.svg` | No hairline ring. Use below ~24px, where the ring fills in. |
| `tokens.css` | `--vc-*` custom properties. |
| `tokens.json` | The same, for tooling. |

The **seal** — the badge wearing circular type — is not a file, because its
bottom line changes per artifact. It lives as a component:
`card-studio/components/brand/mark.tsx`.

Explorations and specimens: run the studio and open `/brand`.
