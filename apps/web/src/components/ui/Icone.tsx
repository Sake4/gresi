interface IconeProps {
  /** Nom de l'icône Material Symbols, par exemple "event" ou "qr_code_2". */
  nom: string;
  /** Classes Tailwind (taille, couleur…). Exemple : "text-[20px] text-gresi-bleu" */
  className?: string;
  /** Icône pleine au lieu de contour. */
  rempli?: boolean;
}

export function Icone({ nom, className = "", rempli = false }: IconeProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      aria-hidden="true"
      style={
        rempli
          ? { fontVariationSettings: '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24' }
          : undefined
      }
    >
      {nom}
    </span>
  );
}
