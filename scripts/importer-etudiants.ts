/**
 * Importe le référentiel des étudiants fourni par la scolarité INPHB
 * dans la table etudiants_reference.
 *
 * Usage :
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… pnpm import:etudiants chemin/vers/fichier.csv [--dry-run]
 *
 * Format attendu (séparateur ; ou ,) — voir scripts/exemple-etudiants.csv :
 *   matricule;nom;prenom;ecole;filiere;classe
 *
 * ⚠ Le fichier contient des données personnelles réelles : ne JAMAIS le commiter
 *   (les .csv sont ignorés par Git), le supprimer après l'import.
 */
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';

const COLONNES = ['matricule', 'nom', 'prenom', 'ecole', 'filiere', 'classe'] as const;
type Ligne = Record<(typeof COLONNES)[number], string>;

const [chemin, option] = process.argv.slice(2);
const simulation = option === '--dry-run';

if (!chemin) {
  console.error('Usage : pnpm import:etudiants <fichier.csv> [--dry-run]');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!simulation && (!url || !cle)) {
  console.error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont obligatoires (sauf --dry-run).');
  process.exit(1);
}

const contenu = readFileSync(chemin, 'utf8');
const separateur = contenu.split('\n')[0]?.includes(';') ? ';' : ',';
const brutes: Record<string, string>[] = parse(contenu, {
  columns: (entetes: string[]) => entetes.map((e) => e.trim().toLowerCase()),
  delimiter: separateur,
  skip_empty_lines: true,
  trim: true,
  bom: true,
});

const erreurs: string[] = [];
const vus = new Set<string>();
const lignes: Ligne[] = [];

brutes.forEach((b, i) => {
  const manquantes = COLONNES.filter((c) => !b[c]);
  if (manquantes.length) {
    erreurs.push(`ligne ${i + 2} : colonne(s) vide(s) ${manquantes.join(', ')}`);
    return;
  }
  const matricule = b.matricule!.toUpperCase();
  if (vus.has(matricule)) {
    erreurs.push(`ligne ${i + 2} : matricule ${matricule} en double`);
    return;
  }
  vus.add(matricule);
  lignes.push({
    matricule,
    nom: b.nom!.toUpperCase(),
    prenom: b.prenom!,
    ecole: b.ecole!,
    filiere: b.filiere!,
    classe: b.classe!,
  });
});

console.log(`${lignes.length} étudiant(s) valide(s), ${erreurs.length} ligne(s) rejetée(s).`);
erreurs.slice(0, 20).forEach((e) => console.warn(`  - ${e}`));

if (simulation) {
  console.log('Simulation : aucune donnée envoyée.');
  process.exit(0);
}

const supabase = createClient(url!, cle!, { auth: { persistSession: false } });
const TAILLE_LOT = 500;

for (let i = 0; i < lignes.length; i += TAILLE_LOT) {
  const lot = lignes.slice(i, i + TAILLE_LOT).map((l) => ({ ...l, source: 'import_csv' }));
  const { error } = await supabase.from('etudiants_reference').upsert(lot, { onConflict: 'matricule' });
  if (error) {
    console.error(`Échec du lot ${i / TAILLE_LOT + 1} :`, error.message);
    process.exit(1);
  }
  console.log(`Lot ${i / TAILLE_LOT + 1} importé (${lot.length} lignes).`);
}

console.log('Import terminé.');
