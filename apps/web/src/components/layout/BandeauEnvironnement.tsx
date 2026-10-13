import { env } from '@/lib/env';

/** Rappelle qu'on n'est pas en production (évite de tester sur les vraies données) */
export function BandeauEnvironnement() {
  if (env.environnement === 'prod') return null;
  return (
    <div className="bg-gresi-orange px-3 py-1 text-center text-xs font-semibold tracking-wide text-white uppercase">
      Environnement {env.environnement === 'dev' ? 'de développement' : 'de préproduction'} — données fictives
    </div>
  );
}
