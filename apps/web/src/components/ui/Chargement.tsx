export function Chargement({ texte = 'Chargement…' }: { texte?: string }) {
  return (
    <div role="status" className="flex min-h-40 items-center justify-center gap-3 text-gresi-bleu">
      <span className="size-5 animate-spin rounded-full border-2 border-gresi-bleu border-t-transparent" />
      <span>{texte}</span>
    </div>
  );
}
