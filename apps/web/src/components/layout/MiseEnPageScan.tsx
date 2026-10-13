import { Outlet } from 'react-router';
import { BandeauEnvironnement } from './BandeauEnvironnement';

/** Plein écran, fond sombre : lisible en salle et économe en batterie */
export function MiseEnPageScan() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-white">
      <BandeauEnvironnement />
      <Outlet />
    </div>
  );
}
