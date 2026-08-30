"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Settings2 } from "lucide-react";
import type {
  Card,
  GenerateKind,
  Globals,
  StoredCard,
  StudioState,
} from "@/lib/types";
import { fetchState, generate, saveCard, saveGlobals } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { CardTile } from "@/components/card-tile";
import { Star } from "@/components/star";
import { CardEditor } from "@/components/card-editor";
import { GlobalsEditor } from "@/components/globals-editor";

type BusyMap = Partial<Record<GenerateKind, boolean>>;
const KIND_LABEL: Record<GenerateKind, string> = {
  image: "Image",
  assignment: "Assignment",
};

export function DeckStudio() {
  const [state, setState] = React.useState<StudioState | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<Record<string, BusyMap>>({});
  const [editingSlug, setEditingSlug] = React.useState<string | null>(null);
  const [globalsOpen, setGlobalsOpen] = React.useState(false);

  React.useEffect(() => {
    fetchState()
      .then(setState)
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : String(err)),
      );
  }, []);

  function replaceCard(card: Card) {
    setState((s) =>
      s
        ? { ...s, cards: s.cards.map((c) => (c.slug === card.slug ? card : c)) }
        : s,
    );
  }

  function markBusy(slug: string, kind: GenerateKind, value: boolean) {
    setBusy((b) => ({ ...b, [slug]: { ...b[slug], [kind]: value } }));
  }

  async function handleGenerate(slug: string, kind: GenerateKind) {
    markBusy(slug, kind, true);
    try {
      const card = await generate(kind, slug);
      replaceCard(card);
      toast.success(`${KIND_LABEL[kind]} regenerated`, {
        description: card.name,
      });
    } catch (err) {
      toast.error(`Couldn't regenerate ${kind}`, {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      markBusy(slug, kind, false);
    }
  }

  async function handleSaveCard(slug: string, patch: Partial<StoredCard>) {
    if (Object.keys(patch).length === 0) return;
    try {
      const card = await saveCard(slug, patch);
      replaceCard(card);
      toast.success("Saved", { description: card.name });
    } catch (err) {
      toast.error("Couldn't save", {
        description: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  async function handleSaveGlobals(globals: Globals) {
    try {
      const saved = await saveGlobals(globals);
      setState((s) => (s ? { ...s, globals: saved } : s));
      toast.success("Global prompts saved");
    } catch (err) {
      toast.error("Couldn't save prompts", {
        description: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-lg font-semibold text-destructive">
          Couldn&apos;t load the deck
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading deck…
      </div>
    );
  }

  const editingCard = state.cards.find((c) => c.slug === editingSlug) ?? null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* The deck's own mark, not a stock icon — same star that
                sits on every card divider. */}
            <Star points={7} className="h-5 w-5 shrink-0 text-accent" />
            <div>
              <h1 className="text-base font-semibold leading-tight">
                Vibe Corp Card Studio
              </h1>
              <p className="text-xs text-muted-foreground">
                Field Specialty deck · {state.cards.length} cards
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setGlobalsOpen(true)}>
            <Settings2 />
            Global prompts
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {state.cards.map((card) => (
            <CardTile
              key={card.slug}
              card={card}
              busy={busy[card.slug] ?? {}}
              onGenerate={(kind) => handleGenerate(card.slug, kind)}
              onEdit={() => setEditingSlug(card.slug)}
            />
          ))}
        </div>
      </main>

      <CardEditor
        card={editingCard}
        globals={state.globals}
        busy={editingSlug ? (busy[editingSlug] ?? {}) : {}}
        open={!!editingCard}
        onOpenChange={(open) => !open && setEditingSlug(null)}
        onSave={(patch) =>
          editingSlug ? handleSaveCard(editingSlug, patch) : Promise.resolve()
        }
        onGenerate={(kind) =>
          editingSlug ? handleGenerate(editingSlug, kind) : Promise.resolve()
        }
      />

      <GlobalsEditor
        globals={state.globals}
        open={globalsOpen}
        onOpenChange={setGlobalsOpen}
        onSave={handleSaveGlobals}
      />
    </div>
  );
}
