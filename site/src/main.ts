import "./style.css";
import { bySlug, preloadArt } from "./deck";
import { rare } from "./engine";
import { meter } from "./meter/meter";
import { go } from "./screens";
import { load, wipe } from "./state";

meter.start(document.getElementById("hz")!, { post: () => load().card });
document.getElementById("home")!.addEventListener("click", () => go.start());

// Hidden hooks for testing on a real phone: #forget, #rare, and any meter
// episode by name (#spike, #dropout, #calibrate).
const hook = location.hash.slice(1);
if (hook) history.replaceState(null, "", location.pathname);
if (hook === "forget") wipe();
setTimeout(() => meter.trigger(hook), 1200);
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
