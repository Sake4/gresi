import type { ButtonHTMLAttributes } from 'react';

type Variante = 'principal' | 'secondaire' | 'danger' | 'lien';

const STYLES: Record<Variante, string> = {
  principal: 'bg-gresi-bleu text-white hover:bg-gresi-bleu-2 disabled:bg-gresi-gris-bleu',
  secondaire: 'border border-gresi-bleu text-gresi-bleu bg-white hover:bg-gresi-gris disabled:opacity-50',
  danger: 'bg-gresi-orange text-white hover:brightness-95 disabled:opacity-50',
  lien: 'text-gresi-bleu underline-offset-4 hover:underline px-0',
};

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  enCours?: boolean;
  pleineLargeur?: boolean;
}

export function Bouton({
  variante = 'principal',
  enCours = false,
  pleineLargeur = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: BoutonProps) {
  return (
    <button
      type={type}
      disabled={disabled || enCours}
      aria-busy={enCours}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition disabled:cursor-not-allowed ${STYLES[variante]} ${pleineLargeur ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {enCours ? 'Patientez…' : children}
    </button>
  );
}
