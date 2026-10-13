import { NavLink, Outlet } from 'react-router';
import type { Role } from '@gresi/shared';
import { BandeauEnvironnement } from './BandeauEnvironnement';
import { BoutonDeconnexion } from './BoutonDeconnexion';

interface Lien {
  vers: string;
  libelle: string;
  roles: Role[];
}

const LIENS: Lien[] = [
  { vers: '/admin', libelle: 'Statistiques', roles: ['admin', 'admin_superieur'] },
  { vers: '/admin/participants', libelle: 'Participants', roles: ['admin', 'admin_superieur'] },
  { vers: '/admin/annonces', libelle: 'Annonces', roles: ['admin', 'admin_superieur'] },
  { vers: '/admin/activites', libelle: 'Activités', roles: ['admin_superieur'] },
  { vers: '/admin/personnel', libelle: 'Personnel', roles: ['admin_superieur'] },
  { vers: '/admin/journal', libelle: 'Journal', roles: ['admin_superieur'] },
];

export function MiseEnPageAdmin({ role }: { role: Role | null }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <BandeauEnvironnement />
      <header className="flex items-center justify-between bg-gresi-bleu px-6 py-3 text-white">
        <span className="text-lg font-bold">GRESI — Administration</span>
        <BoutonDeconnexion className="text-white" />
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <nav className="flex gap-1 overflow-x-auto border-b border-gresi-gris-bleu/50 bg-white p-2 md:w-56 md:flex-col md:border-r md:border-b-0">
          {LIENS.filter((l) => role && l.roles.includes(role)).map((lien) => (
            <NavLink
              key={lien.vers}
              to={lien.vers}
              end={lien.vers === '/admin'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${isActive ? 'bg-gresi-bleu text-white' : 'text-slate-700 hover:bg-gresi-gris'}`
              }
            >
              {lien.libelle}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
