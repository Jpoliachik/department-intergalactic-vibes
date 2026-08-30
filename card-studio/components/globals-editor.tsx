"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";
import type { Globals } from "@/lib/types";
import { TEMPLATE_VARS } from "@/lib/prompts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function GlobalsEditor({
  globals,
  open,
  onOpenChange,
  onSave,
}: {
  globals: Globals;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (globals: Globals) => Promise<void>;
}) {
  const [draft, setDraft] = React.useState<Globals>(globals);
  const [saving, setSaving] = React.useState(false);

  // Re-seed the draft each time the dialog is opened.
  React.useEffect(() => {
    if (open) setDraft(globals);
  }, [open, globals]);

  function set<K extends keyof Globals>(key: K, value: Globals[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const dirty = (Object.keys(draft) as (keyof Globals)[]).some(
    (k) => draft[k] !== globals[k],
  );

  async function save() {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Global prompts</DialogTitle>
          <DialogDescription>
            Templates used to generate each piece for every character. Use{" "}
            <code className="rounded bg-secondary px-1">{"{{variable}}"}</code>{" "}
            placeholders.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARS.map((v) => (
            <Badge key={v} variant="secondary" className="font-mono text-[10px]">
              {`{{${v}}}`}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="image" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            <Textarea
              value={draft.imagePrompt}
              onChange={(e) => set("imagePrompt", e.target.value)}
              rows={14}
              className="font-mono text-xs leading-relaxed"
            />
          </TabsContent>
          <TabsContent value="assignment">
            <Textarea
              value={draft.assignmentPrompt}
              onChange={(e) => set("assignmentPrompt", e.target.value)}
              rows={14}
              className="font-mono text-xs leading-relaxed"
            />
          </TabsContent>
          <TabsContent value="models" className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Text model (Anthropic)</Label>
              <Input
                value={draft.textModel}
                onChange={(e) => set("textModel", e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Used for assignments. Overridden by{" "}
                <code>TEXT_MODEL</code> if set in the environment.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Image model (Gemini)</Label>
              <Input
                value={draft.imageModel}
                onChange={(e) => set("imageModel", e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Nano Banana. Overridden by <code>IMAGE_MODEL</code> if set.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Save prompts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
