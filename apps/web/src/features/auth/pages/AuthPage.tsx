import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bouton } from "../../../components/ui/Bouton";
import { ChampTexte } from "../../../components/ui/ChampTexte";
import { Icone } from "../../../components/ui/Icone";
import { UTILISATEUR_DEMO } from "../../../lib/sessionDemo";

type Onglet = "connexion" | "inscription";
type Profil = "etudiant_inphb" | "externe";
type Erreurs = Partial<Record<string, string>>;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGUEUR_MIN_MOT_DE_PASSE = 8;
const ACCUEIL_PARTICIPANT = "/mon-espace/activites";

// Valeurs de la liste « statut_externe » de la base de données.
const STATUTS_EXTERNES = [
  { valeur: "etudiant_hors_inphb", libelle: "Étudiant hors INP-HB" },
  { valeur: "professionnel", libelle: "Professionnel" },
  { valeur: "visiteur", libelle: "Visiteur" },
  { valeur: "autre", libelle: "Autre" },
];

const CLASSE_CHAMP =
  "h-[44px] w-full rounded border bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-gresi-bleu";

// Lit un champ texte d'un formulaire.
function lire(donnees: FormData, nom: string): string {
  const valeur = donnees.get(nom);
  return typeof valeur === "string" ? valeur : "";
}

interface BoutonOngletProps {
  actif: boolean;
  onClick: () => void;
  children: string;
}

function BoutonOnglet({ actif, onClick, children }: BoutonOngletProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={actif}
      onClick={onClick}
      className={`min-h-[44px] flex-1 border-b-2 pb-3 text-center font-semibold transition-colors ${
        actif
          ? "border-gresi-bleu text-gresi-bleu"
          : "border-transparent text-gresi-encre-douce hover:text-gresi-encre"
      }`}
    >
      {children}
    </button>
  );
}

function classeProfil(actif: boolean): string {
  return `flex min-h-[44px] items-center justify-center gap-1.5 rounded border px-3 py-1.5 font-semibold transition-colors ${
    actif
      ? "border-gresi-gris-bleu bg-white text-gresi-bleu shadow-sm"
      : "border-transparent text-gresi-encre-douce hover:text-gresi-encre"
  }`;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // L'adresse /inscription ouvre directement l'onglet « S'inscrire ».
  const [onglet, setOnglet] = useState<Onglet>(pathname === "/inscription" ? "inscription" : "connexion");
  const [profil, setProfil] = useState<Profil>("etudiant_inphb");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [compteCree, setCompteCree] = useState(false);

  function changerOnglet(nouvelOnglet: Onglet) {
    setOnglet(nouvelOnglet);
    setErreurs({});
    setCompteCree(false);
  }

  function soumettreConnexion(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);

    const nouvellesErreurs: Erreurs = {};
    if (!REGEX_EMAIL.test(lire(donnees, "email").trim())) {
      nouvellesErreurs.email = "Saisissez une adresse e-mail valide.";
    }
    if (lire(donnees, "motDePasse") === "") {
      nouvellesErreurs.motDePasse = "Saisissez votre mot de passe.";
    }
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) return;

    // TODO Supabase : await supabase.auth.signInWithPassword({ email, password })
    navigate(ACCUEIL_PARTICIPANT);
  }

  function soumettreInscription(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);

    const nouvellesErreurs: Erreurs = {};
    if (lire(donnees, "nom").trim() === "") nouvellesErreurs.nom = "Saisissez votre nom.";
    if (lire(donnees, "prenom").trim() === "") nouvellesErreurs.prenom = "Saisissez votre prénom.";
    if (!REGEX_EMAIL.test(lire(donnees, "email").trim())) {
      nouvellesErreurs.email = "Saisissez une adresse e-mail valide.";
    }
    if (lire(donnees, "motDePasse").length < LONGUEUR_MIN_MOT_DE_PASSE) {
      nouvellesErreurs.motDePasse = `Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`;
    }
    if (profil === "etudiant_inphb" && lire(donnees, "matricule").trim() === "") {
      nouvellesErreurs.matricule = "Saisissez votre matricule étudiant.";
    }
    if (profil === "externe" && lire(donnees, "statutExterne") === "") {
      nouvellesErreurs.statutExterne = "Choisissez votre statut.";
    }
    if (lire(donnees, "consentement") !== "on") {
      nouvellesErreurs.consentement =
        "Vous devez accepter le traitement de vos données pour créer un compte.";
    }
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) return;

    // TODO Supabase : appeler la fonction inscrire_participant(...)
    setCompteCree(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <header className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-gresi-bleu text-3xl font-bold text-white">
          G
        </div>
        <h1 className="text-3xl font-bold tracking-tight">GRESI</h1>
        <p className="mt-1 text-gresi-encre-douce">
          Semaine de l'Industrie — inscriptions et repas
        </p>
      </header>

      <main className="w-full max-w-md rounded-lg border border-gresi-gris-bleu bg-white p-6 shadow-sm sm:p-8">
        <div
          role="tablist"
          aria-label="Connexion ou inscription"
          className="mb-6 flex border-b border-gresi-gris-bleu"
        >
          <BoutonOnglet actif={onglet === "connexion"} onClick={() => changerOnglet("connexion")}>
            Se connecter
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === "inscription"} onClick={() => changerOnglet("inscription")}>
            S'inscrire
          </BoutonOnglet>
        </div>

        {onglet === "connexion" && (
          <form role="tabpanel" noValidate onSubmit={soumettreConnexion} className="space-y-4">
            <ChampTexte
              id="connexion-email"
              name="email"
              type="email"
              label="Adresse e-mail"
              icone="mail"
              required
              autoComplete="email"
              placeholder="prenom.nom@inphb.ci"
              erreur={erreurs.email}
            />
            <ChampTexte
              id="connexion-mot-de-passe"
              name="motDePasse"
              type="password"
              label="Mot de passe"
              icone="lock"
              required
              autoComplete="current-password"
              erreur={erreurs.motDePasse}
            />
            <Bouton type="submit" variante="principal" pleineLargeur>
              Se connecter
              <Icone nom="arrow_forward" className="text-[20px]" />
            </Bouton>
          </form>
        )}

        {onglet === "inscription" && compteCree && (
          <div role="status" className="space-y-4 text-center">
            <Icone nom="mail" className="text-[48px] text-gresi-bleu" />
            <h2 className="text-xl font-bold">Vérifiez votre messagerie</h2>
            <p className="text-gresi-encre-douce">
              Un lien d'activation vient de vous être envoyé. Cliquez dessus pour activer votre compte
              et obtenir votre QR Code personnel.
            </p>
            <Bouton variante="principal" pleineLargeur onClick={() => changerOnglet("connexion")}>
              Retour à la connexion
            </Bouton>
          </div>
        )}

        {onglet === "inscription" && !compteCree && (
          <form role="tabpanel" noValidate onSubmit={soumettreInscription} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ChampTexte
                id="inscription-nom"
                name="nom"
                label="Nom"
                required
                autoComplete="family-name"
                placeholder="ex. Koné"
                erreur={erreurs.nom}
              />
              <ChampTexte
                id="inscription-prenom"
                name="prenom"
                label="Prénom"
                required
                autoComplete="given-name"
                placeholder="ex. Awa"
                erreur={erreurs.prenom}
              />
            </div>

            <div>
              <p id="libelle-profil" className="mb-1 text-sm font-semibold">
                Votre profil
                <span className="text-gresi-orange" aria-hidden="true">
                  {" *"}
                </span>
              </p>
              <div
                role="radiogroup"
                aria-labelledby="libelle-profil"
                className="grid grid-cols-2 gap-2 rounded border border-gresi-gris-bleu bg-gresi-gris p-1"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={profil === "etudiant_inphb"}
                  onClick={() => setProfil("etudiant_inphb")}
                  className={classeProfil(profil === "etudiant_inphb")}
                >
                  <Icone nom="school" className="text-[20px]" />
                  Étudiant INP-HB
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={profil === "externe"}
                  onClick={() => setProfil("externe")}
                  className={classeProfil(profil === "externe")}
                >
                  <Icone nom="business_center" className="text-[20px]" />
                  Externe
                </button>
              </div>
            </div>

            {profil === "etudiant_inphb" ? (
              <ChampTexte
                id="inscription-matricule"
                name="matricule"
                label="Matricule étudiant"
                required
                autoCapitalize="characters"
                placeholder="ex. 22INP00452"
                aide="Votre matricule sera vérifié auprès de la scolarité de l'INP-HB."
                erreur={erreurs.matricule}
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="inscription-statut" className="mb-1 block text-sm font-semibold">
                    Votre statut
                    <span className="text-gresi-orange" aria-hidden="true">
                      {" *"}
                    </span>
                  </label>
                  <select
                    id="inscription-statut"
                    name="statutExterne"
                    defaultValue=""
                    aria-invalid={erreurs.statutExterne ? true : undefined}
                    className={`${CLASSE_CHAMP} ${
                      erreurs.statutExterne ? "border-gresi-orange" : "border-gresi-gris-bleu"
                    }`}
                  >
                    <option value="">Choisissez…</option>
                    {STATUTS_EXTERNES.map((statut) => (
                      <option key={statut.valeur} value={statut.valeur}>
                        {statut.libelle}
                      </option>
                    ))}
                  </select>
                  {erreurs.statutExterne && (
                    <p className="mt-1 flex items-start gap-1 text-sm">
                      <Icone nom="error" className="text-[18px] text-gresi-orange" />
                      <span>{erreurs.statutExterne}</span>
                    </p>
                  )}
                </div>
                <ChampTexte
                  id="inscription-structure"
                  name="structure"
                  label="Structure (facultatif)"
                  placeholder="Entreprise, école, association…"
                />
                <ChampTexte
                  id="inscription-motif"
                  name="motif"
                  label="Motif de votre présence (facultatif)"
                />
              </div>
            )}

            <ChampTexte
              id="inscription-email"
              name="email"
              type="email"
              label={profil === "etudiant_inphb" ? "E-mail institutionnel" : "Adresse e-mail"}
              icone="mail"
              required
              autoComplete="email"
              placeholder="prenom.nom@inphb.ci"
              aide="Un lien d'activation sera envoyé à cette adresse."
              erreur={erreurs.email}
            />
            <ChampTexte
              id="inscription-mot-de-passe"
              name="motDePasse"
              type="password"
              label="Mot de passe"
              icone="lock"
              required
              autoComplete="new-password"
              aide={`Au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`}
              erreur={erreurs.motDePasse}
            />

            <div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="consentement"
                  aria-invalid={erreurs.consentement ? true : undefined}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-gresi-bleu"
                />
                <span>
                  J'accepte que mes données personnelles soient utilisées pour gérer les inscriptions et
                  les repas de la Semaine de l'Industrie.
                </span>
              </label>
              {erreurs.consentement && (
                <p className="mt-1 flex items-start gap-1 text-sm">
                  <Icone nom="error" className="text-[18px] text-gresi-orange" />
                  <span>{erreurs.consentement}</span>
                </p>
              )}
            </div>

            <Bouton type="submit" variante="principal" pleineLargeur>
              <Icone nom="how_to_reg" className="text-[20px]" />
              Créer mon compte
            </Bouton>
          </form>
        )}
      </main>

      {/* Visible uniquement avec « pnpm dev » : disparaît dans la version publiée. */}
      {import.meta.env.DEV && (
        <section className="mt-6 w-full max-w-md rounded-lg border border-dashed border-gresi-gris-bleu bg-white p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Icone nom="preview" className="text-[18px] text-gresi-bleu" />
            Accès démo (développement uniquement)
          </p>
          <Bouton variante="contour" pleineLargeur onClick={() => navigate(ACCUEIL_PARTICIPANT)}>
            Entrer en tant que {UTILISATEUR_DEMO.prenom} {UTILISATEUR_DEMO.nom}
          </Bouton>
        </section>
      )}

      <footer className="mt-8 max-w-md text-center text-sm text-gresi-encre-douce">
        Institut National Polytechnique Félix Houphouët-Boigny (INP-HB) — Yamoussoukro, Côte d'Ivoire.
      </footer>
    </div>
  );
}
