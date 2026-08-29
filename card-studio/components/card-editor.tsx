"use client";

import * as React from "react";
import { ImageIcon, Loader2, RefreshCw, Wand2 } from "lucide-react";
import type { Card, GenerateKind, Globals, StoredCard } from "@/lib/types";
import { render } from "@/lib/prompts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type BusyMap = Partial<Record<GenerateKind, boolean>>;

export function CardEditor({
  card,
  globals,
  busy,
  open,
  onOpenChange,
  onSave,
  onGenerate,
}: {
  card: Card | null;
  globals: Globals;
  busy: BusyMap;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<StoredCard>) => Promise<void>;
  onGenerate: (kind: GenerateKind) => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {card && (
          <EditorBody
            key={card.slug}
            card={card}
            globals={globals}
            busy={busy}
            onSave={onSave}
            onGenerate={onGenerate}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

const FIELDS: (keyof StoredCard)[] = [
  "name",
  "designation",
  "code",
  "function",
  "object",
  "fieldReading",
  "bio",
  "sceneStory",
  "tagline",
  "assignment",
  "imagePrompt",
];

function EditorBody({
  card,
  globals,
  busy,
  onSave,
  onGenerate,
}: {
  card: Card;
  globals: Globals;
  busy: BusyMap;
  onSave: (patch: Partial<StoredCard>) => Promise<void>;
  onGenerate: (kind: GenerateKind) => Promise<void>;
}) {
  const [draft, setDraft] = React.useState<StoredCard>(card);
  const [saving, setSaving] = React.useState(false);

  // Sync generated outputs back into the draft when regeneration updates them,
  // without clobbering in-progress edits to the source fields.
  React.useEffect(() => setDraft((d) => ({ ...d, tagline: card.tagline })), [card.tagline]);
  React.useEffect(() => setDraft((d) => ({ ...d, assignment: card.assignment })), [card.assignment]);
  React.useEffect(() => setDraft((d) => ({ ...d, imagePrompt: card.imagePrompt })), [card.imagePrompt]);

  const dirty = FIELDS.some((f) => draft[f] !== card[f]);

  function set<K extends keyof StoredCard>(key: K, value: StoredCard[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function currentPatch(): Partial<StoredCard> {
    const patch: Partial<StoredCard> = {};
    for (const f of FIELDS) if (draft[f] !== card[f]) (patch as any)[f] = draft[f];
    return patch;
  }

  async function save() {
    setSaving(true);
    try {
      await onSave(currentPatch());
    } finally {
      setSaving(false);
    }
  }

  // Persist current edits, then regenerate — so generation uses the latest text.
  async function saveThenGenerate(kind: GenerateKind) {
    if (dirty) {
      setSaving(true);
      try {
        await onSave(currentPatch());
      } finally {
        setSaving(false);
      }
    }
    await onGenerate(kind);
  }

  function rebuildImagePrompt() {
    const built = render(globals.imagePrompt, { ...card, ...draft } as Card);
    set("imagePrompt", built);
  }

  return (
    <>
      <SheetHeader className="sticky top-0 z-10 border-b bg-card/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {card.code}
          </Badge>
          <SheetTitle>{card.name}</SheetTitle>
        </div>
        <SheetDescription>
          {card.function} · {card.object}. Edit the source, tune the prompt, or
          regenerate any piece.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 px-5 py-5">
        {/* Content shown on the card */}
        <section className="space-y-3">
          <SectionTitle>On the card</SectionTitle>

          <Field label="Tagline">
            <div className="flex gap-2">
              <Input
                value={draft.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="Short, mystical tagline…"
              />
              <RegenButton
                busy={!!busy.tagline}
                onClick={() => saveThenGenerate("tagline")}
              />
            </div>
          </Field>

          <Field label="Assignment">
            <div className="flex gap-2">
              <Textarea
                value={draft.assignment}
                onChange={(e) => set("assignment", e.target.value)}
                rows={3}
                placeholder="Two-sentence assignment…"
              />
              <RegenButton
                busy={!!busy.assignment}
                onClick={() => saveThenGenerate("assignment")}
              />
            </div>
          </Field>
        </section>

        <Separator />

        {/* Source variables */}
        <section className="space-y-3">
          <SectionTitle>Character source</SectionTitle>
          <p className="text-xs text-muted-foreground">
            These feed the generators. Edit, then regenerate.
          </p>
          <Field label="Bio">
            <Textarea
              value={draft.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Scene story">
            <Textarea
              value={draft.sceneStory}
              onChange={(e) => set("sceneStory", e.target.value)}
              rows={4}
            />
          </Field>
        </section>

        <Separator />

        {/* Image prompt */}
        <section className="space-y-3">
          <SectionTitle>Image</SectionTitle>
          <Field label="Image prompt">
            <Textarea
              value={draft.imagePrompt}
              onChange={(e) => set("imagePrompt", e.target.value)}
              rows={8}
              className="font-mono text-xs leading-relaxed"
              placeholder="Empty = built from the global template on generate."
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={rebuildImagePrompt}>
              <RefreshCw />
              Rebuild from template
            </Button>
            <Button
              size="sm"
              onClick={() => saveThenGenerate("image")}
              disabled={!!busy.image}
            >
              {busy.image ? <Loader2 className="animate-spin" /> : <ImageIcon />}
              Generate image
            </Button>
          </div>
        </section>

        <Separator />

        {/* Metadata */}
        <section className="space-y-3">
          <SectionTitle>Metadata</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Code">
              <Input value={draft.code} onChange={(e) => set("code", e.target.value)} />
            </Field>
            <Field label="Designation">
              <Input
                value={draft.designation}
                onChange={(e) => set("designation", e.target.value)}
              />
            </Field>
            <Field label="Function">
              <Input
                value={draft.function}
                onChange={(e) => set("function", e.target.value)}
              />
            </Field>
            <Field label="Object">
              <Input value={draft.object} onChange={(e) => set("object", e.target.value)} />
            </Field>
            <Field label="Field reading">
              <Input
                value={draft.fieldReading}
                onChange={(e) => set("fieldReading", e.target.value)}
              />
            </Field>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t bg-card/95 px-5 py-3 backdrop-blur">
        <span className="text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <Button onClick={save} disabled={!dirty || saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Wand2 />}
          Save changes
        </Button>
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RegenButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={busy}
      title="Regenerate"
      className="shrink-0"
    >
      {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
    </Button>
  );
}
