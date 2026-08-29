"use client";

import {
  ImageIcon,
  Loader2,
  Quote,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";
import type { Card, GenerateKind } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CardFace } from "@/components/card-face";

type BusyMap = Partial<Record<GenerateKind, boolean>>;

export function CardTile({
  card,
  busy,
  onGenerate,
  onEdit,
}: {
  card: Card;
  busy: BusyMap;
  onGenerate: (kind: GenerateKind) => void;
  onEdit: () => void;
}) {
  const anyBusy = !!(busy.image || busy.tagline || busy.assignment);

  return (
    <div className="flex flex-col gap-3">
      <CardFace card={card} />

      <div className="grid grid-cols-2 gap-2">
        <GenButton
          label="Image"
          icon={<ImageIcon />}
          busy={!!busy.image}
          disabled={anyBusy}
          onClick={() => onGenerate("image")}
        />
        <GenButton
          label="Tagline"
          icon={<Quote />}
          busy={!!busy.tagline}
          disabled={anyBusy}
          onClick={() => onGenerate("tagline")}
        />
        <GenButton
          label="Assignment"
          icon={<ScrollText />}
          busy={!!busy.assignment}
          disabled={anyBusy}
          onClick={() => onGenerate("assignment")}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={onEdit}
          className="justify-start"
        >
          <SlidersHorizontal />
          Edit
        </Button>
      </div>
    </div>
  );
}

function GenButton({
  label,
  icon,
  busy,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="justify-start"
      title={`Regenerate ${label.toLowerCase()}`}
    >
      {busy ? <Loader2 className="animate-spin" /> : icon}
      {label}
    </Button>
  );
}
