import { useId, type InputHTMLAttributes } from 'react';

interface ChampTexteProps extends InputHTMLAttributes<HTMLInputElement> {
  libelle: string;
  erreur?: string;
  aide?: string;
}

export function ChampTexte({ libelle, erreur, aide, className = '', ...props }: ChampTexteProps) {
  const id = useId();
  const idMessage = `${id}-message`;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {libelle}
      </label>
      <input
        id={id}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur || aide ? idMessage : undefined}
        className={`rounded-lg border bg-white px-3 py-2.5 text-base ${erreur ? 'border-gresi-orange' : 'border-gresi-gris-bleu'}`}
        {...props}
      />
      {(erreur || aide) && (
        <p id={idMessage} className={`text-sm ${erreur ? 'text-gresi-orange' : 'text-slate-500'}`}>
          {erreur ?? aide}
        </p>
      )}
    </div>
  );
}
