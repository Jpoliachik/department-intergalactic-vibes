import "./style.css";
import { bySlug, preloadArt } from "./deck";
import { rare } from "./engine";
import { startHz } from "./hz";
import { go } from "./screens";
import { load, wipe } from "./state";

const hz = startHz(document.getElementById("hz")!);
document.getElementById("home")!.addEventListener("click", () => go.start());

// Hidden hooks for testing on a real phone: #forget, #spike, #rare.
const hook = location.hash.slice(1);
if (hook) history.replaceState(null, "", location.pathname);
if (hook === "forget") wipe();
if (hook === "spike") setTimeout(hz.spike, 1200);
if (hook === "rare") rare.force = true;

// A returning visitor sees their art within a second; start fetching now.
const m = load();
const onFile = bySlug(m.card) ?? bySlug(m.leaning);
if (onFile) void preloadArt(onFile);

// vibecorp.live/GT-01 opens straight into tuning that code.
const path = decodeURIComponent(location.pathname.slice(1));
if (/^[A-Za-z]{2}-?\d{2}$/.test(path)) {
  history.replaceState(null, "", "/");
  go.transmit(path);
} else {
  go.start();
}
