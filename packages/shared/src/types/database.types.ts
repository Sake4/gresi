// =============================================================================
// FICHIER GÉNÉRÉ — NE PAS MODIFIER À LA MAIN
// Régénérer avec : pnpm db:types (base locale démarrée)
// =============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      activites: {
        Row: {
          id: string;
          intitule: string;
          description: string | null;
          lieu: string;
          jour: string;
          creneau: Database['public']['Enums']['creneau'];
          statut: Database['public']['Enums']['statut_activite'];
          cree_par: string | null;
          cree_le: string;
          modifie_le: string;
        };
        Insert: {
          id?: string;
          intitule: string;
          description?: string | null;
          lieu: string;
          jour: string;
          creneau: Database['public']['Enums']['creneau'];
          statut?: Database['public']['Enums']['statut_activite'];
          cree_par?: string | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Update: {
          id?: string;
          intitule?: string;
          description?: string | null;
          lieu?: string;
          jour?: string;
          creneau?: Database['public']['Enums']['creneau'];
          statut?: Database['public']['Enums']['statut_activite'];
          cree_par?: string | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activites_cree_par_fkey';
            columns: ['cree_par'];
            isOneToOne: false;
            referencedRelation: 'personnel';
            referencedColumns: ['id'];
          },
        ];
      };
      affectations: {
        Row: {
          distributeur_id: string;
          activite_id: string;
          cree_par: string | null;
          cree_le: string;
        };
        Insert: {
          distributeur_id: string;
          activite_id: string;
          cree_par?: string | null;
          cree_le?: string;
        };
        Update: {
          distributeur_id?: string;
          activite_id?: string;
          cree_par?: string | null;
          cree_le?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'affectations_activite_id_fkey';
            columns: ['activite_id'];
            isOneToOne: false;
            referencedRelation: 'activites';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'affectations_cree_par_fkey';
            columns: ['cree_par'];
            isOneToOne: false;
            referencedRelation: 'personnel';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'affectations_distributeur_id_fkey';
            columns: ['distributeur_id'];
            isOneToOne: false;
            referencedRelation: 'personnel';
            referencedColumns: ['id'];
          },
        ];
      };
      annonces: {
        Row: {
          id: string;
          titre: string;
          contenu: string;
          est_publiee: boolean;
          publiee_le: string | null;
          auteur_id: string | null;
          cree_le: string;
          modifie_le: string;
        };
        Insert: {
          id?: string;
          titre: string;
          contenu: string;
          est_publiee?: boolean;
          publiee_le?: string | null;
          auteur_id?: string | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Update: {
          id?: string;
          titre?: string;
          contenu?: string;
          est_publiee?: boolean;
          publiee_le?: string | null;
          auteur_id?: string | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'annonces_auteur_id_fkey';
            columns: ['auteur_id'];
            isOneToOne: false;
            referencedRelation: 'personnel';
            referencedColumns: ['id'];
          },
        ];
      };
      etudiants_reference: {
        Row: {
          matricule: string;
          nom: string;
          prenom: string;
          ecole: string;
          filiere: string;
          classe: string;
          source: string;
          importe_le: string;
        };
        Insert: {
          matricule: string;
          nom: string;
          prenom: string;
          ecole: string;
          filiere: string;
          classe: string;
          source?: string;
          importe_le?: string;
        };
        Update: {
          matricule?: string;
          nom?: string;
          prenom?: string;
          ecole?: string;
          filiere?: string;
          classe?: string;
          source?: string;
          importe_le?: string;
        };
        Relationships: [];
      };
      inscriptions: {
        Row: {
          id: string;
          participant_id: string;
          activite_id: string;
          jour: string;
          creneau: Database['public']['Enums']['creneau'];
          valide_le: string | null;
          valide_par: string | null;
          methode_validation: Database['public']['Enums']['methode_validation'] | null;
          cree_le: string;
          modifie_le: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          activite_id: string;
          jour: string;
          creneau: Database['public']['Enums']['creneau'];
          valide_le?: string | null;
          valide_par?: string | null;
          methode_validation?: Database['public']['Enums']['methode_validation'] | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          activite_id?: string;
          jour?: string;
          creneau?: Database['public']['Enums']['creneau'];
          valide_le?: string | null;
          valide_par?: string | null;
          methode_validation?: Database['public']['Enums']['methode_validation'] | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inscriptions_activite_id_fkey';
            columns: ['activite_id'];
            isOneToOne: false;
            referencedRelation: 'activites';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inscriptions_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inscriptions_valide_par_fkey';
            columns: ['valide_par'];
            isOneToOne: false;
            referencedRelation: 'personnel';
            referencedColumns: ['id'];
          },
        ];
      };
      journal_audit: {
        Row: {
          id: number;
          auteur_id: string | null;
          action: string;
          cible_table: string;
          cible_id: string | null;
          details: Json;
          cree_le: string;
        };
        Insert: {
          id?: never;
          auteur_id?: string | null;
          action: string;
          cible_table: string;
          cible_id?: string | null;
          details?: Json;
          cree_le?: string;
        };
        Update: {
          id?: never;
          auteur_id?: string | null;
          action?: string;
          cible_table?: string;
          cible_id?: string | null;
          details?: Json;
          cree_le?: string;
        };
        Relationships: [];
      };
      parametres_evenement: {
        Row: {
          id: number;
          edition: string;
          date_debut: string | null;
          date_fin: string | null;
          fuseau: string;
          matin_debut: string;
          matin_fin: string;
          apres_midi_debut: string;
          apres_midi_fin: string;
          scan_ouverture_min: number;
          scan_fermeture_min: number;
          domaine_email_etudiant: string | null;
          cree_le: string;
          modifie_le: string;
        };
        Insert: {
          id?: number;
          edition: string;
          date_debut?: string | null;
          date_fin?: string | null;
          fuseau?: string;
          matin_debut?: string;
          matin_fin?: string;
          apres_midi_debut?: string;
          apres_midi_fin?: string;
          scan_ouverture_min?: number;
          scan_fermeture_min?: number;
          domaine_email_etudiant?: string | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Update: {
          id?: number;
          edition?: string;
          date_debut?: string | null;
          date_fin?: string | null;
          fuseau?: string;
          matin_debut?: string;
          matin_fin?: string;
          apres_midi_debut?: string;
          apres_midi_fin?: string;
          scan_ouverture_min?: number;
          scan_fermeture_min?: number;
          domaine_email_etudiant?: string | null;
          cree_le?: string;
          modifie_le?: string;
        };
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          type_participant: Database['public']['Enums']['type_participant'];
          nom: string;
          prenom: string;
          email: string;
          telephone: string | null;
          qr_token: string;
          qr_regenere_le: string | null;
          est_actif: boolean;
          consentement_le: string;
          cree_le: string;
          modifie_le: string;
        };
        Insert: {
          id: string;
          type_participant: Database['public']['Enums']['type_participant'];
          nom: string;
          prenom: string;
          email: string;
          telephone?: string | null;
          qr_token?: string;
          qr_regenere_le?: string | null;
          est_actif?: boolean;
          consentement_le: string;
          cree_le?: string;
          modifie_le?: string;
        };
        Update: {
          id?: string;
          type_participant?: Database['public']['Enums']['type_participant'];
          nom?: string;
          prenom?: string;
          email?: string;
          telephone?: string | null;
          qr_token?: string;
          qr_regenere_le?: string | null;
          est_actif?: boolean;
          consentement_le?: string;
          cree_le?: string;
          modifie_le?: string;
        };
        Relationships: [];
      };
      participants_etudiants: {
        Row: {
          participant_id: string;
          matricule: string;
          ecole: string;
          filiere: string;
          classe: string;
          source_verification: Database['public']['Enums']['source_verification'];
          verifie_le: string;
        };
        Insert: {
          participant_id: string;
          matricule: string;
          ecole: string;
          filiere: string;
          classe: string;
          source_verification: Database['public']['Enums']['source_verification'];
          verifie_le?: string;
        };
        Update: {
          participant_id?: string;
          matricule?: string;
          ecole?: string;
          filiere?: string;
          classe?: string;
          source_verification?: Database['public']['Enums']['source_verification'];
          verifie_le?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'participants_etudiants_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: true;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
      };
      participants_externes: {
        Row: {
          participant_id: string;
          statut: Database['public']['Enums']['statut_externe'];
          structure: string | null;
          motif_presence: string | null;
        };
        Insert: {
          participant_id: string;
          statut: Database['public']['Enums']['statut_externe'];
          structure?: string | null;
          motif_presence?: string | null;
        };
        Update: {
          participant_id?: string;
          statut?: Database['public']['Enums']['statut_externe'];
          structure?: string | null;
          motif_presence?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'participants_externes_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: true;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
      };
      personnel: {
        Row: {
          id: string;
          role: Database['public']['Enums']['role_personnel'];
          nom: string;
          prenom: string;
          est_actif: boolean;
          cree_le: string;
          modifie_le: string;
        };
        Insert: {
          id: string;
          role: Database['public']['Enums']['role_personnel'];
          nom: string;
          prenom: string;
          est_actif?: boolean;
          cree_le?: string;
          modifie_le?: string;
        };
        Update: {
          id?: string;
          role?: Database['public']['Enums']['role_personnel'];
          nom?: string;
          prenom?: string;
          est_actif?: boolean;
          cree_le?: string;
          modifie_le?: string;
        };
        Relationships: [];
      };
      scans: {
        Row: {
          id: number;
          scan_id_client: string;
          distributeur_id: string;
          activite_id: string;
          participant_id: string | null;
          inscription_id: string | null;
          resultat: Database['public']['Enums']['resultat_scan'];
          methode: Database['public']['Enums']['methode_validation'];
          scanne_le: string;
        };
        Insert: {
          id?: never;
          scan_id_client: string;
          distributeur_id: string;
          activite_id: string;
          participant_id?: string | null;
          inscription_id?: string | null;
          resultat: Database['public']['Enums']['resultat_scan'];
          methode: Database['public']['Enums']['methode_validation'];
          scanne_le?: string;
        };
        Update: {
          id?: never;
          scan_id_client?: string;
          distributeur_id?: string;
          activite_id?: string;
          participant_id?: string | null;
          inscription_id?: string | null;
          resultat?: Database['public']['Enums']['resultat_scan'];
          methode?: Database['public']['Enums']['methode_validation'];
          scanne_le?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scans_activite_id_fkey';
            columns: ['activite_id'];
            isOneToOne: false;
            referencedRelation: 'activites';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scans_distributeur_id_fkey';
            columns: ['distributeur_id'];
            isOneToOne: false;
            referencedRelation: 'personnel';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scans_inscription_id_fkey';
            columns: ['inscription_id'];
            isOneToOne: false;
            referencedRelation: 'inscriptions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scans_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      choisir_activite: {
        Args: {
          p_activite_id: string;
        };
        Returns: {
          id: string;
          participant_id: string;
          activite_id: string;
          jour: string;
          creneau: Database['public']['Enums']['creneau'];
          valide_le: string | null;
          valide_par: string | null;
          methode_validation: Database['public']['Enums']['methode_validation'] | null;
          cree_le: string;
          modifie_le: string;
        };
      };
      debut_creneau: {
        Args: {
          p_jour: string;
          p_creneau: Database['public']['Enums']['creneau'];
        };
        Returns: string;
      };
      est_contexte_serveur: {
        Args: never;
        Returns: boolean;
      };
      est_participant_actif: {
        Args: never;
        Returns: boolean;
      };
      fin_creneau: {
        Args: {
          p_jour: string;
          p_creneau: Database['public']['Enums']['creneau'];
        };
        Returns: string;
      };
      inscrire_participant: {
        Args: {
          p_type: Database['public']['Enums']['type_participant'];
          p_nom: string;
          p_prenom: string;
          p_consentement: boolean;
          p_telephone?: string;
          p_matricule?: string;
          p_statut?: Database['public']['Enums']['statut_externe'];
          p_structure?: string;
          p_motif?: string;
        };
        Returns: Json;
      };
      is_admin: {
        Args: never;
        Returns: boolean;
      };
      is_admin_superieur: {
        Args: never;
        Returns: boolean;
      };
      is_distributeur: {
        Args: never;
        Returns: boolean;
      };
      liste_participants_admin: {
        Args: {
          p_recherche?: string;
          p_page?: number;
          p_taille?: number;
        };
        Returns: {
          participant_id: string;
          type_participant: Database['public']['Enums']['type_participant'];
          nom: string;
          prenom: string;
          identifiant: string;
          ecole: string;
          filiere: string;
          est_actif: boolean;
          creneaux_inscrits: number;
          creneaux_valides: number;
          total: number;
        }[];
      };
      masquer_matricule: {
        Args: {
          p_matricule: string;
        };
        Returns: string;
      };
      modifier_statut_participant: {
        Args: {
          p_participant_id: string;
          p_est_actif: boolean;
        };
        Returns: undefined;
      };
      normaliser_texte: {
        Args: {
          p_texte: string;
        };
        Returns: string;
      };
      rechercher_inscrits: {
        Args: {
          p_activite_id: string;
          p_recherche: string;
        };
        Returns: {
          participant_id: string;
          nom: string;
          prenom: string;
          identifiant: string;
          valide_le: string;
        }[];
      };
      regenerer_qr: {
        Args: {
          p_participant_id: string;
        };
        Returns: string;
      };
      retirer_choix: {
        Args: {
          p_jour: string;
          p_creneau: Database['public']['Enums']['creneau'];
        };
        Returns: undefined;
      };
      role_personnel_courant: {
        Args: never;
        Returns: Database['public']['Enums']['role_personnel'];
      };
      stats_activites: {
        Args: {
          p_jour?: string;
        };
        Returns: {
          activite_id: string;
          intitule: string;
          lieu: string;
          jour: string;
          creneau: Database['public']['Enums']['creneau'];
          statut: Database['public']['Enums']['statut_activite'];
          inscrits: number;
          valides: number;
          taux_presence: number;
        }[];
      };
      valider_manuellement: {
        Args: {
          p_participant_id: string;
          p_activite_id: string;
          p_scan_id_client: string;
        };
        Returns: Json;
      };
      valider_scan: {
        Args: {
          p_qr_token: string;
          p_activite_id: string;
          p_scan_id_client: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      creneau: 'matin' | 'apres_midi';
      methode_validation: 'qr' | 'manuelle';
      resultat_scan:
        'valide' | 'deja_utilise' | 'non_inscrit' | 'non_affecte' | 'hors_creneau' | 'qr_invalide';
      role_personnel: 'distributeur' | 'admin' | 'admin_superieur';
      source_verification: 'api' | 'referentiel' | 'manuelle';
      statut_activite: 'brouillon' | 'publiee' | 'annulee';
      statut_externe: 'etudiant_hors_inphb' | 'professionnel' | 'visiteur' | 'autre';
      type_participant: 'etudiant_inphb' | 'externe';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
export type CompositeTypes<T extends keyof PublicSchema['CompositeTypes']> =
  PublicSchema['CompositeTypes'][T];

export const Constants = {
  public: {
    Enums: {
      creneau: ['matin', 'apres_midi'],
      methode_validation: ['qr', 'manuelle'],
      resultat_scan: ['valide', 'deja_utilise', 'non_inscrit', 'non_affecte', 'hors_creneau', 'qr_invalide'],
      role_personnel: ['distributeur', 'admin', 'admin_superieur'],
      source_verification: ['api', 'referentiel', 'manuelle'],
      statut_activite: ['brouillon', 'publiee', 'annulee'],
      statut_externe: ['etudiant_hors_inphb', 'professionnel', 'visiteur', 'autre'],
      type_participant: ['etudiant_inphb', 'externe'],
    },
  },
} as const;
