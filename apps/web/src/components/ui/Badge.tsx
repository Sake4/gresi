import type { ReactNode } from "react";

type VarianteBadge = "info" | "succes" | "doux" | "neutre";

interface BadgeProps {
  variante?: VarianteBadge;
  children: ReactNode;
}

const STYLES_VARIANTES: Record<VarianteBadge, string> = {
  info: "border-gresi-bleu/20 bg-gresi-bleu/10 text-gresi-bleu",
  succes: "border-gresi-vert bg-gresi-vert text-gresi-encre",
  doux: "border-gresi-vert/50 bg-gresi-vert/15 text-gresi-vert-fonce",
  neutre: "border-gresi-gris-bleu bg-gresi-gris-bleu/40 text-gresi-encre",
};

export function Badge({ variante = "info", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-sm font-semibold ${STYLES_VARIANTES[variante]}`}
    >
      {children}
    </span>
  );
}
