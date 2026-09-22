// The reading in the header: 7.83 Hz, the Earth's own resonance, wavering
// slightly. Now and then the reading surges: it climbs, runs hot and red,
// and settles back. Nothing else on the page reacts. It just happened.

const BASE = 7.83;

export function startHz(el: HTMLElement) {
  const bar = el.closest("header");
  let spiking = false;

  const show = (v: number) => (el.textContent = `${v.toFixed(2)} Hz`);

  function spike() {
    if (spiking) return;
    spiking = true;
    const peak = 30 + Math.random() * 60;
    const up = 2600;
    const hold = 900;
    const down = 3400;
    const t0 = performance.now();
    const step = () => {
      const t = performance.now() - t0;
      const k = t < up ? (t / up) ** 2 : t < up + hold ? 1 : Math.max(0, 1 - (t - up - hold) / down);
      const hot = k > 0.12;
      el.classList.toggle("spike", hot);
      bar?.classList.toggle("spiking", hot);
      show(BASE + (peak - BASE) * k + (Math.random() - 0.5) * (0.06 + 3 * k));
      if (t < up + hold + down) setTimeout(step, 90);
      else spiking = false;
    };
    step();
  }

  setInterval(() => {
    if (spiking || document.hidden) return; // rest while nobody's looking
    show(BASE + (Math.random() - 0.5) * 0.06);
  }, 1400);

  // The first surge comes early enough that almost everyone sees one, then
  // they keep coming at irregular intervals. A hidden tab waits its turn.
  const between = (lo: number, hi: number) => (lo + Math.random() * (hi - lo)) * 1000;
  const next = (delay: number) =>
    setTimeout(() => {
      if (document.hidden) return next(between(5, 15));
      spike();
      next(between(45, 120));
    }, delay);
  next(between(20, 40));

  return { spike };
}
