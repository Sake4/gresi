// Données de démonstration (pas de base de données pour l'instant).
// À REMPLACER plus tard par des appels à Supabase, dans un fichier api.ts.

import { cleCreneau } from "./constantes";
import type { Activite, Creneau, NumeroJour } from "./types";

function creer(
  id: string,
  jour: NumeroJour,
  creneau: Creneau,
  intitule: string,
  lieu: string,
  description: string,
): Activite {
  return { id, jour, creneau, intitule, lieu, description };
}

// Deux activités se déroulent en même temps sur chaque créneau.
export const ACTIVITES_DEMO: Activite[] = [
  creer("a01", 1, "matin", "Visite d'une ligne de production automatisée", "Hall d'exposition A",
    "Découvrez en immersion une chaîne d'assemblage robotisée et ses systèmes de supervision (SCADA). Un guide présente chaque poste et répond à vos questions sur le métier d'ingénieur de production."),
  creer("a02", 1, "matin", "Atelier robotique industrielle et capteurs IoT", "Labo d'électronique",
    "Initiez-vous à la programmation d'automates programmables et à l'intégration de capteurs sans fil dans un petit système automatisé."),
  creer("a03", 1, "apres_midi", "Conférence : l'Industrie 4.0 en Afrique de l'Ouest", "Amphi A",
    "Des professionnels du secteur présentent les technologies qui transforment l'industrie (automatisation, données, maintenance prédictive) et les opportunités pour les jeunes ingénieurs."),
  creer("a04", 1, "apres_midi", "Démonstration d'impression 3D industrielle", "Atelier de mécanique",
    "Voyez comment une pièce passe de la conception numérique à l'objet imprimé, et découvrez les usages de la fabrication additive en entreprise."),
  creer("a05", 2, "matin", "Table ronde : énergie et industrie", "Amphi B",
    "Dirigeants et ingénieurs échangent sur la maîtrise de l'énergie dans les usines et sur les défis de la transition énergétique."),
  creer("a06", 2, "matin", "Initiation à la maintenance industrielle", "Atelier de maintenance",
    "Apprenez les gestes de base de la maintenance préventive et découvrez comment on diagnostique une panne sur un équipement."),
  creer("a07", 2, "apres_midi", "Job dating avec les entreprises partenaires", "Hall d'exposition A",
    "Rencontrez les recruteurs des entreprises partenaires, présentez votre parcours et repérez les stages et emplois qui vous intéressent. Pensez à apporter votre CV."),
  creer("a08", 2, "apres_midi", "Atelier : qualité et lean manufacturing", "Salle B12",
    "Une introduction pratique aux méthodes d'amélioration continue utilisées dans les usines pour réduire les pertes et améliorer la qualité."),
  creer("a09", 3, "matin", "Atelier de découverte du génie des procédés", "Laboratoire de procédés",
    "Manipulez des équipements de laboratoire pour comprendre comment les matières premières sont transformées en produits finis."),
  creer("a10", 3, "matin", "Atelier d'automatisme et d'automates programmables", "Labo d'automatisme",
    "Câblez et programmez un petit système automatisé en suivant les consignes d'un encadrant."),
  creer("a11", 3, "apres_midi", "Conférence : transition énergétique et industrie verte", "Amphi A",
    "Panorama des solutions qui permettent de produire en consommant moins d'énergie et en limitant l'impact environnemental."),
  creer("a12", 3, "apres_midi", "Atelier de conception assistée par ordinateur (CAO)", "Salle informatique 2",
    "Modélisez une pièce mécanique en 3D avec un logiciel de CAO et découvrez comment elle est préparée pour la fabrication."),
  creer("a13", 4, "matin", "Forum des métiers de l'industrie", "Hall d'exposition A",
    "Échangez avec des ingénieurs, techniciens et responsables de production sur leur quotidien et sur les parcours qui mènent à leurs métiers."),
  creer("a14", 4, "matin", "Atelier de sécurité industrielle", "Salle C204",
    "Apprenez à repérer les risques en atelier et à appliquer les bons réflexes de prévention."),
  creer("a15", 4, "apres_midi", "Présentation des projets des étudiants de l'ESI", "Hall d'exposition B",
    "Les étudiants exposent leurs réalisations et prototypes : venez les découvrir, poser vos questions et échanger avec leurs équipes."),
  creer("a16", 4, "apres_midi", "Table ronde : parcours d'ingénieurs et d'entrepreneurs", "Amphi B",
    "Des diplômés racontent leur parcours, leurs choix et les leçons qu'ils en tirent pour se lancer dans l'industrie."),
];

// Au démarrage, le participant de démo est déjà inscrit à une activité du J1 matin,
// pour montrer tout de suite l'état « Créneau déjà réservé » sur l'autre activité.
export const CHOIX_DEMO_INITIAUX: Partial<Record<string, string>> = {
  [cleCreneau(1, "matin")]: "a01",
};
