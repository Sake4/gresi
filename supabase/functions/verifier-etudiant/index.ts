// =============================================================================
// verifier-etudiant — vérifie un matricule INPHB avant la création du compte
//
// POST { matricule, nom }
//   200 { valide: true, ecole, filiere, classe }
//   200 { valide: false, motif: 'matricule_inconnu' | 'nom_discordant' | 'matricule_deja_utilise' }
//
// Mode (secret VERIF_ETUDIANT_MODE) :
//   referentiel (défaut) : consulte la table etudiants_reference (import CSV)
//   api                  : interroge l'API de la scolarité puis met la fiche en cache
//                          dans etudiants_reference (la RPC inscrire_participant
//                          revérifie toujours à partir de cette table)
//
// La base revérifie tout au moment de l'inscription : cette fonction n'est
// qu'un confort pour pré-remplir le formulaire.
// TODO S6 : limitation du nombre d'appels par adresse IP (énumération de matricules).
// =============================================================================
import { clientAdmin } from '../_shared/clientAdmin.ts';
import { erreur, json, preflight } from '../_shared/reponses.ts';

interface FicheInphb {
  matricule: string;
  nom: string;
  prenom: string;
  ecole: string;
  filiere: string;
  classe: string;
}

/**
 * TODO (quand la DSI aura fourni l'accès) : adapter l'URL, l'authentification
 * et la correspondance des champs au format réel de l'API de la scolarité.
 */
async function interrogerApiInphb(matricule: string): Promise<FicheInphb | null> {
  const url = Deno.env.get('INPHB_API_URL');
  const cle = Deno.env.get('INPHB_API_CLE');
  if (!url || !cle) throw new Error('INPHB_API_URL ou INPHB_API_CLE manquant');

  const reponse = await fetch(`${url}/etudiants/${encodeURIComponent(matricule)}`, {
    headers: { Authorization: `Bearer ${cle}` },
  });
  if (reponse.status === 404) return null;
  if (!reponse.ok) throw new Error(`API INPHB : HTTP ${reponse.status}`);
  return (await reponse.json()) as FicheInphb;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return erreur('methode_non_autorisee', 405);

  let corps: { matricule?: unknown; nom?: unknown };
  try {
    corps = await req.json();
  } catch {
    return erreur('parametres_invalides');
  }
  const matricule = typeof corps.matricule === 'string' ? corps.matricule.trim().toUpperCase() : '';
  const nom = typeof corps.nom === 'string' ? corps.nom.trim() : '';
  if (matricule.length < 4 || nom.length < 1) return erreur('parametres_invalides');

  const admin = clientAdmin();

  try {
    if (Deno.env.get('VERIF_ETUDIANT_MODE') === 'api') {
      const fiche = await interrogerApiInphb(matricule);
      if (!fiche) return json({ valide: false, motif: 'matricule_inconnu' });
      const { error } = await admin.from('etudiants_reference').upsert({
        matricule,
        nom: fiche.nom.toUpperCase(),
        prenom: fiche.prenom,
        ecole: fiche.ecole,
        filiere: fiche.filiere,
        classe: fiche.classe,
        source: 'api',
        importe_le: new Date().toISOString(),
      });
      if (error) throw error;
    }

    const { data, error } = await admin.rpc('verifier_etudiant_reference', {
      p_matricule: matricule,
      p_nom: nom,
    });
    if (error) throw error;
    return json(data);
  } catch (e) {
    console.error('verifier-etudiant', e);
    return erreur('erreur_interne', 500);
  }
});
