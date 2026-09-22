// What this device remembers. There are no accounts: "on file" means here.
// Storage can be missing or throw (private windows, blocked site data), so
// every access is guarded and the channel works without it.

export type Memory = {
  /** Slug of the post they entered from a physical card. */
  card?: string;
  /** Slug the self-calibration leaned toward. */
  leaning?: string;
  /** They reached the end of the listening path. */
  listened?: boolean;
};

const KEY = "vibecorp.channel";

export function load(): Memory {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function save(m: Memory) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* nothing to do; the session still works */
  }
}

export function update(change: (m: Memory) => void) {
  const m = load();
  change(m);
  save(m);
}

export function wipe() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* already gone */
  }
}
