import { NavLink, Outlet } from 'react-router';
import { BandeauEnvironnement } from './BandeauEnvironnement';
import { BoutonDeconnexion } from './BoutonDeconnexion';

const LIENS = [
  { vers: '/mon-espace', libelle: 'Accueil', fin: true },
  { vers: '/mon-espace/activites', libelle: 'Activités', fin: false },
  { vers: '/mon-espace/qr', libelle: 'Mon QR', fin: false },
];

/** Mobile d'abord : navigation en bas de l'écran */
export function MiseEnPageParticipant() {
  return (
    <div className="flex min-h-dvh flex-col">
      <BandeauEnvironnement />
      <header className="flex items-center justify-between bg-gresi-bleu px-4 py-3 text-white">
        <span className="text-lg font-bold">GRESI</span>
        <BoutonDeconnexion className="text-white" />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-gresi-gris-bleu/50 bg-white pb-[env(safe-area-inset-bottom)]">
        {LIENS.map((lien) => (
          <NavLink
            key={lien.vers}
            to={lien.vers}
            end={lien.fin}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm font-medium ${isActive ? 'text-gresi-bleu' : 'text-slate-500'}`
            }
          >
            {lien.libelle}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
