import type { ReactNode } from 'react';

type Ton = 'info' | 'succes' | 'erreur';

const STYLES: Record<Ton, string> = {
  info: 'border-gresi-bleu bg-gresi-bleu/5 text-gresi-bleu',
  succes: 'border-gresi-vert bg-gresi-vert/10 text-green-900',
  erreur: 'border-gresi-orange bg-gresi-orange/10 text-orange-900',
};

export function Alerte({ ton = 'info', children }: { ton?: Ton; children: ReactNode }) {
  return (
    <div
      role={ton === 'erreur' ? 'alert' : 'status'}
      className={`rounded-lg border-l-4 px-4 py-3 text-sm ${STYLES[ton]}`}
    >
      {children}
    </div>
  );
}
