import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { UTILISATEUR_DEMO, obtenirInitiales } from "../../lib/sessionDemo";
import { Icone } from "../ui/Icone";

interface ElementMenu {
  libelle: string;
  icone: string;
  /** Pas de lien = page pas encore développée (affichée « Bientôt »). */
  vers?: string;
}

const ELEMENTS_MENU: ElementMenu[] = [
  { libelle: "Activités", icone: "event", vers: "/mon-espace/activites" },
  { libelle: "Mes inscriptions", icone: "how_to_reg" },
  { libelle: "Mon QR Code", icone: "qr_code_2", vers: "/mon-espace/qr" },
  { libelle: "Notifications", icone: "notifications" },
];

interface MenuNavigationProps {
  /** Appelée quand on clique sur un lien (sert à fermer le menu sur mobile). */
  onNavigate?: () => void;
}

function MenuNavigation({ onNavigate }: MenuNavigationProps) {
  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-1.5">
      {ELEMENTS_MENU.map((element) =>
        element.vers ? (
          <NavLink
            key={element.libelle}
            to={element.vers}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 font-semibold transition-colors ${
                isActive
                  ? "bg-gresi-bleu text-white"
                  : "text-gresi-encre-douce hover:bg-gresi-gris hover:text-gresi-encre"
              }`
            }
          >
            <Icone nom={element.icone} className="text-[22px]" />
            {element.libelle}
          </NavLink>
        ) : (
          <span
            key={element.libelle}
            aria-disabled="true"
            className="flex min-h-[44px] cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-gresi-encre-douce/60"
          >
            <Icone nom={element.icone} className="text-[22px]" />
            {element.libelle}
            <span className="ml-auto rounded bg-gresi-gris px-2 py-0.5 text-xs font-semibold">
              Bientôt
            </span>
          </span>
        ),
      )}
    </nav>
  );
}

// Menu + barre du haut communs à toutes les pages de l'espace participant.
// Les pages elles-mêmes s'affichent à la place de <Outlet />.
export function MiseEnPageParticipant() {
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  // La touche Échap ferme le menu sur mobile.
  useEffect(() => {
    if (!menuOuvert) return;
    function surTouche(evenement: KeyboardEvent) {
      if (evenement.key === "Escape") setMenuOuvert(false);
    }
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [menuOuvert]);

  const nomComplet = `${UTILISATEUR_DEMO.prenom} ${UTILISATEUR_DEMO.nom}`;

  function seDeconnecter() {
    // TODO Supabase : await supabase.auth.signOut()
    navigate("/connexion");
  }

  return (
    <div className="min-h-screen">
      {/* Barre du haut */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gresi-gris-bleu/30 bg-gresi-bleu px-4 text-white shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOuvert(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOuvert}
            className="rounded-lg p-2 hover:bg-white/10 md:hidden"
          >
            <Icone nom="menu" className="text-[26px]" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg font-bold text-gresi-bleu">
            G
          </div>
          <p className="text-lg font-bold leading-tight">
            GRESI
            <span className="hidden font-normal sm:inline"> — Semaine de l'Industrie</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="font-semibold leading-tight">{nomComplet}</p>
            <p className="text-sm leading-tight text-white/80">Participant · INP-HB</p>
          </div>
          <div
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-gresi-bleu"
          >
            {obtenirInitiales(UTILISATEUR_DEMO)}
          </div>
          <button
            type="button"
            onClick={seDeconnecter}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="rounded-lg p-2 hover:bg-white/10"
          >
            <Icone nom="logout" className="text-[22px]" />
          </button>
        </div>
      </header>

      {/* Menu fixe (ordinateur) */}
      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-64 flex-col border-r border-gresi-gris-bleu bg-white p-4 md:flex">
        <MenuNavigation />
      </aside>

      {/* Menu tiroir (mobile) */}
      {menuOuvert && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuOuvert(false)}
            className="absolute inset-0 bg-gresi-encre/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col gap-6 bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gresi-bleu font-bold text-white"
                >
                  {obtenirInitiales(UTILISATEUR_DEMO)}
                </div>
                <div>
                  <p className="font-semibold leading-tight">{nomComplet}</p>
                  <p className="text-sm leading-tight text-gresi-encre-douce">Participant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOuvert(false)}
                aria-label="Fermer le menu"
                className="rounded-lg p-2 hover:bg-gresi-gris"
              >
                <Icone nom="close" className="text-[24px]" />
              </button>
            </div>
            <MenuNavigation onNavigate={() => setMenuOuvert(false)} />
          </div>
        </div>
      )}

      {/* Contenu de la page */}
      <main className="pt-16 md:pl-64">
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
