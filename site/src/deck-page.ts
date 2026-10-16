// /deck: every card face in deck order, unlinked from the channel. Tap a card
// to hold it up close. Faces come from card-studio via `npm run sync:faces`.
import "./style.css";
import "./deck-page.css";
import faces from "./faces.json";
import { CARDS, type Card } from "./deck";
import { meter } from "./meter/meter";

type Face = { avif: string; webp: string; src: string };
const FACES: Record<string, Face> = faces;

meter.start(document.getElementById("hz")!);

/** A card face at a given display size. 720×1006 is the trim box at 720 wide. */
function facePicture(c: Card, sizes: string): HTMLPictureElement {
  const f = FACES[c.slug];
  const pic = document.createElement("picture");
  for (const [type, srcset] of [["image/avif", f.avif], ["image/webp", f.webp]]) {
    pic.append(Object.assign(document.createElement("source"), { type, srcset, sizes }));
  }
  pic.append(
    Object.assign(new Image(720, 1006), {
      src: f.src,
      alt: `${c.name}, ${c.designation} (${c.code})`,
      decoding: "async",
      loading: "lazy",
    }),
  );
  return pic;
}

const list = document.getElementById("faces")!;
const box = document.getElementById("lightbox") as HTMLDialogElement;
const shown = CARDS.filter((c) => FACES[c.slug]);

document.getElementById("count")!.textContent = `The posts · ${shown.length}`;

for (const c of shown) {
  const btn = Object.assign(document.createElement("button"), { type: "button", className: "face" });
  btn.append(facePicture(c, "(max-width: 520px) 46vw, 240px"));
  btn.addEventListener("click", () => {
    const big = facePicture(c, "min(92vw, 60dvh)");
    big.querySelector("img")!.loading = "eager";
    box.replaceChildren(big);
    box.showModal();
  });
  const li = document.createElement("li");
  li.append(btn);
  list.append(li);
}

// Any tap closes it; Escape already does.
box.addEventListener("click", () => box.close());
