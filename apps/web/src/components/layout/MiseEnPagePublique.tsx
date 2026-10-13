import { Outlet } from 'react-router';
import { BandeauEnvironnement } from './BandeauEnvironnement';

/** Pages sans connexion : connexion, inscription, mot de passe oublié */
export function MiseEnPagePublique() {
  return (
    <div className="min-h-dvh">
      <BandeauEnvironnement />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
        <header className="text-center">
          <p className="text-3xl font-bold text-gresi-bleu">GRESI</p>
          <p className="text-sm text-slate-600">Semaine de l’Industrie — ESI, INPHB</p>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
