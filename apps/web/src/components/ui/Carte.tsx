import type { ReactNode } from 'react';

interface CarteProps {
  titre?: string;
  children: ReactNode;
  className?: string;
}

export function Carte({ titre, children, className = '' }: CarteProps) {
  return (
    <section className={`rounded-xl border border-gresi-gris-bleu/40 bg-white p-5 shadow-sm ${className}`}>
      {titre && <h2 className="mb-3 text-lg font-semibold text-gresi-bleu">{titre}</h2>}
      {children}
    </section>
  );
}
